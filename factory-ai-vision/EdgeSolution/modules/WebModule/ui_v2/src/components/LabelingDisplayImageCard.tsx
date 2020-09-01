import React from 'react';
import { Card } from '@uifabric/react-cards';
import { Text, Stack } from '@fluentui/react';

type LabelingDilplayImageCardProps = {
  cameraName: string;
  imgTimeStamp: string;
  partName: string;
};

export const LabelingDisplayImageCard: React.FC<LabelingDilplayImageCardProps> = ({
  children,
  cameraName,
  imgTimeStamp,
  partName,
}) => {
  return (
    <Card>
      <Card.Section fill styles={{ root: { overflow: 'hidden' } }}>
        {children}
      </Card.Section>
      <Card.Item styles={{ root: { padding: '3px 10px', paddingBottom: '0px' } }}>
        <Stack horizontal horizontalAlign="space-between">
          <Text>{cameraName}</Text>
          <Text>{imgTimeStamp}</Text>
        </Stack>
      </Card.Item>
      <Card.Item styles={{ root: { padding: '3px 10px', paddingTop: '0px' } }}>
        <Text>{partName}</Text>
      </Card.Item>
    </Card>
  );
};
