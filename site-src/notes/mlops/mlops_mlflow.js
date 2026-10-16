// notes/mlops/mlops_mlflow.js — MLflow & Experiment Tracking
Object.assign(TOPIC_CONTENT, {
  "mlops_mlflow": `<main>
  <h1>MLflow &amp; Experiment Tracking</h1>
  <p class="lead">Every model you train should leave a receipt: what data, which settings, what score, which file. MLflow is the most common open-source tool for writing those receipts, for picking the winner, and for moving the winner to production without renaming files by hand. Everything below was run locally with MLflow 3.17 and scikit-learn 1.9. Builds on <em>The ML Lifecycle</em>.</p>

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
          <li>💡 A chemist's lab notebook: ingredients, conditions, results, sample jar</li>
          <li>⚠ <b><code>model_final_v3_REAL.pkl</code></b> — the problem tracking fixes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data model</div>
        <ul>
          <li><b>Experiment</b> — named folder of runs; <code>set_experiment("cancer-rf")</code></li>
          <li><b>Run</b> — one training execution; <code>with mlflow.start_run():</code></li>
          <li><b>Param</b> — input setting, logged once, stored as string</li>
          <li><b>Metric</b> — number, can be per step: <code>log_metric("loss", v, step=e)</code></li>
          <li><b>Artifact</b> — any file: plot, CSV, model dir</li>
          <li><b>Tag</b> — metadata: git SHA, data version, owner</li>
          <li><b>Logged model (MLflow 3)</b> — model with its own ID, linked to its run</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging &amp; autolog</div>
        <ul>
          <li><b>Manual</b> — <code>log_params</code>, <code>log_metrics</code>, <code>mlflow.sklearn.log_model(m, name="model", input_example=...)</code></li>
          <li><b>input_example</b> — infers the signature (columns + types)</li>
          <li><b><code>mlflow.autolog()</code></b> — params (incl. defaults), metrics, model in one line</li>
          <li>⚠ <b>Autolog metrics are <code>training_*</code></b> — log your own validation/test scores</li>
          <li>⚠ <b>skops default</b> — sklearn trees need <code>skops_trusted_types=[...]</code> in MLflow 3.x</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Comparing runs</div>
        <ul>
          <li><b><code>mlflow.search_runs</code></b> — returns a pandas DataFrame</li>
          <li><b>order_by</b> — <code>["metrics.f1 DESC", "params.n_estimators ASC"]</code></li>
          <li><b>filter_string</b> — <code>"attributes.run_name LIKE 'rf_%'"</code>, <code>"metrics.f1 &gt; 0.9"</code></li>
          <li><b>Ties</b> — prefer the cheaper model (rf_100_5 = rf_300_None on F1 0.9721)</li>
          <li>⚠ <b>Params are strings</b> — "1000" sorts before "300"</li>
          <li><b>UI</b> — <code>mlflow ui</code>: tables, metric curves, parallel coordinates</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Model registry</div>
        <ul>
          <li><b>Registered model</b> — one name per use case</li>
          <li><b>Version</b> — immutable (never changes), auto-numbered, linked to run</li>
          <li><b>Alias</b> — movable name tag: <code>@champion</code>, <code>@challenger</code></li>
          <li><b>Register</b> — <code>mlflow.register_model("models:/&lt;model_id&gt;", "name")</code></li>
          <li><b>Promote / rollback</b> — <code>client.set_registered_model_alias(name, "champion", v)</code></li>
          <li>⚠ <b>Stages deprecated</b> (since 2.9) — Staging/Production replaced by aliases + tags</li>
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
          <li><b>MLmodel file</b> — flavours, env files, signature, run_id; <code>build-docker</code> for images</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Team setup &amp; projects</div>
        <ul>
          <li><b>Tracking server</b> — shared; clients set <code>MLFLOW_TRACKING_URI</code></li>
          <li><b>Backend store</b> — Postgres/MySQL for metadata</li>
          <li><b>Artifact store</b> — S3/GCS for models and files</li>
          <li><b>MLproject</b> — env + entry points; <code>mlflow run . -P n_estimators=300</code></li>
          <li><b>Managed</b> — Databricks, SageMaker, Azure ML</li>
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
      <div class="rm-item rm-done" data-target="mf-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mf-why"><span class="num">01</span>Why Track Experiments</h2>
  <p>You are tuning a model for a week. Monday: 50 trees, score 0.91. Tuesday: 200 trees and a new feature, 0.93. Wednesday: you removed the feature, changed the data file, and got 0.94. Or was it 0.92? By Friday your folder looks like this:</p>
  <div class="fx" data-lang="text">model.pkl
model_v2.pkl
model_final.pkl
model_final_v3_REAL.pkl
scores.xlsx        # half the rows say "forgot to note the params"</div>
  <p>Your manager asks: "Which one is best, and what data did it use?" You cannot answer with confidence. Every trained model needs a receipt that is written automatically, at the moment of training, so nothing depends on memory.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Experiment tracking</strong> means recording, for every training run, the inputs (settings, data version, code version), the results (scores) and the outputs (the model file) in one searchable place. <strong>MLflow</strong> is an open-source tool that does this, and also stores and serves the models.</p>
  </div>
  <table class="tbl">
    <tr><th>Without tracking</th><th>With tracking</th></tr>
    <tr><td><code>model_final_v3_REAL.pkl</code></td><td>Model version 3, linked to its run</td></tr>
    <tr><td>"I think it was depth 5 and the March data?"</td><td>Params, data version, Git SHA stored with the run</td></tr>
    <tr><td>Scores pasted into a spreadsheet by hand</td><td>Every metric queryable and plottable</td></tr>
    <tr><td>Can't rebuild last month's winner</td><td>Rebuild from the run's recorded inputs</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A lab notebook for a chemist. Each experiment gets a page: ingredients (params), conditions (data, env), results (metrics) and the sample jar (artifacts). Nobody trusts a chemist who says "I think I used 5 grams".</p>
  </div>
  <p>Where you meet it: almost every ML team uses MLflow or a similar tool (Weights &amp; Biases, Neptune). Interviewers ask "how do you track experiments?" and "how do you roll back a model?"</p>

  <h2 id="mf-concepts"><span class="num">02</span>Runs, Params, Metrics, Artifacts</h2>
  <p>MLflow has a handful of nouns. Start with the smallest example, then the picture.</p>
  <ul>
    <li>A <strong>run</strong> is one execution of training. One run, one receipt.</li>
    <li>A <strong>param</strong> (parameter) is a setting you chose before training, like the learning rate. Logged once.</li>
    <li>A <strong>metric</strong> is a number the training produced, like loss or accuracy. It can be logged many times, once per step, which gives a curve.</li>
    <li>An <strong>artifact</strong> is any file the run produced: a plot, a CSV, the model itself.</li>
    <li>A <strong>tag</strong> is a small note on the run, like who ran it or which data version.</li>
    <li>An <strong>experiment</strong> is a named folder that groups runs for one problem.</li>
  </ul>
  <p>A tiny run with one param and a loss that goes down over three epochs:</p>
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
print("history:", [(m.step, m.value) for m in hist])</div>
  <div class="fx" data-lang="text">params : {'learning_rate': '0.1'}
metrics: {'loss': 0.45}
history: [(0, 0.9), (1, 0.6), (2, 0.45)]</div>
  <p>Three things to notice. The param came back as the string <code>'0.1'</code>, not the number 0.1 (this matters later). <code>r.data.metrics</code> shows only the latest loss. The full curve is still there, through <code>get_metric_history</code>.</p>
  <p>The picture shows how the nouns nest: one experiment holds many runs, and each run records four kinds of things.</p>
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
    <tr><td><strong>Logged model</strong></td><td>Model + env + signature, its own ID in MLflow 3</td><td><code>mlflow.sklearn.log_model</code></td></tr>
  </table>

  <h2 id="mf-log"><span class="num">03</span>Logging Three Runs</h2>
  <p>Now a real case. We want to know how many trees a random forest needs for a cancer dataset. We try three settings. Each setting is one run inside one experiment. The <code>with</code> block opens the run; everything logged inside belongs to it; leaving the block closes it.</p>
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
        model = RandomForestClassifier(n_estimators=n, max_depth=depth,
                                       random_state=42).fit(X_tr, y_tr)
        pred = model.predict(X_te)
        mlflow.log_metrics({"accuracy": accuracy_score(y_te, pred),
                            "f1": f1_score(y_te, pred)})
        mlflow.sklearn.log_model(model, name="model", input_example=X_te.head(2),
                                 skops_trusted_types=["sklearn.tree._tree.Tree"])</div>
  <p>Line by line: <code>log_params</code> writes the two settings. <code>log_metrics</code> writes the two scores on the <em>test</em> rows. <code>log_model</code> saves the trained model as an artifact. <code>input_example</code> hands MLflow two real rows so it can record the <strong>signature</strong>: the expected column names and types. The server later refuses requests that don't match it.</p>
  <div class="callout trap"><span class="label">Trap (MLflow 3.x)</span>
    <p>Recent MLflow saves sklearn models in the safer <strong>skops</strong> format, not pickle. Without <code>skops_trusted_types</code> this run failed: <em>"The saved sklearn model references untrusted types … ['sklearn.tree._tree.Tree']"</em>. Only trust types you reviewed. Why pickle is dangerous: see <em>Deployment Strategies → Packaging</em>.</p>
  </div>

  <h2 id="mf-auto"><span class="num">04</span>Autologging</h2>
  <p>Typing <code>log_param</code> for every setting is boring, and you will forget some. <strong>Autologging</strong> is one line that tells MLflow to watch the library (here scikit-learn) and record everything itself: every param including the defaults you never typed, training metrics, and the model.</p>
  <div class="fx" data-lang="py">mlflow.sklearn.autolog()          # or mlflow.autolog() for every supported library
with mlflow.start_run(run_name="logreg_autolog") as run:
    make_pipeline(StandardScaler(), LogisticRegression(C=0.5)).fit(X, y)

r = mlflow.get_run(run.info.run_id)
print(len(r.data.params), "params, e.g.", {k: r.data.params[k] for k in
      ["logisticregression__C", "logisticregression__max_iter"]})
print("metrics:", sorted(r.data.metrics))</div>
  <div class="fx" data-lang="text">23 params, e.g. {'logisticregression__C': '0.5', 'logisticregression__max_iter': '100'}
metrics: ['training_accuracy_score', 'training_f1_score', 'training_log_loss', 'training_precision_score', 'training_recall_score', 'training_roc_auc', 'training_score']</div>
  <p>We typed one setting (<code>C=0.5</code>); it captured 23, including <code>max_iter=100</code> which we never wrote. Works for sklearn, XGBoost, LightGBM, PyTorch Lightning, Keras, transformers.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every autologged metric starts with <code>training_</code>: scores on data the model has already seen, like marking a student on the exact questions they practised. Log your own validation/test metrics; never compare runs on training scores.</p>
  </div>

  <h2 id="mf-compare"><span class="num">05</span>Comparing Runs</h2>
  <p>Three runs are logged. Which is best? Instead of opening each receipt, ask MLflow for a table. <code>search_runs</code> returns a pandas DataFrame, so you can sort and filter like any table.</p>
  <div class="fx" data-lang="py">runs = mlflow.search_runs(experiment_names=["cancer-rf"],
                          filter_string="attributes.run_name LIKE 'rf_%'",
                          order_by=["metrics.f1 DESC", "params.n_estimators ASC"])
print(runs[["tags.mlflow.runName", "params.n_estimators",
            "params.max_depth", "metrics.accuracy", "metrics.f1"]].round(4).to_string(index=False))</div>
  <div class="fx" data-lang="text">tags.mlflow.runName params.n_estimators params.max_depth  metrics.accuracy  metrics.f1
           rf_100_5                 100                5             0.965      0.9721
        rf_300_None                 300             None             0.965      0.9721
            rf_10_2                  10                2             0.951      0.9605</div>
  <p><code>filter_string</code> keeps only runs whose name starts with <code>rf_</code>. <code>order_by</code> sorts by F1 (highest first) and, when F1 ties, by fewer trees first. Two runs tie on F1 0.9721. The tie-breaker prefers 100 trees over 300: same quality, 3× cheaper to serve. The UI (<code>mlflow ui</code>) shows the same table plus parallel-coordinate and metric-curve plots.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Params are stored as <strong>strings</strong>. Sorting works here only because 100 and 300 have the same number of digits. As text, "1000" sorts before "300", because "1" comes before "3".</p>
  </div>

  <h2 id="mf-reg"><span class="num">06</span>Model Registry</h2>
  <p>You picked the winner. Now the app must use it, and next month a newer winner must replace it, and if that one misbehaves you must go back fast. Doing this by copying files around is how outages happen.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>model registry</strong> is a shelf of saved models under one name per use case, with auto-numbered <strong>versions</strong> (1, 2, 3 …) that never change, and movable name tags called <strong>aliases</strong> (like <code>@champion</code>) that point at one version.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket team sheet. Players (versions) stay who they are. The captain's armband (alias) moves between players. Fans and commentators just say "the captain", and the right person is always meant. Rollback is handing the armband back.</p>
  </div>
  <p>In the picture, the serving code only ever asks for <code>@champion</code>. Moving that tag from version 2 back to version 1 is the rollback.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="mf-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="10" y="20">registered model: cancer-classifier</text>
    <rect x="20" y="40" width="150" height="44" rx="6" class="fb sb"/><text x="95" y="60" text-anchor="middle">version 1</text><text x="95" y="76" text-anchor="middle" class="tm" font-size="11">from run rf_100_5</text>
    <rect x="230" y="40" width="150" height="44" rx="6" class="fb sb"/><text x="305" y="60" text-anchor="middle">version 2</text><text x="305" y="76" text-anchor="middle" class="tm" font-size="11">from run rf_300_None</text>
    <rect x="440" y="40" width="150" height="44" rx="6" class="fs" stroke="currentColor" stroke-dasharray="4 3"/><text x="515" y="66" text-anchor="middle" class="tm">version 3 …</text>
    <rect x="245" y="105" width="120" height="30" rx="15" class="fg sg"/><text x="305" y="125" text-anchor="middle">@champion</text>
    <rect x="35" y="105" width="120" height="30" rx="15" class="fs" stroke="currentColor"/><text x="95" y="125" text-anchor="middle">@previous</text>
    <path d="M245,128 C200,145 160,145 157,130" class="sr" fill="none" stroke-dasharray="4 3" marker-end="url(#mf-ar1)"/>
    <text x="200" y="148" text-anchor="middle" class="tr" font-size="11">rollback = move alias</text>
  </svg><figcaption>Versions are immutable; aliases are movable pointers. Serving code asks for @champion and never changes.</figcaption></figure>
  <div class="cards">
    <div><b>Registered model</b><p>A name for one use case.</p><small>cancer-classifier</small></div>
    <div><b>Version</b><p>Auto-numbered, immutable, linked to its run.</p><small>1, 2, 3 …</small></div>
    <div><b>Alias</b><p>Movable label pointing to one version.</p><small>@champion, @challenger</small></div>
    <div><b>Tags</b><p>Key-value notes on a version.</p><small>validated=true, owner=risk-team</small></div>
  </div>
  <p>Registering the best run: find it, find the model it logged, put that model on the shelf, and hang the <code>champion</code> tag on it.</p>
  <div class="fx" data-lang="py">best = mlflow.search_runs(experiment_names=["cancer-rf"],
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
  <p>Promote a new version, then roll back, just by moving aliases:</p>
  <div class="fx" data-lang="py"># lm2 = the logged model of run rf_300_None, found the same way as lm
v2 = mlflow.register_model(f"models:/{lm2.model_id}", "cancer-classifier")
client.set_registered_model_alias("cancer-classifier", "champion", v2.version)   # promote
client.set_registered_model_alias("cancer-classifier", "previous", "1")
for v in ["1", "2"]:
    print("version", v, "aliases", client.get_model_version("cancer-classifier", v).aliases)
client.set_registered_model_alias("cancer-classifier", "champion", "1")          # rollback
print("after rollback, champion ->",
      client.get_model_version_by_alias("cancer-classifier", "champion").version)</div>
  <div class="fx" data-lang="text">Registered model 'cancer-classifier' already exists. Creating a new version of this model...
Created version '2' of model 'cancer-classifier'.
version 1 aliases ['previous']
version 2 aliases ['champion']
after rollback, champion -&gt; 1</div>
  <p>Nothing was copied or deleted. Version 2 still exists for later study; only the tag moved.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Older tutorials use <strong>stages</strong> (None → Staging → Production → Archived) and <code>transition_model_version_stage</code>. Stages are deprecated since MLflow 2.9; use aliases plus tags. Interviewers may still say "stages", so know both.</p>
  </div>

  <h2 id="mf-serve"><span class="num">07</span>Loading &amp; Serving</h2>
  <p>The app needs predictions. Two ways: load the model inside your own Python code, or run MLflow's built-in web server and send it HTTP requests. Both ask the registry for <code>@champion</code>, so they always get the current winner.</p>
  <div class="flow"><span>models:/name@champion</span><span>Registry resolves version</span><span>Download artifact</span><span>pyfunc.predict()</span></div>
  <div class="fx" data-lang="py">model = mlflow.pyfunc.load_model("models:/cancer-classifier@champion")
X, y = load_breast_cancer(return_X_y=True, as_frame=True)
print("pred:", model.predict(X.iloc[[0, 1, 19, 20]]))
print("true:", y.iloc[[0, 1, 19, 20]].values)</div>
  <div class="fx" data-lang="text">pred: [0 0 1 1]
true: [0 0 1 1]</div>
  <p><strong>pyfunc</strong> ("Python function") is MLflow's generic wrapper: sklearn, XGBoost or PyTorch models all come back with the same <code>.predict()</code>, so the serving code never cares which library trained the model. Other URI forms: <code>models:/name/2</code> (a fixed version), <code>runs:/&lt;run_id&gt;/model</code> (straight from a run).</p>
  <h3>A REST endpoint in one command</h3>
  <p>A <strong>REST endpoint</strong> is a web address that accepts a request and returns an answer, the way a payment app talks to a bank. <code>mlflow models serve</code> starts one for the chosen model. <code>curl</code> is a command-line tool that sends HTTP requests; here it sends two rows and gets two predictions.</p>
  <div class="fx" data-lang="text">$ export MLFLOW_TRACKING_URI=sqlite:///mlflow.db
$ mlflow models serve -m "models:/cancer-classifier@champion" -p 5055 --env-manager local

$ curl -X POST localhost:5055/invocations -H 'Content-Type: application/json' -d @req.json
{"predictions": [0, 1]}

# send only one column -&gt; signature enforcement rejects it
{"error_code": "INVALID_PARAMETER_VALUE", ... "Model is missing inputs ['mean texture', 'mean perimeter', ...]",
 "error_class": "SCHEMA_ENFORCEMENT_FAILED"}</div>
  <p><code>req.json</code> is <code>{"dataframe_split": {"columns": [...30 names], "data": [[...], [...]]}}</code>. The second request sent only one of the 30 columns; the signature recorded in Section 03 caught it and refused, instead of returning a wrong answer. <code>mlflow models build-docker</code> wraps the same server into a Docker image.</p>
  <h3>What a logged model contains (MLmodel file, trimmed)</h3>
  <p>A logged model is a folder, not a single file. Its <code>MLmodel</code> file is the label on the box: which libraries can load it (<strong>flavors</strong>), which Python packages it needs, the signature, and the run it came from.</p>
  <div class="fx" data-lang="text">flavors:
  python_function:
    env: {conda: conda.yaml, virtualenv: python_env.yaml}
    loader_module: mlflow.sklearn
    model_path: model.skops
  sklearn:
    serialization_format: skops
    sklearn_version: 1.9.1
mlflow_version: 3.17.1
model_id: m-4b5281a46dd943baaac6600b7c859e09
run_id: db6124d4737a4d26bbc161f9ec3a4fe4
signature:
  inputs: '[{"type": "double", "name": "mean radius", "required": true}, ...]'
  outputs: '[{"type": "long", "required": true}]'
# sibling files: requirements.txt, conda.yaml, python_env.yaml, input_example.json, model.skops</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The model directory carries its own dependency list and input schema. That is what makes "train here, serve anywhere" work.</p>
  </div>

  <h2 id="mf-setup"><span class="num">08</span>Server Setup &amp; Projects</h2>
  <p>So far the receipts lived in a file on one laptop (<code>sqlite:///mlflow.db</code>). A team of twenty needs one shared place. That is the <strong>tracking server</strong>: everyone's code points at it with <code>MLFLOW_TRACKING_URI</code>, and the same <code>log_*</code> calls now write there.</p>
  <p>The server keeps two kinds of things in two places. Small facts (params, metrics, run names) go into a normal database, the <strong>backend store</strong>. Big files (models, plots) go into cloud object storage, the <strong>artifact store</strong>. The picture shows the split.</p>
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
  <p>Not run here (needs Postgres + S3). Managed options, where someone else runs the server for you: Databricks, SageMaker managed MLflow, Azure ML.</p>
  <h3>MLflow Projects (brief)</h3>
  <p>A Project is a small text file that says "here is how to run my training": which environment, which script, which arguments. Anyone can then rerun it with one command.</p>
  <div class="fx" data-lang="text"># MLproject  (file at repo root)
name: cancer-rf
python_env: python_env.yaml
entry_points:
  main:
    parameters:
      n_estimators: {type: int, default: 100}
      max_depth: {type: int, default: 5}
    command: "python train.py --n {n_estimators} --depth {max_depth}"

$ mlflow run . -P n_estimators=300            # or a Git URL</div>
  <p>Many teams now use Docker or a pipeline tool (Airflow, Kubeflow) for this instead.</p>

  <h2 id="mf-build"><span class="num">09</span>Build It</h2>
  <ol>
    <li><code>pip install mlflow scikit-learn</code>; run the Section 03 loop with 5 param combos.</li>
    <li>Add <code>mlflow.set_tag("data_version", "&lt;dvc md5&gt;")</code> and log a confusion-matrix plot with <code>mlflow.log_figure</code>.</li>
    <li>Run <code>mlflow ui --backend-store-uri sqlite:///mlflow.db</code>, open <code>localhost:5000</code>, compare the runs.</li>
    <li>Register the best, alias it <code>@champion</code>, serve it with <code>mlflow models serve</code>, curl it.</li>
    <li>Register a worse model, promote it, then roll back by moving the alias. Confirm predictions change back.</li>
  </ol>

  <h2 id="mf-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problems does experiment tracking solve?</summary><div class="qa-body">Reproducibility (rebuild any model from logged params, code version and data version), comparison (rank hundreds of runs by a metric), collaboration (one shared history instead of personal spreadsheets) and lineage (which run produced the model in production).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Param vs metric: what is the difference?</summary><div class="qa-body">A param is a setting you choose before training (trees, learning rate), logged once and stored as a string. A metric is a number the training produces (loss, F1), stored as a float and loggable many times with a <code>step</code>, which gives a curve.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You compare runs using autologged metrics and pick the top one. What's wrong?</summary><div class="qa-body">Autolog's sklearn metrics are computed on the training data (<code>training_accuracy_score</code> etc.), so the "best" run is probably the most overfit. Log validation or test metrics yourself, or use <code>mlflow.evaluate</code> / <code>mlflow.models.evaluate</code> on a holdout set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two runs tie on the main metric. How do you choose?</summary><div class="qa-body">Prefer the cheaper or simpler model (fewer trees, lower latency, smaller artifact), then check secondary metrics, per-slice performance and stability across seeds or CV folds. In our run, rf_100_5 matched rf_300_None on F1 with a third of the trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Version vs alias in the registry?</summary><div class="qa-body">A version is an immutable snapshot of one model, auto-numbered and linked to the run that produced it. An alias (e.g. <code>@champion</code>) is a movable pointer to one version. Serving loads <code>models:/name@champion</code>, so promoting or rolling back is just moving the alias, with no code change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Production model is misbehaving. How do you roll back with MLflow?</summary><div class="qa-body"><code>client.set_registered_model_alias("cancer-classifier", "champion", "1")</code>. Serving code that loads <code>@champion</code> picks up version 1 on next load or restart. Keep a <code>@previous</code> alias so you know the last good version instantly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a model signature, and why log an input example?</summary><div class="qa-body">The signature is the expected input columns/types and output type. MLflow infers it from <code>input_example</code>. At serving time it enforces it: in our test, a request missing 29 columns was rejected with <code>SCHEMA_ENFORCEMENT_FAILED</code> instead of returning garbage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you set up MLflow for a team of 20?</summary><div class="qa-body">A shared tracking server (on K8s or a VM, or a managed service) with a Postgres/MySQL backend store for metadata and S3/GCS for artifacts, behind auth. Everyone sets <code>MLFLOW_TRACKING_URI</code>. Conventions: one experiment per problem, required tags (git SHA, data version), registry aliases for deployment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do MLflow Stages fit today?</summary><div class="qa-body">Stages (Staging / Production / Archived) were the old promotion workflow. They are deprecated since 2.9 because one fixed set of stages didn't fit every team. Aliases (any name, any number) and tags replace them, e.g. <code>@champion</code>, <code>@challenger</code>, tag <code>validated=true</code>.</div></details>
</main>`
});
