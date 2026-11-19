// notes/mlops/mlops_serving.js — Model Serving & Inference
Object.assign(TOPIC_CONTENT, {
  "mlops_serving": `<main>
  <h1>Model Serving &amp; Inference</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Shipping Models</span><span>Model Serving &amp; Inference</span></div>
  <p class="lead">A trained model sitting in a file helps nobody. <strong>Serving</strong> is the work of turning that file into answers that real users and other programs can ask for, quickly, safely and all day long. In practice this means deciding when predictions should be made, writing a small server around the model, making sure the platform knows when that server is able to answer, keeping it fast under load, storing the model in a format that is safe to load, and replacing it with a new version without hurting anyone. Throughout this page we serve one model: Biteful's delivery-time (ETA) model from the earlier MLOps notes, a gradient-boosting regressor with 300 trees that predicts how many minutes an order will take, trained on 1,450 past orders and tested on 550. Our running request is "order 2": 5.5 km, 3 items, raining, from Biryani House, which really took about 55 minutes. Every piece of code on this page was run, including the web server, which we call in-process with FastAPI's <code>TestClient</code>; the tools that need a cluster (KServe, Seldon) or a message broker (Kafka) are shown as configuration and clearly marked as not run.</p>

  <h2 id="sv-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Model Serving</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">When to predict</div>
        <ul>
          <li><b>Batch</b>: scheduled job scores a whole table</li>
          <li><b>Real-time</b>: an API answers each request in milliseconds</li>
          <li><b>Streaming</b>: a consumer re-scores each event as it arrives</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The model server</div>
        <ul>
          <li>Pydantic schema: bad input gets 422 before the model</li>
          <li>Lifespan: load the model once at startup</li>
          <li><code>/health</code> = alive (liveness); <code>/ready</code> = can answer (readiness)</li>
          <li>Return the model version with every answer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Speed</div>
        <ul>
          <li>Measure p50 / p95 / p99, not the average</li>
          <li>Per-call overhead dominates single rows</li>
          <li>Micro-batching: wait a few ms, predict many at once</li>
          <li>ONNX Runtime: tiny per-call cost; int8 quantisation: 4× smaller weights</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Safety</div>
        <ul>
          <li>Pickle can run code on load; prefer skops, safetensors, ONNX</li>
          <li>Shadow: new model sees copies, answers only logged</li>
          <li>Canary: small, sticky share of users gets the new model</li>
          <li>Frameworks (BentoML, KServe, Seldon, Triton) standardise all this</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sv-modes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Batch, Real-time and Streaming</span><span class="rm-sub">when does the prediction have to exist?</span></div></div>
      <div class="rm-item rm-done" data-target="sv-api"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Putting the Model Behind an API</span><span class="rm-sub">a first server, and checking its input</span></div></div>
      <div class="rm-item rm-done" data-target="sv-life"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Loading the Model Once: the Lifespan</span><span class="rm-sub">startup and shutdown code</span></div></div>
      <div class="rm-item rm-done" data-target="sv-health"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Health and Readiness Checks</span><span class="rm-sub">telling the platform "alive" and "ready"</span></div></div>
      <div class="rm-item rm-done" data-target="sv-latency"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Measuring Latency</span><span class="rm-sub">percentiles and where the time goes</span></div></div>
      <div class="rm-item rm-done" data-target="sv-batch"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Batching Requests</span><span class="rm-sub">many requests, one model call</span></div></div>
      <div class="rm-item rm-done" data-target="sv-pack"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Saving the Model Safely</span><span class="rm-sub">why pickle is dangerous, and the alternatives</span></div></div>
      <div class="rm-item rm-done" data-target="sv-onnx"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">ONNX: Portable, Fast Inference</span><span class="rm-sub">running the model without scikit-learn</span></div></div>
      <div class="rm-item rm-done" data-target="sv-quant"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quantisation</span><span class="rm-sub">storing weights in fewer bits</span></div></div>
      <div class="rm-item rm-done" data-target="sv-fw"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Serving Frameworks</span><span class="rm-sub">BentoML, KServe, Seldon, Triton</span></div></div>
      <div class="rm-item rm-done" data-target="sv-rollout"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Shadow Mode and Canary Routing</span><span class="rm-sub">trying a new model on real traffic safely</span></div></div>
      <div class="rm-item rm-done" data-target="sv-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">slow, unsafe or never-ready servers</span></div></div>
      <div class="rm-item rm-done" data-target="sv-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">the whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="sv-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what serving interviews ask</span></div></div>
    </div>
  </div>

  <h2 id="sv-modes"><span class="num">01</span>Batch, Real-time and Streaming</h2>
  <p>Asking a trained model for a prediction is called <strong>inference</strong>. Training happens once in a while; inference happens every time someone needs an answer. Before writing any server, the first question to ask is not "which framework?" but "when does this answer have to exist?", because the answer decides the whole design. Biteful has three products that all want delivery-time estimates, and they need them at very different moments.</p>
  <p>The first product lets customers pre-book tomorrow's lunch. Those orders are already known tonight, so nothing forces us to predict at the moment of the request. We can run a scheduled job at night that loads the model, scores every pre-booked order in one go, and writes the results to a table that the app simply reads tomorrow. That is <strong>batch inference</strong>: predictions for many stored rows, computed on a schedule and saved for later. The second product is the checkout page. When a customer presses "order", the order did not exist a second ago, so its ETA cannot have been computed in advance; the model must answer this one request now, within a few milliseconds. That is <strong>real-time</strong> (or <strong>online</strong>) <strong>inference</strong>: the model sits behind an API and answers individual requests as they arrive. The third product is live tracking, which updates the ETA every time the rider's phone sends a GPS position. Those positions arrive as a never-ending flow of events, and each one should update the estimate within a second or two. That is <strong>streaming inference</strong>: a program reads events from a stream and re-scores each one as it comes in.</p>
  <p>An everyday picture helps. Batch is the morning newspaper: it is printed overnight and read later, and it is cheap because the printing press runs once. Real-time is a phone call: you ask a question and wait on the line for the answer. Streaming is a live cricket score ticker: every ball is reported as it happens, without anyone asking.</p>
  <p>Batch is not only simpler; it is also much cheaper per prediction, and it is worth seeing why. The job below scores 1,000 pre-booked orders for tomorrow. It first predicts all of them in a single call, then, for comparison, does the same work one order per call. (From here on, every snippet starts with the usual imports, <code>numpy as np</code>, <code>pandas as pd</code>, <code>joblib</code>, <code>time</code>, <code>os</code>, and <code>from features import build_features</code>, the shared feature function from the lifecycle note; they are left out to save space.)</p>
  <div class="fx" data-lang="py"># batch_score.py: tonight's job, ETAs for tomorrow's 1,000 pre-booked lunch orders
rng = np.random.default_rng(3)
n = 1000
tomorrow = pd.DataFrame({
    "order_id": np.arange(50001, 50001 + n),
    "distance_km": rng.uniform(0.5, 8.0, n).round(1),
    "items": rng.integers(1, 7, n),
    "rain": 0,                                             # tomorrow's forecast: dry
    "restaurant": rng.choice(["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"], n),
})
model = joblib.load("model/model.joblib")                  # loaded once for the whole job

t0 = time.perf_counter()
tomorrow["eta_minutes"] = model.predict(build_features(tomorrow)).round(1)   # ONE call, 1,000 rows
batch_ms = (time.perf_counter() - t0) * 1000

t0 = time.perf_counter()
for i in range(100):                                       # the same work, one order per call
    model.predict(build_features(tomorrow.iloc[[i]]))
one_by_one_ms = (time.perf_counter() - t0) * 1000 / 100 * n   # scaled up to 1,000 orders

tomorrow.to_csv("eta_tomorrow.csv", index=False)           # the app reads this file tomorrow
print(tomorrow.head(3).to_string(index=False))
print(f"one call for {n} orders: {batch_ms:.1f} ms")
print(f"one call per order     : ~{one_by_one_ms:.0f} ms")</div>
  <div class="fx" data-lang="text"> order_id  distance_km  items  rain  restaurant  eta_minutes
    50001          1.1      5     0 Dosa Corner         24.7
    50002          2.3      2     0 Pizza Point         27.0
    50003          6.5      5     0 Dosa Corner         42.6
one call for 1000 orders: 22.7 ms
one call per order     : ~2170 ms</div>
  <p>The first three rows are what the app will show tomorrow, for example 24.7 minutes for a 1.1 km Dosa Corner order. The timings, which are approximate and vary from run to run, tell the real story: one call for all 1,000 orders took a few tens of milliseconds, while one call per order would have taken a couple of seconds, roughly a hundred times more. The model does the same arithmetic in both cases, walking each order down 300 small trees. The difference is the fixed <strong>per-call overhead</strong>: every call to <code>predict</code> builds a DataFrame, checks the column names and types, allocates arrays and so on, and that cost is the same whether the call carries one row or a thousand. A batch job pays it once; a real-time server pays it on every request, because each request arrives alone. We will come back to this when we look at batching in section 06.</p>
  <p>Streaming needs a message broker such as <a class="xref" data-note="de_kafka">Kafka</a>, which this page cannot run, so here is the shape of a streaming scorer as a sketch. It is just a loop that never ends: read an event, build features, predict, publish the new ETA on another stream.</p>
  <div class="fx" data-lang="py"># stream_eta.py: re-score the ETA whenever a rider's GPS ping arrives (sketch: needs a Kafka broker)
import json, joblib, pandas as pd
from kafka import KafkaConsumer, KafkaProducer
from features import build_features

model = joblib.load("model/model.joblib")                  # loaded once, like any server
pings = KafkaConsumer("rider-pings", group_id="eta-updater",
                      value_deserializer=json.loads)
out = KafkaProducer(value_serializer=lambda v: json.dumps(v).encode())

for msg in pings:                                          # runs forever, one event at a time
    p = msg.value      # {"order_id", "distance_km" still to go, "items", "rain", "restaurant"}
    eta = float(model.predict(build_features(pd.DataFrame([p])))[0])
    out.send("eta-updates", {"order_id": p["order_id"], "eta_minutes": round(eta, 1)})</div>
  <p>The three modes trade freshness against cost and complexity, as the table summarises. A common real-world design is a <strong>hybrid</strong>: compute the expensive parts in batch (for example each restaurant's typical cooking time, refreshed every night) and finish the prediction online with the few inputs that only exist at request time.</p>
  <table class="tbl">
    <tr><th></th><th>Batch</th><th>Real-time</th><th>Streaming</th></tr>
    <tr><td>When the answer exists</td><td>before anyone asks</td><td>within milliseconds of the request</td><td>within seconds of each event</td></tr>
    <tr><td>Input</td><td>a whole table</td><td>one request</td><td>a continuous flow of events</td></tr>
    <tr><td>Freshness of inputs</td><td>as of the last run</td><td>as of the request</td><td>as of the latest event</td></tr>
    <tr><td>Cost</td><td>low: machines start, finish, stop</td><td>servers running all day</td><td>consumers and a broker running all day</td></tr>
    <tr><td>Biteful</td><td>tomorrow's pre-booked orders</td><td>checkout ETA</td><td>live tracking ETA</td></tr>
    <tr><td>Typical tools</td><td>Airflow + Spark, cloud batch jobs</td><td>FastAPI, BentoML, KServe, Triton</td><td>Kafka + Flink or Spark Streaming</td></tr>
  </table>
  <p>The rule of thumb is to choose the simplest mode that meets the need. If an answer is only needed once a day and the inputs are known in advance, a batch job is cheaper, easier to debug and trivial to rerun after a bug. Real-time serving is justified when the input only exists at request time, as at checkout. The rest of this page is about that real-time case, because it is where most of the engineering lives. (The system-design view of the same choice, including latency budgets and feature stores, is in <a class="xref" data-note="sd_serving">Serving: Features, Latency, Shadow &amp; Canary</a>.)</p>

  <h2 id="sv-api"><span class="num">02</span>Putting the Model Behind an API</h2>
  <p>For checkout, the Biteful app needs to send an order over the network and get an ETA back. The standard way to offer that is a small web <strong>API</strong> (application programming interface): a program that listens for HTTP requests, here a <code>POST</code> to <code>/predict</code> with the order as JSON, and replies with JSON. We will build it with <a class="xref" data-note="api_fastapi">FastAPI</a>, the most common choice for Python model servers. To test it without starting a real server, we use FastAPI's <strong><code>TestClient</code></strong>, which calls the application directly inside the same Python process, exactly as if the requests had come over the network.</p>
  <p>Let us start with the most obvious server anyone would write, and see what is wrong with it. It accepts any JSON object, loads the model, and predicts:</p>
  <div class="fx" data-lang="py">from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.post("/predict")
def predict(order: dict):                          # accepts any JSON object at all
    model = joblib.load("model/model.joblib")       # loads the model on EVERY request
    X = build_features(pd.DataFrame([order]))
    return {"eta_minutes": round(float(model.predict(X)[0]), 1)}

client = TestClient(app)                            # calls the app in-process, no network
good = {"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}
bad = {"distance_km": 120, "items": 3, "rain": 2, "restaurant": "Momo Hut"}

t0 = time.perf_counter()
for _ in range(20):
    r = client.post("/predict", json=good)
print("order 2   :", r.status_code, r.json(), f"({(time.perf_counter() - t0) / 20 * 1000:.1f} ms per request)")
r = client.post("/predict", json=bad)
print("bad order :", r.status_code, r.json())</div>
  <div class="fx" data-lang="text">order 2   : 200 {'eta_minutes': 55.0} (65.1 ms per request)
bad order : 200 {'eta_minutes': 56.2}</div>
  <p>It works, in the sense that order 2 gets a sensible answer of 55.0 minutes. But two problems are already visible. The first is speed: each request takes tens of milliseconds, and almost all of that is <code>joblib.load</code> reading the model file again on every single request. The second is worse. The "bad order" claims a 120 km trip, rain equal to 2 (rain is supposed to be 0 or 1) and a restaurant, "Momo Hut", that Biteful has never seen. The server did not complain at all; it returned 200 OK with an ETA of 56.2 minutes. The feature function quietly turned the unknown restaurant into four zero columns, and the tree model, which cannot extrapolate beyond the distances it saw in training, treated 120 km roughly like 8 km. A customer would be shown a confident, meaningless number. A model will happily produce an output for any numbers you give it, so the server must decide what counts as a valid question before the model is asked.</p>
  <p>That decision is called <strong>input validation</strong>: checking that every request has the right fields, types and ranges before doing any work. Think of a restaurant's order counter. A good cashier refuses "one pizza from the dosa counter" at the till, rather than letting it reach the kitchen and come back as a strange plate. In FastAPI, validation is done by declaring a <strong>Pydantic</strong> model, a class that describes the shape of the data. When an endpoint's parameter has that type, FastAPI parses the request body into it and, if anything does not fit, rejects the request automatically with HTTP status <strong>422 Unprocessable Content</strong>, listing every problem. Our handler code never even runs.</p>
  <div class="fx" data-lang="py">from typing import Literal
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

class Order(BaseModel):                             # the shape every request must have
    distance_km: float = Field(gt=0, le=30)          # 0 &lt; distance &lt;= 30 km
    items: int = Field(ge=1, le=50)
    rain: Literal[0, 1]
    restaurant: Literal["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"]

app = FastAPI()
model = joblib.load("model/model.joblib")

@app.post("/predict")
def predict(order: Order):                          # FastAPI validates the body against Order
    X = build_features(pd.DataFrame([order.model_dump()]))
    return {"eta_minutes": round(float(model.predict(X)[0]), 1)}

client = TestClient(app)
print(client.post("/predict", json={"distance_km": 5.5, "items": 3, "rain": 1,
                                    "restaurant": "Biryani House"}).json())
r = client.post("/predict", json={"distance_km": 120, "items": 3, "rain": 2, "restaurant": "Momo Hut"})
print("status", r.status_code)
for err in r.json()["detail"]:
    print(" ", err["loc"][-1], "-&gt;", err["msg"])</div>
  <div class="fx" data-lang="text">{'eta_minutes': 55.0}
status 422
  distance_km -&gt; Input should be less than or equal to 30
  rain -&gt; Input should be 0 or 1
  restaurant -&gt; Input should be 'Biryani House', 'Chai Stop', 'Dosa Corner' or 'Pizza Point'</div>
  <p>The valid order still gets 55.0 minutes. The bad order now gets a 422, and the error list names each problem in plain words: the distance is over the 30 km limit, rain must be 0 or 1, and the restaurant must be one of the four known names. <code>Field(gt=0, le=30)</code> means "greater than 0, less than or equal to 30", and <code>Literal[...]</code> means "exactly one of these values". Notice also that this version loads the model once, when the module is imported, instead of inside the handler. That already fixes the speed problem, but loading a model as a side effect of importing a file has its own drawbacks, which is what the next section is about.</p>
  <p>The schema is also documentation: FastAPI publishes it automatically at <code>/docs</code>, so the app developers can see exactly what the server expects. And it protects against <strong>training/serving skew</strong>, the problem of the server preparing inputs differently from training. The server imports the same <code>build_features</code> function that training used, rather than rewriting it, so the model always sees columns built exactly as it learned them.</p>

  <h2 id="sv-life"><span class="num">03</span>Loading the Model Once: the Lifespan</h2>
  <p>We have seen that loading the model per request is far too slow. Loading it at import time, as a global variable, is fast, but it is clumsy in a real service. The load happens whenever any code imports the module, including tests that only want to check the schema. Nothing records whether the load has finished, so the server cannot tell anyone "I'm not ready yet". There is no natural place to release resources when the server stops, such as closing a database connection or freeing GPU memory. What we really want is a clearly defined moment when the server starts, before it accepts its first request, and another when it stops, after its last one.</p>
  <p>FastAPI provides exactly this through a <strong>lifespan</strong> function: a piece of code that runs once at startup and once at shutdown, wrapped around the whole life of the server. It is written as a generator with a single <code>yield</code>: everything before the <code>yield</code> is the startup half, everything after it is the shutdown half, and the server handles requests while the function is paused at the <code>yield</code>. The decorator <code>@asynccontextmanager</code> turns that generator into a context manager, the same idea as a <code>with</code> block (see <a class="xref" data-note="py_context">Context Managers</a>). Think of a restaurant's day: before opening the doors, the staff light the tandoor and lay out the ingredients; after the last customer leaves, they turn everything off and clean up. Customers are only served in between.</p>
  <p>Here is the complete Biteful server. It combines the validation from the last section with a lifespan that loads the model into a small <code>state</code> dictionary, and it adds the <code>/health</code> and <code>/ready</code> endpoints that the next section explains. The model path and version come from environment variables, so the same code can serve any model version without changes. At the bottom, a short demo runs the server in-process.</p>
  <div class="fx" data-lang="py"># app.py: the Biteful ETA server
import os, time
from contextlib import asynccontextmanager
from typing import Literal

import joblib, pandas as pd
from fastapi import FastAPI, Response
from pydantic import BaseModel, Field
from features import build_features

MODEL_PATH = os.environ.get("MODEL_PATH", "model/model.joblib")
MODEL_VERSION = os.environ.get("MODEL_VERSION", "2")
state = {}                                          # filled at startup, emptied at shutdown

class Order(BaseModel):
    distance_km: float = Field(gt=0, le=30)
    items: int = Field(ge=1, le=50)
    rain: Literal[0, 1]
    restaurant: Literal["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    t0 = time.perf_counter()
    state["model"] = joblib.load(MODEL_PATH)        # STARTUP: runs once, before any request
    state["load_s"] = round(time.perf_counter() - t0, 3)
    print(f"startup : model v{MODEL_VERSION} loaded in {state['load_s']} s")
    yield                                           # the server handles requests here
    state.clear()                                   # SHUTDOWN: runs once, after the last request
    print("shutdown: model released")

app = FastAPI(title="Biteful ETA", lifespan=lifespan)

@app.get("/health")                                 # liveness: is the process alive?
def health():
    return {"status": "ok"}

@app.get("/ready")                                  # readiness: can it answer right now?
def ready(response: Response):
    if "model" not in state:
        response.status_code = 503
        return {"ready": False}
    return {"ready": True, "model_version": MODEL_VERSION}

@app.post("/predict")
def predict(order: Order):
    X = build_features(pd.DataFrame([order.model_dump()]))
    eta = float(state["model"].predict(X)[0])
    return {"eta_minutes": round(eta, 1), "model_version": MODEL_VERSION}

if __name__ == "__main__":                          # try it in-process
    from fastapi.testclient import TestClient
    order2 = {"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}
    with TestClient(app) as client:                 # entering "with" runs the startup half
        t0 = time.perf_counter()
        for _ in range(20):
            r = client.post("/predict", json=order2)
        print("order 2 :", r.json(), f"({(time.perf_counter() - t0) / 20 * 1000:.1f} ms per request)")
    print("after the with block, state =", state)   # leaving "with" ran the shutdown half</div>
  <div class="fx" data-lang="text">startup : model v2 loaded in 0.871 s
order 2 : {'eta_minutes': 55.0, 'model_version': '2'} (6.5 ms per request)
shutdown: model released
after the with block, state = {}</div>
  <p>Follow the output line by line. Entering the <code>with TestClient(app)</code> block started the server, which ran the startup half of the lifespan: the "startup" line shows the model being loaded once, in well under a second. Then twenty requests ran at a few milliseconds each, compared with tens of milliseconds in the naive server, because no request ever touches the model file. The response also carries <code>"model_version": "2"</code>; returning the version with every answer means any ETA that appears in a log or a complaint can be traced to the exact model that produced it. Leaving the <code>with</code> block stopped the server, which ran the shutdown half: the model was released and <code>state</code> is empty again.</p>
  <p>When the same file runs under a real server such as <code>uvicorn app:app</code> (the production command, covered in <a class="xref" data-note="api_production">Production Backend</a>), the order of events is identical: uvicorn logs "Waiting for application startup", runs the lifespan's startup half, logs "Application startup complete" and only then accepts connections; on shutdown it waits for the shutdown half to finish. You may see older code using <code>@app.on_event("startup")</code>; that style is deprecated in favour of the lifespan, which keeps startup and shutdown logic together in one function.</p>

  <h2 id="sv-health"><span class="num">04</span>Health and Readiness Checks</h2>
  <p>In production the ETA server never runs alone. A platform such as Kubernetes or a cloud load balancer runs several copies of it, starts new ones when traffic grows, restarts ones that break and sends each request to one of the copies. To do that well, the platform has to ask every copy two different questions, again and again. The first is "are you alive at all, or are you stuck and should be restarted?". The second is "can you answer requests right now?". These sound similar, but mixing them up causes real outages, so servers answer them on two separate endpoints.</p>
  <p>A <strong>liveness check</strong> answers the first question. Our <code>/health</code> endpoint returns <code>{"status": "ok"}</code> as long as the process can respond at all. If it stops responding, the process is probably hung or deadlocked, and the right action is to restart it. A <strong>readiness check</strong> answers the second question. Our <code>/ready</code> endpoint returns 200 only once the model is in memory, and <strong>503 Service Unavailable</strong> before that. A copy that is not ready should not be restarted; it should simply receive no traffic until it is. Back in the restaurant: the door being unlocked and the lights on means the restaurant is alive; the tandoor being hot means it is ready, and the host does not seat customers until it is.</p>
  <p>The difference is easy to see with <code>TestClient</code>. A client created without <code>with</code> does not run the lifespan, so it lets us look at the server in the moment before startup has finished, which in production is the several seconds (or minutes, for a large model) while the model loads:</p>
  <div class="fx" data-lang="py">from fastapi.testclient import TestClient
from app import app

client = TestClient(app)              # NOT entered with "with": the lifespan has not run yet
print("before startup  /health:", client.get("/health").status_code, client.get("/health").json())
print("before startup  /ready :", client.get("/ready").status_code, client.get("/ready").json())

with TestClient(app) as client:       # entering runs the startup half (model load)
    print("after startup   /health:", client.get("/health").status_code, client.get("/health").json())
    print("after startup   /ready :", client.get("/ready").status_code, client.get("/ready").json())</div>
  <div class="fx" data-lang="text">before startup  /health: 200 {'status': 'ok'}
before startup  /ready : 503 {'ready': False}
startup : model v2 loaded in 0.742 s
after startup   /health: 200 {'status': 'ok'}
after startup   /ready : 200 {'ready': True, 'model_version': '2'}
shutdown: model released</div>
  <p>Before startup, <code>/health</code> already says 200 (the process is alive) while <code>/ready</code> says 503 (no model yet). After startup both say 200, and readiness also reports which model version is loaded. A platform reading these answers would keep this copy out of rotation during loading, without killing it, and start sending it orders the moment <code>/ready</code> turns 200. Kubernetes reads them through <strong>probes</strong>, which the <a class="xref" data-note="mlops_k8s">Kubernetes for ML</a> note configures; Docker's <code>HEALTHCHECK</code> and cloud load balancers use the same idea.</p>
  <p>The most damaging mistake here is to make the liveness check depend on the model. Imagine <code>/health</code> returned an error until the model was loaded, and the model took ninety seconds to load. The platform would see a "dead" process after, say, thirty seconds, restart it, the new process would start loading from the beginning, be declared dead again, and the server would never come up. This restart loop is a classic cause of a deployment that "works on my laptop" but never becomes healthy in the cluster. Keep liveness trivial, and put "is the model loaded?" in readiness. Readiness is also the place for any other dependency the server truly needs before answering, such as a feature store connection.</p>
  <table class="tbl">
    <tr><th>Endpoint</th><th>Question it answers</th><th>If it fails, the platform...</th><th>Biteful's answer</th></tr>
    <tr><td><code>/health</code> (liveness)</td><td>Is the process alive?</td><td>restarts the container</td><td>200 <code>{"status": "ok"}</code> from the first moment</td></tr>
    <tr><td><code>/ready</code> (readiness)</td><td>Can it answer right now?</td><td>stops sending it traffic, but does not restart it</td><td>503 while loading, 200 with the version after</td></tr>
    <tr><td><code>/predict</code></td><td>What is the ETA?</td><td>(used by the app, not the platform)</td><td><code>{"eta_minutes": 55.0, "model_version": "2"}</code></td></tr>
  </table>

  <h2 id="sv-latency"><span class="num">05</span>Measuring Latency</h2>
  <p>"Is the server fast enough?" needs a number, and the checkout team will give us a target such as "the ETA must come back within 50 ms for 99% of orders". The time from sending a request to receiving the answer is the <strong>latency</strong>. The natural first idea is to measure the average, but averages hide exactly the cases that hurt. If 98 requests take 5 ms and 2 take 300 ms, the average is about 11 ms, which looks fine, yet two customers in every hundred waited a third of a second, and at Biteful's volume that is thousands of people every lunchtime.</p>
  <p>So latency is reported as <strong>percentiles</strong>. The <strong>p50</strong> (the median) is the time within which half of the requests finish; the <strong>p95</strong> is the time within which 95% finish; the <strong>p99</strong> is the time within which 99% finish. The slow end of the distribution, p95 and above, is called the <strong>tail latency</strong>, and it is usually what targets are written against, because it describes the experience of the unluckiest users. Think of a bus timetable: a bus that is "on average" on time but is forty minutes late once a week is a bus you cannot rely on, and the once-a-week case is the one people remember.</p>
  <p>The script below sends 500 requests for order 2 to the server, after a few warm-up requests that are not measured (the first calls are slower while caches fill). It then times the two main pieces of work on their own, <code>build_features</code> and <code>model.predict</code>, to see where the median request spends its time. All timings are approximate and depend on the machine.</p>
  <div class="fx" data-lang="py">from fastapi.testclient import TestClient
from app import app, state

order2 = {"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}

def timed(fn, n):
    times = []
    for _ in range(n):
        t0 = time.perf_counter()
        fn()
        times.append((time.perf_counter() - t0) * 1000)   # milliseconds
    return np.array(times)

with TestClient(app) as client:
    for _ in range(20):                                  # warm-up requests, not measured
        client.post("/predict", json=order2)
    full = timed(lambda: client.post("/predict", json=order2), 500)
    df = pd.DataFrame([order2])
    feats = timed(lambda: build_features(df), 500)
    X = build_features(df)
    model_only = timed(lambda: state["model"].predict(X), 500)

p50, p95, p99 = np.percentile(full, [50, 95, 99])
print(f"whole request over 500 calls: mean {full.mean():.2f}  p50 {p50:.2f}  p95 {p95:.2f}  "
      f"p99 {p99:.2f}  max {full.max():.2f} ms")
print(f"where the median goes: build_features {np.median(feats):.2f} ms | model.predict "
      f"{np.median(model_only):.2f} ms | HTTP + validation + JSON {p50 - np.median(feats) - np.median(model_only):.2f} ms")</div>
  <div class="fx" data-lang="text">startup : model v2 loaded in 0.72 s
shutdown: model released
whole request over 500 calls: mean 5.75  p50 5.53  p95 7.57  p99 8.97  max 10.52 ms
where the median goes: build_features 0.93 ms | model.predict 0.68 ms | HTTP + validation + JSON 3.93 ms</div>
  <p>The first line shows a median of a few milliseconds, with p95 and p99 noticeably higher and a maximum higher still: even an idle server on one machine has a tail, caused by things like garbage collection and the operating system scheduling other work. The second line is the more surprising one. The model itself, 300 trees, takes well under a millisecond. Building the features takes about the same. The largest share is everything around them: receiving the request, parsing and validating the JSON, running the endpoint, and serialising the answer. (The in-process <code>TestClient</code> adds some overhead of its own; a real network adds more, typically a millisecond or so inside a data centre.) This is common for small models, and it tells you where to optimise: making the trees faster would barely change the total. For large neural networks the balance flips and the model dominates, which is where the techniques in sections 08 and 09 come in.</p>
  <p>In production you measure latency continuously, not in a one-off script: the server records each request's duration and a monitoring system such as Prometheus computes percentiles over time (see the monitoring note, <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>). Before launch, a <strong>load test</strong> with a tool like Locust or k6 sends many concurrent requests to find the point where the tail starts to grow, which tells you how much traffic one copy of the server can take.</p>

  <h2 id="sv-batch"><span class="num">06</span>Batching Requests</h2>
  <p>Section 01 showed that one model call for 1,000 rows is about a hundred times cheaper per row than 1,000 calls of one row each, because the fixed per-call overhead is paid only once. A real-time server seems unable to use this, since each request arrives alone. But at lunchtime Biteful receives many requests every millisecond, from different customers, and nothing forces the server to answer each one with its own model call. If the server waits a tiny moment, it can collect the requests that arrived during that moment and send them through the model together.</p>
  <p>This is called <strong>dynamic batching</strong> (or <strong>micro-batching</strong>, or adaptive batching): the server holds incoming requests for at most a few milliseconds, or until a maximum batch size is reached, then runs one model call for the whole group and hands each request its own answer. It is how a lift works in a busy office. The lift does not go up for each person the moment they press the button; it waits a few seconds with the doors open, takes everyone who arrived, and makes one trip. Each person waits slightly longer, but the building moves far more people per minute.</p>
  <p>To see it working, here is a small micro-batcher written with <code>asyncio</code>, Python's tool for handling many waiting tasks at once (see <a class="xref" data-note="py_asyncio">Asyncio</a>). Each request handler puts its order and a <strong>future</strong> (an empty box that will later hold the answer) on a queue and waits. A single worker takes the first order from the queue, keeps collecting for up to 5 ms or 32 orders, predicts them all in one call, and fills each future. We send the same 256 test orders through two paths at once: one model call per request, and the micro-batcher.</p>
  <div class="fx" data-lang="py">import asyncio

model = joblib.load("model/model.joblib")
orders = pd.read_csv("data/test.csv").drop(columns="minutes").head(256)

async def handle_alone(order):                       # no batching: one model call per request
    return float(model.predict(build_features(order.to_frame().T))[0])

class MicroBatcher:
    """Collect requests for up to max_wait seconds (or max_size requests), predict them together."""
    def __init__(self, max_size=32, max_wait=0.005):
        self.queue, self.max_size, self.max_wait, self.calls = asyncio.Queue(), max_size, max_wait, 0

    async def predict(self, order):                  # what each request handler awaits
        fut = asyncio.get_running_loop().create_future()
        await self.queue.put((order, fut))
        return await fut

    async def worker(self):
        while True:
            batch = [await self.queue.get()]         # wait for the first request...
            deadline = asyncio.get_running_loop().time() + self.max_wait
            while len(batch) &lt; self.max_size:        # ...then gather more until full or time is up
                timeout = deadline - asyncio.get_running_loop().time()
                if timeout &lt;= 0:
                    break
                try:
                    batch.append(await asyncio.wait_for(self.queue.get(), timeout))
                except asyncio.TimeoutError:
                    break
            X = build_features(pd.DataFrame([o for o, _ in batch]))
            for (_, fut), eta in zip(batch, model.predict(X)):   # ONE model call for the batch
                fut.set_result(float(eta))
            self.calls += 1

async def main():
    rows = [orders.iloc[i] for i in range(len(orders))]
    t0 = time.perf_counter()
    alone = await asyncio.gather(*(handle_alone(o) for o in rows))   # 256 requests at once
    t_alone = time.perf_counter() - t0

    mb = MicroBatcher()
    task = asyncio.create_task(mb.worker())
    t0 = time.perf_counter()
    batched = await asyncio.gather(*(mb.predict(o) for o in rows))  # the same 256 requests
    t_batched = time.perf_counter() - t0
    task.cancel()

    print(f"no batching : {len(rows)} model calls, {t_alone * 1000:.0f} ms in total")
    print(f"micro-batch : {mb.calls} model calls, {t_batched * 1000:.0f} ms in total")
    print("same answers:", np.allclose(alone, batched))

asyncio.run(main())</div>
  <div class="fx" data-lang="text">no batching : 256 model calls, 515 ms in total
micro-batch : 8 model calls, 26 ms in total
same answers: True</div>
  <p>Without batching, 256 requests meant 256 model calls and took about half a second in total. With the micro-batcher, the same 256 requests were served by only 8 model calls (each carrying up to 32 orders) and the whole set finished an order of magnitude faster. The last line confirms that every customer got exactly the same ETA either way; batching changes how the work is grouped, not the answers.</p>
  <p>The price is a little extra waiting. A request that arrives when the queue is empty waits up to the full 5 ms window before its batch runs, so at quiet times batching slightly increases latency, while at busy times it greatly increases <strong>throughput</strong> (requests served per second) and, because the queue no longer builds up, often lowers tail latency too. The two settings, maximum wait and maximum batch size, are the knobs that trade one against the other. For small tree models like ours the gain is real but modest in absolute terms; for neural networks on a GPU it is enormous, because a GPU does the arithmetic for 32 inputs in almost the same time as for one. That is why serving frameworks such as BentoML and NVIDIA Triton build dynamic batching in, so you set the two knobs in a config rather than writing the worker yourself. Large language model servers go further with continuous batching, covered in <a class="xref" data-note="llm_prod">Guardrails, Cost &amp; Deployment</a>.</p>

  <h2 id="sv-pack"><span class="num">07</span>Saving the Model Safely</h2>
  <p>Our lifespan calls <code>joblib.load</code> on a model file. That works because we created the file ourselves. Now suppose a partner company emails Biteful "a better ETA model" as a <code>.pkl</code> file, or someone downloads a model from a public hub, and the server loads it at startup. Is loading a file a harmless act, like opening a picture?</p>
  <p>To answer, we need to know what such a file is. <strong>Serialisation</strong> means turning an object in memory into bytes that can be saved and later turned back into the same object. Python's built-in format for this is <strong>pickle</strong>, and <code>joblib</code> (which scikit-learn models usually use) is pickle with extra support for large arrays. A pickle file is not a description of the data; it is a small program of instructions for rebuilding the object, and one of the allowed instructions is "call this function with these arguments". The function to call is decided by whoever wrote the file. Each class can control this through a special method, <code>__reduce__</code>, which returns the function and arguments pickle should use to rebuild it. Five lines are enough to show what that means:</p>
  <div class="fx" data-lang="py">import pickle, os

class Evil:
    def __reduce__(self):                    # tells pickle how to "rebuild" this object
        return (os.system, ("echo PWNED: this command ran during pickle.load",))

with open("eta_model_from_internet.pkl", "wb") as f:
    pickle.dump(Evil(), f)                   # the attacker builds the file

with open("eta_model_from_internet.pkl", "rb") as f:
    obj = pickle.load(f)                     # you only LOAD it...
print("pickle.load returned:", obj)          # ...and the command has already run</div>
  <div class="fx" data-lang="text">PWNED: this command ran during pickle.load
pickle.load returned: 0</div>
  <p>The "attacker" part builds a file whose rebuilding instruction is "call <code>os.system</code>", which runs a shell command. The "victim" part does nothing except load the file, and the command ran during the load, before any of our own code could inspect the result (the <code>0</code> it returned is the shell's exit status). Our command only printed a message; a real one could read the server's environment variables, which hold database passwords and cloud keys, and send them anywhere. Think of a parcel that arrives with a note inside saying "to unpack me, follow these steps", and you have agreed in advance to follow whatever steps the note says. Pickles also have a practical weakness: they store references to classes by name, so a model pickled with one version of scikit-learn may fail to load, or behave subtly differently, under another.</p>
  <p>The fix is to use formats that store only data, so that loading can never run instructions chosen by the file's author. For scikit-learn the main option is <strong>skops</strong>, which saves the model as data plus a description of which types it contains, and refuses to rebuild any type you have not explicitly approved:</p>
  <div class="fx" data-lang="py">import skops.io as sio

model = joblib.load("model/model.joblib")
sio.dump(model, "model/model.skops")                     # save in the skops format

try:
    sio.load("model/model.skops")                        # load without approving anything
except Exception as e:
    print(type(e).__name__ + ":", e)

unknown = sio.get_untrusted_types(file="model/model.skops")
print("types to review:", unknown)
safe = sio.load("model/model.skops", trusted=unknown)    # approve exactly those, after checking them
X = build_features(pd.read_csv("data/test.csv"))
print("same predictions as joblib:", np.allclose(model.predict(X), safe.predict(X)))</div>
  <div class="fx" data-lang="text">UntrustedTypesFoundException: Untrusted types found in the file: ['sklearn.tree._tree.Tree'].

- sklearn.tree._tree.Tree: sklearn.tree._tree.Tree (the shared node storage for DecisionTree*, RandomForest*, ExtraTrees*, and GradientBoosting* models) stores raw node indices (left_child, right_child, feature) that scikit-learn indexes into without bounds checking. A malicious file can set these to out-of-range values: skops loads the object successfully, but calling .predict() on it can then crash the process (segfault) or read out-of-bounds memory. If you created the file yourself or otherwise fully trust its source, you can load it with trusted=["sklearn.tree._tree.Tree"].

Only add the specific types you have reviewed and trust to the &#96;trusted&#96; argument; avoid passing everything reported by get_untrusted_types() just to make a file load.
types to review: ['sklearn.tree._tree.Tree']
same predictions as joblib: True</div>
  <p>The first attempt to load fails on purpose: skops found a type, scikit-learn's internal <code>Tree</code> class, that is not on its built-in safe list, and it refuses to build it until a human approves it. The message even explains the specific risk of that type. We then list the unknown types, approve exactly those after reviewing them (we created this file ourselves), and the loaded model gives the same predictions as the joblib one. A malicious file could not slip <code>os.system</code> past this check, because it would show up in the list of types needing approval. MLflow 3 switched its default format for scikit-learn models to skops for this reason.</p>
  <table class="tbl">
    <tr><th>Format</th><th>Can loading run code?</th><th>Works with</th><th>Use for</th></tr>
    <tr><td>pickle / joblib</td><td>yes</td><td>same Python and library versions</td><td>models you built yourself, internal use only</td></tr>
    <tr><td>skops</td><td>no, types must be approved</td><td>scikit-learn and similar</td><td>sharing scikit-learn models</td></tr>
    <tr><td>safetensors</td><td>no, raw weights only</td><td>PyTorch, JAX, TensorFlow</td><td>neural network weights, LLMs</td></tr>
    <tr><td>ONNX</td><td>no, a graph of standard operations</td><td>any language, CPU, GPU, phones</td><td>fast, framework-free serving (next section)</td></tr>
  </table>
  <p>The practical rule is simple: never unpickle a file from a source you do not control, and in a model registry prefer a safe format so that a compromised artifact cannot become a compromised server.</p>

  <h2 id="sv-onnx"><span class="num">08</span>ONNX: Portable, Fast Inference</h2>
  <p>To walk 300 small trees, our server image carries scikit-learn, SciPy, pandas and NumPy, hundreds of megabytes of libraries, and every prediction pays scikit-learn's per-call checks. The mobile team would also like to run the model on the rider's phone, where Python is not available at all. Both problems would disappear if the model could be saved as pure arithmetic that any small, fast engine could execute.</p>
  <p>That is what <strong>ONNX</strong> (Open Neural Network Exchange) is: an open file format that describes a model as a <strong>computation graph</strong>, a network of standard operations such as "compare feature 0 with 3.45 and go left" or "multiply by this matrix and add this vector", with typed inputs and outputs. The file contains no Python objects and no code. <strong>ONNX Runtime</strong> is an engine from Microsoft that executes such graphs very efficiently, from Python, C++, Java, C#, JavaScript and mobile apps, on CPUs, GPUs and phones. Converters translate models into ONNX: <code>skl2onnx</code> for scikit-learn, <code>torch.onnx.export</code> for PyTorch, and others for XGBoost and LightGBM. Think of sheet music. A pianist's performance only exists when that pianist is in the room; once it is written down in standard notation, any trained musician on any instrument can play exactly the same tune.</p>
  <p>The script converts the ETA model, checks that the converted model gives the same answers on all 550 test orders, and times both versions. Notice that we convert the model, not the feature function: the server still runs <code>build_features</code> and passes the resulting numbers as a float32 array, which is the form ONNX expects.</p>
  <div class="fx" data-lang="py">from skl2onnx import to_onnx
import onnxruntime as ort

model = joblib.load("model/model.joblib")                    # v2: 300 boosted trees
test = pd.read_csv("data/test.csv")
X_df = build_features(test)                                  # scikit-learn gets its DataFrame
X = X_df.to_numpy(dtype=np.float32)                          # ONNX works on plain float32 arrays

onx = to_onnx(model, X[:1])                                  # trace the model using one sample row
with open("model/model.onnx", "wb") as f:
    f.write(onx.SerializeToString())

sess = ort.InferenceSession("model/model.onnx")              # no scikit-learn needed from here on
inp = sess.get_inputs()[0]
print("graph input:", inp.name, inp.shape, inp.type)
print("file sizes : joblib", os.path.getsize("model/model.joblib") // 1024, "KB | onnx",
      os.path.getsize("model/model.onnx") // 1024, "KB")

p_skl = model.predict(X_df)
p_onnx = sess.run(None, {inp.name: X})[0].ravel()
print(f"largest difference over {len(X)} orders: {np.abs(p_skl - p_onnx).max():.6f} minutes")

def ms_per_call(fn, reps):
    t0 = time.perf_counter()
    for _ in range(reps):
        fn()
    return (time.perf_counter() - t0) / reps * 1000

print(f"one order : sklearn {ms_per_call(lambda: model.predict(X_df.iloc[:1]), 300):.3f} ms | "
      f"onnxruntime {ms_per_call(lambda: sess.run(None, {inp.name: X[:1]}), 300):.3f} ms")
print(f"550 orders: sklearn {ms_per_call(lambda: model.predict(X_df), 50):.3f} ms | "
      f"onnxruntime {ms_per_call(lambda: sess.run(None, {inp.name: X}), 50):.3f} ms")</div>
  <div class="fx" data-lang="text">graph input: X [None, 7] tensor(float)
file sizes : joblib 391 KB | onnx 164 KB
largest difference over 550 orders: 0.000008 minutes
one order : sklearn 0.695 ms | onnxruntime 0.014 ms
550 orders: sklearn 3.147 ms | onnxruntime 1.598 ms</div>
  <p>Read the output from the top. The graph has one input called <code>X</code> with shape <code>[None, 7]</code>: any number of rows (<code>None</code>) of 7 feature columns, as 32-bit floats. The ONNX file is less than half the size of the joblib file. The largest difference between the two models over 550 orders is a few millionths of a minute, which comes from ONNX using 32-bit floats where scikit-learn uses 64-bit; for practical purposes it is the same model. Always run this comparison after converting, ideally as a test in CI, because converters can silently mishandle unusual settings.</p>
  <p>The timings are the interesting part. For a single order, ONNX Runtime is many times faster than scikit-learn, because almost all of scikit-learn's time for one row is per-call overhead (checking the DataFrame, validating inputs), which ONNX Runtime does not have. For all 550 orders in one call the two are much closer, because now the actual tree walking dominates and both engines do similar work. So ONNX's biggest win is exactly the real-time, one-request-at-a-time case. Its limits are that not every model converts (custom Python transformers inside a pipeline usually do not), types change from float64 to float32, and text or category columns must be encoded before the graph, as we did with <code>build_features</code>.</p>

  <h2 id="sv-quant"><span class="num">09</span>Quantisation</h2>
  <p>Tree models are small, but neural networks are made of large tables of numbers called <strong>weights</strong>, and each weight is normally stored as a 32-bit float, 4 bytes. A network with a million weights is already 4 MB; a large language model with seven billion weights is 28 GB, which is more memory than most GPUs have. Size matters for serving in three ways: the model must fit in memory, it must be read from memory for every prediction (which is often the slowest part), and it must be shipped to wherever it runs.</p>
  <p><strong>Quantisation</strong> reduces this by storing each number with fewer bits. The most common form turns float32 weights into <strong>int8</strong>, whole numbers from −128 to 127 that take 1 byte each. Each group of weights gets a <strong>scale</strong>, a single float that says how much one integer step is worth. A weight w is stored as q = round(w / scale) and turned back into a float as q × scale when it is used. Think of writing prices to the nearest rupee instead of to the paisa: ₹82.37 becomes ₹82, the receipt is shorter, and the total hardly changes as long as each rounding is small compared with the prices themselves.</p>
  <p>Let us do it by hand for four weights: 0.82, −1.37, 0.05 and 2.40. The largest absolute value is 2.40, and we want that to map to the largest integer, 127, so scale = 2.40 / 127 ≈ 0.0189. Then 0.82 / 0.0189 ≈ 43.4, which rounds to 43; −1.37 / 0.0189 ≈ −72.5, which rounds to −72; 0.05 / 0.0189 ≈ 2.6, which rounds to 3; and 2.40 becomes 127. Reading back, 43 × 0.0189 ≈ 0.813, close to the original 0.82. The code does the same:</p>
  <div class="fx" data-lang="py">import numpy as np
w = np.array([0.82, -1.37, 0.05, 2.40], dtype=np.float32)   # four float32 weights
scale = np.abs(w).max() / 127                               # biggest weight maps to 127
q = np.round(w / scale).astype(np.int8)                     # stored: 1 byte each
back = q * scale                                            # what the model computes with
print("scale :", round(float(scale), 5))
print("int8  :", q.tolist())
print("back  :", [round(float(v), 3) for v in back])
print("error :", [round(float(v), 4) for v in np.abs(w - back)])</div>
  <div class="fx" data-lang="text">scale : 0.0189
int8  : [43, -72, 3, 127]
back  : [0.813, -1.361, 0.057, 2.4]
error : [0.0074, 0.0094, 0.0067, 0.0]</div>
  <p>Each weight now takes one byte instead of four, and each is off by less than 0.01. Whether such small errors matter depends on the model, and the only way to know is to measure. So here is a real network: a small multi-layer perceptron (MLP) with two hidden layers of 256 neurons, trained on Biteful's features, exported to ONNX, then quantised with ONNX Runtime's <code>quantize_dynamic</code>. <strong>Dynamic quantisation</strong> stores the weights as int8 ahead of time and quantises the intermediate values (the activations) on the fly while predicting, so it needs no extra data.</p>
  <div class="fx" data-lang="py">from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from skl2onnx import to_onnx
import onnxruntime as ort
from onnxruntime.quantization import quantize_dynamic, QuantType

train, test = pd.read_csv("data/train.csv"), pd.read_csv("data/test.csv")
X_train = build_features(train).to_numpy(dtype=np.float32)
X_test = build_features(test).to_numpy(dtype=np.float32)
mlp = make_pipeline(StandardScaler(),
                    MLPRegressor(hidden_layer_sizes=(256, 256), max_iter=400, random_state=42))
mlp.fit(X_train, train.minutes)

with open("model/mlp.onnx", "wb") as f:
    f.write(to_onnx(mlp, X_train[:1]).SerializeToString())
quantize_dynamic("model/mlp.onnx", "model/mlp_int8.onnx", weight_type=QuantType.QInt8)

for path in ["model/mlp.onnx", "model/mlp_int8.onnx"]:
    s = ort.InferenceSession(path)
    pred = s.run(None, {s.get_inputs()[0].name: X_test})[0].ravel()
    mae = np.abs(test.minutes - pred).mean()
    print(f"{path:20s} {os.path.getsize(path) // 1024:4d} KB   test MAE {mae:.3f} minutes")</div>
  <div class="fx" data-lang="text">model/mlp.onnx        266 KB   test MAE 2.282 minutes
model/mlp_int8.onnx    71 KB   test MAE 2.288 minutes</div>
  <p>The file shrank from 266 KB to 71 KB, almost four times smaller (the weights went from 4 bytes to 1, plus a little metadata), and the test error changed only in the third decimal place, far below anything a customer would notice. (The MLP happens to be quite accurate on this data; as a candidate it would go through the same evaluation gate as any other model.) For our tree-based champion quantisation brings little, because it has no large weight tables; it matters for neural networks and above all for large language models, where 8-bit and 4-bit methods such as GPTQ and AWQ make the difference between needing four GPUs and needing one.</p>
  <table class="tbl">
    <tr><th>Kind</th><th>What is quantised, and when</th><th>Needs</th></tr>
    <tr><td>Dynamic, post-training</td><td>weights ahead of time, activations while predicting</td><td>nothing extra (used above)</td></tr>
    <tr><td>Static, post-training</td><td>weights and activations ahead of time</td><td>a small calibration dataset to choose activation scales</td></tr>
    <tr><td>Quantisation-aware training</td><td>rounding is simulated during training so the model learns to tolerate it</td><td>retraining; best accuracy at very low bit widths</td></tr>
  </table>
  <p>Treat a quantised model as a new candidate model, not as a free optimisation: measure its metric on the same frozen test set and gate it like any other release, because some models and some layers (often the first and last) are sensitive to rounding.</p>

  <h2 id="sv-fw"><span class="num">10</span>Serving Frameworks</h2>
  <p>Look at what we have written by hand so far: an input schema, a lifespan, liveness and readiness endpoints, version reporting, a micro-batcher, a safe model format. Biteful will soon have ten models (ETA, fraud, search ranking and more), and if every team writes all of this again, each will make slightly different mistakes. A <strong>model serving framework</strong> is a tool that takes a saved model and gives you a production server with these pieces built in, often together with packaging into a container image, autoscaling and traffic splitting. None of them can run in this sandbox (KServe and Seldon need a Kubernetes cluster), so this section shows their configuration and explains what each does.</p>
  <p><strong>BentoML</strong> is a Python framework. You write a service class, and BentoML provides the HTTP server, adaptive batching, and commands to package code, model and dependencies into a "bento" (<code>bentoml build</code>) and turn it into a container image (<code>bentoml containerize</code>). The same ETA model as a BentoML service looks like this; compare it with our <code>app.py</code>: the <code>__init__</code> method plays the role of the lifespan, and the batching knobs from section 06 are just two arguments.</p>
  <div class="fx" data-lang="py"># service.py: the ETA model as a BentoML service (not run here)
import bentoml, pandas as pd
from features import build_features

@bentoml.service(resources={"cpu": "1"}, traffic={"timeout": 2})
class BitefulETA:
    model_ref = bentoml.models.get("biteful-eta:latest")       # from BentoML's local model store

    def __init__(self):                                         # runs once per worker: the lifespan
        self.model = bentoml.sklearn.load_model(self.model_ref)

    @bentoml.api(batchable=True, max_batch_size=32, max_latency_ms=10)   # adaptive batching
    def predict(self, orders: pd.DataFrame) -&gt; list[float]:
        return self.model.predict(build_features(orders)).round(1).tolist()</div>
  <p><strong>KServe</strong> works at the level of Kubernetes. It adds a new kind of Kubernetes object, the <code>InferenceService</code>: you state the model's format and where it is stored, and KServe starts a suitable server (it has built-in servers for scikit-learn, XGBoost, PyTorch, ONNX and others), sets up autoscaling including <strong>scale to zero</strong> (no running copies at all when there is no traffic), and can split traffic between model versions by percentage. The whole ETA service becomes a few lines of YAML:</p>
  <div class="fx" data-lang="text"># eta-inferenceservice.yaml: KServe (not run here: needs a cluster with KServe installed)
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: biteful-eta
spec:
  predictor:
    minReplicas: 1
    maxReplicas: 10
    model:
      modelFormat:
        name: sklearn                                  # KServe picks its built-in sklearn server
      storageUri: s3://biteful-ml-artifacts/eta/v2/     # folder holding model.joblib</div>
  <p><strong>Seldon Core</strong> also runs on Kubernetes and focuses on more complex setups: inference graphs that chain pre-processing, several models and post-processing, plus built-in A/B tests, shadow routing, explainers and drift detectors. Its basic object is similar:</p>
  <div class="fx" data-lang="text"># eta-model.yaml: Seldon Core v2 (not run here: needs a cluster with Seldon installed)
apiVersion: mlops.seldon.io/v1alpha1
kind: Model
metadata:
  name: biteful-eta
spec:
  storageUri: s3://biteful-ml-artifacts/eta/v2/
  requirements: [sklearn]</div>
  <p><strong>NVIDIA Triton Inference Server</strong> is built for GPUs and throughput. It serves ONNX, TensorRT, PyTorch and TensorFlow models from a "model repository" folder, runs several models on the same GPU, and has highly tuned dynamic batching configured per model. Triton is often the engine underneath KServe or a cloud endpoint when GPUs are involved.</p>
  <table class="tbl">
    <tr><th>Choose</th><th>When</th></tr>
    <tr><td>Your own FastAPI server</td><td>one or a few models, custom logic around the prediction, a team that wants full control</td></tr>
    <tr><td>BentoML</td><td>Python teams that want packaging, batching and images without deep Kubernetes knowledge</td></tr>
    <tr><td>KServe or Seldon</td><td>many models on an existing Kubernetes platform, with standard autoscaling, scale-to-zero and traffic splits</td></tr>
    <tr><td>Triton</td><td>GPU models where throughput and batching dominate</td></tr>
    <tr><td>Managed cloud endpoints</td><td>no platform team; pay the cloud provider to run it (<a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a>)</td></tr>
  </table>
  <p>Frameworks are not free: KServe and Seldon bring their own components that must be installed, upgraded and debugged. A sensible path is to start with a plain server like ours, learn what your models actually need, and adopt a framework when the repetition across models starts to hurt.</p>

  <h2 id="sv-rollout"><span class="num">11</span>Shadow Mode and Canary Routing</h2>
  <p>The last serving question is how to replace a model. Version 2 (boosting) beat version 1 (a random forest) on 550 frozen test orders, but live traffic is millions of orders, with new restaurants, unusual inputs and peak loads that no test set contains. If we switch every customer to v2 at once and something is wrong, every customer is affected. We need ways to see how v2 behaves on real requests before customers depend on it, and to limit the damage if it misbehaves.</p>
  <p>The first technique is <strong>shadow mode</strong> (or a shadow deployment): the new model receives a copy of every live request and computes an answer, but that answer is only written to a log; customers keep seeing the old model's answers. It is like a trainee pilot flying alongside the captain in a simulator that receives the real flight's inputs: you can judge every decision the trainee would have made without any passenger being at risk. Here the 550 test orders stand in for a day of live traffic:</p>
  <div class="fx" data-lang="py">v1 = joblib.load("model/v1.joblib")                 # live model: the old random forest
v2 = joblib.load("model/model.joblib")              # candidate: boosted trees
test = pd.read_csv("data/test.csv")                 # stands in for a day of live orders
X = build_features(test)

live = v1.predict(X)                                # what customers are shown
shadow = v2.predict(X)                              # computed on a copy, only written to a log
log = pd.DataFrame({"live_v1": live.round(1), "shadow_v2": shadow.round(1), "real": test.minutes})
log["gap"] = (log.shadow_v2 - log.live_v1).abs()
print(log.head(3).to_string(index=False))
print(f"mean gap {log.gap.mean():.2f} min | orders with gap &gt; 5 min: {(log.gap &gt; 5).sum()} of {len(log)}")
print(f"MAE live v1 {np.abs(log.real - live).mean():.3f} | MAE shadow v2 {np.abs(log.real - shadow).mean():.3f}")</div>
  <div class="fx" data-lang="text"> live_v1  shadow_v2  real  gap
    21.8       21.6  21.5  0.2
    35.8       36.1  34.2  0.3
    41.7       41.8  41.1  0.1
mean gap 0.84 min | orders with gap &gt; 5 min: 0 of 550
MAE live v1 2.507 | MAE shadow v2 2.386</div>
  <p>Customers saw only the <code>live_v1</code> column. The shadow log shows that v2 differs from v1 by less than a minute on average and never by more than 5 minutes, so it produces no wild answers. Because delivery times become known within an hour, we can even score both models on the real outcomes: v2's error is lower, matching the offline evaluation. Shadow mode checks that a model is sane on real traffic (outputs, latency, error rate) at the cost of running two models. It has one strict rule: the shadow path must have no side effects, so it must never write to the orders database, send notifications or call payment services.</p>
  <p>The second technique is a <strong>canary release</strong>: a small share of real customers, say 5%, actually receives v2's answers while everyone else stays on v1. If error rates, latency and business metrics stay healthy, the share grows to 25%, then 100%; if not, it drops back to 0. The name comes from the canaries miners once carried underground, which showed signs of bad air before the miners did. The share should be <strong>sticky</strong>: the same customer should always get the same version, otherwise their ETA might jump between models from one order to the next. A standard way is to <strong>hash</strong> the customer ID, turning it into a fixed, evenly spread number, take it modulo 100 to get a bucket from 0 to 99, and send buckets below the canary percentage to v2:</p>
  <div class="fx" data-lang="py">import hashlib

def version_for(customer_id, canary_pct):
    digest = hashlib.md5(str(customer_id).encode()).hexdigest()
    bucket = int(digest, 16) % 100                  # a number 0..99, always the same for this id
    return "v2" if bucket &lt; canary_pct else "v1"

print("customer 42 at 5%:", [version_for(42, 5) for _ in range(3)])
before = {c for c in range(10_000) if version_for(c, 5) == "v2"}
for pct in [5, 25, 100]:
    on_v2 = {c for c in range(10_000) if version_for(c, pct) == "v2"}
    print(f"canary {pct:&gt;3}% -&gt; {len(on_v2):&gt;5} of 10000 customers on v2 "
          f"(all of the 5% group still on v2: {before &lt;= on_v2})")</div>
  <div class="fx" data-lang="text">customer 42 at 5%: ['v1', 'v1', 'v1']
canary   5% -&gt;   506 of 10000 customers on v2 (all of the 5% group still on v2: True)
canary  25% -&gt;  2472 of 10000 customers on v2 (all of the 5% group still on v2: True)
canary 100% -&gt; 10000 of 10000 customers on v2 (all of the 5% group still on v2: True)</div>
  <p>Customer 42 gets v1 every time. At 5%, 506 of 10,000 customers land on v2, close to the expected 500 because the hash spreads IDs evenly. Raising the percentage to 25 and 100 moves more customers onto v2, and the check in brackets confirms that everyone already on v2 stays there, because a bucket below 5 is also below 25. In a Kubernetes cluster this routing is often done by the platform instead of by your code, using replica counts, a service mesh or KServe's traffic percentages, as the <a class="xref" data-note="mlops_k8s">Kubernetes for ML</a> note shows.</p>
  <p>The usual order is shadow first (is it sane?), then canary (is it safe on real users?), and, when the question is whether the new model is actually better for the business, an <a class="xref" data-note="st_abtesting">A/B test</a> with a fixed split and enough traffic for a statistically sound answer. A canary that runs for an hour on 5% of users can catch a crash or a latency spike, but it cannot prove a 1% improvement in reorders.</p>

  <h2 id="sv-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common performance mistake is loading the model inside the request handler, which we saw in section 02: it adds the whole load time to every request. Load once in the lifespan. A close second is less obvious and is worth seeing in code. FastAPI lets you write an endpoint as <code>async def</code> or as plain <code>def</code>. An <code>async def</code> endpoint runs directly on the server's <strong>event loop</strong>, the single thread that juggles all requests; plain <code>def</code> endpoints are run in a pool of worker threads. If an <code>async def</code> endpoint does heavy CPU work, such as a slow <code>model.predict</code>, it blocks the event loop and every other request has to wait. Here five requests arrive at once at two endpoints that each do 200 ms of blocking work:</p>
  <div class="fx" data-lang="py">import asyncio, time
import httpx
from fastapi import FastAPI

app = FastAPI()

@app.get("/slow_async")
async def slow_async():               # async def: runs ON the event loop
    time.sleep(0.2)                   # stands in for 200 ms of CPU work (a big model.predict)
    return {"ok": True}

@app.get("/slow_def")
def slow_def():                       # plain def: FastAPI runs it in a thread pool
    time.sleep(0.2)
    return {"ok": True}

async def five_at_once(path):
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://eta") as client:
        t0 = time.perf_counter()
        await asyncio.gather(*(client.get(path) for _ in range(5)))
        return time.perf_counter() - t0

for path in ["/slow_async", "/slow_def"]:
    print(f"5 requests at once to {path:11s}: {asyncio.run(five_at_once(path)):.2f} s")</div>
  <div class="fx" data-lang="text">5 requests at once to /slow_async: 1.01 s
5 requests at once to /slow_def  : 0.22 s</div>
  <p>The <code>async def</code> endpoint served the five requests one after another, about a second in total, because each one blocked the loop. The plain <code>def</code> endpoint ran them in parallel threads and finished in about the time of one. Use plain <code>def</code> for endpoints that call a CPU-bound model, or explicitly move the work off the loop; reserve <code>async def</code> for endpoints that mostly wait on other services.</p>
  <p>Several other mistakes have come up along the way. Making the liveness check depend on the model turns a slow model load into an endless restart loop; keep liveness trivial and put the model check in readiness. Skipping input validation lets a model return confident nonsense for impossible inputs, as the 120 km order showed; validate at the door and return 422. Reporting only average latency hides the tail that users actually feel; track p95 and p99. Unpickling files from untrusted sources lets the file's author run code on your server; use safe formats. Converting to ONNX or quantising without comparing outputs and metrics afterwards risks shipping a model that differs from the one you evaluated. Building a real-time API when a nightly batch job would do costs money and complexity for nothing. Letting a shadow model write to databases or send messages turns a safe test into a production incident, and treating a short canary as proof of improvement confuses "safe" with "better". Finally, not returning the model version in responses makes it impossible to tell, during a canary, which model produced a bad answer.</p>

  <h2 id="sv-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Modes of inference</h3>
  <table class="tbl">
    <tr><th>Mode</th><th>What it is</th><th>Latency</th><th>Use when</th></tr>
    <tr><td>Batch</td><td>scheduled job scores many stored rows, saves results</td><td>hours (ready before needed)</td><td>inputs known in advance</td></tr>
    <tr><td>Real-time</td><td>API answers each request synchronously</td><td>milliseconds</td><td>input exists only at request time</td></tr>
    <tr><td>Streaming</td><td>consumer scores each event from a stream</td><td>seconds</td><td>continuous events (GPS, clicks, transactions)</td></tr>
    <tr><td>Hybrid</td><td>heavy parts precomputed in batch, finished online</td><td>milliseconds</td><td>expensive features + fresh inputs</td></tr>
  </table>
  <h3>Key terms</h3>
  <ul>
    <li><b>Inference</b>: using a trained model to make predictions.</li>
    <li><b>Input validation</b>: rejecting malformed requests before the model runs; FastAPI + Pydantic returns <b>422</b>.</li>
    <li><b>Lifespan</b>: code that runs once at startup (before <code>yield</code>) and once at shutdown (after it).</li>
    <li><b>Liveness</b> (<code>/health</code>): is the process alive? Failing → restart. <b>Readiness</b> (<code>/ready</code>): can it answer? Failing (503) → no traffic, no restart.</li>
    <li><b>p50 / p95 / p99</b>: latency within which 50% / 95% / 99% of requests finish; the high end is <b>tail latency</b>.</li>
    <li><b>Per-call overhead</b>: fixed cost of each predict call; why batches are cheaper per row.</li>
    <li><b>Dynamic (micro-) batching</b>: wait up to a few ms or N requests, predict together; more throughput, slightly more latency when quiet.</li>
    <li><b>Serialisation</b>: saving an object as bytes. <b>Pickle</b> can run code on load via <code>__reduce__</code>; <b>skops</b>, <b>safetensors</b>, <b>ONNX</b> store data only.</li>
    <li><b>ONNX</b>: model as a graph of standard operations; <b>ONNX Runtime</b> executes it in any language, with tiny per-call overhead.</li>
    <li><b>Quantisation</b>: fewer bits per number; scale = max|w| / 127, q = round(w / scale), w ≈ q × scale.</li>
    <li><b>Shadow mode</b>: new model scores copies of live traffic, answers only logged. <b>Canary</b>: small sticky share of real users gets the new model, increased step by step.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">@asynccontextmanager
async def lifespan(app):
    state["model"] = joblib.load(MODEL_PATH)      # startup
    yield
    state.clear()                                 # shutdown
app = FastAPI(lifespan=lifespan)

class Order(BaseModel):
    distance_km: float = Field(gt=0, le=30)
    rain: Literal[0, 1]

with TestClient(app) as client:                   # "with" runs the lifespan
    client.post("/predict", json={...})

np.percentile(times_ms, [50, 95, 99])             # latency percentiles

onx = skl2onnx.to_onnx(model, X[:1].astype(np.float32))
sess = onnxruntime.InferenceSession("model.onnx")
sess.run(None, {sess.get_inputs()[0].name: X})

quantize_dynamic("m.onnx", "m_int8.onnx", weight_type=QuantType.QInt8)
bucket = int(hashlib.md5(str(customer_id).encode()).hexdigest(), 16) % 100</div>
  <h3>Frameworks</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>In one line</th></tr>
    <tr><td>BentoML</td><td>Python service class → bento → container image; adaptive batching</td></tr>
    <tr><td>KServe</td><td><code>InferenceService</code> on Kubernetes; built-in model servers, scale to zero, traffic %</td></tr>
    <tr><td>Seldon Core</td><td>Kubernetes inference graphs, A/B, shadow, explainers</td></tr>
    <tr><td>Triton</td><td>GPU server for ONNX/TensorRT/PyTorch/TF; dynamic batching, many models per GPU</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Never load the model per request; never make liveness wait for the model.</li>
    <li>CPU-heavy work in <code>async def</code> blocks every request; use plain <code>def</code>.</li>
    <li>Report percentiles, not averages; warm up before measuring.</li>
    <li>Verify outputs after ONNX conversion and metrics after quantisation.</li>
    <li>Never unpickle untrusted files.</li>
    <li>Shadow must have no side effects; canary proves safety, A/B proves improvement.</li>
    <li>Return the model version with every prediction.</li>
  </ul>

  <h2 id="sv-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between batch, real-time and streaming inference?</summary><div class="qa-body">Batch inference scores many stored rows on a schedule and saves the results for later use. Real-time inference answers individual requests through an API within milliseconds. Streaming inference reads events from a stream such as Kafka and re-scores each one within seconds. The choice depends on when the answer must exist and when the inputs become available.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose batch over real-time serving?</summary><div class="qa-body">When the inputs are known in advance and the answer is needed on a schedule, for example nightly recommendations or ETAs for pre-booked orders. Batch is cheaper (machines run and stop, per-call overhead is paid once), easier to debug and easy to rerun. Real-time is only needed when the input exists only at request time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should a model be loaded in the lifespan rather than in the request handler?</summary><div class="qa-body">Loading a model takes from hundreds of milliseconds to minutes; doing it per request adds that to every response. In the lifespan it happens once, before the server accepts traffic, and the server can report readiness when it is done. The lifespan also gives a clean place to release resources at shutdown.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a liveness and a readiness probe? What goes wrong if you confuse them?</summary><div class="qa-body">Liveness asks "is the process alive?"; failing it gets the container restarted. Readiness asks "can it serve now?"; failing it removes the instance from traffic without restarting it. If liveness waits for a slow model load, the platform kills the container before it finishes, causing an endless restart loop. If readiness is trivial, traffic reaches instances that have no model loaded and requests fail.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you validate inputs to a model API, and why does it matter?</summary><div class="qa-body">Declare a schema (in FastAPI, a Pydantic model with types, ranges and allowed values); the framework rejects non-conforming requests with 422 before the model runs. It matters because a model produces an output for any numbers, so without validation impossible inputs get confident, meaningless predictions instead of a clear error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do we report p95 or p99 latency instead of the average?</summary><div class="qa-body">The average hides slow outliers: a few very slow requests barely move it, yet those are the users who have a bad experience. Percentiles describe the distribution directly, and at high traffic even 1% of requests is a lot of people. Service-level objectives are usually written on p95 or p99.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model's predict takes 0.6 ms but the endpoint p50 is 5 ms. Where is the time going and what would you do?</summary><div class="qa-body">Into everything around the model: request parsing, validation, feature building, serialisation and framework overhead. Profile each stage first. Options include caching or precomputing features, avoiding pandas for single rows, using a faster runtime such as ONNX Runtime, and batching; optimising the model itself would barely help.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dynamic batching and what is the trade-off?</summary><div class="qa-body">The server holds requests for a short window (a few ms) or until a maximum batch size, then runs one model call for all of them. It greatly increases throughput because per-call overhead (and, on GPUs, idle compute) is shared. The cost is a little extra latency for requests that wait for the window, especially at quiet times; max wait and max batch size tune the balance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you put a CPU-heavy predict call inside an <code>async def</code> FastAPI endpoint?</summary><div class="qa-body">It runs on the event loop and blocks it, so every other request waits until it finishes; concurrent requests are served one at a time. A plain <code>def</code> endpoint is run in a thread pool instead. For CPU-bound models use <code>def</code> or offload the work explicitly, and scale with multiple worker processes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is loading a pickled model from an untrusted source dangerous? What would you use instead?</summary><div class="qa-body">A pickle is a set of instructions for rebuilding an object, and through <code>__reduce__</code> it can tell the loader to call any function, such as <code>os.system</code>, so merely loading it can run arbitrary code. Use formats that store only data: skops for scikit-learn (with an approved-types list), safetensors for neural network weights, or ONNX.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is ONNX and what are its benefits and limits?</summary><div class="qa-body">ONNX is an open format that stores a model as a graph of standard operations; ONNX Runtime executes it from many languages and on CPUs, GPUs and mobile devices. Benefits: no training framework in the serving image, very low per-call overhead, portability and no pickle risk. Limits: some custom operations do not convert, precision usually drops to float32, and preprocessing such as string encoding must happen before or be converted too. Always compare outputs after converting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain int8 quantisation with an example.</summary><div class="qa-body">Choose a scale so the largest weight maps to 127: for weights up to 2.40, scale = 2.40 / 127 ≈ 0.0189. Store each weight as q = round(w / scale), so 0.82 becomes 43, and use q × scale ≈ 0.813 at inference. Each weight takes 1 byte instead of 4, so the model is about four times smaller, usually with a very small accuracy loss that must be measured.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Dynamic vs static quantisation vs quantisation-aware training?</summary><div class="qa-body">Dynamic quantisation stores weights in int8 and quantises activations on the fly, needing no data. Static quantisation also fixes activation scales ahead of time, using a calibration dataset, which is faster at inference. Quantisation-aware training simulates the rounding during training so the model adapts to it, giving the best accuracy at low bit widths at the cost of retraining.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use KServe, BentoML or Triton instead of a hand-written FastAPI server?</summary><div class="qa-body">BentoML when a Python team wants standard packaging, batching and container images without writing servers. KServe or Seldon when many models run on Kubernetes and need standard autoscaling, scale-to-zero and traffic splitting. Triton for GPU models where throughput and dynamic batching matter. A hand-written server is fine for a few models with custom logic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is shadow deployment and what must you be careful about?</summary><div class="qa-body">The new model receives a copy of live requests and its predictions are logged but never returned, so you can compare outputs, latency and errors on real traffic with no customer risk. The shadow path must have no side effects (no writes, notifications or payments), and it doubles inference cost while it runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you route 5% of users to a canary model so that each user always sees the same version?</summary><div class="qa-body">Hash a stable user ID, take it modulo 100 to get a bucket from 0 to 99, and send buckets below 5 to the canary. The same ID always gives the same bucket, and raising the threshold to 25 keeps the original 5% on the canary while adding more. Log the model version with each prediction so metrics can be split by version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shadow, canary or A/B test: which do you run first, and what does each prove?</summary><div class="qa-body">Shadow first: it shows the model is sane on real inputs with zero risk. Then canary: a small real exposure shows it is safe (no crashes, latency or error spikes). Then, if you need to know whether it improves a business metric, an A/B test with a fixed split and a pre-computed sample size. A canary alone cannot prove a small improvement.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the serving setup for an ETA model that must answer at checkout within 50 ms p99 at 2,000 requests per second.</summary><div class="qa-body">A stateless FastAPI (or framework) server with a validated schema, model loaded in the lifespan, liveness and readiness endpoints, and the version in responses; several replicas behind a load balancer with autoscaling on CPU or request rate. Precompute slow features (restaurant prep times) in batch and fetch them from a fast store, use ONNX Runtime and micro-batching if per-call overhead dominates, and load-test to find requests per replica. Roll out new versions via shadow, then canary, while monitoring p99 latency and error rate.</div></details>
</main>
`
});
