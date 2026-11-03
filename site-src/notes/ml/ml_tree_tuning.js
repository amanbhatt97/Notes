// notes/ml/ml_tree_tuning.js — Tuning & Production
Object.assign(TOPIC_CONTENT, {
  "ml_tree_tuning": `<main>
  <h1>Tuning &amp; Production</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>Tuning &amp; Production</span></div>
  <p class="lead">Each model note in this group explained one algorithm and its settings. This note is about turning any of them into a model you can trust and ship: choosing the settings without fooling yourself, deciding how many trees to grow, searching efficiently, turning probabilities into decisions when mistakes have different costs, making those probabilities honest, handling categories and business rules, and finally saving the model, keeping it fast and watching it after launch. In real projects these steps decide whether a model works in production far more often than the choice between XGBoost and LightGBM does. The small calculations use the running example of the whole tree group, the cricket captain's 14-day diary; every larger claim is run on the shared 20,000-customer churn table or a small purpose-built dataset, with real outputs.</p>

  <h2 id="mtt-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Tuning &amp; Production</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Choosing settings</div>
        <ul>
          <li>Hyperparameters are chosen on data the model did not train on</li>
          <li>The best of many scores is optimistic: keep a test set or use nested CV</li>
          <li>Boosters: learning rate + early stopping, then tree and leaf size</li>
          <li>Forests: max_features, leaf size; trees just "enough"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Searching</div>
        <ul>
          <li>Grid explodes; random covers important knobs better</li>
          <li>Successive halving: many candidates on small budgets</li>
          <li>Bayesian (Optuna / TPE): learns where to look</li>
          <li>Early stopping picks the number of trees</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Decisions</div>
        <ul>
          <li>Rare classes: PR-AUC, not accuracy</li>
          <li>Threshold = C_FP / (C_FP + C_FN)</li>
          <li>Calibrate (Platt, isotonic) before using probabilities as money</li>
          <li>Leak-free categories; monotone constraints; custom losses</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shipping</div>
        <ul>
          <li>Forests are big; boosters are small and fast</li>
          <li>Save in the library's own format; pin versions</li>
          <li>PSI = Σ (a − e) ln(a / e): &lt; 0.1 stable, &gt; 0.25 major shift</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mtt-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Tuning Is</span><span class="rm-sub">choosing a tree's depth for the diary</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-cv"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Validating Honestly</span><span class="rm-sub">holdout, cross-validation, nested CV</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-es"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Early Stopping</span><span class="rm-sub">letting validation choose the number of trees</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-knobs"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Which Knobs Matter</span><span class="rm-sub">per model, with runs and default recipes</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-search"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Search Strategies</span><span class="rm-sub">grid, random, halving, Bayesian</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-imb"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Rare Classes and Cost Thresholds</span><span class="rm-sub">from probabilities to decisions</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-cal"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Probability Calibration</span><span class="rm-sub">does 0.75 really mean 75%?</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-cat"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Categorical Columns</span><span class="rm-sub">one-hot, target encoding, native, CatBoost</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-rules"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Business Rules</span><span class="rm-sub">monotone constraints and custom losses</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-ship"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Size, Speed and Saving</span><span class="rm-sub">megabytes, milliseconds, files that reload</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-drift"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Monitoring and Drift</span><span class="rm-sub">noticing when the world changes</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">what costs teams the most</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">knobs, formulas, recipes, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">tuning and production questions</span></div></div>
    </div>
  </div>

  <h2 id="mtt-what"><span class="num">01</span>What Tuning Is</h2>
  <p>Every model in this group has settings you must choose before training starts: how deep a tree may grow, how many trees to build, how big a step each tree takes. Training cannot choose them for you, because the training data always prefers "deeper, more, bigger": a bigger model can always fit the training rows more closely, right up to memorising them. The good values depend on your data, so the only way to find them is to try candidates and judge each one on data the model did not train on.</p>
  <p>This gives two kinds of number. <strong>Parameters</strong> are learnt by training: the split columns, thresholds and leaf values of every tree. <strong>Hyperparameters</strong> are chosen before training and control how the parameters are learnt: <code>max_depth</code>, <code>n_estimators</code>, <code>learning_rate</code>, <code>min_samples_leaf</code> and so on. <strong>Tuning</strong>, or hyperparameter optimisation, is the search for the hyperparameters that give the best score on held-out data. Cooking biryani is a good picture of the difference. The rice absorbing water and spices is the training: it happens by itself once you start. The flame, the cooking time and the amount of water are the hyperparameters: you set them beforehand, and you only find the best values by cooking a few batches and tasting. Tasting from the pot you have been seasoning while cooking fools you; you need a fresh plate.</p>
  <p>Here is tuning in miniature on the diary. The model is a decision tree on the Outlook, Humidity and Wind columns, the hyperparameter is <code>max_depth</code>, and there are four candidates. Training accuracy cannot choose, so each candidate is judged by <strong>leave-one-day-out</strong>: train on 13 days, predict the 14th, and repeat until every day has been left out once.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.tree import DecisionTreeClassifier
from play import df
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)      # the diary's word columns as 0/1
y = (df.Play == "Yes").astype(int)
def loo(model):                     # leave-one-day-out: 14 fits, each scored on the day it did not see
    return np.mean([model.fit(X.drop(d), y.drop(d)).predict(X.loc[[d]])[0] == y[d] for d in X.index])
for depth in [1, 2, 3, None]:
    m = DecisionTreeClassifier(max_depth=depth, random_state=0)
    print(f"max_depth={str(depth):4s}  training acc {m.fit(X, y).score(X, y):.3f}   leave-one-day-out acc {loo(m):.3f}")</div>
  <div class="fx" data-lang="text">max_depth=1     training acc 0.643   leave-one-day-out acc 0.143
max_depth=2     training acc 0.857   leave-one-day-out acc 0.714
max_depth=3     training acc 0.857   leave-one-day-out acc 0.714
max_depth=None  training acc 1.000   leave-one-day-out acc 0.714</div>
  <p>Training accuracy rises with depth, from 0.643 to 1.000, and says nothing about new days. Leave-one-day-out says depth 1 is hopeless (a single question, re-chosen on every 13-day sample, gets only 2 of the 14 left-out days right) and that depths 2, 3 and unlimited are tied at 10 of 14. When candidates tie, take the simplest: depth 2. That is the whole idea of tuning: candidates, an honest score on rows not used for training, and a rule for choosing. Everything else in this note makes that loop bigger, faster and safer.</p>
  <p>Three facts shape what follows. First, a few knobs matter a lot and most matter a little, so the budget should go to the important ones (section 04). Second, the score of the winning candidate is optimistic: if you try a hundred settings and keep the best validation score, part of that score is luck (section 02). Third, tuning buys the last few points. On the churn data a default random forest and a carefully tuned booster differ by about half a point of AUC, while a leak, a wrong split or a missing feature can move the score by ten. Fix the data and the validation design first.</p>

  <h2 id="mtt-cv"><span class="num">02</span>Validating Honestly</h2>
  <p>Held-out data has two separate jobs: <strong>choosing</strong> the hyperparameters and <strong>reporting</strong> how good the final model is. If the same rows do both, the report is too optimistic, because you picked the setting that happened to do best on exactly those rows. It is like a teacher who sets an exam, lets the class practise on it, and then reports the marks on that same exam as the class's ability.</p>
  <p>The simplest design, the <strong>holdout</strong>, splits the data three ways: train on the training set, choose on the validation set, and report once on the test set. It is fine with ten thousand rows or more. <strong>k-fold cross-validation</strong> (CV) scores each candidate by averaging over k folds, each fold taking a turn as the validation part, which is less noisy than one validation set; scikit-learn's <code>GridSearchCV(cv=5)</code> does this, and you still need a test set at the end. When rows are linked, the folds must respect that: the rows of one customer belong in one fold (<code>GroupKFold</code>), and for time series the model must always train on the past and validate on the future (<code>TimeSeriesSplit</code>). A wrong split leaks more than any tuning can gain.</p>
  <p>On small data, setting aside a test set is costly, and that is where <strong>nested cross-validation</strong> is used. An outer loop of 5 folds is used only for reporting. Inside each outer training part, an inner 5-fold CV runs the whole tuning and picks a winner; the winner is retrained on that outer training part and scored on the outer fold it never saw. The five outer scores are honest, because those rows took no part in choosing. Nested CV may pick different settings in different outer folds; that is fine, because what it measures is how good <em>the whole procedure of tuning and then training</em> is, not one particular setting. The churn table, shared by every note in this group and imported below as <code>churn</code>, provides the rows:</p>
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
  <p>The experiment takes only 800 training rows, because small data makes the optimism easy to see, and tunes a decision tree over 96 settings:</p>
  <div class="fx" data-lang="py">from churn import Xtr, ytr, Xte, yte
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import GridSearchCV, cross_val_score, StratifiedKFold
Xs, ys = Xtr.iloc[:800], ytr[:800]                      # small data makes the optimism easy to see
grid = {"max_depth": [2, 3, 4, 5, 6, 8, 10, None], "min_samples_leaf": [1, 2, 5, 10, 20, 40],
        "criterion": ["gini", "entropy"]}               # 8 * 6 * 2 = 96 settings
inner = StratifiedKFold(5, shuffle=True, random_state=1)
outer = StratifiedKFold(5, shuffle=True, random_state=2)
gs = GridSearchCV(DecisionTreeClassifier(random_state=0), grid, cv=inner).fit(Xs, ys)
print(f"non-nested: best CV accuracy of 96 settings = {gs.best_score_:.3f}  {gs.best_params_}")
nested = cross_val_score(GridSearchCV(DecisionTreeClassifier(random_state=0), grid, cv=inner), Xs, ys, cv=outer)
print(f"nested CV : outer-fold scores {nested.round(3).tolist()}  mean {nested.mean():.3f}")
print(f"fresh data: the tuned tree on 5,000 test rows = {gs.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">non-nested: best CV accuracy of 96 settings = 0.732  {'criterion': 'entropy', 'max_depth': 5, 'min_samples_leaf': 5}
nested CV : outer-fold scores [0.756, 0.656, 0.725, 0.681, 0.706]  mean 0.705
fresh data: the tuned tree on 5,000 test rows = 0.723</div>
  <p>The best of 96 settings scores 0.732 in its own cross-validation. Nested CV reports about 0.705, with outer folds ranging widely, as small data always does. Fresh data, the 5,000 test rows, gives 0.723. So the non-nested number was optimistic, and nested CV was slightly pessimistic here because each outer fold trained on only 640 rows; the truth sits between them, and the gap shrinks as data grows. The cost is high: 5 outer folds × 96 settings × 5 inner folds = 2,400 fits instead of 480. See <a class="xref" data-note="ml_core">Core Concepts</a> and <a class="xref" data-note="ml_evaluation">Model Evaluation</a> for the basics of cross-validation.</p>
  <p>One rule applies to every design: any step that learns from data must happen inside the training folds. That includes scaling, filling missing values, target encoding, feature selection, oversampling and early stopping. Putting these steps in a <code>Pipeline</code> makes <code>GridSearchCV</code> refit them in every fold (see <a class="xref" data-note="ml_pipelines">Pipelines</a>). Selecting features on all the rows and then cross-validating is a classic leak that makes useless features look useful.</p>

  <h2 id="mtt-es"><span class="num">03</span>Early Stopping</h2>
  <p>One hyperparameter of a booster is special: the number of trees, also called rounds. A booster adds trees one at a time, each fitting what is left of the training error. After some point what is left is mostly noise, and the validation loss starts to rise. The right number of rounds depends on the learning rate, the tree size and the data, so it would have to be searched again for every combination of the other settings. <strong>Early stopping</strong> finds it during a single training run: after each round, compute the loss on a validation set and remember the best so far; if it has not improved for <em>patience</em> rounds in a row, stop and keep the model from the best round.</p>
  <p>Here is the rule on a made-up but typical sequence (14 diary days are too few for a meaningful validation curve), with patience 3 and validation losses 0.52, 0.47, 0.44, 0.43, 0.431, 0.433, 0.436:</p>
  <table class="tbl">
    <tr><th>round</th><th>validation loss</th><th>best so far</th><th>rounds without improvement</th><th>action</th></tr>
    <tr><td>1–4</td><td>0.52, 0.47, 0.44, 0.43</td><td>0.43 (round 4)</td><td>0</td><td>continue</td></tr>
    <tr><td>5</td><td>0.431</td><td>0.43 (round 4)</td><td>1</td><td>continue</td></tr>
    <tr><td>6</td><td>0.433</td><td>0.43 (round 4)</td><td>2</td><td>continue</td></tr>
    <tr><td>7</td><td>0.436</td><td>0.43 (round 4)</td><td>3</td><td>stop; keep 4 rounds</td></tr>
  </table>
  <p>Patience exists because validation loss is noisy and one bad round should not end training; at a learning rate of 0.05, a patience of 50 to 200 rounds is typical. To see what happens without it, the code trains a LightGBM booster for 3,000 rounds with no stopping and records the training and validation <strong>log loss</strong> (the average of −log of the probability given to the true class, so lower is better) after every round:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from churn import Xtr, ytr, Xva, yva
m = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.1, num_leaves=63, verbose=-1, random_state=0)
m.fit(Xtr, ytr, eval_set=[(Xtr, ytr), (Xva, yva)], eval_names=["train", "val"])   # no early stopping
tr = m.evals_result_["train"]["binary_logloss"]                  # log loss after every round
va = m.evals_result_["val"]["binary_logloss"]
best = int(np.argmin(va)) + 1
for r in [10, 50, 100, best, 500, 1000, 3000]:
    print(f"round {r:4d}  train logloss {tr[r-1]:.3f}  val logloss {va[r-1]:.3f}")
print("best round (lowest validation loss):", best)</div>
  <div class="fx" data-lang="text">round   10  train logloss 0.449  val logloss 0.464
round   50  train logloss 0.250  val logloss 0.332
round  100  train logloss 0.173  val logloss 0.317
round  204  train logloss 0.086  val logloss 0.308
round  500  train logloss 0.013  val logloss 0.347
round 1000  train logloss 0.000  val logloss 0.465
round 3000  train logloss 0.000  val logloss 0.752
best round (lowest validation loss): 204</div>
  <figure class="viz"><svg viewBox="0 0 560 235" width="560">
<line x1="50" y1="200" x2="515" y2="200" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="200" stroke="currentColor"/>
<text x="44" y="204" text-anchor="end" class="tm" font-size="11">0</text><text x="44" y="156" text-anchor="end" class="tm" font-size="11">0.2</text><text x="44" y="108" text-anchor="end" class="tm" font-size="11">0.4</text><text x="44" y="60" text-anchor="end" class="tm" font-size="11">0.6</text>
<text x="50" y="216" text-anchor="middle" class="tm" font-size="11">1</text><text x="234" y="216" text-anchor="middle" class="tm" font-size="11">400</text><text x="418" y="216" text-anchor="middle" class="tm" font-size="11">800</text><text x="510" y="216" text-anchor="middle" class="tm" font-size="11">1000</text>
<text x="280" y="232" text-anchor="middle" class="tm" font-size="12">boosting round (LightGBM, learning rate 0.1, 63 leaves)</text>
<polyline points="50,44 50,52 51,59 51,66 52,71 52,76 53,81 53,85 54,89 54,92 56,105 59,115 61,122 63,127 66,131 68,135 70,137 73,140 75,142 77,145 79,147 82,149 84,150 86,152 89,154 91,156 93,157 96,159 100,161 109,166 119,171 128,174 137,177 146,180 155,182 165,184 174,186 183,188 192,189 201,191 211,192 220,193 229,194 238,195 248,195 257,196 266,196 275,197 284,197 294,198 303,198 312,198 321,198 330,199 340,199 349,199 358,199 367,199 376,199 386,199 395,199 404,199 413,200 423,200 432,200 441,200 450,200 459,200 469,200 478,200 487,200 496,200 505,200" fill="none" class="sb" stroke-width="2"/>
<polyline points="50,43 50,51 51,58 51,64 52,69 52,74 53,79 53,82 54,86 54,89 56,100 59,108 61,113 63,116 66,118 68,119 70,120 73,120 75,121 77,121 79,122 82,122 84,122 86,122 89,123 91,123 93,124 96,124 100,124 109,124 119,125 128,126 137,126 146,126 155,126 165,125 174,125 183,124 192,124 201,124 211,123 220,122 229,121 238,120 248,119 257,119 266,118 275,117 284,116 294,116 303,115 312,114 321,113 330,112 340,111 349,110 358,109 367,108 376,106 386,105 395,104 404,103 413,102 423,101 432,99 441,98 450,96 459,95 469,94 478,93 487,92 496,90 505,89" fill="none" class="sr" stroke-width="2"/>
<line x1="143" y1="25" x2="143" y2="200" class="sg" stroke-dasharray="4 3" stroke-width="2"/>
<text x="150" y="40" class="tg" font-size="12">best round 204: validation 0.308</text>
<text x="390" y="78" class="tr" font-size="12">validation ↑ 0.465</text>
<text x="400" y="190" class="tb" font-size="12">training → 0.000</text>
<text x="56" y="30" class="tm" font-size="11">log loss</text>
</svg><figcaption>Training loss (blue) keeps falling towards zero; validation loss (red) bottoms out at round 204 and then climbs as the model fits noise. The first 1,000 of the 3,000 rounds are shown.</figcaption></figure>
  <p>Follow the two lines in the figure. The blue training loss falls steadily and reaches zero: the model ends up memorising every training customer. The red validation loss falls at first, reaches its lowest point at the round marked by the dashed line, and then climbs, slowly at first and then steadily, as each new tree fits noise. By round 3,000 the validation loss is more than twice its best value, so a model taken at the end is far worse than the one at the best round, and early stopping would simply have kept that best one. Every library supports it:</p>
  <table class="tbl">
    <tr><th>Library</th><th>Early stopping</th><th>Best round</th></tr>
    <tr><td>XGBoost</td><td><code>XGBClassifier(early_stopping_rounds=100)</code>, <code>fit(X, y, eval_set=[(Xva, yva)])</code></td><td><code>best_iteration</code></td></tr>
    <tr><td>LightGBM</td><td><code>fit(X, y, eval_set=[(Xva, yva)], callbacks=[lgb.early_stopping(100)])</code></td><td><code>best_iteration_</code></td></tr>
    <tr><td>CatBoost</td><td><code>CatBoostClassifier(early_stopping_rounds=100)</code>, <code>fit(X, y, eval_set=(Xva, yva))</code></td><td><code>get_best_iteration()</code></td></tr>
    <tr><td>HistGradientBoosting</td><td><code>early_stopping=True, n_iter_no_change=10, validation_fraction=0.1</code></td><td><code>n_iter_</code></td></tr>
  </table>
  <p>A single validation split gives a noisy best round. <code>lgb.cv</code> (and <code>xgb.cv</code>) run k folds side by side and stop when the <em>average</em> fold loss stops improving. You then refit on all the training data with that many rounds, or a little more, since the final fit sees more rows:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
from churn import Xtr, ytr, Xva, yva, Xte, yte
from sklearn.metrics import roc_auc_score
params = {"objective": "binary", "learning_rate": 0.05, "num_leaves": 31, "verbose": -1, "seed": 0}
cvres = lgb.cv(params, lgb.Dataset(Xtr, ytr), num_boost_round=3000, nfold=5, stratified=True, seed=0,
               callbacks=[lgb.early_stopping(50, verbose=False)])
best = len(cvres["valid binary_logloss-mean"])
print(f"5-fold CV early stopping: best rounds {best}, mean CV logloss {cvres['valid binary_logloss-mean'][-1]:.4f}")
Xall, yall = pd.concat([Xtr, Xva]), np.concatenate([ytr, yva])
for rounds in [best, int(best * 1.15)]:
    m = lgb.train(params, lgb.Dataset(Xall, yall), num_boost_round=rounds)
    print(f"refit on train+val with {rounds} rounds -&gt; test AUC {roc_auc_score(yte, m.predict(Xte)):.4f}")</div>
  <div class="fx" data-lang="text">5-fold CV early stopping: best rounds 587, mean CV logloss 0.3399
refit on train+val with 587 rounds -&gt; test AUC 0.9385
refit on train+val with 675 rounds -&gt; test AUC 0.9389</div>
  <p>Five-fold CV picks 587 rounds, and refitting on train plus validation with 587 or 15% more rounds gives almost the same test AUC: near the best point the exact count matters little, which is why "about right" is good enough. One caution: the validation rows used for early stopping helped choose the model, so their score is optimistic too, and when early stopping runs inside a hyperparameter search, its validation rows must never be the test rows.</p>

  <h2 id="mtt-knobs"><span class="num">04</span>Which Knobs Matter</h2>
  <p>A booster has a dozen or more hyperparameters, and searching all of them wastes the budget. It helps to know that every knob does one of three jobs. Some make each tree <strong>simpler</strong> (lower variance, higher bias): maximum depth, number of leaves, minimum rows per leaf. Some make the trees <strong>different from each other</strong>, which helps averaging and slows over-fitting: the share of columns or rows each tree sees. And in boosting some control <strong>how much each tree contributes</strong>: the learning rate and the number of rounds. The table lists the knobs worth knowing per model, with how much they usually matter.</p>
  <div style="overflow-x:auto"><table class="tbl">
    <tr><th>Model</th><th>Knob</th><th>Impact</th><th>Raising it…</th><th>Typical range</th></tr>
    <tr><td rowspan="3"><a class="xref" data-note="ml_dtree">Decision tree</a></td><td><code>max_depth</code></td><td>high</td><td>more complex: lower bias, higher variance</td><td>3–15</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>high</td><td>smoother tree, less over-fitting</td><td>1–100</td></tr>
    <tr><td><code>ccp_alpha</code></td><td>high</td><td>more pruning, smaller tree</td><td>from <code>cost_complexity_pruning_path</code></td></tr>
    <tr><td rowspan="3"><a class="xref" data-note="ml_rf">Random forest</a> / <a class="xref" data-note="ml_extratrees">Extra Trees</a></td><td><code>max_features</code></td><td>medium–high</td><td>trees more alike, each stronger</td><td>sqrt, 0.3–0.5</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>medium</td><td>smaller model, can cost accuracy</td><td>1–10</td></tr>
    <tr><td><code>n_estimators</code></td><td>low after ~200</td><td>lower variance, never over-fits, slower</td><td>300–1000</td></tr>
    <tr><td rowspan="4"><a class="xref" data-note="ml_gbm">Gradient boosting</a> (sklearn, HistGB)</td><td><code>learning_rate</code></td><td>highest</td><td>fewer trees needed, over-fits sooner</td><td>0.01–0.1</td></tr>
    <tr><td><code>n_estimators</code> / <code>max_iter</code></td><td>highest</td><td>let early stopping choose</td><td>up to thousands</td></tr>
    <tr><td><code>max_depth</code> / <code>max_leaf_nodes</code></td><td>high</td><td>deeper interactions per tree</td><td>depth 3–8, 15–63 leaves</td></tr>
    <tr><td><code>min_samples_leaf</code>, <code>subsample</code></td><td>medium</td><td>smoother leaves; random rows per tree</td><td>20–200; 0.5–0.9</td></tr>
    <tr><td rowspan="4"><a class="xref" data-note="ml_xgboost">XGBoost</a></td><td><code>learning_rate</code> + rounds</td><td>highest</td><td>as above, always with early stopping</td><td>0.01–0.1</td></tr>
    <tr><td><code>max_depth</code></td><td>high</td><td>interaction order, complexity</td><td>4–10</td></tr>
    <tr><td><code>min_child_weight</code></td><td>medium–high</td><td>blocks leaves with too little Hessian (too few rows)</td><td>1–20</td></tr>
    <tr><td><code>subsample</code>, <code>colsample_bytree</code>, <code>gamma</code>, <code>lambda</code>, <code>alpha</code></td><td>low–medium</td><td>random rows/columns; minimum gain; L2/L1 on leaf values</td><td>0.6–0.9; 0–5; 0–10</td></tr>
    <tr><td rowspan="3"><a class="xref" data-note="ml_lightgbm">LightGBM</a></td><td><code>learning_rate</code> + rounds</td><td>highest</td><td>as above</td><td>0.01–0.1</td></tr>
    <tr><td><code>num_leaves</code></td><td>high</td><td>main complexity knob for leaf-wise trees</td><td>15–255</td></tr>
    <tr><td><code>min_child_samples</code>, <code>feature_fraction</code>, <code>bagging_fraction</code></td><td>medium</td><td>blocks tiny leaves; random columns/rows</td><td>20–200; 0.6–0.9</td></tr>
    <tr><td rowspan="2"><a class="xref" data-note="ml_catboost">CatBoost</a></td><td><code>learning_rate</code> + <code>iterations</code>, <code>depth</code></td><td>high</td><td>as above; symmetric tree depth</td><td>0.02–0.1; 4–10</td></tr>
    <tr><td><code>l2_leaf_reg</code></td><td>medium</td><td>shrinks leaf values</td><td>1–10</td></tr>
  </table></div>
  <p>The diary cannot show which knobs matter, so this section works on churn. First the random forest, one knob at a time:</p>
  <div class="fx" data-lang="py">from churn import Xtr, ytr, Xva, yva
from sklearn.ensemble import RandomForestClassifier
def rf(**kw):
    return RandomForestClassifier(**{"n_estimators": 200, "n_jobs": 2, "random_state": 0, **kw}).fit(Xtr, ytr)
for mf in [1, "sqrt", 7, None]:
    print(f"max_features={str(mf):5s}      val acc {rf(max_features=mf).score(Xva, yva):.3f}")
for leaf in [1, 5, 20, 100]:
    m = rf(min_samples_leaf=leaf)
    print(f"min_samples_leaf={leaf:&lt;4d} train acc {m.score(Xtr, ytr):.3f}  val acc {m.score(Xva, yva):.3f}")
for n in [10, 50, 200, 500]:
    print(f"n_estimators={n:&lt;4d}     val acc {rf(n_estimators=n).score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">max_features=1          val acc 0.844
max_features=sqrt       val acc 0.881
max_features=7          val acc 0.885
max_features=None       val acc 0.885
min_samples_leaf=1    train acc 1.000  val acc 0.881
min_samples_leaf=5    train acc 0.963  val acc 0.873
min_samples_leaf=20   train acc 0.897  val acc 0.858
min_samples_leaf=100  train acc 0.825  val acc 0.816
n_estimators=10       val acc 0.847
n_estimators=50       val acc 0.872
n_estimators=200      val acc 0.881
n_estimators=500      val acc 0.879</div>
  <p>Using one random column per split is too random; the default √14 ≈ 3 is good, and 7 or all 14 columns are a little better on this data, because stronger, more alike trees win slightly here. That is why <code>max_features</code> is worth trying at a few values. Larger leaves smooth every tree and steadily lose accuracy, while making the model much smaller (section 10): forests rely on deep trees and let the averaging handle the variance. More trees help up to about 200 and then the score is flat within noise. More trees never hurt a forest's accuracy; they only cost time and memory.</p>
  <p>Next the two knobs that matter most for any booster, the learning rate and the tree size, changed one at a time on LightGBM, with early stopping choosing the number of trees for every run:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from churn import Xtr, ytr, Xva, yva, Xte, yte
def fit(**kw):                                  # early stopping picks the number of trees every time
    m = lgb.LGBMClassifier(n_estimators=5000, verbose=-1, random_state=0, **kw)
    return m.fit(Xtr, ytr, eval_set=[(Xva, yva)], callbacks=[lgb.early_stopping(100, verbose=False)])
for lr in [0.3, 0.1, 0.03]:
    m = fit(learning_rate=lr, num_leaves=31)
    print(f"learning_rate={lr:&lt;5} best trees {m.best_iteration_:5d}  test acc {m.score(Xte, yte):.3f}")
for nl in [4, 15, 63, 255]:
    m = fit(learning_rate=0.05, num_leaves=nl)
    print(f"num_leaves={nl:&lt;4d}   best trees {m.best_iteration_:5d}  train acc {m.score(Xtr, ytr):.3f}  test acc {m.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">learning_rate=0.3   best trees    68  test acc 0.851
learning_rate=0.1   best trees   216  test acc 0.869
learning_rate=0.03  best trees  1154  test acc 0.874
num_leaves=4      best trees  3476  train acc 0.913  test acc 0.851
num_leaves=15     best trees  1116  train acc 0.966  test acc 0.864
num_leaves=63     best trees   418  train acc 0.996  test acc 0.877
num_leaves=255    best trees   124  train acc 1.000  test acc 0.873</div>
  <p>A learning rate ten times smaller needed many times more trees and gained a couple of points of accuracy: small steps average out the noise of each tree, and the price is training time. With 4 leaves each tree cannot combine enough columns, and even thousands of trees fall short; with 255 leaves the model memorises the training rows within a hundred or so rounds and slips on test; a middle size such as 63 leaves is the sweet spot here. The lesson is that the learning rate and the number of trees are one knob in disguise, since their product is roughly how far the model moves. Fix the learning rate (0.05 is a good default), let early stopping choose the trees, and spend the search on tree size, leaf size and sampling. Searching <code>n_estimators</code> of a booster in a grid without early stopping wastes the budget, and tuning <code>n_estimators</code> of a forest at all is mostly pointless.</p>
  <p>Because a few knobs dominate, sensible defaults go a long way. The recipes below are good starting points on most tables: start here, check the validation score, and only then tune the knobs marked high in the table above.</p>
  <table class="tbl">
    <tr><th>Model</th><th>Start with</th><th>Then tune</th></tr>
    <tr><td>Decision tree</td><td><code>ccp_alpha</code> from the pruning path by CV, <code>min_samples_leaf</code> 5–20</td><td><code>max_depth</code>, <code>min_samples_leaf</code></td></tr>
    <tr><td>Random forest</td><td>500 trees, <code>max_features="sqrt"</code>, <code>min_samples_leaf=1</code></td><td><code>max_features</code>, <code>min_samples_leaf</code></td></tr>
    <tr><td>HistGradientBoosting</td><td>learning rate 0.05, many iterations with early stopping, 31 leaves</td><td><code>max_leaf_nodes</code>, <code>min_samples_leaf</code></td></tr>
    <tr><td>XGBoost</td><td>learning rate 0.05, early stopping 100, depth 6, subsample and colsample 0.8</td><td>depth, <code>min_child_weight</code>, sampling, λ</td></tr>
    <tr><td>LightGBM</td><td>learning rate 0.05, early stopping 100, 31 leaves, bagging and feature fraction 0.8</td><td><code>num_leaves</code>, <code>min_child_samples</code>, sampling</td></tr>
    <tr><td>CatBoost</td><td>learning rate 0.05, early stopping 100, depth 6, <code>cat_features</code> set</td><td>depth, <code>l2_leaf_reg</code></td></tr>
  </table>
  <div class="fx" data-lang="py">import time, numpy as np, xgboost as xgb, lightgbm as lgb
from catboost import CatBoostClassifier
from churn import Xtr, ytr, Xva, yva, Xte, yte
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
recipes = {
  "Decision tree": (DecisionTreeClassifier(min_samples_leaf=5, ccp_alpha=3e-4, random_state=0), {}),
  "Random forest": (RandomForestClassifier(n_estimators=500, max_features="sqrt", n_jobs=2, random_state=0), {}),
  "HistGradientBoosting": (HistGradientBoostingClassifier(learning_rate=0.05, max_iter=3000, max_leaf_nodes=31,
                           l2_regularization=1.0, early_stopping=True, n_iter_no_change=100, random_state=0), {}),
  "XGBoost": (xgb.XGBClassifier(n_estimators=5000, learning_rate=0.05, max_depth=6, subsample=0.8,
              colsample_bytree=0.8, early_stopping_rounds=100, n_jobs=1, random_state=0),
              {"eval_set": [(Xva, yva)], "verbose": False}),
  "LightGBM": (lgb.LGBMClassifier(n_estimators=5000, learning_rate=0.05, num_leaves=31, subsample=0.8, subsample_freq=1,
               colsample_bytree=0.8, verbose=-1, random_state=0),
               {"eval_set": [(Xva, yva)], "callbacks": [lgb.early_stopping(100, verbose=False)]}),
  "CatBoost": (CatBoostClassifier(iterations=5000, learning_rate=0.05, depth=6, early_stopping_rounds=100,
               verbose=False, random_seed=0), {"eval_set": (Xva, yva)}),
}
for name, (m, fit_kw) in recipes.items():
    t0 = time.time(); m.fit(Xtr, ytr, **fit_kw)
    p = m.predict_proba(Xte)[:, 1]
    print(f"{name:21s} test acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.3f}  fit {time.time()-t0:5.1f}s")</div>
  <div class="fx" data-lang="text">Decision tree         test acc 0.810  AUC 0.870  fit   1.1s
Random forest         test acc 0.877  AUC 0.937  fit  56.1s
HistGradientBoosting  test acc 0.869  AUC 0.935  fit  17.9s
XGBoost               test acc 0.870  AUC 0.936  fit  24.0s
LightGBM              test acc 0.874  AUC 0.936  fit  17.7s
CatBoost              test acc 0.874  AUC 0.938  fit  67.2s</div>
  <p>With no search at all, every ensemble recipe lands within a few thousandths of AUC of the others, and the single tree shows what the ensembles buy. From here, tuning is worth at most a few tenths of a point on this data; on harder data, with more rows, more interactions and more categories, the boosters usually pull ahead once tree size and sampling are tuned. (Fit times are approximate and come from a busy shared machine.)</p>

  <h2 id="mtt-search"><span class="num">05</span>Search Strategies</h2>
  <p>With the important knobs known and an honest score for each candidate, the remaining question is which candidates to try within a budget. <strong>Grid search</strong> lists a few values for each knob and tries every combination. With <code>num_leaves</code> in {15, 63}, <code>min_child_samples</code> in {10, 50}, <code>colsample_bytree</code> in {0.6, 1.0} and <code>reg_lambda</code> in {0, 5}, that is 2 × 2 × 2 × 2 = 16 combinations, or 48 fits with 3-fold CV. One more knob with 4 values makes it 64 combinations. Grids grow exponentially with the number of knobs, and they waste trials: if only <code>num_leaves</code> really matters, 16 trials have tested just 2 values of it.</p>
  <p><strong>Random search</strong> draws each knob from a range (on a log scale for knobs like the learning rate or λ, whose useful values span several powers of ten) for a fixed number of trials. Every trial tries a new value of every knob, so the important knob gets 16 different values in 16 trials. There is a neat argument for it (Bergstra and Bengio, 2012): if the best 5% of all settings count as "good", each random trial lands there with probability 0.05, so n trials all miss with probability 0.95ⁿ. For n = 60 that is 0.046, a 95% chance of at least one good trial, however many knobs there are. Think of looking for the best street food in a new city: a grid eats at every stall on four fixed streets, while a random search eats at stalls spread across the whole city, and if the best stall is on a street the grid never visits, the grid can never find it.</p>
  <p><strong>Successive halving</strong> uses the fact that most bad settings look bad early. Start many candidates on a small budget, keep the best third, give the survivors three times more budget, and repeat. With 48 candidates and a budget measured in training rows starting at 1,000: round 1 trains 48 candidates on 1,000 rows, round 2 the best 16 on 3,000, round 3 the best 6 on 9,000. That is about as much work as a dozen full fits, for 48 candidates. <strong>Hyperband</strong> runs several such brackets with different starting budgets, in case some good settings start slowly.</p>
  <p><strong>Bayesian optimisation</strong> learns from earlier trials, which grid and random search ignore. It keeps a model of "score as a function of the hyperparameters" built from past trials and picks the next trial where improvement looks most likely. Optuna's default method, <strong>TPE</strong> (Tree-structured Parzen Estimator), splits the past trials into the best 10–25% ("good") and the rest ("bad"), estimates for each knob how its values are spread among good trials, l(x), and among bad ones, g(x), and proposes the value with the largest ratio l(x) / g(x): values common among good trials and rare among bad ones. The first ten or so trials are random, to get started. Optuna can also <strong>prune</strong> trials whose intermediate scores look hopeless.</p>
  <p>Grid, random and halving search on churn, all with LightGBM at learning rate 0.05 and 200 trees, 3-fold CV on the training rows, the winner refitted on all of them and scored once on the test set:</p>
  <div class="fx" data-lang="py">import time, lightgbm as lgb
from scipy.stats import randint, uniform, loguniform
from churn import Xtr, ytr, Xte, yte
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, StratifiedKFold
from sklearn.experimental import enable_halving_search_cv
from sklearn.model_selection import HalvingRandomSearchCV
from sklearn.metrics import roc_auc_score
cv = StratifiedKFold(3, shuffle=True, random_state=0)
base = lgb.LGBMClassifier(n_estimators=200, learning_rate=0.05, verbose=-1, random_state=0)
show = lambda d: {k: round(float(v), 3) if isinstance(v, float) else int(v) for k, v in sorted(d.items())}
def report(name, s, t0):
    print(f"{name:8s} best CV AUC {s.best_score_:.4f}  test AUC {roc_auc_score(yte, s.predict_proba(Xte)[:, 1]):.4f}"
          f"  {time.time()-t0:.0f}s  {show(s.best_params_)}")
grid = {"num_leaves": [15, 63], "min_child_samples": [10, 50],
        "colsample_bytree": [0.6, 1.0], "reg_lambda": [0.0, 5.0]}            # 2*2*2*2 = 16 settings
t0 = time.time(); report("grid", GridSearchCV(base, grid, cv=cv, scoring="roc_auc").fit(Xtr, ytr), t0)
dist = {"num_leaves": randint(8, 256), "min_child_samples": randint(5, 100),
        "colsample_bytree": uniform(0.5, 0.5), "reg_lambda": loguniform(1e-3, 10)}
t0 = time.time()
report("random", RandomizedSearchCV(base, dist, n_iter=16, cv=cv, scoring="roc_auc", random_state=0).fit(Xtr, ytr), t0)
t0 = time.time()
hs = HalvingRandomSearchCV(base, dist, n_candidates=48, factor=3, resource="n_samples", min_resources=1000,
                           cv=cv, scoring="roc_auc", random_state=0).fit(Xtr, ytr)
print(f"halving: candidates per round {list(hs.n_candidates_)} on {list(hs.n_resources_)} rows")
report("halving", hs, t0)</div>
  <div class="fx" data-lang="text">grid     best CV AUC 0.9303  test AUC 0.9366  185s  {'colsample_bytree': 1.0, 'min_child_samples': 10, 'num_leaves': 63, 'reg_lambda': 0.0}
random   best CV AUC 0.9333  test AUC 0.9392  150s  {'colsample_bytree': 0.985, 'min_child_samples': 16, 'num_leaves': 182, 'reg_lambda': 0.027}
halving: candidates per round [48, 16, 6] on [1000, 3000, 9000] rows
halving  best CV AUC 0.9279  test AUC 0.9398  161s  {'colsample_bytree': 0.988, 'min_child_samples': 26, 'num_leaves': 209, 'reg_lambda': 0.001}</div>
  <p>With the same budget of 16 settings, random search finds a better region than the grid, because <code>num_leaves</code> got 16 different values instead of 2, including much larger trees than the grid allowed. Successive halving examines three times as many candidates for a similar cost. (Its "best CV" is computed on the smaller last-round fits, so it is not directly comparable.) Notice that all the test scores differ by only a few thousandths of AUC: the score surface is flat near the top, so many settings are nearly as good, and the default recipe of section 04 is already close.</p>
  <p>For Bayesian search, the objective function trains one model with the values Optuna suggests, uses early stopping on the validation set so that each trial finds its own number of trees, and returns the validation AUC. Optuna is not installed in the environment used for this page, so this code is shown checked for syntax only, without output:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb, optuna
from churn import Xtr, ytr, Xva, yva
from sklearn.metrics import roc_auc_score
def objective(trial):
    params = {"num_leaves": trial.suggest_int("num_leaves", 8, 256, log=True),
              "min_child_samples": trial.suggest_int("min_child_samples", 5, 100),
              "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
              "reg_lambda": trial.suggest_float("reg_lambda", 1e-3, 10, log=True)}
    m = lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.05, verbose=-1, **params)
    m.fit(Xtr, ytr, eval_set=[(Xva, yva)], callbacks=[lgb.early_stopping(50, verbose=False)])
    trial.set_user_attr("trees", m.best_iteration_)          # each trial finds its own number of trees
    return roc_auc_score(yva, m.predict_proba(Xva)[:, 1])
study = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=0))
study.optimize(objective, n_trials=30)
print(study.best_value, study.best_params, study.best_trial.user_attrs["trees"])</div>

  <p>The same caution applies to every search: the best validation score of 30 trials is optimistic, because those validation rows chose the winner (and its number of trees), so refit the winner and report it on the untouched test set. And the search ranges matter more than the search method: use log scales for the learning rate, λ and α (0.001 to 10, not 0 to 10 in equal steps), keep <code>num_leaves</code> below 2^<code>max_depth</code>, and widen a range when the best value lands on its edge.</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>Learns from past trials?</th><th>Strength</th><th>Weakness</th><th>Use when</th></tr>
    <tr><td>Grid</td><td>no</td><td>simple, exhaustive, reproducible</td><td>explodes with knobs; wastes trials</td><td>1–2 knobs</td></tr>
    <tr><td>Random</td><td>no</td><td>covers important knobs well; parallel</td><td>keeps sampling bad regions</td><td>default for 3+ knobs</td></tr>
    <tr><td>Halving / Hyperband</td><td>partly (drops losers)</td><td>many candidates cheaply</td><td>small budgets can mis-rank slow starters</td><td>expensive models, big spaces</td></tr>
    <tr><td>Bayesian (TPE)</td><td>yes</td><td>fewest trials for a good result; pruning</td><td>sequential; more machinery</td><td>costly trials, 20–200 of them</td></tr>
  </table>

  <h2 id="mtt-imb"><span class="num">06</span>Rare Classes and Cost Thresholds</h2>
  <p>So far every model predicted a probability and we turned it into a decision at 0.5. That rule quietly assumes two things: that both kinds of mistake cost the same, and that the classes are roughly balanced. In real problems neither is usually true. Fraud may be 1 transaction in 1,000; serious churn may be 5 customers in 100. A model that always says "no" then scores 95% to 99.9% accuracy and is useless.</p>
  <p>Start with costs. A <strong>false positive</strong> is acting when you should not have; a <strong>false negative</strong> is failing to act when you should have. If a false positive costs C_FP and a false negative C_FN, acting on a case with probability p of being positive costs (1 − p) · C_FP on average, and not acting costs p · C_FN, so you should act whenever p · C_FN &gt; (1 − p) · C_FP, which rearranges to p &gt; C_FP / (C_FP + C_FN). That is the cost-based <strong>threshold</strong>. On the diary, the captain must book the ground each morning. A booking nobody uses costs ₹500 (a false positive); a league match forfeited because nothing was booked costs ₹3,000 (a false negative). So he should book whenever P(play) &gt; 500 / 3,500 = 0.143, not 0.5. The probabilities come from a 200-tree random forest, each day predicted by a forest trained on the other 13 days:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.ensemble import RandomForestClassifier
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)
y = (df.Play == "Yes").astype(int).values
p = np.array([RandomForestClassifier(n_estimators=200, random_state=0).fit(X.drop(d), np.delete(y, i))
              .predict_proba(X.loc[[d]])[0, 1] for i, d in enumerate(X.index)])   # leave-one-day-out P(play)
print(" ".join(f"{d}:{v:.2f}" for d, v in zip(df.index, p)))
c_fp, c_fn = 500, 3000            # booked but nobody plays / not booked and the league match is forfeited
for thr in [0.5, c_fp / (c_fp + c_fn)]:
    book = p &gt;= thr
    wasted, missed = np.sum(book &amp; (y == 0)), np.sum(~book &amp; (y == 1))
    print(f"threshold {thr:.3f}: book on {book.sum():2d} days, wasted bookings {wasted}, missed matches {missed},"
          f" cost Rs {c_fp * wasted + c_fn * missed}")</div>
  <div class="fx" data-lang="text">D1:0.30 D2:0.34 D3:0.72 D4:0.43 D5:0.87 D6:0.84 D7:0.77 D8:0.28 D9:0.67 D10:0.85 D11:0.52 D12:0.54 D13:0.98 D14:0.46
threshold 0.500: book on  9 days, wasted bookings 1, missed matches 1, cost Rs 3500
threshold 0.143: book on 14 days, wasted bookings 5, missed matches 0, cost Rs 2500</div>
  <p>At the 0.5 threshold the captain wastes one booking and forfeits one match, ₹500 + ₹3,000. At 0.143 he books every day, because the lowest probability is above 0.143, wastes five bookings and forfeits nothing, which is cheaper overall. The model did not change at all; only the decision rule did.</p>
  <p>Rare classes add three more points. First, measure the right thing: <strong>precision</strong> (of the cases you flagged, the share that were positive), <strong>recall</strong> (of the positive cases, the share you flagged) and <strong>PR-AUC</strong> (average precision, a summary of precision across all thresholds), not accuracy. A random model's PR-AUC equals the positive rate, so 0.42 on a 5% problem is a big improvement even though it looks low (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>). Second, you can weight the rare class: <code>scale_pos_weight = n_neg / n_pos</code> in XGBoost and LightGBM, or <code>class_weight="balanced"</code> in scikit-learn, makes each positive row count w times in the loss. That multiplies the model's predicted odds by about w, so a row the unweighted model would score 0.05 (odds 0.05 / 0.95) scores about 0.5 with w = 19, and the original is recovered with p = p′ / (p′ + w(1 − p′)) = 0.5 / (0.5 + 19 × 0.5) = 0.05. A weighted model's outputs are therefore not real probabilities until corrected or calibrated. Third, resampling (dropping majority rows or duplicating minority rows) must happen only inside the training folds; with trees, weights usually do the same job more cheaply.</p>
  <p>The churn data is turned into a 5% problem by keeping every stayer and only enough churners, and three options are compared on the test set: the plain model at 0.5, the weighted model at 0.5, and the plain model with its threshold chosen on validation to maximise F1 (the balance of precision and recall):</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from churn import Xtr, ytr, Xva, yva, Xte, yte
from sklearn.metrics import roc_auc_score, average_precision_score, precision_score, recall_score
def make_rare(Xd, yd, rate=0.05, seed=0):          # keep every stayer, only enough churners for 5%
    r = np.random.default_rng(seed); pos = np.where(yd == 1)[0]; neg = np.where(yd == 0)[0]
    k = int(rate / (1 - rate) * len(neg)); keep = np.concatenate([neg, r.choice(pos, k, replace=False)])
    return Xd.iloc[keep], yd[keep]
Xtr5, ytr5 = make_rare(Xtr, ytr, seed=0); Xva5, yva5 = make_rare(Xva, yva, seed=1); Xte5, yte5 = make_rare(Xte, yte, seed=2)
npos, nneg = ytr5.sum(), (ytr5 == 0).sum()
print(f"train rows {len(ytr5)}, positives {npos} ({ytr5.mean():.1%}), scale_pos_weight = {nneg}/{npos} = {nneg/npos:.1f}")
print(f"always say 'stay': test accuracy {1 - yte5.mean():.3f}, recall 0.000")
def report(name, p, thr):
    pred = p &gt;= thr
    print(f"{name:26s} PR-AUC {average_precision_score(yte5, p):.3f}  ROC-AUC {roc_auc_score(yte5, p):.3f}  "
          f"at {thr:.2f}: precision {precision_score(yte5, pred):.3f} recall {recall_score(yte5, pred):.3f}  mean p {p.mean():.3f}")
def best_f1_threshold(p, yv):                       # chosen on VALIDATION rows
    ts = np.linspace(0.05, 0.95, 91)
    f1 = [2 * precision_score(yv, p &gt;= t, zero_division=0) * recall_score(yv, p &gt;= t) /
          max(precision_score(yv, p &gt;= t, zero_division=0) + recall_score(yv, p &gt;= t), 1e-9) for t in ts]
    return ts[int(np.argmax(f1))]
kw = dict(n_estimators=400, learning_rate=0.05, verbose=-1, random_state=0)
plain = lgb.LGBMClassifier(**kw).fit(Xtr5, ytr5)
wtd = lgb.LGBMClassifier(scale_pos_weight=nneg / npos, **kw).fit(Xtr5, ytr5)
p0, p1 = plain.predict_proba(Xte5)[:, 1], wtd.predict_proba(Xte5)[:, 1]
report("plain, threshold 0.5", p0, 0.5)
report("scale_pos_weight, 0.5", p1, 0.5)
report("plain, threshold from val", p0, best_f1_threshold(plain.predict_proba(Xva5)[:, 1], yva5))
print(f"true churn rate in test: {yte5.mean():.3f}")</div>
  <div class="fx" data-lang="text">train rows 6291, positives 314 (5.0%), scale_pos_weight = 5977/314 = 19.0
always say 'stay': test accuracy 0.950, recall 0.000
plain, threshold 0.5       PR-AUC 0.425  ROC-AUC 0.881  at 0.50: precision 0.605 recall 0.176  mean p 0.019
scale_pos_weight, 0.5      PR-AUC 0.415  ROC-AUC 0.870  at 0.50: precision 0.554 recall 0.275  mean p 0.041
plain, threshold from val  PR-AUC 0.425  ROC-AUC 0.881  at 0.13: precision 0.562 recall 0.344  mean p 0.019
true churn rate in test: 0.050</div>
  <p>"Always stay" scores 0.950 accuracy and catches nobody, which is why accuracy is not reported. The plain model at 0.5 is precise but catches only about one churner in six. Weighting the churners raises recall, but its ranking metrics (PR-AUC and ROC-AUC) are slightly worse: weighting moved the operating point, it did not improve the ranking. The plain model with a lower threshold chosen on validation gets the best recall at similar precision, for free. Look also at the mean predicted probability against the true rate of 0.050: the plain booster is too low and the weighted one is closer but for the wrong reason; neither is calibrated. For tree ensembles, imbalance is mainly a <em>decision</em> problem rather than a <em>learning</em> problem: train normally or with mild weights, judge with PR-AUC, and choose the threshold from costs or from a precision or recall target on validation data. All of this assumes the probabilities can be trusted, which is the next question.</p>

  <h2 id="mtt-cal"><span class="num">07</span>Probability Calibration</h2>
  <p>A model is <strong>calibrated</strong> if, among all the cases it scores 0.3, about 30% really are positive. Ranking metrics such as AUC do not care about this, because they only check that positives score higher than negatives. Decisions do care: the cost threshold of the previous section, expected profit, risk-based pricing and explaining risk to a customer all treat the number as a real probability. Think of a weather forecaster who says "70% chance of rain": if it rains on only 40% of such days, people stop trusting the forecast even if the forecaster ranks the days well.</p>
  <p>Calibration is measured in three ways, shown first on the diary forest's 14 leave-one-day-out probabilities from the previous section. The <strong>Brier score</strong> is the mean of (p − y)², where y is 1 for a played day and 0 otherwise; lower is better, and always predicting the base rate 9/14 is the baseline to beat. A <strong>reliability table</strong> groups the predictions into bins and compares the average prediction in each bin with the actual rate; a calibrated model has them equal, and a <strong>reliability diagram</strong> plots one against the other, with calibrated models on the diagonal (scikit-learn draws it with <code>CalibrationDisplay</code>). The <strong>expected calibration error</strong> (ECE) summarises the table as Σ (share of rows in the bin) × |mean prediction − actual rate|.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.ensemble import RandomForestClassifier
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)
y = (df.Play == "Yes").astype(int).values
p = np.array([RandomForestClassifier(n_estimators=200, random_state=0).fit(X.drop(d), np.delete(y, i))
              .predict_proba(X.loc[[d]])[0, 1] for i, d in enumerate(X.index)])   # same 14 probabilities as above
print(f"Brier = mean (p - y)^2 = {np.mean((p - y) ** 2):.3f}   (always saying 9/14: {np.mean((9/14 - y) ** 2):.3f})")
ece = 0
for lo, hi in [(0, 0.5), (0.5, 1.01)]:
    s = (p &gt;= lo) &amp; (p &lt; hi)
    print(f"predictions in [{lo}, {min(hi, 1)}): {s.sum()} days, mean prediction {p[s].mean():.3f}, actual play rate {y[s].mean():.3f}")
    ece += s.mean() * abs(p[s].mean() - y[s].mean())
print(f"ECE (2 bins) = {ece:.3f}")</div>
  <div class="fx" data-lang="text">Brier = mean (p - y)^2 = 0.161   (always saying 9/14: 0.230)
predictions in [0, 0.5): 5 days, mean prediction 0.362, actual play rate 0.200
predictions in [0.5, 1): 9 days, mean prediction 0.751, actual play rate 0.889
ECE (2 bins) = 0.147</div>
  <p>The forest beats the base rate on Brier score, so its probabilities carry information. But the reliability table shows a pattern: on days it scored below 0.5, it said about 0.36 on average while only 1 in 5 was played, and on days it scored 0.5 or more it said about 0.75 while 8 in 9 were played. Its low predictions are too high and its high predictions too low: the forest is <strong>squeezed towards the middle</strong>. That is the classic random-forest pattern, and it has a simple cause: a forest's probability is the average vote of its trees, and with random rows and random columns some trees always disagree, so the average rarely reaches 0 or 1. Boosters trained on log loss are usually close to calibrated, but weighted or heavily over-fitted boosters are not.</p>
  <p>Calibration is fixed after training, by learning a mapping from the model's scores to probabilities on held-out rows. <strong>Platt scaling</strong> (<code>method="sigmoid"</code>) fits p = 1 / (1 + e^(A·s + B)) to the scores s: only two numbers, so it works with little data, but it assumes an S-shaped distortion. <strong>Isotonic regression</strong> (<code>method="isotonic"</code>) fits any non-decreasing step function from score to probability: more flexible, but it needs a few thousand held-out rows or it over-fits. Either must be fitted on rows the model did not train on; <code>CalibratedClassifierCV(cv=5)</code> does this by cross-fitting. On churn:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from churn import Xtr, ytr, Xte, yte
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss
def ece(y, p, bins=10):
    idx = np.minimum((p * bins).astype(int), bins - 1)
    return sum((idx == b).mean() * abs(p[idx == b].mean() - y[idx == b].mean()) for b in range(bins) if (idx == b).any())
def table(y, p):
    idx = np.minimum((p * 5).astype(int), 4)
    return " ".join(f"{p[idx==b].mean():.2f}-&gt;{y[idx==b].mean():.2f}" for b in range(5) if (idx == b).any())
rf = lambda: RandomForestClassifier(n_estimators=200, n_jobs=2, random_state=0)
lgw = lambda: lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, scale_pos_weight=3, verbose=-1, random_state=0)
models = {"RF": rf().fit(Xtr, ytr),
          "LightGBM": lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1, random_state=0).fit(Xtr, ytr),
          "LightGBM weighted x3": lgw().fit(Xtr, ytr),
          "RF + sigmoid (Platt)": CalibratedClassifierCV(rf(), method="sigmoid", cv=5).fit(Xtr, ytr),
          "RF + isotonic": CalibratedClassifierCV(rf(), method="isotonic", cv=5).fit(Xtr, ytr),
          "LGBM weighted + isotonic": CalibratedClassifierCV(lgw(), method="isotonic", cv=5).fit(Xtr, ytr)}
for name, m in models.items():
    p = m.predict_proba(Xte)[:, 1]
    print(f"{name:25s} Brier {brier_score_loss(yte, p):.4f}  ECE {ece(yte, p):.4f}  acc {np.mean((p &gt; 0.5) == yte):.3f}")
print("reliability, 5 bins (mean prediction -&gt; actual churn rate):")
for name in ["RF", "RF + isotonic", "LightGBM weighted x3"]:
    print(f"  {name:21s}", table(yte, models[name].predict_proba(Xte)[:, 1]))</div>
  <div class="fx" data-lang="text">RF                        Brier 0.1091  ECE 0.1078  acc 0.876
LightGBM                  Brier 0.0971  ECE 0.0317  acc 0.874
LightGBM weighted x3      Brier 0.1105  ECE 0.0770  acc 0.844
RF + sigmoid (Platt)      Brier 0.0954  ECE 0.0238  acc 0.877
RF + isotonic             Brier 0.0957  ECE 0.0213  acc 0.879
LGBM weighted + isotonic  Brier 0.0950  ECE 0.0243  acc 0.874
reliability, 5 bins (mean prediction -&gt; actual churn rate):
  RF                    0.11-&gt;0.04 0.29-&gt;0.12 0.50-&gt;0.49 0.71-&gt;0.87 0.88-&gt;0.96
  RF + isotonic         0.07-&gt;0.07 0.29-&gt;0.27 0.50-&gt;0.50 0.71-&gt;0.76 0.93-&gt;0.94
  LightGBM weighted x3  0.07-&gt;0.04 0.30-&gt;0.11 0.50-&gt;0.26 0.71-&gt;0.52 0.94-&gt;0.91</div>
  <p>The raw forest has a clearly worse ECE than the plain booster, and its reliability row shows the squeeze: where it predicts 0.11 the true rate is 0.04, and where it predicts 0.71 the truth is 0.87. After isotonic calibration the predictions match the true rates closely, the Brier score improves, and accuracy is unchanged, because the forest's ranking was always good and only its probability scale was wrong; Platt scaling does almost as well here. The booster weighted ×3 over-predicts (where it says 0.50 only about a quarter churn), and isotonic calibration repairs it too. Two practical cautions: calibrating on the same rows used for early stopping or threshold choice reuses them yet again, so with enough data keep a separate calibration split; and re-check calibration after deployment, because drift breaks calibration before it breaks AUC. More on calibration methods is in <a class="xref" data-note="ml_calibration">Probability Calibration</a>.</p>

  <h2 id="mtt-cat"><span class="num">08</span>Categorical Columns</h2>
  <p>So far every column was a number or a 0/1 flag. Real tables have text categories (city, plan, product) with hundreds of values, and how they are fed to a tree model changes both the accuracy and the risk of leakage. The diary's Outlook has three values, so turning it into three 0/1 columns is fine. A city column with 1,000 values, half of them seen five times or fewer, is another matter. There are five common options:</p>
  <table class="tbl">
    <tr><th>Option</th><th>How</th><th>Good for</th><th>Watch out</th></tr>
    <tr><td>One-hot</td><td>one 0/1 column per category</td><td>few categories (&lt; ~20)</td><td>hundreds of sparse columns; each split isolates one category</td></tr>
    <tr><td>Ordinal codes</td><td>city → 0, 1, 2, … as a number</td><td>ordered categories (S/M/L)</td><td>imposes a fake order; needs many splits</td></tr>
    <tr><td>Target encoding</td><td>replace each category by the average target of its rows</td><td>many categories</td><td>leaks the row's own label unless cross-fitted</td></tr>
    <tr><td>Native (LightGBM, HistGB, XGBoost)</td><td>the library groups categories by gradient statistics at each split</td><td>medium cardinality</td><td>can over-fit rare categories</td></tr>
    <tr><td>CatBoost ordered target statistics</td><td>target encoding where each row only sees rows before it in a random order</td><td>many high-cardinality categoricals</td><td>slower training</td></tr>
  </table>
  <p>The leak in plain target encoding deserves a sentence. If a city has a single customer and that customer churned, the city's average target is 1.0, which is exactly that customer's label, so the model learns "1.0 means churn" from a column that simply copies the answer. <strong>Cross-fitting</strong> fixes it the same way out-of-fold predictions fixed stacking: each row is encoded using averages computed on the other folds only. The test below has 30,000 customers, a <code>city</code> column with 1,000 possible cities (a few big ones and a long tail of tiny ones), each city with its own hidden churn tendency, plus tenure and bill:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.preprocessing import OneHotEncoder, TargetEncoder
from sklearn.metrics import roc_auc_score
rng = np.random.default_rng(0); n = 30000; K = 1000
w = 1 / np.arange(1, K + 1) ** 1.1; w /= w.sum()
city = rng.choice(K, n, p=w)                                # a few big cities, a long tail of tiny ones
city_effect = rng.normal(0, 1.0, K)                         # each city has its own churn tendency
tenure = rng.integers(1, 60, n); bill = rng.normal(800, 200, n)
logit = -1 + city_effect[city] - 0.03 * tenure + 0.002 * (bill - 800)
y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
df = pd.DataFrame({"city": city, "tenure": tenure, "bill": bill})
tr, te = df[:24000], df[24000:]; ytr, yte = y[:24000], y[24000:]
vc = tr.city.value_counts()
print(f"cities in train: {len(vc)}; biggest 3 have {vc.head(3).tolist()} rows; {(vc &lt;= 5).sum()} cities have 5 rows or fewer")
num = ["tenure", "bill"]
def run(name, Xa, Xb, model=None, **fit):
    m = model or lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, verbose=-1, random_state=0)
    m.fit(Xa, ytr, **fit)
    print(f"{name:34s} train AUC {roc_auc_score(ytr, m.predict_proba(Xa)[:, 1]):.3f}"
          f"  test AUC {roc_auc_score(yte, m.predict_proba(Xb)[:, 1]):.3f}")
oh = OneHotEncoder(handle_unknown="ignore", sparse_output=False).fit(tr[["city"]])
run("one-hot (963 columns)", np.hstack([oh.transform(tr[["city"]]), tr[num]]), np.hstack([oh.transform(te[["city"]]), te[num]]))
run("city code as a number", tr, te)
means = pd.Series(ytr).groupby(tr.city.values).mean()       # naive: every row's own label is in its city mean
run("naive target mean (leaky)", np.column_stack([tr.city.map(means), tr[num]]),
    np.column_stack([te.city.map(means).fillna(ytr.mean()), te[num]]))
enc = TargetEncoder(random_state=0)                         # cross-fitted inside fit_transform
run("TargetEncoder (cross-fitted)", np.hstack([enc.fit_transform(tr[["city"]], ytr), tr[num]]),
    np.hstack([enc.transform(te[["city"]]), te[num]]))
trc, tec = tr.astype({"city": "category"}), te.astype({"city": "category"})
tec["city"] = tec["city"].cat.set_categories(trc["city"].cat.categories)
run("LightGBM native categorical", trc, tec)
run("CatBoost (ordered target stats)", tr, te,
    model=CatBoostClassifier(iterations=300, learning_rate=0.05, verbose=False, random_seed=0), cat_features=["city"])</div>
  <div class="fx" data-lang="text">cities in train: 963; biggest 3 have [4272, 1894, 1244] rows; 518 cities have 5 rows or fewer
one-hot (963 columns)              train AUC 0.827  test AUC 0.753
city code as a number              train AUC 0.848  test AUC 0.738
naive target mean (leaky)          train AUC 0.877  test AUC 0.741
TargetEncoder (cross-fitted)       train AUC 0.850  test AUC 0.750
LightGBM native categorical        train AUC 0.868  test AUC 0.755
CatBoost (ordered target stats)    train AUC 0.806  test AUC 0.765</div>
  <p>Over half the cities have five rows or fewer, and that long tail is where the encodings differ. The naive target mean has the highest training AUC and one of the lowest test AUCs, the signature of a leak. Cross-fitting removes the leak. One-hot and LightGBM's native handling do reasonably well, and plain codes are weakest. CatBoost wins on test with the <em>lowest</em> training AUC, so the smallest gap between the two, because its ordered statistics never let a row see its own label; it is also the slowest. Rules of thumb: few categories, one-hot or native; many categories, CatBoost, a cross-fitted target encoder (<code>sklearn.preprocessing.TargetEncoder</code>), or LightGBM native with its minimum-rows-per-category settings raised. Categories never seen in training must map to something sensible at prediction time, such as the global average or an "unknown" bucket. The ordered statistics are worked row by row in <a class="xref" data-note="ml_catboost">CatBoost</a>.</p>

  <h2 id="mtt-rules"><span class="num">09</span>Business Rules</h2>
  <p>A model can be accurate, honest and calibrated and still be unusable because it breaks a rule the business or a regulator insists on. A credit model must never say "more debt means lower risk", even if noise in the training data suggests it somewhere. A <strong>monotone constraint</strong> tells the booster that for a given column, predictions may only go up (+1) or only go down (−1) as the column increases, with everything else held fixed. The library enforces it while choosing splits, rejecting any split whose leaf values would break the order. The example simulates loan applicants whose true risk rises with the debt ratio and falls with income, and checks the model's predicted risk at 100 small steps of debt ratio with income fixed:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
rng = np.random.default_rng(0); n = 3000
debt_ratio = rng.uniform(0, 1, n); income = rng.normal(50, 15, n)
risk = 1 / (1 + np.exp(-(-3 + 4 * debt_ratio - 0.02 * (income - 50))))
y = (rng.random(n) &lt; risk).astype(int)
X = pd.DataFrame({"debt_ratio": debt_ratio, "income": income})
grid = pd.DataFrame({"debt_ratio": np.linspace(0, 1, 101), "income": 50.0})     # 100 small steps of debt
for mc in [None, [1, -1]]:
    m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, verbose=-1, random_state=0,
                           monotone_constraints=mc).fit(X, y)
    p = m.predict_proba(grid)[:, 1]
    print(f"monotone_constraints={mc}: risk at debt 0.0/0.5/1.0 = {p[0]:.2f}/{p[50]:.2f}/{p[100]:.2f}; "
          f"steps where MORE debt gives LOWER risk: {int((np.diff(p) &lt; -1e-9).sum())} of 100")</div>
  <div class="fx" data-lang="text">monotone_constraints=None: risk at debt 0.0/0.5/1.0 = 0.00/0.13/0.65; steps where MORE debt gives LOWER risk: 42 of 100
monotone_constraints=[1, -1]: risk at debt 0.0/0.5/1.0 = 0.03/0.31/0.77; steps where MORE debt gives LOWER risk: 0 of 100</div>
  <p>Without the constraint, the predicted risk goes <em>down</em> at 42 of the 100 steps: noise-driven wiggles that a regulator would reject and a customer could exploit. With <code>monotone_constraints=[1, -1]</code> (risk rises with debt, falls with income) there are none, and the curve still rises across the range. The same option exists in XGBoost, CatBoost and scikit-learn's HistGradientBoosting (<code>monotonic_cst</code>), usually at a small cost in accuracy.</p>
  <p>The second kind of rule concerns the loss itself. For a shop, running out of stock may cost three times as much as holding extra stock, but squared error treats both mistakes the same. Gradient boosting can minimise any differentiable loss as long as you supply, for every row, its <strong>gradient</strong> g (the slope of the loss with respect to the prediction F) and its <strong>Hessian</strong> h (the curvature), as explained in <a class="xref" data-note="ml_xgboost">XGBoost</a>. For L = w · (y − F)² with w = 3 when y &gt; F (an under-forecast) and 1 otherwise, g = −2w(y − F) and h = 2w. For a row with demand y = 100 and forecast F = 90, that gives g = −2 × 3 × 10 = −60 and h = 6.</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
rng = np.random.default_rng(0); n = 5000
X = rng.uniform(0, 10, (n, 2))
demand = 50 + 8 * X[:, 0] - 3 * X[:, 1] + rng.normal(0, 10, n)     # units sold per day
def under_costs_3x(y_true, y_pred):          # loss = 3*(y-F)^2 if we under-forecast, (y-F)^2 if over
    r = y_true - y_pred
    w = np.where(r &gt; 0, 3.0, 1.0)
    return -2 * w * r, 2 * w                   # gradient dL/dF and Hessian d2L/dF2 for every row
Xtr, Xte, ytr, yte = X[:4000], X[4000:], demand[:4000], demand[4000:]
for name, obj in [("squared error", "regression"), ("custom: under-forecast costs 3x", under_costs_3x)]:
    m = lgb.LGBMRegressor(objective=obj, n_estimators=300, learning_rate=0.05, verbose=-1, random_state=0).fit(Xtr, ytr)
    r = yte - m.predict(Xte)
    print(f"{name:32s} mean error {r.mean():+5.2f}  under-forecast on {np.mean(r &gt; 0):.0%} of days"
          f"  business cost {np.mean(np.where(r &gt; 0, 3, 1) * r ** 2):6.1f}")</div>
  <div class="fx" data-lang="text">squared error                    mean error +0.89  under-forecast on 53% of days  business cost  235.4
custom: under-forecast costs 3x  mean error -2.82  under-forecast on 40% of days  business cost  189.8</div>
  <p>The squared-error model is unbiased and under-forecasts on about half the days. The custom model deliberately aims high, under-forecasts on fewer days, and the business cost falls by about a fifth. The "worse" model by ordinary error is the better model for the business. With a custom objective, also pass a matching custom evaluation metric for early stopping, since the library's default metric no longer measures what you care about.</p>

  <h2 id="mtt-ship"><span class="num">10</span>Size, Speed and Saving</h2>
  <p>A model that wins on the test set still has to leave the notebook: it takes disk space and memory, it must answer requests in milliseconds, and it must load tomorrow on another machine with exactly the same predictions. A tree is stored as arrays of nodes (column, threshold, children, value). A fully grown classification tree on 12,000 rows has thousands of nodes, and a forest has hundreds of such trees, while a booster has hundreds of small trees of 31 leaves or depth 6. Prediction time is roughly the number of trees times the depth, since every row walks from the root to a leaf in every tree. The code measures pickled size, the time to predict one row (what an API serving one request sees) and the time to predict 5,000 rows:</p>
  <div class="fx" data-lang="py">import pickle, time, lightgbm as lgb, xgboost as xgb
from catboost import CatBoostClassifier
from churn import Xtr, ytr, Xte, yte
from sklearn.ensemble import RandomForestClassifier
models = {
  "RF 300 trees, full depth":        RandomForestClassifier(n_estimators=300, n_jobs=1, random_state=0),
  "RF 300 trees, min_samples_leaf=20": RandomForestClassifier(n_estimators=300, min_samples_leaf=20, n_jobs=1, random_state=0),
  "LightGBM 480 trees, 31 leaves":   lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1),
  "XGBoost 440 trees, depth 6":      xgb.XGBClassifier(n_estimators=440, learning_rate=0.05, max_depth=6, n_jobs=1),
  "CatBoost 820 trees, depth 6":     CatBoostClassifier(iterations=820, learning_rate=0.05, depth=6, verbose=False)}
one = Xte.iloc[[0]]
for name, m in models.items():
    m.fit(Xtr, ytr)
    mb = len(pickle.dumps(m)) / 1e6
    m.predict_proba(one)                                       # warm-up call
    t0 = time.perf_counter()
    for _ in range(50): m.predict_proba(one)
    single = (time.perf_counter() - t0) / 50 * 1000
    t0 = time.perf_counter(); m.predict_proba(Xte); batch = (time.perf_counter() - t0) * 1000
    print(f"{name:34s} {mb:6.1f} MB  1 row {single:5.1f} ms  5,000 rows {batch:6.0f} ms  test acc {m.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">RF 300 trees, full depth             69.1 MB  1 row 100.8 ms  5,000 rows   1016 ms  test acc 0.877
RF 300 trees, min_samples_leaf=20    13.3 MB  1 row  83.8 ms  5,000 rows    816 ms  test acc 0.852
LightGBM 480 trees, 31 leaves         1.6 MB  1 row   4.6 ms  5,000 rows    640 ms  test acc 0.874
XGBoost 440 trees, depth 6            1.6 MB  1 row  10.0 ms  5,000 rows    189 ms  test acc 0.867
CatBoost 820 trees, depth 6           0.9 MB  1 row   1.0 ms  5,000 rows     66 ms  test acc 0.872</div>
  <p>The full-depth forest is by far the largest; forcing leaves of at least 20 rows shrinks it several times but costs accuracy. The boosters are a megabyte or two at about the forest's accuracy, and CatBoost's symmetric trees, which store one column and threshold per <em>level</em> rather than per node, are the most compact. Single-row latency is ten or more times lower for the boosters than for the scikit-learn forests, whose prediction loops over the 300 trees one by one with some Python overhead per tree, while the boosting libraries walk all their trees in compiled code. (Timings are approximate and come from a busy shared machine; treat them as rough ratios.) One more trap makes forests even slower: a forest loaded with <code>n_jobs=-1</code> starts a thread pool on every call, which for a single row costs more than walking the trees, so set <code>n_jobs=1</code> for one-row serving, as this code does. To shrink and speed up, cheapest first: fewer trees (early stopping; for forests, a few hundred trees are usually as good as a thousand), smaller trees, fewer columns (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>), batch predictions, and compiled tree runtimes such as Treelite or ONNX Runtime. Measure real latency with your production thread settings and feature pipeline; fetching features often costs more than the model.</p>
  <p>For saving, each library has a recommended format. scikit-learn models are saved with <code>joblib.dump</code> (a pickle), which is simple but tied to the exact scikit-learn and Python versions, and loading a pickle runs code, so never load one from an untrusted source. XGBoost saves to JSON (<code>save_model("m.json")</code>, or the binary <code>.ubj</code>), a documented format that loads across versions and languages. LightGBM saves a plain-text dump of every tree (<code>booster_.save_model("m.txt")</code>). CatBoost saves its own binary <code>.cbm</code> and can also export JSON or ONNX. The code saves and reloads one model of each kind and checks the predictions:</p>
  <div class="fx" data-lang="py">import os, joblib, numpy as np, lightgbm as lgb, xgboost as xgb
from catboost import CatBoostClassifier
from churn import Xtr, ytr, Xte
from sklearn.ensemble import RandomForestClassifier
os.makedirs("models", exist_ok=True)
rf = RandomForestClassifier(n_estimators=100, min_samples_leaf=5, random_state=0).fit(Xtr, ytr)
joblib.dump(rf, "models/rf.joblib", compress=3);        rf2 = joblib.load("models/rf.joblib")
lg = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, verbose=-1).fit(Xtr, ytr)
lg.booster_.save_model("models/lgb.txt");               lg2 = lgb.Booster(model_file="models/lgb.txt")
xg = xgb.XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=6).fit(Xtr, ytr)
xg.save_model("models/xgb.json");                       xg2 = xgb.XGBClassifier(); xg2.load_model("models/xgb.json")
cb = CatBoostClassifier(iterations=300, verbose=False).fit(Xtr, ytr)
cb.save_model("models/cb.cbm");                         cb2 = CatBoostClassifier(); cb2.load_model("models/cb.cbm")
checks = {"rf.joblib": (rf.predict_proba(Xte)[:, 1], rf2.predict_proba(Xte)[:, 1]),
          "lgb.txt":   (lg.predict_proba(Xte)[:, 1], lg2.predict(Xte)),
          "xgb.json":  (xg.predict_proba(Xte)[:, 1], xg2.predict_proba(Xte)[:, 1]),
          "cb.cbm":    (cb.predict_proba(Xte)[:, 1], cb2.predict_proba(Xte)[:, 1])}
for f, (a, b) in checks.items():
    print(f"{f:10s} {os.path.getsize('models/' + f) / 1e6:5.2f} MB   max |difference| after reload {np.abs(a - b).max():.1e}")
print(open("models/lgb.txt").read().splitlines()[:3])</div>
  <div class="fx" data-lang="text">rf.joblib   3.20 MB   max |difference| after reload 0.0e+00
lgb.txt     1.03 MB   max |difference| after reload 0.0e+00
xgb.json    1.73 MB   max |difference| after reload 0.0e+00
cb.cbm      0.34 MB   max |difference| after reload 0.0e+00
['tree', 'version=v4', 'num_class=1']</div>
  <p>All four reload with exactly the same predictions (a largest difference of zero). The last line is the start of LightGBM's text file, a human-readable dump of the trees. Save more than the model: the library versions, the exact list and order of feature columns, the category mappings and preprocessing, the chosen threshold and calibrator, and the date range of the training data. Tools such as <a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a> do this bookkeeping for you.</p>

  <h2 id="mtt-drift"><span class="num">11</span>Monitoring and Drift</h2>
  <p>A deployed model decays. Customers change, prices rise, a new plan launches, an upstream team renames a field. The diary was written in a dry month; if the next month is the monsoon, the model will meet weather it has barely seen. <strong>Drift</strong> is the general name for the world moving away from the training data, and monitoring exists to catch it before the business does. Four things are watched, from the fastest signal to the slowest: <strong>data quality</strong> (missing values, new categories, values outside the training range, which matters because trees cannot extrapolate beyond it); <strong>data drift</strong>, a change in the distribution of the inputs, measured per column; <strong>prediction drift</strong>, a change in the distribution of the scores or in the share of positive decisions; and <strong>performance</strong> (AUC, precision and recall, calibration), which can only be measured once true labels arrive, often weeks later. A drop in performance while the inputs look stable points to <strong>concept drift</strong>: the relationship between the inputs and the target itself has changed.</p>
  <p>A car dashboard is a fair picture: the data-quality checks are the warning light (something is broken now), drift is the fuel gauge slowly moving, and performance is the mileage you only learn at the end of the trip. You need all of them because they arrive at different times.</p>
  <p>The most common measure of data drift is the <strong>Population Stability Index</strong>. Bin a column using the training data, compute the share of rows in each bin at training time (e) and in production (a), and add up PSI = Σ (aᵢ − eᵢ) · ln(aᵢ / eᵢ) over the bins. Each term is zero when the shares match and grows as they move apart in either direction. On the diary, the 14 humidity readings are the training distribution, and an imagined monsoon month brings far more humid days:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
edges = [0, 75, 85, 91, 100]                       # humidity bins (%)
e = np.histogram(df.HumPct, edges)[0] / 14         # the diary's share per bin: the "training" month
a = np.array([0.10, 0.20, 0.30, 0.40])             # a monsoon month: far more humid days
for k, name in enumerate(["65-74", "75-84", "85-90", "91-100"]):
    print(f"bin {name:6s}: diary {e[k]:.3f}  new month {a[k]:.2f}  (a-e)*ln(a/e) = {(a[k]-e[k])*np.log(a[k]/e[k]):.4f}")
print(f"PSI = {np.sum((a - e) * np.log(a / e)):.3f}")</div>
  <div class="fx" data-lang="text">bin 65-74 : diary 0.286  new month 0.10  (a-e)*ln(a/e) = 0.1950
bin 75-84 : diary 0.214  new month 0.20  (a-e)*ln(a/e) = 0.0010
bin 85-90 : diary 0.286  new month 0.30  (a-e)*ln(a/e) = 0.0007
bin 91-100: diary 0.214  new month 0.40  (a-e)*ln(a/e) = 0.1159
PSI = 0.313</div>
  <p>Check the driest bin by hand: the diary has 4 of 14 days (0.286) at 65–74% humidity, the new month only 10%, so the term is (0.10 − 0.286) × ln(0.10 / 0.286) = (−0.186) × (−1.050) = 0.195. The most humid bin adds 0.116, and the middle bins barely moved. The total is 0.313. The usual rule of thumb is PSI below 0.1 for a stable column, 0.1 to 0.25 for a moderate shift worth investigating, and above 0.25 for a major shift that probably needs retraining, so this is a major shift: a model trained on the diary has seen only three days above 90% humidity and would be guessing on most monsoon days. The second example shows how PSI grows as the average monthly bill slowly drifts upwards, using 10 bins of 10% each from the training data:</p>
  <div class="fx" data-lang="py">import numpy as np
def psi(expected, actual, edges):
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(actual, edges)[0] / len(actual)
    e, a = np.clip(e, 1e-4, None), np.clip(a, 1e-4, None)      # avoid log(0) in empty bins
    return np.sum((a - e) * np.log(a / e))
rng = np.random.default_rng(0)
train = rng.normal(800, 200, 20000)                              # monthly bills at training time
q = np.quantile(train, np.linspace(0, 1, 11)); q[0], q[-1] = -np.inf, np.inf   # 10 bins of 10% each
for shift in [0, 20, 60, 120]:
    print(f"average bill +{shift:3d}: PSI {psi(train, rng.normal(800 + shift, 200, 5000), q):.3f}")</div>
  <div class="fx" data-lang="text">average bill +  0: PSI 0.003
average bill + 20: PSI 0.008
average bill + 60: PSI 0.092
average bill +120: PSI 0.306</div>
  <p>A shift of ₹20 in the average bill (a tenth of a standard deviation) is nothing to worry about; ₹60 approaches the "investigate" line; ₹120 is a major shift. Use permutation importance or SHAP to decide which columns to watch most closely: drift in a column the model barely uses matters little, while drift in its strongest column matters a lot. Computing PSI on every column every day produces false alarms, so alert on the important columns, use windows large enough to be stable, and confirm with prediction drift and, when labels arrive, performance. When drift is confirmed, retrain on recent data, re-check calibration and the threshold, compare the new model with the old one on the same recent holdout (a "champion versus challenger" test), and roll it out gradually. The system around this, with dashboards, alerts and retraining schedules, is covered in <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>.</p>

  <h2 id="mtt-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common mistake is reporting the tuning score as the model's quality. The best of many validation scores is optimistic by construction: on 800 churn rows the best of 96 settings scored 0.732 in its own cross-validation and 0.723 on fresh data. Report a separate test set or nested CV, and touch the test set once.</p>
  <p>The second is grid-searching the learning rate and the number of trees of a booster together. They are one knob in disguise; fix the learning rate, let early stopping pick the trees, and spend the search on tree size, leaf size and sampling. Close behind it is preprocessing outside the cross-validation loop: target encoding, feature selection, oversampling or scaling fitted on all the rows leaks into validation and makes everything look better than it is. Put those steps in a Pipeline.</p>
  <p>The third family is about decisions. Judging a rare-class model by accuracy ("always no" scored 0.950) and leaving the threshold at 0.5 both ignore what the mistakes cost; use PR-AUC and set the threshold from C_FP / (C_FP + C_FN). Trusting weighted-booster or forest probabilities as they are is the next step of the same mistake: the weighted booster said 0.50 where only about a quarter churned, and forests are squeezed towards the middle, so calibrate on held-out rows before probabilities feed any money calculation.</p>
  <p>The last family is about shipping. Naive target encoding of a high-cardinality column leaks labels (high training AUC, low test AUC); cross-fit it or use CatBoost. A full-depth forest of many megabytes behind a strict latency limit, served with <code>n_jobs=-1</code>, is slow for reasons that have nothing to do with the trees. And shipping without monitoring means finding out about drift from the business, weeks after the inputs moved.</p>

  <h2 id="mtt-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Parameter</b>: learnt by training (splits, thresholds, leaf values). <b>Hyperparameter</b>: chosen before training (depth, learning rate, number of trees).</li>
    <li><b>Nested CV</b>: outer folds report, inner folds tune; estimates "tune, then train".</li>
    <li><b>Early stopping</b>: stop when validation loss has not improved for <i>patience</i> rounds; keep the best round.</li>
    <li><b>Calibrated</b>: among cases scored p, a share p are positive.</li>
    <li><b>Monotone constraint</b>: prediction may only rise (+1) or fall (−1) with a column.</li>
    <li><b>Drift</b>: data drift (inputs), prediction drift (scores), concept drift (input–target relationship).</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Example</th></tr>
    <tr><td>Random search hit rate</td><td>1 − (1 − q)ⁿ</td><td>q = 0.05, n = 60 → 0.954</td></tr>
    <tr><td>Cost threshold</td><td>t = C_FP / (C_FP + C_FN)</td><td>500 / 3,500 = 0.143</td></tr>
    <tr><td>Class weight</td><td>w = n_neg / n_pos; odds × w</td><td>5,977 / 314 = 19.0</td></tr>
    <tr><td>Undo weighting</td><td>p = p′ / (p′ + w(1 − p′))</td><td>0.5 → 0.05 for w = 19</td></tr>
    <tr><td>Brier score</td><td>mean (p − y)²</td><td>lower is better</td></tr>
    <tr><td>ECE</td><td>Σ bins (share) · |mean p − actual rate|</td><td>0 = calibrated</td></tr>
    <tr><td>PSI</td><td>Σ (aᵢ − eᵢ) ln(aᵢ / eᵢ)</td><td>monsoon humidity 0.313</td></tr>
    <tr><td>Custom loss</td><td>supply g = ∂L/∂F, h = ∂²L/∂F²</td><td>L = 3(y − F)²: g = −60, h = 6 at y = 100, F = 90</td></tr>
  </table>
  <h3>Which knob, which search</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Do this</th></tr>
    <tr><td>Random forest</td><td>500 trees, try <code>max_features</code> and <code>min_samples_leaf</code>; do not tune <code>n_estimators</code></td></tr>
    <tr><td>Any booster</td><td>learning rate 0.05 + early stopping; tune tree size, leaf size, sampling</td></tr>
    <tr><td>1–2 knobs</td><td>grid search</td></tr>
    <tr><td>3+ knobs</td><td>random search; Optuna (TPE) when trials are costly; halving for many candidates</td></tr>
    <tr><td>Small data / comparing tuned models</td><td>nested CV</td></tr>
    <tr><td>Rare class</td><td>PR-AUC; threshold from costs on validation; mild weights at most</td></tr>
    <tr><td>Probabilities used as money</td><td>calibrate (Platt with little data, isotonic with thousands of rows)</td></tr>
    <tr><td>Many categories</td><td>CatBoost or cross-fitted target encoding</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.model_selection import RandomizedSearchCV, cross_val_score, GridSearchCV
from sklearn.calibration import CalibratedClassifierCV
import lightgbm as lgb

m = lgb.LGBMClassifier(n_estimators=5000, learning_rate=0.05, num_leaves=31)
m.fit(Xtr, ytr, eval_set=[(Xva, yva)], callbacks=[lgb.early_stopping(100)])   # m.best_iteration_
rs = RandomizedSearchCV(model, dist, n_iter=30, cv=5, scoring="roc_auc").fit(X, y)
nested = cross_val_score(GridSearchCV(model, grid, cv=5), X, y, cv=5)         # nested CV
cal = CalibratedClassifierCV(model, method="isotonic", cv=5).fit(X, y)
lgb.LGBMClassifier(monotone_constraints=[1, -1])                               # rise with col 0, fall with col 1
m.booster_.save_model("m.txt")                                                 # LightGBM text format</div>
  <h3>Gotchas</h3>
  <ul>
    <li>The tuning score is optimistic; report a test set used once.</li>
    <li>Every learnt preprocessing step goes inside the CV folds.</li>
    <li>The early-stopping validation score is optimistic too.</li>
    <li>Weights move the operating point, not the ranking; probabilities need correcting.</li>
    <li>Forests are squeezed towards the middle; calibrate on held-out rows.</li>
    <li>Pickles break across library versions and can run code; prefer native formats.</li>
    <li>PSI on every column daily → false alarms; watch the important columns.</li>
  </ul>

  <h2 id="mtt-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a parameter and a hyperparameter?</summary><div class="qa-body">Parameters are learnt from the data during training, such as each tree's split columns, thresholds and leaf values. Hyperparameters are chosen before training and control how the parameters are learnt, such as the learning rate, maximum depth, number of leaves and number of trees. Hyperparameters are chosen by comparing candidates on held-out data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which hyperparameters matter most for a random forest, and which for a gradient booster?</summary><div class="qa-body">For a forest, <code>max_features</code> and <code>min_samples_leaf</code>; the number of trees only needs to be "enough", because more trees never over-fit. For a booster, the learning rate together with the number of rounds (chosen by early stopping), then tree size (depth or number of leaves), then leaf size (min_child_weight or min_child_samples), then row and column sampling, then L1/L2 and gamma.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the best cross-validation score from a hyperparameter search optimistic?</summary><div class="qa-body">The winner was chosen because it scored best on those particular rows, so part of its score is luck that will not repeat on new data. The more settings you try, the larger this selection bias. Report the final model on a test set that played no part in choosing, or use nested cross-validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is nested cross-validation and when do you need it?</summary><div class="qa-body">An outer CV loop estimates performance; inside each outer training part an inner CV tunes the hyperparameters. The outer scores come from rows that never influenced the choice, so they estimate how good "tune, then train" is. It is needed on small data or when comparing tuned models fairly; with plenty of data an untouched test set does the same job more cheaply.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does random search usually beat grid search for the same budget?</summary><div class="qa-body">Usually only a few knobs matter. A grid with 2 values per knob tests only 2 values of the important knob however many combinations it runs, while random search tries a new value of every knob in every trial. Also, 60 random trials have a 1 − 0.95⁶⁰ ≈ 95% chance of hitting the top 5% of the space, regardless of the number of knobs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Bayesian optimisation with TPE choose the next trial?</summary><div class="qa-body">It splits the trials so far into a good group (the best 10–25%) and a bad group, estimates the density of each knob's values in each group, l(x) and g(x), and proposes values where l(x)/g(x) is largest, meaning common among good trials and rare among bad ones. The first trials are random to get started, and hopeless trials can be pruned early.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is successive halving?</summary><div class="qa-body">Start many candidates on a small budget (few rows or rounds), keep the best fraction (for example a third), give the survivors more budget, and repeat until one remains. With 48 candidates and factor 3: 48 on 1,000 rows, 16 on 3,000, 6 on 9,000. Most of the compute goes to the promising candidates; the risk is discarding settings that start slowly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does early stopping work, and how many rounds do you use when refitting on all the data?</summary><div class="qa-body">After each round the validation loss is computed; if it has not improved for a set number of rounds (the patience), training stops and the best round is kept. When refitting on all the data, use about the same number of rounds or slightly more, since more data supports a few more; 10–20% more is common, and near the optimum the exact count matters little.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are the learning rate and the number of trees "one knob in disguise"?</summary><div class="qa-body">Their product is roughly how far the model moves from its starting point: halve the learning rate and you need about twice as many trees for the same fit. Smaller rates usually generalise a little better but cost training time. So fix the learning rate, let early stopping choose the trees, and search other knobs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle a problem with 5% positives?</summary><div class="qa-body">Measure with PR-AUC and precision/recall instead of accuracy. Train normally or with a mild class weight (<code>scale_pos_weight = n_neg/n_pos</code>), then choose the decision threshold from the costs, C_FP / (C_FP + C_FN), or from a recall or precision target on validation data. Any resampling must happen inside the training folds only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>scale_pos_weight</code> do to the predicted probabilities?</summary><div class="qa-body">It counts each positive row w times in the loss, which multiplies the predicted odds by about w, so a true 5% becomes about 50% with w = 19. The ranking (AUC) barely changes, but the outputs are no longer real probabilities; correct them with p = p′/(p′ + w(1 − p′)) or recalibrate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are random-forest probabilities poorly calibrated, and how do you fix them?</summary><div class="qa-body">A forest's probability is the average vote of its trees, and random rows and columns make some trees always disagree, so the average rarely reaches 0 or 1: probabilities are squeezed towards the middle. Fix it with Platt scaling (a sigmoid with two parameters, good for small data) or isotonic regression (a flexible step function, needs thousands of rows), fitted on held-out predictions, for example with <code>CalibratedClassifierCV(cv=5)</code>. Accuracy is unchanged; the probability scale becomes honest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must calibration come before choosing a cost-based threshold?</summary><div class="qa-body">The rule "act when p &gt; C_FP / (C_FP + C_FN)" assumes p is a real probability. If the model says 0.75 for cases that are positive 89% of the time, the threshold is applied on the wrong scale and the decisions are not cost-optimal. Calibrate on held-out rows first, then apply the threshold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A categorical column has 1,000 values, half with five rows or fewer. What are your options?</summary><div class="qa-body">CatBoost with the column declared categorical (ordered target statistics), a cross-fitted target encoder, or LightGBM's native categorical handling with its minimum-rows-per-category settings raised. Avoid naive target means, which leak each row's own label into tiny categories, and be wary of one-hot, which creates a thousand sparse columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you make a credit model respect "more debt never lowers risk"?</summary><div class="qa-body">Use monotone constraints: +1 for debt and −1 for income, available in XGBoost, LightGBM, CatBoost and HistGradientBoosting. The split search then rejects splits that would make the prediction go the wrong way, so the rule holds everywhere, usually at a small cost in accuracy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you train a booster on a loss the library does not provide?</summary><div class="qa-body">Write a function that returns, for every row, the gradient and the Hessian of the loss with respect to the prediction, and pass it as the objective. For L = w(y − F)², g = −2w(y − F) and h = 2w. Also supply a matching evaluation metric for early stopping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you save a gradient-boosted model for production, and what else must you save?</summary><div class="qa-body">Use the library's native format: XGBoost JSON, LightGBM text, CatBoost <code>.cbm</code>; scikit-learn models with joblib only with pinned versions. Also save the library versions, the exact feature list and order, category mappings and preprocessing, the decision threshold and calibrator, and the training data window, ideally through a tool like MLflow.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is PSI and how do you read it?</summary><div class="qa-body">The Population Stability Index compares a column's distribution in production with training over the same bins: PSI = Σ (a − e)·ln(a/e). Below 0.1 is stable, 0.1–0.25 a moderate shift worth investigating, above 0.25 a major shift that usually calls for retraining. It measures input drift only; performance must be checked once labels arrive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between data drift and concept drift?</summary><div class="qa-body">Data drift is a change in the distribution of the inputs, such as bills rising; it can be measured immediately, for example with PSI. Concept drift is a change in the relationship between inputs and target, such as the same bill now leading to more churn because a competitor launched; it shows up as falling performance once labels arrive, possibly with stable inputs.</div></details>
</main>
`
});
