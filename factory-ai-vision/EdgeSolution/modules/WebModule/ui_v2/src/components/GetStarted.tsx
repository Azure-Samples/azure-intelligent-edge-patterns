import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { Stack, Text, Image, Link, mergeStyleSets, getTheme, concatStyleSets, IStyle } from '@fluentui/react';
import { Card } from '@uifabric/react-cards';
import { AcceptMediumIcon } from '@fluentui/react-icons';

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
    height: '292px',
    borderRadius: '2px',
  },
  mainSection: {
    display: 'grid',
    gridTemplateColumns: '35px auto',
    gridTemplateRows: '30px auto 20px',
    padding: '14px',
    paddingTop: 0,
  },
  idxIcon: concatStyleSets(idxIconBase, { color: theme.palette.themePrimary, border: '1px solid' }),
  checkIcon: concatStyleSets(idxIconBase, { color: theme.palette.white, backgroundColor: '#5DB300' }),
  mainSectionTitle: { gridColumn: '2 / span 1', gridRow: '1 / span 2', fontWeight: 600, fontSize: '16px' },
  mainSectionContentTxt: { gridColumn: '2 / span 1', gridRow: '2 / span 1', fontSize: '13px' },
  mainSectionAction: { gridColumn: '2 / span 1', gridRow: '3 / span 1', fontSize: '13px' },
});

type GetStartedType = {
  hasCamera: boolean;
  hasImages: boolean;
  hasTask: boolean;
};

export const GetStarted: React.FC<GetStartedType> = ({ hasCamera, hasImages, hasTask }) => {
  return (
    <Stack horizontalAlign="center">
      <Text variant="xLarge" styles={{ root: { margin: '4px' } }}>
        Get started
      </Text>
      <Text>Follow these steps to start using machine learning in your factory</Text>
      <Text styles={{ root: { paddingBottom: '24px' } }}>
        To configure the <Link href="https://www.customvision.ai/">Custom Vision project</Link> go to
        Settings.
      </Text>
      <Stack horizontal tokens={{ childrenGap: 20 }}>
        <GetStartedCard
          no={1}
          checked={hasCamera}
          title="Connect cameras"
          contentTxt="Add and configure the cameras in the factory"
          actionTxt="Go to Cameras"
          actionLink="/cameras"
        />
        <GetStartedCard
          no={2}
          checked={hasImages}
          title="Add images and tag parts"
          contentTxt="Capture images from your video streams and tag parts"
          actionTxt="Go to Images"
          actionLink="/images"
        />
        <GetStartedCard
          no={3}
          checked={hasTask}
          title="Ready to go!"
          contentTxt="Start identifying parts from your cameras’ live streams"
          actionTxt="Begin a task"
          actionLink="/task"
        />
      </Stack>
    </Stack>
  );
};

const GetStartedCard: React.FC<{
  no: number;
  checked: boolean;
  title: string;
  contentTxt: string;
  actionTxt: string;
  actionLink: string;
}> = ({ no, checked, title, contentTxt, actionTxt, actionLink }) => {
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
      <Card.Item fill>
        <Image src="/icon/get-started.png" width="100%" />
      </Card.Item>
      <Card.Section className={cardStyleSets.mainSection}>
        {renderIdxIcon()}
        <Text className={cardStyleSets.mainSectionTitle}>{title}</Text>
        <Text className={cardStyleSets.mainSectionContentTxt}>{contentTxt}</Text>
        <Link className={cardStyleSets.mainSectionAction} to={actionLink} as={ReactRouterLink}>
          {actionTxt} {'>'}
        </Link>
      </Card.Section>
    </Card>
  );
};
