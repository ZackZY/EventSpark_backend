'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add the password column to the Users table
    await queryInterface.addColumn('Users', 'password', {
      type: Sequelize.STRING(255), // VARCHAR(255)
      allowNull: true, // Allow null values (or false if you want it to be required)
    });

    // Remove the firstName column from the Users table
    await queryInterface.removeColumn('Users', 'firstName');

    // Rename the lastName column to name
    await queryInterface.renameColumn('Users', 'lastName', 'name');
  },

  async down (queryInterface, Sequelize) {
    // Revert changes: remove password, rename name back to lastName, and add firstName back
    await queryInterface.removeColumn('Users', 'password');

    await queryInterface.renameColumn('Users', 'name', 'lastName');

    // If you want to add back firstName as well, you can specify its type
    await queryInterface.addColumn('Users', 'firstName', {
      type: Sequelize.STRING(255), // VARCHAR(255)
      allowNull: true, // Set to false if it should be required
    });
  }
};
