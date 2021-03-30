/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { IObservation } from '@ahryman40k/ts-fhir-types/lib/R4';
import { lastItem } from '../util/helpers';
import { DBP_CODE, HR_CODE, RESP_CODE, SBP_CODE, SPO2_CODE, VitalCode, WEIGHT_CODE } from './codes';
import { EMPTY_VITALS, Vital, VitalsCollection, InterpretationCode, EMPTY_VITAL } from './VitalsCollection';

const indeterminateResult = { value: '-', code: 'IND' as InterpretationCode, effectiveDateTime: '', meta: { versionId: '', lastUpdated: '' } };

const parseVitalsByVitalCode = (vitals: IObservation[], vitalCode: VitalCode): Vital[] => {
  const allObsForVitalCode: IObservation[] = vitals.filter((obs) => obs.code.coding![0].code === vitalCode)!;
  const vitalHasNoReadings = allObsForVitalCode.length === 0;
  if (vitalHasNoReadings) return [EMPTY_VITAL];

  const parsedVitalsDateAsc: Vital[] = allObsForVitalCode.map((obs) => {
    if (obs && obs.valueQuantity && obs.valueQuantity.value && obs.interpretation && obs.interpretation.length && obs.interpretation[0].coding?.length) {
      const interpretationCode = obs.interpretation[0].coding[0].code?.toString() as InterpretationCode;

      return {
        value: obs?.valueQuantity.value.toString() || '-',
        code: interpretationCode || 'IND',
        effectiveDateTime: obs?.effectiveDateTime!.toString(),
        meta: obs?.meta,
      };
    }
    return indeterminateResult;
  });

  return parsedVitalsDateAsc;
};

const parseSBPOverDBPVitals = (systolicBPVitals: Vital[], diastolicBPVitals: Vital[]) => {
  // Assumption is sbp and dbp contain same amount of items
  const sBPOverDBPVitals: Vital[] = systolicBPVitals.map((sbp: Vital, idx: number) => {
    const dbp = diastolicBPVitals[idx];

    const sBPOverDBPVital: Vital =
      sbp && dbp
        ? {
          value: `${sbp.value}/${dbp.value}`,
          code: sbp.code,
          effectiveDateTime: sbp.effectiveDateTime,
          meta: sbp.meta,
        }
        : indeterminateResult;

    return sBPOverDBPVital;
  });

  return sBPOverDBPVitals;
};

export const parseVitals = (vitals: IObservation[]): VitalsCollection => {
  if (!vitals.length) {
    return EMPTY_VITALS;
  }

  const vitalsSortedByDateAscending = vitals.sort((a: IObservation, b: IObservation) => new Date(a.effectiveDateTime!).getTime() - new Date(b.effectiveDateTime!).getTime());
  const systolicBPVitals = parseVitalsByVitalCode(vitalsSortedByDateAscending, SBP_CODE);
  const diastolicBPVitals = parseVitalsByVitalCode(vitalsSortedByDateAscending, DBP_CODE);

  const vitalsCollection: VitalsCollection = {
    latestVitalTimestamp: lastItem(vitalsSortedByDateAscending).effectiveDateTime!,
    heartRate: parseVitalsByVitalCode(vitalsSortedByDateAscending, HR_CODE),
    sBPOverDBP: parseSBPOverDBPVitals(systolicBPVitals, diastolicBPVitals),
    spO2: parseVitalsByVitalCode(vitalsSortedByDateAscending, SPO2_CODE),
    respiration: parseVitalsByVitalCode(vitalsSortedByDateAscending, RESP_CODE),
    weight: parseVitalsByVitalCode(vitalsSortedByDateAscending, WEIGHT_CODE),
  };
  return vitalsCollection;
};
