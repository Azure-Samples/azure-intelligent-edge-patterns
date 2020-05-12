import React, { useState, useEffect, useMemo, FC, Dispatch, SetStateAction } from 'react';
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
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from 'rc-tooltip';
import { Range, Handle } from 'rc-slider';
import 'rc-tooltip/assets/bootstrap.css';
import '../rc-slider.css';

import LabelingPageDialog from '../components/LabelingPageDialog';
import { State } from '../store/State';
import { useParts } from '../hooks/useParts';
import LabelDisplayImage from '../components/LabelDisplayImage';
import { ProjectData } from '../store/project/projectTypes';
import { LabelImage } from '../store/image/imageTypes';
import { getFilteredImages } from '../util/getFilteredImages';
import { thunkGetProject } from '../store/project/projectActions';
import { getLabelImages } from '../store/image/imageActions';

let sorting = false;

type JudgedImages = { correct: number[]; incorrect: number[] };
const ManualIdentification: FC = () => {
  const dispatch = useDispatch();
  const { projectData, images } = useSelector<State, { projectData: ProjectData; images: LabelImage[] }>(
    (state) => ({
      projectData: state.project.data,
      images: state.images,
    }),
  );
  const parts = useParts();
  const partItems = useMemo<DropdownItemProps[]>(() => {
    if (parts.length === 0 || projectData.parts.length === 0) return [];

    return projectData.parts.map((partId) => {
      const part = parts.find((e) => e.id === partId);

      return {
        header: part.name,
        content: {
          key: part.id,
        },
      };
    });
  }, [parts, projectData]);

  const [selectedPartId, setSelectedPartId] = useState<number>(null);
  const [confidenceLevelRange, setConfidenceLevelRange] = useState<[number, number]>([
    projectData.accuracyRangeMin,
    projectData.accuracyRangeMax,
  ]);
  const [ascend, setAscend] = useState<boolean>(false);
  const [judgedImages, setJudgedImages] = useState<JudgedImages>({
    correct: [],
    incorrect: [],
  });

  const showImages = useMemo(() => {
    const filteredImages = getFilteredImages(images, { partId: selectedPartId, isRelabel: true })
      .map((e) => ({ ...e, confidenceLevel: ((e.confidence * 1000) | 0) / 10 }))
      .filter(
        (e) => e.confidenceLevel >= confidenceLevelRange[0] && e.confidenceLevel <= confidenceLevelRange[1],
      );

    if (sorting) {
      if (ascend) filteredImages.sort((a, b) => a.confidenceLevel - b.confidenceLevel);
      else filteredImages.sort((a, b) => b.confidenceLevel - a.confidenceLevel);
    }

    return filteredImages;
  }, [confidenceLevelRange, ascend, images, selectedPartId]);

  const onDropdownChange = (_, { value }): void => {
    if (value === null) {
      setSelectedPartId((prev) => prev);
    } else {
      const { key } = value.content;
      setSelectedPartId(key);
    }
  };

  useEffect(() => {
    dispatch(thunkGetProject());
    dispatch(getLabelImages());
  }, [dispatch]);

  const selectedPartValue = partItems.find((e) => (e.content as any).key === selectedPartId);

  return (
    <div>
      <Text size="larger" weight="semibold">
        Manual Identification
      </Text>
      <Divider color="black" />
      <Flex column gap="gap.medium" space="between" styles={{ height: '75vh', padding: '1em' }}>
        <Grid columns="3" styles={{ columnGap: '1em', justifyItems: 'center' }}>
          <Flex vAlign="center" gap="gap.smaller">
            <Text truncated>Select Part:</Text>
            <Dropdown items={partItems} onChange={onDropdownChange} value={selectedPartValue} />
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
          {showImages.map((e, i) => (
            <ImageIdentificationItem
              key={i}
              confidenceLevel={e.confidenceLevel}
              imageIndex={i}
              labelImage={e}
              judgedImages={judgedImages}
              setJudgedImages={setJudgedImages}
              partId={selectedPartId}
            />
          ))}
        </Grid>
        <Button
          content="Update"
          styles={{ width: '15%' }}
          primary
          disabled={judgedImages.correct.length === 0 && judgedImages.incorrect.length === 0}
          onClick={(): void => {
            axios({ method: 'POST', url: '/api/relabel/update', data: judgedImages })
              .then(() => {
                dispatch(getLabelImages());
                return void 0;
              })
              .catch((err) => {
                console.error(err);
              });
          }}
        />
      </Flex>
    </div>
  );
};

interface ImageIdentificationItemProps {
  confidenceLevel: number;
  labelImage: LabelImage;
  imageIndex: number;
  judgedImages: JudgedImages;
  setJudgedImages: Dispatch<SetStateAction<JudgedImages>>;
  partId: number;
}
const ImageIdentificationItem: FC<ImageIdentificationItemProps> = ({
  confidenceLevel,
  labelImage,
  imageIndex,
  judgedImages,
  setJudgedImages,
  partId,
}) => {
  let isPartCorrect: number;
  if (judgedImages.correct.indexOf(labelImage.id) >= 0) {
    isPartCorrect = 1;
  } else if (judgedImages.incorrect.indexOf(labelImage.id) >= 0) {
    isPartCorrect = 0;
  } else {
    isPartCorrect = null;
  }

  return (
    <Flex hAlign="center" padding="padding.medium">
      <div style={{ margin: '0.2em' }}>
        <LabelDisplayImage labelImage={labelImage} width={100} height={100} />
      </div>
      <Flex column gap="gap.smaller" styles={{ width: '30%' }}>
        <Text truncated>Confidence Level: {confidenceLevel}%</Text>
        <Flex column>
          <RadioGroup
            checkedValue={isPartCorrect}
            onCheckedValueChange={(_, newProps): void => {
              setJudgedImages((prev) => {
                if (newProps.value === 1) {
                  const idxInIncorrect = prev.incorrect.indexOf(labelImage.id);
                  const idxInCorrect = prev.correct.indexOf(labelImage.id);
                  if (idxInIncorrect >= 0) prev.incorrect.splice(idxInIncorrect, 1);
                  if (idxInCorrect === -1) prev.correct.push(labelImage.id);
                }
                if (newProps.value === 0) {
                  const idxInCorrect = prev.correct.indexOf(labelImage.id);
                  const idxInIncorrect = prev.incorrect.indexOf(labelImage.id);
                  if (idxInCorrect >= 0) prev.correct.splice(idxInCorrect, 1);
                  if (idxInIncorrect === -1) prev.incorrect.push(labelImage.id);
                }
                return { ...prev };
              });
            }}
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
          imageIndex={imageIndex}
          isRelabel={true}
          partId={partId}
          trigger={<Button primary content="Identify" disabled={!isPartCorrect} />}
        />
      </Flex>
    </Flex>
  );
};

export default ManualIdentification;
