/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import axios from 'axios';
import { IBundle_Request, IObservation } from '@ahryman40k/ts-fhir-types/lib/R4';
import { buildFhirBundleWithObservations } from './observations';
import { FHIR_API_URL } from './variables';

const postBundle = async (patientId: string, observationsBundle: IBundle_Request): Promise<void> => {
  console.log(`POSTing patient vitals for patient uuid ${patientId} to FHIR server ${FHIR_API_URL}`);
  try {
    const response = await axios.post(FHIR_API_URL, observationsBundle);
    console.log(`Result: ${response.status}`);
  } catch (e) {
    console.log('ERROR postBundle ', e.message);
  }
};

export const postObservationsForPatient = async (patientId: string, observations: IObservation[]): Promise<void> => {
  try {
    const obsBundle = buildFhirBundleWithObservations(observations);
    await postBundle(patientId, obsBundle);
  } catch (e) {
    console.log('ERROR postObservationsForPatient ', e.message);
  }
};

export const deletePatient = async (patientId: string): Promise<void> => {
  console.log(`DELETING patient uuid ${patientId} on FHIR server ${FHIR_API_URL}`);

  try {
    const response = await axios.delete(`${FHIR_API_URL}/Patient/${patientId}`);
    console.log(`Result: ${response.status}`);
  } catch (e) {
    console.log('ERROR deletePatient ', e.message);
  }
};
