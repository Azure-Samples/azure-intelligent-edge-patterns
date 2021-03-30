/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import { initializeIcons, Spinner } from '@fluentui/react';
import React, { ReactElement, useEffect, useState } from 'react';
import './App.css';
import { Header } from './components/Header/Header';
import { NotificationsContainer } from './components/Notifications/NotificationsContainer';
import { PatientListView } from './components/PatientListView';
import { PatientDataCollection } from './data/PatientDataCollection';
import { getPatientsAndFlagsAndVitals, getLatestRecordLastUpdatedDate } from './serviceClient';

initializeIcons();

function App(): ReactElement {
  const [allPatientData, setAllPatientData] = useState<PatientDataCollection[]>([]);
  const [patientsFinishedLoading, setPatientsFinishedLoading] = useState<boolean>(false);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSetAllPatientData = async () => {
      const data = await getPatientsAndFlagsAndVitals();
      setAllPatientData(data);
      setPatientsFinishedLoading(true);
    };

    const checkForAndFetchNewPatientData = async () => {
      const latestRecordLastUpdatedDate = await getLatestRecordLastUpdatedDate();

      if (!latestRecordLastUpdatedDate) setPatientsFinishedLoading(true);

      const thereIsNewData = latestRecordLastUpdatedDate && latestRecordLastUpdatedDate !== lastUpdatedDate;
      if (thereIsNewData) {
        await fetchAndSetAllPatientData();
        setLastUpdatedDate(latestRecordLastUpdatedDate);
      }
    };

    const interval = setInterval(() => {
      checkForAndFetchNewPatientData();
    }, 5000);

    return () => clearInterval(interval);
  }, [lastUpdatedDate]);

  if (!patientsFinishedLoading) {
    return (
      <div className="loading-container">
        <Spinner className="spinner-styles" label="Loading patient data..." ariaLive="assertive" labelPosition="right" />
      </div>
    );
  }

  return (
    <div className="App">
      <NotificationsContainer
        allPatientData={allPatientData}
      />
      <Header />
      <PatientListView allPatientData={allPatientData} />
    </div>
  );
}

export default App;
