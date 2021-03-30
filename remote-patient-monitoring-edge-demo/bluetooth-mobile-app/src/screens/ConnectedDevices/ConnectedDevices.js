/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import 'react-native-gesture-handler';
import React from 'react';
import {ScrollView, View, Text, Image, Pressable } from 'react-native';
import {styles} from './styles';
import {DeviceRow} from '../../components/DeviceRow/DeviceRow';

export const ConnectedDevices = ({navigation, deviceData}) => {
  const buttonStyle = ({pressed}) => [
    {
      backgroundColor: pressed ? 'white' : '#64FCEB',
    },
    styles.wrapperCustom,
  ];

  const deviceInfoArea = deviceData.model ? (
    <View style={styles.deviceRowContainer}>
      <DeviceRow deviceData={deviceData} />
    </View>
  ) : (
    <View style={styles.imageContainer}>
      <Image
        source={require('../../assets/icon-omron-notconnected.png')}
        style={styles.iconNotConnected}
      />
      <Text style={styles.progressText}>You don’t have any connected devices.</Text>
    </View>
  );

  const navigationButton = deviceData.model ? (
    <Pressable onPress={() => navigation.navigate('Sync')} style={buttonStyle}>
      <Text style={styles.buttonText}>Continue</Text>
    </Pressable>
  ) : (
    <Pressable
      onPress={() => navigation.navigate('Start Pairing')}
      style={buttonStyle}>
      <Text style={styles.buttonText}>Pair new OMRON monitor</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.screen} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        {deviceInfoArea}
      </ScrollView>
      <View style={styles.bottomContainer}>
        {navigationButton}
      </View>
    </View>
  );
};
