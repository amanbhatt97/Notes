// notes/ml/ml_calibration.js — Thresholds & Calibration
Object.assign(TOPIC_CONTENT, {
  "ml_calibration": `<main>
  <h1>Thresholds &amp; Calibration</h1>
  <div class="where"><span>Machine Learning</span><span>Model Evaluation</span><span>Thresholds &amp; Calibration</span></div>
  <p class="lead">A classifier hands you a score, but the business needs two other things: a <em>decision</em> ("block this card or not?") and often an honest <em>probability</em> ("what is the expected fraud loss on this batch?"). The first is a question of where to put the <strong>threshold</strong> that turns scores into yes/no; the second is a question of <strong>calibration</strong>, whether a model's "0.8" really comes true 80% of the time. Getting them wrong is expensive: on the fraud data below, the same model costs ₹80,620 at the default threshold and ₹54,260 at a well-chosen one. We will use the running example from <a class="xref" data-note="ml_evaluation">Classification Metrics</a>, the 10 scored card transactions with 4 frauds, first to choose thresholds by hand and then to check and repair the probabilities, and larger synthetic fraud datasets to show the same ideas at realistic scale.</p>

  <h2 id="tc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Thresholds &amp; Calibration</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Scores vs probabilities</div>
        <ul>
          <li>A score only has to <b>rank</b>; a probability must also come true at its stated rate</li>
          <li>Increasing transforms keep AUC but change every decision at 0.5</li>
          <li>0.5 is a default, not a decision</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing the threshold</div>
        <ul>
          <li>Sweep t, minimise C_FN·FN + C_FP·FP</li>
          <li>Calibrated p: <b>t* = C_FP / (C_FP + C_FN)</b></li>
          <li>No costs: Youden's J, F1-optimal, recall floor, top-k</li>
          <li>Tune by CV: <code>TunedThresholdClassifierCV</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Measuring calibration</div>
        <ul>
          <li><b>Reliability diagram</b>: mean p vs observed rate per bin</li>
          <li><b>ECE</b> = weighted mean |gap|; <b>MCE</b> = worst gap</li>
          <li><b>Brier</b> = reliability − resolution + uncertainty</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fixing calibration</div>
        <ul>
          <li><b>Platt</b>: σ(a·s + b); <b>isotonic</b>: monotone steps; <b>temperature</b>: logit / T</li>
          <li>Always on rows the model did not train on: <code>CalibratedClassifierCV</code></li>
          <li>NB, boosting over-confident; forests under-confident; re-weighting inflates p</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tc-scores"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Scores vs Probabilities</span><span class="rm-sub">ranking is not honesty; 0.5 is arbitrary</span></div></div>
      <div class="rm-item rm-done" data-target="tc-cost"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Choosing the Threshold from Costs</span><span class="rm-sub">a sweep by hand, and the formula t*</span></div></div>
      <div class="rm-item rm-done" data-target="tc-nocost"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Thresholds Without Costs</span><span class="rm-sub">Youden's J, F1, recall floors, prevalence</span></div></div>
      <div class="rm-item rm-done" data-target="tc-tune"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Tuning the Threshold Safely</span><span class="rm-sub">cross-validated threshold choice</span></div></div>
      <div class="rm-item rm-done" data-target="tc-reliab"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Reliability Diagrams and ECE</span><span class="rm-sub">checking whether probabilities come true</span></div></div>
      <div class="rm-item rm-done" data-target="tc-brier"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Brier Score Decomposition</span><span class="rm-sub">honest vs useful</span></div></div>
      <div class="rm-item rm-done" data-target="tc-platt"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Platt Scaling</span><span class="rm-sub">a sigmoid fitted on the score</span></div></div>
      <div class="rm-item rm-done" data-target="tc-iso"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Isotonic Regression</span><span class="rm-sub">any monotone repair, by pooling</span></div></div>
      <div class="rm-item rm-done" data-target="tc-cccv"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Calibrating Without Leaking</span><span class="rm-sub">CalibratedClassifierCV, FrozenEstimator, temperature</span></div></div>
      <div class="rm-item rm-done" data-target="tc-why"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Which Models Are Miscalibrated, and Why</span><span class="rm-sub">NB, forests, boosting, SVM, re-weighting</span></div></div>
      <div class="rm-item rm-done" data-target="tc-flow"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">The Full Workflow</span><span class="rm-sub">calibrate first, threshold second</span></div></div>
      <div class="rm-item rm-done" data-target="tc-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">calibrating on training rows, t* on raw scores</span></div></div>
      <div class="rm-item rm-done" data-target="tc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, methods, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="tc-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="tc-scores"><span class="num">01</span>Scores vs Probabilities</h2>
  <p>In Classification Metrics we judged the 10 transactions at threshold 0.5 and found an ROC-AUC of 0.875. We never asked two questions: does T3's score of 0.80 mean "an 80% chance of fraud", and why should 0.5 be the cut-off at all? Here is the data again, kept in the same small module:</p>
  <div class="fx" data-lang="py"># ten.py - the 10 transactions used all through this note
import numpy as np
ids   = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"]
score = np.array([0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10])  # model's fraud score
y     = np.array([1,    1,    0,    1,    0,    1,    0,    0,    0,    0   ])  # 1 = really fraud

if __name__ == "__main__":
    print(len(y), "transactions,", y.sum(), "frauds")</div>
  <div class="fx" data-lang="text">10 transactions, 4 frauds</div>
  <p>A model's output can do two different jobs. Used as a <strong>score</strong>, it only has to <em>rank</em>: frauds should sit above legitimate rows, and that is what AUC measures. Used as a <strong>probability</strong>, it must also be <em>honest</em>: among all transactions given 0.80, about 80% should turn out to be fraud. That honesty is called <strong>calibration</strong>. More precisely, a model is calibrated if, for every value q, the rows it gives probability q are positive a fraction q of the time. A model can be excellent at ranking and poor at calibration, as this shows:</p>
  <div class="fx" data-lang="py"># three models that RANK the 10 transactions identically, but report different numbers
from ten import score, y
from sklearn.metrics import roc_auc_score

versions = {"model A (as given)": score,
            "model B = score²": score ** 2,
            "model C = squashed": 0.3 + 0.4 * score}
for name, s in versions.items():
    print(f"{name:20s} T1={s[0]:.2f} T3={s[2]:.2f} T6={s[5]:.2f}  AUC={roc_auc_score(y, s):.3f}  "
          f"flagged at 0.5: {int((s &gt;= 0.5).sum())}")</div>
  <div class="fx" data-lang="text">model A (as given)   T1=0.95 T3=0.80 T6=0.45  AUC=0.875  flagged at 0.5: 5
model B = score²     T1=0.90 T3=0.64 T6=0.20  AUC=0.875  flagged at 0.5: 3
model C = squashed   T1=0.68 T3=0.62 T6=0.48  AUC=0.875  flagged at 0.5: 5</div>
  <p>Squaring the scores, or squashing them into the range 0.34 to 0.68, is an increasing transformation: every row keeps its place in the order, so AUC stays 0.875 for all three. But the numbers change, T1 being 0.95, 0.90 or 0.68 depending on the version, and so does what happens at 0.5: model B flags only 3 rows while A and C flag 5. If the numbers can be bent like this without changing the ranking, then "0.5" has no special meaning unless the numbers really are probabilities. Think of two weather apps that both rank tomorrow as rainier than today. One says "70% rain" on days when it rains 7 times in 10; the other says "95%" on those same days. They are equally good at ranking days, but only the first one's number can be used to decide whether to cancel an outdoor wedding.</p>
  <p>Which property you need depends on what the output is used for. Sorting a review queue and checking the top 100 needs only ranking. But automatically blocking a card using a cost-based threshold, computing expected loss as p × amount, combining a model with other models or rules, or showing a risk to a human ("30% chance of readmission") all need calibrated probabilities as well. And beware: <code>predict_proba</code> is a method name, not a promise. Random forests, boosting and Naive Bayes all return numbers from <code>predict_proba</code> that rank well but are not calibrated by default, and an SVM's <code>decision_function</code> is not a probability at all (section 10). The first half of this note chooses thresholds; the second half checks and repairs the probabilities.</p>

  <h2 id="tc-cost"><span class="num">02</span>Choosing the Threshold from Costs</h2>
  <p>If 0.5 is arbitrary, some other threshold has to be chosen, and the most defensible way is from what mistakes cost. As in Classification Metrics, a missed fraud costs the bank about ₹500 and a review of a flagged transaction costs ₹20. For any threshold we can count the misses (FN) and false alarms (FP) and price them. Only thresholds equal to one of the scores matter, because between two scores nothing changes, so we try each one, plus "flag nothing":</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import score, y
C_FN, C_FP = 500, 20                       # a missed fraud costs ₹500, a review ₹20

print("threshold  FN FP   cost = 500·FN + 20·FP")
for t in np.r_[np.inf, score]:             # "flag nothing", then each score in turn
    flag = score &gt;= t
    fn, fp = int((~flag &amp; (y == 1)).sum()), int((flag &amp; (y == 0)).sum())
    print(f"{t:&gt;9.2f}  {fn:2d} {fp:2d}   ₹{C_FN * fn + C_FP * fp:,}")
print(f"formula for calibrated p: t* = 20/520 = {C_FP / (C_FP + C_FN):.4f}")</div>
  <div class="fx" data-lang="text">threshold  FN FP   cost = 500·FN + 20·FP
      inf   4  0   ₹2,000
     0.95   3  0   ₹1,500
     0.85   2  0   ₹1,000
     0.80   2  1   ₹1,020
     0.70   1  1   ₹520
     0.55   1  2   ₹540
     0.45   0  2   ₹40
     0.40   0  3   ₹60
     0.30   0  4   ₹80
     0.20   0  5   ₹100
     0.10   0  6   ₹120
formula for calibrated p: t* = 20/520 = 0.0385</div>
  <p>Walk down the table. Flagging nothing misses all 4 frauds and costs ₹2,000. Each time the threshold passes a fraud, one miss disappears and ₹500 is saved; each time it passes a legit row, ₹20 is added. Lowering t from 0.55 to 0.45 adds T6, the last fraud, and saves ₹500; below that only legit rows are left, each adding ₹20. So the cheapest cut-off is <strong>0.45</strong>, costing ₹40, against ₹540 at the default 0.5: the same model, a decision thirteen times cheaper. The figure draws this cost curve as the threshold moves from 1 down to 0.</p>
  <figure class="viz"><svg viewBox="0 0 640 260" width="640">
<line x1="70" y1="215" x2="590" y2="215" stroke="currentColor" opacity="0.5"/>
<line x1="70" y1="25" x2="70" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="65" y="218.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="67" y1="215" x2="70" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="65" y="171" text-anchor="end" class="tm" font-size="10.5">500</text>
<line x1="67" y1="167.5" x2="70" y2="167.5" stroke="currentColor" opacity="0.5"/>
<text x="65" y="123.5" text-anchor="end" class="tm" font-size="10.5">1000</text>
<line x1="67" y1="120" x2="70" y2="120" stroke="currentColor" opacity="0.5"/>
<text x="65" y="76" text-anchor="end" class="tm" font-size="10.5">1500</text>
<line x1="67" y1="72.5" x2="70" y2="72.5" stroke="currentColor" opacity="0.5"/>
<text x="65" y="28.5" text-anchor="end" class="tm" font-size="10.5">2000</text>
<line x1="67" y1="25" x2="70" y2="25" stroke="currentColor" opacity="0.5"/>
<text x="330" y="245" text-anchor="middle" class="tm" font-size="11">threshold t (flag if score ≥ t) — lower t flags more rows →</text>
<text x="24" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 24 120)">cost (₹)</text>
<text x="70" y="229" text-anchor="middle" class="tm" font-size="10.5">1</text>
<text x="174" y="229" text-anchor="middle" class="tm" font-size="10.5">0.8</text>
<text x="278" y="229" text-anchor="middle" class="tm" font-size="10.5">0.6</text>
<text x="382" y="229" text-anchor="middle" class="tm" font-size="10.5">0.4</text>
<text x="486" y="229" text-anchor="middle" class="tm" font-size="10.5">0.2</text>
<text x="590" y="229" text-anchor="middle" class="tm" font-size="10.5">0</text>
<polyline points="70,25 96,25 96,72.5 148,72.5 148,120 174,120 174,118.1 226,118.1 226,165.6 304,165.6 304,163.7 356,163.7 356,211.2 382,211.2 382,209.3 434,209.3 434,207.4 486,207.4 486,205.5 538,205.5 538,203.6 590,203.6" fill="none" class="sr" stroke-width="2.5"/>
<circle cx="356" cy="211.2" r="5" class="fg sg"/><text x="350" y="201.2" text-anchor="end" class="tg" font-size="11">best: t = 0.45, ₹40</text>
<circle cx="304" cy="163.7" r="5" class="fb sb"/><text x="298" y="153.7" text-anchor="end" class="tb" font-size="11">default t = 0.5: ₹540</text>
<text x="85.6" y="41" class="tm" font-size="11">flag nothing: 4 misses × 500</text>
<text x="408" y="196" class="tm" font-size="11">flag more: +₹20 per legit row</text>
</svg><figcaption>Total cost on the 10 rows as the threshold moves from 1 (flag nothing) to 0 (flag everything). Every fraud caught saves ₹500; every legit row flagged adds ₹20. The minimum is at t = 0.45, just low enough to catch T6.</figcaption></figure>
  <p>When the scores are honest probabilities, the best threshold can be worked out with no search at all. Take one transaction with probability p of being fraud and compare the expected cost of the two actions. If we pass it, we lose ₹500 with probability p, so the expected cost is 500p. If we flag it, we pay ₹20 when it turns out legit, with probability 1 − p, so the expected cost is 20(1 − p). (A caught fraud is also reviewed, but every flagged fraud pays that, so we leave it out as in the table.) Flagging is the better action when 500p &gt; 20(1 − p), that is 520p &gt; 20, that is p &gt; 20/520 = 0.038. In general, the cost-optimal threshold is <strong>t* = C_FP / (C_FP + C_FN)</strong>. With equal costs it is exactly 0.5, which is the hidden assumption behind <code>predict()</code>. When a miss costs 25 times a false alarm, you should flag anything above about 4%. Think of carrying an umbrella: if getting soaked is 25 times as bad as carrying an unused umbrella, you should carry it whenever the chance of rain is above 1 in 26, not only when rain is "more likely than not".</p>
  <p>But notice the disagreement: the formula says 0.038, while the table says 0.45. At 0.038 we would flag all 10 rows and pay ₹120. The reason is that the formula assumes the scores are calibrated probabilities, and ours are not: T7 to T10 scored between 0.10 and 0.40 and none of them was fraud, so at the low end these scores overstate the risk. The search works with any score, because it only uses the ranking; the formula needs calibration first, which is what the second half of this note provides. And one more caution: picking t on the same 10 rows we then report the cost on is optimistic, since 0.45 is perfect here partly by luck. Section 04 fixes that.</p>

  <h2 id="tc-nocost"><span class="num">03</span>Thresholds Without Costs</h2>
  <p>Often the business cannot or will not put a rupee value on a miss. We still need a defensible rule, and we should know what cost assumption each rule secretly makes. The table below computes, for every threshold on the 10 rows, the quantities the common rules use:</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import score, y

print("threshold  TPR   FPR   J=TPR-FPR  precision   F1")
for t in score:
    flag = score &gt;= t
    tp, fp = (flag &amp; (y == 1)).sum(), (flag &amp; (y == 0)).sum()
    tpr, fpr, prec = tp / 4, fp / 6, tp / (tp + fp)
    print(f"{t:&gt;9.2f}  {tpr:.2f}  {fpr:.2f}     {tpr - fpr:5.3f}     {prec:.3f}  {2 * prec * tpr / (prec + tpr):.3f}")</div>
  <div class="fx" data-lang="text">threshold  TPR   FPR   J=TPR-FPR  precision   F1
     0.95  0.25  0.00     0.250     1.000  0.400
     0.85  0.50  0.00     0.500     1.000  0.667
     0.80  0.50  0.17     0.333     0.667  0.571
     0.70  0.75  0.17     0.583     0.750  0.750
     0.55  0.75  0.33     0.417     0.600  0.667
     0.45  1.00  0.33     0.667     0.667  0.800
     0.40  1.00  0.50     0.500     0.571  0.727
     0.30  1.00  0.67     0.333     0.500  0.667
     0.20  1.00  0.83     0.167     0.444  0.615
     0.10  1.00  1.00     0.000     0.400  0.571</div>
  <p><strong>Youden's J</strong> is TPR − FPR, equivalently sensitivity + specificity − 1, and the rule is to pick the threshold that maximises it. At t = 0.45, TPR = 1.00 and FPR = 2/6, so J = 0.667, the largest in the table. Geometrically it is the ROC point that sits highest above the diagonal, the same number credit-risk teams call the KS statistic, and maximising J is the same as maximising balanced accuracy, (1 + J)/2. Its hidden assumption is that a missed positive and a false alarm cost the same <em>relative to their class sizes</em>, that is, a miss costs N/P times a false alarm (here 6/4).</p>
  <p>The <strong>F1-optimal threshold</strong> simply takes the threshold with the largest F1. At t = 0.45 precision is 4/6 and recall 1, so F1 = 0.80, the best value. Its hidden assumption is the one F1 always makes: true negatives are worth nothing and a false positive costs the same as a false negative.</p>
  <p>A <strong>recall floor</strong> is a common business rule: "we must catch at least 75% of fraud; among thresholds that do, pick the one with the best precision". Thresholds of 0.70 and below reach recall 0.75, and the best precision among them is 0.75 at <strong>t = 0.70</strong>. The mirror rule, "precision at least X, then maximise recall", suits teams with little review staff. And when capacity is fixed, say the team can check exactly 3 transactions a day, the threshold is just the 3rd highest score (0.80), the quality measure is precision among the top 3 (2/3 here), and no probability is needed at all. A school choosing a pass mark faces the same menu: pass the students who maximise correct pass/fail calls, pass enough that 75% of truly ready students get through, or admit only the 30 who fit next year's seats. Each is reasonable and each encodes a different priority. On these 10 rows three rules happened to agree on 0.45; on real data they usually do not.</p>
  <p>Every threshold is an <strong>operating point</strong>, one (precision, recall) or (FPR, TPR) pair, and the PR and ROC curves of Classification Metrics are just these menus drawn as pictures. As t goes down, recall can only rise, because we flag a growing set of rows. Precision usually falls, but not steadily: it jumps up whenever the newly flagged row is a fraud (0.667 to 0.750 at T4). Lowering t moves rows from "pass" to "flag"; a fraud moves from FN to TP, raising both recall and precision, while a legit row moves from TN to FP, leaving recall unchanged and lowering precision. Below the scores where frauds live, only legit rows remain, so precision slides towards the base rate of 0.40.</p>
  <p>One property of this trade-off often surprises people in production. TPR and FPR at a threshold do not depend on how common fraud is, but precision does: precision = TPR·π / (TPR·π + FPR·(1 − π)), where π is the fraud rate. At t = 0.45 (TPR 1, FPR 1/3) with π = 0.4, precision = 0.4/(0.4 + 0.2) = 0.667, as in the table. If fraud in production is only 4%, precision = 0.04/(0.04 + 0.32) = 0.11: same model, same threshold, nine false alarms for every catch. A fishing net with a finer mesh catches every fish but more weeds, and in a lake with fewer fish the same mesh brings up mostly weeds. So a threshold chosen on a balanced or resampled dataset must be re-checked at the real prevalence.</p>

  <h2 id="tc-tune"><span class="num">04</span>Tuning the Threshold Safely</h2>
  <p>On 10 rows, t = 0.45 looked perfect partly by luck, and we "tuned" it on the same rows we scored. On real data we need a threshold chosen without touching the test set, and then an honest test-set result. The safe procedure is the same one used for any hyperparameter: choose it with cross-validation on the training data. scikit-learn's <code>TunedThresholdClassifierCV</code> does exactly that. Inside each fold it fits the model on the training part, scores the held-out part at many thresholds, and keeps the threshold with the best average score; then it refits the model on all training data and stores the chosen value in <code>best_threshold_</code>. Its partner <code>FixedThresholdClassifier</code> simply applies a threshold you give it, for example t* from the formula. Here is the larger fraud dataset from Classification Metrics, 20,000 transactions with about 2.5% fraud:</p>
  <div class="fx" data-lang="py"># fraud.py - a realistic imbalanced dataset: 20,000 transactions, about 2.5% fraud
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
X, y = make_classification(n_samples=20000, n_features=20, n_informative=5,
                           weights=[0.98], flip_y=0.01, class_sep=0.8, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.5, stratify=y, random_state=0)
model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
p_te = model.predict_proba(X_te)[:, 1]          # fraud probability for each test row

if __name__ == "__main__":
    print(f"test rows {len(y_te)}, frauds {y_te.sum()}, fraud rate {y_te.mean():.4f}")</div>
  <div class="fx" data-lang="text">test rows 10000, frauds 249, fraud rate 0.0249</div>
  <div class="fx" data-lang="py">from fraud import X_tr, y_tr, X_te, y_te
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import TunedThresholdClassifierCV, FixedThresholdClassifier, StratifiedKFold
from sklearn.metrics import make_scorer, confusion_matrix

def rupee_cost(y_true, y_pred):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return 500 * fn + 20 * fp
cost = make_scorer(rupee_cost, greater_is_better=False)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
lr = lambda: LogisticRegression(max_iter=1000)

def report(name, clf):
    tn, fp, fn, tp = confusion_matrix(y_te, clf.predict(X_te)).ravel()
    print(f"{name:33s} TP={tp:3d} FP={fp:4d} FN={fn:3d}  cost=₹{500 * fn + 20 * fp:,}")

report("default predict (t=0.5)", lr().fit(X_tr, y_tr))
for name, scoring in [("tuned for cost", cost), ("tuned for F1", "f1"), ("tuned for balanced acc", "balanced_accuracy")]:
    tuned = TunedThresholdClassifierCV(lr(), scoring=scoring, cv=cv).fit(X_tr, y_tr)
    report(f"{name} (t={tuned.best_threshold_:.3f})", tuned)
report("fixed t* = 20/520 = 0.038", FixedThresholdClassifier(lr(), threshold=20 / 520).fit(X_tr, y_tr))</div>
  <div class="fx" data-lang="text">default predict (t=0.5)           TP= 88 FP=   6 FN=161  cost=₹80,620
tuned for cost (t=0.070)          TP=159 FP= 463 FN= 90  cost=₹54,260
tuned for F1 (t=0.221)            TP=126 FP=  48 FN=123  cost=₹62,460
tuned for balanced acc (t=0.050)  TP=170 FP= 783 FN= 79  cost=₹55,160
fixed t* = 20/520 = 0.038         TP=174 FP=1110 FN= 75  cost=₹59,700</div>
  <p>The default threshold costs ₹80,620 on the test set: high precision, but 161 frauds missed. Tuning for the rupee cost picks t = 0.07 and costs ₹54,260, a third less, from the same model. It accepts 463 false alarms to catch 71 more frauds, exactly the 25-to-1 trade the costs ask for. Tuning for F1 picks t = 0.22 and looks balanced, but costs ₹62,460, because F1's "a false positive costs the same as a false negative" is wrong for this business. Tuning for balanced accuracy (the same as Youden's J) lands near the cost optimum, ₹55,160, because the class ratio N/P ≈ 39 happens to be close to the true cost ratio of 25. The formula t* = 0.038 comes reasonably close too (₹59,700), because logistic regression is nearly calibrated, but it over-flags slightly; with a badly calibrated model the gap would be far larger. Think of setting a cricket team's batting order in the nets and then playing the match: if you rearranged the order after seeing the scorecard, the result would no longer say anything about your selection skill. Two practical warnings: threshold tuning changes <code>predict</code>, not <code>predict_proba</code>, so downstream code that applies its own 0.5 to the probabilities silently ignores it; and when prevalence or costs change in production, the threshold must be tuned again.</p>

  <h2 id="tc-reliab"><span class="num">05</span>Reliability Diagrams and ECE</h2>
  <p>The formula t* only works if, when the model says 0.75, fraud really happens about 75% of the time. A single prediction cannot be checked: T3 got 0.80 and was legit, but an honest 80% forecast is wrong one time in five. So we group rows with similar predictions and compare each group's <strong>average prediction</strong> (its "confidence") with its <strong>observed positive rate</strong>. If the model is calibrated, the two match in every group. Checking a weather forecaster works the same way: collect all the days she said "70%" and count how many had rain, then the "30%" days, and so on; one day proves nothing, but a year of days shows whether her percentages mean anything. With 5 bins of width 0.2:</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import ids, score, y
from sklearn.calibration import calibration_curve

edges = np.array([0, 0.2, 0.4, 0.6, 0.8, 1.0])
b = np.searchsorted(edges[1:-1], score)              # bins (0,0.2], (0.2,0.4], ... as sklearn does
print("bin          rows     mean p  observed  gap")
ece, mce = 0, 0
for k in range(5):
    m = b == k
    conf, obs = score[m].mean(), y[m].mean()
    gap = abs(obs - conf); ece += m.mean() * gap; mce = max(mce, gap)
    rows = " ".join(i for i, mm in zip(ids, m) if mm)
    print(f"({edges[k]:.1f}, {edges[k+1]:.1f}]  {rows:7s}   {conf:.3f}    {obs:.3f}   {gap:.3f}")
print(f"ECE = {ece:.3f}   MCE = {mce:.3f}")
frac, mean = calibration_curve(y, score, n_bins=5)   # returns (observed, mean predicted)
print("sklearn calibration_curve: mean p", mean.round(3), " observed", frac.round(3))</div>
  <div class="fx" data-lang="text">bin          rows     mean p  observed  gap
(0.0, 0.2]  T9 T10    0.150    0.000   0.150
(0.2, 0.4]  T7 T8     0.350    0.000   0.350
(0.4, 0.6]  T5 T6     0.500    0.500   0.000
(0.6, 0.8]  T3 T4     0.750    0.500   0.250
(0.8, 1.0]  T1 T2     0.900    1.000   0.100
ECE = 0.170   MCE = 0.350
sklearn calibration_curve: mean p [0.15 0.35 0.5  0.75 0.9 ]  observed [0.  0.  0.5 0.5 1. ]</div>
  <p>Each bin happens to hold two rows. In the lowest bin, T9 and T10 average 0.15 but neither was fraud: the model said 15% and reality was 0%. The next bin, T7 and T8, said 35% and reality was 0%, the biggest gap. T5 and T6 said 50% and one of the two was fraud: perfect. T3 and T4 said 75% and reality was 50%. T1 and T2 said 90% and both were fraud. Plotting observed rate against mean prediction gives the <strong>reliability diagram</strong>, or calibration curve, where the diagonal is perfect calibration. In the figure, the red sticks on the left are the gaps, and the bars on the right are their sizes.</p>
  <figure class="viz"><svg viewBox="0 0 640 280" width="640">
<line x1="70" y1="225" x2="270" y2="225" stroke="currentColor" opacity="0.5"/>
<line x1="70" y1="25" x2="70" y2="225" stroke="currentColor" opacity="0.5"/>
<text x="70" y="239" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="70" y1="225" x2="70" y2="228" stroke="currentColor" opacity="0.5"/>
<text x="110" y="239" text-anchor="middle" class="tm" font-size="10.5">.2</text>
<line x1="110" y1="225" x2="110" y2="228" stroke="currentColor" opacity="0.5"/>
<text x="150" y="239" text-anchor="middle" class="tm" font-size="10.5">.4</text>
<line x1="150" y1="225" x2="150" y2="228" stroke="currentColor" opacity="0.5"/>
<text x="190" y="239" text-anchor="middle" class="tm" font-size="10.5">.6</text>
<line x1="190" y1="225" x2="190" y2="228" stroke="currentColor" opacity="0.5"/>
<text x="230" y="239" text-anchor="middle" class="tm" font-size="10.5">.8</text>
<line x1="230" y1="225" x2="230" y2="228" stroke="currentColor" opacity="0.5"/>
<text x="270" y="239" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="270" y1="225" x2="270" y2="228" stroke="currentColor" opacity="0.5"/>
<text x="65" y="228.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="67" y1="225" x2="70" y2="225" stroke="currentColor" opacity="0.5"/>
<text x="65" y="128.5" text-anchor="end" class="tm" font-size="10.5">.5</text>
<line x1="67" y1="125" x2="70" y2="125" stroke="currentColor" opacity="0.5"/>
<text x="65" y="28.5" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="67" y1="25" x2="70" y2="25" stroke="currentColor" opacity="0.5"/>
<polyline points="70,225 270,25" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
<polyline points="100,225 140,225 170,125 220,125 250,25" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="100" cy="225" r="3" class="fb"/>
<circle cx="140" cy="225" r="3" class="fb"/>
<circle cx="170" cy="125" r="3" class="fb"/>
<circle cx="220" cy="125" r="3" class="fb"/>
<circle cx="250" cy="25" r="3" class="fb"/>
<text x="170" y="255" text-anchor="middle" class="tm" font-size="11">mean predicted p in bin</text>
<text x="30" y="125" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 30 125)">observed fraud rate</text>
<text x="170" y="17" text-anchor="middle" font-size="12.5" font-weight="700">Reliability diagram, 10 rows</text>
<line x1="100" y1="195" x2="100" y2="225" class="sr" stroke-width="2"/>
<line x1="140" y1="155" x2="140" y2="225" class="sr" stroke-width="2"/>
<line x1="220" y1="75" x2="220" y2="125" class="sr" stroke-width="2"/>
<line x1="250" y1="45" x2="250" y2="25" class="sr" stroke-width="2"/>
<text x="156" y="195" class="tr" font-size="10.5">gap 0.35</text>
<text x="80" y="45" class="tm" font-size="10.5">dashed: perfect</text>
<rect x="380" y="150" width="36" height="75" class="fr sr"/>
<text x="398" y="145" text-anchor="middle" font-size="10.5">0.15</text>
<text x="398" y="239" text-anchor="middle" class="tm" font-size="10">bin 1</text>
<rect x="428" y="50" width="36" height="175" class="fr sr"/>
<text x="446" y="45" text-anchor="middle" font-size="10.5">0.35</text>
<text x="446" y="239" text-anchor="middle" class="tm" font-size="10">bin 2</text>
<rect x="476" y="225" width="36" height="0" class="fr sr"/>
<text x="494" y="220" text-anchor="middle" font-size="10.5">0.00</text>
<text x="494" y="239" text-anchor="middle" class="tm" font-size="10">bin 3</text>
<rect x="524" y="100" width="36" height="125" class="fr sr"/>
<text x="542" y="95" text-anchor="middle" font-size="10.5">0.25</text>
<text x="542" y="239" text-anchor="middle" class="tm" font-size="10">bin 4</text>
<rect x="572" y="175" width="36" height="50" class="fr sr"/>
<text x="590" y="170" text-anchor="middle" font-size="10.5">0.10</text>
<text x="590" y="239" text-anchor="middle" class="tm" font-size="10">bin 5</text>
<line x1="376" y1="225" x2="620" y2="225" stroke="currentColor" opacity="0.5"/>
<text x="498" y="17" text-anchor="middle" font-size="12.5" font-weight="700">|gap| per bin (2 rows each)</text>
<text x="498" y="259" text-anchor="middle" class="tr" font-size="11.5">ECE = 0.2 × (.15+.35+0+.25+.10) = 0.17</text>
</svg><figcaption>Left: the reliability diagram of the 10 transactions. Red sticks are the gaps between what the model said and what happened. Right: the size of each gap; their row-weighted average is the ECE of section 08.</figcaption></figure>
  <p>The shape of the curve tells you how the model is wrong. A point <em>below</em> the diagonal means the model's p is too high there; a point <em>above</em> means it is too low. An <strong>over-confident</strong> model, one whose probabilities are too close to 0 and 1, sits above the diagonal at the low end and below it at the high end, so its curve is flatter than the diagonal. An <strong>under-confident</strong> model, too close to 0.5, shows the reverse. Note the order of <code>calibration_curve</code>'s return values: (observed, mean predicted), the reverse of what many people expect. It also uses bins of the form (a, b], silently drops empty bins, and with 10 rows every gap is mostly noise: a real reliability diagram needs hundreds of rows per bin, and with fraud scores piled near 0, equal-count bins (<code>strategy="quantile"</code>) are more stable than equal-width ones.</p>
  <p>A picture is hard to compare across models, so two summary numbers are common. The <strong>expected calibration error</strong> (ECE) averages the absolute gaps, weighting each bin by its share of the rows: ECE = Σ (n_b/n) · |observed_b − mean p_b| = 0.2 × (0.15 + 0.35 + 0 + 0.25 + 0.10) = 0.17. The <strong>maximum calibration error</strong> (MCE) is the largest gap, 0.35. In words: "on average the stated fraud probability is 17 percentage points away from the real rate; in the worst group, 35 points." Think of a shop's scales checked with test weights: ECE is the average error across all the weights, MCE the error on the worst one. ECE depends on the number and kind of bins (10 to 15 is common), and it is not a proper scoring rule: a model that always predicts the base rate has ECE close to 0 and is useless. So use ECE to <em>diagnose</em> calibration, and log loss or Brier to <em>compare</em> models.</p>

  <h2 id="tc-brier"><span class="num">06</span>The Brier Score Decomposition</h2>
  <p>A model that always predicts the base rate, 0.4, would sit exactly on the diagonal and still be useless, because it cannot tell one transaction from another. A good probability needs two qualities: it must be honest, and it must separate risky rows from safe ones. The Brier score from Classification Metrics, the mean of (p − y)², which is 0.166 on our rows, rewards both, and Allan Murphy showed in 1973 how to split it into parts that say which quality is weak. Using the same bins (n_b rows in bin b, mean prediction conf_b, observed rate obs_b, overall rate ȳ = 0.4):</p>
  <p>Brier ≈ Reliability − Resolution + Uncertainty</p>
  <table class="tbl">
    <tr><th>Term</th><th>Formula</th><th>10 rows</th><th>Want it</th></tr>
    <tr><td>Reliability (calibration error)</td><td>Σ (n_b/n)(conf_b − obs_b)²</td><td>0.2 × (0.15² + 0.35² + 0 + 0.25² + 0.10²) = 0.0435</td><td>small</td></tr>
    <tr><td>Resolution (separation)</td><td>Σ (n_b/n)(obs_b − ȳ)²</td><td>0.2 × (0.4² + 0.4² + 0.1² + 0.1² + 0.6²) = 0.140</td><td>large</td></tr>
    <tr><td>Uncertainty (difficulty)</td><td>ȳ(1 − ȳ)</td><td>0.4 × 0.6 = 0.240</td><td>fixed by the data</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
from ten import score, y
from sklearn.metrics import brier_score_loss

b = np.searchsorted([0.2, 0.4, 0.6, 0.8], score)
rel = sum((b == k).mean() * (score[b == k].mean() - y[b == k].mean()) ** 2 for k in range(5))
res = sum((b == k).mean() * (y[b == k].mean() - y.mean()) ** 2 for k in range(5))
unc = y.mean() * (1 - y.mean())
print(f"Brier = {brier_score_loss(y, score):.4f}")
print(f"reliability {rel:.4f} - resolution {res:.4f} + uncertainty {unc:.4f} = {rel - res + unc:.4f}")
print(f"Brier skill score = 1 - Brier/uncertainty = {1 - brier_score_loss(y, score) / unc:.3f}")</div>
  <div class="fx" data-lang="text">Brier = 0.1660
reliability 0.0435 - resolution 0.1400 + uncertainty 0.2400 = 0.1435
Brier skill score = 1 - Brier/uncertainty = 0.308</div>
  <p>The three terms give 0.1435, close to the true Brier score of 0.166; the remaining 0.0225 comes from predictions varying inside each bin, since the decomposition is exact only when every row in a bin has the same p. <strong>Uncertainty</strong> is how hard the problem is, and no model changes it: it equals the Brier score of always predicting the base rate. <strong>Resolution</strong> measures how far the bins' real fraud rates are from the base rate, which is the model's ability to separate risky rows from safe ones; a constant forecast has resolution 0. <strong>Reliability</strong> is the calibration penalty, and it is the term that recalibration attacks while leaving resolution mostly untouched; better features are what raise resolution. Think of a forecaster's marks as "how hard was the climate", minus "how well she told rainy days from dry ones", plus "how wrong her percentages were". The <strong>Brier skill score</strong>, 1 − Brier / uncertainty = 0.308 here, is the share of the base-rate forecast's error removed, the probability version of R² in <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>. Because uncertainty depends on the base rate, Brier scores are only comparable at the same base rate.</p>

  <h2 id="tc-platt"><span class="num">07</span>Platt Scaling</h2>
  <p>The scores of the 10 transactions rank well (AUC 0.875) but are 17 points off on average. We would like to keep the ranking and replace each score with an honest probability. Think of a thermometer that reads consistently too high: you do not rebuild it, you fit a correction curve from a few known temperatures. <strong>Platt scaling</strong>, proposed by John Platt in 1999 to turn SVM outputs into probabilities, uses one particular correction curve, a sigmoid applied to the score s:</p>
  <p>p_calibrated = σ(a·s + b) = 1 / (1 + e^−(a·s + b))</p>
  <p>Only two numbers are learnt. The slope a stretches or squeezes: a large a spreads probabilities towards 0 and 1, a small one pulls them towards the middle. The intercept b shifts them up or down. Since σ is increasing (for a &gt; 0), the order of the rows, and therefore AUC, is unchanged. In fact Platt scaling is just a logistic regression with a single input, the model's score (<a class="xref" data-note="ml_classification">Logistic Regression</a>), and a and b are chosen to minimise log loss on rows the model did not train on. Platt added one trick against overfitting: instead of the targets 1 and 0, use slightly softened targets, (N₊ + 1)/(N₊ + 2) for positives and 1/(N₋ + 2) for negatives, where N₊ and N₋ are the class counts. With 4 frauds and 6 legit rows these are 5/6 = 0.833 and 1/8 = 0.125. The code fits it from scratch:</p>
  <div class="fx" data-lang="py"># Platt scaling from scratch on the 10 rows: p = sigmoid(a·score + b)
import numpy as np
from scipy.optimize import minimize
from ten import ids, score, y
from sklearn.metrics import log_loss, brier_score_loss

n_pos, n_neg = y.sum(), (1 - y).sum()
target = np.where(y == 1, (n_pos + 1) / (n_pos + 2), 1 / (n_neg + 2))   # Platt's soft labels: 5/6 and 1/8

def loss(ab):
    p = np.clip(1 / (1 + np.exp(-(ab[0] * score + ab[1]))), 1e-12, 1 - 1e-12)
    return -np.mean(target * np.log(p) + (1 - target) * np.log(1 - p))
a, b = minimize(loss, x0=[1.0, 0.0], method="BFGS").x
print(f"a = {a:.3f}, b = {b:.3f}")

p_platt = 1 / (1 + np.exp(-(a * score + b)))
print("Platt p for T1..T10:", np.round(p_platt, 3))
for name, p in [("raw scores", score), ("Platt", p_platt)]:
    print(f"{name:10s} log loss {log_loss(y, p):.4f}   Brier {brier_score_loss(y, p):.4f}")</div>
  <div class="fx" data-lang="text">a = 3.690, b = -2.416
Platt p for T1..T10: [0.748 0.673 0.631 0.542 0.405 0.32  0.281 0.213 0.157 0.114]
raw scores log loss 0.4973   Brier 0.1660
Platt      log loss 0.4817   Brier 0.1567</div>
  <p>The fit gives a = 3.69 and b = −2.42. Check T1 by hand: 3.69 × 0.95 − 2.42 = 1.09, and σ(1.09) = 1/(1 + e^−1.09) = 1/(1 + 0.336) = 0.748, matching the first printed value. The mapping pulls the extremes in (0.95 becomes 0.75, 0.10 becomes 0.11), because the soft targets and the tiny sample make the sigmoid cautious, and the order of the rows is unchanged. Log loss falls from 0.497 to 0.482 and Brier from 0.166 to 0.157. These gains are optimistic, because we fitted and evaluated on the same 10 rows; section 09 does it properly. Platt scaling works well with small calibration sets and with S-shaped distortions, typical of SVMs and boosting. Its limit is that it can only bend probabilities along one sigmoid: if the reliability curve has another shape, for example over-confident at one end only, Platt cannot fix it, and it can even slightly damage a model that was already calibrated.</p>

  <h2 id="tc-iso"><span class="num">08</span>Isotonic Regression</h2>
  <p>Our reliability diagram (0.15 → 0, 0.35 → 0, 0.5 → 0.5, 0.75 → 0.5, 0.9 → 1) is not obviously S-shaped. We want the most flexible correction that still never breaks the rule "higher score means higher probability". <strong>Isotonic regression</strong> finds exactly that: the non-decreasing step function of the score that is closest, in squared error, to the 0/1 labels. "Isotonic" means "order-preserving"; apart from being non-decreasing, the shape is completely free.</p>
  <p>It is computed by an algorithm called <strong>Pool Adjacent Violators</strong> (PAV). Sort the rows by score, lowest first, and write down their labels: T10 0, T9 0, T8 0, T7 0, T6 1, T5 0, T4 1, T3 0, T2 1, T1 1. Walk from left to right. Whenever a value is larger than the next one, a "violation" of non-decreasing order, replace both by their average, and re-check to the left, because pooling can create a new violation there. Think of marking a path up a hill where you may only go up or stay level as you walk right: wherever the ground dips, you fill the dip with the average height of the dip and its neighbour.</p>
  <div class="fx" data-lang="py"># isotonic regression by Pool-Adjacent-Violators (PAV), from scratch, on the 10 rows
import numpy as np
from ten import ids, score, y
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import roc_auc_score

order = np.argsort(score)                                # lowest score first
blocks = [[float(y[i]), 1, [ids[i]]] for i in order]     # [mean, size, rows]
print("start :", " ".join(f"{b[0]:.0f}" for b in blocks))
i = 0
while i &lt; len(blocks) - 1:
    if blocks[i][0] &gt; blocks[i + 1][0]:                  # violation: a higher value before a lower one
        (m1, n1, r1), (m2, n2, r2) = blocks[i], blocks[i + 1]
        blocks[i:i + 2] = [[(m1 * n1 + m2 * n2) / (n1 + n2), n1 + n2, r1 + r2]]   # pool them
        print(f"pool {'+'.join(r1)} with {'+'.join(r2)} -&gt; " + " ".join(f"{b[0]:.2f}" for b in blocks))
        i = max(i - 1, 0)                                # pooling can create a violation to the left
    else:
        i += 1
iso = IsotonicRegression(out_of_bounds="clip").fit(score, y)
print("sklearn, T1..T10:", " ".join(f"{v:.2f}" for v in iso.predict(score)))
print(f"AUC raw {roc_auc_score(y, score):.3f} -&gt; isotonic {roc_auc_score(y, iso.predict(score)):.3f}")</div>
  <div class="fx" data-lang="text">start : 0 0 0 0 1 0 1 0 1 1
pool T6 with T5 -&gt; 0.00 0.00 0.00 0.00 0.50 1.00 0.00 1.00 1.00
pool T4 with T3 -&gt; 0.00 0.00 0.00 0.00 0.50 0.50 1.00 1.00
sklearn, T1..T10: 1.00 1.00 0.50 0.50 0.50 0.50 0.00 0.00 0.00 0.00
AUC raw 0.875 -&gt; isotonic 0.917</div>
  <p>The first violation is T6 (1) followed by T5 (0); pooling them gives 0.5 and 0.5. The next is T4 (1) followed by T3 (0); pooling gives 0.5 and 0.5. Now the sequence 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 1, 1 never goes down, so the algorithm stops. The calibrated probabilities are 0 for T7 to T10, 0.5 for T3 to T6 and 1 for T1 and T2, and scikit-learn's <code>IsotonicRegression</code> gives the same values.</p>
  <p>Three things deserve attention. The four middle rows now <strong>tie</strong>, so AUC changed from 0.875 to 0.917: pairs that were wrongly ordered are now tied and earn half credit. Isotonic calibration keeps the ranking only up to ties. The outputs 0 and 1 are <strong>certainties</strong> learnt from two to four rows each: a new transaction scoring 0.35 would get probability exactly 0, and if it turned out to be fraud, its log loss would be infinite. And with this much freedom, isotonic regression overfits small data badly; it needs many held-out rows, roughly a thousand or more, to be trusted. So the rule of thumb is: Platt for small calibration sets and S-shaped distortions, isotonic for large sets and arbitrary monotone distortions.</p>

  <h2 id="tc-cccv"><span class="num">09</span>Calibrating Without Leaking</h2>
  <p>Sections 07 and 08 fitted the calibrator on the same 10 rows they evaluated, which is cheating. Worse, a calibrator must never be fitted on the rows the <em>model</em> trained on: a model that has memorised its training data gives near-perfect scores there, so the calibrator learns "trust the model completely". The calibrator must learn from scores the model produced on rows it never saw. To see this clearly we need more data, so here is a fraud-like dataset with 20% positives, split into 4,000 training and 4,000 test rows, plus a three-line ECE helper:</p>
  <div class="fx" data-lang="py"># calib_data.py - a medium-sized fraud-like dataset (20% positives) for comparing calibration
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
X, y = make_classification(n_samples=8000, n_features=20, n_informative=6, n_redundant=6,
                           weights=[0.8], random_state=1)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.5, stratify=y, random_state=0)

def ece(y, p, bins=10):
    """expected calibration error with equal-width bins"""
    b = np.minimum((p * bins).astype(int), bins - 1)
    return sum(abs(y[b == k].mean() - p[b == k].mean()) * (b == k).mean() for k in range(bins) if (b == k).any())

if __name__ == "__main__":
    print(len(y_tr), "training rows,", len(y_te), "test rows, positive rate", round(y.mean(), 3))</div>
  <div class="fx" data-lang="text">4000 training rows, 4000 test rows, positive rate 0.203</div>
  <p>The first way to get unseen rows without wasting data is cross-validation inside the calibrator. <code>CalibratedClassifierCV(model, method=..., cv=5)</code> splits the training data into 5 folds; for each fold it trains a copy of the model on the other 4, scores the held-out fold, and fits a calibrator on those out-of-fold scores. With <code>ensemble=True</code> (what the default does for an unfrozen model) it keeps all 5 (model, calibrator) pairs and averages their calibrated probabilities, which is robust but 5 times the prediction cost. With <code>ensemble=False</code> it fits one calibrator on all the out-of-fold scores and refits one model on all the data, which is cheaper at prediction time and is the recommended way to get probabilities from an SVM, replacing <code>SVC(probability=True)</code>, which is deprecated in this version of scikit-learn.</p>
  <div class="fx" data-lang="py">from calib_data import X_tr, y_tr, X_te, y_te, ece
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, log_loss

def show(name, m):
    p = m.fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
    print(f"{name:36s} AUC={roc_auc_score(y_te, p):.3f}  logloss={log_loss(y_te, p):.3f}  ECE={ece(y_te, p):.3f}")

show("GaussianNB (raw)", GaussianNB())
show("GaussianNB + sigmoid, cv=5", CalibratedClassifierCV(GaussianNB(), method="sigmoid", cv=5))
show("GaussianNB + isotonic, cv=5", CalibratedClassifierCV(GaussianNB(), method="isotonic", cv=5))
rf = RandomForestClassifier(200, random_state=0, n_jobs=1)
show("RandomForest (raw)", rf)
show("RandomForest + isotonic, cv=5", CalibratedClassifierCV(rf, method="isotonic", cv=5))
show("SVC + sigmoid, cv=5, ensemble=False", CalibratedClassifierCV(SVC(), method="sigmoid", cv=5, ensemble=False))</div>
  <div class="fx" data-lang="text">GaussianNB (raw)                     AUC=0.951  logloss=0.272  ECE=0.046
GaussianNB + sigmoid, cv=5           AUC=0.951  logloss=0.235  ECE=0.014
GaussianNB + isotonic, cv=5          AUC=0.951  logloss=0.222  ECE=0.017
RandomForest (raw)                   AUC=0.978  logloss=0.167  ECE=0.032
RandomForest + isotonic, cv=5        AUC=0.978  logloss=0.152  ECE=0.007
SVC + sigmoid, cv=5, ensemble=False  AUC=0.980  logloss=0.125  ECE=0.009</div>
  <p>For Naive Bayes, Platt cuts ECE from 0.046 to 0.014 and isotonic cuts log loss from 0.272 to 0.222. For the random forest, isotonic cuts ECE from 0.032 to 0.007. For the SVC, which has no probabilities of its own, Platt on out-of-fold distances gives the best log loss in the table, 0.125. In every case AUC is unchanged to three decimals: calibration repairs the numbers, not the ranking.</p>
  <p>The second way applies when a model is already trained, or too expensive to retrain: hold back a separate calibration set, freeze the model so it is not refitted, and fit only the calibrator. <code>FrozenEstimator</code> does the freezing (it replaces the old <code>cv="prefit"</code>). This is also the place to meet <strong>temperature scaling</strong>, which divides the model's logit (the log-odds before the sigmoid or softmax) by one learnt number T; T &gt; 1 softens over-confident outputs. It is the standard fix for neural networks and multiclass models, because one parameter cannot change which class has the highest probability.</p>
  <div class="fx" data-lang="py"># an already-trained model + a separate calibration set: freeze the model, fit only the calibrator
from calib_data import X_tr, y_tr, X_te, y_te, ece
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.frozen import FrozenEstimator
from sklearn.metrics import roc_auc_score, log_loss

X_fit, X_cal, y_fit, y_cal = train_test_split(X_tr, y_tr, test_size=0.3, stratify=y_tr, random_state=0)
gbm = HistGradientBoostingClassifier(max_iter=300, early_stopping=False, random_state=0).fit(X_fit, y_fit)

def show(name, m):
    p = m.predict_proba(X_te)[:, 1]
    print(f"{name:22s} AUC={roc_auc_score(y_te, p):.3f}  logloss={log_loss(y_te, p):.3f}  ECE={ece(y_te, p):.3f}")
show("boosting (raw)", gbm)
for method in ["sigmoid", "isotonic", "temperature"]:
    show(f"+ {method} on X_cal", CalibratedClassifierCV(FrozenEstimator(gbm), method=method).fit(X_cal, y_cal))</div>
  <div class="fx" data-lang="text">boosting (raw)         AUC=0.976  logloss=0.283  ECE=0.038
+ sigmoid on X_cal     AUC=0.976  logloss=0.136  ECE=0.010
+ isotonic on X_cal    AUC=0.975  logloss=0.154  ECE=0.013
+ temperature on X_cal AUC=0.976  logloss=0.136  ECE=0.009</div>
  <p>Three hundred rounds of boosting without early stopping produce over-confident probabilities: log loss 0.283 despite AUC 0.976. Fitting a calibrator on 1,200 held-out rows halves the log loss to 0.136 and cuts ECE to about 0.01. Sigmoid and temperature agree closely for a binary problem, since temperature scaling is Platt scaling with no shift, applied to the logit; isotonic is slightly worse because 1,200 rows is not much for a step function, and its ties lower AUC a little (0.976 to 0.975). Calibrating a new thermometer against a reference you did not use to build it is the analogy to keep: testing it against the very bath you used to set it up tells you nothing. A clean data plan is therefore: train the model on the training split, fit the calibrator (and choose the threshold) on a calibration or validation split or by cross-validation, and report once on the test split.</p>

  <h2 id="tc-why"><span class="num">10</span>Which Models Are Miscalibrated, and Why</h2>
  <p>Logistic regression needed no repair, Naive Bayes and boosting did, and the forest needed a different kind of repair. Knowing why lets you predict trouble before looking. Here are four models on the same 4,000 test rows, each with its reliability curve in 5 bins written as "said → observed":</p>
  <div class="fx" data-lang="py">from calib_data import X_tr, y_tr, X_te, y_te, ece
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.calibration import calibration_curve
from sklearn.metrics import roc_auc_score, log_loss

models = {"LogisticRegression": LogisticRegression(max_iter=1000),
          "GaussianNB": GaussianNB(),
          "RandomForest": RandomForestClassifier(200, random_state=0, n_jobs=1),
          "HistGradientBoosting": HistGradientBoostingClassifier(max_iter=300, early_stopping=False, random_state=0)}
for name, m in models.items():
    p = m.fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
    frac, mean = calibration_curve(y_te, p, n_bins=5)
    print(f"{name:20s} AUC={roc_auc_score(y_te, p):.3f} logloss={log_loss(y_te, p):.3f} ECE={ece(y_te, p):.3f}")
    print(f"{'':20s} said→observed: " + "  ".join(f"{a:.2f}→{b:.2f}" for a, b in zip(mean, frac)))</div>
  <div class="fx" data-lang="text">LogisticRegression   AUC=0.961 logloss=0.191 ECE=0.013
                     said→observed: 0.02→0.03  0.29→0.27  0.50→0.56  0.70→0.73  0.93→0.93
GaussianNB           AUC=0.951 logloss=0.272 ECE=0.046
                     said→observed: 0.02→0.03  0.29→0.22  0.49→0.35  0.71→0.55  0.96→0.83
RandomForest         AUC=0.978 logloss=0.167 ECE=0.032
                     said→observed: 0.03→0.01  0.29→0.21  0.49→0.55  0.71→0.86  0.92→0.98
HistGradientBoosting AUC=0.978 logloss=0.242 ECE=0.033
                     said→observed: 0.00→0.03  0.29→0.49  0.48→0.63  0.72→0.64  0.99→0.93</div>
  <p>Logistic regression is close to the diagonal everywhere (0.70 → 0.73, ECE 0.013), because it directly minimises log loss, a proper scoring rule, with a sigmoid output; heavy regularisation or a badly wrong model can still spoil this. Naive Bayes is <strong>over-confident</strong>: when it says 0.96 the real rate is 0.83, because it multiplies the evidence from each feature as if the features were independent, so correlated features are counted several times and push probabilities towards 0 and 1. The random forest is <strong>under-confident</strong>: when it says 0.71 the real rate is 0.86, and when it says 0.29 the real rate is 0.21, because averaging many trees rarely produces all-0 or all-1 votes, and bootstrap and feature sampling add noise that pulls extremes inwards. Boosting with many rounds is over-confident in a different way: it keeps pushing the margins of rows it already gets right, so its log loss (0.242) is far worse than the forest's despite the same AUC of 0.978. SVMs produce a signed distance from the boundary, not a probability, and need Platt scaling. Single trees and kNN give coarse fractions such as 0/5 or 5/5, so they output many probabilities of exactly 0 or 1. The figure shows the four reliability curves (with 8 bins): logistic regression follows the diagonal, and the others bend in these characteristic ways.</p>
  <figure class="viz"><svg viewBox="0 0 640 290" width="640">
<line x1="80" y1="245" x2="300" y2="245" stroke="currentColor" opacity="0.5"/>
<line x1="80" y1="25" x2="80" y2="245" stroke="currentColor" opacity="0.5"/>
<text x="80" y="259" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="80" y1="245" x2="80" y2="248" stroke="currentColor" opacity="0.5"/>
<text x="190" y="259" text-anchor="middle" class="tm" font-size="10.5">.5</text>
<line x1="190" y1="245" x2="190" y2="248" stroke="currentColor" opacity="0.5"/>
<text x="300" y="259" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="300" y1="245" x2="300" y2="248" stroke="currentColor" opacity="0.5"/>
<text x="75" y="248.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="77" y1="245" x2="80" y2="245" stroke="currentColor" opacity="0.5"/>
<text x="75" y="138.5" text-anchor="end" class="tm" font-size="10.5">.5</text>
<line x1="77" y1="135" x2="80" y2="135" stroke="currentColor" opacity="0.5"/>
<text x="75" y="28.5" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="77" y1="25" x2="80" y2="25" stroke="currentColor" opacity="0.5"/>
<polyline points="80,245 300,25" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
<polyline points="83.8,240.6 119.2,215.5 147.8,173.5 177.3,137.2 205.4,102.6 230.4,91 259.9,61.2 289.7,36.5" fill="none" class="sb" stroke-width="2.2"/>
<circle cx="83.8" cy="240.6" r="3" class="fb"/>
<circle cx="119.2" cy="215.5" r="3" class="fb"/>
<circle cx="147.8" cy="173.5" r="3" class="fb"/>
<circle cx="177.3" cy="137.2" r="3" class="fb"/>
<circle cx="205.4" cy="102.6" r="3" class="fb"/>
<circle cx="230.4" cy="91" r="3" class="fb"/>
<circle cx="259.9" cy="61.2" r="3" class="fb"/>
<circle cx="289.7" cy="36.5" r="3" class="fb"/>
<polyline points="82.3,239.6 120.2,201 148,188.4 176.2,176.1 202.7,157 231.2,128.5 259.8,95.8 294.5,59.3" fill="none" class="sr" stroke-width="2.2"/>
<circle cx="82.3" cy="239.6" r="3" class="fr"/>
<circle cx="120.2" cy="201" r="3" class="fr"/>
<circle cx="148" cy="188.4" r="3" class="fr"/>
<circle cx="176.2" cy="176.1" r="3" class="fr"/>
<circle cx="202.7" cy="157" r="3" class="fr"/>
<circle cx="231.2" cy="128.5" r="3" class="fr"/>
<circle cx="259.8" cy="95.8" r="3" class="fr"/>
<circle cx="294.5" cy="59.3" r="3" class="fr"/>
<polyline points="84.9,243 119.6,214.4 149.4,197.3 176.1,149.4 205.8,107.9 231.5,51.8 260.7,39.4 288.1,28.5" fill="none" class="sg" stroke-width="2.2"/>
<circle cx="84.9" cy="243" r="3" class="fg"/>
<circle cx="119.6" cy="214.4" r="3" class="fg"/>
<circle cx="149.4" cy="197.3" r="3" class="fg"/>
<circle cx="176.1" cy="149.4" r="3" class="fg"/>
<circle cx="205.8" cy="107.9" r="3" class="fg"/>
<circle cx="231.5" cy="51.8" r="3" class="fg"/>
<circle cx="260.7" cy="39.4" r="3" class="fg"/>
<circle cx="288.1" cy="28.5" r="3" class="fg"/>
<polyline points="80.3,239.4 122,162.5 147.7,135 176.8,114.6 202.6,93.8 229.8,126.5 256.6,106.5 298.8,37.9" fill="none" class="st" stroke-width="2.2"/>
<circle cx="80.3" cy="239.4" r="3" class="ft"/>
<circle cx="122" cy="162.5" r="3" class="ft"/>
<circle cx="147.7" cy="135" r="3" class="ft"/>
<circle cx="176.8" cy="114.6" r="3" class="ft"/>
<circle cx="202.6" cy="93.8" r="3" class="ft"/>
<circle cx="229.8" cy="126.5" r="3" class="ft"/>
<circle cx="256.6" cy="106.5" r="3" class="ft"/>
<circle cx="298.8" cy="37.9" r="3" class="ft"/>
<text x="190" y="275" text-anchor="middle" class="tm" font-size="11">mean predicted probability</text>
<text x="40" y="135" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 40 135)">observed positive rate</text>
<line x1="350" y1="50" x2="374" y2="50" class="sb" stroke-width="3"/><text x="382" y="54" font-size="11.5">LogReg</text>
<line x1="350" y1="72" x2="374" y2="72" class="sr" stroke-width="3"/><text x="382" y="76" font-size="11.5">NaiveBayes</text>
<line x1="350" y1="94" x2="374" y2="94" class="sg" stroke-width="3"/><text x="382" y="98" font-size="11.5">RandomForest</text>
<line x1="350" y1="116" x2="374" y2="116" class="st" stroke-width="3"/><text x="382" y="120" font-size="11.5">Boosting</text>
<text x="350" y="150" class="tm" font-size="10.5">below the diagonal: p too high</text>
<text x="350" y="166" class="tm" font-size="10.5">above the diagonal: p too low</text>
<text x="350" y="182" class="tm" font-size="10.5"></text>
<text x="350" y="198" class="tm" font-size="10.5">LogReg: on the diagonal</text>
<text x="350" y="214" class="tm" font-size="10.5">NaiveBayes: too high in upper half</text>
<text x="350" y="230" class="tm" font-size="10.5">Forest: low end too high, top too</text>
<text x="350" y="246" class="tm" font-size="10.5">  low (under-confident, S-shape)</text>
<text x="350" y="262" class="tm" font-size="10.5">Boosting: the reverse (over-confident)</text>
</svg><figcaption>Reliability curves of four models on the same 4,000 test rows (8 equal-width bins). Logistic regression follows the diagonal; the others bend in characteristic ways.</figcaption></figure>
  <p>One more source of miscalibration is self-inflicted. Training with <code>class_weight="balanced"</code>, undersampling or SMOTE makes the model learn as if positives were common, so its probabilities come out too high. If you know the real positive rate π and the rate the model effectively trained at, π′ (0.5 for balanced weighting), Bayes' rule moves each probability back by rescaling the odds:</p>
  <p>p_corrected = p·(π/π′) / [ p·(π/π′) + (1 − p)·(1 − π)/(1 − π′) ]</p>
  <p>By hand, with π = 0.2 and π′ = 0.5, a balanced model's 0.80 becomes 0.8 × 0.4 / (0.8 × 0.4 + 0.2 × 1.6) = 0.32/0.64 = 0.50. A doctor trained in a cancer ward, where half the patients have cancer, will overestimate every patient's risk in a general clinic; the fix is not to retrain her but to tell her the clinic's base rate.</p>
  <div class="fx" data-lang="py"># class_weight="balanced" trains as if positives were 50%: probabilities come out too high
from calib_data import X_tr, y_tr, X_te, y_te, ece
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, log_loss

pi = y_tr.mean()                                         # real positive rate
plain = LogisticRegression(max_iter=1000).fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
bal = LogisticRegression(max_iter=1000, class_weight="balanced").fit(X_tr, y_tr).predict_proba(X_te)[:, 1]

def correct(p, pi, pi_train=0.5):
    """Bayes prior-shift correction: move probabilities from the training prior to the real prior"""
    a, b = p * pi / pi_train, (1 - p) * (1 - pi) / (1 - pi_train)
    return a / (a + b)
print(f"real positive rate = {pi:.3f}")
for name, p in [("plain", plain), ("balanced", bal), ("balanced, corrected", correct(bal, pi))]:
    print(f"{name:20s} mean p={p.mean():.3f}  AUC={roc_auc_score(y_te, p):.3f}  logloss={log_loss(y_te, p):.3f}  ECE={ece(y_te, p):.3f}")</div>
  <div class="fx" data-lang="text">real positive rate = 0.203
plain                mean p=0.199  AUC=0.961  logloss=0.191  ECE=0.013
balanced             mean p=0.280  AUC=0.961  logloss=0.240  ECE=0.078
balanced, corrected  mean p=0.197  AUC=0.961  logloss=0.193  ECE=0.014</div>
  <p>Balanced weighting raised the average prediction from 0.199 to 0.280 when the true rate is 0.203, and ECE from 0.013 to 0.078, while AUC did not move. The one-line correction brings the mean back to 0.197 and ECE to 0.014. The same formula handles <strong>prior shift</strong> in production, when the fraud rate changes from, say, 2% to 4%: only π changes. And do not judge calibration by model family alone: an early-stopped boosting model can be well calibrated and a heavily regularised logistic regression can be under-confident, so always plot the reliability curve on held-out data.</p>

  <h2 id="tc-flow"><span class="num">11</span>The Full Workflow</h2>
  <p>Each technique was shown on its own; in a real project they fit together in a fixed order. Train the model on the training split. Check its ranking with AUC or AP. Check its calibration with a reliability diagram, ECE and Brier on held-out data. If the probabilities will be used, calibrate, by cross-validation or on a calibration split. Then choose the threshold: compute t* from the costs if the probabilities are now calibrated, or search for it by cross-validation. Report once on the untouched test set, and keep monitoring, because a change in prevalence breaks both calibration and the precision at the chosen threshold.</p>
  <p>The rule "calibrate first, threshold second" has a simple reason. Calibration does not change the ranking, so a threshold found by search flags the same rows either way, but only after calibration does the formula t* = C_FP/(C_FP + C_FN) apply, and only then do the probabilities mean something to downstream users. Two shortcuts are legitimate. If only a decision is needed and the probabilities are used nowhere else, you can skip calibration and tune t directly by cross-validation. If only probabilities are needed, for pricing or expected loss, calibrate and evaluate with log loss, Brier and ECE, and no threshold is needed. The calibration methods compare as follows:</p>
  <table class="tbl">
    <tr><th></th><th>Platt (sigmoid)</th><th>Isotonic</th><th>Temperature</th><th>Prior correction</th></tr>
    <tr><td>Learns</td><td>a, b</td><td>a step function</td><td>T</td><td>nothing (π known)</td></tr>
    <tr><td>Fixes</td><td>S-shaped distortion</td><td>any monotone distortion</td><td>over/under-confident logits</td><td>base-rate mismatch</td></tr>
    <tr><td>Data needed</td><td>small</td><td>large (≈ 1,000+)</td><td>small</td><td>none</td></tr>
    <tr><td>Keeps ranking</td><td>yes</td><td>up to ties</td><td>yes</td><td>yes</td></tr>
    <tr><td>Typical use</td><td>SVM, boosting, small data</td><td>forests, NB, big data</td><td>neural nets, multiclass</td><td>class_weight, resampling, drift</td></tr>
  </table>

  <h2 id="tc-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most damaging mistake is fitting the calibrator on the rows the model was trained on. A random forest nearly memorises its training data, so on those rows its scores look almost perfect, and a calibrator fitted there learns to trust them completely:</p>
  <div class="fx" data-lang="py"># calibrating on the model's own training rows vs on out-of-fold rows
from calib_data import X_tr, y_tr, X_te, y_te, ece
from sklearn.ensemble import RandomForestClassifier
from sklearn.isotonic import IsotonicRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import log_loss

rf = RandomForestClassifier(200, random_state=0, n_jobs=1).fit(X_tr, y_tr)
train_scores = rf.predict_proba(X_tr)[:, 1]                   # the forest has nearly memorised these
print("forest's mean score on its own training frauds:", round(train_scores[y_tr == 1].mean(), 3))
iso = IsotonicRegression(out_of_bounds="clip").fit(train_scores, y_tr)   # WRONG: fitted on training rows
p_bad = iso.predict(rf.predict_proba(X_te)[:, 1])
p_good = CalibratedClassifierCV(RandomForestClassifier(200, random_state=0, n_jobs=1),
                                method="isotonic", cv=5).fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
print(f"calibrated on training rows: logloss={log_loss(y_te, p_bad):.3f}  ECE={ece(y_te, p_bad):.3f}")
print(f"calibrated out-of-fold     : logloss={log_loss(y_te, p_good):.3f}  ECE={ece(y_te, p_good):.3f}")</div>
  <div class="fx" data-lang="text">forest's mean score on its own training frauds: 0.913
calibrated on training rows: logloss=1.198  ECE=0.040
calibrated out-of-fold     : logloss=0.152  ECE=0.007</div>
  <p>On its own training frauds the forest's average score is 0.913, far more confident than it deserves on new data. The isotonic calibrator fitted on those training scores produces a test log loss of 1.198 (it hands out hard 0s and 1s that turn out wrong), while the same calibrator fitted on out-of-fold scores gives 0.152. Always use <code>CalibratedClassifierCV</code> with cross-validation, or a frozen model and a separate calibration set.</p>
  <p>The other common mistakes follow the sections of this note. Shipping the default threshold of 0.5 cost ₹80,620 on the fraud data instead of ₹54,260. Tuning the threshold on the test set makes the reported cost optimistic. Applying the formula t* to uncalibrated scores flagged all 10 rows (₹120 instead of ₹40). Fitting isotonic regression on small data produced hard 0s and 1s, where one surprise gives infinite log loss. Assuming that a high AUC means good probabilities ignores that boosting had AUC 0.978 and a poor log loss. Forgetting that <code>class_weight="balanced"</code> inflates probabilities (mean 0.199 to 0.280) leaves every expected-loss calculation wrong. Picking a model by ECE ignores that a constant base-rate forecast has ECE near 0. Using <code>SVC(probability=True)</code> is deprecated; wrap the SVC in <code>CalibratedClassifierCV(..., ensemble=False)</code>. And ignoring prevalence drift lets precision at a fixed threshold fall from 0.67 to 0.11 when fraud drops from 40% to 4%.</p>

  <h2 id="tc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Scores 0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10 for T1–T10; frauds T1, T2, T4, T6 (P = 4, N = 6, base rate 0.4). A miss costs ₹500, a review ₹20.</p>
  <h3>Formulas and values</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Formula</th><th>10 rows</th></tr>
    <tr><td>Calibrated</td><td>P(y = 1 | p = q) = q for every q</td><td>bin 0.75 → 0.50: not calibrated</td></tr>
    <tr><td>Cost of a threshold</td><td>C_FN·FN(t) + C_FP·FP(t)</td><td>best t = 0.45, ₹40 (₹540 at 0.5)</td></tr>
    <tr><td>Bayes threshold</td><td>t* = C_FP / (C_FP + C_FN), calibrated p only</td><td>20/520 = 0.038</td></tr>
    <tr><td>Youden's J</td><td>max (TPR − FPR); assumes C_FN/C_FP = N/P</td><td>0.667 at 0.45</td></tr>
    <tr><td>F1-optimal</td><td>max F1(t); TN worthless, FP = FN</td><td>0.80 at 0.45</td></tr>
    <tr><td>Precision at prevalence π</td><td>TPR·π / (TPR·π + FPR·(1 − π))</td><td>π 0.4 → 0.667; π 0.04 → 0.11</td></tr>
    <tr><td>ECE / MCE</td><td>Σ (n_b/n)|obs_b − conf_b| / max gap</td><td>0.17 / 0.35</td></tr>
    <tr><td>Brier decomposition</td><td>REL − RES + UNC</td><td>0.0435 − 0.140 + 0.240</td></tr>
    <tr><td>Brier skill score</td><td>1 − Brier / UNC</td><td>0.308</td></tr>
    <tr><td>Platt</td><td>σ(a·s + b), soft targets (N₊+1)/(N₊+2), 1/(N₋+2)</td><td>a 3.69, b −2.42</td></tr>
    <tr><td>Isotonic</td><td>best non-decreasing step function (PAV)</td><td>0, 0.5, 1</td></tr>
    <tr><td>Temperature</td><td>softmax(z / T)</td><td>boosting log loss 0.283 → 0.136</td></tr>
    <tr><td>Prior correction</td><td>p·(π/π′) / [p·(π/π′) + (1 − p)(1 − π)/(1 − π′)]</td><td>0.80 → 0.50 (π 0.2, π′ 0.5)</td></tr>
  </table>
  <h3>Who is miscalibrated</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Direction</th><th>Why</th></tr>
    <tr><td>Logistic regression</td><td>close</td><td>minimises log loss</td></tr>
    <tr><td>Naive Bayes</td><td>over-confident</td><td>double-counts correlated features</td></tr>
    <tr><td>Random forest</td><td>under-confident</td><td>averaging pulls towards the middle</td></tr>
    <tr><td>Boosting (many rounds), deep nets</td><td>over-confident</td><td>keep pushing margins</td></tr>
    <tr><td>SVM</td><td>no probabilities</td><td>distance from the boundary</td></tr>
    <tr><td>class_weight / resampling</td><td>too high</td><td>trained at the wrong base rate</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.model_selection import TunedThresholdClassifierCV, FixedThresholdClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.frozen import FrozenEstimator
tuned = TunedThresholdClassifierCV(model, scoring=cost_scorer, cv=5).fit(X, y)   # tuned.best_threshold_
fixed = FixedThresholdClassifier(model, threshold=20 / 520)
cal = CalibratedClassifierCV(model, method="sigmoid", cv=5)          # or "isotonic", "temperature"
cal = CalibratedClassifierCV(FrozenEstimator(fitted), method="isotonic").fit(X_cal, y_cal)
frac_pos, mean_pred = calibration_curve(y, p, n_bins=10, strategy="quantile")</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Calibrate and tune on rows the model did not train on; report once on test.</li>
    <li>t* needs calibrated probabilities; a search works on any score.</li>
    <li>Calibration never fixes ranking (isotonic can shift AUC slightly through ties).</li>
    <li>ECE diagnoses; log loss and Brier compare.</li>
    <li>Threshold tuning changes <code>predict</code>, not <code>predict_proba</code>.</li>
    <li>Re-check threshold and calibration when prevalence or costs change.</li>
  </ul>

  <h2 id="tc-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does it mean for a classifier to be calibrated?</summary><div class="qa-body">Among all rows it gives probability q, a fraction q are actually positive, for every q. A calibrated "0.8" comes true 80% of the time. Calibration is about the honesty of the numbers, separate from how well the model ranks rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a good ranker and a calibrated model?</summary><div class="qa-body">A good ranker puts positives above negatives (high AUC); a calibrated model's probabilities come true at their stated rates. Squaring the scores keeps AUC but changes every probability, and a model that always predicts the base rate is calibrated with AUC 0.5. Boosting with many rounds often ranks very well but is over-confident.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is 0.5 not always the right threshold?</summary><div class="qa-body">0.5 is optimal only for calibrated probabilities when a false positive and a false negative cost the same. With unequal costs, imbalanced classes, capacity limits or uncalibrated scores, the best threshold is elsewhere; on the fraud data, moving from 0.5 to a cost-tuned 0.07 cut cost by a third.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the cost-optimal threshold for calibrated probabilities.</summary><div class="qa-body">Passing a row costs p·C_FN in expectation; flagging it costs (1 − p)·C_FP. Flag when p·C_FN &gt; (1 − p)·C_FP, which gives p &gt; C_FP/(C_FP + C_FN). With ₹500 and ₹20 that is 0.038; equal costs give 0.5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The cost search gives 0.45 but the formula gives 0.038. Why?</summary><div class="qa-body">The formula assumes calibrated probabilities; the search only uses the ranking and works with any score. The 10 scores overstate risk at the low end (no fraud below 0.45), so the formula flags everything. Calibrate first, then the formula applies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Youden's J and what assumption does it hide?</summary><div class="qa-body">J = TPR − FPR, maximised over thresholds; it is the ROC point farthest above the diagonal, equal to the KS statistic, and maximising it maximises balanced accuracy. It assumes a miss costs N/P times a false alarm, which is rarely the true business ratio.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you choose a threshold in production?</summary><div class="qa-body">Agree costs, a recall or precision floor, or a capacity limit with the business. Choose the threshold on validation data or by cross-validation at the real prevalence (for example TunedThresholdClassifierCV with a cost scorer). Report once on the test set, then monitor prevalence and re-tune when it drifts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does precision at a fixed threshold change when prevalence changes, while TPR and FPR do not?</summary><div class="qa-body">TPR and FPR divide by their own class sizes, so they are properties of the model at that threshold. Precision mixes the two classes: TPR·π / (TPR·π + FPR·(1 − π)). If the positive rate falls from 40% to 4%, precision at the same threshold can fall from 0.67 to 0.11.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you build a reliability diagram, and what do ECE and MCE measure?</summary><div class="qa-body">Bin the predictions, and for each bin plot the observed positive rate against the mean predicted probability; the diagonal is perfect calibration. ECE is the row-weighted average absolute gap between the two, and MCE is the largest gap. ECE diagnoses calibration but is not a proper score: a constant base-rate forecast has ECE near 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the Brier score decomposition.</summary><div class="qa-body">Brier ≈ reliability − resolution + uncertainty. Reliability is the calibration error, resolution is how well the model separates high-risk from low-risk rows, and uncertainty ȳ(1 − ȳ) is the difficulty fixed by the data. Calibration lowers reliability; better features raise resolution.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Platt scaling work, and how is it related to logistic regression?</summary><div class="qa-body">It fits p = σ(a·s + b) on held-out scores by minimising log loss, with softened targets against overfitting. It is literally a logistic regression with one input, the model's score. It keeps the ranking, needs little data and fixes S-shaped distortions, but cannot fix other shapes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does isotonic regression calibrate, and when is it a bad idea?</summary><div class="qa-body">It fits the best non-decreasing step function from score to probability using Pool Adjacent Violators: wherever a higher value precedes a lower one, pool and average them. It can fix any monotone distortion, but it overfits small data, creates ties that can change AUC, and can output hard 0 or 1, which makes log loss infinite on a surprise. Use it with roughly 1,000+ calibration rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CalibratedClassifierCV avoid leakage?</summary><div class="qa-body">It fits the calibrator on predictions for rows the model copy did not train on, using k-fold cross-validation. ensemble=True keeps k (model, calibrator) pairs and averages them; ensemble=False fits one calibrator on all out-of-fold predictions and refits one model. With FrozenEstimator, an already-trained model is kept and only the calibrator is fitted on a separate calibration set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is temperature scaling, and why is it popular for neural networks?</summary><div class="qa-body">It divides the logits by one learnt number T before the softmax; T &gt; 1 softens over-confident outputs. With one parameter it needs little data and cannot change which class has the highest probability, so accuracy is untouched. For binary problems it is Platt scaling without the intercept.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which models are typically miscalibrated, and in which direction?</summary><div class="qa-body">Naive Bayes is over-confident because it double-counts correlated features. Random forests are under-confident because averaging pulls probabilities towards the middle. Boosting with many rounds and deep networks are over-confident because they keep pushing margins. SVMs give distances, not probabilities. Logistic regression is usually close because it minimises log loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You trained with class_weight="balanced". What happens to the probabilities?</summary><div class="qa-body">The model acts as if positives were 50% of the data, so its probabilities are inflated, while AUC is unchanged. Correct them with Bayes' rule by rescaling the odds by (π/(1 − π)) / (π′/(1 − π′)), or recalibrate on held-out data. A balanced model's 0.80 becomes 0.50 when the true rate is 0.2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does calibration change ROC-AUC? Does threshold tuning change log loss?</summary><div class="qa-body">Platt and temperature scaling are strictly increasing maps, so AUC is unchanged; isotonic can change it slightly through ties. Threshold tuning changes only the decisions from predict, not predict_proba, so log loss and Brier stay the same.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Should you calibrate before or after choosing the threshold?</summary><div class="qa-body">Calibrate first. Calibration keeps the ranking, so a threshold found by search flags the same rows either way, but only calibrated probabilities make the cost formula t* valid and the numbers meaningful to downstream users. If probabilities are never used, you can skip calibration and tune the threshold directly.</div></details>
</main>
`
});
