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
          model: 'Attendees',
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
        defaultValue: 'invited',
      },
      eventAttendeeHash: {
        type: DataTypes.STRING,
        allowNull: false,
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
  