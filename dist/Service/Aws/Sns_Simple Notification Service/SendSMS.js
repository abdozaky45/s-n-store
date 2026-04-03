"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
const snsClient = new client_sns_1.SNSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
class Sns_service {
    constructor() {
        this.sendSms = async ({ phone, message }) => {
            const command = new client_sns_1.PublishCommand({
                Message: message,
                PhoneNumber: phone,
                MessageAttributes: {
                    "AWS.SNS.SMS.SMSType": {
                        DataType: "String",
                        StringValue: "Transactional",
                    },
                    "AWS.SNS.SMS.SenderID": {
                        DataType: "String",
                        StringValue: process.env.SMS_SENDER_ID_AWS,
                    },
                },
            });
            try {
                const response = await snsClient.send(command);
                console.log("SMS sent successfully:", response);
                return response;
            }
            catch (error) {
                console.error("Error sending SMS:", error);
                throw new Error(`Error sending SMS: ${error.message || 'Unknown error'}`);
            }
        };
    }
}
exports.default = Sns_service;
const sendSMS = async (phone, activeCode) => {
    const aws_s3_service = new Sns_service();
    const sendSms = await aws_s3_service.sendSms({
        phone,
        message: `Your OTP is ${activeCode}. This code is valid for 15 minutes.`,
    });
    return sendSms;
};
exports.sendSMS = sendSMS;
