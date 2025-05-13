import React from "react";
import { Info, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import type { AllMetrics } from "./types";

interface MetricsCardProps {
  metrics: AllMetrics | null;
  label: string;
  error?: string | null;
}

const formatPercent = (value: number | null | undefined): string => value ? `${(value * 100).toFixed(1)}%` : "-";

const metricTooltips: Record<string, string> = {
  "Pairwise Precision": "Of all record pairs the model linked, what fraction are correct?",
  "Pairwise Recall": "Of all true matching record pairs, what fraction did the model find?",
  "Pairwise F1": "The harmonic mean of pairwise precision and recall."
};

function MetricsCard({ metrics, label, error }: MetricsCardProps) {
  if (error) {
    return (
      <Card className="flex-1 text-center border-destructive bg-destructive/10 min-w-[220px]">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center justify-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2">
            <span className="text-destructive text-sm bg-destructive/20 rounded px-3 py-2 max-w-xs break-words border border-destructive/30">
              {error}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!metrics) {
    return (
      <Card className="flex-1 text-center border-border min-w-[220px]">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No metrics yet.</div>
        </CardContent>
      </Card>
    );
  }

  const displayMetrics = [
    { label: "Pairwise Precision", value: formatPercent(metrics.pairwise.precision) },
    { label: "Pairwise Recall", value: formatPercent(metrics.pairwise.recall) },
    { label: "Pairwise F1", value: formatPercent(metrics.pairwise.f1) }
  ];

  return (
    <Card className="flex-1 text-center border-border min-w-[220px]">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 items-center">
          {displayMetrics.map(metric => (
            <React.Fragment key={metric.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-primary cursor-help inline-flex items-center gap-1">
                    {metric.label}
                    <Info className="w-3 h-3 text-muted-foreground" aria-label="info" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{metricTooltips[metric.label]}</TooltipContent>
              </Tooltip>
              <div className="text-2xl font-mono font-bold text-foreground">{metric.value}</div>
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricsCard; 