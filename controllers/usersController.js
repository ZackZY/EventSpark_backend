const UsersService = require('../services/usersService')
const express = require('express');
// Create a new Router object
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

async function Create(request, response) {
    try {
        const user = await UsersService.CreateUserAsync(request.body);
        logger.info('New User created: %o', user);
        response.status(201).json(user);
    }
    catch(error){
        logger.error('Error creating user: %o', error);
        //response.status(500).json({ message: 'Internal Server Error'});
        next(error);
    }
}

async function GetById(request, response){
    try {
        const user = await UsersService.GetUserByIdAsync(request.params.id);
        if(user){
            logger.info('User with id retrieved: %o', user);
            response.status(200).json(user);
        }else {
            logger.info('User with id not found: %o', request.params.id);
            response.status(404).json({message: 'User not found'});
        }
    }
    catch(error){
        logger.error('Error getting user by id: %o', error);
        //response.status(500).json({ message: 'Internal Server Error'});
        next(error);
    }
}

async function Update(request, response, next) {
    try {
        const userData = request.body;
        const user = await UsersService.UpdateUserAsync(request.params.id, {name: userData.name, contactNumber:userData.contactNumber});
        if(user) {
            logger.info('User with id updated: %o', user);
            response.status(200).json(user);
        }
        else{
            logger.info('User with id not found: %o', request.params.id);
            response.status(404).json({ message: 'User not found'});
        }
    }
    catch(error){
        logger.error('Error updating user: %o', error);
        next(error);
    }
}

async function Delete(request,response, next){
    try {
        const success = await UsersService.DeleteUserAsync(request.params.id);
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

async function ListAll(request, response, next){
    try{
        const users = await UsersService.ListAllUsersAsync();
        if(users){
            logger.info('Users retrieved: %o', users);
            response.status(200).json(users);
        }
        else{
            logger.info('No Users retrieved');
            response.status(404).json({ message:'No Users found' });
        }
    }
    catch(error){
        logger.error('Error listing all user: %o', error);
        // response.status(500).json({ message: 'Internal Server Error'});
        next(error);
    }
}

// Connect the routes to the controller methods
router.post('/users', asyncHandler(Create));           // Route for creating an user
router.get('/users/:id', asyncHandler(GetById));        // Route for fetching an user by ID
router.put('/users/:id', asyncHandler(Update));         // Route for updating an user by ID
router.delete('/users/:id', asyncHandler(Delete));      // Route for deleting an user by ID
router.get('/users', asyncHandler(ListAll));           // Route for listing all users

// Export the router
module.exports = router;
