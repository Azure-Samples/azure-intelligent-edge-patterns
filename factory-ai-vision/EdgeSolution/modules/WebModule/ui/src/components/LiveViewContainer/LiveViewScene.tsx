import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Stage,
  Image as KonvaImage,
  Shape as KonvaShape,
  Group,
  Line,
  Layer,
  Circle,
  Path,
} from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';

import { LiveViewProps, MaskProps, AOIBoxProps, AOILayerProps } from './LiveViewContainer.type';
import { CreatingState } from '../../store/AOISlice';
import { isBBox } from '../../store/shared/Box2d';
import { isPolygon } from '../../store/shared/Polygon';
import { Shape } from '../../store/shared/BaseShape';

const getRelativePosition = (layer: Konva.Layer): { x: number; y: number } => {
  const transform = layer.getAbsoluteTransform().copy();
  transform.invert();
  const pos = layer.getStage().getPointerPosition();
  return transform.point(pos);
};

export const LiveViewScene: React.FC<LiveViewProps> = ({
  AOIs,
  creatingShape,
  onCreatingPoint,
  updateAOI,
  removeAOI,
  finishLabel,
  visible,
  imageInfo,
  creatingState,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const layerRef = useRef<Konva.Layer>(null);

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

  const onMouseDown = (e: KonvaEventObject<MouseEvent>): void => {
    if (creatingState === CreatingState.Disabled) return;

    const { x, y } = getRelativePosition(e.target.getLayer());
    onCreatingPoint({ x, y });
  };

  const onMouseMove = (e: KonvaEventObject<MouseEvent>): void => {
    if (creatingState !== CreatingState.Creating) return;

    const { x, y } = getRelativePosition(e.target.getLayer());
    if (creatingShape === Shape.BBox) updateAOI(AOIs[AOIs.length - 1].id, { x2: x, y2: y });
    else if (creatingShape === Shape.Polygon)
      updateAOI(AOIs[AOIs.length - 1].id, { idx: -1, vertex: { x, y } });
  };

  useEffect(() => {
    const div = divRef.current;
    const handleFPress = (e) => {
      if (e.key === 'f') {
        finishLabel();
      }
    };
    div.addEventListener('keydown', handleFPress);
    return () => {
      div.removeEventListener('keydown', handleFPress);
    };
  }, []);

  return (
    <div ref={divRef} style={{ width: '100%', height: '100%' }} tabIndex={0}>
      <Stage ref={stageRef} style={{ cursor: creatingState !== CreatingState.Disabled ? 'crosshair' : '' }}>
        <Layer ref={layerRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove}>
          <KonvaImage image={imgEle} ref={imgRef} />
          {
            /* Render when image is loaded to prevent AOI boxes show in unscale size */
            status === 'loaded' && (
              <AOILayer
                imgWidth={imgWidth}
                imgHeight={imgHeight}
                AOIs={AOIs}
                updateAOI={updateAOI}
                removeAOI={removeAOI}
                visible={visible}
                creatingState={creatingState}
              />
            )
          }
        </Layer>
      </Stage>
    </div>
  );
};

const AOILayer: React.FC<AOILayerProps> = ({
  imgWidth,
  imgHeight,
  AOIs,
  updateAOI,
  removeAOI,
  visible,
  creatingState,
}): JSX.Element => {
  return (
    <>
      {/* <Mask width={imgWidth} height={imgHeight} holes={AOIs} visible={visible} /> */}
      {AOIs.map((e) => {
        if (isBBox(e)) {
          return (
            <AOIBox
              key={e.id}
              box={{ ...e.vertices, id: e.id }}
              visible={visible}
              boundary={{ x1: 0, y1: 0, x2: imgWidth, y2: imgHeight }}
              onBoxChange={(changes): void => {
                updateAOI(e.id, changes);
              }}
              removeBox={() => removeAOI(e.id)}
              creatingState={creatingState}
            />
          );
        }
        if (isPolygon(e)) {
          return (
            <AOIPolygon
              key={e.id}
              id={e.id}
              polygon={e.vertices}
              visible={true}
              removeBox={() => removeAOI(e.id)}
              creatingState={creatingState}
              handleChange={(idx, vertex) => updateAOI(e.id, { idx, vertex })}
              boundary={{ x1: 0, y1: 0, x2: imgWidth, y2: imgHeight }}
            />
          );
        }
        return null;
      })}
    </>
  );
};

const Mask: React.FC<MaskProps> = ({ width, height, holes, visible }) => {
  return (
    <KonvaShape
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

const AOIPolygon = ({ id, polygon, visible, removeBox, creatingState, handleChange, boundary }) => {
  const COLOR = 'white';
  const [cancelBtnVisible, setCanceBtnVisible] = useState(false);
  const groupRef = useRef<Konva.Group>(null);

  const scale = groupRef.current?.getLayer().scale().x || 1;

  const radius = 5 / scale;

  const borderPoints = useMemo(() => {
    return polygon
      .map((e, _, arr) => {
        return { x: e.x - arr[0].x, y: e.y - arr[0].y };
      })
      .reduce((acc, cur) => {
        acc.push(cur.x, cur.y);
        return acc;
      }, []);
  }, [polygon]);

  const onDragMove = (idx: number) => (e: KonvaEventObject<DragEvent>): void => {
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

    handleChange(idx, { x, y });
  };

  const topPoint = useMemo(() => {
    let point = { x: null, y: Infinity };
    polygon.forEach((e) => {
      if (e.y < point.y) point = e;
    });
    return point;
  }, [polygon]);

  return (
    <Group
      visible={visible}
      onMouseEnter={(): void => setCanceBtnVisible(true)}
      onMouseLeave={(): void => setCanceBtnVisible(false)}
      cache={[{ drawBorder: true }]}
      ref={groupRef}
    >
      {/** A bigger region for mouseEnter event */}
      <Line x={polygon[0].x} y={polygon[0].y - 50} points={borderPoints} closed scale={{ x: 1.2, y: 1.2 }} />
      <Line
        x={polygon[0].x}
        y={polygon[0].y}
        points={borderPoints}
        closed
        stroke={COLOR}
        strokeWidth={2 / scale}
      />
      {polygon.map((e, i) => (
        <Circle
          key={i}
          draggable
          name="leftTop"
          x={e.x}
          y={e.y}
          radius={radius}
          fill={COLOR}
          onDragMove={onDragMove(i)}
        />
      ))}
      <Path
        x={topPoint.x}
        y={topPoint.y - 30 / scale}
        data="M 0 0 L 20 20 M 20 0 L 0 20"
        stroke="red"
        strokeWidth={5}
        visible={cancelBtnVisible && creatingState === CreatingState.Disabled}
        onMouseEnter={(e): void => {
          e.target.getStage().container().style.cursor = 'pointer';
        }}
        onMouseLeave={(e): void => {
          e.target.getStage().container().style.cursor = 'default';
        }}
        onClick={(): void => removeBox(id)}
        scale={{ x: 1 / scale, y: 1 / scale }}
      />
    </Group>
  );
};

const AOIBox: React.FC<AOIBoxProps> = ({ box, onBoxChange, visible, boundary, removeBox, creatingState }) => {
  const { x1, y1, x2, y2 } = box;
  const COLOR = 'white';
  const [cancelBtnVisible, setCanceBtnVisible] = useState(false);
  const groupRef = useRef<Konva.Group>(null);

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
        onBoxChange({ x1: x, y1: y });
        break;
      case 'rightTop':
        onBoxChange({ x2: x, y1: y });
        break;
      case 'rightBottom':
        onBoxChange({ x2: x, y2: y });
        break;
      case 'leftBottom':
        onBoxChange({ x1: x, y2: y });
        break;
      default:
        break;
    }
  };

  const scale = groupRef.current?.getLayer().scale().x || 1;

  const radius = 5 / scale;

  return (
    <Group
      visible={visible}
      onMouseEnter={(): void => setCanceBtnVisible(true)}
      onMouseLeave={(): void => setCanceBtnVisible(false)}
      cache={[{ drawBorder: true }]}
      ref={groupRef}
    >
      {/** A bigger region for mouseEnter event */}
      <Line x={x1} y={y1 - 80} points={[0, -80, 0, y2 - y1, x2 - x1, y2 - y1, x2 - x1, -80]} closed />
      <Line
        x={x1}
        y={y1}
        points={[0, 0, 0, y2 - y1, x2 - x1, y2 - y1, x2 - x1, 0]}
        closed
        stroke={COLOR}
        strokeWidth={2 / scale}
      />
      <Circle draggable name="leftTop" x={x1} y={y1} radius={radius} fill={COLOR} onDragMove={handleDrag} />
      <Circle draggable name="rightTop" x={x2} y={y1} radius={radius} fill={COLOR} onDragMove={handleDrag} />
      <Circle
        draggable
        name="rightBottom"
        x={x2}
        y={y2}
        radius={radius}
        fill={COLOR}
        onDragMove={handleDrag}
      />
      <Circle
        draggable
        name="leftBottom"
        x={x1}
        y={y2}
        radius={radius}
        fill={COLOR}
        onDragMove={handleDrag}
      />
      <Path
        x={x1}
        y={y1 - 30 / scale}
        data="M 0 0 L 20 20 M 20 0 L 0 20"
        stroke="red"
        strokeWidth={5}
        visible={cancelBtnVisible && creatingState === CreatingState.Disabled}
        onMouseEnter={(e): void => {
          e.target.getStage().container().style.cursor = 'pointer';
        }}
        onMouseLeave={(e): void => {
          e.target.getStage().container().style.cursor = 'default';
        }}
        onClick={(): void => removeBox(box.id)}
        scale={{ x: 1 / scale, y: 1 / scale }}
      />
    </Group>
  );
};
