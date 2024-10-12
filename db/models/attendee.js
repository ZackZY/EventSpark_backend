// models/attendee.js

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('Users', {
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
      tableName: 'Users',  // Optional: Set table name explicitly if needed
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
  