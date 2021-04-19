/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import faker from 'faker';
import {
  BundleTypeKind,
  Bundle_RequestMethodKind,
  IBundle,
  IBundle_Entry,
  IBundle_Request,
  IPatient,
  PatientGenderKind,
} from '@ahryman40k/ts-fhir-types/lib/R4';
import axios, { AxiosResponse } from 'axios';
import { FHIR_API_URL } from './variables';

export const generateNewPatients = async (numberOfPatients: number): Promise<string[]> => {
  console.log(`Generating data for ${numberOfPatients} patient(s).`);
  const patientBundle = buildAndGenerateFhirPatientBundle(numberOfPatients);
  console.log(`Finished generating data for ${patientBundle.entry.length} patient(s).  Posting now.`);
  const postPatientsResult: AxiosResponse = await axios.post(FHIR_API_URL, patientBundle);
  return postPatientsResult.data.entry.map((e: IBundle_Entry) => e.response.location.split('/Patient/')[1].split('/_history')[0]);
};

const generatePatients = (numPatientsToCreate: number): IPatient[] =>
  [...Array(numPatientsToCreate).keys()].map(() => ({
    resourceType: 'Patient',
    name: [
      {
        family: faker.name.lastName(),
        given: [faker.name.firstName()],
      },
    ],
    birthDate: faker.date.between('1940', '1960').toISOString().split('T')[0], // 'YYYY-MM-DD'
    gender: faker.random.arrayElement([PatientGenderKind._male, PatientGenderKind._female, PatientGenderKind._other, PatientGenderKind._unknown]),
  }));

const postPatientAddon: IBundle_Request = {
  method: Bundle_RequestMethodKind._post,
  url: 'Patient',
};

const createPatientBundle = (patientResources: IPatient[]): IBundle => {
  const patientBundle: IBundle = {
    resourceType: 'Bundle',
    type: BundleTypeKind._transaction,
    entry: patientResources.map((pr: IPatient) => ({
      resource: { ...pr },
      request: postPatientAddon,
    })),
  };
  return patientBundle;
};

const buildAndGenerateFhirPatientBundle = (numPatientsToCreate: number): IBundle => {
  const patientResources = generatePatients(numPatientsToCreate);
  return createPatientBundle(patientResources);
};
