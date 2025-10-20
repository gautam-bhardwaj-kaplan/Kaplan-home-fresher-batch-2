const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).clearCookie('token').json({ 
      success: false,
      message: 'Access Denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).clearCookie('token').json({ 
      success: false,
      message: 'Invalid or expired session. Please log in again.' 
    });
  }
};

module.exports = authenticateToken;
