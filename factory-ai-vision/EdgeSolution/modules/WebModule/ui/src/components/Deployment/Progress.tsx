import React, { useState } from 'react';
import Axios from 'axios';
import { useDispatch } from 'react-redux';
import { ProgressIndicator, Stack, Text } from '@fluentui/react';

import { useInterval } from '../../hooks/useInterval';
import { trainFailed, trainSuccess } from '../../store/project/projectActions';
import { getErrorLog } from '../../store/shared/createWrappedAsync';
import { TrainStatus } from '../../constant';

type DeployTrainStatus = Exclude<TrainStatus, 'Success' | 'Failed' | 'No change' | 'ok'>;

const TrainingStatus: Record<DeployTrainStatus, number> = {
  'Finding project': 10,
  'Uploading project': 20,
  'Uploading parts': 30,
  'Uploading images': 40,
  'Preparing training task': 50,
  'Preparing custom vision environment': 60,
  Training: 70,
  Exporting: 80,
  Deploying: 90,
};

export const Progress: React.FC<{ projectId: number; cameraId: number }> = ({ projectId, cameraId }) => {
  const [trainingInfo, setTrainingInfo] = useState<{ progress: number; log: string }>({
    progress: null,
    log: '',
  });
  const dispatch = useDispatch();

  useInterval(() => {
    Axios.get(`/api/part_detections/${projectId}/export?camera_id=${cameraId}`)
      .then(({ data }) => {
        if (data.status === 'failed') throw new Error(data.log);
        else if (data.status === 'ok' || data.status === 'demo ok') dispatch(trainSuccess());
        else setTrainingInfo({ progress: TrainingStatus[data.status], log: data.log });
        return void 0;
      })
      .catch((err) => {
        dispatch(trainFailed());
        alert(getErrorLog(err));
      });
  }, 5000);

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <Stack horizontalAlign="center" verticalAlign="center" grow tokens={{ childrenGap: 24 }}>
        <Stack horizontalAlign="center" tokens={{ childrenGap: 5 }}>
          {typeof trainingInfo.progress === 'number' && (
            <>
              <Text variant="xxLarge">{`${trainingInfo.progress}%`}</Text>
              <Text>{trainingInfo.log}</Text>
            </>
          )}
        </Stack>
        <ProgressIndicator
          barHeight={4}
          styles={{ root: { width: '600px' } }}
          percentComplete={trainingInfo.progress !== null ? trainingInfo.progress / 100 : null}
        />
      </Stack>
    </Stack>
  );
};
