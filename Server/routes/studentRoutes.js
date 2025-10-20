const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { getStudentStats, getPerformanceData } = require('../controllers/studentController');


router.get('/stats', authenticateToken, getStudentStats);
router.get('/performance', authenticateToken, getPerformanceData);

module.exports = router;
