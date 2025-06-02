"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const dynamoDb = new aws_sdk_1.DynamoDB.DocumentClient();
const handler = async (event) => {
    try {
        const insuredId = event.pathParameters?.insuredId;
        if (!insuredId) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Missing insuredId' }) };
        }
        const result = await dynamoDb.query({
            TableName: 'Appointments',
            IndexName: 'InsuredIdIndex',
            KeyConditionExpression: 'insuredId = :insuredId',
            ExpressionAttributeValues: {
                ':insuredId': insuredId,
            },
        }).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
    }
    catch (err) {
        console.error('Error in getAppointments handler:', err);
        return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
    }
};
exports.handler = handler;
