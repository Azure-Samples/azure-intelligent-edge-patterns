/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { IFlag, IPatient } from '@ahryman40k/ts-fhir-types/lib/R4';
import { EMPTY_VITALS, VitalsCollection } from './VitalsCollection';

export interface PatientDataCollection {
  patient: IPatient | null,
  flags: IFlag[],
  vitals: VitalsCollection,
}

export const EMPTY_PATIENT_DATA_COLLECTION: PatientDataCollection = {
  patient: null,
  flags: [],
  vitals: EMPTY_VITALS,
};
