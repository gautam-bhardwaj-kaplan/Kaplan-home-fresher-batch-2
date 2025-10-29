const pool = require('../db');
const getStudentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [attendedResult] = await pool.query(
      'SELECT COUNT(DISTINCT quiz_id) AS totalQuizzesAttended FROM submissions WHERE user_id = ?',
      [userId]
    );

    const [totalResult] = await pool.query(
      'SELECT COUNT(*) AS totalQuizzes FROM quizzes'
    );
    const [inactiveResult] = await pool.query(
      'SELECT COUNT(*) AS inactiveQuizzes FROM user_quiz_status WHERE user_id = ? AND is_active = 0',
      [userId]
    );

    const totalQuizzes = totalResult[0].totalQuizzes || 0;
    const totalQuizzesAttended = attendedResult[0].totalQuizzesAttended || 0;
    const inactiveQuizzes = inactiveResult[0].inactiveQuizzes || 0;
    const activeQuizzes = totalQuizzes - inactiveQuizzes;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({
      totalQuizzesAttended,
      activeQuizzes,
      inactiveQuizzes
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
