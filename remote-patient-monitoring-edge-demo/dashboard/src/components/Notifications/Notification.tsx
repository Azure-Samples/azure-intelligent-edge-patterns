/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import React, { FC } from 'react';
import { Persona, MessageBar, PersonaSize, PersonaPresence, IPersonaProps } from '@fluentui/react';
import { PatientDataCollection } from '../../data/PatientDataCollection';
import { NotificationDetailRow } from './NotificationDetailRow';
import { messageBarStyles, personaStyles } from './fluentUiStyles';
import '../../App.css';
import './Notifications.css';
import { setFlagToInactive } from '../../serviceClient';

interface props { patientData: PatientDataCollection, onDismiss: (patientId: string) => void; }

export const Notification: FC<props> = ({ patientData, onDismiss }) => {
  const patient = patientData.patient!;
  const latestFlag = patientData.flags[0];
  const notificationText = latestFlag.code.text;
  const patientName = `${patient.name![0].given} ${patient.name![0].family}`;

  const personaProps: IPersonaProps = {
    imageInitials: patient.name![0].given![0].charAt(0) + patient.name![0].family!.charAt(0),
    text: patientName,
    onRenderSecondaryText: () => <NotificationDetailRow patient={patient} flag={latestFlag} />,
    onRenderPrimaryText: () => (<div style={{ fontSize: '13px' }}>{patientName}</div>),
  };

  const onDismissClick = async () => {
    try {
      await setFlagToInactive(latestFlag);
      onDismiss(patient.id!);
    } catch (e) {
      console.error('Failed to update Flag: ', e);
    }
  };

  return (
    <div style={{ margin: '5px' }} data-key={patient.id}>
      <MessageBar
        onDismiss={onDismissClick}
        styles={messageBarStyles}
        dismissButtonAriaLabel="Close"
      >
        <Persona
          {...personaProps}
          size={PersonaSize.size40}
          presence={PersonaPresence.none}
          styles={personaStyles}
        />
        <div className="notification-text">
          {notificationText}
        </div>
      </MessageBar>
    </div>
  );
};
