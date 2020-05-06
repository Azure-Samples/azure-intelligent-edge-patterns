import React, { useState, useMemo, FC } from 'react';
import {
  Dropdown,
  DropdownItemProps,
  Grid,
  Flex,
  Text,
  Divider,
  Button,
  RadioGroup,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@fluentui/react-northstar';
import { useSelector } from 'react-redux';
import Tooltip from 'rc-tooltip';
import { Range, Handle } from 'rc-slider';
import 'rc-tooltip/assets/bootstrap.css';
import '../rc-slider.css';

import LabelingPageDialog from '../components/LabelingPageDialog';
import { State } from '../store/State';
import { Camera } from '../store/camera/cameraTypes';
import { useParts } from '../hooks/useParts';
import LabelDisplayImage from '../components/LabelDisplayImage';
import { ProjectData } from '../store/project/projectTypes';

let sorting = false;

const ManualIdentification: FC = () => {
  const { project, cameras } = useSelector<State, { project: ProjectData; cameras: Camera[] }>((state) => ({
    project: state.project.data,
    cameras: state.cameras,
  }));
  const parts = useParts();

  const partItems = useMemo<DropdownItemProps[]>(() => {
    if (parts.length === 0 || project.parts.length === 0) return [];

    return project.parts.map((partId) => {
      const part = parts.find((e) => e.id === partId);

      return {
        header: part.name,
        content: {
          key: part.id,
        },
      };
    });
  }, [parts, project]);

  const [selectedCamera, setSelectedCamera] = useState<Camera>(null);
  const [confidenceLevelRange, setConfidenceLevelRange] = useState<[number, number]>([
    project.accuracyRangeMin,
    project.accuracyRangeMax,
  ]);
  const [ascend, setAscend] = useState<boolean>(false);

  const images = useMemo(() => {
    // TODO: Get real images here
    const imgs = [...new Array(20)]
      .map((_, i) => ({ confidenceLevel: i * 4, src: '/icons/Play.png' }))
      .filter(
        (e) => e.confidenceLevel >= confidenceLevelRange[0] && e.confidenceLevel <= confidenceLevelRange[1],
      );

    if (sorting) {
      if (ascend) imgs.sort((a, b) => a.confidenceLevel - b.confidenceLevel);
      else imgs.sort((a, b) => b.confidenceLevel - a.confidenceLevel);
    }
    return imgs;
  }, [confidenceLevelRange, ascend]);

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
        <Grid columns="3" styles={{ columnGap: '1em', justifyItems: 'center' }}>
          <Flex vAlign="center" gap="gap.smaller">
            <Text truncated>Select Part:</Text>
            <Dropdown items={partItems} onChange={onDropdownChange} />
          </Flex>
          <Flex vAlign="center" gap="gap.smaller" styles={{ width: '80%' }}>
            <Text>Confidence Level:</Text>
            <div style={{ width: '70%' }}>
              <Range
                value={confidenceLevelRange}
                allowCross={false}
                onChange={(e): void => setConfidenceLevelRange(e)}
                handle={({ value, dragging, index, ...restProps }): JSX.Element => {
                  return (
                    <Tooltip
                      prefixCls="rc-slider-tooltip"
                      overlay={`${value}%`}
                      visible={dragging}
                      placement="top"
                      key={index}
                    >
                      <Handle value={value} {...restProps} />
                    </Tooltip>
                  );
                }}
              />
            </div>
          </Flex>
          <Flex vAlign="center">
            <Text truncated>Sort:</Text>
            <Button
              icon={ascend ? <ArrowDownIcon /> : <ArrowUpIcon />}
              styles={{ color: sorting ? '#0094d8' : 'grey' }}
              text
              iconOnly
              onClick={(): void => {
                sorting = true;
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
          {images.map((e, i) => (
            <ImageIdentificationItem key={i} confidenceLevel={e.confidenceLevel} src={e.src} />
          ))}
        </Grid>
        <Button content="Update" styles={{ width: '15%' }} primary disabled />
      </Flex>
    </>
  );
};

interface ImageIdentificationItemProps {
  confidenceLevel: number;
  src: string;
}
const ImageIdentificationItem: FC<ImageIdentificationItemProps> = ({ confidenceLevel, src }) => {
  const [isPart, setIsPart] = useState<number>(null);

  return (
    <Flex hAlign="center" padding="padding.medium">
      <div style={{ margin: '0.2em' }}>
        <LabelDisplayImage labelImage={{ image: src, labels: null }} width={100} height={100} />
      </div>
      <Flex column gap="gap.smaller" styles={{ width: '30%' }}>
        <Text truncated>Confidence Level: {confidenceLevel}%</Text>
        <Flex column>
          <RadioGroup
            checkedValue={isPart}
            onCheckedValueChange={(_, newProps): void => setIsPart(newProps.value as number)}
            items={[
              {
                key: '1',
                label: 'Yes',
                value: 1,
              },
              {
                key: '0',
                label: 'No',
                value: 0,
              },
            ]}
          />
        </Flex>
        <LabelingPageDialog
          imageIndex={1000}
          trigger={<Button primary content="Identify" disabled={!isPart} />}
        />
      </Flex>
    </Flex>
  );
};

export default ManualIdentification;
