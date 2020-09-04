import React from 'react';
import './ConfigurationInfo.style.css';
import { Stack } from '@fluentui/react';
import { PartTag, Status as PartTagStatus } from '../PartTag';

type LiveViewInfoProps = {
  cameraName: string;
  partNames: string[];
  sendMessageToCloud: boolean;
  framesPerMin: number;
  accuracyThreshold: number;
  needRetraining: boolean;
  accuracyRangeMin: number;
  accuracyRangeMax: number;
  maxImages: number;
};

const getCloudMessageTxt = (
  sendMessageToCloud: boolean,
  framesPerMin: number,
  accuracyThreshold: number,
): string => {
  if (!sendMessageToCloud) return 'No';
  return `Yes - ${framesPerMin} frames per minute, ${accuracyThreshold}% accuracy threshold`;
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

export const ConfigurationInfo: React.FC<LiveViewInfoProps> = (props) => {
  return (
    <Stack horizontal>
      <table>
        <tbody>
          <tr>
            <td>Camera</td>
            <td>{props.cameraName}</td>
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
            <td>Cloud message</td>
            <td>
              {getCloudMessageTxt(props.sendMessageToCloud, props.framesPerMin, props.accuracyThreshold)}
            </td>
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
  );
};
