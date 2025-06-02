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

// src/handlers/appointmentConfirm.ts
var appointmentConfirm_exports = {};
__export(appointmentConfirm_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(appointmentConfirm_exports);
var import_aws_sdk = require("aws-sdk");
var dynamoDb = new import_aws_sdk.DynamoDB.DocumentClient();
var handler = async (event) => {
  for (const record of event.Records) {
    const detail = JSON.parse(record.body);
    const { appointmentId, status } = JSON.parse(detail.Detail);
    console.log(`Updating appointment ${appointmentId} to status: ${status}`);
    await dynamoDb.update({
      TableName: "Appointments",
      Key: { id: appointmentId },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status }
    }).promise();
  }
  return { statusCode: 200 };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=appointmentConfirm.js.map
