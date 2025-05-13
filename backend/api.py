import asyncio
import json
import os
from concurrent.futures import ThreadPoolExecutor
from typing import List

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from cluster_evaluation import evaluate_clusters
from generate_llm_clusters import generate_clusters_with_llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompareRequest(BaseModel):
    models: List[str]

@app.post("/api/compare")
async def compare_models_stream(req: CompareRequest):
    df = pd.read_csv(os.path.join('data', 'data.csv'))
    all_ids = df['id'].tolist()
    gt_path = os.path.join('data', 'ground_truth_clusters.json')
    with open(gt_path, 'r') as f:
        gt_clusters = json.load(f)

    loop = asyncio.get_event_loop()
    executor = ThreadPoolExecutor(max_workers=2)

    async def model_task(model_name):
        def run():
            result = generate_clusters_with_llm(df, model_name)
            if result["type"] == "final_clusters":
                clusters = result["clusters"]
                metrics = evaluate_clusters(gt_clusters, clusters, all_ids=all_ids)
                return {
                    "model": model_name,
                    "clusters": clusters,
                    "metrics": metrics
                }
            else:
                return {
                    "model": model_name,
                    "error": result.get("error", "Unknown error")
                }
        return await loop.run_in_executor(executor, run)

    async def event_stream():
        tasks = [model_task(m) for m in req.models]
        pending = set(map(asyncio.ensure_future, tasks))
        while pending:
            done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
            for fut in done:
                result = fut.result()
                yield json.dumps(result) + "\n"

    return StreamingResponse(event_stream(), media_type="application/jsonl")

# For uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 