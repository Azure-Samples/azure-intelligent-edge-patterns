import React, { useState } from 'react';
import { Link as RRDLink } from 'react-router-dom';
import { Stack, Text, Link, getTheme } from '@fluentui/react';
import Axios from 'axios';
import { format } from 'date-fns';

import { useInterval } from '../../hooks/useInterval';
import { Status, InferenceMode, DeploymentType } from '../../store/project/projectTypes';

import { ExpandPanel } from '../ExpandPanel';
import { getErrorLog } from '../../store/shared/createWrappedAsync';

const { palette } = getTheme();

type InsightsProps = {
  status: Status;
  projectId: number;
  cameraId: number;
  inferenceMode: InferenceMode;
  countingStartTime: string;
  countingEndTime: string;
  deploymentType: DeploymentType;
};

const normalizeObjectCount = (obj: Record<string, number>): { name: string; value: number }[] =>
  obj ? Object.entries(obj).map((e) => ({ name: e[0], value: e[1] })) : [];

type ScenarioMetrics = { name: string; count: number };
const getNumOfDefects = (scenarioMetric: ScenarioMetrics[]): ScenarioMetrics[] =>
  scenarioMetric.filter((e) => !['all_objects', 'violation'].includes(e.name));

export const Insights: React.FC<InsightsProps> = (props) => {
  const {
    status,
    projectId,
    cameraId,
    inferenceMode,
    countingStartTime,
    countingEndTime,
    deploymentType,
  } = props;

  const [inferenceMetrics, setinferenceMetrics] = useState({
    successRate: 0,
    successfulInferences: 0,
    unIdentifiedItems: 0,
    device: '',
    averageTime: 0,
    objectCounts: [],
    numAccrossLine: 0,
    numOfViolation: 0,
    numOfDefect: [],
  });

  useInterval(
    () => {
      Axios.get(`/api/part_detections/${projectId}/export?camera_id=${cameraId}`)
        .then(({ data }) => {
          setinferenceMetrics({
            successRate: data.success_rate,
            successfulInferences: data.inference_num,
            unIdentifiedItems: data.unidentified_num,
            device: data.device,
            averageTime: data.average_time,
            objectCounts: normalizeObjectCount(data.count),
            numAccrossLine: data.scenario_metrics?.find((e) => e.name === 'all_objects')?.count,
            numOfViolation: data.scenario_metrics?.find((e) => e.name === 'violation')?.count,
            numOfDefect: getNumOfDefects(data.scenario_metrics),
          });
          return void 0;
        })
        .catch((e) => alert(getErrorLog(e)));
    },
    status === Status.StartInference ? 5000 : null,
  );

  return (
    <>
      <Stack
        styles={{ root: { padding: '24px 20px', borderBottom: `solid 1px ${palette.neutralLight}` } }}
        tokens={{ childrenGap: '8px' }}
      >
        <Text styles={{ root: { fontWeight: 'bold' } }}>Success rate</Text>
        <Text styles={{ root: { fontWeight: 'bold', color: palette.greenLight } }}>
          {inferenceMetrics.successRate}%
        </Text>
        <Text>
          {`Running on ${inferenceMetrics.device.toUpperCase()} (accelerated) ${
            Math.round(inferenceMetrics.averageTime * 100) / 100
          } ms`}
        </Text>
        {(inferenceMetrics.device === 'vpu' || inferenceMetrics.device === 'cpu') && (
          <a
            href="https://software.intel.com/content/www/us/en/develop/tools/openvino-toolkit.html"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/icons/openvino_logo.png" style={{ width: '100px' }} />
          </a>
        )}
      </Stack>
      {deploymentType === 'model' && (
        <>
          <Stack
            styles={{ root: { padding: '24px 20px', borderBottom: `solid 1px ${palette.neutralLight}` } }}
            tokens={{ childrenGap: '8px' }}
          >
            <Text styles={{ root: { fontWeight: 'bold' } }}>Successful inferences</Text>
            <Text styles={{ root: { color: palette.neutralSecondary } }}>
              {inferenceMetrics.successfulInferences}
            </Text>
            <ExpandPanel titleHidden="Object" suffix={inferenceMetrics.objectCounts.length.toString()}>
              <Stack tokens={{ childrenGap: 10 }}>
                {inferenceMetrics.objectCounts.map((e) => (
                  <Text key={e.name}>{`${e.name}: ${e.value}`}</Text>
                ))}
                {!!inferenceMetrics.numAccrossLine && (
                  <Text>{`Total number of object pass the line: ${inferenceMetrics.numAccrossLine}`}</Text>
                )}
                {!!inferenceMetrics.numOfViolation && (
                  <Text>{`Number of violation: ${inferenceMetrics.numOfViolation}`}</Text>
                )}
                {!!inferenceMetrics.numOfDefect.length && (
                  <>
                    <Text>{`Number of defect object: `}</Text>
                    {inferenceMetrics.numOfDefect.map((e) => (
                      <Text key={e.name}>
                        {e.name}: {e.count}
                      </Text>
                    ))}
                  </>
                )}
              </Stack>
            </ExpandPanel>
          </Stack>
          <Stack
            styles={{ root: { padding: '24px 20px', borderBottom: `solid 1px ${palette.neutralLight}` } }}
            tokens={{ childrenGap: '8px' }}
          >
            <ExpandPanel
              titleHidden="Unidentified images"
              suffix={inferenceMetrics.unIdentifiedItems?.toString()}
            >
              <Stack horizontal tokens={{ childrenGap: 25 }}>
                <Text variant="mediumPlus" styles={{ root: { color: palette.neutralPrimary } }}>
                  {inferenceMetrics.unIdentifiedItems} images
                </Text>
                <RRDLink to="/images" style={{ textDecoration: 'none' }}>
                  <Link styles={{ root: { textDecoration: 'none' } }}>View in images</Link>
                </RRDLink>
              </Stack>
            </ExpandPanel>
          </Stack>
        </>
      )}
      {inferenceMode === InferenceMode.TotalCustomerCounting &&
        countingStartTime !== '' &&
        countingEndTime !== '' && (
          <Stack
            styles={{ root: { padding: '24px 20px', borderBottom: `solid 1px ${palette.neutralLight}` } }}
            tokens={{ childrenGap: '8px' }}
          >
            <ExpandPanel titleHidden="Time">
              <Stack tokens={{ childrenGap: 15 }}>
                <Text variant="mediumPlus" styles={{ root: { color: palette.neutralPrimary } }}>
                  Start Time : {format(new Date(countingStartTime), 'yyyy/MM/dd H:mm')}
                </Text>
                <span>~</span>
                <Text variant="mediumPlus" styles={{ root: { color: palette.neutralPrimary } }}>
                  End Time : {format(new Date(countingEndTime), 'yyyy/MM/dd H:mm')}
                </Text>
              </Stack>
            </ExpandPanel>
          </Stack>
        )}
    </>
  );
};
