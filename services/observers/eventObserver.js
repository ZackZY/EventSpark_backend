const eventAttendeesRepository = require("../../repositories/eventAttendeesRepository");
const logger = require("../../utils/logger");
const emailService = require("../emailService");
const qrcode = require('qrcode');

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
        You're invited to ${event.eventName}! Here’s your unique link to join:
        ${attendeeLink}
        
        We look forward to seeing you there!
        `;
        
        const htmlEmailBody = `</p><p>You're invited to ${event.eventName}! Here’s your unique link to join:</p><a href="${attendeeLink}">Join Event</a><p>We look forward to seeing you there!</p>`
        const textBody = emailBody;
        const htmlBody = htmlEmailBody;
        await emailService.sendEmail(attendee.email, 'Event Invitation', textBody, htmlBody);
      }
    }

    async notifyConfirmation(event, attendee) {
      const eventAttendeeHash = await eventAttendeesRepository.getEventAttendeeHashAsync(event.id, attendee.id);
      if(eventAttendeeHash){
        logger.info(`Sending confirmation for ${eventAttendeeHash}`);
        const qrCodeImageUrl = await qrcode.toDataURL(eventAttendeeHash, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 100,
          height: 100,
        });
        const emailBody = `
          Please check in your attendance to ${event.eventName}:
          <img src="data:image/png;base64,${qrCodeImageUrl}" width="100" height="100">
          We look forward to seeing you there!
        `;

        const htmlEmailBody = `
          <p>Please check in your attendance to ${event.eventName}:</p>
          <img src="data:image/png;base64,${qrCodeImageUrl}" width="100" height="100">
          <p>We look forward to seeing you there!</p>
        `;

        await emailService.sendEmail(attendee.email, 'Event Check In QR CODE', emailBody, htmlEmailBody);
      }
    }

    async notifyInvite(event, attendees){
      attendees.forEach(async attendee => {
        // get hash value to construct unique link
        const eventAttendeeHash = await eventAttendeesRepository.getEventAttendeeHashAsync(event.id, attendee.id);
        const uniqueId = `${eventAttendeeHash}`;
        const attendeeLink = `https://ecs-frontend-lb-735742951.ap-southeast-1.elb.amazonaws.com/registerform.html?eventhash=${uniqueId}`;
        const emailBody = `
        You're invited to ${event.eventName}! Here’s your unique link to join:
        ${attendeeLink}
        
        We look forward to seeing you there!
        `;
        
        const htmlEmailBody = `</p><p>You're invited to ${event.eventName}! Here’s your unique link to join:</p><a href="${attendeeLink}">Join Event</a><p>We look forward to seeing you there!</p>`
        const textBody = emailBody;
        const htmlBody = htmlEmailBody;
        await emailService.sendEmail(attendee.email, 'Event Invitation', textBody, htmlBody);

      });
    }
  }

module.exports = new EventObserver();