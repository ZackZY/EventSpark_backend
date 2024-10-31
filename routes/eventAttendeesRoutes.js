// routes/eventAttendeesRoutes.js

const express = require('express');
const EventAttendeesController = require('../controllers/eventAttendeesController');
const router = express.Router();

// Use EventsController for handling routes
router.use('/eventattendees', EventAttendeesController);

module.exports = router;
