import React from 'react';
import {
  Stack,
  Label,
  PrimaryButton,
  Text,
  mergeStyleSets,
  ICommandBarItemProps,
  CommandBar,
} from '@fluentui/react';

import { Cascade } from '../../store/cascadeSlice';

import CascadeCard from './CascadesCard';

interface Props {
  cascadeList: Cascade[];
  onCreateCascades: () => void;
  defaultCommandBarItems: ICommandBarItemProps[];
}

const getClasses = () =>
  mergeStyleSets({
    root: { width: '220px', textAlign: 'center' },
    emptyTitle: { marginTop: '16px', fontSize: '16px', lineHeight: '22px' },
    emptyDescribe: { marginTop: '4px', fontSize: '13px', lineHeight: '18px' },
    button: { marginTop: '12px' },
  });

const Cascades: React.FC<Props> = (props) => {
  const { cascadeList, onCreateCascades, defaultCommandBarItems } = props;

  const classes = getClasses();

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addBtn',
      text: 'Create Cascade',
      iconProps: {
        iconName: 'Add',
      },
      onClick: onCreateCascades,
    },
    ...defaultCommandBarItems,
  ];

  return (
    <>
      <CommandBar styles={{ root: { marginTop: '24px' } }} items={commandBarItems} />
      {cascadeList.length === 0 ? (
        <Stack horizontalAlign="center">
          <div style={{ marginTop: '200px' }}>
            <Stack styles={{ root: classes.root }} tokens={{ childrenGap: 20 }}>
              <img style={{ height: '180px' }} src="/icons/emptyCascades.png" alt="emptyCascades" />
              <Stack>
                <Label styles={{ root: classes.emptyTitle }}>Cascade Map</Label>
                <Text styles={{ root: classes.emptyDescribe }}>
                  Configure multiple models for increased accuracy and efficiency
                </Text>
              </Stack>
              <PrimaryButton
                styles={{ root: classes.button }}
                allowDisabledFocus
                text="Create Cascade Map"
                onClick={onCreateCascades}
              />
            </Stack>
          </div>
        </Stack>
      ) : (
        <Stack styles={{ root: { padding: '25px 20px' } }} horizontal tokens={{ childrenGap: 20 }}>
          {cascadeList.map((cascade, id) => (
            <CascadeCard key={id} cascade={cascade} />
          ))}
        </Stack>
      )}
    </>
  );
};

export default Cascades;
