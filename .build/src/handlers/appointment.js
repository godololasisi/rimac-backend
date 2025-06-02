"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const dynamoDb = new aws_sdk_1.DynamoDB.DocumentClient();
const sns = new aws_sdk_1.SNS();
const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event));
    try {
        const body = JSON.parse(event.body || '{}');
        const { insuredId, scheduleId, countryISO } = body;
        console.log('Parsed body:', { insuredId, scheduleId, countryISO });
        if (!insuredId || !scheduleId || !countryISO) {
            console.warn('Missing one or more required fields');
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing fields' }),
            };
        }
        const appointmentId = (0, uuid_1.v4)();
        const createdAt = new Date().toISOString();
        // Guardar en DynamoDB
        console.log('Saving appointment in DynamoDB');
        await dynamoDb
            .put({
            TableName: 'Appointments',
            Item: {
                id: appointmentId,
                insuredId,
                scheduleId,
                countryISO,
                status: 'pending',
                createdAt,
            },
        })
            .promise();
        // Elegir el topic SNS
        const topicArn = countryISO === 'PE'
            ? process.env.PERU_TOPIC_ARN
            : countryISO === 'CL'
                ? process.env.CHILE_TOPIC_ARN
                : null;
        if (!topicArn) {
            console.error('Invalid countryISO:', countryISO);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid countryISO' }),
            };
        }
        // Publicar en SNS
        console.log(`Publishing to SNS topic: ${topicArn}`);
        await sns
            .publish({
            TopicArn: topicArn,
            Message: JSON.stringify({
                appointmentId,
                insuredId,
                scheduleId,
                countryISO,
            }),
        })
            .promise();
        console.log('Appointment processed successfully');
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Appointment registered, processing',
                appointmentId,
            }),
        };
    }
    catch (error) {
        console.error('Error in appointment handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
