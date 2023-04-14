import { mergeStyleSets } from '@fluentui/react';

export const getModelDetailClasses = () =>
  mergeStyleSets({
    breadcrumb: {
      fontSize: '14px',
      color: '#0078D4',
      paddingLeft: '0 20px',
    },
    modelTitleWrapper: {
      padding: '0 20px',
    },
  });

export const getBasicsClasses = () =>
  mergeStyleSets({
    infoWrapper: {
      padding: '28px 20px 0 20px',
    },
    infoTitle: {
      width: '230px',
    },
  });

export const getImageTrainingClasses = () =>
  mergeStyleSets({
    tagWrapper: {
      backgroundColor: '#FAF9F8',
      width: '680px',
      height: '100px',
    },
  });
