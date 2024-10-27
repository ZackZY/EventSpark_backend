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

    // Find an attendee by email
   async findByEmail(email) {
    return await Users.findOne({ where: { email } });
   }

   // Find or create an attendee by email
    async findOrCreateByEmail(attendeeData, transaction) {
        console.log(`Find or create new users`);
        return await Users.findOrCreate({
            where: { email: attendeeData.email },
            defaults: {
                name: attendeeData.name || '' // provide a name if available
            },
            transaction
        });
    }
}

module.exports = new UsersRepository();