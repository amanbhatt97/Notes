// notes/ml/ml_rf.js — Random Forest
Object.assign(TOPIC_CONTENT, {
  "ml_rf": `<main>
  <h1>Random Forest</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Bagging</span><span>Random Forest</span></div>
  <p class="lead">A random forest is bagging with one extra rule: at every split, each tree may look at only a random handful of columns. That small rule makes the trees disagree more, and a vote of trees that disagree is worth more than a vote of copies. This note builds it from the problem it solves, works every formula by hand on small numbers, then runs it on the shared 20,000-customer churn data: the algorithm, out-of-bag scoring, every hyperparameter, feature importance (and its trap), regression, imbalance, proximity, cost, and a from-scratch version that matches sklearn.</p>

  <h2 id="rf-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<defs><marker id="rf-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="245" y="8" width="150" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="30" text-anchor="middle" font-size="13">Decision Trees</text>
<rect x="245" y="64" width="150" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="86" text-anchor="middle" font-size="13">Ensemble Learning</text>
<line x1="320" y1="42" x2="320" y2="62" stroke="currentColor" marker-end="url(#rf-a0)"/>
<rect x="60" y="122" width="170" height="34" rx="7" class="fb sb"/><text x="145" y="144" text-anchor="middle" font-size="13">Bagging &amp; Bootstrap</text>
<rect x="260" y="122" width="120" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="320" y="144" text-anchor="middle" font-size="13" class="tm">Boosting</text>
<rect x="410" y="122" width="160" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="490" y="144" text-anchor="middle" font-size="13" class="tm">Stacking &amp; Voting</text>
<line x1="300" y1="98" x2="160" y2="120" stroke="currentColor" marker-end="url(#rf-a0)"/><line x1="320" y1="98" x2="320" y2="120" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#rf-a0)"/><line x1="340" y1="98" x2="480" y2="120" stroke="currentColor" stroke-opacity="0.4" marker-end="url(#rf-a0)"/>
<rect x="20" y="182" width="150" height="38" rx="7" class="fg sg" stroke-width="3"/><text x="95" y="200" text-anchor="middle" font-size="13" font-weight="700">Random Forest</text><text x="95" y="214" text-anchor="middle" font-size="10" class="tg">you are here</text>
<rect x="200" y="182" width="130" height="38" rx="7" class="fb sb"/><text x="265" y="205" text-anchor="middle" font-size="13">Extra Trees</text>
<line x1="125" y1="156" x2="100" y2="180" stroke="currentColor" marker-end="url(#rf-a0)"/><line x1="165" y1="156" x2="240" y2="180" stroke="currentColor" marker-end="url(#rf-a0)"/>
<text x="20" y="176" font-size="10" class="tm">+ random columns per split</text>
<text x="350" y="205" font-size="11" class="tm">+ random cut-offs too (next note)</text>
</svg><figcaption>The tree family with this note highlighted. Random forest is a child of bagging; its sibling Extra Trees adds one more layer of randomness.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a></b><span>Bagging trains many deep trees on bootstrap samples and averages them. That cut the churn error a lot (one tree 0.77 → 100 bagged trees 0.88). But the trees are still alike: the strongest column wins the first question in almost every tree (on the captain's 14-day cricket diary, the running example of the tree family, Outlook is the root of 562 of 1,000 bagged trees; on the churn data <code>f5</code> is the root of all 100), so they share mistakes, and averaging cannot cancel a mistake they all make.</span></li>
    <li><b>This note adds: random columns at every split</b><span>Each split may only choose among <code>max_features</code> randomly drawn columns. Trees become less alike (lower correlation ρ), so the average gets closer to the ideal of independent voters, and each split is cheaper to search. Plus a free validation score (OOB), importance scores, proximities.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_extratrees">Extra Trees</a> and <a class="xref" data-note="ml_boosting">How Boosting Works</a></b><span>Extra Trees pushes the same idea further by also drawing the cut-off at random. Boosting attacks what no forest can fix: averaging lowers variance but never bias, so a shared blind spot stays. Boosting builds trees in sequence to fix exactly that.</span></li>
  </ol>
  <p>You should already know how one tree picks a split with Gini impurity (<a class="xref" data-note="ml_dtree">Decision Trees</a>), why averaging helps (<a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a>) and what a bootstrap sample is (<a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a>). Each is re-explained in one line where it is used.</p>

  <h2 id="rf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Small numbers come from the running example, the captain's 14-day cricket diary; large ones from the 20,000-customer churn table.</p>
  <ol class="story">
    <li><b>The problem: bagged trees look alike</b><span>Q: why did bagging stop improving? → The strongest column wins the root in most bootstrap samples (Outlook in 562 of 1,000 diary trees, <code>f5</code> in 100 of 100 churn trees), so the trees share mistakes and the variance stops at the floor ρσ². How do we make trees less alike without making them useless?</span></li>
    <li><b>Random columns at every split</b><span>Q: how do we stop one column deciding every tree? → Each split may only look at m random columns. With m = 2 of the diary's 4, the six possible pairs pick Outlook 3 times, Humidity 2, Wind 1; over 1,000 bootstrap trees Outlook falls from 562 roots to 375. Lower ρ, but each tree is a little weaker. How do the pieces make a full algorithm?</span></li>
    <li><b>The full algorithm</b><span>Q: what exactly is a random forest, and how do its trees vote? → Bootstrap + random columns per split + deep trees + soft vote. For D10 five shallow trees give P(Yes) 1.00, 0.62, 0.33, 0.43, 0.40: the hard vote says No, the soft vote 0.557 says Yes (correct). Breiman's bound: error ≤ ρ̄(1 − s²)/s². How do we score it without a test set?</span></li>
    <li><b>Out-of-bag score</b><span>Q: is there a free validation score? → Each row is judged only by trees that never saw it: 4 diary trees score 6 of 13 days (noise with so few trees); at scale OOB 0.864 vs validation 0.881. Which knobs then matter?</span></li>
    <li><b>Hyperparameters</b><span>Q: what should we tune? → max_features first (m = √4 = 2 on the diary, √14 ≈ 3 at scale), then tree size for memory, max_samples for speed; n_estimators until OOB flattens. Which columns did the forest use?</span></li>
    <li><b>Importance: MDI and permutation</b><span>Q: which columns matter? → MDI adds impurity drops (diary depth-2 tree: Humidity 0.56, Outlook 0.44) but favours many-valued columns; permutation importance shuffles a column and measures the damage (diary tree: Outlook 0.34, Humidity 0.18, Wind 0.17, Temp 0). What about numeric targets?</span></li>
    <li><b>Regression and extrapolation</b><span>Q: how does a forest predict a number, and where does it fail? → Average of leaf means; but it is flat outside the data: turnout at 110% humidity is predicted 29.2, the same as at 96%, while a line keeps falling. What if one class is rare?</span></li>
    <li><b>Imbalance, proximity, cost, from scratch</b><span>Q: what else does a forest offer or cost? → Class weights n/(k·n_c) (diary: No 1.4, Yes 0.78) or a moved threshold; proximities (D1 and D2 share a leaf in 62% of trees, D1 and D13 in 12%); 69 MB for 300 trees; and a 30-line version that matches sklearn's behaviour. Its one blind spot: averaging never fixes bias.</span></li>
  </ol>

  <h2 id="rf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Random Forest</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Running example: the diary</div>
        <ul>
          <li>Root IG: Outlook 0.247, Humidity 0.152, Wind 0.048, Temp 0.029</li>
          <li>m = 2 of 4: pairs pick Outlook 3/6, Humidity 2/6, Wind 1/6</li>
          <li>1,000 bootstrap trees: Outlook root 562 (bagging) → 375 (forest)</li>
          <li>D10 soft vote 0.557 → Yes, hard vote No · MDI Humidity 0.56 / Outlook 0.44</li>
          <li>Permutation: Outlook 0.34, Humidity 0.18, Wind 0.17, Temp 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">1 · The problem</div>
        <ul>
          <li><b>Bagged trees look alike</b> — <code>f5</code> is the root of 100 / 100 bagged trees</li>
          <li><b>Var of average</b> = ρσ² + (1−ρ)σ²/B → floor ρσ² no matter how many trees</li>
          <li>Worked: σ²=1, B=200: ρ 0.47 → 0.473; ρ 0.17 → 0.174</li>
          <li>💡 A panel of 10 judges who all read the same newspaper</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · The fix</div>
        <ul>
          <li><b>At every split</b> draw <code>max_features</code> = m columns; best split among those only</li>
          <li>P(strong column offered) = m/p = 3/14 = 21% → <code>f5</code> root in 22 / 100 trees</li>
          <li><b>Defaults</b> — √p (classification), p in sklearn regression (Breiman: p/3)</li>
          <li>Smaller m → lower ρ but weaker trees (strength s); tune it</li>
          <li><b>Per split, not per tree</b> (that would be random subspaces)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Algorithm &amp; prediction</div>
        <ul>
          <li>For b = 1..B: bootstrap → grow full tree with random m per split → keep</li>
          <li><b>Classify</b> — average probabilities (sklearn, soft vote); Breiman: majority vote</li>
          <li><b>Regress</b> — average of leaf means</li>
          <li>Worked soft vote: 0.9, 0.45, 0.45, 0.45, 0.8 → mean 0.61 → churn (hard vote says stay)</li>
          <li>Breiman bound: error ≤ ρ̄(1−s²)/s²</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Out-of-bag (OOB)</div>
        <ul>
          <li>Each row is left out of ~36.8% of trees → those trees vote on it</li>
          <li>Free validation score: <code>oob_score=True</code> → 0.864 vs val 0.881</li>
          <li>⚠ Pessimistic with few trees (5 trees: OOB 0.728)</li>
          <li>⚠ Not valid after fitting preprocessing on all rows; noisy on small data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Hyperparameters</div>
        <ul>
          <li><b>n_estimators</b> — more never overfits; stop when OOB flattens (~200 here)</li>
          <li><b>max_features</b> — the main knob (ρ vs strength)</li>
          <li><b>max_depth / min_samples_leaf</b> — smaller trees: less memory, a bit of bias</li>
          <li><b>max_samples</b> — rows per bootstrap; faster, more diverse</li>
          <li><b>bootstrap, class_weight, oob_score, n_jobs, random_state, warm_start</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Importance</div>
        <ul>
          <li><b>MDI</b> — Σ (N_t/N)·impurity drop per column, averaged over trees; sums to 1</li>
          <li>Worked: A 0.32 + B 0.16 → 0.667 / 0.333</li>
          <li>⚠ Bias to many-valued columns: random <code>row_noise</code> MDI 0.036 vs perm 0.004</li>
          <li><b>Permutation</b> — shuffle one column on validation, measure the drop</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">7 · Special cases</div>
        <ul>
          <li><b>Regression</b> — average of leaf means; cannot extrapolate (size 300 → 118, true 240)</li>
          <li><b>Imbalance</b> — class_weight, balanced RF, or just move the threshold (0.2: recall 0.56 → 0.76)</li>
          <li><b>Proximity</b> — share of trees where two rows land in the same leaf → similarity, outliers, label typos</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">8 · Cost &amp; verdict</div>
        <ul>
          <li><b>Train</b> ≈ O(B · m · n log n · …), parallel over trees; <b>predict</b> O(B · depth)</li>
          <li>Full trees are big: 300 trees = 862k nodes, 69 MB pickle</li>
          <li><b>Pros</b> — strong default, little tuning, OOB, robust, parallel</li>
          <li><b>Cons</b> — size, slower predict, no extrapolation, beaten by tuned boosting</li>
          <li>Test: tree 0.773 → bagging 0.868 → forest 0.871</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rf-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain of questions</span></div></div>
      <div class="rm-item rm-done" data-target="rf-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Problem</span><span class="rm-sub">Bagged trees look alike</span></div></div>
      <div class="rm-item rm-done" data-target="rf-split"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Fix</span><span class="rm-sub">Random columns at every split, on the diary</span></div></div>
      <div class="rm-item rm-done" data-target="rf-algo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Full Algorithm</span><span class="rm-sub">Training, soft vs hard vote, Breiman's bound</span></div></div>
      <div class="rm-item rm-done" data-target="rf-oob"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Out-of-Bag Score</span><span class="rm-sub">By hand on the diary, then at scale</span></div></div>
      <div class="rm-item rm-done" data-target="rf-hp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Hyperparameters</span><span class="rm-sub">What each knob does</span></div></div>
      <div class="rm-item rm-done" data-target="rf-imp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Feature Importance</span><span class="rm-sub">MDI and permutation, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rf-reg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Regression &amp; Extrapolation</span><span class="rm-sub">Averages of leaf means; the flat ceiling</span></div></div>
      <div class="rm-item rm-done" data-target="rf-imb"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Imbalanced Classes</span><span class="rm-sub">Weights, balanced RF, thresholds</span></div></div>
      <div class="rm-item rm-done" data-target="rf-prox"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Proximity &amp; Outliers</span><span class="rm-sub">Which rows the forest treats alike</span></div></div>
      <div class="rm-item rm-done" data-target="rf-cost"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Complexity, Memory, Speed</span><span class="rm-sub">What a forest costs</span></div></div>
      <div class="rm-item rm-done" data-target="rf-scratch"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">A forest on sklearn trees</span></div></div>
      <div class="rm-item rm-done" data-target="rf-cmp"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Tree vs Bagging vs Forest</span><span class="rm-sub">Same data, same test</span></div></div>
      <div class="rm-item rm-done" data-target="rf-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="rf-pros"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Pros &amp; Cons</span><span class="rm-sub">When to use it</span></div></div>
      <div class="rm-item rm-done" data-target="rf-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="rf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="rf-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="rf-problem"><span class="num">01</span>The Problem: Bagged Trees Look Alike</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Bagging averaged many bootstrap trees and cut a single tree's error a lot, but then it stopped improving, however many trees we added. Why did it stall, and what exactly would have to change in the trees for the average to keep improving?</p>
  </div>
  <p>Quick recap of where we stand. One deep decision tree memorises its training rows: change a few rows and you get a quite different tree (high <strong>variance</strong>). Bagging fixes part of this: draw a <strong>bootstrap sample</strong> (n rows picked at random <em>with replacement</em>, so some rows twice, some never), grow a deep tree on it, repeat B times, and average the trees. The random wobbles of different trees cancel in the average.</p>
  <p>But the cancelling only works if the trees wobble <em>differently</em>. Each bootstrap sample contains about 63% of the distinct rows, and any two samples overlap heavily, so the trees are not very different. Worse, if one column is much stronger than the rest, every tree asks about that column first, and the whole top of every tree is the same.</p>
  <h3>Seeing it on the diary</h3>
  <p>The running example of the whole tree family is the captain's 14-day cricket diary (<code>play.py</code>):</p>
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
  <p>At the root of the diary, information gain ranks the four weather columns Outlook 0.247, Humidity 0.152, Wind 0.048, Temp 0.029 (<a class="xref" data-note="ml_dtree">Decision Trees</a>). Outlook is far ahead, so it survives most bootstrap resamples: in the Bagging note, Outlook was the root of 562 of 1,000 bagged trees. More than half the trees start with the same question and therefore share most of their structure. The churn data shows the same thing at scale, even more strongly.</p>
  <h3>The same thing at scale: the churn data</h3>
  <p>All churn code in this note uses one shared dataset (the same one as in <a class="xref" data-note="ml_dtree">Decision Trees</a> and <a class="xref" data-note="ml_bagging">Bagging</a>): 20,000 fake customers, 12 columns from <code>make_classification</code> (6 carry signal, 2 are mixes of those, 4 are useless) plus two pure-noise columns, split 12,000 train / 3,000 validation / 5,000 test. Run this setup first; every later churn block assumes it.</p>
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
  <p>Now count which column each tree asks about at its root (node 0). <code>t.tree_.feature[0]</code> is the column index used by the root split of tree <code>t</code>. We compare 100 bagged trees (every split may use all 14 columns) with 100 forest trees (every split sees only √14 ≈ 3 random columns).</p>
  <div class="fx" data-lang="py">from collections import Counter
from sklearn.ensemble import BaggingClassifier
bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, n_jobs=-1, random_state=0).fit(Xtr, ytr)
rf  = RandomForestClassifier(n_estimators=100, max_features="sqrt", n_jobs=-1, random_state=0).fit(Xtr, ytr)
names = Xtr.columns
def roots(trees):
    return Counter(names[t.tree_.feature[0]] for t in trees).most_common(4)
print("bagging root splits:", roots(bag.estimators_))
print("forest  root splits:", roots(rf.estimators_))</div>
  <div class="fx" data-lang="text">bagging root splits: [('f5', 100)]
forest  root splits: [('f8', 25), ('f5', 22), ('f9', 14), ('f3', 10)]</div>
  <p>All 100 bagged trees start with <code>f5</code>. The bootstrap changed the rows, but not enough to dethrone the strongest column, so the first (and most influential) question is identical everywhere, and the second level is usually the same too. In the forest, <code>f5</code> is the root of only 22 trees; the others start with <code>f8</code>, <code>f9</code>, <code>f3</code> and so on. These trees cut the data in genuinely different ways.</p>
  <h3>Why alike trees hurt: the correlation floor</h3>
  <p>Think of each tree's prediction for one customer as a random number (random because the bootstrap sample was random). Say every tree has the same variance σ², and any two trees have correlation ρ (ρ = 0: unrelated; ρ = 1: identical). What is the variance of the average of B trees?</p>
  <p>Variance of a sum = sum of all variances + sum of all pairwise covariances. There are B variances (each σ²) and B(B−1) ordered pairs (each covariance ρσ²). Divide by B² because we take the average:</p>
  <div class="fx" data-lang="text">Var( (X1 + ... + XB) / B ) = [ B·σ² + B(B−1)·ρσ² ] / B²
                           = σ²/B + ρσ² − ρσ²/B
                           = ρσ²  +  (1 − ρ)·σ²/B
                             ↑          ↑
                    never goes away   shrinks as B grows</div>
  <p>The second part shrinks as you add trees. The first part, ρσ², does not care how many trees you have. That is the <strong>correlation floor</strong>: with alike trees, a thousand trees are barely better than a hundred. Worked by hand with σ² = 1 and B = 200, using ρ values we will actually measure on the churn data in section 02:</p>
  <table class="tbl">
    <tr><th>Trees are…</th><th>ρ</th><th>ρσ²</th><th>(1−ρ)σ²/B</th><th>Var of average</th><th>B → ∞</th></tr>
    <tr><td>bagged (all 14 columns)</td><td>0.47</td><td>0.470</td><td>0.53/200 = 0.00265</td><td><strong>0.473</strong></td><td>0.470</td></tr>
    <tr><td>forest, 3 columns per split</td><td>0.37</td><td>0.370</td><td>0.63/200 = 0.00315</td><td><strong>0.373</strong></td><td>0.370</td></tr>
    <tr><td>forest, 1 column per split</td><td>0.17</td><td>0.170</td><td>0.83/200 = 0.00415</td><td><strong>0.174</strong></td><td>0.170</td></tr>
    <tr><td>(ideal) independent trees</td><td>0</td><td>0</td><td>1/200 = 0.005</td><td><strong>0.005</strong></td><td>0</td></tr>
  </table>
  <p>Read the last column: with 200 trees we are already sitting on the floor in every row. The only way down is to make ρ smaller. That is the random forest's whole idea.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A panel of 10 judges for a cooking contest. If all 10 read the same food blog before the contest, they share the blog's opinions and their average is not much wiser than one judge. Force each judge to taste a different random set of dishes first, and their opinions become more independent; the average becomes wiser, even though each judge individually knows a bit less.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Just add more trees" does not fix correlation. Above B ≈ 100–200, the (1−ρ)σ²/B part is already tiny. If bagging has stopped improving, more trees will not help; less alike trees will.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Fix: Random Columns at Every Split.</b> We know <em>what</em> to lower (ρ) but not <em>how</em>. Changing the rows (bootstrap) was not enough. The next idea changes which columns a split may use.</div>

  <h2 id="rf-split"><span class="num">02</span>The Fix: Random Columns at Every Split</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We must lower ρ, the correlation between trees, and resampling rows was not enough because the strongest column still wins most roots. What can we change about how each split is chosen so that trees differ, while each tree stays reasonably good?</p>
  </div>
  <p>Plain words: when a tree in a random forest is about to ask a question at some node, it first draws a random handful of columns, say 2 of the diary's 4, or 3 of the churn data's 14. It then finds the best question <em>using only those 3</em>, exactly the way a normal tree would (try every cut-off, keep the biggest impurity drop). At the next node it draws a fresh random 3. The strong column is still used, just not everywhere, and the weaker columns finally get a chance to show what they know.</p>
  <h3>Worked by hand: the diary's root with 4 candidate columns</h3>
  <p>The root holds all 14 days: 9 Yes, 5 No, entropy 0.940 bits. For each column, the split and its information gain (from <a class="xref" data-note="ml_dtree">Decision Trees</a>):</p>
  <table class="tbl">
    <tr><th>Column</th><th>Branches [Yes, No]</th><th>Weighted child entropy</th><th>Information gain</th></tr>
    <tr><td>Outlook</td><td>Sunny [2, 3] · Overcast [4, 0] · Rain [3, 2]</td><td>0.694</td><td><strong>0.247</strong></td></tr>
    <tr><td>Humidity</td><td>High [3, 4] · Normal [6, 1]</td><td>0.788</td><td>0.152</td></tr>
    <tr><td>Wind</td><td>Weak [6, 2] · Strong [3, 3]</td><td>0.892</td><td>0.048</td></tr>
    <tr><td>Temp</td><td>Hot [2, 2] · Mild [4, 2] · Cool [3, 1]</td><td>0.911</td><td>0.029</td></tr>
  </table>
  <p>A normal tree (and almost every bagged tree) picks <strong>Outlook</strong>. Now a forest with <code>max_features = 2</code>: the root draws 2 of the 4 columns at random. There are 4·3/2 = 6 equally likely pairs. For each pair, the winner is whichever of the two has the bigger gain:</p>
  <table class="tbl">
    <tr><th>Columns drawn</th><th>{Outlook, Temp}</th><th>{Outlook, Humidity}</th><th>{Outlook, Wind}</th><th>{Temp, Humidity}</th><th>{Temp, Wind}</th><th>{Humidity, Wind}</th></tr>
    <tr><td>Split chosen</td><td>Outlook</td><td>Outlook</td><td>Outlook</td><td><strong>Humidity</strong></td><td><strong>Wind</strong></td><td><strong>Humidity</strong></td></tr>
  </table>
  <p>So across many trees this root splits on Outlook half the time (3/6), on Humidity a third (2/6), on Wind a sixth (1/6), and never on Temp (it loses every pair). Outlook shows up whenever it is drawn, which is m/p = 2/4 = 50% of the time. The code repeats the experiment with bootstrap samples, as a real forest would:</p>
  <div class="fx" data-lang="py">import numpy as np
from collections import Counter
from play import df
def H(y):
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def IG(d, a):
    return H(d.Play) - sum(len(g) / len(d) * H(g.Play) for _, g in d.groupby(a))
cats = ["Outlook", "Temp", "Humidity", "Wind"]
rng = np.random.default_rng(0)
bag_roots, forest_roots = Counter(), Counter()
for _ in range(1000):
    d = df.iloc[rng.integers(0, 14, 14)]                  # a bootstrap sample of the diary
    g = {a: IG(d, a) for a in cats}
    bag_roots[max(g, key=g.get)] += 1                     # bagging: the best of all 4 columns
    two = [str(c) for c in rng.choice(cats, size=2, replace=False)]   # forest: best of 2 random columns
    forest_roots[max(two, key=lambda a: g[a])] += 1
print("bagging root questions:", dict(bag_roots.most_common()))
print("forest  root questions:", dict(forest_roots.most_common()))</div>
  <div class="fx" data-lang="text">bagging root questions: {'Outlook': 562, 'Humidity': 248, 'Wind': 96, 'Temp': 94}
forest  root questions: {'Outlook': 375, 'Humidity': 280, 'Temp': 200, 'Wind': 145}</div>
  <p>With bootstrap samples alone (bagging), Outlook is the root of 562 of 1,000 trees. With bootstrap plus 2 random columns per split (a forest), only 375: less than the 50% of the full diary, because in some bootstrap samples Outlook is no longer the best even when it is drawn. Temp, which never wins on the full diary, now starts 200 trees. The trees genuinely differ from the first question on. On the churn data, m = 3 and p = 14, so the strong <code>f5</code> is on offer at the root with probability 3/14 = <strong>21.4%</strong>, and the run above found it at the root of 22 out of 100 trees. The formula and the experiment agree.</p>
  <figure class="viz"><svg viewBox="0 0 620 175" width="620">
<rect x="10" y="20" width="170" height="130" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="95" y="14" text-anchor="middle" font-size="12" font-weight="600">Bagging: all 4 columns</text>
<rect x="25" y="35" width="140" height="22" rx="4" class="fg sg"/><text x="95" y="51" text-anchor="middle" font-size="12">Outlook  IG .247 ✓</text>
<rect x="25" y="62" width="140" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="95" y="78" text-anchor="middle" font-size="12">Humidity IG .152</text>
<rect x="25" y="89" width="140" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="95" y="105" text-anchor="middle" font-size="12">Wind     IG .048</text>
<rect x="25" y="116" width="140" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="95" y="132" text-anchor="middle" font-size="12">Temp     IG .029</text>
<text x="95" y="168" text-anchor="middle" font-size="11" class="tm">most trees: Outlook</text>
<rect x="220" y="20" width="390" height="130" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="415" y="14" text-anchor="middle" font-size="12" font-weight="600">Forest, max_features = 2: three different trees</text>
<rect x="235" y="40" width="110" height="22" rx="4" class="fg sg"/><text x="290" y="56" text-anchor="middle" font-size="12">Outlook ✓</text>
<rect x="235" y="67" width="110" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="290" y="83" text-anchor="middle" font-size="12">Temp</text>
<text x="290" y="112" text-anchor="middle" font-size="11" class="tm">{Outlook, Temp}</text>
<rect x="360" y="40" width="110" height="22" rx="4" class="fg sg"/><text x="415" y="56" text-anchor="middle" font-size="12">Humidity ✓</text>
<rect x="360" y="67" width="110" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="415" y="83" text-anchor="middle" font-size="12">Wind</text>
<text x="415" y="112" text-anchor="middle" font-size="11" class="tm">{Humidity, Wind}</text>
<rect x="485" y="40" width="110" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="540" y="56" text-anchor="middle" font-size="12">Temp</text>
<rect x="485" y="67" width="110" height="22" rx="4" class="fg sg"/><text x="540" y="83" text-anchor="middle" font-size="12">Wind ✓</text>
<text x="540" y="112" text-anchor="middle" font-size="11" class="tm">{Temp, Wind}</text>
<text x="415" y="138" text-anchor="middle" font-size="11" class="tm">winner = best of the drawn columns only</text>
<text x="415" y="168" text-anchor="middle" font-size="11" class="tm">full diary: Outlook 50%, Humidity 33%, Wind 17%</text>
</svg><figcaption>The diary's root in a bagged tree (left) and in three forest trees (right). Green = chosen split. The forest still prefers good columns, but no single column decides every tree.</figcaption></figure>
  <h3>Why per split and not per tree?</h3>
  <p>An older idea, <strong>random subspaces</strong> (Ho, 1998), gives each tree one random set of columns for its whole life. If a tree's set happens to lack every strong column, the whole tree is weak. Drawing <em>per split</em> is gentler: a node that misses <code>f5</code> uses something else, but its children draw again and may still use <code>f5</code> deeper down. Every tree still has access to every column somewhere; it just cannot use the same one everywhere.</p>
  <h3>How many columns? max_features</h3>
  <table class="tbl">
    <tr><th>Setting</th><th>m for p = 14</th><th>Who uses it</th></tr>
    <tr><td><code>"sqrt"</code></td><td>⌊√14⌋ = 3</td><td>sklearn default for classification; Breiman's recommendation</td></tr>
    <tr><td><code>"log2"</code></td><td>⌊log₂14⌋ = 3</td><td>Option; smaller than √p once p &gt; 16</td></tr>
    <tr><td>a fraction like <code>0.33</code></td><td>⌊0.33·14⌋ = 4</td><td>Breiman's recommendation for regression (p/3); R's randomForest default</td></tr>
    <tr><td><code>1.0</code> or <code>None</code></td><td>14</td><td>sklearn default for <em>regression</em>; equals plain bagging of trees</td></tr>
    <tr><td>an integer, e.g. <code>5</code></td><td>5</td><td>Anything you tune</td></tr>
  </table>
  <h3>The trade-off: less alike vs weaker trees</h3>
  <p>Smaller m makes trees less alike (good), but each tree is also worse, because many of its splits are forced to use a weak column (bad). Breiman called the quality of single trees their <strong>strength</strong>. The code below measures both for several m: the average accuracy of one tree, and ρ, the average correlation between the predicted churn probabilities of two trees across the 3,000 validation customers (a practical stand-in for the ρ of the formula).</p>
  <div class="fx" data-lang="py">for mf in [1, 2, 3, 5, 8, 14]:
    rf = RandomForestClassifier(n_estimators=200, max_features=mf, oob_score=True,
                                n_jobs=-1, random_state=0).fit(Xtr, ytr)
    P = np.array([t.predict_proba(Xva.values)[:, 1] for t in rf.estimators_[:60]])  # 60 trees x rows
    C = np.corrcoef(P)                                   # tree-vs-tree correlation matrix
    rho = C[np.triu_indices(60, 1)].mean()
    one = np.mean([np.mean((P[i] &gt; 0.5) == yva) for i in range(60)])
    print(f"max_features={mf:2d}  avg tree val {one:.3f}  rho {rho:.2f}  "
          f"forest val {rf.score(Xva, yva):.3f}  OOB {rf.oob_score_:.3f}")</div>
  <div class="fx" data-lang="text">max_features= 1  avg tree val 0.649  rho 0.17  forest val 0.844  OOB 0.824
max_features= 2  avg tree val 0.710  rho 0.30  forest val 0.876  OOB 0.853
max_features= 3  avg tree val 0.739  rho 0.37  forest val 0.881  OOB 0.864
max_features= 5  avg tree val 0.757  rho 0.42  forest val 0.879  OOB 0.868
max_features= 8  avg tree val 0.765  rho 0.45  forest val 0.884  OOB 0.868
max_features=14  avg tree val 0.769  rho 0.47  forest val 0.885  OOB 0.866</div>
  <p>Read down the columns. As m grows from 1 to 14, single trees get stronger (0.649 → 0.769) and more alike (ρ 0.17 → 0.47). The forest's score is the result of this tug of war. With m = 1 the trees are so weak that low ρ cannot save them (0.844). From m = 2 up, everything lands between 0.876 and 0.885, and on this particular data the largest m is even slightly best. That is an honest result: here the 6 useful columns are all decent, so forcing weak splits costs about as much as the extra diversity gains. On data with one overwhelming column, or hundreds of columns, smaller m usually wins clearly. <code>max_features</code> is the knob to tune first; √p is a good starting point, not a law.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Random forest</strong> (Breiman, 2001): an ensemble of B decision trees, where tree b is grown on a bootstrap sample of the training rows, and at <em>every</em> node the split is chosen as the best split among m columns drawn at random without replacement from the p columns (m = <code>max_features</code>). Trees are usually grown deep and not pruned. The forest predicts by averaging the trees' class probabilities (or numeric outputs).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If none of the m drawn columns gives a valid split (for example all are constant in that node), sklearn keeps drawing more columns rather than making a leaf. So <code>max_features</code> is "look at <em>at least</em> m columns", and in practice a tree can occasionally look at more. Also: sklearn's regressor defaults to <code>max_features=1.0</code> (all columns), which is plain bagging, not a "random" forest. Set it yourself if you want the decorrelation.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Full Algorithm.</b> We have the key ingredient. Now put the whole recipe together, step by step, and look closely at how the trees' answers are combined into one.</div>

  <h2 id="rf-algo"><span class="num">03</span>The Full Algorithm</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have the key ingredient: random columns at every split. How do bootstrap rows, random columns and deep trees fit into one training procedure, and how exactly do the trees' answers become one prediction?</p>
  </div>
  <h3>Training, step by step</h3>
  <div class="flow"><span>Pick B (trees) and m (columns per split)</span><span>Draw a bootstrap sample of n rows</span><span>Grow a tree: at each node draw m columns, best split among them</span><span>Grow until leaves are pure / tiny; no pruning</span><span>Repeat B times (in parallel)</span></div>
  <ol>
    <li><strong>Input</strong>: training table with n rows, p columns; choose B (e.g. 300) and m (e.g. √p).</li>
    <li><strong>For b = 1 … B</strong> (each tree is independent, so they can be trained on different CPU cores at the same time):
      <ol>
        <li>Draw n row numbers at random with replacement → bootstrap sample S_b. About 63.2% of distinct rows end up in it; the remaining ~36.8% are this tree's <strong>out-of-bag</strong> rows.</li>
        <li>Grow tree T_b on S_b. At each node: draw m of the p columns at random; for each drawn column try every cut-off (midpoints between sorted values); keep the (column, cut-off) with the largest impurity drop (Gini or entropy for classes, squared error for numbers); split and repeat in both children.</li>
        <li>Stop a node only when it is pure, has fewer than <code>min_samples_split</code> rows, or hits <code>max_depth</code> / <code>min_samples_leaf</code> limits. By default the trees are fully grown: low bias, high variance, which is exactly what averaging is good at fixing.</li>
      </ol>
    </li>
    <li><strong>Output</strong>: the list of B trees.</li>
  </ol>
  <h3>Prediction: soft vote vs hard vote</h3>
  <p>Each tree sends the new row down to a leaf. A classification leaf stores the class shares of the training rows that ended there (e.g. 9 churn, 1 stay → P(churn) = 0.9). Two ways to combine B trees:</p>
  <ul>
    <li><strong>Hard (majority) vote</strong>: each tree says its top class; the most common class wins. Breiman's original paper does this.</li>
    <li><strong>Soft vote</strong>: average the trees' probabilities; the class with the highest average wins. <strong>sklearn does this.</strong></li>
  </ul>
  <p>Worked example on the diary: a small forest of 5 shallow trees (<code>max_depth=2</code>, so leaves are not pure and each tree gives a real probability; each split may look at 2 of the 10 one-hot columns), asked about D10 (Rain, Mild, Normal humidity, Weak wind; truth: played).</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int)
rf = RandomForestClassifier(n_estimators=5, max_depth=2, max_features=2, random_state=9).fit(X, df.Play)
p = np.array([t.predict_proba(X.loc[["D10"]].values)[0, 1] for t in rf.estimators_])   # P(Yes) per tree
print("D10 (Rain, Mild, Normal, Weak), P(Yes) per tree:", p.round(2).tolist())
print("hard vote:", "Yes" if (p &gt; 0.5).sum() &gt;= 3 else "No", f"({(p &gt; 0.5).sum()} of 5 trees say Yes)")
print(f"soft vote: mean P(Yes) = {p.mean():.3f} -&gt;", "Yes" if p.mean() &gt; 0.5 else "No",
      "| sklearn:", rf.predict(X.loc[["D10"]])[0], "| truth:", df.Play["D10"])</div>
  <div class="fx" data-lang="text">D10 (Rain, Mild, Normal, Weak), P(Yes) per tree: [1.0, 0.62, 0.33, 0.43, 0.4]
hard vote: No (2 of 5 trees say Yes)
soft vote: mean P(Yes) = 0.557 -&gt; Yes | sklearn: Yes | truth: Yes</div>
  <table class="tbl">
    <tr><th></th><th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>Result</th></tr>
    <tr><td>P(Yes)</td><td>1.00</td><td>0.62</td><td>0.33</td><td>0.43</td><td>0.40</td><td>mean = 2.79 / 5 = <strong>0.557</strong> → Yes (soft)</td></tr>
    <tr><td>Tree's own vote</td><td>Yes</td><td>Yes</td><td>No</td><td>No</td><td>No</td><td>2 Yes vs 3 No → <strong>No</strong> (hard)</td></tr>
  </table>
  <p>The two rules disagree. Three trees were mildly against (0.33, 0.43, 0.40) while one was certain (1.00) and one fairly sure (0.62); the soft vote uses that confidence, the hard vote throws it away, and here the soft vote is right. Soft voting also gives a smoother probability you can threshold or rank (ROC/AUC needs scores, not votes). For full-depth trees most leaves are pure, so each tree's probability is 0 or 1 and the two rules mostly agree; the difference grows when leaves are bigger (<code>min_samples_leaf</code> &gt; 1).</p>
  <p>For <strong>regression</strong>, each leaf stores the mean target of its training rows, and the forest returns the plain average of the B trees' leaf means (section 07).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Soft vote = asking five doctors "how likely is it?" and averaging the percentages. Hard vote = asking each doctor "yes or no?" and counting hands. If three doctors say "about 40%, so no" and two say "100%" and "62%", counting hands says no, but averaging says 56% and calls for treatment.</p>
  </div>
  <h3>Why it works: strength and correlation</h3>
  <p>Breiman proved a bound on the forest's generalization error in terms of two numbers: <strong>s</strong>, the strength (how far, on average, the trees' vote for the right class is above the vote for the best wrong class; between −1 and 1, higher is better), and <strong>ρ̄</strong>, the average correlation between trees' margins:</p>
  <div class="fx" data-lang="text">error of the forest  ≤  ρ̄ · (1 − s²) / s²

example: s = 0.6, ρ̄ = 0.2   →  0.2 · (1 − 0.36) / 0.36 = 0.2 · 1.78 = 0.36
         s = 0.6, ρ̄ = 0.1   →  0.1 · 1.78                = 0.18   (halve ρ, halve the bound)
         s = 0.4, ρ̄ = 0.1   →  0.1 · (1 − 0.16) / 0.16  = 0.53   (weaker trees hurt a lot)</div>
  <p>The bound is loose (real errors are much lower), but the message is exactly section 02's table: lower correlation helps, weaker trees hurt, and m trades one for the other. Breiman also showed that as B grows, the forest's error converges to a limit (by the law of large numbers): adding trees never makes a random forest overfit; it just stops helping.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a forest of trees h₁…h_B, the <strong>margin</strong> of a labelled row (x, y) is (share of trees voting y) − (largest share voting any other class). <strong>Strength</strong> s = expected margin over the data. The generalization error PE* satisfies PE* ≤ ρ̄(1 − s²)/s², where ρ̄ is the mean correlation of the trees' raw margin functions (Breiman 2001, Theorem 2.3).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"More trees can't overfit" means the <em>number of trees</em> is not an overfitting knob. The forest can still overfit through each tree's depth on very noisy data, and its training accuracy of 1.000 says nothing about test accuracy. Use OOB or validation scores to judge it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Out-of-Bag Score.</b> To tune m and friends we need a score on rows the model did not train on. Bagging gives one for free, and a forest inherits it.</div>

  <h2 id="rf-oob"><span class="num">04</span>Out-of-Bag Score</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>To tune m and the other knobs we need a score on rows the model did not train on. Each tree's bootstrap sample left some diary days out. Can those days score the forest for free, and how reliable is that score?</p>
  </div>
  <p>Each tree saw only its bootstrap sample. For each row, there are trees that never saw it: on average a fraction (1 − 1/n)ⁿ ≈ 1/e ≈ 36.8% of all trees (derived in <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a>). Let only those trees vote on that row, and you get an honest prediction for every training row without holding anything back. Compare those predictions with the true labels → <strong>OOB score</strong>.</p>
  <h3>By hand: 4 trees on the diary</h3>
  <p>Four forest trees on the one-hot diary, grown on the bootstrap samples of the Bagging note (<code>default_rng(171)</code>), each split looking at √10 ≈ 3 random one-hot columns. Each day is judged only by the trees whose sample did not contain it.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int).values
y = (df.Play == "Yes").astype(int).values
rng = np.random.default_rng(171)                           # the bootstrap draws of the Bagging note
votes = [[] for _ in range(14)]
for b in range(4):
    idx = rng.integers(0, 14, 14)
    tree = DecisionTreeClassifier(max_features="sqrt", random_state=b).fit(X[idx], y[idx])
    oob = np.setdiff1d(np.arange(14), idx)                 # days this tree never saw
    print(f"T{b+1}: out-of-bag days {[f'D{i+1}' for i in oob]}")
    for i in oob:
        votes[i].append(tree.predict_proba(X[[i]])[0, list(tree.classes_).index(1)] if 1 in tree.classes_ else 0.0)
right = 0; scored = 0
for i in range(14):
    if votes[i]:
        p = np.mean(votes[i]); pred = int(p &gt; 0.5); scored += 1; right += pred == y[i]
        print(f"D{i+1:&lt;2d} truth {'Yes' if y[i] else 'No '}  OOB P(Yes) from {len(votes[i])} tree(s): {p:.2f} -&gt; {'Yes' if pred else 'No'}")
    else:
        print(f"D{i+1:&lt;2d} in every sample: no OOB vote")
print(f"OOB accuracy: {right}/{scored} = {right / scored:.2f}")</div>
  <div class="fx" data-lang="text">T1: out-of-bag days ['D1', 'D3', 'D9', 'D13', 'D14']
T2: out-of-bag days ['D2', 'D3', 'D6']
T3: out-of-bag days ['D4', 'D5', 'D6', 'D7', 'D8', 'D11', 'D12']
T4: out-of-bag days ['D4', 'D5', 'D7', 'D8', 'D11', 'D14']
D1  truth No   OOB P(Yes) from 1 tree(s): 0.00 -&gt; No
D2  truth No   OOB P(Yes) from 1 tree(s): 1.00 -&gt; Yes
D3  truth Yes  OOB P(Yes) from 2 tree(s): 0.50 -&gt; No
D4  truth Yes  OOB P(Yes) from 2 tree(s): 1.00 -&gt; Yes
D5  truth Yes  OOB P(Yes) from 2 tree(s): 1.00 -&gt; Yes
D6  truth No   OOB P(Yes) from 2 tree(s): 0.50 -&gt; No
D7  truth Yes  OOB P(Yes) from 2 tree(s): 0.00 -&gt; No
D8  truth No   OOB P(Yes) from 2 tree(s): 1.00 -&gt; Yes
D9  truth Yes  OOB P(Yes) from 1 tree(s): 1.00 -&gt; Yes
D10 in every sample: no OOB vote
D11 truth Yes  OOB P(Yes) from 2 tree(s): 0.00 -&gt; No
D12 truth Yes  OOB P(Yes) from 1 tree(s): 0.00 -&gt; No
D13 truth Yes  OOB P(Yes) from 1 tree(s): 1.00 -&gt; Yes
D14 truth No   OOB P(Yes) from 2 tree(s): 1.00 -&gt; Yes
OOB accuracy: 6/13 = 0.46</div>
  <p>Read the bookkeeping: T1 never saw D1, D3, D9, D13, D14, so those five days get T1's vote, and so on. D10 was in all four samples and gets no OOB vote at all. Every other day is judged by only 1 or 2 of the 4 trees, a much smaller "forest" than the real one, and with full-depth trees each vote is 0 or 1, so ties (D3, D6) go to the first class, No. The result, 6 of 13, is no better than a coin: with 4 trees and 14 rows the OOB score is almost pure noise. It becomes trustworthy only with many trees and many rows, as the churn run below shows.</p>
  <h3>On the churn data: OOB as trees are added</h3>
  <p><code>warm_start=True</code> keeps the trees already grown and only adds new ones when you raise <code>n_estimators</code>, so one forest can be scored at several sizes cheaply.</p>
  <div class="fx" data-lang="py">import warnings; warnings.filterwarnings("ignore")          # OOB warns when few trees
rf = RandomForestClassifier(n_estimators=1, warm_start=True, oob_score=True,
                            n_jobs=-1, random_state=0)
for n in [5, 10, 25, 50, 100, 200, 400]:
    rf.set_params(n_estimators=n).fit(Xtr, ytr)               # warm_start: only adds the new trees
    print(f"trees={n:3d}  OOB {rf.oob_score_:.3f}  val {rf.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">trees=  5  OOB 0.728  val 0.825
trees= 10  OOB 0.784  val 0.847
trees= 25  OOB 0.831  val 0.868
trees= 50  OOB 0.849  val 0.872
trees=100  OOB 0.858  val 0.880
trees=200  OOB 0.864  val 0.881
trees=400  OOB 0.864  val 0.879</div>
  <p>With 5 trees, each row is out-of-bag for only about 5 × 0.368 ≈ 1.8 trees, so its OOB vote comes from a "forest" of 1 or 2 trees, and the score (0.728) is far below the true 5-tree forest (0.825 on validation). By 200 trees each row gets about 74 OOB votes and the gap is small (0.864 vs 0.881). Both curves flatten at 200: on this data, 200 trees are enough. The remaining gap of about 0.015 is normal: an OOB vote uses ~37% of the forest, and validation rows come from the same distribution but are a different random 3,000.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>OOB prediction</strong> for training row i: the aggregate (average probability or mean) over only those trees whose bootstrap sample did not contain i. <strong>OOB score</strong>: accuracy (classifier) or R² (regressor) of those predictions against the true targets. sklearn: <code>oob_score=True</code>, then read <code>oob_score_</code> and per-row <code>oob_decision_function_</code> / <code>oob_prediction_</code>. Requires <code>bootstrap=True</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>OOB is only honest if <em>nothing</em> learnt from the OOB rows. If you scaled, imputed, target-encoded or selected features on the whole training set first, the OOB rows leaked into that step. Also, OOB is noisy on small data and pessimistic with few trees. Use it for quick checks and for choosing n_estimators; confirm final choices with cross-validation (<a class="xref" data-note="ml_core">Core Concepts</a>) or a held-out set.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Hyperparameters.</b> We can now score a forest for free. Time to go through every knob it has and see what each one does to accuracy, size and speed.</div>

  <h2 id="rf-hp"><span class="num">05</span>Hyperparameters</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can now score a forest for free. Which of its knobs actually change accuracy, size and speed, and in what order should they be tuned?</p>
  </div>
  <p>A random forest has few knobs that matter, and it is famous for working well with the defaults. (On the diary, the default <code>max_features="sqrt"</code> would give m = √4 = 2 attribute columns, exactly the pairs worked above; on the one-hot diary it gives √10 ≈ 3.) Still, you should know each one, because interviews ask and because size and speed often need tuning in production.</p>
  <table class="tbl">
    <tr><th>Parameter (sklearn)</th><th>Default</th><th>What it does</th><th>Effect of raising it</th></tr>
    <tr><td><code>n_estimators</code></td><td>100</td><td>Number of trees B</td><td>Lower variance until the floor; never overfits; linear cost in time and memory</td></tr>
    <tr><td><code>max_features</code></td><td>"sqrt" (clf), 1.0 (reg)</td><td>Columns drawn per split, m</td><td>Stronger but more alike trees; slower splits. <strong>Most important knob.</strong></td></tr>
    <tr><td><code>max_depth</code></td><td>None</td><td>Max levels per tree</td><td>Deeper = less bias, more variance per tree, more memory</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>1</td><td>Min rows in a leaf</td><td>Smoother, smaller trees, more bias; good for regression and calibrated probabilities</td></tr>
    <tr><td><code>min_samples_split</code></td><td>2</td><td>Min rows to try a split</td><td>Similar to min_samples_leaf, weaker effect</td></tr>
    <tr><td><code>max_leaf_nodes</code>, <code>min_impurity_decrease</code>, <code>ccp_alpha</code></td><td>None, 0, 0</td><td>Other ways to limit tree size (see <a class="xref" data-note="ml_dtree">Decision Trees</a>)</td><td>Smaller trees</td></tr>
    <tr><td><code>bootstrap</code></td><td>True</td><td>Bootstrap rows per tree; if False each tree sees all rows</td><td>False: diversity only from column draws; no OOB</td></tr>
    <tr><td><code>max_samples</code></td><td>None (= n)</td><td>Rows per bootstrap sample (int or fraction)</td><td>Smaller: faster, more diverse but weaker trees</td></tr>
    <tr><td><code>criterion</code></td><td>"gini" / "squared_error"</td><td>Impurity used for splits</td><td>"entropy"/"log_loss" rarely changes results</td></tr>
    <tr><td><code>class_weight</code></td><td>None</td><td>Weights per class ("balanced", "balanced_subsample", dict)</td><td>Pushes splits and leaf votes toward the rare class (section 08)</td></tr>
    <tr><td><code>oob_score</code></td><td>False</td><td>Compute OOB score after fitting</td><td>Free validation estimate; small extra time</td></tr>
    <tr><td><code>n_jobs</code></td><td>None (1 core)</td><td>Cores for fit and predict</td><td><code>-1</code> = all cores; trees are independent, so near-linear speed-up</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>Seed for bootstraps and column draws</td><td>Set it for reproducible results</td></tr>
    <tr><td><code>warm_start</code></td><td>False</td><td>Keep old trees when refitting with more</td><td>Grow a forest gradually (section 04)</td></tr>
  </table>
  <h3>Tree size knobs on the churn data</h3>
  <div class="fx" data-lang="py">def run(**kw):
    rf = RandomForestClassifier(n_estimators=200, oob_score=True, n_jobs=-1, random_state=0, **kw)
    t0 = time.time(); rf.fit(Xtr, ytr); sec = time.time() - t0
    leaves = np.mean([t.get_n_leaves() for t in rf.estimators_])
    print(f"{str(kw):32s} leaves/tree {leaves:6.0f}  train {rf.score(Xtr,ytr):.3f}  "
          f"OOB {rf.oob_score_:.3f}  val {rf.score(Xva,yva):.3f}  {sec:.1f}s")
for kw in [{}, {"max_depth": 4}, {"max_depth": 8}, {"max_depth": 16},
           {"min_samples_leaf": 5}, {"min_samples_leaf": 20},
           {"max_samples": 0.2}, {"max_samples": 0.5}]:
    run(**kw)</div>
  <div class="fx" data-lang="text">{}                               leaves/tree   1438  train 1.000  OOB 0.864  val 0.881  13.3s
{'max_depth': 4}                 leaves/tree     16  train 0.761  OOB 0.742  val 0.759  5.2s
{'max_depth': 8}                 leaves/tree    150  train 0.867  OOB 0.821  val 0.839  8.7s
{'max_depth': 16}                leaves/tree   1031  train 0.989  OOB 0.860  val 0.874  12.0s
{'min_samples_leaf': 5}          leaves/tree    780  train 0.963  OOB 0.857  val 0.873  9.1s
{'min_samples_leaf': 20}         leaves/tree    276  train 0.897  OOB 0.840  val 0.858  9.1s
{'max_samples': 0.2}             leaves/tree    448  train 0.929  OOB 0.846  val 0.862  4.4s
{'max_samples': 0.5}             leaves/tree    923  train 0.987  OOB 0.858  val 0.874  7.4s</div>
  <p>Three lessons. <strong>(1) Deep trees are the right default.</strong> Every limit lowered accuracy here: depth 4 trees (16 leaves) give 0.759, barely better than one tree, because averaging cannot remove the bias of shallow trees. <strong>(2) Limits buy size.</strong> <code>max_depth=16</code> keeps 0.874 with 28% fewer leaves; <code>min_samples_leaf=5</code> halves the leaves for −0.008. In production that may be a good trade (section 10). <strong>(3) max_samples is a speed knob.</strong> Training each tree on 20% of rows is about three times as fast (4.4 s vs 13.3 s) and costs 0.019. Times are wall-clock on a shared 4-core machine; trust the ratios, not the seconds.</p>
  <h3>bootstrap=False</h3>
  <div class="fx" data-lang="py">for bs in [True, False]:
    rf = RandomForestClassifier(n_estimators=200, bootstrap=bs, n_jobs=-1, random_state=0).fit(Xtr, ytr)
    print(f"bootstrap={bs!s:5s}  val {rf.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">bootstrap=True   val 0.881
bootstrap=False  val 0.879</div>
  <p>Without the bootstrap, all trees see the same rows and differ only through their column draws. Here the score barely moves: with m = 3 of 14, the column randomness alone already makes trees diverse. This is exactly the bet that <a class="xref" data-note="ml_extratrees">Extra Trees</a> makes by default. You lose OOB scoring, though.</p>
  <h3>A tuning order that works</h3>
  <ol>
    <li>Set <code>n_estimators</code> high enough that OOB has flattened (plot it, as in section 04); 200–500 is typical.</li>
    <li>Tune <code>max_features</code> (try √p, p/3, 0.5·p, p and a couple of small integers), judged by OOB or CV.</li>
    <li>If the model is too big or slow, or probabilities look too extreme, raise <code>min_samples_leaf</code> (1, 3, 5, 10) or cap <code>max_depth</code>.</li>
    <li>For big data, lower <code>max_samples</code> for speed.</li>
    <li>For imbalance, see section 08. Search strategies are in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</li>
  </ol>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not tune <code>n_estimators</code> by grid search as if it were a bias/variance knob. More trees is always at least as good in expectation; the only reasons to use fewer are time and memory. Pick it by watching the OOB curve flatten, then leave it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Feature Importance.</b> The forest is tuned and accurate, but 200 trees cannot be read like one. The business still asks "which columns drive churn?" The forest gives an answer for free, but that answer has a famous trap.</div>

  <h2 id="rf-imp"><span class="num">06</span>Feature Importance: MDI and Permutation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two hundred trees cannot be read like one, yet the business still asks which columns drive the outcome. What does the forest's built-in importance measure, how is it computed by hand, and when does it mislead?</p>
  </div>
  <h3>MDI (mean decrease in impurity), by hand</h3>
  <p>Every split lowers impurity. Credit that drop to the column used, weighted by how many rows passed through the node. Sum per column over all nodes, average over all trees, and rescale so the scores sum to 1. That is <code>feature_importances_</code>.</p>
  <div class="fx" data-lang="text">importance of column j in one tree = Σ over nodes t that split on j of
        (N_t / N) · [ impurity(t) − (N_left/N_t)·impurity(left) − (N_right/N_t)·impurity(right) ]</div>
  <p>By hand on the diary: the depth-2 Gini tree (sklearn, one-hot columns), whose node impurities and row counts we read from <code>tree_</code>:</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int)
t = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X, df.Play)     # Gini, 2 levels
print(export_text(t, feature_names=list(X.columns), show_weights=True))
print("impurity per node:", t.tree_.impurity.round(3), " rows per node:", t.tree_.n_node_samples)
print("MDI:", {c: round(float(v), 3) for c, v in zip(X.columns, t.feature_importances_) if v &gt; 0})</div>
  <div class="fx" data-lang="text">|--- Outlook_Overcast &lt;= 0.50
|   |--- Humidity_Normal &lt;= 0.50
|   |   |--- weights: [4.00, 1.00] class: No
|   |--- Humidity_Normal &gt;  0.50
|   |   |--- weights: [1.00, 4.00] class: Yes
|--- Outlook_Overcast &gt;  0.50
|   |--- weights: [0.00, 4.00] class: Yes

impurity per node: [0.459 0.5   0.32  0.32  0.   ]  rows per node: [14 10  5  5  4]
MDI: {'Outlook_Overcast': 0.442, 'Humidity_Normal': 0.558}</div>
  <table class="tbl">
    <tr><th>Node</th><th>Column</th><th>N_t / N</th><th>Impurity before</th><th>Weighted after</th><th>Weighted drop</th></tr>
    <tr><td>root (14 days, [5 No, 9 Yes])</td><td>Outlook_Overcast</td><td>14/14</td><td>0.459</td><td>4/14·0 + 10/14·0.5 = 0.357</td><td>1 × (0.459 − 0.357) = <strong>0.102</strong></td></tr>
    <tr><td>not-Overcast node (10 days, [5, 5])</td><td>Humidity_Normal</td><td>10/14</td><td>0.5</td><td>5/10·0.32 + 5/10·0.32 = 0.32</td><td>0.714 × (0.5 − 0.32) = <strong>0.129</strong></td></tr>
  </table>
  <p>Totals: Outlook_Overcast = 0.102, Humidity_Normal = 0.129, sum 0.231 (less than the root's 0.459, because two leaves are still mixed). Normalised: 0.102/0.231 = <strong>0.442</strong> and 0.129/0.231 = <strong>0.558</strong>. Exactly what sklearn printed. A forest does this per tree and averages.</p>
  <h3>The bias: many-valued columns look important</h3>
  <div class="fx" data-lang="py">from sklearn.inspection import permutation_importance
rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(Xtr, ytr)
perm = permutation_importance(rf, Xva, yva, n_repeats=5, random_state=0, n_jobs=-1)
df = pd.DataFrame({"MDI": rf.feature_importances_,
                   "perm_mean": perm.importances_mean,
                   "perm_std": perm.importances_std}, index=Xtr.columns)
print(df.sort_values("MDI", ascending=False).round(3).loc[["f5", "f8", "f9", "f10", "f11", "row_noise", "f0", "coin_noise"]])
print("MDI sums to", round(df["MDI"].sum(), 3))</div>
  <div class="fx" data-lang="text">              MDI  perm_mean  perm_std
f5          0.139      0.193     0.007
f8          0.113      0.106     0.006
f9          0.099      0.072     0.003
f10         0.037      0.001     0.001
f11         0.037      0.000     0.002
row_noise   0.036      0.004     0.002
f0          0.035      0.001     0.001
coin_noise  0.005      0.001     0.001</div>
  <p>The top columns agree in both methods. Now the two noise columns. <code>row_noise</code> is pure random numbers, yet MDI gives it 0.036, as much as the genuinely weak columns <code>f10</code>, <code>f11</code>, <code>f0</code>, and 7× more than <code>coin_noise</code> (also pure noise). Why? Deep forest trees keep splitting until leaves are pure. Deep down, nodes hold a handful of rows, and a column with 20,000 distinct values offers many cut-offs, one of which will separate those few rows by luck. Each lucky split lowers <em>training</em> impurity, and MDI counts it. A 0/1 column offers one cut-off, so it rarely gets lucky. Permutation importance, measured on validation rows, puts both noise columns near zero, where they belong.</p>
  <h3>Permutation importance, by hand</h3>
  <p>Idea: if the model really needs column j, scrambling j on fresh data should hurt the score. Steps: (1) score the fitted model; (2) shuffle column j (break its link to the target, keep its values); (3) score again; (4) importance = drop; repeat with several shuffles and average. Worked on the diary tree of the Decision Trees note (Overcast → Yes; Sunny → Humidity; Rain → Wind), which is right on all 14 days:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
def tree(o, h, w):                                         # the diary tree of the Decision Trees note
    if o == "Overcast": return "Yes"
    if o == "Sunny":    return "No" if h == "High" else "Yes"
    return "No" if w == "Strong" else "Yes"
def acc(d):
    return np.mean([tree(o, h, w) == p for o, h, w, p in zip(d.Outlook, d.Humidity, d.Wind, d.Play)])
print("accuracy before shuffling:", acc(df))
rng = np.random.default_rng(3)
d = df.copy(); d["Humidity"] = rng.permutation(df.Humidity.values)   # one shuffle of Humidity
changed = [day for day in df.index if d.Humidity[day] != df.Humidity[day] and df.Outlook[day] == "Sunny"]
print("Sunny days whose Humidity changed:", changed, " accuracy after:", round(acc(d), 3))
for col in ["Outlook", "Humidity", "Wind", "Temp"]:          # importance = average drop over 1,000 shuffles
    drops = []
    for _ in range(1000):
        d = df.copy(); d[col] = rng.permutation(df[col].values)
        drops.append(acc(df) - acc(d))
    print(f"{col:8s} permutation importance {np.mean(drops):.3f}")</div>
  <div class="fx" data-lang="text">accuracy before shuffling: 1.0
Sunny days whose Humidity changed: ['D1', 'D2', 'D8', 'D9', 'D11']  accuracy after: 0.643
Outlook  permutation importance 0.340
Humidity permutation importance 0.178
Wind     permutation importance 0.174
Temp     permutation importance 0.000</div>
  <p>One shuffle of the Humidity column gave all five sunny days a different humidity, and accuracy fell from 14/14 to 9/14 = 0.643: those five days are exactly where the tree reads Humidity. Averaged over 1,000 shuffles: Outlook 0.34 (every day passes through it), Humidity 0.18 and Wind 0.17 (each used only on 5 days), Temp <strong>exactly 0</strong> (the tree never reads Temp, so shuffling it changes no prediction). Compare MDI for the same tree in the Decision Trees note: Humidity 0.37, Wind 0.37, Outlook 0.26. The two methods answer different questions: MDI "how much impurity did splits on this column remove during training?", permutation "how much worse does the model do when this column is scrambled?". (We permuted the training days here only to show the mechanics; in practice use validation rows, as the churn run above does.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MDI</strong> (Gini importance): for each column, the total weighted impurity decrease of all splits using it, averaged over trees, normalised to sum to 1. Computed on training data during fitting. <strong>Permutation importance</strong> (Breiman 2001 used OOB rows; sklearn's <code>permutation_importance</code> uses any data you pass): score(data) − score(data with column j shuffled), averaged over <code>n_repeats</code> shuffles.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two different traps. <strong>MDI</strong>: favours many-valued columns (IDs, timestamps, continuous noise) and is computed on training data, so it rewards memorisation. <strong>Permutation</strong>: when two columns are strongly correlated, shuffling one barely hurts because the twin covers for it, so <em>both</em> can look unimportant. Shuffling also creates unrealistic rows (e.g. age 5 with 20 years of tenure). Drop-column importance, SHAP and grouped permutation are in <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Regression &amp; Extrapolation.</b> Everything so far was classification. Forests predict numbers too, and that exposes their biggest structural limit.</div>

  <h2 id="rf-reg"><span class="num">07</span>Regression &amp; Extrapolation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Everything so far predicted a class. The diary also has a number, the turnout. How does a forest predict a number, and what can it never predict?</p>
  </div>
  <p>A regression forest uses regression trees (<a class="xref" data-note="ml_dtree">Decision Trees</a>): splits minimise squared error (equivalently, maximise variance reduction), and each leaf predicts the <strong>mean</strong> target of its training rows. The forest averages the trees. By hand, three trees for a day at 85% humidity (the three bootstrap stumps of the Bagging note, each predicting the turnout):</p>
  <table class="tbl">
    <tr><th></th><th>Tree 1</th><th>Tree 2</th><th>Tree 3</th><th>Forest</th></tr>
    <tr><td>Leaf's training turnouts</td><td>44, 22, 42, 42, 46, 38, 38 (sample 1, HumPct ≤ 85.0)</td><td>24, 32, 32, 26, 26, 38, 20 (sample 2, &gt; 82.5)</td><td>24, 24, 20, 36, 36, 20, 20, 20, 20, 20 (sample 3, &gt; 82.5)</td><td></td></tr>
    <tr><td>Leaf mean = tree's prediction</td><td>38.86</td><td>28.29</td><td>24.00</td><td>(38.86 + 28.29 + 24.00) / 3 = <strong>30.38</strong></td></tr>
  </table>
  <p>sklearn's <code>RandomForestRegressor</code> defaults to <code>max_features=1.0</code> (all columns; Breiman suggested p/3) and <code>min_samples_leaf=1</code> (Breiman suggested 5 for regression). Both are worth tuning. The spread of the trees' predictions (here 24 to 38.9) is a rough sign of uncertainty; quantile regression forests (Meinshausen, 2006) keep all training targets in each leaf to give proper prediction intervals.</p>
  <h3>The flat ceiling: forests cannot extrapolate</h3>
  <p>Every prediction is an average of leaf means, and every leaf mean is an average of training targets. So a forest's prediction can never be above the largest training target or below the smallest. First on the diary, where turnout falls as humidity rises:</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from play import df
X = df[["HumPct"]]; y = df.Turnout                          # humidity 65-96% in the diary
rf = RandomForestRegressor(n_estimators=200, random_state=0).fit(X, y)
lin = LinearRegression().fit(X, y)
new = pd.DataFrame({"HumPct": [50, 65, 96, 110]})          # 50 and 110 are outside the diary
print("humidity:      ", new.HumPct.tolist())
print("forest turnout:", rf.predict(new).round(1).tolist())
print("line turnout:  ", lin.predict(new).round(1).tolist())
print("training turnouts range from", y.min(), "to", y.max())</div>
  <div class="fx" data-lang="text">humidity:       [50, 65, 96, 110]
forest turnout: [38.6, 38.6, 29.2, 29.2]
line turnout:   [48.1, 41.4, 27.6, 21.3]
training turnouts range from 20 to 48</div>
  <p>The diary's humidity runs from 65 to 96%. The forest predicts 38.6 for both 50% and 65%, and 29.2 for both 96% and 110%: beyond the data it simply repeats its edge leaves. The straight line keeps going (48.1 at 50%, 21.3 at 110%). Which is right we cannot know from 14 days, but only one of the two models is even able to change its answer outside the data. The effect is clearest on a target that truly is a straight line: flats priced at 0.8 × size.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
rng = np.random.default_rng(0)
size = rng.uniform(30, 150, 300)                       # flat size in square metres
price = 0.8 * size + rng.normal(0, 6, 300)             # price in lakh rupees, a straight line + noise
X = size.reshape(-1, 1)
rf = RandomForestRegressor(n_estimators=300, random_state=0).fit(X, price)
lr = LinearRegression().fit(X, price)
new = np.array([[60], [140], [200], [300]])            # 200 and 300 are outside the training range
print("size  true  forest  linear")
for s, f, l in zip(new.ravel(), rf.predict(new), lr.predict(new)):
    print(f"{s:4d}  {0.8*s:5.0f}  {f:6.1f}  {l:6.1f}")
print("largest price seen in training:", round(price.max(), 1))</div>
  <div class="fx" data-lang="text">size  true  forest  linear
  60     48    44.1    48.2
 140    112   108.2   111.8
 200    160   118.2   159.5
 300    240   118.2   238.9
largest price seen in training: 123.9</div>
  <p>Inside the training range (60, 140 m²) the forest is fine. Outside it, the forest returns 118.2 for both 200 and 300 m²: every tree sends those flats to its right-most leaf, whose mean is a price near the top of the training data. The linear model continues the line. A tree's prediction is a <strong>step function</strong> that goes flat past the last split.</p>
  <figure class="viz"><svg viewBox="0 0 520 190" width="520">
<line x1="40" y1="160" x2="500" y2="160" stroke="currentColor" stroke-opacity="0.5"/><line x1="40" y1="160" x2="40" y2="15" stroke="currentColor" stroke-opacity="0.5"/>
<text x="270" y="183" text-anchor="middle" font-size="11" class="tm">flat size (m²) →  training range 30–150 | outside</text>
<rect x="40" y="15" width="200" height="145" class="fg" fill-opacity="0.35"/>
<line x1="240" y1="15" x2="240" y2="160" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.6"/>
<line x1="40" y1="150" x2="500" y2="20" class="sb" stroke-width="2" stroke-dasharray="6 4"/>
<polyline points="40,148 70,148 70,140 100,140 100,128 130,128 130,116 160,116 160,104 190,104 190,92 220,92 220,84 240,84 500,84" fill="none" class="st" stroke-width="2.5"/>
<text x="420" y="40" font-size="11" class="tb">truth / linear model</text>
<text x="380" y="78" font-size="11" fill="currentColor">forest: flat at ≈118</text>
<text x="140" y="30" text-anchor="middle" font-size="11" class="tg">seen in training</text>
</svg><figcaption>Sketch (not to scale): a forest is a staircase that follows the data where it has data and goes flat beyond it. A linear model keeps the slope.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Anything that trends over time (sales, prices, users) eventually leaves the training range, and a forest will predict a flat line. Fixes: predict the <em>change</em> or a ratio instead of the level, remove the trend with a linear model and let the forest model the residuals, or use a linear-tree hybrid. <a class="xref" data-note="ml_regression">Regression</a> and the time-series notes show these. The same ceiling applies to every tree model, boosted ones included.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Imbalanced Classes.</b> Real targets are often lopsided: 1 fraud in 30 transactions, 1 churner in 50 customers. How does a forest cope with a rare class?</div>

  <h2 id="rf-imb"><span class="num">08</span>Imbalanced Classes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The diary has 9 played days and 5 not: mildly lopsided. Real targets are often far worse: 1 fraud in 30 transactions. How does a forest cope with a rare class, and which fix actually helps?</p>
  </div>
  <p>With a rare class, impurity is already low at the root (a node with 97% "honest" has Gini 0.06), so splits that isolate the few positives look small, and many leaves end up majority-class. The forest ranks rows reasonably but, at the default 0.5 threshold, misses many positives. Four common fixes:</p>
  <ul>
    <li><strong><code>class_weight="balanced"</code></strong>: each row of class c gets weight n / (k · n_c), so both classes carry equal total weight in impurity and leaf votes.</li>
    <li><strong><code>class_weight="balanced_subsample"</code></strong>: the same, but weights recomputed inside each bootstrap sample.</li>
    <li><strong>Balanced random forest</strong> (Chen, Liaw &amp; Breiman 2004): each tree is grown on a bootstrap with equal numbers of each class (the majority is undersampled).</li>
    <li><strong>Move the threshold</strong>: keep the default model and flag a row when P(positive) ≥ t with t &lt; 0.5, chosen on validation data.</li>
  </ul>
  <p>Worked weights on the diary first: 14 days, 9 Yes, 5 No, k = 2 classes. A No day gets 14 / (2 · 5) = 1.4, a Yes day 14 / (2 · 9) = 0.78, so the two classes carry equal total weight (5 × 1.4 = 9 × 0.78 = 7). Worked weights for the fraud run: 14,000 training rows, 480 positives, 13,520 negatives, k = 2 classes. Positive weight = 14,000 / (2 · 480) = 14.6; negative weight = 14,000 / (2 · 13,520) = 0.52. One positive now counts as much as 28 negatives.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import precision_score, recall_score, average_precision_score
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, weights=[0.97],
                           class_sep=0.8, flip_y=0.01, random_state=1)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
print("fraud share in train:", round(ytr.mean(), 3), " positives:", ytr.sum())

def report(name, proba, thr=0.5):
    pred = (proba &gt;= thr).astype(int)
    print(f"{name:31s} recall {recall_score(yte, pred):.2f}  precision {precision_score(yte, pred, zero_division=0):.2f}"
          f"  AP {average_precision_score(yte, proba):.3f}")

for cw in [None, "balanced", "balanced_subsample"]:
    rf = RandomForestClassifier(n_estimators=300, class_weight=cw, n_jobs=-1, random_state=0).fit(Xtr, ytr)
    report(f"class_weight={cw}", rf.predict_proba(Xte)[:, 1])
    if cw == "balanced":   # with weights, full-depth leaves stay pure; limit leaf size so weights matter
        rf2 = RandomForestClassifier(n_estimators=300, class_weight=cw, min_samples_leaf=10,
                                     n_jobs=-1, random_state=0).fit(Xtr, ytr)
        report("balanced + min_samples_leaf=10", rf2.predict_proba(Xte)[:, 1])
    if cw is None:
        p0 = rf.predict_proba(Xte)[:, 1]

# Balanced Random Forest (Chen, Liaw &amp; Breiman 2004): every tree sees an equal number of each class
rng = np.random.default_rng(0)
pos, neg = np.where(ytr == 1)[0], np.where(ytr == 0)[0]
trees = []
for b in range(300):
    idx = np.concatenate([rng.choice(pos, len(pos)), rng.choice(neg, len(pos))])  # both with replacement
    t = DecisionTreeClassifier(max_features="sqrt", random_state=b).fit(Xtr[idx], ytr[idx])
    trees.append(t)
pb = np.mean([t.predict_proba(Xte)[:, 1] for t in trees], axis=0)
report("balanced RF (undersample)", pb)
report("default, threshold 0.2", p0, thr=0.2)</div>
  <div class="fx" data-lang="text">fraud share in train: 0.034  positives: 480
class_weight=None               recall 0.56  precision 0.97  AP 0.784
class_weight=balanced           recall 0.57  precision 0.89  AP 0.778
balanced + min_samples_leaf=10  recall 0.80  precision 0.56  AP 0.740
class_weight=balanced_subsample recall 0.39  precision 0.95  AP 0.782
balanced RF (undersample)       recall 0.82  precision 0.38  AP 0.724
default, threshold 0.2          recall 0.76  precision 0.69  AP 0.784</div>
  <p>Read it carefully, because it surprises people. <strong>AP</strong> (average precision, the area under the precision-recall curve) measures how well the model <em>ranks</em> frauds above honest rows, independent of any threshold. It is best for the plain default model (0.784); no reweighting improved the ranking, and undersampling hurt it (0.724), because each tree saw only 960 of 14,000 rows. <code>class_weight="balanced"</code> with full-depth trees barely changed anything: deep leaves are pure anyway, so a weight changes no leaf's majority. Only with bigger leaves (<code>min_samples_leaf=10</code>) do weights shift votes, raising recall to 0.80 at precision 0.56. The simplest option, the default model with the threshold moved to 0.2, gets recall 0.76 at a much better precision of 0.69. The "balanced_subsample" result (recall 0.39) shows that these options are not guaranteed to help: measure them.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A security guard rates every bag from 0 to 1 for "suspicious". Reweighting is like retraining the guard to shout more; moving the threshold is like keeping the same guard and telling him "check every bag above 0.2". If his ranking was already good, the second is cheaper and keeps his judgement intact.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never judge an imbalanced model by accuracy: "always say honest" scores 96.6% here and catches nothing. Use precision/recall, AP or AUC-PR (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>). And class weights or undersampling distort predicted probabilities: if the business needs real probabilities, recalibrate (<a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Proximity &amp; Outliers.</b> A forest knows more than predictions: it knows which rows it treats alike. That gives a similarity measure for free.</div>

  <h2 id="rf-prox"><span class="num">09</span>Proximity &amp; Outliers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A forest makes predictions, but it also sorts every row into a leaf of every tree. Does that tell us which rows the forest treats as alike, and can that similarity find outliers or label mistakes?</p>
  </div>
  <p>If two customers land in the same leaf of a tree, that tree treats them as identical. Count, over all trees, how often two rows share a leaf: that share is their <strong>proximity</strong>, a similarity between 0 and 1 that the forest learnt with the target in mind (columns that matter for churn count, noise columns mostly do not). Breiman used proximities to fill missing values, draw maps of the data (multidimensional scaling) and find outliers.</p>
  <p>By hand: if two days land in the same leaf in 3 of 4 trees, their proximity is 0.75; in none, 0. On the diary, with a 300-tree forest:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from play import df
X = pd.get_dummies(df[["Outlook", "Temp", "Humidity", "Wind"]]).astype(int)
rf = RandomForestClassifier(n_estimators=300, random_state=0).fit(X, df.Play)
leaf = rf.apply(X)                                          # 14 days x 300 trees: leaf id per tree
def prox(a, b):
    return np.mean(leaf[df.index.get_loc(a)] == leaf[df.index.get_loc(b)])
for a, b in [("D1", "D2"), ("D1", "D8"), ("D1", "D13"), ("D9", "D11")]:
    print(f"{a} {tuple(df.loc[a, ['Outlook', 'Temp', 'Humidity', 'Wind']])} vs {b} "
          f"{tuple(df.loc[b, ['Outlook', 'Temp', 'Humidity', 'Wind']])}: proximity {prox(a, b):.2f}")</div>
  <div class="fx" data-lang="text">D1 ('Sunny', 'Hot', 'High', 'Weak') vs D2 ('Sunny', 'Hot', 'High', 'Strong'): proximity 0.62
D1 ('Sunny', 'Hot', 'High', 'Weak') vs D8 ('Sunny', 'Mild', 'High', 'Weak'): proximity 0.58
D1 ('Sunny', 'Hot', 'High', 'Weak') vs D13 ('Overcast', 'Hot', 'Normal', 'Weak'): proximity 0.12
D9 ('Sunny', 'Cool', 'Normal', 'Weak') vs D11 ('Sunny', 'Mild', 'Normal', 'Strong'): proximity 0.41</div>
  <p>D1 and D2 differ only in the wind and share a leaf in 62% of trees; D1 and D8 differ only in temperature (58%). D1 and D13 differ in outlook and humidity, the two columns that matter most, and share a leaf in only 12% of trees. D9 and D11 (both sunny, normal humidity, both played) are close too (41%) although they differ in two columns, temperature and wind. The forest's similarity weighs columns by how much they matter for the target, unlike a plain distance that counts every column equally.</p>
  <h3>At scale: finding a planted label typo</h3>
  <div class="fx" data-lang="py">rf = RandomForestClassifier(n_estimators=300, min_samples_leaf=5, n_jobs=-1, random_state=0).fit(Xtr, ytr)
sub = Xva.iloc[:500]; ysub = yva[:500].copy()
L = rf.apply(sub)                                     # (500 rows, 300 trees): leaf id per tree
prox = (L[:, None, :] == L[None, :, :]).mean(axis=2) # share of trees where two rows share a leaf
np.fill_diagonal(prox, 0)                             # ignore "row is similar to itself"
nearest = np.argsort(-prox[0])[:3]
print("rows most similar to row 0:", nearest.tolist(), "proximities", prox[0, nearest].round(2).tolist())
conf = rf.predict_proba(sub)[:, 1]
i = int(np.argmax(np.where(ysub == 1, conf, 0)))      # the row the forest is surest is churn...
ysub[i] = 0                                           # ...gets a wrong label "stay" (a typo in the data)
same  = np.array([prox[k, ysub == ysub[k]].mean() for k in range(500)])  # closeness to own class
other = np.array([prox[k, ysub != ysub[k]].mean() for k in range(500)])  # closeness to the other class
score = other / (same + other + 1e-12)                # near 1 = "lives among the other class"
print("planted typo at row", i, "-&gt; outlier rank", int(np.where(np.argsort(-score) == i)[0][0]) + 1,
      "of 500, score", round(score[i], 2), " median score", round(np.median(score), 2))</div>
  <div class="fx" data-lang="text">rows most similar to row 0: [451, 94, 426] proximities [0.16, 0.14, 0.12]
planted typo at row 443 -&gt; outlier rank 4 of 500, score 0.94  median score 0.2</div>
  <p><code>rf.apply</code> returns the leaf index of every row in every tree; comparing those indexes gives the proximity matrix. Row 0's nearest neighbours share a leaf in 12–16% of trees (with 14 columns and deep trees, proximities are small numbers). Then we plant a label typo: a customer the forest is sure is a churner gets the label "stay". Its proximity is almost all with churners, so its score (share of its proximity that goes to the <em>other</em> class) is 0.94 against a median of 0.2, and it ranks 4th of 500. That is how forests are used to find mislabeled rows. <code>min_samples_leaf=5</code> was used so leaves hold several rows; with pure 1-row leaves most proximities would be 0.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The full proximity matrix is n × n: for 1 million rows that is 10¹² numbers. Compute it on a sample or only for the rows you care about. Proximities computed on training rows with in-bag trees are optimistic (the tree memorised those rows); a stricter version counts only trees in which both rows were out-of-bag.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Complexity, Memory, Speed.</b> We have the full feature set. Before using it in production we must know what it costs: training time, memory, and prediction latency.</div>

  <h2 id="rf-cost"><span class="num">10</span>Complexity, Memory, Speed</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Hundreds of deep trees, each a few hundred to a few thousand nodes: what does a forest cost to train, store and run, and which knobs bring that down?</p>
  </div>
  <table class="tbl">
    <tr><th>Cost</th><th>One CART tree</th><th>Random forest</th><th>Plain reason</th></tr>
    <tr><td>Training time</td><td>≈ O(p · n log n · depth-ish)</td><td>≈ O(B · m · n log n · depth-ish)</td><td>Each split sorts/scans only m columns instead of p; B trees</td></tr>
    <tr><td>Parallel training</td><td>No</td><td>Yes, embarrassingly</td><td>Trees are independent (<code>n_jobs=-1</code>)</td></tr>
    <tr><td>Prediction per row</td><td>O(depth)</td><td>O(B · depth)</td><td>Walk one root-to-leaf path per tree</td></tr>
    <tr><td>Memory</td><td>O(nodes) ≤ O(n)</td><td>O(B · nodes)</td><td>Fully grown trees have up to ~0.63·n leaves each</td></tr>
  </table>
  <p>In words: with m = √p, each split checks far fewer columns than a bagged tree (3 instead of 14 here), so a forest trains several times faster than bagging with the same number of trees. Prediction has to walk all B trees, so forests are slower to predict than one tree or a small booster.</p>
  <div class="fx" data-lang="py">import pickle
for kw in [{}, {"min_samples_leaf": 5}, {"max_depth": 10}]:
    rf = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0, **kw).fit(Xtr, ytr)
    nodes = sum(t.tree_.node_count for t in rf.estimators_)
    mb = len(pickle.dumps(rf)) / 1e6
    depth = np.mean([t.get_depth() for t in rf.estimators_])
    rf.set_params(n_jobs=1)
    t0 = time.time(); rf.predict(Xte); batch = (time.time() - t0) / len(Xte) * 1e6
    print(f"{str(kw):22s} nodes {nodes:7d}  avg depth {depth:4.1f}  pickle {mb:5.1f} MB  "
          f"val {rf.score(Xva, yva):.3f}  predict {batch:4.0f} us/row (1 core, batch)")</div>
  <div class="fx" data-lang="text">{}                     nodes  862330  avg depth 28.5  pickle  69.1 MB  val 0.879  predict  135 us/row (1 core, batch)
{'min_samples_leaf': 5} nodes  467444  avg depth 24.3  pickle  37.5 MB  val 0.872  predict   92 us/row (1 core, batch)
{'max_depth': 10}      nodes  192976  avg depth 10.0  pickle  15.5 MB  val 0.855  predict   70 us/row (1 core, batch)</div>
  <p>A default 300-tree forest on just 12,000 rows is 862,330 nodes and a 69 MB file; trees are 28 levels deep on average. <code>min_samples_leaf=5</code> halves the size for −0.007 accuracy; <code>max_depth=10</code> cuts it 4.5× and speeds prediction, for −0.024. Size grows roughly linearly with the number of training rows, so a forest on 10 million rows can be gigabytes. Timings are from a busy shared machine: compare them with each other, not with your laptop.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forests that are fine in a notebook can fail in production because of size (slow to load, too big for a container) and latency (a single-row prediction walks every tree). Cap depth or leaf size, reduce trees to where OOB flattens, or distil into a boosted model. See <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From Scratch.</b> We have used sklearn's forest as a black box. Writing it ourselves, on top of sklearn's single tree, proves there is nothing more to it than bootstrap + random columns + average.</div>

  <h2 id="rf-scratch"><span class="num">11</span>From Scratch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have used sklearn's forest as a black box. Is a random forest really nothing more than bootstrap rows, random columns per split and an average, and can we write it in a few lines?</p>
  </div>
  <p>Plan: we do the forest part ourselves (bootstrap rows, keep track of out-of-bag rows, average the trees' probabilities, compute OOB) and let <code>DecisionTreeClassifier(max_features="sqrt")</code> handle the per-split column draws, because that option makes a single sklearn tree draw √p columns at every split, exactly what a forest needs. (Writing the split search itself is done in <a class="xref" data-note="ml_dtree">Decision Trees</a>; a random-threshold version is in <a class="xref" data-note="ml_extratrees">Extra Trees</a>.)</p>
  <div class="fx" data-lang="py">class MyForest:
    def __init__(self, n_trees=200, max_features="sqrt", seed=0):
        self.n_trees, self.max_features, self.seed = n_trees, max_features, seed

    def fit(self, X, y):
        X, y = np.asarray(X), np.asarray(y)
        n = len(X)
        rng = np.random.default_rng(self.seed)
        self.classes_ = np.unique(y)
        self.trees = []
        oob_votes = np.zeros((n, len(self.classes_)))        # summed probabilities from trees that did NOT see the row
        for b in range(self.n_trees):
            idx = rng.integers(0, n, n)                       # 1. bootstrap: n rows with replacement
            tree = DecisionTreeClassifier(max_features=self.max_features,   # 2. random columns at EVERY split
                                          random_state=int(rng.integers(1e9)))
            tree.fit(X[idx], y[idx])                          # 3. grow fully, no pruning
            self.trees.append(tree)
            oob = np.setdiff1d(np.arange(n), idx)             # rows this tree never saw
            oob_votes[oob] += tree.predict_proba(X[oob])
        seen = oob_votes.sum(1) &gt; 0                           # rows that were OOB at least once
        self.oob_score_ = np.mean(self.classes_[oob_votes[seen].argmax(1)] == y[seen])
        return self

    def predict_proba(self, X):
        return np.mean([t.predict_proba(np.asarray(X)) for t in self.trees], axis=0)   # 4. average

    def predict(self, X):
        return self.classes_[self.predict_proba(X).argmax(1)]

t0 = time.time(); mine = MyForest(200).fit(Xtr, ytr); s1 = time.time() - t0
t0 = time.time()
sk = RandomForestClassifier(n_estimators=200, oob_score=True, random_state=0, n_jobs=1).fit(Xtr, ytr)
s2 = time.time() - t0
print(f"from scratch: val {np.mean(mine.predict(Xva) == yva):.3f}  OOB {mine.oob_score_:.3f}  {s1:.1f}s")
print(f"sklearn     : val {sk.score(Xva, yva):.3f}  OOB {sk.oob_score_:.3f}  {s2:.1f}s")
agree = np.mean(mine.predict(Xva) == sk.predict(Xva))
print(f"the two forests give the same answer on {agree:.1%} of validation rows")</div>
  <div class="fx" data-lang="text">from scratch: val 0.876  OOB 0.861  25.5s
sklearn     : val 0.881  OOB 0.864  17.7s
the two forests give the same answer on 97.3% of validation rows</div>
  <p>Our 30-line forest scores 0.876 on validation (sklearn 0.881) with OOB 0.861 (sklearn 0.864), and the two agree on 97.3% of customers. They cannot match exactly, because the random draws differ; the remaining gap is the size of the run-to-run noise of a forest (try a few seeds of either). Walking through the code: <code>rng.integers(0, n, n)</code> is the bootstrap; <code>np.setdiff1d</code> finds the rows a tree never saw and adds that tree's probabilities to those rows only; <code>predict_proba</code> is the soft vote of section 03. sklearn is faster mainly because its loops are in Cython and it reuses sorted data.</p>
  <div class="bridge"><b>What this still can't tell us → next: Tree vs Bagging vs Forest.</b> Time to step back and put the forest next to its parent (one tree) and its sibling (bagging), measured the same way.</div>

  <h2 id="rf-cmp"><span class="num">12</span>Tree vs Bagging vs Forest</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On the diary we saw the forest's trees differ more than bagged trees. Measured the same way on 20,000 customers, how much does each step (one tree, bagging, forest) actually buy in accuracy and stability?</p>
  </div>
  <p>Fair test: each model is trained on 3 different random 80% slices of the training rows. We report mean test accuracy ± its spread, test AUC, and how many test customers get a <em>different answer</em> when the same kind of model is trained on a different slice (a direct look at variance).</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
from sklearn.metrics import roc_auc_score
models = {
    "single tree (full)":    lambda s: DecisionTreeClassifier(random_state=s),
    "single tree (depth 8)": lambda s: DecisionTreeClassifier(max_depth=8, random_state=s),
    "bagging, 300 trees":    lambda s: BaggingClassifier(DecisionTreeClassifier(), n_estimators=300, n_jobs=-1, random_state=s),
    "random forest, 300":    lambda s: RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=s)}
for name, make in models.items():
    accs, preds = [], []
    for s in range(3):                                         # 3 different 80% slices of the training rows
        rows = np.random.default_rng(s).choice(len(Xtr), int(0.8 * len(Xtr)), replace=False)
        m = make(s).fit(Xtr.iloc[rows], ytr[rows])
        accs.append(m.score(Xte, yte)); preds.append(m.predict(Xte))
    flip = np.mean(preds[0] != preds[1])                       # same model type, different data slice
    auc = roc_auc_score(yte, m.predict_proba(Xte)[:, 1])
    print(f"{name:22s} test acc {np.mean(accs):.3f} ± {np.std(accs):.3f}  AUC {auc:.3f}  "
          f"answers changed by new slice {flip:5.1%}")</div>
  <div class="fx" data-lang="text">single tree (full)     test acc 0.773 ± 0.002  AUC 0.771  answers changed by new slice 25.3%
single tree (depth 8)  test acc 0.782 ± 0.005  AUC 0.843  answers changed by new slice 15.9%
bagging, 300 trees     test acc 0.868 ± 0.004  AUC 0.930  answers changed by new slice  4.7%
random forest, 300     test acc 0.871 ± 0.001  AUC 0.932  answers changed by new slice  3.6%</div>
  <p>One full tree: 0.773, and a quarter of all customers (25.3%) get a different answer if you retrain it on a different 80% of the data. That is high variance in one number. Pruning to depth 8 helps a little (0.782, 15.9% flips). Bagging jumps to 0.868 and only 4.7% flips. The forest edges out bagging in accuracy and AUC and is the most stable (3.6%), while each of its splits searches 3 columns instead of 14. Most of the gain over a single tree comes from averaging; the random columns add a small further step on this data.</p>
  <table class="tbl">
    <tr><th></th><th>Decision tree</th><th>Bagging (trees)</th><th>Random forest</th><th>Extra Trees</th><th>Gradient boosting</th></tr>
    <tr><td>Randomness per tree</td><td>None</td><td>Bootstrap rows</td><td>Bootstrap rows + m columns per split</td><td>m columns + random cut-offs; usually no bootstrap</td><td>Optional row/column subsampling</td></tr>
    <tr><td>Trees built</td><td>1</td><td>Independently, in parallel</td><td>Independently, in parallel</td><td>Independently, in parallel</td><td>In sequence, each fixes the last</td></tr>
    <tr><td>Typical tree</td><td>Pruned</td><td>Deep</td><td>Deep</td><td>Deep</td><td>Shallow (depth 3–8)</td></tr>
    <tr><td>Mainly reduces</td><td>—</td><td>Variance</td><td>Variance (lower ρ)</td><td>Variance (even lower ρ)</td><td>Bias (and variance)</td></tr>
    <tr><td>Training speed</td><td>Fast</td><td>Slow (all p columns per split)</td><td>Faster (m columns)</td><td>Fastest (no cut-off search)</td><td>Sequential; fast in LightGBM/XGBoost</td></tr>
    <tr><td>Tuning needed</td><td>Depth / pruning</td><td>Little</td><td>Little (max_features)</td><td>Little</td><td>More (learning rate, trees, depth)</td></tr>
    <tr><td>Free validation</td><td>No</td><td>OOB</td><td>OOB</td><td>Only if bootstrap=True</td><td>No (use early stopping)</td></tr>
    <tr><td>Overfits by adding trees?</td><td>—</td><td>No</td><td>No</td><td>No</td><td>Yes</td></tr>
    <tr><td>Churn test accuracy here</td><td>0.773</td><td>0.868</td><td>0.871</td><td>≈ same (see <a class="xref" data-note="ml_extratrees">Extra Trees</a>)</td><td>≈ 0.87 (see <a class="xref" data-note="ml_gbm">Gradient Boosting</a>)</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have measured the forest against its parent and its sibling. One picture and one table should now show how every piece of this note was built from the previous one.</div>

  <h2 id="rf-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The correlation floor, random columns, soft votes, OOB, MDI and permutation, proximities, the flat ceiling: separate features of a library, or one design in which each piece follows from the previous one?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 760 330" width="760">
<defs><marker id="rf-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="220" height="44" rx="7" class="fb sb"/><text x="120" y="29" text-anchor="middle" font-size="11.5" font-weight="700">bagging (bootstrap + average)</text><text x="120" y="45" text-anchor="middle" class="tm" font-size="10">Outlook root in 562 / 1,000</text>
<line x1="230" y1="32" x2="268" y2="32" stroke="currentColor" marker-end="url(#rf-ca)"/>
<rect x="270" y="10" width="220" height="44" rx="7" class="fr sr"/><text x="380" y="29" text-anchor="middle" font-size="11.5" font-weight="700">floor ρσ²: trees alike</text><text x="380" y="45" text-anchor="middle" class="tm" font-size="10">churn: f5 root of 100 / 100</text>
<line x1="490" y1="32" x2="528" y2="32" stroke="currentColor" marker-end="url(#rf-ca)"/>
<rect x="530" y="10" width="220" height="44" rx="7" class="fg sg"/><text x="640" y="29" text-anchor="middle" font-size="11.5" font-weight="700">m random columns per split</text><text x="640" y="45" text-anchor="middle" class="tm" font-size="10">pairs: Outlook 3/6 → 375 / 1,000</text>
<line x1="640" y1="54" x2="640" y2="90" stroke="currentColor" marker-end="url(#rf-ca)"/>
<rect x="470" y="92" width="280" height="44" rx="7" class="fg sg"/><text x="610" y="111" text-anchor="middle" font-size="11.5" font-weight="700">forest = bootstrap + m + vote</text><text x="610" y="127" text-anchor="middle" class="tm" font-size="10">D10: hard No, soft 0.557 Yes</text>
<line x1="470" y1="114" x2="402" y2="114" stroke="currentColor" marker-end="url(#rf-ca)"/>
<rect x="200" y="92" width="200" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.35"/><text x="300" y="111" text-anchor="middle" font-size="11.5" font-weight="700">strength vs correlation</text><text x="300" y="127" text-anchor="middle" class="tm" font-size="10">error ≤ ρ̄(1 − s²)/s²</text>
<line x1="200" y1="114" x2="152" y2="114" stroke="currentColor" marker-end="url(#rf-ca)"/>
<rect x="10" y="92" width="140" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.35"/><text x="80" y="111" text-anchor="middle" font-size="11.5" font-weight="700">tune m first</text><text x="80" y="127" text-anchor="middle" class="tm" font-size="10">√p; then size</text>
<line x1="560" y1="136" x2="560" y2="172" stroke="currentColor" marker-end="url(#rf-ca)"/>
<line x1="610" y1="136" x2="680" y2="172" stroke="currentColor" marker-end="url(#rf-ca)"/>
<line x1="520" y1="136" x2="380" y2="172" stroke="currentColor" marker-end="url(#rf-ca)"/>
<line x1="490" y1="136" x2="150" y2="172" stroke="currentColor" marker-end="url(#rf-ca)"/>
<rect x="10" y="174" width="190" height="44" rx="7" class="ft st"/><text x="105" y="193" text-anchor="middle" font-size="11.5" font-weight="700">OOB score</text><text x="105" y="209" text-anchor="middle" class="tm" font-size="10">churn 0.864 vs val 0.881</text>
<rect x="290" y="174" width="180" height="44" rx="7" class="ft st"/><text x="380" y="193" text-anchor="middle" font-size="11.5" font-weight="700">importance</text><text x="380" y="209" text-anchor="middle" class="tm" font-size="10">MDI vs permutation</text>
<rect x="480" y="174" width="140" height="44" rx="7" class="ft st"/><text x="550" y="193" text-anchor="middle" font-size="11.5" font-weight="700">proximity</text><text x="550" y="209" text-anchor="middle" class="tm" font-size="10">D1–D2: 0.62</text>
<rect x="630" y="174" width="120" height="44" rx="7" class="ft st"/><text x="690" y="193" text-anchor="middle" font-size="11.5" font-weight="700">regression</text><text x="690" y="209" text-anchor="middle" class="tm" font-size="10">leaf means</text>
<line x1="690" y1="218" x2="690" y2="254" stroke="currentColor" marker-end="url(#rf-ca)"/>
<rect x="470" y="256" width="280" height="44" rx="7" class="fr sr"/><text x="610" y="275" text-anchor="middle" font-size="11.5" font-weight="700">limits: no extrapolation, no bias fix</text><text x="610" y="291" text-anchor="middle" class="tm" font-size="10">110% humidity → 29.2, same as 96%</text>
<line x1="470" y1="278" x2="402" y2="278" stroke="currentColor" marker-end="url(#rf-ca)"/>
<rect x="200" y="256" width="200" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.35"/><text x="300" y="275" text-anchor="middle" font-size="11.5" font-weight="700">→ Extra Trees, boosting</text><text x="300" y="291" text-anchor="middle" class="tm" font-size="10">lower ρ again · fix bias</text>
</svg><figcaption>Bagging stalls at the correlation floor because the strongest column wins most roots. Random columns at every split break that, giving the random forest; its strength-correlation trade-off is set by m. Everything else in the note (OOB, importance, proximity, regression) is bookkeeping on the same trees, and its limits point to the next notes.</figcaption></figure>
  <table class="tbl"><caption>Every concept, what it is built from, and its value on the diary (or at scale)</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On the diary / at scale</th><th>Use when</th></tr>
    <tr><td>Correlation floor</td><td>Var = ρσ² + (1 − ρ)σ²/B</td><td>why did bagging stall?</td><td>Outlook root in 562 / 1,000 bagged trees; churn ρ 0.47</td><td>diagnosing a plateau</td></tr>
    <tr><td>Random columns per split</td><td>best split among m random columns</td><td>how to make trees differ?</td><td>pairs: Outlook 3/6, Humidity 2/6, Wind 1/6; roots 375 / 1,000</td><td>always (m is the main knob)</td></tr>
    <tr><td>Strength vs correlation</td><td>Breiman's bound ρ̄(1 − s²)/s²</td><td>how small should m be?</td><td>churn: m = 1 too weak (0.844); m ≥ 2 about 0.88</td><td>tuning m</td></tr>
    <tr><td>Soft vote</td><td>average of tree probabilities</td><td>how do trees combine?</td><td>D10: 0.557 → Yes (hard vote No)</td><td>sklearn default; needed for AUC</td></tr>
    <tr><td>OOB score</td><td>bootstrap left-outs + only the trees that missed them</td><td>free validation?</td><td>4 diary trees: 6/13 (noise); churn 0.864 vs 0.881</td><td>quick checks, choosing B</td></tr>
    <tr><td>MDI importance</td><td>weighted impurity drops per column</td><td>which columns did splits use?</td><td>Humidity 0.558, Outlook 0.442 (depth-2 tree)</td><td>quick look only</td></tr>
    <tr><td>Permutation importance</td><td>score drop after shuffling a column</td><td>which columns does the model need?</td><td>Outlook 0.34, Humidity 0.18, Wind 0.17, Temp 0</td><td>honest ranking (on validation rows)</td></tr>
    <tr><td>Regression forest</td><td>average of leaf means</td><td>how to predict numbers?</td><td>85% humidity: 38.86, 28.29, 24.00 → 30.38</td><td>numeric targets inside the data range</td></tr>
    <tr><td>Flat ceiling</td><td>predictions are averages of training targets</td><td>where does it fail?</td><td>110% humidity → 29.2, same as 96%</td><td>warns against trends</td></tr>
    <tr><td>Class weights</td><td>n / (k · n_c)</td><td>rare classes?</td><td>diary: No 1.4, Yes 0.78</td><td>with bigger leaves; else move the threshold</td></tr>
    <tr><td>Proximity</td><td>share of trees where two rows share a leaf</td><td>which rows are alike?</td><td>D1–D2 0.62, D1–D13 0.12</td><td>outliers, label errors, imputation</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a random forest is bagging plus one change, a fresh random handful of columns at every split, which lowers the correlation between trees at a small cost in each tree's strength.</strong> Everything else (OOB, importance, proximities) is reading out what the trees already contain, and the two things it cannot do, extrapolate and fix bias, are inherited from averaging trees.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Pros &amp; Cons.</b> With the whole design in view: when is a random forest the right choice, and when should you reach for something else?</div>

  <h2 id="rf-pros"><span class="num">14</span>Pros &amp; Cons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know how a forest works, what it offers and what it costs. Weighing it all, when is a random forest the right model, and when is a booster, a single tree or a linear model better?</p>
  </div>
  <div class="cards">
    <div><b>Strong with defaults</b><p>Often within a point or two of a tuned booster with zero tuning. A great first baseline.</p><small>Start every tabular project with it</small></div>
    <div><b>Hard to break</b><p>No scaling needed, handles bends and interactions, robust to outliers in inputs and to many irrelevant columns (with tuned m).</p><small>Monotone transforms of a column change nothing</small></div>
    <div><b>Free extras</b><p>OOB score, MDI importance, proximities, per-tree spread as uncertainty.</p><small>No separate validation needed for quick checks</small></div>
    <div><b>Parallel</b><p>Trees are independent: training and prediction scale across cores and machines.</p><small><code>n_jobs=-1</code></small></div>
  </div>
  <div class="cards">
    <div><b>Big and slow to predict</b><p>Hundreds of deep trees: tens of MB even on small data; latency grows with B.</p><small>Cap depth / leaf size</small></div>
    <div><b>No extrapolation</b><p>Predictions stay inside the training target range.</p><small>Model trends separately</small></div>
    <div><b>Not interpretable directly</b><p>You cannot read 300 trees; MDI is biased.</p><small>Use permutation / SHAP</small></div>
    <div><b>Usually beaten by boosting</b><p>Tuned gradient boosting (XGBoost, LightGBM, CatBoost) tends to win on accuracy, because forests cannot reduce bias.</p><small>Forest = strong baseline, booster = final model (often)</small></div>
  </div>
  <p>Use a random forest when you want a strong, low-effort, hard-to-overfit model, when you need a quick honest score (OOB), when you have many cores and little tuning time, or as a diverse member of a blend (<a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>). Prefer boosting when the last point of accuracy matters and you can tune; prefer a linear model when the target must extrapolate or the model must be explained in one line.</p>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Knowing when to use a forest is half the job; the other half is avoiding the mistakes people make with it.</div>

  <h2 id="rf-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which random-forest mistakes cost the most in practice and in interviews, and which section of this note prevents each one?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "train accuracy 1.000, it's overfitting"</span>
    <p>Fully grown trees memorise their bootstrap sample, so a forest's training accuracy is near 1.000 by design. Judge it only by OOB, validation or CV scores.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tuning n_estimators like a regulariser</span>
    <p>More trees never overfits; it only costs time and memory. Choose the smallest B where OOB has flattened.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: assuming RandomForestRegressor decorrelates</span>
    <p>Its default <code>max_features=1.0</code> makes it plain bagging. Try 0.33 or "sqrt".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reporting MDI as "what drives the target"</span>
    <p>MDI is computed on training data and inflates many-valued columns (our pure-noise <code>row_noise</code> scored like real columns). Check with permutation importance on held-out data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: leaky OOB</span>
    <p>Preprocessing fitted on all training rows (scaler, imputer, target encoder, feature selection) leaks into OOB rows. Put preprocessing in a pipeline and use CV for honest numbers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forecasting a trend with a forest</span>
    <p>It goes flat beyond the training range (300 m² flat predicted at 118, truth 240). Model differences or detrend first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging imbalance by accuracy, or reweighting by reflex</span>
    <p>Use AP / recall / precision. Reweighting did not improve ranking here; moving the threshold was simpler and better. Weighted models need recalibration if you need real probabilities.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting size and random_state</span>
    <p>A default forest can be tens of MB per 10k rows. And without <code>random_state</code>, every refit changes results slightly, which confuses comparisons.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page for revision.</div>

  <h2 id="rf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: the captain's 14-day cricket diary (Outlook, Temp, Humidity, Wind → Play, 9 Yes / 5 No; HumPct; Turnout). Large-scale numbers: the 20,000-customer churn table (14 columns).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer (diary / scale)</th><th>Weakness → next</th></tr>
    <tr><td>Bagged trees alike</td><td>why did bagging stall?</td><td>Outlook root 562 / 1,000; f5 100 / 100</td><td>how to decorrelate? → random columns</td></tr>
    <tr><td>Random columns per split</td><td>stop one column dominating?</td><td>pairs 3/6, 2/6, 1/6; roots 375 / 1,000</td><td>full recipe? → algorithm</td></tr>
    <tr><td>Algorithm &amp; soft vote</td><td>how do trees combine?</td><td>D10: soft 0.557 Yes, hard No</td><td>free score? → OOB</td></tr>
    <tr><td>OOB</td><td>validation without a hold-out?</td><td>6/13 with 4 trees; churn 0.864 vs 0.881</td><td>which knobs? → hyperparameters</td></tr>
    <tr><td>Hyperparameters</td><td>what to tune?</td><td>m first (√p), then size, then speed</td><td>which columns? → importance</td></tr>
    <tr><td>Importance</td><td>which columns matter?</td><td>MDI Humidity .558 / Outlook .442; permutation Outlook .34</td><td>numbers? → regression</td></tr>
    <tr><td>Regression</td><td>predict a number?</td><td>30.38 at 85%; flat beyond 65–96%</td><td>rare classes? → imbalance</td></tr>
    <tr><td>Imbalance, proximity, cost</td><td>extras and price?</td><td>weights 1.4 / 0.78; D1–D2 0.62; 69 MB</td><td>bias untouched → boosting; lower ρ → Extra Trees</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Variance of the forest</td><td>ρσ² + (1 − ρ)σ²/B</td><td>σ² one tree's variance, ρ correlation between trees, B trees</td></tr>
    <tr><td>Chance the best column is offered</td><td>m / p</td><td>m columns drawn per split, p columns; diary 2/4, churn 3/14</td></tr>
    <tr><td>Default m</td><td>√p (classification), p/3 (Breiman, regression); sklearn regressor uses p</td><td>p number of columns</td></tr>
    <tr><td>Breiman's bound</td><td>PE* ≤ ρ̄ (1 − s²) / s²</td><td>s strength (mean margin), ρ̄ mean correlation of margins</td></tr>
    <tr><td>Margin</td><td>share of trees voting y − largest share voting another class</td><td>y the true class</td></tr>
    <tr><td>Soft vote</td><td>P(c | x) = (1/B) Σ_b P_b(c | x)</td><td>P_b leaf class shares of tree b; D10: 2.79/5 = 0.557</td></tr>
    <tr><td>MDI</td><td>Σ_t (N_t/N)[i(t) − (N_L/N_t) i(L) − (N_R/N_t) i(R)], averaged over trees, normalised</td><td>t nodes splitting on the column; diary 0.102 and 0.129</td></tr>
    <tr><td>Permutation importance</td><td>score(data) − score(data with column j shuffled), averaged</td><td>diary: Outlook 0.34, Temp 0</td></tr>
    <tr><td>Class weight</td><td>w_c = n / (k · n_c)</td><td>n rows, k classes, n_c rows of class c</td></tr>
    <tr><td>Proximity</td><td>prox(i, j) = share of trees with leaf(i) = leaf(j)</td><td>D1–D2: 0.62</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use a forest</b><p>First model on any table; little tuning time; noisy labels; a quick honest score (OOB); a diverse member for a blend.</p><small>300 trees, max_features √p, oob_score=True</small></div>
    <div><b>Prefer boosting</b><p>When the last point of accuracy matters and you can tune with early stopping.</p><small>Forests cannot reduce bias</small></div>
    <div><b>Prefer a linear model</b><p>The target must extrapolate (trends), or the model must be one readable formula.</p><small>Or model the change</small></div>
    <div><b>Watch out</b><p>Model size and single-row latency in production; MDI as "drivers"; regression default max_features=1.0.</p><small>Cap depth / leaf size</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Reading train accuracy 1.000 as overfitting; tuning n_estimators as a regulariser; assuming RandomForestRegressor decorrelates by default; reporting MDI as causes; leaky OOB after preprocessing on all rows; forecasting a trend; judging imbalance by accuracy; forgetting size and random_state.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>p = 4, m = 2: how often is the best column available at a split?</td><td>m/p = 50% (3 of the 6 pairs)</td></tr>
    <tr><td>Trees give P(Yes) 1.00, 0.62, 0.33, 0.43, 0.40. Hard and soft vote?</td><td>Hard: 2 Yes vs 3 No → No. Soft: 0.557 → Yes</td></tr>
    <tr><td>Why do more trees never make a forest overfit?</td><td>Trees are independent; adding them only shrinks (1 − ρ)σ²/B toward the floor</td></tr>
    <tr><td>Diary: why is Temp's permutation importance exactly 0?</td><td>The tree never reads Temp, so shuffling it changes no prediction</td></tr>
    <tr><td>Forest trained on humidity 65–96%: prediction at 110%?</td><td>The same as at 96% (29.2): it cannot extrapolate</td></tr>
  </table>

  <h2 id="rf-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly does a random forest add to bagging, and why?</summary><div class="qa-body">At every split, the tree may choose only among <code>max_features</code> randomly drawn columns. Bagged trees all use the strongest column at the top (100 of 100 trees on our data), so they are correlated and share mistakes. The variance of an average is ρσ² + (1−ρ)σ²/B; extra trees only shrink the second part, so lowering ρ is the only way to go further. Random column draws lower ρ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the variance of the average of B correlated trees.</summary><div class="qa-body">Var(ΣX_b / B) = (1/B²)[Σ Var(X_b) + Σ_{b≠c} Cov(X_b, X_c)] = (1/B²)[Bσ² + B(B−1)ρσ²] = ρσ² + (1−ρ)σ²/B. As B → ∞ it tends to ρσ², the correlation floor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why draw the columns per split and not once per tree?</summary><div class="qa-body">Per tree (random subspaces) can leave a tree with no strong column at all, making it weak everywhere. Per split, a node that misses the strong column uses another one, but deeper nodes draw again and can still use it. Trees stay reasonably strong while their structures differ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a good max_features and what happens at the extremes?</summary><div class="qa-body">Defaults: √p for classification, Breiman's p/3 for regression (sklearn's regressor uses p). m = p is bagging: strong but correlated trees. m = 1 picks the split column completely at random: very decorrelated but weak trees (0.844 vs 0.881 on churn). Tune m by OOB/CV; it is the most important RF knob.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the OOB score and when would you not trust it?</summary><div class="qa-body">Each row is predicted by only the trees whose bootstrap missed it (~36.8% of trees), and those predictions are scored against the truth. Do not trust it when B is small (each row gets 1–2 votes: 5 trees gave OOB 0.728 vs val 0.825), on tiny datasets, when bootstrap=False, or when preprocessing was fitted on all rows before the forest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a random forest overfit? Can adding trees make it overfit?</summary><div class="qa-body">Adding trees cannot: the error converges as B grows (law of large numbers). The forest can still overfit through very deep trees on very noisy data, and training accuracy is always near 1. Control with min_samples_leaf / max_depth / max_features, judged on OOB or CV.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Soft vote vs hard vote: which does sklearn use and why does it matter?</summary><div class="qa-body">sklearn averages probabilities (soft). Breiman's paper used majority votes (hard). They can disagree: probabilities 0.9, 0.45, 0.45, 0.45, 0.8 average to 0.61 (churn) while the hard vote is 3–2 for stay. Soft votes use confidence and give scores for ROC/PR curves.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is MDI computed and what is its bias?</summary><div class="qa-body">Per split, (N_t/N) × impurity decrease, summed per column, averaged over trees, normalised to sum to 1. Worked: root drop 0.32 for A, child drop 0.5 × 0.32 = 0.16 for B → 0.667 / 0.333. Bias: computed on training data and favours columns with many distinct values, which offer many cut-offs and get lucky deep in the tree (pure noise row_noise: MDI 0.036 vs permutation 0.004).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a random forest extrapolate, and how do you work around it?</summary><div class="qa-body">A prediction is an average of leaf means, each an average of training targets, so it cannot leave [min y, max y]. Beyond the last split the function is flat (300 m² → 118, truth 240). Fix by predicting changes/ratios, detrending with a linear model and fitting residuals, or using models with linear leaves.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle class imbalance with a random forest?</summary><div class="qa-body">Options: class_weight="balanced" / "balanced_subsample", balanced random forest (undersample the majority per tree), or keep the model and tune the decision threshold on validation data. Evaluate with AP/recall/precision, not accuracy. In our run, threshold 0.2 on the default model gave recall 0.76 at precision 0.69 with the best AP; weighting only mattered once leaves had several rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are random forest proximities used for?</summary><div class="qa-body">Proximity(i, j) = share of trees in which rows i and j land in the same leaf. Uses: similarity search, clustering / MDS plots, imputing missing values from similar rows, and outlier or mislabel detection (a planted label typo ranked 4th of 500 by "share of proximity to the other class").</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Time and memory complexity of training and prediction?</summary><div class="qa-body">Training ≈ B × (cost of one tree with m columns per split) ≈ O(B · m · n log n) up to depth factors, parallel over trees. Prediction O(B · depth) per row. Memory O(B · nodes), and fully grown trees have up to ~0.63n leaves each: 300 trees on 12k rows were 862k nodes / 69 MB.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does Extra Trees exist if we already have random forests?</summary><div class="qa-body">It pushes the same logic one step further: besides random columns, it draws the cut-off at random instead of searching for the best one. Trees get even less correlated and training gets faster (no cut-off search, usually no bootstrap), at the cost of weaker single trees. See <a class="xref" data-note="ml_extratrees">Extra Trees</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did boosting come after bagging/forests, and when does it beat them?</summary><div class="qa-body">Averaging reduces variance but not bias: if every tree misses a pattern, the forest misses it too. Boosting builds trees in sequence, each fitting what the previous ones got wrong, so it reduces bias. With tuning (learning rate, early stopping) it usually beats forests on tabular data; forests remain the easier, more robust baseline. See <a class="xref" data-note="ml_boosting">How Boosting Works</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your forest's validation accuracy stopped improving at 100 trees. What do you try next?</summary><div class="qa-body">Not more trees. Tune max_features (lower ρ or stronger trees), try min_samples_leaf for smoother leaves, check for leakage or label noise (proximities), engineer better features, or switch to gradient boosting to attack bias. Then compare on the same CV folds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a random forest need both the bootstrap and random columns? What breaks without each?</summary><div class="qa-body">Without random columns it is plain bagging: on the diary Outlook still starts 562 of 1,000 trees, so ρ stays high and the variance stalls at the floor ρσ². Without the bootstrap every tree sees the same 14 days; random columns alone still diversify the trees (bootstrap=False scored 0.879 vs 0.881 on churn), but there is no out-of-bag score and slightly less diversity. Together they give the most decorrelation for the least loss in tree strength.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On the diary, MDI ranks Humidity and Wind above Outlook, permutation importance ranks Outlook first. Who is right?</summary><div class="qa-body">Both, for different questions. MDI measures how much impurity the splits on each column removed during training: the second-level Humidity and Wind splits each cleaned a 5-day box completely (0.347 each vs 0.247 for Outlook). Permutation measures how much the model's accuracy drops when a column is scrambled: every day passes through the Outlook question, so scrambling it hurts most (0.34 vs 0.18 and 0.17). For decisions, prefer permutation (or SHAP) on held-out data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What can a random forest not fix that boosting can, and how does the diary show the other limit?</summary><div class="qa-body">Averaging reduces variance only; if every tree misses a pattern (bias), the average misses it too, which is why boosting builds trees in sequence on the remaining errors (<a class="xref" data-note="ml_boosting">How Boosting Works</a>). The other limit is extrapolation: every prediction is an average of training targets, so turnout at 110% humidity is predicted 29.2, exactly as at 96%.</div></details>
</main>
`
});
