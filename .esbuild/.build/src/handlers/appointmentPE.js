"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handlers/appointmentPE.ts
var appointmentPE_exports = {};
__export(appointmentPE_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(appointmentPE_exports);
var import_aws_sdk = require("aws-sdk");
var eventBridge = new import_aws_sdk.EventBridge();
var handler = async (event) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    const { appointmentId, insuredId, scheduleId } = message;
    console.log(`Processing PE appointment ${appointmentId}`);
    console.log(`Saving appointment ${appointmentId} to RDS (MySQL)...`);
    await eventBridge.putEvents({
      Entries: [
        {
          Source: "appointment.pe",
          DetailType: "AppointmentCompleted",
          Detail: JSON.stringify({
            appointmentId,
            insuredId,
            status: "completed"
          }),
          EventBusName: process.env.EVENT_BUS_NAME
        }
      ]
    }).promise();
  }
  return { statusCode: 200 };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=appointmentPE.js.map
