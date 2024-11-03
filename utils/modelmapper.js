// requestMapper.js

/**
 * Map event request body to the model used in the database.
 * @param {Object} requestBody - The incoming request body.
 * @returns {Object} The mapped event object.
 */
function mapCreateEventRequestToModel(requestBody) {
    const {
        organiserId,
        eventName,
        eventDescription,
        eventDate,
        eventTimeStart,
        eventTimeEnd,
        eventLocation,
        eventType,
        attendees, 
    } = requestBody;
    // Combine eventDate and eventTimeStart to form a DateTime for start
    const eventStartDateTime = new Date(`${eventDate}T${eventTimeStart}:00`);
    
    // Combine eventDate and eventTimeEnd to form a DateTime for end
    const eventEndDateTime = new Date(`${eventDate}T${eventTimeEnd}:00`);

    const offset = 8 * 60; // GMT+8 in minutes
    const eventStartDateTimeGMT8 = new Date(eventStartDateTime.getTime() + offset * 60 * 1000);
    const eventEndDateTimeGMT8 = new Date(eventEndDateTime.getTime() + offset * 60 * 1000);

    // Return the mapped data
    return {
        eventData: {
            organiserId: organiserId,
            eventName: eventName,
            eventDescription: eventDescription,
            eventDate: eventDate, // DATEONLY format
            eventTimeStart: eventStartDateTimeGMT8, // Full DateTime
            eventTimeEnd: eventEndDateTimeGMT8, // Full DateTime
            eventLocation: eventLocation,
            eventType: eventType
        },
        attendees: attendees
    };
}

function mapEventUpdateBody(requestBody) {
    const {
        eventName,
        eventDescription,
        eventDate,
        eventTimeStart,
        eventTimeEnd,
        eventLocation,
        eventType
    } = requestBody;
    // Combine eventDate and eventTimeStart to form a DateTime for start
    const eventStartDateTime = new Date(`${eventDate}T${eventTimeStart}:00`);
    
    // Combine eventDate and eventTimeEnd to form a DateTime for end
    const eventEndDateTime = new Date(`${eventDate}T${eventTimeEnd}:00`);

    const offset = 8 * 60; // GMT+8 in minutes
    const eventStartDateTimeGMT8 = new Date(eventStartDateTime.getTime() + offset * 60 * 1000);
    const eventEndDateTimeGMT8 = new Date(eventEndDateTime.getTime() + offset * 60 * 1000);

    return {
        eventName,
        eventDescription,
        eventDate, // DATEONLY format
        eventTimeStart: eventStartDateTimeGMT8, // Full DateTime
        eventTimeEnd: eventEndDateTimeGMT8, // Full DateTime
        eventLocation,
        eventType
    }
}

module.exports = {
    mapCreateEventRequestToModel,
    mapEventUpdateBody
};
