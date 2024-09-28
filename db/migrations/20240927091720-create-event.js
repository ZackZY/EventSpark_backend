'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, { DataTypes }) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('Events',{
      id: {
        type: DataTypes.UUID, // Use DataTypes.UUID, not DataTypes.UUID.V4
        defaultValue: DataTypes.UUIDV4, // Use UUIDV4 for default value generation
        primaryKey: true,
      },
      organiserId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      eventName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventDescription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      eventTimeStart: {
        type: DataTypes.DATE, 
        allowNull: false,
      },
      eventTimeEnd: {
        type: DataTypes.DATE, 
        allowNull: false,
      },
      eventLocation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('Events');
  }
};
