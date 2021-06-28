/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import express, { response } from 'express';
import axios from 'axios';
import serviceBus from "@azure/service-bus";

const { ServiceBusClient } = serviceBus;

const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

const serviceBusClient = new ServiceBusClient(connectionString);

const topicName = "iot-hub-messages";
const subscriptionName = "all-data-sub";
const fhirServerUrl = process.env.FHIR_URL;

const postDataToFhirServer = async rawData => {
  await axios.post(fhirServerUrl, JSON.parse(rawData.data)).then(response => { 
    console.log(`Successful POST to FHIR server for correlationId: ${rawData.correlationId}`);
  }
  ).catch(error => {
    console.error(`Error when POSTing to FHIR server for correlationId: ${rawData.correlationId}. Error: ${error}`);
  });
}

const defaultMessageHandler = async (message) => {
  const messageBody = JSON.stringify(message.body)
  console.log(`Message received with message.body: ${messageBody}`);

  // Wait one second between POSTs to hopefully alleviate FHIR issues.
  await postDataToFhirServer(message.body);
};
const errorHandler = async (args) => {
  console.error(
    `Error occurred with ${args.entityPath} within ${args.fullyQualifiedNamespace}: `,
    args.error
  );
};

var app = express();

app.listen(6000, async () => {
  try {
    console.log(`Connected to service bus client at ${serviceBusClient.fullyQualifiedNamespace}`);
    const dataReceiver = serviceBusClient.createReceiver(topicName, subscriptionName);
    await dataReceiver.subscribe({
      processMessage: defaultMessageHandler,
      processError: errorHandler
    });
  } catch(error) {
    console.error('Error occured while sending! ', error);
    await serviceBusClient.close();
    console.log("Service bus disconnected.");
  }
  
  console.log('Server running on port 6000');
});