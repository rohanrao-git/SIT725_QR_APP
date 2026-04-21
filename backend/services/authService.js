const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function stripPassword(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.password;
  return o;
}

async function registerOwner({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already registered');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'owner',
    status: 'pending',
  });
  return stripPassword(user);
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  if (user.role === 'owner' && user.status !== 'approved') {
    throw new Error('Account is not approved');
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error('Invalid email or password');
  }
  const token = generateToken(user._id);
  return { token, user: stripPassword(user) };
}

module.exports = { registerOwner, loginUser };
