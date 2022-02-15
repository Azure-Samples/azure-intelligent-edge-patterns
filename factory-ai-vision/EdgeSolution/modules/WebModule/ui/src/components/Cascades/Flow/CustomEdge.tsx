import React from 'react';
import { getBezierPath, getMarkerEnd, ArrowHeadType, getEdgeCenter, EdgeProps } from 'react-flow-renderer';

type Props = {
  onDeleteEdge: (edgeId: string) => void;
} & EdgeProps;

export default function CustomEdge(props: Props) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEndId,
    onDeleteEdge,
  } = props;

  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const edgePath = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const markerEnd = getMarkerEnd(ArrowHeadType.Arrow, markerEndId);

  return (
    <>
      <path
        id={id}
        style={{ strokeWidth: '3px', color: '#979593' }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={40}
        height={40}
        x={edgeCenterX - 40 / 2}
        y={edgeCenterY - 40 / 2}
        className="edgebutton-foreignobject"
      >
        <body>
          <button className="edgebutton" onClick={() => onDeleteEdge(id)}>
            ×
          </button>
        </body>
      </foreignObject>
    </>
  );
}
