const EventsService = require('../services/eventsService');
const EventsRepository = require('../repositories/eventsRepository');
const UsersRepository = require('../repositories/usersRepository');
const EventAttendeesRepository = require('../repositories/eventAttendeesRepository');
const eventObserver = require('../services/observers/eventObserver');
const sequelize = require('../db/models/index').sequelize;

jest.mock('../repositories/eventsRepository'); // Mock the EventsRepository
jest.mock('../repositories/usersRepository'); // Mock the UsersRepository
jest.mock('../repositories/eventAttendeesRepository') // mock the EventAttendeesRepository
jest.mock('../services/observers/eventObserver');
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
        
        mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn(),
        };

        sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
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
        EventsRepository.GetByIdAsync.mockResolvedValue(sampleEvent);

        const result = await EventsService.GetEventByIdAsync(eventId);
        expect(result).toEqual(sampleEvent);
        expect(EventsRepository.GetByIdAsync).toHaveBeenCalledWith(eventId);
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

    test('should create an event with attendees', async () => {

        const eventData = {
            eventName: 'Test Event',
            eventDescription: 'This is a test event',
            eventDate: '2024-10-01',
            eventTimeStart: new Date('2024-10-01T09:00:00'),
            eventTimeEnd: new Date('2024-10-01T17:00:00'),
            eventLocation: 'San Francisco, CA',
            eventType: 'Conference',
        };
    
        const attendeesData = [
            { email: 'attendee1@example.com' },
            { email: 'attendee2@example.com' },
        ];
    
        // Mock EventsRepository.CreateAsync to return a sample event
        EventsRepository.CreateAsync.mockResolvedValue(sampleEvent);
    
        // Mock UsersRepository.findOrCreateByEmail to return sample users
        const sampleUsers = [
            { id: 'user1', email: 'attendee1@example.com' },
            { id: 'user2', email: 'attendee2@example.com' },
        ];
        UsersRepository.findOrCreateByEmail.mockResolvedValueOnce([sampleUsers[0], true]);
        UsersRepository.findOrCreateByEmail.mockResolvedValueOnce([sampleUsers[1], true]);
    
        // Mock EventAttendeesRepository.addAttendeesToEvent to return successfully
        EventAttendeesRepository.addAttendeesToEvent.mockResolvedValue();
    
        // Mock eventObserver.notify to return successfully
        eventObserver.notify.mockResolvedValue();

        EventsRepository.GetEventWithAttendeesAsync.mockResolvedValue(sampleEvent); // Mock the GetById method
    
        // Call the method
        const result = await EventsService.createEventWithAttendees(eventData, attendeesData);
    
        // Assertions
        expect(EventsRepository.CreateAsync).toHaveBeenCalledWith(eventData, mockTransaction);
        expect(UsersRepository.findOrCreateByEmail).toHaveBeenCalledTimes(2);
        expect(UsersRepository.findOrCreateByEmail).toHaveBeenCalledWith(attendeesData[0], mockTransaction);
        expect(UsersRepository.findOrCreateByEmail).toHaveBeenCalledWith(attendeesData[1], mockTransaction);
        expect(EventAttendeesRepository.addAttendeesToEvent).toHaveBeenCalledWith(sampleEvent, sampleUsers, mockTransaction);
        expect(eventObserver.notify).toHaveBeenCalledWith(sampleEvent);
        expect(result).toEqual(sampleEvent);
    });

    test('should add attendees to an event', async () => {
        const eventId = sampleEvent.id;
        const attendeesData = [
            { email: 'attendee1@example.com' },
            { email: 'attendee2@example.com' },
        ];
    
        // Mock EventsRepository.GetByIdAsync to return a sample event
        EventsRepository.GetByIdAsync.mockResolvedValue(sampleEvent);
    
        // Mock UsersRepository.findOrCreateByEmail to return sample users
        const sampleUsers = [
            { id: 'user1', email: 'attendee1@example.com' },
            { id: 'user2', email: 'attendee2@example.com' },
        ];
        UsersRepository.findOrCreateByEmail.mockResolvedValueOnce([sampleUsers[0], true]);
        UsersRepository.findOrCreateByEmail.mockResolvedValueOnce([sampleUsers[1], true]);
    
        // Mock EventAttendeesRepository.addAttendeesToEvent to return successfully
        EventAttendeesRepository.addAttendeesToEvent.mockResolvedValue();
    
        // Mock eventObserver.notify to return successfully
        eventObserver.notify.mockResolvedValue();
    
        // Call the method
        await EventsService.AddAttendeesToEvent(eventId, attendeesData);
    
        // Assertions
        expect(EventsRepository.GetByIdAsync).toHaveBeenCalledWith(eventId);
        expect(UsersRepository.findOrCreateByEmail).toHaveBeenCalledTimes(2);
        expect(UsersRepository.findOrCreateByEmail).toHaveBeenCalledWith(attendeesData[0], mockTransaction);
        expect(UsersRepository.findOrCreateByEmail).toHaveBeenCalledWith(attendeesData[1], mockTransaction);
        expect(EventAttendeesRepository.addAttendeesToEvent).toHaveBeenCalledWith(sampleEvent, sampleUsers, mockTransaction);
        expect(eventObserver.notify).toHaveBeenCalledWith(sampleEvent);
    });
});
