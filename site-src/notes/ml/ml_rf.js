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
    <li><b>Came from: <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a></b><span>Bagging trains many deep trees on bootstrap samples and averages them. That cut the churn error a lot (one tree 0.77 → 100 bagged trees 0.88). But the trees are still alike: the strongest column wins the first question in <em>every</em> tree, so they share mistakes, and averaging cannot cancel a mistake they all make.</span></li>
    <li><b>This note adds: random columns at every split</b><span>Each split may only choose among <code>max_features</code> randomly drawn columns. Trees become less alike (lower correlation ρ), so the average gets closer to the ideal of independent voters, and each split is cheaper to search. Plus a free validation score (OOB), importance scores, proximities.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_extratrees">Extra Trees</a> and <a class="xref" data-note="ml_boosting">How Boosting Works</a></b><span>Extra Trees pushes the same idea further by also drawing the cut-off at random. Boosting attacks what no forest can fix: averaging lowers variance but never bias, so a shared blind spot stays. Boosting builds trees in sequence to fix exactly that.</span></li>
  </ol>
  <p>You should already know how one tree picks a split with Gini impurity (<a class="xref" data-note="ml_dtree">Decision Trees</a>), why averaging helps (<a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a>) and what a bootstrap sample is (<a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a>). Each is re-explained in one line where it is used.</p>

  <h2 id="rf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Random Forest</div>
    <div class="mm-branches">
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
      <div class="rm-item rm-done" data-target="rf-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Problem: Bagged Trees Look Alike</span><span class="rm-sub">Dominant column, correlation floor</span></div></div>
      <div class="rm-item rm-done" data-target="rf-split"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Fix: Random Columns per Split</span><span class="rm-sub">Worked by hand, max_features, ρ vs strength</span></div></div>
      <div class="rm-item rm-done" data-target="rf-algo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Full Algorithm</span><span class="rm-sub">Training, soft vote, Breiman's bound</span></div></div>
      <div class="rm-item rm-done" data-target="rf-oob"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Out-of-Bag Score</span><span class="rm-sub">By hand, then on churn</span></div></div>
      <div class="rm-item rm-done" data-target="rf-hp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Hyperparameters</span><span class="rm-sub">Every knob and what it does</span></div></div>
      <div class="rm-item rm-done" data-target="rf-imp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Feature Importance</span><span class="rm-sub">MDI by hand, its bias, permutation</span></div></div>
      <div class="rm-item rm-done" data-target="rf-reg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Regression &amp; Extrapolation</span><span class="rm-sub">Averages of means; the flat ceiling</span></div></div>
      <div class="rm-item rm-done" data-target="rf-imb"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Imbalanced Classes</span><span class="rm-sub">class_weight, balanced RF, thresholds</span></div></div>
      <div class="rm-item rm-done" data-target="rf-prox"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Proximity &amp; Outliers</span><span class="rm-sub">Similarity from shared leaves</span></div></div>
      <div class="rm-item rm-done" data-target="rf-cost"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Complexity, Memory, Speed</span><span class="rm-sub">Big-O and real sizes</span></div></div>
      <div class="rm-item rm-done" data-target="rf-scratch"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">On top of sklearn trees, with OOB</span></div></div>
      <div class="rm-item rm-done" data-target="rf-cmp"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Tree vs Bagging vs Forest</span><span class="rm-sub">Accuracy, stability, comparison table</span></div></div>
      <div class="rm-item rm-done" data-target="rf-pros"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Pros &amp; Cons</span><span class="rm-sub">When to use it, when not</span></div></div>
      <div class="rm-item rm-done" data-target="rf-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">OOB, MDI, extrapolation, size</span></div></div>
      <div class="rm-item rm-done" data-target="rf-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview checks + connections</span></div></div>
    </div>
  </div>

  <h2 id="rf-problem"><span class="num">01</span>The Problem: Bagged Trees Look Alike</h2>
  <p>Quick recap of where we stand. One deep decision tree memorises its training rows: change a few rows and you get a quite different tree (high <strong>variance</strong>). Bagging fixes part of this: draw a <strong>bootstrap sample</strong> (n rows picked at random <em>with replacement</em>, so some rows twice, some never), grow a deep tree on it, repeat B times, and average the trees. The random wobbles of different trees cancel in the average.</p>
  <p>But the cancelling only works if the trees wobble <em>differently</em>. Each bootstrap sample contains about 63% of the distinct rows, and any two samples overlap heavily, so the trees are not very different. Worse, if one column is much stronger than the rest, every tree asks about that column first, and the whole top of every tree is the same.</p>
  <h3>Seeing it on the churn data</h3>
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
  <div class="bridge"><b>What's still missing?</b> We know <em>what</em> to lower (ρ) but not <em>how</em>. Changing the rows (bootstrap) was not enough. The next idea changes which columns a split may use.</div>

  <h2 id="rf-split"><span class="num">02</span>The Fix: Random Columns at Every Split</h2>
  <p>Plain words: when a tree in a random forest is about to ask a question at some node, it first draws a random handful of columns, say 3 out of 14. It then finds the best question <em>using only those 3</em>, exactly the way a normal tree would (try every cut-off, keep the biggest impurity drop). At the next node it draws a fresh random 3. The strong column is still used, just not everywhere, and the weaker columns finally get a chance to show what they know.</p>
  <h3>Worked by hand: one split with 4 candidate columns</h3>
  <p>A node holds 10 customers: 4 churn, 6 stay. Gini impurity is 1 − Σp² (the chance two randomly picked rows from the node have different labels): 1 − (0.4² + 0.6²) = 1 − 0.52 = <strong>0.48</strong>. Four columns are possible; for each, the best cut-off splits the node like this (left / right as [churn, stay]):</p>
  <table class="tbl">
    <tr><th>Column</th><th>Left</th><th>Right</th><th>Gini left</th><th>Gini right</th><th>Weighted child Gini</th><th>Drop from 0.48</th></tr>
    <tr><td>A (monthly plan)</td><td>[4, 1]</td><td>[0, 5]</td><td>1−(0.8²+0.2²) = 0.32</td><td>0</td><td>0.5·0.32 + 0.5·0 = 0.16</td><td><strong>0.32</strong></td></tr>
    <tr><td>B (complaints)</td><td>[3, 1]</td><td>[1, 5]</td><td>1−(0.75²+0.25²) = 0.375</td><td>1−(1/36+25/36) = 0.278</td><td>0.4·0.375 + 0.6·0.278 = 0.317</td><td>0.163</td></tr>
    <tr><td>C (age)</td><td>[2, 3]</td><td>[2, 3]</td><td>0.48</td><td>0.48</td><td>0.48</td><td>0</td></tr>
    <tr><td>D (data usage)</td><td>[3, 3]</td><td>[1, 3]</td><td>0.5</td><td>1−(1/16+9/16) = 0.375</td><td>0.6·0.5 + 0.4·0.375 = 0.45</td><td>0.03</td></tr>
  </table>
  <p>A normal tree (and every bagged tree) always picks <strong>A</strong>. Now a forest with <code>max_features = 2</code>: the node draws 2 of the 4 columns at random. There are 4·3/2 = 6 equally likely pairs. For each pair, the winner is whichever of the two has the bigger drop:</p>
  <table class="tbl">
    <tr><th>Columns drawn</th><th>{A,B}</th><th>{A,C}</th><th>{A,D}</th><th>{B,C}</th><th>{B,D}</th><th>{C,D}</th></tr>
    <tr><td>Split chosen</td><td>A</td><td>A</td><td>A</td><td><strong>B</strong></td><td><strong>B</strong></td><td><strong>D</strong></td></tr>
  </table>
  <p>So across many trees this node splits on A half the time (3/6), on B a third (2/6), on D a sixth (1/6). Column A shows up whenever it is drawn, which is m/p = 2/4 = 50% of the time. On the churn data, m = 3 and p = 14, so the strong <code>f5</code> is on offer at the root with probability 3/14 = <strong>21.4%</strong>, and the run above found it at the root of 22 out of 100 trees. The formula and the experiment agree.</p>
  <figure class="viz"><svg viewBox="0 0 620 175" width="620">
