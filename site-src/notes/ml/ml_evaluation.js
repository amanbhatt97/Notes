// ml/ml_evaluation.js — Model Evaluation
Object.assign(TOPIC_CONTENT, {
  "ml_evaluation": `<main>
  <h1>Model Evaluation</h1>
  <p class="lead">A model says "98% accurate". Is that good? Often it is not, and this page shows why. It teaches how to tell if a model is really doing its job: the confusion matrix and the metrics built from it, ROC vs PR curves when one class is rare, log loss and calibration (are the probabilities honest?), choosing a threshold, regression metrics, and turning business costs into a metric. Interviewers ask about every one of these. Builds on ML Basics and Core Concepts.</p>

  <h2 id="me-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Model Evaluation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Confusion matrix</div>
        <ul>
          <li><b>TP / FP / FN / TN</b> — rows = actual, columns = predicted; count of each kind of right / wrong</li>
          <li><b>FP</b> = false alarm (Type I) · <b>FN</b> = miss (Type II)</li>
          <li><b>Accuracy</b> = (TP+TN)/all — ⚠ useless when one class is rare</li>
          <li>Demo, 2.5% fraud: "always legit" = 97.5% accuracy, catches 0 frauds</li>
          <li>sklearn: <code>confusion_matrix(y, pred).ravel()</code> → tn, fp, fn, tp</li>
          <li>💡 Metal detector: beeps on a belt buckle (FP), silent on a knife (FN)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Precision · recall · F1</div>
        <ul>
          <li><b>Precision</b> = TP/(TP+FP) — "when I raise an alarm, am I right?"</li>
          <li><b>Recall / TPR / sensitivity</b> = TP/(TP+FN) — "how many real ones did I catch?"</li>
          <li><b>Specificity</b> = TN/(TN+FP) · <b>FPR</b> = 1 − specificity</li>
          <li><b>F1</b> = harmonic mean of P and R · <b>Fβ</b>: β &gt; 1 favours recall (F2)</li>
          <li>Precision first: spam filter, recommendations. Recall first: cancer, fraud, machine failure</li>
          <li>💡 Fishing net: recall = share of fish caught; precision = share of catch that is fish</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ROC vs PR</div>
        <ul>
          <li><b>Threshold</b> — the cut-off that turns a score into yes/no; slide it to get a curve</li>
          <li><b>ROC</b> — TPR vs FPR as the threshold slides · <b>AUC</b> = chance a random positive scores above a random negative</li>
          <li><b>PR curve</b> — precision vs recall · <b>AP</b> = its summary</li>
          <li>Random model: ROC-AUC 0.5; AP = positive rate</li>
          <li>ROC ignores how rare positives are: AUC ~0.83 at 50% and 2.5% positives; AP 0.878 → 0.576</li>
          <li>⚠ Rare positives: FPR 2.5% yet 62% of alerts false → use PR / AP when positives &lt; ~10%</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Log loss &amp; calibration</div>
        <ul>
          <li><b>Log loss</b> = −mean(y log p + (1−y) log(1−p)); p=0.9 → 0.105, p=0.01 → 4.6</li>
          <li>Punishes sure-but-wrong answers; training loss of logistic regression and nets</li>
          <li><b>Calibrated</b> — "0.8" comes true 80% of the time; check with <code>calibration_curve</code></li>
          <li><b>Brier</b> = mean((p − y)²), lower is better</li>
          <li>LogReg ≈ calibrated · Naive Bayes overconfident · RF under-confident</li>
          <li>Fix: <code>CalibratedClassifierCV</code> sigmoid (Platt) or isotonic (more data)</li>
          <li>💡 A weather app whose "70% rain" days really rain 7 times in 10</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Threshold tuning</div>
        <ul>
          <li>0.5 is a default, not a decision; tune on validation, never test</li>
          <li><b>Rule-based</b> — "recall ≥ 0.6, best precision" via <code>precision_recall_curve</code></li>
          <li><b>Cost-based</b> — min(C_FN·FN + C_FP·FP); theory t* = C_FP/(C_FP + C_FN)</li>
          <li>Demo: FN 500, FP 20 → cost 80,620 at 0.5 vs 53,960 at 0.08</li>
          <li>💡 Bank guard: check everyone (queues) vs check no one (fraud)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regression metrics</div>
        <ul>
          <li><b>MAE</b> — average miss, in units; calm with outliers</li>
          <li><b>RMSE</b> — punishes big misses; RMSE ≫ MAE → a few huge errors</li>
          <li><b>R²</b> = 1 − SS_res/SS_tot; 0 = same as predicting the mean; can go negative (−2.0 demo)</li>
          <li><b>MAPE</b> — % error · ⚠ blows up near y = 0 (4.6% → 15.2% from one 0.5 value)</li>
          <li><b>sMAPE</b> (0–200%) · <b>WAPE</b> = Σ|e|/Σ|y| (weighted by volume, safe)</li>
          <li>💡 Tiffin service: "off by 5 tiffins a day" (MAE) vs "off by 5%" (MAPE)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Business metrics</div>
        <ul>
          <li>ML metrics are stand-ins; write down what each FP and FN costs</li>
          <li>Fraud AUC treats a ₹100 miss like a ₹10 lakh miss → weight by value</li>
          <li>Load MAPE weights 2 am like the 6 pm peak → weight by impact</li>
          <li>Recommender CTR ≠ happy users → track retention</li>
          <li>Offline metric shortlists; the A/B test decides</li>
          <li>💡 Smoke alarm: nobody tunes it for accuracy</li>
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
  <p>A doctor checks 10 lumps. 3 are cancer, 7 are harmless. She says "cancer" for 2 of them and "harmless" for 8. Is she a good doctor? Her accuracy is 70%, but that one number hides the part that matters: did she catch the real cancers, or did she flag harmless lumps?</p>
  <p>For a yes/no question, every answer falls into one of four boxes. Say "positive" means the thing we are looking for (cancer, fraud, spam) and "negative" means not.</p>
  <ul>
    <li><strong>True positive (TP)</strong> — it was cancer, she said cancer. Correct.</li>
    <li><strong>True negative (TN)</strong> — harmless, she said harmless. Correct.</li>
    <li><strong>False positive (FP)</strong> — harmless, but she said cancer. A false alarm.</li>
    <li><strong>False negative (FN)</strong> — cancer, but she said harmless. A miss. Usually the worst one.</li>
  </ul>
  <p>Counting those four boxes gives the <strong>confusion matrix</strong>. Here it is for the 10 lumps, worked out by hand:</p>
  <div class="fx" data-lang="py"># 10 lumps checked by a doctor-model. 1 = cancer
actual = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
pred   = [1, 0, 0, 1, 0, 0, 0, 0, 0, 0]
TP = sum(a == 1 and p == 1 for a, p in zip(actual, pred))
FN = sum(a == 1 and p == 0 for a, p in zip(actual, pred))
FP = sum(a == 0 and p == 1 for a, p in zip(actual, pred))
TN = sum(a == 0 and p == 0 for a, p in zip(actual, pred))
print(f"TP={TP} FN={FN} FP={FP} TN={TN}")
print(f"accuracy  = (TP+TN)/all = {(TP+TN)/10:.2f}")
print(f"precision = TP/(TP+FP) = {TP/(TP+FP):.2f}")
print(f"recall    = TP/(TP+FN) = {TP/(TP+FN):.2f}")</div>
  <div class="fx" data-lang="text">TP=1 FN=2 FP=1 TN=6
accuracy  = (TP+TN)/all = 0.70
precision = TP/(TP+FP) = 0.50
recall    = TP/(TP+FN) = 0.33</div>
  <p>Now the story is clear. She caught only 1 of the 3 cancers (recall 0.33) and missed 2. Of her 2 "cancer" calls, 1 was wrong (precision 0.50). Accuracy 70% told you none of this. Precision and recall get their own section next; first, the same idea on a real-sized problem.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Airport metal detector. Beeps on a belt buckle = false positive. Stays silent on a knife = false negative. Both are "wrong", but one is far worse.</p>
  </div>
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
  </svg><figcaption>Logistic regression on 10,000 test rows, 2.5% fraud, threshold 0.5. Accuracy is high, yet 161 of 249 frauds slip through.</figcaption></figure>
  <p>Rows are what really happened, columns are what the model said. Green boxes are correct, red boxes are mistakes. The bottom-left red box (161 missed frauds) is the one the business cares about, and accuracy (98.3%) completely hides it.</p>
  <p>The code that produced that matrix. <code>make_classification</code> builds a fake dataset with 2% positives; <code>predict_proba</code> gives each row a fraud score between 0 and 1; a score of 0.5 or more is called "fraud".</p>
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
  <p>Second line: a "model" that never says fraud gets 97.5% accuracy, because 97.5% of rows are not fraud. Our real model's 98.3% is barely better. The last two lines (AUC, AP) are explained in section 03.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A model that never says "fraud" gets 97.5% accuracy here. When classes are uneven, report the confusion matrix, precision/recall (or F1/Fβ) and PR-AUC, never accuracy alone.</p>
  </div>

  <h2 id="me-prf"><span class="num">02</span>Precision, Recall, F1</h2>
  <p>Two different questions you can ask about the "fraud" alarms:</p>
  <ul>
    <li><strong>Precision</strong> — "When the model raises an alarm, how often is it right?" Of the 94 alarms, 88 were real fraud: 88 / 94 = 0.936.</li>
    <li><strong>Recall</strong> — "Of all the real frauds, how many did the model catch?" Of 249 frauds, it caught 88: 88 / 249 = 0.353.</li>
  </ul>
  <p>This model is careful (high precision: when it speaks, trust it) but misses most frauds (low recall). Whether that is OK depends on the job.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fishing net. Recall: what share of the fish in the lake you caught. Precision: what share of your catch is fish, not old slippers. A bigger net raises recall but pulls in more slippers.</p>
  </div>
  <p>That last line is the key trade-off. You can always raise recall by flagging more rows, but then more of your flags are wrong, so precision falls. The threshold (section 05) is the knob.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Question it answers</th><th>Here</th></tr>
    <tr><td><strong>Precision</strong></td><td>TP / (TP + FP)</td><td>When I flag, how often am I right?</td><td>0.936</td></tr>
    <tr><td><strong>Recall</strong> (TPR, sensitivity)</td><td>TP / (TP + FN)</td><td>Of all real positives, how many did I catch?</td><td>0.353</td></tr>
    <tr><td><strong>Specificity</strong> (TNR)</td><td>TN / (TN + FP)</td><td>Of real negatives, how many did I clear?</td><td>0.999</td></tr>
    <tr><td><strong>F1</strong></td><td>2PR / (P + R)</td><td>Balance of both (harmonic mean drags towards the weaker one)</td><td>0.513</td></tr>
    <tr><td><strong>Fβ</strong></td><td>(1+β²)PR / (β²P + R)</td><td>β = 2: recall counts 4× as much (F2)</td><td>0.404</td></tr>
  </table>
  <p>Why F1 uses the harmonic mean, not the plain average: with P = 0.936 and R = 0.353, the plain average is 0.64, which looks fine. The harmonic mean is 2 × 0.936 × 0.353 / (0.936 + 0.353) = 0.513, pulled towards the weak side. A model cannot hide a bad recall behind a great precision.</p>
  <div class="cards">
    <div><b>Favour precision</b><p>False positives are expensive.</p><small>Spam filter (losing a real email), recommendations, auto-blocking accounts</small></div>
    <div><b>Favour recall</b><p>False negatives are expensive.</p><small>Cancer screening, fraud, equipment failure, safety alerts</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>F1 assumes both mistakes cost the same. They almost never do: use Fβ or, better, real costs (section 07). Multi-class: say whether you report <code>macro</code> (each class equal) or <code>weighted</code> (by class size) averages.</p>
  </div>

  <h2 id="me-roc"><span class="num">03</span>ROC-AUC vs PR Curve</h2>
  <p>Precision and recall above were measured at one threshold, 0.5. But a model gives each row a score, and <em>we</em> choose where to cut. Six transactions, with the model's fraud score and the truth:</p>
  <div class="fx" data-lang="py">import numpy as np
scores = np.array([0.9, 0.8, 0.6, 0.4, 0.3, 0.1])   # model's fraud scores, sorted
actual = np.array([1,   1,   0,   1,   0,   0  ])   # 1 = real fraud
for t in [0.7, 0.5, 0.2]:
    flag = scores &gt;= t
    tp = (flag &amp; (actual == 1)).sum(); fp = (flag &amp; (actual == 0)).sum(); fn = (~flag &amp; (actual == 1)).sum()
    print(f"threshold {t}: flagged {flag.sum()}  precision {tp/(tp+fp):.2f}  recall {tp/(tp+fn):.2f}")</div>
  <div class="fx" data-lang="text">threshold 0.7: flagged 2  precision 1.00  recall 0.67
threshold 0.5: flagged 3  precision 0.67  recall 0.67
threshold 0.2: flagged 5  precision 0.60  recall 1.00</div>
  <p>Same model, three thresholds, three different precision/recall pairs. So which threshold should we judge the model at? None: instead, slide the threshold from high to low, record what happens at every step, and draw the trail. That trail is a <strong>curve</strong>, and the area under it is one number that judges the model's <em>ranking</em>, independent of any threshold.</p>
  <figure class="viz"><svg viewBox="0 0 520 150" width="520">
    <line x1="20" y1="115" x2="500" y2="115" stroke="currentColor" opacity="0.5"/>
    <path d="M30 115 Q 150 -10 270 115" class="fs" stroke="currentColor" fill-opacity="0.5"/>
    <path d="M200 115 Q 320 10 440 115" class="fr sr" fill-opacity="0.35"/>
    <text x="150" y="70" text-anchor="middle">negatives</text><text x="350" y="70" text-anchor="middle" class="tr">positives</text>
    <line x1="290" y1="20" x2="290" y2="120" class="sg" stroke-width="2"/>
    <text x="296" y="30" class="tg">threshold t</text>
    <text x="300" y="104" class="tr">TP</text><text x="262" y="104" class="tm">FP</text>
    <text x="20" y="138" class="tm">low score</text><text x="500" y="138" text-anchor="end" class="tm">high score →</text>
  </svg><figcaption>Right of the green line = flagged. Slide it left: more TP (recall ↑) but more FP. ROC plots TPR vs FPR for every position. Less overlap = bigger AUC.</figcaption></figure>
  <p>The grey hump is where the negatives' scores sit, the red hump the positives'. A good model pushes the humps apart. The green line is the threshold: everything to its right gets flagged. Slide it left and you catch more of the red hump (recall up) but also more of the grey one (false alarms up).</p>
  <p>Two popular curves come from this sliding:</p>
  <ul>
    <li><strong>ROC curve</strong> — plots recall (TPR, true positive rate) against the <strong>false positive rate</strong>, FPR = FP / (FP + TN) = "what share of the innocent got flagged". Its area is <strong>ROC-AUC</strong>.</li>
    <li><strong>PR curve</strong> — plots precision against recall. Its area is <strong>average precision (AP)</strong>, also called PR-AUC.</li>
  </ul>
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
  </svg><figcaption>Same model, same point (green). ROC says "only 2.5% false-positive rate". PR shows 62% of alerts are false.</figcaption></figure>
  <p>The green dot is the same threshold on both plots. On the left it looks great: only 2.5% of innocent rows flagged. On the right it looks poor: precision 0.38, so 62% of alarms are false. Both are true. 2.5% of 9,751 innocent rows is 244 false alarms, next to only 150 real catches. When positives are rare, a tiny FPR still means a flood of false alarms, and only the PR curve shows it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ROC-AUC</strong>: area under the TPR-vs-FPR curve. In plain words: pick one random positive and one random negative; AUC is the chance the positive gets the higher score. 1.0 = perfect ranking, 0.5 = coin toss. <strong>PR curve</strong>: precision vs recall; <strong>average precision (AP)</strong> is its summary. A random model gets ROC-AUC 0.5, but AP = the positive rate (0.025 here), so always compare AP to that baseline.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>ROC-AUC is like a teacher ranking students before results. AUC 0.8 = in 80% of (pass, fail) pairs, she ranked the passing student higher.</p>
  </div>
  <p>The proof that imbalance changes the answer. Same model, same positives; we just add more and more negatives and watch both numbers.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
pos, neg = np.where(y_te == 1)[0], np.where(y_te == 0)[0]
for n_neg in [len(pos), 10 * len(pos), len(neg)]:      # same model, same positives, more negatives
    idx = np.r_[pos, rng.choice(neg, n_neg, replace=False)]
    print(f"pos rate {len(pos)/len(idx):5.1%}: ROC-AUC={roc_auc_score(y_te[idx], p[idx]):.3f}  "
          f"AP={average_precision_score(y_te[idx], p[idx]):.3f}  random AP≈{len(pos)/len(idx):.3f}")</div>
  <div class="fx" data-lang="text">pos rate 50.0%: ROC-AUC=0.826  AP=0.878  random AP≈0.500
pos rate  9.1%: ROC-AUC=0.837  AP=0.677  random AP≈0.091
pos rate  2.5%: ROC-AUC=0.837  AP=0.576  random AP≈0.025</div>
  <p>ROC-AUC hardly moves as negatives pile up, because FPR divides by the huge TN count. Precision feels every extra false alarm, so AP falls from 0.878 to 0.576.</p>
  <table class="tbl">
    <tr><th>Use</th><th>When</th></tr>
    <tr><td><strong>ROC-AUC</strong></td><td>Classes roughly balanced; you care about ranking both; comparing datasets with different positive rates</td></tr>
    <tr><td><strong>PR-AUC / AP</strong></td><td>Positives rare (&lt; ~10%: fraud, disease, defects) and you act on the flagged ones</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Both only judge ranking. Neither tells you how the model does at the threshold you actually use. Compare AP to its baseline (the positive rate), not to 0.5.</p>
  </div>

  <h2 id="me-ll"><span class="num">04</span>Log Loss &amp; Calibration</h2>
  <p>Two weather apps both said "it will rain" yesterday, and it did. App A had said 55%. App B had said 99%. Both were "right", but B deserves more credit: it was sure and right. Had it <em>not</em> rained, B would deserve much more blame. Accuracy cannot tell the apps apart. <strong>Log loss</strong> can: it scores the probability itself, not just the final yes/no.</p>
  <p>For a row where the true answer is 1, the loss is −log(p), where p is the probability the model gave. Watch how it grows as the model gets more wrong:</p>
  <div class="fx" data-lang="py">from sklearn.metrics import log_loss
for q in [0.9, 0.5, 0.1, 0.01]:
    print(f"true=1, p={q:&lt;4}: loss={-np.log(q):.3f}")
print("log_loss of all four:", round(log_loss([1, 1, 1, 1], [0.9, 0.5, 0.1, 0.01], labels=[0, 1]), 3))</div>
  <div class="fx" data-lang="text">true=1, p=0.9 : loss=0.105
true=1, p=0.5 : loss=0.693
true=1, p=0.1 : loss=2.303
true=1, p=0.01: loss=4.605
log_loss of all four: 1.927</div>
  <p>Saying 0.9 for a real positive costs 0.105. Saying 0.01 (sure it's negative, and wrong) costs 4.6, forty times more. Log loss is the average over all rows. It punishes confident mistakes very hard.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Log loss</strong> = −mean(y·log p + (1−y)·log(1−p)). For each row only one of the two terms is active: if y = 1 the loss is −log p; if y = 0 it is −log(1−p), the same thing measured from the other side. Sure and right = tiny loss. Sure and wrong = huge loss. 0.693 = always saying 0.5. It is the training loss of logistic regression and most neural classifiers.</p>
  </div>
  <h3>Calibration: do the probabilities mean what they say?</h3>
  <p>Take every case the model scored around 0.8. If the model is honest, about 80% of them should turn out positive. That property is called <strong>calibration</strong>. A model can rank perfectly (high AUC) and still give wrong probabilities: for example, always saying 0.99 for positives and 0.6 for negatives ranks perfectly, but "0.6" is a lie.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A weather app. If its "70% rain" days get rain 7 times out of 10, it is calibrated. If they get rain 9 times out of 10, the ranking of days may be fine but the number lies.</p>
  </div>
  <p><code>calibration_curve</code> does exactly the check above: it groups rows into bins by predicted probability and reports, per bin, the average prediction and the real share of positives. Below, four models on the same data. "pred→actual" pairs should match if the model is calibrated.</p>
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
    <li><strong>Logistic regression</strong>: 0.71→0.79, 0.95→0.95. Close to honest, as usual for this model.</li>
    <li><strong>Naive Bayes</strong>: overconfident (says 0.97, right 90%; says 0.02, wrong 7% of the time). Isotonic calibration fixes it: log loss 0.377 → 0.296, same AUC, because calibration only re-maps the numbers and never changes the order.</li>
    <li><strong>Random forest</strong>: under-confident; averaging many trees pulls scores to the middle (says 0.29, truly 0.12). Still the best ranker here (AUC 0.992).</li>
    <li><strong>Brier score</strong> = mean((p − y)²): the squared gap between the probability and the 0/1 truth. Lower is better; mixes calibration and ranking.</li>
    <li><strong>Fix</strong>: <code>CalibratedClassifierCV(method="sigmoid")</code> (Platt, small data) or <code>"isotonic"</code> (flexible, needs more data), fit on data the model didn't train on.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Calibration matters when the probability itself is used: expected-loss maths, risk scores, cost-based thresholds. It never changes AUC; it only fixes the numbers.</p>
  </div>

  <h2 id="me-thr"><span class="num">05</span>Threshold Tuning</h2>
  <p>A bank guard has to decide whom to check at the door. Check everyone: no fraud gets in, but huge queues and angry customers. Check no one: no queue, lots of fraud. Where the guard draws the line is a business decision, not a maths fact.</p>
  <p>The model gives a probability. The <strong>threshold</strong> turns it into an action ("block if p ≥ t"). sklearn's <code>predict</code> uses 0.5, but nothing says 0.5 is right. In section 03, threshold 0.7 caught 2 of 3 frauds with no false alarms; threshold 0.2 caught all 3 with 2 false alarms. The right t depends on what each mistake costs.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank guard deciding whom to check. Check everyone: no fraud gets in, but huge queues. Check no one: no queue, lots of fraud. The threshold is where you draw the line.</p>
  </div>
  <div class="flow"><span>Model scores p</span><span>Pick threshold t on validation</span><span>p ≥ t → act</span><span>Re-check as data drifts</span></div>
  <p>Two ways to pick t, back on the fraud model from section 01. <code>precision_recall_curve</code> returns precision and recall at every possible threshold at once.</p>
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
    <li><strong>Rule-based</strong>: "we must catch at least 60% of fraud". The lowest threshold that does it is 0.10, and it costs 244 false alarms.</li>
    <li><strong>Cost-based</strong>: at 0.5, cost = 500 × 161 misses + 20 × 6 false alarms = 80,620. Searching every threshold, 0.08 is cheapest at 53,960. Moving the threshold from 0.5 to 0.08 cuts total cost by a third, with no change to the model.</li>
    <li>The formula <code>t* = C_FP / (C_FP + C_FN)</code> (cost of a false alarm ÷ sum of both costs) assumes perfect probabilities; the search lands nearby (0.04–0.08 cost about the same).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choose the threshold on validation data (or out-of-fold predictions), then confirm once on test. Tuning it on test is just another leak. sklearn 1.5+ has <code>TunedThresholdClassifierCV</code> to do this inside CV.</p>
  </div>

  <h2 id="me-reg"><span class="num">06</span>Regression Metrics</h2>
  <p>A tiffin service guesses how many orders will come each day. Three days: real orders 100, 120, 90; guesses 110, 115, 60. How wrong was it? There are several honest answers, and each one highlights something different.</p>
  <div class="fx" data-lang="py">import numpy as np
y    = np.array([100, 120, 90])      # real tiffin orders on 3 days
yhat = np.array([110, 115, 60])      # model's guesses
e = y - yhat
print("errors:", e)
print(f"MAE  = mean|e|          = {np.abs(e).mean():.1f}")
print(f"RMSE = sqrt(mean(e^2))  = {np.sqrt((e**2).mean()):.1f}")
print(f"MAPE = mean|e/y| x 100  = {np.mean(np.abs(e/y))*100:.1f}%")
print(f"R2   = 1 - SSres/SStot  = {1 - (e**2).sum()/((y-y.mean())**2).sum():.2f}")</div>
  <div class="fx" data-lang="text">errors: [-10   5  30]
MAE  = mean|e|          = 15.0
RMSE = sqrt(mean(e^2))  = 18.5
MAPE = mean|e/y| x 100  = 15.8%
R2   = 1 - SSres/SStot  = -1.20</div>
  <ul>
    <li><strong>MAE</strong> (mean absolute error): (10 + 5 + 30) / 3 = 15. "We are off by about 15 tiffins a day." Easiest to explain.</li>
    <li><strong>RMSE</strong> (root mean squared error): square each miss, average, square-root: √((100 + 25 + 900) / 3) = 18.5. The 30-tiffin miss contributes 900 of the 1,025, so RMSE is pulled up by big misses. RMSE is always ≥ MAE; a big gap between them means a few huge errors.</li>
    <li><strong>MAPE</strong> (mean absolute percentage error): each miss as a % of the real value, averaged: (10% + 4.2% + 33.3%) / 3 = 15.8%. Good for comparing a 100-tiffin shop to a 10,000-tiffin kitchen.</li>
    <li><strong>R²</strong>: compares your misses to the misses of the dumbest model, "always guess the average" (103.3 here). R² = 1 means perfect, 0 means no better than the average, and negative means <em>worse</em> than the average. −1.20 here: that one bad day made the model worse than a flat guess.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tiffin service guessing daily orders. MAE: "we are off by about 5 tiffins a day". RMSE: one day off by 60 hurts far more than ten days off by 6. MAPE: "off by 5%", fine until a holiday with 1 order.</p>
  </div>
  <p>Now the same metrics on eight days, in four situations, to see how each metric reacts. sMAPE and WAPE are two safer cousins of MAPE, explained in the table after.</p>
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
one big miss MAE= 11.8 RMSE= 21.7 R2=-2.024 MAPE=   9.9% sMAPE=  9.8% WAPE= 10.9%
predict mean MAE= 10.6 RMSE= 12.5 R2= 0.000 MAPE=   9.9% sMAPE=  9.8% WAPE=  9.8%
near-zero y  MAE=  4.4 RMSE=  4.7 R2= 0.983 MAPE=  15.2% sMAPE= 11.5% WAPE=  4.6%</div>
  <p>Line by line. "All small": every metric agrees, about 5 tiffins or 5%. "One big miss": MAE doubles but RMSE jumps 4×, and R² goes negative. "Predict mean": R² is exactly 0, by definition. "Near-zero y": one night with 0.5 real orders, guessed as 1.0, is a 100% error on that row; it triples MAPE (4.6% → 15.2%) while MAE barely moves. WAPE stays calm.</p>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Use when</th><th>Watch out</th></tr>
    <tr><td><strong>MAE</strong></td><td>mean|y − ŷ|</td><td>Each unit of error costs the same; outliers are noise; easy to explain</td><td>Best constant is the median</td></tr>
    <tr><td><strong>RMSE</strong></td><td>√mean(y − ŷ)²</td><td>Big misses are much worse; matches MSE training</td><td>One miss made it 4× (4.9 → 21.7)</td></tr>
    <tr><td><strong>R²</strong></td><td>1 − SS_res / SS_tot</td><td>Share of variation explained; compare models on one dataset. SS_res = sum of squared misses; SS_tot = the same for "always guess the mean"</td><td>Negative = worse than predicting the mean</td></tr>
    <tr><td><strong>MAPE</strong></td><td>mean|e / y| × 100</td><td>% error, to compare series of different sizes</td><td>Blows up near y = 0; undefined at 0; favours under-forecasts</td></tr>
    <tr><td><strong>sMAPE</strong></td><td>mean 2|e| / (|y| + |ŷ|)</td><td>MAPE when values get small (divides by the average of truth and guess)</td><td>Capped at 200%, still odd near 0</td></tr>
    <tr><td><strong>WAPE</strong></td><td>Σ|e| / Σ|y|</td><td>Demand / load forecasting; total miss ÷ total volume, so big days count more</td><td>Hides errors on small items</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One night reading of 0.5 MW predicted as 1.0 MW is a 100% error. It tripled MAPE (4.6% → 15.2%) while MAE hardly moved. Use WAPE, sMAPE, or skip values below a written-down floor. If RMSE ≫ MAE, a few big misses dominate: look at them.</p>
  </div>

  <h2 id="me-biz"><span class="num">07</span>Metrics from Business Costs</h2>
  <p>Nobody tunes a smoke alarm for accuracy. A false alarm costs a minute of irritation; a missed fire costs the house. So the alarm is set to go off early, and everybody accepts the odd false alarm. Every ML metric is just a stand-in for a cost like that. The right way round is: write down what each mistake costs first, then pick the metric that follows those costs.</p>
  <div class="flow"><span>Decision the model drives</span><span>Cost of FP, FN (or of error size)</span><span>Offline metric that tracks that cost</span><span>Threshold / model choice</span><span>A/B test the business KPI</span></div>
  <p>For the fraud model, the cost table might look like this. Each cell is "what happens when the model says X and the truth is Y":</p>
  <table class="tbl">
    <tr><th></th><th>Predicted legit</th><th>Predicted fraud</th></tr>
    <tr><td><strong>Actual legit</strong></td><td>0</td><td>₹20 review + annoyed customer</td></tr>
    <tr><td><strong>Actual fraud</strong></td><td>Lost amount (avg ₹500)</td><td>₹20 review</td></tr>
  </table>
  <p>This is exactly the table section 05 used to find the best threshold (0.08, not 0.5). Below are common cases where the standard ML metric quietly points the wrong way:</p>
  <table class="tbl">
    <tr><th>Mismatch</th><th>Why the ML metric misleads</th><th>Better</th></tr>
    <tr><td>Fraud ranked by ROC-AUC</td><td>A missed ₹100 and a missed ₹10 lakh fraud count the same</td><td>Value-weighted recall, expected loss saved</td></tr>
    <tr><td>Load forecast on MAPE</td><td>2 am error (low impact) weighs as much as 6 pm peak (grid risk)</td><td>WAPE or hour-weighted error</td></tr>
    <tr><td>Recommender on CTR</td><td>Clickbait wins clicks, loses trust (CTR = click-through rate)</td><td>Retention, watch time, long-term value</td></tr>
    <tr><td>Churn model on F1</td><td>Ignores that a retention offer costs money</td><td>Profit curve: (saved value − offer cost) per threshold</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A smoke alarm. A false alarm costs a minute of irritation; a missed fire costs the house. Nobody tunes it for "accuracy".</p>
  </div>
  <p>The last step in the flow is the <strong>A/B test</strong>: show the new model to a random half of users, the old one to the other half, and compare the real business number (money saved, orders, retention). Offline metrics only tell you which models are worth testing.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A better offline score can still lose live (stand-in ≠ goal, feedback loops, changed data). Offline metrics shortlist models; the A/B test on the business number decides.</p>
  </div>

  <h2 id="me-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>10 lumps, 3 are cancer. The model flags 2: one real cancer, one harmless. Accuracy, precision, recall?</summary><div class="qa-body">TP = 1, FP = 1, FN = 2, TN = 6. Accuracy = 7/10 = 0.70. Precision = 1/2 = 0.50. Recall = 1/3 = 0.33. The 70% hides that two of three cancers were missed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your fraud model has 98.3% accuracy. Good?</summary><div class="qa-body">Can't say until you see the baseline and confusion matrix. With 2.5% fraud, always saying "legit" gives 97.5%. Our model at 0.5 caught only 88 of 249 frauds (recall 0.353). Report precision, recall, PR-AUC and the cost at the chosen threshold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>TP = 88, FP = 6, FN = 161, TN = 9,745. Compute precision, recall, F1.</summary><div class="qa-body">Precision = 88/94 = 0.936. Recall = 88/249 = 0.353. F1 = 2·0.936·0.353/(0.936+0.353) = 0.513.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you prefer PR-AUC over ROC-AUC?</summary><div class="qa-body">When positives are rare (under ~10%) and you act on the flagged cases. FPR = FP/(FP+TN) stays tiny because TN is huge: at FPR 2.5% our alerts were 62% false. ROC-AUC stayed ≈ 0.83 from 50% to 2.5% positives while AP fell 0.878 → 0.576. Compare AP with the positive rate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ROC-AUC = 0.8 mean in plain words?</summary><div class="qa-body">Pick one random positive and one random negative: 80% of the time the model scores the positive higher. It only measures ranking; it doesn't depend on the threshold or on calibration.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is log loss used instead of accuracy for probabilistic models?</summary><div class="qa-body">It uses the probability, not just the yes/no, and it is smooth, so gradient descent can use it. It rewards honest confidence: a sure-but-wrong p = 0.01 for a positive costs 4.6 vs 0.105 for p = 0.9. Its best value comes from calibrated probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is calibration and how do you fix a badly calibrated model?</summary><div class="qa-body">Predicted probabilities match how often things really happen. Check with <code>calibration_curve</code> (reliability plot) and Brier score. Fix after training with <code>CalibratedClassifierCV</code>: sigmoid (Platt) for small data, isotonic for more data, on held-out folds. Naive Bayes is usually overconfident, random forests under-confident, logistic regression close.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A missed fraud costs 500, a false alarm 20. How do you set the threshold?</summary><div class="qa-body">Minimise 500·FN + 20·FP over thresholds on validation predictions. With calibrated probabilities the optimum is t* = 20/(20+500) ≈ 0.04. In our demo the search found 0.08, cutting cost from 80,620 (at 0.5) to 53,960.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RMSE vs MAE: which, and what does a big gap between them tell you?</summary><div class="qa-body">MAE when every unit of error costs the same or outliers are noise. RMSE when big misses hurt much more, or to match an MSE-trained model. RMSE ≫ MAE means a few big errors dominate (one 60-unit miss took RMSE 4.9 → 21.7, MAE only 4.9 → 11.8).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can R² be negative? What does it mean?</summary><div class="qa-body">Yes, on data the model wasn't trained on. R² = 1 − SS_res/SS_tot, so negative means the model is worse than just predicting the mean. One big miss gave R² = −2.02 in the demo.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is MAPE dangerous for electricity load or sales forecasting?</summary><div class="qa-body">It divides by the actual value. Near-zero actuals (night load, slow items) give huge percentages that swamp the average (one 0.5 MW reading took MAPE from 4.6% to 15.2%). It is undefined at 0 and punishes over-forecasts more than under-forecasts. Use WAPE, sMAPE or a written-down floor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model wins offline but the business KPI doesn't move. Why?</summary><div class="qa-body">The offline metric doesn't follow real value (AUC ignores fraud amount, CTR ignores satisfaction); the threshold wasn't set by cost; the evaluation split leaked or doesn't match live data; or probabilities are uncalibrated for later decisions. Define costs first and confirm with an A/B test.</div></details>
</main>`
});
