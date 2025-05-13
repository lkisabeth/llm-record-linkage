"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import Header from "@/components/compare/Header";
import ModelSelectCard from "@/components/compare/ModelSelectCard";
import ModelTimer from "@/components/compare/ModelTimer";
import MetricsCard from "@/components/compare/MetricsCard";
import ResultsChart from "@/components/compare/ResultsChart";
import ExtraMetricsTable from "@/components/compare/ExtraMetricsTable";

import type { ModelState } from "@/components/compare/types";

// --- Main State Logic ---
function useComparisonState() {
  const [models, setModels] = useState<ModelState[]>([
    {
      model: "anthropic:claude-3-7-sonnet-latest",
      results: null,
      metrics: null,
      loading: false,
      error: null,
      completedTime: null,
    },
    {
      model: "xai:grok-3-beta",
      results: null,
      metrics: null,
      loading: false,
      error: null,
      completedTime: null,
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateModel = (index: number, data: Partial<ModelState>) => {
    setModels(prev => prev.map((m, i) => i === index ? { ...m, ...data } : m));
  };

  const handleModelChange = (index: number, model: string) => {
    updateModel(index, { model });
  };

  const runComparison = async () => {
    setIsRunning(true);
    const startTime = Date.now();
    
    // Reset model states
    setModels(models.map(m => ({
      ...m,
      results: null,
      metrics: null,
      error: null,
      loading: true,
      completedTime: null
    })));
    
    try {
      const res = await fetch("http://localhost:8000/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models: models.map(m => m.model) }),
      });
      
      if (!res.body) throw new Error("No response body");
      
      // Stream processing (rough hack just so each model updates the UI as soon as it gets a result)
      const reader = res.body.getReader();
      let buffer = "";
      let done = false;
      
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        
        if (value) {
          buffer += new TextDecoder().decode(value);
          let lines = buffer.split("\n");
          buffer = lines.pop() || ""; // last may be incomplete
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            const result = JSON.parse(line);
            const modelIndex = models.findIndex(m => m.model === result.model);
            
            if (modelIndex !== -1) {
              updateModel(modelIndex, {
                results: result.clusters || null,
                metrics: result.metrics || null,
                error: result.error || null,
                loading: false,
                completedTime: (Date.now() - startTime) / 1000
              });
            }
          }
        }
      }
    } catch (err: any) {
      // Handle errors for both models
      setModels(models.map(m => ({
        ...m,
        error: err.message,
        loading: false,
        completedTime: null
      })));
    } finally {
      setIsRunning(false);
    }
  };

  return {
    models,
    handleModelChange,
    runComparison,
    isLoading: isRunning || models.some(m => m.loading),
  };
}

