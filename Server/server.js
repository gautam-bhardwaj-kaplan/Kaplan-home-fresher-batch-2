const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./db');

const quizRoutes = require('./routes/quizRoutes');   
const authController = require('./controllers/authController');  
const authenticateToken = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const studentRoutes = require('./routes/studentRoutes');

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);

app.use('/api/quizzes', authenticateToken, quizRoutes);
app.use('/api/student', authenticateToken, studentRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const startServer = async () => {
  try {
    await pool.query('SELECT 1'); 
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('DB connection failed', err);
    process.exit(1);
  }
};

startServer();
