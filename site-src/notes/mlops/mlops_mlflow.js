// notes/mlops/mlops_mlflow.js — MLflow & Experiment Tracking
Object.assign(TOPIC_CONTENT, {
  "mlops_mlflow": `<main>
  <h1>MLflow &amp; Experiment Tracking</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>MLflow &amp; Experiment Tracking</span></div>
  <p class="lead">Every model you train should leave a receipt: which code and data, which settings, what score, which file. MLflow is the most common open-source tool for writing those receipts, for searching them, for picking a winner with a proper hyperparameter search, and for moving the winner to production with a name tag instead of a renamed file. This note continues the Biteful delivery-time project from <em>The ML Lifecycle</em>: same 2,198 clean orders, same features, same six Monday orders. Everything below was run locally with MLflow 3.17, Optuna 5.0 and scikit-learn 1.9, and the outputs are pasted as they came.</p>

  <h2 id="mf-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="mf-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="40" width="190" height="56" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="105" y="62" text-anchor="middle" font-size="12">1 · The ML Lifecycle</text><text x="105" y="80" text-anchor="middle" class="tm" font-size="10">code, data, config versioned</text>
<rect x="235" y="40" width="190" height="56" rx="7" class="fg sg" stroke-width="2.5"/><text x="330" y="62" text-anchor="middle" font-size="12" font-weight="700">2 · MLflow &amp; Tracking</text><text x="330" y="80" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · runs → registry</text>
<rect x="460" y="40" width="190" height="56" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="555" y="62" text-anchor="middle" font-size="12">3 · Shipping Models (map)</text><text x="555" y="80" text-anchor="middle" class="tm" font-size="10">CI/CD, serving, K8s, cloud</text>
<line x1="200" y1="68" x2="233" y2="68" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#mf-a0)"/><line x1="425" y1="68" x2="458" y2="68" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#mf-a0)"/>
<text x="330" y="125" text-anchor="middle" class="tm" font-size="10.5">in: Hydra runs with no shared record · out: models:/biteful-eta@champion (version 2, MAE 2.347)</text>
</svg><figcaption>The middle of the track: from many training runs to one named, versioned model that deployment can ask for.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="mlops_lifecycle">The ML Lifecycle</a></b><span>Code is in Git, data in DVC, settings in Hydra configs; any single model can be rebuilt. Left open: dozens of runs (depth 4, 8, 12, different seeds, Ravi's experiments) leave no shared record of what scored what, and the "winner" is still a file called <code>model.joblib</code>. The handoff to engineering needs a proper contract. <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a> showed grid and random search; here we add tracking, smarter search and a registry around them.</span></li>
    <li><b>This note adds: receipts, search, and a registry</b><span>Tracking (runs, params, metrics, artifacts, tags), autologging, comparing runs, hyperparameter search with Optuna (TPE and pruning), the model registry (versions, aliases, old stages), loading and serving a registered model, and reproducibility (seeds and environments).</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="mlops_deploy">Shipping Models: the map</a>, then <a class="xref" data-note="mlops_cicd">CI/CD for ML</a>, which tests and packages <code>models:/biteful-eta@champion</code> automatically, and <a class="xref" data-note="mlops_serving">Model Serving</a>, which puts it behind a FastAPI server.</span></li>
  </ol>

  <h2 id="mf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Running example: Biteful's delivery-time model on 2,198 clean orders (1,648 train / 550 test). Ravi's question starts it: <em>"Last week one of my runs got R² 0.86. Which settings was that?"</em></p>
  <ol class="story">
    <li><b>Why track</b><span>Q: which run gave 0.86, and with what settings? → Nobody knows; scores live in chat messages. A receipt per run (inputs, results, output file) answers it. A homemade JSON file works for one person; a team needs a shared, searchable store…</span></li>
    <li><b>Runs, params, metrics, artifacts</b><span>Q: what exactly goes on a receipt? → A run holds params (settings, stored as text), metrics (numbers, with steps), artifacts (files), tags (code SHA, data md5). But writing every <code>log_param</code> by hand, we forget the defaults…</span></li>
    <li><b>Logging and autolog</b><span>Q: how do we record real training without forgetting anything? → Log four forest settings by hand (MAE 3.844 … 2.654), or let <code>autolog()</code> capture 18 params. Catch: autolog's scores are on training data (R² 0.947 vs test 0.901). Now there are many runs…</span></li>
    <li><b>Comparing runs</b><span>Q: which run is best, and which was the 0.86 one? → <code>search_runs</code> gives a sorted DataFrame; a filter finds <code>rf_50_5</code> (R² 0.862, git 18d6a1b). But we only compared four settings we guessed…</span></li>
    <li><b>Hyperparameter search with Optuna</b><span>Q: how do we search many settings without wasting compute? → TPE proposes promising settings; the median pruner stopped 14 of 30 trials early. Tuned boosting: test MAE 2.347 vs forest 2.654. Now we have a winner: how does the app get it, and swap it safely?</span></li>
    <li><b>Model registry</b><span>Q: how do we name, version, promote and roll back models? → Versions 1 (forest) and 2 (boosting); the <code>@champion</code> alias moves to v2 after the gate, back to v1 in a rollback drill. How does code use it?</span></li>
    <li><b>Loading and serving</b><span>Q: how does the app get predictions from "the champion"? → <code>pyfunc.load_model("models:/biteful-eta@champion")</code>, or a REST server answering 56.07 minutes for Monday order 2; the signature rejects bad requests. But can we rebuild this exact model later?</span></li>
    <li><b>Reproducibility</b><span>Q: same inputs, same model? → Seeds (no seed: 2.65, 2.579, 2.537; seed 42: 2.659 three times), the environment pinned next to the model, and tags for code and data. Then the next note ships it.</span></li>
  </ol>

  <h2 id="mf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">MLflow &amp; Experiment Tracking</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why track</div>
        <ul>
          <li><b>Reproduce</b> — rebuild from logged params, code SHA, data version</li>
          <li><b>Compare</b> — rank many runs by a metric instead of a spreadsheet</li>
          <li><b>Lineage</b> — which run produced the production model</li>
          <li>💡 a chemist's lab notebook: ingredients, conditions, results, sample jar</li>
          <li>⚠ <b><code>model_final_v3_REAL.pkl</code></b> — the problem tracking fixes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data model</div>
        <ul>
          <li><b>Experiment</b> — named folder of runs; <code>set_experiment("biteful-eta")</code></li>
          <li><b>Run</b> — one training execution; <code>with mlflow.start_run():</code></li>
          <li><b>Param</b> — setting, logged once, stored as a <b>string</b></li>
          <li><b>Metric</b> — number with steps: <code>log_metric("mae", v, step=trees)</code></li>
          <li><b>Artifact</b> — any file; <b>Tag</b> — git SHA, data md5</li>
          <li><b>Stores</b> — file store in maintenance mode; use <code>sqlite:///mlflow.db</code> locally</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging &amp; autolog</div>
        <ul>
          <li><b>Manual</b> — <code>log_params</code>, <code>log_metrics</code>, <code>log_artifact</code>, <code>mlflow.sklearn.log_model(..., input_example=...)</code></li>
          <li><b><code>autolog()</code></b> — 18 params incl. defaults, model, <code>training_*</code> metrics</li>
          <li>⚠ training R² 0.947 vs test 0.901 — log your own test metrics</li>
          <li>⚠ skops: list <code>skops_trusted_types</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Comparing</div>
        <ul>
          <li><b><code>search_runs</code></b> — pandas DataFrame, <code>order_by</code>, <code>filter_string</code></li>
          <li><b>The 0.86 run</b> — <code>metrics.r2 &gt; 0.85 AND metrics.r2 &lt; 0.87</code> → rf_50_5</li>
          <li>⚠ params are strings — "1000" sorts before "300"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Optuna</div>
        <ul>
          <li><b>Study</b> / <b>trial</b> / <b>objective</b> — returns the score to minimise</li>
          <li><b>TPE</b> — learns which regions look good; beats grid and random for the same budget</li>
          <li><b>Pruning</b> — <code>trial.report</code> + <code>should_prune</code>; median pruner stopped 14/30</li>
          <li><b>Tune on validation</b>, check once on test: GBR 2.347 vs RF 2.654</li>
          <li><b>Ray Tune</b> — same idea, many machines</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Registry</div>
        <ul>
          <li><b>Registered model</b> — one name per use case: <code>biteful-eta</code></li>
          <li><b>Version</b> — immutable, auto-numbered, linked to its run</li>
          <li><b>Alias</b> — movable: <code>@champion</code>, <code>@challenger</code>, <code>@previous</code></li>
          <li><b>Rollback</b> — move the alias back</li>
          <li>⚠ <b>Stages</b> (Staging/Production/Archived) deprecated since 2.9</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Serving &amp; repro</div>
        <ul>
          <li><b>Load</b> — <code>mlflow.pyfunc.load_model("models:/biteful-eta@champion")</code></li>
          <li><b>REST</b> — <code>mlflow models serve</code> → POST <code>/invocations</code> → 56.07 min</li>
          <li><b>Signature</b> — wrong columns refused</li>
          <li><b>Seeds</b> — 2.659 every time with seed 42</li>
          <li><b>Env</b> — <code>requirements.txt</code> next to the model; review it</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mf-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Track Experiments</span><span class="rm-sub">Which run gave 0.86?</span></div></div>
      <div class="rm-item rm-done" data-target="mf-concepts"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Runs, Params, Metrics, Artifacts</span><span class="rm-sub">What a run is, on disk</span></div></div>
      <div class="rm-item rm-done" data-target="mf-log"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Logging Biteful's Runs</span><span class="rm-sub">Four forests, one experiment</span></div></div>
      <div class="rm-item rm-done" data-target="mf-auto"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Autologging</span><span class="rm-sub">One line, and its catch</span></div></div>
      <div class="rm-item rm-done" data-target="mf-compare"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Comparing Runs</span><span class="rm-sub">search_runs as a DataFrame</span></div></div>
      <div class="rm-item rm-done" data-target="mf-optuna"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Hyperparameter Search: Optuna</span><span class="rm-sub">TPE and pruning</span></div></div>
      <div class="rm-item rm-done" data-target="mf-reg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Model Registry</span><span class="rm-sub">Versions, aliases, stages</span></div></div>
      <div class="rm-item rm-done" data-target="mf-serve"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Loading &amp; Serving</span><span class="rm-sub">pyfunc and a REST endpoint</span></div></div>
      <div class="rm-item rm-done" data-target="mf-repro"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Reproducibility</span><span class="rm-sub">Seeds and environments</span></div></div>
      <div class="rm-item rm-done" data-target="mf-setup"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Team Server &amp; Projects</span><span class="rm-sub">Stores and MLproject</span></div></div>
      <div class="rm-item rm-done" data-target="mf-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="mf-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Open runs, string params, training scores</span></div></div>
      <div class="rm-item rm-done" data-target="mf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="mf-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mf-why"><span class="num">01</span>Why Track Experiments</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The lifecycle note made every single run rebuildable. But Ravi ran dozens of them last week, and now writes: "one of my runs got R² 0.86, which settings was that?" Nothing in Git, DVC or Hydra's output folders lets us search across runs by score. Where is the list of all runs and their results?</p>
  </div>
  <p>A week of tuning without tracking leaves a folder like this, and scores scattered over chat messages:</p>
  <div class="fx" data-lang="text">model.joblib
model_v2.joblib
model_final.joblib
model_final_v3_REAL.joblib
scores.xlsx        # half the rows say "forgot to note the depth"</div>
  <p>The fix is simple to say: every training run writes a <strong>receipt</strong> automatically, at the moment of training, so nothing depends on memory. A receipt has three parts: the inputs (settings, data version, code version), the results (scores) and the output (the model file).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A chemist's lab notebook. Each experiment gets a page: ingredients (params), conditions (data, environment), results (metrics) and the labelled sample jar (artifacts). Nobody trusts a chemist who says "I think I used 5 grams". Same for an ML engineer who says "I think it was depth 5".</p>
  </div>
  <p>You could build a tiny receipt system yourself. The code appends one JSON line per run to a file, using the three Hydra sweep results from the lifecycle note, then picks the best run by MAE (lower is better).</p>
  <div class="fx" data-lang="py">import json, time

def log_run(params, metrics, model_file):
    receipt = {"time": time.strftime("%Y-%m-%d"), "params": params,
               "metrics": metrics, "model_file": model_file}
    with open("runs.jsonl", "a") as f:                 # one line per training run
        f.write(json.dumps(receipt) + "\\n")

# the three Hydra sweep runs from the lifecycle note, written down as receipts
log_run({"trees": 100, "depth": 4, "data": "orders v2"}, {"mae": 3.77, "r2": 0.803}, "model_a.joblib")
log_run({"trees": 100, "depth": 8, "data": "orders v2"}, {"mae": 2.654, "r2": 0.901}, "model_b.joblib")
log_run({"trees": 100, "depth": 12, "data": "orders v2"}, {"mae": 2.769, "r2": 0.892}, "model_c.joblib")

runs = [json.loads(line) for line in open("runs.jsonl")]
best = min(runs, key=lambda r: r["metrics"]["mae"])
print("best:", best["model_file"], best["params"], best["metrics"])</div>
  <div class="fx" data-lang="text">best: model_b.joblib {'trees': 100, 'depth': 8, 'data': 'orders v2'} {'mae': 2.654, 'r2': 0.901}</div>
  <p>The homemade version already beats the spreadsheet: depth 8, data v2, MAE 2.654. But it breaks down fast: a team of ten can't share one file safely, there are no per-step curves, model files still float around loose, nothing records the code version, and there's no safe way to say "this one is in production". MLflow is the same idea done properly: a database of receipts, a store for files, a web UI, a search API and a registry for production models.</p>
  <table class="tbl">
    <tr><th>Without tracking</th><th>With tracking</th></tr>
    <tr><td><code>model_final_v3_REAL.joblib</code></td><td>Model version 2 of <code>biteful-eta</code>, linked to its run</td></tr>
    <tr><td>"I think it was depth 5 and the March data?"</td><td>Params, data md5 and Git SHA stored with the run</td></tr>
    <tr><td>Scores pasted into a spreadsheet by hand</td><td>Every metric queryable: "R² between 0.85 and 0.87"</td></tr>
    <tr><td>Can't rebuild last month's winner</td><td>Rebuild from the run's recorded inputs</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Experiment tracking</strong> means recording, for every training run, the inputs (settings, data version, code version), the results (scores) and the outputs (the model file) in one searchable place. <strong>MLflow</strong> is an open-source tool that does this, and also stores, versions and serves models.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tracking params and scores but not the <em>data version</em> and <em>code version</em> gives a false sense of safety. Same params on the 2,000-row and the 2,200-row export are different models (MAE 2.44 vs 2.654). Always tag the run with the data hash and the Git SHA.</p>
  </div>
  <p>Where you meet it: almost every ML team uses MLflow or a similar tool (Weights &amp; Biases, Neptune, Comet). Interviewers ask "how do you track experiments?" and "how do you roll back a bad model?"</p>
  <div class="bridge"><b>What this still can't tell us → next: Runs, Params, Metrics, Artifacts.</b> Before logging real runs, what exactly does MLflow store for one run, and where does it put it?</div>

  <h2 id="mf-concepts"><span class="num">02</span>Runs, Params, Metrics, Artifacts</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Receipt" is a metaphor. What are the actual parts of an MLflow receipt, which kind of thing goes into which part, and what does a run look like on disk?</p>
  </div>
  <p>MLflow has a handful of nouns. Each one is a part of the receipt.</p>
  <ul>
    <li>A <strong>run</strong> is one execution of training. One run, one receipt.</li>
    <li>A <strong>param</strong> (parameter) is a setting you chose before training, like <code>max_depth</code>. Logged once.</li>
    <li>A <strong>metric</strong> is a number the training produced, like MAE. It can be logged many times with a <strong>step</strong>, which gives a curve.</li>
    <li>An <strong>artifact</strong> is any file the run produced: a plot, a CSV, the model itself.</li>
    <li>A <strong>tag</strong> is a small note on the run: who ran it, the Git SHA, the data version.</li>
    <li>An <strong>experiment</strong> is a named folder that groups runs for one problem.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school report card. The experiment is "Class 10 board prep". Each run is one mock test. Params are the conditions (open book? 3 hours?). Metrics are the marks, and a weekly marks log over the term is a metric with steps. Artifacts are the answer sheets kept in the file. Tags are notes like "written while ill".</p>
  </div>
  <p>The smallest useful run: one param, and the forest's MAE after 25, 50 and 100 trees as a metric with steps. <code>set_tracking_uri</code> says where receipts are stored. We first ask for the old plain-folder store, to see what a run looks like on disk:</p>
  <div class="fx" data-lang="py">import os, mlflow, pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from features import build_features

df = pd.read_csv("data/clean.csv")                       # 2,198 clean orders (data v2)
X, y = build_features(df), df["minutes"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

mlflow.set_tracking_uri("file:./mlruns")                 # plain folders on disk
try:
    mlflow.set_experiment("tiny-demo")
except Exception as e:
    print(type(e).__name__ + ":", str(e)[:105], "...")
os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"           # opt in, only to look inside a run
mlflow.set_experiment("tiny-demo")

with mlflow.start_run(run_name="first-run") as run:
    mlflow.log_param("max_depth", 8)
    for trees in [25, 50, 100]:                          # a metric with steps = a curve
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
print("metrics/mae -&gt;", open(f"{run_dir}/metrics/mae").read().split("\\n")[:3])</div>
  <div class="fx" data-lang="text">MlflowException: The filesystem tracking backend (e.g., './mlruns') is in maintenance mode and will not receive further up ...
params : {'max_depth': '8'} | type: str
metrics: {'mae': 2.654}
history: [(25, 2.665), (50, 2.659), (100, 2.654)]
params/ ['max_depth']
metrics/ ['mae']
tags/ ['mlflow.runName', 'mlflow.source.name', 'mlflow.source.type', 'mlflow.user']
params/max_depth -&gt; 8
metrics/mae -&gt; ['1792459026434 2.665337090067241 25', '1792459026534 2.6594825232858206 50', '1792459026735 2.654187503255246 100']</div>
  <p>Five things to notice.</p>
  <ol>
    <li>The plain folder store (<code>file:./mlruns</code>) is now refused by default: MLflow 3 keeps it only in "maintenance mode" and recommends a database. We opted in with an environment variable just to look inside; from section 03 on we use <code>sqlite:///mlflow.db</code>, a single local database file.</li>
    <li>The param came back as the string <code>'8'</code>, not the number 8 (this matters in section 05).</li>
    <li><code>r.data.metrics</code> shows only the latest MAE (2.654, after 100 trees), but the full curve is stored and <code>get_metric_history</code> returns it: 2.665 → 2.659 → 2.654.</li>
    <li>On disk a run is just folders: <code>params/</code>, <code>metrics/</code>, <code>tags/</code>, one file per key. MLflow itself added tags such as <code>mlflow.user</code> and <code>mlflow.source.name</code>.</li>
    <li>Each metric line is <code>timestamp value step</code>. A database stores exactly the same three columns.</li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <rect x="10" y="60" width="120" height="44" rx="6" class="fv" stroke="currentColor"/><text x="70" y="80" text-anchor="middle">Experiment</text><text x="70" y="96" text-anchor="middle" class="tm" font-size="11">biteful-eta</text>
    <rect x="170" y="15" width="110" height="34" rx="6" class="fb sb"/><text x="225" y="36" text-anchor="middle">run rf_50_5</text>
    <rect x="170" y="65" width="110" height="34" rx="6" class="fb sb"/><text x="225" y="86" text-anchor="middle">run rf_100_8</text>
    <rect x="170" y="115" width="110" height="34" rx="6" class="fb sb"/><text x="225" y="136" text-anchor="middle">run gbr_tuned</text>
    <g stroke="currentColor" fill="none"><line x1="130" y1="82" x2="170" y2="32"/><line x1="130" y1="82" x2="170" y2="82"/><line x1="130" y1="82" x2="170" y2="132"/>
    <line x1="280" y1="82" x2="320" y2="22"/><line x1="280" y1="82" x2="320" y2="62"/><line x1="280" y1="82" x2="320" y2="102"/><line x1="280" y1="82" x2="320" y2="142"/></g>
    <rect x="320" y="8" width="270" height="28" rx="5" class="fs"/><text x="330" y="27">params: n_estimators=100, max_depth=8</text>
    <rect x="320" y="48" width="270" height="28" rx="5" class="fg"/><text x="330" y="67">metrics: mae=2.654, r2=0.901</text>
    <rect x="320" y="88" width="270" height="28" rx="5" class="ft"/><text x="330" y="107">artifacts: worst_orders.csv, model/</text>
    <rect x="320" y="128" width="270" height="28" rx="5" class="fs"/><text x="330" y="147">tags: git_sha=18d6a1b, data_md5</text>
  </svg><figcaption>An experiment groups runs; each run records four kinds of things.</figcaption></figure>
  <table class="tbl">
    <tr><th>Thing</th><th>What it is</th><th>API</th></tr>
    <tr><td><strong>Experiment</strong></td><td>A named folder of runs for one problem</td><td><code>mlflow.set_experiment("biteful-eta")</code></td></tr>
    <tr><td><strong>Run</strong></td><td>One training execution</td><td><code>with mlflow.start_run():</code></td></tr>
    <tr><td><strong>Param</strong></td><td>Input setting, logged once (stored as string)</td><td><code>log_param</code> / <code>log_params</code></td></tr>
    <tr><td><strong>Metric</strong></td><td>Number; can have many steps (a curve)</td><td><code>log_metric("mae", v, step=trees)</code></td></tr>
    <tr><td><strong>Artifact</strong></td><td>Any file: plot, CSV, model</td><td><code>log_artifact</code>, <code>log_figure</code>, <code>log_dict</code></td></tr>
    <tr><td><strong>Tag</strong></td><td>Free-form note on a run</td><td><code>set_tag("git_sha", "18d6a1b")</code></td></tr>
    <tr><td><strong>Logged model</strong></td><td>Model + environment + signature, its own ID in MLflow 3</td><td><code>mlflow.sklearn.log_model</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>run</strong> is the record of one training execution: its params (settings, write-once strings), metrics (floats with optional steps), artifacts (files), tags (metadata), status and times. The <strong>tracking URI</strong> says where runs are stored: a folder, <code>sqlite:///mlflow.db</code>, or <code>http://server:5000</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Param vs metric is a classic interview question. If you chose it before training, it's a param. If training produced it, it's a metric. "Number of trees" is a param even though it is a number.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Logging Biteful's Runs.</b> One toy run. What does a real comparison of several forest settings look like, with the code version, data version, an extra file and the model itself recorded?</div>

  <h2 id="mf-log"><span class="num">03</span>Logging Biteful's Runs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How many trees and how deep should Biteful's forest be? We will try four settings. How do we make each try leave a complete receipt, including the model file and a list of the orders it got most wrong?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Trying four recipes for the same dal: less water, more water, pressure cooker, slow cook. You note each recipe and how it tasted, and keep a sample in a labelled box. Next week you can make the best one again exactly.</p>
  </div>
  <p>Plan before the code: for each of (20 trees, depth 4), (50, 5), (100, 8), (300, no limit): open a run, record the settings and the code/data versions, train on the 1,648 training orders, score on the 550 test orders, record MAE and R², save the five worst predictions as a CSV, save the model. The data split and features come from section 02's block (same <code>build_features</code> as the lifecycle note).</p>
  <div class="fx" data-lang="py">import mlflow.sklearn
from sklearn.metrics import r2_score
mlflow.set_tracking_uri("sqlite:///mlflow.db")           # one local database file (+ ./mlruns for files)
mlflow.set_experiment("biteful-eta")

for n, depth in [(20, 4), (50, 5), (100, 8), (300, None)]:
    with mlflow.start_run(run_name=f"rf_{n}_{depth}"):
        mlflow.log_params({"n_estimators": n, "max_depth": depth})
        mlflow.set_tags({"git_sha": "18d6a1b", "data_md5": "5c35b2bd"})   # code + data version
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
  <div class="fx" data-lang="text">rf_20_4: MAE=3.844 R2=0.795
rf_50_5: MAE=3.119 R2=0.862
rf_100_8: MAE=2.654 R2=0.901
rf_300_None: MAE=2.796 R2=0.890</div>
  <p>Line by line: <code>log_params</code> writes the two settings. <code>set_tags</code> records the Git SHA and the first characters of the DVC md5 of <code>clean.csv</code>, so the run can be rebuilt (lifecycle note, sections 04–05). <code>log_metrics</code> writes the scores, computed on the <em>test</em> rows. <code>log_artifact</code> uploads any file, here the five worst orders, which is where you start when asking "why is it wrong?". <code>log_model</code> saves the model as a folder. <code>input_example</code> hands MLflow two real rows so it can record the <strong>signature</strong>: the expected column names and types. The server later refuses requests that don't match it (section 08). Leaving the <code>with</code> block ends the run, even if the code inside crashes.</p>
  <p>The scores tell the usual depth story: 20 shallow trees underfit (MAE 3.844), 100 trees of depth 8 do best (2.654), unlimited depth overfits slightly (2.796).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>model signature</strong> is the schema of a model's inputs and outputs: column names, types, and whether each is required. MLflow infers it from <code>input_example</code> and stores it in the model's <code>MLmodel</code> file.</p>
  </div>
  <div class="callout trap"><span class="label">Trap (MLflow 3.x)</span>
    <p>MLflow 3 saves scikit-learn models in the safer <strong>skops</strong> format, not pickle (a pickle file can run arbitrary code when loaded; the serving note demonstrates this). skops refuses to load object types it doesn't know unless you list them in <code>skops_trusted_types</code>; for a forest that is <code>sklearn.tree._tree.Tree</code>. Only list types you have reviewed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Autologging.</b> Four settings logged by hand. A forest has 18 settings; we logged 2. Six months from now, will anyone know what <code>min_samples_leaf</code> was?</div>

  <h2 id="mf-auto"><span class="num">04</span>Autologging</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Manual logging records only what we remember to type. The defaults we never touched also shape the model. Can MLflow record everything by itself?</p>
  </div>
  <p><strong>Autologging</strong> is one line that tells MLflow to watch a library (here scikit-learn) and record what happens during <code>fit</code>: every parameter including defaults, some training metrics, and the model.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A CCTV camera versus a guard's handwritten log. The guard notes what he thinks matters; the camera records everything. But the camera only sees the hallway (training data); it doesn't know how the exam went (test data).</p>
  </div>
  <div class="fx" data-lang="py">mlflow.sklearn.autolog()                                 # or mlflow.autolog() for every library
with mlflow.start_run(run_name="autolog_rf") as run:
    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42).fit(X_tr, y_tr)
mlflow.sklearn.autolog(disable=True)

r = mlflow.get_run(run.info.run_id)
print(len(r.data.params), "params, e.g.", {k: r.data.params[k] for k in ["min_samples_leaf", "max_features"]})
print("metrics:", sorted(r.data.metrics))
print("training_r2_score:", round(r.data.metrics["training_r2_score"], 3),
      "| test R2:", round(r2_score(y_te, model.predict(X_te)), 3))</div>
  <div class="fx" data-lang="text">18 params, e.g. {'min_samples_leaf': '1', 'max_features': '1.0'}
metrics: ['training_mean_absolute_error', 'training_mean_squared_error', 'training_r2_score', 'training_root_mean_squared_error', 'training_score']
training_r2_score: 0.947 | test R2: 0.901</div>
  <p>We typed two settings; MLflow captured 18, including <code>min_samples_leaf=1</code> and <code>max_features=1.0</code>, which we never wrote. But look at the metrics: every one starts with <code>training_</code>. The training R² is 0.947; on the test rows the same model scores 0.901. Autolog measured the model on orders it had already seen. Autolog works for scikit-learn, XGBoost, LightGBM, PyTorch Lightning, Keras and Hugging Face transformers; <code>mlflow.autolog()</code> turns on all of them.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Autologging</strong>: framework-specific hooks (<code>mlflow.&lt;library&gt;.autolog()</code> or <code>mlflow.autolog()</code>) that log parameters, metrics, the model and sometimes plots during <code>fit</code>, with no manual <code>log_*</code> calls.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every autologged scikit-learn metric is a <code>training_*</code> score, like marking a student on the exact questions they practised. Log your own validation/test metrics alongside autolog, and never rank runs on <code>training_*</code> scores.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparing Runs.</b> The experiment now holds five runs. Which is best, and which one was Ravi's R² 0.86?</div>

  <h2 id="mf-compare"><span class="num">05</span>Comparing Runs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Real projects have hundreds of runs. Opening receipts one by one doesn't scale. How do we get a table of runs sorted by score, and find the one run whose R² was about 0.86?</p>
  </div>
  <p><code>mlflow.search_runs</code> returns runs as a pandas DataFrame. Columns are named by kind: <code>params.n_estimators</code>, <code>metrics.mae</code>, <code>tags.git_sha</code>. You filter with a SQL-like string and sort with <code>order_by</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket stats website. Instead of rereading every scorecard, you ask: "all batsmen with average above 50, sorted by strike rate". <code>filter_string</code> is the "above 50"; <code>order_by</code> is the sort.</p>
  </div>
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
           rf_100_8                 100                8        2.654       0.901
        rf_300_None                 300             None        2.796       0.890
            rf_50_5                  50                5        3.119       0.862
            rf_20_4                  20                4        3.844       0.795
the 0.86 run: [{'tags.mlflow.runName': 'rf_50_5', 'params.n_estimators': '50', 'params.max_depth': '5', 'tags.git_sha': '18d6a1b'}]
['1000', '300', '50'] ['50', '300', '1000']</div>
  <p>Read the result. The first query kept the four <code>rf_</code> runs (the autolog run is named differently) and sorted them by MAE, best first: the same ranking we computed in section 03, now produced by a query. The second query answers Ravi: the only run with R² between 0.85 and 0.87 is <code>rf_50_5</code>, 50 trees of depth 5, trained from commit <code>18d6a1b</code>. Question answered in one line, and the run can be rebuilt from its tags. The web UI (<code>mlflow ui --backend-store-uri sqlite:///mlflow.db</code>) shows the same table plus metric curves and parallel-coordinate plots.</p>
  <p>The last line is the string-param trap in plain Python: as text, "1000" sorts before "300" because the character "1" comes before "3".</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>mlflow.search_runs(experiment_names, filter_string, order_by, max_results)</code> returns runs as a DataFrame. Filters use prefixes <code>metrics.</code>, <code>params.</code>, <code>tags.</code>, <code>attributes.</code> (run name, status, start time) and can be combined with <code>AND</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Params are stored as <strong>strings</strong>, so sorting or filtering on them is text comparison. Convert in pandas (<code>runs["params.n_estimators"].astype(int)</code>) or also log the value as a metric.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Hyperparameter Search with Optuna.</b> We compared four settings we guessed. A forest and a boosting model have many settings with endless combinations. How do we search them well, without paying full price for every bad try?</div>

  <h2 id="mf-optuna"><span class="num">06</span>Hyperparameter Search with Optuna</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gradient boosting might beat the forest, but it has a learning rate, a depth, a subsample rate and a number of trees. A grid of 5 values each is 625 trainings. How do we find good settings with, say, 30 tries, and stop obviously bad tries early?</p>
  </div>
  <p>The <a class="xref" data-note="ml_tree_tuning">tuning note</a> covered grid search (try every combination) and random search (try random combinations). Both ignore what earlier tries taught them. <strong>Optuna</strong> is a library that searches smarter:</p>
  <ul>
    <li>You write an <strong>objective</strong> function: given a <strong>trial</strong>, it asks for settings (<code>trial.suggest_float</code>, <code>suggest_int</code>), trains, and returns a score to minimise.</li>
    <li>A <strong>study</strong> calls the objective many times. Its <strong>sampler</strong> decides which settings to try next. The default, <strong>TPE</strong> (Tree-structured Parzen Estimator), splits past trials into "good" and "bad" and proposes settings that look more like the good ones: a Bayesian-style search.</li>
    <li>A <strong>pruner</strong> watches each trial's intermediate scores (<code>trial.report</code>) and stops it early (<code>trial.should_prune()</code>) if it is clearly worse than earlier trials at the same point.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring with a phone screen. Grid search interviews every candidate for a full day. TPE reads the CVs of people who did well and invites similar ones. Pruning is the 15-minute phone screen: a candidate far below the typical score at the screen doesn't get the full day.</p>
  </div>
  <h3>The median pruner, by hand</h3>
  <p>The <strong>median pruner</strong> compares a trial's score at step <em>s</em> with the median of earlier trials' scores at the same step; if it is worse, the trial stops. Below is what happened to trial 5 after 100 trees (step 2): its validation MAE was 3.715. Earlier trials at 100 trees had 2.574, 2.590, 2.633, 2.672, 3.541. Sorted, the middle (3rd of 5) value is <strong>2.633</strong>. 3.715 &gt; 2.633 → pruned, saving the cost of growing trees 101–300.</p>
  <p>The code tunes on a <em>validation</em> slice carved out of the training orders (the test orders stay untouched until the very end). Each trial grows the boosting model 50 trees at a time with <code>warm_start=True</code> (keep the trees already built and add more), reports the validation MAE after each step, and is logged as a <strong>nested</strong> MLflow run inside one parent run, so the experiment shows one search with 30 children.</p>
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
print("trials:", len(states), "complete:", states.count("COMPLETE"), "pruned:", states.count("PRUNED"))
print("best trial", study.best_trial.number, {k: round(v, 3) for k, v in study.best_params.items()},
      "val MAE", round(study.best_value, 3))
p = next(t for t in study.trials if t.state.name == "PRUNED")
last = max(p.intermediate_values)
others = [t.intermediate_values[last] for t in study.trials[:p.number] if last in t.intermediate_values]
print(f"trial {p.number} at {last * 50} trees: val MAE {p.intermediate_values[last]:.3f}")
print("earlier trials at the same step:", sorted(round(v, 3) for v in others),
      "median", round(statistics.median(others), 3), "-&gt; pruned")</div>
  <div class="fx" data-lang="text">trials: 30 complete: 16 pruned: 14
best trial 12 {'learning_rate': 0.088, 'max_depth': 2, 'subsample': 0.733} val MAE 2.524
trial 5 at 100 trees: val MAE 3.715
earlier trials at the same step: [2.574, 2.59, 2.633, 2.672, 3.541] median 2.633 -&gt; pruned</div>
  <p>30 trials, 16 ran to 300 trees, 14 were pruned early. The best settings (trial 12) are a learning rate of about 0.088, depth-2 trees and 73% subsampling, with validation MAE 2.524. Now the one honest check on the untouched test orders, logged as its own run with the same tags as the forests:</p>
  <div class="fx" data-lang="py"># final check of the tuned settings on the untouched test rows, logged as its own run
with mlflow.start_run(run_name="gbr_tuned"):
    gbr = GradientBoostingRegressor(n_estimators=300, random_state=42, **study.best_params).fit(X_tr, y_tr)
    pred = gbr.predict(X_te)
    mlflow.log_params(study.best_params)
    mlflow.set_tags({"git_sha": "18d6a1b", "data_md5": "5c35b2bd"})
    mlflow.log_metrics({"mae": mean_absolute_error(y_te, pred), "r2": r2_score(y_te, pred)})
    mlflow.sklearn.log_model(gbr, name="model", input_example=X_te.head(2),
                             skops_trusted_types=["sklearn.tree._tree.Tree",
                                                  "sklearn._loss.loss.HalfSquaredError",
                                                  "sklearn._loss.link.IdentityLink",
                                                  "sklearn._loss.link.Interval",
                                                  "sklearn.dummy.DummyRegressor"])
print("tuned GBR test MAE:", round(mean_absolute_error(y_te, pred), 3), " R2:", round(r2_score(y_te, pred), 3))</div>
  <div class="fx" data-lang="text">tuned GBR test MAE: 2.347  R2: 0.92</div>
  <p>Tuned boosting: test MAE <strong>2.347</strong>, R² 0.920, versus 2.654 and 0.901 for the best forest. On average about 0.3 minutes closer per order. That is a candidate worth promoting.</p>
  <table class="tbl">
    <tr><th>Search</th><th>How it picks the next try</th><th>For 30 tries</th><th>Use when</th></tr>
    <tr><td>Grid</td><td>Every combination, in order</td><td>Covers only a coarse grid</td><td>1–2 settings, few values</td></tr>
    <tr><td>Random</td><td>Independent random draws</td><td>Better coverage than grid</td><td>Baseline; cheap trials</td></tr>
    <tr><td>TPE (Optuna default)</td><td>Learns from good vs bad past trials</td><td>Concentrates on good regions</td><td>Most tuning jobs</td></tr>
    <tr><td>+ pruning</td><td>Stops trials worse than the median at a step</td><td>14 of 30 stopped early here</td><td>Iterative models (boosting, neural nets)</td></tr>
    <tr><td>Ray Tune</td><td>Same samplers/pruners, run across many machines and GPUs</td><td>Parallel trials</td><td>Big budgets, clusters (can use Optuna's sampler)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Optuna</strong> optimises an objective over a search space: a <strong>study</strong> runs <strong>trials</strong>, a <strong>sampler</strong> (TPE by default) proposes settings, and a <strong>pruner</strong> (e.g. <code>MedianPruner(n_startup_trials, n_warmup_steps)</code>) stops unpromising trials using values reported with <code>trial.report(value, step)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tuning on the test set. If the objective returned the test MAE, 30 trials would quietly fit the settings to those 550 orders and 2.347 would be optimistic. Tune on validation (or cross-validation), then look at the test set once.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Model Registry.</b> We have a winner (run <code>gbr_tuned</code>) and a current best forest. How does the app ask for "the production model", and how do we swap or undo that choice without copying files?</div>

  <h2 id="mf-reg"><span class="num">07</span>Model Registry: Versions, Aliases, Stages</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The app must use the forest today and the tuned boosting model once it passes the gate; if that one misbehaves, we must go back within minutes. Copying <code>.joblib</code> files to a server and editing a path is how outages happen. What gives each model a stable name, a version number, and a safe way to promote and roll back?</p>
  </div>
  <p>The <strong>model registry</strong> gives each use case one name (<code>biteful-eta</code>) and keeps every model you put under that name as a numbered <strong>version</strong>: 1, 2, 3. Versions never change. Separately, you hang movable name tags called <strong>aliases</strong> on versions, such as <code>@champion</code> for "the one production uses". The app always asks for <code>@champion</code>; promoting or rolling back is moving the tag.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket team sheet. Players (versions) stay who they are. The captain's armband (alias) moves between players. Commentators just say "the captain", and the right person is always meant. Rollback is handing the armband back.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 155" width="600">
    <defs><marker id="mf-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="10" y="20">registered model: biteful-eta</text>
    <rect x="20" y="40" width="150" height="44" rx="6" class="fb sb"/><text x="95" y="60" text-anchor="middle">version 1</text><text x="95" y="76" text-anchor="middle" class="tm" font-size="11">rf_100_8 · MAE 2.654</text>
    <rect x="230" y="40" width="150" height="44" rx="6" class="fb sb"/><text x="305" y="60" text-anchor="middle">version 2</text><text x="305" y="76" text-anchor="middle" class="tm" font-size="11">gbr_tuned · MAE 2.347</text>
    <rect x="440" y="40" width="150" height="44" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="515" y="66" text-anchor="middle" class="tm">version 3 …</text>
    <rect x="245" y="105" width="120" height="30" rx="15" class="fg sg"/><text x="305" y="125" text-anchor="middle">@champion</text>
    <rect x="35" y="105" width="120" height="30" rx="15" class="fs" stroke="currentColor"/><text x="95" y="125" text-anchor="middle">@previous</text>
    <path d="M245,128 C200,145 160,145 157,130" class="sr" fill="none" stroke-dasharray="4 3" marker-end="url(#mf-ar1)"/>
    <text x="200" y="152" text-anchor="middle" class="tr" font-size="11">rollback = move alias</text>
  </svg><figcaption>Versions are immutable; aliases are movable pointers. Serving code asks for @champion and never changes.</figcaption></figure>
  <p>The code registers the best forest as version 1 and makes it champion, registers the tuned boosting model as version 2 with the alias <code>@challenger</code>, then runs the <strong>gate</strong>: load both through their aliases, score them on the same test orders, and promote the challenger only if it is better. Then a rollback drill.</p>
  <div class="fx" data-lang="py">from mlflow import MlflowClient
client = MlflowClient()

def logged_model_of(run_name):                       # MLflow 3: a logged model has its own ID
    run = mlflow.search_runs(experiment_names=["biteful-eta"],
                             filter_string=f"attributes.run_name = '{run_name}'").iloc[0]
    return mlflow.search_logged_models(experiment_ids=[run.experiment_id],
               filter_string=f"source_run_id = '{run.run_id}'", output_format="list")[0]

v1 = mlflow.register_model(f"models:/{logged_model_of('rf_100_8').model_id}", "biteful-eta")
client.set_registered_model_alias("biteful-eta", "champion", v1.version)
v2 = mlflow.register_model(f"models:/{logged_model_of('gbr_tuned').model_id}", "biteful-eta")
client.set_registered_model_alias("biteful-eta", "challenger", v2.version)

def test_mae(alias):
    m = mlflow.pyfunc.load_model(f"models:/biteful-eta@{alias}")
    return round(mean_absolute_error(y_te, m.predict(X_te)), 3)
champ, chall = test_mae("champion"), test_mae("challenger")
print("champion v1 MAE:", champ, "| challenger v2 MAE:", chall)
if chall &lt; champ:                                    # the gate: promote only if better
    client.set_registered_model_alias("biteful-eta", "previous", v1.version)
    client.set_registered_model_alias("biteful-eta", "champion", v2.version)
    client.delete_registered_model_alias("biteful-eta", "challenger")
for v in ["1", "2"]:
    print("version", v, "aliases", client.get_model_version("biteful-eta", v).aliases)
client.set_registered_model_alias("biteful-eta", "champion", "1")          # rollback drill
print("after rollback, champion -&gt;", client.get_model_version_by_alias("biteful-eta", "champion").version)
client.set_registered_model_alias("biteful-eta", "champion", "2")          # and forward again
client.set_model_version_tag("biteful-eta", "2", "validated", "true")
print("v2 tags:", client.get_model_version("biteful-eta", "2").tags)</div>
  <div class="fx" data-lang="text">champion v1 MAE: 2.654 | challenger v2 MAE: 2.347
version 1 aliases ['previous']
version 2 aliases ['champion']
after rollback, champion -&gt; 1
v2 tags: {'validated': 'true'}</div>
  <table class="tbl out"><caption>What the aliases pointed to, step by step</caption>
    <tr><th>Step</th><th>@champion</th><th>@challenger</th><th>@previous</th></tr>
    <tr><td>register v1, set alias</td><td>1</td><td>–</td><td>–</td></tr>
    <tr><td>register v2 as challenger</td><td>1</td><td>2</td><td>–</td></tr>
    <tr><td>gate: 2.347 &lt; 2.654 → promote</td><td>2</td><td>–</td><td>1</td></tr>
    <tr><td>rollback drill</td><td>1</td><td>–</td><td>1</td></tr>
    <tr><td>forward again, tag validated</td><td>2</td><td>–</td><td>1</td></tr>
  </table>
  <p>Nothing was copied or deleted; only tags moved. <code>logged_model_of</code> is needed because in MLflow 3 a logged model has its own ID (<code>models:/m-…</code>), linked to the run that made it. A model-version <strong>tag</strong> like <code>validated=true</code> records checks that passed.</p>
  <h3>The old way: stages</h3>
  <p>Before aliases, MLflow had fixed <strong>stages</strong>: None → Staging → Production → Archived, moved with <code>transition_model_version_stage</code>. Interviewers and older tutorials still say "promote to Production", so here is what happens today:</p>
  <div class="fx" data-lang="py">import warnings
with warnings.catch_warnings(record=True) as w:     # the OLD way: fixed stages
    warnings.simplefilter("always")
    client.transition_model_version_stage("biteful-eta", "2", stage="Production")
print("stage of v2:", client.get_model_version("biteful-eta", "2").current_stage)
print("warning:", str(w[0].message)[:95], "...")</div>
  <div class="fx" data-lang="text">stage of v2: Production
warning: \`\`mlflow.tracking.client.MlflowClient.transition_model_version_stage\`\` is deprecated since 2.9. ...</div>
  <p>It still works, but warns that it is deprecated since 2.9. One fixed list of four stages didn't fit teams that need several "live" slots (champion, challenger, shadow, per-region models); aliases allow any names.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Registered model</strong>: a named entry for one use case. <strong>Model version</strong>: an immutable, auto-numbered snapshot linked to the run that produced it. <strong>Alias</strong>: a mutable named pointer to exactly one version, used in URIs as <code>models:/name@alias</code>. <strong>Stage</strong> (deprecated): one of four fixed labels per version.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Promoting by "newest version wins". Version 3 might be worse. Promotion must go through a gate that compares challenger and champion on the same data (and key slices), as above; CI/CD automates exactly this check.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Loading &amp; Serving.</b> The registry says version 2 is champion. How does Python code, or another service over HTTP, actually get predictions from "the champion" without knowing it is a boosting model?</div>

  <h2 id="mf-serve"><span class="num">08</span>Loading &amp; Serving a Registered Model</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The app needs an ETA for each new order. It shouldn't care that the model was a forest yesterday and boosting today, and it shouldn't hard-code a file path. How does it ask for "the champion" and get minutes back?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A universal TV remote. Whatever brand the TV is (sklearn, PyTorch, XGBoost), the remote has the same "power" button: <code>.predict()</code>. That remote is MLflow's <strong>pyfunc</strong> wrapper.</p>
  </div>
  <div class="flow"><span>models:/biteful-eta@champion</span><span>Registry resolves version 2</span><span>Download artifact</span><span>pyfunc.predict()</span></div>
  <div class="fx" data-lang="py">model = mlflow.pyfunc.load_model("models:/biteful-eta@champion")
monday = pd.DataFrame({"distance_km": [2.0, 5.5, 1.2, 3.8, 6.0, 4.5], "items": [2, 3, 1, 4, 2, 5],
                       "rain": [0, 1, 0, 0, 1, 0],
                       "restaurant": ["Dosa Corner", "Biryani House", "Chai Stop", "Pizza Point",
                                      "Dosa Corner", "Biryani House"]})
print("@champion -&gt; version", client.get_model_version_by_alias("biteful-eta", "champion").version,
      "| signature inputs:", [c.name for c in model.metadata.get_input_schema().inputs][:4], "...")
print("Monday ETAs :", model.predict(build_features(monday)).round(1))
print("real minutes: [23 55 14 36 47 43]")</div>
  <div class="fx" data-lang="text">@champion -&gt; version 2 | signature inputs: ['distance_km', 'items', 'rain', 'restaurant_Biryani House'] ...
Monday ETAs : [22.5 56.1 15.8 35.2 47.4 42.2]
real minutes: [23 55 14 36 47 43]</div>
  <p>The URI was resolved to version 2, downloaded and wrapped. On the six Monday orders the champion predicts 22.5, 56.1, 15.8, 35.2, 47.4, 42.2 minutes against the real 23, 55, 14, 36, 47, 43. By hand: errors 0.5, 1.1, 1.8, 0.8, 0.4, 0.8 → sum 5.4 → MAE 0.9 minutes on these six (the forest had 1.33). Other URI forms: <code>models:/biteful-eta/1</code> (a fixed version) and <code>runs:/&lt;run_id&gt;/model</code>.</p>
  <h3>A REST endpoint in one command</h3>
  <p>A <strong>REST endpoint</strong> is a web address that accepts a request and returns an answer. <code>mlflow models serve</code> starts one for the chosen model. First we write Monday order 2 as a request file in MLflow's <code>dataframe_split</code> format:</p>
  <div class="fx" data-lang="py">import json
row = build_features(monday.iloc[[1]])                     # Monday order 2: 5.5 km, rain, Biryani House
json.dump({"dataframe_split": row.to_dict(orient="split", index=False)}, open("req.json", "w"))</div>
  <div class="fx" data-lang="text">$ export MLFLOW_TRACKING_URI=sqlite:///mlflow.db
$ mlflow models serve -m "models:/biteful-eta@champion" -p 5055 --env-manager local &gt; serve.log 2&gt;&amp;1 &amp;
$ sleep 12
$ cat req.json; echo
{"dataframe_split": {"columns": ["distance_km", "items", "rain", "restaurant_Biryani House", "restaurant_Chai Stop", "restaurant_Dosa Corner", "restaurant_Pizza Point"], "data": [[5.5, 3.0, 1.0, 1.0, 0.0, 0.0, 0.0]]}}
$ curl -s -X POST localhost:5055/invocations -H 'Content-Type: application/json' -d @req.json; echo
{"predictions": [56.07054165132324]}
$ curl -s -X POST localhost:5055/invocations -H 'Content-Type: application/json' -d '{"dataframe_split": {"columns": ["distance_km"], "data": [[5.5]]}}' | cut -c1-230
{"error_code": "INVALID_PARAMETER_VALUE", "message": "Failed to predict data '   distance_km\\n0          5.5'. \\nError: Failed to enforce schema of data '   distance_km\\n0          5.5' with schema '['distance_km': double (require
$ kill $!</div>
  <p>The server answered 56.07 minutes for order 2 (real: 55), the same number <code>pyfunc</code> gave. The second request sent only <code>distance_km</code>; the signature recorded in section 03 caught it and refused ("Failed to enforce schema"), instead of silently guessing. <code>--env-manager local</code> means "use the Python environment I'm already in"; without it MLflow builds a fresh environment from the model's own requirements. <code>kill $!</code> stops the background server. <code>mlflow models build-docker</code> wraps the same server into a Docker image; the serving note builds our own FastAPI server instead, with health checks and validation we control.</p>
  <h3>What a logged model contains</h3>
  <p>A logged model is a folder, not a single file. Its <code>MLmodel</code> file is the label on the box: which libraries can load it (<strong>flavors</strong>), the environment files, the format and the trusted types. The first lines of version 2's:</p>
  <div class="fx" data-lang="text">flavors:
  python_function:
    env:
      conda: conda.yaml
      virtualenv: python_env.yaml
    loader_module: mlflow.sklearn
    model_path: model.skops
    predict_fn: predict
    python_version: 3.13.16
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
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Flavor</strong>: a way to load a saved model. Every MLflow model has its native flavor (here <code>sklearn</code>) plus the generic <code>python_function</code> (pyfunc) flavor, which gives the common <code>predict()</code> interface used by <code>load_model</code>, batch jobs and <code>mlflow models serve</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Hard-coding a version (<code>models:/biteful-eta/2</code>) in serving code. A rollback then needs a code change and a redeploy. Load <code>@champion</code> and move the alias instead.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Reproducibility.</b> The champion is served. If an auditor asks in six months "rebuild version 2 exactly", do we have every ingredient, including the random seed and the library versions?</div>

  <h2 id="mf-repro"><span class="num">09</span>Reproducibility: Seeds and Environments</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The lifecycle note showed reruns giving 2.60, 2.45, 2.49. Is a 0.05 improvement real or luck? And will the model behave the same on a server with a different scikit-learn?</p>
  </div>
  <p>Think of making chai. If you don't write down how much sugar and how long you boiled it, tomorrow's chai tastes different and you can't say why. Two hidden ingredients matter here: randomness and the software environment.</p>
  <p>Many steps use random numbers: shuffling, the train/test split, which rows and features each tree sees. A computer's "random" numbers come from a formula that starts at a number called the <strong>seed</strong>. Same seed, same sequence. Dice first, then Biteful's forest:</p>
  <div class="fx" data-lang="py">import random
print("roll 1:", [random.randint(1, 6) for _ in range(5)])
print("roll 2:", [random.randint(1, 6) for _ in range(5)])
random.seed(7); print("seed 7:", [random.randint(1, 6) for _ in range(5)])
random.seed(7); print("seed 7:", [random.randint(1, 6) for _ in range(5)])

def run_once(seed):
    a, b, c, d = train_test_split(X, y, test_size=0.25, random_state=seed)
    m = RandomForestRegressor(n_estimators=50, max_depth=8, random_state=seed).fit(a, c)
    return round(mean_absolute_error(d, m.predict(b)), 3)
print("no seed :", [run_once(None) for _ in range(3)])
print("seed=42 :", [run_once(42) for _ in range(3)])</div>
  <div class="fx" data-lang="text">roll 1: [3, 4, 4, 1, 4]
roll 2: [2, 3, 1, 5, 4]
seed 7: [3, 2, 4, 6, 1]
seed 7: [3, 2, 4, 6, 1]
no seed : [2.65, 2.579, 2.537]
seed=42 : [2.659, 2.659, 2.659]</div>
  <p>Without a seed, three runs of identical code give MAE 2.65, 2.579 and 2.537: a spread of 0.11 minutes from luck alone, bigger than many "improvements". With <code>random_state=42</code> (scikit-learn's name for the seed) every run gives 2.659. Set one seed in the config and pass it to every random step (split, model, NumPy's <code>default_rng(seed)</code>, <code>torch.manual_seed</code> for neural nets).</p>
  <p>The environment is the other half. MLflow wrote it next to the model; the code reads it back from the registry along with the tags and params:</p>
  <div class="fx" data-lang="py"># the environment half of the recipe: MLflow wrote it next to the model
path = mlflow.artifacts.download_artifacts("models:/biteful-eta@champion")
print(sorted(os.listdir(path)))
print(open(f"{path}/requirements.txt").read().strip().replace("\\n", " | "))
run = mlflow.get_run(client.get_model_version_by_alias("biteful-eta", "champion").run_id)
print("rebuild recipe:", {k: run.data.tags[k] for k in ["git_sha", "data_md5"]}, run.data.params)</div>
  <div class="fx" data-lang="text">['MLmodel', 'conda.yaml', 'input_example.json', 'model.skops', 'python_env.yaml', 'registered_model_meta', 'requirements.txt', 'serving_input_example.json']
mlflow==3.17.1 | numpy==2.5.3 | opt-einsum==3.4.0 | pandas==3.0.5 | psutil==7.2.2 | pydot==4.0.1 | pytest==9.1.1 | rich==15.0.0 | scikit-learn==1.9.1 | scipy==1.18.1 | skops==0.16.0 | torch==2.14.1 | tqdm==4.70.1
rebuild recipe: {'git_sha': '18d6a1b', 'data_md5': '5c35b2bd'} {'learning_rate': '0.08820401042222294', 'max_depth': '2', 'subsample': '0.7334866197692369'}</div>
  <p>All the recipe is here: Git SHA <code>18d6a1b</code>, data md5 <code>5c35b2bd…</code>, the three tuned settings, and exact library versions (scikit-learn 1.9.1, numpy 2.5.3, skops 0.16.0). But read the list critically: it also names <code>torch</code>, <code>pytest</code> and <code>rich</code>, which this model does not need. MLflow <em>infers</em> requirements by watching what gets imported when the model loads, and in this environment more got imported. A serving image built from this file would install PyTorch for nothing. Review inferred requirements, or pass <code>pip_requirements=[...]</code> to <code>log_model</code> explicitly.</p>
  <table class="tbl">
    <tr><th>Source of difference</th><th>Pin it with</th><th>Biteful</th></tr>
    <tr><td>Splits, tree randomness, sampling</td><td><code>random_state</code>, <code>np.random.default_rng(seed)</code>, <code>torch.manual_seed</code></td><td>seed 42 in <code>config.yaml</code></td></tr>
    <tr><td>Library versions</td><td><code>requirements.txt</code> with exact pins, <code>uv.lock</code>/<code>poetry.lock</code>, Docker image</td><td>logged next to the model</td></tr>
    <tr><td>Data</td><td>DVC md5, table snapshot</td><td>tag <code>data_md5</code></td></tr>
    <tr><td>Code</td><td>Git SHA</td><td>tag <code>git_sha</code></td></tr>
    <tr><td>GPU non-determinism</td><td><code>torch.use_deterministic_algorithms(True)</code> (slower)</td><td>n/a (CPU model)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>seed</strong> is the starting value of a pseudo-random number generator; fixing it makes every "random" choice repeat exactly. A run is <strong>reproducible</strong> when its code SHA, data version, params, seed and environment are all recorded, so the same model can be rebuilt.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing two runs with different seeds and calling the better one an improvement. Fix the seed for comparisons, or better, compare averages over several seeds or CV folds; 0.05 minutes is within seed noise here.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Team Server &amp; Projects.</b> Everything so far lives in <code>mlflow.db</code> on one laptop. How do twenty people and the CI pipeline share one tracking store and one registry?</div>

  <h2 id="mf-setup"><span class="num">10</span>Team Server &amp; Projects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha's runs are in her <code>mlflow.db</code>, Ravi's in his. The CI pipeline (next notes) must read <code>@champion</code> from somewhere both of them write to. Where does a team keep runs and models?</p>
  </div>
  <p>A team runs one shared <strong>tracking server</strong>. Everyone's code points at it with the <code>MLFLOW_TRACKING_URI</code> environment variable, and the same <code>log_*</code> calls now write there, no code changes. The server keeps small facts (params, metrics, run names, registry entries) in a database, the <strong>backend store</strong>, and big files (models, plots) in object storage, the <strong>artifact store</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library. The catalogue cards sit in a small index cabinet at the front desk: the backend store. The books sit on shelves in the stacks: the artifact store. You search the cabinet fast, then fetch the heavy book only when you need it.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="mf-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="45" width="130" height="40" rx="6" class="fb sb"/><text x="75" y="69" text-anchor="middle">training / CI</text>
    <rect x="210" y="45" width="150" height="40" rx="6" class="fv" stroke="currentColor"/><text x="285" y="69" text-anchor="middle">tracking server</text>
    <rect x="430" y="10" width="160" height="44" rx="6" class="fs" stroke="currentColor"/><text x="510" y="30" text-anchor="middle">backend store</text><text x="510" y="46" text-anchor="middle" class="tm" font-size="11">Postgres/MySQL: metadata</text>
    <rect x="430" y="76" width="160" height="44" rx="6" class="ft st"/><text x="510" y="96" text-anchor="middle">artifact store</text><text x="510" y="112" text-anchor="middle" class="tm" font-size="11">S3/GCS: models, plots</text>
    <g stroke="currentColor" fill="none" marker-end="url(#mf-ar2)"><line x1="140" y1="65" x2="208" y2="65"/><line x1="360" y1="58" x2="428" y2="34"/><line x1="360" y1="72" x2="428" y2="96"/></g>
  </svg><figcaption>Small numbers go to a database; big files go to object storage.</figcaption></figure>
  <div class="fx" data-lang="text"># not run here: needs a Postgres server and an S3 bucket
mlflow server --backend-store-uri postgresql://user:pw@db/mlflow \\
              --artifacts-destination s3://biteful-ml-artifacts --host 0.0.0.0 --port 5000
# every client (laptops, CI, training jobs):
export MLFLOW_TRACKING_URI=http://mlflow.biteful.internal:5000</div>
  <p>Locally, <code>mlflow ui --backend-store-uri sqlite:///mlflow.db</code> gives the same web UI on one machine. Managed options, where someone else runs the server: Databricks, SageMaker managed MLflow, Azure ML (cloud note). Put authentication in front of any shared server: it holds your models.</p>
  <h3>MLflow Projects (brief)</h3>
  <p>A Project is a small text file at the root of a repo that says "here is how to run my training": which environment, which script, which arguments with defaults. Many teams use a <code>dvc.yaml</code> pipeline or a Docker image plus an orchestrator instead; the idea is the same: training should be a command, not a ritual.</p>
  <div class="fx" data-lang="text"># MLproject  (file at repo root; example, not run here)
name: biteful-eta
python_env: python_env.yaml
entry_points:
  main:
    parameters:
      max_depth: {type: int, default: 8}
      seed: {type: int, default: 42}
    command: "python train.py model.max_depth={max_depth} seed={seed}"

$ mlflow run . -P max_depth=4            # or a Git URL</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Tracking server</strong>: a shared MLflow service. <strong>Backend store</strong>: the database for run and registry metadata. <strong>Artifact store</strong>: object storage for files. <strong>MLflow Project</strong>: an <code>MLproject</code> file declaring environment and entry points for <code>mlflow run</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to set <code>MLFLOW_TRACKING_URI</code> on a training machine silently logs to a local <code>mlflow.db</code> or <code>mlruns/</code> there. The run "worked" but nobody can see it. Print <code>mlflow.get_tracking_uri()</code> at the start of training jobs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Ten ideas. How do they line up from Ravi's question to a served champion?</div>

  <h2 id="mf-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Trace one prediction, "Monday order 2 will take 56.1 minutes", back to everything that produced it. Which part of MLflow answers which link?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 290" width="660">
<defs><marker id="mf-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="50" rx="7" class="fb sb"/><text x="110" y="30" text-anchor="middle" font-size="11.5" font-weight="700">Runs (02–04)</text><text x="110" y="47" text-anchor="middle" class="tm" font-size="10">params · metrics · artifacts · tags</text>
<rect x="230" y="10" width="200" height="50" rx="7" class="fb sb"/><text x="330" y="30" text-anchor="middle" font-size="11.5" font-weight="700">Compare (05)</text><text x="330" y="47" text-anchor="middle" class="tm" font-size="10">search_runs → rf_50_5 = R² 0.862</text>
<rect x="450" y="10" width="200" height="50" rx="7" class="fb sb"/><text x="550" y="30" text-anchor="middle" font-size="11.5" font-weight="700">Optuna (06)</text><text x="550" y="47" text-anchor="middle" class="tm" font-size="10">30 trials, 14 pruned → MAE 2.347</text>
<line x1="210" y1="35" x2="228" y2="35" stroke="currentColor" marker-end="url(#mf-a9)"/><line x1="430" y1="35" x2="448" y2="35" stroke="currentColor" marker-end="url(#mf-a9)"/>
<line x1="550" y1="60" x2="400" y2="96" stroke="currentColor" marker-end="url(#mf-a9)"/><line x1="330" y1="60" x2="330" y2="96" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="180" y="98" width="300" height="48" rx="7" class="fg sg"/><text x="330" y="117" text-anchor="middle" font-size="11.5" font-weight="700">Registry (07): biteful-eta</text><text x="330" y="134" text-anchor="middle" class="tm" font-size="10">v1 forest 2.654 · v2 boosting 2.347 · gate → @champion = 2</text>
<line x1="330" y1="146" x2="330" y2="168" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="180" y="170" width="300" height="44" rx="7" class="ft st"/><text x="330" y="188" text-anchor="middle" font-size="11.5" font-weight="700">Serve (08): models:/biteful-eta@champion</text><text x="330" y="204" text-anchor="middle" class="tm" font-size="10">order 2 → 56.07 min · signature refuses bad input</text>
<line x1="330" y1="214" x2="330" y2="236" stroke="currentColor" marker-end="url(#mf-a9)"/>
<rect x="180" y="238" width="300" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="256" text-anchor="middle" font-size="11.5">Reproduce (09): tags + params + requirements</text><text x="330" y="272" text-anchor="middle" class="tm" font-size="10">git 18d6a1b · data 5c35b2bd · seed 42 · sklearn 1.9.1</text>
</svg><figcaption>Receipts feed comparison and search; the best receipt becomes a registry version; an alias serves it; the receipt's tags rebuild it.</figcaption></figure>
  <table class="tbl"><caption>Every idea on the Biteful model</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Tracking</td><td>receipts per run</td><td>which run, which settings?</td><td>homemade JSON → depth 8, 2.654</td><td>every training run</td></tr>
    <tr><td>Run data model</td><td>params, metrics(step), artifacts, tags</td><td>what goes on a receipt?</td><td>MAE 2.665 → 2.659 → 2.654 by trees</td><td>always</td></tr>
    <tr><td>Manual logging</td><td><code>log_*</code> + <code>log_model</code></td><td>record a real comparison</td><td>3.844 / 3.119 / 2.654 / 2.796</td><td>metrics you define (test MAE)</td></tr>
    <tr><td>Autolog</td><td>library hooks</td><td>record everything incl. defaults</td><td>18 params; training R² 0.947 vs test 0.901</td><td>with your own test metrics</td></tr>
    <tr><td>search_runs</td><td>runs as a DataFrame</td><td>best run? the 0.86 run?</td><td>rf_50_5, R² 0.862, SHA 18d6a1b</td><td>picking winners, audits</td></tr>
    <tr><td>Optuna</td><td>objective + TPE + pruner</td><td>which settings, cheaply?</td><td>14/30 pruned; val 2.524; test 2.347</td><td>any non-trivial tuning</td></tr>
    <tr><td>Registry + aliases</td><td>versions + movable pointers</td><td>which model is live; roll back?</td><td>@champion 1 → 2 → 1 → 2</td><td>anything served</td></tr>
    <tr><td>pyfunc / serve</td><td>flavor + signature</td><td>how does code get predictions?</td><td>Monday MAE 0.9; order 2 = 56.07</td><td>batch jobs, quick endpoints</td></tr>
    <tr><td>Reproducibility</td><td>seed + env + tags</td><td>same inputs, same model?</td><td>no seed 2.65/2.579/2.537; seed 2.659 ×3</td><td>every comparison and audit</td></tr>
    <tr><td>Tracking server</td><td>backend + artifact store</td><td>how does a team share it?</td><td>Postgres + S3 (not run)</td><td>teams, CI</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>every run leaves a searchable receipt (params, metrics, artifacts, tags), a search like Optuna produces many such receipts efficiently, the best one becomes an immutable registry version, and a movable alias is what deployment asks for, so promotion and rollback are pointer moves, and the receipt's tags let anyone rebuild it.</strong></p></div>
  <h3>Practise it yourself</h3>
  <ol>
    <li>Run the section 03 loop with your own five settings; add <code>mlflow.log_figure</code> with a plot of predicted vs real minutes.</li>
    <li>Open <code>mlflow ui --backend-store-uri sqlite:///mlflow.db</code> and find your best run by MAE in the table.</li>
    <li>Change the Optuna pruner to <code>n_startup_trials=10</code>; how many trials get pruned now?</li>
    <li>Register your best run, alias it <code>@champion</code>, serve it, curl Monday order 2; roll back and check the answer changes.</li>
  </ol>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The habits that quietly break tracking.</div>

  <h2 id="mf-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which mistakes produce errors like "Run is already active", runs nobody can find, or a "best" model that is really the most overfit?</p>
  </div>
  <p>Two of them produce real errors. A run opened without <code>with</code> stays open, and params can't be changed once logged:</p>
  <div class="fx" data-lang="py">mlflow.start_run(run_name="a")          # opened without "with" ...
mlflow.log_param("max_depth", 8)
try:
    mlflow.start_run(run_name="b")      # ... so this second run clashes
except Exception as e:
    print(type(e).__name__ + ":", str(e).split(".")[0])
mlflow.end_run()                        # close it explicitly
with mlflow.start_run(run_name="b"):
    try:
        mlflow.log_param("max_depth", 8)
        mlflow.log_param("max_depth", 12)    # params are write-once
    except Exception as e:
        print(type(e).__name__ + ":", str(e).split(" for run")[0])</div>
  <div class="fx" data-lang="text">Exception: Run with UUID c06cc7bbbc8b462184db69df91cd2271 is already active
MlflowException: Changing param values is not allowed. Param with key='max_depth' was already logged with value='8'</div>
  <p>The first happens a lot in notebooks: a cell crashed after <code>start_run()</code>, so the run never ended. Use <code>with</code>, or call <code>mlflow.end_run()</code>. The second protects the receipt: a param describes how the run was set up, so it can't be rewritten afterwards. If a setting really changed, that's a new run.</p>
  <div class="callout trap"><span class="label">Trap: ranking on training scores</span><p>Autolog's <code>training_*</code> metrics reward overfitting (0.947 vs 0.901). Log a validation or test metric yourself and rank on that.</p></div>
  <div class="callout trap"><span class="label">Trap: tuning on the test set</span><p>The test score stops being honest. Tune on validation; test once.</p></div>
  <div class="callout trap"><span class="label">Trap: sorting string params</span><p>"1000" &lt; "300" as text. Convert before sorting, or log the value as a metric too.</p></div>
  <div class="callout trap"><span class="label">Trap: no data or code version</span><p>Without <code>data_md5</code> and <code>git_sha</code> tags, a run can't be rebuilt.</p></div>
  <div class="callout trap"><span class="label">Trap: hard-coding versions in serving code</span><p>Rollback becomes a redeploy. Load <code>@champion</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting inferred requirements</span><p>torch and pytest ended up in our model's <code>requirements.txt</code>. Review it or pass <code>pip_requirements</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: logging huge artifacts every step</span><p>A 500 MB checkpoint every epoch fills the artifact store. Log the best checkpoint; log metrics every step.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting the tracking URI</span><p>Runs go to a local file on the training machine. Set <code>MLFLOW_TRACKING_URI</code> in the job's environment.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="mf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful delivery minutes from <code>distance_km</code>, <code>items</code>, <code>rain</code>, <code>restaurant</code>; 2,198 clean orders (data md5 5c35b2bd, Git 18d6a1b), 1,648 train / 550 test. Forest runs (trees, depth → MAE, R²): (20, 4) 3.844, 0.795 · (50, 5) 3.119, <b>0.862</b> · (100, 8) <b>2.654</b>, 0.901 · (300, none) 2.796, 0.890. Optuna: 30 trials, 14 pruned, best val MAE 2.524 → tuned boosting test MAE <b>2.347</b>, R² 0.920. Registry <code>biteful-eta</code>: v1 forest, v2 boosting = @champion. Order 2 (5.5 km, rain, Biryani House, real 55) → 56.07.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Tracking</td><td>which run gave 0.86?</td><td>JSON receipts work for one person</td><td>teams need a shared store</td></tr>
    <tr><td>Run data model</td><td>what's on a receipt?</td><td>params as text; metric with steps</td><td>manual logging forgets defaults</td></tr>
    <tr><td>Logging / autolog</td><td>record without forgetting?</td><td>4 runs; autolog 18 params</td><td>autolog scores are training scores</td></tr>
    <tr><td>Comparing</td><td>best run? the 0.86 run?</td><td>rf_50_5 found by filter</td><td>only guessed settings tried</td></tr>
    <tr><td>Optuna</td><td>good settings cheaply?</td><td>TPE + median pruner, 2.347</td><td>how does the app get the winner?</td></tr>
    <tr><td>Registry</td><td>name, version, promote, roll back?</td><td>@champion 1 → 2, drill back</td><td>how does code use it?</td></tr>
    <tr><td>Serving</td><td>get predictions from "champion"?</td><td>pyfunc; REST 56.07; schema refusal</td><td>can we rebuild it?</td></tr>
    <tr><td>Reproducibility</td><td>same inputs, same model?</td><td>seed 42 → 2.659 ×3; env pinned</td><td>→ ship it (next note)</td></tr>
  </table>
  <h3>Definitions, APIs and formulas</h3>
  <ul>
    <li><strong>MAE</strong> = (1/n) Σ |yᵢ − ŷᵢ| (minutes off on average); <strong>R²</strong> = 1 − Σ(yᵢ − ŷᵢ)² / Σ(yᵢ − ȳ)². Lower MAE / higher R² is better.</li>
    <li><strong>Tracking</strong>: <code>set_tracking_uri("sqlite:///mlflow.db")</code>, <code>set_experiment</code>, <code>with start_run(run_name=...)</code>, <code>log_param(s)</code>, <code>log_metric(key, value, step)</code>, <code>log_artifact</code>, <code>set_tag(s)</code>, <code>mlflow.sklearn.log_model(model, name="model", input_example=...)</code>; <code>get_run</code>, <code>MlflowClient().get_metric_history</code>.</li>
    <li><strong>Autolog</strong>: <code>mlflow.sklearn.autolog()</code> / <code>mlflow.autolog()</code>; metrics are <code>training_*</code>.</li>
    <li><strong>Search</strong>: <code>search_runs(experiment_names, filter_string="metrics.r2 &gt; 0.85 AND …", order_by=["metrics.mae ASC"])</code>.</li>
    <li><strong>Optuna</strong>: <code>create_study(direction, sampler=TPESampler(seed), pruner=MedianPruner(n_startup_trials, n_warmup_steps))</code>, <code>study.optimize(objective, n_trials)</code>; inside: <code>trial.suggest_float(name, low, high, log=True)</code>, <code>suggest_int</code>, <code>trial.report(value, step)</code>, <code>if trial.should_prune(): raise optuna.TrialPruned()</code>. Median rule: prune if value at step s &gt; median of earlier trials at step s.</li>
    <li><strong>Registry</strong>: <code>register_model("models:/&lt;model_id&gt;", name)</code>, <code>set_registered_model_alias(name, alias, version)</code>, <code>get_model_version_by_alias</code>, <code>delete_registered_model_alias</code>, <code>set_model_version_tag</code>; stages via <code>transition_model_version_stage</code> are deprecated (2.9).</li>
    <li><strong>Loading/serving</strong>: <code>mlflow.pyfunc.load_model("models:/name@alias")</code>; URIs <code>models:/name/2</code>, <code>runs:/id/model</code>; <code>mlflow models serve -m URI -p PORT</code> → POST <code>/invocations</code> with <code>dataframe_split</code>.</li>
    <li><strong>Team setup</strong>: <code>mlflow server --backend-store-uri … --artifacts-destination …</code>; clients set <code>MLFLOW_TRACKING_URI</code>.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Manual logging</b><p>Your own validation/test metrics, tags, custom artifacts.</p><small>Easy to forget defaults: pair with autolog</small></div>
    <div><b>Autolog</b><p>Capturing every param and the model with one line.</p><small>Never rank on its training scores</small></div>
    <div><b>Optuna + pruning</b><p>Several settings, iterative models (boosting, nets).</p><small>Overkill for 1 setting with 3 values</small></div>
    <div><b>Aliases</b><p>Anything served or batch-scored.</p><small>Don't load fixed version numbers in apps</small></div>
    <div><b>mlflow models serve</b><p>Quick internal endpoint, demos, batch-like use.</p><small>Production APIs usually need your own server (serving note)</small></div>
    <div><b>Seeds</b><p>Every comparison and audit.</p><small>One seed is still one sample: average a few for close calls</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Ranking on <code>training_*</code> metrics; tuning on the test set; string params sorted as text; no data/code tags; hard-coded versions in serving; trusting inferred requirements; runs left open; forgetting <code>MLFLOW_TRACKING_URI</code>.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>mlflow.log_param("n", 5)</code>, then <code>get_run(id).data.params["n"] + 1</code>?</td><td><code>TypeError</code>: the param comes back as the string <code>'5'</code></td></tr>
    <tr><td>Earlier trials at step 2: 2.574, 2.590, 2.633, 2.672, 3.541. New trial: 3.715. Pruned?</td><td>Yes: median 2.633 and 3.715 &gt; 2.633</td></tr>
    <tr><td>How do you roll back production to version 1?</td><td><code>client.set_registered_model_alias("biteful-eta", "champion", "1")</code>; apps loading @champion pick it up on reload</td></tr>
    <tr><td>Why did the server refuse <code>{"columns": ["distance_km"]}</code>?</td><td>The signature from <code>input_example</code> requires all 7 feature columns</td></tr>
    <tr><td>Three runs without a seed gave 2.65, 2.579, 2.537. What does that mean for a 0.05 "improvement"?</td><td>It is within seed noise: fix the seed or average several</td></tr>
  </table>

  <h2 id="mf-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problems does experiment tracking solve?</summary><div class="qa-body">Reproducibility (rebuild any model from logged params, code SHA and data version), comparison (rank and search hundreds of runs, e.g. "R² between 0.85 and 0.87"), collaboration (one shared history instead of personal spreadsheets) and lineage (which run produced the model in production).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Param vs metric vs tag vs artifact?</summary><div class="qa-body">Param: a setting chosen before training, logged once, stored as a string. Metric: a number the run produced, a float that can have many steps. Tag: free-form metadata such as the Git SHA or data md5. Artifact: any file, including the model folder.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You compare runs using autologged metrics and pick the top one. What's wrong?</summary><div class="qa-body">Autolog's scikit-learn metrics are computed on the training data (training R² 0.947 vs test 0.901 here), so the "best" run is probably the most overfit. Log validation or test metrics yourself.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Optuna's pruning save compute, and what does it need from your code?</summary><div class="qa-body">The objective must report intermediate scores with <code>trial.report(value, step)</code> and check <code>trial.should_prune()</code>; the model must be trainable in steps (boosting rounds, epochs). The median pruner stops trials that are worse than the median of earlier trials at the same step: 14 of 30 Biteful trials stopped before 300 trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>TPE vs grid vs random search?</summary><div class="qa-body">Grid tries every combination of a coarse grid; random draws independent combinations (better coverage); TPE models which regions produced good vs bad trials and samples more from the good ones, so for the same budget it usually finds better settings. Ray Tune runs the same kinds of search across many machines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Version vs alias vs stage in the registry?</summary><div class="qa-body">A version is an immutable, numbered snapshot linked to its run. An alias (e.g. <code>@champion</code>) is a movable pointer to one version; serving loads <code>models:/name@champion</code>, so promotion and rollback are alias moves. Stages (Staging/Production/Archived) were the older fixed labels, deprecated since 2.9.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Production model is misbehaving. How do you roll back with MLflow?</summary><div class="qa-body"><code>client.set_registered_model_alias("biteful-eta", "champion", "1")</code>. Serving code that loads <code>@champion</code> picks up version 1 on its next load or restart. Keep a <code>@previous</code> alias so the last good version is known instantly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a model signature, and why log an input example?</summary><div class="qa-body">The expected input columns/types and output type, inferred from <code>input_example</code>. At serving time it is enforced: our request with only <code>distance_km</code> was refused instead of returning a wrong ETA.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you set up MLflow for a team of 20?</summary><div class="qa-body">A shared tracking server (on Kubernetes, a VM, or managed) with Postgres/MySQL as backend store and S3/GCS as artifact store, behind authentication. Everyone and CI set <code>MLFLOW_TRACKING_URI</code>. Conventions: one experiment per problem, required tags (git SHA, data version), registry aliases for deployment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the registry need tracking underneath it?</summary><div class="qa-body">A registry version is only trustworthy because it links to the run that produced it: params, metrics, Git SHA, data md5 and environment. Without tracking, a version is just a file with a number, and you couldn't say why it is champion or rebuild it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you tune with Optuna but don't fix seeds?</summary><div class="qa-body">Each trial's score includes seed noise (0.11 minutes spread here), so TPE learns from noise and the pruner may stop good settings that drew an unlucky seed. Fix the seed inside the objective (or average over folds) so trials differ only in their settings.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why should serving load <code>@champion</code> rather than the run's model path?</summary><div class="qa-body">The run path names one fixed model; changing models means changing code and redeploying. The alias is a level of indirection: the gate moves it to a better version, a rollback moves it back, and the serving code never changes. CI/CD and Kubernetes notes build on exactly this.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two runs tie on the main metric. How do you choose?</summary><div class="qa-body">Prefer the cheaper or simpler model (fewer trees, lower latency, smaller artifact), then check secondary metrics, per-slice performance (e.g. rainy orders) and stability across seeds or CV folds.</div></details>
</main>
`
});
