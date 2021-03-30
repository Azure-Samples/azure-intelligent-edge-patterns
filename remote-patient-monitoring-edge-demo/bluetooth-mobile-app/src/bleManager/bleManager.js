/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import BleManager from 'react-native-ble-manager';
import {Buffer} from 'buffer';
import {
  BLOOD_PRESSURE_MEASUREMENT_UUID,
  BLOOD_PRESSURE_SERVICE_UUID,
} from './constants';

export const startBleManager = async () => {
  try {
    await BleManager.start({showAlert: false});
    console.log('BLEManager started.');
  } catch (e) {
    console.log('ERROR starting BleManager - start failed. ', e);
  }
};

export const stopBleScan = async () => {
  try {
    await BleManager.stopScan();
    console.log('SCAN STOPPED.');
  } catch (e) {
    console.log('Error stopping scan... ', e);
  }
};

export const startBleScan = async () => {
  try {
    console.log('Scanning...');
    await BleManager.scan([], 5, false);
  } catch (e) {
    console.error('ERROR scanning: ', e);
  }
};

export const getDeviceModel = async (peripheralId) => {
  if (!peripheralId) {
    console.log('Peripheral id is null.');
    return;
  }
  try {
    await BleManager.connect(peripheralId);
    const services = await BleManager.retrieveServices(peripheralId);

    const charIsReadable = (c) => Object.keys(c.properties).includes('Read');
    const readableChars = services.characteristics.filter(charIsReadable);

    const omronModelChar = readableChars[0];
    const omronModelCharReadData = await BleManager.read(
      peripheralId,
      omronModelChar.service,
      omronModelChar.characteristic,
    );

    const buff = Buffer.from(omronModelCharReadData, 'base64');
    return 'OMRON ' + buff.toString('ascii');
  } catch (e) {
    console.log('Error retrieving device model: ', e);
  }
};

export const pairDevice = async (peripheralId) => {
  if (!peripheralId) {
    console.log(
      'No peripheral id - check if the device is turned on and in bluetooth mode.',
    );
  }
  try {
    await BleManager.connect(peripheralId);
    await BleManager.createBond(peripheralId);

    console.log('BOND SUCCESSFUL OR ALREADY EXISTS');

    return true;
  } catch (e) {
    console.log('CREATING BOND FAILED', e);
    return false;
  }
};

export const checkBleState = () => {
  BleManager.checkState();
};

export const syncBPMeasurements = async (peripheralId) => {
  try {
    console.log('Starting Notification for ', peripheralId);
    await BleManager.startNotification(
      peripheralId,
      BLOOD_PRESSURE_SERVICE_UUID,
      BLOOD_PRESSURE_MEASUREMENT_UUID,
    );

    console.log('NOTIFICATION STARTED');
  } catch (e) {
    console.log('ERROR start notification', e);
  }
};

export const checkIfDeviceConnected = async (peripheralId) => {
  if (!peripheralId) {
    console.log('No Peripheral Id provided for checkIfDeviceConnected.');
    return;
  }
  try {
    return await BleManager.isPeripheralConnected(peripheralId, []);
  } catch (e) {
    console.error(
      'Error checking connection for peripheral: ' + peripheralId,
      e,
    );
  }
};

export const disconnectBleDevice = async (peripheralId) => {
  if (!peripheralId) {
    console.log('No Peripheral ID provided for disconnectDevice()');
    return;
  }
  await BleManager.disconnect(peripheralId);
};
