const UploadService = require('../services/uploadService');
const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');
const sequelize = require('../db/models/index').sequelize;

// Mock the AWS SDK and logger
jest.mock('@aws-sdk/client-s3');
jest.mock('../utils/logger');
jest.mock('../db/models/index', () => ({
    sequelize: {
      transaction: jest.fn()
    },
    Users: jest.fn(),  // Changed this line to avoid circular dependency
    Events: jest.fn(),
  }));
describe('UploadService', () => {
    let mockTransaction;

    beforeEach(() => {
        mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn(),
          };
        sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('should upload QR code to S3 successfully', async () => {
        // Mock successful S3 upload
        S3Client.prototype.send.mockResolvedValue({});

        const eventAttendeeHash = 'test123';
        const qrCodeBuffer = Buffer.from('fake-qr-code');

        const result = await UploadService.uploadQrCodeToS3(eventAttendeeHash, qrCodeBuffer);

        // Verify S3 was called with correct parameters
        expect(S3Client.prototype.send).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(`uploading qr code to s3: ${eventAttendeeHash}`);
        expect(result).toBe(`https://eventsparkqr.s3.ap-southeast-1.amazonaws.com/${eventAttendeeHash}.png`);
    });

    test('should handle S3 upload error', async () => {
        // Mock S3 upload error
        const error = new Error('Failed to upload to S3');
        S3Client.prototype.send.mockRejectedValue(error);

        const eventAttendeeHash = 'test123';
        const qrCodeBuffer = Buffer.from('fake-qr-code');

        await expect(UploadService.uploadQrCodeToS3(eventAttendeeHash, qrCodeBuffer))
            .rejects.toThrow(error);

        // Verify error was logged
        expect(logger.error).toHaveBeenCalledWith(`failed to upload qr code to s3: ${error}`);
    });
});
