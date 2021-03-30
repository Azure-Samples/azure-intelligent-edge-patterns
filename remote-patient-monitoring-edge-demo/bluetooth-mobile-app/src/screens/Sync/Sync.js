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
import {buttonStyle, styles} from './styles';
import {syncBPMeasurements} from '../../bleManager/bleManager';
import {sendMessageToIotHub} from '../../utilities/iotHub';
import {buildObservationsFhirBundle} from '../../utilities/fhirHelpers';
import {addBleListener, removeBleListener} from '../../bleManager/events';
import {parseBPCharacteristic} from '../../bleManager/helpers';
import {emptyReadingState, bleStatusStates} from '../../utilities/states';
import {
  areReadingsEqual,
  bpReadingText,
  getSyncScreenIcon,
  getSyncStatusText,
} from './helpers';
import {PATIENT_ID} from '@env';

export const Sync = ({
  navigation,
  deviceData,
  bluetoothStatus,
  setBluetoothStatus,
  readingToSync,
  setReadingToSync,
  lastSyncedReading,
  setLastSyncedReading,
}) => {
  const sendBpReadingToIotHub = async (bpReading) => {
    const patientId = PATIENT_ID;
    try {
      const obsBundle = buildObservationsFhirBundle(patientId, bpReading);
      await sendMessageToIotHub(obsBundle);

      setBluetoothStatus(bleStatusStates.SYNC_SUCCESS);
      setLastSyncedReading(bpReading);
      setReadingToSync(emptyReadingState);
    } catch (e) {
      console.error('Error sendMessageToIotHub(): ', e);
      setBluetoothStatus(bleStatusStates.SYNC_FAILED);
    }
  };

  const handleDidUpdateValueForCharacteristic = async (eventData) => {
    const bpReading = parseBPCharacteristic(eventData);

    if (bpReading) {
      setReadingToSync(bpReading);
      await sendBpReadingToIotHub(bpReading);
    } else {
      setBluetoothStatus(bleStatusStates.SYNC_FAILED);
    }
  };

  React.useEffect(() => {
    addBleListener(
      'BleManagerDidUpdateValueForCharacteristic',
      handleDidUpdateValueForCharacteristic,
    );

    return () => {
      console.log('Sync UNMOUNTED. cleaning up listeners...');
      removeBleListener(
        'BleManagerDidUpdateValueForCharacteristic',
        handleDidUpdateValueForCharacteristic,
      );
    };
  }, []);

  const onSyncBPRecordingsPress = async (peripheralId) => {
    if (!peripheralId) {
      setBluetoothStatus(bleStatusStates.PAIRING_FAILED);
      console.log(
        'Cannot sync: No Device Connected.  Please make sure the device is paired.',
      );
      return;
    }

    try {
      setBluetoothStatus(bleStatusStates.SYNCING);

      const readingToSyncAndLastSyncedAreDifferent = !areReadingsEqual(
        readingToSync,
        lastSyncedReading,
      );
      const readingToSyncIsEmpty = areReadingsEqual(
        readingToSync,
        emptyReadingState,
      );
      const lastSyncedReadingIsEmpty = areReadingsEqual(
        lastSyncedReading,
        emptyReadingState,
      );
      const thisIsTheFirstReadingTaken =
        readingToSyncIsEmpty && lastSyncedReadingIsEmpty;

      if (
        thisIsTheFirstReadingTaken ||
        (readingToSyncIsEmpty && !lastSyncedReadingIsEmpty)
      ) {
        await syncBPMeasurements(peripheralId);
      } else if (
        !readingToSyncIsEmpty &&
        readingToSyncAndLastSyncedAreDifferent
      ) {
        await sendBpReadingToIotHub(readingToSync);
      } else {
        console.log('skipping sync');
      }
    } catch (e) {
      console.error('Error syncing measurements: ', e);
      setBluetoothStatus(bleStatusStates.SYNC_FAILED);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screen} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image
            source={getSyncScreenIcon(
              bluetoothStatus,
              readingToSync,
              lastSyncedReading,
            )}
            style={styles.iconOmronSyncing}
          />
          {bluetoothStatus === bleStatusStates.SYNCING && (
            <ActivityIndicator
              size="large"
              color="#64FCEB"
              style={styles.activityIndicator}
            />
          )}
        </View>
        <Text style={styles.syncTipText}>
          {getSyncStatusText(bluetoothStatus, readingToSync, lastSyncedReading)}
        </Text>

        <View style={styles.readingViewContainer}>
          <View style={styles.readingLabel}>
            <Text style={styles.tableText}>Blood Pressure</Text>
          </View>
          <View style={styles.readingContent}>
            <Text style={styles.bpMeasurementText}>
              {`${bpReadingText(
                'systolicBP',
                readingToSync,
                lastSyncedReading,
              )}/${bpReadingText(
                'diastolicBP',
                readingToSync,
                lastSyncedReading,
              )}`}
            </Text>
          </View>
        </View>
        <View style={styles.readingViewContainer}>
          <View style={styles.readingLabel}>
            <Text style={styles.tableText}>Heart Rate</Text>
          </View>
          <View style={styles.readingContent}>
            <Text style={styles.bpMeasurementText}>
              {bpReadingText('heartRate', readingToSync, lastSyncedReading)}
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Pressable
          onPress={() => onSyncBPRecordingsPress(deviceData.id)}
          style={buttonStyle}>
          <Text style={styles.buttonText}>Sync blood pressure recordings</Text>
        </Pressable>
      </View>
    </View>
  );
};
