/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import 'react-native-gesture-handler';
import React from 'react';
import {View, Text, ImageBackground, Image, Pressable} from 'react-native';
import {styles} from './styles';

export const LaunchScreen = ({navigation, route}) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/launchscreen-background.png')}
        style={styles.launchScreenBackground}>
        <Image
          source={require('../../assets/btconnect-app-logo.png')}
          style={styles.logo}
        />
        <Pressable
          accessibilityLabel="Continue to the next screen"
          onPress={() => navigation.navigate('Devices')}
          style={({pressed}) => [
            {
              backgroundColor: pressed ? 'white' : '#64FCEB',
            },
            styles.wrapperCustom,
          ]}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </ImageBackground>
    </View>
  );
};
