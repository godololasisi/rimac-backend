"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const dynamoDb = new aws_sdk_1.DynamoDB.DocumentClient();
const handler = async (event) => {
    for (const record of event.Records) {
        const detail = JSON.parse(record.body);
        const { appointmentId, status } = JSON.parse(detail.Detail);
        console.log(`Updating appointment ${appointmentId} to status: ${status}`);
        await dynamoDb.update({
            TableName: 'Appointments',
            Key: { id: appointmentId },
            UpdateExpression: 'set #status = :status',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':status': status },
        }).promise();
    }
    return { statusCode: 200 };
};
exports.handler = handler;
