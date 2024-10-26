const { EventAttendees } = require('../db/models')

class EventAttendeesRepository {
    async addAttendeesToEvent(event, attendees, transaction){
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
        
          await EventAttendees.bulkCreate(attendeeEntries, { transaction });
    }

    async addOrganiserToEvent(event, organiser, transaction){
        const attendee = {
              attendeeId: organiser.id,
              eventId: event.id,
              dateTimeRegistered: null,
              status: 'invited',
              eventAttendeeHash: `${event.id}-${organiser.id}`,
              typeOfAttendee: 'organiser',
              dateTimeInvited: new Date(),
              dateTimeAttended: null,
            };
        
        
          await EventAttendees.create(attendee, { transaction });
    }
}

module.exports = new EventAttendeesRepository();