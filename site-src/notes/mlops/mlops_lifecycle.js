// notes/mlops/mlops_lifecycle.js — The ML Lifecycle
Object.assign(TOPIC_CONTENT, {
  "mlops_lifecycle": `<main>
  <h1>The ML Lifecycle</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>The ML Lifecycle</span></div>
  <p class="lead">Training a model in a notebook is only the first step of its life. After that it has to answer real requests every day, stay correct while the world changes around it, and be rebuilt and improved by people who were not there when it was first trained. The whole journey, from collecting data to retraining a tired model, is called the <strong>ML lifecycle</strong>, and <strong>MLOps</strong> is the set of habits and tools that keep that journey safe and repeatable: versioning code, data and settings, keeping the project tidy, watching the live model and retraining it through a quality check. The running example for this note and the rest of the MLOps track is <strong>Biteful</strong>, a food-delivery app that predicts how many minutes an order will take from the trip distance, the number of items, whether it is raining and which restaurant cooks it. We will start with the model in a notebook, watch it fail to be reproducible, and then turn it step by step into a project anyone can rebuild. Every command and script on this page was really run (Python 3.13, scikit-learn 1.9, DVC 3.67, Hydra 1.3, Pydantic 2.13, pre-commit 4.7), and its output is pasted below it.</p>

  <h2 id="ml-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">The ML Lifecycle</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why it is hard</div>
        <ul>
          <li>A notebook score cannot be rebuilt without its data, settings, seed and environment</li>
          <li>A model's behaviour comes from code <b>and</b> data <b>and</b> settings</li>
          <li>Models fail silently: wrong answers, no crash</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li>data → experiment → train → evaluate → deploy → monitor → retrain</li>
          <li>Hidden technical debt: the glue around the model is the risk</li>
          <li>MLOps = DevOps + data + models + continuous training</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Versioning</div>
        <ul>
          <li><b>Git</b>: code, experiment branches, the commit SHA</li>
          <li><b>DVC</b>: data pointers in Git, bytes in a remote; <code>dvc repro</code> pipelines</li>
          <li><b>Hydra</b>: settings in YAML, overrides, sweeps; <b>Pydantic</b>: typed checks</li>
          <li><b>pre-commit</b> + <code>src/</code> layout keep the repo clean</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">After launch</div>
        <ul>
          <li>Data drift: inputs change; concept drift: the right answer changes</li>
          <li>Retrain on a schedule, a metric alarm, drift or an event</li>
          <li>Always through a gate: beat the baseline and the champion</li>
          <li>Maturity: 0 manual, 1 automated training, 2 CI/CD for the pipeline</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ml-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Notebook Problem</span><span class="rm-sub">a good score that nobody can rebuild</span></div></div>
      <div class="rm-item rm-done" data-target="ml-loop"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The ML Lifecycle Loop</span><span class="rm-sub">the seven stages a model lives through</span></div></div>
      <div class="rm-item rm-done" data-target="ml-debt"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Hidden Technical Debt</span><span class="rm-sub">why ML breaks in ways normal software does not</span></div></div>
      <div class="rm-item rm-done" data-target="ml-git"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Versioning Code with Git</span><span class="rm-sub">scripts, experiment branches, the commit SHA</span></div></div>
      <div class="rm-item rm-done" data-target="ml-dvc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Versioning Data with DVC</span><span class="rm-sub">a small pointer in Git, the bytes elsewhere</span></div></div>
      <div class="rm-item rm-done" data-target="ml-pipe"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">DVC Pipelines</span><span class="rm-sub">rerun only the steps whose inputs changed</span></div></div>
      <div class="rm-item rm-done" data-target="ml-hydra"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Configuration with Hydra</span><span class="rm-sub">settings out of the code, overrides and sweeps</span></div></div>
      <div class="rm-item rm-done" data-target="ml-pydantic"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Validation with Pydantic</span><span class="rm-sub">rejecting bad settings and bad rows</span></div></div>
      <div class="rm-item rm-done" data-target="ml-layout"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Project Layout &amp; Pre-commit</span><span class="rm-sub">where things live, checks before every commit</span></div></div>
      <div class="rm-item rm-done" data-target="ml-drift"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Drift</span><span class="rm-sub">why a correct model becomes wrong</span></div></div>
      <div class="rm-item rm-done" data-target="ml-retrain"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Retraining Triggers &amp; the Gate</span><span class="rm-sub">when to train again, and what may go live</span></div></div>
      <div class="rm-item rm-done" data-target="ml-mature"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Maturity Levels, Tools &amp; Roles</span><span class="rm-sub">how automated a team is, and who owns what</span></div></div>
      <div class="rm-item rm-done" data-target="ml-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">skew, lenient configs, forgotten pushes</span></div></div>
      <div class="rm-item rm-done" data-target="ml-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, commands, drift table</span></div></div>
      <div class="rm-item rm-done" data-target="ml-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what MLOps interviews ask about the lifecycle</span></div></div>
    </div>
  </div>

  <h2 id="ml-problem"><span class="num">01</span>The Notebook Problem</h2>
  <p>Asha is a data scientist at Biteful. Her task is a model that predicts delivery minutes, so that the app can show customers an honest arrival time. She opens a Jupyter notebook, loads past orders, trains a model, gets a good score and reports success. Two weeks later her manager wants the model inside the app, and her teammate Ravi wants to improve it. Neither of them can simply "use the notebook", and understanding why is the starting point of MLOps.</p>
  <p>First, the data. Biteful's warehouse exports past orders: for each order the trip distance in kilometres, the number of items, whether it was raining (1 or 0), the restaurant, and how many minutes the delivery really took. The script below is a stand-in for that export. It generates 2,000 realistic orders from a hidden rule (8 minutes of fixed overhead, about 3.2 minutes per km, 1.4 per item, extra time in rain, each kitchen's cooking time, plus random noise), so that every number on this page can be rerun exactly:</p>
  <div class="fx" data-lang="py"># make_orders.py — a stand-in for Biteful's warehouse export (2,000 past orders)
import os
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
os.makedirs("data", exist_ok=True)
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
  <p>Each row is one order; the first one was 5.2 km from Pizza Point, in the rain, and took 56.4 minutes. The average order takes 37.3 minutes. Now Asha's notebook does the standard steps from the ML track. It turns the restaurant name into numbers with <code>pd.get_dummies</code> (one 0/1 column per restaurant), keeps 25% of the orders aside as a test set, and compares a random forest against a <strong>baseline</strong>, which is a predictor so simple that any useful model must beat it: here, "always guess the average training time". The score is the <strong>MAE</strong> (mean absolute error), the average number of minutes a prediction is off by, and R², the share of the variation in delivery times that the model explains (1.0 would be perfect).</p>
  <div class="fx" data-lang="py"># the "notebook" model: train once, look at the score
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

df = pd.read_csv("data/orders.csv")
X = pd.get_dummies(df.drop(columns="minutes"), columns=["restaurant"])   # one column per restaurant
y = df["minutes"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

baseline = [y_tr.mean()] * len(y_te)                     # always guess the average
model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42).fit(X_tr, y_tr)
pred = model.predict(X_te)
print("baseline MAE:", round(mean_absolute_error(y_te, baseline), 2), "min")
print("forest   MAE:", round(mean_absolute_error(y_te, pred), 2), "min   R2:", round(r2_score(y_te, pred), 3))</div>
  <div class="fx" data-lang="text">baseline MAE: 8.45 min
forest   MAE: 2.44 min   R2: 0.913</div>
  <p>Guessing the average is off by 8.45 minutes per order; the forest is off by only 2.44, and it explains about 91% of the variation. That is a genuinely good model. To make those numbers feel concrete, here are six orders from one Monday lunch, small enough to check by hand. These six orders will follow us through the entire MLOps track: they become test cases in CI, requests to the API server and load on the Kubernetes cluster.</p>
  <div class="fx" data-lang="py"># Monday lunch: six real orders and the notebook model's guesses
# (monday is a DataFrame of the six orders; Xm is the same rows one-hot encoded like X)
monday["model"] = model.predict(Xm).round(1)
print(monday.to_string(index=False))
print("MAE of 'always the mean':", round((monday.minutes - monday.minutes.mean()).abs().mean(), 2),
      "  MAE of model:", round((monday.minutes - monday.model).abs().mean(), 2))</div>
  <div class="fx" data-lang="text"> distance_km  items  rain    restaurant  minutes  model
         2.0      2     0   Dosa Corner       23   22.0
         5.5      3     1 Biryani House       55   53.2
         1.2      1     0     Chai Stop       14   17.0
         3.8      4     0   Pizza Point       36   36.1
         6.0      2     1   Dosa Corner       47   48.9
         4.5      5     0 Biryani House       43   43.2
MAE of 'always the mean': 12.0   MAE of model: 1.33</div>
  <p>The mean of the six real times is (23 + 55 + 14 + 36 + 47 + 43) / 6 = 36.3 minutes. Always guessing 36.3 is off by 13.3, 18.7, 22.3, 0.3, 10.7 and 6.7 minutes, which sum to 72.0, so its MAE is 72.0 / 6 = 12.0. The model's errors are 1.0, 1.8, 3.0, 0.1, 1.9 and 0.2, which sum to 8.0, giving an MAE of 1.33. On these six orders the model is about nine times better than guessing.</p>
  <p>Now the problem. Two weeks later Ravi reruns "the same notebook". Asha never fixed the <strong>random seed</strong>, the number that controls every random choice (how the rows are split, which rows each tree sees), and in the meantime the warehouse export has grown to 2,200 rows, two of them broken by an app bug and a GPS glitch. Here is what Ravi gets:</p>
  <div class="fx" data-lang="py"># two weeks later a teammate re-runs "the notebook": no seed, and a fresh export
def notebook_run(data, seed):
    Xn = pd.get_dummies(data.drop(columns="minutes"), columns=["restaurant"])
    a, b, c, d = train_test_split(Xn, data["minutes"], test_size=0.25, random_state=seed)
    m = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=seed).fit(a, c)
    return round(mean_absolute_error(d, m.predict(b)), 2)

print("original, seed 42, 2000 rows:", notebook_run(df, 42))
print("rerun, no seed, same file   :", [notebook_run(df, None) for _ in range(3)])
week2 = pd.read_csv("../exports/orders_2200.csv")
print("rerun, no seed, new export  :", notebook_run(week2, None), f"({len(week2)} rows)")</div>
  <div class="fx" data-lang="text">original, seed 42, 2000 rows: 2.44
rerun, no seed, same file   : [2.73, 2.53, 2.52]
rerun, no seed, new export  : 2.48 (2200 rows)</div>
  <p>The same code produced 2.44, then three different numbers on the very same file, then yet another on the new export. Which one is "the model"? Nobody can say, because the notebook never recorded what produced its number. Several ingredients went into Asha's 2.44, and none of them were written down: the exact data file, the random seed, the settings (100 trees? depth 8 or 12? Ravi has to read cell 14 to find out), the order in which cells were run (a notebook lets you run cell 9 before cell 4, and a deleted cell can still have changed the memory), and the library versions on her laptop. Without them, 2.44 is an anecdote rather than a fact, and a "small improvement" next week could be pure luck: the reruns above differ from each other by about as much as many real improvements.</p>
  <p>Think of a home cook who makes a wonderful biryani without writing anything down. Asked to make it again for a wedding of five hundred guests, they cannot: they do not know exactly how much of each spice went in, which rice they used, or how long it cooked. A restaurant kitchen works from written recipes with exact quantities so that any cook can make the same dish on any day. A model is <strong>reproducible</strong> when anyone can rebuild exactly the same model later from recorded inputs: the code version, the data version, the settings including the seed, and the software environment. Making Biteful's model reproducible, and keeping it healthy once it is live, is what the rest of this note is about.</p>

  <h2 id="ml-loop"><span class="num">02</span>The ML Lifecycle Loop</h2>
  <p>Biteful wants the model inside the app. That raises a string of questions that the notebook never had to answer. Who runs the model on thousands of new orders every day? What happens when the city grows and the orders look different from last year's? How would anyone notice if the model slowly became wrong? How do we replace it with a better one without breaking the app? Answering these questions is most of the work in a real ML job; building the model in the notebook is perhaps a tenth of it.</p>
  <p>The <strong>ML lifecycle</strong> is the full set of stages a model passes through: collecting and versioning data, experimenting, training, evaluating, deploying, monitoring, and retraining, after which the loop starts again. The important word is "loop". A useful analogy is that a model is a car, not a painting. A painting is finished once it hangs on the wall. A car needs fuel (fresh data), regular servicing (retraining) and a dashboard (monitoring) for as long as it is on the road, and the day you stop maintaining it is the day it starts to break down.</p>
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
  </svg><figcaption>The seven stages. The dashed arrow sends a tired model back to the start with fresh data.</figcaption></figure>
  <p>Follow the figure clockwise from the top left. Data is collected and frozen as a named version. Experiments try features and model types. Training turns the chosen recipe into a model file, which is an example of an <strong>artifact</strong>, meaning any file a step produces (a cleaned dataset, a model, a metrics report). Evaluation compares the new model with the baseline and with the model currently live; only if it passes this check, called the <strong>gate</strong>, does it move down to deployment, where the app can call it. Monitoring then watches its answers every day. When monitoring sees the model getting worse, or simply when a scheduled date arrives, the dashed arrow fires and retraining sends us back to the start with newer data. Two more words are used constantly: the <strong>champion</strong> is the model that is live right now, and a <strong>candidate</strong> (or challenger) is a new model hoping to replace it.</p>
  <p>The table walks the same stages through the Biteful project and names the thing each stage hands to the next. Most of the tools in the last column get their own note later in the track.</p>
  <table class="tbl">
    <tr><th>Stage</th><th>At Biteful</th><th>What it hands on</th><th>Typical tools</th></tr>
    <tr><td>Data collection &amp; versioning</td><td>Export past orders; freeze the 2,200-row file as "data v2"</td><td>A dataset with an ID (a hash)</td><td>SQL, Airflow, DVC, Delta Lake</td></tr>
    <tr><td>Experimentation</td><td>Try depth 4, 8, 12; forest vs boosting; a rain × distance feature</td><td>Chosen features, model type, settings</td><td>Notebooks, MLflow, Optuna</td></tr>
    <tr><td>Training</td><td><code>python train.py</code>, a script rather than a notebook</td><td>A model artifact and its metrics</td><td>DVC pipelines, GPUs, training jobs</td></tr>
    <tr><td>Evaluation</td><td>Candidate vs baseline 8.45 and the live champion</td><td>Metrics and a pass/fail decision</td><td>Holdout sets, slice metrics</td></tr>
    <tr><td>Deployment</td><td>The app sends an order to an API and shows "ETA 53 min"</td><td>A model behind an API or a batch job</td><td>Model registry, Docker, Kubernetes</td></tr>
    <tr><td>Monitoring</td><td>A dashboard compares predicted and real minutes daily</td><td>Alerts on errors, latency, drift, MAE</td><td>Prometheus, Grafana, Evidently</td></tr>
    <tr><td>Retraining</td><td>During the monsoon the live MAE climbs; train again</td><td>A new candidate, back to evaluation</td><td>Scheduled or triggered pipelines</td></tr>
  </table>
  <p>The most common misunderstanding about this loop, and a favourite interview probe, is the belief that the job ends at deployment. A model that nobody watches gets worse without producing a single error message, so the right half of the figure (monitoring and retraining) matters as much as the left. When an interviewer asks "how would you take this model to production?", they are asking you to walk around this whole loop.</p>

  <h2 id="ml-debt"><span class="num">03</span>Hidden Technical Debt</h2>
  <p>The loop looks like an ordinary software release cycle, so it is fair to ask why normal software habits are not enough. Ordinary software teams follow <strong>DevOps</strong> practices: code lives in Git, a machine tests every change automatically, and changes that pass are released automatically. That automatic test-and-release line is called <strong>CI/CD</strong>, short for continuous integration (every change is tested) and continuous delivery (every change that passes can be shipped). For a calculator app this is enough, because a calculator's behaviour changes only when someone changes its code: once 2 + 2 = 4 is correct, it stays correct forever.</p>
  <p>A model breaks that promise. Its behaviour comes from three things: the code, the data it was trained on, and the settings used to train it. Run the same training script on January's orders and on June's orders and you get two different models, although nobody touched a line of code. So an ML system has three things that change, and each one needs its own version history: the code (Git, section 04), the data (DVC, sections 05 and 06) and the settings and resulting model (configuration files in sections 07 and 08, and a model registry in the MLflow note).</p>
  <p>The second difference is how things fail. Broken ordinary software usually fails loudly: it crashes or returns an error. A broken model keeps returning answers, they are simply wrong. Here is a realistic example. Months after launch, a different engineer writes the app code that calls the model, and the app happens to measure distance in metres, not kilometres. Take Monday order 2, a 5.5 km trip:</p>
  <div class="fx" data-lang="py"># serving code written later by another engineer: the app sends distance in METRES
order = Xm.iloc[[1]].copy()                     # Monday order 2: 5.5 km, 3 items, rain, Biryani House
print("sent as 5.5 km  -&gt;", model.predict(order).round(1))
order["distance_km"] = 5500                     # same trip, wrong unit
print("sent as 5500 m  -&gt;", model.predict(order).round(1), " (no error, no warning)")</div>
  <div class="fx" data-lang="text">sent as 5.5 km  -&gt; [53.2]
sent as 5500 m  -&gt; [61.6]  (no error, no warning)</div>
  <p>The model learnt from distances between 0.5 and 8 km and has never seen a value like 5,500. A random forest cannot extrapolate beyond the values it was trained on, so it simply answers with its "farthest trip" leaves: 61.6 minutes instead of 53.2. There is no crash and no warning. Every order gets a wrong ETA, customers complain for weeks, and nobody connects the complaints to a unit change in someone else's code. This is a <strong>silent failure</strong>, and this particular kind, where features are computed one way during training and another way when the model is serving real requests, is called <strong>training/serving skew</strong>.</p>
  <p>In 2015 a group of Google engineers published a paper called "Hidden Technical Debt in Machine Learning Systems" that put this into a single picture. <strong>Technical debt</strong> means shortcuts that are cheap today and expensive later, like a loan that keeps collecting interest. The paper's point was that in a real ML system the model code is a tiny box, and almost all the risk lives in the much larger system around it.</p>
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
  </svg><figcaption>The model (green) is the small part. Every surrounding box is code or process that can drift out of step with it.</figcaption></figure>
  <p>Look at the figure as Biteful's system. The green box in the middle is the forest we trained in the notebook. Above it sit the warehouse export, the checks that should catch a −1 minute delivery or a 120 km trip, the code that turns kilometres and restaurant names into model columns, and the settings file. Below it sit the server that answers the app, the dashboards, the processes for releasing and rolling back, and the machines it all runs on. The metres bug lived in the "feature extraction" box on the serving side, not in the model. The paper named several recurring kinds of ML debt, and each one has a counterpart in our project:</p>
  <table class="tbl">
    <tr><th>Kind of ML debt</th><th>Plain meaning</th><th>At Biteful</th><th>Paid down by</th></tr>
    <tr><td>CACE ("changing anything changes everything")</td><td>Inputs are entangled, so changing one feature, its unit or the data mix shifts every prediction</td><td>Metres instead of km: 61.6 instead of 53.2</td><td>Shared feature code, schemas (08), tests</td></tr>
    <tr><td>Glue code</td><td>Most code only moves data in and out of the model</td><td>Five scripts reshape exports before training</td><td>Pipelines and a clean layout (06, 09)</td></tr>
    <tr><td>Pipeline jungles</td><td>Data preparation grows into a tangle nobody can rerun</td><td>Prep steps scattered over notebook cells</td><td><code>dvc.yaml</code> stages (06)</td></tr>
    <tr><td>Undeclared consumers</td><td>Other teams silently depend on your outputs</td><td>Marketing reads the ETA column for promotions</td><td>A registry with owners and contracts</td></tr>
    <tr><td>Configuration debt</td><td>Settings spread across code, flags and notebooks</td><td>Depth 8 hard-coded in cell 14</td><td>Hydra and Pydantic (07, 08)</td></tr>
    <tr><td>Feedback loops</td><td>The model's outputs change its own future training data</td><td>Short ETAs make riders rush, so future data looks faster</td><td>Monitoring and careful retraining (10, 11)</td></tr>
  </table>
  <p>This is why the field has its own name. <strong>MLOps</strong> takes everything from DevOps and adds what models need: versioned data and models, tests of data quality and model quality, monitoring for silent decay, and <strong>continuous training</strong> (CT), meaning a pipeline that retrains the model on new data automatically, the way CI tests code automatically. <strong>DataOps</strong> is the neighbouring discipline for data pipelines and warehouse tables. The differences are easiest to see side by side:</p>
  <table class="tbl">
    <tr><th></th><th>DevOps</th><th>DataOps</th><th>MLOps</th></tr>
    <tr><td>Main product</td><td>Application code</td><td>Data pipelines and tables</td><td>Models in production</td></tr>
    <tr><td>Behaviour set by</td><td>Code</td><td>Code + source data</td><td>Code + data + settings + trained weights</td></tr>
    <tr><td>Tests</td><td>Unit, integration</td><td>Data quality, freshness, schema</td><td>All of those + model quality and slices</td></tr>
    <tr><td>Typical failure</td><td>Crash or error (loud)</td><td>Late or wrong tables</td><td>Silently worse predictions (quiet)</td></tr>
    <tr><td>After release</td><td>Correct until code changes</td><td>Correct while sources behave</td><td>Decays as the world drifts</td></tr>
    <tr><td>Automation</td><td>CI/CD</td><td>Orchestrated ETL (<a class="xref" data-note="de_etl">Airflow</a>)</td><td>CI/CD + CT</td></tr>
  </table>
  <p>The practical lesson is that "same code, so same model" is false. To rebuild a model you must pin down every one of its inputs, and the next five sections do exactly that, starting with the easiest one, the code.</p>

  <h2 id="ml-git"><span class="num">04</span>Versioning Code with Git</h2>
  <p>Asha's notebook has forty cells, some run twice and some deleted, and Ravi wants to try deeper trees without breaking the version that works. Two things are needed: a precise record of which code made a model, and a safe place to try ideas. <a class="xref" data-note="se_git">Git</a> provides both; this section shows how ML teams use it.</p>
  <p>The first step is to turn the notebook into plain scripts that run from top to bottom, because a script can be run by a machine, reviewed line by line and versioned, while a notebook's hidden cell order cannot. Biteful's notebook becomes two scripts. <code>prepare.py</code> drops impossible rows (negative times, absurd distances) and writes a clean file:</p>
  <div class="fx" data-lang="py"># prepare.py — drop impossible rows, write data/clean.csv
import pandas as pd

df = pd.read_csv("data/orders.csv")
ok = df["minutes"].gt(0) &amp; df["distance_km"].between(0.1, 30) &amp; df["items"].between(1, 50)
df[ok].to_csv("data/clean.csv", index=False)
print(f"kept {ok.sum()} of {len(df)} rows")</div>
  <p><code>train.py</code> builds the features, trains the forest, saves the model to <code>models/model.joblib</code> and writes the scores to <code>metrics.json</code>:</p>
  <div class="fx" data-lang="py"># train.py — the notebook as a script (version 1: settings written inside the code)
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
  <p>One detail matters a great deal later. <code>build_features</code> uses a fixed list of restaurants instead of <code>pd.get_dummies</code>. <code>get_dummies</code> creates columns only for the restaurants that appear in the data it is given, so for a single live order from one restaurant it would produce one restaurant column instead of four, and the model would reject it (the Common Mistakes section shows the error). A fixed list produces the same seven columns in training and in serving, which is a first small repayment of the skew debt from section 03.</p>
  <p>Now the Git session. It creates a repository, commits the two scripts (but deliberately not the data), runs them, and then tries Ravi's idea on a <strong>branch</strong>, which is a separate line of commits that leaves <code>main</code> untouched. The outputs of the two scripts appear inside the session:</p>
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
* 4d5fad0 (exp/deeper-trees) try max_depth=12
* 2413c87 (HEAD -&gt; main) notebook split into prepare.py and train.py
$ git rev-parse --short HEAD
2413c87</div>
  <p>Read it from the top. <code>git status --short</code> shows <code>?? data/</code>: the data folder is untracked, on purpose, and section 05 explains why and what to do instead. On <code>main</code> the scripts kept all 2,000 rows and trained a forest with MAE 2.443 and R² 0.913, exactly the notebook's numbers, but now from code anyone can run. On the branch <code>exp/deeper-trees</code>, depth 12 gives MAE 2.632, which is worse, so the branch is simply never merged. The graph shows both lines of history side by side. Finally <code>git rev-parse --short HEAD</code> prints the <strong>short SHA</strong> of the current commit. A commit SHA is a hash (a fingerprint computed from the content) that identifies one exact snapshot of the code; the first seven characters are enough to name it. From now on, every model should record the SHA it was trained from, so "which code made this model?" always has an answer.</p>
  <p>Think of a recipe book with pencil draft pages. You try "extra chilli" on a draft page (a branch). If the dish is better, you copy the change into the book (a merge); if not, you tear the page out. And the page number of the recipe you cooked (the SHA) is written on every tiffin you send out, so a complaint can always be traced to the exact recipe.</p>
  <p>Teams also choose a branching style, and interviewers like to ask which one suits ML. In <strong>trunk-based development</strong>, everyone merges small changes into <code>main</code> at least daily and branches live for hours or days; it needs good automated tests but keeps everyone close to the latest code. In <strong>Gitflow</strong>, long-lived branches such as <code>develop</code>, <code>release/*</code> and <code>hotfix/*</code> surround <code>main</code>; it suits products with scheduled, numbered releases (mobile apps, libraries) but long branches drift apart and merges become painful. Most ML teams today work trunk-based, with one extra habit: experiments live on short branches like <code>exp/deeper-trees</code>, and the <em>result</em> of each experiment is recorded in an experiment tracker (the <a class="xref" data-note="mlops_mlflow">MLflow note</a>) even when the branch is thrown away, so failed ideas are not tried twice.</p>
  <p>Two rules follow from this section. Train only from committed code: if <code>train.py</code> had uncommitted edits when the model was trained, the SHA you record does not describe the code that actually ran, which is why automated pipelines train only from commits. And never put data or model files into Git, which brings us to the next problem.</p>

  <h2 id="ml-dvc"><span class="num">05</span>Versioning Data with DVC</h2>
  <p>Git now pins the code, but the data is untracked, and the data is exactly what changed between Asha's 2.44 and Ravi's reruns. Why not just commit it? Because Git is built for small text files. Put a 50 GB file in it and every clone downloads all 50 GB, every new version is stored again in full, and services like GitHub refuse files over 100 MB. Yet we still need to know <em>which exact data</em> trained each model, and to get that data back months later.</p>
  <p>The solution is to let Git store a tiny note that names the data precisely, and keep the heavy bytes somewhere cheap. That is what <strong>DVC</strong> (Data Version Control) does. For each tracked file it writes a small pointer file ending in <code>.dvc</code>, which you commit to Git, and it copies the real bytes into a cache and, when you ask, into a <strong>remote</strong>: a storage location such as an S3 or GCS bucket or simply a shared folder. The pointer contains the file's <strong>md5 hash</strong>, a 32-character fingerprint that changes completely if even one byte of the file changes, so it identifies the data exactly.</p>
  <p>The cloakroom at a wedding hall works the same way. You hand over your heavy bag and receive a small numbered token. You carry only the token; it names exactly one bag, and handing it back gets you that bag. The <code>.dvc</code> file is the token, Git is your pocket, and the remote is the cloakroom.</p>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <defs><marker id="ml-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="140" height="50" rx="6" class="fs" stroke="currentColor"/><text x="80" y="62" text-anchor="middle">orders.csv</text><text x="80" y="78" text-anchor="middle" class="tm" font-size="11">50 KB … 50 GB</text>
    <rect x="220" y="10" width="140" height="44" rx="6" class="fb sb"/><text x="290" y="30" text-anchor="middle">orders.csv.dvc</text><text x="290" y="46" text-anchor="middle" class="tm" font-size="11">md5 + size → Git</text>
    <rect x="220" y="78" width="140" height="44" rx="6" class="ft st"/><text x="290" y="98" text-anchor="middle">cache / remote</text><text x="290" y="114" text-anchor="middle" class="tm" font-size="11">actual bytes → S3</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ml-ar2)"><line x1="150" y1="58" x2="218" y2="34"/><line x1="150" y1="72" x2="218" y2="98"/></g>
    <rect x="420" y="40" width="130" height="50" rx="6" class="fg sg"/><text x="485" y="62" text-anchor="middle">git commit</text><text x="485" y="78" text-anchor="middle" class="tm" font-size="11">code + data pointer</text>
    <line x1="360" y1="32" x2="418" y2="58" stroke="currentColor" marker-end="url(#ml-ar2)"/>
  </svg><figcaption>dvc add splits one file into a small pointer (committed with the code) and the bytes (kept in the cache and pushed to a remote).</figcaption></figure>
  <p>The figure shows the split. On the left is the real file, which may be tiny or enormous. <code>dvc add</code> sends its bytes down to the cache and remote, and writes the pointer at the top, a few lines of text with the hash and size. Only the pointer travels into the Git commit, together with the code. Later, checking out an old commit gives you the old pointer, and DVC uses the hash on it to fetch the matching bytes. Here is the real session, in the same repository, in five steps: (1) <code>dvc add</code> fingerprints the file, writes the pointer and tells Git to ignore the big file; (2) <code>git commit</code> saves the pointer as "data v1"; (3) <code>dvc push</code> uploads the bytes to the remote (a folder next to the project here; <code>s3://bucket/dvc</code> in a company); (4) the week-2 export arrives and <code>dvc status</code> notices the change; (5) time travel back to v1 and forward again.</p>
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
# week 2: the warehouse export now has 2,200 rows
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
c4291c6 data v2: 2200 orders
ca77328 data v1: 2000 orders
2413c87 notebook split into prepare.py and train.py
# time travel: take the old pointer from Git, then let DVC fetch the matching bytes
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
  <p>Check the evidence. The pointer file says md5 <code>6828…</code> and a size of 50,001 bytes, and <code>data/.gitignore</code> now lists <code>/orders.csv</code>, so Git will never accidentally commit the big file. When the 2,200-row export replaced the file, <code>dvc status</code> reported it as modified, because the file's hash no longer matched the pointer. After <code>dvc add</code>, a commit and a push, Git history has two data versions. The last six commands are the important ones: taking the pointer from the previous commit and running <code>dvc checkout</code> turned the working file back into the original (2,001 lines: a header plus 2,000 orders), byte for byte, and taking the current pointer brought back the 2,201-line version. "Which data trained the model with MAE 2.44?" is now answered by a Git commit, and the answer can be restored on any machine that can reach the remote.</p>
  <p>DVC is not the only way to version data. Warehouse tables in formats like Delta Lake or Iceberg have built-in "time travel" to old snapshots, and tools like lakeFS add Git-like branches on top of object storage. What all of them share is the idea that matters: a training run must record an exact, restorable identifier for its data, never just "the orders table".</p>

  <h2 id="ml-pipe"><span class="num">06</span>DVC Pipelines</h2>
  <p>Versioned data solves half of the data problem. The other half is keeping the steps in sync. When the data changes, <code>prepare.py</code> must run before <code>train.py</code>, and when only <code>train.py</code> changes, rerunning <code>prepare.py</code> is a waste. Doing this by hand ("did I rerun prepare before training?") is how the pipeline jungle from section 03 grows. DVC lets you write the steps down once, in a file called <code>dvc.yaml</code>, as <strong>stages</strong>. Each stage names its command, its inputs (<code>deps</code>, short for dependencies) and its outputs (<code>outs</code>):</p>
  <div class="fx" data-lang="text"># dvc.yaml — the pipeline: each stage has a command, its inputs (deps) and outputs (outs)
stages:
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
  <p>The <code>train</code> stage depends on <code>data/clean.csv</code>, which is an output of <code>prepare</code>, so DVC knows the order: prepare first, then train. <code>metrics.json</code> is marked as a metrics file, kept in Git rather than in the cache (<code>cache: false</code>) because it is tiny and useful to read in a code review. The command that runs the pipeline is <code>dvc repro</code> (short for "reproduce"). For each stage it computes the hashes of the inputs and compares them with the hashes recorded after the last run, in a file called <code>dvc.lock</code>. If they match, the stage is skipped; if not, it runs. Think of a careful cook who checks, before each step of a recipe, whether the ingredients for that step have changed since the last time; if nothing changed, the step's result from last time is still good.</p>
  <div class="fx" data-lang="text">$ dvc repro
'data/orders.csv.dvc' didn't change, skipping
Running stage 'prepare':
&gt; python prepare.py
kept 2198 of 2200 rows
Generating lock file 'dvc.lock'
Updating lock file 'dvc.lock'

Running stage 'train':
&gt; python train.py
trained on 1648 rows -&gt; {'mae': 2.611, 'r2': 0.902}
Updating lock file 'dvc.lock'

To track the changes with git, run:

	git add models/.gitignore data/.gitignore dvc.lock

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
metrics.json  2.611  0.902
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
trained on 1648 rows -&gt; {'mae': 2.609, 'r2': 0.902}
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
  <p>Walk through the session. The first <code>dvc repro</code> ran both stages: <code>prepare</code> kept 2,198 of the 2,200 rows (the −1 minute order and the 120 km order are gone) and <code>train</code> gave MAE 2.611 on this new data. DVC then wrote <code>dvc.lock</code> with the hash of every input and output. The second <code>dvc repro</code> changed nothing, so every stage was skipped; DVC compares content hashes, not file timestamps, so merely touching a file does not trigger work. <code>dvc dag</code> draws the dependency graph (DAG stands for directed acyclic graph, a set of steps connected by one-way arrows with no loops), and <code>dvc metrics show</code> reads the scores from <code>metrics.json</code>.</p>
  <p>Next the session changed <code>train.py</code> to use 200 trees. <code>dvc status</code> named exactly what had changed, and <code>dvc repro</code> reran only <code>train</code>, skipping <code>prepare</code>. Finally the edit was undone. Instead of training again, DVC printed "Stage 'train' is cached - skipping run, checking out outputs": its <strong>run-cache</strong> remembered the outputs it had produced for that exact combination of input hashes, and simply restored them. On a pipeline whose training takes hours, this is the difference between switching back to an old setting instantly and waiting all afternoon.</p>
  <p>Put together, a single Git commit now pins the code, the data pointer and the <code>dvc.lock</code> that connects them, so rebuilding an old model is three commands: <code>git checkout &lt;old commit&gt;</code>, <code>dvc checkout</code> (or <code>dvc pull</code> on a new machine) and <code>dvc repro</code>. One discipline makes this work across a team: whenever you push code, also run <code>dvc push</code>, otherwise your teammates get pointers to bytes that exist only on your laptop. The Common Mistakes section shows exactly what that looks like. Pipelines that must run on a schedule across many machines usually move to an orchestrator such as Airflow or Prefect (<a class="xref" data-note="de_etl">ETL &amp; Orchestration</a>), but the idea is the same: steps with declared inputs and outputs.</p>

  <h2 id="ml-hydra"><span class="num">07</span>Configuration with Hydra</h2>
  <p>Code and data are pinned. The third input, the settings, is still written inside <code>train.py</code>: 100 trees, depth 8, seed 42, a test size of 0.25. Every time Ravi wants to try depth 4, he must edit the code, which creates a new code version for what is really just a different setting, mixes "logic" with "choices", and leaves no record of which settings each run used apart from the code history. <strong>Configuration</strong> means the settings of a run, and good practice is to keep them in a file of their own.</p>
  <p><strong>Hydra</strong> is a Python library that loads a run's settings from YAML files, lets you override any setting from the command line without editing a file, runs sweeps over several values with one command, and saves the exact settings used by every run next to its outputs. A washing machine is a good picture: the program dial holds the usual settings, you can turn a knob for one particular wash without opening the machine, and the machine remembers which program it ran. Here is Biteful's settings file:</p>
  <div class="fx" data-lang="text"># configs/config.yaml — every setting of a training run, in one place
data:
  path: data/clean.csv
  test_size: 0.25
model:
  n_estimators: 100
  max_depth: 8
seed: 42</div>
  <p>And the new <code>train.py</code>, which reads every setting from an object called <code>cfg</code> instead of hard-coding it. The decorator <code>@hydra.main(config_path="configs", config_name="config")</code> tells Hydra to load <code>configs/config.yaml</code>, apply any command-line overrides, and pass the result to <code>main</code> as <code>cfg</code>; <code>cfg.model.max_depth</code> then reads one value:</p>
  <div class="fx" data-lang="py"># train.py — version 2: every setting comes from configs/config.yaml through Hydra
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
  <p>Now several runs, each started from the command line:</p>
  <div class="fx" data-lang="text">$ python train.py
trees=100 depth=8 seed=42 -&gt; {'mae': 2.611, 'r2': 0.902}
$ python train.py model.max_depth=4 seed=1
trees=100 depth=4 seed=1 -&gt; {'mae': 3.659, 'r2': 0.8}
$ python train.py model.max_dept=4
Could not override 'model.max_dept'.
To append to your config use +model.max_dept=4
Key 'max_dept' is not in struct
    full_key: model.max_dept
    object_type=dict

Set the environment variable HYDRA_FULL_ERROR=1 for a complete stack trace.
$ python train.py --multirun model.max_depth=4,8,12
[2026-11-19 06:39:28,877][HYDRA] Launching 3 jobs locally
[2026-11-19 06:39:28,878][HYDRA] 	#0 : model.max_depth=4
trees=100 depth=4 seed=42 -&gt; {'mae': 3.708, 'r2': 0.808}
[2026-11-19 06:39:29,108][HYDRA] 	#1 : model.max_depth=8
trees=100 depth=8 seed=42 -&gt; {'mae': 2.611, 'r2': 0.902}
[2026-11-19 06:39:29,469][HYDRA] 	#2 : model.max_depth=12
trees=100 depth=12 seed=42 -&gt; {'mae': 2.71, 'r2': 0.892}
$ ls multirun/*/*/
0
1
2
multirun.yaml
$ tail -n +1 outputs/*/*/.hydra/overrides.yaml
==&gt; outputs/2026-11-19/06-39-22/.hydra/overrides.yaml &lt;==
[]

==&gt; outputs/2026-11-19/06-39-24/.hydra/overrides.yaml &lt;==
- model.max_depth=4
- seed=1</div>
  <p>Plain <code>python train.py</code> uses the file as written: depth 8, MAE 2.611, the same as the pipeline's result. <code>model.max_depth=4 seed=1</code> overrides two settings for one run without touching any file (MAE 3.659). The third command contains a typo, <code>max_dept</code>, and Hydra refuses it: its configs are "structs", meaning only keys that exist in the file may be set. Without that check the run would silently use depth 8 and Ravi would believe he had tested depth 4. If you really want to add a new key, Hydra asks you to say so explicitly with a <code>+</code> prefix.</p>
  <p><code>--multirun model.max_depth=4,8,12</code> is a <strong>sweep</strong>: one command, three runs, one per value. Depth 4 underfits (MAE 3.708), depth 8 is best (2.611), and depth 12 overfits slightly (2.71). Every single run also gets its own folder, under <code>outputs/</code> for normal runs and <code>multirun/</code> for sweeps, containing a <code>.hydra/</code> directory with the full config and the overrides that were used. The last command prints those override files: the first run had none, the second had depth 4 and seed 1. That is the "settings" part of a run's receipt, written automatically.</p>
  <p>Hydra can also compose configs from several files (for example <code>configs/model/forest.yaml</code> and <code>configs/model/boosting.yaml</code>, chosen with <code>model=boosting</code>), which is how larger projects keep many model families tidy. Its limit is that it checks key <em>names</em>, not <em>values</em>: <code>model.max_depth=-3</code> would be accepted and then crash deep inside scikit-learn, or worse, run. Checking values is the job of the next tool.</p>

  <h2 id="ml-pydantic"><span class="num">08</span>Validation with Pydantic</h2>
  <p>Two kinds of input reach a training or serving system from outside: settings, and data rows. Both can be wrong in ways that do not crash anything immediately. A config might say <code>n_estimators: many</code>, and an order might arrive with a distance of 120 km, a rain flag of 2, or a restaurant Biteful has never heard of, exactly like the broken GPS row that <code>prepare.py</code> had to drop. The safest place to catch such problems is at the door, before they reach the model.</p>
  <p><strong>Pydantic</strong> is a library for describing the expected shape of data as a Python class, with types, ranges and allowed values, and checking real data against it. If anything is wrong it raises a <code>ValidationError</code> that lists every problem at once. Think of a passport officer with a checklist: name present, date of birth a real date, photo the right size. The officer does not need to know why you are travelling; they only check that the document is valid before letting it through. Here the same tool describes Biteful's training settings and a single order row (the API server in the serving note reuses this <code>Order</code> class):</p>
  <div class="fx" data-lang="py"># schemas.py — a typed contract for the settings and for one order row
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

def problems(e):                                        # one (field, message) pair per error
    return [(err["loc"][0], err["msg"]) for err in e.errors()]

cfg = TrainCfg(**yaml.safe_load(open("configs/config.yaml")))
print("config ok:", cfg.model)
for bad in [{"n_estimators": "many", "max_depth": 8}, {"n_estimators": 100, "max_depth": -3, "lr": 0.1}]:
    try:
        ModelCfg(**bad)
    except ValidationError as e:
        print(e.error_count(), "error(s):", problems(e))

print(Order(distance_km=5.5, items=3, rain=1, restaurant="Biryani House"))
try:
    Order(distance_km=120, items=3, rain=2, restaurant="Momo Hut")
except ValidationError as e:
    print(e.error_count(), "error(s):", problems(e))</div>
  <div class="fx" data-lang="text">config ok: n_estimators=100 max_depth=8
1 error(s): [('n_estimators', 'Input should be a valid integer, unable to parse string as an integer')]
2 error(s): [('max_depth', 'Input should be greater than 0'), ('lr', 'Extra inputs are not permitted')]
distance_km=5.5 items=3 rain=1 restaurant='Biryani House'
3 error(s): [('distance_km', 'Input should be less than or equal to 30'), ('rain', 'Input should be 0 or 1'), ('restaurant', "Input should be 'Biryani House', 'Chai Stop', 'Dosa Corner' or 'Pizza Point'")]</div>
  <p>Read the class definitions first. <code>Field(gt=0, le=2000)</code> means "greater than 0 and at most 2000". <code>Literal[0, 1]</code> allows only those two values, and <code>Literal["Biryani House", …]</code> only the four known restaurants. <code>ConfigDict(extra="forbid")</code> turns unknown keys into errors instead of silently ignoring them. Then the results: the real config file passes. <code>n_estimators="many"</code> fails because it cannot become an integer. A config with <code>max_depth=-3</code> and an unknown key <code>lr</code> produces two errors, one for each problem. A good order passes and prints its values, and the broken GPS order produces three clear errors (distance over 30 km, rain not 0 or 1, unknown restaurant) instead of a silent 61-minute guess.</p>
  <p>Hydra and Pydantic therefore split the work. Hydra manages <em>where settings come from</em> (files, overrides, sweeps, a saved copy per run) and rejects unknown names; Pydantic checks <em>whether values are valid</em>. Many teams use both: Hydra loads the config, and a Pydantic model validates it at the start of training. Pydantic checks one object at a time; checking statistics of a whole table (for example "no more than 1% missing distances") is the job of data-validation tools like Great Expectations or Pandera, covered with CI/CD.</p>
  <p>One last step makes the config a first-class input. The pipeline must know that <code>configs/config.yaml</code> affects training, otherwise changing it would not trigger a rerun. We add it to the <code>train</code> stage's dependencies and commit everything:</p>
  <div class="fx" data-lang="text">$ sed -i 's#deps: \\[data/clean.csv, train.py\\]#deps: [data/clean.csv, train.py, configs/config.yaml]#' dvc.yaml
$ git diff dvc.yaml
diff --git a/dvc.yaml b/dvc.yaml
index 2f0e64c..91aaf96 100644
--- a/dvc.yaml
+++ b/dvc.yaml
@@ -6,7 +6,7 @@ stages:
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
trees=100 depth=8 seed=42 -&gt; {'mae': 2.611, 'r2': 0.902}
Updating lock file 'dvc.lock'

To track the changes with git, run:

	git add dvc.lock

To enable auto staging, run:

	dvc config core.autostage true
Use \`dvc push\` to send your updates to remote storage.
$ git add .gitignore configs train.py dvc.yaml dvc.lock metrics.json
$ git commit -qm "settings live in configs/config.yaml (Hydra)"
$ git rev-parse --short HEAD
fd8f0f9</div>
  <p><code>git diff</code> shows the single changed line, and <code>dvc repro</code> reran <code>train</code> because its list of dependencies changed. From now on, editing the config file reruns training, and the commit SHA printed at the end pins code, data pointer, pipeline and settings together. With that, the full recipe for "the same model" is complete:</p>
  <table class="tbl">
    <tr><th>Ingredient</th><th>Pinned by</th><th>Biteful value</th></tr>
    <tr><td>Code</td><td>Git commit SHA</td><td>the commit above</td></tr>
    <tr><td>Data</td><td><code>orders.csv.dvc</code> and <code>dvc.lock</code> (md5 hashes)</td><td>2,200-row export → 2,198 clean rows</td></tr>
    <tr><td>Settings</td><td><code>configs/config.yaml</code> + overrides saved by Hydra</td><td>100 trees, depth 8, test size 0.25</td></tr>
    <tr><td>Randomness</td><td><code>seed</code> in the config, passed to every <code>random_state</code></td><td>42</td></tr>
    <tr><td>Environment</td><td>exact package pins (<code>requirements.txt</code>, <code>uv.lock</code>) or a Docker image</td><td>scikit-learn 1.9.1, pandas 3.0.5</td></tr>
  </table>
  <p>The MLflow note automates writing this recipe down for every run and looks more closely at seeds and environments; <a class="xref" data-note="se_docker">Docker</a> is the usual way to freeze the environment.</p>

  <h2 id="ml-layout"><span class="num">09</span>Project Layout &amp; Pre-commit</h2>
  <p>The repository now holds scripts, a config, data pointers, a pipeline and outputs, and three more people are about to join. Tests will need to import <code>build_features</code>, the API server will need the very same function, and sooner or later someone will run <code>git add .</code> with a model file sitting in the folder. Two habits keep a growing project healthy: a predictable layout, and automatic checks before every commit.</p>
  <p>The common layout for an ML project is the <strong>src layout</strong>: the project's code lives in an installable Python package under <code>src/</code>, so the training script, the tests and the API server all import <em>one</em> <code>build_features</code> instead of each keeping a copy. Copies are how training/serving skew is born, so this single decision removes one of the biggest risks from section 03. Below is the shape the Biteful project grows into over the track (a layout, not command output):</p>
  <div class="fx" data-lang="text">biteful-eta/
├── configs/config.yaml        # Hydra settings (07)
├── data/orders.csv.dvc        # DVC pointer; bytes live in the remote (05)
├── dvc.yaml  dvc.lock         # pipeline stages and their hashes (06)
├── src/biteful_eta/
│   ├── features.py            # build_features: ONE copy for training and serving
│   ├── prepare.py  train.py   # pipeline steps
│   └── schemas.py             # Pydantic Order and config schemas (08)
├── tests/                     # unit, data and model tests (CI/CD note)
├── serve/app.py  Dockerfile   # the API server (serving note)
├── notebooks/                 # exploration only; nothing imports from here
├── pyproject.toml             # package metadata and pinned dependencies
├── .pre-commit-config.yaml    # checks that run before every commit
└── .gitignore</div>
  <p>The rules behind it are short. Notebooks are for exploring; scripts and packages produce models, because notebooks cannot be tested or scheduled reliably. The package is installed in editable mode (<code>pip install -e .</code>), so tests import the installed package rather than whatever file happens to sit in the current folder. Settings live in <code>configs/</code>, and data and models never live in Git (DVC pointers and a model registry take their place).</p>
  <p>The second habit is a guard at the commit. A <strong>Git hook</strong> is a script Git runs automatically at certain moments, such as just before a commit is recorded. The <strong>pre-commit</strong> tool manages these hooks from one YAML file: it downloads each checker into its own small environment, runs the checkers on the files being committed, and stops the commit if any of them fails. Airport security is the right picture: every bag goes through the scanner before the gate, and a bag with something forbidden is stopped there, not discovered on the plane. The plane, here, is Git history, where a mistake stays forever. Biteful's hooks:</p>
  <div class="fx" data-lang="text"># .pre-commit-config.yaml — checks that run on the staged files before every commit
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v6.0.0
    hooks:
      - id: check-added-large-files      # stop model files sneaking into Git
        args: ["--maxkb=500"]
      - id: check-yaml                   # configs/*.yaml and dvc.yaml must parse
      - id: end-of-file-fixer
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.17.5
    hooks:
      - id: ruff-check                   # lint; --fix removes unused imports etc.
        args: ["--fix"]</div>
  <p>The file lists two repositories of hooks, each pinned to an exact version (<code>rev</code>). <code>check-added-large-files</code> refuses any new file over 500 KB, <code>check-yaml</code> makes sure YAML files parse, <code>end-of-file-fixer</code> normalises file endings, and <code>ruff-check --fix</code> runs the Ruff linter, which finds problems such as unused imports and fixes what it safely can. Now someone tries to commit a model backup together with a small script that has an unused <code>import os</code>:</p>
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

model_backup.joblib (3089 KB) exceeds 500 KB.

check yaml...............................................................Passed
fix end of files.........................................................Passed
ruff check...............................................................Failed
- hook id: ruff-check
- files were modified by this hook

Found 1 error (1 fixed, 0 remaining).
$ git restore --staged model_backup.joblib &amp;&amp; rm model_backup.joblib
$ git add .pre-commit-config.yaml check_data.py
$ git commit -qm "add data checker"
check for added large files..............................................Passed
check yaml...............................................................Passed
fix end of files.........................................................Passed
ruff check...............................................................Passed
$ cat check_data.py
import pandas as pd

print(pd.read_csv("data/clean.csv").shape)
$ git log --oneline | head -3
5dbb988 add data checker
fd8f0f9 settings live in configs/config.yaml (Hydra)
6cfad54 pipeline: prepare -&gt; train</div>
  <p>The first commit attempt was stopped by two hooks. The large-file check refused <code>model_backup.joblib</code> because it is far over the 500 KB limit. Ruff found the unused import, removed it from the file, and still failed the commit, so that a human sees the change before it is recorded. The first run also printed "Initializing environment" lines: pre-commit downloaded each hook once and reuses it afterwards. After unstaging the model and adding the fixed script, all four hooks passed, and <code>cat</code> shows the script without the unused import.</p>
  <p>The large-file check matters more than it looks. A big file committed once stays in Git history even after you delete it, so every future clone downloads it, and removing it means rewriting history for the whole team. Blocking it before the commit is cheap; cleaning up afterwards is not. Hooks can be skipped with <code>git commit --no-verify</code>, which is why the same checks run again in CI, where they cannot be skipped. With layout and hooks in place, the project is rebuildable and tidy. But a perfectly reproducible model can still go wrong once it is live, because the world it predicts keeps changing.</p>

  <h2 id="ml-drift"><span class="num">10</span>Drift</h2>
  <p>The forest scored MAE 2.44 on last year's orders. A month after launch, Biteful expands into new suburbs farther from the restaurants, and the monsoon arrives. Nothing in the code or the model has changed. Can it still be right?</p>
  <p>Think of a kirana shop owner who knows his regular customers well and can guess what each will buy. Then a college opens nearby and most of his customers become students. His guesses start going wrong. He has not become worse at his job; the people in front of him are different from the ones he learnt from. A model is in the same position: it learnt patterns from past data, and when the present stops looking like the past, its answers get worse. This change between the data a model was trained on and the data it sees live is called <strong>drift</strong>. The simulation below creates a month of live orders from farther suburbs during the monsoon, using exactly the same delivery-time rule as before, and then a second scenario where a new one-way traffic plan adds six minutes to every trip:</p>
  <div class="fx" data-lang="py"># a month after launch: the city expanded to farther suburbs and the monsoon arrived
rng = np.random.default_rng(11)
n = 300
live = pd.DataFrame({"distance_km": rng.uniform(2.0, 12.0, n).round(1),        # new, farther suburbs
                     "items": rng.integers(1, 7, n),
                     "rain": (rng.random(n) &lt; 0.70).astype(int),               # monsoon
                     "restaurant": rng.choice(list(prep), n)})
true_minutes = (8 + 3.2*live.distance_km + 1.4*live["items"] + 7*live.rain + 0.8*live.rain*live.distance_km
                + live.restaurant.map(prep) + rng.normal(0, 3, n))             # same rule as training
print("mean distance  train:", round(df.distance_km.mean(), 2), " live:", round(live.distance_km.mean(), 2))
print("share rainy    train:", round(df.rain.mean(), 2), " live:", round(live.rain.mean(), 2))
print("share &gt; 8 km   train:", round((df.distance_km &gt; 8).mean(), 2), " live:", round((live.distance_km &gt; 8).mean(), 2))
Xl = pd.get_dummies(live, columns=["restaurant"]).reindex(columns=X.columns, fill_value=0)
print("live MAE once real minutes arrive:", round(mean_absolute_error(true_minutes, model.predict(Xl)), 2))

# concept drift: a new one-way traffic plan adds 6 minutes to EVERY trip; inputs look exactly like training
print("MAE on test orders before traffic plan:", round(mean_absolute_error(y_te, model.predict(X_te)), 2),
      " after:", round(mean_absolute_error(y_te + 6, model.predict(X_te)), 2))</div>
  <div class="fx" data-lang="text">mean distance  train: 4.25  live: 6.78
share rainy    train: 0.26  live: 0.7
share &gt; 8 km   train: 0.0  live: 0.36
live MAE once real minutes arrive: 4.87
MAE on test orders before traffic plan: 2.44  after: 5.87</div>
  <p>Read the first four lines. The average trip grew from 4.25 to 6.78 km, rainy orders went from 26% to 70%, and 36% of live trips are longer than 8 km, a range the model never saw in training at all. We could detect all of this without knowing a single real delivery time, simply by comparing the inputs with the training data. When the real minutes arrive, the live MAE is 4.87, double the 2.44 promised. The final line is a different kind of change. The inputs are exactly the test orders the model was evaluated on, so nothing about them has moved, but the traffic plan changed the right answer for every one of them, and the MAE jumps from 2.44 to 5.87.</p>
  <p>Those two lines are the two kinds of drift. <strong>Data drift</strong> (also called covariate shift) means the inputs look different: farther trips, more rain. <strong>Concept drift</strong> means the inputs look the same but the relationship between input and correct answer has changed: the same 5 km trip now takes longer. The visible result of either is <strong>model drift</strong> (or decay), a falling live score. Textbooks write this with probability notation: P(X) means "how the inputs are spread out", and P(y|X), read "y given X", means "for a given input, which answer is right". Data drift changes P(X); concept drift changes P(y|X).</p>
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
  </svg><figcaption>Left: the spread of inputs moved. Right: the inputs did not move, but the rule from input to answer did.</figcaption></figure>
  <p>The left panel is a histogram of trip distance: the solid curve is training, the dashed curve is live, and the whole hump has slid to the right. You can draw this panel from inputs alone. The right panel plots minutes against kilometres: the solid line is the rule the model learnt, and the dashed line is the new reality, shifted up by six minutes everywhere. The trips along the bottom axis are the same, which is why input statistics cannot see this kind of drift; only the real delivery times, called <strong>labels</strong>, reveal it.</p>
  <table class="tbl">
    <tr><th></th><th>Data drift</th><th>Concept drift</th><th>Model drift</th></tr>
    <tr><td>What changed</td><td>Input distribution P(X)</td><td>Relationship P(y|X)</td><td>The outcome: performance drops</td></tr>
    <tr><td>Biteful example</td><td>Suburbs and monsoon: rainy 26% → 70%</td><td>Traffic plan: +6 min for the same trip</td><td>Live MAE 2.44 → 4.87 or 5.87</td></tr>
    <tr><td>Detected with</td><td>PSI, KS test, feature statistics</td><td>Live metrics once labels arrive</td><td>Live metrics vs the offline score</td></tr>
    <tr><td>Needs labels?</td><td>No</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>Usual fix</td><td>Retrain on recent data</td><td>Retrain with new labels; rethink features</td><td>Find the cause first</td></tr>
  </table>
  <p>Two named tools appear in the table. <strong>PSI</strong> (population stability index) and the <strong>KS test</strong> (Kolmogorov–Smirnov) are standard ways to put a single number on "how much did this column's distribution change?"; their formulas, dashboards and alert thresholds are in <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>. Labels arrive at very different speeds: Biteful knows the real delivery time within an hour, but a churn or loan-default model may wait months, so it must rely on <strong>proxies</strong> such as input drift, a shift in the spread of its own predictions, and data-quality checks. Two cautions complete the picture. Data drift does not always hurt (more orders from Chai Stop is drift, but the model handles it fine), so alert on drift but decide on real metrics where possible. And a broken upstream pipeline, such as the metres bug, looks exactly like drift on a dashboard, so always rule out bugs before retraining.</p>

  <h2 id="ml-retrain"><span class="num">11</span>Retraining Triggers &amp; the Gate</h2>
  <p>During the monsoon, the live MAE creeps up week after week. Should Biteful retrain every night just in case, or wait for customers to complain? A scooter is serviced in two ways: every 3,000 km whatever happens, and immediately when a warning light comes on. Models are retrained the same two ways, and the rule that decides when to train again is called a <strong>retraining trigger</strong>.</p>
  <p>There are five common triggers. A <em>scheduled</em> trigger retrains every night, week or month: simple and predictable, but it may waste compute when nothing changed and react late when something did. A <em>performance</em> trigger fires when a live metric crosses a threshold: the best signal, but it needs labels. A <em>drift</em> trigger fires when PSI or a KS statistic on important features crosses a limit: early and label-free, but noisy. A <em>data-volume</em> trigger fires when enough new labelled rows have arrived. An <em>event</em> trigger is a human decision ahead of a known change: a new city, a new restaurant partner, a pricing change. Most teams combine a schedule as a floor with a performance trigger for urgent drops. Here is Biteful's rule applied to six weeks of monitoring numbers:</p>
  <div class="fx" data-lang="py"># retraining trigger: weekly live MAE (minutes) from the monitoring job; alarm above 3.5
weekly_mae = {"wk1": 2.5, "wk2": 2.6, "wk3": 2.9, "wk4": 3.3, "wk5": 3.8, "wk6": 4.4}
ALARM, SCHEDULE_WEEKS = 3.5, 8                  # metric trigger + an 8-week schedule as a floor
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
  <p>Weeks 1 to 4 stay under the alarm of 3.5 minutes. In week 5 the MAE reaches 3.8, and the metric trigger fires three weeks before the eight-week schedule would have.</p>
  <p>A trigger only starts a retrain; it must never put the result live by itself. Fresh data can be corrupt, and an automated pipeline that trains on a broken export at 3 a.m. and deploys the result would ship a broken model to every customer. So every candidate passes through the <strong>gate</strong> mentioned in section 02: it is scored on the same fixed holdout data as the champion, and it is promoted only if it beats the baseline and beats the champion by a clear margin (real gates also check important slices, such as rainy orders, and latency). The code below runs three candidates through such a gate: the same forest retrained with a different seed, a gradient-boosting model, and a forest trained on an export in which every third label was corrupted to −1:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingRegressor
# the gate: a candidate must beat the baseline AND clearly beat the live champion on the same holdout
def gate(candidate_mae, champion_mae, baseline_mae, margin=0.05):
    if candidate_mae &gt;= baseline_mae:
        return "REJECT (no better than guessing the average)"
    if candidate_mae &gt; champion_mae - margin:
        return "KEEP CHAMPION (not clearly better)"
    return "PROMOTE"

baseline_mae = mean_absolute_error(y_te, [y_tr.mean()] * len(y_te))
champion_mae = mean_absolute_error(y_te, model.predict(X_te))          # the live forest
corrupt = y_tr.copy(); corrupt.iloc[::3] = -1                           # export bug: every 3rd label is -1
candidates = {
    "forest, new seed": (RandomForestRegressor(n_estimators=100, max_depth=8, random_state=0), y_tr),
    "boosting":         (GradientBoostingRegressor(n_estimators=300, max_depth=2, random_state=0), y_tr),
    "corrupt export":   (RandomForestRegressor(n_estimators=100, max_depth=8, random_state=0), corrupt)}
print(f"baseline {baseline_mae:.2f} | champion {champion_mae:.2f}")
for name, (cand, labels) in candidates.items():
    mae = mean_absolute_error(y_te, cand.fit(X_tr, labels).predict(X_te))
    print(f"{name:17} MAE {mae:5.2f} -&gt; {gate(mae, champion_mae, baseline_mae)}")</div>
  <div class="fx" data-lang="text">baseline 8.45 | champion 2.44
forest, new seed  MAE  2.46 -&gt; KEEP CHAMPION (not clearly better)
boosting          MAE  2.30 -&gt; PROMOTE
corrupt export    MAE 12.37 -&gt; REJECT (no better than guessing the average)</div>
  <p>The baseline is 8.45 and the live champion 2.44. The forest with a new seed scored 2.46: essentially the same model, so the gate keeps the champion, because swapping models for a difference smaller than seed noise only adds risk. The boosting model scored 2.30, clearly better, so it is promoted. The corrupt export produced a model worse than guessing the average, and the gate rejected it before any customer saw it. In a real pipeline the steps after the trigger are: retrain on a fresh, versioned data snapshot, run the gate, and if the candidate passes, register it and release it gradually (a <strong>canary</strong> release sends a small share of traffic to the new model first); if it fails, keep the champion and alert a human. The model registry that holds champion and candidate is the subject of the <a class="xref" data-note="mlops_mlflow">MLflow note</a>, and gradual releases are covered in <a class="xref" data-note="mlops_deploy">Deployment Patterns</a>.</p>

  <h2 id="ml-mature"><span class="num">12</span>Maturity Levels, Tools &amp; Roles</h2>
  <p>Biteful started with a notebook and an emailed model file and now has scripts, versioned data, a pipeline and a retraining rule. A common way to describe how far along a team is comes from Google's MLOps guidance, which defines three <strong>maturity levels</strong>. Think of making rotis for a restaurant. At level 0, a cook rolls each roti by hand. At level 1, a machine makes them every day without help. At level 2, even changes to the machine are tested and installed automatically.</p>
  <table class="tbl">
    <tr><th>Level</th><th>What it looks like</th><th>Biteful at this level</th><th>Main risk</th></tr>
    <tr><td><strong>0 · Manual</strong></td><td>Notebook → model file → an engineer rewrites the feature code for production</td><td>Asha emails <code>model.pkl</code>; the metres bug</td><td>Skew, no monitoring, no reproducibility</td></tr>
    <tr><td><strong>1 · Pipeline automation</strong></td><td>Training is an automated pipeline (CT) on fresh data, with a registry and monitoring</td><td><code>dvc repro</code> runs weekly; the week-5 trigger retrains; the gate decides</td><td>Changes to the pipeline code are still manual</td></tr>
    <tr><td><strong>2 · CI/CD automation</strong></td><td>The pipeline code itself is tested, built and deployed by CI/CD; many models, many teams</td><td>A change to <code>features.py</code> is tested, retrained, packaged and canaried automatically</td><td>Platform complexity and cost</td></tr>
  </table>
  <p>The jump from level 0 to level 1 is the big win, because the same code then trains the model in development and in production and "it worked in my notebook" stops being a problem. The jump to level 2 is what the <a class="xref" data-note="mlops_cicd">CI/CD note</a> builds. Most companies sit at level 0 or 1, and climbing in order matters: Kubernetes and a feature store do not help a team whose training still lives in one notebook. The tools for each stage, and where this track covers them, are summarised below.</p>
  <table class="tbl">
    <tr><th>Stage</th><th>Open-source tools</th><th>Managed / cloud</th><th>In this track</th></tr>
    <tr><td>Versioning</td><td>Git, DVC, lakeFS, Delta Lake</td><td>GitHub, GitLab, Databricks</td><td>This note</td></tr>
    <tr><td>Configuration</td><td>Hydra, OmegaConf, Pydantic</td><td>—</td><td>This note</td></tr>
    <tr><td>Tracking &amp; registry</td><td>MLflow, Optuna</td><td>Weights &amp; Biases, Neptune, SageMaker, Vertex AI</td><td><a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a></td></tr>
    <tr><td>Orchestration</td><td>Airflow, Prefect, Kubeflow Pipelines</td><td>SageMaker / Vertex Pipelines</td><td><a class="xref" data-note="de_etl">ETL &amp; Orchestration</a></td></tr>
    <tr><td>CI/CD</td><td>GitHub Actions, GitLab CI, Jenkins</td><td>Cloud Build, CodePipeline</td><td><a class="xref" data-note="mlops_cicd">CI/CD for ML</a></td></tr>
    <tr><td>Serving</td><td>FastAPI, BentoML, KServe, Triton, ONNX Runtime</td><td>SageMaker / Vertex endpoints</td><td><a class="xref" data-note="mlops_serving">Model Serving &amp; Inference</a></td></tr>
    <tr><td>Infrastructure</td><td>Docker, Kubernetes, Helm, Terraform</td><td>EKS, GKE, AKS</td><td><a class="xref" data-note="mlops_k8s">Kubernetes for ML</a>, <a class="xref" data-note="mlops_cloud">Cloud ML Platforms &amp; IaC</a></td></tr>
    <tr><td>Monitoring</td><td>Prometheus, Grafana, Evidently</td><td>CloudWatch, Vertex Model Monitoring</td><td><a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a></td></tr>
  </table>
  <p>Finally, people. A restaurant has a supplier who brings clean vegetables, a chef who invents the recipe, a kitchen manager who cooks it five hundred times a day, a team that keeps the stoves working and an owner who decides the menu. An ML team divides its work the same way. The <strong>data engineer</strong> owns ingestion, pipelines and data quality, and hands over clean, versioned tables. The <strong>data scientist</strong> frames the problem, builds features and chooses the model, and hands over a tracked experiment and a candidate model. The <strong>ML engineer</strong> owns training pipelines, serving, monitoring and retraining, and delivers a live, monitored endpoint or batch job. The <strong>platform or DevOps</strong> team provides clusters, CI/CD, security and cost control as self-service tools. And <strong>product and business</strong> owners set the success metric and the guardrails ("the ETA must be within 5 minutes for 90% of orders") and make go or no-go decisions.</p>
  <p>Most failures happen at the handovers between these roles. At level 0, Asha posted a pickle file in a chat channel and an engineer rewrote the feature code from memory, which is exactly how the metres bug was born. The fix is a <strong>handoff contract</strong>: what one role gives the next so the work can continue without guessing. For a model, that is a registry entry carrying the code SHA, the data version, the config, the metrics overall and per slice, an example input, and the <strong>signature</strong>, meaning the expected input columns with their types and the output type. Creating that entry automatically for every run is where the next note begins.</p>

  <h2 id="ml-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The classic training/serving skew bug is building features for live requests with a different function from the one used in training. Here the serving code uses <code>pd.get_dummies</code> on a single incoming order, which creates a column only for the restaurant that is present:</p>
  <div class="fx" data-lang="py"># MISTAKE: building features for one live request with pd.get_dummies
request = pd.DataFrame({"distance_km": [5.5], "items": [3], "rain": [1], "restaurant": ["Biryani House"]})
Xr = pd.get_dummies(request, columns=["restaurant"])
print("columns seen in training:", X.shape[1], "| columns in the request:", Xr.shape[1])
try:
    model.predict(Xr)
except ValueError as e:
    print("ValueError:", str(e).splitlines()[0])

# FIX: one shared build_features with a fixed list of restaurants (the train.py version)
RESTAURANTS = ["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"]
def build_features(df):
    out = df[["distance_km", "items", "rain"]].copy()
    for r in RESTAURANTS:
        out[f"restaurant_{r}"] = (df["restaurant"] == r).astype(int)
    return out
print("fixed:", model.predict(build_features(request)).round(1))</div>
  <div class="fx" data-lang="text">columns seen in training: 7 | columns in the request: 4
ValueError: The feature names should match those that were passed during fit.
fixed: [53.2]</div>
  <p>The model was trained on seven columns but the request produced four, so scikit-learn refuses it. This is the lucky case, because it fails loudly; the metres bug in section 03 produced a wrong number with no error at all. The fix is one shared <code>build_features</code>, imported by both the training pipeline and the server, plus a schema check at the API door.</p>
  <p>A second mistake is reading settings leniently, with defaults that hide typos:</p>
  <div class="fx" data-lang="py"># MISTAKE: a lenient config read with defaults; the typo is silently ignored
cfg = {"n_estimators": 100, "max_dept": 4}          # someone meant max_depth=4
depth = cfg.get("max_depth", 8)
print("depth actually used:", depth)

# FIX: a strict schema turns the typo into an error before any training starts
from pydantic import BaseModel, ConfigDict, ValidationError
class ModelCfg(BaseModel):
    model_config = ConfigDict(extra="forbid")
    n_estimators: int
    max_depth: int = 8
try:
    ModelCfg(**cfg)
except ValidationError as e:
    print("ValidationError:", e.errors()[0]["loc"][0], "-", e.errors()[0]["msg"])</div>
  <div class="fx" data-lang="text">depth actually used: 8
ValidationError: max_dept - Extra inputs are not permitted</div>
  <p>The person meant depth 4, but <code>cfg.get("max_depth", 8)</code> could not find that key, so the run quietly used 8, and any conclusion drawn from it is wrong. A strict schema (Pydantic with <code>extra="forbid"</code>, or Hydra's struct configs) turns the typo into an error before training starts.</p>
  <p>A third mistake is committing a new data pointer and forgetting <code>dvc push</code>. Git happily records the pointer, but the bytes it names exist only on your laptop:</p>
  <div class="fx" data-lang="text"># Asha appends an order, records the new pointer in Git, pushes the code... and forgets dvc push
$ echo "4.0,2,0,Chai Stop,25.3" &gt;&gt; data/orders.csv
$ dvc add -q data/orders.csv
$ git commit -qam "data v3: one more order"
check for added large files..............................................Passed
check yaml...........................................(no files to check)Skipped
fix end of files.........................................................Passed
ruff check...........................................(no files to check)Skipped
# Ravi clones the repository and asks DVC for the matching data
$ git clone -q . ../ravi-laptop
$ cd ../ravi-laptop &amp;&amp; dvc pull
Everything is up to date.
WARNING: Some of the cache files do not exist neither locally nor on remote. Missing cache files:
md5: 8f8aaeb3e1c8a5e0a75633539643b8c7
md5: 2a0b216576e79f44117901c48e4fc167
md5: 751c865d03fe0685b28535660265bd3e
ERROR: failed to pull data from the cloud - Checkout failed for following targets:
data/orders.csv
models/model.joblib
data/clean.csv
Is your cache up to date?
&lt;https://error.dvc.org/missing-files&gt;
# fix: Asha runs the push she forgot, then Ravi pulls again
$ dvc push
3 files pushed
$ cd ../ravi-laptop &amp;&amp; dvc pull
A       data/clean.csv
A       data/orders.csv
A       models/model.joblib
3 files fetched and 3 files added</div>
  <p>Ravi's clone had the pointers but not the bytes, so <code>dvc pull</code> listed the missing hashes and failed. Notice that it was not only the new orders file: the pipeline outputs from the earlier <code>dvc repro</code> runs (<code>clean.csv</code> and the model) had never been pushed either, even though DVC printed "Use dvc push" after every run. After Asha's push, Ravi's pull fetched all three. The habit is simple: push data whenever you push code, and many teams add a Git pre-push hook that runs <code>dvc push</code> automatically.</p>
  <p>Beyond these, a handful of mistakes come up again and again. Training without a fixed seed or on "the live table" instead of a versioned snapshot makes scores impossible to reproduce, as section 01 showed. Committing data or model files into Git bloats history forever; use DVC pointers, a model registry and a large-file hook. Treating deployment as the end of the project leaves a model to decay unnoticed; plan monitoring and retraining from day one. Letting a retraining pipeline deploy without a gate turns a corrupt export into a broken live model. And calling every metric drop "drift" hides real bugs: a unit change upstream looks exactly like drift on a dashboard, so check the pipeline before retraining.</p>

  <h2 id="ml-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>ML lifecycle</b>: data → experiment → train → evaluate → deploy → monitor → retrain, repeated forever.</li>
    <li><b>MLOps</b>: habits and tools that run the lifecycle safely and repeatably (DevOps + data + models + CT).</li>
    <li><b>Continuous training (CT)</b>: a pipeline that retrains on new data automatically.</li>
    <li><b>Reproducible</b>: rebuildable from code SHA + data hash + config + seed + environment.</li>
    <li><b>Baseline</b>: the simplest reasonable predictor (always the mean: MAE 8.45 vs forest 2.44).</li>
    <li><b>Artifact</b>: any file a step produces (dataset, model, metrics).</li>
    <li><b>Champion / candidate</b>: the live model / a new model trying to replace it.</li>
    <li><b>Gate</b>: candidate must beat the baseline and clearly beat the champion on the same holdout.</li>
    <li><b>Hidden technical debt</b>: the costly system around the model (CACE, glue code, pipeline jungles, undeclared consumers, config debt, feedback loops).</li>
    <li><b>Training/serving skew</b>: features computed differently in training and serving (km vs metres: 53.2 vs 61.6).</li>
    <li><b>Data drift</b>: P(X) changes; <b>concept drift</b>: P(y|X) changes; <b>model drift</b>: live performance falls.</li>
  </ul>
  <h3>What versions what</h3>
  <table class="tbl">
    <tr><th>Input</th><th>Tool</th><th>What Git stores</th><th>Key commands</th></tr>
    <tr><td>Code</td><td>Git</td><td>the code itself</td><td><code>git switch -c exp/x</code>, <code>git rev-parse --short HEAD</code></td></tr>
    <tr><td>Data</td><td>DVC</td><td><code>.dvc</code> pointer (md5, size, path)</td><td><code>dvc add</code>, <code>push</code>, <code>pull</code>, <code>checkout</code>, <code>status</code></td></tr>
    <tr><td>Pipeline</td><td>DVC</td><td><code>dvc.yaml</code>, <code>dvc.lock</code></td><td><code>dvc repro</code>, <code>dvc dag</code>, <code>dvc metrics show</code></td></tr>
    <tr><td>Settings</td><td>Hydra + Pydantic</td><td><code>configs/*.yaml</code></td><td><code>key=value</code>, <code>+new=value</code>, <code>--multirun a=1,2,3</code></td></tr>
    <tr><td>Model</td><td>Model registry</td><td>nothing (registry links to the run)</td><td>MLflow note</td></tr>
  </table>
  <h3>Drift at a glance</h3>
  <table class="tbl">
    <tr><th>Kind</th><th>What moves</th><th>Needs labels</th><th>Detect with</th></tr>
    <tr><td>Data drift</td><td>P(X)</td><td>No</td><td>PSI, KS test, feature stats</td></tr>
    <tr><td>Concept drift</td><td>P(y|X)</td><td>Yes</td><td>live metrics</td></tr>
    <tr><td>Model drift</td><td>the score</td><td>Yes</td><td>live metrics vs offline</td></tr>
  </table>
  <h3>Maturity levels</h3>
  <table class="tbl">
    <tr><th>Level</th><th>Automated</th></tr>
    <tr><td>0</td><td>nothing: notebook, manual handoff</td></tr>
    <tr><td>1</td><td>training pipeline (CT), registry, monitoring</td></tr>
    <tr><td>2</td><td>also CI/CD for the pipeline code itself</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="text"># DVC: data and pipelines
dvc init                       # once per repo
dvc add data/orders.csv        # writes data/orders.csv.dvc, gitignores the file
git add data/orders.csv.dvc data/.gitignore &amp;&amp; git commit -m "data v1"
dvc remote add -d store s3://bucket/dvc
dvc push / dvc pull            # upload / download the bytes
git checkout &lt;rev&gt; -- data/orders.csv.dvc &amp;&amp; dvc checkout   # time travel
dvc repro                      # rerun only stages whose deps changed

# Hydra
python train.py model.max_depth=4 seed=1
python train.py --multirun model.max_depth=4,8,12

# pre-commit
pre-commit install             # hooks from .pre-commit-config.yaml run on every commit</div>
  <div class="fx" data-lang="py">@hydra.main(config_path="configs", config_name="config", version_base=None)
def main(cfg: DictConfig) -&gt; None:
    depth = cfg.model.max_depth

class ModelCfg(BaseModel):                       # Pydantic
    model_config = ConfigDict(extra="forbid")    # unknown keys are errors
    n_estimators: int = Field(gt=0, le=2000)
    rain: Literal[0, 1] = 0</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Same code ≠ same model: data, settings, seed and environment also matter.</li>
    <li>Commit before you train, or the recorded SHA lies.</li>
    <li><code>dvc push</code> with every <code>git push</code>, or teammates get pointers without bytes.</li>
    <li><code>pd.get_dummies</code> on live requests → wrong columns; share one <code>build_features</code>.</li>
    <li>Lenient configs hide typos; use Hydra structs and Pydantic <code>extra="forbid"</code>.</li>
    <li>A large file committed once stays in history; block it with a hook.</li>
    <li>Never auto-deploy a retrain without a gate; rule out bugs before calling it drift.</li>
  </ul>

  <h2 id="ml-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the ML lifecycle?</summary><div class="qa-body">It is the repeating loop a model lives in: collect and version data, experiment, train, evaluate, deploy, monitor, and retrain, then back to data. It never really ends, because the world keeps changing and a live model has to be watched and refreshed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is MLOps, and how is it different from DevOps?</summary><div class="qa-body">MLOps is the set of practices for running models in production reliably. DevOps assumes behaviour changes only when code changes; a model's behaviour also depends on data, settings and trained weights. So MLOps adds data and model versioning, data and model-quality tests, monitoring for silent decay, and continuous training on top of CI/CD.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do notebooks cause problems in production?</summary><div class="qa-body">Cells can run out of order and hidden state survives deleted cells, so the result depends on a history nobody recorded. Notebooks are hard to test, review, schedule and version, and they rarely record the data version, seed or environment. The usual fix is to move the logic into scripts or a package and keep notebooks for exploration.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your colleague retrained with the same code and got a different score. What could cause that?</summary><div class="qa-body">Unset random seeds (data split, model randomness), different data (an export that grew), different settings, different library versions, or non-deterministic hardware such as GPUs and thread counts. The fix is to fix seeds in config, train on versioned data snapshots, keep strict config files, pin the environment, and record all of it with every run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is training/serving skew? Give an example and a fix.</summary><div class="qa-body">It is any difference between how features are computed during training and during serving. In our example the model learnt distances in km while the app sent metres, so a 5.5 km order got 61.6 minutes instead of 53.2 with no error. Fixes are one shared feature function used by both, schema validation at the API, and tests that compare training and serving features on the same rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "hidden technical debt in ML systems" refer to?</summary><div class="qa-body">It refers to the Google paper showing that the model code is a small part of a real ML system, and that most long-term cost lives around it: data dependencies, glue code, pipeline jungles, configuration sprawl, undeclared consumers and feedback loops. Because inputs are entangled, changing anything changes everything (CACE).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you version data? What exactly does DVC store in Git?</summary><div class="qa-body">DVC stores a small <code>.dvc</code> pointer file in Git containing the data's md5 hash, size and path, while the bytes go to a cache and a remote such as S3 via <code>dvc push</code>. Checking out an old pointer and running <code>dvc checkout</code> or <code>dvc pull</code> restores the matching data. Alternatives include table formats with time travel (Delta Lake, Iceberg) and lakeFS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>dvc repro</code> give you that a shell script running every step does not?</summary><div class="qa-body">It compares the hash of each stage's inputs with <code>dvc.lock</code> and reruns only stages whose inputs changed, it can restore outputs from its run-cache without recomputing, and it records the exact hashes of inputs and outputs. That makes the pipeline fast to rerun, reproducible and auditable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Trunk-based development or Gitflow for an ML team?</summary><div class="qa-body">Usually trunk-based: small changes merged into main frequently, backed by automated tests, with short-lived experiment branches. Gitflow's long-lived develop and release branches suit scheduled, numbered releases but drift apart and make merges painful. In ML the experiment result should be recorded in a tracker even when the branch is discarded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use Hydra and Pydantic together?</summary><div class="qa-body">Hydra handles where settings come from: YAML files, command-line overrides, sweeps and a saved copy of the config for every run, and it rejects unknown keys. Pydantic checks that values are valid, with types, ranges and allowed values. Hydra alone would accept <code>max_depth=-3</code>; Pydantic alone gives no overrides or sweeps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is pre-commit, and why still run the checks in CI?</summary><div class="qa-body">pre-commit is a framework that runs checks such as formatters, linters, large-file and YAML checks on the files being committed and blocks the commit if any fail. Developers can bypass hooks with <code>--no-verify</code> or never install them, so CI runs the same checks where they cannot be skipped.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Data drift vs concept drift: define each with an example.</summary><div class="qa-body">Data drift is a change in the input distribution P(X), for example rainy orders rising from 26% to 70% and trips getting longer. Concept drift is a change in P(y|X), the relationship between inputs and the right answer, for example a traffic plan that adds six minutes to the same trip. Data drift can be seen without labels; concept drift needs labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can accuracy drop with no data drift at all? How would you notice?</summary><div class="qa-body">Yes. Concept drift changes the right answers while inputs stay the same (the traffic plan raised MAE from 2.44 to 5.87 on identical inputs), and silent upstream bugs can keep distributions similar while breaking meaning. You notice by monitoring live metrics against labels, not only input statistics; when labels are slow, use proxies such as prediction drift.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you decide when to retrain a model?</summary><div class="qa-body">Combine triggers: a schedule as a floor, a performance trigger when a live metric crosses a threshold, drift alerts on key features as an early warning, data-volume triggers, and planned events such as entering a new city. The choice depends on how fast labels arrive and how expensive training is. Every retrain then goes through the same gate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't a retraining pipeline deploy every new model automatically?</summary><div class="qa-body">New data can be corrupt, mislabelled or biased, and the resulting model could be worse than the live one without any error. A gate validates the data, compares the candidate to the champion on a fixed holdout and important slices with a margin larger than noise, and only then registers it for a gradual canary release with a rollback path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe MLOps maturity levels 0, 1 and 2.</summary><div class="qa-body">Level 0 is manual: notebooks, a model file handed over, features rewritten for production, no monitoring. Level 1 automates training as a pipeline on fresh data (continuous training) with a registry and monitoring. Level 2 also puts the pipeline code through CI/CD, so changes to features or training are tested, built and deployed automatically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What should a data scientist hand to an ML engineer?</summary><div class="qa-body">A registered model version with full lineage: code SHA, data version, config, metrics overall and per slice, the input/output signature, an example input and pinned dependencies, plus the training code as a runnable pipeline rather than only a notebook. A pickle file in a chat message is not a handoff.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design question: how would you take Biteful's notebook model to production?</summary><div class="qa-body">Move the notebook into a package with one shared feature function, version code in Git, data with DVC and settings with Hydra validated by Pydantic, and run training as a pipeline that logs every run to a tracker. Register the winner with its signature, serve it behind an API that validates inputs, and release it gradually. Then monitor latency, input drift and live MAE, and retrain on triggers through a gate.</div></details>
</main>
`
});
