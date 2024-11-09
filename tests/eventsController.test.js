// tests/eventController.test.js

const request = require('supertest');
const express = require('express');
const eventsRouter = require('../controllers/eventsController'); // Import the updated router
const EventsService = require('../services/eventsService'); // Import the service to mock
const sequelize = require('../db/models/index').sequelize;
// Mock the EventService module
jest.mock('../services/eventsService');

const app = express();
app.use(express.json()); // Use JSON middleware
app.use('/api', eventsRouter); // Use the events router on the /api path
// Add this mock before your describe block
jest.mock('../db/models/index', () => ({
    sequelize: {
      transaction: jest.fn()
    },
    Users: jest.fn(),  // Changed this line to avoid circular dependency
    Events: jest.fn()
  }));

describe('EventsController', () => {
    // Sample data for testing
    const sampleEvent = {
        id: '1e8b7c18-e96f-4a8d-9e15-0f5e45e3481f',
        organiserId: 'd8e3f4e5-4b58-4a65-b37c-8f8fe2ad9a2a',
        eventName: 'Tech Conference',
        eventDescription: 'A conference for tech enthusiasts.',
        eventDate: '2024-10-01',
        eventTimeStart: new Date('2024-10-01T09:00:00').toISOString(),
        eventTimeEnd: new Date('2024-10-01T17:00:00').toISOString(),
        eventLocation: 'San Francisco, CA',
        eventType: 'Conference',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attendees: 
            [
                { "email": "john.doe@example.com" },
                { "email": "jane.smith@example.com" },
                { "email": "alice.johnson@example.com" }
            ]
    };

    beforeEach(() => {
        mockTransaction = {
          commit: jest.fn(),
          rollback: jest.fn(),
        };
    
        sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
        jest.clearAllMocks(); // Clear mock history before each test
      });

    test('should create a new event', async () => {
        const newEvent = { sampleEvent };
        const createdEvent = { newEvent };

        EventsService.CreateEventAsync.mockResolvedValue(createdEvent);

        const response = await request(app).post('/api/events').send(newEvent);

        expect(response.statusCode).toBe(201);
    });

    test('should get an event by ID', async () => {
        const event = { sampleEvent };

        EventsService.GetEventByIdAsync.mockResolvedValue(event);

        const response = await request(app).get(`/api/events/${event.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(event);
    });

    test('should return 404 if event not found', async () => {
        EventsService.GetEventByIdAsync.mockResolvedValue(null);

        const response = await request(app).get('/api/events/999');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'Event not found' });
    });

    test('should update an event', async () => {
        const updatedData = { eventName: 'Updated Event' };
        const updatedEvent = { ...sampleEvent, ...updatedData };

        EventsService.UpdateEventAsync.mockResolvedValue(updatedEvent);

        const response = await request(app).put(`/api/events/${sampleEvent.id}`).send(updatedData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(updatedEvent);
    });

    test('should delete an event', async () => {
        EventsService.DeleteEventAsync.mockResolvedValue(true);

        const response = await request(app).delete(`/api/events/${sampleEvent.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Event deleted' });
    });

    test('should return 404 if trying to delete an event that does not exist', async () => {
        EventsService.DeleteEventAsync.mockResolvedValue(false);

        const response = await request(app).delete('/api/events/999');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'Event not found' });
    });
});
