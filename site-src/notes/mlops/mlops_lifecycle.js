// notes/mlops/mlops_lifecycle.js — The ML Lifecycle
Object.assign(TOPIC_CONTENT, {
  "mlops_lifecycle": `<main>
  <h1>The ML Lifecycle</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>The ML Lifecycle</span></div>
  <p class="lead">Training a model in a notebook is only the first step. After that, the model has to run every day for real users, stay correct when the world changes, and be rebuilt when it gets worse, by people who were not there when it was first trained. This note follows one model through that whole journey, called the <strong>ML lifecycle</strong>, and builds the habits that keep it safe: versioning code, data and settings, a clean project layout, drift checks and retraining. MLOps is the name for these habits and tools. The running example for the whole MLOps track: <strong>Biteful</strong>, a food-delivery app, predicts how many minutes an order will take from the distance, the number of items, whether it is raining and which restaurant cooks it. Every command and script below was really run (Python 3.13, scikit-learn 1.9, DVC 3.67, Hydra 1.3, Pydantic 2.13, pre-commit 4.7) and its output pasted.</p>

  <h2 id="ml-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 210" width="660">
<defs><marker id="ml-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="30" text-anchor="middle" font-size="12">ML track: Pipelines, Tuning</text><text x="110" y="46" text-anchor="middle" class="tm" font-size="10">a good model in a notebook</text>
<rect x="230" y="10" width="200" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="30" text-anchor="middle" font-size="12">Software Eng: Git, Linux, Docker</text><text x="330" y="46" text-anchor="middle" class="tm" font-size="10">tools to version and ship code</text>
<rect x="450" y="10" width="200" height="46" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="550" y="30" text-anchor="middle" font-size="12">APIs: FastAPI, Production</text><text x="550" y="46" text-anchor="middle" class="tm" font-size="10">how a server answers requests</text>
<line x1="110" y1="56" x2="230" y2="88" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ml-a0)"/><line x1="330" y1="56" x2="330" y2="86" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ml-a0)"/><line x1="550" y1="56" x2="430" y2="88" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ml-a0)"/>
<rect x="200" y="88" width="260" height="40" rx="7" class="fg sg" stroke-width="2.5"/><text x="330" y="106" text-anchor="middle" font-size="12" font-weight="700">1 · The ML Lifecycle</text><text x="330" y="121" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · notebook → versioned project</text>
<rect x="30" y="150" width="190" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="125" y="168" text-anchor="middle" font-size="12">2 · MLflow &amp; Tracking</text><text x="125" y="183" text-anchor="middle" class="tm" font-size="10">runs, Optuna, registry</text>
<rect x="240" y="150" width="190" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="335" y="168" text-anchor="middle" font-size="12">3 · Shipping Models (map)</text><text x="335" y="183" text-anchor="middle" class="tm" font-size="10">CI/CD, serving, K8s, cloud</text>
<rect x="450" y="150" width="190" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="545" y="168" text-anchor="middle" font-size="12">Monitoring &amp; Retraining</text><text x="545" y="183" text-anchor="middle" class="tm" font-size="10">drift in depth (System Design)</text>
<line x1="270" y1="128" x2="150" y2="148" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ml-a0)"/><line x1="330" y1="128" x2="333" y2="148" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ml-a0)"/><line x1="400" y1="128" x2="520" y2="148" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ml-a0)"/>
</svg><figcaption>The first note of the MLOps track: it turns a notebook model into a project anyone can rebuild, and names every later step.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a> and <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a></b><span>Those notes end with a good model: a random forest with tuned settings, a clean pipeline, an honest test score. Left open: that model lives in one person's notebook. Nobody else can rebuild it, nobody knows which data it saw, and nothing tells us when it starts to go wrong. <a class="xref" data-note="se_git">Git</a> and <a class="xref" data-note="se_docker">Docker</a> solved this for ordinary code; ML has extra moving parts (data and trained weights) they do not cover.</span></li>
    <li><b>This note adds: the lifecycle and its versioning habits</b><span>The loop every model lives in, what breaks between research and production (hidden technical debt), versioning code (Git), data (DVC) and settings (Hydra, Pydantic), a project layout with pre-commit checks, why live models rot (drift), when to retrain, and how mature a team's setup is.</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a> (a receipt for every training run, a registry for the winner), then <a class="xref" data-note="mlops_deploy">Shipping Models: the map</a> (CI/CD, serving, Kubernetes, cloud). Drift detection in depth lives in <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>; scheduled pipelines in <a class="xref" data-note="de_etl">ETL &amp; Orchestration</a>.</span></li>
  </ol>

  <h2 id="ml-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Running example: Biteful's delivery-time model. On 2,000 past orders the forest's average error (MAE) is <strong>2.44 minutes</strong>, against 8.45 for "always guess the average"; on six Monday-lunch orders we can check by hand, 1.33 against 12.0.</p>
  <ol class="story">
    <li><b>The notebook problem</b><span>Q: the model scored MAE 2.44 on my laptop, so why can nobody rebuild or ship it? → Two weeks later a teammate reran "the same notebook" and got 2.60, 2.45, 2.49, then 2.80 on a new export. No seed, no saved data, no record of settings. We need a map of everything a model goes through after the notebook.</span></li>
    <li><b>The ML lifecycle</b><span>Q: what are the steps between "trained once" and "useful every day"? → A loop: data → experiment → train → evaluate → deploy → monitor → retrain. But the loop alone doesn't say why ML is harder to run than normal software…</span></li>
    <li><b>Hidden technical debt</b><span>Q: what exactly breaks between research and production? → Behaviour comes from code + data + settings; failures are silent (distance sent in metres gave 61.6 minutes instead of 53.2, with no error). The model is a small box; the glue around it is the risk. So every input to the model must be pinned down, starting with code…</span></li>
    <li><b>Versioning code (Git)</b><span>Q: which code made this model? → Commits, branches for experiments, the short SHA as the code's ID. But Git refuses big data files, and the data changes every week…</span></li>
    <li><b>Versioning data (DVC)</b><span>Q: which data made this model, and can we get it back? → A tiny pointer file in Git, the bytes in a remote; <code>dvc.yaml</code> pipelines rerun only what changed. But the settings (trees, depth, seed) are still hard-coded inside <code>train.py</code>…</span></li>
    <li><b>Versioning config (Hydra, Pydantic)</b><span>Q: how do we change and record settings without editing code, and catch typos? → A YAML config, command-line overrides, sweeps, and a typed schema that rejects <code>max_dept</code> or <code>-3</code>. Now the project has many files and many people: how do we keep it tidy and stop mistakes before they are committed?</span></li>
    <li><b>Project layout &amp; pre-commit</b><span>Q: where does each thing live, and who checks commits? → A standard layout and hooks that blocked a 3 MB model file and removed an unused import. The project is rebuildable. But once the model is live, the world changes under it…</span></li>
    <li><b>Drift</b><span>Q: why does a correct model become wrong? → Inputs change (rainy share 0.26 → 0.70; live MAE 4.87) or the right answer changes (a traffic plan: 2.44 → 5.87). When should we act?</span></li>
    <li><b>Retraining triggers</b><span>Q: when do we train again? → On a schedule, on a metric alarm (week 5: MAE 3.8 &gt; 3.5), on drift, on events; always through a gate. How much of this loop is automatic?</span></li>
    <li><b>Maturity levels</b><span>Q: how automated is our loop? → Level 0 manual, level 1 automated training pipeline, level 2 the pipeline itself tested and shipped by CI/CD. Who does each part?</span></li>
    <li><b>Roles &amp; handoffs</b><span>Q: who owns which step, and what do they hand over? → Data engineer → data scientist → ML engineer → platform, with a registry entry as the contract. That registry is the next note.</span></li>
  </ol>

  <h2 id="ml-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">The ML Lifecycle</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The problem</div>
        <ul>
          <li><b>Notebook model</b> — MAE 2.44 min vs 8.45 baseline; R² 0.913</li>
          <li><b>Rerun</b> — 2.60 / 2.45 / 2.49 without a seed; 2.80 on a new export</li>
          <li><b>Lost</b> — data version, settings, seed, library versions, the order of cells</li>
          <li>💡 A model is a car, not a painting: fuel (data), servicing (retrain), dashboard (monitoring)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li><b>Stages</b> — data → experiment → train → evaluate → deploy → monitor → retrain</li>
          <li><b>Gate</b> — candidate must beat baseline and the live champion</li>
          <li><b>~10% modelling</b> — the rest is data, serving, monitoring, upkeep</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hidden debt</div>
        <ul>
          <li><b>Three things change</b> — code (Git), data (DVC), model (registry)</li>
          <li><b>Silent failure</b> — metres instead of km: 61.6 vs 53.2, no error</li>
          <li><b>CACE</b> — changing anything changes everything</li>
          <li><b>Glue, pipeline jungles, config debt, feedback loops</b></li>
          <li><b>MLOps vs DevOps vs DataOps</b> — model vs code vs data pipelines</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Versioning</div>
        <ul>
          <li><b>Git</b> — commits, experiment branches, short SHA = code ID; trunk-based vs Gitflow</li>
          <li><b>DVC</b> — <code>dvc add</code> → <code>.dvc</code> pointer (md5, size) in Git; <code>push/pull</code>; <code>checkout</code> = time travel</li>
          <li><b>dvc.yaml</b> — stages with deps/outs; <code>dvc repro</code> reruns only what changed; run-cache</li>
          <li><b>Hydra</b> — <code>config.yaml</code>, overrides <code>model.max_depth=4</code>, <code>--multirun</code></li>
          <li><b>Pydantic</b> — typed schema; <code>extra="forbid"</code> catches typos</li>
          <li>⚠ Same code ≠ same model</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Project hygiene</div>
        <ul>
          <li><b>Layout</b> — <code>src/</code>, <code>configs/</code>, <code>data/</code> (DVC), <code>tests/</code>, <code>dvc.yaml</code></li>
          <li><b>pre-commit</b> — large-file block (3127 KB &gt; 500), YAML check, ruff --fix</li>
          <li><b>Recipe</b> — Git SHA + data hash + config + env + seed = same model</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">After launch</div>
        <ul>
          <li><b>Data drift</b> — P(X) moves: rainy share 0.26 → 0.70, live MAE 4.87</li>
          <li><b>Concept drift</b> — P(y|X) moves: +6 min traffic plan, 2.44 → 5.87</li>
          <li><b>Triggers</b> — schedule, metric (wk5 3.8 &gt; 3.5), drift, volume, events</li>
          <li>⚠ Never auto-deploy without a gate</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Maturity &amp; roles</div>
        <ul>
          <li><b>Level 0</b> — manual notebooks; <b>1</b> — automated training (CT) + registry + monitoring; <b>2</b> — CI/CD for the pipeline</li>
          <li><b>Roles</b> — data eng → DS → MLE → platform → product</li>
          <li>⚠ A <code>.pkl</code> in Slack is not a handoff</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ml-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Notebook Problem</span><span class="rm-sub">Worked on my laptop, nobody can rebuild it</span></div></div>
      <div class="rm-item rm-done" data-target="ml-loop"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Lifecycle Loop</span><span class="rm-sub">Seven stages, never "done"</span></div></div>
      <div class="rm-item rm-done" data-target="ml-debt"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Hidden Technical Debt</span><span class="rm-sub">What breaks between research and production</span></div></div>
      <div class="rm-item rm-done" data-target="ml-git"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Versioning Code: Git</span><span class="rm-sub">Commits, branches, SHAs</span></div></div>
      <div class="rm-item rm-done" data-target="ml-dvc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Versioning Data: DVC</span><span class="rm-sub">Pointers, remotes, pipelines</span></div></div>
      <div class="rm-item rm-done" data-target="ml-config"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Versioning Config</span><span class="rm-sub">Hydra and Pydantic</span></div></div>
      <div class="rm-item rm-done" data-target="ml-layout"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Project Layout &amp; Pre-commit</span><span class="rm-sub">Tidy repo, checked commits</span></div></div>
      <div class="rm-item rm-done" data-target="ml-drift"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Drift</span><span class="rm-sub">Why live models rot</span></div></div>
      <div class="rm-item rm-done" data-target="ml-retrain"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Retraining Triggers</span><span class="rm-sub">When to train again</span></div></div>
      <div class="rm-item rm-done" data-target="ml-mature"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Maturity Levels &amp; Tools</span><span class="rm-sub">Manual → fully automated</span></div></div>
      <div class="rm-item rm-done" data-target="ml-roles"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Roles &amp; Handoffs</span><span class="rm-sub">Who owns what</span></div></div>
      <div class="rm-item rm-done" data-target="ml-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="ml-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The usual ways it goes wrong</span></div></div>
      <div class="rm-item rm-done" data-target="ml-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="ml-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ml-problem"><span class="num">01</span>The Notebook Problem: "It Worked on My Laptop"</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha, a data scientist at Biteful, trained a model in a Jupyter notebook that predicts delivery minutes. It scored well. Two weeks later, her manager wants it inside the app, and her teammate Ravi wants to improve it. Why can neither of them simply "use the notebook"?</p>
  </div>
  <p>Start with the data. Biteful's warehouse exports past orders: for each order, the trip distance in km, the number of items, whether it was raining (1 or 0), the restaurant, and how many minutes delivery really took. The script below is a stand-in for that export: it generates 2,000 realistic orders from a hidden rule (8 minutes of fixed overhead, about 3.2 minutes per km, 1.4 per item, extra time in rain, plus each kitchen's cooking time and some random noise), so every number in this track can be rerun exactly.</p>
  <div class="fx" data-lang="py"># make_orders.py — a stand-in for Biteful's warehouse export (2,000 past orders)
import numpy as np, pandas as pd

rng = np.random.default_rng(7)
n = 2000
prep = {"Chai Stop": 3, "Dosa Corner": 6, "Pizza Point": 10, "Biryani House": 14}   # kitchen minutes
df = pd.DataFrame({
    "distance_km": rng.uniform(0.5, 8.0, n).round(1),
    "items": rng.integers(1, 7, n),
    "rain": (rng.random(n) &lt; 0.25).astype(int),
    "restaurant": rng.choice(list(prep), n),
})
noise = rng.normal(0, 3, n)
df["minutes"] = (8 + 3.2 * df.distance_km + 1.4 * df["items"] + 7 * df.rain
                 + 0.8 * df.rain * df.distance_km + df.restaurant.map(prep) + noise).round(1)
import os; os.makedirs("data", exist_ok=True)
df.to_csv("data/orders.csv", index=False)
print(df.shape)
print(df.head(3).to_string())
print("mean minutes:", round(df.minutes.mean(), 1))</div>
  <div class="fx" data-lang="text">(2000, 5)
   distance_km  items  rain   restaurant  minutes
0          5.2      4     1  Pizza Point     56.4
1          7.2      2     0  Pizza Point     44.1
2          6.3      6     0    Chai Stop     38.6
mean minutes: 37.3</div>
  <p>Asha's notebook then does the standard steps from the ML track: one-hot encode the restaurant (<code>pd.get_dummies</code>), split 75/25, compare against a <strong>baseline</strong> (a model so simple that anything useful must beat it: "always guess the average"), train a random forest, and measure <strong>MAE</strong> (mean absolute error: the average number of minutes the guess is off by) and R² (the share of variation explained; 1 is perfect).</p>
  <div class="fx" data-lang="py"># the "notebook" model: train once, look at the score
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

df = pd.read_csv("data/orders.csv")
X = pd.get_dummies(df.drop(columns="minutes"), columns=["restaurant"])
y = df["minutes"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

baseline = [y_tr.mean()] * len(y_te)                     # always guess the average
model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42).fit(X_tr, y_tr)
pred = model.predict(X_te)
print("baseline MAE:", round(mean_absolute_error(y_te, baseline), 2), "min")
print("forest   MAE:", round(mean_absolute_error(y_te, pred), 2), "min   R2:", round(r2_score(y_te, pred), 3))</div>
  <div class="fx" data-lang="text">baseline MAE: 8.45 min
forest   MAE: 2.44 min   R2: 0.913</div>
  <p>The forest is off by 2.44 minutes on average; guessing the average is off by 8.45. R² 0.913 means it explains about 91% of the variation. A good model. To see exactly what those numbers mean, take six orders from Monday lunch, small enough to check by hand.</p>
  <div class="fx" data-lang="py"># Monday lunch: six real orders, the notebook model's guesses
monday = pd.DataFrame({
    "distance_km": [2.0, 5.5, 1.2, 3.8, 6.0, 4.5],
    "items":       [2, 3, 1, 4, 2, 5],
    "rain":        [0, 1, 0, 0, 1, 0],
    "restaurant":  ["Dosa Corner", "Biryani House", "Chai Stop", "Pizza Point", "Dosa Corner", "Biryani House"],
    "minutes":     [23, 55, 14, 36, 47, 43]})
Xm = pd.get_dummies(monday.drop(columns="minutes"), columns=["restaurant"]).reindex(columns=X.columns, fill_value=0)
monday["model"] = model.predict(Xm).round(1)
print(monday.to_string(index=False))
print("MAE always-36.3:", round((monday.minutes - monday.minutes.mean()).abs().mean(), 2),
      "  MAE model:", round((monday.minutes - monday.model).abs().mean(), 2))</div>
  <div class="fx" data-lang="text"> distance_km  items  rain    restaurant  minutes  model
         2.0      2     0   Dosa Corner       23   22.0
         5.5      3     1 Biryani House       55   53.2
         1.2      1     0     Chai Stop       14   17.0
         3.8      4     0   Pizza Point       36   36.1
         6.0      2     1   Dosa Corner       47   48.9
         4.5      5     0 Biryani House       43   43.2
MAE always-36.3: 12.0   MAE model: 1.33</div>
  <table class="tbl"><caption>By hand: the six Monday orders (mean = (23+55+14+36+47+43)/6 = 218/6 = 36.3)</caption>
    <tr><th>Order</th><th>Real minutes</th><th>Error of "always 36.3"</th><th>Model guess</th><th>Error of model</th></tr>
    <tr><td>1 · 2.0 km, Dosa Corner</td><td>23</td><td>13.3</td><td>22.0</td><td>1.0</td></tr>
    <tr><td>2 · 5.5 km, rain, Biryani House</td><td>55</td><td>18.7</td><td>53.2</td><td>1.8</td></tr>
    <tr><td>3 · 1.2 km, Chai Stop</td><td>14</td><td>22.3</td><td>17.0</td><td>3.0</td></tr>
    <tr><td>4 · 3.8 km, Pizza Point</td><td>36</td><td>0.3</td><td>36.1</td><td>0.1</td></tr>
    <tr><td>5 · 6.0 km, rain, Dosa Corner</td><td>47</td><td>10.7</td><td>48.9</td><td>1.9</td></tr>
    <tr><td>6 · 4.5 km, Biryani House</td><td>43</td><td>6.7</td><td>43.2</td><td>0.2</td></tr>
    <tr><td><b>Sum ÷ 6 = MAE</b></td><td></td><td><b>72.0 ÷ 6 = 12.0</b></td><td></td><td><b>8.0 ÷ 6 = 1.33</b></td></tr>
  </table>
  <p>These six orders follow us through the whole MLOps track: they become test cases in CI, requests to the API server, and load on the Kubernetes cluster. Now the problem. Two weeks later Ravi reruns "the same notebook". Asha never fixed the random seed, and the warehouse export has grown to 2,200 rows (two of them broken by an app bug and a GPS glitch).</p>
  <div class="fx" data-lang="py"># two weeks later a teammate re-runs "the notebook": no seed, and a fresh export
def notebook_run(data, seed):
    Xn = pd.get_dummies(data.drop(columns="minutes"), columns=["restaurant"])
    a, b, c, d = train_test_split(Xn, data["minutes"], test_size=0.25, random_state=seed)
    m = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=seed).fit(a, c)
    return round(mean_absolute_error(d, m.predict(b)), 2)

print("original, seed 42, 2000 rows:", notebook_run(df, 42))
print("rerun, no seed, same file   :", [notebook_run(df, None) for _ in range(3)])
week2 = pd.read_csv("exports/orders_2200.csv")
print("rerun, no seed, new export  :", notebook_run(week2, None))</div>
  <div class="fx" data-lang="text">original, seed 42, 2000 rows: 2.44
rerun, no seed, same file   : [2.6, 2.45, 2.49]
rerun, no seed, new export  : 2.8</div>
  <p>Same code, four different answers: 2.44, then 2.60, 2.45, 2.49, then 2.80. Which one is "the model"? Nobody can say, because the notebook does not record what made the number. Here is everything that was lost:</p>
  <table class="tbl">
    <tr><th>Lost ingredient</th><th>What happened at Biteful</th><th>The fix (this note or the next)</th></tr>
    <tr><td>Exact data</td><td>Export grew from 2,000 to 2,200 rows, incl. 2 broken ones</td><td>Data versioning with DVC (05)</td></tr>
    <tr><td>Randomness</td><td>No <code>random_state</code>: each rerun splits and grows trees differently</td><td>Seeds (06, and MLflow note)</td></tr>
    <tr><td>Settings</td><td>Depth 8? 12? Ravi had to read cell 14 to find out</td><td>Config files (06)</td></tr>
    <tr><td>Code order</td><td>Cells run out of order; a deleted cell still affects memory</td><td>Scripts in Git (04), layout (07)</td></tr>
    <tr><td>Environment</td><td>Asha has scikit-learn 1.9, the server 1.5</td><td>Lockfiles and Docker images (06, CI/CD note)</td></tr>
    <tr><td>Which run won</td><td>"model_final_v3.pkl" on a laptop</td><td>Experiment tracking and a registry (MLflow note)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A model is <strong>reproducible</strong> when anyone can rebuild the exact same model later from recorded inputs: the code version, the data version, the settings (including the random seed) and the software environment. A <strong>baseline</strong> is the simplest reasonable predictor (here: always the training average) that a real model must beat to be worth shipping.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating the notebook's score as a fact. 2.44 is the score of one particular split with one particular seed on one particular file. Without those three recorded, it is an anecdote, and a "2% improvement" next week may be pure luck (2.44 vs 2.49 above came from the seed alone).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Lifecycle Loop.</b> We know what got lost. But what are all the steps a model must go through between "trained once" and "useful every day", so we know what to keep?</div>

  <h2 id="ml-loop"><span class="num">02</span>The Lifecycle Loop</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful wants the delivery-time model in the app. Who runs it every day on thousands of new orders? What if the city changes and the data looks different? What if it slowly becomes wrong and nobody notices? How do we replace it with a better one without breaking the app?</p>
  </div>
  <p>Answering these questions is most of the work in an ML job. The model in the notebook is maybe 10% of it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>ML lifecycle</strong> is the full set of steps a model goes through: from collecting data, to training, to serving real users, to watching it, and back to training again. <strong>MLOps</strong> (ML + Operations) is the set of habits and tools that run this loop safely and repeatably.</p>
  </div>
  <p>You will meet this in every ML job, and in almost every interview as: "How would you take this model to production?"</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A model is a car, not a painting. A painting is done once it is hung on the wall. A car needs fuel (fresh data), servicing (retraining) and a dashboard (monitoring) for as long as it is on the road.</p>
  </div>
  <p>The picture shows the seven stages. Follow the arrows clockwise, then notice the dashed arrow on the left: it sends you back to the start.</p>
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
  <p>The same seven stages, walked through with the Biteful model. A few words first: an <strong>artifact</strong> is any saved file a step produces (a dataset, a model file). The <strong>champion</strong> is the model that is live right now; a <strong>candidate</strong> is a new model hoping to replace it.</p>
  <table class="tbl">
    <tr><th>Stage</th><th>At Biteful</th><th>Output (the thing handed on)</th><th>Typical tools</th></tr>
    <tr><td>Data collection &amp; versioning</td><td>Export past orders; freeze the 2,200-row file as "data v2"</td><td>A dataset with an ID / hash</td><td>SQL, Airflow, DVC, Delta Lake</td></tr>
    <tr><td>Experimentation</td><td>Try a rain × distance feature; forest vs boosting; depth 4, 8, 12</td><td>Chosen features, model family, settings</td><td>Notebooks, MLflow, Optuna</td></tr>
    <tr><td>Training</td><td><code>python train.py</code> from a script, not a notebook</td><td>A model artifact plus its metrics</td><td>DVC pipelines, GPUs, SageMaker jobs</td></tr>
    <tr><td>Evaluation</td><td>Candidate MAE 2.44; baseline 8.45; champion 2.65 → passes</td><td>Metrics vs baseline + pass/fail gate</td><td>Holdout sets, slice metrics</td></tr>
    <tr><td>Deployment</td><td>The app calls an API with the order and shows "ETA 53 min"</td><td>Model behind an API or batch job</td><td>Registry, Docker, Kubernetes, endpoints</td></tr>
    <tr><td>Monitoring</td><td>A dashboard compares predicted vs real minutes every day</td><td>Alerts on errors, latency, drift, MAE</td><td>Prometheus, Evidently, dashboards</td></tr>
    <tr><td>Retraining</td><td>In monsoon week 5 the live MAE reaches 3.8; train again</td><td>New candidate → back to evaluation</td><td>Scheduled or triggered pipelines</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Thinking the job ends at "deployment". A model that nobody watches gets worse without any error message. The monitoring and retraining half of the loop is what interviewers want to hear about.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Hidden Technical Debt.</b> The loop looks like any software release cycle. Why can't we run it with the normal software habits (Git, tests, CI/CD) and be done?</div>

  <h2 id="ml-debt"><span class="num">03</span>Hidden Technical Debt: What Breaks Between Research and Production</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A calculator app, once correct, gives 2 + 2 = 4 forever. Why does a correct ML model not stay correct, and why do ML systems break in ways ordinary software does not?</p>
  </div>
  <p><strong>DevOps</strong> is the set of habits for shipping ordinary software: keep code in Git, test every change automatically, release automatically. The automatic test-and-release line is called <strong>CI/CD</strong> (continuous integration: a machine tests every change; continuous delivery: a machine ships changes that pass). For a calculator, behaviour changes only when someone changes the code.</p>
  <p>ML breaks that promise. A model's behaviour comes from <em>data</em> and <em>settings</em> as well as code. Run the same training script on January orders and on June orders and you get two different models. Nobody touched the code. So in ML, three things change, and each needs its own version history:</p>
  <div class="cards">
    <div><b>Code changes</b><p>New feature logic, bug fix, library upgrade.</p><small>Versioned by: Git (04)</small></div>
    <div><b>Data changes</b><p>New orders daily, schema tweaks, the city grows.</p><small>Versioned by: DVC, Delta, snapshots (05)</small></div>
    <div><b>Model changes</b><p>Retrained weights, new settings, even with the same code.</p><small>Versioned by: config (06) + model registry (MLflow note)</small></div>
  </div>
  <p>The second big difference is how things fail. A broken calculator crashes: loud. A broken model still returns answers, just worse ones. Here is a real Biteful-style failure. Months later, another engineer writes the app code that calls the model, and the app measures distance in <em>metres</em>. Take Monday order 2 (5.5 km):</p>
  <div class="fx" data-lang="py"># serving code written later by another engineer: the app sends distance in METRES
order = Xm.iloc[[1]].copy()                     # Monday order 2: 5.5 km, 3 items, rain, Biryani House
print("sent as 5.5 km  -&gt;", model.predict(order).round(1))
order["distance_km"] = 5500                     # same trip, wrong unit
print("sent as 5500 m  -&gt;", model.predict(order).round(1), " (no error, no warning)")</div>
  <div class="fx" data-lang="text">sent as 5.5 km  -&gt; [53.2]
sent as 5500 m  -&gt; [61.6]  (no error, no warning)</div>
  <p>The model was trained on kilometres between 0.5 and 8. It has never seen 5,500. A random forest cannot extrapolate, so it answers with the value of its "farthest" leaves: 61.6 minutes instead of 53.2. No crash, no warning, no red light. Every far-looking order gets roughly the same answer, and the customer sees wrong ETAs for weeks. This is a <strong>silent failure</strong>, and this particular kind, where features are built one way in training and another way in serving, is called <strong>training/serving skew</strong>.</p>
  <h3>The "hidden technical debt" picture</h3>
  <p>A well-known Google paper (Sculley et al., 2015, "Hidden Technical Debt in Machine Learning Systems") drew a real ML system as a tiny box labelled "ML code" surrounded by much bigger boxes. <strong>Technical debt</strong> means shortcuts that are cheap today and expensive later, like a loan. ML adds its own kinds of debt on top of normal software debt.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <rect x="10" y="10" width="580" height="170" rx="8" fill="none" stroke="currentColor" stroke-opacity="0.35"/>
    <rect x="25" y="25" width="150" height="60" rx="6" class="fb sb"/><text x="100" y="52" text-anchor="middle" font-size="12">Data collection</text><text x="100" y="68" text-anchor="middle" class="tm" font-size="10">exports, joins, cleaning</text>
    <rect x="185" y="25" width="120" height="60" rx="6" class="fb sb"/><text x="245" y="52" text-anchor="middle" font-size="12">Data validation</text><text x="245" y="68" text-anchor="middle" class="tm" font-size="10">-1 min, 120 km</text>
    <rect x="315" y="25" width="130" height="60" rx="6" class="fb sb"/><text x="380" y="52" text-anchor="middle" font-size="12">Feature extraction</text><text x="380" y="68" text-anchor="middle" class="tm" font-size="10">km, one-hot columns</text>
    <rect x="455" y="25" width="120" height="60" rx="6" class="fb sb"/><text x="515" y="52" text-anchor="middle" font-size="12">Configuration</text><text x="515" y="68" text-anchor="middle" class="tm" font-size="10">depth, seed, paths</text>
    <rect x="265" y="98" width="70" height="26" rx="4" class="fg sg" stroke-width="2"/><text x="300" y="115" text-anchor="middle" font-size="11" font-weight="700">ML code</text>
    <rect x="25" y="135" width="130" height="36" rx="6" class="ft st"/><text x="90" y="157" text-anchor="middle" font-size="12">Serving infra</text>
    <rect x="165" y="135" width="130" height="36" rx="6" class="ft st"/><text x="230" y="157" text-anchor="middle" font-size="12">Monitoring</text>
    <rect x="305" y="135" width="130" height="36" rx="6" class="ft st"/><text x="370" y="157" text-anchor="middle" font-size="12">Process mgmt</text>
    <rect x="445" y="135" width="130" height="36" rx="6" class="ft st"/><text x="510" y="157" text-anchor="middle" font-size="12">Resource mgmt</text>
  </svg><figcaption>The model (green) is the small part. Every surrounding box is code and process that can drift out of sync with it.</figcaption></figure>
  <table class="tbl">
    <tr><th>Kind of ML debt</th><th>Plain words</th><th>At Biteful</th><th>Paid down by</th></tr>
    <tr><td>CACE: "Changing Anything Changes Everything"</td><td>Inputs are entangled; changing one feature, its unit, or the data mix shifts every prediction</td><td>Metres instead of km: 61.6 vs 53.2</td><td>Schemas (06), tests (CI/CD note)</td></tr>
    <tr><td>Glue code</td><td>Most of the code just moves data in and out of the model</td><td>Five scripts reshape exports before training</td><td>Pipelines, a clean layout (05, 07)</td></tr>
    <tr><td>Pipeline jungles</td><td>Data prep grows into a tangle nobody can rerun</td><td>Prepare steps scattered over notebook cells</td><td><code>dvc.yaml</code> stages (05)</td></tr>
    <tr><td>Undeclared consumers</td><td>Other teams silently use your outputs</td><td>Marketing reads the ETA column for promos</td><td>Contracts, a registry with owners</td></tr>
    <tr><td>Configuration debt</td><td>Settings spread across code, flags, notebooks</td><td>Depth 8 hard-coded in cell 14</td><td>Hydra + Pydantic (06)</td></tr>
    <tr><td>Feedback loops</td><td>The model's outputs change its future training data</td><td>Short ETAs make riders rush; future data looks faster</td><td>Monitoring (08), careful retraining (09)</td></tr>
  </table>
  <h3>MLOps vs DevOps vs DataOps</h3>
  <table class="tbl">
    <tr><th></th><th>DevOps</th><th>DataOps</th><th>MLOps</th></tr>
    <tr><td>Main product</td><td>Application code</td><td>Data pipelines and tables</td><td>Models in production</td></tr>
    <tr><td>Behaviour set by</td><td>Code</td><td>Code + source data</td><td>Code + data + settings + trained weights</td></tr>
    <tr><td>Tests</td><td>Unit, integration</td><td>Data quality, freshness, schema</td><td>All of those + model quality, slices, behaviour</td></tr>
    <tr><td>Failure mode</td><td>Crashes, errors (loud)</td><td>Late or wrong tables</td><td>Silently worse predictions (quiet)</td></tr>
    <tr><td>After release</td><td>Correct until code changes</td><td>Correct while sources behave</td><td>Decays as the world drifts</td></tr>
    <tr><td>Pipelines</td><td>CI/CD</td><td>Orchestrated ETL (<a class="xref" data-note="de_etl">Airflow</a>)</td><td>CI/CD + <strong>CT</strong> (continuous training)</td></tr>
  </table>
  <p><strong>CT (continuous training)</strong> means a pipeline retrains the model on new data automatically, the way CI tests code automatically.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hidden technical debt</strong> in ML is the long-term cost of the system around the model: data dependencies, glue code, configuration, feedback loops, and the coupling that makes any change ripple everywhere. <strong>Training/serving skew</strong> is any difference between how features are computed at training time and at prediction time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Same code, so same model" is false. Rerun the same script on next month's data and you get a different model; send the same model differently built features and you get different answers. Version all three (code, data, settings), and check inputs at the door.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Versioning Code with Git.</b> Every input to the model must be pinned down. The easiest one first: which exact code produced this model, and how do we try an idea without breaking the version that works?</div>

  <h2 id="ml-git"><span class="num">04</span>Versioning Code: Git for an ML Project</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Asha's notebook has 40 cells, some run twice, some deleted. Ravi wants to try deeper trees without breaking her working version. How do we record exactly which code made a model, and experiment safely?</p>
  </div>
  <p>Step one is to turn the notebook into plain scripts that run top to bottom: <code>prepare.py</code> drops impossible rows and writes <code>data/clean.csv</code>; <code>train.py</code> builds features, trains, saves the model and a <code>metrics.json</code>. Scripts can be run by a machine, reviewed line by line, and versioned. The <a class="xref" data-note="se_git">Git note</a> covers Git itself; here we use it the ML way.</p>
  <div class="fx" data-lang="py"># prepare.py — drop impossible rows, write data/clean.csv
import pandas as pd

df = pd.read_csv("data/orders.csv")
ok = df["minutes"].gt(0) &amp; df["distance_km"].between(0.1, 30) &amp; df["items"].between(1, 50)
df[ok].to_csv("data/clean.csv", index=False)
print(f"kept {ok.sum()} of {len(df)} rows")</div>
  <div class="fx" data-lang="py"># train.py — the notebook as a script (v1: settings written inside the code)
import json, os
import joblib, pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

RESTAURANTS = ["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"]

def build_features(df):
    X = df[["distance_km", "items", "rain"]].copy()
    for r in RESTAURANTS:                  # fixed list: identical columns in training and serving
        X[f"restaurant_{r}"] = (df["restaurant"] == r).astype(int)
    return X

df = pd.read_csv("data/clean.csv")
X_tr, X_te, y_tr, y_te = train_test_split(build_features(df), df["minutes"],
                                          test_size=0.25, random_state=42)
model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42).fit(X_tr, y_tr)
pred = model.predict(X_te)
metrics = {"mae": round(mean_absolute_error(y_te, pred), 3), "r2": round(r2_score(y_te, pred), 3)}
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/model.joblib")
json.dump(metrics, open("metrics.json", "w"))
print("trained on", len(X_tr), "rows -&gt;", metrics)</div>
  <p>Notice <code>build_features</code> uses a fixed list of restaurants instead of <code>pd.get_dummies</code>. <code>get_dummies</code> creates columns only for restaurants present in <em>this</em> data, so a request with one restaurant would produce one column instead of four. A fixed list gives the same columns in training and serving: the first small payment on the skew debt from section 03.</p>
  <p>The session below starts a repository, commits the scripts (not the data), then tries an experiment on a <strong>branch</strong>: a separate line of commits that does not disturb <code>main</code>.</p>
  <div class="fx" data-lang="text">$ ls -A
.gitignore
data
prepare.py
train.py
$ git init -q -b main
$ git config user.name "Asha" &amp;&amp; git config user.email "asha@biteful.example"
$ cat .gitignore
__pycache__/
outputs/
.venv/
$ git add .gitignore prepare.py train.py
$ git commit -qm "notebook split into prepare.py and train.py"
$ git status --short
?? data/
$ python prepare.py &amp;&amp; python train.py
kept 2000 of 2000 rows
trained on 1500 rows -&gt; {'mae': 2.443, 'r2': 0.913}
$ git switch -qc exp/deeper-trees
$ sed -i 's/max_depth=8/max_depth=12/' train.py
$ python train.py
trained on 1500 rows -&gt; {'mae': 2.632, 'r2': 0.899}
$ git commit -qam "try max_depth=12"
$ git switch -q main
$ git log --oneline --graph --all --decorate
* 2077639 (exp/deeper-trees) try max_depth=12
* c7285f6 (HEAD -&gt; main) notebook split into prepare.py and train.py
$ git rev-parse --short HEAD
c7285f6</div>
  <p>Read it line by line. <code>git status --short</code> shows <code>?? data/</code>: the data folder is <em>untracked</em>, deliberately not committed (section 05 explains why and what to do instead). On <code>main</code>, the script gives MAE 2.443 and R² 0.913, the notebook's numbers, now from a script anyone can run. On the branch <code>exp/deeper-trees</code>, depth 12 gives MAE 2.632: worse, so the branch is not merged. The graph shows both lines. <code>git rev-parse --short HEAD</code> prints <code>c7285f6</code>, the <strong>short SHA</strong>: a fingerprint of the exact code. From now on every model records the SHA it was trained from.</p>
  <h3>Branching for ML: trunk-based vs Gitflow</h3>
  <table class="tbl">
    <tr><th></th><th>Trunk-based</th><th>Gitflow</th></tr>
    <tr><td>Idea</td><td>Everyone merges small changes into <code>main</code> daily; short-lived branches</td><td>Long-lived <code>develop</code>, <code>release/*</code>, <code>hotfix/*</code> branches around <code>main</code></td></tr>
    <tr><td>Good for</td><td>Teams with strong CI; frequent releases; most ML teams today</td><td>Scheduled versioned releases (mobile apps, libraries)</td></tr>
    <tr><td>Risk</td><td>Needs tests on every merge</td><td>Long branches drift apart, painful merges</td></tr>
    <tr><td>ML twist</td><td colspan="2">Experiments live on short branches like <code>exp/deeper-trees</code>; the <em>result</em> of an experiment is recorded in a tracker (MLflow) even if the branch is thrown away. Data and models never go into Git directly.</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe book with a pencil draft page. You test "extra chilli" on a draft page (branch). If the dish is better, you copy the change into the book (merge); if not, you tear out the page. The page number of the recipe you cooked (SHA) is written on every tiffin you send out.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>commit SHA</strong> is the unique hash of one exact snapshot of the code; its short form (7 characters) is enough to name it. An <strong>experiment branch</strong> is a short-lived branch used to try one idea; only ideas that win are merged.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Training from uncommitted code. If <code>train.py</code> has local edits when you train, the SHA you record does not describe the code that ran. Commit first, then train (CI pipelines enforce this by only training from commits).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Versioning Data with DVC.</b> Git now pins the code. But <code>data/</code> is untracked, the export grew from 2,000 to 2,200 rows, and Git refuses files above 100 MB. Which data made the model, and how do we get it back?</div>

  <h2 id="ml-dvc"><span class="num">05</span>Versioning Data: DVC</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The warehouse export changes every week. The MAE 2.44 came from the 2,000-row file; Ravi's 2.80 came from the 2,200-row one. How do we record exactly which data trained a model, and restore it months later, without stuffing gigabytes into Git?</p>
  </div>
  <p>Git is built for small text files. Put a 50 GB CSV in it and every clone downloads all of it, every version is stored again, and GitHub refuses files over 100 MB. Still, we need to know <em>which exact data</em> trained each model. The fix: let Git store a tiny note that names the data, and keep the heavy file somewhere cheap.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>DVC</strong> (Data Version Control) puts a tiny pointer file in Git and stores the real data in a <strong>remote</strong>: cloud storage like S3 or GCS, or just a shared folder. The pointer holds the file's <strong>md5 hash</strong>, a fingerprint that changes completely if one byte changes.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The cloakroom at a wedding hall. You hand over your heavy bag and get a small token. You carry only the token. The token names exactly one bag, and handing it back gets you that bag. The <code>.dvc</code> file is the token; the remote is the cloakroom.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <defs><marker id="ml-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="140" height="50" rx="6" class="fs" stroke="currentColor"/><text x="80" y="62" text-anchor="middle">orders.csv</text><text x="80" y="78" text-anchor="middle" class="tm" font-size="11">50 KB … 50 GB</text>
    <rect x="220" y="10" width="140" height="44" rx="6" class="fb sb"/><text x="290" y="30" text-anchor="middle">orders.csv.dvc</text><text x="290" y="46" text-anchor="middle" class="tm" font-size="11">md5 + size → Git</text>
    <rect x="220" y="78" width="140" height="44" rx="6" class="ft st"/><text x="290" y="98" text-anchor="middle">cache / remote</text><text x="290" y="114" text-anchor="middle" class="tm" font-size="11">actual bytes → S3</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ml-ar2)"><line x1="150" y1="58" x2="218" y2="34"/><line x1="150" y1="72" x2="218" y2="98"/></g>
    <rect x="420" y="40" width="130" height="50" rx="6" class="fg sg"/><text x="485" y="62" text-anchor="middle">git commit</text><text x="485" y="78" text-anchor="middle" class="tm" font-size="11">code + data pointer</text>
    <line x1="360" y1="32" x2="418" y2="58" stroke="currentColor" marker-end="url(#ml-ar2)"/>
  </svg><figcaption>Git holds a 5-line pointer; the heavy file lives in the DVC remote. Checking out a commit restores the matching data.</figcaption></figure>
  <p>The real session, in the same repository. Read it as a story in five steps: (1) <code>dvc add</code> fingerprints the file, writes the token and tells Git to ignore the big file; (2) <code>git commit</code> saves the token as "data v1"; (3) <code>dvc push</code> sends the bytes to the remote (here a folder next to the project; in a company, <code>s3://bucket/dvc</code>); (4) the week-2 export arrives and <code>dvc status</code> notices; (5) time travel: take the old token from Git, <code>dvc checkout</code> brings back the matching bytes.</p>
  <div class="fx" data-lang="text">$ dvc init -q
$ dvc add data/orders.csv

To track the changes with git, run:

	git add data/.gitignore data/orders.csv.dvc

To enable auto staging, run:

	dvc config core.autostage true
$ cat data/orders.csv.dvc
outs:
- md5: 682841962a4364b47b7ccf62aabdd92c
  size: 50001
  hash: md5
  path: orders.csv
$ cat data/.gitignore
/orders.csv
$ git add .dvc .dvcignore data/orders.csv.dvc data/.gitignore
$ git commit -qm "data v1: 2000 orders"
$ dvc remote add -d store ../dvcstore
Setting 'store' as a default remote.
$ dvc push
1 file pushed
# week 2: the warehouse export now has 2200 rows
$ cp ../exports/orders_2200.csv data/orders.csv
$ dvc status
data/orders.csv.dvc:
	changed outs:
		modified:           data/orders.csv
$ dvc add data/orders.csv

To track the changes with git, run:

	git add data/orders.csv.dvc

To enable auto staging, run:

	dvc config core.autostage true
$ git commit -qam "data v2: 2200 orders"
$ dvc push
1 file pushed
$ git log --oneline
2c06203 data v2: 2200 orders
efb0c1c data v1: 2000 orders
c7285f6 notebook split into prepare.py and train.py
$ git checkout HEAD~1 -- data/orders.csv.dvc
$ dvc checkout
M       data/orders.csv
$ wc -l data/orders.csv
2001 data/orders.csv
$ git checkout HEAD -- data/orders.csv.dvc
$ dvc checkout
M       data/orders.csv
$ wc -l data/orders.csv
2201 data/orders.csv</div>
  <p>Check the evidence. The token says md5 <code>6828…</code> and size 50,001 bytes. After going back one commit, <code>wc -l</code> shows 2,001 lines (header + 2,000 orders): the v1 data, byte for byte. Going forward again gives 2,201 lines. "Which data trained the model with MAE 2.44?" is now answered by a Git commit, and the answer can be restored.</p>
  <h3>Pipelines: <code>dvc.yaml</code> and <code>dvc repro</code></h3>
  <p>Versioned data is half the story. The other half: when the data changes, which steps must rerun? Doing it by hand ("did I rerun prepare before train?") is a pipeline jungle in the making. DVC lets you write the steps down as <strong>stages</strong>, each with its command, its inputs (<code>deps</code>) and outputs (<code>outs</code>).</p>
  <div class="fx" data-lang="text">stages:
  prepare:
    cmd: python prepare.py
    deps: [data/orders.csv, prepare.py]
    outs: [data/clean.csv]
  train:
    cmd: python train.py
    deps: [data/clean.csv, train.py]
    outs: [models/model.joblib]
    metrics:
      - metrics.json:
          cache: false</div>
  <div class="fx" data-lang="text">$ dvc repro
'data/orders.csv.dvc' didn't change, skipping
Running stage 'prepare':
&gt; python prepare.py
kept 2198 of 2200 rows
Generating lock file 'dvc.lock'
Updating lock file 'dvc.lock'

Running stage 'train':
&gt; python train.py
trained on 1648 rows -&gt; {'mae': 2.654, 'r2': 0.901}
Updating lock file 'dvc.lock'

To track the changes with git, run:

	git add dvc.lock data/.gitignore models/.gitignore

To enable auto staging, run:

	dvc config core.autostage true
Use \`dvc push\` to send your updates to remote storage.
$ dvc repro
'data/orders.csv.dvc' didn't change, skipping
Stage 'prepare' didn't change, skipping
Stage 'train' didn't change, skipping
Data and pipelines are up to date.
$ dvc dag
+---------------------+  
| data/orders.csv.dvc |  
+---------------------+  
            *            
            *            
            *            
      +---------+        
      | prepare |        
      +---------+        
            *            
            *            
            *            
       +-------+         
       | train |         
       +-------+         
$ dvc metrics show
Path          mae    r2
metrics.json  2.654  0.901
$ git add dvc.yaml dvc.lock data/.gitignore models/.gitignore metrics.json
$ git commit -qm "pipeline: prepare -&gt; train"
$ sed -i 's/n_estimators=100/n_estimators=200/' train.py
$ dvc status
train:
	changed deps:
		modified:           train.py
$ dvc repro
'data/orders.csv.dvc' didn't change, skipping
Stage 'prepare' didn't change, skipping
Running stage 'train':
&gt; python train.py
trained on 1648 rows -&gt; {'mae': 2.645, 'r2': 0.902}
Updating lock file 'dvc.lock'

To track the changes with git, run:

	git add dvc.lock

To enable auto staging, run:

	dvc config core.autostage true
Use \`dvc push\` to send your updates to remote storage.
$ git checkout train.py
Updated 1 path from the index
$ dvc repro
'data/orders.csv.dvc' didn't change, skipping
Stage 'prepare' didn't change, skipping
Stage 'train' is cached - skipping run, checking out outputs
Updating lock file 'dvc.lock'

To track the changes with git, run:

	git add dvc.lock

To enable auto staging, run:

	dvc config core.autostage true
Use \`dvc push\` to send your updates to remote storage.</div>
  <p>What happened, step by step:</p>
  <ol>
    <li>First <code>dvc repro</code>: both stages ran. <code>prepare</code> kept 2,198 of 2,200 rows (the two broken orders are gone), <code>train</code> gave MAE 2.654. DVC wrote <code>dvc.lock</code>, recording the md5 of every input and output.</li>
    <li>Second <code>dvc repro</code>: nothing changed, so everything was skipped. DVC compares hashes, not timestamps.</li>
    <li><code>dvc dag</code> draws the dependency graph: data → prepare → train.</li>
    <li>Editing <code>train.py</code> (200 trees): <code>dvc status</code> names exactly what changed, and <code>repro</code> reruns only <code>train</code>; <code>prepare</code> is skipped.</li>
    <li>Undoing the edit: "Stage 'train' is cached - skipping run, checking out outputs". DVC's <strong>run-cache</strong> remembered the result for that exact combination of inputs and restored it without retraining.</li>
  </ol>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A Git commit now pins code <em>and</em> data <em>and</em> the pipeline that connects them. <code>git checkout &lt;old commit&gt; &amp;&amp; dvc checkout &amp;&amp; dvc repro</code> rebuilds an old model. This is what level-1 MLOps automates (section 10).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Committing the <code>.dvc</code> token or <code>dvc.lock</code> but forgetting <code>dvc push</code>. Your teammate pulls the commit, runs <code>dvc pull</code>, and finds no bytes in the remote. Push data whenever you push code (a pre-push hook can do it).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Versioning Config with Hydra &amp; Pydantic.</b> Code and data are pinned. But the settings (100 trees, depth 8, seed 42) are written inside <code>train.py</code>: trying depth 4 means editing code, and a typo like <code>max_dept</code> would be silently ignored.</div>

  <h2 id="ml-config"><span class="num">06</span>Versioning Config: Hydra &amp; Pydantic</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ravi wants to try depth 4, 8 and 12 with different seeds. Today each try means editing <code>train.py</code>, which changes the code SHA and mixes "settings" with "logic". How do we keep settings in one place, change them from the command line, record what was used, and reject mistakes?</p>
  </div>
  <p><strong>Configuration</strong> means the settings of a run: data path, test size, model settings, seed. Two tools split the job. <strong>Hydra</strong> loads settings from a YAML file and lets you override any of them from the command line. <strong>Pydantic</strong> checks that the settings (and data rows) have the right types and ranges.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A washing machine. The program dial (config file) holds the usual settings; you can turn a knob for one wash (override) without opening the machine (the code). The machine also refuses impossible settings, like 900 °C (validation).</p>
  </div>
  <p>The config file and the new <code>train.py</code>, which reads every setting from <code>cfg</code> instead of hard-coding it:</p>
  <div class="fx" data-lang="text">data:
  path: data/clean.csv
  test_size: 0.25
model:
  n_estimators: 100
  max_depth: 8
seed: 42</div>
  <div class="fx" data-lang="py"># train.py v2 — settings come from configs/config.yaml (Hydra), not from the code
import json, os
import hydra, joblib, pandas as pd
from omegaconf import DictConfig
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

RESTAURANTS = ["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"]

def build_features(df):
    X = df[["distance_km", "items", "rain"]].copy()
    for r in RESTAURANTS:
        X[f"restaurant_{r}"] = (df["restaurant"] == r).astype(int)
    return X

@hydra.main(config_path="configs", config_name="config", version_base=None)
def main(cfg: DictConfig) -&gt; None:
    df = pd.read_csv(cfg.data.path)
    X_tr, X_te, y_tr, y_te = train_test_split(build_features(df), df["minutes"],
                                              test_size=cfg.data.test_size, random_state=cfg.seed)
    model = RandomForestRegressor(n_estimators=cfg.model.n_estimators, max_depth=cfg.model.max_depth,
                                  random_state=cfg.seed).fit(X_tr, y_tr)
    pred = model.predict(X_te)
    metrics = {"mae": round(mean_absolute_error(y_te, pred), 3), "r2": round(r2_score(y_te, pred), 3)}
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/model.joblib")
    json.dump(metrics, open("metrics.json", "w"))
    print(f"trees={cfg.model.n_estimators} depth={cfg.model.max_depth} seed={cfg.seed} -&gt; {metrics}")

if __name__ == "__main__":
    main()</div>
  <p><code>@hydra.main(config_path="configs", config_name="config")</code> tells Hydra to load <code>configs/config.yaml</code> and pass it in as <code>cfg</code>; <code>cfg.model.max_depth</code> reads one value. Now the runs:</p>
  <div class="fx" data-lang="text">$ python train.py
trees=100 depth=8 seed=42 -&gt; {'mae': 2.654, 'r2': 0.901}
$ python train.py model.max_depth=4 seed=1
trees=100 depth=4 seed=1 -&gt; {'mae': 3.682, 'r2': 0.796}
$ python train.py model.max_dept=4
Could not override 'model.max_dept'.
To append to your config use +model.max_dept=4
Key 'max_dept' is not in struct
    full_key: model.max_dept
    object_type=dict

Set the environment variable HYDRA_FULL_ERROR=1 for a complete stack trace.
$ python train.py --multirun model.max_depth=4,8,12
[2026-10-20 01:02:02,089][HYDRA] Launching 3 jobs locally
[2026-10-20 01:02:02,090][HYDRA] 	#0 : model.max_depth=4
trees=100 depth=4 seed=42 -&gt; {'mae': 3.77, 'r2': 0.803}
[2026-10-20 01:02:02,371][HYDRA] 	#1 : model.max_depth=8
trees=100 depth=8 seed=42 -&gt; {'mae': 2.654, 'r2': 0.901}
[2026-10-20 01:02:02,647][HYDRA] 	#2 : model.max_depth=12
trees=100 depth=12 seed=42 -&gt; {'mae': 2.769, 'r2': 0.892}
$ tail -n +1 outputs/*/*/.hydra/overrides.yaml
==&gt; outputs/2026-10-20/01-01-56/.hydra/overrides.yaml &lt;==
[]

==&gt; outputs/2026-10-20/01-01-58/.hydra/overrides.yaml &lt;==
- model.max_depth=4
- seed=1</div>
  <ul>
    <li>Plain <code>python train.py</code> uses the file: depth 8, MAE 2.654 (same as before, on data v2).</li>
    <li><code>model.max_depth=4 seed=1</code> overrides two settings for one run without touching any file: MAE 3.682.</li>
    <li>The typo <code>model.max_dept=4</code> is <em>refused</em>: Hydra configs are "structs", so unknown keys are errors. Without this, the run would silently use depth 8 and Ravi would believe he tested depth 4.</li>
    <li><code>--multirun model.max_depth=4,8,12</code> is a <strong>sweep</strong>: one command, three runs. Depth 8 wins (2.654); 4 underfits (3.77), 12 overfits a little (2.769).</li>
    <li>Every run gets a folder under <code>outputs/</code> with a <code>.hydra/</code> copy of the exact config and the overrides used. That is the settings half of a run's receipt.</li>
  </ul>
  <p>Hydra catches unknown keys, but not wrong <em>values</em>: <code>n_estimators=many</code> or <code>max_depth=-3</code> would crash deep inside scikit-learn, or worse, run. Pydantic describes the expected shape once and checks it at the door. The same tool describes one order row, which the API server will reuse in the serving note.</p>
  <div class="fx" data-lang="py"># config.py — a typed contract for the settings and for one order row
from typing import Literal
import yaml
from pydantic import BaseModel, ConfigDict, Field, ValidationError

class ModelCfg(BaseModel):
    model_config = ConfigDict(extra="forbid")           # unknown keys are errors, not silently ignored
    n_estimators: int = Field(gt=0, le=2000)
    max_depth: int | None = Field(default=None, gt=0)

class TrainCfg(BaseModel):
    model_config = ConfigDict(extra="forbid")
    data: dict
    model: ModelCfg
    seed: int

class Order(BaseModel):
    distance_km: float = Field(gt=0, le=30)
    items: int = Field(ge=1, le=50)
    rain: Literal[0, 1]
    restaurant: Literal["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"]

cfg = TrainCfg(**yaml.safe_load(open("configs/config.yaml")))
print("config ok:", cfg.model)
for bad in [{"n_estimators": "many", "max_depth": 8}, {"n_estimators": 100, "max_depth": -3, "lr": 0.1}]:
    try:
        ModelCfg(**bad)
    except ValidationError as e:
        print(e.error_count(), "errors:", [(err["loc"][0], err["msg"]) for err in e.errors()])

print(Order(distance_km=5.5, items=3, rain=1, restaurant="Biryani House"))
try:
    Order(distance_km=120, items=3, rain=2, restaurant="Momo Hut")
except ValidationError as e:
    print(e.error_count(), "errors:", [(err["loc"][0], err["msg"]) for err in e.errors()])</div>
  <div class="fx" data-lang="text">config ok: n_estimators=100 max_depth=8
1 errors: [('n_estimators', 'Input should be a valid integer, unable to parse string as an integer')]
2 errors: [('max_depth', 'Input should be greater than 0'), ('lr', 'Extra inputs are not permitted')]
distance_km=5.5 items=3 rain=1 restaurant='Biryani House'
3 errors: [('distance_km', 'Input should be less than or equal to 30'), ('rain', 'Input should be 0 or 1'), ('restaurant', "Input should be 'Biryani House', 'Chai Stop', 'Dosa Corner' or 'Pizza Point'")]</div>
  <p><code>Field(gt=0, le=2000)</code> means "greater than 0, at most 2000". <code>extra="forbid"</code> turns unknown keys (<code>lr</code>) into errors. <code>Literal[0, 1]</code> allows only those values. The broken GPS order (120 km, rain = 2, an unknown restaurant) produces three clear errors instead of a silent 61-minute guess. Finally the pipeline learns that the config is an input too:</p>
  <div class="fx" data-lang="text">$ git diff dvc.yaml
diff --git a/dvc.yaml b/dvc.yaml
index ae865bc..ac5b4b4 100644
--- a/dvc.yaml
+++ b/dvc.yaml
@@ -5,7 +5,7 @@ stages:
     outs: [data/clean.csv]
   train:
     cmd: python train.py
-    deps: [data/clean.csv, train.py]
+    deps: [data/clean.csv, train.py, configs/config.yaml]
     outs: [models/model.joblib]
     metrics:
       - metrics.json:
$ echo "multirun/" &gt;&gt; .gitignore
$ dvc repro
'data/orders.csv.dvc' didn't change, skipping
Stage 'prepare' didn't change, skipping
Running stage 'train':
&gt; python train.py
trees=100 depth=8 seed=42 -&gt; {'mae': 2.654, 'r2': 0.901}
Updating lock file 'dvc.lock'

To track the changes with git, run:

	git add dvc.lock

To enable auto staging, run:

	dvc config core.autostage true
Use \`dvc push\` to send your updates to remote storage.
$ git add .gitignore configs train.py dvc.yaml dvc.lock metrics.json
$ git commit -qm "settings live in configs/config.yaml (Hydra)"</div>
  <h3>The full reproducibility recipe</h3>
  <p>With code, data and settings pinned, the recipe for "the same model" has five parts. Write all five down for every model (the MLflow note automates this and covers seeds in depth):</p>
  <div class="flow"><span>Code (Git SHA)</span><span>Data (DVC md5)</span><span>Config (Hydra file + overrides)</span><span>Environment (lockfile / Docker)</span><span>Seed</span><span>Same model</span></div>
  <table class="tbl">
    <tr><th>Ingredient</th><th>Pinned by</th><th>Biteful value</th></tr>
    <tr><td>Code</td><td>Git commit</td><td><code>18d6a1b</code> "settings live in configs/config.yaml"</td></tr>
    <tr><td>Data</td><td><code>orders.csv.dvc</code>, <code>dvc.lock</code></td><td>2,200-row export → 2,198 clean rows</td></tr>
    <tr><td>Config</td><td><code>configs/config.yaml</code> + overrides</td><td>100 trees, depth 8, test 0.25</td></tr>
    <tr><td>Environment</td><td><code>requirements.txt</code> with exact pins, <code>uv.lock</code>, Docker image</td><td>scikit-learn 1.9.1, pandas 3.0.5</td></tr>
    <tr><td>Randomness</td><td><code>seed</code> in config → <code>random_state</code></td><td>42</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hydra</strong> composes a run's configuration from YAML files plus command-line overrides, saves the final config with each run, and supports sweeps (<code>--multirun</code>). <strong>Pydantic</strong> validates Python data against a typed schema (types, ranges, allowed values) and raises a <code>ValidationError</code> listing every problem.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading a setting in code with a default, like <code>cfg.get("max_depth", 8)</code>. A typo in the config then silently falls back to the default. Make configs strict (Hydra structs, Pydantic <code>extra="forbid"</code>) so a wrong name fails loudly.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Project Layout &amp; Pre-commit.</b> The repo now has scripts, configs, data pointers, a pipeline and outputs. Where should each thing live as it grows, and who stops someone committing an 11 MB model or a broken YAML file?</div>

  <h2 id="ml-layout"><span class="num">07</span>Project Layout &amp; Pre-commit</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Three more people join. Tests must import the feature code, the API server must reuse the same <code>build_features</code>, and someone will eventually <code>git add .</code> with a model file inside. How do we organise the project so code is shared, not copied, and how do we catch mistakes before they enter history?</p>
  </div>
  <h3>A standard layout</h3>
  <p>A common layout for an ML project (the "src layout"). The code lives in an installable package under <code>src/</code>, so the training script, the tests and the API server all import <em>one</em> <code>build_features</code>, which removes a major source of training/serving skew. This is the target shape the Biteful project grows into over the track (a layout, not a command output):</p>
  <div class="fx" data-lang="text">biteful-eta/
├── configs/config.yaml        # Hydra settings (06)
├── data/orders.csv.dvc        # DVC pointer; bytes in the remote (05)
├── dvc.yaml  dvc.lock         # pipeline stages and their hashes (05)
├── src/biteful_eta/
│   ├── features.py            # build_features: ONE copy for training and serving
│   ├── prepare.py  train.py   # pipeline steps
│   └── schemas.py             # Pydantic Order + config schema (06)
├── tests/                     # unit, data and model tests (CI/CD note)
├── serve/app.py  Dockerfile   # the API server (serving note)
├── notebooks/                 # exploration only; nothing imports from here
├── pyproject.toml             # package metadata + pinned dependencies
├── .pre-commit-config.yaml    # checks that run before every commit
└── .gitignore</div>
  <table class="tbl">
    <tr><th>Rule</th><th>Why</th></tr>
    <tr><td>Notebooks explore; scripts and packages produce</td><td>Notebooks run out of order and cannot be tested or scheduled</td></tr>
    <tr><td>Code in <code>src/&lt;package&gt;</code>, installed with <code>pip install -e .</code></td><td>Tests import the installed package, not whatever file is in the current folder</td></tr>
    <tr><td>Settings in <code>configs/</code></td><td>Change behaviour without changing code (06)</td></tr>
    <tr><td>Data and models never in Git</td><td>DVC pointers and a model registry instead (05, MLflow note)</td></tr>
  </table>
  <h3>Pre-commit hooks</h3>
  <p>A <strong>Git hook</strong> is a script Git runs automatically at a moment like "just before a commit". The <strong>pre-commit</strong> tool manages these hooks from one YAML file and installs each checker in its own small environment. If any hook fails, the commit is stopped.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Airport security before the gate. Every bag (commit) goes through the scanner. A bag with a liquid over the limit (a 3 MB model file) is stopped at the gate, not discovered on the plane (in Git history forever).</p>
  </div>
  <div class="fx" data-lang="text">repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v6.0.0
    hooks:
      - id: check-added-large-files      # stop 11 MB model files sneaking into Git
        args: ["--maxkb=500"]
      - id: check-yaml                   # configs/*.yaml, dvc.yaml must parse
      - id: end-of-file-fixer
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.9.9
    hooks:
      - id: ruff                         # lint; --fix removes unused imports etc.
        args: ["--fix"]</div>
  <div class="fx" data-lang="text">$ pre-commit install
pre-commit installed at .git/hooks/pre-commit
$ cp models/model.joblib model_backup.joblib
$ printf 'import os\\nimport pandas as pd\\n\\nprint(pd.read_csv("data/clean.csv").shape)\\n' &gt; check_data.py
$ git add .pre-commit-config.yaml model_backup.joblib check_data.py
$ git commit -qm "add data checker"
[INFO] Initializing environment for https://github.com/pre-commit/pre-commit-hooks.
[INFO] Initializing environment for https://github.com/astral-sh/ruff-pre-commit.
[INFO] Installing environment for https://github.com/pre-commit/pre-commit-hooks.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
[INFO] Installing environment for https://github.com/astral-sh/ruff-pre-commit.
[INFO] Once installed this environment will be reused.
[INFO] This may take a few minutes...
check for added large files..............................................Failed
- hook id: check-added-large-files
- exit code: 1

model_backup.joblib (3127 KB) exceeds 500 KB.

check yaml...............................................................Passed
fix end of files.........................................................Passed
ruff.....................................................................Failed
- hook id: ruff
- files were modified by this hook

Found 1 error (1 fixed, 0 remaining).

$ git restore --staged model_backup.joblib &amp;&amp; rm model_backup.joblib
$ git add check_data.py
$ git commit -qm "add data checker"
check for added large files..............................................Passed
check yaml...............................................................Passed
fix end of files.........................................................Passed
ruff.....................................................................Passed
$ cat check_data.py
import pandas as pd

print(pd.read_csv("data/clean.csv").shape)
$ git log --oneline | head -3
a72a702 add data checker
18d6a1b settings live in configs/config.yaml (Hydra)
a14f646 pipeline: prepare -&gt; train</div>
  <p>The first commit attempt failed twice. <code>check-added-large-files</code> stopped the 3,127 KB model backup (limit 500 KB). <code>ruff --fix</code> found the unused <code>import os</code>, removed it, and failed the commit so a human sees the change. After unstaging the model and adding the fixed file, all four hooks passed. The first run also printed "Initializing environment": pre-commit downloaded each hook once and reuses it afterwards.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>pre-commit</strong> is a framework that runs a list of checks (formatters, linters, file-size and YAML checks, secret scanners) on the files being committed, and blocks the commit if any check fails. The same checks run again in CI, so skipping them locally (<code>git commit --no-verify</code>) does not get a mistake merged.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A large file committed once stays in Git history even after you delete it, and every clone downloads it forever. Removing it means rewriting history. That is why the block must happen <em>before</em> the commit.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Drift.</b> The project is now rebuildable: code, data, settings and checks are all versioned. But a perfectly reproducible model can still go wrong once it is live, because the world it predicts keeps changing.</div>

  <h2 id="ml-drift"><span class="num">08</span>Drift: Why Live Models Rot</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The model scored MAE 2.44 on last year's orders. A month after launch, Biteful expands to new suburbs and the monsoon arrives. Nothing in the code or the model changed. Can it still be right?</p>
  </div>
  <p>A kirana shop owner knows his regular customers well. Then a college opens nearby and most customers are students. His guesses about what people will buy start going wrong. He did nothing wrong; the world around him changed. A model is in the same position. It learnt patterns from past data; when the present stops looking like the past, its answers get worse. This slow change is called <strong>drift</strong>.</p>
  <div class="fx" data-lang="py"># a month after launch: the city expanded and the monsoon arrived
rng = np.random.default_rng(11)
n = 300
live = pd.DataFrame({"distance_km": rng.uniform(2.0, 12.0, n).round(1),        # new, farther suburbs
                     "items": rng.integers(1, 7, n),
                     "rain": (rng.random(n) &lt; 0.70).astype(int),               # monsoon
                     "restaurant": rng.choice(list(prep), n)})
true_minutes = (8 + 3.2*live.distance_km + 1.4*live["items"] + 7*live.rain + 0.8*live.rain*live.distance_km
                + live.restaurant.map(prep) + rng.normal(0, 3, n))
print("mean distance  train:", round(df.distance_km.mean(), 2), " live:", round(live.distance_km.mean(), 2))
print("share rainy    train:", round(df.rain.mean(), 2), " live:", round(live.rain.mean(), 2))
print("share &gt; 8 km   train:", round((df.distance_km &gt; 8).mean(), 2), " live:", round((live.distance_km &gt; 8).mean(), 2))
Xl = pd.get_dummies(live, columns=["restaurant"]).reindex(columns=X.columns, fill_value=0)
print("live MAE (labels arrive later):", round(mean_absolute_error(true_minutes, model.predict(Xl)), 2), "min")
# concept drift: a new one-way traffic plan adds 6 minutes to EVERY trip; inputs look the same as training
same_inputs = X_te.copy()
print("MAE before traffic plan:", round(mean_absolute_error(y_te, model.predict(same_inputs)), 2),
      " after:", round(mean_absolute_error(y_te + 6, model.predict(same_inputs)), 2))</div>
  <div class="fx" data-lang="text">mean distance  train: 4.25  live: 6.78
share rainy    train: 0.26  live: 0.7
share &gt; 8 km   train: 0.0  live: 0.36
live MAE (labels arrive later): 4.87 min
MAE before traffic plan: 2.44  after: 5.87</div>
  <p>Read the first block. The average trip grew from 4.25 to 6.78 km, rainy orders went from 26% to 70%, and 36% of live trips are longer than 8 km, a range the model <em>never saw</em> in training (0%). We spotted all of this without knowing a single real delivery time: we only compared inputs. When the true minutes arrive, the live MAE is 4.87, double the 2.44 promised. The second block is different: the inputs are exactly the test set, but a new one-way traffic plan adds 6 minutes to every trip. The MAE jumps from 2.44 to 5.87 with no change at all in the inputs.</p>
  <ul>
    <li><strong>Data drift</strong> (covariate shift) — the inputs look different: farther suburbs, more rain.</li>
    <li><strong>Concept drift</strong> — the inputs look the same but the right answer changed: the traffic plan.</li>
    <li><strong>Model drift</strong> (decay) — the result: the live score falls.</li>
  </ul>
  <p>Books write these with probability notation. <strong>P(X)</strong> means "how the inputs are spread out" (how many orders are rainy, how far they go). <strong>P(y|X)</strong> means "for a given input, what answer is right". Data drift changes P(X); concept drift changes P(y|X).</p>
  <figure class="viz"><svg viewBox="0 0 580 150" width="580">
    <text x="140" y="16" text-anchor="middle">Data drift: P(X) moves</text>
    <line x1="20" y1="120" x2="270" y2="120" stroke="currentColor"/>
    <path d="M30,120 C80,120 85,40 110,40 C135,40 140,120 190,120" class="sb fb" stroke-width="2"/>
    <path d="M100,120 C150,120 155,55 180,55 C205,55 210,120 260,120" class="sr" fill="none" stroke-width="2" stroke-dasharray="5 3"/>
    <text x="95" y="34" class="tb" font-size="11">train</text><text x="190" y="50" class="tr" font-size="11">live</text>
    <text x="140" y="140" text-anchor="middle" class="tm" font-size="11">distance: mean 4.25 → 6.78 km</text>
    <text x="440" y="16" text-anchor="middle">Concept drift: P(y|X) moves</text>
    <line x1="320" y1="120" x2="570" y2="120" stroke="currentColor"/><line x1="320" y1="120" x2="320" y2="28" stroke="currentColor"/>
    <line x1="320" y1="110" x2="560" y2="45" class="sb" stroke-width="2"/>
    <line x1="320" y1="92" x2="560" y2="27" class="sr" stroke-width="2" stroke-dasharray="5 3"/>
    <text x="500" y="75" class="tb" font-size="11">old rule</text><text x="430" y="50" class="tr" font-size="11">+6 min everywhere</text>
    <text x="440" y="140" text-anchor="middle" class="tm" font-size="11">same km, more minutes</text>
  </svg><figcaption>Left: the inputs moved. Right: the inputs did not move, but the rule from input to answer did.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Data drift (covariate shift)</th><th>Concept drift</th><th>Model drift (decay)</th></tr>
    <tr><td>What changed</td><td>Input distribution P(X)</td><td>Relationship P(y|X)</td><td>The outcome: performance drops</td></tr>
    <tr><td>Biteful example</td><td>Suburbs + monsoon: rainy 0.26 → 0.70</td><td>Traffic plan: +6 min for the same trip</td><td>Live MAE 2.44 → 4.87 or 5.87</td></tr>
    <tr><td>Detect with</td><td>PSI, KS test, feature stats vs training</td><td>Live metrics once labels arrive</td><td>Live metrics vs baseline</td></tr>
    <tr><td>Needs labels?</td><td>No</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>Fix</td><td>Retrain on recent data; maybe reweight</td><td>Retrain with new labels; rethink features</td><td>Find the cause (left two, or a bug)</td></tr>
  </table>
  <p>Two words from the table. A <strong>label</strong> is the true answer (the real delivery minutes). <strong>PSI</strong> (population stability index) and the <strong>KS test</strong> are standard ways to put a number on "how much did this column's spread change?". For delivery times labels arrive within an hour; for churn or loan defaults they may take months, and you must watch <strong>proxies</strong> (input drift, prediction drift, data quality) meanwhile. The maths of PSI and KS, dashboards and alerting are in <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Drift</strong> is any change between the data a model was trained on and the data it sees live. <strong>Data drift</strong> changes P(X), <strong>concept drift</strong> changes P(y|X), and <strong>model drift</strong> is the resulting fall in live performance.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Data drift does not always hurt, and concept drift can happen with zero data drift (the traffic plan). Alert on drift, but decide on live metrics. And a broken upstream pipeline (nulls, a unit change like metres) looks exactly like drift: check for bugs first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Retraining Triggers.</b> We can see the model getting worse. When exactly should we train a new one, and what stops a bad retrain from going live?</div>

  <h2 id="ml-retrain"><span class="num">09</span>Retraining Triggers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The live MAE creeps up week after week during the monsoon. Retrain every night "just in case"? Wait until customers complain? What rule decides, and what protects us from a bad retrain?</p>
  </div>
  <p>You service a scooter in two ways: every 3,000 km whatever happens, or right away when a warning light comes on. Models are retrained the same two ways.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>retraining trigger</strong> is the rule that decides when to train the model again. A <strong>gate</strong> is the check a new candidate must pass (beat the baseline and the current champion on a fixed holdout and key slices) before it may replace the champion.</p>
  </div>
  <div class="cards">
    <div><b>Scheduled</b><p>Every night / week / month.</p><small>Simple, predictable; may waste compute or react late</small></div>
    <div><b>Performance drop</b><p>Live metric crosses a threshold.</p><small>Best signal; needs labels (often delayed)</small></div>
    <div><b>Drift alert</b><p>PSI or KS on key features crosses a limit.</p><small>Early, label-free; noisy</small></div>
    <div><b>New data volume</b><p>N new labelled rows collected.</p><small>Good when labels arrive in bursts</small></div>
    <div><b>Event</b><p>New city, new restaurant partner, policy change.</p><small>Manual, known in advance</small></div>
  </div>
  <p>Most teams combine them: a schedule as the floor plus a metric trigger for urgent drops. The Biteful rule, run on six weeks of monitoring numbers:</p>
  <div class="fx" data-lang="py"># retraining trigger: weekly live MAE (minutes) from the monitoring job, alarm above 3.5
weekly_mae = {"wk1": 2.5, "wk2": 2.6, "wk3": 2.9, "wk4": 3.3, "wk5": 3.8, "wk6": 4.4}
ALARM, SCHEDULE_WEEKS = 3.5, 8                  # metric trigger + monthly-ish schedule as a floor
for i, (week, mae) in enumerate(weekly_mae.items(), start=1):
    reason = "metric" if mae &gt; ALARM else ("schedule" if i % SCHEDULE_WEEKS == 0 else None)
    print(f"{week}: MAE {mae} -&gt;", f"RETRAIN ({reason})" if reason else "ok")
    if reason:
        break</div>
  <div class="fx" data-lang="text">wk1: MAE 2.5 -&gt; ok
wk2: MAE 2.6 -&gt; ok
wk3: MAE 2.9 -&gt; ok
wk4: MAE 3.3 -&gt; ok
wk5: MAE 3.8 -&gt; RETRAIN (metric)</div>
  <p>Weeks 1 to 4 stay under the alarm of 3.5 minutes. In week 5 the MAE is 3.8 and the metric trigger fires, three weeks before the 8-week schedule would have. What happens next is the loop from section 02:</p>
  <div class="flow"><span>Trigger fires</span><span>Pipeline retrains on a fresh DVC snapshot</span><span>Gate: candidate vs champion on the same holdout</span><span>Better? → register, then canary</span><span>Worse? → keep old, alert a human</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never auto-deploy a retrained model without a gate. If the new export were corrupt (imagine thousands of "-1 minute" rows instead of one), automation would ship a broken model at 3 a.m. The <code>prepare</code> stage and the gate exist for exactly this.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Maturity Levels &amp; Tools.</b> Triggers, pipelines, gates, registries: how much of this does a team actually automate, and which tools sit at each stage?</div>

  <h2 id="ml-mature"><span class="num">10</span>Maturity Levels &amp; the Tooling Landscape</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful started with a notebook and a manual handover. Now it has scripts, DVC and a retraining rule. How do we describe how far along a team is, and what the next step should be?</p>
  </div>
  <p>Think of making rotis. Level 0: one person rolls each roti by hand. Level 1: a roti machine makes them every day without help. Level 2: even changes to the machine are tested and installed automatically. This scale comes from Google and is widely quoted; most companies sit at level 0 or 1.</p>
  <table class="tbl">
    <tr><th>Level</th><th>What it looks like</th><th>Biteful at this level</th><th>Main risk</th></tr>
    <tr><td><strong>0 · Manual</strong></td><td>Notebook → pickle → engineer rewrites it for prod</td><td>Asha emails <code>model.pkl</code>; ETAs in metres bug</td><td>Training/serving skew, no monitoring</td></tr>
    <tr><td><strong>1 · Pipeline automation</strong></td><td>Training is an automated pipeline (CT) on new data; registry + monitoring</td><td><code>dvc repro</code> runs weekly; week-5 trigger retrains; registry holds @champion</td><td>Pipeline code itself still changed by hand</td></tr>
    <tr><td><strong>2 · CI/CD automation</strong></td><td>Pipeline code is tested and deployed by CI/CD too; many models, many teams</td><td>A change to <code>features.py</code> is tested, retrained, containerised and canaried automatically</td><td>Platform complexity, cost</td></tr>
  </table>
  <div class="callout intu"><span class="label">Interview tip</span>
    <p>Level 0 → 1 is the big win: the same code trains in dev and prod, so "it worked in my notebook" stops being a problem. Level 1 → 2 is what the CI/CD note builds.</p>
  </div>
  <h3>The tooling landscape</h3>
  <table class="tbl">
    <tr><th>Stage</th><th>Open-source tools</th><th>Managed / cloud</th><th>In this track</th></tr>
    <tr><td>Versioning</td><td>Git, DVC, lakeFS, Delta Lake</td><td>GitHub/GitLab, Databricks</td><td>This note</td></tr>
    <tr><td>Config</td><td>Hydra, Pydantic, OmegaConf</td><td>—</td><td>This note</td></tr>
    <tr><td>Tracking &amp; registry</td><td>MLflow, Optuna</td><td>Weights &amp; Biases, Neptune, SageMaker, Vertex</td><td><a class="xref" data-note="mlops_mlflow">MLflow note</a></td></tr>
    <tr><td>Orchestration</td><td>Airflow, Prefect, Kubeflow Pipelines</td><td>SageMaker/Vertex Pipelines</td><td><a class="xref" data-note="de_etl">ETL &amp; Orchestration</a></td></tr>
    <tr><td>CI/CD</td><td>GitHub Actions, GitLab CI, Jenkins</td><td>Cloud Build, CodePipeline</td><td><a class="xref" data-note="mlops_cicd">CI/CD for ML</a></td></tr>
    <tr><td>Serving</td><td>FastAPI, BentoML, KServe, Triton, ONNX Runtime</td><td>SageMaker/Vertex endpoints</td><td><a class="xref" data-note="mlops_serving">Model Serving</a></td></tr>
    <tr><td>Infrastructure</td><td>Docker, Kubernetes, Helm, Terraform</td><td>EKS, GKE, AKS</td><td><a class="xref" data-note="mlops_k8s">Kubernetes</a>, <a class="xref" data-note="mlops_cloud">Cloud &amp; IaC</a></td></tr>
    <tr><td>Monitoring</td><td>Prometheus, Grafana, Evidently</td><td>CloudWatch, Vertex Model Monitoring</td><td><a class="xref" data-note="sd_monitoring">Monitoring</a></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MLOps maturity levels</strong>: level 0, every step manual; level 1, continuous training through an automated pipeline with a registry and monitoring; level 2, the pipeline code itself goes through CI/CD.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Buying level-2 tools for a level-0 team. Kubernetes and a feature store do not help if training still lives in one notebook. Climb in order: scripts and versioning, then an automated pipeline, then CI/CD.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Roles &amp; Handoffs.</b> The loop has many stages. Who does each one, and what exactly is passed from person to person?</div>

  <h2 id="ml-roles"><span class="num">11</span>Roles &amp; Handoffs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>At level 0, Asha emailed a pickle to an engineer who rewrote the feature code, and the metres bug was born in that handover. Who should own which stage, and what should be handed over so nothing is lost?</p>
  </div>
  <p>A restaurant has a supplier who brings clean vegetables, a chef who invents the recipe, a kitchen manager who cooks it 500 times a day, a team that keeps the stoves working, and an owner who decides the menu. An ML team splits work the same way.</p>
  <div class="flow"><span>Data engineer</span><span>Data scientist</span><span>ML engineer</span><span>Platform / DevOps</span><span>Product &amp; business</span></div>
  <table class="tbl">
    <tr><th>Role</th><th>Owns</th><th>Hands off</th><th>At Biteful</th></tr>
    <tr><td>Data engineer</td><td>Ingestion, pipelines, warehouse, data quality</td><td>Clean, versioned tables / features</td><td>The orders export, without -1 minute rows</td></tr>
    <tr><td>Data scientist</td><td>Problem framing, features, model choice, offline eval</td><td>Tracked experiment + candidate in the registry</td><td>Asha: forest, depth 8, MAE 2.44</td></tr>
    <tr><td>ML engineer</td><td>Training pipelines, serving, monitoring, retraining</td><td>A live, monitored endpoint or batch job</td><td>The ETA API and the week-5 retrain</td></tr>
    <tr><td>Platform / DevOps</td><td>Clusters, CI/CD, infra, security, cost</td><td>Self-serve tools (K8s, MLflow, runners)</td><td>The cluster the API runs on</td></tr>
    <tr><td>Product / business</td><td>Success metric, guardrails, A/B decisions</td><td>Go / no-go; new requirements</td><td>"ETA must be within 5 min for 90% of orders"</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>handoff contract</strong> is what one role gives the next so the work can continue without guessing: for a model, a registry entry with the code SHA, data version, config, input/output <strong>signature</strong> (the expected columns and types), metrics, and an example input.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The notebook "thrown over the wall". A <code>.pkl</code> in Slack carries no SHA, no data version, no signature, and invites a rewrite of the feature code (the metres bug). The registry entry is the fix, and it is the subject of the next note.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Eleven ideas. How do they fit into one picture of the Biteful project?</div>

  <h2 id="ml-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If someone asks "rebuild the delivery-time model that was live in week 4", which pieces from this note answer which part of that request?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="ml-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="50" rx="7" class="fb sb"/><text x="110" y="30" text-anchor="middle" font-size="11.5" font-weight="700">Code: Git (04)</text><text x="110" y="47" text-anchor="middle" class="tm" font-size="10">SHA 18d6a1b · branches · hooks (07)</text>
<rect x="230" y="10" width="200" height="50" rx="7" class="fb sb"/><text x="330" y="30" text-anchor="middle" font-size="11.5" font-weight="700">Data: DVC (05)</text><text x="330" y="47" text-anchor="middle" class="tm" font-size="10">orders.csv.dvc md5 · 2,198 clean rows</text>
<rect x="450" y="10" width="200" height="50" rx="7" class="fb sb"/><text x="550" y="30" text-anchor="middle" font-size="11.5" font-weight="700">Config: Hydra + Pydantic (06)</text><text x="550" y="47" text-anchor="middle" class="tm" font-size="10">100 trees · depth 8 · seed 42</text>
<line x1="110" y1="60" x2="300" y2="98" stroke="currentColor" marker-end="url(#ml-a9)"/><line x1="330" y1="60" x2="330" y2="96" stroke="currentColor" marker-end="url(#ml-a9)"/><line x1="550" y1="60" x2="360" y2="98" stroke="currentColor" marker-end="url(#ml-a9)"/>
<rect x="180" y="98" width="300" height="46" rx="7" class="fg sg"/><text x="330" y="117" text-anchor="middle" font-size="11.5" font-weight="700">dvc repro → model.joblib + metrics.json</text><text x="330" y="134" text-anchor="middle" class="tm" font-size="10">MAE 2.654 · R² 0.901 · dvc.lock pins every hash</text>
<line x1="330" y1="144" x2="330" y2="166" stroke="currentColor" marker-end="url(#ml-a9)"/>
<rect x="180" y="168" width="300" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="186" text-anchor="middle" font-size="11.5">gate vs baseline 8.45 &amp; champion → deploy</text><text x="330" y="201" text-anchor="middle" class="tm" font-size="10">registry, CI/CD, serving: next notes</text>
<line x1="330" y1="208" x2="330" y2="230" stroke="currentColor" marker-end="url(#ml-a9)"/>
<rect x="180" y="232" width="300" height="46" rx="7" class="ft st"/><text x="330" y="251" text-anchor="middle" font-size="11.5" font-weight="700">live: drift (08) → trigger (09)</text><text x="330" y="268" text-anchor="middle" class="tm" font-size="10">rainy 0.26→0.70 · MAE 4.87 · wk5 3.8 &gt; 3.5</text>
<path d="M180 255 C 60 255, 40 120, 110 62" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ml-a9)"/><text x="40" y="200" class="tm" font-size="10">retrain: new data</text><text x="40" y="213" class="tm" font-size="10">version → loop</text>
</svg><figcaption>Three versioned inputs make one reproducible model; drift and triggers send the loop round again with a new data version.</figcaption></figure>
  <table class="tbl"><caption>Every idea on the Biteful project</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Notebook problem</td><td>one-off cells, no records</td><td>why can't others rebuild it?</td><td>2.44 vs 2.60 / 2.45 / 2.49 / 2.80</td><td>recognise it early</td></tr>
    <tr><td>Lifecycle loop</td><td>seven stages</td><td>what happens after training?</td><td>export → train → gate → API → monitor → retrain</td><td>planning any ML project</td></tr>
    <tr><td>Hidden technical debt</td><td>code + data + settings coupling</td><td>what breaks in production?</td><td>metres: 61.6 vs 53.2, no error</td><td>design reviews</td></tr>
    <tr><td>Git</td><td>commits, branches</td><td>which code?</td><td>main 2.443 vs branch depth 12 2.632; SHA c7285f6</td><td>always</td></tr>
    <tr><td>DVC</td><td>md5 pointers + remote + stages</td><td>which data? what reruns?</td><td>2,001 ↔ 2,201 lines; kept 2,198; run-cache hit</td><td>any data that changes or is big</td></tr>
    <tr><td>Hydra</td><td>YAML + overrides</td><td>which settings, changed how?</td><td>depth 4/8/12 → 3.77/2.654/2.769</td><td>any project with settings</td></tr>
    <tr><td>Pydantic</td><td>typed schemas</td><td>are settings and rows valid?</td><td>120 km, rain=2, Momo Hut → 3 errors</td><td>configs, API inputs, data checks</td></tr>
    <tr><td>Layout + pre-commit</td><td>src package + hooks</td><td>where things live; stop bad commits</td><td>3,127 KB blocked; unused import removed</td><td>from the first commit</td></tr>
    <tr><td>Drift</td><td>P(X), P(y|X) changes</td><td>why does it get worse?</td><td>live MAE 4.87; traffic plan 5.87</td><td>after launch, always</td></tr>
    <tr><td>Retraining triggers</td><td>schedule + metric + drift + gate</td><td>when to train again?</td><td>week 5: 3.8 &gt; 3.5 → retrain</td><td>every live model</td></tr>
    <tr><td>Maturity levels</td><td>how much is automated</td><td>where are we, what next?</td><td>level 0 → level 1 with dvc repro</td><td>roadmaps, interviews</td></tr>
    <tr><td>Roles &amp; handoffs</td><td>contracts between people</td><td>who owns what?</td><td>registry entry, not a pickle</td><td>any team of 2+</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a model is the product of code, data and settings, so all three are versioned (Git, DVC, Hydra) and checked (Pydantic, pre-commit), which makes any model rebuildable; and because the world drifts, the loop never ends: monitor, trigger, retrain through a gate.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The usual ways a team falls back to "it worked on my laptop".</div>

  <h2 id="ml-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which habits produce the classic symptoms: unrepeatable scores, silent wrong answers, missing data on a teammate's machine, models no one can trace?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no seed, no snapshot</span><p>Scores move from run to run (2.44 vs 2.60) and new rows sneak in (2.80). Fix the seed in config; train on a DVC-versioned snapshot, never on "the live table".</p></div>
  <div class="callout trap"><span class="label">Trap: features built twice</span><p>Notebook features and app features drift apart (km vs metres). One <code>build_features</code> in a package, imported by both, plus schema checks at the door.</p></div>
  <div class="callout trap"><span class="label">Trap: data or models in Git</span><p>Bloated history forever. DVC pointers for data, a registry for models, a pre-commit size check.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting dvc push</span><p>The pointer is in Git but the bytes are only on your laptop. Push data with code.</p></div>
  <div class="callout trap"><span class="label">Trap: settings in code, lenient configs</span><p>Typos like <code>max_dept</code> silently fall back to defaults. Strict configs (Hydra structs, Pydantic <code>extra="forbid"</code>).</p></div>
  <div class="callout trap"><span class="label">Trap: treating deployment as the end</span><p>Drift makes every model decay. Monitor inputs and live metrics; plan retraining from day one.</p></div>
  <div class="callout trap"><span class="label">Trap: auto-deploy after retrain</span><p>A corrupt export becomes a broken live model. Validate data, gate against the champion, canary.</p></div>
  <div class="callout trap"><span class="label">Trap: mistaking a bug for drift</span><p>A unit change upstream looks like drift. Check the pipeline before retraining.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="ml-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful predicts delivery minutes from <code>distance_km</code>, <code>items</code>, <code>rain</code> (0/1) and <code>restaurant</code> (4 kitchens). 2,000 orders: baseline "always the average" MAE 8.45, random forest (100 trees, depth 8, seed 42) MAE 2.44, R² 0.913. Six Monday orders (23, 55, 14, 36, 47, 43 min): mean 36.3, baseline MAE 72.0/6 = 12.0, model MAE 8.0/6 = 1.33. Week-2 export: 2,200 rows, 2 broken → 2,198 clean → MAE 2.654, R² 0.901.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Notebook problem</td><td>why can't others rebuild it?</td><td>2.44 → 2.60 / 2.45 / 2.49 / 2.80</td><td>need the full map</td></tr>
    <tr><td>Lifecycle loop</td><td>what happens after training?</td><td>7 stages, retrain loops back</td><td>why harder than software?</td></tr>
    <tr><td>Hidden debt</td><td>what breaks in production?</td><td>metres → 61.6 instead of 53.2, silently</td><td>pin every input: code first</td></tr>
    <tr><td>Git</td><td>which code?</td><td>SHA c7285f6; branch depth 12 lost (2.632)</td><td>data is not in Git</td></tr>
    <tr><td>DVC</td><td>which data, what reruns?</td><td>2,001 ↔ 2,201 lines; repro skips unchanged</td><td>settings hard-coded</td></tr>
    <tr><td>Hydra + Pydantic</td><td>which settings, valid?</td><td>depth 4/8/12 sweep; max_dept refused; 3 row errors</td><td>project grows messy</td></tr>
    <tr><td>Layout + pre-commit</td><td>where things live; stop bad commits?</td><td>3,127 KB model blocked</td><td>world changes after launch</td></tr>
    <tr><td>Drift</td><td>why does a correct model go wrong?</td><td>rainy 0.26→0.70, MAE 4.87; +6 min → 5.87</td><td>when to act?</td></tr>
    <tr><td>Retraining triggers</td><td>when to train again?</td><td>week 5: 3.8 &gt; 3.5</td><td>how automated?</td></tr>
    <tr><td>Maturity</td><td>how far along are we?</td><td>0 manual → 1 CT → 2 CI/CD</td><td>who does what?</td></tr>
    <tr><td>Roles</td><td>who owns what, what is handed over?</td><td>registry entry as contract</td><td>→ MLflow note</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <ul>
    <li><strong>MAE</strong> = (1/n) Σ |yᵢ − ŷᵢ|: n orders, yᵢ the real minutes, ŷᵢ the prediction; "average minutes off". <strong>R²</strong> = 1 − Σ(yᵢ − ŷᵢ)² / Σ(yᵢ − ȳ)²: share of variation explained (ȳ = mean).</li>
    <li><strong>ML lifecycle</strong>: data → experiment → train → evaluate → deploy → monitor → retrain. <strong>MLOps</strong>: the habits and tools that run it. <strong>CT</strong>: continuous training.</li>
    <li><strong>Reproducible</strong>: rebuildable from code SHA + data hash + config + environment + seed.</li>
    <li><strong>Hidden technical debt</strong>: the costly system around the model (CACE, glue code, pipeline jungles, undeclared consumers, config debt, feedback loops). <strong>Training/serving skew</strong>: features built differently in training and serving.</li>
    <li><strong>DVC</strong>: <code>dvc init</code>, <code>add</code> (writes <code>.dvc</code> with md5 + size, gitignores the file), <code>remote add -d</code>, <code>push</code>/<code>pull</code>, <code>status</code>, <code>checkout</code>; <code>dvc.yaml</code> stages (cmd, deps, outs, metrics), <code>dvc repro</code>, <code>dvc.lock</code>, <code>dvc dag</code>, <code>dvc metrics show</code>, run-cache.</li>
    <li><strong>Hydra</strong>: <code>@hydra.main(config_path, config_name, version_base=None)</code>; override <code>key.sub=value</code>; new key needs <code>+key=value</code>; <code>--multirun a=1,2,3</code>; saves <code>outputs/…/.hydra/</code>.</li>
    <li><strong>Pydantic</strong>: <code>BaseModel</code>, <code>Field(gt, ge, le)</code>, <code>Literal[...]</code>, <code>ConfigDict(extra="forbid")</code>, <code>ValidationError.errors()</code>.</li>
    <li><strong>pre-commit</strong>: <code>.pre-commit-config.yaml</code> (repos → rev → hooks), <code>pre-commit install</code>; hooks: check-added-large-files, check-yaml, end-of-file-fixer, ruff.</li>
    <li><strong>Drift</strong>: data drift P(X), concept drift P(y|X), model drift = performance drop; detect with PSI/KS (inputs), live metrics (labels).</li>
    <li><strong>Maturity</strong>: 0 manual, 1 automated training pipeline + registry + monitoring, 2 CI/CD for the pipeline.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>DVC</b><p>Data that changes or is too big for Git; multi-step pipelines.</p><small>Tables in a warehouse with built-in time travel may use snapshots instead</small></div>
    <div><b>Hydra</b><p>Any training code with settings you vary or sweep.</p><small>Overkill for a 20-line one-off script</small></div>
    <div><b>Pydantic</b><p>Configs, API requests, row-level data checks.</p><small>Whole-table statistics need data-validation tools (CI/CD note)</small></div>
    <div><b>pre-commit</b><p>Every shared repo, from the first commit.</p><small>Not a replacement for CI</small></div>
    <div><b>Scheduled retrain</b><p>Stable domains, cheap training.</p><small>Pair with a metric trigger</small></div>
    <div><b>Metric trigger</b><p>When labels arrive quickly (delivery minutes: within an hour).</p><small>Use drift proxies when labels are slow</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>No seed / no snapshot; features coded twice (metres vs km); data or models in Git; forgetting <code>dvc push</code>; lenient configs that ignore typos; deployment treated as the end; auto-deploy without a gate; calling a pipeline bug "drift".</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Baseline MAE on the six Monday orders?</td><td>Mean 36.3; errors sum to 72.0; 72.0 / 6 = 12.0 minutes</td></tr>
    <tr><td>What does Git store for a DVC-tracked file?</td><td>A small <code>.dvc</code> file with md5, size and path; the bytes go to the cache and remote</td></tr>
    <tr><td>Why did the second <code>dvc repro</code> do nothing?</td><td>All input hashes matched <code>dvc.lock</code>, so every stage was skipped</td></tr>
    <tr><td>The traffic plan adds 6 minutes but inputs don't change. Which drift?</td><td>Concept drift: P(y|X) changed; only labels reveal it (2.44 → 5.87)</td></tr>
    <tr><td>Level 1 vs level 2 maturity?</td><td>Level 1 automates training (CT); level 2 also tests and deploys the pipeline code with CI/CD</td></tr>
  </table>

  <h2 id="ml-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one or two lines, what is the ML lifecycle?</summary><div class="qa-body">The repeating loop a model lives in: data → experiment → train → evaluate → deploy → monitor → retrain, and back to data. It never ends, because the world keeps changing and the model must be checked and refreshed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your colleague retrained with the same code and got a different MAE. List the likely causes.</summary><div class="qa-body">Unset random seeds (split, tree randomness); different data (the export grew, as 2,000 → 2,200 rows did); different settings; different library versions; GPU non-determinism or thread counts. Fix: seed in config, DVC-versioned data, strict config files, a locked environment or Docker image, and record all of it with the run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does ML need MLOps rather than plain DevOps?</summary><div class="qa-body">Behaviour depends on data, settings and trained weights, not just code. So you must version data and models, test data and model quality, monitor for silent degradation (no crash when predictions get worse) and retrain continuously (CT). Ordinary software doesn't decay when the world changes; models do.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is training/serving skew? Give an example.</summary><div class="qa-body">Features computed differently at training and prediction time. Biteful's model learnt km; app code sent metres, so a 5.5 km order got 61.6 minutes instead of 53.2 with no error. Fix: one shared feature function, schema checks at the API door, and a test comparing training and serving outputs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does DVC store in Git, and where does the data go?</summary><div class="qa-body">Git stores a small <code>.dvc</code> file with the data's md5 hash, size and path (and <code>dvc.lock</code> for pipeline stages). The bytes go to the DVC cache and a remote (S3, GCS, Azure, SSH, a folder) via <code>dvc push</code>. <code>git checkout &lt;rev&gt; -- file.dvc</code> plus <code>dvc checkout</code> restores the matching data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>dvc repro</code> do that a shell script running every step does not?</summary><div class="qa-body">It compares the hashes of each stage's inputs with <code>dvc.lock</code> and reruns only stages whose inputs changed; it can restore previous outputs from the run-cache without recomputing; and it records the exact hashes, so the pipeline result is reproducible and auditable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hydra vs Pydantic: why use both?</summary><div class="qa-body">Hydra manages <em>where settings come from</em>: files, overrides, sweeps, and a saved copy per run; it rejects unknown keys. Pydantic checks <em>whether values are valid</em>: types, ranges, allowed values. Hydra alone accepts <code>max_depth=-3</code>; Pydantic alone doesn't give overrides and sweeps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Data drift vs concept drift: define each with an example.</summary><div class="qa-body">Data drift: P(X) changes, e.g. Biteful's rainy orders go from 26% to 70% and trips get longer. Concept drift: P(y|X) changes, e.g. a traffic plan adds 6 minutes to the same trip. Data drift is visible without labels; concept drift needs labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a model's accuracy drop with no data drift at all?</summary><div class="qa-body">Yes: concept drift (the traffic plan raised MAE from 2.44 to 5.87 with identical inputs), or a silent upstream bug that keeps distributions similar but breaks meaning. That's why you monitor live metrics, not only input statistics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't a retraining pipeline auto-deploy every new model?</summary><div class="qa-body">Fresh data can be corrupt, mislabelled or biased, and a worse model would ship silently. Gate it: validate the data, compare to the champion on a fixed holdout and key slices, register, then canary with a rollback path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does DVC need Git, and what breaks if you use DVC without committing?</summary><div class="qa-body">DVC's pointer files and <code>dvc.lock</code> are the record of which data and outputs belong to which code; Git is what versions those pointers. Without the commit, the bytes exist in the remote but nothing says which code version they belong to, so "which data trained model X?" is again unanswerable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does pinning the config matter if the code and data are already versioned?</summary><div class="qa-body">Same code + same data with depth 4 instead of 8 gives MAE 3.77 instead of 2.654. Settings are a third input; if they live only in a command someone typed, the model can't be rebuilt. Hydra saves them with every run and the config file is a DVC dependency, so changing it triggers a retrain.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the layout step and keep features in the notebook?</summary><div class="qa-body">The API server and tests need the feature code too; without a package they copy it, and copies drift apart: exactly how training/serving skew (metres vs km) is born. A <code>src/</code> package gives one importable <code>build_features</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What should a data scientist hand to an ML engineer?</summary><div class="qa-body">A registered model version with lineage: code SHA, data version, config, metrics (overall and per slice), input/output signature, dependencies and an example input, plus the training code as a runnable pipeline, not only a notebook.</div></details>
</main>
`
});
