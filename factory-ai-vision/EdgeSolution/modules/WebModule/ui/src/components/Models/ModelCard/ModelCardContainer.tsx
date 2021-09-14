import React from 'react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { TrainingProject } from '../../../store/trainingProjectSlice';
import { selectAllTrainingProjectsStatus } from '../../../store/trainingProjectStatusSlice';

import ModelCard from './ModelCard';

interface Props {
  project: TrainingProject;
  onSelectedProject: () => void;
  onDismiss: () => void;
}

const ModelCardContainer = (props: Props) => {
  const { project, onSelectedProject, onDismiss } = props;

  const statusList = useSelector((state: RootState) => selectAllTrainingProjectsStatus(state));

  const status = statusList.find((status) => status.project === project.id);

  if (!status) return <></>;

  return (
    <ModelCard
      project={project}
      onSelectedProject={onSelectedProject}
      onDismiss={onDismiss}
      status={status}
    />
  );
};

export default ModelCardContainer;
