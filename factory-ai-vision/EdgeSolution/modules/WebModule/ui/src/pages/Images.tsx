import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown, IDropdownOption } from '@fluentui/react';

// import { selectNonDemoProject, pullCVProjects } from '../store/trainingProjectSlice';
import { State as RootState } from 'RootStateType';
import { selectAllTrainingProjects } from '../store/trainingProjectSlice';

import { Images as ImagesComponent } from '../components/Images/Images';

export const Images: React.FC = () => {
  const projects = useSelector((state: RootState) => selectAllTrainingProjects(state));

  console.log('projects', projects);

  const [selectedProject, setSelectedProject] = useState<Number>(0);

  console.log('selectedProject', selectedProject);

  const projectsOptions: IDropdownOption[] = projects.map(({ id, name }) => ({
    key: id,
    text: name,
  }));

  return (
    <>
      {!selectedProject ? (
        <Dropdown
          label="Selected Project"
          options={projectsOptions}
          onChange={(_, option: IDropdownOption) => setSelectedProject(option.key as number)}
        />
      ) : (
        <ImagesComponent />
      )}
    </>
  );
};
