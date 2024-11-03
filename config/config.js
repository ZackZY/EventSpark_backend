require('dotenv').config();

module.exports = {
  development: {
    username: 'root',
    password: 'rootpassword',
    database: 'EventSpark',
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306
  },
  staging: {
    username: process.env.DB_USER || 'test-User',
    password: process.env.DB_PASSWORD || 'test-password',
    database: process.env.DB_NAME || 'database_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql'
  }
};