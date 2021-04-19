/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { IMeta } from '@ahryman40k/ts-fhir-types/lib/R4';

type AnalysesKeys = 'CriticalLow' | 'Low' | 'Normal' | 'High' | 'CriticalHigh' | 'Indeterminate';

type AnalysesDict = {
  [key in AnalysesKeys]: {
    code: InterpretationCode;
  };
};

export const Analyses: AnalysesDict = Object.freeze({
  CriticalLow: {
    code: 'LL',
  },
  Low: {
    code: 'L',
  },
  Normal: {
    code: 'N',
  },
  High: {
    code: 'H',
  },
  CriticalHigh: {
    code: 'HH',
  },
  Indeterminate: {
    code: 'IND',
  },
});

export type VitalDisplayContent = {
  label: any; // currently spo2 label is a react component to get the smaller 2 to show
  unitOfMeasurement: string;
};
export type VitalsDisplayContentDict = {
  [key in BaseVitalKeys]: VitalDisplayContent;
};

export const vitalsDisplayContent: VitalsDisplayContentDict = {
  heartRate: {
    label: 'HR',
    unitOfMeasurement: 'bpm',
  },
  sBPOverDBP: {
    label: 'SBP/DBP',
    unitOfMeasurement: 'mmHg',
  },
  spO2: {
    label: '', // spo2 label is a react component with sub text defined in VitalRow component
    unitOfMeasurement: '%',
  },
  respiration: {
    label: 'Resp.',
    unitOfMeasurement: 'breaths',
  },
  weight: {
    label: 'Wgt.',
    unitOfMeasurement: 'lbs.',
  },
};

export type InterpretationCode = 'N' | 'IND' | 'H' | 'HH' | 'L' | 'LL';

export interface Vital {
  value: string;
  code: InterpretationCode;
  effectiveDateTime: string;
  meta: undefined | IMeta;
}

type BaseVitalKeys = 'heartRate' | 'sBPOverDBP' | 'spO2' | 'respiration' | 'weight';
type BaseVitals = {
  [key in BaseVitalKeys]: Vital[];
};

export interface VitalsCollection extends BaseVitals {
  latestVitalTimestamp: string | 'IND';
}

export const EMPTY_VITAL: Vital = { value: '-', code: 'IND', effectiveDateTime: '', meta: { versionId: '', lastUpdated: '' } };

export const EMPTY_VITALS: VitalsCollection = {
  latestVitalTimestamp: 'IND',
  heartRate: [EMPTY_VITAL],
  sBPOverDBP: [EMPTY_VITAL],
  spO2: [EMPTY_VITAL],
  respiration: [EMPTY_VITAL],
  weight: [EMPTY_VITAL],
};
