const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const { getQuizList, getQuizById, submitQuiz, getResultById, getStudentStats } = require('../controllers/quizController');


router.get('/', authenticateToken, getQuizList);
router.get('/:id', authenticateToken, getQuizById);
router.post('/submit', authenticateToken, submitQuiz);
router.get('/results/:id', authenticateToken, getResultById);
module.exports = router;
