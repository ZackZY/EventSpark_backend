// config/logger.js
const fs = require('fs');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const { format, transports } = winston;

const logDirectory = path.join(__dirname, '../logs');

const combinedLogDirectory = path.join(__dirname, '../logs/combined');
const errorLogDirectory = path.join(__dirname, '../logs/errors');
// Create the directory if it doesn't exist
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
    fs.mkdirSync(combinedLogDirectory, { recursive: true });
    fs.mkdirSync(errorLogDirectory, { recursive: true });
}

// Create a Winston logger instance with a configuration
const logger = winston.createLogger({
  level: 'info', // Minimum logging level (info and above)
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamps to the log messages
    format.errors({ stack: true }), // Print error stack trace
    format.splat(), // Support string interpolation
    format.json() // Format the logs as JSON
  ),
  defaultMeta: { service: 'event-management-service' }, // Add default meta data to logs
  transports: [

    // Daily rotating file for all logs (combined logs)
    new DailyRotateFile({
        filename: `${logDirectory}/combined/combined-%DATE%.log`, // Combined log files pattern
        datePattern: 'YYYY-MM-DD', // Daily rotation pattern
        maxSize: '20m', // Max size of each log file before creating a new one
        maxFiles: '14d', // Keep logs for 14 days
        zippedArchive: true, // Compress the logs to reduce storage
        }),

    // Daily rotating file for error logs
    new DailyRotateFile({
        level: 'error',
        filename: `${logDirectory}/errors/errors-%DATE%.log`, // Error log files pattern
        datePattern: 'YYYY-MM-DD', // Daily rotation pattern
        maxSize: '20m', // Max size of each log file before creating a new one
        maxFiles: '14d', // Keep logs for 14 days
        zippedArchive: true, // Compress the logs to reduce storage
      }),
  ]
});

// If we're in development mode, log to the console with a human-readable format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(), // Colorize log output
        format.simple() // Use a simple output format for console
      )
    })
  );
}
else {
    logger.add(
        new transports.Console(), // Log to console
    );
}

module.exports = logger;
