/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import { FlagStatusKind, IBundle, IFlag, IObservation, IPatient, IResourceList } from '@ahryman40k/ts-fhir-types/lib/R4';
import axios, { AxiosResponse } from 'axios';
import { parseVitals } from './data/parseVitals';
import { PatientDataCollection } from './data/PatientDataCollection';
import { FHIR_API_URL } from './variables';

const getAllBundlePages = async (startingUrl: string): Promise<IResourceList[]> => {
  let morePagesToFetch = true;
  let urlToFetch = startingUrl;
  const allResults: IResourceList[] = [];
  while (morePagesToFetch) {
    // eslint-disable-next-line no-await-in-loop
    const response = await axios.get(urlToFetch);
    const responseData: IBundle = response.data;
    if (responseData.entry?.length) {
      allResults.push(...responseData.entry.map(e => e.resource!));
    }
    const nextDataLink = responseData?.link?.find(l => l.relation === 'next') || null;
    if (!nextDataLink) {
      morePagesToFetch = false;
    } else {
      urlToFetch = nextDataLink.url!;
    }
  }
  return allResults;
};

const parseResults = (patients: IPatient[], flags: IFlag[], vitals: IObservation[]): PatientDataCollection[] => {
  if (!patients.length) {
    return [];
  }

  const res: PatientDataCollection[] = patients.map((patient) => {
    const vitalsForPatient = vitals.filter((v: IObservation) => v.subject!.reference!.includes(patient.id!));
    const parsedVitalsForPatient = parseVitals(vitalsForPatient);

    const sortedFlags = flags.sort((a: IFlag, b: IFlag) => new Date(b.meta!.lastUpdated!).getTime() - new Date(a.meta!.lastUpdated!).getTime());

    const flagsForPatient = sortedFlags.filter(flag => isFlagForPatient(flag, patient));

    return {
      patient,
      flags: flagsForPatient,
      vitals: parsedVitalsForPatient,
    };
  });

  return res;
};

const isFlagForPatient = (flag: IFlag, patient: IPatient) => flag.subject && flag.subject.reference && flag.subject.reference.includes(patient.id!);

export const getPatientsAndFlagsAndVitals = async (): Promise<any> => {
  const allPatientsAndFlagsAndVitals = await getAllBundlePages(`${FHIR_API_URL}/?_type=Patient,Flag,Observation&_count=100`);
  const patients = allPatientsAndFlagsAndVitals.filter(x => x.resourceType === 'Patient') as IPatient[];
  // eslint-disable-next-line no-underscore-dangle
  const flags = allPatientsAndFlagsAndVitals.filter(x => x.resourceType === 'Flag') as IFlag[];
  const vitals = allPatientsAndFlagsAndVitals.filter(x => x.resourceType === 'Observation') as IObservation[];

  return parseResults(patients, flags, vitals);
};

export const getLatestRecordLastUpdatedDate = async (): Promise<string | null> => {
  const url = `${FHIR_API_URL}/?_type=Patient,Flag,Observation&_count=1&_sort=-_lastUpdated`;
  const latestPatientData: AxiosResponse<IBundle> = await axios.get(url);

  if (latestPatientData.data.entry?.length) {
    return latestPatientData.data.entry[0].resource!.meta!.lastUpdated!;
  }
  return null;
};

export const setFlagToInactive = async (flag: IFlag): Promise<AxiosResponse<IFlag>> => {
  // eslint-disable-next-line no-underscore-dangle
  const body = { ...flag, status: FlagStatusKind._inactive };
  const response = await axios.put(`${FHIR_API_URL}/Flag/${flag.id}`, body);
  return response;
};
