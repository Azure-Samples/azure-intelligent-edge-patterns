import React, { useEffect, useRef } from 'react';
import { Stage, FastLayer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import useImage from '../LabelingPage/util/useImage';

export const LiveViewScene: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const layerRef = useRef(null);

  const [imgEle, _, { width: imgWidth, height: imgHeight }] = useImage(
    `http://${window.location.hostname}:5000/video_feed?inference=1`,
    '',
  );

  /* The component need to support image with Content-type "multipart/x-mixed-replace",
     which will keep updating the image data.
     Keep updating the canvas by using Konva.Animation so we can see the latest image.
  */
  useEffect(() => {
    const anim = new Konva.Animation(() => {}, layerRef.current);
    anim.start();

    return (): void => {
      anim.stop();
    };
  }, []);

  useEffect(() => {
    const { width: divWidth, height: divHeight } = divRef.current.getBoundingClientRect();
    stageRef.current.width(divWidth);
    stageRef.current.height(divHeight);
  }, []);

  /* Fit Image to Stage */
  useEffect(() => {
    if (imgWidth !== 0 && imgHeight !== 0) {
      const { width: stageWidth, height: stageHeight } = stageRef.current.size();
      const scale = Math.min(stageWidth / imgWidth, stageHeight / imgHeight);
      layerRef.current.scale({ x: scale, y: scale });

      const offsetX = (stageWidth - imgWidth * scale) / 2;
      const offsetY = (stageHeight - imgHeight * scale) / 2;
      layerRef.current.position({ x: offsetX, y: offsetY });
    }
  }, [imgHeight, imgWidth]);

  return (
    <div ref={divRef} style={{ width: '100%', height: '100%' }}>
      <Stage ref={stageRef}>
        <FastLayer ref={layerRef}>
          <KonvaImage image={imgEle} ref={imgRef} />
        </FastLayer>
      </Stage>
    </div>
  );
};
