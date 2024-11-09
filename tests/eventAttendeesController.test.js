const request = require('supertest');
const express = require('express');
const eventAttendeesRouter = require('../controllers/eventAttendeesController');
const EventAttendeesService = require('../services/eventAttendeeService');
const UsersService = require('../services/usersService');
const sequelize = require('../db/models/index').sequelize;

jest.mock('../services/eventAttendeeService');
jest.mock('../services/usersService');

const app = express();
app.use(express.json());
app.use('/api', eventAttendeesRouter);

jest.mock('../db/models/index', () => ({
    sequelize: {
        transaction: jest.fn()
    },
    Users: jest.fn(),
    Events: jest.fn()
}));

describe('EventAttendeesController', () => {
    const sampleUser = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        contactNumber: '1234567890'
    };

    const sampleEventId = 'event123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should register user for event', async () => {
        UsersService.FindOrCreateAndUpdateUserAsync.mockResolvedValue(sampleUser);
        EventAttendeesService.RegisterAttendeeForEventAsync.mockResolvedValue(true);

        const response = await request(app)
            .post(`/api/${sampleEventId}`)
            .send(sampleUser);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'User registered' });
        expect(UsersService.FindOrCreateAndUpdateUserAsync).toHaveBeenCalledWith(sampleUser);
        expect(EventAttendeesService.RegisterAttendeeForEventAsync).toHaveBeenCalledWith(sampleEventId, sampleUser.id);
    });

    test('should return 404 when user not found during registration', async () => {
        UsersService.FindOrCreateAndUpdateUserAsync.mockResolvedValue(null);

        const response = await request(app)
            .post(`/api/${sampleEventId}`)
            .send(sampleUser);

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'User not found' });
    });

    test('should get attendees by event id', async () => {
        const attendees = [sampleUser];
        EventAttendeesService.GetAttendeesByEventId.mockResolvedValue(attendees);

        const response = await request(app)
            .get(`/api/${sampleEventId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(attendees);
        expect(EventAttendeesService.GetAttendeesByEventId).toHaveBeenCalledWith(sampleEventId);
    });

    test('should return 404 when no attendees found', async () => {
        EventAttendeesService.GetAttendeesByEventId.mockResolvedValue(null);

        const response = await request(app)
            .get(`/api/${sampleEventId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'EventAttendee not found' });
    });
});
