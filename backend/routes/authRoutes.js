// Purpose: Define authentication API endpoints and map them to auth controller handlers.
const express = require('express');
const { registerOwner, loginUser } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerOwner);
router.post('/login', loginUser);

module.exports = router;
