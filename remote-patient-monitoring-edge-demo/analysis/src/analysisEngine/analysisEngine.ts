/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { IObservation, IBundle, IResourceList, IBundle_Entry, IFlag } from '@ahryman40k/ts-fhir-types/lib/R4';
import axios, { AxiosResponse } from 'axios';
import { Analyses, analyzeWeightSeries } from './analyzers';
import { MAX_BUNDLE_SIZE, WEIGHT_CODE } from '../constants';
import { preliminaryVitalsUrl, FHIR_API_URL } from '../variables';
import {
  createBundleEntryFromObservationAndAnalysis,
  buildFlag, createBundleWithBundleEntries,
  transformObservationsToBundleEntries,
  sortByEffectiveDateTimeAscending,
} from './helpers';

const postBundle = async (observationsBundle: IBundle): Promise<void> => {
  console.log(`POSTing patient vitals to FHIR server ${FHIR_API_URL}`);

  const response = await axios.post(FHIR_API_URL, observationsBundle);
  console.log(`Result: ${response.status}`);
};

const getAllPreliminaryObs = async (startingUrl: string): Promise<IResourceList[]> => {
  let morePagesToFetch = true;
  let urlToFetch = startingUrl;
  const allResults: IResourceList[] = [];

  while (morePagesToFetch) {
    // eslint-disable-next-line no-await-in-loop
    const response = await axios.get(urlToFetch);
    const responseData: IBundle = response.data;
    if (responseData.entry?.length) {
      allResults.push(...responseData.entry?.map(e => e.resource!));
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

interface PatientToWeightsDict {
  [key: string]: IBundle_Entry[]
}

const postMaxOf100ObservationsInBundle = async (patientToObservationsMap: PatientToWeightsDict) => {
  console.log('Starting to process all observations.');
  const bundles: IBundle[] = [];
  let currentBundle: IBundle_Entry[] = [];

  await Promise.all(Object.keys(patientToObservationsMap).map(async (patientId) => {
    console.log(`Processing for patient ${patientId}.`);
    const nonWeightObservations = patientToObservationsMap[patientId].filter((preliminaryObservation: IObservation) => preliminaryObservation.code.coding[0].code !== WEIGHT_CODE);
    const weightObservations = patientToObservationsMap[patientId].filter((preliminaryObservation: IObservation) => preliminaryObservation.code.coding[0].code === WEIGHT_CODE);
    const analyzedWeightBundleEntries = await analyzePreliminaryWeightObservations(weightObservations as IObservation[]);
    const vitalBundleEntriesExcludingWeights = transformObservationsToBundleEntries(nonWeightObservations as IObservation[]);
    const onePatientVitalsBundleEntries = analyzedWeightBundleEntries.concat(vitalBundleEntriesExcludingWeights);
    if (currentBundle.length + onePatientVitalsBundleEntries.length < MAX_BUNDLE_SIZE) {
      currentBundle.push(...onePatientVitalsBundleEntries);
    } else {
      const fullBundle = createBundleWithBundleEntries(currentBundle);
      bundles.push(fullBundle);
      currentBundle = [];
      currentBundle.push(...onePatientVitalsBundleEntries);
    }
    console.log(`Done processing for patient ${patientId}.`);
  }));

  if (currentBundle.length) {
    const lastBundle = createBundleWithBundleEntries(currentBundle);
    bundles.push(lastBundle);
  }

  await Promise.all(bundles.map(async (bundle) => {
    console.log(`Posting bundle with ${bundle.entry.length} records`);
    await postBundle(bundle);
    console.log('Done posting bundle.');
  }));
};

export const analyzePreliminaryObservations = async (): Promise<void> => {
  const allPreliminaryObservations = await getAllPreliminaryObs(preliminaryVitalsUrl);

  if (allPreliminaryObservations.length) {
    console.log(`Found ${allPreliminaryObservations.length} preliminary observations. Analyzing...`);

    const uniquePatients: string[] = [];
    const patientToObservationsMap: PatientToWeightsDict = {};
    allPreliminaryObservations.forEach(weight => {
      const patientRef = (weight as IObservation).subject.reference;

      if (!uniquePatients.includes(patientRef)) {
        uniquePatients.push(patientRef);
      }
    });

    uniquePatients.forEach(patientRef => {
      const observationsForPatient = allPreliminaryObservations.filter(observation => (observation as IObservation).subject.reference === patientRef);
      patientToObservationsMap[patientRef] = sortByEffectiveDateTimeAscending(observationsForPatient as IObservation[]);
    });

    await postMaxOf100ObservationsInBundle(patientToObservationsMap);

    console.log('Analysis complete!');
  }
};

const getAnalyzedBundleEntriesForWeight = async (weights: IObservation[]) : Promise<IBundle_Entry[]> => {
  const weightsToAnalyze: number[] = [];
  const observationBundleEntries = [];

  await Promise.all(weights.map(async (preliminaryWeightObservation: IObservation) => {
    weightsToAnalyze.push(preliminaryWeightObservation.valueQuantity.value);

    /* Analyze weights for unhealthy weight gain over time */
    const analysis = analyzeWeightSeries(weightsToAnalyze);

    if (analysis.code === Analyses.CriticalHigh.code) {
      await createAndPostFlag(preliminaryWeightObservation.subject.reference, analysis.description!);
    }

    const bundleEntry: IBundle_Entry = createBundleEntryFromObservationAndAnalysis(preliminaryWeightObservation, analysis);
    observationBundleEntries.push(bundleEntry);
  }));

  return observationBundleEntries;
};

export const analyzePreliminaryWeightObservations = async (weightsToAnalyze: IObservation[]): Promise<IBundle_Entry[]> => {
  console.log(`Found ${weightsToAnalyze.length} preliminary weight observations. Analyzing...`);
  const analyzedWeightBundleEntries = await getAnalyzedBundleEntriesForWeight(weightsToAnalyze);
  return analyzedWeightBundleEntries;
};

const createAndPostFlag = async (patientReferenceUrl: string, description: string): Promise<AxiosResponse<IFlag>> => {
  const flag = buildFlag(patientReferenceUrl, description);

  const response = await axios.post<IFlag>(`${FHIR_API_URL}/Flag`, flag);
  console.log(`Creating Flag for patient with URL ${patientReferenceUrl}.`);
  return response;
};
