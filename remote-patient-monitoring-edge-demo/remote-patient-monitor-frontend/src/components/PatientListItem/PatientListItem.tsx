/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import * as React from 'react';
import { FC } from 'react';
import { IPersonaProps, Persona, PersonaPresence, PersonaSize, DefaultEffects, Stack } from '@fluentui/react';
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4';
import { VitalRowSmall } from '../VitalRow/VitalRowSmall';
import { EMPTY_VITALS, VitalsCollection } from '../../data/VitalsCollection';
import { PatientDetailsRow } from '../PatientDetailsRow';
import { VitalRowLarge } from '../VitalRow/VitalRowLarge';
import { makePersonaStyles } from './makePersonaStyles';
import './Patient.css';

interface props { patient: IPatient, flagText: string, isBigCard: boolean, vitals: VitalsCollection }

export const PatientListItem: FC<props> = ({ patient, isBigCard, vitals, flagText }) => {
  const personaStyles = makePersonaStyles(isBigCard);

  const patientName = `${patient.name![0].given} ${patient.name![0].family}`;
  const personaProps: IPersonaProps = {
    imageInitials: patient.name![0].given![0].charAt(0) + patient.name![0].family!.charAt(0),
    text: patientName,
    onRenderSecondaryText: () => <PatientDetailsRow patient={patient} vitals={vitals} timePrefix={isBigCard ? 'Alerted at' : 'Last taken'} />,
    onRenderPrimaryText: () => (<div>{patientName}</div>),
    onRenderTertiaryText: () => (<div>{flagText}</div>),
  };

  const VitalRowComponent = isBigCard ? VitalRowLarge : VitalRowSmall;

  return (
    <div
      className="patient"
      data-key={patient.id!}
      style={{
        boxShadow: DefaultEffects.elevation8,
        width: '100%',
      }}
    >
      <Persona
        {...personaProps}
        size={isBigCard ? PersonaSize.size72 : PersonaSize.size56}
        presence={PersonaPresence.none}
        styles={personaStyles}
      />
      <div className="vitalBottomBorder" />
      <Stack className="vitalGroup" horizontal disableShrink>
        <VitalRowComponent vitals={vitals || EMPTY_VITALS} />
      </Stack>
    </div>
  );
};
