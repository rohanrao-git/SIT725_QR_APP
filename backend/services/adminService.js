const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const generateQR = require('../utils/generateQR');

async function getPendingOwners() {
  return User.find({ role: 'owner', status: 'pending' });
}

async function approveOwner(ownerId) {
  const user = await User.findById(ownerId);
  if (!user) {
    throw new Error('Owner not found');
  }
  if (user.role !== 'owner') {
    throw new Error('User is not an owner');
  }

  user.status = 'approved';

  const restaurant = await Restaurant.create({
    name: user.name,
    address: 'Address pending update',
    ownerId: user._id,
  });

  user.restaurantId = restaurant._id;
  await user.save();

  return user;
}

async function rejectOwner(ownerId) {
  const user = await User.findById(ownerId);
  if (!user) {
    throw new Error('Owner not found');
  }

  user.status = 'rejected';
  await user.save();
  return user;
}

async function disableOwner(ownerId) {
  const user = await User.findById(ownerId);
  if (!user) {
    throw new Error('Owner not found');
  }

  user.status = 'disabled';
  await user.save();
  return user;
}

async function getAllRestaurants() {
  return Restaurant.find().populate('ownerId', 'name email');
}

async function setTables(restaurantId, totalTables) {
  await Table.deleteMany({ restaurantId });

  const tableDocs = [];
  for (let tableNumber = 1; tableNumber <= totalTables; tableNumber += 1) {
    const qrCodeUrl = await generateQR(restaurantId, tableNumber);
    tableDocs.push({
      restaurantId,
      tableNumber,
      qrCodeUrl,
    });
  }

  const createdTables = tableDocs.length ? await Table.insertMany(tableDocs) : [];

  await Restaurant.findByIdAndUpdate(restaurantId, { totalTables });

  return createdTables;
}

async function getTablesByRestaurant(restaurantId) {
  return Table.find({ restaurantId });
}

module.exports = {
  getPendingOwners,
  approveOwner,
  rejectOwner,
  disableOwner,
  getAllRestaurants,
  setTables,
  getTablesByRestaurant,
};