<rect x="10" y="20" width="170" height="130" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="95" y="14" text-anchor="middle" font-size="12" font-weight="600">Bagging: all 4 columns</text>
<rect x="25" y="35" width="140" height="22" rx="4" class="fg sg"/><text x="95" y="51" text-anchor="middle" font-size="12">A  drop 0.32 ✓</text>
<rect x="25" y="62" width="140" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="95" y="78" text-anchor="middle" font-size="12">B  drop 0.163</text>
<rect x="25" y="89" width="140" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="95" y="105" text-anchor="middle" font-size="12">C  drop 0</text>
<rect x="25" y="116" width="140" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="95" y="132" text-anchor="middle" font-size="12">D  drop 0.03</text>
<text x="95" y="168" text-anchor="middle" font-size="11" class="tm">every tree: A</text>
<rect x="220" y="20" width="390" height="130" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
<text x="415" y="14" text-anchor="middle" font-size="12" font-weight="600">Forest, max_features = 2: three different trees</text>
<rect x="235" y="40" width="110" height="22" rx="4" class="fg sg"/><text x="290" y="56" text-anchor="middle" font-size="12">A ✓</text>
<rect x="235" y="67" width="110" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="290" y="83" text-anchor="middle" font-size="12">C</text>
<text x="290" y="112" text-anchor="middle" font-size="11" class="tm">tree 1 drew {A, C}</text>
<rect x="360" y="40" width="110" height="22" rx="4" class="fg sg"/><text x="415" y="56" text-anchor="middle" font-size="12">B ✓</text>
<rect x="360" y="67" width="110" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="415" y="83" text-anchor="middle" font-size="12">D</text>
<text x="415" y="112" text-anchor="middle" font-size="11" class="tm">tree 2 drew {B, D}</text>
<rect x="485" y="40" width="110" height="22" rx="4" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="540" y="56" text-anchor="middle" font-size="12">C</text>
<rect x="485" y="67" width="110" height="22" rx="4" class="fg sg"/><text x="540" y="83" text-anchor="middle" font-size="12">D ✓</text>
<text x="540" y="112" text-anchor="middle" font-size="11" class="tm">tree 3 drew {C, D}</text>
<text x="415" y="138" text-anchor="middle" font-size="11" class="tm">winner = best of the drawn columns only</text>
<text x="415" y="168" text-anchor="middle" font-size="11" class="tm">across trees: A 50%, B 33%, D 17%</text>
</svg><figcaption>The same node in a bagged tree (left) and in three forest trees (right). Green = chosen split. The forest still prefers good columns, but no single column decides every tree.</figcaption></figure>
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
  <div class="bridge"><b>What's still missing?</b> We have the key ingredient. Now put the whole recipe together, step by step, and look closely at how the trees' answers are combined into one.</div>

  <h2 id="rf-algo"><span class="num">03</span>The Full Algorithm</h2>
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
  <p>Worked example, one customer, 5 trees, P(churn) from each:</p>
  <table class="tbl">
    <tr><th></th><th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>Result</th></tr>
    <tr><td>P(churn)</td><td>0.90</td><td>0.45</td><td>0.45</td><td>0.45</td><td>0.80</td><td>mean = 3.05 / 5 = <strong>0.61</strong> → churn (soft)</td></tr>
    <tr><td>Tree's own vote</td><td>churn</td><td>stay</td><td>stay</td><td>stay</td><td>churn</td><td>2 churn vs 3 stay → <strong>stay</strong> (hard)</td></tr>
  </table>
  <p>The two rules disagree. Three trees were barely unsure (0.45) while two were very sure (0.9, 0.8); the soft vote uses that confidence, the hard vote throws it away. Soft voting also gives a smoother probability you can threshold or rank (ROC/AUC needs scores, not votes). For full-depth trees most leaves are pure, so each tree's probability is 0 or 1 and the two rules mostly agree; the difference grows when leaves are bigger (<code>min_samples_leaf</code> &gt; 1).</p>
  <p>For <strong>regression</strong>, each leaf stores the mean target of its training rows, and the forest returns the plain average of the B trees' leaf means (section 07).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Soft vote = asking five doctors "how likely is it?" and averaging the percentages. Hard vote = asking each doctor "yes or no?" and counting hands. If three doctors say "45%, so no" and two say "90%, so yes", counting hands says no, but averaging says 61% and calls for treatment.</p>
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
  <div class="bridge"><b>What's still missing?</b> To tune m and friends we need a score on rows the model did not train on. Bagging gives one for free, and a forest inherits it.</div>

  <h2 id="rf-oob"><span class="num">04</span>Out-of-Bag Score</h2>
  <p>Each tree saw only its bootstrap sample. For each row, there are trees that never saw it: on average a fraction (1 − 1/n)ⁿ ≈ 1/e ≈ 36.8% of all trees (derived in <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a>). Let only those trees vote on that row, and you get an honest prediction for every training row without holding anything back. Compare those predictions with the true labels → <strong>OOB score</strong>.</p>
  <h3>By hand: 5 rows, 4 trees</h3>
  <table class="tbl">
    <tr><th>Tree</th><th>Bootstrap sample (rows drawn)</th><th>Out-of-bag rows</th></tr>
    <tr><td>T1</td><td>R1, R1, R3, R4, R5</td><td>R2</td></tr>
    <tr><td>T2</td><td>R2, R3, R3, R5, R5</td><td>R1, R4</td></tr>
    <tr><td>T3</td><td>R1, R2, R4, R4, R2</td><td>R3, R5</td></tr>
    <tr><td>T4</td><td>R1, R3, R3, R5, R1</td><td>R2, R4</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Row</th><th>True label</th><th>Trees that never saw it → their P(churn)</th><th>OOB average</th><th>OOB prediction</th><th>Right?</th></tr>
    <tr><td>R1</td><td>churn</td><td>T2: 0.8</td><td>0.80</td><td>churn</td><td>✓</td></tr>
    <tr><td>R2</td><td>stay</td><td>T1: 0.3, T4: 0.6</td><td>0.45</td><td>stay</td><td>✓</td></tr>
    <tr><td>R3</td><td>churn</td><td>T3: 0.4</td><td>0.40</td><td>stay</td><td>✗</td></tr>
    <tr><td>R4</td><td>stay</td><td>T2: 0.2, T4: 0.1</td><td>0.15</td><td>stay</td><td>✓</td></tr>
    <tr><td>R5</td><td>churn</td><td>T3: 0.9</td><td>0.90</td><td>churn</td><td>✓</td></tr>
  </table>
  <p>OOB accuracy = 4 / 5 = <strong>0.80</strong>. Notice that each row's OOB prediction comes from only 1 or 2 of the 4 trees: it is a prediction by a <em>smaller</em> forest than the real one. That is why OOB slightly underrates the full forest, and badly underrates it when B is small.</p>
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
  <div class="bridge"><b>What's still missing?</b> We can now score a forest for free. Time to go through every knob it has and see what each one does to accuracy, size and speed.</div>

  <h2 id="rf-hp"><span class="num">05</span>Hyperparameters</h2>
  <p>A random forest has few knobs that matter, and it is famous for working well with the defaults. Still, you should know each one, because interviews ask and because size and speed often need tuning in production.</p>
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
  <div class="fx" data-lang="text">{}                               leaves/tree   1438  train 1.000  OOB 0.864  val 0.881  2.2s
{'max_depth': 4}                 leaves/tree     16  train 0.761  OOB 0.742  val 0.759  0.9s
{'max_depth': 8}                 leaves/tree    150  train 0.867  OOB 0.821  val 0.839  1.4s
{'max_depth': 16}                leaves/tree   1031  train 0.989  OOB 0.860  val 0.874  2.1s
{'min_samples_leaf': 5}          leaves/tree    780  train 0.963  OOB 0.857  val 0.873  2.9s
{'min_samples_leaf': 20}         leaves/tree    276  train 0.897  OOB 0.840  val 0.858  1.7s
{'max_samples': 0.2}             leaves/tree    448  train 0.929  OOB 0.846  val 0.862  1.1s
{'max_samples': 0.5}             leaves/tree    923  train 0.987  OOB 0.858  val 0.874  1.4s</div>
  <p>Three lessons. <strong>(1) Deep trees are the right default.</strong> Every limit lowered accuracy here: depth 4 trees (16 leaves) give 0.759, barely better than one tree, because averaging cannot remove the bias of shallow trees. <strong>(2) Limits buy size.</strong> <code>max_depth=16</code> keeps 0.874 with 28% fewer leaves; <code>min_samples_leaf=5</code> halves the leaves for −0.008. In production that may be a good trade (section 10). <strong>(3) max_samples is a speed knob.</strong> Training each tree on 20% of rows is about twice as fast and costs 0.019. Times are wall-clock on a shared 4-core machine; trust the ratios, not the seconds.</p>
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
  <div class="bridge"><b>What's still missing?</b> The forest is tuned and accurate, but 200 trees cannot be read like one. The business still asks "which columns drive churn?" The forest gives an answer for free, but that answer has a famous trap.</div>

  <h2 id="rf-imp"><span class="num">06</span>Feature Importance: MDI and Permutation</h2>
  <h3>MDI (mean decrease in impurity), by hand</h3>
  <p>Every split lowers impurity. Credit that drop to the column used, weighted by how many rows passed through the node. Sum per column over all nodes, average over all trees, and rescale so the scores sum to 1. That is <code>feature_importances_</code>.</p>
  <div class="fx" data-lang="text">importance of column j in one tree = Σ over nodes t that split on j of
        (N_t / N) · [ impurity(t) − (N_left/N_t)·impurity(left) − (N_right/N_t)·impurity(right) ]</div>
  <p>A tiny tree on 10 customers (4 churn) with two yes/no columns, A (monthly plan) and B (complained):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
