const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, results[0].password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const getQuizList = async (req, res) => {
  try {
    const userId = req.user.id;

    const [results] = await pool.query(
      `
      SELECT 
        q.id, q.title, q.description, q.duration, q.total_marks,
        -- is_passed: 1 if the user has a "passed" record, 0 otherwise
        IF(uqs.is_active = 0, 1, 0) AS is_passed,
        -- is_attempted: 1 if any submission exists for this user, 0 otherwise
        IF(COUNT(s.id) > 0, 1, 0) AS is_attempted
      FROM quizzes q
      -- Join to see if it's in the user's "passed" list
      LEFT JOIN user_quiz_status uqs 
        ON q.id = uqs.quiz_id AND uqs.user_id = ?
      -- Join to see if ANY submission exists for this user
      LEFT JOIN submissions s 
        ON q.id = s.quiz_id AND s.user_id = ?
      -- Group by quiz to count submissions
      GROUP BY q.id, q.title, q.description, q.duration, q.total_marks, uqs.is_active
      `,
      [userId, userId] 
    );

    res.json(results);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const [quizResults] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [id]);

    if (quizResults.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const quiz = quizResults[0];

    const [questionResults] = await pool.query('SELECT * FROM questions WHERE quiz_id = ?', [id]);

    const questions = questionResults.map(q => {
      try {
        return {
          ...q,
          options: (typeof q.options === 'string') ? JSON.parse(q.options) : (q.options || [])
        };
      } catch (e) {
        console.error(`Failed to parse options for question ${q.id}:`, q.options);
        return { ...q, options: [] };
      }
    });

    res.json({ quiz: quiz, questions: questions });
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, answers } = req.body;

    const [questions] = await pool.query('SELECT * FROM questions WHERE quiz_id = ?', [quizId]);
    const questionsMap = new Map(questions.map(q => [q.id, q]));

    const [result] = await pool.query('INSERT INTO submissions (quiz_id, user_id) VALUES (?, ?)', [quizId, userId]);
    const submissionId = result.insertId;

    let score = 0;
    const answerPromises = [];

    for (const [questionIdStr, userAnswer] of Object.entries(answers)) {
      const questionId = parseInt(questionIdStr, 10);
      const question = questionsMap.get(questionId);
      let isCorrect = false;

      if (question) {
        const questionMarks = parseInt(question.marks) || 1;
        if (userAnswer === question.correct_answer) {
          score += questionMarks;
          isCorrect = true;
        }
        answerPromises.push(
          pool.query(
            'INSERT INTO answers (submission_id, question_id, user_answer, is_correct, explanation) VALUES (?, ?, ?, ?, ?)',
            [submissionId, questionId, userAnswer, isCorrect, question.explanation || null]
          )
        );
      }
    }

    await Promise.all(answerPromises);
    const totalMarks = questions.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0);
    const passStatus = (totalMarks > 0 && (score / totalMarks) >= 0.5) ? 'pass' : 'fail';
    
    await pool.query(
      'UPDATE submissions SET score = ?, pass_status = ? WHERE id = ?',
      [score, passStatus, submissionId]
    );

    if (passStatus === 'pass') {
      await pool.query(
        `INSERT INTO user_quiz_status (user_id, quiz_id, is_active) VALUES (?, ?, 0)
         ON DUPLICATE KEY UPDATE is_active = 0`,
        [userId, quizId]
      );
    }

    res.json({ submissionId, score, totalQuestions: questions.length, passStatus });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const [submissions] = await pool.query(
      'SELECT s.*, q.title AS quizTitle, q.id AS quizId FROM submissions s JOIN quizzes q ON s.quiz_id = q.id WHERE s.id = ?',
      [id]
    );

    if (submissions.length === 0)
      return res.status(404).json({ message: 'Submission not found' });

    const submission = submissions[0];

    const [answersForReview] = await pool.query(
      'SELECT * FROM answers WHERE submission_id = ?',
      [id]
    );
    
    const [questionCount] = await pool.query('SELECT COUNT(*) AS count FROM questions WHERE quiz_id = ?', [submission.quizId]);

    const formattedAnswers = answersForReview.map(ans => ({
      question_id: ans.question_id,
      user_answer: ans.user_answer,
      is_correct: ans.is_correct,
      explanation: ans.explanation
    }));

    res.json({
      submissionId: submission.id,
      quizId: submission.quizId,
      quizTitle: submission.quizTitle,
      score: submission.score,
      totalQuestions: questionCount[0].count,
      passStatus: submission.pass_status,
      answers: formattedAnswers
    });

  } catch (err) {
    console.error('Error fetching result:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getQuizList,
  getQuizById,
  submitQuiz,
  getResultById
};
