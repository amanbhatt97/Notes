// notes/ml/ml_catboost.js — CatBoost
Object.assign(TOPIC_CONTENT, {
  "ml_catboost": `<main>
  <h1>CatBoost</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>CatBoost</span></div>
  <p class="lead">CatBoost ("Categorical Boosting", Yandex, Prokhorenkova et al., NeurIPS 2018) is gradient boosting that takes <strong>categorical columns</strong> (city, plan, device brand, pincode) as raw text and handles them without leaking the answer. Its two key ideas are <strong>ordered target statistics</strong> (encode each row using only the rows "before" it in a random order) and <strong>ordered boosting</strong> (compute each row's gradient with a model that never saw that row). It also grows <strong>oblivious (symmetric) trees</strong> and builds <strong>combinations of categories</strong> on the fly. This note shows the leak by hand, fixes it row by row, measures everything on a categorical churn table, and covers the parameters and when to choose CatBoost. Read <a class="xref" data-note="ml_xgboost">XGBoost</a> and <a class="xref" data-note="ml_lightgbm">LightGBM</a> first. Every mechanism is first worked by hand on the running example of the whole tree group, the captain's 14-day cricket diary, whose Outlook column (Sunny, Overcast, Rain) is a small categorical feature; the 20,000-row categorical churn table then shows the same idea at scale.</p>

  <h2 id="cb-fit" class="open"><span class="num">★</span>Where This Fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 226" width="680"><defs><marker id="cb-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="122" y1="113" x2="148" y2="113" stroke="currentColor" marker-end="url(#cb-ar)"/><line x1="262" y1="113" x2="288" y2="113" stroke="currentColor" marker-end="url(#cb-ar)"/><line x1="430" y1="113" x2="518" y2="35" stroke="currentColor" marker-end="url(#cb-ar)"/><line x1="430" y1="113" x2="518" y2="113" stroke="currentColor" marker-end="url(#cb-ar)"/><line x1="430" y1="113" x2="518" y2="191" stroke="currentColor" marker-end="url(#cb-ar)"/><line x1="595" y1="56" x2="595" y2="90" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#cb-ar)"/><line x1="595" y1="134" x2="595" y2="168" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#cb-ar)"/><rect x="10" y="92" width="112" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="66" y="110" text-anchor="middle" font-size="13" font-weight="600">Boosting</text><text x="66" y="126" text-anchor="middle" class="tm" font-size="10.5">the idea</text><rect x="150" y="92" width="112" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="110" text-anchor="middle" font-size="13" font-weight="600">AdaBoost</text><text x="206" y="126" text-anchor="middle" class="tm" font-size="10.5">reweight rows</text><rect x="290" y="92" width="140" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="360" y="110" text-anchor="middle" font-size="13" font-weight="600">Gradient Boosting</text><text x="360" y="126" text-anchor="middle" class="tm" font-size="10.5">fit the gradient</text><rect x="520" y="14" width="150" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="595" y="32" text-anchor="middle" font-size="13" font-weight="600">XGBoost</text><text x="595" y="48" text-anchor="middle" class="tm" font-size="10.5">Newton steps + penalties</text><rect x="520" y="92" width="150" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="595" y="110" text-anchor="middle" font-size="13" font-weight="600">LightGBM</text><text x="595" y="126" text-anchor="middle" class="tm" font-size="10.5">bins, leaf-wise, GOSS, EFB</text><rect x="520" y="170" width="150" height="42" rx="7" class="fg sg" stroke-width="2.5"/><text x="595" y="188" text-anchor="middle" font-size="13" font-weight="600">CatBoost</text><text x="595" y="204" text-anchor="middle" class="tm" font-size="10.5">ordered TS, symmetric</text><text x="602" y="77" class="tm" font-size="10">faster</text><text x="602" y="155" class="tm" font-size="10">categories</text><text x="340" y="160" text-anchor="middle" class="tm" font-size="11">same loop: F = F + η·tree</text><text x="340" y="176" text-anchor="middle" class="tm" font-size="11">fit to g (and h)</text></svg><figcaption>The boosting branch. CatBoost (green) keeps the shared gradient-boosting maths and histogram speed, and adds leakage-free handling of categories and of the boosting gradients themselves.</figcaption></figure>
  <p><strong>Came from.</strong> <a class="xref" data-note="ml_xgboost">XGBoost</a> gave the regularised second-order maths; <a class="xref" data-note="ml_lightgbm">LightGBM</a> made it fast and could split categorical columns natively by sorting categories by their mean gradient. Two problems remained. (1) Any encoding of a category that uses the training labels (target encoding, LightGBM's gradient sorting) lets a row "see" its own label, which overfits high-cardinality columns. (2) Boosting itself has the same leak: each row's gradient is computed by a model that was trained on that row, so training gradients are systematically smaller than they would be on new data.</p>
  <p><strong>What CatBoost adds.</strong> Ordered target statistics for categories, ordered boosting for gradients, symmetric trees (fast, regular, hard to overfit), automatic feature combinations, and defaults that work well with almost no tuning.</p>
  <p><strong>Leads to.</strong> <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a> often blends CatBoost with LightGBM or a forest. Explaining it is in <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a> (CatBoost computes SHAP values natively), and choosing between the three boosters is in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a> and <a class="xref" data-note="ml_trees">The Tree Family</a>.</p>

    <h2 id="cb-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next question. Numbers are from the running example, the captain's 14-day cricket diary (Outlook, Wind, Play, Turnout).</p>
  <ol class="story">
    <li><b>Why categories are hard</b><span>Q: how does a tree split on Sunny / Overcast / Rain? → It needs numbers: label codes invent an order, one-hot explodes and isolates one value at a time, a target statistic (Overcast → 4/4 played) is the right idea. But computed naively it leaks…</span></li>
    <li><b>Target encoding &amp; the leak</b><span>Q: what goes wrong with "mean label per category"? → For a column with one value per row (the Day itself) the encoding <em>is</em> the label; leave-one-out reverses it (played sunny days 0.25, unplayed 0.50). On 20,000 rows a pure-noise pincode takes 77% of the gain and test AUC falls to 0.571. How do we encode without using a row's own label?</span></li>
    <li><b>Ordered target statistics</b><span>Q: how can every row use the labels of others but never its own? → Invent a time order and use only earlier rows: the five sunny days get 0.5, 0.75, 0.5, 0.375, 0.3 instead of 0.417 each. But boosting itself reuses each row's label in its gradients…</span></li>
    <li><b>The same leak inside boosting</b><span>Q: are the residuals honest? → No: on the overcast leaf D13's in-sample residual is 7 but its honest one 9.33 (shrunk by (n − 1)/n). Can we compute every row's gradient with a model that never saw it?</span></li>
    <li><b>Ordered boosting</b><span>Q: how, without n models? → Prefix models of sizes 1, 2, 4, 8, …: helps log-loss on small data (0.452 → 0.441 on 1,000 rows), not on 12,000. Which tree shape suits all this?</span></li>
    <li><b>Oblivious (symmetric) trees</b><span>Q: what tree shape is fast and hard to overfit? → One question per level: "Humidity high?" then "Wind strong?" give each diary day a 2-bit leaf number. But single-column statistics miss combinations…</span></li>
    <li><b>Feature combinations</b><span>Q: what if the label depends on two categories together? → Combine them: Rain alone is 3/5 played, Wind strong 3/6, but Rain|Strong is 0/2, isolated by one split. Then: the remaining behaviours, parameters and code.</span></li>
    <li><b>Built-in behaviour, parameters, code, when to choose</b><span>Q: how to use it well? → Give raw categories with cat_features, early-stop, keep defaults; choose CatBoost for categorical-heavy, small-to-medium data.</span></li>
  </ol>

<h2 id="cb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">CatBoost</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The problem</div>
        <ul>
          <li><b>Label encoding</b> — fake order (Delhi &lt; Goa &lt; Pune)</li>
          <li><b>One-hot</b> — thousands of sparse columns, one-vs-rest splits on tiny groups</li>
          <li><b>Target encoding</b> — mean label per category, but includes the row's own label → leak</li>
          <li><b>Prediction shift</b> — the feature's distribution on train ≠ on test</li>
          <li>💡 A teacher grading her own answer sheet</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ordered target statistics</div>
        <ul>
          <li>Random order = "artificial time"</li>
          <li><b>x̂<sub>k</sub> = (Σ<sub>earlier same-cat</sub> y + a·P) / (count<sub>earlier</sub> + a)</b></li>
          <li>Row never sees its own label; first rows get the prior P</li>
          <li>Several permutations; at prediction time use all training rows</li>
          <li>CTR types: Borders (target mean), Counter (frequency)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ordered boosting</div>
        <ul>
          <li>In-sample residuals are too small (model saw the row) → biased gradients</li>
          <li>Residual of row i from a model trained on rows before i only</li>
          <li>log-scale prefix models make it affordable</li>
          <li><code>boosting_type</code>: Ordered (small data) / Plain (default on most data)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Oblivious trees</div>
        <ul>
          <li>Same question for every node of a level</li>
          <li>Depth d → exactly 2<sup>d</sup> leaves; leaf = d-bit number of answers</li>
          <li>Fast prediction (bit operations), strong regularisation</li>
          <li><code>grow_policy</code>: SymmetricTree (default), Depthwise, Lossguide</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Combinations &amp; extras</div>
        <ul>
          <li>Greedy categorical combos (city × plan) built at split time</li>
          <li><code>max_ctr_complexity</code> limits combo size</li>
          <li><code>one_hot_max_size</code>: tiny categories one-hot</li>
          <li>Missing: <code>nan_mode</code> Min; text features; GPU</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using it</div>
        <ul>
          <li><code>cat_features=[…]</code>, raw strings, <code>Pool</code></li>
          <li>Defaults: 1000 iters, depth 6, l2_leaf_reg 3, auto learning rate</li>
          <li><code>early_stopping_rounds</code>, <code>use_best_model</code></li>
          <li><b>Choose it</b> — many / high-cardinality categories, small–medium data, little tuning time</li>
          <li>⚠ Slower to train per tree than LightGBM</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cb-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="cb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Categoricals Are Hard</span><span class="rm-sub">Codes, one-hot, target statistics</span></div></div>
      <div class="rm-item rm-done" data-target="cb-leak"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Target Encoding &amp; the Leak</span><span class="rm-sub">The Day column, LOO, pincode</span></div></div>
      <div class="rm-item rm-done" data-target="cb-ots"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Ordered Target Statistics</span><span class="rm-sub">The diary in a random order</span></div></div>
      <div class="rm-item rm-done" data-target="cb-shift"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Leak Inside Boosting</span><span class="rm-sub">Prediction shift</span></div></div>
      <div class="rm-item rm-done" data-target="cb-ordered"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Ordered Boosting</span><span class="rm-sub">Honest gradients</span></div></div>
      <div class="rm-item rm-done" data-target="cb-oblivious"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Oblivious Trees</span><span class="rm-sub">One question per level</span></div></div>
      <div class="rm-item rm-done" data-target="cb-combo"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Feature Combinations</span><span class="rm-sub">Rain | Strong</span></div></div>
      <div class="rm-item rm-done" data-target="cb-more"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Other Built-in Behaviour</span><span class="rm-sub">NaN, sampling, text</span></div></div>
      <div class="rm-item rm-done" data-target="cb-params"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Defaults &amp; Parameters</span><span class="rm-sub">What to tune</span></div></div>
      <div class="rm-item rm-done" data-target="cb-code"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Full Code</span><span class="rm-sub">The churn table</span></div></div>
      <div class="rm-item rm-done" data-target="cb-when"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">When to Choose CatBoost</span><span class="rm-sub">Head-to-head</span></div></div>
      <div class="rm-item rm-done" data-target="cb-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One rule: only the past</span></div></div>
      <div class="rm-item rm-done" data-target="cb-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in real use</span></div></div>
      <div class="rm-item rm-done" data-target="cb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="cb-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="cb-why"><span class="num">01</span>Why Categorical Features Are Hard</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>XGBoost and LightGBM split on numbers. The diary's Outlook is a word: Sunny, Overcast or Rain. How should a tree split on a column whose values have no order, especially when there are hundreds of them?</p>
  </div>
  <p>A tree splits on "x &lt; threshold". That needs numbers with a meaningful order. A categorical column (a <strong>category</strong> is a label from a fixed set, with no order: city, plan, payment method, device brand) has none. Every library must turn it into numbers somehow, and each obvious way has a cost.</p>
  <h3>Option 1: label encoding (one integer per value)</h3>
  <p>Delhi = 0, Goa = 1, Pune = 2. The tree now thinks Goa is "between" Delhi and Pune, and a split "city &lt; 1.5" groups Delhi with Goa for no reason. With enough splits a tree can carve out any group, but it wastes depth and data. On the churn table (section 07 of <a class="xref" data-note="ml_lightgbm">LightGBM</a>), label codes were the worst of the three options tried.</p>
  <p>On the diary, alphabetical codes give Overcast = 0, Rain = 1, Sunny = 2. The play rates are 4/4, 3/5 and 2/5, so by luck the alphabet follows the play rate and one cut "code &lt; 0.5" isolates Overcast. With Outlook × Wind (six values, section 07) or with 300 cities, no alphabet is that kind.</p>
  <h3>Option 2: one-hot encoding (one 0/1 column per value)</h3>
  <p>No fake order, but the number of columns explodes, and each split can only isolate <em>one</em> value from all others. Look at the categorical churn table used in this note (20,000 telecom customers; described in section 02):</p>
  <div class="fx" data-lang="py">print("rows:", len(df))
for c in CAT + ["pincode"]:
    vc = df[c].value_counts()
    print(f"{c:8s} distinct values {df[c].nunique():5d}   rows in rarest value {vc.min():4d}   "
          f"values with &lt; 10 rows {(vc &lt; 10).sum():5d}")
wide = pd.get_dummies(df[CAT + ["pincode"]])
print("one-hot columns:", wide.shape[1], f"  share of zeros: {(wide.values == 0).mean():.2%}")</div>
  <div class="fx" data-lang="text">rows: 20000
city     distinct values   300   rows in rarest value    3   values with &lt; 10 rows    22
plan     distinct values     5   rows in rarest value 1990   values with &lt; 10 rows     0
payment  distinct values     4   rows in rarest value 2986   values with &lt; 10 rows     0
device   distinct values    40   rows in rarest value   64   values with &lt; 10 rows     0
pincode  distinct values  4898   rows in rarest value    1   values with &lt; 10 rows  4857
one-hot columns: 5247   share of zeros: 99.90%</div>
  <p>One-hot makes 5,247 columns that are 99.9% zeros. City has 22 values with fewer than 10 customers; pincode has 4,857 such values. A one-hot column for a pincode with 3 customers can never produce a useful split: any leaf built on it holds 3 rows. Trees also need many one-vs-rest splits to group, say, 40 high-churn cities together.</p>
  <h3>Option 3: target encoding (replace each value by a number learned from the label)</h3>
  <p>Replace "Overcast" by the play rate on overcast days (4/4 = 1.0), "Rain" by 3/5, "Sunny" by 2/5; or "Pune" by the churn rate of Pune customers: one column, ordered by what matters, works for any number of values. This is the right idea, and it is what CatBoost does. But done naively it leaks the answer, which is the subject of the next section.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cardinality</strong>: the number of distinct values of a categorical column. <strong>High-cardinality</strong> columns (hundreds to millions of values: pincode, product ID, user ID) are where one-hot fails and naive target encoding overfits. <strong>Target statistic (TS)</strong>: a number computed from the labels of the rows that share a category value, used as a numeric feature in its place.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Trees handle categoricals natively" is only partly true. sklearn's trees need numbers; XGBoost needs <code>enable_categorical=True</code>; LightGBM sorts categories by the training gradients (which also leaks, mildly). Only CatBoost was designed around the leakage problem from the start.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Target encoding &amp; the leak.</b> Target encoding is the right direction. We need to see exactly how it leaks, and how badly, before we can fix it.</div>

  <h2 id="cb-leak"><span class="num">02</span>Target Encoding &amp; the Leak</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Replacing each category by its mean label sounds harmless. What exactly goes wrong when the same rows that supply the labels are the rows the model trains on?</p>
  </div>
  <h3>Greedy target statistics, worked</h3>
  <p>The plain ("greedy") target statistic for category value c is the mean label of all training rows with that value, usually smoothed with a prior P (the overall churn rate) weighted by a:</p>
  <p style="text-align:center"><strong>x̂(c) = (Σ<sub>rows with c</sub> y + a·P) / (count(c) + a)</strong></p>
  <p>Take two diary columns: the Day itself (D1 … D14, a category with a different value on every row, like a customer ID) and Outlook.</p>
  <div class="fx" data-lang="py">import pandas as pd
from play import df
d = df.reset_index().rename(columns={"index": "Day"})
d["y"] = (d.Play == "Yes").astype(int)
# (a) a category with a different value on every row: the Day itself (D1 ... D14)
d["Day_TE"] = d.groupby("Day")["y"].transform("mean")
print(d[["Day", "y", "Day_TE"]].head(6).to_string(index=False), "\\n...")
print("Day_TE equals the label on every row:", bool((d.Day_TE == d.y).all()))
# (b) leave-one-out encoding of Outlook: exclude the row's own label
S = d.groupby("Outlook")["y"].transform("sum"); n = d.groupby("Outlook")["y"].transform("count")
d["Outlook_LOO"] = (S - d.y) / (n - 1)
print(d[d.Outlook == "Sunny"][["Day", "Outlook", "y", "Outlook_LOO"]].to_string(index=False))</div>
  <div class="fx" data-lang="text">Day  y  Day_TE
 D1  0     0.0
 D2  0     0.0
 D3  1     1.0
 D4  1     1.0
 D5  1     1.0
 D6  0     0.0 
...
Day_TE equals the label on every row: True
Day Outlook  y  Outlook_LOO
 D1   Sunny  0         0.50
 D2   Sunny  0         0.50
 D8   Sunny  0         0.50
 D9   Sunny  1         0.25
D11   Sunny  1         0.25</div>
  <p><strong>First table.</strong> With one row per day, the mean label of a day <em>is</em> that day's own label. The encoded column equals the target: a tree splits on "Day_TE &gt; 0.5" and gets 14/14 right. For a new day (D15) the value is unseen, the encoding falls back to the prior, and the feature is useless. The model learnt the answer key, not a pattern. (Smoothing with a prior only softens this: (y + a·P)/(1 + a) is still a perfect function of y. The decision-tree note meets the same column from another side: Day has the highest information gain of all, 0.940.)</p>
  <p><strong>Second table: leave-one-out (LOO) does not fix it.</strong> The idea "exclude the row's own label" sounds safe: x̂<sub>k</sub> = (S − y<sub>k</sub>)/(n − 1), where S is the category's label sum. Sunny has 5 days, S = 2 played. The played sunny days (D9, D11) get (2 − 1)/4 = 0.25, the unplayed ones (D1, D2, D8) get (2 − 0)/4 = 0.50. Within Sunny the value is a perfect (reversed) copy of the label: "Outlook_LOO &lt; 0.4 ⇒ played". The leak has not gone; it has been flipped.</p>
  <h3>Why it leaks: the prediction shift</h3>
  <p>The root cause is a mismatch between training and test. For a training row, x̂ was computed <em>with</em> (or, for LOO, <em>against</em>) its own label, so the relationship between x̂ and y on the training set is stronger than it will ever be for a new row, whose label was not used. The model learns the training relationship and applies it to test rows where it does not hold. CatBoost's paper calls this <strong>target leakage</strong> leading to a <strong>prediction shift</strong>: the conditional distribution of x̂ given y differs between train and test.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class where each student grades their own answer sheet before submitting it. Marks will correlate with "who wrote it" much better than real knowledge does. On the board exam, graded by someone else, that correlation vanishes. The fix is that nobody may use their own answers to compute their own mark.</p>
  </div>
  <h3>How bad is it on real data?</h3>
  <p>At scale: the <strong>categorical churn table</strong> shared by this note and LightGBM's: 20,000 customers with <code>city</code> (300 values), <code>plan</code> (5), <code>payment</code> (4), <code>device</code> (40), tenure, support calls, monthly bill, and <code>pincode</code> (≈ 4,900 values, about 4 customers each). Churn rate 19%; split 12,000 train / 3,000 validation / 5,000 test. <strong>Pincode is pure noise</strong>: it was drawn at random and has no effect on churn. Any model that uses it is fooling itself. Each run below uses the three numeric columns plus one encoding of pincode:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score
num = ["tenure", "support_calls", "monthly_bill"]      # real signal; 'pincode' is pure noise
prior = cytr.mean()
def naive_te(tr_col, ytr_, col):                     # mean churn per pincode, from ALL training rows
    means = pd.Series(ytr_, index=tr_col.index).groupby(tr_col).mean()
    return col.map(means).fillna(prior)
def loo_te(tr_col, ytr_):                            # leave-one-out on the training rows
    yy = pd.Series(ytr_, index=tr_col.index)
    s, c = yy.groupby(tr_col).transform("sum"), yy.groupby(tr_col).transform("count")
    return ((s - yy) / (c - 1)).where(c &gt; 1, prior)
def oof_te(tr_col, ytr_, k=5):                       # out-of-fold: each row encoded by the other folds
    out = pd.Series(prior, index=tr_col.index)
    for a, b in StratifiedKFold(k, shuffle=True, random_state=0).split(tr_col, ytr_):
        out.iloc[b] = naive_te(tr_col.iloc[a], ytr_[a], tr_col.iloc[b]).values
    return out
def run(name, te_train):
    A = Ctr[num].assign(pin_te=te_train.values)
    B = Cte[num].assign(pin_te=naive_te(Ctr.pincode, cytr, Cte.pincode).values)   # test: full-train means
    m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, num_leaves=15, verbose=-1).fit(A, cytr)
    share = m.booster_.feature_importance("gain")[-1] / m.booster_.feature_importance("gain").sum()
    print(f"{name:26s} train AUC {roc_auc_score(cytr, m.predict_proba(A)[:, 1]):.3f}  "
          f"test AUC {roc_auc_score(cyte, m.predict_proba(B)[:, 1]):.3f}  pincode share of gain {share:5.1%}")
m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, num_leaves=15, verbose=-1).fit(Ctr[num], cytr)
print(f"{'no pincode at all':26s} train AUC {roc_auc_score(cytr, m.predict_proba(Ctr[num])[:, 1]):.3f}  "
      f"test AUC {roc_auc_score(cyte, m.predict_proba(Cte[num])[:, 1]):.3f}")
run("naive target encoding", naive_te(Ctr.pincode, cytr, Ctr.pincode))
run("leave-one-out encoding", loo_te(Ctr.pincode, cytr))
run("5-fold out-of-fold", oof_te(Ctr.pincode, cytr))
cb = CatBoostClassifier(iterations=300, learning_rate=0.05, depth=4, verbose=False, random_seed=0)
cb.fit(Ctr[num + ["pincode"]], cytr, cat_features=["pincode"])
imp = cb.get_feature_importance(prettified=True).set_index("Feature Id")["Importances"]
print(f"{'CatBoost ordered TS':26s} train AUC {roc_auc_score(cytr, cb.predict_proba(Ctr[num + ['pincode']])[:, 1]):.3f}  "
      f"test AUC {roc_auc_score(cyte, cb.predict_proba(Cte[num + ['pincode']])[:, 1]):.3f}  "
      f"pincode share of importance {imp['pincode'] / imp.sum():5.1%}")</div>
  <div class="fx" data-lang="text">no pincode at all          train AUC 0.794  test AUC 0.699
naive target encoding      train AUC 0.956  test AUC 0.571  pincode share of gain 77.0%
leave-one-out encoding     train AUC 0.801  test AUC 0.698  pincode share of gain  5.6%
5-fold out-of-fold         train AUC 0.799  test AUC 0.697  pincode share of gain  5.0%
CatBoost ordered TS        train AUC 0.751  test AUC 0.710  pincode share of importance 10.0%</div>
    <p>Read the rows as a story:</p>
  <ul>
    <li><strong>No pincode</strong>: train AUC 0.794, test 0.699. This is the honest baseline.</li>
    <li><strong>Naive target encoding</strong>: train AUC jumps to 0.956 and the model spends 77% of its total gain on pincode, a column of pure noise. Test AUC <em>drops</em> to 0.571, far worse than not having the column at all. This is the leak: on training rows the encoded pincode "knows" the label; on test rows it does not.</li>
    <li><strong>Leave-one-out</strong> and <strong>5-fold out-of-fold</strong>: back to the baseline (0.698 / 0.697) with pincode used little. LOO's within-category reversal (the hand example) needs the tree to know each pincode's total, which it cannot see here; with other models or features that reveal the group (counts, IDs) it can be exploited.</li>
    <li><strong>CatBoost</strong> with the raw pincode as a categorical feature: the smallest train–test gap (0.751 / 0.710) and the best test score; the noise column gets a small share of importance and does no harm. (Part of the higher test AUC is CatBoost itself, a different model from LightGBM; the point is that the noise column did not fool it.)</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Target leakage (in encodings)</strong>: a feature computed using the target of the same row. <strong>Prediction shift</strong>: because of it, the distribution of the feature (given the label) on training rows differs from that on test rows, so a model fitted on training rows is systematically wrong on new rows. Classic fixes: out-of-fold encoding (K-fold), holdout encoding (wastes data), and CatBoost's ordered encoding.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Target-encoding inside a cross-validation loop must be fitted <em>inside each fold</em>. Encoding the whole dataset first and then cross-validating leaks the validation labels into the features, and the CV score is optimistic. (General leakage rules: <a class="xref" data-note="ml_core">Core Concepts</a>.)</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Ordered target statistics.</b> Out-of-fold encoding works, but each row's value comes from only (K − 1)/K of the data and you must manage the folds yourself. CatBoost's idea is simpler and uses the data more fully: borrow the notion of time.</div>

  <h2 id="cb-ots"><span class="num">03</span>Ordered Target Statistics</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each row must be encoded without its own label, yet we want to use as many other labels as possible, without folds. Online learning never leaks, because each example only sees the past. Can tabular data borrow that idea?</p>
  </div>
  <h3>The idea</h3>
  <p>In online learning there is no leak, because examples arrive in time order and each one is encoded using only the past. Table data has no time, so CatBoost <strong>invents one</strong>: shuffle the training rows into a random order σ, and encode each row using only the rows that come <em>before</em> it with the same category value:</p>
  <p style="text-align:center"><strong>x̂<sub>k</sub> = ( Σ<sub>j before k, same value</sub> y<sub>j</sub> + a·P ) / ( count of those rows + a )</strong></p>
  <p>P is a prior (CatBoost tries several, e.g. 0, 0.5, 1), and a is its weight ("a imaginary earlier rows with label P"). A row never sees its own label, yet every earlier row is used: no fold is wasted.</p>
  <h3>Worked: the diary in a random order</h3>
  <p>Shuffle the 14 days into a random order (CatBoost's artificial time), then encode Outlook for Play with prior P = 0.5, a = 1:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
d = df.reset_index().rename(columns={"index": "Day"})
d["y"] = (d.Play == "Yes").astype(int)
d = d.iloc[np.random.default_rng(3).permutation(14)].reset_index(drop=True)   # CatBoost's random "time"
P, a = 0.5, 1.0                                                                   # prior and its weight
seen_pos, seen_n, ts = {}, {}, []
for c, y in zip(d.Outlook, d.y):
    ts.append((seen_pos.get(c, 0) + a * P) / (seen_n.get(c, 0) + a))         # only EARLIER rows of this value
    seen_pos[c] = seen_pos.get(c, 0) + y; seen_n[c] = seen_n.get(c, 0) + 1
d["ordered_TS"] = np.round(ts, 3)
d["greedy_TS"] = np.round(d.groupby("Outlook")["y"].transform(lambda s: (s.sum() + a * P) / (len(s) + a)), 3)
print(d[["Day", "Outlook", "y", "ordered_TS", "greedy_TS"]].to_string())
full = {c: round(float((d.y[d.Outlook == c].sum() + a * P) / ((d.Outlook == c).sum() + a)), 3) for c in ["Overcast", "Rain", "Sunny"]}
print("at prediction time a new day uses all 14 rows:", full)</div>
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
13   D9     Sunny  1       0.300      0.417
at prediction time a new day uses all 14 rows: {'Overcast': 0.9, 'Rain': 0.583, 'Sunny': 0.417}</div>
  <p>Follow the five sunny days, in their shuffled order:</p>
  <table class="tbl">
    <tr><th>Position</th><th>Day</th><th>Earlier sunny days</th><th>Their plays</th><th>Ordered TS</th><th>Own label</th></tr>
    <tr><td>0</td><td>D11</td><td>none</td><td>0</td><td>(0 + 0.5)/(0 + 1) = 0.500</td><td>1</td></tr>
    <tr><td>5</td><td>D1</td><td>D11</td><td>1</td><td>(1 + 0.5)/(1 + 1) = 0.750</td><td>0</td></tr>
    <tr><td>6</td><td>D2</td><td>D11, D1</td><td>1</td><td>(1 + 0.5)/(2 + 1) = 0.500</td><td>0</td></tr>
    <tr><td>8</td><td>D8</td><td>D11, D1, D2</td><td>1</td><td>(1 + 0.5)/(3 + 1) = 0.375</td><td>0</td></tr>
    <tr><td>13</td><td>D9</td><td>D11, D1, D2, D8</td><td>1</td><td>(1 + 0.5)/(4 + 1) = 0.300</td><td>1</td></tr>
  </table>
  <p>No day's value depends on its own label. The greedy TS gives every sunny day (2 + 0.5)/(5 + 1) = 0.417, built partly from its own label; the ordered TS varies from day to day, and the variation is noise with respect to the day's own label (D9 played but got the lowest value, 0.300), which is exactly what a new day's encoding looks like. D11 shows the price of being early: it is encoded from no history at all, just the prior 0.5. Early rows in the order have noisy encodings.</p>
  <h3>Reducing the noise: several permutations</h3>
  <p>Rows early in the order get encodings from very little history. CatBoost therefore uses several random permutations (different ones for different trees), so that no row is always "early". At <strong>prediction time</strong> there is no leak to worry about, so a new customer's city is encoded with <em>all</em> training rows (last line of the output: Sunny = (2 + 0.5)/(5 + 1) = 0.417, Overcast = (4 + 0.5)/(4 + 1) = 0.9).</p>
  <h3>What CatBoost actually computes (CTRs)</h3>
  <p>CatBoost calls these statistics <strong>CTRs</strong> (from "click-through rate", their origin at Yandex). For each categorical column it builds several:</p>
  <ul>
    <li><strong>Borders</strong>: the ordered target mean above (for classification; for regression the target is first cut into buckets by borders and one CTR per bucket is computed), with several priors.</li>
    <li><strong>Counter</strong>: how often the value occurs (frequency encoding). Uses no labels, so it can use train and test rows together.</li>
  </ul>
  <p>Each CTR becomes a numeric column that the tree can split on with ordinary thresholds. At scale, in section 06, the first CatBoost tree on the churn table splits on "{payment} counter_type=Borders prior_numerator=0.5, border=3": the Borders CTR of payment, with prior 0.5, compared with a threshold.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ordered target statistic</strong>: for a random permutation σ of the training rows, x̂<sub>σ(k)</sub> = (Σ<sub>j&lt;k: x<sub>σ(j)</sub>=x<sub>σ(k)</sub></sub> y<sub>σ(j)</sub> + a·P) / (|{j&lt;k: x<sub>σ(j)</sub>=x<sub>σ(k)</sub>}| + a). It satisfies the property that x̂<sub>k</sub> does not depend on y<sub>k</sub>, while using all available history.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If your rows have a real time order (transactions, events), a random permutation can let a row's encoding use "future" rows from the real timeline. Sort by time and pass <code>has_time=True</code>, so CatBoost uses the true order instead of a random one. (Time-based validation: <a class="xref" data-note="ml_evaluation">Model Evaluation</a>.)</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The same leak inside boosting.</b> We fixed the leak in the features. But the boosting loop has the same leak in a different place: the gradients.</div>

  <h2 id="cb-shift"><span class="num">04</span>The Same Leak Inside Boosting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ordered statistics keep labels out of the features. But every booster computes each row's residual with a model that was trained on that very row. Is that residual honest?</p>
  </div>
  <p>In every booster, tree t is fitted to the gradients (residuals, for squared error) of the current model F<sup>t−1</sup>. But F<sup>t−1</sup> was trained on these same rows. So for a training row, the residual y − F<sup>t−1</sup>(x) is computed by a model that has partly memorised that row: it is <strong>smaller</strong> in size than the residual the same model would leave on a new row. The trees are fitted to over-optimistic residuals.</p>
  <h3>Worked: the overcast leaf of the diary</h3>
  <p>Squared error on Turnout. A leaf holds the four overcast days D3, D7, D12, D13 with turnouts 36, 42, 38, 48, current prediction 0, so the leaf's value is their mean.</p>
  <table class="tbl">
    <tr><th></th><th>Leaf value used for D13</th><th>D13's residual</th></tr>
    <tr><td>In-sample (leaf fitted on all four days)</td><td>(36 + 42 + 38 + 48)/4 = 41</td><td>48 − 41 = <strong>7</strong></td></tr>
    <tr><td>Out-of-sample (leaf fitted on the other three)</td><td>(36 + 42 + 38)/3 = 38.67</td><td>48 − 38.67 = <strong>9.33</strong></td></tr>
  </table>
  <p>The in-sample residual is a quarter smaller than the honest one: the leaf already moved toward D13 because it saw it. For a leaf of n rows, each in-sample residual is shrunk by a factor (n − 1)/n compared with leaving the row out (here 3/4: 9.33 × 0.75 = 7). Small leaves (few rows) shrink the most. Next round's gradients, computed from these residuals, are biased toward "already fine", and the model fits training noise instead of the real remaining error. The CatBoost paper proves this bias for boosting and calls it <strong>prediction shift</strong> of the model, the same name as in section 02, because it is the same mechanism.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Target leakage in encodings and prediction shift in boosting are one problem: a quantity for row k is computed from a model or statistic that used y<sub>k</sub>. CatBoost uses one cure for both: order the rows and let each row be served only by its predecessors.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Ordered boosting.</b> How do we get, for every row, a model that has not seen that row, without training n models?</div>

  <h2 id="cb-ordered"><span class="num">05</span>Ordered Boosting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>To make D13's residual honest we need a model that never saw D13; to make every residual honest we would need one such model per row. Can the random order of section 03 make this affordable?</p>
  </div>
  <h3>The idea</h3>
  <p>Take the same random order σ used for the ordered statistics. Imagine keeping n supporting models M<sub>1</sub>, …, M<sub>n</sub>, where M<sub>i</sub> is trained only on the first i rows. The residual (gradient) of row σ(i) is computed with M<sub>i−1</sub>, a model that has never seen it. Then the trees are scored using these honest gradients. In the diary's shuffled order of section 03, D9 (position 13) would get its gradient from a model built on the 13 days before it; D11 (position 0) from the starting value alone.</p>
  <div class="flow"><span>random order σ</span><span>row i's gradient from M<sub>i−1</sub> (trained on rows 1…i−1)</span><span>choose tree structure using these gradients</span><span>update every M<sub>j</sub> with the new tree</span><span>repeat</span></div>
  <h3>Making it affordable</h3>
  <ul>
    <li>Keeping n models is impossible, so CatBoost keeps models only for prefixes of length 1, 2, 4, 8, …, 2<sup>j</sup>: about log<sub>2</sub> n of them. Row i uses the largest prefix that ends before it.</li>
    <li>It uses s + 1 permutations: s for computing gradients and choosing splits, and one more for computing leaf values of the final model. Different trees use different permutations, which also reduces the noise of early rows.</li>
    <li>The tree <em>structure</em> is chosen with the ordered gradients; the final <em>leaf values</em> are computed normally. At prediction time only the final model is used.</li>
  </ul>
  <h3>Plain vs Ordered, measured at scale</h3>
  <p><code>boosting_type="Plain"</code> is classic gradient boosting (ordered target statistics are still used for the categories). <code>"Ordered"</code> adds ordered boosting. The paper reports the biggest gain on small datasets, where the bias of in-sample gradients is largest. Same model, small and full training set:</p>
  <div class="fx" data-lang="py">from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score, log_loss
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
for n_rows in [1000, 12000]:
    A, ya = Ctr[feats].iloc[:n_rows], cytr[:n_rows]
    for bt in ["Plain", "Ordered"]:
        t0 = time.time()
        m = CatBoostClassifier(iterations=500, learning_rate=0.05, depth=6, boosting_type=bt,
                               random_seed=0, verbose=False).fit(A, ya, cat_features=CAT)
        p = m.predict_proba(Cte[feats])[:, 1]
        print(f"{n_rows:6d} rows  {bt:7s}  test logloss {log_loss(cyte, p):.4f}  AUC {roc_auc_score(cyte, p):.4f}  "
              f"{time.time() - t0:5.1f}s")</div>
  <div class="fx" data-lang="text">  1000 rows  Plain    test logloss 0.4524  AUC 0.7348   11.7s
  1000 rows  Ordered  test logloss 0.4405  AUC 0.7325   23.3s
 12000 rows  Plain    test logloss 0.4017  AUC 0.7815   36.4s
 12000 rows  Ordered  test logloss 0.4010  AUC 0.7818   66.5s</div>
    <p>On 1,000 training rows, Ordered boosting improves the test log loss from 0.452 to 0.441 (probabilities are better calibrated), while AUC is essentially unchanged (0.735 vs 0.733). On 12,000 rows the two modes are indistinguishable (0.4017 vs 0.4010). In both cases Ordered takes about twice as long. This matches the paper and the library's choice: the in-sample gradient bias matters most when data is small, which is why the automatic default picks Plain on most datasets.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ordered boosting</strong>: a boosting scheme in which the gradient for training row σ(i) is computed by a model trained only on rows σ(1), …, σ(i−1) of a random permutation, removing the prediction shift caused by reusing training rows for both fitting and gradient estimation. In CatBoost: <code>boosting_type="Ordered"</code>; the default is chosen automatically (Plain on most data).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"CatBoost always uses ordered boosting." It does not: on most datasets the automatic default is <code>Plain</code>, because Ordered is slower and helps mainly on small data. Ordered <em>target statistics</em> for categorical columns are used in both modes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Oblivious trees.</b> The two ordered ideas make CatBoost leakage-safe. The third idea is about the shape of the trees, and it is why CatBoost overfits little and predicts fast.</div>

  <h2 id="cb-oblivious"><span class="num">06</span>Oblivious (Symmetric) Trees</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ordered statistics and ordered boosting fix where the numbers come from. What shape of tree goes with them: one that predicts fast and does not chase a few odd rows?</p>
  </div>
  <h3>The idea</h3>
  <p>In an ordinary tree each node chooses its own question. In an <strong>oblivious tree</strong> every node at the same depth asks the <em>same</em> question. A depth-d oblivious tree is therefore just d (feature, threshold) pairs, and it always has exactly 2<sup>d</sup> leaves.</p>
  <figure class="viz"><svg viewBox="0 0 640 212" width="640"><g stroke="currentColor"><line x1="150" y1="34" x2="90" y2="94"/><line x1="150" y1="34" x2="210" y2="94"/><line x1="90" y1="94" x2="55" y2="160"/><line x1="90" y1="94" x2="125" y2="160"/><line x1="210" y1="94" x2="175" y2="160"/><line x1="210" y1="94" x2="245" y2="160"/><line x1="470" y1="34" x2="410" y2="94"/><line x1="470" y1="34" x2="530" y2="94"/><line x1="410" y1="94" x2="375" y2="160"/><line x1="410" y1="94" x2="445" y2="160"/><line x1="530" y1="94" x2="495" y2="160"/><line x1="530" y1="94" x2="565" y2="160"/></g><rect x="95" y="20" width="110" height="28" rx="6" class="fb sb"/><text x="150" y="38" text-anchor="middle" font-size="11">tenure &lt; 12?</text><rect x="40" y="80" width="100" height="28" rx="6" class="fb sb"/><text x="90" y="98" text-anchor="middle" font-size="11">calls ≥ 3?</text><rect x="160" y="80" width="100" height="28" rx="6" class="fb sb"/><text x="210" y="98" text-anchor="middle" font-size="11">bill &gt; 900?</text><rect x="415" y="20" width="110" height="28" rx="6" class="ft st"/><text x="470" y="38" text-anchor="middle" font-size="11">tenure &lt; 12?</text><rect x="360" y="80" width="100" height="28" rx="6" class="ft st"/><text x="410" y="98" text-anchor="middle" font-size="11">calls ≥ 3?</text><rect x="480" y="80" width="100" height="28" rx="6" class="ft st"/><text x="530" y="98" text-anchor="middle" font-size="11">calls ≥ 3?</text><g class="fs" stroke="currentColor"><circle cx="55" cy="166" r="11"/><circle cx="125" cy="166" r="11"/><circle cx="175" cy="166" r="11"/><circle cx="245" cy="166" r="11"/><circle cx="375" cy="166" r="11"/><circle cx="445" cy="166" r="11"/><circle cx="495" cy="166" r="11"/><circle cx="565" cy="166" r="11"/></g><text x="375" y="170" text-anchor="middle" font-size="10">00</text><text x="445" y="170" text-anchor="middle" font-size="10">01</text><text x="495" y="170" text-anchor="middle" font-size="10">10</text><text x="565" y="170" text-anchor="middle" font-size="10">11</text><text x="150" y="200" text-anchor="middle" font-size="12">ordinary tree: each node its own question</text><text x="470" y="200" text-anchor="middle" font-size="12">oblivious tree: one question per level</text></svg><figcaption>Left: a normal depth-2 tree can ask "calls ≥ 3?" on one side and "bill &gt; 900?" on the other. Right: CatBoost's symmetric tree asks the same second question on both sides; the leaf number is just the two answers written as bits.</figcaption></figure>
  <h3>Worked: finding the leaf without walking the tree</h3>
  <p>Oblivious tree on the diary with q<sub>1</sub> = "Humidity high?" and q<sub>2</sub> = "Wind strong?". Write each answer as a bit (yes = 1). The leaf index is the binary number of the answers: index = 2·b<sub>1</sub> + b<sub>2</sub>.</p>
  <table class="tbl">
    <tr><th>Day</th><th>Humidity</th><th>Wind</th><th>b<sub>1</sub> (humid)</th><th>b<sub>2</sub> (windy)</th><th>Leaf index</th></tr>
    <tr><td>D2</td><td>High</td><td>Strong</td><td>1</td><td>1</td><td>2·1 + 1 = 3 (leaf "11")</td></tr>
    <tr><td>D1</td><td>High</td><td>Weak</td><td>1</td><td>0</td><td>2 (leaf "10")</td></tr>
    <tr><td>D6</td><td>Normal</td><td>Strong</td><td>0</td><td>1</td><td>1 (leaf "01")</td></tr>
    <tr><td>D5</td><td>Normal</td><td>Weak</td><td>0</td><td>0</td><td>0 (leaf "00")</td></tr>
  </table>
  <p>Every one of the 14 days lands in one of these 4 leaves in the same way. Prediction is d comparisons, combined with bit shifts, then one array lookup: no branching, which suits CPUs (vectorised) and GPUs. The whole tree is d thresholds plus 2<sup>d</sup> numbers. An ordinary tree could instead ask "Wind strong?" only on rainy days; the oblivious tree must ask it on humid and normal days alike.</p>
  <h3>Why it regularises</h3>
  <ul>
    <li>A question must be good for <em>all</em> nodes of the level at once (CatBoost scores a candidate by summing its gain over every leaf of the level), so a split that only helps a few rows in one corner is rarely chosen.</li>
    <li>The tree is "balanced" by construction; it cannot grow a long thin branch around a few outliers as a leaf-wise tree can.</li>
    <li>The price: an oblivious tree is less flexible per tree than a free tree of the same depth, so CatBoost often needs more trees, and it is weaker when one interaction matters only in a small region.</li>
  </ul>
  <h3>A real CatBoost tree, at scale</h3>
  <div class="fx" data-lang="py">from catboost import CatBoostClassifier, Pool
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
pool = Pool(Ctr[feats], cytr, cat_features=CAT)
m = CatBoostClassifier(iterations=50, depth=3, learning_rate=0.1, random_seed=0, verbose=False).fit(pool)
print("tree 0 asks one question per level:")
for level, s in enumerate(m._get_tree_splits(0, pool)):
    print(f"  level {level}: {s}")
leaves = [float(v.split("=")[1]) for v in m._get_tree_leaf_values(0)]
print("its", len(leaves), "leaf values:", np.round(leaves, 4))
print("leaves per tree:", set(m.get_tree_leaf_counts()))</div>
  <div class="fx" data-lang="text">tree 0 asks one question per level:
  level 0: tenure, bin=9.5
  level 1: {payment} counter_type=Borders prior_numerator=0.5, border=3
  level 2: {plan} counter_type=Borders prior_numerator=0, border=3
its 8 leaf values: [-0.081 -0.156 -0.049 -0.12  -0.046 -0.127  0.068 -0.022]
leaves per tree: {np.uint32(8)}</div>
  <p>The first tree (depth 3) asks exactly three questions, one per level: tenure below 9.5 months, then the Borders CTR (ordered churn rate) of <code>payment</code> above a border, then the CTR of <code>plan</code>. It has exactly 2<sup>3</sup> = 8 leaf values, and every tree in the model has 8 leaves. The categorical columns entered the tree only through their target statistics, as numeric questions.</p>
  <h3>Other growth policies</h3>
  <p>CatBoost can also grow ordinary trees: <code>grow_policy="Depthwise"</code> (like XGBoost) or <code>"Lossguide"</code> (leaf-wise, like LightGBM, with <code>max_leaves</code>). On the churn table:</p>
  <div class="fx" data-lang="py">from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
big = pd.concat([Cte[feats]] * 40, ignore_index=True)          # 200,000 rows to time prediction
for gp, kw in [("SymmetricTree", {"depth": 6}), ("Depthwise", {"depth": 6}),
               ("Lossguide", {"max_leaves": 64, "depth": 16})]:
    t0 = time.time()
    m = CatBoostClassifier(iterations=500, learning_rate=0.05, grow_policy=gp, random_seed=0,
                           verbose=False, **kw).fit(Ctr[feats], cytr, cat_features=CAT)
    fit = time.time() - t0
    t0 = time.time(); m.predict_proba(big); pred = time.time() - t0
    print(f"{gp:13s} test AUC {roc_auc_score(cyte, m.predict_proba(Cte[feats])[:, 1]):.4f}  "
          f"fit {fit:5.1f}s  predict 200k rows {pred:.2f}s")</div>
  <div class="fx" data-lang="text">SymmetricTree test AUC 0.7815  fit  42.3s  predict 200k rows 4.11s
Depthwise     test AUC 0.7657  fit  45.4s  predict 200k rows 6.37s
Lossguide     test AUC 0.7639  fit  51.0s  predict 200k rows 8.95s</div>
    <p>On this categorical table the default symmetric trees are both the most accurate (0.7815 vs 0.764–0.766) and the fastest at prediction: 200,000 rows in 4.1 s against 6.4 s (depth-wise) and 9.0 s (leaf-wise), because an oblivious tree is evaluated with a few comparisons and an array lookup instead of walking branches. The free-shape trees can fit more detail per tree, but here that detail was noise. Training time is similar for all three (single thread, shared machine).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Oblivious decision tree</strong> (symmetric tree, decision table): a tree in which all nodes at the same depth test the same condition. A depth-d oblivious tree defines 2<sup>d</sup> leaves indexed by the d-bit vector of test outcomes. CatBoost's default: <code>grow_policy="SymmetricTree"</code>, <code>depth=6</code> (64 leaves).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Depth means something different here. CatBoost depth 10 = 1,024 leaves in <em>every</em> tree, and training cost grows fast with depth. Keep depth 4–10 (default 6). Do not copy LightGBM's <code>num_leaves</code> logic into <code>depth</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Feature combinations.</b> Ordered statistics encode each categorical column alone. But on the diary, wind matters on rainy days and not on overcast ones: the label depends on the <em>combination</em> of two categories. A per-column statistic averages that away.</div>

  <h2 id="cb-combo"><span class="num">07</span>Feature Combinations</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each categorical column gets its own target statistic. But some patterns live only in a combination: on the diary, rainy and windy days are never played while rainy calm days always are. Can one column's statistic see that?</p>
  </div>
  <h3>The idea</h3>
  <p>When building a tree, after the first split on a categorical CTR, CatBoost tries <strong>combining</strong> the categorical features already used in the current tree with other categorical features: "plan = student AND payment = cash" becomes a new category value, gets its own ordered target statistic, and competes for the next split like any other feature. The combinations are built greedily, only where they look useful, so the number of candidates stays manageable (all pairs of a 300-value and a 40-value column would already be 12,000 values).</p>
  <h3>Worked: why a combination helps</h3>
  <table class="tbl">
    <tr><th>Outlook</th><th>Wind</th><th>days</th><th>played</th><th>play rate</th></tr>
    <tr><td>Rain</td><td>Strong</td><td>D6, D14</td><td>0</td><td>0.00</td></tr>
    <tr><td>Rain</td><td>Weak</td><td>D4, D5, D10</td><td>3</td><td>1.00</td></tr>
    <tr><td>Sunny</td><td>Strong</td><td>D2, D11</td><td>1</td><td>0.50</td></tr>
    <tr><td>Sunny</td><td>Weak</td><td>D1, D8, D9</td><td>1</td><td>0.33</td></tr>
    <tr><td>Overcast</td><td>Strong / Weak</td><td>D7, D12 / D3, D13</td><td>4</td><td>1.00</td></tr>
  </table>
  <p>The per-column statistics are: Rain 3/5 = 0.60, Sunny 0.40, Overcast 1.00; Strong 3/6 = 0.50, Weak 6/8 = 0.75. Neither column alone identifies the 0.00 group: "rain" looks like a 60% day and "windy" like a coin flip. The combined value "Rain|Strong" has statistic 0.00 directly, and one split isolates it. That is exactly the rule the decision tree in <a class="xref" data-note="ml_dtree">Decision Trees</a> needed two levels for (Rain → Wind).</p>
  <p><code>max_ctr_complexity</code> sets the maximum number of categorical columns in one combination (1 = no combinations). At scale, on the churn table, whose churn really depends on plan × payment:</p>
  <div class="fx" data-lang="py">from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
for mcc in [1, 2, 4]:
    m = CatBoostClassifier(iterations=800, learning_rate=0.05, depth=6, max_ctr_complexity=mcc,
                           random_seed=0, verbose=False).fit(Ctr[feats], cytr, cat_features=CAT)
    print(f"max_ctr_complexity={mcc}  test AUC {roc_auc_score(cyte, m.predict_proba(Cte[feats])[:, 1]):.4f}")
# which pairs of features does the model use together most?
inter = m.get_feature_importance(type="Interaction")[:3]
print("top interactions:", [(feats[int(i)], feats[int(j)], round(s, 1)) for i, j, s in inter])</div>
  <div class="fx" data-lang="text">max_ctr_complexity=1  test AUC 0.7715
max_ctr_complexity=2  test AUC 0.7781
max_ctr_complexity=4  test AUC 0.7781
top interactions: [('city', 'device', np.float64(8.9)), ('city', 'payment', np.float64(8.1)), ('plan', 'device', np.float64(6.9))]</div>
    <p>Without combinations (<code>max_ctr_complexity=1</code>) test AUC is 0.7715, about the level LightGBM reached. Allowing pairs lifts it to 0.7781, and allowing up to 4 columns adds nothing more: the real interaction in this table is between two columns. The interaction ranking shows which feature pairs the trees use together most (city with device and payment, plan with device); the plan × payment effect is captured through the combined CTRs. Combinations are one reason CatBoost beats the one-column encodings on this table.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Combinations multiply cardinality, so each combined value has fewer rows and noisier statistics, and they cost training time and memory. If CatBoost is slow on many categorical columns, lowering <code>max_ctr_complexity</code> to 1–2 is one of the first speed knobs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Other built-in behaviour.</b> We have CatBoost's three main ideas. A few smaller behaviours matter in practice: tiny categories, missing values, row sampling, randomness in split scores.</div>

  <h2 id="cb-more"><span class="num">08</span>Other Built-in Behaviour</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Beyond the main ideas, what does CatBoost do by default with small categories, missing values, row sampling and text, and which of those should you know about?</p>
  </div>
  <table class="tbl">
    <tr><th>Behaviour</th><th>Parameter</th><th>What happens</th></tr>
    <tr><td>Small categories one-hot</td><td><code>one_hot_max_size</code></td><td>Columns with at most this many values are one-hot encoded instead of CTRs (default 2 here: only two-valued columns)</td></tr>
    <tr><td>Missing numeric values</td><td><code>nan_mode</code> = Min (default), Max, Forbidden</td><td>NaN is treated as smaller (or larger) than every value, so splits can separate it; Forbidden raises an error</td></tr>
    <tr><td>Missing categorical values</td><td>—</td><td>Treated as one more category value</td></tr>
    <tr><td>Numeric binning</td><td><code>border_count</code> (254)</td><td>Histogram bins per numeric feature, like LightGBM's max_bin</td></tr>
    <tr><td>Row sampling</td><td><code>bootstrap_type</code>: Bayesian, Bernoulli, MVS, No</td><td>Bayesian gives each row a random weight (strength <code>bagging_temperature</code>); Bernoulli / MVS sample rows (<code>subsample</code>); MVS favours large-gradient rows, an idea close to GOSS</td></tr>
    <tr><td>Random split scores</td><td><code>random_strength</code> (1)</td><td>Adds noise to split scores, shrinking over iterations: more diverse trees, less overfitting</td></tr>
    <tr><td>Column sampling</td><td><code>rsm</code></td><td>Fraction of features considered per split (CPU)</td></tr>
    <tr><td>Imbalance</td><td><code>auto_class_weights</code> = Balanced / SqrtBalanced, <code>scale_pos_weight</code></td><td>Reweights classes (probabilities no longer calibrated)</td></tr>
    <tr><td>Text columns</td><td><code>text_features</code></td><td>Tokenises text and builds bag-of-words / naive-Bayes style features</td></tr>
    <tr><td>Hardware</td><td><code>task_type="GPU"</code>, <code>thread_count</code></td><td>Very fast GPU training, especially on large data</td></tr>
    <tr><td>Overfitting detector</td><td><code>early_stopping_rounds</code> (od_type="Iter"), <code>use_best_model</code></td><td>Stops on the eval set and keeps the best iteration</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not pre-process categorical columns before CatBoost. Label-encoding them and then passing them as <code>cat_features</code> works but adds nothing; one-hot or target-encoding them yourself throws away CatBoost's main advantage. Give it the raw values (strings or integers) and list them in <code>cat_features</code>. Float values are not accepted as categories: convert to string or int.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Defaults &amp; parameters.</b> We have seen the behaviours. Which parameters control them, with what defaults, and which are worth tuning?</div>

  <h2 id="cb-params"><span class="num">09</span>Defaults &amp; Parameters</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>CatBoost is known for strong defaults. What are they, and which few parameters actually deserve tuning?</p>
  </div>
  <table class="tbl">
    <tr><th>Parameter (aliases)</th><th>Default</th><th>Effect</th><th>Typical tuning range</th></tr>
    <tr><td><code>iterations</code> (n_estimators, num_boost_round)</td><td>1000</td><td>Number of trees</td><td>set high + early stopping</td></tr>
    <tr><td><code>learning_rate</code> (eta)</td><td>automatic</td><td>Chosen from data size and iterations when not set</td><td>0.01–0.1</td></tr>
    <tr><td><code>depth</code> (max_depth)</td><td>6</td><td>Levels of the symmetric tree; 2<sup>depth</sup> leaves</td><td>4–10</td></tr>
    <tr><td><code>l2_leaf_reg</code> (reg_lambda)</td><td>3</td><td>L2 on leaf values (λ in −G/(H+λ))</td><td>1–10</td></tr>
    <tr><td><code>cat_features</code></td><td>none</td><td>Which columns are categorical</td><td>—</td></tr>
    <tr><td><code>one_hot_max_size</code></td><td>2 (often; the diary's Humidity and Wind, with 2 values, would be one-hot)</td><td>One-hot instead of CTR for small categories</td><td>2–10</td></tr>
    <tr><td><code>max_ctr_complexity</code></td><td>4 (CPU)</td><td>Max categorical columns in a combination</td><td>1–4</td></tr>
    <tr><td><code>boosting_type</code></td><td>automatic</td><td>Ordered or Plain</td><td>Ordered for small data</td></tr>
    <tr><td><code>grow_policy</code></td><td>SymmetricTree</td><td>Tree shape</td><td>Depthwise / Lossguide rarely</td></tr>
    <tr><td><code>random_strength</code></td><td>1</td><td>Noise on split scores</td><td>0–10</td></tr>
    <tr><td><code>bagging_temperature</code></td><td>1</td><td>Bayesian bootstrap strength (0 = no weights)</td><td>0–5</td></tr>
    <tr><td><code>border_count</code> (max_bin)</td><td>254</td><td>Bins per numeric feature</td><td>32–1024</td></tr>
    <tr><td><code>loss_function</code> / <code>eval_metric</code></td><td>Logloss / RMSE by task</td><td>Training loss / metric for early stopping</td><td>AUC, F1, MAE, …</td></tr>
    <tr><td><code>early_stopping_rounds</code></td><td>off</td><td>Overfitting detector patience</td><td>50–300</td></tr>
    <tr><td><code>random_seed</code>, <code>verbose</code>, <code>thread_count</code></td><td>0, 1, all cores</td><td>Reproducibility, logging, threads</td><td>—</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>CatBoost's defaults are tuned to be good, and its two leakage fixes plus symmetric trees make it hard to overfit. The usual order of tuning: learning rate + early stopping → depth → l2_leaf_reg → random_strength / bagging_temperature → one_hot_max_size / max_ctr_complexity for speed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Full code.</b> What does a complete training run look like, from raw strings to a saved model?</div>

  <h2 id="cb-code"><span class="num">10</span>Full Code on the Churn Table</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know the ideas and the knobs. What does a full CatBoost run look like on a real categorical table, with no encoding code at all?</p>
  </div>
  <p>A complete run: raw string columns, a <code>Pool</code> (CatBoost's data container, which records which columns are categorical), an evaluation set with early stopping on AUC, feature importance, the defaults it chose, and save/load:</p>
  <div class="fx" data-lang="py">from catboost import CatBoostClassifier, Pool
from sklearn.metrics import roc_auc_score
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
train = Pool(Ctr[feats], cytr, cat_features=CAT)      # raw strings: no encoding needed
val = Pool(Cva[feats], cyva, cat_features=CAT)
t0 = time.time()
model = CatBoostClassifier(iterations=3000, learning_rate=0.05, depth=6, l2_leaf_reg=3,
                           eval_metric="AUC", early_stopping_rounds=200, random_seed=0, verbose=500)
model.fit(train, eval_set=val, use_best_model=True)
print(f"best iteration {model.get_best_iteration()}, trees kept {model.tree_count_}, {time.time() - t0:.0f}s")
p = model.predict_proba(Cte[feats])[:, 1]
print(f"test AUC {roc_auc_score(cyte, p):.4f}")
print(model.get_feature_importance(prettified=True).round(1).to_string(index=False))
t0 = time.time()
default = CatBoostClassifier(verbose=False, random_seed=0).fit(Ctr[feats], cytr, cat_features=CAT)
print(f"pure defaults: test AUC {roc_auc_score(cyte, default.predict_proba(Cte[feats])[:, 1]):.4f}  "
      f"({default.tree_count_} trees, {time.time() - t0:.0f}s)")
keys = ["iterations", "learning_rate", "depth", "l2_leaf_reg", "boosting_type", "grow_policy",
        "one_hot_max_size", "max_ctr_complexity", "border_count", "bootstrap_type", "nan_mode"]
print({k: default.get_all_params().get(k) for k in keys})
model.save_model("churn_cb.cbm")
again = CatBoostClassifier().load_model("churn_cb.cbm")
print("reloaded model same predictions:", np.allclose(again.predict_proba(Cte[feats])[:, 1], p))</div>
  <div class="fx" data-lang="text">0:	test: 0.6322030	best: 0.6322030 (0)	total: 205ms	remaining: 10m 14s
500:	test: 0.7803925	best: 0.7811304 (381)	total: 53.3s	remaining: 4m 26s
Stopped by overfitting detector  (200 iterations wait)

bestTest = 0.7811304151
bestIteration = 381

Shrink model to first 382 iterations.
best iteration 381, trees kept 382, 61s
test AUC 0.7827
   Feature Id  Importances
       tenure         25.0
         city         18.3
         plan         13.6
 monthly_bill         13.0
      payment         11.5
support_calls         10.3
       device          8.4
pure defaults: test AUC 0.7809  (1000 trees, 88s)
{'iterations': 1000, 'learning_rate': 0.029767999425530434, 'depth': 6, 'l2_leaf_reg': 3, 'boosting_type': 'Plain', 'grow_policy': 'SymmetricTree', 'one_hot_max_size': 2, 'max_ctr_complexity': 4, 'border_count': 254, 'bootstrap_type': 'MVS', 'nan_mode': 'Min'}
reloaded model same predictions: True</div>
    <p>The log prints validation AUC every 500 iterations; the overfitting detector stopped 200 rounds after the best one (iteration 381) and shrank the model to 382 trees. Test AUC 0.7827, about 0.01 above LightGBM's best encodings on the same table (0.772–0.773), with no encoding code at all. City, plan and payment carry about 43% of the importance between them, device another 8%: the categorical columns matter as much as the numeric ones. Pure defaults (1,000 trees, automatic learning rate 0.0298) reach 0.7809 without any validation set: CatBoost's out-of-the-box quality is real. The printed defaults also answer section 08's questions on this data: Plain boosting, symmetric trees, one-hot only for 2-valued columns, combinations of up to 4 categorical columns, 254 numeric borders, MVS sampling and NaN treated as the minimum.</p>
  <ul>
    <li><code>use_best_model=True</code> keeps only the trees up to the best eval score (the default when an eval set is given).</li>
    <li>Feature importance here is "PredictionValuesChange" (how much predictions change when a feature is used), the default; for explanations prefer SHAP: <code>get_feature_importance(type="ShapValues")</code>, see <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</li>
    <li>Models save to <code>.cbm</code> (binary), and can be exported to JSON, ONNX, CoreML or C++/Python code.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>At prediction time pass the same columns with the same types. A categorical column that arrives as float (for example because of a NaN in pandas) raises an error, and a category value unseen in training is handled as "new" (prior-based statistic): fine, but monitor how often it happens.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: When to choose CatBoost.</b> CatBoost is accurate on categorical data, but slower to train. Against LightGBM and XGBoost on the same table, when is it the right choice?</div>

  <h2 id="cb-when"><span class="num">11</span>When to Choose CatBoost</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Three libraries share the same boosting maths. On a categorical-heavy table, how do they compare in accuracy and time, and how do you choose?</p>
  </div>
  <h3>Head-to-head on categorical data</h3>
  <p>The three libraries on the same churn table, each using its own categorical handling and early stopping (XGBoost also with one-hot):</p>
  <div class="fx" data-lang="py">import lightgbm as lgb, xgboost as xgb
from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
cats = {c: pd.CategoricalDtype(sorted(df[c].unique())) for c in CAT}
nat = lambda D: D[feats].astype(cats)
def report(name, p, t0):
    print(f"{name:34s} test AUC {roc_auc_score(cyte, p):.4f}   {time.time() - t0:5.1f}s")
t0 = time.time()
m = CatBoostClassifier(iterations=3000, learning_rate=0.05, early_stopping_rounds=200, random_seed=0,
                       verbose=False).fit(Ctr[feats], cytr, cat_features=CAT, eval_set=(Cva[feats], cyva))
report("CatBoost (raw strings)", m.predict_proba(Cte[feats])[:, 1], t0)
t0 = time.time()
m = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.05, verbose=-1)
m.fit(nat(Ctr), cytr, eval_X=nat(Cva), eval_y=cyva, callbacks=[lgb.early_stopping(200, verbose=False)])
report("LightGBM native categorical", m.predict_proba(nat(Cte))[:, 1], t0)
t0 = time.time()
m = xgb.XGBClassifier(n_estimators=3000, learning_rate=0.05, enable_categorical=True, max_cat_to_onehot=1,
                      early_stopping_rounds=200, eval_metric="logloss")
m.fit(nat(Ctr), cytr, eval_set=[(nat(Cva), cyva)], verbose=False)
report("XGBoost enable_categorical", m.predict_proba(nat(Cte))[:, 1], t0)
oh_cols = pd.get_dummies(Ctr[feats], columns=CAT).columns
oh = lambda D: pd.get_dummies(D[feats], columns=CAT, dtype=float).reindex(columns=oh_cols, fill_value=0)
t0 = time.time()
m = xgb.XGBClassifier(n_estimators=3000, learning_rate=0.05, early_stopping_rounds=200, eval_metric="logloss")
m.fit(oh(Ctr), cytr, eval_set=[(oh(Cva), cyva)], verbose=False)
report("XGBoost one-hot", m.predict_proba(oh(Cte))[:, 1], t0)</div>
  <div class="fx" data-lang="text">CatBoost (raw strings)             test AUC 0.7829    37.1s
LightGBM native categorical        test AUC 0.7718     1.2s
XGBoost enable_categorical         test AUC 0.7486     4.0s
XGBoost one-hot                    test AUC 0.7732    20.6s</div>
    <p>CatBoost with raw strings is best (0.783), about 0.01 AUC above LightGBM's native categorical splits and XGBoost with one-hot (0.772–0.773). XGBoost's native categorical mode (partition splits on the training gradients, like LightGBM's) did worst here (0.749): with 300 cities, many of them rare, gradient-sorted partitions overfit, which is exactly the leak CatBoost was built to avoid. The price is time: CatBoost took 37 s against LightGBM's 1.2 s (single thread, shared machine). That trade-off is the whole decision: categorical-heavy table and time to spare → CatBoost; huge data and tight training budget → LightGBM.</p>
  <h3>Decision guide</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Choose</th><th>Why</th></tr>
    <tr><td>Many categorical columns, some with high cardinality</td><td><strong>CatBoost</strong></td><td>Ordered TS without leakage, combinations, no encoding work</td></tr>
    <tr><td>Small to medium data (≤ 100k rows), little time to tune</td><td><strong>CatBoost</strong></td><td>Strong defaults, symmetric trees, ordered boosting resist overfitting</td></tr>
    <tr><td>Fast, low-latency prediction needed</td><td><strong>CatBoost</strong></td><td>Oblivious trees evaluate very quickly</td></tr>
    <tr><td>Very large numeric / sparse data, training time matters</td><td><a class="xref" data-note="ml_lightgbm">LightGBM</a></td><td>Fastest training: histograms, leaf-wise, GOSS, EFB</td></tr>
    <tr><td>Mature ecosystem, custom objectives, distributed / GPU at scale</td><td><a class="xref" data-note="ml_xgboost">XGBoost</a></td><td>Most widely deployed, flexible API</td></tr>
    <tr><td>Data has a true time order</td><td>CatBoost with <code>has_time=True</code>, or any booster with time-aware CV</td><td>Encodings must respect real time</td></tr>
    <tr><td>Need the last 0.1% (competition)</td><td>All three + blend</td><td>Different biases; see <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a></td></tr>
  </table>
  <h3>Compared with its family</h3>
  <table class="tbl">
    <tr><th></th><th>XGBoost</th><th>LightGBM</th><th>CatBoost</th></tr>
    <tr><td>Main contribution</td><td>Regularised Newton boosting, system design</td><td>Speed: hist, leaf-wise, GOSS, EFB</td><td>Leakage-free categories and gradients</td></tr>
    <tr><td>Categorical handling</td><td>one-hot / enable_categorical</td><td>gradient-sorted splits</td><td>ordered target statistics + combinations</td></tr>
    <tr><td>Tree shape</td><td>depth-wise</td><td>leaf-wise</td><td>symmetric</td></tr>
    <tr><td>Overfitting control</td><td>λ, α, γ, min_child_weight</td><td>num_leaves, min_data_in_leaf</td><td>symmetric trees, ordered schemes, l2_leaf_reg, random_strength</td></tr>
    <tr><td>Training speed (CPU)</td><td>fast</td><td>fastest</td><td>slowest of the three</td></tr>
    <tr><td>Prediction speed</td><td>fast</td><td>fast</td><td>fastest</td></tr>
    <tr><td>Out-of-the-box quality</td><td>good</td><td>good</td><td>best</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have met ordered statistics, ordered boosting, symmetric trees and combinations. What single idea ties them together?</div>

    <h2 id="cb-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Target statistics, the leak, ordered statistics, prediction shift, ordered boosting, symmetric trees, combinations: separate tricks, or one rule applied everywhere?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 320" width="680">
<defs><marker id="cb-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="46" rx="7" class="fb sb"/><text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">category → target statistic</text><text x="110" y="46" text-anchor="middle" class="tm" font-size="10">Overcast 4/4, Rain 3/5, Sunny 2/5</text>
<line x1="210" y1="33" x2="248" y2="33" stroke="currentColor" marker-end="url(#cb-c9)"/>
<rect x="250" y="10" width="190" height="46" rx="7" class="fr sr"/><text x="345" y="29" text-anchor="middle" font-size="11.5" font-weight="700">leak: row uses own label</text><text x="345" y="46" text-anchor="middle" class="tm" font-size="10">Day_TE = label; LOO reversed</text>
<line x1="440" y1="33" x2="478" y2="33" stroke="currentColor" marker-end="url(#cb-c9)"/>
<rect x="480" y="10" width="190" height="46" rx="7" class="fg sg" stroke-width="2"/><text x="575" y="29" text-anchor="middle" font-size="11.5" font-weight="700">rule: only earlier rows</text><text x="575" y="46" text-anchor="middle" class="tm" font-size="10">a random "time" order</text>
<line x1="540" y1="56" x2="420" y2="96" stroke="currentColor" marker-end="url(#cb-c9)"/><line x1="610" y1="56" x2="600" y2="96" stroke="currentColor" marker-end="url(#cb-c9)"/>
<rect x="250" y="98" width="220" height="46" rx="7" class="ft st"/><text x="360" y="117" text-anchor="middle" font-size="11.5" font-weight="700">ordered target statistics</text><text x="360" y="134" text-anchor="middle" class="tm" font-size="10">sunny: 0.5, 0.75, 0.5, 0.375, 0.3</text>
<rect x="490" y="98" width="180" height="46" rx="7" class="ft st"/><text x="580" y="117" text-anchor="middle" font-size="11.5" font-weight="700">ordered boosting</text><text x="580" y="134" text-anchor="middle" class="tm" font-size="10">honest residual 9.33, not 7</text>
<rect x="10" y="98" width="220" height="46" rx="7" class="fr sr"/><text x="120" y="117" text-anchor="middle" font-size="11.5" font-weight="700">prediction shift in boosting</text><text x="120" y="134" text-anchor="middle" class="tm" font-size="10">in-sample residual × (n − 1)/n</text>
<line x1="230" y1="121" x2="488" y2="121" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="360" y1="144" x2="250" y2="186" stroke="currentColor" marker-end="url(#cb-c9)"/><line x1="360" y1="144" x2="470" y2="186" stroke="currentColor" marker-end="url(#cb-c9)"/>
<rect x="110" y="188" width="230" height="46" rx="7" class="fb sb"/><text x="225" y="207" text-anchor="middle" font-size="11.5" font-weight="700">combinations</text><text x="225" y="224" text-anchor="middle" class="tm" font-size="10">Rain|Strong: 0/2 played</text>
<rect x="360" y="188" width="230" height="46" rx="7" class="fb sb"/><text x="475" y="207" text-anchor="middle" font-size="11.5" font-weight="700">symmetric trees</text><text x="475" y="224" text-anchor="middle" class="tm" font-size="10">leaf = bits of the answers</text>
<rect x="150" y="256" width="400" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="350" y="281" text-anchor="middle" font-size="11">same g/h maths as XGBoost; best on categorical-heavy, small-to-medium data</text>
<line x1="225" y1="234" x2="280" y2="254" stroke="currentColor" marker-end="url(#cb-c9)"/><line x1="475" y1="234" x2="420" y2="254" stroke="currentColor" marker-end="url(#cb-c9)"/>
</svg><figcaption>CatBoost applies one rule twice: a number computed for a row must not use that row's label. Ordered target statistics apply it to category encodings, ordered boosting to residuals. Combinations extend the statistics to pairs of categories; symmetric trees keep each tree simple and fast.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same 14 diary days</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the diary</th><th>When to use / watch</th></tr>
    <tr><td>Target statistic</td><td>mean label per category (+ prior)</td><td>how to make a category numeric?</td><td>Overcast 4/4, Rain 3/5, Sunny 2/5</td><td>high cardinality; must be leak-free</td></tr>
    <tr><td>Greedy TS leak</td><td>own label inside the mean</td><td>why does it overfit?</td><td>Day_TE = label on all 14 days</td><td>never on training rows</td></tr>
    <tr><td>Leave-one-out</td><td>(S − y)/(n − 1)</td><td>does excluding the row fix it?</td><td>sunny: played 0.25, unplayed 0.50 (reversed)</td><td>no</td></tr>
    <tr><td>Ordered TS</td><td>earlier rows only + prior</td><td>leak-free, no folds?</td><td>sunny days 0.5, 0.75, 0.5, 0.375, 0.3</td><td>always in CatBoost; has_time for real time</td></tr>
    <tr><td>Prediction shift</td><td>residual from a model that saw the row</td><td>are residuals honest?</td><td>D13: 7 in-sample vs 9.33 honest</td><td>worst for small leaves / small data</td></tr>
    <tr><td>Ordered boosting</td><td>prefix models 1, 2, 4, …</td><td>honest gradients cheaply?</td><td>D9's gradient from the 13 days before it</td><td>small data; ~2× slower</td></tr>
    <tr><td>Oblivious tree</td><td>one condition per level</td><td>fast, regularised shape?</td><td>humid? windy? → leaf 0–3</td><td>default; depth 4–10</td></tr>
    <tr><td>Combination</td><td>concatenated categories + TS</td><td>two-category patterns?</td><td>Rain|Strong 0/2 vs Rain 3/5</td><td>max_ctr_complexity 1–4</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a statistic or gradient for a training row must never be computed with that row's own label, so CatBoost orders the rows and lets each one be served only by its predecessors.</strong> Ordered target statistics apply this to categories, ordered boosting to residuals; symmetric trees and combinations make the resulting model fast and able to see category interactions.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> Knowing how the parts fit, which mistakes do people still make with CatBoost?</div>

<h2 id="cb-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know why CatBoost works. Which mistakes still cost people accuracy or time with it?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting cat_features</span>
    <p>Without <code>cat_features</code>, string columns raise an error and integer-coded categories are treated as numbers with a fake order. Always list them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: encoding categories yourself first</span>
    <p>One-hot or target encoding before CatBoost removes its main advantage, and naive target encoding reintroduces the very leak CatBoost was built to avoid.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: target-encoding outside the CV folds (any library)</span>
    <p>Encode inside each fold, or use CatBoost. Otherwise validation scores are optimistic.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: time-ordered data with random permutations</span>
    <p>Sort by time and set <code>has_time=True</code>; validate on a later period.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: very deep symmetric trees</span>
    <p>Depth 12 means 4,096 leaves per tree and slow training. Stay at 4–10.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting probabilities after class weights</span>
    <p><code>auto_class_weights</code> and <code>scale_pos_weight</code> distort probabilities. Recalibrate or adjust the threshold instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "CatBoost needs no tuning at all"</span>
    <p>Its defaults are strong, but the learning rate with early stopping and the depth still matter. Always early-stop on a validation set.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision sheet.</b> The whole note on one page, for revising.</div>

    <h2 id="cb-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: the captain's cricket diary, 14 days; Outlook (Sunny 5 days, 2 played; Overcast 4, 4 played; Rain 5, 3 played), Wind, Play, Turnout. At scale: the 20,000-row categorical churn table (city 300 values, pincode ≈ 4,900 noise values).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on the diary</th><th>Weakness → next</th></tr>
    <tr><td>Encodings</td><td>how to split on a category?</td><td>codes (fake order), one-hot, target statistic</td><td>TS leaks</td></tr>
    <tr><td>The leak</td><td>what goes wrong?</td><td>Day_TE = label; LOO reverses (0.25 vs 0.50)</td><td>need leak-free TS</td></tr>
    <tr><td>Ordered TS</td><td>encode without own label?</td><td>sunny: 0.5, 0.75, 0.5, 0.375, 0.3</td><td>gradients leak too</td></tr>
    <tr><td>Prediction shift</td><td>are residuals honest?</td><td>D13: 7 vs 9.33</td><td>need unseen-row models</td></tr>
    <tr><td>Ordered boosting</td><td>honest gradients?</td><td>prefix models; churn 1k rows: log-loss 0.452 → 0.441</td><td>tree shape?</td></tr>
    <tr><td>Oblivious trees</td><td>fast, regular trees?</td><td>humid? windy? → 2-bit leaf</td><td>single-column TS misses pairs</td></tr>
    <tr><td>Combinations</td><td>pairs of categories?</td><td>Rain|Strong 0/2</td><td>→ behaviours, code, choice</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th><th>Diary value</th></tr>
    <tr><td>Greedy TS</td><td>(Σ_c y + a·P)/(count(c) + a)</td><td>P prior, a its weight</td><td>Sunny (2 + 0.5)/(5 + 1) = 0.417</td></tr>
    <tr><td>Leave-one-out</td><td>(S − y_k)/(n − 1)</td><td>S category label sum</td><td>sunny played 0.25, unplayed 0.50</td></tr>
    <tr><td>Ordered TS</td><td>(Σ_{earlier, same c} y + a·P)/(earlier count + a)</td><td>random permutation σ</td><td>D9: (1 + 0.5)/(4 + 1) = 0.3</td></tr>
    <tr><td>In-sample shrink</td><td>residual_in = (n − 1)/n × residual_out</td><td>n rows in the leaf</td><td>7 = 0.75 × 9.33</td></tr>
    <tr><td>Oblivious leaf index</td><td>Σ_k b_k·2^{d−k}</td><td>b_k answer bits</td><td>humid, windy → 3</td></tr>
    <tr><td>Leaf value</td><td>−G/(H + l2_leaf_reg)</td><td>default λ = 3</td><td>—</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Choose CatBoost</b><p>Many or high-cardinality categorical columns, small-to-medium data, little tuning time, fast prediction needed.</p><small>Raw strings + cat_features</small></div>
    <div><b>Choose LightGBM</b><p>Huge numeric or sparse data where training time dominates.</p><small>CatBoost took 37 s vs 1.2 s on churn</small></div>
    <div><b>Real time order</b><p>Sort by time and set has_time=True; validate on a later period.</p><small>Random permutations would use the future</small></div>
    <div><b>Ordered boosting</b><p>Turn it on for small data where calibration matters.</p><small>About 2× slower</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Forgetting cat_features; encoding categories yourself first; target-encoding outside CV folds (any library); random permutations on time-ordered data; very deep symmetric trees (2^depth leaves); trusting probabilities after class weights; assuming no tuning at all is needed.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why is target-encoding the Day column useless?</td><td>One row per value: the encoding equals the row's own label</td></tr>
    <tr><td>Sunny: S = 2 of n = 5. LOO value for a played sunny day?</td><td>(2 − 1)/4 = 0.25 (unplayed: 0.50), so the label leaks reversed</td></tr>
    <tr><td>Earlier sunny days: 4, of which 1 played; P = 0.5, a = 1. Ordered TS?</td><td>(1 + 0.5)/(4 + 1) = 0.3</td></tr>
    <tr><td>Leaf of 4 rows: honest residual 9.33. In-sample residual?</td><td>9.33 × 3/4 = 7</td></tr>
    <tr><td>What does max_ctr_complexity = 1 switch off?</td><td>Feature combinations (e.g. Rain|Strong)</td></tr>
  </table>

<h2 id="cb-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is naive target encoding dangerous?</summary><div class="qa-body">Each row's encoding includes its own label, so on training data the feature is more predictive than it can be on new rows (in the extreme, one row per category, it equals the label). The model relies on it and fails on test data: target leakage causing a prediction shift.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does leave-one-out encoding still leak?</summary><div class="qa-body">x̂<sub>k</sub> = (S − y<sub>k</sub>)/(n−1). Within one category S and n are fixed, so x̂<sub>k</sub> is a decreasing function of y<sub>k</sub>: positives get a lower value than negatives. A tree can split on it and recover the label.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain ordered target statistics.</summary><div class="qa-body">Shuffle the training rows. For each row, compute the category's target mean using only earlier rows in that order with the same category, plus a prior: (Σ earlier y + aP)/(earlier count + a). No row uses its own label; all history is used. Several permutations reduce the noise for early rows; at prediction time all training rows are used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is prediction shift in gradient boosting?</summary><div class="qa-body">Residuals of training rows are computed by a model that was trained on those rows, so they are smaller than the residuals the model would leave on new rows (a leaf of n rows shrinks each residual by about (n−1)/n). Gradients are biased, and later trees fit noise. The conditional distribution of F(x<sub>k</sub>) for training rows differs from that for test rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does ordered boosting fix it, and is it always on?</summary><div class="qa-body">The gradient of row i in a random order is computed by a model trained only on the rows before i (CatBoost keeps prefix models of sizes 2<sup>j</sup> to make it affordable). It is not always on: boosting_type="Ordered" is mostly chosen for small data; the default on most datasets is Plain, while ordered target statistics are always used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an oblivious tree and why does CatBoost use it?</summary><div class="qa-body">Every node at a depth tests the same condition, so a depth-d tree is d conditions and 2<sup>d</sup> leaves indexed by the bit vector of answers. Benefits: very fast, branch-free prediction; strong regularisation (a split must help the whole level); simple structure that combines well with ordered boosting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CatBoost create feature combinations?</summary><div class="qa-body">Greedily, while building a tree: categorical features already used in the tree are combined with other categorical features; the combination becomes a new categorical value with its own ordered target statistic and competes for splits. max_ctr_complexity limits how many columns can be combined.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do one_hot_max_size and l2_leaf_reg do?</summary><div class="qa-body">one_hot_max_size: categorical columns with at most that many values are one-hot encoded instead of using target statistics. l2_leaf_reg: the L2 penalty λ on leaf values (default 3), as in XGBoost's −G/(H+λ).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does CatBoost handle missing values?</summary><div class="qa-body">For numeric features, nan_mode=Min (default) treats NaN as less than every value, so a split can separate it; Max does the opposite; Forbidden raises. For categorical features a missing value is just another category.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose CatBoost over LightGBM?</summary><div class="qa-body">Many or high-cardinality categorical columns, small-to-medium data, limited tuning time, or a need for fast prediction. Choose LightGBM for very large numeric or sparse data where training speed dominates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your data has a timestamp. What changes when you use CatBoost?</summary><div class="qa-body">Sort rows by time and set has_time=True so the ordered statistics and ordered boosting use the real order rather than a random permutation (no future information). Validate on a later time period, not with random K-fold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is CatBoost's ordered target statistic related to out-of-fold target encoding?</summary><div class="qa-body">Both guarantee that a row's encoding does not use its own label. Out-of-fold uses the other K−1 folds (fixed, (K−1)/K of the data); ordered TS uses all earlier rows in a random order (online style, no folds) and varies the order across trees to reduce noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does CatBoost share with XGBoost and LightGBM, and what does LightGBM's categorical method miss?</summary><div class="qa-body">Shared: gradient boosting with g/h statistics, L2-regularised leaves, histogram (border) split search. LightGBM sorts categories by the mean gradient of the same training rows, so each category's statistic includes its own rows' labels; with rare categories this overfits. CatBoost's ordered statistics avoid that.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does CatBoost need both ordered target statistics and ordered boosting? What breaks if you keep only the first?</summary><div class="qa-body">They remove the same leak from two places. Ordered TS keeps each row's own label out of its category encoding; without ordered boosting, each row's residual is still computed by a model that trained on it, so it is too small (D13: 7 instead of 9.33 on a 4-day leaf) and later trees fit noise. On large data that bias is small (Plain ≈ Ordered on 12,000 rows); on small data it shows (log-loss 0.452 vs 0.441 on 1,000 rows).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is CatBoost's categorical handling different from LightGBM's gradient-sorted splits on the same diary column?</summary><div class="qa-body">LightGBM sorts Outlook's values by the mean gradient of the training rows in the node, so each value's position uses its own rows' labels; with rare values this overfits. CatBoost turns Outlook into numbers with ordered statistics, so no day's value uses its own label (D9 gets 0.3 from the four sunny days before it), and adds combinations like Rain|Strong.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you replace CatBoost's symmetric trees with free (depth-wise or leaf-wise) trees?</summary><div class="qa-body">The leak fixes still work, but trees can again grow special branches for a few rows, prediction loses its branch-free bit lookup, and on the churn table both accuracy (0.782 → 0.764–0.766) and prediction speed (4.1 s → 6.4–9.0 s for 200k rows) got worse. Free trees fit more detail per tree; on noisy categorical data that detail is mostly noise.</div></details>
</main>
`
});
