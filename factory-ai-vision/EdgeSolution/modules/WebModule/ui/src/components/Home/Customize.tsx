import React, { useState, useEffect } from 'react';
import { Stack, Text, Link, mergeStyleSets } from '@fluentui/react';
import { Card } from '@uifabric/react-cards';

import { State } from 'RootStateType';
import { useDispatch, useSelector } from 'react-redux';
import { ConfigTaskPanel } from '../ConfigTaskPanel/ConfigTaskPanel';
import { initialProjectData } from '../../store/project/projectReducer';
import { getScenario, Scenario } from '../../store/scenarioSlice';

const classes = mergeStyleSets({
  subTitle: {
    marginBottom: '10px',
  },
  constWrapper: {
    '& div:not(:first-child)': {
      marginTop: '0',
    },
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridGap: '12px',
  },
});

const demoProjectsInfo = [
  {
    title: 'Counting objects',
    subTitle: 'Identify and count the number of objects in the factory',
  },
  {
    title: 'Employee safety',
    subTitle: 'Detect if person is standing too close to a machine',
  },
  {
    title: 'Defect detection',
    subTitle: 'Detect products with defects',
  },
  {
    title: 'Empty shelf alert',
    subTitle: 'Identify and alerts when products in shelf is running out',
  },
  {
    title: 'People counting',
    subTitle: 'Count the Total Number of People in the store entered in whole day',
  },
  {
    title: 'Crowded queue alert',
    subTitle: 'Identify and alerts when more then allowed people are coming in queue or selected area',
  },
];

const getInitialRecommendFps = (scenario: Scenario, recommendFps: number): number => {
  if (!scenario) return 0;

  if (scenario.fps !== '0') return Number(scenario.fps);
  return recommendFps;
};

const getInitialFps = (scenario: Scenario, recommendFps: number): string => {
  if (!scenario) return '';

  if (scenario.fps !== '0') return scenario.fps;
  return recommendFps.toString();
};

export const Customize: React.FC = () => {
  const scenario = useSelector((state: State) => state.scenario);
  const recomendedFps = useSelector((state: State) => state.project.data.recomendedFps);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getScenario());
  }, [dispatch]);

  const [selectedScenarioIdx, setselectedScenarioIdx] = useState(-1);
  const openPanel = (name: string) => () =>
    setselectedScenarioIdx(scenario.findIndex((e) => e.name === name));
  const closePanel = () => setselectedScenarioIdx(-1);

  return (
    <>
      <Stack horizontalAlign="center">
        <h4>Get started with our pre-built scenarios</h4>
        <Text className={classes.subTitle}>
          Choose one of the following pre-trained templates to start running inferences on demo or custom
          cameras
        </Text>
        <Stack className={classes.constWrapper} tokens={{ childrenGap: '24px' }} horizontalAlign="center">
          <div className={classes.gridContainer}>
            {demoProjectsInfo.map((info) => (
              <DemoCard
                key={info.title}
                title={info.title}
                subTitle={info.subTitle}
                onClick={openPanel(info.title)}
                available={!!scenario.find((e) => e.name === info.title)}
              />
            ))}
          </div>
        </Stack>
      </Stack>
      <ConfigTaskPanel
        isOpen={selectedScenarioIdx > -1}
        onDismiss={closePanel}
        projectData={{
          ...initialProjectData,
          ...scenario[selectedScenarioIdx],
          recomendedFps: getInitialRecommendFps(scenario[selectedScenarioIdx], recomendedFps),
          fps: getInitialFps(scenario[selectedScenarioIdx], recomendedFps),
        }}
        trainingProjectOfSelectedScenario={scenario[selectedScenarioIdx]?.trainingProject}
      />
    </>
  );
};

type DemoCardProps = {
  title: string;
  subTitle: string;
  onClick: () => void;
  available: boolean;
};

export const DemoCard: React.FC<DemoCardProps> = ({ title, subTitle, onClick, available }) => {
  return (
    <Card styles={{ root: { padding: '20px', alignItems: 'flex-start' } }}>
      <h4>{title}</h4>
      <Text styles={{ root: { height: '100px' } }}>{subTitle}</Text>
      {available ? (
        <Link onClick={onClick}>{'Deploy scenario >'}</Link>
      ) : (
        <Text styles={{ root: { backgroundColor: 'rgba(242, 201, 76, 0.8)', padding: '2px 8px' } }}>
          COMING SOON
        </Text>
      )}
    </Card>
  );
};
