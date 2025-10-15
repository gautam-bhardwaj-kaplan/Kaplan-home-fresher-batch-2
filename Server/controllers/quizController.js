const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email already registered' }); // Conflict
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

    const token = jwt.sign({ id: results[0].id }, 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};


const getQuizList = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM quizzes');
    res.json(results);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [id]);
    if (results.length === 0)
      return res.status(404).json({ message: 'Quiz not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getQuizList, getQuizById };
