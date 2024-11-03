const eventAttendeesRepository = require("../../repositories/eventAttendeesRepository");
const logger = require("../../utils/logger");
const emailService = require("../emailService");
const qrcode = require('qrcode');
const usersService = require("../usersService");

// EventObserver.js
class EventObserver {
    constructor() {
    }
  
    async notify(event) {
      try{      
        logger.info(`Getting attendees for ${event.id}`);
      
        const attendees = await eventAttendeesRepository.getAttendeesByEventId(event.id);
      
        if(attendees.length === 0) {
          logger.info(`No attendees found for ${event.id}`);
          return;
        }
        for(const attendee of attendees) {
          const user = await usersService.GetUserByIdAsync(attendee.attendeeId);
          logger.info(`Notifying ${user.email} for ${event.id}`);
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
          await emailService.sendEmail(user.email, 'Event Invitation', textBody, htmlBody);
        }
      }
      catch(error){
        logger.error(`Error notifying attendees: ${error}`);
        throw error;
      }
    }

    async notifyConfirmation(event, attendee) {
      const eventAttendeeHash = await eventAttendeesRepository.getEventAttendeeHashAsync(event.id, attendee.id);
      if(eventAttendeeHash){
        logger.info(`Sending confirmation for ${eventAttendeeHash}`);

        const emailBody = `
          Please check in your attendance to ${event.eventName}
          We look forward to seeing you there!
          <img src="cid:qrcode" alt="Event QR Code" />
        `;

        const htmlEmailBody = `
          <p>Please check in your attendance to ${event.eventName}:</p>
          <p>We look forward to seeing you there!</p>
          <img src="cid:qrcode" alt="Event QR Code" />
        `;
        const qrCodeBuffer = await this.generateQrCodeAndSave(eventAttendeeHash);
        
        logger.info(`QR Code URL: ${qrCodeBuffer}`);
        const attachment = {
          Content: qrCodeBuffer,
          Name: 'QRCode.png',
          ContentType: 'image/png',
          ContentDisposition: 'inline',
          ContentID: 'qrcode'
        }
        await emailService.sendEmail(attendee.email, 'Event Check In QR CODE', emailBody, htmlEmailBody, attachment);
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

    async generateQrCode(eventHash) {
      try {
          const url = `${eventHash}`;
          const qrCodeDataUrl = await qrcode.toDataURL(url);
          return qrCodeDataUrl; // Returns a base64-encoded image
      } catch (error) {
          console.error("Error generating QR Code:", error);
          throw error; // Re-throw the error for further handling
      }
    }

    async generateQrCodeAndSave(eventHash) {
      try {
          const qrCodeDataUrl = await this.generateQrCode(eventHash);
          const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
          const qrCodeBuffer = Buffer.from(base64Data, 'base64');
          return qrCodeBuffer;
      } catch (error) {
          console.error("Error saving QR Code:", error);
      }
    } 
  }

module.exports = new EventObserver();