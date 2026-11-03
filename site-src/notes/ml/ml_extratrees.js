// notes/ml/ml_extratrees.js — Extra Trees
Object.assign(TOPIC_CONTENT, {
  "ml_extratrees": `<main>
  <h1>Extra Trees</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Bagging</span><span>Extra Trees</span></div>
  <p class="lead"><strong>Extra Trees</strong>, short for <em>extremely randomised trees</em> (Geurts, Ernst &amp; Wehenkel, 2006), takes the random forest one step further. A random forest hides some columns at each split but still searches carefully for the best cut-off on the columns it can see. Extra Trees stops searching: it picks the cut-off at random, and by default it also drops the bootstrap, so every tree sees all the rows. Each tree becomes a little worse, but the trees become much less alike, and training becomes much faster. This page works one random split by hand on the cricket captain's 14-day diary used throughout the tree notes, builds the full algorithm, measures what random cut-offs do to bias, variance and the shape of the predictions, and then tests on the shared 20,000-customer churn table when Extra Trees beats a random forest and when it loses.</p>

  <h2 id="et-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Extra Trees</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>K random columns per node, as in a forest</li>
          <li>One <b>random cut-off</b> per column, uniform in [node min, node max]</li>
          <li>Keep the best of the K random candidates</li>
          <li><b>No bootstrap</b> by default: every tree sees all rows</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Effects</div>
        <ul>
          <li>Each tree weaker, trees far less alike (lower ρ)</li>
          <li>Ensemble variance lowest of the bagging family</li>
          <li>Smoother predictions: random steps average into lines</li>
          <li>~3× faster training, but more leaves per tree</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Parameters</div>
        <ul>
          <li><b>max_features</b> (K): the main knob, often larger than a forest's</li>
          <li>K = 1: totally randomised trees</li>
          <li><b>min_samples_split</b> (n_min): smoothing for noisy data</li>
          <li><code>bootstrap=False</code> → no OOB score</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When it wins / loses</div>
        <ul>
          <li>Wins: smooth targets, large data, after tuning K up</li>
          <li>Loses: many junk columns at small K, skewed columns</li>
          <li>Copies noise with few columns at defaults</li>
          <li>Like every average: no bias reduction</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="et-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Randomising the Cut-off</span><span class="rm-sub">what Extra Trees changes in a random forest</span></div></div>
      <div class="rm-item rm-done" data-target="et-hand"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">One Random Split by Hand</span><span class="rm-sub">how bad is a random cut, really?</span></div></div>
      <div class="rm-item rm-done" data-target="et-algo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Extra Trees Algorithm</span><span class="rm-sub">steps, parameters and the extremes of K</span></div></div>
      <div class="rm-item rm-done" data-target="et-bv"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Bias and Variance</span><span class="rm-sub">weaker trees, better ensemble, measured</span></div></div>
      <div class="rm-item rm-done" data-target="et-smooth"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Smoothness, and Copying the Noise</span><span class="rm-sub">stairs vs lines, and the fix for noisy data</span></div></div>
      <div class="rm-item rm-done" data-target="et-params"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Parameters, Speed and Size</span><span class="rm-sub">each knob on the churn data</span></div></div>
      <div class="rm-item rm-done" data-target="et-when"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">When It Beats a Random Forest</span><span class="rm-sub">smooth targets, junk columns, speed</span></div></div>
      <div class="rm-item rm-done" data-target="et-scratch"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Extra Trees From Scratch</span><span class="rm-sub">random splits in 40 lines</span></div></div>
      <div class="rm-item rm-done" data-target="et-cmp"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Bagging vs Random Forest vs Extra Trees</span><span class="rm-sub">the whole branch side by side</span></div></div>
      <div class="rm-item rm-done" data-target="et-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">K, OOB, noise, skewed columns</span></div></div>
      <div class="rm-item rm-done" data-target="et-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, numbers</span></div></div>
      <div class="rm-item rm-done" data-target="et-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions asked about Extra Trees</span></div></div>
    </div>
  </div>

  <h2 id="et-idea"><span class="num">01</span>Randomising the Cut-off</h2>
  <p>The <a class="xref" data-note="ml_rf">Random Forest</a> made its trees less alike by letting each split see only a random handful of columns. But on every column it does see, a forest tree still searches for the <em>best</em> cut-off: it sorts the rows by that column, tries every midpoint between neighbouring values, computes the impurity drop of each, and keeps the best. That search has two costs. On similar data the best cut-off lands in nearly the same place in every tree, so the trees remain fairly alike. And the sorting and scanning is the slowest part of training: with n rows in a node there are up to n − 1 candidate cut-offs per column, plus the sort.</p>
  <p><strong>Extra Trees</strong> skips the search. For each column it is allowed to look at, it draws <em>one</em> cut-off at random, anywhere between that column's smallest and largest value among the rows in the node. It scores those few random candidates (one per drawn column) and keeps the best. So there are two layers of randomness: <em>which columns</em> are considered (K random columns per node, the parameter <code>max_features</code>, exactly as in a forest) and <em>where</em> each column is cut (one uniform random cut-off instead of the best one). And one thing is removed: by default there is no bootstrap, so every tree is grown on the full training set. The random cut-offs already make the trees different enough, and using all the rows keeps each tree's bias lower, as section 04 will measure.</p>
  <p>Think of bakers who must each cut a cake so that one piece holds most of the cherries. A careful baker measures every possible position with a ruler and picks the perfect one: slow, and every careful baker cuts in the same place. An Extra Trees baker eyeballs one random cut on each of a few cakes, keeps whichever cut worked best, and moves on: fast, a bit worse each time, and every baker cuts somewhere different. Average the opinions of 300 such bakers and their random errors cancel. Note that the "extra" in the name means extra <em>randomness</em>, not extra trees, and that the cut-off is random only within the range of the rows that reached the node, so it always falls inside the data. In sklearn the model is <code>ExtraTreesClassifier</code> or <code>ExtraTreesRegressor</code>; a single tree is <code>ExtraTreeClassifier</code> or <code>ExtraTreeRegressor</code>.</p>

  <h2 id="et-hand"><span class="num">02</span>One Random Split by Hand</h2>
  <p>"Pick a random cut and keep the best" sounds as if it should be terrible. To see how bad it really is, use the diary's two numeric columns, the humidity reading HumPct (65–96%) and the temperature TempC (18–29 °C), to predict Play. The diary lives in <code>play.py</code>:</p>
  <div class="fx" data-lang="py">import pandas as pd
rows = [  # Outlook,   Temp,  Humidity, Wind,    Play, HumPct, TempC, Turnout
    ("Sunny",    "Hot",  "High",   "Weak",   "No",  85,  29, 24),
    ("Sunny",    "Hot",  "High",   "Strong", "No",  90,  27, 20),
    ("Overcast", "Hot",  "High",   "Weak",   "Yes", 86,  28, 36),
    ("Rain",     "Mild", "High",   "Weak",   "Yes", 96,  21, 32),
    ("Rain",     "Cool", "Normal", "Weak",   "Yes", 80,  20, 44),
    ("Rain",     "Cool", "Normal", "Strong", "No",  70,  18, 22),
    ("Overcast", "Cool", "Normal", "Strong", "Yes", 65,  18, 42),
    ("Sunny",    "Mild", "High",   "Weak",   "No",  95,  22, 26),
    ("Sunny",    "Cool", "Normal", "Weak",   "Yes", 70,  21, 40),
    ("Rain",     "Mild", "Normal", "Weak",   "Yes", 80,  24, 46),
    ("Sunny",    "Mild", "Normal", "Strong", "Yes", 70,  24, 38),
    ("Overcast", "Mild", "High",   "Strong", "Yes", 90,  22, 38),
    ("Overcast", "Hot",  "Normal", "Weak",   "Yes", 75,  27, 48),
    ("Rain",     "Mild", "High",   "Strong", "No",  91,  22, 20)]
df = pd.DataFrame(rows, columns=["Outlook", "Temp", "Humidity", "Wind", "Play", "HumPct", "TempC", "Turnout"])
df.index = [f"D{i}" for i in range(1, 15)]</div>
  <p>The root holds all 14 days, 9 played and 5 not, so its Gini impurity is 1 − (9/14)² − (5/14)² = 0.459. Extra Trees with K = 2 (both columns) draws one cut-off per column: humidity uniformly between 65 and 96, temperature between 18 and 29. Suppose the draws are HumPct ≤ 89.96 and TempC ≤ 26.89. The humidity cut puts the 9 days with humidity 65–86% on the left (7 played, 2 not: Gini 1 − (7/9)² − (2/9)² = 0.346) and 5 days on the right (2 played, 3 not: Gini 0.48). The weighted Gini after the split is 9/14 × 0.346 + 5/14 × 0.48 = 0.394, a drop of 0.459 − 0.394 = 0.066. The temperature cut leaves 10 days on the left (7 and 3: Gini 0.42) and 4 on the right (2 and 2: Gini 0.5), a weighted Gini of 0.443 and a drop of only 0.016. Extra Trees keeps the humidity cut. The code does both procedures, the random draw and CART's full search:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
yes = (df.Play == "Yes").astype(int).values             # 9 played, 5 not
def gini(lab):
    if len(lab) == 0: return 0.0
    p = lab.mean()
    return 1 - p**2 - (1 - p)**2
def drop(x, t):                                          # Gini decrease of the split x &lt;= t
    L, R = yes[x &lt;= t], yes[x &gt; t]
    return gini(yes) - (len(L) * gini(L) + len(R) * gini(R)) / len(yes)

rng = np.random.default_rng(5)
for name in ["HumPct", "TempC"]:                         # Extra Trees: ONE random cut-off per column
    x = df[name].values
    t = rng.uniform(x.min(), x.max())
    print(f"Extra Trees  {name:6s} &lt;= {t:5.2f}  drop {drop(x, t):.4f}")
for name in ["HumPct", "TempC"]:                         # CART: try every midpoint, keep the best
    x = df[name].values
    v = np.unique(x); mids = (v[:-1] + v[1:]) / 2
    best = max(mids, key=lambda t: drop(x, t))
    print(f"CART best    {name:6s} &lt;= {best:5.2f}  drop {drop(x, best):.4f}  ({len(mids)} cut-offs tried)")</div>
  <div class="fx" data-lang="text">Extra Trees  HumPct &lt;= 89.96  drop 0.0655
Extra Trees  TempC  &lt;= 26.89  drop 0.0163
CART best    HumPct &lt;= 82.50  drop 0.0918  (9 cut-offs tried)
CART best    TempC  &lt;= 28.50  drop 0.0636  (7 cut-offs tried)</div>
  <p><code>rng.uniform(x.min(), x.max())</code> is the entire Extra Trees cut-off "search": one random number per column. CART loops over every midpoint and finds HumPct ≤ 82.5, which separates the normal-humidity days from the humid ones, with a drop of 0.092. So the random split is worse: it leaves D1 (85%, not played) and D3 (86%, played) on the "dry" side, and a later split must sort them out. On a node with 10,000 rows CART's loop has up to 9,999 candidates per column plus a sort; Extra Trees still draws one number.</p>
  <p>How good is a random humidity cut on average? Between two neighbouring humidity readings every cut-off gives the same split, so we can list each gap, its chance (its width divided by the range of 31), and its drop:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
yes = (df.Play == "Yes").astype(int).values
def gini(lab):
    p = lab.mean()
    return 1 - p**2 - (1 - p)**2
def drop(x, t):
    L, R = yes[x &lt;= t], yes[x &gt; t]
    return gini(yes) - (len(L) * gini(L) + len(R) * gini(R)) / len(yes)
x = df.HumPct.values
v = np.unique(x)                                         # 65, 70, 75, 80, 85, 86, 90, 91, 95, 96
total = 0
for a, b in zip(v[:-1], v[1:]):                          # any cut between a and b gives the same split
    d = drop(x, (a + b) / 2); total += (b - a) * d
    print(f"cut in {a}-{b}: chance {b - a}/31, drop {d:.4f}")
print(f"expected drop of a random humidity cut: {total / (v[-1] - v[0]):.4f}")</div>
  <div class="fx" data-lang="text">cut in 65-70: chance 5/31, drop 0.0196
cut in 70-75: chance 5/31, drop 0.0092
cut in 75-80: chance 5/31, drop 0.0274
cut in 80-85: chance 5/31, drop 0.0918
cut in 85-86: chance 1/31, drop 0.0306
cut in 86-90: chance 4/31, drop 0.0655
cut in 90-91: chance 1/31, drop 0.0523
cut in 91-95: chance 4/31, drop 0.0068
cut in 95-96: chance 1/31, drop 0.0196
expected drop of a random humidity cut: 0.0365</div>
  <p>The best cut (anywhere between 80 and 85) is drawn with probability 5/31 = 16%, and the expected drop of a random cut, (5 × 0.0196 + 5 × 0.0092 + … + 1 × 0.0196)/31, is 0.037, about 40% of the best possible 0.092. Two things make this much less damaging in practice. With K columns, Extra Trees keeps the best of K random cuts, not just one. And trees are grown deep, so a weak split near the top is repaired by the splits below it. The real price is that trees need more splits to purify their leaves (section 06), not a much worse fit.</p>

  <h2 id="et-algo"><span class="num">03</span>The Extra Trees Algorithm</h2>
  <p>The full procedure, as the original paper states it, has three parameters: K, the number of columns tried at each node; n_min, the smallest node that may still be split; and M, the number of trees.</p>
  <div class="fx" data-lang="text">build_ensemble(S, M):                         # S = the full training set, no bootstrap
    return [build_tree(S) for i in 1..M]

build_tree(S):
    if |S| &lt; n_min  or  all labels in S are equal  or  every column is constant in S:
        return a leaf  (class shares, or the mean target)
    pick K columns at random among the columns that are NOT constant in S
    for each picked column a:
        c = a uniform random number between min(a) and max(a) in S
        candidate split: "a &lt;= c"
    keep the candidate with the largest impurity drop (Gini / variance)
    split S and recurse on both children</div>
  <p>Prediction is the same as in a forest: each tree sends the row to a leaf, and the ensemble averages the trees' class probabilities (and picks the largest) or their leaf values.</p>
  <table class="tbl">
    <tr><th>Paper</th><th>Meaning</th><th>Paper default</th><th>sklearn name</th><th>sklearn default</th></tr>
    <tr><td>K</td><td>columns (random candidates) per node</td><td>√p classification, p regression</td><td><code>max_features</code></td><td>"sqrt" (classifier), 1.0 (regressor)</td></tr>
    <tr><td>n_min</td><td>smallest node that may be split</td><td>2 classification, 5 regression</td><td><code>min_samples_split</code></td><td>2</td></tr>
    <tr><td>M</td><td>number of trees</td><td>100</td><td><code>n_estimators</code></td><td>100</td></tr>
    <tr><td>—</td><td>bootstrap rows per tree</td><td>no</td><td><code>bootstrap</code></td><td>False</td></tr>
  </table>
  <p>K controls how much the labels guide each split, and its two extremes are worth understanding. With <strong>K = 1</strong>, each node takes one random column and one random cut-off, and the labels play no part in choosing the split (on the diary root, a coin decides between humidity and temperature). The labels are used only to fill the leaves. These are called <strong>totally randomised trees</strong>: the tree structure is independent of the target. Averaged over many trees they still work as a kind of adaptive smoother, but usually worse than larger K. With <strong>K = p</strong>, every column gets one random cut, and the best of them wins: the labels now choose the column, but the cut-off stays random. This is often the best setting for regression, and, as section 06 shows, on the churn data for classification too. Think of K as how many job candidates an interviewer sees before hiring, where each candidate answers just one random question: K = 1 hires whoever walks in first; K = all sees everyone but still judges each on one question; CART's full search interviews everyone thoroughly, which gives the best single hire but takes longest, and every company hires the same person.</p>
  <p>Because each candidate is a random cut and therefore weaker, Extra Trees often wants a <em>larger</em> K than a random forest on the same data, so never copy a forest's tuned <code>max_features</code> across. Also note that sklearn's regressor default of 1.0 (all columns) matches the paper.</p>

  <h2 id="et-bv"><span class="num">04</span>Bias and Variance</h2>
  <p>The promise of Extra Trees is "each tree a bit worse, the ensemble a bit better". We can test that by splitting the error into its parts (see <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>). <strong>Bias²</strong> measures how far the <em>average</em> model, over many possible training sets, is from the truth; <strong>variance</strong> measures how much the model jumps from one training set to another. Both can be measured directly on a made-up problem whose truth we know: <code>make_friedman1</code>, a smooth curved function of 5 inputs plus 5 useless inputs. The code draws 20 training sets of 300 rows, fits each model on each, and predicts 500 fixed test points:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_friedman1
from sklearn.tree import DecisionTreeRegressor, ExtraTreeRegressor
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
Xg, fg = make_friedman1(n_samples=500, noise=0.0, random_state=99)    # fixed test points, noise-free truth
models = {"one CART tree":       lambda s: DecisionTreeRegressor(random_state=s),
          "one extra tree":      lambda s: ExtraTreeRegressor(max_features=1.0, random_state=s),
          "random forest (100)": lambda s: RandomForestRegressor(100, random_state=s, n_jobs=-1),
          "extra trees (100)":   lambda s: ExtraTreesRegressor(100, random_state=s, n_jobs=-1)}
for name, make in models.items():
    P = []
    for s in range(20):                                   # 20 different training sets of 300 rows
        X, y = make_friedman1(n_samples=300, noise=1.0, random_state=s)
        P.append(make(s).fit(X, y).predict(Xg))
    P = np.array(P)
    bias2 = np.mean((P.mean(0) - fg)**2)                  # how far the AVERAGE model is from the truth
    var = np.mean(P.var(0))                               # how much the model jumps between training sets
    print(f"{name:20s} bias^2 {bias2:.2f}  variance {var:.2f}  sum {bias2 + var:.2f}")</div>
  <div class="fx" data-lang="text">one CART tree        bias^2 3.25  variance 7.74  sum 10.99
one extra tree       bias^2 3.52  variance 9.81  sum 13.33
random forest (100)  bias^2 3.52  variance 1.08  sum 4.60
extra trees (100)    bias^2 3.07  variance 0.71  sum 3.79</div>
  <p>Read the output in two halves. For <strong>single trees</strong>, one extra tree is worse than one CART tree (variance 9.81 against 7.74): random cuts make it a noisier learner. For <strong>ensembles</strong> the picture flips. The Extra Trees ensemble has the lowest variance (0.71 against the forest's 1.08), because its trees are so different from each other that averaging cancels more of their errors. In the formula for the variance of an average, ρσ² + (1 − ρ)σ²/M, random cuts raise each tree's σ² but lower the correlation ρ by much more. And its bias² is lower than the forest's too (3.07 against 3.52), because each forest tree sees a bootstrap sample with only about 63% of the distinct rows, while every extra tree sees all 300. That is exactly why the paper dropped the bootstrap. The total, bias² plus variance, is 3.79 against the forest's 4.60, about 18% lower.</p>

  <h2 id="et-smooth"><span class="num">05</span>Smoothness, and Copying the Noise</h2>
  <p>Random cut-offs also change the <em>shape</em> of the predictions. Predict the diary's turnout from humidity with 300 trees of each kind, and look at humidities between the diary's readings:</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
from play import df
X, y = df[["HumPct"]], df.Turnout
rf = RandomForestRegressor(n_estimators=300, random_state=0).fit(X, y)
et = ExtraTreesRegressor(n_estimators=300, random_state=0).fit(X, y)
grid = pd.DataFrame({"HumPct": [75, 80, 82.5, 85, 87.5, 90]})
print("humidity:    ", grid.HumPct.tolist())
print("forest:      ", rf.predict(grid).round(1).tolist())
print("extra trees: ", et.predict(grid).round(1).tolist())</div>
  <div class="fx" data-lang="text">humidity:     [75.0, 80.0, 82.5, 85.0, 87.5, 90.0]
forest:       [43.3, 44.8, 43.2, 29.2, 31.9, 28.7]
extra trees:  [47.9, 44.9, 35.2, 24.2, 33.5, 29.0]</div>
  <p>Look at 82.5%, halfway between the drier days (80%: 44 and 46 members) and the humid one (85%: 24). Almost every forest tree cuts at a midpoint, and 82.5 is itself the midpoint of 80 and 85, so the forest keeps 82.5 on the dry side and predicts the dry level, 43.2. Extra trees cut anywhere between 80 and 85, so about half of them put 82.5 on each side, and their average, 35.2, sits in between. Notice also that at 85%, where the diary has a single day with 24 members, Extra Trees predicts 24.2, reproducing that day almost exactly, while the forest says 29.2.</p>
  <p>Both effects become clear with one input and more points. A forest's cut-offs are always midpoints between training values, so all its trees cut in nearly the same few places, and their average is still a staircase. Extra Trees' cut-offs fall anywhere, so the steps of different trees land in different places, and averaging hundreds of randomly placed steps gives something close to a straight line between neighbouring points. The picture is a real run on 30 noisy points from a sine curve:</p>
<figure class="viz"><svg viewBox="0 0 720 230" width="720">
<rect x="30" y="30" width="300" height="160" class="fs" stroke="currentColor" stroke-opacity="0.3"/>
<text x="180" y="20" text-anchor="middle" font-size="13" font-weight="600">Random forest (300 trees)</text>
<polyline fill="none" stroke-width="1.6" class="sb" points="30.0,76.3 31.0,76.3 32.0,76.3 33.0,76.3 34.0,76.3 35.0,76.3 36.0,76.3 37.0,76.3 38.0,76.3 39.0,76.3 40.0,76.3 41.0,76.3 42.0,76.3 43.0,76.3 44.0,76.3 45.1,76.3 46.1,76.3 47.1,76.3 48.1,76.3 49.1,76.3 50.1,76.3 51.1,76.3 52.1,76.3 53.1,76.3 54.1,76.3 55.1,76.3 56.1,76.3 57.1,76.3 58.1,76.3 59.1,76.3 60.1,76.3 61.1,76.3 62.1,76.3 63.1,67.6 64.1,67.6 65.1,67.6 66.1,67.6 67.1,67.6 68.1,67.6 69.1,64.1 70.1,64.1 71.1,64.1 72.1,64.1 73.1,64.1 74.1,64.1 75.2,64.1 76.2,63.6 77.2,64.1 78.2,64.1 79.2,64.1 80.2,64.1 81.2,64.1 82.2,64.1 83.2,54.7 84.2,53.7 85.2,53.7 86.2,53.7 87.2,53.7 88.2,53.7 89.2,53.7 90.2,50.5 91.2,51.1 92.2,51.1 93.2,51.1 94.2,51.1 95.2,50.8 96.2,50.8 97.2,50.8 98.2,50.7 99.2,50.7 100.2,50.7 101.2,50.7 102.2,50.7 103.2,50.5 104.2,50.5 105.3,50.5 106.3,50.4 107.3,50.4 108.3,50.4 109.3,49.1 110.3,49.1 111.3,49.1 112.3,48.8 113.3,49.2 114.3,49.2 115.3,49.2 116.3,48.9 117.3,48.9 118.3,48.9 119.3,49.4 120.3,50.7 121.3,51.2 122.3,51.2 123.3,51.2 124.3,51.2 125.3,51.2 126.3,51.2 127.3,51.2 128.3,51.8 129.3,51.8 130.3,51.8 131.3,51.8 132.3,51.8 133.3,51.8 134.3,51.8 135.4,52.4 136.4,52.4 137.4,52.4 138.4,54.2 139.4,58.2 140.4,58.2 141.4,58.2 142.4,65.8 143.4,65.8 144.4,65.8 145.4,65.8 146.4,65.8 147.4,67.0 148.4,67.0 149.4,67.0 150.4,72.3 151.4,77.7 152.4,77.7 153.4,77.7 154.4,79.4 155.4,79.4 156.4,79.4 157.4,82.2 158.4,85.8 159.4,85.8 160.4,86.3 161.4,88.1 162.4,88.4 163.4,88.4 164.4,88.4 165.5,88.4 166.5,92.1 167.5,92.1 168.5,92.1 169.5,94.0 170.5,94.3 171.5,94.4 172.5,94.4 173.5,94.4 174.5,94.4 175.5,94.4 176.5,93.1 177.5,93.6 178.5,93.8 179.5,95.6 180.5,102.1 181.5,107.5 182.5,108.7 183.5,108.8 184.5,108.8 185.5,108.8 186.5,110.4 187.5,112.5 188.5,118.3 189.5,118.3 190.5,118.3 191.5,118.3 192.5,118.3 193.5,118.3 194.5,118.3 195.6,118.5 196.6,123.2 197.6,123.2 198.6,131.4 199.6,131.4 200.6,131.4 201.6,131.4 202.6,131.4 203.6,141.8 204.6,142.0 205.6,142.2 206.6,143.0 207.6,143.0 208.6,143.0 209.6,143.0 210.6,143.0 211.6,144.5 212.6,143.7 213.6,143.7 214.6,143.7 215.6,143.7 216.6,143.7 217.6,143.8 218.6,143.8 219.6,143.8 220.6,143.8 221.6,151.7 222.6,151.7 223.6,151.7 224.6,151.7 225.7,151.9 226.7,151.9 227.7,152.5 228.7,152.5 229.7,152.5 230.7,152.9 231.7,152.9 232.7,153.0 233.7,153.0 234.7,153.0 235.7,148.2 236.7,148.2 237.7,148.2 238.7,148.2 239.7,150.5 240.7,150.5 241.7,151.0 242.7,151.2 243.7,151.2 244.7,151.2 245.7,151.2 246.7,151.2 247.7,151.2 248.7,154.0 249.7,154.0 250.7,154.9 251.7,154.9 252.7,155.2 253.7,155.2 254.7,166.9 255.8,166.9 256.8,172.4 257.8,172.4 258.8,172.4 259.8,172.4 260.8,172.4 261.8,172.4 262.8,172.4 263.8,172.4 264.8,172.4 265.8,172.4 266.8,173.3 267.8,173.3 268.8,172.5 269.8,172.5 270.8,172.5 271.8,172.9 272.8,172.9 273.8,172.9 274.8,172.9 275.8,172.9 276.8,172.9 277.8,172.9 278.8,172.9 279.8,169.8 280.8,169.8 281.8,163.6 282.8,163.6 283.8,163.1 284.8,163.1 285.9,161.9 286.9,161.9 287.9,161.5 288.9,161.5 289.9,160.4 290.9,160.4 291.9,160.2 292.9,160.2 293.9,160.2 294.9,160.2 295.9,160.2 296.9,163.0 297.9,163.0 298.9,163.0 299.9,163.0 300.9,162.0 301.9,162.0 302.9,160.9 303.9,160.9 304.9,155.5 305.9,155.5 306.9,151.1 307.9,151.1 308.9,151.1 309.9,150.9 310.9,145.0 311.9,145.0 312.9,141.9 313.9,141.9 314.9,141.6 316.0,148.5 317.0,144.6 318.0,144.5 319.0,144.5 320.0,132.7 321.0,130.6 322.0,135.4 323.0,136.3 324.0,136.3 325.0,133.1 326.0,133.1 327.0,133.1 328.0,133.1 329.0,133.1 330.0,133.1"/>
<circle cx="54.3" cy="84.5" r="2.6" class="fr sr"/>
<circle cx="70.0" cy="63.9" r="2.6" class="fr sr"/>
<circle cx="82.4" cy="70.4" r="2.6" class="fr sr"/>
<circle cx="83.3" cy="47.0" r="2.6" class="fr sr"/>
<circle cx="97.1" cy="48.4" r="2.6" class="fr sr"/>
<circle cx="135.0" cy="47.6" r="2.6" class="fr sr"/>
<circle cx="140.9" cy="52.1" r="2.6" class="fr sr"/>
<circle cx="142.9" cy="71.5" r="2.6" class="fr sr"/>
<circle cx="159.1" cy="84.7" r="2.6" class="fr sr"/>
<circle cx="173.1" cy="94.9" r="2.6" class="fr sr"/>
<circle cx="178.1" cy="92.1" r="2.6" class="fr sr"/>
<circle cx="179.4" cy="92.7" r="2.6" class="fr sr"/>
<circle cx="180.1" cy="107.9" r="2.6" class="fr sr"/>
<circle cx="183.4" cy="111.1" r="2.6" class="fr sr"/>
<circle cx="193.2" cy="124.9" r="2.6" class="fr sr"/>
<circle cx="212.2" cy="145.0" r="2.6" class="fr sr"/>
<circle cx="212.7" cy="142.3" r="2.6" class="fr sr"/>
<circle cx="229.7" cy="157.5" r="2.6" class="fr sr"/>
<circle cx="241.5" cy="145.5" r="2.6" class="fr sr"/>
<circle cx="266.7" cy="176.2" r="2.6" class="fr sr"/>
<circle cx="270.6" cy="173.9" r="2.6" class="fr sr"/>
<circle cx="291.5" cy="159.2" r="2.6" class="fr sr"/>
<circle cx="300.7" cy="165.8" r="2.6" class="fr sr"/>
<circle cx="308.7" cy="153.5" r="2.6" class="fr sr"/>
<circle cx="312.8" cy="146.0" r="2.6" class="fr sr"/>
<circle cx="312.9" cy="138.9" r="2.6" class="fr sr"/>
<circle cx="317.6" cy="153.3" r="2.6" class="fr sr"/>
<circle cx="320.7" cy="125.2" r="2.6" class="fr sr"/>
<circle cx="322.9" cy="138.7" r="2.6" class="fr sr"/>
<circle cx="325.2" cy="131.2" r="2.6" class="fr sr"/>
<text x="180" y="215" text-anchor="middle" class="tm" font-size="11.5">steps: cuts only at midpoints between points</text>
<rect x="390" y="30" width="300" height="160" class="fs" stroke="currentColor" stroke-opacity="0.3"/>
<text x="540" y="20" text-anchor="middle" font-size="13" font-weight="600">Extra Trees (300 trees)</text>
<polyline fill="none" stroke-width="1.6" class="st" points="390.0,84.5 391.0,84.5 392.0,84.5 393.0,84.5 394.0,84.5 395.0,84.5 396.0,84.5 397.0,84.5 398.0,84.5 399.0,84.5 400.0,84.5 401.0,84.5 402.0,84.5 403.0,84.5 404.0,84.5 405.1,84.5 406.1,84.5 407.1,84.5 408.1,84.5 409.1,84.5 410.1,84.5 411.1,84.5 412.1,84.5 413.1,84.5 414.1,84.5 415.1,83.2 416.1,81.5 417.1,80.2 418.1,78.9 419.1,77.9 420.1,77.1 421.1,75.6 422.1,73.9 423.1,72.9 424.1,71.6 425.1,70.1 426.1,69.0 427.1,67.3 428.1,66.1 429.1,65.1 430.1,64.0 431.1,64.4 432.1,64.9 433.1,65.3 434.1,65.8 435.2,66.3 436.2,67.1 437.2,67.5 438.2,68.0 439.2,68.7 440.2,69.2 441.2,69.7 442.2,70.4 443.2,50.1 444.2,47.1 445.2,47.2 446.2,47.3 447.2,47.4 448.2,47.6 449.2,47.7 450.2,47.8 451.2,47.8 452.2,47.9 453.2,48.0 454.2,48.1 455.2,48.2 456.2,48.3 457.2,48.4 458.2,48.4 459.2,48.4 460.2,48.3 461.2,48.3 462.2,48.3 463.2,48.3 464.2,48.3 465.3,48.3 466.3,48.3 467.3,48.2 468.3,48.2 469.3,48.2 470.3,48.2 471.3,48.1 472.3,48.1 473.3,48.1 474.3,48.1 475.3,48.0 476.3,48.0 477.3,48.0 478.3,47.9 479.3,47.9 480.3,47.9 481.3,47.9 482.3,47.9 483.3,47.9 484.3,47.8 485.3,47.8 486.3,47.8 487.3,47.7 488.3,47.7 489.3,47.7 490.3,47.7 491.3,47.6 492.3,47.6 493.3,47.6 494.3,47.6 495.4,47.8 496.4,48.6 497.4,49.3 498.4,50.1 499.4,50.9 500.4,51.6 501.4,56.5 502.4,66.6 503.4,71.7 504.4,72.6 505.4,73.7 506.4,74.4 507.4,75.6 508.4,76.7 509.4,77.2 510.4,78.1 511.4,79.1 512.4,79.9 513.4,80.5 514.4,81.7 515.4,82.5 516.4,83.1 517.4,83.7 518.4,84.2 519.4,84.9 520.4,85.9 521.4,86.6 522.4,87.5 523.4,88.2 524.4,89.0 525.5,89.4 526.5,90.3 527.5,90.9 528.5,91.6 529.5,92.5 530.5,93.0 531.5,93.8 532.5,94.5 533.5,94.7 534.5,94.2 535.5,93.7 536.5,93.0 537.5,92.5 538.5,92.3 539.5,96.2 540.5,108.3 541.5,109.4 542.5,110.2 543.5,111.3 544.5,112.5 545.5,113.7 546.5,115.4 547.5,117.0 548.5,118.3 549.5,119.8 550.5,120.9 551.5,122.4 552.5,123.8 553.5,125.0 554.5,126.5 555.6,128.1 556.6,129.0 557.6,130.2 558.6,131.7 559.6,132.3 560.6,133.6 561.6,134.8 562.6,135.7 563.6,136.5 564.6,137.2 565.6,138.2 566.6,139.2 567.6,140.2 568.6,141.5 569.6,142.4 570.6,143.4 571.6,144.3 572.6,142.6 573.6,143.3 574.6,144.1 575.6,145.2 576.6,145.9 577.6,147.0 578.6,147.9 579.6,148.6 580.6,149.4 581.6,150.1 582.6,150.6 583.6,151.8 584.6,152.7 585.7,153.5 586.7,154.6 587.7,155.7 588.7,156.6 589.7,157.5 590.7,156.9 591.7,155.6 592.7,154.7 593.7,153.1 594.7,151.9 595.7,151.0 596.7,149.8 597.7,148.8 598.7,147.9 599.7,147.1 600.7,146.3 601.7,146.1 602.7,147.0 603.7,147.5 604.7,148.5 605.7,149.4 606.7,150.1 607.7,151.7 608.7,153.0 609.7,154.1 610.7,155.5 611.7,156.7 612.7,158.3 613.7,158.9 614.7,159.8 615.8,161.4 616.8,162.3 617.8,164.1 618.8,165.9 619.8,166.9 620.8,168.1 621.8,168.9 622.8,170.4 623.8,172.5 624.8,173.8 625.8,175.2 626.8,176.1 627.8,175.6 628.8,175.0 629.8,174.3 630.8,173.8 631.8,173.2 632.8,172.5 633.8,172.0 634.8,171.3 635.8,170.4 636.8,169.6 637.8,168.9 638.8,168.2 639.8,167.7 640.8,167.1 641.8,166.7 642.8,166.1 643.8,165.4 644.8,164.5 645.9,163.7 646.9,162.7 647.9,161.8 648.9,161.3 649.9,160.5 650.9,159.7 651.9,159.5 652.9,160.1 653.9,160.7 654.9,161.4 655.9,162.4 656.9,163.2 657.9,163.8 658.9,164.5 659.9,165.3 660.9,165.4 661.9,163.8 662.9,162.3 663.9,160.9 664.9,159.4 665.9,157.8 666.9,156.4 667.9,154.6 668.9,153.1 669.9,151.4 670.9,149.5 671.9,147.4 672.9,138.9 673.9,141.8 674.9,144.8 676.0,148.0 677.0,151.6 678.0,150.1 679.0,141.1 680.0,131.3 681.0,126.7 682.0,132.2 683.0,138.4 684.0,135.3 685.0,132.0 686.0,131.2 687.0,131.2 688.0,131.2 689.0,131.2 690.0,131.2"/>
<circle cx="414.3" cy="84.5" r="2.6" class="fr sr"/>
<circle cx="430.0" cy="63.9" r="2.6" class="fr sr"/>
<circle cx="442.4" cy="70.4" r="2.6" class="fr sr"/>
<circle cx="443.3" cy="47.0" r="2.6" class="fr sr"/>
<circle cx="457.1" cy="48.4" r="2.6" class="fr sr"/>
<circle cx="495.0" cy="47.6" r="2.6" class="fr sr"/>
<circle cx="500.9" cy="52.1" r="2.6" class="fr sr"/>
<circle cx="502.9" cy="71.5" r="2.6" class="fr sr"/>
<circle cx="519.1" cy="84.7" r="2.6" class="fr sr"/>
<circle cx="533.1" cy="94.9" r="2.6" class="fr sr"/>
<circle cx="538.1" cy="92.1" r="2.6" class="fr sr"/>
<circle cx="539.4" cy="92.7" r="2.6" class="fr sr"/>
<circle cx="540.1" cy="107.9" r="2.6" class="fr sr"/>
<circle cx="543.4" cy="111.1" r="2.6" class="fr sr"/>
<circle cx="553.2" cy="124.9" r="2.6" class="fr sr"/>
<circle cx="572.2" cy="145.0" r="2.6" class="fr sr"/>
<circle cx="572.7" cy="142.3" r="2.6" class="fr sr"/>
<circle cx="589.7" cy="157.5" r="2.6" class="fr sr"/>
<circle cx="601.5" cy="145.5" r="2.6" class="fr sr"/>
<circle cx="626.7" cy="176.2" r="2.6" class="fr sr"/>
<circle cx="630.6" cy="173.9" r="2.6" class="fr sr"/>
<circle cx="651.5" cy="159.2" r="2.6" class="fr sr"/>
<circle cx="660.7" cy="165.8" r="2.6" class="fr sr"/>
<circle cx="668.7" cy="153.5" r="2.6" class="fr sr"/>
<circle cx="672.8" cy="146.0" r="2.6" class="fr sr"/>
<circle cx="672.9" cy="138.9" r="2.6" class="fr sr"/>
<circle cx="677.6" cy="153.3" r="2.6" class="fr sr"/>
<circle cx="680.7" cy="125.2" r="2.6" class="fr sr"/>
<circle cx="682.9" cy="138.7" r="2.6" class="fr sr"/>
<circle cx="685.2" cy="131.2" r="2.6" class="fr sr"/>
<text x="540" y="215" text-anchor="middle" class="tm" font-size="11.5">random cuts anywhere: lines joining the points</text>
</svg><figcaption>The same 30 noisy points (red), 300 trees each, default settings. The forest (blue) is a staircase. Extra Trees (teal) is close to straight lines between neighbouring points and passes through every training point, noise included. Drawn from a real run.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
rng = np.random.default_rng(4)
x = np.sort(rng.uniform(0, 3, 30)); y = np.sin(2 * x) + rng.normal(0, 0.15, 30)   # 30 noisy points
for name, m in [("random forest", RandomForestRegressor(300, random_state=0)),
                ("extra trees  ", ExtraTreesRegressor(300, random_state=0))]:
    m.fit(x.reshape(-1, 1), y)
    print(name, "R^2 on its own training points:", round(m.score(x.reshape(-1, 1), y), 3))</div>
  <div class="fx" data-lang="text">random forest R^2 on its own training points: 0.988
extra trees   R^2 on its own training points: 1.0</div>
  <p>The second line is the warning hidden in the picture. With no bootstrap and fully grown trees, every extra tree puts each training point in its own pure leaf, so every tree predicts that point's exact noisy value, and so does their average: R² = 1.0 on the training points. Between points it interpolates smoothly, but at the points it keeps all the noise. The forest's bootstrap leaves each point out of about 37% of the trees, so its prediction there is pulled toward the neighbours. With many input columns this rarely hurts, but with few columns and a noisy target it does. The code repeats the bias and variance measurement on a one-column problem, y = sin(3x) + 0.5x plus noise, with 30 training sets of 100 points:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
f = lambda x: np.sin(3 * x) + 0.5 * x                 # the true curve, ONE input column
grid = np.linspace(0, 3, 200).reshape(-1, 1)
models = {"extra trees, default":    lambda s: ExtraTreesRegressor(100, random_state=s, n_jobs=-1),
          "ET min_samples_split=10": lambda s: ExtraTreesRegressor(100, min_samples_split=10, random_state=s, n_jobs=-1),
          "ET bootstrap=True":       lambda s: ExtraTreesRegressor(100, bootstrap=True, random_state=s, n_jobs=-1),
          "random forest, default":  lambda s: RandomForestRegressor(100, random_state=s, n_jobs=-1)}
for name, make in models.items():
    P = []
    for s in range(30):                                # 30 training sets of 100 noisy points (noise sd 0.3)
        rng = np.random.default_rng(s)
        x = rng.uniform(0, 3, 100).reshape(-1, 1)
        P.append(make(s).fit(x, f(x.ravel()) + rng.normal(0, 0.3, 100)).predict(grid))
    P = np.array(P)
    bias2, var = np.mean((P.mean(0) - f(grid.ravel()))**2), np.mean(P.var(0))
    print(f"{name:24s} bias^2 {bias2:.4f}  variance {var:.4f}  bias^2 + variance {bias2 + var:.4f}")</div>
  <div class="fx" data-lang="text">extra trees, default     bias^2 0.0025  variance 0.0572  bias^2 + variance 0.0597
ET min_samples_split=10  bias^2 0.0031  variance 0.0111  bias^2 + variance 0.0142
ET bootstrap=True        bias^2 0.0018  variance 0.0292  bias^2 + variance 0.0310
random forest, default   bias^2 0.0022  variance 0.0394  bias^2 + variance 0.0416</div>
  <p>Now default Extra Trees has <em>more</em> variance than the forest (0.057 against 0.039): it reproduces every noisy point. Two cures work. <code>min_samples_split=10</code> (the paper's n_min) stops splitting nodes with fewer than 10 rows, so each leaf averages several points; variance falls to 0.011 and bias² plus variance to 0.014, about a third of the forest's. <code>bootstrap=True</code> also helps (0.031), by leaving each point out of some trees.</p>
  <p>The natural-looking alternative, <code>min_samples_leaf</code>, has a trap in sklearn's Extra Trees. When a random cut-off would leave fewer than <code>min_samples_leaf</code> rows on one side, the candidate is rejected and the splitter moves on to another <em>column</em>, not another cut-off. With only one column there is nothing else to try, so the node becomes a leaf, and many trees stop far too early:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import ExtraTreesRegressor, RandomForestRegressor
rng = np.random.default_rng(0)
x = rng.uniform(0, 3, 100).reshape(-1, 1)              # ONE input column, 100 rows
y = np.sin(3 * x.ravel()) + 0.5 * x.ravel()
for name, m in [("ET min_samples_leaf=5  ", ExtraTreesRegressor(100, min_samples_leaf=5, random_state=0)),
                ("ET min_samples_split=10", ExtraTreesRegressor(100, min_samples_split=10, random_state=0)),
                ("RF min_samples_leaf=5  ", RandomForestRegressor(100, min_samples_leaf=5, random_state=0))]:
    leaves = [t.get_n_leaves() for t in m.fit(x, y).estimators_]
    print(f"{name} average leaves per tree {np.mean(leaves):5.1f}   trees that never split: {sum(l == 1 for l in leaves)}")</div>
  <div class="fx" data-lang="text">ET min_samples_leaf=5   average leaves per tree   6.9   trees that never split: 10
ET min_samples_split=10 average leaves per tree  19.8   trees that never split: 0
RF min_samples_leaf=5   average leaves per tree  11.2   trees that never split: 0</div>
  <p>Ten of the 100 trees never split at all: their first random cut fell within the 5 lowest or 5 highest x values, it was rejected, and there was no second column to try, so each of them predicts the overall mean. The forest is unaffected because it searches only among valid cut-offs. For smoothing Extra Trees, especially with few columns, use <code>min_samples_split</code>.</p>

  <h2 id="et-params"><span class="num">06</span>Parameters, Speed and Size</h2>
  <p>The diary shows the mechanics, but 14 rows cannot rank settings. All large experiments in the tree notes use one shared churn table: 20,000 made-up customers, 12 columns from <code>make_classification</code> (6 useful, 2 mixtures of those, 4 useless) plus two pure-noise columns, split into 12,000 training, 3,000 validation and 5,000 test rows. It is saved as <code>churn.py</code>, and every churn block below starts from it:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,
                           n_clusters_per_class=3, class_sep=0.8, flip_y=0.05, random_state=7)
X = pd.DataFrame(X, columns=[f"f{i}" for i in range(12)])
rng = np.random.default_rng(0)
X["row_noise"] = rng.random(20000)               # pure noise, 20,000 different values
X["coin_noise"] = rng.integers(0, 2, 20000)      # pure noise, only 0 or 1
Xtmp, Xte, ytmp, yte = train_test_split(X, y, test_size=5000, stratify=y, random_state=0)
Xtr, Xva, ytr, yva = train_test_split(Xtmp, ytmp, test_size=3000, stratify=ytmp, random_state=0)</div>
  <p>The code trains 300 trees per setting on a single CPU core, so that training times can be compared, and reports validation accuracy, leaves per tree and fit time:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import ExtraTreesClassifier
def run(name, m):
    t0 = time.time(); m.fit(Xtr, ytr); sec = time.time() - t0
    leaves = np.mean([t.get_n_leaves() for t in m.estimators_])
    print(f"{name:34s} validation {m.score(Xva, yva):.3f}  leaves/tree {leaves:5.0f}  fit {sec:4.1f}s")
kw = dict(n_estimators=300, n_jobs=1, random_state=0)       # 1 core so the times compare fairly
run("random forest (sqrt)", RandomForestClassifier(**kw))
run("extra trees (sqrt) [default]", ExtraTreesClassifier(**kw))
run("extra trees, max_features=1", ExtraTreesClassifier(max_features=1, **kw))
run("extra trees, max_features=8", ExtraTreesClassifier(max_features=8, **kw))
run("extra trees, max_features=None", ExtraTreesClassifier(max_features=None, **kw))
run("extra trees, bootstrap=True", ExtraTreesClassifier(bootstrap=True, **kw))
run("extra trees, min_samples_split=10", ExtraTreesClassifier(min_samples_split=10, **kw))</div>
  <div class="fx" data-lang="text">random forest (sqrt)               validation 0.879  leaves/tree  1438  fit 17.3s
extra trees (sqrt) [default]       validation 0.878  leaves/tree  4800  fit  6.8s
extra trees, max_features=1        validation 0.832  leaves/tree  8195  fit  5.1s
extra trees, max_features=8        validation 0.891  leaves/tree  3045  fit  8.6s
extra trees, max_features=None     validation 0.893  leaves/tree  2540  fit 10.6s
extra trees, bootstrap=True        validation 0.872  leaves/tree  3242  fit  4.2s
extra trees, min_samples_split=10  validation 0.868  leaves/tree  2227  fit  5.0s</div>
  <p>First, speed. At default settings Extra Trees matches the forest's accuracy (0.878 against 0.879) and trains about two and a half times faster (6.8 s against 17.3 s). The reason is the work done at each node: for each drawn column a forest tree sorts the node's values (n log n work) and scans all cut-offs, while an extra tree only finds the minimum and maximum, draws one number and splits the rows (n work). The price is size: random cuts separate the classes less efficiently, and with no bootstrap each tree has all 12,000 distinct rows to isolate instead of about 7,600, so an extra tree has 4,800 leaves against a forest tree's 1,438. The saved model is bigger, and prediction walks longer paths. "Extra Trees is faster" is about <em>training</em>.</p>
  <p>Second, <code>max_features</code> matters most. With K = 1 (totally randomised trees), accuracy drops to 0.832 and the trees balloon to 8,195 leaves. With K = 8 or all 14 columns, Extra Trees reaches 0.891–0.893, well above the forest's 0.879 and above anything a forest scored on this data, because each split now sees more random candidates, so splits are better and trees smaller (2,540 leaves with all columns), while the random cut-offs still keep the trees diverse. It costs training time (10.6 s), but still less than the forest. <code>bootstrap=True</code> and <code>min_samples_split=10</code> lowered accuracy slightly here: on 12,000 rows with 14 columns, fully grown trees on all rows were best. (Timings are approximate, from a shared machine that was busy with other work; compare them only with each other.)</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Effect of raising it</th><th>Advice</th></tr>
    <tr><td><code>n_estimators</code></td><td>100</td><td>lower variance; never overfits</td><td>use a few hundred; single extra trees are weak</td></tr>
    <tr><td><code>max_features</code> (K)</td><td>"sqrt" / 1.0</td><td>better splits, less randomness, slower</td><td>tune first; try sqrt, 0.3, 0.6, 1.0</td></tr>
    <tr><td><code>min_samples_split</code> (n_min)</td><td>2</td><td>smoother, smaller trees, more bias</td><td>5–10 for noisy, low-dimensional data</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>1</td><td>smoother, but can reject random cuts</td><td>avoid with few columns</td></tr>
    <tr><td><code>max_depth</code></td><td>None</td><td>caps size and prediction time</td><td>use when the model is too big</td></tr>
    <tr><td><code>bootstrap</code></td><td>False</td><td>more diversity, more bias, enables OOB</td><td>helps on small noisy data</td></tr>
    <tr><td><code>oob_score</code></td><td>False</td><td>OOB score</td><td>needs <code>bootstrap=True</code>; otherwise cross-validate</td></tr>
    <tr><td><code>class_weight</code>, <code>n_jobs</code>, <code>random_state</code></td><td>None, 1 core, None</td><td>as in the random forest</td><td><code>n_jobs=-1</code>; always set a seed</td></tr>
  </table>
  <p>One consequence for practice: comparing a tuned forest with default Extra Trees, or the reverse, is not a fair comparison. At defaults the two tie here; after tuning <code>max_features</code> on both, Extra Trees wins. Tune both the same way on the same cross-validation folds.</p>

  <h2 id="et-when"><span class="num">07</span>When It Beats a Random Forest</h2>
  <p>One dataset is an anecdote. The code scores both models at their defaults (200 trees) with 3-fold cross-validation on three kinds of data: the churn training rows; the same rows with 50 extra columns of pure random junk; and friedman1, a smooth regression target (scored by R²).</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import ExtraTreesClassifier, RandomForestRegressor, ExtraTreesRegressor
from sklearn.datasets import make_friedman1
from sklearn.model_selection import cross_val_score
rng = np.random.default_rng(1)
junk = pd.concat([Xtr, pd.DataFrame(rng.normal(size=(len(Xtr), 50)), index=Xtr.index,
                                    columns=[f"junk{i}" for i in range(50)])], axis=1)   # 64 columns, 50 useless
Xf, yf = make_friedman1(n_samples=1000, noise=1.0, random_state=0)
cases = [("churn, 14 columns",             Xtr,  ytr, RandomForestClassifier, ExtraTreesClassifier, "accuracy"),
         ("churn + 50 junk columns",       junk, ytr, RandomForestClassifier, ExtraTreesClassifier, "accuracy"),
         ("friedman1 (smooth regression)", Xf,   yf,  RandomForestRegressor,  ExtraTreesRegressor,  "r2")]
for name, X_, y_, RF, ET, metric in cases:
    r = cross_val_score(RF(n_estimators=200, n_jobs=-1, random_state=0), X_, y_, cv=3, scoring=metric).mean()
    e = cross_val_score(ET(n_estimators=200, n_jobs=-1, random_state=0), X_, y_, cv=3, scoring=metric).mean()
    print(f"{name:30s} {metric:8s} RF {r:.3f}   ET {e:.3f}")</div>
  <div class="fx" data-lang="text">churn, 14 columns              accuracy RF 0.856   ET 0.853
churn + 50 junk columns        accuracy RF 0.807   ET 0.778
friedman1 (smooth regression)  r2       RF 0.847   ET 0.862</div>
  <p>At defaults the churn data is a tie (0.856 against 0.853), the smooth regression is a clear Extra Trees win (R² 0.862 against 0.847, matching the bias and variance result of section 04), and the data with 50 junk columns is a clear <strong>loss</strong> (0.778 against 0.807). The loss has a simple cause. With K = √64 = 8 of 64 columns, a node often draws only junk columns, or a useful column whose random cut-off happens to be poor while a junk column's random cut happens to look slightly better on the training rows. A forest at least picks the <em>best</em> cut on each drawn column, so a useful column usually beats the junk. The fix is to raise K so that useful columns are almost always among the candidates:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import ExtraTreesClassifier
from sklearn.model_selection import cross_val_score
rng = np.random.default_rng(1)
junk = pd.concat([Xtr, pd.DataFrame(rng.normal(size=(len(Xtr), 50)), index=Xtr.index,
                                    columns=[f"junk{i}" for i in range(50)])], axis=1)
for mf in ["sqrt", 0.3, None]:
    e = cross_val_score(ExtraTreesClassifier(n_estimators=200, max_features=mf, n_jobs=-1, random_state=0), junk, ytr, cv=3).mean()
    r = cross_val_score(RandomForestClassifier(n_estimators=200, max_features=mf, n_jobs=-1, random_state=0), junk, ytr, cv=3).mean()
    print(f"max_features={str(mf):5s}  random forest {r:.3f}   extra trees {e:.3f}")</div>
  <div class="fx" data-lang="text">max_features=sqrt   random forest 0.807   extra trees 0.778
max_features=0.3    random forest 0.833   extra trees 0.831
max_features=None   random forest 0.836   extra trees 0.856</div>
  <p>With every column as a candidate, Extra Trees scores 0.856 on the junk-laden data, as well as it did with no junk at all (0.853), because the best of 64 random cuts is nearly always on a useful column. The same change helps the forest less (0.836), so tuned, Extra Trees wins here too. So the pattern is: Extra Trees tends to win on smooth targets with numeric columns, when training time matters, and when it is allowed a large K; it tends to lose with many irrelevant columns at small K, with very few noisy columns at default settings, and with very skewed columns. Skewed columns deserve a word: the random cut-off is uniform over the column's <em>value range</em>, not over its rows. If most incomes are below 10 lakh but a few reach 5 crore, almost every random cut falls in the empty stretch above the bulk and separates nothing, so the column looks useless to Extra Trees. A log or rank transform fixes this, while it changes nothing for a forest. Since the two models cost about the same to try and each has one real knob, the practical advice is to run both with a small grid of <code>max_features</code> on the same folds and keep the better one. Extra Trees is also a favourite <em>diverse member</em> of a blend, because its errors differ from both a forest's and a booster's (<a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>).</p>

  <h2 id="et-scratch"><span class="num">08</span>Extra Trees From Scratch</h2>
  <p>To show there is nothing hidden, here is a complete Extra Trees classifier in four small functions: <code>gini</code> computes impurity, <code>random_split</code> draws K random columns with one uniform cut each and keeps the best, <code>grow</code> recurses with the paper's stopping rules, and <code>predict_one</code> walks a row down a tree. A tree is a nested tuple <code>(column, cut, left, right)</code>, and a leaf is just a number, P(churn). There is no bootstrap anywhere. Pure Python is slow, so it trains on the first 3,000 churn rows, and sklearn is trained on the same rows for comparison:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import ExtraTreesClassifier
def gini(y):
    p = y.mean()
    return 1 - p**2 - (1 - p)**2

def random_split(X, y, k, rng):
    """k random columns, ONE random cut-off each, keep the best."""
    best = None
    for j in rng.choice(X.shape[1], k, replace=False):
        lo, hi = X[:, j].min(), X[:, j].max()
        if lo == hi:                                   # constant in this node: skip
            continue
        t = rng.uniform(lo, hi)                        # no sorting, no search
        left = X[:, j] &lt;= t
        score = gini(y) - (left.sum() * gini(y[left]) + (~left).sum() * gini(y[~left])) / len(y)
        if best is None or score &gt; best[0]:
            best = (score, j, t)
    return best

def grow(X, y, k, rng, min_split=2):
    if len(y) &lt; min_split or y.min() == y.max():       # too small or pure: a leaf
        return y.mean()                                # the leaf stores P(class 1)
    s = random_split(X, y, k, rng)
    if s is None:                                      # every drawn column was constant
        return y.mean()
    _, j, t = s
    left = X[:, j] &lt;= t
    return (j, t, grow(X[left], y[left], k, rng, min_split), grow(X[~left], y[~left], k, rng, min_split))

def predict_one(node, x):
    while isinstance(node, tuple):
        j, t, l, r = node
        node = l if x[j] &lt;= t else r
    return node

class MyExtraTrees:
    def __init__(self, n_trees=100, k=3, seed=0):
        self.n_trees, self.k, self.rng = n_trees, k, np.random.default_rng(seed)
    def fit(self, X, y):                               # no bootstrap: every tree sees ALL rows
        self.trees = [grow(np.asarray(X), np.asarray(y), self.k, self.rng) for _ in range(self.n_trees)]
        return self
    def predict_proba1(self, X):
        return np.mean([[predict_one(t, x) for x in np.asarray(X)] for t in self.trees], axis=0)

Xs, ys = Xtr.iloc[:3000], ytr[:3000]                   # a smaller slice so pure Python stays quick
mine = MyExtraTrees(100, k=3).fit(Xs, ys)
sk = ExtraTreesClassifier(n_estimators=100, random_state=0).fit(Xs, ys)
print(f"from scratch: validation {np.mean((mine.predict_proba1(Xva) &gt; 0.5) == yva):.3f}")
print(f"sklearn     : validation {sk.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">from scratch: validation 0.831
sklearn     : validation 0.832</div>
  <p>The hand-written version scores 0.831 against sklearn's 0.832 on the same 3,000 training rows with K = 3 (= √14): a difference of one customer in a thousand. Notice that the whole split "search" is <code>rng.uniform(lo, hi)</code>, that constant columns are skipped (the paper only draws among non-constant columns), and that a node stops when it is pure, too small, or when every drawn column is constant. Replace the line <code>t = rng.uniform(lo, hi)</code> with a loop over all midpoints, keeping the best, and you have a random-forest tree (without the bootstrap).</p>

  <h2 id="et-cmp"><span class="num">09</span>Bagging vs Random Forest vs Extra Trees</h2>
  <p>Bagging, the random forest and Extra Trees are three ways of injecting randomness into deep trees, and the code measures how each one balances its two forces. For each method, 300 trees are trained on the churn data; for the first 50 trees it reports the average single-tree accuracy on validation and how often two trees give the same answer (a direct look at ρ):</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier, ExtraTreesClassifier
models = {
    "bagging (all columns)": BaggingClassifier(DecisionTreeClassifier(), n_estimators=300, n_jobs=-1, random_state=0),
    "random forest (sqrt)":  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0),
    "extra trees (sqrt)":    ExtraTreesClassifier(n_estimators=300, n_jobs=-1, random_state=0)}
for name, m in models.items():
    m.fit(Xtr, ytr)
    P = np.array([t.predict(Xva.values) for t in m.estimators_[:50]])    # 50 trees' answers
    agree = np.mean([np.mean(P[i] == P[j]) for i in range(50) for j in range(i)])
    one = np.mean([np.mean(P[i] == yva) for i in range(50)])
    print(f"{name:22s} one tree {one:.3f}  two trees agree {agree:.1%}  ensemble {m.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">bagging (all columns)  one tree 0.769  two trees agree 73.4%  ensemble 0.883
random forest (sqrt)   one tree 0.738  two trees agree 68.3%  ensemble 0.879
extra trees (sqrt)     one tree 0.700  two trees agree 63.5%  ensemble 0.878</div>
  <p>The logic of the whole family is in these three lines. Each step down the branch makes a single tree weaker (0.769 → 0.738 → 0.700) and two trees less alike (73% → 68% → 64% agreement). The ensemble is the balance of those two forces, and at default settings on this data they cancel almost exactly: the ensembles score 0.883, 0.879 and 0.878. The differences lie elsewhere: Extra Trees trains fastest, and it can be tuned furthest (section 06).</p>
  <table class="tbl">
    <tr><th></th><th><a class="xref" data-note="ml_bagging">Bagging</a></th><th><a class="xref" data-note="ml_rf">Random forest</a></th><th>Extra Trees</th></tr>
    <tr><td>Rows per tree</td><td>bootstrap</td><td>bootstrap</td><td>all rows (default)</td></tr>
    <tr><td>Columns per split</td><td>all p</td><td>random m (√p for classes)</td><td>random K (√p classes, p regression)</td></tr>
    <tr><td>Cut-off on a column</td><td>best (search)</td><td>best (search)</td><td>one uniform random draw</td></tr>
    <tr><td>Single-tree strength</td><td>highest</td><td>middle</td><td>lowest</td></tr>
    <tr><td>Correlation between trees</td><td>highest</td><td>middle</td><td>lowest</td></tr>
    <tr><td>Training speed</td><td>slowest</td><td>faster</td><td>fastest</td></tr>
    <tr><td>Model size</td><td>large</td><td>large</td><td>largest (more leaves)</td></tr>
    <tr><td>Shape of predictions</td><td>staircase</td><td>staircase</td><td>smoother</td></tr>
    <tr><td>OOB score</td><td>yes</td><td>yes</td><td>only with <code>bootstrap=True</code></td></tr>
    <tr><td>Base model</td><td>any</td><td>trees only</td><td>trees only</td></tr>
  </table>
  <p>All three are parallel, variance-reducing ensembles of deep trees, differing only in where the randomness enters: rows (bagging), rows and columns (random forest), columns and cut-offs (Extra Trees). None of them reduces bias: if every tree misses a pattern, the average misses it too. Reducing bias is the job of <a class="xref" data-note="ml_boosting">boosting</a>, which builds trees in sequence, each fitting what the current ensemble still gets wrong. The whole family is compared in <a class="xref" data-note="ml_trees">Tree Models: Overview &amp; How to Choose</a>.</p>

  <h2 id="et-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most frequent mistake is reusing a random forest's <code>max_features</code>. Because each candidate is a random cut, Extra Trees usually wants a larger K: on churn, all columns scored 0.893 against 0.878 for √p, and with 50 junk columns √p scored 0.778 until K was raised (0.856). Tune K separately for each model.</p>
  <p>The second is expecting an OOB score. With the default <code>bootstrap=False</code> every tree saw every row, so there are no out-of-bag rows, and asking for <code>oob_score=True</code> raises an error. Use cross-validation, or set <code>bootstrap=True</code>.</p>
  <p>The third is running defaults on noisy data with few columns. No bootstrap plus fully grown trees means the ensemble passes through every training point, noise included (training R² of 1.0 in section 05). Use <code>min_samples_split</code> of 5–10, or <code>bootstrap=True</code>, and avoid <code>min_samples_leaf</code> with few columns, since rejected random cuts are not retried on the same column.</p>
  <p>The fourth is feeding heavily skewed columns unchanged. Uniform cuts over the value range mostly land in the empty tail; log- or rank-transform such columns first. The fifth is assuming "faster" applies to prediction as well: training is faster, but trees have several times more leaves, so the model is bigger and can be slower to predict. Finally, like every averaging method, Extra Trees reduces variance only; it will not fix a pattern every tree misses.</p>

  <h2 id="et-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Extra Trees</b> (extremely randomised trees): M deep trees, each on <b>all</b> rows; at each node K random columns, one <b>uniform random cut-off</b> per column between the node's min and max, best candidate kept.</li>
    <li><b>K</b> = <code>max_features</code>: candidates per node. <b>K = 1</b>: totally randomised trees (labels never choose a split).</li>
    <li><b>n_min</b> = <code>min_samples_split</code>: smallest node that may be split; the paper's smoothing knob.</li>
    <li>Difference from a random forest: random cut-off instead of the best one; no bootstrap by default.</li>
  </ul>
  <h3>Formulas and numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Formula</th><th>Diary / example</th></tr>
    <tr><td>Random cut-off</td><td>t ~ Uniform(min of column in node, max)</td><td>humidity: uniform on [65, 96]</td></tr>
    <tr><td>Split kept</td><td>largest impurity drop among K random candidates</td><td>HumPct ≤ 89.96 (0.066) beats TempC ≤ 26.89 (0.016)</td></tr>
    <tr><td>Expected drop of a random cut</td><td>Σ (gap width / range) × drop</td><td>0.037 vs best 0.092; best gap hit 16% of the time</td></tr>
    <tr><td>Ensemble variance</td><td>ρσ² + (1 − ρ)σ²/M</td><td>random cuts raise σ², lower ρ more</td></tr>
    <tr><td>Work per node and column</td><td>O(n) vs forest O(n log n)</td><td>min, max, one draw vs sort and scan</td></tr>
    <tr><td>Paper defaults</td><td>K = √p (classes), p (regression); n_min = 2 (classes), 5 (regression)</td><td>sklearn: bootstrap=False</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.ensemble import ExtraTreesClassifier, ExtraTreesRegressor

et = ExtraTreesClassifier(n_estimators=300,
                          max_features="sqrt",     # K: tune first, often larger than for a forest
                          min_samples_split=2,     # n_min: raise to 5-10 for noisy data
                          bootstrap=False,         # True enables oob_score=True
                          n_jobs=-1, random_state=0)
et.fit(X_train, y_train)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>"Extra" means extra randomness, not extra trees.</li>
    <li>Don't copy a forest's <code>max_features</code>; Extra Trees often wants more.</li>
    <li>No OOB score unless <code>bootstrap=True</code>.</li>
    <li>Defaults copy noise on low-dimensional data; use <code>min_samples_split</code>, not <code>min_samples_leaf</code>.</li>
    <li>Skewed columns: transform first.</li>
    <li>Faster training, bigger model.</li>
  </ul>

  <h2 id="et-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are Extra Trees?</summary><div class="qa-body">Extremely randomised trees: an ensemble of deep trees in which each node tries K random columns, draws one random cut-off for each between the node's minimum and maximum, and keeps the best of those candidates. By default every tree is grown on all the training rows (no bootstrap), and predictions are averaged as in a random forest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does an Extra Trees split differ from a random forest split?</summary><div class="qa-body">Both draw K random columns. The forest finds the best cut-off on each (sort the values, try every midpoint) and keeps the best. Extra Trees draws one uniform random cut-off per column and keeps the best of those K random candidates. Extra Trees also uses all rows per tree by default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Extra Trees not bootstrap by default?</summary><div class="qa-body">The random cut-offs already make the trees diverse enough, and training each tree on the full sample lowers its bias, since a bootstrap sample holds only about 63% of the distinct rows. On friedman1 the Extra Trees ensemble had both lower bias² (3.07 against 3.52) and lower variance (0.71 against 1.08) than the random forest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Work a random split: 8 rows, 4 churn and 4 stay; the cut puts 4 churn and 1 stay on the left and 3 stay on the right. What is the Gini drop?</summary><div class="qa-body">Parent Gini = 0.5. Left: 1 − (0.8² + 0.2²) = 0.32; right: 0. Weighted: 5/8 × 0.32 = 0.2. Drop = 0.5 − 0.2 = 0.3. A perfect cut would give the full 0.5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do random cut-offs do to bias and variance?</summary><div class="qa-body">A single extra tree has more variance than a CART tree, because its splits are partly random. But the trees are far less correlated, so the ensemble's variance is lower than a forest's; and without the bootstrap the ensemble's bias is often lower too. With very small K or heavy smoothing, bias rises.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are totally randomised trees?</summary><div class="qa-body">Extra Trees with K = 1: one random column and one random cut-off at each node, so the labels never choose a split and only fill the leaves. They still work as an averaged smoother but are usually clearly weaker and much larger: on churn 0.832 with 8,195 leaves per tree, against 0.878 with 4,800 at K = √p.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Extra Trees faster to train, and what is the catch?</summary><div class="qa-body">Per node and column it finds the minimum and maximum, draws one number and partitions the rows, O(n), instead of sorting and scanning every cut-off, O(n log n). The catch: random cuts separate classes less efficiently, so trees grow several times more leaves, making the model bigger and possibly slower to predict.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you expect Extra Trees to beat a random forest, and when to lose?</summary><div class="qa-body">It tends to win on smooth targets with numeric inputs, on large data where training time matters, and once K is tuned upward. It tends to lose with many irrelevant columns at small K (junk columns' random cuts beat a useful column's poor random cut), with few noisy columns at default settings, and with heavily skewed columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are Extra Trees' predictions smoother than a forest's?</summary><div class="qa-body">A forest's trees all cut at midpoints between the same training values, so their steps stack in the same places and the average is still a staircase. Extra Trees' cuts fall at random positions, so averaging hundreds of randomly placed steps gives nearly straight lines between neighbouring training points.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does default Extra Trees reach a training R² of 1.0 in regression, and is that a problem?</summary><div class="qa-body">With no bootstrap and fully grown trees, every tree isolates every training point in its own leaf, so every tree, and their average, reproduces each training target exactly, noise included. With many columns it is often harmless; with few columns and noisy targets it raises variance. Fix it with min_samples_split of 5–10 or bootstrap=True.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is min_samples_leaf risky in sklearn's Extra Trees with few columns?</summary><div class="qa-body">A random cut that would leave fewer than min_samples_leaf rows on one side is rejected, and the splitter moves to another column rather than drawing another cut. With one column there is no other, so the node becomes a leaf; in our test 10 of 100 trees never split. min_samples_split does not have this problem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you get an OOB score from ExtraTreesClassifier?</summary><div class="qa-body">Only with bootstrap=True, which then allows oob_score=True. With the default bootstrap=False every tree saw every row, so there are no out-of-bag rows; use cross-validation instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Order bagging, random forest and Extra Trees by single-tree strength and by tree correlation.</summary><div class="qa-body">Strength: bagging &gt; random forest &gt; Extra Trees (single-tree accuracy on churn 0.769, 0.738, 0.700). Correlation: bagging &gt; random forest &gt; Extra Trees (two trees agree 73%, 68%, 64%). Each step adds randomness that weakens single trees but makes them less alike; the ensemble's accuracy is the balance, and at defaults on the churn data the three ended up nearly equal.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What problem do bagging, random forests and Extra Trees all leave unsolved?</summary><div class="qa-body">Bias. Averaging independent trees cancels their random errors but not a mistake they all share. Boosting builds trees in sequence, each fitting what the current ensemble still gets wrong, which reduces bias.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Extra Trees a good member of a voting or stacking ensemble?</summary><div class="qa-body">Its errors differ from a forest's (random cuts, smoother predictions, no bootstrap) and very much from a booster's (parallel deep trees versus sequential shallow ones). Blending models whose errors differ is what makes voting and stacking pay off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a skewed column hurt Extra Trees but not a random forest?</summary><div class="qa-body">Extra Trees draws its cut-off uniformly over the column's value range. If most values sit in a narrow band and a few are huge, almost every random cut falls in the empty tail and separates nothing, so the column rarely wins. A forest's cut-offs are midpoints between actual values, so it is unaffected. A log or rank transform fixes it.</div></details>
</main>
`
});
