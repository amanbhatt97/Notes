// notes/mlops/mlops_deploy.js — Deployment Strategies
Object.assign(TOPIC_CONTENT, {
  "mlops_deploy": `<main>
  <h1>Deployment Strategies</h1>
  <p class="lead">A model earns money only once it answers real requests. This page covers how predictions are served (batch, online, streaming), where they run (Docker, Kubernetes, SageMaker), how new versions ship safely (CI/CD, canary, shadow, rollback) and how models are packaged. It builds on <em>The ML Lifecycle</em> and <em>MLflow</em>.</p>

  <h2 id="dp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Deployment Strategies</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Inference modes</div>
        <ul>
          <li><b>Batch</b> — scheduled job scores a table; hours; cheap; churn, weekly recs</li>
          <li><b>Online</b> — API per request; ms; always-on; checkout, search</li>
          <li><b>Streaming</b> — consumer on Kafka; seconds; fraud on card swipes</li>
          <li><b>Hybrid</b> — precompute heavy parts in batch, score online</li>
          <li><b>Rule</b> — batch unless the input only exists at request time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">FastAPI + Docker</div>
        <ul>
          <li><b>Pydantic</b> — validates input; bad shape → 422</li>
          <li><b>Load at startup</b> — never per request</li>
          <li><b><code>/health</code></b> — for readiness probes and load balancers</li>
          <li><b>Docker image</b> — freezes code + model + deps; pin the tag</li>
          <li>⚠ <b>Slow p99</b> — per-request loading, one worker, DB calls per request</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kubernetes</div>
        <ul>
          <li><b>Pod</b> — smallest unit, one+ containers</li>
          <li><b>Deployment</b> — keeps N replicas, rolling updates, <code>rollout undo</code></li>
          <li><b>Service</b> — stable address, load-balances healthy pods</li>
          <li><b>HPA</b> — scales replicas on CPU/memory/custom metrics</li>
          <li>💡 Kitchen: chefs (pods), shift manager (Deployment), counter (Service), rush-hour hires (HPA)</li>
          <li>⚠ <b>HPA needs <code>resources.requests</code></b>; add readiness probe for slow model loads</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CI/CD for ML</div>
        <ul>
          <li><b>Code tests</b> — pytest on features, API contract</li>
          <li><b>Data tests</b> — schema, nulls, ranges (Great Expectations, Pandera)</li>
          <li><b>Model tests</b> — beat baseline + champion, slices, latency, invariance</li>
          <li><b>Flow</b> — test → train on sample → build image → staging → canary</li>
          <li>⚠ <b>Full retrain in CI</b> — too slow; that runs in a training pipeline</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SageMaker</div>
        <ul>
          <li><b>Real-time endpoint</b> — always-on HTTPS; billed per instance-hour</li>
          <li><b>Serverless</b> — scales to zero; cold starts</li>
          <li><b>Async</b> — queued, large payloads, long jobs</li>
          <li><b>Batch Transform</b> — scores S3 data, then shuts down</li>
          <li><b>Call</b> — <code>boto3.client("sagemaker-runtime").invoke_endpoint(...)</code></li>
          <li>⚠ <b>Idle endpoints still bill</b> — delete test endpoints</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rollout strategies</div>
        <ul>
          <li><b>Blue-green</b> — two envs, flip all traffic; instant rollback; 2× infra briefly</li>
          <li><b>Canary</b> — 5% → 25% → 100% while metrics hold; limits blast radius</li>
          <li><b>Shadow</b> — v2 scores a copy of traffic silently; zero user risk</li>
          <li><b>Order</b> — shadow (sane?) → canary (safe?) → A/B (better?)</li>
          <li>⚠ <b>Canary ≠ A/B</b> — too small/short to prove business lift</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Versioning &amp; rollback</div>
        <ul>
          <li><b>Chain</b> — Git SHA → data version → registry version → image tag → deployment</li>
          <li><b>Log model version per prediction</b> — trace any bad output</li>
          <li><b>Rollback = move a pointer</b> — alias, <code>kubectl rollout undo</code>, back to blue</li>
          <li>⚠ <b>Deleted feature pipeline</b> — keep old features alive or rollback breaks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Packaging</div>
        <ul>
          <li><b>pickle / joblib</b> — any object; <code>__reduce__</code> runs code on load</li>
          <li>⚠ <b>Untrusted pickle = remote code execution</b>; also breaks across library versions</li>
          <li><b>skops</b> — safe sklearn format with type allow-list</li>
          <li><b>safetensors</b> — weights only, for NN/LLMs</li>
          <li><b>ONNX</b> — code-free op graph; any language/runtime; <code>skl2onnx.to_onnx</code></li>
          <li><b>Verify</b> — converted outputs must match original (569/569 here)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dp-modes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Batch vs Online vs Streaming</span><span class="rm-sub">When predictions are made</span></div></div>
      <div class="rm-item rm-done" data-target="dp-api"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">FastAPI + Docker</span><span class="rm-sub">The standard serving unit</span></div></div>
      <div class="rm-item rm-done" data-target="dp-k8s"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Kubernetes Basics</span><span class="rm-sub">Pods, services, autoscaling</span></div></div>
      <div class="rm-item rm-done" data-target="dp-cicd"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">CI/CD for ML</span><span class="rm-sub">Test code, data and model</span></div></div>
      <div class="rm-item rm-done" data-target="dp-sm"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">AWS SageMaker</span><span class="rm-sub">Endpoints and Batch Transform</span></div></div>
      <div class="rm-item rm-done" data-target="dp-roll"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Blue-Green, Canary, Shadow</span><span class="rm-sub">Shipping without fear</span></div></div>
      <div class="rm-item rm-done" data-target="dp-ver"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Versioning &amp; Rollback</span><span class="rm-sub">Undo in one minute</span></div></div>
      <div class="rm-item rm-done" data-target="dp-pack"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Model Packaging</span><span class="rm-sub">Pickle risks, ONNX</span></div></div>
      <div class="rm-item rm-done" data-target="dp-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dp-modes"><span class="num">01</span>Batch vs Online vs Streaming</h2>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="dp-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <g stroke="currentColor" fill="none" marker-end="url(#dp-ar1)">
      <line x1="140" y1="30" x2="198" y2="30"/><line x1="340" y1="30" x2="398" y2="30"/>
      <line x1="140" y1="85" x2="198" y2="85"/><line x1="340" y1="85" x2="398" y2="85"/>
      <line x1="140" y1="140" x2="198" y2="140"/><line x1="340" y1="140" x2="398" y2="140"/>
    </g>
    <text x="10" y="34">Batch</text><rect x="200" y="12" width="140" height="36" rx="6" class="fb sb"/><text x="270" y="35" text-anchor="middle">nightly job, 10M rows</text><rect x="400" y="12" width="190" height="36" rx="6" class="fs" stroke="currentColor"/><text x="495" y="35" text-anchor="middle">table → app reads later</text>
    <text x="10" y="89">Online</text><rect x="200" y="67" width="140" height="36" rx="6" class="fg sg"/><text x="270" y="90" text-anchor="middle">API, 1 request</text><rect x="400" y="67" width="190" height="36" rx="6" class="fs" stroke="currentColor"/><text x="495" y="90" text-anchor="middle">answer in ~50 ms</text>
    <text x="10" y="144">Streaming</text><rect x="200" y="122" width="140" height="36" rx="6" class="ft st"/><text x="270" y="145" text-anchor="middle">consumer on Kafka</text><rect x="400" y="122" width="190" height="36" rx="6" class="fs" stroke="currentColor"/><text x="495" y="145" text-anchor="middle">event → score → topic</text>
    <text x="70" y="52" class="tm" font-size="11">schedule</text><text x="70" y="107" class="tm" font-size="11">user request</text><text x="70" y="162" class="tm" font-size="11">event arrives</text>
  </svg><figcaption>Same model, three ways to call it. The question is when the prediction must exist.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Batch</th><th>Online (real-time)</th><th>Streaming</th></tr>
    <tr><td>Latency</td><td>Hours</td><td>Milliseconds</td><td>Seconds</td></tr>
    <tr><td>Input</td><td>Whole table</td><td>One request</td><td>Continuous event stream</td></tr>
    <tr><td>Fresh features?</td><td>As of last run</td><td>Yes, at request time</td><td>Yes, rolling windows</td></tr>
    <tr><td>Infra cost</td><td>Low (spot instances, then off)</td><td>Always-on servers</td><td>Always-on consumers + broker</td></tr>
    <tr><td>Use when</td><td>Churn scores, weekly recs, lead scoring</td><td>Search ranking, credit decision at checkout</td><td>Fraud on card swipes, IoT anomalies</td></tr>
    <tr><td>Tools</td><td>Spark, Airflow, SageMaker Batch Transform</td><td>FastAPI, Triton, SageMaker endpoint</td><td>Kafka + Flink / Spark Streaming</td></tr>
  </table>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Start with batch if the business can wait. It is cheaper, simpler to debug and easy to rerun. Go online only when the input is unknown until the request arrives.</p>
  </div>

  <h2 id="dp-api"><span class="num">02</span>FastAPI + Docker</h2>
  <div class="flow"><span>Client JSON</span><span>FastAPI validates (Pydantic)</span><span>Model loaded at startup</span><span>predict()</span><span>JSON response</span></div>
  <div class="fx" data-lang="py">import numpy as np, onnxruntime as ort
from fastapi import FastAPI
from pydantic import BaseModel, Field

sess = ort.InferenceSession("model.onnx")      # load ONCE at startup, not per request
app = FastAPI()

class Patient(BaseModel):
    features: list[float] = Field(min_length=30, max_length=30)

@app.get("/health")
def health():
    return {"status": "ok", "model_version": "1"}

@app.post("/predict")
def predict(p: Patient):
    x = np.array([p.features], dtype=np.float32)
    label, probs = sess.run(None, {"X": x})
    return {"label": int(label[0]), "p_benign": round(float(probs[0][1]), 4)}</div>
  <div class="fx" data-lang="text"># tested with fastapi.testclient.TestClient
GET  /health                     -&gt; {'status': 'ok', 'model_version': '1'}
POST /predict  (row 0)           -&gt; {'label': 0, 'p_benign': 0.0}
POST /predict  (row 20)          -&gt; {'label': 1, 'p_benign': 0.9987}
POST /predict  [1.0, 2.0]        -&gt; 422 List should have at least 30 items after validation, not 2</div>
  <p>Ship it as a Docker image (<code>FROM python:3.12-slim</code>, install pinned deps, copy <code>app.py</code> + <code>model.onnx</code>, <code>CMD uvicorn app:app</code>): code, model and dependencies frozen together. Details: the <em>FastAPI</em> and <em>Docker</em> notes.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Loading the model inside the request handler adds seconds per call. Load at startup; expose <code>/health</code> so the orchestrator knows when the pod is ready.</p>
  </div>

  <h2 id="dp-k8s"><span class="num">03</span>Kubernetes Basics</h2>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="dp-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="60" width="90" height="40" rx="6" class="fs" stroke="currentColor"/><text x="55" y="84" text-anchor="middle">clients</text>
    <rect x="140" y="55" width="110" height="50" rx="6" class="fv" stroke="currentColor"/><text x="195" y="77" text-anchor="middle">Service</text><text x="195" y="93" text-anchor="middle" class="tm" font-size="11">stable IP, LB</text>
    <rect x="290" y="10" width="200" height="140" rx="8" fill="none" stroke="currentColor" stroke-dasharray="5 3"/><text x="300" y="28" class="tm" font-size="11">Deployment: replicas=3</text>
    <rect x="310" y="38" width="160" height="30" rx="5" class="fb sb"/><text x="390" y="58" text-anchor="middle">pod: model-api v2</text>
    <rect x="310" y="76" width="160" height="30" rx="5" class="fb sb"/><text x="390" y="96" text-anchor="middle">pod: model-api v2</text>
    <rect x="310" y="114" width="160" height="30" rx="5" class="fb sb"/><text x="390" y="134" text-anchor="middle">pod: model-api v2</text>
    <rect x="510" y="55" width="80" height="50" rx="6" class="fg sg"/><text x="550" y="77" text-anchor="middle">HPA</text><text x="550" y="93" text-anchor="middle" class="tm" font-size="11">CPU&gt;70%</text>
    <g stroke="currentColor" fill="none" marker-end="url(#dp-ar2)"><line x1="100" y1="80" x2="138" y2="80"/><line x1="250" y1="72" x2="308" y2="53"/><line x1="250" y1="80" x2="308" y2="91"/><line x1="250" y1="88" x2="308" y2="129"/><line x1="510" y1="80" x2="492" y2="80"/></g>
  </svg><figcaption>The Service spreads traffic over identical pods; the HPA adds or removes pods with load.</figcaption></figure>
  <table class="tbl">
    <tr><th>Object</th><th>What it is</th><th>Analogy</th></tr>
    <tr><td><strong>Pod</strong></td><td>Smallest unit: one or more containers sharing network</td><td>One chef at a station</td></tr>
    <tr><td><strong>Deployment</strong></td><td>Keeps N identical pods running; does rolling updates</td><td>Manager who keeps 3 chefs on shift</td></tr>
    <tr><td><strong>Service</strong></td><td>Stable name/IP that load-balances to healthy pods</td><td>The order counter</td></tr>
    <tr><td><strong>HPA</strong></td><td>Horizontal Pod Autoscaler: scales replicas on CPU/memory/custom metrics</td><td>Calls in more chefs at rush hour</td></tr>
  </table>
  <div class="fx" data-lang="text"># model-api.yaml  (minimal; not run here, no cluster)   kubectl apply -f model-api.yaml
apiVersion: apps/v1
kind: Deployment
metadata: {name: model-api}
spec:
  replicas: 3
  selector: {matchLabels: {app: model-api}}
  template:
    metadata: {labels: {app: model-api}}
    spec:
      containers:
      - name: api
        image: registry.example.com/model-api:1.4.2     # pinned tag, never :latest
        ports: [{containerPort: 8000}]
        resources:
          requests: {cpu: "500m", memory: "1Gi"}
          limits:   {cpu: "1",    memory: "2Gi"}
        readinessProbe: {httpGet: {path: /health, port: 8000}, initialDelaySeconds: 10}
---
apiVersion: v1
kind: Service
metadata: {name: model-api}
spec:
  selector: {app: model-api}
  ports: [{port: 80, targetPort: 8000}]
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: {name: model-api}
spec:
  scaleTargetRef: {apiVersion: apps/v1, kind: Deployment, name: model-api}
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource: {name: cpu, target: {type: Utilization, averageUtilization: 70}}</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>HPA on CPU needs <code>resources.requests</code>; utilisation is measured against them. Big models also need a readiness probe, or traffic hits pods still loading weights.</p>
  </div>

  <h2 id="dp-cicd"><span class="num">04</span>CI/CD for ML</h2>
  <div class="flow"><span>Push / PR</span><span>Code tests</span><span>Data tests</span><span>Train + model tests</span><span>Build image</span><span>Deploy to staging</span><span>Canary to prod</span></div>
  <table class="tbl">
    <tr><th>Test on</th><th>Examples</th><th>Tools</th></tr>
    <tr><td><strong>Code</strong></td><td>Feature functions on tiny fixtures; API returns 422 on bad input</td><td>pytest, ruff, mypy</td></tr>
    <tr><td><strong>Data</strong></td><td>Schema, no nulls in key cols, ranges, row counts, label balance</td><td>Great Expectations, Pandera</td></tr>
    <tr><td><strong>Model</strong></td><td>Beats baseline and current champion; per-slice metrics; latency; invariance (e.g. name change ≠ new prediction)</td><td>pytest + MLflow eval</td></tr>
    <tr><td><strong>Serving</strong></td><td>Container starts, <code>/health</code> ok, training/serving give same output</td><td>Docker, smoke tests</td></tr>
  </table>
  <div class="fx" data-lang="text"># .github/workflows/ml.yml  (example, not run here)
name: ml-ci
on:
  pull_request:
  push: {branches: [main]}
jobs:
  test-train:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - run: pip install -r requirements.txt
      - run: pytest tests/code                     # unit tests
      - run: dvc pull data/sample.csv              # versioned test data
      - run: pytest tests/data                     # schema / range checks
      - run: python train.py --data data/sample.csv --out model/
      - run: pytest tests/model                    # must beat baseline, latency budget
  deploy:
    needs: test-train
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t registry.example.com/model-api:&#36;{{ github.sha }} .
      - run: docker push registry.example.com/model-api:&#36;{{ github.sha }}
      - run: kubectl set image deployment/model-api api=registry.example.com/model-api:&#36;{{ github.sha }}</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Full training in CI is too slow. CI trains on a small sample to catch breakage; the full retrain runs in a pipeline (Airflow, Kubeflow, SageMaker Pipelines) that registers a candidate.</p>
  </div>

  <h2 id="dp-sm"><span class="num">05</span>AWS SageMaker</h2>
  <div class="cards">
    <div><b>Real-time endpoint</b><p>Always-on HTTPS endpoint on chosen instances; autoscaling.</p><small>Online, ms latency</small></div>
    <div><b>Serverless inference</b><p>Scales to zero; pay per request; cold starts.</p><small>Spiky, low traffic</small></div>
    <div><b>Async inference</b><p>Queue; payloads up to 1 GB, minutes to process.</p><small>Big inputs, video, long LLM jobs</small></div>
    <div><b>Batch Transform</b><p>Spins up, scores an S3 dataset, shuts down.</p><small>Offline, no endpoint</small></div>
  </div>
  <div class="flow"><span>model.tar.gz on S3</span><span>Model (image + artifact)</span><span>Endpoint config (instance type, count)</span><span>Endpoint</span></div>
  <div class="fx" data-lang="py"># SageMaker Python SDK (v2-style API) — not run here, needs an AWS account + IAM role
from sagemaker.sklearn.model import SKLearnModel

model = SKLearnModel(model_data="s3://my-bucket/models/cancer/model.tar.gz",
                     role="arn:aws:iam::123456789012:role/SageMakerRole",
                     entry_point="inference.py",          # model_fn / predict_fn
                     framework_version="1.2-1")

# Online: real-time endpoint
predictor = model.deploy(initial_instance_count=2, instance_type="ml.m5.large",
                         endpoint_name="cancer-clf-v2")

# Offline: Batch Transform over a whole S3 prefix
transformer = model.transformer(instance_count=4, instance_type="ml.m5.xlarge",
                                output_path="s3://my-bucket/predictions/")
transformer.transform("s3://my-bucket/to-score/", content_type="text/csv", split_type="Line")</div>
  <div class="fx" data-lang="py"># Calling an existing endpoint from any app (boto3) — not run here
import boto3
rt = boto3.client("sagemaker-runtime")
resp = rt.invoke_endpoint(EndpointName="cancer-clf-v2", ContentType="text/csv",
                          Body="17.99,10.38,122.8,...")   # 30 comma-separated features
print(resp["Body"].read().decode())</div>
  <p>Newer SDK releases restructure deployment around <code>ModelBuilder</code>; boto3 calls stay the same. Endpoints also support blue/green updates with canary or linear traffic shifting and auto-rollback on CloudWatch alarms.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A real-time endpoint bills every hour it exists, even with zero traffic. Delete test endpoints; use Batch Transform or serverless when you can.</p>
  </div>

  <h2 id="dp-roll"><span class="num">06</span>Blue-Green, Canary, Shadow</h2>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <text x="95" y="16" text-anchor="middle">Blue-green</text>
    <text x="300" y="16" text-anchor="middle">Canary</text>
    <text x="505" y="16" text-anchor="middle">Shadow</text>
    <rect x="20" y="30" width="150" height="34" rx="6" class="fb sb"/><text x="95" y="52" text-anchor="middle">blue v1: 100% → 0%</text>
    <rect x="20" y="80" width="150" height="34" rx="6" class="fg sg"/><text x="95" y="102" text-anchor="middle">green v2: 0% → 100%</text>
    <text x="95" y="140" text-anchor="middle" class="tm" font-size="11">flip the router at once;</text><text x="95" y="155" text-anchor="middle" class="tm" font-size="11">blue kept warm for rollback</text>
    <rect x="225" y="30" width="150" height="34" rx="6" class="fb sb"/><text x="300" y="52" text-anchor="middle">v1: 95%</text>
    <rect x="225" y="80" width="150" height="34" rx="6" class="fg sg"/><text x="300" y="102" text-anchor="middle">v2: 5% → 25 → 100</text>
    <text x="300" y="140" text-anchor="middle" class="tm" font-size="11">ramp up while metrics</text><text x="300" y="155" text-anchor="middle" class="tm" font-size="11">stay healthy</text>
    <rect x="430" y="30" width="150" height="34" rx="6" class="fb sb"/><text x="505" y="52" text-anchor="middle">v1: answers 100%</text>
    <rect x="430" y="80" width="150" height="34" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="505" y="102" text-anchor="middle">v2: sees copy, silent</text>
    <text x="505" y="140" text-anchor="middle" class="tm" font-size="11">v2 output logged only;</text><text x="505" y="155" text-anchor="middle" class="tm" font-size="11">users never see it</text>
    <line x1="200" y1="25" x2="200" y2="160" stroke="currentColor" stroke-opacity=".3"/><line x1="405" y1="25" x2="405" y2="160" stroke="currentColor" stroke-opacity=".3"/>
  </svg><figcaption>Blue-green swaps everyone at once; canary shifts gradually; shadow tests with zero user risk.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Blue-green</th><th>Canary</th><th>Shadow</th><th>A/B test</th></tr>
    <tr><td>Users exposed to v2</td><td>All, at once</td><td>A small, growing %</td><td>None</td><td>A fixed split (e.g. 50/50)</td></tr>
    <tr><td>Goal</td><td>Zero-downtime switch, instant rollback</td><td>Catch errors on little traffic</td><td>Compare outputs, latency on real traffic</td><td>Measure business impact</td></tr>
    <tr><td>Cost</td><td>2× infra briefly</td><td>Low</td><td>2× compute for scoring</td><td>Weeks of traffic</td></tr>
  </table>
  <div class="flow"><span>Shadow (is it sane?)</span><span>Canary (is it safe?)</span><span>A/B (is it better?)</span><span>Full rollout</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Canary is about safety, not proof of improvement: 5% for an hour can't measure a 1% conversion lift. That needs a proper A/B test, covered in <em>ML System Design → Shadow, Canary &amp; A/B Infrastructure</em>.</p>
  </div>

  <h2 id="dp-ver"><span class="num">07</span>Versioning &amp; Rollback</h2>
  <div class="flow"><span>Git SHA</span><span>Data version</span><span>Registry version 7</span><span>Image tag model-api:1.4.2</span><span>Endpoint / Deployment</span></div>
  <ul>
    <li><strong>Every prediction logs the model version</strong>, so a bad prediction can be traced to its model, code and data.</li>
    <li><strong>Pin everything:</strong> image tags (not <code>:latest</code>), registry versions or aliases, feature definitions.</li>
    <li><strong>Rollback is a pointer move:</strong> registry alias back to v6, <code>kubectl rollout undo deployment/model-api</code>, or the blue environment.</li>
    <li><strong>Keep the old version warm</strong> and its features computable; a rollback that needs a retrain is not a rollback.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A new model that needs a new feature breaks rollback if the old feature pipeline was deleted. Version feature pipelines with the model and keep both alive during rollout.</p>
  </div>
  <p>What to watch after rollout (drift, latency, error rate, business KPIs): see <em>ML System Design → Monitoring, Drift &amp; Retraining</em>.</p>

  <h2 id="dp-pack"><span class="num">08</span>Model Packaging</h2>
  <p><code>pickle</code> and <code>joblib</code> save any Python object. Loading one can run any code the file's author chose:</p>
  <div class="fx" data-lang="py">import pickle, os
class Evil:
    def __reduce__(self):                      # tells pickle how to "rebuild" the object
        return (os.system, ("echo PWNED: this ran during pickle.load",))
open("model.pkl", "wb").write(pickle.dumps(Evil()))
pickle.load(open("model.pkl", "rb"))           # just loading runs the command</div>
  <div class="fx" data-lang="text">PWNED: this ran during pickle.load</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never unpickle a model from an untrusted source (random Hub repo, user upload). Pickles also break across library versions: a model pickled with sklearn 1.3 may fail or silently differ on 1.6.</p>
  </div>
  <p><strong>ONNX</strong> (Open Neural Network Exchange) stores the model as a graph of standard math ops, not Python objects. Any ONNX runtime can execute it.</p>
  <div class="fx" data-lang="py">from skl2onnx import to_onnx
import onnxruntime as ort

pipe = make_pipeline(StandardScaler(), LogisticRegression()).fit(X, y)   # X float32
onx = to_onnx(pipe, X[:1])                      # trace with a sample input
open("model.onnx", "wb").write(onx.SerializeToString())

sess = ort.InferenceSession("model.onnx")       # sklearn not needed here
inp = sess.get_inputs()[0].name
print("inputs:", [(i.name, i.shape) for i in sess.get_inputs()])
print("sklearn:", pipe.predict(X[:5]))
print("onnx:   ", sess.run(None, {inp: X[:5]})[0])
print("all 569 agree:", (sess.run(None, {inp: X})[0] == pipe.predict(X)).all())</div>
  <div class="fx" data-lang="text">inputs: [('X', [None, 30])]
sklearn: [0 0 0 0 0]
onnx:    [0 0 0 0 0]
all 569 agree: True</div>
  <table class="tbl">
    <tr><th>Format</th><th>Safe to load?</th><th>Portable?</th><th>Use for</th></tr>
    <tr><td>pickle / joblib</td><td>No: runs code</td><td>Same Python + library versions only</td><td>Quick internal work, trusted sources</td></tr>
    <tr><td>skops</td><td>Yes, with an allow-list of types</td><td>sklearn only</td><td>sklearn models (MLflow 3 default)</td></tr>
    <tr><td>safetensors</td><td>Yes: weights only</td><td>PyTorch, JAX, TF</td><td>Neural-network weights, LLMs</td></tr>
    <tr><td>ONNX</td><td>Yes: graph, no code</td><td>Any language, CPU/GPU/edge</td><td>Fast, framework-free serving</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Always check that the converted model matches the original on a real batch, as above. Custom transformers or unusual ops may not convert, or may convert with small numeric differences.</p>
  </div>

  <h2 id="dp-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Batch or online inference for a weekly "customers likely to churn" email?</summary><div class="qa-body">Batch. Predictions are needed once a week for a known customer list, so a scheduled job writes scores to a table. It's cheaper (no always-on servers), easy to rerun and debug. Online adds latency budgets and infra for no benefit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When must you use online inference instead of precomputing?</summary><div class="qa-body">When the input only exists at request time or the key space is too large to precompute: a search query, a cart at checkout, a transaction to approve. A hybrid is common: precompute heavy features or candidates in batch, then score online.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What tests belong in an ML CI pipeline that normal software doesn't have?</summary><div class="qa-body">Data tests (schema, nulls, ranges, distribution vs reference), model tests (beats baseline and current champion overall and on key slices, latency/size budget, invariance and directional tests), and training/serving consistency (same input → same output in both paths).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Canary vs shadow deployment: which first, and why?</summary><div class="qa-body">Shadow first: v2 scores a copy of real traffic with zero user impact, so you catch crashes, latency issues and odd outputs safely. Then canary: a small % of users actually get v2 while you watch error rates and metrics. Then A/B or full rollout.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>SageMaker real-time endpoint vs Batch Transform?</summary><div class="qa-body">Endpoint: always-on HTTPS service for per-request, low-latency predictions; billed per instance-hour. Batch Transform: a job that starts instances, scores a dataset in S3, writes results to S3 and shuts down; no endpoint, billed only while running. Serverless and async endpoints sit in between.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is loading a pickled model from the internet dangerous?</summary><div class="qa-body">Unpickling can call any function the file specifies via <code>__reduce__</code>, e.g. <code>os.system</code>. Our 5-line demo ran a shell command on <code>pickle.load</code>. Use safe formats (ONNX, safetensors, skops with an allow-list) or load only from trusted, signed sources.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ONNX buy you, and what can go wrong?</summary><div class="qa-body">A framework-free, code-free graph: fast runtimes (ONNX Runtime, TensorRT), any language, edge devices, no sklearn/PyTorch in the serving image, no pickle risk. Risks: unsupported custom ops or transformers, small numeric differences, dtype quirks (float32). Always verify outputs against the original model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The new model is live and conversions dropped 8%. Walk through the rollback.</summary><div class="qa-body">Move traffic back first, investigate second: flip to blue / set the canary weight to 0 / move the registry alias back / <code>kubectl rollout undo</code>. Confirm metrics recover. Then use per-prediction model-version logs to compare v1 vs v2 outputs, check for feature skew or a data issue, and fix before trying again.</div></details>
</main>`
});
