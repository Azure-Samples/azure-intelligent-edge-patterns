/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import React, { FC, useEffect } from 'react';
import { VitalsCollection, Vital, vitalsDisplayContent, VitalDisplayContent } from '../../data/VitalsCollection';
import { lastItem, getStatusColor } from '../../util/helpers';
import { StatusCircle } from '../StatusCircle/StatusCircle';
import { VitalsLineChart } from '../VitalsLineChart';
import { SpO2Label } from './Spo2Label';
import { Colors } from '../../styles/colors';

interface props {
  vitals: VitalsCollection;
}

export const VitalRowLarge: FC<props> = ({ vitals }) => {
  const [activeVital, setActiveVital] = React.useState<Vital[]>(vitals.weight);
  const handleEnter = (event: any, vital: Vital[]) => {
    if (event.key === 'Enter') {
      setActiveVital(vital);
    }
  };

  useEffect(() => {
    setActiveVital(vitals.weight);
  }, [vitals]);
  interface VitalTabProps {
    tabVitals: Vital[];
    displayContent: VitalDisplayContent;
  }

  const VitalTab: FC<VitalTabProps> = ({ tabVitals, displayContent }) => {
    const lastVital = lastItem(tabVitals);
    const vitalValueClass = getStatusColor(lastVital.code) === Colors.statusRed ? 'vitalValueAlarming-big' : 'vitalValue-big';

    return (
      <div
        role="button"
        tabIndex={0}
        className={activeVital === tabVitals ? 'vital-big vital-active' : 'vital-big vital-tab-bottom-border'}
        onClick={() => setActiveVital(tabVitals)}
        onKeyDown={(event) => handleEnter(event, tabVitals)}
      >
        <div className="vital-label-row-big">
          <StatusCircle code={lastVital.code} big />
          <div className="vitalHeader-big">{displayContent.label}</div>
          <div className="vitalHeader-units">{displayContent.unitOfMeasurement}</div>
        </div>
        <div className={vitalValueClass}>{lastVital.value}</div>
      </div>
    );
  };

  const bloodPressureVitalTabIsActive = lastItem(activeVital).value.includes('/');

  return (
    <div className="vitalArea">
      <div className="vitalBlock">
        <VitalTab tabVitals={vitals.heartRate} displayContent={vitalsDisplayContent.heartRate} />
        <div className="vitalSeparator-big" />
        <VitalTab tabVitals={vitals.sBPOverDBP} displayContent={vitalsDisplayContent.sBPOverDBP} />
        <div className="vitalSeparator-big" />
        <VitalTab tabVitals={vitals.spO2} displayContent={{ ...vitalsDisplayContent.spO2, label: <SpO2Label /> }} />
        <div className="vitalSeparator-big" />
        <VitalTab tabVitals={vitals.respiration} displayContent={vitalsDisplayContent.respiration} />
        <div className="vitalSeparator-big" />
        <VitalTab tabVitals={vitals.weight} displayContent={vitalsDisplayContent.weight} />
      </div>
      <div className="vitalChart">{lastItem(activeVital).value !== '-' && <VitalsLineChart vitals={activeVital} isBloodPressureChart={bloodPressureVitalTabIsActive} />}</div>
    </div>
  );
};
