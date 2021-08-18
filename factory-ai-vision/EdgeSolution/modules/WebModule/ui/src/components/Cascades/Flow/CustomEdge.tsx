import React from 'react';
import { getBezierPath, getMarkerEnd } from 'react-flow-renderer';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  arrowHeadType,
  markerEndId,
}) {
  const edgePath = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  console.log('CustomEdge data', data);

  return (
    <>
      <path
        id={id}
        style={{ strokeWidth: '2px' }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath href={`#${id}`} style={{ fontSize: '12px' }} startOffset="50%" textAnchor="middle">
          {/* {data.text} */}
          ABC
        </textPath>
      </text>
    </>
  );
}
