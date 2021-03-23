/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import {NativeEventEmitter, NativeModules} from 'react-native';
import {disconnectBleDevice} from './bleManager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export const addBleListener = (eventName, callback) => {
  bleManagerEmitter.addListener(eventName, callback);
};

export const removeBleListener = (eventName, callback) => {
  bleManagerEmitter.removeListener(eventName, callback);
};

export const handleDisconnectedPeripheral = (eventData) => {
  if (eventData) {
    disconnectBleDevice(eventData.peripheral);
    console.log('Disconnected Device: ', eventData);
  } else {
    console.log(
      'Disconnected from device. Unable to call disconnect without a peripheral id.',
    );
  }
};

// handler for ble state change ('on'/'off') - BleManagerDidUpdateState event
export const handleBleStateChange = (event) => {
  console.log('Ble State Changed: ' + event.state);
  return event.state;
};

export const handleConnect = (eventData) => {
  if (!eventData) {
    console.log('BleConnectEvent FIRED');
  } else {
    console.log('BLeConnect EVENT FIRED', JSON.stringify(eventData));
  }
};
