const express = require('express');
const cors = require('cors');
const pool = require('./db');

const quizRoutes = require('./routes/quizRoutes');   
const authController = require('./controllers/quizController');  

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json());

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);


app.use('/api/quizzes', quizRoutes);

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
