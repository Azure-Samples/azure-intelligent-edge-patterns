import React, { useState, FC } from 'react';
import {
  Dropdown,
  DropdownItemProps,
  Slider,
  Grid,
  Flex,
  Text,
  Divider,
  Label,
  Button,
} from '@fluentui/react-northstar';
import { useSelector } from 'react-redux';
import { State } from '../store/State';
import { Camera } from '../store/camera/cameraTypes';
import ImageLink from '../components/ImageLink';

const ManualIdentification: FC = () => {
  const cameras = useSelector<State, Camera[]>((state) => state.cameras);
  const images = [...new Array(20)];

  const cameraItems: DropdownItemProps[] = cameras.map((ele) => ({
    header: ele.name,
    content: {
      key: ele.id,
    },
  }));

  const [selectedCamera, setSelectedCamera] = useState<Camera>(null);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(90);
  const [ascend, setAscend] = useState<boolean>(true);

  const onDropdownChange = (_, data): void => {
    const { key } = data.value.content;
    const currentCamera = cameras.find((ele) => ele.id === key);
    if (selectedCamera) setSelectedCamera(currentCamera);
  };

  return (
    <>
      <Text size="larger" weight="semibold">
        Manual Identification
      </Text>
      <Divider color="black" />
      <Flex column gap="gap.medium" space="between" styles={{ height: '75vh', padding: '1em' }}>
        <Grid columns="3" styles={{ columnGap: '1em' }}>
          <Flex vAlign="center" gap="gap.smaller">
            <Text truncated>Select Camera:</Text>
            <Dropdown items={cameraItems} onChange={onDropdownChange} />
          </Flex>
          <Flex vAlign="center" gap="gap.smaller">
            <Text truncated>Confidence Level:</Text>
            <Slider
              value={confidenceLevel.toString()}
              onChange={(_, data): void => {
                setConfidenceLevel(parseInt(data.value, 10));
              }}
            />
            <Label content={`${confidenceLevel}%`} />
          </Flex>
          <Flex vAlign="center">
            <Text truncated>Sort:</Text>
            <Button
              icon={ascend ? 'arrow-down' : 'arrow-up'}
              text
              iconOnly
              onClick={(): void => {
                setAscend((prev) => !prev);
              }}
            />
          </Flex>
        </Grid>
        <Grid
          columns="2"
          styles={{
            width: '100%',
            height: '80%',
            borderStyle: 'solid',
            overflow: 'scroll',
            borderWidth: '1px',
          }}
        >
          {images.map((_, i) => (
            <ImageIdentificationItem key={i} />
          ))}
        </Grid>
        <Button content="Update" styles={{ width: '15%' }} primary disabled />
      </Flex>
    </>
  );
};

const ImageIdentificationItem: FC<any> = () => {
  const parts = [];
  const [selectedPart, setSelectedPart] = useState<number>(null);

  const onDropdownChange = (_, data): void => {
    const { key } = data.value.content;
    const currentPart = parts.find((ele) => ele.id === key);
    if (selectedPart) setSelectedPart(currentPart);
  };

  return (
    <Flex hAlign="center" padding="padding.medium">
      <ImageLink defaultSrc="/Play.png" width="120px" height="120px" />
      <Flex column gap="gap.smaller" styles={{ width: '40%' }}>
        <Text truncated>Confidence Level: 30%</Text>
        <Flex column>
          <Text>Select Part:</Text>
          <Dropdown items={parts} fluid onChange={onDropdownChange} />
        </Flex>
        <Button primary content="Identify" />
      </Flex>
    </Flex>
  );
};

export default ManualIdentification;
