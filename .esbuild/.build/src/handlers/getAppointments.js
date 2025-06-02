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

// src/handlers/getAppointments.ts
var getAppointments_exports = {};
__export(getAppointments_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getAppointments_exports);
var import_aws_sdk = require("aws-sdk");
var isOffline = process.env.IS_OFFLINE === "true";
var dynamoDb = new import_aws_sdk.DynamoDB.DocumentClient({
  endpoint: isOffline ? "http://localhost:8000" : void 0,
  region: "us-east-1",
  accessKeyId: "fakeMyKeyId",
  secretAccessKey: "fakeSecretAccessKey"
});
var handler = async (event) => {
  try {
    const insuredId = event.pathParameters?.insuredId;
    if (!insuredId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing insuredId" }) };
    }
    const result = await dynamoDb.query({
      TableName: "Appointments",
      IndexName: "InsuredIdIndex",
      KeyConditionExpression: "insuredId = :insuredId",
      ExpressionAttributeValues: {
        ":insuredId": insuredId
      }
    }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    };
  } catch (err) {
    console.error("Error in getAppointments handler:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=getAppointments.js.map
