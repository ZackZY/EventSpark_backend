const EventsService = require('../services/eventsService')
const express = require('express');
// Create a new Router object
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const { mapCreateEventRequestToModel } = require('../utils/modelmapper')

async function Create(request, response) {
    try {
        const mappedRequestBody = mapCreateEventRequestToModel(request.body);
        console.log(mappedRequestBody);
        // Pass the event data and list of attendees (should be an array of { email }
        const event = await EventsService.createEventWithAttendees(mappedRequestBody.eventData, mappedRequestBody.attendees);
        logger.info('New Event created: %o', event);
        response.status(201).json(event);
    }
    catch(error){
        logger.error('Error creating event: %o', request.body);
        logger.error(error);
        //response.status(500).json({ message: 'Internal Server Error'});
        next(error);
    }
}

async function GetById(request, response){
    try {
        const event = await EventsService.GetEventByIdAsync(request.params.id);
        if(event){
            const organiser = event.Users.find(user => user.EventAttendees.typeOfAttendee === "organiser");

            console.log(`organiser data: ${JSON.stringify(organiser)}`);
            logger.info('Event with id retrieved: %o', event);
            response.status(200).json(event);
        }else {
            logger.info('Event with id not found: %o', request.params.id);
            response.status(404).json({message: 'Event not found'});
        }
    }
    catch(error){
        logger.error('Error getting event by id: %o', error);
        //response.status(500).json({ message: 'Internal Server Error'});
        next(error);
    }
}

async function Update(request, response, next) {
    try {
        const event = await EventsService.UpdateEventAsync(request.params.id, request.body);
        if(event) {
            logger.info('Event with id updated: %o', event);
            response.status(200).json(event);
        }
        else{
            logger.info('Event with id not found: %o', request.params.id);
            response.status(404).json({ message: 'Event not found'});
        }
    }
    catch(error){
        logger.error('Error updating event: %o', error);
        next(error);
    }
}

async function Delete(request,response, next){
    try {
        const success = await EventsService.DeleteEventAsync(request.params.id);
        if(success){
            logger.info('Event with id deleted: %o', success);
            response.status(200).json({message : 'Event deleted'});
        }
        else {
            logger.info('Event with id not found: %o', request.params.id);
            response.status(404).json({message: 'Event not found'});
        }
    }
    catch(error){
        logger.error('Error deleting event: %o', error);
        //response.status(500).json({ message: 'Internal Server Error'});
        next(error);
    }
}

async function ListAll(request, response, next){
    try{
        const events = await EventsService.ListAllEventsAsync();
        if(events){
            logger.info('Events retrieved: %o', events);
            response.status(200).json(events);
        }
        else{
            logger.info('No Events retrieved');
            response.status(404).json({ message:'No Events found' });
        }
    }
    catch(error){
        logger.error('Error listing all event: %o', error);
        // response.status(500).json({ message: 'Internal Server Error'});
        next(error);
    }
}

// Connect the routes to the controller methods
router.post('/events', asyncHandler(Create));           // Route for creating an event
router.get('/events/:id', asyncHandler(GetById));        // Route for fetching an event by ID
router.put('/events/:id', asyncHandler(Update));         // Route for updating an event by ID
router.delete('/events/:id', asyncHandler(Delete));      // Route for deleting an event by ID
router.get('/events', asyncHandler(ListAll));           // Route for listing all events

// Export the router
module.exports = router;
