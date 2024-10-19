// app.js

const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/usersRoutes');
const eventRoutes = require('./routes/eventsRoutes');
const logger = require('./utils/logger');
const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON request bodies

// Use the routes
app.use(userRoutes);
app.use(eventRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Event Management API');
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Catch unhandled synchronous errors
process.on('uncaughtException', (err) => {
    logger.error('Unhandled Exception:', err);
    // Optionally, you can choose to gracefully shut down the application or continue running
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally, you can choose to gracefully shut down the application or continue running
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app
module.exports = app;
