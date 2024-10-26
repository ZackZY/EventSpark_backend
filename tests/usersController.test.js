// tests/userController.test.js

const request = require('supertest');
const express = require('express');
const usersRouter = require('../controllers/usersController'); // Import the updated router
const UsersService = require('../services/usersService'); // Import the service to mock

// Mock the UserService module
jest.mock('../services/usersService');

const app = express();
app.use(express.json()); // Use JSON middleware
app.use('/api', usersRouter); // Use the users router on the /api path

describe('UsersController', () => {
    // Sample data for testing
    const sampleUser = {
        id: '1e8b7c18-e96f-4a8d-9e15-0f5e45e3481f',
        name: 'purple cactus',
        email: 'purple@cactus.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    test('should create a new user', async () => {
        const newUser = { sampleUser };
        const createdUser = { newUser };

        UsersService.CreateUserAsync.mockResolvedValue(createdUser);

        const response = await request(app).post('/api/users').send(newUser);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(createdUser);
    });

    test('should get an user by ID', async () => {
        const user = { sampleUser };

        UsersService.GetUserByIdAsync.mockResolvedValue(user);

        const response = await request(app).get(`/api/users/${user.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(user);
    });

    test('should return 404 if user not found', async () => {
        UsersService.GetUserByIdAsync.mockResolvedValue(null);

        const response = await request(app).get('/api/users/999');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'User not found' });
    });

    test('should update an user', async () => {
        const updatedData = { userName: 'Updated User' };
        const updatedUser = { ...sampleUser, ...updatedData };

        UsersService.UpdateUserAsync.mockResolvedValue(updatedUser);

        const response = await request(app).put(`/api/users/${sampleUser.id}`).send(updatedData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(updatedUser);
    });

    test('should delete an user', async () => {
        UsersService.DeleteUserAsync.mockResolvedValue(true);

        const response = await request(app).delete(`/api/users/${sampleUser.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'User deleted' });
    });

    test('should return 404 if trying to delete an user that does not exist', async () => {
        UsersService.DeleteUserAsync.mockResolvedValue(false);

        const response = await request(app).delete('/api/users/999');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'User not found' });
    });
});
