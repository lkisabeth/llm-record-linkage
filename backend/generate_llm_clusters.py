from typing import List

import pandas as pd
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field, validator

load_dotenv()

class Clusters(BaseModel):
    clusters: List[List[int]] = Field(description="A list of clusters, each containing a list of record IDs")

    # @validator('clusters')
    # def validate_no_duplicate_records(cls, clusters):
    #     seen_ids = set()
    #     for cluster in clusters:
    #         overlap = seen_ids & set(cluster)
    #         if overlap:
    #             raise ValueError(f"Record IDs {overlap} appear in multiple clusters")
    #         seen_ids.update(cluster)
    #     return clusters

def generate_clusters_with_llm(df: pd.DataFrame, model_name: str):
    records = df.to_csv(index=False)

    prompt = f"""
        You are an expert in record linkage and entity resolution.
        Your task is to group together person records that refer to the same real-world individual, based on the provided data. Each record has a unique integer ID.

        Instructions:
        Group records that refer to the same person into clusters, using only the information provided.
        Do NOT include singletons (clusters of size 1) in your output.
        Each record ID can appear in a maximum of one cluster.
        Output only valid JSON, with no extra text, explanation, or formatting.
        Each cluster should be a list of integer IDs. The output should look like:

            {{"clusters": [[12, 45, 78], [22, 99], [101, 102]]}}

        Checklist before you output:
        [ ] No record ID appears in more than one cluster
        [ ] No singletons (clusters of size 1)
        [ ] Output is a valid JSON object with a 'clusters' key, and no extra text

        Data:
        {records}
    """
    
    configurable_model = init_chat_model(temperature=0, max_retries=10, max_tokens=8192)
    structured_model = configurable_model.with_structured_output(Clusters)

    try:
        response = structured_model.invoke(
            prompt,
            config={"configurable": {"model": model_name}}
        )
        return {"type": "final_clusters", "model": model_name, "clusters": response.clusters}
    except Exception as e:
        return {"type": "error", "model": model_name, "error": str(e)}