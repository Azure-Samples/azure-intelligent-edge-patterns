/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
/* eslint-disable react/destructuring-assignment */
import React, { FC } from 'react';
import { Line, ChartData } from 'react-chartjs-2';
import { DefaultPalette } from '@fluentui/react/lib/Styling';
import { DateTime } from 'luxon';
import { Vital } from '../data/VitalsCollection';
import { getStatusColor, lastItem } from '../util/helpers';

interface VitalsLineChartProps {
  vitals: Vital[],
}

// eslint-disable-next-line arrow-body-style
const convertEffectiveDateToShortDate = (vital: Vital) : string => {
  return DateTime.fromISO(vital.effectiveDateTime).toFormat('LL/dd');
};

export const VitalsLineChart: FC<VitalsLineChartProps> = ({ vitals }) => {
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
      xAxes: [{ gridLines: { color: gridLineColor },
        ticks: {
          fontColor: axisColor,
          fontSize: 12,
        } }],
      yAxes: [{ gridLines: { color: gridLineColor },
        ticks: {
          fontColor: axisColor,
          fontSize: 12,
        } }],
    },
  };
  const data: ChartData<any> = {
    labels: last7DaysVitals.map((vital: Vital) => convertEffectiveDateToShortDate(vital)),
    datasets: [
      {
        fill: false,
        borderColor: getStatusColor(lastItem(last7DaysVitals).code) || DefaultPalette.green,
        lineTension: '0',
        pointRadius: 6,
        pointBorderWidth: 3,
        pointHitRadius: 20,
        pointBackgroundColor: 'rgba(255, 255, 255, 1)',
        data: last7DaysVitals.map(v => parseInt(v.value, 10)),
      },
    ],
  };
  return (
    <div className="graphContainer">
      <Line data={data} options={options} />
    </div>
  );
};
