const EventsRepository = require('../repositories/eventsRepository');

class EventsService {
    async CreateEventAsync(data) {
        return await EventsRepository.CreateAsync(data);
    }

    async GetEventByIdAsync(eventId){
        return await EventsRepository.GetByIdAsync(eventId);
    }

    async UpdateEventAsync(eventId, eventData){
        return await EventsRepository.UpdateAsync(eventId, eventData);
    }

    async DeleteEventAsync(eventId){
        return await EventsRepository.DeleteAsync(eventId);
    }

    async ListAllEventsAsync(){
        return await EventsRepository.ListAllAsync();
    }
}

module.exports = new EventsService();