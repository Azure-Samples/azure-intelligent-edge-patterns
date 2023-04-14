import React from 'react';
import { IDropdownOption } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { customVisionTrainingProjectFactory } from '../../../store/trainingProjectSlice';

import AddCustomVision from './AddCustomVision';

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
}

const AddCustomVisionContainer: React.FC<Props> = (props) => {
  const { isOpen, onDismiss } = props;

  const customVisionProject = useSelector((state: RootState) => state.setting.cvProjects);
  const { selectedProjectInfo } = useSelector((state: RootState) => state.trainingProject);
  const customVisionTrainingProject = useSelector(customVisionTrainingProjectFactory());

  const customVisionProjectOptions: IDropdownOption[] = customVisionProject.map((e) => ({
    key: e.id,
    text: e.name,
    disabled: customVisionTrainingProject.map((cv) => cv.customVisionId).includes(e.id) || !e.exportable,
  }));

  return (
    <AddCustomVision
      isOpen={isOpen}
      onDismiss={onDismiss}
      customVisionProjectOptions={customVisionProjectOptions}
      selectedProjectInfo={selectedProjectInfo}
    />
  );
};

export default AddCustomVisionContainer;
