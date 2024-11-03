const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');
console.log('Using AWS access key:', process.env.AWS_ACCESS_KEY_ID);
const s3 = new S3Client({ 
    region: 'ap-southeast-1',  
    credentials:{
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }, 
});

class UploadService {
    async uploadQrCodeToS3(eventAttendeeHash, qrCodeBuffer){
        try{
            logger.info(`uploading qr code to s3: ${eventAttendeeHash}`);
            const s3params = {
                Bucket: 'eventsparkqr',
                Key: `${eventAttendeeHash}.png`,
                Body: qrCodeBuffer,
                ContentType: 'image/png',
                ContentEncoding: 'base64'
            };
            const command = new PutObjectCommand(s3params);
            await s3.send(command);
        
            return `https://eventsparkqr.s3.ap-southeast-1.amazonaws.com/${eventAttendeeHash}.png`;
        }
        catch(error){
            logger.error(`failed to upload qr code to s3: ${error}`);
            throw error;
        }
    }
}

module.exports = new UploadService();