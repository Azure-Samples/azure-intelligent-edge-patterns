import React from 'react';
import { Panel, Stack, PrimaryButton, Label, mergeStyleSets, Text } from '@fluentui/react';

type Props = {
  isOpen: boolean;
  onDissmiss: () => void;
  intel: {
    id: number;
    name: string;
    describe: string;
    imageUrl: string;
    inputDescribe: string;
    metric: {
      ap?: string;
      GFlops: string;
      MParams: string;
      sf: string;
      ifo?: string;
      rip?: string;
      roop?: string;
      mow?: string;
    };
  };
  onClickAddModel: () => void;
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
    },
  });

const EditPanel: React.FC<Props> = (props) => {
  const { intel, isOpen, onDissmiss, onClickAddModel } = props;

  const classes = getClasses();

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDissmiss}
      hasCloseButton
      headerText={intel.name}
      onRenderFooterContent={() => <PrimaryButton onClick={onClickAddModel} text="Add" />}
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
          {intel.id === 0 && (
            <Stack horizontal styles={{ root: classes.metricWrapper }}>
              <Stack styles={{ root: classes.metric }}>AP</Stack>
              <Stack styles={{ root: classes.value }}>{intel.metric.ap}</Stack>
            </Stack>
          )}
          {intel.id === 1 && (
            <Stack horizontal styles={{ root: classes.metricWrapper }}>
              <Stack styles={{ root: classes.metric }}>Input face orientation</Stack>
              <Stack styles={{ root: classes.value }}>{intel.metric.ifo}</Stack>
            </Stack>
          )}
          {[1, 2].includes(intel.id) && (
            <Stack horizontal styles={{ root: classes.metricWrapper }}>
              <Stack styles={{ root: classes.metric }}>Rotation in-plane</Stack>
              <Stack styles={{ root: classes.value }}>{intel.metric.rip}</Stack>
            </Stack>
          )}
          {[1, 2].includes(intel.id) && (
            <Stack horizontal styles={{ root: classes.metricWrapper }}>
              <Stack styles={{ root: classes.metric }}>Rotation out-of-plane</Stack>
              <Stack styles={{ root: classes.value }}>{intel.metric.roop}</Stack>
            </Stack>
          )}
          {[1, 2].includes(intel.id) && (
            <Stack horizontal styles={{ root: classes.metricWrapper }}>
              <Stack styles={{ root: classes.metric }}>Min object width</Stack>
              <Stack styles={{ root: classes.value }}>{intel.metric.mow}</Stack>
            </Stack>
          )}
          <Stack horizontal styles={{ root: classes.metricWrapper }}>
            <Stack styles={{ root: classes.metric }}>GFlops</Stack>
            <Stack styles={{ root: classes.value }}>{intel.metric.GFlops}</Stack>
          </Stack>
          <Stack horizontal styles={{ root: classes.metricWrapper }}>
            <Stack styles={{ root: classes.metric }}>MParams</Stack>
            <Stack styles={{ root: classes.value }}>{intel.metric.MParams}</Stack>
          </Stack>
          <Stack horizontal styles={{ root: classes.metricWrapper }}>
            <Stack styles={{ root: classes.metric }}>Source framework</Stack>
            <Stack styles={{ root: classes.value }}>{intel.metric.sf}</Stack>
          </Stack>
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
          {intel.id === 0 && (
            <Stack horizontal styles={{ root: classes.metricWrapper }}>
              <Stack styles={{ root: classes.metric }}>B</Stack>
              <Stack styles={{ root: classes.value }}>batch size</Stack>
            </Stack>
          )}
          <Stack horizontal styles={{ root: classes.metricWrapper }}>
            <Stack styles={{ root: classes.metric }}>C</Stack>
            <Stack styles={{ root: classes.value }}>number of channels</Stack>
          </Stack>
          <Stack horizontal styles={{ root: classes.metricWrapper }}>
            <Stack styles={{ root: classes.metric }}>H</Stack>
            <Stack styles={{ root: classes.value }}> image height</Stack>
          </Stack>
          <Stack horizontal styles={{ root: classes.metricWrapper }}>
            <Stack styles={{ root: classes.metric }}>W</Stack>
            <Stack styles={{ root: classes.value }}> image width</Stack>
          </Stack>
        </div>
      </Stack>
    </Panel>
  );
};

export default EditPanel;
