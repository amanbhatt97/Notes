// notes/ml/ml_calibration.js — Thresholds & Calibration
Object.assign(TOPIC_CONTENT, {
  "ml_calibration": `<main>
  <h1>Thresholds &amp; Calibration</h1>
  <div class="where"><span>Machine Learning</span><span>Model Evaluation</span><span>Thresholds &amp; Calibration</span></div>
  <p class="lead">A classifier hands you a score; the business needs a decision ("block this card?") and often an honest probability ("what is the expected loss?"). This note answers both questions on the same 10 scored transactions used in Classification Metrics. First the threshold: chosen by hand from a cost matrix, from Youden's J, from the best F1, or from a recall rule, and then tuned safely with cross-validation. Then calibration: what it means for "0.8" to be true, the reliability diagram built by hand, the Brier score and its decomposition, ECE by hand, Platt scaling and isotonic regression worked step by step, <code>CalibratedClassifierCV</code> with cross-validation, and which models are badly calibrated and why.</p>

  <h2 id="tc-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_evaluation">Classification Metrics</a> and <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a></b><span>Classification Metrics built the confusion matrix at t = 0.5, ROC and PR curves over all thresholds, and log loss and Brier for probabilities, and showed that a cheaper model can have a worse F1. Two questions were left open: which threshold to actually use, and whether the model's "0.8" means 80%. Regression Metrics added the idea that every score needs a baseline and that Brier is just MSE of probabilities.</span></li>
    <li><b>This note: Thresholds &amp; Calibration (closes the Model Evaluation group)</b><span>How to turn a score into the cheapest decision (cost matrix, t* = C_FP/(C_FP + C_FN)), what to do without costs (Youden, F1, recall floors), how to check whether probabilities are honest (reliability diagram, Brier decomposition, ECE), and how to repair them (Platt, isotonic, temperature) without leaking data.</span></li>
    <li><b>Leads to: model tuning and deployment</b><span>Calibrated probabilities and a cost-based threshold are the last step before a model goes live (<a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>). Each model note revisits its own calibration: <a class="xref" data-note="ml_naivebayes">Naive Bayes</a> (overconfident), <a class="xref" data-note="ml_svm">SVM</a> (no probabilities at all), <a class="xref" data-note="ml_rf">Random Forest</a> (pulled to the middle).</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="tc-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Model Evaluation</text>
<rect x="20" y="40" width="190" height="56" rx="8" class="fb sb"/><text x="115" y="62" text-anchor="middle" font-size="13">Classification Metrics</text><text x="115" y="80" text-anchor="middle" class="tm" font-size="10.5">ROC, PR, log loss, Brier</text>
<rect x="235" y="40" width="190" height="56" rx="8" class="ft st"/><text x="330" y="62" text-anchor="middle" font-size="13">Regression Metrics</text><text x="330" y="80" text-anchor="middle" class="tm" font-size="10.5">MAE, RMSE, baselines</text>
<rect x="450" y="34" width="190" height="68" rx="8" class="fg sg" stroke-width="3"/><text x="545" y="58" text-anchor="middle" font-size="13" font-weight="700">Thresholds &amp; Calibration</text><text x="545" y="75" text-anchor="middle" class="tm" font-size="10.5">decisions, honest p</text><text x="545" y="92" text-anchor="middle" class="tb" font-size="10">YOU ARE HERE</text>
<line x1="210" y1="68" x2="233" y2="68" stroke="currentColor" marker-end="url(#tc-a0)"/><line x1="425" y1="68" x2="448" y2="68" stroke="currentColor" marker-end="url(#tc-a0)"/>
<path d="M115 96 Q 330 140 540 104" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#tc-a0)"/>
<text x="330" y="140" text-anchor="middle" class="tm" font-size="10.5">same 10 transactions as Classification Metrics</text>
</svg><figcaption>The last note of the Model Evaluation group. It uses the running example and the curves of Classification Metrics directly.</figcaption></figure>
  <p>You need: the confusion matrix, precision, recall, TPR/FPR, ROC and PR curves, log loss and Brier (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>), and the logistic (sigmoid) function (<a class="xref" data-note="ml_classification">Logistic Regression</a>). Bayes' rule appears once (<a class="xref" data-note="st_probability">Probability</a>).</p>

  <h2 id="tc-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>One chain of questions about the same 10 transactions (scores 0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10; frauds T1, T2, T4, T6). Each answer leaves a gap that the next concept fills.</p>
  <ol class="story">
    <li><b>Scores vs probabilities</b><span>Q: is the model's 0.80 a probability? → not necessarily: score², or 0.3 + 0.4·score, rank the rows identically (AUC 0.875 each) but say different numbers and flag different rows at 0.5. So 0.5 is not a natural cut-off…</span></li>
    <li><b>Threshold from a cost matrix</b><span>Q: which cut-off is cheapest if a miss costs ₹500 and a review ₹20? → try every threshold: t = 0.45 costs ₹40, the default 0.5 costs ₹540. Theory says t* = 20/520 = 0.038 — but only if the scores are true probabilities. And often nobody can give you the costs…</span></li>
    <li><b>Youden's J, F1-optimal, recall floor</b><span>Q: how to choose without costs? → max TPR − FPR (t = 0.45, J = 0.667), max F1 (t = 0.45, F1 = 0.80), or "catch ≥ 75%, then best precision" (t = 0.70). Each rule hides an assumption about costs…</span></li>
    <li><b>The precision–recall trade-off</b><span>Q: what exactly do we give up when we move t? → each step down catches more fraud and adds false alarms; the PR curve is the menu of operating points. But picking t on the same rows we report on is cheating…</span></li>
    <li><b>Tuning the threshold safely</b><span>Q: how to pick t without leaking? → cross-validated tuning: on the full fraud data, cost ₹80,620 at 0.5 drops to ₹54,260 at t = 0.07 chosen inside CV. Yet the theoretical t* only works with honest probabilities. Are they?…</span></li>
    <li><b>Reliability diagram</b><span>Q: when the model says 0.75, is it right 75% of the time? → group by predicted p and compare: 0.75 → 0.50, 0.35 → 0.00. But a picture is not a number…</span></li>
    <li><b>Brier score and its decomposition</b><span>Q: one number for probability quality, split into "honest" and "useful"? → Brier 0.166 ≈ reliability 0.044 − resolution 0.140 + uncertainty 0.240. Still, reliability is in squared units and hard to read…</span></li>
    <li><b>ECE and MCE</b><span>Q: on average, how far are stated probabilities from reality? → ECE = 0.17 (17 points), worst bin 0.35. Now that we can measure miscalibration, how do we repair it?…</span></li>
    <li><b>Platt scaling</b><span>Q: can a simple curve map scores to honest probabilities? → fit p = σ(a·s + b): a = 3.69, b = −2.42; log loss 0.497 → 0.482. But a sigmoid cannot fix every shape…</span></li>
    <li><b>Isotonic regression</b><span>Q: what if the distortion is not S-shaped? → any non-decreasing step function, found by pooling violators: 0, 0.5, 1. Flexible, but it overfits small data and needs held-out rows…</span></li>
    <li><b>CalibratedClassifierCV</b><span>Q: where do the held-out rows come from? → cross-validation inside the calibrator (or a frozen model plus a calibration set); NB log loss 0.272 → 0.222, boosting 0.283 → 0.136. But why did those models need it in the first place?…</span></li>
    <li><b>Which models are miscalibrated, and why</b><span>Q: which models lie, which way, and what else breaks calibration? → Naive Bayes, forests, boosting, SVMs, and class re-weighting (mean p 0.199 → 0.280, fixed by a prior correction). Then: calibrate first, choose the threshold second.</span></li>
  </ol>
  <div class="bridge"><b>What this still can't tell us.</b> The ladder is the plot; every step is worked by hand below. <b>→ next: the Mind Map, then 01 Scores vs Probabilities</b></div>

  <h2 id="tc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Thresholds &amp; Calibration</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Scores vs probabilities</div>
        <ul>
          <li>A <b>score</b> only has to rank; a <b>probability</b> must also come true at its stated rate</li>
          <li>Monotone transforms keep AUC (0.875) but change every threshold decision</li>
          <li>0.5 is a default, not a decision</li>
          <li>💡 Two exams that rank students the same but use different marking scales</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing t with costs</div>
        <ul>
          <li>Cost(t) = C_FN·FN(t) + C_FP·FP(t); sweep every t</li>
          <li>10 rows, ₹500 / ₹20: best t = 0.45 (₹40) vs 0.5 (₹540)</li>
          <li>Flag if p·C_FN &gt; (1−p)·C_FP ⇒ <b>t* = C_FP/(C_FP + C_FN)</b> = 0.038</li>
          <li>t* is valid only for calibrated p</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing t without costs</div>
        <ul>
          <li><b>Youden's J</b> = max(TPR − FPR) = 0.667 at t = 0.45 (= KS)</li>
          <li><b>F1-optimal</b>: F1 = 0.80 at t = 0.45</li>
          <li><b>Recall floor</b> (≥ 0.75) → t = 0.70, precision 0.75</li>
          <li>Capacity: flag the top-k scores</li>
          <li>Tune on validation / CV: <code>TunedThresholdClassifierCV</code>, <code>FixedThresholdClassifier</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Measuring calibration</div>
        <ul>
          <li><b>Reliability diagram</b>: bin by p, plot observed rate vs mean p; diagonal = perfect</li>
          <li>10 rows, 5 bins: 0.15→0, 0.35→0, 0.5→0.5, 0.75→0.5, 0.9→1</li>
          <li><b>ECE</b> = Σ (n_b/n)|obs − conf| = 0.17 · <b>MCE</b> = 0.35</li>
          <li><b>Brier</b> = REL − RES + UNC: 0.044 − 0.140 + 0.240</li>
          <li>Log loss and Brier include calibration; AUC ignores it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fixing calibration</div>
        <ul>
          <li><b>Platt</b>: p = σ(a·s + b), 2 parameters, smooth; small data; a = 3.69, b = −2.42</li>
          <li><b>Isotonic</b>: monotone step function via PAV; flexible; needs ~1000+ rows; creates ties</li>
          <li><b>Temperature</b>: divide logits by T; multiclass nets</li>
          <li>Always on rows the model did not train on: <code>CalibratedClassifierCV(cv=5)</code> or <code>FrozenEstimator</code> + calibration set</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Who is miscalibrated</div>
        <ul>
          <li>LogReg: close (it minimises log loss)</li>
          <li>Naive Bayes: overconfident (double-counts correlated evidence)</li>
          <li>Random forest: under-confident (averaging pulls to the middle)</li>
          <li>Boosting (many rounds), deep nets: overconfident · SVM: no probabilities</li>
          <li>class_weight / undersampling: p too high → prior correction</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="tc-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">Each concept as an answer</span></div></div>
      <div class="rm-item rm-done" data-target="tc-scores"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Scores vs Probabilities</span><span class="rm-sub">Why 0.5 is arbitrary</span></div></div>
      <div class="rm-item rm-done" data-target="tc-cost"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Threshold from Costs</span><span class="rm-sub">By hand; t* derived</span></div></div>
      <div class="rm-item rm-done" data-target="tc-nocost"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Youden, F1, Recall Floors</span><span class="rm-sub">When nobody gives costs</span></div></div>
      <div class="rm-item rm-done" data-target="tc-tradeoff"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Precision–Recall Trade-off</span><span class="rm-sub">Operating points</span></div></div>
      <div class="rm-item rm-done" data-target="tc-tune"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Tuning t Safely</span><span class="rm-sub">TunedThresholdClassifierCV</span></div></div>
      <div class="rm-item rm-done" data-target="tc-reliab"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Reliability Diagrams</span><span class="rm-sub">Built by hand</span></div></div>
      <div class="rm-item rm-done" data-target="tc-brier"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Brier Decomposition</span><span class="rm-sub">Reliability, resolution, uncertainty</span></div></div>
      <div class="rm-item rm-done" data-target="tc-ece"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">ECE and MCE</span><span class="rm-sub">By hand</span></div></div>
      <div class="rm-item rm-done" data-target="tc-platt"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Platt Scaling</span><span class="rm-sub">A sigmoid on the score</span></div></div>
      <div class="rm-item rm-done" data-target="tc-iso"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Isotonic Regression</span><span class="rm-sub">PAV by hand</span></div></div>
      <div class="rm-item rm-done" data-target="tc-cccv"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">CalibratedClassifierCV</span><span class="rm-sub">CV, prefit, temperature</span></div></div>
      <div class="rm-item rm-done" data-target="tc-why"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Who Is Miscalibrated, and Why</span><span class="rm-sub">NB, forests, boosting, SVM, reweighting</span></div></div>
      <div class="rm-item rm-done" data-target="tc-flow"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">The Full Workflow</span><span class="rm-sub">And a comparison table</span></div></div>
      <div class="rm-item rm-done" data-target="tc-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="tc-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="tc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="tc-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="tc-scores"><span class="num">01</span>Scores vs Probabilities</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Classification Metrics judged the 10 transactions at threshold 0.5 and with ROC-AUC 0.875. We never asked whether "0.80" for T3 means "an 80% chance of fraud", or why 0.5 should be the cut-off at all.</p></div>
  <h3>Two different jobs for one number</h3>
  <p>A model's output can be used in two ways. As a <strong>score</strong>, it only has to <em>rank</em>: frauds above legit rows. As a <strong>probability</strong>, it must also be <em>honest</em>: among all transactions given 0.80, about 80% should turn out to be fraud. Ranking is what AUC measures; honesty is called <strong>calibration</strong>. A model can be excellent at one and poor at the other.</p>
  <div class="fx" data-lang="py"># ten.py - the 10 transactions used all through this note
import numpy as np
ids    = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"]
score  = np.array([0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10])  # model's fraud score
y      = np.array([1,    1,    0,    1,    0,    1,    0,    0,    0,    0   ])  # 1 = really fraud</div>
  <div class="fx" data-lang="py"># three models that RANK the 10 transactions identically, but report different numbers
import numpy as np
from ten import ids, score, y
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
  <p>Squaring the scores, or squashing them into 0.34–0.68, is an increasing transformation: every row keeps its place in the order, so AUC stays 0.875. But the numbers change (T1 is 0.95, 0.90 or 0.68 depending on the version), and so does what happens at 0.5: model B flags only 3 rows. If a number can be bent like this without changing the ranking, then "0.5" has no special meaning unless the numbers are probabilities.</p>
  <h3>Where each property matters</h3>
  <table class="tbl">
    <tr><th>Use of the output</th><th>Needs good ranking?</th><th>Needs calibration?</th><th>Example</th></tr>
    <tr><td>Sort a review queue, flag the top 100</td><td>Yes</td><td>No</td><td>Daily fraud review with fixed staff</td></tr>
    <tr><td>Threshold from costs, t* = C_FP/(C_FP + C_FN)</td><td>Yes</td><td><strong>Yes</strong></td><td>Block a card automatically</td></tr>
    <tr><td>Expected value: p × amount</td><td>Yes</td><td><strong>Yes</strong></td><td>Expected fraud loss, insurance pricing, credit provisions</td></tr>
    <tr><td>Combine with other models or rules</td><td>Yes</td><td><strong>Yes</strong></td><td>Stacking, Bayesian updates, ensembles of probabilities</td></tr>
    <tr><td>Show a risk to a human</td><td>Yes</td><td><strong>Yes</strong></td><td>"30% chance of readmission"</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two weather apps both rank tomorrow as rainier than today. One says "70% rain" on days when it rains 7 times in 10; the other says "95%" on those same days. They are equally good at ranking days, but only the first one's number can be used to decide whether to cancel an outdoor wedding.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A classifier with output p(x) is <strong>calibrated</strong> if, for every value q, P(y = 1 | p(x) = q) = q: among rows given probability q, a fraction q are positive. A <strong>threshold</strong> t turns p into a decision: flag if p(x) ≥ t. sklearn's <code>predict</code> uses t = 0.5 for <code>predict_proba</code> models and 0 for <code>decision_function</code> models.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"predict_proba" is a method name, not a promise. Random forests, boosting, Naive Bayes and SVMs (via <code>decision_function</code>) all output numbers that rank well but are not calibrated probabilities by default (section 12).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> If 0.5 is not special, which cut-off should the bank use for the 10 transactions? <b>→ next: 02 Threshold from a Cost Matrix</b></div>

  <h2 id="tc-cost"><span class="num">02</span>Choosing the Threshold from a Cost Matrix</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>0.5 is arbitrary, but some threshold must be chosen. We know from Classification Metrics that a missed fraud costs about ₹500 and a review costs ₹20. We have not yet used those numbers to pick the cut-off.</p></div>
  <h3>By hand: try every threshold</h3>
  <p>Only thresholds equal to one of the scores matter (between two scores nothing changes). For each, count FN and FP and price them:</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import score, y
C_FN, C_FP = 500, 20                       # a missed fraud costs ₹500, a review costs ₹20

print("threshold  TP FP FN TN   cost = 500·FN + 20·FP")
cands = np.r_[np.inf, score]               # "flag nothing", then each score in turn
costs = []
for t in cands:
    flag = score &gt;= t
    tp, fp = int((flag &amp; (y == 1)).sum()), int((flag &amp; (y == 0)).sum())
    fn, tn = 4 - tp, 6 - fp
    c = C_FN * fn + C_FP * fp; costs.append(c)
    print(f"{t:&gt;9.2f}  {tp:2d} {fp:2d} {fn:2d} {tn:2d}   {C_FN}·{fn} + {C_FP}·{fp} = ₹{c:,}")
best = cands[int(np.argmin(costs))]
print(f"\\ncheapest threshold on these rows: {best}  (cost ₹{min(costs)})")
print(f"theory for calibrated p: t* = C_FP / (C_FP + C_FN) = 20/520 = {C_FP/(C_FP+C_FN):.4f}")</div>
  <div class="fx" data-lang="text">threshold  TP FP FN TN   cost = 500·FN + 20·FP
      inf   0  0  4  6   500·4 + 20·0 = ₹2,000
     0.95   1  0  3  6   500·3 + 20·0 = ₹1,500
     0.85   2  0  2  6   500·2 + 20·0 = ₹1,000
     0.80   2  1  2  5   500·2 + 20·1 = ₹1,020
     0.70   3  1  1  5   500·1 + 20·1 = ₹520
     0.55   3  2  1  4   500·1 + 20·2 = ₹540
     0.45   4  2  0  4   500·0 + 20·2 = ₹40
     0.40   4  3  0  3   500·0 + 20·3 = ₹60
     0.30   4  4  0  2   500·0 + 20·4 = ₹80
     0.20   4  5  0  1   500·0 + 20·5 = ₹100
     0.10   4  6  0  0   500·0 + 20·6 = ₹120

cheapest threshold on these rows: 0.45  (cost ₹40)
theory for calibrated p: t* = C_FP / (C_FP + C_FN) = 20/520 = 0.0385</div>
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
  <p>Walk down the table. Lowering t from 0.55 to 0.45 adds T6, a fraud: one less miss saves ₹500. Lowering further only adds legit rows, each costing ₹20. So the best cut-off is <strong>0.45</strong> (₹40), against ₹540 at the default 0.5: the same model, a 13× cheaper decision.</p>
  <h3>Deriving t* = C_FP / (C_FP + C_FN)</h3>
  <p>Now suppose p is an honest probability of fraud for one transaction. Compare the expected cost of the two actions:</p>
  <ul>
    <li>Pass it: we lose ₹500 if it is fraud. Expected cost = p · C_FN = 500p.</li>
    <li>Flag it: we pay ₹20 if it is legit (and the same ₹20 review if it is fraud, which every flag pays; ignoring it, as in the table, keeps the algebra clean). Expected extra cost = (1 − p) · C_FP = 20(1 − p).</li>
  </ul>
  <p>Flag when passing is more expensive: 500p &gt; 20(1 − p) ⇔ 520p &gt; 20 ⇔ p &gt; 20/520 = <strong>0.038</strong>. In general:</p>
  <p><strong>t* = C_FP / (C_FP + C_FN)</strong></p>
  <p>With equal costs, t* = 0.5, which is the hidden assumption behind <code>predict()</code>. When a miss costs 25× a false alarm, flag anything above 3.8%.</p>
  <h3>Why the formula disagrees with the table</h3>
  <p>The formula says 0.038; the table says 0.45. At 0.038 we would flag all 10 rows (₹120). The formula assumes the scores are calibrated probabilities. Our 10 scores are not: T9 at 0.20 and T10 at 0.10 are legit, and in this tiny sample nothing below 0.45 is fraud, so these scores overstate the risk at the low end. The table works with any score; the formula needs calibration (sections 06–11). On the full fraud data (section 05) the formula's 0.038 and the cost-tuned 0.07 end up much closer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Carrying an umbrella. If getting soaked is 25 times as bad as carrying an unused umbrella, you should carry it whenever the chance of rain is above 1/26 ≈ 4%, not only when rain is "more likely than not". But that only works if the forecast's percentages are honest.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>With costs C_FP and C_FN (and zero cost for correct decisions), the expected-cost-minimising rule for a calibrated probability p is: predict positive iff p ≥ t* = C_FP / (C_FP + C_FN). With benefits as well (b_TP, b_TN), use the net costs: t* = (C_FP + b_TN) / (C_FP + b_TN + C_FN + b_TP). Empirically, minimise C_FN·FN(t) + C_FP·FP(t) over candidate thresholds.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Picking t on the same rows you then report the cost on is optimistic: with 10 rows, t = 0.45 is perfect here partly by luck. Choose t on validation data or inside cross-validation (section 05) and report the cost on untouched test data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Costs are often unknown or disputed. What principled cut-off is there when nobody will put a rupee value on a miss? <b>→ next: 03 Youden's J, F1-optimal and recall floors</b></div>

  <h2 id="tc-nocost"><span class="num">03</span>Thresholds Without Costs: Youden's J, F1, Recall Floors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>The cost table needed two rupee values. If the business cannot provide them, we still need a defensible rule for the 10 transactions, and we should know what each rule secretly assumes.</p></div>
  <div class="fx" data-lang="py">import numpy as np
from ten import score, y
from sklearn.metrics import roc_curve, precision_recall_curve

print("threshold  TPR   FPR   J=TPR-FPR  precision  recall   F1")
for t in score:
    flag = score &gt;= t
    tp, fp = (flag &amp; (y == 1)).sum(), (flag &amp; (y == 0)).sum()
    tpr, fpr, prec = tp / 4, fp / 6, tp / (tp + fp)
    f1 = 2 * prec * tpr / (prec + tpr)
    print(f"{t:&gt;9.2f}  {tpr:.2f}  {fpr:.2f}     {tpr-fpr:5.3f}      {prec:.3f}   {tpr:.2f}  {f1:.3f}")

fpr, tpr, thr = roc_curve(y, score)
print("\\nYouden's J best threshold:", thr[np.argmax(tpr - fpr)], " J =", round((tpr - fpr).max(), 3))
p, r, t = precision_recall_curve(y, score)
f1 = 2 * p[:-1] * r[:-1] / (p[:-1] + r[:-1])
print("F1-optimal threshold     :", t[np.argmax(f1)], " F1 =", round(f1.max(), 3))
ok = r[:-1] &gt;= 0.75                        # rule: must catch at least 75% of fraud
print("best precision with recall ≥ 0.75: threshold", t[ok][np.argmax(p[:-1][ok])], " precision", round(p[:-1][ok].max(), 3))</div>
  <div class="fx" data-lang="text">threshold  TPR   FPR   J=TPR-FPR  precision  recall   F1
     0.95  0.25  0.00     0.250      1.000   0.25  0.400
     0.85  0.50  0.00     0.500      1.000   0.50  0.667
     0.80  0.50  0.17     0.333      0.667   0.50  0.571
     0.70  0.75  0.17     0.583      0.750   0.75  0.750
     0.55  0.75  0.33     0.417      0.600   0.75  0.667
     0.45  1.00  0.33     0.667      0.667   1.00  0.800
     0.40  1.00  0.50     0.500      0.571   1.00  0.727
     0.30  1.00  0.67     0.333      0.500   1.00  0.667
     0.20  1.00  0.83     0.167      0.444   1.00  0.615
     0.10  1.00  1.00     0.000      0.400   1.00  0.571

Youden's J best threshold: 0.45  J = 0.667
F1-optimal threshold     : 0.45  F1 = 0.8
best precision with recall ≥ 0.75: threshold 0.7  precision 0.75</div>
  <h3>Youden's J: the point farthest from the diagonal</h3>
  <p>J = TPR − FPR = sensitivity + specificity − 1. By hand at t = 0.45: TPR = 4/4 = 1.00, FPR = 2/6 = 0.333, J = <strong>0.667</strong>, the largest in the table. Geometrically it is the ROC point with the greatest vertical height above the diagonal, the same number called the KS statistic in credit scoring. Maximising J is maximising balanced accuracy (= (1 + J)/2 = 0.833). Hidden assumption: a missed positive and a false alarm cost the same <em>per class member</em>, i.e. C_FN/C_FP = N/P (here 6/4).</p>
  <h3>F1-optimal threshold</h3>
  <p>Compute F1 at each threshold and take the largest: at t = 0.45 precision = 4/6 = 0.667, recall = 1.0, F1 = 2 × 0.667 × 1/(1.667) = <strong>0.80</strong>. Hidden assumption: true negatives are worth nothing and FP and FN cost the same. A useful theory fact: at the F1-optimal threshold of a calibrated model, t = F1*/2 (here 0.80/2 = 0.40, between 0.40 and 0.45, consistent with the table).</p>
  <h3>Recall (or precision) floor</h3>
  <p>A common business rule: "we must catch at least 75% of fraud; among thresholds that do, pick the one with the best precision". Thresholds with recall ≥ 0.75 are 0.70 and below; the best precision among them is 0.75 at <strong>t = 0.70</strong> (3 of 4 alarms real). The mirror rule, "precision at least X, then maximise recall", suits teams with limited review staff.</p>
  <h3>Capacity: the top k</h3>
  <p>If the review team can check exactly 3 transactions a day, the threshold is simply the 3rd highest score (0.80): flag T1, T2, T3. The quality measure is then precision@3 = 2/3. No probability is needed, only ranking.</p>
  <table class="tbl">
    <tr><th>Rule</th><th>10 rows</th><th>Hidden assumption</th><th>Use when</th></tr>
    <tr><td>Cost minimum</td><td>t = 0.45, ₹40</td><td>Costs known</td><td>Always, if you can get costs</td></tr>
    <tr><td>Youden's J</td><td>t = 0.45, J = 0.667</td><td>C_FN/C_FP = N/P</td><td>Medical tests, balanced view of both classes</td></tr>
    <tr><td>F1-optimal</td><td>t = 0.45, F1 = 0.80</td><td>TN worthless, FP = FN</td><td>Retrieval, rare-positive detection</td></tr>
    <tr><td>Recall ≥ 0.75</td><td>t = 0.70, precision 0.75</td><td>A regulatory or policy floor</td><td>Safety, compliance</td></tr>
    <tr><td>Top k = 3</td><td>t = 0.80</td><td>Fixed capacity</td><td>Review queues</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school deciding a pass mark. "Pass the students who maximise correct pass/fail calls" (Youden), "pass enough that at least 75% of truly ready students pass" (recall floor), or "only 30 seats next year" (capacity). Each is reasonable; each encodes a different priority.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Youden's J</strong>(t) = TPR(t) − FPR(t); the J-optimal threshold maximises it. The <strong>F1-optimal threshold</strong> maximises F1(t) over thresholds. A <strong>constrained threshold</strong> maximises one rate subject to a floor on another. All are computed from <code>roc_curve</code> or <code>precision_recall_curve</code> outputs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>All three rules happened to agree here (0.45). On real data they usually do not, and each answer carries its hidden cost ratio. If someone says "we used Youden's J", ask whether a miss really costs N/P times a false alarm.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Each rule picks one point. We have not looked at the whole menu of points and what moving along it costs in the other currency. <b>→ next: 04 The precision–recall trade-off</b></div>

  <h2 id="tc-tradeoff"><span class="num">04</span>The Precision–Recall Trade-off</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>We picked t = 0.45 or 0.70, but we have not seen in one view what every possible threshold offers, why precision and recall pull against each other, and how the answer changes if fraud becomes rarer.</p></div>
  <h3>Every threshold is an operating point</h3>
  <p>From the table in section 03, as t goes down:</p>
  <table class="tbl">
    <tr><th>t</th><th>0.95</th><th>0.85</th><th>0.80</th><th>0.70</th><th>0.55</th><th>0.45</th><th>0.40</th><th>0.30</th><th>0.20</th><th>0.10</th></tr>
    <tr><td>recall</td><td>0.25</td><td>0.50</td><td>0.50</td><td>0.75</td><td>0.75</td><td>1.00</td><td>1.00</td><td>1.00</td><td>1.00</td><td>1.00</td></tr>
    <tr><td>precision</td><td>1.00</td><td>1.00</td><td>0.67</td><td>0.75</td><td>0.60</td><td>0.67</td><td>0.57</td><td>0.50</td><td>0.44</td><td>0.40</td></tr>
  </table>
  <p>Recall can only rise as t falls (we flag a superset of rows). Precision tends to fall, but not monotonically: it jumps up whenever the newly flagged row is a fraud (0.67 → 0.75 at T4). That is why "the threshold that gives precision exactly 0.70" may not exist, and why rule-based selection scans the whole table. The PR curve of Classification Metrics is exactly this menu drawn as a picture.</p>
  <h3>Why they pull against each other</h3>
  <p>Precision = TP/(TP + FP) and recall = TP/(TP + FN). Lowering t moves rows from "pass" to "flag": a fraud moves from FN to TP (recall up, precision up), a legit row moves from TN to FP (recall unchanged, precision down). Below the region where frauds live, only legit rows are left to add, so precision keeps sliding toward the base rate (0.40) while recall is stuck at 1.</p>
  <h3>The trade-off depends on prevalence</h3>
  <p>TPR and FPR at a given threshold do not depend on how many frauds there are, but precision does: precision = TPR·π / (TPR·π + FPR·(1 − π)), where π is the fraud rate. At t = 0.45 (TPR 1, FPR 1/3): with π = 0.4, precision = 0.4/(0.4 + 0.2) = 0.667 (as in the table); if fraud drops to π = 0.04 in production, precision = 0.04/(0.04 + 0.32) = <strong>0.11</strong>. Same model, same threshold, nine false alarms per catch. A threshold chosen on a balanced or enriched sample must be re-checked at the real prevalence.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fishing net's mesh size. A finer mesh (lower t) catches every fish (recall) and also more weeds (precision falls). In a lake with fewer fish (lower prevalence), the same mesh brings up mostly weeds.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>operating point</strong> is the (precision, recall) or (FPR, TPR) pair of one threshold. Precision at prevalence π: PPV(t) = TPR(t)·π / (TPR(t)·π + FPR(t)·(1 − π)). Recall is non-increasing in t; precision is not monotone.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Thresholds chosen on resampled data (undersampled negatives, SMOTE, a 50/50 validation set) give a precision that will not hold in production. Choose on data with the real prevalence, or recompute precision with the formula above.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> All our thresholds were chosen on the same 10 rows we evaluated on. How do we choose t on real data without fooling ourselves? <b>→ next: 05 Tuning the threshold safely</b></div>

  <h2 id="tc-tune"><span class="num">05</span>Tuning the Threshold Safely</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>On 10 rows, t = 0.45 was perfect partly by luck, and we "tuned" it on the very rows we scored. On the full fraud data (10,000 training rows, 2.5% fraud) we need a threshold chosen without touching the test set, and an honest test-set cost.</p></div>
  <h3>Cross-validated threshold tuning</h3>
  <p>scikit-learn's <code>TunedThresholdClassifierCV</code> does the right thing: inside each CV fold it fits the model on the training part, scores the held-out part at many thresholds, and picks the threshold with the best average score; then it refits on all training data. <code>FixedThresholdClassifier</code> just applies a threshold you chose (for example t* from the cost formula).</p>
  <div class="fx" data-lang="py"># fraud.py - a bigger, realistic imbalanced dataset: 20,000 transactions, about 2.5% fraud
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
X, y = make_classification(n_samples=20000, n_features=20, n_informative=5,
                           weights=[0.98], flip_y=0.01, class_sep=0.8, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.5, stratify=y, random_state=0)
model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
p_te = model.predict_proba(X_te)[:, 1]          # fraud probability for each test row</div>
  <div class="fx" data-lang="py">import numpy as np
from fraud import X_tr, y_tr, X_te, y_te
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import TunedThresholdClassifierCV, StratifiedKFold
from sklearn.model_selection import FixedThresholdClassifier
from sklearn.metrics import make_scorer, confusion_matrix

def rupee_cost(y_true, y_pred):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return 500 * fn + 20 * fp
cost = make_scorer(rupee_cost, greater_is_better=False)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
base = LogisticRegression(max_iter=1000)

def report(name, clf):
    pred = clf.predict(X_te)
    tn, fp, fn, tp = confusion_matrix(y_te, pred).ravel()
    print(f"{name:34s} TP={tp:3d} FP={fp:4d} FN={fn:3d}  precision={tp/max(tp+fp,1):.3f} recall={tp/(tp+fn):.3f}  cost=₹{500*fn+20*fp:,}")

report("default predict (t=0.5)", base.fit(X_tr, y_tr))
for name, scoring in [("tuned for cost", cost), ("tuned for F1", "f1"), ("tuned for balanced acc", "balanced_accuracy")]:
    tuned = TunedThresholdClassifierCV(LogisticRegression(max_iter=1000), scoring=scoring, cv=cv, n_jobs=1).fit(X_tr, y_tr)
    report(f"{name} (t={tuned.best_threshold_:.3f})", tuned)
report("fixed t* = 20/520 = 0.038", FixedThresholdClassifier(LogisticRegression(max_iter=1000), threshold=20/520).fit(X_tr, y_tr))</div>
  <div class="fx" data-lang="text">default predict (t=0.5)            TP= 88 FP=   6 FN=161  precision=0.936 recall=0.353  cost=₹80,620
tuned for cost (t=0.070)           TP=159 FP= 463 FN= 90  precision=0.256 recall=0.639  cost=₹54,260
tuned for F1 (t=0.221)             TP=126 FP=  48 FN=123  precision=0.724 recall=0.506  cost=₹62,460
tuned for balanced acc (t=0.050)   TP=170 FP= 783 FN= 79  precision=0.178 recall=0.683  cost=₹55,160
fixed t* = 20/520 = 0.038          TP=174 FP=1110 FN= 75  precision=0.136 recall=0.699  cost=₹59,700</div>
  <p>Reading the test-set results:</p>
  <ul>
    <li><strong>Default t = 0.5</strong> costs ₹80,620: high precision, but 161 frauds missed.</li>
    <li><strong>Tuned for cost</strong> picks t = 0.07 and costs ₹54,260, a third less, from the same model. It accepts 463 false alarms to catch 71 more frauds, exactly the 25 : 1 trade the costs ask for.</li>
    <li><strong>Tuned for F1</strong> (t = 0.22) looks balanced but costs ₹62,460: F1's "FP = FN" assumption is wrong for this business.</li>
    <li><strong>Balanced accuracy</strong> (Youden, t = 0.05) lands near the cost optimum because N/P ≈ 39 is close to the true cost ratio 25.</li>
    <li><strong>The formula t* = 0.038</strong> is close to the tuned 0.07 because logistic regression is nearly calibrated, but it over-flags a little (₹59,700), a sign that the probabilities are not perfectly calibrated at the low end and that 249 frauds is a small sample for this choice. With a badly calibrated model the gap would be far larger.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Setting a cricket team's batting order in the nets (validation folds), then playing the match (test set). If you rearranged the order after seeing the match scorecard, the result would no longer say anything about your selection skill.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>TunedThresholdClassifierCV(estimator, scoring=..., cv=...)</code> chooses the decision threshold that maximises a scorer by cross-validation; <code>best_threshold_</code> stores it. <code>FixedThresholdClassifier(estimator, threshold=t)</code> wraps a model so that <code>predict</code> uses t. Both are in <code>sklearn.model_selection</code> (scikit-learn ≥ 1.5).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Threshold tuning changes <code>predict</code>, not <code>predict_proba</code>. If downstream code reads probabilities and applies its own 0.5, the tuned threshold is silently ignored. And when prevalence or costs change in production, the threshold must be re-tuned.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> The cost formula t* works only if the probabilities are honest, and we have no way yet to check whether they are. <b>→ next: 06 Reliability diagrams</b></div>

  <h2 id="tc-reliab"><span class="num">06</span>Reliability Diagrams, Built by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>The cost formula t* = 0.038 assumes that when the model says 0.75, fraud happens 75% of the time. For the 10 transactions we have never checked whether that is true.</p></div>
  <h3>The idea</h3>
  <p>One prediction cannot be checked: T3 got 0.80 and was legit, but an honest 80% forecast is wrong 20% of the time. So group rows with similar predictions and compare the group's <strong>average prediction</strong> (its "confidence") with its <strong>observed positive rate</strong>. If the model is calibrated, the two match in every group.</p>
  <h3>By hand: 5 bins of width 0.2</h3>
  <div class="fx" data-lang="py">import numpy as np
from ten import ids, score, y
from sklearn.calibration import calibration_curve
from sklearn.metrics import brier_score_loss

edges = np.array([0, 0.2, 0.4, 0.6, 0.8, 1.0])
b = np.searchsorted(edges[1:-1], score)              # bins (0,0.2], (0.2,0.4], ... as sklearn does
print("bin          rows      n  confidence (mean p)  observed fraud rate   gap")
ece, mce, rel, res = 0, 0, 0, 0
for k in range(5):
    m = b == k
    conf, acc, n = score[m].mean(), y[m].mean(), m.sum()
    gap = abs(acc - conf); ece += n / 10 * gap; mce = max(mce, gap)
    rel += n / 10 * (conf - acc) ** 2; res += n / 10 * (acc - y.mean()) ** 2
    rows = " ".join(i for i, mm in zip(ids, m) if mm)
    print(f"({edges[k]:.1f}, {edges[k+1]:.1f}]  {rows:8s}  {n}        {conf:.3f}               {acc:.3f}          {gap:.3f}")
print(f"\\nECE = Σ (n_b/n)·gap = {ece:.3f}    MCE = largest gap = {mce:.3f}")
frac, mean = calibration_curve(y, score, n_bins=5)
print("sklearn calibration_curve -&gt; mean p", mean.round(3), " observed", frac.round(3))
unc = y.mean() * (1 - y.mean())
print(f"\\nBrier = {brier_score_loss(y, score):.4f}")
print(f"reliability {rel:.4f} - resolution {res:.4f} + uncertainty {unc:.4f} = {rel - res + unc:.4f}")
print(f"(the gap {brier_score_loss(y, score) - (rel - res + unc):.4f} comes from p varying inside each bin)")</div>
  <div class="fx" data-lang="text">bin          rows      n  confidence (mean p)  observed fraud rate   gap
(0.0, 0.2]  T9 T10    2        0.150               0.000          0.150
(0.2, 0.4]  T7 T8     2        0.350               0.000          0.350
(0.4, 0.6]  T5 T6     2        0.500               0.500          0.000
(0.6, 0.8]  T3 T4     2        0.750               0.500          0.250
(0.8, 1.0]  T1 T2     2        0.900               1.000          0.100

ECE = Σ (n_b/n)·gap = 0.170    MCE = largest gap = 0.350
sklearn calibration_curve -&gt; mean p [0.15 0.35 0.5  0.75 0.9 ]  observed [0.  0.  0.5 0.5 1. ]

Brier = 0.1660
reliability 0.0435 - resolution 0.1400 + uncertainty 0.2400 = 0.1435
(the gap 0.0225 comes from p varying inside each bin)</div>
  <p>Each bin happens to hold two rows. In words:</p>
  <ul>
    <li>(0, 0.2]: T9, T10 average 0.15, no fraud: the model says 15%, reality 0%.</li>
    <li>(0.2, 0.4]: T7, T8 average 0.35, no fraud: says 35%, reality 0%: the biggest gap.</li>
    <li>(0.4, 0.6]: T5, T6 average 0.50, one fraud: perfect.</li>
    <li>(0.6, 0.8]: T3, T4 average 0.75, one fraud: says 75%, reality 50%.</li>
    <li>(0.8, 1.0]: T1, T2 average 0.90, both fraud: says 90%, reality 100%.</li>
  </ul>
  <p>Plot observed rate (y-axis) against mean prediction (x-axis): that is the <strong>reliability diagram</strong> (or calibration curve). The diagonal is perfect calibration.</p>
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
  <h3>Reading the shape</h3>
  <ul>
    <li>Points <strong>below</strong> the diagonal: the model's p is too high there (over-predicts).</li>
    <li>Points <strong>above</strong>: p is too low there.</li>
    <li><strong>Over-confident</strong> model (too close to 0 and 1): above the diagonal at the low end, below at the high end; the curve is flatter than the diagonal.</li>
    <li><strong>Under-confident</strong> model (too close to 0.5): the reverse; the curve is steeper than the diagonal.</li>
  </ul>
  <p>With 10 rows every bin has 2 points, so these gaps are mostly noise; a real reliability diagram needs hundreds of rows per bin (section 12 shows one on 4,000 rows). Always print the count per bin, and prefer <code>strategy="quantile"</code> bins (equal counts) when predictions are concentrated near 0, as in fraud.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Checking a weather forecaster: collect all the days she said "70%" and count how many had rain. Then the "30%" days, and so on. One day proves nothing; a year of days plotted this way shows whether her percentages mean anything.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>reliability diagram</strong> partitions [0, 1] into bins B₁…B_M and plots, for each bin, conf(B_m) = mean of p over its rows against acc(B_m) = fraction of positives among its rows. sklearn: <code>calibration_curve(y, p, n_bins=, strategy="uniform" | "quantile")</code> returns (observed fraction, mean predicted), in that order; <code>CalibrationDisplay</code> draws it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>calibration_curve</code> silently drops empty bins and uses bins of the form (a, b]: 0.20 falls in the first bin, not the second. Its return order is (prob_true, prob_pred), the reverse of what many people expect.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> A diagram is a picture; to compare models we need a number. And we would like that number to separate "honest" from "useful", since a model that always says 0.4 is perfectly honest and completely useless. <b>→ next: 07 The Brier score and its decomposition</b></div>

  <h2 id="tc-brier"><span class="num">07</span>The Brier Score and Its Decomposition</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>The reliability diagram showed gaps, but a model that always predicts the base rate 0.4 would sit exactly on the diagonal and still be useless. We need a single score that rewards both honesty and the ability to tell rows apart, and that tells us which of the two is weak.</p></div>
  <h3>Recap: Brier score</h3>
  <p>Brier = mean (p − y)² = <strong>0.166</strong> on the 10 rows (computed by hand in <a class="xref" data-note="ml_evaluation">Classification Metrics</a>). Always predicting 0.4 gives 0.24; always 0.5 gives 0.25.</p>
  <h3>Murphy's decomposition, by hand</h3>
  <p>Group rows into the bins of section 06 (n_b = rows in bin b, conf_b = mean p, obs_b = fraud rate, ȳ = 0.4 overall). Then:</p>
  <p><strong>Brier ≈ Reliability − Resolution + Uncertainty</strong></p>
  <table class="tbl">
    <tr><th>Term</th><th>Formula</th><th>By hand (each bin has n_b/n = 0.2)</th><th>Value</th><th>Want it</th></tr>
    <tr><td><strong>Reliability</strong> (calibration error)</td><td>Σ (n_b/n)(conf_b − obs_b)²</td><td>0.2 × (0.15² + 0.35² + 0² + 0.25² + 0.10²) = 0.2 × 0.2175</td><td>0.0435</td><td>small</td></tr>
    <tr><td><strong>Resolution</strong> (separation)</td><td>Σ (n_b/n)(obs_b − ȳ)²</td><td>0.2 × (0.4² + 0.4² + 0.1² + 0.1² + 0.6²) = 0.2 × 0.70</td><td>0.140</td><td>large</td></tr>
    <tr><td><strong>Uncertainty</strong> (difficulty)</td><td>ȳ(1 − ȳ)</td><td>0.4 × 0.6</td><td>0.240</td><td>fixed by the data</td></tr>
  </table>
  <p>0.0435 − 0.140 + 0.240 = 0.1435, close to the true Brier 0.166; the remaining 0.0225 is the spread of predictions inside each bin (the decomposition is exact only if every row in a bin has the same p). What it tells us:</p>
  <ul>
    <li><strong>Uncertainty</strong> is how hard the problem is; no model changes it. It equals the Brier score of always predicting the base rate.</li>
    <li><strong>Resolution</strong> is how much the bins' real fraud rates differ from the base rate: the model's ability to separate risky from safe rows. A constant 0.4 forecast has resolution 0.</li>
    <li><strong>Reliability</strong> is the calibration penalty. Recalibration (sections 09–11) attacks this term while leaving resolution mostly untouched.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A forecaster's marks are "how hard was the climate" (uncertainty) minus "how well she told rainy days from dry ones" (resolution) plus "how wrong her percentages were" (reliability). A desert is easy; telling days apart earns credit; dishonest percentages lose it.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Murphy decomposition</strong> (1973): BS = REL − RES + UNC with REL = Σ (n_b/n)(conf_b − obs_b)², RES = Σ (n_b/n)(obs_b − ȳ)², UNC = ȳ(1 − ȳ); exact when forecasts take only the bin values. The <strong>Brier skill score</strong> = 1 − BS / UNC (here 1 − 0.166/0.24 = 0.31) is the R² of probabilities: the share of the base-rate forecast's error removed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A low Brier score does not prove good calibration: a sharp, well-separating model can have a low Brier and still be miscalibrated. Look at the reliability term (or ECE) separately. And Brier values are only comparable at the same base rate, because UNC changes with it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> The reliability term 0.0435 is in squared probability units. People want something plainer: "on average, how many percentage points off are the stated probabilities?" <b>→ next: 08 ECE and MCE</b></div>

  <h2 id="tc-ece"><span class="num">08</span>Expected and Maximum Calibration Error</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Reliability 0.0435 is hard to explain to a manager. We want "the model's probabilities are typically X points off", and also "the worst group is off by Y".</p></div>
  <h3>By hand</h3>
  <p>Take the absolute gap |obs_b − conf_b| of each bin and average them, weighting each bin by its share of rows:</p>
  <p>ECE = Σ (n_b/n) · |obs_b − conf_b| = 0.2 × (0.15 + 0.35 + 0 + 0.25 + 0.10) = 0.2 × 0.85 = <strong>0.17</strong></p>
  <p>MCE = maxᵦ |obs_b − conf_b| = <strong>0.35</strong> (the (0.2, 0.4] bin).</p>
  <p>Read: "on average, the stated fraud probability is 17 percentage points away from the real rate; in the worst group, 35 points." Both values are in the code output of section 06. On the 4,000-row data of section 12, logistic regression has ECE 0.013 (1.3 points), boosting 0.033.</p>
  <h3>Choices that change ECE</h3>
  <ul>
    <li><strong>Number of bins.</strong> Few bins hide miscalibration; many bins make each gap noisy (and ECE grows from noise alone). 10–15 is common.</li>
    <li><strong>Equal-width vs equal-count bins.</strong> With fraud scores piled near 0, equal-width bins leave the top bins nearly empty; equal-count bins are more stable.</li>
    <li><strong>Binary vs "top-label" ECE.</strong> For multiclass models, ECE is usually computed on the highest probability and whether that class was right.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop's scales checked with test weights. ECE is the average error across all the weights you tried; MCE is the error on the worst one. A customer buying one item cares about the worst case; the inspector's report quotes the average.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ECE</strong> = Σ_b (n_b/n) |acc(B_b) − conf(B_b)|; <strong>MCE</strong> = max_b |acc(B_b) − conf(B_b)|. Both are 0 for a perfectly calibrated model (in the limit of infinite data). Neither is in sklearn; the helper <code>ece()</code> in this note's data module is three lines.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>ECE is not a proper scoring rule: a model that always predicts the base rate has ECE ≈ 0 and is useless. Use ECE to <em>diagnose</em> calibration and log loss or Brier to <em>compare</em> models.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We can now measure miscalibration (ECE 0.17), but not repair it. Can a simple function turn the raw scores into honest probabilities? <b>→ next: 09 Platt scaling</b></div>

  <h2 id="tc-platt"><span class="num">09</span>Platt Scaling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>The scores of the 10 transactions rank well (AUC 0.875) but are 17 points off on average. We want to keep the ranking and replace each score by an honest probability.</p></div>
  <h3>The idea</h3>
  <p>Fit a one-feature logistic regression whose only input is the model's score s:</p>
  <p>p_calibrated = σ(a·s + b) = 1 / (1 + e^−(a·s + b))</p>
  <p>Two numbers are learnt: a stretches or squeezes (a &gt; 1 spreads probabilities toward 0 and 1, a &lt; 1 pulls them to the middle), b shifts them up or down. Because σ is increasing (for a &gt; 0), the ranking and AUC are unchanged. John Platt proposed it in 1999 to turn SVM distances into probabilities.</p>
  <h3>The fit</h3>
  <p>a and b are chosen to minimise log loss on held-out rows. Platt added one trick against overfitting: instead of targets 1 and 0, use softened targets (N₊ + 1)/(N₊ + 2) for positives and 1/(N₋ + 2) for negatives. With 4 frauds and 6 legit rows: 5/6 = 0.833 and 1/8 = 0.125. The code below fits it from scratch and checks against sklearn's own routine:</p>
  <div class="fx" data-lang="py"># Platt scaling from scratch on the 10 rows: p = sigmoid(a·score + b), a and b fitted by log loss
import numpy as np
from scipy.optimize import minimize
from ten import ids, score, y
from sklearn.calibration import _sigmoid_calibration     # sklearn's internal Platt routine (for checking)
from sklearn.metrics import log_loss, brier_score_loss

n_pos, n_neg = y.sum(), (1 - y).sum()
target = np.where(y == 1, (n_pos + 1) / (n_pos + 2), 1 / (n_neg + 2))   # Platt's softened labels: 5/6 and 1/8
print("soft targets: fraud -&gt;", round((n_pos + 1) / (n_pos + 2), 4), " legit -&gt;", round(1 / (n_neg + 2), 4))

def loss(ab):
    p = 1 / (1 + np.exp(-(ab[0] * score + ab[1])))
    p = np.clip(p, 1e-12, 1 - 1e-12)
    return -np.mean(target * np.log(p) + (1 - target) * np.log(1 - p))
a, b = minimize(loss, x0=[1.0, 0.0], method="BFGS").x
A, B = _sigmoid_calibration(score, y)                     # sklearn writes p = 1/(1+exp(A·s + B))
print(f"from scratch: a = {a:.3f}, b = {b:.3f}     sklearn: a = {-A:.3f}, b = {-B:.3f}")

p_platt = 1 / (1 + np.exp(-(a * score + b)))
for i, s, q, t in zip(ids, score, p_platt, y):
    print(f"{i:&gt;3}  score {s:.2f} -&gt; Platt {q:.3f}   (truth {t})")
for name, p in [("raw scores", score), ("Platt", p_platt)]:
    print(f"{name:10s} log loss {log_loss(y, p):.4f}   Brier {brier_score_loss(y, p):.4f}")</div>
  <div class="fx" data-lang="text">soft targets: fraud -&gt; 0.8333  legit -&gt; 0.125
from scratch: a = 3.690, b = -2.416     sklearn: a = 3.690, b = -2.416
 T1  score 0.95 -&gt; Platt 0.748   (truth 1)
 T2  score 0.85 -&gt; Platt 0.673   (truth 1)
 T3  score 0.80 -&gt; Platt 0.631   (truth 0)
 T4  score 0.70 -&gt; Platt 0.542   (truth 1)
 T5  score 0.55 -&gt; Platt 0.405   (truth 0)
 T6  score 0.45 -&gt; Platt 0.320   (truth 1)
 T7  score 0.40 -&gt; Platt 0.281   (truth 0)
 T8  score 0.30 -&gt; Platt 0.213   (truth 0)
 T9  score 0.20 -&gt; Platt 0.157   (truth 0)
T10  score 0.10 -&gt; Platt 0.114   (truth 0)
raw scores log loss 0.4973   Brier 0.1660
Platt      log loss 0.4817   Brier 0.1567</div>
  <h3>Reading the result</h3>
  <p>a = 3.69, b = −2.42. Check one row by hand: T1, s = 0.95: a·s + b = 3.69 × 0.95 − 2.42 = 1.09; σ(1.09) = 1/(1 + e^−1.09) = 1/(1 + 0.336) = 0.748. The mapping pulls the extremes in (0.95 → 0.75, 0.10 → 0.11) because the soft targets and the few rows make the sigmoid cautious. Log loss falls 0.497 → 0.482 and Brier 0.166 → 0.157. The order of the rows is unchanged.</p>
  <p>Caveat: here we fitted and evaluated on the same 10 rows, so the improvement is optimistic. In practice the calibrator must be fitted on rows the model did not train on (section 11).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A thermometer that reads consistently too high in summer and too low in winter. You do not rebuild it; you fit a correction curve from a few known temperatures. Platt's correction is restricted to one S-shaped curve with two knobs.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Platt scaling</strong>: p = σ(a·f(x) + b), with a, b minimising the log loss (with Platt's smoothed targets) of held-out (f(x), y) pairs, where f is a score or a logit. sklearn: <code>CalibratedClassifierCV(method="sigmoid")</code>. It suits small calibration sets and distortions that are S-shaped (typical of SVMs and boosting).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Platt can only bend probabilities along one sigmoid. If the reliability curve has another shape (say over-confident at one end only), Platt cannot fix it, and it can even make an already-calibrated model worse.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> What if the distortion is not S-shaped? We need a calibrator that can follow any monotone shape. <b>→ next: 10 Isotonic regression</b></div>

  <h2 id="tc-iso"><span class="num">10</span>Isotonic Regression</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Platt forces the correction into one S-curve. The 10 rows' reliability diagram (0.15 → 0, 0.35 → 0, 0.5 → 0.5, 0.75 → 0.5, 0.9 → 1) is not obviously S-shaped. We want the most flexible correction that still never breaks the order "higher score → higher probability".</p></div>
  <h3>The idea</h3>
  <p>Find the non-decreasing step function g that is closest (in squared error) to the 0/1 labels, as a function of the score. "Non-decreasing" (isotonic) keeps the ranking (up to ties); otherwise the shape is free.</p>
  <h3>Pool Adjacent Violators (PAV), by hand</h3>
  <p>Sort the rows by score, lowest first, and write their labels: T10 0, T9 0, T8 0, T7 0, T6 1, T5 0, T4 1, T3 0, T2 1, T1 1. Walk left to right; whenever a value is larger than the next one (a <em>violation</em> of "non-decreasing"), replace both by their average, and re-check to the left.</p>
  <div class="fx" data-lang="py"># isotonic regression by Pool-Adjacent-Violators (PAV), from scratch, on the 10 rows
import numpy as np
from ten import ids, score, y
from sklearn.isotonic import IsotonicRegression

order = np.argsort(score)                        # lowest score first
blocks = [[float(y[i]), 1, [ids[i]]] for i in order]   # [mean, size, rows]
print("start :", " ".join(f"{b[0]:.0f}" for b in blocks))
step = 0
i = 0
while i &lt; len(blocks) - 1:
    if blocks[i][0] &gt; blocks[i + 1][0]:         # a violation: higher value before a lower one
        m1, n1, r1 = blocks[i]; m2, n2, r2 = blocks[i + 1]
        blocks[i:i + 2] = [[(m1 * n1 + m2 * n2) / (n1 + n2), n1 + n2, r1 + r2]]   # pool them
        step += 1
        print(f"pool {step}: {'+'.join(r1)} with {'+'.join(r2)} -&gt; " + " | ".join(f"{b[0]:.2f}" for b in blocks))
        i = max(i - 1, 0)                        # pooling can create a new violation to the left
    else:
        i += 1
for m, n, r in blocks:
    print(f"block {', '.join(r):18s} -&gt; calibrated p = {m:.3f}")

iso = IsotonicRegression(out_of_bounds="clip").fit(score, y)
print("sklearn IsotonicRegression, T1..T10:", " ".join(f"{v:.2f}" for v in iso.predict(score)))
from sklearn.metrics import roc_auc_score, log_loss
print(f"AUC raw {roc_auc_score(y, score):.3f} -&gt; isotonic {roc_auc_score(y, iso.predict(score)):.3f}  (T3..T6 now tie)")
print(f"log loss raw {log_loss(y, score):.3f} -&gt; isotonic {log_loss(y, iso.predict(score)):.3f}  (in-sample: far too optimistic)")</div>
  <div class="fx" data-lang="text">start : 0 0 0 0 1 0 1 0 1 1
pool 1: T6 with T5 -&gt; 0.00 | 0.00 | 0.00 | 0.00 | 0.50 | 1.00 | 0.00 | 1.00 | 1.00
pool 2: T4 with T3 -&gt; 0.00 | 0.00 | 0.00 | 0.00 | 0.50 | 0.50 | 1.00 | 1.00
block T10                -&gt; calibrated p = 0.000
block T9                 -&gt; calibrated p = 0.000
block T8                 -&gt; calibrated p = 0.000
block T7                 -&gt; calibrated p = 0.000
block T6, T5             -&gt; calibrated p = 0.500
block T4, T3             -&gt; calibrated p = 0.500
block T2                 -&gt; calibrated p = 1.000
block T1                 -&gt; calibrated p = 1.000
sklearn IsotonicRegression, T1..T10: 1.00 1.00 0.50 0.50 0.50 0.50 0.00 0.00 0.00 0.00
AUC raw 0.875 -&gt; isotonic 0.917  (T3..T6 now tie)
log loss raw 0.497 -&gt; isotonic 0.277  (in-sample: far too optimistic)</div>
  <ol>
    <li>T6 (1) is followed by T5 (0): violation. Pool them: (1 + 0)/2 = 0.5, 0.5.</li>
    <li>Next, T4 (1) followed by T3 (0): violation. Pool: 0.5, 0.5.</li>
    <li>Now the sequence is 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 1, 1: non-decreasing. Done.</li>
  </ol>
  <p>The calibrated probabilities: T7–T10 get 0, T3–T6 get 0.5, T1–T2 get 1. sklearn's <code>IsotonicRegression</code> gives the same values. Notice three things. The four middle rows now <strong>tie</strong>, so in-sample AUC changed (0.875 → 0.917: tied pairs earn half credit instead of being wrongly ordered). The outputs 0 and 1 are <strong>certainties</strong> learnt from 2–4 rows: a new legit-looking transaction at score 0.35 would get probability 0, and if it were fraud, log loss would be infinite. And the in-sample log loss (0.277) is wildly optimistic. Isotonic regression needs many held-out rows (roughly 1,000+) to be trusted.</p>
  <table class="tbl">
    <tr><th></th><th>Platt (sigmoid)</th><th>Isotonic</th></tr>
    <tr><td>Shape</td><td>One S-curve, 2 parameters</td><td>Any non-decreasing steps</td></tr>
    <tr><td>Data needed</td><td>Small sets fine</td><td>Large (≈ 1,000+ rows)</td></tr>
    <tr><td>Ranking / AUC</td><td>Unchanged</td><td>Unchanged up to ties (can change AUC slightly)</td></tr>
    <tr><td>Risk</td><td>Wrong shape (bias)</td><td>Overfitting; outputs of exactly 0 or 1</td></tr>
    <tr><td>10-row result</td><td>0.11 … 0.75, smooth</td><td>0, 0.5, 1</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Marking a staircase on a hill: you may only go up or stay level as you walk right. Wherever the ground dips, you fill the dip with the average height of the dip and its neighbour until the path never goes down.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Isotonic calibration</strong>: g = argmin over non-decreasing functions of Σ (yᵢ − g(sᵢ))², solved exactly in O(n) after sorting by the PAV algorithm; the calibrated probability is g(s). sklearn: <code>IsotonicRegression(out_of_bounds="clip")</code>, or <code>CalibratedClassifierCV(method="isotonic")</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never fit isotonic (or Platt) on the model's training rows: a model that memorised its training data gives near-perfect scores there, and the calibrator learns "trust the model completely". Use cross-validation or a separate calibration set.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> Both calibrators need rows the model never trained on. How do we get them without wasting data, and how is it done in one line of sklearn? <b>→ next: 11 CalibratedClassifierCV</b></div>

  <h2 id="tc-cccv"><span class="num">11</span>CalibratedClassifierCV: Calibrating Without Leaking</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Sections 09–10 fitted the calibrator on the same 10 rows they evaluated, which is cheating. A real calibrator must learn from scores the model produced on rows it never trained on. Where do those rows come from, and what does sklearn do for us?</p></div>
  <h3>A bigger version of the story</h3>
  <p>To see calibration reliably we need thousands of rows. This module builds a fraud-like dataset with 20% positives (4,000 training and 4,000 test rows) and defines the ECE helper:</p>
  <div class="fx" data-lang="py"># calib_data.py - a medium-sized fraud-like dataset (20% positives) for comparing calibration
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np
X, y = make_classification(n_samples=8000, n_features=20, n_informative=6, n_redundant=6,
                           weights=[0.8], random_state=1)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.5, stratify=y, random_state=0)

def ece(y, p, bins=10):
    """expected calibration error with equal-width bins"""
    b = np.minimum((p * bins).astype(int), bins - 1)
    return sum(abs(y[b == k].mean() - p[b == k].mean()) * (b == k).mean() for k in range(bins) if (b == k).any())</div>
  <h3>Option 1: cross-validation inside the calibrator</h3>
  <p><code>CalibratedClassifierCV(model, method=..., cv=5)</code> splits the training data into 5 folds. For each fold it trains a copy of the model on the other 4 folds, scores the held-out fold, and fits a calibrator on those out-of-fold scores. At prediction time:</p>
  <ul>
    <li><code>ensemble=True</code> (what the default <code>ensemble="auto"</code> does unless the model is frozen): keep all 5 (model, calibrator) pairs and average their calibrated probabilities. More robust, 5× the prediction cost.</li>
    <li><code>ensemble=False</code>: fit one calibrator on all out-of-fold scores (like <code>cross_val_predict</code>), then refit one model on all the data. Cheaper at prediction time; it is what sklearn now recommends for SVMs instead of <code>SVC(probability=True)</code>, which is deprecated in this version.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
from calib_data import X_tr, y_tr, X_te, y_te, ece
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, log_loss, brier_score_loss

def show(name, m):
    p = m.fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
    print(f"{name:36s} AUC={roc_auc_score(y_te, p):.3f}  logloss={log_loss(y_te, p):.3f}  "
          f"Brier={brier_score_loss(y_te, p):.4f}  ECE={ece(y_te, p):.3f}")

show("GaussianNB (raw)", GaussianNB())
show("GaussianNB + sigmoid (Platt), cv=5", CalibratedClassifierCV(GaussianNB(), method="sigmoid", cv=5))
show("GaussianNB + isotonic, cv=5", CalibratedClassifierCV(GaussianNB(), method="isotonic", cv=5))
rf = RandomForestClassifier(200, random_state=0, n_jobs=1)
show("RandomForest (raw)", rf)
show("RandomForest + isotonic, cv=5", CalibratedClassifierCV(rf, method="isotonic", cv=5))
show("SVC + sigmoid, cv=5, ensemble=False", CalibratedClassifierCV(SVC(), method="sigmoid", cv=5, ensemble=False))</div>
  <div class="fx" data-lang="text">GaussianNB (raw)                     AUC=0.951  logloss=0.272  Brier=0.0701  ECE=0.046
GaussianNB + sigmoid (Platt), cv=5   AUC=0.951  logloss=0.235  Brier=0.0672  ECE=0.014
GaussianNB + isotonic, cv=5          AUC=0.951  logloss=0.222  Brier=0.0659  ECE=0.017
RandomForest (raw)                   AUC=0.978  logloss=0.167  Brier=0.0386  ECE=0.032
RandomForest + isotonic, cv=5        AUC=0.978  logloss=0.152  Brier=0.0372  ECE=0.007
SVC + sigmoid, cv=5, ensemble=False  AUC=0.980  logloss=0.125  Brier=0.0317  ECE=0.009</div>
  <p>For Naive Bayes, Platt cuts ECE from 0.046 to 0.014 and isotonic cuts log loss from 0.272 to 0.222. For the forest, isotonic cuts ECE from 0.032 to 0.007. For the SVC, which has no probabilities at all, Platt on out-of-fold distances gives the best log loss of the table (0.125). In every case AUC stays the same (to three decimals): calibration repairs the numbers, not the ranking.</p>
  <h3>Option 2: a frozen model and a separate calibration set</h3>
  <p>If the model is already trained (or expensive to retrain), hold back a calibration set, freeze the model, and fit only the calibrator. <code>FrozenEstimator</code> stops <code>CalibratedClassifierCV</code> from refitting it (it replaces the old <code>cv="prefit"</code>). Here also <strong>temperature scaling</strong>, which divides the model's logit by one learnt number T (T &gt; 1 softens over-confident outputs):</p>
  <div class="fx" data-lang="py"># an already-trained model + a separate calibration set: freeze the model, fit only the calibrator
from calib_data import X_tr, y_tr, X_te, y_te, ece
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.frozen import FrozenEstimator
from sklearn.metrics import roc_auc_score, log_loss, brier_score_loss

X_fit, X_cal, y_fit, y_cal = train_test_split(X_tr, y_tr, test_size=0.3, stratify=y_tr, random_state=0)
gbm = HistGradientBoostingClassifier(max_iter=300, early_stopping=False, random_state=0).fit(X_fit, y_fit)

def show(name, m):
    p = m.predict_proba(X_te)[:, 1]
    print(f"{name:22s} AUC={roc_auc_score(y_te, p):.3f}  logloss={log_loss(y_te, p):.3f}  "
          f"Brier={brier_score_loss(y_te, p):.4f}  ECE={ece(y_te, p):.3f}")
show("boosting (raw)", gbm)
for method in ["sigmoid", "isotonic", "temperature"]:
    cal = CalibratedClassifierCV(FrozenEstimator(gbm), method=method).fit(X_cal, y_cal)
    show(f"+ {method} on X_cal", cal)</div>
  <div class="fx" data-lang="text">boosting (raw)         AUC=0.976  logloss=0.283  Brier=0.0410  ECE=0.038
+ sigmoid on X_cal     AUC=0.976  logloss=0.136  Brier=0.0363  ECE=0.010
+ isotonic on X_cal    AUC=0.975  logloss=0.154  Brier=0.0371  ECE=0.013
+ temperature on X_cal AUC=0.976  logloss=0.136  Brier=0.0362  ECE=0.009</div>
  <p>300 rounds of boosting without early stopping produce over-confident probabilities: log loss 0.283 despite AUC 0.976. Fitting a calibrator on 1,200 held-out rows halves the log loss (0.136) and cuts ECE to about 0.01. Sigmoid and temperature agree closely for a binary problem (temperature is Platt with b = 0, applied to the logit); isotonic is slightly worse here because 1,200 rows is not much for a step function, and it lowers AUC a little through ties.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Calibrating a new thermometer against a reference you have not used to make it. Testing it against the very bath you used to set it up tells you nothing.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>CalibratedClassifierCV(estimator, method="sigmoid" | "isotonic" | "temperature", cv=k, ensemble=True | False)</code> fits calibrators on out-of-fold predictions; with <code>FrozenEstimator(fitted_model)</code> it fits only the calibrator on the data passed to <code>fit</code>. It uses <code>decision_function</code> if available, else <code>predict_proba</code>. Temperature scaling: p = softmax(z / T) for logits z.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The calibration rows must not be used to choose the threshold <em>and</em> report the test score. A clean split is: train (model) → calibration/validation (calibrator and threshold, or CV inside both) → test (report once).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We repaired Naive Bayes, a forest, an SVM and boosting, but did not explain why each was miscalibrated, or which way. Knowing the cause tells you when to expect trouble. <b>→ next: 12 Which models are miscalibrated, and why</b></div>

  <h2 id="tc-why"><span class="num">12</span>Which Models Are Miscalibrated, and Why</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Logistic regression needed no repair, Naive Bayes and boosting did, and the forest needed a different kind of repair. We cannot yet predict, before looking, which model will lie and in which direction.</p></div>
  <div class="fx" data-lang="py">import numpy as np
from calib_data import X_tr, y_tr, X_te, y_te, ece
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.calibration import calibration_curve
from sklearn.metrics import roc_auc_score, log_loss, brier_score_loss

models = {"LogisticRegression": LogisticRegression(max_iter=1000),
          "GaussianNB": GaussianNB(),
          "RandomForest": RandomForestClassifier(200, random_state=0, n_jobs=1),
          "HistGradientBoosting": HistGradientBoostingClassifier(max_iter=300, early_stopping=False, random_state=0)}
for name, m in models.items():
    p = m.fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
    frac, mean = calibration_curve(y_te, p, n_bins=5)
    print(f"{name:20s} AUC={roc_auc_score(y_te, p):.3f} logloss={log_loss(y_te, p):.3f} Brier={brier_score_loss(y_te, p):.4f} "
          f"ECE={ece(y_te, p):.3f}")
    print(f"{'':20s} predicted→observed: " + "  ".join(f"{a:.2f}→{b:.2f}" for a, b in zip(mean, frac)))
svc = SVC(kernel="rbf").fit(X_tr, y_tr)
d = svc.decision_function(X_te)
print(f"SVC decision_function: AUC={roc_auc_score(y_te, d):.3f}, values from {d.min():.2f} to {d.max():.2f}  (a distance, not a probability)")</div>
  <div class="fx" data-lang="text">LogisticRegression   AUC=0.961 logloss=0.191 Brier=0.0532 ECE=0.013
                     predicted→observed: 0.02→0.03  0.29→0.27  0.50→0.56  0.70→0.73  0.93→0.93
GaussianNB           AUC=0.951 logloss=0.272 Brier=0.0701 ECE=0.046
                     predicted→observed: 0.02→0.03  0.29→0.22  0.49→0.35  0.71→0.55  0.96→0.83
RandomForest         AUC=0.978 logloss=0.167 Brier=0.0386 ECE=0.032
                     predicted→observed: 0.03→0.01  0.29→0.21  0.49→0.55  0.71→0.86  0.92→0.98
HistGradientBoosting AUC=0.978 logloss=0.242 Brier=0.0377 ECE=0.033
                     predicted→observed: 0.00→0.03  0.29→0.49  0.48→0.63  0.72→0.64  0.99→0.93
SVC decision_function: AUC=0.980, values from -3.90 to 3.80  (a distance, not a probability)</div>
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
  <table class="tbl">
    <tr><th>Model</th><th>Typical direction</th><th>Why</th><th>Seen here</th></tr>
    <tr><td>Logistic regression</td><td>Well calibrated</td><td>It directly minimises log loss, a proper scoring rule, with a sigmoid output (if the model is not badly misspecified and not heavily regularised)</td><td>ECE 0.013, 0.70 → 0.73</td></tr>
    <tr><td>Naive Bayes</td><td>Over-confident, pushed to 0 and 1</td><td>It multiplies evidence from features as if independent; correlated features are counted several times</td><td>says 0.96, real 0.83; ECE 0.046</td></tr>
    <tr><td>Random forest</td><td>Under-confident, pulled to the middle</td><td>Averaging many trees rarely gives all-0 or all-1 votes; bootstrap and feature sampling add noise that drags extremes inward</td><td>says 0.71, real 0.86; says 0.29, real 0.21</td></tr>
    <tr><td>Boosting (many rounds), deep nets</td><td>Over-confident</td><td>Training keeps pushing the margins of already-correct rows; log loss on training data goes toward 0</td><td>says 0.29, real 0.49; log loss 0.242 despite AUC 0.978</td></tr>
    <tr><td>SVM</td><td>No probabilities</td><td><code>decision_function</code> is a signed distance (−3.9 … 3.8 here), not a probability</td><td>Platt on out-of-fold scores</td></tr>
    <tr><td>kNN, single trees</td><td>Coarse, extreme</td><td>Leaf or neighbour fractions like 0/5 or 5/5 give probabilities 0 and 1</td><td>(see their notes)</td></tr>
  </table>
  <h3>Re-weighting and resampling break calibration</h3>
  <p>A model trained with <code>class_weight="balanced"</code>, undersampling or SMOTE learns as if positives were common, so its probabilities are too high. If you know the real positive rate π and the training rate π′ (0.5 for balanced weighting), Bayes' rule moves the probability back:</p>
  <p>p_corrected = p·(π/π′) / [ p·(π/π′) + (1 − p)·(1 − π)/(1 − π′) ]</p>
  <p>By hand, π = 0.2, π′ = 0.5, model says 0.80: numerator 0.8 × 0.4 = 0.32; other term 0.2 × 1.6 = 0.32; corrected = 0.32/0.64 = <strong>0.50</strong>.</p>
  <div class="fx" data-lang="py"># class_weight="balanced" (or undersampling) trains as if positives were 50%: probabilities come out too high
import numpy as np
from calib_data import X_tr, y_tr, X_te, y_te, ece
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, log_loss

pi = y_tr.mean()                                         # real fraud rate in training data
print(f"real positive rate π = {pi:.3f}")
plain = LogisticRegression(max_iter=1000).fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
bal = LogisticRegression(max_iter=1000, class_weight="balanced").fit(X_tr, y_tr).predict_proba(X_te)[:, 1]

def correct(p, pi, pi_train=0.5):
    """Bayes prior-shift correction: move probabilities from the training prior to the real prior"""
    a = p * pi / pi_train
    b = (1 - p) * (1 - pi) / (1 - pi_train)
    return a / (a + b)
fixed = correct(bal, pi)
for name, p in [("plain", plain), ("balanced", bal), ("balanced, corrected", fixed)]:
    print(f"{name:20s} mean p={p.mean():.3f}  AUC={roc_auc_score(y_te, p):.3f}  logloss={log_loss(y_te, p):.3f}  ECE={ece(y_te, p):.3f}")
print(f"by hand: balanced model says 0.80 -&gt; corrected {correct(np.array(0.8), 0.2):.3f} (with π = 0.2)")</div>
  <div class="fx" data-lang="text">real positive rate π = 0.203
plain                mean p=0.199  AUC=0.961  logloss=0.191  ECE=0.013
balanced             mean p=0.280  AUC=0.961  logloss=0.240  ECE=0.078
balanced, corrected  mean p=0.197  AUC=0.961  logloss=0.193  ECE=0.014
by hand: balanced model says 0.80 -&gt; corrected 0.500 (with π = 0.2)</div>
  <p>Balanced weighting raises the average prediction from 0.199 to 0.280 (true rate 0.203) and ECE from 0.013 to 0.078; AUC is unchanged. The one-line correction brings the mean back to 0.197 and ECE to 0.014. The same formula handles <strong>prior shift</strong> in production (fraud rate changes from 2% to 4%): only π changes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor trained in a cancer ward, where half the patients have cancer, will overestimate the risk of every patient in a general clinic. The fix is not to retrain her but to tell her the clinic's base rate.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Over-confident</strong>: predicted probabilities more extreme than observed frequencies; <strong>under-confident</strong>: less extreme. <strong>Prior-shift correction</strong>: rescale the odds by (π/(1 − π)) / (π′/(1 − π′)), equivalent to the formula above.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not assume a model's calibration from its family alone: a heavily regularised logistic regression is under-confident, and early-stopped boosting can be well calibrated. Always plot the reliability curve on held-out data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We have threshold rules and calibrators. In what order do we apply them, and on which data? <b>→ next: 13 The full workflow</b></div>

  <h2 id="tc-flow"><span class="num">13</span>The Full Workflow and a Comparison</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Each technique was shown alone. In a real project, does calibration come before or after threshold tuning, and how is the data split so that neither leaks?</p></div>
  <div class="flow"><span>Train the model (train split)</span><span>Check ranking: AUC / AP</span><span>Check calibration: reliability, ECE, Brier</span><span>Calibrate if needed (CV or calibration split)</span><span>Choose t: cost → t*, or tune by CV</span><span>Report once on test; re-check as prevalence drifts</span></div>
  <ul>
    <li><strong>Calibrate first, threshold second.</strong> Calibration does not change the ranking, so a threshold tuned by search ends at the same rows either way, but only after calibration does t* = C_FP/(C_FP + C_FN) apply and do the probabilities mean something to downstream users.</li>
    <li><strong>If you only need a decision</strong> (no probabilities used anywhere), you can skip calibration and tune t directly by CV (section 05).</li>
    <li><strong>If you only need probabilities</strong> (pricing, expected loss), calibrate and evaluate with log loss / Brier / ECE; no threshold needed.</li>
  </ul>
  <h3>Comparison: the calibration methods</h3>
  <table class="tbl">
    <tr><th></th><th>Platt (sigmoid)</th><th>Isotonic</th><th>Temperature</th><th>Prior correction</th></tr>
    <tr><td>Parameters</td><td>a, b</td><td>a step function (up to n steps)</td><td>T</td><td>none (π known)</td></tr>
    <tr><td>Fixes</td><td>S-shaped distortions</td><td>Any monotone distortion</td><td>Over/under-confidence of logits</td><td>Base-rate mismatch</td></tr>
    <tr><td>Data needed</td><td>Small</td><td>Large</td><td>Small</td><td>None</td></tr>
    <tr><td>Keeps ranking</td><td>Yes</td><td>Up to ties</td><td>Yes (also top class in multiclass)</td><td>Yes</td></tr>
    <tr><td>Typical use</td><td>SVM, boosting, small data</td><td>Forests, NB, big data</td><td>Neural nets, multiclass</td><td>class_weight, resampling, drift</td></tr>
    <tr><td>Results here</td><td>NB ECE 0.046 → 0.014</td><td>RF ECE 0.032 → 0.007</td><td>GBM log loss 0.283 → 0.136</td><td>ECE 0.078 → 0.014</td></tr>
  </table>
  <h3>Comparison: threshold rules</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Needs</th><th>10 rows</th><th>Fraud data (test cost)</th></tr>
    <tr><td>Default 0.5</td><td>nothing</td><td>₹540</td><td>₹80,620</td></tr>
    <tr><td>Cost-minimising search</td><td>costs</td><td>t = 0.45, ₹40</td><td>t = 0.07, ₹54,260</td></tr>
    <tr><td>t* formula</td><td>costs + calibration</td><td>0.038 (scores not calibrated: ₹120)</td><td>₹59,700</td></tr>
    <tr><td>Youden / balanced accuracy</td><td>nothing</td><td>t = 0.45</td><td>t = 0.05, ₹55,160</td></tr>
    <tr><td>F1-optimal</td><td>nothing</td><td>t = 0.45</td><td>t = 0.22, ₹62,460</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Prevalence drift breaks both steps: probabilities become miscalibrated (prior shift) and the precision at the chosen threshold changes. Monitor the mean predicted probability against the observed rate in production.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> We have the workflow; one picture showing how every concept in this note feeds the next is still missing. <b>→ next: 14 How It All Connects</b></div>

  <h2 id="tc-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Thresholds and calibration were taught as two halves. How does every concept in this note grow out of the same 10 scores and truths, and where does each half need the other?</p></div>
  <figure class="viz"><svg viewBox="0 0 660 340" width="660">
<defs><marker id="tc-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="200" y="10" width="260" height="42" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="28" text-anchor="middle" font-size="12.5" font-weight="700">10 scores + 10 truths</text><text x="330" y="44" text-anchor="middle" font-size="11">AUC 0.875 (ranking is fine)</text>
<line x1="260" y1="52" x2="140" y2="84" stroke="currentColor" marker-end="url(#tc-a1)"/><line x1="400" y1="52" x2="520" y2="84" stroke="currentColor" marker-end="url(#tc-a1)"/>
<text x="150" y="72" class="tb" font-size="11">DECISIONS</text><text x="440" y="72" class="tg" font-size="11">PROBABILITIES</text>
<rect x="20" y="86" width="240" height="40" rx="8" class="fb sb"/><text x="140" y="103" text-anchor="middle" font-size="11">confusion matrix at every t</text><text x="140" y="118" text-anchor="middle" font-size="11" font-weight="700">TP/FP/FN/TN per threshold</text>
<line x1="140" y1="126" x2="140" y2="148" stroke="currentColor" marker-end="url(#tc-a1)"/>
<rect x="20" y="150" width="240" height="40" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="140" y="167" text-anchor="middle" font-size="11">with costs: Σ cost(t) → min</text><text x="140" y="182" text-anchor="middle" font-size="11" font-weight="700">t = 0.45, ₹40 (vs ₹540)</text>
<line x1="140" y1="190" x2="140" y2="212" stroke="currentColor" marker-end="url(#tc-a1)"/>
<rect x="20" y="214" width="240" height="40" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="140" y="231" text-anchor="middle" font-size="11">no costs: J, F1, recall floor</text><text x="140" y="246" text-anchor="middle" font-size="11" font-weight="700">0.45 · 0.45 · 0.70</text>
<line x1="140" y1="254" x2="140" y2="276" stroke="currentColor" marker-end="url(#tc-a1)"/>
<rect x="20" y="278" width="240" height="40" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="140" y="295" text-anchor="middle" font-size="11">tune by CV, report on test</text><text x="140" y="310" text-anchor="middle" font-size="11" font-weight="700">fraud: ₹80,620 → ₹54,260</text>
<rect x="400" y="86" width="240" height="40" rx="8" class="fg sg"/><text x="520" y="103" text-anchor="middle" font-size="11">bins: mean p vs observed rate</text><text x="520" y="118" text-anchor="middle" font-size="11" font-weight="700">reliability diagram</text>
<line x1="520" y1="126" x2="520" y2="148" stroke="currentColor" marker-end="url(#tc-a1)"/>
<rect x="400" y="150" width="240" height="40" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.3"/><text x="520" y="167" text-anchor="middle" font-size="11">Brier = REL − RES + UNC · ECE</text><text x="520" y="182" text-anchor="middle" font-size="11" font-weight="700">.044 − .140 + .240 · ECE .17</text>
<line x1="520" y1="190" x2="520" y2="212" stroke="currentColor" marker-end="url(#tc-a1)"/>
<rect x="400" y="214" width="240" height="40" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.3"/><text x="520" y="231" text-anchor="middle" font-size="11">fix: Platt σ(a·s+b) · isotonic PAV</text><text x="520" y="246" text-anchor="middle" font-size="11" font-weight="700">a 3.69, b −2.42 · 0 / 0.5 / 1</text>
<line x1="520" y1="254" x2="520" y2="276" stroke="currentColor" marker-end="url(#tc-a1)"/>
<rect x="400" y="278" width="240" height="40" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.3"/><text x="520" y="295" text-anchor="middle" font-size="11">CalibratedClassifierCV, cv=5</text><text x="520" y="310" text-anchor="middle" font-size="11" font-weight="700">NB 0.272 → 0.222 log loss</text>
<path d="M400 298 Q 330 298 330 220 Q 330 170 262 170" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#tc-a1)"/>
<text x="330" y="206" text-anchor="middle" class="tm" font-size="10">t* = C_FP/(C_FP+C_FN)</text><text x="330" y="219" text-anchor="middle" class="tm" font-size="10">needs calibrated p</text>
<text x="330" y="336" text-anchor="middle" class="tm" font-size="10.5">left: decisions · right: honest numbers · dashed: calibration unlocks t*</text>
</svg><figcaption>The two halves of this note. Threshold choice works on any score by searching; calibration makes the score an honest probability, after which the threshold can also be computed directly from costs.</figcaption></figure>
  <h3>One table on the running example</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Built from</th><th>10 rows</th><th>Question it answers</th><th>Weakness → next</th></tr>
    <tr><td>Score vs probability</td><td>model output</td><td>AUC 0.875 for 3 versions</td><td>Does the number mean anything?</td><td>0.5 is arbitrary</td></tr>
    <tr><td>Cost-minimising t</td><td>confusion matrix per t + costs</td><td>0.45 (₹40)</td><td>Cheapest decision</td><td>Needs costs</td></tr>
    <tr><td>t* formula</td><td>expected cost of each action</td><td>0.038</td><td>Threshold without search</td><td>Needs calibrated p</td></tr>
    <tr><td>Youden's J</td><td>max TPR − FPR</td><td>0.45, J 0.667</td><td>Best balance of both classes</td><td>Hidden cost ratio N/P</td></tr>
    <tr><td>F1-optimal t</td><td>max F1(t)</td><td>0.45, F1 0.80</td><td>Best P–R balance</td><td>Ignores TN</td></tr>
    <tr><td>Recall floor</td><td>max precision s.t. recall ≥ 0.75</td><td>0.70, P 0.75</td><td>Policy constraint</td><td>Chosen on same rows</td></tr>
    <tr><td>CV threshold tuning</td><td>out-of-fold scores</td><td>(fraud) 0.07</td><td>Honest t</td><td>Assumes p ranking only</td></tr>
    <tr><td>Reliability diagram</td><td>bins of p</td><td>0.35 → 0, 0.75 → 0.5</td><td>Are p honest?</td><td>A picture, not a number</td></tr>
    <tr><td>Brier decomposition</td><td>bins + base rate</td><td>0.044 − 0.140 + 0.240</td><td>Honest vs useful</td><td>Squared units</td></tr>
    <tr><td>ECE / MCE</td><td>|gap| per bin</td><td>0.17 / 0.35</td><td>Points off, average / worst</td><td>Not proper; bin-dependent</td></tr>
    <tr><td>Platt</td><td>logistic fit on s</td><td>a 3.69, b −2.42</td><td>Smooth repair</td><td>Only S-shapes</td></tr>
    <tr><td>Isotonic</td><td>PAV on sorted labels</td><td>0 / 0.5 / 1</td><td>Any monotone repair</td><td>Needs much data</td></tr>
    <tr><td>CalibratedClassifierCV</td><td>out-of-fold calibrator</td><td>(NB) ECE 0.046 → 0.014</td><td>Repair without leaking</td><td>Must know which models need it</td></tr>
    <tr><td>Prior correction</td><td>Bayes' rule on the odds</td><td>0.80 → 0.50</td><td>Undo re-weighting / drift</td><td>Needs the true π</td></tr>
  </table>
  <h3>Links back to the rest of the group</h3>
  <ul>
    <li>Youden's J = KS = the largest vertical gap of the ROC curve; balanced accuracy at that threshold = (1 + J)/2 (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>).</li>
    <li>Platt scaling is <a class="xref" data-note="ml_classification">logistic regression</a> with one feature, the score; its fit minimises log loss.</li>
    <li>Brier = MSE of probabilities; its skill score 1 − BS/UNC is the R² of <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>; isotonic regression is least squares under a monotone constraint.</li>
  </ul>
  <div class="bridge"><b>What this still can't tell us.</b> Knowing how the pieces connect does not stop the usual mistakes. <b>→ next: 15 Common Mistakes</b></div>

  <h2 id="tc-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Which errors in thresholding and calibration appear again and again in projects and interviews?</p></div>
  <div class="cards">
    <div><b>Shipping t = 0.5</b><p>On the fraud data it cost ₹80,620 vs ₹54,260 after tuning: same model.</p><small>Section 05</small></div>
    <div><b>Tuning t on the test set</b><p>The reported cost becomes optimistic. Tune by CV or on validation.</p><small>Section 05</small></div>
    <div><b>t* on uncalibrated scores</b><p>On the 10 rows 0.038 flags everything (₹120 vs ₹40).</p><small>Section 02</small></div>
    <div><b>Calibrating on training rows</b><p>The calibrator learns to trust a model that memorised. Use out-of-fold scores or a held-out set.</p><small>Section 11</small></div>
    <div><b>Isotonic on small data</b><p>On 10 rows it output hard 0 and 1; one surprise gives infinite log loss.</p><small>Section 10</small></div>
    <div><b>"High AUC so the probabilities are fine"</b><p>Boosting had AUC 0.978 and log loss 0.242, worse than a forest with the same AUC.</p><small>Section 12</small></div>
    <div><b>Forgetting re-weighting</b><p>class_weight="balanced" raised mean p from 0.199 to 0.280; correct with the prior formula.</p><small>Section 12</small></div>
    <div><b>Using ECE to pick a model</b><p>A constant base-rate forecast has ECE ≈ 0. Compare with log loss or Brier.</p><small>Section 08</small></div>
    <div><b>SVC(probability=True)</b><p>Deprecated in scikit-learn 1.9; use <code>CalibratedClassifierCV(SVC(), ensemble=False)</code>.</p><small>Section 11</small></div>
    <div><b>Ignoring prevalence drift</b><p>Precision at t = 0.45 falls from 0.67 to 0.11 if fraud drops from 40% to 4%.</p><small>Section 04</small></div>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b> To revise the whole note in ten minutes, use the sheet below. <b>→ next: Revision Sheet, then 16 Questions &amp; Answers</b></div>

  <h2 id="tc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example (from Classification Metrics): 10 transactions with scores 0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10 for T1–T10; frauds are T1, T2, T4, T6 (P = 4, N = 6, base rate 0.4). A missed fraud costs ₹500, a review ₹20.</p>
  <h3>The question ladder in one line each</h3>
  <ol>
    <li><strong>Scores vs probabilities</strong>: ranking (AUC) is not honesty (calibration); 0.5 is arbitrary.</li>
    <li><strong>Cost-based threshold</strong>: sweep t, minimise 500·FN + 20·FP → t = 0.45, ₹40 (₹540 at 0.5).</li>
    <li><strong>t* formula</strong>: flag if p &gt; C_FP/(C_FP + C_FN) = 0.038, valid only for calibrated p.</li>
    <li><strong>Without costs</strong>: Youden's J (0.45), F1-optimal (0.45), recall ≥ 0.75 → best precision (0.70), top-k.</li>
    <li><strong>Trade-off</strong>: lower t → recall up, precision usually down; precision depends on prevalence.</li>
    <li><strong>Safe tuning</strong>: choose t by CV (<code>TunedThresholdClassifierCV</code>); fraud data ₹80,620 → ₹54,260.</li>
    <li><strong>Reliability diagram</strong>: bin p, compare mean p with observed rate.</li>
    <li><strong>Brier decomposition</strong>: REL − RES + UNC = 0.044 − 0.140 + 0.240.</li>
    <li><strong>ECE / MCE</strong>: 0.17 / 0.35 points off.</li>
    <li><strong>Platt</strong>: σ(a·s + b), a = 3.69, b = −2.42.</li>
    <li><strong>Isotonic</strong>: PAV → 0, 0.5, 1; flexible, needs data.</li>
    <li><strong>CalibratedClassifierCV</strong>: calibrator on out-of-fold scores, or <code>FrozenEstimator</code> + calibration set.</li>
    <li><strong>Who lies</strong>: NB and boosting over-confident, forests under-confident, SVM no probabilities, re-weighting inflates p.</li>
  </ol>
  <h3>Every formula</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Formula</th><th>Symbols</th><th>Running example</th></tr>
    <tr><td>Cost of a threshold</td><td>C(t) = C_FN·FN(t) + C_FP·FP(t)</td><td>FN(t), FP(t) at threshold t</td><td>t = 0.45: 500·0 + 20·2 = ₹40</td></tr>
    <tr><td>Bayes threshold</td><td>t* = C_FP / (C_FP + C_FN)</td><td>needs calibrated p</td><td>20/520 = 0.038</td></tr>
    <tr><td>Youden's J</td><td>J = TPR − FPR</td><td>max over t</td><td>1 − 2/6 = 0.667 at 0.45</td></tr>
    <tr><td>F1 at t</td><td>2·P(t)·R(t)/(P(t) + R(t))</td><td>max over t</td><td>0.80 at 0.45</td></tr>
    <tr><td>Precision at prevalence π</td><td>TPR·π / (TPR·π + FPR·(1 − π))</td><td>π = positive rate</td><td>π 0.4 → 0.667; π 0.04 → 0.11</td></tr>
    <tr><td>Calibration</td><td>P(y = 1 | p = q) = q</td><td></td><td>bin 0.75 → 0.50 observed</td></tr>
    <tr><td>ECE</td><td>Σ_b (n_b/n)|obs_b − conf_b|</td><td>b = bin</td><td>0.2 × 0.85 = 0.17</td></tr>
    <tr><td>MCE</td><td>max_b |obs_b − conf_b|</td><td></td><td>0.35</td></tr>
    <tr><td>Brier decomposition</td><td>REL − RES + UNC</td><td>REL = Σ(n_b/n)(conf_b − obs_b)², RES = Σ(n_b/n)(obs_b − ȳ)², UNC = ȳ(1 − ȳ)</td><td>0.0435 − 0.140 + 0.240 ≈ 0.166</td></tr>
    <tr><td>Platt</td><td>p = 1/(1 + e^−(a·s + b))</td><td>fit by log loss, soft targets (N₊+1)/(N₊+2), 1/(N₋+2)</td><td>T1: σ(1.09) = 0.748</td></tr>
    <tr><td>Isotonic</td><td>min Σ(yᵢ − g(sᵢ))², g non-decreasing</td><td>PAV: pool adjacent violators</td><td>0,0,0,0,½,½,½,½,1,1</td></tr>
    <tr><td>Temperature</td><td>p = softmax(z/T)</td><td>z = logits, T &gt; 1 softens</td><td>(boosting log loss 0.283 → 0.136)</td></tr>
    <tr><td>Prior correction</td><td>p·(π/π′) / [p·(π/π′) + (1 − p)(1 − π)/(1 − π′)]</td><td>π real, π′ training rate</td><td>0.80 → 0.50 (π 0.2, π′ 0.5)</td></tr>
  </table>
  <h3>When to use which</h3>
  <div class="cards">
    <div><b>Search over t</b><p>Whenever you need decisions; works for any score. Do it inside CV.</p><small>Costs or a rule needed</small></div>
    <div><b>t* formula</b><p>Only after calibration; handy when costs change often (recompute instantly).</p><small>Wrong on raw scores</small></div>
    <div><b>Platt</b><p>Small calibration sets, S-shaped distortion (SVM, boosting).</p><small>2 parameters</small></div>
    <div><b>Isotonic</b><p>Large calibration sets (1,000+), any monotone distortion (forests, NB).</p><small>Can overfit, creates ties</small></div>
    <div><b>Temperature</b><p>Neural nets and multiclass models; one parameter, keeps the top class.</p><small>Same as Platt without shift</small></div>
    <div><b>Prior correction</b><p>After class_weight, undersampling, SMOTE, or a known change in base rate.</p><small>Needs the true rate</small></div>
  </div>
  <h3>The traps to remember</h3>
  <ul>
    <li>Calibrate and tune on data the model did not train on; report once on test.</li>
    <li>Calibration never fixes ranking: AUC stays the same (isotonic can shift it slightly via ties).</li>
    <li>ECE diagnoses; log loss and Brier compare. A base-rate constant has ECE ≈ 0.</li>
    <li>Re-check thresholds and calibration whenever prevalence or costs change.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <details class="qa"><summary><span class="qmark">Q</span>A miss costs ₹500, a false alarm ₹20. Bayes threshold for calibrated p?</summary><div class="qa-body">20/520 = 0.038.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bins with (conf, observed) = (0.15, 0), (0.35, 0), (0.5, 0.5), (0.75, 0.5), (0.9, 1), equal sizes. ECE?</summary><div class="qa-body">(0.15 + 0.35 + 0 + 0.25 + 0.10)/5 = 0.17.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>PAV on labels 0, 1, 0, 1, 1 (sorted by score)?</summary><div class="qa-body">Pool the 1, 0 pair: 0, 0.5, 0.5, 1, 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Platt scaling change ROC-AUC?</summary><div class="qa-body">No: σ(a·s + b) with a &gt; 0 is increasing, so the ranking is unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Random forest probabilities: over- or under-confident, and why?</summary><div class="qa-body">Usually under-confident: averaging many trees' votes pulls probabilities toward the middle.</div></details>

  <h2 id="tc-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Can you now answer, with numbers, the threshold and calibration questions an interviewer asks?</p></div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a good ranker and a calibrated model? Give an example of each failing.</summary><div class="qa-body">A good ranker puts positives above negatives (high AUC); a calibrated model's p comes true at rate p. Squaring the 10 scores keeps AUC 0.875 but changes every probability; a model that always predicts the base rate is perfectly calibrated with AUC 0.5. Gradient boosting with 300 rounds had AUC 0.978 but was over-confident (log loss 0.283 until calibrated to 0.136).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the cost-optimal threshold for calibrated probabilities.</summary><div class="qa-body">Passing a row costs p·C_FN in expectation; flagging costs (1 − p)·C_FP. Flag when p·C_FN &gt; (1 − p)·C_FP ⇔ p &gt; C_FP/(C_FP + C_FN). With ₹500 and ₹20: 0.038. Equal costs give 0.5, which is the hidden assumption of predict().</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On the 10 rows the cost search gives 0.45 but the formula 0.038. Why the disagreement?</summary><div class="qa-body">The formula assumes calibrated probabilities. The 10 scores overstate risk at the low end (bins 0.15 and 0.35 had no fraud), so the formula flags everything (₹120) while the search finds ₹40 at 0.45. Search works with any score; the formula needs calibration first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Youden's J and what cost assumption does it hide?</summary><div class="qa-body">J = TPR − FPR, maximised over thresholds (0.667 at t = 0.45; equals the KS statistic and 2·balanced accuracy − 1). Maximising it minimises FN/P + FP/N, i.e. it assumes a miss costs N/P times a false alarm.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you choose a threshold in production, step by step?</summary><div class="qa-body">Agree costs (or a recall/precision floor, or capacity) with the business; get out-of-fold or validation scores at the real prevalence; search the threshold that optimises the business metric (TunedThresholdClassifierCV); report cost/precision/recall once on test; monitor prevalence and re-tune when it drifts. On the fraud data this cut cost from ₹80,620 to ₹54,260 without changing the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Build a reliability diagram and compute ECE for 10 predictions.</summary><div class="qa-body">Bin by predicted p (here 5 bins of 2 rows), compute each bin's mean p and observed positive rate: (0.15, 0), (0.35, 0), (0.5, 0.5), (0.75, 0.5), (0.9, 1). Plot observed vs mean with the diagonal. ECE = Σ (n_b/n)|gap| = 0.2 × 0.85 = 0.17; MCE = 0.35.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the Brier score decomposition and what each term means.</summary><div class="qa-body">Brier ≈ reliability − resolution + uncertainty. Reliability = calibration error (0.044 on the 10 rows), resolution = how much bin outcome rates differ from the base rate, the model's separating power (0.140), uncertainty = ȳ(1 − ȳ), the problem's difficulty (0.24). Calibration lowers reliability; better features raise resolution.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Platt scaling vs isotonic regression: how do they work and when do you use each?</summary><div class="qa-body">Platt fits p = σ(a·s + b) on held-out scores by log loss (2 parameters, Platt's soft targets); good for small data and S-shaped distortions; on 10 rows a = 3.69, b = −2.42. Isotonic fits the best non-decreasing step function by PAV; it can fix any monotone distortion but needs ~1,000+ rows, creates ties and can output hard 0/1 (on 10 rows: 0, 0.5, 1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CalibratedClassifierCV avoid leakage? What do ensemble and FrozenEstimator change?</summary><div class="qa-body">It fits the calibrator on predictions for rows the model copy did not train on (k-fold). ensemble=True keeps k (model, calibrator) pairs and averages; ensemble=False fits one calibrator on all out-of-fold predictions and refits one model. With FrozenEstimator(model), the trained model is kept as is and only the calibrator is fitted on the data you pass (a separate calibration set).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which models are typically miscalibrated, in which direction, and why?</summary><div class="qa-body">Naive Bayes: over-confident (independence assumption double-counts correlated features). Random forests: under-confident (averaging pulls toward 0.5). Boosting with many rounds and deep nets: over-confident (they keep pushing margins). SVMs: no probabilities (distances). Logistic regression: close, because it minimises log loss. Always verify with a reliability curve.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You trained with class_weight="balanced". What happens to the probabilities and how do you fix them?</summary><div class="qa-body">The model behaves as if positives were 50%, so p is inflated (mean 0.280 vs true rate 0.203; ECE 0.078). AUC is unchanged. Correct with Bayes' rule: odds × (π/(1 − π))/(π′/(1 − π′)); a balanced model's 0.80 becomes 0.50 at π = 0.2. Or recalibrate on held-out data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does calibration change ROC-AUC? Does threshold tuning change log loss?</summary><div class="qa-body">Platt and temperature are strictly increasing maps, so AUC is unchanged; isotonic can change it slightly through ties (0.976 → 0.975 on the boosting example). Threshold tuning changes only predict(), not predict_proba(), so log loss and Brier are unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How does Platt scaling relate to logistic regression?</summary><div class="qa-body">It is a logistic regression with a single input, the model's score (or logit), fitted on held-out rows by minimising log loss, with Platt's smoothed targets against overfitting (<a class="xref" data-note="ml_classification">Logistic Regression</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How do ROC and PR curves from Classification Metrics help choose a threshold?</summary><div class="qa-body">Each point of either curve is one threshold's operating point. Youden's J is the ROC point farthest above the diagonal; a recall floor or precision floor is read off the PR curve; the cost-optimal point lies where the ROC curve's slope equals (C_FP·N)/(C_FN·P) (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How is the Brier skill score like R²?</summary><div class="qa-body">Both are 1 − (model's squared error)/(baseline's squared error). R² uses the mean of y as the baseline (<a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>); the Brier skill score uses the base rate, whose Brier score is the uncertainty term ȳ(1 − ȳ). On the 10 rows: 1 − 0.166/0.24 = 0.31.</div></details>
</main>
`
});
