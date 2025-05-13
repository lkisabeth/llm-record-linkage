# LLM Record Linkage Comparison

## Project Overview

This project evaluates how well large language models (LLMs) can solve the record linkage problem: grouping together records that likely refer to the same person. Since the provided dataset was artificial and did not include any labels to evaluate against ground truth, a pseudo-ground truth was created using traditional record linkage techniques. Each LLM is then asked to cluster the same data, and their outputs are evaluated against the pseudo-ground truth using a variety of metrics.

### Model Selection
A selection of models from **xAI** and **Anthropic** are available for comparison:
- **xAI:** grok-3-beta, grok-3-mini-beta, grok-3-mini-fast-beta
- **Anthropic:** claude-3-7-sonnet-latest, claude-3-5-sonnet-latest, claude-3-5-haiku-latest

These models represent a decently wide range of capability. OpenAI models were excluded due to API issues at time of writing.

### Evaluation Techniques
- Each model receives the same data and is prompted to cluster records referring to the same person.
- Each model's output is evaluated against the artificial ground truth using several metrics:
  - **Pairwise Precision/Recall/F1:** How well does the model identify correct links between records?
  - **V-Measure:** A clustering metric that balances homogeneity and completeness.
  - **Variation of Information (VI):** Measures the distance between the predicted and true clusterings.
  - **Closest Cluster Precision/Recall/F1:** For each predicted cluster, how well does it match the closest ground truth cluster?
- A timer is included to compare the time it takes each model to run.

### Failure Modes & Analysis
- **Structured Output Errors:** Models can struggle to follow instructions when parsing large amounts of data, sometimes failing to conform to the structured output format.
- **Duplicate Record IDs:** Models may return clusters with duplicate record IDs, even with validation attempts.
- **Output Token Limits:** Models may hit their output token limit and fail to complete the task, especially when duplicate records compound the issue.
- **Time to Completion:** Parsing the entire dataset and producing all clusters takes LLMs a long time, especially compared to traditional techniques.
- **Record Linkage Failure Modes:** More specific failure modes related to record linkage were not thoroughly analyzed due to time constraints.

### What Could Be Improved
- A true ground truth would be a much better tool for evaluation than the current pseudo-ground truth.
- There is significant room for improvement in prompt engineering and agent architecture. For example:
    - **Preprocessing:** Preprocess the data before sending it to the models. Use traditional methods to reduce the number of potential matches that need to be assessed by the LLM.
    - **Instruction Refinement:** Iteratively refine instructions to improve reliability of the output and reduce ambiguity for the models.
    - **Multi-step Validation:** Perhaps build a pipeline where the LLM first proposes clusters, then validates or justifies them in a second step.
    - **Ensemble Approaches:** Combine outputs from multiple LLMs and/or traditional algorithms.
    - **Post-processing:** Automatically check for and fix common issues (e.g., duplicate IDs, overlapping clusters) after LLM output.
    - **Retry Logic:** Automatically re-prompt or adjust the prompt if the output is invalid or incomplete.
    - **Streaming/Chunking:** For very large datasets, split the data into manageable chunks and merge results intelligently.
    - **Interactive Feedback:** Allow for human-in-the-loop corrections or confirmations, especially for ambiguous cases.
- More time could be spent on analysis to better understand failure modes.
- Add more LLMs to the comparison.
- Significantly improve the architecture and organization of the code.

---

# Getting Started

## Backend Setup

1. **Install Python dependencies**

   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure environment variables**

   - Copy `env.example` to `.env` and fill in your API keys for Anthropic and xAI:
     ```bash
     cp env.example .env
     # Edit .env to add your API keys
     ```

3. **Run the backend server**

   ```bash
   uvicorn api:app --host 0.0.0.0 --port 8000
   ```
   The backend will be available at `http://localhost:8000`.

## Frontend Setup

1. **Install Node.js dependencies**

   ```bash
   cd frontend
   npm install
   # or
   yarn install
   ```

2. **Run the frontend development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will be available at `http://localhost:3000`.

## Testing the Project Locally

- Make sure both the backend (on port 8000) and frontend (on port 3000) are running.
- Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.
- You can select models, run comparisons, and view results side-by-side.

---