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
            const result = await EventAttendeesRepository.registerEvent(eventId, userId, transaction);
            transaction.commit();
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
            transaction.rollback();
            logger.error(`error registering for ${eventId}-${userId}: ${error}`);
            throw error;
        }
    }

    async GetAttendeesByEventId(eventId){
        const results = await EventAttendeesRepository.getAttendeesByEventId(eventId);

        const userPromises = results.map(async (attendee) => {
            const { id,name,email,contactNumber } = await UsersService.GetUserByIdAsync(attendee.attendeeId);
            return {
                ...attendee.dataValues,
                user: {
                    id,
                    name,
                    email,
                    contactNumber
                }
            };
        });
        const users = await Promise.all(userPromises);

        return users;
    }
}

module.exports = new EventAttendeesService();