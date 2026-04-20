// Purpose: Handle admin authentication actions such as login (and registration if needed).
const authService = require('../services/authService');

async function registerOwner(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }
    const user = await authService.registerOwner({ name, email, password });
    return res.status(201).json({ success: true, user });
  } catch (err) {
    if (err.message === 'Email already registered') {
      return res.status(409).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }
    const result = await authService.loginUser({ email, password });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    if (err.message === 'Invalid email or password') {
      return res.status(401).json({ success: false, message: err.message });
    }
    if (err.message === 'Account is not approved') {
      return res.status(403).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { registerOwner, loginUser };
