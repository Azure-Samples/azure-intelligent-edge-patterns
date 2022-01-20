/* eslint-disable react-hooks/exhaustive-deps */

/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import 'react-native-gesture-handler';
import React from 'react';
import {ScrollView, View, Text, Image, Pressable} from 'react-native';
import {bleStatusStates} from '../../utilities/states';
import {styles} from './styles';

export const PairDevice = ({navigation, setBluetoothStatus}) => {
  const buttonStyle = ({pressed}) => [
    {
      backgroundColor: pressed ? 'white' : '#64FCEB',
    },
    styles.wrapperCustom,
  ];

  return (
    <View style={styles.container}>
      <View style={styles.screen} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <Text style={styles.instructionText}>
          While the blood pressure monitor is turned off, tap the{' '}
          <Image
            source={require('../../assets/icon-circle-bt.png')}
            style={styles.circleBtImage}
          />{' '}
          or{' '}
          <Image
            source={require('../../assets/icon-circle-clock.png')}
            style={styles.circleClockImage}
          />{' '}
          button once. You should see a flashing “o” and a Bluetooth icon on
          your blood pressure monitor's screen.
        </Text>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/icon-circle-o.png')}
            style={styles.iconCircleLetter}
          />
        </View>
        <Text style={styles.instructionText}>
          Once your device is ready to pair, tap the “Pair now” button below to
          begin pairing.
        </Text>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Pressable
          onPress={() => {
            setBluetoothStatus(bleStatusStates.PAIRING);
            navigation.navigate('Pairing');
          }}
          style={buttonStyle}>
          <Text style={styles.buttonText}>Pair now</Text>
        </Pressable>
      </View>
    </View>
  );
};
