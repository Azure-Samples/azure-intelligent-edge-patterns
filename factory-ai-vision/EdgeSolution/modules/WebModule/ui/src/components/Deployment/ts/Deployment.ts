export type AdditionalProps = {
  onOpenCreatePanel: () => void;
  onOpenEditPanel: () => void;
};

export type DeploymentProps = AdditionalProps;

type ScenarioMetricsName = 'violation' | 'all_objects';

type ScenarioMetrics = {
  name: ScenarioMetricsName;
  count: { [key: string]: { current: number; total: number } } | null;
};

export type InferenceMetrics = {
  average_time: number;
  count: { [key: string]: number } | null;
  device: string;
  inference_num: { [key: string]: number } | number;
  scenario_metrics: ScenarioMetrics[];
  success_rate: { [key: string]: number } | null;
  unidentified_num: { [key: string]: number } | null;
};
