import React from 'react';
import { Card } from '@uifabric/react-cards';
import { Text, Stack, getTheme } from '@fluentui/react';
import { PartTag, Status } from './PartTag';

const { palette } = getTheme();

type LabelingDilplayImageCardProps = {
  cameraName: string;
  imgTimeStamp: string;
  partName: string;
  manualChecked: boolean;

  parts: string[];
};

export const LabelingDisplayImageCard: React.FC<LabelingDilplayImageCardProps> = ({
  children,
  cameraName,
  imgTimeStamp,
  partName,
  manualChecked,
  parts,
}) => {
  const partTagStatus = manualChecked ? Status.Active : Status.Inactive;
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
        {/* <Stack.Item>{partName && <PartTag status={partTagStatus} text={partName} />}</Stack.Item> */}
        <Stack horizontal tokens={{ childrenGap: '5px' }}>
          {parts.length > 0 &&
            parts.map((part, i) => (
              <Stack.Item key={i}>{<PartTag status={partTagStatus} text={part} />}</Stack.Item>
            ))}
        </Stack>
      </Card.Section>
    </Card>
  );
};
