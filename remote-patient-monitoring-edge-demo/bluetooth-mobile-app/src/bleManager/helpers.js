/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import {PermissionsAndroid} from 'react-native';
import {OMRON_DEVICE_NAME_STRING} from './constants';
import {stopBleScan, getDeviceModel} from './bleManager';
import {DateTime} from 'luxon';

export const requestLocationPermission = async () => {
  const locationPermissionIsGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (locationPermissionIsGranted) {
    console.log('Location Permission is OK.');
    return true;
  } else {
    const permissionStatus = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (permissionStatus) {
      console.log('Location permission granted.');
      return true;
    } else {
      console.log('Location permission denied.');
      return false;
    }
  }
};

const isOmronDevice = (deviceName) => {
  if (!deviceName) {
    return false;
  }
  return deviceName.includes(OMRON_DEVICE_NAME_STRING);
};

export const isPeripheralOmronDevice = (peripheral) => {
  if (!peripheral || !peripheral.advertising) {
    console.log('Peripheral is null.');
    return false;
  }
  const advertisedName = peripheral.advertising.localName || '';

  if (isOmronDevice(advertisedName)) {
    console.log('OMRON Found: ', peripheral);
    return true;
  }

  return false;
};

export const parseBPCharacteristic = (data) => {
  try {
    const systolicBP = data.value[1];
    const diastolicBP = data.value[3];
    const heartRate = data.value[14];
    const month = data.value[9];
    const day = data.value[10];
    const hour = data.value[11];
    const minute = data.value[12];
    const second = data.value[13];

    const timeOfReading = {
      month,
      day,
      hour,
      minute,
      second,
      millisecond: 0,
    };
    const localTime = DateTime.local().set(timeOfReading);
    const todayReadingIsoDate = localTime.toISO();

    return {
      systolicBP,
      diastolicBP,
      heartRate,
      timeOfReading: todayReadingIsoDate,
    };
  } catch (e) {
    console.error('Error in parseBPCharacteristic(): ', e);
    return null;
  }
};

export const parseDiscoveredPeripheral = async (peripheral) => {
  try {
    const peripheralIsOmron = isPeripheralOmronDevice(peripheral);

    if (!peripheralIsOmron) {
      return null;
    }
    await stopBleScan();

    const deviceModel = await getDeviceModel(peripheral.id);
    const data = {
      advertisedName: peripheral.advertising.localName,
      model: deviceModel,
      id: peripheral.id,
    };

    return data;
  } catch (e) {
    console.error('ERROR parseDiscoveredPeripheral(). ', e);
  }
};
