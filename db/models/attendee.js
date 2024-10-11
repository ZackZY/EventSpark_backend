// models/attendee.js

module.exports = (sequelize, DataTypes) => {
    const Attendees = sequelize.define('Attendees', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Use UUIDV4 for default UUID generation
        primaryKey: true,
      },
      attendeeEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      tableName: 'Attendees',  // Optional: Set table name explicitly if needed
      timestamps: true,     // Adds createdAt and updatedAt fields automatically
    });
  
    // Define any associations if required
    Attendees.associate = (models) => {
      // Example association: If Events belongs to an Organizer
      Attendees.belongsToMany(models.Events, { 
        through: models.EventAttendees,
        foreignKey: 'attendeeId',
        otherKey: 'eventId', 
    });
    };
  
    return Attendees;
  };
  