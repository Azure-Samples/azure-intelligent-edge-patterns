import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

let reactPlugin = null;
let appInsights = null;

/**
 * Create the App Insights Telemetry Service
 * @return {{reactPlugin: ReactPlugin, appInsights: Object, initialize: Function}} - Object
 */
const createTelemetryService = (): { reactPlugin; appInsights; initialize } => {
  /**
   * Initialize the Application Insights class
   * @param {string} instrumentationKey - Application Insights Instrumentation Key
   * @param {Object} browserHistory - client's browser history, supplied by the withRouter HOC
   * @return {void}
   */
  const initialize = (instrumentationKey: string, isAppInsightOn: boolean, browserHistory): any => {
    if (!browserHistory) {
      throw new Error('Could not initialize Telemetry Service');
    }
    if (!instrumentationKey) {
      throw new Error('Instrumentation key not provided in /src/components/TelemetryProvider.tsx');
    }

    reactPlugin = new ReactPlugin();

    appInsights = new ApplicationInsights({
      config: {
        instrumentationKey,
        maxBatchInterval: 0,
        disableFetchTracking: false,
        disableTelemetry: !isAppInsightOn,
        extensions: [reactPlugin],
        extensionConfig: {
          [reactPlugin.identifier]: {
            history: browserHistory,
          },
        },
      },
    });

    appInsights.loadAppInsights();
  };

  return { reactPlugin, appInsights, initialize };
};

export const ai = createTelemetryService();
export const getAppInsights = (): ApplicationInsights => appInsights;
