import React, { useState, useEffect } from 'react';
import { Stack, Text, Link } from '@fluentui/react';
import { Card } from '@uifabric/react-cards';
import Axios from 'axios';

import { ConfigTaskPanel } from './ConfigTaskPanel';
import { ProjectData } from '../store/project/projectTypes';
import { initialProjectData } from '../store/project/projectReducer';

type GetStartedProps = {};

type DemoProject = Pick<
  ProjectData,
  'id' | 'name' | 'inferenceMode' | 'trainingProject' | 'camera' | 'parts'
>;

export const GetStarted: React.FC<GetStartedProps> = () => {
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

  const [selectedDemo, setselectedDemo] = useState(-1);
  const openPanel = (name: string) => () =>
    setselectedDemo(demoProjectData.findIndex((e) => e.name === name));
  const closePanel = () => setselectedDemo(-1);

  return (
    <>
      <Stack horizontalAlign="center">
        <h4>Get started with our pre-built scenarios</h4>
        <Text>
          Choose one of the following pre-trained templates to start running inferences on demo or custom
          cameras
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplate: 'repeat(3, 1fr) / repeat(3, 1fr)',
            gridGap: '12px',
            marginTop: '24px',
          }}
        >
          <DemoCard
            title="Counting objects"
            subTitle="Identify and count the number of objects in the factory"
            onClick={openPanel('Counting objects')}
            available={!!demoProjectData.find((e) => e.name === 'Counting objects')}
          />
          <DemoCard
            title="Employee safety"
            subTitle="Detect if person is standing too close to a machine"
            onClick={openPanel('Employee safety')}
            available={!!demoProjectData.find((e) => e.name === 'Employee safety')}
          />
          <DemoCard
            title="Defect detection"
            subTitle="Detect products with defects"
            onClick={openPanel('Defect detection')}
            available={!!demoProjectData.find((e) => e.name === 'Defect detection')}
          />
          <DemoCard
            title="Machine misalignment"
            subTitle="Detect if a machine is now aligned or working correctly"
            onClick={openPanel('Machine misalignment')}
            available={!!demoProjectData.find((e) => e.name === 'Machine misalignment')}
          />
          <DemoCard
            title="Tool detection"
            subTitle="Detect when an employee is using the wrong tool"
            onClick={openPanel('Tool detection')}
            available={!!demoProjectData.find((e) => e.name === 'Tool detection')}
          />
          <DemoCard
            title="Part confirmation"
            subTitle="Detect if the correct part is being used"
            onClick={openPanel('Tool detection')}
            available={!!demoProjectData.find((e) => e.name === 'Part confirmation')}
          />
        </div>
      </Stack>
      <ConfigTaskPanel
        isOpen={selectedDemo > -1}
        onDismiss={closePanel}
        projectData={{ ...initialProjectData, ...demoProjectData[selectedDemo] }}
        isDemo
      />
    </>
  );
};

type DemoCardProps = {
  title: string;
  subTitle: string;
  onClick?: () => void;
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
