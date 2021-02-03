import React from 'react';

import { VideoAnno } from '../../store/shared/BaseShape';
import { isBBox } from '../../store/shared/Box2d';
import { isLine } from '../../store/shared/Line';
import { isPolygon } from '../../store/shared/Polygon';
import { CreatingState } from '../../store/videoAnnoSlice';
import { Box } from './Box';
import { Mask } from './Mask';
import { Polygon } from './Polygon';

type VideoAnnosGroupProps = {
  imgWidth: number;
  imgHeight: number;
  videoAnnos: VideoAnno[];
  updateVideoAnno: (id: string, changes) => void;
  removeVideoAnno: (id: string) => void;
  visible: boolean;
  creatingState: CreatingState;
  needMask: boolean;
  color?: string;
};

export const VideoAnnosGroup: React.FC<VideoAnnosGroupProps> = ({
  imgWidth,
  imgHeight,
  videoAnnos,
  updateVideoAnno,
  removeVideoAnno,
  visible,
  creatingState,
  needMask,
  color = 'white',
}): JSX.Element => {
  return (
    <>
      {needMask && <Mask width={imgWidth} height={imgHeight} holes={videoAnnos} visible={visible} />}
      {videoAnnos.map((e) => {
        if (isBBox(e)) {
          return (
            <Box
              key={e.id}
              box={{ ...e.vertices, id: e.id }}
              visible={visible}
              boundary={{ x1: 0, y1: 0, x2: imgWidth, y2: imgHeight }}
              onBoxChange={(changes): void => {
                updateVideoAnno(e.id, changes);
              }}
              removeBox={() => removeVideoAnno(e.id)}
              creatingState={creatingState}
              color={color}
              orderIdx={e.order}
            />
          );
        }
        if (isPolygon(e)) {
          return (
            <Polygon
              key={e.id}
              polygon={e.vertices}
              visible={visible}
              removePolygon={() => removeVideoAnno(e.id)}
              creatingState={creatingState}
              handleChange={(idx, vertex) => updateVideoAnno(e.id, { idx, vertex })}
              boundary={{ x1: 0, y1: 0, x2: imgWidth, y2: imgHeight }}
              color={color}
              orderIdx={e.order}
            />
          );
        }
        if (isLine(e)) {
          return (
            <Polygon
              key={e.id}
              polygon={e.vertices}
              visible={visible}
              removePolygon={() => removeVideoAnno(e.id)}
              creatingState={creatingState}
              handleChange={(idx, vertex) => updateVideoAnno(e.id, { idx, vertex })}
              boundary={{ x1: 0, y1: 0, x2: imgWidth, y2: imgHeight }}
              color={color}
              orderIdx={e.order}
            />
          );
        }
        return null;
      })}
    </>
  );
};
