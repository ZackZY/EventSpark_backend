const { EventAttendees } = require('../db/models');
const logger = require('../utils/logger');

class EventAttendeesRepository {
    async addAttendeesToEvent(event, attendees, transaction){
      logger.info(`add attendees to event ${event.id}`);
      const attendeeEntries = attendees.map((attendee) => {
          const eventAttendeeHash = `${event.id}-${attendee.id}`;
      
          return {
            attendeeId: attendee.id,
            eventId: event.id,
            dateTimeRegistered: null,
            status: 'invited',
            eventAttendeeHash,
            typeOfAttendee: 'attendee',
            dateTimeInvited: new Date(),
            dateTimeAttended: null,
          };
        });
      
      logger.info(`add organiser to event ${event.id}`);
      // Add the organiser entry
      attendeeEntries.push({
          attendeeId: event.organiserId,
          eventId: event.id,
          dateTimeRegistered: null,
          status: 'invited',
          eventAttendeeHash: `${event.id}-${event.organiserId}`,
          typeOfAttendee: 'organiser',
          dateTimeInvited: new Date(),
          dateTimeAttended: null,
      });
      await EventAttendees.bulkCreate(attendeeEntries, { transaction });
    };

    async getAttendeesByEventId(eventId) {
        return await EventAttendees.findAll({ where: { eventId } });
    }
}

module.exports = new EventAttendeesRepository();