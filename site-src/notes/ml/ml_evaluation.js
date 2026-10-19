// notes/ml/ml_evaluation.js — Classification Metrics
Object.assign(TOPIC_CONTENT, {
  "ml_evaluation": `<main>
  <h1>Classification Metrics</h1>
  <div class="where"><span>Machine Learning</span><span>Model Evaluation</span><span>Classification Metrics</span></div>
  <p class="lead">A fraud model reports "98.3% accurate", and still lets two out of every three frauds through. This note teaches every number used to judge a classifier, and when each one lies. Everything is first worked by hand on the same 10 scored transactions: the confusion matrix, accuracy, precision, recall, specificity, F1 and Fβ, balanced accuracy, MCC and kappa, the ROC curve and its AUC (as an area <em>and</em> as a ranking probability), the precision–recall curve and average precision, log loss (derived from likelihood) and the Brier score, and macro / micro / weighted averages for many classes. Then it shows how to choose a metric from what each mistake costs the business, and how to compute all of it with scikit-learn. This note also opens the Model Evaluation group.</p>

  <h2 id="ce-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>, <a class="xref" data-note="ml_classification">Logistic Regression</a> and the <a class="xref" data-note="ml_trees">tree models</a></b><span>The split note told you <em>where</em> to measure a model (on rows it never trained on, or with cross-validation). The classifier notes told you how to <em>produce</em> a score for each row. Each of those notes then printed "accuracy" and moved on. Left open: <em>what</em> number to compute on the held-out rows, and whether that number means what you think.</span></li>
    <li><b>This note: Classification Metrics (opens the Model Evaluation group)</b><span>Every standard way to score a yes/no (or many-class) model: the four kinds of right and wrong answers, the rates built from them, curves that judge the model at every threshold at once, scores for the probabilities themselves, averages across many classes, and how to turn real costs into the number you optimise.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a> and <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a></b><span>When the target is a number (price, demand) the confusion matrix makes no sense; the next note does the same job for regression: MAE, RMSE, R², MAPE and friends. The note after that answers the two questions this one leaves open: <em>which</em> threshold to use for the final yes/no, and whether a "0.8" from the model really means 80%.</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<defs><marker id="ce-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Model Evaluation</text>
<rect x="20" y="30" width="190" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="115" y="49" text-anchor="middle" font-size="12">Train/Val/Test &amp; CV</text><text x="115" y="65" text-anchor="middle" class="tm" font-size="10.5">WHERE to measure</text>
<rect x="235" y="30" width="190" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="49" text-anchor="middle" font-size="12">Classifiers &amp; regressors</text><text x="330" y="65" text-anchor="middle" class="tm" font-size="10.5">logistic, trees, SVM…</text>
<rect x="450" y="30" width="190" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="545" y="49" text-anchor="middle" font-size="12">Bias, Variance</text><text x="545" y="65" text-anchor="middle" class="tm" font-size="10.5">why test ≠ train score</text>
<line x1="115" y1="74" x2="300" y2="104" stroke="currentColor" marker-end="url(#ce-a0)"/><line x1="330" y1="74" x2="330" y2="104" stroke="currentColor" marker-end="url(#ce-a0)"/><line x1="545" y1="74" x2="360" y2="104" stroke="currentColor" marker-end="url(#ce-a0)"/>
<rect x="215" y="106" width="230" height="36" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="129" text-anchor="middle" font-size="13" font-weight="700">Model Evaluation group</text>
<line x1="270" y1="142" x2="115" y2="172" stroke="currentColor" marker-end="url(#ce-a0)"/><line x1="330" y1="142" x2="330" y2="172" stroke="currentColor" marker-end="url(#ce-a0)"/><line x1="390" y1="142" x2="545" y2="172" stroke="currentColor" marker-end="url(#ce-a0)"/>
<rect x="20" y="174" width="190" height="56" rx="8" class="fb sb" stroke-width="3"/><text x="115" y="195" text-anchor="middle" font-size="13" font-weight="700">Classification Metrics</text><text x="115" y="210" text-anchor="middle" class="tm" font-size="10.5">F1, AUC, log loss</text><text x="115" y="224" text-anchor="middle" class="tb" font-size="10">YOU ARE HERE</text>
<rect x="235" y="174" width="190" height="56" rx="8" class="ft st"/><text x="330" y="195" text-anchor="middle" font-size="13">Regression Metrics</text><text x="330" y="212" text-anchor="middle" class="tm" font-size="10.5">MAE, RMSE, R², MAPE</text>
<rect x="450" y="174" width="190" height="56" rx="8" class="fg sg"/><text x="545" y="195" text-anchor="middle" font-size="13">Thresholds &amp; Calibration</text><text x="545" y="212" text-anchor="middle" class="tm" font-size="10.5">cut-offs, reliability</text>
<line x1="210" y1="202" x2="233" y2="202" stroke="currentColor" marker-end="url(#ce-a0)"/><line x1="425" y1="202" x2="448" y2="202" stroke="currentColor" marker-end="url(#ce-a0)"/>
<path d="M115 230 Q 330 268 545 230" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ce-a0)"/>
<text x="330" y="262" text-anchor="middle" class="tm" font-size="10.5">ROC, PR, log loss, Brier feed threshold choice and calibration</text>
</svg><figcaption>The Model Evaluation group. Read the three notes in order: what to measure for classes, what to measure for numbers, then how to turn scores into decisions and honest probabilities.</figcaption></figure>
  <table class="tbl">
    <tr><th>Note in this group</th><th>Question it answers</th><th>Main tools</th></tr>
    <tr><td><strong>Classification Metrics</strong> (this note)</td><td>How good is a model that predicts a class or a class probability?</td><td>Confusion matrix, precision/recall, F1/Fβ, MCC, ROC-AUC, PR-AUC, log loss, Brier, macro/micro averages</td></tr>
    <tr><td><a class="xref" data-note="ml_reg_metrics">Regression Metrics</a></td><td>How good is a model that predicts a number?</td><td>MAE, MSE, RMSE, R², adjusted R², MAPE, sMAPE, MASE, RMSLE, residual plots, baselines</td></tr>
    <tr><td><a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a></td><td>Where do I cut the score, and can I trust the probability?</td><td>Cost-based threshold, Youden's J, F1-optimal cut, reliability diagram, ECE, Platt, isotonic</td></tr>
  </table>
  <p>You need: what a held-out test set is (<a class="xref" data-note="ml_splits">Train/Val/Test</a>), that a classifier can output a probability (<a class="xref" data-note="ml_classification">Logistic Regression</a>), and the natural log ln (<a class="xref" data-note="m_calculus">Calculus</a>). Probability words like "likelihood" are recalled in one line where used (<a class="xref" data-note="st_probability">Probability</a>).</p>

  <h2 id="ce-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>This note is one chain of questions. Each metric answers the question above it, and each answer has a weakness that raises the next question. All of them are computed on the same 10 scored transactions (4 frauds, scores 0.95 down to 0.10), so you can watch every new number being built from the previous ones.</p>
  <ol class="story">
    <li><b>Score and threshold</b><span>Q: what does a classifier actually give us? → a score per row (T1 = 0.95 … T10 = 0.10) that we cut at a threshold t = 0.5 to get flag / pass. But a flag can be right or wrong in two different ways…</span></li>
    <li><b>Confusion matrix</b><span>Q: how do the flags line up with the truth? → four counts: TP 3, FP 2, FN 1, TN 4. But four numbers are hard to compare between models…</span></li>
    <li><b>Accuracy</b><span>Q: one number for "how often right"? → (TP+TN)/n = 0.70. But it treats every row alike: with 2.5% fraud, "always legit" scores 97.5% and catches nothing…</span></li>
    <li><b>Precision, recall, specificity</b><span>Q: of the real frauds, how many did we catch, and of our alarms, how many were real? → recall 3/4 = 0.75, precision 3/5 = 0.60, specificity 4/6. But now there are two numbers pulling in opposite directions…</span></li>
    <li><b>F1 and Fβ</b><span>Q: one number that is high only when both are high? → the harmonic mean, F1 = 0.667 (F2 = 0.714 if misses matter more). But it ignores the TN cell entirely…</span></li>
    <li><b>Balanced accuracy, MCC, kappa</b><span>Q: one number that uses all four cells and is not fooled by imbalance? → balanced accuracy 0.708, MCC 0.408, κ 0.40. But all of these judge one threshold that we picked, not the model…</span></li>
    <li><b>ROC curve and AUC</b><span>Q: how good are the scores at every threshold at once? → slide t, plot TPR vs FPR; area = chance a random fraud outranks a random legit row = 21/24 = 0.875. But FPR hides how many false alarms come with each catch when fraud is rare…</span></li>
    <li><b>PR curve and average precision</b><span>Q: how clean is the top of the list? → precision vs recall; AP = 0.854 against a random 0.40. But ROC and PR only read the <em>order</em> of scores, not their values…</span></li>
    <li><b>Log loss and Brier</b><span>Q: are the probability values themselves good? → log loss 0.497, Brier 0.166 (always-0.5 gives 0.693 and 0.25). But every metric so far assumed exactly two classes…</span></li>
    <li><b>Macro, micro, weighted averages</b><span>Q: what if fraud splits into card fraud and takeover? → per-class F1 0.727 / 0.800 / 0.500; macro 0.676, weighted 0.696, micro = accuracy 0.70. But none of these numbers knows what a mistake costs…</span></li>
    <li><b>Business cost</b><span>Q: which metric should we optimise? → write the cost of each cell: 500·FN + 20·FP = ₹540 on the 10 rows; the cheaper model can have the worse F1. Then: compute it at scale with sklearn, with an interval, and pick the threshold and calibrate in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</span></li>
  </ol>
  <div class="bridge"><b>What this still can't tell us.</b> The ladder is the plot; the numbers behind each step come next. <b>→ next: the Mind Map, then 01 Scores, Thresholds and Decisions</b></div>

  <h2 id="ce-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Classification Metrics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Scores → decisions</div>
        <ul>
          <li>Model gives a <b>score</b> (often a probability); a <b>threshold</b> t turns it into yes/no</li>
          <li><b>Threshold metrics</b> judge the yes/no (accuracy, P, R, F1, MCC)</li>
          <li><b>Ranking metrics</b> judge the order (ROC-AUC, AP) · <b>probability metrics</b> judge the numbers (log loss, Brier)</li>
          <li>Running example: 10 transactions, 4 frauds, scores 0.95 … 0.10, t = 0.5</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Confusion matrix</div>
        <ul>
          <li><b>TP</b> caught · <b>FP</b> false alarm (Type I) · <b>FN</b> miss (Type II) · <b>TN</b> correct pass</li>
          <li>10 rows: TP 3, FP 2, FN 1, TN 4</li>
          <li>sklearn: rows = actual, cols = predicted, sorted labels → <code>ravel()</code> = tn, fp, fn, tp</li>
          <li><b>Accuracy</b> = (TP+TN)/n · ⚠ "always legit" = 97.5% on 2.5% fraud</li>
          <li>💡 Metal detector: buckle beeps (FP), knife silent (FN)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rates from the matrix</div>
        <ul>
          <li><b>Precision</b> TP/(TP+FP) = 3/5 — "when I flag, am I right?"</li>
          <li><b>Recall / TPR / sensitivity</b> TP/(TP+FN) = 3/4 — "how many did I catch?"</li>
          <li><b>Specificity / TNR</b> TN/(TN+FP) = 4/6 · <b>FPR</b> = 1 − spec · <b>NPV</b> TN/(TN+FN)</li>
          <li><b>F1</b> = 2PR/(P+R) = 0.667 (harmonic mean) · <b>Fβ</b>: β &gt; 1 favours recall</li>
          <li><b>Balanced acc</b> 0.708 · <b>MCC</b> 0.408 (uses all 4 cells) · <b>κ</b> 0.40</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ROC &amp; AUC</div>
        <ul>
          <li>Slide t from high to low; plot TPR against FPR</li>
          <li>Each positive = step up 1/P; each negative = step right 1/N</li>
          <li><b>AUC</b> = area = P(random positive scores above random negative) = 21/24 = 0.875</li>
          <li>Ties count ½ · Gini = 2·AUC − 1 · KS = max(TPR − FPR)</li>
          <li>Ignores class ratio and calibration; random = 0.5</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PR curve &amp; AP</div>
        <ul>
          <li>Precision against recall as t slides</li>
          <li><b>AP</b> = Σ (Rₙ − Rₙ₋₁)·Pₙ = 0.854 · random = positive rate (0.4)</li>
          <li>No trapezoids: straight lines between PR points are wrong</li>
          <li>⚠ Rare positives: ROC 0.837 at any rate, AP 0.878 → 0.576 as fraud rate 50% → 2.5%</li>
          <li>Rare positives you act on → PR / AP</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Probability scores</div>
        <ul>
          <li><b>Log loss</b> = −mean[y ln p + (1−y) ln(1−p)] = negative log-likelihood ÷ n; 0.497 on 10 rows</li>
          <li>Sure and wrong explodes: −ln 0.01 = 4.6 · always 0.5 = 0.693</li>
          <li><b>Brier</b> = mean (p − y)² = 0.166 · always 0.5 = 0.25</li>
          <li>Both <b>proper</b>: best expected score for honest probabilities</li>
          <li>Same accuracy and AUC, log loss 0.639 vs 1.093 (over-confident)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Many classes</div>
        <ul>
          <li>k×k matrix; per class: one-vs-rest TP, FP, FN</li>
          <li>Same 10 rows split into legit / card / takeover</li><li><b>Macro</b> = plain mean of class F1 (0.676) — small classes count equally</li>
          <li><b>Weighted</b> = mean by support (0.696) · <b>Micro</b> = pool counts = accuracy (0.700)</li>
          <li>Multiclass log loss = −mean ln p(true class) · AUC: ovr / ovo · top-k accuracy</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing &amp; computing</div>
        <ul>
          <li>Write down cost of FP and FN first: Model A cost ₹6,200 beats B ₹10,100 despite worse F1 and accuracy</li>
          <li><code>make_scorer(cost, greater_is_better=False)</code> → CV picks the cheap model</li>
          <li>Scoring strings: "f1", "roc_auc", "average_precision", "neg_log_loss" (sklearn maximises → neg_)</li>
          <li>Report an interval: bootstrap AP 0.576 [0.515, 0.633]</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ce-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">Every metric as the answer to a question</span></div></div>
      <div class="rm-item rm-done" data-target="ce-scores"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Scores, Thresholds, Decisions</span><span class="rm-sub">The 10-transaction example</span></div></div>
      <div class="rm-item rm-done" data-target="ce-cm"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Confusion Matrix</span><span class="rm-sub">Four kinds of answer, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ce-acc"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Accuracy and Why It Misleads</span><span class="rm-sub">The imbalance demo</span></div></div>
      <div class="rm-item rm-done" data-target="ce-pr"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Precision, Recall, Specificity</span><span class="rm-sub">And the whole family of rates</span></div></div>
      <div class="rm-item rm-done" data-target="ce-f1"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">F1 and Fβ</span><span class="rm-sub">Why the harmonic mean</span></div></div>
      <div class="rm-item rm-done" data-target="ce-mcc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Balanced Accuracy, MCC, Kappa</span><span class="rm-sub">One number that uses all four cells</span></div></div>
      <div class="rm-item rm-done" data-target="ce-roc"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">ROC Curve and AUC</span><span class="rm-sub">Built by hand; area = ranking</span></div></div>
      <div class="rm-item rm-done" data-target="ce-prc"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">PR Curve and Average Precision</span><span class="rm-sub">And ROC vs PR under imbalance</span></div></div>
      <div class="rm-item rm-done" data-target="ce-ll"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Log Loss and Brier Score</span><span class="rm-sub">Scoring the probabilities</span></div></div>
      <div class="rm-item rm-done" data-target="ce-multi"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Many Classes</span><span class="rm-sub">Macro, micro, weighted by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ce-cost"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Choosing a Metric by Cost</span><span class="rm-sub">From business loss to scorer</span></div></div>
      <div class="rm-item rm-done" data-target="ce-api"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">scikit-learn Metrics API</span><span class="rm-sub">Functions, scorers, intervals</span></div></div>
      <div class="rm-item rm-done" data-target="ce-compare"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Comparison Tables</span><span class="rm-sub">Every metric side by side</span></div></div>
      <div class="rm-item rm-done" data-target="ce-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="ce-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="ce-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ce-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ce-scores"><span class="num">01</span>Scores, Thresholds and Decisions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>We have a trained fraud model and a test set. But the model hands us a number per row, not a verdict, and "is it good?" can mean three different things. Before computing anything we must be clear about what exactly we are judging.</p></div>
  <h3>The need</h3>
  <p>You built a fraud model. Your manager asks one question: "Is it good?" To answer, you must compare what the model said with what really happened, on transactions it never trained on, and boil that comparison down to a number. Which number? That depends on what the model outputs and on what the bank will do with it. So first, look closely at what a classifier actually gives you.</p>
  <h3>Three kinds of output</h3>
  <p>Almost every classifier (logistic regression, a tree ensemble, a neural net) first computes a <strong>score</strong> per row: a number where higher means "more likely fraud". Often the score is a probability between 0 and 1 (<code>predict_proba</code>); sometimes it is any real number (<code>decision_function</code> of an SVM). To act, you need a yes/no, so you pick a <strong>threshold</strong> t and say "fraud if score ≥ t". sklearn's <code>predict()</code> uses t = 0.5 for probabilities.</p>
  <div class="flow"><span>Row of features</span><span>Model → score (e.g. 0.80)</span><span>Compare with threshold t</span><span>Decision: flag / pass</span></div>
  <p>That gives three families of metrics, one for each layer:</p>
  <table class="tbl">
    <tr><th>Family</th><th>Judges</th><th>Needs a threshold?</th><th>Examples (all in this note)</th></tr>
    <tr><td><strong>Threshold (decision) metrics</strong></td><td>The final yes/no labels</td><td>Yes</td><td>accuracy, precision, recall, specificity, F1, Fβ, balanced accuracy, MCC, kappa, cost</td></tr>
    <tr><td><strong>Ranking metrics</strong></td><td>Whether positives get higher scores than negatives</td><td>No (they try every t)</td><td>ROC-AUC, PR-AUC / average precision</td></tr>
    <tr><td><strong>Probability metrics</strong></td><td>Whether the probability values are honest and sharp</td><td>No</td><td>log loss, Brier score (and calibration, next notes)</td></tr>
  </table>
  <h3>The running example</h3>
  <p>A model scored 10 transactions from last week. Later, investigators confirmed which ones were really fraud (4 of the 10). We will compute every metric in this note on this table, by hand, before any library is used. The rows are already sorted by score, highest first.</p>
  <table class="tbl"><caption>10 transactions: score from the model, truth from the investigators</caption>
    <tr><th>Row</th><th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>T8</th><th>T9</th><th>T10</th></tr>
    <tr><td>score</td><td>0.95</td><td>0.85</td><td>0.80</td><td>0.70</td><td>0.55</td><td>0.45</td><td>0.40</td><td>0.30</td><td>0.20</td><td>0.10</td></tr>
    <tr><td>really fraud (y)</td><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  </table>
  <p>The same table as a tiny Python module, imported by later code blocks:</p>
  <div class="fx" data-lang="py"># ten.py - the 10 transactions used all through this note
import numpy as np
ids    = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"]
score  = np.array([0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10])  # model's fraud score
y      = np.array([1,    1,    0,    1,    0,    1,    0,    0,    0,    0   ])  # 1 = really fraud</div>
  <p>Notice what a good model looks like here: frauds mostly near the top, legit rows mostly near the bottom. The model is not perfect: T3 (legit) scored 0.80, above the real fraud T4, and T6 (fraud) scored only 0.45.</p>
  <figure class="viz"><svg viewBox="0 0 560 160" width="560">
    <line x1="20" y1="115" x2="540" y2="115" stroke="currentColor" opacity="0.5"/>
    <path d="M30 115 Q 150 -10 290 115" class="fs" stroke="currentColor" fill-opacity="0.5"/>
    <path d="M210 115 Q 340 10 480 115" class="fr sr" fill-opacity="0.35"/>
    <text x="150" y="70" text-anchor="middle">legit (negatives)</text><text x="380" y="62" text-anchor="middle" class="tr">fraud (positives)</text>
    <line x1="300" y1="20" x2="300" y2="122" class="sg" stroke-width="2"/>
    <text x="306" y="30" class="tg">threshold t</text>
    <text x="318" y="104" class="tr">TP</text><text x="268" y="104" class="tm">FP</text><text x="240" y="104" class="tr">FN</text><text x="80" y="104" class="tm">TN</text>
    <text x="20" y="140" class="tm">low score</text><text x="540" y="140" text-anchor="end" class="tm">high score →</text>
  </svg><figcaption>Every classifier in a picture. Grey hump: scores of legit rows; red hump: scores of frauds. Everything right of the green line is flagged. The overlap is where mistakes live; sliding the line trades one kind of mistake for the other.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An exam marks students 0–100 (the score). The pass mark (threshold) turns marks into pass/fail. "Is the exam good?" can mean three things: does it pass the right students at this pass mark (threshold metrics), does it rank good students above weak ones (ranking metrics), and does a mark of 70 really mean "70% ready" (probability metrics).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A binary <strong>classifier</strong> outputs a score s(x). A <strong>decision rule</strong> with threshold t predicts ŷ = 1 if s(x) ≥ t, else 0. The class we are looking for (fraud, disease, spam) is called the <strong>positive</strong> class (label 1); the other is the <strong>negative</strong> class. "Positive" means "the thing searched for", not "good".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every metric must be computed on rows the model did not train on (a test set, a validation set or out-of-fold predictions: see <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>). A perfect training score says only that the model memorised.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  We have scores and truths. Fix the threshold at 0.5 and count how the decisions line up with the truth. That count is the confusion matrix, and every threshold metric is built from it. <b>→ next: 02 The Confusion Matrix</b></div>

  <h2 id="ce-cm"><span class="num">02</span>The Confusion Matrix</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>We know the model's scores and the threshold (0.5) that turns them into flags. But we cannot yet say how the flags line up with the truth, because we have not named the different kinds of right and wrong answer.</p></div>
  <h3>Plain words</h3>
  <p>For a yes/no question, every answer lands in exactly one of four boxes:</p>
  <ul>
    <li><strong>True positive (TP)</strong>: it was fraud, the model flagged it. A catch.</li>
    <li><strong>False positive (FP)</strong>: it was legit, the model flagged it. A false alarm (statisticians: <em>Type I error</em>).</li>
    <li><strong>False negative (FN)</strong>: it was fraud, the model passed it. A miss (<em>Type II error</em>).</li>
    <li><strong>True negative (TN)</strong>: it was legit, the model passed it. Correctly left alone.</li>
  </ul>
  <p>The naming rule: the second word is what the model <em>said</em> (positive = flagged), the first word is whether that was <em>true</em>. So a "false negative" is a "no" that was wrong.</p>
  <h3>By hand at t = 0.5</h3>
  <p>Flag every row with score ≥ 0.5: that is T1–T5. Now label each row:</p>
  <table class="tbl">
    <tr><th>Row</th><th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>T8</th><th>T9</th><th>T10</th></tr>
    <tr><td>y</td><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>ŷ (score ≥ 0.5)</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>box</td><td>TP</td><td>TP</td><td>FP</td><td>TP</td><td>FP</td><td>FN</td><td>TN</td><td>TN</td><td>TN</td><td>TN</td></tr>
  </table>
  <p>Count: TP = 3 (T1, T2, T4), FP = 2 (T3, T5), FN = 1 (T6), TN = 4 (T7–T10). Check: 3 + 2 + 1 + 4 = 10 rows. Arrange the counts in a 2×2 grid, rows = what really happened, columns = what the model said:</p>
  <figure class="viz"><svg viewBox="0 0 560 220" width="560">
    <text x="300" y="16" text-anchor="middle" class="tm">predicted (ŷ)</text>
    <text x="240" y="34" text-anchor="middle">0 = pass</text><text x="360" y="34" text-anchor="middle">1 = flag</text>
    <text x="170" y="80" text-anchor="end">actual 0 (legit)</text><text x="170" y="150" text-anchor="end">actual 1 (fraud)</text>
    <rect x="180" y="42" width="120" height="70" class="fg sg"/><rect x="300" y="42" width="120" height="70" class="fr sr"/>
    <rect x="180" y="112" width="120" height="70" class="fr sr"/><rect x="300" y="112" width="120" height="70" class="fg sg"/>
    <g text-anchor="middle"><text x="240" y="76" font-weight="700">TN = 4</text><text x="240" y="94" class="tm">T7 T8 T9 T10</text>
      <text x="360" y="76" font-weight="700">FP = 2</text><text x="360" y="94" class="tm">T3 T5 · Type I</text>
      <text x="240" y="146" font-weight="700">FN = 1</text><text x="240" y="164" class="tm">T6 · Type II</text>
      <text x="360" y="146" font-weight="700">TP = 3</text><text x="360" y="164" class="tm">T1 T2 T4</text></g>
    <text x="432" y="80" class="tm">row total 6 = N</text><text x="432" y="150" class="tm">row total 4 = P</text>
    <text x="240" y="202" text-anchor="middle" class="tm">5 passed</text><text x="360" y="202" text-anchor="middle" class="tm">5 flagged</text>
  </svg><figcaption>The confusion matrix of the 10 transactions at threshold 0.5, in scikit-learn's layout. Green diagonal = correct, red off-diagonal = mistakes. Row totals are the real class sizes (P = 4 frauds, N = 6 legit); column totals are what the model said.</figcaption></figure>
  <p>The same count in code, then scikit-learn's <code>confusion_matrix</code>:</p>
  <div class="fx" data-lang="py">from ten import ids, score, y
from sklearn.metrics import confusion_matrix

pred = (score &gt;= 0.5).astype(int)          # threshold 0.5 turns scores into yes/no
for i, s, a, p in zip(ids, score, y, pred):
    kind = {(1, 1): "TP", (0, 1): "FP", (1, 0): "FN", (0, 0): "TN"}[(a, p)]
    print(f"{i:&gt;3}  score={s:.2f}  actual={a}  pred={p}  -&gt; {kind}")

TP = int(((y == 1) &amp; (pred == 1)).sum()); FN = int(((y == 1) &amp; (pred == 0)).sum())
FP = int(((y == 0) &amp; (pred == 1)).sum()); TN = int(((y == 0) &amp; (pred == 0)).sum())
print("by hand : TP =", TP, " FP =", FP, " FN =", FN, " TN =", TN)
cm = confusion_matrix(y, pred)             # rows = actual 0,1 ; columns = predicted 0,1
print("sklearn :\\n", cm)
tn, fp, fn, tp = cm.ravel()                # the order is TN, FP, FN, TP
print("ravel() -&gt; tn, fp, fn, tp =", tn, fp, fn, tp)</div>
  <div class="fx" data-lang="text"> T1  score=0.95  actual=1  pred=1  -&gt; TP
 T2  score=0.85  actual=1  pred=1  -&gt; TP
 T3  score=0.80  actual=0  pred=1  -&gt; FP
 T4  score=0.70  actual=1  pred=1  -&gt; TP
 T5  score=0.55  actual=0  pred=1  -&gt; FP
 T6  score=0.45  actual=1  pred=0  -&gt; FN
 T7  score=0.40  actual=0  pred=0  -&gt; TN
 T8  score=0.30  actual=0  pred=0  -&gt; TN
 T9  score=0.20  actual=0  pred=0  -&gt; TN
T10  score=0.10  actual=0  pred=0  -&gt; TN
by hand : TP = 3  FP = 2  FN = 1  TN = 4
sklearn :
 [[4 2]
 [1 3]]
ravel() -&gt; tn, fp, fn, tp = 4 2 1 3</div>
  <p>Read the sklearn matrix as [[TN, FP], [FN, TP]]: the first row is actual 0, the first column predicted 0, because sklearn sorts the labels (0 before 1). <code>.ravel()</code> flattens it row by row, so the unpacking order is always <code>tn, fp, fn, tp</code>. Many textbooks and Wikipedia draw the matrix the other way round (positives first, or predicted on the rows); always check the axis labels before reading a matrix someone shows you.</p>
  <h3>Useful totals</h3>
  <table class="tbl">
    <tr><th>Total</th><th>Formula</th><th>Here</th><th>Meaning</th></tr>
    <tr><td>P (actual positives)</td><td>TP + FN</td><td>4</td><td>frauds that exist</td></tr>
    <tr><td>N (actual negatives)</td><td>TN + FP</td><td>6</td><td>legit rows that exist</td></tr>
    <tr><td>Predicted positives</td><td>TP + FP</td><td>5</td><td>alarms raised (work for the review team)</td></tr>
    <tr><td><strong>Prevalence</strong> (base rate)</td><td>P / n</td><td>0.4</td><td>share of rows that are positive</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An airport metal detector. It beeps for a belt buckle: false positive (annoying, cheap). It stays silent for a knife: false negative (dangerous, expensive). Both are "errors", but no airport would score the detector by counting errors without asking which kind.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For labels y ∈ {0, 1} and predictions ŷ, the <strong>confusion matrix</strong> C has C[i][j] = number of rows with true class i and predicted class j. For two classes: TP = #(y=1, ŷ=1), FP = #(y=0, ŷ=1), FN = #(y=1, ŷ=0), TN = #(y=0, ŷ=0). Every threshold metric in sections 03–06 is a function of these four counts.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The confusion matrix belongs to one threshold. Change t and every cell changes (at t = 0.7 the same model has TP 3, FP 1, FN 1, TN 5). Saying "the model's confusion matrix" without the threshold is incomplete. And if your labels are strings, sklearn sorts them alphabetically: with labels "fraud" / "legit", "fraud" comes first and <code>ravel()</code> no longer means tn, fp, fn, tp. Pass <code>labels=[negative, positive]</code> to be safe.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  Four numbers are hard to compare across models. The obvious single number is "share of correct answers". Why is that not enough? <b>→ next: 03 Accuracy</b></div>

  <h2 id="ce-acc"><span class="num">03</span>Accuracy and Why It Misleads</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>The confusion matrix gives four counts (TP 3, FP 2, FN 1, TN 4). Four numbers are awkward for comparing models; we want one. The obvious one is the share of correct answers. Can we trust it?</p></div>
  <h3>Plain words and by hand</h3>
  <p><strong>Accuracy</strong> is the share of rows the model got right: the diagonal of the matrix divided by everything.</p>
  <p>Accuracy = (TP + TN) / n = (3 + 4) / 10 = <strong>0.70</strong>. Its complement, the <strong>error rate</strong>, is (FP + FN) / n = 3/10 = 0.30.</p>
  <p>On our 10 rows that sounds fine. Now look at a realistic fraud problem.</p>
  <h3>The imbalance demo</h3>
  <p>Real fraud is rare. Below, 20,000 synthetic transactions with about 2.5% fraud, a logistic regression trained on half and tested on the other half. This module is reused by later code blocks:</p>
  <div class="fx" data-lang="py"># fraud.py - a bigger, realistic imbalanced dataset: 20,000 transactions, about 2.5% fraud
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
X, y = make_classification(n_samples=20000, n_features=20, n_informative=5,
                           weights=[0.98], flip_y=0.01, class_sep=0.8, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.5, stratify=y, random_state=0)
model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
p_te = model.predict_proba(X_te)[:, 1]          # fraud probability for each test row</div>
  <p>Compare the real model with a "model" that never flags anything (sklearn's <code>DummyClassifier</code> with <code>most_frequent</code> predicts the majority class every time):</p>
  <div class="fx" data-lang="py">from fraud import X_tr, y_tr, X_te, y_te, p_te
from sklearn.dummy import DummyClassifier
from sklearn.metrics import confusion_matrix, accuracy_score, recall_score

print(f"test rows {len(y_te)}, frauds {y_te.sum()}, fraud rate {y_te.mean():.4f}")
lazy = DummyClassifier(strategy="most_frequent").fit(X_tr, y_tr).predict(X_te)   # always "legit"
print("always-legit : accuracy", round(accuracy_score(y_te, lazy), 4), " recall", recall_score(y_te, lazy))

pred = (p_te &gt;= 0.5).astype(int)
tn, fp, fn, tp = confusion_matrix(y_te, pred).ravel()
print("logistic     : accuracy", round(accuracy_score(y_te, pred), 4), " recall", round(recall_score(y_te, pred), 4))
print("TN FP FN TP  =", tn, fp, fn, tp)</div>
  <div class="fx" data-lang="text">test rows 10000, frauds 249, fraud rate 0.0249
always-legit : accuracy 0.9751  recall 0.0
logistic     : accuracy 0.9833  recall 0.3534
TN FP FN TP  = 9745 6 161 88</div>
  <p>The useless model, which catches zero frauds, scores <strong>97.5%</strong> accuracy, because 97.5% of rows are legit. The real model scores 98.3%, only 0.8 points better, yet its confusion matrix shows it misses 161 of 249 frauds (recall 0.353). Accuracy weighs every row equally, and 97.5% of the rows are easy legit ones, so the number is dominated by the part of the problem nobody cares about. This is called the <strong>accuracy paradox</strong>.</p>
  <table class="tbl">
    <tr><th>Model</th><th>Accuracy</th><th>Frauds caught</th><th>What accuracy hides</th></tr>
    <tr><td>Always "legit"</td><td>0.975</td><td>0 of 249</td><td>It is useless</td></tr>
    <tr><td>Logistic regression, t = 0.5</td><td>0.983</td><td>88 of 249</td><td>It misses 65% of fraud</td></tr>
  </table>
  <h3>The null accuracy baseline</h3>
  <p>Always compare accuracy with the <strong>null accuracy</strong>: the accuracy of always predicting the most common class, which equals max(prevalence, 1 − prevalence). On the 10 rows that is 0.6 (always "legit"), so 0.70 is only 0.10 above doing nothing. On the fraud data it is 0.975.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A weather forecaster in a desert who says "no rain" every day is right 360 days a year: 98.6% accuracy, and completely useless on the 5 days that matter.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Accuracy</strong> = (TP + TN) / (TP + TN + FP + FN), the fraction of correct predictions. It is a fine summary only when classes are roughly balanced <em>and</em> both kinds of mistake cost about the same. Otherwise report the confusion matrix plus metrics from sections 04–09.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"95% accuracy" is meaningless without the class balance. With 5% positives, 95% is the score of a model that never says yes. Always quote the null accuracy next to it, or use balanced accuracy / MCC (section 06).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  Accuracy mixes two different questions. We need separate numbers for "how many of the real frauds did we catch?" and "how many of our alarms were real?". <b>→ next: 04 Precision, Recall and Specificity</b></div>

  <h2 id="ce-pr"><span class="num">04</span>Precision, Recall, Specificity and the Family of Rates</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Accuracy lumped frauds and legit rows together and was fooled when fraud was rare. We still cannot say how many frauds were caught, or how many alarms were real.</p></div>
  <h3>The need</h3>
  <p>Two people read the same confusion matrix and care about different things. The head of fraud losses asks: "Of all the real frauds, how many did we stop?" The head of the review team asks: "Of all the alarms my team checks, how many are real?" Those are two different fractions of the same four counts.</p>
  <h3>Recall (sensitivity, true positive rate)</h3>
  <p>Look only at the <strong>actual positives</strong> (the bottom row of the matrix). What share did the model catch?</p>
  <p>Recall = TP / (TP + FN) = 3 / (3 + 1) = <strong>0.75</strong>. Of the 4 frauds, 3 were caught; T6 slipped through.</p>
  <h3>Precision (positive predictive value)</h3>
  <p>Look only at the <strong>predicted positives</strong> (the right column). What share were real?</p>
  <p>Precision = TP / (TP + FP) = 3 / (3 + 2) = <strong>0.60</strong>. Of the 5 alarms, 3 were real; T3 and T5 were false alarms.</p>
  <h3>Specificity (true negative rate) and NPV</h3>
  <p>The same two questions asked about the <em>negative</em> class. <strong>Specificity</strong> looks at the actual negatives (top row): TN / (TN + FP) = 4 / (4 + 2) = <strong>0.667</strong>, the share of legit customers left alone. <strong>Negative predictive value</strong> looks at the predicted negatives (left column): TN / (TN + FN) = 4 / (4 + 1) = <strong>0.80</strong>, "when the model says legit, how often is it right".</p>
  <p>Notice the symmetry: specificity is just recall computed for class 0, and NPV is precision for class 0. sklearn has no separate function for them; you call <code>recall_score</code> and <code>precision_score</code> with <code>pos_label=0</code>:</p>
  <div class="fx" data-lang="py">from ten import score, y
from sklearn.metrics import precision_score, recall_score, f1_score, fbeta_score, accuracy_score

pred = (score &gt;= 0.5).astype(int)
TP, FP, FN, TN = 3, 2, 1, 4                           # counted by hand in section 01
P, R = TP / (TP + FP), TP / (TP + FN)
print(f"precision   TP/(TP+FP) = 3/5 = {P:.3f}   sklearn {precision_score(y, pred):.3f}")
print(f"recall      TP/(TP+FN) = 3/4 = {R:.3f}   sklearn {recall_score(y, pred):.3f}")
print(f"specificity TN/(TN+FP) = 4/6 = {TN/(TN+FP):.3f}   sklearn {recall_score(y, pred, pos_label=0):.3f}")
print(f"NPV         TN/(TN+FN) = 4/5 = {TN/(TN+FN):.3f}   sklearn {precision_score(y, pred, pos_label=0):.3f}")
print(f"accuracy    7/10           = {accuracy_score(y, pred):.3f}")
print(f"F1  = 2PR/(P+R)            = {2*P*R/(P+R):.3f}   sklearn {f1_score(y, pred):.3f}")
for b in [0.5, 2]:
    by_hand = (1 + b*b) * P * R / (b*b * P + R)
    print(f"F{b:&lt;3} = (1+b²)PR/(b²P+R)    = {by_hand:.3f}   sklearn {fbeta_score(y, pred, beta=b):.3f}")</div>
  <div class="fx" data-lang="text">precision   TP/(TP+FP) = 3/5 = 0.600   sklearn 0.600
recall      TP/(TP+FN) = 3/4 = 0.750   sklearn 0.750
specificity TN/(TN+FP) = 4/6 = 0.667   sklearn 0.667
NPV         TN/(TN+FN) = 4/5 = 0.800   sklearn 0.800
accuracy    7/10           = 0.700
F1  = 2PR/(P+R)            = 0.667   sklearn 0.667
F0.5 = (1+b²)PR/(b²P+R)    = 0.625   sklearn 0.625
F2   = (1+b²)PR/(b²P+R)    = 0.714   sklearn 0.714</div>
  <p>Every hand value matches. (The F lines are explained in section 05.)</p>
  <h3>The complete family</h3>
  <p>Divide each cell of the matrix by its row total or its column total and you get eight rates. Interviewers use all their names, so here they are in one place, with the 10-row values:</p>
  <table class="tbl">
    <tr><th>Name(s)</th><th>Formula</th><th>Divides by</th><th>Here</th><th>Question</th></tr>
    <tr><td><strong>Recall</strong>, sensitivity, TPR, hit rate</td><td>TP / (TP + FN)</td><td>actual positives</td><td>3/4 = 0.75</td><td>Of real frauds, share caught</td></tr>
    <tr><td><strong>Miss rate</strong>, FNR</td><td>FN / (TP + FN)</td><td>actual positives</td><td>1/4 = 0.25</td><td>Of real frauds, share missed (= 1 − recall)</td></tr>
    <tr><td><strong>Specificity</strong>, selectivity, TNR</td><td>TN / (TN + FP)</td><td>actual negatives</td><td>4/6 = 0.667</td><td>Of legit rows, share left alone</td></tr>
    <tr><td><strong>Fall-out</strong>, FPR</td><td>FP / (TN + FP)</td><td>actual negatives</td><td>2/6 = 0.333</td><td>Of legit rows, share wrongly flagged (= 1 − specificity)</td></tr>
    <tr><td><strong>Precision</strong>, PPV</td><td>TP / (TP + FP)</td><td>predicted positives</td><td>3/5 = 0.60</td><td>Of alarms, share real</td></tr>
    <tr><td><strong>False discovery rate</strong>, FDR</td><td>FP / (TP + FP)</td><td>predicted positives</td><td>2/5 = 0.40</td><td>Of alarms, share false (= 1 − precision)</td></tr>
    <tr><td><strong>NPV</strong></td><td>TN / (TN + FN)</td><td>predicted negatives</td><td>4/5 = 0.80</td><td>Of passes, share truly legit</td></tr>
    <tr><td><strong>False omission rate</strong>, FOR</td><td>FN / (TN + FN)</td><td>predicted negatives</td><td>1/5 = 0.20</td><td>Of passes, share that were fraud (= 1 − NPV)</td></tr>
  </table>
  <p>A useful way to remember: <strong>recall, specificity, FNR, FPR divide by the truth</strong> (row totals), so they do not change if you add more negatives. <strong>Precision, NPV, FDR, FOR divide by the prediction</strong> (column totals), so they depend on how common positives are. That single fact explains why ROC curves (built from TPR and FPR) ignore class imbalance and PR curves (built from precision) do not: section 08 shows it on real numbers.</p>
  <h3>Precision depends on prevalence: a worked example</h3>
  <p>A disease test with sensitivity 0.99 and specificity 0.99 sounds perfect. Test 100,000 people where only 0.1% (100 people) are sick. Expected counts: TP = 0.99 × 100 = 99; FP = 0.01 × 99,900 = 999. Precision = 99 / (99 + 999) = <strong>0.09</strong>. Nine in ten positive results are false, because the healthy group is a thousand times bigger. This is Bayes' theorem in disguise (<a class="xref" data-note="st_probability">Probability</a>): precision = P(sick | positive test), which depends on the base rate.</p>
  <h3>The trade-off</h3>
  <p>Lower the threshold and you flag more rows: recall can only go up (more frauds caught) but you also flag more legit rows, so precision usually goes down. On the 10 rows: at t = 0.85 (flag T1, T2) precision = 1.00, recall = 0.50; at t = 0.45 (flag T1–T6) precision = 4/6 = 0.667, recall = 1.00. You cannot judge a model by one of the two alone: "recall 1.0" is trivially achieved by flagging everything.</p>
  <div class="cards">
    <div><b>Favour recall</b><p>A miss (FN) is expensive; a false alarm is cheap.</p><small>Cancer screening, fraud, safety alerts, machine failure</small></div>
    <div><b>Favour precision</b><p>A false alarm (FP) is expensive; a miss is tolerable.</p><small>Spam filter (losing real mail), auto-blocking accounts, recommendations shown to users</small></div>
    <div><b>Favour specificity</b><p>You must not bother innocent people.</p><small>Confirmatory medical tests, legal decisions</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Fishing with a net. Recall is the share of the lake's fish you caught. Precision is the share of your catch that is fish rather than old slippers. A bigger net raises recall and drags in more slippers.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Precision</strong> = P(y = 1 | ŷ = 1) = TP/(TP+FP). <strong>Recall</strong> = P(ŷ = 1 | y = 1) = TP/(TP+FN). <strong>Specificity</strong> = P(ŷ = 0 | y = 0) = TN/(TN+FP). Precision is undefined when the model flags nothing (0/0); sklearn then returns 0 with a warning, controlled by <code>zero_division</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Precision and recall swap meaning if you swap which class is "positive". sklearn's <code>precision_score</code> uses <code>pos_label=1</code> by default; for string labels you must set it. When someone quotes "precision 0.9", ask: precision of which class, at which threshold, on what prevalence?</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  Two numbers make ranking models awkward: is (P 0.6, R 0.75) better than (P 0.9, R 0.5)? We want one number that is high only when <em>both</em> are high. <b>→ next: 05 F1 and Fβ</b></div>

  <h2 id="ce-f1"><span class="num">05</span>F1 and Fβ</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Precision (0.60) and recall (0.75) are two numbers that pull in opposite directions. Is (P 0.6, R 0.75) better than (P 0.9, R 0.5)? We have no single score that is high only when both are high.</p></div>
  <h3>Why not the plain average?</h3>
  <p>A model that flags exactly one row, correctly, has precision 1.0 and recall 0.1 (if there are 10 frauds). The plain average is 0.55, which sounds half-decent for a useless model. We need an average that is dragged down by the weaker number. The <strong>harmonic mean</strong> does exactly that: it is the reciprocal of the average of reciprocals.</p>
  <p>F1 = 1 / ( ½ (1/P + 1/R) ) = 2PR / (P + R).</p>
  <p>By hand for the 10 rows: P = 0.6, R = 0.75. F1 = 2 × 0.6 × 0.75 / (0.6 + 0.75) = 0.9 / 1.35 = <strong>0.667</strong>.</p>
  <div class="fx" data-lang="py"># why F1 uses the harmonic mean: it is dragged toward the weaker of the two numbers
for P, R in [(0.6, 0.75), (0.9, 0.9), (1.0, 0.1), (0.936, 0.353), (0.5, 0.5)]:
    arith, harm = (P + R) / 2, 2 * P * R / (P + R)
    print(f"P={P:&lt;5} R={R:&lt;5}  arithmetic mean={arith:.3f}  harmonic mean (F1)={harm:.3f}")</div>
  <div class="fx" data-lang="text">P=0.6   R=0.75   arithmetic mean=0.675  harmonic mean (F1)=0.667
P=0.9   R=0.9    arithmetic mean=0.900  harmonic mean (F1)=0.900
P=1.0   R=0.1    arithmetic mean=0.550  harmonic mean (F1)=0.182
P=0.936 R=0.353  arithmetic mean=0.645  harmonic mean (F1)=0.513
P=0.5   R=0.5    arithmetic mean=0.500  harmonic mean (F1)=0.500</div>
  <p>When P and R are equal, both means agree. When they differ, the harmonic mean sits near the smaller one: (1.0, 0.1) gives 0.182, not 0.55. The fraud model from section 03 (P 0.936, R 0.353) gets F1 = 0.513: it cannot hide its weak recall behind great precision.</p>
  <h3>F1 in counts</h3>
  <p>Substitute P and R and simplify: F1 = 2TP / (2TP + FP + FN) = 6 / (6 + 2 + 1) = 0.667. Two lessons hide in this form. First, F1 treats one FP and one FN as equally bad. Second, <strong>TN does not appear at all</strong>: F1 does not care how many legit rows you correctly passed. That is good when negatives are a boring majority, and bad when correctly passing negatives matters.</p>
  <h3>Fβ: tilting toward recall or precision</h3>
  <p>If a miss is worse than a false alarm, give recall more weight. The <strong>Fβ score</strong> is the weighted harmonic mean in which recall is treated as β times as important as precision:</p>
  <p>Fβ = (1 + β²) · P · R / (β² · P + R) = (1 + β²)TP / ((1 + β²)TP + β²FN + FP).</p>
  <p>The count form shows the meaning: an FN is weighted β² times as heavily as an FP. β = 1 gives F1. β = 2 (<strong>F2</strong>): misses count 4×. β = 0.5 (<strong>F0.5</strong>): false alarms count 4×.</p>
  <table class="tbl">
    <tr><th>β</th><th>By hand on the 10 rows (P = 0.6, R = 0.75)</th><th>Value</th><th>Use when</th></tr>
    <tr><td>0.5</td><td>1.25 × 0.45 / (0.25 × 0.6 + 0.75) = 0.5625 / 0.9</td><td>0.625</td><td>False alarms are worse (spam filter)</td></tr>
    <tr><td>1</td><td>2 × 0.45 / 1.35</td><td>0.667</td><td>Both mistakes about equal</td></tr>
    <tr><td>2</td><td>5 × 0.45 / (4 × 0.6 + 0.75) = 2.25 / 3.15</td><td>0.714</td><td>Misses are worse (screening, fraud)</td></tr>
  </table>
  <p>Our model has higher recall than precision, so the recall-heavy F2 rewards it most. The sklearn checks are in the output of section 04.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket all-rounder judged on batting and bowling. The harmonic mean is a selector who says "you are only as good as your weaker skill": a great batsman who cannot bowl is not an all-rounder.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>F1</strong> = 2PR/(P+R) = 2TP/(2TP+FP+FN), the harmonic mean of precision and recall, in [0, 1]. <strong>Fβ</strong> = (1+β²)PR/(β²P+R); it equals the harmonic mean with weight β² on recall. sklearn: <code>f1_score</code>, <code>fbeta_score(beta=…)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>F1 is a threshold metric: the same model has a different F1 at every threshold, and sklearn's default 0.5 is rarely the F1-best one (finding it is in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>). F1 also ignores TN and assumes FP and FN cost the same; if you know real costs, use them (section 11).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  F1 ignores the TN cell, and accuracy is fooled by imbalance. Is there a single number that uses all four cells and is not fooled? <b>→ next: 06 Balanced Accuracy, MCC and Kappa</b></div>

  <h2 id="ce-mcc"><span class="num">06</span>Balanced Accuracy, MCC and Cohen's Kappa</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>F1 never looks at the TN cell, and accuracy is fooled by imbalance. We have no single number yet that uses all four cells and still gives a useless model zero credit.</p></div>
  <h3>Balanced accuracy</h3>
  <p>Accuracy fails on imbalance because the big class dominates. Fix: average the per-class recalls, so each class counts equally regardless of size.</p>
  <p>Balanced accuracy = (recall + specificity) / 2 = (0.75 + 0.667) / 2 = <strong>0.708</strong>. The "always legit" model gets (0 + 1)/2 = 0.5 on any dataset, which is exactly what a useless model deserves.</p>
  <h3>Matthews correlation coefficient (MCC)</h3>
  <p>Write y and ŷ as two columns of 0s and 1s and compute their ordinary (Pearson) correlation. That correlation, simplified with the four counts, is the MCC:</p>
  <p>MCC = (TP·TN − FP·FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN)).</p>
  <p>By hand: numerator = 3·4 − 2·1 = 12 − 2 = 10. Denominator = √(5 · 4 · 6 · 5) = √600 = 24.49. MCC = 10 / 24.49 = <strong>0.408</strong>.</p>
  <p>Read it like a correlation: +1 = perfect, 0 = no better than chance, −1 = perfectly wrong. All four cells appear, and swapping which class is "positive" gives the same value (it is symmetric). If any bracket in the denominator is 0 (e.g. the model never flags), sklearn returns 0.</p>
  <h3>Cohen's kappa</h3>
  <p>Kappa asks: how much better than chance agreement is the model's agreement with the truth?</p>
  <ul>
    <li>Observed agreement p_o = accuracy = 0.70.</li>
    <li>Chance agreement p_e: if the model flagged 50% at random and 40% are fraud, they would agree on "fraud" 0.5 × 0.4 = 0.20 of the time and on "legit" 0.5 × 0.6 = 0.30. So p_e = 0.50.</li>
    <li>κ = (p_o − p_e) / (1 − p_e) = (0.70 − 0.50) / 0.50 = <strong>0.40</strong>.</li>
  </ul>
  <p>Kappa comes from measuring agreement between two human raters; it is used for ML mostly in medicine and annotation quality. MCC is usually preferred for model evaluation because it behaves better at extreme imbalance.</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import score, y
from fraud import y_te, p_te
from sklearn.metrics import (balanced_accuracy_score, matthews_corrcoef, cohen_kappa_score,
                             accuracy_score, f1_score)

pred = (score &gt;= 0.5).astype(int)
TP, FP, FN, TN = 3, 2, 1, 4
bal = (TP/(TP+FN) + TN/(TN+FP)) / 2
mcc = (TP*TN - FP*FN) / np.sqrt((TP+FP) * (TP+FN) * (TN+FP) * (TN+FN))
po, pe = (TP+TN)/10, ((TP+FP)/10)*((TP+FN)/10) + ((TN+FN)/10)*((TN+FP)/10)
print(f"10 rows : balanced acc = {bal:.3f} ({balanced_accuracy_score(y, pred):.3f})  "
      f"MCC = {mcc:.3f} ({matthews_corrcoef(y, pred):.3f})  kappa = {(po-pe)/(1-pe):.3f} ({cohen_kappa_score(y, pred):.3f})")

print("\\nfraud data, 2.5% positives:")
for name, pr in [("always legit", np.zeros_like(y_te)), ("logistic @0.5", (p_te &gt;= 0.5).astype(int))]:
    print(f"{name:14s} acc={accuracy_score(y_te, pr):.3f}  balanced acc={balanced_accuracy_score(y_te, pr):.3f}  "
          f"F1={f1_score(y_te, pr, zero_division=0):.3f}  MCC={matthews_corrcoef(y_te, pr):.3f}")</div>
  <div class="fx" data-lang="text">10 rows : balanced acc = 0.708 (0.708)  MCC = 0.408 (0.408)  kappa = 0.400 (0.400)

fraud data, 2.5% positives:
always legit   acc=0.975  balanced acc=0.500  F1=0.000  MCC=0.000
logistic @0.5  acc=0.983  balanced acc=0.676  F1=0.513  MCC=0.570</div>
  <p>On the fraud data accuracy says the useless model (0.975) is nearly as good as the real one (0.983). Balanced accuracy (0.500 vs 0.676), F1 (0 vs 0.513) and MCC (0 vs 0.570) all expose the difference.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two friends guess coin tosses. They agree 50% of the time just by luck. Kappa and MCC only give credit for agreement <em>beyond</em> what luck alone would produce.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Balanced accuracy</strong> = mean of per-class recall. <strong>MCC</strong> = (TP·TN − FP·FN)/√((TP+FP)(TP+FN)(TN+FP)(TN+FN)) ∈ [−1, 1], the Pearson correlation between y and ŷ. <strong>Cohen's κ</strong> = (p_o − p_e)/(1 − p_e), agreement corrected for chance. sklearn: <code>balanced_accuracy_score</code>, <code>matthews_corrcoef</code>, <code>cohen_kappa_score</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>These are still threshold metrics: they judge one set of yes/no decisions. A model with a great ranking can score poorly at a bad threshold. And none of them knows your costs; "MCC 0.57" does not tell the business how much money is saved.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  Every metric so far was measured at t = 0.5, but the threshold is our choice, not the model's. To judge the model itself, judge it at <em>every</em> threshold at once. <b>→ next: 07 The ROC Curve and AUC</b></div>

  <h2 id="ce-roc"><span class="num">07</span>The ROC Curve and AUC</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Every number so far was measured at t = 0.5, a threshold we chose, not the model. We cannot yet judge the scores themselves, free of any one threshold.</p></div>
  <h3>The need</h3>
  <p>The model's job is to put frauds above legit rows; the threshold is a business choice made later. If we compare two models at t = 0.5 only, we may simply be comparing how well 0.5 suits each model. We want a judgement of the <strong>scores themselves</strong>, free of any one threshold.</p>
  <h3>The idea in plain words</h3>
  <p>Slide the threshold from "above every score" (flag nothing) down to "below every score" (flag everything). At each stop, write down two numbers: the share of frauds caught (TPR = recall) and the share of legit rows wrongly flagged (FPR = 1 − specificity). Plot FPR on the x-axis and TPR on the y-axis. That trail is the <strong>ROC curve</strong> (the name, "receiver operating characteristic", comes from WWII radar operators).</p>
  <h3>Built by hand from the 10 rows</h3>
  <p>P = 4 frauds and N = 6 legit rows, so each fraud passed by the sliding line adds 1/4 = 0.25 to TPR and each legit row adds 1/6 ≈ 0.167 to FPR. Using each score as the threshold in turn:</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import ids, score, y
from sklearn.metrics import roc_curve, roc_auc_score, auc

P, N = y.sum(), (1 - y).sum()                  # 4 frauds, 6 legit
print("threshold  flagged  TP  FP   TPR   FPR")
print("      inf        0   0   0  0.00  0.00")
for t in score:                                # try every score as the cut-off, high to low
    flag = score &gt;= t
    tp, fp = int((flag &amp; (y == 1)).sum()), int((flag &amp; (y == 0)).sum())
    print(f"{t:&gt;9.2f}  {flag.sum():&gt;7d}  {tp:&gt;2d}  {fp:&gt;2d}  {tp/P:.2f}  {fp/N:.2f}")

fpr, tpr, thr = roc_curve(y, score, drop_intermediate=False)
area = np.sum((fpr[1:] - fpr[:-1]) * (tpr[1:] + tpr[:-1]) / 2)     # trapezoids
pairs = [(s1 &gt; s0) + 0.5 * (s1 == s0) for s1 in score[y == 1] for s0 in score[y == 0]]
print(f"\\ntrapezoid area     = {area:.4f}")
print(f"pairs won          = {sum(pairs):.0f} of {len(pairs)} = {np.mean(pairs):.4f}")
print(f"sklearn auc()      = {auc(fpr, tpr):.4f}")
print(f"roc_auc_score      = {roc_auc_score(y, score):.4f}")
print("roc_curve thresholds (default drops in-between points):", np.round(roc_curve(y, score)[2], 2))</div>
  <div class="fx" data-lang="text">threshold  flagged  TP  FP   TPR   FPR
      inf        0   0   0  0.00  0.00
     0.95        1   1   0  0.25  0.00
     0.85        2   2   0  0.50  0.00
     0.80        3   2   1  0.50  0.17
     0.70        4   3   1  0.75  0.17
     0.55        5   3   2  0.75  0.33
     0.45        6   4   2  1.00  0.33
     0.40        7   4   3  1.00  0.50
     0.30        8   4   4  1.00  0.67
     0.20        9   4   5  1.00  0.83
     0.10       10   4   6  1.00  1.00

trapezoid area     = 0.8750
pairs won          = 21 of 24 = 0.8750
sklearn auc()      = 0.8750
roc_auc_score      = 0.8750
roc_curve thresholds (default drops in-between points): [ inf 0.95 0.85 0.8  0.7  0.55 0.45 0.1 ]</div>
  <p>Walk down the table. The threshold passes T1 (fraud): step <em>up</em> to (0, 0.25). T2 (fraud): up to (0, 0.50). T3 (legit): step <em>right</em> to (0.17, 0.50). T4 (fraud): up. T5 (legit): right. T6 (fraud): up to (0.33, 1.00). The remaining four rows are all legit: four steps right to (1, 1). So the rule for drawing an ROC curve by hand is: <strong>sort by score, then go up 1/P for every positive and right 1/N for every negative</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 660 290" width="660">
<polygon points="60,230 60,230 60,180 60,130 98.3,130 98.3,80 136.7,80 136.7,30 175,30 213.3,30 251.7,30 290,30 290,230" class="fb" fill-opacity="0.25"/><line x1="60" y1="230" x2="290" y2="230" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="30" x2="60" y2="230" stroke="currentColor" opacity="0.5"/>
<text x="60" y="244" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="60" y1="230" x2="60" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="98.3" y="244" text-anchor="middle" class="tm" font-size="10.5">1/6</text>
<line x1="98.3" y1="230" x2="98.3" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="136.7" y="244" text-anchor="middle" class="tm" font-size="10.5">2/6</text>
<line x1="136.7" y1="230" x2="136.7" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="175" y="244" text-anchor="middle" class="tm" font-size="10.5">3/6</text>
<line x1="175" y1="230" x2="175" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="213.3" y="244" text-anchor="middle" class="tm" font-size="10.5">4/6</text>
<line x1="213.3" y1="230" x2="213.3" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="251.7" y="244" text-anchor="middle" class="tm" font-size="10.5">5/6</text>
<line x1="251.7" y1="230" x2="251.7" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="290" y="244" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="290" y1="230" x2="290" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="55" y="233.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="57" y1="230" x2="60" y2="230" stroke="currentColor" opacity="0.5"/>
<text x="55" y="183.5" text-anchor="end" class="tm" font-size="10.5">.25</text>
<line x1="57" y1="180" x2="60" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="55" y="133.5" text-anchor="end" class="tm" font-size="10.5">.5</text>
<line x1="57" y1="130" x2="60" y2="130" stroke="currentColor" opacity="0.5"/>
<text x="55" y="83.5" text-anchor="end" class="tm" font-size="10.5">.75</text>
<line x1="57" y1="80" x2="60" y2="80" stroke="currentColor" opacity="0.5"/>
<text x="55" y="33.5" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="57" y1="30" x2="60" y2="30" stroke="currentColor" opacity="0.5"/>
<polyline points="60,230 60,180 60,130 98.3,130 98.3,80 136.7,80 136.7,30 175,30 213.3,30 251.7,30 290,30" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="60" cy="230" r="3" class="fb"/>
<circle cx="60" cy="180" r="3" class="fb"/>
<circle cx="60" cy="130" r="3" class="fb"/>
<circle cx="98.3" cy="130" r="3" class="fb"/>
<circle cx="98.3" cy="80" r="3" class="fb"/>
<circle cx="136.7" cy="80" r="3" class="fb"/>
<circle cx="136.7" cy="30" r="3" class="fb"/>
<circle cx="175" cy="30" r="3" class="fb"/>
<circle cx="213.3" cy="30" r="3" class="fb"/>
<circle cx="251.7" cy="30" r="3" class="fb"/>
<circle cx="290" cy="30" r="3" class="fb"/>
<polyline points="60,230 290,30" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
<text x="175" y="260" text-anchor="middle" class="tm" font-size="11">FPR = FP / 6</text>
<text x="20" y="130" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 20 130)">TPR (recall) = TP / 4</text>
<text x="175" y="22" text-anchor="middle" font-size="12.5" font-weight="700">ROC of the 10 transactions</text>
<text x="65" y="193" class="tb" font-size="10.5">T1</text>
<text x="65" y="143" class="tb" font-size="10.5">T2</text>
<text x="103.3" y="143" class="tb" font-size="10.5">T3</text>
<text x="103.3" y="93" class="tb" font-size="10.5">T4</text>
<text x="141.7" y="93" class="tb" font-size="10.5">T5</text>
<text x="141.7" y="43" class="tb" font-size="10.5">T6</text>
<text x="186.5" y="160" class="tb" font-size="12" font-weight="700">AUC = 0.875</text>
<text x="163.5" y="194" class="tm" font-size="10.5">dashed: random, 0.5</text>
<rect x="380" y="130" width="38.3" height="100" class="fb" fill-opacity="0.45" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="418.3" y="80" width="38.3" height="150" class="ft" fill-opacity="0.45" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="456.7" y="30" width="153.3" height="200" class="fg" fill-opacity="0.45" stroke="currentColor" stroke-opacity="0.3"/>
<line x1="380" y1="230" x2="610" y2="230" stroke="currentColor" opacity="0.5"/>
<line x1="380" y1="30" x2="380" y2="230" stroke="currentColor" opacity="0.5"/>
<text x="380" y="244" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="380" y1="230" x2="380" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="418.3" y="244" text-anchor="middle" class="tm" font-size="10.5">1/6</text>
<line x1="418.3" y1="230" x2="418.3" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="456.7" y="244" text-anchor="middle" class="tm" font-size="10.5">2/6</text>
<line x1="456.7" y1="230" x2="456.7" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="610" y="244" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="610" y1="230" x2="610" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="375" y="233.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="377" y1="230" x2="380" y2="230" stroke="currentColor" opacity="0.5"/>
<text x="375" y="133.5" text-anchor="end" class="tm" font-size="10.5">.5</text>
<line x1="377" y1="130" x2="380" y2="130" stroke="currentColor" opacity="0.5"/>
<text x="375" y="83.5" text-anchor="end" class="tm" font-size="10.5">.75</text>
<line x1="377" y1="80" x2="380" y2="80" stroke="currentColor" opacity="0.5"/>
<text x="375" y="33.5" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="377" y1="30" x2="380" y2="30" stroke="currentColor" opacity="0.5"/>
<text x="495" y="260" text-anchor="middle" class="tm" font-size="11">FPR</text>
<text x="495" y="22" text-anchor="middle" font-size="12.5" font-weight="700">Area = three rectangles</text>
<text x="399.2" y="180" text-anchor="middle" font-size="10">.083</text>
<text x="437.5" y="155" text-anchor="middle" font-size="10">.125</text>
<text x="533.4" y="130" text-anchor="middle" font-size="11">4/6 × 1 = .667</text>
<text x="495" y="276" text-anchor="middle" class="tb" font-size="11.5">.083 + .125 + .667 = 0.875</text>
</svg><figcaption>Left: the ROC staircase of the 10 transactions; each label marks the point reached when the threshold equals that row's score. Right: the shaded area cut into three rectangles. A perfect model would go straight up to (0, 1) then right (area 1); a random one follows the dashed diagonal (area 0.5).</figcaption></figure>
  <h3>AUC as an area (trapezoids)</h3>
  <p>The area under the staircase, read off the right panel:</p>
  <ul>
    <li>FPR from 0 to 1/6, height 0.50: area 1/6 × 0.5 = 0.0833</li>
    <li>FPR from 1/6 to 2/6, height 0.75: area 1/6 × 0.75 = 0.125</li>
    <li>FPR from 2/6 to 1, height 1.00: area 4/6 × 1 = 0.6667</li>
  </ul>
  <p>Total <strong>AUC = 0.875</strong>. The general recipe (used by <code>sklearn.metrics.auc</code>) is the trapezoid rule: Σ (FPRᵢ₊₁ − FPRᵢ) × (TPRᵢ + TPRᵢ₊₁)/2. For a staircase the trapezoids are rectangles; slanted pieces appear only with ties (below).</p>
  <h3>AUC as a ranking probability</h3>
  <p>Here is the meaning that interviewers want. Pick one fraud and one legit row at random. <strong>AUC is the probability that the fraud got the higher score.</strong> Check it by counting all 4 × 6 = 24 (fraud, legit) pairs:</p>
  <table class="tbl">
    <tr><th>Fraud row (score)</th><th>Legit rows it beats</th><th>Pairs won</th></tr>
    <tr><td>T1 (0.95)</td><td>all six</td><td>6</td></tr>
    <tr><td>T2 (0.85)</td><td>all six</td><td>6</td></tr>
    <tr><td>T4 (0.70)</td><td>all except T3 (0.80)</td><td>5</td></tr>
    <tr><td>T6 (0.45)</td><td>T7, T8, T9, T10 (not T3, T5)</td><td>4</td></tr>
    <tr><td colspan="2"><strong>Total</strong></td><td><strong>21 of 24 = 0.875</strong></td></tr>
  </table>
  <p>Same number. Why are the two definitions equal? Each step <em>right</em> on the staircase is one negative row, of width 1/N. The height of the curve at that step is the share of positives already passed, which is exactly the share of positives that scored above that negative. So the area = Σ over negatives of (1/N) × (share of positives above it) = the average, over negatives, of the fraction of pairs won = the fraction of all (positive, negative) pairs ranked correctly. For T3 the height is 0.50 (T1, T2 above it); for T5 it is 0.75; for T7–T10 it is 1.00: (0.5 + 0.75 + 4 × 1)/6 = 5.25/6 = 0.875.</p>
  <h3>The rank-sum shortcut (Mann–Whitney U)</h3>
  <p>For big data, counting pairs is O(P·N). Instead, rank all scores from lowest (rank 1) to highest (rank n). Sum the ranks of the positives: R₊. Then U = R₊ − P(P+1)/2 counts the won pairs, and AUC = U / (P·N).</p>
  <p>By hand: ascending order 0.10 (1), 0.20 (2), 0.30 (3), 0.40 (4), <strong>0.45 (5)</strong>, 0.55 (6), <strong>0.70 (7)</strong>, 0.80 (8), <strong>0.85 (9)</strong>, <strong>0.95 (10)</strong>. Positive ranks: 5 + 7 + 9 + 10 = 31. U = 31 − 4·5/2 = 31 − 10 = 21. AUC = 21 / 24 = 0.875. This is how libraries compute AUC in O(n log n): one sort. It also shows that AUC is the Mann–Whitney U statistic of the two score groups, a link statisticians love.</p>
  <h3>Ties</h3>
  <p>When a fraud and a legit row get the same score, no threshold can separate them: the curve moves up and right at once (a diagonal segment), and in the pair count the tie earns half credit.</p>
  <div class="fx" data-lang="py"># a cruder model gives only three score levels, so positives and negatives tie
import numpy as np
from sklearn.metrics import roc_curve, roc_auc_score
y     = np.array([1,   1,   0,   1,   0,   1,   0,   0,   0,   0  ])
score = np.array([0.9, 0.5, 0.5, 0.5, 0.5, 0.1, 0.1, 0.1, 0.1, 0.1])
fpr, tpr, thr = roc_curve(y, score)
for t, a, b in zip(thr, fpr, tpr):
    print(f"threshold {t:&gt;4}: FPR={a:.3f} TPR={b:.2f}")
pairs = [(s1 &gt; s0) + 0.5 * (s1 == s0) for s1 in score[y == 1] for s0 in score[y == 0]]
print("pair credit:", sum(pairs), "of", len(pairs), "-&gt;", round(np.mean(pairs), 4), "  roc_auc_score:", round(roc_auc_score(y, score), 4))</div>
  <div class="fx" data-lang="text">threshold  inf: FPR=0.000 TPR=0.00
threshold  0.9: FPR=0.000 TPR=0.25
threshold  0.5: FPR=0.333 TPR=0.75
threshold  0.1: FPR=1.000 TPR=1.00
pair credit: 18.0 of 24 -&gt; 0.75   roc_auc_score: 0.75</div>
  <p>By hand: T1 (0.9) beats all 6 negatives: 6. The two positives at 0.5 each beat the four 0.1 negatives and tie with the two 0.5 negatives: 2 × (4 + 2 × ½) = 10. The positive at 0.1 ties with four negatives: 4 × ½ = 2. Total 18 / 24 = 0.75. The trapezoid of the diagonal segment gives the same half-credit automatically. Models that output few distinct values (a shallow tree, kNN with small k) produce many ties and blocky ROC curves.</p>
  <h3>Properties worth knowing</h3>
  <ul>
    <li><strong>Only order matters.</strong> Any increasing transform of the scores (squaring, log, calibrating) leaves AUC unchanged. So AUC says nothing about whether the probabilities are honest.</li>
    <li><strong>Insensitive to class balance.</strong> TPR and FPR each divide by their own class size, so duplicating every negative 10 times leaves the curve unchanged (section 08 shows why that is sometimes a weakness).</li>
    <li><strong>0.5 = random, below 0.5 = upside down.</strong> AUC 0.3 means the scores are informative but reversed; flipping them gives 0.7. In practice it usually means a label mix-up.</li>
    <li><strong>Gini coefficient</strong> = 2·AUC − 1 = 0.75 here. Credit-risk teams report this.</li>
    <li><strong>KS statistic</strong> = max over thresholds of (TPR − FPR) = 1.00 − 0.33 = 0.667 here, at t = 0.45. It is the biggest vertical gap between the curve and the diagonal, and it is the same quantity as Youden's J used to choose a threshold in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</li>
    <li><strong>Partial AUC</strong>: when only low FPR matters (you can review at most 1% of customers), compute the area for FPR ∈ [0, 0.01] only: <code>roc_auc_score(y, s, max_fpr=0.01)</code> (returns a standardised version).</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher ranks students before the results come out. AUC 0.875 means: take any student who passed and any who failed; 87.5% of the time the teacher had put the passer higher. It says nothing about where the pass mark should be.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>ROC curve</strong> is the set of points (FPR(t), TPR(t)) for all thresholds t. <strong>ROC-AUC</strong> = ∫₀¹ TPR d(FPR) = P(s(X₊) &gt; s(X₋)) + ½ P(s(X₊) = s(X₋)), where X₊, X₋ are a random positive and negative. sklearn: <code>roc_curve</code> (returns fpr, tpr, thresholds; by default drops points on straight segments), <code>roc_auc_score</code>, <code>RocCurveDisplay</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pass <strong>scores</strong> to <code>roc_auc_score</code>, never hard 0/1 predictions. With 0/1 labels you get a single-threshold "curve" whose area equals balanced accuracy (0.708 here instead of 0.875). Use <code>predict_proba(X)[:, 1]</code> or <code>decision_function(X)</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  AUC treats a mis-ordered pair the same whether the bank has 6 legit customers or 6 million. When positives are rare, the practical question is "how many false alarms per real catch?", and that is precision, which the ROC curve never shows. <b>→ next: 08 The PR Curve and Average Precision</b></div>

  <h2 id="ce-prc"><span class="num">08</span>The Precision–Recall Curve and Average Precision</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>ROC-AUC judges the ranking at every threshold (0.875), but it divides false alarms by the number of legit rows. When positives are rare it cannot show how many false alarms come with each real catch.</p></div>
  <h3>Built by hand from the 10 rows</h3>
  <p>Same threshold slide, different pair of numbers: recall on the x-axis, precision on the y-axis.</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import score, y
from sklearn.metrics import precision_recall_curve, average_precision_score, auc

print("threshold  TP  FP  precision  recall")
for t in score:
    flag = score &gt;= t
    tp, fp = int((flag &amp; (y == 1)).sum()), int((flag &amp; (y == 0)).sum())
    print(f"{t:&gt;9.2f}  {tp:&gt;2d}  {fp:&gt;2d}  {tp/(tp+fp):&gt;9.3f}  {tp/4:&gt;6.2f}")

prec, rec, thr = precision_recall_curve(y, score)       # sklearn lists it from LOW threshold to high
ap_hand = sum((rec[i] - rec[i + 1]) * prec[i] for i in range(len(rec) - 1))
print(f"\\nAP by hand  = sum over recall steps of (step width x precision) = {ap_hand:.4f}")
print(f"average_precision_score  = {average_precision_score(y, score):.4f}")
print(f"trapezoid area under PR  = {auc(rec, prec):.4f}  (a different number, see below)")
print(f"random model's AP ≈ fraud rate = {y.mean():.2f}")</div>
  <div class="fx" data-lang="text">threshold  TP  FP  precision  recall
     0.95   1   0      1.000    0.25
     0.85   2   0      1.000    0.50
     0.80   2   1      0.667    0.50
     0.70   3   1      0.750    0.75
     0.55   3   2      0.600    0.75
     0.45   4   2      0.667    1.00
     0.40   4   3      0.571    1.00
     0.30   4   4      0.500    1.00
     0.20   4   5      0.444    1.00
     0.10   4   6      0.400    1.00

AP by hand  = sum over recall steps of (step width x precision) = 0.8542
average_precision_score  = 0.8542
trapezoid area under PR  = 0.8354  (a different number, see below)
random model's AP ≈ fraud rate = 0.40</div>
  <p>Unlike the ROC staircase, the PR curve zig-zags. Each time the threshold passes a fraud, recall rises and precision rises; each time it passes a legit row, recall stays and precision falls. At the far right (flag everything) precision equals the prevalence, 4/10 = 0.40, which is why a random model's PR curve is a flat line at the positive rate, not a diagonal.</p>
  <figure class="viz"><svg viewBox="0 0 600 280" width="600">

<rect x="70" y="30" width="57.5" height="200" class="fg" fill-opacity="0.3" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="127.5" y="30" width="57.5" height="200" class="fg" fill-opacity="0.3" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="185" y="80" width="57.5" height="150" class="fg" fill-opacity="0.3" stroke="currentColor" stroke-opacity="0.3"/>
<rect x="242.5" y="96.7" width="57.5" height="133.3" class="fg" fill-opacity="0.3" stroke="currentColor" stroke-opacity="0.3"/>
<line x1="70" y1="230" x2="300" y2="230" stroke="currentColor" opacity="0.5"/>
<line x1="70" y1="30" x2="70" y2="230" stroke="currentColor" opacity="0.5"/>
<text x="70" y="244" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="70" y1="230" x2="70" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="127.5" y="244" text-anchor="middle" class="tm" font-size="10.5">.25</text>
<line x1="127.5" y1="230" x2="127.5" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="185" y="244" text-anchor="middle" class="tm" font-size="10.5">.5</text>
<line x1="185" y1="230" x2="185" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="242.5" y="244" text-anchor="middle" class="tm" font-size="10.5">.75</text>
<line x1="242.5" y1="230" x2="242.5" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="300" y="244" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="300" y1="230" x2="300" y2="233" stroke="currentColor" opacity="0.5"/>
<text x="65" y="233.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="67" y1="230" x2="70" y2="230" stroke="currentColor" opacity="0.5"/>
<text x="65" y="153.5" text-anchor="end" class="tm" font-size="10.5">.4</text>
<line x1="67" y1="150" x2="70" y2="150" stroke="currentColor" opacity="0.5"/>
<text x="65" y="113.5" text-anchor="end" class="tm" font-size="10.5">.6</text>
<line x1="67" y1="110" x2="70" y2="110" stroke="currentColor" opacity="0.5"/>
<text x="65" y="73.5" text-anchor="end" class="tm" font-size="10.5">.8</text>
<line x1="67" y1="70" x2="70" y2="70" stroke="currentColor" opacity="0.5"/>
<text x="65" y="33.5" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="67" y1="30" x2="70" y2="30" stroke="currentColor" opacity="0.5"/>
<polyline points="127.5,30 185,30 185,96.7 242.5,80 242.5,110 300,96.7 300,115.7 300,130 300,141.1 300,150" fill="none" class="sr" stroke-width="1.5"/>
<circle cx="127.5" cy="30" r="3" class="fr"/>
<circle cx="185" cy="30" r="3" class="fr"/>
<circle cx="185" cy="96.7" r="3" class="fr"/>
<circle cx="242.5" cy="80" r="3" class="fr"/>
<circle cx="242.5" cy="110" r="3" class="fr"/>
<circle cx="300" cy="96.7" r="3" class="fr"/>
<circle cx="300" cy="115.7" r="3" class="fr"/>
<circle cx="300" cy="130" r="3" class="fr"/>
<circle cx="300" cy="141.1" r="3" class="fr"/>
<circle cx="300" cy="150" r="3" class="fr"/>
<polyline points="70,150 300,150" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
<text x="185" y="260" text-anchor="middle" class="tm" font-size="11">recall</text>
<text x="30" y="130" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 30 130)">precision</text>
<text x="185" y="22" text-anchor="middle" font-size="12.5" font-weight="700">PR points of the 10 transactions</text>
<text x="78" y="145" class="tm" font-size="10.5">random model: precision = 0.4</text>
<text x="185" y="190" text-anchor="middle" class="tg" font-size="11.5" font-weight="700">AP = green area = 0.854</text>
<text x="228.5" y="74" class="tg" font-size="10">0.75</text>
<text x="286" y="90.7" class="tg" font-size="10">0.67</text>
<text x="330" y="60" class="tm" font-size="11.5">Each red dot = one threshold.</text>
<text x="330" y="78" class="tm" font-size="11.5">Going right (lower threshold):</text>
<text x="330" y="96" class="tm" font-size="11.5">precision drops at every false</text>
<text x="330" y="114" class="tm" font-size="11.5">positive (T3, T5, T7…) and</text>
<text x="330" y="132" class="tm" font-size="11.5">rises at every true positive.</text>
<text x="330" y="150" class="tm" font-size="11.5"></text>
<text x="330" y="168" class="tg" font-size="11.5">AP = Σ (recall step) × precision</text>
<text x="330" y="186" class="tg" font-size="11.5">   = .25×1 + .25×1 + .25×.75</text>
<text x="330" y="204" class="tg" font-size="11.5">     + .25×.667 = 0.854</text>
</svg><figcaption>The PR points of the 10 transactions (red) and average precision as the green staircase under them: one rectangle per recall step, as tall as the precision reached at that step.</figcaption></figure>
  <h3>Average precision by hand</h3>
  <p>Average precision summarises the curve as a weighted mean of precision, with weights = how much recall increased:</p>
  <p>AP = Σₙ (Rₙ − Rₙ₋₁) · Pₙ</p>
  <p>Recall only increases when the threshold passes a fraud, so only four terms are non-zero, each with width 1/4:</p>
  <table class="tbl">
    <tr><th>Fraud passed</th><th>Recall goes</th><th>Precision at that moment</th><th>Contribution</th></tr>
    <tr><td>T1</td><td>0 → 0.25</td><td>1/1 = 1.000</td><td>0.25 × 1.000 = 0.250</td></tr>
    <tr><td>T2</td><td>0.25 → 0.50</td><td>2/2 = 1.000</td><td>0.25 × 1.000 = 0.250</td></tr>
    <tr><td>T4</td><td>0.50 → 0.75</td><td>3/4 = 0.750</td><td>0.25 × 0.750 = 0.1875</td></tr>
    <tr><td>T6</td><td>0.75 → 1.00</td><td>4/6 = 0.667</td><td>0.25 × 0.667 = 0.1667</td></tr>
    <tr><td colspan="3"><strong>AP</strong></td><td><strong>0.854</strong></td></tr>
  </table>
  <p>Another reading: AP is the average, over the real frauds, of "the precision you would have if you stopped right after reaching this fraud". It is the same quantity search engines call (non-interpolated) average precision.</p>
  <h3>Why not trapezoids under the PR curve?</h3>
  <p>The output also printed the trapezoid area, 0.835, a different number. Drawing straight lines between PR points is wrong: between two thresholds precision does not change linearly with recall (it moves as TP/(TP+FP) with both counts changing), so the straight line claims performance no threshold achieves. sklearn's docs recommend <code>average_precision_score</code>, which uses the step sum above. When people say "PR-AUC" they usually mean AP, but check: some libraries use trapezoids and report a different value.</p>
  <h3>ROC vs PR when positives are rare</h3>
  <p>Back to the fraud model. Keep all 249 frauds and add more and more legit rows, as if the business got bigger but fraud did not:</p>
  <div class="fx" data-lang="py">import numpy as np
from fraud import y_te, p_te
from sklearn.metrics import roc_auc_score, average_precision_score

rng = np.random.default_rng(0)
pos, neg = np.where(y_te == 1)[0], np.where(y_te == 0)[0]
for n_neg in [len(pos), 10 * len(pos), len(neg)]:     # same model, same 249 frauds, more and more legit rows
    idx = np.r_[pos, rng.choice(neg, n_neg, replace=False)]
    rate = len(pos) / len(idx)
    print(f"fraud rate {rate:5.1%}: ROC-AUC={roc_auc_score(y_te[idx], p_te[idx]):.3f}  "
          f"AP={average_precision_score(y_te[idx], p_te[idx]):.3f}  (random AP ≈ {rate:.3f})")

t = 0.10                                               # one fixed threshold on the full test set
flag = p_te &gt;= t
tp, fp = (flag &amp; (y_te == 1)).sum(), (flag &amp; (y_te == 0)).sum()
print(f"\\nat t={t}: TPR={tp/len(pos):.3f}  FPR={fp/len(neg):.4f}  -&gt; looks great on ROC")
print(f"         but {fp} false alarms vs {tp} real catches: precision={tp/(tp+fp):.3f}")</div>
  <div class="fx" data-lang="text">fraud rate 50.0%: ROC-AUC=0.826  AP=0.878  (random AP ≈ 0.500)
fraud rate  9.1%: ROC-AUC=0.837  AP=0.677  (random AP ≈ 0.091)
fraud rate  2.5%: ROC-AUC=0.837  AP=0.576  (random AP ≈ 0.025)

at t=0.1: TPR=0.602  FPR=0.0250  -&gt; looks great on ROC
         but 244 false alarms vs 150 real catches: precision=0.381</div>
  <p>ROC-AUC barely moves (0.826 → 0.837): it is a ranking measure and TPR and FPR are per-class rates. AP falls from 0.878 to 0.576, because every extra legit row is a chance for a false alarm, and precision feels every one. The last two lines show the same thing at one threshold: an FPR of 2.5% sounds tiny, but 2.5% of 9,751 legit rows is 244 false alarms against 150 catches, so 62% of alarms are false.</p>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<line x1="60" y1="220" x2="290" y2="220" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="30" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="60" y="234" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="60" y1="220" x2="60" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="175" y="234" text-anchor="middle" class="tm" font-size="10.5">0.5</text>
<line x1="175" y1="220" x2="175" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="290" y="234" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="290" y1="220" x2="290" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="55" y="223.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="57" y1="220" x2="60" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="55" y="128.5" text-anchor="end" class="tm" font-size="10.5">.5</text>
<line x1="57" y1="125" x2="60" y2="125" stroke="currentColor" opacity="0.5"/>
<text x="55" y="33.5" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="57" y1="30" x2="60" y2="30" stroke="currentColor" opacity="0.5"/>
<polyline points="60,220 60,168.9 60,160.5 60.1,159.7 60.1,156.7 60.1,153.6 60.2,146 60.2,142.2 60.3,141.4 60.3,140.6 60.3,139.9 60.4,136.1 60.4,134.5 60.4,133.8 60.5,133 60.5,131.5 60.5,130 60.6,128.4 60.7,127.7 61,126.9 61.1,126.1 61.1,123.9 61.2,123.1 61.4,122.3 61.7,121.6 61.7,120.8 62.1,118.5 62.2,116.2 62.4,115.5 62.9,114.7 62.9,113.9 63.1,112.4 63.6,111.6 64.1,110.1 64.3,109.4 64.5,108.6 65.4,107.1 65.5,106.3 65.9,105.5 67.3,104.8 67.6,104 67.7,102.5 68.3,101.7 68.5,101 69.8,100.2 70.8,99.4 71.2,97.9 71.2,97.1 72.4,96.4 73.4,95.6 75,94.9 75.4,93.3 75.5,92.6 75.7,91.8 78.3,91 79.4,90.3 79.6,88 82.4,87.2 86.9,86.5 88.3,85.7 89.3,84.9 89.6,83.4 90.9,82.7 91.3,81.9 108,80.4 108.4,79.6 111.8,78.1 114.1,77.3 116.5,76.5 119.3,75.8 120,75 120.9,73.5 122.4,72.7 126.3,72 130,71.2 130.2,70.4 131.3,68.9 145.8,68.2 147.9,67.4 152.4,66.6 153.1,65.9 153.2,65.1 153.5,63.6 156,62.8 161.1,62 164,61.3 164.2,60.5 166.7,59 168.4,58.2 180.7,57.5 182.7,56.7 184.1,55.9 188.2,54.4 192,53.7 205.2,52.9 205.6,52.1 206.4,51.4 207.1,49.8 210.6,49.1 211.1,48.3 215.8,47.6 217.4,46.8 219,45.3 226.4,44.5 232.5,43.7 233.4,43 235.8,42.2 237.9,40.7 238.6,39.9 246.6,39.2 265.8,38.4 270.5,37.6 273.4,36.1 276.1,35.3 283.7,34.6 284.2,33.8 285.8,33.1 288.2,31.5 289.1,30.8 290,30" fill="none" class="sb" stroke-width="2.5"/>
<polyline points="60,220 290,30" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
<text x="175" y="250" text-anchor="middle" class="tm" font-size="11">false positive rate</text>
<text x="26" y="125" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 125)">recall (TPR)</text>
<text x="175" y="22" text-anchor="middle" font-size="12.5" font-weight="700">ROC · AUC 0.837</text>
<circle cx="65.8" cy="105.6" r="5" class="fg sg"/><text x="75.8" y="121.6" class="tg" font-size="11">t=0.10: FPR 2.5%, recall 0.60</text>
<line x1="400" y1="220" x2="630" y2="220" stroke="currentColor" opacity="0.5"/>
<line x1="400" y1="30" x2="400" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="400" y="234" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="400" y1="220" x2="400" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="515" y="234" text-anchor="middle" class="tm" font-size="10.5">0.5</text>
<line x1="515" y1="220" x2="515" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="630" y="234" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="630" y1="220" x2="630" y2="223" stroke="currentColor" opacity="0.5"/>
<text x="395" y="223.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="397" y1="220" x2="400" y2="220" stroke="currentColor" opacity="0.5"/>
<text x="395" y="128.5" text-anchor="end" class="tm" font-size="10.5">.5</text>
<line x1="397" y1="125" x2="400" y2="125" stroke="currentColor" opacity="0.5"/>
<text x="395" y="33.5" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="397" y1="30" x2="400" y2="30" stroke="currentColor" opacity="0.5"/>
<polyline points="630,215.3 628.2,215.3 627.2,215.3 626.3,215.3 626.3,215.2 624.5,215.2 623.5,215.2 623.5,215.2 623.5,215.2 623.5,215.1 622.6,215.1 622.6,215.1 621.7,215.1 621.7,215 620.8,215 620.8,215 620.8,215 619.8,214.9 619.8,214.9 619.8,214.9 619.8,214.8 619.8,214.8 619.8,214.8 619.8,214.7 619.8,214.7 619.8,214.6 619.8,214.6 619.8,214.6 619.8,214.5 619.8,214.5 618.9,214.5 618.9,214.4 618.9,214.4 618.9,214.3 618,214.3 617.1,214.3 616.1,214.3 615.2,214.2 615.2,214.2 614.3,214.2 613.4,214.1 613.4,214.1 613.4,214 613.4,214 611.5,214 611.5,213.9 611.5,213.9 611.5,213.8 611.5,213.8 610.6,213.7 609.7,213.7 608.8,213.7 608.8,213.6 608.8,213.6 606,213.6 606,213.5 606,213.5 604.1,213.5 602.3,213.5 602.3,213.4 601.4,213.3 601.4,213.3 601.4,213.2 601.4,213.1 601.4,213.1 601.4,213 601.4,212.9 600.4,212.9 600.4,212.8 600.4,212.7 599.5,212.7 599.5,212.6 598.6,212.5 597.7,212.5 597.7,212.4 596.7,212.3 596.7,212.2 595.8,212.2 595.8,212.1 595.8,212 595.8,211.9 595.8,211.8 595.8,211.7 594.9,211.6 594,211.5 594,211.4 592.1,211.4 592.1,211.3 591.2,211.2 591.2,211.1 591.2,210.9 590.3,210.8 589.4,210.8 587.5,210.7 584.7,210.7 584.7,210.6 584.7,210.4 583.8,210.3 583.8,210.1 582.9,210 582.9,209.9 582.9,209.7 582.9,209.5 582.9,209.3 582.9,209.1 582.9,208.9 582.9,208.7 582.9,208.5 582,208.3 580.1,208.2 580.1,208 579.2,207.8 578.3,207.6 578.3,207.3 577.3,207.1 576.4,206.9 575.5,206.7 574.6,206.4 572.7,206.2 572.7,205.9 571.8,205.6 571.8,205.2 570.9,204.9 570.9,204.5 569,204.2 569,203.7 569,203.3 569,202.7 569,202.2 567.2,201.8 567.2,201.1 567.2,200.5 567.2,199.8 567.2,199 567.2,198.1 567.2,197.2 565.3,196.5 563.5,195.7 561.6,194.8 560.7,193.7 560.7,192.3 560.7,190.8 559.8,189.3 559.8,187.4 556.1,186 555.2,183.8 553.3,181.4 551.5,178.7 549.6,175.5 546.9,172 545,167.4 542.2,161.9 539.5,154.9 535.8,146.1 533,133.1 527.5,116 519.2,90.3 501.6,54.1 458.2,30 400,30" fill="none" class="sr" stroke-width="2.5"/>
<polyline points="400,215.2 630,215.2" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>
<text x="515" y="250" text-anchor="middle" class="tm" font-size="11">recall</text>
<text x="366" y="125" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 366 125)">precision</text>
<text x="515" y="22" text-anchor="middle" font-size="12.5" font-weight="700">PR · AP 0.576</text>
<circle cx="538.5" cy="147.6" r="5" class="fg sg"/><text x="530.5" y="151.6" dx="10" class="tg" font-size="11">same t:</text><text x="538.5" y="165.6" dx="10" class="tg" font-size="11">precision 0.38</text>
<text x="408" y="208" class="tm" font-size="10">random = 0.025</text>
</svg><figcaption>The same model on the same 10,000 test rows. The green dot is the same threshold on both plots: impressive on ROC (left), sobering on PR (right). Dashed lines are a random model: the diagonal for ROC, the 2.5% fraud rate for PR.</figcaption></figure>
  <table class="tbl">
    <tr><th>Use</th><th>When</th><th>Random baseline</th></tr>
    <tr><td><strong>ROC-AUC</strong></td><td>Classes not too skewed; you care about both classes; you compare models across datasets with different positive rates</td><td>0.5 always</td></tr>
    <tr><td><strong>AP / PR-AUC</strong></td><td>Positives rare (under ~10%: fraud, disease, defects, search results) and you act on the flagged ones</td><td>the positive rate (0.025 here, 0.4 on the 10 rows)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A metal detector at a beach. ROC asks "what share of buried coins do you find, and what share of empty sand patches beep?" PR asks "of the times you dig, how often is there a coin?". On a huge beach with few coins, a tiny beep rate on sand still means digging a lot of empty holes.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>PR curve</strong> is the set of points (recall(t), precision(t)). <strong>Average precision</strong> AP = Σₙ (Rₙ − Rₙ₋₁) Pₙ over thresholds in decreasing order. A random scorer has expected AP ≈ prevalence. sklearn: <code>precision_recall_curve</code> (returns precision, recall, thresholds with one more precision/recall value than thresholds: the final point (recall 0, precision 1) has no threshold), <code>average_precision_score</code>, <code>PrecisionRecallDisplay</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>AP values are only comparable on test sets with the same prevalence. "AP 0.58" is excellent at 2.5% fraud (23× random) and poor at 50% positives. Always print the positive rate next to AP. And AP depends on which class is positive: computing it for the majority class gives a meaninglessly high number.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  ROC and PR judge the <em>order</em> of the scores. Two models with the same order but different numbers (one says 0.6, the other 0.99) get the same AUC and AP. If the probability itself will be used (pricing, expected loss), we need a metric that reads the numbers. <b>→ next: 09 Log Loss and the Brier Score</b></div>

  <h2 id="ce-ll"><span class="num">09</span>Log Loss and the Brier Score</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>ROC and PR look only at the <em>order</em> of the scores. They cannot tell a model that says 0.6 from one that says 0.99 for the same row, yet those mean very different things if the probability itself is used.</p></div>
  <h3>The need</h3>
  <p>Two weather apps both said "rain" yesterday and it rained. App A said 55%, App B said 99%. Both were "right" at threshold 0.5, so accuracy cannot separate them. But B deserves more credit for being sure and right, and if it had <em>not</em> rained, B would deserve far more blame. When a probability will be used as a probability (insurance pricing, expected fraud loss, a doctor's risk score), we must score the number itself.</p>
  <h3>Deriving log loss from likelihood</h3>
  <p>Treat the model's p as a claim: "this row is fraud with probability p". If the row really is fraud (y = 1), the probability the model gave to what happened is p. If it is legit (y = 0), it is 1 − p. One formula covers both cases:</p>
  <p>P(observed y | p) = p^y · (1 − p)^(1−y)</p>
  <p>(Check: y = 1 gives p; y = 0 gives 1 − p. This is the Bernoulli distribution, see <a class="xref" data-note="st_probability">Probability</a>.) If the rows are independent, the probability the model gave to the whole test set is the product over rows, called the <strong>likelihood</strong>:</p>
  <p>L = Πᵢ pᵢ^yᵢ (1 − pᵢ)^(1−yᵢ)</p>
  <p>A good model makes what really happened look likely, so we want L large. Products of many numbers below 1 underflow to 0 on a computer, so take the log (it turns products into sums and keeps the same maximiser), flip the sign so that smaller is better, and divide by n so the size of the test set does not matter:</p>
  <p><strong>Log loss</strong> = −(1/n) Σᵢ [ yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ) ]</p>
  <p>For each row only one term is "on": a fraud contributes −ln p, a legit row contributes −ln(1 − p). In words: <strong>minus the log of the probability you gave to the truth, averaged</strong>. The same formula is called binary cross-entropy, and it is exactly the loss logistic regression minimises during training (<a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>).</p>
  <h3>By hand on the 10 rows</h3>
  <p>Use the scores as probabilities. For T1 (fraud, p = 0.95): −ln 0.95 = 0.051. For T3 (legit, p = 0.80): the model gave only 0.20 to "legit", so −ln 0.20 = 1.609. And so on:</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import ids, score, y
from sklearn.metrics import log_loss, brier_score_loss

p = score                                   # treat the scores as probabilities of fraud
print(" row  y     p   p(true class)   -ln(.)   (p-y)²")
for i, a, q in zip(ids, y, p):
    pt = q if a == 1 else 1 - q             # probability the model gave to what really happened
    print(f"{i:&gt;4}  {a}  {q:.2f}       {pt:.2f}        {-np.log(pt):.3f}    {(q-a)**2:.4f}")
ll = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
print(f"\\nlog loss  by hand = {ll:.4f}   sklearn log_loss         = {log_loss(y, p):.4f}")
print(f"Brier     by hand = {np.mean((p - y) ** 2):.4f}   sklearn brier_score_loss = {brier_score_loss(y, p):.4f}")
print(f"always say 0.4 (the fraud rate): log loss = {log_loss(y, np.full(10, 0.4)):.4f}, Brier = {brier_score_loss(y, np.full(10, 0.4)):.4f}")
print(f"always say 0.5                 : log loss = {log_loss(y, np.full(10, 0.5)):.4f}, Brier = {brier_score_loss(y, np.full(10, 0.5)):.4f}")</div>
  <div class="fx" data-lang="text"> row  y     p   p(true class)   -ln(.)   (p-y)²
  T1  1  0.95       0.95        0.051    0.0025
  T2  1  0.85       0.85        0.163    0.0225
  T3  0  0.80       0.20        1.609    0.6400
  T4  1  0.70       0.70        0.357    0.0900
  T5  0  0.55       0.45        0.799    0.3025
  T6  1  0.45       0.45        0.799    0.3025
  T7  0  0.40       0.60        0.511    0.1600
  T8  0  0.30       0.70        0.357    0.0900
  T9  0  0.20       0.80        0.223    0.0400
 T10  0  0.10       0.90        0.105    0.0100

log loss  by hand = 0.4973   sklearn log_loss         = 0.4973
Brier     by hand = 0.1660   sklearn brier_score_loss = 0.1660
always say 0.4 (the fraud rate): log loss = 0.6730, Brier = 0.2400
always say 0.5                 : log loss = 0.6931, Brier = 0.2500</div>
  <p>Sum of the −ln column: 0.051 + 0.163 + 1.609 + 0.357 + 0.799 + 0.799 + 0.511 + 0.357 + 0.223 + 0.105 = 4.973; divided by 10 gives <strong>0.497</strong>. One row, T3 (legit but scored 0.80), contributes a third of the total. Two reference points: always saying 0.5 gives ln 2 = <strong>0.693</strong> on any data, and always saying the base rate (0.4) gives 0.673. A model that cannot beat the base-rate constant has learnt nothing about individual rows.</p>
  <figure class="viz"><svg viewBox="0 0 640 260" width="640">
<line x1="70" y1="215" x2="590" y2="215" stroke="currentColor" opacity="0.5"/>
<line x1="70" y1="25" x2="70" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="70" y="229" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="70" y1="215" x2="70" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="122" y="229" text-anchor="middle" class="tm" font-size="10.5">0.1</text>
<line x1="122" y1="215" x2="122" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="200" y="229" text-anchor="middle" class="tm" font-size="10.5">0.25</text>
<line x1="200" y1="215" x2="200" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="330" y="229" text-anchor="middle" class="tm" font-size="10.5">0.5</text>
<line x1="330" y1="215" x2="330" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="460" y="229" text-anchor="middle" class="tm" font-size="10.5">0.75</text>
<line x1="460" y1="215" x2="460" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="590" y="229" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="590" y1="215" x2="590" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="65" y="218.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="67" y1="215" x2="70" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="65" y="180.5" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="67" y1="177" x2="70" y2="177" stroke="currentColor" opacity="0.5"/>
<text x="65" y="142.5" text-anchor="end" class="tm" font-size="10.5">2</text>
<line x1="67" y1="139" x2="70" y2="139" stroke="currentColor" opacity="0.5"/>
<text x="65" y="104.5" text-anchor="end" class="tm" font-size="10.5">3</text>
<line x1="67" y1="101" x2="70" y2="101" stroke="currentColor" opacity="0.5"/>
<text x="65" y="66.5" text-anchor="end" class="tm" font-size="10.5">4</text>
<line x1="67" y1="63" x2="70" y2="63" stroke="currentColor" opacity="0.5"/>
<text x="65" y="28.5" text-anchor="end" class="tm" font-size="10.5">5</text>
<line x1="67" y1="25" x2="70" y2="25" stroke="currentColor" opacity="0.5"/>
<polyline points="75.2,40 77.8,55.3 80.4,66.2 83,74.7 85.5,81.6 88.1,87.5 90.7,92.5 93.3,97 95.9,101 98.5,104.6 101.1,107.9 103.7,111 106.2,113.8 108.8,116.4 111.4,118.9 114,121.2 116.6,123.3 119.2,125.4 121.8,127.3 124.4,129.2 126.9,130.9 129.5,132.6 132.1,134.3 134.7,135.8 137.3,137.3 139.9,138.7 142.5,140.1 145,141.4 147.6,142.7 150.2,144 152.8,145.2 155.4,146.4 158,147.5 160.6,148.6 163.2,149.7 165.7,150.7 168.3,151.7 170.9,152.7 173.5,153.7 176.1,154.6 178.7,155.5 181.3,156.4 183.9,157.3 186.4,158.1 189,159 191.6,159.8 194.2,160.6 196.8,161.4 199.4,162.1 202,162.9 204.5,163.6 207.1,164.4 209.7,165.1 212.3,165.8 214.9,166.4 217.5,167.1 220.1,167.8 222.7,168.4 225.2,169.1 227.8,169.7 230.4,170.3 233,170.9 235.6,171.5 238.2,172.1 240.8,172.7 243.4,173.3 245.9,173.8 248.5,174.4 251.1,174.9 253.7,175.5 256.3,176 258.9,176.5 261.5,177 264,177.5 266.6,178 269.2,178.5 271.8,179 274.4,179.5 277,180 279.6,180.5 282.2,180.9 284.7,181.4 287.3,181.8 289.9,182.3 292.5,182.7 295.1,183.2 297.7,183.6 300.3,184 302.9,184.5 305.4,184.9 308,185.3 310.6,185.7 313.2,186.1 315.8,186.5 318.4,186.9 321,187.3 323.5,187.7 326.1,188.1 328.7,188.5 331.3,188.9 333.9,189.2 336.5,189.6 339.1,190 341.7,190.3 344.2,190.7 346.8,191 349.4,191.4 352,191.7 354.6,192.1 357.2,192.4 359.8,192.8 362.3,193.1 364.9,193.5 367.5,193.8 370.1,194.1 372.7,194.4 375.3,194.8 377.9,195.1 380.5,195.4 383,195.7 385.6,196 388.2,196.3 390.8,196.6 393.4,197 396,197.3 398.6,197.6 401.2,197.9 403.7,198.1 406.3,198.4 408.9,198.7 411.5,199 414.1,199.3 416.7,199.6 419.3,199.9 421.8,200.2 424.4,200.4 427,200.7 429.6,201 432.2,201.3 434.8,201.5 437.4,201.8 440,202.1 442.5,202.3 445.1,202.6 447.7,202.9 450.3,203.1 452.9,203.4 455.5,203.6 458.1,203.9 460.7,204.1 463.2,204.4 465.8,204.6 468.4,204.9 471,205.1 473.6,205.4 476.2,205.6 478.8,205.9 481.3,206.1 483.9,206.3 486.5,206.6 489.1,206.8 491.7,207 494.3,207.3 496.9,207.5 499.5,207.7 502,208 504.6,208.2 507.2,208.4 509.8,208.6 512.4,208.9 515,209.1 517.6,209.3 520.2,209.5 522.7,209.7 525.3,210 527.9,210.2 530.5,210.4 533.1,210.6 535.7,210.8 538.3,211 540.8,211.2 543.4,211.4 546,211.6 548.6,211.8 551.2,212.1 553.8,212.3 556.4,212.5 559,212.7 561.5,212.9 564.1,213.1 566.7,213.3 569.3,213.5 571.9,213.7 574.5,213.8 577.1,214 579.7,214.2 582.2,214.4 584.8,214.6 587.4,214.8 590,215" fill="none" class="sr" stroke-width="2.5"/>
<text x="330" y="245" text-anchor="middle" class="tm" font-size="11">probability the model gave to what really happened</text>
<text x="36" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 36 120)">loss = −ln(p)</text>
<circle cx="564" cy="213.1" r="4" class="fb sb"/><text x="571" y="207.1" class="tb" font-size="11">T1: 0.05</text>
<circle cx="304" cy="184.7" r="4" class="fb sb"/><text x="311" y="178.7" class="tb" font-size="11">T6: 0.80</text>
<circle cx="174" cy="153.8" r="4" class="fb sb"/><text x="181" y="147.8" class="tb" font-size="11">T3: 1.61</text>
<circle cx="330" cy="188.7" r="4" class="fb sb"/>
<text x="334" y="206.7" class="tm" font-size="11">coin flip p=0.5: 0.693</text>
<text x="85.6" y="40" class="tr" font-size="11">sure and wrong → loss shoots up</text>
</svg><figcaption>The loss of one row as a function of the probability given to what really happened. Near 1 it is almost free; near 0 it shoots towards infinity. Being confidently wrong is punished far more than being unsure.</figcaption></figure>
  <h3>Same accuracy, same AUC, different log loss</h3>
  <p>The next two models rank 6 rows in the same order and agree at threshold 0.5, so every threshold and ranking metric is identical. "Brash" is just "calm" pushed toward 0 and 1:</p>
  <div class="fx" data-lang="py"># two models that rank the rows identically and agree at threshold 0.5 -&gt; same accuracy, same AUC.
# "brash" is "calm" pushed toward 0 and 1: p -&gt; sigmoid(5 * logit(p)).
import numpy as np
from sklearn.metrics import accuracy_score, log_loss, brier_score_loss, roc_auc_score
y     = np.array([1,    1,    0,    0,    1,    0   ])
calm  = np.array([0.70, 0.60, 0.40, 0.30, 0.35, 0.65])
logit = np.log(calm / (1 - calm))
brash = 1 / (1 + np.exp(-5 * logit))
print("brash =", np.round(brash, 3))
for name, p in [("calm", calm), ("brash", brash)]:
    print(f"{name:5s}: accuracy={accuracy_score(y, p &gt;= 0.5):.3f}  AUC={roc_auc_score(y, p):.3f}  "
          f"log loss={log_loss(y, p):.3f}  Brier={brier_score_loss(y, p):.3f}")
print("a sure-and-wrong row costs -ln(0.01) =", round(-np.log(0.01), 3))
print("p = 0 for a real positive: sklearn clips p to", np.finfo(float).eps, "-&gt; loss", round(-np.log(np.finfo(float).eps), 1))</div>
  <div class="fx" data-lang="text">brash = [0.986 0.884 0.116 0.014 0.043 0.957]
calm : accuracy=0.667  AUC=0.667  log loss=0.639  Brier=0.224
brash: accuracy=0.667  AUC=0.667  log loss=1.093  Brier=0.310
a sure-and-wrong row costs -ln(0.01) = 4.605
p = 0 for a real positive: sklearn clips p to 2.220446049250313e-16 -&gt; loss 36.0</div>
  <p>Accuracy and AUC cannot tell them apart. Log loss can: brash's two wrong rows (0.043 for a fraud, 0.957 for a legit row) each cost −ln 0.043 = 3.14, which outweighs everything it gains on the rows it got right. If a model ever outputs exactly 0 for a row that turns out positive, the loss is infinite; sklearn clips to machine epsilon, which still costs 36 for that row.</p>
  <h3>The Brier score</h3>
  <p>A gentler alternative: the mean squared difference between the probability and the 0/1 truth.</p>
  <p><strong>Brier</strong> = (1/n) Σᵢ (pᵢ − yᵢ)²</p>
  <p>By hand (last column above): 0.0025 + 0.0225 + 0.64 + 0.09 + 0.3025 + 0.3025 + 0.16 + 0.09 + 0.04 + 0.01 = 1.66; / 10 = <strong>0.166</strong>. Always 0.5 scores 0.25; a perfect, sure model scores 0. Because the error is capped at 1 per row, one confident mistake costs at most 1 (T3 costs 0.64), so Brier is far less harsh than log loss. It is the MSE of <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a> applied to probabilities, and it splits into a calibration part and a sharpness part (the Murphy decomposition in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>
  <h3>Proper scoring rules</h3>
  <p>Why these two and not, say, mean |p − y|? Both log loss and Brier are <strong>strictly proper</strong>: if the true chance of fraud for a row is q, your expected score is best when you report p = q exactly. So a model cannot improve them by exaggerating or hedging. Mean absolute error is <em>not</em> proper: if q = 0.7, the expected |p − y| = 0.7(1 − p) + 0.3p is smallest at p = 1, so it rewards rounding to 0/1. That property is why log loss is used for training and early stopping in boosting, and for comparing probabilistic models.</p>
  <table class="tbl">
    <tr><th></th><th>Log loss</th><th>Brier</th></tr>
    <tr><td>Per-row cost</td><td>−ln(prob. given to truth), 0 to ∞</td><td>(p − y)², 0 to 1</td></tr>
    <tr><td>10 rows</td><td>0.497</td><td>0.166</td></tr>
    <tr><td>Always 0.5</td><td>0.693</td><td>0.250</td></tr>
    <tr><td>Confident mistakes</td><td>Punished without limit</td><td>Punished at most 1</td></tr>
    <tr><td>Proper?</td><td>Strictly proper</td><td>Strictly proper</td></tr>
    <tr><td>Typical use</td><td>Training loss, model comparison, Kaggle</td><td>Forecast verification, calibration reports</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A betting shop that pays you by the log of the odds you quoted for what actually happened. Quoting honest odds is the only way to maximise your long-run payout. Bluffing (99% on everything) bankrupts you the first time you are wrong.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Log loss</strong> (binary cross-entropy) = −(1/n) Σ [yᵢ ln pᵢ + (1−yᵢ) ln(1−pᵢ)] = (negative log-likelihood)/n. <strong>Brier score</strong> = (1/n) Σ (pᵢ − yᵢ)². Both: lower is better, threshold-free, sensitive to calibration and to ranking. sklearn: <code>log_loss</code>, <code>brier_score_loss</code>; scorer strings <code>"neg_log_loss"</code>, <code>"neg_brier_score"</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Log loss needs probabilities. Passing hard 0/1 predictions turns every mistake into an infinite (clipped) loss; passing SVM <code>decision_function</code> values is meaningless. And a low log loss does not mean the model ranks well: a model that always predicts the base rate has a decent log loss and AUC 0.5. Report a ranking metric and a probability metric together.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  Everything so far had two classes. With three or more classes there is one precision, recall and F1 <em>per class</em>, and we need a rule to combine them. <b>→ next: 10 Many Classes</b></div>

  <h2 id="ce-multi"><span class="num">10</span>Many Classes: Macro, Micro and Weighted</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Everything so far had two classes. When investigators split fraud into card fraud and account takeover, there is a precision, recall and F1 per class, and no rule yet to combine them.</p></div>
  <h3>The k × k confusion matrix</h3>
  <p>Investigators split the 4 frauds of the running example into two kinds: <strong>card fraud</strong> (T1, T4) and <strong>account takeover</strong> (T2, T6). A three-class model gives one answer per row:</p>
  <table class="tbl">
    <tr><th>Row</th><th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>T8</th><th>T9</th><th>T10</th></tr>
    <tr><td>truth</td><td>card</td><td>takeover</td><td>legit</td><td>card</td><td>legit</td><td>takeover</td><td>legit</td><td>legit</td><td>legit</td><td>legit</td></tr>
    <tr><td>model</td><td>card</td><td>takeover</td><td>card</td><td>card</td><td>takeover</td><td>legit</td><td>legit</td><td>legit</td><td>legit</td><td>legit</td></tr>
  </table>
  <p>It flags the same five rows as the binary model at t = 0.5, so nothing new is wrong; we only see the mistakes in more detail. Rows are the truth, columns the prediction:</p>
  <table class="tbl">
    <tr><th>actual \\ predicted</th><th>legit</th><th>card</th><th>takeover</th><th>row total (support)</th></tr>
    <tr><td><strong>legit</strong></td><td>4</td><td>1 (T3)</td><td>1 (T5)</td><td>6</td></tr>
    <tr><td><strong>card</strong></td><td>0</td><td>2</td><td>0</td><td>2</td></tr>
    <tr><td><strong>takeover</strong></td><td>1 (T6)</td><td>0</td><td>1</td><td>2</td></tr>
    <tr><td>column total</td><td>5</td><td>3</td><td>2</td><td>10</td></tr>
  </table>
  <p>Accuracy = diagonal / total = (4 + 2 + 1)/10 = 0.70, the same as the binary accuracy.</p>
  <h3>Per class: one-vs-rest counts</h3>
  <p>For each class, pretend it is the positive class and everything else negative. TP = the diagonal cell; FP = the rest of its <em>column</em> (others predicted as it); FN = the rest of its <em>row</em> (it predicted as others).</p>
  <table class="tbl">
    <tr><th>Class</th><th>TP</th><th>FP (column − TP)</th><th>FN (row − TP)</th><th>Precision</th><th>Recall</th><th>F1</th></tr>
    <tr><td>legit</td><td>4</td><td>5 − 4 = 1</td><td>6 − 4 = 2</td><td>4/5 = 0.800</td><td>4/6 = 0.667</td><td>2·0.533/1.467 = 0.727</td></tr>
    <tr><td>card</td><td>2</td><td>3 − 2 = 1</td><td>2 − 2 = 0</td><td>2/3 = 0.667</td><td>2/2 = 1.000</td><td>2·0.667/1.667 = 0.800</td></tr>
    <tr><td>takeover</td><td>1</td><td>2 − 1 = 1</td><td>2 − 1 = 1</td><td>1/2 = 0.500</td><td>1/2 = 0.500</td><td>0.500</td></tr>
  </table>
  <h3>Three ways to average</h3>
  <ul>
    <li><strong>Macro</strong>: plain mean of the per-class scores. Macro F1 = (0.727 + 0.800 + 0.500)/3 = <strong>0.676</strong>. Every class counts the same, so the 2-row takeover class matters as much as the 6-row legit class. Use it when rare classes matter.</li>
    <li><strong>Weighted</strong>: mean weighted by support (true class size). Weighted F1 = (6 × 0.727 + 2 × 0.800 + 2 × 0.500)/10 = (4.364 + 1.6 + 1.0)/10 = <strong>0.696</strong>. Big classes dominate; it can hide a terrible small class.</li>
    <li><strong>Micro</strong>: pool all counts first, then compute once. Total TP = 7, total FP = 3, total FN = 3. Micro precision = 7/10, micro recall = 7/10, micro F1 = <strong>0.70</strong>. In single-label multiclass, every mistake is one FP for some class and one FN for another, so total FP = total FN and micro P = micro R = micro F1 = <strong>accuracy</strong>.</li>
  </ul>
  <div class="fx" data-lang="py"># the same 10 transactions, now with THREE classes: legit, card fraud, account takeover
import numpy as np
from sklearn.metrics import confusion_matrix, f1_score, classification_report

names  = ["legit", "card", "takeover"]
y_true = np.array([1, 2, 0, 1, 0, 2, 0, 0, 0, 0])   # T1..T10: T1,T4 card fraud; T2,T6 takeover
y_pred = np.array([1, 2, 1, 1, 2, 0, 0, 0, 0, 0])   # a 3-class model's answers
cm = confusion_matrix(y_true, y_pred)                # rows = actual, columns = predicted
print(cm)

tp = np.diag(cm); fp = cm.sum(0) - tp; fn = cm.sum(1) - tp; support = cm.sum(1)
P, R = tp / (tp + fp), tp / (tp + fn); F = 2 * P * R / (P + R)
for k in range(3):
    print(f"{names[k]:8s} TP={tp[k]} FP={fp[k]} FN={fn[k]}  P={P[k]:.3f} R={R[k]:.3f} F1={F[k]:.3f}  support={support[k]}")
print(f"macro    F1 = mean of the three           = {F.mean():.4f}   sklearn {f1_score(y_true, y_pred, average='macro'):.4f}")
print(f"weighted F1 = support-weighted mean       = {(F * support).sum() / support.sum():.4f}   sklearn {f1_score(y_true, y_pred, average='weighted'):.4f}")
Pm, Rm = tp.sum() / (tp.sum() + fp.sum()), tp.sum() / (tp.sum() + fn.sum())
print(f"micro    F1 = pool counts: P={Pm:.2f} R={Rm:.2f} -&gt; {2*Pm*Rm/(Pm+Rm):.4f}   sklearn {f1_score(y_true, y_pred, average='micro'):.4f}"
      f"   (= accuracy {np.trace(cm)/cm.sum():.2f})")
print()
print(classification_report(y_true, y_pred, target_names=names, digits=3))</div>
  <div class="fx" data-lang="text">[[4 1 1]
 [0 2 0]
 [1 0 1]]
legit    TP=4 FP=1 FN=2  P=0.800 R=0.667 F1=0.727  support=6
card     TP=2 FP=1 FN=0  P=0.667 R=1.000 F1=0.800  support=2
takeover TP=1 FP=1 FN=1  P=0.500 R=0.500 F1=0.500  support=2
macro    F1 = mean of the three           = 0.6758   sklearn 0.6758
weighted F1 = support-weighted mean       = 0.6964   sklearn 0.6964
micro    F1 = pool counts: P=0.70 R=0.70 -&gt; 0.7000   sklearn 0.7000   (= accuracy 0.70)

              precision    recall  f1-score   support

       legit      0.800     0.667     0.727         6
        card      0.667     1.000     0.800         2
    takeover      0.500     0.500     0.500         2

    accuracy                          0.700        10
   macro avg      0.656     0.722     0.676        10
weighted avg      0.713     0.700     0.696        10</div>
  <p>All three hand values match. In <code>classification_report</code>, the "accuracy" row is the micro average; the "macro avg" and "weighted avg" rows are as above. Macro recall (0.722) also has its own name: it is the multiclass <strong>balanced accuracy</strong>.</p>
  <h3>Probabilities with many classes</h3>
  <p>A multiclass model outputs one probability per class per row (each row sums to 1). <strong>Multiclass log loss</strong> keeps the binary meaning: −mean of ln(probability given to the true class). <strong>Top-k accuracy</strong> counts a row as correct if the true class is among the k highest probabilities. For ROC-AUC there are two extensions: <strong>one-vs-rest</strong> (ovr: AUC of "class k vs all others" for each k, then averaged) and <strong>one-vs-one</strong> (ovo: AUC for every pair of classes, then averaged; less affected by imbalance). Below, the three fraud rows of the running example by hand, then the AUC variants on a larger synthetic set:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import log_loss, roc_auc_score, top_k_accuracy_score
# rows T1, T2, T6 of the running example; columns = P(legit), P(card), P(takeover); each row sums to 1
y = np.array([1, 2, 2])                           # T1 card fraud, T2 and T6 account takeover
P = np.array([[0.05, 0.80, 0.15],
              [0.15, 0.25, 0.60],
              [0.55, 0.15, 0.30]])
picked = P[np.arange(3), y]                       # probability given to the true class
print("p(true class):", picked, " -ln:", np.round(-np.log(picked), 3))
print(f"multiclass log loss by hand = {-np.log(picked).mean():.4f}   sklearn {log_loss(y, P, labels=[0, 1, 2]):.4f}")   # labels= needed: class 0 is absent from y
print(f"top-1 accuracy = {top_k_accuracy_score(y, P, k=1, labels=[0, 1, 2]):.3f}   top-2 accuracy = {top_k_accuracy_score(y, P, k=2, labels=[0, 1, 2]):.3f}")

# the same idea at realistic scale: 3,000 synthetic transactions, 60% / 30% / 10% class mix
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
X, yy = make_classification(n_samples=3000, n_classes=3, n_informative=4, weights=[0.6, 0.3, 0.1], random_state=0)
Pm = LogisticRegression(max_iter=1000).fit(X[:2000], yy[:2000]).predict_proba(X[2000:])
yt = yy[2000:]
for mc in ["ovr", "ovo"]:
    for avg in ["macro", "weighted"]:
        print(f"ROC-AUC multi_class={mc} average={avg:8s}: {roc_auc_score(yt, Pm, multi_class=mc, average=avg):.4f}")
print("one-vs-rest AUC per class:", [round(roc_auc_score(yt == k, Pm[:, k]), 4) for k in range(3)])</div>
  <div class="fx" data-lang="text">p(true class): [0.8 0.6 0.3]  -ln: [0.223 0.511 1.204]
multiclass log loss by hand = 0.6460   sklearn 0.6460
top-1 accuracy = 0.667   top-2 accuracy = 1.000
ROC-AUC multi_class=ovr average=macro   : 0.8492
ROC-AUC multi_class=ovr average=weighted: 0.8531
ROC-AUC multi_class=ovo average=macro   : 0.8372
ROC-AUC multi_class=ovo average=weighted: 0.8471
one-vs-rest AUC per class: [0.8644, 0.8295, 0.8539]</div>
  <p>By hand: the true-class probabilities are 0.80 (T1), 0.60 (T2) and 0.30 (T6), so log loss = (0.223 + 0.511 + 1.204)/3 = 0.646. T6 (a takeover) is predicted "legit" (0.55) but takeover is its second choice (0.30), so top-1 = 2/3 and top-2 = 3/3. Note the <code>labels=[0, 1, 2]</code>: these three rows contain no legit row, so sklearn cannot guess that the probability matrix has three columns. The macro ovr AUC is the plain mean of the three per-class AUCs: (0.8644 + 0.8295 + 0.8539)/3 = 0.849.</p>
  <h3>Multi-label (brief)</h3>
  <p>When each row can have several labels at once (a transaction that is both card fraud <em>and</em> money laundering), compute a binary confusion matrix per label (<code>multilabel_confusion_matrix</code>) and average as above; <code>average="samples"</code> computes the metric per row then averages, and <code>hamming_loss</code> is the share of wrong label bits.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school with one big and two small classes. Macro average: average of the three class averages (each class equally important). Weighted: average by headcount (the big class dominates). Micro: throw every student's result into one pile and compute once.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For per-class scores Mₖ with supports nₖ: <strong>macro</strong> = (1/K) Σ Mₖ; <strong>weighted</strong> = Σ (nₖ/n) Mₖ; <strong>micro</strong> = the metric computed on the summed TP, FP, FN of all classes. sklearn: <code>average="macro" | "weighted" | "micro" | None</code> (None returns per-class values). For AUC: <code>roc_auc_score(y, P, multi_class="ovr" | "ovo")</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Always say which average you report. A model that ignores a rare class can have weighted F1 0.95 and macro F1 0.65. And micro-F1 in single-label multiclass is just accuracy, with all its imbalance problems; quoting it as "F1" makes it sound more careful than it is.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us.</b>  We now have a dozen metrics. Which one should a project optimise? The honest answer starts with money, not mathematics. <b>→ next: 11 Choosing a Metric by Business Cost</b></div>

  <h2 id="ce-cost"><span class="num">11</span>Choosing a Metric by Business Cost</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>We now have a dozen metrics and they can disagree. None of them knows what a missed fraud or a false alarm costs the bank, so none can tell us which model to ship.</p></div>
  <h3>The need</h3>
  <p>Nobody tunes a smoke alarm for accuracy. A false alarm costs a minute of irritation; a missed fire costs the house. Every metric in this note is a stand-in for some cost like that, and each stand-in carries hidden assumptions (F1: FP and FN cost the same, TN is worth nothing; accuracy: every row equally important). The right order of work is: <strong>write down what each outcome costs, then pick or build the metric that follows those costs</strong>.</p>
  <h3>The cost matrix</h3>
  <p>For the fraud team, each cell of the confusion matrix has a price:</p>
  <table class="tbl">
    <tr><th></th><th>Predicted legit (pass)</th><th>Predicted fraud (flag)</th></tr>
    <tr><td><strong>Actual legit</strong></td><td>TN: ₹0</td><td>FP: ₹20 (an analyst reviews it; annoyed customer)</td></tr>
    <tr><td><strong>Actual fraud</strong></td><td>FN: ₹500 (average amount lost)</td><td>TP: ₹20 review (fraud stopped)</td></tr>
  </table>
  <p>Total cost = C_FN · FN + C_FP · FP (the TP review cost is the same for any model that catches the fraud; here we fold it away for simplicity). On the 10 rows at t = 0.5: 500 × 1 + 20 × 2 = <strong>₹540</strong>.</p>
  <h3>Worked by hand: the better F1 loses money</h3>
  <p>Two candidate models on the same 1,000 transactions with 50 frauds:</p>
  <div class="fx" data-lang="py"># Two fraud models on the same 1,000 transactions (50 frauds). Which is better?
C_FN, C_FP = 500, 20                 # rupees lost per missed fraud, per false alarm (manual review)
models = {"A (eager)":   dict(TP=40, FN=10, FP=60, TN=890),
          "B (careful)": dict(TP=30, FN=20, FP=5,  TN=945)}
for name, m in models.items():
    TP, FN, FP, TN = m["TP"], m["FN"], m["FP"], m["TN"]
    acc = (TP + TN) / 1000; P = TP / (TP + FP); R = TP / (TP + FN); F1 = 2 * P * R / (P + R)
    cost = C_FN * FN + C_FP * FP
    print(f"{name:12s} acc={acc:.3f}  precision={P:.3f}  recall={R:.2f}  F1={F1:.3f}  cost = 500x{FN} + 20x{FP} = ₹{cost:,}")</div>
  <div class="fx" data-lang="text">A (eager)    acc=0.930  precision=0.400  recall=0.80  F1=0.533  cost = 500x10 + 20x60 = ₹6,200
B (careful)  acc=0.975  precision=0.857  recall=0.60  F1=0.706  cost = 500x20 + 20x5 = ₹10,100</div>
  <p>Model B wins on accuracy (0.975 vs 0.930), precision and F1 (0.706 vs 0.533). Model A loses on all three and still costs ₹3,900 less, because it misses 10 fewer frauds (10 × ₹500 = ₹5,000 saved) at the price of 55 extra reviews (55 × ₹20 = ₹1,100). F1 weighs a miss and a false alarm equally; the business weighs them 25 : 1.</p>
  <h3>Turning cost into a scorer</h3>
  <p>Any function of (y_true, y_pred) can become a scikit-learn scorer, and then cross-validation and grid search will optimise it directly. Since sklearn always <em>maximises</em> scores, a cost is wrapped with <code>greater_is_better=False</code> and comes back negated:</p>
  <div class="fx" data-lang="py"># turn the business cost into a scorer that cross-validation can use
from fraud import X_tr, y_tr
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import make_scorer, confusion_matrix
from sklearn.model_selection import cross_validate, StratifiedKFold

def rupee_cost(y_true, y_pred):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return 500 * fn + 20 * fp
cost_scorer = make_scorer(rupee_cost, greater_is_better=False)      # sklearn always maximises, so it negates

cv = StratifiedKFold(5, shuffle=True, random_state=0)
for name, m in [("plain", LogisticRegression(max_iter=1000)),
                ("class_weight=balanced", LogisticRegression(max_iter=1000, class_weight="balanced"))]:
    r = cross_validate(m, X_tr, y_tr, cv=cv, n_jobs=1,
                       scoring={"cost": cost_scorer, "f1": "f1", "auc": "roc_auc", "acc": "accuracy"})
    print(f"{name:22s} cost/fold=₹{-r['test_cost'].mean():,.0f}  F1={r['test_f1'].mean():.3f}  "
          f"AUC={r['test_auc'].mean():.3f}  acc={r['test_acc'].mean():.3f}")</div>
  <div class="fx" data-lang="text">plain                  cost/fold=₹16,208  F1=0.510  AUC=0.797  acc=0.984
class_weight=balanced  cost/fold=₹14,764  F1=0.153  AUC=0.818  acc=0.804</div>
  <p>Reweighting the classes (<code>class_weight="balanced"</code>, see <a class="xref" data-note="ml_classification">Logistic Regression</a>) wrecks F1 (0.510 → 0.153) and accuracy (0.984 → 0.804), because it flags far more rows. Yet it cuts the rupee cost by about ₹1,400 per fold. Judged by F1 you would throw away the cheaper model. (A third option, usually the best, is to keep the plain model and move its threshold: that is the main topic of <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.)</p>
  <h3>A decision guide</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Primary metric</th><th>Also report</th></tr>
    <tr><td>Costs of FP and FN are known</td><td>Expected cost (or profit) at the chosen threshold</td><td>Confusion matrix, AP</td></tr>
    <tr><td>Rare positives, you act on flags, costs vague</td><td>AP (PR-AUC); precision at the recall you need (or recall at fixed precision)</td><td>Positive rate as AP baseline</td></tr>
    <tr><td>Balanced classes, ranking quality</td><td>ROC-AUC</td><td>Accuracy, F1</td></tr>
    <tr><td>Misses much worse than false alarms, no exact costs</td><td>F2 or recall at a fixed precision floor</td><td>Precision</td></tr>
    <tr><td>False alarms much worse</td><td>F0.5 or precision at a fixed recall floor</td><td>Recall</td></tr>
    <tr><td>Probabilities used downstream (pricing, risk)</td><td>Log loss or Brier</td><td>Reliability diagram (<a class="xref" data-note="ml_calibration">next notes</a>)</td></tr>
    <tr><td>Imbalanced, want one symmetric number</td><td>MCC or balanced accuracy</td><td>Per-class recall</td></tr>
    <tr><td>Many classes, all matter</td><td>Macro F1 / macro recall</td><td>Per-class report, confusion matrix</td></tr>
    <tr><td>Fixed review capacity (e.g. 100 cases a day)</td><td>Precision@k (share of fraud in the top k scores)</td><td>Recall@k</td></tr>
  </table>
  <h3>When costs differ per row</h3>
  <p>A missed ₹100 fraud and a missed ₹10 lakh fraud are both one FN. If amounts are known, weight each row by its amount (<code>sample_weight=amount</code> in most sklearn metrics) or compute "fraud value caught / total fraud value". Similar mismatches: a recommender judged on click-through rate rewards clickbait (track retention instead); a churn model judged on F1 ignores that a retention offer costs money (use a profit curve: saved value minus offer cost per threshold).</p>
  <div class="flow"><span>Decision the model drives</span><span>Cost of each outcome</span><span>Offline metric that tracks that cost</span><span>Model + threshold choice</span><span>A/B test on the business number</span></div>
  <p>The last step matters: offline metrics only shortlist models. The final verdict comes from an online experiment on the real business number (<a class="xref" data-note="st_abtesting">A/B Testing</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper choosing a security guard. One guard stops everyone (no theft, angry customers); another stops no one. The shopkeeper does not ask "who is more accurate?" but "who costs me less in theft plus lost customers?".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>Given a cost matrix C (C[i][j] = cost of predicting j when truth is i), the <strong>empirical cost</strong> of a classifier is Σᵢⱼ C[i][j] · CM[i][j], where CM is its confusion matrix. Choosing the model and threshold that minimise it is <strong>cost-sensitive evaluation</strong>; <code>make_scorer(cost_fn, greater_is_better=False)</code> plugs it into <code>cross_validate</code> and <code>GridSearchCV</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Costs estimated on the test set and then used to pick the threshold on the same test set leak information: choose model, threshold and cost-weights on validation data, then report once on test. And a cost metric is only as good as the cost numbers; write them down with the business owner before modelling.</p>
  </div>

  <div class="bridge"><b>What this still can't tell us.</b> We know which metric the business needs and how to optimise it in cross-validation. We have not yet listed the library calls for every metric, which input each needs, or how much a test-set number can wobble. <b>→ next: 12 scikit-learn Metrics API</b></div>

  <h2 id="ce-api"><span class="num">12</span>scikit-learn Metrics API</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>We can compute every metric by hand on 10 rows. For real data we need the library calls, which input each one wants, and a way to say how sure we are about the number.</p></div>
  <h3>Which input each function needs</h3>
  <table class="tbl">
    <tr><th>Function</th><th>Input</th><th>Notes</th></tr>
    <tr><td><code>confusion_matrix(y, ŷ, labels=, normalize=)</code></td><td>labels</td><td>rows = actual; <code>normalize="true"</code> gives per-row rates</td></tr>
    <tr><td><code>accuracy_score</code>, <code>balanced_accuracy_score</code></td><td>labels</td><td></td></tr>
    <tr><td><code>precision_score</code>, <code>recall_score</code>, <code>f1_score</code>, <code>fbeta_score</code></td><td>labels</td><td><code>pos_label</code>, <code>average</code>, <code>zero_division</code></td></tr>
    <tr><td><code>precision_recall_fscore_support</code></td><td>labels</td><td>all four at once, per class or averaged</td></tr>
    <tr><td><code>classification_report</code></td><td>labels</td><td>text or <code>output_dict=True</code></td></tr>
    <tr><td><code>matthews_corrcoef</code>, <code>cohen_kappa_score</code></td><td>labels</td><td>kappa has <code>weights="quadratic"</code> for ordinal classes</td></tr>
    <tr><td><code>roc_curve</code>, <code>roc_auc_score</code></td><td>scores</td><td><code>multi_class</code>, <code>max_fpr</code></td></tr>
    <tr><td><code>precision_recall_curve</code>, <code>average_precision_score</code></td><td>scores</td><td></td></tr>
    <tr><td><code>log_loss</code>, <code>brier_score_loss</code></td><td>probabilities</td><td>multiclass: pass the n × k matrix</td></tr>
    <tr><td><code>top_k_accuracy_score</code></td><td>scores</td><td><code>k=</code></td></tr>
    <tr><td><code>ConfusionMatrixDisplay</code>, <code>RocCurveDisplay</code>, <code>PrecisionRecallDisplay</code></td><td>either</td><td><code>.from_predictions(...)</code> or <code>.from_estimator(model, X, y)</code></td></tr>
  </table>
  <p>"labels" = output of <code>predict</code>; "scores" = <code>predict_proba(X)[:, 1]</code> or <code>decision_function(X)</code>; "probabilities" = <code>predict_proba</code> only.</p>
  <div class="fx" data-lang="py">import numpy as np
from fraud import model, X_te, y_te, p_te
from sklearn.metrics import (classification_report, confusion_matrix, ConfusionMatrixDisplay,
                             precision_recall_fscore_support, get_scorer_names)

pred = model.predict(X_te)                                   # predict() = predict_proba &gt;= 0.5
print(confusion_matrix(y_te, pred, normalize="true").round(3))   # each ROW sums to 1: rates per actual class
print(classification_report(y_te, pred, target_names=["legit", "fraud"], digits=3))
p, r, f, s = precision_recall_fscore_support(y_te, pred, average="binary")
print("binary P, R, F1:", round(p, 3), round(r, 3), round(f, 3))
disp = ConfusionMatrixDisplay.from_predictions(y_te, pred, display_labels=["legit", "fraud"])  # draws a heatmap
print("scorer names available:", len(get_scorer_names()))
print([s for s in get_scorer_names() if any(k in s for k in ["roc_auc", "average_precision", "neg_log", "neg_brier", "f1", "balanced", "matthews"])])</div>
  <div class="fx" data-lang="text">[[0.999 0.001]
 [0.647 0.353]]
              precision    recall  f1-score   support

       legit      0.984     0.999     0.992      9751
       fraud      0.936     0.353     0.513       249

    accuracy                          0.983     10000
   macro avg      0.960     0.676     0.752     10000
weighted avg      0.983     0.983     0.980     10000

binary P, R, F1: 0.936 0.353 0.513
scorer names available: 58
['average_precision', 'balanced_accuracy', 'f1', 'f1_macro', 'f1_micro', 'f1_samples', 'f1_weighted', 'matthews_corrcoef', 'neg_brier_score', 'neg_log_loss', 'roc_auc', 'roc_auc_ovo', 'roc_auc_ovo_weighted', 'roc_auc_ovr', 'roc_auc_ovr_weighted']</div>
  <p>The normalised matrix reads as rates: of real legit rows 99.9% passed; of real frauds 64.7% passed (missed) and 35.3% caught. The report shows the fraud line we computed by hand in section 03, plus macro and weighted averages. Scorer strings are what you pass as <code>scoring=</code> to <code>cross_val_score</code>, <code>cross_validate</code> and <code>GridSearchCV</code>; losses appear as <code>neg_…</code> because sklearn always maximises.</p>
  <h3>How sure is the number? Bootstrap intervals</h3>
  <p>A metric computed on one test set is an estimate. With 249 frauds, a few lucky or unlucky rows move it noticeably. Resample the test rows with replacement many times, recompute, and read off the middle 95%:</p>
  <div class="fx" data-lang="py"># how sure are we about a metric? resample the TEST rows with replacement and recompute
import numpy as np
from fraud import y_te, p_te
from sklearn.metrics import roc_auc_score, average_precision_score, recall_score

rng = np.random.default_rng(0)
aucs, aps, recs = [], [], []
for _ in range(500):
    i = rng.integers(0, len(y_te), len(y_te))           # a bootstrap sample of the 10,000 test rows
    aucs.append(roc_auc_score(y_te[i], p_te[i]))
    aps.append(average_precision_score(y_te[i], p_te[i]))
    recs.append(recall_score(y_te[i], p_te[i] &gt;= 0.5))
for name, v, full in [("ROC-AUC", aucs, roc_auc_score(y_te, p_te)), ("AP", aps, average_precision_score(y_te, p_te)),
                      ("recall@0.5", recs, recall_score(y_te, p_te &gt;= 0.5))]:
    lo, hi = np.percentile(v, [2.5, 97.5])
    print(f"{name:10s} = {full:.3f}   95% interval [{lo:.3f}, {hi:.3f}]   width {hi-lo:.3f}")</div>
  <div class="fx" data-lang="text">ROC-AUC    = 0.837   95% interval [0.802, 0.872]   width 0.069
AP         = 0.576   95% interval [0.515, 0.633]   width 0.118
recall@0.5 = 0.353   95% interval [0.298, 0.418]   width 0.120</div>
  <p>AP is 0.576, but anything from about 0.52 to 0.63 is consistent with this test set. If a new model scores AP 0.59, that is not evidence it is better. To compare two models fairly, bootstrap the <em>difference</em> on the same resampled rows (paired), or use cross-validation scores (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>). For AUC there is also an analytic test (DeLong).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>model.score(X, y)</code> on a classifier returns <em>accuracy</em>, not your chosen metric. And <code>predict()</code> always uses 0.5 for binary probability models. For any other metric or threshold, compute it explicitly or wrap the model (<code>FixedThresholdClassifier</code>, <code>TunedThresholdClassifierCV</code>: next notes).</p>
  </div>

  <div class="bridge"><b>What this still can't tell us.</b> We can compute everything and put an interval on it. We have not yet seen all the metrics side by side to choose quickly. <b>→ next: 13 Comparison Tables</b></div>

  <h2 id="ce-compare"><span class="num">13</span>Comparison Tables</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>We met each metric one at a time. We cannot yet see them side by side on the running example to pick one quickly.</p></div>
  <h3>Every metric on the 10 rows</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>10 rows</th><th>Needs threshold</th><th>Uses TN</th><th>Fooled by imbalance</th><th>Useless-model value</th></tr>
    <tr><td>Accuracy</td><td>(TP+TN)/n</td><td>0.700</td><td>yes</td><td>yes</td><td>yes</td><td>max(prev, 1−prev)</td></tr>
    <tr><td>Precision</td><td>TP/(TP+FP)</td><td>0.600</td><td>yes</td><td>no</td><td>depends on prevalence</td><td>prevalence</td></tr>
    <tr><td>Recall</td><td>TP/(TP+FN)</td><td>0.750</td><td>yes</td><td>no</td><td>no</td><td>0 or 1</td></tr>
    <tr><td>Specificity</td><td>TN/(TN+FP)</td><td>0.667</td><td>yes</td><td>yes</td><td>no</td><td>1 or 0</td></tr>
    <tr><td>F1</td><td>2TP/(2TP+FP+FN)</td><td>0.667</td><td>yes</td><td>no</td><td>partly</td><td>≈ 2·prev/(1+prev) if flag all</td></tr>
    <tr><td>Balanced accuracy</td><td>(TPR+TNR)/2</td><td>0.708</td><td>yes</td><td>yes</td><td>no</td><td>0.5</td></tr>
    <tr><td>MCC</td><td>correlation of y, ŷ</td><td>0.408</td><td>yes</td><td>yes</td><td>no</td><td>0</td></tr>
    <tr><td>ROC-AUC</td><td>P(s₊ &gt; s₋)</td><td>0.875</td><td>no</td><td>via FPR</td><td>hides false-alarm volume</td><td>0.5</td></tr>
    <tr><td>Average precision</td><td>Σ ΔR · P</td><td>0.854</td><td>no</td><td>no</td><td>no (reflects it)</td><td>prevalence</td></tr>
    <tr><td>Log loss</td><td>−mean ln p(truth)</td><td>0.497</td><td>no</td><td>yes</td><td>partly</td><td>entropy of prevalence (0.673)</td></tr>
    <tr><td>Brier</td><td>mean (p−y)²</td><td>0.166</td><td>no</td><td>yes</td><td>partly</td><td>prev(1−prev) (0.24)</td></tr>
  </table>
  <h3>ROC-AUC vs average precision vs log loss</h3>
  <table class="tbl">
    <tr><th></th><th>ROC-AUC</th><th>Average precision</th><th>Log loss</th></tr>
    <tr><td>Judges</td><td>Ranking of positives vs negatives</td><td>Ranking at the top of the list</td><td>The probability values</td></tr>
    <tr><td>Changes if scores are squared?</td><td>No</td><td>No</td><td>Yes</td></tr>
    <tr><td>Changes if negatives are multiplied by 10?</td><td>No</td><td>Yes (falls)</td><td>Somewhat</td></tr>
    <tr><td>Best for</td><td>Balanced problems, comparing across datasets</td><td>Rare positives, alerting, retrieval</td><td>Probabilities used as probabilities; training</td></tr>
  </table>
  <h3>Where this note's metrics are used in other notes</h3>
  <table class="tbl">
    <tr><th>Note</th><th>Uses</th></tr>
    <tr><td><a class="xref" data-note="ml_classification">Logistic Regression</a></td><td>Log loss is its training loss; <code>class_weight</code> trades precision for recall</td></tr>
    <tr><td><a class="xref" data-note="ml_gbm">Gradient Boosting</a>, <a class="xref" data-note="ml_xgboost">XGBoost</a></td><td>Log loss / AUC / AP as eval metrics for early stopping</td></tr>
    <tr><td><a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a></td><td>Choosing the scoring string for hyper-parameter search</td></tr>
    <tr><td><a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a></td><td>ROC/PR curves to choose t; Brier and log loss to check calibration</td></tr>
    <tr><td><a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a></td><td>Purity and ARI extend the confusion-matrix idea to clusters</td></tr>
  </table>

  <div class="bridge"><b>What this still can't tell us.</b> The tables list the metrics side by side, but not how each one is built from the others. <b>→ next: 14 How It All Connects</b></div>

  <h2 id="ce-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Each metric was introduced to fix the weakness of the one before. We have not yet seen in one picture how they are all built from the same scores and the same four counts.</p></div>
  <h3>One picture: everything is built from scores and truth</h3>
  <figure class="viz"><svg viewBox="0 0 660 350" width="660">
<defs><marker id="ce-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="200" y="10" width="260" height="42" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="28" text-anchor="middle" font-size="12.5" font-weight="700">10 scores s + 10 truths y</text><text x="330" y="44" text-anchor="middle" class="tm" font-size="10.5">T1 0.95 … T10 0.10 · 4 frauds</text>
<line x1="250" y1="52" x2="120" y2="88" stroke="currentColor" marker-end="url(#ce-a1)"/><line x1="330" y1="52" x2="330" y2="88" stroke="currentColor" marker-end="url(#ce-a1)"/><line x1="410" y1="52" x2="540" y2="88" stroke="currentColor" marker-end="url(#ce-a1)"/>
<text x="150" y="70" class="tb" font-size="10.5">fix t = 0.5</text><text x="336" y="76" class="tg" font-size="10.5">sweep every t</text><text x="480" y="70" class="tr" font-size="10.5">read s as p</text>
<rect x="20" y="90" width="200" height="44" rx="8" class="fb sb"/><text x="120" y="108" text-anchor="middle" font-size="12" font-weight="700">Confusion matrix</text><text x="120" y="125" text-anchor="middle" font-size="11">TP 3 · FP 2 · FN 1 · TN 4</text>
<rect x="240" y="90" width="180" height="44" rx="8" class="fg sg"/><text x="330" y="108" text-anchor="middle" font-size="12" font-weight="700">A matrix per t</text><text x="330" y="125" text-anchor="middle" font-size="11">TPR, FPR, precision</text>
<rect x="440" y="90" width="200" height="44" rx="8" class="fr sr"/><text x="540" y="108" text-anchor="middle" font-size="12" font-weight="700">Per-row penalty</text><text x="540" y="125" text-anchor="middle" font-size="11">−ln p(truth) · (p − y)²</text>
<line x1="120" y1="134" x2="120" y2="158" stroke="currentColor" marker-end="url(#ce-a1)"/>
<rect x="20" y="160" width="200" height="40" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="120" y="177" text-anchor="middle" font-size="11.5">Rates (÷ row or column)</text><text x="120" y="192" text-anchor="middle" font-size="11">P .60 · R .75 · Spec .667</text>
<line x1="120" y1="200" x2="120" y2="222" stroke="currentColor" marker-end="url(#ce-a1)"/>
<rect x="20" y="224" width="200" height="40" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="120" y="241" text-anchor="middle" font-size="11.5">Means of two rates</text><text x="120" y="256" text-anchor="middle" font-size="11">F1 .667 · BalAcc .708</text>
<path d="M20 112 Q 4 112 4 200 Q 4 300 18 300" fill="none" stroke="currentColor" marker-end="url(#ce-a1)"/>
<rect x="20" y="284" width="200" height="40" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.3"/><text x="120" y="301" text-anchor="middle" font-size="11.5">All four cells at once</text><text x="120" y="316" text-anchor="middle" font-size="11">Acc .70 · MCC .408 · ₹540</text>
<line x1="330" y1="134" x2="330" y2="158" stroke="currentColor" marker-end="url(#ce-a1)"/>
<rect x="240" y="160" width="180" height="40" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.3"/><text x="330" y="177" text-anchor="middle" font-size="11.5">ROC: TPR vs FPR</text><text x="330" y="192" text-anchor="middle" font-size="11">AUC = 21/24 = .875</text>
<line x1="330" y1="200" x2="330" y2="222" stroke="currentColor" marker-end="url(#ce-a1)"/>
<rect x="240" y="224" width="180" height="40" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.3"/><text x="330" y="241" text-anchor="middle" font-size="11.5">PR: precision vs recall</text><text x="330" y="256" text-anchor="middle" font-size="11">AP = .854 (random .40)</text>
<line x1="220" y1="180" x2="238" y2="180" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#ce-a1)"/>
<line x1="540" y1="134" x2="540" y2="158" stroke="currentColor" marker-end="url(#ce-a1)"/>
<rect x="440" y="160" width="200" height="40" rx="8" class="fr" stroke="currentColor" stroke-opacity="0.3"/><text x="540" y="177" text-anchor="middle" font-size="11.5">Log loss = mean −ln</text><text x="540" y="192" text-anchor="middle" font-size="11">.497 (always 0.5: .693)</text>
<rect x="440" y="224" width="200" height="40" rx="8" class="fr" stroke="currentColor" stroke-opacity="0.3"/><text x="540" y="241" text-anchor="middle" font-size="11.5">Brier = mean (p − y)²</text><text x="540" y="256" text-anchor="middle" font-size="11">.166 (always 0.5: .25)</text>
<line x1="540" y1="200" x2="540" y2="222" stroke="currentColor" stroke-dasharray="3 3"/>
<rect x="240" y="284" width="400" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="440" y="301" text-anchor="middle" font-size="11.5">Many classes: same recipe per class, then</text><text x="440" y="316" text-anchor="middle" font-size="11">macro .676 · weighted .696 · micro = accuracy .70</text>
<text x="330" y="344" text-anchor="middle" class="tm" font-size="10.5">blue: one threshold · green: ranking · red: probabilities</text>
</svg><figcaption>How every metric in this note is derived. The left column fixes a threshold; the middle repeats the left column's rates at every threshold; the right column never thresholds at all. The dashed arrow: ROC and PR are just the rates of section 04 recomputed for every t.</figcaption></figure>
  <h3>One table: built from what, answers what, on the running example</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Built from</th><th>10 rows</th><th>Question it answers</th><th>Weakness that led to the next</th><th>Robust to imbalance?</th></tr>
    <tr><td>Confusion matrix</td><td>scores + t + truth</td><td>3 / 2 / 1 / 4</td><td>What kinds of right and wrong?</td><td>Four numbers, hard to compare</td><td>(raw counts)</td></tr>
    <tr><td>Accuracy</td><td>(TP+TN)/n</td><td>0.700</td><td>How often right overall?</td><td>Dominated by the big class</td><td>No</td></tr>
    <tr><td>Recall</td><td>TP / row total P</td><td>0.750</td><td>Share of frauds caught</td><td>Trivial 1.0 by flagging all</td><td>Yes</td></tr>
    <tr><td>Precision</td><td>TP / column total</td><td>0.600</td><td>Share of alarms that are real</td><td>Pulls against recall</td><td>Reflects prevalence</td></tr>
    <tr><td>Specificity</td><td>TN / row total N</td><td>0.667</td><td>Share of legit left alone</td><td>Same as recall, for class 0</td><td>Yes</td></tr>
    <tr><td>F1 / F2</td><td>harmonic mean of P, R</td><td>0.667 / 0.714</td><td>One number, both P and R high?</td><td>Ignores TN; equal (or fixed) costs</td><td>Partly</td></tr>
    <tr><td>Balanced acc.</td><td>mean of recall and specificity</td><td>0.708</td><td>Accuracy with classes weighted equally</td><td>Still one threshold</td><td>Yes</td></tr>
    <tr><td>MCC</td><td>correlation of y and ŷ (all 4 cells)</td><td>0.408</td><td>Symmetric overall quality</td><td>Still one threshold</td><td>Yes</td></tr>
    <tr><td>ROC-AUC</td><td>TPR, FPR at every t → area</td><td>0.875</td><td>Does a fraud outrank a legit row?</td><td>Hides false-alarm volume when rare</td><td>Insensitive (can mislead)</td></tr>
    <tr><td>Average precision</td><td>precision at each recall step</td><td>0.854</td><td>How clean is the top of the list?</td><td>Order only, not values</td><td>Yes (baseline = prevalence)</td></tr>
    <tr><td>Log loss</td><td>mean −ln p(truth)</td><td>0.497</td><td>Are the probabilities good?</td><td>Unbounded; two classes only so far</td><td>Partly</td></tr>
    <tr><td>Brier</td><td>mean (p − y)²</td><td>0.166</td><td>Same, gentler</td><td>Two classes only so far</td><td>Partly</td></tr>
    <tr><td>Macro / weighted / micro F1</td><td>per-class F1, then average</td><td>0.676 / 0.696 / 0.700</td><td>Quality across many classes</td><td>Knows nothing of costs</td><td>Macro: yes</td></tr>
    <tr><td>Cost</td><td>C_FN·FN + C_FP·FP</td><td>₹540</td><td>What does the model cost us?</td><td>Needs agreed cost numbers</td><td>Yes, by design</td></tr>
  </table>
  <h3>The identities worth remembering</h3>
  <ul>
    <li>FPR = 1 − specificity; FNR = 1 − recall; FDR = 1 − precision. The ROC curve is (1 − specificity, recall) at every t.</li>
    <li>F1 = 2TP / (2TP + FP + FN); balanced accuracy = (TPR + TNR)/2; AUC on hard 0/1 predictions = balanced accuracy.</li>
    <li>AUC = Mann–Whitney U / (P·N); Gini = 2·AUC − 1; KS = max(TPR − FPR) = Youden's J.</li>
    <li>Log loss = (negative log-likelihood) / n; Brier = MSE of probabilities.</li>
    <li>Micro-F1 = accuracy (single-label multiclass); macro recall = balanced accuracy.</li>
  </ul>
  <div class="bridge"><b>What this still can't tell us.</b> The derivations are clear; the practical mistakes people make with them are next. <b>→ next: 15 Common Mistakes</b></div>

  <h2 id="ce-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Knowing the formulas does not stop the same few mistakes from appearing in code reviews and interviews. Which ones should you watch for?</p></div>
  <div class="cards">
    <div><b>Accuracy on imbalanced data</b><p>"98% accurate" when 97.5% is free. Quote null accuracy, or use AP, MCC, recall/precision.</p><small>Section 03</small></div>
    <div><b>Hard labels into AUC</b><p><code>roc_auc_score(y, model.predict(X))</code> gives balanced accuracy, not AUC.</p><small>Pass <code>predict_proba(X)[:, 1]</code></small></div>
    <div><b>Reading the matrix wrong</b><p>sklearn puts actual on rows, sorted labels, so <code>ravel()</code> = tn, fp, fn, tp. Other tools differ; string labels sort alphabetically.</p><small>Pass <code>labels=[neg, pos]</code></small></div>
    <div><b>Comparing AP across datasets</b><p>AP's floor is the prevalence. Compare AP with that baseline, not with 0.5.</p><small>Section 08</small></div>
    <div><b>Trapezoids under the PR curve</b><p><code>auc(recall, precision)</code> interpolates linearly and gives a different, unjustified number.</p><small>Use <code>average_precision_score</code></small></div>
    <div><b>Unnamed averages</b><p>"F1 = 0.9" for 5 classes: macro, weighted or micro? They can differ by 0.3.</p><small>Section 10</small></div>
    <div><b>Metric ≠ goal</b><p>Best F1 lost ₹3,900 against a worse-F1 model. Put costs on the table first.</p><small>Section 11</small></div>
    <div><b>Evaluating on training data</b><p>Or tuning the threshold on the test set. Both inflate the number you report.</p><small><a class="xref" data-note="ml_splits">Train/Val/Test</a></small></div>
    <div><b>One number, no interval</b><p>Differences smaller than the bootstrap interval (≈ ±0.06 AP here) are noise.</p><small>Section 12</small></div>
    <div><b>Good AUC = good probabilities?</b><p>AUC ignores the values; a model can rank perfectly and be badly calibrated.</p><small>Check log loss / Brier</small></div>
  </div>

  <div class="bridge"><b>What this still can't tell us.</b> You know the traps. To revise the whole note in ten minutes, use the sheet below. <b>→ next: Revision Sheet, then 16 Questions &amp; Answers</b></div>

  <h2 id="ce-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: a fraud model scored 10 transactions, T1–T10, with scores 0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10; investigators found T1, T2, T4 and T6 were fraud (P = 4 positives, N = 6 negatives). At threshold t = 0.5 the model flags T1–T5.</p>
  <h3>The question ladder in one line each</h3>
  <ol>
    <li><strong>Score + threshold</strong>: a classifier gives a score; "flag if score ≥ t" turns it into a decision.</li>
    <li><strong>Confusion matrix</strong>: how decisions meet the truth: TP 3, FP 2, FN 1, TN 4.</li>
    <li><strong>Accuracy</strong> 0.70: share right; fooled when one class dominates.</li>
    <li><strong>Precision 0.60 / recall 0.75 / specificity 0.667</strong>: separate the two kinds of mistake.</li>
    <li><strong>F1 0.667, Fβ</strong>: one number high only when P and R are both high.</li>
    <li><strong>Balanced accuracy 0.708, MCC 0.408, κ 0.40</strong>: use all four cells, immune to imbalance.</li>
    <li><strong>ROC-AUC 0.875</strong>: quality of the ranking over every threshold.</li>
    <li><strong>Average precision 0.854</strong>: quality of the top of the list; right choice for rare positives.</li>
    <li><strong>Log loss 0.497, Brier 0.166</strong>: quality of the probability values.</li>
    <li><strong>Macro 0.676 / weighted 0.696 / micro 0.70</strong>: combining per-class scores for many classes.</li>
    <li><strong>Cost ₹540</strong>: the metric the business actually cares about.</li>
  </ol>
  <h3>Every definition and formula</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Symbols</th><th>Running example</th></tr>
    <tr><td>TP, FP, FN, TN</td><td>counts of (y, ŷ) = (1,1), (0,1), (1,0), (0,0)</td><td>y = truth, ŷ = decision</td><td>3, 2, 1, 4</td></tr>
    <tr><td>Accuracy</td><td>(TP + TN) / n</td><td>n = all rows</td><td>7/10 = 0.70 (null accuracy 0.60)</td></tr>
    <tr><td>Recall = TPR = sensitivity</td><td>TP / (TP + FN)</td><td>TP + FN = P, real positives</td><td>3/4 = 0.75</td></tr>
    <tr><td>Precision = PPV</td><td>TP / (TP + FP)</td><td>TP + FP = alarms raised</td><td>3/5 = 0.60</td></tr>
    <tr><td>Specificity = TNR</td><td>TN / (TN + FP)</td><td>TN + FP = N, real negatives</td><td>4/6 = 0.667</td></tr>
    <tr><td>FPR</td><td>FP / (FP + TN) = 1 − specificity</td><td></td><td>2/6 = 0.333</td></tr>
    <tr><td>NPV</td><td>TN / (TN + FN)</td><td></td><td>4/5 = 0.80</td></tr>
    <tr><td>F1</td><td>2PR/(P + R) = 2TP/(2TP + FP + FN)</td><td>P = precision, R = recall</td><td>6/9 = 0.667</td></tr>
    <tr><td>Fβ</td><td>(1 + β²)PR / (β²P + R)</td><td>β² = how many times worse a miss is than a false alarm</td><td>F2 = 0.714, F0.5 = 0.625</td></tr>
    <tr><td>Balanced accuracy</td><td>(recall + specificity) / 2</td><td></td><td>0.708</td></tr>
    <tr><td>MCC</td><td>(TP·TN − FP·FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))</td><td>range −1 … 1</td><td>10/√600 = 0.408</td></tr>
    <tr><td>Cohen's κ</td><td>(p_o − p_e) / (1 − p_e)</td><td>p_o = accuracy, p_e = chance agreement</td><td>(0.7 − 0.5)/0.5 = 0.40</td></tr>
    <tr><td>ROC-AUC</td><td>Σ ΔFPR × TPR = P(s₊ &gt; s₋) + ½P(tie)</td><td>s₊, s₋ = score of a random positive / negative</td><td>21 of 24 pairs = 0.875</td></tr>
    <tr><td>Average precision</td><td>Σ (Rₙ − Rₙ₋₁) · Pₙ</td><td>Pₙ, Rₙ = precision, recall at the n-th threshold</td><td>0.25(1 + 1 + 0.75 + 0.667) = 0.854</td></tr>
    <tr><td>Log loss</td><td>−(1/n) Σ [y ln p + (1 − y) ln(1 − p)]</td><td>p = predicted probability of class 1</td><td>4.973/10 = 0.497</td></tr>
    <tr><td>Brier</td><td>(1/n) Σ (p − y)²</td><td></td><td>1.66/10 = 0.166</td></tr>
    <tr><td>Macro / weighted / micro</td><td>mean of class scores / mean by support / metric on pooled counts</td><td>support = true class size</td><td>F1: 0.676 / 0.696 / 0.700</td></tr>
    <tr><td>Cost</td><td>C_FN · FN + C_FP · FP</td><td>C = rupees per mistake</td><td>500·1 + 20·2 = ₹540</td></tr>
  </table>
  <h3>The ROC and PR walk of the running example</h3>
  <table class="tbl">
    <tr><th>t (passes)</th><th>0.95 T1</th><th>0.85 T2</th><th>0.80 T3</th><th>0.70 T4</th><th>0.55 T5</th><th>0.45 T6</th><th>0.40 T7</th><th>… 0.10 T10</th></tr>
    <tr><td>TPR</td><td>0.25</td><td>0.50</td><td>0.50</td><td>0.75</td><td>0.75</td><td>1.00</td><td>1.00</td><td>1.00</td></tr>
    <tr><td>FPR</td><td>0</td><td>0</td><td>0.17</td><td>0.17</td><td>0.33</td><td>0.33</td><td>0.50</td><td>1.00</td></tr>
    <tr><td>Precision</td><td>1.00</td><td>1.00</td><td>0.67</td><td>0.75</td><td>0.60</td><td>0.67</td><td>0.57</td><td>0.40</td></tr>
  </table>
  <h3>When to use which</h3>
  <div class="cards">
    <div><b>Accuracy</b><p>Only when classes are roughly balanced and both mistakes cost about the same. Always quote the null accuracy beside it.</p><small>Not for fraud, disease, defects</small></div>
    <div><b>Precision / recall / Fβ</b><p>When you act on the flagged rows. Recall (or F2) when misses are costly; precision (or F0.5) when false alarms are costly.</p><small>Threshold-dependent</small></div>
    <div><b>MCC / balanced accuracy</b><p>One honest summary of a set of decisions on imbalanced data; useless constant models score 0 / 0.5.</p><small>Still one threshold</small></div>
    <div><b>ROC-AUC</b><p>Ranking quality on roughly balanced data, or when comparing across datasets with different positive rates.</p><small>Ignores calibration and false-alarm volume</small></div>
    <div><b>Average precision</b><p>Rare positives you act on (fraud, search, alerts). Compare with the positive rate, not 0.5.</p><small>Depends on prevalence</small></div>
    <div><b>Log loss / Brier</b><p>Whenever the probability itself is used (pricing, risk, cost thresholds), and for early stopping.</p><small>Pair with a ranking metric</small></div>
    <div><b>Macro averages</b><p>Many classes where small classes matter. Weighted follows class size; micro equals accuracy.</p><small>Always name the average</small></div>
    <div><b>Cost</b><p>When the business can price each mistake. It overrules every other metric for the final choice.</p><small>Agree the numbers first</small></div>
  </div>
  <h3>The traps to remember</h3>
  <ul>
    <li>"98% accuracy" on 2.5% fraud is barely above the 97.5% of "always legit".</li>
    <li>sklearn's matrix has actual on rows, sorted labels: <code>ravel()</code> gives tn, fp, fn, tp.</li>
    <li>AUC needs scores (<code>predict_proba(X)[:, 1]</code>); hard labels give balanced accuracy.</li>
    <li>AP's random baseline is the positive rate; never trapezoid a PR curve.</li>
    <li>ROC-AUC barely moves as negatives pile up (0.83 → 0.84) while AP falls (0.88 → 0.58).</li>
    <li>Same accuracy and AUC can hide very different log loss (0.639 vs 1.093).</li>
    <li>The model with the best F1 lost ₹3,900 to a worse-F1 model once costs were applied.</li>
    <li>Choose thresholds on validation data, report once on test, with a bootstrap interval.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <details class="qa"><summary><span class="qmark">Q</span>TP 3, FP 2, FN 1, TN 4: precision, recall, F1?</summary><div class="qa-body">0.60, 0.75, and 2·0.6·0.75/1.35 = 0.667.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>4 positives, 6 negatives; positives win 21 of the 24 pairs. AUC?</summary><div class="qa-body">21/24 = 0.875: the chance a random positive outscores a random negative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What AP does a random model get when 2.5% of rows are positive?</summary><div class="qa-body">About 0.025, the positive rate. (ROC-AUC of a random model is always 0.5.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Log loss of always predicting 0.5?</summary><div class="qa-body">ln 2 = 0.693, whatever the data. Brier of always 0.5 is 0.25.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In single-label multiclass, why does micro-F1 equal accuracy?</summary><div class="qa-body">Each mistake is one FP (for the predicted class) and one FN (for the true class), so pooled FP = pooled FN, making micro precision = micro recall = correct/total.</div></details>

  <h2 id="ce-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span><p>Can you now answer, out loud and with numbers, the questions an interviewer asks about classification metrics?</p></div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Scores 0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10 with truths 1, 1, 0, 1, 0, 1, 0, 0, 0, 0. At t = 0.5 give TP, FP, FN, TN, precision, recall, F1.</summary><div class="qa-body">Flagged: the first five. TP = 3, FP = 2 (0.80 and 0.55), FN = 1 (0.45), TN = 4. Precision = 3/5 = 0.60, recall = 3/4 = 0.75, F1 = 2·0.6·0.75/1.35 = 0.667 (or 2TP/(2TP+FP+FN) = 6/9).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your fraud model has 98.3% accuracy. Is it good?</summary><div class="qa-body">Unknown until you see the baseline and the confusion matrix. With 2.5% fraud, always saying "legit" gives 97.5%. Our model caught only 88 of 249 frauds (recall 0.353). Report precision, recall, AP (against its 0.025 baseline), MCC and the business cost at the chosen threshold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain precision vs recall to a non-technical manager, and say when each matters more.</summary><div class="qa-body">Recall: of all real frauds, what share we caught. Precision: of all the cases we flagged, what share were real. Recall matters when a miss is costly (cancer, fraud, safety); precision when a false alarm is costly (blocking a good customer, deleting real email). Lowering the threshold raises recall and usually lowers precision.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does F1 use the harmonic mean? What does β do in Fβ?</summary><div class="qa-body">The harmonic mean is pulled toward the smaller value, so a model cannot hide a terrible recall behind perfect precision (P 1.0, R 0.1: arithmetic 0.55, harmonic 0.18). Fβ = (1+β²)PR/(β²P+R) weights a false negative β² times as heavily as a false positive: F2 favours recall, F0.5 favours precision.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Draw the ROC curve for the 10 rows and compute AUC two ways.</summary><div class="qa-body">Sorted by score, go up 1/4 per fraud and right 1/6 per legit: up, up, right, up, right, up, right × 4. Area = 1/6·0.5 + 1/6·0.75 + 4/6·1 = 0.875. Pair count: of 4 × 6 = 24 (fraud, legit) pairs the fraud scores higher in 6 + 6 + 5 + 4 = 21; 21/24 = 0.875. Rank-sum: positive ranks 5+7+9+10 = 31, U = 31 − 10 = 21.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ROC-AUC = 0.8 mean in plain words? What does 0.3 mean?</summary><div class="qa-body">Pick a random positive and a random negative: 80% of the time the positive has the higher score (ties count half). It judges ranking only, independent of threshold and calibration. 0.3 means the ranking is informative but reversed, usually a label or sign mix-up; negating the scores gives 0.7.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you prefer PR-AUC (average precision) over ROC-AUC?</summary><div class="qa-body">When positives are rare and you act on the flagged cases. FPR divides by the huge number of negatives, so a tiny FPR can still mean more false alarms than catches (FPR 2.5% gave 244 false alarms vs 150 catches, precision 0.38). Adding negatives left ROC-AUC at 0.83 while AP fell 0.878 → 0.576. Compare AP to the positive rate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute AP for the 10 rows and explain why it is not the trapezoid area.</summary><div class="qa-body">Recall rises at each fraud by 0.25; precision at those moments is 1, 1, 3/4, 4/6. AP = 0.25(1 + 1 + 0.75 + 0.667) = 0.854. Linear interpolation between PR points is not achievable by any threshold (precision is a ratio of two changing counts), so the trapezoid value (0.835) is unjustified; AP uses a step function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive log loss. Why is it preferred to accuracy for training probabilistic models?</summary><div class="qa-body">Each row's probability of what happened is p^y(1−p)^(1−y) (Bernoulli). Multiply over rows (likelihood), take logs, negate and average: −(1/n)Σ[y ln p + (1−y) ln(1−p)]. It is smooth and differentiable (accuracy is a step function with zero gradient), it uses the probability not only the yes/no, and it is a strictly proper scoring rule, so honest probabilities minimise it. Always predicting 0.5 gives 0.693.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Log loss vs Brier score: differences?</summary><div class="qa-body">Both are strictly proper and threshold-free. Log loss = −ln(prob. of truth), unbounded, so one confident mistake can dominate (−ln 0.01 = 4.6). Brier = (p − y)², at most 1 per row, so it is gentler and easy to decompose into calibration and resolution. On the 10 rows: 0.497 vs 0.166; baselines at p = 0.5: 0.693 vs 0.25.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Macro, micro and weighted F1: compute them for per-class F1 0.727, 0.800, 0.500 with supports 6, 2, 2 and accuracy 0.7.</summary><div class="qa-body">Macro = mean = 0.676. Weighted = (6·0.727 + 2·0.8 + 2·0.5)/10 = 0.696. Micro pools TP/FP/FN; in single-label multiclass total FP = total FN, so micro P = R = F1 = accuracy = 0.70. Use macro when small classes matter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is MCC and why is it recommended for imbalanced data?</summary><div class="qa-body">The Pearson correlation between y and ŷ: (TP·TN − FP·FN)/√((TP+FP)(TP+FN)(TN+FP)(TN+FN)). It uses all four cells, is symmetric in the classes, gives 0 to useless constant models (accuracy gave 0.975) and is high only when the model does well on both classes. 10 rows: 10/√600 = 0.408.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A miss costs ₹500, a false alarm ₹20. Model A: FN 10, FP 60, F1 0.533. Model B: FN 20, FP 5, F1 0.706. Which do you ship?</summary><div class="qa-body">A. Cost A = 500·10 + 20·60 = ₹6,200; cost B = 500·20 + 20·5 = ₹10,100. F1 treats FP and FN equally; the business weighs them 25 : 1. Encode the cost with <code>make_scorer(cost, greater_is_better=False)</code> so CV and grid search optimise it, and then also tune the threshold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) The split note says "score on held-out data". Which held-out data do you use to choose a metric's threshold, and which to report it?</summary><div class="qa-body">Choose thresholds, class weights and models on validation data or out-of-fold predictions from cross-validation (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>); report once on the untouched test set, ideally with a bootstrap interval. Tuning on the test set leaks and inflates the reported number.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) A random forest has AUC 0.99 but its predicted probabilities cluster between 0.2 and 0.8. Is that a problem? Which note fixes it?</summary><div class="qa-body">AUC only measures order, so the ranking is excellent; but averaging many trees pulls probabilities toward the middle, so "0.8" may really mean 95%. If the probabilities are used (expected loss, cost-based threshold), check log loss / Brier and a reliability diagram, then recalibrate with Platt scaling or isotonic regression: <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How do these metrics carry over to regression?</summary><div class="qa-body">They do not: with a numeric target there are no TP/FP cells. The same questions (average size of error, sensitivity to big misses, comparison to a dumb baseline, percentage error) are answered by MAE, RMSE, R² (whose baseline is "predict the mean", like null accuracy here), MAPE and MASE in <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>. Brier score is the bridge: it is MSE applied to probabilities.</div></details>
</main>
`
});
