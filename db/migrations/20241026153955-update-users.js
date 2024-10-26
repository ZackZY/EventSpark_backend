'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Rename columns
    await queryInterface.renameColumn('Users', 'attendeeEmail', 'email');
    await queryInterface.renameColumn('Users', 'attendeeName', 'firstName');

    // Add new columns
    await queryInterface.addColumn('Users', 'lastName', {
      type: Sequelize.STRING(255), // VARCHAR(255)
      allowNull: true, // Allow null values
    });

    await queryInterface.addColumn('Users', 'contactNumber', {
      type: Sequelize.STRING(15), // VARCHAR(15)
      allowNull: true, // Allow null values
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert changes: Remove new columns and rename back
    await queryInterface.removeColumn('Users', 'contactNumber');
    await queryInterface.removeColumn('Users', 'lastName');
    
    await queryInterface.renameColumn('Users', 'firstName', 'attendeeName');
    await queryInterface.renameColumn('Users', 'email', 'attendeeEmail');
  }
};
