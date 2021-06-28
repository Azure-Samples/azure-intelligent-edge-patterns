/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { v4 as uuidv4 } from 'uuid';

import mqtt from 'azure-iot-device-mqtt';
import aid from 'azure-iot-device';
import { IBundle_Request } from '@ahryman40k/ts-fhir-types/lib/R4';
import { IOT_HUB_CONNECTION_STRING } from './variables';

const { Client, Message } = aid;

const { Mqtt } = mqtt;

const client = Client.fromConnectionString(IOT_HUB_CONNECTION_STRING, Mqtt);

export const sendObsBundleRequestForPatientToIoT = async (patientGuid: string, obsBundleRequest: IBundle_Request): Promise<string> => {
  const correlationId = uuidv4();
  const message = new Message(
    JSON.stringify({ correlationId, data: JSON.stringify(obsBundleRequest) }),
  );

  console.log(`Sending message for patient ${patientGuid}.`);

  const eventSentSuccessfully = new Promise<string>((resolve, reject) => {
    client.sendEvent(message, (err) => {
      console.log(`Message sent successfully for Patient: ${patientGuid} with CorrelationId: ${correlationId}`);
      resolve('OK');
      if (err) {
        console.error(`Error sending data for ${patientGuid}: ${err.toString()}`);
        reject(new Error(err.message));
      }
    });
  });
  return eventSentSuccessfully;
};
