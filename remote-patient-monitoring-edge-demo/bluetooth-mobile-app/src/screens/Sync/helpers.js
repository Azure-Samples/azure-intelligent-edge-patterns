/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import {bleStatusStates, emptyReadingState} from '../../utilities/states';

export const getSyncScreenIcon = (statusState, lastSyncedReading) => {
  const syncingIcon = '../../assets/icon-omron-syncing-nocircle.png';
  const deviceIcon = '../../assets/icon-omron.png';
  const successIcon = '../../assets/icon-omron-success.png';
  const failureIcon = '../../assets/icon-omron-fail.png';

  const readingToSyncIsNotEmpty = !areReadingsEqual(
    lastSyncedReading,
    emptyReadingState,
  );
  const lastSyncedReadingIsNotEmpty = !areReadingsEqual(
    lastSyncedReading,
    emptyReadingState,
  );

  if (readingToSyncIsNotEmpty) {
    return require(failureIcon);
  }

  if (lastSyncedReadingIsNotEmpty) {
    return require(successIcon);
  }

  switch (statusState) {
    case bleStatusStates.SYNC_SUCCESS:
      return require(successIcon);
    case bleStatusStates.SYNCING:
      return require(syncingIcon);
    case bleStatusStates.SYNC_FAILED:
    case bleStatusStates.DEVICE_DISCONNECTED:
    case bleStatusStates.PAIRING_FAILED:
      return require(failureIcon);
    default:
      return require(deviceIcon);
  }
};

export const getSyncStatusText = (
  statusState,
  readingToSync,
  lastSyncedReading,
) => {
  const lastSyncedReadingIsNotEmpty = !areReadingsEqual(
    lastSyncedReading,
    emptyReadingState,
  );
  const readingToSyncIsNotEmpty = !areReadingsEqual(
    readingToSync,
    emptyReadingState,
  );

  if (statusState === bleStatusStates.SYNCING) {
    return 'Syncing...';
  }

  if (readingToSyncIsNotEmpty) {
    return 'Sync Failed.  There was a problem sending the reading to IoTHub, please check your connection and try again.';
  }

  if (lastSyncedReadingIsNotEmpty) {
    return 'Sync Successful! (To take another reading, please re-pair the Omron device.)';
  }

  const syncInstructions =
    'To sync your blood pressure readings, tap the Sync button below and keep your blood pressure monitor near your phone.';
  switch (statusState) {
    case bleStatusStates.SYNC_SUCCESS:
      return 'Syncing Successful!';
    case bleStatusStates.SYNCING:
      return 'Syncing...';
    case bleStatusStates.READY_TO_SYNC:
    case bleStatusStates.PAIRING_SUCCESS:
      return syncInstructions;
    case bleStatusStates.DEVICE_DISCONNECTED:
      return 'The device has disconnected.  Please make sure you have taken a recent reading and re-pair with the Omron.';
    case bleStatusStates.SYNC_FAILED:
    case bleStatusStates.PAIRING_FAILED:
      return 'Sync failed.  Make sure the device is connected and you have taken a recent reading.  You may need to re-pair with the device (press the back button).';
    default: {
      return syncInstructions;
    }
  }
};

export const areReadingsEqual = (reading1, reading2) => {
  if (!reading1 || !reading2) {
    return false;
  }

  const systolicBPsAreEqual = reading1.systolicBP === reading2.systolicBP;
  const diastolicBPsAreEqual = reading1.diastolicBP === reading2.diastolicBP;
  const heartRatesAreEqual = reading1.heartRate === reading2.heartRate;
  const timeOfReadingsAreEqual =
    reading1.timeOfReading === reading2.timeOfReading;

  return (
    systolicBPsAreEqual &&
    diastolicBPsAreEqual &&
    heartRatesAreEqual &&
    timeOfReadingsAreEqual
  );
};

export const bpReadingText = (key, readingToSync, lastSyncedReading) => {
  return readingToSync[key] !== '-'
    ? readingToSync[key]
    : lastSyncedReading[key];
};
