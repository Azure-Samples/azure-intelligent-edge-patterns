/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { FlagStatusKind, ICodeableConcept, IFlag, IObservation, IBundle, BundleTypeKind, Bundle_RequestMethodKind, IBundle_Entry, ObservationStatusKind } from '@ahryman40k/ts-fhir-types/lib/R4';
import { Analysis } from './analyzers';
import { INTERPRETATION_URL, codeToAnalyzer } from '../constants';

export const buildBaselineInterpretationObject = (analysis: Analysis) : ICodeableConcept[] => [
  {
    coding: [
      {
        system: INTERPRETATION_URL,
        code: analysis.code,
        display: analysis.display,
      },
    ],
  },
];

export const buildFlag = (patientReferenceUrl: string, description: string): IFlag => ({
  resourceType: 'Flag',
  status: FlagStatusKind._active,
  code: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/flag-category',
        code: 'clinical',
        display: 'Clinical',
      },
    ],
    text: description,
  },
  subject: {
    reference: patientReferenceUrl, // eg 'Patient/69b914f6-e0fb-4b1d-b154-7b4547ef0110'
  },
});

export const sortByEffectiveDateTimeAscending = (observations: IObservation[]): IObservation[] => observations.sort((firstObs, secondObs) =>
  (new Date(firstObs.effectiveDateTime).getTime() - new Date(secondObs.effectiveDateTime).getTime()));

export const transformObservationsToBundleEntries = (observations: IObservation[]): IBundle_Entry[] => observations.map((ob: IObservation) => {
  const vitalCode = ob.code.coding[0].code;
  const analysis = codeToAnalyzer[vitalCode](ob.valueQuantity.value);
  const interpretation = buildBaselineInterpretationObject(analysis);
  const bundleEntry: IBundle_Entry = {
    resource: { ...ob,
      status: ObservationStatusKind._final,
      interpretation },
    request: {
      method: Bundle_RequestMethodKind._put,
      url: `Observation/${ob.id}`,
    },
  };

  return bundleEntry;
});

export const createBundleWithBundleEntries = (bundleEntries: IBundle_Entry[]): IBundle => ({
  resourceType: 'Bundle',
  type: BundleTypeKind._transaction,
  entry: bundleEntries,
});

export const buildFhirBundleWithObservations = (observations: IObservation[]): IBundle => {
  const obsWithResourceField = transformObservationsToBundleEntries(observations);
  return createBundleWithBundleEntries(obsWithResourceField);
};

export const createBundleEntryFromObservationAndAnalysis = (preliminaryWeightObservation: IObservation, analysis: Analysis): IBundle_Entry => {
  const interpretation = buildBaselineInterpretationObject(analysis);
  return ({
    resource: {
      ...preliminaryWeightObservation,
      status: ObservationStatusKind._final,
      interpretation,
    },
    request: {
      method: Bundle_RequestMethodKind._put,
      url: `Observation/${preliminaryWeightObservation.id}`,
    },
  });
};
