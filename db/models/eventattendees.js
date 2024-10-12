// models/EventAttendees.js

module.exports = (sequelize, DataTypes) => {
    const EventAttendees = sequelize.define('EventAttendees', {
      eventId: {
        type: DataTypes.UUID,
        references:{
          model: 'Events',
          key: 'id'
        },
        primaryKey: true,
      },
      attendeeId: {
        type: DataTypes.UUID,
        references:{
          model: 'User',
          key: 'id'
        },
        primaryKey: true,
      },
      dateTimeRegistered: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      dateTimeInvited: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      dateTimeAttended: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'invited', // invited or registered or attended
      },
      eventAttendeeHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      typeOfAttendee: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'attendee', // attendee or organiser
      },
    }, {
      tableName: 'EventAttendees',  // Optional: Set table name explicitly if needed
      timestamps: false,  
    });
  
    // Define any associations if required
    //Events.associate = (models) => {
      // Example association: If Events belongs to an Organizer
      // Events.belongsTo(models.Organizer, { foreignKey: 'organiserId' });
    //};
  
    return EventAttendees;
  };
  