import React, { useEffect, useRef } from 'react';
import { Stage, Image as KonvaImage, Shape, Group, Line, Layer, Circle } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';

import { LiveViewProps, MaskProps, AOIBoxProps, AOILayerProps } from './LiveViewContainer.type';

export const LiveViewScene: React.FC<LiveViewProps> = ({ AOIs, setAOIs, visible, imageInfo }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const layerRef = useRef(null);

  const [imgEle, status, { width: imgWidth, height: imgHeight }] = imageInfo;

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
        <Layer ref={layerRef}>
          <KonvaImage image={imgEle} ref={imgRef} />
          {
            /* Render when image is loaded to prevent AOI boxes show in unscale size */
            status === 'loaded' && (
              <AOILayer
                imgWidth={imgWidth}
                imgHeight={imgHeight}
                AOIs={AOIs}
                setAOIs={setAOIs}
                visible={visible}
              />
            )
          }
        </Layer>
      </Stage>
    </div>
  );
};

const AOILayer: React.FC<AOILayerProps> = ({ imgWidth, imgHeight, AOIs, setAOIs, visible }): JSX.Element => {
  return (
    <>
      <Mask width={imgWidth} height={imgHeight} holes={AOIs} visible={visible} />
      {AOIs.map((e, i) => (
        <AOIBox
          key={i}
          box={e}
          visible={visible}
          boundary={{ x1: 0, y1: 0, x2: imgWidth, y2: imgHeight }}
          onBoxChange={(updateBox): void =>
            setAOIs((prev) => {
              const newBox = updateBox(prev[i]);
              if (newBox.x1 > newBox.x2) {
                const tmp = newBox.x1;
                newBox.x1 = newBox.x2;
                newBox.x2 = tmp;
              }

              if (newBox.y1 > newBox.y2) {
                const tmp = newBox.y1;
                newBox.y1 = newBox.y2;
                newBox.y2 = tmp;
              }

              const newAOIs = [...prev];
              newAOIs[i] = newBox;
              return newAOIs;
            })
          }
        />
      ))}
    </>
  );
};

const Mask: React.FC<MaskProps> = ({ width, height, holes, visible }) => {
  return (
    <Shape
      width={width}
      height={height}
      fill={'rgba(0,0,0,0.5)'}
      visible={visible}
      sceneFunc={(ctx, shape): void => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(shape.width(), 0);
        ctx.lineTo(shape.width(), shape.height());
        ctx.lineTo(0, shape.height());
        ctx.lineTo(0, 0);

        // Nonozero-rule
        holes.forEach(({ x1, y1, x2, y2 }) => {
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1, y2);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x2, y1);
          ctx.lineTo(x1, y1);
        });

        ctx.fillStrokeShape(shape);
      }}
      listening={false}
    />
  );
};

const AOIBox: React.FC<AOIBoxProps> = ({ box, onBoxChange, visible, boundary }) => {
  const { x1, y1, x2, y2 } = box;
  const COLOR = 'white';
  const RADIUS = 20;

  const handleDrag = (e: KonvaEventObject<DragEvent>): void => {
    let { x, y } = e.target.position();

    if (x < boundary.x1) {
      x = boundary.x1;
      e.target.x(x);
    }

    if (x > boundary.x2) {
      x = boundary.x2;
      e.target.x(x);
    }

    if (y < boundary.y1) {
      y = boundary.y1;
      e.target.y(y);
    }

    if (y > boundary.y2) {
      y = boundary.y2;
      e.target.y(y);
    }

    switch (e.target.name()) {
      case 'leftTop':
        onBoxChange((prev) => ({ ...prev, x1: x, y1: y }));
        break;
      case 'rightTop':
        onBoxChange((prev) => ({ ...prev, x2: x, y1: y }));
        break;
      case 'rightBottom':
        onBoxChange((prev) => ({ ...prev, x2: x, y2: y }));
        break;
      case 'leftBottom':
        onBoxChange((prev) => ({ ...prev, x1: x, y2: y }));
        break;
      default:
        break;
    }
  };

  return (
    <Group visible={visible}>
      <Line points={[x1, y1, x1, y2, x2, y2, x2, y1]} closed stroke={COLOR} strokeWidth={10} />
      <Circle draggable name="leftTop" x={x1} y={y1} radius={RADIUS} fill={COLOR} onDragMove={handleDrag} />
      <Circle draggable name="rightTop" x={x2} y={y1} radius={RADIUS} fill={COLOR} onDragMove={handleDrag} />
      <Circle
        draggable
        name="rightBottom"
        x={x2}
        y={y2}
        radius={RADIUS}
        fill={COLOR}
        onDragMove={handleDrag}
      />
      <Circle
        draggable
        name="leftBottom"
        x={x1}
        y={y2}
        radius={RADIUS}
        fill={COLOR}
        onDragMove={handleDrag}
      />
    </Group>
  );
};
