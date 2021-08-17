import React from 'react';
import { Stack, Label, PrimaryButton, Text, mergeStyleSets } from '@fluentui/react';

import { Cascade } from '../../store/cascadeSlice';

import CascadeCard from './CascadesCard';

interface Props {
  cascadeList: Cascade[];
  onCreateCascades: () => void;
}

const getClasses = () =>
  mergeStyleSets({
    root: {},
    sidebarWrapper: { borderBottom: '1px solid #C8C6C4', padding: '0 16px 10px' },
    searchBox: { width: '180px', marginTop: '20px' },
    manageModels: { marginTop: '25px' },
  });

const Cascades: React.FC<Props> = (props) => {
  const { cascadeList, onCreateCascades } = props;

  const classes = getClasses();

  if (cascadeList.length === 0)
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

  return (
    <Stack styles={{ root: { padding: '25px 20px' } }} horizontal tokens={{ childrenGap: 20 }}>
      {cascadeList.map((cascade, id) => (
        <CascadeCard key={id} cascade={cascade} />
      ))}
    </Stack>
  );
};

export default Cascades;
