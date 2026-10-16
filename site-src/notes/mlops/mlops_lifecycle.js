// notes/mlops/mlops_lifecycle.js — The ML Lifecycle
Object.assign(TOPIC_CONTENT, {
  "mlops_lifecycle": `<main>
  <h1>The ML Lifecycle</h1>
  <p class="lead">Training a model in a notebook is only the first step. After that, the model has to run every day for real users, stay correct when the world changes, and be rebuilt when it gets worse. This page shows that full journey, called the ML lifecycle, and the habits that keep it safe: versioning, reproducibility, drift checks and retraining. MLOps is the name for these habits and tools.</p>

  <h2 id="ml-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">The ML Lifecycle</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li><b>Stages</b> — data + versioning → experiment → train → evaluate → deploy → monitor → retrain</li>
          <li><b>Evaluation gate</b> — new model must beat the baseline and the live model (champion) before deploy</li>
          <li><b>Train from scripts</b> — not notebooks, so a pipeline can rerun it</li>
          <li>💡 A model is a car, not a painting: needs fuel (data), servicing (retrain), dashboard (monitoring)</li>
          <li><b>~10% modelling</b> — the rest is data, serving, monitoring, upkeep</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">MLOps vs DevOps</div>
        <ul>
          <li><b>Three things change</b> — code (Git), data (DVC/snapshots), model (registry)</li>
          <li><b>Extra tests</b> — data validation, model quality, slices, fairness</li>
          <li><b>Silent failure</b> — models get quietly worse, no crash, no error</li>
          <li><b>CT</b> — continuous training added to CI/CD</li>
          <li>⚠ <b>Same code ≠ same model</b> — new data gives new weights; version all three</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reproducibility</div>
        <ul>
          <li><b>Meaning</b> — anyone can rebuild the exact same model later</li>
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
          <li><b>What</b> — Git for big data: small pointer in Git, real bytes in a remote</li>
          <li>💡 Cloakroom token: you keep the token, the bag stays in the cloakroom</li>
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
          <li><b>Data drift</b> — inputs look different, P(X) changes; e.g. younger users; PSI/KS, no labels needed</li>
          <li><b>Concept drift</b> — same input, new right answer, P(y|X) changes; needs labels</li>
          <li><b>Model drift / decay</b> — the symptom: live score falls</li>
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
  <p>Picture this. You work at a food delivery app. You build a model that guesses which customers will stop ordering next month (this is called <strong>churn</strong>). On your laptop it scores 92%. Your manager is happy.</p>
  <p>Now the real questions start. Who runs it every day on lakhs of new customers? What if the app changes and the data looks different? What if the model slowly becomes wrong and nobody notices? How do you replace it with a better one without breaking the app?</p>
  <p>Answering these questions is most of the work in an ML job. The model in the notebook is maybe 10% of it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>ML lifecycle</strong> is the full set of steps a model goes through: from collecting data, to training, to serving real users, to watching it, and back to training again. <strong>MLOps</strong> (ML + Operations) is the set of habits and tools that run this loop safely.</p>
  </div>
  <p>You will meet this in every ML job, and in almost every interview as: "How would you take this model to production?"</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A model is a car, not a painting. A painting is done once it is hung on the wall. A car needs fuel (fresh data), servicing (retraining) and a dashboard (monitoring) for as long as it is on the road.</p>
  </div>
  <p>The picture below shows the seven stages. Follow the arrows clockwise, then notice the dashed arrow on the left: it sends you back to the start.</p>
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
  <p>The same seven stages, walked through with the churn model. A few words first: an <strong>artifact</strong> is any saved file a step produces (a dataset, a model file). A <strong>baseline</strong> is a very simple model you must beat. The <strong>champion</strong> is the model that is live right now.</p>
  <table class="tbl">
    <tr><th>Stage</th><th>In the churn example</th><th>Output (the thing handed on)</th><th>Typical tools</th></tr>
    <tr><td>Data collection &amp; versioning</td><td>Pull last 6 months of orders; save a frozen copy called "orders_v3"</td><td>A dataset with an ID / hash</td><td>SQL, Airflow, DVC, Delta Lake</td></tr>
    <tr><td>Experimentation</td><td>Try "days since last order" as a feature; try trees vs logistic regression</td><td>Chosen features, model family, params</td><td>Notebooks, MLflow tracking</td></tr>
    <tr><td>Training</td><td><code>python train.py --data orders_v3</code></td><td>A model artifact from a <em>script</em>, not a notebook</td><td>Pipelines, GPUs, SageMaker jobs</td></tr>
    <tr><td>Evaluation</td><td>New model F1 0.81; baseline 0.60; live model 0.78 → passes</td><td>Metrics vs baseline + pass/fail gate</td><td>Holdout sets, slice metrics</td></tr>
    <tr><td>Deployment</td><td>The app's marketing system calls the model each night</td><td>Model behind an API or batch job</td><td>Registry, Docker, K8s, endpoints</td></tr>
    <tr><td>Monitoring</td><td>A dashboard shows scores, errors and input changes every day</td><td>Alerts on errors, latency, drift, metrics</td><td>Prometheus, Evidently, dashboards</td></tr>
    <tr><td>Retraining</td><td>Two months later the score drops to 0.70; train again on fresh data</td><td>New candidate model → back to evaluation</td><td>Scheduled or triggered pipelines</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Thinking the job ends at "deployment". A model that nobody watches will get worse without any error message. The monitoring and retraining half of the loop is what interviewers want to hear about.</p>
  </div>

  <h2 id="ml-devops"><span class="num">02</span>Why Not Just DevOps?</h2>
  <p>Start with normal software, like a calculator app. Once the code is correct, 2 + 2 gives 4 forever. The only way its behaviour changes is if someone changes the code.</p>
  <p><strong>DevOps</strong> is the set of habits for shipping such software: keep code in Git, test every change automatically, and release automatically. The automatic test-and-release line is called <strong>CI/CD</strong>. CI (continuous integration) means every change is tested by a machine. CD (continuous delivery) means changes that pass are shipped by a machine.</p>
  <p>ML breaks the calculator's promise. A model's behaviour comes from <em>data</em>, not only from code. Run the same training script on January data and on June data, and you get two different models. Nobody touched the code.</p>
  <p>So in ML, three things can change, and each needs its own version history:</p>
  <div class="cards">
    <div><b>Code changes</b><p>New feature logic, bug fix, library upgrade.</p><small>Versioned by: Git</small></div>
    <div><b>Data changes</b><p>New rows daily, schema tweaks, the world shifts.</p><small>Versioned by: DVC, Delta, snapshots</small></div>
    <div><b>Model changes</b><p>Retrained weights, new params, even with the same code.</p><small>Versioned by: model registry</small></div>
  </div>
  <p>A <strong>model registry</strong> is a shelf of saved models with version numbers, like v1, v2, v3. The <em>MLflow</em> note shows one.</p>
  <p>The second big difference is how things fail. A broken calculator crashes or shows an error: loud. A broken model still returns answers. They are just worse. Nothing turns red. This is called a <strong>silent failure</strong>.</p>
  <table class="tbl">
    <tr><th></th><th>DevOps (normal software)</th><th>MLOps</th></tr>
    <tr><td>Behaviour set by</td><td>Code only</td><td>Code + data + params</td></tr>
    <tr><td>Tests</td><td>Unit, integration</td><td>+ data validation, model quality, fairness</td></tr>
    <tr><td>Failure mode</td><td>Crashes, errors (loud)</td><td>Silently worse predictions (quiet)</td></tr>
    <tr><td>After release</td><td>Stays correct until code changes</td><td>Decays as the world drifts</td></tr>
    <tr><td>Pipelines</td><td>CI/CD</td><td>CI/CD + <strong>CT</strong> (continuous training)</td></tr>
  </table>
  <p><strong>CT (continuous training)</strong> means a pipeline retrains the model on new data automatically, the same way CI tests code automatically.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Same code, so same model" is false. Rerun the same script on next month's data and you get a different model. Version all three: code, data and model.</p>
  </div>

  <h2 id="ml-repro"><span class="num">03</span>Reproducibility</h2>
  <p>Think of making chai. If you don't write down how much sugar and how long you boiled it, tomorrow's chai tastes different, and you can't say why.</p>
  <p>Models are the same. Months later someone asks: "Why did the model reject this loan?" or "Your new model is 2% better. Is it really better, or just luck?" To answer, you must be able to rebuild the exact old model.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A model is <strong>reproducible</strong> if anyone can rebuild the exact same model later from the inputs you recorded. You need this for debugging, for audits (banks must explain decisions) and for fair comparisons.</p>
  </div>
  <p>The first hidden ingredient is randomness. Many steps use random numbers: shuffling the data, splitting train and test, starting the model's weights. A computer's "random" numbers come from a formula that begins at a starting number called the <strong>seed</strong>. Same seed, same sequence of "random" numbers. Here are dice rolls with and without a seed:</p>
  <div class="fx" data-lang="py">import random
print("roll 1:", [random.randint(1, 6) for _ in range(5)])
print("roll 2:", [random.randint(1, 6) for _ in range(5)])
random.seed(7); print("seed 7:", [random.randint(1, 6) for _ in range(5)])
random.seed(7); print("seed 7:", [random.randint(1, 6) for _ in range(5)])</div>
  <div class="fx" data-lang="text">roll 1: [5, 1, 3, 3, 1]
roll 2: [1, 5, 6, 6, 2]
seed 7: [3, 2, 4, 6, 1]
seed 7: [3, 2, 4, 6, 1]</div>
  <p>Without a seed, each run differs. With <code>seed(7)</code>, both runs give exactly the same rolls. Now the same idea with a real model. The code trains a random forest on a cancer dataset three times without a seed, then three times with <code>random_state=42</code> (scikit-learn's name for the seed):</p>
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
  <p>Without a seed, accuracy jumps 0.965 → 0.993 from pure luck. That "improvement" is noise, not a better model. With the seed, every run gives 0.965.</p>
  <p>Randomness is only one ingredient. The full recipe has five parts. Write all five down for every model:</p>
  <div class="flow"><span>Code (Git SHA)</span><span>Data (DVC hash)</span><span>Env (lockfile / Docker)</span><span>Params + seed</span><span>Same model</span></div>
  <ul>
    <li><strong>Git SHA</strong> — the ID of one exact Git commit, like <code>a3f9c1e</code>.</li>
    <li><strong>Hash</strong> — a fingerprint of a file. Change one byte, and the fingerprint changes completely.</li>
    <li><strong>Environment</strong> — the exact Python and library versions. A <strong>lockfile</strong> lists them; a <strong>Docker image</strong> packs them into one box.</li>
    <li><strong>Params</strong> — the settings you chose, like number of trees.</li>
  </ul>
  <table class="tbl">
    <tr><th>Source of randomness / drift</th><th>Pin it with</th></tr>
    <tr><td>Splits, init, sampling</td><td><code>random_state</code>, <code>np.random.seed</code>, <code>torch.manual_seed</code></td></tr>
    <tr><td>Library versions</td><td><code>requirements.txt</code> with exact pins, <code>uv.lock</code>/<code>poetry.lock</code>, Docker image</td></tr>
    <tr><td>Data</td><td>DVC hash, table snapshot, or dated partition</td></tr>
    <tr><td>GPU non-determinism</td><td><code>torch.use_deterministic_algorithms(True)</code> (slower)</td></tr>
  </table>
  <p>The last row: GPUs add numbers in parallel, in a slightly different order each time, so tiny differences creep in. PyTorch can force a fixed order, at some cost in speed.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pointing training at "the live table" makes it unreproducible: rerun next week and the rows differ. Train on a snapshot (a frozen copy) and log its ID.</p>
  </div>

  <h2 id="ml-dvc"><span class="num">04</span>Hands-on: DVC</h2>
  <p>Git is great at saving versions of code. But try putting a 50 GB CSV in Git. Every clone downloads all of it, every version is stored again, and GitHub refuses files above 100 MB. Git was built for small text files.</p>
  <p>Still, you need to know <em>which exact data</em> trained each model. The fix: let Git store a tiny note that names the data, and keep the heavy file somewhere cheap.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>DVC</strong> (Data Version Control) puts a tiny pointer file in Git and stores the real data in a <strong>remote</strong>: cloud storage like S3 or GCS, or just a shared folder.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The cloakroom at a wedding hall. You hand over your heavy bag and get a small token. You carry only the token. The token names exactly one bag, and handing it back gets you that bag. The <code>.dvc</code> file is the token; the remote is the cloakroom.</p>
  </div>
  <p>In the picture, the big file splits two ways: its fingerprint goes into Git, and its bytes go into storage.</p>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <defs><marker id="ml-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="140" height="50" rx="6" class="fs" stroke="currentColor"/><text x="80" y="62" text-anchor="middle">train.csv</text><text x="80" y="78" text-anchor="middle" class="tm" font-size="11">23 KB … 50 GB</text>
    <rect x="220" y="10" width="140" height="44" rx="6" class="fb sb"/><text x="290" y="30" text-anchor="middle">train.csv.dvc</text><text x="290" y="46" text-anchor="middle" class="tm" font-size="11">md5 + size → Git</text>
    <rect x="220" y="78" width="140" height="44" rx="6" class="ft st"/><text x="290" y="98" text-anchor="middle">cache / remote</text><text x="290" y="114" text-anchor="middle" class="tm" font-size="11">actual bytes → S3</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ml-ar2)"><line x1="150" y1="58" x2="218" y2="34"/><line x1="150" y1="72" x2="218" y2="98"/></g>
    <rect x="420" y="40" width="130" height="50" rx="6" class="fg sg"/><text x="485" y="62" text-anchor="middle">git commit</text><text x="485" y="78" text-anchor="middle" class="tm" font-size="11">code + data pointer</text>
    <line x1="360" y1="32" x2="418" y2="58" stroke="currentColor" marker-end="url(#ml-ar2)"/>
  </svg><figcaption>Git holds a 5-line pointer; the heavy file lives in the DVC remote. Checking out a commit restores the matching data.</figcaption></figure>
  <p>Here is a real session. Read it as a story in five steps:</p>
  <ol>
    <li><code>dvc add</code> — DVC fingerprints the file (an <strong>md5</strong> hash), writes the small <code>.dvc</code> token, and tells Git to ignore the big file.</li>
    <li><code>git commit</code> — Git saves the token as "data v1".</li>
    <li><code>dvc push</code> — the real bytes go to the remote.</li>
    <li>The data changes; <code>dvc status</code> notices the fingerprint no longer matches.</li>
    <li>Going back: take the old token from Git, then <code>dvc checkout</code> fetches the matching bytes.</li>
  </ol>
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
  <p>The last line proves it: the extra row added in v2 is gone. We are back to exactly the v1 data.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A Git commit now pins code <em>and</em> data together. "Which data trained model v7?" becomes a <code>git log</code> question.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Committing the <code>.dvc</code> token but forgetting <code>dvc push</code>. Your teammate pulls the token, runs <code>dvc pull</code>, and finds no bytes in the remote. Push data whenever you push code.</p>
  </div>

  <h2 id="ml-drift"><span class="num">05</span>Data, Concept, Model Drift</h2>
  <p>A kirana shop owner knows his regular customers well. He knows who buys milk daily and who buys rice monthly. Then a college opens nearby. Suddenly most customers are students. His guesses about what people will buy start going wrong. He did nothing wrong. The world around him changed.</p>
  <p>A model is in the same position. It learnt patterns from past data. When the present stops looking like the past, its answers get worse. This slow change is called <strong>drift</strong>.</p>
  <p>A tiny example. A loan model was trained on customers with these ages. This month's customers look like this:</p>
  <div class="fx" data-lang="py">train_ages = [34, 41, 29, 52, 38, 45, 31, 48]   # customers when the model was trained
live_ages  = [22, 19, 27, 24, 35, 21, 23, 30]   # customers this month
avg = lambda xs: sum(xs) / len(xs)
young = lambda xs: sum(a &lt; 25 for a in xs) / len(xs)
print("average age  train:", avg(train_ages), " live:", avg(live_ages))
print("share under 25 train:", young(train_ages), " live:", young(live_ages))</div>
  <div class="fx" data-lang="text">average age  train: 39.75  live: 25.125
share under 25 train: 0.0  live: 0.625</div>
  <p>The model never saw a customer under 25. Now 62.5% of customers are under 25. Its answers for them are guesses. Notice: we spotted this without knowing who actually repaid. We only compared the inputs.</p>
  <p>There are three kinds of drift. Two are causes, one is the result:</p>
  <ul>
    <li><strong>Data drift</strong> — the inputs look different. (The college students. The younger loan customers.)</li>
    <li><strong>Concept drift</strong> — the inputs look the same, but the right answer changed. During COVID, "buys flour in bulk" stopped meaning "runs a bakery"; everyone was baking at home.</li>
    <li><strong>Model drift</strong> (or decay) — the result: the model's live score falls.</li>
  </ul>
  <p>Books write these with probability notation. <strong>P(X)</strong> means "how the inputs are spread out" (for example, how many customers are in each age group). <strong>P(y|X)</strong> means "for a given input, what answer is right". Data drift changes P(X). Concept drift changes P(y|X).</p>
  <p>In the picture, look at the left: the red curve (live data) has moved right of the blue curve (training data). On the right, the dots have not moved, but the line that separates the two classes has tilted.</p>
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
  <p>Two more words for the table. A <strong>label</strong> is the true answer (did this customer really churn?). <strong>PSI</strong> (population stability index) and the <strong>KS test</strong> are two standard ways to put a number on "how much did this column's spread change?"</p>
  <table class="tbl">
    <tr><th></th><th>Data drift (covariate shift)</th><th>Concept drift</th><th>Model drift (decay)</th></tr>
    <tr><td>What changed</td><td>Input distribution P(X)</td><td>Relationship P(y|X)</td><td>The <em>outcome</em>: model performance drops</td></tr>
    <tr><td>Example</td><td>New market brings younger users</td><td>COVID: "buys flour in bulk" stops meaning "bakery"</td><td>Fraud recall falls from 0.90 to 0.70</td></tr>
    <tr><td>Detect with</td><td>PSI, KS test, feature stats vs training</td><td>Live metrics once labels arrive</td><td>Live metrics vs baseline</td></tr>
    <tr><td>Needs labels?</td><td>No</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>Fix</td><td>Retrain on recent data; maybe reweight</td><td>Retrain with new labels; rethink features</td><td>Find the cause (one of the left two, or a bug)</td></tr>
  </table>
  <p>Labels often arrive late. You learn whether a customer churned only after 90 days. Until then, watch <strong>proxies</strong>: signals you can see today, such as input drift, a sudden change in how many customers the model flags, or data-quality problems like empty columns.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Data drift does not always hurt; concept drift can happen with zero data drift. Alert on drift, but decide on live metrics. A broken upstream pipeline (nulls, unit change) looks like drift too; check that first.</p>
  </div>
  <p>Detection math (PSI, KS), dashboards and alerting are covered in depth in <em>ML System Design → Monitoring, Drift &amp; Retraining</em>.</p>

  <h2 id="ml-retrain"><span class="num">06</span>Retraining Triggers</h2>
  <p>You service a scooter in two ways. Either every 3,000 km, whatever happens, or right away when a warning light comes on. Models are retrained the same two ways.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>retraining trigger</strong> is the rule that decides when to train the model again.</p>
  </div>
  <div class="cards">
    <div><b>Scheduled</b><p>Every night / week / month.</p><small>Simple, predictable; may waste compute or react late</small></div>
    <div><b>Performance drop</b><p>Live metric falls below a threshold.</p><small>Best signal; needs labels (often delayed)</small></div>
    <div><b>Drift alert</b><p>PSI or KS on key features crosses a limit.</p><small>Early, label-free; noisy</small></div>
    <div><b>New data volume</b><p>N new labelled rows collected.</p><small>Good when labels arrive in bursts</small></div>
    <div><b>Event</b><p>New product, market or policy launch.</p><small>Manual, known in advance</small></div>
  </div>
  <p>Most teams combine them: a schedule as the floor (say, monthly) plus triggers for urgent drops. A worked example with the churn model:</p>
  <ol>
    <li>At launch, live F1 is 0.82. The team sets an alarm at 0.78.</li>
    <li>In week 6, F1 falls to 0.76. The performance trigger fires.</li>
    <li>The pipeline retrains on the latest frozen snapshot. The new candidate scores 0.81 on the test set.</li>
    <li>The live model (champion) scores 0.76 on the same test set. The candidate wins.</li>
    <li>The candidate goes to a small share of users first (a <strong>canary</strong>, see <em>Deployment Strategies</em>), then to everyone.</li>
  </ol>
  <div class="flow"><span>Trigger fires</span><span>Pipeline retrains on fresh snapshot</span><span>Eval vs current champion</span><span>Better? → register + deploy</span><span>Worse? → keep old, alert human</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never auto-deploy a retrained model without a gate. If the new data was corrupt, automation ships a broken model at 3 a.m.</p>
  </div>

  <h2 id="ml-mature"><span class="num">07</span>MLOps Maturity Levels</h2>
  <p>Think of making rotis. Level 0: one person rolls each roti by hand. Level 1: a roti machine makes them every day without help. Level 2: even changes to the machine are tested and installed automatically. Teams move through the same stages with their models.</p>
  <p>This scale comes from Google and is widely quoted. Most companies sit at level 0 or 1.</p>
  <table class="tbl">
    <tr><th>Level</th><th>What it looks like</th><th>Release speed</th><th>Main risk</th></tr>
    <tr><td><strong>0 · Manual</strong></td><td>Notebook → pickle → engineer rewrites it for prod</td><td>Months, a few times a year</td><td>Training/serving skew, no monitoring</td></tr>
    <tr><td><strong>1 · Pipeline automation</strong></td><td>Training is an automated pipeline; continuous training (CT) on new data; registry + monitoring</td><td>Retrains daily/weekly</td><td>Pipeline code itself changed by hand</td></tr>
    <tr><td><strong>2 · CI/CD automation</strong></td><td>Pipeline code is tested and deployed by CI/CD too; many models, many teams</td><td>Hours to days</td><td>Platform complexity, cost</td></tr>
  </table>
  <p><strong>Training/serving skew</strong> means the model sees features made one way in training and another way when live. Example: the notebook computed "average order value" in rupees, but the engineer's rewrite used paise. Same model, wrong inputs.</p>
  <div class="callout intu"><span class="label">Interview tip</span>
    <p>Level 0 → 1 is the big win: the same code trains in dev and prod, so "it worked in my notebook" stops being a problem.</p>
  </div>

  <h2 id="ml-roles"><span class="num">08</span>Roles &amp; Handoffs</h2>
  <p>A restaurant has a supplier who brings clean vegetables, a chef who invents the recipe, a kitchen manager who cooks it 500 times a day, a team that keeps the stoves working, and an owner who decides the menu. An ML team splits work the same way.</p>
  <div class="flow"><span>Data engineer</span><span>Data scientist</span><span>ML engineer</span><span>Platform / DevOps</span><span>Product &amp; business</span></div>
  <table class="tbl">
    <tr><th>Role</th><th>Owns</th><th>Hands off</th></tr>
    <tr><td>Data engineer</td><td>Ingestion, pipelines, warehouse, data quality</td><td>Clean, versioned tables / features</td></tr>
    <tr><td>Data scientist</td><td>Problem framing, features, model choice, offline eval</td><td>Tracked experiment + candidate model in registry</td></tr>
    <tr><td>ML engineer</td><td>Training pipelines, serving, monitoring, retraining</td><td>A live, monitored endpoint or batch job</td></tr>
    <tr><td>Platform / DevOps</td><td>Clusters, CI/CD, infra, security, cost</td><td>Self-serve tools (K8s, MLflow, feature store)</td></tr>
    <tr><td>Product / business</td><td>Success metric, guardrails, A/B decisions</td><td>Go / no-go; new requirements</td></tr>
  </table>
  <p>Each arrow in the flow is a <strong>handoff</strong>: one person passes work to the next. Bad handoffs cause most production problems.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The classic failure is the notebook "thrown over the wall". The fix is a shared contract: a registry entry with code SHA, data version, signature (the expected input columns and types) and metrics, not a <code>.pkl</code> in Slack.</p>
  </div>

  <h2 id="ml-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one or two lines, what is the ML lifecycle?</summary><div class="qa-body">The repeating loop a model lives in: data → experiment → train → evaluate → deploy → monitor → retrain, and back to data. It never ends, because the world keeps changing and the model must be checked and refreshed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does setting a random seed do, and why does it matter?</summary><div class="qa-body">It fixes the starting point of the random number generator, so splits, shuffles and weight starts come out the same every run. Without it, two runs of the same code can differ (0.965 vs 0.993 in our demo), and you can't tell a real improvement from luck.</div></details>
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
