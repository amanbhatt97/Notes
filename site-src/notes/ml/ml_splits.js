// notes/ml/ml_splits.js — Train/Val/Test & Cross-Validation
Object.assign(TOPIC_CONTENT, {
  "ml_splits": `<main>
  <h1>Train/Val/Test &amp; Cross-Validation</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Train/Val/Test &amp; Cross-Validation</span></div>
  <p class="lead">A model is only worth something on data it has never seen, yet the easiest number to compute, its score on the rows it learned from, tells you almost nothing about that. This note is about measuring a model honestly: holding some data back, giving the training, validation and test sets their separate jobs, deciding how big each should be and which rows go where, and then cross-validation, which lets a small dataset do all of these jobs at once. Every serious model comparison, every hyperparameter search and every number you report in an interview or to a manager rests on these ideas, and getting them wrong is the most common way a model that "scored 99%" fails in production. The running example is the same one as in <a class="xref" data-note="ml_intro">What is Machine Learning</a>: <strong>ten flats in Pune</strong>, whose price we predict from their area. Each splitting scheme is worked out on those ten flats first, where every number can be checked by hand, and then shown at a realistic scale.</p>

  <h2 id="ms-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Honest Evaluation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why hold out</div>
        <ul>
          <li>Training scores reward memorising</li>
          <li>Lookup table: train MAE 0, held-out 17.0</li>
          <li><b>Train</b> fits, <b>validation</b> chooses, <b>test</b> reports once</li>
          <li>Choosing on a set makes its score optimistic (selection bias)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Which rows</div>
        <ul>
          <li><b>Stratified</b>: same class mix in every part</li>
          <li><b>Group</b>: one entity on one side only</li>
          <li><b>Time</b>: train on the past, test on the future</li>
          <li>Size by counts: SE = √(p(1−p)/n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cross-validation</div>
        <ul>
          <li><b>k-fold</b>: every row validates once; report the mean</li>
          <li><b>LOO</b>: k = n; one-fit shortcut eᵢ/(1−hᵢᵢ) for linear models</li>
          <li><b>Repeated</b>: average away the shuffle luck</li>
          <li><b>Time-series CV</b>: expanding or sliding window, gap</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tuning honestly</div>
        <ul>
          <li><code>best_score_</code> is optimistic</li>
          <li><b>Nested CV</b>: outer loop scores the whole tuning</li>
          <li>Default k = 5 or 10; bigger k, less pessimism</li>
          <li><code>cv=5</code> never shuffles</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ms-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Hold Out Data</span><span class="rm-sub">why a training score lies</span></div></div>
      <div class="rm-item rm-done" data-target="ms-roles"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Train, Validation and Test Sets</span><span class="rm-sub">fit, choose, report: three separate jobs</span></div></div>
      <div class="rm-item rm-done" data-target="ms-ratio"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">How Big Each Part Should Be</span><span class="rm-sub">how noisy a score from n rows is</span></div></div>
      <div class="rm-item rm-done" data-target="ms-kfold"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">k-Fold Cross-Validation</span><span class="rm-sub">every row gets a turn at being held out</span></div></div>
      <div class="rm-item rm-done" data-target="ms-loo"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Leave-One-Out CV</span><span class="rm-sub">k = n, and its one-fit shortcut</span></div></div>
      <div class="rm-item rm-done" data-target="ms-strat"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Stratified Splits</span><span class="rm-sub">keeping the class mix right</span></div></div>
      <div class="rm-item rm-done" data-target="ms-group"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Group Splits</span><span class="rm-sub">when rows belong to the same entity</span></div></div>
      <div class="rm-item rm-done" data-target="ms-time"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Time-Based Splits</span><span class="rm-sub">never train on the future</span></div></div>
      <div class="rm-item rm-done" data-target="ms-nested"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Nested Cross-Validation</span><span class="rm-sub">an honest score after tuning</span></div></div>
      <div class="rm-item rm-done" data-target="ms-choosek"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How Reliable a CV Score Is</span><span class="rm-sub">bias, noise, repeats, choosing k</span></div></div>
      <div class="rm-item rm-done" data-target="ms-api"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">The scikit-learn Toolbox</span><span class="rm-sub">splitters, cross_validate, defaults that bite</span></div></div>
      <div class="rm-item rm-done" data-target="ms-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the leaks that inflate scores</span></div></div>
      <div class="rm-item rm-done" data-target="ms-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, which scheme when</span></div></div>
      <div class="rm-item rm-done" data-target="ms-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on validation</span></div></div>
    </div>
  </div>

  <h2 id="ms-why"><span class="num">01</span>Why Hold Out Data</h2>
  <p>In the previous note we fitted the line price = 6 × area + 10 to ten flats and found its mean squared error was 4.6. That number was measured on the very flats the line was fitted to. The portal does not care how well the line prices flats that are already sold; it cares about the next flat. So the question is whether a low error on the training rows says anything about new rows. Here are the ten flats again (area x in hundreds of sq ft, price y in ₹ lakh; the other rows of the table are used later in the note):</p>
  <table class="tbl"><caption>Ten flats sold in Pune</caption>
    <tr><th>Flat</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th></tr>
    <tr><td>Area x</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td></tr>
    <tr><td>Price y</td><td>38</td><td>49</td><td>53</td><td>56</td><td>67</td><td>68</td><td>73</td><td>83</td><td>87</td><td>96</td></tr>
    <tr><td>Locality</td><td>Hadapsar</td><td>Baner</td><td>Kothrud</td><td>Hadapsar</td><td>Baner</td><td>Kothrud</td><td>Hadapsar</td><td>Baner</td><td>Kothrud</td><td>Baner</td></tr>
    <tr><td>Listed</td><td>Mar</td><td>Jan</td><td>May</td><td>Feb</td><td>Aug</td><td>Apr</td><td>Jun</td><td>Sep</td><td>Jul</td><td>Oct</td></tr>
    <tr><td>Sold within 30 days?</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td></tr>
  </table>
  <p>To see the problem, compare two models. The first is the laziest model imaginable, a <strong>lookup table</strong>: it stores every training flat with its price, returns the stored price for any area it has seen before, and returns the average training price for anything new. The second is the straight line. Train both on eight flats and keep two flats, C and I, out of training altogether so we can see how each does on flats it never saw. We score with <strong>MAE</strong>, the mean absolute error, which is simply the average size of the miss in lakh.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

names = np.array(list("ABCDEFGHIJ"))
area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
held = np.isin(names, ["C", "I"])                              # two flats held back
tr_a, tr_p, te_a, te_p = area[~held], price[~held], area[held], price[held]

table = dict(zip(tr_a, tr_p))                                  # model 1: a lookup table
def lookup(a):
    return np.array([table.get(v, tr_p.mean()) for v in a])    # unseen area -&gt; average price
line = LinearRegression().fit(tr_a.reshape(-1, 1), tr_p)       # model 2: a straight line

for name, f in [("lookup table", lookup), ("line", lambda a: line.predict(a.reshape(-1, 1)))]:
    print(f"{name:12s} train MAE {np.abs(tr_p - f(tr_a)).mean():5.2f}   "
          f"held-out MAE {np.abs(te_p - f(te_a)).mean():5.2f}   predictions for C, I: {f(te_a).round(2)}")</div>
  <div class="fx" data-lang="text">lookup table train MAE  0.00   held-out MAE 17.00   predictions for C, I: [66.25 66.25]
line         train MAE  2.17   held-out MAE  1.28   predictions for C, I: [51.78 88.34]</div>
  <p>On its eight training flats the lookup table is perfect, MAE 0.00, and beats the line's 2.17. On the two held-back flats the picture flips: the lookup table has never seen areas 7 and 13, so it guesses the average, 66.25, for both and misses by 17.0 lakh on average, while the line predicts 51.78 and 88.34 against true prices of 53 and 87, an MAE of 1.28. The pattern "bigger flat, higher price" was sitting in the data, but the lookup table never learned it; it only remembered. If you had chosen by training error, you would have shipped the useless model.</p>
  <p>Think of a student preparing for an exam with last year's question paper. She practises it until she scores 100 out of 100. Does that prove she knows the subject? Not at all; she may simply remember those exact questions. The only fair check is a paper she has never seen. A model has the same problem, only worse, because a flexible model can store its training rows perfectly. The rows we keep out of training are that unseen paper, and they are called a <strong>hold-out set</strong>.</p>
  <p>The same thing happens with real models at a realistic scale. A decision tree with no limits keeps splitting the data into smaller and smaller groups until every group is pure, so it can always reach 100% accuracy on its training rows. Below, one is trained on 1,000 rows of a genuine but noisy task, and then on the same rows with labels that are pure coin flips, where there is nothing to learn at all.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = make_classification(n_samples=1000, n_features=10, n_informative=4, flip_y=0.2, random_state=0)
y_random = np.random.default_rng(0).integers(0, 2, size=1000)        # labels unrelated to X

for name, labels in [("real labels  ", y), ("random labels", y_random)]:
    X_tr, X_te, y_tr, y_te = train_test_split(X, labels, test_size=0.3, random_state=0)
    tree = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr)    # no depth limit
    print(f"{name}  leaves={tree.get_n_leaves()}  train acc={tree.score(X_tr, y_tr):.3f}  "
          f"test acc={tree.score(X_te, y_te):.3f}")</div>
  <div class="fx" data-lang="text">real labels    leaves=109  train acc=1.000  test acc=0.730
random labels  leaves=152  train acc=1.000  test acc=0.497</div>
  <p>On the real task the tree scores 1.000 on its training rows and 0.730 on rows held back: it learned something real, plus 109 leaves' worth of noise. On random labels it <em>still</em> scores a perfect 1.000 in training, using 152 leaves to memorise the coin flips, while its held-out accuracy is 0.497, no better than guessing. The training score could not tell "learned something" from "learned nothing"; only the held-out rows could.</p>
  <p>This gives us two kinds of error. <strong>Training error</strong> is the average loss on the rows used to fit the model. <strong>Generalisation error</strong> (also called test error or out-of-sample error) is the average loss we would get on new rows from the same source, which is what we actually care about. We can never compute it exactly, because we do not have all future rows, but we can <em>estimate</em> it using rows the model did not see. Training error is an optimistic estimate of it. A hold-out error is a fair one, on one strict condition that the next section is about: the held-out rows must play no part in <em>any</em> decision about the model.</p>

  <h2 id="ms-roles"><span class="num">02</span>Train, Validation and Test Sets</h2>
  <p>One hold-out set is enough to score one fixed model. But in practice we never have just one model; we try several candidates and keep the best, and we try several values of each hyperparameter (the settings you choose before training, like k in k-nearest-neighbours). If the same held-out flats are used to pick the winner and then to report the winner's score, is that score still honest? It is not, and the reason is worth understanding.</p>
  <p>The standard answer is to divide the data into three parts with three different jobs. The <strong>training set</strong> is used to fit each candidate's parameters. The <strong>validation set</strong> (sometimes called the dev set) is used to compare candidates and choose hyperparameters, and it is looked at many times. The <strong>test set</strong> is locked away and used exactly once, at the very end, to report the final score. School gives a good picture of this: textbook exercises are the training set, the mock exams you use to decide how to study are the validation set, and the board exam is the test set. If you see the board paper early, your marks stop measuring what you know.</p>
    <figure class="viz"><svg viewBox="0 0 560 120" width="560">
<rect x="20" y="30" width="364" height="36" class="fb sb"/><text x="202" y="53" text-anchor="middle">Train 70%</text>
<rect x="384" y="30" width="78" height="36" class="ft st"/><text x="423" y="53" text-anchor="middle">Val 15%</text>
<rect x="462" y="30" width="78" height="36" class="fr sr"/><text x="501" y="53" text-anchor="middle">Test 15%</text>
<text x="202" y="86" text-anchor="middle" class="tm">fit parameters</text><text x="423" y="86" text-anchor="middle" class="tm">choose, many times</text><text x="501" y="86" text-anchor="middle" class="tm">report, once</text>
<text x="20" y="18" class="tm">one dataset, three jobs</text>
<text x="20" y="110" class="tm">after choosing: refit on train + val, then score on test</text>
</svg><figcaption>Three sets with three jobs. The test set plays the role of the future, so no decision may depend on it.</figcaption></figure>
  <p>Let us do it by hand on the ten flats. Lock C and I away as the test set. Of the remaining eight, use D and H as the validation set and train on A, B, E, F, G and J. Three candidates compete: a line through the origin (the hyperparameter <code>fit_intercept=False</code>, so no starting price), a line with an intercept, and the 1-nearest-neighbour model, which copies the price of the closest training flat. For 1-NN by hand, D (area 8) is closest to E (area 9, ₹67 lakh), a miss of 56 − 67 = −11, and H (area 12) is closest to G (area 11, ₹73 lakh), a miss of 10, so its validation MAE is 10.5.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor

names = np.array(list("ABCDEFGHIJ"))
X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
test  = np.isin(names, ["C", "I"])        # locked away
val   = np.isin(names, ["D", "H"])        # used to CHOOSE
train = ~test &amp; ~val                      # A, B, E, F, G, J: used to FIT

candidates = {"line, no intercept":  LinearRegression(fit_intercept=False),
              "line with intercept": LinearRegression(fit_intercept=True),
              "1-nearest neighbour": KNeighborsRegressor(n_neighbors=1)}
val_mae = {}
for name, m in candidates.items():
    m.fit(X[train], y[train])
    val_mae[name] = np.abs(y[val] - m.predict(X[val])).mean()
    print(f"{name:20s} train MAE {np.abs(y[train] - m.predict(X[train])).mean():5.2f}   val MAE {val_mae[name]:5.2f}")

best = min(val_mae, key=val_mae.get)
final = candidates[best].fit(X[~test], y[~test])          # refit on train + validation
print("chosen:", best, "  test MAE", np.abs(y[test] - final.predict(X[test])).mean().round(2))</div>
  <div class="fx" data-lang="text">line, no intercept   train MAE  3.67   val MAE  0.52
line with intercept  train MAE  2.49   val MAE  1.47
1-nearest neighbour  train MAE  0.00   val MAE 10.50
chosen: line, no intercept   test MAE 3.96</div>
  <p>The validation set did its job mechanically. It ruled out the memoriser, which is perfect on its training flats (0.00) but misses by 10.50 on validation, and it picked the line <em>without</em> an intercept, 0.52 against 1.47. The winner is then refitted on all eight non-test flats, and scored once on C and I: test MAE 3.96. But the line with an intercept would have scored 1.28 on those same test flats, as we saw in section 01, so the validation set chose wrongly. Nothing leaked; two validation flats were simply too few, and D and H happen to sit almost exactly on a line through the origin.</p>
  <p>Look also at the gap between the winner's validation score (0.52) and its test score (3.96). This is <strong>selection bias</strong>: every score measured on a finite set contains some luck, and when you compare several candidates on the same set and keep the best, you keep the one that was good <em>plus</em> the one that got the luckiest draw. The winner's validation score is therefore too high (here, its error too low). A test set that played no part in picking gives a fair score of the winner. An extreme case makes this impossible to miss: fifty "models" that guess at random, each with a true accuracy of exactly 0.5.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(1)
y_val, y_test = rng.integers(0, 2, 200), rng.integers(0, 2, 2000)    # 200 validation, 2,000 test rows

val_acc, test_acc = [], []
for m in range(50):                       # 50 "models" that guess at random: true accuracy 0.5
    val_acc.append((rng.integers(0, 2, 200) == y_val).mean())
    test_acc.append((rng.integers(0, 2, 2000) == y_test).mean())
best = int(np.argmax(val_acc))
print("average validation accuracy of all 50:", round(np.mean(val_acc), 3))
print("best model's validation accuracy:     ", val_acc[best])
print("the same model on the test set:       ", test_acc[best])</div>
  <div class="fx" data-lang="text">average validation accuracy of all 50: 0.494
best model's validation accuracy:      0.585
the same model on the test set:        0.487</div>
  <p>Averaged over all fifty, validation accuracy is 0.494, close to the truth. But the best of the fifty scored 0.585 on validation, which looks like a real, if weak, model. On the test set it scores 0.487: it was pure luck. With real models the effect is smaller, but it always points the same way, it grows with the number of candidates you compare, and it shrinks as the validation set gets bigger. Here is the full workflow at a realistic scale, a 70/15/15 split of a dataset of 569 tumours, choosing k for k-nearest-neighbours on the validation part.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_breast_cancer(return_X_y=True)
X_rest, X_test, y_rest, y_test = train_test_split(X, y, test_size=0.15, stratify=y, random_state=42)
X_tr, X_val, y_tr, y_val = train_test_split(X_rest, y_rest, test_size=0.15 / 0.85,
                                            stratify=y_rest, random_state=42)
print("rows in train / val / test:", len(X_tr), len(X_val), len(X_test))

for k in [1, 5, 15, 51]:                                  # choose k on VALIDATION
    m = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k)).fit(X_tr, y_tr)
    print(f"k={k:2d}  train acc {m.score(X_tr, y_tr):.3f}  val acc {m.score(X_val, y_val):.3f}")

final = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5)).fit(X_rest, y_rest)
print("final model, refit on train + val, test acc:", round(final.score(X_test, y_test), 3))</div>
  <div class="fx" data-lang="text">rows in train / val / test: 397 86 86
k= 1  train acc 1.000  val acc 0.965
k= 5  train acc 0.975  val acc 0.977
k=15  train acc 0.967  val acc 0.977
k=51  train acc 0.942  val acc 0.965
final model, refit on train + val, test acc: 0.965</div>
  <p>Two calls to <code>train_test_split</code> do the splitting: the first locks 15% away as the test set, and the second cuts the rest into training and validation. The second <code>test_size</code> is 0.15 / 0.85 because it is a share of the remaining 85%, and 0.15 / 0.85 of 85% is 15% of the original; the result is 397, 86 and 86 rows. k = 1 is perfect on its training rows (1.000), because each row is its own nearest neighbour, but it is not the best on validation. k = 5 and k = 15 tie at 0.977; with 86 validation rows, a single row is worth 1.2 points, so the set cannot separate them, and we take the smaller k. Once the choice is made the validation rows have done their job, so the chosen model is refitted on training plus validation (483 rows) to learn from as much data as possible, and only then scored on the test set: 0.965. Many teams refit once more on all the data for the production model; the test score then describes a model trained on slightly less data, which is a safe, slightly pessimistic estimate.</p>
  <p>The rule this section builds up to is simple to state and easy to break: once a decision has been made by looking at a set, that set can no longer give an honest score. On our flats it is tempting to see the test MAE of 3.96, switch to the intercept line and report 1.28. But the test set has then been used to choose, so it has become a second validation set and carries the same selection bias. If you must keep iterating after seeing the test score, get a fresh test set, or at least say that the number is no longer clean.</p>

  <h2 id="ms-ratio"><span class="num">03</span>How Big Each Part Should Be</h2>
  <p>Two validation flats misled us. Every row we hold out is a row the model cannot learn from, yet too few held-out rows give a score that is mostly luck. So how noisy is a score measured on n rows, and how should a dataset be divided? Start with the flats. Ten flats can be split into eight training flats and two test flats in 45 different ways (that is "10 choose 2"). Fit the line on each eight and score it on the two. The model family and the data are identical every time; only the luck of which two flats were held back changes.</p>
  <div class="fx" data-lang="py">import numpy as np
from itertools import combinations
from sklearn.linear_model import LinearRegression

X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
names = "ABCDEFGHIJ"

scores = {}
for a, b in combinations(range(10), 2):                  # every possible 2-flat test set
    tr = [i for i in range(10) if i not in (a, b)]
    m = LinearRegression().fit(X[tr], y[tr])
    scores[names[a] + names[b]] = np.abs(y[[a, b]] - m.predict(X[[a, b]])).mean()
v = np.array(list(scores.values()))
print(f"{len(v)} test sets: test MAE min {v.min():.2f}  max {v.max():.2f}  mean {v.mean():.2f}")
print("luckiest:", min(scores, key=scores.get), "  unluckiest:", max(scores, key=scores.get),
      "  ours (CI):", round(scores["CI"], 2))</div>
  <div class="fx" data-lang="text">45 test sets: test MAE min 1.01  max 4.30  mean 2.51
luckiest: HI   unluckiest: BE   ours (CI): 1.28</div>
  <p>The same line on the same data reports a test MAE anywhere from 1.01 (when H and I are held back) to 4.30 (when B and E are held back, the two flats that sold about ₹3 lakh above the line). The average over all 45 is 2.51, and our C-and-I split from section 01 was on the lucky side at 1.28. A score from two rows is mostly luck.</p>
  <p>For accuracy there is a formula that tells you how much luck to expect. Think of each test row as a coin that lands "correct" with probability p, the model's true accuracy. The measured accuracy is the average of n such coins, and statistics tells us its typical wobble, the <strong>standard error</strong> (SE), is √(p(1 − p) / n). Roughly 95% of the time the measured value falls within 1.96 standard errors of the true one. For an average error such as MAE the same law holds, with the spread of the per-row errors in place of √(p(1 − p)): the SE is that spread divided by √n. Take a model whose true accuracy is 0.90 and simulate 2,000 different test sets of each size:</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
p = 0.90                                          # the model's true accuracy
for n in [50, 100, 1000, 10000]:
    se = np.sqrt(p * (1 - p) / n)                 # formula
    measured = rng.binomial(n, p, size=2000) / n  # 2,000 different test sets of n rows
    print(f"n={n:5d}  formula SE={se:.4f}  simulated SD={measured.std():.4f}  "
          f"95% range {p - 1.96 * se:.3f} .. {p + 1.96 * se:.3f}")</div>
  <div class="fx" data-lang="text">n=   50  formula SE=0.0424  simulated SD=0.0428  95% range 0.817 .. 0.983
n=  100  formula SE=0.0300  simulated SD=0.0296  95% range 0.841 .. 0.959
n= 1000  formula SE=0.0095  simulated SD=0.0096  95% range 0.881 .. 0.919
n=10000  formula SE=0.0030  simulated SD=0.0030  95% range 0.894 .. 0.906</div>
  <p>The formula and the simulation agree to the third decimal place. With 50 test rows, a 90%-accurate model can measure anywhere from about 82% to 98%; with 100 rows, from 84% to 96%, so two models two points apart cannot be told apart. Notice the square root: to halve the noise you need four times as many test rows. That is why the useful way to think about split sizes is in <em>counts</em>, not percentages. What matters for the precision of a score is how many rows, and especially how many rows of the rare class, are in the evaluation set. Twenty percent of ten flats is two flats, and two flats cannot measure anything.</p>
  <p>This gives the usual rules of thumb. For a tiny dataset like our ten flats, do not set aside a fixed validation set at all; use cross-validation, the next section. Under about a thousand rows, keep a test set of around 20% and use cross-validation on the rest instead of a fixed validation set. Between a thousand and a hundred thousand rows, the classic 60/20/20 or 70/15/15 splits work well. With millions of rows, 98/1/1 is normal, because 10,000 test rows already give a standard error of about 0.003 and the rest is better spent on training. And when the positive class is rare, such as fraud at 0.1%, size the test set by the positives: recall measured on twelve frauds is almost pure noise, so aim for hundreds.</p>

  <h2 id="ms-kfold"><span class="num">04</span>k-Fold Cross-Validation</h2>
  <p>A single split has two weaknesses, and with ten flats both are severe. It wastes data, because the held-out flats never help train the model, and it depends on luck, as the 45 splits showed with MAEs from 1.01 to 4.30. <strong>Cross-validation</strong> (CV) fixes both by giving every row a turn at being held out. In <strong>k-fold cross-validation</strong>, you cut the data into k equal parts called <strong>folds</strong>. You train on k − 1 folds and score on the one left out, then repeat k times so that each fold is left out exactly once. That gives k scores, and you report their mean (the CV estimate) and their spread. Every row is used for validation once and for training k − 1 times.</p>
  <p>Judging a batsman on a single match is mostly luck: the pitch, the bowlers, the weather. Judging him over five matches against five different teams is much fairer. Each fold is one match, and every team gets to bowl once.</p>
    <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="20" y="16" class="tm">5-fold CV: green = validation fold, blue = training folds</text>
<rect x="20" y="26" width="400" height="18" class="fb sb"/><rect x="20" y="26" width="80" height="18" class="fg sg"/>
<rect x="20" y="50" width="400" height="18" class="fb sb"/><rect x="100" y="50" width="80" height="18" class="fg sg"/>
<rect x="20" y="74" width="400" height="18" class="fb sb"/><rect x="180" y="74" width="80" height="18" class="fg sg"/>
<rect x="20" y="98" width="400" height="18" class="fb sb"/><rect x="260" y="98" width="80" height="18" class="fg sg"/>
<rect x="20" y="122" width="400" height="18" class="fb sb"/><rect x="340" y="122" width="80" height="18" class="fg sg"/>
<g font-size="12"><text x="430" y="40">fold 1 → score₁</text><text x="430" y="64">fold 2 → score₂</text><text x="430" y="88">fold 3 → score₃</text><text x="430" y="112">fold 4 → score₄</text><text x="430" y="136">fold 5 → score₅</text></g>
</svg><figcaption>Each row of bars is one model. Five models, five scores; the CV estimate is their mean.</figcaption></figure>
  <p>The figure shows 5-fold CV as five rows, each one a separate model: green is the fold being validated and blue the folds it trains on. To keep the arithmetic exact, start with the simplest possible model, the baseline that always predicts the average training price. "Training" it just means computing one average. The ten prices add up to 670. Without shuffling, the five folds are {A, B}, {C, D}, {E, F}, {G, H} and {I, J}, and for each fold the training average is (670 − the two held-out prices) / 8.</p>
  <table class="tbl"><caption>5-fold CV of the average-price predictor, by hand</caption>
    <tr><th>Fold</th><th>Held-out prices</th><th>Training average</th><th>Misses</th><th>Fold MAE</th></tr>
    <tr><td>1 (A, B)</td><td>38, 49</td><td>(670 − 87) / 8 = 72.875</td><td>34.875, 23.875</td><td>29.375</td></tr>
    <tr><td>2 (C, D)</td><td>53, 56</td><td>(670 − 109) / 8 = 70.125</td><td>17.125, 14.125</td><td>15.625</td></tr>
    <tr><td>3 (E, F)</td><td>67, 68</td><td>(670 − 135) / 8 = 66.875</td><td>0.125, 1.125</td><td>0.625</td></tr>
    <tr><td>4 (G, H)</td><td>73, 83</td><td>(670 − 156) / 8 = 64.25</td><td>8.75, 18.75</td><td>13.75</td></tr>
    <tr><td>5 (I, J)</td><td>87, 96</td><td>(670 − 183) / 8 = 60.875</td><td>26.125, 35.125</td><td>30.625</td></tr>
  </table>
  <p>The CV estimate is the mean of the five fold scores, (29.375 + 15.625 + 0.625 + 13.75 + 30.625) / 5 = 90 / 5 = <strong>18.0</strong>. Their spread (standard deviation) is about 11.1, so we would report "MAE 18.0 ± 11.1 over 5 folds". The fold scores range from 0.625, for the two middle flats that any average predicts well, to 30.6, which shows again how much a single validation split could have misled us. Now the same in code, with the line alongside the baseline:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import KFold, cross_val_score
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression

X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])

for i, (tr, va) in enumerate(KFold(n_splits=5).split(X), 1):
    m = y[tr].mean()                                     # "training" the mean predictor
    print(f"fold {i}: validate {y[va].tolist()}  training mean {m:.3f}  MAE {np.abs(y[va] - m).mean():.3f}")

for name, model in [("mean predictor", DummyRegressor(strategy="mean")), ("line", LinearRegression())]:
    s = -cross_val_score(model, X, y, cv=KFold(5), scoring="neg_mean_absolute_error")
    print(f"{name:14s} fold MAEs {s.round(3)}  mean {s.mean():.3f}  std {s.std():.3f}")</div>
  <div class="fx" data-lang="text">fold 1: validate [38, 49]  training mean 72.875  MAE 29.375
fold 2: validate [53, 56]  training mean 70.125  MAE 15.625
fold 3: validate [67, 68]  training mean 66.875  MAE 0.625
fold 4: validate [73, 83]  training mean 64.250  MAE 13.750
fold 5: validate [87, 96]  training mean 60.875  MAE 30.625
mean predictor fold MAEs [29.375 15.625  0.625 13.75  30.625]  mean 18.000  std 11.085
line           fold MAEs [2.47  1.493 2.515 1.979 1.577]  mean 2.007  std 0.430</div>
  <p>The loop reproduces the hand table line by line. <code>cross_val_score</code> then does the whole procedure in one call: it gives the same five scores for the baseline (mean 18.000, standard deviation 11.085) and 2.007 ± 0.430 for the line, which is nine times better and much steadier from fold to fold. Two scikit-learn details matter. Scores are always arranged so that higher is better, so an error like MAE comes back as <code>neg_mean_absolute_error</code>, a negative number, and we flip its sign. And NumPy's <code>std</code> divides by k, matching the hand calculation.</p>
  <p>It is worth being precise about what this number estimates. Each fold trains a different model on 8 of the 10 flats; the five fitted lines all differ slightly. So the CV mean is not the error of any one fitted model. It estimates the expected error of the <em>procedure</em> "fit a line on about eight flats from this source". That is why, after cross-validation, you refit on all the data to get the final model (price = 6 × area + 10); its error should be a little lower than the CV estimate, because it learned from more rows. The cost is that CV needs k fits instead of one: for a model that takes an hour to train, 10-fold CV takes ten hours, so for very large data and slow models a single big validation set is the normal choice, and with enough rows its noise is small anyway.</p>

  <h2 id="ms-loo"><span class="num">05</span>Leave-One-Out CV</h2>
  <p>With k = 5 each fold model trains on 8 of the 10 flats, a little less than the final model's 10, which makes CV slightly pessimistic. Taking k as large as possible, k = n, gives <strong>leave-one-out cross-validation</strong> (LOOCV): train on n − 1 rows, predict the single row left out, and repeat n times, once per row. Each model trains on 9 of the 10 flats, almost as many as the final model.</p>
  <p>For the average-price predictor, LOO can be done in your head. Leaving out flat i, the training average is (670 − yᵢ) / 9, so the miss on flat i is yᵢ − (670 − yᵢ) / 9 = (10/9)(yᵢ − 67), where 67 is the average of all ten. The distances |yᵢ − 67| are 29, 18, 14, 11, 0, 1, 6, 16, 20, 29, which add up to 144, so the LOOCV MAE is (10/9) × 144 / 10 = 16.0. That is lower than 5-fold's 18.0, as expected: an average of nine flats is a slightly better predictor than an average of eight.</p>
  <p>Ten fits are cheap here, but n fits can be very expensive for a large dataset. For ordinary least-squares regression there is an exact shortcut, so LOOCV costs one fit instead of n. Fit once on all rows and record each residual eᵢ (actual minus fitted). Each row also has a <strong>leverage</strong> hᵢᵢ, a number between 0 and 1 that measures how strongly that row pulls the fitted line towards itself; rows at the extremes of x pull hardest. The leave-one-out residual is then exactly eᵢ / (1 − hᵢᵢ). The intuition: when a high-leverage row is removed, the line moves a lot, so its error on that row grows a lot. For one feature with an intercept, hᵢᵢ = 1/n + (xᵢ − x̄)² / Σ(x − x̄)². For flat A, at the edge (x = 5), that is 0.1 + 4.5² / 82.5 = 0.3455, so its residual of −2 grows to −2 / 0.6545 = −3.06. Flat E, in the middle (x = 9), has h = 0.103, so its residual of 3 only grows to 3.34.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneOut, cross_val_predict

x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
X = x.reshape(-1, 1)

slow = y - cross_val_predict(LinearRegression(), X, y, cv=LeaveOneOut())   # 10 separate fits

resid = y - LinearRegression().fit(X, y).predict(X)                        # ONE fit
h = 1 / 10 + (x - x.mean()) ** 2 / ((x - x.mean()) ** 2).sum()            # leverage of each flat
fast = resid / (1 - h)

print("residuals e_i      :", resid.round(2))
print("leverage h_ii      :", h.round(4))
print("LOO, 10 fits       :", slow.round(2))
print("e_i / (1 - h_ii)   :", fast.round(2))
print("LOOCV MSE:", round(np.mean(slow ** 2), 3), "  training MSE:", round(np.mean(resid ** 2), 3))</div>
  <div class="fx" data-lang="text">residuals e_i      : [-2.  3.  1. -2.  3. -2. -3.  1. -1.  2.]
leverage h_ii      : [0.3455 0.2485 0.1758 0.1273 0.103  0.103  0.1273 0.1758 0.2485 0.3455]
LOO, 10 fits       : [-3.06  3.99  1.21 -2.29  3.34 -2.23 -3.44  1.21 -1.33  3.06]
e_i / (1 - h_ii)   : [-3.06  3.99  1.21 -2.29  3.34 -2.23 -3.44  1.21 -1.33  3.06]
LOOCV MSE: 7.255   training MSE: 4.6</div>
  <p>The leverages match the hand values (0.3455 at the two ends, 0.103 in the middle), and the leave-one-out residuals from ten separate fits are identical to eᵢ / (1 − hᵢᵢ) from a single fit. The LOOCV MSE is about 7.25, against a training MSE of 4.6: the honest error is about 58% higher than the error on the flats the line was fitted to. The same idea gives fast LOOCV for ridge regression (scikit-learn's <code>RidgeCV</code> uses it by default) and lies behind Cook's distance in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</p>
  <p>LOOCV has real advantages: it has almost no pessimistic bias, it involves no randomness (there is only one way to leave out each row, so the result is the same every run), and it suits tiny datasets like ours. It also has real drawbacks. Without a shortcut it costs n fits. Because each fold contains a single row, metrics that need many rows at once, such as recall or AUC, cannot be computed per fold; you have to collect all n predictions and compute the metric once. And because the n training sets are nearly identical, the n models are highly correlated, which for unstable models such as deep decision trees can make the LOO estimate noisier than 5- or 10-fold CV. Section 10 comes back to this.</p>

  <h2 id="ms-strat"><span class="num">06</span>Stratified Splits</h2>
  <p>So far we have asked how many rows to hold out. A held-out set of the right size can still have the wrong <em>mix</em>. Suppose the portal wants to predict whether a flat sells within 30 days. Four of our ten flats did (A, D, F and G), so 40% are "fast sellers". A random 20% test set is two flats, chosen with no regard to labels. The chance that both come from the six slow sellers is the number of ways to pick two slow sellers divided by the number of ways to pick any two: C(6, 2) / C(10, 2) = 15 / 45 = 0.333. One random split in three has no fast seller in its test set at all, so the model's ability to spot fast sellers cannot even be measured.</p>
  <p>A <strong>stratified split</strong> fixes this by splitting each class separately, in the same proportion. Twenty percent of the four fast sellers is 0.8, which rounds to one; twenty percent of the six slow sellers is 1.2, which also rounds to one. So every stratified test set has exactly one fast seller and one slow one. It is how a careful survey works: instead of phoning random numbers and hoping the mix of cities comes out right, you decide in advance to call the right share from each city.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import train_test_split

sold = np.array([1, 0, 0, 1, 0, 1, 1, 0, 0, 0])      # flats A..J: 4 fast sellers
X = np.arange(10).reshape(-1, 1)
plain = [int(train_test_split(X, sold, test_size=0.2, random_state=s)[3].sum()) for s in range(10)]
strat = [int(train_test_split(X, sold, test_size=0.2, random_state=s, stratify=sold)[3].sum()) for s in range(10)]
print("fast sellers in a 2-flat test set, 10 seeds")
print("  plain     :", plain)
print("  stratified:", strat)

y = (np.arange(1000) &lt; 50).astype(int)              # 1,000 rows, 5% positive
X = np.zeros((1000, 1))
plain = [int(train_test_split(X, y, test_size=0.2, random_state=s)[3].sum()) for s in range(10)]
strat = [int(train_test_split(X, y, test_size=0.2, random_state=s, stratify=y)[3].sum()) for s in range(10)]
print("positives in a 200-row test set (expect 10)")
print("  plain     :", plain)
print("  stratified:", strat)</div>
  <div class="fx" data-lang="text">fast sellers in a 2-flat test set, 10 seeds
  plain     : [0, 0, 0, 1, 1, 1, 0, 1, 1, 0]
  stratified: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
positives in a 200-row test set (expect 10)
  plain     : [9, 10, 5, 10, 5, 7, 12, 8, 8, 14]
  stratified: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]</div>
  <p>Across ten random seeds, plain splits gave a test set with no fast seller five times (the hand calculation says one time in three on average; ten seeds is a small sample), while stratified splits always gave exactly one. On 1,000 rows with 5% positives, plain 20% test sets contained anywhere from 5 to 14 positives against an expected 10; stratified ones always contained exactly 10. With only 5 positives instead of 10, each missed case would swing the measured recall by 20 points. In scikit-learn you just pass <code>stratify=y</code>. For a numeric target such as price, there are no classes, but you can cut the target into a few bins of equal size (cheap, middle, expensive) and stratify on the bin number, so every part gets its share of each price range.</p>
  <p>The same problem hits k-fold CV, often harder, because data files are frequently sorted. Suppose the portal's export lists the four fast sellers first: A, D, F, G, then B, C, E, H, I, J. Plain 2-fold CV takes the first five rows as fold 1 and the last five as fold 2, so fold 2 has no fast seller at all. <strong>Stratified k-fold</strong> deals each class out separately, like dealing cards: the four fast sellers go two to each fold, and the six slow ones three to each.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import KFold, StratifiedKFold

flats = np.array(list("ADFGBCEHIJ"))               # the export lists the fast sellers first
y = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 0])
X = np.zeros((10, 1))
for name, cv in [("KFold          ", KFold(2)), ("StratifiedKFold", StratifiedKFold(2))]:
    for i, (tr, va) in enumerate(cv.split(X, y), 1):
        print(f"{name} fold {i}: validate {''.join(flats[va])}  labels {y[va].tolist()}")</div>
  <div class="fx" data-lang="text">KFold           fold 1: validate ADFGB  labels [1, 1, 1, 1, 0]
KFold           fold 2: validate CEHIJ  labels [0, 0, 0, 0, 0]
StratifiedKFold fold 1: validate ADBCE  labels [1, 1, 0, 0, 0]
StratifiedKFold fold 2: validate FGHIJ  labels [1, 1, 0, 0, 0]</div>
  <p>Plain <code>KFold</code> produced folds with four fast sellers and none; <code>StratifiedKFold</code> produced two and two, the same 40% in each as in the whole. For classification, stratified k-fold is the sensible default, and scikit-learn already uses it when you pass <code>cv=5</code> to a classifier. Two warnings come with it. It does not shuffle unless you ask (<code>StratifiedKFold(5, shuffle=True, random_state=0)</code>), so data ordered in some other way, by date or by locality, still lands in folds in that order. And stratification is the wrong tool when rows are grouped or ordered in time, the subjects of the next two sections.</p>

  <h2 id="ms-group"><span class="num">07</span>Group Splits</h2>
  <p>Every split so far has treated rows as independent of each other. Often they are not. A hospital has ten scans per patient. Shuffle the scans and split them, and almost every patient ends up with some scans in training and some in test. The model can then score well by <em>recognising the patient</em> rather than recognising the disease, and in production, where every patient is new, that skill is worthless. Our flats have the same structure on a small scale: they come from three localities, and flats in the same locality share a price level (Baner flats sold about ₹2 lakh above the line, Hadapsar flats about ₹2 lakh below). A model that has seen other Baner flats has an easy job pricing one more.</p>
  <p>A <strong>group split</strong> keeps all the rows of one group (one patient, one customer, one locality) on the same side of the split, so no group appears in both training and evaluation. It answers a different question from a random split: how well will the model do on groups it has never met? It is like checking a teacher's marking: you would not test it on a second copy of an answer sheet she has already marked. Below, the model is a line on area plus one 0/1 column per locality, so it can learn each locality's price level. <code>GroupKFold</code> with three folds puts each locality in a fold of its own.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, GroupKFold, cross_val_score

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
loc = np.array(["Hadapsar", "Baner", "Kothrud", "Hadapsar", "Baner",
                "Kothrud", "Hadapsar", "Baner", "Kothrud", "Baner"])
X = np.c_[area, loc == "Baner", loc == "Kothrud", loc == "Hadapsar"].astype(float)  # area + locality flags

for i, (tr, va) in enumerate(GroupKFold(n_splits=3).split(X, price, groups=loc), 1):
    print(f"GroupKFold fold {i}: validate {sorted(set(loc[va].tolist()))}, train on {sorted(set(loc[tr].tolist()))}")
rows = -cross_val_score(LinearRegression(), X, price, cv=KFold(5, shuffle=True, random_state=0),
                        scoring="neg_mean_absolute_error")
grps = -cross_val_score(LinearRegression(), X, price, cv=GroupKFold(3), groups=loc,
                        scoring="neg_mean_absolute_error")
print("random rows (KFold)          MAE per fold", rows.round(2), " mean", rows.mean().round(2))
print("new localities (GroupKFold)  MAE per fold", grps.round(2), " mean", grps.mean().round(2))</div>
  <div class="fx" data-lang="text">GroupKFold fold 1: validate ['Baner'], train on ['Hadapsar', 'Kothrud']
GroupKFold fold 2: validate ['Kothrud'], train on ['Baner', 'Hadapsar']
GroupKFold fold 3: validate ['Hadapsar'], train on ['Baner', 'Kothrud']
random rows (KFold)          MAE per fold [2.   1.19 0.3  0.86 1.31]  mean 1.13
new localities (GroupKFold)  MAE per fold [4.06 0.89 3.64]  mean 2.86</div>
  <p>Each <code>GroupKFold</code> fold validates on one locality and trains on the other two. Random 5-fold CV reports an MAE of 1.13 lakh, because almost every validation flat had a neighbour from its own locality in training. Grouped CV reports 2.86: for a locality it has never seen, the model's column for that locality was all zeros in training, so it cannot know whether the new place is pricey like Baner (that fold's MAE is 4.06) or cheaper like Hadapsar (3.64). Both numbers are correct; they answer different questions. 1.13 is the honest error for "a new flat in a locality we already cover", and 2.86 for "a flat in a locality we are launching in". The effect can be far larger. In a simulation of 40 patients with 10 scans each, where each patient's scans look alike and the disease adds a real but modest signal, a 1-nearest-neighbour model gives:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import KFold, GroupKFold, cross_val_score

rng = np.random.default_rng(0)
X, y, groups = [], [], []
for patient in range(40):                       # 40 patients, 10 scans each
    sick = patient % 2
    look = rng.normal(0, 1, 20)                 # what makes THIS patient's scans look alike
    for scan in range(10):
        x = look + rng.normal(0, 0.3, 20)
        x[:2] += 1.5 * sick                     # a real disease signal in 2 columns
        X.append(x); y.append(sick); groups.append(patient)
X, y, groups = np.array(X), np.array(y), np.array(groups)

model = KNeighborsClassifier(n_neighbors=1)
by_row = cross_val_score(model, X, y, cv=KFold(5, shuffle=True, random_state=0))
by_patient = cross_val_score(model, X, y, cv=GroupKFold(5), groups=groups)
print("split by row     (KFold)     : mean accuracy", round(by_row.mean(), 3))
print("split by patient (GroupKFold): mean accuracy", round(by_patient.mean(), 3))</div>
  <div class="fx" data-lang="text">split by row     (KFold)     : mean accuracy 1.0
split by patient (GroupKFold): mean accuracy 0.66</div>
  <p>Splitting by row reports a perfect 1.0, because for every validation scan the nearest training scan is another scan of the same patient, carrying the right label. Splitting by patient reports the honest 0.66: the disease signal is real, but far weaker than the leaked identity. To decide whether you need groups, ask: "in production, will the model see this entity for the first time?" If yes, that entity is the group. Typical groups are patients, customers, users, households, devices, stores, the same flat sold twice, all photos of one product, all sentences from one document, and all frames from one video. And if production does see the same groups again (the portal keeps pricing flats in the same three localities), a group split is too pessimistic; then a split by time, next section, usually matches reality better. Match the split to the question production will ask.</p>

  <h2 id="ms-time"><span class="num">08</span>Time-Based Splits</h2>
  <p>Time is the other way rows depend on each other. The portal will always train on past sales and price future listings. A shuffled split mixes the months, so the model trains on flats listed <em>after</em> some of the flats it is tested on, which can never happen in real use. The honest split for anything ordered in time is to cut at a date: everything before the cut trains, everything after it tests. On our flats, sorted by the month they were listed (B, D, A, F, C, G, I, E, H, J), training on January to August and testing on September and October gives an MAE of 3.11; both of the latest flats sold a little above the line. With two flats we cannot say whether that is a rising market or luck, but the procedure is the one that copies real use. When there <em>is</em> a trend, a shuffled split hides it completely. Here are two years of daily sales with an upward trend and a weekly cycle, predicted by a random forest from the day number and the weekday.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import KFold, TimeSeriesSplit, cross_val_score

rng = np.random.default_rng(0)
days = np.arange(730)                                         # two years of daily sales, in order
sales = 100 + 0.2 * days + 15 * np.sin(2 * np.pi * days / 7) + rng.normal(0, 5, 730)
X = np.c_[days, days % 7]                                     # features: day number, weekday
model = RandomForestRegressor(n_estimators=50, random_state=0, n_jobs=1)

cut = int(730 * 0.8)                                          # first 80% of days train, last 20% test
chrono = np.abs(sales[cut:] - model.fit(X[:cut], sales[:cut]).predict(X[cut:])).mean()
kf = -cross_val_score(model, X, sales, cv=KFold(5, shuffle=True, random_state=0), scoring="neg_mean_absolute_error")
ts = -cross_val_score(model, X, sales, cv=TimeSeriesSplit(5), scoring="neg_mean_absolute_error")
print("chronological hold-out MAE:", round(chrono, 1))
print("shuffled KFold    MAE per fold:", kf.round(1), " mean", round(kf.mean(), 1))
print("TimeSeriesSplit   MAE per fold:", ts.round(1), " mean", round(ts.mean(), 1))</div>
  <div class="fx" data-lang="text">chronological hold-out MAE: 14.8
shuffled KFold    MAE per fold: [5.1 4.8 4.8 4.9 4.4]  mean 4.8
TimeSeriesSplit   MAE per fold: [11.9 12.7 13.  15.1 13.2]  mean 13.2</div>
  <p>Training on the first 80% of days and testing on the last 20% gives an MAE of 14.8. Shuffled 5-fold CV says 4.8, three times better, while <code>TimeSeriesSplit</code>, which always validates on days after the ones it trains on, says 13.2. The shuffled number is not just optimistic; it measures the wrong task. With shuffling, every test day sits between known neighbours on both sides, so the model only has to fill in gaps. Forecasting means going beyond the last known day, and tree models cannot extend a trend past the last value they saw (<a class="xref" data-note="ml_dtree">Decision Trees</a> explains why). Only the time-ordered split reveals that. It is like judging a weather forecaster by letting him look at tomorrow's newspaper.</p>
    <figure class="viz"><svg viewBox="0 0 560 120" width="560">
<text x="20" y="16" class="tm">shuffled: test days scattered among training days</text>
<g class="fb sb"><rect x="20" y="24" width="520" height="22"/></g>
<g class="fr sr"><rect x="60" y="24" width="12" height="22"/><rect x="130" y="24" width="12" height="22"/><rect x="215" y="24" width="12" height="22"/><rect x="300" y="24" width="12" height="22"/><rect x="390" y="24" width="12" height="22"/><rect x="470" y="24" width="12" height="22"/></g>
<text x="20" y="70" class="tm">chronological: train on the past, test on the future (with an optional gap)</text>
<rect x="20" y="78" width="400" height="22" class="fb sb"/><rect x="420" y="78" width="16" height="22" fill="none" stroke="currentColor" stroke-dasharray="3 2"/><rect x="436" y="78" width="104" height="22" class="fr sr"/>
<text x="428" y="114" text-anchor="middle" class="tm" font-size="10">gap</text><text x="220" y="114" text-anchor="middle" class="tb" font-size="11">train</text><text x="488" y="114" text-anchor="middle" class="tr" font-size="11">test</text>
</svg><figcaption>Blue = training days, red = test days. Only the bottom layout matches how a forecast is used.</figcaption></figure>
  <p>A single cut-off gives a single, lucky or unlucky, score. <strong>Time-series cross-validation</strong> (also called walk-forward or rolling-origin validation) uses several cut-offs: each split trains on everything before its cut-off and validates on the block straight after it. In the default <strong>expanding window</strong>, training always starts at the beginning and grows with each split. In a <strong>sliding window</strong>, training keeps a fixed length and moves forward, which suits markets where old data stops being relevant. And a <strong>gap</strong> (also called an embargo) skips some rows between training and validation. A gap is needed when nearby rows share information even across the cut: a target such as "sales over the next 7 days" for Monday overlaps Tuesday's, and a feature such as "average locality price over the last 3 months" for the first test flat uses months inside the training period. The gap should be at least as long as the target window or the longest feature window.</p>
    <figure class="viz"><svg viewBox="0 0 560 140" width="560">
<defs><marker id="ms-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="20" y="14" class="tm">expanding window</text><text x="300" y="14" class="tm">sliding window</text>
<rect x="20" y="22" width="60" height="16" class="fb sb"/><rect x="80" y="22" width="60" height="16" class="fg sg"/>
<rect x="20" y="44" width="120" height="16" class="fb sb"/><rect x="140" y="44" width="60" height="16" class="fg sg"/>
<rect x="20" y="66" width="180" height="16" class="fb sb"/><rect x="200" y="66" width="60" height="16" class="fg sg"/>
<rect x="300" y="22" width="60" height="16" class="fb sb"/><rect x="360" y="22" width="60" height="16" class="fg sg"/>
<rect x="340" y="44" width="80" height="16" class="fb sb"/><rect x="420" y="44" width="60" height="16" class="fg sg"/>
<rect x="400" y="66" width="80" height="16" class="fb sb"/><rect x="480" y="66" width="60" height="16" class="fg sg"/>
<line x1="20" y1="100" x2="540" y2="100" stroke="currentColor" marker-end="url(#ms-fa)"/><text x="280" y="118" text-anchor="middle" class="tm">time →</text>
<rect x="20" y="124" width="12" height="10" class="fb sb"/><text x="36" y="133" class="tm" font-size="11">train</text><rect x="80" y="124" width="12" height="10" class="fg sg"/><text x="96" y="133" class="tm" font-size="11">validate</text>
</svg><figcaption>Left: training grows from the start. Right: training keeps a fixed length and slides. In both, validation is always later than training.</figcaption></figure>
  <p>On the ten flats in listing order with three splits, scikit-learn uses validation blocks of 10 // (3 + 1) = 2 rows, taken from the end: C and G, then I and E, then H and J. Each trains on everything before its block. With <code>gap=1</code> the last training row before each block is dropped, and with <code>max_train_size=4</code> only the four most recent training rows are kept.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.linear_model import LinearRegression

flats = np.array(list("BDAFCGIEHJ"))                       # sorted by month listed, Jan..Oct
area  = np.array([6, 8, 5, 10, 7, 11, 13, 9, 12, 14]).reshape(-1, 1)
price = np.array([49, 56, 38, 68, 53, 73, 87, 67, 83, 96])

for title, cv in [("expanding (default)", TimeSeriesSplit(n_splits=3)),
                  ("gap=1", TimeSeriesSplit(n_splits=3, gap=1)),
                  ("sliding, max_train_size=4", TimeSeriesSplit(n_splits=3, max_train_size=4))]:
    print(title)
    for tr, va in cv.split(area):
        m = LinearRegression().fit(area[tr], price[tr])
        print(f"   train {''.join(flats[tr]):8s}  validate {''.join(flats[va])}  "
              f"MAE {np.abs(price[va] - m.predict(area[va])).mean():.2f}")</div>
  <div class="fx" data-lang="text">expanding (default)
   train BDAF      validate CG  MAE 1.15
   train BDAFCG    validate IE  MAE 3.58
   train BDAFCGIE  validate HJ  MAE 3.11
gap=1
   train BDA       validate CG  MAE 1.29
   train BDAFC     validate IE  MAE 3.09
   train BDAFCGI   validate HJ  MAE 3.74
sliding, max_train_size=4
   train BDAF      validate CG  MAE 1.15
   train AFCG      validate IE  MAE 3.29
   train CGIE      validate HJ  MAE 3.30</div>
  <p>All three layouts match the reasoning: training is always earlier than validation, the gap removes one row, and the sliding window keeps four. The line's MAE per cut-off (1.15, 3.58, 3.11 for the expanding window) is the time-respecting version of the 2.01 from ordinary 5-fold CV; it is higher partly because the early folds train on only four flats. One caution: <code>TimeSeriesSplit</code> assumes the rows are already sorted by time, one row per time step. With many series stacked together (one per store), rows for the same date are spread through the file, so you should split by date values yourself, so that no store's future trains another store's past. <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> builds such splits.</p>

  <h2 id="ms-nested"><span class="num">09</span>Nested Cross-Validation</h2>
  <p>Cross-validation is the standard way to choose hyperparameters: for each candidate value, run k-fold CV and keep the value with the best mean score. scikit-learn's <code>GridSearchCV</code> does exactly this and reports the winning mean as <code>best_score_</code>. But section 02 showed that whenever a set is used to choose, its score for the winner is too optimistic, and CV is no exception. <code>best_score_</code> is the best of several noisy estimates measured on the same folds, so it contains the winner's skill plus the winner's luck. It tells you how well the winner did on the folds that chose it, not how well it will do on new data.</p>
  <p>Picture 144 students sitting the same mock paper, and the topper being chosen. The topper's mark is partly ability and partly luck on that particular paper. To know how good the topper really is, you would give a fresh paper that played no part in choosing. <strong>Nested cross-validation</strong> is that fresh paper, repeated for every way of choosing. It wraps the entire tuning procedure inside an outer CV loop. For each outer fold, hold that fold out, run the <em>whole</em> grid search, with its own inner CV, on the remaining rows only, take its winner, and score that winner on the held-out outer fold. The outer scores are honest because their rows never took part in tuning.</p>
    <figure class="viz"><svg viewBox="0 0 600 170" width="600">
<text x="20" y="16" class="tm" font-size="12">outer fold 1 of 3</text>
<rect x="20" y="24" width="380" height="24" class="fb sb"/><rect x="400" y="24" width="180" height="24" class="fr sr"/>
<text x="210" y="41" text-anchor="middle" font-size="12">outer train: used for tuning</text><text x="490" y="41" text-anchor="middle" font-size="12">outer test: score once</text>
<text x="20" y="72" class="tm" font-size="12">inside the outer train: 4-fold inner CV for each candidate k</text>
<g><rect x="20" y="80" width="380" height="14" class="fb sb" fill-opacity="0.5"/><rect x="20" y="80" width="95" height="14" class="fg sg"/>
<rect x="20" y="98" width="380" height="14" class="fb sb" fill-opacity="0.5"/><rect x="115" y="98" width="95" height="14" class="fg sg"/>
<rect x="20" y="116" width="380" height="14" class="fb sb" fill-opacity="0.5"/><rect x="210" y="116" width="95" height="14" class="fg sg"/>
<rect x="20" y="134" width="380" height="14" class="fb sb" fill-opacity="0.5"/><rect x="305" y="134" width="95" height="14" class="fg sg"/></g>
<text x="410" y="96" font-size="11.5">→ inner score per k</text><text x="410" y="114" font-size="11.5">→ pick best k</text><text x="410" y="132" font-size="11.5">→ refit on outer train</text><text x="410" y="150" font-size="11.5" class="tr">→ score on outer test</text>
<text x="20" y="166" class="tm" font-size="11">repeat for outer folds 2 and 3; the nested estimate is the mean of the 3 outer scores</text>
</svg><figcaption>Two loops. The inner loop chooses; the outer loop measures the choosing procedure on rows it never touched.</figcaption></figure>
  <p>The figure shows one outer fold: the inner folds, drawn inside the outer training part, choose the setting, and the outer test part scores the choice. On the ten flats, tune k for k-nearest-neighbours over the candidates 1 to 4, with 4 inner folds and 5 outer folds. Each outer fold holds out two flats, and the grid search sees only the other eight. The number of fits is outer folds × (candidates × inner folds + 1 refit) = 5 × (4 × 4 + 1) = 85.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import KFold, GridSearchCV

X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
grid = {"n_neighbors": [1, 2, 3, 4]}
inner = KFold(4, shuffle=True, random_state=0)
outer = KFold(5, shuffle=True, random_state=1)
mae = "neg_mean_absolute_error"

gs = GridSearchCV(KNeighborsRegressor(), grid, cv=inner, scoring=mae).fit(X, y)
print("plain grid search: best k", gs.best_params_["n_neighbors"], "  best_score_ MAE", round(-gs.best_score_, 2))

outer_scores = []
for i, (tr, te) in enumerate(outer.split(X), 1):
    g = GridSearchCV(KNeighborsRegressor(), grid, cv=inner, scoring=mae).fit(X[tr], y[tr])  # tune on tr only
    s = np.abs(y[te] - g.predict(X[te])).mean()                                             # score unseen fold
    outer_scores.append(s)
    print(f"outer fold {i}: picked k={g.best_params_['n_neighbors']}  inner best {-g.best_score_:.2f}  outer MAE {s:.2f}")
print("nested CV MAE:", round(np.mean(outer_scores), 2))</div>
  <div class="fx" data-lang="text">plain grid search: best k 2   best_score_ MAE 4.83
outer fold 1: picked k=2  inner best 5.50  outer MAE 5.75
outer fold 2: picked k=3  inner best 6.50  outer MAE 7.17
outer fold 3: picked k=1  inner best 4.00  outer MAE 7.00
outer fold 4: picked k=1  inner best 7.12  outer MAE 10.50
outer fold 5: picked k=2  inner best 7.06  outer MAE 2.25
nested CV MAE: 6.53</div>
  <p>The plain grid search says kNN tuned this way misses by 4.83 lakh. The nested estimate, the mean of the five outer scores, is 6.53, a third worse. In four of the five outer folds the winner's inner score looks better than what it then achieved on the unseen outer fold (5.50 vs 5.75, 6.50 vs 7.17, 4.00 vs 7.00, 7.12 vs 10.50): that is the selection bias at work. Fold 5 went the other way only because its two outer flats happened to be easy. Notice also that each outer fold picked a <em>different</em> k: 2, 3, 1, 1, 2. Nested CV does not produce one hyperparameter value; it scores the procedure "tune k with 4-fold CV, then refit". (And kNN at 6.5 is far worse than the line's 2.0: with ten flats, averaging neighbours throws away the clear straight-line pattern.) The optimism becomes dramatic when you search many settings on little data. Here are 100 rows of pure noise, where no model can beat 50% accuracy, and a search over 144 settings of a support vector machine:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import StratifiedKFold, GridSearchCV, cross_val_score
from sklearn.svm import SVC

rng = np.random.default_rng(0)
X, y = rng.normal(size=(100, 20)), rng.integers(0, 2, 100)      # pure noise: true accuracy 0.5
grid = {"C": np.logspace(-2, 3, 12), "gamma": np.logspace(-4, 1, 12)}   # 144 settings
inner = StratifiedKFold(3, shuffle=True, random_state=0)
outer = StratifiedKFold(5, shuffle=True, random_state=1)

gs = GridSearchCV(SVC(), grid, cv=inner).fit(X, y)
print("best_score_ of the grid search:", round(gs.best_score_, 3))
nested = cross_val_score(GridSearchCV(SVC(), grid, cv=inner), X, y, cv=outer)
print("nested CV per outer fold:", nested.round(2), "  mean", round(nested.mean(), 3))</div>
  <div class="fx" data-lang="text">best_score_ of the grid search: 0.58
nested CV per outer fold: [0.55 0.55 0.35 0.45 0.6 ]   mean 0.5</div>
  <p>The grid search's best score is 0.58: one of the 144 settings got lucky on the inner folds, and <code>best_score_</code> reports that luck as skill. Nested CV gives 0.50, the truth, with outer folds scattered from 0.35 to 0.60 because each has only 20 rows.</p>
  <p>Nested CV is for <em>reporting</em> a tuned model's performance and for comparing whole procedures, such as "tuned kNN" against "plain line", or "tuned SVM" against "tuned random forest". The model you actually ship comes from running the inner procedure once on all the data, <code>GridSearchCV(...).fit(X, y)</code>, whose <code>best_estimator_</code> is refitted on everything; the nested score is the honest estimate of how that procedure performs. A simpler alternative that is very common in practice is to tune with CV on the training part and report on an untouched test set; a test set is just nested CV with a single outer fold.</p>

  <h2 id="ms-choosek"><span class="num">10</span>How Reliable a CV Score Is</h2>
  <p>We have used k = 2, 4, 5 and n without a principle. On the flats, 5-fold CV of the average predictor said 18.0 and LOO said 16.0. Which is "right", in which direction is CV wrong, and how should k be chosen? Like any estimate, a CV score can be off in two ways: it can be systematically too high or too low (bias), and it can wobble from one run to another (variance).</p>
  <p>The bias comes from the fact that each fold model trains on only a fraction (k − 1)/k of the rows: half with k = 2, 80% with k = 5, 90% with k = 10. A model trained on fewer rows is usually a little worse, so CV is <strong>pessimistic</strong> about the final model trained on all n rows, and the pessimism shrinks as k grows. The variance comes from three places. The first is which rows you happen to have at all; different datasets of the same size give different estimates, and no choice of k removes that. The second is the partition, which rows happen to share a fold; this can be averaged away by repeating CV with different shuffles. The third is that with large k the fold models train on almost the same rows, so they make almost the same mistakes, and averaging them helps less. For an unstable model such as a deep decision tree, this can make LOO noisier than 5- or 10-fold CV; for a stable model such as a linear regression, LOO is usually the most accurate. Both effects are easy to see on the flats:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, RepeatedKFold, cross_val_score

X = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).reshape(-1, 1)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96])
mae = "neg_mean_absolute_error"

for k in [2, 5, 10]:
    runs = [-cross_val_score(LinearRegression(), X, y, cv=KFold(k, shuffle=True, random_state=s),
                             scoring=mae).mean() for s in range(50)]       # 50 different shuffles
    print(f"k={k:2d}: trains on {10 - 10 // k} flats   average CV MAE {np.mean(runs):.3f}   "
          f"SD across shuffles {np.std(runs):.3f}   range {min(runs):.2f}..{max(runs):.2f}")

rep = -cross_val_score(LinearRegression(), X, y, cv=RepeatedKFold(n_splits=5, n_repeats=20, random_state=0),
                       scoring=mae)
print("RepeatedKFold(5 x 20):", len(rep), "fold scores, mean", rep.mean().round(3))</div>
  <div class="fx" data-lang="text">k= 2: trains on 5 flats   average CV MAE 2.643   SD across shuffles 0.504   range 1.99..3.59
k= 5: trains on 8 flats   average CV MAE 2.547   SD across shuffles 0.161   range 2.06..2.90
k=10: trains on 9 flats   average CV MAE 2.516   SD across shuffles 0.000   range 2.52..2.52
RepeatedKFold(5 x 20): 100 fold scores, mean 2.566</div>
  <p>Lines fitted on 5 flats (k = 2) miss by 2.643 on average, on 8 flats (k = 5) by 2.547, and on 9 flats (k = 10, which for ten flats is LOO) by 2.516: the less each fold trains on, the more pessimistic the estimate. The partition noise also shrinks with k. With k = 2, the result depends heavily on how the flats were shuffled into the two halves (anywhere from 1.99 to 3.59); with k = 5 it still moves between 2.06 and 2.90; at k = 10 it is exactly fixed, because there is only one way to leave out one flat at a time. The bias matters most when the dataset is small and every extra row still helps, as here; with plenty of data, adding rows barely changes the model and the bias disappears.</p>
  <p>The last line shows the cure for partition noise. <strong>Repeated k-fold</strong> runs k-fold several times with different shuffles and averages all the scores: 20 repeats of 5-fold, 100 fits in all, give 2.566. Repeating removes the luck of the partition, not the luck of the data: our ten flats are still one sample of Pune, so repeated CV makes the estimate stable, not more correct about the world. It is most useful on small datasets and when comparing two close models, in which case both models should use the same shuffles so that the comparison is fold by fold.</p>
  <p>A related trap is treating the k fold scores as independent measurements and reporting the mean ± SD/√k as if it were a standard error. The training sets of different folds overlap heavily, so fold scores are correlated, and it has been proven that no unbiased estimate of a CV score's variance can be computed from a single run. Report the fold spread as a description ("18.0 ± 11.1 over 5 folds"), and when comparing two models look at the fold-by-fold <em>differences</em> on the same folds (the line beat the average predictor in every one of the five folds), preferably over repeated CV. Putting it all together: use k = 5 or 10 by default, stratified for classification; repeated 5- or 10-fold for small data and close comparisons; LOO for tiny data with a stable model or a cheap shortcut; k = 3 or a single large validation set for huge data or slow models; and fix k before looking at results, because k is part of the measuring instrument, not of the model.</p>

  <h2 id="ms-api"><span class="num">11</span>The scikit-learn Toolbox</h2>
  <p>We have now used most of scikit-learn's splitting tools in passing. They all follow one pattern: a <strong>splitter</strong> object has a <code>split(X, y, groups)</code> method that yields pairs of (training indices, validation indices), and any function that takes a <code>cv=</code> argument accepts such a splitter. The table lists them.</p>
  <table class="tbl">
    <tr><th>Splitter</th><th>What it does</th><th>Key arguments</th></tr>
    <tr><td><code>KFold</code></td><td>k folds in order, or shuffled</td><td><code>n_splits=5, shuffle=False, random_state</code></td></tr>
    <tr><td><code>StratifiedKFold</code></td><td>k folds with equal class shares</td><td>same; needs y</td></tr>
    <tr><td><code>GroupKFold</code></td><td>k folds of whole groups</td><td><code>groups=</code> in split</td></tr>
    <tr><td><code>StratifiedGroupKFold</code></td><td>whole groups, class shares as equal as possible</td><td>groups and y</td></tr>
    <tr><td><code>LeaveOneGroupOut</code></td><td>each group is one fold</td><td>groups</td></tr>
    <tr><td><code>GroupShuffleSplit</code></td><td>random train/test split by groups</td><td><code>n_splits, test_size</code></td></tr>
    <tr><td><code>TimeSeriesSplit</code></td><td>expanding or sliding time folds</td><td><code>n_splits, max_train_size, test_size, gap</code></td></tr>
    <tr><td><code>LeaveOneOut</code>, <code>LeavePOut</code></td><td>k = n; every subset of size p</td><td><code>p</code></td></tr>
    <tr><td><code>ShuffleSplit</code>, <code>StratifiedShuffleSplit</code></td><td>independent random splits; a row may be validated many times or never</td><td><code>n_splits, test_size</code></td></tr>
    <tr><td><code>RepeatedKFold</code>, <code>RepeatedStratifiedKFold</code></td><td>k-fold r times with new shuffles</td><td><code>n_splits, n_repeats</code></td></tr>
    <tr><td><code>PredefinedSplit</code></td><td>you give each row's fold number (−1 = always train)</td><td><code>test_fold</code></td></tr>
  </table>
  <p>Three of the less familiar ones are worth seeing on the flats, with locality as the group and "sold within 30 days" as the label:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.model_selection import StratifiedGroupKFold, ShuffleSplit, PredefinedSplit

flats = np.array(list("ABCDEFGHIJ"))
X = np.zeros((10, 1))
y = np.array([1, 0, 0, 1, 0, 1, 1, 0, 0, 0])                                   # sold within 30 days?
groups = np.array(["Had", "Ban", "Kot", "Had", "Ban", "Kot", "Had", "Ban", "Kot", "Ban"])

def show(name, cv, **kw):
    print(name)
    for tr, va in cv.split(X, y, **kw):
        print("   validate", "".join(flats[va]), " localities", sorted(set(groups[va].tolist())), " fast sellers", int(y[va].sum()))

show("StratifiedGroupKFold(2)", StratifiedGroupKFold(2), groups=groups)
show("ShuffleSplit(3 draws, 20%)", ShuffleSplit(n_splits=3, test_size=0.2, random_state=0))
show("PredefinedSplit (H and J only)", PredefinedSplit(test_fold=[-1] * 7 + [0, -1, 0]))</div>
  <div class="fx" data-lang="text">StratifiedGroupKFold(2)
   validate BEHJ  localities ['Ban']  fast sellers 0
   validate ACDFGI  localities ['Had', 'Kot']  fast sellers 4
ShuffleSplit(3 draws, 20%)
   validate CI  localities ['Kot']  fast sellers 0
   validate DF  localities ['Had', 'Kot']  fast sellers 2
   validate CD  localities ['Had', 'Kot']  fast sellers 1
PredefinedSplit (H and J only)
   validate HJ  localities ['Ban']  fast sellers 0</div>
  <p><code>StratifiedGroupKFold</code> keeps localities whole and tries to balance fast sellers too, but it can only move whole localities: Baner has no fast seller and Hadapsar has three, so its two folds hold 0 and 4. When groups and classes are entangled like this, no splitter can satisfy both. <code>ShuffleSplit</code> draws each validation set independently, so flat C was validated twice and others never; that is fine for estimating, but it is not k-fold. <code>PredefinedSplit</code> is how you plug a fixed validation set, here "the two latest listings, H and J", into <code>GridSearchCV</code>.</p>
  <p>Three functions run cross-validation. <code>cross_val_score</code> returns one score per fold for one metric. <code>cross_validate</code> can compute several metrics at once, return training scores as well (comparing them with the validation scores shows overfitting), and return timings and the fitted fold models. <code>cross_val_predict</code> returns one out-of-fold prediction per row, each made by the model that did not train on that row; it is meant for confusion matrices, plots and building features for stacked models (<a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>), not for computing "the CV score", because pooling predictions from different models is not the same as averaging fold scores.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import check_cv, StratifiedKFold, cross_validate, cross_val_predict

X, y = load_breast_cancer(return_X_y=True)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))

print("cv=5 becomes:", check_cv(5, y, classifier=True))         # what an integer cv really means

cv = StratifiedKFold(5, shuffle=True, random_state=0)
res = cross_validate(model, X, y, cv=cv, scoring=["accuracy", "recall"], return_train_score=True)
print(pd.DataFrame({k: res[k] for k in ["train_accuracy", "test_accuracy", "test_recall"]}).round(3))

oof = cross_val_predict(model, X, y, cv=cv, method="predict_proba")[:, 1]   # one prediction per row
print("out-of-fold probabilities:", oof.shape, oof[:5].round(3))</div>
  <div class="fx" data-lang="text">cv=5 becomes: StratifiedKFold(n_splits=5, random_state=None, shuffle=False)
   train_accuracy  test_accuracy  test_recall
0           0.993          0.956        0.986
1           0.987          0.974        0.986
2           0.987          0.982        1.000
3           0.985          1.000        1.000
4           0.989          0.982        0.986
out-of-fold probabilities: (569,) [0.    0.    0.    0.001 0.   ]</div>
  <p>The first line exposes the default that surprises most people: <code>cv=5</code> with a classifier becomes <code>StratifiedKFold(n_splits=5, shuffle=False)</code> (and plain <code>KFold(5)</code> for a regressor), so an integer never shuffles. Pass a splitter object whenever you want shuffling or groups. The table from <code>cross_validate</code> shows training accuracy around 0.99 against validation accuracy from 0.956 to 1.000, a small gap that suggests little overfitting, and recall for each fold. <code>cross_val_predict</code> gave one probability for each of the 569 rows. One more rule belongs here because it is so often broken: any preprocessing that learns from data, such as scaling, filling missing values or selecting features, must happen <em>inside</em> each fold. Fitting a scaler on all rows and then cross-validating lets the validation folds influence training. Putting the preprocessing in a pipeline, as above with <code>make_pipeline</code>, makes each fold fit its own scaler on its own training part; <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a> covers this in depth.</p>

  <h2 id="ms-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most damaging mistake is reporting a number that was used to make a decision: a training score, a validation score that chose the winner, or <code>best_score_</code> from a grid search. Each measures some mixture of memory and luck. On the flats, the lookup table's training MAE was 0 against 17.0 held out, the chosen line's validation MAE was 0.52 against 3.96 on test, and tuned kNN's <code>best_score_</code> was 4.83 against an honest 6.53. The fix is to report a held-out score from data that played no part in any decision, or a nested CV score.</p>
  <p>A close cousin is using the test set more than once. Each look that changes a decision, "the test score is disappointing, let me try a bigger model", turns the test set into validation data. Decide with CV, test once, and say so if you broke the rule. Another is trusting a tiny validation set: two flats picked the wrong line. With little data, use cross-validation, not one small validation set.</p>
  <p>Splitting the wrong way is the next family of mistakes. Shuffling time-ordered data gave a forecast MAE of 4.8 against an honest 13.2. Putting the same entity on both sides, scans of one patient or flats of one locality, gave 1.00 against an honest 0.66, and 1.13 against 2.86. Duplicates do the same thing quietly: the same flat listed twice, or augmented copies of one image, split across training and test inflate the score just as groups do, so remove duplicates first or keep them in the same group. And trusting <code>cv=5</code> to shuffle fails whenever the file is sorted: the export sorted by label in section 06 gave plain folds with four fast sellers and none. Pass <code>StratifiedKFold(5, shuffle=True, random_state=0)</code> explicitly.</p>
  <p>Preprocessing before splitting is the mistake behind most "too good to be true" results: scaling, filling gaps, selecting features or target-encoding on the full dataset lets validation information leak into training. Fit them inside each fold through a pipeline. Finally, do not read too much into small differences. The same line on the same ten flats scored anywhere from 2.06 to 2.90 under 5-fold CV depending only on the shuffle. Use repeated CV, compare models fold by fold, and when two scores are within the noise, prefer the simpler model.</p>

  <h2 id="ms-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Ten flats, area x (100 sq ft) and price y (₹ lakh): A (5, 38), B (6, 49), C (7, 53), D (8, 56), E (9, 67), F (10, 68), G (11, 73), H (12, 83), I (13, 87), J (14, 96). Localities: Hadapsar A, D, G; Baner B, E, H, J; Kothrud C, F, I. Listed in the order B, D, A, F, C, G, I, E, H, J (Jan → Oct). Sold within 30 days: A, D, F, G.</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Training error</b>: loss on the rows used to fit; optimistic. <b>Generalisation error</b>: expected loss on new rows; estimated with held-out rows that played no part in any decision.</li>
    <li><b>Train / validation / test</b>: fit parameters / compare models and choose hyperparameters (looked at many times) / report the final score once.</li>
    <li><b>Selection bias</b>: the best of many noisy scores is too good (best of 50 random models: 0.585 on validation, 0.487 on test).</li>
    <li><b>k-fold CV</b>: k folds, each validated once; the mean estimates the error of the procedure trained on (k − 1)/k of the data.</li>
    <li><b>LOOCV</b>: k = n. <b>Leverage</b> hᵢᵢ: how strongly row i pulls the fit towards itself.</li>
    <li><b>Stratified split</b>: each class (or target bin) split separately so every part has the same mix.</li>
    <li><b>Group split</b>: all rows of an entity on one side; measures performance on new entities.</li>
    <li><b>Time split</b>: train before a cut-off, test after; a <b>gap</b> removes rows whose targets or features overlap the cut.</li>
    <li><b>Repeated CV</b>: k-fold over several shuffles; removes partition luck, not data luck.</li>
    <li><b>Nested CV</b>: an outer CV loop scores the whole inner tuning procedure.</li>
  </ul>
  <h3>Which scheme when</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Scheme</th></tr>
    <tr><td>Huge data or slow model</td><td>single train / validation / test split (98/1/1 for millions)</td></tr>
    <tr><td>Small or medium data</td><td>test set + k-fold CV, k = 5 or 10</td></tr>
    <tr><td>Classification</td><td>stratified k-fold, shuffled with a seed</td></tr>
    <tr><td>Tiny data (n &lt; 50)</td><td>LOOCV (one-fit shortcut for linear models) or repeated k-fold</td></tr>
    <tr><td>Rows grouped by an entity new in production</td><td>GroupKFold / GroupShuffleSplit</td></tr>
    <tr><td>Rows ordered in time</td><td>chronological split, TimeSeriesSplit, with a gap</td></tr>
    <tr><td>Reporting a tuned model</td><td>nested CV, or inner CV + untouched test set</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Example</th></tr>
    <tr><td>SE of accuracy</td><td>√(p(1 − p) / n)</td><td>p = 0.9, n = 100 → 0.030</td></tr>
    <tr><td>Chance of no positive in the test set</td><td>C(N − P, t) / C(N, t)</td><td>C(6, 2) / C(10, 2) = 15 / 45</td></tr>
    <tr><td>k-fold estimate</td><td>(1/k) Σ sⱼ</td><td>(29.375 + 15.625 + 0.625 + 13.75 + 30.625) / 5 = 18.0</td></tr>
    <tr><td>Leverage (one feature)</td><td>1/n + (xᵢ − x̄)² / Σ(x − x̄)²</td><td>flat A: 0.1 + 20.25 / 82.5 = 0.3455</td></tr>
    <tr><td>LOO residual (least squares)</td><td>eᵢ / (1 − hᵢᵢ)</td><td>−2 / 0.6545 = −3.06; LOOCV MSE 7.25</td></tr>
    <tr><td>Nested CV fits</td><td>k_out × (candidates × k_in + 1)</td><td>5 × (4 × 4 + 1) = 85</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.model_selection import (train_test_split, StratifiedKFold, GroupKFold,
    TimeSeriesSplit, cross_val_score, cross_validate, GridSearchCV)

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_val_score(make_pipeline(StandardScaler(), model), X_tr, y_tr, cv=cv)
cross_val_score(model, X, y, cv=GroupKFold(5), groups=patient_id)
cross_val_score(model, X, y, cv=TimeSeriesSplit(n_splits=5, gap=7))
nested = cross_val_score(GridSearchCV(model, grid, cv=3), X, y, cv=5)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Never report training error or <code>best_score_</code> as the model's performance.</li>
    <li>Use the test set once; any decision based on it spoils it.</li>
    <li>Think in counts, not percentages: two flats measure nothing.</li>
    <li><code>cv=5</code> never shuffles; pass a splitter object.</li>
    <li>Preprocessing goes inside the pipeline, fitted per fold.</li>
    <li>Fold SD is a description of spread, not a standard error.</li>
    <li>Group split only if production meets new groups; time split for anything ordered.</li>
  </ul>

  <h2 id="ms-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you evaluate a model on its training data?</summary><div class="qa-body">Because the training score measures how well the model stored those rows, not how well it predicts new ones. A flexible model can memorise: an unlimited decision tree scores 100% in training even on random labels, where its test accuracy is 50%. Only rows the model did not see estimate generalisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the training, validation and test sets for?</summary><div class="qa-body">The training set fits the model's parameters. The validation set compares models and tunes hyperparameters, and is used many times. The test set is used once at the end to report an unbiased score of the final model. Keeping validation and test separate stops the reported score from being inflated by the choices made.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the validation score of the chosen model optimistic?</summary><div class="qa-body">Every score on a finite set contains luck. Choosing the best of many candidates on the same set picks the one with the best skill plus the best luck, so its score on that set is too good. Fifty random-guessing models had a best validation accuracy of 0.585, which fell to 0.487 on test. The effect grows with the number of candidates and shrinks with set size.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you decide how large the test set should be?</summary><div class="qa-body">By the number of rows needed for a precise enough score, not by a percentage. The standard error of an accuracy p on n rows is √(p(1 − p)/n): about ±0.03 at n = 100 and ±0.0095 at n = 1,000 for p = 0.9. For rare classes, size by the number of positives. With millions of rows, 1% is plenty; with tiny data, use cross-validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain k-fold cross-validation.</summary><div class="qa-body">Split the data into k equal folds; train on k − 1 of them and score on the remaining one; repeat so each fold is held out once; report the mean and spread of the k scores. Every row is used for both training and validation, so it uses data efficiently and is less dependent on one lucky split. It costs k fits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a cross-validation score actually estimate?</summary><div class="qa-body">The expected performance of the training procedure when trained on (k − 1)/k of the data, not the performance of one particular fitted model. The final model is refitted on all the data and is usually slightly better, so CV is mildly pessimistic, less so as k grows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose k? What are the trade-offs?</summary><div class="qa-body">Larger k means each fold trains on more data, so less pessimistic bias, but more fits and, for unstable models, sometimes more variance because the fold models are nearly identical. k = 5 or 10 is the usual default; LOO for tiny data with stable models; k = 3 or a single validation set for very large data or slow models.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is leave-one-out CV, and when is it a good or bad idea?</summary><div class="qa-body">k-fold with k = n: train on all rows but one and predict that one, n times. It has almost no bias and no randomness, and for least squares it needs only one fit (residual eᵢ / (1 − hᵢᵢ)). It is bad for large data without a shortcut, for metrics like AUC that need many rows per fold, and for unstable models whose LOO estimate can be noisy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stratified sampling, and when do you need it?</summary><div class="qa-body">Splitting each class separately so every part keeps the same class proportions. It is needed for classification, especially with rare classes: with 4 positives in 10 rows, a random 2-row test set has no positive one time in three. scikit-learn: <code>stratify=y</code> in <code>train_test_split</code>, <code>StratifiedKFold</code> for CV. For numeric targets, stratify on quantile bins.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is group k-fold, and what happens if you don't use it when you should?</summary><div class="qa-body">It keeps all rows of a group (patient, user, store) in the same fold, so the model is tested on groups it never saw. Without it the model can recognise the entity instead of learning the real pattern, and the score is inflated: 1.00 vs an honest 0.66 in the patient simulation. Use it when production will meet new entities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you validate a time-series model?</summary><div class="qa-body">Never shuffle. Train on the past and test on the future, with several cut-offs (TimeSeriesSplit, expanding or sliding window) and a gap when targets or features span time windows. Shuffled CV on trending sales reported MAE 4.8 versus an honest 13.2, because it turns forecasting into filling gaps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is nested cross-validation and why is it needed?</summary><div class="qa-body">An outer CV loop around the whole tuning procedure: each outer fold runs a full grid search with inner CV on the remaining data and scores the winner on the held-out outer fold. It is needed because the best CV score of a grid search is optimistically biased by selection. On 100 rows of pure noise, best_score_ was 0.58 while nested CV gave the true 0.50.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>After nested CV, which model do you deploy?</summary><div class="qa-body">The result of running the inner procedure on all the data: <code>GridSearchCV(...).fit(X, y).best_estimator_</code>. Nested CV scores the procedure; the outer folds may each pick different hyperparameters, so it does not produce a single model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is repeated k-fold, and what can't it fix?</summary><div class="qa-body">Running k-fold several times with different shuffles and averaging, which removes the luck of which rows share a fold and stabilises comparisons between close models. It cannot fix the luck of the dataset itself, and its many scores are not independent, so their standard error is not SD/√(number of scores).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must preprocessing happen inside the cross-validation loop?</summary><div class="qa-body">Steps that learn from data (scaling, imputing, feature selection, target encoding) would otherwise see the validation rows, leaking information into training and inflating the score. Wrapping them in a Pipeline and cross-validating the pipeline makes each fold fit its own preprocessing on its own training part.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does cv=5 do in cross_val_score, and why can it surprise you?</summary><div class="qa-body">For a classifier it means StratifiedKFold(5) and for a regressor KFold(5), both without shuffling. If the data is sorted by label, date or group, folds follow that order and can be badly unbalanced. Pass a shuffled splitter object explicitly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>cross_val_score vs cross_validate vs cross_val_predict?</summary><div class="qa-body">cross_val_score returns one metric per fold. cross_validate returns several metrics, optionally training scores, timings and the fitted models. cross_val_predict returns one out-of-fold prediction per row, useful for confusion matrices, plots and stacking, but not the right way to compute the CV score.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your validation score is much better than your test score. What could be wrong?</summary><div class="qa-body">Selection bias from tuning many candidates on a small validation set; leakage into validation (preprocessing on all data, duplicates or shared groups across the split); a distribution difference between validation and test (for example the test set is later in time); or simply noise if either set is small. Check sizes, splits, and the pipeline.</div></details>
</main>
`
});
