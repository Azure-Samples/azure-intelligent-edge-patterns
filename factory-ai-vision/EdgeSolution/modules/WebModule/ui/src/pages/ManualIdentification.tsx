import React, { useState, useEffect, useRef, useMemo, FC } from 'react';
import {
  Dropdown,
  DropdownItemProps,
  Grid,
  Flex,
  Text,
  Divider,
  Button,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@fluentui/react-northstar';
import Axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from 'rc-tooltip';
import { Range, Handle } from 'rc-slider';
import 'rc-tooltip/assets/bootstrap.css';
import '../rc-slider.css';

import { State } from '../store/State';
import { useParts } from '../hooks/useParts';
import { ProjectData } from '../store/project/projectTypes';
import { LabelImage } from '../store/image/imageTypes';
import { getFilteredImages } from '../util/getFilteredImages';
import { thunkGetProject } from '../store/project/projectActions';
import { getLabelImages } from '../store/image/imageActions';
import { JudgedImageList, RelabelImage } from '../components/ManualIdentification/types';
import ImagesContainer from '../components/ManualIdentification/ImagesContainer';

const ManualIdentification: FC = () => {
  const dispatch = useDispatch();
  const { projectData, images } = useSelector<State, { projectData: ProjectData; images: LabelImage[] }>(
    (state) => ({
      projectData: state.project.data,
      images: state.images,
    }),
  );
  const parts = useParts(false);
  const partItems = useMemo<DropdownItemProps[]>(() => {
    if (parts.length === 0 || projectData.parts.length === 0) return [];

    return projectData.parts.reduce((acc, partId) => {
      const part = parts.find((e) => e.id === partId);

      if (!part) return acc;

      acc.push({
        header: part.name,
        content: {
          key: part.id,
        },
      });
      return acc;
    }, []);
  }, [parts, projectData]);

  const [selectedPartItem, setSelectedPartItem] = useState<DropdownItemProps>(null);
  const selectedPartId: number = (selectedPartItem?.content as { key: number })?.key ?? null;

  const [confidenceLevelRange, setConfidenceLevelRange] = useState<[number, number]>([
    projectData.accuracyRangeMin,
    projectData.accuracyRangeMax,
  ]);
  const [ascend, setAscend] = useState<boolean>(false);
  const sortRef = useRef({ sorted: false, prevIsAscend: false });
  const [judgedImageList, setJudgedImageList] = useState<JudgedImageList>([]);

  const [relabelImages, setRelabelImages] = useState<RelabelImage[]>([]);

  useEffect(() => {
    dispatch(thunkGetProject(false));
    dispatch(getLabelImages());
  }, [dispatch]);

  useEffect(() => {
    setRelabelImages(
      getFilteredImages(images, {
        partId: selectedPartId,
        isRelabel: true,
      }).map((e) => {
        const confidenceLevel = ((e.confidence * 1000) | 0) / 10;
        return {
          ...e,
          confidenceLevel,
          display: confidenceLevel >= confidenceLevelRange[0] && confidenceLevel <= confidenceLevelRange[1],
        };
      }),
    );
    return (): void => {
      setAscend(false);
      sortRef.current = { sorted: false, prevIsAscend: false };
    };
  }, [confidenceLevelRange, images, selectedPartId]);

  useEffect(() => {
    if (sortRef.current.sorted) {
      if (sortRef.current.prevIsAscend !== ascend) {
        setRelabelImages((prev) => {
          const next = [...prev];
          next.reverse();
          return next;
        });
        sortRef.current.prevIsAscend = ascend;
      }
    } else {
      setRelabelImages((prev) => {
        if (ascend) prev.sort((a, b) => a.confidenceLevel - b.confidenceLevel);
        else prev.sort((a, b) => b.confidenceLevel - a.confidenceLevel);
        return [...prev];
      });
      sortRef.current = { sorted: true, prevIsAscend: true };
    }
  }, [ascend]);

  const onDropdownChange = (_, { value }): void => {
    if (value !== null) {
      setSelectedPartItem(value);
    }
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
            <Dropdown items={partItems} onChange={onDropdownChange} value={selectedPartItem} />
          </Flex>
          <Flex vAlign="center" gap="gap.smaller" styles={{ width: '80%' }}>
            <Text>Confidence Level:</Text>
            <div style={{ width: '70%' }}>
              <Range
                value={confidenceLevelRange}
                allowCross={false}
                onChange={setConfidenceLevelRange}
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
              styles={{ color: sortRef.current.sorted ? '#0094d8' : 'grey' }}
              text
              iconOnly
              onClick={(): void => {
                setAscend((prev) => !prev);
              }}
            />
          </Flex>
        </Grid>
        <div style={{ display: 'flex', minWidth: '15em', maxWidth: '15%', justifyContent: 'space-around' }}>
          <Button
            primary
            content="Yes to all"
            onClick={(): void => {
              setJudgedImageList(relabelImages.map((e) => ({ imageId: e.id, partId: selectedPartId })));
            }}
          />
          <Button
            styles={{
              backgroundColor: '#E97548',
              color: 'white',
              ':hover': { backgroundColor: '#CC4A31', color: 'white' },
            }}
            content="No to all"
            onClick={(): void => {
              setJudgedImageList(relabelImages.map((e) => ({ imageId: e.id, partId: null })));
            }}
          />
        </div>
        <ImagesContainer
          images={relabelImages}
          judgedImageList={judgedImageList}
          setJudgedImageList={setJudgedImageList}
          selectedPartId={selectedPartId}
          partItems={partItems}
        />
        <Button
          content="Update"
          styles={{ width: '15%' }}
          primary
          disabled={judgedImageList.length === 0}
          onClick={(): void => {
            Axios({ method: 'POST', url: '/api/relabel/update', data: judgedImageList })
              .then(() => {
                dispatch(getLabelImages());
                setJudgedImageList([]);
                return void 0;
              })
              .catch((err) => {
                console.error(err);
              });
          }}
        />
      </Flex>
    </>
  );
};

export default ManualIdentification;
