import React from 'react';
import './ConfigurationInfo.style.css';
import { Stack, TextField, IconButton, DefaultButton } from '@fluentui/react';

import { InferenceMode, DeploymentType } from '../../store/project/projectTypes';
import { PartTag, Status as PartTagStatus } from '../PartTag';

type PropsType = {
  cameraNames: string[];
  fps: string;
  partNames: string[];
  sendMessageToCloud: boolean;
  framesPerMin: number;
  needRetraining: boolean;
  accuracyRangeMin: number;
  accuracyRangeMax: number;
  maxImages: number;
  probThreshold: number;
  originProbThreshold: number;
  updateProbThreshold: (value: number) => void;
  saveProbThreshold: () => void;
  SVTCisOpen: boolean;
  SVTCcameraNames: string[];
  SVTCpartNames: string[];
  SVTCthreshold: number;
  protocol: string;
  isLVA: boolean;
  maxPeople: number;
  changeMaxPeople: (value: number) => void;
  saveMaxPeople: () => void;
  inferenceMode: InferenceMode;
  deploymentType: DeploymentType;
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

const getSendVideoTxt = (isOpen, cameras, parts, threshold) => {
  if (isOpen)
    return `Yes - when ${cameras.join(', ')} detect ${parts.join(
      ', ',
    )} above the ${threshold}% confirmation threshold`;
  return 'No';
};

export const ConfigurationInfo: React.FC<PropsType> = (props) => {
  return (
    <Stack tokens={{ childrenGap: 17, padding: 25 }}>
      <h4 style={{ margin: 5 }}>Configuration</h4>
      <Stack horizontal>
        <table>
          <tbody>
            <tr>
              <td>Camera</td>
              <td>
                {props.cameraNames.join(', ')}
                <br />
                <b>{props.fps} fps per camera</b>
              </td>
            </tr>
            {props.deploymentType === 'model' && (
              <>
                <tr>
                  <td>Objects</td>
                  <td>
                    {props.partNames.map((e) => (
                      <PartTag key={e} text={e} status={PartTagStatus.Default} />
                    ))}
                  </td>
                </tr>
                <tr>
                  <td>Confirmation threshold</td>
                  <td>
                    <Stack horizontal>
                      <TextField
                        type="number"
                        value={props.probThreshold?.toString()}
                        onChange={(_, newValue) => props.updateProbThreshold(parseInt(newValue, 10))}
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
              </>
            )}
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>Cloud message</td>
              <td>{getCloudMessageTxt(props.sendMessageToCloud, props.framesPerMin)}</td>
            </tr>
            {props.deploymentType === 'model' && (
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
            )}
            {props.isLVA && (
              <>
                <tr>
                  <td>Send video to cloud</td>
                  <td>
                    {getSendVideoTxt(
                      props.SVTCisOpen,
                      props.SVTCcameraNames,
                      props.SVTCpartNames,
                      props.SVTCthreshold,
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Protocol</td>
                  <td>{props.protocol}</td>
                </tr>
              </>
            )}
            {props.inferenceMode === InferenceMode.CrowdedQueueAlert && (
              <>
                <tr>
                  <td>Max People</td>
                  <td>
                    <Stack horizontal tokens={{ childrenGap: '10px' }}>
                      <TextField
                        type="number"
                        value={props.maxPeople?.toString()}
                        onChange={(_, newValue) => props.changeMaxPeople(parseInt(newValue, 10))}
                        underlined
                        styles={{ root: { display: 'inline-block' } }}
                      />
                      <DefaultButton
                        text="Send"
                        onClick={props.saveMaxPeople}
                        disabled={!Number.isInteger(props.maxPeople)}
                      />
                    </Stack>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </Stack>
    </Stack>
  );
};
