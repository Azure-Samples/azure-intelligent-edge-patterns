/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import {bleStatusStates} from '../../utilities/states';

export const getPairingScreenText = (bleStatusState, deviceDataState) => {
  switch (bleStatusState) {
    case bleStatusStates.PAIRING_SUCCESS:
      return `Success! Connected to ${deviceDataState.model}.`;
    case bleStatusStates.PAIRING_FAILED:
      return 'There was a problem pairing with the device.  Please make sure the Omron is turned on and in pairing mode, then try again.';
    case bleStatusStates.PAIRING:
      return 'Searching for devices...';
    case bleStatusStates.DEVICE_DISCONNECTED:
      return 'Device is disconnected. Try turning the Omron off and put it back into pairing mode, then press Retry.';
    default:
      return 'Go back to pair your device.';
  }
};

export const getPairingScreenIcon = (bleStatusState) => {
  switch (bleStatusState) {
    case bleStatusStates.PAIRING_SUCCESS:
      return require('../../assets/icon-omron-success.png');
    case bleStatusStates.PAIRING:
      return require('../../assets/icon-omron-pairing-nocircle.png');
    case bleStatusStates.DEVICE_DISCONNECTED:
    case bleStatusStates.PAIRING_FAILED:
      return require('../../assets/icon-omron-fail.png');
    default:
      return require('../../assets/icon-omron-pairing-nocircle.png');
  }
};
