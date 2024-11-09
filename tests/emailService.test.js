const EmailService = require('../services/emailService');
const { SESClient } = require('@aws-sdk/client-ses');
const logger = require('../utils/logger');

// Mock the AWS SDK and logger
jest.mock('@aws-sdk/client-ses');
jest.mock('../utils/logger');

describe('EmailService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('should send email successfully', async () => {
        // Mock successful email sending
        SESClient.prototype.send.mockResolvedValue({});

        const to = 'test@example.com';
        const subject = 'Test Subject';
        const textBody = 'Test text body';
        const htmlBody = '<p>Test HTML body</p>';

        await EmailService.sendEmail(to, subject, textBody, htmlBody);

        // Verify SES was called with correct parameters
        expect(SESClient.prototype.send).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(`Email sent to ${to}`);
    });

    test('should handle email sending error', async () => {
        // Mock email sending error
        const error = new Error('Failed to send email');
        SESClient.prototype.send.mockRejectedValue(error);

        const to = 'test@example.com';
        const subject = 'Test Subject';
        const textBody = 'Test text body';
        const htmlBody = '<p>Test HTML body</p>';

        await EmailService.sendEmail(to, subject, textBody, htmlBody);

        // Verify error was logged
        expect(logger.error).toHaveBeenCalledWith(`Error sending email: ${error}`);
    });
});
