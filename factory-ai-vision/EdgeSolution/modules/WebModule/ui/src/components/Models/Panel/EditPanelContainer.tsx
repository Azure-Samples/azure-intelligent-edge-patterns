import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { selectTrainingProjectById, getSingleTrainingProject } from '../../../store/trainingProjectSlice';
import { trainingProjectPartsSelectorFactory } from '../../../store/partSlice';
import { isLabeledImagesSelector } from '../../../store/selectors';
import { Annotation, Image } from '../../../store/type';

import EditPanel from './EditPanel';

interface Props {
  projectId: string;
  onDismiss: () => void;
}

type EnhanceImage = Exclude<Image, 'labels'> & {
  labels: Annotation[];
};

const labeledImagesCount = (enhanceImages: EnhanceImage[]) =>
  enhanceImages.reduce((acc, image) => {
    if (image.labels.length > 0) return acc + 1;
    return acc;
  }, 0);

const EditPanelContainer = (props: Props) => {
  const { projectId, onDismiss } = props;

  const project = useSelector((state: RootState) => selectTrainingProjectById(state, projectId));
  const partSelector = useMemo(() => trainingProjectPartsSelectorFactory(project.id), [project]);
  const parts = useSelector(partSelector);
  const imagesSelector = useMemo(() => isLabeledImagesSelector(parseInt(projectId, 10)), [projectId]);
  const images = useSelector(imagesSelector);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSingleTrainingProject(parseInt(projectId, 10)));
  }, [dispatch]);

  return (
    <EditPanel
      projectId={projectId}
      onDismiss={onDismiss}
      project={project}
      parts={parts}
      labeledCount={labeledImagesCount(images as EnhanceImage[])}
    />
  );
};

export default EditPanelContainer;
