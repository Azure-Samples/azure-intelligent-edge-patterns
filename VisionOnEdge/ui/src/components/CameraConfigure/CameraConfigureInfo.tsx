import React from 'react';
import { Flex, Text, Status, Button, Image, Loader } from '@fluentui/react-northstar';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { useInterval } from '../../hooks/useInterval';
import { thunkDeleteProject, thunkGetProject } from '../../store/project/projectActions';
import { Project } from '../../store/project/projectTypes';
import { State } from '../../store/State';

export const CameraConfigureInfo: React.FC = () => {
  const { isLoading, error, data: project } = useSelector<State, Project>((state) => state.project);
  const dispatch = useDispatch();
  const { projectId, name } = useParams();
  const history = useHistory();

  const onDeleteConfigure = (): void => {
    // eslint-disable-next-line no-restricted-globals
    const sureDelete = confirm('Delete this configuration?');
    if (!sureDelete) return;
    const result = (dispatch(thunkDeleteProject(projectId)) as unknown) as Promise<any>;
    result
      .then((data) => {
        if (data) return history.push(`/cameras/${name}`);
        return void 0;
      })
      .catch((err) => console.error(err));
  };

  /**
   * Call custom Vision to export
   */
  useInterval(() => {
    Axios.get(`/api/projects/${projectId}/export`);
  }, 5000);

  useInterval(
    () => {
      dispatch(thunkGetProject());
    },
    project.modelUrl ? null : 5000,
  );

  return (
    <Flex column gap="gap.large">
      <h1>Configuration</h1>
      {!project.modelUrl ? (
        <Loader size="largest" label="Trainning" labelPosition="below" design={{ paddingTop: '300px' }} />
      ) : (
        <>
          <ListItem title="Status" content={<CameraStatus online={project.status === 'online'} />} />
          <ListItem title="Configured for" content={project.parts.join(', ')} />
          <span>Model Url: </span>
          <a href={project.modelUrl}>{project.modelUrl}</a>
          <Flex column gap="gap.small">
            <Text styles={{ width: '150px' }} size="large">
              Live View:
            </Text>
            <Flex
              styles={{
                width: '80%',
                height: '400px',
                backgroundColor: 'rgb(188, 188, 188)',
              }}
              vAlign="center"
              hAlign="center"
            >
              <Image src="/icons/Play.png" styles={{ ':hover': { cursor: 'pointer' } }} />
            </Flex>
          </Flex>
          <ListItem
            title="Success Rate"
            content={
              <Text styles={{ color: 'rgb(244, 152, 40)', fontWeight: 'bold' }} size="large">
                {`${project.successRate}%`}
              </Text>
            }
          />
          <ListItem title="Successful Inferences" content={project.successfulInferences} />
          <ListItem
            title="Unidentified Items"
            content={
              <>
                <Text styles={{ margin: '5px' }} size="large">
                  {project.unIdetifiedItems}
                </Text>
                <Button
                  content="Identify Manually"
                  primary
                  styles={{
                    backgroundColor: 'red',
                    marginLeft: '100px',
                    ':hover': {
                      backgroundColor: '#A72037',
                    },
                    ':active': {
                      backgroundColor: '#8E192E',
                    },
                  }}
                  as={Link}
                  to="/"
                />
              </>
            }
          />
          <Button primary onClick={onDeleteConfigure}>
            Delete Configuration
          </Button>
        </>
      )}
    </Flex>
  );
};

const ListItem = ({ title, content }): JSX.Element => {
  const getContent = (): JSX.Element => {
    if (typeof content === 'string' || typeof content === 'number')
      return <Text size="large">{content}</Text>;
    return content;
  };

  return (
    <Flex vAlign="center">
      <Text styles={{ width: '200px' }} size="large">{`${title}: `}</Text>
      {getContent()}
    </Flex>
  );
};

const CameraStatus = ({ online }): JSX.Element => {
  const text = online ? 'Online' : 'Offline';
  const state = online ? 'success' : 'unknown';

  return (
    <Flex gap="gap.smaller" vAlign="center">
      <Status state={state} />
      <Text styles={{ margin: '5px' }} size="large">
        {text}
      </Text>
    </Flex>
  );
};
