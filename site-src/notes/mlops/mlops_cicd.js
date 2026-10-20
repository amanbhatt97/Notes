// notes/mlops/mlops_cicd.js — CI/CD for ML
Object.assign(TOPIC_CONTENT, {
  "mlops_cicd": `<main>
  <h1>CI/CD for ML</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Shipping Models</span><span>CI/CD for ML</span></div>
  <p class="lead">CI/CD is a robot that runs the same checks on every change and ships the change only if they all pass. For ML the robot must check three things, not one: the code, the data and the model. This note builds Biteful's pipeline piece by piece: 16 pytest tests (unit, data, model behaviour), a gate script that refuses a model worse than the live champion, a GitHub Actions workflow (plus its GitLab CI and Jenkins equivalents), and a multi-stage Docker image of the ETA server. Tests, gate, schema validation of the workflow files and the Docker builds were all really run here; GitHub Actions itself cannot run in this sandbox, so the workflow is validated against GitHub's published schema instead and labelled as not run.</p>

  <h2 id="ci-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="ci-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="30" text-anchor="middle" font-size="12">Shipping: the map</text><text x="85" y="46" text-anchor="middle" class="tm" font-size="10">four steps to users</text>
<rect x="180" y="10" width="140" height="46" rx="7" class="fg sg" stroke-width="2.5"/><text x="250" y="30" text-anchor="middle" font-size="12" font-weight="700">1 · CI/CD</text><text x="250" y="46" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<rect x="340" y="10" width="140" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="410" y="30" text-anchor="middle" font-size="12">2 · Serving</text><text x="410" y="46" text-anchor="middle" class="tm" font-size="10">FastAPI, ONNX</text>
<rect x="500" y="10" width="150" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="575" y="30" text-anchor="middle" font-size="12">3 · K8s · 4 · Cloud</text><text x="575" y="46" text-anchor="middle" class="tm" font-size="10">run it, at scale</text>
<line x1="160" y1="33" x2="178" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ci-a0)"/><line x1="320" y1="33" x2="338" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ci-a0)"/><line x1="480" y1="33" x2="498" y2="33" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ci-a0)"/>
<text x="330" y="90" text-anchor="middle" class="tm" font-size="10.5">in: models:/biteful-eta@champion (v2, MAE 2.347) + a repo of scripts</text>
<text x="330" y="110" text-anchor="middle" class="tm" font-size="10.5">out: image biteful-eta:&lt;git sha&gt;, built only after 16 tests and the gate pass</text>
</svg><figcaption>The first of the four shipping notes: every later step deploys the image this pipeline builds.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="mlops_mlflow">MLflow</a> and <a class="xref" data-note="mlops_deploy">Shipping Models: the map</a></b><span>The registry holds version 2 as <code>@champion</code>; the lifecycle note gave us Git, DVC and pre-commit. Left open: every release is a manual checklist (run tests, compare models, build an image, push it) that people skip on a busy Friday. <a class="xref" data-note="py_testing">Testing in Python</a> taught pytest; <a class="xref" data-note="se_docker">Docker</a> taught images and multi-stage builds.</span></li>
    <li><b>This note adds: an automatic, repeatable path from commit to image</b><span>CI vs CD, the three kinds of ML tests, a model gate, GitHub Actions anatomy (triggers, jobs, matrix, secrets, artifacts, environments, runners), GitLab CI and Jenkins equivalents, a multi-stage image of the model server, GPU images, and where full training (CT) belongs.</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="mlops_serving">Model Serving &amp; Inference</a> explains the server inside the image line by line; <a class="xref" data-note="mlops_k8s">Kubernetes for ML</a> runs the image the pipeline pushes.</span></li>
  </ol>

  <h2 id="ci-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>Running example: the Biteful repo with <code>features.py</code>, the registry champion (gradient boosting, test MAE 2.347) and the old forest (2.654), the frozen 550 test orders, and the six Monday orders (23, 55, 14, 36, 47, 43 minutes).</p>
  <ol class="story">
    <li><b>The release problem</b><span>Q: why do bad changes reach users? → Ravi's "distance in metres" edit was merged on a Friday because nobody ran the checks. Every change should be tested and shipped the same way, by a machine. But what exactly is "CI" and "CD"?</span></li>
    <li><b>CI vs CD</b><span>Q: what does the robot do, and when? → CI: build and test every change; CD: ship every change that passes (delivery = ready to release; deployment = released automatically). ML adds CT: retraining. But "test" means what, for a model?</span></li>
    <li><b>Tests for ML</b><span>Q: what can go wrong in code, data and model? → 3 unit tests, 2 data tests (pandera schema caught -1 minutes and 120 km), 11 model tests (quality, Monday orders, farther = slower, rain = slower, customer name irrelevant, latency). The metres bug failed 9 of 16. Tests say "good enough"; but is the new model better than the live one?</span></li>
    <li><b>The model gate</b><span>Q: may this candidate replace the champion? → <code>gate.py</code>: beat half the baseline (4.25), beat the champion (2.654), R² ≥ 0.85. Boosting passes (exit 0), a shallow forest fails (exit 1). Now how do we make a server run all this on every push?</span></li>
    <li><b>GitHub Actions anatomy</b><span>Q: how do we describe the pipeline? → A YAML workflow: triggers, jobs with <code>needs</code>, steps, a Python matrix, secrets, artifacts between jobs, environments. Validated against the schema (a missing <code>runs-on</code> caught). Other teams use other CI servers…</span></li>
    <li><b>GitLab CI and Jenkins</b><span>Q: is it the same elsewhere? → Same stages, different syntax: <code>.gitlab-ci.yml</code> (validated) and a <code>Jenkinsfile</code>. The pipeline has passed; what does it ship?</span></li>
    <li><b>Docker multi-stage builds</b><span>Q: what is the shippable thing? → An image tagged with the Git SHA: builder stage installs packages, runtime stage copies only the venv: 824 MB → 676 MB, no wheel files, non-root user; it answered 56.1 minutes. GPU models need the NVIDIA toolkit. But where does full training happen?</span></li>
    <li><b>CI vs CT and the full flow</b><span>Q: does CI retrain the model? → No: CI tests code and trains only on samples; a training pipeline (CT) produces candidates into the registry; CD promotes them through the gate to staging, then production with approval.</span></li>
  </ol>

  <h2 id="ci-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">CI/CD for ML</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">CI vs CD vs CT</div>
        <ul>
          <li><b>CI</b> — every push: lint, test, build</li>
          <li><b>Continuous delivery</b> — always releasable; a human presses go</li>
          <li><b>Continuous deployment</b> — passes → live automatically</li>
          <li><b>CT</b> — continuous training: new data → candidate model</li>
          <li>💡 a factory line with inspectors at each station</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tests for ML</div>
        <ul>
          <li><b>Code</b> — unit tests on <code>build_features</code></li>
          <li><b>Data</b> — pandera schema: ranges, allowed values, rainy share</li>
          <li><b>Model</b> — MAE &lt; 3, Monday orders within 5 min</li>
          <li><b>Behaviour</b> — directional (farther slower), invariance (name irrelevant)</li>
          <li><b>Serving</b> — p95 latency &lt; 20 ms</li>
          <li>Metres bug: 9 of 16 fail</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gate</div>
        <ul>
          <li><b>Baseline</b> — MAE &lt; 0.5 × 8.501 = 4.25</li>
          <li><b>Champion</b> — 2.347 &lt; 2.654</li>
          <li><b>Floor</b> — R² ≥ 0.85</li>
          <li><b>Exit code</b> — 0 ships, 1 stops the pipeline</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GitHub Actions</div>
        <ul>
          <li><b>on</b> — pull_request, push to main</li>
          <li><b>jobs</b> — lint → test → gate → build → deploy-staging (<code>needs</code>)</li>
          <li><b>matrix</b> — Python 3.11 and 3.12</li>
          <li><b>secrets</b>, <b>artifacts</b>, <b>environment</b> approvals</li>
          <li><b>runners</b> — GitHub-hosted vs self-hosted (GPU)</li>
          <li>⚠ YAML <code>on</code> parses as <code>True</code> in PyYAML</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Other CI servers</div>
        <ul>
          <li><b>GitLab CI</b> — stages, <code>parallel: matrix</code>, <code>rules</code>, artifacts</li>
          <li><b>Jenkins</b> — <code>Jenkinsfile</code> pipeline, stages, agents, credentials</li>
          <li>Same idea, different syntax</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Images</div>
        <ul>
          <li><b>Multi-stage</b> — builder → runtime: 824 → 676 MB</li>
          <li><b>Tag = Git SHA</b>, never <code>:latest</code></li>
          <li><b>Non-root</b>, HEALTHCHECK on <code>/ready</code></li>
          <li><b>GPU</b> — CUDA base image + NVIDIA Container Toolkit, <code>--gpus all</code></li>
          <li><b>Scan</b> — Trivy for known vulnerabilities</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ci-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Release Problem</span><span class="rm-sub">Same checks, every change</span></div></div>
      <div class="rm-item rm-done" data-target="ci-cicd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">CI vs CD (vs CT)</span><span class="rm-sub">What the robot does</span></div></div>
      <div class="rm-item rm-done" data-target="ci-tests"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Tests for ML</span><span class="rm-sub">Code, data, model, behaviour</span></div></div>
      <div class="rm-item rm-done" data-target="ci-gate"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Model Gate</span><span class="rm-sub">Beat baseline and champion</span></div></div>
      <div class="rm-item rm-done" data-target="ci-gha"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">GitHub Actions Anatomy</span><span class="rm-sub">Workflow, jobs, matrix, secrets</span></div></div>
      <div class="rm-item rm-done" data-target="ci-others"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">GitLab CI &amp; Jenkins</span><span class="rm-sub">Same pipeline, other syntax</span></div></div>
      <div class="rm-item rm-done" data-target="ci-docker"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Docker Multi-Stage Builds</span><span class="rm-sub">The shippable image</span></div></div>
      <div class="rm-item rm-done" data-target="ci-ct"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">CI vs CT: the Full Flow</span><span class="rm-sub">Where training belongs</span></div></div>
      <div class="rm-item rm-done" data-target="ci-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="ci-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Pipelines that lie</span></div></div>
      <div class="rm-item rm-done" data-target="ci-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="ci-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ci-why"><span class="num">01</span>The Release Problem: Same Checks, Every Change</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's release checklist says: run the tests, check the new model is better, build the image, push it, update the server. On a busy Friday Ravi changed <code>features.py</code> so the app could send metres, skipped the checklist, and every ETA in the city went wrong. How do we make the checks impossible to skip?</p>
  </div>
  <p>A checklist run by people fails exactly when people are busy. The fix is to hand the checklist to a machine that runs it on every change, in a clean environment, the same way every time, and refuses to continue when a check fails.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A factory assembly line with inspectors at each station. A part that fails the weight check never reaches the paint shop. Nobody "forgets" an inspection, because the line itself won't move the part forward.</p>
  </div>
  <p>Here is Biteful's repository as the pipeline sees it. Every file in it is used by one station of the line, and each section of this note introduces one station:</p>
  <table class="tbl">
    <tr><th>File</th><th>Station</th><th>Section</th></tr>
    <tr><td><code>features.py</code>, <code>app.py</code></td><td>the code being shipped (one feature function; the ETA server)</td><td>03, 07</td></tr>
    <tr><td><code>tests/test_features.py</code>, <code>test_data.py</code>, <code>test_model.py</code></td><td>code, data and model tests</td><td>03</td></tr>
    <tr><td><code>export_model.py</code>, <code>split_data.py</code></td><td>fetch v1 and v2 from the registry; freeze the 1,648 / 550 split</td><td>03</td></tr>
    <tr><td><code>evaluate.py</code>, <code>gate.py</code></td><td>score a model; decide ship or stop</td><td>04</td></tr>
    <tr><td><code>.github/workflows/ci.yml</code>, <code>.gitlab-ci.yml</code>, <code>Jenkinsfile</code></td><td>the line itself</td><td>05, 06</td></tr>
    <tr><td><code>Dockerfile</code>, <code>requirements.txt</code></td><td>the shippable box</td><td>07</td></tr>
  </table>
  <p>Two of these files fetch the models. <code>export_model.py</code> loads registry versions 1 (forest) and 2 (boosting) and saves them as plain files the tests and the image can use; <code>split_data.py</code> recreates the same seed-42 split every note uses:</p>
  <div class="fx" data-lang="py"># export_model.py — CI step "fetch models": registry versions -&gt; plain files the image can carry
import os, joblib, mlflow
mlflow.set_tracking_uri(os.environ.get("MLFLOW_TRACKING_URI", "sqlite:///../mlflow/mlflow.db"))
os.makedirs("model", exist_ok=True)
for alias_or_version, out in [("1", "model/v1.joblib"), ("2", "model/model.joblib")]:
    model = mlflow.sklearn.load_model(f"models:/biteful-eta/{alias_or_version}")
    joblib.dump(model, out)
    print(f"version {alias_or_version} ({type(model).__name__}) -&gt; {out}", os.path.getsize(out) // 1024, "KB")</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>pipeline</strong> (in CI/CD) is an ordered set of automated jobs triggered by a change to the repository; each job runs steps in a fresh environment, and a failing step stops everything after it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running the checks only on the developer's laptop. Local results depend on local files, local packages and local data. The pipeline must start from a clean checkout so "it passed" means the same thing for everyone.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: CI vs CD (vs CT).</b> "Hand it to a machine" is the idea. What are the standard names for the stations, and where does ML add one?</div>

  <h2 id="ci-cicd"><span class="num">02</span>CI vs CD (vs CT)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>People say "CI/CD" as one word. Which part tests, which part ships, how far does shipping go automatically, and where does retraining a model fit?</p>
  </div>
  <ul>
    <li><strong>CI (continuous integration)</strong>: every push or pull request is built and tested automatically, and merged into <code>main</code> only if it passes. Developers integrate small changes often, so problems are found within minutes.</li>
    <li><strong>CD (continuous delivery)</strong>: every change that passes CI is packaged (an image) and deployed to a staging environment, so it is <em>always ready</em> to release; a human approves the production release.</li>
    <li><strong>CD (continuous deployment)</strong>: the same, but production release is automatic too, with no human step.</li>
    <li><strong>CT (continuous training)</strong>: ML's extra loop: new data automatically produces a new candidate model (lifecycle note, section 03).</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <defs><marker id="ci-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="90" height="40" rx="6" class="fs" stroke="currentColor"/><text x="55" y="64" text-anchor="middle" font-size="12">push / PR</text>
    <rect x="120" y="20" width="230" height="80" rx="8" class="fb sb" fill-opacity="0.25"/><text x="235" y="38" text-anchor="middle" font-size="12" font-weight="700">CI</text>
    <text x="235" y="58" text-anchor="middle" font-size="11">lint · unit/data/model tests</text><text x="235" y="76" text-anchor="middle" font-size="11">gate · build image</text>
    <rect x="370" y="20" width="120" height="80" rx="8" class="fg sg" fill-opacity="0.25"/><text x="430" y="38" text-anchor="middle" font-size="12" font-weight="700">Delivery</text><text x="430" y="62" text-anchor="middle" font-size="11">push image</text><text x="430" y="78" text-anchor="middle" font-size="11">deploy staging</text>
    <rect x="510" y="20" width="120" height="80" rx="8" class="ft st" fill-opacity="0.25"/><text x="570" y="38" text-anchor="middle" font-size="12" font-weight="700">Production</text><text x="570" y="62" text-anchor="middle" font-size="11">approval (delivery)</text><text x="570" y="78" text-anchor="middle" font-size="11">or auto (deployment)</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ci-ar1)"><line x1="100" y1="60" x2="118" y2="60"/><line x1="350" y1="60" x2="368" y2="60"/><line x1="490" y1="60" x2="508" y2="60"/></g>
    <text x="320" y="132" text-anchor="middle" class="tm" font-size="11">CT runs beside this line: new data → training pipeline → candidate in the registry → enters at the gate</text>
  </svg><figcaption>CI tests and builds; delivery keeps a releasable image in staging; the last step is manual (delivery) or automatic (deployment).</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Triggered by</th><th>Output</th><th>At Biteful</th></tr>
    <tr><td>CI</td><td>code change</td><td>tested commit + image</td><td>16 tests, gate, <code>biteful-eta:&lt;sha&gt;</code></td></tr>
    <tr><td>Continuous delivery</td><td>CI passed on <code>main</code></td><td>release candidate in staging</td><td>staging Deployment updated; product approves</td></tr>
    <tr><td>Continuous deployment</td><td>CI passed on <code>main</code></td><td>live release</td><td>only once canary checks are automated (Kubernetes note)</td></tr>
    <tr><td>CT</td><td>new data, schedule, drift</td><td>candidate model in the registry</td><td>week-5 retrain from the lifecycle note</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Continuous integration</strong>: automatically build and test every change before it merges. <strong>Continuous delivery</strong>: automatically keep every passing change deployable (released by a human decision). <strong>Continuous deployment</strong>: automatically release every passing change. <strong>Continuous training</strong>: automatically retrain models when data or triggers say so.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Saying "CD" without saying which one. In interviews, name it: delivery keeps a human approval before production; deployment does not. Most ML teams use delivery plus a canary, because a model can be "green" in tests and still worse on live traffic.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Tests for ML.</b> CI "runs the tests". For ordinary code, tests check functions. What should the tests check when the thing being shipped is a model trained on data?</div>

  <h2 id="ci-tests"><span class="num">03</span>Tests for ML: Code, Data, Model, Behaviour</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ravi's metres bug didn't crash anything. Which tests would have caught it, and what else can silently go wrong in the data or the model that a normal unit test never looks at?</p>
  </div>
  <p>Three things can break an ML system, so there are three families of tests (plus a fourth for serving). <a class="xref" data-note="py_testing">Testing in Python</a> covers pytest itself: test functions named <code>test_*</code>, plain <code>assert</code>, and <code>@pytest.mark.parametrize</code> to run one test on many inputs.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant inspection. Check the recipe card is followed (code tests), check the delivered vegetables are fresh and the right kind (data tests), and taste the dish (model tests). A perfect recipe with rotten tomatoes still makes bad food.</p>
  </div>
  <h3>Code tests: the feature function</h3>
  <div class="fx" data-lang="py">import pandas as pd
from features import RESTAURANTS, build_features

def one_order(**changes):
    base = {"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}
    return pd.DataFrame([{**base, **changes}])

def test_same_columns_for_a_single_order():                 # get_dummies would give 1 column, not 4
    cols = list(build_features(one_order()).columns)
    assert cols == ["distance_km", "items", "rain"] + [f"restaurant_{r}" for r in RESTAURANTS]

def test_exactly_one_restaurant_flag():
    X = build_features(one_order(restaurant="Chai Stop"))
    assert X.filter(like="restaurant_").sum(axis=1).item() == 1

def test_distance_stays_in_km():
    assert build_features(one_order()).loc[0, "distance_km"] == 5.5</div>
  <p>The first test protects the fix from the lifecycle note: one order must still give all four restaurant columns (<code>pd.get_dummies</code> would give one). The third pins the unit: 5.5 km must stay 5.5.</p>
  <h3>Data tests: a schema for the table</h3>
  <p><strong>pandera</strong> describes what a valid table looks like: types, ranges, allowed values, and table-wide checks such as "the rainy share is between 5% and 60%" (the training data had 26%; a monsoon export at 70% would fail and force a human look). <code>strict=True</code> rejects unexpected columns. Great Expectations does the same job with more reporting.</p>
  <div class="fx" data-lang="py">import pandas as pd
import pandera.pandas as pa
from features import RESTAURANTS

schema = pa.DataFrameSchema(
    {"distance_km": pa.Column(float, pa.Check.in_range(0.1, 30)),
     "items": pa.Column(int, pa.Check.in_range(1, 50)),
     "rain": pa.Column(int, pa.Check.isin([0, 1])),
     "restaurant": pa.Column(str, pa.Check.isin(RESTAURANTS)),
     "minutes": pa.Column(float, pa.Check.gt(0))},
    checks=pa.Check(lambda df: 0.05 &lt;= df["rain"].mean() &lt;= 0.6, error="rainy share out of range"),
    strict=True)                                            # no unexpected columns

def test_clean_data_matches_schema():
    schema.validate(pd.read_csv("data/clean.csv"))

def test_enough_rows_and_few_duplicates():
    df = pd.read_csv("data/clean.csv")
    assert len(df) &gt;= 1000
    assert df.duplicated().mean() &lt; 0.05     # identical-looking orders happen; a join bug makes many</div>
  <p>The first draft of the second test asserted "no duplicate rows" and failed. The duplicates were real but innocent: the export has no order ID, and identical-looking orders happen. The test now limits the <em>rate</em>. The same schema run on the raw week-2 export, before <code>prepare.py</code> cleans it, finds exactly the two broken orders from the lifecycle note:</p>
  <div class="fx" data-lang="py">import pandas as pd, pandera.pandas as pa
from tests.test_data import schema

clean = pd.read_csv("data/clean.csv")
print("identical-looking rows in clean.csv:", clean.duplicated().sum(), "of", len(clean))
raw = pd.read_csv("../../exports/orders_2200.csv")          # the week-2 export, BEFORE prepare.py
try:
    schema.validate(raw, lazy=True)                          # lazy: collect every failure, not just the first
except pa.errors.SchemaErrors as e:
    print(e.failure_cases[["column", "check", "index", "failure_case"]].to_string(index=False))</div>
  <div class="fx" data-lang="text">identical-looking rows in clean.csv: 17 of 2198
     column             check  index  failure_case
distance_km in_range(0.1, 30)   2120         120.0
    minutes   greater_than(0)   2050          -1.0</div>
  <p><code>lazy=True</code> collects every failure instead of stopping at the first, so the report lists both: the 120 km GPS glitch (row 2120) and the -1 minute app bug (row 2050).</p>
  <h3>Model tests: quality and behaviour</h3>
  <p>Model tests load the candidate model file and check four kinds of property. Quality: MAE on the frozen test set under 3 minutes. <strong>Minimum functionality</strong>: simple cases must work (each Monday order within 5 minutes of reality). <strong>Directional expectation</strong>: changing an input in a known direction must move the output that way (farther is slower, rain is slower). <strong>Invariance</strong>: changing something irrelevant must not change the output (the customer's name). Plus a serving budget: 95% of single predictions under 20 ms.</p>
  <div class="fx" data-lang="py">import time
import joblib, pandas as pd, pytest
from sklearn.metrics import mean_absolute_error
from features import build_features

model = joblib.load("model/model.joblib")
test = pd.read_csv("data/test.csv")

def eta(**changes):
    base = {"distance_km": 4.0, "items": 3, "rain": 0, "restaurant": "Dosa Corner"}
    return float(model.predict(build_features(pd.DataFrame([{**base, **changes}])))[0])

def test_quality_budget():                                  # quality: MAE under 3 minutes
    assert mean_absolute_error(test.minutes, model.predict(build_features(test))) &lt; 3.0

@pytest.mark.parametrize("km,items,rain,rest,real", [       # minimum functionality: Monday orders
    (2.0, 2, 0, "Dosa Corner", 23), (5.5, 3, 1, "Biryani House", 55), (1.2, 1, 0, "Chai Stop", 14),
    (3.8, 4, 0, "Pizza Point", 36), (6.0, 2, 1, "Dosa Corner", 47), (4.5, 5, 0, "Biryani House", 43)])
def test_monday_orders_within_5_minutes(km, items, rain, rest, real):
    assert abs(eta(distance_km=km, items=items, rain=rain, restaurant=rest) - real) &lt; 5

def test_farther_is_slower():                               # directional expectation
    assert eta(distance_km=2) &lt; eta(distance_km=4) &lt; eta(distance_km=6)

def test_rain_is_slower():
    assert eta(rain=1) &gt; eta(rain=0)

def test_customer_name_does_not_change_eta():               # invariance
    a = build_features(pd.DataFrame([{"distance_km": 4.0, "items": 3, "rain": 0,
                                      "restaurant": "Dosa Corner", "customer": "Asha"}]))
    b = build_features(pd.DataFrame([{"distance_km": 4.0, "items": 3, "rain": 0,
                                      "restaurant": "Dosa Corner", "customer": "Ravi"}]))
    assert model.predict(a)[0] == model.predict(b)[0]

def test_latency_budget():                                  # serving: p95 under 20 ms per order
    times = []
    for _ in range(50):
        t0 = time.perf_counter(); eta(); times.append(time.perf_counter() - t0)
    assert sorted(times)[int(0.95 * len(times))] &lt; 0.020</div>
  <p>The whole suite on the healthy repo:</p>
  <div class="fx" data-lang="text">$ ls
Dockerfile
Dockerfile.single
Jenkinsfile
app.py
broken.yml
candidate.json
champion.json
data
evaluate.py
export_model.py
features.py
gate.py
model
pytest.ini
requirements.txt
shallow.json
split_data.py
tests
train_quick.py
wheels
$ python -m pytest --no-header -v tests
============================= test session starts ==============================
collecting ... collected 16 items

tests/test_data.py::test_clean_data_matches_schema PASSED                [  6%]
tests/test_data.py::test_enough_rows_and_few_duplicates PASSED           [ 12%]
tests/test_features.py::test_same_columns_for_a_single_order PASSED      [ 18%]
tests/test_features.py::test_exactly_one_restaurant_flag PASSED          [ 25%]
tests/test_features.py::test_distance_stays_in_km PASSED                 [ 31%]
tests/test_model.py::test_quality_budget PASSED                          [ 37%]
tests/test_model.py::test_monday_orders_within_5_minutes[2.0-2-0-Dosa Corner-23] PASSED [ 43%]
tests/test_model.py::test_monday_orders_within_5_minutes[5.5-3-1-Biryani House-55] PASSED [ 50%]
tests/test_model.py::test_monday_orders_within_5_minutes[1.2-1-0-Chai Stop-14] PASSED [ 56%]
tests/test_model.py::test_monday_orders_within_5_minutes[3.8-4-0-Pizza Point-36] PASSED [ 62%]
tests/test_model.py::test_monday_orders_within_5_minutes[6.0-2-1-Dosa Corner-47] PASSED [ 68%]
tests/test_model.py::test_monday_orders_within_5_minutes[4.5-5-0-Biryani House-43] PASSED [ 75%]
tests/test_model.py::test_farther_is_slower PASSED                       [ 81%]
tests/test_model.py::test_rain_is_slower PASSED                          [ 87%]
tests/test_model.py::test_customer_name_does_not_change_eta PASSED       [ 93%]
tests/test_model.py::test_latency_budget PASSED                          [100%]

============================== 16 passed in 1.67s ==============================</div>
  <p>Now replay Friday: the <code>sed</code> line makes <code>build_features</code> multiply distance by 1000 ("the app sends metres now"), the suite runs, and the change is undone:</p>
  <div class="fx" data-lang="text">$ sed -i 's/.astype(float)      # extra/.astype(float) * [1000, 1, 1]  # extra/' features.py
$ python -m pytest -q --no-header --tb=no -rf tests
....FFFFFFFFF...                                                         [100%]
=========================== short test summary info ============================
FAILED tests/test_features.py::test_distance_stays_in_km - assert np.float64(...
FAILED tests/test_model.py::test_quality_budget - assert 11.109270754936627 &lt;...
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[2.0-2-0-Dosa Corner-23]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[5.5-3-1-Biryani House-55]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[1.2-1-0-Chai Stop-14]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[3.8-4-0-Pizza Point-36]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[6.0-2-1-Dosa Corner-47]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[4.5-5-0-Biryani House-43]
FAILED tests/test_model.py::test_farther_is_slower - assert 40.69734239938418...
9 failed, 7 passed in 1.88s
$ sed -i 's/.astype(float) \\* \\[1000, 1, 1\\]  # extra/.astype(float)      # extra/' features.py</div>
  <p>Nine of sixteen tests fail, each pointing at a different symptom: the unit test sees 5500.0 instead of 5.5; MAE jumps to 11.1; every Monday order is more than 5 minutes off; and "farther is slower" fails because 2 km and 4 km (2,000 and 4,000 "km" to the model) both land in the same far-away leaves (40.697 minutes each). The rain and invariance tests still pass, which is why one test is never enough. In CI this pull request could not merge.</p>
  <table class="tbl">
    <tr><th>Family</th><th>Checks</th><th>Biteful tests</th><th>Tools</th></tr>
    <tr><td>Code</td><td>functions do what they say</td><td>3 feature tests</td><td>pytest, ruff, mypy</td></tr>
    <tr><td>Data</td><td>schema, ranges, allowed values, distribution, volume</td><td>schema + rows/duplicate rate</td><td>pandera, Great Expectations</td></tr>
    <tr><td>Model quality</td><td>metric budgets on frozen data, per slice</td><td>MAE &lt; 3</td><td>pytest + evaluate.py, MLflow evaluate</td></tr>
    <tr><td>Model behaviour</td><td>minimum functionality, directional, invariance</td><td>6 Monday cases, distance, rain, name</td><td>pytest (CheckList-style tests)</td></tr>
    <tr><td>Serving</td><td>latency, container starts, API contract</td><td>p95 &lt; 20 ms; image smoke test (07)</td><td>pytest, curl, Locust/k6 for load</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Data validation</strong> checks a dataset against a declared schema and statistical expectations before it is used. <strong>Behavioural tests</strong> check model outputs on designed inputs: <strong>minimum functionality</strong> (easy cases right), <strong>directional expectation</strong> (output moves the expected way), <strong>invariance</strong> (irrelevant changes don't move it).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Model tests with exact numbers (<code>assert eta == 56.07</code>). Any retrain changes the third decimal and the test fails for no reason. Test budgets and behaviours (under 3 minutes, within 5 minutes, farther is slower), not exact values.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Model Gate.</b> The tests say the model is <em>good enough</em> (MAE under 3). They don't say it is <em>better than what's live</em>. A retrain at MAE 2.9 would pass every test and still be worse than the champion's 2.654.</div>

  <h2 id="ci-gate"><span class="num">04</span>The Model Gate: Beat the Baseline and the Champion</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A candidate model passed all tests. Should it replace the live one? What rule decides, and how does a script tell the pipeline "stop here"?</p>
  </div>
  <p>A <strong>gate</strong> compares the candidate with two references on the same frozen test set: the <strong>baseline</strong> (always predict the training average) and the current <strong>champion</strong>. Pipelines understand one signal: a step's <strong>exit code</strong>. 0 means success and the pipeline continues; anything else fails the job and stops everything after it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A team trial. A new player must beat the minimum fitness standard (baseline) <em>and</em> outperform the player currently in the team (champion) before getting the shirt. Being fit is not enough.</p>
  </div>
  <div class="fx" data-lang="py"># evaluate.py MODEL OUT.json — score a model file on the frozen test set
import json, sys
import joblib, pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score
from features import build_features

train, test = pd.read_csv("data/train.csv"), pd.read_csv("data/test.csv")
pred = joblib.load(sys.argv[1]).predict(build_features(test))
m = {"mae": round(mean_absolute_error(test.minutes, pred), 3), "r2": round(r2_score(test.minutes, pred), 3),
     "baseline_mae": round(mean_absolute_error(test.minutes, [train.minutes.mean()] * len(test)), 3)}
json.dump(m, open(sys.argv[2], "w"))
print(sys.argv[1], m)</div>
  <div class="fx" data-lang="py"># gate.py CANDIDATE.json CHAMPION.json — exit 0 = ship, exit 1 = stop the pipeline
import json, sys
cand, champ = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
checks = {
    "beats baseline by half": cand["mae"] &lt; 0.5 * cand["baseline_mae"],
    "beats champion": cand["mae"] &lt; champ["mae"],
    "R2 at least 0.85": cand["r2"] &gt;= 0.85,
}
for name, ok in checks.items():
    print(("PASS " if ok else "FAIL ") + name)
sys.exit(0 if all(checks.values()) else 1)</div>
  <p>By hand first, with the numbers the run will produce. Baseline MAE on the 550 test orders is 8.501, so half of it is 4.25.</p>
  <table class="tbl">
    <tr><th>Check</th><th>Boosting candidate (v2)</th><th>Shallow forest (depth 3, 20 trees)</th></tr>
    <tr><td>MAE &lt; 0.5 × 8.501 = 4.25</td><td>2.347 ✓</td><td>4.698 ✗</td></tr>
    <tr><td>MAE &lt; champion 2.654</td><td>2.347 ✓</td><td>4.698 ✗</td></tr>
    <tr><td>R² ≥ 0.85</td><td>0.92 ✓</td><td>0.699 ✗</td></tr>
    <tr><td>Exit code</td><td>0 → continue</td><td>1 → stop</td></tr>
  </table>
  <div class="fx" data-lang="text">$ python evaluate.py model/v1.joblib champion.json
model/v1.joblib {'mae': 2.654, 'r2': 0.901, 'baseline_mae': 8.501}
$ python evaluate.py model/model.joblib candidate.json
model/model.joblib {'mae': 2.347, 'r2': 0.92, 'baseline_mae': 8.501}
$ python gate.py candidate.json champion.json; echo "exit code $?"
PASS beats baseline by half
PASS beats champion
PASS R2 at least 0.85
exit code 0
$ python train_quick.py 3 model/shallow.joblib
$ python evaluate.py model/shallow.joblib shallow.json
model/shallow.joblib {'mae': 4.698, 'r2': 0.699, 'baseline_mae': 8.501}
$ python gate.py shallow.json champion.json; echo "exit code $?"
FAIL beats baseline by half
FAIL beats champion
FAIL R2 at least 0.85
exit code 1</div>
  <p>The real run matches the hand table. The champion here is version 1 (the forest), which is what was live before version 2 was promoted in the MLflow note; the pipeline re-checks that promotion instead of trusting it. The shallow forest fails all three checks and returns exit code 1: in CI the <code>build</code> job would never start.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>model gate</strong> is an automated pass/fail decision comparing a candidate model with a baseline and the live champion on a fixed evaluation set (and ideally key slices such as rainy orders), reported through the step's exit code.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Gating on a test set that changes between runs. If the candidate and champion are scored on different rows, the comparison is meaningless. Freeze the evaluation set (here <code>data/test.csv</code> from the seed-42 split, versioned with DVC) and score both models on it in the same job.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: GitHub Actions Anatomy.</b> We have tests and a gate that work from the command line. How do we tell a CI server to run them, in order, on every push, with secrets and without our laptop?</div>

  <h2 id="ci-gha"><span class="num">05</span>GitHub Actions Anatomy</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Lint, tests on two Python versions, the gate, the image build, a staging deploy: in which file do we write that down, how do jobs pass files to each other, and where do passwords go?</p>
  </div>
  <p><strong>GitHub Actions</strong> runs <strong>workflows</strong>: YAML files in <code>.github/workflows/</code>. A workflow has <strong>triggers</strong> (<code>on</code>), and <strong>jobs</strong>; each job runs on a fresh machine called a <strong>runner</strong> and has <strong>steps</strong> (shell commands with <code>run</code>, or reusable <strong>actions</strong> with <code>uses</code>). Jobs run in parallel unless <code>needs</code> orders them. Biteful's workflow (not run here: GitHub Actions only runs on GitHub's servers):</p>
  <div class="fx" data-lang="text">name: biteful-eta-ci
on:
  pull_request:
  push:
    branches: [main]

env:
  IMAGE: ghcr.io/biteful/eta

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install pre-commit &amp;&amp; pre-commit run --all-files

  test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: pip
      - run: pip install -r requirements-dev.txt
      - name: Pull versioned data
        run: dvc pull data/orders.csv.dvc &amp;&amp; dvc repro prepare
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
      - name: Fetch models from the registry
        run: python export_model.py
        env:
          MLFLOW_TRACKING_URI: \${{ secrets.MLFLOW_TRACKING_URI }}
      - run: python split_data.py
      - run: pytest -v tests
      - uses: actions/upload-artifact@v4
        if: matrix.python-version == '3.12'
        with:
          name: eval-inputs
          path: |
            model/
            data/train.csv
            data/test.csv

  gate:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - uses: actions/download-artifact@v4
        with:
          name: eval-inputs
      - run: pip install -r requirements-dev.txt
      - run: python evaluate.py model/v1.joblib champion.json
      - run: python evaluate.py model/model.joblib candidate.json
      - run: python gate.py candidate.json champion.json

  build:
    needs: gate
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: eval-inputs
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - run: docker build -t $IMAGE:\${{ github.sha }} .
      - run: docker push $IMAGE:\${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: kubectl set image deployment/biteful-eta api=$IMAGE:\${{ github.sha }}</div>
  <table class="tbl">
    <tr><th>Piece</th><th>In our file</th><th>What it does</th></tr>
    <tr><td><code>on</code></td><td><code>pull_request</code>, <code>push</code> to <code>main</code></td><td>When the workflow runs</td></tr>
    <tr><td><code>jobs.&lt;id&gt;.needs</code></td><td>lint → test → gate → build → deploy-staging</td><td>Order and dependency: a failed job stops its dependants</td></tr>
    <tr><td><code>runs-on</code></td><td><code>ubuntu-latest</code></td><td>Which runner (GitHub-hosted VM, or a self-hosted label like <code>[self-hosted, gpu]</code>)</td></tr>
    <tr><td><code>strategy.matrix</code></td><td><code>python-version: ["3.11", "3.12"]</code></td><td>Runs the job once per value, in parallel</td></tr>
    <tr><td><code>secrets.*</code></td><td>AWS keys, <code>MLFLOW_TRACKING_URI</code>, <code>GITHUB_TOKEN</code></td><td>Encrypted values injected at run time, masked in logs</td></tr>
    <tr><td><code>upload/download-artifact</code></td><td><code>eval-inputs</code>: models + split files</td><td>Pass files between jobs (each job is a fresh machine)</td></tr>
    <tr><td><code>if</code></td><td><code>github.ref == 'refs/heads/main'</code></td><td>Build only on <code>main</code>, not on every PR</td></tr>
    <tr><td><code>environment</code></td><td><code>staging</code></td><td>Named target with its own secrets and optional required reviewers (approval)</td></tr>
    <tr><td><code>\${{ github.sha }}</code></td><td>image tag</td><td>Every image is traceable to its exact commit</td></tr>
  </table>
  <p>We cannot run GitHub's servers here, but we can check the file the way GitHub would reject it: against the published JSON Schema for workflows (<code>check-jsonschema</code> ships a copy). <code>broken.yml</code> is the same workflow with two realistic mistakes: the <code>gate</code> job lost its <code>runs-on</code>, and <code>matrix</code> is misspelled <code>matrx</code>.</p>
  <div class="fx" data-lang="text">$ python -c "import yaml; print(list(yaml.safe_load(open('.github/workflows/ci.yml'))))"
['name', True, 'env', 'jobs']
$ check-jsonschema --builtin-schema vendor.github-workflows .github/workflows/ci.yml
ok -- validation done
$ check-jsonschema --builtin-schema vendor.github-workflows broken.yml | cut -c1-100
Schema validation errors were encountered.
  broken.yml::$.jobs.test: {'needs': 'lint', 'runs-on': 'ubuntu-latest', 'strategy': {'matrx': {'pyt
  Underlying errors caused this.

  Best Match:
    $.jobs.test: 'uses' is a required property
  Best Deep Match:
    $.jobs.test.strategy: 'matrix' is a required property

  4 other errors were produced. Use '--verbose' to see all errors.
  broken.yml::$.jobs.gate: {'needs': 'test', 'steps': [{'uses': 'actions/checkout@v4'}, {'uses': 'ac
  Underlying errors caused this.

  Best Match:
    $.jobs.gate: 'runs-on' is a required property

  2 other errors were produced. Use '--verbose' to see all errors.
$ check-jsonschema --builtin-schema vendor.gitlab-ci .gitlab-ci.yml
ok -- validation done</div>
  <p>Three findings. First, PyYAML reads the key <code>on</code> as the boolean <code>True</code> (YAML 1.1 treats on/off/yes/no as booleans); GitHub's own parser handles it, but your own scripts that read workflows must not assume a key called <code>"on"</code>. Second, the real workflow passes the schema. Third, the schema catches both mistakes before a single runner minute is spent. In a team, this check runs as a pre-commit hook, and <code>actionlint</code> adds deeper checks (expression syntax, unknown actions).</p>
  <h3>Runners: GitHub-hosted vs self-hosted</h3>
  <table class="tbl">
    <tr><th></th><th>GitHub-hosted</th><th>Self-hosted</th></tr>
    <tr><td>Machine</td><td>Fresh VM per job, managed by GitHub</td><td>Your machine or Kubernetes pod registered as a runner</td></tr>
    <tr><td>Good for</td><td>Tests, linting, image builds</td><td>GPUs, big memory, private network access (data warehouse, internal MLflow)</td></tr>
    <tr><td>Watch out</td><td>Minutes cost money; no GPU on standard runners</td><td>You patch and secure it; never use on public repos (anyone's PR runs code on it)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>workflow</strong> is a YAML file of <strong>jobs</strong> triggered by <strong>events</strong>; each job runs <strong>steps</strong> on a <strong>runner</strong>. A <strong>matrix</strong> expands one job into several variants; <strong>artifacts</strong> carry files between jobs; <strong>secrets</strong> are encrypted variables; an <strong>environment</strong> groups deployment secrets and approval rules.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Secrets in the YAML or printed in logs. Never write keys in the workflow file; use <code>secrets.*</code>. And remember pull requests from forks don't receive secrets, so a step that needs the registry must be skipped (or use a mock) for outside contributors.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: GitLab CI &amp; Jenkins.</b> Many companies don't use GitHub Actions. Is the pipeline idea the same on other CI servers?</div>

  <h2 id="ci-others"><span class="num">06</span>GitLab CI &amp; Jenkins: Same Pipeline, Other Syntax</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's sister company uses GitLab, and the bank partner uses Jenkins. Do we need to relearn CI/CD, or only the syntax?</p>
  </div>
  <p>Only the syntax. Every CI server has the same parts: a trigger, ordered stages, jobs with commands, a matrix, secrets, artifacts and conditions. The same Biteful pipeline in <strong>GitLab CI</strong> (a <code>.gitlab-ci.yml</code> at the repo root), validated against GitLab's schema in section 05's run above (<code>ok -- validation done</code>):</p>
  <div class="fx" data-lang="text">stages: [test, gate, build]

variables:
  IMAGE: $CI_REGISTRY_IMAGE/eta

test:
  stage: test
  image: python:\${PY}-slim
  parallel:
    matrix:
      - PY: ["3.11", "3.12"]
  script:
    - pip install -r requirements-dev.txt
    - python export_model.py &amp;&amp; python split_data.py
    - pytest -v tests
  artifacts:
    paths: [model/, data/train.csv, data/test.csv]

gate:
  stage: gate
  image: python:3.12-slim
  script:
    - pip install -r requirements-dev.txt
    - python evaluate.py model/v1.joblib champion.json
    - python evaluate.py model/model.joblib candidate.json
    - python gate.py candidate.json champion.json

build:
  stage: build
  image: docker:27
  services: [docker:27-dind]
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE:$CI_COMMIT_SHORT_SHA .
    - docker push $IMAGE:$CI_COMMIT_SHORT_SHA</div>
  <p>And in <strong>Jenkins</strong>, a self-hosted CI server configured with a <code>Jenkinsfile</code> written in a Groovy-based language (not run or validated here: it needs a Jenkins server):</p>
  <div class="fx" data-lang="text">pipeline {
  agent { docker { image 'python:3.12-slim' } }
  environment { MLFLOW_TRACKING_URI = credentials('mlflow-uri') }
  stages {
    stage('Test') {
      steps {
        sh 'pip install -r requirements-dev.txt'
        sh 'python export_model.py &amp;&amp; python split_data.py'
        sh 'pytest -v tests --junitxml=report.xml'
      }
      post { always { junit 'report.xml' } }
    }
    stage('Gate') {
      steps {
        sh 'python evaluate.py model/v1.joblib champion.json'
        sh 'python evaluate.py model/model.joblib candidate.json'
        sh 'python gate.py candidate.json champion.json'
      }
    }
    stage('Build') {
      when { branch 'main' }
      steps { sh "docker build -t registry.biteful.internal/eta:\${GIT_COMMIT} ." }
    }
  }
}</div>
  <table class="tbl">
    <tr><th>Idea</th><th>GitHub Actions</th><th>GitLab CI</th><th>Jenkins</th></tr>
    <tr><td>Config file</td><td><code>.github/workflows/*.yml</code></td><td><code>.gitlab-ci.yml</code></td><td><code>Jenkinsfile</code></td></tr>
    <tr><td>Ordering</td><td><code>needs</code></td><td><code>stages</code> (+ <code>needs</code>)</td><td><code>stages { stage(...) }</code></td></tr>
    <tr><td>Matrix</td><td><code>strategy.matrix</code></td><td><code>parallel: matrix</code></td><td><code>matrix { axes { ... } }</code></td></tr>
    <tr><td>Condition</td><td><code>if:</code></td><td><code>rules: - if:</code></td><td><code>when { branch 'main' }</code></td></tr>
    <tr><td>Secrets</td><td><code>secrets.X</code></td><td>CI/CD variables (masked)</td><td><code>credentials('id')</code></td></tr>
    <tr><td>Files between jobs</td><td>upload/download-artifact</td><td><code>artifacts: paths</code></td><td><code>stash</code>/<code>archiveArtifacts</code></td></tr>
    <tr><td>Machines</td><td>GitHub-hosted / self-hosted runners</td><td>shared / own GitLab runners</td><td>Jenkins agents (all self-managed)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>GitLab CI</strong>: GitLab's built-in CI/CD, configured by <code>.gitlab-ci.yml</code> with stages and jobs run by GitLab runners. <strong>Jenkins</strong>: an open-source, self-hosted automation server; a <strong>declarative pipeline</strong> in a <code>Jenkinsfile</code> defines agents, stages, steps and post actions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pipelines that only work on the CI server. If <code>pytest</code>, <code>evaluate.py</code> and <code>gate.py</code> can't run on a laptop with the same commands, debugging becomes "push and wait". Keep the logic in scripts; keep the CI file a thin list of commands (as all three files above do).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Docker Multi-Stage Builds.</b> After the gate passes, the pipeline "builds the image". What should that image contain, and why do we build it in two stages?</div>

  <h2 id="ci-docker"><span class="num">07</span>Docker Multi-Stage Builds for the Model Server</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The server needs Python 3.12, FastAPI, scikit-learn 1.9.1, the feature code, the server code and the champion model file. How do we ship exactly that, the same everywhere, and nothing more?</p>
  </div>
  <p>The <a class="xref" data-note="se_docker">Docker note</a> covers images, layers and multi-stage builds in depth. Here we apply them to the model server (<code>app.py</code>, explained in the <a class="xref" data-note="mlops_serving">serving note</a>). Sandbox limit: image builds here have no internet, so the exact package versions were downloaded once into a <code>wheels/</code> folder and installed with <code>--no-index --find-links=/wheels</code>; in a real pipeline that line would simply be <code>pip install -r requirements.txt</code>. Two Dockerfiles, single-stage first:</p>
  <div class="fx" data-lang="text">FROM python:3.12-slim
WORKDIR /app
COPY wheels/ /wheels/
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt
COPY features.py app.py ./
COPY model/model.joblib model/
ENV MODEL_VERSION=2
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]</div>
  <div class="fx" data-lang="text"># ---- stage 1: builder — installs packages into a virtualenv ----
FROM python:3.12-slim AS builder
COPY wheels/ /wheels/
COPY requirements.txt .
RUN python -m venv /opt/venv \\
 &amp;&amp; /opt/venv/bin/pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt

# ---- stage 2: runtime — only the finished venv, the code and the model ----
FROM python:3.12-slim
RUN useradd --create-home app
COPY --from=builder /opt/venv /opt/venv
WORKDIR /app
COPY features.py app.py ./
COPY model/model.joblib model/
ENV PATH=/opt/venv/bin:$PATH MODEL_VERSION=2
USER app
EXPOSE 8000
HEALTHCHECK --interval=10s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/ready')"
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]</div>
  <p>The multi-stage file has two <code>FROM</code> lines. The <strong>builder</strong> stage installs every package into a virtual environment at <code>/opt/venv</code>. The second stage starts again from a clean <code>python:3.12-slim</code> and copies <em>only</em> that finished venv, the two code files and the 230 KB model. Everything else in the builder (the wheel files, pip's leftovers) is thrown away. It also creates a user <code>app</code> and runs as that user, and declares a <code>HEALTHCHECK</code> that calls <code>/ready</code>. The real build and run:</p>
  <div class="fx" data-lang="text">$ docker build -q -f Dockerfile.single -t biteful-eta:single .
sha256:c5e0609a46d301034ffc807fd1d7a72992fbe850a616713620683e979676b9db
$ docker build -q -t biteful-eta:2 .
sha256:11e1cafa9ddee756318f182cae6c06b3d6f0fdc64d985d7166c090dd5db61aae
$ docker images biteful-eta --format "table {{.Repository}}:{{.Tag}}\\t{{.Size}}"
REPOSITORY:TAG       SIZE
biteful-eta:2        676MB
biteful-eta:single   824MB
$ docker run --rm biteful-eta:single ls /wheels | wc -l
24
$ docker run --rm biteful-eta:2 sh -c "ls /wheels 2&gt;&amp;1; whoami"
ls: cannot access '/wheels': No such file or directory
app
$ docker run -d --name biteful-eta-ci -p 18080:8000 biteful-eta:2
4a9a9b2903ce0cd7a9a025773ff18c150eef04b32c657e52141f0265c2d3fb3e
$ sleep 4
$ curl -s localhost:18080/health; echo
{"status":"ok"}
$ curl -s localhost:18080/ready; echo
{"ready":true,"model_version":"2","load_seconds":1.293}
$ curl -s -X POST localhost:18080/predict -H "Content-Type: application/json" -d '{"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}'; echo
{"eta_minutes":56.1,"model_version":"2"}
$ docker ps --filter name=biteful-eta-ci --format "{{.Names}}  {{.Status}}"
biteful-eta-ci  Up 4 seconds (health: starting)
$ docker rm -f biteful-eta-ci
biteful-eta-ci</div>
  <ul>
    <li>Sizes: single-stage 824 MB, multi-stage 676 MB: the 24 wheel files (74 MB) and pip's install leftovers stay in the single-stage image forever, because every layer is kept.</li>
    <li><code>ls /wheels</code> fails in the multi-stage image, and <code>whoami</code> says <code>app</code>, not root.</li>
    <li>The container answered <code>/health</code>, <code>/ready</code> (model version 2, loaded in 1.293 s) and predicted <strong>56.1 minutes</strong> for Monday order 2: the same number as the MLflow server in the previous note, now from a box that runs anywhere.</li>
    <li>The image tag here is <code>2</code>; in CI it is <code>\${{ github.sha }}</code>, so a running container names the exact commit it came from.</li>
  </ul>
  <h3>GPU images (not run here: no GPU)</h3>
  <p>A neural network that needs a GPU needs two extra things. The image starts <code>FROM</code> an NVIDIA CUDA base (for example <code>nvidia/cuda:12.x-cudnn-runtime-ubuntu22.04</code>, or a framework image like <code>pytorch/pytorch</code>) so the CUDA libraries match the framework. And the host needs the <strong>NVIDIA Container Toolkit</strong>, which lets Docker pass the GPU driver into containers: <code>docker run --gpus all image</code>. On Kubernetes, the NVIDIA device plugin does the same job (Kubernetes note). GPU images are large (several GB), so multi-stage builds and layer caching matter even more.</p>
  <h3>Scanning images</h3>
  <p>Before pushing, many pipelines scan the image for packages with known vulnerabilities (CVEs) using a tool like <strong>Trivy</strong> (<code>trivy image biteful-eta:&lt;sha&gt;</code>) and fail on critical findings. Smaller images have fewer packages to patch: another reason for slim bases and multi-stage builds.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>multi-stage build</strong> uses several <code>FROM</code> stages in one Dockerfile; later stages copy selected files from earlier ones (<code>COPY --from=builder</code>), so build tools and intermediate files never reach the shipped image.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Different library versions in training and serving. The model was trained with scikit-learn 1.9.1; an image with 1.5 may refuse to load it or, worse, load and predict differently. Pin exact versions in <code>requirements.txt</code> (all 24 here, including dependencies of dependencies), and let the smoke test in CI prove the image predicts what the registry model predicts.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: CI vs CT, the Full Flow.</b> The pipeline tests and packages models that already exist in the registry. Who trains them? Should CI retrain the model on every push?</div>

  <h2 id="ci-ct"><span class="num">08</span>CI vs CT: the Full Flow from Commit to Production</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A full training run with Optuna took about a minute on 2,198 orders; on a year of Biteful orders it would take hours on big machines. Should every pull request retrain the model? If not, how do new models enter the pipeline?</p>
  </div>
  <p>No. CI must be fast (minutes) so developers get feedback while they still remember the change. Full training is slow, expensive and depends on fresh data, not on code changes. So there are two loops that meet at the registry:</p>
  <figure class="viz"><svg viewBox="0 0 640 210" width="640">
    <defs><marker id="ci-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="10" y="20" font-size="12" font-weight="700">CI/CD loop (code changes, minutes)</text>
    <rect x="10" y="30" width="110" height="36" rx="6" class="fb sb"/><text x="65" y="52" text-anchor="middle" font-size="11">push / PR</text>
    <rect x="140" y="30" width="130" height="36" rx="6" class="fb sb"/><text x="205" y="52" text-anchor="middle" font-size="11">tests + sample train</text>
    <rect x="290" y="30" width="110" height="36" rx="6" class="fg sg"/><text x="345" y="52" text-anchor="middle" font-size="11">gate</text>
    <rect x="420" y="30" width="100" height="36" rx="6" class="fb sb"/><text x="470" y="52" text-anchor="middle" font-size="11">image:sha</text>
    <rect x="540" y="30" width="90" height="36" rx="6" class="ft st"/><text x="585" y="52" text-anchor="middle" font-size="11">staging→prod</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ci-ar2)"><line x1="120" y1="48" x2="138" y2="48"/><line x1="270" y1="48" x2="288" y2="48"/><line x1="400" y1="48" x2="418" y2="48"/><line x1="520" y1="48" x2="538" y2="48"/></g>
    <text x="10" y="130" font-size="12" font-weight="700">CT loop (new data, hours)</text>
    <rect x="10" y="140" width="130" height="36" rx="6" class="fr sr"/><text x="75" y="162" text-anchor="middle" font-size="11">trigger: wk5 MAE 3.8</text>
    <rect x="160" y="140" width="150" height="36" rx="6" class="fb sb"/><text x="235" y="162" text-anchor="middle" font-size="11">dvc repro + Optuna</text>
    <rect x="330" y="140" width="150" height="36" rx="6" class="fv" stroke="currentColor"/><text x="405" y="162" text-anchor="middle" font-size="11">registry @challenger</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ci-ar2)"><line x1="140" y1="158" x2="158" y2="158"/><line x1="310" y1="158" x2="328" y2="158"/><line x1="405" y1="140" x2="350" y2="68"/></g>
    <text x="440" y="110" class="tm" font-size="11">candidate enters the same gate</text>
  </svg><figcaption>CI handles code; CT handles data. Both feed the same gate, image build and promotion path.</figcaption></figure>
  <ol>
    <li><strong>CI on every pull request</strong>: lint, unit and data tests, a <em>smoke</em> training run on a small sample (does <code>train.py</code> still run?), model tests against the current registry models.</li>
    <li><strong>CT on triggers</strong> (schedule, metric drop, drift, lifecycle note): an orchestrated pipeline (DVC, <a class="xref" data-note="de_etl">Airflow</a>, Kubeflow, SageMaker Pipelines) pulls fresh data, trains and tunes on big machines, logs to MLflow and registers a <code>@challenger</code>.</li>
    <li><strong>The gate</strong> scores challenger vs champion on the frozen evaluation set (section 04).</li>
    <li><strong>CD</strong>: build and push <code>biteful-eta:&lt;sha&gt;</code>, deploy to staging, run the smoke test, then production after approval, via a canary (Kubernetes note). Promotion also moves the registry alias, so the image and the registry tell the same story.</li>
  </ol>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Smoke test</strong>: a quick check that the system starts and basic paths work (train on 100 rows, start the container, call <code>/ready</code>). <strong>Promotion</strong>: moving a tested artifact (image tag, registry alias) to the next environment without rebuilding it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Rebuilding for production. If staging tested image <code>biteful-eta:a1b2c3d</code>, production must run that same image (same digest), not a fresh build from the same commit: base images and unpinned packages may have changed in between. Build once, promote the same artifact.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Eight ideas, two loops. How do they fit into one path from Ravi's commit to a running container?</div>

  <h2 id="ci-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>For one pull request, which station catches which kind of problem, and what does each station hand to the next?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 260" width="660">
<defs><marker id="ci-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="140" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="80" y="29" text-anchor="middle" font-size="11.5" font-weight="700">PR (01, 02)</text><text x="80" y="45" text-anchor="middle" class="tm" font-size="10">on: pull_request</text>
<rect x="170" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="245" y="29" text-anchor="middle" font-size="11.5" font-weight="700">lint (pre-commit)</text><text x="245" y="45" text-anchor="middle" class="tm" font-size="10">ruff, YAML, schema</text>
<rect x="340" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="415" y="29" text-anchor="middle" font-size="11.5" font-weight="700">tests (03)</text><text x="415" y="45" text-anchor="middle" class="tm" font-size="10">16: metres bug → 9 fail</text>
<rect x="510" y="10" width="140" height="44" rx="7" class="fg sg"/><text x="580" y="29" text-anchor="middle" font-size="11.5" font-weight="700">gate (04)</text><text x="580" y="45" text-anchor="middle" class="tm" font-size="10">2.347 &lt; 2.654 → exit 0</text>
<g stroke="currentColor" fill="none" marker-end="url(#ci-a9)"><line x1="150" y1="32" x2="168" y2="32"/><line x1="320" y1="32" x2="338" y2="32"/><line x1="490" y1="32" x2="508" y2="32"/><line x1="580" y1="54" x2="580" y2="86"/></g>
<rect x="430" y="88" width="220" height="44" rx="7" class="fb sb"/><text x="540" y="107" text-anchor="middle" font-size="11.5" font-weight="700">build image (07)</text><text x="540" y="123" text-anchor="middle" class="tm" font-size="10">multi-stage 676 MB · tag = git sha</text>
<line x1="430" y1="110" x2="372" y2="110" stroke="currentColor" marker-end="url(#ci-a9)"/>
<rect x="170" y="88" width="200" height="44" rx="7" class="ft st"/><text x="270" y="107" text-anchor="middle" font-size="11.5" font-weight="700">staging → prod (02, 08)</text><text x="270" y="123" text-anchor="middle" class="tm" font-size="10">environment approval · canary</text>
<rect x="10" y="170" width="300" height="44" rx="7" class="fr sr"/><text x="160" y="189" text-anchor="middle" font-size="11.5" font-weight="700">CT pipeline (08)</text><text x="160" y="205" text-anchor="middle" class="tm" font-size="10">new data → train + Optuna → @challenger</text>
<path d="M310 192 C 560 192, 600 150, 590 56" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ci-a9)"/><text x="470" y="186" class="tm" font-size="10">enters the same gate</text>
<text x="330" y="245" text-anchor="middle" class="tm" font-size="10.5">workflow file (05) describes every arrow; GitLab CI / Jenkins (06) describe the same arrows</text>
</svg><figcaption>Each station catches one kind of failure and hands a smaller, safer thing to the next.</figcaption></figure>
  <table class="tbl"><caption>Every idea on the Biteful pipeline</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Automated pipeline</td><td>scripts + CI server</td><td>how do checks become unskippable?</td><td>Friday metres bug blocked</td><td>every shared repo</td></tr>
    <tr><td>CI / CD / CT</td><td>triggers + stages</td><td>test, ship, retrain: when?</td><td>PR → tests; main → image; drift → retrain</td><td>always name which CD</td></tr>
    <tr><td>Code tests</td><td>pytest on features</td><td>does the code do what it says?</td><td>5.5 km stays 5.5</td><td>every function with logic</td></tr>
    <tr><td>Data tests</td><td>pandera schema</td><td>is the data valid?</td><td>caught 120 km and -1 min</td><td>before training and in CI</td></tr>
    <tr><td>Model + behaviour tests</td><td>budgets, Monday cases, directions, invariance</td><td>is the model good and sensible?</td><td>MAE 11.1 and 40.697 = 40.697 with the bug</td><td>every candidate</td></tr>
    <tr><td>Gate</td><td>evaluate.py + exit code</td><td>better than live?</td><td>2.347 vs 2.654 → 0; 4.698 → 1</td><td>before any promotion</td></tr>
    <tr><td>Workflow anatomy</td><td>on, jobs, needs, matrix, secrets, artifacts</td><td>how is the line described?</td><td>5 jobs; schema caught missing runs-on</td><td>GitHub repos</td></tr>
    <tr><td>GitLab CI / Jenkins</td><td>same parts, other syntax</td><td>same thing elsewhere?</td><td>.gitlab-ci.yml validated</td><td>whatever your company runs</td></tr>
    <tr><td>Multi-stage image</td><td>builder + runtime stages</td><td>what exactly do we ship?</td><td>824 → 676 MB; non-root; 56.1 min</td><td>every deployable service</td></tr>
    <tr><td>CI vs CT</td><td>two loops, one gate</td><td>where does training happen?</td><td>sample train in CI; full in CT</td><td>any retrained model</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a CI/CD pipeline is a fixed sequence of stations (lint, code/data/model tests, a gate against the champion, an image build tagged with the commit, a promotion) that every change must pass in a clean environment, and CT feeds retrained models into the same gate instead of retraining inside CI.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Pipelines that are green but wrong.</div>

  <h2 id="ci-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which pipeline habits produce a green tick on a bad change?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: only code tests</span><p>The metres bug passes a test suite that never looks at predictions. Add data, model and behaviour tests.</p></div>
  <div class="callout trap"><span class="label">Trap: exact-number model tests</span><p>Flaky on every retrain. Test budgets and behaviours.</p></div>
  <div class="callout trap"><span class="label">Trap: no gate against the champion</span><p>"MAE under 3" lets a 2.9 model replace a 2.654 one. Compare with the live model on frozen data.</p></div>
  <div class="callout trap"><span class="label">Trap: full training inside CI</span><p>Slow feedback, huge bills, flaky jobs. Smoke-train on a sample; full training in CT.</p></div>
  <div class="callout trap"><span class="label">Trap: secrets in YAML or logs</span><p>Use <code>secrets.*</code>/masked variables; never echo them.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>:latest</code> and rebuilds</span><p>Tag images with the Git SHA; promote the same image from staging to production.</p></div>
  <div class="callout trap"><span class="label">Trap: single-stage, root, unpinned images</span><p>Bigger, riskier, drifting. Multi-stage, non-root user, every version pinned.</p></div>
  <div class="callout trap"><span class="label">Trap: self-hosted runners on public repos</span><p>Anyone's pull request can run code on your machine. Use them only for private repos or with strict approval.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="ci-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful repo; registry v1 forest (test MAE 2.654), v2 boosting (2.347, R² 0.92); 550 frozen test orders, baseline MAE 8.501; Monday orders 23, 55, 14, 36, 47, 43. 16 tests: 3 code, 2 data, 11 model. The metres bug fails 9. Gate: v2 passes (exit 0), shallow forest 4.698 fails (exit 1). Image: single-stage 824 MB, multi-stage 676 MB, non-root, order 2 → 56.1 minutes.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Release problem</td><td>why do bad changes ship?</td><td>Friday metres bug</td><td>need named stages</td></tr>
    <tr><td>CI vs CD vs CT</td><td>test, ship, retrain: who/when?</td><td>PR tests; main builds; drift retrains</td><td>what is "test" for a model?</td></tr>
    <tr><td>ML tests</td><td>code, data, model OK?</td><td>16 tests; bug fails 9</td><td>good enough ≠ better</td></tr>
    <tr><td>Gate</td><td>better than live?</td><td>2.347 &lt; 2.654, exit 0</td><td>how to run it on every push?</td></tr>
    <tr><td>GitHub Actions</td><td>how is the line written?</td><td>5 jobs, matrix, secrets, artifacts</td><td>other CI servers?</td></tr>
    <tr><td>GitLab / Jenkins</td><td>same elsewhere?</td><td>same stages, other syntax</td><td>what is shipped?</td></tr>
    <tr><td>Multi-stage image</td><td>what exactly ships?</td><td>676 MB, non-root, sha tag</td><td>who trains models?</td></tr>
    <tr><td>CI vs CT</td><td>where does training go?</td><td>sample in CI, full in CT</td><td>→ serving note</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <ul>
    <li><strong>CI</strong>: build + test every change. <strong>Continuous delivery</strong>: always deployable, human releases. <strong>Continuous deployment</strong>: automatic release. <strong>CT</strong>: automatic retraining.</li>
    <li><strong>MAE</strong> = (1/n) Σ|yᵢ − ŷᵢ|; <strong>baseline MAE</strong> = MAE of always predicting the training mean (8.501 on our test set).</li>
    <li><strong>Gate</strong>: pass if MAE_cand &lt; 0.5 × MAE_baseline AND MAE_cand &lt; MAE_champion AND R² ≥ 0.85; report with exit code (0 pass, non-zero stop).</li>
    <li><strong>Behavioural tests</strong>: minimum functionality, directional expectation, invariance.</li>
    <li><strong>pandera</strong>: <code>DataFrameSchema({col: Column(type, Check...)}, checks=..., strict=True)</code>; <code>validate(df, lazy=True)</code> → <code>SchemaErrors.failure_cases</code>.</li>
    <li><strong>GitHub Actions</strong>: <code>on</code>, <code>jobs.&lt;id&gt;</code>, <code>runs-on</code>, <code>needs</code>, <code>steps</code> (<code>uses</code>/<code>run</code>), <code>strategy.matrix</code>, <code>secrets.*</code>, <code>if</code>, <code>environment</code>, upload/download-artifact, <code>\${{ github.sha }}</code>.</li>
    <li><strong>GitLab CI</strong>: <code>stages</code>, jobs with <code>stage</code>, <code>image</code>, <code>script</code>, <code>parallel: matrix</code>, <code>rules</code>, <code>artifacts</code>. <strong>Jenkins</strong>: <code>pipeline { agent; environment; stages { stage { steps } }; post }</code>, <code>when</code>, <code>credentials()</code>.</li>
    <li><strong>Multi-stage</strong>: <code>FROM … AS builder</code> … <code>FROM …</code> + <code>COPY --from=builder</code>; <code>USER</code>; <code>HEALTHCHECK</code>. GPU: CUDA base image + NVIDIA Container Toolkit + <code>--gpus all</code>.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Data tests</b><p>Every training run and every new export.</p><small>Exact duplicates may be legitimate without IDs: test rates</small></div>
    <div><b>Behaviour tests</b><p>Any model whose inputs have known directions.</p><small>Not a replacement for metric budgets</small></div>
    <div><b>Gate vs champion</b><p>Before any promotion, manual or automatic.</p><small>Needs a frozen evaluation set</small></div>
    <div><b>Self-hosted runners</b><p>GPUs, private networks, big memory.</p><small>Never on public repos</small></div>
    <div><b>Continuous deployment</b><p>Mature teams with automated canary analysis.</p><small>Otherwise delivery + approval</small></div>
    <div><b>Multi-stage builds</b><p>Every image with build-time files.</p><small>Same base in both stages</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Only code tests; exact-number model tests; no champion comparison; full training in CI; secrets in YAML; <code>:latest</code> and rebuild-per-environment; root, unpinned, single-stage images; self-hosted runners on public repos; PyYAML reading <code>on</code> as <code>True</code>.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Continuous delivery vs deployment?</td><td>Delivery: always releasable, a human approves production; deployment: production release is automatic</td></tr>
    <tr><td>Baseline MAE 8.501. Does a candidate with MAE 4.698 pass "beats baseline by half"?</td><td>No: half is 4.25 and 4.698 &gt; 4.25</td></tr>
    <tr><td>How does <code>gate.py</code> stop the pipeline?</td><td>It exits with code 1; the CI step fails and dependent jobs don't run</td></tr>
    <tr><td>Why did the multi-stage image shrink from 824 to 676 MB?</td><td>Wheel files and pip leftovers stayed in the builder stage; only the venv, code and model were copied</td></tr>
    <tr><td>Name one directional and one invariance test for Biteful.</td><td>Directional: 2 km &lt; 4 km &lt; 6 km in minutes; invariance: customer name doesn't change the ETA</td></tr>
  </table>

  <h2 id="ci-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What tests belong in an ML CI pipeline that ordinary software doesn't have?</summary><div class="qa-body">Data tests (schema, ranges, allowed values, distribution and volume), model tests (metric budgets on frozen data, per-slice checks), behavioural tests (minimum functionality, directional, invariance), a gate against the champion, and training/serving consistency (the image predicts what the registry model predicts).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CI vs continuous delivery vs continuous deployment vs CT?</summary><div class="qa-body">CI builds and tests every change. Continuous delivery keeps every passing change deployable, with a human releasing to production. Continuous deployment releases automatically. CT retrains models automatically when data or triggers say so; its candidates enter the same gate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not retrain the full model in CI on every pull request?</summary><div class="qa-body">It is slow and expensive, depends on fresh data rather than code, and makes CI flaky. CI smoke-trains on a sample to prove the code still runs and tests the registry's models; a separate CT pipeline does full training and registers a challenger.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a gate script stop a pipeline?</summary><div class="qa-body">Through its exit code. Our <code>gate.py</code> exits 0 when all checks pass and 1 otherwise; the CI server marks the step failed and skips every job that <code>needs</code> it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a matrix build and when is it useful?</summary><div class="qa-body">One job definition expanded into several parallel variants, e.g. Python 3.11 and 3.12, or CPU and GPU. Useful when the code must work across versions or platforms; for ML, often Python/library versions and hardware types.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GitHub-hosted vs self-hosted runners for ML?</summary><div class="qa-body">Hosted: fresh VMs, nothing to maintain, but no GPUs on standard runners and no access to private networks. Self-hosted: your machines or Kubernetes pods with GPUs and access to internal data/MLflow, but you secure and patch them, and they must not run untrusted pull requests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why a multi-stage Docker build for a model server?</summary><div class="qa-body">Build-time files (wheels, compilers, caches) stay in the builder stage; the runtime stage gets only the venv, code and model. Smaller (824 → 676 MB here), fewer packages to scan and patch, and it's natural to add a non-root user and a health check.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What extra is needed to run a GPU model in a container?</summary><div class="qa-body">A CUDA-compatible base image whose libraries match the framework, the NVIDIA driver on the host, and the NVIDIA Container Toolkit so <code>docker run --gpus all</code> can expose the GPU; on Kubernetes, the NVIDIA device plugin.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the gate need the registry from the MLflow note?</summary><div class="qa-body">The gate compares the candidate with the <em>live</em> champion. The registry is where "live" is defined (<code>@champion</code>) and where both model versions are fetched from with their lineage; without it the pipeline wouldn't know what to beat.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if tests import a copy of the feature code instead of the shared <code>features.py</code>?</summary><div class="qa-body">The tests would check the copy while the server runs the original; a change like the metres bug would pass CI and break production. One feature module, imported by training, tests and the server, is what makes the tests meaningful.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why tag images with the Git SHA if the registry already versions models?</summary><div class="qa-body">The image holds code, dependencies and a model; the SHA names the code exactly, the registry version names the model. Together they let you trace any running container back to both, and roll back either by redeploying a previous image (Kubernetes note) or moving the alias.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your data test failed on "no duplicate rows". Is the data broken?</summary><div class="qa-body">Not necessarily. Without an order ID, two different orders can look identical (17 of 2,198 here). Test a duplicate <em>rate</em>, or better, add a unique ID upstream and test uniqueness of that.</div></details>
</main>
`
});
