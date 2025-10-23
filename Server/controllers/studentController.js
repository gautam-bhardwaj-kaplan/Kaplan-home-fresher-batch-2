const pool = require('../db');

const getStudentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [attended] = await pool.query(
      'SELECT COUNT(DISTINCT quiz_id) AS totalQuizzesAttended FROM submissions WHERE user_id = ?',
      [userId]
    );

    const [active] = await pool.query(
      'SELECT COUNT(*) AS activeQuizzes FROM quizzes WHERE is_active = 1'
    );

    const [inactive] = await pool.query(
      'SELECT COUNT(*) AS inactiveQuizzes FROM quizzes WHERE is_active = 0'
    );

    res.json({
      totalQuizzesAttended: attended[0]?.totalQuizzesAttended || 0,
      activeQuizzes: active[0]?.activeQuizzes || 0,
      inactiveQuizzes: inactive[0]?.inactiveQuizzes || 0,
    });
  } catch (err) {
    console.error('Error fetching student stats:', err);
    res.status(500).json({ message: 'Error fetching student stats' });
  }
};

const getPerformanceData = async (req, res) => {
  try {
    const userId = req.user.id;
    const [performance] = await pool.query(
      `
      SELECT 
          q.title AS quizTitle,
          s.score,
          q.total_marks AS totalMarks,
          s.submitted_at
      FROM 
          submissions s
      JOIN 
          quizzes q ON s.quiz_id = q.id
      WHERE 
          s.user_id = ?
      ORDER BY 
          s.submitted_at DESC
      `,
      [userId]
    );

    res.json(performance);
  } catch (err) {
    console.error('Error fetching performance data:', err);
    res.status(500).json({ message: 'Error fetching performance data' });
  }
};

module.exports = { getStudentStats, getPerformanceData };
