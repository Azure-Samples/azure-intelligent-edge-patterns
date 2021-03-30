/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  textContainer: {
    flex: 2,
    marginLeft: 20,
  },
  screen: {
    width: '100%',
    height: 2,
    backgroundColor: '#64FCEB',
  },
  modelText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'left',
  },
  deviceIdentifierText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'left',
  },
  statusText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    padding: 40,
  },
  iconNotConnected: {
    width: '20%',
    resizeMode: 'contain',
    height: 80,
    display: 'flex',
  },
});
