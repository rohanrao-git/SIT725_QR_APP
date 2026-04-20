require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seed() {
  await connectDB();

  const existing = await User.findOne({ role: 'super_admin' });
  if (existing) {
    console.log('Super admin already exists');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  const password = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Super Admin',
    email: 'admin@system.com',
    password,
    role: 'super_admin',
    status: 'approved',
  });

  console.log('Super admin created successfully');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
