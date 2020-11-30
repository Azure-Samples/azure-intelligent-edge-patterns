import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import {
  Stack,
  Text,
  Image,
  Link,
  mergeStyleSets,
  getTheme,
  concatStyleSets,
  IStyle,
  ImageFit,
} from '@fluentui/react';
import { Card } from '@uifabric/react-cards';
import { AcceptMediumIcon } from '@fluentui/react-icons';
import { connect } from 'react-redux';

import { State } from 'RootStateType';
import { CreateProjectDialog } from '../CreateProjectDialog';
import { selectNonDemoCameras } from '../../store/cameraSlice';
import { selectAllImages } from '../../store/imageSlice';

const theme = getTheme();

const idxIconBase: IStyle = {
  borderRadius: '12px',
  width: '20px',
  height: '20px',
  fontSize: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '12px',
};
const cardStyleSets = mergeStyleSets({
  container: {
    width: '300px',
    height: '320px',
    borderRadius: '2px',
  },
  imgSection: {
    height: '169px',
    backgroundColor: '#F2F2F2',
  },
  mainSection: {
    display: 'grid',
    gridTemplateColumns: '24px auto',
    columnGap: '11px',
    gridTemplateRows: '1fr 1fr 1fr',
    rowGap: '4px',
    padding: '14px',
    paddingTop: 0,
    height: '150px',
  },
  idxIcon: concatStyleSets(idxIconBase, { color: theme.palette.themePrimary, border: '1px solid' }),
  checkIcon: concatStyleSets(idxIconBase, { color: theme.palette.white, backgroundColor: '#5DB300' }),
  mainSectionTitle: { gridColumn: '2 / span 1', gridRow: '1 / span 2', fontWeight: 600, fontSize: '16px' },
  mainSectionContentTxt: { gridColumn: '2 / span 1', gridRow: '2 / span 1', fontSize: '13px' },
  mainSectionAction: { gridColumn: '2 / span 1', gridRow: '3 / span 1', fontSize: '13px', margin: 0 },
});

type OwnProps = {
  hasTask: boolean;
};

type CustomizeProps = OwnProps & {
  hasCVProject: boolean;
  hasCamera: boolean;
  hasImages: boolean;
};

const mapState = (state: State, ownProps: OwnProps): CustomizeProps => ({
  ...ownProps,
  hasCVProject: Boolean(state.trainingProject.entities[state.trainingProject.nonDemo[0]].customVisionId),
  hasCamera: selectNonDemoCameras(state).length > 0,
  hasImages: selectAllImages(state).length > 0,
});

const Component: React.FC<CustomizeProps> = ({ hasCVProject, hasCamera, hasImages, hasTask }) => {
  return (
    <Stack horizontalAlign="center">
      <Stack horizontalAlign="center" styles={{ root: { paddingTop: 60, paddingBottom: 40 } }}>
        <Text variant="xLarge" styles={{ root: { margin: '4px' } }}>
          Customize to use your own videos and images
        </Text>
        <Text>Follow these steps to start using machine learning in your factory</Text>
      </Stack>
      <Stack horizontal tokens={{ childrenGap: 20 }}>
        <GetStartedCard
          no={1}
          checked={hasCVProject}
          title="Create your own project"
          contentTxt="Name your project in the factory"
          onRenderActionLink={() => (
            <div className={cardStyleSets.mainSectionAction}>
              <CreateProjectDialog />
            </div>
          )}
          src="/icons/get-started.png"
        />
        <GetStartedCard
          no={2}
          checked={hasCVProject && hasCamera}
          title="Connect your own video feed"
          contentTxt="Add and configure the cameras in the factory"
          actionTxt="Go to Cameras"
          actionLink="/cameras"
          src="/icons/customize_1.svg"
        />
        <GetStartedCard
          no={3}
          checked={hasCVProject && hasImages && hasCamera}
          title="Capture images and tag objects"
          contentTxt="Capture images from your video streams and tag objects"
          actionTxt="Go to Images"
          actionLink="/images"
          src="/icons/customize_2.svg"
        />
        <GetStartedCard
          no={4}
          checked={hasCVProject && hasTask && hasImages && hasCamera}
          title="Ready to go!"
          contentTxt="Start identifying parts from your cameras’ live streams"
          actionTxt="Begin a task"
          actionLink="/home/deployment"
          src="/icons/customize_3.svg"
        />
      </Stack>
      <Stack horizontalAlign="center" styles={{ root: { paddingTop: 50 } }}>
        <Text className={cardStyleSets.mainSectionContentTxt} styles={{ root: { margin: '4px' } }}>
          Already have your own Custom Vision module?
        </Text>
        <Link className={cardStyleSets.mainSectionContentTxt} to="/models" as={ReactRouterLink}>
          {'Go to modules >'}
        </Link>
      </Stack>
    </Stack>
  );
};

export const GetStarted = connect(mapState)(Component);

const GetStartedCard: React.FC<{
  no: number;
  checked: boolean;
  title: string;
  contentTxt: string;
  actionTxt?: string;
  actionLink?: string;
  onRenderActionLink?: () => JSX.Element;
  src: string;
}> = ({ no, checked, title, contentTxt, actionTxt, actionLink, src, onRenderActionLink }) => {
  const renderIdxIcon = (): JSX.Element =>
    checked ? (
      <div className={cardStyleSets.checkIcon}>
        <AcceptMediumIcon />
      </div>
    ) : (
      <div className={cardStyleSets.idxIcon}>
        <p>{no}</p>
      </div>
    );

  return (
    <Card className={cardStyleSets.container}>
      <Card.Item fill className={cardStyleSets.imgSection}>
        <Image src={src} height="100%" imageFit={ImageFit.contain} />
      </Card.Item>
      <Card.Section className={cardStyleSets.mainSection}>
        {renderIdxIcon()}
        <Text className={cardStyleSets.mainSectionTitle}>{title}</Text>
        <Text className={cardStyleSets.mainSectionContentTxt}>{contentTxt}</Text>
        {onRenderActionLink ? (
          onRenderActionLink()
        ) : (
          <Link className={cardStyleSets.mainSectionAction} to={actionLink} as={ReactRouterLink}>
            {actionTxt} {'>'}
          </Link>
        )}
      </Card.Section>
    </Card>
  );
};
