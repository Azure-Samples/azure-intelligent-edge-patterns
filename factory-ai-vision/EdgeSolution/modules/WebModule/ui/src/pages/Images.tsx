import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown, IDropdownOption, Stack } from '@fluentui/react';

// import { selectNonDemoProject, pullCVProjects } from '../store/trainingProjectSlice';
// import { State as RootState } from 'RootStateType';
import { trainingProjectIsPredictionModelFactory } from '../store/trainingProjectSlice';

import { Images as ImagesComponent } from '../components/Images/Images';
import { EmptyAddIcon } from '../components/EmptyAddIcon';

export const Images: React.FC = () => {
  const trainingProjectIsPredictionModelSelector = trainingProjectIsPredictionModelFactory();
  const trainingProjectIsPredictionModel = useSelector(trainingProjectIsPredictionModelSelector);

  console.log('trainingProjectIsPredictionModel', trainingProjectIsPredictionModel);

  const [selectedProject, setSelectedProject] = useState<number>(0);

  console.log('selectedProject', selectedProject);

  const projectsOptions: IDropdownOption[] = trainingProjectIsPredictionModel.map(({ id, name }) => ({
    key: id,
    text: name,
  }));

  return (
    <>
      {!selectedProject ? (
        <Stack styles={{ root: { height: '100%' } }}>
          <EmptyAddIcon
            title="Select Model"
            subTitle=""
            node={
              <Dropdown
                styles={{ dropdown: { width: '400px' } }}
                options={projectsOptions}
                onChange={(_, option: IDropdownOption) => setSelectedProject(option.key as number)}
              />
            }
          />
        </Stack>
      ) : (
        <ImagesComponent selectedProject={selectedProject} />
      )}
    </>
  );
};
