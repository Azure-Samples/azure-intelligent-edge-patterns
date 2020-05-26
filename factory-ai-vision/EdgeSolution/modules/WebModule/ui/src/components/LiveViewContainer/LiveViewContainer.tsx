import React, { useState } from 'react';

import { Text, Image } from '@fluentui/react-northstar';

enum UpdateStatus {
  Idle,
  Ready,
  Loading,
  Success,
  Failed,
}

export const LiveViewContainer: React.FC<{ showVideo: boolean }> = ({ showVideo }) => {
  const [showAOI, setShowAOI] = useState(true);
  const [AOIs, setAOIs] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [updateStatus, setUpdateStatus] = useState(UpdateStatus.Idle);

  return (
    <>
      <Text styles={{ width: '150px' }} size="large">
        Live View:
      </Text>
      <div style={{ width: '100%', height: '600px', backgroundColor: 'black' }}>
        {showVideo ? (
          <Image
            src={`http://${window.location.hostname}:5000/video_feed?inference=1`}
            styles={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : null}
      </div>
    </>
  );
};
