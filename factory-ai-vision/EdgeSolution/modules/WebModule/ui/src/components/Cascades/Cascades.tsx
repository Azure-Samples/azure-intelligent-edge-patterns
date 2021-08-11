import React from 'react';
import { Stack, Label, PrimaryButton, Text } from '@fluentui/react';

interface Props {
  onCreateCascades: () => void;
}

const Cascades: React.FC<Props> = (props) => {
  const { onCreateCascades } = props;

  return (
    <Stack horizontalAlign="center">
      <div style={{ marginTop: '200px' }}>
        <Stack styles={{ root: { width: '220px', textAlign: 'center' } }} tokens={{ childrenGap: 20 }}>
          <img style={{ height: '180px' }} src="/icons/emptyCascades.png" alt="emptyCascades" />
          <Stack>
            <Label styles={{ root: { marginTop: '16px', fontSize: '16px', lineHeight: '22px' } }}>
              Cascade Map
            </Label>
            <Text styles={{ root: { marginTop: '4px', fontSize: '13px', lineHeight: '18px' } }}>
              Configure multiple models for increased accuracy and efficiency
            </Text>
          </Stack>
          <PrimaryButton
            styles={{ root: { marginTop: '12px' } }}
            allowDisabledFocus
            text="Create Cascade Map"
            onClick={onCreateCascades}
          />
        </Stack>
      </div>
    </Stack>
  );
};

export default Cascades;
