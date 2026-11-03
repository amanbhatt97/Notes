// notes/ml/ml_evaluation.js — Classification Metrics
Object.assign(TOPIC_CONTENT, {
  "ml_evaluation": `<main>
  <h1>Classification Metrics</h1>
  <div class="where"><span>Machine Learning</span><span>Model Evaluation</span><span>Classification Metrics</span></div>
  <p class="lead">A classification metric is a number that says how good a model is at putting things into the right class: fraud or legit, spam or not, sick or healthy. Choosing that number is one of the most important decisions in a real project, because the model you ship is whichever one scores best on it, and a badly chosen metric will happily pick a useless model. A fraud model can report "98.3% accurate" and still let two out of every three frauds through. To see why, and what to measure instead, we will use one running example the whole way: a fraud model has scored 10 card transactions, and investigators later found out which ones really were fraud. Every metric on this page is first worked out by hand on those 10 rows, and then checked with scikit-learn on a larger, realistic fraud dataset.</p>

  <h2 id="ce-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Classification Metrics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">One threshold</div>
        <ul>
          <li>Score ≥ threshold t → flag; gives <b>TP, FP, FN, TN</b></li>
          <li><b>Accuracy</b> fooled by imbalance; compare with null accuracy</li>
          <li><b>Precision</b> TP/(TP+FP), <b>recall</b> TP/(TP+FN), <b>specificity</b> TN/(TN+FP)</li>
          <li><b>F1</b> harmonic mean; <b>MCC</b>, balanced accuracy use all four cells</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Every threshold</div>
        <ul>
          <li><b>ROC</b>: TPR vs FPR; <b>AUC</b> = P(random positive outranks random negative)</li>
          <li><b>PR curve</b>: precision vs recall; <b>AP</b> baseline = positive rate</li>
          <li>Rare positives: ROC-AUC flatters, AP tells the truth</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Probabilities</div>
        <ul>
          <li><b>Log loss</b> = mean −ln(prob. given to the truth); always 0.5 → 0.693</li>
          <li><b>Brier</b> = mean (p − y)²; always 0.5 → 0.25</li>
          <li>Both proper: honest probabilities score best</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing</div>
        <ul>
          <li>Many classes: <b>macro</b> (classes equal), <b>weighted</b>, <b>micro</b> (= accuracy)</li>
          <li>Price each mistake first; the cheapest model can have the worse F1</li>
          <li><code>make_scorer(cost, greater_is_better=False)</code>; report with a bootstrap interval</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ce-cm"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Scores, Thresholds and the Confusion Matrix</span><span class="rm-sub">the four kinds of right and wrong answer</span></div></div>
      <div class="rm-item rm-done" data-target="ce-acc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Accuracy and the Imbalance Trap</span><span class="rm-sub">why 98% accurate can be useless</span></div></div>
      <div class="rm-item rm-done" data-target="ce-pr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Precision, Recall and Specificity</span><span class="rm-sub">two different questions about mistakes</span></div></div>
      <div class="rm-item rm-done" data-target="ce-f1"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">F1 and Fβ</span><span class="rm-sub">one number that needs both to be high</span></div></div>
      <div class="rm-item rm-done" data-target="ce-mcc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Balanced Accuracy, MCC and Kappa</span><span class="rm-sub">one number that uses all four cells</span></div></div>
      <div class="rm-item rm-done" data-target="ce-roc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The ROC Curve and AUC</span><span class="rm-sub">judging the scores at every threshold</span></div></div>
      <div class="rm-item rm-done" data-target="ce-prc"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The PR Curve and Average Precision</span><span class="rm-sub">what rare positives need</span></div></div>
      <div class="rm-item rm-done" data-target="ce-ll"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Log Loss and the Brier Score</span><span class="rm-sub">judging the probabilities themselves</span></div></div>
      <div class="rm-item rm-done" data-target="ce-multi"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Many Classes</span><span class="rm-sub">macro, micro and weighted averages</span></div></div>
      <div class="rm-item rm-done" data-target="ce-cost"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing a Metric by Business Cost</span><span class="rm-sub">from rupees to a scorer</span></div></div>
      <div class="rm-item rm-done" data-target="ce-api"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Computing Metrics in scikit-learn</span><span class="rm-sub">reports, inputs and intervals</span></div></div>
      <div class="rm-item rm-done" data-target="ce-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">hard labels into AUC, label order, no baseline</span></div></div>
      <div class="rm-item rm-done" data-target="ce-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, values, when to use which</span></div></div>
      <div class="rm-item rm-done" data-target="ce-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on metrics</span></div></div>
    </div>
  </div>

  <h2 id="ce-cm"><span class="num">01</span>Scores, Thresholds and the Confusion Matrix</h2>
  <p>Imagine you have built a fraud model for a bank and your manager asks one question: "Is it good?" To answer, you have to compare what the model said with what really happened, on transactions the model never saw during training, and boil that comparison down to something you can report. Before we can do any of that, we need to be precise about what a classifier actually hands us, because it is not a verdict.</p>
  <p>Almost every classifier, whether logistic regression, a tree ensemble or a neural network, first computes a <strong>score</strong> for each row: a number where higher means "more likely to be fraud". Often the score is a probability between 0 and 1 (what scikit-learn's <code>predict_proba</code> returns); for some models, such as an SVM's <code>decision_function</code>, it can be any real number. To act on it, the bank needs a yes or no, so we choose a <strong>threshold</strong> t and say "flag the transaction if its score is at least t". scikit-learn's <code>predict()</code> quietly uses t = 0.5. The class we are searching for (fraud) is called the <strong>positive</strong> class and labelled 1; the other is the <strong>negative</strong> class, labelled 0. "Positive" means "the thing we are looking for", not "good news".</p>
  <p>Here is the running example. A model scored 10 transactions from last week, and investigators later confirmed which 4 of them were fraud. The rows are sorted by score, highest first:</p>
  <table class="tbl">
    <tr><th>Row</th><th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>T8</th><th>T9</th><th>T10</th></tr>
    <tr><td>score</td><td>0.95</td><td>0.85</td><td>0.80</td><td>0.70</td><td>0.55</td><td>0.45</td><td>0.40</td><td>0.30</td><td>0.20</td><td>0.10</td></tr>
    <tr><td>really fraud (y)</td><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  </table>
  <p>This is what a decent but imperfect model looks like: frauds are mostly near the top and legitimate rows mostly near the bottom, but T3 (legit) scored 0.80, above the real fraud T4, and the fraud T6 scored only 0.45. We store the table in a small module so that later code can import it:</p>
  <div class="fx" data-lang="py"># ten.py - the 10 transactions used all through this note
import numpy as np
ids   = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"]
score = np.array([0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10])  # model's fraud score
y     = np.array([1,    1,    0,    1,    0,    1,    0,    0,    0,    0   ])  # 1 = really fraud

if __name__ == "__main__":
    print(len(y), "transactions,", y.sum(), "frauds")</div>
  <div class="fx" data-lang="text">10 transactions, 4 frauds</div>
  <p>The picture below shows what is going on inside every classifier. The grey hump is the spread of scores for legitimate rows and the red hump the spread for frauds. The threshold is a vertical line, and everything to its right gets flagged. Because the two humps overlap, any position of the line makes mistakes of two kinds: some legit rows land on the right (false alarms) and some frauds land on the left (misses). Sliding the line to the left trades misses for false alarms, and sliding it right does the opposite. No threshold removes both, which is why metrics have to talk about both kinds of mistake.</p>
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
  <p>Once a threshold is fixed, every row lands in exactly one of four boxes. A <strong>true positive (TP)</strong> was fraud and the model flagged it: a catch. A <strong>false positive (FP)</strong> was legit but got flagged: a false alarm, which statisticians call a <em>Type I error</em>. A <strong>false negative (FN)</strong> was fraud but the model let it pass: a miss, or <em>Type II error</em>. A <strong>true negative (TN)</strong> was legit and was correctly left alone. The naming rule is worth remembering: the second word is what the model <em>said</em> (positive means flagged), and the first word says whether that was <em>true</em>. So a "false negative" is a "no" that turned out wrong. Laying the four counts out in a 2 × 2 grid gives the <strong>confusion matrix</strong>: a table whose rows are what really happened and whose columns are what the model said.</p>
  <p>Think of an airport metal detector. It beeps for a belt buckle: a false positive, annoying but cheap. It stays silent for a knife: a false negative, rare but dangerous. Both are "errors", but no airport would judge the detector by simply counting errors without asking which kind. That is the whole reason the confusion matrix keeps the two kinds apart.</p>
  <p>Let us count by hand at t = 0.5. The model flags every row with a score of at least 0.5, which is T1 to T5. Of those, T1, T2 and T4 are frauds (TP = 3) and T3 and T5 are legit (FP = 2). Of the five rows passed, T6 is a fraud (FN = 1) and T7 to T10 are legit (TN = 4). The check 3 + 2 + 1 + 4 = 10 confirms every row is counted once. The code does the same labelling and then asks scikit-learn for the matrix:</p>
  <div class="fx" data-lang="py">from ten import ids, score, y
from sklearn.metrics import confusion_matrix

pred = (score &gt;= 0.5).astype(int)          # threshold 0.5 turns scores into yes/no
for i, s, a, p in zip(ids, score, y, pred):
    kind = {(1, 1): "TP", (0, 1): "FP", (1, 0): "FN", (0, 0): "TN"}[(a, p)]
    print(f"{i:&gt;3}  score={s:.2f}  actual={a}  pred={p}  -&gt; {kind}")

cm = confusion_matrix(y, pred)             # rows = actual 0,1 ; columns = predicted 0,1
print(cm)
tn, fp, fn, tp = cm.ravel()                # the order is always TN, FP, FN, TP
print("tn, fp, fn, tp =", tn, fp, fn, tp)</div>
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
[[4 2]
 [1 3]]
tn, fp, fn, tp = 4 2 1 3</div>
  <p>The printed matrix is <code>[[4 2] [1 3]]</code>, which reads as [[TN, FP], [FN, TP]]. scikit-learn puts the actual class on the rows and the predicted class on the columns, and sorts the labels, so 0 comes before 1. Flattening it with <code>.ravel()</code> therefore always gives the order <code>tn, fp, fn, tp</code>, which is why that unpacking line is so common in real code. Many textbooks draw the matrix the other way round (positives first, or predictions on the rows), so always read the axis labels before trusting someone else's matrix.</p>
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
  <p>The row and column totals of the matrix have names of their own, and later metrics are built by dividing by them. The bottom row adds up to <strong>P</strong> = 4, the number of real positives (frauds that exist); the top row adds up to <strong>N</strong> = 6, the real negatives. The right column, 5, is the number of alarms raised, which is the work the fraud team will have to do. P divided by the total, 0.4 here, is called the <strong>prevalence</strong> or base rate: the share of rows that are positive.</p>
  <p>Two things to keep in mind before moving on. First, the matrix belongs to one threshold: at t = 0.7 the same model has TP 3, FP 1, FN 1, TN 5, so saying "the model's confusion matrix" without a threshold is incomplete. Second, all of this must be computed on rows the model did not train on, such as a test set or out-of-fold predictions (see <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>); a perfect score on training data only shows that the model memorised it. Every metric in the next four sections is a different way of squeezing these four counts into one number.</p>

  <h2 id="ce-acc"><span class="num">02</span>Accuracy and the Imbalance Trap</h2>
  <p>Four numbers are awkward when you want to compare ten models, so the obvious move is to boil them down to one. The most natural single number is the share of rows the model got right. That is <strong>accuracy</strong>: the diagonal of the confusion matrix divided by the total, (TP + TN) / n. On our 10 rows it is (3 + 4) / 10 = 0.70, and its complement, the error rate, is 0.30. That sounds reasonable. The trouble appears as soon as the data looks like real fraud data, where fraud is rare.</p>
  <p>To see it, we need a bigger dataset. The module below builds 20,000 synthetic transactions with about 2.5% fraud, trains a logistic regression on half of them and keeps the fraud probabilities for the other half. Later sections reuse it:</p>
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
  <p>Now compare the trained model with a "model" that never flags anything. scikit-learn's <code>DummyClassifier(strategy="most_frequent")</code> simply predicts the majority class for every row, so it is exactly the lazy model that says "legit" every time:</p>
  <div class="fx" data-lang="py">from fraud import X_tr, y_tr, X_te, y_te, p_te
from sklearn.dummy import DummyClassifier
from sklearn.metrics import confusion_matrix, accuracy_score, recall_score

lazy = DummyClassifier(strategy="most_frequent").fit(X_tr, y_tr).predict(X_te)   # always "legit"
print("always-legit : accuracy", round(accuracy_score(y_te, lazy), 4), " recall", recall_score(y_te, lazy))

pred = (p_te &gt;= 0.5).astype(int)
print("logistic     : accuracy", round(accuracy_score(y_te, pred), 4), " recall", round(recall_score(y_te, pred), 4))
print("TN FP FN TP  =", *confusion_matrix(y_te, pred).ravel())</div>
  <div class="fx" data-lang="text">always-legit : accuracy 0.9751  recall 0.0
logistic     : accuracy 0.9833  recall 0.3534
TN FP FN TP  = 9745 6 161 88</div>
  <p>The useless model, which catches zero frauds (recall 0.0), scores 97.5% accuracy, simply because 97.5% of the rows are legit. The real model scores 98.3%, less than one point better, and its confusion matrix shows that it misses 161 of the 249 frauds. Accuracy gives every row the same weight, and 97.5% of the rows are easy legitimate ones, so the number is dominated by the part of the problem nobody cares about. This is known as the <strong>accuracy paradox</strong>. A weather forecaster in a desert who says "no rain" every single day is right on 360 days a year, about 98.6% accuracy, and completely useless on the five days that matter.</p>
  <p>The practical defence is to always put accuracy next to its baseline, the <strong>null accuracy</strong>: the accuracy of always predicting the most common class, which equals the larger of the prevalence and one minus the prevalence. On the 10 rows the null accuracy is 0.6, so our 0.70 is only 0.10 above doing nothing; on the fraud data it is 0.975. Accuracy is a fine summary only when the classes are roughly balanced and both kinds of mistake cost about the same. For everything else, including almost every interesting business problem, we need metrics that look at the two kinds of mistake separately.</p>

  <h2 id="ce-pr"><span class="num">03</span>Precision, Recall and Specificity</h2>
  <p>Two people can look at the same confusion matrix and care about completely different things. The head of fraud losses asks: "Of all the real frauds, how many did we stop?" The head of the review team asks: "Of all the alarms my analysts check, how many are real?" These are two different fractions of the same four counts, and accuracy blurred them together.</p>
  <p>The first question is answered by <strong>recall</strong>, the share of actual positives that the model caught: TP / (TP + FN). It looks only at the bottom row of the matrix. On our rows recall = 3 / (3 + 1) = 0.75: of the 4 frauds, 3 were caught and T6 slipped through. Recall is also called <strong>sensitivity</strong> or the <strong>true positive rate</strong> (TPR). The second question is answered by <strong>precision</strong>, the share of flagged rows that really were positive: TP / (TP + FP). It looks only at the right-hand column. Here precision = 3 / (3 + 2) = 0.60: of 5 alarms, 3 were real and T3 and T5 were false alarms. Think of fishing with a net: recall is the share of the lake's fish you caught, and precision is the share of your catch that is fish rather than old boots. A bigger net raises recall and drags in more boots.</p>
  <p>The same two questions can be asked about the negative class. <strong>Specificity</strong>, or the true negative rate, is the share of legit rows left alone: TN / (TN + FP) = 4 / 6 = 0.667. The <strong>negative predictive value</strong> (NPV) is the share of passed rows that really were legit: TN / (TN + FN) = 4 / 5 = 0.80. Notice the symmetry: specificity is just recall computed for class 0, and NPV is precision for class 0. scikit-learn has no separate functions for them; you call the usual ones with <code>pos_label=0</code>:</p>
  <div class="fx" data-lang="py">from ten import score, y
from sklearn.metrics import precision_score, recall_score

pred = (score &gt;= 0.5).astype(int)
print("precision   3/5 =", precision_score(y, pred))
print("recall      3/4 =", recall_score(y, pred))
print("specificity 4/6 =", round(recall_score(y, pred, pos_label=0), 3))     # recall of class 0
print("NPV         4/5 =", precision_score(y, pred, pos_label=0))           # precision of class 0</div>
  <div class="fx" data-lang="text">precision   3/5 = 0.6
recall      3/4 = 0.75
specificity 4/6 = 0.667
NPV         4/5 = 0.8</div>
  <p>All four printed values match the hand calculations. Interviewers like to use the other names for these rates, and they all come from dividing a cell of the matrix by a row total or a column total. The table below collects them with their values on the 10 rows:</p>
  <table class="tbl">
    <tr><th>Name(s)</th><th>Formula</th><th>Divides by</th><th>10 rows</th></tr>
    <tr><td>Recall, sensitivity, TPR</td><td>TP / (TP + FN)</td><td>actual positives</td><td>3/4 = 0.75</td></tr>
    <tr><td>Miss rate, FNR</td><td>FN / (TP + FN)</td><td>actual positives</td><td>1/4 = 0.25</td></tr>
    <tr><td>Specificity, TNR</td><td>TN / (TN + FP)</td><td>actual negatives</td><td>4/6 = 0.667</td></tr>
    <tr><td>Fall-out, FPR</td><td>FP / (TN + FP)</td><td>actual negatives</td><td>2/6 = 0.333</td></tr>
    <tr><td>Precision, PPV</td><td>TP / (TP + FP)</td><td>predicted positives</td><td>3/5 = 0.60</td></tr>
    <tr><td>False discovery rate</td><td>FP / (TP + FP)</td><td>predicted positives</td><td>2/5 = 0.40</td></tr>
    <tr><td>NPV</td><td>TN / (TN + FN)</td><td>predicted negatives</td><td>4/5 = 0.80</td></tr>
  </table>
  <p>One fact in this table explains a lot of what follows. Recall, specificity, FNR and FPR divide by the <em>truth</em> (the row totals), so they do not change if you simply add more negative rows. Precision and NPV divide by the <em>prediction</em> (the column totals), so they depend heavily on how common positives are. A worked example shows how strongly. A disease test with sensitivity 0.99 and specificity 0.99 sounds perfect. Test 100,000 people of whom only 0.1%, that is 100 people, are sick. We expect TP = 0.99 × 100 = 99 and FP = 0.01 × 99,900 = 999, so precision = 99 / (99 + 999) = 0.09. Nine out of ten positive results are false, because the healthy group is a thousand times larger. This is Bayes' theorem in disguise (<a class="xref" data-note="st_probability">Probability</a>): precision is P(sick | positive test), and that depends on the base rate.</p>
  <p>Precision and recall also pull against each other as the threshold moves. Lowering the threshold flags more rows, so recall can only stay the same or go up, but more of the newly flagged rows are legit, so precision usually goes down. On the 10 rows, t = 0.85 flags only T1 and T2, giving precision 1.00 and recall 0.50; t = 0.45 flags T1 to T6, giving precision 0.667 and recall 1.00. This is why neither number means anything alone: recall of 1.0 is trivially achieved by flagging everything, and precision of 1.0 by flagging only the single most obvious case. Which one to favour depends on what a mistake costs. When a miss is expensive and a false alarm cheap (cancer screening, fraud, machine failure), favour recall. When a false alarm is expensive (a spam filter that deletes real mail, automatically blocking a customer's card), favour precision.</p>

  <h2 id="ce-f1"><span class="num">04</span>F1 and Fβ</h2>
  <p>Two numbers make ranking models awkward. Is a model with precision 0.6 and recall 0.75 better than one with precision 0.9 and recall 0.5? We want a single score that is high only when <em>both</em> are high. The plain average does not work: a model that flags exactly one row, correctly, out of 10 frauds has precision 1.0 and recall 0.1, and their average is 0.55, which sounds half-decent for a model that misses 90% of fraud.</p>
  <p>The fix is the <strong>F1 score</strong>, the harmonic mean of precision and recall: F1 = 2PR / (P + R). A harmonic mean is the reciprocal of the average of reciprocals, and its useful property is that it is dragged towards the smaller of the two numbers. Think of a cricket selector picking an all-rounder who says "you are only as good as your weaker skill": a brilliant batsman who cannot bowl is not an all-rounder. On our rows, F1 = 2 × 0.6 × 0.75 / (0.6 + 0.75) = 0.9 / 1.35 = 0.667. The code compares the two kinds of average and then checks the F scores with scikit-learn:</p>
  <div class="fx" data-lang="py">from ten import score, y
from sklearn.metrics import f1_score, fbeta_score

for P, R in [(0.6, 0.75), (0.9, 0.9), (1.0, 0.1)]:
    print(f"P={P:&lt;4} R={R:&lt;5} arithmetic mean={(P + R) / 2:.3f}  harmonic mean (F1)={2 * P * R / (P + R):.3f}")

pred = (score &gt;= 0.5).astype(int)
print("F1   =", round(f1_score(y, pred), 3))
print("F0.5 =", round(fbeta_score(y, pred, beta=0.5), 3), "  F2 =", round(fbeta_score(y, pred, beta=2), 3))</div>
  <div class="fx" data-lang="text">P=0.6  R=0.75  arithmetic mean=0.675  harmonic mean (F1)=0.667
P=0.9  R=0.9   arithmetic mean=0.900  harmonic mean (F1)=0.900
P=1.0  R=0.1   arithmetic mean=0.550  harmonic mean (F1)=0.182
F1   = 0.667
F0.5 = 0.625   F2 = 0.714</div>
  <p>When precision and recall are equal (0.9 and 0.9) both averages agree. When they differ, the harmonic mean sits near the smaller one: (1.0, 0.1) gives 0.182 instead of 0.55, so a model cannot hide a terrible recall behind perfect precision.</p>
  <p>Substituting the definitions and simplifying gives a form in counts that teaches two lessons: F1 = 2TP / (2TP + FP + FN) = 6 / 9 = 0.667. First, F1 treats one false positive and one false negative as equally bad. Second, TN does not appear at all, so F1 does not care how many legitimate rows you correctly left alone. That is helpful when negatives are a huge boring majority, and unhelpful when passing negatives correctly matters too.</p>
  <p>When a miss really is worse than a false alarm, you can tilt the score. The <strong>Fβ score</strong> is a weighted harmonic mean in which recall counts β times as much as precision: Fβ = (1 + β²) · P · R / (β² · P + R). In counts it equals (1 + β²)TP / ((1 + β²)TP + β²·FN + FP), which shows its meaning directly: a false negative is weighted β² times as heavily as a false positive. β = 1 gives F1. <strong>F2</strong> (β = 2) counts misses four times as heavily, which suits screening and fraud; on our rows it is 5 × 0.45 / (4 × 0.6 + 0.75) = 0.714. <strong>F0.5</strong> counts false alarms four times as heavily, which suits a spam filter; here it is 0.625. Our model has higher recall than precision, so the recall-heavy F2 rewards it most, exactly as the output shows.</p>
  <p>Keep in mind that F1 is still a threshold metric: the same model has a different F1 at every threshold, and the default 0.5 is rarely the best one. Finding the F1-best threshold is part of <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</p>

  <h2 id="ce-mcc"><span class="num">05</span>Balanced Accuracy, MCC and Kappa</h2>
  <p>F1 ignores the TN cell, and accuracy is fooled by imbalance. It would be useful to have one number that uses all four cells and still gives a useless model no credit. There are three common answers.</p>
  <p>The simplest is <strong>balanced accuracy</strong>: the average of the recall of each class, so that each class counts equally whatever its size. For two classes it is (recall + specificity) / 2 = (0.75 + 0.667) / 2 = 0.708 on our rows. The "always legit" model has recall 0 and specificity 1, so it scores exactly 0.5 on any dataset, which is what a useless model deserves.</p>
  <p>The second is the <strong>Matthews correlation coefficient</strong> (MCC). Write the true labels y and the predictions ŷ as two columns of 0s and 1s and compute their ordinary Pearson correlation. Simplified using the four counts, that correlation is MCC = (TP·TN − FP·FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN)). On our rows the numerator is 3·4 − 2·1 = 10 and the denominator is √(5·4·6·5) = √600 = 24.49, so MCC = 0.408. Read it like any correlation: +1 is perfect, 0 is no better than chance, and −1 is perfectly wrong. All four cells appear, and swapping which class is called "positive" gives the same value. If a bracket in the denominator is 0, as happens when a model never flags anything, scikit-learn returns 0.</p>
  <p>The third, <strong>Cohen's kappa</strong>, asks how much better the model's agreement with the truth is than agreement by pure luck. Imagine two friends guessing coin tosses: they agree half the time by chance alone, and kappa only gives credit for agreement beyond that. The observed agreement p_o is the accuracy, 0.70. The chance agreement p_e is what we would get if the model flagged 50% of rows at random while 40% are fraud: they would agree on "fraud" 0.5 × 0.4 = 0.20 of the time and on "legit" 0.5 × 0.6 = 0.30, so p_e = 0.50. Then κ = (p_o − p_e) / (1 − p_e) = 0.20 / 0.50 = 0.40. Kappa comes from measuring agreement between two human raters and is mostly used in medicine and annotation quality; for model evaluation MCC is usually preferred because it behaves better at extreme imbalance.</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import score, y
from fraud import y_te, p_te
from sklearn.metrics import (balanced_accuracy_score, matthews_corrcoef, cohen_kappa_score,
                             accuracy_score, f1_score)

pred = (score &gt;= 0.5).astype(int)
print(f"10 rows: balanced acc={balanced_accuracy_score(y, pred):.3f}  MCC={matthews_corrcoef(y, pred):.3f}  "
      f"kappa={cohen_kappa_score(y, pred):.3f}")

print("fraud data, 2.5% positives:")
for name, pr in [("always legit", np.zeros_like(y_te)), ("logistic @0.5", (p_te &gt;= 0.5).astype(int))]:
    print(f"  {name:14s} acc={accuracy_score(y_te, pr):.3f}  balanced acc={balanced_accuracy_score(y_te, pr):.3f}  "
          f"F1={f1_score(y_te, pr, zero_division=0):.3f}  MCC={matthews_corrcoef(y_te, pr):.3f}")</div>
  <div class="fx" data-lang="text">10 rows: balanced acc=0.708  MCC=0.408  kappa=0.400
fraud data, 2.5% positives:
  always legit   acc=0.975  balanced acc=0.500  F1=0.000  MCC=0.000
  logistic @0.5  acc=0.983  balanced acc=0.676  F1=0.513  MCC=0.570</div>
  <p>The first line confirms the three hand values. The fraud lines are the interesting part: accuracy says the useless model (0.975) is almost as good as the real one (0.983), while balanced accuracy (0.500 against 0.676), F1 (0 against 0.513) and MCC (0 against 0.570) all expose the difference clearly. These are good single numbers for a set of yes/no decisions on imbalanced data. But notice what they still judge: one set of decisions at one threshold that <em>we</em> chose. A model with an excellent ranking can look poor at a badly chosen threshold. The next two sections judge the scores themselves.</p>

  <h2 id="ce-roc"><span class="num">06</span>The ROC Curve and AUC</h2>
  <p>The model's real job is to put frauds above legitimate rows; the threshold is a business choice made afterwards. If we compare two models only at t = 0.5, we may simply be comparing how well 0.5 happens to suit each model. We want a judgement of the scores that does not depend on any one threshold.</p>
  <p>The idea is to slide the threshold from "above every score" (flag nothing) down to "below every score" (flag everything) and, at every stop, write down two numbers: the share of frauds caught (TPR, which is recall) and the share of legit rows wrongly flagged (FPR, the false positive rate, which is 1 − specificity). Plotting TPR against FPR traces the <strong>ROC curve</strong>; the name, "receiver operating characteristic", comes from radar operators in the Second World War. A perfect model reaches the top-left corner (all frauds caught, no false alarms) straight away; a model that guesses at random walks along the diagonal.</p>
  <p>With P = 4 frauds and N = 6 legit rows, every fraud the sliding line passes adds 1/4 to TPR and every legit row adds 1/6 to FPR. The code uses each score in turn as the threshold:</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import score, y
from sklearn.metrics import roc_curve, roc_auc_score

P, N = y.sum(), (1 - y).sum()                  # 4 frauds, 6 legit
print("threshold  TP  FP   TPR   FPR")
for t in score:                                # try every score as the cut-off, high to low
    flag = score &gt;= t
    tp, fp = int((flag &amp; (y == 1)).sum()), int((flag &amp; (y == 0)).sum())
    print(f"{t:&gt;9.2f}  {tp:&gt;2d}  {fp:&gt;2d}  {tp/P:.2f}  {fp/N:.2f}")

pairs = [(s1 &gt; s0) + 0.5 * (s1 == s0) for s1 in score[y == 1] for s0 in score[y == 0]]
print(f"pairs won     = {sum(pairs):.0f} of {len(pairs)} = {np.mean(pairs):.4f}")
print(f"roc_auc_score = {roc_auc_score(y, score):.4f}")</div>
  <div class="fx" data-lang="text">threshold  TP  FP   TPR   FPR
     0.95   1   0  0.25  0.00
     0.85   2   0  0.50  0.00
     0.80   2   1  0.50  0.17
     0.70   3   1  0.75  0.17
     0.55   3   2  0.75  0.33
     0.45   4   2  1.00  0.33
     0.40   4   3  1.00  0.50
     0.30   4   4  1.00  0.67
     0.20   4   5  1.00  0.83
     0.10   4   6  1.00  1.00
pairs won     = 21 of 24 = 0.8750
roc_auc_score = 0.8750</div>
  <p>Walk down the table. The threshold passes T1, a fraud, so the curve steps <em>up</em> to (0, 0.25). T2 is also a fraud: up to (0, 0.50). T3 is legit: a step <em>right</em> to (0.17, 0.50). T4, fraud: up. T5, legit: right. T6, fraud: up to (0.33, 1.00). The last four rows are all legit, so four steps right reach (1, 1). That gives the rule for drawing an ROC curve by hand: sort the rows by score, then go up 1/P for every positive and right 1/N for every negative. The left panel of the figure is that staircase, each label marking the point reached when the threshold equals that row's score.</p>
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
  <p>The single-number summary is the <strong>area under the ROC curve</strong>, or <strong>AUC</strong>. The right panel cuts the staircase into three rectangles: from FPR 0 to 1/6 the height is 0.50, giving 0.083; from 1/6 to 2/6 the height is 0.75, giving 0.125; and from 2/6 to 1 the height is 1.00, giving 0.667. The total is 0.875. A perfect model has area 1 and a random one 0.5. Libraries compute the same area with the trapezoid rule, which for a staircase reduces to these rectangles.</p>
  <p>AUC also has a meaning that interviewers love, and it is the best way to understand it: <strong>AUC is the probability that a randomly chosen positive gets a higher score than a randomly chosen negative.</strong> The code checks this by counting all 4 × 6 = 24 (fraud, legit) pairs. T1 and T2 beat all six legit rows (6 + 6), T4 at 0.70 beats every legit row except T3 at 0.80 (5), and T6 at 0.45 beats T7 to T10 but not T3 or T5 (4). That is 21 wins out of 24, which is 0.875, the same number as the area. The two definitions agree for a simple reason. Each step right on the staircase is one negative row, of width 1/N, and the height of the curve at that step is the share of positives already passed, which is exactly the share of positives that scored above that negative. So the area adds up, over negatives, the fraction of pairs each one loses to the positives. Think of a teacher who ranks students before the results come out: AUC 0.875 means that if you pick any student who passed and any who failed, 87.5% of the time the teacher had put the one who passed higher. It says nothing about where the pass mark should be.</p>
  <p>Counting pairs takes P × N comparisons, which is too slow for millions of rows, so libraries use a shortcut called the rank-sum, or Mann–Whitney U, formula. Rank all scores from lowest (rank 1) to highest (rank n) and add up the ranks of the positives. Here the frauds have ranks 5, 7, 9 and 10, which sum to 31. Subtracting P(P + 1)/2 = 10 gives U = 21, the number of pairs won, and AUC = U / (P·N) = 21/24. One sort does the whole job, in O(n log n) time.</p>
  <p>When a fraud and a legit row get exactly the same score, no threshold can separate them, so the curve moves up and right at the same time (a diagonal segment) and the pair earns half credit. Models that output only a few distinct values, such as a shallow tree, produce many such ties:</p>
  <div class="fx" data-lang="py"># a cruder model gives only three score levels, so positives and negatives tie
import numpy as np
from sklearn.metrics import roc_auc_score
y     = np.array([1,   1,   0,   1,   0,   1,   0,   0,   0,   0  ])
score = np.array([0.9, 0.5, 0.5, 0.5, 0.5, 0.1, 0.1, 0.1, 0.1, 0.1])
pairs = [(s1 &gt; s0) + 0.5 * (s1 == s0) for s1 in score[y == 1] for s0 in score[y == 0]]
print("pair credit:", sum(pairs), "of", len(pairs), "-&gt;", np.mean(pairs), "  roc_auc_score:", roc_auc_score(y, score))</div>
  <div class="fx" data-lang="text">pair credit: 18.0 of 24 -&gt; 0.75   roc_auc_score: 0.75</div>
  <p>By hand: the fraud at 0.9 beats all 6 negatives (6). The two frauds at 0.5 each beat the four negatives at 0.1 and tie with the two negatives at 0.5, earning 2 × (4 + 1) = 10. The fraud at 0.1 ties with four negatives, earning 2. That is 18 of 24, or 0.75, as scikit-learn says.</p>
  <p>Several properties follow from the ranking definition. Only the order of the scores matters, so any increasing transformation (squaring, taking logs, calibrating) leaves AUC unchanged; that also means AUC says nothing about whether the probabilities are honest. TPR and FPR each divide by their own class size, so duplicating every negative ten times leaves the curve unchanged, which sounds like a strength but becomes a weakness in the next section. An AUC below 0.5 means the scores are informative but upside down, which in practice usually points to a label mix-up. Credit-risk teams often report the <strong>Gini coefficient</strong>, 2·AUC − 1 (0.75 here), and the <strong>KS statistic</strong>, the largest value of TPR − FPR over all thresholds (1.00 − 0.33 = 0.667 here, at t = 0.45), which is the same quantity as Youden's J used to choose thresholds in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</p>

  <h2 id="ce-prc"><span class="num">07</span>The Precision–Recall Curve and Average Precision</h2>
  <p>ROC-AUC treats a wrongly ordered pair the same whether the bank has 6 legitimate customers or 6 million. When positives are rare, the question that matters in practice is "how many false alarms do we get for each real catch?", and that is precision, which the ROC curve never shows. The <strong>precision–recall (PR) curve</strong> uses the same sliding threshold but plots precision against recall instead:</p>
  <div class="fx" data-lang="py">from ten import score, y
from sklearn.metrics import precision_recall_curve, average_precision_score, auc

print("threshold  TP  FP  precision  recall")
for t in score:
    flag = score &gt;= t
    tp, fp = int((flag &amp; (y == 1)).sum()), int((flag &amp; (y == 0)).sum())
    print(f"{t:&gt;9.2f}  {tp:&gt;2d}  {fp:&gt;2d}  {tp/(tp+fp):&gt;9.3f}  {tp/4:&gt;6.2f}")

prec, rec, thr = precision_recall_curve(y, score)
print(f"average_precision_score = {average_precision_score(y, score):.4f}")
print(f"trapezoid area under PR = {auc(rec, prec):.4f}  (a different number)")</div>
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
average_precision_score = 0.8542
trapezoid area under PR = 0.8354  (a different number)</div>
  <p>Unlike the ROC staircase, the PR curve zig-zags. Each time the threshold passes a fraud, recall rises and precision rises; each time it passes a legit row, recall stays still and precision falls. At the far right, where everything is flagged, precision equals the prevalence, 4/10 = 0.40. That is also where a random model sits at every recall, so the baseline of a PR curve is a flat line at the positive rate, not a diagonal.</p>
  <p>The usual one-number summary is <strong>average precision</strong> (AP): a weighted mean of the precision values, where each weight is how much recall increased at that step. As a formula, AP = Σ (Rₙ − Rₙ₋₁) · Pₙ. Recall only increases when the threshold passes a fraud, so on our rows there are just four terms, each with weight 1/4. Passing T1, precision is 1/1; passing T2, 2/2; passing T4, 3/4; passing T6, 4/6. So AP = 0.25 × (1 + 1 + 0.75 + 0.667) = 0.854, matching <code>average_precision_score</code>. Another way to read it: AP is the average, over the real frauds, of "the precision you would have if you stopped the list right after this fraud". The output also printed the trapezoid area under the same points, 0.835, which is a different number. Drawing straight lines between PR points is wrong, because precision does not change linearly between two thresholds, so the straight line claims performance that no threshold achieves. When people say "PR-AUC" they usually mean AP, but some libraries use trapezoids, so check.</p>
  <p>Now the comparison that matters. Take the fraud model, keep all 249 frauds in the test set, and add more and more legitimate rows, as if the business grew but fraud did not:</p>
  <div class="fx" data-lang="py">import numpy as np
from fraud import y_te, p_te
from sklearn.metrics import roc_auc_score, average_precision_score

rng = np.random.default_rng(0)
pos, neg = np.where(y_te == 1)[0], np.where(y_te == 0)[0]
for n_neg in [len(pos), 10 * len(pos), len(neg)]:     # same model, same 249 frauds, more and more legit rows
    idx = np.r_[pos, rng.choice(neg, n_neg, replace=False)]
    rate = len(pos) / len(idx)
    print(f"fraud rate {rate:5.1%}: ROC-AUC={roc_auc_score(y_te[idx], p_te[idx]):.3f}  "
          f"AP={average_precision_score(y_te[idx], p_te[idx]):.3f}  (random AP = {rate:.3f})")

flag = p_te &gt;= 0.10                                    # one fixed threshold on the full test set
tp, fp = (flag &amp; (y_te == 1)).sum(), (flag &amp; (y_te == 0)).sum()
print(f"at t=0.10: TPR={tp/len(pos):.3f}  FPR={fp/len(neg):.4f}  but {fp} false alarms vs {tp} catches: "
      f"precision={tp/(tp+fp):.3f}")</div>
  <div class="fx" data-lang="text">fraud rate 50.0%: ROC-AUC=0.826  AP=0.878  (random AP = 0.500)
fraud rate  9.1%: ROC-AUC=0.837  AP=0.677  (random AP = 0.091)
fraud rate  2.5%: ROC-AUC=0.837  AP=0.576  (random AP = 0.025)
at t=0.10: TPR=0.602  FPR=0.0250  but 244 false alarms vs 150 catches: precision=0.381</div>
  <p>ROC-AUC barely moves (0.826 to 0.837): it is a ranking measure built from per-class rates. AP falls from 0.878 to 0.576, because every extra legitimate row is another chance for a false alarm, and precision feels every one. The last line shows the same thing at a single threshold. An FPR of 2.5% sounds tiny, but 2.5% of 9,751 legitimate rows is 244 false alarms against 150 catches, so 62% of the alarms are false. The figure shows the same model on the same 10,000 test rows: the green dot is the same threshold on both plots, impressive on the ROC curve and sobering on the PR curve.</p>
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
  <p>Think of hunting for coins on a beach with a metal detector. ROC asks what share of the buried coins you find and what share of empty patches beep. PR asks how often there is a coin when you dig. On a huge beach with few coins, even a tiny beep rate on empty sand means digging a lot of empty holes. So the rule of thumb is: when positives are rare (under roughly 10%: fraud, disease, defects, search results) and you act on the flagged ones, report AP, and always next to its baseline, the positive rate. "AP 0.58" is excellent at 2.5% fraud, about 23 times random, and poor if half the rows are positive. ROC-AUC remains the better choice when classes are not too skewed, when you care about both classes, or when you compare models across datasets with different positive rates, since its random baseline is always 0.5.</p>

  <h2 id="ce-ll"><span class="num">08</span>Log Loss and the Brier Score</h2>
  <p>ROC and PR judge only the <em>order</em> of the scores. Two weather apps both said "rain" yesterday and it rained, but app A said 55% and app B said 99%. At threshold 0.5 both were right, and if they rank days the same way their AUC is the same. Yet B deserves more credit for being sure and right, and if it had not rained, B would deserve far more blame. When a probability is going to be used as a probability, for insurance pricing, expected fraud loss or a doctor's risk score, we need a metric that reads the number itself.</p>
  <p>The standard one comes from asking how likely the model thought the actual outcome was. If a row really is fraud (y = 1), the probability the model gave to what happened is p; if it is legit (y = 0), it is 1 − p. One formula covers both cases: p^y · (1 − p)^(1−y), which is the Bernoulli distribution (<a class="xref" data-note="st_probability">Probability</a>). If the rows are independent, the probability the model gave to the whole test set is the product of these numbers over all rows, called the <strong>likelihood</strong>. A good model makes what really happened look likely, so we want the likelihood to be large. Products of many numbers below 1 become too small for a computer to store, so we take the logarithm, which turns the product into a sum; we flip the sign so that smaller is better; and we divide by n so that the size of the test set does not matter. The result is <strong>log loss</strong>:</p>
  <p>Log loss = −(1/n) Σ [ yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ) ]</p>
  <p>For each row only one of the two terms is switched on, so in words log loss is <strong>minus the log of the probability you gave to the truth, averaged over rows</strong>. It is also called binary cross-entropy, and it is exactly the loss logistic regression minimises during training (<a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>). Treating our 10 scores as probabilities:</p>
  <div class="fx" data-lang="py">import numpy as np
from ten import ids, score, y
from sklearn.metrics import log_loss, brier_score_loss

p = score                                   # treat the scores as probabilities of fraud
print(" row  y     p   p(truth)  -ln(p(truth))  (p-y)²")
for i, a, q in zip(ids, y, p):
    pt = q if a == 1 else 1 - q             # probability the model gave to what really happened
    print(f"{i:&gt;4}  {a}  {q:.2f}     {pt:.2f}         {-np.log(pt):.3f}   {(q-a)**2:.4f}")
print(f"log loss = {log_loss(y, p):.4f}   Brier = {brier_score_loss(y, p):.4f}")
print(f"always 0.5: log loss = {log_loss(y, np.full(10, 0.5)):.4f}, Brier = {brier_score_loss(y, np.full(10, 0.5)):.4f}")</div>
  <div class="fx" data-lang="text"> row  y     p   p(truth)  -ln(p(truth))  (p-y)²
  T1  1  0.95     0.95         0.051   0.0025
  T2  1  0.85     0.85         0.163   0.0225
  T3  0  0.80     0.20         1.609   0.6400
  T4  1  0.70     0.70         0.357   0.0900
  T5  0  0.55     0.45         0.799   0.3025
  T6  1  0.45     0.45         0.799   0.3025
  T7  0  0.40     0.60         0.511   0.1600
  T8  0  0.30     0.70         0.357   0.0900
  T9  0  0.20     0.80         0.223   0.0400
 T10  0  0.10     0.90         0.105   0.0100
log loss = 0.4973   Brier = 0.1660
always 0.5: log loss = 0.6931, Brier = 0.2500</div>
  <p>Look at the column of −ln values. T1, a fraud given 0.95, costs only 0.051. T3, a legit row given 0.80, means the model gave only 0.20 to the truth, and it costs 1.609, a third of the whole total on its own. The sum is 4.973, so log loss = 0.497. The figure shows why one row can dominate: the cost −ln(p) is almost free near 1 but shoots towards infinity near 0, so being confidently wrong is punished far more than being unsure. A coin-flip model that always says 0.5 scores ln 2 = 0.693 on any data, which is a useful reference point.</p>
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
  <p>Here is a case where only a probability metric can see the difference. Two models rank 6 rows identically and agree at threshold 0.5, but "brash" is "calm" pushed towards 0 and 1:</p>
  <div class="fx" data-lang="py"># two models that rank 6 rows identically and agree at threshold 0.5
import numpy as np
from sklearn.metrics import accuracy_score, log_loss, brier_score_loss, roc_auc_score
y     = np.array([1,    1,    0,    0,    1,    0   ])
calm  = np.array([0.70, 0.60, 0.40, 0.30, 0.35, 0.65])
brash = 1 / (1 + np.exp(-5 * np.log(calm / (1 - calm))))     # calm pushed toward 0 and 1
print("brash =", np.round(brash, 3))
for name, p in [("calm", calm), ("brash", brash)]:
    print(f"{name:5s}: accuracy={accuracy_score(y, p &gt;= 0.5):.3f}  AUC={roc_auc_score(y, p):.3f}  "
          f"log loss={log_loss(y, p):.3f}  Brier={brier_score_loss(y, p):.3f}")</div>
  <div class="fx" data-lang="text">brash = [0.986 0.884 0.116 0.014 0.043 0.957]
calm : accuracy=0.667  AUC=0.667  log loss=0.639  Brier=0.224
brash: accuracy=0.667  AUC=0.667  log loss=1.093  Brier=0.310</div>
  <p>Accuracy and AUC are identical (0.667 each). Log loss is not: brash's two wrong rows, a fraud given 0.043 and a legit row given 0.957, each cost −ln 0.043 ≈ 3.1, which outweighs everything brash gains by being sure on the rows it got right. So log loss rises from 0.639 to 1.093. If a model ever outputs exactly 0 for a row that turns out positive, the loss is infinite; scikit-learn clips the probability to a tiny number, which still costs about 36 for that row.</p>
  <p>A gentler alternative is the <strong>Brier score</strong>: the mean squared difference between the probability and the 0/1 truth, (1/n) Σ (pᵢ − yᵢ)². From the last column of the earlier output, the squares add up to 1.66, so Brier = 0.166; always saying 0.5 gives 0.25 and a perfect, certain model gives 0. Because each row's error is at most 1, one confident mistake costs at most 1 (T3 costs 0.64), so Brier is far less harsh than log loss. It is simply the mean squared error of <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a> applied to probabilities, and it splits into a calibration part and a separation part, as shown in <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</p>
  <p>Why these two and not, say, the mean of |p − y|? Both log loss and Brier are <strong>strictly proper scoring rules</strong>: if the true chance of fraud for a row is q, your expected score is best when you report exactly p = q. Think of a betting shop that pays you according to the odds you quoted for what actually happened: quoting your honest odds is the only way to maximise your long-run payout, and bluffing 99% on everything bankrupts you the first time you are wrong. The mean absolute difference is <em>not</em> proper: if q = 0.7, the expected |p − y| is 0.7(1 − p) + 0.3p, which is smallest at p = 1, so it rewards rounding to 0 or 1. That property is why log loss is used for training, for early stopping in boosting and for comparing probabilistic models. One warning: a low log loss does not mean the model ranks well, since a model that always predicts the base rate has a decent log loss and AUC 0.5. Report a ranking metric and a probability metric together.</p>

  <h2 id="ce-multi"><span class="num">09</span>Many Classes: Macro, Micro and Weighted</h2>
  <p>So far there were two classes. Suppose investigators split the 4 frauds into two kinds, <strong>card fraud</strong> (T1, T4) and <strong>account takeover</strong> (T2, T6), and a three-class model answers for each row. It flags the same five rows as before, so nothing new is wrong; we just see the mistakes in more detail. The confusion matrix becomes 3 × 3, still with the truth on the rows and the prediction on the columns:</p>
  <div class="fx" data-lang="py"># the same 10 transactions, now with THREE classes: legit, card fraud, account takeover
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report

names  = ["legit", "card", "takeover"]
y_true = np.array([1, 2, 0, 1, 0, 2, 0, 0, 0, 0])   # T1,T4 card fraud; T2,T6 takeover
y_pred = np.array([1, 2, 1, 1, 2, 0, 0, 0, 0, 0])   # a 3-class model's answers
print(confusion_matrix(y_true, y_pred))              # rows = actual, columns = predicted
print(classification_report(y_true, y_pred, target_names=names, digits=3))</div>
  <div class="fx" data-lang="text">[[4 1 1]
 [0 2 0]
 [1 0 1]]
              precision    recall  f1-score   support

       legit      0.800     0.667     0.727         6
        card      0.667     1.000     0.800         2
    takeover      0.500     0.500     0.500         2

    accuracy                          0.700        10
   macro avg      0.656     0.722     0.676        10
weighted avg      0.713     0.700     0.696        10</div>
  <p>Accuracy is still the diagonal over the total, (4 + 2 + 1)/10 = 0.70. For the other metrics, each class is treated in turn as "the positive class" against all the rest, which is called <strong>one-vs-rest</strong>. For a class, TP is its diagonal cell, FP is the rest of its <em>column</em> (other classes predicted as it) and FN is the rest of its <em>row</em> (it predicted as others). For takeover: TP = 1, FP = 1 (T5) and FN = 1 (T6), so precision, recall and F1 are all 0.5. That is how the per-class rows of the report are built.</p>
  <p>Now there are three F1 scores, 0.727, 0.800 and 0.500, and we need a rule to combine them. There are three standard rules, and the report prints all of them. The <strong>macro</strong> average is the plain mean, (0.727 + 0.800 + 0.500)/3 = 0.676: every class counts the same, so the 2-row takeover class matters as much as the 6-row legit class. The <strong>weighted</strong> average weights each class by its <strong>support</strong>, the number of true rows in that class: (6 × 0.727 + 2 × 0.800 + 2 × 0.500)/10 = 0.696, so big classes dominate and a terrible small class can hide. The <strong>micro</strong> average pools all the counts first and computes the metric once: total TP 7, total FP 3, total FN 3, so micro precision, recall and F1 are all 7/10 = 0.70. In single-label multiclass problems every mistake is one FP for some class and one FN for another, so micro F1 always equals accuracy, which is why the report labels that row "accuracy". Picture a school with one big class and two small ones: the macro average is the average of the three class averages, the weighted average is by headcount, and micro throws every student into one pile. Use macro when rare classes matter, and always say which average you report, because a model that ignores a rare class can have weighted F1 0.95 and macro F1 0.65. Macro recall (0.722 here) has its own name: it is the multiclass balanced accuracy.</p>
  <p>Probability metrics extend naturally. A multiclass model outputs one probability per class for each row, adding up to 1. <strong>Multiclass log loss</strong> keeps its meaning: minus the mean of ln(probability given to the true class). <strong>Top-k accuracy</strong> counts a row as correct if the true class is among the k most probable. ROC-AUC has two extensions: <strong>one-vs-rest</strong> (the AUC of each class against all others, then averaged) and <strong>one-vs-one</strong> (the AUC of every pair of classes, then averaged, which is less affected by imbalance):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import log_loss, top_k_accuracy_score, roc_auc_score
# rows T1, T2, T6; columns = P(legit), P(card), P(takeover); each row sums to 1
y = np.array([1, 2, 2])
P = np.array([[0.05, 0.80, 0.15],
              [0.15, 0.25, 0.60],
              [0.55, 0.15, 0.30]])
print("multiclass log loss:", round(log_loss(y, P, labels=[0, 1, 2]), 4))   # labels=: class 0 absent from y
print("top-1:", round(top_k_accuracy_score(y, P, k=1, labels=[0, 1, 2]), 3),
      " top-2:", top_k_accuracy_score(y, P, k=2, labels=[0, 1, 2]))

from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
X, yy = make_classification(n_samples=3000, n_classes=3, n_informative=4, weights=[0.6, 0.3, 0.1], random_state=0)
Pm = LogisticRegression(max_iter=1000).fit(X[:2000], yy[:2000]).predict_proba(X[2000:])
for mc in ["ovr", "ovo"]:
    print(f"ROC-AUC multi_class={mc}: {roc_auc_score(yy[2000:], Pm, multi_class=mc):.4f}")</div>
  <div class="fx" data-lang="text">multiclass log loss: 0.646
top-1: 0.667  top-2: 1.0
ROC-AUC multi_class=ovr: 0.8492
ROC-AUC multi_class=ovo: 0.8372</div>
  <p>For the three fraud rows the true-class probabilities are 0.80, 0.60 and 0.30, so log loss = (0.223 + 0.511 + 1.204)/3 = 0.646. T6 is predicted "legit" (0.55) but its true class is the second choice (0.30), so top-1 accuracy is 2/3 and top-2 is 3/3. The <code>labels=[0, 1, 2]</code> argument is needed because these three rows contain no legit row, so scikit-learn cannot guess that the probability matrix has three columns. When a row can have several labels at once (multi-label), you compute a binary confusion matrix per label and average in the same ways.</p>

  <h2 id="ce-cost"><span class="num">10</span>Choosing a Metric by Business Cost</h2>
  <p>We now have a dozen metrics, and they can disagree. Nobody tunes a smoke alarm for accuracy: a false alarm costs a minute of irritation, a missed fire costs the house. Every metric on this page is a stand-in for some cost like that, and each stand-in carries a hidden assumption. Accuracy assumes every row is equally important; F1 assumes a false positive and a false negative cost the same and that true negatives are worth nothing. The right order of work is the reverse of what most people do: <strong>first write down what each outcome costs, then choose or build the metric that follows those costs</strong>.</p>
  <p>For the fraud team, suppose a missed fraud loses ₹500 on average and a false alarm costs ₹20 of analyst time plus an annoyed customer. A correct pass costs nothing, and the ₹20 review for a caught fraud is the same for every model that catches it, so we can leave it out. The total cost of a set of decisions is then 500 · FN + 20 · FP; on our 10 rows at t = 0.5 that is 500 × 1 + 20 × 2 = ₹540. Here are two candidate models on the same 1,000 transactions, 50 of them fraud:</p>
  <div class="fx" data-lang="py"># Two fraud models on the same 1,000 transactions (50 frauds). Which is better?
C_FN, C_FP = 500, 20                 # rupees lost per missed fraud, per false alarm
models = {"A (eager)":   dict(TP=40, FN=10, FP=60, TN=890),
          "B (careful)": dict(TP=30, FN=20, FP=5,  TN=945)}
for name, m in models.items():
    TP, FN, FP, TN = m["TP"], m["FN"], m["FP"], m["TN"]
    P, R = TP / (TP + FP), TP / (TP + FN)
    print(f"{name:12s} acc={(TP + TN) / 1000:.3f}  F1={2 * P * R / (P + R):.3f}  cost=₹{C_FN * FN + C_FP * FP:,}")</div>
  <div class="fx" data-lang="text">A (eager)    acc=0.930  F1=0.533  cost=₹6,200
B (careful)  acc=0.975  F1=0.706  cost=₹10,100</div>
  <p>Model B wins on accuracy (0.975 against 0.930) and F1 (0.706 against 0.533), yet model A costs ₹3,900 less. A misses 10 fewer frauds, saving 10 × ₹500 = ₹5,000, at the price of 55 extra reviews, 55 × ₹20 = ₹1,100. F1 weighs a miss and a false alarm equally; the business weighs them 25 to 1. Judged by F1, you would ship the more expensive model.</p>
  <p>Any function of the true and predicted labels can be turned into a scikit-learn scorer, and then cross-validation and grid search will optimise it directly. scikit-learn always <em>maximises</em> a score, so a cost is wrapped with <code>greater_is_better=False</code>, which makes the scorer return the cost negated:</p>
  <div class="fx" data-lang="py">from fraud import X_tr, y_tr
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import make_scorer, confusion_matrix
from sklearn.model_selection import cross_validate, StratifiedKFold

def rupee_cost(y_true, y_pred):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return 500 * fn + 20 * fp
cost_scorer = make_scorer(rupee_cost, greater_is_better=False)      # sklearn maximises, so it negates

cv = StratifiedKFold(5, shuffle=True, random_state=0)
for name, m in [("plain", LogisticRegression(max_iter=1000)),
                ("class_weight=balanced", LogisticRegression(max_iter=1000, class_weight="balanced"))]:
    r = cross_validate(m, X_tr, y_tr, cv=cv, scoring={"cost": cost_scorer, "f1": "f1", "acc": "accuracy"})
    print(f"{name:22s} cost/fold=₹{-r['test_cost'].mean():,.0f}  F1={r['test_f1'].mean():.3f}  acc={r['test_acc'].mean():.3f}")</div>
  <div class="fx" data-lang="text">plain                  cost/fold=₹16,208  F1=0.510  acc=0.984
class_weight=balanced  cost/fold=₹14,764  F1=0.153  acc=0.804</div>
  <p>Re-weighting the classes with <code>class_weight="balanced"</code> (see <a class="xref" data-note="ml_classification">Logistic Regression</a>) makes the model flag far more rows. That wrecks F1 (0.510 to 0.153) and accuracy (0.984 to 0.804), yet it lowers the rupee cost by about ₹1,400 per fold. Judged by F1 you would throw away the cheaper model. A third option, usually the best, is to keep the plain model and move its threshold, which is the main subject of <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</p>
  <p>When the costs cannot be priced exactly, the following guide picks a sensible stand-in:</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Primary metric</th><th>Also report</th></tr>
    <tr><td>Costs of FP and FN are known</td><td>Expected cost at the chosen threshold</td><td>Confusion matrix, AP</td></tr>
    <tr><td>Rare positives, you act on flags</td><td>AP; or precision at the recall you need</td><td>Positive rate as AP's baseline</td></tr>
    <tr><td>Balanced classes, ranking quality</td><td>ROC-AUC</td><td>Accuracy, F1</td></tr>
    <tr><td>Misses much worse than false alarms</td><td>F2, or recall at a precision floor</td><td>Precision</td></tr>
    <tr><td>False alarms much worse</td><td>F0.5, or precision at a recall floor</td><td>Recall</td></tr>
    <tr><td>Probabilities used downstream</td><td>Log loss or Brier</td><td>Reliability diagram</td></tr>
    <tr><td>Imbalanced, one symmetric number</td><td>MCC or balanced accuracy</td><td>Per-class recall</td></tr>
    <tr><td>Many classes, all matter</td><td>Macro F1 or macro recall</td><td>Per-class report</td></tr>
    <tr><td>Fixed review capacity (say 100 a day)</td><td>Precision@k: share of fraud in the top k</td><td>Recall@k</td></tr>
  </table>
  <p>Two refinements matter in real projects. When costs differ from row to row (a missed ₹100 fraud and a missed ₹10 lakh fraud are both one FN), weight each row by its amount, since most scikit-learn metrics accept <code>sample_weight</code>, or report "fraud value caught / total fraud value". And offline metrics only shortlist models: the final verdict should come from an online experiment on the real business number (<a class="xref" data-note="st_abtesting">A/B Testing</a>). Cost weights and thresholds must also be chosen on validation data, never on the test set you report.</p>

  <h2 id="ce-api"><span class="num">11</span>Computing Metrics in scikit-learn</h2>
  <p>We have computed every metric by hand. In real work the main practical question is what each scikit-learn function expects as input, because passing the wrong kind of input gives a number without any error. There are three kinds of input. "Labels" are the 0/1 output of <code>predict</code>. "Scores" are <code>predict_proba(X)[:, 1]</code> or <code>decision_function(X)</code>. "Probabilities" must come from <code>predict_proba</code>.</p>
  <table class="tbl">
    <tr><th>Function</th><th>Input</th><th>Useful arguments</th></tr>
    <tr><td><code>confusion_matrix</code></td><td>labels</td><td><code>labels=</code>, <code>normalize="true"</code></td></tr>
    <tr><td><code>accuracy_score</code>, <code>balanced_accuracy_score</code></td><td>labels</td><td></td></tr>
    <tr><td><code>precision_score</code>, <code>recall_score</code>, <code>f1_score</code>, <code>fbeta_score</code></td><td>labels</td><td><code>pos_label</code>, <code>average</code>, <code>zero_division</code></td></tr>
    <tr><td><code>classification_report</code></td><td>labels</td><td><code>target_names</code>, <code>output_dict=True</code></td></tr>
    <tr><td><code>matthews_corrcoef</code>, <code>cohen_kappa_score</code></td><td>labels</td><td></td></tr>
    <tr><td><code>roc_auc_score</code>, <code>roc_curve</code></td><td>scores</td><td><code>multi_class</code>, <code>max_fpr</code></td></tr>
    <tr><td><code>average_precision_score</code>, <code>precision_recall_curve</code></td><td>scores</td><td></td></tr>
    <tr><td><code>log_loss</code>, <code>brier_score_loss</code></td><td>probabilities</td><td>multiclass: the n × k matrix</td></tr>
  </table>
  <p>For everyday reporting, a normalised confusion matrix and <code>classification_report</code> give most of the picture at once:</p>
  <div class="fx" data-lang="py">from fraud import model, X_te, y_te
from sklearn.metrics import classification_report, confusion_matrix

pred = model.predict(X_te)                                       # predict() = predict_proba &gt;= 0.5
print(confusion_matrix(y_te, pred, normalize="true").round(3))   # each ROW sums to 1
print(classification_report(y_te, pred, target_names=["legit", "fraud"], digits=3))</div>
  <div class="fx" data-lang="text">[[0.999 0.001]
 [0.647 0.353]]
              precision    recall  f1-score   support

       legit      0.984     0.999     0.992      9751
       fraud      0.936     0.353     0.513       249

    accuracy                          0.983     10000
   macro avg      0.960     0.676     0.752     10000
weighted avg      0.983     0.983     0.980     10000</div>
  <p>With <code>normalize="true"</code> each row sums to 1, so the matrix reads as rates: 99.9% of legitimate rows were passed, and of the real frauds 64.7% were missed and 35.3% caught. The report shows precision, recall and F1 for each class, plus the macro and weighted averages; the fraud line matches what we found in section 02. When you pass a metric to <code>cross_val_score</code>, <code>cross_validate</code> or <code>GridSearchCV</code>, you use its scorer string, such as <code>"f1"</code>, <code>"roc_auc"</code>, <code>"average_precision"</code> or <code>"neg_log_loss"</code>; losses appear with a <code>neg_</code> prefix because scikit-learn always maximises.</p>
  <p>Finally, a metric computed on one test set is only an estimate. With 249 frauds, a few lucky or unlucky rows move it noticeably. The <strong>bootstrap</strong> measures that wobble: resample the test rows with replacement many times, recompute the metric each time, and read off the middle 95% of the values:</p>
  <div class="fx" data-lang="py">import numpy as np
from fraud import y_te, p_te
from sklearn.metrics import roc_auc_score, average_precision_score

rng = np.random.default_rng(0)
aucs, aps = [], []
for _ in range(500):
    i = rng.integers(0, len(y_te), len(y_te))           # resample the 10,000 test rows with replacement
    aucs.append(roc_auc_score(y_te[i], p_te[i]))
    aps.append(average_precision_score(y_te[i], p_te[i]))
for name, v, full in [("ROC-AUC", aucs, roc_auc_score(y_te, p_te)), ("AP", aps, average_precision_score(y_te, p_te))]:
    lo, hi = np.percentile(v, [2.5, 97.5])
    print(f"{name:8s} = {full:.3f}   95% interval [{lo:.3f}, {hi:.3f}]")</div>
  <div class="fx" data-lang="text">ROC-AUC  = 0.837   95% interval [0.802, 0.872]
AP       = 0.576   95% interval [0.515, 0.633]</div>
  <p>AP is 0.576, but anything from about 0.52 to 0.63 is consistent with this test set. So if a new model scores AP 0.59, that is not evidence that it is better. To compare two models fairly, bootstrap the <em>difference</em> between them on the same resampled rows, or compare their cross-validation scores (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>).</p>

  <h2 id="ce-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common coding mistake with these metrics is passing hard predictions where scores are needed. <code>roc_auc_score</code> will happily accept the 0/1 output of <code>predict</code>, but then the "curve" has only one threshold and its area equals balanced accuracy, not AUC:</p>
  <div class="fx" data-lang="py">from fraud import model, X_te, y_te
from sklearn.metrics import roc_auc_score, balanced_accuracy_score

print("AUC from hard labels :", round(roc_auc_score(y_te, model.predict(X_te)), 3),
      " (= balanced accuracy", round(balanced_accuracy_score(y_te, model.predict(X_te)), 3), ")")
print("AUC from probabilities:", round(roc_auc_score(y_te, model.predict_proba(X_te)[:, 1]), 3))</div>
  <div class="fx" data-lang="text">AUC from hard labels : 0.676  (= balanced accuracy 0.676 )
AUC from probabilities: 0.837</div>
  <p>The hard labels give 0.676, which is exactly the balanced accuracy, while the real AUC from probabilities is 0.837. Always pass <code>predict_proba(X)[:, 1]</code> or <code>decision_function(X)</code> to ranking metrics, and real probabilities to log loss.</p>
  <p>A second quiet mistake comes from label order. scikit-learn sorts the labels, and string labels sort alphabetically, so with "fraud" and "legit" the positive class comes <em>first</em> and the familiar <code>tn, fp, fn, tp = cm.ravel()</code> unpacks the wrong cells:</p>
  <div class="fx" data-lang="py">from sklearn.metrics import confusion_matrix
y_true = ["legit", "fraud", "fraud", "legit", "legit"]
y_pred = ["legit", "fraud", "legit", "fraud", "legit"]
print(confusion_matrix(y_true, y_pred))                              # sorted: "fraud" comes FIRST
print(confusion_matrix(y_true, y_pred, labels=["legit", "fraud"]))   # negative first: ravel = tn, fp, fn, tp</div>
  <div class="fx" data-lang="text">[[1 1]
 [1 2]]
[[2 1]
 [1 1]]</div>
  <p>The first matrix has "fraud" in the top row, so its first cell (1) is actually the true positives. Passing <code>labels=["legit", "fraud"]</code> puts the negative class first again, and the same applies to <code>pos_label</code> in precision and recall.</p>
  <p>The remaining mistakes are about judgement rather than code. Quoting accuracy on imbalanced data without its null accuracy makes a useless model look excellent. Comparing AP values across datasets with different positive rates is meaningless unless each is compared with its own baseline. Computing a trapezoid area under PR points gives an unjustified number; use <code>average_precision_score</code>. Saying "F1 = 0.9" for a multiclass model without naming the average hides differences that can be as large as 0.3. Assuming that a high AUC means good probabilities is wrong, because AUC ignores the values entirely. Reporting a single number without an interval invites people to treat noise as progress. And the biggest one: optimising a metric that does not match the business goal, as the F1 example in section 10 showed, where the "better" model cost ₹3,900 more.</p>

  <h2 id="ce-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Scores 0.95, 0.85, 0.80, 0.70, 0.55, 0.45, 0.40, 0.30, 0.20, 0.10 for T1–T10; frauds T1, T2, T4, T6 (P = 4, N = 6). At t = 0.5: TP 3, FP 2, FN 1, TN 4.</p>
  <h3>Definitions and values</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>10 rows</th></tr>
    <tr><td>Accuracy</td><td>(TP + TN) / n</td><td>0.70 (null accuracy 0.60)</td></tr>
    <tr><td>Recall = TPR = sensitivity</td><td>TP / (TP + FN)</td><td>0.75</td></tr>
    <tr><td>Precision = PPV</td><td>TP / (TP + FP)</td><td>0.60</td></tr>
    <tr><td>Specificity = TNR</td><td>TN / (TN + FP)</td><td>0.667</td></tr>
    <tr><td>FPR</td><td>FP / (FP + TN) = 1 − specificity</td><td>0.333</td></tr>
    <tr><td>F1</td><td>2PR/(P + R) = 2TP/(2TP + FP + FN)</td><td>0.667</td></tr>
    <tr><td>Fβ</td><td>(1 + β²)PR / (β²P + R); FN weighted β²</td><td>F2 0.714, F0.5 0.625</td></tr>
    <tr><td>Balanced accuracy</td><td>(recall + specificity) / 2</td><td>0.708</td></tr>
    <tr><td>MCC</td><td>(TP·TN − FP·FN) / √((TP+FP)(TP+FN)(TN+FP)(TN+FN))</td><td>0.408</td></tr>
    <tr><td>Cohen's κ</td><td>(p_o − p_e) / (1 − p_e)</td><td>0.40</td></tr>
    <tr><td>ROC-AUC</td><td>area under TPR vs FPR = P(s₊ &gt; s₋) + ½P(tie)</td><td>21/24 = 0.875</td></tr>
    <tr><td>Average precision</td><td>Σ (Rₙ − Rₙ₋₁) · Pₙ</td><td>0.854 (random 0.40)</td></tr>
    <tr><td>Log loss</td><td>−(1/n) Σ [y ln p + (1 − y) ln(1 − p)]</td><td>0.497 (always 0.5: 0.693)</td></tr>
    <tr><td>Brier</td><td>(1/n) Σ (p − y)²</td><td>0.166 (always 0.5: 0.25)</td></tr>
    <tr><td>Macro / weighted / micro F1</td><td>mean / support-weighted mean / pooled counts</td><td>0.676 / 0.696 / 0.700</td></tr>
    <tr><td>Cost</td><td>C_FN · FN + C_FP · FP</td><td>500·1 + 20·2 = ₹540</td></tr>
  </table>
  <h3>Which metric when</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Use when</th><th>Weakness</th></tr>
    <tr><td>Accuracy</td><td>Balanced classes, equal costs</td><td>Fooled by imbalance</td></tr>
    <tr><td>Precision / recall / Fβ</td><td>You act on flagged rows</td><td>One threshold; F1 ignores TN</td></tr>
    <tr><td>MCC / balanced accuracy</td><td>One honest number on imbalanced data</td><td>One threshold</td></tr>
    <tr><td>ROC-AUC</td><td>Ranking quality, roughly balanced data</td><td>Hides false-alarm volume; ignores calibration</td></tr>
    <tr><td>AP</td><td>Rare positives you act on</td><td>Depends on prevalence</td></tr>
    <tr><td>Log loss / Brier</td><td>Probabilities used as probabilities</td><td>Say nothing about ranking alone</td></tr>
    <tr><td>Cost</td><td>Mistakes can be priced</td><td>Needs agreed numbers</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.metrics import (confusion_matrix, classification_report, f1_score,
                             matthews_corrcoef, roc_auc_score, average_precision_score,
                             log_loss, brier_score_loss, make_scorer)
tn, fp, fn, tp = confusion_matrix(y, pred, labels=[0, 1]).ravel()
f1_score(y, pred, average="macro")          # name the average for multiclass
roc_auc_score(y, model.predict_proba(X)[:, 1])   # scores, never hard labels
average_precision_score(y, p)                # compare with y.mean()
log_loss(y, p); brier_score_loss(y, p)       # probabilities
cost = make_scorer(cost_fn, greater_is_better=False)   # for cross_validate / GridSearchCV</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Accuracy 0.975 for "always legit" when fraud is 2.5%; always quote null accuracy.</li>
    <li>sklearn matrix: actual on rows, sorted labels; <code>ravel()</code> = tn, fp, fn, tp only if the negative label sorts first.</li>
    <li>AUC from hard labels equals balanced accuracy.</li>
    <li>Adding negatives: ROC-AUC 0.83 → 0.84, AP 0.88 → 0.58.</li>
    <li>Micro F1 = accuracy in single-label multiclass; always name the average.</li>
    <li>Best F1 ≠ cheapest model; choose thresholds and weights on validation data.</li>
  </ul>

  <h2 id="ce-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a confusion matrix?</summary><div class="qa-body">A table of counts that compares the true classes (rows, in scikit-learn) with the predicted classes (columns) at one threshold. For two classes it holds TP (caught positives), FP (false alarms, Type I errors), FN (misses, Type II errors) and TN (correct passes). Every threshold metric is built from these four counts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your fraud model is 98% accurate. Is it good?</summary><div class="qa-body">You cannot tell without the class balance. If 97.5% of transactions are legit, always predicting "legit" already scores 97.5% while catching nothing. Look at the confusion matrix, recall and precision of the fraud class, AP against its baseline, and ideally the business cost at the chosen threshold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain precision and recall, and when each matters more.</summary><div class="qa-body">Recall is the share of real positives the model caught; precision is the share of flagged cases that were really positive. Recall matters when a miss is costly (cancer screening, fraud, safety); precision matters when a false alarm is costly (deleting real email, blocking a good customer). Lowering the threshold raises recall and usually lowers precision.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does F1 use the harmonic mean instead of the arithmetic mean?</summary><div class="qa-body">The harmonic mean is pulled towards the smaller value, so F1 is high only when both precision and recall are high. Precision 1.0 with recall 0.1 has an arithmetic mean of 0.55 but an F1 of 0.18. A model cannot hide a weak recall behind perfect precision.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does β control in the Fβ score?</summary><div class="qa-body">It sets how much more recall matters than precision; in counts, a false negative is weighted β² times as much as a false positive. F2 favours recall (screening, fraud), F0.5 favours precision (spam filtering), and F1 weighs them equally.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between sensitivity and specificity?</summary><div class="qa-body">Sensitivity (recall, TPR) is the share of actual positives correctly identified, TP/(TP+FN). Specificity (TNR) is the share of actual negatives correctly identified, TN/(TN+FP). 1 − specificity is the false positive rate, the x-axis of the ROC curve.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a test with 99% sensitivity and 99% specificity have low precision?</summary><div class="qa-body">Precision depends on prevalence. If only 0.1% of people are sick, the 1% false positive rate on the huge healthy group produces far more false positives than there are true positives: about 999 false against 99 true, so precision is about 0.09. This is Bayes' theorem: precision is P(sick | positive).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is MCC and why is it recommended for imbalanced data?</summary><div class="qa-body">The Matthews correlation coefficient is the Pearson correlation between true and predicted labels, (TP·TN − FP·FN)/√((TP+FP)(TP+FN)(TN+FP)(TN+FN)). It uses all four cells, is symmetric in the classes, ranges from −1 to 1, and gives 0 to a constant model, unlike accuracy. It is high only if the model does well on both classes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does an ROC-AUC of 0.8 mean in plain words?</summary><div class="qa-body">If you pick a random positive and a random negative, the positive gets the higher score 80% of the time (ties count half). It measures ranking only, so it does not depend on the threshold or on whether the probabilities are calibrated. 0.5 is random; a value below 0.5 means the scores are reversed, often a label mix-up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you draw an ROC curve by hand?</summary><div class="qa-body">Sort the rows by score from highest to lowest and start at (0, 0). For each row, step up by 1/P if it is a positive and right by 1/N if it is a negative; tied scores give a diagonal step. The area under the staircase is the AUC, which also equals the share of (positive, negative) pairs ranked correctly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you prefer PR-AUC (average precision) over ROC-AUC?</summary><div class="qa-body">When positives are rare and you act on the flagged cases. FPR divides by the huge number of negatives, so a tiny FPR can still mean more false alarms than catches; ROC-AUC hardly changes as negatives pile up while AP falls. Compare AP with its baseline, the positive rate, not with 0.5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the trapezoid area under PR points not used?</summary><div class="qa-body">Precision is a ratio of two counts that both change between thresholds, so it does not move linearly with recall; a straight line between two PR points claims performance no threshold achieves. Average precision uses a step sum, Σ(Rₙ − Rₙ₋₁)Pₙ, instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive log loss and say why it is used for training probabilistic classifiers.</summary><div class="qa-body">Each row's probability of what happened is p^y(1 − p)^(1−y). Multiplying over rows gives the likelihood; taking logs, negating and averaging gives −(1/n)Σ[y ln p + (1 − y) ln(1 − p)]. It is smooth and differentiable (accuracy is a step function with zero gradient), uses the probability rather than only the decision, and is strictly proper, so honest probabilities minimise it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Log loss vs Brier score: what is the difference?</summary><div class="qa-body">Both are strictly proper and threshold-free. Log loss charges −ln(probability given to the truth), which is unbounded, so one confident mistake can dominate. Brier is the mean squared difference between p and the 0/1 label, at most 1 per row, so it is gentler and decomposes into calibration and resolution. Always 0.5 scores 0.693 and 0.25 respectively.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two models have the same accuracy and AUC. How could one still be clearly worse?</summary><div class="qa-body">Accuracy looks at one threshold and AUC only at the order of the scores. One model can be over-confident, pushing probabilities to 0 and 1, so its wrong answers are confidently wrong. Log loss or Brier reveals this; in the example, log loss was 0.639 for the calm model and 1.093 for the over-confident one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Macro, micro and weighted averages: what is the difference?</summary><div class="qa-body">Macro takes the plain mean of the per-class scores, so every class counts equally; weighted averages by class size (support); micro pools TP, FP and FN over all classes and computes once. In single-label multiclass, micro F1 equals accuracy. Use macro when small classes matter, and always state which average you report.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A miss costs ₹500 and a false alarm ₹20. Model A has FN 10, FP 60 and F1 0.53; model B has FN 20, FP 5 and F1 0.71. Which do you ship?</summary><div class="qa-body">Model A: it costs 500·10 + 20·60 = ₹6,200 against B's 500·20 + 20·5 = ₹10,100. F1 treats both mistakes as equally costly, but the business weighs them 25 to 1. Encode the cost with <code>make_scorer(cost, greater_is_better=False)</code> so cross-validation optimises it, and then tune the threshold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you report how reliable a test-set metric is?</summary><div class="qa-body">Give an interval, usually from the bootstrap: resample the test rows with replacement many times, recompute the metric, and take the 2.5th and 97.5th percentiles. To compare two models, bootstrap the difference on the same resamples, or compare cross-validation scores. Choose thresholds and models on validation data, and report once on the test set.</div></details>
</main>
`
});
