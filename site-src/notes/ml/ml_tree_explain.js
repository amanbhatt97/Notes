// notes/ml/ml_tree_explain.js — Feature Importance & SHAP
Object.assign(TOPIC_CONTENT, {
  "ml_tree_explain": `<main>
  <h1>Feature Importance &amp; SHAP</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>Feature Importance &amp; SHAP</span></div>
  <p class="lead">A single small decision tree can be read aloud like a set of rules, but a random forest of 300 trees or a booster of 500 trees cannot, and in real work people still ask what such a model is looking at and why it made a particular decision. This note covers the standard ways to answer: impurity importance (MDI), permutation importance, drop-column importance, partial dependence and ICE curves, and SHAP values, which come from a 1950s idea in game theory about sharing a prize fairly. Each method answers a slightly different question, and each can mislead you in a known way, so we will see both what it says and where it lies. The running example is the one used across the tree notes: a decision tree grown on the cricket captain's 14-day diary, small enough to check every number by hand, followed by a 20,000-customer churn table where the same methods explain models nobody can read.</p>

  <h2 id="mte-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Feature Importance &amp; SHAP</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Three questions</div>
        <ul>
          <li>Which columns does the model use? (global importance)</li>
          <li>How does the prediction move with a column? (effect)</li>
          <li>Why this prediction for this row? (local attribution)</li>
          <li>All of them explain the model, not the world</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Importance</div>
        <ul>
          <li><b>MDI</b>: sum of the impurity drops of a column's splits; free, but training data and biased to many-valued columns</li>
          <li><b>Permutation</b>: shuffle a column on held-out data, measure the score drop</li>
          <li><b>Drop-column</b>: retrain without it, measure the drop</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Effects</div>
        <ul>
          <li><b>PDP</b>: overwrite a column with a value for every row, average the predictions</li>
          <li><b>ICE</b>: the same curve for each row; PDP = their mean</li>
          <li>Crossing ICE curves = an interaction</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SHAP</div>
        <ul>
          <li>Shapley value: average marginal contribution over all joining orders</li>
          <li>base value + Σ SHAP = prediction, exactly</li>
          <li>TreeSHAP: exact and fast for trees; log-odds for classifiers</li>
          <li>Twins split the credit; group correlated columns</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mte-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Explain a Tree Model</span><span class="rm-sub">three questions, and the diary tree</span></div></div>
      <div class="rm-item rm-done" data-target="mte-mdi"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Impurity Importance (MDI)</span><span class="rm-sub">free from training, but biased</span></div></div>
      <div class="rm-item rm-done" data-target="mte-perm"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Permutation Importance</span><span class="rm-sub">shuffle a column and re-score</span></div></div>
      <div class="rm-item rm-done" data-target="mte-drop"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Drop-Column Importance</span><span class="rm-sub">retrain without the column</span></div></div>
      <div class="rm-item rm-done" data-target="mte-pdp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Partial Dependence &amp; ICE</span><span class="rm-sub">the shape of a column's effect</span></div></div>
      <div class="rm-item rm-done" data-target="mte-shapley"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Shapley Values</span><span class="rm-sub">sharing one prediction fairly, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mte-shap"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SHAP in Practice</span><span class="rm-sub">TreeSHAP, units and plots</span></div></div>
      <div class="rm-item rm-done" data-target="mte-corr"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Correlated Features</span><span class="rm-sub">what twins do to every method</span></div></div>
      <div class="rm-item rm-done" data-target="mte-causal"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Explanation Is Not Causation</span><span class="rm-sub">what the model uses vs what to change</span></div></div>
      <div class="rm-item rm-done" data-target="mte-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the misreadings that cost teams most</span></div></div>
      <div class="rm-item rm-done" data-target="mte-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, comparison table, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="mte-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about interpretability</span></div></div>
    </div>
  </div>

  <h2 id="mte-why"><span class="num">01</span>Why Explain a Tree Model</h2>
  <p>Imagine you have built a churn model for a telecom company and it is 88% accurate. In the review meeting the head of retention asks three questions. "What makes customers leave, in general?" "If a customer's bill goes up, does the risk go up, and by how much?" "Your model says Mrs. Sharma is 98% likely to leave; why her?" With one small decision tree you could answer all three by reading the tree. With 300 trees, each 20 levels deep, you cannot. The model has become a <strong>black box</strong>: data goes in, a number comes out, and the reasons are hidden. Interpretation methods are tools for opening the box, and the three questions need three different kinds of tool.</p>
  <p>A doctor faces the same three questions. "Which test results matter most for this disease in general?" is about the whole population. "How does risk change as cholesterol rises?" is about the shape of one factor's effect. "Why do <em>you</em>, this patient, have high risk?" is about one person. A good doctor answers each differently. In the same way, <strong>global importance</strong> gives one number per column saying how much the model relies on it overall (MDI, permutation and drop-column importance, mean |SHAP|); a <strong>feature effect</strong> is a curve showing how the prediction changes as one column changes (partial dependence, ICE, SHAP dependence); and a <strong>local explanation</strong> splits one row's prediction into a contribution from each column (SHAP values). A column can rank differently on each, because they are different questions.</p>
  <p>Two more terms are worth knowing. A <strong>model-specific</strong> method reads the inside of the model: MDI adds up the trees' own split statistics, and TreeSHAP walks the trees. A <strong>model-agnostic</strong> method only calls the model's <code>predict</code>, so it works on any model, from a forest to a neural network; permutation importance, drop-column importance, partial dependence and KernelSHAP are model-agnostic. Model-specific methods are fast; model-agnostic ones let you measure different kinds of model with the same ruler.</p>
  <p>In practice these tools are used, roughly in order of how often they save a project, for debugging (a column such as <code>refund_issued_date</code> at the top of the importance list usually means the answer has leaked into the inputs), for choosing which columns to keep, for building trust with the people who act on the model, and for regulation, since credit and insurance decisions often legally require a "reason code" for each refusal.</p>
  <p>To check every method against something we can see with our own eyes, we start with a tree small enough to read. Using the captain's diary, scikit-learn grows a full decision tree that predicts Play from six columns: Overcast, Sunny and Rain (the outlook as three 0/1 columns), Humid (1 for high humidity), Windy (1 for strong wind) and TempC. The code below is saved as <code>common.py</code>, so later examples can simply import <code>X</code>, <code>y</code> and <code>tree</code>:</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from play import df
X = pd.DataFrame({"Overcast": (df.Outlook == "Overcast").astype(int), "Sunny": (df.Outlook == "Sunny").astype(int),
                  "Rain": (df.Outlook == "Rain").astype(int), "Humid": (df.Humidity == "High").astype(int),
                  "Windy": (df.Wind == "Strong").astype(int), "TempC": df.TempC})
y = (df.Play == "Yes").astype(int)
tree = DecisionTreeClassifier(random_state=0).fit(X, y)      # fully grown CART tree (saved as common.py)
print(export_text(tree, feature_names=list(X.columns)))
print("training accuracy:", tree.score(X, y))</div>
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

training accuracy: 1.0</div>
  <p>Read the tree from the top. Overcast days are always played. On other days the tree asks about humidity; on normal-humidity days it then plays only if it is warmer than 19 °C, and on humid days only if it is 21.5 °C or colder. It is right on all 14 days. Notice something important for later: the captain's own rule, the one in <a class="xref" data-note="ml_dtree">Decision Trees</a>, is "on rainy days, play if the wind is weak", but this tree never looks at the wind at all. It found that temperature separates the same days, because the one windy, rainy, normal-humidity day (D6) also happens to be the coldest. Every method below faithfully describes <em>this tree</em>, and none of them can tell us that the captain actually cared about the wind. That is the theme of section 09.</p>

  <h2 id="mte-mdi"><span class="num">02</span>Impurity Importance (MDI)</h2>
  <p>The cheapest answer to "which columns matter" is already sitting inside a trained tree. While a tree grows, every split is chosen because it lowers <strong>impurity</strong>, the measure of how mixed the classes in a node are (Gini or entropy, see <a class="xref" data-note="ml_dtree">Decision Trees</a>). The size of that drop says how useful the split was. If we add up the drops made by every split on a given column, we get a measure of how much the tree leaned on that column. This is <strong>Mean Decrease in Impurity (MDI)</strong>, also called Gini importance or impurity importance, and it is what <code>feature_importances_</code> returns in scikit-learn.</p>
  <p>For one split at node t, which holds N_t of the N training rows and sends N_L to the left child and N_R to the right, the weighted impurity decrease is Δ(t) = (N_t / N) · [imp(t) − (N_L / N_t) · imp(L) − (N_R / N_t) · imp(R)]. The bracket is "the parent's impurity minus the size-weighted impurity of its two children"; the factor N_t / N in front makes a split near the root, which touches every row, count more than a split deep down that touches three rows. A column's MDI is the sum of Δ(t) over every node that splits on it; for a forest it is averaged over the trees, and the results are normalised to add up to 1. The code computes this by hand from the fitted diary tree and compares it with scikit-learn:</p>
  <div class="fx" data-lang="py">from common import X, y, tree
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
  <div class="fx" data-lang="text">node 0: Overcast n=14 gini 0.4592 -&gt; weighted decrease 0.1020
node 1: Humid    n=10 gini 0.5000 -&gt; weighted decrease 0.1286
node 2: TempC    n= 5 gini 0.3200 -&gt; weighted decrease 0.1143
node 5: TempC    n= 5 gini 0.3200 -&gt; weighted decrease 0.1143
by hand : {'Overcast': 0.222, 'Sunny': 0.0, 'Rain': 0.0, 'Humid': 0.28, 'Windy': 0.0, 'TempC': 0.498}
sklearn : {'Overcast': 0.222, 'Sunny': 0.0, 'Rain': 0.0, 'Humid': 0.28, 'Windy': 0.0, 'TempC': 0.498}</div>
  <p>Walk through the four splits. The root holds all 14 days, 9 played and 5 not, so its Gini impurity is 1 − (9/14)² − (5/14)² = 0.4592. It splits on Overcast: the 4 overcast days are all played (Gini 0) and the other 10 are 5 played and 5 not (Gini 0.5), so Δ = 0.4592 − (10/14) × 0.5 = 0.1020. The node of 10 non-overcast days splits on Humid into two groups of 5, each with one odd day out (Gini 1 − 0.8² − 0.2² = 0.32), so Δ = (10/14) × (0.5 − 0.32) = 0.1286. Each of those two nodes is then split on TempC, peeling off its single odd day (D6 on the normal side, D4 on the humid side) and leaving both children pure, so each gives Δ = (5/14) × 0.32 = 0.1143. Adding up per column and dividing by the total 0.4592 gives Overcast 0.222, Humid 0.280, TempC 0.498 and zero for everything else, exactly what scikit-learn reports.</p>
  <p>Two things in that result should make you suspicious. Windy gets zero, although wind is what the captain actually used. And TempC, the column with the most distinct values, collects half the importance by peeling off one odd day at a time. MDI measures how much a column was <em>used to fit the training rows</em>, not how useful it is on new data. That distinction becomes serious at scale.</p>
  <p>The boosting libraries report MDI-style numbers too, under the name <strong>importance type</strong>, and the types count different things. XGBoost's <code>weight</code> and LightGBM's default <code>split</code> count how many splits use the column, so a noisy column with many tiny splits looks important. <code>gain</code> (XGBoost's default in its scikit-learn API, LightGBM's <code>importance_type="gain"</code>) adds up the loss reduction of those splits and is the closest to MDI. XGBoost's <code>cover</code> counts how many rows pass through the column's splits. The three can rank columns very differently, so always say which one you report.</p>
  <p>Now the churn data. It is 20,000 customers with 12 columns from scikit-learn's <code>make_classification</code> (6 genuinely informative, 2 that are mixtures of those, 4 useless) plus two pure-noise columns added on purpose: <code>row_noise</code>, a random number with 20,000 different values, and <code>coin_noise</code>, a random 0 or 1. It is split 12,000 / 3,000 / 5,000 into training, validation and test rows. Every churn example on this page imports this setup as <code>churn</code>:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,
                           n_clusters_per_class=3, class_sep=0.8, flip_y=0.05, random_state=7)
X = pd.DataFrame(X, columns=[f"f{i}" for i in range(12)])
rng = np.random.default_rng(0)
X["row_noise"] = rng.random(20000)               # pure noise, 20,000 different values
X["coin_noise"] = rng.integers(0, 2, 20000)      # pure noise, only 0 or 1
Xtmp, Xte, ytmp, yte = train_test_split(X, y, test_size=5000, stratify=y, random_state=0)
Xtr, Xva, ytr, yva = train_test_split(Xtmp, ytmp, test_size=3000, stratify=ytmp, random_state=0)
print("train", Xtr.shape, "validation", Xva.shape, "test", Xte.shape, " churn rate", round(y.mean(), 3))</div>
  <div class="fx" data-lang="text">train (12000, 14) validation (3000, 14) test (5000, 14)  churn rate 0.502</div>
  <div class="fx" data-lang="py">import pandas as pd
from churn import Xtr, ytr, Xva, yva
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0).fit(Xtr, ytr)
print(f"train acc {rf.score(Xtr, ytr):.3f}   val acc {rf.score(Xva, yva):.3f}")
mdi = pd.Series(rf.feature_importances_, Xtr.columns).sort_values(ascending=False)
print(mdi.round(3).to_string())</div>
  <div class="fx" data-lang="text">train acc 1.000   val acc 0.881
f5            0.139
f8            0.113
f9            0.099
f4            0.099
f6            0.094
f2            0.093
f7            0.089
f3            0.089
f10           0.037
f11           0.037
row_noise     0.036
f0            0.035
f1            0.035
coin_noise    0.005</div>
  <p>The two noise columns are equally useless, yet <code>row_noise</code> receives about seven times the MDI of <code>coin_noise</code>, about as much as the four real-but-useless columns. The reason is the <strong>cardinality bias</strong> (cardinality means the number of distinct values). A 0/1 column offers only one possible split, but a column with 20,000 values offers thousands of thresholds, and deep in a tree, where a node holds only six rows, some threshold on random numbers will separate them perfectly by chance. The tree takes that split and MDI books its impurity drop as importance. The second reason is that MDI is computed on training data: this forest scores 1.000 on its training rows, so every bit of training impurity was removed, much of it by memorising noise, and MDI counts the memorising as importance. In practice this means ID-like columns, timestamps and exact amounts look more important under MDI than they are. MDI is fine as a free first look at a model that does not over-fit much, but it should never be presented as "what drives churn".</p>

  <h2 id="mte-perm"><span class="num">03</span>Permutation Importance</h2>
  <p>We want a measure that judges a column by how much the model's <em>predictions on new rows</em> depend on it. The idea of <strong>permutation importance</strong> is simple: if the model really needs a column, scrambling that column should hurt its score. Take a held-out dataset, shuffle one column's values among the rows (so each row receives some other row's value), leave every other column alone, and score the model again. The drop in score is the column's importance. Repeat the shuffle a few times and average, because one shuffle can be lucky.</p>
  <p>Think of testing how much a cricket team depends on one player by sending a random spectator out in his shirt while keeping the team size the same. If the team collapses, he mattered; if nothing changes, he was not doing much. Why shuffle rather than set the column to zero or delete it? Shuffling keeps the column's values exactly as they were, with the same average and spread, but breaks their link with the target. The model still receives normal-looking input, so we measure only the lost information.</p>
  <p>In symbols, for a fitted model f, a score s (accuracy, AUC, R², …) and a dataset D: compute s₀ on D; for each column j and each repeat k, shuffle column j to get a new dataset and score it, giving s_jk; then importance(j) = s₀ − the mean of s_jk over the repeats, reported with the standard deviation across repeats. On the diary there are no fresh days, so the example scores on the 14 training days (on real data, always use held-out rows), and to make it checkable by hand it "shuffles" each column by rotating it down one day, so D1 receives D14's value, D2 receives D1's, and so on:</p>
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
  <p>Rotating Overcast moves the overcast flag onto the wrong days, five days change prediction and the accuracy falls from 1.000 to 0.643, an importance of 0.357. Rotating TempC puts three days on the wrong side of 19 or 21.5 °C (0.214), and rotating Humid flips two (0.143). Sunny, Rain and Windy get exactly 0, because the tree never reads them, so changing them changes no prediction. The ranking differs from MDI (Overcast first here, TempC first there), and the number means something different: accuracy lost when the column's information is destroyed. On churn the forest is scored on its training rows and on the validation rows:</p>
  <div class="fx" data-lang="py">import pandas as pd
from churn import Xtr, ytr, Xva, yva
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
rf = RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0).fit(Xtr, ytr)
p_va = permutation_importance(rf, Xva, yva, n_repeats=5, random_state=0, n_jobs=2)
p_tr = permutation_importance(rf, Xtr, ytr, n_repeats=5, random_state=0, n_jobs=2)
df = pd.DataFrame({"MDI": rf.feature_importances_, "perm_train": p_tr.importances_mean,
                   "perm_val": p_va.importances_mean, "perm_val_std": p_va.importances_std}, index=Xtr.columns)
print(df.sort_values("perm_val", ascending=False).round(3).to_string())</div>
  <div class="fx" data-lang="text">              MDI  perm_train  perm_val  perm_val_std
f5          0.139       0.210     0.193         0.007
f8          0.113       0.117     0.106         0.006
f9          0.099       0.054     0.072         0.003
f7          0.089       0.068     0.070         0.004
f4          0.099       0.053     0.064         0.004
f6          0.094       0.045     0.061         0.002
f3          0.089       0.058     0.060         0.005
f2          0.093       0.038     0.051         0.005
row_noise   0.036       0.002     0.004         0.002
f1          0.035       0.002     0.001         0.002
f10         0.037       0.003     0.001         0.001
f0          0.035       0.002     0.001         0.001
coin_noise  0.005       0.000     0.001         0.001
f11         0.037       0.003     0.000         0.002</div>
  <p>Now both noise columns sit at the bottom with the useless real columns, all close to zero, which is the truth. The strongest columns agree with MDI, but the middle of the ranking changes. The standard-deviation column says how much the result moves between shuffles; differences smaller than about 0.01 here are noise. The training and validation columns are close on this data, but compute permutation importance on held-out rows by default: on training rows it measures what the model memorised, and on held-out rows it measures what the model needs in order to generalise. Use the metric you actually care about (for rare classes, average precision or ROC-AUC rather than accuracy, which can barely move when a column that matters only for the rare class is destroyed). The cost is one prediction pass per column per repeat, with no retraining.</p>
  <p>Permutation importance has two blind spots. If two columns carry the same information, shuffling one does little harm because the model can still read the other, so both look unimportant even though the information is vital (section 08 shows this with numbers). And shuffling can create rows that never happen in reality, such as a 20-year-old customer with 35 years of tenure, so the model is judged partly on inputs it was never trained for; this is mild for unrelated columns and serious for strongly related ones.</p>

  <h2 id="mte-drop"><span class="num">04</span>Drop-Column Importance</h2>
  <p>Permutation importance asks how much <em>this trained model</em> suffers when a column's information is destroyed. A different, practical question is whether we should keep the column at all: if we removed it for good and retrained, would the new model be worse? The retrained model might simply lean on other columns instead. <strong>Drop-column importance</strong> answers that directly: train once with all columns and score on validation, then for each column train a fresh model without it and score again; the importance is the full score minus the score without the column, with the same settings and random seed each time. It is the most honest answer to "do I need this column?" and the most expensive one, because d columns means d extra training runs.</p>
  <p>The difference is like a star batsman getting injured mid-match, so the team already picked has to cope without him, versus the selectors knowing in advance that he is unavailable and picking a different eleven around his absence. The second team usually does better, because it had time to adapt. On the diary the tree is retrained without each column and scored the only honest way possible with 14 rows, leave-one-day-out: train on 13 days, predict the 14th, repeat for every day.</p>
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeClassifier
from common import X, y
def loo_acc(cols):                     # leave-one-day-out accuracy of a fresh tree on these columns
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
  <p>Put the three methods side by side for the diary tree:</p>
  <table class="tbl">
    <tr><th>column</th><th>MDI</th><th>permutation (training days)</th><th>drop-column (leave-one-out)</th></tr>
    <tr><td>Overcast</td><td>0.222</td><td>0.357</td><td>+0.071</td></tr>
    <tr><td>Humid</td><td>0.280</td><td>0.143</td><td>−0.214</td></tr>
    <tr><td>TempC</td><td>0.498</td><td>0.214</td><td>−0.143</td></tr>
    <tr><td>Windy</td><td>0</td><td>0</td><td>−0.214</td></tr>
  </table>
  <p>The fully grown tree gets only 8 of 14 left-out days right (0.571), worse than always saying "Play" (9 of 14), because grown on 13 days it memorises odd days like D6 and D4. Without TempC it gets 0.714: the tree is <em>better</em> without the column MDI called the most important, because TempC's splits were fitting single days. A negative drop-column importance means the model does better without the column, or, more often on tiny data, plain noise: with 14 days every score moves in steps of 1/14 = 0.071, so differences of one or two days mean little. Only Overcast clearly helps. All three methods are correct; they answer different questions. MDI asks how much training impurity the column's splits removed, permutation asks how much this model loses when the column's information is destroyed, and drop-column asks how much any model of this kind would lose if we never had the column. On churn, with 14 retrainings of the forest:</p>
  <div class="fx" data-lang="py">import pandas as pd
from churn import Xtr, ytr, Xva, yva
from sklearn.ensemble import RandomForestClassifier
from sklearn.base import clone
rf = RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0).fit(Xtr, ytr)
base = rf.score(Xva, yva)
drop = {col: base - clone(rf).fit(Xtr.drop(columns=col), ytr).score(Xva.drop(columns=col), yva)
        for col in Xtr.columns}                                       # 14 retrainings
print(f"full model val acc {base:.3f}")
print(pd.Series(drop).sort_values(ascending=False).round(3).to_string())</div>
  <div class="fx" data-lang="text">full model val acc 0.881
f5            0.033
f8            0.030
f7            0.021
f4            0.019
f6            0.017
f2            0.009
f3            0.008
f9            0.007
f1            0.003
row_noise     0.002
f11           0.001
f10           0.000
f0           -0.000
coin_noise   -0.001</div>
  <p>The drop-column numbers are much smaller than the permutation numbers for the same columns. Removing f5 costs the retrained forest only a few points, because f5's information is partly repeated in the two redundant columns, which the retrained forest uses instead; the permuted model could not do that, because it had learnt to read f5 itself. The noise columns are near zero, which is correct, and the small negative values are random variation between refits. Drop-column importance answers the deployment question ("removing f9 costs about this much accuracy") but it is noisy, so repeat with several seeds before acting on a difference smaller than about 0.005. And it has the same twin problem as permutation, only worse: a column with a twin scores near zero because the twin fully takes over, so if you drop both twins on that evidence, the information is gone.</p>

  <h2 id="mte-pdp"><span class="num">05</span>Partial Dependence &amp; ICE</h2>
  <p>The three importance methods each give one number per column. They say <em>how much</em> the model uses a column but not <em>how</em>: if it gets warmer, does the chance of a match go up, down, or both? For churn: if complaints rise, does the risk rise, and is the rise steady or does it flatten out? That needs a curve, with the column's value along the bottom and the model's prediction up the side. The difficulty is that the prediction also depends on all the other columns. A <strong>partial dependence plot (PDP)</strong> handles them by averaging them out over real rows.</p>
  <p>The recipe is short. Pick the column (TempC) and a grid of values (18, 20, 24, 28 °C). For the first value, take every row of a reference dataset, overwrite its TempC with 18, keep all its other columns as they are, and predict. The average of those predictions is one point of the curve. Repeat for each grid value. In symbols, PD(v) = (1/n) Σᵢ f(x_S = v, x_C = x_C⁽ⁱ⁾), where S is the chosen column, C is every other column, and the sum runs over the n reference rows. An <strong>ICE curve</strong> (Individual Conditional Expectation) is the same thing for one row without the averaging, ICEᵢ(v) = f(x_S = v, x_C = x_C⁽ⁱ⁾), so the PDP is simply the mean of the ICE curves.</p>
  <div class="fx" data-lang="py">from common import X, tree
from play import df
grid = [18, 20, 24, 28]
ice = {}
for v in grid:
    Xv = X.copy(); Xv["TempC"] = v                   # overwrite TempC for every day, keep the rest
    ice[v] = tree.predict_proba(Xv)[:, 1]
    print(f"TempC={v}: PD = {ice[v].mean():.3f}   ({int(ice[v].sum())} of 14 days predicted Play)")
groups = {"overcast": df.Outlook == "Overcast",
          "normal, not overcast": (df.Outlook != "Overcast") &amp; (df.Humidity == "Normal"),
          "humid, not overcast": (df.Outlook != "Overcast") &amp; (df.Humidity == "High")}
for g, m in groups.items():                          # the 14 ICE curves come in three shapes
    print(f"ICE of {g:21s} ({', '.join(df.index[m])}):", [int(ice[v][m.values][0]) for v in grid])</div>
  <div class="fx" data-lang="text">TempC=18: PD = 0.643   (9 of 14 days predicted Play)
TempC=20: PD = 1.000   (14 of 14 days predicted Play)
TempC=24: PD = 0.643   (9 of 14 days predicted Play)
TempC=28: PD = 0.643   (9 of 14 days predicted Play)
ICE of overcast              (D3, D7, D12, D13): [1, 1, 1, 1]
ICE of normal, not overcast  (D5, D6, D9, D10, D11): [0, 1, 1, 1]
ICE of humid, not overcast   (D1, D2, D4, D8, D14): [1, 1, 0, 0]</div>
  <table class="tbl">
    <tr><th>TempC set to</th><th>4 overcast days</th><th>5 normal, not overcast</th><th>5 humid, not overcast</th><th>PD = average</th></tr>
    <tr><td>18</td><td>Play</td><td>No (≤ 19 °C)</td><td>Play (≤ 21.5 °C)</td><td>(4 + 0 + 5)/14 = 0.643</td></tr>
    <tr><td>20</td><td>Play</td><td>Play</td><td>Play</td><td>14/14 = 1.000</td></tr>
    <tr><td>24 or 28</td><td>Play</td><td>Play</td><td>No</td><td>9/14 = 0.643</td></tr>
  </table>
  <p>The PDP on its own says "the chance of play is 0.643 at any temperature except for a bump to 1.0 around 20 °C". The ICE curves tell the real story: overcast days are flat at Play; the five normal-humidity days step <em>up</em> above 19 °C; the five humid days step <em>down</em> above 21.5 °C. Opposite effects in different groups largely cancel in the average. When ICE curves are not parallel, the column <strong>interacts</strong> with other columns, meaning its effect depends on their values (here on Humid), and a single PDP line hides that. The bump itself is an artefact: it exists only because the tree memorised two single days. In scikit-learn, <code>PartialDependenceDisplay.from_estimator(model, X, ["TempC"], kind="both")</code> draws the PDP with the ICE curves on top; <code>centered=True</code> shifts each ICE curve to start at zero, which makes differences in the jumps easier to see; and passing a pair of columns draws a <strong>two-way PDP</strong>, a grid of average predictions over two columns, which is the standard way to look at an interaction.</p>
  <p>On churn, the model is a 480-tree LightGBM booster, the reference rows are 1,000 validation customers, and the grid is the 5th, 25th, 50th, 75th and 95th percentile of each column. The last part is a two-way PDP for the pair f5 × f8:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from churn import Xtr, ytr, Xva
from sklearn.inspection import partial_dependence
m = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1, random_state=0).fit(Xtr, ytr)
Xs = Xva.iloc[:1000]                                      # 1,000 reference rows keep it quick
for col in ["f5", "row_noise"]:
    grid = np.quantile(Xtr[col], [0.05, 0.25, 0.5, 0.75, 0.95])
    r = partial_dependence(m, Xs, [col], custom_values={col: grid}, kind="both", response_method="predict_proba")
    ice = r["individual"][0]                              # 1000 rows x 5 grid points
    rise = ice[:, -1] - ice[:, 0]
    print(f"{col}: grid {grid.round(2).tolist()}")
    print(f"   PDP (avg P(churn)) {r['average'][0].round(3).tolist()}")
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
  <p>On average, higher f5 means lower churn risk, but not in a straight line: the PDP first rises a little and then falls, a bend a linear model could not show. The ICE curves disagree sharply: moving f5 from its 5th to its 95th percentile lowers the churn probability a lot for some customers and <em>raises</em> it a lot for others, so the average change describes almost nobody. That spread is the signature of interactions, and the two-way PDP finds the partner: when f8 is low, raising f5 cuts churn sharply, but when f8 is high, raising f5 slightly increases it. The effect of f5 flips sign depending on f8, and SHAP will find the same pair in section 07. The noise column has a nearly flat PDP and ICE changes centred on zero; the small wiggles are the model's memorised noise.</p>
  <p>Partial dependence has the same weakness as permutation: it overwrites one column while keeping the others, so when columns are related (age and years of experience) the grid creates impossible rows such as "age 22, 30 years of experience", and the model's meaningless output there is averaged into the curve. <strong>ALE plots</strong> (Accumulated Local Effects) avoid this by only comparing predictions within small windows of the real data; they are not built into scikit-learn but are available in packages such as <code>alibi</code>. And because the PDP is an average, a column that pushes half the rows up and half down can show a flat line; never conclude "no effect" without looking at the ICE curves.</p>

  <h2 id="mte-shapley"><span class="num">06</span>Shapley Values</h2>
  <p>We still cannot answer the third question: why did the tree say "No match" for one particular day? Take D6: rainy, normal humidity, windy, 18 °C. The tree predicts Play = 0 for it, while its average prediction over the 14 days is 9/14 = 0.643. Something about D6 subtracts 0.643, and we want to know how much of that is due to the outlook, the humidity, the wind and the temperature, as four numbers that add up to exactly −0.643 and that split the blame fairly.</p>
  <p>Game theory solved this problem in 1953. Several players work as a team and earn a prize; how should it be shared? Lloyd Shapley's answer was to imagine the players joining the team one at a time in some order, and to note how much the prize grows when each one joins: that player's <strong>marginal contribution</strong> at that moment. Because the order matters (joining an empty team is different from joining a full one), you average each player's marginal contribution over every possible joining order. That average is the player's <strong>Shapley value</strong>. Think of two friends sharing a taxi: Asha alone would pay ₹100, Ravi alone ₹120, and together ₹150 because they share most of the route. If Asha gets in first she adds ₹100 and Ravi adds ₹50; if Ravi gets in first he adds ₹120 and Asha adds ₹30. Averaging the two orders, Asha pays ₹65 and Ravi ₹85, which adds up to the ₹150 fare. In machine learning the players are one row's feature values, the prize is the model's prediction, and <strong>SHAP</strong> (SHapley Additive exPlanations, Lundberg and Lee, 2017) is this idea applied to models.</p>
  <p>One step needs care: what does it mean for the model to know only some of the features? A tree needs every input. The value of a <strong>coalition</strong> S, a set of features whose values we know, is defined by filling in the unknown features from real background rows and averaging: v(S) = (1/n) Σᵢ f(x_S, b_C⁽ⁱ⁾), where the features in S take D6's values and the others take background row i's values. This is exactly the PDP's "overwrite and average" step applied to a set of columns. With no features known, v(∅) is the average prediction over the background, 0.643; with all known, it is the prediction for D6 itself, 0.</p>
  <p>The players are Outlook (Rain, which sets the three outlook columns together), Humid (normal), TempC (18) and Windy (strong). Windy never changes a prediction, because the tree never reads it, so it is a "dummy" player and we can leave it out of the hand calculation. With the 14 days as background, each v(S) is "how many of the 14 days are predicted Play once D6's values are pasted in for the features in S", divided by 14:</p>
  <table class="tbl">
    <tr><th>S (features taken from D6)</th><th>days predicted Play</th><th>v(S)</th></tr>
    <tr><td>none</td><td>9 (the tree's own answers)</td><td>9/14 = 0.643</td></tr>
    <tr><td>Outlook (every day rainy)</td><td>6</td><td>6/14 = 0.429</td></tr>
    <tr><td>Humid (every day normal humidity)</td><td>13: all but D6</td><td>13/14 = 0.929</td></tr>
    <tr><td>TempC (every day 18 °C)</td><td>9: 4 overcast + 5 humid days</td><td>9/14 = 0.643</td></tr>
    <tr><td>Outlook, Humid</td><td>12: all but the two 18 °C days</td><td>12/14 = 0.857</td></tr>
    <tr><td>Outlook, TempC</td><td>7: the 7 humid days</td><td>7/14 = 0.500</td></tr>
    <tr><td>Humid, TempC</td><td>4: only the overcast days</td><td>4/14 = 0.286</td></tr>
    <tr><td>all three (= D6 itself)</td><td>0</td><td>0</td></tr>
  </table>
  <p>With three players there are 3! = 6 joining orders. In each, a player's marginal contribution is v(after it joins) − v(before). Working in fourteenths to keep the numbers whole:</p>
  <table class="tbl">
    <tr><th>order</th><th>Outlook adds</th><th>Humid adds</th><th>TempC adds</th><th>sum</th></tr>
    <tr><td>O, H, T</td><td>6 − 9 = −3</td><td>12 − 6 = +6</td><td>0 − 12 = −12</td><td>−9</td></tr>
    <tr><td>O, T, H</td><td>−3</td><td>0 − 7 = −7</td><td>7 − 6 = +1</td><td>−9</td></tr>
    <tr><td>H, O, T</td><td>12 − 13 = −1</td><td>13 − 9 = +4</td><td>−12</td><td>−9</td></tr>
    <tr><td>H, T, O</td><td>0 − 4 = −4</td><td>+4</td><td>4 − 13 = −9</td><td>−9</td></tr>
    <tr><td>T, O, H</td><td>7 − 9 = −2</td><td>−7</td><td>9 − 9 = 0</td><td>−9</td></tr>
    <tr><td>T, H, O</td><td>−4</td><td>4 − 9 = −5</td><td>0</td><td>−9</td></tr>
    <tr><td><b>average</b></td><td><b>−17/84 = −0.202</b></td><td><b>−5/84 = −0.060</b></td><td><b>−32/84 = −0.381</b></td><td><b>−9/14 = −0.643</b></td></tr>
  </table>
  <p>So the base value 0.643, plus TempC −0.381, Outlook −0.202, Humid −0.060 and Windy 0, gives exactly 0, the tree's prediction for D6. In words: the tree said No mainly because it was cold, partly because it rained, and the wind played no part. Every row of the table sums to −9/14 because each order starts at v(∅) and ends at v(all), so the averages must add up to the same total. Look also at Humid's column: its contribution swings from +6/14 to −7/14 depending on whether TempC was already known. Whether "normal humidity" helps or hurts depends on the temperature, which is the interaction the ICE curves showed.</p>
  <p>Listing every order becomes impossible quickly, so the formula groups the orders by the set S of features that joined before feature j. A given S appears in |S|! · (M − |S| − 1)! of the M! orders, which gives φⱼ = Σ over S ⊆ F∖{j} of [ |S|! (M − |S| − 1)! / M! ] · [ v(S ∪ {j}) − v(S) ], where F is the set of all M features. For M = 3 the weights are 1/3 for the empty S, 1/6 for each one-feature S and 1/3 for the two-feature S. Checking TempC in fourteenths: (1/3)(9 − 9) + (1/6)(7 − 6) + (1/6)(4 − 13) + (1/3)(0 − 12) = −5.33, and −5.33/14 = −0.381. The code computes all 16 coalition values with the four players, applies the formula literally, and then asks the <code>shap</code> library's <code>TreeExplainer</code> for the same day:</p>
  <div class="fx" data-lang="py">from itertools import combinations
from math import factorial
import shap
from common import X, tree
x = X.loc["D6"]                                      # explain D6: rain, normal humidity, windy, 18 C -&gt; no play
players = {"Outlook": ["Overcast", "Sunny", "Rain"], "Humid": ["Humid"], "Windy": ["Windy"], "TempC": ["TempC"]}
def v(S):                                            # D6's values for players in S, each background day's for the rest
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
print(f"base {v(()):.4f} + sum {sum(phi.values()):+.4f} = {v(()) + sum(phi.values()):.4f}")
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
base 0.6429 + sum -0.6429 = 0.0000
shap TreeExplainer per column: {'Overcast': -0.2024, 'Sunny': 0.0, 'Rain': 0.0, 'Humid': -0.0595, 'Windy': 0.0, 'TempC': -0.381}</div>
  <p>Every coalition containing Windy has the same value as the same coalition without it, so Windy's Shapley value is exactly 0, and the other three match the hand table. The library, working directly on the tree, gives the same numbers; it reports the outlook's share on the Overcast column, the one the tree actually splits on.</p>
  <p>Why trust this particular way of sharing? Shapley proved that it is the <em>only</em> rule with four fairness properties. <strong>Efficiency</strong> (also called local accuracy): the contributions add up exactly to the prediction minus the base value. <strong>Symmetry</strong>: two features that always add the same amount get the same value. <strong>Dummy</strong>: a feature that never changes any coalition's value gets zero, like Windy. <strong>Additivity</strong>: for a model that is a sum of models, the values are the sums of each model's values, which is what lets TreeSHAP explain a forest or booster one tree at a time. SHAP's authors also highlight <strong>consistency</strong>: if a model is changed so that a feature's contribution never decreases in any coalition, its SHAP value cannot go down, a property that split counts and gain importance can violate. One consequence is easy to forget: a SHAP value is not "the effect of the feature" in isolation but the feature's fair share of the difference between this prediction and the <em>background</em> average. Change the background (all 14 days, or only rainy days) and the values change, because the question changed.</p>
  <p>Humid's swing suggests going one step further. <strong>SHAP interaction values</strong> split each feature's Shapley value into a main effect plus a share of each pair interaction. For a pair i, j the building block is "together minus each alone", ∇ᵢⱼ(S) = v(S ∪ {i, j}) − v(S ∪ {i}) − v(S ∪ {j}) + v(S), averaged over the sets S of other features with weights |S|! (M − |S| − 2)! / (2 (M − 1)!). For Humid × TempC with M = 3 both weights are 1/4: ∇(∅) = 4 − 13 − 9 + 9 = −9 and ∇({Outlook}) = 0 − 12 − 7 + 6 = −13 (in fourteenths), so Φ = (1/4)(−22)/14 = −0.393, and the same value is booked to TempC × Humid, because a pair's interaction is split in half between its two members. The main effect is whatever is left of φᵢ after the pair terms:</p>
  <div class="fx" data-lang="py">from itertools import combinations
from math import factorial
import pandas as pd
from common import X, tree
x = X.loc["D6"]
players = {"Outlook": ["Overcast", "Sunny", "Rain"], "Humid": ["Humid"], "TempC": ["TempC"]}   # Windy is a dummy
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
  <p>Each row sums to that feature's Shapley value, and the whole matrix sums to −0.643. Read TempC's row: its main effect is only +0.048, and almost all of its −0.381 blame for D6 is its interaction with humidity. That is the honest description of this tree: "cold" is not bad on its own; cold on a normal-humidity, non-overcast day is.</p>
  <p>The catch is cost. M features have 2^M coalitions, and each needs predictions on every background row. For the 14 churn columns that is 16,384 coalitions per customer, and for 200 columns it is hopeless. That is why the next section matters.</p>

  <h2 id="mte-shap"><span class="num">07</span>SHAP in Practice</h2>
  <p><strong>TreeSHAP</strong> (Lundberg and colleagues, 2018–2020) computes exact Shapley values for tree models without listing coalitions. The key observation is that a tree's prediction for a coalition S depends only on which branches the row may follow: at a split on a feature in S the row goes the way D6 (or whichever row we explain) would go, and at a split on a feature outside S it goes both ways, weighted by how the background rows divide. TreeSHAP walks each root-to-leaf path once and uses a small dynamic program to keep track of how many features of each coalition size are fixed along the path, which gives exactly the Shapley weights. Because a forest or booster is a sum of trees, the additivity property lets it explain each tree separately and add the results. The cost grows with the number of trees, leaves and depth, not with 2^M.</p>
  <p>TreeSHAP comes in two flavours. The <strong>path-dependent</strong> version (<code>feature_perturbation="tree_path_dependent"</code>, the default when no data is given) needs no background data: at a split on an unknown feature it follows both children weighted by how many training rows went each way, which the tree stores. The <strong>interventional</strong> version (<code>data=background</code>) fills unknown features from real background rows and averages, exactly as in the hand calculation; it costs more per row but has a cleaner meaning. For models that are not trees, <strong>KernelSHAP</strong> approximates the same values by fitting a weighted linear regression over a sample of coalitions; it works with any model but is slow and approximate.</p>
  <p>On churn the explained model is the same 480-tree LightGBM booster. The code checks additivity on all 3,000 validation rows, prints global importance as the mean absolute SHAP value per column, walks through one customer, summarises a dependence plot in numbers and finds the strongest interactions:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb, shap, time
from churn import Xtr, ytr, Xva
m = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1, random_state=0).fit(Xtr, ytr)
ex = shap.TreeExplainer(m)                             # path-dependent TreeSHAP, no background data needed
t0 = time.time(); sv = ex(Xva)                         # 3,000 rows x 14 columns, in log-odds
print(f"TreeSHAP on 3,000 rows: {time.time()-t0:.1f}s   shape {sv.values.shape}")
raw = m.predict(Xva, raw_score=True)
print("additivity: max |base + sum(SHAP) - raw score| =", float(np.abs(sv.base_values + sv.values.sum(1) - raw).max()))
glob = pd.Series(np.abs(sv.values).mean(0), Xva.columns).sort_values(ascending=False)
print("mean |SHAP| (global):", glob.round(3).to_dict())
i = 0
c = pd.Series(sv.values[i], Xva.columns)
print(f"customer {i}: base {sv.base_values[i]:.3f}  raw {raw[i]:.3f}  prob {m.predict_proba(Xva.iloc[[i]])[0,1]:.3f}")
top = c.reindex(c.abs().sort_values(ascending=False).index)
run = sv.base_values[i]
for col, val in top.head(5).items():
    run += val
    print(f"  {col:10s} = {Xva.iloc[i][col]:7.3f}  SHAP {val:+.3f}  running total {run:.3f}")
print(f"  other 9 columns together: {top.iloc[5:].sum():+.3f}  -&gt; {run + top.iloc[5:].sum():.3f}")
bins = pd.qcut(Xva["f5"], 5)                           # dependence: f5's SHAP value against f5's value
print("f5 value bin -&gt; mean SHAP of f5:")
print(pd.Series(sv.values[:, list(Xva.columns).index("f5")]).groupby(bins.values, observed=True).mean().round(3).to_string())
iv = ex.shap_interaction_values(Xva.iloc[:200])        # 200 rows x 14 x 14
print("interaction rows sum to SHAP values:", np.allclose(iv.sum(2), sv.values[:200], atol=1e-4))
A = np.abs(iv).mean(0); np.fill_diagonal(A, 0)
inter = pd.DataFrame(A, Xva.columns, Xva.columns)
pairs = inter.where(np.triu(np.ones(inter.shape, bool), 1)).stack().sort_values(ascending=False)
print("strongest pairs (mean |interaction|):", pairs.head(3).round(3).to_dict())</div>
  <div class="fx" data-lang="text">TreeSHAP on 3,000 rows: 68.0s   shape (3000, 14)
additivity: max |base + sum(SHAP) - raw score| = 3.019806626980426e-14
mean |SHAP| (global): {'f5': 0.767, 'f8': 0.5, 'f9': 0.423, 'f4': 0.4, 'f7': 0.364, 'f3': 0.33, 'f6': 0.303, 'f2': 0.216, 'row_noise': 0.089, 'f10': 0.063, 'f11': 0.062, 'f0': 0.048, 'f1': 0.048, 'coin_noise': 0.008}
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
interaction rows sum to SHAP values: True
strongest pairs (mean |interaction|): {('f5', 'f8'): 0.227, ('f8', 'f9'): 0.174, ('f5', 'f6'): 0.167}</div>
  <p>Start with additivity: on every one of the 3,000 rows, the base value plus the 14 SHAP values equals the model's raw score to within about 10⁻¹⁴, which is the efficiency property on 480 trees. Next the units. For a LightGBM or XGBoost classifier TreeSHAP explains the <strong>raw score</strong>, which is in <strong>log-odds</strong>, the logarithm of p / (1 − p) (see <a class="xref" data-note="ml_classification">Classification</a>). Customer 0's raw score of 3.897 corresponds to a probability of 1 / (1 + e^−3.897) = 0.980, and the base value, the average raw score, corresponds to a probability of about one half. SHAP values add up in log-odds, but their effects on probability do not, because the sigmoid curve bends: +1 log-odds moves a probability of 0.50 to 0.73 but moves 0.95 only to 0.98.</p>
  <p>The global ranking by mean |SHAP| finds the same informative columns as permutation importance, with f5 first. But <code>row_noise</code> ranks above the real-but-useless columns: the booster genuinely used the noise column to fit training rows, and SHAP faithfully reports what the model does, mistakes included. The single customer is an explanation you could give to the head of retention: starting from the average, f8 pushes her strongly towards churn, then f3, f9, f5 and f4, and the other nine columns add a little more, landing at 3.897. That running total is exactly what a <strong>waterfall plot</strong> draws:</p>
  <figure class="viz"><svg viewBox="0 0 600 270" width="600">
<line x1="150" y1="20" x2="150" y2="240" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="150" y1="245" x2="560" y2="245" stroke="currentColor" stroke-opacity="0.4"/>
<text x="150" y="258" text-anchor="middle" class="tm" font-size="11">0</text>
<text x="250" y="258" text-anchor="middle" class="tm" font-size="11">1</text>
<text x="350" y="258" text-anchor="middle" class="tm" font-size="11">2</text>
<text x="450" y="258" text-anchor="middle" class="tm" font-size="11">3</text>
<text x="550" y="258" text-anchor="middle" class="tm" font-size="11">4</text>
<text x="140" y="36" text-anchor="end" font-size="11">base value</text><rect x="150.0" y="24" width="2.2" height="16" class="fs" stroke="currentColor"/><text x="158.2" y="36" class="tm" font-size="11">0.022</text>
<text x="140" y="66" text-anchor="end" font-size="11">f8 = −2.154</text><rect x="152.2" y="54" width="155.3" height="16" class="fr"/><text x="313.5" y="66" class="tr" font-size="11">+1.553</text>
<text x="140" y="96" text-anchor="end" font-size="11">f3 = 2.318</text><rect x="307.5" y="84" width="65.9" height="16" class="fr"/><text x="379.5" y="96" class="tr" font-size="11">+0.659</text>
<text x="140" y="126" text-anchor="end" font-size="11">f9 = 0.781</text><rect x="373.5" y="114" width="48.7" height="16" class="fr"/><text x="428.1" y="126" class="tr" font-size="11">+0.487</text>
<text x="140" y="156" text-anchor="end" font-size="11">f5 = −0.284</text><rect x="422.1" y="144" width="46.9" height="16" class="fr"/><text x="475.1" y="156" class="tr" font-size="11">+0.469</text>
<text x="140" y="186" text-anchor="end" font-size="11">f4 = 0.722</text><rect x="469.1" y="174" width="27.5" height="16" class="fr"/><text x="502.5" y="186" class="tr" font-size="11">+0.275</text>
<text x="140" y="216" text-anchor="end" font-size="11">9 other columns</text><rect x="496.5" y="204" width="43.2" height="16" class="fr"/><text x="490.5" y="216" text-anchor="end" class="tr" font-size="11">+0.432</text>
<line x1="539.7" y1="20" x2="539.7" y2="240" class="sb" stroke-dasharray="4 3" stroke-width="1.5"/>
<text x="534.7" y="16" text-anchor="end" class="tb" font-size="11">f(x) = 3.897 log-odds → P = 0.980</text>
</svg><figcaption>A waterfall plot for customer 0, drawn from the printed numbers. Each bar starts where the previous one ended; red bars push towards churn (a blue bar would push away). The last bar ends exactly at the model's raw score.</figcaption></figure>
  <p>Each bar starts where the previous one ended, so the chart is the running total from the code output turned into a picture. The first thin bar is the base value, each red bar is one column's push towards churn (a push away from churn would be blue and point left), and the dashed line where the last bar ends is the model's raw score for this customer.</p>
  <p>The dependence summary groups customers into five bins of f5 and averages f5's SHAP value in each: low f5 pushes towards churn and high f5 away, with the same bend the PDP showed. The interaction values, computed for 200 rows, form a 14 × 14 matrix per row whose rows sum to the SHAP values, and the strongest pair is f5 × f8, exactly the pair the two-way PDP flagged. If stakeholders need contributions in probability units, KernelSHAP can explain <code>predict_proba</code> directly, at the cost of an approximation and many more model calls:</p>
  <div class="fx" data-lang="py">import pandas as pd, lightgbm as lgb, shap
from churn import Xtr, ytr, Xva
m = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1, random_state=0).fit(Xtr, ytr)
bgd = shap.sample(Xtr, 100, random_state=0)            # 100 background customers
ke = shap.KernelExplainer(lambda d: m.predict_proba(pd.DataFrame(d, columns=Xva.columns))[:, 1], bgd)
kv = ke.shap_values(Xva.iloc[:1], nsamples=500, silent=True)
print(f"KernelSHAP, customer 0, probability units: base {ke.expected_value:.3f} + sum {kv.sum():+.3f} = {ke.expected_value + kv.sum():.3f}")
print(f"model's probability: {m.predict_proba(Xva.iloc[:1])[0, 1]:.3f}")</div>
  <div class="fx" data-lang="text">KernelSHAP, customer 0, probability units: base 0.492 + sum +0.489 = 0.980
model's probability: 0.980</div>
  <p>Here the contributions add up in probability: a base of 0.492 plus 0.489 gives the model's 0.980.</p>
  <p>The <code>shap</code> library draws five standard plots from an explanation object <code>sv = explainer(X)</code>. <code>shap.plots.waterfall(sv[0])</code> is the chart above for one row: the biggest bars are its reason codes. <code>shap.plots.force(sv[0])</code> shows the same thing as a horizontal tug-of-war between red pushes up and blue pushes down. <code>shap.plots.bar(sv)</code> shows mean |SHAP| per column, the global ranking. <code>shap.plots.beeswarm(sv)</code> puts one dot per row per column, with the SHAP value along the bottom and the dot coloured by the column's value (red high, blue low), so "red dots on the right" means high values raise the prediction; for f5 you would see blue dots on the right and red on the left. <code>shap.plots.scatter(sv[:, "f5"], color=sv)</code> is the dependence plot: the column's value against its SHAP value, coloured by the column it interacts with most, where vertical spread at the same value means interactions. A restaurant bill makes the distinction clear: the waterfall is one table's bill item by item, the bar plot is the monthly report of which items cost most on average, and the beeswarm shows every table's bill at once.</p>
  <p>Two habits make SHAP reports honest. State the baseline: "f8 pushed her up by 1.55" means relative to the average training customer (path-dependent) or to your chosen background, and explaining a loan refusal against "all applicants" or against "approved applicants" gives different, equally correct numbers. And state the units: do not convert each log-odds SHAP value into "percentage points" separately, because they do not add up in probability space.</p>

  <h2 id="mte-corr"><span class="num">08</span>Correlated Features</h2>
  <p>Every method so far quietly assumed that each column brings its own information. Real tables have twins: monthly and annual bill, age and date of birth, temperature in Celsius and in Fahrenheit. We already saw a mild version on the diary, where Windy got zero from every method because TempC happened to carry the same information about D6. To see the effect cleanly, the code adds a near-copy of the strongest churn column, <code>f5_twin = f5 + small noise</code>. The information in the data has not changed at all, so an ideal importance method would report the same total for the pair as for f5 alone.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb, shap
from churn import Xtr, ytr, Xva, yva
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
rng = np.random.default_rng(1)
def add_twin(D):
    D = D.copy(); D["f5_twin"] = D["f5"] + rng.normal(0, 0.05, len(D)); return D
Xtr2, Xva2 = add_twin(Xtr), add_twin(Xva)
print("corr(f5, f5_twin) =", round(np.corrcoef(Xtr2.f5, Xtr2.f5_twin)[0, 1], 4))
rf = lambda: RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0)
rows = {}
for name, A, B in [("without twin", Xtr, Xva), ("with twin", Xtr2, Xva2)]:
    m = rf().fit(A, ytr)
    perm = permutation_importance(m, B, yva, n_repeats=5, random_state=0, n_jobs=2).importances_mean
    g = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1, random_state=0).fit(A, ytr)
    sh = np.abs(shap.TreeExplainer(g)(B).values).mean(0)
    for col in ["f5", "f5_twin"]:
        if col in A:
            j = list(A.columns).index(col)
            rows[(name, col)] = {"MDI": m.feature_importances_[j], "perm_val": perm[j], "mean|SHAP|": sh[j]}
full = rf().fit(Xtr2, ytr); base = full.score(Xva2, yva)
for col in ["f5", "f5_twin"]:                                      # drop-column, twin present
    rows[("with twin", col)]["drop_col"] = base - rf().fit(Xtr2.drop(columns=col), ytr).score(Xva2.drop(columns=col), yva)
print(pd.DataFrame(rows).T.round(3).to_string())
both = rf().fit(Xtr2.drop(columns=["f5", "f5_twin"]), ytr)
print("drop BOTH f5 and f5_twin:", round(base - both.score(Xva2.drop(columns=["f5", "f5_twin"]), yva), 3))
idx = rng.permutation(len(Xva2)); Xg = Xva2.copy()                  # grouped permutation: same shuffle for both
Xg[["f5", "f5_twin"]] = Xva2[["f5", "f5_twin"]].values[idx]
print("grouped permutation (f5 + twin shuffled together):", round(base - full.score(Xg, yva), 3))</div>
  <div class="fx" data-lang="text">corr(f5, f5_twin) = 0.9996
                        MDI  perm_val  mean|SHAP|  drop_col
without twin f5       0.139     0.193       0.767       NaN
with twin    f5       0.085     0.043       0.494     0.001
             f5_twin  0.089     0.058       0.295    -0.006
drop BOTH f5 and f5_twin: 0.028
grouped permutation (f5 + twin shuffled together): 0.221</div>
  <p>Read the table column by column. MDI splits the credit roughly in half, because each tree uses one twin or the other more or less at random. Permutation importance collapses for both twins, because when one is shuffled the model still reads the other; together they show well under half of f5's original value. Drop-column importance goes to about zero for both, because a model retrained without one twin simply uses the other. Mean |SHAP| splits the credit between the twins, and their sum is close to the original. The last two lines show the fix and the danger. Shuffling both twins together with the same row order, a <strong>grouped permutation</strong>, restores the true importance of the information. And dropping both twins costs real accuracy, although each one alone looked useless; an analyst who removes "useless" columns one at a time on drop-column evidence would remove both and lose it.</p>
  <p>The general lesson is that with correlated columns every importance method answers a question about <em>that column, given that the others are still there</em>. None of them tells you how important the underlying information is, and low importance for a column with a twin does not mean "safe to drop both". The usual fixes, in order of how often they are used: group correlated columns first (by correlation, or by hierarchical clustering on 1 − |correlation|) and permute or drop each group together, remembering that the SHAP values of a group can simply be added; keep one representative per group before training if the duplicates are not needed; or use conditional methods (conditional permutation, which shuffles within bins of the correlated column, or conditional SHAP), which keep rows realistic but blur the line between "the model uses this" and "this is correlated with something the model uses".</p>

  <h2 id="mte-causal"><span class="num">09</span>Explanation Is Not Causation</h2>
  <p>Even with perfect, independent columns, an explanation answers "what does the model use to predict?" People hearing it often take it to mean "what causes the outcome, and what should we change?" Those are different questions. On the diary, every method says the tree relies on TempC and ignores Windy, and SHAP blames 18 °C for D6. That is a faithful description of the tree. It is not a fact about cricket: the only cold normal-humidity day happened to be windy, so the tree could have used either column, and it chose temperature. Telling the club "matches fail when it is cold" would be a causal claim that the data cannot support. The classic illustration is ice-cream sales, which predict drowning deaths very well because both rise in summer; a model of drownings would rank ice-cream sales highly, and banning ice cream would save nobody.</p>
  <p>A simulation makes the gap measurable, because there we know the truth. Two real causes decide churn: a price hike (0 or 1) and tenure. A third column, <code>cancel_visits</code>, counts visits to the "cancel subscription" page; it is a <strong>symptom</strong>, since customers who are already leaving visit the page, but visiting it makes nobody leave. A booster is trained on all three, and then we ask what would happen if we changed a column:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, shap, lightgbm as lgb
rng = np.random.default_rng(0); n = 20000
price_hike = rng.integers(0, 2, n)                       # a real cause (0/1)
tenure = rng.integers(1, 60, n)                          # also a real cause
p = 1 / (1 + np.exp(-(-2.0 + 2.0 * price_hike - 0.03 * tenure)))
churn = rng.random(n) &lt; p                                # the simulated world decides churn
cancel_visits = rng.poisson(np.where(churn, 3.0, 0.3))   # a SYMPTOM: people about to leave visit the cancel page
X = pd.DataFrame({"price_hike": price_hike, "tenure": tenure, "cancel_visits": cancel_visits})
m = lgb.LGBMClassifier(n_estimators=200, learning_rate=0.05, verbose=-1, random_state=0).fit(X[:15000], churn[:15000])
Xt = X[15000:]
sv = shap.TreeExplainer(m)(Xt)
print("mean |SHAP|:", pd.Series(np.abs(sv.values).mean(0), X.columns).round(3).to_dict())
print(f"model's predicted churn rate, as is           : {m.predict_proba(Xt)[:, 1].mean():.3f}")
print(f"model's predicted churn rate, cancel_visits=0 : {m.predict_proba(Xt.assign(cancel_visits=0))[:, 1].mean():.3f}")
print(f"true churn rate, either way (visits cause nothing): {churn[15000:].mean():.3f}")
print(f"true churn rate if price_hike removed for all: {(1 / (1 + np.exp(-(-2.0 - 0.03 * Xt.tenure)))).mean():.3f}")
print(f"model's predicted rate with price_hike=0      : {m.predict_proba(Xt.assign(price_hike=0))[:, 1].mean():.3f}")</div>
  <div class="fx" data-lang="text">mean |SHAP|: {'price_hike': 1.197, 'tenure': 0.668, 'cancel_visits': 2.622}
model's predicted churn rate, as is           : 0.178
model's predicted churn rate, cancel_visits=0 : 0.016
true churn rate, either way (visits cause nothing): 0.171
true churn rate if price_hike removed for all: 0.058
model's predicted rate with price_hike=0      : 0.126</div>
  <p>SHAP's top column is the symptom, ahead of both real causes. As a description of the model that is correct: cancel-page visits are the best <em>predictor</em>. But acting on it would be useless. If the company hid the cancel page, so that visits were zero for everyone, the model would predict churn falling from about 18% to under 2%; in the simulated world churn would not change at all, because visits never caused anything. Meanwhile the real lever is under-estimated: removing the price hike truly cuts churn to about 6%, but the model predicts only about 13%, because much of the price hike's effect is "explained away" by the visits it causes.</p>
  <p>So two different quantities are in play. <strong>Predictive importance</strong> is how much the model relies on a column to predict; all the methods in this note estimate it. A <strong>causal effect</strong> is how much the outcome would change if you intervened on the column; estimating it needs experiments (<a class="xref" data-note="st_abtesting">A/B Testing</a>) or causal-inference methods that make explicit assumptions about what causes what. "SHAP says high bills drive churn, so cut bills" is at best a hypothesis to test.</p>
  <p>Where these tools <em>are</em> reliable and valuable is in describing the model itself: debugging it, finding leakage (a symptom column like <code>cancel_visits</code> is often exactly that, because in production you may not have it before the customer decides), checking that the model agrees with domain knowledge, giving reason codes for individual decisions, and choosing which inputs to monitor (see <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>). A sensible workflow on a real project: glance at MDI only as a sanity check; rank columns with permutation importance on held-out data, with repeats; group correlated columns and measure groups; confirm with drop-column importance before removing anything; use SHAP summaries and dependence plots to describe how columns push predictions, and waterfalls for individual decisions; and treat every "this column drives the outcome" statement as a hypothesis for an experiment.</p>

  <h2 id="mte-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most common mistake is presenting raw MDI as "what drives the outcome". On the churn forest a pure-noise column with 20,000 distinct values received about as much MDI as real columns, simply because it offered many lucky splits on the training rows. The fix is permutation importance on held-out rows, where the same noise column sits near zero. A related mistake is computing permutation importance on the training rows, which measures what the model memorised rather than what it needs to generalise.</p>
  <p>The second is dropping columns one at a time on the evidence of permutation or drop-column importance when they have twins. In section 08 each twin alone looked useless while the pair was clearly needed. Measure and drop correlated columns as groups.</p>
  <p>The third is reading a flat partial dependence line as "no effect". On the diary tree, temperature pushed normal-humidity days up and humid days down, and the average nearly cancelled. Always look at ICE curves or a SHAP dependence plot before concluding that a column does nothing.</p>
  <p>The fourth is mixing up units and baselines with SHAP. TreeSHAP values for a booster classifier are in log-odds and add up there; converting each one to "percentage points" separately gives numbers that do not add up to anything. And a SHAP value is always relative to a background; a report that does not say which background was used cannot be checked.</p>
  <p>The last, and the most expensive, is causal language. "Cancel-page visits drive churn" was the simulated model's top reason, and the visits had no causal effect at all. Importance describes prediction; decisions about what to change need experiments.</p>

  <h2 id="mte-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Global importance</b>: one number per column, how much the model relies on it overall.</li>
    <li><b>Feature effect</b>: how the prediction changes as one column changes (PDP, ICE, SHAP dependence).</li>
    <li><b>Local explanation</b>: one prediction split into per-column contributions (SHAP).</li>
    <li><b>Model-specific</b> (MDI, TreeSHAP) reads the model's insides; <b>model-agnostic</b> (permutation, drop-column, PDP, KernelSHAP) only calls predict.</li>
    <li><b>Shapley value</b>: a player's average marginal contribution over all joining orders.</li>
    <li><b>Interaction</b>: a column's effect depends on another column's value (crossing ICE curves).</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Diary value</th></tr>
    <tr><td>MDI of a split</td><td>Δ(t) = (N_t/N)[imp(t) − (N_L/N_t)imp(L) − (N_R/N_t)imp(R)]</td><td>root 0.1020; MDI TempC 0.498</td></tr>
    <tr><td>Permutation</td><td>s₀ − mean_k s_jk</td><td>Overcast 1.000 − 0.643 = 0.357</td></tr>
    <tr><td>Drop-column</td><td>s(all) − s(retrained without j)</td><td>TempC 0.571 − 0.714 = −0.143</td></tr>
    <tr><td>Partial dependence</td><td>PD(v) = (1/n) Σᵢ f(x_S = v, x_C⁽ⁱ⁾)</td><td>PD(20 °C) = 14/14</td></tr>
    <tr><td>Coalition value</td><td>v(S) = (1/n) Σᵢ f(x_S, b_C⁽ⁱ⁾)</td><td>v({Humid, TempC}) = 4/14</td></tr>
    <tr><td>Shapley value</td><td>φⱼ = Σ_S |S|!(M−|S|−1)!/M! · [v(S∪{j}) − v(S)]</td><td>D6: TempC −0.381</td></tr>
    <tr><td>Efficiency</td><td>base + Σ φⱼ = f(x)</td><td>0.643 − 0.643 = 0</td></tr>
  </table>
  <h3>Which method for which question</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Question</th><th>Data</th><th>Cost</th><th>Main weakness</th></tr>
    <tr><td>MDI / gain</td><td>how much training impurity did its splits remove?</td><td>training (free)</td><td>none</td><td>many-valued bias; training data only</td></tr>
    <tr><td>Permutation</td><td>how much does this model lose without the column's information?</td><td>held-out</td><td>d × K predictions</td><td>twins hide each other; impossible rows</td></tr>
    <tr><td>Drop-column</td><td>would a retrained model be worse without it?</td><td>held-out</td><td>d retrainings</td><td>expensive, noisy; twins replace each other</td></tr>
    <tr><td>PDP / ICE</td><td>what shape is the effect, on average / per row?</td><td>any rows</td><td>grid × n predictions</td><td>averages hide interactions; impossible rows</td></tr>
    <tr><td>SHAP</td><td>how much did each column push this prediction from the base?</td><td>background or training cover</td><td>fast for trees</td><td>explains the model, not the world; twins split credit</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">rf.feature_importances_                                          # MDI
from sklearn.inspection import permutation_importance, PartialDependenceDisplay
r = permutation_importance(model, X_val, y_val, n_repeats=5, scoring="roc_auc")
PartialDependenceDisplay.from_estimator(model, X, ["f5"], kind="both")   # PDP + ICE
import shap
ex = shap.TreeExplainer(model)                  # path-dependent; data=bg for interventional
sv = ex(X)                                      # sv.values, sv.base_values (log-odds for boosters)
shap.plots.waterfall(sv[0]); shap.plots.beeswarm(sv); shap.plots.bar(sv)
iv = ex.shap_interaction_values(X[:200])        # rows x M x M</div>
  <h3>Gotchas</h3>
  <ul>
    <li>MDI favours many-valued columns and is measured on training data.</li>
    <li>Permutation importance on held-out rows, with repeats; group correlated columns.</li>
    <li>Low importance for one twin does not mean both can go.</li>
    <li>A flat PDP can hide opposite effects; check ICE.</li>
    <li>Booster SHAP values are in log-odds; state the background.</li>
    <li>Every method explains the model, not the world.</li>
  </ul>

  <h2 id="mte-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between global and local explanations?</summary><div class="qa-body">A global explanation describes the model as a whole: which columns it relies on (importance) or how its predictions change with a column (partial dependence). A local explanation describes one prediction: how much each column pushed this row's output away from the average. Mean |SHAP| turns local SHAP values into a global ranking.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is impurity importance (MDI) computed?</summary><div class="qa-body">For every split node t, compute the weighted impurity decrease (N_t/N)·[imp(t) − (N_L/N_t)·imp(L) − (N_R/N_t)·imp(R)] and add it to the column used at t. Sum over all nodes, average over the trees of a forest, and normalise so the columns add up to 1. It is what scikit-learn's <code>feature_importances_</code> returns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is MDI biased towards high-cardinality features?</summary><div class="qa-body">A column with many distinct values offers many candidate thresholds, so deep in a tree some threshold separates a few training rows purely by chance, and its impurity drop is credited to that column. MDI is computed on the training data, so this memorisation counts as importance. On the churn forest a pure-noise column with 20,000 values scored about seven times more than a 0/1 noise column.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does permutation importance work, and why compute it on validation data?</summary><div class="qa-body">Score the model on held-out data, shuffle one column (which keeps its distribution but breaks its link with the target), score again and take the drop, averaged over several shuffles. On training data it measures what the model memorised; on held-out data it measures what the model needs to generalise. It only needs <code>predict</code>, so it works for any model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Permutation importance vs drop-column importance: what is the difference?</summary><div class="qa-body">Permutation keeps the trained model and destroys one column's information; drop-column retrains without the column, so the new model can lean on substitutes. Drop-column is the honest answer to "should I keep this column?" but needs one retraining per column and is noisy. On the diary the tree was actually better without TempC, the column MDI ranked first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>XGBoost reports weight, gain and cover importance. Why do they disagree?</summary><div class="qa-body">They count different things: weight is the number of splits using the column, gain the loss reduction those splits achieved, cover the number of rows they affect. A noisy continuous column can have high weight from many tiny splits but low gain. All three are training-data, MDI-style measures, unlike permutation importance or SHAP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a partial dependence plot, and what does ICE add?</summary><div class="qa-body">PD(v) is the average prediction when a column is set to v for every row and the other columns are left as they are. ICE draws that curve for each row separately, and the PDP is their mean. ICE curves that are not parallel reveal interactions that the PDP averages away.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When can a PDP be misleading?</summary><div class="qa-body">When columns are correlated, because overwriting one creates impossible rows (age 22 with 30 years of experience) whose meaningless predictions enter the average; ALE plots avoid this. And when a column pushes some rows up and others down, the average can look flat although the column matters a lot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a Shapley value?</summary><div class="qa-body">From game theory: a player's average marginal contribution to the team's payout over all orders in which the players could join. For a model, the players are one row's feature values and the payout is the prediction; a coalition's value is the average prediction with the known features fixed and the rest filled from background rows. Formula: φⱼ = Σ_S |S|!(M−|S|−1)!/M! · [v(S∪{j}) − v(S)].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What properties make Shapley values a principled choice?</summary><div class="qa-body">Efficiency (contributions add up exactly to prediction minus base value), symmetry (features that contribute equally get equal values), dummy (a feature that never matters gets zero) and additivity (for a sum of models, values add). Shapley proved his rule is the only one with all four. SHAP also satisfies consistency: a feature whose contribution grows can never get a lower value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is TreeSHAP fast, and what is the difference between path-dependent and interventional?</summary><div class="qa-body">It uses the tree structure: one pass over each root-to-leaf path with a dynamic program instead of 2^M coalitions, and additivity to handle an ensemble tree by tree. Path-dependent handles unknown features by following both branches weighted by the training rows stored in the tree, so it needs no background data. Interventional fills unknown features from a background dataset, which costs more but has a cleaner meaning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For an XGBoost classifier, what units are SHAP values in, and why does it matter?</summary><div class="qa-body">Log-odds, the model's raw score. They add up exactly in log-odds, but their effects on probability do not add, because the sigmoid bends: +1 log-odds moves 0.50 to 0.73 but 0.95 only to 0.98. For probability units use KernelSHAP or interventional TreeSHAP on the probability output, and say which you report.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are SHAP interaction values?</summary><div class="qa-body">A matrix per row that splits each SHAP value into a main effect (the diagonal) and pair effects (off the diagonal, each pair split in half between its two members). Rows sum to the SHAP values. On the diary, almost all of temperature's blame for D6 was its interaction with humidity rather than a main effect.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features are almost perfectly correlated. What happens to each importance method?</summary><div class="qa-body">MDI and SHAP split the credit between them; permutation importance drops for both, because the model can still read the twin; drop-column importance goes to about zero for both, because a retrained model uses the twin. Measure them as a group (grouped permutation restores the true value) or keep one representative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An ID-like column appears near the top of feature importance. How do you investigate?</summary><div class="qa-body">First check which importance it is: MDI favours many-valued columns. Run permutation importance on validation data; if it drops to about zero, it was memorisation. If it stays high, suspect leakage, for example IDs assigned in time order or encoding the outcome, and check its relationship with the target and with time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>SHAP says feature X is the most important. Can you conclude that changing X will change the outcome?</summary><div class="qa-body">No. SHAP explains the model's predictions, not the world. In a simulation the top SHAP feature, visits to a cancel page, was a symptom with no causal effect: setting it to zero made the model predict far less churn but changed real churn not at all. Causal claims need experiments or causal-inference methods.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you explain an individual credit refusal to a regulator?</summary><div class="qa-body">Compute SHAP values for that applicant against a stated background (for example all applicants), present the base rate and the few largest contributions as reason codes in a waterfall, and state the units. Make sure the features used are legitimate and not proxies for protected attributes, and remember the explanation describes the model's reasoning, not a causal judgment about the applicant.</div></details>
</main>
`
});
