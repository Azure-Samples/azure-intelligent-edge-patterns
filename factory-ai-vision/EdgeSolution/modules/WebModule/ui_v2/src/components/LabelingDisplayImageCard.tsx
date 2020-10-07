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
    <Card
      tokens={{ childrenGap: 0 }}
      // Set height to auto to override the origin 'inherit'
      styles={{ root: { height: 'auto' } }}
    >
      <Card.Section fill styles={{ root: { overflow: 'hidden' } }}>
        {children}
      </Card.Section>
      <Card.Section styles={{ root: { padding: '12px 16px 14px 16px' } }} tokens={{ childrenGap: 5 }}>
        <Stack horizontal horizontalAlign="space-between">
          <Text variant="small" styles={{ root: { color: palette.neutralSecondary } }}>
            {cameraName}
          </Text>
          <Text variant="small">{imgTimeStamp}</Text>
        </Stack>
        {/* Wrap with stack item or the card section will add 'flex-shrink' automatically to the children which is not stack */}
        <Stack.Item>{partName && <PartTag status={partTagStatus} text={partName} />}</Stack.Item>
      </Card.Section>
    </Card>
  );
};
