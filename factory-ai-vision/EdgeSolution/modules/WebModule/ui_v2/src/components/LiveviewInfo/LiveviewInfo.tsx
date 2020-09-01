import React from 'react';
import './LiveveiwInfo.style.css';

type LiveViewInfoProps = {
  taskName: string;
  cameraName: string;
  partNames: string[];
  successRate: number;
  successfulInference: number;
  unidentifiedImages: number;
};

export const LiveViewInfo: React.FC<LiveViewInfoProps> = (props) => {
  return (
    <table>
      <tbody>
        <tr>
          <th>Details</th>
        </tr>
        <tr>
          <td>Task</td>
          <td>{props.taskName}</td>
        </tr>
        <tr>
          <td>Camera</td>
          <td>{props.cameraName}</td>
        </tr>
        <tr>
          <td>Part</td>
          <td>{props.partNames.join(', ')}</td>
        </tr>
      </tbody>
      <tbody>
        <tr>
          <th>Performance</th>
        </tr>
        <tr>
          <td>Success rate</td>
          <td>{`${props.successRate}%`}</td>
        </tr>
        <tr>
          <td>Successful inference</td>
          <td>{props.successfulInference}</td>
        </tr>
        <tr>
          <td>Unidentified images</td>
          <td>{props.unidentifiedImages}</td>
        </tr>
      </tbody>
    </table>
  );
};
