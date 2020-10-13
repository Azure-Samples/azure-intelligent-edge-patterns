import { Link } from '@fluentui/react';
import { useBoolean } from '@uifabric/react-hooks';
import React from 'react';
import { useDispatch } from 'react-redux';
import { createNewTrainingProject } from '../store/trainingProjectSlice';
import { CreateByNameDialog } from './CreateByNameDialog';

export const CreateProjectDialog: React.FC = () => {
  const [projectDialogHidden, { setFalse: openDialg, setTrue: closeDialog }] = useBoolean(true);
  const dispatch = useDispatch();

  const onCreateProject = async (name: string) => {
    await dispatch(createNewTrainingProject(name));
  };

  return (
    <>
      <Link onClick={openDialg}>{'Create project >'}</Link>
      <CreateByNameDialog
        hidden={projectDialogHidden}
        onDismiss={closeDialog}
        title="Create new project"
        subText="Create a new project will remove all the objects and images"
        onCreate={onCreateProject}
      />
    </>
  );
};
