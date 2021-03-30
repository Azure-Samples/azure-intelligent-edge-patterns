/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import CryptoJS from 'crypto-js';
import axios from 'axios';
import {DEVICE_ID, POLICY_KEY, IOT_HUB_NAME} from '@env';

const IOT_HUB_BASE_URI = `${IOT_HUB_NAME}.azure-devices.net`;
export const sendMessageToIotHub = async (obsBundle) => {
  const token = generateSasToken(POLICY_KEY);
  const config = {
    headers: {
      Authorization: token,
    },
  };

  const url = `https://${IOT_HUB_BASE_URI}/devices/${DEVICE_ID}/messages/events?api-version=2019-07-01-preview`;
  const body = JSON.stringify({data: JSON.stringify(obsBundle)});

  console.log('sending request to iot hub');
  try {
    await axios.post(url, body, config);
    console.log('Message sent to IoTHub.');
  } catch (e) {
    throw new Error('Error Transferring data to IoT Hub.' + e);
  }
};

const generateSasToken = (signingKey) => {
  try {
    let resourceUri = `${IOT_HUB_BASE_URI}`;
    resourceUri = encodeURIComponent(resourceUri);

    const expiresInMins = 60;
    let expiresInSecs = Date.now() / 1000 + expiresInMins * 60;
    expiresInSecs = Math.ceil(expiresInSecs);
    const toSign = resourceUri + '\n' + expiresInSecs;

    const key = CryptoJS.enc.Base64.parse(signingKey);
    const timestamp = CryptoJS.enc.Utf8.parse(toSign);
    const hmac = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(timestamp, key),
    );
    const base64UriEncoded = encodeURIComponent(hmac);

    let token =
      'SharedAccessSignature sr=' +
      resourceUri +
      '&sig=' +
      base64UriEncoded +
      '&se=' +
      expiresInSecs;

    const policyName = 'device';
    token += '&skn=' + policyName;

    return token;
  } catch (e) {
    console.error('ERROR generating token: ', e);
  }
};
