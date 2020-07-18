import React from 'react';
import { TrainingMetrics } from '../../store/project/projectTypes';

interface ConsequenceDashboardProps {
  trainingMetrics: TrainingMetrics;
  visible: boolean;
}
export const ConsequenceDashboard: React.FC<ConsequenceDashboardProps> = ({
  trainingMetrics: { curConsequence, prevConsequence },
  visible,
}) => {
  return (
    <table style={{ textAlign: 'center', width: '60%', display: visible ? '' : 'none' }}>
      <tr>
        <td style={{ width: '200px' }}></td>
        <td>Precision</td>
        <td>Recall</td>
        <td>mAP</td>
      </tr>
      <tr>
        <td>Updated Model Metrics</td>
        <td style={{ color: '#9a0089' }}>
          {curConsequence?.precision === null ? '' : `${((curConsequence?.precision * 1000) | 0) / 10}%`}
        </td>
        <td style={{ color: '#0063b1' }}>
          {curConsequence?.recall === null ? '' : `${((curConsequence?.recall * 1000) | 0) / 10}%`}
        </td>
        <td style={{ color: '#69c138' }}>
          {curConsequence?.mAP === null ? '' : `${((curConsequence?.mAP * 1000) | 0) / 10}%`}
        </td>
      </tr>
      {prevConsequence && (
        <tr>
          <td>Previous Model Metrics</td>
          <td style={{ color: '#9a0089' }}>
            {prevConsequence?.precision === null ? '' : `${((prevConsequence?.precision * 1000) | 0) / 10}%`}
          </td>
          <td style={{ color: '#0063b1' }}>
            {prevConsequence?.recall === null ? '' : `${((prevConsequence?.recall * 1000) | 0) / 10}%`}
          </td>
          <td style={{ color: '#69c138' }}>
            {prevConsequence?.mAP === null ? '' : `${((prevConsequence?.mAP * 1000) | 0) / 10}%`}
          </td>
        </tr>
      )}
    </table>
  );
};
