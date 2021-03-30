/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    padding: 30,
    backgroundColor: '#0A2545',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A2545',
    textAlign: 'center',
  },
  wrapperCustom: {
    borderRadius: 3,
    padding: 12,
  },
  sectionHelloWorld: {
    fontSize: 32,
    fontWeight: '800',
    color: 'yellow',
    textAlign: 'center',
    padding: 40,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    textAlign: 'left',
    paddingBottom: 20,
  },
  screen: {
    width: '100%',
    height: 2,
    backgroundColor: '#64FCEB',
  },
  statusText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    padding: 40,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 20,
    lineHeight: 26,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOmronPairing: {
    width: '60%',
    resizeMode: 'contain',
    height: 240,
    marginTop: 40,
    marginBottom: 20,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 30,
    backgroundColor: '#0A2545',
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 0,
    transform: [{translateY: -180}, {scale: 3.3}],
  },
});

export const continueButtonStyle = ({pressed}) => [
  {
    backgroundColor: pressed ? 'white' : '#64FCEB',
  },
  styles.wrapperCustom,
];
