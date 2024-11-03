// app.js

const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/usersRoutes');
const eventRoutes = require('./routes/eventsRoutes');
const eventAttendeeRoutes = require('./routes/eventAttendeesRoutes');
const logger = require('./utils/logger');
const cors = require('cors');
const os = require('os');
const app = express();

app.use(cors()); // temporarily allow all origins by default, need to add CORS to allow only frontend


// Middleware
app.use(bodyParser.json()); // Parse JSON request bodies

// Use the routes
app.use(userRoutes);
app.use(eventRoutes);
app.use(eventAttendeeRoutes);

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
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    // Get all network interfaces
    const networkInterfaces = os.networkInterfaces();
    
    console.log('\n=================================');
    console.log('🚀 Server is running on:');
    console.log(`Local: http://localhost:${PORT}`);
    
    // List all available network interfaces
    Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((interface) => {
            // Skip internal and non-IPv4 addresses
            if (!interface.internal && interface.family === 'IPv4') {
                console.log(`Network (${interfaceName}): http://${interface.address}:${PORT}`);
            }
        });
    });
    console.log('=================================\n');

    // Log to winston logger as well
    logger.info('Server started', {
        port: PORT,
        host: HOST,
        interfaces: networkInterfaces
    });
});

// Export the app
module.exports = app;
