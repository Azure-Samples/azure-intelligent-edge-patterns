import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { selectTrainingProjectById, getSingleTrainingProject } from '../../../store/trainingProjectSlice';
import { trainingProjectPartsSelectorFactory } from '../../../store/partSlice';
import {
  getOneTrainingProjectStatus,
  selectAllTrainingProjectsStatus,
} from '../../../store/trainingProjectStatusSlice';
import { getImages } from '../../../store/imageSlice';
import { isLabeledImagesSelector } from '../../../store/selectors';
import { EnhanceImage } from './type';

import EditPanel from './EditPanel';

interface Props {
  projectId: number;
  onDismiss: () => void;
}

const EditPanelContainer = (props: Props) => {
  const { projectId, onDismiss } = props;

  const project = useSelector((state: RootState) => selectTrainingProjectById(state, projectId));
  const partSelector = useMemo(() => trainingProjectPartsSelectorFactory(project.id), [project]);
  const parts = useSelector(partSelector);
  const imagesSelector = useMemo(() => isLabeledImagesSelector(projectId), [projectId]);
  const images = useSelector(imagesSelector);
  const projectStatusList = useSelector((state: RootState) => selectAllTrainingProjectsStatus(state));

  const projectStatus = projectStatusList.find((status) => status.project === projectId);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSingleTrainingProject(projectId));
    dispatch(getOneTrainingProjectStatus(projectId));
    dispatch(getImages({ freezeRelabelImgs: true, selectedProject: projectId }));
  }, [dispatch]);

  if (!projectStatus) return <></>;

  return (
    <EditPanel
      onDismiss={onDismiss}
      project={project}
      parts={parts}
      imageList={images as EnhanceImage[]}
      // imageCount={
      //   project.projectType === 'ObjectDetection'
      //     ? labeledImagesCount(images as EnhanceImage[])
      //     : images.length
      // }
      status={projectStatus.status}
    />
  );
};

export default EditPanelContainer;
