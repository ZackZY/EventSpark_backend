// tests/EventsRepository.test.js

const Events = require('../db/models').Events; // Assuming your Sequelize index file exports the models
const EventsRepository = require('../repositories/eventsRepository');

// Mock the Events model using Jest
jest.mock('../db/models');

describe('EventsRepository', () => {
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
        jest.clearAllMocks(); // Clear mock history before each test
    });

    test('should create a new event successfully', async () => {
        // Mock the create method of Events model
        Events.create.mockResolvedValue(sampleEvent);

        const result = await EventsRepository.CreateAsync(sampleEvent);

        // Assertions
        expect(Events.create).toHaveBeenCalledWith(sampleEvent);
        expect(result).toEqual(sampleEvent);
    });

    test('should find an event by ID', async () => {
        // Mock the findByPk method of Events model
        Events.findByPk.mockResolvedValue(sampleEvent);

        const result = await EventsRepository.GetByIdAsync(sampleEvent.id);

        // Assertions
        expect(Events.findByPk).toHaveBeenCalledWith(sampleEvent.id);
        expect(result).toEqual(sampleEvent);
    });

    test('should update an event successfully', async () => {
        const updatedData = { eventName: 'Tech Meetup' };
        const updatedEvent = { ...sampleEvent, ...updatedData };

        // Mock the update method to return an array [numberOfAffectedRows, [updatedEvent]]
        Events.update.mockResolvedValue([1, [updatedEvent]]);

        const result = await EventsRepository.UpdateAsync(sampleEvent.id, updatedData);

        // Assertions
        expect(Events.update).toHaveBeenCalledWith(updatedData, {
            where: { id: sampleEvent.id },
            returning: true,
        });
        expect(result).toEqual(updatedEvent);
    });

    test('should delete an event by ID successfully', async () => {
        // Mock the destroy method to return 1, indicating one row deleted
        Events.destroy.mockResolvedValue(1);

        const result = await EventsRepository.DeleteAsync(sampleEvent.id);

        // Assertions
        expect(Events.destroy).toHaveBeenCalledWith({ where: { id: sampleEvent.id } });
        expect(result).toBe(true);
    });

    test('should list all events', async () => {
        const eventsList = [sampleEvent]; // Array of events to be returned

        // Mock the findAll method to return an array of events
        Events.findAll.mockResolvedValue(eventsList);

        const result = await EventsRepository.ListAllAsync();

        // Assertions
        expect(Events.findAll).toHaveBeenCalled();
        expect(result).toEqual(eventsList);
    });
});
