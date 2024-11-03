const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const logger = require('../utils/logger');
// const path = require('path');
// const env = process.env.NODE_ENV || 'development';
// const config = require(path.join(__dirname, '../../config/config.json'))[env];
const ses = new SESClient({ 
    region: 'ap-southeast-1',  
    credentials:{
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }, 
});

class EmailService {
    async sendEmail(to, subject, textBody, htmlBody) {
        const params = {
            Destination: { ToAddresses: [to] },
            Message: {
                Body: {
                    Text: { Data: textBody },
                    Html: { Data: htmlBody },
                },
                Subject: { Data: subject },
            },
            Source: 'noreply.eventspark@gmail.com',
        };
        try{
            const command = new SendEmailCommand(params);
            await ses.send(command); //(params).promise();
            logger.info(`Email sent to ${to}`);
        }
        catch(error){
            logger.error(`Error sending email: ${error}`);
        }
    }
}

module.exports = new EmailService();