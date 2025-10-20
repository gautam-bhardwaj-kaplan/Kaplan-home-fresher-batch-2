const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { getStudentStats, getPerformanceData } = require('../controllers/studentController');

// already existing stats route
router.get('/stats', authenticateToken, getStudentStats);

// new route for performance data
router.get('/performance', authenticateToken, getPerformanceData);

module.exports = router;
