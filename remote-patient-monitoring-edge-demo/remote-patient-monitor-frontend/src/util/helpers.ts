/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { DateTime } from 'luxon';
import { Analyses, InterpretationCode, VitalsCollection } from '../data/VitalsCollection';
import { Colors } from '../styles/colors';
import { PatientDataCollection } from '../data/PatientDataCollection';

export const lastItem = (arr: any[]): any => arr[arr.length - 1];

export const calculateYearsOld = (dob: string): string => {
  const dobFormatted = DateTime.fromFormat(dob, 'yyyy-MM-dd');
  return DateTime.local().diff(dobFormatted, 'years').years.toFixed(0);
};
export const formatTimestamp = (timestamp: string): string => DateTime.fromISO(timestamp).toFormat('MM/dd HH:mm');

export const formatLastMeasurementTime = (vitals: VitalsCollection | null): string => ((vitals && vitals.latestVitalTimestamp !== 'IND') ?
  DateTime.fromISO(vitals.latestVitalTimestamp).toFormat('MM/dd HH:mm') :
  'N/A');

export const sortByFlagDateDescending = (patientData: PatientDataCollection[]): PatientDataCollection[] => patientData.sort((firstPatient, secondPatient) =>
  (DateTime.fromISO(secondPatient.flags[0].meta!.lastUpdated!) > DateTime.fromISO(firstPatient.flags[0].meta!.lastUpdated!) ? 1 : -1));

export const sortByLatestVitalTimestampDescending = (patientData: PatientDataCollection[]): PatientDataCollection[] => patientData.sort((firstPatient, secondPatient) =>
  (DateTime.fromISO(secondPatient.vitals.latestVitalTimestamp) > DateTime.fromISO(firstPatient.vitals.latestVitalTimestamp) ? 1 : -1));

export const getStatusColor = (vitalAnalysis: InterpretationCode): string | null => {
  switch (vitalAnalysis) {
    case Analyses.Normal.code:
      return Colors.statusGreen;
    case Analyses.Low.code:
    case Analyses.High.code:
      return Colors.statusYellow;
    case Analyses.CriticalHigh.code:
    case Analyses.CriticalLow.code:
      return Colors.statusRed;
    default:
      return null;
  }
};
