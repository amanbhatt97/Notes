// notes/ml/ml_tree_explain.js — Feature Importance & SHAP
Object.assign(TOPIC_CONTENT, {
  "ml_tree_explain": `<main>
  <h1>Feature Importance &amp; SHAP</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>Feature Importance &amp; SHAP</span></div>
  <p class="lead">A random forest of 300 trees or a booster of 500 trees cannot be read aloud the way one small tree can. This note gives the "why" back. It covers every standard way to ask a tree model what it is looking at: impurity importance (MDI), permutation importance, drop-column importance, partial dependence and ICE curves, and SHAP values, which come from a 1950s idea in game theory. Every formula is worked by hand on tiny tables first, then checked against the libraries, then run on the same 20,000-row churn dataset used across this group. You will also see where each method lies to you: many-valued columns, twin columns, and the big one, explanation is not causation.</p>

  <h2 id="mte-fits" class="open"><span class="num">↖</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 600 324" width="600">
<line x1="300" y1="28" x2="300" y2="42" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="70" x2="300" y2="84" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="112" x2="116" y2="132" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="112" x2="330" y2="132" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="112" x2="530" y2="132" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="116" y1="160" x2="62" y2="180" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="114.0" y1="194" x2="122.0" y2="194" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="330" y1="160" x2="272" y2="180" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="317.0" y1="194" x2="324.0" y2="194" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="392" y1="208" x2="300" y2="228" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="392" y1="208" x2="395" y2="228" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="392" y1="208" x2="490" y2="228" stroke="currentColor" stroke-opacity="0.45"/>
<rect x="70" y="263" width="460" height="58" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.45"/>
<text x="300" y="277" text-anchor="middle" class="tm" font-size="10">used by every model above</text>
<rect x="225.0" y="0" width="150" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="18" text-anchor="middle" font-size="11">Map &amp; How to Choose</text>
<rect x="235.0" y="42" width="130" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="60" text-anchor="middle" font-size="11">Decision Trees</text>
<rect x="225.0" y="84" width="150" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="102" text-anchor="middle" font-size="11">Ensemble Learning</text>
<rect x="61.0" y="132" width="110" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="116" y="150" text-anchor="middle" font-size="11">Bagging</text>
<rect x="262.0" y="132" width="136" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="330" y="150" text-anchor="middle" font-size="11">How Boosting Works</text>
<rect x="465.0" y="132" width="130" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="150" text-anchor="middle" font-size="11">Stacking &amp; Voting</text>
<rect x="10.0" y="180" width="104" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="62" y="198" text-anchor="middle" font-size="11">Random Forest</text>
<rect x="122.0" y="180" width="96" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="170" y="198" text-anchor="middle" font-size="11">Extra Trees</text>
<rect x="227.0" y="180" width="90" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="272" y="198" text-anchor="middle" font-size="11">AdaBoost</text>
<rect x="324.0" y="180" width="136" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="392" y="198" text-anchor="middle" font-size="11">Gradient Boosting</text>
<rect x="257.5" y="228" width="85" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="246" text-anchor="middle" font-size="11">XGBoost</text>
<rect x="352.5" y="228" width="85" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="395" y="246" text-anchor="middle" font-size="11">LightGBM</text>
<rect x="447.5" y="228" width="85" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="490" y="246" text-anchor="middle" font-size="11">CatBoost</text>
<rect x="90.0" y="286" width="200" height="28" rx="6" class="fg sg" stroke-width="2.5"/>
<text x="190" y="304" text-anchor="middle" font-size="11" font-weight="700">Feature Importance &amp; SHAP</text>
<rect x="320.0" y="286" width="200" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="420" y="304" text-anchor="middle" font-size="11">Tuning &amp; Production</text>
</svg><figcaption>The Tree-Based Models group. This note (green) sits in the bar at the bottom: it is a tool you use on any model above it, from a single decision tree to a stacked ensemble.</figcaption></figure>
  <ul>
    <li><strong>Came from:</strong> <a class="xref" data-note="ml_dtree">Decision Trees</a> gave us a model you can read: "if tenure ≤ 11.5 then churn". Then <a class="xref" data-note="ml_rf">Random Forest</a>, <a class="xref" data-note="ml_gbm">Gradient Boosting</a>, <a class="xref" data-note="ml_xgboost">XGBoost</a>, <a class="xref" data-note="ml_lightgbm">LightGBM</a> and <a class="xref" data-note="ml_catboost">CatBoost</a> bought accuracy by combining hundreds of trees. The price: nobody can read 300 trees. The decision tree note showed a short version of MDI importance; this note finishes the job.</li>
    <li><strong>What this note adds:</strong> numbers that answer three different questions. (1) <em>Which columns does the model use overall?</em> (global importance). (2) <em>How does the prediction change as one column changes?</em> (partial dependence, ICE). (3) <em>Why did the model say this for this one customer?</em> (local explanation, SHAP).</li>
    <li><strong>Leads to:</strong> <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>, where importance helps you drop useless columns, check a model before shipping and watch which features drift. It also connects back to <a class="xref" data-note="ml_evaluation">Model Evaluation</a> (permutation importance is "how much does the score drop") and to <a class="xref" data-note="st_probability">Probability</a> (expectations over a background dataset).</li>
  </ul>

  <h2 id="mte-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Feature Importance &amp; SHAP</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why explain</div>
        <ul>
          <li><b>Global</b> — which columns matter overall · <b>Local</b> — why this one prediction</li>
          <li><b>Uses</b> — debugging, leakage hunting, feature selection, trust, regulation ("right to explanation")</li>
          <li><b>Model-specific</b> (MDI, TreeSHAP) vs <b>model-agnostic</b> (permutation, PDP, KernelSHAP)</li>
          <li>💡 A doctor explains which test results led to the diagnosis</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">MDI (impurity importance)</div>
        <ul>
          <li>Per split: (N_t/N)·[imp(t) − (N_L/N_t)imp(L) − (N_R/N_t)imp(R)]</li>
          <li>Sum per feature, average over trees, normalise to sum 1</li>
          <li>Worked: tenure 0.3086, bill 0.1714 → 0.643 / 0.357</li>
          <li>⚠ Training data only; favours many-valued columns (row_noise 0.036 vs coin_noise 0.005)</li>
          <li>XGBoost/LightGBM: weight (count), gain, cover</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Permutation &amp; drop-column</div>
        <ul>
          <li><b>Permutation</b> — shuffle one column on validation; importance = score drop</li>
          <li>Worked: rotate tenure → acc 1.0 → 0.5 (drop 0.5)</li>
          <li>Noise columns → ≈ 0; repeat shuffles for a ± spread</li>
          <li><b>Drop-column</b> — retrain without the column; d refits; answers "do I need it?"</li>
          <li>⚠ Twins: shuffle one, the other covers; drop one, the other covers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PDP &amp; ICE</div>
        <ul>
          <li><b>PD(v)</b> = average over rows of f(set column = v, others as they are)</li>
          <li><b>ICE</b> — one curve per row; PDP = mean of ICE curves</li>
          <li>Worked: complaints 0,1,2,3 → PD 20, 20, 57.5, 57.5</li>
          <li>ICE jumps differ (+50 vs +20) → interaction with tenure</li>
          <li>⚠ Correlated columns → impossible rows; use ALE</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SHAP</div>
        <ul>
          <li><b>Shapley</b> — fair split of a payout among players; φⱼ = weighted avg of marginal contributions</li>
          <li>Weights |S|!(M−|S|−1)!/M!; for 3 features 1/3, 1/6, 1/6, 1/3</li>
          <li>Worked: base 30, f(x) 80 → tenure 15, complaints 32.5, bill 2.5 (sum 50)</li>
          <li><b>Additivity</b> — base + Σφ = prediction, exactly</li>
          <li><b>TreeSHAP</b> — exact, polynomial time for trees; log-odds units for classifiers</li>
          <li>Plots: bar, beeswarm, dependence, waterfall, force</li>
          <li><b>Interactions</b> — Φ matrix; rows sum to φ; worked T×C = 7.5</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Caveats</div>
        <ul>
          <li><b>Correlated features</b> — credit is split or vanishes; group them</li>
          <li><b>Explains the model, not the world</b> — a symptom column can be "most important"</li>
          <li>Importance ≠ causation ≠ "what to change"</li>
          <li>Check MDI with permutation on validation data</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mte-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Explain a Tree Model</span><span class="rm-sub">Global vs local, the questions people ask</span></div></div>
      <div class="rm-item rm-done" data-target="mte-mdi"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">MDI: Impurity Importance</span><span class="rm-sub">The math, by hand, and its bias</span></div></div>
      <div class="rm-item rm-done" data-target="mte-perm"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Permutation Importance</span><span class="rm-sub">Shuffle a column, watch the score</span></div></div>
      <div class="rm-item rm-done" data-target="mte-drop"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Drop-Column Importance</span><span class="rm-sub">Retrain without it</span></div></div>
      <div class="rm-item rm-done" data-target="mte-pdp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Partial Dependence &amp; ICE</span><span class="rm-sub">How the prediction moves with one column</span></div></div>
      <div class="rm-item rm-done" data-target="mte-shapley"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Shapley Values by Hand</span><span class="rm-sub">Game theory on a 3-feature model</span></div></div>
      <div class="rm-item rm-done" data-target="mte-shap"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SHAP in Practice</span><span class="rm-sub">TreeSHAP, plots, interaction values</span></div></div>
      <div class="rm-item rm-done" data-target="mte-corr"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Correlated Features</span><span class="rm-sub">Twins split or hide the credit</span></div></div>
      <div class="rm-item rm-done" data-target="mte-causal"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Explanation ≠ Causation</span><span class="rm-sub">A symptom column that "drives" churn</span></div></div>
      <div class="rm-item rm-done" data-target="mte-cmp"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Comparing the Methods</span><span class="rm-sub">Table + a practical workflow</span></div></div>
      <div class="rm-item rm-done" data-target="mte-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What gets people in trouble</span></div></div>
      <div class="rm-item rm-done" data-target="mte-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style, with connections</span></div></div>
    </div>
  </div>

  <h2 id="mte-why"><span class="num">01</span>Why Explain a Tree Model</h2>
  <p>You built a churn model for a telecom company. It scores 0.88 accuracy. The head of retention asks three questions in the meeting:</p>
  <ol>
    <li>"What makes customers leave, in general?"</li>
    <li>"If a customer's bill goes up, does the risk go up? By how much?"</li>
    <li>"Your model flagged Mrs. Sharma as 98% likely to leave. Why her?"</li>
  </ol>
  <p>With one small decision tree you could answer all three by reading the tree. With 300 trees, each 20 levels deep, you cannot. The model has become a <strong>black box</strong>: data goes in, a number comes out, the reasons are hidden. Interpretation methods open the box. They are different tools for the three different questions above.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor's diagnosis. Question 1 is "which tests matter most for this disease in general?" (cholesterol, blood pressure). Question 2 is "how does risk change as cholesterol rises?" Question 3 is "why do <em>you</em>, this patient, have high risk?" A good doctor answers all three differently, and so do these methods.</p>
  </div>
  <table class="tbl">
    <tr><th>Question</th><th>Kind</th><th>Methods in this note</th></tr>
    <tr><td>Which columns does the model rely on?</td><td>Global importance (one number per column)</td><td>MDI, permutation, drop-column, mean |SHAP|</td></tr>
    <tr><td>How does the prediction move as one column changes?</td><td>Global effect (a curve per column)</td><td>Partial dependence (PDP), ICE, SHAP dependence plot</td></tr>
    <tr><td>Why this prediction for this row?</td><td>Local explanation (one number per column per row)</td><td>SHAP values (waterfall / force plot)</td></tr>
  </table>
  <p>Two more words you will hear. A <strong>model-specific</strong> method reads the inside of the model: MDI adds up the trees' own split statistics, TreeSHAP walks the trees. A <strong>model-agnostic</strong> method only calls <code>predict</code>, so it works on any model: permutation importance, drop-column, PDP/ICE and KernelSHAP. Model-specific methods are fast; model-agnostic ones let you compare a forest with a neural net using the same ruler.</p>
  <p>Why do people need this? In real projects, these are the reasons, in order of how often they save you:</p>
  <div class="cards">
    <div><b>Debugging &amp; leakage</b><p>A column like <code>refund_issued_date</code> at the top of the importance list usually means the answer leaked into the inputs.</p><small>The most common real use</small></div>
    <div><b>Feature selection</b><p>Drop columns that contribute nothing, so the model is smaller, faster and cheaper to feed.</p><small>Use permutation / drop-column, not MDI</small></div>
    <div><b>Trust &amp; communication</b><p>Business teams act on a model they can follow: "high complaints and short tenure".</p><small>SHAP summaries, PDPs</small></div>
    <div><b>Regulation</b><p>Credit and insurance decisions often need "reason codes" for each refusal.</p><small>Local SHAP values per applicant</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Feature importance</strong>: a score per input column measuring how much a trained model depends on it. <strong>Feature effect</strong>: how the model's output changes as the column's value changes. <strong>Local attribution</strong>: a split of one prediction into per-column contributions. These are three different things, and a column can rank differently on each.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>All of these methods explain <strong>the model</strong>. If the model is bad, or leaned on a leaked column, the explanation faithfully describes a bad model. They say nothing directly about the real world. Section 09 shows this in numbers.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We need a first, cheap answer to "which columns matter". The trees already recorded how much each split helped while they were being built. Adding those numbers up is MDI.</div>

  <h2 id="mte-mdi"><span class="num">02</span>MDI: Impurity Importance</h2>
  <p><strong>The need.</strong> While a tree grows, every split is chosen because it lowers impurity (Gini or entropy; see <a class="xref" data-note="ml_dtree">Decision Trees</a>). That drop is a measure of how useful the split was. If we add up every drop made by splits on <code>tenure</code>, we get a measure of how much the tree leaned on tenure. That is <strong>Mean Decrease in Impurity (MDI)</strong>, also called Gini importance or impurity importance. It is what <code>feature_importances_</code> returns in scikit-learn.</p>
  <h3>The formula, in plain words</h3>
  <p>At a node t with N_t training rows, split into a left child (N_L rows) and a right child (N_R rows), the impurity decrease is the parent's impurity minus the size-weighted impurity of the children. MDI also multiplies by N_t/N, the share of all training rows that reach this node, so a split near the root (which touches everyone) counts more than one deep down (which touches three rows).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Weighted impurity decrease of node t: <code>Δ(t) = (N_t / N) · [ imp(t) − (N_L/N_t)·imp(L) − (N_R/N_t)·imp(R) ]</code>.<br>
    MDI of feature j in one tree = sum of Δ(t) over all nodes t that split on j.<br>
    For a forest: average the per-tree MDI over trees, then normalise so all features sum to 1.</p>
  </div>
  <h3>Worked by hand: a 10-customer tree</h3>
  <p>Ten past customers, three columns, and whether they churned (1) or stayed (0):</p>
  <table class="tbl">
    <tr><th>#</th><th>complaints</th><th>tenure (months)</th><th>bill (₹)</th><th>churn</th></tr>
    <tr><td>1</td><td>0</td><td>30</td><td>800</td><td>0</td></tr>
    <tr><td>2</td><td>1</td><td>24</td><td>900</td><td>0</td></tr>
    <tr><td>3</td><td>0</td><td>40</td><td>700</td><td>0</td></tr>
    <tr><td>4</td><td>1</td><td>20</td><td>1200</td><td>1</td></tr>
    <tr><td>5</td><td>0</td><td>18</td><td>1100</td><td>0</td></tr>
    <tr><td>6</td><td>1</td><td>15</td><td>950</td><td>0</td></tr>
    <tr><td>7</td><td>3</td><td>5</td><td>1000</td><td>1</td></tr>
    <tr><td>8</td><td>2</td><td>8</td><td>850</td><td>1</td></tr>
    <tr><td>9</td><td>2</td><td>3</td><td>1300</td><td>1</td></tr>
    <tr><td>10</td><td>3</td><td>30</td><td>900</td><td>0</td></tr>
  </table>
  <p>A fully grown tree on this table makes two splits. Step by step:</p>
  <ol>
    <li><strong>Root</strong>: 10 rows, 4 churn and 6 stay. Gini = 1 − (0.4² + 0.6²) = 1 − 0.52 = <strong>0.48</strong>.</li>
    <li>Best split: <code>tenure ≤ 11.5</code>. Left = rows 7, 8, 9 (all churn, Gini 0). Right = the other 7 rows (1 churn, 6 stay): Gini = 1 − ((1/7)² + (6/7)²) = 1 − (0.0204 + 0.7347) = <strong>0.2449</strong>.</li>
    <li>Δ(root) = (10/10) · [0.48 − (3/10)·0 − (7/10)·0.2449] = 0.48 − 0.1714 = <strong>0.3086</strong> → credited to <code>tenure</code>.</li>
    <li><strong>Right node</strong> (7 rows) splits on <code>bill ≤ 1150</code>: left = 6 stayers (Gini 0), right = row 4 alone (Gini 0).</li>
    <li>Δ(right node) = (7/10) · [0.2449 − 0 − 0] = <strong>0.1714</strong> → credited to <code>bill</code>. Notice the 7/10: this node only sees 70% of customers, so its drop counts 70%.</li>
    <li>Totals: complaints 0, tenure 0.3086, bill 0.1714. Sum 0.48 (all the impurity the tree removed). Normalise: tenure 0.3086/0.48 = <strong>0.643</strong>, bill 0.1714/0.48 = <strong>0.357</strong>, complaints <strong>0</strong>.</li>
  </ol>
  <p>Complaints gets zero even though it is obviously related to churn (rows 7–9 have 2–3 complaints). The tree simply never needed it, because tenure separated those rows first. MDI measures <em>use</em>, not <em>relevance</em>. The code repeats the arithmetic from the fitted tree's own numbers and compares with scikit-learn:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
tr = pd.DataFrame({
    "complaints": [0, 1, 0, 1, 0, 1, 3, 2, 2, 3],
    "tenure":     [30, 24, 40, 20, 18, 15, 5, 8, 3, 30],
    "bill":       [800, 900, 700, 1200, 1100, 950, 1000, 850, 1300, 900],
    "churn":      [0, 0, 0, 1, 0, 0, 1, 1, 1, 0]})
X, y = tr.drop(columns="churn"), tr["churn"]
tree = DecisionTreeClassifier(random_state=0).fit(X, y)
print(export_text(tree, feature_names=list(X.columns)))
t = tree.tree_
for node in range(t.node_count):
    if t.children_left[node] != -1:
        print(f"node {node}: split on {X.columns[t.feature[node]]:10s} n={t.n_node_samples[node]:2d} gini={t.impurity[node]:.4f}")
# MDI by hand from the tree's own numbers
imp = np.zeros(X.shape[1]); N = t.n_node_samples[0]
for node in range(t.node_count):
    L, R = t.children_left[node], t.children_right[node]
    if L == -1: continue
    n, nL, nR = t.n_node_samples[node], t.n_node_samples[L], t.n_node_samples[R]
    dec = n / N * (t.impurity[node] - nL / n * t.impurity[L] - nR / n * t.impurity[R])
    imp[t.feature[node]] += dec
    print(f"  weighted decrease at node {node}: {dec:.4f}")
print("raw:", imp.round(4), " normalised:", (imp / imp.sum()).round(4))
print("sklearn feature_importances_:", tree.feature_importances_.round(4))</div>
  <div class="fx" data-lang="text">|--- tenure &lt;= 11.50
|   |--- class: 1
|--- tenure &gt;  11.50
|   |--- bill &lt;= 1150.00
|   |   |--- class: 0
|   |--- bill &gt;  1150.00
|   |   |--- class: 1

node 0: split on tenure     n=10 gini=0.4800
node 2: split on bill       n= 7 gini=0.2449
  weighted decrease at node 0: 0.3086
  weighted decrease at node 2: 0.1714
raw: [0.     0.3086 0.1714]  normalised: [0.     0.6429 0.3571]
sklearn feature_importances_: [0.     0.6429 0.3571]</div>
  <p>The tree, the node Gini values (0.48 and 0.2449), the two weighted decreases (0.3086 and 0.1714) and the normalised importances (0, 0.643, 0.357) all match the hand calculation and scikit-learn's <code>feature_importances_</code>. (Column order is complaints, tenure, bill.)</p>
  <h3>Importance types in the boosting libraries</h3>
  <p>XGBoost and LightGBM offer several "importance types". They are all MDI-style numbers read from the trees, just counted differently:</p>
  <table class="tbl">
    <tr><th>Type</th><th>Counts</th><th>Where</th><th>Note</th></tr>
    <tr><td><code>weight</code> / <code>split</code></td><td>How many splits use the feature</td><td>XGBoost <code>weight</code>; LightGBM default <code>split</code></td><td>Many tiny splits on a noisy column look important</td></tr>
    <tr><td><code>gain</code> / <code>total_gain</code></td><td>Average / total loss reduction from its splits</td><td>XGBoost default for the sklearn API is <code>gain</code>; LightGBM <code>importance_type="gain"</code></td><td>Closest to MDI</td></tr>
    <tr><td><code>cover</code> / <code>total_cover</code></td><td>Rows (Hessian sum) passing through its splits</td><td>XGBoost</td><td>How many samples the feature's decisions touch</td></tr>
  </table>
  <p>The three can rank features very differently. Always say which one you report.</p>
  <h3>The high-cardinality bias, on the churn data</h3>
  <p>The shared churn dataset has 12 columns from <code>make_classification</code> (f0–f11; 6 informative, 2 redundant mixes, 4 useless) plus two pure-noise columns: <code>row_noise</code> (a random number, 20,000 different values) and <code>coin_noise</code> (random 0 or 1). Split 12,000 train / 3,000 validation / 5,000 test.</p>
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
  <p>Every churn code block on this page starts from this setup (it is the same one used in the other notes of this group). The next block fits a 200-tree forest and computes four importance measures side by side. We look at the MDI column now and the others in sections 03 and 04.</p>
  <div class="fx" data-lang="py">from sklearn.inspection import permutation_importance
from sklearn.base import clone
t0 = time.time()
rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(Xtr, ytr)
print(f"fit {time.time()-t0:.1f}s  val acc {rf.score(Xva, yva):.3f}  train acc {rf.score(Xtr, ytr):.3f}")
t0 = time.time()
p_va = permutation_importance(rf, Xva, yva, n_repeats=5, random_state=0, n_jobs=-1)
print(f"permutation on val: {time.time()-t0:.1f}s")
p_tr = permutation_importance(rf, Xtr, ytr, n_repeats=5, random_state=0, n_jobs=-1)
t0 = time.time()
base = rf.score(Xva, yva); drop = {}
for col in Xtr.columns:
    m = clone(rf).fit(Xtr.drop(columns=col), ytr)
    drop[col] = base - m.score(Xva.drop(columns=col), yva)
print(f"drop-column (14 refits): {time.time()-t0:.1f}s")
df = pd.DataFrame({"MDI": rf.feature_importances_, "perm_train": p_tr.importances_mean,
                   "perm_val": p_va.importances_mean, "perm_val_std": p_va.importances_std,
                   "drop_col": pd.Series(drop)}, index=Xtr.columns)
print(df.sort_values("MDI", ascending=False).round(3).to_string())</div>
  <div class="fx" data-lang="text">fit 7.3s  val acc 0.881  train acc 1.000
permutation on val: 24.0s
drop-column (14 refits): 155.8s
              MDI  perm_train  perm_val  perm_val_std  drop_col
f5          0.139       0.210     0.193         0.007     0.033
f8          0.113       0.117     0.106         0.006     0.030
f9          0.099       0.054     0.072         0.003     0.007
f4          0.099       0.053     0.064         0.004     0.019
f6          0.094       0.045     0.061         0.002     0.017
f2          0.093       0.038     0.051         0.005     0.009
f7          0.089       0.068     0.070         0.004     0.021
f3          0.089       0.058     0.060         0.005     0.008
f10         0.037       0.003     0.001         0.001     0.000
f11         0.037       0.003     0.000         0.002     0.001
row_noise   0.036       0.002     0.004         0.002     0.002
f0          0.035       0.002     0.001         0.001    -0.000
f1          0.035       0.002     0.001         0.002     0.003
coin_noise  0.005       0.000     0.001         0.001    -0.001

[exited with code 0]</div>
  <p>Read the MDI column. The two noise columns are equally useless, but <code>row_noise</code> gets 0.036, about the same as the genuinely-useless-but-real columns f0, f1, f10, f11, and 7× more than <code>coin_noise</code> (0.005). Why?</p>
  <ul>
    <li><strong>More values = more chances to get lucky.</strong> A 0/1 column offers one possible split. A column with 20,000 different values offers up to 19,999 thresholds. Deep in a tree, where a node holds 6 rows, some threshold on random numbers will separate them perfectly by chance. The tree takes it, and MDI books that impurity drop as "importance".</li>
    <li><strong>It is measured on training data.</strong> The forest has train accuracy 1.000: every leaf is pure, so every bit of training impurity was removed, much of it by memorising noise. MDI counts the memorising as importance. It never checks whether those splits help on new rows.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: the cardinality bias</span>
    <p>MDI inflates columns with many distinct values (IDs, timestamps, exact amounts, zip codes) and deflates binary and low-cardinality columns. A customer-ID column often appears "important". Never present raw MDI as "what drives churn". Cross-check with permutation importance on validation data (next section), or use a forest with larger <code>min_samples_leaf</code>, which leaves fewer tiny lucky splits.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>MDI is free (it falls out of training) and fine for a quick look at a model that does not overfit much. Its two flaws come from the same place: it judges splits by how well they fit the training rows, not by how well they generalise.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We want a measure computed on rows the model has not seen, that only calls <code>predict</code>, and that measures the effect on the score we actually care about. Permutation importance does exactly that.</div>

  <h2 id="mte-perm"><span class="num">03</span>Permutation Importance</h2>
  <p><strong>The idea.</strong> If the model really needs a column, then scrambling that column should hurt its score. Take the validation set, shuffle one column's values among the rows (so each row gets some other row's value), keep everything else the same, and score the model again. The drop in score is that column's importance.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Testing a cricket team by benching one player at a time, but keeping the team size the same by sending in a random spectator wearing his jersey. If the team collapses, that player mattered. If nothing changes, he was not doing much. (Counting how many balls a player touched in practice, the MDI way, can be misleading.)</p>
  </div>
  <p>Why shuffle instead of setting the column to 0 or deleting it? Shuffling keeps the column's distribution exactly the same (same values, same mean, same spread) but breaks its link with the target and with the other columns. The model still gets valid-looking input, so we measure only the lost information.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a fitted model f, a score s (accuracy, AUC, R², …) and a dataset D: <br>1) s₀ = score of f on D. <br>2) For each column j and each repeat k = 1..K: shuffle column j in D to get D̃ⱼₖ, compute sⱼₖ. <br>3) Importance(j) = s₀ − (1/K)·Σₖ sⱼₖ. Report the standard deviation across repeats too.</p>
  </div>
  <h3>Worked by hand</h3>
  <p>Use the tree from section 02 (rules: tenure ≤ 11.5 → churn; otherwise bill &gt; 1150 → churn; otherwise stay) and six fresh validation customers. So that the result is reproducible by hand, we "shuffle" by rotating the column down by one row (row 1 gets row 6's value, row 2 gets row 1's, and so on).</p>
  <table class="tbl">
    <tr><th>row</th><th>tenure</th><th>bill</th><th>true</th><th>pred</th><th>tenure rotated</th><th>pred</th><th>bill rotated</th><th>pred</th></tr>
    <tr><td>1</td><td>4</td><td>900</td><td>1</td><td>1 ✓</td><td>12</td><td>0 ✗</td><td>1100</td><td>1 ✓</td></tr>
    <tr><td>2</td><td>30</td><td>800</td><td>0</td><td>0 ✓</td><td>4</td><td>1 ✗</td><td>900</td><td>0 ✓</td></tr>
    <tr><td>3</td><td>6</td><td>1000</td><td>1</td><td>1 ✓</td><td>30</td><td>0 ✗</td><td>800</td><td>1 ✓</td></tr>
    <tr><td>4</td><td>25</td><td>1300</td><td>1</td><td>1 ✓</td><td>6</td><td>1 ✓</td><td>1000</td><td>0 ✗</td></tr>
    <tr><td>5</td><td>40</td><td>700</td><td>0</td><td>0 ✓</td><td>25</td><td>0 ✓</td><td>1300</td><td>1 ✗</td></tr>
    <tr><td>6</td><td>12</td><td>1100</td><td>0</td><td>0 ✓</td><td>40</td><td>0 ✓</td><td>700</td><td>0 ✓</td></tr>
    <tr><td colspan="3"><b>accuracy</b></td><td></td><td><b>6/6 = 1.0</b></td><td></td><td><b>3/6 = 0.5</b></td><td></td><td><b>4/6 = 0.667</b></td></tr>
  </table>
  <p>Importance(tenure) = 1.0 − 0.5 = <strong>0.5</strong>. Importance(bill) = 1.0 − 0.667 = <strong>0.333</strong>. Importance(complaints) = <strong>0</strong>, because the tree never reads it, so shuffling it changes no prediction. The ranking agrees with MDI here, but the numbers mean something different: "accuracy points lost on new data".</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier
tr = pd.DataFrame({
    "complaints": [0, 1, 0, 1, 0, 1, 3, 2, 2, 3],
    "tenure":     [30, 24, 40, 20, 18, 15, 5, 8, 3, 30],
    "bill":       [800, 900, 700, 1200, 1100, 950, 1000, 850, 1300, 900],
    "churn":      [0, 0, 0, 1, 0, 0, 1, 1, 1, 0]})
X, y = tr.drop(columns="churn"), tr["churn"]
tree = DecisionTreeClassifier(random_state=0).fit(X, y)

# permutation importance by hand on 6 validation rows
va = pd.DataFrame({"complaints": [2, 0, 1, 0, 1, 0], "tenure": [4, 30, 6, 25, 40, 12],
                   "bill": [900, 800, 1000, 1300, 700, 1100], "churn": [1, 0, 1, 1, 0, 0]})
Xv, yv = va.drop(columns="churn"), va["churn"]
base = (tree.predict(Xv) == yv).mean()
print("baseline accuracy:", base)
for col in Xv.columns:
    Xp = Xv.copy()
    Xp[col] = np.roll(Xv[col].values, 1)           # a fixed 'shuffle': rotate by one row
    acc = (tree.predict(Xp) == yv).mean()
    print(f"rotate {col:10s} -&gt; {Xp[col].tolist()}  preds {tree.predict(Xp).tolist()}  acc {acc:.3f}  drop {base-acc:.3f}")</div>
  <div class="fx" data-lang="text">baseline accuracy: 1.0
rotate complaints -&gt; [0, 2, 0, 1, 0, 1]  preds [1, 0, 1, 1, 0, 0]  acc 1.000  drop 0.000
rotate tenure     -&gt; [12, 4, 30, 6, 25, 40]  preds [0, 1, 0, 1, 0, 0]  acc 0.500  drop 0.500
rotate bill       -&gt; [1100, 900, 800, 1000, 1300, 700]  preds [1, 0, 1, 0, 1, 0]  acc 0.667  drop 0.333</div>
  <p>The printed predictions match the table row for row. In real use you shuffle randomly and repeat (scikit-learn's <code>n_repeats</code>), because one shuffle can be lucky.</p>
  <h3>On the churn data</h3>
  <p>Look back at the <code>perm_val</code> column of the churn table in section 02 (computed with <code>permutation_importance(rf, Xva, yva, n_repeats=5)</code>). Now both noise columns sit at the bottom: <code>row_noise</code> 0.004, <code>coin_noise</code> 0.001, and the four useless real columns at 0.000–0.001. The top two (f5 at 0.193, f8 at 0.106) agree with MDI, but the middle ranks change. The <code>perm_val_std</code> column (0.002–0.007) tells you differences smaller than about 0.01 are noise.</p>
  <ul>
    <li><strong>Train or validation?</strong> The <code>perm_train</code> column uses training rows. The forest memorised them, so in principle it could look important on train and useless on validation. Here the two columns are close, but compute it on held-out data by default: you want "what the model needs to generalise".</li>
    <li><strong>Which score?</strong> Use the metric you care about. For imbalanced classes use <code>scoring="average_precision"</code> or <code>"roc_auc"</code>; accuracy can barely move when you damage a column that only matters for the rare class.</li>
    <li><strong>Cost.</strong> d columns × K repeats × one prediction pass. No retraining. The run above took about 24 s on a busy shared machine (prediction with 200 deep trees is the slow part).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: twins share the blame</span>
    <p>If two columns carry the same information (say <code>monthly_bill</code> and <code>annual_bill</code>), shuffling one does little harm because the model can still read the other. Both get low permutation importance even though the information is vital. Section 08 shows this with real numbers and the fix (shuffle the group together).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: impossible rows</span>
    <p>Shuffling creates rows that may never happen in reality (a 20-year-old with 35 years of tenure). The model is then judged on inputs it was never trained for. This is mild for independent columns and serious for strongly related ones.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Permutation asks "how much does <em>this trained model</em> suffer without the column's information?" A different, practical question is "would a model trained <em>without</em> this column be worse?" That needs retraining.</div>

  <h2 id="mte-drop"><span class="num">04</span>Drop-Column Importance</h2>
  <p><strong>The idea.</strong> Train the model once with all columns and score it on validation. Then for each column, train a fresh model without that column and score it again. Importance = full score − score without it. It is the most direct answer to "should I keep this column?", and it is the most expensive: d columns means d extra training runs.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>DropImp(j) = s(model trained on all columns) − s(model retrained without column j), both measured on the same validation set with the same hyperparameters and random seed.</p>
  </div>
  <h3>Worked on the 10-customer table</h3>
  <p>Permutation importance said tenure was worth 0.5 accuracy and bill 0.333. Now retrain the tree three times, each time without one column, and score each new tree on the same six validation customers:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
tr = pd.DataFrame({
    "complaints": [0, 1, 0, 1, 0, 1, 3, 2, 2, 3],
    "tenure":     [30, 24, 40, 20, 18, 15, 5, 8, 3, 30],
    "bill":       [800, 900, 700, 1200, 1100, 950, 1000, 850, 1300, 900],
    "churn":      [0, 0, 0, 1, 0, 0, 1, 1, 1, 0]})
va = pd.DataFrame({"complaints": [2, 0, 1, 0, 1, 0], "tenure": [4, 30, 6, 25, 40, 12],
                   "bill": [900, 800, 1000, 1300, 700, 1100], "churn": [1, 0, 1, 1, 0, 0]})
X, y, Xv, yv = tr.drop(columns="churn"), tr["churn"], va.drop(columns="churn"), va["churn"]
full = DecisionTreeClassifier(random_state=0).fit(X, y).score(Xv, yv)
for col in X.columns:
    t = DecisionTreeClassifier(random_state=0).fit(X.drop(columns=col), y)
    s = t.score(Xv.drop(columns=col), yv)
    print(f"without {col:10s}: val acc {s:.3f}  drop-column importance {full - s:+.3f}")
    if col == "tenure":
        print(export_text(t, feature_names=[c for c in X.columns if c != col]))</div>
  <div class="fx" data-lang="text">without complaints: val acc 1.000  drop-column importance +0.000
without tenure    : val acc 0.833  drop-column importance +0.167
|--- bill &lt;= 1150.00
|   |--- complaints &lt;= 1.50
|   |   |--- class: 0
|   |--- complaints &gt;  1.50
|   |   |--- complaints &lt;= 2.50
|   |   |   |--- class: 1
|   |   |--- complaints &gt;  2.50
|   |   |   |--- bill &lt;= 950.00
|   |   |   |   |--- class: 0
|   |   |   |--- bill &gt;  950.00
|   |   |   |   |--- class: 1
|--- bill &gt;  1150.00
|   |--- class: 1

without bill      : val acc 0.833  drop-column importance +0.167</div>
  <p>Without tenure, the new tree does not give up. It rebuilds the rule from what is left: "bill &gt; 1150 → churn; otherwise 2 complaints → churn; 3 complaints and bill &gt; 950 → churn". That substitute gets 5 of 6 validation customers right (0.833), so tenure's drop-column importance is only 1.0 − 0.833 = <strong>0.167</strong>, a third of its permutation importance (0.5). Complaints, which the original tree never used, again gets 0.</p>
  <table class="tbl">
    <tr><th>column</th><th>MDI (normalised)</th><th>permutation</th><th>drop-column</th></tr>
    <tr><td>complaints</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>tenure</td><td>0.643</td><td>0.500</td><td>0.167</td></tr>
    <tr><td>bill</td><td>0.357</td><td>0.333</td><td>0.167</td></tr>
  </table>
  <p>Three methods, three different numbers, all correct for their own question. MDI: "how much training impurity did splits on this column remove?" Permutation: "how much does <em>this</em> model lose if the column's information is destroyed?" Drop-column: "how much would <em>any</em> model of this kind lose if we never had the column?"</p>
  <h3>On the churn data</h3>
  <p>Look at the <code>drop_col</code> column of the churn table in section 02 (14 retrainings of the 200-tree forest, about 2.5 minutes on the shared machine):</p>
  <table class="tbl">
    <tr><th>column</th><th>permutation (val)</th><th>drop-column (val)</th><th>why different</th></tr>
    <tr><td>f5</td><td>0.193</td><td>0.033</td><td>Retrained forest finds partial substitutes (f5's signal is also mixed into the two redundant columns)</td></tr>
    <tr><td>f8</td><td>0.106</td><td>0.030</td><td>Same</td></tr>
    <tr><td>f9</td><td>0.072</td><td>0.007</td><td>Largely replaceable</td></tr>
    <tr><td>row_noise</td><td>0.004</td><td>0.002</td><td>Both ≈ 0: correct</td></tr>
    <tr><td>f0, coin_noise</td><td>0.001</td><td>−0.000, −0.001</td><td>Negative = the model is slightly better without it (noise)</td></tr>
  </table>
  <p>Drop-column numbers are smaller and noisier (each refit has its own randomness), but they answer the deployment question: "dropping f9 costs 0.7 accuracy points". Small negative values mean the column was hurting, or more often, just random variation; repeat with several seeds before acting on a difference under 0.005.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Permutation: the star batsman is injured mid-match and the team, already picked, struggles. Drop-column: the selectors know in advance he is out, so they pick a different eleven around it. The second team does better than the first, because it had time to adapt.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Drop-column importance of a column with a twin is near zero, because the twin takes over. If you drop both twins on that evidence, you lose the information entirely. Drop columns one at a time and re-check, or drop groups.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> All three methods so far give one number per column. They say <em>how much</em> the model uses a column but not <em>how</em>: does churn risk go up with complaints, down, or up and then flat? Partial dependence draws that curve.</div>

  <h2 id="mte-pdp"><span class="num">05</span>Partial Dependence &amp; ICE</h2>
  <p><strong>The need.</strong> The retention head asked "if complaints go up, does the risk go up, and by how much?" That needs a curve: x-axis = the column's value, y-axis = the model's prediction. But the prediction also depends on the other columns. Partial dependence handles them by averaging them out over real rows.</p>
  <h3>The recipe, in plain words</h3>
  <ol>
    <li>Pick the column (complaints) and a grid of values (0, 1, 2, 3).</li>
    <li>For the first value, take every row of a dataset, <em>overwrite</em> its complaints with 0, keep its other columns as they are, and predict.</li>
    <li>Average those predictions. That is one point of the curve.</li>
    <li>Repeat for 1, 2, 3.</li>
  </ol>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Partial dependence</strong> of the model f on column S at value v: <code>PD(v) = (1/n) Σᵢ f(x_S = v, x_C = x_C⁽ⁱ⁾)</code>, where C is every other column and the sum runs over n rows of a reference dataset. <strong>ICE</strong> (Individual Conditional Expectation): the same thing without the average, one curve per row: <code>ICEᵢ(v) = f(x_S = v, x_C = x_C⁽ⁱ⁾)</code>. So PDP = the mean of the ICE curves.</p>
  </div>
  <h3>Worked by hand</h3>
  <p>Take a small, fully known "model" (a churn score from 0 to 100). It is a real depth-2 tree, and we will reuse it in the SHAP section:</p>
  <div class="fx" data-lang="text">if complaints ≥ 2:   score = 80 if tenure &lt; 12 else 50
else:                score = 30 if bill &gt; 1000 else 10</div>
  <p>And four background customers to average over:</p>
  <table class="tbl">
    <tr><th>customer</th><th>tenure</th><th>complaints</th><th>bill</th><th>score as is</th></tr>
    <tr><td>b1</td><td>24</td><td>0</td><td>800</td><td>10</td></tr>
    <tr><td>b2</td><td>6</td><td>0</td><td>1500</td><td>30</td></tr>
    <tr><td>b3</td><td>36</td><td>2</td><td>900</td><td>50</td></tr>
    <tr><td>b4</td><td>18</td><td>1</td><td>1100</td><td>30</td></tr>
  </table>
  <p>Now set complaints to each grid value for every customer and read the score:</p>
  <table class="tbl">
    <tr><th>complaints set to</th><th>b1 (t 24, ₹800)</th><th>b2 (t 6, ₹1500)</th><th>b3 (t 36, ₹900)</th><th>b4 (t 18, ₹1100)</th><th>PD = average</th></tr>
    <tr><td>0</td><td>10</td><td>30</td><td>10</td><td>30</td><td><b>20</b></td></tr>
    <tr><td>1</td><td>10</td><td>30</td><td>10</td><td>30</td><td><b>20</b></td></tr>
    <tr><td>2</td><td>50</td><td>80</td><td>50</td><td>50</td><td><b>57.5</b></td></tr>
    <tr><td>3</td><td>50</td><td>80</td><td>50</td><td>50</td><td><b>57.5</b></td></tr>
  </table>
  <p>The PDP reads: "with 0–1 complaints the average score is 20; with 2+ it jumps to 57.5". Each column of the table is one ICE curve. They all jump at complaints = 2, but by different amounts: b2 jumps by 50 (30 → 80), b1 and b3 by 40, b4 by only 20. The jump depends on the customer's tenure and bill. When ICE curves are not parallel, the column <strong>interacts</strong> with others, and the single PDP line (+37.5) hides that.</p>
  <figure class="viz"><svg viewBox="0 0 620 250" width="620">
<line x1="60" y1="210" x2="520" y2="210" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="210" stroke="currentColor"/>
<text x="54" y="214" text-anchor="end" class="tm" font-size="11">0</text><text x="54" y="164" text-anchor="end" class="tm" font-size="11">25</text><text x="54" y="114" text-anchor="end" class="tm" font-size="11">50</text><text x="54" y="64" text-anchor="end" class="tm" font-size="11">75</text>
<text x="90" y="228" text-anchor="middle" class="tm" font-size="11">0</text><text x="230" y="228" text-anchor="middle" class="tm" font-size="11">1</text><text x="370" y="228" text-anchor="middle" class="tm" font-size="11">2</text><text x="510" y="228" text-anchor="middle" class="tm" font-size="11">3</text>
<text x="300" y="246" text-anchor="middle" class="tm" font-size="11">complaints (set for every customer)</text>
<text x="66" y="28" class="tm" font-size="11">score</text>
<polyline points="90,190 230,190 370,110 510,110" fill="none" class="sb" stroke-width="1.5" stroke-dasharray="4 3"/>
<polyline points="90,150 230,150 370,50 510,50" fill="none" class="sb" stroke-width="1.5" stroke-dasharray="4 3"/>
<polyline points="90,187 230,187 370,113 510,113" fill="none" class="sb" stroke-width="1.5" stroke-dasharray="4 3"/>
<polyline points="90,147 230,147 370,107 510,107" fill="none" class="sb" stroke-width="1.5" stroke-dasharray="4 3"/>
<polyline points="90,170 230,170 370,95 510,95" fill="none" class="sr" stroke-width="3"/>
<text x="516" y="54" class="tb" font-size="11">b2 (+50)</text><text x="516" y="104" class="tb" font-size="11">b4 (+20)</text><text x="516" y="122" class="tb" font-size="11">b1, b3 (+40)</text>
<text x="380" y="88" class="tr" font-size="12">PDP 20 → 57.5</text>
</svg><figcaption>ICE curves (dashed, one per customer; b1 and b3 overlap) and their average, the PDP (thick red). The PDP says "+37.5"; the ICE curves show the real jump ranges from +20 to +50 depending on the customer.</figcaption></figure>
  <p>The code fits that rule as a real scikit-learn tree, repeats the hand calculation, and asks <code>partial_dependence</code> for both the average and the individual curves:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from itertools import product
from sklearn.tree import DecisionTreeRegressor
from sklearn.inspection import partial_dependence

def f(t, c, b):
    if c &gt;= 2:
        return 80 if t &lt; 12 else 50
    return 30 if b &gt; 1000 else 10
grid = pd.DataFrame(list(product([6, 11, 12, 18, 24, 36], [0, 1, 2, 3], [800, 1000, 1001, 1200, 1500])),
                    columns=["tenure", "complaints", "bill"])
tree = DecisionTreeRegressor(random_state=0).fit(grid, [f(*r) for r in grid.values])
bg = pd.DataFrame({"tenure": [24, 6, 36, 18], "complaints": [0, 0, 2, 1], "bill": [800, 1500, 900, 1100]}).astype(float)

# by hand: set complaints = c for every background row, predict, average
for c in [0, 1, 2, 3]:
    Xc = bg.assign(complaints=c)
    preds = tree.predict(Xc)
    print(f"complaints={c}: ICE {preds.tolist()}  PD = {preds.mean()}")

pd_res = partial_dependence(tree, bg, ["complaints"], custom_values={"complaints": [0.0, 1.0, 2.0, 3.0]},
                            kind="both", method="brute")
print("sklearn average:", pd_res["average"].round(2).tolist())
print("sklearn ICE    :", pd_res["individual"][0].round(2).tolist())</div>
  <div class="fx" data-lang="text">complaints=0: ICE [10.0, 30.0, 10.0, 30.0]  PD = 20.0
complaints=1: ICE [10.0, 30.0, 10.0, 30.0]  PD = 20.0
complaints=2: ICE [50.0, 80.0, 50.0, 50.0]  PD = 57.5
complaints=3: ICE [50.0, 80.0, 50.0, 50.0]  PD = 57.5
sklearn average: [[20.0, 20.0, 57.5, 57.5]]
sklearn ICE    : [[10.0, 10.0, 50.0, 50.0], [30.0, 30.0, 80.0, 80.0], [10.0, 10.0, 50.0, 50.0], [30.0, 30.0, 50.0, 50.0]]</div>
  <p>Same numbers: PD = 20, 20, 57.5, 57.5 and the four ICE curves from the table. In practice you call <code>PartialDependenceDisplay.from_estimator(model, X, ["complaints"], kind="both")</code> to draw it; <code>kind="both"</code> overlays ICE lines on the PDP. <strong>Centred ICE</strong> (c-ICE, <code>centered=True</code>) shifts each curve to start at 0, which makes differences in the jump easier to see. A <strong>2-way PDP</strong> (pass a pair of columns) shows a heat map of the average prediction over a grid of two columns and is the standard way to look at an interaction.</p>
  <h3>On the churn data</h3>
  <p>Now a real model: a 480-tree LightGBM on the churn data, with partial dependence computed on 1,000 validation rows for the strongest column (<code>f5</code>) and for the useless <code>row_noise</code>. The grid is the 5th, 25th, 50th, 75th and 95th percentile of each column. The second block is a 2-way PDP for the pair <code>f5</code> × <code>f8</code> (3 × 3 grid).</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.inspection import partial_dependence
m = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1).fit(Xtr, ytr)
Xs = Xva.iloc[:1000]                                      # 1,000 reference rows keep it quick
for col in ["f5", "row_noise"]:
    grid = np.quantile(Xtr[col], [0.05, 0.25, 0.5, 0.75, 0.95])
    r = partial_dependence(m, Xs, [col], custom_values={col: grid}, kind="both", response_method="predict_proba")
    ice = r["individual"][0]                              # 1000 rows x 5 grid points
    print(f"{col}: grid {grid.round(2).tolist()}")
    print(f"   PDP (avg P(churn)) {r['average'][0].round(3).tolist()}")
    rise = ice[:, -1] - ice[:, 0]
    print(f"   ICE change from 5th to 95th percentile: 10th pct {np.percentile(rise, 10):+.3f}, "
          f"median {np.median(rise):+.3f}, 90th pct {np.percentile(rise, 90):+.3f}")
r2 = partial_dependence(m, Xs, ["f5", "f8"], grid_resolution=3, response_method="predict_proba")
print("2-way PDP f5 x f8 (rows: f5 low/mid/high, cols: f8 low/mid/high):")
print(r2["average"][0].round(3))</div>
  <div class="fx" data-lang="text">f5: grid [-2.69, -1.16, -0.07, 1.09, 2.84]
   PDP (avg P(churn)) [0.549, 0.639, 0.491, 0.368, 0.36]
   ICE change from 5th to 95th percentile: 10th pct -0.868, median -0.192, 90th pct +0.646
row_noise: grid [0.05, 0.26, 0.5, 0.75, 0.95]
   PDP (avg P(churn)) [0.499, 0.499, 0.49, 0.487, 0.479]
   ICE change from 5th to 95th percentile: 10th pct -0.107, median -0.006, 90th pct +0.040
2-way PDP f5 x f8 (rows: f5 low/mid/high, cols: f8 low/mid/high):
[[0.617 0.55  0.477]
 [0.411 0.559 0.355]
 [0.122 0.341 0.53 ]]</div>
  <ul>
    <li><strong>f5's PDP</strong> rises from 0.549 to 0.639 and then falls to 0.36: on average, high f5 means lower churn risk, but not in a straight line. A linear model could not show that bend.</li>
    <li><strong>f5's ICE curves disagree wildly.</strong> Moving f5 from its 5th to its 95th percentile lowers the churn probability by 0.868 for some customers (10th percentile of the changes) and <em>raises</em> it by 0.646 for others (90th percentile). The PDP's average change (about −0.19) describes almost nobody. That spread is the signature of interactions.</li>
    <li><strong>The 2-way PDP finds the partner.</strong> When f8 is low (first column), raising f5 cuts churn from 0.617 to 0.122. When f8 is high (last column), raising f5 slightly <em>increases</em> churn (0.477 → 0.53). The effect of f5 flips sign depending on f8. Section 07 will find the same pair from SHAP interaction values.</li>
    <li><strong>row_noise</strong> has a nearly flat PDP (0.499 → 0.479) and ICE changes centred on 0 (median −0.006). The small wiggles are the model's memorised noise.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: correlated columns create fake rows</span>
    <p>PDP overwrites one column while keeping the others. If the columns are related (age and years of experience), the grid creates rows like "age 22, experience 30 years". The model's output there is meaningless, yet it is averaged into the curve. Fix: <strong>ALE plots</strong> (Accumulated Local Effects) only compare predictions within small windows of the real data, so they avoid impossible rows. Not built into scikit-learn; the <code>alibi</code> and <code>PyALE</code> packages have them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the average can hide opposite effects</span>
    <p>If the column pushes half the customers up and half down, the PDP is flat, and you would wrongly conclude "no effect". Always look at ICE curves (or a SHAP dependence plot) before saying a column does nothing.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We still cannot answer the third question: "why did the model give <em>this</em> customer a score of 80?" We want to split her 80 into fair contributions from tenure, complaints and bill, one number each, that add up exactly. That is a problem game theory solved in 1953.</div>

  <h2 id="mte-shapley"><span class="num">06</span>Shapley Values by Hand</h2>
  <p><strong>The need.</strong> Customer x has tenure 6 months, 3 complaints and a ₹1,200 bill. The toy model from section 05 gives her a score of <strong>80</strong>. The average customer (our four background customers) gets <strong>30</strong>. So something about her adds 50 points. How much of those 50 is because of tenure, how much complaints, how much bill? We want three numbers that add up to exactly 50 and that are "fair".</p>
  <h3>The game-theory story</h3>
  <p>Three friends start a food stall together. Alone, or in pairs, they would earn different amounts; together they earn ₹80 a day where a stall with none of them would earn ₹30 (the rent-paying baseline). How should the extra ₹50 be shared? Lloyd Shapley's 1953 answer: imagine the friends join the stall one at a time, in a random order. Each time someone joins, note how much the earnings go up: that is their <strong>marginal contribution</strong> at that moment. Average each person's marginal contribution over all possible joining orders. That average is their <strong>Shapley value</strong>.</p>
  <p>In machine learning: the "players" are the feature values of one row, the "payout" is the prediction, and a "coalition" is a set of features whose values we know. SHAP (SHapley Additive exPlanations, Lundberg &amp; Lee 2017) is this idea applied to models.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Splitting a taxi fare fairly. Asha alone would pay ₹100, Ravi alone ₹120, together ₹150 because they share the route. Who should pay what? Look at who joined first in each possible order and charge each person the extra they caused, then average over the orders. That is the Shapley rule, and it is the only rule that satisfies a short list of "fairness" properties (below).</p>
  </div>
  <h3>Step 1: what does "only some features known" mean?</h3>
  <p>A model needs all three inputs. To value a coalition S (say, "we only know tenure = 6"), we fill the unknown columns from real background customers and average. This is the same averaging used by the PDP:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Value of a coalition</strong> (interventional form): <code>v(S) = (1/n) Σᵢ f(x_S, b_C⁽ⁱ⁾)</code>: features in S take customer x's values, features not in S (the set C) take background row i's values, average over the n background rows. So v(∅) = average prediction over the background = E[f], and v(all) = f(x).</p>
  </div>
  <p>Customer x = (tenure 6, complaints 3, bill 1200). Background b1–b4 from section 05. Let us compute all 2³ = 8 coalitions. T = tenure, C = complaints, B = bill. For each background row, take x's values for the features in S and the row's own values for the rest, and run the rule.</p>
  <table class="tbl">
    <tr><th>S (features from x)</th><th>b1 → input · score</th><th>b2 → input · score</th><th>b3 → input · score</th><th>b4 → input · score</th><th>v(S)</th></tr>
    <tr><td>∅</td><td>(24,0,800) · 10</td><td>(6,0,1500) · 30</td><td>(36,2,900) · 50</td><td>(18,1,1100) · 30</td><td><b>30</b></td></tr>
    <tr><td>{T}</td><td>(6,0,800) · 10</td><td>(6,0,1500) · 30</td><td>(6,2,900) · 80</td><td>(6,1,1100) · 30</td><td><b>37.5</b></td></tr>
    <tr><td>{C}</td><td>(24,3,800) · 50</td><td>(6,3,1500) · 80</td><td>(36,3,900) · 50</td><td>(18,3,1100) · 50</td><td><b>57.5</b></td></tr>
    <tr><td>{B}</td><td>(24,0,1200) · 30</td><td>(6,0,1200) · 30</td><td>(36,2,1200) · 50</td><td>(18,1,1200) · 30</td><td><b>35</b></td></tr>
    <tr><td>{T, C}</td><td>(6,3,800) · 80</td><td>(6,3,1500) · 80</td><td>(6,3,900) · 80</td><td>(6,3,1100) · 80</td><td><b>80</b></td></tr>
    <tr><td>{T, B}</td><td>(6,0,1200) · 30</td><td>(6,0,1200) · 30</td><td>(6,2,1200) · 80</td><td>(6,1,1200) · 30</td><td><b>42.5</b></td></tr>
    <tr><td>{C, B}</td><td>(24,3,1200) · 50</td><td>(6,3,1200) · 80</td><td>(36,3,1200) · 50</td><td>(18,3,1200) · 50</td><td><b>57.5</b></td></tr>
    <tr><td>{T, C, B}</td><td colspan="4">(6,3,1200) for every row · 80</td><td><b>80</b></td></tr>
  </table>
  <h3>Step 2: average the marginal contributions over all orders</h3>
  <p>With 3 features there are 3! = 6 joining orders. In each order, a feature's marginal contribution is v(after it joins) − v(before it joins):</p>
  <table class="tbl">
    <tr><th>order</th><th>tenure adds</th><th>complaints adds</th><th>bill adds</th><th>check (sum)</th></tr>
    <tr><td>T, C, B</td><td>v(T) − v(∅) = 7.5</td><td>v(TC) − v(T) = 42.5</td><td>v(TCB) − v(TC) = 0</td><td>50</td></tr>
    <tr><td>T, B, C</td><td>7.5</td><td>v(TCB) − v(TB) = 37.5</td><td>v(TB) − v(T) = 5</td><td>50</td></tr>
    <tr><td>C, T, B</td><td>v(TC) − v(C) = 22.5</td><td>v(C) − v(∅) = 27.5</td><td>0</td><td>50</td></tr>
    <tr><td>C, B, T</td><td>v(TCB) − v(CB) = 22.5</td><td>27.5</td><td>v(CB) − v(C) = 0</td><td>50</td></tr>
    <tr><td>B, T, C</td><td>v(TB) − v(B) = 7.5</td><td>37.5</td><td>v(B) − v(∅) = 5</td><td>50</td></tr>
    <tr><td>B, C, T</td><td>22.5</td><td>v(CB) − v(B) = 22.5</td><td>5</td><td>50</td></tr>
    <tr><td><b>average (÷ 6)</b></td><td><b>90 / 6 = 15</b></td><td><b>195 / 6 = 32.5</b></td><td><b>15 / 6 = 2.5</b></td><td><b>50</b></td></tr>
  </table>
  <p>So: <strong>base 30 + tenure 15 + complaints 32.5 + bill 2.5 = 80</strong>, exactly her prediction. In words: "Her score is 50 above average. Two thirds of that (32.5) is her 3 complaints, 15 is her short tenure, and only 2.5 is her high bill."</p>
  <p>Look at why. Every order gives a sum of 50 (each row of the table telescopes from v(∅) to v(all)), so the averages must add to 50 too. Complaints' contribution varies from 22.5 to 42.5 depending on who joined before it; Shapley averages that out. Bill adds 5 when it joins before complaints (bill matters for low-complaint customers) and 0 after (once we know she has 3 complaints, the rule never looks at bill).</p>
  <h3>Step 3: the same thing as a formula</h3>
  <p>Instead of listing orders, group them by the set S of features that joined before j. A given S appears in |S|! · (M − |S| − 1)! of the M! orders (the features in S can arrive in any order before j, the rest in any order after). So:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shapley value</strong> of feature j: <code>φⱼ = Σ over S ⊆ F∖{j} of [ |S|! (M − |S| − 1)! / M! ] · [ v(S ∪ {j}) − v(S) ]</code>, where F is the set of all M features. With M = 3 the weights are 1/3 for S = ∅, 1/6 for each one-feature S, and 1/3 for the two-feature S.</p>
  </div>
  <p>Check for tenure: (1/3)·7.5 + (1/6)·22.5 [S={C}] + (1/6)·7.5 [S={B}] + (1/3)·22.5 [S={C,B}] = 2.5 + 3.75 + 1.25 + 7.5 = <strong>15</strong>. ✓</p>
  <p>The brute-force code computes all 8 coalition values and applies the formula literally:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from itertools import combinations
from math import factorial

def f(t, c, b):                       # the toy churn score (0-100)
    if c &gt;= 2:
        return 80 if t &lt; 12 else 50
    return 30 if b &gt; 1000 else 10

x = {"tenure": 6, "complaints": 3, "bill": 1200}           # the customer to explain
bg = pd.DataFrame({"tenure": [24, 6, 36, 18], "complaints": [0, 0, 2, 1],
                   "bill": [800, 1500, 900, 1100]})          # background customers
feats = list(x)

def v(S):                             # value of coalition S: features in S fixed to x
    vals = []
    for _, r in bg.iterrows():
        row = {k: (x[k] if k in S else r[k]) for k in feats}
        vals.append(f(row["tenure"], row["complaints"], row["bill"]))
    return np.mean(vals)

for k in range(4):
    for S in combinations(feats, k):
        print(f"v({{{', '.join(S)}}}) = {float(v(S))}")

def shapley(j):
    others = [k for k in feats if k != j]
    n, total = len(feats), 0.0
    for k in range(n):
        for S in combinations(others, k):
            w = factorial(len(S)) * factorial(n - len(S) - 1) / factorial(n)
            total += w * (v(S + (j,)) - v(S))
    return total

phi = {j: float(shapley(j)) for j in feats}
print("Shapley:", phi, " sum =", sum(phi.values()), " f(x) - E[f] =", float(v(tuple(feats)) - v(())))</div>
  <div class="fx" data-lang="text">v({}) = 30.0
v({tenure}) = 37.5
v({complaints}) = 57.5
v({bill}) = 35.0
v({tenure, complaints}) = 80.0
v({tenure, bill}) = 42.5
v({complaints, bill}) = 57.5
v({tenure, complaints, bill}) = 80.0
Shapley: {'tenure': 15.0, 'complaints': 32.5, 'bill': 2.5}  sum = 50.0  f(x) - E[f] = 50.0</div>
  <p>Now the libraries. We fit the rule as a real scikit-learn tree, then ask <code>shap.TreeExplainer</code> (the fast tree algorithm, told to use our four background rows) and <code>shap.explainers.Exact</code> (a model-agnostic brute force) for the same customer:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, shap
from itertools import product
from sklearn.tree import DecisionTreeRegressor, export_text

def f(t, c, b):
    if c &gt;= 2:
        return 80 if t &lt; 12 else 50
    return 30 if b &gt; 1000 else 10

grid = pd.DataFrame(list(product([6, 11, 12, 18, 24, 36], [0, 1, 2, 3], [800, 1000, 1001, 1200, 1500])),
                    columns=["tenure", "complaints", "bill"])
yg = [f(*r) for r in grid.values]
tree = DecisionTreeRegressor(random_state=0).fit(grid, yg)   # learns f exactly
print(export_text(tree, feature_names=list(grid.columns)))

bg = pd.DataFrame({"tenure": [24, 6, 36, 18], "complaints": [0, 0, 2, 1], "bill": [800, 1500, 900, 1100]})
x = pd.DataFrame({"tenure": [6], "complaints": [3], "bill": [1200]})

ex = shap.TreeExplainer(tree, data=bg, feature_perturbation="interventional")
print("TreeSHAP  :", ex.shap_values(x).round(3), " base:", ex.expected_value)
exact = shap.explainers.Exact(tree.predict, shap.maskers.Independent(bg))
e = exact(x)
print("Exact     :", e.values.round(3), " base:", e.base_values)</div>
  <div class="fx" data-lang="text">|--- complaints &lt;= 1.50
|   |--- bill &lt;= 1000.50
|   |   |--- value: [10.00]
|   |--- bill &gt;  1000.50
|   |   |--- value: [30.00]
|--- complaints &gt;  1.50
|   |--- tenure &lt;= 11.50
|   |   |--- value: [80.00]
|   |--- tenure &gt;  11.50
|   |   |--- value: [50.00]

TreeSHAP  : [[15.  32.5  2.5]]  base: 30.0
Exact     : [[15.  32.5  2.5]]  base: [30.]</div>
  <p>Both give base 30 and (15, 32.5, 2.5). Our table, our formula and two independent algorithms agree.</p>
  <h3>The four fairness properties</h3>
  <p>Shapley proved his rule is the <em>only</em> way to split the payout that satisfies all four of these. That uniqueness is why SHAP is trusted more than ad-hoc attribution methods:</p>
  <table class="tbl">
    <tr><th>Property</th><th>Plain words</th><th>In our example</th></tr>
    <tr><td><b>Efficiency</b> (local accuracy)</td><td>The contributions add up exactly to prediction − baseline</td><td>15 + 32.5 + 2.5 = 80 − 30</td></tr>
    <tr><td><b>Symmetry</b></td><td>Two features that always add the same amount get the same value</td><td>(none are symmetric here)</td></tr>
    <tr><td><b>Dummy</b> (missingness)</td><td>A feature that never changes any v(S) gets 0</td><td>A 4th column the model ignores would get exactly 0</td></tr>
    <tr><td><b>Additivity</b> (linearity)</td><td>For a sum of models, the values are the sums of each model's values</td><td>For a forest or booster (a sum of trees), SHAP of the ensemble = sum of SHAP of each tree. TreeSHAP uses this.</td></tr>
  </table>
  <p>SHAP adds one more property that matters in comparisons: <strong>consistency</strong>. If you change a model so that a feature's marginal contribution never decreases in any coalition, its SHAP value cannot go down. Split-count and gain-based importance can violate this: a feature can become more useful yet get a lower gain importance because it moved lower in the tree.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A SHAP value is never "the effect of the feature" in isolation. It is the feature's fair share of the difference between <em>this</em> prediction and the <em>background</em> average. Change the background (all customers vs only Mumbai customers) and the values change, because the question changed.</p>
  </div>
  <h3>Shapley interaction values</h3>
  <p>Complaints added 42.5 when tenure was already known but only 27.5 when nothing was known. That gap is an <strong>interaction</strong>: tenure and complaints together do more than the sum of their parts (the 80 rule needs both). SHAP interaction values split each φⱼ into a <em>main effect</em> plus <em>pair</em> terms.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For i ≠ j: <code>Φᵢⱼ = Σ over S ⊆ F∖{i,j} of [ |S|! (M − |S| − 2)! / (2 (M − 1)!) ] · ∇ᵢⱼ(S)</code>, with <code>∇ᵢⱼ(S) = v(S∪{i,j}) − v(S∪{i}) − v(S∪{j}) + v(S)</code> ("together minus each alone"). The main effect is Φᵢᵢ = φᵢ − Σ_{j≠i} Φᵢⱼ. Each row of the matrix sums to φᵢ, and the whole matrix sums to f(x) − E[f].</p>
  </div>
  <p>By hand for tenure × complaints (M = 3, so both weights are 1/4):</p>
  <ul>
    <li>∇(∅) = v(TC) − v(T) − v(C) + v(∅) = 80 − 37.5 − 57.5 + 30 = 15</li>
    <li>∇({B}) = v(TCB) − v(TB) − v(CB) + v(B) = 80 − 42.5 − 57.5 + 35 = 15</li>
    <li>Φ_TC = ¼ · (15 + 15) = <strong>7.5</strong>, and Φ_CT = 7.5 too (the pair's total 15 is split in half).</li>
  </ul>
  <p>Complaints × bill: ∇(∅) = 57.5 − 57.5 − 35 + 30 = −5, ∇({T}) = 80 − 80 − 42.5 + 37.5 = −5, so Φ_CB = ¼ · (−10) = <strong>−2.5</strong>: a negative interaction, because once complaints are high, bill stops mattering. Tenure × bill: both ∇ are 0, so Φ_TB = 0 (the rule never uses them together). Main effects: tenure 15 − 7.5 − 0 = 7.5; complaints 32.5 − 7.5 + 2.5 = 27.5; bill 2.5 − 0 + 2.5 = 5.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from itertools import combinations
from math import factorial

def f(t, c, b):
    if c &gt;= 2:
        return 80 if t &lt; 12 else 50
    return 30 if b &gt; 1000 else 10
x = {"tenure": 6, "complaints": 3, "bill": 1200}
bg = pd.DataFrame({"tenure": [24, 6, 36, 18], "complaints": [0, 0, 2, 1], "bill": [800, 1500, 900, 1100]})
feats = list(x); M = len(feats)

def v(S):
    return np.mean([f(*[x[k] if k in S else r[k] for k in feats]) for _, r in bg.iterrows()])

def shapley(j):
    others = [k for k in feats if k != j]
    return sum(factorial(len(S)) * factorial(M - len(S) - 1) / factorial(M) * (v(S + (j,)) - v(S))
               for k in range(M) for S in combinations(others, k))

def interaction(i, j):                 # SHAP interaction index for i != j (half of the pair's total)
    others = [k for k in feats if k not in (i, j)]
    tot = 0.0
    for k in range(len(others) + 1):
        for S in combinations(others, k):
            w = factorial(len(S)) * factorial(M - len(S) - 2) / (2 * factorial(M - 1))
            tot += w * (v(S + (i, j)) - v(S + (i,)) - v(S + (j,)) + v(S))
    return tot

Phi = pd.DataFrame(0.0, index=feats, columns=feats)
for i in feats:
    for j in feats:
        if i != j:
            Phi.loc[i, j] = interaction(i, j)
    Phi.loc[i, i] = shapley(i) - Phi.loc[i].sum()      # main effect = SHAP value minus its interactions
print(Phi)
print("row sums (= SHAP values):", Phi.sum(axis=1).tolist(), " total:", Phi.values.sum())</div>
  <div class="fx" data-lang="text">            tenure  complaints  bill
tenure         7.5         7.5   0.0
complaints     7.5        27.5  -2.5
bill           0.0        -2.5   5.0
row sums (= SHAP values): [15.0, 32.5, 2.5]  total: 50.0</div>
  <p>The matrix matches: diagonal 7.5, 27.5, 5; off-diagonal 7.5 (T×C) and −2.5 (C×B); each row sums to the SHAP value and the total is 50.</p>
  <div class="callout trap"><span class="label">Trap: brute force explodes</span>
    <p>M features need 2^M coalitions, and each coalition needs predictions on every background row. For our 14 churn columns that is 16,384 coalitions × background rows per customer; for 200 columns it is impossible. That is why the next section's TreeSHAP matters.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We can compute Shapley values exactly for 3 features. We need the same exact answer for 14 or 500 features and 500 trees, fast enough to explain thousands of rows. TreeSHAP does that by using the tree structure.</div>

  <h2 id="mte-shap"><span class="num">07</span>SHAP in Practice</h2>
  <h3>TreeSHAP: exact Shapley values, fast</h3>
  <p>Brute force needs 2^M coalitions. For 14 columns that is 16,384 coalitions, each averaged over the background rows, for every customer you explain. TreeSHAP (Lundberg et al., 2018–2020) avoids the enumeration. The key observation: a tree's prediction for a coalition S only depends on which branches the row can follow. At a split on a feature in S, the row goes the way x goes; at a split on a feature not in S, it goes both ways, weighted by how the background rows split. TreeSHAP walks each root-to-leaf path once and keeps track, with a small dynamic program, of how many features of each coalition size are "fixed" on that path, which gives exactly the Shapley weights. And because a forest or booster is a <em>sum</em> of trees, the additivity property lets it explain each tree separately and add the results.</p>
  <table class="tbl">
    <tr><th>Variant</th><th>What "unknown feature" means</th><th>Cost per row</th><th>Use</th></tr>
    <tr><td><b>Path-dependent</b> (<code>feature_perturbation="tree_path_dependent"</code>, the default with no data)</td><td>At a split on an unknown feature, follow both children weighted by how many <em>training</em> rows went each way (the tree's stored "cover")</td><td>O(T · L · D²): T trees, L leaves, depth D</td><td>Fast default; no background data needed; supports interaction values</td></tr>
    <tr><td><b>Interventional</b> (<code>data=background</code>)</td><td>Fill unknown features from real background rows and average, exactly like our hand example</td><td>O(T · L · B) for B background rows</td><td>Cleaner causal-style meaning ("break the link to other features"); what we used in section 06</td></tr>
    <tr><td><b>KernelSHAP</b> (model-agnostic)</td><td>Background rows; a weighted linear regression over sampled coalitions approximates φ</td><td>Many model calls; approximate</td><td>Non-tree models, or probability-space explanations</td></tr>
  </table>
  <h3>On the churn data</h3>
  <p>The next block explains the 480-tree LightGBM model. It checks additivity on all 3,000 validation rows, prints global importance (mean |SHAP|), walks through one customer, summarises a dependence plot in numbers, computes interaction values, and finally runs KernelSHAP in probability units for comparison.</p>
  <div class="fx" data-lang="py">import lightgbm as lgb, shap
m = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1).fit(Xtr, ytr)
t0 = time.time()
ex = shap.TreeExplainer(m)
sv = ex(Xva)                                           # 3,000 rows x 14 columns, log-odds units
print(f"TreeSHAP on 3,000 rows: {time.time()-t0:.2f}s   shape {sv.values.shape}")
raw = m.predict(Xva, raw_score=True)
print("additivity: max |base + sum(SHAP) - raw score| =", float(np.abs(sv.base_values + sv.values.sum(1) - raw).max()))
glob = pd.Series(np.abs(sv.values).mean(0), Xva.columns).sort_values(ascending=False)
print("mean |SHAP| (global):"); print(glob.round(3).to_string())
i = 0
c = pd.Series(sv.values[i], Xva.columns)
print(f"\\ncustomer {i}: base {sv.base_values[i]:.3f}  raw {raw[i]:.3f}  prob {m.predict_proba(Xva.iloc[[i]])[0,1]:.3f}")
top = c.reindex(c.abs().sort_values(ascending=False).index)
run = sv.base_values[i]
for col, val in top.head(5).items():
    run += val
    print(f"  {col:10s} = {Xva.iloc[i][col]:7.3f}  SHAP {val:+.3f}  running total {run:.3f}")
print(f"  other 9 columns together: {top.iloc[5:].sum():+.3f}  -&gt; {run + top.iloc[5:].sum():.3f}")
# dependence: how f5's SHAP value moves with f5's value
bins = pd.qcut(Xva["f5"], 5)
print("\\nf5 value bin -&gt; mean SHAP of f5:")
print(pd.Series(sv.values[:, list(Xva.columns).index("f5")]).groupby(bins.values, observed=True).mean().round(3).to_string())
# interaction values (path-dependent) on 200 rows
t0 = time.time()
iv = ex.shap_interaction_values(Xva.iloc[:200])
print(f"\\ninteraction values for 200 rows: {time.time()-t0:.1f}s  shape {iv.shape}")
print("rows of interaction matrix sum to SHAP values:", np.allclose(iv.sum(2), sv.values[:200], atol=1e-4))
A = np.abs(iv).mean(0); np.fill_diagonal(A, 0)
inter = pd.DataFrame(A, Xva.columns, Xva.columns)
pairs = inter.where(np.triu(np.ones(inter.shape, bool), 1)).stack().sort_values(ascending=False)
print("strongest pairs (mean |interaction|, one half):"); print(pairs.head(3).round(3).to_string())
# probability-space explanation (model-agnostic, slower)
t0 = time.time()
bgd = shap.sample(Xtr, 100, random_state=0)
ke = shap.KernelExplainer(lambda d: m.predict_proba(pd.DataFrame(d, columns=Xva.columns))[:, 1], bgd)
kv = ke.shap_values(Xva.iloc[:1], nsamples=500, silent=True)
print(f"\\nKernelSHAP, 1 row, probability units: {time.time()-t0:.1f}s; sum {kv.sum():+.3f} + base {ke.expected_value:.3f} = {kv.sum()+ke.expected_value:.3f}")</div>
  <div class="fx" data-lang="text">TreeSHAP on 3,000 rows: 25.51s   shape (3000, 14)
additivity: max |base + sum(SHAP) - raw score| = 3.019806626980426e-14
mean |SHAP| (global):
f5            0.767
f8            0.500
f9            0.423
f4            0.400
f7            0.364
f3            0.330
f6            0.303
f2            0.216
row_noise     0.089
f10           0.063
f11           0.062
f0            0.048
f1            0.048
coin_noise    0.008

customer 0: base 0.022  raw 3.897  prob 0.980
  f8         =  -2.154  SHAP +1.553  running total 1.575
  f3         =   2.318  SHAP +0.659  running total 2.235
  f9         =   0.781  SHAP +0.487  running total 2.721
  f5         =  -0.284  SHAP +0.469  running total 3.191
  f4         =   0.722  SHAP +0.275  running total 3.465
  other 9 columns together: +0.432  -&gt; 3.897

f5 value bin -&gt; mean SHAP of f5:
(-7.277, -1.382]    0.536
(-1.382, -0.402]    0.681
(-0.402, 0.402]     0.047
(0.402, 1.417]     -0.638
(1.417, 7.215]     -0.764

interaction values for 200 rows: 24.2s  shape (200, 14, 14)
rows of interaction matrix sum to SHAP values: True
strongest pairs (mean |interaction|, one half):
f5  f8    0.227
f8  f9    0.174
f5  f6    0.167

KernelSHAP, 1 row, probability units: 3.0s; sum +0.489 + base 0.492 = 0.980</div>
  <p>Line by line:</p>
  <ul>
    <li><strong>Additivity holds to 3 × 10⁻¹⁴</strong> on every one of the 3,000 rows: base value + sum of the 14 SHAP values = the model's raw score. That is the efficiency property from section 06, now on 480 trees.</li>
    <li><strong>Units.</strong> For a LightGBM/XGBoost classifier, TreeSHAP explains the <em>raw score</em>, which is in log-odds (<a class="xref" data-note="ml_classification">Classification</a>). Customer 0's raw score 3.897 is a probability of 1/(1 + e^−3.897) = 0.980. The base 0.022 is the average log-odds, about probability 0.505. SHAP values in log-odds add up; their effect on probability does not (the sigmoid bends). The last line uses KernelSHAP on <code>predict_proba</code> instead: there the contributions sum to +0.489 on top of a base of 0.492, giving 0.980 directly, at the cost of an approximation and ~3 s for one row.</li>
    <li><strong>Global importance.</strong> Mean |SHAP| ranks f5 (0.767), f8 (0.500), f9, f4, f7, f3, f6, f2: the same informative columns permutation importance found. But <code>row_noise</code> gets 0.089, above the real-but-useless f10/f11 (0.063). The booster genuinely used the noise column to fit training rows, and SHAP faithfully reports what the model does, mistakes included.</li>
    <li><strong>One customer.</strong> She starts at 0.022 (the average) and f8 = −2.154 pushes her up by 1.553 log-odds, f3 by 0.659, f9 by 0.487, f5 by 0.469, f4 by 0.275; the other nine columns add 0.432, landing at 3.897. That is a waterfall plot, drawn below.</li>
    <li><strong>Dependence, in numbers.</strong> Grouping rows into five bins of f5's value, f5's average SHAP goes +0.54, +0.68, +0.05, −0.64, −0.76: low f5 pushes towards churn, high f5 away, with the same bend the PDP showed.</li>
    <li><strong>Interactions.</strong> For 200 rows, the 14 × 14 interaction matrices sum (along each row) to the SHAP values, as the definition requires. The strongest pair is f5 × f8 (0.227), exactly the pair the 2-way PDP flagged.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 600 270" width="600">
<line x1="150" y1="20" x2="150" y2="240" stroke="currentColor" stroke-opacity="0.4"/>
<text x="150" y="258" text-anchor="middle" class="tm" font-size="11">0</text><text x="250" y="258" text-anchor="middle" class="tm" font-size="11">1</text><text x="350" y="258" text-anchor="middle" class="tm" font-size="11">2</text><text x="450" y="258" text-anchor="middle" class="tm" font-size="11">3</text><text x="550" y="258" text-anchor="middle" class="tm" font-size="11">4</text>
<line x1="150" y1="245" x2="560" y2="245" stroke="currentColor" stroke-opacity="0.4"/>
<text x="140" y="34" text-anchor="end" font-size="11">base value</text><rect x="150" y="24" width="2.2" height="16" class="fs" stroke="currentColor"/><text x="160" y="36" class="tm" font-size="11">0.022</text>
<text x="140" y="64" text-anchor="end" font-size="11">f8 = −2.154</text><rect x="152.2" y="54" width="155.3" height="16" class="fr"/><text x="312" y="66" class="tr" font-size="11">+1.553</text>
<text x="140" y="94" text-anchor="end" font-size="11">f3 = 2.318</text><rect x="307.5" y="84" width="65.9" height="16" class="fr"/><text x="378" y="96" class="tr" font-size="11">+0.659</text>
<text x="140" y="124" text-anchor="end" font-size="11">f9 = 0.781</text><rect x="373.5" y="114" width="48.7" height="16" class="fr"/><text x="427" y="126" class="tr" font-size="11">+0.487</text>
<text x="140" y="154" text-anchor="end" font-size="11">f5 = −0.284</text><rect x="422.1" y="144" width="46.9" height="16" class="fr"/><text x="474" y="156" class="tr" font-size="11">+0.469</text>
<text x="140" y="184" text-anchor="end" font-size="11">f4 = 0.722</text><rect x="469.1" y="174" width="27.5" height="16" class="fr"/><text x="501" y="186" class="tr" font-size="11">+0.275</text>
<text x="140" y="214" text-anchor="end" font-size="11">9 other columns</text><rect x="496.5" y="204" width="43.2" height="16" class="fr"/><text x="490" y="216" text-anchor="end" class="tr" font-size="11">+0.432</text>
<line x1="539.7" y1="20" x2="539.7" y2="240" class="sb" stroke-dasharray="4 3" stroke-width="1.5"/>
<text x="535" y="16" text-anchor="end" class="tb" font-size="11">f(x) = 3.897 log-odds → P = 0.980</text>
</svg><figcaption>A waterfall plot for customer 0, drawn from the printed numbers. Each bar starts where the previous one ended; red bars push towards churn (a blue bar would push away). The last bar ends exactly at the model's raw score.</figcaption></figure>
  <h3>The standard SHAP plots, and how to read them</h3>
  <table class="tbl">
    <tr><th>Plot</th><th>Code</th><th>Shows</th><th>How to read</th></tr>
    <tr><td><b>Waterfall</b></td><td><code>shap.plots.waterfall(sv[0])</code></td><td>One row: base → each feature's push → prediction</td><td>Biggest bars are the "reason codes" for this prediction</td></tr>
    <tr><td><b>Force</b></td><td><code>shap.plots.force(sv[0])</code></td><td>Same as waterfall, as one horizontal tug-of-war</td><td>Red features push right (higher), blue push left</td></tr>
    <tr><td><b>Bar</b></td><td><code>shap.plots.bar(sv)</code></td><td>Mean |SHAP| per feature</td><td>Global importance ranking (like the list printed above)</td></tr>
    <tr><td><b>Beeswarm</b> (summary)</td><td><code>shap.plots.beeswarm(sv)</code></td><td>One dot per row per feature: x = SHAP value, colour = feature value (red high, blue low)</td><td>Red dots on the right → high values raise the prediction. For f5 you would see blue dots on the right and red on the left (high f5 lowers churn)</td></tr>
    <tr><td><b>Dependence / scatter</b></td><td><code>shap.plots.scatter(sv[:, "f5"], color=sv)</code></td><td>x = feature value, y = its SHAP value, colour = the feature it interacts with most</td><td>The shape of the effect (like a PDP, but per row); vertical spread = interactions</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant bill split. The waterfall is one table's bill: starter ₹200, mains ₹600, desserts ₹150. The bar plot is the restaurant's monthly report: on average, mains are the biggest item. The beeswarm shows every table's bill at once, coloured by how many people sat there.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: background choice</span>
    <p>SHAP values are relative to a baseline. "f8 pushed her up by 1.55" means relative to the average training customer (path-dependent) or to your background set (interventional). Explaining a loan refusal relative to "all applicants" vs "approved applicants" gives different, both correct, numbers. State the baseline when you report.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: log-odds are not probabilities</span>
    <p>A SHAP value of +1.0 log-odds moves a probability of 0.50 to 0.73, but moves 0.95 only to 0.98. Do not convert each SHAP value to "percentage points" separately; they do not add up in probability space. Use KernelSHAP (or <code>model_output="probability"</code> with interventional TreeSHAP) if stakeholders need probability units.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Every method so far assumed each column brings its own information. Real tables have twins: monthly and annual bill, age and date of birth. What happens to importance when two columns say the same thing?</div>

  <h2 id="mte-corr"><span class="num">08</span>Correlated Features</h2>
  <p>Add a near-copy of the strongest column: <code>f5_twin = f5 + small noise</code> (correlation 0.9996). The information in the data has not changed at all. Watch what each method says.</p>
  <div class="fx" data-lang="py">import lightgbm as lgb, shap
from sklearn.inspection import permutation_importance
rng2 = np.random.default_rng(1)
def add_twin(D):
    D = D.copy(); D["f5_twin"] = D["f5"] + rng2.normal(0, 0.05, len(D)); return D
Xtr2, Xva2 = add_twin(Xtr), add_twin(Xva)
print("corr(f5, f5_twin) =", round(np.corrcoef(Xtr2.f5, Xtr2.f5_twin)[0, 1], 4))
rows = {}
for name, A, B in [("without twin", Xtr, Xva), ("with twin", Xtr2, Xva2)]:
    rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(A, ytr)
    mdi = pd.Series(rf.feature_importances_, A.columns)
    perm = pd.Series(permutation_importance(rf, B, yva, n_repeats=5, random_state=0, n_jobs=-1).importances_mean, A.columns)
    m = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1).fit(A, ytr)
    sh = pd.Series(np.abs(shap.TreeExplainer(m)(B).values).mean(0), A.columns)
    for col in ["f5", "f5_twin"]:
        if col in A:
            rows[(name, col)] = {"MDI": mdi[col], "perm_val": perm[col], "mean|SHAP|": sh[col]}
    print(f"{name}: RF val acc {rf.score(B, yva):.3f}")
# drop-column with the twin present
rf_full = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(Xtr2, ytr)
base = rf_full.score(Xva2, yva)
for col in ["f5", "f5_twin"]:
    m = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(Xtr2.drop(columns=col), ytr)
    rows[("with twin", col)]["drop_col"] = base - m.score(Xva2.drop(columns=col), yva)
both = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(Xtr2.drop(columns=["f5", "f5_twin"]), ytr)
print("drop BOTH f5 and f5_twin:", round(base - both.score(Xva2.drop(columns=["f5", "f5_twin"]), yva), 3))
# grouped permutation: shuffle both columns with the same row order
idx = rng2.permutation(len(Xva2)); Xg = Xva2.copy()
Xg[["f5", "f5_twin"]] = Xva2[["f5", "f5_twin"]].values[idx]
print("grouped permutation (f5 + twin together):", round(base - rf_full.score(Xg, yva), 3))
print(pd.DataFrame(rows).T.round(3).to_string())</div>
  <div class="fx" data-lang="text">corr(f5, f5_twin) = 0.9996
without twin: RF val acc 0.881
with twin: RF val acc 0.875
drop BOTH f5 and f5_twin: 0.028
grouped permutation (f5 + twin together): 0.221
                        MDI  perm_val  mean|SHAP|  drop_col
without twin f5       0.139     0.193       0.767       NaN
with twin    f5       0.085     0.043       0.494     0.001
             f5_twin  0.089     0.058       0.295    -0.006</div>
  <table class="tbl">
    <tr><th>Method</th><th>f5 alone</th><th>f5 with twin</th><th>f5_twin</th><th>What happened</th></tr>
    <tr><td>MDI</td><td>0.139</td><td>0.085</td><td>0.089</td><td>Credit split roughly in half: trees used one or the other at random</td></tr>
    <tr><td>Permutation (val)</td><td>0.193</td><td>0.043</td><td>0.058</td><td>Both collapse: shuffle one, the model still reads the other. Sum 0.10, about half the true value</td></tr>
    <tr><td>Drop-column</td><td>(0.033 earlier)</td><td>0.001</td><td>−0.006</td><td>Both ≈ 0: retrain without one, the twin fully replaces it</td></tr>
    <tr><td>mean |SHAP| (LightGBM)</td><td>0.767</td><td>0.494</td><td>0.295</td><td>Split between the twins; the sum (0.789) ≈ the original</td></tr>
    <tr><td>Grouped permutation</td><td colspan="3">shuffle f5 and twin together: 0.221</td><td>Restores the true importance of the information</td></tr>
    <tr><td>Drop both</td><td colspan="3">0.028</td><td>The pair is needed even though each alone looks useless</td></tr>
  </table>
  <p>Read the drop-column row carefully: each twin alone looks useless (0.001 and −0.006). An analyst who drops "useless columns" one at a time on that evidence would drop both and lose 2.8 accuracy points.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With correlated columns, every importance method answers a question about <em>that column given the others are still there</em>. None of them tells you how important the underlying information is. Low importance for a column with a twin does not mean "safe to drop both".</p>
  </div>
  <p>Fixes, in order of how often they are used:</p>
  <ol>
    <li><strong>Group before measuring.</strong> Cluster columns by correlation (Spearman, or hierarchical clustering on 1 − |ρ|), then permute or drop each group together, as the grouped-permutation line does. SHAP values of a group can simply be added (additivity).</li>
    <li><strong>Keep one representative</strong> per cluster before training, if you do not need the duplicates.</li>
    <li><strong>Conditional methods.</strong> Conditional permutation (shuffle within bins of the correlated feature) and conditional SHAP (fill unknown features from rows similar on the known ones) keep rows realistic but blur the line between "model uses it" and "it is correlated with something the model uses".</li>
  </ol>
  <div class="bridge"><b>What's still missing?</b> Even with perfect, independent features, an explanation answers "what does the model use?" Managers will hear "what causes churn, and what should we change?" Those are different questions, and confusing them costs money.</div>

  <h2 id="mte-causal"><span class="num">09</span>Explanation ≠ Causation</h2>
  <p>A simulation where we <em>know</em> the truth. Two real causes decide churn: a price hike (0/1) and tenure. A third column, <code>cancel_visits</code> (visits to the "cancel subscription" page), is a <strong>symptom</strong>: customers who are already leaving visit it, but visiting it does not make anyone leave. We train a booster on all three and then ask "what would happen if we changed a column?"</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, shap, lightgbm as lgb
rng = np.random.default_rng(0); n = 20000
price_hike = rng.integers(0, 2, n)                       # the real cause (0/1)
tenure = rng.integers(1, 60, n)                          # also a real cause
p = 1 / (1 + np.exp(-(-2.0 + 2.0 * price_hike - 0.03 * tenure)))
churn = rng.random(n) &lt; p                                # the real world decides churn
cancel_visits = rng.poisson(np.where(churn, 3.0, 0.3))   # a SYMPTOM: people about to leave visit the cancel page
X = pd.DataFrame({"price_hike": price_hike, "tenure": tenure, "cancel_visits": cancel_visits})
m = lgb.LGBMClassifier(n_estimators=200, learning_rate=0.05, verbose=-1).fit(X[:15000], churn[:15000])
sv = shap.TreeExplainer(m)(X[15000:])
print("mean |SHAP|:", pd.Series(np.abs(sv.values).mean(0), X.columns).round(3).to_dict())
Xt = X[15000:]
print(f"model's predicted churn rate, as is          : {m.predict_proba(Xt)[:, 1].mean():.3f}")
print(f"model's predicted churn rate, cancel_visits=0: {m.predict_proba(Xt.assign(cancel_visits=0))[:, 1].mean():.3f}")
# the real world: hiding the cancel page does not change p, so true churn stays the same
print(f"true churn rate (simulation), either way     : {churn[15000:].mean():.3f}")
p_no_hike = 1 / (1 + np.exp(-(-2.0 - 0.03 * Xt.tenure)))
print(f"true churn rate if price_hike removed for all: {p_no_hike.mean():.3f}")
print(f"model's predicted rate with price_hike=0     : {m.predict_proba(Xt.assign(price_hike=0))[:, 1].mean():.3f}")</div>
  <div class="fx" data-lang="text">mean |SHAP|: {'price_hike': 1.197, 'tenure': 0.668, 'cancel_visits': 2.622}
model's predicted churn rate, as is          : 0.178
model's predicted churn rate, cancel_visits=0: 0.016
true churn rate (simulation), either way     : 0.171
true churn rate if price_hike removed for all: 0.058
model's predicted rate with price_hike=0     : 0.126</div>
  <ul>
    <li><strong>SHAP's top feature is the symptom:</strong> cancel_visits 2.622, ahead of the real causes price_hike 1.197 and tenure 0.668. Correct as a description of the model: it is the best <em>predictor</em>.</li>
    <li><strong>Acting on it would be useless.</strong> Hide the cancel page (cancel_visits = 0 for everyone) and the model predicts churn falls from 17.8% to 1.6%. In the simulated world, churn does not change at all (17.1%), because visits never caused anything.</li>
    <li><strong>The real lever is under-estimated.</strong> Removing the price hike truly cuts churn to 5.8%. The model predicts only 12.6%, because much of the price hike's effect is "explained away" by the visits it causes.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ice-cream sales predict drowning deaths very well (both rise in summer). A SHAP plot on a drowning model would rank ice-cream sales highly. Banning ice cream saves nobody.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Predictive importance</strong>: how much the model relies on a feature to predict. <strong>Causal effect</strong>: how much the outcome would change if you intervened on the feature. Importance methods estimate the first. The second needs experiments (<a class="xref" data-note="st_abtesting">A/B Testing</a>) or causal-inference methods with assumptions about which variables cause which.</p>
  </div>
  <p>Where explanation methods <em>are</em> reliable and valuable: debugging the model, finding leakage (a symptom column like cancel_visits is often exactly that: in production you would not have it before the customer decides), checking the model matches domain knowledge, reason codes for individual decisions, and choosing what to monitor.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"SHAP says high bills drive churn, so cut bills" is a causal claim made from a predictive tool. At best it is a hypothesis to test with an experiment.</p>
  </div>

  <h2 id="mte-cmp"><span class="num">10</span>Comparing the Methods</h2>
  <div style="overflow-x:auto"><table class="tbl">
    <tr><th>Method</th><th>Question answered</th><th>Scope</th><th>Data</th><th>Cost</th><th>Model-agnostic?</th><th>Main weakness</th></tr>
    <tr><td>MDI (impurity, "gain")</td><td>How much training impurity did its splits remove?</td><td>Global</td><td>Training (free)</td><td>None</td><td>No (trees)</td><td>Many-valued bias; training data only</td></tr>
    <tr><td>Split count ("weight")</td><td>How often is it used?</td><td>Global</td><td>Training</td><td>None</td><td>No</td><td>Counts tiny noisy splits</td></tr>
    <tr><td>Permutation</td><td>How much does this model's score drop without its information?</td><td>Global</td><td>Held-out</td><td>d × K predictions</td><td>Yes</td><td>Twins hide each other; impossible rows</td></tr>
    <tr><td>Drop-column</td><td>Would a retrained model be worse without it?</td><td>Global</td><td>Held-out</td><td>d retrainings</td><td>Yes</td><td>Expensive; twins replace each other; noisy</td></tr>
    <tr><td>PDP</td><td>How does the average prediction move with the feature?</td><td>Global effect</td><td>Any rows</td><td>grid × n predictions</td><td>Yes</td><td>Averages hide interactions; fake rows</td></tr>
    <tr><td>ICE</td><td>How does each row's prediction move?</td><td>Per row</td><td>Any rows</td><td>Same as PDP</td><td>Yes</td><td>Cluttered; fake rows</td></tr>
    <tr><td>SHAP (TreeSHAP)</td><td>How much did each feature push this prediction from the baseline?</td><td>Local, and global by averaging</td><td>Background / training cover</td><td>Fast for trees</td><td>TreeSHAP no; KernelSHAP yes</td><td>Explains the model, not the world; correlated features split credit</td></tr>
    <tr><td>SHAP interaction values</td><td>How much is due to pairs of features?</td><td>Local / global</td><td>Training cover</td><td>~M × SHAP cost</td><td>No</td><td>Slow on many features</td></tr>
  </table></div>
  <h3>A practical workflow</h3>
  <div class="flow"><span>Permutation on validation (with repeats)</span><span>Group correlated columns</span><span>Drop-column check before removing anything</span><span>SHAP bar + beeswarm for the story</span><span>PDP/ICE or SHAP dependence for top features</span><span>Waterfall for individual decisions</span></div>
  <ol>
    <li>Look at MDI only as a quick sanity check, and never present it as the answer.</li>
    <li>Use permutation importance on held-out data to rank features and to spot leakage (a feature that is "too good").</li>
    <li>Cluster correlated features, and measure groups.</li>
    <li>Before dropping a feature, confirm with drop-column (or drop the group and retrain).</li>
    <li>Use SHAP to describe how features push predictions, and for per-row reason codes.</li>
    <li>Treat every "this feature drives the target" statement as a hypothesis for an experiment.</li>
  </ol>
  <h3>Relation to the other notes</h3>
  <table class="tbl">
    <tr><th>Note</th><th>What it says about interpretation</th></tr>
    <tr><td><a class="xref" data-note="ml_dtree">Decision Trees</a></td><td>A single tree is directly readable (<code>export_text</code>); MDI is defined there</td></tr>
    <tr><td><a class="xref" data-note="ml_rf">Random Forest</a></td><td>MDI's bias on forests and permutation importance as the fix</td></tr>
    <tr><td><a class="xref" data-note="ml_xgboost">XGBoost</a>, <a class="xref" data-note="ml_lightgbm">LightGBM</a></td><td>Built-in importance types and <code>pred_contribs=True</code> / <code>pred_contrib=True</code> for native TreeSHAP</td></tr>
    <tr><td><a class="xref" data-note="ml_catboost">CatBoost</a></td><td><code>get_feature_importance(type="ShapValues")</code> and its own loss-based importance</td></tr>
    <tr><td><a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a></td><td>Using importance for feature selection and drift monitoring</td></tr>
  </table>

  <h2 id="mte-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: presenting MDI as the truth</span>
    <p>Pure noise with 20,000 values got 0.036 MDI, as much as real columns, because MDI is computed on training data and favours many-valued columns. Use permutation on validation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: permutation on training data</span>
    <p>It measures what the model memorised, not what generalises. Use held-out rows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dropping both twins</span>
    <p>Each of two correlated columns can look useless (drop-column 0.001 and −0.006) while the pair is worth 0.028. Measure and drop groups.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a flat PDP means "no effect"</span>
    <p>Opposite effects in different rows cancel in the average. Check ICE curves or SHAP dependence plots.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: adding SHAP values in probability space</span>
    <p>TreeSHAP for boosters is in log-odds. The pushes add up there, not in percentage points.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: causal language</span>
    <p>"Cancel-page visits drive churn" was the model's top reason and had zero causal effect. Importance is about prediction; interventions need experiments.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the baseline</span>
    <p>SHAP values are differences from a reference. Report which background you used.</p>
  </div>

  <h2 id="mte-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How is MDI computed? Give the formula for one split.</summary><div class="qa-body">For each split node t: Δ(t) = (N_t/N)·[imp(t) − (N_L/N_t)·imp(L) − (N_R/N_t)·imp(R)]. Add Δ to the feature used at t, sum over all nodes, average over trees, normalise to sum 1. In our 10-row tree: tenure 0.3086 and bill 0.1714 → 0.643 and 0.357.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is MDI biased toward high-cardinality features?</summary><div class="qa-body">A feature with many distinct values offers many candidate thresholds, so deep in the tree some threshold separates a few training rows by chance; the impurity drop is credited to it. MDI is measured on training data, so this memorisation counts as importance. Pure noise with 20,000 values scored 0.036 vs 0.005 for 0/1 noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain permutation importance and why it is computed on validation data.</summary><div class="qa-body">Score the model on held-out data, shuffle one column (breaking its link to the target while keeping its distribution), re-score, and take the drop, averaged over several shuffles. On training data it measures memorisation; on held-out data it measures what the model needs to generalise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Permutation vs drop-column importance: what's the difference, and why can drop-column be much smaller?</summary><div class="qa-body">Permutation keeps the trained model and destroys one column's information. Drop-column retrains without the column, so the new model can lean on substitutes. In our toy, tenure was worth 0.5 by permutation but 0.167 by drop-column, because the retrained tree rebuilt the rule from bill and complaints.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a partial dependence plot, and what does ICE add?</summary><div class="qa-body">PD(v) = average over rows of f(feature = v, other features as they are). ICE plots each row's curve separately; PDP is their mean. Non-parallel ICE curves reveal interactions the PDP averages away (in our toy, the jump at 2 complaints was +20 for one customer and +50 for another).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define the Shapley value and compute the weights for 3 features.</summary><div class="qa-body">φⱼ = Σ_{S ⊆ F∖{j}} |S|!(M−|S|−1)!/M! · [v(S∪{j}) − v(S)], the average marginal contribution of j over all orders in which features can join. For M = 3: weight 1/3 for S = ∅, 1/6 for each single-feature S, 1/3 for the two-feature S.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "local accuracy" (efficiency) mean for SHAP, and why does it matter?</summary><div class="qa-body">The base value plus all SHAP values equals the model's output for that row, exactly. Our toy: 30 + 15 + 32.5 + 2.5 = 80; on the churn booster the error was 3 × 10⁻¹⁴. It makes SHAP values usable as an accounting of the prediction (reason codes), unlike ad-hoc attributions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is TreeSHAP fast, and what is the difference between path-dependent and interventional?</summary><div class="qa-body">It uses the tree structure: one pass over each root-to-leaf path with a dynamic program instead of 2^M coalitions, and additivity across trees. Path-dependent treats unknown features by following both branches weighted by training cover (no background data). Interventional fills unknown features from a background dataset, like the hand computation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are SHAP interaction values? Give the toy example.</summary><div class="qa-body">A matrix per row that splits each SHAP value into a main effect (diagonal) and pair effects (off-diagonal, split in half between the two). In the toy, tenure × complaints = 7.5 each way (the 80 rule needs both), complaints × bill = −2.5 (high complaints make bill irrelevant). Rows sum to the SHAP values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features are 0.9996 correlated. What happens to each importance method?</summary><div class="qa-body">MDI and SHAP split the credit between them; permutation importance drops for both (shuffle one, the other covers); drop-column goes to ≈ 0 for both (retrain uses the twin). Fix: measure the group (grouped permutation gave 0.221 vs 0.043 + 0.058 individually), or keep one representative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>SHAP says feature X is the most important. Can you conclude that changing X will change the outcome?</summary><div class="qa-body">No. SHAP explains the model's predictions. In our simulation the top SHAP feature (cancel-page visits) was a symptom with zero causal effect: forcing it to 0 changed predicted churn from 17.8% to 1.6% but real churn not at all. Causal claims need experiments or causal inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An ID-like column shows up near the top of feature importance. How do you investigate?</summary><div class="qa-body">Check which importance: MDI favours many-valued columns. Run permutation importance on validation; if it drops to ≈ 0 it was memorisation. If it stays high, suspect leakage (IDs assigned in time order, or encoding the outcome), check its relation to the target and to time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do these methods connect to the rest of the tree family?</summary><div class="qa-body">MDI comes straight from the impurity decreases of <a class="xref" data-note="ml_dtree">Decision Trees</a>; the forest and booster notes use it and show its bias. TreeSHAP uses the additivity of ensembles (a forest or booster is a sum of trees). Permutation importance is a model evaluation idea (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>). In production (<a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>), importance guides feature selection and what to monitor for drift.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do XGBoost's "weight", "gain" and "cover" importances disagree?</summary><div class="qa-body">They count different things: weight = number of splits using the feature, gain = average (or total) loss reduction of those splits, cover = number of rows (Hessian mass) affected. A noisy continuous feature can have high weight (many tiny splits) but low gain. They are also all training-data, MDI-style measures, unlike permutation or SHAP.</div></details>
</main>
`
});
