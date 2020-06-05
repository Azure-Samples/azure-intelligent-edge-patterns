import React, { useEffect, useRef } from 'react';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { withRouter } from 'react-router-dom';

import { ai } from '../TelemetryService';

/**
 * This Component provides telemetry with Azure App Insights
 */
const TelemetryProvider: React.FC<any> = ({ instrumentationKey, history, after, children }) => {
  const initialized = useRef(false);

  useEffect(() => {
    const AppInsightsInstrumentationKey = instrumentationKey;
    if (!initialized.current && Boolean(AppInsightsInstrumentationKey) && Boolean(history)) {
      ai.initialize(AppInsightsInstrumentationKey, history);
      initialized.current = true;
    }

    after();
  }, [history, instrumentationKey, after]);

  return <>{children}</>;
};

export default withRouter(withAITracking(ai.reactPlugin, TelemetryProvider, 'TelemetryProvider'));
