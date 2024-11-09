const { EventAttendees } = require('../db/models');
const EventAttendeesRepository = require('../repositories/eventAttendeesRepository');
const logger = require('../utils/logger');
const sequelize = require('../db/models/index').sequelize;

jest.mock('../db/models');
jest.mock('../utils/logger');
// Add this mock before your describe block
jest.mock('../db/models/index', () => ({
    sequelize: {
      transaction: jest.fn()
    },
    Users: jest.fn(),  // Changed this line to avoid circular dependency
    Events: jest.fn(),
    EventAttendees: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        bulkCreate: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    },
  }));
describe('EventAttendeesRepository', () => {
    const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
    };

    const sampleEvent = {
        id: 'event-123',
        organiserId: 'organiser-123'
    };

    const sampleAttendees = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' }
    ];

    beforeEach(() => {
        sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

        jest.clearAllMocks();
    });

    describe('addAttendeesToEvent', () => {
        test('should add new attendees and organiser', async () => {
            EventAttendees.findAll.mockResolvedValue([]);
            EventAttendees.findOne.mockResolvedValue(null);
            EventAttendees.bulkCreate.mockResolvedValue([]);

            await EventAttendeesRepository.addAttendeesToEvent(sampleEvent, sampleAttendees, mockTransaction);

            expect(EventAttendees.bulkCreate).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ 
                        eventId: sampleEvent.id,
                        typeOfAttendee: 'attendee'
                    }),
                    expect.objectContaining({
                        eventId: sampleEvent.id,
                        typeOfAttendee: 'organiser'
                    })
                ]),
                { transaction: mockTransaction }
            );
        });

        test('should not add existing attendees', async () => {
            EventAttendees.findAll.mockResolvedValue([
                { attendeeId: 'user-1' }
            ]);
            EventAttendees.findOne.mockResolvedValue(null);
            EventAttendees.bulkCreate.mockResolvedValue([]);

            await EventAttendeesRepository.addAttendeesToEvent(sampleEvent, sampleAttendees, mockTransaction);

            const bulkCreateCall = EventAttendees.bulkCreate.mock.calls[0][0];
            expect(bulkCreateCall.filter(entry => entry.typeOfAttendee === 'attendee')).toHaveLength(1);
        });
    });

    describe('getAttendeesByEventId', () => {
        test('should return all attendees for an event', async () => {
            const mockAttendees = [
                { attendeeId: 'user-1', eventId: 'event-123' },
                { attendeeId: 'user-2', eventId: 'event-123' }
            ];
            EventAttendees.findAll.mockResolvedValue(mockAttendees);

            const result = await EventAttendeesRepository.getAttendeesByEventId('event-123');

            expect(EventAttendees.findAll).toHaveBeenCalledWith({
                where: { eventId: 'event-123' }
            });
            expect(result).toEqual(mockAttendees);
        });
    });

    describe('getEventAttendeeHashAsync', () => {
        test('should return hash for existing attendee', async () => {
            const mockAttendee = {
                eventAttendeeHash: 'event-123-user-1'
            };
            EventAttendees.findOne.mockResolvedValue(mockAttendee);

            const result = await EventAttendeesRepository.getEventAttendeeHashAsync('event-123', 'user-1');

            expect(result).toBe('event-123-user-1');
        });

        test('should return null for non-existing attendee', async () => {
            EventAttendees.findOne.mockResolvedValue(null);

            const result = await EventAttendeesRepository.getEventAttendeeHashAsync('event-123', 'user-1');

            expect(result).toBeNull();
        });
    });

    describe('registerEvent', () => {
        test('should register existing attendee', async () => {
            EventAttendees.update.mockResolvedValue([1]);

            const result = await EventAttendeesRepository.registerEvent('event-123', 'user-1', mockTransaction);

            expect(EventAttendees.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateTimeRegistered: expect.any(Date),
                    status: 'registered'
                }),
                expect.objectContaining({
                    where: {
                        attendeeId: 'user-1',
                        eventId: 'event-123'
                    }
                }),
                { transaction: mockTransaction }
            );
            expect(result).toBe(true);
        });
    });

    describe('registerNewAttendeeToEvent', () => {
        test('should register new attendee', async () => {
            const mockNewAttendee = {
                attendeeId: 'user-1',
                eventId: 'event-123',
                status: 'registered'
            };
            EventAttendees.create.mockResolvedValue(mockNewAttendee);

            const result = await EventAttendeesRepository.registerNewAttendeeToEvent('event-123', 'user-1', mockTransaction);

            expect(EventAttendees.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    attendeeId: 'user-1',
                    eventId: 'event-123',
                    status: 'registered'
                }),
                { transaction: mockTransaction }
            );
            expect(result).toEqual(mockNewAttendee);
        });
    });

    describe('UpdateAttendeeStatus', () => {
        test('should update attendee status', async () => {
            EventAttendees.update.mockResolvedValue([1]);

            const result = await EventAttendeesRepository.UpdateAttendeeStatus('event-123', 'user-1', 'attended', mockTransaction);

            expect(EventAttendees.update).toHaveBeenCalledWith(
                { status: 'attended' },
                {
                    where: {
                        attendeeId: 'user-1',
                        eventId: 'event-123'
                    }
                },
                { transaction: mockTransaction }
            );
            expect(result).toBe(true);
        });

        test('should return false when no rows updated', async () => {
            EventAttendees.update.mockResolvedValue([0]);

            const result = await EventAttendeesRepository.UpdateAttendeeStatus('event-123', 'user-1', 'attended', mockTransaction);

            expect(result).toBe(false);
        });
    });
});
