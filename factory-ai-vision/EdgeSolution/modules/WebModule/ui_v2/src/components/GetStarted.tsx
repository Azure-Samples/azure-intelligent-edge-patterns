import React, { useState, useEffect } from 'react';
import { Stack, Text, Link, mergeStyleSets } from '@fluentui/react';
import { Card } from '@uifabric/react-cards';
import Axios from 'axios';

import { ConfigTaskPanel } from './ConfigTaskPanel';
import { ProjectData } from '../store/project/projectTypes';
import { initialProjectData } from '../store/project/projectReducer';

type DemoProject = Pick<
  ProjectData,
  'id' | 'name' | 'inferenceMode' | 'trainingProject' | 'cameras' | 'parts'
>;

const classes = mergeStyleSets({
  gridContainer: {
    display: 'grid',
    gridTemplate: 'repeat(3, 1fr) / repeat(3, 1fr)',
    gridGap: '12px',
    marginTop: '24px',
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
    title: 'Machine misalignment',
    subTitle: 'Detect if a machine is now aligned or working correctly',
  },
  {
    title: 'Tool detection',
    subTitle: 'Detect when an employee is using the wrong tool',
  },
  {
    title: 'Part confirmation',
    subTitle: 'Detect if the correct part is being used',
  },
];

export const GetStarted: React.FC = () => {
  const [demoProjectData, setdemoProjectData] = useState<DemoProject[]>([]);
  useEffect(() => {
    (async () => {
      const res = await Axios.get('/api/part_detection_scenarios');
      setdemoProjectData(
        res.data.map((e) => ({
          id: e.id,
          name: e.name,
          inferenceMode: e.inference_mode,
          trainingProject: e.project,
          camera: e.camera,
          parts: e.parts,
        })),
      );
    })();
  }, []);

  const [selectedDemoIdx, setselectedDemoIdx] = useState(-1);
  const openPanel = (name: string) => () =>
    setselectedDemoIdx(demoProjectData.findIndex((e) => e.name === name));
  const closePanel = () => setselectedDemoIdx(-1);

  return (
    <>
      <Stack horizontalAlign="center">
        <h4>Get started with our pre-built scenarios</h4>
        <Text>
          Choose one of the following pre-trained templates to start running inferences on demo or custom
          cameras
        </Text>
        <div className={classes.gridContainer}>
          {demoProjectsInfo.map((info) => (
            <DemoCard
              key={info.title}
              title={info.title}
              subTitle={info.subTitle}
              onClick={openPanel(info.title)}
              available={!!demoProjectData.find((e) => e.name === info.title)}
            />
          ))}
        </div>
      </Stack>
      <ConfigTaskPanel
        isOpen={selectedDemoIdx > -1}
        onDismiss={closePanel}
        projectData={{ ...initialProjectData, ...demoProjectData[selectedDemoIdx] }}
        isDemo
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