// --- Main Component ---
export default function ComparePage() {
  const { models, handleModelChange, runComparison, isLoading } = useComparisonState();

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-screen-xl mx-auto bg-background min-h-screen">
      <Sheet>
        <Header />
        
        {/* About Sheet Content */}
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
          <SheetHeader className="px-6 pt-2 pb-0">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold text-primary">
              <Info className="w-6 h-6 text-primary" />
              About This Experiment
            </SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-6 text-foreground overflow-y-auto">
            <section>
              <h3 className="font-semibold text-primary mb-1">Experiment Design</h3>
              <p>
                This project evaluates how well large language models (LLMs) can solve the record linkage problem: grouping together records that likely refer to the same person.
                Since the provided dataset was artificial and did not include any labels to evaluate against ground truth, I created a pseudo-ground truth using traditional record linkage techniques, then asked each LLM to cluster the same data.
                Their outputs are evaluated against the ground truth using a variety of metrics.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-primary mb-1">Model Selection</h3>
              <p>
                I wanted to provide as many models as possible for comparison, but landed on a few from <b>xAI</b> and <b>Anthropic</b>. My OpenAI API keys were strangely having issues, so I had to remove those models from the comparison.
                The specific models available for comparison are:
              </p>
              <ul className="list-disc ml-6">
                <li><b>xAI:</b> grok-3-beta, grok-3-mini-beta, grok-3-mini-fast-beta</li>
                <li><b>Anthropic:</b> claude-3-7-sonnet-latest, claude-3-5-sonnet-latest, claude-3-5-haiku-latest</li>
              </ul>
              <p>
                These represent a decently wide range of capability.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-primary mb-1">Evaluation Techniques</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Each model receives the same data and is prompted to cluster records referring to the same person.</li>
                <li>Each model's output is evaluated against the artificial ground truth using several metrics:
                  <ul className="list-disc ml-6">
                    <li><b>Pairwise Precision/Recall/F1:</b> How well does the model identify correct links between records?</li>
                    <li><b>V-Measure:</b> A clustering metric that balances homogeneity and completeness.</li>
                    <li><b>Variation of Information (VI):</b> Measures the distance between the predicted and true clusterings.</li>
                    <li><b>Closest Cluster Precision/Recall/F1:</b> For each predicted cluster, how well does it match the closest ground truth cluster?</li>
                  </ul>
                </li>
                <li>I also included a timer so you can compare the time it takes each model to run.</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-primary mb-1">Failure Modes & Analysis</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li><b>Structured Output Errors:</b> Models can struggle to follow instructions when parsing such a large amount of data, and they sometimes fail to conform to the structured output format.</li>
                <li><b>Duplicate Record IDs:</b> The models will frequently return clusters with duplicate record IDs. I tried adding a validator to the pydantic model, but the LLMs would often hit their retry limit before conforming.</li>
                <li><b>Output Token Limits:</b> The models will sometimes hit their output token limit and fail to complete the task (duplicate records compounded this issue).</li>
                <li><b>Time to Completion:</b> When asking them to parse the entire dataset and produce all clusters, it takes LLMs a LONG time to complete the task, especially relative to the traditional record linkage techniques.</li>
                <li><b>Record Linkage Failure Modes:</b> I did not have time to thoroughly analyze failure modes that are more specific to the record linkage problem.</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-primary mb-1">What Could Be Improved</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>A true ground truth would be a much better tool for evaluation than my pseudo-ground truth.</li>
                <li>There is a TON of room for improvement in the prompt engineering and agent architecture.</li>
                <li>I would like to spend more time on the analysis of the results to better understand the failure modes, but ran out of time.</li>
                <li>Add more LLMs to the comparison.</li>
                <li>Significantly improve the architecture and organization of the code. It's messy.</li>
              </ul>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      {/* Model Selection */}
      <section className="flex flex-col md:flex-row gap-8 items-stretch mb-4">
        <div className="flex-1 min-w-[260px] flex flex-col">
          <ModelSelectCard modelState={models[0]} onChange={(model) => handleModelChange(0, model)} />
          <ModelTimer modelState={models[0]} />
        </div>
        
        <div className="flex flex-col justify-center items-center gap-4 min-w-[180px]">
          <Button
            className={`min-w-[180px] text-lg font-semibold px-8 py-4 rounded-full ${!isLoading ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"}`}
            onClick={runComparison}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Running…" : "Compare"}
          </Button>
        </div>
        
        <div className="flex-1 min-w-[260px] flex flex-col">
          <ModelSelectCard modelState={models[1]} onChange={(model) => handleModelChange(1, model)} />
          <ModelTimer modelState={models[1]} />
        </div>
      </section>

      {/* Results Section */}
      <section>
        <div className="flex flex-col md:flex-row gap-6">
          <MetricsCard metrics={models[0].metrics} label={models[0].model.split(":")[1]} error={models[0].error} />
          <div className="flex-1 flex flex-col items-center justify-center min-h-[240px]">
            <ResultsChart 
              metrics={[models[0].metrics, models[1].metrics]} 
              selectedModels={[models[0].model, models[1].model]} 
            />
          </div>
          <MetricsCard metrics={models[1].metrics} label={models[1].model.split(":")[1]} error={models[1].error} />
        </div>
        
        {/* Extra metrics table */}
        <ExtraMetricsTable metrics={[models[0].metrics, models[1].metrics]} />
      </section>
    </div>
  );
}