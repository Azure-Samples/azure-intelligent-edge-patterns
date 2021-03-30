/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import { IFlag, IPatient } from '@ahryman40k/ts-fhir-types/lib/R4';
import React, { FC } from 'react';
import { calculateYearsOld, formatTimestamp } from '../../util/helpers';
import '../../App.css';

interface props { patient: IPatient, flag: IFlag }

export const NotificationDetailRow: FC<props> = ({ patient, flag }) => {
  const patientYearsOld = calculateYearsOld(patient.birthDate!);
  const flagCreationTime = formatTimestamp(flag.meta!.lastUpdated!);

  return (
    <div className="patientDetails">
      <div>
        {`${patient.gender}, age ${patientYearsOld} (${patient.birthDate})`}
      </div>
      <div style={{ color: 'white' }}>
        {flagCreationTime}
      </div>
    </div>
  );
};
