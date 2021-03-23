/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import React, { FC } from 'react';
import { IStackStyles, IStackTokens, Label, Stack } from '@fluentui/react';
import { PatientListItem } from './PatientListItem/PatientListItem';
import { PatientDataCollection } from '../data/PatientDataCollection';
import { sortByFlagDateDescending, sortByLatestVitalTimestampDescending } from '../util/helpers';

const stackStyles: IStackStyles = {
  root: {
    margin: '15px 15px 15px 15px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
};

const stackTokens: IStackTokens = {
  childrenGap: 25,
};

interface props { allPatientData: PatientDataCollection[] }

export const PatientListView: FC<props> = ({ allPatientData }) => {
  const patientDataWithFlags = allPatientData.filter(x => x.flags && x.flags.length);
  const patientDataWithNoFlags = allPatientData.filter(x => !x.flags || !x.flags.length);

  const patientDataWithFlagsDateDesc = sortByFlagDateDescending(patientDataWithFlags);
  const patientDataWithNoFlagsDateDesc = sortByLatestVitalTimestampDescending(patientDataWithNoFlags);

  return (
    <>
      <Label className="patientListLabel">Patients Requiring Attention</Label>
      <Stack horizontal wrap styles={stackStyles} tokens={stackTokens}>
        {patientDataWithFlagsDateDesc.length
          ? patientDataWithFlagsDateDesc.map((patientData) =>
            (
              <Stack.Item key={patientData.patient!.id!} className="patientItem-big">
                <PatientListItem
                  patient={patientData.patient!}
                  isBigCard
                  flagText={patientData.flags[0].code.text!}
                  // TODO: If we separate vitalTimestamp from the flag timestamp for noteworthy patients, this should not override vitals
                  vitals={{ ...patientData.vitals!, latestVitalTimestamp: patientData.flags[0].meta!.lastUpdated! }}
                />
              </Stack.Item>
            ))
          : <div className="noPatientData">No patients requiring attention found!</div>}
      </Stack>

      <Label className="patientListLabel">Patient List</Label>
      <Stack horizontal wrap styles={stackStyles} tokens={stackTokens}>
        {patientDataWithNoFlagsDateDesc.length
          ? patientDataWithNoFlagsDateDesc.map((patientData) =>
            (
              <Stack.Item key={patientData.patient!.id!} className="patientItem">
                <PatientListItem
                  patient={patientData.patient!}
                  isBigCard={false}
                  flagText=""
                  vitals={patientData.vitals!}
                />
              </Stack.Item>
            ))
          : <div className="noPatientData">No other patients found!</div>}
      </Stack>
    </>
  );
};
