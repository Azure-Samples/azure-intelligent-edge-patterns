import * as React from 'react';
import { ICommandBarItemProps, Stack, CommandBar, getTheme, Breadcrumb } from '@fluentui/react';
import { EmptyAddIcon } from '../components/EmptyAddIcon';

const theme = getTheme();

export const Images: React.FC = () => {
  const commandBarItems: ICommandBarItemProps[] = React.useMemo(
    () => [
      {
        key: 'uploadImages',
        text: 'Upload images',
        iconProps: {
          iconName: 'Upload',
        },
        onClick: () => {},
      },
      {
        key: 'captureFromCamera',
        text: 'Capture from camera',
        iconProps: {
          iconName: 'Camera',
        },
        onClick: () => {},
      },
    ],
    [],
  );

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Stack styles={{ root: { padding: '15px' } }} grow>
        <Breadcrumb items={[{ key: 'images', text: 'Images' }]} />
        <EmptyAddIcon
          title="Add images"
          subTitle="Capture images from your video streams and tag parts"
          primary={{ text: 'Capture from camera', onClick: () => {} }}
          secondary={{ text: 'Upload images', onClick: () => {} }}
        />
      </Stack>
    </Stack>
  );
};
