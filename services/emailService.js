const AWS = require('aws-sdk')
const ses = new AWS.SES({ region: 'ap-southeast-1' });

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

        return ses.sendEmail(params).promise();
    }
}

module.exports = new EmailService();