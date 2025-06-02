import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB, SNS } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const isOffline = process.env.IS_OFFLINE === 'true';
const dynamoDb = new DynamoDB.DocumentClient({
    endpoint: isOffline ? 'http://localhost:8000' : undefined,
    region: 'us-east-1',
    accessKeyId: 'fakeMyKeyId',
    secretAccessKey: 'fakeSecretAccessKey',
});

const sns = isOffline
  ? {
      publish: async (params: any) => {
        console.log('Mock SNS publish (offline):', JSON.stringify(params));
        return Promise.resolve();
      },
    }
  : new SNS();
  async function publishSNS(snsClient: any, params: any) {
  if (isOffline) {
    return snsClient.publish(params);
  } else {
    return snsClient.publish(params).promise();
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
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

    const appointmentId = uuidv4();
    const createdAt = new Date().toISOString();

    // Guardar en DynamoDB
    console.log('Before DynamoDB Put');
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
    console.log('AFTER DynamoDB PUT (saved successfully)');

    // Elegir el topic SNS
    const topicArn =
      countryISO === 'PE'
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
      await publishSNS(sns, {
      TopicArn: topicArn,
      Message: JSON.stringify({
        appointmentId,
        insuredId,
        scheduleId,
        countryISO,
      }),
    });

    console.log('Appointment processed successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Appointment registered, processing',
        appointmentId,
      }),
    };
  } catch (error) {
    console.error('Error in appointment handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
