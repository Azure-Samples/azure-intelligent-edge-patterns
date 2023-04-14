import { mergeStyleSets } from '@fluentui/react';

export const getTagsClasses = () =>
  mergeStyleSets({
    root: {
      paddingLeft: '20px',
    },
    tagContainer: {
      width: '700px',
    },
    tagWrapper: {
      width: '100%',
      height: '100px',
      backgroundColor: '#FAF9F8',
      padding: '18px ',
    },
    button: {
      width: '63px',
    },
    // infoTitle: {
    //   width: '230px',
    // },
  });
