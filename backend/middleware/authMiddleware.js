
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id role email name');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    req.user = {
      id: String(user._id),
      role: user.role,
      email: user.email,
      name: user.name,
    };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
}

module.exports = { protect };
