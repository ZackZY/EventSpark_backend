const { Users } = require('../db/models')

class UsersRepository {
    async CreateAsync(data){
        return await Users.create(data);
    }

    async GetByIdAsync(userId){
        return await Users.findByPk(userId);
    }

    async UpdateAsync(userId, userData){
        const [rowsUpdated, [updatedEvent]] = await Users.update(userData, {
            where: {id:userId},
            returning : true
        });

        return rowsUpdated ? updatedEvent:null;
    }

    async DeleteAsync(userId){
        const rowsDeleted = await Users.destroy({ where: { id:userId }});
        return rowsDeleted > 0;
    }

    async ListAllAsync() {
        return await Users.findAll({});
    }
}

module.exports = new UsersRepository();