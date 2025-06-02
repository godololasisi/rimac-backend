import { SQSEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler = async (event: SQSEvent) => {
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
