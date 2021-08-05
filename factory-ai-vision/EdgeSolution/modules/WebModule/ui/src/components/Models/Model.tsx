/* eslint react/display-name: "off" */

import React, { useEffect, useState, useMemo } from 'react';
import { isEmpty, compose } from 'ramda';
import { useSelector, useDispatch } from 'react-redux';
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

import {
  getTrainingProject,
  trainingProjectIsPredictionModelFactory,
  TrainingProject as TrainingProjectType,
} from '../../store/trainingProjectSlice';

import { Url } from '../../enums';
// import { ModelType } from './type';

import { EmptyAddIcon } from '../EmptyAddIcon';
import ModelCard from './ModelCard';

export type ModelType = 'custom' | 'own' | 'ovms';

type PassingProps = {
  // onOpen: () => void;
  // onPanelTypeChange: (type: ModelType) => void;
  onOpenCustomVision: () => void;
  onOpenIntelOvms: () => void;
  onOpenOwnUpload: () => void;
};

type ModelsProps = {
  trainingProject: TrainingProjectType[];
};

const theme = getTheme();

const openIcon = { iconName: 'ChevronDown' };
const closeIcon = { iconName: 'ChevronUp' };

const BaseModel: React.FC<ModelsProps> = (props) => {
  const { trainingProject } = props;

  const [isCVProjectClick, setIsCVProjectClick] = useState(true);
  const [isOwnProject, setIsOwnProject] = useState(true);

  const history = useHistory();

  const cvProject = trainingProject.filter((project) => project.predictionUri === '');
  const ownProject = trainingProject.filter((project) => project.predictionUri !== '');

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Public Models',
        iconProps: isCVProjectClick ? openIcon : closeIcon,
        onClick: () => setIsCVProjectClick((prev) => !prev),
      },
    ],
    [isCVProjectClick],
  );

  const commandBarItems2: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Your Models',
        iconProps: isOwnProject ? openIcon : closeIcon,
        onClick: () => setIsOwnProject((prev) => !prev),
      },
    ],
    [isOwnProject],
  );

  return (
    <Stack tokens={{ childrenGap: '40' }}>
      <Stack tokens={{ childrenGap: '16' }}>
        {/* <ActionButton text="Public Models" /> */}
        {/* <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        /> */}
        <Stack horizontal tokens={{ childrenGap: '10px' }}>
          {cvProject.map((project, i) => (
            <ModelCard key={i} project={project} />
          ))}
        </Stack>
      </Stack>
      {/* <Stack tokens={{ childrenGap: '16' }}>
        <CommandBar
          items={commandBarItems2}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        {isOwnProject && (
          <Stack horizontal tokens={{ childrenGap: '10px' }}>
            {ownProject.map((project, i) => (
              <ModelCard key={i} project={project} />
            ))}
          </Stack>
        )}
      </Stack> */}
    </Stack>
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
    const { onOpenCustomVision, onOpenIntelOvms, onOpenOwnUpload } = props;

    const trainingProjectIsPredictionModelSelector = trainingProjectIsPredictionModelFactory();
    const trainingProjectIsPredictionModel = useSelector(trainingProjectIsPredictionModelSelector);

    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(getTrainingProject(true));
    }, [dispatch]);

    if (isEmpty(trainingProjectIsPredictionModel)) {
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
            {NEW_MODELS.map((model) => (
              <div style={{ width: '300px' }}>
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

    return <BaseComponent trainingProject={trainingProjectIsPredictionModel} />;
  },
)(BaseModel);
