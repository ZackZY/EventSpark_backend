const { sequelize } = require('../db/models');
const EventsRepository = require('../repositories/eventsRepository');
const UsersRepository = require('../repositories/usersRepository');
const EventAttendeesRepository = require('../repositories/eventAttendeesRepository');
const eventObserver = require('./observers/eventObserver');
const logger = require('../utils/logger');

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

    async createEventWithAttendees(eventData, attendeesData){
        const transaction = await sequelize.transaction();
        try{
            // create new event 1st
            const newEvent = await EventsRepository.CreateAsync(eventData,transaction);
            
            // find or create new user based on email 
            const userInstances = await Promise.all(
                attendeesData.map(async (attendeeData) => {
                    const [user, created] = await UsersRepository.findOrCreateByEmail(attendeeData, transaction);
                    if(created){
                        logger.info(`New user added: ${user.email}`);
                    }
                    else{
                        logger.info(`Existing user: ${user.email}`);
                    }
                    return user;
                })
            );

            // add created or updated users to event
            await EventAttendeesRepository.addAttendeesToEvent(newEvent, userInstances, transaction);

            await transaction.commit();
            // if events successfully created, send invite to all attendees using EventObserver
            eventObserver.notify(newEvent);

            const createdEventWithAttendee = await EventsRepository.GetEventWithAttendeesAsync(newEvent.id);
            // get all emails from Attendees
            // get all event Hash
            // const textBody = `https://ecs-frontend-lb-735742951.ap-southeast-1.elb.amazonaws.com/registerform.html?eventhash=${}`;
            return createdEventWithAttendee;
        }
        catch(error){
            await transaction.rollback();
            throw error;
        }
    }

    async AddAttendeesToEvent(eventId, attendeesData) {
        const transaction = await sequelize.transaction();
        try{
            const event = await EventsRepository.GetByIdAsync(eventId);
            const userInstances = await Promise.all(
                attendeesData.map(async (attendeeData) => {
                    const [user, created] = await UsersRepository.findOrCreateByEmail(attendeeData, transaction);
                    if(created){
                        logger.info(`New user added: ${user.email}`);
                    }
                    else{
                        logger.info(`Existing user: ${user.email}`);
                    }
                    return user;
                })
            );

            // add created or updated users to event
            await EventAttendeesRepository.addAttendeesToEvent(event, userInstances, transaction);
            await transaction.commit();

            // if events successfully created, send invite to all attendees using EventObserver
            eventObserver.notify(event);
            return userInstances.length();

        }catch(error){
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new EventsService();