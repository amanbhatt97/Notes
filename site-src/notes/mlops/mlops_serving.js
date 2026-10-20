// notes/mlops/mlops_serving.js — Model Serving & Inference
Object.assign(TOPIC_CONTENT, {
  "mlops_serving": `<main>
  <h1>Model Serving &amp; Inference</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Shipping Models</span><span>Model Serving &amp; Inference</span></div>
  <p class="lead">Serving means turning a model file into answers for real users: deciding <em>when</em> predictions are made (in a nightly batch, on each request, or on a stream of events), writing the server that answers (FastAPI with a lifespan, health and readiness checks, and input validation), packaging the model safely, making it fast (ONNX, quantisation) and replacing it without risk (shadow, canary). Everything uses Biteful's champion model (gradient boosting, test MAE 2.347) and the Monday orders. The batch job, the server (run with uvicorn and queried with curl), the pickle demo, ONNX export with timings, quantisation, shadow and canary code were all really run; BentoML, KServe, Seldon and the Kafka consumer are shown as configuration and labelled not run.</p>

  <h2 id="sv-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="sv-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="30" text-anchor="middle" font-size="12">Shipping: the map</text><text x="85" y="46" text-anchor="middle" class="tm" font-size="10">four steps to users</text>
<rect x="180" y="10" width="140" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="250" y="30" text-anchor="middle" font-size="12">1 · CI/CD</text><text x="250" y="46" text-anchor="middle" class="tm" font-size="10">tested image</text>
<rect x="340" y="10" width="140" height="46" rx="7" class="fg sg" stroke-width="2.5"/><text x="410" y="30" text-anchor="middle" font-size="12" font-weight="700">2 · Serving</text><text x="410" y="46" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<rect x="500" y="10" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="575" y="30" text-anchor="middle" font-size="12">3 · K8s · 4 · Cloud</text><text x="575" y="46" text-anchor="middle" class="tm" font-size="10">many copies, anywhere</text>
<line x1="160" y1="33" x2="178" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sv-a0)"/><line x1="320" y1="33" x2="338" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sv-a0)"/><line x1="480" y1="33" x2="498" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sv-a0)"/>
<text x="330" y="90" text-anchor="middle" class="tm" font-size="10.5">in: image biteful-eta:&lt;sha&gt; with app.py + model.joblib (v2)</text>
<text x="330" y="110" text-anchor="middle" class="tm" font-size="10.5">out: /predict answering 56.1 min for order 2, with /health, /ready, a safe and fast model file, a rollout plan</text>
</svg><figcaption>The second shipping note: what runs inside the container, and how a new model reaches users safely.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="mlops_cicd">CI/CD for ML</a></b><span>The pipeline tests the model, gates it against the champion and builds an image with <code>app.py</code> inside. Left open: why the server is written the way it is, whether ETAs should be computed per request at all, and how to make the model safe, small and fast. <a class="xref" data-note="api_fastapi">FastAPI</a> and <a class="xref" data-note="api_production">Production Backend</a> taught routes, Pydantic, uvicorn and health checks for ordinary APIs.</span></li>
    <li><b>This note adds: the inference side</b><span>Batch vs real-time vs streaming, a FastAPI model server (lifespan, liveness, readiness, validation), safe model formats, serving frameworks (BentoML, KServe, Seldon, Triton), ONNX export and speed, quantisation, shadow and canary releases.</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="mlops_k8s">Kubernetes for ML</a> runs many copies of this server and uses its <code>/health</code> and <code>/ready</code>; canaries become replica or traffic splits there. Feature freshness for online serving is in <a class="xref" data-note="sd_serving">Feature Stores &amp; Online/Offline Serving</a>; LLM-specific serving (batching, KV cache, vLLM) in <a class="xref" data-note="llm_prod">LLMOps &amp; Production</a>.</span></li>
  </ol>

  <h2 id="sv-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>Running example: Biteful's registry champion (300 boosted trees, test MAE 2.347), the old forest (2.654), 550 test orders, and Monday order 2: 5.5 km, 3 items, raining, Biryani House, really 55 minutes.</p>
  <ol class="story">
    <li><b>Batch vs real-time vs streaming</b><span>Q: when must the ETA exist? → Pre-booked orders can be scored tonight in one batch (1,000 rows in 37.5 ms); a new order needs an answer in milliseconds; rider GPS events need a stream. Real-time needs a server…</span></li>
    <li><b>The FastAPI model server</b><span>Q: how does a request become an ETA safely? → Pydantic rejects 120 km (HTTP 422); the lifespan loads the model once; <code>/health</code> says "alive", <code>/ready</code> says "can answer" (503 before load, 200 after). But the model file it loads is a pickle…</span></li>
    <li><b>Packaging safely</b><span>Q: is loading a model file safe? → A pickle ran a shell command on load. Use skops, safetensors or ONNX. Writing all of this per model is repetitive: are there frameworks?</span></li>
    <li><b>Serving frameworks</b><span>Q: do we hand-write every server? → BentoML packages, KServe and Seldon serve on Kubernetes, Triton for GPUs. Many keep a portable model format at their core…</span></li>
    <li><b>ONNX</b><span>Q: can we serve without scikit-learn and faster? → Export to ONNX: identical to 0.00001 min, a single order 0.008 ms vs 0.872 ms, but no faster for a 550-row batch. Bigger models also need to be smaller…</span></li>
    <li><b>Quantisation</b><span>Q: can we shrink weights without losing accuracy? → float32 → int8: an MLP went 266 KB → 71 KB, MAE 2.360 → 2.356. A new model is ready: how do we switch without risking every user?</span></li>
    <li><b>Shadow &amp; canary</b><span>Q: how do we release safely? → Shadow: v2 scores copies (mean gap 1.05 min, 2 of 550 differ by more than 5). Canary: 5% of customers, fixed per customer by hashing. Then Kubernetes does it at scale.</span></li>
  </ol>

  <h2 id="sv-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Model Serving &amp; Inference</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">When to predict</div>
        <ul>
          <li><b>Batch</b> — scheduled job, whole table; 1,000 rows 37.5 ms in one call</li>
          <li><b>Real-time</b> — API per request, ms; inputs known only now</li>
          <li><b>Streaming</b> — consumer on Kafka, seconds; rider GPS events</li>
          <li><b>Hybrid</b> — precompute in batch, adjust online</li>
          <li>💡 newspaper vs phone call vs live ticker</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">FastAPI server</div>
        <ul>
          <li><b>Pydantic</b> — bad input → 422 before the model</li>
          <li><b>Lifespan</b> — load once at startup, release at shutdown</li>
          <li><b>/health</b> = liveness; <b>/ready</b> = readiness (503 → 200)</li>
          <li><b>Version in response</b> — trace every ETA</li>
          <li>⚠ loading per request, blocking work in <code>async def</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Packaging</div>
        <ul>
          <li><b>pickle/joblib</b> — <code>__reduce__</code> runs code on load</li>
          <li><b>skops</b> — sklearn with type allow-list</li>
          <li><b>safetensors</b> — weights only (neural nets)</li>
          <li><b>ONNX</b> — op graph, any runtime</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Frameworks</div>
        <ul>
          <li><b>BentoML</b> — Python service → "bento" → image</li>
          <li><b>KServe</b> — <code>InferenceService</code> on K8s, scale to zero</li>
          <li><b>Seldon Core</b> — graphs, A/B, explainers on K8s</li>
          <li><b>Triton</b> — GPU, many formats, dynamic batching</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Speed &amp; size</div>
        <ul>
          <li><b>ONNX</b> — same answers (0.00001 min); 1 order 0.008 vs 0.872 ms</li>
          <li><b>Batching</b> — per-call overhead dominates single rows</li>
          <li><b>Quantisation</b> — int8 = round(w / scale); 266 → 71 KB, MAE ≈ same</li>
          <li>⚠ always verify outputs after converting</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Releasing</div>
        <ul>
          <li><b>Shadow</b> — copy of traffic, answers logged only</li>
          <li><b>Canary</b> — 5% → 25% → 100%, sticky by hashing the customer id</li>
          <li><b>A/B</b> — fixed split, weeks, statistics, business metric</li>
          <li><b>Order</b> — shadow (sane?) → canary (safe?) → A/B (better?)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sv-modes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Batch vs Real-time vs Streaming</span><span class="rm-sub">When must the answer exist?</span></div></div>
      <div class="rm-item rm-done" data-target="sv-api"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The FastAPI Model Server</span><span class="rm-sub">Lifespan, health, readiness</span></div></div>
      <div class="rm-item rm-done" data-target="sv-pack"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Packaging Models Safely</span><span class="rm-sub">Pickle risk and safe formats</span></div></div>
      <div class="rm-item rm-done" data-target="sv-frameworks"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">BentoML, KServe, Seldon, Triton</span><span class="rm-sub">Serving frameworks</span></div></div>
      <div class="rm-item rm-done" data-target="sv-onnx"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">ONNX Export &amp; Speed</span><span class="rm-sub">Framework-free inference</span></div></div>
      <div class="rm-item rm-done" data-target="sv-quant"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Quantisation</span><span class="rm-sub">Smaller numbers, smaller model</span></div></div>
      <div class="rm-item rm-done" data-target="sv-rollout"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Shadow &amp; Canary</span><span class="rm-sub">Releasing without fear</span></div></div>
      <div class="rm-item rm-done" data-target="sv-connect"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="sv-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Slow, unsafe, unready</span></div></div>
      <div class="rm-item rm-done" data-target="sv-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="sv-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sv-modes"><span class="num">01</span>Batch vs Real-time vs Streaming</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The champion predicts minutes. Biteful has three products that want ETAs: the "schedule for tomorrow" feature, the checkout page, and the live tracking screen that updates as the rider moves. Do all three need a server answering in milliseconds?</p>
  </div>
  <p>Asking a model for an answer is called <strong>inference</strong>. The first serving question is <em>when</em> the answer must exist:</p>
  <ul>
    <li><strong>Batch</strong>: a scheduled job scores a whole table at once and stores the results; the app reads them later. Biteful: tomorrow's pre-booked orders, scored tonight.</li>
    <li><strong>Real-time</strong> (online): the model sits behind an <strong>API</strong> and answers one request at a time, in milliseconds. Biteful: the ETA shown at checkout, because the order did not exist a second ago.</li>
    <li><strong>Streaming</strong>: events (rider GPS pings, kitchen "food ready" signals) flow through a message system like <a class="xref" data-note="de_kafka">Kafka</a>; a consumer re-scores each event as it arrives, within seconds. Biteful: the live tracking ETA.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Batch is the newspaper: printed at night, read in the morning. Real-time is a phone call: you ask, you get an answer now. Streaming is a live cricket ticker: every ball is processed as it happens.</p>
  </div>
  <p>The batch job, for real: 1,000 pre-booked orders for tomorrow's lunch (forecast dry), scored in one call, then the same work one row at a time for comparison.</p>
  <div class="fx" data-lang="py"># batch_score.py — tonight's job: ETAs for tomorrow's 1,000 scheduled (pre-booked) lunch orders
import time
import joblib, numpy as np, pandas as pd
from features import build_features

rng = np.random.default_rng(3)
n = 1000
tomorrow = pd.DataFrame({"order_id": np.arange(50001, 50001 + n),
                         "distance_km": rng.uniform(0.5, 8.0, n).round(1),
                         "items": rng.integers(1, 7, n), "rain": 0,          # forecast: dry
                         "restaurant": rng.choice(["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"], n)})
model = joblib.load("model/model.joblib")                  # loaded once for the whole batch

t0 = time.perf_counter()
tomorrow["eta_minutes"] = model.predict(build_features(tomorrow)).round(1)   # ONE call, 1,000 rows
batch_s = time.perf_counter() - t0

t0 = time.perf_counter()
for i in range(100):                                        # the same work, one row at a time
    model.predict(build_features(tomorrow.iloc[[i]]))
loop_s = (time.perf_counter() - t0) / 100 * n               # scaled to 1,000 rows

tomorrow.to_csv("eta_tomorrow.csv", index=False)
print(tomorrow.head(3).to_string(index=False))
print(f"batch: {batch_s * 1000:.1f} ms for {n} rows | one-by-one: ~{loop_s * 1000:.0f} ms for {n} rows")</div>
  <div class="fx" data-lang="text"> order_id  distance_km  items  rain  restaurant  eta_minutes
    50001          1.1      5     0 Dosa Corner         24.8
    50002          2.3      2     0 Pizza Point         27.2
    50003          6.5      5     0 Dosa Corner         42.8
batch: 37.5 ms for 1000 rows | one-by-one: ~4518 ms for 1000 rows</div>
  <p>By hand: one-by-one took about 4.5 ms per order (the model is called 1,000 times and each call has fixed overhead: building a DataFrame, checking inputs, walking 300 trees for just one row). One call for all 1,000 rows took 37.5 ms in total, about 0.04 ms per order, roughly 120 times cheaper. Batch is cheap because the overhead is paid once. Real-time can't do this: each request arrives alone.</p>
  <h3>Streaming, as a sketch (not run here: needs a Kafka broker)</h3>
  <div class="fx" data-lang="py"># stream_eta.py — re-score the ETA whenever a rider's GPS ping arrives (sketch, not run)
from kafka import KafkaConsumer, KafkaProducer
import joblib, json, pandas as pd
from features import build_features

model = joblib.load("model/model.joblib")
pings = KafkaConsumer("rider-pings", group_id="eta-updater", value_deserializer=json.loads)
out = KafkaProducer(value_serializer=lambda v: json.dumps(v).encode())
for msg in pings:                                   # one event at a time, forever
    p = msg.value                                   # {"order_id", "distance_km" left, "items", "rain", "restaurant"}
    eta = float(model.predict(build_features(pd.DataFrame([p])))[0])
    out.send("eta-updates", {"order_id": p["order_id"], "eta_minutes": round(eta, 1)})</div>
  <table class="tbl">
    <tr><th></th><th>Batch</th><th>Real-time</th><th>Streaming</th></tr>
    <tr><td>Latency</td><td>Hours (ready before needed)</td><td>Milliseconds</td><td>Seconds</td></tr>
    <tr><td>Input</td><td>Whole table</td><td>One request</td><td>Continuous events</td></tr>
    <tr><td>Fresh features?</td><td>As of the last run</td><td>Yes, at request time</td><td>Yes, rolling windows</td></tr>
    <tr><td>Cost</td><td>Low: machines run, then stop</td><td>Always-on servers</td><td>Always-on consumers + broker</td></tr>
    <tr><td>Biteful</td><td>Tomorrow's pre-booked orders</td><td>Checkout ETA</td><td>Live tracking ETA</td></tr>
    <tr><td>Tools</td><td>Spark, Airflow, SageMaker Batch Transform</td><td>FastAPI, BentoML, KServe, Triton</td><td>Kafka + Flink / Spark Streaming</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Batch inference</strong> scores many stored rows on a schedule and saves results. <strong>Real-time (online) inference</strong> answers individual requests synchronously within a latency budget. <strong>Streaming inference</strong> scores events continuously as they arrive on a stream. A <strong>hybrid</strong> precomputes heavy parts in batch and finishes online.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Building a real-time API for something the business only needs once a day. Batch is cheaper, simpler to debug and easy to rerun. Go online only when the input doesn't exist until the request arrives.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The FastAPI Model Server.</b> Checkout needs real-time ETAs. What does a server that answers one order in milliseconds, refuses bad orders, and tells the platform when it is ready, actually look like?</div>

  <h2 id="sv-api"><span class="num">02</span>The FastAPI Model Server: Lifespan, Health, Readiness</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The app sends <code>{"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}</code>. What must happen before the model sees it, when should the model be loaded, and how does the platform know this copy of the server can take traffic?</p>
  </div>
  <p>This is the <code>app.py</code> the CI pipeline packed into the image. Every part answers one of those questions.</p>
  <div class="fx" data-lang="py"># app.py — the Biteful ETA server (explained line by line in the Model Serving note)
import os, time
from contextlib import asynccontextmanager
from typing import Literal

import joblib, pandas as pd
from fastapi import FastAPI, Response
from pydantic import BaseModel, Field
from features import build_features

MODEL_PATH = os.environ.get("MODEL_PATH", "model/model.joblib")
MODEL_VERSION = os.environ.get("MODEL_VERSION", "dev")
state = {}

class Order(BaseModel):
    distance_km: float = Field(gt=0, le=30)
    items: int = Field(ge=1, le=50)
    rain: Literal[0, 1]
    restaurant: Literal["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    t0 = time.perf_counter()
    state["model"] = joblib.load(MODEL_PATH)        # startup: load ONCE, before any request
    state["load_seconds"] = round(time.perf_counter() - t0, 3)
    yield                                           # the server runs here
    state.clear()                                   # shutdown: release the model

app = FastAPI(title="Biteful ETA", lifespan=lifespan)

@app.get("/health")                                 # liveness: is the process alive?
def health():
    return {"status": "ok"}

@app.get("/ready")                                  # readiness: can it answer right now?
def ready(response: Response):
    if "model" not in state:
        response.status_code = 503
        return {"ready": False}
    return {"ready": True, "model_version": MODEL_VERSION, "load_seconds": state["load_seconds"]}

@app.post("/predict")
def predict(order: Order):
    X = build_features(pd.DataFrame([order.model_dump()]))
    return {"eta_minutes": round(float(state["model"].predict(X)[0]), 1), "model_version": MODEL_VERSION}</div>
  <ul>
    <li><strong>Validation</strong>: <code>Order</code> is the Pydantic schema from the lifecycle note. FastAPI checks every request body against it <em>before</em> <code>predict</code> runs; a bad body gets HTTP <strong>422</strong> with the reasons.</li>
    <li><strong>Lifespan</strong>: the function decorated with <code>@asynccontextmanager</code> runs once. Code before <code>yield</code> runs at <strong>startup</strong> (load the model, time it); code after runs at <strong>shutdown</strong>. Loading once matters: loading per request would add the load time to every ETA.</li>
    <li><strong><code>/health</code></strong> (liveness): "the process is alive". If it stops answering, the platform restarts the container.</li>
    <li><strong><code>/ready</code></strong> (readiness): "I can answer right now". It returns 503 until the model is in memory. The platform sends traffic only to ready copies.</li>
    <li><strong>Version in every answer</strong>: <code>model_version</code> comes from an environment variable set at deploy time, so any ETA in a log can be traced to its model.</li>
    <li><strong>One shared feature function</strong>: <code>build_features</code> is imported, never copied: the training/serving skew lesson from the lifecycle note.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant opening for the day. The door being unlocked is liveness. The kitchen having the tandoor hot is readiness: you don't seat customers until it is. The menu card that refuses "one pizza from the dosa counter" is validation.</p>
  </div>
  <p>Lifespan and readiness, proven with FastAPI's <code>TestClient</code>: created without <code>with</code>, the lifespan has not run; entering <code>with</code> runs the startup. Then 200 requests measure in-process latency:</p>
  <div class="fx" data-lang="py">from fastapi.testclient import TestClient
from app import app

client = TestClient(app)                     # NOT entered with "with": lifespan has not run
print("before startup:", client.get("/ready").status_code, client.get("/ready").json())
with TestClient(app) as client:              # entering runs the lifespan startup (model load)
    print("after startup :", client.get("/ready").status_code, client.get("/ready").json())
    body = {"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}
    times = []
    for _ in range(200):
        t0 = time.perf_counter(); client.post("/predict", json=body); times.append(time.perf_counter() - t0)
    times.sort()
    print(f"in-process latency over 200 calls: p50 {times[100] * 1000:.2f} ms, p95 {times[190] * 1000:.2f} ms")</div>
  <div class="fx" data-lang="text">before startup: 503 {'ready': False}
after startup : 200 {'ready': True, 'model_version': 'dev', 'load_seconds': 0.02}
in-process latency over 200 calls: p50 5.75 ms, p95 7.61 ms</div>
  <p>Before startup: 503, not ready. After: 200, model loaded in 0.02 s (warm disk cache), and a median request (p50) takes 5.75 ms through validation, feature building and prediction; 95% finish within 7.61 ms (p95). Now the real server with <code>uvicorn</code>, queried with <code>curl</code>, then stopped:</p>
  <div class="fx" data-lang="text">$ MODEL_VERSION=2 uvicorn app:app --port 18000 &gt; server.log 2&gt;&amp;1 &amp;
$ sleep 4
$ curl -s localhost:18000/health; echo
{"status":"ok"}
$ curl -s localhost:18000/ready; echo
{"ready":true,"model_version":"2","load_seconds":0.821}
$ curl -s -X POST localhost:18000/predict -H "Content-Type: application/json" -d '{"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}'; echo
{"eta_minutes":56.1,"model_version":"2"}
$ curl -s -w "\\nHTTP %{http_code}\\n" -X POST localhost:18000/predict -H "Content-Type: application/json" -d '{"distance_km": 120, "items": 3, "rain": 2, "restaurant": "Momo Hut"}' | cut -c1-160
{"detail":[{"type":"less_than_equal","loc":["body","distance_km"],"msg":"Input should be less than or equal to 30","input":120,"ctx":{"le":30.0}},{"type":"liter
HTTP 422
$ kill $!
$ sleep 1
$ cat server.log
INFO:     Started server process [32285]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:18000 (Press CTRL+C to quit)
INFO:     127.0.0.1:47718 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:47732 - "GET /ready HTTP/1.1" 200 OK
INFO:     127.0.0.1:47742 - "POST /predict HTTP/1.1" 200 OK
INFO:     127.0.0.1:47752 - "POST /predict HTTP/1.1" 422 Unprocessable Content
INFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
INFO:     Finished server process [32285]</div>
  <p>The live server gives 56.1 minutes for order 2 (real: 55), tagged <code>model_version: 2</code>. The bad order (120 km, rain = 2, "Momo Hut") is rejected with HTTP 422, listing each problem; the model never saw it. The server log shows the lifespan at work: "Waiting for application startup" → "Application startup complete" before the first request, and "Waiting for application shutdown" → "Application shutdown complete" after <code>kill</code>.</p>
  <table class="tbl">
    <tr><th>Endpoint</th><th>Question</th><th>Used by</th><th>Biteful answer</th></tr>
    <tr><td><code>/health</code></td><td>Is the process alive?</td><td>liveness probe → restart if failing</td><td><code>{"status":"ok"}</code></td></tr>
    <tr><td><code>/ready</code></td><td>Can it serve right now?</td><td>readiness probe, load balancer, Docker HEALTHCHECK</td><td>503 before load, 200 after</td></tr>
    <tr><td><code>/predict</code></td><td>What is the ETA?</td><td>the app</td><td><code>{"eta_minutes":56.1,"model_version":"2"}</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>lifespan</strong> handler is code that runs once when the server starts (before accepting requests) and once when it stops. A <strong>liveness</strong> check reports whether the process should be restarted; a <strong>readiness</strong> check reports whether it should receive traffic. <strong>p50/p95 latency</strong> are the times within which 50% / 95% of requests finish.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Making <code>/health</code> check the model. If liveness fails while a big model is still loading, the platform kills the container, it restarts, starts loading again, and never becomes ready. Liveness should be trivial; readiness carries the "model loaded" check. And a CPU-heavy <code>predict</code> written as <code>async def</code> blocks the event loop for every other request; plain <code>def</code> runs it in a thread pool.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Packaging Models Safely.</b> The lifespan calls <code>joblib.load</code> on a model file. joblib is pickle underneath. What exactly happens when a pickle file is loaded, and is that safe?</div>

  <h2 id="sv-pack"><span class="num">03</span>Packaging Models Safely</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A partner sends "a better ETA model" as a <code>.pkl</code> file. The server would <code>joblib.load</code> it at startup. What could that file do?</p>
  </div>
  <p>A pickle file is not just data. It is a list of instructions for rebuilding an object, and one allowed instruction is "call this function". So whoever wrote the file decides what runs on your server when you load it. Five lines prove it:</p>
  <div class="fx" data-lang="py"># pickle_demo.py
import pickle, os
class Evil:
    def __reduce__(self):                      # tells pickle how to "rebuild" the object
        return (os.system, ("echo PWNED: this ran during pickle.load",))
open("eta_model_from_internet.pkl", "wb").write(pickle.dumps(Evil()))
pickle.load(open("eta_model_from_internet.pkl", "rb"))   # just LOADING runs the command</div>
  <div class="fx" data-lang="text">$ python pickle_demo.py
PWNED: this ran during pickle.load</div>
  <p><code>__reduce__</code> is the hook pickle calls to learn how to rebuild an object. Here it says "rebuild me by running <code>os.system(...)</code>", a shell command, and loading the file ran it. Replace the echo with "send the database password to this address" and you see the danger. MLflow 3 switched scikit-learn models to <strong>skops</strong> for this reason (MLflow note).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A pickle file is a parcel with a note inside: "to open, follow these steps". A safe format is a parcel that is only contents: you open it your own way, and nothing in it can give orders.</p>
  </div>
  <table class="tbl">
    <tr><th>Format</th><th>Safe to load?</th><th>Portable?</th><th>Use for</th></tr>
    <tr><td>pickle / joblib</td><td>No: can run code</td><td>Same Python + library versions only</td><td>Your own trusted models, internal use</td></tr>
    <tr><td>skops</td><td>Yes, with a type allow-list</td><td>scikit-learn</td><td>sklearn models (MLflow 3 default)</td></tr>
    <tr><td>safetensors</td><td>Yes: weights only</td><td>PyTorch, JAX, TF</td><td>Neural-network weights, LLMs</td></tr>
    <tr><td>ONNX</td><td>Yes: a graph of operations, no code</td><td>Any language, CPU/GPU/edge</td><td>Fast, framework-free serving (section 05)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Model serialization</strong> turns a trained model into a file. <strong>Unsafe</strong> formats (pickle) can execute code during loading; <strong>safe</strong> formats store only data (weights, op graphs) or restrict loadable types (skops).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never unpickle a model from an untrusted source (a random hub repo, a user upload, an email). Pickles also break across library versions: a model pickled with scikit-learn 1.9 may fail or silently differ on 1.5.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Serving Frameworks.</b> Validation, lifespan, probes, safe formats, versioning: every model team writes the same server again. Do frameworks do this for us?</div>

  <h2 id="sv-frameworks"><span class="num">04</span>Serving Frameworks: BentoML, KServe, Seldon, Triton</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful will soon have ten models (ETA, fraud, search ranking). Should each team hand-write a FastAPI server, Dockerfile and probes, or use a framework that standardises them?</p>
  </div>
  <p>Serving frameworks take a model and give you the server, packaging, scaling and often batching. They are concepts here (not run: KServe and Seldon need a Kubernetes cluster; BentoML was not installed to save disk).</p>
  <div class="cards">
    <div><b>BentoML</b><p>Write a Python service class; <code>bentoml build</code> packs code, model and dependencies into a "bento"; <code>bentoml containerize</code> makes the image. Adaptive batching built in.</p><small>Python teams, any cloud</small></div>
    <div><b>KServe</b><p>Kubernetes custom resource <code>InferenceService</code>: give it a model URI and a format; it runs the server, autoscaling (even to zero), canary traffic split.</p><small>Kubernetes, many models</small></div>
    <div><b>Seldon Core</b><p>Kubernetes deployments of models and inference graphs (pre-processing → model → post-processing), A/B and shadow routing, explainers and drift detectors.</p><small>Kubernetes, complex graphs</small></div>
    <div><b>NVIDIA Triton</b><p>High-performance server for ONNX, TensorRT, PyTorch, TensorFlow models; dynamic batching and multiple models per GPU.</p><small>GPUs, high throughput</small></div>
  </div>
  <p>What Biteful's ETA model would look like as a KServe <code>InferenceService</code> (shown, not run; the Kubernetes note validates manifests like this):</p>
  <div class="fx" data-lang="text"># eta-inferenceservice.yaml — KServe (not run here: needs a cluster with KServe installed)
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: biteful-eta
spec:
  predictor:
    minReplicas: 2
    canaryTrafficPercent: 10           # 10% of requests go to the newest revision
    model:
      modelFormat: {name: sklearn}
      storageUri: s3://biteful-ml-artifacts/eta/v2/   # the model folder, not a pickle sent by email</div>
  <p>And the same model as a BentoML service (shown, not run):</p>
  <div class="fx" data-lang="py"># service.py — BentoML (not run here)
import bentoml, pandas as pd
from features import build_features

@bentoml.service(resources={"cpu": "1"}, traffic={"timeout": 2})
class BitefulETA:
    model = bentoml.models.get("biteful-eta:latest")          # from BentoML's model store

    def __init__(self):
        self.m = bentoml.sklearn.load_model(self.model)          # loaded once, like our lifespan

    @bentoml.api(batchable=True)                                 # adaptive batching of concurrent requests
    def predict(self, orders: pd.DataFrame) -&gt; list[float]:
        return self.m.predict(build_features(orders)).round(1).tolist()</div>
  <table class="tbl">
    <tr><th>Choose</th><th>When</th></tr>
    <tr><td>Own FastAPI server (this note)</td><td>One or a few models; custom logic; full control; learning how serving works</td></tr>
    <tr><td>BentoML</td><td>Python teams that want packaging, batching and images without Kubernetes expertise</td></tr>
    <tr><td>KServe / Seldon</td><td>Many models on Kubernetes; standard rollouts, autoscaling, scale-to-zero</td></tr>
    <tr><td>Triton</td><td>GPU models where throughput and batching dominate</td></tr>
    <tr><td>Managed endpoints (cloud note)</td><td>No platform team; pay the cloud to run it</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>model serving framework</strong> turns a saved model into a production inference service with standard APIs, packaging, scaling and observability. <strong>Adaptive (dynamic) batching</strong> groups requests that arrive close together into one model call, trading a few milliseconds of waiting for much higher throughput.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Adopting KServe or Seldon before having Kubernetes skills and more than a handful of models. The framework adds a control plane to operate. Start with a plain server; move when the repetition hurts.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ONNX Export &amp; Speed.</b> Every option above still needs a model format the server can run. Can we drop scikit-learn from the server entirely, and is that faster?</div>

  <h2 id="sv-onnx"><span class="num">05</span>ONNX Export &amp; Speed</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The serving image carries scikit-learn, SciPy and pandas (most of its 676 MB) just to walk 300 trees. Can the model be saved as pure maths that a small, fast runtime executes, without changing a single ETA?</p>
  </div>
  <p><strong>ONNX</strong> (Open Neural Network Exchange) saves a model as a graph of standard operations ("compare feature 0 with 3.45, go left, add 0.12…") rather than Python objects. <strong>ONNX Runtime</strong> executes that graph, from Python, C++, Java, C#, JavaScript, on CPU, GPU or phones. <code>skl2onnx</code> converts scikit-learn models; PyTorch exports with <code>torch.onnx.export</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sheet music. A pianist's playing (the Python model) only exists when that pianist is in the room. Written as standard notation (ONNX), any trained musician (runtime) on any instrument (CPU, GPU, phone) can play exactly the same tune.</p>
  </div>
  <div class="fx" data-lang="py">import os
from skl2onnx import to_onnx
import onnxruntime as ort

gbr = joblib.load("model/model.joblib")                     # registry v2: 300 boosted trees
test = pd.read_csv("data/test.csv")
X_df = build_features(test)                                  # sklearn gets the DataFrame it was trained on
X_test = X_df.to_numpy(dtype=np.float32)                     # ONNX works on plain float32 arrays

onx = to_onnx(gbr, X_test[:1])                               # trace the model with one sample row
open("model/model.onnx", "wb").write(onx.SerializeToString())
sess = ort.InferenceSession("model/model.onnx")
name = sess.get_inputs()[0].name
print("input:", name, sess.get_inputs()[0].shape, "| file:", os.path.getsize("model/model.onnx") // 1024, "KB")

p_skl = gbr.predict(X_df)
p_onnx = sess.run(None, {name: X_test})[0].ravel()
print("max |sklearn - onnx| over 550 orders:", f"{np.abs(p_skl - p_onnx).max():.5f}", "minutes")

def per_call_ms(fn, reps=300):
    t0 = time.perf_counter()
    for _ in range(reps):
        fn()
    return (time.perf_counter() - t0) / reps * 1000
row, row_df = X_test[:1], X_df.iloc[:1]
print(f"one order : sklearn {per_call_ms(lambda: gbr.predict(row_df)):.3f} ms | onnxruntime {per_call_ms(lambda: sess.run(None, {name: row})):.3f} ms")
print(f"550 orders: sklearn {per_call_ms(lambda: gbr.predict(X_df), 50):.3f} ms | onnxruntime {per_call_ms(lambda: sess.run(None, {name: X_test}), 50):.3f} ms")</div>
  <div class="fx" data-lang="text">input: X [None, 7] | file: 77 KB
max |sklearn - onnx| over 550 orders: 0.00001 minutes
one order : sklearn 0.872 ms | onnxruntime 0.008 ms
550 orders: sklearn 3.216 ms | onnxruntime 3.095 ms</div>
  <p>Read the four lines:</p>
  <ol>
    <li>The graph takes one input <code>X</code> of shape <code>[None, 7]</code>: any number of rows, 7 feature columns. The file is 77 KB, against 230 KB for the joblib file.</li>
    <li>Over all 550 test orders the largest difference from scikit-learn is 0.00001 minutes (float32 rounding). Same model, same ETAs: always check this after converting.</li>
    <li>One order: 0.872 ms in scikit-learn vs 0.008 ms in ONNX Runtime. Almost all of scikit-learn's time is per-call overhead (input checks, DataFrame handling), which ONNX Runtime doesn't have.</li>
    <li>550 orders in one call: 3.216 ms vs 3.095 ms, about the same. With a big batch the actual tree walking dominates and both do similar work. ONNX's big win is for real-time, one-order-at-a-time serving.</li>
  </ol>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ONNX</strong> is an open format describing a model as a computation graph of standard operators with typed inputs and outputs; <strong>ONNX Runtime</strong> is an engine that executes such graphs with hardware-specific optimisations.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Assuming conversion is exact and complete. Custom transformers or unusual operations may not convert, dtypes change (float64 → float32), and string features must be encoded first (we export after <code>build_features</code>, so the server still applies the same feature code). Compare outputs on a real batch, as above, in CI.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Quantisation.</b> Trees are small. A neural network has many thousands of float32 weights, which makes files and memory large and inference slower on CPUs and phones. Can we store weights with fewer bits?</div>

  <h2 id="sv-quant"><span class="num">06</span>Quantisation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful tries a neural network (MLP) for ETAs. Every weight is a 32-bit float. If we stored each weight in 8 bits instead, the model would be about four times smaller. How much accuracy would we lose?</p>
  </div>
  <p><strong>Quantisation</strong> stores numbers with fewer bits. The common case: float32 (4 bytes) → int8 (1 byte, whole numbers −128…127). Each group of weights gets a <strong>scale</strong>; a weight w is stored as q = round(w / scale) and read back as q × scale.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Writing prices to the nearest rupee instead of to the paisa. ₹82.37 becomes ₹82. The receipt is shorter, and the total is almost the same as long as each rounding is small compared with the prices.</p>
  </div>
  <p>By hand, four weights: 0.82, −1.37, 0.05, 2.40. The largest magnitude is 2.40, so scale = 2.40 / 127 = 0.0189. Then 0.82 / 0.0189 = 43.4 → <strong>43</strong>; −1.37 / 0.0189 = −72.5 → <strong>−72</strong>; 0.05 / 0.0189 = 2.6 → <strong>3</strong>; 2.40 / 0.0189 = 127. Reading back: 43 × 0.0189 = 0.813 (error 0.007), −72 × 0.0189 = −1.361, 3 × 0.0189 = 0.057, 127 × 0.0189 = 2.40. The code confirms:</p>
  <div class="fx" data-lang="py"># quantisation by hand: 4 float weights -&gt; int8 with one scale
w = np.array([0.82, -1.37, 0.05, 2.40], dtype=np.float32)
scale = np.abs(w).max() / 127                               # symmetric int8: -127..127
q = np.round(w / scale).astype(np.int8)
print("scale", round(float(scale), 5), "| int8", q.tolist(), "| back", [round(float(v), 3) for v in q * scale])</div>
  <div class="fx" data-lang="text">scale 0.0189 | int8 [43, -72, 3, 127] | back [0.813, -1.361, 0.057, 2.4]</div>
  <p>Now a real network: a two-layer MLP (256 and 256 neurons) on Biteful's features, exported to ONNX, then <strong>dynamically quantised</strong> by ONNX Runtime (weights stored as int8; activations quantised on the fly at inference time).</p>
  <div class="fx" data-lang="py"># the same idea on a real network: an MLP for Biteful, exported to ONNX, then int8 weights
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from onnxruntime.quantization import quantize_dynamic, QuantType

train = pd.read_csv("data/train.csv")
X_train = build_features(train).to_numpy(dtype=np.float32)
mlp = make_pipeline(StandardScaler(), MLPRegressor(hidden_layer_sizes=(256, 256), max_iter=400,
                                                    random_state=42)).fit(X_train, train.minutes)
open("model/mlp.onnx", "wb").write(to_onnx(mlp, X_train[:1]).SerializeToString())
quantize_dynamic("model/mlp.onnx", "model/mlp_int8.onnx", weight_type=QuantType.QInt8)

for path in ["model/mlp.onnx", "model/mlp_int8.onnx"]:
    s = ort.InferenceSession(path)
    pred = s.run(None, {s.get_inputs()[0].name: X_test})[0].ravel()
    mae = np.abs(test.minutes - pred).mean()
    print(f"{path:22s} {os.path.getsize(path) // 1024:4d} KB   test MAE {mae:.3f}")</div>
  <div class="fx" data-lang="text">model/mlp.onnx          266 KB   test MAE 2.360
model/mlp_int8.onnx      71 KB   test MAE 2.356</div>
  <p>The file shrank from 266 KB to 71 KB (about 3.7 times smaller: the weights went from 4 bytes to 1, plus a little metadata), and the test MAE moved from 2.360 to 2.356 minutes, a difference far below anything a customer could notice. (By coincidence it is slightly better; usually it is slightly worse.) For tree models like our champion there are no big weight matrices, so quantisation brings little; it matters for neural networks and above all for large language models (GPTQ, AWQ, 4-bit: see <a class="xref" data-note="llm_prod">LLMOps &amp; Production</a>).</p>
  <table class="tbl">
    <tr><th>Kind</th><th>When weights/activations are quantised</th><th>Needs</th></tr>
    <tr><td>Dynamic (post-training)</td><td>Weights ahead of time; activations at run time</td><td>Nothing extra (used above)</td></tr>
    <tr><td>Static (post-training)</td><td>Both ahead of time</td><td>A calibration dataset to choose activation scales</td></tr>
    <tr><td>Quantisation-aware training</td><td>Simulated during training</td><td>Retraining; best accuracy at very low bits</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Quantisation</strong> maps high-precision numbers (float32) to low-precision ones (int8, int4) using a scale (and sometimes a zero point): q = round(w / scale), w ≈ q × scale. It reduces model size and memory and can speed up inference on hardware with fast integer maths, at a small accuracy cost.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Quantising without re-measuring. Accuracy loss depends on the model and the data; some layers (often the first and last) are sensitive. Always compare the quantised model's metric on the frozen test set (2.360 vs 2.356 here) and gate on it, like any other candidate.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Shadow &amp; Canary.</b> We can now produce a fast, small, verified model. Switching every customer to it at once is still a gamble: offline tests can miss what live traffic does. How do we release it in steps?</div>

  <h2 id="sv-rollout"><span class="num">07</span>Shadow &amp; Canary Releases</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Version 2 beat version 1 on 550 frozen test orders. Live traffic is millions of orders, new restaurants, odd inputs. How do we find out how v2 behaves on <em>real</em> requests before customers depend on it, and limit the damage if it is wrong?</p>
  </div>
  <ul>
    <li><strong>Shadow</strong>: v2 receives a <em>copy</em> of every request; its answers are logged, never shown. Zero customer risk; you compare outputs, latency and errors.</li>
    <li><strong>Canary</strong>: a small share of customers (say 5%) really get v2. Watch errors and metrics; if healthy, go to 25%, then 100%. (Named after the canary birds miners carried: the bird fainted first if the air went bad.)</li>
    <li><strong>Blue-green</strong> (Kubernetes note): run both fully, flip all traffic at once, flip back to roll back.</li>
  </ul>
  <h3>Shadow, on the 550 test orders</h3>
  <div class="fx" data-lang="py"># shadow: v1 (live forest) answers every order; v2 (boosting) sees a copy, answers are only logged
v1 = joblib.load("model/v1.joblib")
live, shadow = v1.predict(build_features(test)), gbr.predict(build_features(test))
log = pd.DataFrame({"live_v1": live.round(1), "shadow_v2": shadow.round(1), "real": test.minutes})
log["gap"] = (log.shadow_v2 - log.live_v1).abs()
print(log.head(3).to_string(index=False))
print(f"mean gap {log.gap.mean():.2f} min | orders with gap &gt; 5 min: {(log.gap &gt; 5).sum()} of {len(log)}")
print(f"MAE live v1 {np.abs(log.real - live).mean():.3f} | MAE shadow v2 {np.abs(log.real - shadow).mean():.3f}")</div>
  <div class="fx" data-lang="text"> live_v1  shadow_v2  real  gap
    39.0       38.7  35.9  0.3
    45.5       43.4  42.0  2.1
    40.3       39.8  41.4  0.5
mean gap 1.05 min | orders with gap &gt; 5 min: 2 of 550
MAE live v1 2.654 | MAE shadow v2 2.347</div>
  <p>Customers saw only <code>live_v1</code>. The shadow log shows v2 differs from v1 by 1.05 minutes on average, and by more than 5 minutes on only 2 of 550 orders: no wild answers, so v2 is sane. Because labels (real minutes) arrive within an hour for delivery, we can even score both: 2.654 for live v1, 2.347 for shadow v2, matching the offline gate.</p>
  <h3>Canary, sticky per customer</h3>
  <p>Which customers get v2? Turn the customer ID into a number from 0 to 99 with a hash (a fixed scrambling) and send buckets below the canary percentage to v2. The same customer always lands in the same bucket, so their ETAs don't flip between models on every order.</p>
  <div class="fx" data-lang="py">import hashlib

def version_for(order_id, canary_pct=5):
    bucket = int(hashlib.md5(str(order_id).encode()).hexdigest(), 16) % 100   # 0..99, fixed per id
    return "v2" if bucket &lt; canary_pct else "v1"

print("customer 42 -&gt;", version_for(42), version_for(42), version_for(42))
for pct in [5, 25, 100]:
    on_v2 = sum(version_for(i, pct) == "v2" for i in range(10_000))
    print(f"canary {pct:&gt;3}% -&gt; {on_v2} of 10000 customers on v2")</div>
  <div class="fx" data-lang="text">customer 42 -&gt; v1 v1 v1
canary   5% -&gt; 506 of 10000 customers on v2
canary  25% -&gt; 2472 of 10000 customers on v2
canary 100% -&gt; 10000 of 10000 customers on v2</div>
  <p>Customer 42 gets v1 three times. Raising the percentage from 5 to 25 to 100 moves roughly that share of 10,000 customers (506, 2,472, 10,000), and customers already on v2 stay there.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="150" y="16" text-anchor="middle">Shadow</text><text x="450" y="16" text-anchor="middle">Canary</text>
    <rect x="30" y="30" width="240" height="34" rx="6" class="fb sb"/><text x="150" y="52" text-anchor="middle">v1 answers 100% of orders</text>
    <rect x="30" y="80" width="240" height="34" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="150" y="102" text-anchor="middle">v2 sees a copy, answers logged</text>
    <rect x="330" y="30" width="240" height="34" rx="6" class="fb sb"/><text x="450" y="52" text-anchor="middle">v1: 95% of customers</text>
    <rect x="330" y="80" width="240" height="34" rx="6" class="fg sg"/><text x="450" y="102" text-anchor="middle">v2: 5% → 25% → 100%</text>
    <line x1="300" y1="25" x2="300" y2="135" stroke="currentColor" stroke-opacity=".3"/>
    <text x="150" y="134" text-anchor="middle" class="tm" font-size="11">zero customer risk; mean gap 1.05 min</text><text x="450" y="134" text-anchor="middle" class="tm" font-size="11">real exposure, limited blast radius</text>
  </svg><figcaption>Shadow tests on real traffic with nobody affected; canary exposes a growing, sticky share of customers.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Shadow</th><th>Canary</th><th>A/B test</th></tr>
    <tr><td>Customers on v2</td><td>None</td><td>Small, growing %</td><td>Fixed split, e.g. 50/50</td></tr>
    <tr><td>Question</td><td>Is it sane (outputs, latency, errors)?</td><td>Is it safe on real users?</td><td>Is it better for the business?</td></tr>
    <tr><td>Cost</td><td>2× compute for scoring</td><td>Low</td><td>Weeks of traffic + statistics</td></tr>
  </table>
  <div class="flow"><span>Shadow (sane?)</span><span>Canary (safe?)</span><span>A/B (better?)</span><span>Full rollout</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shadow deployment</strong>: a new model processes a copy of live traffic without affecting responses. <strong>Canary release</strong>: a new version serves a small, gradually increased fraction of real traffic while metrics are compared with the old version, with automatic or manual rollback. <strong>A/B test</strong>: a controlled experiment with a fixed split, sized to detect a business-metric difference (<a class="xref" data-note="st_abtesting">A/B Testing</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating a canary as proof of improvement. 5% of customers for an hour can't show a 1% change in reorders; that needs an A/B test. And a shadow that writes to the database or sends notifications is not a shadow: shadow paths must have no side effects.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Seven ideas. How do they line up for one order on the checkout page?</div>

  <h2 id="sv-connect"><span class="num">08</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Follow Monday order 2 from the app's checkout button to "ETA 56 min" on screen: which idea from this note acts at each step?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<defs><marker id="sv-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">mode (01)</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">checkout → real-time</text>
<rect x="235" y="10" width="190" height="46" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">router (07)</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">hash(customer) → v1 or v2</text>
<rect x="460" y="10" width="190" height="46" rx="7" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">shadow copy (07)</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">logged only, no side effects</text>
<g stroke="currentColor" fill="none" marker-end="url(#sv-a9)"><line x1="200" y1="33" x2="233" y2="33"/><line x1="425" y1="33" x2="458" y2="33"/><line x1="330" y1="56" x2="330" y2="80"/></g>
<rect x="150" y="82" width="360" height="56" rx="7" class="fg sg"/><text x="330" y="101" text-anchor="middle" font-size="11.5" font-weight="700">FastAPI server (02): Pydantic → build_features → predict</text><text x="330" y="117" text-anchor="middle" class="tm" font-size="10">lifespan loaded model once · /ready 200 · 422 for 120 km</text><text x="330" y="131" text-anchor="middle" class="tm" font-size="10">p50 5.75 ms</text>
<line x1="330" y1="138" x2="330" y2="162" stroke="currentColor" marker-end="url(#sv-a9)"/>
<rect x="150" y="164" width="360" height="46" rx="7" class="ft st"/><text x="330" y="183" text-anchor="middle" font-size="11.5" font-weight="700">model file (03, 05, 06)</text><text x="330" y="199" text-anchor="middle" class="tm" font-size="10">safe format · ONNX 0.008 ms/order · int8 for nets</text>
<line x1="330" y1="210" x2="330" y2="232" stroke="currentColor" marker-end="url(#sv-a9)"/>
<rect x="150" y="234" width="360" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="254" text-anchor="middle" font-size="11.5">{"eta_minutes": 56.1, "model_version": "2"}</text>
<text x="70" y="120" class="tm" font-size="10">frameworks (04)</text><text x="70" y="134" class="tm" font-size="10">generate this box</text>
</svg><figcaption>A request is routed (canary), copied (shadow), validated and answered by a model loaded once from a safe, fast file.</figcaption></figure>
  <table class="tbl"><caption>Every idea on Biteful's ETA</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Batch inference</td><td>scheduled job, one big call</td><td>can it wait?</td><td>1,000 rows 37.5 ms vs ~4.5 s one by one</td><td>pre-booked orders, reports</td></tr>
    <tr><td>Real-time inference</td><td>API per request</td><td>input exists only now?</td><td>checkout: 56.1 min</td><td>user-facing decisions</td></tr>
    <tr><td>Streaming</td><td>consumer on events</td><td>update as events arrive?</td><td>rider pings (sketch)</td><td>tracking, fraud</td></tr>
    <tr><td>Validation</td><td>Pydantic schema</td><td>is the input valid?</td><td>120 km → 422</td><td>always</td></tr>
    <tr><td>Lifespan</td><td>startup/shutdown hooks</td><td>load once?</td><td>load 0.821 s once, not per request</td><td>every model server</td></tr>
    <tr><td>Liveness / readiness</td><td><code>/health</code>, <code>/ready</code></td><td>restart? send traffic?</td><td>503 → 200</td><td>any orchestrated service</td></tr>
    <tr><td>Safe packaging</td><td>skops, safetensors, ONNX</td><td>is loading safe?</td><td>pickle ran a shell command</td><td>anything not built by you</td></tr>
    <tr><td>Frameworks</td><td>BentoML, KServe, Seldon, Triton</td><td>write servers by hand?</td><td>InferenceService with 10% canary</td><td>many models / GPUs</td></tr>
    <tr><td>ONNX</td><td>op graph + runtime</td><td>framework-free and fast?</td><td>diff 0.00001; 0.008 vs 0.872 ms</td><td>latency-critical, polyglot</td></tr>
    <tr><td>Quantisation</td><td>q = round(w/scale)</td><td>smaller weights?</td><td>266 → 71 KB; MAE 2.360 → 2.356</td><td>neural nets, LLMs, edge</td></tr>
    <tr><td>Shadow / canary</td><td>traffic copy / sticky split</td><td>safe on real traffic?</td><td>gap 1.05 min; 506 of 10,000 at 5%</td><td>every model release</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>choose when predictions are needed (batch, real-time, stream); for real-time, a server validates input, loads a safely packaged model once and reports liveness and readiness; ONNX and quantisation make the model fast and small without changing its answers; and shadow then canary releases expose a new model to real traffic step by step.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The usual reasons a model server is slow, unsafe or never ready.</div>

  <h2 id="sv-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which habits make p99 latency terrible, servers restart in loops, or a "better" model hurt customers?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: loading the model per request</span><p>Adds the load time (0.8 s here) to every ETA. Load in the lifespan.</p></div>
  <div class="callout trap"><span class="label">Trap: heavy liveness checks</span><p>A liveness probe that waits for the model kills slow-loading containers forever. Liveness trivial; readiness checks the model.</p></div>
  <div class="callout trap"><span class="label">Trap: no input validation</span><p>The model happily scores 120 km or rain = 2. Validate at the door; return 422.</p></div>
  <div class="callout trap"><span class="label">Trap: CPU work in <code>async def</code></span><p>Blocks the event loop for all requests. Use <code>def</code> or offload.</p></div>
  <div class="callout trap"><span class="label">Trap: unpickling untrusted files</span><p>Loading can run any code. Safe formats or trusted, signed sources only.</p></div>
  <div class="callout trap"><span class="label">Trap: unverified conversion or quantisation</span><p>Always compare outputs and metrics after ONNX export or int8 quantisation.</p></div>
  <div class="callout trap"><span class="label">Trap: real-time when batch would do</span><p>Always-on servers for a once-a-day need. Prefer batch when the input is known in advance.</p></div>
  <div class="callout trap"><span class="label">Trap: shadow with side effects, canary as proof</span><p>Shadows must not write or notify; canaries check safety, A/B tests prove improvement.</p></div>
  <div class="callout trap"><span class="label">Trap: no model version in responses</span><p>A bad ETA in a complaint can't be traced. Return and log <code>model_version</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="sv-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful champion v2 (300 boosted trees, test MAE 2.347), v1 forest (2.654); Monday order 2 = 5.5 km, 3 items, rain, Biryani House, real 55 → served ETA 56.1. Batch 1,000 rows: 37.5 ms one call vs ~4.5 s one by one. Server: 422 for 120 km; /ready 503 → 200; p50 5.75 ms, p95 7.61 ms in-process. ONNX: 77 KB, max diff 0.00001 min, one order 0.008 vs 0.872 ms, 550 orders ~3.1 vs 3.2 ms. Quantised MLP: 266 → 71 KB, MAE 2.360 → 2.356. Shadow: mean gap 1.05 min, 2/550 over 5 min. Canary 5%: 506 of 10,000.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Batch / real-time / streaming</td><td>when must the answer exist?</td><td>pre-booked / checkout / tracking</td><td>real-time needs a server</td></tr>
    <tr><td>FastAPI server</td><td>request → ETA, safely?</td><td>422, lifespan, /health, /ready</td><td>model file is a pickle</td></tr>
    <tr><td>Safe packaging</td><td>is loading safe?</td><td>pickle ran a command</td><td>every team rewrites servers</td></tr>
    <tr><td>Frameworks</td><td>standard servers?</td><td>KServe, BentoML, Seldon, Triton</td><td>need a fast portable format</td></tr>
    <tr><td>ONNX</td><td>framework-free, faster?</td><td>same ETAs; 100× faster per order</td><td>big nets are large</td></tr>
    <tr><td>Quantisation</td><td>smaller weights?</td><td>3.7× smaller, same MAE</td><td>how to release safely?</td></tr>
    <tr><td>Shadow &amp; canary</td><td>safe on real traffic?</td><td>gap 1.05; sticky 5%</td><td>→ Kubernetes at scale</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <ul>
    <li><strong>Batch</strong>: scheduled, whole table, cheap; <strong>real-time</strong>: per request, ms, always on; <strong>streaming</strong>: per event, seconds; <strong>hybrid</strong>: precompute + online.</li>
    <li><strong>Lifespan</strong>: <code>@asynccontextmanager async def lifespan(app): load; yield; cleanup</code>, <code>FastAPI(lifespan=lifespan)</code>. <strong>Liveness</strong> = restart if failing; <strong>readiness</strong> = route traffic only if passing.</li>
    <li><strong>p50/p95</strong>: the latency 50% / 95% of requests stay under (sort the times, take the value at that position).</li>
    <li><strong>Formats</strong>: pickle/joblib (unsafe), skops (allow-list), safetensors (weights), ONNX (graph). Pickle danger: <code>__reduce__</code> returns a callable that runs on load.</li>
    <li><strong>ONNX</strong>: <code>skl2onnx.to_onnx(model, sample_float32)</code>; <code>onnxruntime.InferenceSession(path).run(None, {input_name: X})</code>.</li>
    <li><strong>Quantisation</strong>: scale = max|w| / 127; q = round(w / scale); w ≈ q × scale. Example: 0.82 → 43 → 0.813. Dynamic (weights int8, activations at run time), static (calibration data), QAT (during training). <code>onnxruntime.quantization.quantize_dynamic(in, out, weight_type=QuantType.QInt8)</code>.</li>
    <li><strong>Canary bucket</strong> = hash(customer_id) mod 100; v2 if bucket &lt; percentage. <strong>Order</strong>: shadow → canary → A/B → full.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Batch</b><p>Inputs known in advance; daily or hourly needs.</p><small>Not for inputs that exist only at request time</small></div>
    <div><b>Own FastAPI server</b><p>A few models, custom logic, full control.</p><small>Many models: consider a framework</small></div>
    <div><b>ONNX</b><p>Latency-critical single requests, non-Python clients, edge.</p><small>Custom ops may not convert; verify</small></div>
    <div><b>Quantisation</b><p>Neural nets and LLMs, memory-bound or edge.</p><small>Little gain for small tree models</small></div>
    <div><b>Shadow</b><p>Any new model with real-traffic risk.</p><small>Costs double compute; no side effects</small></div>
    <div><b>Canary</b><p>Every release to users.</p><small>Not proof of business lift</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Per-request model loading; heavy liveness checks; no validation; CPU work in <code>async def</code>; unpickling untrusted files; unverified conversions; real-time when batch would do; shadow with side effects; canary as proof; no model version in responses.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>/health</code> vs <code>/ready</code>?</td><td>Health = process alive (restart if not); ready = model loaded and able to answer (route traffic only if so)</td></tr>
    <tr><td>Why was batch scoring ~120× cheaper per order?</td><td>Per-call overhead is paid once for 1,000 rows instead of 1,000 times</td></tr>
    <tr><td>Quantise 0.82 with scale 0.0189.</td><td>0.82 / 0.0189 = 43.4 → 43; back: 43 × 0.0189 = 0.813</td></tr>
    <tr><td>ONNX was 100× faster for one order but not for 550. Why?</td><td>Its win is low per-call overhead; for a big batch the tree computation dominates in both</td></tr>
    <tr><td>Shadow or canary first?</td><td>Shadow (no customer risk, checks sanity), then canary (real exposure, limited), then A/B for business impact</td></tr>
  </table>

  <h2 id="sv-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Batch or real-time for ETAs of tomorrow's pre-booked orders?</summary><div class="qa-body">Batch. The orders are known tonight, so a scheduled job scores them in one call (1,000 rows in 37.5 ms) and stores the ETAs. Real-time would add always-on servers and latency budgets for no benefit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When must you use real-time inference instead of precomputing?</summary><div class="qa-body">When the input only exists at request time (a new cart at checkout, a search query) or the space of inputs is too large to precompute. Hybrids precompute heavy parts in batch and finish online.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why load the model in the lifespan rather than in the request handler?</summary><div class="qa-body">Loading takes hundreds of milliseconds to seconds (0.8 s here); per request it would be added to every response and destroy p99 latency. In the lifespan it happens once before traffic, and readiness reports when it's done.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Liveness vs readiness probes: what goes wrong if you mix them up?</summary><div class="qa-body">If liveness requires the model, a slow load fails liveness, the container is killed and restarted, and it never becomes ready (a restart loop). If readiness is trivial, traffic reaches a server whose model isn't loaded yet and requests fail.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is loading a pickled model from the internet dangerous?</summary><div class="qa-body">Unpickling can call any function the file names via <code>__reduce__</code>, e.g. <code>os.system</code>; our demo ran a shell command just by loading. Use skops, safetensors or ONNX, or load only from trusted, signed sources.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ONNX buy you, and what can go wrong?</summary><div class="qa-body">A framework-free graph that fast runtimes execute from any language and on edge devices, with no pickle risk and a much lower per-call overhead (0.008 vs 0.872 ms for one order). Risks: unsupported custom ops, float32 differences, string features needing prior encoding. Always verify outputs (max diff 0.00001 here).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain int8 quantisation with numbers.</summary><div class="qa-body">Pick a scale = max|w| / 127 (2.40 / 127 = 0.0189); store q = round(w / scale) (0.82 → 43); read back q × scale (0.813). Each weight takes 1 byte instead of 4; our MLP went 266 → 71 KB with MAE 2.360 → 2.356.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose KServe or BentoML over your own FastAPI server?</summary><div class="qa-body">BentoML when a Python team wants standard packaging, batching and images without writing servers; KServe or Seldon when many models run on Kubernetes and need standard autoscaling, scale-to-zero and canary splits; your own server for a few models with custom logic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Canary vs shadow: which first, and why?</summary><div class="qa-body">Shadow first: v2 scores a copy of real traffic with zero customer impact, catching crashes, latency and wild outputs (mean gap 1.05 min here). Then canary: a small sticky share of customers really get v2 while metrics are watched. Then A/B or full rollout.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the server import <code>build_features</code> instead of reimplementing it?</summary><div class="qa-body">Any difference between training and serving features is training/serving skew (the metres bug). Importing the same function used in training and tested in CI guarantees the server builds exactly the features the model learnt from.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do <code>/ready</code> and the Docker HEALTHCHECK from the CI note relate to Kubernetes?</summary><div class="qa-body">They are the same signal at different levels: Docker marks a container healthy, Kubernetes' readiness probe decides whether a pod receives Service traffic, and its liveness probe (<code>/health</code>) decides restarts. Rolling updates wait for readiness, so a new model only gets traffic once loaded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if the response doesn't include the model version during a canary?</summary><div class="qa-body">During a canary two versions answer at once. Without the version in responses and logs, you can't split metrics by version, can't tell whether a complaint came from v1 or v2, and can't decide whether to continue or roll back.</div></details>
</main>
`
});
