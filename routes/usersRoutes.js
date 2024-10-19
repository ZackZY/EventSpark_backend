// routes/userRoutes.js

const express = require('express');
const UsersController = require('../controllers/usersController');
const router = express.Router();

// Use UsersController for handling routes
router.use('/users', UsersController);

module.exports = router;
