// notes/ml/ml_tree_explain.js — Feature Importance & SHAP
Object.assign(TOPIC_CONTENT, {
  "ml_tree_explain": `<main>
  <h1>Feature Importance &amp; SHAP</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>Feature Importance &amp; SHAP</span></div>
  <p class="lead">A random forest of 300 trees or a booster of 500 trees cannot be read aloud the way one small tree can. This note gives the "why" back. It covers every standard way to ask a tree model what it is looking at: impurity importance (MDI), permutation importance, drop-column importance, partial dependence and ICE curves, and SHAP values, which come from a 1950s idea in game theory. Every formula is worked by hand on tiny tables first, then checked against the libraries, then run on the same 20,000-row churn dataset used across this group. You will also see where each method lies to you: many-valued columns, twin columns, and the big one, explanation is not causation. Every method is first worked by hand on the running example of the whole tree group, a decision tree grown on the captain's 14-day cricket diary, and then run on the 20,000-row churn data as the same idea at scale.</p>

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
    <li><strong>Came from:</strong> <a class="xref" data-note="ml_dtree">Decision Trees</a> gave us a model you can read: "if not overcast and humidity is normal and it is 19 °C or colder, then no match". Then <a class="xref" data-note="ml_rf">Random Forest</a>, <a class="xref" data-note="ml_gbm">Gradient Boosting</a>, <a class="xref" data-note="ml_xgboost">XGBoost</a>, <a class="xref" data-note="ml_lightgbm">LightGBM</a> and <a class="xref" data-note="ml_catboost">CatBoost</a> bought accuracy by combining hundreds of trees. The price: nobody can read 300 trees. The decision tree note showed a short version of MDI importance; this note finishes the job.</li>
    <li><strong>What this note adds:</strong> numbers that answer three different questions. (1) <em>Which columns does the model use overall?</em> (global importance). (2) <em>How does the prediction change as one column changes?</em> (partial dependence, ICE). (3) <em>Why did the model say this for this one customer?</em> (local explanation, SHAP).</li>
    <li><strong>Leads to:</strong> <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>, where importance helps you drop useless columns, check a model before shipping and watch which features drift. It also connects back to <a class="xref" data-note="ml_evaluation">Model Evaluation</a> (permutation importance is "how much does the score drop") and to <a class="xref" data-note="st_probability">Probability</a> (expectations over a background dataset).</li>
  </ul>

    <h2 id="mte-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each method answers the question above it; its weakness raises the next question. Numbers are from the running example: a fully grown decision tree on the captain's 14-day cricket diary (columns Overcast, Sunny, Rain, Humid, Windy, TempC; target Play).</p>
  <ol class="story">
    <li><b>Why explain</b><span>Q: a model of hundreds of trees cannot be read; what can we still ask it? → Three questions: which columns matter (global importance), how the prediction moves with a column (effect), why this prediction (local attribution). Which columns matter first?</span></li>
    <li><b>MDI</b><span>Q: how much did each column help while the trees were built? → Add up the impurity drops of its splits: TempC 0.498, Humid 0.280, Overcast 0.222, Windy 0, although wind is the captain's real reason. MDI is free, but measured on training rows and biased toward many-valued columns…</span></li>
    <li><b>Permutation importance</b><span>Q: how much does the model's score suffer if a column's information is destroyed? → Shuffle it and re-score: Overcast 0.357, TempC 0.214, Humid 0.143. But it judges this one trained model; would a model trained without the column be worse?</span></li>
    <li><b>Drop-column importance</b><span>Q: should we keep the column at all? → Retrain without it: on the diary the tree is <em>better</em> without TempC (leave-one-out 0.571 → 0.714). All three give one number per column; how does the prediction actually move?</span></li>
    <li><b>Partial dependence &amp; ICE</b><span>Q: what is the shape of a column's effect? → Overwrite it and average: TempC's PDP is flat except a bump to 1.0 at 20 °C, because normal-humidity days step up at 19 °C and humid days step down at 21.5 °C. Still no answer for one particular day…</span></li>
    <li><b>Shapley values</b><span>Q: why did the tree say No for D6? → Share the gap from the average fairly: base 0.643, TempC −0.381, Outlook −0.202, Humid −0.060, Windy 0. Exact, but 2^M coalitions…</span></li>
    <li><b>SHAP in practice</b><span>Q: how do we get exact Shapley values for 500 trees and many columns? → TreeSHAP walks the trees; on churn, additivity holds to 3 × 10⁻¹⁴. But what if two columns carry the same information?</span></li>
    <li><b>Correlated features</b><span>Q: what happens with twins? → Credit is split or vanishes; measure groups. And even with clean columns, does "important" mean "causes"?</span></li>
    <li><b>Explanation ≠ causation</b><span>Q: can we act on an explanation? → No: the diary tree blames the cold for D6, but the wind was the reason; on churn the top SHAP column was a pure symptom. Importance is about prediction; causes need experiments.</span></li>
  </ol>

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
          <li>Diary tree: Overcast 0.222, Humid 0.280, TempC 0.498, Windy 0</li>
          <li>⚠ Training data only; favours many-valued columns (row_noise 0.036 vs coin_noise 0.005)</li>
          <li>XGBoost/LightGBM: weight (count), gain, cover</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Permutation &amp; drop-column</div>
        <ul>
          <li><b>Permutation</b> — shuffle one column on validation; importance = score drop</li>
          <li>Diary: rotate Overcast → acc 1.0 → 0.643 (drop 0.357); TempC 0.214</li>
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
          <li>Diary: TempC 18, 20, 24, 28 → PD 0.643, 1.0, 0.643, 0.643</li>
          <li>ICE: normal days step up at 19 °C, humid days step down at 21.5 °C → interaction with humidity</li>
          <li>⚠ Correlated columns → impossible rows; use ALE</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SHAP</div>
        <ul>
          <li><b>Shapley</b> — fair split of a payout among players; φⱼ = weighted avg of marginal contributions</li>
          <li>Weights |S|!(M−|S|−1)!/M!; for 3 features 1/3, 1/6, 1/6, 1/3</li>
          <li>D6: base 0.643 → 0: TempC −0.381, Outlook −0.202, Humid −0.060, Windy 0</li>
          <li><b>Additivity</b> — base + Σφ = prediction, exactly</li>
          <li><b>TreeSHAP</b> — exact, polynomial time for trees; log-odds units for classifiers</li>
          <li>Plots: bar, beeswarm, dependence, waterfall, force</li>
          <li><b>Interactions</b> — Φ matrix; rows sum to φ; diary Humid×TempC = −0.393</li>
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
      <div class="rm-item rm-done" data-target="mte-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="mte-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Explain a Tree Model</span><span class="rm-sub">Three questions, and the diary tree</span></div></div>
      <div class="rm-item rm-done" data-target="mte-mdi"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">MDI: Impurity Importance</span><span class="rm-sub">Free, but biased</span></div></div>
      <div class="rm-item rm-done" data-target="mte-perm"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Permutation Importance</span><span class="rm-sub">Shuffle and re-score</span></div></div>
      <div class="rm-item rm-done" data-target="mte-drop"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Drop-Column Importance</span><span class="rm-sub">Retrain without it</span></div></div>
      <div class="rm-item rm-done" data-target="mte-pdp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Partial Dependence &amp; ICE</span><span class="rm-sub">The shape of an effect</span></div></div>
      <div class="rm-item rm-done" data-target="mte-shapley"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Shapley Values by Hand</span><span class="rm-sub">Why No for D6?</span></div></div>
      <div class="rm-item rm-done" data-target="mte-shap"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SHAP in Practice</span><span class="rm-sub">TreeSHAP, plots, units</span></div></div>
      <div class="rm-item rm-done" data-target="mte-corr"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Correlated Features</span><span class="rm-sub">Twins share the blame</span></div></div>
      <div class="rm-item rm-done" data-target="mte-causal"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Explanation ≠ Causation</span><span class="rm-sub">Prediction is not a lever</span></div></div>
      <div class="rm-item rm-done" data-target="mte-cmp"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Comparing the Methods</span><span class="rm-sub">Which question, which tool</span></div></div>
      <div class="rm-item rm-done" data-target="mte-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One model, many questions</span></div></div>
      <div class="rm-item rm-done" data-target="mte-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What misleads teams</span></div></div>
      <div class="rm-item rm-done" data-target="mte-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="mte-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="mte-why"><span class="num">01</span>Why Explain a Tree Model</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Forests and boosters bought accuracy by combining hundreds of trees, and nobody can read hundreds of trees. What can we still ask such a model, and which tool answers which question?</p>
  </div>
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
  <h3>The running example: a tree grown on the cricket diary</h3>
  <p>Every note of the tree group uses the captain's 14-day diary. Here we let scikit-learn grow a full decision tree to predict Play from six columns: Overcast, Sunny, Rain (the outlook as 0/1 columns), Humid (1 = high humidity), Windy (1 = strong wind) and TempC. The captain's own rule, the ID3 tree of <a class="xref" data-note="ml_dtree">Decision Trees</a>, is "overcast → play; sunny → play if humidity is normal; rain → play if the wind is weak". The CART tree below (section 02) fits all 14 days just as well, but it uses temperature where the captain used wind. A tree small enough to read lets us check every method against what we can see with our own eyes; the churn data then shows the same methods on a model nobody can read.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Feature importance</strong>: a score per input column measuring how much a trained model depends on it. <strong>Feature effect</strong>: how the model's output changes as the column's value changes. <strong>Local attribution</strong>: a split of one prediction into per-column contributions. These are three different things, and a column can rank differently on each.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>All of these methods explain <strong>the model</strong>. If the model is bad, or leaned on a leaked column, the explanation faithfully describes a bad model. They say nothing directly about the real world. Section 09 shows this in numbers.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: MDI.</b> We need a first, cheap answer to "which columns matter". The trees already recorded how much each split helped while they were being built. Adding those numbers up is MDI.</div>

  <h2 id="mte-mdi"><span class="num">02</span>MDI: Impurity Importance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which columns does the model rely on? A tree already knows how much each of its splits lowered impurity while it was grown. Can we simply add those numbers up per column?</p>
  </div>
  <p><strong>The need.</strong> While a tree grows, every split is chosen because it lowers impurity (Gini or entropy; see <a class="xref" data-note="ml_dtree">Decision Trees</a>). That drop is a measure of how useful the split was. If we add up every drop made by splits on <code>tenure</code>, we get a measure of how much the tree leaned on tenure. That is <strong>Mean Decrease in Impurity (MDI)</strong>, also called Gini importance or impurity importance. It is what <code>feature_importances_</code> returns in scikit-learn.</p>
  <h3>The formula, in plain words</h3>
  <p>At a node t with N_t training rows, split into a left child (N_L rows) and a right child (N_R rows), the impurity decrease is the parent's impurity minus the size-weighted impurity of the children. MDI also multiplies by N_t/N, the share of all training rows that reach this node, so a split near the root (which touches everyone) counts more than one deep down (which touches three rows).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Weighted impurity decrease of node t: <code>Δ(t) = (N_t / N) · [ imp(t) − (N_L/N_t)·imp(L) − (N_R/N_t)·imp(R) ]</code>.<br>
    MDI of feature j in one tree = sum of Δ(t) over all nodes t that split on j.<br>
    For a forest: average the per-tree MDI over trees, then normalise so all features sum to 1.</p>
  </div>
  <h3>Worked by hand: the diary tree</h3>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import export_text
from common import X, y, tree                     # the diary as numbers + a fully grown CART tree
print(export_text(tree, feature_names=list(X.columns)))
t = tree.tree_; N = t.n_node_samples[0]
mdi = dict.fromkeys(X.columns, 0.0)
for node in range(t.node_count):
    L, R = t.children_left[node], t.children_right[node]
    if L == -1: continue                                  # a leaf: no split
    nt, nl, nr = t.n_node_samples[node], t.n_node_samples[L], t.n_node_samples[R]
    d = nt / N * (t.impurity[node] - nl / nt * t.impurity[L] - nr / nt * t.impurity[R])
    mdi[X.columns[t.feature[node]]] += d
    print(f"node {node}: {X.columns[t.feature[node]]:8s} n={nt:2d} gini {t.impurity[node]:.4f} -&gt; weighted decrease {d:.4f}")
tot = sum(mdi.values())
print("by hand :", {k: round(float(v / tot), 3) for k, v in mdi.items()})
print("sklearn :", {c: round(float(s), 3) for c, s in zip(X.columns, tree.feature_importances_)})</div>
  <div class="fx" data-lang="text">|--- Overcast &lt;= 0.50
|   |--- Humid &lt;= 0.50
|   |   |--- TempC &lt;= 19.00
|   |   |   |--- class: 0
|   |   |--- TempC &gt;  19.00
|   |   |   |--- class: 1
|   |--- Humid &gt;  0.50
|   |   |--- TempC &lt;= 21.50
|   |   |   |--- class: 1
|   |   |--- TempC &gt;  21.50
|   |   |   |--- class: 0
|--- Overcast &gt;  0.50
|   |--- class: 1

node 0: Overcast n=14 gini 0.4592 -&gt; weighted decrease 0.1020
node 1: Humid    n=10 gini 0.5000 -&gt; weighted decrease 0.1286
node 2: TempC    n= 5 gini 0.3200 -&gt; weighted decrease 0.1143
node 5: TempC    n= 5 gini 0.3200 -&gt; weighted decrease 0.1143
by hand : {'Overcast': 0.222, 'Sunny': 0.0, 'Rain': 0.0, 'Humid': 0.28, 'Windy': 0.0, 'TempC': 0.498}
sklearn : {'Overcast': 0.222, 'Sunny': 0.0, 'Rain': 0.0, 'Humid': 0.28, 'Windy': 0.0, 'TempC': 0.498}</div>
  <p>The tree makes four splits. Step by step (Gini, 14 days, 9 played):</p>
  <ol>
    <li><strong>Root</strong>: 14 days, 9 Yes and 5 No. Gini = 1 − ((9/14)² + (5/14)²) = <strong>0.4592</strong>. Split "Overcast": the 4 overcast days are all Yes (Gini 0); the other 10 are 5 Yes / 5 No (Gini 0.5). Δ = (14/14) · [0.4592 − (10/14) · 0.5] = 0.4592 − 0.3571 = <strong>0.1020</strong> → Overcast.</li>
    <li><strong>Node of 10 non-overcast days</strong> splits on Humid: 5 normal days (4 Yes, 1 No: Gini 1 − 0.8² − 0.2² = 0.32) and 5 humid days (1 Yes, 4 No: Gini 0.32). Δ = (10/14) · [0.5 − 0.5 · 0.32 − 0.5 · 0.32] = (10/14) · 0.18 = <strong>0.1286</strong> → Humid.</li>
    <li><strong>Normal-humidity node (5 days)</strong> splits on TempC ≤ 19: D6 (18 °C, the only "No") alone, both sides pure. Δ = (5/14) · 0.32 = <strong>0.1143</strong> → TempC.</li>
    <li><strong>Humid node (5 days)</strong> splits on TempC ≤ 21.5: D4 (21 °C, the only "Yes") alone. Δ = (5/14) · 0.32 = <strong>0.1143</strong> → TempC again.</li>
    <li>Totals: Overcast 0.1020, Humid 0.1286, TempC 0.2286, all others 0; sum 0.4592 (all the impurity the tree removed). Normalised: Overcast <strong>0.222</strong>, Humid <strong>0.280</strong>, TempC <strong>0.498</strong>, Windy, Sunny, Rain <strong>0</strong>.</li>
  </ol>
  <p>Windy gets zero, although wind is exactly what decides rainy days in the captain's rule: the tree separated D6 (windy, no play) by its temperature instead, because D6 also happens to be the coldest normal day. And TempC, the column with the most distinct values (8), collects half the importance by peeling off one odd day at a time. MDI measures <em>use on the training rows</em>, not <em>relevance</em>: the high-cardinality bias, in miniature. The code reproduces every number from the fitted tree and matches scikit-learn's <code>feature_importances_</code>.</p>
  <h3>Importance types in the boosting libraries</h3>
  <p>XGBoost and LightGBM offer several "importance types". They are all MDI-style numbers read from the trees, just counted differently:</p>
  <table class="tbl">
    <tr><th>Type</th><th>Counts</th><th>Where</th><th>Note</th></tr>
    <tr><td><code>weight</code> / <code>split</code></td><td>How many splits use the feature</td><td>XGBoost <code>weight</code>; LightGBM default <code>split</code></td><td>Many tiny splits on a noisy column look important</td></tr>
    <tr><td><code>gain</code> / <code>total_gain</code></td><td>Average / total loss reduction from its splits</td><td>XGBoost default for the sklearn API is <code>gain</code>; LightGBM <code>importance_type="gain"</code></td><td>Closest to MDI</td></tr>
    <tr><td><code>cover</code> / <code>total_cover</code></td><td>Rows (Hessian sum) passing through its splits</td><td>XGBoost</td><td>How many samples the feature's decisions touch</td></tr>
  </table>
  <p>The three can rank features very differently. Always say which one you report.</p>
  <h3>At scale: the high-cardinality bias on the churn data</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Permutation importance.</b> MDI is computed on the training rows from the trees' own bookkeeping. We want a measure that only calls predict, measures the effect on a score we care about, and can be computed on rows the model has not seen.</div>

  <h2 id="mte-perm"><span class="num">03</span>Permutation Importance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>MDI rewards splits that fit training rows, including lucky ones. How can we measure how much the model's actual predictions depend on a column, using only predict?</p>
  </div>
  <p><strong>The idea.</strong> If the model really needs a column, then scrambling that column should hurt its score. Take the validation set, shuffle one column's values among the rows (so each row gets some other row's value), keep everything else the same, and score the model again. The drop in score is that column's importance.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Testing a cricket team by benching one player at a time, but keeping the team size the same by sending in a random spectator wearing his jersey. If the team collapses, that player mattered. If nothing changes, he was not doing much. (Counting how many balls a player touched in practice, the MDI way, can be misleading.)</p>
  </div>
  <p>Why shuffle instead of setting the column to 0 or deleting it? Shuffling keeps the column's distribution exactly the same (same values, same mean, same spread) but breaks its link with the target and with the other columns. The model still gets valid-looking input, so we measure only the lost information.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a fitted model f, a score s (accuracy, AUC, R², …) and a dataset D: <br>1) s₀ = score of f on D. <br>2) For each column j and each repeat k = 1..K: shuffle column j in D to get D̃ⱼₖ, compute sⱼₖ. <br>3) Importance(j) = s₀ − (1/K)·Σₖ sⱼₖ. Report the standard deviation across repeats too.</p>
  </div>
  <h3>Worked by hand: the diary tree</h3>
  <p>The diary has no fresh days, so here we score on the 14 training days themselves (on real data, always use held-out rows). So that it is reproducible by hand, we "shuffle" each column by rotating it down by one day (D1 gets D14's value, D2 gets D1's, …):</p>
  <div class="fx" data-lang="py">import numpy as np
from common import X, y, tree
base = (tree.predict(X) == y).mean()
print(f"baseline accuracy on the 14 days: {base:.3f}")
for c in X.columns:                                  # "shuffle" = rotate the column down by one day
    Xp = X.copy(); Xp[c] = np.roll(X[c].values, 1)
    acc = (tree.predict(Xp) == y).mean()
    print(f"rotate {c:8s} acc {acc:.3f}  drop {base - acc:+.3f}")</div>
  <div class="fx" data-lang="text">baseline accuracy on the 14 days: 1.000
rotate Overcast acc 0.643  drop +0.357
rotate Sunny    acc 1.000  drop +0.000
rotate Rain     acc 1.000  drop +0.000
rotate Humid    acc 0.857  drop +0.143
rotate Windy    acc 1.000  drop +0.000
rotate TempC    acc 0.786  drop +0.214</div>
  <p>Rotating Overcast moves the overcast flag onto D4, D8, D13, D14 instead of D3, D7, D12, D13: five days change prediction and 5 of the 14 are now wrong, accuracy 0.643, importance <strong>0.357</strong>. TempC: <strong>0.214</strong> (3 days get a temperature on the wrong side of 19 or 21.5 °C and flip). Humid: <strong>0.143</strong>. Sunny, Rain and Windy: <strong>0</strong>, because the tree never reads them, so shuffling them changes no prediction. The ranking differs from MDI (Overcast first here, TempC first there), and the numbers mean something different: "accuracy lost when the column's information is destroyed".</p>
  <h3>At scale: the churn data</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Drop-column importance.</b> Permutation asks how much <em>this trained model</em> suffers without a column's information. A different, practical question is whether a model trained <em>without</em> the column would be worse. That needs retraining.</div>

  <h2 id="mte-drop"><span class="num">04</span>Drop-Column Importance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Permutation importance judges one trained model. If we removed a column for good, the retrained model could lean on other columns instead. How much would we really lose?</p>
  </div>
  <p><strong>The idea.</strong> Train the model once with all columns and score it on validation. Then for each column, train a fresh model without that column and score it again. Importance = full score − score without it. It is the most direct answer to "should I keep this column?", and it is the most expensive: d columns means d extra training runs.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>DropImp(j) = s(model trained on all columns) − s(model retrained without column j), both measured on the same validation set with the same hyperparameters and random seed.</p>
  </div>
  <h3>Worked on the diary</h3>
  <p>Retrain the tree without each column and score every version the honest way available on 14 days: leave-one-day-out (train on 13 days, predict the 14th, repeat 14 times):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier
from common import X, y
def loo_acc(cols):                                   # leave-one-day-out accuracy of a fresh tree on these columns
    hits = 0
    for d in X.index:
        m = DecisionTreeClassifier(random_state=0).fit(X.loc[X.index != d, cols], y[X.index != d])
        hits += int(m.predict(X.loc[[d], cols])[0] == y[d])
    return hits / len(X)
full = loo_acc(list(X.columns))
print(f"all columns: leave-one-day-out accuracy {full:.3f}")
for c in X.columns:
    a = loo_acc([k for k in X.columns if k != c])
    print(f"without {c:8s}: {a:.3f}  drop-column importance {full - a:+.3f}")</div>
  <div class="fx" data-lang="text">all columns: leave-one-day-out accuracy 0.571
without Overcast: 0.500  drop-column importance +0.071
without Sunny   : 0.714  drop-column importance -0.143
without Rain    : 0.571  drop-column importance +0.000
without Humid   : 0.786  drop-column importance -0.214
without Windy   : 0.786  drop-column importance -0.214
without TempC   : 0.714  drop-column importance -0.143</div>
  <table class="tbl">
    <tr><th>column</th><th>MDI (normalised)</th><th>permutation (training days)</th><th>drop-column (leave-one-out)</th></tr>
    <tr><td>Overcast</td><td>0.222</td><td>0.357</td><td>+0.071</td></tr>
    <tr><td>Humid</td><td>0.280</td><td>0.143</td><td>−0.214</td></tr>
    <tr><td>TempC</td><td>0.498</td><td>0.214</td><td>−0.143</td></tr>
    <tr><td>Windy</td><td>0</td><td>0</td><td>−0.214</td></tr>
    <tr><td>Sunny / Rain</td><td>0 / 0</td><td>0 / 0</td><td>−0.143 / 0</td></tr>
  </table>
  <p>Three methods, three different stories, all correct for their own question. The full tree only gets 8 of 14 left-out days right (0.571, worse than always saying "Play", 0.643): fully grown on 13 days, it memorises odd days like D6 and D4. Without TempC it gets 0.714: the tree is <em>better</em> without its most "important" column by MDI, because TempC's splits were fitting single days. Most of the other negative values are noise: on 14 days every leave-one-out score moves in steps of 1/14 = 0.071, so differences of one or two days mean little. Only Overcast clearly helps. MDI: "how much training impurity did splits on this column remove?" Permutation: "how much does <em>this</em> model lose if the column's information is destroyed?" Drop-column: "how much would <em>any</em> model of this kind lose if we never had the column?"</p>
  <h3>At scale: the churn data</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Partial dependence &amp; ICE.</b> All three methods give one number per column. They say <em>how much</em> the model uses a column, not <em>how</em>: does the chance of play go up with temperature, down, or both?</div>

  <h2 id="mte-pdp"><span class="num">05</span>Partial Dependence &amp; ICE</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Importance says how much a column matters, not in which direction or with what shape. If the temperature rises, does the tree's chance of play rise, fall, or both?</p>
  </div>
  <p><strong>The need.</strong> "If it gets warmer, is a match more likely?" or, for churn, "if complaints go up, does the risk go up, and by how much?" That needs a curve: x-axis = the column's value, y-axis = the model's prediction. But the prediction also depends on the other columns. Partial dependence handles them by averaging them out over real rows.</p>
  <h3>The recipe, in plain words</h3>
  <ol>
    <li>Pick the column (TempC) and a grid of values (18, 20, 24, 28 °C).</li>
    <li>For the first value, take every row of a dataset, <em>overwrite</em> its TempC with 18, keep its other columns as they are, and predict.</li>
    <li>Average those predictions. That is one point of the curve.</li>
    <li>Repeat for 20, 24, 28.</li>
  </ol>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Partial dependence</strong> of the model f on column S at value v: <code>PD(v) = (1/n) Σᵢ f(x_S = v, x_C = x_C⁽ⁱ⁾)</code>, where C is every other column and the sum runs over n rows of a reference dataset. <strong>ICE</strong> (Individual Conditional Expectation): the same thing without the average, one curve per row: <code>ICEᵢ(v) = f(x_S = v, x_C = x_C⁽ⁱ⁾)</code>. So PDP = the mean of the ICE curves.</p>
  </div>
  <h3>Worked by hand: TempC in the diary tree</h3>
  <p>Overwrite TempC for all 14 days with 18, then 20, 24, 28 °C, keep every other column as it is, and predict:</p>
  <div class="fx" data-lang="py">import numpy as np
from common import X, y, tree, df
grid = [18, 20, 24, 28]
ice = {}
for v in grid:
    Xv = X.copy(); Xv["TempC"] = v                   # overwrite TempC for every day, keep the rest
    ice[v] = tree.predict_proba(Xv)[:, 1]
    print(f"TempC={v}: PD = {ice[v].mean():.3f}   ({int(ice[v].sum())} of 14 days predicted Play)")
groups = {"overcast": df.Outlook == "Overcast", "normal, not overcast": (df.Outlook != "Overcast") &amp; (df.Humidity == "Normal"),
          "humid, not overcast": (df.Outlook != "Overcast") &amp; (df.Humidity == "High")}
for g, m in groups.items():                          # ICE curves fall into three shapes
    print(f"ICE of {g:21s} ({list(df.index[m])}):", [int(ice[v][m.values][0]) for v in grid])
from sklearn.inspection import partial_dependence
pd_ = partial_dependence(tree, X, ["TempC"], grid_resolution=50, kind="average")
print("sklearn partial_dependence, min/max of the curve:", round(pd_["average"].min(), 3), round(pd_["average"].max(), 3))</div>
  <div class="fx" data-lang="text">TempC=18: PD = 0.643   (9 of 14 days predicted Play)
TempC=20: PD = 1.000   (14 of 14 days predicted Play)
TempC=24: PD = 0.643   (9 of 14 days predicted Play)
TempC=28: PD = 0.643   (9 of 14 days predicted Play)
ICE of overcast              (['D3', 'D7', 'D12', 'D13']): [1, 1, 1, 1]
ICE of normal, not overcast  (['D5', 'D6', 'D9', 'D10', 'D11']): [0, 1, 1, 1]
ICE of humid, not overcast   (['D1', 'D2', 'D4', 'D8', 'D14']): [1, 1, 0, 0]
sklearn partial_dependence, min/max of the curve: 0.643 1.0</div>
  <table class="tbl">
    <tr><th>TempC set to</th><th>4 overcast days</th><th>5 normal, not overcast</th><th>5 humid, not overcast</th><th>PD = average</th></tr>
    <tr><td>18</td><td>1, 1, 1, 1</td><td>0 (TempC ≤ 19 → No)</td><td>1 (TempC ≤ 21.5 → Yes)</td><td>(4 + 0 + 5)/14 = <b>0.643</b></td></tr>
    <tr><td>20</td><td>1</td><td>1</td><td>1</td><td>14/14 = <b>1.000</b></td></tr>
    <tr><td>24</td><td>1</td><td>1</td><td>0</td><td>9/14 = <b>0.643</b></td></tr>
    <tr><td>28</td><td>1</td><td>1</td><td>0</td><td><b>0.643</b></td></tr>
  </table>
  <p>The PDP reads: "the chance of play is 0.643 at any temperature, except a bump to 1.0 between 19 and 21.5 °C". The ICE curves (one per day) tell the real story: overcast days are flat at 1; the five normal-humidity days step <em>up</em> above 19 °C; the five humid days step <em>down</em> above 21.5 °C. Opposite effects in different groups mostly cancel in the average. When ICE curves are not parallel, the column <strong>interacts</strong> with others (here with Humid), and the single PDP line hides that. The bump itself is an artefact: it exists only because the tree memorised two single days, D6 (18 °C, no play) and D4 (21 °C, play).</p>
  <p>In practice you call <code>PartialDependenceDisplay.from_estimator(model, X, ["TempC"], kind="both")</code> to draw it; <code>kind="both"</code> overlays ICE lines on the PDP. <strong>Centred ICE</strong> (c-ICE, <code>centered=True</code>) shifts each curve to start at 0, which makes differences in the jump easier to see. A <strong>2-way PDP</strong> (pass a pair of columns) shows a heat map of the average prediction over a grid of two columns and is the standard way to look at an interaction.</p>
  <h3>At scale: the churn data</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Shapley values.</b> We still cannot answer the third question: why did the tree say No for <em>this</em> day, D6? We want to split the gap between D6's prediction and the average into fair contributions, one per column, that add up exactly.</div>

  <h2 id="mte-shapley"><span class="num">06</span>Shapley Values by Hand: Why No for D6?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The tree said "No match" for D6 while the average day gets 0.643. How much of that gap is due to the outlook, the humidity, the wind and the temperature, in a way that adds up exactly and is fair?</p>
  </div>
  <p><strong>The need.</strong> D6 was rainy, normal humidity, windy and 18 °C. The diary tree predicts Play = <strong>0</strong> for it. The average prediction over the 14 days is 9/14 = <strong>0.643</strong>. So something about D6 subtracts 0.643. How much of that is the outlook, the humidity, the wind, the temperature? We want four numbers that add up to exactly −0.643 and that are "fair".</p>
  <h3>The game-theory story</h3>
  <p>Players form a team and earn a payout; how should it be shared? Lloyd Shapley's 1953 answer: imagine the players join one at a time, in a random order. Each time someone joins, note how much the payout changes: their <strong>marginal contribution</strong> at that moment. Average each player's marginal contribution over all possible joining orders. That average is their <strong>Shapley value</strong>. In machine learning the "players" are the feature values of one row, the "payout" is the prediction, and a "coalition" is a set of features whose values we know. SHAP (SHapley Additive exPlanations, Lundberg &amp; Lee 2017) is this idea applied to models.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Splitting a taxi fare fairly. Asha alone would pay ₹100, Ravi alone ₹120, together ₹150 because they share the route. Who should pay what? Look at who joined first in each possible order and charge each person the extra they caused, then average over the orders. That is the Shapley rule, and it is the only rule that satisfies a short list of "fairness" properties (below).</p>
  </div>
  <h3>Step 1: what does "only some features known" mean?</h3>
  <p>The tree needs all inputs. To value a coalition S (say, "we only know that D6 was 18 °C"), fill the unknown columns from real background days and average. This is the same averaging the PDP used.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Value of a coalition</strong> (interventional form): <code>v(S) = (1/n) Σᵢ f(x_S, b_C⁽ⁱ⁾)</code>: features in S take day x's values, features not in S (the set C) take background row i's values, average over the n background rows. So v(∅) = average prediction over the background = E[f], and v(all) = f(x).</p>
  </div>
  <p>Players: Outlook (O = Rain, the three 0/1 columns together), Humid (H = normal), TempC (T = 18), Windy (W = strong). Background: all 14 diary days. Each v(S) is simply "how many of the 14 days are predicted Play once D6's values are pasted in for S", divided by 14. Windy never changes a prediction (the tree never reads it), so it is a <em>dummy</em> player and we can leave it out of the hand table. Pasting D6's values in, for example: v({T}) sets every day to 18 °C, which the PDP table already counted: 9/14. v({H, T}) makes every day "normal humidity, 18 °C": only the 4 overcast days still play, 4/14.</p>
  <table class="tbl">
    <tr><th>S (features from D6)</th><th>days predicted Play</th><th>v(S)</th></tr>
    <tr><td>∅</td><td>9 (the tree is right on all 14)</td><td>9/14 = 0.643</td></tr>
    <tr><td>{O} (all days rainy)</td><td>6: the 5 normal-humidity days warmer than 19 °C, plus D4</td><td>6/14 = 0.429</td></tr>
    <tr><td>{H} (all days normal humidity)</td><td>13: all but D6 itself</td><td>13/14 = 0.929</td></tr>
    <tr><td>{T} (all days 18 °C)</td><td>9: overcast 4 + humid 5</td><td>9/14 = 0.643</td></tr>
    <tr><td>{O, H}</td><td>12: all but the two 18 °C days</td><td>12/14 = 0.857</td></tr>
    <tr><td>{O, T}</td><td>7: the 7 humid days (cold + humid → Yes)</td><td>7/14 = 0.500</td></tr>
    <tr><td>{H, T}</td><td>4: only the overcast days</td><td>4/14 = 0.286</td></tr>
    <tr><td>{O, H, T} (= D6 itself)</td><td>0</td><td>0</td></tr>
  </table>
  <h3>Step 2: average the marginal contributions over all orders</h3>
  <p>With 3 players there are 3! = 6 joining orders. In each, a player's marginal contribution is v(after it joins) − v(before it joins). In fourteenths:</p>
  <table class="tbl">
    <tr><th>order</th><th>Outlook adds</th><th>Humid adds</th><th>TempC adds</th><th>check (sum)</th></tr>
    <tr><td>O, H, T</td><td>6 − 9 = −3</td><td>12 − 6 = +6</td><td>0 − 12 = −12</td><td>−9</td></tr>
    <tr><td>O, T, H</td><td>−3</td><td>0 − 7 = −7</td><td>7 − 6 = +1</td><td>−9</td></tr>
    <tr><td>H, O, T</td><td>12 − 13 = −1</td><td>13 − 9 = +4</td><td>−12</td><td>−9</td></tr>
    <tr><td>H, T, O</td><td>0 − 4 = −4</td><td>+4</td><td>4 − 13 = −9</td><td>−9</td></tr>
    <tr><td>T, O, H</td><td>7 − 9 = −2</td><td>−7</td><td>9 − 9 = 0</td><td>−9</td></tr>
    <tr><td>T, H, O</td><td>−4</td><td>4 − 9 = −5</td><td>0</td><td>−9</td></tr>
    <tr><td><b>average (÷ 6)</b></td><td><b>−17/84 = −0.202</b></td><td><b>−5/84 = −0.060</b></td><td><b>−32/84 = −0.381</b></td><td><b>−9/14 = −0.643</b></td></tr>
  </table>
  <p>So: <strong>base 0.643 + TempC (−0.381) + Outlook (−0.202) + Humid (−0.060) + Windy (0) = 0</strong>, exactly the tree's prediction for D6. In words: "the tree said No mainly because it was cold, partly because it rained; the wind played no part". Every order sums to −9/14, because each row telescopes from v(∅) to v(all), so the averages must too. Humid's contribution swings from +6/14 to −7/14 depending on who joined first: whether "normal humidity" helps or hurts depends on the temperature, which is the interaction the ICE curves showed.</p>
  <h3>Step 3: the same thing as a formula</h3>
  <p>Instead of listing orders, group them by the set S of features that joined before j. A given S appears in |S|! · (M − |S| − 1)! of the M! orders. So:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shapley value</strong> of feature j: <code>φⱼ = Σ over S ⊆ F∖{j} of [ |S|! (M − |S| − 1)! / M! ] · [ v(S ∪ {j}) − v(S) ]</code>, where F is the set of all M features. With M = 3 the weights are 1/3 for S = ∅, 1/6 for each one-feature S, and 1/3 for the two-feature S.</p>
  </div>
  <p>Check for TempC (in fourteenths): (1/3)·(9 − 9) + (1/6)·(7 − 6) [S = {O}] + (1/6)·(4 − 13) [S = {H}] + (1/3)·(0 − 12) [S = {O, H}] = 0 + 1/6 − 9/6 − 4 = −5.33/14 = <strong>−0.381</strong>. ✓</p>
  <p>The brute-force code computes all 2⁴ = 16 coalition values with all four players (Windy included), applies the formula literally, and then asks <code>shap.TreeExplainer</code> (interventional, with the 14 days as background) for the same day:</p>
  <div class="fx" data-lang="py">import numpy as np
from itertools import combinations
from math import factorial
from common import X, tree, df
x = X.loc["D6"]                                      # explain D6: rain, normal humidity, windy, 18 C -&gt; No play
players = {"Outlook": ["Overcast", "Sunny", "Rain"], "Humid": ["Humid"], "Windy": ["Windy"], "TempC": ["TempC"]}
def v(S):                                            # x's values for the players in S, background day's values for the rest
    B = X.copy()
    for p in S: B[players[p]] = x[players[p]].values
    return tree.predict_proba(B)[:, 1].mean()
M = len(players)
for k in range(M + 1):
    for S in combinations(players, k):
        print(f"v({{{', '.join(S)}}}) = {v(S):.4f}")
phi = {}
for j in players:
    others = [p for p in players if p != j]
    phi[j] = sum(factorial(len(S)) * factorial(M - len(S) - 1) / factorial(M) * (v(S + (j,)) - v(S))
                 for k in range(M) for S in combinations(others, k))
print("Shapley values:", {k: round(float(val), 4) for k, val in phi.items()})
print(f"base {v(()):.4f} + sum {sum(phi.values()):+.4f} = {v(()) + sum(phi.values()):.4f}; model says {tree.predict_proba(X.loc[['D6']])[0, 1]:.0f}")
import shap
ex = shap.TreeExplainer(tree, data=X, feature_perturbation="interventional")
sv = ex.shap_values(X.loc[["D6"]])
sv1 = sv[1] if isinstance(sv, list) else sv[..., 1]
print("shap TreeExplainer per column:", {c: round(float(s), 4) for c, s in zip(X.columns, sv1[0])})</div>
  <div class="fx" data-lang="text">v({}) = 0.6429
v({Outlook}) = 0.4286
v({Humid}) = 0.9286
v({Windy}) = 0.6429
v({TempC}) = 0.6429
v({Outlook, Humid}) = 0.8571
v({Outlook, Windy}) = 0.4286
v({Outlook, TempC}) = 0.5000
v({Humid, Windy}) = 0.9286
v({Humid, TempC}) = 0.2857
v({Windy, TempC}) = 0.6429
v({Outlook, Humid, Windy}) = 0.8571
v({Outlook, Humid, TempC}) = 0.0000
v({Outlook, Windy, TempC}) = 0.5000
v({Humid, Windy, TempC}) = 0.2857
v({Outlook, Humid, Windy, TempC}) = 0.0000
Shapley values: {'Outlook': -0.2024, 'Humid': -0.0595, 'Windy': 0.0, 'TempC': -0.381}
base 0.6429 + sum -0.6429 = 0.0000; model says 0
shap TreeExplainer per column: {'Overcast': -0.2024, 'Sunny': 0.0, 'Rain': 0.0, 'Humid': -0.0595, 'Windy': 0.0, 'TempC': -0.381}</div>
  <p>Every coalition containing Windy has the same value as the one without it, so Windy's Shapley value is exactly 0, and the other three match the hand table. TreeExplainer, working directly on the tree, gives the same numbers (it reports the Outlook share on the Overcast column, the one the tree actually splits on).</p>
  <h3>The four fairness properties</h3>
  <p>Shapley proved his rule is the <em>only</em> way to split the payout that satisfies all four of these. That uniqueness is why SHAP is trusted more than ad-hoc attribution methods:</p>
  <table class="tbl">
    <tr><th>Property</th><th>Plain words</th><th>In our example</th></tr>
    <tr><td><b>Efficiency</b> (local accuracy)</td><td>The contributions add up exactly to prediction − baseline</td><td>−0.381 − 0.202 − 0.060 + 0 = 0 − 0.643</td></tr>
    <tr><td><b>Symmetry</b></td><td>Two features that always add the same amount get the same value</td><td>(none are symmetric here)</td></tr>
    <tr><td><b>Dummy</b> (missingness)</td><td>A feature that never changes any v(S) gets 0</td><td>Windy (never read by the tree) gets exactly 0</td></tr>
    <tr><td><b>Additivity</b> (linearity)</td><td>For a sum of models, the values are the sums of each model's values</td><td>For a forest or booster (a sum of trees), SHAP of the ensemble = sum of SHAP of each tree. TreeSHAP uses this.</td></tr>
  </table>
  <p>SHAP adds one more property that matters in comparisons: <strong>consistency</strong>. If you change a model so that a feature's marginal contribution never decreases in any coalition, its SHAP value cannot go down. Split-count and gain-based importance can violate this: a feature can become more useful yet get a lower gain importance because it moved lower in the tree.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A SHAP value is never "the effect of the feature" in isolation. It is the feature's fair share of the difference between <em>this</em> prediction and the <em>background</em> average. Change the background (all 14 days vs only the rainy days) and the values change, because the question changed.</p>
  </div>
  <h3>Shapley interaction values</h3>
  <p>Humid's contribution swung from +6/14 to −7/14 depending on whether TempC was already known. That gap is an <strong>interaction</strong>: in this tree, cold means "No" on normal-humidity days but "Yes" on humid ones. SHAP interaction values split each φⱼ into a <em>main effect</em> plus <em>pair</em> terms.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For i ≠ j: <code>Φᵢⱼ = Σ over S ⊆ F∖{i,j} of [ |S|! (M − |S| − 2)! / (2 (M − 1)!) ] · ∇ᵢⱼ(S)</code>, with <code>∇ᵢⱼ(S) = v(S∪{i,j}) − v(S∪{i}) − v(S∪{j}) + v(S)</code> ("together minus each alone"). The main effect is Φᵢᵢ = φᵢ − Σ_{j≠i} Φᵢⱼ. Each row of the matrix sums to φᵢ, and the whole matrix sums to f(x) − E[f].</p>
  </div>
  <p>By hand for Humid × TempC (M = 3, so both weights are 1/4; values in fourteenths):</p>
  <ul>
    <li>∇(∅) = v(HT) − v(H) − v(T) + v(∅) = 4 − 13 − 9 + 9 = −9</li>
    <li>∇({O}) = v(OHT) − v(OH) − v(OT) + v(O) = 0 − 12 − 7 + 6 = −13</li>
    <li>Φ_HT = ¼ · (−22)/14 = <strong>−0.393</strong>, and Φ_TH = −0.393 too (the pair's total is split in half).</li>
  </ul>
  <p>Outlook × TempC: ∇(∅) = 7 − 6 − 9 + 9 = 1, ∇({H}) = 0 − 12 − 4 + 13 = −3, so Φ_OT = ¼ · (−2)/14 = <strong>−0.036</strong>. Outlook × Humid: ∇(∅) = 12 − 6 − 13 + 9 = 2, ∇({T}) = 0 − 7 − 4 + 9 = −2, so Φ_OH = 0. Main effects: Outlook −0.202 + 0.036 = −0.167; Humid −0.060 + 0.393 = +0.333; TempC −0.381 + 0.036 + 0.393 = +0.048. Read that last number: almost all of TempC's blame for D6 is its <em>interaction</em> with humidity, not a standalone "cold is bad" effect.</p>
  <div class="fx" data-lang="py">from itertools import combinations
from math import factorial
import pandas as pd
from common import X, tree
x = X.loc["D6"]
players = {"Outlook": ["Overcast", "Sunny", "Rain"], "Humid": ["Humid"], "TempC": ["TempC"]}   # Windy is a dummy: left out
def v(S):
    B = X.copy()
    for p in S: B[players[p]] = x[players[p]].values
    return tree.predict_proba(B)[:, 1].mean()
P = list(players); M = len(P)
phi = {j: sum(factorial(len(S)) * factorial(M - len(S) - 1) / factorial(M) * (v(S + (j,)) - v(S))
              for k in range(M) for S in combinations([p for p in P if p != j], k)) for j in P}
I = pd.DataFrame(0.0, index=P, columns=P)
for i in P:
    for j in P:
        if i == j: continue
        rest = [p for p in P if p not in (i, j)]
        I.loc[i, j] = sum(factorial(len(S)) * factorial(M - len(S) - 2) / (2 * factorial(M - 1)) *
                          (v(S + (i, j)) - v(S + (i,)) - v(S + (j,)) + v(S))
                          for k in range(M - 1) for S in combinations(rest, k))
    I.loc[i, i] = phi[i] - I.loc[i].drop(i).sum()
print(I.round(4).to_string())
print("row sums = Shapley values:", I.sum(1).round(4).to_dict(), " total", round(I.values.sum(), 4))</div>
  <div class="fx" data-lang="text">         Outlook   Humid   TempC
Outlook  -0.1667  0.0000 -0.0357
Humid     0.0000  0.3333 -0.3929
TempC    -0.0357 -0.3929  0.0476
row sums = Shapley values: {'Outlook': -0.2024, 'Humid': -0.0595, 'TempC': -0.381}  total -0.6429</div>
  <p>The matrix matches: diagonal −0.167, 0.333, 0.048; off-diagonal −0.393 (Humid × TempC) and −0.036 (Outlook × TempC); each row sums to the Shapley value and the total is −0.643.</p>
  <div class="callout trap"><span class="label">Trap: brute force explodes</span>
    <p>M features need 2^M coalitions, and each coalition needs predictions on every background row. For our 14 churn columns that is 16,384 coalitions × background rows per customer; for 200 columns it is impossible. That is why the next section's TreeSHAP matters.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SHAP in practice.</b> We can compute Shapley values exactly for 4 features and 14 background days. We need the same exact answer for 14 or 500 features and 500 trees, fast enough to explain thousands of rows. TreeSHAP does that by using the tree structure.</div>

  <h2 id="mte-shap"><span class="num">07</span>SHAP in Practice</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Brute force needed 16 coalitions for 4 diary features; 14 churn columns need 16,384 per row, and 500 trees make each one expensive. How do we get the same exact values fast, and how do we read them?</p>
  </div>
  <h3>TreeSHAP: exact Shapley values, fast</h3>
  <p>Brute force needs 2^M coalitions. For 14 columns that is 16,384 coalitions, each averaged over the background rows, for every customer you explain. TreeSHAP (Lundberg et al., 2018–2020) avoids the enumeration. The key observation: a tree's prediction for a coalition S only depends on which branches the row can follow. At a split on a feature in S, the row goes the way x goes; at a split on a feature not in S, it goes both ways, weighted by how the background rows split. TreeSHAP walks each root-to-leaf path once and keeps track, with a small dynamic program, of how many features of each coalition size are "fixed" on that path, which gives exactly the Shapley weights. And because a forest or booster is a <em>sum</em> of trees, the additivity property lets it explain each tree separately and add the results.</p>
  <table class="tbl">
    <tr><th>Variant</th><th>What "unknown feature" means</th><th>Cost per row</th><th>Use</th></tr>
    <tr><td><b>Path-dependent</b> (<code>feature_perturbation="tree_path_dependent"</code>, the default with no data)</td><td>At a split on an unknown feature, follow both children weighted by how many <em>training</em> rows went each way (the tree's stored "cover")</td><td>O(T · L · D²): T trees, L leaves, depth D</td><td>Fast default; no background data needed; supports interaction values</td></tr>
    <tr><td><b>Interventional</b> (<code>data=background</code>)</td><td>Fill unknown features from real background rows and average, exactly like our hand example</td><td>O(T · L · B) for B background rows</td><td>Cleaner causal-style meaning ("break the link to other features"); what we used in section 06</td></tr>
    <tr><td><b>KernelSHAP</b> (model-agnostic)</td><td>Background rows; a weighted linear regression over sampled coalitions approximates φ</td><td>Many model calls; approximate</td><td>Non-tree models, or probability-space explanations</td></tr>
  </table>
  <h3>At scale: the churn data</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Correlated features.</b> Every method so far assumed each column brings its own information. Real tables have twins: monthly and annual bill, age and date of birth. What happens to importance when two columns say the same thing?</div>

  <h2 id="mte-corr"><span class="num">08</span>Correlated Features</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On the diary, Windy got zero from every method because TempC happened to carry the same information about D6. What happens to importance in general when two columns say the same thing?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Explanation ≠ causation.</b> Even with perfect, independent features, an explanation answers "what does the model use?" People will hear "what causes the outcome, and what should we change?" Those are different questions.</div>

  <h2 id="mte-causal"><span class="num">09</span>Explanation ≠ Causation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The diary tree blames D6's cold for the missed match. The captain says it was the wind. Can an explanation of a model ever tell us what to change in the world?</p>
  </div>
  <p><strong>On the diary first.</strong> Every method in this note says the tree relies on TempC and ignores Windy, and SHAP blames 18 °C for D6. That is a faithful description of the model. It is not a fact about cricket: the only cold normal-humidity day happened to be windy, so the tree could use either column to separate it, and it chose the one with more cut-offs. Telling the club "matches fail when it is cold" would be a causal claim the data cannot support.</p>
  <p><strong>At scale.</strong> A simulation where we <em>know</em> the truth. Two real causes decide churn: a price hike (0/1) and tenure. A third column, <code>cancel_visits</code> (visits to the "cancel subscription" page), is a <strong>symptom</strong>: customers who are already leaving visit it, but visiting it does not make anyone leave. We train a booster on all three and then ask "what would happen if we changed a column?"</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Comparing the methods.</b> We have seven tools that answer different questions. Side by side: which question does each answer, on which data, at what cost, and how do they fit into one workflow?</div>

  <h2 id="mte-cmp"><span class="num">10</span>Comparing the Methods</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>MDI, permutation, drop-column, PDP, ICE, SHAP and interaction values: which question does each answer, and in what order should you use them on a real project?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> How are these methods built from each other, and what does each say about the same diary tree?</div>

    <h2 id="mte-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Seven methods gave seven different numbers for the same tree. Are they rivals, or answers to different questions built from the same few ingredients?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 310" width="680">
<defs><marker id="mte-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="240" y="8" width="200" height="44" rx="7" class="fg sg" stroke-width="2"/><text x="340" y="27" text-anchor="middle" font-size="12" font-weight="700">a trained model f</text><text x="340" y="43" text-anchor="middle" class="tm" font-size="10">the diary tree / 480 trees</text>
<line x1="290" y1="52" x2="110" y2="86" stroke="currentColor" marker-end="url(#mte-c9)"/><line x1="340" y1="52" x2="340" y2="86" stroke="currentColor" marker-end="url(#mte-c9)"/><line x1="390" y1="52" x2="570" y2="86" stroke="currentColor" marker-end="url(#mte-c9)"/>
<rect x="10" y="88" width="200" height="40" rx="7" class="fb sb"/><text x="110" y="112" text-anchor="middle" font-size="11.5" font-weight="700">read its splits (inside)</text>
<rect x="240" y="88" width="200" height="40" rx="7" class="fb sb"/><text x="340" y="112" text-anchor="middle" font-size="11.5" font-weight="700">change inputs, call predict</text>
<rect x="470" y="88" width="200" height="40" rx="7" class="fb sb"/><text x="570" y="112" text-anchor="middle" font-size="11.5" font-weight="700">retrain without a column</text>
<line x1="110" y1="128" x2="110" y2="160" stroke="currentColor" marker-end="url(#mte-c9)"/><line x1="290" y1="128" x2="230" y2="160" stroke="currentColor" marker-end="url(#mte-c9)"/><line x1="340" y1="128" x2="400" y2="160" stroke="currentColor" marker-end="url(#mte-c9)"/><line x1="570" y1="128" x2="570" y2="160" stroke="currentColor" marker-end="url(#mte-c9)"/>
<rect x="10" y="162" width="150" height="46" rx="7" class="ft st"/><text x="85" y="181" text-anchor="middle" font-size="11" font-weight="700">MDI</text><text x="85" y="198" text-anchor="middle" class="tm" font-size="9.5">TempC 0.498, Windy 0</text>
<rect x="170" y="162" width="150" height="46" rx="7" class="ft st"/><text x="245" y="181" text-anchor="middle" font-size="11" font-weight="700">permutation</text><text x="245" y="198" text-anchor="middle" class="tm" font-size="9.5">shuffle: Overcast 0.357</text>
<rect x="330" y="162" width="150" height="46" rx="7" class="ft st"/><text x="405" y="181" text-anchor="middle" font-size="11" font-weight="700">PDP / ICE</text><text x="405" y="198" text-anchor="middle" class="tm" font-size="9.5">overwrite: TempC curves</text>
<rect x="510" y="162" width="160" height="46" rx="7" class="ft st"/><text x="590" y="181" text-anchor="middle" font-size="11" font-weight="700">drop-column</text><text x="590" y="198" text-anchor="middle" class="tm" font-size="9.5">without TempC: 0.714 &gt; 0.571</text>
<line x1="405" y1="208" x2="405" y2="236" stroke="currentColor" marker-end="url(#mte-c9)"/><text x="470" y="228" class="tm" font-size="9.5">average over coalitions</text>
<rect x="250" y="238" width="310" height="46" rx="7" class="fr sr"/><text x="405" y="257" text-anchor="middle" font-size="11" font-weight="700">Shapley / SHAP (+ interactions)</text><text x="405" y="274" text-anchor="middle" class="tm" font-size="9.5">D6: TempC −0.381, Outlook −0.202, Humid −0.060, Windy 0</text>
<text x="120" y="262" text-anchor="middle" class="tm" font-size="10">all describe the model,</text><text x="120" y="277" text-anchor="middle" class="tm" font-size="10">not the world (D6: wind)</text>
</svg><figcaption>Three ways to question a model: read its inside (MDI, TreeSHAP's walk), change its inputs and call predict (permutation, PDP/ICE, Shapley values, which average PDP-style fills over coalitions), or retrain it (drop-column). Each answers a different question, and none of them answers a causal one.</figcaption></figure>
  <table class="tbl"><caption>Every method on the same diary tree</caption>
    <tr><th>Method</th><th>Built from</th><th>Answers which question</th><th>On the diary tree</th><th>When to use</th></tr>
    <tr><td>MDI</td><td>weighted impurity drops of splits</td><td>how much did splits on it clean the training rows?</td><td>TempC 0.498, Humid 0.280, Overcast 0.222, Windy 0</td><td>quick sanity check only</td></tr>
    <tr><td>Permutation</td><td>score before − after shuffling</td><td>how much does this model need its information?</td><td>Overcast 0.357, TempC 0.214, Humid 0.143</td><td>ranking on held-out data</td></tr>
    <tr><td>Drop-column</td><td>score of a retrained model without it</td><td>would we lose anything by never having it?</td><td>without TempC: LOO 0.571 → 0.714</td><td>before removing a column</td></tr>
    <tr><td>PDP</td><td>average prediction with the column overwritten</td><td>average shape of the effect?</td><td>0.643, 1.0, 0.643, 0.643 at 18, 20, 24, 28 °C</td><td>direction and shape</td></tr>
    <tr><td>ICE</td><td>the same, per row</td><td>does the effect differ between rows?</td><td>normal days up at 19 °C, humid days down at 21.5 °C</td><td>always next to a PDP</td></tr>
    <tr><td>Shapley / SHAP</td><td>average marginal contribution over coalitions</td><td>why this prediction?</td><td>D6: −0.381, −0.202, −0.060, 0 (sum −0.643)</td><td>reason codes; global by mean |SHAP|</td></tr>
    <tr><td>Interaction values</td><td>"together minus each alone"</td><td>how much is due to pairs?</td><td>Humid × TempC −0.393</td><td>finding interactions</td></tr>
    <tr><td>Causal claim</td><td>experiments, not these tools</td><td>what should we change?</td><td>tree blames cold; the wind was the reason</td><td>A/B tests, causal inference</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>every interpretation method asks the model a different "what if" (what if this split were gone, this column shuffled, overwritten, unknown, or never available?) and reports how the model's output changes.</strong> That is why they disagree on the same tree, why they all describe the model faithfully, including what it memorised, and why none of them can tell you what causes the outcome.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> Knowing what each method means, which misreadings cost teams the most?</div>

<h2 id="mte-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know what each method answers. Which misreadings of importance and explanations cost teams the most?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Revision sheet.</b> The whole note on one page, for revising.</div>

    <h2 id="mte-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: a fully grown CART tree on the captain's 14-day cricket diary, columns Overcast, Sunny, Rain, Humid, Windy, TempC, target Play (9 Yes). The tree: Overcast → Yes; otherwise Humid? then TempC ≤ 19 (normal days: only D6 → No) or TempC ≤ 21.5 (humid days: only D4 → Yes). Explained day: D6 (rain, normal, windy, 18 °C, predicted No).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Question it answers</th><th>On the diary</th><th>Weakness → next</th></tr>
    <tr><td>MDI</td><td>how much did its splits help in training?</td><td>TempC 0.498, Humid 0.280, Overcast 0.222, Windy 0</td><td>training rows, many-valued bias</td></tr>
    <tr><td>Permutation</td><td>how much does the model need it?</td><td>Overcast 0.357, TempC 0.214, Humid 0.143</td><td>says nothing about retraining</td></tr>
    <tr><td>Drop-column</td><td>would we lose by not having it?</td><td>without TempC LOO 0.571 → 0.714</td><td>one number, no shape</td></tr>
    <tr><td>PDP / ICE</td><td>shape of the effect?</td><td>PD 0.643 / 1.0 / 0.643; ICE up vs down</td><td>no per-row reasons</td></tr>
    <tr><td>Shapley</td><td>why this prediction?</td><td>D6: TempC −0.381, Outlook −0.202, Humid −0.060, Windy 0</td><td>2^M coalitions</td></tr>
    <tr><td>TreeSHAP</td><td>fast, exact?</td><td>churn: additivity to 3e−14</td><td>twins split credit</td></tr>
    <tr><td>Correlated features</td><td>what about twins?</td><td>Windy hidden behind TempC</td><td>still not causal</td></tr>
    <tr><td>Causation</td><td>what to change?</td><td>tree blames cold, truth is wind</td><td>needs experiments</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th><th>Diary value</th></tr>
    <tr><td>Gini</td><td>1 − Σ p_k²</td><td>p_k class shares</td><td>root 0.4592</td></tr>
    <tr><td>MDI of a split</td><td>Δ(t) = (N_t/N)[imp(t) − (N_L/N_t)imp(L) − (N_R/N_t)imp(R)]</td><td>N_t rows at node t</td><td>root 0.1020; Humid 0.1286</td></tr>
    <tr><td>Permutation</td><td>s₀ − mean_k s_jk</td><td>s score, k repeats</td><td>Overcast 1.0 − 0.643</td></tr>
    <tr><td>Drop-column</td><td>s(all) − s(without j)</td><td>retrained</td><td>TempC 0.571 − 0.714 = −0.143</td></tr>
    <tr><td>PD</td><td>PD(v) = (1/n) Σᵢ f(x_S = v, x_C⁽ⁱ⁾)</td><td>S the column, C the rest</td><td>PD(20 °C) = 14/14</td></tr>
    <tr><td>Coalition value</td><td>v(S) = (1/n) Σᵢ f(x_S, b_C⁽ⁱ⁾)</td><td>b background rows</td><td>v({H, T}) = 4/14</td></tr>
    <tr><td>Shapley</td><td>φⱼ = Σ_S |S|!(M−|S|−1)!/M! · [v(S∪j) − v(S)]</td><td>M players</td><td>TempC −32/84 = −0.381</td></tr>
    <tr><td>Efficiency</td><td>E[f] + Σ φⱼ = f(x)</td><td>—</td><td>0.643 − 0.643 = 0</td></tr>
    <tr><td>Interaction</td><td>Φᵢⱼ = Σ_S |S|!(M−|S|−2)!/(2(M−1)!) · ∇ᵢⱼ(S)</td><td>∇ = together − each alone</td><td>Humid × TempC −0.393</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Ranking columns</b><p>Permutation importance on held-out data, with repeats; group correlated columns first.</p><small>Not raw MDI</small></div>
    <div><b>Removing columns</b><p>Drop-column (or drop the group) and retrain; check several seeds.</p><small>The diary tree improved without TempC</small></div>
    <div><b>Shape of an effect</b><p>PDP with ICE (or SHAP dependence); ALE when columns are correlated.</p><small>Flat PDP ≠ no effect</small></div>
    <div><b>One decision</b><p>SHAP waterfall: base value plus one push per column; state the background and the units (log-odds).</p><small>Reason codes</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Presenting MDI as truth; permutation on training data; dropping both twins; reading a flat PDP as "no effect"; adding log-odds SHAP values as probabilities; causal language from predictive tools; forgetting the baseline.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why does Windy get MDI 0 in the diary tree?</td><td>The tree never splits on it: TempC separated D6 first</td></tr>
    <tr><td>A column the model never reads: its permutation importance and Shapley value?</td><td>Both exactly 0</td></tr>
    <tr><td>Base 0.643, prediction 0. What must the Shapley values add up to?</td><td>−0.643</td></tr>
    <tr><td>Why can drop-column importance be negative?</td><td>The retrained model is better (or equal within noise) without the column</td></tr>
    <tr><td>ICE curves step up for some rows and down for others. What does that mean?</td><td>An interaction; the PDP average hides it</td></tr>
  </table>

<h2 id="mte-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How is MDI computed? Give the formula for one split.</summary><div class="qa-body">For each split node t: Δ(t) = (N_t/N)·[imp(t) − (N_L/N_t)·imp(L) − (N_R/N_t)·imp(R)]. Add Δ to the feature used at t, sum over all nodes, average over trees, normalise to sum 1. In the diary tree: Overcast 0.1020, Humid 0.1286, TempC 0.1143 + 0.1143 → 0.222, 0.280, 0.498.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is MDI biased toward high-cardinality features?</summary><div class="qa-body">A feature with many distinct values offers many candidate thresholds, so deep in the tree some threshold separates a few training rows by chance; the impurity drop is credited to it. MDI is measured on training data, so this memorisation counts as importance. Pure noise with 20,000 values scored 0.036 vs 0.005 for 0/1 noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain permutation importance and why it is computed on validation data.</summary><div class="qa-body">Score the model on held-out data, shuffle one column (breaking its link to the target while keeping its distribution), re-score, and take the drop, averaged over several shuffles. On training data it measures memorisation; on held-out data it measures what the model needs to generalise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Permutation vs drop-column importance: what's the difference, and why can drop-column be much smaller?</summary><div class="qa-body">Permutation keeps the trained model and destroys one column's information. Drop-column retrains without the column, so the new model can lean on substitutes. On the diary, TempC was worth 0.214 by permutation, but the tree retrained without it scored <em>better</em> on left-out days (0.714 vs 0.571), because its TempC splits only memorised D6 and D4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a partial dependence plot, and what does ICE add?</summary><div class="qa-body">PD(v) = average over rows of f(feature = v, other features as they are). ICE plots each row's curve separately; PDP is their mean. Non-parallel ICE curves reveal interactions the PDP averages away (on the diary tree, warming past 19 °C turns normal-humidity days to Yes while warming past 21.5 °C turns humid days to No).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define the Shapley value and compute the weights for 3 features.</summary><div class="qa-body">φⱼ = Σ_{S ⊆ F∖{j}} |S|!(M−|S|−1)!/M! · [v(S∪{j}) − v(S)], the average marginal contribution of j over all orders in which features can join. For M = 3: weight 1/3 for S = ∅, 1/6 for each single-feature S, 1/3 for the two-feature S.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "local accuracy" (efficiency) mean for SHAP, and why does it matter?</summary><div class="qa-body">The base value plus all SHAP values equals the model's output for that row, exactly. D6 on the diary: 0.643 − 0.381 − 0.202 − 0.060 + 0 = 0; on the churn booster the error was 3 × 10⁻¹⁴. It makes SHAP values usable as an accounting of the prediction (reason codes), unlike ad-hoc attributions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is TreeSHAP fast, and what is the difference between path-dependent and interventional?</summary><div class="qa-body">It uses the tree structure: one pass over each root-to-leaf path with a dynamic program instead of 2^M coalitions, and additivity across trees. Path-dependent treats unknown features by following both branches weighted by training cover (no background data). Interventional fills unknown features from a background dataset, like the hand computation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are SHAP interaction values? Give the toy example.</summary><div class="qa-body">A matrix per row that splits each SHAP value into a main effect (diagonal) and pair effects (off-diagonal, split in half between the two). For D6 on the diary tree, Humid × TempC = −0.393 each way (cold means No on normal days but Yes on humid ones), Outlook × TempC = −0.036, Outlook × Humid = 0. Rows sum to the SHAP values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features are 0.9996 correlated. What happens to each importance method?</summary><div class="qa-body">MDI and SHAP split the credit between them; permutation importance drops for both (shuffle one, the other covers); drop-column goes to ≈ 0 for both (retrain uses the twin). Fix: measure the group (grouped permutation gave 0.221 vs 0.043 + 0.058 individually), or keep one representative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>SHAP says feature X is the most important. Can you conclude that changing X will change the outcome?</summary><div class="qa-body">No. SHAP explains the model's predictions. In our simulation the top SHAP feature (cancel-page visits) was a symptom with zero causal effect: forcing it to 0 changed predicted churn from 17.8% to 1.6% but real churn not at all. Causal claims need experiments or causal inference.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An ID-like column shows up near the top of feature importance. How do you investigate?</summary><div class="qa-body">Check which importance: MDI favours many-valued columns. Run permutation importance on validation; if it drops to ≈ 0 it was memorisation. If it stays high, suspect leakage (IDs assigned in time order, or encoding the outcome), check its relation to the target and to time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do these methods connect to the rest of the tree family?</summary><div class="qa-body">MDI comes straight from the impurity decreases of <a class="xref" data-note="ml_dtree">Decision Trees</a>; the forest and booster notes use it and show its bias. TreeSHAP uses the additivity of ensembles (a forest or booster is a sum of trees). Permutation importance is a model evaluation idea (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>). In production (<a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>), importance guides feature selection and what to monitor for drift.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do XGBoost's "weight", "gain" and "cover" importances disagree?</summary><div class="qa-body">They count different things: weight = number of splits using the feature, gain = average (or total) loss reduction of those splits, cover = number of rows (Hessian mass) affected. A noisy continuous feature can have high weight (many tiny splits) but low gain. They are also all training-data, MDI-style measures, unlike permutation or SHAP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do Shapley values need the PDP's "overwrite and average" step?</summary><div class="qa-body">A model cannot take "unknown" as an input. To value a coalition S, the features outside S are filled from background rows and the predictions averaged: exactly the PDP recipe, applied to a set of columns. On the diary, v({TempC}) is the PDP of TempC at 18 °C (9/14). Shapley values then average the changes over all orders in which features become known.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: on the diary tree, MDI, permutation and drop-column rank TempC first, second and "harmful". Which one is wrong?</summary><div class="qa-body">None; they answer different questions. MDI: its splits removed half the training impurity (0.498). Permutation: this trained model loses 0.214 accuracy without its information. Drop-column: a model retrained without it generalises better (0.714 vs 0.571 leave-one-out), because those splits memorised single days. Use the one that matches your decision.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you use SHAP on the diary tree to tell the captain why matches are cancelled?</summary><div class="qa-body">SHAP faithfully explains the tree, which blames the cold for D6. But the tree chose temperature only because the one cold normal-humidity day was also windy; the captain's rule says wind. Explanations describe the model; changing the world needs causal evidence (experiments), as the churn simulation showed with cancel-page visits.</div></details>
</main>
`
});
