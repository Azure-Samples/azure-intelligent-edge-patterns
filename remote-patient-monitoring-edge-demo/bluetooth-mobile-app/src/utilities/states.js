/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

export const bleStatusStates = {
  READY_TO_PAIR: 'readyToPair',
  PAIRING: 'pairing',
  PAIRING_FAILED: 'pairingFailed',
  PAIRING_SUCCESS: 'pairingSuccess',
  DEVICE_DISCONNECTED: 'deviceDisconnected',
  SYNC_SUCCESS: 'syncSuccess',
  SYNCING: 'syncing',
  READY_TO_SYNC: 'readyToSync',
  SYNC_FAILED: 'syncFailed',
};

export const emptyReadingState = {
  systolicBP: '-',
  diastolicBP: '-',
  heartRate: '-',
  timeOfReading: '-',
};

export const emptyDeviceDataState = {
  advertisedName: null,
  model: null,
  id: null,
};
