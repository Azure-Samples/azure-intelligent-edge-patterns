import React from 'react';
import './ConfigurationInfo.style.css';
import { Stack, TextField, IconButton } from '@fluentui/react';
import { PartTag, Status as PartTagStatus } from '../PartTag';
import { getFPSPerCamera } from '../../utils/getCameraFPS';

type ConfigurationInfoProps = {
  cameraNames: string[];
  fps: number;
  partNames: string[];
  sendMessageToCloud: boolean;
  framesPerMin: number;
  needRetraining: boolean;
  accuracyRangeMin: number;
  accuracyRangeMax: number;
  maxImages: number;
  probThreshold: string;
  originProbThreshold: string;
  updateProbThreshold: (string) => void;
  saveProbThreshold: () => void;
};

const getCloudMessageTxt = (sendMessageToCloud: boolean, framesPerMin: number): string => {
  if (!sendMessageToCloud) return 'No';
  return `Yes - ${framesPerMin} frames per minute.`;
};

const getRetrainingTxt = (
  needRetraining: boolean,
  accuracyRangeMin: number,
  accuracyRangeMax: number,
  maxImages: number,
): string => {
  if (!needRetraining) return 'No';
  return `Yes - ${maxImages} images in the ${accuracyRangeMin}-${accuracyRangeMax}% accuracy range`;
};

export const ConfigurationInfo: React.FC<ConfigurationInfoProps> = (props) => {
  return (
    <>
      <h4 style={{ margin: 5 }}>Configuration</h4>
      <Stack horizontal>
        <table>
          <tbody>
            <tr>
              <td>Camera</td>
              <td>
                {props.cameraNames.join(', ')}
                <br />
                <b>
                  {props.fps} fps in total ({getFPSPerCamera(props.fps, props.cameraNames.length)} fps per
                  camera)
                </b>
              </td>
            </tr>
            <tr>
              <td>Objects</td>
              <td>
                {props.partNames.map((e) => (
                  <PartTag key={e} text={e} status={PartTagStatus.Default} />
                ))}
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>Confirmation threshold</td>
              <td>
                <Stack horizontal>
                  <TextField
                    type="number"
                    value={props.probThreshold}
                    onChange={(_, newValue) => props.updateProbThreshold(newValue)}
                    underlined
                    suffix="%"
                    styles={{ root: { display: 'inline-block' } }}
                  />
                  <IconButton
                    disabled={props.originProbThreshold === props.probThreshold}
                    iconProps={{ iconName: 'Save' }}
                    onClick={props.saveProbThreshold}
                  />
                </Stack>
              </td>
            </tr>
            <tr>
              <td>Cloud message</td>
              <td>{getCloudMessageTxt(props.sendMessageToCloud, props.framesPerMin)}</td>
            </tr>
            <tr>
              <td>Capture retraining images</td>
              <td>
                {getRetrainingTxt(
                  props.needRetraining,
                  props.accuracyRangeMin,
                  props.accuracyRangeMax,
                  props.maxImages,
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </Stack>
    </>
  );
};
