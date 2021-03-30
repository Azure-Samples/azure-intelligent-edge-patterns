/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
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
  launchScreenBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    padding: 30,
  },
  logo: {
    width: '100%',
    resizeMode: 'contain',
  },
});
