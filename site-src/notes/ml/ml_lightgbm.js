// notes/ml/ml_lightgbm.js — LightGBM
Object.assign(TOPIC_CONTENT, {
  "ml_lightgbm": `<main>
  <h1>LightGBM</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>LightGBM</span></div>
  <p class="lead">LightGBM ("Light Gradient Boosting Machine", Microsoft, 2017) is gradient boosting built for speed on large tables. It keeps the mathematics of <a class="xref" data-note="ml_xgboost">XGBoost</a> unchanged, the gradients g, the Hessians h, the split gain built from G²/(H + λ) and the leaf value −G/(H + λ), and attacks the cost of finding splits from every side: it buckets values into histograms, spends each split on the leaf that gains most, looks at fewer rows per tree, merges sparse columns, and splits categorical columns directly. In real work this means models on tens of millions of rows train in minutes and wide one-hot or click data stays manageable, which is why LightGBM is a default choice in industry and competitions. Our running example is again the captain's 14-day cricket diary (Play, humidity, temperature, outlook, wind and turnout): fourteen rows cannot show speed, but every mechanism is small enough to follow on them by hand and check against the library. Speed itself is measured on the shared 20,000-row churn table and on larger synthetic data.</p>

  <h2 id="lgb-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LightGBM</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Same maths, cheaper search</div>
        <ul>
          <li>g, h, gain and leaf value exactly as in XGBoost</li>
          <li>Cost of a split search ≈ rows × columns + columns × cut-offs</li>
          <li>Histograms: ≤ 255 bins per column, built once</li>
          <li>Bigger child's histogram = parent − smaller child</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Leaf-wise growth</div>
        <ul>
          <li>Split the leaf with the largest gain, wherever it is</li>
          <li>More loss reduction per leaf; deep, lopsided trees</li>
          <li><code>num_leaves</code> (31) is the size knob; keep it &lt; 2<sup>max_depth</sup></li>
          <li><code>min_data_in_leaf</code> (20) is the real brake on small data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fewer rows, fewer columns</div>
        <ul>
          <li>GOSS: keep top 20% by |g|, sample 10% of the rest</li>
          <li>Sampled rows weighted (1 − a)/b, so sums stay unbiased</li>
          <li>EFB: columns never non-zero together share one column</li>
          <li>Bins offset inside a bundle so nothing is lost</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Categories and knobs</div>
        <ul>
          <li>Sort categories by mean gradient, scan k − 1 cuts</li>
          <li>Smoothing: <code>cat_smooth</code>, <code>min_data_per_group</code></li>
          <li><code>subsample</code> does nothing unless <code>subsample_freq</code> &gt; 0</li>
          <li>Defaults differ from XGBoost: λ = 0, lr 0.1, no depth limit</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lgb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where the Time Goes</span><span class="rm-sub">what a split search costs, and what to cut</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-hist"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Histogram Binning</span><span class="rm-sub">a few cut-offs instead of every value</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-leaf"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Leaf-wise Growth</span><span class="rm-sub">give the next split to the leaf that needs it</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-size"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Controlling Tree Size</span><span class="rm-sub">num_leaves, min_data_in_leaf, small data</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-goss"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">GOSS</span><span class="rm-sub">fewer rows without biased gains</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-efb"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">EFB</span><span class="rm-sub">fewer columns by bundling sparse ones</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-cat"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Native Categorical Splits</span><span class="rm-sub">sort by gradient, then scan</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-params"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Parameters and Aliases</span><span class="rm-sub">names, defaults, and a silent trap</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-speed"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How Fast Is It Really?</span><span class="rm-sub">measured against XGBoost and sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-api"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Training Code</span><span class="rm-sub">native and sklearn APIs, early stopping, saving</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-cmp"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">LightGBM and Its Family</span><span class="rm-sub">XGBoost, CatBoost, HistGradientBoosting</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">small data, aliases, categories, ported settings</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">the five ideas, formulas, knobs</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about LightGBM</span></div></div>
    </div>
  </div>

  <h2 id="lgb-why"><span class="num">01</span>Where the Time Goes</h2>
  <p>Every boosting library spends nearly all its training time on one job: for each node of each tree, find the best (column, cut-off) pair. In <a class="xref" data-note="ml_xgboost">XGBoost</a> the quality of a cut is the gain G<sub>L</sub>²/(H<sub>L</sub> + λ) + G<sub>R</sub>²/(H<sub>R</sub> + λ) − G²/(H + λ), where G and H are the sums of the gradients g and Hessians h of the rows on each side (LightGBM, like XGBoost's code, drops the paper's ½). To evaluate it, the library must first collect G and H for every candidate cut, which means visiting every row for every column, and then scan the candidates. So the cost per tree is roughly <strong>rows × columns</strong> to collect the statistics plus <strong>columns × candidate cut-offs</strong> to scan them.</p>
  <p>In 2016 that cost was a real problem. XGBoost's default search went through every distinct value of every column, and it grew trees level by level. On click logs or ad data, with tens of millions of rows and thousands of mostly-empty columns, each tree took a long time. LightGBM's insight was that every factor in that cost can be cut without changing what is being computed. Histograms cut the number of candidate cut-offs. Leaf-wise growth makes each split count for more. Gradient-based One-Side Sampling (GOSS) cuts the number of rows each tree looks at. Exclusive Feature Bundling (EFB) cuts the number of columns. And native categorical splits avoid the explosion of columns that one-hot encoding creates.</p>
  <p>An everyday picture: a railway clerk is asked again and again questions like "how many passengers are under 30?". The slow way is to sort all the passengers by age for every question. LightGBM's way is to put each passenger into one of a few age bands on day one and keep a count per band (histograms); to check the passengers who look most suspicious first plus a fair random sample of the rest, counting each sampled one several times (GOSS); and, since no passenger holds a sleeper ticket and an AC ticket at the same time, to keep those two lists in one register (EFB). The answers are the same or nearly so, and the work is a fraction.</p>
  <p>Throughout, keep in mind that <strong>LightGBM is a gradient boosting decision tree (GBDT) framework</strong>: the model is still a sum of regression trees fitted one after another to the gradients of the loss, exactly as in <a class="xref" data-note="ml_gbm">Gradient Boosting</a> and XGBoost. Only the way each tree is searched for and grown is different.</p>

  <h2 id="lgb-hist"><span class="num">02</span>Histogram Binning</h2>
  <p>The exact way to find the best cut on a numeric column is to sort its values and try a cut between every pair of neighbours. A column with a million distinct values gives a million candidates, at every node of every tree. Most of them are pointless: moving a cut-off from 81.37 to 81.38 hardly ever changes which split is best. <strong>Histogram binning</strong> decides on a small set of candidate cut-offs once, before training, and only ever considers those.</p>
  <p>Before training, LightGBM puts each column's values into at most <code>max_bin</code> buckets (default 255), chosen so that each bucket holds roughly the same number of rows, and stores every value as its bucket number, which fits in one byte. Then, for any node, it goes through the node's rows once, adding each row's g and h into the bucket of its value. The result, a total G<sub>b</sub> and H<sub>b</sub> per bucket, is the <strong>histogram</strong>. Scanning the bucket edges from left to right with running sums gives G<sub>L</sub> and H<sub>L</sub> for every candidate, and the right side is total minus left. There is no sorting during training, and the scan has at most 254 steps however many distinct values the column has. It is like a librarian who shelves books once into labelled sections and then answers "how many books before section K?" by adding up section counts, instead of re-sorting every book each time.</p>
  <p>Work it on the diary. We predict Play from humidity with log loss, starting from a probability of 0.5 for every day, so (as in the XGBoost note) every played day has g = −0.5, every unplayed day g = +0.5, and every day h = 0.25. With <code>max_bin=4</code> LightGBM forms three buckets with edges at 77.5 and 90.5 (it treats <code>max_bin</code> as an upper limit). The first bucket holds 65, 70, 70, 70, 75 (four played days and D6), so G = 4(−0.5) + 0.5 = −1.5 and H = 1.25. The second holds 80, 80, 85, 86, 90, 90 (four played, two not), G = −1.0, H = 1.5. The third holds 91, 95, 96 (one played, two not), G = +0.5, H = 0.75. Now only two cuts exist instead of nine. With LightGBM's default λ = 0 the parent's term is G²/H = 4/3.5 = 1.143. Cutting after the first bucket gives 1.5²/1.25 + 0.5²/2.25 − 1.143 = 0.768; cutting after the second gives 2.5²/2.75 + 0.5²/0.75 − 1.143 = 1.463, the winner.</p>
  <p>The second half of the trick is the <strong>subtraction trick</strong>. After a split, both children need histograms of every other column to find their own best split. But every row of the parent lands in exactly one child, so histogram(left) + histogram(right) = histogram(parent), and the parent's histogram is already known. So LightGBM builds the histogram of the <em>smaller</em> child only and gets the bigger one by subtraction, which means the two children together cost at most half the rows. The code repeats the hand calculation and then checks the trick on the temperature column, building the 3-day right child (D14, D8, D4) directly and getting the 11-day left child by subtraction:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
hum, temp = df.HumPct.values, df.TempC.values
play = (df.Play == "Yes").astype(int).values
g, h = 0.5 - play, np.full(14, 0.25)               # log loss at p = 0.5
hum_bin = np.digitize(hum, [77.5, 90.5])           # 3 bins: &lt;=77.5, 77.5-90.5, &gt;90.5
temp_bin = np.digitize(temp, [20.5, 24.5])         # 3 bins: 18-20, 21-24, 27-29
def hist(rows, b):                                 # sum g and h of the given rows per bin
    return np.bincount(b[rows], g[rows], 3), np.bincount(b[rows], h[rows], 3)
everyone = np.arange(14)
G, H = hist(everyone, hum_bin)
print("HumPct histogram: G per bin", G, " H per bin", H)
for k in [1, 2]:                                   # only 2 candidate cuts, not 9 (lambda = 0)
    GL, HL = G[:k].sum(), H[:k].sum()
    gain = GL**2 / HL + (G.sum() - GL)**2 / (H.sum() - HL) - G.sum()**2 / H.sum()
    print(f"cut after bin {k - 1}: G_L={GL:+.1f} H_L={HL:.2f}  gain={gain:.4f}")
left, right = everyone[hum &lt; 90.5], everyone[hum &gt;= 90.5]
Gp, Hp = hist(everyone, temp_bin)
Gr, Hr = hist(right, temp_bin)                     # build the SMALL child (3 days) directly
print("TempC: parent G", Gp, "- right child G", Gr, "= left child G", Gp - Gr)
print("left child built directly:     G", hist(left, temp_bin)[0])</div>
  <div class="fx" data-lang="text">HumPct histogram: G per bin [-1.5 -1.   0.5]  H per bin [1.25 1.5  0.75]
cut after bin 0: G_L=-1.5 H_L=1.25  gain=0.7683
cut after bin 1: G_L=-2.5 H_L=2.75  gain=1.4632
TempC: parent G [-0.5 -1.5  0. ] - right child G [0.  0.5 0. ] = left child G [-0.5 -2.   0. ]
left child built directly:     G [-0.5 -2.   0. ]</div>
  <p>The histogram and both gains match the hand numbers. On temperature, the parent's G per bucket (−0.5, −1.5, 0) minus the small child's (0, 0.5, 0) gives (−0.5, −2.0, 0), exactly what building the left child directly gives. Now the library itself, once with 4 bins and once with 6, with the learning rate and λ switched off so the leaves are the raw −G/H values:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from play import df
hum = df.HumPct.values.astype(float).reshape(-1, 1)
play = (df.Play == "Yes").astype(int).values
for max_bin in [4, 6]:
    params = {"objective": "binary", "max_bin": max_bin, "min_data_in_bin": 1, "min_data_in_leaf": 1,
              "min_sum_hessian_in_leaf": 0, "num_leaves": 2, "learning_rate": 1.0, "lambda_l2": 0,
              "boost_from_average": False, "verbose": -1}          # start at p = 0.5 like the table
    bst = lgb.train(params, lgb.Dataset(hum, label=play, params=params), num_boost_round=1)
    t = bst.trees_to_dataframe()
    print(f"max_bin={max_bin}: split at {t.threshold[0]:.1f}, gain {t.split_gain[0]:.4f}, "
          f"leaves {t.value[1]:.3f} ({t['count'][1]} days) and {t.value[2]:.3f} ({t['count'][2]} days)")</div>
  <div class="fx" data-lang="text">max_bin=4: split at 90.5, gain 1.4632, leaves 0.909 (11 days) and -0.667 (3 days)
max_bin=6: split at 82.5, gain 2.5714, leaves 1.429 (7 days) and -0.286 (7 days)</div>
  <p>With <code>max_bin=4</code> LightGBM splits at 90.5 with gain 1.4632, and its leaves are 2.5/2.75 = 0.909 and −0.5/0.75 = −0.667, the hand table exactly. But look at what three buckets cost here: the best cut on this column, 82.5 (the diary's line between normal and high humidity, gain 2.571), is not a bucket edge, so it cannot be found. With 6 bins it is an edge, and LightGBM finds it. On 14 rows, 3 bins are far too coarse; on millions of rows, 255 bins almost never miss a cut that matters, and coarser bins can even help by averaging out noise. If an exact threshold matters, such as an age limit of 18, check that the bins resolve it or raise <code>max_bin</code> for that column. Because binning happens once, when the <code>Dataset</code> is built, validation data must be binned with the same edges, which is what <code>reference=train_set</code> does in the native API.</p>

  <h2 id="lgb-leaf"><span class="num">03</span>Leaf-wise Growth</h2>
  <p>Histograms make every split cheap. The next question is which leaves to split at all. XGBoost by default grows <strong>level-wise</strong> (depth-wise): it splits every leaf at the current depth, then goes one level deeper, until <code>max_depth</code>. That spends splits evenly, including on leaves that barely need them. LightGBM grows <strong>leaf-wise</strong> (best-first): it keeps a list of all current leaves with the gain of each one's best possible split, always splits the single leaf with the largest gain wherever it is in the tree, and stops when the tree has <code>num_leaves</code> leaves. Think of a manager with a fixed budget for three new hires: level-wise gives one to every department in turn, leaf-wise gives each hire to whichever department will gain most from it.</p>
  <figure class="viz"><svg viewBox="0 0 640 220" width="640"><g stroke="currentColor"><line x1="150" y1="34" x2="90" y2="84"/><line x1="150" y1="34" x2="210" y2="84"/><line x1="90" y1="84" x2="60" y2="140"/><line x1="90" y1="84" x2="120" y2="140"/><line x1="210" y1="84" x2="180" y2="140"/><line x1="210" y1="84" x2="240" y2="140"/><line x1="460" y1="34" x2="410" y2="84"/><line x1="460" y1="34" x2="520" y2="84"/><line x1="410" y1="84" x2="380" y2="140"/><line x1="410" y1="84" x2="440" y2="140"/><line x1="380" y1="140" x2="355" y2="190"/><line x1="380" y1="140" x2="405" y2="190"/></g><g class="fb sb"><circle cx="150" cy="34" r="13"/><circle cx="90" cy="84" r="13"/><circle cx="210" cy="84" r="13"/></g><g class="fs" stroke="currentColor"><circle cx="60" cy="140" r="10"/><circle cx="120" cy="140" r="10"/><circle cx="180" cy="140" r="10"/><circle cx="240" cy="140" r="10"/></g><text x="150" y="38" text-anchor="middle" font-size="11">1</text><text x="90" y="88" text-anchor="middle" font-size="11">2</text><text x="210" y="88" text-anchor="middle" font-size="11">3</text><text x="232" y="74" class="tr" font-size="11">gain 1.5</text><text x="60" y="74" class="tm" font-size="11">gain 12</text><g class="ft st"><circle cx="460" cy="34" r="13"/><circle cx="410" cy="84" r="13"/><circle cx="380" cy="140" r="13"/></g><g class="fs" stroke="currentColor"><circle cx="520" cy="84" r="10"/><circle cx="440" cy="140" r="10"/><circle cx="355" cy="190" r="10"/><circle cx="405" cy="190" r="10"/></g><text x="460" y="38" text-anchor="middle" font-size="11">1</text><text x="410" y="88" text-anchor="middle" font-size="11">2</text><text x="380" y="144" text-anchor="middle" font-size="11">3</text><text x="534" y="80" class="tm" font-size="10">gain 1.5 (waits)</text><text x="350" y="80" class="tm" font-size="11">gain 12</text><text x="318" y="136" class="tm" font-size="11">gain 6</text><text x="150" y="182" text-anchor="middle" font-size="12">level-wise: splits 1, 2, 3</text><text x="150" y="198" text-anchor="middle" class="tm" font-size="11">total gain 40 + 12 + 1.5 = 53.5</text><text x="480" y="182" text-anchor="start" font-size="12">leaf-wise: 1, 2, then 3</text><text x="480" y="198" text-anchor="start" class="tm" font-size="11">total gain 40 + 12 + 6 = 58</text></svg><figcaption>Both trees use three splits and have four leaves. Level-wise must split node 3 (gain only 1.5) to finish the level. Leaf-wise spends that split on the more useful leaf below node 2 (gain 6).</figcaption></figure>
  <p>Walk through the figure. Both trees start with the same root split, worth a gain of 40, and both then split node 2 for a gain of 12. Now each tree has one split left in its budget. The level-wise tree on the left must finish level 1, so it splits node 3 even though that is worth only 1.5. The leaf-wise tree on the right compares all current leaves, sees that a leaf below node 2 can gain 6, and splits that instead, leaving node 3 waiting. Same number of leaves, but 58 total gain instead of 53.5. For a fixed number of leaves, leaf-wise growth always reaches a training loss at least as low, because every split it makes is the best one available.</p>
  <p>Now on the diary, with six columns (humidity, temperature, three one-hot outlook columns and a strong-wind flag), log loss at p = 0.5, λ = 0 and any leaf size allowed. The best root split is "Overcast?" (gain 2.857): all four overcast days were played. On the 10 non-overcast days the best split is humidity below 82.5 (gain 3.6). The 4 overcast days are all played, so nothing can be gained there. At this point XGBoost with <code>max_depth=2</code> must stop: both depth-2 positions are used or pointless. LightGBM with <code>num_leaves=4</code> still has a leaf to spend, so it looks at every current leaf and splits the one with the largest gain, three levels down:</p>
  <div class="fx" data-lang="py">import pandas as pd, xgboost as xgb, lightgbm as lgb
from play import df
X = pd.concat([df[["HumPct", "TempC"]], pd.get_dummies(df[["Outlook"]]).astype(int),
               (df.Wind == "Strong").astype(int).rename("Wind_Strong")], axis=1)
y = (df.Play == "Yes").astype(int)
level = xgb.XGBClassifier(max_depth=2, base_score=0.5, learning_rate=1.0, reg_lambda=0, min_child_weight=0,
                          n_estimators=1, tree_method="exact").fit(X, y)
p = dict(objective="binary", num_leaves=4, learning_rate=1.0, lambda_l2=0, min_data_in_leaf=1,
         min_data_in_bin=1, min_sum_hessian_in_leaf=0, boost_from_average=False, verbose=-1)
leaf = lgb.train(p, lgb.Dataset(X, label=y, params=p), num_boost_round=1)
t = level.get_booster().trees_to_dataframe()
print("level-wise (XGBoost, max_depth=2):")
for _, r in t[t.Feature != "Leaf"].iterrows():
    print(f"  {r.ID}: {r.Feature} &lt; {r.Split}  gain {r.Gain:.3f}")
print("  leaves:", (t.Feature == "Leaf").sum())
t = leaf.trees_to_dataframe()
print("leaf-wise (LightGBM, num_leaves=4):")
for _, r in t[t.split_feature.notna()].iterrows():
    print(f"  depth {r.node_depth}: {r.split_feature} &lt;= {r.threshold:.4g}  gain {r.split_gain:.3f}  ({r['count']} days)")
print("  leaves:", t.split_feature.isna().sum())</div>
  <div class="fx" data-lang="text">level-wise (XGBoost, max_depth=2):
  0-0: Outlook_Overcast &lt; 1.0  gain 2.857
  0-1: HumPct &lt; 83.0  gain 3.600
  leaves: 3
leaf-wise (LightGBM, num_leaves=4):
  depth 1: Outlook_Overcast &lt;= 1e-35  gain 2.857  (14 days)
  depth 2: HumPct &lt;= 82.5  gain 3.600  (10 days)
  depth 3: HumPct &lt;= 95.5  gain 3.200  (5 days)
  leaves: 4</div>
  <p>Both libraries agree on the first two splits. XGBoost's level-wise tree ends with only 3 leaves, because the overcast branch is pure and depth 2 forbids going further on the other side. LightGBM spends its fourth leaf at depth 3, splitting the humid non-overcast days at 95.5 to separate D4 (96%, played) from the rest (gain 3.2). The thresholds look different only in style: LightGBM splits a 0/1 column at a tiny number (1e-35), meaning 0 left and 1 right, and XGBoost prints 83.0 for a cut between 80 and 85. The deep split also shows the price of leaf-wise growth: it was made to isolate a single day, and a deep branch on very few rows is often fitting noise.</p>
  <p>To measure the growth order alone at scale, use one library, XGBoost, with both growth policies at the same budget of leaves, then LightGBM, on the churn table (300 trees, learning rate 0.1, no early stopping):</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb, lightgbm as lgb
from sklearn.metrics import log_loss
from churn import Xtr, ytr, Xva, yva
def depth_of(dump):                                  # deepest leaf in an XGBoost text dump
    return max(line.count("\t") for line in dump.split("\n") if "leaf" in line)
runs = {"XGBoost depth-wise, max_depth=5": dict(grow_policy="depthwise", max_depth=5),
        "XGBoost leaf-wise, max_leaves=32": dict(grow_policy="lossguide", max_leaves=32, max_depth=0)}
for name, kw in runs.items():                         # same library, only the growth order differs
    m = xgb.XGBClassifier(n_estimators=300, learning_rate=0.1, random_state=0, **kw).fit(Xtr, ytr)
    dumps = m.get_booster().get_dump()
    print(f"{name:33s} leaves/tree {np.mean([d.count('leaf') for d in dumps]):4.1f}  "
          f"max depth {max(map(depth_of, dumps)):2d}  "
          f"train {log_loss(ytr, m.predict_proba(Xtr)[:, 1]):.3f}  val {log_loss(yva, m.predict_proba(Xva)[:, 1]):.3f}")
m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.1, num_leaves=32, verbose=-1).fit(Xtr, ytr)
t = m.booster_.trees_to_dataframe()
print(f"{'LightGBM, num_leaves=32':33s} leaves/tree {t[t.left_child.isna()].groupby('tree_index').size().mean():4.1f}  "
      f"max depth {t.node_depth.max() - 1:2d}  "
      f"train {log_loss(ytr, m.predict_proba(Xtr)[:, 1]):.3f}  val {log_loss(yva, m.predict_proba(Xva)[:, 1]):.3f}")</div>
  <div class="fx" data-lang="text">XGBoost depth-wise, max_depth=5   leaves/tree 26.0  max depth  5  train 0.195  val 0.337
XGBoost leaf-wise, max_leaves=32  leaves/tree 32.0  max depth 16  train 0.138  val 0.326
LightGBM, num_leaves=32           leaves/tree 32.0  max depth 18  train 0.124  val 0.323</div>
  <p>The depth-wise trees average 26 leaves (some branches stop when no split has positive gain) and never go deeper than 5. The leaf-wise trees use all 32 leaves and reach depth 16 to 18, going deep wherever the loss keeps dropping. For the same budget, leaf-wise growth reaches a clearly lower training log loss (0.124–0.138 against 0.195) and here also a lower validation loss (0.323–0.326 against 0.337). XGBoost's <code>lossguide</code> policy and LightGBM behave almost the same, which shows that the growth order, not the library, makes the difference. The flip side is the next section's topic: deep, lopsided trees can memorise.</p>

  <h2 id="lgb-size"><span class="num">04</span>Controlling Tree Size</h2>
  <p>With level-wise growth, <code>max_depth</code> fixes the shape: depth 6 means at most 64 leaves in a balanced tree. With leaf-wise growth, <code>num_leaves</code> is the main size knob, and a tree with 64 leaves can be a chain 30 levels deep. So the brakes work differently. The knobs, with their sklearn names in brackets, are these:</p>
  <table class="tbl">
    <tr><th>Knob (sklearn name)</th><th>Default</th><th>What it limits</th><th>Rule of thumb</th></tr>
    <tr><td><code>num_leaves</code></td><td>31</td><td>leaves per tree</td><td>15–255, and below 2<sup>max_depth</sup></td></tr>
    <tr><td><code>max_depth</code></td><td>−1 (none)</td><td>depth of any branch</td><td>6–12 as a safety cap</td></tr>
    <tr><td><code>min_data_in_leaf</code> (<code>min_child_samples</code>)</td><td>20</td><td>rows per leaf</td><td>raise to 50–500 on large or noisy data</td></tr>
    <tr><td><code>min_sum_hessian_in_leaf</code> (<code>min_child_weight</code>)</td><td>0.001</td><td>Σh per leaf, XGBoost's min_child_weight</td><td>usually left alone</td></tr>
    <tr><td><code>min_gain_to_split</code> (<code>min_split_gain</code>)</td><td>0</td><td>minimum gain, like XGBoost's γ</td><td>depends on data size</td></tr>
    <tr><td><code>lambda_l2</code>, <code>lambda_l1</code></td><td>0, 0</td><td>leaf values</td><td>0–10</td></tr>
    <tr><td><code>path_smooth</code></td><td>0</td><td>pulls a leaf towards its parent's value, small leaves most</td><td>helps deep trees on small data</td></tr>
  </table>
  <p>Notice two defaults that differ from XGBoost: no L2 penalty on leaves (λ = 0 instead of 1), and no depth limit. That leaves <code>min_data_in_leaf</code>, a minimum number of rows in every leaf, as LightGBM's main brake, and the diary shows it at its most extreme:</p>
  <div class="fx" data-lang="py">import pandas as pd, lightgbm as lgb
from play import df
X = pd.concat([df[["HumPct", "TempC"]], pd.get_dummies(df[["Outlook", "Wind"]]).astype(int)], axis=1)
y = (df.Play == "Yes").astype(int)
for kw in [{}, {"min_child_samples": 2}]:
    m = lgb.LGBMClassifier(n_estimators=50, verbose=-1, **kw).fit(X, y)
    leaves = [t["num_leaves"] for t in m.booster_.dump_model()["tree_info"]]
    print(f"{str(kw) or 'defaults':25s} leaves in the first trees {leaves[:5]}   days right {int((m.predict(X) == y).sum())}/14")</div>
  <div class="fx" data-lang="text">{}                        leaves in the first trees [1]   days right 9/14
{'min_child_samples': 2}  leaves in the first trees [5, 5, 5, 5, 5]   days right 14/14</div>
  <p>With the defaults every leaf needs 20 rows, and the diary has only 14, so no split is ever allowed. LightGBM builds a single one-leaf tree, stops, and predicts "played" for every day, which is right 9 times out of 14 (it would print "No further splits with positive gain" if not silenced). Allow leaves of 2 days and every tree has 5 leaves, and the model memorises all 14 days. On tiny data this one brake decides everything.</p>
  <p>The same effect on more realistic small data: train on only 500 rows of the churn table, with early stopping on the validation set, and vary the size knobs:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.metrics import roc_auc_score
from churn import Xtr, ytr, Xva, yva, Xte, yte
Xs, ys = Xtr.iloc[:500], ytr[:500]                     # only 500 training rows
runs = {"num_leaves=255, min_child_samples=1": dict(num_leaves=255, min_child_samples=1),
        "num_leaves=255, min_child_samples=20": dict(num_leaves=255),
        "defaults (31 leaves, min 20 rows)": dict(),
        "num_leaves=7, min 20 rows": dict(num_leaves=7)}
for name, kw in runs.items():
    m = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.05, verbose=-1, **kw)
    m.fit(Xs, ys, eval_X=Xva, eval_y=yva, callbacks=[lgb.early_stopping(100, verbose=False)])
    depth = m.booster_.trees_to_dataframe().node_depth.max() - 1
    print(f"{name:37s} trees {m.best_iteration_:4d}  max depth {depth:2d}  "
          f"train AUC {roc_auc_score(ys, m.predict_proba(Xs)[:, 1]):.3f}  "
          f"test AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.3f}")</div>
  <div class="fx" data-lang="text">num_leaves=255, min_child_samples=1   trees    9  max depth 16  train AUC 1.000  test AUC 0.727
num_leaves=255, min_child_samples=20  trees   83  max depth 14  train AUC 1.000  test AUC 0.819
defaults (31 leaves, min 20 rows)     trees   83  max depth 14  train AUC 1.000  test AUC 0.819
num_leaves=7, min 20 rows             trees  249  max depth  6  train AUC 0.999  test AUC 0.798</div>
  <p>With <code>min_child_samples=1</code>, leaves holding a single customer are allowed: the model memorises the training set after 9 trees and scores only 0.727 on test. With the default minimum of 20 rows, <code>num_leaves=255</code> and the default 31 give the <em>identical</em> model: 500 rows with at least 20 per leaf allow at most 25 leaves, so <code>num_leaves</code> never binds and <code>min_data_in_leaf</code> is the real brake. With only 7 leaves the model is slightly too simple (0.798). Note the depth as well: 14 levels grown from 500 rows, which a level-wise tree with the same number of leaves would never reach. When you move settings over from XGBoost, convert <code>max_depth=d</code> into <code>num_leaves</code> somewhat below 2<sup>d</sup> (for d = 7, about 70–100 rather than 128) and keep <code>max_depth</code> as a cap. On very small tables, also try a <a class="xref" data-note="ml_rf">Random Forest</a> or a regularised linear model.</p>

  <h2 id="lgb-goss"><span class="num">05</span>GOSS</h2>
  <p>Histograms and leaf-wise growth make each tree cheaper, but every tree still visits every row to build its histograms. Ordinary row subsampling (<code>subsample</code>) would visit fewer rows, but it treats all rows alike, and in boosting rows are not alike. A row with a small |g| is one the model already predicts well, and it contributes little to any split's gain; a row with a large |g| is where the model is still badly wrong. <strong>Gradient-based One-Side Sampling (GOSS)</strong> keeps all the informative rows and samples only among the easy ones. It is "one-sided" because only the small-gradient side is sampled.</p>
  <p>Picture a teacher checking 100 answer sheets. She re-reads every sheet with big mistakes, and only a random 10 of the 80 good sheets. When she estimates the class total, she counts each of those 10 good sheets 8 times, so that her estimate is not tilted towards the bad sheets. GOSS does exactly that. It sorts the rows by |g| and keeps the top a × 100% (set A, <code>top_rate</code>, default 0.2). From the remaining rows it samples b × 100% <em>of all rows</em> at random (set B, <code>other_rate</code>, default 0.1). It multiplies the g and h of every row in B by <strong>(1 − a)/b</strong> and builds the tree on A and B only, 30% of the rows with the defaults. Why that weight? The rest holds (1 − a)·n rows and we kept b·n of them, so each kept row stands in for (1 − a)/b rows. Then the expected sum over B equals the sum over the whole rest, so the estimated G<sub>L</sub> and G<sub>R</sub> are <strong>unbiased</strong>: right on average.</p>
  <p>Work it on the diary's turnout. After a first stump "Humidity high?" (predicting 28 for humid days and 40 for the others), squared error gives g = F − y and h = 1, and the gradients are very uneven: D6 is +18 (a dry day with only 22 players), D12 is −10, four days sit at ±8 and D9 is exactly right. A candidate split for round two sends the 6 windy days left, and its true G<sub>L</sub> is +24. Use GOSS with a = b = 3/14: keep the 3 days with the largest |g|, sample 3 of the other 11, and weight each sampled day by (1 − a)/b = 11/3 = 3.667. The code repeats this 50,000 times and compares it with forgetting the weight and with uniform sampling of the same 6 days:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
F1 = np.where(df.Humidity == "High", 28.0, 40.0)   # the model after round 1: stump "Humidity high?"
g = F1 - df.Turnout.values                         # squared error: g = F - y, h = 1
left = (df.Wind == "Strong").values                # a candidate split for round 2: windy days left
print("g:", " ".join(f"{d}:{v:+.0f}" for d, v in zip(df.index, g)))
print(f"true G_left = {g[left].sum():+.2f}")
n, a_n, b_n = 14, 3, 3                             # keep the top 3 |g|, sample 3 of the other 11
top = np.argsort(-np.abs(g), kind="stable")[:a_n]
rest = np.setdiff1d(np.arange(n), top)
w = (n - a_n) / b_n                                # (1 - a) / b = 11/3
print("kept for sure:", list(df.index[top]), f"  weight for sampled days: {w:.3f}")
rng = np.random.default_rng(0)
goss, noweight, uniform = [], [], []
for _ in range(50_000):
    s = rng.choice(rest, b_n, replace=False)
    goss.append(g[top][left[top]].sum() + w * g[s][left[s]].sum())
    noweight.append(g[top][left[top]].sum() + g[s][left[s]].sum())
    u = rng.choice(n, a_n + b_n, replace=False)    # uniform sampling of the same 6 days
    uniform.append(n / (a_n + b_n) * g[u][left[u]].sum())
for name, est in [("GOSS", goss), ("GOSS, no reweighting", noweight), ("uniform 6 of 14", uniform)]:
    print(f"{name:21s} mean {np.mean(est):+.2f}  spread (sd) {np.std(est):.2f}")</div>
  <div class="fx" data-lang="text">g: D1:+4 D2:+8 D3:-8 D4:-4 D5:-4 D6:+18 D7:-2 D8:+2 D9:+0 D10:-6 D11:+2 D12:-10 D13:-8 D14:+8
true G_left = +24.00
kept for sure: ['D6', 'D12', 'D2']   weight for sampled days: 3.667
GOSS                  mean +24.00  spread (sd) 13.94
GOSS, no reweighting  mean +18.18  spread (sd) 3.80
uniform 6 of 14       mean +23.87  spread (sd) 27.32</div>
  <p>The kept days are D6, D12 and D2 (D2 is one of four days tied at |g| = 8). GOSS's average estimate is +24.00, exactly the truth, with a spread (standard deviation) of 13.9. Without the reweighting the estimate is badly biased, +18.18 on average, because the 11 smaller-gradient days are under-counted 3.7 times; its small spread is no comfort when it is consistently wrong. Uniform sampling of 6 days is also unbiased (+23.87), but its spread is 27.3, about twice GOSS's, because it often drops D6, the single day that carries the most signal. That is the whole point of GOSS: the same budget of rows, more reliable gains, as long as the gradients are uneven. Early in training, when all residuals are similar in size, GOSS has little edge, so LightGBM only starts sampling after the first rounds (about 1/learning_rate of them).</p>
  <p>Row sampling only matters when there are many rows. Stacking five slightly jittered copies of the churn training set gives 60,000 rows:</p>
  <div class="fx" data-lang="py">import time, numpy as np, pandas as pd, lightgbm as lgb
from sklearn.metrics import roc_auc_score
from churn import Xtr, ytr, Xte, yte
rng = np.random.default_rng(0)
X2 = pd.concat([Xtr] * 5, ignore_index=True) + rng.normal(0, 0.05, (len(Xtr) * 5, Xtr.shape[1]))
y2 = np.tile(ytr, 5)                                   # 60,000 rows, so that row sampling matters
runs = {"all rows":                     {},
        "random 30% of rows per tree": {"subsample": 0.3, "subsample_freq": 1},
        "GOSS: top 20% + 10% sample":  {"data_sample_strategy": "goss", "top_rate": 0.2, "other_rate": 0.1}}
for name, kw in runs.items():
    t0 = time.time()
    m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, num_leaves=63, verbose=-1, **kw).fit(X2, y2)
    print(f"{name:28s} test AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.4f}   fit {time.time() - t0:.1f}s")</div>
  <div class="fx" data-lang="text">all rows                     test AUC 0.9385   fit 9.5s
random 30% of rows per tree  test AUC 0.9395   fit 12.4s
GOSS: top 20% + 10% sample   test AUC 0.9389   fit 12.8s</div>
  <p>Using only 30% of the rows per tree, GOSS matches the full-data model (AUC 0.9389 against 0.9385), and so does plain random 30% sampling (0.9395). There is no speed-up at this size: with 60,000 rows and 14 columns a histogram pass is already cheap, and the fixed costs of sorting gradients and sampling dominate (timings are approximate on a busy machine). GOSS was designed for millions of rows, where the pass over all rows is the bottleneck. So read it as a speed tool that keeps accuracy, not as an accuracy tool. In LightGBM 4 it is switched on with <code>data_sample_strategy="goss"</code> (older versions used <code>boosting="goss"</code>), and it replaces ordinary bagging rather than combining with it.</p>

  <h2 id="lgb-efb"><span class="num">06</span>EFB</h2>
  <p>GOSS cuts rows. On wide, sparse data, the other factor, columns, dominates. One-hot encoding a city column with 500 values creates 500 columns that are zero in almost every row, and each still needs its own histogram. But one-hot columns of the same category are never non-zero in the same row: a customer lives in only one city. Columns like that are called <strong>mutually exclusive</strong>, and they can be packed into a single column without losing any information, as long as each original column gets its own range of values inside the pack. That is <strong>Exclusive Feature Bundling (EFB)</strong>. Think of a hotel that gives every guest a room key: two guests who are never in the hotel on the same night can share one room in the booking system without ever clashing.</p>
  <p>EFB works in two steps. First it decides which columns can share a bundle. It counts <strong>conflicts</strong>, the rows where two columns are both non-zero, and builds a graph with a node per column and edges weighted by conflicts. Bundling with no conflicts is the graph-colouring problem (each bundle is one colour), which is too slow to solve exactly, so LightGBM uses a greedy rule: take columns in order of how many conflicts they have and put each into the first bundle where it adds no more than a small number of conflicts (<code>max_conflict_rate</code>, default 0), otherwise start a new bundle. Second, it merges each bundle into one column by <strong>offsetting</strong> the bins: the second column's bins are shifted past the first column's range, the third's past the second's, so the merged value still says which original column it came from.</p>
  <p>On the diary, one-hot encode Outlook into Overcast, Rain and Sunny and add the 0/1 column Wind_Strong. Count the conflicts and bundle greedily:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
X = pd.get_dummies(df[["Outlook"]]).astype(int)                 # three one-hot columns
X["Wind_Strong"] = (df.Wind == "Strong").astype(int)
X.columns = ["Overcast", "Rain", "Sunny", "Strong"]
nz = X.values != 0
conflicts = nz.T.astype(int) @ nz.astype(int)                    # days where two columns are both non-zero
np.fill_diagonal(conflicts, 0)
print(pd.DataFrame(conflicts, index=X.columns, columns=X.columns).to_string())
bundles = []                                                     # greedy: first bundle with no conflict
for c in X.columns[np.argsort(-conflicts.sum(1), kind="stable")]:
    for b in bundles:
        if all(conflicts[X.columns.get_loc(c), X.columns.get_loc(o)] == 0 for o in b):
            b.append(c); break
    else:
        bundles.append([c])
print("bundles:", bundles)
merged, offset = np.zeros(14, int), 0
for c in ["Overcast", "Rain", "Sunny"]:                          # each column gets its own bin range
    merged += np.where(X[c] &gt; 0, X[c] + offset, 0); offset += 1
print("bundle value per day:", " ".join(f"{d}:{v}" for d, v in zip(df.index, merged)))</div>
  <div class="fx" data-lang="text">          Overcast  Rain  Sunny  Strong
Overcast         0     0      0       2
Rain             0     0      0       2
Sunny            0     0      0       2
Strong           2     2      2       0
bundles: [['Strong'], ['Overcast', 'Rain', 'Sunny']]
bundle value per day: D1:3 D2:3 D3:1 D4:2 D5:2 D6:2 D7:1 D8:3 D9:3 D10:2 D11:3 D12:1 D13:1 D14:2</div>
  <p>Overcast, Rain and Sunny never clash, because a day has one outlook, but Wind_Strong clashes with each of them twice (there are windy overcast, windy rainy and windy sunny days). So Wind_Strong stays alone, and the three outlook columns form one bundle. Overcast's value 1 stays 1, Rain's 1 becomes 2 (offset 1) and Sunny's 1 becomes 3 (offset 2). The bundle is exactly the original Outlook column coded 1, 2, 3: EFB has undone the one-hot encoding. A split "bundle ≤ 1" is the same as "Overcast = 1", so nothing is lost, and four columns became two.</p>
  <p>At scale, 1,000 one-hot columns (20 categorical columns of 50 levels each, 2% non-zero) on 50,000 rows, with bundling on and off:</p>
  <div class="fx" data-lang="py">import time, numpy as np, lightgbm as lgb
from scipy import sparse
rng = np.random.default_rng(0)
n, n_cols, levels = 50000, 20, 50                    # 20 categorical columns x 50 levels, one-hot
codes = rng.integers(0, levels, (n, n_cols))
rows = np.repeat(np.arange(n), n_cols)
cols = (codes + np.arange(n_cols) * levels).ravel()
X = sparse.csr_matrix((np.ones(n * n_cols), (rows, cols)), shape=(n, n_cols * levels))
logit = (codes[:, 0] % 7 == 0) * 1.5 + (codes[:, 1] &lt; 10) * 1.0 - (codes[:, 2] % 3 == 0) * 1.0
y = (rng.random(n) &lt; 1 / (1 + np.exp(-(logit - 0.5)))).astype(int)
print("matrix:", X.shape, f"{X.nnz / (X.shape[0] * X.shape[1]):.1%} non-zero")
for bundle in [True, False]:
    t0 = time.time()
    p = {"objective": "binary", "num_leaves": 31, "learning_rate": 0.1, "enable_bundle": bundle, "verbose": -1}
    lgb.train(p, lgb.Dataset(X, label=y, params=p), num_boost_round=50)
    print(f"enable_bundle={bundle!s:5s}  train time {time.time() - t0:.1f}s")</div>
  <div class="fx" data-lang="text">matrix: (50000, 1000) 2.0% non-zero
enable_bundle=True   train time 1.0s
enable_bundle=False  train time 2.5s</div>
  <p>Each block of 50 columns is perfectly exclusive, so EFB packs the 1,000 columns into about 20 bundles, and training takes about 1.0 s instead of 2.5 s for exactly the same model (approximate, single-threaded timings). EFB is why "just one-hot everything" is cheaper in LightGBM than you might expect. It does not fix the <em>statistical</em> problem of one-hot with many levels, though: each level still only gets "this value versus the rest" splits on very few rows. That is what native categorical splits are for.</p>

  <h2 id="lgb-cat"><span class="num">07</span>Native Categorical Splits</h2>
  <p>A categorical column such as city or plan has no natural order. Integer codes (Delhi = 0, Goa = 1, Pune = 2) invent one, so a split "code &lt; 1.5" groups Delhi with Goa for no reason. One-hot encoding avoids the fake order but only allows splits of the form "one value versus all others", so grouping 30 high-churn cities together takes 30 splits. The best possible split would divide the categories into any two groups, but a column with k values can be divided in 2<sup>k−1</sup> − 1 ways: 15 for k = 5, astronomically many for k = 100.</p>
  <p>The way out is an old result by Fisher (1958): for squared error, and for binary classification, the best two-group division is always a cut in the list of categories <em>sorted by their mean target</em>. With gradients, "mean target" becomes "mean gradient". So LightGBM sorts a node's categories by G<sub>c</sub>/(H<sub>c</sub> + <code>cat_smooth</code>) and scans the k − 1 cuts of that sorted list with the usual gain. One sort and k − 1 evaluations replace an impossible search. It is like seating wedding guests at two tables: rather than trying every possible seating plan, you line the guests up by how much they enjoy dancing and pick the best place to draw the line.</p>
  <p>Work it on the diary. Combine Outlook and Wind into one category column with 6 values (Overcast-Strong, …, Sunny-Weak, coded 0 to 5 alphabetically) and predict Turnout. The first guess is the mean turnout, 34, so g = 34 − y and h = 1, and each category's G is (count × 34 − sum of its turnouts). Sort the categories by mean turnout and scan the 5 cuts:</p>
  <div class="fx" data-lang="py">import pandas as pd, lightgbm as lgb
from play import df
d = pd.DataFrame({"weather": (df.Outlook + "-" + df.Wind).values, "turnout": df.Turnout.values})
d["weather"] = d["weather"].astype("category")         # 6 categories, codes 0-5 alphabetically
s = d.groupby("weather", observed=True)["turnout"].agg(["sum", "count", "mean"])
s["G"] = s["count"] * d.turnout.mean() - s["sum"]      # g = 34 - y, h = 1
s = s.sort_values("mean"); print(s.round(2).to_string())
G, H = s["G"].values, s["count"].values.astype(float)
for k in range(1, 6):                                  # scan the 5 cuts of the sorted list
    gain = G[:k].sum()**2 / H[:k].sum() + G[k:].sum()**2 / H[k:].sum() - G.sum()**2 / H.sum()
    print(f"left = {', '.join(s.index[:k])}: gain {gain:.2f}")
params = {"objective": "regression", "num_leaves": 2, "learning_rate": 1.0, "lambda_l2": 0,
          "min_data_in_leaf": 1, "min_data_in_bin": 1, "min_data_per_group": 1,
          "cat_smooth": 0, "cat_l2": 0, "verbose": -1}
bst = lgb.train(params, lgb.Dataset(d[["weather"]], label=d["turnout"], params=params), num_boost_round=1)
t = bst.trees_to_dataframe()
print(f"LightGBM: codes {t.threshold[0]} go left, gain {t.split_gain[0]:.2f}, leaves {t.value[1]:.2f} / {t.value[2]:.2f}")
print("codes:", dict(enumerate(d["weather"].cat.categories)))</div>
  <div class="fx" data-lang="text">                 sum  count   mean     G
weather                                 
Rain-Strong       42      2  21.00  26.0
Sunny-Strong      58      2  29.00  10.0
Sunny-Weak        90      3  30.00  12.0
Overcast-Strong   80      2  40.00 -12.0
Rain-Weak        122      3  40.67 -20.0
Overcast-Weak     84      2  42.00 -16.0
left = Rain-Strong: gain 394.33
left = Rain-Strong, Sunny-Strong: gain 453.60
left = Rain-Strong, Sunny-Strong, Sunny-Weak: gain 658.29
left = Rain-Strong, Sunny-Strong, Sunny-Weak, Overcast-Strong: gain 403.20
left = Rain-Strong, Sunny-Strong, Sunny-Weak, Overcast-Strong, Rain-Weak: gain 149.33
LightGBM: codes 0||1||3 go left, gain 658.29, leaves 40.86 / 27.14
codes: {0: 'Overcast-Strong', 1: 'Overcast-Weak', 2: 'Rain-Strong', 3: 'Rain-Weak', 4: 'Sunny-Strong', 5: 'Sunny-Weak'}</div>
  <p>The best cut puts the three low-turnout groups, windy rain and all sunny days, on one side. By hand: those three have G = 26 + 10 + 12 = 48 over H = 7 days, the other three G = −48 over 7, so the gain is 48²/7 + 48²/7 − 0 = 658.3, and the leaves are 34 − 48/7 = 27.14 and 34 + 48/7 = 40.86. LightGBM finds exactly this split: "codes 0, 1 and 3 go left" (Overcast-Strong, Overcast-Weak, Rain-Weak), gain 658.29. Codes 0, 1, 3 skip code 2 (Rain-Strong), so no single cut on the integer codes could find this split: rainy days belong on both sides depending on the wind. (We switched off the smoothing settings so the numbers are exact. The defaults add <code>cat_smooth=10</code> and <code>cat_l2=10</code>, and <code>min_data_per_group=100</code> would forbid any categorical split on 14 rows. Columns with at most <code>max_cat_to_onehot</code> = 4 values use one-versus-rest splits instead.)</p>
  <p>At scale we need a table with real categories. The <strong>categorical churn table</strong>, shared with the <a class="xref" data-note="ml_catboost">CatBoost</a> note and built in <code>cchurn.py</code>, has 20,000 telecom customers with <code>city</code> (300 values: a few big cities and a long tail of small ones), <code>plan</code> (5 values), <code>payment</code> (4), <code>device</code> (40), tenure, support calls and monthly bill, with about 22% churn and the same 12,000 / 3,000 / 5,000 split. Churn depends on the city, on the device, and on an interaction: students paying cash churn far more. Three ways of feeding the categories to LightGBM, each with early stopping:</p>
  <div class="fx" data-lang="py">import time, pandas as pd, lightgbm as lgb
from sklearn.metrics import roc_auc_score
from cchurn import df, CAT, Ctr, Cva, Cte, cytr, cyva, cyte    # the categorical churn table
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
def fit_score(name, A, V, B, **kw):
    t0 = time.time()
    m = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.05, verbose=-1, **kw)
    m.fit(A, cytr, eval_X=V, eval_y=cyva, callbacks=[lgb.early_stopping(100, verbose=False)])
    print(f"{name:28s} columns {A.shape[1]:4d}  trees {m.best_iteration_:4d}  "
          f"test AUC {roc_auc_score(cyte, m.predict_proba(B)[:, 1]):.4f}  {time.time() - t0:.1f}s")
codes = {c: {v: i for i, v in enumerate(sorted(df[c].unique()))} for c in CAT}
lab = lambda D: D[feats].replace(codes).astype(float)                    # 1) integer codes
fit_score("label-encoded integers", lab(Ctr), lab(Cva), lab(Cte))
oh_cols = pd.get_dummies(Ctr[feats], columns=CAT).columns
oh = lambda D: pd.get_dummies(D[feats], columns=CAT, dtype=float).reindex(columns=oh_cols, fill_value=0)
fit_score("one-hot", oh(Ctr), oh(Cva), oh(Cte))                          # 2) one-hot
cats = {c: pd.CategoricalDtype(sorted(df[c].unique())) for c in CAT}
nat = lambda D: D[feats].astype(cats)                                    # 3) pandas category dtype
fit_score("native categorical", nat(Ctr), nat(Cva), nat(Cte))</div>
  <div class="fx" data-lang="text">label-encoded integers       columns    7  trees  126  test AUC 0.7136  0.8s
one-hot                      columns  352  trees  140  test AUC 0.7319  1.3s
native categorical           columns    7  trees   90  test AUC 0.7364  0.7s</div>
  <p>Integer codes are clearly worst (0.714): the fake order forces many splits to gather cities into groups. One-hot needs 352 columns and does better (0.732). Native categorical splits keep 7 columns, need fewer trees and score best (0.736). Keep one weakness in mind, though. The sort uses the gradients of the very rows being split, which is a form of target encoding inside the tree, so for a column with many rare values (IDs, pincodes) it can find "groups" that are pure noise. Raise <code>cat_smooth</code> and <code>min_data_per_group</code>, group rare values into "other", or use <a class="xref" data-note="ml_catboost">CatBoost</a>, whose ordered statistics were designed against exactly this leak.</p>

  <h2 id="lgb-params"><span class="num">08</span>Parameters and Aliases</h2>
  <p>LightGBM's parameters each have a native name (used in the <code>params</code> dict of <code>lgb.train</code>) and often several aliases, including the scikit-learn-style names used by <code>LGBMClassifier</code>. The ones you will actually touch:</p>
  <table class="tbl">
    <tr><th>Native name</th><th>sklearn name / alias</th><th>Default</th><th>Effect</th></tr>
    <tr><td><code>objective</code></td><td>—</td><td>regression</td><td>binary, multiclass, regression_l1, huber, quantile, poisson, lambdarank, …</td></tr>
    <tr><td><code>num_iterations</code></td><td><code>n_estimators</code></td><td>100</td><td>number of trees; set high with early stopping</td></tr>
    <tr><td><code>learning_rate</code></td><td><code>eta</code></td><td>0.1</td><td>shrinkage of each tree</td></tr>
    <tr><td><code>num_leaves</code></td><td><code>max_leaves</code></td><td>31</td><td>main complexity knob</td></tr>
    <tr><td><code>min_data_in_leaf</code></td><td><code>min_child_samples</code></td><td>20</td><td>rows per leaf; main brake</td></tr>
    <tr><td><code>feature_fraction</code></td><td><code>colsample_bytree</code></td><td>1.0</td><td>columns per tree</td></tr>
    <tr><td><code>bagging_fraction</code> + <code>bagging_freq</code></td><td><code>subsample</code> + <code>subsample_freq</code></td><td>1.0, 0</td><td>row sampling every k trees; freq 0 = off</td></tr>
    <tr><td><code>lambda_l1</code>, <code>lambda_l2</code></td><td><code>reg_alpha</code>, <code>reg_lambda</code></td><td>0, 0</td><td>L1 / L2 on leaf values</td></tr>
    <tr><td><code>max_bin</code></td><td>—</td><td>255</td><td>bins per column</td></tr>
    <tr><td><code>data_sample_strategy</code></td><td>—</td><td>bagging</td><td>"goss" for GOSS</td></tr>
    <tr><td><code>is_unbalance</code> / <code>scale_pos_weight</code></td><td><code>class_weight</code></td><td>off / 1</td><td>up-weight the rare class (probabilities no longer calibrated)</td></tr>
    <tr><td><code>boosting</code></td><td><code>boosting_type</code></td><td>gbdt</td><td>also dart (drops trees at random) and rf (random forest mode)</td></tr>
    <tr><td><code>linear_tree</code>, <code>extra_trees</code>, <code>monotone_constraints</code></td><td>—</td><td>off</td><td>linear models in leaves, random thresholds, forced monotone effects</td></tr>
  </table>
  <p>The table hides a trap worth seeing. The sklearn wrapper's <code>subsample</code> maps to <code>bagging_fraction</code>, but bagging only happens every <code>bagging_freq</code> trees, and that defaults to 0, meaning never:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from churn import Xtr, ytr, Xte
def probs(**kw):
    m = lgb.LGBMClassifier(n_estimators=100, random_state=0, verbose=-1, **kw).fit(Xtr, ytr)
    return m.predict_proba(Xte)[:, 1]
base = probs()
print("subsample=0.5 alone         same as no sampling?", np.allclose(probs(subsample=0.5), base))
print("subsample=0.5, freq=1       same as no sampling?", np.allclose(probs(subsample=0.5, subsample_freq=1), base))</div>
  <div class="fx" data-lang="text">subsample=0.5 alone         same as no sampling? True
subsample=0.5, freq=1       same as no sampling? False</div>
  <p><code>subsample=0.5</code> on its own produces exactly the same model as no sampling at all. Only with <code>subsample_freq=1</code> is half of the rows used for each tree. Many hyperparameter searches have tuned <code>subsample</code> without knowing it did nothing. A related nuisance: passing two aliases of the same parameter, say <code>min_child_samples</code> in the constructor and <code>min_data_in_leaf</code> in a params dict, makes LightGBM keep one and print a warning, so pick one naming style per project.</p>

  <h2 id="lgb-speed"><span class="num">09</span>How Fast Is It Really?</h2>
  <p>The 2017 paper reported LightGBM as many times faster than XGBoost. It is worth measuring that claim yourself, because the comparison has changed since. Here are 100,000 training rows with 30 numeric columns, 100 trees each, with similar tree sizes (63 leaves or depth 6), all single-threaded (timings are approximate and the machine was shared):</p>
  <div class="fx" data-lang="py">import time, xgboost as xgb, lightgbm as lgb
from sklearn.datasets import make_classification
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
X, y = make_classification(n_samples=120000, n_features=30, n_informative=12, random_state=1)
Xa, ya, Xb, yb = X[:100000], y[:100000], X[100000:], y[100000:]
models = {"LightGBM, 63 leaves": lgb.LGBMClassifier(n_estimators=100, num_leaves=63, verbose=-1),
          "XGBoost hist, depth 6": xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=6),
          "sklearn HistGradientBoosting": HistGradientBoostingClassifier(max_iter=100, max_leaf_nodes=63,
                                                                         early_stopping=False),
          "XGBoost exact, depth 6": xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=6,
                                                      tree_method="exact")}
for name, m in models.items():
    t0 = time.time(); m.fit(Xa, ya); fit = time.time() - t0
    print(f"{name:29s} fit {fit:5.1f}s   test AUC {roc_auc_score(yb, m.predict_proba(Xb)[:, 1]):.4f}")</div>
  <div class="fx" data-lang="text">LightGBM, 63 leaves           fit   7.4s   test AUC 0.9883
XGBoost hist, depth 6         fit   4.9s   test AUC 0.9833
sklearn HistGradientBoosting  fit   7.6s   test AUC 0.9883
XGBoost exact, depth 6        fit  91.5s   test AUC 0.9832</div>
  <p>All four reach essentially the same test AUC (0.983–0.988; the leaf-wise models are slightly ahead because 63-leaf trees are more flexible than depth-6 ones). The time is what differs. LightGBM, XGBoost's histogram method and scikit-learn's <code>HistGradientBoosting</code> all take a few seconds; XGBoost's <code>exact</code> method takes about 90 seconds, more than ten times longer. Exact split search is what LightGBM was compared against in 2017, and that is where the famous speed-ups come from. Since then XGBoost adopted histograms (the default since version 2.0) and leaf-wise growth (<code>grow_policy="lossguide"</code>), and scikit-learn's <code>HistGradientBoosting</code> is a LightGBM-style implementation, so on dense numeric data the three are now close. LightGBM's lead is largest on very large, wide or sparse data and with categorical columns, where GOSS, EFB and native categorical splits do work the others cannot. Always time on your own data and hardware.</p>

  <h2 id="lgb-api"><span class="num">10</span>Training Code</h2>
  <p>LightGBM has two interfaces to the same engine. The native API builds a <code>Dataset</code>, which bins the data once and is reused by every tree, and calls <code>lgb.train</code> with a dict of parameters. The validation set is binned with the training edges through <code>reference=</code>, and early stopping and logging are <strong>callbacks</strong>, small objects that run after every round. A complete run on the churn table, with feature importance and saving:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
from churn import Xtr, ytr, Xva, yva, Xte, yte
dtr = lgb.Dataset(Xtr, label=ytr)                        # binned once, reused by every tree
dva = lgb.Dataset(Xva, label=yva, reference=dtr)         # reference = use the SAME bin edges
params = {"objective": "binary", "metric": "binary_logloss", "learning_rate": 0.05, "num_leaves": 31,
          "min_data_in_leaf": 20, "feature_fraction": 0.8, "bagging_fraction": 0.8, "bagging_freq": 1,
          "lambda_l2": 1.0, "seed": 0, "verbose": -1}
bst = lgb.train(params, dtr, num_boost_round=5000, valid_sets=[dtr, dva], valid_names=["train", "val"],
                callbacks=[lgb.early_stopping(100), lgb.log_evaluation(200)])
p = bst.predict(Xte, num_iteration=bst.best_iteration)
print(f"best_iteration {bst.best_iteration}, test accuracy {np.mean((p &gt; 0.5) == yte):.4f}")
imp = pd.DataFrame({"split": bst.feature_importance("split"), "gain": bst.feature_importance("gain").round(0)},
                   index=bst.feature_name()).sort_values("gain", ascending=False)
print(imp.head(3).to_string()); print(imp.loc[["row_noise", "coin_noise"]].to_string(header=False))
bst.save_model("churn_lgb.txt", num_iteration=bst.best_iteration)
again = lgb.Booster(model_file="churn_lgb.txt")
print("reloaded model, same predictions:", np.allclose(again.predict(Xte), p))</div>
  <div class="fx" data-lang="text">Training until validation scores don't improve for 100 rounds
[200]	train's binary_logloss: 0.267081	val's binary_logloss: 0.342559
[400]	train's binary_logloss: 0.189389	val's binary_logloss: 0.325983
[600]	train's binary_logloss: 0.137932	val's binary_logloss: 0.322328
Early stopping, best iteration is:
[539]	train's binary_logloss: 0.151899	val's binary_logloss: 0.321633
best_iteration 539, test accuracy 0.8730
    split     gain
f8   1793  16932.0
f5   1753  15855.0
f4   1556  14583.0
row_noise   801  2393.0
coin_noise   55   149.0
reloaded model, same predictions: True</div>
  <p>Validation log loss stops improving at round 539 (0.3216), and early stopping halts 100 rounds later; test accuracy is 0.873, in line with XGBoost on the same data. Now look at the two kinds of importance. By <code>split</code> count, the pure-noise column <code>row_noise</code> was used 801 times, nearly half as often as the best real feature, because a column with 12,000 distinct values offers endless cut-offs to chase noise with. By <code>gain</code> it is far behind (2,393 against 16,932). The 0/1 noise column <code>coin_noise</code> is barely used at all. Split counts reward having many possible thresholds, which is why they mislead; for explanations prefer SHAP values (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>). The model saved as text reloads to identical predictions. The native API also has <code>lgb.cv</code> for k-fold cross-validation with early stopping.</p>
  <p>The same model through the scikit-learn API, which fits into pipelines and grid searches. Note that early stopping is still a callback here, not a constructor argument as in XGBoost, and that since LightGBM 4.7 the validation data is passed as <code>eval_X</code> and <code>eval_y</code> (the older <code>eval_set=[(X, y)]</code> still works with a warning):</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.metrics import roc_auc_score
from churn import Xtr, ytr, Xva, yva, Xte, yte
m = lgb.LGBMClassifier(n_estimators=5000, learning_rate=0.05, num_leaves=31, min_child_samples=20,
                       colsample_bytree=0.8, subsample=0.8, subsample_freq=1, reg_lambda=1.0,
                       random_state=0, verbose=-1)
m.fit(Xtr, ytr, eval_X=Xva, eval_y=yva, callbacks=[lgb.early_stopping(100, verbose=False)])
print("best_iteration_:", m.best_iteration_)
print(f"test AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.4f}")   # predict uses the best iteration</div>
  <div class="fx" data-lang="text">best_iteration_: 539
test AUC 0.9363</div>
  <p>It stops at the same round, 539, and <code>predict_proba</code> automatically uses the best iteration.</p>

  <h2 id="lgb-cmp"><span class="num">11</span>LightGBM and Its Family</h2>
  <p>LightGBM changed <em>how fast</em> boosting runs, not <em>what</em> it computes. The four common gradient-boosting libraries share the same maths and differ in the engine:</p>
  <table class="tbl">
    <tr><th></th><th>XGBoost</th><th>LightGBM</th><th>CatBoost</th><th>sklearn HistGradientBoosting</th></tr>
    <tr><td>Split search</td><td>exact / approx / hist</td><td>hist, plus GOSS and EFB</td><td>hist (borders)</td><td>hist</td></tr>
    <tr><td>Tree growth</td><td>depth-wise (leaf-wise optional)</td><td>leaf-wise</td><td>symmetric</td><td>leaf-wise</td></tr>
    <tr><td>Size knob</td><td>max_depth</td><td>num_leaves</td><td>depth</td><td>max_leaf_nodes</td></tr>
    <tr><td>Default L2 on leaves</td><td>1</td><td>0</td><td>3</td><td>0</td></tr>
    <tr><td>Categories</td><td>enable_categorical</td><td>sorted by gradient</td><td>ordered target statistics</td><td>native, up to 255 values</td></tr>
    <tr><td>Training speed</td><td>fast</td><td>fastest on large, wide data</td><td>slowest per tree</td><td>fast</td></tr>
    <tr><td>Risk on small data</td><td>medium</td><td>highest (deep trees)</td><td>lowest</td><td>medium</td></tr>
  </table>
  <p>When people say "LightGBM is more accurate", it is usually because 31-leaf leaf-wise trees are a bit more flexible than XGBoost's default depth-6 level-wise trees at otherwise default settings; tuned properly, the libraries land within a few thousandths of AUC of each other. Choose LightGBM when training time on large or wide data matters most, or for many one-hot or sparse columns. Choose <a class="xref" data-note="ml_catboost">CatBoost</a> when there are many high-cardinality categorical columns or little time to tune, and remember that GOSS samples rows for speed, unlike a <a class="xref" data-note="ml_rf">Random Forest</a>, which samples rows to make independent trees diverse.</p>

  <h2 id="lgb-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common LightGBM mistake is a large <code>num_leaves</code> on a small dataset. Section 04 showed it: on 500 rows with leaves of one customer allowed, the model memorised the training set and lost almost 0.1 AUC on test. On small data start with 15–31 leaves, raise <code>min_data_in_leaf</code>, set <code>max_depth</code> as a cap and use early stopping; for a few thousand rows also try CatBoost or a random forest.</p>
  <p>The second is the silent <code>subsample</code> alias from section 08: without <code>subsample_freq=1</code> (or <code>bagging_freq</code> in native parameters) no row sampling happens at all. The third is porting XGBoost settings name by name. XGBoost's <code>min_child_weight</code> is a Hessian sum while LightGBM's <code>min_child_samples</code> counts rows, λ defaults to 1 in one and 0 in the other, the learning rate defaults to 0.3 against 0.1, and <code>max_depth=6</code> means something different from <code>num_leaves=64</code>. Translate the meaning, not the name.</p>
  <p>Categorical columns need care at prediction time. LightGBM accepts pandas <code>category</code> columns and remembers the list of categories it saw in training, so it can map new data correctly; plain strings are refused:</p>
  <div class="fx" data-lang="py">import pandas as pd, lightgbm as lgb
from play import df
X = df[["Outlook"]].astype("category")                      # categories: Overcast, Rain, Sunny
y = (df.Play == "Yes").astype(int)
p = dict(n_estimators=20, min_child_samples=1, min_data_per_group=1, cat_smooth=0, verbose=-1)
m = lgb.LGBMClassifier(**p).fit(X, y)
new = pd.DataFrame({"Outlook": ["Sunny", "Overcast"]})
print("new days as plain strings -&gt; ", end="")
try:
    print(m.predict_proba(new)[:, 1].round(3))
except Exception as e:
    print(type(e).__name__)
new_cat = new.astype("category")                             # categories here: Overcast, Sunny (codes 0, 1)
print("own category dtype          -&gt;", m.predict_proba(new_cat)[:, 1].round(3))
print("training category dtype     -&gt;", m.predict_proba(new.astype(X.Outlook.dtype))[:, 1].round(3))</div>
  <div class="fx" data-lang="text">new days as plain strings -&gt; ValueError
own category dtype          -&gt; [0.429 0.953]
training category dtype     -&gt; [0.429 0.953]</div>
  <p>Passing the new days as plain strings raises an error. Converting them to a category column, even one whose own codes differ from training (here only two categories, so Sunny would be code 1 instead of 2), gives the right answer, because LightGBM re-maps them using the stored list; the explicit training dtype gives the same result. The safest habit is still to build one <code>CategoricalDtype</code> with the full list of categories and apply it everywhere, which also makes unseen values explicit (they become missing). High-cardinality columns with many rare values remain risky with gradient-sorted splits, as section 07 explained.</p>
  <p>Two smaller ones. Multi-threaded histogram sums can differ in the last digits between runs; for exact reproducibility set <code>deterministic=True</code>, <code>force_row_wise=True</code> and a fixed <code>seed</code>. And as with every booster, early-stop on a validation set and report the score on a separate test set.</p>

  <h2 id="lgb-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>LightGBM</b>: a GBDT framework with histogram split finding, leaf-wise growth, GOSS, EFB and native categorical splits; same g/h maths as XGBoost.</li>
    <li><b>Histogram</b>: per-bin sums G<sub>b</sub>, H<sub>b</sub> of a column's binned values; only bin edges are candidate cuts.</li>
    <li><b>Subtraction trick</b>: histogram(bigger child) = histogram(parent) − histogram(smaller child).</li>
    <li><b>Leaf-wise growth</b>: always split the leaf with the largest gain, until num_leaves.</li>
    <li><b>GOSS</b>: keep top a by |g|, sample b of all rows from the rest, weight sampled rows (1 − a)/b.</li>
    <li><b>EFB</b>: bundle mutually exclusive columns into one, offsetting their bins.</li>
    <li><b>Categorical split</b>: sort categories by G/(H + cat_smooth), scan k − 1 cuts (Fisher 1958).</li>
  </ul>
  <h3>Numbers from the diary</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Result</th></tr>
    <tr><td>3 humidity bins</td><td>2 candidate cuts; best 90.5 (gain 1.463); misses 82.5, which 6 bins find (2.571)</td></tr>
    <tr><td>Subtraction</td><td>(−0.5, −1.5, 0) − (0, 0.5, 0) = (−0.5, −2.0, 0)</td></tr>
    <tr><td>Leaf-wise, 4 leaves</td><td>third split at depth 3 (gain 3.2); level-wise depth 2 stops at 3 leaves</td></tr>
    <tr><td>min_data_in_leaf 20</td><td>no split at all on 14 days</td></tr>
    <tr><td>GOSS</td><td>unbiased +24.0, spread 13.9 vs 27.3 for uniform; no reweighting: +18.2</td></tr>
    <tr><td>EFB</td><td>three outlook one-hots → one column coded 1, 2, 3</td></tr>
    <tr><td>Categorical</td><td>{Overcast ×2, Rain-Weak} vs rest, gain 658.29</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import lightgbm as lgb
dtr = lgb.Dataset(X_train, label=y_train)
dva = lgb.Dataset(X_val, label=y_val, reference=dtr)        # same bins
params = {"objective": "binary", "learning_rate": 0.05, "num_leaves": 31,
          "min_data_in_leaf": 20, "feature_fraction": 0.8,
          "bagging_fraction": 0.8, "bagging_freq": 1, "lambda_l2": 1.0}
bst = lgb.train(params, dtr, num_boost_round=5000, valid_sets=[dva],
                callbacks=[lgb.early_stopping(100)])
bst.predict(X_test, num_iteration=bst.best_iteration)

m = lgb.LGBMClassifier(n_estimators=5000, learning_rate=0.05, subsample=0.8, subsample_freq=1)
m.fit(X_train, y_train, eval_X=X_val, eval_y=y_val, callbacks=[lgb.early_stopping(100)])</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>subsample</code> needs <code>subsample_freq</code> &gt; 0.</li>
    <li>num_leaves 2<sup>d</sup> leaf-wise is far more flexible than depth d level-wise.</li>
    <li>On small data min_data_in_leaf, not num_leaves, is the binding brake.</li>
    <li>Defaults: λ = 0, learning rate 0.1, no depth limit (XGBoost: 1, 0.3, 6).</li>
    <li>Split-count importance favours many-valued columns, even noise.</li>
    <li>Gradient-sorted categories overfit rare values; smooth them or use CatBoost.</li>
  </ul>

  <h2 id="lgb-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is LightGBM, and what makes it fast?</summary><div class="qa-body">LightGBM is a gradient boosting decision tree library with the same maths as XGBoost. It is fast because it cuts every part of the split-search cost: histograms reduce the candidate cut-offs, leaf-wise growth makes each split count for more, GOSS reduces the rows per tree, EFB reduces the number of columns, and native categorical splits avoid one-hot explosions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does histogram-based split finding work?</summary><div class="qa-body">Each column is bucketed once into at most max_bin bins, and values are stored as bin numbers. At each node, every row's g and h are added into its bin, then the bin edges are scanned with running sums to compute the gain of each cut. There is no sorting during training, the scan costs at most max_bin steps, and memory drops because a bin number fits in one byte.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the histogram subtraction trick.</summary><div class="qa-body">Every parent row lands in exactly one child, so the parent's histogram equals the sum of the children's. LightGBM builds the smaller child's histogram directly and gets the larger one as parent minus smaller, so the two children together cost at most half the parent's rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Leaf-wise versus level-wise growth: what is the trade-off?</summary><div class="qa-body">Leaf-wise growth always splits the leaf with the largest gain, so for a fixed number of leaves it reaches a lower training loss. The price is deep, lopsided trees that can memorise small data. Level-wise growth is more balanced and safer but wastes splits on leaves that barely need them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should num_leaves relate to max_depth?</summary><div class="qa-body">A depth-d tree has at most 2<sup>d</sup> leaves, so keep num_leaves below 2<sup>max_depth</sup>, for example 70–100 leaves with depth 7. With leaf-wise growth, num_leaves = 2<sup>d</sup> without a depth cap allows much deeper and more flexible trees than a depth-d level-wise tree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your LightGBM model overfits a 3,000-row dataset. What do you change?</summary><div class="qa-body">Lower num_leaves to about 7–31, raise min_data_in_leaf to 30–100, set max_depth to 4–6, add feature_fraction and bagging (with bagging_freq=1), add lambda_l2 and path_smooth, and use a lower learning rate with early stopping. Also compare against CatBoost or a random forest, which are safer on small data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe GOSS and why it reweights the sampled rows.</summary><div class="qa-body">GOSS keeps the top a fraction of rows by |g|, randomly samples b × n rows from the rest, and multiplies the sampled rows' g and h by (1 − a)/b. The rest holds (1 − a)n rows and only bn are kept, so the weight makes the gradient sums unbiased. Without it, well-fitted rows are under-counted and the split gains are systematically wrong.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is GOSS better than uniform subsampling at the same budget?</summary><div class="qa-body">Rows with large gradients dominate the gain. Uniform sampling often drops them, so the estimated gain varies a lot; GOSS always keeps them and only samples the low-information rows. Both are unbiased, but GOSS has much lower variance when gradients are uneven, which on the diary halved the spread.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is EFB, and why does it lose no information?</summary><div class="qa-body">Exclusive Feature Bundling merges columns that are (almost) never non-zero in the same row, such as one-hot columns of one category, into a single column. Each original column's bins are offset into their own range, so the merged value identifies the original column and value, and splits on the bundle are equivalent to splits on the originals. Finding the best bundles is graph colouring, so a greedy method is used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does LightGBM split a categorical feature with k values?</summary><div class="qa-body">It sorts the categories by their mean gradient G/(H + cat_smooth) and evaluates only the k − 1 cuts of that sorted list. Fisher showed that for squared error and binary problems the best two-group split is one of these cuts, so k − 1 checks replace 2<sup>k−1</sup> − 1. Columns with at most max_cat_to_onehot (4) values use one-versus-rest splits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the risk of LightGBM's categorical handling on high-cardinality columns?</summary><div class="qa-body">The sort uses the gradients of the same training rows, so each category's position includes its own labels. For rare categories this is target leakage: the model finds groups that fit noise. Smoothing (cat_smooth, min_data_per_group), grouping rare values, or CatBoost's ordered target statistics reduce it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name default values that differ between XGBoost and LightGBM, and why it matters.</summary><div class="qa-body">L2 on leaves is 1 in XGBoost and 0 in LightGBM; tree size is max_depth 6 level-wise against num_leaves 31 leaf-wise with no depth limit; the learning rate is 0.3 against 0.1; and XGBoost's min_child_weight is a Hessian sum while LightGBM's min_child_samples counts rows. Copying settings by name gives a different model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might setting subsample=0.8 in LGBMClassifier have no effect?</summary><div class="qa-body">subsample maps to bagging_fraction, but bagging only runs every bagging_freq (subsample_freq) iterations, and that defaults to 0, meaning never. You must also set subsample_freq=1 (or another positive number).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Split importance versus gain importance: which do you trust?</summary><div class="qa-body">Split importance counts how often a feature is used, which favours columns with many distinct values, so a pure-noise continuous column can rank high. Gain importance sums the loss reduction and is more meaningful, but it is still computed on training data. For explanations, SHAP values or permutation importance on held-out data are more reliable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is LightGBM still much faster than XGBoost?</summary><div class="qa-body">Against XGBoost's old exact method, yes, often ten times or more. Since XGBoost made histograms the default and added leaf-wise growth, the two are close on dense numeric data. LightGBM's lead is largest on very large, wide, sparse or categorical data where GOSS, EFB and categorical splits help. Always time on your own data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GOSS samples rows and so does a random forest. How do the purposes differ?</summary><div class="qa-body">A random forest's bootstrap creates diversity among independent trees to reduce variance. GOSS is about speed: it keeps the rows that matter most for the current gradient step and reweights the others so the split gains stay unbiased; it is not meant to make trees different from each other.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does leaf-wise growth make min_data_in_leaf more important than max_depth?</summary><div class="qa-body">Leaf-wise growth follows the largest gain wherever it is, so a branch can keep splitting off smaller and smaller groups. A depth cap stops it only late, while a minimum leaf size stops every tiny leaf. On 500 churn rows, 31 and 255 leaves gave the identical model because min_data_in_leaf = 20 was the binding limit.</div></details>
</main>
`
});
