const { sequelize } = require('../db/models');
const EventsRepository = require('../repositories/eventsRepository');
const UsersRepository = require('../repositories/usersRepository');
const EventAttendeesRepository = require('../repositories/eventAttendeesRepository');

class EventsService {
    async CreateEventAsync(data) {
        return await EventsRepository.CreateAsync(data);
    }

    async GetEventByIdAsync(eventId){
        return await EventsRepository.GetEventWithAttendeesAsync(eventId);
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
                        console.log(`New user added: ${user.attendeeEmail}`);
                    }
                    else{
                        console.log(`Existing user: ${user.attendeeEmail}`);
                    }
                    return user;
                })
            );

            // add created or updated users to event
            await EventAttendeesRepository.addAttendeesToEvent(newEvent, userInstances, transaction);

            // get Organiser Detail
            const organiserDetails = await UsersRepository.GetByIdAsync(eventData.organiserId);
            
            // add organiser to event
            //await EventAttendeesRepository.addOrganiserToEvent(newEvent, organiserDetails, transaction);

            await transaction.commit();
            const createdEventWithAttendee = await EventsRepository.GetEventWithAttendees(newEvent.id);
            
            const organiser = createdEventWithAttendee.users.find(user => user.EventAttendees.typeOfAttendee === "organiser");

            return createdEventWithAttendee;
        }
        catch(error){
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new EventsService();