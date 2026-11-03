// notes/ml/ml_catboost.js — CatBoost
Object.assign(TOPIC_CONTENT, {
  "ml_catboost": `<main>
  <h1>CatBoost</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>CatBoost</span></div>
  <p class="lead">CatBoost ("Categorical Boosting", Yandex, 2018) is gradient boosting designed for tables full of <strong>categorical columns</strong>: city, plan, payment method, device brand, pincode. It takes them as raw text and turns them into numbers using the target, but in a way that never lets a row see its own label, which is the mistake that makes ordinary target encoding overfit. Its two key ideas, <strong>ordered target statistics</strong> and <strong>ordered boosting</strong>, both follow one rule: a number computed for a training row may only use the rows that come "before" it in a random order. It also grows <strong>symmetric trees</strong> that ask one question per level and builds <strong>combinations of categories</strong> on the fly, and its defaults are good enough that it often needs little tuning. As in the rest of the tree notes, every mechanism is first worked by hand on the captain's 14-day cricket diary, whose Outlook column (Sunny, Overcast, Rain) is a small categorical feature, and then measured on a 20,000-row categorical churn table. Read <a class="xref" data-note="ml_xgboost">XGBoost</a> and <a class="xref" data-note="ml_lightgbm">LightGBM</a> first: CatBoost shares their gradient-boosting maths.</p>

  <h2 id="cb-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">CatBoost</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The problem</div>
        <ul>
          <li>Label codes invent an order; one-hot explodes</li>
          <li>Target encoding is the right idea but leaks the label</li>
          <li>Leak → prediction shift: train ≠ test behaviour</li>
          <li>Boosting's own residuals leak the same way</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ordered statistics</div>
        <ul>
          <li>Random order = invented "time"</li>
          <li>Encode a row from earlier rows only: (Σy + a·P)/(n + a)</li>
          <li>Several orders; prediction uses all training rows</li>
          <li>Ordered boosting: gradients from models that never saw the row</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Trees and combinations</div>
        <ul>
          <li>Symmetric tree: one question per level, 2<sup>depth</sup> leaves</li>
          <li>Leaf index = the answers as bits; fast prediction</li>
          <li>Categories combined greedily (Rain|Strong)</li>
          <li><code>max_ctr_complexity</code> limits combination size</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using it</div>
        <ul>
          <li>Raw strings + <code>cat_features</code>; no encoding code</li>
          <li>Defaults: 1000 trees, depth 6, l2_leaf_reg 3, automatic learning rate</li>
          <li>Best for categorical-heavy, small-to-medium data</li>
          <li>Slower to train than LightGBM; fastest to predict</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Categorical Features Are Hard</span><span class="rm-sub">codes, one-hot, and target statistics</span></div></div>
      <div class="rm-item rm-done" data-target="cb-leak"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Target Encoding and the Leak</span><span class="rm-sub">how a row ends up seeing its own label</span></div></div>
      <div class="rm-item rm-done" data-target="cb-ots"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Ordered Target Statistics</span><span class="rm-sub">encode each row from earlier rows only</span></div></div>
      <div class="rm-item rm-done" data-target="cb-ordered"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Prediction Shift and Ordered Boosting</span><span class="rm-sub">the same leak inside boosting, and its fix</span></div></div>
      <div class="rm-item rm-done" data-target="cb-oblivious"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Symmetric (Oblivious) Trees</span><span class="rm-sub">one question per level</span></div></div>
      <div class="rm-item rm-done" data-target="cb-combo"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Feature Combinations</span><span class="rm-sub">when two categories matter together</span></div></div>
      <div class="rm-item rm-done" data-target="cb-params"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Defaults and Parameters</span><span class="rm-sub">what CatBoost does for you, what to tune</span></div></div>
      <div class="rm-item rm-done" data-target="cb-code"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Full Training Code</span><span class="rm-sub">raw strings to a saved model</span></div></div>
      <div class="rm-item rm-done" data-target="cb-when"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">When to Choose CatBoost</span><span class="rm-sub">head-to-head with XGBoost and LightGBM</span></div></div>
      <div class="rm-item rm-done" data-target="cb-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">cat_features, NaN categories, time order</span></div></div>
      <div class="rm-item rm-done" data-target="cb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, parameters, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="cb-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about CatBoost</span></div></div>
    </div>
  </div>

  <h2 id="cb-why"><span class="num">01</span>Why Categorical Features Are Hard</h2>
  <p>A decision tree splits with questions like "x &lt; threshold", which needs numbers with a meaningful order. A <strong>categorical column</strong> holds labels from a fixed set with no order at all, such as a city, a plan or a device brand, so every library has to turn it into numbers somehow. There are three obvious ways, and each has a cost.</p>
  <p>The first is <strong>label encoding</strong>: give each value an integer, Delhi = 0, Goa = 1, Pune = 2. Now the tree believes Goa lies "between" Delhi and Pune, and a split "city &lt; 1.5" groups Delhi with Goa for no reason. With enough splits a tree can still carve out any group, but it wastes depth and data doing so. On the diary, alphabetical codes give Overcast = 0, Rain = 1, Sunny = 2, and by luck the alphabet follows the play rate (4 of 4, 3 of 5, 2 of 5), so one cut isolates Overcast. With 300 cities no alphabet is that kind.</p>
  <p>The second is <strong>one-hot encoding</strong>: one 0/1 column per value. There is no fake order, but the number of columns explodes and each split can only separate one value from all the others. Look at the categorical churn table used in this note, built in <code>cchurn.py</code> and shared with the LightGBM note: 20,000 telecom customers with four categorical columns, three numeric ones, and a pincode column that we will meet shortly.</p>
  <div class="fx" data-lang="py">import pandas as pd
from cchurn import df, CAT                         # the categorical churn table, 20,000 customers
print(df.head(3).to_string())
for c in CAT + ["pincode"]:
    vc = df[c].value_counts()
    print(f"{c:8s} distinct values {df[c].nunique():5d}   values with fewer than 10 customers {(vc &lt; 10).sum():5d}")
wide = pd.get_dummies(df[CAT + ["pincode"]])
print("one-hot columns:", wide.shape[1], f"  share of zeros: {(wide.values == 0).mean():.2%}")</div>
  <div class="fx" data-lang="text">       city      plan     payment  device  tenure  support_calls  monthly_bill   pincode
0  city_072    family        card  dev_13    18.0              0        1024.0  pin_4035
1  city_009   premium  netbanking  dev_19     1.0              2        1159.0  pin_3558
2  city_065  standard        card  dev_11    10.0              3         752.0  pin_1437
city     distinct values   300   values with fewer than 10 customers    60
plan     distinct values     5   values with fewer than 10 customers     0
payment  distinct values     4   values with fewer than 10 customers     0
device   distinct values    40   values with fewer than 10 customers     0
pincode  distinct values  4815   values with fewer than 10 customers  4764
one-hot columns: 5164   share of zeros: 99.90%</div>
  <p>The <strong>cardinality</strong> of a column, its number of distinct values, varies enormously: 4 payment methods, 5 plans, 40 devices, 300 cities and about 4,800 pincodes. One-hot encoding would create 5,164 columns that are 99.9% zeros. Sixty cities and almost every pincode have fewer than 10 customers, and a one-hot column for a pincode with 3 customers can never give a useful split, because any leaf built on it holds 3 rows.</p>
  <p>The third way is a <strong>target statistic</strong>: replace each value with a number computed from the label, such as the play rate on overcast days (4/4 = 1.0) or the churn rate of Pune customers. One column, ordered by exactly what matters, for any number of values. This is the right idea, and it is what CatBoost does. Done naively, though, it leaks the answer into the feature, and understanding that leak is the key to everything else in CatBoost.</p>

  <h2 id="cb-leak"><span class="num">02</span>Target Encoding and the Leak</h2>
  <p>The plain, "greedy" target statistic for a category value c is the mean label of all training rows with that value, usually smoothed towards a prior P (such as the overall churn rate) with weight a: x̂(c) = (sum of y over rows with c + a·P) / (count of rows with c + a). The smoothing keeps rare values close to the prior. To see what goes wrong, take two diary columns: the Day itself (D1 to D14, a "category" with a different value on every row, like a customer ID) and Outlook, encoded with the leave-one-out version that many people reach for as a fix:</p>
  <div class="fx" data-lang="py">from play import df
d = df.reset_index().rename(columns={"index": "Day"})
d["y"] = (d.Play == "Yes").astype(int)
d["Day_TE"] = d.groupby("Day")["y"].transform("mean")            # mean label per Day (one row each)
print("Day_TE equals the label on every row:", bool((d.Day_TE == d.y).all()))
S = d.groupby("Outlook")["y"].transform("sum")
n = d.groupby("Outlook")["y"].transform("count")
d["Outlook_LOO"] = (S - d.y) / (n - 1)                            # leave-one-out: drop the row's own label
print(d[d.Outlook == "Sunny"][["Day", "Outlook", "y", "Outlook_LOO"]].to_string(index=False))</div>
  <div class="fx" data-lang="text">Day_TE equals the label on every row: True
Day Outlook  y  Outlook_LOO
 D1   Sunny  0         0.50
 D2   Sunny  0         0.50
 D8   Sunny  0         0.50
 D9   Sunny  1         0.25
D11   Sunny  1         0.25</div>
  <p>With one row per day, the mean label of a day <em>is</em> that day's own label, so the encoded Day column is a perfect copy of the target. A tree splits on "Day_TE &gt; 0.5" and gets all 14 days right. For a new day, D15, the value has never been seen, the encoding falls back to the prior, and the feature is useless. The model learned the answer key, not a pattern. Smoothing only softens this, because (y + a·P)/(1 + a) is still a perfect function of y.</p>
  <p>The second table shows why <strong>leave-one-out</strong> encoding, which excludes the row's own label, x̂ = (S − y)/(n − 1) where S is the category's label sum, does not fix it. Sunny has 5 days, 2 of them played. The two played sunny days get (2 − 1)/4 = 0.25 and the three unplayed ones get (2 − 0)/4 = 0.50. Within Sunny the encoding is a perfect, reversed copy of the label: "Outlook_LOO &lt; 0.4 means played". The leak has not gone; it has been flipped upside down.</p>
  <p>The root cause is a mismatch between training and new data. For a training row, the encoding was computed with (or, for leave-one-out, against) its own label, so on the training set the link between encoding and label is stronger than it can ever be for a new row, whose label was not used. The model learns the training relationship and applies it where it does not hold. The CatBoost paper calls this <strong>target leakage</strong>, and the resulting difference between how the feature behaves on training and test rows a <strong>prediction shift</strong>. Picture a class where every student marks their own answer sheet before handing it in: the marks will match "who wrote it" far better than real knowledge does, and on the board exam, marked by someone else, that match vanishes. The fix is that nobody may use their own answers to compute their own mark.</p>
  <p>How bad is it on real data? In the churn table, <strong>pincode is pure noise</strong>: it was drawn at random and has no effect on churn, so any model that relies on it is fooling itself. Fit LightGBM on the three numeric columns plus one encoding of pincode, and compare with CatBoost given the raw pincode as a categorical column:</p>
  <div class="fx" data-lang="py">import pandas as pd, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score
from cchurn import Ctr, Cte, cytr, cyte
num = ["tenure", "support_calls", "monthly_bill"]       # real signal; pincode is pure noise
prior = cytr.mean()
def naive_te(col_tr, y_tr, col):                        # churn rate per pincode from ALL training rows
    return col.map(pd.Series(y_tr, index=col_tr.index).groupby(col_tr).mean()).fillna(prior)
def oof_te(col_tr, y_tr, k=5):                          # out-of-fold: each row encoded by the other folds
    out = pd.Series(prior, index=col_tr.index)
    for a, b in StratifiedKFold(k, shuffle=True, random_state=0).split(col_tr, y_tr):
        out.iloc[b] = naive_te(col_tr.iloc[a], y_tr[a], col_tr.iloc[b]).values
    return out
def run(name, te_train):
    A = Ctr[num].assign(pin=te_train.values)
    B = Cte[num].assign(pin=naive_te(Ctr.pincode, cytr, Cte.pincode).values)   # test rows: full-train rates
    m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, num_leaves=15, verbose=-1).fit(A, cytr)
    gain = m.booster_.feature_importance("gain")
    print(f"{name:24s} train AUC {roc_auc_score(cytr, m.predict_proba(A)[:, 1]):.3f}  "
          f"test AUC {roc_auc_score(cyte, m.predict_proba(B)[:, 1]):.3f}  pincode share {gain[-1] / gain.sum():5.1%}")
m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, num_leaves=15, verbose=-1).fit(Ctr[num], cytr)
print(f"{'no pincode at all':24s} train AUC {roc_auc_score(cytr, m.predict_proba(Ctr[num])[:, 1]):.3f}  "
      f"test AUC {roc_auc_score(cyte, m.predict_proba(Cte[num])[:, 1]):.3f}")
run("naive target encoding", naive_te(Ctr.pincode, cytr, Ctr.pincode))
run("5-fold out-of-fold", oof_te(Ctr.pincode, cytr))
cols = num + ["pincode"]
cb = CatBoostClassifier(iterations=300, learning_rate=0.05, depth=4, verbose=False, random_seed=0)
cb.fit(Ctr[cols], cytr, cat_features=["pincode"])
imp = cb.get_feature_importance()
print(f"{'CatBoost, raw pincode':24s} train AUC {roc_auc_score(cytr, cb.predict_proba(Ctr[cols])[:, 1]):.3f}  "
      f"test AUC {roc_auc_score(cyte, cb.predict_proba(Cte[cols])[:, 1]):.3f}  pincode share {imp[-1] / imp.sum():5.1%}")</div>
  <div class="fx" data-lang="text">no pincode at all        train AUC 0.751  test AUC 0.642
naive target encoding    train AUC 0.936  test AUC 0.539  pincode share 80.3%
5-fold out-of-fold       train AUC 0.764  test AUC 0.640  pincode share  8.7%
CatBoost, raw pincode    train AUC 0.698  test AUC 0.649  pincode share 14.0%</div>
  <p>Without pincode, the honest baseline is test AUC 0.642. With naive target encoding, training AUC jumps to 0.936 and the model spends 80% of its total gain on pincode, a column of pure noise; test AUC <em>drops</em> to 0.539, far worse than not having the column at all. On training rows the encoded pincode "knows" the label; on test rows it does not. Out-of-fold encoding, where each row is encoded only from the other four folds, removes the leak: test AUC is back at the baseline (0.640) and pincode is barely used. CatBoost with the raw pincode has the smallest gap between training and test (0.698 against 0.649) and the best test score; the noise column gets a modest share of importance and does no harm. (Part of the difference is that CatBoost is a different model from LightGBM; the point is that the noise column did not fool it.) The same rule applies to any target encoding you write yourself: fit it inside each cross-validation fold, never on the whole dataset first.</p>

  <h2 id="cb-ots"><span class="num">03</span>Ordered Target Statistics</h2>
  <p>Out-of-fold encoding works, but each row is encoded from only part of the data and you must manage the folds yourself. CatBoost borrows a cleaner idea from online learning. When examples arrive one at a time, like transactions in a bank, each example can only be encoded using the past, so there is never a leak. A table has no time, so CatBoost <strong>invents one</strong>: it shuffles the training rows into a random order and encodes each row using only the rows that come <em>before</em> it with the same category value. This is an <strong>ordered target statistic</strong>:</p>
  <p style="text-align:center"><strong>x̂<sub>k</sub> = ( Σ<sub>earlier rows with the same value</sub> y + a·P ) / ( number of those rows + a )</strong></p>
  <p>P is a prior and a is its weight, as before: think of it as "a imaginary earlier rows with label P". A row never sees its own label, yet every earlier row is used and no data is wasted on folds. Think of a queue at a ticket counter where each person may only ask the people ahead of them how long the wait was: nobody's estimate includes their own experience.</p>
  <p>Work it on the diary with prior P = 0.5 and a = 1. Shuffle the 14 days, then walk down the shuffled list, keeping running counts per outlook:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
d = df.reset_index().rename(columns={"index": "Day"})
d["y"] = (d.Play == "Yes").astype(int)
d = d.iloc[np.random.default_rng(3).permutation(14)].reset_index(drop=True)   # a random "time" order
P, a = 0.5, 1.0                                                                 # prior and its weight
seen_sum, seen_n, ts = {}, {}, []
for c, y in zip(d.Outlook, d.y):
    ts.append((seen_sum.get(c, 0) + a * P) / (seen_n.get(c, 0) + a))         # only EARLIER rows
    seen_sum[c] = seen_sum.get(c, 0) + y; seen_n[c] = seen_n.get(c, 0) + 1
d["ordered_TS"] = np.round(ts, 3)
d["greedy_TS"] = np.round(d.groupby("Outlook")["y"].transform(lambda s: (s.sum() + a * P) / (len(s) + a)), 3)
print(d[["Day", "Outlook", "y", "ordered_TS", "greedy_TS"]].to_string())</div>
  <div class="fx" data-lang="text">    Day   Outlook  y  ordered_TS  greedy_TS
0   D11     Sunny  1       0.500      0.417
1   D10      Rain  1       0.500      0.583
2   D14      Rain  0       0.750      0.583
3    D3  Overcast  1       0.500      0.900
4   D13  Overcast  1       0.750      0.900
5    D1     Sunny  0       0.750      0.417
6    D2     Sunny  0       0.500      0.417
7    D5      Rain  1       0.500      0.583
8    D8     Sunny  0       0.375      0.417
9    D7  Overcast  1       0.833      0.900
10  D12  Overcast  1       0.875      0.900
11   D6      Rain  0       0.625      0.583
12   D4      Rain  1       0.500      0.583
13   D9     Sunny  1       0.300      0.417</div>
  <p>Follow the five sunny days in their shuffled order. D11 comes first with no earlier sunny day, so it gets the prior alone, (0 + 0.5)/(0 + 1) = 0.5. D1 comes next with one earlier sunny day (D11, played): (1 + 0.5)/(1 + 1) = 0.75. D2 has two earlier sunny days with one play: 1.5/3 = 0.5. D8 has three: 1.5/4 = 0.375. D9 has four: 1.5/5 = 0.3. No day's value depends on its own label. Compare the greedy statistic, which gives every sunny day the same (2 + 0.5)/(5 + 1) = 0.417, built partly from its own label. The ordered values vary from day to day, and the variation has nothing to do with the day's own label: D9 was played yet got the lowest value, 0.3. That is exactly how a new day's encoding behaves, so training and test now look alike. The price is noise for early rows: D11 was encoded from no history at all.</p>
  <p>To reduce that noise CatBoost uses several random orders, a different one for different trees, so no row is always "early". At prediction time there is nothing to leak, so a new customer's city is encoded from <em>all</em> training rows: a new sunny day gets the full-data value 0.417. CatBoost calls these statistics <strong>CTRs</strong> (from "click-through rate", their origin in Yandex's ad systems) and builds several per column: <strong>Borders</strong>, the ordered target mean described above, computed with several priors, and <strong>Counter</strong>, how often the value occurs, which uses no labels at all. Each CTR becomes a numeric column that trees split with ordinary thresholds. If your rows have a real time order, such as transactions, a random order would let a row's encoding use rows from its own future; sort by time and pass <code>has_time=True</code> so CatBoost uses the real order.</p>

  <h2 id="cb-ordered"><span class="num">04</span>Prediction Shift and Ordered Boosting</h2>
  <p>Ordered statistics keep labels out of the category encodings. But the boosting loop itself has the same leak in a different place. Every booster fits tree t to the residuals (gradients) of the current model, and that model was trained on these very rows. So a training row's residual is computed by a model that has partly memorised it, and it comes out <em>smaller</em> than the residual the same model would leave on a new row. Each tree is fitted to over-optimistic residuals.</p>
  <p>The diary makes this concrete. Predict Turnout with squared error, and suppose a leaf holds the four overcast days D3, D7, D12, D13, with turnouts 36, 42, 38 and 48 and a current prediction of 0, so the leaf's value is their mean.</p>
  <table class="tbl">
    <tr><th></th><th>Leaf value used for D13</th><th>D13's residual</th></tr>
    <tr><td>In-sample: leaf fitted on all four days</td><td>(36 + 42 + 38 + 48)/4 = 41</td><td>48 − 41 = <strong>7</strong></td></tr>
    <tr><td>Honest: leaf fitted on the other three</td><td>(36 + 42 + 38)/3 = 38.67</td><td>48 − 38.67 = <strong>9.33</strong></td></tr>
  </table>
  <p>The in-sample residual is a quarter smaller than the honest one, because the leaf already moved towards D13 when it saw D13. For a leaf of n rows, each in-sample residual is shrunk by the factor (n − 1)/n (here 3/4, and 9.33 × 0.75 = 7), so small leaves and small datasets suffer most. The next tree is then fitted to residuals biased towards "already fine", and the model learns noise in the training rows instead of the real remaining error. The paper proves this bias exists in all standard boosting and calls it the prediction shift of the model, the same name as before, because it is the same mechanism: a number for row k computed from something that used y<sub>k</sub>.</p>
  <p><strong>Ordered boosting</strong> applies the same cure. Take the random order again and imagine keeping a separate supporting model M<sub>i</sub> for every prefix of the order, M<sub>i</sub> trained only on the first i rows. The residual of the row in position i is computed with M<sub>i−1</sub>, a model that has never seen it, and the tree's structure is chosen using these honest residuals. In the diary's shuffled order above, D9 (last) would get its residual from a model built on the 13 days before it, and D11 (first) from the starting value alone. Keeping n models is impossible, so CatBoost keeps models only for prefixes of length 1, 2, 4, 8, and so on, about log<sub>2</sub> n of them, and uses several orders for different trees. Only the tree structure is chosen with the ordered residuals; the final leaf values are computed normally, and prediction uses only the final model.</p>
  <p>The setting is <code>boosting_type</code>: <code>"Plain"</code> is classic boosting (ordered statistics are still used for the categories) and <code>"Ordered"</code> adds ordered boosting. The paper reports the biggest benefit on small datasets, where in-sample residuals are most biased. Here are 1,000 trees without early stopping, so any overfitting has room to show, on training sets of three sizes:</p>
  <div class="fx" data-lang="py">import time
from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score, log_loss
from cchurn import CAT, Ctr, Cte, cytr, cyte
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
for n_rows in [300, 3000, 12000]:
    A, ya = Ctr[feats].iloc[:n_rows], cytr[:n_rows]
    for bt in ["Plain", "Ordered"]:
        t0 = time.time()
        m = CatBoostClassifier(iterations=1000, learning_rate=0.05, depth=6, boosting_type=bt,
                               random_seed=0, verbose=False).fit(A, ya, cat_features=CAT)
        p = m.predict_proba(Cte[feats])[:, 1]
        print(f"{n_rows:6d} rows  {bt:7s}  test log loss {log_loss(cyte, p):.4f}  AUC {roc_auc_score(cyte, p):.4f}"
              f"  {time.time() - t0:4.1f}s")</div>
  <div class="fx" data-lang="text">   300 rows  Plain    test log loss 0.6954  AUC 0.6043   6.8s
   300 rows  Ordered  test log loss 0.6516  AUC 0.5725  39.1s
  3000 rows  Plain    test log loss 0.5012  AUC 0.6964  11.7s
  3000 rows  Ordered  test log loss 0.4836  AUC 0.7071  34.1s
 12000 rows  Plain    test log loss 0.4642  AUC 0.7396  52.3s
 12000 rows  Ordered  test log loss 0.4627  AUC 0.7426  85.8s</div>
  <p>Look first at log loss, which measures how good the probabilities are. On 300 rows, plain boosting run for 1,000 trees overfits badly (0.695, worse than predicting the base rate) and Ordered boosting is clearly better (0.652): honest residuals stop the trees from chasing training noise so hard. On 3,000 rows Ordered still helps (0.501 to 0.484) and here also lifts AUC (0.696 to 0.707). On 12,000 rows the two are almost identical (0.464 against 0.463), because with plenty of data each row's own influence on the model is tiny. AUC, which only measures ranking, moves less consistently; on 300 rows it is even lower with Ordered, and on so few rows AUC is noisy. And Ordered is always slower, here between 1.6 and 6 times (timings approximate). This matches the paper and the library's choice: the in-sample bias matters most on small data, which is why the automatic default picks Plain on most datasets, and why early stopping, which also stops the overfitting, narrows the gap further in practice.</p>

  <h2 id="cb-oblivious"><span class="num">05</span>Symmetric (Oblivious) Trees</h2>
  <p>The two ordered ideas fix where CatBoost's numbers come from. The third idea is about the shape of each tree. In an ordinary tree every node picks its own question. In an <strong>oblivious tree</strong>, also called a symmetric tree, every node at the same depth asks the <em>same</em> question. A depth-d oblivious tree is therefore just a list of d (feature, threshold) questions, and it always has exactly 2<sup>d</sup> leaves.</p>
  <figure class="viz"><svg viewBox="0 0 640 212" width="640"><g stroke="currentColor"><line x1="150" y1="34" x2="90" y2="94"/><line x1="150" y1="34" x2="210" y2="94"/><line x1="90" y1="94" x2="55" y2="160"/><line x1="90" y1="94" x2="125" y2="160"/><line x1="210" y1="94" x2="175" y2="160"/><line x1="210" y1="94" x2="245" y2="160"/><line x1="470" y1="34" x2="410" y2="94"/><line x1="470" y1="34" x2="530" y2="94"/><line x1="410" y1="94" x2="375" y2="160"/><line x1="410" y1="94" x2="445" y2="160"/><line x1="530" y1="94" x2="495" y2="160"/><line x1="530" y1="94" x2="565" y2="160"/></g><rect x="95" y="20" width="110" height="28" rx="6" class="fb sb"/><text x="150" y="38" text-anchor="middle" font-size="11">tenure &lt; 12?</text><rect x="40" y="80" width="100" height="28" rx="6" class="fb sb"/><text x="90" y="98" text-anchor="middle" font-size="11">calls ≥ 3?</text><rect x="160" y="80" width="100" height="28" rx="6" class="fb sb"/><text x="210" y="98" text-anchor="middle" font-size="11">bill &gt; 900?</text><rect x="415" y="20" width="110" height="28" rx="6" class="ft st"/><text x="470" y="38" text-anchor="middle" font-size="11">tenure &lt; 12?</text><rect x="360" y="80" width="100" height="28" rx="6" class="ft st"/><text x="410" y="98" text-anchor="middle" font-size="11">calls ≥ 3?</text><rect x="480" y="80" width="100" height="28" rx="6" class="ft st"/><text x="530" y="98" text-anchor="middle" font-size="11">calls ≥ 3?</text><g class="fs" stroke="currentColor"><circle cx="55" cy="166" r="11"/><circle cx="125" cy="166" r="11"/><circle cx="175" cy="166" r="11"/><circle cx="245" cy="166" r="11"/><circle cx="375" cy="166" r="11"/><circle cx="445" cy="166" r="11"/><circle cx="495" cy="166" r="11"/><circle cx="565" cy="166" r="11"/></g><text x="375" y="170" text-anchor="middle" font-size="10">00</text><text x="445" y="170" text-anchor="middle" font-size="10">01</text><text x="495" y="170" text-anchor="middle" font-size="10">10</text><text x="565" y="170" text-anchor="middle" font-size="10">11</text><text x="150" y="200" text-anchor="middle" font-size="12">ordinary tree: each node its own question</text><text x="470" y="200" text-anchor="middle" font-size="12">oblivious tree: one question per level</text></svg><figcaption>Left: a normal depth-2 tree can ask "calls ≥ 3?" on one side and "bill &gt; 900?" on the other. Right: CatBoost's symmetric tree asks the same second question on both sides; the leaf number is just the two answers written as bits.</figcaption></figure>
  <p>Read the figure from the top. Both trees first ask "tenure &lt; 12?". On the left, the ordinary tree then asks a different second question on each side: support calls for new customers and the bill for older ones. On the right, the oblivious tree must ask one question for the whole second level, "calls ≥ 3?", on both sides. Because every row answers the same questions, its leaf is simply the answers written as a binary number: no to both is leaf 00, yes then no is leaf 10, and so on. It works like a form with fixed yes/no boxes, where the pattern of ticks is the filing number.</p>
  <p>On the diary, take an oblivious tree with the questions "Humidity high?" and "Wind strong?", and write yes as 1. D2 (high humidity, strong wind) answers 1, 1 and lands in leaf 2·1 + 1 = 3. D1 (high, weak) lands in leaf 2. D6 (normal, strong) lands in leaf 1, and D5 (normal, weak) in leaf 0. Every one of the 14 days is placed the same way, with no branching at all: d comparisons, a few bit shifts and one array lookup. That makes prediction very fast on CPUs and GPUs. An ordinary tree could ask about wind only on rainy days; the oblivious tree must ask it of every day at that level.</p>
  <p>That restriction is also a regulariser. A question must be good for <em>all</em> the nodes of a level at once (CatBoost scores a candidate by its total gain over every leaf of the level), so a split that only helps a few rows in one corner is rarely chosen, and the tree cannot grow a long thin branch around a handful of outliers the way a leaf-wise tree can. The price is that each tree is less flexible than a free tree of the same depth, so CatBoost often needs more trees. A real tree from the churn model shows the categorical columns entering as CTR questions:</p>
  <div class="fx" data-lang="py">import numpy as np
from catboost import CatBoostClassifier, Pool
from cchurn import CAT, Ctr, cytr
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
pool = Pool(Ctr[feats], cytr, cat_features=CAT)
m = CatBoostClassifier(iterations=30, depth=3, learning_rate=0.1, random_seed=0, verbose=False).fit(pool)
print("tree 3 asks one question per level:")
for level, s in enumerate(m._get_tree_splits(3, pool)):
    print(f"  level {level}: {s}")
leaves = [float(v.split("=")[1]) for v in m._get_tree_leaf_values(3)]
print(len(leaves), "leaf values:", np.round(leaves, 3))</div>
  <div class="fx" data-lang="text">tree 3 asks one question per level:
  level 0: support_calls, bin=3.5
  level 1: monthly_bill, bin=466.5
  level 2: {payment} counter_type=Borders prior_numerator=1, border=15
8 leaf values: [-0.106 -0.051 -0.078 -0.008 -0.014  0.    -0.003  0.   ]</div>
  <p>The tree asks exactly three questions, one per level: support calls above 3.5, monthly bill above 466.5, and the Borders CTR (ordered churn rate) of <code>payment</code> above one of its borders, with prior 1. It has 2<sup>3</sup> = 8 leaf values. The categorical column entered the tree only through its target statistic, as an ordinary numeric question. CatBoost can also grow free trees, <code>grow_policy="Depthwise"</code> (like XGBoost) or <code>"Lossguide"</code> (leaf-wise, like LightGBM). On the churn table, comparing accuracy and the time to predict 100,000 rows:</p>
  <div class="fx" data-lang="py">import time, pandas as pd
from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
from cchurn import CAT, Ctr, Cte, cytr, cyte
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
big = pd.concat([Cte[feats]] * 20, ignore_index=True)            # 100,000 rows to time prediction
for gp, kw in [("SymmetricTree", {"depth": 6}), ("Depthwise", {"depth": 6}),
               ("Lossguide", {"max_leaves": 64})]:
    m = CatBoostClassifier(iterations=300, learning_rate=0.08, grow_policy=gp, random_seed=0,
                           verbose=False, **kw).fit(Ctr[feats], cytr, cat_features=CAT)
    t0 = time.time(); m.predict_proba(big); pred = time.time() - t0
    print(f"{gp:13s} test AUC {roc_auc_score(cyte, m.predict_proba(Cte[feats])[:, 1]):.4f}"
          f"   predict 100k rows {pred:.2f}s")</div>
  <div class="fx" data-lang="text">SymmetricTree test AUC 0.7440   predict 100k rows 1.01s
Depthwise     test AUC 0.7332   predict 100k rows 1.88s
Lossguide     test AUC 0.7375   predict 100k rows 1.58s</div>
  <p>The default symmetric trees are both the most accurate here (0.744 against 0.733–0.738) and the fastest to predict, about twice as fast as depth-wise trees, because they are evaluated with a few comparisons and a lookup instead of walking branches (timings approximate). The free trees fit more detail per tree, and on this noisy categorical data that detail was mostly noise. Note that depth means something stronger in CatBoost than elsewhere: depth 10 is 1,024 leaves in <em>every</em> tree. Keep it between 4 and 10 (default 6).</p>

  <h2 id="cb-combo"><span class="num">06</span>Feature Combinations</h2>
  <p>Ordered statistics encode each categorical column on its own. But some patterns only exist in a <em>combination</em> of two columns, and a single column's statistic averages them away. On the diary, wind matters on rainy days and not on overcast ones:</p>
  <div class="fx" data-lang="py">from play import df
y = (df.Play == "Yes").astype(int)
print("Outlook alone:", y.groupby(df.Outlook).mean().round(2).to_dict())
print("Wind alone:   ", y.groupby(df.Wind).mean().round(2).to_dict())
combo = df.Outlook + "|" + df.Wind                      # a new category built from two columns
print("Outlook|Wind: ", y.groupby(combo).mean().round(2).to_dict())</div>
  <div class="fx" data-lang="text">Outlook alone: {'Overcast': 1.0, 'Rain': 0.6, 'Sunny': 0.4}
Wind alone:    {'Strong': 0.5, 'Weak': 0.75}
Outlook|Wind:  {'Overcast|Strong': 1.0, 'Overcast|Weak': 1.0, 'Rain|Strong': 0.0, 'Rain|Weak': 1.0, 'Sunny|Strong': 0.5, 'Sunny|Weak': 0.33}</div>
  <p>On its own, Rain looks like a 60% day and a strong wind looks like a coin flip (50%). Neither column alone can identify the group that was never played. The combined value "Rain|Strong" has a play rate of 0, and "Rain|Weak" has 1.0, so a single split on the combination's statistic separates them perfectly. That is the rule the <a class="xref" data-note="ml_dtree">decision tree</a> needed two levels for (Outlook, then Wind).</p>
  <p>CatBoost builds such combinations automatically and greedily while it grows a tree. After the first split on a categorical CTR, it tries combining the categorical columns already used in the current tree with other categorical columns: "plan = student AND payment = cash" becomes a new category value, gets its own ordered target statistic, and competes for the next split like any other feature. Only promising combinations are tried, because all pairs of a 300-value and a 40-value column would already be 12,000 values. <code>max_ctr_complexity</code> sets the largest number of columns in one combination (1 means no combinations). The churn table has a real interaction, students paying cash churn far more:</p>
  <div class="fx" data-lang="py">from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
from cchurn import CAT, Ctr, Cte, cytr, cyte
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
for mcc in [1, 2, 4]:
    m = CatBoostClassifier(iterations=500, learning_rate=0.05, depth=6, max_ctr_complexity=mcc,
                           random_seed=0, verbose=False).fit(Ctr[feats], cytr, cat_features=CAT)
    print(f"max_ctr_complexity={mcc}  test AUC {roc_auc_score(cyte, m.predict_proba(Cte[feats])[:, 1]):.4f}")</div>
  <div class="fx" data-lang="text">max_ctr_complexity=1  test AUC 0.7416
max_ctr_complexity=2  test AUC 0.7455
max_ctr_complexity=4  test AUC 0.7438</div>
  <p>Without combinations the test AUC is 0.7416. Allowing pairs lifts it to 0.7455, and allowing up to 4 columns adds nothing more (0.7438 is within noise of 0.7455): the real interaction here involves two columns. The improvement is modest, but it costs no feature engineering at all. Combinations multiply cardinality, so each combined value has fewer rows and noisier statistics, and they cost time and memory; if CatBoost is slow on many categorical columns, lowering <code>max_ctr_complexity</code> to 1 or 2 is one of the first speed knobs.</p>

  <h2 id="cb-params"><span class="num">07</span>Defaults and Parameters</h2>
  <p>CatBoost is known for working well with its defaults, and it is worth knowing what those defaults are and what CatBoost does on your behalf. Asking a default model on the churn table which settings it actually used:</p>
  <div class="fx" data-lang="py">from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
from cchurn import CAT, Ctr, Cte, cytr, cyte
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
m = CatBoostClassifier(verbose=False, random_seed=0).fit(Ctr[feats], cytr, cat_features=CAT)
print(f"pure defaults: test AUC {roc_auc_score(cyte, m.predict_proba(Cte[feats])[:, 1]):.4f}")
keys = ["iterations", "learning_rate", "depth", "l2_leaf_reg", "boosting_type", "grow_policy",
        "one_hot_max_size", "max_ctr_complexity", "border_count", "bootstrap_type", "nan_mode"]
for k in keys:
    print(f"  {k:18s} {m.get_all_params().get(k)}")</div>
  <div class="fx" data-lang="text">pure defaults: test AUC 0.7447
  iterations         1000
  learning_rate      0.029767999425530434
  depth              6
  l2_leaf_reg        3
  boosting_type      Plain
  grow_policy        SymmetricTree
  one_hot_max_size   2
  max_ctr_complexity 4
  border_count       254
  bootstrap_type     MVS
  nan_mode           Min</div>
  <p>With no tuning at all, 1,000 trees and an automatically chosen learning rate of 0.0298, CatBoost reaches a test AUC of 0.7447, as good as a carefully early-stopped run (section 08). The printed settings show the rest of its default behaviour on this data: Plain boosting (ordered boosting is chosen automatically only for small data), symmetric trees, one-hot encoding only for columns with at most 2 values (<code>one_hot_max_size</code>), combinations of up to 4 categorical columns, 254 bins for numeric columns (<code>border_count</code>, like LightGBM's <code>max_bin</code>), MVS row sampling (which favours rows with large gradients, an idea close to LightGBM's GOSS) and missing numeric values treated as smaller than every value (<code>nan_mode="Min"</code>), so a split can still separate them. Missing categorical values have to be given as a category of their own, such as the string "missing".</p>
  <table class="tbl">
    <tr><th>Parameter (alias)</th><th>Default</th><th>Effect</th><th>Typical range</th></tr>
    <tr><td><code>iterations</code> (n_estimators)</td><td>1000</td><td>number of trees</td><td>set high with early stopping</td></tr>
    <tr><td><code>learning_rate</code></td><td>automatic</td><td>chosen from data size and iterations if not set</td><td>0.01–0.1</td></tr>
    <tr><td><code>depth</code></td><td>6</td><td>levels of the symmetric tree, 2<sup>depth</sup> leaves</td><td>4–10</td></tr>
    <tr><td><code>l2_leaf_reg</code> (reg_lambda)</td><td>3</td><td>L2 on leaf values, the λ in −G/(H + λ)</td><td>1–10</td></tr>
    <tr><td><code>cat_features</code></td><td>none</td><td>which columns are categorical</td><td>always set</td></tr>
    <tr><td><code>one_hot_max_size</code></td><td>2</td><td>one-hot instead of CTRs for small columns</td><td>2–10</td></tr>
    <tr><td><code>max_ctr_complexity</code></td><td>4</td><td>largest categorical combination</td><td>1–4</td></tr>
    <tr><td><code>boosting_type</code></td><td>automatic</td><td>Plain or Ordered</td><td>Ordered for small data</td></tr>
    <tr><td><code>random_strength</code></td><td>1</td><td>random noise added to split scores, more diverse trees</td><td>0–10</td></tr>
    <tr><td><code>bootstrap_type</code>, <code>bagging_temperature</code></td><td>MVS / Bayesian, 1</td><td>row sampling or random row weights</td><td>—</td></tr>
    <tr><td><code>auto_class_weights</code></td><td>none</td><td>Balanced or SqrtBalanced for imbalance (probabilities no longer calibrated)</td><td>—</td></tr>
    <tr><td><code>text_features</code>, <code>task_type="GPU"</code></td><td>—</td><td>built-in text features; GPU training</td><td>—</td></tr>
  </table>
  <p>A sensible tuning order is: learning rate with early stopping, then depth, then <code>l2_leaf_reg</code>, then <code>random_strength</code> and <code>bagging_temperature</code>, and finally <code>one_hot_max_size</code> and <code>max_ctr_complexity</code> for speed. The defaults are strong, but the learning rate and the number of trees still matter, so always early-stop on a validation set.</p>

  <h2 id="cb-code"><span class="num">08</span>Full Training Code</h2>
  <p>A complete run on the churn table, from raw string columns to a saved model. A <code>Pool</code> is CatBoost's data container: it holds the features, the labels and the list of categorical columns. Early stopping watches the validation AUC, and <code>use_best_model=True</code> keeps only the trees up to the best round:</p>
  <div class="fx" data-lang="py">import numpy as np
from catboost import CatBoostClassifier, Pool
from sklearn.metrics import roc_auc_score
from cchurn import CAT, Ctr, Cva, Cte, cytr, cyva, cyte
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
train = Pool(Ctr[feats], cytr, cat_features=CAT)       # raw strings: no encoding code at all
val = Pool(Cva[feats], cyva, cat_features=CAT)
model = CatBoostClassifier(iterations=3000, learning_rate=0.05, depth=6, eval_metric="AUC",
                           early_stopping_rounds=200, random_seed=0, verbose=250)
model.fit(train, eval_set=val, use_best_model=True)
p = model.predict_proba(Cte[feats])[:, 1]
print(f"trees kept {model.tree_count_}, test AUC {roc_auc_score(cyte, p):.4f}")
print(model.get_feature_importance(prettified=True).round(1).to_string(index=False))
model.save_model("churn_cb.cbm")
again = CatBoostClassifier().load_model("churn_cb.cbm")
print("reloaded model, same predictions:", np.allclose(again.predict_proba(Cte[feats])[:, 1], p))</div>
  <div class="fx" data-lang="text">0:	test: 0.6441043	best: 0.6441043 (0)	total: 89.8ms	remaining: 4m 29s
250:	test: 0.7447862	best: 0.7447862 (250)	total: 8.92s	remaining: 1m 37s
500:	test: 0.7452967	best: 0.7455714 (415)	total: 17.4s	remaining: 1m 26s
Stopped by overfitting detector  (200 iterations wait)

bestTest = 0.7455714069
bestIteration = 415

Shrink model to first 416 iterations.
trees kept 416, test AUC 0.7447
   Feature Id  Importances
         city         22.9
       device         16.8
       tenure         14.8
         plan         11.9
support_calls         11.3
      payment         11.3
 monthly_bill         11.1
reloaded model, same predictions: True</div>
  <p>The log prints the validation AUC every 250 trees. The best round was 415, and after 200 rounds without improvement the overfitting detector stopped training and shrank the model to 416 trees, with test AUC 0.7447. There is no encoding code anywhere: the categorical columns went in as strings. They also matter a great deal: city, device, plan and payment together carry about 63% of the importance, with city alone the most important feature. The default importance type ("PredictionValuesChange") measures how much predictions change when a feature is used; for explanations prefer SHAP values, which CatBoost computes natively with <code>get_feature_importance(type="ShapValues")</code> (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>). The model saves to CatBoost's binary <code>.cbm</code> format and reloads to identical predictions; it can also be exported to JSON, ONNX or C++ code.</p>

  <h2 id="cb-when"><span class="num">09</span>When to Choose CatBoost</h2>
  <p>The three big boosting libraries share the same maths, so the choice comes down to data and time. Here they are head to head on the churn table, each with its own way of handling categories and with early stopping, plus XGBoost on one-hot columns (timings approximate, single-threaded):</p>
  <div class="fx" data-lang="py">import time, pandas as pd, lightgbm as lgb, xgboost as xgb
from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
from cchurn import df, CAT, Ctr, Cva, Cte, cytr, cyva, cyte
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
cats = {c: pd.CategoricalDtype(sorted(df[c].unique())) for c in CAT}
nat = lambda D: D[feats].astype(cats)                         # pandas category columns
oh_cols = pd.get_dummies(Ctr[feats], columns=CAT).columns
oh = lambda D: pd.get_dummies(D[feats], columns=CAT, dtype=float).reindex(columns=oh_cols, fill_value=0)
def report(name, p, t0):
    print(f"{name:28s} test AUC {roc_auc_score(cyte, p):.4f}   {time.time() - t0:5.1f}s")
t0 = time.time()
m = CatBoostClassifier(iterations=3000, learning_rate=0.05, early_stopping_rounds=200, random_seed=0,
                       verbose=False).fit(Ctr[feats], cytr, cat_features=CAT, eval_set=(Cva[feats], cyva))
report("CatBoost, raw strings", m.predict_proba(Cte[feats])[:, 1], t0)
t0 = time.time()
m = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.05, verbose=-1)
m.fit(nat(Ctr), cytr, eval_X=nat(Cva), eval_y=cyva, callbacks=[lgb.early_stopping(200, verbose=False)])
report("LightGBM, native categorical", m.predict_proba(nat(Cte))[:, 1], t0)
t0 = time.time()
m = xgb.XGBClassifier(n_estimators=3000, learning_rate=0.05, enable_categorical=True, max_cat_to_onehot=1,
                      early_stopping_rounds=200, eval_metric="logloss")
m.fit(nat(Ctr), cytr, eval_set=[(nat(Cva), cyva)], verbose=False)
report("XGBoost, enable_categorical", m.predict_proba(nat(Cte))[:, 1], t0)
t0 = time.time()
m = xgb.XGBClassifier(n_estimators=3000, learning_rate=0.05, early_stopping_rounds=200, eval_metric="logloss")
m.fit(oh(Ctr), cytr, eval_set=[(oh(Cva), cyva)], verbose=False)
report("XGBoost, one-hot", m.predict_proba(oh(Cte))[:, 1], t0)</div>
  <div class="fx" data-lang="text">CatBoost, raw strings        test AUC 0.7456    26.3s
LightGBM, native categorical test AUC 0.7364     1.8s
XGBoost, enable_categorical  test AUC 0.7253     3.1s
XGBoost, one-hot             test AUC 0.7347    23.1s</div>
  <p>CatBoost with raw strings is the most accurate (0.746), about 0.01 AUC ahead of LightGBM's native categorical splits (0.736) and XGBoost on one-hot columns (0.735). XGBoost's own categorical mode, which, like LightGBM, chooses category groups from the training gradients, did worst (0.725): with 300 cities, many of them rare, gradient-sorted groupings overfit, which is exactly the leak CatBoost was built to avoid. The price is training time: CatBoost took about 26 seconds against LightGBM's 2. That trade-off is the whole decision.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Choose</th><th>Why</th></tr>
    <tr><td>Many categorical columns, some with high cardinality</td><td>CatBoost</td><td>leak-free encoding and combinations, no encoding work</td></tr>
    <tr><td>Small to medium data, little time to tune</td><td>CatBoost</td><td>strong defaults, symmetric trees, ordered schemes resist overfitting</td></tr>
    <tr><td>Very fast prediction needed</td><td>CatBoost</td><td>symmetric trees evaluate with lookups</td></tr>
    <tr><td>Very large numeric or sparse data, training time matters</td><td><a class="xref" data-note="ml_lightgbm">LightGBM</a></td><td>histograms, leaf-wise growth, GOSS, EFB</td></tr>
    <tr><td>Custom objectives, mature distributed and GPU tooling</td><td><a class="xref" data-note="ml_xgboost">XGBoost</a></td><td>most widely deployed, flexible API</td></tr>
    <tr><td>The last fraction of a percent</td><td>all three, blended</td><td>different biases; see <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a></td></tr>
  </table>
  <p>In one line each: XGBoost contributed regularised Newton boosting and the systems engineering; LightGBM contributed speed through histograms, leaf-wise growth, GOSS and EFB; CatBoost contributed leak-free handling of categories and gradients, with symmetric trees that are hard to overfit and fast to evaluate.</p>

  <h2 id="cb-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The commonest mistake is forgetting to tell CatBoost which columns are categorical, and the second is a missing value inside a categorical column. Both stop training with an error, which at least makes them easy to spot:</p>
  <div class="fx" data-lang="py">import textwrap
import numpy as np
from catboost import CatBoostClassifier
from cchurn import CAT, Ctr, cytr
feats = ["city", "plan", "tenure"]
try:
    CatBoostClassifier(iterations=10, verbose=False).fit(Ctr[feats], cytr)                 # forgot cat_features
except Exception as e:
    print(type(e).__name__, ":", textwrap.shorten(str(e), 100))
X = Ctr[feats].copy(); X.loc[X.index[0], "city"] = np.nan                                 # one NaN in a category
try:
    CatBoostClassifier(iterations=10, verbose=False).fit(X, cytr, cat_features=["city", "plan"])
except Exception as e:
    print(type(e).__name__, ":", textwrap.shorten(str(e), 100))
X["city"] = X["city"].fillna("missing")                                                     # the fix
m = CatBoostClassifier(iterations=10, verbose=False).fit(X, cytr, cat_features=["city", "plan"])
print("after fillna('missing'): trained", m.tree_count_, "trees")</div>
  <div class="fx" data-lang="text">CatBoostError : Bad value for num_feature[non_default_doc_idx=0,feature_idx=0]="city_087": Cannot convert [...]
CatBoostError : Invalid type for cat_feature[non-default value idx=0,feature_idx=0]=nan : cat_features must be [...]
after fillna('missing'): trained 10 trees</div>
  <p>Without <code>cat_features</code>, CatBoost tries to read "city_087" as a number and fails. (If the categories were integer codes instead of strings, there would be no error at all: they would silently be treated as numbers with a fake order, which is worse.) A NaN inside a categorical column is refused because categories must be strings or integers; pandas also turns an integer column with a NaN into floats, which CatBoost refuses as categories. Filling missing categories with an explicit value such as "missing" fixes both, and makes "missing" a category with its own statistic.</p>
  <p>The next mistake is encoding categories yourself before handing them to CatBoost. One-hot or target encoding throws away its main advantage, and naive target encoding reintroduces the very leak CatBoost was built to avoid; give it the raw values and list them in <code>cat_features</code>. Third, using random orders on data that has a real time order lets encodings use the future: sort by time, set <code>has_time=True</code> and validate on a later period. Fourth, very deep symmetric trees: depth 12 means 4,096 leaves in every tree and slow training. Finally, as with every booster, class weights such as <code>auto_class_weights</code> distort probabilities, so recalibrate or move the threshold instead, and do not assume "no tuning needed" means no early stopping.</p>

  <h2 id="cb-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Cardinality</b>: number of distinct values of a categorical column.</li>
    <li><b>Target statistic (CTR)</b>: a number computed from the labels of rows sharing a category value (Borders = target mean; Counter = frequency).</li>
    <li><b>Target leakage / prediction shift</b>: a row's feature (or residual) computed using its own label, so training rows behave differently from new rows.</li>
    <li><b>Ordered target statistic</b>: encode each row from earlier rows of a random order only, plus a prior.</li>
    <li><b>Ordered boosting</b>: each row's residual comes from a model trained only on earlier rows.</li>
    <li><b>Oblivious (symmetric) tree</b>: the same question at every node of a level; 2<sup>depth</sup> leaves; leaf index = answer bits.</li>
    <li><b>Feature combination</b>: categorical columns joined into a new category with its own statistic.</li>
  </ul>
  <h3>Formulas and diary values</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Diary value</th></tr>
    <tr><td>Greedy TS</td><td>(Σ<sub>c</sub> y + a·P)/(count(c) + a)</td><td>Sunny: (2 + 0.5)/(5 + 1) = 0.417</td></tr>
    <tr><td>Leave-one-out</td><td>(S − y)/(n − 1)</td><td>sunny played 0.25, unplayed 0.50 (reversed leak)</td></tr>
    <tr><td>Ordered TS</td><td>(Σ<sub>earlier, same c</sub> y + a·P)/(earlier count + a)</td><td>D9: (1 + 0.5)/(4 + 1) = 0.3</td></tr>
    <tr><td>In-sample residual</td><td>honest residual × (n − 1)/n</td><td>D13: 9.33 × 3/4 = 7</td></tr>
    <tr><td>Oblivious leaf index</td><td>Σ answer bits × powers of 2</td><td>humid and windy → 3</td></tr>
    <tr><td>Leaf value</td><td>−G/(H + l2_leaf_reg)</td><td>default λ = 3</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from catboost import CatBoostClassifier, Pool
train = Pool(X_train, y_train, cat_features=["city", "plan"])   # raw strings
val = Pool(X_val, y_val, cat_features=["city", "plan"])
m = CatBoostClassifier(iterations=3000, learning_rate=0.05, depth=6,
                       eval_metric="AUC", early_stopping_rounds=200)
m.fit(train, eval_set=val, use_best_model=True)
m.predict_proba(X_test)[:, 1]
m.save_model("model.cbm")</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Always pass <code>cat_features</code>; integer codes without it become numbers with a fake order.</li>
    <li>No NaN in categorical columns: fill with "missing".</li>
    <li>Do not pre-encode categories; never target-encode outside CV folds.</li>
    <li>Real time order: sort and set <code>has_time=True</code>.</li>
    <li>Depth d = 2<sup>d</sup> leaves in every tree; stay at 4–10.</li>
    <li>Ordered boosting is not the default on most data; ordered statistics always are.</li>
  </ul>

  <h2 id="cb-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problem does CatBoost solve that XGBoost and LightGBM do not?</summary><div class="qa-body">It handles categorical columns with target statistics computed without target leakage, and removes the same leakage from boosting's residuals. XGBoost needs categories encoded by you or uses gradient-based grouping, and LightGBM sorts categories by the training rows' own gradients, which overfits rare, high-cardinality values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare label encoding, one-hot encoding and target encoding for trees.</summary><div class="qa-body">Label encoding gives one column but invents an order, so trees need many splits to group values. One-hot has no fake order but creates a column per value and only allows one-versus-rest splits, which fail for rare values. Target encoding gives one well-ordered column for any number of values, but computed naively it leaks the label.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is naive target encoding dangerous?</summary><div class="qa-body">Each row's encoding includes its own label, so on training data the feature looks more predictive than it can be on new rows; with one row per value it equals the label. The model relies on it and fails on test data. On the churn table a pure-noise pincode column, naively encoded, took 80% of the gain and dropped test AUC from 0.64 to 0.54.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does leave-one-out encoding still leak?</summary><div class="qa-body">Within a category the sum S and count n are fixed, so (S − y)/(n − 1) is a decreasing function of the row's own label: positive rows get a lower value than negative rows. A tree can split on it and recover the label exactly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain ordered target statistics.</summary><div class="qa-body">Shuffle the training rows. Encode each row with the target mean of the earlier rows in that order that share its category, smoothed with a prior: (Σ earlier y + a·P)/(earlier count + a). No row uses its own label, yet all earlier rows are used. Several orders reduce the noise for early rows, and at prediction time all training rows are used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do ordered statistics compare with out-of-fold target encoding?</summary><div class="qa-body">Both guarantee that a row's encoding never uses its own label. Out-of-fold encoding uses a fixed (K − 1)/K of the data per row and needs fold management; ordered statistics use all earlier rows in a random order, need no folds, and vary the order across trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is prediction shift in gradient boosting?</summary><div class="qa-body">The residuals of training rows are computed by a model that was trained on those rows, so they are smaller than the residuals the model leaves on new rows; in a leaf of n rows each is shrunk by about (n − 1)/n. Later trees are fitted to biased residuals and learn noise. The effect is largest for small leaves and small datasets.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does ordered boosting fix it, and is it always on?</summary><div class="qa-body">Each row's residual is computed by a model trained only on the rows before it in a random order; CatBoost keeps models for prefixes of length 1, 2, 4, 8, … to make this affordable. It is not always on: the default on most data is Plain boosting, with Ordered chosen for small datasets. Ordered target statistics for categories are used in both modes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an oblivious tree, and why does CatBoost use it?</summary><div class="qa-body">Every node at a given depth asks the same question, so a depth-d tree is d questions and 2<sup>d</sup> leaves, and a row's leaf is the binary number formed by its answers. Prediction is branch-free and very fast, and because each question must help the whole level, the trees are strongly regularised and hard to overfit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CatBoost create feature combinations?</summary><div class="qa-body">Greedily while building a tree: categorical columns already used in the tree are combined with other categorical columns, and each combination becomes a new category with its own ordered statistic that competes for splits. max_ctr_complexity limits how many columns can be combined. On the diary, Rain|Strong (never played) is isolated by one split, while Rain alone looks 60% and strong wind 50%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do one_hot_max_size and l2_leaf_reg do?</summary><div class="qa-body">one_hot_max_size: categorical columns with at most that many values are one-hot encoded instead of using target statistics (default 2). l2_leaf_reg: the L2 penalty on leaf values (default 3), the same λ as in XGBoost's −G/(H + λ).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CatBoost handle missing values?</summary><div class="qa-body">For numeric features nan_mode="Min" (default) treats a missing value as smaller than every other value, so a split can separate it; "Max" does the opposite and "Forbidden" raises an error. Categorical columns must not contain NaN; fill them with a value such as "missing", which then gets its own statistic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your data has timestamps. What changes when you use CatBoost?</summary><div class="qa-body">Sort the rows by time and set has_time=True, so ordered statistics and ordered boosting use the real order instead of a random one and never use future information. Validate on a later time period rather than with random K-fold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose CatBoost over LightGBM, and when not?</summary><div class="qa-body">Choose CatBoost for many or high-cardinality categorical columns, small to medium data, little time to tune, or a need for fast prediction. Choose LightGBM for very large numeric or sparse data where training time dominates; on the churn table CatBoost was about 0.01 AUC better but more than ten times slower to train.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does CatBoost need both ordered statistics and ordered boosting?</summary><div class="qa-body">They remove the same leak from two places. Ordered statistics keep each row's label out of its category encoding; without ordered boosting, each row's residual is still computed by a model that trained on it, so it is too small (D13: 7 instead of 9.33 in a 4-day leaf). On large data that second bias is small, which is why Plain boosting is the usual default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you replace CatBoost's symmetric trees with free trees?</summary><div class="qa-body">The leak fixes still work, but trees can again grow special branches for a few rows, and prediction loses its branch-free lookup. On the churn table both accuracy (0.744 against 0.733–0.738) and prediction speed got worse with Depthwise or Lossguide trees.</div></details>
</main>
`
});
