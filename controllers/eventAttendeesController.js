
const UsersService = require('../services/usersService')
const express = require('express');
// Create a new Router object
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const EventAttendeesService = require('../services/eventAttendeeService');


async function RegisterForEvent(request,response, next){
    try {
        // request body : user details 
        /*
            {
                id: 
                name: 
                isAdmin: 
                email: 
                contactNumber: 
                password: 
            }
        */
       const eventId = request.params.id;
       // update the user details
       const updatedUser = await UsersService.UpdateUserAsync(user.id, request.body);

       // register for event
       EventAttendeesService.RegisterAttendeeForEventAsync(eventId, updatedUser.id);

       if(success){
            logger.info('User with id deleted: %o', success);
            response.status(200).json({message : 'User deleted'});
        }
        else {
            logger.info('User with id not found: %o', request.params.id);
            response.status(404).json({message: 'User not found'});
        }
    }
    catch(error){
        logger.error('Error deleting user: %o', error);
        //response.status(500).json({ message: 'Internal Server Error'});
        next(error);
    }
}

// Connect the routes to the controller methods
router.post('/:id', asyncHandler(RegisterForEvent));           // Route for creating an user

// Export the router
module.exports = router;
