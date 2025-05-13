import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

import type { ModelState } from "./types";

// --- Types ---
const MODEL_OPTIONS: Record<string, { label: string; models: string[] }> = {
  xai: {
    label: "xAI",
    models: ["grok-3-beta", "grok-3-mini-beta", "grok-3-mini-fast-beta"],
  },
  anthropic: {
    label: "Anthropic",
    models: ["claude-3-7-sonnet-latest", "claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"],
  }
};

const stripProvider = (modelString: string): string => modelString.split(":")[1] || modelString;

interface ModelSelectCardProps {
  modelState: ModelState;
  onChange: (model: string) => void;
}

function ModelSelectCard({ modelState, onChange }: ModelSelectCardProps) {
  const [provider, model] = modelState.model.split(":");
  const providers = Object.entries(MODEL_OPTIONS).map(([id, data]) => ({ id, label: data.label }));
  const selectedProvider = MODEL_OPTIONS[provider] || Object.values(MODEL_OPTIONS)[0];
  
  const handleProviderChange = (newProvider: string) => {
    const firstModel = MODEL_OPTIONS[newProvider]?.models[0];
    onChange(`${newProvider}:${firstModel}`);
  };

  return (
    <Card className="flex-1 min-w-[260px] border-border">
      <CardContent>
        <div className="mb-4">
          <label className="text-xs text-primary font-semibold mb-1 block">Provider</label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue>{selectedProvider.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {providers.map(({ id, label }) => (
                <SelectItem key={id} value={id}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-primary font-semibold mb-1 block">Model</label>
          <Select value={modelState.model} onValueChange={onChange}>
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue>{stripProvider(modelState.model)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{selectedProvider.label}</SelectLabel>
                {selectedProvider.models.map((m) => (
                  <SelectItem key={`${provider}:${m}`} value={`${provider}:${m}`}>{m}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export default ModelSelectCard; 