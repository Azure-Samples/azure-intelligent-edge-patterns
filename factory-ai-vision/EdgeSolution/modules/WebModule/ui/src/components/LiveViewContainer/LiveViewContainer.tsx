import React, { useState, useEffect } from 'react';

import { Text, Image, Checkbox, Flex, Button } from '@fluentui/react-northstar';

export const LiveViewContainer: React.FC<{ showVideo: boolean }> = ({ showVideo }) => {
  const [showAOI, setShowAOI] = useState(true);
  const [AOIs, setAOIs] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [showUpdateSuccessTxt, setShowUpdateSuccessTxt] = useState(false);
  const [hasEdit, setHasEdit] = useState(true);

  const onCheckboxClick = () => {
    setShowAOI((prev) => !prev);
  };

  const onUpdate = () => {
    // TODO API
    setShowUpdateSuccessTxt(true);
  };

  useEffect(() => {
    if (showUpdateSuccessTxt) {
      const timer = setTimeout(() => {
        setShowUpdateSuccessTxt(false);
      }, 3000);
      return (): void => clearTimeout(timer);
    }
  }, [showUpdateSuccessTxt]);

  const updateBtnDisabled = !showAOI || !hasEdit;

  return (
    <Flex column gap="gap.medium">
      <Text styles={{ width: '150px' }} size="large">
        Live View:
      </Text>
      <Flex hAlign="end" gap="gap.small" vAlign="center">
        <Checkbox
          labelPosition="start"
          label="Show area of interest"
          toggle
          checked={showAOI}
          onClick={onCheckboxClick}
        />
        <Button content="Update" primary disabled={updateBtnDisabled} onClick={onUpdate} />
        <Text styles={{ visibility: showUpdateSuccessTxt ? 'visible' : 'hidden' }}>Updated!</Text>
      </Flex>
      <div style={{ width: '100%', height: '600px', backgroundColor: 'black' }}>
        {showVideo ? (
          <Image
            src={`http://${window.location.hostname}:5000/video_feed?inference=1`}
            styles={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : null}
      </div>
    </Flex>
  );
};
