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

// src/handlers/appointment.ts
var appointment_exports = {};
__export(appointment_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(appointment_exports);
var import_aws_sdk = require("aws-sdk");

// node_modules/uuid/dist/esm/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/esm/rng.js
var import_crypto = require("crypto");
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    (0, import_crypto.randomFillSync)(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// node_modules/uuid/dist/esm/native.js
var import_crypto2 = require("crypto");
var native_default = { randomUUID: import_crypto2.randomUUID };

// node_modules/uuid/dist/esm/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/handlers/appointment.ts
var isOffline = process.env.IS_OFFLINE === "true";
var dynamoDb = new import_aws_sdk.DynamoDB.DocumentClient({
  endpoint: isOffline ? "http://localhost:8000" : void 0,
  region: "us-east-1",
  accessKeyId: "fakeMyKeyId",
  secretAccessKey: "fakeSecretAccessKey"
});
var sns = isOffline ? {
  publish: async (params) => {
    console.log("Mock SNS publish (offline):", JSON.stringify(params));
    return Promise.resolve();
  }
} : new import_aws_sdk.SNS();
async function publishSNS(snsClient, params) {
  if (isOffline) {
    return snsClient.publish(params);
  } else {
    return snsClient.publish(params).promise();
  }
}
var handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));
  try {
    const body = JSON.parse(event.body || "{}");
    const { insuredId, scheduleId, countryISO } = body;
    console.log("Parsed body:", { insuredId, scheduleId, countryISO });
    if (!insuredId || !scheduleId || !countryISO) {
      console.warn("Missing one or more required fields");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing fields" })
      };
    }
    const appointmentId = v4_default();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    console.log("Before DynamoDB Put");
    await dynamoDb.put({
      TableName: "Appointments",
      Item: {
        id: appointmentId,
        insuredId,
        scheduleId,
        countryISO,
        status: "pending",
        createdAt
      }
    }).promise();
    console.log("AFTER DynamoDB PUT (saved successfully)");
    const topicArn = countryISO === "PE" ? process.env.PERU_TOPIC_ARN : countryISO === "CL" ? process.env.CHILE_TOPIC_ARN : null;
    if (!topicArn) {
      console.error("Invalid countryISO:", countryISO);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid countryISO" })
      };
    }
    console.log(`Publishing to SNS topic: ${topicArn}`);
    await publishSNS(sns, {
      TopicArn: topicArn,
      Message: JSON.stringify({
        appointmentId,
        insuredId,
        scheduleId,
        countryISO
      })
    });
    console.log("Appointment processed successfully");
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Appointment registered, processing",
        appointmentId
      })
    };
  } catch (error) {
    console.error("Error in appointment handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=appointment.js.map
