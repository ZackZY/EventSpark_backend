const fs = require('fs');

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'EventSpark',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  },
  test: {
    username: process.env.CI_DB_USERNAME,
    password: process.env.CI_DB_PASSWORD,
    database: process.env.CI_DB_NAME,
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
  },
  staging: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'EventSpark',
    host: process.env.DB_HOST || 'eventspark.c9cs4gsykquk.ap-southeast-1.rds.amazonaws.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  },
};