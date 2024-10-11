'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('Attendees',{
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, // Use UUIDV4 for default UUID generation
        primaryKey: true,
      },
      attendeeEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW, // Sets default value to the current timestamp
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Sets default value to the current timestamp
      }
    });

    await queryInterface.createTable('EventAttendees',{
      eventId: {
        type: Sequelize.UUID,
        references:{
          model: 'Events',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        allowNull: false,
      },
      attendeeId: {
        type: Sequelize.UUID,
        references:{
          model: 'Attendees',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        allowNull: false,
      },
      dateTimeRegistered: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dateTimeInvited: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      dateTimeAttended: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'invited',
      },
      eventAttendeeHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('EventAttendees', {
      fields: ['eventId', 'attendeeId'], // Composite primary key (eventId + attendeeId)
      type: 'primary key',
      name: 'event_attendee_pk', // Constraint name
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove EventAttendees and Attendees tables in the down migration
    await queryInterface.dropTable('EventAttendees');
    await queryInterface.dropTable('Attendees');
  }
};
