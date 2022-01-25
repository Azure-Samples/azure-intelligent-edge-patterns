import React from 'react';
import { Panel, Stack, PrimaryButton, Label, mergeStyleSets, Text } from '@fluentui/react';

import { IntelProject } from '../../../store/IntelProjectSlice';

type Props = {
  isOpen: boolean;
  onDissmiss: () => void;
  intel: IntelProject;
  onClickAddModel: () => void;
  isAddIntel: boolean;
};

const getClasses = () =>
  mergeStyleSets({
    metricWrapper: {
      boxShadow: 'inset 0px -1px 0px #EDEBE9',
    },
    metric: {
      padding: '7px 0',
      width: '50%',
    },
    value: {
      padding: '7px 0',
      width: '50%',
    },
  });

const AddIntel: React.FC<Props> = (props) => {
  const { intel, isOpen, onDissmiss, onClickAddModel, isAddIntel } = props;

  const classes = getClasses();

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDissmiss}
      hasCloseButton
      headerText={intel.name}
      onRenderFooterContent={() => (
        <PrimaryButton disabled={isAddIntel} onClick={onClickAddModel} text="Add" />
      )}
      isFooterAtBottom={true}
    >
      <Stack>
        <div style={{ marginTop: '30px' }}>
          <Label styles={{ root: { fontSize: '18px', lineHeight: '22px', color: '#323130' } }}>
            Use Case Description
          </Label>
          <Text styles={{ root: { fontSize: '13px', lineHeight: '22px', color: '#605E5C' } }}>
            {intel.describe}
          </Text>
        </div>
        <img style={{ marginTop: '20px', height: '160px' }} src={intel.imageUrl} alt="img" />
        <div style={{ marginTop: '15px' }}>
          <Stack horizontal styles={{ root: classes.metricWrapper }}>
            <Stack styles={{ root: classes.metric }}>Metric</Stack>
            <Stack styles={{ root: classes.value }}>Value</Stack>
          </Stack>
          {Object.entries(intel.metrics).map((metric: [string, string], idx) => (
            <Stack key={idx} horizontal styles={{ root: classes.metricWrapper }}>
              <Stack styles={{ root: classes.metric }}>{metric[0]}</Stack>
              <Stack styles={{ root: classes.value }}>{metric[1]}</Stack>
            </Stack>
          ))}
        </div>
        <div style={{ marginTop: '40px' }}>
          <Label styles={{ root: { fontSize: '14px', lineHeight: '20px', color: '#323130' } }}>Input</Label>
          <Text styles={{ root: { fontSize: '13px', lineHeight: '22px', color: '#605E5C' } }}>
            {intel.inputDescribe}
          </Text>
          <Stack horizontal styles={{ root: classes.metricWrapper }}>
            <Stack styles={{ root: classes.metric }}>Input</Stack>
            <Stack styles={{ root: classes.value }}>Definition</Stack>
          </Stack>
          {Object.entries(intel.inputs).map((input: [string, string], idx) => (
            <Stack key={idx} horizontal styles={{ root: classes.metricWrapper }}>
              <Stack styles={{ root: classes.metric }}>{input[0]}</Stack>
              <Stack styles={{ root: classes.value }}>{input[1]}</Stack>
            </Stack>
          ))}
        </div>
      </Stack>
    </Panel>
  );
};

export default AddIntel;
