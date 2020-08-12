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
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from 'rc-tooltip';
import { Range, Handle } from 'rc-slider';
import 'rc-tooltip/assets/bootstrap.css';
import '../rc-slider.css';

import { State } from 'RootStateType';
// import { useParts } from '../hooks/useParts';
import { ProjectData } from '../store/project/projectTypes';
import { thunkGetProject } from '../store/project/projectActions';
import ImagesContainer from '../components/ManualIdentification/ImagesContainer';
import { selectRelabelImages } from '../features/selectors';
import { getImages } from '../features/imageSlice';
import { getParts } from '../features/partSlice';
import LabelingPage from '../components/LabelingPage/LabelingPage';
import { LabelingType } from '../components/LabelingPage/type';
import { openLabelingPage } from '../features/labelingPageSlice';
import { updateRelabelImages } from '../features/actions';

const ManualIdentification: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const projectData = useSelector<State, ProjectData>((state) => state.project.data);
  const images = useSelector(selectRelabelImages);
  // const parts = useParts(false);
  // const partItems = useMemo<DropdownItemProps[]>(() => {
  //   if (parts.length === 0 || projectData.parts.length === 0) return [];

  //   return projectData.parts.reduce((acc, partId) => {
  //     const part = parts.find((e) => e.id === partId);

  //     if (!part) return acc;

  //     acc.push({
  //       header: part.name,
  //       content: {
  //         key: part.id,
  //       },
  //     });
  //     return acc;
  //   }, []);
  // }, [parts, projectData]);

  const [selectedPartItem, setSelectedPartItem] = useState<DropdownItemProps>(null);
  const selectedPartId: number = (selectedPartItem?.content as { key: number })?.key ?? null;

  const [confidenceLevelRange, setConfidenceLevelRange] = useState<[number, number]>([
    projectData.accuracyRangeMin,
    projectData.accuracyRangeMax,
  ]);
  const [ascend, setAscend] = useState<boolean>(false);
  const sortRef = useRef({ sorted: false, prevIsAscend: false });

  useEffect(() => {
    dispatch(thunkGetProject(false));
    dispatch(getParts(false));
    dispatch(getImages());
  }, [dispatch]);

  const relabelImages = useMemo(
    () =>
      images
        .filter((e) => {
          const confidenceLevel = ((e.confidence * 1000) | 0) / 10;
          return confidenceLevel >= confidenceLevelRange[0] && confidenceLevel <= confidenceLevelRange[1];
        })
        .sort((a, b) => {
          if (ascend) return a.confidence - b.confidence;
          return b.confidence - a.confidence;
        }),
    [ascend, confidenceLevelRange, images],
  );

  const updateBtnDisabled = useMemo(() => images.filter((e) => e.hasRelabeled).length === 0, [images]);

  // const onDropdownChange = (_, { value }): void => {
  //   if (value !== null) {
  //     setSelectedPartItem(value);
  //   }
  // };

  const onUpdate = async (): Promise<void> => {
    try {
      await dispatch(updateRelabelImages());
      history.push('/partIdentification');
    } catch (e) {
      alert(e);
    }
  };

  const onDisplayImageClick = (imgId: number) => {
    dispatch(openLabelingPage({ imageIds: relabelImages.map((e) => e.id), selectedImageId: imgId }));
  };

  return (
    <>
      <Text size="larger" weight="semibold">
        Manual Identification
      </Text>
      <Divider color="black" />
      <Flex column gap="gap.medium" space="between" styles={{ height: '75vh', padding: '1em' }}>
        <Grid columns="3" styles={{ columnGap: '1em', justifyItems: 'center' }}>
          {/* <Flex vAlign="center" gap="gap.smaller">
            <Text truncated>Select Part:</Text>
            <Dropdown items={partItems} onChange={onDropdownChange} value={selectedPartItem} />
          </Flex> */}
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
        <ImagesContainer images={relabelImages} onDisplayImageClick={onDisplayImageClick} />
        <LabelingPage labelingType={LabelingType.SingleAnnotation} isRelabel={true} />
        <Button
          content="Update"
          styles={{ width: '15%' }}
          primary
          disabled={updateBtnDisabled}
          onClick={onUpdate}
        />
      </Flex>
    </>
  );
};

export default ManualIdentification;
