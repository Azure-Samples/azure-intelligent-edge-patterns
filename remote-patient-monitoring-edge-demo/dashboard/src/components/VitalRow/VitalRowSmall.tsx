/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import React, { FC } from 'react';
import { Vital, VitalsCollection, vitalsDisplayContent } from '../../data/VitalsCollection';
import { lastItem, getStatusColor } from '../../util/helpers';
import { StatusCircle } from '../StatusCircle/StatusCircle';
import { SpO2Label } from './Spo2Label';
import { Colors } from '../../styles/colors';
import './VitalRow.css';

interface props { vitals: VitalsCollection }

interface VitalTabProps {
  tabVitals: Vital[];
  label: any;
}

const VitalTab: FC<VitalTabProps> = ({ tabVitals, label }) => {
  const lastVital = lastItem(tabVitals);
  const vitalCode = lastVital ? lastVital.code : null;
  const vitalValueClass = getStatusColor(vitalCode) === Colors.statusRed ? 'vitalValueAlarming' : 'vitalValue';

  return (
    <div className="vital">
      <div className="vital-label-row">
        <StatusCircle code={vitalCode} />
        <div className="vitalHeader">{label}</div>
      </div>
      <div className={vitalValueClass}>{lastVital.value}</div>
    </div>
  );
};

export const VitalRowSmall: FC<props> = ({ vitals }) => (
  <>
    <VitalTab tabVitals={vitals.heartRate} label={vitalsDisplayContent.heartRate.label} />
    <div className="vitalSeparator" />
    <VitalTab tabVitals={vitals.sBPOverDBP} label={vitalsDisplayContent.sBPOverDBP.label} />
    <div className="vitalSeparator" />
    <VitalTab tabVitals={vitals.spO2} label={<SpO2Label />} />
    <div className="vitalSeparator" />
    <VitalTab tabVitals={vitals.respiration} label={vitalsDisplayContent.respiration.label} />
    <div className="vitalSeparator" />
    <VitalTab tabVitals={vitals.weight} label={vitalsDisplayContent.weight.label} />
  </>
);
