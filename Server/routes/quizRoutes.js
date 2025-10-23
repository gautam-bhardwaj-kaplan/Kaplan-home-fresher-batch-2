const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { getQuizList, getQuizById } = require('../controllers/quizController');


router.get('/', authenticateToken, getQuizList);
router.get('/:id', authenticateToken, getQuizById);

module.exports = router;
