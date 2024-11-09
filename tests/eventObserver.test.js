// tests/eventObserver.test.js
const EventObserver = require('../services/observers/eventObserver');
const EmailService = require('../services/emailService');
const EventAttendeesRepository = require('../repositories/eventAttendeesRepository');
const sequelize = require('../db/models/index').sequelize;
const uploadService = require("../services/uploadService");
const qrcode = require('qrcode');
jest.mock('../services/emailService');
jest.mock('../repositories/eventAttendeesRepository');
jest.mock('qrcode');
jest.mock('../services/uploadService');

// Add this mock before your describe block
jest.mock('../db/models/index', () => ({
  sequelize: {
    transaction: jest.fn()
  },
  Users: jest.fn(),  // Changed this line to avoid circular dependency
  Events: jest.fn()
}));

jest.mock('../services/usersService', () => ({
  GetUserByIdAsync: jest.fn()
}));

describe('EventObserver', () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
    jest.clearAllMocks();
    uploadService.uploadQrCodeToS3.mockReset();
    qrcode.toDataURL.mockReset();
  });

  afterEach(() => {
    EmailService.sendEmail.mockClear();
  });

  test('should send email invitations to all attendees', async () => {
    const event = { id: 'eventId', eventName: 'Test Event' };
    const attendees = [
      { eventAttendeeHash: 'hash1', email: 'attendee1@example.com', attendeeId: '1', status: 'inviting' },
      { eventAttendeeHash: 'hash2', email: 'attendee2@example.com', attendeeId: '2', status: 'inviting' },
    ];

    EventAttendeesRepository.getAttendeesByEventId.mockResolvedValue(attendees);
    // Mock the GetUserByIdAsync call
    const mockUser1 = { id: '1', email: 'attendee1@example.com' };
    const mockUser2 = { id: '2', email: 'attendee2@example.com' };
    const usersService = require('../services/usersService');
    jest.spyOn(usersService, 'GetUserByIdAsync')
      .mockResolvedValueOnce(mockUser1)
      .mockResolvedValueOnce(mockUser2);

    await EventObserver.notify(event);

    expect(EmailService.sendEmail).toHaveBeenCalledTimes(2);
    expect(EmailService.sendEmail).toHaveBeenCalledWith(
      'attendee1@example.com',
      'Event Invitation',
      expect.any(String),
      expect.any(String)
    );
    expect(EmailService.sendEmail).toHaveBeenCalledWith(
      'attendee2@example.com',
      'Event Invitation',
      expect.any(String),
      expect.any(String)
    );
  });

  test('should handle empty attendees list', async () => {
    const event = { id: 'eventId' };
    EventAttendeesRepository.getAttendeesByEventId.mockResolvedValue([]);

    await EventObserver.notify(event);

    expect(EmailService.sendEmail).not.toHaveBeenCalled();
  });

  test('should send confirmation email with QR code', async () => {
    const event = { id: 'eventId', eventName: 'Test Event' };
    const attendee = { id: 'attendeeId', email: 'test@example.com' };
    const eventAttendeeHash = 'testHash';
    const qrCodeBuffer = Buffer.from('test');
    const imageLink = 'https://example.com/qr.png';

    EventAttendeesRepository.getEventAttendeeHashAsync.mockResolvedValue(eventAttendeeHash);
    jest.spyOn(EventObserver, 'generateQrCodeAndSave').mockResolvedValue(qrCodeBuffer);
    uploadService.uploadQrCodeToS3.mockResolvedValue(imageLink);

    await EventObserver.notifyConfirmation(event, attendee);

    expect(EmailService.sendEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Event Check In QR CODE',
      expect.stringContaining(imageLink),
      expect.stringContaining(imageLink)
    );
  });

  test('should not send confirmation email when no hash found', async () => {
    const event = { id: 'eventId', eventName: 'Test Event' };
    const attendee = { id: 'attendeeId', email: 'test@example.com' };

    EventAttendeesRepository.getEventAttendeeHashAsync.mockResolvedValue(null);

    await EventObserver.notifyConfirmation(event, attendee);

    expect(EmailService.sendEmail).not.toHaveBeenCalled();
  });

  test('should send update emails to all attendees', async () => {
    const event = { 
      id: 'eventId', 
      eventName: 'Test Event',
      eventDate: '2024-01-01',
      eventTimeStart: '10:00',
      eventTimeEnd: '11:00'
    };
    const attendees = [
      { attendeeId: '1' },
      { attendeeId: '2' }
    ];

    EventAttendeesRepository.getAttendeesByEventId.mockResolvedValue(attendees);
    const usersService = require('../services/usersService');
    usersService.GetUserByIdAsync
      .mockResolvedValueOnce({ email: 'user1@example.com' })
      .mockResolvedValueOnce({ email: 'user2@example.com' });

    await EventObserver.notifyUpdate(event);

    expect(EmailService.sendEmail).toHaveBeenCalledTimes(2);
    expect(EmailService.sendEmail).toHaveBeenCalledWith(
      'user1@example.com',
      'Event Invitation',
      expect.stringContaining('has been updated'),
      expect.stringContaining('have been updated')
    );
  });

  test('should handle errors in notifyUpdate', async () => {
    const event = { id: 'eventId' };
    const error = new Error('Test error');
    EventAttendeesRepository.getAttendeesByEventId.mockRejectedValue(error);

    await expect(EventObserver.notifyUpdate(event)).rejects.toThrow(error);
  });

  test('should generate QR code', async () => {
    const eventHash = 'testHash';
    const qrCodeDataUrl = 'data:image/png;base64,test';
    qrcode.toDataURL.mockResolvedValue(qrCodeDataUrl);

    const result = await EventObserver.generateQrCode(eventHash);
    expect(result).toBe(qrCodeDataUrl);
  });

  test('should handle QR code generation error', async () => {
    const eventHash = 'testHash';
    const error = new Error('QR Code generation failed');
    qrcode.toDataURL.mockRejectedValue(error);

    await expect(EventObserver.generateQrCode(eventHash)).rejects.toThrow(error);
  });

  test('should generate and save QR code as buffer', async () => {
    const eventHash = 'testHash';
    const qrCodeDataUrl = 'data:image/png;base64,test';
    jest.spyOn(EventObserver, 'generateQrCode').mockResolvedValue(qrCodeDataUrl);

    const result = await EventObserver.generateQrCodeAndSave(eventHash);
    expect(Buffer.isBuffer(result)).toBeTruthy();
  });
});