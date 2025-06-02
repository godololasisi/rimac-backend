"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const eventBridge = new aws_sdk_1.EventBridge();
const handler = async (event) => {
    for (const record of event.Records) {
        const message = JSON.parse(record.body);
        const { appointmentId, insuredId, scheduleId } = message;
        console.log(`Processing CL appointment ${appointmentId}`);
        // Simular guardado en RDS
        console.log(`Saving appointment ${appointmentId} to RDS (MySQL)...`);
        // Publicar evento en EventBridge
        await eventBridge.putEvents({
            Entries: [
                {
                    Source: 'appointment.cl',
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
exports.handler = handler;
