import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

import type { ModelState } from "./types";

interface ModelTimerProps {
  modelState: ModelState;
}

function ModelTimer({ modelState }: ModelTimerProps) {
  const { loading, completedTime, error } = modelState;
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (loading) {
      setElapsed(0);
      interval = setInterval(() => {
        setElapsed((e) => +(e + 0.1).toFixed(1));
      }, 100);
    } else if (completedTime !== null) {
      setElapsed(completedTime);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, completedTime]);
  
  const display = (loading ? elapsed : completedTime ?? 0).toFixed(1);
  const isComplete = !loading && completedTime !== null && !error;
  const isFailed = !loading && !!error;
  
  return (
    <div
      className={`m-2 px-2 py-1 text-center text-sm font-mono rounded transition
        ${loading ? 'text-primary' : isComplete ? 'bg-green-100 text-green-800 font-bold' : isFailed ? 'bg-destructive/10 text-destructive font-bold border border-destructive' : ''}`}
      aria-live="polite">
      {loading && <>⏱️ Running: {display}s</>}
      {isComplete && <><CheckCircle className="inline w-4 h-4 mr-1 text-green-600 align-text-bottom" />Completed in {display}s</>}
      {isFailed && <><XCircle className="inline w-4 h-4 mr-1 text-destructive align-text-bottom" />Failed in {display}s</>}
    </div>
  );
}

export default ModelTimer; 