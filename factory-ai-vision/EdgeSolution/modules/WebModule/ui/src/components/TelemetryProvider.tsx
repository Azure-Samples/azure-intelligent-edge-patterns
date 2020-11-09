import React, { useEffect, useRef } from 'react';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { withRouter } from 'react-router-dom';

import { ai } from '../TelemetryService';

/**
 * This Component provides telemetry with Azure App Insights
 * See the [repo](https://github.com/microsoft/ApplicationInsights-JS/tree/master/extensions/applicationinsights-react-js) for more info
 */
const TelemetryProvider: React.FC<any> = ({ instrumentationKey, isAppInsightOn, history, children }) => {
  const initialized = useRef(false);

  useEffect(() => {
    const AppInsightsInstrumentationKey = instrumentationKey;
    if (!initialized.current && Boolean(AppInsightsInstrumentationKey) && Boolean(history)) {
      ai.initialize(AppInsightsInstrumentationKey, isAppInsightOn, history);
      initialized.current = true;
    }
  }, [history, instrumentationKey, isAppInsightOn]);

  return <>{children}</>;
};

export default withRouter(withAITracking(ai.reactPlugin, TelemetryProvider, 'TelemetryProvider'));
