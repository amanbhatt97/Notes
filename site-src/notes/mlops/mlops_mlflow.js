// notes/mlops/mlops_mlflow.js — MLflow & Experiment Tracking
Object.assign(TOPIC_CONTENT, {
  "mlops_mlflow": `<main>
  <h1>MLflow &amp; Experiment Tracking</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>MLflow &amp; Experiment Tracking</span></div>
  <p class="lead">Every model you train should leave a receipt behind: which code and data it came from, which settings were used, what it scored, and where the model file is. <strong>Experiment tracking</strong> is the practice of writing those receipts automatically, and <strong>MLflow</strong> is the most widely used open-source tool for it. It also searches the receipts, stores trained models in a registry with version numbers, and lets the app ask for "the production model" by name instead of by a renamed file. This matters in real work because ML teams run hundreds of experiments, must hand the winner to engineers without losing its history, and must be able to roll back a bad model in minutes. This note continues the Biteful delivery-time project from <a class="xref" data-note="mlops_lifecycle">The ML Lifecycle</a>: the same 2,198 clean orders, the same seven features, the same six Monday orders. We will log Biteful's training runs, search them, tune a better model with Optuna, register it, serve it, and check that it can be rebuilt. Everything below was run locally with MLflow 3.18, Optuna 5.1 and scikit-learn 1.9, using a SQLite database as the tracking store, and the outputs are pasted as they came.</p>

  <h2 id="mf-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">MLflow &amp; Experiment Tracking</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Tracking</div>
        <ul>
          <li><b>Experiment</b> groups <b>runs</b>; a run is one training execution</li>
          <li><b>Params</b> (settings, stored as strings), <b>metrics</b> (numbers with steps)</li>
          <li><b>Artifacts</b> (files, the model), <b>tags</b> (git SHA, data hash)</li>
          <li><code>autolog()</code> records everything, but its scores are on training data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Comparing and tuning</div>
        <ul>
          <li><code>search_runs</code> returns a DataFrame you can filter and sort</li>
          <li>Optuna: study, trial, objective; TPE learns where good settings are</li>
          <li>Pruning stops trials worse than the median at the same step</li>
          <li>Tune on validation, check once on test</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Registry</div>
        <ul>
          <li>Registered model = one name; <b>versions</b> 1, 2, 3 never change</li>
          <li><b>Aliases</b> (<code>@champion</code>) move; rollback = move the alias back</li>
          <li>Stages (Staging/Production) are deprecated since 2.9</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Serving and reproducing</div>
        <ul>
          <li><code>pyfunc.load_model("models:/biteful-eta@champion")</code></li>
          <li>The <b>signature</b> rejects requests with the wrong columns</li>
          <li>Seed + git SHA + data hash + logged environment = rebuildable</li>
          <li>Teams share one tracking server: database + object storage</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mf-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Track Experiments</span><span class="rm-sub">"which run got 0.86?" and a homemade answer</span></div></div>
      <div class="rm-item rm-done" data-target="mf-concepts"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Runs, Params, Metrics &amp; Artifacts</span><span class="rm-sub">what a receipt contains, and where it is stored</span></div></div>
      <div class="rm-item rm-done" data-target="mf-log"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Logging Real Training Runs</span><span class="rm-sub">four forests, tags, artifacts, the model and its signature</span></div></div>
      <div class="rm-item rm-done" data-target="mf-auto"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Autologging</span><span class="rm-sub">one line that records everything, and its catch</span></div></div>
      <div class="rm-item rm-done" data-target="mf-compare"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Comparing Runs</span><span class="rm-sub">searching receipts like a table</span></div></div>
      <div class="rm-item rm-done" data-target="mf-optuna"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Hyperparameter Search with Optuna</span><span class="rm-sub">smarter search and early stopping of bad trials</span></div></div>
      <div class="rm-item rm-done" data-target="mf-reg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Model Registry</span><span class="rm-sub">versions, aliases, promotion and rollback</span></div></div>
      <div class="rm-item rm-done" data-target="mf-serve"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Loading &amp; Serving a Model</span><span class="rm-sub">pyfunc, signatures and the command line</span></div></div>
      <div class="rm-item rm-done" data-target="mf-repro"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Reproducibility</span><span class="rm-sub">seeds and the logged environment</span></div></div>
      <div class="rm-item rm-done" data-target="mf-setup"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">A Shared Tracking Server</span><span class="rm-sub">how a team and CI share runs and models</span></div></div>
      <div class="rm-item rm-done" data-target="mf-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">open runs, training scores, string params</span></div></div>
      <div class="rm-item rm-done" data-target="mf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">APIs, registry table, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="mf-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">tracking, tuning and registry questions</span></div></div>
    </div>
  </div>

  <h2 id="mf-why"><span class="num">01</span>Why Track Experiments</h2>
  <p>The lifecycle note made any single Biteful model rebuildable: code in Git, data in DVC, settings in a Hydra config. But Ravi ran dozens of training runs last week, trying different depths, tree counts and seeds, and now he writes in the team chat: "one of my runs got R² 0.86, which settings was that?" Nothing we have built so far can answer him. Git knows the code, DVC knows the data, and Hydra left a folder per run, but there is no single place that lists all runs with their scores so you can search across them. A week of tuning without such a place usually leaves a folder like this, with scores scattered across chat messages:</p>
  <div class="fx" data-lang="text">model.joblib
model_v2.joblib
model_final.joblib
model_final_v3_REAL.joblib
scores.xlsx        # half the rows say "forgot to note the depth"</div>
  <p>The fix is easy to state: every training run writes a <strong>receipt</strong> automatically at the moment it trains, so nothing depends on anyone's memory. A receipt has three parts: the inputs (settings, data version, code version), the results (scores) and the outputs (the model file and anything else worth keeping). A chemist's lab notebook is the classic picture. Each experiment gets its own page listing the ingredients and quantities, the conditions, the results and the label of the sample jar on the shelf. Nobody trusts a chemist who says "I think I used about five grams", and nobody should trust an ML engineer who says "I think it was depth five".</p>
  <p>You could build a tiny receipt system yourself. The code below appends one JSON line per run to a file, using the three Hydra sweep results from the lifecycle note, and then picks the best run by MAE (mean absolute error, the average number of minutes a prediction is off by; lower is better):</p>
  <div class="fx" data-lang="py">import json, time

def log_run(params, metrics, model_file):
    receipt = {"time": time.strftime("%Y-%m-%d"), "params": params,
               "metrics": metrics, "model_file": model_file}
    with open("runs.jsonl", "a") as f:                 # one line per training run
        f.write(json.dumps(receipt) + "\\n")

# the three Hydra sweep runs from the lifecycle note, written down as receipts
log_run({"trees": 100, "depth": 4, "data": "orders v2"}, {"mae": 3.708, "r2": 0.808}, "model_a.joblib")
log_run({"trees": 100, "depth": 8, "data": "orders v2"}, {"mae": 2.611, "r2": 0.902}, "model_b.joblib")
log_run({"trees": 100, "depth": 12, "data": "orders v2"}, {"mae": 2.71, "r2": 0.892}, "model_c.joblib")

runs = [json.loads(line) for line in open("runs.jsonl")]
best = min(runs, key=lambda r: r["metrics"]["mae"])
print(len(runs), "receipts; best:", best["model_file"], best["params"], best["metrics"])</div>
  <div class="fx" data-lang="text">3 receipts; best: model_b.joblib {'trees': 100, 'depth': 8, 'data': 'orders v2'} {'mae': 2.611, 'r2': 0.902}</div>
  <p>Even this beats the spreadsheet: the best run is depth 8 on data v2, MAE 2.611, and the receipt says which file holds it. But it breaks down quickly. Ten people cannot safely append to one file on one laptop. There is no way to record a score at every step of training to see a learning curve. Model files still float around loose, nothing records the code version, and there is no safe way to say "this one is in production". <strong>MLflow</strong> is the same idea done properly: a database of receipts, a store for files, a search API, a web interface, and a registry for the models that go live. Its main competitors, Weights &amp; Biases, Neptune and Comet, work the same way, so the ideas in this note transfer directly. Interviewers ask about tracking in almost every MLOps round, usually as "how do you track experiments?" and "how would you roll back a bad model?"; by the end of this note you will be able to answer both with examples.</p>

  <h2 id="mf-concepts"><span class="num">02</span>Runs, Params, Metrics &amp; Artifacts</h2>
  <p>"Receipt" is a metaphor; MLflow has precise names for the parts. A <strong>run</strong> is the record of one execution of training: one run, one receipt. A run holds <strong>params</strong> (parameters), which are the settings you chose before training, like <code>max_depth</code>, each logged once. It holds <strong>metrics</strong>, which are numbers the training produced, like MAE; a metric can be logged many times with a <strong>step</strong> number, which turns it into a curve. It holds <strong>artifacts</strong>, which are any files the run produced: a plot, a CSV, the model itself. And it holds <strong>tags</strong>, small free-text notes such as who ran it, the Git SHA and the data version. Runs are grouped into an <strong>experiment</strong>, a named collection of runs for one problem, such as "biteful-eta".</p>
  <p>A school report card makes the structure easy to remember. The experiment is "Class 10 board preparation". Each run is one mock test. The params are the conditions you set beforehand (open book or closed, three hours or two). The metrics are the marks, and a weekly marks log across the term is a metric with steps. The artifacts are the answer sheets kept in the file, and the tags are notes in the margin like "written while ill". A simple rule settles the most common confusion: if you chose it before training, it is a param; if training produced it, it is a metric. "Number of trees" is a param even though it is a number.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <rect x="10" y="60" width="120" height="44" rx="6" class="fv" stroke="currentColor"/><text x="70" y="80" text-anchor="middle">Experiment</text><text x="70" y="96" text-anchor="middle" class="tm" font-size="11">biteful-eta</text>
    <rect x="170" y="15" width="110" height="34" rx="6" class="fb sb"/><text x="225" y="36" text-anchor="middle">run rf_50_5</text>
    <rect x="170" y="65" width="110" height="34" rx="6" class="fb sb"/><text x="225" y="86" text-anchor="middle">run rf_100_8</text>
    <rect x="170" y="115" width="110" height="34" rx="6" class="fb sb"/><text x="225" y="136" text-anchor="middle">run gbr_tuned</text>
    <g stroke="currentColor" fill="none"><line x1="130" y1="82" x2="170" y2="32"/><line x1="130" y1="82" x2="170" y2="82"/><line x1="130" y1="82" x2="170" y2="132"/>
    <line x1="280" y1="82" x2="320" y2="22"/><line x1="280" y1="82" x2="320" y2="62"/><line x1="280" y1="82" x2="320" y2="102"/><line x1="280" y1="82" x2="320" y2="142"/></g>
    <rect x="320" y="8" width="270" height="28" rx="5" class="fs"/><text x="330" y="27">params: n_estimators=100, max_depth=8</text>
    <rect x="320" y="48" width="270" height="28" rx="5" class="fg"/><text x="330" y="67">metrics: mae=2.611, r2=0.902</text>
    <rect x="320" y="88" width="270" height="28" rx="5" class="ft"/><text x="330" y="107">artifacts: worst_orders.csv, model/</text>
    <rect x="320" y="128" width="270" height="28" rx="5" class="fs"/><text x="330" y="147">tags: git_sha, data_md5</text>
  </svg><figcaption>One experiment holds many runs; each run records four kinds of things.</figcaption></figure>
  <p>Read the figure from left to right: the experiment "biteful-eta" contains several runs (we will create all three shown later in the note), and opening any one run, here the depth-8 forest, shows its four compartments. The smallest useful run has one param and one metric. The code below logs <code>max_depth</code> as a param and the forest's MAE after 25, 50 and 100 trees as a metric with steps. <code>set_tracking_uri</code> tells MLflow where to store receipts. To see what a run looks like on disk we first ask for the oldest kind of store, plain folders, which MLflow 3 now refuses unless you opt in:</p>
  <div class="fx" data-lang="py">import os, mlflow, pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from features import build_features

df = pd.read_csv("data/clean.csv")                       # the 2,198 clean orders (data v2)
X, y = build_features(df), df["minutes"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

mlflow.set_tracking_uri("file:./mlruns")                 # plain folders on disk
try:
    mlflow.set_experiment("tiny-demo")
except Exception as e:
    print(type(e).__name__ + ":", str(e)[:100], "...")
os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"           # opt in, only to look inside a run
mlflow.set_experiment("tiny-demo")

with mlflow.start_run(run_name="first-run") as run:
    mlflow.log_param("max_depth", 8)
    for trees in [25, 50, 100]:                          # a metric logged at several steps = a curve
        m = RandomForestRegressor(n_estimators=trees, max_depth=8, random_state=42).fit(X_tr, y_tr)
        mlflow.log_metric("mae", mean_absolute_error(y_te, m.predict(X_te)), step=trees)

r = mlflow.get_run(run.info.run_id)
print("params :", r.data.params, "| type:", type(r.data.params["max_depth"]).__name__)
print("metrics:", {k: round(v, 3) for k, v in r.data.metrics.items()})
hist = mlflow.MlflowClient().get_metric_history(run.info.run_id, "mae")
print("history:", [(h.step, round(h.value, 3)) for h in hist])
run_dir = f"mlruns/{run.info.experiment_id}/{run.info.run_id}"
for sub in ["params", "metrics", "tags"]:
    print(sub + "/", sorted(os.listdir(f"{run_dir}/{sub}"))[:4])
print("params/max_depth -&gt;", open(f"{run_dir}/params/max_depth").read())
print("metrics/mae -&gt;", open(f"{run_dir}/metrics/mae").read().splitlines())</div>
  <div class="fx" data-lang="text">MlflowException: The filesystem tracking backend (e.g., './mlruns') is in maintenance mode and will not receive furth ...
params : {'max_depth': '8'} | type: str
metrics: {'mae': 2.611}
history: [(25, 2.624), (50, 2.619), (100, 2.611)]
params/ ['max_depth']
metrics/ ['mae']
tags/ ['mlflow.runName', 'mlflow.source.name', 'mlflow.source.type', 'mlflow.user']
params/max_depth -&gt; 8
metrics/mae -&gt; ['1795070896606 2.6241169360358887 25', '1795070896693 2.6186454252362132 50', '1795070896903 2.6108644778487107 100']</div>
  <p>There is a lot to read here. The first line shows that the plain-folder store (<code>file:./mlruns</code>) is refused by default: MLflow 3 keeps it only in "maintenance mode" and recommends a database. We opted in with an environment variable just to look inside; from the next section on we use <code>sqlite:///mlflow.db</code>, a single local database file, which is the recommended local setup. The param came back as the string <code>'8'</code>, not the number 8, because MLflow stores every param as text (this will bite us in section 05). <code>r.data.metrics</code> shows only the latest MAE, 2.611 after 100 trees, but the whole curve is stored, and <code>get_metric_history</code> returns it: 2.624, 2.619, 2.611. On disk a run is simply folders named <code>params/</code>, <code>metrics/</code> and <code>tags/</code> with one file per key, and MLflow added some tags of its own, such as <code>mlflow.user</code> and <code>mlflow.source.name</code> (the script that ran). Each line of the metric file holds a timestamp in milliseconds, the value and the step; a database stores exactly the same three columns in a table.</p>

  <h2 id="mf-log"><span class="num">03</span>Logging Real Training Runs</h2>
  <p>How many trees and how deep should Biteful's forest be? We will try four combinations and make each one leave a complete receipt: the settings, the code and data versions, the test scores, a CSV of the five orders it got most wrong (where you start when asking "why is it wrong?"), and the trained model itself. Think of trying four recipes for the same dal: less water, more water, pressure cooker, slow cook. You write down each recipe and how it tasted, and keep a labelled sample of each in the freezer, so next week you can make the best one again exactly.</p>
  <p>The training data, features and split are the same as in the lifecycle note: 1,648 training orders and 550 test orders built with the shared <code>build_features</code> function. The code version is the Git commit from the end of the lifecycle note, and the data version is the first characters of the md5 hash of <code>clean.csv</code>, the same fingerprint DVC records:</p>
  <div class="fx" data-lang="py">import hashlib
# (X_tr, X_te, y_tr, y_te: the same 2,198 orders, features and split as in the lifecycle note)
mlflow.set_tracking_uri("sqlite:///mlflow.db")           # one local database file; files go to ./mlruns
mlflow.set_experiment("biteful-eta")
GIT_SHA = "fd8f0f9"                                        # git rev-parse --short HEAD
DATA_MD5 = hashlib.md5(open("data/clean.csv", "rb").read()).hexdigest()[:8]

for n, depth in [(20, 4), (50, 5), (100, 8), (300, None)]:
    with mlflow.start_run(run_name=f"rf_{n}_{depth}"):
        mlflow.log_params({"n_estimators": n, "max_depth": depth})
        mlflow.set_tags({"git_sha": GIT_SHA, "data_md5": DATA_MD5})        # code + data version
        model = RandomForestRegressor(n_estimators=n, max_depth=depth, random_state=42).fit(X_tr, y_tr)
        pred = model.predict(X_te)
        mae, r2 = mean_absolute_error(y_te, pred), r2_score(y_te, pred)
        mlflow.log_metrics({"mae": mae, "r2": r2})
        worst = X_te.assign(minutes=y_te, pred=pred.round(1))
        worst["err"] = (worst.minutes - worst.pred).abs()
        worst.nlargest(5, "err").to_csv("worst_orders.csv", index=False)
        mlflow.log_artifact("worst_orders.csv")                          # any file
        mlflow.sklearn.log_model(model, name="model", input_example=X_te.head(2),
                                 skops_trusted_types=["sklearn.tree._tree.Tree"])
        print(f"rf_{n}_{depth}: MAE={mae:.3f} R2={r2:.3f}")</div>
  <div class="fx" data-lang="text">rf_20_4: MAE=3.791 R2=0.802
rf_50_5: MAE=3.106 R2=0.863
rf_100_8: MAE=2.611 R2=0.902
rf_300_None: MAE=2.752 R2=0.889</div>
  <p>Walk through one pass of the loop. <code>with mlflow.start_run(run_name=...)</code> opens a run and closes it when the block ends, even if the code inside crashes. <code>log_params</code> writes the two settings. <code>set_tags</code> records the Git SHA and the data hash, which is what makes the run rebuildable later. <code>log_metrics</code> writes the scores, computed on the <em>test</em> orders, never on the training orders. <code>log_artifact</code> uploads any file, here the five worst predictions. <code>mlflow.sklearn.log_model</code> saves the model as a folder in the artifact store, together with a description of its environment. Its <code>input_example</code> argument hands MLflow two real rows, from which it records the model's <strong>signature</strong>: the expected input column names and types, and the output type. Section 08 shows the signature rejecting a bad request.</p>
  <p>The scores tell the usual story about tree depth. Twenty shallow trees underfit (MAE 3.791, R² 0.802), a hundred trees of depth 8 do best (2.611), and unlimited depth overfits slightly (2.752). One argument needs explaining: <code>skops_trusted_types</code>. MLflow 3 saves scikit-learn models in the <strong>skops</strong> format instead of Python's pickle, because loading a pickle file can run arbitrary code hidden inside it (the serving note demonstrates this attack). skops refuses to load object types it does not recognise unless you list them as trusted; for a random forest that is the tree class <code>sklearn.tree._tree.Tree</code>. Only list types you have reviewed, since the list is a security decision.</p>

  <h2 id="mf-auto"><span class="num">04</span>Autologging</h2>
  <p>We logged two settings by hand, but a random forest has eighteen, and the ones we never touched also shape the model. Six months from now, will anyone know what <code>min_samples_leaf</code> was? Manual logging records only what someone remembers to type. <strong>Autologging</strong> is a single line that tells MLflow to watch a library such as scikit-learn and record what happens during <code>fit</code> by itself: every parameter including defaults, some metrics, and the model. Think of a CCTV camera next to a guard's handwritten log. The guard writes down what he thinks matters; the camera records everything. But the camera only sees the hallway, not the exam hall, and that limitation is exactly autolog's catch:</p>
  <div class="fx" data-lang="py">mlflow.sklearn.autolog()                                 # or mlflow.autolog() for every supported library
with mlflow.start_run(run_name="autolog_rf") as run:
    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42).fit(X_tr, y_tr)
mlflow.sklearn.autolog(disable=True)

r = mlflow.get_run(run.info.run_id)
print(len(r.data.params), "params, e.g.", {k: r.data.params[k] for k in ["min_samples_leaf", "max_features"]})
print("metrics:", sorted(r.data.metrics))
print("training_r2_score:", round(r.data.metrics["training_r2_score"], 3),
      "| R2 on the test orders:", round(r2_score(y_te, model.predict(X_te)), 3))</div>
  <div class="fx" data-lang="text">18 params, e.g. {'min_samples_leaf': '1', 'max_features': '1.0'}
metrics: ['training_mean_absolute_error', 'training_mean_squared_error', 'training_r2_score', 'training_root_mean_squared_error', 'training_score']
training_r2_score: 0.946 | R2 on the test orders: 0.902</div>
  <p>We typed two settings and MLflow captured eighteen, including <code>min_samples_leaf=1</code> and <code>max_features=1.0</code>, which never appeared in our code. But look at the metric names: every one starts with <code>training_</code>. Autolog measured the model on the same orders it was trained on, where it scores R² 0.946; on the test orders it scores 0.902. That is like marking a student on the exact questions they practised. Autologging is available for scikit-learn, XGBoost, LightGBM, PyTorch Lightning, Keras and Hugging Face Transformers, and <code>mlflow.autolog()</code> switches it on for all of them at once. The sensible pattern is to combine both: let autolog capture every parameter and the model, and log your own validation or test metrics by hand, then rank runs only on those.</p>

  <h2 id="mf-compare"><span class="num">05</span>Comparing Runs</h2>
  <p>Real projects collect hundreds of runs, and opening receipts one at a time does not scale. <code>mlflow.search_runs</code> returns runs as a pandas DataFrame, with columns named by kind: <code>params.n_estimators</code>, <code>metrics.mae</code>, <code>tags.git_sha</code>. You filter with a SQL-like string and sort with <code>order_by</code>. It is like a cricket statistics website: instead of rereading every scorecard, you ask for "all batters averaging above 50, sorted by strike rate". The filter string is "above 50"; <code>order_by</code> is the sort. Here are two questions, the second one Ravi's:</p>
  <div class="fx" data-lang="py">runs = mlflow.search_runs(experiment_names=["biteful-eta"],
                          filter_string="attributes.run_name LIKE 'rf_%'",
                          order_by=["metrics.mae ASC"])
print(type(runs).__name__, runs.shape)
print(runs[["tags.mlflow.runName", "params.n_estimators", "params.max_depth",
            "metrics.mae", "metrics.r2"]].round(3).to_string(index=False))

hit = mlflow.search_runs(experiment_names=["biteful-eta"],
                         filter_string="metrics.r2 &gt; 0.85 AND metrics.r2 &lt; 0.87")
print("the 0.86 run:", hit[["tags.mlflow.runName", "params.n_estimators",
                             "params.max_depth", "tags.git_sha"]].to_dict("records"))
print(sorted(["300", "1000", "50"]), sorted(["300", "1000", "50"], key=int))</div>
  <div class="fx" data-lang="text">DataFrame (4, 16)
tags.mlflow.runName params.n_estimators params.max_depth  metrics.mae  metrics.r2
           rf_100_8                 100                8        2.611       0.902
        rf_300_None                 300             None        2.752       0.889
            rf_50_5                  50                5        3.106       0.863
            rf_20_4                  20                4        3.791       0.802
the 0.86 run: [{'tags.mlflow.runName': 'rf_50_5', 'params.n_estimators': '50', 'params.max_depth': '5', 'tags.git_sha': 'fd8f0f9'}]
['1000', '300', '50'] ['50', '300', '1000']</div>
  <p>The first query keeps only runs whose name starts with <code>rf_</code> (the autolog run is named differently, and filters on run name use the <code>attributes.</code> prefix) and sorts them by MAE, best first. It reproduces the ranking from section 03, but now as a query anyone on the team can run. The second query answers Ravi in one line: the only run with R² between 0.85 and 0.87 is <code>rf_50_5</code>, fifty trees of depth 5, trained from commit <code>fd8f0f9</code>, so it can be rebuilt from its tags. The same table, plus metric curves and comparison plots, is available in the web interface, started locally with <code>mlflow ui --backend-store-uri sqlite:///mlflow.db</code>.</p>
  <p>The last line demonstrates a trap in plain Python. Because params are stored as strings, sorting or filtering on them compares text, and as text "1000" comes before "300" because the character "1" comes before "3". Convert the column first (<code>runs["params.n_estimators"].astype(int)</code>), or log important numeric settings as metrics as well, so they can be compared as numbers.</p>

  <h2 id="mf-optuna"><span class="num">06</span>Hyperparameter Search with Optuna</h2>
  <p>So far we compared four settings we guessed. Gradient boosting might beat the forest, but it has a learning rate, a tree depth, a subsample rate and a number of trees, and a grid of five values for each would mean 625 trainings. Settings like these, chosen before training rather than learnt from the data, are called <strong>hyperparameters</strong>. The <a class="xref" data-note="ml_tree_tuning">tuning note</a> covered <em>grid search</em> (try every combination) and <em>random search</em> (try random combinations). Both have the same weakness: each new try ignores everything the earlier tries revealed.</p>
  <p><strong>Optuna</strong> is a library that searches more cleverly. You write an <strong>objective</strong> function that receives a <strong>trial</strong>, asks it for settings (<code>trial.suggest_float</code>, <code>trial.suggest_int</code>), trains a model and returns a score to minimise. A <strong>study</strong> calls the objective many times, and its <strong>sampler</strong> decides which settings to try next. The default sampler, <strong>TPE</strong> (Tree-structured Parzen Estimator), splits past trials into a "good" group and a "bad" group and proposes new settings that look more like the good ones, so the search concentrates where results have been promising. On top of that, a <strong>pruner</strong> watches each trial's intermediate scores, which the objective reports with <code>trial.report</code>, and stops a trial early (<code>trial.should_prune()</code>) when it is clearly worse than earlier trials were at the same point.</p>
  <p>Hiring is a good analogy. Grid search gives every applicant a full day of interviews. TPE reads the CVs of people who did well and invites more candidates like them. Pruning is the fifteen-minute phone screen: a candidate who scores far below the typical applicant at the screen does not get the full day. The <strong>median pruner</strong> used below makes the phone screen precise: at step <em>s</em>, it compares the trial's score with the median of the scores earlier trials had at step <em>s</em>, and stops the trial if it is worse.</p>
  <p>Two details in the code matter. First, the search is scored on a <em>validation</em> slice cut from the training orders, and the test orders stay untouched until the very end; if the objective returned the test score, thirty trials would quietly fit the settings to those 550 orders and the final number would be optimistic. Second, each trial grows the boosting model fifty trees at a time using <code>warm_start=True</code> (keep the trees already built and add more), reporting the validation MAE after each step so the pruner has something to judge. Each trial is also logged as a <strong>nested</strong> MLflow run inside one parent run, so the experiment shows one search with thirty children rather than thirty unrelated runs:</p>
  <div class="fx" data-lang="py">import optuna, statistics
from sklearn.ensemble import GradientBoostingRegressor
optuna.logging.set_verbosity(optuna.logging.WARNING)
# tune on a validation slice of the TRAINING rows; the test rows stay untouched for the final check
X_fit, X_val, y_fit, y_val = train_test_split(X_tr, y_tr, test_size=0.25, random_state=0)

def objective(trial):
    params = {"learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
              "max_depth": trial.suggest_int("max_depth", 2, 6),
              "subsample": trial.suggest_float("subsample", 0.5, 1.0)}
    gbr = GradientBoostingRegressor(n_estimators=50, warm_start=True, random_state=42, **params)
    with mlflow.start_run(run_name=f"trial_{trial.number}", nested=True):
        mlflow.log_params(params)
        for step in range(1, 7):                              # grow 50 trees at a time: 50 ... 300
            gbr.set_params(n_estimators=50 * step).fit(X_fit, y_fit)
            mae = mean_absolute_error(y_val, gbr.predict(X_val))
            mlflow.log_metric("val_mae", mae, step=50 * step)
            trial.report(mae, step)                           # tell Optuna the score so far
            if trial.should_prune():                          # worse than the median trial at this step?
                mlflow.set_tag("state", "pruned")
                raise optuna.TrialPruned()
    return mae

with mlflow.start_run(run_name="optuna_gbr"):
    study = optuna.create_study(direction="minimize",
                                sampler=optuna.samplers.TPESampler(seed=42),
                                pruner=optuna.pruners.MedianPruner(n_startup_trials=5, n_warmup_steps=2))
    study.optimize(objective, n_trials=30)
    mlflow.log_params({f"best_{k}": v for k, v in study.best_params.items()})
    mlflow.log_metric("best_val_mae", study.best_value)

states = [t.state.name for t in study.trials]
print("trials:", len(states), "| complete:", states.count("COMPLETE"), "| pruned:", states.count("PRUNED"))
print("best trial", study.best_trial.number, {k: round(v, 3) for k, v in study.best_params.items()},
      "val MAE", round(study.best_value, 3))
p = next(t for t in study.trials if t.state.name == "PRUNED")      # look inside the first pruned trial
last = max(p.intermediate_values)
others = [t.intermediate_values[last] for t in study.trials[:p.number] if last in t.intermediate_values]
print(f"trial {p.number} after {last * 50} trees: val MAE {p.intermediate_values[last]:.3f}")
print("earlier trials at the same step:", sorted(round(v, 3) for v in others),
      "median", round(statistics.median(others), 3), "-&gt; pruned")</div>
  <div class="fx" data-lang="text">trials: 30 | complete: 14 | pruned: 16
best trial 3 {'learning_rate': 0.111, 'max_depth': 2, 'subsample': 0.985} val MAE 2.463
trial 5 after 100 trees: val MAE 3.781
earlier trials at the same step: [2.502, 2.547, 2.554, 2.675, 3.629] median 2.554 -&gt; pruned</div>
  <p>Of 30 trials, 14 ran all the way to 300 trees and 16 were stopped early, saving most of their training time. The best settings came from trial 3: a learning rate of about 0.11, trees of depth 2 and 98% subsampling, with a validation MAE of 2.463. The last two lines open up one pruning decision so you can check it by hand. Trial 5 had a validation MAE of 3.781 after 100 trees. The five earlier trials had 2.502, 2.547, 2.554, 2.675 and 3.629 at that step; sorted, the middle value is 2.554. Since 3.781 is worse than 2.554, the trial was stopped and never grew trees 101 to 300. The two pruner arguments explain why pruning started at trial 5: <code>n_startup_trials=5</code> lets the first five trials run fully to build up a reference, and <code>n_warmup_steps=2</code> never prunes in a trial's first two steps, when scores are still noisy.</p>
  <p>Now the one honest check: retrain the best settings on all training orders and score them once on the untouched test orders, logged as its own run with the same tags as the forests:</p>
  <div class="fx" data-lang="py"># final check of the tuned settings (study.best_params) on the untouched test rows, as its own run
with mlflow.start_run(run_name="gbr_tuned"):
    gbr = GradientBoostingRegressor(n_estimators=300, random_state=42, **best_params).fit(X_tr, y_tr)
    pred = gbr.predict(X_te)
    mlflow.log_params(best_params)
    mlflow.set_tags({"git_sha": GIT_SHA, "data_md5": DATA_MD5})
    mlflow.log_metrics({"mae": mean_absolute_error(y_te, pred), "r2": r2_score(y_te, pred)})
    mlflow.sklearn.log_model(gbr, name="model", input_example=X_te.head(2),
                             skops_trusted_types=["sklearn.tree._tree.Tree",
                                                  "sklearn._loss.loss.HalfSquaredError",
                                                  "sklearn._loss.link.IdentityLink",
                                                  "sklearn._loss.link.Interval",
                                                  "sklearn.dummy.DummyRegressor"])
print("tuned boosting test MAE:", round(mean_absolute_error(y_te, pred), 3), " R2:", round(r2_score(y_te, pred), 3))</div>
  <div class="fx" data-lang="text">tuned boosting test MAE: 2.41  R2: 0.916</div>
  <p>The tuned boosting model scores test MAE 2.41 and R² 0.916, against 2.611 and 0.902 for the best forest: on average a fifth of a minute closer per order. That is a candidate worth promoting, and it is the subject of the next section. (The long <code>skops_trusted_types</code> list is simply every internal class a gradient-boosting model contains.)</p>
  <table class="tbl">
    <tr><th>Search method</th><th>How it picks the next try</th><th>Best used when</th></tr>
    <tr><td>Grid search</td><td>Every combination of a fixed grid, in order</td><td>One or two settings with few values</td></tr>
    <tr><td>Random search</td><td>Independent random draws; better coverage than a grid</td><td>A cheap baseline search</td></tr>
    <tr><td>TPE (Optuna's default)</td><td>Learns from good and bad past trials</td><td>Most tuning jobs</td></tr>
    <tr><td>+ pruning</td><td>Stops trials worse than the median at a step</td><td>Models trained in steps: boosting rounds, neural-net epochs</td></tr>
    <tr><td>Ray Tune</td><td>The same samplers and pruners, run in parallel across machines and GPUs</td><td>Large budgets on a cluster (it can use Optuna's sampler)</td></tr>
  </table>

  <h2 id="mf-reg"><span class="num">07</span>The Model Registry</h2>
  <p>The app must use the forest today and switch to the tuned boosting model once it passes the gate, and if the new model misbehaves, the team must be able to switch back within minutes. Copying <code>.joblib</code> files to a server and editing a path in the app's code is how outages happen: someone copies the wrong file, or the rollback requires a code change and a full redeploy at 2 a.m.</p>
  <p>The <strong>model registry</strong> solves this with two ideas. First, each use case gets one name, such as <code>biteful-eta</code>, and every model you register under that name becomes a numbered <strong>version</strong>: 1, 2, 3, and so on. A version never changes once created, and it stays linked to the run that produced it, so its params, metrics and tags are one click away. Second, you hang movable labels called <strong>aliases</strong> on versions, such as <code>@champion</code> for "the version production uses". The app always asks for <code>models:/biteful-eta@champion</code>. Promoting a new model, or rolling back, is simply moving the label; no files are copied and no app code changes. Think of a cricket team sheet. The players (versions) stay who they are, while the captain's armband (the alias) moves between them. Commentators just say "the captain", and the right person is always meant.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <defs><marker id="mf-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="10" y="20">registered model: biteful-eta</text>
    <rect x="20" y="40" width="150" height="44" rx="6" class="fb sb"/><text x="95" y="60" text-anchor="middle">version 1</text><text x="95" y="76" text-anchor="middle" class="tm" font-size="11">rf_100_8 · MAE 2.611</text>
    <rect x="230" y="40" width="150" height="44" rx="6" class="fb sb"/><text x="305" y="60" text-anchor="middle">version 2</text><text x="305" y="76" text-anchor="middle" class="tm" font-size="11">gbr_tuned · MAE 2.41</text>
    <rect x="440" y="40" width="150" height="44" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="515" y="66" text-anchor="middle" class="tm">version 3 …</text>
    <rect x="245" y="105" width="120" height="30" rx="15" class="fg sg"/><text x="305" y="125" text-anchor="middle">@champion</text>
    <rect x="35" y="105" width="120" height="30" rx="15" class="fs" stroke="currentColor"/><text x="95" y="125" text-anchor="middle">@previous</text>
    <path d="M245,128 C200,145 160,145 157,130" class="sr" fill="none" stroke-dasharray="4 3" marker-end="url(#mf-ar1)"/>
    <text x="200" y="155" text-anchor="middle" class="tr" font-size="11">rollback = move the alias</text>
  </svg><figcaption>Versions are fixed; aliases are movable pointers. Serving code asks for @champion and never changes.</figcaption></figure>
  <p>The figure shows the state we are about to create. Version 1 is the depth-8 forest and version 2 the tuned boosting model; a future version 3 would simply be added on the right. The green <code>@champion</code> label hangs on version 2, and <code>@previous</code> remembers version 1. The dashed arrow is a rollback: moving <code>@champion</code> back onto version 1. The code registers the forest as version 1 and makes it champion, registers the boosting model as version 2 with the alias <code>@challenger</code>, then runs a gate: it loads both models <em>through their aliases</em>, scores them on the same test orders, and promotes the challenger only if it is clearly better. After that it performs a rollback drill and moves forward again:</p>
  <div class="fx" data-lang="py"># MLflow 3: a logged model has its own ID; find the one a given run produced
def logged_model_of(run_name):
    run = mlflow.search_runs(experiment_names=["biteful-eta"],
                             filter_string=f"attributes.run_name = '{run_name}'").iloc[0]
    return mlflow.search_logged_models(experiment_ids=[run.experiment_id],
               filter_string=f"source_run_id = '{run.run_id}'", output_format="list")[0]

v1 = mlflow.register_model(f"models:/{logged_model_of('rf_100_8').model_id}", "biteful-eta")
client.set_registered_model_alias("biteful-eta", "champion", v1.version)
v2 = mlflow.register_model(f"models:/{logged_model_of('gbr_tuned').model_id}", "biteful-eta")
client.set_registered_model_alias("biteful-eta", "challenger", v2.version)

def test_mae(alias):                                  # load by alias, score on the same test orders
    m = mlflow.pyfunc.load_model(f"models:/biteful-eta@{alias}")
    return round(mean_absolute_error(y_te, m.predict(X_te)), 3)
champ, chall = test_mae("champion"), test_mae("challenger")
print("champion v1 MAE:", champ, "| challenger v2 MAE:", chall)
if chall &lt; champ - 0.05:                              # the gate: promote only if clearly better
    client.set_registered_model_alias("biteful-eta", "previous", v1.version)
    client.set_registered_model_alias("biteful-eta", "champion", v2.version)
    client.delete_registered_model_alias("biteful-eta", "challenger")
for v in ["1", "2"]:
    print("version", v, "aliases", client.get_model_version("biteful-eta", v).aliases)

client.set_registered_model_alias("biteful-eta", "champion", "1")          # rollback drill
print("after rollback, @champion -&gt;", client.get_model_version_by_alias("biteful-eta", "champion").version)
client.set_registered_model_alias("biteful-eta", "champion", "2")          # and forward again
client.set_model_version_tag("biteful-eta", "2", "validated", "true")
print("v2 tags:", client.get_model_version("biteful-eta", "2").tags)</div>
  <div class="fx" data-lang="text">champion v1 MAE: 2.611 | challenger v2 MAE: 2.41
version 1 aliases ['previous']
version 2 aliases ['champion']
after rollback, @champion -&gt; 1
v2 tags: {'validated': 'true'}</div>
  <p>The gate measured 2.611 for the champion and 2.41 for the challenger, so the challenger was promoted: <code>@previous</code> went onto version 1, <code>@champion</code> moved to version 2, and <code>@challenger</code> was removed. The rollback drill moved <code>@champion</code> back to version 1 with one call and then forward again, and nothing was copied or deleted along the way. Finally a version <strong>tag</strong>, <code>validated=true</code>, records that checks passed; teams use such tags for things like "load-tested" or "approved by". The helper <code>logged_model_of</code> exists because in MLflow 3 a logged model is an object with its own ID (a URI like <code>models:/m-…</code>), linked to the run that produced it, and registering takes that ID.</p>
  <p>Older tutorials, and many interviewers, still talk about "promoting a model to Production". Before aliases existed, MLflow gave every version one of four fixed <strong>stages</strong>, None, Staging, Production and Archived, moved with <code>transition_model_version_stage</code>. Here is what happens if you use it today:</p>
  <div class="fx" data-lang="py">import warnings
with warnings.catch_warnings(record=True) as w:      # the OLD way: fixed stages
    warnings.simplefilter("always")
    client.transition_model_version_stage("biteful-eta", "2", stage="Production")
print("stage of v2:", client.get_model_version("biteful-eta", "2").current_stage)
print("warning:", [str(x.message) for x in w if "deprecated" in str(x.message)][0][:100], "...")</div>
  <div class="fx" data-lang="text">stage of v2: Production
warning: \`\`mlflow.tracking.client.MlflowClient.transition_model_version_stage\`\` is deprecated since 2.9.0. Mo ...</div>
  <p>It still works, but MLflow warns that it has been deprecated since version 2.9. Four fixed stages did not fit teams that need several live slots at once (a champion and a challenger, a shadow model, one model per region), whereas aliases can have any name and any number can exist. If an interviewer asks about "Staging → Production → Archived", describe the stages and then explain that modern MLflow uses aliases such as <code>@champion</code> and <code>@challenger</code> for the same purpose. One more warning applies to both systems: never promote by "newest version wins". Version 3 might be worse; promotion must always go through a gate that compares challenger and champion on the same data, which the <a class="xref" data-note="mlops_cicd">CI/CD note</a> automates.</p>

  <h2 id="mf-serve"><span class="num">08</span>Loading &amp; Serving a Registered Model</h2>
  <p>The app needs an ETA for every new order. It should not care that the champion was a forest yesterday and a boosting model today, and it must not hard-code a file path. MLflow makes this possible with <strong>flavors</strong>, which are different ways of loading the same saved model. Every model has its native flavor (here <code>sklearn</code>) and also the generic <code>python_function</code> flavor, usually called <strong>pyfunc</strong>, which wraps any model behind the same <code>predict()</code> method. It works like a universal TV remote: whatever brand the TV is (scikit-learn, XGBoost, PyTorch), the power button is in the same place. Loading by alias asks the registry which version <code>@champion</code> points to, downloads that version's files and wraps them:</p>
  <div class="fx" data-lang="py"># (monday: the six Monday orders as raw columns; build_features: the shared feature function)
model = mlflow.pyfunc.load_model("models:/biteful-eta@champion")
version = client.get_model_version_by_alias("biteful-eta", "champion").version
print("@champion -&gt; version", version, "| flavor:", model.metadata.flavors["python_function"]["loader_module"])
print("signature inputs:", [c.name for c in model.metadata.get_input_schema().inputs])
print("Monday ETAs :", model.predict(build_features(monday)).round(1))
print("real minutes: [23 55 14 36 47 43]")
try:
    model.predict(pd.DataFrame({"distance_km": [5.5]}))          # a request missing six columns
except Exception as e:
    print(type(e).__name__ + ":", " ".join(str(e).split())[:170], "...")</div>
  <div class="fx" data-lang="text">@champion -&gt; version 2 | flavor: mlflow.sklearn
signature inputs: ['distance_km', 'items', 'rain', 'restaurant_Biryani House', 'restaurant_Chai Stop', 'restaurant_Dosa Corner', 'restaurant_Pizza Point']
Monday ETAs : [23.3 55.8 16.2 35.3 46.6 42.4]
real minutes: [23 55 14 36 47 43]
MlflowException: Failed to enforce schema of data ' distance_km 0 5.5' with schema '['distance_km': double (required), 'items': long (required), 'rain': long (required), 'restaurant_Birya ...</div>
  <p>The alias resolved to version 2, loaded through the sklearn loader, and the signature lists the seven expected columns. On the six Monday orders the champion predicts 23.3, 55.8, 16.2, 35.3, 46.6 and 42.4 minutes against the real 23, 55, 14, 36, 47 and 43. By hand, the errors are 0.3, 0.8, 2.2, 0.7, 0.4 and 0.6, which sum to 5.0, an MAE of 0.83 minutes on these six (the lifecycle note's forest had 1.33). The last line shows the signature at work: a request containing only <code>distance_km</code> was refused with "Failed to enforce schema", instead of producing a confident wrong ETA like the metres bug. Other URI forms load a fixed version (<code>models:/biteful-eta/1</code>) or a run's model directly (<code>runs:/&lt;run_id&gt;/model</code>), but serving code should use the alias, because a hard-coded version turns every rollback into a code change and a redeploy.</p>
  <p>Other programs talk to models over HTTP, using JSON. MLflow's standard request format, called <code>dataframe_split</code>, lists the column names once and then the rows. Here is Monday order 2 written as a request file:</p>
  <div class="fx" data-lang="py">row = build_features(monday.iloc[[1]])                     # Monday order 2: 5.5 km, rain, Biryani House
json.dump({"dataframe_split": row.to_dict(orient="split", index=False)}, open("req.json", "w"))
print(open("req.json").read())</div>
  <div class="fx" data-lang="text">{"dataframe_split": {"columns": ["distance_km", "items", "rain", "restaurant_Biryani House", "restaurant_Chai Stop", "restaurant_Dosa Corner", "restaurant_Pizza Point"], "data": [[5.5, 3, 1, 1, 0, 0, 0]]}}</div>
  <p>The command <code>mlflow models predict</code> loads a model and scores a request file in one go, which is handy for batch jobs and for checking a model from a shell. <code>--env-manager local</code> means "use the Python environment I am already in"; without it, MLflow builds a fresh environment from the model's own requirements file, which is slower but tests that the logged environment really works. The <code>2&gt;/dev/null</code> only hides progress and log lines:</p>
  <div class="fx" data-lang="text">$ MLFLOW_TRACKING_URI=sqlite:///mlflow.db mlflow models predict -m "models:/biteful-eta@champion" -i req.json -t json --env-manager local 2&gt;/dev/null
{"predictions": [55.815521806724306]}</div>
  <p>The answer for order 2 is 55.8 minutes (the real delivery took 55), the same number pyfunc gave above. To answer requests continuously, the same model is served as a web endpoint with <code>mlflow models serve -m "models:/biteful-eta@champion" -p 5000</code>, which accepts exactly this JSON at <code>POST /invocations</code>, and <code>mlflow models build-docker</code> wraps that server into a Docker image (neither was started here, since this note runs no long-lived servers). Most production teams build their own API instead, with health checks, input validation and logging they control; the <a class="xref" data-note="mlops_serving">serving note</a> does that with FastAPI.</p>
  <p>What exactly did MLflow save for version 2? A logged model is a folder, not a single file, and its <code>MLmodel</code> file is the label on the box. Here are its flavors:</p>
  <div class="fx" data-lang="py">path = mlflow.artifacts.download_artifacts("models:/biteful-eta@champion")
lines = open(f"{path}/MLmodel").read().splitlines()
start = lines.index("flavors:")
print("\\n".join(lines[start:start + 20]))</div>
  <div class="fx" data-lang="text">flavors:
  python_function:
    env:
      conda: conda.yaml
      virtualenv: python_env.yaml
    loader_module: mlflow.sklearn
    model_path: model.skops
    predict_fn: predict
    python_version: 3.13.18
  sklearn:
    code: null
    pickled_model: model.skops
    serialization_format: skops
    sklearn_version: 1.9.1
    skops_trusted_types:
    - sklearn.tree._tree.Tree
    - sklearn._loss.loss.HalfSquaredError
    - sklearn._loss.link.IdentityLink
    - sklearn._loss.link.Interval
    - sklearn.dummy.DummyRegressor</div>
  <p>The <code>python_function</code> section says how to load the model generically: through <code>mlflow.sklearn</code>, from <code>model.skops</code>, with the environment described in <code>conda.yaml</code> or <code>python_env.yaml</code>, and the Python version it was trained with. The <code>sklearn</code> section records the native details: the skops format, the scikit-learn version, and the trusted types we listed when logging. Anyone loading this model years from now knows exactly what it needs.</p>

  <h2 id="mf-repro"><span class="num">09</span>Reproducibility: Seeds and Environments</h2>
  <p>The lifecycle note showed reruns of the same notebook giving different scores. If two runs differ by 0.05 minutes, is that a real improvement or luck? And will the model behave the same on a server with a different scikit-learn version? Two hidden ingredients answer these questions: randomness and the software environment. Think of making chai. If you don't write down how much sugar went in and how long it boiled, tomorrow's chai tastes different and you cannot say why.</p>
  <p>Many training steps use random numbers: the train/test split, which rows and features each tree sees, the order of mini-batches. A computer's random numbers come from a formula that starts from a number called the <strong>seed</strong>, so the same seed always produces the same sequence. Dice first, then Biteful's forest:</p>
  <div class="fx" data-lang="py">import random
print("roll 1:", [random.randint(1, 6) for _ in range(5)])
print("roll 2:", [random.randint(1, 6) for _ in range(5)])
random.seed(7); print("seed 7:", [random.randint(1, 6) for _ in range(5)])
random.seed(7); print("seed 7:", [random.randint(1, 6) for _ in range(5)])

def run_once(seed):                                   # split + forest, both driven by the same seed
    a, b, c, d = train_test_split(X, y, test_size=0.25, random_state=seed)
    m = RandomForestRegressor(n_estimators=50, max_depth=8, random_state=seed).fit(a, c)
    return round(mean_absolute_error(d, m.predict(b)), 3)
print("no seed :", [run_once(None) for _ in range(3)])
print("seed=42 :", [run_once(42) for _ in range(3)])</div>
  <div class="fx" data-lang="text">roll 1: [1, 3, 1, 6, 2]
roll 2: [6, 6, 4, 4, 3]
seed 7: [3, 2, 4, 6, 1]
seed 7: [3, 2, 4, 6, 1]
no seed : [2.579, 2.684, 2.45]
seed=42 : [2.619, 2.619, 2.619]</div>
  <p>Without a seed, two rolls of five dice differ, but after <code>random.seed(7)</code> the same five numbers appear both times. The forest behaves the same way. Without a seed, three runs of identical code give three different MAEs that differ from each other by more than a tenth of a minute, which is larger than many claimed "improvements". With <code>random_state=42</code> (scikit-learn's name for the seed), every run gives 2.619. The practice is to put one seed in the config and pass it to every random step: the split, the model, NumPy's <code>default_rng(seed)</code>, and <code>torch.manual_seed</code> for neural networks. Even with seeds, one seed is still one sample; when two candidates are close, compare their average over several seeds or cross-validation folds.</p>
  <p>The environment is the other half. MLflow wrote it next to the model when we logged it, so everything needed to rebuild the champion can be read back from the registry:</p>
  <div class="fx" data-lang="py"># everything needed to rebuild the champion, read back from the registry
path = mlflow.artifacts.download_artifacts("models:/biteful-eta@champion")
print(sorted(os.listdir(path)))
print(open(f"{path}/requirements.txt").read().strip().replace("\\n", " | "))
run = mlflow.get_run(client.get_model_version_by_alias("biteful-eta", "champion").run_id)
print("rebuild recipe:", {k: run.data.tags[k] for k in ["git_sha", "data_md5"]},
      {k: v[:6] for k, v in run.data.params.items()})</div>
  <div class="fx" data-lang="text">['MLmodel', 'conda.yaml', 'input_example.json', 'model.skops', 'python_env.yaml', 'requirements.txt', 'serving_input_example.json']
mlflow==3.18.0 | numpy==2.5.3 | pandas==3.0.5 | psutil==7.2.2 | rich==15.0.0 | scikit-learn==1.9.1 | scipy==1.18.1 | skops==0.16.0
rebuild recipe: {'git_sha': 'fd8f0f9', 'data_md5': '8f8aaeb3'} {'learning_rate': '0.1111', 'max_depth': '2', 'subsample': '0.9849'}</div>
  <p>The model folder contains the <code>MLmodel</code> label, the model file, two example inputs, and three environment descriptions (<code>requirements.txt</code> for pip, <code>python_env.yaml</code> for virtualenv, <code>conda.yaml</code> for conda). The requirements pin exact versions: scikit-learn 1.9.1, numpy 2.5.3, skops 0.16.0. The run behind version 2 still carries the Git SHA, the data hash and the three tuned settings. Together that is the full recipe from the lifecycle note: code, data, settings, seed (42, in the code) and environment.</p>
  <p>Read the requirements list critically, though. MLflow <em>infers</em> it by watching which packages get imported while the model is saved and loaded, and in a busy environment that can sweep in packages the model does not need to make predictions, such as <code>rich</code> or <code>psutil</code> here. A serving image built from this file installs them for nothing, and in larger environments it can be far worse (whole deep-learning frameworks). Review inferred requirements, or pass <code>pip_requirements=[...]</code> to <code>log_model</code> explicitly. On GPUs there is one more source of difference: some operations are non-deterministic for speed, and <code>torch.use_deterministic_algorithms(True)</code> trades that speed for repeatable results.</p>

  <h2 id="mf-setup"><span class="num">10</span>A Shared Tracking Server</h2>
  <p>Everything so far lives in one <code>mlflow.db</code> file on one laptop. Asha's runs are in her file, Ravi's in his, and the CI pipeline in the next notes needs to read <code>@champion</code> from somewhere both of them write to. A team therefore runs one shared <strong>tracking server</strong>. Everyone's code points at it with the <code>MLFLOW_TRACKING_URI</code> environment variable, and the same <code>log_*</code> and <code>load_model</code> calls now read and write there, with no code changes. The server keeps small facts (params, metrics, run names, registry entries) in a database called the <strong>backend store</strong>, and large files (models, plots, CSVs) in object storage called the <strong>artifact store</strong>.</p>
  <p>A library works the same way. The catalogue cards sit in a small cabinet at the front desk, quick to search: that is the backend store. The books sit on shelves in the stacks, and you fetch a heavy book only once the catalogue has told you which one you need: that is the artifact store.</p>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="mf-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="45" width="130" height="40" rx="6" class="fb sb"/><text x="75" y="69" text-anchor="middle">training / CI</text>
    <rect x="210" y="45" width="150" height="40" rx="6" class="fv" stroke="currentColor"/><text x="285" y="69" text-anchor="middle">tracking server</text>
    <rect x="430" y="10" width="160" height="44" rx="6" class="fs" stroke="currentColor"/><text x="510" y="30" text-anchor="middle">backend store</text><text x="510" y="46" text-anchor="middle" class="tm" font-size="11">Postgres/MySQL: metadata</text>
    <rect x="430" y="76" width="160" height="44" rx="6" class="ft st"/><text x="510" y="96" text-anchor="middle">artifact store</text><text x="510" y="112" text-anchor="middle" class="tm" font-size="11">S3/GCS: models, plots</text>
    <g stroke="currentColor" fill="none" marker-end="url(#mf-ar2)"><line x1="140" y1="65" x2="208" y2="65"/><line x1="360" y1="58" x2="428" y2="34"/><line x1="360" y1="72" x2="428" y2="96"/></g>
  </svg><figcaption>Training jobs talk to one server; it writes small facts to a database and big files to object storage.</figcaption></figure>
  <p>Follow the arrows: laptops, training jobs and CI all send their calls to the tracking server, which writes run metadata and registry entries to the database at the top and files to the bucket at the bottom. In our local setup, <code>mlflow.db</code> played the database and the <code>mlruns/</code> folder the bucket. Starting a real server needs a database server and a bucket, so the commands below were not run here; they show the shape:</p>
  <div class="fx" data-lang="text"># not run here: needs a Postgres server and an S3 bucket
mlflow server --backend-store-uri postgresql://user:pw@db/mlflow \\
              --artifacts-destination s3://biteful-ml-artifacts --host 0.0.0.0 --port 5000

# every client (laptops, CI, training jobs):
export MLFLOW_TRACKING_URI=http://mlflow.biteful.internal:5000</div>
  <p>Locally, <code>mlflow ui --backend-store-uri sqlite:///mlflow.db</code> gives the same web interface for one machine. Managed options, where someone else runs the server, include Databricks, SageMaker's managed MLflow and Azure ML (<a class="xref" data-note="mlops_cloud">Cloud ML Platforms</a>). Always put authentication in front of a shared server, because it holds every model the company has trained. A classic failure is a training machine where <code>MLFLOW_TRACKING_URI</code> was never set: MLflow silently logs to a local <code>mlflow.db</code> on that machine, the run "worked", and nobody can ever see it. Printing <code>mlflow.get_tracking_uri()</code> at the start of every training job catches this.</p>
  <p>MLflow also offers <strong>Projects</strong>: an <code>MLproject</code> file at the root of a repository that declares the environment and the command to run, with parameters and defaults, so that <code>mlflow run . -P max_depth=4</code> (or a Git URL in place of <code>.</code>) trains the model the same way anywhere. The file below was checked to be valid YAML but not run:</p>
  <div class="fx" data-lang="text">name: biteful-eta
python_env: python_env.yaml
entry_points:
  main:
    parameters:
      max_depth: {type: int, default: 8}
      seed: {type: int, default: 42}
    command: "python train.py model.max_depth={max_depth} seed={seed}"</div>
  <p>Many teams use a <code>dvc.yaml</code> pipeline or a Docker image run by an orchestrator instead; the idea is the same in every case: training should be a single, declared command, not a ritual someone performs by hand.</p>

  <h2 id="mf-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Two mistakes produce real errors. A run opened without <code>with</code> stays open, so the next <code>start_run</code> clashes with it, and a param cannot be changed once it has been logged:</p>
  <div class="fx" data-lang="py">mlflow.start_run(run_name="a")          # opened without "with" ...
mlflow.log_param("max_depth", 8)
try:
    mlflow.start_run(run_name="b")      # ... so starting a second run clashes
except Exception as e:
    print(type(e).__name__ + ":", str(e).split(".")[0])
mlflow.end_run()                        # close it explicitly

with mlflow.start_run(run_name="b"):
    try:
        mlflow.log_param("max_depth", 8)
        mlflow.log_param("max_depth", 12)    # params are write-once
    except Exception as e:
        print(type(e).__name__ + ":", str(e).split(" for run")[0])</div>
  <div class="fx" data-lang="text">Exception: Run with UUID a5abd86595e54a8c9354bc8b31df434b is already active
MlflowException: Changing param values is not allowed. Param with key='max_depth' was already logged with value='8'</div>
  <p>The first error is very common in notebooks: a cell crashed after <code>start_run()</code>, the run never ended, and every later attempt fails with "already active". Use <code>with mlflow.start_run():</code>, which closes the run even on errors, or call <code>mlflow.end_run()</code>. The second error protects the receipt: a param describes how the run was set up, so rewriting it afterwards would make the record a lie. If a setting really changed, that is a new run.</p>
  <p>Ranking runs on autologged metrics is the most damaging silent mistake, because <code>training_*</code> scores reward overfitting (0.946 against a real 0.902 in section 04); always log a validation or test metric yourself and rank on that. Tuning on the test set is its cousin: if the Optuna objective returns the test score, the final test number stops being honest. Sorting or filtering params as numbers fails because they are strings ("1000" sorts before "300"). Runs without <code>git_sha</code> and <code>data_md5</code> tags cannot be rebuilt, however many params they log. Hard-coding a version number in serving code turns every rollback into a redeploy; load <code>@champion</code> instead. Trusting inferred requirements blindly ships unneeded packages into production images. Logging a large checkpoint at every training step fills the artifact store; log metrics every step and keep only the best checkpoint. And forgetting to set <code>MLFLOW_TRACKING_URI</code> on a training machine sends its runs into a local file nobody will ever find.</p>

  <h2 id="mf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Experiment tracking</b>: recording inputs, results and outputs of every training run in one searchable place.</li>
    <li><b>Experiment</b>: a named group of runs for one problem. <b>Run</b>: one training execution.</li>
    <li><b>Param</b>: a setting chosen before training; logged once; stored as a string.</li>
    <li><b>Metric</b>: a number training produced; can be logged at many steps (a curve).</li>
    <li><b>Artifact</b>: any file from a run, including the model. <b>Tag</b>: free-form metadata (git SHA, data hash).</li>
    <li><b>Signature</b>: expected input columns/types and output type, inferred from <code>input_example</code>.</li>
    <li><b>Flavor</b>: a way to load a model; <b>pyfunc</b> gives every model the same <code>predict()</code>.</li>
    <li><b>Registered model</b>: one name per use case. <b>Version</b>: an immutable, numbered model linked to its run. <b>Alias</b>: a movable pointer such as <code>@champion</code>.</li>
    <li><b>Backend store</b>: database for metadata. <b>Artifact store</b>: object storage for files.</li>
  </ul>
  <h3>Biteful results</h3>
  <table class="tbl">
    <tr><th>Run</th><th>Test MAE</th><th>R²</th><th>Note</th></tr>
    <tr><td>rf_20_4</td><td>3.791</td><td>0.802</td><td>underfits</td></tr>
    <tr><td>rf_50_5</td><td>3.106</td><td>0.863</td><td>Ravi's "0.86" run</td></tr>
    <tr><td>rf_100_8</td><td>2.611</td><td>0.902</td><td>registry version 1</td></tr>
    <tr><td>rf_300_None</td><td>2.752</td><td>0.889</td><td>overfits slightly</td></tr>
    <tr><td>gbr_tuned</td><td>2.41</td><td>0.916</td><td>Optuna, 30 trials, 16 pruned; version 2 = @champion</td></tr>
  </table>
  <h3>Search methods</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Learns from past trials?</th><th>Stops bad trials early?</th></tr>
    <tr><td>Grid</td><td>No</td><td>No</td></tr>
    <tr><td>Random</td><td>No</td><td>No</td></tr>
    <tr><td>TPE</td><td>Yes</td><td>with a pruner</td></tr>
    <tr><td>TPE + median pruner</td><td>Yes</td><td>Yes: worse than the median at the same step</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">mlflow.set_tracking_uri("sqlite:///mlflow.db")      # or http://server:5000
mlflow.set_experiment("biteful-eta")
with mlflow.start_run(run_name="rf_100_8"):
    mlflow.log_params({"n_estimators": 100, "max_depth": 8})
    mlflow.set_tags({"git_sha": sha, "data_md5": md5})
    mlflow.log_metric("mae", mae, step=100)
    mlflow.log_artifact("worst_orders.csv")
    mlflow.sklearn.log_model(model, name="model", input_example=X_te.head(2))
mlflow.sklearn.autolog()                             # training_* metrics only!
mlflow.search_runs(experiment_names=["biteful-eta"],
                   filter_string="metrics.r2 &gt; 0.85", order_by=["metrics.mae ASC"])

study = optuna.create_study(direction="minimize", sampler=optuna.samplers.TPESampler(seed=42),
                            pruner=optuna.pruners.MedianPruner(n_startup_trials=5, n_warmup_steps=2))
# inside objective: trial.suggest_float(...); trial.report(score, step)
#                   if trial.should_prune(): raise optuna.TrialPruned()

mlflow.register_model("models:/&lt;model_id&gt;", "biteful-eta")
client.set_registered_model_alias("biteful-eta", "champion", "2")   # promote / roll back
model = mlflow.pyfunc.load_model("models:/biteful-eta@champion")</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Params are strings: "1000" &lt; "300" when sorted.</li>
    <li>Autolog's scikit-learn metrics are on training data; log test metrics yourself.</li>
    <li>Tune on validation, look at the test set once.</li>
    <li>Use <code>with start_run()</code>; params are write-once.</li>
    <li>Serve <code>@champion</code>, never a hard-coded version; promote only through a gate.</li>
    <li>Stages are deprecated (2.9); aliases replace them.</li>
    <li>The plain-folder store is in maintenance mode in MLflow 3; use SQLite locally.</li>
    <li>Review inferred <code>requirements.txt</code>; tag every run with git SHA and data hash.</li>
  </ul>

  <h2 id="mf-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problems does experiment tracking solve?</summary><div class="qa-body">It makes runs reproducible (each records its params, code SHA, data version and environment), comparable (hundreds of runs can be searched and ranked, such as "R² between 0.85 and 0.87"), shareable (one team history instead of personal spreadsheets) and traceable (you can say which run produced the model in production).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a param, a metric, a tag and an artifact?</summary><div class="qa-body">A param is a setting chosen before training, logged once and stored as a string. A metric is a number produced by the run, a float that can be logged at many steps. A tag is free-form metadata such as the Git SHA or data hash. An artifact is any file, including plots, CSVs and the model folder.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>mlflow.autolog()</code> record, and what is its main pitfall?</summary><div class="qa-body">It hooks into libraries like scikit-learn, XGBoost and PyTorch Lightning and logs all parameters including defaults, some metrics and the model during <code>fit</code>. For scikit-learn the metrics are computed on the training data (training R² 0.946 vs test 0.902 in our example), so ranking runs on them favours overfit models. Log validation or test metrics yourself.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your teammate asks which run scored R² 0.86 last week. How do you find it?</summary><div class="qa-body">Query the tracking store: <code>mlflow.search_runs(filter_string="metrics.r2 &gt; 0.85 AND metrics.r2 &lt; 0.87")</code>, or filter in the UI. The result includes the run's params and tags, so you also get the Git SHA and data hash needed to rebuild it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Grid search vs random search vs Bayesian search (TPE)?</summary><div class="qa-body">Grid search tries every combination of a fixed grid; random search draws independent combinations and covers wide spaces better for the same budget. TPE models which regions produced good and bad trials and samples more from the good ones, so it usually finds better settings with fewer trials. None of the three is magic: the search space and the validation scheme still matter most.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Optuna's pruning work, and what does it need from your code?</summary><div class="qa-body">The objective reports intermediate scores with <code>trial.report(value, step)</code> and checks <code>trial.should_prune()</code>, raising <code>TrialPruned</code> if told to. The median pruner stops a trial whose score at a step is worse than the median of earlier trials at that step. The model must train in steps, such as boosting rounds or epochs; in our search 16 of 30 trials were stopped early.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should hyperparameter tuning not use the test set?</summary><div class="qa-body">Every trial that is scored on the test set leaks information about it into the choice of settings, so after many trials the chosen settings are fitted to those specific rows and the test score becomes optimistic. Tune on a validation split or cross-validation, then evaluate the final choice on the test set once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a model registry, and why not just store model files in a bucket?</summary><div class="qa-body">A registry gives each use case a name, numbers every registered model as an immutable version linked to its training run, and lets you attach aliases and tags. A bucket of files has no lineage, no safe way to say which file is live, and no audit trail of promotions. The registry turns deployment into "load <code>@champion</code>" and makes rollback a pointer move.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Version vs alias vs stage in the MLflow registry?</summary><div class="qa-body">A version is an immutable, numbered model linked to its run. An alias such as <code>@champion</code> is a movable named pointer to exactly one version, used in URIs as <code>models:/name@alias</code>. Stages (None, Staging, Production, Archived) were the older fixed labels, deprecated since MLflow 2.9 because teams needed more flexible names.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Production is serving a bad model. How do you roll back with MLflow?</summary><div class="qa-body">Move the alias back: <code>client.set_registered_model_alias("biteful-eta", "champion", "1")</code>. Serving code that loads <code>@champion</code> picks up version 1 on its next reload or restart, with no code change. Keeping a <code>@previous</code> alias means the last good version is known instantly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a model signature, and why log an input example?</summary><div class="qa-body">The signature records the expected input columns and types and the output type; MLflow infers it from <code>input_example</code>. At prediction time it is enforced, so a request with missing or wrongly typed columns is rejected instead of producing a wrong answer. The example input also documents how to call the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the pyfunc flavor?</summary><div class="qa-body">It is MLflow's generic Python wrapper that gives every logged model, whatever library built it, the same <code>predict()</code> interface. Batch jobs, <code>mlflow models serve</code> and <code>mlflow.pyfunc.load_model</code> all use it, so serving code does not change when the champion switches from a forest to a boosting model or a neural network.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What must be recorded to reproduce a training run exactly?</summary><div class="qa-body">The code version (Git SHA), the data version (hash or snapshot ID), every setting including defaults, the random seeds, and the environment (exact library versions, ideally a Docker image). On GPUs you may also need deterministic algorithms. MLflow records params, tags and the model's environment; the team must make sure the SHA, data hash and seed are logged too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two candidate models differ by 0.05 MAE. Is the better one really better?</summary><div class="qa-body">Not necessarily. In our example three unseeded runs of identical code differed from each other by more than 0.1 minutes from randomness alone. Compare with a fixed seed, and better, average over several seeds or cross-validation folds and check important slices; if the difference stays within noise, prefer the simpler or cheaper model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you set up MLflow for a team of 20 data scientists plus CI?</summary><div class="qa-body">Run one shared tracking server behind authentication, with Postgres or MySQL as the backend store and S3 or GCS as the artifact store (or use a managed service). Everyone and every CI job sets <code>MLFLOW_TRACKING_URI</code>. Agree conventions: one experiment per problem, required tags (git SHA, data version, owner), and registry aliases controlled by the CI gate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between MLflow Tracking and the Model Registry?</summary><div class="qa-body">Tracking records runs: params, metrics, artifacts and tags for every experiment, good or bad. The registry is a curated layer on top for models that might be deployed: named models, versions, aliases and tags. A registry version is trustworthy precisely because it links back to the tracked run that produced it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does MLflow fit into a CI/CD pipeline for models?</summary><div class="qa-body">A training job logs a run and registers a candidate version with a <code>@challenger</code> alias. CI loads the challenger and the champion by alias, runs the gate on fixed data and slices, and if it passes moves <code>@champion</code> and triggers deployment. The serving layer always loads <code>@champion</code>, so promotion and rollback never require code changes.</div></details>
</main>
`
});
