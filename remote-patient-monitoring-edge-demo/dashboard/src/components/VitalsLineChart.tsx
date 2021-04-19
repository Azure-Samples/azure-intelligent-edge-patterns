/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
/* eslint-disable react/destructuring-assignment */
import React, { FC } from 'react';
import { Line, ChartData } from 'react-chartjs-2';
import { Vital } from '../data/VitalsCollection';
import { buildVitalChartDataSets, convertEffectiveDateToShortDate } from './vitalsChartHelpers';

interface VitalsLineChartProps {
  vitals: Vital[];
  isBloodPressureChart: boolean;
}

export const VitalsLineChart: FC<VitalsLineChartProps> = ({ vitals, isBloodPressureChart }) => {
  const last7DaysVitals = vitals.slice(-7);

  const darkBackground = '#192A49';
  const gridLineColor = '#6D7D8D';
  const axisColor = '#8997A2';
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    layout: {
      padding: {
        right: 45,
        top: 25,
      },
    },
    tooltips: {
      xPadding: 10,
      yPadding: 12,
    },
    legend: {
      display: false,
    },
    backgroundColor: darkBackground,
    color: gridLineColor,
    scales: {
      xAxes: [
        {
          gridLines: { color: gridLineColor },
          ticks: {
            fontColor: axisColor,
            fontSize: 12,
          },
        },
      ],
      yAxes: [
        {
          gridLines: { color: gridLineColor },
          ticks: {
            fontColor: axisColor,
            fontSize: 12,
          },
        },
      ],
    },
  };

  const data: ChartData<any> = {
    labels: last7DaysVitals.map((vital: Vital) => convertEffectiveDateToShortDate(vital)),
    datasets: buildVitalChartDataSets(last7DaysVitals, isBloodPressureChart),
  };

  return (
    <div className="graphContainer">
      <Line data={data} options={options} />
    </div>
  );
};
