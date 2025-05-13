export interface Metrics {
  precision: number;
  recall: number;
  f1: number;
}

export interface AllMetrics {
  pairwise: Metrics;
  v_measure: number;
  vi: number;
  closest_cluster_f1: Metrics;
}

export interface ModelState {
  model: string;
  results: number[][] | null;
  metrics: AllMetrics | null;
  loading: boolean;
  error: string | null;
  completedTime: number | null;
}
