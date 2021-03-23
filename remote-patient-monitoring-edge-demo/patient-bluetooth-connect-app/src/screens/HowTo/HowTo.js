/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import 'react-native-gesture-handler';
import React from 'react';
import {ScrollView, View, Text, Pressable } from 'react-native';
import {styles} from './styles';

export const HowTo = ({navigation, deviceData}) => {
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
        <Text style={styles.instructionTitle}>How to record your blood pressure</Text>
        <Text style={styles.instructionText}>Sit in a quiet location with your legs uncrossed and feet flat on the ground.</Text>
        <Text style={styles.instructionText}>Put the arm cuff on your left arm half an inch above your elbow.</Text>
        <Text style={styles.instructionText}>Rest your arm on a stable surface with the arm cuff level with your heart.</Text>
        <Text style={styles.instructionText}>Press the <Text style={{fontWeight: "bold"}}>START/STOP</Text> button on your monitor to start recording.</Text>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Pressable
        onPress={() => navigation.navigate('Sync')}
        style={buttonStyle}>
            <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
};
