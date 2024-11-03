const { Users } = require('../db/models');
const logger = require('../utils/logger');
const { Events } = require('../db/models')

class UsersRepository {
  async CreateAsync(data) {
    return await Users.create(data);
  }

  async GetByIdAsync(userId) {
    return await Users.findByPk(userId);
  }

  async UpdateAsync(userId, userData, transaction) {
    console.log(userId, userData);

    try {
      // Perform the update without returning the updated record
      const [rowsUpdated] = await Users.update(userData, {
        where: { id: userId },
      }, {transaction});

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

  // Find an attendee by email
  async findByEmail(email) {
    return await Users.findOne({ where: { email } });
   }

   // Find or create an attendee by email
    async findOrCreateByEmail(attendeeData, transaction) {
        logger.info(`Find or create new users`);
        return await Users.findOrCreate({
            where: { email: attendeeData.email },
            defaults: {
                name: attendeeData.name || NULL, // provide a name if available
                contactnumber: attendeeData.contactNumber || NULL,
                password: attendeeData.password || NULL,
            },
            transaction
        });
    }

    async GetEventByUserIdAsync(userId){
        return await Users.findByPk(userId, { include : Events });
    }

    async findOrCreateAndUpdateAsync(userData, transaction){
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        return await this.UpdateAsync(existingUser.id, userData, transaction);
      } else {
        return await this.findOrCreateByEmail(userData);
      }
    }
}

module.exports = new UsersRepository();
