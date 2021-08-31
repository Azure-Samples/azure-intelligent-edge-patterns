/* eslint react/display-name: "off" */

import React, { useEffect, useState, useMemo } from 'react';
import { compose } from 'ramda';
import { useHistory } from 'react-router-dom';
import {
  Stack,
  PrimaryButton,
  CommandBar,
  ICommandBarItemProps,
  getTheme,
  Label,
  Text,
  Link,
  Icon,
} from '@fluentui/react';

import { TrainingProject } from '../../store/trainingProjectSlice';
import { useQuery } from '../../hooks/useQuery';

import { Url } from '../../enums';

import ModelCard from './ModelCard';
import EditPanel from './Panel/EditPanel';

export type ModelType = 'custom' | 'own' | 'ovms';

type PassingProps = {
  trainingProjectList: TrainingProject[];
  onOpenCustomVision: () => void;
  onOpenIntelOvms: () => void;
  onOpenOwnUpload: () => void;
};

type ModelsProps = {
  trainingProjectList: TrainingProject[];
};

const theme = getTheme();

const openIcon = { iconName: 'ChevronDown' };
const closeIcon = { iconName: 'ChevronUp' };

const BaseModel: React.FC<ModelsProps> = (props) => {
  const { trainingProjectList } = props;

  const [isIntelProjectClick, setIsIntelProjectClick] = useState(true);
  const [isOwnProject, setIsOwnProject] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const modelId = parseInt(useQuery().get('modelId'), 10);
  const history = useHistory();

  const intelProjectList = trainingProjectList.filter((project) => project.category === 'openvino');
  const ownProjectList = trainingProjectList.filter((project) => project.category === 'customvision');

  useEffect(() => {
    if (modelId) {
      setSelectedProjectId(modelId);
    }
  }, [modelId]);

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Public Models',
        iconProps: isIntelProjectClick ? openIcon : closeIcon,
        onClick: () => setIsIntelProjectClick((prev) => !prev),
      },
    ],
    [isIntelProjectClick],
  );

  const ownCommandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Your Models',
        iconProps: isOwnProject ? openIcon : closeIcon,
        onClick: () => setIsOwnProject((prev) => !prev),
      },
    ],
    [isOwnProject, setIsOwnProject],
  );

  return (
    <>
      <Stack tokens={{ childrenGap: '40' }}>
        <Stack tokens={{ childrenGap: '16' }}>
          <CommandBar
            items={commandBarItems}
            styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
          />
          {isIntelProjectClick && (
            <Stack horizontal tokens={{ childrenGap: '10px' }} wrap>
              {intelProjectList.map((project, i) => (
                <ModelCard
                  key={i}
                  project={project}
                  onSelectedProject={() => {
                    history.push(`${Url.MODELS}?modelId=${project.id}`);
                    setSelectedProjectId(project.id);
                  }}
                  onDismiss={() => {
                    setSelectedProjectId(null);
                    history.push(Url.MODELS);
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
        <Stack tokens={{ childrenGap: '16' }}>
          <CommandBar
            items={ownCommandBarItems}
            styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
          />
          {isOwnProject && (
            <Stack horizontal tokens={{ childrenGap: '10px' }} wrap>
              {ownProjectList.map((project, i) => (
                <ModelCard
                  key={i}
                  project={project}
                  onSelectedProject={() => {
                    history.push(`${Url.MODELS}?modelId=${project.id}`);
                    setSelectedProjectId(project.id);
                  }}
                  onDismiss={() => {
                    setSelectedProjectId(null);
                    history.push(Url.MODELS);
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
      {selectedProjectId && (
        <EditPanel
          projectId={selectedProjectId}
          onDismiss={() => {
            setSelectedProjectId(null);
            history.push(Url.MODELS);
          }}
        />
      )}
    </>
  );
};

const NEW_MODELS = [
  {
    imagePath: '/icons/customVision.png',
    title: 'Create Custom',
    subTitle:
      'Use Microsoft’s Custom Vision to create your own model by training tag association with an image dataset.',
    type: 'custom' as ModelType,
  },
  {
    imagePath: '/icons/browse.png',
    title: 'Browse',
    subTitle: 'Choose from an existing library of models populated by Intel OpenVino.',
    type: 'ovms' as ModelType,
  },
  // {
  //   imagePath: '/icons/ownModel.png',
  //   title: 'Create Custom',
  //   subTitle:
  //     'Use Microsoft’s Custom Vision to create your own model by training tag association with an image dataset.',
  //   type: 'own' as ModelType,
  // },
];

export default compose(
  (BaseComponent: React.ComponentType<ModelsProps>): React.FC<PassingProps> => (props) => {
    const { onOpenCustomVision, onOpenIntelOvms, onOpenOwnUpload, trainingProjectList } = props;

    // const trainingProjectIsPredictionModelSelector = trainingProjectIsPredictionModelFactory();
    // const trainingProjectIsPredictionModel = useSelector(trainingProjectIsPredictionModelSelector);

    if (trainingProjectList.length === 0) {
      return (
        <Stack styles={{ root: { color: '#323130' } }}>
          <Stack styles={{ root: { textAlign: 'center' } }} horizontalAlign="center">
            <Label styles={{ root: { fontSize: '20px', lineHeight: '28px' } }}>
              Manage your machine learning models
            </Label>
            <Text
              styles={{
                root: { fontSize: '13px', lineHeight: '18px', width: '560px' },
              }}
            >
              Create a custom model with Microsoft Custom Vision, browse Intel’s library of models, or upload
              your own. Manage them all in one place.{' '}
              <Link
                target="_blank"
                href="https://github.com/Azure-Samples/azure-intelligent-edge-patterns/tree/master/factory-ai-vision"
              >
                Learn more
              </Link>
            </Text>
          </Stack>
          <Stack
            style={{ marginTop: '40px' }}
            horizontal
            tokens={{ childrenGap: 16 }}
            horizontalAlign="center"
          >
            {NEW_MODELS.map((model, id) => (
              <div key={id} style={{ width: '300px' }}>
                <img style={{ height: '180px' }} src={model.imagePath} alt="icon" />
                <Stack>
                  <Label styles={{ root: { marginTop: '16px', fontSize: '16px', lineHeight: '22px' } }}>
                    {model.title}
                  </Label>
                  <Text styles={{ root: { marginTop: '4px', fontSize: '13px', lineHeight: '18px' } }}>
                    {model.subTitle}
                  </Text>
                </Stack>
                <PrimaryButton
                  styles={{ root: { marginTop: '12px' } }}
                  allowDisabledFocus
                  text={model.title}
                  onClick={() => {
                    model.type === 'custom' && onOpenCustomVision();
                    model.type === 'ovms' && onOpenIntelOvms();
                    model.type === 'own' && onOpenOwnUpload();
                  }}
                />

                {model.type === 'ovms' && (
                  <Stack styles={{ root: { marginTop: '7px' } }}>
                    <Link
                      target="_blank"
                      href="https://docs.openvinotoolkit.org/latest/omz_models_group_intel.html"
                    >
                      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }}>
                        <Text>Intel</Text>
                        <Icon styles={{ root: { color: '#0078D4' } }} iconName="OpenInNewWindow" />
                      </Stack>
                    </Link>
                  </Stack>
                )}
              </div>
            ))}
          </Stack>
        </Stack>
      );
    }

    return <BaseComponent trainingProjectList={trainingProjectList} />;
  },
)(BaseModel);
