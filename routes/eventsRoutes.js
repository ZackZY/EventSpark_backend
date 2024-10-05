// routes/eventRoutes.js

const express = require('express');
const EventsController = require('../controllers/eventsController');
const router = express.Router();

// Use EventsController for handling routes
router.use('/events', EventsController);

module.exports = router;
