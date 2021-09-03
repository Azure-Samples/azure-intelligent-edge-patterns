import React from 'react';
import { getBezierPath, getMarkerEnd, ArrowHeadType } from 'react-flow-renderer';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
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
    </>
  );
}
