/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
/* eslint-disable no-underscore-dangle */
import React, { FC, useState, useEffect } from 'react';
import { FlagStatusKind } from '@ahryman40k/ts-fhir-types/lib/R4';
import '../../App.css';
import { PatientDataCollection } from '../../data/PatientDataCollection';
import { Notification } from './Notification';
import { sortByFlagDateDescending } from '../../util/helpers';

interface props { allPatientData: PatientDataCollection[] }

export const NotificationsContainer: FC<props> = ({ allPatientData }) => {
  const filterPatientsWithLatestFlagActive = (patientData: PatientDataCollection[]): PatientDataCollection[] => {
    const filteredData = patientData.filter(patient => patient.flags.length && patient.flags[0].status === FlagStatusKind._active);
    return (sortByFlagDateDescending(filteredData));
  };
  const initialState = filterPatientsWithLatestFlagActive(allPatientData);
  const [patientsWithActiveFlag, setPatientsWithActiveFlag] = useState<PatientDataCollection[]>(initialState);

  useEffect(() => {
    const patientsWithLatestFlagActive = filterPatientsWithLatestFlagActive(allPatientData);
    setPatientsWithActiveFlag(patientsWithLatestFlagActive);
  }, [allPatientData]);

  const onDismiss = (patientId: string) => {
    const filtered = patientsWithActiveFlag.filter(p => p.patient?.id !== patientId);
    setPatientsWithActiveFlag(filtered);
  };

  return (
    <div className="notification-container">
      {patientsWithActiveFlag.map((patientData: PatientDataCollection) =>
        <Notification key={patientData.patient?.id} patientData={patientData} onDismiss={onDismiss} />)}
    </div>
  );
};
