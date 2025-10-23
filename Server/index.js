require('dotenv').config();
const express = require('express');
const cors = require('cors');
const quizRoutes = require('./routes/quizRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', quizRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT)
