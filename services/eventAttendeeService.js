const { sequelize } = require('../db/models');
const logger = require('../utils/logger');
const EventObserver = require('./observers/eventObserver');
const EventAttendeesRepository = require('../repositories/eventAttendeesRepository');
const EventsService = require('./eventsService');
const UsersService = require('./usersService');

class EventAttendeesService {
    async RegisterAttendeeForEventAsync(eventId, userId){
        const transaction = await sequelize.transaction();
        try{
            const result = EventAttendeesRepository.RegisterAttendeeForEventAsync(eventId, userId, transaction);
            if(result){
                logger.info(`Register successful for ${eventId}-${userId}`);
                const event = EventsService.GetEventByIdAsync(eventId);
                const user = UsersService.GetUserByIdAsync(userId);
                EventObserver.notifyConfirmation(event, user);
            }
            else{
                logger.info(`Register unsuccessful for ${eventId}-${userId}`)
            }

        }
        catch(error){
            throw error;
        }
    }
}

module.exports = new EventAttendeesService();