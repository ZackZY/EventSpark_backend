const { Events } = require('../db/models')

class EventsRepository {
    async CreateAsync(data){
        return await Events.create(data);
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
}

module.exports = new EventsRepository();