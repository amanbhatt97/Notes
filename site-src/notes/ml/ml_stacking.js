// notes/ml/ml_stacking.js — Stacking & Voting
Object.assign(TOPIC_CONTENT, {
  "ml_stacking": `<main>
  <h1>Stacking &amp; Voting</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Stacking &amp; Voting</span></div>
  <p class="lead">Bagging copies one algorithm in parallel; boosting chains one algorithm in sequence. The third branch of the ensemble family combines <strong>different</strong> models that are each already good: a random forest, a gradient booster, a k-nearest-neighbours model. <strong>Voting</strong> combines them with a fixed rule (hard, soft or weighted). <strong>Stacking</strong> trains a second model, the meta-learner, to learn the best combination, and must use <strong>out-of-fold</strong> predictions to do it without leaking the answers. This note works every rule by hand, shows the leak and its fix with numbers, rebuilds sklearn's <code>StackingClassifier</code> from scratch to the last decimal, compares stacking with blending and multi-level stacks, and is honest about when the gains are too small to be worth it.</p>

  <h2 id="stk-where" class="open"><span class="num">↳</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="stk-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="340" y1="40" x2="340" y2="64" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="340" y1="98" x2="110" y2="126" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="340" y1="98" x2="340" y2="126" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="340" y1="98" x2="570" y2="126" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="110" y1="160" x2="110" y2="188" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="110" y1="222" x2="55" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="110" y1="222" x2="168" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="340" y1="160" x2="270" y2="188" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="340" y1="160" x2="410" y2="188" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="410" y1="222" x2="300" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="410" y1="222" x2="410" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<line x1="410" y1="222" x2="520" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#stk-ar)"/>
<rect x="265" y="8" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="340" y="28" text-anchor="middle" font-size="12" font-weight="400">Decision Trees</text>
<rect x="265" y="66" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="340" y="86" text-anchor="middle" font-size="12" font-weight="400">Ensemble Learning</text>
<rect x="35" y="128" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="110" y="148" text-anchor="middle" font-size="12" font-weight="400">Bagging branch</text>
<rect x="265" y="128" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="340" y="148" text-anchor="middle" font-size="12" font-weight="400">Boosting branch</text>
<rect x="495" y="128" width="150" height="32" rx="7" class="fg sg" stroke-width="2.5"/>
<text x="570" y="148" text-anchor="middle" font-size="12" font-weight="700">Stacking &amp; Voting</text>
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
<text x="570" y="175" text-anchor="middle" class="tg" font-size="11" font-weight="700">▲ you are here</text>
</svg><figcaption>Stacking &amp; Voting is the third child of Ensemble Learning. Its members are usually finished models from the other two branches (a forest, a booster) plus models from outside the tree family.</figcaption></figure>
  <ul>
    <li><strong>Came from:</strong> <a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a>, which showed that a team gains most when its members are good and make <em>different</em> mistakes, and that plain averaging can be dragged down by a weak member. From the two other branches we now have strong members: <a class="xref" data-note="ml_rf">Random Forest</a> (parallel deep trees) and <a class="xref" data-note="ml_gbm">Gradient Boosting</a> / <a class="xref" data-note="ml_lightgbm">LightGBM</a> (sequential small trees). They were built in opposite ways, so they should disagree on some rows.</li>
    <li><strong>What this note adds:</strong> two ways to combine finished, different models: a fixed vote, and a learnt combiner trained on honest (out-of-fold) predictions.</li>
    <li><strong>Leads to:</strong> once you have a strong model or blend, you need to explain it (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>) and to tune and ship it (<a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>), where the extra cost of a stack must be justified. The out-of-fold idea is the same one behind cross-validation in <a class="xref" data-note="ml_evaluation">Model Evaluation</a>.</li>
  </ul>

  <h2 id="stk-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Stacking &amp; Voting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Voting</div>
        <ul>
          <li><b>Hard</b> — majority of predicted labels</li>
          <li><b>Soft</b> — average probabilities, then threshold</li>
          <li><b>Weighted</b> — trust some members more (weights chosen on validation)</li>
          <li>Hard ignores confidence: 0.9 vs 0.4 + 0.45 → hard "no", soft 0.583 "yes"</li>
          <li>⚠ A weight ≥ sum of the others = one model decides alone</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Stacking</div>
        <ul>
          <li><b>Level 0</b> — base models (diverse, strong)</li>
          <li><b>Level 1 / meta-learner</b> — learns from their predictions</li>
          <li>Usually logistic / ridge regression: learns weights + calibration</li>
          <li>💡 Head doctor who learnt whom to trust</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The leak</div>
        <ul>
          <li>In-sample predictions are too good (1-NN: 100%, RF train AUC 1.000)</li>
          <li>Meta-model learns "trust the overfitter" → worse on new data</li>
          <li><b>Fix: out-of-fold predictions</b> — each row predicted by a model that never saw it</li>
          <li>Test time: refit level 0 on all rows (sklearn) or average fold models</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants</div>
        <ul>
          <li><b>Blending</b> — one holdout split instead of k folds: simpler, wastes rows</li>
          <li><b>passthrough</b> — meta sees original features too</li>
          <li><b>Multi-level</b> — stack of stacks; rarely worth it</li>
          <li>Kaggle: many levels; production: one level or a vote</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">sklearn</div>
        <ul>
          <li><code>VotingClassifier(estimators, voting="hard"|"soft", weights)</code></li>
          <li><code>StackingClassifier(estimators, final_estimator, cv=5, stack_method, passthrough)</code></li>
          <li>Binary: one probability column per member</li>
          <li><code>VotingRegressor</code>, <code>StackingRegressor</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When it pays</div>
        <ul>
          <li>Members of similar strength, low correlation</li>
          <li>Churn: no gain (forest dominates) · Friedman regression: R² 0.875 → 0.887</li>
          <li>⚠ Alike members (rf+et, OOF corr 0.98): no gain</li>
          <li><b>Costs</b> — k+1 fits per member, every member at predict time, more to maintain</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="stk-vote"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Voting: Hard, Soft, Weighted</span><span class="rm-sub">Five customers by hand, then churn</span></div></div>
      <div class="rm-item rm-done" data-target="stk-idea"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Stacking: Learn the Combiner</span><span class="rm-sub">Level-0 models and a meta-learner</span></div></div>
      <div class="rm-item rm-done" data-target="stk-leak"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Leak in Naive Stacking</span><span class="rm-sub">Why in-sample predictions lie</span></div></div>
      <div class="rm-item rm-done" data-target="stk-oof"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Out-of-Fold Predictions</span><span class="rm-sub">By hand, diagram, from scratch = sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="stk-blend"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Blending vs Stacking</span><span class="rm-sub">One holdout vs k folds</span></div></div>
      <div class="rm-item rm-done" data-target="stk-sk"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">sklearn Stacking API</span><span class="rm-sub">Parameters, passthrough, regression</span></div></div>
      <div class="rm-item rm-done" data-target="stk-multi"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Multi-Level Stacking</span><span class="rm-sub">Stacks of stacks</span></div></div>
      <div class="rm-item rm-done" data-target="stk-gain"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">When the Gains Are Small</span><span class="rm-sub">Correlation, weak members, costs</span></div></div>
      <div class="rm-item rm-done" data-target="stk-cmp"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">Voting vs stacking vs blending vs one model</span></div></div>
      <div class="rm-item rm-done" data-target="stk-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Leaks and wasted effort</span></div></div>
      <div class="rm-item rm-done" data-target="stk-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="stk-vote"><span class="num">01</span>Voting: Hard, Soft, Weighted</h2>
  <h3>The need</h3>
  <p>You have trained three good but different churn models. Each one is right on some customers the others miss. The simplest way to use all three is to let them vote. There are three standard voting rules, and they can give different answers on the same customer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hiring panel of three interviewers. <strong>Hard voting</strong>: each says "hire" or "no hire", majority wins. <strong>Soft voting</strong>: each gives a score from 0 to 1, the average decides. <strong>Weighted voting</strong>: the senior interviewer, who has been right more often, counts double.</p>
  </div>
  <h3>Worked by hand: five customers, three models</h3>
  <p>Models A, B and C give P(churn) for five customers. A model's own label is "churn" (1) when its probability is ≥ 0.5.</p>
  <table class="tbl">
    <tr><th>Customer</th><th>P_A</th><th>P_B</th><th>P_C</th><th>Labels A, B, C</th><th>Hard vote</th><th>Soft: average P</th><th>Weighted soft (1, 1, 2)</th><th>Truth</th></tr>
    <tr><td>1</td><td>0.90</td><td>0.80</td><td>0.70</td><td>1, 1, 1</td><td>1</td><td>2.40/3 = 0.800 → 1</td><td>(0.9 + 0.8 + 1.4)/4 = 0.775 → 1</td><td>1</td></tr>
    <tr><td>2</td><td>0.60</td><td>0.55</td><td>0.10</td><td>1, 1, 0</td><td>1</td><td>1.25/3 = 0.417 → 0</td><td>(0.6 + 0.55 + 0.2)/4 = 0.337 → 0</td><td>0</td></tr>
    <tr><td>3</td><td>0.45</td><td>0.40</td><td>0.95</td><td>0, 0, 1</td><td>0</td><td>1.80/3 = 0.600 → 1</td><td>(0.45 + 0.4 + 1.9)/4 = 0.688 → 1</td><td>1</td></tr>
    <tr><td>4</td><td>0.20</td><td>0.30</td><td>0.60</td><td>0, 0, 1</td><td>0</td><td>1.10/3 = 0.367 → 0</td><td>(0.2 + 0.3 + 1.2)/4 = 0.425 → 0</td><td>0</td></tr>
    <tr><td>5</td><td>0.51</td><td>0.30</td><td>0.45</td><td>1, 0, 0</td><td>0</td><td>1.26/3 = 0.420 → 0</td><td>(0.51 + 0.3 + 0.9)/4 = 0.427 → 0</td><td>0</td></tr>
  </table>
  <p>Customers 2 and 3 are where the rules part ways. On customer 2, A and B both say "churn", but only just (0.60, 0.55), while C is confident it is "stay" (0.10). Hard voting counts two weak yeses against one strong no and says churn: wrong. Soft voting averages to 0.417 and says stay: right. Customer 3 is the mirror image. The code checks the table and scores every rule, including a <strong>weighted hard</strong> vote where C's label counts 3 times.</p>
  <div class="fx" data-lang="py">import numpy as np
P = np.array([[0.90, 0.80, 0.70],      # rows = 5 customers, columns = models A, B, C
              [0.60, 0.55, 0.10],      # P(churn) from each model
              [0.45, 0.40, 0.95],
              [0.20, 0.30, 0.60],
              [0.51, 0.30, 0.45]])
y = np.array([1, 0, 1, 0, 0])
labels = (P &gt;= 0.5).astype(int)                       # each model's own yes/no
hard = (labels.sum(1) &gt;= 2).astype(int)               # majority of 3 labels
soft_p = P.mean(1)                                    # average probability
soft = (soft_p &gt;= 0.5).astype(int)
w = np.array([1, 1, 2])                               # trust model C twice as much
wsoft_p = P @ w / w.sum()
wsoft = (wsoft_p &gt;= 0.5).astype(int)
wh = np.array([1, 1, 3])                              # weighted HARD vote: C's label counts 3 times
whard = ((labels @ wh) &gt; wh.sum() / 2).astype(int)
for i in range(5):
    print(f"cust {i+1}: labels {labels[i].tolist()} -&gt; hard {hard[i]} | avg p {soft_p[i]:.3f} -&gt; soft {soft[i]}"
          f" | weighted p {wsoft_p[i]:.3f} -&gt; {wsoft[i]} | truth {y[i]}")
for name, pred in [("model A", labels[:, 0]), ("model B", labels[:, 1]), ("model C", labels[:, 2]),
                   ("hard vote", hard), ("soft vote", soft), ("weighted soft", wsoft),
                   ("weighted hard", whard)]:
    print(f"{name:13s} right on {np.sum(pred == y)}/5")</div>
  <div class="fx" data-lang="text">cust 1: labels [1, 1, 1] -&gt; hard 1 | avg p 0.800 -&gt; soft 1 | weighted p 0.775 -&gt; 1 | truth 1
cust 2: labels [1, 1, 0] -&gt; hard 1 | avg p 0.417 -&gt; soft 0 | weighted p 0.337 -&gt; 0 | truth 0
cust 3: labels [0, 0, 1] -&gt; hard 0 | avg p 0.600 -&gt; soft 1 | weighted p 0.688 -&gt; 1 | truth 1
cust 4: labels [0, 0, 1] -&gt; hard 0 | avg p 0.367 -&gt; soft 0 | weighted p 0.425 -&gt; 0 | truth 0
cust 5: labels [1, 0, 0] -&gt; hard 0 | avg p 0.420 -&gt; soft 0 | weighted p 0.427 -&gt; 0 | truth 0
model A       right on 2/5
model B       right on 3/5
model C       right on 4/5
hard vote     right on 3/5
soft vote     right on 5/5
weighted soft right on 5/5
weighted hard right on 4/5</div>
  <p>Hard voting (3/5) is no better than model B alone. Soft and weighted soft voting get all 5 right, better than every member. The weighted hard vote with weights (1, 1, 3) gives 4/5, exactly model C's score, because C's weight 3 is more than A + B = 2: C wins every vote alone, and the "ensemble" is just model C.</p>
  <div class="callout def"><span class="label">Definitions</span>
    <p>With members h₁…h_M, weights w₁…w_M (default all 1), and classes c: <strong>hard voting</strong> ŷ = argmax_c Σ_m w_m · [h_m(x) = c]; <strong>soft voting</strong> ŷ = argmax_c Σ_m w_m · P_m(c | x) / Σ w_m. For regression, <strong>averaging</strong> ŷ = Σ w_m h_m(x) / Σ w_m.</p>
  </div>
  <h3>On the churn data</h3>
  <p>Members: a random forest, a histogram gradient booster and a 15-nearest-neighbours model (with scaling). Weights for the weighted vote are chosen by trying every combination of 0–3 on the <em>validation</em> set, then the final comparison is on the untouched test set.</p>
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
  <div class="fx" data-lang="py">from sklearn.ensemble import HistGradientBoostingClassifier, VotingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score
members = [("rf",  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
           ("hgb", HistGradientBoostingClassifier(random_state=0)),
           ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]
for name, m in members:
    m.fit(Xtr, ytr)
    print(f"{name:14s} val acc {m.score(Xva, yva):.3f}  AUC {roc_auc_score(yva, m.predict_proba(Xva)[:, 1]):.4f}")
hard = VotingClassifier(members, voting="hard").fit(Xtr, ytr)
soft = VotingClassifier(members, voting="soft").fit(Xtr, ytr)
print(f"{'hard vote':14s} val acc {hard.score(Xva, yva):.3f}  (no probabilities)")
print(f"{'soft vote':14s} val acc {soft.score(Xva, yva):.3f}  AUC {roc_auc_score(yva, soft.predict_proba(Xva)[:, 1]):.4f}")
# choose weights on the VALIDATION set (members are already fitted, so just mix their probabilities)
probs = {n: m.predict_proba(Xva)[:, 1] for n, m in members}
best = max(((a, b, c) for a in range(4) for b in range(4) for c in range(4) if a + b + c &gt; 0),
           key=lambda w: roc_auc_score(yva, (w[0]*probs["rf"] + w[1]*probs["hgb"] + w[2]*probs["knn"]) / sum(w)))
print("best weights (rf, hgb, knn) on validation:", best)
wsoft = VotingClassifier(members, voting="soft", weights=list(best)).fit(Xtr, ytr)
for name, m in [("rf alone", members[0][1]), ("hgb alone", members[1][1]), ("soft vote", soft), ("weighted soft", wsoft)]:
    print(f"TEST {name:14s} acc {m.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.4f}")</div>
  <div class="fx" data-lang="text">rf             val acc 0.879  AUC 0.9414
hgb            val acc 0.864  AUC 0.9314
knn            val acc 0.805  AUC 0.8809
hard vote      val acc 0.871  (no probabilities)
soft vote      val acc 0.866  AUC 0.9341
best weights (rf, hgb, knn) on validation: (1, 0, 0)
TEST rf alone       acc 0.877  AUC 0.9364
TEST hgb alone      acc 0.862  AUC 0.9296
TEST soft vote      acc 0.866  AUC 0.9318
TEST weighted soft  acc 0.877  AUC 0.9364</div>
  <p>This is an honest, slightly disappointing result, and a common one. The forest is clearly the strongest member (validation AUC 0.9414 vs 0.9314 and 0.8809). Hard voting (0.871) and soft voting (0.866) both land <em>below</em> the forest alone (0.879): the booster and especially kNN pull the average toward their worse answers. The weight search confirms it: the best weights on validation are (1, 0, 0), "use only the forest". On the test set the weighted vote is therefore identical to the forest (0.877, AUC 0.9364), and the plain soft vote loses (AUC 0.9318). This is the ambiguity rule from <a class="xref" data-note="ml_ensembles">Ensemble Learning</a> in action: an average is guaranteed to beat only the <em>average</em> member, not the best one. Voting pays when members are of similar strength <em>and</em> disagree; the regression stack in section 06 is such a case.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Soft voting assumes the members' probabilities are on the same scale. A model that always says 0.49 or 0.51 (an un-calibrated SVM, a heavily regularised model) and one that says 0.01 or 0.99 (a deep forest on easy rows) are not equally trustworthy per unit of probability. Calibrate members first if their probabilities are badly off (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>), or let stacking learn the scaling.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>VotingClassifier(voting="hard")</code> has no <code>predict_proba</code>, so no ROC-AUC, no threshold tuning, no calibration. Use soft voting when you need probabilities.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We chose the weights by a grid search on validation. That is a crude form of learning. Why not let a model learn the best way to combine the members, maybe even "trust kNN more when the forest is unsure"? That is stacking.</div>

  <h2 id="stk-idea"><span class="num">02</span>Stacking: Learn the Combiner</h2>
  <h3>Plain words</h3>
  <p><strong>Stacking</strong> (stacked generalisation, Wolpert 1992) builds a two-level model. Level 0: several different <strong>base models</strong>. Level 1: a <strong>meta-learner</strong> whose input columns are the base models' predictions and whose target is the true label. The meta-learner learns how much to trust each base model, and can learn a better calibrated probability than any of them.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<defs><marker id="stk-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="88" width="100" height="54" rx="7" class="fs" stroke="currentColor"/><text x="60" y="110" text-anchor="middle" font-size="12">features x</text><text x="60" y="127" text-anchor="middle" class="tm" font-size="11">14 columns</text>
<rect x="165" y="20" width="130" height="40" rx="6" class="fb sb" fill-opacity="0.3"/><text x="230" y="44" text-anchor="middle" font-size="12">random forest</text>
<rect x="165" y="95" width="130" height="40" rx="6" class="ft st" fill-opacity="0.3"/><text x="230" y="119" text-anchor="middle" font-size="12">grad. boosting</text>
<rect x="165" y="170" width="130" height="40" rx="6" class="fv" stroke="currentColor"/><text x="230" y="194" text-anchor="middle" font-size="12">k-NN</text>
<line x1="110" y1="105" x2="163" y2="42" stroke="currentColor" marker-end="url(#stk-al)"/><line x1="110" y1="115" x2="163" y2="115" stroke="currentColor" marker-end="url(#stk-al)"/><line x1="110" y1="125" x2="163" y2="188" stroke="currentColor" marker-end="url(#stk-al)"/>
<text x="230" y="12" text-anchor="middle" class="tb" font-size="11" font-weight="700">LEVEL 0</text>
<rect x="345" y="60" width="120" height="110" rx="7" class="fs" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="405" y="80" text-anchor="middle" font-size="11">new table:</text><text x="405" y="100" text-anchor="middle" class="tm" font-size="11">p_rf  p_gb  p_knn</text><text x="405" y="118" text-anchor="middle" class="tm" font-size="11">0.83  0.91  0.67</text><text x="405" y="136" text-anchor="middle" class="tm" font-size="11">0.12  0.05  0.27</text><text x="405" y="154" text-anchor="middle" class="tm" font-size="11">…</text>
<line x1="295" y1="40" x2="343" y2="85" stroke="currentColor" marker-end="url(#stk-al)"/><line x1="295" y1="115" x2="343" y2="115" stroke="currentColor" marker-end="url(#stk-al)"/><line x1="295" y1="190" x2="343" y2="145" stroke="currentColor" marker-end="url(#stk-al)"/>
<rect x="510" y="88" width="120" height="54" rx="7" class="fr sr" fill-opacity="0.3"/><text x="570" y="110" text-anchor="middle" font-size="12">meta-learner</text><text x="570" y="127" text-anchor="middle" class="tm" font-size="11">logistic regr.</text>
<text x="570" y="78" text-anchor="middle" class="tr" font-size="11" font-weight="700">LEVEL 1</text>
<line x1="465" y1="115" x2="508" y2="115" stroke="currentColor" marker-end="url(#stk-al)"/>
<text x="570" y="165" text-anchor="middle" font-size="12">final P(churn)</text>
<text x="440" y="196" class="tr" font-size="11">its rows must be OUT-OF-FOLD</text><text x="440" y="211" class="tr" font-size="11">predictions (section 04)</text>
</svg><figcaption>Stacking. Level-0 models turn each row into a few predictions; the level-1 meta-learner is trained on that small new table with the true labels as target.</figcaption></figure>
  <h3>What the meta-learner can learn that a vote cannot</h3>
  <ul>
    <li><strong>Weights</strong>: down-weight a weak or redundant member automatically (a vote needs you to pick weights by hand).</li>
    <li><strong>Scale and calibration</strong>: a logistic meta-learner maps a weighted sum of members' probabilities through a sigmoid, so it can stretch or shrink over- or under-confident members.</li>
    <li><strong>Interactions</strong> (only with a flexible meta-learner): "when the forest is unsure, trust the booster". A logistic meta-learner cannot do this; a small tree-based one can, at a higher risk of overfitting.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Stacking</strong>: train base models f₁…f_M; build a level-1 training set Z where row i is (f₁(xᵢ), …, f_M(xᵢ)) computed <em>out-of-fold</em>; train a meta-learner g on (Z, y). Prediction: ŷ(x) = g(f₁(x), …, f_M(x)), where the fᵢ used at prediction time are refitted on all training rows.</p>
  </div>
  <div class="callout intu"><span class="label">Choosing the meta-learner</span>
    <p>Keep it <strong>simple and regularised</strong>: logistic regression (classification) or ridge / non-negative linear regression (regression). Its input has only M columns, all strongly correlated (every member predicts the same target), so a flexible meta-learner easily overfits. A tree-based meta-learner is worth trying only when you have many rows and you also pass through original features.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have not said where the meta-learner's training rows come from. The obvious choice, the base models' predictions on their own training rows, is wrong in a way that silently ruins the stack.</div>

  <h2 id="stk-leak"><span class="num">03</span>The Leak in Naive Stacking</h2>
  <h3>By hand: a model that remembers</h3>
  <p>Six customers on one feature x with labels y: x = 1, 2, 4, 5, 7, 8 and y = 0, 0, 1, 0, 1, 1. The base model is 1-nearest-neighbour: predict the label of the closest training point. Ask it to predict its <em>own</em> training rows: every row's nearest neighbour is itself (distance 0), so it repeats the true label every time. Accuracy 100%. That number says nothing about new customers; it only says the model memorised.</p>
  <p>If the meta-learner is trained on such in-sample predictions, it sees a column that is <em>always</em> right and learns "copy this column". On new data that column is no longer always right, but the meta-learner trusts it completely.</p>
  <h3>On the churn data</h3>
  <p>The code builds the level-1 table two ways: from in-sample predictions (each base model predicts the rows it trained on) and from out-of-fold predictions (explained in the next section), fits a logistic meta-learner on each, and tests both on the same test set.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import roc_auc_score
members = {"rf":  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0),
           "hgb": HistGradientBoostingClassifier(random_state=0),
           "knn": make_pipeline(StandardScaler(), KNeighborsClassifier(15))}
inside, oof, test = {}, {}, {}
for n, m in members.items():
    oof[n] = cross_val_predict(m, Xtr, ytr, cv=5, method="predict_proba")[:, 1]   # out-of-fold
    m.fit(Xtr, ytr)
    inside[n] = m.predict_proba(Xtr)[:, 1]            # predictions on rows the model trained on
    test[n] = m.predict_proba(Xte)[:, 1]
    print(f"{n:4s} train AUC on own rows {roc_auc_score(ytr, inside[n]):.3f}   out-of-fold AUC {roc_auc_score(ytr, oof[n]):.3f}")
Z = lambda d: np.column_stack([d[n] for n in members])
for name, feats in [("naive (in-sample)", inside), ("out-of-fold", oof)]:
    meta = LogisticRegression().fit(Z(feats), ytr)
    p = meta.predict_proba(Z(test))[:, 1]
    print(f"meta trained on {name:17s} weights {meta.coef_.round(2).ravel().tolist()}  "
          f"TEST acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.4f}")</div>
  <div class="fx" data-lang="text">rf   train AUC on own rows 1.000   out-of-fold AUC 0.931
hgb  train AUC on own rows 0.971   out-of-fold AUC 0.926
knn  train AUC on own rows 0.914   out-of-fold AUC 0.873
meta trained on naive (in-sample) weights [15.37, 0.62, -1.07]  TEST acc 0.877  AUC 0.9367
meta trained on out-of-fold       weights [6.1, 2.31, -0.11]  TEST acc 0.877  AUC 0.9370</div>
  <p>First the base models. On their own training rows the forest scores AUC 1.000 (it memorised them) and the booster 0.971; out of fold they score 0.931 and 0.926. The in-sample column therefore claims the forest is perfect, and the naive meta-learner believes it: weight 15.37 on the forest, almost nothing on the others. Here the damage is hidden because the forest happens to be the best member anyway, so "trust only the forest" is not a bad rule (test AUC 0.9367 vs the forest alone 0.9364). The out-of-fold meta-learner spreads its trust (6.1 forest, 2.31 booster, about 0 for kNN) and is slightly better (0.9370). Now the same experiment where the most overfit member is <em>not</em> the best: a booster plus 1-nearest-neighbour.</p>
  <div class="fx" data-lang="py"># same experiment, but now the most overfit member (1-NN) is NOT the best one
members = {"hgb": HistGradientBoostingClassifier(random_state=0),
           "1nn": make_pipeline(StandardScaler(), KNeighborsClassifier(1))}
inside, oof, test = {}, {}, {}
for n, m in members.items():
    oof[n] = cross_val_predict(m, Xtr, ytr, cv=5, method="predict_proba")[:, 1]
    inside[n] = m.fit(Xtr, ytr).predict_proba(Xtr)[:, 1]
    test[n] = m.predict_proba(Xte)[:, 1]
    print(f"{n:4s} train AUC on own rows {roc_auc_score(ytr, inside[n]):.3f}   out-of-fold AUC {roc_auc_score(ytr, oof[n]):.3f}"
          f"   TEST AUC {roc_auc_score(yte, test[n]):.4f}")
for name, feats in [("naive (in-sample)", inside), ("out-of-fold", oof)]:
    meta = LogisticRegression().fit(Z(feats), ytr)
    p = meta.predict_proba(Z(test))[:, 1]
    print(f"meta trained on {name:17s} weights {meta.coef_.round(2).ravel().tolist()}  "
          f"TEST acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.4f}")</div>
  <div class="fx" data-lang="text">hgb  train AUC on own rows 0.971   out-of-fold AUC 0.926   TEST AUC 0.9296
1nn  train AUC on own rows 1.000   out-of-fold AUC 0.725   TEST AUC 0.7388
meta trained on naive (in-sample) weights [2.97, 11.15]  TEST acc 0.739  AUC 0.8920
meta trained on out-of-fold       weights [6.63, 0.29]  TEST acc 0.863  AUC 0.9298</div>
  <p>Now the leak is a disaster. 1-NN is perfect on its own rows (AUC 1.000) and poor on anything new (0.725 out of fold, 0.739 on test). The naive meta-learner puts weight 11.15 on 1-NN and only 2.97 on the booster, and the stack's test accuracy collapses to 0.739, worse than the booster alone by 12 points. The out-of-fold meta-learner sees the truth (1-NN is weak), gives it weight 0.29, and matches the booster (0.863, AUC 0.9298).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The leak is silent: no error, and the stack still looks reasonable. The only sign is that the meta-learner's weight on the most overfit member (here the deep forest) is huge and the stack fails to beat its best member. Always build the level-1 table from out-of-fold predictions.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We need, for every training row, a prediction from a model that has not seen that row, while still using all rows for training. Cross-validation already solves exactly this problem.</div>

  <h2 id="stk-oof"><span class="num">04</span>Out-of-Fold Predictions</h2>
  <h3>The idea</h3>
  <p>Split the training rows into k folds. For each fold, train a copy of the base model on the other k − 1 folds and predict the held-out fold. After k rounds, every row has exactly one prediction, made by a model that never saw it: the <strong>out-of-fold (OOF)</strong> predictions. Their quality matches what the model will show on new data.</p>
  <figure class="viz"><svg viewBox="0 0 650 200" width="650">
<text x="10" y="20" font-size="12" font-weight="700">5-fold out-of-fold predictions for one base model</text>
<g font-size="11">
<text x="10" y="50">round 1</text><rect x="80" y="38" width="90" height="18" class="fr sr" fill-opacity="0.45"/><rect x="170" y="38" width="360" height="18" class="fb sb" fill-opacity="0.2"/>
<text x="10" y="76">round 2</text><rect x="80" y="64" width="90" height="18" class="fb sb" fill-opacity="0.2"/><rect x="170" y="64" width="90" height="18" class="fr sr" fill-opacity="0.45"/><rect x="260" y="64" width="270" height="18" class="fb sb" fill-opacity="0.2"/>
<text x="10" y="102">round 3</text><rect x="80" y="90" width="180" height="18" class="fb sb" fill-opacity="0.2"/><rect x="260" y="90" width="90" height="18" class="fr sr" fill-opacity="0.45"/><rect x="350" y="90" width="180" height="18" class="fb sb" fill-opacity="0.2"/>
<text x="10" y="128">round 4</text><rect x="80" y="116" width="270" height="18" class="fb sb" fill-opacity="0.2"/><rect x="350" y="116" width="90" height="18" class="fr sr" fill-opacity="0.45"/><rect x="440" y="116" width="90" height="18" class="fb sb" fill-opacity="0.2"/>
<text x="10" y="154">round 5</text><rect x="80" y="142" width="360" height="18" class="fb sb" fill-opacity="0.2"/><rect x="440" y="142" width="90" height="18" class="fr sr" fill-opacity="0.45"/>
<text x="10" y="184">OOF column</text><rect x="80" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/><rect x="170" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/><rect x="260" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/><rect x="350" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/><rect x="440" y="172" width="90" height="18" class="fg sg" fill-opacity="0.4"/>
<text x="125" y="185" text-anchor="middle">from r1</text><text x="215" y="185" text-anchor="middle">from r2</text><text x="305" y="185" text-anchor="middle">from r3</text><text x="395" y="185" text-anchor="middle">from r4</text><text x="485" y="185" text-anchor="middle">from r5</text>
<text x="542" y="50" class="tb">blue: train</text><text x="542" y="66" class="tr">red: predict</text>
</g></svg><figcaption>Each round trains on four folds (blue) and predicts the fifth (red). Stitching the five red pieces together gives one honest prediction per training row (green). Repeat for every base model to get the level-1 table.</figcaption></figure>
  <h3>By hand: the six customers, 3 folds</h3>
  <p>Folds (by row): {x = 1, 5}, {x = 2, 7}, {x = 4, 8}. For each fold, 1-NN is trained on the other four points.</p>
  <table class="tbl">
    <tr><th>Fold held out</th><th>Train on x (y)</th><th>Predict</th><th>Nearest neighbour</th><th>OOF prediction</th><th>Truth</th></tr>
    <tr><td>1</td><td>2(0), 4(1), 7(1), 8(1)</td><td>x = 1</td><td>2 (dist 1)</td><td>0</td><td>0 ✓</td></tr>
    <tr><td>1</td><td></td><td>x = 5</td><td>4 (dist 1) beats 7 (dist 2)</td><td>1</td><td>0 ✗</td></tr>
    <tr><td>2</td><td>1(0), 4(1), 5(0), 8(1)</td><td>x = 2</td><td>1 (dist 1)</td><td>0</td><td>0 ✓</td></tr>
    <tr><td>2</td><td></td><td>x = 7</td><td>8 (dist 1)</td><td>1</td><td>1 ✓</td></tr>
    <tr><td>3</td><td>1(0), 2(0), 5(0), 7(1)</td><td>x = 4</td><td>5 (dist 1)</td><td>0</td><td>1 ✗</td></tr>
    <tr><td>3</td><td></td><td>x = 8</td><td>7 (dist 1)</td><td>1</td><td>1 ✓</td></tr>
  </table>
  <p>OOF accuracy 4/6 = 0.667, versus the in-sample 100%. The OOF column tells the meta-learner the truth: "this model is right about two-thirds of the time". The code reproduces both numbers.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.neighbors import KNeighborsClassifier
x = np.array([[1], [2], [4], [5], [7], [8]])
y = np.array([0, 0, 1, 0, 1, 1])
folds = [[0, 3], [1, 4], [2, 5]]                      # 3 folds of 2 rows each
inside = KNeighborsClassifier(1).fit(x, y).predict(x)  # 1-NN predicting its own training rows
print("in-sample 1-NN preds:", inside.tolist(), " accuracy", np.mean(inside == y))
oof = np.empty(6, dtype=int)
for k, hold in enumerate(folds):
    train = [i for i in range(6) if i not in hold]
    m = KNeighborsClassifier(1).fit(x[train], y[train])
    oof[hold] = m.predict(x[hold])
    print(f"fold {k+1}: train on x={x[train].ravel().tolist()} -&gt; predict x={x[hold].ravel().tolist()}: {oof[hold].tolist()}")
print("out-of-fold preds:   ", oof.tolist(), " accuracy", round(np.mean(oof == y), 3))</div>
  <div class="fx" data-lang="text">in-sample 1-NN preds: [0, 0, 1, 0, 1, 1]  accuracy 1.0
fold 1: train on x=[2, 4, 7, 8] -&gt; predict x=[1, 5]: [0, 1]
fold 2: train on x=[1, 4, 5, 8] -&gt; predict x=[2, 7]: [0, 1]
fold 3: train on x=[1, 2, 5, 7] -&gt; predict x=[4, 8]: [0, 1]
out-of-fold preds:    [0, 0, 0, 1, 1, 1]  accuracy 0.667</div>
  <h3>What happens at prediction time</h3>
  <p>The meta-learner was trained on OOF predictions, each made by a model trained on (k − 1)/k of the rows. For new rows there are two common options:</p>
  <ul>
    <li><strong>Refit</strong> each base model once on <em>all</em> training rows and feed its predictions to the meta-learner. sklearn's <code>StackingClassifier</code> does this. Slight mismatch (the refitted model is a bit stronger than the fold models) but simple and usually fine.</li>
    <li><strong>Average the k fold models'</strong> predictions on the new row. Common in Kaggle code; no extra fit, and the inputs match the training distribution more closely.</li>
  </ul>
  <h3>From scratch, matching sklearn exactly</h3>
  <p>sklearn's <code>StackingClassifier(cv=5)</code> uses <code>StratifiedKFold(5)</code> (no shuffling) for classification, takes <code>predict_proba</code> from each member and, for a binary problem, keeps only the class-1 column. The from-scratch version below does the same steps, so it should produce identical numbers.</p>
  <div class="fx" data-lang="py">from sklearn.base import clone
from sklearn.ensemble import HistGradientBoostingClassifier, StackingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import StratifiedKFold
members = [("rf",  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
           ("hgb", HistGradientBoostingClassifier(random_state=0)),
           ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]

def my_stack_fit(members, meta, X, y, k=5):
    X, y = np.asarray(X), np.asarray(y)
    Z = np.zeros((len(X), len(members)))                  # level-1 training table
    for train, hold in StratifiedKFold(k).split(X, y):    # same folds sklearn uses for cv=5
        for j, (_, m) in enumerate(members):
            Z[hold, j] = clone(m).fit(X[train], y[train]).predict_proba(X[hold])[:, 1]
    fitted = [clone(m).fit(X, y) for _, m in members]     # level-0 refit on ALL rows for test time
    return fitted, clone(meta).fit(Z, y)

def my_stack_proba(fitted, meta, X):
    Z = np.column_stack([m.predict_proba(np.asarray(X))[:, 1] for m in fitted])
    return meta.predict_proba(Z)[:, 1]

fitted, meta = my_stack_fit(members, LogisticRegression(), Xtr, ytr)
mine = my_stack_proba(fitted, meta, Xte)
sk = StackingClassifier(members, final_estimator=LogisticRegression(), cv=5).fit(Xtr.values, ytr)
theirs = sk.predict_proba(Xte.values)[:, 1]
print("my meta weights:     ", meta.coef_.round(3).ravel().tolist(), "intercept", meta.intercept_.round(3).tolist())
print("sklearn meta weights:", sk.final_estimator_.coef_.round(3).ravel().tolist(), "intercept", sk.final_estimator_.intercept_.round(3).tolist())
print(f"largest difference in test probabilities: {np.abs(mine - theirs).max():.2e}")
print(f"test acc  mine {np.mean((mine &gt; 0.5) == yte):.3f}   sklearn {sk.score(Xte.values, yte):.3f}")</div>
  <div class="fx" data-lang="text">my meta weights:      [6.099, 2.305, -0.105] intercept [-4.182]
sklearn meta weights: [6.099, 2.305, -0.105] intercept [-4.182]
largest difference in test probabilities: 0.00e+00
test acc  mine 0.877   sklearn 0.877</div>
  <p>Identical to the last printed digit: the same meta weights (6.099 forest, 2.305 booster, −0.105 kNN, intercept −4.182) and a largest difference of exactly 0 in the test probabilities. So <code>StackingClassifier</code> is nothing more than these 20 lines: stratified 5-fold OOF probabilities for each member, a logistic regression on them, and members refitted on all rows for prediction. Notice the meta-learner gives kNN a slightly <em>negative</em> weight: once the forest and booster are known, kNN adds nothing, and the meta-learner learnt that by itself, which plain soft voting could not.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Out-of-fold prediction</strong> for row i: the prediction of the model trained on all folds except the one containing i. The OOF matrix (rows × base models) is the meta-learner's training input. sklearn: <code>cross_val_predict(model, X, y, cv=5, method="predict_proba")</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fitting a scaler, encoder or feature selector on all rows before computing OOF predictions leaks again. Put preprocessing inside each base model's <code>Pipeline</code>, as done for kNN above, so it is refitted within every fold. For time series, folds must respect time order (train on the past, predict the future).</p>
  </div>

  <h2 id="stk-blend"><span class="num">05</span>Blending vs Stacking</h2>
  <p><strong>Blending</strong> (from the Netflix Prize) is the quick version: split the training rows once into a base part (e.g. 75%) and a holdout part (25%). Train base models on the base part, predict the holdout, and train the meta-learner on those holdout predictions only.</p>
  <div class="fx" data-lang="py">from sklearn.base import clone
from sklearn.ensemble import HistGradientBoostingClassifier, StackingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
members = [("rf",  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
           ("hgb", HistGradientBoostingClassifier(random_state=0)),
           ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]
# BLENDING: members learn on 75% of train, the meta-model learns on their predictions for the other 25%
t0 = time.time()
Xa, Xh, ya, yh = train_test_split(Xtr, ytr, test_size=0.25, stratify=ytr, random_state=0)
fitted = [clone(m).fit(Xa, ya) for _, m in members]
H = np.column_stack([m.predict_proba(Xh)[:, 1] for m in fitted])     # holdout predictions
meta = LogisticRegression().fit(H, yh)
p_blend = meta.predict_proba(np.column_stack([m.predict_proba(Xte)[:, 1] for m in fitted]))[:, 1]
t_blend = time.time() - t0
# STACKING: every training row gets an out-of-fold prediction (5 folds)
t0 = time.time()
st = StackingClassifier(members, final_estimator=LogisticRegression(), cv=5).fit(Xtr, ytr)
p_stack = st.predict_proba(Xte)[:, 1]
t_stack = time.time() - t0
for name, p, sec, w in [("blending", p_blend, t_blend, meta.coef_), ("stacking", p_stack, t_stack, st.final_estimator_.coef_)]:
    print(f"{name:9s} meta rows {len(yh) if name == 'blending' else len(ytr):5d}  weights {w.round(2).ravel().tolist()}"
          f"  TEST acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.4f}  fit {sec:.0f}s")</div>
  <div class="fx" data-lang="text">blending  meta rows  3000  weights [5.47, 2.59, 0.45]  TEST acc 0.869  AUC 0.9344  fit 10s
stacking  meta rows 12000  weights [6.1, 2.31, -0.11]  TEST acc 0.877  AUC 0.9370  fit 54s</div>
  <p>Blending trained the meta-learner on only 3,000 holdout rows, and its members on only 9,000 rows, so each member is a little weaker: test accuracy 0.869 and AUC 0.9344, versus 0.877 and 0.9370 for stacking, which used all 12,000 rows for both jobs. In exchange blending fitted each member once instead of six times (10 s vs 54 s here). The learnt weights tell the same story either way (forest ≫ booster &gt; kNN). With millions of rows the difference in data use vanishes and blending's speed and simplicity often win.</p>
  <table class="tbl">
    <tr><th></th><th>Blending</th><th>Stacking (k-fold OOF)</th></tr>
    <tr><td>Meta-learner trains on</td><td>Holdout rows only (25%)</td><td>All training rows (OOF)</td></tr>
    <tr><td>Base models train on</td><td>75% of rows</td><td>k fits on (k−1)/k each + one refit on 100%</td></tr>
    <tr><td>Fits per base model</td><td>1</td><td>k + 1</td></tr>
    <tr><td>Leak risk</td><td>Low, easy to reason about</td><td>Low if folds and pipelines are correct</td></tr>
    <tr><td>Best when</td><td>Lots of data, quick experiments, many members</td><td>Moderate data, every row counts</td></tr>
  </table>

  <h2 id="stk-sk"><span class="num">06</span>sklearn's StackingClassifier &amp; StackingRegressor</h2>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>What it does</th></tr>
    <tr><td><code>estimators</code></td><td>required</td><td>List of (name, model) base models</td></tr>
    <tr><td><code>final_estimator</code></td><td>LogisticRegression / RidgeCV</td><td>The meta-learner</td></tr>
    <tr><td><code>cv</code></td><td>5-fold</td><td>How OOF predictions are made: an int (stratified k-fold for classifiers), a splitter (e.g. TimeSeriesSplit), or <code>"prefit"</code> for already-fitted members</td></tr>
    <tr><td><code>stack_method</code></td><td>"auto"</td><td>Which output feeds the meta-learner: predict_proba, then decision_function, then predict, whichever exists first. Binary: only the positive-class column is kept</td></tr>
    <tr><td><code>passthrough</code></td><td>False</td><td>True = meta-learner also sees the original features</td></tr>
    <tr><td><code>n_jobs</code></td><td>None</td><td>Fit base models in parallel</td></tr>
  </table>
  <div class="fx" data-lang="py">from sklearn.ensemble import RandomForestRegressor
from sklearn.ensemble import HistGradientBoostingClassifier, StackingClassifier, StackingRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.linear_model import LogisticRegression, RidgeCV, Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_friedman1
from sklearn.metrics import roc_auc_score
members = [("rf",  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
           ("hgb", HistGradientBoostingClassifier(random_state=0)),
           ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]
st = StackingClassifier(members, final_estimator=LogisticRegression(), cv=5, n_jobs=-1).fit(Xtr, ytr)
print("stack_method_:", st.stack_method_)
print("meta-model input for 2 test rows:\\n", st.transform(Xte.iloc[:2]).round(3))
pt = StackingClassifier(members, final_estimator=LogisticRegression(max_iter=1000), cv=5,
                        passthrough=True, n_jobs=-1).fit(Xtr, ytr)
print("passthrough meta input width:", pt.transform(Xte.iloc[:2]).shape[1])
for name, m in [("stack (preds only)", st), ("stack + passthrough", pt)]:
    print(f"{name:20s} TEST acc {m.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.4f}")
# regression: StackingRegressor with a ridge meta-model
Xr, yr = make_friedman1(n_samples=3000, noise=1.0, random_state=0)
Xa, Xb, ya, yb = Xr[:2000], Xr[2000:], yr[:2000], yr[2000:]
base = [("ridge", Ridge()), ("rf", RandomForestRegressor(n_estimators=300, n_jobs=-1, random_state=0)),
        ("knn", make_pipeline(StandardScaler(), KNeighborsRegressor(10)))]
for n, m in base:
    print(f"{n:6s} test R^2 {m.fit(Xa, ya).score(Xb, yb):.3f}")
sr = StackingRegressor(base, final_estimator=RidgeCV(), cv=5).fit(Xa, ya)
print(f"stack  test R^2 {sr.score(Xb, yb):.3f}  meta weights {sr.final_estimator_.coef_.round(2).tolist()}")</div>
  <div class="fx" data-lang="text">stack_method_: ['predict_proba', 'predict_proba', 'predict_proba']
meta-model input for 2 test rows:
 [[0.093 0.097 0.2  ]
 [0.693 0.629 0.533]]
passthrough meta input width: 17
stack (preds only)   TEST acc 0.877  AUC 0.9370
stack + passthrough  TEST acc 0.878  AUC 0.9379
ridge  test R^2 0.732
rf     test R^2 0.875
knn    test R^2 0.766
stack  test R^2 0.887  meta weights [-0.09, 0.89, 0.39]</div>
  <p>Line by line. <code>stack_method_</code> shows that "auto" picked <code>predict_proba</code> for all three members. <code>transform</code> exposes the meta-learner's input: for a binary problem one column per member (P(churn) from forest, booster, kNN), e.g. 0.093 / 0.097 / 0.200 for a customer who stays and 0.693 / 0.629 / 0.533 for a likely leaver. With <code>passthrough=True</code> the width becomes 3 + 14 = 17 columns, and here the logistic meta-learner gains a hair (AUC 0.9370 → 0.9379), within noise. The regression stack on Friedman #1 is the clearer win: ridge (R² 0.732), forest (0.875) and kNN (0.766) are of different kinds, and the stack reaches 0.887, above its best member. Its meta weights (−0.09 ridge, 0.89 forest, 0.39 kNN) say "mostly the forest, corrected by kNN".</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>cv="prefit"</code> tells sklearn the members are already trained and it should just use their predictions on the data you pass to <code>fit</code>. If that data is the same data the members were trained on, you have rebuilt the naive leak of section 03. Use it only with a separate holdout (which makes it blending).</p>
  </div>

  <h2 id="stk-multi"><span class="num">07</span>Multi-Level Stacking</h2>
  <p>The meta-learner can itself be a stack: level-0 models feed several level-1 models, whose OOF predictions feed a final level-2 model. Kaggle winners have used three or more levels with dozens of models. In sklearn you nest a <code>StackingClassifier</code> as the <code>final_estimator</code>.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import (HistGradientBoostingClassifier, ExtraTreesClassifier, StackingClassifier)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score
level0 = [("rf",  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
          ("hgb", HistGradientBoostingClassifier(random_state=0)),
          ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(15)))]
level1 = StackingClassifier([("lr", LogisticRegression()),
                             ("et", ExtraTreesClassifier(n_estimators=200, min_samples_leaf=20, n_jobs=-1, random_state=0))],
                            final_estimator=LogisticRegression(), cv=5)
models = {"one level  (-&gt; LR)":           StackingClassifier(level0, final_estimator=LogisticRegression(), cv=5),
          "two levels (-&gt; LR+ET -&gt; LR)":  StackingClassifier(level0, final_estimator=level1, cv=5)}
for name, m in models.items():
    t0 = time.time(); m.fit(Xtr, ytr); sec = time.time() - t0
    print(f"{name:28s} TEST acc {m.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.4f}  fit {sec:.0f}s")</div>
  <div class="fx" data-lang="text">one level  (-&gt; LR)           TEST acc 0.877  AUC 0.9370  fit 44s
two levels (-&gt; LR+ET -&gt; LR)  TEST acc 0.876  AUC 0.9368  fit 45s</div>
  <p>A second level (a logistic regression and an Extra Trees model on the level-1 inputs, then a final logistic regression) gives AUC 0.9368 vs 0.9370 for one level: nothing gained, and one more pipeline to maintain. The fit time barely changed (44 s vs 45 s) because the extra level trains only on 3 meta-columns; the real cost is one more pipeline to build, test and maintain.</p>
  <div class="callout intu"><span class="label">Why extra levels rarely pay</span>
    <p>Each level sees fewer, more correlated columns (all predicting the same target), and needs its own round of OOF predictions (k + 1 fits for every model at every level), so training time and the risk of leaking between levels both grow. The information has mostly been squeezed out at level 1; deeper levels mostly fit noise. In competitions, 0.0005 AUC can decide the ranking; in production it rarely justifies the cost.</p>
  </div>

  <h2 id="stk-gain"><span class="num">08</span>When the Gains Are Small</h2>
  <p>A blend helps only where members disagree. The first table shows how alike five candidate members are (correlation of their OOF churn probabilities). Then three teams are compared: two very alike members, three diverse strong members, and the same three plus a weak one.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import (HistGradientBoostingClassifier, ExtraTreesClassifier,
                              VotingClassifier, StackingClassifier)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import roc_auc_score
cands = {"rf":  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0),
         "et":  ExtraTreesClassifier(n_estimators=300, n_jobs=-1, random_state=0),
         "hgb": HistGradientBoostingClassifier(random_state=0),
         "knn": make_pipeline(StandardScaler(), KNeighborsClassifier(15)),
         "lr":  make_pipeline(StandardScaler(), LogisticRegression())}
oof = {n: cross_val_predict(m, Xtr, ytr, cv=5, method="predict_proba")[:, 1] for n, m in cands.items()}
names = list(cands)
C = np.corrcoef([oof[n] for n in names])
print("correlation of out-of-fold P(churn):")
print("      " + "  ".join(f"{n:&gt;4s}" for n in names))
for i, n in enumerate(names):
    print(f"{n:&gt;4s}  " + "  ".join(f"{C[i, j]:4.2f}" for j in range(len(names))))
teams = {"rf+et (alike)":         ["rf", "et"],
         "rf+hgb+knn (diverse)":  ["rf", "hgb", "knn"],
         "rf+hgb+knn+lr (+weak)": ["rf", "hgb", "knn", "lr"]}
for tname, team in teams.items():
    est = [(n, cands[n]) for n in team]
    best = max(cands[n].fit(Xtr, ytr).score(Xte, yte) for n in team)
    sv = VotingClassifier(est, voting="soft").fit(Xtr, ytr)
    st = StackingClassifier(est, final_estimator=LogisticRegression(), cv=5).fit(Xtr, ytr)
    print(f"{tname:22s} best member {best:.3f}  soft vote {sv.score(Xte, yte):.3f}  stacking {st.score(Xte, yte):.3f}"
          f"  meta weights {st.final_estimator_.coef_.round(1).ravel().tolist()}")</div>
  <div class="fx" data-lang="text">correlation of out-of-fold P(churn):
        rf    et   hgb   knn    lr
  rf  1.00  0.98  0.96  0.86  0.37
  et  0.98  1.00  0.95  0.90  0.39
 hgb  0.96  0.95  1.00  0.84  0.34
 knn  0.86  0.90  0.84  1.00  0.37
  lr  0.37  0.39  0.34  0.37  1.00
rf+et (alike)          best member 0.877  soft vote 0.877  stacking 0.877  meta weights [5.1, 4.6]
rf+hgb+knn (diverse)   best member 0.877  soft vote 0.866  stacking 0.877  meta weights [6.1, 2.3, -0.1]
rf+hgb+knn+lr (+weak)  best member 0.877  soft vote 0.861  stacking 0.878  meta weights [6.2, 2.3, 0.1, -1.7]</div>
  <p>The correlation table explains everything that follows. Forest, extra trees and booster have OOF correlations of 0.95–0.98: they are nearly the same opinion. kNN is a bit different (0.84–0.90), and logistic regression is very different (0.34–0.39) but also very weak (0.596). There is no member that is both strong and different.</p>
  <ul>
    <li><strong>rf + et (alike)</strong>: soft vote and stack both give 0.877 = the forest. Correlation 0.98 leaves nothing to cancel; the meta weights (5.1, 4.6) just split the trust.</li>
    <li><strong>rf + hgb + knn</strong>: the soft vote drops to 0.866 (dragged down by the weaker booster and kNN); the stack holds 0.877 by learning weights 6.1 / 2.3 / −0.1.</li>
    <li><strong>+ a weak logistic regression</strong>: the soft vote drops further to 0.861; the stack is unharmed (0.878) and even gives LR a negative weight (−1.7), using it as a small correction.</li>
  </ul>
  <p>Two lessons. Stacking is <strong>robust</strong>: unlike plain averaging, it does not get worse when you add weak or redundant members. But it only <strong>gains</strong> when some member is both good and different; here none is, so every blend ties with the forest. On data where the members are closer in strength and less correlated (the Friedman regression in section 06: best member R² 0.875, stack 0.887) the gain is real.</p>
  <table class="tbl">
    <tr><th>Gains are small or zero when…</th><th>Because</th></tr>
    <tr><td>Members are alike (forest + extra trees, two boosters)</td><td>Correlated errors: nothing left to cancel</td></tr>
    <tr><td>One member dominates</td><td>The best blend is "mostly that member"; voting may even hurt</td></tr>
    <tr><td>Data is small</td><td>OOF predictions are noisy; the meta-learner overfits</td></tr>
    <tr><td>The error is shared bias / label noise</td><td>No combination of members can recover information none of them has</td></tr>
  </table>
  <h3>Costs</h3>
  <ul>
    <li><strong>Training</strong>: (k + 1) fits per base model plus the meta-learner; nested stacks multiply that.</li>
    <li><strong>Prediction</strong>: every base model runs on every request; latency is the sum (or the max, if run in parallel) plus the meta-learner.</li>
    <li><strong>Maintenance</strong>: several pipelines to retrain, version and monitor; a change in one member changes the meta-learner's inputs, so it must be retrained too.</li>
    <li><strong>Explanation</strong>: SHAP and importance must go through two levels (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deciding the stack "won" from a +0.002 test difference on 5,000 rows. That is about the size of the noise from one random split. Confirm with repeated CV or a paired comparison on several splits before paying the production cost.</p>
  </div>

  <h2 id="stk-cmp"><span class="num">09</span>Comparisons</h2>
  <table class="tbl">
    <tr><th></th><th>Best single model</th><th>Hard voting</th><th>Soft / weighted voting</th><th>Stacking</th><th>Blending</th></tr>
    <tr><td>Combiner</td><td>—</td><td>Majority of labels</td><td>(Weighted) mean of probabilities</td><td>Meta-model on OOF predictions</td><td>Meta-model on holdout predictions</td></tr>
    <tr><td>Learns weights?</td><td>—</td><td>No</td><td>Only by your search</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>Probabilities?</td><td>Yes</td><td>No</td><td>Yes</td><td>Yes (calibrated by meta)</td><td>Yes</td></tr>
    <tr><td>Fits per member</td><td>1</td><td>1</td><td>1</td><td>k + 1</td><td>1</td></tr>
    <tr><td>Leak risk</td><td>—</td><td>None</td><td>Weights tuned on test</td><td>Non-OOF predictions</td><td>Low</td></tr>
    <tr><td>Robust to a weak member</td><td>—</td><td>Partly</td><td>No (unless weighted)</td><td>Yes</td><td>Yes</td></tr>
  </table>
  <p>Relation to the other branches: <a class="xref" data-note="ml_bagging">Bagging</a> is soft voting over bootstrap copies of one algorithm with equal weights; <a class="xref" data-note="ml_boosting">boosting</a> learns its member weights, but sequentially and on the training rows; stacking learns the weights of finished, different models on out-of-fold rows.</p>

  <h2 id="stk-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: training the meta-learner on in-sample predictions</span>
    <p>The leak of section 03. Use OOF predictions (<code>StackingClassifier</code> or <code>cross_val_predict</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: preprocessing outside the folds</span>
    <p>Scalers, encoders and feature selection fitted on all rows leak into every fold. Wrap them in each member's Pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tuning weights or the meta-learner on the test set</span>
    <p>Then the test score is no longer an honest estimate. Tune on validation / CV; touch test once.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a flexible meta-learner on a few columns</span>
    <p>A deep tree or booster as meta-learner on 3 highly correlated inputs overfits. Start with logistic or ridge regression.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: stacking near-duplicates</span>
    <p>Five boosters with slightly different seeds are one booster. Look at the OOF correlation table first; add members that disagree.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: hard voting when you need probabilities</span>
    <p>No predict_proba, no AUC, no threshold tuning. Use soft voting or stacking.</p>
  </div>

  <h2 id="stk-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Hard vs soft voting: define both and give a case where they disagree.</summary><div class="qa-body">Hard: majority of predicted labels. Soft: average of predicted probabilities, then threshold / argmax. P = 0.60, 0.55, 0.10: hard says churn (2 of 3), soft averages 0.417 and says stay. Soft uses confidence, so it is usually better when probabilities are reasonable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>With weights (1, 1, 3) in a three-model hard vote, what happens?</summary><div class="qa-body">The third model's weight (3) exceeds the other two combined (2), so it wins every vote alone; the ensemble equals that model. Weights must be chosen so no member can dictate, unless that is the intention.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stacking? Name its levels.</summary><div class="qa-body">A two-level ensemble: level-0 base models (diverse, strong) produce predictions; a level-1 meta-learner is trained on those predictions (out-of-fold) with the true labels as target, learning how to combine them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't the meta-learner be trained on the base models' predictions on their own training rows?</summary><div class="qa-body">Those predictions are overfit (1-NN in-sample accuracy 100%; a deep forest's train AUC ≈ 1.000), so the meta-learner learns to trust the most overfit member. On new data that member is much less accurate and the stack underperforms. Out-of-fold predictions have the same quality as predictions on new data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain out-of-fold predictions step by step.</summary><div class="qa-body">Split the training rows into k folds. For each fold, fit the model on the other k − 1 folds and predict that fold. Every row gets exactly one prediction from a model that never saw it. Repeat for each base model to build the meta-learner's training table.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>At prediction time, which base models produce the meta-learner's inputs?</summary><div class="qa-body">Either base models refitted on all training rows (sklearn's StackingClassifier) or the average of the k fold models' predictions. Both are fine; refitting is simpler, averaging matches the training inputs a bit more closely.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Blending vs stacking?</summary><div class="qa-body">Blending trains base models on one part of the data and the meta-learner on a single holdout part; simple, one fit per model, but the meta-learner sees fewer rows and the base models are trained on less data. Stacking uses k-fold OOF predictions so every row trains the meta-learner, at the cost of k + 1 fits per model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which meta-learner would you choose and why?</summary><div class="qa-body">A simple, regularised linear model: logistic regression for classification, ridge or non-negative least squares for regression. The meta inputs are few and highly correlated; a flexible model overfits them. Its coefficients are also readable as member weights.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does passthrough=True do, and when is it useful?</summary><div class="qa-body">The meta-learner gets the original features in addition to the members' predictions, so it can learn "trust model A in this region of the feature space". Useful with a flexible meta-learner and plenty of data; with a linear meta-learner it often changes little.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For a binary problem, how many meta-features does StackingClassifier create per base model?</summary><div class="qa-body">One: with stack_method "auto" it uses predict_proba and drops the first column (it is 1 minus the second). For K classes it keeps all K columns per model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does stacking give little or no gain?</summary><div class="qa-body">Highly correlated members (forest + extra trees), one dominant member, small datasets (noisy OOF, overfit meta-learner), or errors due to shared bias / label noise. On tabular data the gain over the best member is often only a few thousandths of AUC, and on our churn data it was zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is stacking related to cross-validation?</summary><div class="qa-body">OOF predictions are exactly the predictions cross-validation makes on each held-out fold; stacking reuses them as features. The same rules apply: no preprocessing fitted outside the folds, stratified folds for classification, time-ordered folds for time series (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a random forest + gradient boosting blend usually beat two random forests?</summary><div class="qa-body">From <a class="xref" data-note="ml_ensembles">Ensemble Learning</a>: the gain depends on the error correlation ρ. Two forests are built the same way and make nearly the same mistakes (ρ near 1); a forest (parallel deep trees, variance reduction) and a booster (sequential shallow trees, bias reduction) err on different rows, so blending them removes more error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your stack beats the best single model by 0.002 AUC on the test set. Ship it?</summary><div class="qa-body">Not on that alone. Check that the difference is beyond split noise (repeated CV / several seeds), then weigh it against k + 1× training, the summed latency, a larger artefact and more pipelines to maintain. Often the single booster wins on total value.</div></details>
</main>
`
});
