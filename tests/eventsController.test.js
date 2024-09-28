// tests/eventController.test.js

const request = require('supertest');
const app = require('../app'); // Import the Express app

// Mock the EventService module
jest.mock('../services/eventsService');
const EventService = require('../services/eventsService');

describe('EventsController', () => {
    // Sample data for testing
    const sampleEvent = {
        id: '1e8b7c18-e96f-4a8d-9e15-0f5e45e3481f',
        organiserId: 'd8e3f4e5-4b58-4a65-b37c-8f8fe2ad9a2a',
        eventName: 'Tech Conference',
        eventDescription: 'A conference for tech enthusiasts.',
        eventDate: '2024-10-01',
        eventTimeStart: new Date('2024-10-01T09:00:00'),
        eventTimeEnd: new Date('2024-10-01T17:00:00'),
        eventLocation: 'San Francisco, CA',
        eventType: 'Conference',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    test('should create a new event', async () => {
        const newEvent = { sampleEvent };
        const createdEvent = { newEvent };

        EventService.CreateEventAsync.mockResolvedValue(createdEvent);

        const response = await request(app).post('/events').send(newEvent);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(createdEvent);
    });

    test('should get an event by ID', async () => {
        const event = { sampleEvent };

        EventService.GetEventByIdAsync.mockResolvedValue(event);

        const response = await request(app).get(`/events/${event.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(event);
    });

    test('should return 404 if event not found', async () => {
        EventService.GetEventByIdAsync.mockResolvedValue(null);

        const response = await request(app).get('/events/999');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'Event not found' });
    });

    test('should update an event', async () => {
        const updatedData = { eventName: 'Updated Event' };
        const updatedEvent = { ...sampleEvent, ...updatedData };

        EventService.UpdateEventAsync.mockResolvedValue(updatedEvent);

        const response = await request(app).put(`/events/${sampleEvent.id}`).send(updatedData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(updatedEvent);
    });

    test('should delete an event', async () => {
        EventService.DeleteEventAsync.mockResolvedValue(true);

        const response = await request(app).delete(`/events/${sampleEvent.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Event deleted' });
    });

    test('should return 404 if trying to delete an event that does not exist', async () => {
        EventService.DeleteEventAsync.mockResolvedValue(false);

        const response = await request(app).delete('/events/999');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'Event not found' });
    });
});
