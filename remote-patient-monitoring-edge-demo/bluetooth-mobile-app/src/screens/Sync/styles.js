/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import {StyleSheet} from 'react-native';

export const buttonStyle = ({pressed}) => [
  {
    backgroundColor: pressed ? 'white' : '#64FCEB',
  },
  styles.wrapperCustom,
];

export const styles = StyleSheet.create({
  scrollView: {
    padding: 10,
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
  screen: {
    width: '100%',
    height: 2,
    backgroundColor: '#64FCEB',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  syncTipText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
  },
  bpMeasurementText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#64FCEB',
    textAlign: 'center',
    margin: 10,
  },
  tableText: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'left',
    margin: 10,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOmronSyncing: {
    width: '60%',
    resizeMode: 'contain',
    height: 240,
    marginTop: 40,
    marginBottom: 20,
  },
  iconSyncTips: {
    width: '60%',
    resizeMode: 'contain',
    height: 40,
    marginTop: 0,
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
  readingViewContainer: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  readingLabel: {
    flex: 2,
    alignSelf: 'stretch',
  },
  readingContent: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
