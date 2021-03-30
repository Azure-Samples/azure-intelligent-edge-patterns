/* eslint-disable react-hooks/exhaustive-deps */

/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar} from 'react-native';

import {startBleManager} from './bleManager/bleManager';
import {
  addBleListener,
  removeBleListener,
  handleBleStateChange,
  handleDisconnectedPeripheral,
  handleConnect,
} from './bleManager/events';
import {parseDiscoveredPeripheral} from './bleManager/helpers';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {ConnectedDevices} from './screens/ConnectedDevices/ConnectedDevices';
import {PairDevice} from './screens/PairDevice/PairDevice';
import {Pairing} from './screens/Pairing/Pairing';
import {LaunchScreen} from './screens/LaunchScreen/LaunchScreen';
import {Sync} from './screens/Sync/Sync';
import {
  emptyDeviceDataState,
  emptyReadingState,
  bleStatusStates,
} from './utilities/states';

const Stack = createStackNavigator();

const App = () => {
  const [deviceData, setDeviceData] = React.useState(emptyDeviceDataState);
  const [readingToSync, setReadingToSync] = React.useState(emptyReadingState);
  const [lastSyncedReading, setLastSyncedReading] = React.useState(
    emptyReadingState,
  );

  const scanningState = React.useMemo(
    () => ({
      scanning: false,
    }),
    [],
  );

  const [bluetoothStatus, setBluetoothStatus] = React.useState(
    bleStatusStates.READY_TO_PAIR,
  );

  const handleDiscoverPeripheral = async (peripheralData) => {
    const omronDevice = await parseDiscoveredPeripheral(peripheralData);
    if (!omronDevice) {
      return;
    }

    setDeviceData(omronDevice);
    setBluetoothStatus(bleStatusStates.PAIRING_SUCCESS);
    setDeviceData(omronDevice);
  };

  const handleDisconnect = (eventData) => {
    handleDisconnectedPeripheral(eventData);
    setBluetoothStatus(bleStatusStates.DEVICE_DISCONNECTED);
    setDeviceData(emptyDeviceDataState);
  };

  React.useEffect(() => {
    const initializeBleManager = async () => {
      try {
        await startBleManager();

        addBleListener('BleManagerConnectPeripheral', handleConnect);
        addBleListener(
          'BleManagerDiscoverPeripheral',
          async (e) => await handleDiscoverPeripheral(e),
        );
        addBleListener('BleManagerDidUpdateState', handleBleStateChange);
        addBleListener('BleManagerDisconnectPeripheral', handleDisconnect);
      } catch (e) {
        console.log('Error occurred initializing Ble Manager. ', e);
      }
    };

    initializeBleManager();

    return () => {
      console.log('App unmounted. Cleaning up listeners...');
      removeBleListener('BleManagerConnectPeripheral', handleConnect);
      removeBleListener(
        'BleManagerDiscoverPeripheral',
        async (e) => await handleDiscoverPeripheral(e),
      );
      removeBleListener('BleManagerDidUpdateState', handleBleStateChange);
      removeBleListener('BleManagerDisconnectPeripheral', handleDisconnect);
    };
  }, []);

  const screenOptions = {
    title: '',
    headerTitleAlign: 'center',
    headerStyle: {
      backgroundColor: '#142038',
      borderBottomColor: '#64FCEB',
    },
    headerTintColor: '#fff',
    animationEnabled: false,
  };

  const ConnectedDevicesComponent = (props) => (
    <ConnectedDevices deviceData={deviceData} {...props} />
  );

  const StartPairingDeviceComponent = (props) => (
    <PairDevice
      deviceData={deviceData}
      setBluetoothStatus={setBluetoothStatus}
      {...props}
    />
  );

  const PairingDeviceComponent = (props) => (
    <Pairing
      deviceData={deviceData}
      bluetoothStatus={bluetoothStatus}
      setBluetoothStatus={setBluetoothStatus}
      scanningState={scanningState}
      {...props}
    />
  );

  const SyncComponent = (props) => (
    <Sync
      deviceData={deviceData}
      bluetoothStatus={bluetoothStatus}
      setBluetoothStatus={setBluetoothStatus}
      readingToSync={readingToSync}
      setReadingToSync={setReadingToSync}
      lastSyncedReading={lastSyncedReading}
      setLastSyncedReading={setLastSyncedReading}
      {...props}
    />
  );

  return (
    <NavigationContainer>
      <StatusBar hidden />
      <Stack.Navigator>
        <Stack.Screen
          name="Start"
          component={LaunchScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Devices"
          component={ConnectedDevicesComponent}
          options={{...screenOptions, title: 'Connected Devices'}}
        />
        <Stack.Screen
          name="Start Pairing"
          component={StartPairingDeviceComponent}
          options={{...screenOptions, title: 'Pair Device'}}
        />
        <Stack.Screen
          name="Pairing"
          component={PairingDeviceComponent}
          options={{...screenOptions, title: 'Pair Device'}}
        />
        <Stack.Screen
          name="Sync"
          component={SyncComponent}
          options={{...screenOptions, title: 'Sync Blood Pressure'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
