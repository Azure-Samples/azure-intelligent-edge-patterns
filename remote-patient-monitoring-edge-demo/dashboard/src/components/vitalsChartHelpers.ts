import { DefaultPalette } from '@fluentui/react';
import { DateTime } from 'luxon';
import { Vital } from '../data/VitalsCollection';
import { getStatusColor, lastItem } from '../util/helpers';

// eslint-disable-next-line arrow-body-style
export const convertEffectiveDateToShortDate = (vital: Vital): string => {
  return DateTime.fromISO(vital.effectiveDateTime).toFormat('LL/dd');
};

const buildDataSet = (data: any[], borderColor: string, label: string): any => ({
  label,
  fill: false,
  borderColor,
  lineTension: '0',
  pointRadius: 6,
  pointBorderWidth: 3,
  pointHitRadius: 20,
  pointBackgroundColor: 'rgba(255, 255, 255, 1)',
  data,
});

const buildBPDataSets = (vitals: Vital[]): any[] => {
  const bpVitals: { sbp: any[]; dbp: any[] } = { sbp: [], dbp: [] };

  vitals.forEach((v) => {
    const vals = v.value.split('/');
    const systolic = parseInt(vals[0], 10);
    const diastolic = parseInt(vals[1], 10);

    const timestamp = convertEffectiveDateToShortDate(v);

    bpVitals.sbp.push({ x: timestamp, y: systolic });
    bpVitals.dbp.push({ x: timestamp, y: diastolic });
  });

  const color = getStatusColor(lastItem(vitals).code) || DefaultPalette.green;

  return [buildDataSet(bpVitals.sbp, color, 'SBP'), buildDataSet(bpVitals.dbp, color, 'DBP')];
};

export const buildVitalChartDataSets = (vitals: Vital[], isBloodPressureChart: boolean): any[] => {
  const vitalValues = vitals.map((v: Vital) => parseInt(v.value, 10));

  const standardVitalDataSet = [buildDataSet(vitalValues, getStatusColor(lastItem(vitals).code) || DefaultPalette.green, 'Value')];

  return isBloodPressureChart ? buildBPDataSets(vitals) : standardVitalDataSet;
};
