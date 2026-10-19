// notes/mlops/mlops_mlflow.js — MLflow & Experiment Tracking
Object.assign(TOPIC_CONTENT, {
  "mlops_mlflow": `<main>
  <h1>MLflow &amp; Experiment Tracking</h1>
  <p class="lead">Every model you train should leave a receipt: what data, which settings, what score, which file. MLflow is the most common open-source tool for writing those receipts, for picking the winner, and for moving the winner to production without renaming files by hand. This note starts from a messy folder of <code>model_final_v3.pkl</code> files and builds up to a registered model served over HTTP with one-command rollback. Everything below was run locally with MLflow 3.17 and scikit-learn 1.9. Builds on <em>The ML Lifecycle</em>.</p>

  <h2 id="mf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">MLflow &amp; Experiment Tracking</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why track</div>
        <ul>
          <li><b>Reproduce</b> — rebuild any model from logged params, code and data version</li>
          <li><b>Compare</b> — rank many runs by a metric instead of a spreadsheet</li>
          <li><b>Lineage</b> — which run produced the production model</li>
          <li>💡 a chemist's lab notebook: ingredients, conditions, results, sample jar</li>
          <li>⚠ <b><code>model_final_v3_REAL.pkl</code></b> — the problem tracking fixes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data model</div>
        <ul>
          <li><b>Experiment</b> — named folder of runs; <code>set_experiment("cancer-rf")</code></li>
          <li><b>Run</b> — one training execution; <code>with mlflow.start_run():</code></li>
          <li><b>Param</b> — input setting, logged once, stored as a <b>string</b></li>
          <li><b>Metric</b> — number, can be per step: <code>log_metric("loss", v, step=e)</code></li>
          <li><b>Artifact</b> — any file: plot, CSV, model folder</li>
          <li><b>Tag</b> — metadata: git SHA, data version, owner</li>
          <li><b>Logged model (MLflow 3)</b> — model with its own ID, linked to its run</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging &amp; autolog</div>
        <ul>
          <li><b>Manual</b> — <code>log_params</code>, <code>log_metrics</code>, <code>mlflow.sklearn.log_model(m, name="model", input_example=...)</code></li>
          <li><b>input_example</b> → signature (column names + types)</li>
          <li><b><code>mlflow.autolog()</code></b> — params (incl. defaults), metrics, model in one line</li>
          <li>⚠ autolog metrics are <code>training_*</code> — log your own test scores</li>
          <li>⚠ <b>skops default</b> — sklearn trees need <code>skops_trusted_types=[...]</code> in MLflow 3.x</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Comparing runs</div>
        <ul>
          <li><b><code>mlflow.search_runs</code></b> — returns a pandas DataFrame</li>
          <li><b>order_by</b> — <code>["metrics.f1 DESC", "params.n_estimators ASC"]</code></li>
          <li><b>filter_string</b> — <code>"attributes.run_name LIKE 'rf_%'"</code>, <code>"metrics.f1 &gt; 0.97"</code></li>
          <li><b>Ties</b> — prefer the cheaper model (rf_100_5 = rf_300_None on F1 0.9721)</li>
          <li>⚠ params are strings — "1000" sorts before "300"</li>
          <li><b>UI</b> — <code>mlflow ui</code>: tables, metric curves, parallel coordinates</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Model registry</div>
        <ul>
          <li><b>Registered model</b> — one name per use case</li>
          <li><b>Version</b> — immutable, auto-numbered, linked to its run</li>
          <li><b>Alias</b> — movable name tag: <code>@champion</code>, <code>@challenger</code></li>
          <li><b>Register</b> — <code>mlflow.register_model("models:/&lt;model_id&gt;", "name")</code></li>
          <li><b>Promote / rollback</b> — <code>client.set_registered_model_alias(name, "champion", v)</code></li>
          <li>⚠ <b>Stages deprecated</b> (since 2.9) — use aliases + tags</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Loading &amp; serving</div>
        <ul>
          <li><b>Load</b> — <code>mlflow.pyfunc.load_model("models:/name@champion")</code></li>
          <li><b>pyfunc</b> — one <code>.predict()</code> for any framework</li>
          <li><b>URIs</b> — <code>models:/name/2</code>, <code>models:/name@alias</code>, <code>runs:/id/model</code></li>
          <li><b>REST</b> — <code>mlflow models serve -m URI -p 5055</code> → POST <code>/invocations</code></li>
          <li><b>Signature enforced</b> — missing columns → <code>SCHEMA_ENFORCEMENT_FAILED</code></li>
          <li><b>MLmodel file</b> — flavors, env files, signature, run_id</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Team setup &amp; mistakes</div>
        <ul>
          <li><b>Tracking server</b> — shared; clients set <code>MLFLOW_TRACKING_URI</code></li>
          <li><b>Backend store</b> — Postgres/MySQL for metadata · <b>artifact store</b> — S3/GCS for files</li>
          <li><b>MLproject</b> — env + entry points; <code>mlflow run . -P n_estimators=300</code></li>
          <li>⚠ run left open → "Run … is already active"; use <code>with</code></li>
          <li>⚠ params are write-once; log data version + git SHA as tags</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mf-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Track Experiments</span><span class="rm-sub">Reproduce and compare</span></div></div>
      <div class="rm-item rm-done" data-target="mf-concepts"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Runs, Params, Metrics, Artifacts</span><span class="rm-sub">The data model</span></div></div>
      <div class="rm-item rm-done" data-target="mf-log"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Logging Three Runs</span><span class="rm-sub">Real sklearn example</span></div></div>
      <div class="rm-item rm-done" data-target="mf-auto"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Autologging</span><span class="rm-sub">One line, and its catch</span></div></div>
      <div class="rm-item rm-done" data-target="mf-compare"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Comparing Runs</span><span class="rm-sub">search_runs as a DataFrame</span></div></div>
      <div class="rm-item rm-done" data-target="mf-reg"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Model Registry</span><span class="rm-sub">Versions, aliases, rollback</span></div></div>
      <div class="rm-item rm-done" data-target="mf-serve"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Loading &amp; Serving</span><span class="rm-sub">pyfunc and a REST endpoint</span></div></div>
      <div class="rm-item rm-done" data-target="mf-setup"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Server Setup &amp; Projects</span><span class="rm-sub">Stores and MLproject</span></div></div>
      <div class="rm-item rm-done" data-target="mf-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">Your own tracked sweep</span></div></div>
      <div class="rm-item rm-done" data-target="mf-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Open runs, string params, training scores</span></div></div>
      <div class="rm-item rm-done" data-target="mf-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mf-why"><span class="num">01</span>Why Track Experiments</h2>
  <p>You are tuning a model for a week. Monday: 50 trees, score 0.91. Tuesday: 200 trees and a new feature, 0.93. Wednesday: you removed the feature, changed the data file, and got 0.94. Or was it 0.92? By Friday your folder looks like this:</p>
  <div class="fx" data-lang="text">model.pkl
model_v2.pkl
model_final.pkl
model_final_v3_REAL.pkl
scores.xlsx        # half the rows say "forgot to note the params"</div>
  <p>Your manager asks: "Which one is best, and what data did it use?" You cannot answer with confidence. The fix is simple to say: every training run writes a <strong>receipt</strong> automatically, at the moment of training, so nothing depends on memory. A receipt has three parts: the inputs (settings, data file, code version), the results (scores) and the output (the model file).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A chemist's lab notebook. Each experiment gets a page: ingredients (params), conditions (data, environment), results (metrics) and the labelled sample jar (artifacts). Nobody trusts a chemist who says "I think I used 5 grams". Same for an ML engineer who says "I think it was depth 5".</p>
  </div>
  <p>You could build a tiny receipt system yourself. The code appends one JSON line per run to a file, then picks the best run by F1.</p>
  <div class="fx" data-lang="py">import json, time

def log_run(params, metrics, model_file):
    receipt = {"time": time.strftime("%Y-%m-%d"), "params": params,
               "metrics": metrics, "model_file": model_file}
    with open("runs.jsonl", "a") as f:            # one line per training run
        f.write(json.dumps(receipt) + "\n")

log_run({"trees": 50, "data": "march.csv"}, {"f1": 0.91}, "model_a.pkl")
log_run({"trees": 200, "data": "march.csv"}, {"f1": 0.93}, "model_b.pkl")
log_run({"trees": 200, "data": "april.csv"}, {"f1": 0.94}, "model_c.pkl")

runs = [json.loads(line) for line in open("runs.jsonl")]
best = max(runs, key=lambda r: r["metrics"]["f1"])
print("best:", best["model_file"], best["params"], best["metrics"])</div>
  <div class="fx" data-lang="text">best: model_c.pkl {'trees': 200, 'data': 'april.csv'} {'f1': 0.94}</div>
  <p>Now the manager's question has an answer: model_c, 200 trees, April data. This homemade version already beats the spreadsheet. But it breaks down fast: a team of ten can't share one file, there are no loss curves per epoch, model files still float around loose, and there's no safe way to say "this one is in production". MLflow is this same idea, done properly: a database of receipts, a store for files, a web UI, and a registry for production models.</p>
  <table class="tbl">
    <tr><th>Without tracking</th><th>With tracking</th></tr>
    <tr><td><code>model_final_v3_REAL.pkl</code></td><td>Model version 3, linked to its run</td></tr>
    <tr><td>"I think it was depth 5 and the March data?"</td><td>Params, data version, Git SHA stored with the run</td></tr>
    <tr><td>Scores pasted into a spreadsheet by hand</td><td>Every metric queryable and plottable</td></tr>
    <tr><td>Can't rebuild last month's winner</td><td>Rebuild from the run's recorded inputs</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Experiment tracking</strong> means recording, for every training run, the inputs (settings, data version, code version), the results (scores) and the outputs (the model file) in one searchable place. <strong>MLflow</strong> is an open-source tool that does this, and also stores, versions and serves models.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tracking params and scores but not the <em>data version</em> and <em>code version</em> gives a false sense of safety. Same params on different data is a different model. Always tag the run with the data hash and the git commit.</p>
  </div>
  <p>Where you meet it: almost every ML team uses MLflow or a similar tool (Weights &amp; Biases, Neptune, Comet). Interviewers ask "how do you track experiments?" and "how do you roll back a bad model?"</p>

  <h2 id="mf-concepts"><span class="num">02</span>Runs, Params, Metrics, Artifacts</h2>
  <p>Before writing real code, learn MLflow's handful of nouns. Each one is a part of the receipt.</p>
  <ul>
    <li>A <strong>run</strong> is one execution of training. One run, one receipt.</li>
    <li>A <strong>param</strong> (parameter) is a setting you chose before training, like the learning rate. Logged once.</li>
    <li>A <strong>metric</strong> is a number the training produced, like loss or accuracy. It can be logged many times, once per step, which gives a curve.</li>
    <li>An <strong>artifact</strong> is any file the run produced: a plot, a CSV, the model itself.</li>
    <li>A <strong>tag</strong> is a small note on the run, like who ran it or which data version.</li>
    <li>An <strong>experiment</strong> is a named folder that groups runs for one problem.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school report card. The experiment is "Class 10 board prep". Each run is one mock test. Params are the conditions (open book? 3 hours?). Metrics are the marks, and a weekly marks log over the term is a metric with steps. Artifacts are the answer sheets kept in the file. Tags are notes like "written while ill".</p>
  </div>
  <p>The smallest possible run: one param and a loss that goes down over three epochs. <code>set_tracking_uri</code> says where to store receipts; here a local SQLite database file. <code>set_experiment</code> picks (or creates) the folder. Everything logged inside the <code>with</code> block belongs to that run.</p>
  <div class="fx" data-lang="py">import mlflow
mlflow.set_tracking_uri("sqlite:///tiny.db")    # where receipts are stored: a local file DB
mlflow.set_experiment("tiny-demo")

with mlflow.start_run(run_name="first-run") as run:
    mlflow.log_param("learning_rate", 0.1)
    for epoch, loss in enumerate([0.9, 0.6, 0.45]):
        mlflow.log_metric("loss", loss, step=epoch)

r = mlflow.get_run(run.info.run_id)
print("params :", r.data.params)
print("metrics:", r.data.metrics)
hist = mlflow.MlflowClient().get_metric_history(run.info.run_id, "loss")
print("history:", [(m.step, m.value) for m in hist])
print("type of lr:", type(r.data.params["learning_rate"]).__name__)</div>
  <div class="fx" data-lang="text">params : {'learning_rate': '0.1'}
metrics: {'loss': 0.45}
history: [(0, 0.9), (1, 0.6), (2, 0.45)]
type of lr: str</div>
  <p>Three things to notice. First, the param came back as the string <code>'0.1'</code>, not the number 0.1; the last line confirms its type is <code>str</code> (this matters in Section 05). Second, <code>r.data.metrics</code> shows only the latest loss. Third, the full curve is still stored, step by step, and <code>get_metric_history</code> returns it. <code>run.info.run_id</code> is the unique id MLflow gave the run; every later lookup uses it.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <rect x="10" y="60" width="120" height="44" rx="6" class="fv" stroke="currentColor"/><text x="70" y="80" text-anchor="middle">Experiment</text><text x="70" y="96" text-anchor="middle" class="tm" font-size="11">cancer-rf</text>
    <rect x="170" y="15" width="110" height="34" rx="6" class="fb sb"/><text x="225" y="36" text-anchor="middle">run rf_10_2</text>
    <rect x="170" y="65" width="110" height="34" rx="6" class="fb sb"/><text x="225" y="86" text-anchor="middle">run rf_100_5</text>
    <rect x="170" y="115" width="110" height="34" rx="6" class="fb sb"/><text x="225" y="136" text-anchor="middle">run rf_300_None</text>
    <g stroke="currentColor" fill="none"><line x1="130" y1="82" x2="170" y2="32"/><line x1="130" y1="82" x2="170" y2="82"/><line x1="130" y1="82" x2="170" y2="132"/>
    <line x1="280" y1="82" x2="320" y2="22"/><line x1="280" y1="82" x2="320" y2="62"/><line x1="280" y1="82" x2="320" y2="102"/><line x1="280" y1="82" x2="320" y2="142"/></g>
    <rect x="320" y="8" width="270" height="28" rx="5" class="fs"/><text x="330" y="27">params: n_estimators=100, max_depth=5</text>
    <rect x="320" y="48" width="270" height="28" rx="5" class="fg"/><text x="330" y="67">metrics: accuracy=0.965, f1=0.9721</text>
    <rect x="320" y="88" width="270" height="28" rx="5" class="ft"/><text x="330" y="107">artifacts: plots, files, model dir</text>
    <rect x="320" y="128" width="270" height="28" rx="5" class="fs"/><text x="330" y="147">tags: git SHA, data version, user</text>
  </svg><figcaption>An experiment groups runs; each run records four kinds of things.</figcaption></figure>
  <table class="tbl">
    <tr><th>Thing</th><th>What it is</th><th>API</th></tr>
    <tr><td><strong>Experiment</strong></td><td>A named folder of runs for one problem</td><td><code>mlflow.set_experiment("cancer-rf")</code></td></tr>
    <tr><td><strong>Run</strong></td><td>One training execution</td><td><code>with mlflow.start_run():</code></td></tr>
    <tr><td><strong>Param</strong></td><td>Input setting, logged once (stored as string)</td><td><code>log_param</code> / <code>log_params</code></td></tr>
    <tr><td><strong>Metric</strong></td><td>Number; can have many steps (a curve)</td><td><code>log_metric("loss", v, step=epoch)</code></td></tr>
    <tr><td><strong>Artifact</strong></td><td>Any file: plot, CSV, model</td><td><code>log_artifact</code>, <code>log_figure</code></td></tr>
    <tr><td><strong>Tag</strong></td><td>Free-form note on a run</td><td><code>set_tag("data_version", "v1")</code></td></tr>
    <tr><td><strong>Logged model</strong></td><td>Model + env + signature, its own ID in MLflow 3</td><td><code>mlflow.sklearn.log_model</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Param vs metric is a classic interview question. If you chose it before training, it's a param. If training produced it, it's a metric. "Number of trees" is a param even though it is a number.</p>
  </div>

  <h2 id="mf-log"><span class="num">03</span>Logging Three Runs</h2>
  <p>Now a real case. We want to know how many trees a random forest needs on the breast-cancer dataset (569 tumours, 30 measurements each, label = malignant or benign). We try three settings. Each setting is one run inside one experiment. Without tracking, you'd train three models and scribble the scores somewhere. With it, every run files its own receipt.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Trying three recipes for the same dal: less water, more water, pressure cooker. You note each recipe and how it tasted, and keep a sample in a labelled box. Next week you can make the best one again exactly.</p>
  </div>
  <p>Worked plan before the code: for each of (10 trees, depth 2), (100 trees, depth 5), (300 trees, no depth limit): open a run, record the settings, train on 75% of the rows, score on the other 25%, record the scores, save the model.</p>
  <div class="fx" data-lang="py">import mlflow, mlflow.sklearn
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

mlflow.set_tracking_uri("sqlite:///mlflow.db")     # local DB; in teams: http://mlflow-server
mlflow.set_experiment("cancer-rf")

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

for n, depth in [(10, 2), (100, 5), (300, None)]:
    with mlflow.start_run(run_name=f"rf_{n}_{depth}"):
        mlflow.log_params({"n_estimators": n, "max_depth": depth})
        mlflow.set_tag("data_version", "breast_cancer_v1")
        model = RandomForestClassifier(n_estimators=n, max_depth=depth,
                                       random_state=42).fit(X_tr, y_tr)
        pred = model.predict(X_te)
        acc, f1 = accuracy_score(y_te, pred), f1_score(y_te, pred)
        mlflow.log_metrics({"accuracy": acc, "f1": f1})
        mlflow.sklearn.log_model(model, name="model", input_example=X_te.head(2),
                                 skops_trusted_types=["sklearn.tree._tree.Tree"])
        print(f"rf_{n}_{depth}: accuracy={acc:.4f} f1={f1:.4f}")</div>
  <div class="fx" data-lang="text">rf_10_2: accuracy=0.9510 f1=0.9605
rf_100_5: accuracy=0.9650 f1=0.9721
rf_300_None: accuracy=0.9650 f1=0.9721</div>
  <p>Line by line: <code>log_params</code> writes the two settings. <code>set_tag</code> records which data was used. <code>log_metrics</code> writes the two scores, computed on the <em>test</em> rows the model never saw. <code>log_model</code> saves the trained model as an artifact folder. <code>input_example</code> hands MLflow two real rows so it can record the <strong>signature</strong>: the expected column names and types. The server later refuses requests that don't match it (Section 07). Leaving the <code>with</code> block ends the run, even if the code inside crashes.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>model signature</strong> is the schema of a model's inputs and outputs: column names, types, and whether each is required. MLflow infers it from <code>input_example</code> and stores it in the model's <code>MLmodel</code> file.</p>
  </div>
  <div class="callout trap"><span class="label">Trap (MLflow 3.x)</span>
    <p>Recent MLflow saves sklearn models in the safer <strong>skops</strong> format, not pickle (pickle files can run arbitrary code when loaded). Without <code>skops_trusted_types</code> our run failed with: <em>"The saved sklearn model references untrusted types … Untrusted types found in the file: ['sklearn.tree._tree.Tree']"</em>. Only list types you have reviewed. More on why pickle is risky: see <em>Deployment Strategies → Packaging</em>.</p>
  </div>

  <h2 id="mf-auto"><span class="num">04</span>Autologging</h2>
  <p>Typing <code>log_param</code> for every setting is boring, and you will forget some, especially the defaults you never typed. Six months later you can't tell whether <code>max_iter</code> was 100 or 1000. <strong>Autologging</strong> is one line that tells MLflow to watch a library (here scikit-learn) and record everything itself: every parameter including defaults, some training metrics, and the model.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A CCTV camera versus a security guard's handwritten log. The guard notes what he thinks matters; the camera records everything, including things nobody thought to write down. But the camera only sees the hallway (training data); it doesn't know how the exam went (test data).</p>
  </div>
  <p>The code turns on sklearn autologging, then fits a scaler + logistic regression pipeline where we set only one parameter, <code>C=0.5</code>. Then we look at what got recorded.</p>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
mlflow.set_experiment("cancer-logreg")

mlflow.sklearn.autolog()          # or mlflow.autolog() for every supported library
with mlflow.start_run(run_name="logreg_autolog") as run:
    make_pipeline(StandardScaler(), LogisticRegression(C=0.5)).fit(X, y)

r = mlflow.get_run(run.info.run_id)
print(len(r.data.params), "params, e.g.", {k: r.data.params[k] for k in
      ["logisticregression__C", "logisticregression__max_iter"]})
print("metrics:", sorted(r.data.metrics))
print("training_accuracy_score:", round(r.data.metrics["training_accuracy_score"], 4))</div>
  <div class="fx" data-lang="text">23 params, e.g. {'logisticregression__C': '0.5', 'logisticregression__max_iter': '100'}
metrics: ['training_accuracy_score', 'training_f1_score', 'training_log_loss', 'training_precision_score', 'training_recall_score', 'training_roc_auc', 'training_score']
training_accuracy_score: 0.9877</div>
  <p>We typed one setting; MLflow captured 23, including <code>max_iter=100</code>, which we never wrote. Param names follow the pipeline's naming: <code>logisticregression__C</code> means "parameter C of the step called logisticregression". Autolog works for sklearn, XGBoost, LightGBM, PyTorch Lightning, Keras and Hugging Face transformers. One more detail from the run's log: autolog saved this model in pickle format and printed a warning recommending skops, the format issue from Section 03.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Autologging</strong>: framework-specific hooks (<code>mlflow.&lt;library&gt;.autolog()</code> or <code>mlflow.autolog()</code>) that log parameters, metrics, the model and sometimes plots during <code>fit</code>, with no manual <code>log_*</code> calls.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every autologged metric starts with <code>training_</code>: scores on data the model already saw, like marking a student on the exact questions they practised. 0.9877 here is optimistic. Log your own validation/test metrics alongside autolog, and never rank runs on <code>training_*</code> scores.</p>
  </div>

  <h2 id="mf-compare"><span class="num">05</span>Comparing Runs</h2>
  <p>Three runs are logged; real projects have three hundred. Opening each receipt one by one doesn't scale. You want a table: one row per run, columns for settings and scores, sorted by the score you care about.</p>
  <p><code>mlflow.search_runs</code> gives exactly that, as a pandas DataFrame. Columns are named by kind: <code>params.n_estimators</code>, <code>metrics.f1</code>, <code>tags.mlflow.runName</code>. You can filter with a SQL-like string and sort with <code>order_by</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket stats website. Instead of rereading every scorecard, you ask: "all batsmen with average above 50, sorted by strike rate". <code>filter_string</code> is the "above 50"; <code>order_by</code> is the sort.</p>
  </div>
  <div class="fx" data-lang="py">runs = mlflow.search_runs(experiment_names=["cancer-rf"],
                          filter_string="attributes.run_name LIKE 'rf_%'",
                          order_by=["metrics.f1 DESC", "params.n_estimators ASC"])
print(type(runs).__name__, runs.shape)
print(runs[["tags.mlflow.runName", "params.n_estimators",
            "params.max_depth", "metrics.accuracy", "metrics.f1"]].round(4).to_string(index=False))
good = mlflow.search_runs(experiment_names=["cancer-rf"], filter_string="metrics.f1 &gt; 0.97")
print("f1 &gt; 0.97:", sorted(good["tags.mlflow.runName"]))</div>
  <div class="fx" data-lang="text">DataFrame (3, 15)
tags.mlflow.runName params.n_estimators params.max_depth  metrics.accuracy  metrics.f1
           rf_100_5                 100                5             0.965      0.9721
        rf_300_None                 300             None             0.965      0.9721
            rf_10_2                  10                2             0.951      0.9605
f1 &gt; 0.97: ['rf_100_5', 'rf_300_None']</div>
  <p>Read the result. The DataFrame has 3 rows and 15 columns (ids, times, status, plus our params, metrics and tags). <code>filter_string</code> kept runs whose name starts with <code>rf_</code>. <code>order_by</code> sorted by F1, highest first, and when F1 tied, by fewer trees first. Two runs tie on F1 0.9721, so the tie-breaker put 100 trees ahead of 300: same quality, a third of the trees, so faster and cheaper to serve. The second query shows a numeric filter on a metric. The web UI (<code>mlflow ui</code>) shows the same table plus metric-curve and parallel-coordinate plots.</p>
  <p>Now the string-param trap from Section 02, in plain Python:</p>
  <div class="fx" data-lang="py">print(sorted(["300", "1000", "50"]), sorted(["300", "1000", "50"], key=int))</div>
  <div class="fx" data-lang="text">['1000', '300', '50'] ['50', '300', '1000']</div>
  <p>As text, "1000" comes first because the character "1" is before "3". Our sort by <code>params.n_estimators</code> only looked right because 100 and 300 have the same number of digits.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>mlflow.search_runs(experiment_names, filter_string, order_by, max_results)</code> returns runs as a pandas DataFrame. Filters use prefixes: <code>metrics.</code>, <code>params.</code>, <code>tags.</code>, <code>attributes.</code> (run name, status, start time).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Params are stored as <strong>strings</strong>, so sorting or filtering on them is text comparison. If you need numeric sorting on a setting, also log it as a metric, or convert the column in pandas (<code>runs["params.n_estimators"].astype(int)</code>) before sorting.</p>
  </div>

  <h2 id="mf-reg"><span class="num">06</span>Model Registry</h2>
  <p>You picked the winner. Now the app must use it. Next month a newer winner must replace it, and if that one misbehaves you must go back within minutes. Doing this by copying <code>.pkl</code> files to a server and editing a path in the app's config is how outages happen: someone copies the wrong file, or nobody remembers which file was running before.</p>
  <p>The <strong>model registry</strong> gives each use case one name ("cancer-classifier") and keeps every model you put under that name as a numbered <strong>version</strong>: 1, 2, 3. Versions never change. Separately, you hang movable name tags called <strong>aliases</strong> on versions, such as <code>@champion</code> for "the one production uses". The app always asks for <code>@champion</code>. Promoting or rolling back is just moving the tag.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket team sheet. Players (versions) stay who they are. The captain's armband (alias) moves between players. Fans and commentators just say "the captain", and the right person is always meant. Rollback is handing the armband back to the previous captain.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 155" width="600">
    <defs><marker id="mf-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="10" y="20">registered model: cancer-classifier</text>
    <rect x="20" y="40" width="150" height="44" rx="6" class="fb sb"/><text x="95" y="60" text-anchor="middle">version 1</text><text x="95" y="76" text-anchor="middle" class="tm" font-size="11">from run rf_100_5</text>
    <rect x="230" y="40" width="150" height="44" rx="6" class="fb sb"/><text x="305" y="60" text-anchor="middle">version 2</text><text x="305" y="76" text-anchor="middle" class="tm" font-size="11">from run rf_300_None</text>
    <rect x="440" y="40" width="150" height="44" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="515" y="66" text-anchor="middle" class="tm">version 3 …</text>
    <rect x="245" y="105" width="120" height="30" rx="15" class="fg sg"/><text x="305" y="125" text-anchor="middle">@champion</text>
    <rect x="35" y="105" width="120" height="30" rx="15" class="fs" stroke="currentColor"/><text x="95" y="125" text-anchor="middle">@previous</text>
    <path d="M245,128 C200,145 160,145 157,130" class="sr" fill="none" stroke-dasharray="4 3" marker-end="url(#mf-ar1)"/>
    <text x="200" y="152" text-anchor="middle" class="tr" font-size="11">rollback = move alias</text>
  </svg><figcaption>Versions are immutable; aliases are movable pointers. Serving code asks for @champion and never changes.</figcaption></figure>
  <p>Registering the best run takes four steps: find the best run, find the model it logged (in MLflow 3 a logged model has its own ID), register that model under a name, and hang the <code>champion</code> alias on the new version.</p>
  <div class="fx" data-lang="py">from mlflow import MlflowClient
best = mlflow.search_runs(experiment_names=["cancer-rf"],
                          order_by=["metrics.f1 DESC", "params.n_estimators ASC"],
                          max_results=1).iloc[0]
# MLflow 3: a logged model has its own ID, linked to the run that made it
lm = mlflow.search_logged_models(experiment_ids=[best.experiment_id],
        filter_string=f"source_run_id = '{best.run_id}'", output_format="list")[0]
mv = mlflow.register_model(f"models:/{lm.model_id}", "cancer-classifier")

client = MlflowClient()
client.set_registered_model_alias("cancer-classifier", "champion", mv.version)
print("best run:", best["tags.mlflow.runName"], "| version:", mv.version)</div>
  <div class="fx" data-lang="text">Successfully registered model 'cancer-classifier'.
Created version '1' of model 'cancer-classifier'.
best run: rf_100_5 | version: 1</div>
  <p><code>.iloc[0]</code> takes the top row of the sorted DataFrame. <code>MlflowClient</code> is the lower-level API for registry operations. Now simulate next month: register the 300-tree model as version 2, promote it, keep a <code>@previous</code> tag on version 1, then roll back.</p>
  <div class="fx" data-lang="py">r2 = mlflow.search_runs(experiment_names=["cancer-rf"],
                        filter_string="attributes.run_name = 'rf_300_None'").iloc[0]
lm2 = mlflow.search_logged_models(experiment_ids=[r2.experiment_id],
        filter_string=f"source_run_id = '{r2.run_id}'", output_format="list")[0]
v2 = mlflow.register_model(f"models:/{lm2.model_id}", "cancer-classifier")
client.set_registered_model_alias("cancer-classifier", "champion", v2.version)   # promote
client.set_registered_model_alias("cancer-classifier", "previous", "1")
for v in ["1", "2"]:
    print("version", v, "aliases", client.get_model_version("cancer-classifier", v).aliases)
client.set_registered_model_alias("cancer-classifier", "champion", "1")          # rollback
print("after rollback, champion -&gt;",
      client.get_model_version_by_alias("cancer-classifier", "champion").version)
client.set_model_version_tag("cancer-classifier", "1", "validated", "true")
print("tags v1:", client.get_model_version("cancer-classifier", "1").tags)</div>
  <div class="fx" data-lang="text">Registered model 'cancer-classifier' already exists. Creating a new version of this model...
Created version '2' of model 'cancer-classifier'.
version 1 aliases ['previous']
version 2 aliases ['champion']
after rollback, champion -&gt; 1
tags v1: {'validated': 'true'}</div>
  <table class="tbl out"><caption>What the champion alias pointed to, step by step</caption>
    <tr><th>Step</th><th>@champion</th><th>@previous</th></tr>
    <tr><td>register v1, set alias</td><td>1</td><td>–</td></tr>
    <tr><td>register v2, promote</td><td>2</td><td>1</td></tr>
    <tr><td>rollback</td><td>1</td><td>1</td></tr>
  </table>
  <p>Nothing was copied or deleted. Version 2 still exists for later study; only the tag moved. A model-version <strong>tag</strong> like <code>validated=true</code> records checks that passed.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Registered model</strong>: a named entry for one use case. <strong>Model version</strong>: an immutable, auto-numbered snapshot linked to the run that produced it. <strong>Alias</strong>: a mutable named pointer to exactly one version, used in URIs as <code>models:/name@alias</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Older tutorials use <strong>stages</strong> (None → Staging → Production → Archived) and <code>transition_model_version_stage</code>. Stages are deprecated since MLflow 2.9; use aliases plus tags. Interviewers may still say "stages", so know both words.</p>
  </div>

  <h2 id="mf-serve"><span class="num">07</span>Loading &amp; Serving</h2>
  <p>The app needs predictions. It shouldn't care that the model is a scikit-learn random forest today and might be XGBoost next month, and it shouldn't hard-code a file path. Two ways: load the model inside your own Python code, or run MLflow's built-in web server and send it HTTP requests. Both ask the registry for <code>@champion</code>, so they always get the current winner.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A universal TV remote. Whatever brand the TV is (sklearn, PyTorch, XGBoost), the remote has the same "power" button: <code>.predict()</code>. That remote is MLflow's <strong>pyfunc</strong> wrapper.</p>
  </div>
  <div class="flow"><span>models:/name@champion</span><span>Registry resolves version</span><span>Download artifact</span><span>pyfunc.predict()</span></div>
  <div class="fx" data-lang="py">model = mlflow.pyfunc.load_model("models:/cancer-classifier@champion")
X, y = load_breast_cancer(return_X_y=True, as_frame=True)
print("pred:", model.predict(X.iloc[[0, 1, 19, 20]]))
print("true:", y.iloc[[0, 1, 19, 20]].values)
print("signature inputs:", len(model.metadata.get_input_schema().inputs), "columns")</div>
  <div class="fx" data-lang="text">pred: [0 0 1 1]
true: [0 0 1 1]
signature inputs: 30 columns</div>
  <p>The URI <code>models:/cancer-classifier@champion</code> was resolved by the registry to version 1 (after the rollback), downloaded, and wrapped. Four predictions match the true labels. The model also carries its signature: 30 required input columns. Other URI forms: <code>models:/name/2</code> (a fixed version) and <code>runs:/&lt;run_id&gt;/model</code> (straight from a run).</p>
  <h3>A REST endpoint in one command</h3>
  <p>A <strong>REST endpoint</strong> is a web address that accepts a request and returns an answer, the way a payment app talks to a bank's server. <code>mlflow models serve</code> starts one for the chosen model. <code>curl</code> is a command-line tool that sends HTTP requests; here it posts a JSON file with two rows. Then a bad request with only one column.</p>
  <div class="fx" data-lang="text">$ export MLFLOW_TRACKING_URI=sqlite:///mlflow.db
$ mlflow models serve -m "models:/cancer-classifier@champion" -p 5055 --env-manager local

$ curl -X POST localhost:5055/invocations -H 'Content-Type: application/json' -d @req.json
{"predictions": [0, 1]}

$ curl -X POST localhost:5055/invocations -H 'Content-Type: application/json' -d @bad.json
{"error_code": "INVALID_PARAMETER_VALUE", "message": "... Model is missing inputs ['mean texture',
 'mean perimeter', 'mean area', ...", "error_class": "SCHEMA_ENFORCEMENT_FAILED", ...}</div>
  <p><code>req.json</code> is <code>{"dataframe_split": {"columns": [...30 names], "data": [[...], [...]]}}</code>, rows 0 and 19 of the dataset, so the answer [0, 1] matches the earlier predictions. <code>bad.json</code> sent only <code>mean radius</code>. The signature recorded in Section 03 caught it and refused, instead of silently returning a wrong answer. (Error message trimmed.) <code>--env-manager local</code> means "use the Python environment I'm already in"; without it MLflow builds a fresh environment from the model's own requirements. <code>mlflow models build-docker</code> wraps the same server into a Docker image.</p>
  <h3>What a logged model contains</h3>
  <p>A logged model is a folder, not a single file. Its <code>MLmodel</code> file is the label on the box: which libraries can load it (<strong>flavors</strong>), which Python packages it needs, the signature, and the run it came from. Here is version 1's, trimmed:</p>
  <div class="fx" data-lang="text">flavors:
  python_function:
    env: {conda: conda.yaml, virtualenv: python_env.yaml}
    loader_module: mlflow.sklearn
    model_path: model.skops
  sklearn:
    serialization_format: skops
    sklearn_version: 1.9.1
    skops_trusted_types: [sklearn.tree._tree.Tree]
mlflow_version: 3.17.1
model_id: m-9aa42502c7004ccca3b03f8994ba4259
run_id: 851f1328399b44739c0d8f59f0e4e687
signature:
  inputs: '[{"type": "double", "name": "mean radius", "required": true}, ...]'
  outputs: '[{"type": "long", "required": true}]'
# sibling files: requirements.txt, conda.yaml, python_env.yaml, input_example.json, model.skops
# requirements.txt: mlflow==3.17.1 numpy==2.5.4 pandas==3.0.6 scikit-learn==1.9.1 scipy==1.18.1 skops==0.16.0</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Flavor</strong>: a way to load a saved model. Every MLflow model has its native flavor (here <code>sklearn</code>) plus the generic <code>python_function</code> (pyfunc) flavor, which gives the common <code>predict()</code> interface.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Serving with a different library version than training (sklearn 1.9 model, sklearn 1.5 server) can fail to load or, worse, load and behave differently. The pinned <code>requirements.txt</code> exists so the serving environment matches; use it.</p>
  </div>

  <h2 id="mf-setup"><span class="num">08</span>Server Setup &amp; Projects</h2>
  <p>So far the receipts lived in a file on one laptop (<code>sqlite:///mlflow.db</code>). A team of twenty can't share a laptop file: runs would be scattered across machines and nobody could compare them. They need one shared place, the <strong>tracking server</strong>. Everyone's code points at it with the <code>MLFLOW_TRACKING_URI</code> environment variable, and the same <code>log_*</code> calls now write there. No code changes.</p>
  <p>The server keeps two kinds of things in two places. Small facts (params, metrics, run names, registry entries) go into a normal database, the <strong>backend store</strong>. Big files (models, plots) go into cloud object storage, the <strong>artifact store</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library. The catalogue cards (title, author, shelf number) sit in a small index cabinet at the front desk: the backend store. The actual books sit on shelves in the stacks: the artifact store. You search the cabinet fast, then fetch the heavy book only when you need it.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="mf-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="45" width="130" height="40" rx="6" class="fb sb"/><text x="75" y="69" text-anchor="middle">training code</text>
    <rect x="210" y="45" width="150" height="40" rx="6" class="fv" stroke="currentColor"/><text x="285" y="69" text-anchor="middle">tracking server</text>
    <rect x="430" y="10" width="160" height="44" rx="6" class="fs" stroke="currentColor"/><text x="510" y="30" text-anchor="middle">backend store</text><text x="510" y="46" text-anchor="middle" class="tm" font-size="11">Postgres/MySQL: metadata</text>
    <rect x="430" y="76" width="160" height="44" rx="6" class="ft st"/><text x="510" y="96" text-anchor="middle">artifact store</text><text x="510" y="112" text-anchor="middle" class="tm" font-size="11">S3/GCS: models, plots</text>
    <g stroke="currentColor" fill="none" marker-end="url(#mf-ar2)"><line x1="140" y1="65" x2="208" y2="65"/><line x1="360" y1="58" x2="428" y2="34"/><line x1="360" y1="72" x2="428" y2="96"/></g>
  </svg><figcaption>Small numbers go to a database; big files go to object storage.</figcaption></figure>
  <div class="fx" data-lang="text">mlflow server --backend-store-uri postgresql://user:pw@db/mlflow \\
              --artifacts-destination s3://ml-artifacts --host 0.0.0.0 --port 5000
# clients:  export MLFLOW_TRACKING_URI=http://mlflow.internal:5000</div>
  <p>Not run here (needs Postgres and S3). Locally, <code>mlflow ui --backend-store-uri sqlite:///mlflow.db</code> gives the same web UI on one machine. Managed options, where someone else runs the server for you: Databricks, SageMaker managed MLflow, Azure ML. Put authentication in front of any shared server: it holds your models.</p>
  <h3>MLflow Projects (brief)</h3>
  <p>A Project is a small text file at the root of a repo that says "here is how to run my training": which environment, which script, which arguments with defaults. Anyone can rerun it with one command, so "it works on my machine" becomes less of an excuse.</p>
  <div class="fx" data-lang="text"># MLproject  (file at repo root; example, not run here)
name: cancer-rf
python_env: python_env.yaml
entry_points:
  main:
    parameters:
      n_estimators: {type: int, default: 100}
      max_depth: {type: int, default: 5}
    command: "python train.py --n {n_estimators} --depth {max_depth}"

$ mlflow run . -P n_estimators=300            # or a Git URL</div>
  <p>Many teams now use Docker images plus a pipeline tool (Airflow, Kubeflow, Prefect) for this instead, but the idea is the same: training should be a command, not a ritual.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Tracking URI</strong>: where the client sends logs: a local folder, <code>sqlite:///file.db</code>, or <code>http://server:5000</code>. <strong>Backend store</strong>: database for run and registry metadata. <strong>Artifact store</strong>: object storage for files.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to set <code>MLFLOW_TRACKING_URI</code> on a training machine silently logs to a local <code>mlruns/</code> folder (or <code>mlflow.db</code>) there. The run "worked" but nobody on the team can see it. Print <code>mlflow.get_tracking_uri()</code> at the start of training jobs.</p>
  </div>

  <h2 id="mf-build"><span class="num">09</span>Build It</h2>
  <p>Practise the full loop once, end to end. Each step uses only what this note showed.</p>
  <ol>
    <li><code>pip install mlflow scikit-learn</code>; run the Section 03 loop with 5 param combinations.</li>
    <li>Add <code>mlflow.set_tag("git_sha", ...)</code> and log a confusion-matrix plot with <code>mlflow.log_figure(fig, "confusion.png")</code>.</li>
    <li>Run <code>mlflow ui --backend-store-uri sqlite:///mlflow.db</code>, open <code>localhost:5000</code>, compare the runs and sort by F1.</li>
    <li>Use <code>search_runs</code> to pick the best in code, register it, alias it <code>@champion</code>, serve it with <code>mlflow models serve</code>, curl it.</li>
    <li>Register a worse model, promote it, then roll back by moving the alias. Restart the server and confirm predictions change back.</li>
    <li>Turn on <code>mlflow.sklearn.autolog()</code> and check which of your own test metrics it does <em>not</em> log.</li>
  </ol>

  <h2 id="mf-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>Two of these produce real errors; the code shows both. A run opened without <code>with</code> stays open, and params can't be changed once logged.</p>
  <div class="fx" data-lang="py">mlflow.start_run(run_name="a")          # opened without "with" ...
mlflow.log_param("lr", 0.1)
try:
    mlflow.start_run(run_name="b")      # ... so this second run clashes
except Exception as e:
    print(type(e).__name__ + ":", str(e).split(".")[0])
mlflow.end_run()                        # close it explicitly
with mlflow.start_run(run_name="b"):
    try:
        mlflow.log_param("lr", 0.1)
        mlflow.log_param("lr", 0.2)     # params are write-once
    except Exception as e:
        print(type(e).__name__ + ":", str(e).split(" for run")[0])</div>
  <div class="fx" data-lang="text">Exception: Run with UUID 3183c0be8e2d4f7a8ef585d92d83ed75 is already active
MlflowException: Changing param values is not allowed. Param with key='lr' was already logged with value='0.1'</div>
  <p>The first error happens a lot in notebooks: a cell crashed after <code>start_run()</code>, so the run never ended. Use <code>with</code>, or call <code>mlflow.end_run()</code>. The second protects the receipt: a param describes how the run was set up, so it can't be rewritten afterwards. If a setting really changed, that's a new run.</p>
  <div class="callout trap"><span class="label">Trap: ranking on training scores</span>
    <p>Autolog's <code>training_*</code> metrics reward overfitting. Always log a validation or test metric yourself and rank on that.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sorting string params</span>
    <p>Params are text: "1000" &lt; "300". Convert before sorting, or log the value as a metric too.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no data or code version</span>
    <p>Without a data hash and git SHA as tags, a run can't be reproduced, which defeats the point of tracking.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: hard-coding versions in serving code</span>
    <p><code>models:/cancer-classifier/2</code> in the app means a rollback needs a code change and a deploy. Load <code>@champion</code> and move the alias instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: logging huge artifacts every step</span>
    <p>Saving a 500 MB checkpoint every epoch fills the artifact store fast. Log the best checkpoint (or every N epochs) and metrics every step.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the tracking URI</span>
    <p>Runs go to a local folder on the training machine and are invisible to the team. Set <code>MLFLOW_TRACKING_URI</code> in the job's environment.</p>
  </div>

  <h2 id="mf-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problems does experiment tracking solve?</summary><div class="qa-body">Reproducibility (rebuild any model from logged params, code version and data version), comparison (rank hundreds of runs by a metric), collaboration (one shared history instead of personal spreadsheets) and lineage (which run produced the model in production).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Param vs metric: what is the difference?</summary><div class="qa-body">A param is a setting you choose before training (trees, learning rate), logged once and stored as a string. A metric is a number the training produces (loss, F1), stored as a float and loggable many times with a <code>step</code>, which gives a curve.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output: <code>mlflow.log_param("n", 5)</code>, then <code>mlflow.get_run(id).data.params["n"] + 1</code>?</summary><div class="qa-body">A <code>TypeError</code>: the param comes back as the string <code>'5'</code>, and Python can't add a string and an int. Convert with <code>int(...)</code> first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You compare runs using autologged metrics and pick the top one. What's wrong?</summary><div class="qa-body">Autolog's sklearn metrics are computed on the training data (<code>training_accuracy_score</code> etc.), so the "best" run is probably the most overfit. Log validation or test metrics yourself, or use <code>mlflow.models.evaluate</code> on a holdout set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two runs tie on the main metric. How do you choose?</summary><div class="qa-body">Prefer the cheaper or simpler model (fewer trees, lower latency, smaller artifact), then check secondary metrics, per-slice performance and stability across seeds or CV folds. In our run, rf_100_5 matched rf_300_None on F1 with a third of the trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Version vs alias in the registry?</summary><div class="qa-body">A version is an immutable snapshot of one model, auto-numbered and linked to the run that produced it. An alias (e.g. <code>@champion</code>) is a movable pointer to one version. Serving loads <code>models:/name@champion</code>, so promoting or rolling back is just moving the alias, with no code change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Production model is misbehaving. How do you roll back with MLflow?</summary><div class="qa-body"><code>client.set_registered_model_alias("cancer-classifier", "champion", "1")</code>. Serving code that loads <code>@champion</code> picks up version 1 on next load or restart. Keep a <code>@previous</code> alias so you know the last good version instantly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a model signature, and why log an input example?</summary><div class="qa-body">The signature is the expected input columns/types and output type. MLflow infers it from <code>input_example</code>. At serving time it enforces it: in our test, a request missing 29 columns was rejected with <code>SCHEMA_ENFORCEMENT_FAILED</code> instead of returning garbage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is pyfunc and why does it matter?</summary><div class="qa-body">The generic "python_function" flavor every MLflow model gets. It exposes one <code>predict()</code> regardless of the training library, so serving code, batch scoring jobs and the REST server don't change when you swap sklearn for XGBoost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you set up MLflow for a team of 20?</summary><div class="qa-body">A shared tracking server (on Kubernetes or a VM, or a managed service) with a Postgres/MySQL backend store for metadata and S3/GCS for artifacts, behind authentication. Everyone sets <code>MLFLOW_TRACKING_URI</code>. Conventions: one experiment per problem, required tags (git SHA, data version), registry aliases for deployment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do MLflow Stages fit today?</summary><div class="qa-body">Stages (Staging / Production / Archived) were the old promotion workflow. They are deprecated since 2.9 because one fixed set of stages didn't fit every team. Aliases (any name, any number) and tags replace them, e.g. <code>@champion</code>, <code>@challenger</code>, tag <code>validated=true</code>.</div></details>
</main>`
});
