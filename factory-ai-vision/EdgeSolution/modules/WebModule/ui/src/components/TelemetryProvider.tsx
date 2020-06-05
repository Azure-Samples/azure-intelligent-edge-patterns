import React, { useEffect, useRef, createContext, useContext } from 'react';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { withRouter } from 'react-router-dom';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import { ai, getAppInsights } from '../TelemetryService';

export const AppInsightContext = createContext<ApplicationInsights>(null);
export const useAppInsight = (): ApplicationInsights => useContext(AppInsightContext);

/**
 * This Component provides telemetry with Azure App Insights
 */
const TelemetryProvider: React.FC<any> = ({ instrumentationKey, history, children }) => {
  const initialized = useRef(false);

  useEffect(() => {
    const AppInsightsInstrumentationKey = instrumentationKey;
    if (!initialized.current && Boolean(AppInsightsInstrumentationKey) && Boolean(history)) {
      ai.initialize(AppInsightsInstrumentationKey, history);
      initialized.current = true;
    }
  }, [history, instrumentationKey]);

  return <AppInsightContext.Provider value={getAppInsights()}>{children}</AppInsightContext.Provider>;
};

export default withRouter(withAITracking(ai.reactPlugin, TelemetryProvider, 'TelemetryProvider'));
