import React, { useState } from 'react';
import {
  SearchBox,
  Stack,
  mergeStyleSets,
  Label,
  IContextualMenuProps,
  IconButton,
  PrimaryButton,
  Text,
} from '@fluentui/react';

import Tag from './Tag';
import AddIntelPanel from './Panel/AddIntel';

const INTEL_OVMS_CARD_DATA = [
  {
    name: 'Face Detection',
    describe:
      'Face detector based on MobileNetV2 as a backbone with a single SSD head for indoor/outdoor scenes shot by a front-facing camera. The single SSD head from 1/16 scale feature map has nine clustered prior boxes.',
    type: 'Object Detector',
    imageUrl:
      'https://raw.githubusercontent.com/openvinotoolkit/open_model_zoo/master/models/intel/face-detection-retail-0005/assets/face-detection-retail-0001.png',
    inputDescribe: 'Image, name: input, shape: 1, 3, 300, 300 in the format B, C, H, W, where:',
    createdAt: '7/3/2021',
    tags: ['Car', 'Person', 'Bus', 'Stop Sign', 'Abc'],
    metric: {
      ap: '84.52%',
      GFlops: '0.982',
      MParams: '1.021',
      sf: 'PyTorch',
    },
  },
  {
    name: 'Emotion Recognition',
    describe: `Fully convolutional network for recognition of five emotions ('neutral', 'happy', 'sad', 'surprise', 'anger').`,
    type: 'Classifier',
    imageUrl:
      'https://raw.githubusercontent.com/openvinotoolkit/open_model_zoo/master/models/intel/emotions-recognition-retail-0003/assets/emotions-recognition-retail-0003.jpg',
    inputDescribe: 'Image, name: data, shape: 1, 3, 64, 64 in 1, C, H, W format, where:',
    createdAt: '',
    tags: [],
    metric: {
      ifo: 'Frontal',
      rip: '±15˚',
      roop: 'Yaw: ±15˚ / Pitch: ±15˚',
      mow: '64 pixels',
      GFlops: '0.126',
      MParams: '2.483',
      sf: 'Caffe',
    },
  },
  {
    name: 'Age / Gender Recognition',
    describe:
      'Fully convolutional network for simultaneous Age/Gender recognition. The network is able to recognize age of people in [18, 75] years old range, it is not applicable for children since their faces were not in the training set.',
    type: 'Object Detector',
    imageUrl:
      'https://raw.githubusercontent.com/openvinotoolkit/open_model_zoo/master/models/intel/age-gender-recognition-retail-0013/assets/age-gender-recognition-retail-0001.jpg',
    inputDescribe: 'Image, name: input, shape: 1, 3, 62, 62 in 1, C, H, W format, where:',
    createdAt: '7/3/2021',
    tags: ['Car', 'Person', 'Bus', 'Stop Sign', 'Abc'],
    metric: {
      // ifo: 'Frontal',
      rip: '±45˚',
      roop: 'Yaw: ±45˚ / Pitch: ±45˚',
      mow: '62 pixels',
      GFlops: '0.094',
      MParams: '2.138',
      sf: 'Caffe',
    },
  },
];

const CARD_PART_LIMIT = 5;

const getClasses = () =>
  mergeStyleSets({
    root: {
      width: '320px',
      height: '266px',
      boxShadow: ' 0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
      borderRadius: '4px',
      ':hover': {
        boxShadow: ' 0px 0.3px 0.9px rgba(0, 0, 0, 0.5), 0px 1.6px 3.6px rgba(0, 0, 0, 0.5)',
      },
    },
    titleContainer: { borderBottom: '1px solid rgba(0, 0, 0, 0.13)', width: '100%' },
    titleWrapper: { padding: '10px 12px' },
    titleType: { fontSize: '12px', lineHeight: '16px', color: '#605E5C' },
    deleteIcon: {
      padding: '10px',
      marginRight: '12px',
      '& i': {
        fontSize: '24px',
      },
      ':hover': {
        cursor: 'pointer',
      },
    },
  });

const IntelOvmsDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(0);

  const classes = getClasses();

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'properties',
        text: 'Properties',
        iconProps: { iconName: 'Equalizer' },
        onClick: () => setIsOpen(true),
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: () => {},
      },
    ],
  };

  return (
    <>
      <Stack tokens={{ childrenGap: 45 }}>
        <SearchBox styles={{ root: { width: '470px' } }} placeholder="Search" />
        <Stack horizontal wrap tokens={{ childrenGap: 16 }}>
          {INTEL_OVMS_CARD_DATA.map((card, id) => (
            <Stack
              className={classes.root}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                console.log(e.currentTarget);
                // @ts-ignore
                console.log(e.target.id);

                setSelectedId(id);
                setIsOpen(true);
              }}
            >
              <Stack horizontal>
                <img style={{ height: '60px', width: '60px' }} src="/icons/modelCard.png" alt="icon" />
                <Stack horizontal horizontalAlign="space-between" styles={{ root: classes.titleContainer }}>
                  {/* <Icon iconName="ModelingView" className={classes.cardIcon} /> */}
                  <Stack styles={{ root: classes.titleWrapper }}>
                    <Label>{card.name}</Label>
                    <Text styles={{ root: classes.titleType }}>{card.type}</Text>
                  </Stack>
                  <Stack horizontalAlign="center" verticalAlign="center">
                    <IconButton
                      styles={{ root: classes.deleteIcon }}
                      menuProps={menuProps}
                      menuIconProps={{ iconName: 'MoreVertical' }}
                    />
                  </Stack>
                </Stack>
              </Stack>
              <Stack styles={{ root: { padding: '10px 20px 12px', height: '100%', position: 'relative' } }}>
                <Label
                  styles={{
                    root: {
                      fontSize: '10px',
                      lineHeightL: '14px',
                      color: '#605E5C',
                    },
                  }}
                >
                  By Intel
                </Label>
                {card.createdAt && (
                  <Label styles={{ root: { fontSize: '13px', lineHeight: '18px', marginBottom: '10px' } }}>
                    {`Updated: ${card.createdAt}`}
                  </Label>
                )}
                <Stack horizontal tokens={{ childrenGap: '5px' }} wrap>
                  {card.tags
                    .filter((_, i) => i < 3)
                    .map((part, id) => (
                      <Tag key={id} id={id} text={part} />
                    ))}
                  {card.tags.length > CARD_PART_LIMIT && (
                    <span
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        color: '#0078D4',
                      }}
                    >{`+${card.tags.length - CARD_PART_LIMIT} more`}</span>
                  )}
                </Stack>
                <div
                  style={{
                    textAlign: 'left',
                    marginTop: '34px',
                    position: 'absolute',
                    right: '10px',
                    bottom: '10px',
                  }}
                >
                  <PrimaryButton
                    id="test"
                    text="Add"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </div>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <AddIntelPanel
        isOpen={isOpen}
        onDissmiss={() => setIsOpen(false)}
        intel={{
          id: selectedId,
          name: INTEL_OVMS_CARD_DATA[selectedId].name,
          describe: INTEL_OVMS_CARD_DATA[selectedId].describe,
          imageUrl: INTEL_OVMS_CARD_DATA[selectedId].imageUrl,
          inputDescribe: INTEL_OVMS_CARD_DATA[selectedId].inputDescribe,
          metric: INTEL_OVMS_CARD_DATA[selectedId].metric,
        }}
      />
    </>
  );
};

export default IntelOvmsDashboard;
