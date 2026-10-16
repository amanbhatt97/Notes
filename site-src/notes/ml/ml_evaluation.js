// ml/ml_evaluation.js — Model Evaluation
Object.assign(TOPIC_CONTENT, {
  "ml_evaluation": `<main>
  <h1>Model Evaluation</h1>
  <p class="lead">How to tell whether a model is actually good: the confusion matrix and the metrics built on it, ROC vs PR curves on imbalanced data, log loss and calibration, threshold tuning, regression metrics, and turning business costs into a metric. Builds on ML Basics and Core Concepts.</p>

  <h2 id="me-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Model Evaluation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Confusion matrix</div>
        <ul>
          <li><b>TP / FP / FN / TN</b> — rows = actual, columns = predicted</li>
          <li><b>FP</b> = false alarm (Type I); <b>FN</b> = miss (Type II)</li>
          <li><b>Accuracy</b> = (TP+TN)/all — ⚠ useless when imbalanced</li>
          <li>Demo 2.5% positives: always-negative = 97.5% acc, 0 recall</li>
          <li>sklearn: <code>confusion_matrix(y, pred).ravel()</code> → tn, fp, fn, tp</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Precision · recall · F1</div>
        <ul>
          <li><b>Precision</b> = TP/(TP+FP) — "when I alarm, am I right?"</li>
          <li><b>Recall / TPR / sensitivity</b> = TP/(TP+FN) — "how many did I catch?"</li>
          <li><b>Specificity</b> = TN/(TN+FP); <b>FPR</b> = 1 − specificity</li>
          <li><b>F1</b> = harmonic mean; <b>Fβ</b>: β &gt; 1 favours recall (F2), β &lt; 1 precision</li>
          <li>Favour precision: spam filter, recommendations. Favour recall: cancer, fraud, failures</li>
          <li>💡 Fishing net: recall = share of fish caught, precision = share of the catch that is fish</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ROC vs PR</div>
        <ul>
          <li><b>ROC</b> — TPR vs FPR over all thresholds; <b>AUC</b> = P(random pos scored above random neg)</li>
          <li><b>PR curve</b> — precision vs recall; <b>AP</b> summarises it</li>
          <li>Random: ROC-AUC 0.5; AP = prevalence</li>
          <li>ROC ignores prevalence: AUC 0.83–0.84 at 50% and 2.5% positives; AP 0.878 → 0.576</li>
          <li>⚠ Rare positives: FPR 2.5% yet 62% of alerts false → use PR / AP when positives &lt; ~10%</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Log loss &amp; calibration</div>
        <ul>
          <li><b>Log loss</b> = −mean(y log p + (1−y) log(1−p)); p=0.9→0.105, p=0.01→4.6</li>
          <li>Punishes confident mistakes; the training loss of logistic regression and nets</li>
          <li><b>Calibrated</b> — "0.8" happens 80% of the time; check with <code>calibration_curve</code></li>
          <li><b>Brier</b> = mean((p − y)²), lower better</li>
          <li>LogReg ≈ calibrated; Naive Bayes overconfident; RF under-confident (pulled to middle)</li>
          <li>Fix: <code>CalibratedClassifierCV</code> sigmoid (Platt) or isotonic (more data)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Threshold tuning</div>
        <ul>
          <li>0.5 is a default, not a decision; tune on validation, never test</li>
          <li><b>Constraint</b> — "recall ≥ 0.6, best precision" via <code>precision_recall_curve</code></li>
          <li><b>Cost</b> — min(C_FN·FN + C_FP·FP); calibrated theory t* = C_FP/(C_FP + C_FN)</li>
          <li>Demo: FN 500, FP 20 → cost 80,620 at 0.5 vs 53,960 at 0.08</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regression metrics</div>
        <ul>
          <li><b>MAE</b> — avg miss in units; robust</li>
          <li><b>RMSE</b> — punishes big misses; RMSE ≫ MAE means a few huge errors</li>
          <li><b>R²</b> = 1 − SS_res/SS_tot; 0 = predict the mean; can go negative (−2.0 demo)</li>
          <li><b>MAPE</b> — % error, ⚠ explodes near y = 0 (4.6% → 15.2% from one 0.5 value)</li>
          <li><b>sMAPE</b> (bounded 0–200%), <b>WAPE</b> = Σ|e|/Σ|y| (volume-weighted, safe)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Business metrics</div>
        <ul>
          <li>ML metrics are proxies; write down what each FP and FN costs</li>
          <li>Fraud AUC treats a ₹100 and a ₹10 lakh miss equally → value-weight errors</li>
          <li>Load-forecast MAPE weights 2 am like 6 pm peak → weight by impact</li>
          <li>Recommender CTR ≠ satisfaction → track retention</li>
          <li>Offline metric picks candidates; the A/B test decides</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="me-cm"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Confusion Matrix</span><span class="rm-sub">And why accuracy lies</span></div></div>
      <div class="rm-item rm-done" data-target="me-prf"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Precision, Recall, F1</span><span class="rm-sub">Which mistake hurts more</span></div></div>
      <div class="rm-item rm-done" data-target="me-roc"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">ROC-AUC vs PR Curve</span><span class="rm-sub">Imbalance changes the answer</span></div></div>
      <div class="rm-item rm-done" data-target="me-ll"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Log Loss &amp; Calibration</span><span class="rm-sub">Are the probabilities honest?</span></div></div>
      <div class="rm-item rm-done" data-target="me-thr"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Threshold Tuning</span><span class="rm-sub">From scores to decisions</span></div></div>
      <div class="rm-item rm-done" data-target="me-reg"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Regression Metrics</span><span class="rm-sub">MAE, RMSE, R², MAPE</span></div></div>
      <div class="rm-item rm-done" data-target="me-biz"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Metrics from Business Costs</span><span class="rm-sub">What a mistake really costs</span></div></div>
      <div class="rm-item rm-done" data-target="me-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="me-cm"><span class="num">01</span>Confusion Matrix</h2>
  <figure class="viz"><svg viewBox="0 0 560 230" width="560">
    <text x="280" y="16" text-anchor="middle" class="tm">predicted</text>
    <text x="220" y="34" text-anchor="middle">0 (legit)</text><text x="340" y="34" text-anchor="middle">1 (fraud)</text>
    <text x="150" y="80" text-anchor="end">actual 0</text><text x="150" y="150" text-anchor="end">actual 1</text>
    <rect x="160" y="42" width="120" height="70" class="fg sg"/><rect x="280" y="42" width="120" height="70" class="fr sr"/>
    <rect x="160" y="112" width="120" height="70" class="fr sr"/><rect x="280" y="112" width="120" height="70" class="fg sg"/>
    <g text-anchor="middle"><text x="220" y="76">TN 9,745</text><text x="220" y="94" class="tm">correct reject</text>
      <text x="340" y="76">FP 6</text><text x="340" y="94" class="tm">false alarm</text>
      <text x="220" y="146">FN 161</text><text x="220" y="164" class="tm">missed fraud</text>
      <text x="340" y="146">TP 88</text><text x="340" y="164" class="tm">caught</text></g>
    <text x="412" y="142" class="tb">recall = 88 / 249</text><text x="412" y="158" class="tb">= 0.353</text>
    <text x="160" y="204" class="tb">precision = 88 / (88 + 6) = 0.936</text>
    <text x="160" y="222" class="tm">accuracy = (9,745 + 88) / 10,000 = 0.983</text>
  </svg><figcaption>Logistic regression on 10,000 test rows with 2.5% fraud, threshold 0.5. High accuracy, yet 161 of 249 frauds slip through.</figcaption></figure>
  <div class="fx" data-lang="py">from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (confusion_matrix, accuracy_score, precision_score, recall_score,
                             f1_score, fbeta_score, roc_auc_score, average_precision_score)
X, y = make_classification(n_samples=20000, n_features=20, n_informative=5,
                           weights=[0.98], flip_y=0.01, class_sep=0.8, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.5, stratify=y, random_state=0)
print("positive rate:", y_te.mean().round(4), "test size", len(y_te))
dummy = DummyClassifier().fit(X_tr, y_tr).predict(X_te)
print("always-negative acc:", round(accuracy_score(y_te, dummy), 3), "recall:", recall_score(y_te, dummy))
clf = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
p = clf.predict_proba(X_te)[:, 1]
pred = (p &gt;= 0.5).astype(int)
tn, fp, fn, tp = confusion_matrix(y_te, pred).ravel()
print("TN FP FN TP =", tn, fp, fn, tp)
print(f"acc={accuracy_score(y_te,pred):.3f} precision={precision_score(y_te,pred):.3f} recall={recall_score(y_te,pred):.3f} "
      f"F1={f1_score(y_te,pred):.3f} F2={fbeta_score(y_te,pred,beta=2):.3f}")
print(f"ROC-AUC={roc_auc_score(y_te,p):.3f}  PR-AUC(AP)={average_precision_score(y_te,p):.3f}")</div>
  <div class="fx" data-lang="text">positive rate: 0.0249 test size 10000
always-negative acc: 0.975 recall: 0.0
TN FP FN TP = 9745 6 161 88
acc=0.983 precision=0.936 recall=0.353 F1=0.513 F2=0.404
ROC-AUC=0.837  PR-AUC(AP)=0.576</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A model that never predicts fraud scores 97.5% accuracy here. With any imbalance, report the confusion matrix, precision/recall (or F1/Fβ) and PR-AUC, never accuracy alone.</p>
  </div>

  <h2 id="me-prf"><span class="num">02</span>Precision, Recall, F1</h2>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Question it answers</th><th>Here</th></tr>
    <tr><td><strong>Precision</strong></td><td>TP / (TP + FP)</td><td>When I flag, how often am I right?</td><td>0.936</td></tr>
    <tr><td><strong>Recall</strong> (TPR, sensitivity)</td><td>TP / (TP + FN)</td><td>Of all real positives, how many did I catch?</td><td>0.353</td></tr>
    <tr><td><strong>Specificity</strong> (TNR)</td><td>TN / (TN + FP)</td><td>Of real negatives, how many did I clear?</td><td>0.999</td></tr>
    <tr><td><strong>F1</strong></td><td>2PR / (P + R)</td><td>Balance of both (harmonic mean punishes the weak one)</td><td>0.513</td></tr>
    <tr><td><strong>Fβ</strong></td><td>(1+β²)PR / (β²P + R)</td><td>β = 2: recall counts 4× as much (F2)</td><td>0.404</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fishing net. Recall: what share of the fish in the lake you caught. Precision: what share of your catch is fish rather than boots. A bigger net raises recall and drags in more boots.</p>
  </div>
  <div class="cards">
    <div><b>Favour precision</b><p>False positives are expensive.</p><small>Spam filter (losing a real email), recommendations, auto-blocking accounts</small></div>
    <div><b>Favour recall</b><p>False negatives are expensive.</p><small>Cancer screening, fraud, equipment failure, safety alerts</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>F1 assumes both errors cost the same. They almost never do: use Fβ or, better, an explicit cost (section 07). Multi-class: say whether you report <code>macro</code> (each class equal) or <code>weighted</code> (by support) averages.</p>
  </div>

  <h2 id="me-roc"><span class="num">03</span>ROC-AUC vs PR Curve</h2>
  <figure class="viz"><svg viewBox="0 0 560 230" width="560">
    <g stroke="currentColor" opacity="0.5"><line x1="40" y1="180" x2="240" y2="180"/><line x1="40" y1="180" x2="40" y2="30"/><line x1="330" y1="180" x2="530" y2="180"/><line x1="330" y1="180" x2="330" y2="30"/></g>
    <line x1="40" y1="180" x2="240" y2="30" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
    <line x1="330" y1="176" x2="530" y2="176" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
    <polyline points="40,180 40,140 40,118 41,107 42,97 44,91 50,83 60,75 80,70 100,63 120,60 140,52 160,49 180,42 200,37 220,36 240,30" fill="none" class="sb" stroke-width="2.5"/>
    <polyline points="330,30 350,30 370,30 390,32 400,40 410,41 420,51 430,71 440,92 450,123 460,145 470,160 490,172 510,175 530,176" fill="none" class="sr" stroke-width="2.5"/>
    <circle cx="45" cy="88" r="4" class="fg sg"/><text x="54" y="104" class="tg">FPR 2.5%, recall 0.60</text>
    <circle cx="450" cy="123" r="4" class="fg sg"/><text x="456" y="116" class="tg">precision 0.38</text>
    <text x="140" y="20" text-anchor="middle">ROC · AUC 0.837</text><text x="430" y="20" text-anchor="middle">PR · AP 0.576</text>
    <text x="140" y="198" text-anchor="middle" class="tm">false positive rate</text><text x="430" y="198" text-anchor="middle" class="tm">recall</text>
    <text x="150" y="150" class="tm">random = 0.5</text><text x="360" y="170" class="tm">random = 0.025</text>
    <text x="22" y="105" class="tm" transform="rotate(-90 22 105)">recall (TPR)</text><text x="312" y="105" class="tm" transform="rotate(-90 312 105)">precision</text>
  </svg><figcaption>Same model, same point (green): ROC calls it a 2.5% false-positive rate; PR shows 62% of alerts are false.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ROC-AUC</strong>: area under TPR vs FPR across all thresholds = probability a random positive gets a higher score than a random negative. <strong>PR curve</strong>: precision vs recall; <strong>average precision (AP)</strong> summarises it. A random model scores ROC-AUC 0.5 but AP = the positive rate.</p>
  </div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
pos, neg = np.where(y_te == 1)[0], np.where(y_te == 0)[0]
for n_neg in [len(pos), 10 * len(pos), len(neg)]:      # same model, same positives, more negatives
    idx = np.r_[pos, rng.choice(neg, n_neg, replace=False)]
    print(f"pos rate {len(pos)/len(idx):5.1%}: ROC-AUC={roc_auc_score(y_te[idx], p[idx]):.3f}  "
          f"AP={average_precision_score(y_te[idx], p[idx]):.3f}  random AP≈{len(pos)/len(idx):.3f}")</div>
  <div class="fx" data-lang="text">pos rate 50.0%: ROC-AUC=0.826  AP=0.878  random AP≈0.500
pos rate  9.1%: ROC-AUC=0.837  AP=0.677  random AP≈0.091
pos rate  2.5%: ROC-AUC=0.837  AP=0.576  random AP≈0.025</div>
  <p>ROC-AUC barely moves as negatives pile up, because FPR divides by the huge TN count. Precision feels every extra false alarm.</p>
  <table class="tbl">
    <tr><th>Use</th><th>When</th></tr>
    <tr><td><strong>ROC-AUC</strong></td><td>Roughly balanced classes; you care about ranking both classes; comparing across datasets with different prevalence</td></tr>
    <tr><td><strong>PR-AUC / AP</strong></td><td>Positives rare (&lt; ~10%: fraud, disease, defects) and you act on the flagged positives</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Both are threshold-free ranking scores: neither tells you how the model performs at the threshold you deploy. Compare AP to its baseline (the prevalence), not to 0.5.</p>
  </div>

  <h2 id="me-ll"><span class="num">04</span>Log Loss &amp; Calibration</h2>
  <div class="fx" data-lang="py">from sklearn.metrics import log_loss
for q in [0.9, 0.5, 0.1, 0.01]:
    print(f"true=1, p={q:&lt;4}: loss={-np.log(q):.3f}")
print("log_loss of all four:", round(log_loss([1, 1, 1, 1], [0.9, 0.5, 0.1, 0.01], labels=[0, 1]), 3))</div>
  <div class="fx" data-lang="text">true=1, p=0.9 : loss=0.105
true=1, p=0.5 : loss=0.693
true=1, p=0.1 : loss=2.303
true=1, p=0.01: loss=4.605
log_loss of all four: 1.927</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Log loss</strong> = −mean(y·log p + (1−y)·log(1−p)). It rewards confident correct answers and brutally punishes confident wrong ones. 0.693 = always saying 0.5. It is the training loss of logistic regression and most neural classifiers.</p>
  </div>
  <p><strong>Calibration</strong>: among cases scored 0.8, about 80% should be positive. A model can rank perfectly (high AUC) with dishonest probabilities.</p>
  <div class="fx" data-lang="py">from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import brier_score_loss
X, y = make_classification(n_samples=20000, n_features=20, n_informative=6, n_redundant=6, random_state=1)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.5, random_state=0)
models = {"LogReg": LogisticRegression(max_iter=1000), "NaiveBayes": GaussianNB(),
          "RandomForest": RandomForestClassifier(200, random_state=0, n_jobs=-1),
          "NB + isotonic": CalibratedClassifierCV(GaussianNB(), method="isotonic", cv=5)}
for name, m in models.items():
    p = m.fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
    frac, mean = calibration_curve(y_te, p, n_bins=5)
    print(f"{name:13s} AUC={roc_auc_score(y_te,p):.3f} logloss={log_loss(y_te,p):.3f} Brier={brier_score_loss(y_te,p):.3f}  "
          f"pred→actual: " + " ".join(f"{a:.2f}→{b:.2f}" for a, b in zip(mean, frac)))</div>
  <div class="fx" data-lang="text">LogReg        AUC=0.970 logloss=0.210 Brier=0.058  pred→actual: 0.03→0.02 0.29→0.26 0.51→0.56 0.71→0.79 0.95→0.95
NaiveBayes    AUC=0.944 logloss=0.377 Brier=0.099  pred→actual: 0.02→0.07 0.30→0.42 0.49→0.54 0.70→0.67 0.97→0.90
RandomForest  AUC=0.992 logloss=0.145 Brier=0.027  pred→actual: 0.03→0.01 0.29→0.12 0.50→0.46 0.72→0.84 0.96→0.99
NB + isotonic AUC=0.944 logloss=0.296 Brier=0.092  pred→actual: 0.03→0.04 0.32→0.34 0.52→0.50 0.71→0.69 0.93→0.92</div>
  <ul>
    <li><strong>Naive Bayes</strong>: overconfident (says 0.97, right 90%). Isotonic calibration fixes it: log loss 0.377 → 0.296, same AUC.</li>
    <li><strong>Random forest</strong>: under-confident; averaging trees pulls scores toward the middle (says 0.29, truly 0.12). Still the best ranker here.</li>
    <li><strong>Brier score</strong> = mean((p − y)²): lower is better; mixes calibration and discrimination.</li>
    <li><strong>Fix</strong>: <code>CalibratedClassifierCV(method="sigmoid")</code> (Platt, small data) or <code>"isotonic"</code> (flexible, needs more data), fit on data the model didn't train on.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Calibration matters when probabilities feed decisions: expected-value maths, risk scores, cost-based thresholds. Calibration never changes AUC; it only fixes the numbers.</p>
  </div>

  <h2 id="me-thr"><span class="num">05</span>Threshold Tuning</h2>
  <div class="flow"><span>Model scores p</span><span>Pick threshold t on validation</span><span>p ≥ t → act</span><span>Re-check as data drifts</span></div>
  <div class="fx" data-lang="py">from sklearn.metrics import precision_recall_curve
prec, rec, thr = precision_recall_curve(y_te, p)     # p, y_te from the fraud model (section 01)

# 1) Constraint: recall must be at least 0.60 -> best precision under that rule
ok = rec[:-1] &gt;= 0.60
t = thr[ok][prec[:-1][ok].argmax()]
tn, fp, fn, tp = confusion_matrix(y_te, p &gt;= t).ravel()
print(f"threshold={t:.3f} TP={tp} FP={fp} FN={fn} precision={tp/(tp+fp):.3f} recall={tp/(tp+fn):.3f} FPR={fp/(fp+tn):.3%}")

# 2) Costs: a missed fraud costs 500, a false alarm (manual review) costs 20
def cost(t):
    tn, fp, fn, tp = confusion_matrix(y_te, p &gt;= t).ravel()
    return 500 * fn + 20 * fp
grid = np.linspace(0.01, 0.99, 99)
best = grid[np.argmin([cost(t) for t in grid])]
print(f"cost @0.50 = {cost(0.5):,}   best t={best:.2f} cost = {cost(best):,}   theory t*=20/(20+500)={20/520:.3f}")
print({t: f"{cost(t):,}" for t in [0.04, 0.08, 0.2]})</div>
  <div class="fx" data-lang="text">threshold=0.100 TP=150 FP=244 FN=99 precision=0.381 recall=0.602 FPR=2.502%
cost @0.50 = 80,620   best t=0.08 cost = 53,960   theory t*=20/(20+500)=0.038
{0.04: '58,780', 0.08: '53,960', 0.2: '61,260'}</div>
  <ul>
    <li>Lowering the threshold from 0.5 to 0.08 cuts total cost by a third.</li>
    <li>The theory threshold <code>C_FP / (C_FP + C_FN)</code> assumes perfectly calibrated probabilities; the empirical search lands nearby (0.04–0.08 are close in cost).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choose the threshold on validation data (or out-of-fold predictions), then confirm once on test. Tuning it on test is just another way to leak. sklearn 1.5+ also has <code>TunedThresholdClassifierCV</code> to do this inside CV.</p>
  </div>

  <h2 id="me-reg"><span class="num">06</span>Regression Metrics</h2>
  <div class="fx" data-lang="py">from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
def report(name, y, yhat):
    mae = mean_absolute_error(y, yhat); rmse = np.sqrt(mean_squared_error(y, yhat))
    mape = mean_absolute_percentage_error(y, yhat) * 100
    smape = np.mean(2 * np.abs(y - yhat) / (np.abs(y) + np.abs(yhat))) * 100
    wape = np.abs(y - yhat).sum() / np.abs(y).sum() * 100
    print(f"{name:12s} MAE={mae:5.1f} RMSE={rmse:5.1f} R2={r2_score(y, yhat):6.3f} MAPE={mape:6.1f}% sMAPE={smape:5.1f}% WAPE={wape:5.1f}%")
y = np.array([100, 120, 90, 110, 105, 95, 130, 115.])          # daily demand
report("all small", y, y + np.array([5, -4, 6, -5, 4, -6, 5, -4]))
report("one big miss", y, y + np.array([5, -4, 6, -5, 4, -6, 60, -4]))
report("predict mean", y, np.full_like(y, y.mean()))
y0 = np.r_[y, 0.5]                                             # add a near-zero night value
report("near-zero y", y0, np.r_[y + np.array([5, -4, 6, -5, 4, -6, 5, -4]), 1.0])</div>
  <div class="fx" data-lang="text">all small    MAE=  4.9 RMSE=  4.9 R2= 0.844 MAPE=   4.6% sMAPE=  4.6% WAPE=  4.5%
one big miss MAE= 11.8 RMSE= 21.7 R2=-2.024 MAPE=   9.9% sMAPE=  8.8% WAPE= 10.9%
predict mean MAE= 10.6 RMSE= 12.5 R2= 0.000 MAPE=   9.9% sMAPE=  9.8% WAPE=  9.8%
near-zero y  MAE=  4.4 RMSE=  4.7 R2= 0.983 MAPE=  15.2% sMAPE= 11.5% WAPE=  4.6%</div>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Use when</th><th>Watch out</th></tr>
    <tr><td><strong>MAE</strong></td><td>mean|y − ŷ|</td><td>Errors cost linearly; outliers are noise; easy to explain</td><td>Optimum is the median</td></tr>
    <tr><td><strong>RMSE</strong></td><td>√mean(y − ŷ)²</td><td>Big misses are disproportionately bad; matches MSE training</td><td>One miss doubled it (4.9 → 21.7)</td></tr>
    <tr><td><strong>R²</strong></td><td>1 − SS_res / SS_tot</td><td>Share of variance explained; compare models on one dataset</td><td>Negative = worse than predicting the mean</td></tr>
    <tr><td><strong>MAPE</strong></td><td>mean|e / y| × 100</td><td>Scale-free % to compare series of different size</td><td>Explodes near y = 0; undefined at 0; favours under-forecasts</td></tr>
    <tr><td><strong>sMAPE</strong></td><td>mean 2|e| / (|y| + |ŷ|)</td><td>MAPE near small values</td><td>Bounded 0–200%, still odd near 0</td></tr>
    <tr><td><strong>WAPE</strong></td><td>Σ|e| / Σ|y|</td><td>Demand / load forecasting; volume-weighted %</td><td>Hides errors on small items</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One overnight reading of 0.5 MW predicted as 1.0 MW is a 100% error and tripled MAPE (4.6% → 15.2%) while MAE barely moved. Use WAPE, sMAPE, or exclude values below a documented floor. If RMSE ≫ MAE, a few big misses dominate: inspect them.</p>
  </div>

  <h2 id="me-biz"><span class="num">07</span>Metrics from Business Costs</h2>
  <div class="flow"><span>Decision the model drives</span><span>Cost of FP, FN (or of error size)</span><span>Offline metric that tracks that cost</span><span>Threshold / model choice</span><span>A/B test the business KPI</span></div>
  <table class="tbl">
    <tr><th></th><th>Predicted legit</th><th>Predicted fraud</th></tr>
    <tr><td><strong>Actual legit</strong></td><td>0</td><td>₹20 review + annoyed customer</td></tr>
    <tr><td><strong>Actual fraud</strong></td><td>Lost amount (avg ₹500)</td><td>₹20 review</td></tr>
  </table>
  <table class="tbl">
    <tr><th>Mismatch</th><th>Why the ML metric misleads</th><th>Better</th></tr>
    <tr><td>Fraud ranked by ROC-AUC</td><td>A missed ₹100 and a missed ₹10 lakh fraud count the same</td><td>Value-weighted recall, expected loss saved</td></tr>
    <tr><td>Load forecast on MAPE</td><td>2 am error (low impact) weighs as much as 6 pm peak (grid risk)</td><td>WAPE or hour-weighted error</td></tr>
    <tr><td>Recommender on CTR</td><td>Clickbait wins clicks, loses trust</td><td>Retention, watch time, long-term value</td></tr>
    <tr><td>Churn model on F1</td><td>Ignores that a retention offer costs money</td><td>Profit curve: (saved value − offer cost) per threshold</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A smoke alarm: a false alarm costs a minute of annoyance, a missed fire costs the house. Nobody tunes it for "accuracy".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A better offline metric can still lose online (proxy ≠ goal, feedback loops, shifted data). Offline metrics choose candidates; the A/B test on the business KPI decides.</p>
  </div>

  <h2 id="me-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Your fraud model has 98.3% accuracy. Good?</summary><div class="qa-body">Unknown until you see the baseline and the confusion matrix. With 2.5% fraud, predicting "legit" always gives 97.5%. Our model at 0.5 caught only 88 of 249 frauds (recall 0.353). Report precision, recall, PR-AUC and the cost at the chosen threshold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>TP = 88, FP = 6, FN = 161, TN = 9,745. Compute precision, recall, F1.</summary><div class="qa-body">Precision = 88/94 = 0.936. Recall = 88/249 = 0.353. F1 = 2·0.936·0.353/(0.936+0.353) = 0.513.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you prefer PR-AUC over ROC-AUC?</summary><div class="qa-body">When positives are rare (under ~10%) and you act on the flagged cases. FPR = FP/(FP+TN) stays tiny because TN is huge: at FPR 2.5% our model's alerts were 62% false. ROC-AUC stayed ≈ 0.83 from 50% to 2.5% prevalence while AP fell 0.878 → 0.576. Compare AP against the prevalence baseline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ROC-AUC = 0.8 mean in plain words?</summary><div class="qa-body">Pick one random positive and one random negative: 80% of the time the model scores the positive higher. It's a ranking measure, independent of the threshold and of probability calibration.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is log loss used instead of accuracy for probabilistic models?</summary><div class="qa-body">It uses the probability, not just the hard label, and is smooth, so it can be optimised and it rewards honest confidence. A confident wrong prediction (p = 0.01 for a positive) costs 4.6 vs 0.105 for p = 0.9. It is minimised by calibrated probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is calibration and how do you fix a badly calibrated model?</summary><div class="qa-body">Predicted probabilities match observed frequencies. Check with <code>calibration_curve</code> / reliability plot and Brier score. Fix post hoc with <code>CalibratedClassifierCV</code>: sigmoid (Platt) for small data, isotonic for more data, on held-out folds. Naive Bayes tends to be overconfident, random forests under-confident, logistic regression is usually close.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A missed fraud costs 500, a false alarm 20. How do you set the threshold?</summary><div class="qa-body">Minimise 500·FN + 20·FP over thresholds on validation predictions. With calibrated probabilities the optimum is t* = 20/(20+500) ≈ 0.04. In our demo the search found 0.08, cutting cost from 80,620 (at 0.5) to 53,960.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RMSE vs MAE: which, and what does a big gap between them tell you?</summary><div class="qa-body">MAE when errors cost linearly or outliers are noise; RMSE when large misses are disproportionately costly or to match an MSE-trained model. RMSE ≫ MAE means a few large errors dominate (one 60-unit miss took RMSE 4.9 → 21.7 while MAE went 4.9 → 11.8).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can R² be negative? What does it mean?</summary><div class="qa-body">Yes, on data the model wasn't fit on. R² = 1 − SS_res/SS_tot, so negative means its squared error exceeds that of predicting the mean. One big miss gave R² = −2.02 in the demo.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is MAPE dangerous for electricity load or sales forecasting?</summary><div class="qa-body">It divides by the actual: near-zero actuals (night load, slow items) create huge percentages and dominate the average (one 0.5 MW reading took MAPE from 4.6% to 15.2%). It's undefined at 0 and penalises over-forecasts more than under-forecasts. Use WAPE, sMAPE or a documented exclusion floor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model wins offline but the business KPI doesn't move. Why?</summary><div class="qa-body">The offline metric is a proxy that doesn't track value (AUC ignores fraud amount, CTR ignores satisfaction), the threshold wasn't tuned to costs, the evaluation split leaked or doesn't match production data, or the probabilities are uncalibrated for downstream decisions. Define costs first and validate with an A/B test.</div></details>
</main>`
});
