const UsersRepository = require('../repositories/usersRepository');

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
}

module.exports = new UsersService();