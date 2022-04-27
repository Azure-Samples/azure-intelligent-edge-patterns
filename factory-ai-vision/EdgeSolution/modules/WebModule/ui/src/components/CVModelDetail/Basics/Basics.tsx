import React from 'react';
import { Stack, Link, Icon } from '@fluentui/react';

import { TrainingProject } from '../../../store/trainingProjectSlice';
import { getBasicsClasses } from '../styles';

interface Props {
  cvModel: TrainingProject;
}

const Basics: React.FC<Props> = (props) => {
  const { cvModel } = props;

  const classes = getBasicsClasses();

  return (
    <section>
      <Stack tokens={{ childrenGap: 6 }} className={classes.infoWrapper}>
        <Stack horizontal>
          <Stack.Item className={classes.infoTitle}>
            <span>Name</span>
          </Stack.Item>
          <Stack.Item>
            <span>{cvModel.name}</span>
          </Stack.Item>
        </Stack>
        <Stack horizontal>
          <Stack.Item className={classes.infoTitle}>
            <span>Type</span>
          </Stack.Item>
          <Stack.Item>
            <span>{cvModel.projectType}</span>
          </Stack.Item>
        </Stack>
        <Stack horizontal>
          <Stack.Item className={classes.infoTitle}>
            <span>Source</span>
          </Stack.Item>
          <Stack.Item>
            <span>Microsoft Custom Vision</span>
          </Stack.Item>
        </Stack>
        <Stack horizontal>
          <Stack.Item className={classes.infoTitle}>
            <span>Performance</span>
          </Stack.Item>
          <Stack.Item>
            <Link
              target="_blank"
              href={`https://www.customvision.ai/projects/${cvModel.customVisionId}#/performance`}
            >
              <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
                <span>{cvModel.name} performance</span>
                <Icon styles={{ root: { color: '#0078D4' } }} iconName="OpenInNewWindow" />
              </Stack>
            </Link>
          </Stack.Item>
        </Stack>
      </Stack>
      <Stack></Stack>
    </section>
  );
};

export default Basics;
