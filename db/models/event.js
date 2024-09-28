// models/Events.js

module.exports = (sequelize, DataTypes) => {
    const Events = sequelize.define('Events', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Use UUIDV4 for default UUID generation
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
    }, {
      tableName: 'Events',  // Optional: Set table name explicitly if needed
      timestamps: true,     // Adds createdAt and updatedAt fields automatically
    });
  
    // Define any associations if required
    //Events.associate = (models) => {
      // Example association: If Events belongs to an Organizer
      // Events.belongsTo(models.Organizer, { foreignKey: 'organiserId' });
    //};
  
    return Events;
  };
  