const eventAttendeesRepository = require("../../repositories/eventAttendeesRepository");
const logger = require("../../utils/logger");
const emailService = require("../emailService");
const qrcode = require('qrcode');
const usersService = require("../usersService");
const uploadService = require("../uploadService");
const { sequelize } = require('../../db/models');

// EventObserver.js
class EventObserver {
    constructor() {
      logger.info(`EventObserver initialized`);
    }
  
    async notify(event) {
      logger.info(`Event Observer Notifying ${event.id}`);
      const transaction = await sequelize.transaction();
      try{      
        logger.info(`Getting attendees for ${event.id}`);
      
        const attendees = await eventAttendeesRepository.getAttendeesByEventId(event.id);
      
        if(attendees.length === 0) {
          logger.info(`No attendees found for ${event.id}`);
          return;
        }
        for(const attendee of attendees.filter(attendee => attendee.status === 'inviting')) {
          logger.info(`Notifying attendee id ${attendee.attendeeId} for ${event.id}`);
          const user = await usersService.GetUserByIdAsync(attendee.attendeeId);
          logger.info(`Notifying user ${user.email} for ${event.id}`);
          const uniqueId = `${attendee.eventAttendeeHash}`;
          const attendeeLink = `http://ecs-frontend-lb-735742951.ap-southeast-1.elb.amazonaws.com/registerEvent/register?eventhash=${uniqueId}`;
          const emailBody = `
          You're invited to ${event.eventName}! Here’s your unique link to join:
          ${attendeeLink}
          
          We look forward to seeing you there!
          `;
          
          const htmlEmailBody = `</p><p>You're invited to ${event.eventName}! Here’s your unique link to join:</p><a href="${attendeeLink}">Join Event</a><p>We look forward to seeing you there!</p>`;
          const textBody = emailBody;
          const htmlBody = htmlEmailBody;
          await emailService.sendEmail(user.email, 'Event Invitation', textBody, htmlBody);
          await eventAttendeesRepository.UpdateAttendeeStatus(event.id, user.id, 'invited',transaction);
        }
        await transaction.commit();
      }
      catch(error){
        await transaction.rollback();
        logger.error(`Error notifying attendees: ${error}`);
        throw error;
      }
    }

    async notifyConfirmation(event, attendee) {
      const eventAttendeeHash = await eventAttendeesRepository.getEventAttendeeHashAsync(event.id, attendee.id);
      if(eventAttendeeHash){
        logger.info(`Sending confirmation for ${eventAttendeeHash}`);
        const qrCodeBuffer = await this.generateQrCodeAndSave(eventAttendeeHash);
        
        // upload to S3 and get image link
        const imageLink = await uploadService.uploadQrCodeToS3(eventAttendeeHash, qrCodeBuffer);
        logger.info(`QR Code URL: ${imageLink}`);

        const emailBody = `
          Please check in your attendance to ${event.eventName}
          We look forward to seeing you there!
          <img src="${imageLink}" alt="Event QR Code" />
        `;

        const htmlEmailBody = `
          <p>Please check in your attendance to ${event.eventName}:</p>
          <p>We look forward to seeing you there!</p>
          <img src="${imageLink}" alt="Event QR Code" />
        `;


        await emailService.sendEmail(attendee.email, 'Event Check In QR CODE', emailBody, htmlEmailBody);
      }
    }

    async notifyUpdate(event){
      let attendees;
      try{
        attendees = await eventAttendeesRepository.getAttendeesByEventId(event.id);

        if(attendees.length === 0) {
          logger.info(`No attendees found for ${event.id}`);
          return;
        }else{
          logger.info(`Notifying ${attendees.length} attendees for ${event.id}`);
          attendees.forEach(async attendee => {
            const user = await usersService.GetUserByIdAsync(attendee.attendeeId);
            logger.info(`Notifying ${user.email} for ${event.id}`);
            // get hash value to construct unique link
            const emailBody = `
            The details of ${event.eventName} has been updated!
            Event Name: ${event.eventName}
            Event Date: ${event.eventDate}
            Event Time: ${event.eventTimeStart} to ${event.eventTimeEnd}
            
            We look forward to seeing you there!
            `;
            
            const htmlEmailBody = `
              <p>The details of ${event.eventName} have been updated!</p>
              <p>Event Name: ${event.eventName}</p>
              <p>Event Date: ${event.eventDate}</p>
              <p>Event Time: ${event.eventTimeStart} to ${event.eventTimeEnd}</p>
              <p>We look forward to seeing you there!</p>
              `;
            const textBody = emailBody;
            const htmlBody = htmlEmailBody;
            await emailService.sendEmail(user.email, 'Event Invitation', textBody, htmlBody);
    
          });
        }
      }catch(error){
        logger.error(`Error notifying attendees: ${error}`);
        throw error;
      }
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