// notes/mlops/mlops_lifecycle.js — The ML Lifecycle
Object.assign(TOPIC_CONTENT, {
  "mlops_lifecycle": `<main>
  <h1>The ML Lifecycle</h1>
  <p class="lead">Building a model is 10% of the work; the other 90% is getting it to production and keeping it right. This page shows the loop every production model lives in and the habits (versioning, reproducibility, drift checks) that keep it honest.</p>

  <h2 id="ml-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">The ML Lifecycle</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li><b>Stages</b> — data + versioning → experiment → train → evaluate → deploy → monitor → retrain</li>
          <li><b>Evaluation gate</b> — candidate must beat baseline and current champion before deploy</li>
          <li><b>Train from scripts</b> — not notebooks, so pipelines can rerun it</li>
          <li>💡 A model is a car, not a painting: needs fuel (data), servicing (retrain), dashboard (monitoring)</li>
          <li><b>~10% modelling</b> — the rest is data, serving, monitoring, upkeep</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">MLOps vs DevOps</div>
        <ul>
          <li><b>Three things change</b> — code (Git), data (DVC/snapshots), model (registry)</li>
          <li><b>Extra tests</b> — data validation, model quality, slices, fairness</li>
          <li><b>Silent failure</b> — models get quietly worse, no crash</li>
          <li><b>CT</b> — continuous training added to CI/CD</li>
          <li>⚠ <b>Same code ≠ same model</b> — new data gives new weights; version all three</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reproducibility</div>
        <ul>
          <li><b>Recipe</b> — Git SHA + data hash + locked env + params + seed = same model</li>
          <li><b>Seeds</b> — <code>random_state</code>, <code>np.random.seed</code>, <code>torch.manual_seed</code></li>
          <li><b>Env</b> — pinned requirements / lockfile / Docker image</li>
          <li><b>GPU</b> — <code>torch.use_deterministic_algorithms(True)</code>, slower</li>
          <li><b>Demo</b> — no seed: acc 0.993 vs 0.965 from luck alone</li>
          <li>⚠ <b>Training on the live table</b> — unreproducible; use a snapshot and log its ID</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">DVC</div>
        <ul>
          <li><b>What</b> — Git for big data: pointer in Git, bytes in a remote</li>
          <li><b><code>dvc add file</code></b> — writes <code>file.dvc</code> (md5, size) + gitignores the file</li>
          <li><b><code>dvc push / pull</code></b> — sync bytes with S3/GCS/folder remote</li>
          <li><b><code>dvc status</code></b> — shows data changed since last add</li>
          <li><b>Time travel</b> — <code>git checkout &lt;rev&gt; -- file.dvc</code> then <code>dvc checkout</code></li>
          <li><b>Payoff</b> — "which data trained v7?" becomes a <code>git log</code> question</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Drift</div>
        <ul>
          <li><b>Data drift</b> — P(X) changes; e.g. younger users; detect with PSI/KS, no labels</li>
          <li><b>Concept drift</b> — P(y|X) changes; same input, new right answer; needs labels</li>
          <li><b>Model drift / decay</b> — the symptom: live metric falls</li>
          <li><b>Delayed labels</b> — use proxies: input drift, prediction drift, data quality</li>
          <li>⚠ <b>Drift ≠ harm</b> — decide on live metrics; check for upstream pipeline bugs first</li>
          <li>Deep dive: ML System Design → Monitoring, Drift &amp; Retraining</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Retraining triggers</div>
        <ul>
          <li><b>Scheduled</b> — simple, predictable; may waste compute or react late</li>
          <li><b>Metric drop</b> — best signal; needs labels</li>
          <li><b>Drift alert</b> — early, label-free, noisy</li>
          <li><b>Data volume / events</b> — N new labels; product or market launch</li>
          <li><b>Common combo</b> — schedule as floor + triggers for urgent drops</li>
          <li>⚠ <b>No gate</b> — never auto-deploy; compare to champion, then canary</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Maturity &amp; roles</div>
        <ul>
          <li><b>Level 0</b> — manual notebooks, pickle handed over, rare releases</li>
          <li><b>Level 1</b> — automated training pipeline (CT), registry, monitoring</li>
          <li><b>Level 2</b> — CI/CD also tests and deploys the pipeline code</li>
          <li><b>Roles</b> — data eng (tables) → DS (candidate model) → MLE (live endpoint) → platform (tools)</li>
          <li><b>Handoff contract</b> — registry entry: code SHA, data version, signature, metrics</li>
          <li>⚠ <b>Over the wall</b> — a <code>.pkl</code> in Slack is not a handoff</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ml-loop"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Lifecycle Loop</span><span class="rm-sub">Seven stages, never "done"</span></div></div>
      <div class="rm-item rm-done" data-target="ml-devops"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Why Not Just DevOps?</span><span class="rm-sub">Code, data and model all change</span></div></div>
      <div class="rm-item rm-done" data-target="ml-repro"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Reproducibility</span><span class="rm-sub">Seeds, environments, data</span></div></div>
      <div class="rm-item rm-done" data-target="ml-dvc"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Hands-on: DVC</span><span class="rm-sub">Git for big data files</span></div></div>
      <div class="rm-item rm-done" data-target="ml-drift"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Data, Concept, Model Drift</span><span class="rm-sub">Why models rot</span></div></div>
      <div class="rm-item rm-done" data-target="ml-retrain"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Retraining Triggers</span><span class="rm-sub">When to train again</span></div></div>
      <div class="rm-item rm-done" data-target="ml-mature"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">MLOps Maturity Levels</span><span class="rm-sub">Manual → fully automated</span></div></div>
      <div class="rm-item rm-done" data-target="ml-roles"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Roles &amp; Handoffs</span><span class="rm-sub">Who owns what</span></div></div>
      <div class="rm-item rm-done" data-target="ml-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ml-loop"><span class="num">01</span>The Lifecycle Loop</h2>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="ml-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="130" height="40" rx="6" class="fb sb"/><text x="75" y="44" text-anchor="middle">Data + versioning</text>
    <rect x="160" y="20" width="130" height="40" rx="6" class="fb sb"/><text x="225" y="44" text-anchor="middle">Experimentation</text>
    <rect x="310" y="20" width="130" height="40" rx="6" class="fb sb"/><text x="375" y="44" text-anchor="middle">Training</text>
    <rect x="460" y="20" width="130" height="40" rx="6" class="fb sb"/><text x="525" y="44" text-anchor="middle">Evaluation</text>
    <rect x="460" y="130" width="130" height="40" rx="6" class="fg sg"/><text x="525" y="154" text-anchor="middle">Deployment</text>
    <rect x="235" y="130" width="130" height="40" rx="6" class="ft st"/><text x="300" y="154" text-anchor="middle">Monitoring</text>
    <rect x="10" y="130" width="130" height="40" rx="6" class="fr sr"/><text x="75" y="154" text-anchor="middle">Retraining</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ml-ar1)">
      <line x1="140" y1="40" x2="158" y2="40"/><line x1="290" y1="40" x2="308" y2="40"/><line x1="440" y1="40" x2="458" y2="40"/>
      <line x1="525" y1="60" x2="525" y2="128"/><line x1="460" y1="150" x2="367" y2="150"/><line x1="235" y1="150" x2="142" y2="150"/>
      <line x1="75" y1="130" x2="75" y2="62" stroke-dasharray="4 3"/>
    </g>
    <text x="535" y="98" class="tm" font-size="11">passes gate?</text>
    <text x="85" y="98" class="tm" font-size="11">drift / schedule</text>
    <text x="300" y="192" text-anchor="middle" class="tm" font-size="11">the loop never ends: production feedback becomes new data</text>
  </svg><figcaption>Notice the dashed arrow: monitoring feeds retraining, which restarts the loop.</figcaption></figure>
  <table class="tbl">
    <tr><th>Stage</th><th>Output (the thing handed on)</th><th>Typical tools</th></tr>
    <tr><td>Data collection &amp; versioning</td><td>A dataset with an ID / hash</td><td>SQL, Airflow, DVC, Delta Lake</td></tr>
    <tr><td>Experimentation</td><td>Chosen features, model family, params</td><td>Notebooks, MLflow tracking</td></tr>
    <tr><td>Training</td><td>A model artifact from a <em>script</em>, not a notebook</td><td>Pipelines, GPUs, SageMaker jobs</td></tr>
    <tr><td>Evaluation</td><td>Metrics vs baseline + pass/fail gate</td><td>Holdout sets, slice metrics</td></tr>
    <tr><td>Deployment</td><td>Model behind an API or batch job</td><td>Registry, Docker, K8s, endpoints</td></tr>
    <tr><td>Monitoring</td><td>Alerts on errors, latency, drift, metrics</td><td>Prometheus, Evidently, dashboards</td></tr>
    <tr><td>Retraining</td><td>New candidate model → back to evaluation</td><td>Scheduled or triggered pipelines</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A model is a car, not a painting. Shipping it is the start: it needs fuel (fresh data), servicing (retraining) and a dashboard (monitoring).</p>
  </div>

  <h2 id="ml-devops"><span class="num">02</span>Why Not Just DevOps?</h2>
  <div class="cards">
    <div><b>Code changes</b><p>New feature logic, bug fix, library upgrade.</p><small>Versioned by: Git</small></div>
    <div><b>Data changes</b><p>New rows daily, schema tweaks, the world shifts.</p><small>Versioned by: DVC, Delta, snapshots</small></div>
    <div><b>Model changes</b><p>Retrained weights, new params, even with the same code.</p><small>Versioned by: model registry</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>DevOps (normal software)</th><th>MLOps</th></tr>
    <tr><td>Behaviour set by</td><td>Code only</td><td>Code + data + params</td></tr>
    <tr><td>Tests</td><td>Unit, integration</td><td>+ data validation, model quality, fairness</td></tr>
    <tr><td>Failure mode</td><td>Crashes, errors (loud)</td><td>Silently worse predictions (quiet)</td></tr>
    <tr><td>After release</td><td>Stays correct until code changes</td><td>Decays as the world drifts</td></tr>
    <tr><td>Pipelines</td><td>CI/CD</td><td>CI/CD + <strong>CT</strong> (continuous training)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Same code, so same model" is false. Rerun the same script on next month's data and you get a different model. Version all three.</p>
  </div>

  <h2 id="ml-repro"><span class="num">03</span>Reproducibility</h2>
  <p>Reproducible = anyone can rebuild the exact model from its recorded inputs. Needed for debugging, audits and fair comparisons.</p>
  <div class="flow"><span>Code (Git SHA)</span><span>Data (DVC hash)</span><span>Env (lockfile / Docker)</span><span>Params + seed</span><span>Same model</span></div>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
X, y = load_breast_cancer(return_X_y=True)

def score(seed):
    Xtr, Xte, ytr, yte = train_test_split(X, y, random_state=seed)
    return RandomForestClassifier(n_estimators=20, random_state=seed).fit(Xtr, ytr).score(Xte, yte)

print("no seed :", [round(score(None), 4) for _ in range(3)])
print("seed=42 :", [round(score(42), 4) for _ in range(3)])</div>
  <div class="fx" data-lang="text">no seed : [0.993, 0.965, 0.965]
seed=42 : [0.965, 0.965, 0.965]</div>
  <p>Without a seed, accuracy jumps 0.965 → 0.993 from pure luck. That "improvement" is noise, not a better model.</p>
  <table class="tbl">
    <tr><th>Source of randomness / drift</th><th>Pin it with</th></tr>
    <tr><td>Splits, init, sampling</td><td><code>random_state</code>, <code>np.random.seed</code>, <code>torch.manual_seed</code></td></tr>
    <tr><td>Library versions</td><td><code>requirements.txt</code> with exact pins, <code>uv.lock</code>/<code>poetry.lock</code>, Docker image</td></tr>
    <tr><td>Data</td><td>DVC hash, table snapshot, or dated partition</td></tr>
    <tr><td>GPU non-determinism</td><td><code>torch.use_deterministic_algorithms(True)</code> (slower)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pointing training at "the live table" makes it unreproducible: rerun next week and the rows differ. Train on a snapshot and log its ID.</p>
  </div>

  <h2 id="ml-dvc"><span class="num">04</span>Hands-on: DVC</h2>
  <p><strong>DVC</strong> (Data Version Control) puts a tiny pointer file in Git and stores the real data in a remote (S3, GCS, a folder).</p>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <defs><marker id="ml-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="140" height="50" rx="6" class="fs" stroke="currentColor"/><text x="80" y="62" text-anchor="middle">train.csv</text><text x="80" y="78" text-anchor="middle" class="tm" font-size="11">23 KB … 50 GB</text>
    <rect x="220" y="10" width="140" height="44" rx="6" class="fb sb"/><text x="290" y="30" text-anchor="middle">train.csv.dvc</text><text x="290" y="46" text-anchor="middle" class="tm" font-size="11">md5 + size → Git</text>
    <rect x="220" y="78" width="140" height="44" rx="6" class="ft st"/><text x="290" y="98" text-anchor="middle">cache / remote</text><text x="290" y="114" text-anchor="middle" class="tm" font-size="11">actual bytes → S3</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ml-ar2)"><line x1="150" y1="58" x2="218" y2="34"/><line x1="150" y1="72" x2="218" y2="98"/></g>
    <rect x="420" y="40" width="130" height="50" rx="6" class="fg sg"/><text x="485" y="62" text-anchor="middle">git commit</text><text x="485" y="78" text-anchor="middle" class="tm" font-size="11">code + data pointer</text>
    <line x1="360" y1="32" x2="418" y2="58" stroke="currentColor" marker-end="url(#ml-ar2)"/>
  </svg><figcaption>Git holds a 5-line pointer; the heavy file lives in the DVC remote. Checking out a commit restores the matching data.</figcaption></figure>
  <div class="fx" data-lang="text">$ git init &amp;&amp; dvc init
$ dvc add data/train.csv
To track the changes with git, run:
	git add data/.gitignore data/train.csv.dvc

$ cat data/train.csv.dvc
outs:
- md5: 34a93622469ea3eeeccce658cb813502
  size: 23367
  hash: md5
  path: train.csv

$ cat data/.gitignore          # DVC stops Git tracking the big file
/train.csv

$ git add -A &amp;&amp; git commit -m "data v1"
$ dvc remote add -d store /path/to/dvcstore   # usually s3://bucket/dvc
$ dvc push
1 file pushed

$ echo "1000,9999" &gt;&gt; data/train.csv        # data changes
$ dvc status
data/train.csv.dvc:
	changed outs:
		modified:           data/train.csv

$ dvc add data/train.csv &amp;&amp; git commit -am "data v2"
$ git checkout HEAD~1 -- data/train.csv.dvc &amp;&amp; dvc checkout   # back to v1
M       data/train.csv
$ wc -l data/train.csv
1001 data/train.csv            # header + 1000 rows: v1 restored</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A Git commit now pins code <em>and</em> data together. "Which data trained model v7?" becomes a <code>git log</code> question.</p>
  </div>

  <h2 id="ml-drift"><span class="num">05</span>Data, Concept, Model Drift</h2>
  <figure class="viz"><svg viewBox="0 0 580 150" width="580">
    <text x="140" y="16" text-anchor="middle">Data drift: P(X) moves</text>
    <line x1="20" y1="120" x2="270" y2="120" stroke="currentColor"/>
    <path d="M30,120 C80,120 85,40 110,40 C135,40 140,120 190,120" class="sb fb" stroke-width="2"/>
    <path d="M100,120 C150,120 155,55 180,55 C205,55 210,120 260,120" class="sr" fill="none" stroke-width="2" stroke-dasharray="5 3"/>
    <text x="95" y="34" class="tb" font-size="11">train</text><text x="190" y="50" class="tr" font-size="11">prod</text>
    <text x="140" y="140" text-anchor="middle" class="tm" font-size="11">e.g. users get younger</text>
    <text x="440" y="16" text-anchor="middle">Concept drift: P(y|X) moves</text>
    <rect x="310" y="28" width="260" height="92" fill="none" stroke="currentColor" stroke-opacity=".4"/>
    <g class="tb"><circle cx="340" cy="50" r="4"/><circle cx="365" cy="95" r="4"/><circle cx="390" cy="65" r="4"/><circle cx="420" cy="100" r="4"/></g>
    <g class="tr"><circle cx="490" cy="45" r="4"/><circle cx="520" cy="90" r="4"/><circle cx="540" cy="60" r="4"/><circle cx="470" cy="80" r="4"/></g>
    <line x1="445" y1="28" x2="445" y2="120" class="sb" stroke-width="2"/>
    <line x1="400" y1="28" x2="500" y2="120" class="sr" stroke-width="2" stroke-dasharray="5 3"/>
    <text x="440" y="140" text-anchor="middle" class="tm" font-size="11">same inputs, new right answer (old line vs new)</text>
  </svg><figcaption>Left: inputs look different. Right: inputs look the same, but the rule mapping them to labels changed.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Data drift (covariate shift)</th><th>Concept drift</th><th>Model drift (decay)</th></tr>
    <tr><td>What changed</td><td>Input distribution P(X)</td><td>Relationship P(y|X)</td><td>The <em>outcome</em>: model performance drops</td></tr>
    <tr><td>Example</td><td>New market brings younger users</td><td>COVID: "buys flour in bulk" stops meaning "bakery"</td><td>Fraud recall falls from 0.90 to 0.70</td></tr>
    <tr><td>Detect with</td><td>PSI, KS test, feature stats vs training</td><td>Live metrics once labels arrive</td><td>Live metrics vs baseline</td></tr>
    <tr><td>Needs labels?</td><td>No</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>Fix</td><td>Retrain on recent data; maybe reweight</td><td>Retrain with new labels; rethink features</td><td>Find the cause (one of the left two, or a bug)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Data drift does not always hurt; concept drift can happen with zero data drift. Alert on drift, but decide on live metrics. A broken upstream pipeline (nulls, unit change) looks like drift too; check that first.</p>
  </div>
  <p>Detection math (PSI, KS), dashboards and alerting are covered in depth in <em>ML System Design → Monitoring, Drift &amp; Retraining</em>.</p>

  <h2 id="ml-retrain"><span class="num">06</span>Retraining Triggers</h2>
  <div class="cards">
    <div><b>Scheduled</b><p>Every night / week / month.</p><small>Simple, predictable; may waste compute or react late</small></div>
    <div><b>Performance drop</b><p>Live metric falls below a threshold.</p><small>Best signal; needs labels (often delayed)</small></div>
    <div><b>Drift alert</b><p>PSI or KS on key features crosses a limit.</p><small>Early, label-free; noisy</small></div>
    <div><b>New data volume</b><p>N new labelled rows collected.</p><small>Good when labels arrive in bursts</small></div>
    <div><b>Event</b><p>New product, market or policy launch.</p><small>Manual, known in advance</small></div>
  </div>
  <div class="flow"><span>Trigger fires</span><span>Pipeline retrains on fresh snapshot</span><span>Eval vs current champion</span><span>Better? → register + deploy</span><span>Worse? → keep old, alert human</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never auto-deploy a retrained model without a gate. If the new data was corrupt, automation ships a broken model at 3 a.m.</p>
  </div>

  <h2 id="ml-mature"><span class="num">07</span>MLOps Maturity Levels</h2>
  <p>Google's widely quoted scale. Most companies sit at level 0 or 1.</p>
  <table class="tbl">
    <tr><th>Level</th><th>What it looks like</th><th>Release speed</th><th>Main risk</th></tr>
    <tr><td><strong>0 · Manual</strong></td><td>Notebook → pickle → engineer rewrites it for prod</td><td>Months, a few times a year</td><td>Training/serving skew, no monitoring</td></tr>
    <tr><td><strong>1 · Pipeline automation</strong></td><td>Training is an automated pipeline; continuous training (CT) on new data; registry + monitoring</td><td>Retrains daily/weekly</td><td>Pipeline code itself changed by hand</td></tr>
    <tr><td><strong>2 · CI/CD automation</strong></td><td>Pipeline code is tested and deployed by CI/CD too; many models, many teams</td><td>Hours to days</td><td>Platform complexity, cost</td></tr>
  </table>
  <div class="callout intu"><span class="label">Interview tip</span>
    <p>Level 0 → 1 is the big win: the same code trains in dev and prod, so "it worked in my notebook" stops being a problem.</p>
  </div>

  <h2 id="ml-roles"><span class="num">08</span>Roles &amp; Handoffs</h2>
  <div class="flow"><span>Data engineer</span><span>Data scientist</span><span>ML engineer</span><span>Platform / DevOps</span><span>Product &amp; business</span></div>
  <table class="tbl">
    <tr><th>Role</th><th>Owns</th><th>Hands off</th></tr>
    <tr><td>Data engineer</td><td>Ingestion, pipelines, warehouse, data quality</td><td>Clean, versioned tables / features</td></tr>
    <tr><td>Data scientist</td><td>Problem framing, features, model choice, offline eval</td><td>Tracked experiment + candidate model in registry</td></tr>
    <tr><td>ML engineer</td><td>Training pipelines, serving, monitoring, retraining</td><td>A live, monitored endpoint or batch job</td></tr>
    <tr><td>Platform / DevOps</td><td>Clusters, CI/CD, infra, security, cost</td><td>Self-serve tools (K8s, MLflow, feature store)</td></tr>
    <tr><td>Product / business</td><td>Success metric, guardrails, A/B decisions</td><td>Go / no-go; new requirements</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The classic failure is the notebook "thrown over the wall". The fix is a shared contract: a registry entry with code SHA, data version, signature and metrics, not a <code>.pkl</code> in Slack.</p>
  </div>

  <h2 id="ml-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why does ML need MLOps rather than plain DevOps?</summary><div class="qa-body">Behaviour depends on data and trained weights, not just code. So you must version data and models, test data and model quality (not only code), monitor for silent degradation, and retrain continuously (CT). Normal software doesn't decay when the world changes; models do.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your colleague retrained with the same code and got different accuracy. List the likely causes.</summary><div class="qa-body">Unset random seeds (split, init, sampling); different data (live table changed); different library versions; GPU non-determinism; different hardware/thread counts. Fix: seeds, data snapshot or DVC hash, locked environment or Docker image, and log all of it with the run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does DVC store in Git, and where does the data go?</summary><div class="qa-body">Git stores a small <code>.dvc</code> file with the data's md5 hash, size and path. The bytes go to the DVC cache and a remote (S3, GCS, Azure, SSH, a folder) via <code>dvc push</code>. Checking out an old commit and running <code>dvc checkout</code> restores the matching data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Data drift vs concept drift: define each with an example.</summary><div class="qa-body">Data drift: the input distribution P(X) changes, e.g. a loan model starts seeing many more young applicants. Concept drift: the mapping P(y|X) changes, e.g. after a recession the same income profile now defaults more often. Data drift can be detected without labels; concept drift needs labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a model's accuracy drop with no data drift at all?</summary><div class="qa-body">Yes: concept drift. Inputs look identical but the correct answer changed (fraudsters change tactics, user tastes shift). Also a silent bug: a feature pipeline change that keeps distributions similar but breaks meaning. That's why you monitor live metrics, not only input stats.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Labels for your churn model arrive 90 days late. How do you monitor it?</summary><div class="qa-body">Use proxies until labels land: input drift (PSI/KS on top features), prediction drift (share predicted to churn), data-quality checks (nulls, ranges), and early proxy outcomes (e.g. reduced logins). Backfill true metrics when labels arrive and compare.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What should a data scientist hand to an ML engineer?</summary><div class="qa-body">A registered model version with lineage: code commit, data version, params, metrics (overall and per slice), input/output signature, dependencies and an example input. Plus the training code as a runnable script, not only a notebook, so the pipeline can retrain it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't a retraining pipeline auto-deploy every new model?</summary><div class="qa-body">Fresh data can be corrupt, mislabelled or biased, and a worse model would ship silently. Gate it: compare to the current champion on a fixed holdout and key slices, check data validation, then promote, ideally through canary or shadow deployment with a rollback path.</div></details>
</main>`
});
