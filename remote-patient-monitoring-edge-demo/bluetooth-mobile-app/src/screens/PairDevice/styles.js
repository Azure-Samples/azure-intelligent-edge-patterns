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
    lineHeight: 26,
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
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleLetter: {
    width: '60%',
    resizeMode: 'contain',
    height: 100,
    marginBottom: 20,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 30,
    backgroundColor: '#0A2545',
  },
  circleBtImage: {
    width: 28,
    height: 28,
    borderRadius: 12,
  },
  circleClockImage: {
    width: 28,
    height: 28,
    borderRadius: 18,
  },
});
