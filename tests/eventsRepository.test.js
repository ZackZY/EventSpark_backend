// tests/EventsRepository.test.js

const Events = require('../db/models').Events; // Assuming your Sequelize index file exports the models
const Users = require('../db/models').Users;
const EventsRepository = require('../repositories/eventsRepository');
const sequelize = require('../db/models/index').sequelize;
// Mock the Events model using Jest
jest.mock('../db/models');
// Add this mock before your describe block
jest.mock('../db/models/index', () => ({
    sequelize: {
      transaction: jest.fn()
    },
    Users: jest.fn(),  // Changed this line to avoid circular dependency
    Events: {
        create: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        findAll: jest.fn()
    }
  }));

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

    const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
    };

    beforeEach(() => {
        sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
        jest.clearAllMocks(); // Clear mock history before each test
    });

    test('should create a new event successfully', async () => {
        // Mock the create method of Events model
        Events.create.mockResolvedValue(sampleEvent);
        // Events.create = jest.fn().mockResolvedValue(sampleEvent);

        const result = await EventsRepository.CreateAsync(sampleEvent,mockTransaction);

        // Assertions
        expect(Events.create).toHaveBeenCalledWith(sampleEvent, { transaction: mockTransaction});
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

        // Mock the update method to return an array with number of affected rows
        Events.update.mockResolvedValue([1]);
        // Mock findByPk to return the updated event
        Events.findByPk.mockResolvedValue(updatedEvent);

        const result = await EventsRepository.UpdateAsync(sampleEvent.id, updatedData);

        // Assertions
        expect(Events.update).toHaveBeenCalledWith(updatedData, {
            where: { id: sampleEvent.id }
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

    test('GetEventWithAttendeesAsync should get event with Users', async() => {
        const eventId = '1e8b7c18-e96f-4a8d-9e15-0f5e45e3481f';
        const sampleEvent = {
            id: eventId,
            organiserId: 'd8e3f4e5-4b58-4a65-b37c-8f8fe2ad9a2a',
            eventName: 'Tech Conference',
            eventDescription: 'A conference for tech enthusiasts.',
            eventDate: '2024-10-01',
            eventTimeStart: new Date('2024-10-01T09:00:00'),
            eventTimeEnd: new Date('2024-10-01T17:00:00'),
            eventLocation: 'San Francisco, CA',
            eventType: 'Conference',
            Users: [
              { id: 'user-uuid-1', name: 'John', contactNumber: 'Doe', email: 'john.doe@example.com' },
              { id: 'user-uuid-2', name: 'Jane', contactNumber: 'Doe', email: 'jane.doe@example.com' },
            ]
        };

        // Mock findByPk to return sample event with associated users
        Events.findByPk.mockResolvedValue(sampleEvent);

        // Call the method
        const result = await EventsRepository.GetEventWithAttendeesAsync(eventId);
        // Assertions
        expect(Events.findByPk).toHaveBeenCalledWith(eventId, {
            include: Users,
        });
        expect(result).toEqual(sampleEvent);
        expect(result.Users).toHaveLength(2); // Check that it includes 2 associated users
        expect(result.Users[0].name).toBe('John');
        expect(result.Users[1].name).toBe('Jane');
    });

    test('should return null when updating non-existent event', async () => {
        const updatedData = { eventName: 'Tech Meetup' };
        
        // Mock update to return [0] indicating no rows were updated
        Events.update.mockResolvedValue([0]);

        const result = await EventsRepository.UpdateAsync('non-existent-id', updatedData);

        // Assertions
        expect(Events.update).toHaveBeenCalledWith(updatedData, {
            where: { id: 'non-existent-id' }
        });
        expect(result).toBeNull();
    });
});
