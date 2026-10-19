// notes/ml/ml_ensembles.js — Ensemble Learning: The Idea
Object.assign(TOPIC_CONTENT, {
  "ml_ensembles": `<main>
  <h1>Ensemble Learning: The Idea</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Ensemble Learning: The Idea</span></div>
  <p class="lead">An <strong>ensemble</strong> is a team of models whose answers are combined into one answer. This note is the theory behind every team in the tree family: why a team of mediocre models can beat its best member, the exact maths of when that works (Condorcet's jury theorem, the ρσ² + (1 − ρ)σ²/n formula, the ambiguity decomposition), what kind of error each team design removes (bias or variance), where the "differences" between members come from, the four designs (bagging, boosting, stacking, voting), and when a team is not worth its cost. Everything is worked by hand on small numbers first, then checked in code on the shared 20,000-row churn dataset.</p>

  <h2 id="ens-where" class="open"><span class="num">↳</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="ens-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="340" y1="40" x2="340" y2="64" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="340" y1="98" x2="110" y2="126" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="340" y1="98" x2="340" y2="126" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="340" y1="98" x2="570" y2="126" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="110" y1="160" x2="110" y2="188" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="110" y1="222" x2="55" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="110" y1="222" x2="168" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="340" y1="160" x2="270" y2="188" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="340" y1="160" x2="410" y2="188" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="410" y1="222" x2="300" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="410" y1="222" x2="410" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<line x1="410" y1="222" x2="520" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#ens-ar)"/>
<rect x="265" y="8" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="340" y="28" text-anchor="middle" font-size="12" font-weight="400">Decision Trees</text>
<rect x="265" y="66" width="150" height="32" rx="7" class="fg sg" stroke-width="2.5"/>
<text x="340" y="86" text-anchor="middle" font-size="12" font-weight="700">Ensemble Learning</text>
<rect x="35" y="128" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="110" y="148" text-anchor="middle" font-size="12" font-weight="400">Bagging branch</text>
<rect x="265" y="128" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="340" y="148" text-anchor="middle" font-size="12" font-weight="400">Boosting branch</text>
<rect x="495" y="128" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="570" y="148" text-anchor="middle" font-size="12" font-weight="400">Stacking &amp; Voting</text>
<rect x="35" y="190" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="110" y="210" text-anchor="middle" font-size="12" font-weight="400">Bagging &amp; Bootstrap</text>
<rect x="3" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="55" y="272" text-anchor="middle" font-size="12" font-weight="400">Random Forest</text>
<rect x="116" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="168" y="272" text-anchor="middle" font-size="12" font-weight="400">Extra Trees</text>
<rect x="218" y="190" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="270" y="210" text-anchor="middle" font-size="12" font-weight="400">AdaBoost</text>
<rect x="335" y="190" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="410" y="210" text-anchor="middle" font-size="12" font-weight="400">Gradient Boosting</text>
<rect x="248" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="300" y="272" text-anchor="middle" font-size="12" font-weight="400">XGBoost</text>
<rect x="358" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="410" y="272" text-anchor="middle" font-size="12" font-weight="400">LightGBM</text>
<rect x="468" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="520" y="272" text-anchor="middle" font-size="12" font-weight="400">CatBoost</text>
<text x="421" y="86" class="tg" font-size="11" font-weight="700">◀ you are here</text>
</svg><figcaption>The tree-model family. This note (green) is the parent of the three ensemble branches: bagging (parallel), boosting (sequential) and stacking / voting (blend).</figcaption></figure>
  <ul>
    <li><strong>Came from:</strong> <a class="xref" data-note="ml_dtree">Decision Trees</a>. A fully grown tree has low bias but <em>high variance</em>: train it on a slightly different sample and you get a very different tree. Pruning lowers the variance, but only by adding bias. One tree is stuck between "too simple" and "too shaky".</li>
    <li><strong>What this note adds:</strong> a way out of that trade-off. Do not try to build one perfect model. Build many imperfect ones that make <em>different</em> mistakes and combine them. This note gives the reasons, the maths and the limits.</li>
    <li><strong>Leads to:</strong> the three ways of building the team. <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a> (then <a class="xref" data-note="ml_rf">Random Forest</a> and <a class="xref" data-note="ml_extratrees">Extra Trees</a>) attacks variance with parallel members. <a class="xref" data-note="ml_boosting">How Boosting Works</a> attacks bias with sequential members. <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a> blends different kinds of models. The map of the whole family is in <a class="xref" data-note="ml_trees">The Tree Family</a>.</li>
  </ul>
  <p>Background that helps: bias and variance from <a class="xref" data-note="ml_core">Core Concepts</a>; variance and correlation from <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>; independence and the binomial from <a class="xref" data-note="st_probability">Probability</a>.</p>

  <h2 id="ens-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Ensemble Learning</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li><b>Ensemble</b> — several models + a rule that combines their outputs</li>
          <li><b>Why</b> — one model is either too simple (bias) or too shaky (variance)</li>
          <li>💡 Jar of laddoos: 100 independent guesses averaged beat almost every single guess</li>
          <li><b>Needs</b> — members better than chance AND making different mistakes</li>
          <li>5 shaky trees (0.78 each) voting → 0.840</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Voting maths</div>
        <ul>
          <li><b>3 voters, p = 0.7</b> — P(majority right) = p³ + 3p²(1−p) = 0.784</li>
          <li><b>Condorcet</b> — independent voters with p &gt; 0.5: majority accuracy → 1 as n grows</li>
          <li>p &lt; 0.5 → more voters make it <em>worse</em> (→ 0)</li>
          <li><b>Copying kills it</b> — 25 voters, half copy a leader: 0.98 → 0.72</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Averaging maths</div>
        <ul>
          <li><b>Var(mean of n)</b> = ρσ² + (1 − ρ)σ²/n</li>
          <li>ρ = 0 → σ²/n · ρ = 1 → σ² (no gain)</li>
          <li><b>Floor ρσ²</b> — more members only shrink the 2nd term; lowering ρ lowers the floor</li>
          <li><b>Ambiguity</b> — team error = avg member error − avg disagreement</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bias &amp; variance</div>
        <ul>
          <li><b>Averaging</b> (bagging) — same bias, lower variance → use low-bias members (deep trees)</li>
          <li><b>Adding</b> (boosting) — lowers bias step by step → use high-bias members (stumps)</li>
          <li>Bagged stumps: still biased (0.063) · boosted stumps: bias 0.001</li>
          <li><b>Stacking</b> — learns the mix; can fix both a little</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Diversity sources</div>
        <ul>
          <li>Different rows (bootstrap, subsamples)</li>
          <li>Different columns (random subspace, per-split features)</li>
          <li>Random choices inside the algorithm (random thresholds, seeds)</li>
          <li>Different algorithms or hyperparameters</li>
          <li>Reweighted rows (boosting)</li>
          <li>Measure: disagreement rate, error correlation</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Taxonomy</div>
        <ul>
          <li><b>Bagging</b> — parallel, same algorithm, average → variance</li>
          <li><b>Boosting</b> — sequential, fix the team's errors → bias</li>
          <li><b>Voting</b> — fixed rule over different models (hard / soft / weighted)</li>
          <li><b>Stacking</b> — a meta-model learns the combination</li>
          <li>Homogeneous (one algorithm) vs heterogeneous (several)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Limits &amp; costs</div>
        <ul>
          <li>⚠ Stable / high-bias members: bagging gains ~0</li>
          <li>⚠ One strong + weak members: plain averaging drags it down</li>
          <li>⚠ Shared bias, correlated members, tiny data, members worse than chance</li>
          <li><b>Costs</b> — n× training, n× latency, n× memory, lost readability</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ens-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Model Is Not Enough</span><span class="rm-sub">Shaky trees, and a team that beats them</span></div></div>
      <div class="rm-item rm-done" data-target="ens-vote"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Maths of Voting</span><span class="rm-sub">3 voters by hand, Condorcet's jury theorem</span></div></div>
      <div class="rm-item rm-done" data-target="ens-avg"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Maths of Averaging</span><span class="rm-sub">ρσ² + (1 − ρ)σ²/n, derived and tested</span></div></div>
      <div class="rm-item rm-done" data-target="ens-bv"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Bias &amp; Variance per Ensemble Type</span><span class="rm-sub">What averaging fixes, what adding fixes</span></div></div>
      <div class="rm-item rm-done" data-target="ens-div"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Diversity</span><span class="rm-sub">Ambiguity decomposition, sources, measuring it</span></div></div>
      <div class="rm-item rm-done" data-target="ens-tax"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Taxonomy</span><span class="rm-sub">Bagging, boosting, voting, stacking</span></div></div>
      <div class="rm-item rm-done" data-target="ens-run"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Every Design on One Dataset</span><span class="rm-sub">Churn data, accuracy and time</span></div></div>
      <div class="rm-item rm-done" data-target="ens-fail"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">When Ensembles Do Not Help</span><span class="rm-sub">Stable members, weak members, shared bias</span></div></div>
      <div class="rm-item rm-done" data-target="ens-cost"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Costs</span><span class="rm-sub">Latency, size, readability, upkeep</span></div></div>
      <div class="rm-item rm-done" data-target="ens-cmp"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Comparison Tables</span><span class="rm-sub">The designs side by side</span></div></div>
      <div class="rm-item rm-done" data-target="ens-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Where teams go wrong</span></div></div>
      <div class="rm-item rm-done" data-target="ens-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="ens-need"><span class="num">01</span>One Model Is Not Enough</h2>
  <h3>The need: a tree that changes its mind</h3>
  <p>In <a class="xref" data-note="ml_dtree">Decision Trees</a> we grew one tree on 12,000 customers and it scored about 0.78 on new customers. The bigger problem was hidden: grow the tree again on a slightly different sample and it asks different questions. The code below plays that out. Five data scientists each get a different random 80% of the same training rows and each grows a full tree.</p>
  <div class="callout def"><span class="label">The shared dataset</span>
    <p>All churn code in the tree-family notes uses the same synthetic customer table, so numbers can be compared across notes: 20,000 rows, 12 columns from <code>make_classification</code> (6 carry signal) plus two pure-noise columns (<code>row_noise</code>, <code>coin_noise</code>); 12,000 train / 3,000 validation / 5,000 test; label 1 = churned. Every churn block below starts from this setup.</p>
  </div>
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
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
preds = []
for k in range(5):
    idx = rng.choice(len(Xtr), size=len(Xtr)*8//10, replace=False)   # a different 80% of the rows
    t = DecisionTreeClassifier(random_state=0).fit(Xtr.iloc[idx], ytr[idx])
    s = t.tree_; L = s.children_left[0]                    # node 0 = first question, L = its "yes" child
    name = lambda i: f"{Xtr.columns[s.feature[i]]} &lt;= {s.threshold[i]:.2f}"
    p = t.predict(Xva); preds.append(p)
    print(f"tree {k+1}: 1st q '{name(0)}'  2nd q '{name(L)}'  leaves {t.get_n_leaves()}  val {np.mean(p == yva):.3f}")
P = np.array(preds)                                        # 5 trees x 3000 validation rows
print(f"rows where the 5 trees do not all agree: {np.mean(P.min(0) != P.max(0)):.1%}")
vote = (P.mean(0) &gt; 0.5).astype(int)                       # majority vote of the 5 trees
print(f"majority vote of the 5 trees: val {np.mean(vote == yva):.3f}")</div>
  <div class="fx" data-lang="text">tree 1: 1st q 'f5 &lt;= 0.31'  2nd q 'f3 &lt;= -0.63'  leaves 1142  val 0.779
tree 2: 1st q 'f5 &lt;= 0.31'  2nd q 'f6 &lt;= -1.03'  leaves 1162  val 0.774
tree 3: 1st q 'f5 &lt;= 0.30'  2nd q 'f3 &lt;= -0.53'  leaves 1143  val 0.776
tree 4: 1st q 'f5 &lt;= 0.05'  2nd q 'f6 &lt;= -1.13'  leaves 1153  val 0.791
tree 5: 1st q 'f5 &lt;= -0.09'  2nd q 'f6 &lt;= -1.13'  leaves 1172  val 0.779
rows where the 5 trees do not all agree: 50.0%
majority vote of the 5 trees: val 0.840</div>
  <p>Read it line by line. All five trees ask about <code>f5</code> first, but at different cut-offs (0.31 down to −0.09). Because the first cut moved, different rows reach the second question, so the second question changes (<code>f3</code> in some trees, <code>f6</code> in others), and everything below changes too. Each tree scores about 0.78. Yet on half of the validation customers the five trees do <em>not</em> all agree, and when they simply vote, accuracy jumps to <strong>0.840</strong>, higher than every single member.</p>
  <h3>Plain words</h3>
  <p>A model whose answers change a lot when the training data changes a little has <strong>high variance</strong>. That is bad for one model. But it has a bright side: the mistakes are partly random, and random mistakes made by different models land on different customers. When the models vote, each one's private mistakes are outvoted by the others. That is the entire idea of ensemble learning.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A quiz show "audience poll". Any one person in the audience is often wrong. But wrong people pick different wrong options, while the people who know all pick the same right one. So the most popular answer is right far more often than a random audience member.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>ensemble</strong> is a set of <strong>base models</strong> (also called members, base learners or level-0 models) h₁, …, hₙ plus a <strong>combination rule</strong> that turns their outputs into one prediction. Common rules: majority vote, average of probabilities, average of numbers, weighted sum, or a second model trained on their outputs (stacking).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"More models is always better" is false. Five copies of the same tree vote exactly like one tree (section 05 shows it: 0.773 → 0.773). The gain comes from <em>differences</em> between members, not from their number.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We saw a team win once. We need to know <em>why</em> it wins, by how much, and under which conditions. The cleanest place to start is a vote between a few yes/no voters, which we can work out with pencil and paper.</div>

  <h2 id="ens-vote"><span class="num">02</span>The Maths of Voting</h2>
  <h3>Three voters, worked by hand</h3>
  <p>Take three classifiers. Each is right on a given customer with probability p = 0.7, and (for now) their mistakes are <strong>independent</strong>: whether one is wrong tells you nothing about the others. The team answers by majority: it is right when at least 2 of the 3 are right. List all 2³ = 8 possible outcomes (R = right, W = wrong). The probability of an outcome is the product of its parts, because the voters are independent.</p>
  <table class="tbl">
    <tr><th>Voter 1</th><th>Voter 2</th><th>Voter 3</th><th>Probability</th><th>Majority right?</th></tr>
    <tr><td>R</td><td>R</td><td>R</td><td>0.7 × 0.7 × 0.7 = 0.343</td><td>yes</td></tr>
    <tr><td>R</td><td>R</td><td>W</td><td>0.7 × 0.7 × 0.3 = 0.147</td><td>yes</td></tr>
    <tr><td>R</td><td>W</td><td>R</td><td>0.147</td><td>yes</td></tr>
    <tr><td>W</td><td>R</td><td>R</td><td>0.147</td><td>yes</td></tr>
    <tr><td>R</td><td>W</td><td>W</td><td>0.7 × 0.3 × 0.3 = 0.063</td><td>no</td></tr>
    <tr><td>W</td><td>R</td><td>W</td><td>0.063</td><td>no</td></tr>
    <tr><td>W</td><td>W</td><td>R</td><td>0.063</td><td>no</td></tr>
    <tr><td>W</td><td>W</td><td>W</td><td>0.3 × 0.3 × 0.3 = 0.027</td><td>no</td></tr>
  </table>
  <p>Add the "yes" rows: 0.343 + 3 × 0.147 = 0.343 + 0.441 = <strong>0.784</strong>. Three 70% voters make a 78.4% team. In formula form: P(majority right) = p³ + 3p²(1 − p). The code enumerates the same 8 rows.</p>
  <div class="fx" data-lang="py">from itertools import product
p = 0.70                                    # each voter is right 70% of the time
total = 0.0
for votes in product([1, 0], repeat=3):     # 1 = this voter is right, 0 = wrong
    prob = 1.0
    for v in votes:
        prob *= p if v else (1 - p)
    ok = sum(votes) &gt;= 2                     # majority (2 of 3) right?
    total += prob if ok else 0
    print(votes, f"prob {prob:.3f}", "majority right" if ok else "majority WRONG")
print(f"P(majority right) = {total:.3f}")</div>
  <div class="fx" data-lang="text">(1, 1, 1) prob 0.343 majority right
(1, 1, 0) prob 0.147 majority right
(1, 0, 1) prob 0.147 majority right
(1, 0, 0) prob 0.063 majority WRONG
(0, 1, 1) prob 0.147 majority right
(0, 1, 0) prob 0.063 majority WRONG
(0, 0, 1) prob 0.063 majority WRONG
(0, 0, 0) prob 0.027 majority WRONG
P(majority right) = 0.784</div>
  <h3>Any number of voters: the binomial sum</h3>
  <p>With n voters (n odd, so there are no ties), the number of right voters K follows a <strong>binomial distribution</strong>: P(K = k) = C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ, where C(n, k) ("n choose k") counts the ways to pick which k voters are right. The team is right when K ≥ (n + 1)/2:</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><strong>P(majority right) = Σ<sub>k = ⌈(n+1)/2⌉</sub><sup>n</sup> C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ</strong>. Check with n = 3: k = 2 gives C(3,2)·0.49·0.3 = 3 × 0.147 = 0.441; k = 3 gives 0.343; total 0.784, matching the table.</p>
  </div>
  <div class="fx" data-lang="py">from math import comb
def majority_right(n, p):
    need = n // 2 + 1                       # votes needed for a strict majority (n odd)
    return sum(comb(n, k) * p**k * (1 - p)**(n - k) for k in range(need, n + 1))
print("  n   p=0.55  p=0.70  p=0.45")
for n in [1, 3, 5, 11, 25, 101, 1001]:
    print(f"{n:4d}  {majority_right(n, 0.55):.3f}   {majority_right(n, 0.70):.3f}   {majority_right(n, 0.45):.3f}")</div>
  <div class="fx" data-lang="text">  n   p=0.55  p=0.70  p=0.45
   1  0.550   0.700   0.450
   3  0.575   0.784   0.425
   5  0.593   0.837   0.407
  11  0.633   0.922   0.367
  25  0.694   0.983   0.306
 101  0.844   1.000   0.156
1001  0.999   1.000   0.001</div>
  <p>Three columns, three lessons. With p = 0.70 the team is 98% right by 25 voters. With p = 0.55, barely better than a coin, the team still climbs, slowly: 0.69 at 25 voters, 0.84 at 101, 0.999 at 1001. With p = 0.45, slightly <em>worse</em> than a coin, adding voters makes the team worse and worse, down to 0.001: the majority reliably lands on the wrong answer.</p>
  <h3>Condorcet's jury theorem</h3>
  <div class="callout def"><span class="label">Theorem (Condorcet, 1785)</span>
    <p>If n voters decide independently, each is right with the same probability p, and the team uses majority vote, then: if p &gt; 0.5, the probability that the majority is right increases with n and tends to 1; if p &lt; 0.5, it decreases with n and tends to 0; if p = 0.5, it stays 0.5.</p>
  </div>
  <p>Why it tends to 1, in plain words: the share of right voters K/n settles near p as n grows (the law of large numbers). If p = 0.55, the share settles near 55%, which is above the 50% line, so the majority is right. The bigger n is, the less room the share has to wander below 50% by bad luck.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A panchayat of village elders deciding which well will run dry first. Each elder is only a bit better than guessing, but if they each walk to the wells and judge on their own, a large panchayat's majority is almost never wrong. If they all just repeat what the loudest elder said, the panchayat is exactly as good as that one elder.</p>
  </div>
  <h3>What breaks it: voters that copy each other</h3>
  <p>The theorem needs <strong>independence</strong>. Real models trained on the same data are never independent: they see the same rows and find the same strong column. The simulation keeps every voter 70% right on its own, but lets each voter copy a single "leader" opinion with some probability.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
trials, n, p = 100_000, 25, 0.70
leader = rng.random((trials, 1)) &lt; p                    # one "loud" opinion, right 70% of the time
for copy in [0.0, 0.2, 0.5, 0.8, 1.0]:
    own = rng.random((trials, n)) &lt; p                   # each voter's own opinion
    copies = rng.random((trials, n)) &lt; copy             # does this voter copy the leader?
    votes = np.where(copies, leader, own)               # True = voted for the right answer
    each = votes.mean()
    team = (votes.sum(axis=1) &gt; n // 2).mean()
    print(f"copy prob {copy:.1f}: each voter right {each:.3f}  majority of 25 right {team:.3f}")</div>
  <div class="fx" data-lang="text">copy prob 0.0: each voter right 0.700  majority of 25 right 0.982
copy prob 0.2: each voter right 0.700  majority of 25 right 0.916
copy prob 0.5: each voter right 0.700  majority of 25 right 0.719
copy prob 0.8: each voter right 0.700  majority of 25 right 0.701
copy prob 1.0: each voter right 0.701  majority of 25 right 0.701</div>
  <p>Every voter is still exactly 70% right, yet the team falls from 0.98 to 0.72 when voters copy the leader half the time, and to 0.70 (no gain at all) when they copy 80% of the time. The members' own accuracy did not change; only their <em>independence</em> did. That is the single most important lesson of this note.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not quote "Condorcet says 101 models give 100% accuracy". The theorem's two assumptions, independent errors and p &gt; 0.5 on <em>every</em> case, never hold for real models. Real errors are correlated, and some customers are hard for every model (p &lt; 0.5 on those rows), so the majority stays wrong on them however many members you add.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Voting is about yes/no answers. Many ensembles average <em>numbers</em> instead: house prices, or probabilities. We need the same "how much does the team gain" answer for averages, including what happens when members are correlated.</div>

  <h2 id="ens-avg"><span class="num">03</span>The Maths of Averaging</h2>
  <h3>The laddoo jar</h3>
  <p>At a mela there is a jar of laddoos and a prize for the closest guess. The true count is 500. One person's guess is off by about 100 either way. The simulation compares one guess, the average of 100 people who guess on their own, and the average of 100 people who mostly copy one loud friend (80% of each guess is the friend's mistake).</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
true = 500
one = true + rng.normal(0, 100, 10_000)                          # one person's guess, 10k trials
avg = true + rng.normal(0, 100, (10_000, 100)).mean(1)            # mean of 100 independent guesses
friend = rng.normal(0, 100, (10_000, 1))                          # shared mistake
copy = true + (0.8*friend + 0.2*rng.normal(0, 100, (10_000, 100))).mean(1)
for n, g in [("one guess", one), ("avg of 100 independent", avg), ("avg of 100 copiers", copy)]:
    print(f"{n:24s} typical error {np.abs(g - true).mean():5.1f}")</div>
  <div class="fx" data-lang="text">one guess                typical error  80.0
avg of 100 independent   typical error   8.0
avg of 100 copiers       typical error  64.5</div>
  <p>Independent guessers: error falls 10× (from 80 to 8). Copiers: error barely moves (80 to 64.5). Why exactly 10×, and why do copiers stay stuck? The variance formula answers both.</p>
  <h3>Deriving Var(average) step by step</h3>
  <p>Let X₁, …, Xₙ be the errors of n models on the same input. Assume each has variance σ² (same spread), and every pair has correlation ρ (rho), so the covariance of any pair is Cov(Xᵢ, Xⱼ) = ρσ². The team's error is the average X̄ = (X₁ + … + Xₙ)/n.</p>
  <ol>
    <li>Pull the 1/n out of the variance. Variance scales by the square of a constant: Var(X̄) = (1/n²) · Var(X₁ + … + Xₙ).</li>
    <li>Variance of a sum = sum of all variances + sum of all covariances between different pairs: Var(ΣXᵢ) = Σᵢ Var(Xᵢ) + Σ<sub>i≠j</sub> Cov(Xᵢ, Xⱼ).</li>
    <li>There are n variance terms, each σ², giving nσ². There are n(n − 1) ordered pairs i ≠ j, each ρσ², giving n(n − 1)ρσ².</li>
    <li>So Var(X̄) = (1/n²) [nσ² + n(n − 1)ρσ²] = σ²/n + (n − 1)ρσ²/n.</li>
    <li>Rearrange: σ²/n + ρσ² − ρσ²/n = <strong>ρσ² + (1 − ρ)σ²/n</strong>.</li>
  </ol>
  <div class="callout def"><span class="label">Formula</span>
    <p><strong>Var(average of n models) = ρσ² + (1 − ρ)σ²/n</strong>, where σ² is one model's variance and ρ the average pairwise correlation of their errors. The first term does not depend on n: it is a <strong>floor</strong>. Only the second term shrinks as you add models.</p>
  </div>
  <p>Worked numbers with σ² = 1 (so the answer is "share of one model's variance that is left"):</p>
  <table class="tbl">
    <tr><th>ρ (how alike)</th><th>n = 1</th><th>n = 5</th><th>n = 25</th><th>n → ∞ (floor ρσ²)</th></tr>
    <tr><td>0 (independent)</td><td>1</td><td>0 + 1/5 = 0.200</td><td>1/25 = 0.040</td><td>0</td></tr>
    <tr><td>0.3</td><td>1</td><td>0.3 + 0.7/5 = 0.440</td><td>0.3 + 0.7/25 = 0.328</td><td>0.3</td></tr>
    <tr><td>0.7</td><td>1</td><td>0.7 + 0.3/5 = 0.760</td><td>0.7 + 0.3/25 = 0.712</td><td>0.7</td></tr>
    <tr><td>1 (identical)</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
  </table>
  <p>Back to the jar (measure in units of 100 laddoos, so one guess has σ² = 1; the "typical error" printed is the mean absolute error, which for a bell curve is about 0.8 × the standard deviation). 100 independent guessers (ρ = 0): variance 1/100, standard deviation 0.1, typical error 0.8 × 10 = 8. That is the 80 → 8. Each copier's guess is 0.8 × (friend's mistake) + 0.2 × (own mistake), so its variance is 0.8² + 0.2² = 0.68, and any two copiers share the 0.8² = 0.64 part: ρ = 0.64/0.68 ≈ 0.94. The formula gives 0.94 × 0.68 + 0.06 × 0.68/100 ≈ 0.640, a standard deviation of 0.80 (80 laddoos) and a typical error of 0.8 × 80 ≈ 64: exactly the 64.5 the simulation printed. The next simulation checks the formula directly.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
def var_of_mean(n, rho, trials=200_000):
    shared = rng.normal(size=(trials, 1))               # the part every model shares
    own = rng.normal(size=(trials, n))                  # each model's private part
    errs = np.sqrt(rho) * shared + np.sqrt(1 - rho) * own   # each column: variance 1, pairwise corr rho
    return errs.mean(axis=1).var()
print(" rho   n   simulated  formula rho+(1-rho)/n")
for rho in [0.0, 0.3, 0.7]:
    for n in [1, 5, 25]:
        print(f"{rho:4.1f} {n:3d}   {var_of_mean(n, rho):.3f}      {rho + (1 - rho) / n:.3f}")</div>
  <div class="fx" data-lang="text"> rho   n   simulated  formula rho+(1-rho)/n
 0.0   1   1.003      1.000
 0.0   5   0.200      0.200
 0.0  25   0.040      0.040
 0.3   1   0.999      1.000
 0.3   5   0.438      0.440
 0.3  25   0.328      0.328
 0.7   1   1.003      1.000
 0.7   5   0.761      0.760
 0.7  25   0.717      0.712</div>
  <p>Simulated and formula agree to the second decimal in every row. Look at ρ = 0.7: going from 5 to 25 models only moves 0.761 to 0.717. When members are alike, extra members are almost useless; the way forward is to make them less alike. That is exactly what <a class="xref" data-note="ml_rf">Random Forest</a> (random columns per split) and <a class="xref" data-note="ml_extratrees">Extra Trees</a> (random cut-offs) do: they lower ρ, even if each tree gets a little worse.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Two levers, two terms. <strong>n</strong> (more members) only attacks (1 − ρ)σ²/n, and that term is already small after a few dozen members. <strong>ρ</strong> (less alike members) attacks the floor. This is why "add more trees" stops helping after a few hundred, while "make trees more different" can still help.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The formula is about <em>variance</em>, the wobble of the prediction around its own average. It says nothing about <em>bias</em>, the gap between that average and the truth. If all members are off by +20 laddoos on average, the team is off by +20 too. The next section measures both.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Averaging shrinks variance and leaves bias alone. But boosting does not average; it adds models one after another. Does that change which error is removed? We need to measure bias and variance for each team design on the same problem.</div>

  <h2 id="ens-bv"><span class="num">04</span>Bias &amp; Variance per Ensemble Type</h2>
  <h3>A quick refresher</h3>
  <p>For a regression model f̂ trained on a random training set, the expected squared error at a point splits into three parts (see <a class="xref" data-note="ml_core">Core Concepts</a>):</p>
  <div class="callout def"><span class="label">Decomposition</span>
    <p><strong>E[(y − f̂(x))²] = bias² + variance + noise</strong>. <strong>Bias</strong> = (average prediction over many training sets) − (truth): a systematic miss. <strong>Variance</strong> = how much the prediction spreads across training sets. <strong>Noise</strong> = the randomness in y itself, which no model can remove.</p>
  </div>
  <h3>What averaging does to each part (by hand)</h3>
  <p>Suppose each member's average prediction at a point is truth + b (bias b). The team's average prediction is the average of the members' averages: (1/n)Σ(truth + b) = truth + b. <strong>Bias unchanged.</strong> The variance falls by the formula from section 03. So averaging (bagging) is only worth doing with members that have <em>low bias and high variance</em>: deep trees.</p>
  <p>Boosting is different. Its prediction is a <strong>sum</strong> F = h₁ + h₂ + … + h_M, where each new hₘ is fitted to what the current sum still gets wrong (details in <a class="xref" data-note="ml_boosting">How Boosting Works</a>). A sum of many simple step functions can draw a shape no single step can, so the <em>bias</em> falls. Boosting is worth doing with members that have <em>high bias and low variance</em>: stumps and shallow trees.</p>
  <h3>Measuring it</h3>
  <p>The code draws 60 different training sets of 150 points from the same source (y = sin x + noise with standard deviation 0.3), trains each model on each set, and then measures, on a grid of 300 x values, how far the average prediction is from sin x (bias²) and how much the 60 predictions spread (variance).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import BaggingRegressor, GradientBoostingRegressor
rng = np.random.default_rng(0)
f = lambda x: np.sin(x)                                  # the true pattern
xg = np.linspace(0, 6, 300).reshape(-1, 1)               # where we measure bias and variance
models = {
    "one deep tree":        lambda: DecisionTreeRegressor(),
    "bagging 50 deep trees": lambda: BaggingRegressor(DecisionTreeRegressor(), n_estimators=50, random_state=0),
    "one stump (depth 1)":  lambda: DecisionTreeRegressor(max_depth=1),
    "bagging 50 stumps":    lambda: BaggingRegressor(DecisionTreeRegressor(max_depth=1), n_estimators=50, random_state=0),
    "boosting 200 stumps":  lambda: GradientBoostingRegressor(max_depth=1, n_estimators=200, learning_rate=0.1),
}
for name, make in models.items():
    preds = []
    for t in range(60):                                  # 60 different training sets from the same source
        x = rng.uniform(0, 6, 150).reshape(-1, 1)
        y = f(x).ravel() + rng.normal(0, 0.3, 150)       # noise sd 0.3 -&gt; noise variance 0.09
        preds.append(make().fit(x, y).predict(xg))
    P = np.array(preds)                                  # 60 x 300
    bias2 = np.mean((P.mean(0) - f(xg).ravel()) ** 2)    # average model vs truth
    var = np.mean(P.var(0))                              # spread across training sets
    print(f"{name:22s} bias^2 {bias2:.4f}  variance {var:.4f}  bias^2+var {bias2 + var:.4f}")</div>
  <div class="fx" data-lang="text">one deep tree          bias^2 0.0014  variance 0.0897  bias^2+var 0.0910
bagging 50 deep trees  bias^2 0.0010  variance 0.0432  bias^2+var 0.0442
one stump (depth 1)    bias^2 0.0632  variance 0.0318  bias^2+var 0.0950
bagging 50 stumps      bias^2 0.0630  variance 0.0125  bias^2+var 0.0755
boosting 200 stumps    bias^2 0.0012  variance 0.0121  bias^2+var 0.0133</div>
  <table class="tbl">
    <tr><th>Model</th><th>bias²</th><th>variance</th><th>What happened</th></tr>
    <tr><td>One deep tree</td><td>0.0014 (tiny)</td><td>0.0897 (big)</td><td>Fits every noisy point; very shaky</td></tr>
    <tr><td>Bagging 50 deep trees</td><td>0.0010</td><td>0.0432 (halved)</td><td>Same low bias, variance cut by the average</td></tr>
    <tr><td>One stump</td><td>0.0632 (big)</td><td>0.0318</td><td>One step cannot draw a sine wave</td></tr>
    <tr><td>Bagging 50 stumps</td><td>0.0630 (unchanged)</td><td>0.0125</td><td>Averaging cannot fix a shared miss</td></tr>
    <tr><td>Boosting 200 stumps</td><td>0.0012 (fixed!)</td><td>0.0121</td><td>Adding steps draws the curve; best total</td></tr>
  </table>
  <p>The table is the whole bias-variance story of ensembles in five rows. Bagging stumps lowered their variance but their bias stayed at 0.063, so the total stayed bad. Boosting the very same stumps cut the bias 50× and gave the lowest total error of all. Bagging deep trees halved their variance, but could not go lower because bagged trees are correlated (the ρσ² floor; the <a class="xref" data-note="ml_bagging">Bagging</a> note measures ρ ≈ 0.46 for exactly this setup).</p>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Average strong-but-shaky models; add up weak-but-steady models. <strong>Bagging / Random Forest</strong>: deep trees, attack variance. <strong>Boosting</strong>: shallow trees, attack bias (and its learning rate and early stopping keep variance in check). <strong>Stacking / voting</strong>: members are already good; the blend removes whatever errors they do not share, a bit of both.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Boosting reduces bias, so it cannot overfit" is wrong. Every boosting round adds flexibility; with enough rounds a booster memorises noise and its variance climbs. That is why boosters need a learning rate and early stopping (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Both formulas so far say the gain depends on how <em>different</em> the members are. We need an exact statement of that trade-off (accuracy of members vs their disagreement), and practical ways to create and measure the differences.</div>

  <h2 id="ens-div"><span class="num">05</span>Diversity: Where the Gain Comes From</h2>
  <h3>The ambiguity decomposition, worked by hand</h3>
  <p>For averaging ensembles under squared error, there is an exact identity (Krogh &amp; Vedelsby, 1995). Three models guess a house price whose truth is y = 10 (lakh rupees): f₁ = 8, f₂ = 11, f₃ = 14. The team's guess is the average f̄ = (8 + 11 + 14)/3 = 11.</p>
  <table class="tbl">
    <tr><th>Model</th><th>Guess fᵢ</th><th>Own error (fᵢ − y)²</th><th>Disagreement with team (fᵢ − f̄)²</th></tr>
    <tr><td>1</td><td>8</td><td>(8 − 10)² = 4</td><td>(8 − 11)² = 9</td></tr>
    <tr><td>2</td><td>11</td><td>(11 − 10)² = 1</td><td>(11 − 11)² = 0</td></tr>
    <tr><td>3</td><td>14</td><td>(14 − 10)² = 16</td><td>(14 − 11)² = 9</td></tr>
    <tr><td><b>Average</b></td><td>f̄ = 11</td><td>21/3 = <b>7</b></td><td>18/3 = <b>6</b> (ambiguity)</td></tr>
  </table>
  <p>Team error: (11 − 10)² = 1. And 7 − 6 = 1. Not a coincidence:</p>
  <div class="callout def"><span class="label">Ambiguity decomposition</span>
    <p><strong>(f̄ − y)² = average of (fᵢ − y)² − average of (fᵢ − f̄)²</strong>. Team error = average member error − average disagreement ("ambiguity"). Proof: write fᵢ − y = (fᵢ − f̄) + (f̄ − y), square, and average over i. The cross term is 2(f̄ − y) × average(fᵢ − f̄) = 0, because deviations from an average always sum to zero.</p>
  </div>
  <div class="fx" data-lang="py">import numpy as np
y = 10.0
preds = np.array([8.0, 11.0, 14.0])                      # three models' guesses for one house
ens = preds.mean()
ens_err = (ens - y) ** 2
avg_err = np.mean((preds - y) ** 2)                      # average error of the members
ambiguity = np.mean((preds - ens) ** 2)                  # how much members disagree with the team
print(f"ensemble {ens}, ensemble error {ens_err}")
print(f"avg member error {avg_err:.3f} - ambiguity {ambiguity:.3f} = {avg_err - ambiguity:.3f}")</div>
  <div class="fx" data-lang="text">ensemble 11.0, ensemble error 1.0
avg member error 7.000 - ambiguity 6.000 = 1.000</div>
  <p>Two things follow. First, since ambiguity is never negative, an averaged team is <strong>never worse than its average member</strong>. Second, there is a tug of war: you want members that are individually accurate (small first term) and that disagree a lot (big second term). Making members more random usually raises disagreement but also raises their own error. Every bagging-family method is a different bet on that trade-off.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Never worse than the <em>average</em> member" is not "never worse than the <em>best</em> member". If one member is far better than the rest, the average of the team can be worse than that one member. Section 08 shows it on real data.</p>
  </div>
  <h3>Sources of diversity</h3>
  <p>Where can differences between members come from, when there is only one training table?</p>
  <table class="tbl">
    <tr><th>Source</th><th>How</th><th>Used by</th></tr>
    <tr><td>Different rows</td><td>Bootstrap samples (with replacement) or subsamples (without)</td><td><a class="xref" data-note="ml_bagging">Bagging</a>, pasting, Random Forest, stochastic gradient boosting</td></tr>
    <tr><td>Different columns</td><td>Each member, or each split, sees a random subset of features</td><td>Random subspaces, <a class="xref" data-note="ml_rf">Random Forest</a> (<code>max_features</code>), XGBoost / LightGBM column sampling</td></tr>
    <tr><td>Random choices inside the algorithm</td><td>Random thresholds, random initial weights, different seeds</td><td><a class="xref" data-note="ml_extratrees">Extra Trees</a>, neural-network ensembles</td></tr>
    <tr><td>Different algorithms</td><td>Trees + kNN + linear models + boosters</td><td><a class="xref" data-note="ml_stacking">Voting, stacking</a> (heterogeneous)</td></tr>
    <tr><td>Different hyperparameters</td><td>Same algorithm, different depth / regularisation</td><td>Stacking, Kaggle blends</td></tr>
    <tr><td>Different emphasis on rows</td><td>Each new member is trained to focus on what the team gets wrong</td><td><a class="xref" data-note="ml_adaboost">AdaBoost</a> (weights), <a class="xref" data-note="ml_gbm">Gradient Boosting</a> (residuals)</td></tr>
    <tr><td>Different views of the target</td><td>Split a multi-class problem into many binary ones (one-vs-rest, error-correcting output codes)</td><td>Multi-class wrappers</td></tr>
  </table>
  <h3>Measuring diversity on the churn data</h3>
  <p>Two practical measures for classifiers: the <strong>disagreement rate</strong> (share of rows where two members give different labels) and the <strong>error correlation</strong> (correlation between "member i is wrong" and "member j is wrong", across rows; 1 = always wrong together). The code builds four teams of five members and measures both.</p>
  <div class="fx" data-lang="py">from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
rng = np.random.default_rng(0)
def boot(m):                                             # fit m on a bootstrap sample
    i = rng.integers(0, len(Xtr), len(Xtr))
    return m.fit(Xtr.iloc[i], ytr[i])
teams = {
    "5 copies of one tree": [DecisionTreeClassifier(random_state=0).fit(Xtr, ytr)] * 5,
    "5 trees, new seed each": [DecisionTreeClassifier(random_state=s).fit(Xtr, ytr) for s in range(5)],
    "5 trees, bootstrap rows": [boot(DecisionTreeClassifier(random_state=s)) for s in range(5)],
    "5 different algorithms": [DecisionTreeClassifier(random_state=0).fit(Xtr, ytr),
        make_pipeline(StandardScaler(), KNeighborsClassifier(15)).fit(Xtr, ytr),
        make_pipeline(StandardScaler(), LogisticRegression()).fit(Xtr, ytr),
        GaussianNB().fit(Xtr, ytr),
        HistGradientBoostingClassifier(random_state=0).fit(Xtr, ytr)],
}
for name, team in teams.items():
    P = np.array([m.predict(Xva) for m in team])         # 5 x 3000 predicted labels
    E = (P != yva).astype(float)                         # 1 where that member is wrong
    pairs = [(i, j) for i in range(5) for j in range(i)]
    dis = np.mean([np.mean(P[i] != P[j]) for i, j in pairs])
    rho = np.mean([np.corrcoef(E[i], E[j])[0, 1] if E[i].std() * E[j].std() &gt; 0 else 1.0 for i, j in pairs])
    each = 1 - E.mean(1)
    vote = np.mean((P.mean(0) &gt; 0.5) == yva)
    print(f"{name:24s} members {each.min():.3f}-{each.max():.3f}  disagree {dis:5.1%}  error corr {rho:.2f}  vote {vote:.3f}")</div>
  <div class="fx" data-lang="text">5 copies of one tree     members 0.773-0.773  disagree  0.0%  error corr 1.00  vote 0.773
5 trees, new seed each   members 0.770-0.777  disagree  6.0%  error corr 0.83  vote 0.778
5 trees, bootstrap rows  members 0.760-0.780  disagree 27.0%  error corr 0.24  vote 0.837
5 different algorithms   members 0.581-0.864  disagree 30.4%  error corr 0.28  vote 0.808</div>
  <ul>
    <li><strong>5 copies of one tree</strong>: disagreement 0%, error correlation 1.00, vote 0.773 = one tree. No diversity, no gain.</li>
    <li><strong>5 trees, new seed each</strong>: a sklearn tree's seed only breaks ties between equally good splits, so the trees are near copies: 6% disagreement, correlation 0.83, vote 0.778 (+0.005).</li>
    <li><strong>5 trees on bootstrap rows</strong>: 27% disagreement, error correlation only 0.24, vote 0.837 (+0.06). Same algorithm, different data: real diversity.</li>
    <li><strong>5 different algorithms</strong>: the most disagreement (30%), but members range from 0.581 (naive Bayes) to 0.864 (boosting), and the vote, 0.808, is <em>below</em> the best member. Diversity from weak members is not free.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Good diversity = members that are each about equally good and wrong on different rows. Bootstrap trees are the textbook case. A heterogeneous team only helps when its members are of similar strength, or when the combiner learns to trust the strong ones (that is what stacking adds).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We now know what makes a team work. Next: the standard designs people actually use, organised into one map, so each later note has a clear place.</div>

  <h2 id="ens-tax"><span class="num">06</span>The Taxonomy of Ensembles</h2>
  <h3>Four designs</h3>
  <figure class="viz"><svg viewBox="0 0 680 250" width="680">
<defs><marker id="ens-tx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="85" y="18" text-anchor="middle" font-weight="700" font-size="13">Bagging</text>
<text x="85" y="33" text-anchor="middle" class="tm" font-size="10">parallel · 1 algorithm</text>
<rect x="20" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/><rect x="65" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/><rect x="110" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/>
<text x="40" y="62" text-anchor="middle" font-size="10">h₁</text><text x="85" y="62" text-anchor="middle" font-size="10">h₂</text><text x="130" y="62" text-anchor="middle" font-size="10">h₃</text>
<line x1="40" y1="71" x2="80" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="85" y1="71" x2="85" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="130" y1="71" x2="90" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/>
<rect x="45" y="120" width="80" height="28" rx="6" class="fg sg" fill-opacity="0.3"/><text x="85" y="138" text-anchor="middle" font-size="11">average / vote</text>
<text x="85" y="172" text-anchor="middle" class="tb" font-size="11">each on a bootstrap</text><text x="85" y="186" text-anchor="middle" class="tb" font-size="11">sample · cuts variance</text>
<text x="255" y="18" text-anchor="middle" font-weight="700" font-size="13">Boosting</text>
<text x="255" y="33" text-anchor="middle" class="tm" font-size="10">sequential · 1 algo</text>
<rect x="190" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/><rect x="235" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/><rect x="280" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/>
<text x="210" y="62" text-anchor="middle" font-size="10">h₁</text><text x="255" y="62" text-anchor="middle" font-size="10">h₂</text><text x="300" y="62" text-anchor="middle" font-size="10">h₃</text>
<line x1="230" y1="58" x2="234" y2="58" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="275" y1="58" x2="279" y2="58" stroke="currentColor" marker-end="url(#ens-tx)"/>
<line x1="255" y1="71" x2="255" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/>
<rect x="205" y="120" width="100" height="28" rx="6" class="fg sg" fill-opacity="0.3"/><text x="255" y="138" text-anchor="middle" font-size="11">weighted sum</text>
<text x="255" y="172" text-anchor="middle" class="tb" font-size="11">each fixes the team's</text><text x="255" y="186" text-anchor="middle" class="tb" font-size="11">errors · cuts bias</text>
<text x="425" y="18" text-anchor="middle" font-weight="700" font-size="13">Voting</text>
<text x="425" y="33" text-anchor="middle" class="tm" font-size="10">parallel · mixed</text>
<rect x="360" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/><rect x="405" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/><rect x="450" y="45" width="40" height="26" rx="5" class="fv" stroke="currentColor"/>
<text x="380" y="62" text-anchor="middle" font-size="10">RF</text><text x="425" y="62" text-anchor="middle" font-size="10">GBM</text><text x="470" y="62" text-anchor="middle" font-size="10">kNN</text>
<line x1="380" y1="71" x2="420" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="425" y1="71" x2="425" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="470" y1="71" x2="430" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/>
<rect x="375" y="120" width="100" height="28" rx="6" class="fg sg" fill-opacity="0.3"/><text x="425" y="138" text-anchor="middle" font-size="11">fixed rule</text>
<text x="425" y="172" text-anchor="middle" class="tb" font-size="11">hard / soft / weighted</text><text x="425" y="186" text-anchor="middle" class="tb" font-size="11">no learning in combiner</text>
<text x="595" y="18" text-anchor="middle" font-weight="700" font-size="13">Stacking</text>
<text x="595" y="33" text-anchor="middle" class="tm" font-size="10">parallel + meta</text>
<rect x="530" y="45" width="40" height="26" rx="5" class="fb sb" fill-opacity="0.3"/><rect x="575" y="45" width="40" height="26" rx="5" class="ft st" fill-opacity="0.3"/><rect x="620" y="45" width="40" height="26" rx="5" class="fv" stroke="currentColor"/>
<text x="550" y="62" text-anchor="middle" font-size="10">RF</text><text x="595" y="62" text-anchor="middle" font-size="10">GBM</text><text x="640" y="62" text-anchor="middle" font-size="10">kNN</text>
<line x1="550" y1="71" x2="590" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="595" y1="71" x2="595" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/><line x1="640" y1="71" x2="600" y2="118" stroke="currentColor" marker-end="url(#ens-tx)"/>
<rect x="540" y="120" width="110" height="28" rx="6" class="fr sr" fill-opacity="0.3"/><text x="595" y="138" text-anchor="middle" font-size="11">meta-model</text>
<text x="595" y="172" text-anchor="middle" class="tb" font-size="11">learns whom to trust</text><text x="595" y="186" text-anchor="middle" class="tb" font-size="11">from out-of-fold preds</text>
<rect x="10" y="205" width="320" height="34" rx="6" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="170" y="226" text-anchor="middle" class="tm" font-size="11.5">homogeneous: one algorithm, many copies</text>
<rect x="350" y="205" width="320" height="34" rx="6" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="510" y="226" text-anchor="middle" class="tm" font-size="11.5">heterogeneous: different algorithms</text>
</svg><figcaption>The four standard designs. Left half: one algorithm copied many times (homogeneous). Right half: different algorithms combined (heterogeneous). Arrows between members = sequential (boosting only).</figcaption></figure>
  <ul>
    <li><strong>Bagging</strong> (bootstrap aggregating): many copies of one algorithm, each on its own bootstrap sample, trained <em>in parallel</em> and averaged. Children: Random Forest, Extra Trees. Note: <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a>.</li>
    <li><strong>Boosting</strong>: many copies of one weak algorithm, trained <em>in sequence</em>; each new member is trained on what the team so far gets wrong; the output is a weighted sum. Children: AdaBoost, Gradient Boosting, XGBoost, LightGBM, CatBoost. Note: <a class="xref" data-note="ml_boosting">How Boosting Works</a>.</li>
    <li><strong>Voting</strong> (also called averaging or a committee): a <em>fixed</em> rule over already-trained, usually different models. Nothing is learnt in the combiner except maybe hand-picked weights.</li>
    <li><strong>Stacking</strong> (stacked generalisation): a second-level <strong>meta-model</strong> is trained to combine the members' predictions. To avoid leakage it learns from out-of-fold predictions. Note: <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>.</li>
  </ul>
  <div class="callout def"><span class="label">Definitions</span>
    <p><strong>Homogeneous ensemble</strong>: all members use the same algorithm; diversity comes from data, features or randomness (bagging, RF, boosting). <strong>Heterogeneous ensemble</strong>: members use different algorithms; diversity comes from their different ways of seeing the data (voting, stacking). <strong>Parallel</strong> designs train members independently (easy to spread over CPU cores); <strong>sequential</strong> designs need member m − 1 before member m.</p>
  </div>
  <h3>Hard vs soft voting in one example</h3>
  <p>Three classifiers give P(churn) = 0.9, 0.4 and 0.45 for one customer.</p>
  <ul>
    <li><strong>Hard voting</strong> counts labels: 0.9 → yes, 0.4 → no, 0.45 → no. Two "no" beat one "yes": predict <em>stay</em>.</li>
    <li><strong>Soft voting</strong> averages probabilities: (0.9 + 0.4 + 0.45)/3 = 0.583 &gt; 0.5: predict <em>churn</em>.</li>
  </ul>
  <p>They disagree because hard voting throws away confidence: the two "no" voters were barely sure (0.4, 0.45), the "yes" voter was very sure (0.9). Soft voting usually wins when the members' probabilities are sensible. Weighted versions, worked tables and the full sklearn API are in <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Bagging is a panel of judges who each watched a different recording of the match and then average their scores. Boosting is a relay of tutors: each one teaches only the chapters the student still fails. Voting is a show of hands among different experts. Stacking is a head judge who has learnt from past cases which expert to trust for what.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> A map is useful only if the designs really behave as described. Let us run one member of each family on the same churn data and compare accuracy and training time.</div>

  <h2 id="ens-run"><span class="num">07</span>Every Design on One Dataset</h2>
  <p>One single tree, two parallel bagging-family teams, one boosting team, and two blends of different algorithms (a random forest, a booster and a k-nearest-neighbours model). Same rows, same test set.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import (BaggingClassifier, HistGradientBoostingClassifier,
                              VotingClassifier, StackingClassifier)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
knn = make_pipeline(StandardScaler(), KNeighborsClassifier(15))
rf = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)
hgb = HistGradientBoostingClassifier(random_state=0)
models = {
    "single deep tree      (none)":       DecisionTreeClassifier(random_state=0),
    "bagging 100 trees     (parallel)":   BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, n_jobs=-1, random_state=0),
    "random forest 300     (parallel)":   rf,
    "hist grad. boosting   (sequential)": hgb,
    "soft vote rf+hgb+knn  (voting)":     VotingClassifier([("rf", rf), ("hgb", hgb), ("knn", knn)], voting="soft"),
    "stack rf+hgb+knn -&gt; LR (meta)":      StackingClassifier([("rf", rf), ("hgb", hgb), ("knn", knn)],
                                                             final_estimator=LogisticRegression(), cv=5),
}
for name, m in models.items():
    t0 = time.time(); m.fit(Xtr, ytr); sec = time.time() - t0
    print(f"{name:36s} test acc {m.score(Xte, yte):.3f}   fit {sec:5.1f}s")</div>
  <div class="fx" data-lang="text">single deep tree      (none)         test acc 0.778   fit   0.6s
bagging 100 trees     (parallel)     test acc 0.870   fit  52.0s
random forest 300     (parallel)     test acc 0.877   fit  21.3s
hist grad. boosting   (sequential)   test acc 0.862   fit   0.9s
soft vote rf+hgb+knn  (voting)       test acc 0.866   fit  21.3s
stack rf+hgb+knn -&gt; LR (meta)        test acc 0.877   fit 114.6s</div>
  <p>Every ensemble beats the single tree (0.778) by 8–10 points. The two parallel bagging-family teams lead (0.870, 0.877); the default histogram booster is close (0.862; tuned boosters reach the same level, see <a class="xref" data-note="ml_lightgbm">LightGBM</a>). The two heterogeneous blends show the subtle part: the soft vote (0.866) is <em>worse</em> than the forest alone, because the weaker kNN member drags the plain average down, while the stack (0.877) learns to lean on the forest and matches it, but does not beat it. Note the fit times: the stack (115 s) retrains every member 5 + 1 times, about 5× the forest. These times come from a shared 4-core machine with other jobs running, so read only the order of magnitude.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Times here come from a shared 4-core machine and change from run to run; compare them as "seconds vs minutes", not to the decimal. And never pick an ensemble on test accuracy: choose on validation or cross-validation, then report test once (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Ensembles won here. But the theory also predicted cases where they should <em>not</em> help. A careful engineer must know those cases before spending the extra compute.</div>

  <h2 id="ens-fail"><span class="num">08</span>When Ensembles Do Not Help</h2>
  <p>Each failure below follows directly from a formula earlier in the note.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier, HistGradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
lr = make_pipeline(StandardScaler(), LogisticRegression())
stump = DecisionTreeClassifier(max_depth=1)
pairs = [("logistic regression", lr), ("stump (depth 1)", stump)]
for name, m in pairs:                       # 1) bagging a stable / high-bias model
    one = m.fit(Xtr, ytr).score(Xte, yte)
    bag = BaggingClassifier(m, n_estimators=50, n_jobs=-1, random_state=0).fit(Xtr, ytr).score(Xte, yte)
    print(f"{name:20s} alone {one:.3f}   bagged x50 {bag:.3f}")
hgb = HistGradientBoostingClassifier(random_state=0)
alone = hgb.fit(Xtr, ytr).score(Xte, yte)   # 2) one strong member + two weak ones
team = VotingClassifier([("hgb", hgb), ("nb", GaussianNB()), ("lr", lr)], voting="soft").fit(Xtr, ytr)
print(f"boosting alone {alone:.3f}   soft vote boosting+NB+LR {team.score(Xte, yte):.3f}")
for n, m in team.named_estimators_.items():
    print(f"   member {n:4s} test acc {m.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">logistic regression  alone 0.596   bagged x50 0.594
stump (depth 1)      alone 0.609   bagged x50 0.609
boosting alone 0.862   soft vote boosting+NB+LR 0.824
   member hgb  test acc 0.862
   member nb   test acc 0.596
   member lr   test acc 0.596</div>
  <p>Three failures in one run. Bagging logistic regression: 0.596 → 0.594, no gain (a stable, high-bias model). Bagging stumps: 0.609 → 0.609, no gain (high bias; every stump makes the same cut). Adding two weak members to a good booster in a plain soft vote: 0.862 → 0.824, a clear <em>loss</em>, because naive Bayes and logistic regression (0.596 each) push their confident but wrong probabilities into the average.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Why the team does not help</th><th>What to do instead</th></tr>
    <tr><td>Stable, low-variance members (linear / logistic regression, large-k kNN, naive Bayes)</td><td>Bootstrap samples give nearly the same model; σ² is already small, ρ ≈ 1</td><td>Improve features or switch to a more flexible model</td></tr>
    <tr><td>High-bias members averaged (bagged stumps)</td><td>Averaging leaves bias unchanged (section 04)</td><td>Boost them instead, or use deeper members</td></tr>
    <tr><td>Highly correlated members</td><td>The floor ρσ² dominates; more members add nothing</td><td>Inject randomness (rows, columns, thresholds) or mix algorithms</td></tr>
    <tr><td>One member much stronger than the rest, plain average</td><td>The weak members' errors are added to the strong one's</td><td>Drop the weak ones, weight by validation score, or stack</td></tr>
    <tr><td>Members worse than chance on some region</td><td>Condorcet with p &lt; 0.5: the majority gets more confidently wrong</td><td>Fix the data / features for that region; check per-segment metrics</td></tr>
    <tr><td>Shared blind spot (missing feature, label noise, distribution shift)</td><td>Every member misses the same thing: pure bias</td><td>New data or features; no combiner can invent missing information</td></tr>
    <tr><td>Very small data</td><td>Bootstrap samples are tiny and overlap heavily; stacking's meta-model has too few rows</td><td>Regularised single models, cross-validation for honest estimates</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>An ensemble cannot rescue a broken pipeline. If there is leakage, a wrong label, or a feature that will not exist at prediction time, every member learns the same broken signal, and the ensemble is confidently wrong.</p>
  </div>

  <h2 id="ens-cost"><span class="num">09</span>The Costs</h2>
  <p>An ensemble of n models costs about n times as much to train, store and run, and it can no longer be read like one tree. The code measures prediction latency for one customer at a time (what an online API sees) and the saved model size.</p>
  <div class="fx" data-lang="py">import pickle
from sklearn.ensemble import HistGradientBoostingClassifier, StackingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
rf = RandomForestClassifier(n_estimators=300, random_state=0, n_jobs=1)
hgb = HistGradientBoostingClassifier(random_state=0)
knn = make_pipeline(StandardScaler(), KNeighborsClassifier(15))
models = {"single tree": DecisionTreeClassifier(max_depth=8, random_state=0),
          "random forest 300": rf, "hist grad. boosting": hgb,
          "stack rf+hgb+knn": StackingClassifier([("rf", rf), ("hgb", hgb), ("knn", knn)],
                                                 final_estimator=LogisticRegression(), cv=5)}
one = Xte.iloc[[0]]
for name, m in models.items():
    m.fit(Xtr, ytr)
    t = []
    for _ in range(30):                                  # one customer at a time (online API)
        t0 = time.perf_counter(); m.predict_proba(one); t.append(time.perf_counter() - t0)
    size = len(pickle.dumps(m)) / 1e6
    print(f"{name:20s} 1-row latency {np.median(t)*1000:6.1f} ms   saved size {size:6.2f} MB")</div>
  <div class="fx" data-lang="text">single tree          1-row latency    1.2 ms   saved size   0.03 MB
random forest 300    1-row latency   48.2 ms   saved size  69.08 MB
hist grad. boosting  1-row latency    1.5 ms   saved size   0.39 MB
stack rf+hgb+knn     1-row latency   41.4 ms   saved size 140.61 MB</div>
  <p>The ensemble prices are steep. One depth-8 tree answers in about 1 ms and saves to 0.03 MB. The 300-tree forest takes about 48 ms per single-row request (sklearn walks the 300 trees one after another, with Python overhead per tree) and needs 69 MB, because each fully grown tree stores thousands of nodes. The histogram booster is the efficient ensemble: 1.5 ms and 0.39 MB, since its trees are small. The stack carries a forest, a booster, a kNN model (which stores all 12,000 training rows) and a meta-model: 141 MB, and a latency dominated by its forest (41 ms here; single-request timings on a shared machine jump by ±50%, so 41 vs 48 is noise). All that for no accuracy gain over the forest on this data (section 07).</p>
  <div class="cards">
    <div><b>Training time</b><p>n members (× k folds for stacking). Parallel designs spread over cores (<code>n_jobs=-1</code>); boosting rounds cannot.</p><small>Bagging / RF parallel; boosting sequential</small></div>
    <div><b>Latency</b><p>Every request runs every member. A 300-tree forest walks 300 root-to-leaf paths.</p><small>Matters for real-time APIs</small></div>
    <div><b>Memory &amp; size</b><p>Deep trees store thousands of nodes each; forests can reach hundreds of MB.</p><small>Limit depth / min_samples_leaf / members</small></div>
    <div><b>Interpretability</b><p>One tree is a readable rule list; 300 are not. You need importance and SHAP tools.</p><small><a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a></small></div>
    <div><b>Maintenance</b><p>More models to retrain, version, monitor and debug; stacking adds a pipeline of pipelines.</p><small><a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a></small></div>
  </div>
  <p>Ways to pay less: use fewer members (the curve flattens after a few hundred trees), cap depth, prefer histogram-based boosters (fast and small), prune members that add nothing, or <strong>distil</strong> the ensemble: train one small model to copy the ensemble's predictions.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Judging a model only by an offline accuracy table. A +0.3% accuracy gain that triples latency, or needs five models retrained every week, is often a bad trade in production. Write down the latency and size budget before you start blending.</p>
  </div>

  <h2 id="ens-cmp"><span class="num">10</span>Comparison Tables</h2>
  <h3>The four designs</h3>
  <table class="tbl">
    <tr><th></th><th>Bagging (RF, ET)</th><th>Boosting (AdaBoost, GBM, XGB, LGBM, CatBoost)</th><th>Voting</th><th>Stacking</th></tr>
    <tr><td>Members</td><td>Same algorithm, deep trees</td><td>Same algorithm, shallow trees</td><td>Different, already strong</td><td>Different, already strong</td></tr>
    <tr><td>Training</td><td>Parallel, independent</td><td>Sequential, each depends on the team so far</td><td>Parallel</td><td>Parallel + k-fold + meta-model</td></tr>
    <tr><td>Diversity from</td><td>Bootstrap rows, random features / thresholds</td><td>Reweighting / residuals</td><td>Different algorithms</td><td>Different algorithms</td></tr>
    <tr><td>Combination</td><td>Plain average / majority</td><td>Weighted sum (learnt)</td><td>Fixed rule (maybe weights)</td><td>Learnt meta-model</td></tr>
    <tr><td>Mainly reduces</td><td>Variance</td><td>Bias (then variance via shrinkage)</td><td>Variance of the blend</td><td>Both, a little</td></tr>
    <tr><td>Overfits by adding members?</td><td>No (curve flattens)</td><td>Yes, needs early stopping</td><td>No</td><td>Meta-model can, if it sees leaked preds</td></tr>
    <tr><td>Noise / outliers</td><td>Robust</td><td>Sensitive (chases hard rows)</td><td>Depends on members</td><td>Depends on members</td></tr>
    <tr><td>Typical gain on tables</td><td>Large over one tree</td><td>Often the best single family</td><td>Small over best member</td><td>Small over best member</td></tr>
  </table>
  <h3>Single model vs ensemble</h3>
  <table class="tbl">
    <tr><th></th><th>Single decision tree</th><th>Ensemble of trees</th></tr>
    <tr><td>Accuracy (churn test)</td><td>≈ 0.78</td><td>≈ 0.87–0.88</td></tr>
    <tr><td>Stability</td><td>Changes a lot with the sample</td><td>Stable</td></tr>
    <tr><td>Readability</td><td>Rules you can read aloud</td><td>Needs importance / SHAP</td></tr>
    <tr><td>Train / predict cost</td><td>1×</td><td>n× (parallel helps bagging)</td></tr>
    <tr><td>When to pick</td><td>Explanation is the product; tiny latency budget</td><td>Accuracy matters; a few ms per prediction is fine</td></tr>
  </table>

  <h2 id="ens-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: diversity forgotten</span>
    <p>Training ten copies of the same model on the same rows with the same settings. Their votes are identical. Diversity must come from somewhere: rows, columns, randomness, or algorithms.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: bagging the wrong learner</span>
    <p>Bagging logistic regression or stumps and expecting a jump. Bagging fixes variance; those models have little. Bag deep trees; boost shallow ones.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: averaging in a weak model</span>
    <p>Adding a much weaker model to a plain average because "more diversity is good". The ambiguity decomposition only promises "no worse than the average member", which can be far below the best member.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: quoting Condorcet literally</span>
    <p>The theorem assumes independent voters with p &gt; 0.5 everywhere. Real members are correlated and some rows are hard for all of them; gains flatten early.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: hard voting on good probabilities</span>
    <p>Hard voting discards confidence. If members output reasonable probabilities, soft voting is usually better; if they do not (an SVM without calibration), calibrate first or use hard voting.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: picking the ensemble on the test set</span>
    <p>Trying ten blends and reporting the best test score leaks the test set into model choice. Choose on validation / CV; touch test once.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ignoring cost</span>
    <p>Shipping a 5-model stack for +0.002 AUC into a 10 ms latency budget. Measure latency and size as part of model selection.</p>
  </div>

  <h2 id="ens-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an ensemble, and what two conditions make it better than its members?</summary><div class="qa-body">Several base models plus a rule that combines their outputs. It beats its members when (1) each member is better than chance and reasonably accurate, and (2) the members make different (weakly correlated) mistakes, so the errors cancel in the vote or average.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Three independent classifiers are each 70% accurate. What is the majority vote's accuracy? Show the working.</summary><div class="qa-body">P(all 3 right) = 0.7³ = 0.343. P(exactly 2 right) = 3 × 0.7² × 0.3 = 0.441. Sum = 0.784. In general P(majority right) = Σ<sub>k ≥ (n+1)/2</sub> C(n,k) pᵏ(1−p)ⁿ⁻ᵏ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>State Condorcet's jury theorem and its limits for ML.</summary><div class="qa-body">For n independent voters each right with probability p &gt; 0.5, the majority's accuracy rises with n and tends to 1 (with p &lt; 0.5 it tends to 0). Limits: ML members are trained on the same data, so their errors are correlated, and on hard rows p &lt; 0.5 for every member. Gains are real but flatten early.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the variance of the average of n models with variance σ² and pairwise correlation ρ.</summary><div class="qa-body">Var(X̄) = (1/n²)[Σ Var Xᵢ + Σ<sub>i≠j</sub> Cov] = (1/n²)[nσ² + n(n−1)ρσ²] = ρσ² + (1−ρ)σ²/n. More members shrink only the second term; the floor ρσ² falls only if the members become less correlated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>With ρ = 0.3 and σ² = 1, what is the variance of an average of 5 models? Of infinitely many?</summary><div class="qa-body">0.3 + 0.7/5 = 0.44. As n → ∞, 0.3 (the floor). Going from 5 to infinitely many members removes only 0.14 more; lowering ρ to 0.1 would do more.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does bagging use deep trees while boosting uses shallow ones?</summary><div class="qa-body">Averaging keeps bias and cuts variance, so its members should be low-bias, high-variance (deep trees). Boosting builds an additive model that reduces bias step by step, so its members should be high-bias, low-variance (stumps / shallow trees) to keep each step small and variance controlled. In our sine experiment bagged stumps kept bias² 0.063, boosted stumps reached 0.0012.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the ambiguity decomposition and what does it imply?</summary><div class="qa-body">For an averaged regressor under squared error: (f̄ − y)² = mean(fᵢ − y)² − mean(fᵢ − f̄)². Team error = average member error − average disagreement. Implications: the team is never worse than its average member, and the gain grows with disagreement, but more random members are often individually worse: an accuracy-diversity trade-off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name five sources of diversity and a method that uses each.</summary><div class="qa-body">Bootstrap rows (bagging), random feature subsets (random subspaces, Random Forest's max_features), random thresholds (Extra Trees), different algorithms (voting / stacking), reweighting or residual targets (AdaBoost / gradient boosting). Also different hyperparameters and seeds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hard vs soft voting: when do they disagree, and which is usually better?</summary><div class="qa-body">They disagree when a confident minority faces an unsure majority (0.9 vs 0.4 and 0.45: hard says no, soft average 0.583 says yes). Soft voting uses confidence and is usually better if the probabilities are reasonable; hard voting is the fallback when members have no (or badly calibrated) probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Homogeneous vs heterogeneous ensembles: give an example of each.</summary><div class="qa-body">Homogeneous: one algorithm many times with diversity from data or randomness (Random Forest, XGBoost). Heterogeneous: different algorithms (a soft vote or a stack of a forest, a booster and kNN).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You bag logistic regression 50 times and see no gain. Why?</summary><div class="qa-body">Logistic regression is a stable, low-variance model: each bootstrap sample gives almost the same coefficients, so members are nearly identical (ρ ≈ 1) and σ² is already small. Its error is mostly bias (a straight boundary on bent data), which averaging cannot fix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Adding naive Bayes and logistic regression to a gradient-boosting model in a soft vote made accuracy drop. Explain.</summary><div class="qa-body">The averaged team is only guaranteed to beat the average member, not the best. The weak members' confident wrong probabilities pull the average away from the booster's good ones. Fixes: drop them, weight by validation score, or stack so a meta-model learns to down-weight them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do Random Forest and Extra Trees relate to the ρσ² formula?</summary><div class="qa-body">Bagged trees are correlated because the strongest feature dominates every tree, so the floor ρσ² stays high. Random Forest lowers ρ by giving each split only a random subset of features; Extra Trees lowers it further with random thresholds. Each tree gets a little worse (σ² and bias up slightly) but the team improves because ρ falls.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does boosting need early stopping but bagging does not?</summary><div class="qa-body">Bagging averages independent members; adding more only reduces the (1−ρ)σ²/n term, so the error curve flattens and never turns up. Boosting adds members that fit the remaining errors, so after the signal is used up they start fitting noise and validation error rises. See <a class="xref" data-note="ml_gbm">Gradient Boosting</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the costs of an ensemble, and how can you reduce them?</summary><div class="qa-body">n× training (×k for stacking), n× prediction latency, larger model files, lost readability, more maintenance. Reduce with fewer members, shallower trees, histogram boosters, parallel training, pruning useless members, or distilling the ensemble into a single model.</div></details>
</main>
`
});
