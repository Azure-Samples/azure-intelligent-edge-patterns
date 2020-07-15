import React, { useState, useEffect } from 'react';
import { Flex, Input, Text, ComponentSlotStyle, Divider } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { updateProjectData, thunkUpdateProbThreshold } from '../../store/project/projectActions';
import { Project } from '../../store/project/projectTypes';
import { State } from '../../store/State';
import { Button } from '../Button';

/**
 * Check the condition for certain time, and show the notification for the given period.
 * @param targetState Check this state if it equals to zero
 * @param checkPeriod How long it last when it is zero
 */
function useNotification(targetState: number, checkPeriod: number): boolean {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let timer;
    if (showNotification) {
      timer = setTimeout(() => setShowNotification(false), 10000);
    }
    return (): void => {
      if (timer) clearTimeout(timer);
    };
  }, [showNotification]);

  useEffect(() => {
    // The effect only need to be trigger when inferenceMetrics.successfulInferences keep 0 for the check period
    if (targetState === 0) {
      const timer = setTimeout(() => {
        if (targetState === 0) setShowNotification(true);
      }, checkPeriod);

      return (): void => clearTimeout(timer);
    }
  }, [checkPeriod, targetState]);

  return showNotification;
}

const getSectionStyle = (isDemo): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100%',
  width: isDemo ? '33%' : '25%',
  overflow: 'scroll',
});

const highLightTextStyles: ComponentSlotStyle = {
  color: 'rgb(244, 152, 40)',
  fontWeight: 'bold',
  fontSize: '2em',
  padding: '5px, 0px',
};

export const InferenceMetricDashboard: React.FC<{ isDemo: boolean }> = ({ isDemo }) => {
  const { data: project, isLoading, inferenceMetrics } = useSelector<State, Project>(
    (state) => state.project,
  );
  const dispatch = useDispatch();
  const successInferenceFooter = useNotification(inferenceMetrics.successfulInferences, 60000);
  const unIdentifiedItemFooter = useNotification(inferenceMetrics.successfulInferences, 120000);

  return (
    <Flex gap="gap.small" styles={{ height: '100px' }}>
      <section style={getSectionStyle(isDemo)}>
        <Text weight="bold" content="Max Confidence Level" />
        <Input
          value={project.probThreshold}
          onChange={(_, { value }): void => {
            dispatch(updateProjectData({ probThreshold: value }, isDemo));
          }}
          icon="%"
        />
        <Button
          primary
          content="Update"
          onClick={(): void => {
            dispatch(thunkUpdateProbThreshold(isDemo));
          }}
          disabled={!project.probThreshold}
          loading={isLoading}
          circular
        />
      </section>
      <Divider color="black" vertical />
      <section style={getSectionStyle(isDemo)}>
        <Text weight="bold" content="Success Rate" />
        <Text styles={highLightTextStyles}>{`${inferenceMetrics.successRate}%`}</Text>
        <Text content={`Running on ${inferenceMetrics.isGpu ? 'GPU' : 'CPU'} (accelerated)`} />
        <Text content={`${Math.round(inferenceMetrics.averageTime * 100) / 100}/ms`} />
      </section>
      <Divider color="black" vertical />
      <section style={getSectionStyle(isDemo)}>
        <Text weight="bold" content="Successful Inferences" />
        <Text styles={highLightTextStyles} content={inferenceMetrics.successfulInferences} />
        <footer>
          {successInferenceFooter
            ? 'If you are not seeing inference result, we recommend to change the capture image range to current model accuracy accordingly.'
            : ''}
        </footer>
      </section>
      {!isDemo && (
        <>
          <Divider color="black" vertical />
          <section style={getSectionStyle(isDemo)}>
            <Text weight="bold" content="Unidentified Items" />
            <Text styles={highLightTextStyles}>{inferenceMetrics.unIdetifiedItems}</Text>
            <Button content="Identify Manually" primary as={Link} to="/manual" circular />
            <footer>
              {unIdentifiedItemFooter
                ? 'If you are not receiving any images, we recommend to chance the capture image range to minimum 10%.'
                : ''}
            </footer>
          </section>
        </>
      )}
    </Flex>
  );
};
