/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4';
import * as React from 'react';
import { FC } from 'react';
import { VitalsCollection } from '../data/VitalsCollection';
import { calculateYearsOld, formatLastMeasurementTime } from '../util/helpers';

interface props { patient: IPatient, vitals: VitalsCollection | null, timePrefix: string }

export const PatientDetailsRow: FC<props> = ({ patient, vitals, timePrefix }) => {
  const patientYearsOld = calculateYearsOld(patient.birthDate!);
  const lastMeasurementTime = formatLastMeasurementTime(vitals);

  return (
    <div className="patientDetails">
      <div>
        {`${patient.gender}, age ${patientYearsOld} (${patient.birthDate})`}
      </div>
      <div className="patientDetails-time">
        {lastMeasurementTime && `${timePrefix} ${lastMeasurementTime}`}
      </div>
    </div>
  );
};
