import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getImages } from '../../../store/imageSlice';
import { getParts } from '../../../store/partSlice';
import { getCameras } from '../../../store/cameraSlice';
import { TrainingProject } from '../../../store/trainingProjectSlice';
import { getOneTrainingProjectStatus } from '../../../store/trainingProjectStatusSlice';

import TagsSection from './TagsSection';
import ImagesSection from './ImagesSection';
import TrainingButton from './TrainingButton';

interface Props {
  cvModel: TrainingProject;
}

const ImageTraining = (props: Props) => {
  const { cvModel } = props;

  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(getImages({ freezeRelabelImgs: true, selectedProject: cvModel.id })),
        dispatch(getOneTrainingProjectStatus(cvModel.id)),
        dispatch(getCameras(false)),
        // We need part info for image list items
        dispatch(getParts()),
      ]);
      setLoading(false);
    })();
  }, [dispatch, cvModel.id]);

  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      <TagsSection modelId={cvModel.id} />
      <ImagesSection modelId={cvModel.id} />
      <TrainingButton cvModelId={cvModel.id} projectType={cvModel.projectType} />
    </>
  );
};

export default ImageTraining;
