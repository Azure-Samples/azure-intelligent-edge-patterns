/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import 'react-native-gesture-handler';
import React from 'react';
import {View, Text, Image} from 'react-native';
import {styles} from './styles';

export const DeviceRow = ({navigation, deviceData}) => {
  return (
    <View style={styles.rowContainer}>
      <Image
        source={require('../../assets/icon-omron-mini.png')}
        style={styles.iconNotConnected}
      />
      {deviceData && (
        <View style={styles.textContainer}>
          <Text style={styles.modelText}>{deviceData.model}</Text>
          <Text style={styles.deviceIdentifierText}>
            {deviceData.advertisedName}
          </Text>
        </View>
      )}
    </View>
  );
};
