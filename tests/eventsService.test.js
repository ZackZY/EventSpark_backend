const EventsService = require('../services/eventsService');
const EventsRepository = require('../repositories/eventsRepository');

jest.mock('../repositories/eventsRepository'); // Mock the EventsRepository

describe('EventsService', () => {
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
    beforeEach(() => {
        jest.clearAllMocks(); // Clear previous calls and instances
    });

    test('should create an event', async () => {
        const eventData = { sampleEvent };
        EventsRepository.CreateAsync.mockResolvedValue(eventData); // Mock the Create method

        const result = await EventsService.CreateEventAsync(eventData);
        expect(result).toEqual(eventData); // Assert the result matches the input data
        expect(EventsRepository.CreateAsync).toHaveBeenCalledWith(eventData); // Ensure the repository method was called correctly
    });

    test('should get an event by id', async () => {
        const eventId = sampleEvent.id;
        const eventData = { sampleEvent };
        EventsRepository.GetByIdAsync.mockResolvedValue(eventData); // Mock the GetById method

        const result = await EventsService.GetEventByIdAsync(eventId);
        expect(result).toEqual(eventData); // Assert the returned data is correct
        expect(EventsRepository.GetByIdAsync).toHaveBeenCalledWith(eventId); // Check if the repository method was called correctly
    });

    test('should update an event', async () => {
        const eventId = sampleEvent.id;
        const updatedData = { eventName: 'Updated Event' };
        const updatedEvent = { ...sampleEvent, ...updatedData };
        EventsRepository.UpdateAsync.mockResolvedValue(updatedEvent); // Mock the Update method

        const result = await EventsService.UpdateEventAsync(eventId, updatedData);
        expect(result).toEqual(updatedEvent); // Assert the updated event is correct
        expect(EventsRepository.UpdateAsync).toHaveBeenCalledWith(eventId, updatedData); // Ensure the repository method was called correctly
    });

    test('should delete an event', async () => {
        const eventId = sampleEvent.id;
        EventsRepository.DeleteAsync.mockResolvedValue(true); // Mock the Delete method

        const result = await EventsService.DeleteEventAsync(eventId);
        expect(result).toBe(true); // Assert the result indicates success
        expect(EventsRepository.DeleteAsync).toHaveBeenCalledWith(eventId); // Ensure the repository method was called correctly
    });

    test('should list all events', async () => {
        const events = [sampleEvent];
        EventsRepository.ListAllAsync.mockResolvedValue(events); // Mock the ListAll method

        const result = await EventsService.ListAllEventsAsync();
        expect(result).toEqual(events); // Assert the returned events match the mock
        expect(EventsRepository.ListAllAsync).toHaveBeenCalled(); // Ensure the repository method was called
    });
});
