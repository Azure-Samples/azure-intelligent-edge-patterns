import React from 'react';
import { Card } from '@uifabric/react-cards';
import { Text, Stack, getTheme } from '@fluentui/react';
import { PartTag, Status } from './PartTag';

const { palette } = getTheme();

type LabelingDilplayImageCardProps = {
  cameraName: string;
  imgTimeStamp: string;
  partName: string;
  isRelabel: boolean;
};

export const LabelingDisplayImageCard: React.FC<LabelingDilplayImageCardProps> = ({
  children,
  cameraName,
  imgTimeStamp,
  partName,
  isRelabel,
}) => {
  const partTagStatus = isRelabel ? Status.Inactive : Status.Active;
  return (
    <Card>
      <Card.Section fill styles={{ root: { overflow: 'hidden' } }}>
        {children}
      </Card.Section>
      <Card.Item styles={{ root: { padding: '3px 10px', paddingBottom: '0px' } }}>
        <Stack horizontal horizontalAlign="space-between">
          <Text variant="small" styles={{ root: { color: palette.neutralSecondary } }}>
            {cameraName}
          </Text>
          <Text variant="small">{imgTimeStamp}</Text>
        </Stack>
      </Card.Item>
      <Card.Item styles={{ root: { padding: '3px 10px', paddingTop: '0px' } }}>
        <PartTag status={partTagStatus} text={partName} />
      </Card.Item>
    </Card>
  );
};
