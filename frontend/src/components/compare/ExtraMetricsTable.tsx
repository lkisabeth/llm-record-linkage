import React from "react";
import { Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import type { AllMetrics } from "./types";

const formatPercent = (value: number | null | undefined): string => value ? `${(value * 100).toFixed(1)}%` : "-";

const metricTooltips: Record<string, string> = {
  "V-Measure": "A clustering metric balancing homogeneity and completeness (1 is best)",
  "Variation of Information (VI)": "Measures the distance between predicted and true clusterings (lower is better)",
  "Closest Cluster Precision": "For each predicted cluster, the best overlap with any true cluster (precision)",
  "Closest Cluster Recall": "For each true cluster, the best overlap with any predicted cluster (recall)",
  "Closest Cluster F1": "The harmonic mean of closest cluster precision and recall."
};

interface ExtraMetricsTableProps {
  metrics: [AllMetrics | null, AllMetrics | null];
}

function ExtraMetricsTable({ metrics }: ExtraMetricsTableProps) {
  const metricsConfig = [
    { label: "V-Measure", path: "v_measure", format: "percent" },
    { label: "Variation of Information (VI)", path: "vi", format: "number" },
    { label: "Closest Cluster Precision", path: "closest_cluster_f1.precision", format: "percent" },
    { label: "Closest Cluster Recall", path: "closest_cluster_f1.recall", format: "percent" },
    { label: "Closest Cluster F1", path: "closest_cluster_f1.f1", format: "percent" }
  ];
  
  const formatValue = (metric: AllMetrics | null, path: string, format: string): string => {
    if (!metric) return "-";
    // Access nested properties using path string
    const value = path.split('.').reduce((obj, key) => obj?.[key as keyof typeof obj], metric as any);
    if (value === undefined || value === null) return "-";
    return format === "percent" ? formatPercent(value) : value.toFixed(3);
  };
  
  return (
    <>
      <Card className="mt-6 border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-center">Additional Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-1 w-full">
            {/* Metric rows */}
            {metricsConfig.map((config) => (
              <React.Fragment key={config.label}>
                <div className="p-2 text-center">
                  <div className="text-2xl font-mono font-bold text-foreground">
                    {formatValue(metrics[0], config.path, config.format)}
                  </div>
                </div>
                <div className="p-2 text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-sm text-primary cursor-help inline-flex items-center gap-1">
                        {config.label}
                        <Info className="w-3 h-3 text-muted-foreground" aria-label="info" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{metricTooltips[config.label]}</TooltipContent>
                  </Tooltip>
                </div>
                <div className="p-2 text-center">
                  <div className="text-2xl font-mono font-bold text-foreground">
                    {formatValue(metrics[1], config.path, config.format)}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Glossary Section */}
      <div className="max-w-2xl mx-auto mt-8 p-4 border rounded bg-muted text-muted-foreground text-sm">
        <div className="font-semibold text-primary mb-2 flex items-center gap-2"><Info className="w-4 h-4" />Metric Glossary</div>
        <ul className="list-disc ml-6 space-y-1">
          <li><b>Pairwise Precision</b>: Of all record pairs the model linked, what fraction are correct?</li>
          <li><b>Pairwise Recall</b>: Of all true matching record pairs, what fraction did the model find?</li>
          <li><b>Pairwise F1</b>: The harmonic mean of pairwise precision and recall.</li>
          <li><b>V-Measure</b>: A clustering metric balancing homogeneity and completeness (1 is best).</li>
          <li><b>Variation of Information (VI)</b>: Measures the distance between predicted and true clusterings (lower is better).</li>
          <li><b>Closest Cluster Precision</b>: For each predicted cluster, the best overlap with any true cluster (precision).</li>
          <li><b>Closest Cluster Recall</b>: For each true cluster, the best overlap with any predicted cluster (recall).</li>
          <li><b>Closest Cluster F1</b>: The harmonic mean of closest cluster precision and recall.</li>
        </ul>
      </div>
    </>
  );
}

export default ExtraMetricsTable; 