import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey',
  sslEnabled: false,
});

const params = {
  TableName: 'Appointments',
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'insuredId', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'InsuredIdIndex',
      KeySchema: [
        { AttributeName: 'insuredId', KeyType: 'HASH' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

async function createTable() {
  try {
    const result = await dynamoDb.createTable(params).promise();
    console.log('Tabla creada con éxito:', result.TableDescription?.TableName);
  } catch (error: any) {
    if (error.code === 'ResourceInUseException') {
      console.log('La tabla ya existe');
    } else {
      console.error('Error creando la tabla:', error);
    }
  }
}

createTable();
