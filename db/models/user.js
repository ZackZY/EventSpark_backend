// models/user.js

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Use UUIDV4 for default UUID generation
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isAdmin: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contactNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Users", // Optional: Set table name explicitly if needed
      timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
  );

  // Define any associations if required
  Users.associate = (models) => {
    // Example association: If Events belongs to an Organizer
    Users.belongsToMany(models.Events, {
      through: models.EventAttendees,
      foreignKey: "attendeeId",
      otherKey: "eventId",
    });
  };

  return Users;
};
