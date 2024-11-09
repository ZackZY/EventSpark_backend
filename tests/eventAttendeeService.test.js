const EventAttendeesService = require('../services/eventAttendeeService');
const EventAttendeesRepository = require('../repositories/eventAttendeesRepository');
const EventsService = require('../services/eventsService');
const UsersService = require('../services/usersService');
const EventObserver = require('../services/observers/eventObserver');
const { sequelize } = require('../db/models');
const logger = require('../utils/logger');

jest.mock('../repositories/eventAttendeesRepository');
jest.mock('../services/eventsService');
jest.mock('../services/usersService');
jest.mock('../services/observers/eventObserver');
jest.mock('../utils/logger');
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
    },
    EventAttendees: jest.fn()
  }));
describe('EventAttendeesService', () => {
    let mockTransaction;

    const sampleEvent = {
        id: 'event-123',
        eventName: 'Test Event'
    };

    const sampleUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        contactNumber: '12345678'
    };

    beforeEach(() => {
        mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn()
        };
        sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
        jest.clearAllMocks();
    });

    describe('RegisterAttendeeForEventAsync', () => {
        test('should register existing attendee for event', async () => {
            EventAttendeesRepository.getEventAttendeeHashAsync.mockResolvedValue('existing-hash');
            EventAttendeesRepository.registerEvent.mockResolvedValue(true);
            EventsService.GetEventByIdAsync.mockResolvedValue(sampleEvent);
            UsersService.GetUserByIdAsync.mockResolvedValue(sampleUser);

            await EventAttendeesService.RegisterAttendeeForEventAsync('event-123', 'user-123');

            expect(EventAttendeesRepository.registerEvent).toHaveBeenCalledWith('event-123', 'user-123', mockTransaction);
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(EventObserver.notifyConfirmation).toHaveBeenCalledWith(sampleEvent, sampleUser);
        });

        test('should register new attendee for event', async () => {
            EventAttendeesRepository.getEventAttendeeHashAsync.mockResolvedValue(null);
            EventAttendeesRepository.registerNewAttendeeToEvent.mockResolvedValue(true);
            EventsService.GetEventByIdAsync.mockResolvedValue(sampleEvent);
            UsersService.GetUserByIdAsync.mockResolvedValue(sampleUser);

            await EventAttendeesService.RegisterAttendeeForEventAsync('event-123', 'user-123');

            expect(EventAttendeesRepository.registerNewAttendeeToEvent).toHaveBeenCalledWith('event-123', 'user-123', mockTransaction);
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(EventObserver.notifyConfirmation).toHaveBeenCalledWith(sampleEvent, sampleUser);
        });

        test('should handle registration error', async () => {
            const error = new Error('Registration failed');
            EventAttendeesRepository.getEventAttendeeHashAsync.mockRejectedValue(error);

            await expect(EventAttendeesService.RegisterAttendeeForEventAsync('event-123', 'user-123'))
                .rejects.toThrow(error);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith('error registering for event-123-user-123');
        });
    });

    describe('GetAttendeesByEventId', () => {
        test('should get attendees with user details', async () => {
            const attendees = [
                { dataValues: { attendeeId: 'user-123', someOtherData: 'data' } },
                { dataValues: { attendeeId: 'user-456', someOtherData: 'data' } }
            ];

            EventAttendeesRepository.getAttendeesByEventId.mockResolvedValue(attendees);
            UsersService.GetUserByIdAsync.mockResolvedValue(sampleUser);

            const result = await EventAttendeesService.GetAttendeesByEventId('event-123');

            expect(EventAttendeesRepository.getAttendeesByEventId).toHaveBeenCalledWith('event-123');
            expect(UsersService.GetUserByIdAsync).toHaveBeenCalledTimes(2);
            expect(result).toHaveLength(2);
            expect(result[0].user).toEqual(sampleUser);
        });
    });
});
