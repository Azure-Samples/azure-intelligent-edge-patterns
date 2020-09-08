import React from 'react';
import { Stack, Text, Link } from '@fluentui/react';
import { Card } from '@uifabric/react-cards';

type GetStartedProps = {};

export const GetStarted: React.FC<GetStartedProps> = () => {
  return (
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
          onClick={() => {}}
        />
        <DemoCard
          title="Employee safety"
          subTitle="Detect if person is standing too close to a machine"
          onClick={() => {}}
        />
        <DemoCard title="Defect detection" subTitle="Detect products with defects" onClick={() => {}} />
        <DemoCard
          title="Machine misalignment"
          subTitle="Detect if a machine is now aligned or working correctly"
        />
        <DemoCard title="Tool detection" subTitle="Detect when an employee is using the wrong tool" />
        <DemoCard title="Part confirmation" subTitle="Detect if the correct part is being used" />
      </div>
    </Stack>
  );
};

type DemoCardProps = {
  title: string;
  subTitle: string;
  onClick?: () => void;
};

export const DemoCard: React.FC<DemoCardProps> = ({ title, subTitle, onClick }) => {
  return (
    <Card styles={{ root: { padding: '20px', alignItems: 'flex-start' } }}>
      <h4>{title}</h4>
      <Text styles={{ root: { height: '100px' } }}>{subTitle}</Text>
      {onClick ? (
        <Link>{'Deploy scenario >'}</Link>
      ) : (
        <Text styles={{ root: { backgroundColor: 'rgba(242, 201, 76, 0.8)', padding: '2px 8px' } }}>
          COMING SOON
        </Text>
      )}
    </Card>
  );
};
