const { Events, Users } = require('../db/models')

class EventsRepository {
    async CreateAsync(data, transaction){
        console.log(`repository data: ${JSON.stringify(data)}`);
        return await Events.create(data,{ transaction });
    }

    async GetByIdAsync(eventId){
        return await Events.findByPk(eventId);
    }

    async UpdateAsync(eventId, eventData){
        const [rowsUpdated, [updatedEvent]] = await Events.update(eventData, {
            where: {id:eventId},
            returning : true
        });

        return rowsUpdated ? updatedEvent:null;
    }

    async DeleteAsync(eventId){
        const rowsDeleted = await Events.destroy({ where: { id:eventId }});
        return rowsDeleted > 0;
    }

    async ListAllAsync() {
        return await Events.findAll({ where: {eventType:'Public'}});
    }

    async GetEventWithAttendeesAsync(eventId){
        return await Events.findByPk(eventId, {
            include: Users,
        })
    }
}

module.exports = new EventsRepository();