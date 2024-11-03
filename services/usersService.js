const UsersRepository = require('../repositories/usersRepository');
const logger = require('../utils/logger');
const { sequelize } = require('../db/models');

class UsersService {
    async CreateUserAsync(data) {
        return await UsersRepository.CreateAsync(data);
    }

    async GetUserByIdAsync(userId){
        return await UsersRepository.GetByIdAsync(userId);
    }

    async UpdateUserAsync(userId, userData){
        return await UsersRepository.UpdateAsync(userId, userData);
    }

    async DeleteUserAsync(userId){
        return await UsersRepository.DeleteAsync(userId);
    }

    async ListAllUsersAsync(){
        return await UsersRepository.ListAllAsync();
    }

    async FindOrCreateAndUpdateUserAsync(attendeeData){
        const transaction = await sequelize.transaction();
        let result;
        try{
            await UsersRepository.findOrCreateAndUpdateAsync(attendeeData, transaction);
            transaction.commit();
        }catch(error){
            transaction.rollback();
            logger.error(`Error creating or updating user: ${error}`);
            throw error;
        }
        return await UsersRepository.findByEmail(attendeeData.email);
    }
}

module.exports = new UsersService();