// notes/ml/ml_extratrees.js — Extra Trees
Object.assign(TOPIC_CONTENT, {
  "ml_extratrees": `<main>
  <h1>Extra Trees</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Bagging</span><span>Extra Trees</span></div>
  <p class="lead">Extra Trees ("extremely randomised trees", Geurts, Ernst &amp; Wehenkel 2006) take the random forest one step further: at each split, besides drawing random columns, they draw the <em>cut-off</em> at random too, and by default every tree sees all the rows (no bootstrap). Each tree gets worse, the trees get much less alike, and training gets faster. This note works one random split by hand, gives the full algorithm, measures bias, variance, smoothness and speed, shows on real runs when it beats a random forest and when it loses, and builds it from scratch.</p>

  <h2 id="et-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<defs><marker id="et-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="245" y="8" width="150" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="30" text-anchor="middle" font-size="13">Decision Trees</text>
<rect x="245" y="64" width="150" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="86" text-anchor="middle" font-size="13">Ensemble Learning</text>
<line x1="320" y1="42" x2="320" y2="62" stroke="currentColor" marker-end="url(#et-a0)"/>
<rect x="60" y="122" width="170" height="34" rx="7" class="fb sb"/><text x="145" y="144" text-anchor="middle" font-size="13">Bagging &amp; Bootstrap</text>
<rect x="260" y="122" width="120" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="320" y="144" text-anchor="middle" font-size="13" class="tm">Boosting</text>
<rect x="410" y="122" width="160" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="490" y="144" text-anchor="middle" font-size="13" class="tm">Stacking &amp; Voting</text>
<line x1="300" y1="98" x2="160" y2="120" stroke="currentColor" marker-end="url(#et-a0)"/><line x1="320" y1="98" x2="320" y2="120" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#et-a0)"/><line x1="340" y1="98" x2="480" y2="120" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#et-a0)"/>
<rect x="20" y="182" width="150" height="38" rx="7" class="fb sb"/><text x="95" y="205" text-anchor="middle" font-size="13">Random Forest</text>
<rect x="200" y="182" width="140" height="38" rx="7" class="fg sg" stroke-width="3"/><text x="270" y="200" text-anchor="middle" font-size="13" font-weight="700">Extra Trees</text><text x="270" y="214" text-anchor="middle" font-size="10" class="tg">you are here</text>
<line x1="125" y1="156" x2="100" y2="180" stroke="currentColor" marker-end="url(#et-a0)"/><line x1="165" y1="156" x2="245" y2="180" stroke="currentColor" marker-end="url(#et-a0)"/>
<line x1="170" y1="201" x2="198" y2="201" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#et-a0)"/>
<text x="360" y="198" font-size="11" class="tm">random columns (like the forest)</text>
<text x="360" y="213" font-size="11" class="tm">+ random cut-offs, all rows</text>
</svg><figcaption>Extra Trees is the third and most random member of the bagging branch: a sibling of the random forest that also randomises the cut-off.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_rf">Random Forest</a></b><span>The forest lowered the correlation between trees by giving each split only a random handful of columns. But for each of those columns it still searches for the <em>best</em> cut-off, and the best cut-off on similar data is similar in every tree. So trees are still fairly alike (two forest trees agree on 68% of churn customers), and the search (sort the values, try every midpoint) is the slow part of training.</span></li>
    <li><b>This note adds: one random cut-off per column, and no bootstrap</b><span>For each drawn column, pick a cut-off uniformly at random between the node's min and max, and keep the best of those few random candidates. Trees agree less (64%), training is about 3× faster, and because there is no bootstrap each tree uses every row.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_boosting">How Boosting Works</a></b><span>All three bagging-branch methods (<a class="xref" data-note="ml_bagging">bagging</a>, forest, Extra Trees) only reduce variance by averaging independent trees. None can fix a mistake every tree shares (bias). Boosting builds trees in sequence to attack exactly that. Extra Trees is also a favourite <em>diverse member</em> in <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>.</span></li>
  </ol>
  <p>You should know how a tree scores a split with Gini (<a class="xref" data-note="ml_dtree">Decision Trees</a>), the variance formula ρσ² + (1−ρ)σ²/B (<a class="xref" data-note="ml_ensembles">Ensemble Learning</a>) and random column draws (<a class="xref" data-note="ml_rf">Random Forest</a>). Each is recalled in one line where needed.</p>

  <h2 id="et-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Small numbers come from the running example, the captain's 14-day cricket diary; large ones from the 20,000-customer churn table.</p>
  <ol class="story">
    <li><b>Randomise the cut-off too</b><span>Q: forest trees still search for the <em>best</em> cut-off on each drawn column, so they still cut in nearly the same places, and the search is the slow part. Can we make trees even less alike, and cheaper? → Draw one cut-off at random per column and keep the best of those few candidates; drop the bootstrap. But how bad is a random cut?</span></li>
    <li><b>One random split by hand</b><span>Q: what does a random cut cost? → On the diary root, the draws HumPct ≤ 89.96 (Gini drop 0.066) and TempC ≤ 26.89 (0.016): Extra Trees keeps the humidity cut, where CART would find ≤ 82.5 (0.092). A random humidity cut lands in the best interval only 16% of the time and removes 40% of the best drop on average. How do such splits make whole trees?</span></li>
    <li><b>The full algorithm</b><span>Q: what are the steps and knobs? → K random columns, one uniform cut each, best one wins, recurse until n_min rows; M trees on all rows. K = 1 ignores the labels entirely; K = p lets the labels pick the column. Is the result better or worse than a forest?</span></li>
    <li><b>Bias, variance &amp; smoothness</b><span>Q: what do random cuts do to the error? → Each tree is noisier, but trees are far less alike, so the ensemble's variance is lowest (0.71 vs the forest's 1.08 on friedman1), and averaging randomly placed steps gives a smoother curve (diary turnout at 82.5% humidity: 35.2, between the two sides, where the forest still says 43.2). But with no bootstrap and full depth it passes through every noisy point. What does it buy in speed?</span></li>
    <li><b>Speed &amp; size</b><span>Q: is it faster? → Training: no sort, no scan of 9 humidity midpoints, one random number; about 3× faster on churn. But trees grow about 3× more leaves. Which knobs matter?</span></li>
    <li><b>Parameters, when it wins, from scratch</b><span>Q: how do we tune and choose it? → max_features first (often larger than a forest's: churn 0.878 → 0.893 with all columns); it wins on smooth regression and speed, loses at small K with many junk columns; a 40-line version matches sklearn. All three bagging-branch siblings still only reduce variance: the next step is boosting.</span></li>
  </ol>

  <h2 id="et-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Extra Trees</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · The idea</div>
        <ul>
          <li><b>Random columns</b> (K = <code>max_features</code>) as in a forest</li>
          <li><b>+ random cut-off</b>: one per column, uniform in [node min, node max]</li>
          <li>Keep the best of the K random candidates (Gini / variance drop)</li>
          <li><b>No bootstrap</b> by default: every tree sees all rows</li>
          <li>💡 Cut the cake by eye a few times, keep the best cut; no ruler</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Worked split (the diary)</div>
        <ul>
          <li>Diary root, 9 Yes / 5 No, Gini 0.459; K = 2 numeric columns</li>
          <li>Draws: HumPct ≤ 89.96 (drop 0.066), TempC ≤ 26.89 (drop 0.016) → keep humidity</li>
          <li>CART best: HumPct ≤ 82.5 (drop 0.092), after trying 9 midpoints</li>
          <li>A random humidity cut is in the best interval 5/31 = 16% of the time; average drop 0.037</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Algorithm</div>
        <ul>
          <li>Stop if &lt; n_min rows, pure, or all candidates constant</li>
          <li>Else K non-constant columns → K random cuts → best → recurse</li>
          <li>Paper defaults: K = √p (clf), p (reg); n_min 2 (clf), 5 (reg)</li>
          <li><b>K = 1</b>: totally randomised trees (structure ignores the labels)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Bias, variance, smoothness</div>
        <ul>
          <li>One extra tree: variance 9.8 vs CART 7.7 (worse)</li>
          <li>Ensemble: variance 0.71 vs forest 1.08; bias 3.07 vs 3.52 (better)</li>
          <li>Smoother: average of random cuts ≈ straight lines, not stairs</li>
          <li>⚠ No bootstrap + full depth = passes through every training point (train R² 1.0)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Speed &amp; size</div>
        <ul>
          <li>Per node O(K·n) (min, max, partition) vs O(K·n log n) (sort + scan)</li>
          <li>Churn, 1 core: forest 31.9 s, Extra Trees 10.6 s</li>
          <li>⚠ More leaves: 4,800 vs 1,438 per tree → bigger model</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · When it wins</div>
        <ul>
          <li>Smooth targets, numeric columns: friedman1 R² 0.862 vs 0.847</li>
          <li>Churn with K = all columns: 0.893 vs forest 0.879</li>
          <li>⚠ Many junk columns at small K: 0.778 vs 0.807; raise K → 0.856</li>
          <li>Try it next to the forest; costs almost nothing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">7 · Parameters</div>
        <ul>
          <li><b>max_features</b> — the main knob; often larger than for a forest</li>
          <li><b>min_samples_split</b> (n_min) — smoothing; prefer it to min_samples_leaf</li>
          <li><b>bootstrap</b> (False) — True adds diversity, enables OOB</li>
          <li>n_estimators, max_depth, class_weight, n_jobs as in the forest</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">8 · Bagging vs RF vs ET</div>
        <ul>
          <li>Single tree 0.769 → 0.738 → 0.700 (weaker)</li>
          <li>Two trees agree 73.4% → 68.3% → 63.5% (less alike)</li>
          <li>Ensembles 0.883 / 0.879 / 0.878: the effects cancel here</li>
          <li>All reduce variance only; none reduces bias</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="et-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain of questions</span></div></div>
      <div class="rm-item rm-done" data-target="et-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Idea</span><span class="rm-sub">Randomise the cut-off too</span></div></div>
      <div class="rm-item rm-done" data-target="et-hand"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">One Random Split by Hand</span><span class="rm-sub">The diary's humidity and temperature</span></div></div>
      <div class="rm-item rm-done" data-target="et-algo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Full Algorithm</span><span class="rm-sub">K, n_min, M; the extremes of K</span></div></div>
      <div class="rm-item rm-done" data-target="et-bv"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Bias, Variance &amp; Smoothness</span><span class="rm-sub">Measured; stairs vs lines</span></div></div>
      <div class="rm-item rm-done" data-target="et-speed"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Speed &amp; Size</span><span class="rm-sub">No search, more leaves</span></div></div>
      <div class="rm-item rm-done" data-target="et-params"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Parameters at Scale</span><span class="rm-sub">Each knob on the churn data</span></div></div>
      <div class="rm-item rm-done" data-target="et-when"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">When It Beats a Forest</span><span class="rm-sub">Smooth targets, speed, junk columns</span></div></div>
      <div class="rm-item rm-done" data-target="et-scratch"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Random splits in 40 lines</span></div></div>
      <div class="rm-item rm-done" data-target="et-cmp"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Bagging vs Forest vs Extra Trees</span><span class="rm-sub">The branch side by side</span></div></div>
      <div class="rm-item rm-done" data-target="et-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="et-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">K, OOB, noise, skew</span></div></div>
      <div class="rm-item rm-done" data-target="et-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="et-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="et-idea"><span class="num">01</span>The Idea: Randomise the Cut-off Too</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The random forest made trees less alike by hiding columns, but on every column it is shown it still searches for the best cut-off, and the best cut-off on similar data is similar in every tree. Can we make trees differ even more, and save the cost of that search?</p>
  </div>
  <p>How a normal tree (and each tree of a random forest) picks a split on one column: sort the rows by that column, try every midpoint between neighbouring values as a cut-off, compute the impurity drop for each, keep the best. On the captain's 14-day cricket diary (the running example of the tree family) that means sorting the 14 humidity readings and scoring 9 midpoints to find HumPct ≤ 82.5. With n rows in the node that is up to n − 1 candidates per column, plus the sort.</p>
  <p><strong>Extra Trees</strong> skips the search. For each column it is allowed to look at, it draws <em>one</em> cut-off at random, anywhere between that column's smallest and largest value in the node. It scores those few random candidates (one per drawn column) and keeps the best. So there are two layers of randomness:</p>
  <ol>
    <li><strong>Which columns</strong> are considered: K random columns per node (<code>max_features</code>), exactly like a random forest.</li>
    <li><strong>Where to cut</strong> each column: one uniform random cut-off, instead of the best one.</li>
  </ol>
  <p>And one thing is <em>removed</em>: by default there is no bootstrap. Every tree is grown on the full training set, because the random cut-offs already make the trees different enough, and using all rows keeps each tree's bias lower (section 04).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You must cut a cake so that one piece has most of the cherries. A careful baker (CART) measures every possible position with a ruler and picks the perfect one: slow, and every careful baker cuts the same place. An Extra Trees baker eyeballs one random cut on each of a few cakes, keeps whichever cut worked best, and moves on: fast, a bit worse each time, and every baker cuts somewhere different. Average the opinions of 300 such bakers and the random errors cancel.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Extremely randomised trees</strong>: an ensemble of M unpruned trees, each grown on the full learning sample. At each node, K candidate columns are drawn at random; for each, a cut-off is drawn uniformly between the column's minimum and maximum among the node's rows; the candidate split with the best score (impurity reduction) is used. Predictions are averaged (probabilities or numbers). In sklearn: <code>ExtraTreesClassifier</code> / <code>ExtraTreesRegressor</code>; single trees <code>ExtraTreeClassifier</code> / <code>ExtraTreeRegressor</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Extra Trees = random forest with more trees" is wrong. The "extra" is extra <em>randomness</em>, not extra trees. Also, the cut-off is not fully random over the whole dataset: it is drawn between the min and max of the rows <em>in that node</em>, so it always falls inside the data that reached the node.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: One Random Split, Worked by Hand.</b> "Pick a random cut and keep the best" sounds like it should be terrible. Doing one split by hand shows how bad (and how good) a random cut really is.</div>

  <h2 id="et-hand"><span class="num">02</span>One Random Split, Worked by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Pick a random cut and keep the best" sounds like it should be terrible. On the diary's root, with its two numeric columns, exactly how much worse is a random cut than the best one, on one draw and on average?</p>
  </div>
  <p>The running example is the captain's diary (<code>play.py</code>); this section uses its two numeric columns, the humidity reading HumPct (65–96%) and the temperature TempC (18–29 °C), and the label Play:</p>
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
  <p>The root holds all 14 days, 9 Yes and 5 No: Gini = 1 − (9/14)² − (5/14)² = <strong>0.459</strong>. Extra Trees with K = 2 (both columns) draws one cut-off per column, uniformly between the node's min and max: humidity between 65 and 96, temperature between 18 and 29. Suppose the draws are HumPct ≤ 89.96 and TempC ≤ 26.89.</p>
  <table class="tbl">
    <tr><th>Candidate</th><th>Left days</th><th>Left [Yes, No]</th><th>Right days</th><th>Right [Yes, No]</th><th>Weighted Gini</th><th>Drop</th></tr>
    <tr><td>HumPct ≤ 89.96</td><td>9 days (65–86%)</td><td>[7, 2] → 1 − (7/9)² − (2/9)² = 0.346</td><td>D2, D12, D14, D8, D4</td><td>[2, 3] → 0.48</td><td>9/14·0.346 + 5/14·0.48 = 0.394</td><td><strong>0.066</strong></td></tr>
    <tr><td>TempC ≤ 26.89</td><td>10 days (18–24 °C)</td><td>[7, 3] → 1 − 0.49 − 0.09 = 0.42</td><td>D1, D2, D3, D13</td><td>[2, 2] → 0.5</td><td>10/14·0.42 + 4/14·0.5 = 0.443</td><td>0.016</td></tr>
  </table>
  <p>Extra Trees keeps <strong>HumPct ≤ 89.96</strong> (drop 0.066) and moves on to the children. What would CART have done? It sorts both columns, tries every midpoint (9 for humidity, 7 for temperature), and finds HumPct ≤ 82.5, which separates the Normal from the High days: drop 0.092. So the random split is worse here: it leaves D1 (85%, No) and D3 (86%, Yes) on the "dry" side, which a later split must sort out.</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
yes = (df.Play == "Yes").astype(int).values             # 9 played, 5 not
def gini(lab):
    if len(lab) == 0: return 0.0
    p = lab.mean()
    return 1 - p**2 - (1 - p)**2
def drop(x, t):                                          # impurity decrease of the split x &lt;= t
    L, R = yes[x &lt;= t], yes[x &gt; t]
    return gini(yes) - (len(L) * gini(L) + len(R) * gini(R)) / len(yes)

rng = np.random.default_rng(5)
for name in ["HumPct", "TempC"]:
    x = df[name].values
    t = rng.uniform(x.min(), x.max())                    # ONE random cut-off between this node's min and max
    print(f"Extra Trees  {name:6s} &lt;= {t:5.2f}  drop {drop(x, t):.4f}")
for name in ["HumPct", "TempC"]:                         # what CART does: try every midpoint
    x = df[name].values
    v = np.unique(x); mids = (v[:-1] + v[1:]) / 2
    best = max(mids, key=lambda t: drop(x, t))
    print(f"CART best    {name:6s} &lt;= {best:5.2f}  drop {drop(x, best):.4f}  ({len(mids)} cut-offs tried)")</div>
  <div class="fx" data-lang="text">Extra Trees  HumPct &lt;= 89.96  drop 0.0655
Extra Trees  TempC  &lt;= 26.89  drop 0.0163
CART best    HumPct &lt;= 82.50  drop 0.0918  (9 cut-offs tried)
CART best    TempC  &lt;= 28.50  drop 0.0636  (7 cut-offs tried)</div>
  <p>The code does both procedures. <code>rng.uniform(x.min(), x.max())</code> is the entire Extra Trees cut-off "search": one number per column. CART loops over the midpoints of the sorted distinct values and keeps the best. On a node with 10,000 rows that loop has up to 9,999 candidates per column, and the sort costs n log n; Extra Trees still draws one number.</p>
  <h3>How good is a random cut on average?</h3>
  <p>The humidity cut-off is uniform on [65, 96], a range of 31. Between neighbouring humidity values the split (and so the drop) is the same, so we can list every interval:</p>
  <table class="tbl">
    <tr><th>Cut-off falls in</th><th>65–70</th><th>70–75</th><th>75–80</th><th>80–85</th><th>85–86</th><th>86–90</th><th>90–91</th><th>91–95</th><th>95–96</th></tr>
    <tr><td>Width (chance = width/31)</td><td>5</td><td>5</td><td>5</td><td>5</td><td>1</td><td>4</td><td>1</td><td>4</td><td>1</td></tr>
    <tr><td>Gini drop</td><td>.0196</td><td>.0092</td><td>.0274</td><td><strong>.0918</strong></td><td>.0306</td><td>.0655</td><td>.0523</td><td>.0068</td><td>.0196</td></tr>
  </table>
  <p>The best cut (anywhere in 80–85) happens with probability 5/31 = <strong>16%</strong>. The expected drop is (5·0.0196 + 5·0.0092 + 5·0.0274 + 5·0.0918 + 1·0.0306 + 4·0.0655 + 1·0.0523 + 4·0.0068 + 1·0.0196) / 31 = 1.132 / 31 = <strong>0.037</strong>, about 40% of the best possible 0.092. Two things make this better in practice: with K columns, Extra Trees keeps the best of K random cuts; and a weak split now is repaired by the next splits further down, because trees are grown deep. The price is more nodes per tree (section 05), not a much worse fit.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The random cut-off is uniform over the <em>value range</em>, not over the rows. If a column is very skewed (incomes: most below 10 lakh, a few at 5 crore), almost every random cut falls in the empty stretch above the bulk and puts nearly all rows on one side. Such columns rarely win, and the column looks useless to Extra Trees. A log or rank transform of skewed columns helps Extra Trees, while it changes nothing for CART or a forest.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Full Algorithm.</b> One split is clear. Now the whole tree-growing procedure, its stopping rules and its three parameters, as the original paper states them.</div>

  <h2 id="et-algo"><span class="num">03</span>The Full Algorithm</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can make one random split. How do random splits grow a whole tree, when does growth stop, how many trees are built, and what happens at the two extremes of how many columns are tried?</p>
  </div>
  <div class="flow"><span>Node with rows S</span><span>Stop? (&lt; n_min rows, pure, or all columns constant)</span><span>Draw K non-constant columns</span><span>One uniform cut per column</span><span>Keep best score; split; recurse</span></div>
  <div class="fx" data-lang="text">Build_extra_tree_ensemble(S, M, K, n_min):
    for i = 1..M:  T_i = Build_an_extra_tree(S)          # full sample S, no bootstrap
    return {T_1, ..., T_M}

Build_an_extra_tree(S):
    if |S| &lt; n_min  or  all labels in S equal  or  every column is constant in S:
        return a leaf  (class frequencies, or mean of y)
    s* = Split_a_node(S)
    split S into S_left, S_right by s*
    return node(s*, Build_an_extra_tree(S_left), Build_an_extra_tree(S_right))

Split_a_node(S):
    pick K columns a_1..a_K at random among the columns that are NOT constant in S
    for each a_i:  a_min, a_max = min and max of a_i in S
                   c_i = uniform random number in [a_min, a_max]
                   s_i = "a_i &lt;= c_i"
    return the s_i with the highest Score(s_i, S)        # impurity / variance reduction</div>
  <p>Three parameters, with their sklearn names and defaults:</p>
  <table class="tbl">
    <tr><th>Paper</th><th>Meaning</th><th>Paper default</th><th>sklearn</th><th>sklearn default</th></tr>
    <tr><td>K</td><td>Columns (random cut candidates) per node</td><td>√p classification, p regression</td><td><code>max_features</code></td><td>"sqrt" (clf), 1.0 (reg)</td></tr>
    <tr><td>n_min</td><td>Min rows to split a node (smoothing strength)</td><td>2 classification, 5 regression</td><td><code>min_samples_split</code></td><td>2</td></tr>
    <tr><td>M</td><td>Number of trees</td><td>100</td><td><code>n_estimators</code></td><td>100</td></tr>
    <tr><td>—</td><td>Resample rows per tree</td><td>No</td><td><code>bootstrap</code></td><td>False</td></tr>
  </table>
  <p>The score in the paper is a normalised information gain for classification and relative variance reduction for regression; sklearn uses the usual criterion (Gini / entropy / squared error), which picks the same kind of split. sklearn's random splitter draws the threshold uniformly between the node's min and max of the column, exactly as above, and if a drawn split is invalid (e.g. leaves a child below <code>min_samples_leaf</code>) it moves on to another column.</p>
  <h3>The two extremes of K</h3>
  <ul>
    <li><strong>K = 1</strong>: one random column, one random cut-off (on the diary root: a coin flip between humidity and temperature, then a random number; the labels play no part). The labels are never used to choose a split; they are only used to fill the leaves. These are <strong>totally randomised trees</strong>: the tree structure is independent of the target. Surprisingly, averaged over many trees they still work reasonably (it becomes a kind of adaptive nearest-neighbour smoother), but usually worse than larger K.</li>
    <li><strong>K = p</strong>: every column gets one random cut, and the best one wins. The column choice is now driven by the labels, but the cut-off is still random. This is often the best setting for regression and, on our churn data, for classification too (section 06).</li>
  </ul>
  <p>Prediction is the same as a forest: each tree sends the row to a leaf, and the ensemble averages the trees' class probabilities (classification, argmax of the average) or leaf means (regression).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>K is how many job candidates the interviewer sees before choosing. K = 1: hire whoever walks in first (pure luck). K = all: see everyone, but each answers just one random question instead of a full interview. The full CART interview (every question) gives the best single hire but takes the longest, and every company hires the same person.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn's classifier default <code>max_features="sqrt"</code> follows the paper for classification, but the paper's default for regression is K = p, and sklearn's regressor uses 1.0 (= p) too. Do not copy a forest's tuned <code>max_features</code> to Extra Trees: because each candidate is weaker (random cut), Extra Trees often wants a <em>larger</em> K than a forest on the same data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bias, Variance &amp; Smoothness.</b> The claim is "lower variance, a little more bias". That is a measurable statement: train the same model on many different training sets and look at how its predictions move.</div>

  <h2 id="et-bv"><span class="num">04</span>Bias, Variance &amp; Smoothness</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The promise is "each tree a bit worse, the ensemble a bit better". Is that true when measured, which part of the error (bias or variance) moves, and what does averaging random cut-offs do to the shape of the prediction?</p>
  </div>
  <p>Recall the split of expected squared error at a point: error = <strong>bias²</strong> (how far the <em>average</em> model, over many possible training sets, is from the truth) + <strong>variance</strong> (how much the model jumps from one training set to another) + noise (unavoidable). We can measure the first two directly on a synthetic problem where we know the truth: <code>make_friedman1</code>, a smooth nonlinear function of 5 inputs plus 5 useless inputs. Draw 20 training sets of 300 rows, fit each model on each, predict 500 fixed test points.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_friedman1
from sklearn.tree import DecisionTreeRegressor, ExtraTreeRegressor
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
Xg, fg = make_friedman1(n_samples=500, noise=0.0, random_state=99)    # fixed test points, noise-free truth
models = {"one CART tree":          lambda s: DecisionTreeRegressor(random_state=s),
          "one extra tree":         lambda s: ExtraTreeRegressor(max_features=1.0, random_state=s),
          "random forest (100)":    lambda s: RandomForestRegressor(100, random_state=s, n_jobs=-1),
          "extra trees (100)":      lambda s: ExtraTreesRegressor(100, random_state=s, n_jobs=-1),
          "ET min_samples_split=5": lambda s: ExtraTreesRegressor(100, min_samples_split=5, random_state=s, n_jobs=-1)}
for name, make in models.items():
    P = []
    for s in range(20):
        X, y = make_friedman1(n_samples=300, noise=1.0, random_state=s)
        P.append(make(s).fit(X, y).predict(Xg))
    P = np.array(P)
    bias2 = np.mean((P.mean(0) - fg)**2); var = np.mean(P.var(0))
    print(f"{name:24s} bias^2 {bias2:.3f}  variance {var:.3f}  bias^2+variance {bias2 + var:.3f}")</div>
  <div class="fx" data-lang="text">one CART tree            bias^2 3.249  variance 7.738  bias^2+variance 10.986
one extra tree           bias^2 3.521  variance 9.811  bias^2+variance 13.332
random forest (100)      bias^2 3.521  variance 1.084  bias^2+variance 4.605
extra trees (100)        bias^2 3.074  variance 0.712  bias^2+variance 3.787
ET min_samples_split=5   bias^2 3.234  variance 0.668  bias^2+variance 3.902</div>
  <p>Read it in two halves. <strong>Single trees</strong>: one extra tree is worse than one CART tree on both counts (variance 9.8 vs 7.7): random cuts make each tree a noisier learner. <strong>Ensembles</strong>: the picture flips. The Extra Trees ensemble has the lowest variance (0.712 vs the forest's 1.084), because its trees are so different from each other that averaging cancels more (lower ρ in ρσ² + (1−ρ)σ²/B). And its bias is even <em>lower</em> than the forest's (3.07 vs 3.52): the forest's trees each see a bootstrap (about 63% of distinct rows), while every extra tree sees all 300 rows. That is exactly why the paper dropped the bootstrap. Total: 3.79 vs 4.61, an 18% lower error. Setting <code>min_samples_split=5</code> (the paper's regression default) trades a bit of bias for a bit of variance and lands about the same.</p>
  <h3>On the diary: between the two sides of a cut</h3>
  <p>Predict the turnout from the humidity reading with 300 trees of each kind, and look at humidities between and around the diary's readings:</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
from play import df
X, y = df[["HumPct"]], df.Turnout
rf = RandomForestRegressor(n_estimators=300, random_state=0).fit(X, y)
et = ExtraTreesRegressor(n_estimators=300, random_state=0).fit(X, y)
grid = pd.DataFrame({"HumPct": [75, 77.5, 80, 82.5, 85, 87.5, 90]})
print("humidity:     ", grid.HumPct.tolist())
print("forest:       ", rf.predict(grid).round(1).tolist())
print("extra trees:  ", et.predict(grid).round(1).tolist())
print("diary turnout at 75, 80, 85, 90:", [df.Turnout[df.HumPct == h].tolist() for h in [75, 80, 85, 90]])</div>
  <div class="fx" data-lang="text">humidity:      [75.0, 77.5, 80.0, 82.5, 85.0, 87.5, 90.0]
forest:        [43.3, 46.6, 44.8, 43.2, 29.2, 31.9, 28.7]
extra trees:   [47.9, 46.5, 44.9, 35.2, 24.2, 33.5, 29.0]
diary turnout at 75, 80, 85, 90: [[48], [44, 46], [24], [20, 38]]</div>
  <p>Look at 82.5%, the gap between the drier days (80%: 44 and 46 members) and the humid ones (85%: 24). Almost every forest tree cuts exactly at a midpoint, so the forest still says 43.2 there, the dry side's level, and jumps to 29.2 at 85. Extra trees cut anywhere in 80–85, so about half put 82.5 on each side: their average, 35.2, sits in between. Note also that at a training value with a single day (85%: 24 members) Extra Trees, with no bootstrap, reproduces that day almost exactly (24.2), noise and all. Both effects, the smoother in-between and the faithful copy of each point, show up at scale below.</p>
  <h3>Smoothness: stairs vs straight lines</h3>
  <p>Why the extra variance reduction? Picture one input column. A forest's cut-offs are always midpoints between training values, so all 300 trees cut in nearly the same few places, and their average is still a staircase. Extra Trees' cut-offs fall anywhere, so the steps of different trees land in different places; averaging hundreds of randomly placed steps gives something close to a straight line between points. The picture is a real run: 30 noisy points from a sine curve, 300 trees each, default settings.</p>
  <figure class="viz"><svg viewBox="0 0 720 230" width="720"><rect x="30" y="30" width="300" height="160" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="180.0" y="20" text-anchor="middle" font-size="13" font-weight="600">Random forest (300 trees)</text><polyline fill="none" stroke-width="1.6" class="sb" points="30.0,74.9 31.0,74.9 32.0,74.9 33.0,74.9 34.0,74.9 35.0,74.9 36.0,74.9 37.0,74.9 38.0,74.9 39.0,74.9 40.0,74.9 41.0,74.9 42.0,74.9 43.0,74.9 44.0,74.9 45.0,74.9 46.0,74.9 47.0,74.9 48.0,74.9 49.0,74.9 50.0,74.9 51.0,74.9 52.0,74.9 53.0,74.9 54.0,74.9 55.0,74.9 56.0,74.9 57.0,74.9 58.0,74.9 59.0,74.9 60.0,74.9 61.0,74.9 62.0,74.9 63.0,65.9 64.0,65.9 65.0,65.9 66.0,65.9 67.0,65.9 68.0,65.9 69.0,62.3 70.0,62.3 71.0,62.3 72.0,62.3 73.0,62.3 74.0,62.3 75.0,62.3 76.0,61.8 77.0,62.2 78.0,62.2 79.0,62.2 80.0,62.2 81.0,62.2 82.0,62.2 83.0,52.5 84.0,51.4 85.0,51.4 86.0,51.4 87.0,51.4 88.0,51.4 89.0,51.4 90.0,48.2 91.0,48.7 92.0,48.7 93.0,48.7 94.0,48.7 95.0,48.5 96.0,48.5 97.0,48.5 98.0,48.4 99.0,48.4 100.0,48.4 101.0,48.4 102.0,48.4 103.0,48.1 104.0,48.1 105.0,48.1 106.0,48.1 107.0,48.1 108.0,48.1 109.0,46.5 110.0,46.6 111.0,46.6 112.0,46.2 113.0,46.4 114.0,46.8 115.0,46.8 116.0,46.8 117.0,46.4 118.0,46.4 119.0,46.4 120.0,47.0 121.0,48.4 122.0,48.8 123.0,48.8 124.0,48.8 125.0,48.8 126.0,48.8 127.0,48.8 128.0,48.8 129.0,49.5 130.0,49.5 131.0,49.5 132.0,49.5 133.0,49.5 134.0,49.5 135.0,49.5 136.0,50.1 137.0,50.1 138.0,52.0 139.0,56.2 140.0,56.2 141.0,56.2 142.0,64.0 143.0,64.0 144.0,64.0 145.0,64.0 146.0,64.0 147.0,64.0 148.0,65.3 149.0,65.3 150.0,65.3 151.0,70.8 152.0,76.4 153.0,76.4 154.0,76.4 155.0,78.2 156.0,78.2 157.0,78.5 158.0,81.3 159.0,84.8 160.0,85.2 161.0,86.5 162.0,87.5 163.0,87.5 164.0,87.5 165.0,87.5 166.0,87.5 167.0,91.4 168.0,91.4 169.0,92.6 170.0,93.7 171.0,93.7 172.0,93.8 173.0,93.8 174.0,93.8 175.0,93.8 176.0,92.7 177.0,93.0 178.0,93.0 179.0,93.4 180.0,101.8 181.0,103.3 182.0,108.6 183.0,108.6 184.0,108.7 185.0,108.7 186.0,109.2 187.0,112.6 188.0,112.6 189.0,118.7 190.0,118.7 191.0,118.7 192.0,118.7 193.0,118.7 194.0,118.7 195.0,118.7 196.0,120.7 197.0,123.8 198.0,130.7 199.0,132.2 200.0,132.2 201.0,132.2 202.0,132.2 203.0,143.1 204.0,143.1 205.0,143.5 206.0,143.5 207.0,144.3 208.0,144.3 209.0,144.3 210.0,144.3 211.0,144.4 212.0,145.9 213.0,145.0 214.0,145.0 215.0,145.0 216.0,145.0 217.0,145.0 218.0,145.2 219.0,145.2 220.0,145.2 221.0,147.4 222.0,153.4 223.0,153.4 224.0,153.4 225.0,153.4 226.0,153.6 227.0,153.7 228.0,154.2 229.0,154.2 230.0,154.6 231.0,154.6 232.0,154.7 233.0,154.7 234.0,154.7 235.0,154.7 236.0,149.8 237.0,149.8 238.0,149.8 239.0,149.8 240.0,152.2 241.0,152.2 242.0,152.7 243.0,152.8 244.0,152.8 245.0,152.8 246.0,152.8 247.0,152.8 248.0,152.8 249.0,155.8 250.0,155.8 251.0,156.7 252.0,156.7 253.0,157.0 254.0,157.0 255.0,169.2 256.0,169.2 257.0,174.9 258.0,174.9 259.0,174.9 260.0,174.9 261.0,174.9 262.0,174.9 263.0,174.9 264.0,174.9 265.0,174.9 266.0,174.9 267.0,175.8 268.0,175.8 269.0,175.0 270.0,175.0 271.0,175.0 272.0,175.4 273.0,175.4 274.0,175.4 275.0,175.4 276.0,175.4 277.0,175.4 278.0,175.4 279.0,175.4 280.0,172.2 281.0,172.2 282.0,165.8 283.0,165.8 284.0,165.2 285.0,165.2 286.0,164.0 287.0,164.0 288.0,163.6 289.0,163.6 290.0,162.5 291.0,162.5 292.0,162.2 293.0,162.2 294.0,162.2 295.0,162.2 296.0,162.2 297.0,165.1 298.0,165.1 299.0,165.1 300.0,165.1 301.0,164.1 302.0,164.1 303.0,162.9 304.0,162.9 305.0,157.3 306.0,157.3 307.0,152.7 308.0,152.7 309.0,152.7 310.0,152.6 311.0,146.5 312.0,146.4 313.0,143.2 314.0,143.2 315.0,142.9 316.0,150.1 317.0,146.0 318.0,145.9 319.0,145.9 320.0,133.6 321.0,131.4 322.0,136.4 323.0,137.4 324.0,137.4 325.0,134.0 326.0,134.0 327.0,134.0 328.0,134.0 329.0,134.0 330.0,134.0"/><circle cx="54.3" cy="83.5" r="2.6" class="fr sr"/><circle cx="70.0" cy="62.1" r="2.6" class="fr sr"/><circle cx="82.4" cy="68.8" r="2.6" class="fr sr"/><circle cx="83.3" cy="44.5" r="2.6" class="fr sr"/><circle cx="97.1" cy="45.9" r="2.6" class="fr sr"/><circle cx="135.0" cy="45.1" r="2.6" class="fr sr"/><circle cx="140.9" cy="49.7" r="2.6" class="fr sr"/><circle cx="142.9" cy="70.0" r="2.6" class="fr sr"/><circle cx="159.1" cy="83.7" r="2.6" class="fr sr"/><circle cx="173.1" cy="94.3" r="2.6" class="fr sr"/><circle cx="178.1" cy="91.4" r="2.6" class="fr sr"/><circle cx="179.4" cy="92.0" r="2.6" class="fr sr"/><circle cx="180.1" cy="107.9" r="2.6" class="fr sr"/><circle cx="183.4" cy="111.1" r="2.6" class="fr sr"/><circle cx="193.2" cy="125.5" r="2.6" class="fr sr"/><circle cx="212.2" cy="146.4" r="2.6" class="fr sr"/><circle cx="212.7" cy="143.6" r="2.6" class="fr sr"/><circle cx="229.7" cy="159.4" r="2.6" class="fr sr"/><circle cx="241.5" cy="146.9" r="2.6" class="fr sr"/><circle cx="266.7" cy="178.8" r="2.6" class="fr sr"/><circle cx="270.6" cy="176.5" r="2.6" class="fr sr"/><circle cx="291.5" cy="161.2" r="2.6" class="fr sr"/><circle cx="300.7" cy="168.1" r="2.6" class="fr sr"/><circle cx="308.7" cy="155.2" r="2.6" class="fr sr"/><circle cx="312.8" cy="147.4" r="2.6" class="fr sr"/><circle cx="312.9" cy="140.0" r="2.6" class="fr sr"/><circle cx="317.6" cy="155.1" r="2.6" class="fr sr"/><circle cx="320.7" cy="125.8" r="2.6" class="fr sr"/><circle cx="322.9" cy="139.8" r="2.6" class="fr sr"/><circle cx="325.2" cy="132.0" r="2.6" class="fr sr"/><rect x="390" y="30" width="300" height="160" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="540.0" y="20" text-anchor="middle" font-size="13" font-weight="600">Extra Trees (300 trees)</text><polyline fill="none" stroke-width="1.6" class="st" points="390.0,83.5 391.0,83.5 392.0,83.5 393.0,83.5 394.0,83.5 395.0,83.5 396.0,83.5 397.0,83.5 398.0,83.5 399.0,83.5 400.0,83.5 401.0,83.5 402.0,83.5 403.0,83.5 404.0,83.5 405.0,83.5 406.0,83.5 407.0,83.5 408.0,83.5 409.0,83.5 410.0,83.5 411.0,83.5 412.0,83.5 413.0,83.5 414.0,83.5 415.0,82.3 416.0,80.5 417.0,79.2 418.0,77.9 419.0,76.6 420.0,76.0 421.0,74.3 422.0,72.7 423.0,71.5 424.0,70.0 425.0,68.8 426.0,67.5 427.0,65.8 428.0,64.5 429.0,63.3 430.0,62.1 431.0,62.5 432.0,63.0 433.0,63.5 434.0,63.9 435.0,64.4 436.0,65.3 437.0,65.7 438.0,66.3 439.0,67.0 440.0,67.5 441.0,68.0 442.0,68.6 443.0,53.5 444.0,44.6 445.0,44.7 446.0,44.8 447.0,44.9 448.0,45.0 449.0,45.2 450.0,45.3 451.0,45.3 452.0,45.4 453.0,45.5 454.0,45.6 455.0,45.7 456.0,45.8 457.0,45.9 458.0,45.9 459.0,45.9 460.0,45.9 461.0,45.9 462.0,45.8 463.0,45.8 464.0,45.8 465.0,45.8 466.0,45.8 467.0,45.8 468.0,45.8 469.0,45.7 470.0,45.7 471.0,45.7 472.0,45.6 473.0,45.6 474.0,45.6 475.0,45.6 476.0,45.5 477.0,45.5 478.0,45.5 479.0,45.5 480.0,45.4 481.0,45.4 482.0,45.4 483.0,45.4 484.0,45.3 485.0,45.3 486.0,45.3 487.0,45.3 488.0,45.2 489.0,45.2 490.0,45.2 491.0,45.2 492.0,45.1 493.0,45.1 494.0,45.1 495.0,45.1 496.0,45.9 497.0,46.6 498.0,47.4 499.0,48.1 500.0,49.1 501.0,50.8 502.0,61.1 503.0,70.0 504.0,70.7 505.0,71.8 506.0,72.5 507.0,73.6 508.0,74.9 509.0,75.7 510.0,76.5 511.0,77.5 512.0,78.3 513.0,79.1 514.0,80.1 515.0,81.1 516.0,81.9 517.0,82.3 518.0,83.0 519.0,83.6 520.0,84.7 521.0,85.5 522.0,86.0 523.0,86.9 524.0,87.8 525.0,88.4 526.0,89.4 527.0,90.0 528.0,90.5 529.0,91.4 530.0,92.0 531.0,92.7 532.0,93.4 533.0,94.3 534.0,93.8 535.0,93.3 536.0,92.6 537.0,92.1 538.0,91.4 539.0,91.8 540.0,106.4 541.0,108.9 542.0,109.9 543.0,110.7 544.0,112.0 545.0,113.2 546.0,114.8 547.0,116.5 548.0,117.9 549.0,119.3 550.0,120.8 551.0,122.2 552.0,123.7 553.0,125.3 554.0,126.4 555.0,128.0 556.0,129.4 557.0,130.2 558.0,131.7 559.0,132.9 560.0,133.8 561.0,135.1 562.0,136.2 563.0,137.1 564.0,137.8 565.0,138.7 566.0,139.9 567.0,141.0 568.0,141.7 569.0,143.1 570.0,144.4 571.0,144.9 572.0,146.2 573.0,144.0 574.0,144.8 575.0,145.7 576.0,147.1 577.0,147.9 578.0,148.9 579.0,149.8 580.0,150.4 581.0,151.3 582.0,151.9 583.0,152.5 584.0,153.9 585.0,154.5 586.0,155.8 587.0,156.7 588.0,157.8 589.0,159.0 590.0,159.2 591.0,158.3 592.0,157.1 593.0,156.1 594.0,154.4 595.0,153.3 596.0,152.1 597.0,151.1 598.0,149.9 599.0,149.1 600.0,148.4 601.0,147.5 602.0,147.7 603.0,148.8 604.0,149.3 605.0,150.3 606.0,151.2 607.0,152.4 608.0,153.8 609.0,154.9 610.0,156.1 611.0,157.6 612.0,158.8 613.0,160.5 614.0,161.0 615.0,162.1 616.0,163.7 617.0,164.9 618.0,166.8 619.0,168.2 620.0,169.6 621.0,170.7 622.0,171.7 623.0,173.2 624.0,175.3 625.0,176.5 626.0,177.9 627.0,178.7 628.0,178.1 629.0,177.5 630.0,176.8 631.0,176.1 632.0,175.6 633.0,175.0 634.0,174.4 635.0,173.5 636.0,172.5 637.0,171.9 638.0,170.9 639.0,170.4 640.0,169.9 641.0,169.3 642.0,168.9 643.0,168.2 644.0,167.5 645.0,166.5 646.0,165.5 647.0,164.7 648.0,163.9 649.0,163.3 650.0,162.4 651.0,161.6 652.0,161.5 653.0,162.2 654.0,162.9 655.0,163.5 656.0,164.6 657.0,165.4 658.0,166.1 659.0,166.8 660.0,167.6 661.0,167.5 662.0,165.9 663.0,164.1 664.0,162.8 665.0,161.2 666.0,159.7 667.0,158.0 668.0,156.3 669.0,154.6 670.0,152.9 671.0,150.9 672.0,148.8 673.0,140.4 674.0,143.2 675.0,146.3 676.0,149.7 677.0,153.3 678.0,151.1 679.0,142.1 680.0,131.6 681.0,127.5 682.0,133.3 683.0,139.4 684.0,136.1 685.0,132.9 686.0,132.0 687.0,132.0 688.0,132.0 689.0,132.0 690.0,132.0"/><circle cx="414.3" cy="83.5" r="2.6" class="fr sr"/><circle cx="430.0" cy="62.1" r="2.6" class="fr sr"/><circle cx="442.4" cy="68.8" r="2.6" class="fr sr"/><circle cx="443.3" cy="44.5" r="2.6" class="fr sr"/><circle cx="457.1" cy="45.9" r="2.6" class="fr sr"/><circle cx="495.0" cy="45.1" r="2.6" class="fr sr"/><circle cx="500.9" cy="49.7" r="2.6" class="fr sr"/><circle cx="502.9" cy="70.0" r="2.6" class="fr sr"/><circle cx="519.1" cy="83.7" r="2.6" class="fr sr"/><circle cx="533.1" cy="94.3" r="2.6" class="fr sr"/><circle cx="538.1" cy="91.4" r="2.6" class="fr sr"/><circle cx="539.4" cy="92.0" r="2.6" class="fr sr"/><circle cx="540.1" cy="107.9" r="2.6" class="fr sr"/><circle cx="543.4" cy="111.1" r="2.6" class="fr sr"/><circle cx="553.2" cy="125.5" r="2.6" class="fr sr"/><circle cx="572.2" cy="146.4" r="2.6" class="fr sr"/><circle cx="572.7" cy="143.6" r="2.6" class="fr sr"/><circle cx="589.7" cy="159.4" r="2.6" class="fr sr"/><circle cx="601.5" cy="146.9" r="2.6" class="fr sr"/><circle cx="626.7" cy="178.8" r="2.6" class="fr sr"/><circle cx="630.6" cy="176.5" r="2.6" class="fr sr"/><circle cx="651.5" cy="161.2" r="2.6" class="fr sr"/><circle cx="660.7" cy="168.1" r="2.6" class="fr sr"/><circle cx="668.7" cy="155.2" r="2.6" class="fr sr"/><circle cx="672.8" cy="147.4" r="2.6" class="fr sr"/><circle cx="672.9" cy="140.0" r="2.6" class="fr sr"/><circle cx="677.6" cy="155.1" r="2.6" class="fr sr"/><circle cx="680.7" cy="125.8" r="2.6" class="fr sr"/><circle cx="682.9" cy="139.8" r="2.6" class="fr sr"/><circle cx="685.2" cy="132.0" r="2.6" class="fr sr"/><text x="180" y="215" text-anchor="middle" class="tm" font-size="11.5">staircase: cuts only at midpoints between training points</text><text x="540" y="215" text-anchor="middle" class="tm" font-size="11.5">random cuts anywhere → straight lines joining the points</text></svg><figcaption>Same 30 points (red), default settings. The forest (blue) is a staircase. Extra Trees (teal) is piecewise linear and passes through every training point, noise included.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
rng = np.random.default_rng(4)
x = np.sort(rng.uniform(0, 3, 30)); y = np.sin(2*x) + rng.normal(0, 0.15, 30)
for name, m in [("Random forest (300 trees)", RandomForestRegressor(300, random_state=0)),
                ("Extra Trees (300 trees)", ExtraTreesRegressor(300, random_state=0))]:
    m.fit(x.reshape(-1, 1), y)
    print(name, "train R2:", round(m.score(x.reshape(-1, 1), y), 3))</div>
  <div class="fx" data-lang="text">Random forest (300 trees) train R2: 0.988
Extra Trees (300 trees) train R2: 1.0</div>
  <p>The second line is the warning hidden in the picture. With no bootstrap and fully grown trees, every extra tree puts each training point in its own pure leaf, so every tree predicts that point's <em>exact</em> noisy value, and so does their average: train R² = 1.0. Between training points it interpolates smoothly, but at the points it keeps all the noise. The forest's bootstrap leaves each point out of ~37% of trees, so its prediction there is pulled toward the neighbours (train R² 0.988).</p>
  <h3>When the noise matters: one input column</h3>
  <p>In the friedman1 run this did not hurt (5 relevant inputs, so test points fall between training points in many directions). In very low dimensions it does. Same bias/variance measurement, now on y = sin(3x) + 0.5x with one input, 30 training sets of 100 points, noise σ = 0.3 (noise variance 0.09):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
f = lambda x: np.sin(3 * x) + 0.5 * x                 # the true curve
grid = np.linspace(0, 3, 200).reshape(-1, 1)
models = {"extra trees, default":        lambda s: ExtraTreesRegressor(100, random_state=s, n_jobs=-1),
          "ET min_samples_split=10":     lambda s: ExtraTreesRegressor(100, min_samples_split=10, random_state=s, n_jobs=-1),
          "ET min_samples_leaf=5":       lambda s: ExtraTreesRegressor(100, min_samples_leaf=5, random_state=s, n_jobs=-1),
          "ET bootstrap=True":           lambda s: ExtraTreesRegressor(100, bootstrap=True, random_state=s, n_jobs=-1),
          "random forest, default":      lambda s: RandomForestRegressor(100, random_state=s, n_jobs=-1)}
for name, make in models.items():
    P = []
    for s in range(30):                                # 30 different training sets of 100 noisy points
        rng = np.random.default_rng(s)
        x = rng.uniform(0, 3, 100).reshape(-1, 1)
        y = f(x.ravel()) + rng.normal(0, 0.3, 100)
        P.append(make(s).fit(x, y).predict(grid))
    P = np.array(P)                                    # 30 x 200 predictions
    bias2 = np.mean((P.mean(0) - f(grid.ravel()))**2)  # how far the AVERAGE model is from the truth
    var = np.mean(P.var(0))                            # how much models jump between training sets
    print(f"{name:20s} bias^2 {bias2:.4f}  variance {var:.4f}  total error {bias2 + var + 0.09:.4f}")</div>
  <div class="fx" data-lang="text">extra trees, default bias^2 0.0025  variance 0.0572  total error 0.1497
ET min_samples_split=10 bias^2 0.0031  variance 0.0111  total error 0.1042
ET min_samples_leaf=5 bias^2 0.0830  variance 0.0062  total error 0.1792
ET bootstrap=True    bias^2 0.0018  variance 0.0292  total error 0.1210
random forest, default bias^2 0.0022  variance 0.0394  total error 0.1316</div>
  <p>Default Extra Trees now has <em>more</em> variance than the forest (0.057 vs 0.039): it reproduces every noisy point. Two cures. <code>min_samples_split=10</code> (the paper's n_min) stops splitting nodes with fewer than 10 rows, so each leaf averages a few points: variance falls to 0.011 and total error to 0.104, the best of all, 21% below the forest. <code>bootstrap=True</code> also helps (0.121). But <code>min_samples_leaf=5</code> is a disaster here (bias 0.083): see the next box.</p>
  <div class="callout trap"><span class="label">Trap: min_samples_leaf with few columns</span>
    <p>sklearn's random splitter draws a cut-off; if that cut-off would leave fewer than <code>min_samples_leaf</code> rows on one side, the candidate is rejected and the splitter tries another <em>column</em>. With only one column there is nothing else to try, so the node becomes a leaf. Many nodes stop far too early, some trees never split at all. Use <code>min_samples_split</code> for smoothing in Extra Trees, especially with few columns.</p>
  </div>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import ExtraTreesRegressor, RandomForestRegressor
rng = np.random.default_rng(0)
x = rng.uniform(0, 3, 100).reshape(-1, 1)              # ONE input column, 100 rows
y = np.sin(3 * x.ravel()) + 0.5 * x.ravel()
for name, m in [("ET min_samples_leaf=5  ", ExtraTreesRegressor(100, min_samples_leaf=5, random_state=0)),
                ("ET min_samples_split=10", ExtraTreesRegressor(100, min_samples_split=10, random_state=0)),
                ("RF min_samples_leaf=5  ", RandomForestRegressor(100, min_samples_leaf=5, random_state=0))]:
    m.fit(x, y)
    leaves = [t.get_n_leaves() for t in m.estimators_]
    print(f"{name} avg leaves/tree {np.mean(leaves):5.1f}   trees that never split: {sum(l == 1 for l in leaves)}")</div>
  <div class="fx" data-lang="text">ET min_samples_leaf=5   avg leaves/tree   6.9   trees that never split: 10
ET min_samples_split=10 avg leaves/tree  19.8   trees that never split: 0
RF min_samples_leaf=5   avg leaves/tree  11.2   trees that never split: 0</div>
  <p>10 of the 100 trees are a single leaf that predicts the overall mean: their first random cut happened to fall within the 5 lowest or 5 highest x values, it was rejected, and there was no second column to try. The forest is unaffected because it searches only among valid cut-offs.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For an averaged ensemble, variance at x ≈ ρ(x)σ²(x) + (1−ρ(x))σ²(x)/M. Extra Trees raises σ² of each tree (random cut-offs) but lowers ρ much more, and by using the full sample instead of bootstrap replicas it keeps the bias of each tree low. Geurts et al. show that as K → 1 and n_min grows, the ensemble's prediction becomes a smooth (continuous, piecewise multilinear) function of the inputs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Speed &amp; Size.</b> The other promised benefit was speed. Where does it come from, and what does it cost in model size?</div>

  <h2 id="et-speed"><span class="num">05</span>Speed &amp; Size</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The other promised benefit was speed: no sorting, no scanning of midpoints. Where exactly does the time go in each method, and what does Extra Trees pay for it in model size?</p>
  </div>
  <table class="tbl">
    <tr><th>Work at one node with n rows, K columns</th><th>CART / random forest</th><th>Extra Trees</th></tr>
    <tr><td>Per column</td><td>Sort values: O(n log n); scan all n−1 cut-offs, updating class counts: O(n)</td><td>Find min and max: O(n); draw one number: O(1); count both sides: O(n)</td></tr>
    <tr><td>Per node</td><td>O(K · n log n)</td><td>O(K · n)</td></tr>
    <tr><td>Whole tree (balanced, depth ≈ log n)</td><td>≈ O(K · n log² n)</td><td>≈ O(K · n log n)</td></tr>
    <tr><td>Rows per tree</td><td>n bootstrap rows (~0.63n distinct)</td><td>All n rows</td></tr>
  </table>
  <p>In words: the forest pays a sort at every node; Extra Trees only scans. At the diary's root that is the difference between sorting 14 humidity readings and scoring 9 midpoints, and drawing one number between 65 and 96. On the churn data (12,000 rows, 14 columns, 300 trees, one CPU core so the times compare fairly), from the run in section 06: random forest <strong>31.9 s</strong>, Extra Trees <strong>10.6 s</strong>, 3× faster, at the same accuracy (0.879 vs 0.878).</p>
  <p>The cost is size. Random cuts separate classes less efficiently, so a tree needs more splits before its leaves are pure; and since there is no bootstrap, each tree has 12,000 distinct rows to isolate instead of ~7,600. Result: <strong>4,800</strong> leaves per extra tree vs <strong>1,438</strong> per forest tree, so the saved model is about 3× bigger and prediction walks deeper paths.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Extra Trees is faster" is about <em>training</em>. Prediction can be slower and the model larger. If deployment size or latency matters, cap it with <code>min_samples_split</code>, <code>min_samples_leaf</code> (with enough columns) or <code>max_depth</code>, and measure. Model-size management is in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Parameters at Scale.</b> We have seen the defaults. The parameters can change the picture a lot; let us measure each on the shared churn data.</div>

  <h2 id="et-params"><span class="num">06</span>Parameters at Scale: the Churn Data</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The diary shows the mechanics but cannot rank settings (14 rows). On 20,000 customers, which of Extra Trees' knobs actually move accuracy, size and training time?</p>
  </div>
  <p>Same dataset as all tree notes: 20,000 fake customers, 14 columns (6 useful, 2 mixes, 4 useless, plus two pure-noise columns <code>row_noise</code> and <code>coin_noise</code>), 12,000 train / 3,000 validation / 5,000 test. Run this setup first.</p>
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
  <div class="fx" data-lang="py">from sklearn.ensemble import ExtraTreesClassifier
def run(name, m):
    t0 = time.time(); m.fit(Xtr, ytr); sec = time.time() - t0
    leaves = np.mean([t.get_n_leaves() for t in m.estimators_])
    print(f"{name:34s} val {m.score(Xva, yva):.3f}  leaves/tree {leaves:5.0f}  fit {sec:4.1f}s")
kw = dict(n_estimators=300, n_jobs=1, random_state=0)       # 1 core so the times compare fairly
run("random forest (sqrt)", RandomForestClassifier(**kw))
run("extra trees (sqrt) [default]", ExtraTreesClassifier(**kw))
run("extra trees, max_features=1", ExtraTreesClassifier(max_features=1, **kw))
run("extra trees, max_features=8", ExtraTreesClassifier(max_features=8, **kw))
run("extra trees, max_features=None", ExtraTreesClassifier(max_features=None, **kw))
run("extra trees, bootstrap=True", ExtraTreesClassifier(bootstrap=True, **kw))
run("extra trees, min_samples_split=10", ExtraTreesClassifier(min_samples_split=10, **kw))</div>
  <div class="fx" data-lang="text">random forest (sqrt)               val 0.879  leaves/tree  1438  fit 31.9s
extra trees (sqrt) [default]       val 0.878  leaves/tree  4800  fit 10.6s
extra trees, max_features=1        val 0.832  leaves/tree  8195  fit  7.7s
extra trees, max_features=8        val 0.891  leaves/tree  3045  fit 16.2s
extra trees, max_features=None     val 0.893  leaves/tree  2540  fit 23.0s
extra trees, bootstrap=True        val 0.872  leaves/tree  3242  fit  8.4s
extra trees, min_samples_split=10  val 0.868  leaves/tree  2227  fit  9.1s</div>
  <p>The headline: <strong>max_features</strong> matters most. With K = 1 (totally randomised trees) accuracy drops to 0.832 and trees balloon to 8,195 leaves. With K = 8 or all 14 columns, Extra Trees reaches 0.891–0.893, clearly above the forest's 0.879 and above anything a forest scored on this data (best 0.885). Larger K means each split sees more random candidates, so splits are better and trees smaller (2,540 leaves), while the random cut-offs still keep trees diverse. It costs time (23 s), but still less than the forest. <code>bootstrap=True</code> and <code>min_samples_split=10</code> slightly lowered accuracy here: on 12,000 rows with 14 columns, fully grown trees on all rows were best. Times are single-core on a busy shared machine; compare ratios.</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default (clf / reg)</th><th>Effect</th><th>Tip</th></tr>
    <tr><td><code>n_estimators</code> (M)</td><td>100</td><td>More trees = lower variance, never overfits</td><td>Extra trees are weaker individually; use a few hundred</td></tr>
    <tr><td><code>max_features</code> (K)</td><td>"sqrt" / 1.0</td><td>Higher: better splits, less randomness, slower</td><td>Tune first; try sqrt, 0.3, 0.6, 1.0. Often larger than for a forest</td></tr>
    <tr><td><code>min_samples_split</code> (n_min)</td><td>2</td><td>Higher: smoother, smaller trees, more bias</td><td>Paper: 5 for regression; key for noisy, low-dimensional data</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>1</td><td>Higher: smoother; can reject random cuts</td><td>Prefer n_min with few columns (section 04)</td></tr>
    <tr><td><code>max_depth</code>, <code>max_leaf_nodes</code></td><td>None</td><td>Cap size and latency</td><td>Use when the model is too big</td></tr>
    <tr><td><code>bootstrap</code></td><td>False</td><td>True: extra diversity, bias up, enables OOB</td><td>Helps on small noisy data</td></tr>
    <tr><td><code>max_samples</code></td><td>None</td><td>Rows per tree (only with bootstrap=True)</td><td>Speed on huge data</td></tr>
    <tr><td><code>oob_score</code></td><td>False</td><td>OOB score; requires bootstrap=True</td><td>Otherwise validate with CV</td></tr>
    <tr><td><code>criterion</code></td><td>"gini" / "squared_error"</td><td>Score of candidate splits</td><td>Rarely matters</td></tr>
    <tr><td><code>class_weight</code></td><td>None</td><td>"balanced", "balanced_subsample", dict</td><td>Same caveats as the forest (<a class="xref" data-note="ml_rf">Random Forest</a>)</td></tr>
    <tr><td><code>n_jobs</code>, <code>random_state</code>, <code>warm_start</code></td><td>None, None, False</td><td>Parallelism, reproducibility, growing gradually</td><td><code>n_jobs=-1</code>; set a seed</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing a tuned forest against default Extra Trees (or the reverse) is not a comparison. At defaults the two tie here (0.879 vs 0.878); after tuning <code>max_features</code> on both, Extra Trees wins by about a point. Tune both the same way, on the same CV folds.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: When It Beats a Random Forest.</b> One dataset is an anecdote. Let us test several kinds of data with cross-validation and see a pattern for when Extra Trees wins.</div>

  <h2 id="et-when"><span class="num">07</span>When It Beats a Random Forest</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One dataset is an anecdote. Across different kinds of data (the churn table, the same table with junk columns, a smooth regression target), when does Extra Trees beat a random forest, and when does it lose?</p>
  </div>
  <p>Three settings, each scored by 3-fold cross-validation on the same folds, both models at their defaults with 200 trees: the churn training rows; the churn rows plus 50 columns of pure random junk; and friedman1, a smooth regression target (R²).</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import ExtraTreesClassifier, RandomForestRegressor, ExtraTreesRegressor
from sklearn.datasets import make_friedman1
from sklearn.model_selection import cross_val_score
rng = np.random.default_rng(1)
noisy = pd.concat([Xtr, pd.DataFrame(rng.normal(size=(len(Xtr), 50)), index=Xtr.index,
                                     columns=[f"junk{i}" for i in range(50)])], axis=1)
Xf, yf = make_friedman1(n_samples=1000, noise=1.0, random_state=0)
cases = [("churn, 14 columns",            Xtr,   ytr, RandomForestClassifier, ExtraTreesClassifier, "accuracy"),
         ("churn + 50 junk columns",      noisy, ytr, RandomForestClassifier, ExtraTreesClassifier, "accuracy"),
         ("friedman1 (smooth regression)", Xf,   yf,  RandomForestRegressor,  ExtraTreesRegressor,  "r2")]
for name, X, y, RF, ET, metric in cases:
    r = cross_val_score(RF(n_estimators=200, n_jobs=-1, random_state=0), X, y, cv=3, scoring=metric).mean()
    e = cross_val_score(ET(n_estimators=200, n_jobs=-1, random_state=0), X, y, cv=3, scoring=metric).mean()
    print(f"{name:30s} {metric:8s} RF {r:.3f}   ET {e:.3f}")</div>
  <div class="fx" data-lang="text">churn, 14 columns              accuracy RF 0.856   ET 0.853
churn + 50 junk columns        accuracy RF 0.807   ET 0.778
friedman1 (smooth regression)  r2       RF 0.847   ET 0.862</div>
  <p>At defaults: a tie on churn, a clear Extra Trees win on the smooth regression (0.862 vs 0.847, matching the bias/variance result of section 04), and a clear <strong>loss</strong> with 50 junk columns (0.778 vs 0.807). Why the loss? With K = √64 = 8 of 64 columns, a node often draws only junk columns, or a useful column whose random cut-off is poor while a junk column's random cut happens to look slightly better on the training rows. A forest at least picks the <em>best</em> cut on each drawn column, so a useful column usually beats the junk. The fix is to raise K so useful columns are almost always among the candidates:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import ExtraTreesClassifier
from sklearn.model_selection import cross_val_score
rng = np.random.default_rng(1)
noisy = pd.concat([Xtr, pd.DataFrame(rng.normal(size=(len(Xtr), 50)), index=Xtr.index,
                                     columns=[f"junk{i}" for i in range(50)])], axis=1)   # 64 columns, 50 useless
for mf in ["sqrt", 0.3, 0.6, None]:
    e = cross_val_score(ExtraTreesClassifier(n_estimators=200, max_features=mf, n_jobs=-1, random_state=0),
                        noisy, ytr, cv=3).mean()
    print(f"churn + 50 junk, extra trees max_features={str(mf):5s} accuracy {e:.3f}")</div>
  <div class="fx" data-lang="text">churn + 50 junk, extra trees max_features=sqrt  accuracy 0.778
churn + 50 junk, extra trees max_features=0.3   accuracy 0.831
churn + 50 junk, extra trees max_features=0.6   accuracy 0.851
churn + 50 junk, extra trees max_features=None  accuracy 0.856</div>
  <p>With all 64 columns as candidates, Extra Trees scores 0.856 on the junk-laden data, as well as it did without any junk (0.853), because the best of 64 random cuts is almost always on a useful column. For fairness, the same change helps the forest less: a random forest with all 64 columns per split (that is, bagging) scored 0.836 in the same 3-fold run (code: the block above with <code>RandomForestClassifier</code> and <code>max_features</code> in ["sqrt", None] → 0.807, 0.836). Tuned, Extra Trees wins here too.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Lean towards</th><th>Why</th></tr>
    <tr><td>Smooth target, numeric columns, regression</td><td>Extra Trees</td><td>Random cuts average into smooth functions; lower variance (friedman1 +0.015 R²)</td></tr>
    <tr><td>Large data, training time matters</td><td>Extra Trees</td><td>No sort / search: ~3× faster training</td></tr>
    <tr><td>Many irrelevant columns</td><td>Forest at defaults; Extra Trees only with large K</td><td>Random cuts let junk win at small K</td></tr>
    <tr><td>Very few columns and noisy target</td><td>Forest, or Extra Trees with n_min ≈ 5–10</td><td>Default Extra Trees interpolates the noise</td></tr>
    <tr><td>Very skewed columns</td><td>Forest, or transform first</td><td>Uniform cuts over the range miss the dense part</td></tr>
    <tr><td>Model size / latency tight</td><td>Forest (or capped trees)</td><td>Extra trees grow ~3× more leaves</td></tr>
    <tr><td>Need a diverse member for a blend</td><td>Extra Trees</td><td>Its errors differ from both forest and boosting</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>There is no rule that says one wins. They cost almost the same to try, and both need only one real knob (max_features). Run both with a small K grid on the same CV folds and keep the better one; that is what experienced practitioners do.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From Scratch.</b> We have used sklearn's implementation throughout. Writing the random split and the recursion ourselves shows there is nothing hidden in it.</div>

  <h2 id="et-scratch"><span class="num">08</span>From Scratch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have used sklearn's implementation throughout. Is a random split really just one call to a random number generator, and can a few dozen lines reproduce sklearn's accuracy?</p>
  </div>
  <p>Four small functions: <code>gini</code> (impurity), <code>random_split</code> (K random columns, one uniform cut each, keep the best), <code>grow</code> (recursion with the paper's stopping rules), and <code>predict_one</code> (walk down). Trees are nested tuples <code>(column, cut, left, right)</code>; a leaf is just a number, P(churn). No bootstrap: each tree gets all rows. Pure Python is slow, so we train on the first 3,000 churn rows, with sklearn on the same rows for comparison.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import ExtraTreesClassifier

def gini(y):
    p = y.mean()
    return 1 - p**2 - (1 - p)**2

def random_split(X, y, k, rng):
    """Extra Trees split: k random columns, ONE random cut-off each, keep the best."""
    best = None
    for j in rng.choice(X.shape[1], k, replace=False):
        lo, hi = X[:, j].min(), X[:, j].max()
        if lo == hi:                                   # constant column in this node: skip it
            continue
        t = rng.uniform(lo, hi)                        # no sorting, no search
        left = X[:, j] &lt;= t
        score = gini(y) - (left.sum() * gini(y[left]) + (~left).sum() * gini(y[~left])) / len(y)
        if best is None or score &gt; best[0]:
            best = (score, j, t)
    return best

def grow(X, y, k, rng, min_split=2):
    if len(y) &lt; min_split or y.min() == y.max():       # too small or pure: make a leaf
        return y.mean()                                # leaf stores P(class 1)
    s = random_split(X, y, k, rng)
    if s is None:                                      # every candidate column was constant
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
        X = np.asarray(X)
        return np.mean([[predict_one(t, x) for x in X] for t in self.trees], axis=0)

Xs, ys = Xtr.iloc[:3000], ytr[:3000]                   # a smaller slice so pure Python stays quick
t0 = time.time(); mine = MyExtraTrees(100, k=3).fit(Xs, ys); s1 = time.time() - t0
sk = ExtraTreesClassifier(n_estimators=100, random_state=0).fit(Xs, ys)
acc_mine = np.mean((mine.predict_proba1(Xva) &gt; 0.5) == yva)
print(f"from scratch: val {acc_mine:.3f}")
print(f"sklearn     : val {sk.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">from scratch: val 0.831
sklearn     : val 0.832</div>
  <p>0.831 vs 0.832 on the same 3,000 training rows with K = 3 (= √14): the hand-written version matches sklearn to within one customer in a thousand. Points to notice in the code. The whole split "search" is <code>rng.uniform(lo, hi)</code>. Constant columns are skipped (the paper only draws among non-constant columns). A node stops when it is pure, too small, or when every drawn column is constant. There is no bootstrap anywhere. Change one line, <code>t = rng.uniform(lo, hi)</code>, into a loop over midpoints, and you have a random-forest tree (without the bootstrap).</p>
  <div class="bridge"><b>What this still can't tell us → next: Bagging vs Forest vs Extra Trees.</b> Finally, the three bagging-branch siblings side by side, measured on the same data, and summarised in one table.</div>

  <h2 id="et-cmp"><span class="num">09</span>Bagging vs Forest vs Extra Trees</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Bagging, random forest, Extra Trees: three ways of injecting randomness into deep trees. Measured the same way, how do single-tree strength, agreement between trees and ensemble accuracy change as we walk down the branch?</p>
  </div>
  <p>For each method, 300 trees on the churn data. We look at the first 50 trees: their average single-tree accuracy on validation, and how often two of them give the same answer (a direct look at ρ).</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier, ExtraTreesClassifier
models = {
    "bagging (all columns)": BaggingClassifier(DecisionTreeClassifier(), n_estimators=300, n_jobs=-1, random_state=0),
    "random forest (sqrt)":  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0),
    "extra trees (sqrt)":    ExtraTreesClassifier(n_estimators=300, n_jobs=-1, random_state=0)}
for name, m in models.items():
    m.fit(Xtr, ytr)
    P = np.array([t.predict(Xva.values) for t in m.estimators_[:50]])  # 50 trees' answers
    agree = np.mean([np.mean(P[i] == P[j]) for i in range(50) for j in range(i)])
    one = np.mean([np.mean(P[i] == yva) for i in range(50)])
    print(f"{name:22s} avg single tree {one:.3f}  two trees agree {agree:.1%}  ensemble val {m.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">bagging (all columns)  avg single tree 0.769  two trees agree 73.4%  ensemble val 0.883
random forest (sqrt)   avg single tree 0.738  two trees agree 68.3%  ensemble val 0.879
extra trees (sqrt)     avg single tree 0.700  two trees agree 63.5%  ensemble val 0.878</div>
  <p>The family logic in three lines. Each step down the branch makes one tree weaker (0.769 → 0.738 → 0.700) and two trees less alike (73% → 68% → 64% agreement). The ensemble is the balance of those two forces, and at default settings on this data they cancel almost exactly (0.883, 0.879, 0.878). The difference is in cost (Extra Trees trains fastest) and in how far tuning can take each (section 06: Extra Trees with all columns reached 0.893).</p>
  <table class="tbl">
    <tr><th></th><th>Bagging (trees)</th><th>Random forest</th><th>Extra Trees</th></tr>
    <tr><td>Rows per tree</td><td>Bootstrap</td><td>Bootstrap</td><td>All rows (default)</td></tr>
    <tr><td>Columns per split</td><td>All p</td><td>Random m (√p default for classes)</td><td>Random K (√p clf, p reg)</td></tr>
    <tr><td>Cut-off per column</td><td>Best (search)</td><td>Best (search)</td><td>One uniform random draw</td></tr>
    <tr><td>Split chosen</td><td>Best overall</td><td>Best among m columns</td><td>Best among K random candidates</td></tr>
    <tr><td>Single-tree strength</td><td>Highest</td><td>Middle</td><td>Lowest</td></tr>
    <tr><td>Correlation between trees</td><td>Highest</td><td>Middle</td><td>Lowest</td></tr>
    <tr><td>Bias of the ensemble</td><td>≈ one deep tree on ~63% of rows</td><td>Same, slightly higher with small m</td><td>Often lower (all rows), higher with K=1</td></tr>
    <tr><td>Variance of the ensemble</td><td>Highest of the three</td><td>Lower</td><td>Lowest (if noise not interpolated)</td></tr>
    <tr><td>Training speed</td><td>Slowest (p columns, search)</td><td>Faster (m columns, search)</td><td>Fastest (no search)</td></tr>
    <tr><td>Model size</td><td>Large</td><td>Large</td><td>Largest (more leaves)</td></tr>
    <tr><td>Decision function</td><td>Staircase</td><td>Staircase</td><td>Smoother (piecewise near-linear)</td></tr>
    <tr><td>OOB score</td><td>Yes</td><td>Yes</td><td>Only with bootstrap=True</td></tr>
    <tr><td>Works with any base model?</td><td>Yes (any estimator)</td><td>Trees only</td><td>Trees only</td></tr>
    <tr><td>Churn val, defaults</td><td>0.883</td><td>0.879</td><td>0.878</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>All three are <strong>parallel, variance-reducing</strong> ensembles of deep trees, differing only in where randomness enters: rows (bagging), rows + columns (random forest), columns + cut-offs (Extra Trees). None of them reduces bias meaningfully; that is the job of boosting (<a class="xref" data-note="ml_boosting">How Boosting Works</a>). The whole family is compared in <a class="xref" data-note="ml_trees">The Tree Family: Map &amp; How to Choose</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have the three siblings side by side. One picture and one table should show how every piece of this note follows from the previous one.</div>

  <h2 id="et-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Random cut-offs, no bootstrap, K and n_min, lower variance, smoother curves, faster training, bigger trees, junk columns: separate facts, or consequences of the two changes Extra Trees makes to a random forest?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 760 300" width="760">
<defs><marker id="et-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="220" height="44" rx="7" class="fb sb"/><text x="120" y="29" text-anchor="middle" font-size="11.5" font-weight="700">random forest</text><text x="120" y="45" text-anchor="middle" class="tm" font-size="10">random columns, best cut-off</text>
<line x1="230" y1="32" x2="268" y2="32" stroke="currentColor" marker-end="url(#et-ca)"/>
<rect x="270" y="10" width="220" height="44" rx="7" class="fg sg"/><text x="380" y="29" text-anchor="middle" font-size="11.5" font-weight="700">+ one random cut-off</text><text x="380" y="45" text-anchor="middle" class="tm" font-size="10">HumPct ≤ 89.96 vs best 82.5</text>
<line x1="490" y1="32" x2="528" y2="32" stroke="currentColor" marker-end="url(#et-ca)"/>
<rect x="530" y="10" width="220" height="44" rx="7" class="fg sg"/><text x="640" y="29" text-anchor="middle" font-size="11.5" font-weight="700">− bootstrap (all rows)</text><text x="640" y="45" text-anchor="middle" class="tm" font-size="10">lower bias per tree</text>
<line x1="380" y1="54" x2="200" y2="90" stroke="currentColor" marker-end="url(#et-ca)"/>
<line x1="380" y1="54" x2="560" y2="90" stroke="currentColor" marker-end="url(#et-ca)"/>
<rect x="60" y="92" width="280" height="44" rx="7" class="fr sr"/><text x="200" y="111" text-anchor="middle" font-size="11.5" font-weight="700">each tree weaker</text><text x="200" y="127" text-anchor="middle" class="tm" font-size="10">avg random drop 0.037 of 0.092</text>
<rect x="420" y="92" width="280" height="44" rx="7" class="fb sb"/><text x="560" y="111" text-anchor="middle" font-size="11.5" font-weight="700">trees less alike (lower ρ)</text><text x="560" y="127" text-anchor="middle" class="tm" font-size="10">churn: agree 64% vs 68%</text>
<line x1="200" y1="136" x2="360" y2="172" stroke="currentColor" marker-end="url(#et-ca)"/>
<line x1="560" y1="136" x2="400" y2="172" stroke="currentColor" marker-end="url(#et-ca)"/>
<rect x="230" y="174" width="300" height="44" rx="7" class="ft st"/><text x="380" y="193" text-anchor="middle" font-size="11.5" font-weight="700">ensemble: lowest variance, smoother</text><text x="380" y="209" text-anchor="middle" class="tm" font-size="10">diary 82.5%: 35.2 between 43 and 24</text>
<line x1="230" y1="196" x2="152" y2="232" stroke="currentColor" marker-end="url(#et-ca)"/>
<line x1="380" y1="218" x2="380" y2="232" stroke="currentColor" marker-end="url(#et-ca)"/>
<line x1="530" y1="196" x2="610" y2="232" stroke="currentColor" marker-end="url(#et-ca)"/>
<rect x="10" y="234" width="230" height="44" rx="7" class="ft st"/><text x="125" y="253" text-anchor="middle" font-size="11.5" font-weight="700">~3× faster training</text><text x="125" y="269" text-anchor="middle" class="tm" font-size="10">no sort, no midpoint scan</text>
<rect x="265" y="234" width="230" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.35"/><text x="380" y="253" text-anchor="middle" font-size="11.5" font-weight="700">tune K (max_features)</text><text x="380" y="269" text-anchor="middle" class="tm" font-size="10">often larger than a forest's</text>
<rect x="520" y="234" width="230" height="44" rx="7" class="fr sr"/><text x="635" y="253" text-anchor="middle" font-size="11.5" font-weight="700">costs and limits</text><text x="635" y="269" text-anchor="middle" class="tm" font-size="10">3× leaves · copies noise · no OOB</text>
</svg><figcaption>Extra Trees is a random forest with two changes: a random cut-off instead of the best one, and no bootstrap. The first makes each tree weaker but the trees far less alike; the second keeps each tree's bias low. The balance gives the lowest-variance, smoothest ensemble of the bagging branch, faster to train, at the price of bigger trees and a knob (K) that must be tuned.</figcaption></figure>
  <table class="tbl"><caption>Every concept, what it is built from, and its value on the diary (or at scale)</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On the diary / at scale</th><th>Use when</th></tr>
    <tr><td>Random cut-off</td><td>uniform draw in [node min, node max]</td><td>how to skip the search?</td><td>HumPct ≤ 89.96 (drop 0.066); TempC ≤ 26.89 (0.016)</td><td>always (the core idea)</td></tr>
    <tr><td>Best of K candidates</td><td>Gini / variance drop of each random cut</td><td>which random cut to keep?</td><td>humidity beats temperature</td><td>K = max_features, tune it</td></tr>
    <tr><td>Expected quality of a random cut</td><td>interval widths × drops</td><td>how bad is random?</td><td>0.037 vs best 0.092; best interval 16%</td><td>reasoning about K and depth</td></tr>
    <tr><td>No bootstrap</td><td>every tree on all rows</td><td>keep bias low?</td><td>friedman1 bias² 3.07 vs forest 3.52</td><td>default; bootstrap=True on small noisy data</td></tr>
    <tr><td>Lower ρ</td><td>random cuts land in different places</td><td>why is the ensemble better?</td><td>churn: two trees agree 64% (forest 68%)</td><td>variance-dominated problems</td></tr>
    <tr><td>Smoothness</td><td>average of randomly placed steps</td><td>what shape is the prediction?</td><td>82.5%: 35.2 (forest 43.2)</td><td>smooth regression targets</td></tr>
    <tr><td>Speed and size</td><td>scan instead of sort; more splits per tree</td><td>what does it cost?</td><td>churn: 10.6 s vs 31.9 s; 4,800 vs 1,438 leaves</td><td>large data, loose size budget</td></tr>
    <tr><td>n_min (min_samples_split)</td><td>stop splitting small nodes</td><td>stop copying noise?</td><td>sine data: total error 0.150 → 0.104</td><td>noisy, few columns</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>Extra Trees trades the quality of each split for diversity and speed, and uses all rows to win back the bias.</strong> Whether the trade pays depends on K: large enough that useful columns are among the candidates, small enough that the trees still differ.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Which mistakes do people make when they switch from a forest to Extra Trees?</div>

  <h2 id="et-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which Extra Trees mistakes cost the most in practice and in interviews, and which section of this note prevents each one?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: thinking "extra" means more trees</span>
    <p>It means extra randomness: random cut-offs on top of random columns, and no bootstrap by default.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reusing a forest's max_features</span>
    <p>Extra Trees often wants a larger K, because each candidate is a random cut. On churn: sqrt 0.878, all columns 0.893. With 50 junk columns: sqrt 0.778, all columns 0.856.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting OOB scores</span>
    <p>With the default <code>bootstrap=False</code> there are no out-of-bag rows, and <code>oob_score=True</code> raises an error. Use cross-validation, or set <code>bootstrap=True</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: noisy, low-dimensional data at defaults</span>
    <p>No bootstrap + full depth = the ensemble passes through every training point (train R² 1.0). Use <code>min_samples_split</code> (n_min) of 5–10 or <code>bootstrap=True</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: min_samples_leaf with few columns</span>
    <p>Rejected random cuts are not retried on the same column; with one column, 10 of 100 trees never split. Use <code>min_samples_split</code> instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: skewed columns</span>
    <p>Uniform cuts over [min, max] mostly land in the empty tail. Log or rank-transform heavy-tailed columns before Extra Trees.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "faster" means faster everywhere</span>
    <p>Training is faster; the model has ~3× more leaves, so it is bigger and can be slower to predict.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting it to fix bias</span>
    <p>Like every averaging method, it reduces variance. If all trees miss a pattern, so does the ensemble; that is boosting's job.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page for revision.</div>

  <h2 id="et-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: the captain's 14-day cricket diary (Play: 9 Yes / 5 No; numeric columns HumPct 65–96 and TempC 18–29; Turnout). Large-scale numbers: the 20,000-customer churn table, friedman1 and a noisy sine curve.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer (diary / scale)</th><th>Weakness → next</th></tr>
    <tr><td>Random cut-off</td><td>trees less alike, cheaper?</td><td>one uniform cut per column, best of K, no bootstrap</td><td>how bad is random? → by hand</td></tr>
    <tr><td>One split by hand</td><td>cost of a random cut?</td><td>89.96: 0.066 vs 82.5: 0.092; average 0.037</td><td>whole trees? → algorithm</td></tr>
    <tr><td>Algorithm</td><td>steps and knobs?</td><td>K, n_min, M; K = 1 ignores labels</td><td>better than a forest? → bias/variance</td></tr>
    <tr><td>Bias, variance, smoothness</td><td>what moves?</td><td>variance 0.71 vs 1.08; 82.5%: 35.2 vs 43.2</td><td>copies noise; speed? → speed</td></tr>
    <tr><td>Speed &amp; size</td><td>faster?</td><td>~3× faster training, ~3× more leaves</td><td>which knobs? → parameters</td></tr>
    <tr><td>Parameters / when / scratch</td><td>tune and choose?</td><td>max_features all: 0.893; junk columns need large K</td><td>still only variance → boosting</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Random cut-off</td><td>t ~ Uniform(min_S x_j, max_S x_j)</td><td>S rows in the node, x_j a drawn column</td></tr>
    <tr><td>Split chosen</td><td>argmax over K candidates of Δi = i(S) − Σ (|S_k|/|S|) i(S_k)</td><td>i Gini (classes) or variance (numbers)</td></tr>
    <tr><td>Expected drop of a random cut</td><td>Σ over value intervals (width / range) · drop</td><td>diary humidity: 1.132 / 31 = 0.037</td></tr>
    <tr><td>Ensemble variance</td><td>ρσ² + (1 − ρ)σ²/M</td><td>random cuts raise σ² of a tree, lower ρ more</td></tr>
    <tr><td>Defaults (paper)</td><td>K = √p (classes), p (regression); n_min = 2 (classes), 5 (regression)</td><td>sklearn: max_features, min_samples_split, n_estimators, bootstrap=False</td></tr>
    <tr><td>Cost per node</td><td>O(K · n) vs forest O(K · n log n)</td><td>n rows in the node</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use Extra Trees</b><p>Smooth numeric targets, large data where training time matters, a diverse member for a blend.</p><small>Tune max_features; try 1.0</small></div>
    <div><b>Prefer a forest</b><p>Many junk columns at small K, very skewed columns, tight model size or latency.</p><small>Or raise K / transform columns</small></div>
    <div><b>Add smoothing</b><p>Few columns and a noisy target: n_min 5–10 or bootstrap=True.</p><small>Not min_samples_leaf with one column</small></div>
    <div><b>Validate</b><p>No OOB by default: use cross-validation, same folds for forest and Extra Trees.</p><small>Compare tuned vs tuned</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>"Extra" means more trees (it means more randomness); reusing a forest's max_features; expecting OOB with bootstrap=False; default settings on noisy low-dimensional data; min_samples_leaf with few columns; skewed columns; "faster" applying to prediction; expecting any bias reduction.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Humidity range 65–96; chance a random cut lands in 80–85?</td><td>5/31 = 16%</td></tr>
    <tr><td>Random cuts give drops 0.066 (humidity) and 0.016 (temperature). Which split?</td><td>HumPct ≤ 89.96, the larger drop</td></tr>
    <tr><td>What does K = 1 mean?</td><td>Totally randomised trees: the labels never choose a split</td></tr>
    <tr><td>Why does Extra Trees drop the bootstrap?</td><td>Random cuts already make trees differ; all rows keep each tree's bias low</td></tr>
    <tr><td>Why can it lose with 50 junk columns at K = √p?</td><td>Junk columns' random cuts often beat a useful column's poor random cut; raise K</td></tr>
  </table>

  <h2 id="et-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How does an Extra Trees split differ from a random forest split?</summary><div class="qa-body">Both draw K random columns. The forest finds the best cut-off on each (sort, try every midpoint) and keeps the best. Extra Trees draws one cut-off per column uniformly between the node's min and max and keeps the best of those K random candidates. Also, Extra Trees uses all rows per tree by default (no bootstrap).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Extra Trees not bootstrap by default?</summary><div class="qa-body">The random cut-offs already make trees diverse enough, and using the full sample lowers each tree's bias (bootstrap trees see only ~63% of distinct rows). Measured on friedman1: Extra Trees bias² 3.07 vs forest 3.52, with lower variance too (0.71 vs 1.08).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Work a random split: 8 rows, 4 churn / 4 stay; the cut puts [4 churn, 1 stay] left and [0, 3] right. Drop?</summary><div class="qa-body">Parent Gini 0.5. Left Gini 1 − (0.8² + 0.2²) = 0.32; right 0. Weighted = 5/8 × 0.32 = 0.2. Drop = 0.5 − 0.2 = 0.3. The best (CART) cut would give 0.5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to bias and variance compared with a random forest?</summary><div class="qa-body">Single extra trees have higher variance (and similar or slightly higher bias) than single CART trees. But the trees are much less correlated, so the ensemble's variance is lower; and without bootstrap the ensemble's bias is often lower too. With very small K or heavily smoothed leaves, bias rises.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are totally randomised trees?</summary><div class="qa-body">Extra Trees with K = 1: one random column and one random cut-off per node. The labels are not used to build the structure at all, only to fill leaves. They still work as an averaged smoother but are usually weaker (churn: 0.832 vs 0.878 with K = √p) and much larger (8,195 leaves per tree).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is Extra Trees faster to train, and what is the catch?</summary><div class="qa-body">Per node and column it computes min, max and one partition, O(n), instead of sorting and scanning all cut-offs, O(n log n). Churn: 10.6 s vs 31.9 s on one core. The catch: random cuts are less efficient, so trees have more leaves (4,800 vs 1,438), giving bigger models and possibly slower prediction.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you expect Extra Trees to beat a random forest?</summary><div class="qa-body">Smooth targets with numeric inputs (friedman1 R² 0.862 vs 0.847), large data where training time matters, and after tuning K upward (churn 0.893 vs 0.879). It tends to lose with many irrelevant columns at small K (0.778 vs 0.807), on very few noisy columns at defaults, and with very skewed columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does default Extra Trees reach train R² = 1.0 in regression, and is that a problem?</summary><div class="qa-body">Without bootstrap and with full-depth trees, every tree isolates every training point in a pure leaf, so every tree, and their average, reproduces each training target exactly, noise included. In high dimensions it is often harmless; with few columns and noisy targets it raises variance (1D test: 0.057 vs forest 0.039). Fix with min_samples_split 5–10 (variance fell to 0.011) or bootstrap=True.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is min_samples_leaf risky in sklearn's Extra Trees with few columns?</summary><div class="qa-body">A random cut that leaves fewer than min_samples_leaf rows on one side is rejected and the splitter moves to another column, not another cut. With one column there is no other, so the node becomes a leaf: 10 of 100 trees never split in our test. min_samples_split does not have this problem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does the decision function of Extra Trees look smoother than a forest's?</summary><div class="qa-body">A forest's trees cut at midpoints between the same training values, so their steps stack up in the same places and the average is still a staircase. Extra Trees' cuts fall at random positions, so averaging hundreds of randomly placed steps yields near-linear pieces between training points.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you get an OOB score from ExtraTreesClassifier?</summary><div class="qa-body">Only with bootstrap=True (then oob_score=True works). With the default bootstrap=False every tree saw every row, so there are no out-of-bag rows; use cross-validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: order bagging, random forest and Extra Trees by single-tree strength and by tree correlation, with numbers.</summary><div class="qa-body">Strength: bagging 0.769 &gt; forest 0.738 &gt; Extra Trees 0.700 (average single tree on churn validation). Correlation (two-tree agreement): 73.4% &gt; 68.3% &gt; 63.5%. Ensembles: 0.883, 0.879, 0.878. More randomness trades strength for diversity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what problem do all three bagging-branch methods leave unsolved, and which note solves it?</summary><div class="qa-body">Bias. Averaging independent trees cancels their random errors but not a mistake they all share. Boosting builds trees sequentially, each one fitting what the current ensemble still gets wrong, which reduces bias. See <a class="xref" data-note="ml_boosting">How Boosting Works</a> and <a class="xref" data-note="ml_gbm">Gradient Boosting</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is Extra Trees a good member of a voting or stacking ensemble?</summary><div class="qa-body">Its errors differ from a forest's (random cuts, smoother boundaries, no bootstrap) and very much from a booster's (parallel deep trees vs sequential shallow trees). Blending models with different errors is what makes voting and stacking pay off. See <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Extra Trees need the "best of K" step? What breaks if every split is fully random?</summary><div class="qa-body">With K = 1 the labels never choose a split: the tree structure is pure chance and only the leaves use the labels. On the diary root a coin decides between humidity and temperature, so half the trees open with a temperature cut that removes almost nothing (drop 0.016). Averaged, such trees still work as a smoother, but on churn K = 1 scored 0.832 vs 0.878 at √p and 0.893 with all columns. Keeping the best of K random candidates lets the labels pick the column while the cut-off stays random.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the variance formula ρσ² + (1 − ρ)σ²/M connect bagging, the random forest and Extra Trees?</summary><div class="qa-body">Each step down the branch adds randomness that raises one tree's error (σ², strength down: 0.769 → 0.738 → 0.700 single-tree accuracy on churn) but lowers the correlation ρ more (73% → 68% → 64% agreement). Bagging resamples rows, the forest also hides columns per split (Outlook root 562 → 375 of 1,000 diary trees), Extra Trees also randomises the cut-off (humidity cut 89.96 instead of 82.5). The ensemble's accuracy is the balance of the two.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On the diary, why does Extra Trees predict 35.2 members at 82.5% humidity while the forest predicts 43.2?</summary><div class="qa-body">Every forest tree cuts at a midpoint between observed readings, and 82.5 itself is the midpoint of 80 and 85, so (with ≤) the forest keeps 82.5 on the dry side and predicts the dry level. Extra trees draw the cut anywhere in 80–85, so about half of them put 82.5 on each side, and the average lands between the two levels. That is the smoothing effect of random cut-offs, seen on one point.</div></details>
</main>
`
});
