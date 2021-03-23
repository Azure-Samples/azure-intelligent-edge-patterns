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
    height: '100%',
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
    marginBottom: 20,
    marginTop: 40,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'left',
    marginBottom: 25,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'white',
    textAlign: 'left',
    marginBottom: 25,
    lineHeight: 24,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 30,
    backgroundColor: '#0A2545',
  }
});
