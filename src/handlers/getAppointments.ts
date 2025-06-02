import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const isOffline = process.env.IS_OFFLINE === 'true';

const dynamoDb = new DynamoDB.DocumentClient({
  endpoint: isOffline ? 'http://localhost:8000' : undefined,
  region: 'us-east-1',
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey',
});

export const handler: APIGatewayProxyHandler = async (event) => {
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
  } catch (err) {
    console.error('Error in getAppointments handler:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};
