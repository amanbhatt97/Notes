// notes/mlops/mlops_cicd.js — CI/CD for ML
Object.assign(TOPIC_CONTENT, {
  "mlops_cicd": `<main>
<h1>CI/CD for ML</h1>
  <div class="where"><span>MLOps &amp; Deployment</span><span>Shipping Models</span><span>CI/CD for ML</span></div>
  <p class="lead">CI/CD is the practice of letting a machine check and ship every change to a project, the same way every time, instead of trusting people to remember a release checklist. In ordinary software the machine tests code; in machine learning it must also test the data the model learns from and the model itself, because a model can be broken without a single line of code crashing. This matters in real work because most bad releases are not exotic failures but small, reasonable-looking edits that nobody checked on a busy day. Our running example is Biteful, the food-delivery app from the rest of the MLOps track, whose model predicts how many minutes an order will take from the distance, the number of items, whether it is raining and which restaurant cooks it. We will start from one such bad edit, then build Biteful's pipeline piece by piece: tests for code, data and model, a gate that refuses a worse model, the pipeline file for GitHub Actions (and its GitLab and Jenkins twins), and the Docker image it finally ships.</p>

  <h2 id="ci-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">CI/CD for ML</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li><b>CI</b>: test every change before it merges</li>
          <li><b>Continuous delivery</b>: every passing change is ready; a human releases</li>
          <li><b>Continuous deployment</b>: every passing change goes live by itself</li>
          <li><b>CT</b>: new data automatically produces a candidate model</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tests for ML</div>
        <ul>
          <li><b>Code</b>: unit tests on the feature function</li>
          <li><b>Data</b>: a schema (types, ranges, allowed values)</li>
          <li><b>Model</b>: quality budget + behaviour (directional, invariance)</li>
          <li><b>Gate</b>: beat the baseline and the live champion; exit code 0 or 1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pipeline files</div>
        <ul>
          <li>GitHub Actions: <code>on</code>, jobs, <code>needs</code>, matrix, secrets, artifacts</li>
          <li>GitLab CI: stages, <code>parallel: matrix</code>, <code>rules</code></li>
          <li>Jenkins: <code>Jenkinsfile</code>, stages, agents, credentials</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What ships</div>
        <ul>
          <li>Multi-stage Docker image: builder thrown away</li>
          <li>Tag = Git SHA; build once, promote the same image</li>
          <li>Non-root user, pinned versions, health check</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ci-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why CI/CD Exists</span><span class="rm-sub">a one-line edit that breaks every ETA</span></div></div>
      <div class="rm-item rm-done" data-target="ci-cicd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">CI, CD and CT</span><span class="rm-sub">testing, shipping and retraining</span></div></div>
      <div class="rm-item rm-done" data-target="ci-code"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Testing the Code</span><span class="rm-sub">unit tests for the feature function</span></div></div>
      <div class="rm-item rm-done" data-target="ci-data"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Testing the Data</span><span class="rm-sub">a schema every table must match</span></div></div>
      <div class="rm-item rm-done" data-target="ci-model"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Testing the Model</span><span class="rm-sub">quality budgets and behaviour tests</span></div></div>
      <div class="rm-item rm-done" data-target="ci-gate"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Model Gate</span><span class="rm-sub">only a better model may replace the live one</span></div></div>
      <div class="rm-item rm-done" data-target="ci-gha"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pipelines as Code: GitHub Actions</span><span class="rm-sub">triggers, jobs, matrix, secrets, artifacts</span></div></div>
      <div class="rm-item rm-done" data-target="ci-others"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">GitLab CI and Jenkins</span><span class="rm-sub">the same pipeline in other tools</span></div></div>
      <div class="rm-item rm-done" data-target="ci-docker"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Packaging: Docker Multi-Stage Builds</span><span class="rm-sub">the box the pipeline ships</span></div></div>
      <div class="rm-item rm-done" data-target="ci-ct"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Continuous Training and Promotion</span><span class="rm-sub">where full training belongs</span></div></div>
      <div class="rm-item rm-done" data-target="ci-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">pipelines that are green but wrong</span></div></div>
      <div class="rm-item rm-done" data-target="ci-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, test types, YAML, Dockerfile</span></div></div>
      <div class="rm-item rm-done" data-target="ci-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about CI/CD for ML</span></div></div>
    </div>
  </div>

  <h2 id="ci-why"><span class="num">01</span>Why CI/CD Exists</h2>
  <p>Biteful's model is already trained and stored. Its code lives in a small repository: a file <code>features.py</code> that turns an order into the numbers the model reads, a model file, and a few scripts. Every time somebody changes anything, a release checklist says what to do: run the tests, check the new model is not worse than the live one, build the server image, push it, update the server. On a quiet Tuesday people follow it. On a busy Friday they do not.</p>
  <p>Here is the Friday in question. The mobile team announces that the app will now send distances in metres instead of kilometres, so Ravi adds one line to the feature code that multiplies distance by 1000, and pushes. Let us see what that does to the six Monday-lunch orders the whole track uses, whose real delivery times we know:</p>
  <div class="fx" data-lang="py"># Friday's change: "the app sends metres now", so someone edits the feature code
import joblib, pandas as pd
from features import build_features

model = joblib.load("model/candidate.joblib")
monday = pd.DataFrame({
    "distance_km": [2.0, 5.5, 1.2, 3.8, 6.0, 4.5], "items": [2, 3, 1, 4, 2, 5],
    "rain": [0, 1, 0, 0, 1, 0],
    "restaurant": ["Dosa Corner", "Biryani House", "Chai Stop", "Pizza Point", "Dosa Corner", "Biryani House"],
    "real": [23, 55, 14, 36, 47, 43]})

def build_features_friday(df):
    X = build_features(df)
    X["distance_km"] = X["distance_km"] * 1000       # the one-line edit
    return X

monday["before"] = model.predict(build_features(monday)).round(1)
monday["after"] = model.predict(build_features_friday(monday)).round(1)   # no error, no warning
print(monday[["distance_km", "restaurant", "real", "before", "after"]].to_string(index=False))</div>
  <div class="fx" data-lang="text"> distance_km    restaurant  real  before  after
         2.0   Dosa Corner    23    22.5   39.7
         5.5 Biryani House    55    56.1   62.1
         1.2     Chai Stop    14    15.9   38.0
         3.8   Pizza Point    36    35.2   44.8
         6.0   Dosa Corner    47    47.5   53.4
         4.5 Biryani House    43    42.1   51.1</div>
  <p>Look at what did <em>not</em> happen. There was no error, no warning and no crash. The model happily accepted a distance of 2,000 "km" and produced a number, because a trained model has no idea what a sensible input looks like; it just follows its trees. Before the edit the predictions are within about two minutes of reality (22.5 against 23, 56.1 against 55). After it, the 23-minute Dosa Corner order is predicted at 39.7 and the 14-minute Chai Stop order at 38.0. Every customer in the city would see a wrong ETA, and nothing in the logs would say why. (Of course the server should also have converted metres back to kilometres; the point is that nothing <em>checked</em>.)</p>
  <p>The real problem is not Ravi's mistake but the process. A checklist that depends on people fails exactly when people are rushed. Think of a factory assembly line with an inspector at each station: a part that fails the weight check is never passed to the paint shop, not because a worker remembers to stop it, but because the line itself will not move it forward. Nobody can "forget" an inspection.</p>
  <p>That is what a <strong>CI/CD pipeline</strong> is: an automated sequence of checks and packaging steps that a server runs on every change to the repository, in a clean environment, stopping at the first failure. "Clean environment" matters as much as "automated": a fresh machine checks out the code, installs the declared packages and downloads the declared data, so a pass means the same thing for everyone rather than "it worked on my laptop with my files". The rest of this note builds Biteful's pipeline one station at a time, until the Friday edit above can no longer reach customers.</p>

  <h2 id="ci-cicd"><span class="num">02</span>CI, CD and CT</h2>
  <p>People say "CI/CD" as one word, but it names two different jobs, and ML adds a third. Knowing exactly where each one starts and stops is useful in practice and is one of the first things interviewers check.</p>
  <p><strong>Continuous integration (CI)</strong> means that every change, usually a pull request, is automatically built and tested before it is merged into the main branch. The word "integration" refers to merging everyone's work together; doing it continuously, in small pieces several times a day, means problems are found minutes after they are written, while the author still remembers the change. CI answers the question "is this change safe to merge?".</p>
  <p><strong>Continuous delivery (CD)</strong> goes one step further: every change that passes CI on the main branch is automatically packaged (for us, a Docker image) and deployed to a staging environment, a copy of production used for final checks. The software is therefore <em>always ready</em> to release, but a human presses the button that sends it to production. <strong>Continuous deployment</strong>, confusingly also shortened to CD, removes that last human step: every passing change goes live on its own. The difference is one approval click, and in an interview you should always say which one you mean.</p>
  <p>Machine learning adds <strong>continuous training (CT)</strong>: automatically retraining the model when new data arrives, on a schedule, or when monitoring shows the model getting worse. CT exists because an ML system can go stale without anyone changing the code; the world it describes changes instead. A restaurant opens, the city builds a new flyover, rain becomes more common, and last month's model is quietly wrong.</p>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <defs><marker id="ci-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="40" width="90" height="40" rx="6" class="fs" stroke="currentColor"/><text x="55" y="64" text-anchor="middle" font-size="12">push / PR</text>
    <rect x="120" y="20" width="230" height="80" rx="8" class="fb sb" fill-opacity="0.25"/><text x="235" y="38" text-anchor="middle" font-size="12" font-weight="700">CI</text>
    <text x="235" y="58" text-anchor="middle" font-size="11">code · data · model tests</text><text x="235" y="76" text-anchor="middle" font-size="11">gate · build image</text>
    <rect x="370" y="20" width="120" height="80" rx="8" class="fg sg" fill-opacity="0.25"/><text x="430" y="38" text-anchor="middle" font-size="12" font-weight="700">Delivery</text><text x="430" y="62" text-anchor="middle" font-size="11">push image</text><text x="430" y="78" text-anchor="middle" font-size="11">deploy staging</text>
    <rect x="510" y="20" width="120" height="80" rx="8" class="ft st" fill-opacity="0.25"/><text x="570" y="38" text-anchor="middle" font-size="12" font-weight="700">Production</text><text x="570" y="62" text-anchor="middle" font-size="11">approval (delivery)</text><text x="570" y="78" text-anchor="middle" font-size="11">or auto (deployment)</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ci-ar1)"><line x1="100" y1="60" x2="118" y2="60"/><line x1="350" y1="60" x2="368" y2="60"/><line x1="490" y1="60" x2="508" y2="60"/></g>
    <text x="320" y="132" text-anchor="middle" class="tm" font-size="11">CT runs beside this line: new data → training → candidate model → enters at the gate</text>
  </svg><figcaption>CI tests and builds; delivery keeps a releasable image in staging; the last step is manual (delivery) or automatic (deployment).</figcaption></figure>
  <p>Read the figure from left to right. A push or pull request starts CI, which runs the tests and, if they pass, the model gate and the image build. On the main branch, delivery pushes that image to a registry and updates staging. The final box is the only place where continuous delivery and continuous deployment differ: approval by a person, or none. CT is drawn underneath because it is a separate loop with a different trigger (data, not code), but its output, a newly trained candidate model, must pass through the very same gate before it can ship. Most ML teams choose continuous delivery plus a gradual rollout rather than continuous deployment, because a model can pass every offline test and still behave worse on live traffic; the <a class="xref" data-note="mlops_deploy">Deployment Patterns</a> note covers those rollouts.</p>

  <h2 id="ci-code"><span class="num">03</span>Testing the Code</h2>
  <p>The first station checks the code itself, exactly as in ordinary software. A <strong>unit test</strong> is a small function that calls one piece of your code with a known input and asserts that the output is what it should be. If you have not used pytest before, <a class="xref" data-note="py_pytest">pytest</a> covers it fully; the essentials are that pytest finds files and functions whose names start with <code>test_</code>, runs them, and reports any <code>assert</code> that fails.</p>
  <p>In an ML project the most important code to test is the feature code, because it runs in two places: during training and inside the live server. Biteful keeps it in a single file that both import:</p>
  <div class="fx" data-lang="py"># features.py — ONE copy of the feature code, imported by training, tests and the server
import pandas as pd

RESTAURANTS = ["Biryani House", "Chai Stop", "Dosa Corner", "Pizza Point"]

def build_features(df):
    X = df[["distance_km", "items", "rain"]].astype(float)
    for r in RESTAURANTS:                  # fixed list: same columns for 1 order or 10,000
        X[f"restaurant_{r}"] = (df["restaurant"] == r).astype(int)
    return X</div>
  <p>The function keeps the three numeric columns and adds one 0/1 column per restaurant from a fixed list. That fixed list is deliberate. The common shortcut, <code>pd.get_dummies</code>, only creates columns for restaurants present in the data it is given, so a single order from Biryani House would produce one restaurant column instead of four, and the model would receive the wrong shape. The tests below pin down exactly the properties that would have stopped Friday's edit and this older bug:</p>
  <div class="fx" data-lang="py">import pandas as pd
from features import RESTAURANTS, build_features

def one_order(**changes):
    base = {"distance_km": 5.5, "items": 3, "rain": 1, "restaurant": "Biryani House"}
    return pd.DataFrame([{**base, **changes}])

def test_same_columns_for_a_single_order():
    cols = list(build_features(one_order()).columns)
    assert cols == ["distance_km", "items", "rain"] + [f"restaurant_{r}" for r in RESTAURANTS]

def test_exactly_one_restaurant_flag():
    X = build_features(one_order(restaurant="Chai Stop"))
    assert X.filter(like="restaurant_").sum(axis=1).item() == 1

def test_distance_stays_in_km():
    assert build_features(one_order()).loc[0, "distance_km"] == 5.5</div>
  <p>The helper <code>one_order</code> builds a one-row table from a standard order, letting each test change just the field it cares about. The first test checks that even a single order produces all seven columns in the right order. The second checks that exactly one restaurant flag is switched on. The third is the one that matters for Friday: an order 5.5 km away must still say 5.5 in the feature table, so any change of units has to be made deliberately and the test updated with it. On the healthy repository all three pass:</p>
  <div class="fx" data-lang="text">$ python -m pytest --no-header -v tests/test_features.py
============================= test session starts ==============================
collecting ... collected 3 items

tests/test_features.py::test_same_columns_for_a_single_order PASSED      [ 33%]
tests/test_features.py::test_exactly_one_restaurant_flag PASSED          [ 66%]
tests/test_features.py::test_distance_stays_in_km PASSED                 [100%]

============================== 3 passed in 0.25s ===============================</div>
  <p>Code tests are fast (milliseconds) and precise: when one fails, it points at a specific function. But they only check what the code does with inputs you thought of. They say nothing about whether this week's data is sensible, or whether the trained model behaves well. Those need the next two stations.</p>

  <h2 id="ci-data"><span class="num">04</span>Testing the Data</h2>
  <p>A model learns from data, so bad data produces a bad model even when every line of code is correct. Biteful's warehouse export for week 2 has 2,200 orders, and two of them are broken: one has a delivery time of −1 minutes (an app bug) and one a distance of 120 km (a GPS glitch). A cleaning script, <code>prepare.py</code>, drops impossible rows before training. But who checks the cleaning script, or notices when next month's export arrives with a new restaurant, a column renamed, or rain recorded as "yes"/"no" instead of 1/0?</p>
  <p><strong>Data validation</strong> is the practice of checking a dataset against a declared description of what valid data looks like, before it is used. That description is called a <strong>schema</strong>: for each column, its type, its allowed range or allowed values, plus checks on the table as a whole. Think of a restaurant receiving vegetables: the chef checks the delivery is the right kind, fresh, and the right quantity before cooking with it, because a perfect recipe with rotten tomatoes still makes bad food. Code tests check the recipe; data tests check the delivery.</p>
  <p>In Python, <strong>pandera</strong> lets you write a schema as code and validate a pandas table against it (Great Expectations is a heavier alternative with HTML reports). Here is Biteful's data test file:</p>
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
    strict=True)                                   # an unexpected column is also an error

def test_clean_data_matches_schema():
    schema.validate(pd.read_csv("data/clean.csv"))

def test_enough_rows():
    assert len(pd.read_csv("data/clean.csv")) &gt;= 1000</div>
  <p>Each <code>pa.Column</code> declares a type and a check: distance between 0.1 and 30 km, items between 1 and 50, rain only 0 or 1, the restaurant one of the four known names, minutes greater than zero. The <code>checks=</code> argument adds a table-wide rule: the share of rainy orders must be between 5% and 60%. Training data has about 25%, so an export where 70% of rows say "rain" probably means something upstream changed, and a human should look before a model is trained on it. <code>strict=True</code> also rejects any unexpected column, which catches renames. To see that the schema really catches problems, run it on the <em>raw</em> week-2 export, before cleaning, with <code>lazy=True</code> so it collects every failure instead of stopping at the first:</p>
  <div class="fx" data-lang="py"># run the same schema on the RAW week-2 export, before prepare.py has cleaned it
import pandas as pd, pandera.pandas as pa
from tests.test_data import schema

raw = pd.read_csv("exports/orders_2200.csv")
try:
    schema.validate(raw, lazy=True)              # lazy: collect every failure, not just the first
except pa.errors.SchemaErrors as e:
    print(e.failure_cases[["column", "check", "index", "failure_case"]].to_string(index=False))</div>
  <div class="fx" data-lang="text">     column             check  index  failure_case
distance_km in_range(0.1, 30)   2120         120.0
    minutes   greater_than(0)   2050          -1.0</div>
  <p>The report names both broken rows precisely: row 2120 fails the distance range with 120.0, and row 2050 fails "greater than 0" with −1.0. On the cleaned file both data tests pass:</p>
  <div class="fx" data-lang="text">$ python -m pytest --no-header -q tests/test_data.py
..                                                                       [100%]
2 passed in 0.38s</div>
  <p>One practical lesson from writing tests like these: test <em>rates</em> and ranges, not perfection. An earlier draft also asserted "no duplicate rows" and failed on perfectly real data, because the export has no order ID and two different orders can look identical. Data tests that fail on innocent data get switched off, and then they protect nothing.</p>

  <h2 id="ci-model"><span class="num">05</span>Testing the Model</h2>
  <p>The third station loads the trained model file and checks the model itself. Ordinary software tests compare outputs with exact expected values, but a model's outputs are estimates that change slightly every time it is retrained, so a test like "order 2 must be 56.1 minutes" would fail on the next retrain for no good reason. Model tests instead check <em>budgets</em> and <em>behaviour</em>.</p>
  <p>A <strong>quality budget</strong> is a threshold on a metric measured on a frozen test set, for example "the mean absolute error (MAE, the average number of minutes the prediction is off by) on the 550 held-out orders must be under 3 minutes". Behavioural tests, an idea popularised by the CheckList paper on testing language models, check how the model responds to designed inputs, the way a driving examiner checks specific manoeuvres rather than just the total journey time. There are three kinds. A <strong>minimum functionality</strong> test checks that simple, well-understood cases come out right: each Monday order should be predicted within 5 minutes of its real time. A <strong>directional expectation</strong> test changes one input in a direction whose effect we know and checks the output moves that way: a farther order must take longer, a rainy order must take longer. An <strong>invariance</strong> test changes something that should be irrelevant and checks the output does not move: the customer's name must not change the ETA. Finally, because this model will answer live requests, a latency test checks that 95% of single predictions take under 20 ms.</p>
  <div class="fx" data-lang="py">import time
import joblib, pandas as pd, pytest
from sklearn.metrics import mean_absolute_error
from features import build_features

model = joblib.load("model/candidate.joblib")
test = pd.read_csv("data/test.csv")

def eta(**changes):
    base = {"distance_km": 4.0, "items": 3, "rain": 0, "restaurant": "Dosa Corner"}
    return float(model.predict(build_features(pd.DataFrame([{**base, **changes}])))[0])

def test_quality_budget():                                   # quality: MAE under 3 minutes
    assert mean_absolute_error(test.minutes, model.predict(build_features(test))) &lt; 3.0

@pytest.mark.parametrize("km,items,rain,rest,real", [        # minimum functionality
    (2.0, 2, 0, "Dosa Corner", 23), (5.5, 3, 1, "Biryani House", 55), (1.2, 1, 0, "Chai Stop", 14),
    (3.8, 4, 0, "Pizza Point", 36), (6.0, 2, 1, "Dosa Corner", 47), (4.5, 5, 0, "Biryani House", 43)])
def test_monday_orders_within_5_minutes(km, items, rain, rest, real):
    assert abs(eta(distance_km=km, items=items, rain=rain, restaurant=rest) - real) &lt; 5

def test_farther_is_slower():                                # directional expectation
    assert eta(distance_km=2) &lt; eta(distance_km=4) &lt; eta(distance_km=6)

def test_rain_is_slower():
    assert eta(rain=1) &gt; eta(rain=0)

def test_customer_name_does_not_change_eta():                # invariance
    assert eta(customer="Asha") == eta(customer="Ravi")

def test_latency_budget():                                   # serving: p95 under 20 ms
    times = []
    for _ in range(50):
        t0 = time.perf_counter(); eta(); times.append(time.perf_counter() - t0)
    assert sorted(times)[int(0.95 * len(times))] &lt; 0.020</div>
  <p>The helper <code>eta(**changes)</code> predicts for a standard 4 km order with any fields changed, which makes the behavioural tests read almost like sentences: <code>eta(distance_km=2) &lt; eta(distance_km=4) &lt; eta(distance_km=6)</code>. <code>@pytest.mark.parametrize</code> turns one test function into six, one per Monday order. The invariance test passes an extra <code>customer</code> field and relies on <code>build_features</code> ignoring it. Here is the whole suite, all three files, on the healthy repository:</p>
  <div class="fx" data-lang="text">$ python -m pytest --no-header -v tests
============================= test session starts ==============================
collecting ... collected 16 items

tests/test_data.py::test_clean_data_matches_schema PASSED                [  6%]
tests/test_data.py::test_enough_rows PASSED                              [ 12%]
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

============================== 16 passed in 1.37s ==============================</div>
  <p>Sixteen tests in under two seconds. Now replay Friday. Below, the same edit is applied to <code>features.py</code> in a copy of the repository (the diff shows the one added line), and the suite runs again:</p>
  <div class="fx" data-lang="text">$ git diff -U1 features.py
diff --git a/features.py b/features.py
index 4677952..b5b11f7 100644
--- a/features.py
+++ b/features.py
@@ -7,2 +7,3 @@ def build_features(df):
     X = df[["distance_km", "items", "rain"]].astype(float)
+    X["distance_km"] = X["distance_km"] * 1000   # "the app sends metres now"
     for r in RESTAURANTS:                  # fixed list: same columns for 1 order or 10,000
$ python -m pytest -q --no-header --tb=no -rf tests
....FFFFFFFFF...                                                         [100%]
=========================== short test summary info ============================
FAILED tests/test_features.py::test_distance_stays_in_km - assert np.float64(...
FAILED tests/test_model.py::test_quality_budget - assert 11.018339275343138 &lt;...
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[2.0-2-0-Dosa Corner-23]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[5.5-3-1-Biryani House-55]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[1.2-1-0-Chai Stop-14]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[3.8-4-0-Pizza Point-36]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[6.0-2-1-Dosa Corner-47]
FAILED tests/test_model.py::test_monday_orders_within_5_minutes[4.5-5-0-Biryani House-43]
FAILED tests/test_model.py::test_farther_is_slower - assert 40.50102848146692...
9 failed, 7 passed in 1.32s</div>
  <p>Nine of sixteen tests fail, and each one describes a different symptom of the same mistake. The unit test reports that 5.5 km became 5500. The quality budget reports an MAE of about 11 minutes instead of under 3. All six Monday orders are more than 5 minutes off. And "farther is slower" fails in an instructive way: 2, 4 and 6 km become 2,000, 4,000 and 6,000, all far beyond anything in the training data, so the trees send all three to the same leaves and predict exactly 40.501 minutes for each. Notice which tests <em>still pass</em>: rain is still slower, the customer name is still irrelevant, and latency is still fine. A suite with only those three would have shown a green tick. That is why one kind of test is never enough; each family looks at the system from a different angle. Run in CI, this pull request would show nine red failures and could not be merged.</p>
  <p>These tests answer "is this model good enough and sensible?". They do not answer a second, equally important question: is it <em>better than the model already live</em>? A retrained model with an MAE of 2.9 would pass the 3-minute budget while being worse than what customers have today. That needs the gate.</p>

  <h2 id="ci-gate"><span class="num">06</span>The Model Gate</h2>
  <p>A <strong>model gate</strong> is an automated pass/fail decision that compares a candidate model with two references on the same frozen evaluation set: a <strong>baseline</strong> (a deliberately simple predictor, here "always guess the training average") and the current <strong>champion</strong> (the model live in production). Think of a team trial: a new player must meet the minimum fitness standard <em>and</em> outperform the player currently in the side before getting the shirt. Being fit is not enough.</p>
  <p>The gate needs a way to tell the pipeline "stop here". Every program that finishes returns a small number to whoever started it, called its <strong>exit code</strong>: 0 means success, anything else means failure. CI servers rely on this one signal; if any step exits with a non-zero code, the step is marked failed and every later step that depends on it is skipped. So the gate is simply a script that exits with 0 or 1. It is split in two: <code>evaluate.py</code> scores one model file and writes the scores to JSON, and <code>gate.py</code> compares two JSON files.</p>
  <div class="fx" data-lang="py"># evaluate.py MODEL OUT.json — score one model file on the frozen test set
import json, sys
import joblib, pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score
from features import build_features

train, test = pd.read_csv("data/train.csv"), pd.read_csv("data/test.csv")
pred = joblib.load(sys.argv[1]).predict(build_features(test))
scores = {
    "mae": round(mean_absolute_error(test.minutes, pred), 3),
    "r2": round(r2_score(test.minutes, pred), 3),
    "baseline_mae": round(mean_absolute_error(test.minutes, [train.minutes.mean()] * len(test)), 3),
}
json.dump(scores, open(sys.argv[2], "w"))
print(sys.argv[1], scores)</div>
  <div class="fx" data-lang="py"># gate.py CANDIDATE.json CHAMPION.json — exit code 0 = ship it, 1 = stop the pipeline
import json, sys

cand = json.load(open(sys.argv[1]))
champ = json.load(open(sys.argv[2]))
checks = {
    "beats baseline by half": cand["mae"] &lt; 0.5 * cand["baseline_mae"],
    "beats champion": cand["mae"] &lt; champ["mae"],
    "R2 at least 0.85": cand["r2"] &gt;= 0.85,
}
for name, ok in checks.items():
    print("PASS" if ok else "FAIL", name)
sys.exit(0 if all(checks.values()) else 1)</div>
  <p>The gate has three rules: the candidate's MAE must be less than half the baseline's (otherwise it has barely learned anything), less than the champion's, and its R² (the share of variation in delivery times the model explains, where 1 is perfect) must be at least 0.85. Below, the champion is the random forest that was live before the tuned gradient-boosting model was trained in the <a class="xref" data-note="mlops_mlflow">MLflow</a> note, and the candidate is that boosting model. Then a deliberately weak "shallow forest" (20 trees of depth 3) plays a bad retrain:</p>
  <div class="fx" data-lang="text">$ python evaluate.py model/champion.joblib champion.json
model/champion.joblib {'mae': 2.654, 'r2': 0.901, 'baseline_mae': 8.501}
$ python evaluate.py model/candidate.joblib candidate.json
model/candidate.joblib {'mae': 2.346, 'r2': 0.92, 'baseline_mae': 8.501}
$ python gate.py candidate.json champion.json; echo "exit code $?"
PASS beats baseline by half
PASS beats champion
PASS R2 at least 0.85
exit code 0
$ python evaluate.py model/shallow.joblib shallow.json
model/shallow.joblib {'mae': 4.698, 'r2': 0.699, 'baseline_mae': 8.501}
$ python gate.py shallow.json champion.json; echo "exit code $?"
FAIL beats baseline by half
FAIL beats champion
FAIL R2 at least 0.85
exit code 1</div>
  <p>The baseline MAE on the 550 test orders is 8.501 minutes, so "half the baseline" means under 4.25. The boosting candidate scores 2.346 against the champion's 2.654 with R² 0.92: three passes, exit code 0, and the pipeline would carry on to build an image. The shallow forest scores 4.698, worse than half the baseline, worse than the champion, and R² only 0.699: three failures, exit code 1, and the build would never start.</p>
  <p>Two details make a gate trustworthy. First, both models must be scored on exactly the same rows, in the same job; comparing a candidate's score on this month's data with the champion's score from last month compares two different exams. Biteful's <code>data/test.csv</code> comes from a fixed random split and is versioned with DVC (see <a class="xref" data-note="mlops_lifecycle">The ML Lifecycle</a>). Second, a single overall number can hide a regression on an important group, so mature gates also compare slices, for example rainy orders or each restaurant, and fail if any key slice gets meaningfully worse.</p>

  <h2 id="ci-gha"><span class="num">07</span>Pipelines as Code: GitHub Actions</h2>
  <p>We now have tests and a gate that run from the command line. The remaining job is to tell a CI server to run them, in the right order, on every change, without anyone's laptop. Every CI tool does this with a configuration file stored in the repository next to the code, an idea called <strong>pipeline as code</strong>: the pipeline is reviewed, versioned and rolled back like any other file.</p>
  <p><strong>GitHub Actions</strong> is GitHub's built-in CI service. Its vocabulary is worth learning precisely, because the other tools use the same ideas under different names. A <strong>workflow</strong> is a YAML file in <code>.github/workflows/</code>. It has <strong>triggers</strong>, listed under <code>on</code>, saying which events start it. It contains <strong>jobs</strong>; each job runs on a fresh virtual machine called a <strong>runner</strong> and consists of <strong>steps</strong>, which are either shell commands (<code>run</code>) or reusable packaged <strong>actions</strong> (<code>uses</code>), such as the official one that checks out your code. Jobs run in parallel unless <code>needs</code> says one must wait for another. Here is Biteful's workflow. It cannot be run here, because workflows only run on GitHub's servers, so it is shown without output:</p>
  <div class="fx" data-lang="text">name: biteful-eta-ci
on:
  pull_request:
  push:
    branches: [main]

env:
  IMAGE: ghcr.io/biteful/eta

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.12", "3.13"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: pip
      - run: pip install -r requirements-dev.txt
      - name: Pull versioned data
        run: dvc pull &amp;&amp; python split_data.py
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
      - name: Fetch champion and candidate from the registry
        run: python export_models.py
        env:
          MLFLOW_TRACKING_URI: \${{ secrets.MLFLOW_TRACKING_URI }}
      - run: pytest -v tests
      - uses: actions/upload-artifact@v4
        if: matrix.python-version == '3.13'
        with:
          name: eval-inputs
          path: |
            model/
            data/

  gate:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.13"
      - uses: actions/download-artifact@v4
        with:
          name: eval-inputs
      - run: pip install -r requirements-dev.txt
      - run: python evaluate.py model/champion.joblib champion.json
      - run: python evaluate.py model/candidate.joblib candidate.json
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
  <p>Walk through it from the top. The workflow runs on every pull request and on every push to <code>main</code>. The <code>test</code> job uses a <strong>matrix</strong>: <code>strategy.matrix.python-version</code> lists two values, so GitHub runs the job twice in parallel, once on Python 3.12 and once on 3.13, and <code>\${{ matrix.python-version }}</code> is replaced by the current value. Inside it, <code>dvc pull</code> downloads the versioned data from cloud storage, using keys read from <code>secrets.*</code>. <strong>Secrets</strong> are encrypted values stored in the repository settings, injected only while the job runs and masked as <code>***</code> in logs, so passwords never appear in the YAML. Then the models are fetched from the MLflow registry and the sixteen tests run.</p>
  <p>Because each job runs on a brand-new machine, files do not carry over from one job to the next. The <code>test</code> job therefore uploads the model and data folders as an <strong>artifact</strong> (a bundle of files GitHub stores for the run), and the <code>gate</code> job, which <code>needs: test</code>, downloads it and runs the three gate commands from the previous section. If <code>gate.py</code> exits with 1, the job fails, and <code>build</code>, which <code>needs: gate</code>, never starts. <code>build</code> also has <code>if: github.ref == 'refs/heads/main'</code>, so pull requests are tested but only merged code produces an image. It logs into GitHub's container registry and tags the image with <code>\${{ github.sha }}</code>, the exact commit ID, so any running container can be traced back to the code that built it. Finally <code>deploy-staging</code> points the staging deployment at the new image. Its <code>environment: staging</code> line refers to a named <strong>environment</strong> in the repository settings, which can hold its own secrets and require a named person to approve before the job runs: that approval is how continuous delivery is implemented in practice.</p>
  <p>Because a workflow only fails once it reaches GitHub, it is worth checking the file locally first. YAML can be read with plain Python, and a few lines can check the structure. <code>broken.yml</code> is the same workflow with two realistic mistakes: the <code>gate</code> job has lost its <code>runs-on</code> line, and <code>matrix</code> is misspelt <code>matrx</code>.</p>
  <div class="fx" data-lang="py"># check the workflow files with plain Python before a CI server ever sees them
import yaml

wf = yaml.safe_load(open(".github/workflows/ci.yml"))
print("top-level keys:", list(wf))                # note what happened to "on"

def check(path):
    jobs = yaml.safe_load(open(path))["jobs"]
    problems = []
    for name, job in jobs.items():
        for key in ("runs-on", "steps"):
            if key not in job:
                problems.append(f"{name}: missing '{key}'")
        if "strategy" in job and "matrix" not in job["strategy"]:
            problems.append(f"{name}: strategy has no 'matrix' (found {list(job['strategy'])})")
        needs = job.get("needs", [])
        for n in [needs] if isinstance(needs, str) else needs:
            if n not in jobs:
                problems.append(f"{name}: needs unknown job '{n}'")
    order = " -&gt; ".join(jobs)
    print(f"{path}: {order}", "| OK" if not problems else "")
    for p in problems:
        print("   ", p)

check(".github/workflows/ci.yml")
check("broken.yml")
print("gitlab stages:", yaml.safe_load(open(".gitlab-ci.yml"))["stages"])</div>
  <div class="fx" data-lang="text">top-level keys: ['name', True, 'env', 'jobs']
.github/workflows/ci.yml: test -&gt; gate -&gt; build -&gt; deploy-staging | OK
broken.yml: test -&gt; gate -&gt; build -&gt; deploy-staging 
    test: strategy has no 'matrix' (found ['matrx'])
    gate: missing 'runs-on'
gitlab stages: ['test', 'gate', 'build']</div>
  <p>The first line of output holds a famous surprise: the key <code>on</code> came back as the boolean <code>True</code>. PyYAML follows the old YAML 1.1 rules, where <code>on</code>, <code>off</code>, <code>yes</code> and <code>no</code> are booleans. GitHub's own parser handles this, but any script of yours that reads workflow files must not look for a key called <code>"on"</code>. The structural check then passes the real file, shows the job order, and catches both mistakes in the broken one, before a single runner minute is spent. In a real team this kind of check runs as a pre-commit hook, usually with dedicated tools: <code>check-jsonschema</code> validates against GitHub's published schema, and <code>actionlint</code> also checks expression syntax and action names.</p>
  <p>The standard runners are <strong>GitHub-hosted</strong>: a fresh VM per job, maintained by GitHub, ideal for tests and image builds but without GPUs and without access to your private network. A <strong>self-hosted runner</strong> is a machine (or Kubernetes pod) you register with GitHub, selected with a label such as <code>runs-on: [self-hosted, gpu]</code>; ML teams use them for GPU tests or to reach an internal data warehouse or MLflow server. The price is that you patch and secure the machine yourself, and you must never attach one to a public repository, because anyone's pull request could then run code on it.</p>

  <h2 id="ci-others"><span class="num">08</span>GitLab CI and Jenkins</h2>
  <p>Many companies do not use GitHub. The good news is that every CI tool has the same parts: a trigger, ordered stages, jobs made of shell commands, a matrix, secrets, files passed between jobs, and conditions. If you understand the GitHub workflow above, learning another tool is mostly learning new spellings.</p>
  <p><strong>GitLab CI</strong> is GitLab's built-in CI service, configured by a <code>.gitlab-ci.yml</code> file at the root of the repository and run by GitLab <strong>runners</strong>. Here is the same pipeline (not run here; its YAML was parsed with Python by the check in the previous section, which printed its stages):</p>
  <div class="fx" data-lang="text">stages: [test, gate, build]

variables:
  IMAGE: $CI_REGISTRY_IMAGE/eta

test:
  stage: test
  image: python:\${PY}-slim
  parallel:
    matrix:
      - PY: ["3.12", "3.13"]
  script:
    - pip install -r requirements-dev.txt
    - dvc pull &amp;&amp; python split_data.py &amp;&amp; python export_models.py
    - pytest -v tests
  artifacts:
    paths: [model/, data/]

gate:
  stage: gate
  image: python:3.13-slim
  script:
    - pip install -r requirements-dev.txt
    - python evaluate.py model/champion.joblib champion.json
    - python evaluate.py model/candidate.joblib candidate.json
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
  <p>The ordering comes from <code>stages</code>: all jobs in the <code>test</code> stage finish before any job in <code>gate</code> starts. Each job names the Docker image it runs inside (<code>image: python:3.13-slim</code>), which is how GitLab gives every job a clean environment. <code>parallel: matrix</code> is the matrix, <code>artifacts: paths</code> passes the model and data to later stages automatically, and <code>rules: - if: $CI_COMMIT_BRANCH == "main"</code> restricts the build to the main branch. Variables like <code>$CI_REGISTRY_USER</code> and <code>$CI_COMMIT_SHORT_SHA</code> are provided by GitLab; your own secrets are added as masked CI/CD variables in the project settings.</p>
  <p><strong>Jenkins</strong> is an older, open-source automation server that companies install and run themselves. Its pipelines are written in a <code>Jenkinsfile</code>, using a Groovy-based syntax rather than YAML (not run here; it needs a Jenkins server):</p>
  <div class="fx" data-lang="text">pipeline {
  agent { docker { image 'python:3.13-slim' } }
  environment { MLFLOW_TRACKING_URI = credentials('mlflow-uri') }
  stages {
    stage('Test') {
      steps {
        sh 'pip install -r requirements-dev.txt'
        sh 'dvc pull &amp;&amp; python split_data.py &amp;&amp; python export_models.py'
        sh 'pytest -v tests --junitxml=report.xml'
      }
      post { always { junit 'report.xml' } }
    }
    stage('Gate') {
      steps {
        sh 'python evaluate.py model/champion.joblib champion.json'
        sh 'python evaluate.py model/candidate.joblib candidate.json'
        sh 'python gate.py candidate.json champion.json'
      }
    }
    stage('Build') {
      when { branch 'main' }
      steps { sh "docker build -t registry.biteful.internal/eta:\${GIT_COMMIT} ." }
    }
  }
}</div>
  <p>The shape is the same once more. <code>agent</code> says where the steps run (here inside a Python container), <code>credentials('mlflow-uri')</code> pulls a secret from Jenkins' credential store, each <code>stage</code> lists <code>sh</code> commands, <code>post { always { junit ... } }</code> publishes the test report even when tests fail, and <code>when { branch 'main' }</code> is the condition.</p>
  <table class="tbl">
    <tr><th>Idea</th><th>GitHub Actions</th><th>GitLab CI</th><th>Jenkins</th></tr>
    <tr><td>Config file</td><td><code>.github/workflows/*.yml</code></td><td><code>.gitlab-ci.yml</code></td><td><code>Jenkinsfile</code></td></tr>
    <tr><td>Ordering</td><td><code>needs</code></td><td><code>stages</code> (and <code>needs</code>)</td><td><code>stages { stage(...) }</code></td></tr>
    <tr><td>Matrix</td><td><code>strategy.matrix</code></td><td><code>parallel: matrix</code></td><td><code>matrix { axes { ... } }</code></td></tr>
    <tr><td>Condition</td><td><code>if:</code></td><td><code>rules: - if:</code></td><td><code>when { branch 'main' }</code></td></tr>
    <tr><td>Secrets</td><td><code>secrets.X</code></td><td>masked CI/CD variables</td><td><code>credentials('id')</code></td></tr>
    <tr><td>Files between jobs</td><td>upload/download-artifact</td><td><code>artifacts: paths</code></td><td><code>stash</code> / <code>archiveArtifacts</code></td></tr>
    <tr><td>Machines</td><td>GitHub-hosted or self-hosted runners</td><td>shared or own runners</td><td>agents you manage</td></tr>
  </table>
  <p>Notice one design choice shared by all three files: the CI configuration is only a thin list of commands. All the real logic lives in <code>pytest</code>, <code>evaluate.py</code> and <code>gate.py</code>, which run identically on a laptop. That keeps the pipeline portable between tools and, more importantly, debuggable: when CI fails, you can reproduce the failure locally with the same command instead of pushing and waiting.</p>

  <h2 id="ci-docker"><span class="num">09</span>Packaging: Docker Multi-Stage Builds</h2>
  <p>Once the tests and the gate pass, the pipeline must produce the thing that will actually run in production. The server needs a specific Python version, exact versions of FastAPI, scikit-learn and pandas, the feature code, the server code and the champion model file, and it must behave identically on the CI machine, in staging and in production. The standard answer is a Docker image: a packaged, read-only file system containing everything the program needs, which runs the same on any machine with Docker. <a class="xref" data-note="se_docker">Docker</a> explains images, layers and containers from scratch; here we apply them to the model server. The server code itself, <code>app.py</code>, is explained in <a class="xref" data-note="mlops_serving">Model Serving &amp; Inference</a>. Docker is not available in this sandbox, so the files below are shown without build output.</p>
  <p>The first thing to pin is the package list. A model trained with scikit-learn 1.9.1 may refuse to load in another version or, worse, load and predict slightly differently, so <code>requirements.txt</code> lists exact versions:</p>
  <div class="fx" data-lang="text">fastapi==0.164.0
uvicorn==0.53.0
scikit-learn==1.9.1
pandas==3.0.5
joblib==1.6.0</div>
  <p>The obvious Dockerfile has one stage: start from a Python base image, install the packages, copy the code and the model, and set the start command.</p>
  <div class="fx" data-lang="text">FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY features.py app.py ./
COPY model/candidate.joblib model/
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]</div>
  <p>This works, but it ships more than it needs. Docker builds an image as a stack of <strong>layers</strong>, one per instruction, and every layer is kept forever, so anything a step leaves behind (pip's download cache, compilers installed to build a package) stays in the final image even if a later step deletes it. A bigger image is slower to push and pull, and every extra package is something that may need a security patch. It also runs as the root user, so a bug in the server gives an attacker full control of the container.</p>
  <p>A <strong>multi-stage build</strong> solves this by using several <code>FROM</code> lines in one Dockerfile. Earlier stages do the messy work; the final stage starts again from a clean base and copies in only the finished results with <code>COPY --from=</code>. Think of a kitchen with a prep room: vegetables are washed, peeled and chopped there, and only the finished dish goes out to the dining room, not the peelings and the knives.</p>
  <div class="fx" data-lang="text"># ---- stage 1: builder - has pip, compilers and caches; is thrown away ----
FROM python:3.13-slim AS builder
RUN apt-get update &amp;&amp; apt-get install -y --no-install-recommends build-essential
COPY requirements.txt .
RUN python -m venv /opt/venv \\
 &amp;&amp; /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# ---- stage 2: runtime - only the finished venv, the code and the model ----
FROM python:3.13-slim
RUN useradd --create-home app
COPY --from=builder /opt/venv /opt/venv
WORKDIR /app
COPY features.py app.py ./
COPY model/candidate.joblib model/
ENV PATH=/opt/venv/bin:$PATH MODEL_VERSION=2
USER app
EXPOSE 8000
HEALTHCHECK --interval=10s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/ready')"
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]</div>
  <p>The <code>builder</code> stage installs compilers and creates a virtual environment at <code>/opt/venv</code> with every package in it. The second stage starts again from a clean <code>python:3.13-slim</code> and copies only three things: that finished virtual environment, the two code files and the model. The compilers, apt lists and anything else in the builder never reach the shipped image. The runtime stage also creates an ordinary user called <code>app</code> and switches to it with <code>USER app</code>, and declares a <code>HEALTHCHECK</code> that calls the server's <code>/ready</code> endpoint, so Docker (and later Kubernetes) can tell whether the container is actually able to answer. In the pipeline, the image is built with <code>docker build -t ghcr.io/biteful/eta:&lt;git sha&gt; .</code>, a quick <strong>smoke test</strong> starts the container and sends Monday order 2 to check it answers, and only then is it pushed.</p>
  <p>Two common additions belong here. Models that need a GPU start <code>FROM</code> an NVIDIA CUDA base image (or a framework image such as <code>pytorch/pytorch</code>) whose CUDA libraries match the framework, and the host needs the NVIDIA Container Toolkit so that <code>docker run --gpus all</code> can pass the GPU into the container; on Kubernetes the NVIDIA device plugin plays the same role. GPU images are several gigabytes, so multi-stage builds and layer caching matter even more there. And before pushing, many pipelines scan the image for packages with known vulnerabilities using a tool such as Trivy (<code>trivy image ghcr.io/biteful/eta:&lt;sha&gt;</code>) and fail on critical findings; a smaller image simply has fewer packages to report.</p>

  <h2 id="ci-ct"><span class="num">10</span>Continuous Training and Promotion</h2>
  <p>So far the pipeline tests and packages models that already exist in the registry. Who trains them? It is tempting to retrain the model in CI on every pull request, but that would be a mistake. CI must be fast, a few minutes, so developers get feedback while the change is fresh in their minds. Full training on a year of orders, with hyperparameter search, takes hours on large machines, costs real money, and depends on fresh data rather than on the code change being reviewed. So ML systems run two loops that meet at the model registry.</p>
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
    <rect x="10" y="140" width="130" height="36" rx="6" class="fr sr"/><text x="75" y="162" text-anchor="middle" font-size="11">trigger: drift / schedule</text>
    <rect x="160" y="140" width="150" height="36" rx="6" class="fb sb"/><text x="235" y="162" text-anchor="middle" font-size="11">full train + tuning</text>
    <rect x="330" y="140" width="150" height="36" rx="6" class="fv" stroke="currentColor"/><text x="405" y="162" text-anchor="middle" font-size="11">registry @challenger</text>
    <g stroke="currentColor" fill="none" marker-end="url(#ci-ar2)"><line x1="140" y1="158" x2="158" y2="158"/><line x1="310" y1="158" x2="328" y2="158"/><line x1="405" y1="140" x2="350" y2="68"/></g>
    <text x="440" y="110" class="tm" font-size="11">candidate enters the same gate</text>
  </svg><figcaption>CI handles code; CT handles data. Both feed the same gate, image build and promotion path.</figcaption></figure>
  <p>The top loop is everything this note has built so far, with one addition: instead of full training, CI runs a <strong>smoke training</strong> on a small sample, say 100 rows, just to prove that <code>train.py</code> still runs end to end after the code change. A smoke test in general is a quick check that a system starts and its basic path works, named after switching on new electronics and checking nothing smokes. The bottom loop is continuous training. It is started by a trigger, such as a weekly schedule, a drop in live accuracy, or detected drift in the input data (<a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a> covers these), and is usually run by an orchestrator such as Airflow, Kubeflow Pipelines or SageMaker Pipelines (see <a class="xref" data-note="de_etl">ETL &amp; Pipelines</a>). It pulls fresh data, trains and tunes on large machines, logs everything to MLflow, and registers the result as a <code>@challenger</code>. The diagonal arrow is the key point: the challenger does not go straight to production. It enters the same gate as any code change, is scored against the champion on the frozen evaluation set, and only if it wins is it built into an image and released.</p>
  <p>The last step, getting a tested image from staging to production, is called <strong>promotion</strong>: moving an already-tested artifact to the next environment <em>without rebuilding it</em>. This rule, "build once, promote the same artifact", is easy to break by accident. If staging tested image <code>ghcr.io/biteful/eta:a72a702</code>, production must run that same image, identified by its digest, and not a fresh build from the same commit: in between, the base image may have been updated or an unpinned package may have released a new version, so the "same" build could contain different software that nobody tested. Promotion usually also moves the registry alias, so <code>@champion</code> in MLflow and the image running in production always describe the same model. How that image is then rolled out to customers, gradually and reversibly, is the subject of <a class="xref" data-note="mlops_deploy">Deployment Patterns</a>.</p>

  <h2 id="ci-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most damaging mistake is a pipeline that only tests code. Friday's edit would have sailed through a suite that never loads the model or looks at predictions, because nothing crashed. The fix is the one this note followed: add data tests and model tests, and look at which of them fail on a deliberately broken change, as we did with the metres bug.</p>
  <p>The second is writing model tests with exact numbers. A test such as the one below passes today and fails on the next retrain, even if the new model is better:</p>
  <div class="fx" data-lang="py"># fragile: breaks on every retrain
assert eta() == 34.87

# robust: test budgets and behaviour instead
assert mean_absolute_error(y_test, model.predict(X_test)) &lt; 3.0
assert eta(distance_km=2) &lt; eta(distance_km=4)</div>
  <p>Third, gating only on an absolute budget. "MAE under 3" lets a 2.9-minute model replace a 2.654-minute champion. Always compare with the live model, on the same frozen rows, in the same job.</p>
  <p>Fourth, retraining the full model inside CI. Feedback becomes slow, bills grow, and jobs fail randomly when the data source is busy. Smoke-train on a sample in CI and leave full training to the CT pipeline.</p>
  <p>Fifth, secrets in the workflow file or in logs. A line like <code>AWS_SECRET_ACCESS_KEY: abc123</code> in YAML is visible to everyone who can read the repository, forever, in its history. Use <code>secrets.*</code> or masked variables, never <code>echo</code> them, and remember that pull requests from forks do not receive secrets, so steps that need them must be skipped for outside contributors.</p>
  <p>Sixth, tagging images <code>:latest</code> and rebuilding for each environment. <code>:latest</code> names whatever was built most recently, so you cannot tell which code is running or roll back to an exact version. Tag with the Git SHA and promote the same image from staging to production.</p>
  <p>Finally, single-stage images running as root with unpinned packages. They are larger, harder to patch, and can silently drift away from the versions the model was trained with. Use a multi-stage build, a non-root user and an exactly pinned <code>requirements.txt</code>.</p>

  <h2 id="ci-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>CI/CD pipeline</b>: automated checks and packaging run by a server on every change, in a clean environment, stopping at the first failure.</li>
    <li><b>Continuous integration</b>: build and test every change before it merges.</li>
    <li><b>Continuous delivery</b>: every passing change is packaged and deployed to staging; a human releases to production.</li>
    <li><b>Continuous deployment</b>: every passing change is released to production automatically.</li>
    <li><b>Continuous training (CT)</b>: retrain automatically on new data, a schedule or drift; the candidate enters the same gate.</li>
    <li><b>Model gate</b>: pass/fail comparison of a candidate with a baseline and the live champion on a frozen set, reported by exit code.</li>
    <li><b>Smoke test</b>: a quick check that the system starts and the basic path works.</li>
    <li><b>Promotion</b>: moving the same tested artifact to the next environment without rebuilding.</li>
  </ul>
  <h3>Tests for ML</h3>
  <table class="tbl">
    <tr><th>Family</th><th>Checks</th><th>Biteful example</th><th>Tools</th></tr>
    <tr><td>Code</td><td>functions do what they say</td><td>5.5 km stays 5.5; one restaurant flag</td><td>pytest, ruff, mypy</td></tr>
    <tr><td>Data</td><td>types, ranges, allowed values, table-wide rules</td><td>caught 120 km and −1 min</td><td>pandera, Great Expectations</td></tr>
    <tr><td>Model quality</td><td>metric budget on frozen data (and slices)</td><td>MAE &lt; 3</td><td>pytest, evaluate.py</td></tr>
    <tr><td>Behaviour</td><td>minimum functionality, directional, invariance</td><td>Monday orders ±5; farther and rain slower; name irrelevant</td><td>pytest (CheckList style)</td></tr>
    <tr><td>Gate</td><td>better than baseline and champion</td><td>2.346 vs 2.654 → exit 0; 4.698 → exit 1</td><td>script + exit code</td></tr>
  </table>
  <h3>GitHub Actions vocabulary</h3>
  <table class="tbl">
    <tr><th>Key</th><th>Meaning</th></tr>
    <tr><td><code>on</code></td><td>triggers (pull_request, push to main, schedule)</td></tr>
    <tr><td><code>jobs.&lt;id&gt;</code>, <code>runs-on</code>, <code>steps</code></td><td>a job on a fresh runner; steps are <code>run</code> or <code>uses</code></td></tr>
    <tr><td><code>needs</code></td><td>order; a failed job skips its dependants</td></tr>
    <tr><td><code>strategy.matrix</code></td><td>run one job once per value, in parallel</td></tr>
    <tr><td><code>secrets.X</code></td><td>encrypted values, masked in logs</td></tr>
    <tr><td>upload/download-artifact</td><td>pass files between jobs</td></tr>
    <tr><td><code>if</code>, <code>environment</code></td><td>conditions; deployment target with approvals</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="text"># gate step: exit code decides
python gate.py candidate.json champion.json   # 0 = continue, 1 = stop

# multi-stage Dockerfile skeleton
FROM python:3.13-slim AS builder
RUN python -m venv /opt/venv &amp;&amp; /opt/venv/bin/pip install -r requirements.txt
FROM python:3.13-slim
COPY --from=builder /opt/venv /opt/venv
COPY features.py app.py model/ ./
USER app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]</div>
  <h3>Gotchas</h3>
  <ul>
    <li>A model can be broken with no crash: test data and predictions, not just code.</li>
    <li>Test budgets and behaviours, never exact predicted values.</li>
    <li>Gate against the champion on the same frozen rows.</li>
    <li>PyYAML reads the key <code>on</code> as <code>True</code>.</li>
    <li>No full training in CI; smoke-train on a sample.</li>
    <li>Tag images with the Git SHA; build once, promote the same image.</li>
    <li>Self-hosted runners never on public repositories.</li>
  </ul>

  <h2 id="ci-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is CI/CD, and why is it harder for ML than for ordinary software?</summary><div class="qa-body">CI/CD is an automated pipeline that tests every change and packages and releases the ones that pass. In ordinary software behaviour changes only when code changes; in ML it also changes when data or the trained model changes, and a broken model usually does not crash. So the pipeline must test data and model behaviour as well as code, and compare new models with the live one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between continuous delivery and continuous deployment?</summary><div class="qa-body">In continuous delivery every passing change is packaged and deployed to staging, always ready to release, but a human approves the production release. In continuous deployment that approval is removed and every passing change goes live automatically. Many ML teams use delivery plus a canary rollout, because offline tests cannot fully predict live behaviour.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is continuous training, and how does it relate to CI/CD?</summary><div class="qa-body">CT automatically retrains the model when new data arrives, on a schedule or when monitoring detects drift or a metric drop. It is triggered by data rather than code. Its output is a candidate model in the registry, which then goes through the same gate, image build and promotion path as any code change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What tests would you put in an ML CI pipeline?</summary><div class="qa-body">Unit tests for feature and preprocessing code; data validation against a schema (types, ranges, allowed values, distribution checks); model quality budgets on a frozen test set, ideally per slice; behavioural tests (minimum functionality, directional expectation, invariance); a latency check; and a gate comparing the candidate with the baseline and the champion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain directional and invariance tests with an example.</summary><div class="qa-body">A directional test changes an input whose effect is known and checks the output moves that way: for a delivery-time model, a 6 km order must be predicted slower than a 2 km one, and rain must add time. An invariance test changes something irrelevant and checks the output does not move: the customer's name must not change the ETA. Together they catch models that score well but have learned nonsense.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't model tests assert exact predicted values?</summary><div class="qa-body">Every retrain changes predictions slightly, so an exact-value test fails even when the new model is better, and the team learns to ignore or delete it. Tests should check budgets (MAE under 3 minutes), tolerances (within 5 minutes of known cases) and behaviours (farther is slower).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a gate script stop a pipeline?</summary><div class="qa-body">Through its exit code. The script exits with 0 when all checks pass and with a non-zero code otherwise; the CI server marks that step as failed and skips every job that depends on it, so no image is built or deployed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a model comparison in a gate fair?</summary><div class="qa-body">Both models are scored on exactly the same frozen, versioned evaluation set, with the same metric code, in the same job. Comparing scores computed on different data or at different times compares different exams. Good gates also check key slices so an overall improvement cannot hide a regression on, say, rainy orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not retrain the full model in CI on every pull request?</summary><div class="qa-body">It is slow and expensive, depends on fresh data rather than on the code change, and makes CI flaky. CI runs a smoke training on a small sample to prove the training code still works and tests the registry's models; full training belongs in a separate CT pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe the parts of a GitHub Actions workflow.</summary><div class="qa-body">A YAML file in <code>.github/workflows/</code> with triggers under <code>on</code> and a set of jobs. Each job runs on a runner (<code>runs-on</code>) and has steps, either shell commands (<code>run</code>) or reusable actions (<code>uses</code>). <code>needs</code> orders jobs, <code>strategy.matrix</code> runs a job in several variants, <code>secrets.*</code> injects encrypted values, artifacts pass files between jobs, and <code>environment</code> adds deployment targets with approval rules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a matrix build, and when is it useful in ML?</summary><div class="qa-body">One job definition expanded into several parallel runs, one per combination of values, such as Python 3.12 and 3.13. In ML it is useful for checking several Python or library versions, CPU and GPU builds, or several model variants without copying the job.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle secrets in CI?</summary><div class="qa-body">Store them in the CI tool's encrypted store (GitHub secrets, GitLab masked variables, Jenkins credentials) and reference them by name; they are injected at run time and masked in logs. Never write them in the YAML or print them. Forked pull requests don't receive secrets, so steps that need them must be skipped or mocked; for clouds, short-lived OIDC credentials are better than long-lived keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GitHub-hosted vs self-hosted runners for ML workloads?</summary><div class="qa-body">GitHub-hosted runners are fresh VMs with nothing to maintain, good for tests and image builds, but standard ones have no GPU and no access to private networks. Self-hosted runners can have GPUs and reach internal data or MLflow, but you must secure and patch them, and they must never run untrusted code from public repositories.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do GitLab CI and Jenkins differ from GitHub Actions?</summary><div class="qa-body">Mostly in syntax and hosting. GitLab CI uses <code>.gitlab-ci.yml</code> with stages, <code>parallel: matrix</code>, <code>rules</code> and artifacts, run by GitLab runners. Jenkins is a self-hosted server whose <code>Jenkinsfile</code> uses a Groovy-based syntax with agents, stages, steps, <code>when</code> and <code>credentials()</code>. The concepts (triggers, ordered stages, secrets, artifacts, conditions) are the same.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a multi-stage Docker build for a model server?</summary><div class="qa-body">Build tools, compilers and caches stay in the builder stage; the final image gets only the virtual environment, the code and the model. The result is smaller, faster to pull, has fewer packages to patch or flag in scans, and is a natural place to add a non-root user and a health check.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why tag images with the Git SHA instead of <code>latest</code>?</summary><div class="qa-body">The SHA names the exact code inside the image, so any running container can be traced to its commit, staging and production can be confirmed to run the same build, and rollback can redeploy an exact previous version. <code>latest</code> silently points to whatever was built most recently.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "build once, promote the same artifact" mean, and why?</summary><div class="qa-body">The image tested in staging is the one released to production, identified by its digest, rather than a new build from the same commit. Rebuilding can pull a newer base image or package version, so production would run software nobody tested.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What extra is needed to run a GPU model in a container?</summary><div class="qa-body">A base image whose CUDA and cuDNN libraries match the framework (for example an <code>nvidia/cuda</code> runtime image or a PyTorch image), the NVIDIA driver on the host, and the NVIDIA Container Toolkit so <code>docker run --gpus all</code> exposes the GPU. On Kubernetes, the NVIDIA device plugin makes GPUs schedulable resources.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design a CI/CD pipeline for a model that is retrained weekly.</summary><div class="qa-body">On every pull request: lint, unit and data tests, a smoke training on a sample, and model tests against the registry's champion. Weekly (or on drift), a CT pipeline pulls fresh data, trains, logs to MLflow and registers a challenger. The gate scores challenger vs champion on a frozen set and key slices; if it wins, CI builds a SHA-tagged multi-stage image, smoke-tests it, deploys to staging, and after approval promotes the same image to production with a canary, moving the registry alias at the same time.</div></details>
</main>
`
});
