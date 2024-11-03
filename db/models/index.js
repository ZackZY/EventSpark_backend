'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'staging';
const config = require('../../config/config.js');

console.log('Current environment:', env);
let activeConfig;
switch (env) {
  case 'production':
    activeConfig = config.production;
    break;
  case 'staging':
    activeConfig = config[env];
    break;
  case 'development':
  default:
    activeConfig = config.development;
    break;
}
console.log('Loaded database config:', {
    host: activeConfig.host,
    port: activeConfig.port,
    database: activeConfig.database,
    username: activeConfig.username,
    dialect: activeConfig.dialect
});

const db = {};

let sequelize;
if (activeConfig.use_env_variable) {
    sequelize = new Sequelize(process.env[activeConfig.use_env_variable], activeConfig);
} else {
    sequelize = new Sequelize(
        activeConfig.database,
        activeConfig.username,
        activeConfig.password,
        {
            host: activeConfig.host,
            port: activeConfig.port,
            dialect: activeConfig.dialect,
            logging: console.log
        }
    );
}

sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;