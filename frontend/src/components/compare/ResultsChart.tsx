import React from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

import type { AllMetrics } from "./types";

const stripProvider = (modelString: string): string => modelString.split(":")[1] || modelString;

interface ResultsChartProps {
  metrics: [AllMetrics | null, AllMetrics | null];
  selectedModels: [string, string];
}

function ResultsChart({ metrics, selectedModels }: ResultsChartProps) {
  const model1 = stripProvider(selectedModels[0]);
  const model2 = stripProvider(selectedModels[1]);
  
  // Prepare data even when some metrics are not available
  const chartData = [
    { 
      metric: "Precision", 
      [model1]: metrics[0]?.pairwise.precision || 0, 
      [model2]: metrics[1]?.pairwise.precision || 0 
    },
    { 
      metric: "Recall", 
      [model1]: metrics[0]?.pairwise.recall || 0, 
      [model2]: metrics[1]?.pairwise.recall || 0 
    },
    { 
      metric: "F1", 
      [model1]: metrics[0]?.pairwise.f1 || 0, 
      [model2]: metrics[1]?.pairwise.f1 || 0 
    },
  ];
  
  const chartConfig = {
    [model1]: {
      label: [model1],
      color: "hsl(var(--chart-1))"
    },
    [model2]: {
      label: [model2],
      color: "hsl(var(--chart-2))"
    }
  } satisfies ChartConfig;
  
  return (
    <div className="w-full h-[300px]">
      <ChartContainer config={chartConfig} className="h-full">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis 
            dataKey="metric" 
            tickLine={false} 
            axisLine={true}
          />
          <YAxis 
            tickLine={false} 
            axisLine={true}
            domain={[0, 1]} 
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey={model1} fill="var(--chart-1)" radius={4} />
          <Bar dataKey={model2} fill="var(--chart-2)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export default ResultsChart; 