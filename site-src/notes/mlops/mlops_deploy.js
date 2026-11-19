// notes/mlops/mlops_deploy.js — Deployment Patterns
Object.assign(TOPIC_CONTENT, {
  "mlops_deploy": `<main>
<h1>Deployment Patterns</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Deployment Patterns</span></div>
  <p class="lead">Deploying a model means putting it somewhere it can make predictions for real users, and doing so in a way that can be trusted, measured and undone. A trained model on its own is just a file; it earns its keep only when the product can ask it questions, at the right moment, for everyone, without breaking anything. Two decisions shape every deployment: <em>how</em> predictions are produced (ahead of time in bulk, on demand per request, in reaction to events, or on the user's device) and <em>how</em> a new version replaces the old one without hurting customers. Our running example is Biteful, the food-delivery app from the rest of the MLOps track, whose gradient-boosting model (version 2) predicts how many minutes an order will take from the distance, the number of items, whether it is raining and which restaurant cooks it. We will serve that one model in each of the four ways, package it properly, release a new version with each of the common strategies, roll a bad one back, and finally see where CI/CD, serving, Kubernetes and the cloud fit in.</p>

  <h2 id="dp-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Deployment Patterns</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Inference patterns</div>
        <ul>
          <li><b>Batch</b>: score many rows on a schedule, store results</li>
          <li><b>Real-time</b>: one request, one answer, in milliseconds</li>
          <li><b>Streaming</b>: react to each event from a queue</li>
          <li><b>Edge</b>: the model runs on the user's device</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Packaging</div>
        <ul>
          <li>Ship preprocessing + model as one object</li>
          <li>pickle/joblib: Python only, runs code on load</li>
          <li>ONNX: portable graph, fast runtime, any language</li>
          <li>Pin library versions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Release strategies</div>
        <ul>
          <li><b>Rolling</b>: replace copies one by one</li>
          <li><b>Blue-green</b>: switch all traffic at once, old kept ready</li>
          <li><b>Canary</b>: small % first, grow if healthy</li>
          <li><b>Shadow</b>: new model sees traffic, users don't see it</li>
          <li><b>A/B</b>: split users to measure business impact</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rollback</div>
        <ul>
          <li>Rollback = move a pointer back</li>
          <li>Version in every response</li>
          <li>Rules decided before the release</li>
          <li>Keep old version and its features alive</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dp-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">From Model File to Predictions</span><span class="rm-sub">what deployment has to solve</span></div></div>
      <div class="rm-item rm-done" data-target="dp-batch"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Batch Inference</span><span class="rm-sub">predict ahead of time, in bulk</span></div></div>
      <div class="rm-item rm-done" data-target="dp-realtime"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Real-Time Inference</span><span class="rm-sub">answer each request while the user waits</span></div></div>
      <div class="rm-item rm-done" data-target="dp-stream"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Streaming and Edge Inference</span><span class="rm-sub">react to events; run on the device; choosing</span></div></div>
      <div class="rm-item rm-done" data-target="dp-package"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Packaging a Model</span><span class="rm-sub">model + preprocessing; joblib vs ONNX</span></div></div>
      <div class="rm-item rm-done" data-target="dp-release"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Release Strategies</span><span class="rm-sub">rolling, blue-green, canary, shadow, A/B</span></div></div>
      <div class="rm-item rm-done" data-target="dp-rollback"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Rollback</span><span class="rm-sub">undoing a release in a minute</span></div></div>
      <div class="rm-item rm-done" data-target="dp-fit"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Where CI/CD, Serving, Kubernetes and Cloud Fit</span><span class="rm-sub">the layers that carry a deployment</span></div></div>
      <div class="rm-item rm-done" data-target="dp-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">skew, unsafe files, risky switches</span></div></div>
      <div class="rm-item rm-done" data-target="dp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">patterns, strategies, formats on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dp-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about deployment</span></div></div>
    </div>
  </div>

  <h2 id="dp-what"><span class="num">01</span>From Model File to Predictions</h2>
  <p>At the end of training, Biteful has a file, <code>v2.joblib</code>, containing a gradient-boosting model that is off by about 2.3 minutes on average on orders it has never seen. That number was measured in a notebook. A customer opening the app at lunchtime sees nothing from it yet. Between the file and the customer there are several questions that training never had to answer. When should the prediction be made: before the customer asks, at the moment they ask, or whenever something changes? Where does the model run: on a server, in a nightly job, on the phone? What exactly must be shipped with it so that the server turns an order into the same numbers the model was trained on? And when version 3 is ready, how do we switch to it without risking every customer at once, and how do we switch back if it misbehaves?</p>
  <p><strong>Model deployment</strong> is the work of answering those questions: taking a validated model version to reliable, observable and reversible use in production. "Reliable" means it keeps answering correctly under real load. "Observable" means we can see which version produced each answer and how well it is doing. "Reversible" means any release can be undone quickly. Think of a restaurant launching a new dish. Having an approved recipe is only the start; the kitchen must decide whether to prepare it in advance or cook to order, the recipe card and the special spice mix must travel together to every branch, the dish is first offered to a few tables to see how it goes, and the old menu stays in the drawer in case the new one makes people ill.</p>
  <p>The rest of this note follows that order. Sections 02 to 04 cover the four <strong>inference patterns</strong>, the ways predictions can be produced; section 05 covers what to ship; sections 06 and 07 cover how to release a new version and how to undo it; section 08 shows which other notes in this track carry each part.</p>

  <h2 id="dp-batch"><span class="num">02</span>Batch Inference</h2>
  <p>Biteful's restaurant list shows a rough delivery time under each restaurant ("about 35 min") before the customer has ordered anything. These numbers are needed constantly, for thousands of screens, but they depend only on things known in advance: the restaurant, a distance band, a typical basket size and whether it is raining. Calling a model thousands of times a second to recompute the same few thousand answers would be wasteful. It is much simpler to compute every answer once, store them in a table, and let the app look them up.</p>
  <p>That is <strong>batch inference</strong>: running the model over a large set of inputs at once, usually on a schedule, and storing the predictions for later use. A bakery works this way: it bakes the day's bread at 4 a.m., before any customer arrives, so that at 8 a.m. selling a loaf takes seconds. The cost is that the bread is only as fresh as the morning's bake.</p>
  <p>The script below is a batch job. It loads the model once, builds a grid of every restaurant, distance from 0.5 to 8 km, basket size and weather, predicts all of them in a single call, and writes a table. For comparison it also times predicting rows one at a time:</p>
  <div class="fx" data-lang="py"># batch inference: precompute "about N min" for every restaurant x distance x rain combination
import time, joblib, pandas as pd
from features import RESTAURANTS, build_features

model = joblib.load("model/v2.joblib")                 # loaded once for the whole job
grid = pd.DataFrame([{"restaurant": r, "distance_km": km / 10, "items": items, "rain": rain}
                     for r in RESTAURANTS for km in range(5, 81)
                     for items in range(1, 7) for rain in (0, 1)])

t0 = time.perf_counter()
grid["eta_minutes"] = model.predict(build_features(grid)).round(1)   # one call, all rows
batch_s = time.perf_counter() - t0

t0 = time.perf_counter()
for i in range(100):                                    # the same work, one row at a time
    model.predict(build_features(grid.iloc[[i]]))
one_by_one_s = (time.perf_counter() - t0) / 100 * len(grid)

grid.to_csv("eta_table.csv", index=False)               # the app just looks rows up
print(len(grid), "rows scored")
print(grid.sample(3, random_state=1).to_string(index=False))
print(f"one batch call: {batch_s * 1000:.0f} ms;  row by row would take about {one_by_one_s:.1f} s")</div>
  <div class="fx" data-lang="text">3648 rows scored
   restaurant  distance_km  items  rain  eta_minutes
  Pizza Point          2.6      5     0         33.3
  Pizza Point          5.0      1     0         35.1
Biryani House          3.8      1     1         44.0
one batch call: 22 ms;  row by row would take about 8.8 s</div>
  <p>All 3,648 combinations were scored in one call taking about 20 ms (timings here and below are approximate and vary from machine to machine). Doing the same work one row at a time would take several seconds, a few hundred times slower, because every call to <code>predict</code> pays a fixed overhead for checking inputs and setting up, and a batch pays it once. This is the main strength of batch inference: it can use cheap, efficient bulk computation, and it has no latency requirement, since nobody is waiting. A real batch job would run nightly or hourly from a scheduler such as cron or Airflow (see <a class="xref" data-note="de_etl">ETL &amp; Orchestration</a>), read inputs from a warehouse, and write results to a database or key-value store; for very large tables it would run on Spark (<a class="xref" data-note="de_spark">Apache Spark</a>).</p>
  <p>The weakness is freshness. The table can only contain inputs known when the job ran. If a new restaurant joins at noon, it has no row until the next run, and the table cannot answer a question about a specific order with a specific address. Batch inference fits predictions that can be computed ahead of time and tolerate being a little stale: nightly churn scores, weekly demand forecasts, product recommendations refreshed every few hours, or these "about N minutes" labels.</p>

  <h2 id="dp-realtime"><span class="num">03</span>Real-Time Inference</h2>
  <p>At checkout the situation is different. The customer has chosen a restaurant, three items and a delivery address 5.5 km away, and it is raining. That exact combination was not in any precomputed table (in reality, addresses are far more varied than a grid), and the app must show an ETA now, while the customer looks at the screen. The prediction has to be made on demand.</p>
  <p><strong>Real-time inference</strong> (also called online inference) means the model runs inside a service that receives one request, computes a prediction immediately and returns it, typically within tens of milliseconds. The bakery equivalent is a café that makes each coffee to order: every customer gets exactly what they asked for, but the café needs a barista standing by all day, even when nobody comes in. In practice the model sits behind an HTTP endpoint such as <code>POST /predict</code>, built with a framework like FastAPI; <a class="xref" data-note="mlops_serving">Model Serving &amp; Inference</a> builds that server in full. Here is the core of it as a plain function:</p>
  <div class="fx" data-lang="py"># real-time inference: one request in, one answer out, while the customer waits
import time, joblib, pandas as pd
from features import build_features

MODEL = joblib.load("model/v2.joblib")                  # load ONCE, when the server starts
MODEL_VERSION = "2"

def predict(request: dict) -&gt; dict:
    if not 0.1 &lt;= request["distance_km"] &lt;= 30:
        return {"error": "distance_km must be between 0.1 and 30"}
    eta = MODEL.predict(build_features(pd.DataFrame([request])))[0]
    return {"eta_minutes": round(float(eta), 1), "model_version": MODEL_VERSION}

order2 = {"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}
print(predict(order2))
print(predict({**order2, "distance_km": 120}))

def timed(fn, n=200):
    t0 = time.perf_counter()
    for _ in range(n):
        fn()
    return (time.perf_counter() - t0) / n * 1000

print(f"predict, model already loaded : {timed(lambda: predict(order2)):.2f} ms per request")
print(f"load the model on every request: {timed(lambda: joblib.load('model/v2.joblib'), 50):.2f} ms extra per request")</div>
  <div class="fx" data-lang="text">{'eta_minutes': 56.1, 'model_version': '2'}
{'error': 'distance_km must be between 0.1 and 30'}
predict, model already loaded : 3.32 ms per request
load the model on every request: 14.02 ms extra per request</div>
  <p>The first line shows a real-time answer: Monday order 2 gets 56.1 minutes (it really took 55), together with the model version that produced it. The second shows why a real-time service must validate its input: a 120 km distance, the kind of GPS glitch seen in the training data, is refused with a clear message instead of being fed to the model, which would happily return a number. The last two lines show the single most important performance rule for real-time serving. Predicting one order with an already-loaded model takes a few milliseconds; loading the model from disk takes several times longer. A server that loads the model inside the request handler multiplies every request's latency; a correct server loads it once at start-up and keeps it in memory.</p>
  <p>Real-time inference gives the freshest possible answers and handles any combination of inputs, but it is the most demanding pattern to operate. The service must be running at all times, fast at the 95th and 99th percentile of latency (the slowest 5% or 1% of requests, which users notice most), able to scale up for the lunch rush, and monitored continuously. A common compromise is a <strong>hybrid</strong>: precompute what you can in batch (the restaurant's typical kitchen time, say) and compute only the order-specific part in real time.</p>

  <h2 id="dp-stream"><span class="num">04</span>Streaming and Edge Inference</h2>
  <p>Some predictions need to change because the world changed, not because anyone asked. Suppose two orders are already on their way and it starts to rain. Their ETAs are now wrong, and Biteful wants to push corrected times to both customers' phones without waiting for them to refresh. Neither a nightly batch nor a request-driven API fits: the trigger is an <em>event</em>.</p>
  <p><strong>Streaming inference</strong> means a long-running consumer reads events one by one from a queue or log, such as Kafka, and runs the model whenever an event arrives, publishing the result as another event or pushing it to users. Think of an air-traffic controller watching a radar screen: they do not wait for pilots to call, and they do not plan everything the night before; they react to each new blip as it appears. Below, a Python <code>deque</code> stands in for the queue (<a class="xref" data-note="de_kafka">Kafka &amp; Streaming</a> covers the real thing), and the consumer keeps the open orders as state between events:</p>
  <div class="fx" data-lang="py"># streaming inference: react to each event as it arrives, not to a request or a schedule
from collections import deque
import joblib, pandas as pd
from features import build_features

model = joblib.load("model/v2.joblib")
def eta(order):
    return round(float(model.predict(build_features(pd.DataFrame([order])))[0]))

# events as a queue such as Kafka would deliver them, in order
events = deque([
    ("order_placed", {"id": 1, "distance_km": 2.0, "items": 2, "rain": 0, "restaurant": "Dosa Corner"}),
    ("order_placed", {"id": 2, "distance_km": 5.5, "items": 3, "rain": 0, "restaurant": "Biryani House"}),
    ("rain_started", {}),
    ("order_placed", {"id": 3, "distance_km": 1.2, "items": 1, "rain": 1, "restaurant": "Chai Stop"}),
])
open_orders = {}                                   # state the consumer keeps between events

while events:                                      # the consumer loop: take one event, act, repeat
    kind, data = events.popleft()
    if kind == "order_placed":
        open_orders[data["id"]] = data
        print(f"order {data['id']} placed       -&gt; ETA {eta(data)} min")
    elif kind == "rain_started":                   # one event changes a feature of every open order
        for order in open_orders.values():
            before = eta(order)
            order["rain"] = 1
            print(f"rain: order {order['id']} updated -&gt; ETA {before} -&gt; {eta(order)} min (push to app)")</div>
  <div class="fx" data-lang="text">order 1 placed       -&gt; ETA 23 min
order 2 placed       -&gt; ETA 45 min
rain: order 1 updated -&gt; ETA 23 -&gt; 31 min (push to app)
rain: order 2 updated -&gt; ETA 45 -&gt; 56 min (push to app)
order 3 placed       -&gt; ETA 23 min</div>
  <p>Each <code>order_placed</code> event is scored as it arrives. The <code>rain_started</code> event is the interesting one: a single event changes a feature (<code>rain</code>) of every open order, so the consumer re-scores both and pushes new ETAs, 23 → 31 and 45 → 56 minutes, without any customer asking. The third order arrives after the rain began and is scored with rain from the start. Real streaming systems add what this loop leaves out: several consumers sharing the work, recording which events have been processed so that a crash does not lose or repeat them, and keeping state in a store rather than a Python dictionary. Streaming is the right pattern for fraud checks on card transactions, live ETA updates, sensor monitoring and anything where the value of a prediction decays within seconds.</p>
  <p>The fourth pattern moves the model rather than the timing. In <strong>edge inference</strong> the model runs on the user's device (a phone, a car, a camera, a factory sensor) instead of on a server. If Biteful wanted riders' phones to keep estimating arrival times in a basement car park with no signal, the model would have to live on the phone. Edge inference removes the network round trip (latency of microseconds rather than tens of milliseconds), works offline, keeps personal data on the device and costs nothing per prediction on the server side. The price is that the model must be small and fast enough for weak hardware, it is usually converted to a portable format such as ONNX, TensorFlow Lite or Core ML (the next section converts Biteful's model), and updating it means shipping a new app version or a model download, so different users may run different versions for weeks.</p>
  <p>Choosing between the four comes down to two questions: <em>when</em> is the prediction needed, and <em>where</em> can the model run? The table summarises the trade-offs:</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Triggered by</th><th>Latency</th><th>Freshness</th><th>Cost and effort</th><th>Biteful use</th></tr>
    <tr><td>Batch</td><td>a schedule</td><td>none needed (minutes to hours per run)</td><td>as old as the last run</td><td>cheapest; runs only during the job</td><td>"about 35 min" on the restaurant list</td></tr>
    <tr><td>Real-time</td><td>a request</td><td>milliseconds</td><td>fresh</td><td>always-on servers, autoscaling, monitoring</td><td>ETA at checkout</td></tr>
    <tr><td>Streaming</td><td>an event</td><td>seconds or less after the event</td><td>fresh, pushed</td><td>queue infrastructure, stateful consumers</td><td>re-score open orders when rain starts</td></tr>
    <tr><td>Edge</td><td>the app on the device</td><td>lowest, works offline</td><td>model updates are slow</td><td>small model, many versions in the wild</td><td>rider app without signal</td></tr>
  </table>
  <p>A good rule in interviews and in practice is to choose the simplest pattern that meets the requirement. If predictions can be computed in advance, batch is far cheaper and easier to run than a real-time service; reach for real-time only when the inputs are known at request time and the answer is needed immediately, and for streaming only when events, not requests, should trigger predictions.</p>

  <h2 id="dp-package"><span class="num">05</span>Packaging a Model</h2>
  <p>Whatever the pattern, something has to be copied from the training environment to wherever predictions are made. The natural assumption is that this is just the model file. It is not, and the clearest way to see why is to watch it fail. In training, Biteful turned each order into numbers with its own <code>build_features</code> function, which creates one column per restaurant from a fixed list. Imagine a server developer who receives only the model file and writes the preprocessing again, "the usual way", with <code>pd.get_dummies</code>:</p>
  <div class="fx" data-lang="py"># the model file alone is not enough: the server must rebuild the SAME features
import joblib, pandas as pd

model = joblib.load("model/v2.joblib")                 # trained on build_features() columns
order2 = pd.DataFrame([{"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}])

# a server developer re-writes the preprocessing "the usual way"
X_server = pd.get_dummies(order2, columns=["restaurant"])
print("server columns:", list(X_server.columns))
try:
    model.predict(X_server)
except ValueError as e:
    print("ValueError:", str(e).splitlines()[0])</div>
  <div class="fx" data-lang="text">server columns: ['distance_km', 'items', 'rain', 'restaurant_Biryani House']
ValueError: The feature names should match those that were passed during fit.</div>
  <p>For a single Biryani House order, <code>get_dummies</code> creates only one restaurant column, because it only knows about restaurants present in the data it is given; the model expects four. Here scikit-learn notices the mismatch and refuses. That is the lucky case. If the re-written preprocessing had produced the right column names but, say, kilometres instead of miles or a different order of categories, the model would have returned confident, wrong answers with no error at all. A difference between how features are computed in training and in serving is called <strong>training-serving skew</strong>, and it is one of the most common causes of models that were excellent offline and poor in production.</p>
  <p>The fix is to treat the preprocessing as part of the model. scikit-learn's <code>Pipeline</code> chains preprocessing steps and the model into one object that is trained, saved and loaded together, so the server cannot get one without the other. Think of a flat-pack wardrobe: it ships with its own screws and instructions in the same box, because a box of panels with "find suitable screws" written on it would be assembled differently in every home.</p>
  <div class="fx" data-lang="py"># package preprocessing + model as ONE object, so they can never drift apart
import os, joblib, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

train = pd.read_csv("data/train.csv")
pipe = Pipeline([
    ("prep", ColumnTransformer([("rest", OneHotEncoder(handle_unknown="ignore"), ["restaurant"])],
                               remainder="passthrough")),          # numbers pass through unchanged
    ("model", GradientBoostingRegressor(n_estimators=300, learning_rate=0.088, max_depth=2,
                                        subsample=0.733, random_state=42)),
]).fit(train.drop(columns="minutes"), train.minutes)

joblib.dump(pipe, "model/eta_pipeline.joblib")
loaded = joblib.load("model/eta_pipeline.joblib")       # what the server does at start-up
raw = pd.DataFrame([{"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"},
                    {"distance_km": 2.0, "items": 2, "rain": 0, "restaurant": "Momo Hut"}])  # new restaurant
print(loaded.predict(raw).round(1))
print("file size:", os.path.getsize("model/eta_pipeline.joblib") // 1024, "KB")</div>
  <div class="fx" data-lang="text">[56.1 24.4]
file size: 231 KB</div>
  <p>The pipeline contains a <code>ColumnTransformer</code> that one-hot encodes the restaurant column and passes the numeric columns through unchanged, followed by the same gradient-boosting settings as version 2. It is fitted on raw training rows and saved as a single file. The server's job becomes trivial: load the file and pass it raw orders. Monday order 2 again comes out at 56.1 minutes. The second order is from "Momo Hut", a restaurant that did not exist during training; because the encoder was created with <code>handle_unknown="ignore"</code>, it is simply treated as "none of the known restaurants" instead of crashing the server. (Whether 24.4 minutes is a <em>good</em> guess for an unknown kitchen is a separate question, and a reason to monitor predictions for new categories.) The <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a> note covers <code>Pipeline</code> and <code>ColumnTransformer</code> in depth.</p>
  <p>Next, the file format. <code>joblib</code> and Python's <code>pickle</code>, which joblib builds on, save a Python object by recording how to rebuild it. They are convenient and preserve everything, but they have two serious limits. The file can only be loaded by Python with compatible versions of the same libraries, so the serving environment must pin, for example, exactly scikit-learn 1.9.1. And loading a pickle can execute arbitrary code, because the file is allowed to say "to rebuild me, call this function":</p>
  <div class="fx" data-lang="py"># why you must never load a pickle from someone you don't trust
import pickle

class NotAModel:
    def __reduce__(self):                  # tells pickle how to "rebuild" the object...
        return (print, ("this ran during pickle.load - it could have been any command",))

payload = pickle.dumps(NotAModel())
pickle.loads(payload)                      # just LOADING the file runs the function</div>
  <div class="fx" data-lang="text">this ran during pickle.load - it could have been any command</div>
  <p>Nothing was "used" here: merely <em>loading</em> the bytes called <code>print</code>, and a malicious file could just as easily call a function that deletes data or opens a connection to an attacker. So a pickle or joblib file must only ever be loaded from a source you trust, such as your own model registry, never from an upload form or a random download.</p>
  <p><strong>ONNX</strong> (Open Neural Network Exchange) takes a different approach. Instead of a Python object, it stores the model as a graph of standard mathematical operations ("compare feature 0 with 3.45, go left, add 0.12"), which a separate engine, <strong>ONNX Runtime</strong>, can execute from Python, C++, Java, C#, JavaScript or on a phone, without scikit-learn installed. An ONNX file is data, not code, so loading it cannot run arbitrary commands. Here Biteful's model is converted with <code>skl2onnx</code> and checked against the original:</p>
  <div class="fx" data-lang="py"># ONNX: export the model as a portable graph and run it without scikit-learn
import os, time, joblib, numpy as np, pandas as pd
import onnxruntime as ort
from skl2onnx import to_onnx
from features import build_features

model = joblib.load("model/v2.joblib")
X_df = build_features(pd.read_csv("data/test.csv"))
X = X_df.to_numpy(dtype=np.float32)

onx = to_onnx(model, X[:1])                           # trace the trees into ONNX operators
open("model/eta.onnx", "wb").write(onx.SerializeToString())

sess = ort.InferenceSession("model/eta.onnx")         # onnxruntime: no sklearn needed
name = sess.get_inputs()[0].name
onnx_pred = sess.run(None, {name: X})[0].ravel()
skl_pred = model.predict(X_df)
print("largest difference vs scikit-learn:", round(float(np.abs(onnx_pred - skl_pred).max()), 5), "min")
print("file size: joblib", os.path.getsize("model/v2.joblib") // 1024, "KB, onnx",
      os.path.getsize("model/eta.onnx") // 1024, "KB")

def per_call_ms(fn, n=300):
    t0 = time.perf_counter()
    for _ in range(n):
        fn()
    return (time.perf_counter() - t0) / n * 1000
one, one_df = X[:1], X_df.iloc[:1]
print(f"one order: scikit-learn {per_call_ms(lambda: model.predict(one_df)):.3f} ms, "
      f"onnxruntime {per_call_ms(lambda: sess.run(None, {name: one})):.3f} ms")</div>
  <div class="fx" data-lang="text">largest difference vs scikit-learn: 1e-05 min
file size: joblib 229 KB, onnx 77 KB
one order: scikit-learn 0.807 ms, onnxruntime 0.011 ms</div>
  <p>Three things to read from this. The ONNX model's predictions match scikit-learn's to within a hundred-thousandth of a minute on all 550 test orders, which is the check you should always run after converting, since a conversion can silently change results. The ONNX file is about a third of the size. And a single prediction is dozens of times faster in ONNX Runtime, because it skips scikit-learn's Python-level input checking. Note that only the model was converted here, so a server using this file must still compute the seven feature columns itself; skl2onnx can also convert many preprocessing steps into the graph, which restores the "one box" property. ONNX is the usual choice for edge deployment, for serving from non-Python services, and when single-request latency matters; joblib is simpler when everything is Python and the source is trusted. Deep-learning models have equivalents: PyTorch's <code>torch.export</code> and TorchScript, TensorFlow's SavedModel, and further optimisation with quantisation (storing weights as 8-bit integers) for small devices.</p>
  <p>Finally the model, its preprocessing and the exact library versions are packaged together with the serving code into a container image, so that the same box runs on a laptop, in CI and in production. Building and testing that image automatically is covered in <a class="xref" data-note="mlops_cicd">CI/CD for ML</a>.</p>

  <h2 id="dp-release"><span class="num">06</span>Release Strategies</h2>
  <p>Biteful eventually trains version 3. It passed every offline test and the gate against version 2. Should it now replace version 2 for every customer at the same moment? Offline tests are run on past data; live traffic contains things the test set does not, from new restaurants to a broken upstream service to a subtle bug in how the new version's features are computed in production. A release strategy is a plan for exposing a new version to real traffic in a controlled way, so that if something is wrong, few customers are affected and the problem is noticed quickly. There are five strategies worth knowing, and they differ in one thing: how much live traffic the new version gets, and when.</p>
  <figure class="viz"><svg viewBox="0 0 660 320" width="660">
<text x="120" y="18" font-size="10.5" class="tm">t0</text><text x="224" y="18" font-size="10.5" class="tm">t1</text><text x="328" y="18" font-size="10.5" class="tm">t2</text><text x="432" y="18" font-size="10.5" class="tm">t3</text><text x="536" y="18" font-size="10.5" class="tm">t4 →  time</text>
<g stroke="currentColor" stroke-opacity="0.35">
<rect x="120" y="28" width="520" height="40" class="fs"/><rect x="120" y="80" width="520" height="40" class="fs"/><rect x="120" y="132" width="520" height="40" class="fs"/><rect x="120" y="184" width="520" height="40" class="fs"/><rect x="120" y="236" width="520" height="40" class="fs"/>
</g>
<text x="10" y="45" font-size="12" font-weight="700">Rolling</text><text x="10" y="60" font-size="9.5" class="tm">copies replaced in turn</text>
<rect x="224" y="55" width="104" height="13" class="fg"/><rect x="328" y="41" width="104" height="27" class="fg"/><rect x="432" y="28" width="208" height="40" class="fg"/>
<text x="10" y="97" font-size="12" font-weight="700">Blue-green</text><text x="10" y="112" font-size="9.5" class="tm">switch all at once</text>
<rect x="328" y="80" width="312" height="40" class="fg"/><text x="230" y="104" font-size="9.5" class="tm">green warms up idle</text><text x="440" y="104" font-size="9.5">blue kept ready to switch back</text>
<text x="10" y="149" font-size="12" font-weight="700">Canary</text><text x="10" y="164" font-size="9.5" class="tm">5% → 25% → 50% → 100%</text>
<rect x="224" y="170" width="104" height="2" class="fg"/><rect x="328" y="162" width="104" height="10" class="fg"/><rect x="432" y="152" width="104" height="20" class="fg"/><rect x="536" y="132" width="104" height="40" class="fg"/>
<text x="232" y="160" font-size="9.5" class="tm">check</text><text x="336" y="155" font-size="9.5" class="tm">check</text><text x="440" y="146" font-size="9.5" class="tm">check</text>
<text x="10" y="201" font-size="12" font-weight="700">Shadow</text><text x="10" y="216" font-size="9.5" class="tm">users see 0% of new</text>
<rect x="224" y="186" width="416" height="36" fill="none" stroke="currentColor" stroke-dasharray="5 4"/><text x="250" y="208" font-size="9.5">copy of 100% of requests sent to new model; its answers are logged, never returned</text>
<text x="10" y="253" font-size="12" font-weight="700">A/B test</text><text x="10" y="268" font-size="9.5" class="tm">fixed split, then decide</text>
<rect x="224" y="256" width="312" height="20" class="fg"/><rect x="536" y="236" width="104" height="40" class="fg"/><text x="250" y="250" font-size="9.5" class="tm">50 / 50 for the experiment</text><text x="544" y="250" font-size="9.5">winner</text>
<rect x="120" y="292" width="14" height="12" class="fs" stroke="currentColor" stroke-opacity="0.35"/><text x="140" y="302" font-size="10">old version's share of live traffic</text>
<rect x="340" y="292" width="14" height="12" class="fg"/><text x="360" y="302" font-size="10">new version's share (height = %)</text>
</svg><figcaption>Five release strategies on one timeline. Each band is 100% of live traffic; the green area is the share answered by the new version.</figcaption></figure>
  <p>Read each band of the figure as all of Biteful's traffic over time, with the green area showing how much of it the new version answers. A <strong>rolling update</strong> replaces the running copies of the server one at a time: with three copies, one is swapped for the new version, then the next, then the last, so the new version's share climbs in steps (a third, two thirds, all) and there are always copies answering. It is the default in Kubernetes and needs no extra machines, but for a while both versions serve at once, and rolling back means rolling through the copies again. A <strong>blue-green deployment</strong> runs a complete second copy of the service (green, the new version) next to the live one (blue). Green is started and tested while receiving no customers, then all traffic is switched to it in one step by changing the router or load balancer. Blue stays running, so rolling back is a single switch in the other direction. The cost is double the machines during the release, and the switch, though instant, still moves every customer at once.</p>
  <p>A <strong>canary release</strong> sends a small share of live traffic, say 5%, to the new version, compares its health and quality with the old version, and increases the share in steps (25%, 50%, 100%) only while the checks stay green. The name comes from the canaries coal miners carried underground: the bird reacted to poisonous gas before the miners did, giving an early warning while only a small creature was at risk. A <strong>shadow deployment</strong> (also called a dark launch) goes further in caution: the new version receives a copy of every live request and makes predictions, but its answers are only logged, never returned, so customers are not affected at all. Finally an <strong>A/B test</strong> splits users between versions in fixed proportions for a planned period in order to <em>measure</em> which one is better for a business metric, such as orders completed or customer complaints, with proper statistics (<a class="xref" data-note="st_abtesting">A/B Testing</a> covers sample sizes and significance). A canary asks "is the new version safe?"; an A/B test asks "is it better for the business?".</p>
  <p>Shadow and canary are the two strategies ML teams lean on most, because they test a model on real traffic. Here is a shadow run from the day version 2 was being considered to replace version 1, using 200 real orders whose delivery times later became known:</p>
  <div class="fx" data-lang="py"># shadow deployment: the new model sees real traffic, but customers only see the old one
import joblib, pandas as pd
from features import build_features

live, shadow = joblib.load("model/v1.joblib"), joblib.load("model/v2.joblib")
traffic = pd.read_csv("data/test.csv").head(200)          # 200 real requests
X = build_features(traffic)

returned = live.predict(X)                                # what the app shows
shadow_pred = shadow.predict(X)                           # computed and logged, never shown
gap = abs(returned - shadow_pred)
print(f"customers saw only the live model; shadow disagreed by {gap.mean():.2f} min on average, "
      f"max {gap.max():.1f} min")
# later, when the real delivery times arrive, both can be scored on the same orders
print(f"live MAE {abs(returned - traffic.minutes).mean():.2f}  vs  shadow MAE {abs(shadow_pred - traffic.minutes).mean():.2f}")</div>
  <div class="fx" data-lang="text">customers saw only the live model; shadow disagreed by 1.08 min on average, max 5.3 min
live MAE 2.67  vs  shadow MAE 2.31</div>
  <p>Customers saw only version 1's answers. Meanwhile version 2 disagreed by about a minute on average and by more than five minutes on its worst order, which is worth investigating before a release, and once the real times arrived, version 2's error on the same orders was clearly lower (2.31 against 2.67). A shadow run can also catch problems an offline test never would, such as a feature that is missing in production and makes the shadow's predictions wildly different. Its limits are cost (every request is predicted twice) and that it cannot measure anything that depends on users seeing the new answer, such as whether shorter quoted ETAs lead to more orders. That needs a canary or an A/B test.</p>
  <p>Now version 3 goes out as a canary. In this simulation version 3 secretly has a problem (it is the weak "shallow forest" from the CI/CD note), and 550 orders with known outcomes stand in for live traffic. Each order is routed by hashing its ID, so the same customer always lands on the same version instead of flickering between two ETAs, and the rule for stopping was written down before the release began:</p>
  <div class="fx" data-lang="py"># a canary release, simulated on 550 orders whose real delivery times we know
import hashlib, joblib, pandas as pd
from features import build_features

models = {"v2": joblib.load("model/v2.joblib"),           # the live champion
          "v3": joblib.load("model/v3.joblib")}           # a new release with a hidden problem
traffic = pd.read_csv("data/test.csv").reset_index(names="order_id")

def route(order_id, canary_percent):
    # hash the id so the same customer always lands on the same version
    bucket = int(hashlib.md5(str(order_id).encode()).hexdigest(), 16) % 100
    return "v3" if bucket &lt; canary_percent else "v2"

def serve(canary_percent):
    t = traffic.copy()
    t["version"] = [route(i, canary_percent) for i in t.order_id]
    for v, m in models.items():
        rows = t.version == v
        if rows.any():
            t.loc[rows, "eta"] = m.predict(build_features(t[rows]))
    t["error"] = (t.eta - t.minutes).abs()
    return t.groupby("version").agg(orders=("error", "size"), mae=("error", "mean")).round(2)

for step in [5, 25]:
    report = serve(step)
    print(f"--- canary at {step}% ---")
    print(report.to_string())
    if report.loc["v3", "mae"] &gt; 1.1 * report.loc["v2", "mae"]:   # the rollback rule, decided in advance
        print("v3 is more than 10% worse -&gt; set canary to 0%, everyone back on v2")
        break</div>
  <div class="fx" data-lang="text">--- canary at 5% ---
         orders   mae
version              
v2          513  2.31
v3           37  4.68
v3 is more than 10% worse -&gt; set canary to 0%, everyone back on v2</div>
  <p>At the 5% step, hashing sent 37 of the 550 orders to version 3 (hashing gives roughly, not exactly, the requested share). Their average error was 4.68 minutes against 2.31 for version 2, far beyond the agreed 10% tolerance, so the release stopped at its first step and the share went back to zero. Only those 37 orders ever saw a bad ETA; with an all-at-once switch it would have been all 550. Two practical points follow. In a real canary the true delivery times arrive only after the food does, so early steps watch fast signals (errors, latency, the distribution of predicted ETAs compared with version 2's) and quality metrics are checked as labels come in. And with only 37 orders a small difference would be indistinguishable from noise; here the gap is large, but deciding a close call needs enough traffic, which is why canary steps last long enough to collect it.</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>New version gets</th><th>Main benefit</th><th>Main cost</th><th>Rollback</th></tr>
    <tr><td>Rolling</td><td>growing share as copies are replaced</td><td>no extra machines; Kubernetes default</td><td>two versions live at once; slow to undo</td><td>roll through copies again</td></tr>
    <tr><td>Blue-green</td><td>0% then 100%</td><td>instant switch; old copy ready</td><td>double capacity; everyone moves at once</td><td>switch back</td></tr>
    <tr><td>Canary</td><td>5% → 25% → 50% → 100%</td><td>limits harm; real-traffic evidence</td><td>needs routing and per-version metrics</td><td>set share to 0%</td></tr>
    <tr><td>Shadow</td><td>a copy of traffic, answers hidden</td><td>zero customer risk</td><td>double compute; no user-facing effects measured</td><td>nothing to undo</td></tr>
    <tr><td>A/B test</td><td>fixed split for a period</td><td>measures business impact statistically</td><td>slow; needs enough users</td><td>end the experiment</td></tr>
  </table>
  <p>In practice they are combined. A typical careful path for a new model is shadow first (does it behave sensibly on real inputs?), then a canary (is it safe for real users?), then, if the change is meant to move a business metric, an A/B test before it becomes the default; underneath, Kubernetes moves the actual server copies with rolling updates. <a class="xref" data-note="sd_serving">Serving: Features, Latency, Shadow &amp; Canary</a> treats these from the system-design side.</p>

  <h2 id="dp-rollback"><span class="num">07</span>Rollback</h2>
  <p>Every strategy in the previous section ends with the same safety net: if the new version is bad, go back to the old one, quickly. "Quickly" is the key word. If a rollback requires retraining the old model, rebuilding an image or remembering which settings were used three weeks ago, it will take hours, and customers will see wrong ETAs the whole time.</p>
  <p>A <strong>rollback</strong> is restoring the previous known-good version of one part of the system, and the way to make it fast is to design every part so that rollback is <em>moving a pointer</em>, not rebuilding anything. Every version stays stored; only the reference to "which version is live" changes. A cinema works this way: tonight's film is whichever reel is loaded in the projector, and if the new reel turns out to be damaged, the projectionist puts last week's reel back in, which is still on the shelf, rather than re-shooting the film.</p>
  <div class="fx" data-lang="py"># rollback is moving a pointer: every version stays stored, only "which one is live" changes
registry = {"1": "random forest", "2": "gradient boosting", "3": "shallow forest"}
history = []                                  # every pointer move is recorded
live = {"champion": "2"}

def promote(version):
    history.append(live["champion"])
    live["champion"] = version
    print(f"champion -&gt; v{version} ({registry[version]})")

def rollback():
    live["champion"] = history.pop()          # nothing is rebuilt or retrained
    print(f"rolled back: champion -&gt; v{live['champion']} ({registry[live['champion']]})")

promote("3")
rollback()
print("versions still stored:", list(registry))</div>
  <div class="fx" data-lang="text">champion -&gt; v3 (shallow forest)
rolled back: champion -&gt; v2 (gradient boosting)
versions still stored: ['1', '2', '3']</div>
  <p>The simulation is deliberately tiny because the idea is: promoting version 3 moved the <code>champion</code> pointer from 2 to 3 and remembered the old value; rolling back moved it to 2 again; all three versions remained in storage throughout. Real systems have exactly this structure, with one pointer at each layer. In the MLflow model registry the pointer is an alias (<code>client.set_registered_model_alias("biteful-eta", "champion", "2")</code>, see <a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a>). For a container, it is the image tag a deployment runs, and Kubernetes keeps previous revisions so <code>kubectl rollout undo deployment/biteful-eta</code> restores the last one. In a blue-green setup it is the router's target; in a canary it is the traffic share, set back to 0%.</p>
  <p>Three habits make rollback actually work when it is needed. First, every prediction should record the model version that produced it (that is why the real-time function returned <code>model_version</code>), so when a complaint arrives you can see which version answered and compare versions in monitoring. Second, the rollback rule should be decided <em>before</em> the release, as in the canary code ("more than 10% worse → back to 0%"), so nobody has to argue during an incident. Third, the old version must remain able to run: if version 3 needs a new feature and the team deletes the code that computed version 2's features, version 2 can no longer be fed, and the "rollback" is impossible. Keep the old model and its feature code alive until the new version has been stable for a while.</p>

  <h2 id="dp-fit"><span class="num">08</span>Where CI/CD, Serving, Kubernetes and Cloud Fit</h2>
  <p>So far this note has treated deployment as a set of decisions. In a real company those decisions are carried out by four layers of tooling, each covered by its own note in this track. It helps to see how they stack, from the code change to the machine.</p>
  <p><a class="xref" data-note="mlops_cicd">CI/CD for ML</a> is the entry point. Every change to the code, and every newly trained candidate model, passes the same automated checks: tests on code, data and model behaviour, and a gate that compares the candidate with the live champion. Only then is the model packaged, with its preprocessing and pinned libraries, into a container image tagged with the commit ID. That image is the artifact every later layer deploys, and the gate is where "is this version good enough to release at all?" is answered.</p>
  <p><a class="xref" data-note="mlops_serving">Model Serving &amp; Inference</a> is what runs inside that image: the real-time server with input validation, a model loaded once at start-up, health and readiness endpoints, the model version in every response, and tools for optimised formats such as ONNX. It is also where serving frameworks such as BentoML, KServe and Seldon fit, and where shadow and canary logic can be implemented in the application itself.</p>
  <p><a class="xref" data-note="mlops_k8s">Kubernetes for ML</a> runs many copies of the server, restarts crashed ones, adds copies when the lunch rush arrives and removes them afterwards, and performs the release strategies at the infrastructure level: rolling updates are built in, blue-green is a switch of a Service's selector, and canaries are traffic weights in a service mesh or a tool such as Argo Rollouts. Its revision history is one of the pointers rollback moves.</p>
  <p><a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a> provides the machines and managed services underneath: clusters, GPUs, storage for models and data, and managed alternatives such as SageMaker or Vertex AI endpoints that bundle serving, scaling and traffic splitting into one product. Infrastructure as code (Terraform) makes those resources reproducible and versioned too. For batch and streaming patterns, the same layers apply with a scheduler (Airflow) or a stream processor in place of the always-on server.</p>
  <p>The thread running through all four is the one this note keeps returning to: every layer has a version (a commit, a registry version, an image tag, a deployment revision, an infrastructure state), so any prediction can be traced back to what produced it, and any layer can be rolled back by moving its pointer. After deployment comes watching: <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a> covers how live data and accuracy are tracked and how retraining is triggered, which feeds new candidates back into CI/CD.</p>

  <h2 id="dp-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The most common deployment bug is re-implementing preprocessing in the server. As section 05 showed, a hand-written copy of the feature code can produce different columns or different values from training, sometimes with an error, often silently. Ship preprocessing and model together in one pipeline object, or import one shared feature module in both places:</p>
  <div class="fx" data-lang="py"># risky: the server re-creates features its own way
X = pd.get_dummies(request_df, columns=["restaurant"])
eta = model.predict(X)

# safe: one object holds preprocessing + model, trained and saved together
eta = pipeline.predict(request_df)</div>
  <p>Second, loading the model inside the request handler. Every request then pays the loading cost, several times the prediction itself in section 03. Load once at start-up and report "ready" only after loading has finished.</p>
  <p>Third, loading pickle or joblib files from untrusted sources. Loading alone can run code. Load only from your own registry or storage, and prefer ONNX or other data-only formats when files cross trust boundaries.</p>
  <p>Fourth, choosing real-time serving by default. An always-on, autoscaled API is the most expensive and demanding pattern; if predictions can be computed in advance, a batch job is cheaper and simpler.</p>
  <p>Fifth, switching all traffic at once with no way back. Release new models through shadow and canary steps, with stopping rules agreed beforehand, and keep the previous version deployable. Related to this: not recording the model version in responses and logs, which makes it impossible to tell which version caused a complaint or to compare versions during a canary.</p>
  <p>Finally, deleting the old feature code or model as soon as the new one is live. Rollback then needs a rebuild or a retrain, which is not a rollback. Keep both alive until the new version has proven itself.</p>

  <h2 id="dp-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Model deployment</b>: taking a validated model version to reliable, observable, reversible use in production.</li>
    <li><b>Batch inference</b>: score many inputs at once on a schedule; store predictions for lookup.</li>
    <li><b>Real-time (online) inference</b>: a service answers each request immediately, in milliseconds.</li>
    <li><b>Streaming inference</b>: a consumer scores each event from a queue as it arrives.</li>
    <li><b>Edge inference</b>: the model runs on the user's device.</li>
    <li><b>Training-serving skew</b>: features computed differently in training and in serving.</li>
    <li><b>ONNX</b>: portable graph format for models, run by ONNX Runtime in many languages.</li>
    <li><b>Rollback</b>: restore the previous known-good version of one layer by moving a pointer.</li>
  </ul>
  <h3>Inference patterns</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Use when</th><th>Avoid when</th></tr>
    <tr><td>Batch</td><td>inputs known in advance; staleness OK</td><td>answer depends on request-time inputs</td></tr>
    <tr><td>Real-time</td><td>inputs known only at request time; user waiting</td><td>answers could be precomputed</td></tr>
    <tr><td>Streaming</td><td>events should trigger predictions within seconds</td><td>no event source; requests suffice</td></tr>
    <tr><td>Edge</td><td>offline, ultra-low latency, privacy</td><td>model too big; must update instantly</td></tr>
  </table>
  <h3>Release strategies</h3>
  <table class="tbl">
    <tr><th>Strategy</th><th>One line</th><th>Rollback</th></tr>
    <tr><td>Rolling</td><td>replace copies one at a time</td><td>roll back through copies</td></tr>
    <tr><td>Blue-green</td><td>full new copy, switch all traffic at once</td><td>switch back</td></tr>
    <tr><td>Canary</td><td>small % first, grow while healthy</td><td>share to 0%</td></tr>
    <tr><td>Shadow</td><td>new model gets a copy of traffic, answers hidden</td><td>nothing to undo</td></tr>
    <tr><td>A/B</td><td>fixed split to measure business impact</td><td>end experiment</td></tr>
  </table>
  <h3>Formats</h3>
  <table class="tbl">
    <tr><th></th><th>pickle / joblib</th><th>ONNX</th></tr>
    <tr><td>Runs in</td><td>Python with the same library versions</td><td>ONNX Runtime: Python, C++, Java, JS, mobile</td></tr>
    <tr><td>Safety</td><td>loading can execute code</td><td>data only</td></tr>
    <tr><td>Speed</td><td>library speed</td><td>often much faster for single rows</td></tr>
    <tr><td>Check</td><td>pin versions</td><td>compare predictions after converting</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py"># one object: preprocessing + model
pipe = Pipeline([("prep", ColumnTransformer([("rest", OneHotEncoder(handle_unknown="ignore"), ["restaurant"])],
                                            remainder="passthrough")),
                 ("model", GradientBoostingRegressor())]).fit(X_raw, y)
joblib.dump(pipe, "eta_pipeline.joblib")

# ONNX export and run
onx = to_onnx(model, X[:1].astype("float32"))
sess = onnxruntime.InferenceSession(onx.SerializeToString())
pred = sess.run(None, {sess.get_inputs()[0].name: X.astype("float32")})[0]

# canary routing: sticky by id
bucket = int(hashlib.md5(str(user_id).encode()).hexdigest(), 16) % 100
version = "new" if bucket &lt; canary_percent else "old"</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Ship preprocessing with the model; never re-implement it in the server.</li>
    <li>Load the model once at start-up, not per request.</li>
    <li>Never unpickle untrusted files.</li>
    <li>Choose the simplest pattern that meets the requirement.</li>
    <li>Canary asks "safe?"; A/B asks "better for the business?".</li>
    <li>Return the model version in every response; agree rollback rules in advance.</li>
    <li>Keep the old model and its feature code alive during a release.</li>
  </ul>

  <h2 id="dp-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are the main ways to serve predictions from a model?</summary><div class="qa-body">Batch (score many inputs on a schedule and store the results), real-time or online (a service answers each request in milliseconds), streaming (a consumer scores events from a queue as they arrive), and edge (the model runs on the user's device). They differ in when the prediction is made and where the model runs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Batch vs real-time inference: how do you choose?</summary><div class="qa-body">Ask whether the inputs are known in advance and whether a slightly stale answer is acceptable. If yes, batch is cheaper and simpler: no always-on servers, no latency target. If the inputs only exist at request time (a specific basket and address) and the user is waiting, you need real-time. Many systems are hybrid: precompute slow-changing parts in batch, compute the request-specific part online.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is streaming inference the right choice?</summary><div class="qa-body">When events rather than requests should trigger predictions and the value of the prediction decays within seconds: fraud checks on transactions, live ETA updates when conditions change, sensor anomaly detection. It needs a queue such as Kafka, stateful consumers, and handling of failures so events are neither lost nor processed twice.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the trade-offs of edge deployment?</summary><div class="qa-body">Benefits: lowest latency, works offline, data stays on the device, no server cost per prediction. Costs: the model must be small and fast for weak hardware (often converted to ONNX, TensorFlow Lite or Core ML and quantised), updates require shipping a new app or model download, and many versions run in the wild at once, which complicates monitoring.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is training-serving skew, and how do you prevent it?</summary><div class="qa-body">It is a difference between how features are computed during training and during serving, so the model receives inputs unlike those it learned from, often without any error. Prevent it by packaging preprocessing with the model (a scikit-learn Pipeline), sharing one feature module, using a feature store for shared features, and logging served features to compare with training data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why save preprocessing and the model as one artifact?</summary><div class="qa-body">So they are trained, versioned, shipped and rolled back together and the server cannot use a mismatched version of either. The server then only loads one file and passes raw inputs, which removes a whole class of skew bugs and makes handling of unseen categories consistent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pickle/joblib vs ONNX: when would you use each?</summary><div class="qa-body">joblib is the simplest for a trusted, all-Python stack, but it needs matching library versions and loading it can execute code. ONNX stores the model as a portable graph run by ONNX Runtime from many languages and devices, is data-only, and is often faster for single predictions. Use ONNX for edge, non-Python services or latency-critical serving, and always verify converted predictions against the original.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is loading a pickle from an untrusted source dangerous?</summary><div class="qa-body">A pickle records how to rebuild an object, and that recipe can name any function to call with any arguments. Simply loading the file runs it, so a malicious model file can execute arbitrary commands on the server. Only load pickles from your own trusted storage or registry.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain rolling, blue-green and canary deployments.</summary><div class="qa-body">Rolling replaces running copies one at a time, so both versions serve briefly and no extra capacity is needed. Blue-green runs a full new environment beside the old one and switches all traffic at once, keeping the old one ready for an instant switch back. Canary sends a small share of traffic to the new version, compares metrics with the old, and increases the share step by step only while it stays healthy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is shadow deployment and what can't it tell you?</summary><div class="qa-body">The new model receives a copy of live requests and its predictions are logged but never returned, so users are unaffected. It reveals crashes, latency and prediction differences on real inputs, and accuracy once labels arrive. It cannot measure effects that depend on users seeing the new predictions, such as conversion, and it doubles inference cost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Canary release vs A/B test: what's the difference?</summary><div class="qa-body">A canary is a safety mechanism: expose a small share, watch health and quality, and roll forward or back quickly. An A/B test is an experiment: a fixed split for a planned period with enough users to measure a business metric with statistical significance. They can be combined: canary first for safety, then an A/B test to decide whether the new model is actually better.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why route canary traffic by hashing a user or order ID instead of at random?</summary><div class="qa-body">Hashing is sticky: the same user always gets the same version, so they don't see inconsistent answers between requests, and per-version metrics aren't mixed within a user. It is also reproducible and needs no stored assignment table; the share is approximate on small samples.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you make rollback fast?</summary><div class="qa-body">Keep every version stored and make "live" a pointer at each layer: a registry alias, an image tag in a deployment revision, a router target or a canary weight. Rollback moves the pointer back without rebuilding or retraining. Decide rollback rules before releasing, record the model version in every response, and keep the old model's feature code deployable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A new model is live and a key metric dropped 8%. What do you do?</summary><div class="qa-body">Restore service first: move traffic back (canary to 0%, blue-green switch back, <code>kubectl rollout undo</code>, or move the registry alias), and confirm the metric recovers. Then investigate using per-version logs: compare inputs and predictions of both versions, check for training-serving skew or a data problem, fix, and re-release through the gate and a canary.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What metrics would you watch during a model canary?</summary><div class="qa-body">System health per version (error rate, p95/p99 latency, resource use), prediction distribution compared with the old version (a sudden shift hints at skew), business or proxy metrics (orders, complaints), and model quality as labels arrive. Each needs a pre-agreed threshold and enough traffic to separate real differences from noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do CI/CD, Kubernetes and a model registry fit in a deployment?</summary><div class="qa-body">The registry stores model versions and marks which is champion. CI/CD tests a candidate, gates it against the champion and builds a versioned image containing model, preprocessing and server. Kubernetes (or a managed endpoint) runs replicas of that image, scales them and performs rolling, blue-green or canary releases. Each keeps its own version history, so each can be rolled back.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you deploy an ETA model for a food-delivery app end to end?</summary><div class="qa-body">Precompute rough ETAs per restaurant and distance band in a batch job for listing pages; serve checkout ETAs in real time from a containerised API with the preprocessing pipeline inside; use streaming to update open orders when conditions change. Release new models via CI/CD and the gate, then shadow, then canary with pre-agreed thresholds, on Kubernetes with autoscaling; log the model version with each prediction, monitor drift and live error, and keep rollback as a pointer move.</div></details>
</main>
`
});
