import React from 'react';
import { getBezierPath, getMarkerEnd, ArrowHeadType } from 'react-flow-renderer';

export default function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEndId,
}) {
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
      {/* <text>
        <textPath href={`#${id}`} style={{ fontSize: '12px' }} startOffset="50%" textAnchor="middle">
          ABC
        </textPath>
      </text> */}
    </>
  );
}
