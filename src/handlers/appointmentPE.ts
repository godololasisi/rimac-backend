import { SQSEvent } from 'aws-lambda';
import { EventBridge } from 'aws-sdk';

const eventBridge = new EventBridge();

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    const { appointmentId, insuredId, scheduleId } = message;

    console.log(`Processing PE appointment ${appointmentId}`);

    // Simular guardado en RDS
    console.log(`Saving appointment ${appointmentId} to RDS (MySQL)...`);

    // Publicar evento en EventBridge
    await eventBridge.putEvents({
      Entries: [
        {
          Source: 'appointment.pe',
          DetailType: 'AppointmentCompleted',
          Detail: JSON.stringify({
            appointmentId,
            insuredId,
            status: 'completed',
          }),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    }).promise();
  }

  return { statusCode: 200 };
};
