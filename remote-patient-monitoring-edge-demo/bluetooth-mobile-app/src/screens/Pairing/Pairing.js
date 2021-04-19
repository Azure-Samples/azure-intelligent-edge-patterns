/* eslint-disable react-hooks/exhaustive-deps */

/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import 'react-native-gesture-handler';
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {styles, continueButtonStyle} from './styles';
import {
  checkIfDeviceConnected,
  startBleScan,
  stopBleScan,
} from '../../bleManager/bleManager';
import {requestLocationPermission} from '../../bleManager/helpers';
import {bleStatusStates} from '../../utilities/states';
import {getPairingScreenText, getPairingScreenIcon} from './helpers';

export const Pairing = ({
  navigation,
  deviceData,
  bluetoothStatus,
  setBluetoothStatus,
  scanningState,
}) => {
  const scanForDevices = async (deviceDataState) => {
    console.log(
      'Is Device connected? ',
      checkIfDeviceConnected(deviceDataState.id),
    );
    if (deviceDataState.model) {
      scanningState.scanning = false;
      setBluetoothStatus(bleStatusStates.PAIRING_SUCCESS);
      return;
    }
    const permission = await requestLocationPermission();
    if (permission) {
      scanningState.scanning = true;
      setBluetoothStatus(bleStatusStates.PAIRING);
      await startBleScan();
    } else {
      setBluetoothStatus(bleStatusStates.PAIRING_FAILED);
    }
  };

  React.useEffect(() => {
    console.log('PAIRING MOUNTED');
    const scan = async () => {
      console.log('Pairing mounted. Calling scanForDevices.');
      await scanForDevices(deviceData);
    };

    const scanTimeout = setTimeout(() => {
      if (scanningState.scanning) {
        stopBleScan();
        setBluetoothStatus(bleStatusStates.PAIRING_FAILED);
      }
    }, 10000);

    if (
      bluetoothStatus === bleStatusStates.READY_TO_PAIR ||
      bluetoothStatus === bleStatusStates.PAIRING
    ) {
      scan();
    }

    return () => {
      clearTimeout(scanTimeout);
    };
  }, [bluetoothStatus]);

  return (
    <View style={styles.container}>
      <View style={styles.screen} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image
            source={getPairingScreenIcon(bluetoothStatus)}
            style={styles.iconOmronPairing}
          />
          {bluetoothStatus === bleStatusStates.PAIRING && (
            <ActivityIndicator
              size="large"
              color="#64FCEB"
              style={styles.activityIndicator}
            />
          )}
        </View>
        <Text style={styles.progressText}>
          {getPairingScreenText(bluetoothStatus, deviceData)}
        </Text>
      </ScrollView>
      <View style={styles.bottomContainer}>
        {bluetoothStatus === bleStatusStates.PAIRING_SUCCESS && (
          <Pressable
            accessibilityLabel="Go to sync screen"
            onPress={() => navigation.navigate('Sync')}
            style={continueButtonStyle}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        )}
        {(bluetoothStatus === bleStatusStates.DEVICE_DISCONNECTED ||
          bluetoothStatus === bleStatusStates.PAIRING_FAILED) && (
          <Pressable
            accessibilityLabel="Retry"
            onPress={() => scanForDevices(deviceData)}
            style={continueButtonStyle}>
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};
