const { EventAttendees, Users } = require('../db/models');
const logger = require('../utils/logger');

class EventAttendeesRepository {
    async addAttendeesToEvent(event, attendees, transaction){
      logger.info(`add attendees to event ${event.id}`);
        // Check if attendees have already been added to the event
      const existingAttendees = await EventAttendees.findAll({
        where: {
          eventId: event.id,
          attendeeId: attendees.map(attendee => attendee.id),
          typeOfAttendee: 'attendee'
        }
      });

      const existingOrganiser = await EventAttendees.findOne({
        where: {
          eventId: event.id,
          attendeeId: event.organiserId,
          typeOfAttendee: 'organiser'
        }
      });

      const existingAttendeeIds = existingAttendees.map(attendee => attendee.attendeeId);
      const newAttendees = attendees.filter(attendee => !existingAttendeeIds.includes(attendee.id));
    
      const attendeeEntries = newAttendees.map((attendee) => {
          const eventAttendeeHash = `${event.id}-${attendee.id}`;
      
          return {
            attendeeId: attendee.id,
            eventId: event.id,
            dateTimeRegistered: null,
            eventAttendeeHash,
            typeOfAttendee: 'attendee',
            dateTimeInvited: new Date(),
            dateTimeAttended: null,
          };
      });
      
      logger.info(`add organiser to event ${event.id}`);

      // Add the organiser entry
      if(!existingOrganiser){
        attendeeEntries.push({
            attendeeId: event.organiserId,
            eventId: event.id,
            dateTimeRegistered: null,
            eventAttendeeHash: `${event.id}-${event.organiserId}`,
            typeOfAttendee: 'organiser',
            dateTimeInvited: new Date(),
            dateTimeAttended: null,
        });
      }
      await EventAttendees.bulkCreate(attendeeEntries, { transaction });
    };

    async getAttendeesByEventId(eventId) {
        return await EventAttendees.findAll({ where: { eventId } });
    }

    async getEventAttendeeHashAsync(eventId, userId){
      const attendee = await EventAttendees.findOne({
        where:{
          eventId: eventId,
          attendeeId:userId
        }
      });
      return attendee ? attendee.eventAttendeeHash: null;
    } 

    async registerEvent(eventId, attendeeId, transaction){
      const [rowsUpdated] = await EventAttendees.update({
        dateTimeRegistered: new Date(),
        status: 'registered',
      },{
        where:{
          attendeeId,
          eventId
        }
      }, { transaction }); 

      return rowsUpdated > 0;
    }

    async registerNewAttendeeToEvent(eventId, attendeeId, transaction){
      const eventAttendeeHash = `${eventId}-${attendeeId}`;
      const attendeeData = {
        attendeeId: attendeeId,
        eventId: eventId,
        dateTimeRegistered: new Date(),
        status: 'registered',
        eventAttendeeHash,
        typeOfAttendee: 'attendee',
        dateTimeInvited: new Date(),
        dateTimeAttended: null
      };

      logger.info(`Register new attendee ${attendeeId} for event ${eventId}`);
      return await EventAttendees.create(attendeeData, { transaction });
    }
}

module.exports = new EventAttendeesRepository();