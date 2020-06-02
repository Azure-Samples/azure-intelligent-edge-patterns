import React, { Component, ReactNode } from 'react';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { withRouter } from 'react-router-dom';

import { ai } from '../TelemetryService';

/**
 * This Component provides telemetry with Azure App Insights
 *
 * NOTE: the package '@microsoft/applicationinsights-react-js' has a HOC withAITracking that requires this to be a Class Component rather than a Functional Component
 */
class TelemetryProvider extends Component<any, { initialized: boolean }> {
  state = {
    initialized: false,
  };

  componentDidMount(): void {
    const { history } = this.props;
    const { initialized } = this.state;
    const AppInsightsInstrumentationKey = this.props.instrumentationKey; // PUT YOUR KEY HERE
    if (!initialized && Boolean(AppInsightsInstrumentationKey) && Boolean(history)) {
      ai.initialize(AppInsightsInstrumentationKey, history);
      this.setState({ initialized: true });
    }

    this.props.after();
  }

  render(): ReactNode {
    const { children } = this.props;
    return <>{children}</>;
  }
}

export default withRouter(withAITracking(ai.reactPlugin, TelemetryProvider));
