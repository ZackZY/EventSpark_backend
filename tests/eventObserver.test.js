// tests/eventObserver.test.js
const EventObserver = require('../services/observers/eventObserver');
const EmailService = require('../services/emailService');
const EventAttendeesRepository = require('../repositories/eventAttendeesRepository');

jest.mock('../services/emailService');
jest.mock('../repositories/eventAttendeesRepository');

describe('EventObserver', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    EmailService.sendEmail.mockClear();
  });

  test('should send email invitations to all attendees', async () => {
    const event = { id: 'eventId' };
    const attendees = [
      { eventAttendeeHash: 'hash1', email: 'attendee1@example.com' },
      { eventAttendeeHash: 'hash2', email: 'attendee2@example.com' },
    ];

    EventAttendeesRepository.getAttendeesByEventId.mockResolvedValue(attendees);

    await EventObserver.notify(event);

    expect(EmailService.sendEmail).toHaveBeenCalledTimes(2);
    expect(EmailService.sendEmail).toHaveBeenCalledWith('attendee1@example.com', 'Event Invitation', expect.any(String), expect.any(String));
    expect(EmailService.sendEmail).toHaveBeenCalledWith('attendee2@example.com', 'Event Invitation', expect.any(String), expect.any(String));
  });

  test('should handle empty attendees list', async () => {
    const event = { id: 'eventId' };
    EventAttendeesRepository.getAttendeesByEventId.mockResolvedValue([]);

    await EventObserver.notify(event);

    expect(EmailService.sendEmail).not.toHaveBeenCalled();
  });
});