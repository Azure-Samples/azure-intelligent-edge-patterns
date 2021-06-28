/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

const transformObservationsToBundleEntries = (observations) => {
  const requestInfo = {
    method: 'POST',
    url: 'Observation',
  };
  return observations.map((ob) => ({
    resource: {...ob},
    request: requestInfo,
  }));
};

export const buildObservationsFhirBundle = (patientId, bpMeasurementData) => {
  const obs = generateObservations(
    bpMeasurementData.timeOfReading,
    patientId,
    bpMeasurementData.heartRate,
    bpMeasurementData.systolicBP,
    bpMeasurementData.diastolicBP,
  );
  const observations = transformObservationsToBundleEntries(obs);

  return {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [...observations],
  };
};

const generateObservations = (
  effectiveDateTime,
  patientGuid,
  heartRateValue,
  sbpValue,
  dbpValue,
) => {
  const baseObservation = {
    resourceType: 'Observation',
    effectiveDateTime,
    status: 'preliminary',
    subject: {
      reference: `Patient/${patientGuid}`,
    },
    code: {coding: []},
  };

  const getHrSpecificProperties = () => {
    return {
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8867-4',
            display: 'Heart Rate',
          },
        ],
      },
      valueQuantity: {
        value: heartRateValue,
        system: 'http://unitsofmeasure.org',
        code: 'bpm',
      },
    };
  };

  const getDbpSpecificProperties = () => {
    return {
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8462-4',
            display: 'Diastolic blood pressure',
          },
        ],
      },
      valueQuantity: {
        value: dbpValue,
        system: 'http://unitsofmeasure.org',
        code: 'mmHg',
      },
    };
  };

  const getSbpSpecificProperties = () => {
    return {
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8480-6',
            display: 'Systolic blood pressure',
          },
        ],
      },
      valueQuantity: {
        value: sbpValue,
        system: 'http://unitsofmeasure.org',
        code: 'mmHg',
      },
    };
  };

  const hrObservation = {
    ...baseObservation,
    ...getHrSpecificProperties(),
  };

  const sbpObservatrion = {
    ...baseObservation,
    ...getSbpSpecificProperties(),
  };

  const dbpObservation = {
    ...baseObservation,
    ...getDbpSpecificProperties(),
  };

  return [hrObservation, sbpObservatrion, dbpObservation];
};
