const express = require('express');
const router = express.Router();
const {
  getAllQuizzes,
  getQuizById,
  submitQuiz,
  getResults
} = require('../controllers/quizController');

router.get('/quizzes', getAllQuizzes);
router.get('/quizzes/:id', getQuizById); 
router.post('/quizzes/submit', submitQuiz); 
router.get('/results/:submissionId', getResults);


module.exports = router;
const authenticateToken = require('../middleware/authMiddleware');
const { getQuizList, getQuizById } = require('../controllers/quizController');


router.get('/', authenticateToken, getQuizList);
router.get('/:id', authenticateToken, getQuizById);

module.exports = router;