#              rows 0-3: churners      row 4  rows 5-6   rows 7-9
A = np.array([1, 1, 1, 1,               1,     0, 0,      0, 0, 0])   # monthly plan?
B = np.array([1, 1, 1, 1,               0,     1, 1,      0, 0, 0])   # complained?
y = np.array([1, 1, 1, 1,               0,     0, 0,      0, 0, 0])   # churned?
t = DecisionTreeClassifier(random_state=0).fit(np.c_[A, B], y)
print(export_text(t, feature_names=["A", "B"]))
print("impurity per node:", t.tree_.impurity.round(3), " rows per node:", t.tree_.n_node_samples)
print("MDI:", {k: round(float(v), 3) for k, v in zip(["A", "B"], t.feature_importances_)})</div>
  <div class="fx" data-lang="text">|--- A &lt;= 0.50
|   |--- class: 0
|--- A &gt;  0.50
|   |--- B &lt;= 0.50
|   |   |--- class: 0
|   |--- B &gt;  0.50
|   |   |--- class: 1

impurity per node: [0.48 0.   0.32 0.   0.  ]  rows per node: [10  5  5  1  4]
MDI: {'A': 0.667, 'B': 0.333}</div>
  <table class="tbl">
    <tr><th>Node</th><th>Column</th><th>N_t / N</th><th>Impurity before</th><th>Weighted after</th><th>Weighted drop</th></tr>
    <tr><td>root (10 rows, [4,6])</td><td>A</td><td>10/10</td><td>0.48</td><td>5/10·0 + 5/10·0.32 = 0.16</td><td>1 × (0.48 − 0.16) = <strong>0.32</strong></td></tr>
    <tr><td>A=1 node (5 rows, [4,1])</td><td>B</td><td>5/10</td><td>0.32</td><td>1/5·0 + 4/5·0 = 0</td><td>0.5 × (0.32 − 0) = <strong>0.16</strong></td></tr>
  </table>
  <p>Totals: A = 0.32, B = 0.16, sum 0.48 (which is all the impurity the root had: the leaves are pure). Normalised: A = 0.32/0.48 = <strong>0.667</strong>, B = 0.16/0.48 = <strong>0.333</strong>. Exactly what sklearn printed. A forest does this per tree and averages.</p>
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
  <p>Idea: if the model really needs column j, scrambling j on fresh data should hurt the score. Steps: (1) score the fitted model on validation data; (2) shuffle column j (break its link to the target, keep its values); (3) score again; (4) importance = drop; repeat with several shuffles and average. Tiny example: a model that says "churn if A = 1 and B = 1"; column C is unused.</p>
  <table class="tbl">
    <tr><th>Row</th><th>A</th><th>B</th><th>True</th><th>Pred</th><th>B shuffled</th><th>Pred after</th><th>Right after?</th></tr>
    <tr><td>1</td><td>1</td><td>1</td><td>churn</td><td>churn</td><td>0</td><td>stay</td><td>✗</td></tr>
    <tr><td>2</td><td>1</td><td>1</td><td>churn</td><td>churn</td><td>1</td><td>churn</td><td>✓</td></tr>
    <tr><td>3</td><td>1</td><td>0</td><td>stay</td><td>stay</td><td>1</td><td>churn</td><td>✗</td></tr>
    <tr><td>4</td><td>0</td><td>1</td><td>stay</td><td>stay</td><td>1</td><td>stay</td><td>✓</td></tr>
    <tr><td>5</td><td>0</td><td>0</td><td>stay</td><td>stay</td><td>1</td><td>stay</td><td>✓</td></tr>
    <tr><td>6</td><td>1</td><td>1</td><td>churn</td><td>churn</td><td>0</td><td>stay</td><td>✗</td></tr>
  </table>
  <p>Before: 6/6 = 1.00. After shuffling B (same four 1s and two 0s, new order): 3/6 = 0.50. Importance of B = 1.00 − 0.50 = <strong>0.50</strong> for this shuffle. Shuffling C changes no prediction (the model never reads C), so its importance is exactly <strong>0</strong>. That is the property MDI lacks: a column the model only used to memorise training noise gets no credit on new data.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MDI</strong> (Gini importance): for each column, the total weighted impurity decrease of all splits using it, averaged over trees, normalised to sum to 1. Computed on training data during fitting. <strong>Permutation importance</strong> (Breiman 2001 used OOB rows; sklearn's <code>permutation_importance</code> uses any data you pass): score(data) − score(data with column j shuffled), averaged over <code>n_repeats</code> shuffles.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two different traps. <strong>MDI</strong>: favours many-valued columns (IDs, timestamps, continuous noise) and is computed on training data, so it rewards memorisation. <strong>Permutation</strong>: when two columns are strongly correlated, shuffling one barely hurts because the twin covers for it, so <em>both</em> can look unimportant. Shuffling also creates unrealistic rows (e.g. age 5 with 20 years of tenure). Drop-column importance, SHAP and grouped permutation are in <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Everything so far was classification. Forests predict numbers too, and that exposes their biggest structural limit.</div>

  <h2 id="rf-reg"><span class="num">07</span>Regression &amp; Extrapolation</h2>
  <p>A regression forest uses regression trees (<a class="xref" data-note="ml_dtree">Decision Trees</a>): splits minimise squared error (equivalently, maximise variance reduction), and each leaf predicts the <strong>mean</strong> target of its training rows. The forest averages the trees. By hand, three trees for one flat:</p>
  <table class="tbl">
    <tr><th></th><th>Tree 1</th><th>Tree 2</th><th>Tree 3</th><th>Forest</th></tr>
    <tr><td>Leaf's training prices (lakh ₹)</td><td>50, 54</td><td>58</td><td>47, 49, 51</td><td></td></tr>
    <tr><td>Leaf mean = tree's prediction</td><td>52</td><td>58</td><td>49</td><td>(52 + 58 + 49) / 3 = <strong>53</strong></td></tr>
  </table>
  <p>sklearn's <code>RandomForestRegressor</code> defaults to <code>max_features=1.0</code> (all columns; Breiman suggested p/3) and <code>min_samples_leaf=1</code> (Breiman suggested 5 for regression). Both are worth tuning. The spread of the trees' predictions (here 49 to 58) is a rough sign of uncertainty; quantile regression forests (Meinshausen, 2006) keep all training targets in each leaf to give proper prediction intervals.</p>
  <h3>The flat ceiling: forests cannot extrapolate</h3>
  <p>Every prediction is an average of leaf means, and every leaf mean is an average of training targets. So a forest's prediction can never be above the largest training target or below the smallest. Watch it on flats priced by a straight line, price = 0.8 × size:</p>
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
  <div class="bridge"><b>What's still missing?</b> Real targets are often lopsided: 1 fraud in 30 transactions, 1 churner in 50 customers. How does a forest cope with a rare class?</div>

  <h2 id="rf-imb"><span class="num">08</span>Imbalanced Classes</h2>
  <p>With a rare class, impurity is already low at the root (a node with 97% "honest" has Gini 0.06), so splits that isolate the few positives look small, and many leaves end up majority-class. The forest ranks rows reasonably but, at the default 0.5 threshold, misses many positives. Four common fixes:</p>
  <ul>
    <li><strong><code>class_weight="balanced"</code></strong>: each row of class c gets weight n / (k · n_c), so both classes carry equal total weight in impurity and leaf votes.</li>
    <li><strong><code>class_weight="balanced_subsample"</code></strong>: the same, but weights recomputed inside each bootstrap sample.</li>
    <li><strong>Balanced random forest</strong> (Chen, Liaw &amp; Breiman 2004): each tree is grown on a bootstrap with equal numbers of each class (the majority is undersampled).</li>
    <li><strong>Move the threshold</strong>: keep the default model and flag a row when P(positive) ≥ t with t &lt; 0.5, chosen on validation data.</li>
  </ul>
  <p>Worked weights for this run: 14,000 training rows, 480 positives, 13,520 negatives, k = 2 classes. Positive weight = 14,000 / (2 · 480) = 14.6; negative weight = 14,000 / (2 · 13,520) = 0.52. One positive now counts as much as 28 negatives.</p>
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
  <div class="bridge"><b>What's still missing?</b> A forest knows more than predictions: it knows which rows it treats alike. That gives a similarity measure for free.</div>

  <h2 id="rf-prox"><span class="num">09</span>Proximity &amp; Outliers</h2>
  <p>If two customers land in the same leaf of a tree, that tree treats them as identical. Count, over all trees, how often two rows share a leaf: that share is their <strong>proximity</strong>, a similarity between 0 and 1 that the forest learnt with the target in mind (columns that matter for churn count, noise columns mostly do not). Breiman used proximities to fill missing values, draw maps of the data (multidimensional scaling) and find outliers.</p>
  <p>By hand: 4 trees, rows R1 and R2 land in leaves (7,7), (3,5), (12,12), (4,4) → same leaf in 3 of 4 trees → proximity 0.75. Rows R1 and R3: (7,2), (3,9), (12,1), (4,6) → 0 of 4 → proximity 0.</p>
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
  <div class="bridge"><b>What's still missing?</b> We have the full feature set. Before using it in production we must know what it costs: training time, memory, and prediction latency.</div>

  <h2 id="rf-cost"><span class="num">10</span>Complexity, Memory, Speed</h2>
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
  <div class="fx" data-lang="text">{}                     nodes  862330  avg depth 28.5  pickle  69.1 MB  val 0.879  predict  110 us/row (1 core, batch)
{'min_samples_leaf': 5} nodes  467444  avg depth 24.3  pickle  37.5 MB  val 0.872  predict  116 us/row (1 core, batch)
{'max_depth': 10}      nodes  192976  avg depth 10.0  pickle  15.5 MB  val 0.855  predict   73 us/row (1 core, batch)</div>
  <p>A default 300-tree forest on just 12,000 rows is 862,330 nodes and a 69 MB file; trees are 28 levels deep on average. <code>min_samples_leaf=5</code> halves the size for −0.007 accuracy; <code>max_depth=10</code> cuts it 4.5× and speeds prediction, for −0.024. Size grows roughly linearly with the number of training rows, so a forest on 10 million rows can be gigabytes. Timings are from a busy shared machine: compare them with each other, not with your laptop.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forests that are fine in a notebook can fail in production because of size (slow to load, too big for a container) and latency (a single-row prediction walks every tree). Cap depth or leaf size, reduce trees to where OOB flattens, or distil into a boosted model. See <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have used sklearn's forest as a black box. Writing it ourselves, on top of sklearn's single tree, proves there is nothing more to it than bootstrap + random columns + average.</div>

  <h2 id="rf-scratch"><span class="num">11</span>From Scratch</h2>
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
  <div class="fx" data-lang="text">from scratch: val 0.876  OOB 0.861  27.0s
sklearn     : val 0.881  OOB 0.864  20.4s
the two forests give the same answer on 97.3% of validation rows</div>
  <p>Our 30-line forest scores 0.876 on validation (sklearn 0.881) with OOB 0.861 (sklearn 0.864), and the two agree on 97.3% of customers. They cannot match exactly, because the random draws differ; the remaining gap is the size of the run-to-run noise of a forest (try a few seeds of either). Walking through the code: <code>rng.integers(0, n, n)</code> is the bootstrap; <code>np.setdiff1d</code> finds the rows a tree never saw and adds that tree's probabilities to those rows only; <code>predict_proba</code> is the soft vote of section 03. sklearn is faster mainly because its loops are in Cython and it reuses sorted data.</p>
  <div class="bridge"><b>What's still missing?</b> Time to step back and put the forest next to its parent (one tree) and its sibling (bagging), measured the same way.</div>

  <h2 id="rf-cmp"><span class="num">12</span>Tree vs Bagging vs Forest</h2>
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

  <h2 id="rf-pros"><span class="num">13</span>Pros &amp; Cons</h2>
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

  <h2 id="rf-traps"><span class="num">14</span>Common Mistakes</h2>
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

  <h2 id="rf-qa"><span class="num">15</span>Questions &amp; Answers</h2>
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
</main>
`
});
