const { Users } = require("../db/models");

class UsersRepository {
  async CreateAsync(data) {
    return await Users.create(data);
  }

  async GetByIdAsync(userId) {
    return await Users.findByPk(userId);
  }

  async UpdateAsync(userId, userData) {
    console.log(userId, userData);

    try {
      // Perform the update without returning the updated record
      const [rowsUpdated] = await Users.update(userData, {
        where: { id: userId },
      });

      console.log("Rows updated:", rowsUpdated);

      // Check if any rows were updated
      if (rowsUpdated === 0) {
        return null; // User not found
      }

      // Fetch the updated user record
      const updatedUser = await Users.findOne({
        where: { id: userId },
      });

      return updatedUser; // Return the updated user
    } catch (error) {
      console.error("Error updating user:", error);
      throw error; // Rethrow or handle the error as needed
    }
  }

  async DeleteAsync(userId) {
    const rowsDeleted = await Users.destroy({ where: { id: userId } });
    return rowsDeleted > 0;
  }

  async ListAllAsync() {
    return await Users.findAll({});
  }
}

module.exports = new UsersRepository();
