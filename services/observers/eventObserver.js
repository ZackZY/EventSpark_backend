const eventAttendeesRepository = require("../../repositories/eventAttendeesRepository");
const emailService = require("../emailService");

// EventObserver.js
class EventObserver {
    constructor() {
    }
  
    async notify(event) {
      const attendees = await eventAttendeesRepository.getAttendeesByEventId(event.id);
      if(attendees.length === 0) {
          return;
      }
      for(const attendee of attendees) {
        const uniqueId = `${attendee.eventAttendeeHash}`;
        const attendeeLink = `https://ecs-frontend-lb-735742951.ap-southeast-1.elb.amazonaws.com/registerform.html?eventhash=${uniqueId}`;
        const emailBody = `
        You're invited to our event! Here’s your unique link to join:
        ${attendeeLink}
        
        We look forward to seeing you there!
        `;
        
        const htmlEmailBody = `</p><p>You're invited to our event! Here’s your unique link to join:</p><a href="${attendeeLink}">Join Event</a><p>We look forward to seeing you there!</p>`
        const textBody = emailBody;
        const htmlBody = htmlEmailBody;
        await emailService.sendEmail(attendee.email, 'Event Invitation', textBody, htmlBody);
      }
    }
  }

module.exports = new EventObserver();