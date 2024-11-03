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
            logger.info(`Registering attendee ${userId} for event ${eventId}`);
            const eventHash = await EventAttendeesRepository.getEventAttendeeHashAsync(eventId, userId);
            let result;
            if(eventHash){
                result = await EventAttendeesRepository.registerEvent(eventId, userId, transaction);
            }
            else{
                // new event attendee
                result = await EventAttendeesRepository.registerNewAttendeeToEvent(eventId, userId, transaction);
            }
            transaction.commit();
            if(result){
                logger.info(`Register successful for ${eventId}-${userId}`);
                const event = await EventsService.GetEventByIdAsync(eventId);
                const user = await UsersService.GetUserByIdAsync(userId);
                EventObserver.notifyConfirmation(event, user);
            }
            else{
                logger.info(`Register unsuccessful for ${eventId}-${userId}`)
            }

        }
        catch(error){
            transaction.rollback();
            logger.error(`error registering for ${eventId}-${userId}`);
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