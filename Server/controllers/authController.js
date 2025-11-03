const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'This entry already exists.' });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user[0].password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user[0].id },  process.env.JWT_SECRET, { expiresIn: '1h' });
     
   
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 3600000 
    });
     
    res.json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
     
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

module.exports = { register, login, logout };