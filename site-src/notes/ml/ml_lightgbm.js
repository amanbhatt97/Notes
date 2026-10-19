// notes/ml/ml_lightgbm.js — LightGBM
Object.assign(TOPIC_CONTENT, {
  "ml_lightgbm": `<main>
  <h1>LightGBM</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>LightGBM</span></div>
  <p class="lead">LightGBM ("Light Gradient Boosting Machine", Microsoft, Ke et al., NeurIPS 2017) is gradient boosting built for speed. It keeps XGBoost's mathematics (gradients g, Hessians h, the gain G²/(H+λ), the leaf value −G/(H+λ)) and attacks the cost of finding splits from every side: <strong>histograms</strong> instead of sorted values, <strong>leaf-wise</strong> tree growth, <strong>GOSS</strong> to use fewer rows, <strong>EFB</strong> to use fewer columns, and <strong>native categorical splits</strong>. This note works each trick by hand on small tables, checks every number against the library, and then covers parameters, overfitting on small data, speed and code. Read <a class="xref" data-note="ml_xgboost">XGBoost</a> first: this note reuses its formulas.</p>

  <h2 id="lgb-fit" class="open"><span class="num">★</span>Where This Fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 226" width="680"><defs><marker id="lgb-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="122" y1="113" x2="148" y2="113" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="262" y1="113" x2="288" y2="113" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="430" y1="113" x2="518" y2="35" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="430" y1="113" x2="518" y2="113" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="430" y1="113" x2="518" y2="191" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="595" y1="56" x2="595" y2="90" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#lgb-ar)"/><line x1="595" y1="134" x2="595" y2="168" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#lgb-ar)"/><rect x="10" y="92" width="112" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="66" y="110" text-anchor="middle" font-size="13" font-weight="600">Boosting</text><text x="66" y="126" text-anchor="middle" class="tm" font-size="10.5">the idea</text><rect x="150" y="92" width="112" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="110" text-anchor="middle" font-size="13" font-weight="600">AdaBoost</text><text x="206" y="126" text-anchor="middle" class="tm" font-size="10.5">reweight rows</text><rect x="290" y="92" width="140" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="360" y="110" text-anchor="middle" font-size="13" font-weight="600">Gradient Boosting</text><text x="360" y="126" text-anchor="middle" class="tm" font-size="10.5">fit the gradient</text><rect x="520" y="14" width="150" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="595" y="32" text-anchor="middle" font-size="13" font-weight="600">XGBoost</text><text x="595" y="48" text-anchor="middle" class="tm" font-size="10.5">Newton steps + penalties</text><rect x="520" y="92" width="150" height="42" rx="7" class="fg sg" stroke-width="2.5"/><text x="595" y="110" text-anchor="middle" font-size="13" font-weight="600">LightGBM</text><text x="595" y="126" text-anchor="middle" class="tm" font-size="10.5">bins, leaf-wise, GOSS, EFB</text><rect x="520" y="170" width="150" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="595" y="188" text-anchor="middle" font-size="13" font-weight="600">CatBoost</text><text x="595" y="204" text-anchor="middle" class="tm" font-size="10.5">ordered TS, symmetric</text><text x="602" y="77" class="tm" font-size="10">faster</text><text x="602" y="155" class="tm" font-size="10">categories</text><text x="340" y="160" text-anchor="middle" class="tm" font-size="11">same loop: F = F + η·tree</text><text x="340" y="176" text-anchor="middle" class="tm" font-size="11">fit to g (and h)</text></svg><figcaption>The boosting branch. LightGBM (green) takes XGBoost's maths and makes split finding much cheaper. CatBoost, next, keeps the speed ideas but fixes target leakage.</figcaption></figure>
  <p><strong>Came from.</strong> <a class="xref" data-note="ml_xgboost">XGBoost</a> gave the second-order objective, regularised leaves and learned missing-value directions. But in 2016 its default split search still went through every distinct value of every column in sorted order (pre-sorted blocks), and it grew trees level by level. On data with tens of millions of rows and thousands of sparse columns (click logs, ad data), each tree still took a long time, because the cost of a split search grows with <em>rows × columns</em>.</p>
  <p><strong>What LightGBM adds.</strong> Five ideas, each attacking one factor of that cost: bins instead of values (histograms), better use of each split (leaf-wise growth), fewer rows (GOSS: Gradient-based One-Side Sampling), fewer columns (EFB: Exclusive Feature Bundling), and categorical columns split directly (no one-hot). Typical result: several times faster than XGBoost of that time, with the same accuracy, and much less memory.</p>
  <p><strong>Leads to.</strong> XGBoost adopted the histogram and leaf-wise ideas (<code>tree_method="hist"</code>, <code>grow_policy="lossguide"</code>), and sklearn's <code>HistGradientBoosting</code> is a LightGBM-style implementation. <a class="xref" data-note="ml_catboost">CatBoost</a> answers what LightGBM leaves open: its categorical handling uses the training labels directly and can overfit high-cardinality columns, and boosting itself leaks a little target information. Tuning all three is in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>

  <h2 id="lgb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">LightGBM</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Same maths as XGBoost</b> — g, h, gain G²/(H+λ), leaf −G/(H+λ)</li>
          <li><b>Cost of a split search</b> ∝ rows × columns × candidate cuts</li>
          <li><b>Five fixes</b> — histograms, leaf-wise, GOSS (rows), EFB (columns), categorical splits</li>
          <li>💡 A librarian who sorts books into 255 shelves once, instead of comparing every book every time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Histograms</div>
        <ul>
          <li><b>Bin once</b> — each column → ≤ <code>max_bin</code> = 255 bins, stored as 1 byte</li>
          <li><b>Per node</b> — sum g, h per bin (O(rows)), scan bins (O(bins))</li>
          <li><b>Subtraction</b> — bigger child = parent − smaller child</li>
          <li>⚠ Valid set must reuse the train bins (<code>reference=</code>)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Leaf-wise growth</div>
        <ul>
          <li><b>Split the best leaf anywhere</b> (best-first), not the whole level</li>
          <li>More loss drop per leaf; deeper, lopsided trees</li>
          <li><b>num_leaves</b> = main size knob (31); keep &lt; 2<sup>max_depth</sup></li>
          <li><b>min_data_in_leaf</b> (20) — the key brake on small data</li>
          <li>⚠ Small data + many leaves = overfitting</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GOSS (fewer rows)</div>
        <ul>
          <li>Keep top a·100% rows by |g| (<code>top_rate</code> 0.2)</li>
          <li>Sample b·100% of the rest (<code>other_rate</code> 0.1)</li>
          <li><b>Reweight</b> sampled rows by (1−a)/b → unbiased G</li>
          <li>Lower variance than uniform sampling at the same budget</li>
          <li><code>data_sample_strategy="goss"</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">EFB (fewer columns)</div>
        <ul>
          <li><b>Exclusive</b> = never non-zero in the same row (one-hot, sparse)</li>
          <li>Conflict graph → greedy bundling (exact is NP-hard)</li>
          <li>Merge by <b>offsetting bins</b>: A 1–2, B 3–5, C 6–7</li>
          <li>Cost O(rows × bundles) instead of O(rows × columns)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Categoricals &amp; knobs</div>
        <ul>
          <li><b>Sort categories by G/(H + cat_smooth)</b>, scan k−1 cuts (Fisher), not 2<sup>k−1</sup> subsets</li>
          <li>≤ <code>max_cat_to_onehot</code> (4) categories → one-vs-rest</li>
          <li>Brakes: <code>cat_smooth</code>, <code>cat_l2</code>, <code>min_data_per_group</code></li>
          <li>⚠ <code>subsample</code> does nothing unless <code>subsample_freq</code> &gt; 0</li>
          <li><b>Defaults differ from XGBoost</b>: λ = 0, lr 0.1, leaves 31, depth unlimited</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lgb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where the Time Goes</span><span class="rm-sub">Rows × columns × cuts</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-hist"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Histogram Binning</span><span class="rm-sub">Worked by hand, subtraction trick</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-leaf"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Leaf-wise vs Level-wise</span><span class="rm-sub">Best-first growth, measured</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-size"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Controlling Tree Size</span><span class="rm-sub">num_leaves, max_depth, min_data_in_leaf</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-goss"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">GOSS</span><span class="rm-sub">Keep big gradients, reweight the rest</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-efb"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">EFB</span><span class="rm-sub">Bundle columns that never clash</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-cat"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Native Categorical Splits</span><span class="rm-sub">Sort by gradient, scan k−1 cuts</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-params"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Parameters</span><span class="rm-sub">Every knob, aliases, defaults</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-speed"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Speed Comparison</span><span class="rm-sub">150,000 rows, five learners</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-api"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Code: Native &amp; sklearn API</span><span class="rm-sub">Dataset, train, cv, early stopping</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-cmp"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Compared With Its Family</span><span class="rm-sub">XGBoost, CatBoost, HistGB</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in real use</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="lgb-why"><span class="num">01</span>Where the Time Goes</h2>
  <p>Every boosting library spends almost all its time on one job: for each node, find the best (column, cut-off) pair. Recall from <a class="xref" data-note="ml_xgboost">XGBoost</a> that the quality of a cut is</p>
  <p style="text-align:center"><strong>gain = G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ)</strong></p>
  <p>(LightGBM, like the XGBoost code, drops the paper's ½). Computing it needs G<sub>L</sub>, H<sub>L</sub> for every candidate cut, so the cost per tree is roughly</p>
  <p style="text-align:center"><strong>rows × columns</strong> (to collect g and h) <strong>+ columns × candidate cuts</strong> (to scan)</p>
  <p>LightGBM shrinks every factor: candidate cuts (histograms, section 02), wasted splits (leaf-wise, 03), rows (GOSS, 05), columns (EFB, 06), and the categorical blow-up of one-hot encoding (07).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A railway ticket checker with 2,000 passengers. The slow way: sort all passengers by age every time a new question comes ("how many below 30?"). LightGBM's way: on day one, put each passenger into one of a few age bands (histograms); check the passengers who look most suspicious first, plus a fair random sample of the rest (GOSS); and since nobody holds a sleeper ticket and an AC ticket at the same time, keep those two lists on one register (EFB).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LightGBM</strong> is a gradient boosting decision tree (GBDT) framework that finds splits on pre-computed feature histograms, grows trees leaf-wise (best-first) with a limit on the number of leaves, and adds Gradient-based One-Side Sampling and Exclusive Feature Bundling to cut the number of rows and columns each split search touches.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The biggest single saving is in the number of candidate cuts. How can we try only a handful of cut-offs and still find a good split?</div>

  <h2 id="lgb-hist"><span class="num">02</span>Histogram Binning</h2>
  <h3>The idea</h3>
  <p>Before training, put each column's values into at most <code>max_bin</code> buckets (default 255), chosen so each bucket holds about the same number of rows. Store every value as its small bucket number (one byte). Then, for any node:</p>
  <ol>
    <li>Go through the node's rows once; add each row's g and h into the bucket of its value. Now you have, per bucket, a total G<sub>b</sub> and H<sub>b</sub>: the <strong>histogram</strong>.</li>
    <li>Scan the bucket edges from left to right with running sums: G<sub>L</sub> = sum of buckets so far, G<sub>R</sub> = total − G<sub>L</sub>. Only (buckets − 1) candidate cuts.</li>
  </ol>
  <p>No sorting during training, and the scan costs 255 steps instead of one per distinct value.</p>
  <h3>Worked: 12 customers, one column</h3>
  <p>Monthly bill (₹) and churn for 12 customers. Starting probability 0.5, so (as in the XGBoost note) g = 0.5 − y and h = 0.25. With <code>max_bin=4</code> LightGBM forms three buckets of four customers each (it treats <code>max_bin</code> as an upper limit), with edges at 365 and 565:</p>
  <table class="tbl">
    <tr><th>Bucket</th><th>Bills</th><th>Churn</th><th>G<sub>b</sub> = Σ(0.5 − y)</th><th>H<sub>b</sub> = Σ0.25</th></tr>
    <tr><td>0 (≤ 365)</td><td>210, 250, 300, 340</td><td>0, 0, 0, 1</td><td>0.5+0.5+0.5−0.5 = +1.0</td><td>1.0</td></tr>
    <tr><td>1 (365–565)</td><td>390, 420, 480, 520</td><td>0, 0, 1, 0</td><td>+1.0</td><td>1.0</td></tr>
    <tr><td>2 (&gt; 565)</td><td>610, 700, 820, 990</td><td>1, 1, 1, 1</td><td>−2.0</td><td>1.0</td></tr>
    <tr><th>Total</th><td></td><td></td><td>G = 0</td><td>H = 3</td></tr>
  </table>
  <p>Only two cuts to try (LightGBM's default λ = 0):</p>
  <table class="tbl">
    <tr><th>Cut after</th><th>G<sub>L</sub>, H<sub>L</sub></th><th>G<sub>L</sub>²/H<sub>L</sub></th><th>G<sub>R</sub>, H<sub>R</sub></th><th>G<sub>R</sub>²/H<sub>R</sub></th><th>Gain (parent term 0)</th></tr>
    <tr><td>bucket 0</td><td>1, 1</td><td>1.0</td><td>−1, 2</td><td>0.5</td><td>1.5</td></tr>
    <tr><td><strong>bucket 1</strong></td><td>2, 2</td><td>2.0</td><td>−2, 1</td><td>4.0</td><td><strong>6.0</strong></td></tr>
  </table>
  <p>Best cut: bill ≤ 565. Leaf values (learning rate 1): left −G/H = −2/2 = −1.0, right 2/1 = +2.0. An exact search over all 11 cut-offs would find the same cut (between 520 and 610), but only after 11 evaluations instead of 2. The code below repeats the hand computation and then asks LightGBM:</p>
  <div class="fx" data-lang="py">import numpy as np
bill   = np.array([210, 250, 300, 340, 390, 420, 480, 520, 610, 700, 820, 990])
tenure = np.array([30,   5,  48,   3,  60,  24,   2,  36,   4,  12,   6,   1])
churn  = np.array([0,    0,   0,   1,   0,   0,   1,   0,   1,   1,   1,   1])
g, h = 0.5 - churn, np.full(12, 0.25)             # log loss at p = 0.5
bill_bin   = np.digitize(bill, [365, 565])        # 3 bins: &lt;=365, 365-565, &gt;565
tenure_bin = np.digitize(tenure, [6.5, 24.5])     # 3 bins: 1-6, 7-24, 25+
def hist(rows, b):                                # sum g and h of the given rows per bin
    return np.bincount(b[rows], g[rows], 3), np.bincount(b[rows], h[rows], 3)
all_rows = np.arange(12)
G, H = hist(all_rows, bill_bin)
print("bill histogram   G per bin", G, " H per bin", H)
lam = 0
score = lambda G, H: G**2 / (H + lam)
for k in [1, 2]:                                  # cut after bin k-1: only 2 candidates, not 11
    GL, HL = G[:k].sum(), H[:k].sum()
    gain = score(GL, HL) + score(G.sum() - GL, H.sum() - HL) - score(G.sum(), H.sum())
    print(f"cut after bin {k - 1}: G_L={GL:+.1f} H_L={HL:.1f}  gain={gain:.2f}")
left, right = all_rows[bill &lt; 565], all_rows[bill &gt;= 565]
Gp, Hp = hist(all_rows, tenure_bin)
Gr, Hr = hist(right, tenure_bin)                 # build the SMALLER child (4 rows) directly
Gl, Hl = Gp - Gr, Hp - Hr                         # bigger child = parent - smaller child
print("tenure hist parent G", Gp, "| right child G", Gr, "| left = parent - right", Gl)
print("left child built directly G", hist(left, tenure_bin)[0], " H", hist(left, tenure_bin)[1], "vs subtraction H", Hl)</div>
  <div class="fx" data-lang="text">bill histogram   G per bin [ 1.  1. -2.]  H per bin [1. 1. 1.]
cut after bin 0: G_L=+1.0 H_L=1.0  gain=1.50
cut after bin 1: G_L=+2.0 H_L=2.0  gain=6.00
tenure hist parent G [-2.  0.  2.] | right child G [-1.5 -0.5  0. ] | left = parent - right [-0.5  0.5  2. ]
left child built directly G [-0.5  0.5  2. ]  H [0.75 0.25 1.  ] vs subtraction H [0.75 0.25 1.  ]</div>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
bill = np.array([210, 250, 300, 340, 390, 420, 480, 520, 610, 700, 820, 990], dtype=float)
churn = np.array([0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1])
params = {"objective": "binary", "max_bin": 4, "min_data_in_bin": 1, "min_data_in_leaf": 1,
          "min_sum_hessian_in_leaf": 0, "num_leaves": 2, "learning_rate": 1.0, "lambda_l2": 0,
          "verbose": -1}
ds = lgb.Dataset(bill.reshape(-1, 1), label=churn, params=params)
bst = lgb.train(params, ds, num_boost_round=1)
t = bst.trees_to_dataframe()
print(t[["node_depth", "split_feature", "threshold", "split_gain", "value", "count"]].to_string(index=False))</div>
  <div class="fx" data-lang="text"> node_depth split_feature  threshold  split_gain  value  count
          1      Column_0      565.0         6.0    0.0     12
          2           NaN        NaN         NaN   -1.0      8
          2           NaN        NaN         NaN    2.0      4</div>
  <p>LightGBM splits at 565 with gain 6.0 and leaf values −1.0 and 2.0, exactly the table. Note there is no learning rate or λ shrinkage here because we set both to "off".</p>
  <h3>The subtraction trick, worked</h3>
  <p>After splitting on bill, both children need histograms of every <em>other</em> column (here tenure, in three buckets 1–6, 7–24, 25+) to find their own best split. Building a histogram costs one pass over the child's rows. But every row of the parent is in exactly one child, so</p>
  <p style="text-align:center"><strong>histogram(left) + histogram(right) = histogram(parent)</strong></p>
  <p>The parent's histogram is already known. So build only the <em>smaller</em> child's (right: 4 rows) and get the bigger one by subtraction: tenure G per bucket, parent (−2, 0, 2) minus right (−1.5, −0.5, 0) = left (−0.5, 0.5, 2). The second-to-last output line shows exactly this, and the last line confirms that building the left child directly gives the same G and H. The work for the two children is the cost of the smaller one alone, at most half of the rows.</p>
  <h3>How the buckets are chosen</h3>
  <ul>
    <li>From a sample of rows (<code>bin_construct_sample_cnt</code>, default 200,000), LightGBM finds edges so that buckets hold roughly equal counts. A column with ≤ 255 distinct values gets one bucket per value (exact).</li>
    <li>Buckets need at least <code>min_data_in_bin</code> rows (default 3). Missing values and zeros get their own handling, with a learned default direction as in XGBoost.</li>
    <li>Binning happens <strong>once</strong>, when the <code>Dataset</code> is constructed. Validation data must be binned with the same edges, which is what <code>reference=train_set</code> does.</li>
  </ul>
  <table class="tbl">
    <tr><th></th><th>Pre-sorted exact (old XGBoost)</th><th>Histogram (LightGBM)</th></tr>
    <tr><td>Build per node</td><td>walk sorted indices: O(rows × columns)</td><td>add g, h into bins: O(rows × columns), sequential memory</td></tr>
    <tr><td>Scan per node</td><td>O(rows) cuts per column</td><td>O(bins) cuts per column</td></tr>
    <tr><td>Memory per value</td><td>4-byte value + 4-byte row index</td><td>1-byte bin number</td></tr>
    <tr><td>Children</td><td>both from scratch</td><td>smaller one + subtraction</td></tr>
    <tr><td>Distributed</td><td>send sorted columns</td><td>send small histograms</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Histogram-based split finding</strong>: each feature is discretised once into ≤ <code>max_bin</code> bins; at each node, gradient statistics (G<sub>b</sub>, H<sub>b</sub>, counts) are accumulated per bin, and only bin boundaries are evaluated as split points. <strong>Histogram subtraction</strong>: the larger child's histogram is obtained as parent − smaller child.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fewer bins is not "less accurate" by default: coarser bins average out noise and can even help. But if a column's exact threshold matters (an age limit at exactly 18, a price point), check that 255 bins resolve it, or raise <code>max_bin</code> for that column (<code>max_bin_by_feature</code>).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Cheaper split search makes every split fast. The next question is <em>which</em> leaves to split at all: a level-wise tree spends splits on leaves that barely need them.</div>

  <h2 id="lgb-leaf"><span class="num">03</span>Leaf-wise vs Level-wise Growth</h2>
  <h3>The idea</h3>
  <p><strong>Level-wise</strong> (depth-wise, XGBoost's default): split every leaf at the current depth, then go one level deeper. <strong>Leaf-wise</strong> (best-first, LightGBM): keep a list of all current leaves with their best possible split gain; always split the single leaf with the largest gain, wherever it is; stop at <code>num_leaves</code> leaves.</p>
  <figure class="viz"><svg viewBox="0 0 640 220" width="640"><g stroke="currentColor"><line x1="150" y1="34" x2="90" y2="84"/><line x1="150" y1="34" x2="210" y2="84"/><line x1="90" y1="84" x2="60" y2="140"/><line x1="90" y1="84" x2="120" y2="140"/><line x1="210" y1="84" x2="180" y2="140"/><line x1="210" y1="84" x2="240" y2="140"/><line x1="460" y1="34" x2="410" y2="84"/><line x1="460" y1="34" x2="520" y2="84"/><line x1="410" y1="84" x2="380" y2="140"/><line x1="410" y1="84" x2="440" y2="140"/><line x1="380" y1="140" x2="355" y2="190"/><line x1="380" y1="140" x2="405" y2="190"/></g><g class="fb sb"><circle cx="150" cy="34" r="13"/><circle cx="90" cy="84" r="13"/><circle cx="210" cy="84" r="13"/></g><g class="fs" stroke="currentColor"><circle cx="60" cy="140" r="10"/><circle cx="120" cy="140" r="10"/><circle cx="180" cy="140" r="10"/><circle cx="240" cy="140" r="10"/></g><text x="150" y="38" text-anchor="middle" font-size="11">1</text><text x="90" y="88" text-anchor="middle" font-size="11">2</text><text x="210" y="88" text-anchor="middle" font-size="11">3</text><text x="232" y="74" class="tr" font-size="11">gain 1.5</text><text x="60" y="74" class="tm" font-size="11">gain 12</text><g class="ft st"><circle cx="460" cy="34" r="13"/><circle cx="410" cy="84" r="13"/><circle cx="380" cy="140" r="13"/></g><g class="fs" stroke="currentColor"><circle cx="520" cy="84" r="10"/><circle cx="440" cy="140" r="10"/><circle cx="355" cy="190" r="10"/><circle cx="405" cy="190" r="10"/></g><text x="460" y="38" text-anchor="middle" font-size="11">1</text><text x="410" y="88" text-anchor="middle" font-size="11">2</text><text x="380" y="144" text-anchor="middle" font-size="11">3</text><text x="534" y="80" class="tm" font-size="10">gain 1.5 (waits)</text><text x="350" y="80" class="tm" font-size="11">gain 12</text><text x="318" y="136" class="tm" font-size="11">gain 6</text><text x="150" y="182" text-anchor="middle" font-size="12">level-wise: splits 1, 2, 3</text><text x="150" y="198" text-anchor="middle" class="tm" font-size="11">total gain 40 + 12 + 1.5 = 53.5</text><text x="480" y="182" text-anchor="start" font-size="12">leaf-wise: 1, 2, then 3</text><text x="480" y="198" text-anchor="start" class="tm" font-size="11">total gain 40 + 12 + 6 = 58</text></svg><figcaption>Both trees use three splits and have four leaves. Level-wise must split node 3 (gain only 1.5) to finish the level. Leaf-wise spends that split on the more useful leaf below node 2 (gain 6).</figcaption></figure>
  <h3>Worked: who gets the third split?</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Leaves available (best gain if split)</th><th>Level-wise picks</th><th>Leaf-wise picks</th></tr>
    <tr><td>1</td><td>root (40)</td><td>root</td><td>root</td></tr>
    <tr><td>2</td><td>L (12), R (1.5)</td><td>L (level 1, part 1)</td><td>L (largest)</td></tr>
    <tr><td>3</td><td>LL (6), LR (0.8), R (1.5)</td><td>R (must finish level 1)</td><td>LL (largest)</td></tr>
    <tr><td>Total gain</td><td></td><td>53.5</td><td>58.0</td></tr>
  </table>
  <p>For the same number of leaves, leaf-wise always reaches a loss at least as low, because every split is the best available one. The price: trees become deep and lopsided, and a deep branch on a few rows can be fitting noise.</p>
  <h3>Measured: the growth order alone</h3>
  <p>To isolate the effect, use one library (XGBoost) with the two growth policies at the same leaf budget, then LightGBM, on the 20,000-row churn data of this family (300 trees, learning rate 0.1, no early stopping):</p>
  <div class="fx" data-lang="py">import xgboost as xgb, lightgbm as lgb
from sklearn.metrics import log_loss
def depth_of(dump):                                   # deepest leaf in an XGBoost text dump
    return max(line.count("\\t") for line in dump.split("\\n") if "leaf" in line)
runs = {"XGBoost depth-wise, max_depth=5": dict(grow_policy="depthwise", max_depth=5),
        "XGBoost leaf-wise, max_leaves=32": dict(grow_policy="lossguide", max_leaves=32, max_depth=0)}
for name, kw in runs.items():                          # same library, only the growth order differs
    m = xgb.XGBClassifier(n_estimators=300, learning_rate=0.1, tree_method="hist", **kw).fit(Xtr, ytr)
    dumps = m.get_booster().get_dump()
    leaves = np.mean([d.count("leaf") for d in dumps])
    print(f"{name:34s} leaves/tree {leaves:4.1f}  max depth {max(map(depth_of, dumps)):2d}  "
          f"train logloss {log_loss(ytr, m.predict_proba(Xtr)[:, 1]):.3f}  "
          f"val logloss {log_loss(yva, m.predict_proba(Xva)[:, 1]):.3f}")
m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.1, num_leaves=32, verbose=-1).fit(Xtr, ytr)
t = m.booster_.trees_to_dataframe()
print(f"{'LightGBM, num_leaves=32':34s} leaves/tree {t[t.left_child.isna()].groupby('tree_index').size().mean():4.1f}"
      f"  max depth {t.node_depth.max() - 1:2d}  "
      f"train logloss {log_loss(ytr, m.predict_proba(Xtr)[:, 1]):.3f}  "
      f"val logloss {log_loss(yva, m.predict_proba(Xva)[:, 1]):.3f}")</div>
  <div class="fx" data-lang="text">XGBoost depth-wise, max_depth=5    leaves/tree 26.0  max depth  5  train logloss 0.195  val logloss 0.337
XGBoost leaf-wise, max_leaves=32   leaves/tree 32.0  max depth 16  train logloss 0.138  val logloss 0.326
LightGBM, num_leaves=32            leaves/tree 32.0  max depth 18  train logloss 0.124  val logloss 0.323</div>
    <p>The depth-wise XGBoost trees average 26 leaves (some branches stop when no split has positive gain) and never go below depth 5. The leaf-wise trees use all 32 leaves and reach depth 16–18: they go deep where the loss keeps dropping. For the same leaf budget, leaf-wise reaches a clearly lower training loss (0.124–0.138 vs 0.195) and here also a lower validation loss (0.323–0.326 vs 0.337). LightGBM and XGBoost's <code>lossguide</code> behave almost the same, which shows that the growth order, not the library, makes the difference.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Leaf-wise (best-first) growth</strong>: at each step, split the leaf whose best split has the largest gain, until <code>num_leaves</code> is reached (or no positive gain remains, or <code>max_depth</code> blocks it). <strong>Level-wise (depth-wise) growth</strong>: split all leaves of one depth before the next depth, until <code>max_depth</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"num_leaves=64 is the same as max_depth=6." Not with leaf-wise growth: 64 leaves can form a chain 30 levels deep. If you port settings from XGBoost, convert <code>max_depth=d</code> into <code>num_leaves</code> below 2<sup>d</sup> (for example d = 7 → 70–100 leaves rather than 128), and keep <code>max_depth</code> as a safety cap.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Leaf-wise trees are powerful but can go too deep. We need to know exactly which knobs hold them back, and what happens when we do not use them.</div>

  <h2 id="lgb-size"><span class="num">04</span>Controlling Tree Size</h2>
  <table class="tbl">
    <tr><th>Knob (sklearn alias)</th><th>Default</th><th>What it limits</th><th>Rule of thumb</th></tr>
    <tr><td><code>num_leaves</code></td><td>31</td><td>Leaves per tree: the main complexity knob</td><td>15–255; below 2<sup>max_depth</sup></td></tr>
    <tr><td><code>max_depth</code></td><td>−1 (none)</td><td>Depth of any branch</td><td>Set 6–12 as a cap on small/medium data</td></tr>
    <tr><td><code>min_data_in_leaf</code> (<code>min_child_samples</code>)</td><td>20</td><td>Rows per leaf</td><td>Raise to 50–500 on large or noisy data</td></tr>
    <tr><td><code>min_sum_hessian_in_leaf</code> (<code>min_child_weight</code>)</td><td>1e-3</td><td>Σh per leaf (XGBoost's min_child_weight)</td><td>Usually leave; raise for log loss with very confident rows</td></tr>
    <tr><td><code>min_gain_to_split</code> (<code>min_split_gain</code>)</td><td>0</td><td>Minimum gain (like γ)</td><td>0–1; data-size dependent</td></tr>
    <tr><td><code>lambda_l2</code>, <code>lambda_l1</code> (<code>reg_lambda</code>, <code>reg_alpha</code>)</td><td>0, 0</td><td>Leaf values</td><td>0–10</td></tr>
    <tr><td><code>path_smooth</code></td><td>0</td><td>Shrinks a leaf toward its parent's value (more for small leaves)</td><td>Helps deep trees on small data</td></tr>
  </table>
  <p>Note the defaults: <strong>λ = 0</strong> (XGBoost: 1) and <code>min_data_in_leaf=20</code> as the main brake. On small data, leaf-wise growth with a large leaf budget memorises quickly:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.metrics import roc_auc_score
Xs, ys = Xtr.iloc[:500], ytr[:500]                    # only 500 training rows
runs = {"num_leaves=255, min_child_samples=1": dict(num_leaves=255, min_child_samples=1),
        "num_leaves=255, min_child_samples=20": dict(num_leaves=255),
        "defaults (31 leaves, min 20 rows)": dict(),
        "num_leaves=7, min 20 rows": dict(num_leaves=7)}
for name, kw in runs.items():
    m = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.05, verbose=-1, **kw)
    m.fit(Xs, ys, eval_X=Xva, eval_y=yva, callbacks=[lgb.early_stopping(100, verbose=False)])
    depth = m.booster_.trees_to_dataframe().node_depth.max() - 1
    print(f"{name:38s} trees {m.best_iteration_:4d}  max depth {depth:2d}  "
          f"train AUC {roc_auc_score(ys, m.predict_proba(Xs)[:, 1]):.3f}  "
          f"test AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.3f}")</div>
  <div class="fx" data-lang="text">num_leaves=255, min_child_samples=1    trees    9  max depth 16  train AUC 1.000  test AUC 0.727
num_leaves=255, min_child_samples=20   trees   83  max depth 14  train AUC 1.000  test AUC 0.819
defaults (31 leaves, min 20 rows)      trees   83  max depth 14  train AUC 1.000  test AUC 0.819
num_leaves=7, min 20 rows              trees  249  max depth  6  train AUC 0.999  test AUC 0.798</div>
    <p>Each run trains on only 500 rows and early-stops on the validation set. With <code>min_child_samples=1</code>, leaves of single customers are allowed: the model memorises after 9 trees and scores only 0.727 on test. With the default <code>min_child_samples=20</code>, <code>num_leaves=255</code> and <code>num_leaves=31</code> give the <em>identical</em> model: 500 rows with at least 20 per leaf allow at most 25 leaves, so <code>min_data_in_leaf</code>, not <code>num_leaves</code>, is the real brake on small data. With 7 leaves the model is a bit too simple here (0.798). Note also the depth: 14 levels from 500 rows, which a depth-wise tree of the same leaf count would never reach.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With very small data (a few hundred rows), the default <code>min_data_in_leaf=20</code> can also <em>prevent</em> any split in deep nodes, and LightGBM prints "No further splits with positive gain". That is the brake working, not a bug. And with tiny data, try a <a class="xref" data-note="ml_rf">Random Forest</a> or a regularised linear model too.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Histograms and leaf-wise growth make each tree cheaper per row. The remaining cost is that every tree still looks at every row. Can we look at fewer rows without losing accuracy?</div>

  <h2 id="lgb-goss"><span class="num">05</span>GOSS: Gradient-based One-Side Sampling</h2>
  <h3>The need</h3>
  <p>Random row sampling (<code>subsample</code>) treats all rows alike. But in boosting, rows are not alike: a row with a small |g| is already predicted well, and contributes little to any gain; a row with a large |g| is where the model is still wrong. GOSS keeps the informative rows and samples only among the easy ones.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher checking 100 answer sheets after a test. She re-reads every sheet that scored badly (big errors), and only a random 10 of the 80 good sheets. When she estimates the class's "good-sheet" total, she multiplies what she saw in those 10 by 8, so the estimate is not biased toward the bad sheets.</p>
  </div>
  <h3>The algorithm</h3>
  <ol>
    <li>Sort rows by |g|. Keep the top a × 100% (set A, <code>top_rate</code>, default 0.2).</li>
    <li>From the remaining rows, sample b × 100% <em>of all rows</em> at random (set B, <code>other_rate</code>, default 0.1).</li>
    <li>Multiply the g and h of every row in B by <strong>(1 − a)/b</strong>.</li>
    <li>Build the tree on A ∪ B only (30% of the rows with the defaults).</li>
  </ol>
  <p>Why (1 − a)/b: the rest holds (1 − a)·n rows, and we kept b·n of them, so each kept row stands for (1 − a)/b rows. Then the expected sum over B equals the sum over the whole rest: the estimated G<sub>L</sub>, G<sub>R</sub> are <strong>unbiased</strong>. The paper proves the error of the estimated gain shrinks as O(1/√n) and is lower than uniform sampling's when the gradients are uneven.</p>
  <h3>Worked: 10 rows</h3>
  <p>Gradients g = (−0.90, 0.80, −0.10, 0.05, 0.20, −0.15, 0.10, −0.05, 0.12, 0.03). A candidate split sends rows 0, 2, 3, 5, 7, 8 left. True G<sub>L</sub> = −0.90 − 0.10 + 0.05 − 0.15 − 0.05 + 0.12 = <strong>−1.03</strong>.</p>
  <p>GOSS with a = 0.2, b = 0.2: keep the 2 largest |g| (rows 0 and 1), sample 2 of the other 8, weight (1 − 0.2)/0.2 = 4.</p>
  <table class="tbl">
    <tr><th>Random sample from the rest</th><th>Left rows in A</th><th>Left rows in sample</th><th>Estimated G<sub>L</sub></th></tr>
    <tr><td>rows 5, 9</td><td>row 0: −0.90</td><td>row 5: −0.15</td><td>−0.90 + 4 × (−0.15) = −1.50</td></tr>
    <tr><td>rows 3, 8</td><td>row 0: −0.90</td><td>rows 3, 8: 0.05 + 0.12</td><td>−0.90 + 4 × 0.17 = −0.22</td></tr>
    <tr><td>rows 4, 6</td><td>row 0: −0.90</td><td>none</td><td>−0.90 + 0 = −0.90</td></tr>
  </table>
  <p>Single estimates scatter, but on average over all possible samples they equal −1.03. The code averages 100,000 random samples and compares with (1) forgetting the reweighting and (2) uniform sampling of the same number of rows (4):</p>
  <div class="fx" data-lang="py">import numpy as np
g = np.array([-0.90, 0.80, -0.10, 0.05, 0.20, -0.15, 0.10, -0.05, 0.12, 0.03])   # 10 rows' gradients
left = np.array([1, 0, 1, 1, 0, 1, 0, 1, 1, 0], dtype=bool)                       # one candidate split
a, b = 0.2, 0.2                      # keep top 20% by |g|; sample 20% of ALL rows from the rest
n = len(g); top_n, rand_n = int(a * n), int(b * n)
order = np.argsort(-np.abs(g))
top, rest = order[:top_n], order[top_n:]
w = (1 - a) / b                      # each sampled small-gradient row stands for this many rows
print("top rows:", top, " weight for sampled rows:", w)
print(f"true G_left = {g[left].sum():+.3f}")
rng = np.random.default_rng(0)
est_goss, est_plain = [], []
for _ in range(100000):
    s = rng.choice(rest, rand_n, replace=False)
    est_goss.append(g[top][left[top]].sum() + w * g[s][left[s]].sum())    # GOSS: reweighted
    est_plain.append(g[top][left[top]].sum() + g[s][left[s]].sum())       # forgot to reweight
print(f"GOSS estimate:      mean {np.mean(est_goss):+.3f}  sd {np.std(est_goss):.3f}")
print(f"no reweighting:     mean {np.mean(est_plain):+.3f}  sd {np.std(est_plain):.3f}")
est_uni = []                         # same budget (4 rows) drawn uniformly, scaled by 10/4
for _ in range(100000):
    r = rng.choice(n, top_n + rand_n, replace=False)
    est_uni.append(n / (top_n + rand_n) * g[r][left[r]].sum())
print(f"uniform 4 rows x2.5: mean {np.mean(est_uni):+.3f}  sd {np.std(est_uni):.3f}")</div>
  <div class="fx" data-lang="text">top rows: [0 1]  weight for sampled rows: 4.0
true G_left = -1.030
GOSS estimate:      mean -1.030  sd 0.413
no reweighting:     mean -0.932  sd 0.103
uniform 4 rows x2.5: mean -1.032  sd 1.122</div>
  <p>GOSS: mean −1.030, exactly the truth, with spread 0.41. Without the reweighting the estimate is biased (−0.93): the small-gradient rows are under-counted. Uniform sampling of 4 rows is also unbiased, but its spread is 1.12, almost 3× larger, because it often misses the two rows that carry most of the signal. That is the whole point of GOSS: same budget, much more reliable gains.</p>
  <h3>On the churn data</h3>
  <p>Row sampling only matters when there are many rows, so this run stacks 8 slightly jittered copies of the training set (about 96,000 rows):</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.metrics import roc_auc_score
X2 = pd.concat([Xtr] * 8, ignore_index=True) + np.random.default_rng(0).normal(0, 0.05, (len(Xtr) * 8, Xtr.shape[1]))
y2 = np.tile(ytr, 8)                                  # ~96,000 rows so that row sampling matters
runs = {"gbdt, all rows":            {},
        "gbdt, bagging 30% of rows": {"subsample": 0.3, "subsample_freq": 1},
        "GOSS top 20% + 10% sample": {"data_sample_strategy": "goss", "top_rate": 0.2, "other_rate": 0.1}}
for name, kw in runs.items():
    t0 = time.time()
    m = lgb.LGBMClassifier(n_estimators=400, learning_rate=0.05, num_leaves=63, verbose=-1, **kw).fit(X2, y2)
    print(f"{name:28s} test AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.4f}   fit {time.time() - t0:.1f}s")</div>
  <div class="fx" data-lang="text">gbdt, all rows               test AUC 0.9385   fit 9.0s
gbdt, bagging 30% of rows    test AUC 0.9383   fit 10.5s
GOSS top 20% + 10% sample    test AUC 0.9402   fit 11.3s</div>
    <p>Using only 30% of the rows per tree, GOSS matches the full-data model (AUC 0.9402 vs 0.9385; random 30% bagging gives 0.9383). At this size there is no speed-up: with ~96,000 rows and 14 columns a histogram pass is already cheap, and the fixed costs (sorting gradients, sampling, a single busy shared machine) dominate. GOSS was designed for millions of rows, where the histogram pass over all rows is the bottleneck. The lesson: GOSS is a speed tool that keeps accuracy; it is not an accuracy tool. (The AUC here is higher than the usual 0.933 on this data because of the 8 jittered copies, a form of data augmentation.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>GOSS</strong>: keep the a·n rows with the largest |g|, randomly sample b·n of the others and up-weight them by (1−a)/b, then compute split gains on this subset. In LightGBM 4: <code>data_sample_strategy="goss"</code>, <code>top_rate</code> (a), <code>other_rate</code> (b). (Older versions used <code>boosting="goss"</code>.) LightGBM starts sampling only after the first 1/learning_rate rounds, when gradients have become uneven.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>GOSS and ordinary bagging (<code>bagging_fraction</code> + <code>bagging_freq</code>) are alternatives, not a combination. And GOSS gives little on small data: with 10,000 rows the full histogram is already cheap, and sampling only adds noise.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> GOSS cuts the rows. On wide sparse data (thousands of one-hot or click columns) the other factor, columns, dominates. Most of those columns are zero in almost every row.</div>

  <h2 id="lgb-efb"><span class="num">06</span>EFB: Exclusive Feature Bundling</h2>
  <h3>The idea</h3>
  <p>One-hot columns of one category ("city = Pune", "city = Delhi", …) are never non-zero in the same row: they are <strong>mutually exclusive</strong>. Many sparse columns in practice are nearly so. Exclusive columns can be packed into a single column without losing information, as long as each original column gets its own range of bin numbers. Fewer columns means fewer histograms to build and scan.</p>
  <h3>Step 1: which columns can share a bundle?</h3>
  <p>Count <strong>conflicts</strong>: the rows where two columns are both non-zero. Build a graph with a node per column and edges weighted by conflicts. Bundling with no conflicts is graph colouring (each bundle is one colour), which is NP-hard, so LightGBM uses a greedy rule: take columns in order of how many conflicts they have, and put each into the first bundle where it would add no more than K conflicts (<code>max_conflict_rate</code>, default 0); otherwise start a new bundle.</p>
  <h3>Step 2: merge with offsets</h3>
  <p>Inside a bundle, shift each column's bins past the previous column's range, so the merged value tells you which original column it came from.</p>
  <h3>Worked: four sparse columns</h3>
  <table class="tbl">
    <tr><th>Row</th><th>A</th><th>B</th><th>C</th><th>D</th><th>Bundle A+B+C</th></tr>
    <tr><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>1 (A's bin 1)</td></tr>
    <tr><td>1</td><td>0</td><td>3</td><td>0</td><td>0</td><td>3 + 2 = 5 (B's bin 3)</td></tr>
    <tr><td>2</td><td>0</td><td>0</td><td>2</td><td>0</td><td>2 + 5 = 7 (C's bin 2)</td></tr>
    <tr><td>3</td><td>2</td><td>0</td><td>0</td><td>0</td><td>2 (A's bin 2)</td></tr>
    <tr><td>4</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1 + 2 = 3 (B's bin 1)</td></tr>
    <tr><td>5</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1 + 5 = 6 (C's bin 1)</td></tr>
  </table>
  <p>A, B, C never clash with each other, but D clashes with each of them once (rows 0, 4, 5). So D stays alone and A, B, C form one bundle. A uses bins 1–2; B's bins 1–3 become 3–5 (offset 2); C's bins 1–2 become 6–7 (offset 2 + 3 = 5). Any split on the bundle, such as "bundle ≤ 2", is the same as a split "A ≠ 0" on the original data; "3 ≤ bundle ≤ 5" means "B ≠ 0". Four columns became two.</p>
  <div class="fx" data-lang="py">import numpy as np
X = np.array([[1, 0, 0, 1],     # columns: A, B, C, D (values are already bin numbers; 0 = empty)
              [0, 3, 0, 0],
              [0, 0, 2, 0],
              [2, 0, 0, 0],
              [0, 1, 0, 1],
              [0, 0, 1, 1]])
names = "ABCD"
nz = X != 0
conflicts = (nz[:, :, None] &amp; nz[:, None, :]).sum(0)          # rows where both columns are non-zero
np.fill_diagonal(conflicts, 0)
print("conflict counts\\n", conflicts)
# greedy bundling with zero allowed conflicts: biggest-degree columns first
order = np.argsort(-conflicts.sum(1), kind="stable")
bundles = []
for j in order:
    for bnd in bundles:
        if all(conflicts[j, k] == 0 for k in bnd):
            bnd.append(j); break
    else:
        bundles.append([j])
print("bundles:", [[names[j] for j in sorted(b)] for b in bundles])
# merge A, B, C into one column by shifting each column's bins past the previous one's range
merged, offset = np.zeros(len(X), int), 0
for j in sorted(bundles[[len(b) for b in bundles].index(3)]):
    merged[nz[:, j]] = X[nz[:, j], j] + offset
    print(f"{names[j]}: bins 1..{X[:, j].max()} -&gt; {1 + offset}..{X[:, j].max() + offset}")
    offset += X[:, j].max()
print("merged column:", merged)</div>
  <div class="fx" data-lang="text">conflict counts
 [[0 0 0 1]
 [0 0 0 1]
 [0 0 0 1]
 [1 1 1 0]]
bundles: [['D'], ['A', 'B', 'C']]
A: bins 1..2 -&gt; 1..2
B: bins 1..3 -&gt; 3..5
C: bins 1..2 -&gt; 6..7
merged column: [1 5 7 2 3 6]</div>
  <h3>Timing on wide one-hot data</h3>
  <div class="fx" data-lang="py">import numpy as np, time, lightgbm as lgb
from scipy import sparse
rng = np.random.default_rng(0)
n, n_cols, levels = 100000, 20, 50                   # 20 categorical columns x 50 levels, one-hot
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
    lgb.train(p, lgb.Dataset(X, label=y, params=p), num_boost_round=100)
    print(f"enable_bundle={bundle!s:5s}  train time {time.time() - t0:.1f}s")</div>
  <div class="fx" data-lang="text">matrix: (100000, 1000) 2.0% non-zero
enable_bundle=True   train time 7.0s
enable_bundle=False  train time 21.9s</div>
    <p>1,000 one-hot columns, 2% non-zero (each row has exactly one 1 in each block of 50). Each block of 50 columns is perfectly exclusive, so EFB can pack them into about 20 bundles. Training with bundling took 7.0 s, without it 21.9 s: three times faster for the same model, because histograms are built for ~20 bundles instead of 1,000 columns. (Times are single-threaded on a shared machine; the ratio is what matters.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Exclusive Feature Bundling</strong>: greedily group features that are (almost) never non-zero together into bundles, and merge each bundle into one feature by adding offsets to their bin ranges. Histogram cost drops from O(rows × features) to O(rows × bundles). Parameters: <code>enable_bundle</code> (default true), <code>max_conflict_rate</code> (default 0).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>EFB is why "just one-hot everything" is cheaper in LightGBM than you might expect, but it does not fix the <em>statistical</em> problem of one-hot with many levels: each level still gets one-vs-rest splits with very few rows. For high-cardinality categories use native categorical handling (next section) or <a class="xref" data-note="ml_catboost">CatBoost</a>.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Better than bundling one-hot columns is not creating them at all. LightGBM can split a categorical column directly into two groups of categories.</div>

  <h2 id="lgb-cat"><span class="num">07</span>Native Categorical Splits</h2>
  <h3>The problem</h3>
  <p>A category with k values can be split into two groups in 2<sup>k−1</sup> − 1 ways: 15 ways for k = 5, about 5 × 10<sup>29</sup> for k = 100. One-hot only allows the k "one vs rest" splits, which wastes depth: to group 30 high-churn cities together a one-hot tree needs 30 splits.</p>
  <h3>The trick: sort, then scan</h3>
  <p>Fisher (1958) showed that for squared error (and for binary classification) the best two-group split is always a cut in the list of categories <em>sorted by their mean target</em>. With gradients, "mean target" becomes "mean gradient": LightGBM sorts the categories by G<sub>c</sub>/(H<sub>c</sub> + <code>cat_smooth</code>) and scans the k − 1 cuts of that sorted list with the usual gain formula. Cost: one sort, k − 1 evaluations.</p>
  <h3>Worked: five plans, ten customers</h3>
  <p>Regression on monthly spend; first guess = mean spend = 21, so g = 21 − y and h = 1:</p>
  <table class="tbl">
    <tr><th>Plan</th><th>Spends</th><th>G<sub>c</sub> = Σ(21 − y)</th><th>H<sub>c</sub></th><th>G/H</th><th>Sorted position</th></tr>
    <tr><td>A</td><td>10, 12</td><td>+20</td><td>2</td><td>+10</td><td>4</td></tr>
    <tr><td>B</td><td>30, 34</td><td>−22</td><td>2</td><td>−11</td><td>2</td></tr>
    <tr><td>C</td><td>14, 16</td><td>+12</td><td>2</td><td>+6</td><td>3</td></tr>
    <tr><td>D</td><td>40, 36</td><td>−34</td><td>2</td><td>−17</td><td>1</td></tr>
    <tr><td>E</td><td>8, 10</td><td>+24</td><td>2</td><td>+12</td><td>5</td></tr>
  </table>
  <p>Sorted order: D, B, C, A, E. Scan the 4 cuts (λ = 0, parent term 0 because G = 0):</p>
  <table class="tbl">
    <tr><th>Left group</th><th>G<sub>L</sub>, H<sub>L</sub></th><th>G<sub>L</sub>²/H<sub>L</sub></th><th>G<sub>R</sub>, H<sub>R</sub></th><th>G<sub>R</sub>²/H<sub>R</sub></th><th>Gain</th></tr>
    <tr><td>{D}</td><td>−34, 2</td><td>578.0</td><td>34, 8</td><td>144.5</td><td>722.5</td></tr>
    <tr><td><strong>{D, B}</strong></td><td>−56, 4</td><td>784.0</td><td>56, 6</td><td>522.7</td><td><strong>1306.7</strong></td></tr>
    <tr><td>{D, B, C}</td><td>−44, 6</td><td>322.7</td><td>44, 4</td><td>484.0</td><td>806.7</td></tr>
    <tr><td>{D, B, C, A}</td><td>−24, 8</td><td>72.0</td><td>24, 2</td><td>288.0</td><td>360.0</td></tr>
  </table>
  <p>Best: {B, D} vs {A, C, E}, gain 1306.7. Leaf values: 21 + 56/4 = 35 (the mean of B and D) and 21 − 56/6 = 11.67 (the mean of A, C, E). Note that {B, D} are codes 1 and 3: not neighbours in the original order, so no single cut on label-encoded integers could find this split. LightGBM agrees:</p>
  <div class="fx" data-lang="py">import pandas as pd, lightgbm as lgb
df = pd.DataFrame({"plan": list("AABBCCDDEE"),
                   "spend": [10, 12, 30, 34, 14, 16, 40, 36, 8, 10]})
df["plan"] = df["plan"].astype("category")               # codes: A=0, B=1, C=2, D=3, E=4
params = {"objective": "regression", "num_leaves": 2, "learning_rate": 1.0, "lambda_l2": 0,
          "min_data_in_leaf": 1, "min_data_in_bin": 1, "min_data_per_group": 1,
          "cat_smooth": 0, "cat_l2": 0, "verbose": -1}
bst = lgb.train(params, lgb.Dataset(df[["plan"]], label=df["spend"], params=params), num_boost_round=1)
t = bst.trees_to_dataframe()
print(t[["node_depth", "decision_type", "threshold", "split_gain", "value", "count"]].to_string(index=False))
print(bst.predict(pd.DataFrame({"plan": pd.Categorical(list("ABCDE"), categories=list("ABCDE"))})))</div>
  <div class="fx" data-lang="text"> node_depth decision_type threshold  split_gain     value  count
          1            ==      1||3 1306.670044 21.000000     10
          2           NaN       NaN         NaN 35.000000      4
          2           NaN       NaN         NaN 11.666667      6
[11.66666667 35.         11.66666667 35.         11.66666667]</div>
  <p><code>decision_type ==</code> with <code>threshold 1||3</code> means "plan code in {1, 3} goes left". Gain 1306.67 and leaf values 35 and 11.67 match the hand table. (We switched off the smoothing knobs so the numbers are exact; the defaults add <code>cat_smooth=10</code> and <code>cat_l2=10</code>.)</p>
  <h3>On a real categorical churn table</h3>
  <p>A second shared dataset of this family, used again in <a class="xref" data-note="ml_catboost">CatBoost</a>: 20,000 telecom customers with <code>city</code> (300 values, a few big cities and a long tail of small ones), <code>plan</code> (5), <code>payment</code> (4), <code>device</code> (40), plus tenure, support calls and monthly bill; churn rate 19%; same 12,000 / 3,000 / 5,000 split. Plan × payment has an interaction (students paying cash churn a lot). Three ways to feed the categories to LightGBM:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.metrics import roc_auc_score
feats = ["city", "plan", "payment", "device", "tenure", "support_calls", "monthly_bill"]
def fit_score(name, A, B, V, **kw):
    t0 = time.time()
    m = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.05, num_leaves=31, verbose=-1, **kw)
    m.fit(A, cytr, eval_X=V, eval_y=cyva, callbacks=[lgb.early_stopping(100, verbose=False)])
    print(f"{name:30s} columns {A.shape[1]:4d}  trees {m.best_iteration_:4d}  "
          f"test AUC {roc_auc_score(cyte, m.predict_proba(B)[:, 1]):.4f}  {time.time() - t0:.1f}s")
# 1) integer codes (fake order)
codes = {c: {v: i for i, v in enumerate(sorted(df[c].unique()))} for c in CAT}
lab = lambda D: D[feats].replace(codes).astype(float)
fit_score("label-encoded integers", lab(Ctr), lab(Cte), lab(Cva))
# 2) one-hot
oh = lambda D: pd.get_dummies(D[feats], columns=CAT, dtype=float).reindex(
    columns=pd.get_dummies(Ctr[feats], columns=CAT).columns, fill_value=0)
fit_score("one-hot", oh(Ctr), oh(Cte), oh(Cva))
# 3) native categorical: pandas 'category' dtype, same categories everywhere
cats = {c: pd.CategoricalDtype(sorted(df[c].unique())) for c in CAT}
nat = lambda D: D[feats].astype(cats)
fit_score("LightGBM native categorical", nat(Ctr), nat(Cte), nat(Cva))
fit_score("native, cat_smooth=50", nat(Ctr), nat(Cte), nat(Cva), cat_smooth=50, min_data_per_group=50)</div>
  <div class="fx" data-lang="text">label-encoded integers         columns    7  trees  106  test AUC 0.7606  2.3s
one-hot                        columns  352  trees  108  test AUC 0.7733  2.1s
LightGBM native categorical    columns    7  trees   67  test AUC 0.7718  1.2s
native, cat_smooth=50          columns    7  trees   88  test AUC 0.7699  1.1s</div>
    <p>Label-encoded integers are clearly worst (0.761): the fake order forces many splits to group cities. One-hot (352 columns) and native categorical (7 columns) score about the same (0.773 vs 0.772), but the native version needs fewer trees and about half the time. Stronger smoothing (<code>cat_smooth=50</code>) did not help on this table. Keep these numbers in mind: on the same table, <a class="xref" data-note="ml_catboost">CatBoost</a> with raw strings reaches about 0.783, because its ordered statistics and category combinations use the 300 cities and the plan × payment interaction better.</p>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Meaning</th></tr>
    <tr><td><code>categorical_feature</code></td><td>auto (pandas category dtype)</td><td>Which columns are categorical; values must be non-negative integers or pandas categories</td></tr>
    <tr><td><code>max_cat_to_onehot</code></td><td>4</td><td>With ≤ 4 categories use one-vs-rest splits instead of sorting</td></tr>
    <tr><td><code>cat_smooth</code></td><td>10</td><td>Added to H<sub>c</sub> when sorting: rare categories pulled toward the middle</td></tr>
    <tr><td><code>cat_l2</code></td><td>10</td><td>Extra L2 for categorical splits</td></tr>
    <tr><td><code>min_data_per_group</code></td><td>100</td><td>Minimum rows per category group</td></tr>
    <tr><td><code>max_cat_threshold</code></td><td>32</td><td>Maximum categories on one side of the split</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gradient-sorted categorical split</strong>: sort a node's categories by G<sub>c</sub>/(H<sub>c</sub> + cat_smooth), evaluate the k − 1 prefix cuts of that order with the usual gain, and send the chosen set of categories left. For squared error this finds the optimal binary partition (Fisher 1958) in O(k log k) instead of O(2<sup>k</sup>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The sort uses the <em>training rows' own gradients</em>, so it is a form of target encoding inside the tree. For high-cardinality columns with many rare values (IDs, pincodes), it can find "groups" that are pure noise and overfit. Raise <code>cat_smooth</code> / <code>min_data_per_group</code>, group rare values into "other", or use CatBoost's ordered statistics. Also make sure the category → code mapping is identical at training and prediction time (use the same pandas <code>CategoricalDtype</code>).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have met the five ideas. In practice you work through parameters, and LightGBM has many, with several names each.</div>

  <h2 id="lgb-params"><span class="num">08</span>Parameters</h2>
  <table class="tbl">
    <tr><th>Native name</th><th>sklearn name / aliases</th><th>Default</th><th>Effect</th></tr>
    <tr><td><code>objective</code></td><td>—</td><td>regression</td><td>binary, multiclass, regression_l1, huber, quantile, poisson, tweedie, lambdarank, …</td></tr>
    <tr><td><code>boosting</code></td><td><code>boosting_type</code></td><td>gbdt</td><td>gbdt, dart (dropout trees), rf (random forest mode)</td></tr>
    <tr><td><code>num_iterations</code></td><td><code>n_estimators</code></td><td>100</td><td>Trees; set high with early stopping</td></tr>
    <tr><td><code>learning_rate</code></td><td><code>eta</code></td><td>0.1</td><td>Shrinkage</td></tr>
    <tr><td><code>num_leaves</code></td><td><code>max_leaves</code></td><td>31</td><td>Main complexity knob</td></tr>
    <tr><td><code>max_depth</code></td><td>—</td><td>−1</td><td>Depth cap</td></tr>
    <tr><td><code>min_data_in_leaf</code></td><td><code>min_child_samples</code></td><td>20</td><td>Rows per leaf</td></tr>
    <tr><td><code>min_sum_hessian_in_leaf</code></td><td><code>min_child_weight</code></td><td>1e-3</td><td>Σh per leaf</td></tr>
    <tr><td><code>feature_fraction</code></td><td><code>colsample_bytree</code></td><td>1.0</td><td>Columns per tree (<code>feature_fraction_bynode</code> per split)</td></tr>
    <tr><td><code>bagging_fraction</code> + <code>bagging_freq</code></td><td><code>subsample</code> + <code>subsample_freq</code></td><td>1.0, 0</td><td>Row sampling every k iterations; freq 0 = off</td></tr>
    <tr><td><code>lambda_l1</code>, <code>lambda_l2</code></td><td><code>reg_alpha</code>, <code>reg_lambda</code></td><td>0, 0</td><td>L1 / L2 on leaves</td></tr>
    <tr><td><code>min_gain_to_split</code></td><td><code>min_split_gain</code></td><td>0</td><td>Like XGBoost's γ</td></tr>
    <tr><td><code>max_bin</code></td><td>—</td><td>255</td><td>Bins per feature</td></tr>
    <tr><td><code>data_sample_strategy</code></td><td>—</td><td>bagging</td><td>"goss" for GOSS</td></tr>
    <tr><td><code>is_unbalance</code> / <code>scale_pos_weight</code></td><td><code>class_weight</code></td><td>false / 1</td><td>Up-weight the rare class (probabilities no longer calibrated)</td></tr>
    <tr><td><code>monotone_constraints</code></td><td>—</td><td>none</td><td>Force increasing/decreasing effect per feature</td></tr>
    <tr><td><code>linear_tree</code></td><td>—</td><td>false</td><td>Linear model in each leaf (helps smooth trends)</td></tr>
    <tr><td><code>extra_trees</code></td><td>—</td><td>false</td><td>Random thresholds, like <a class="xref" data-note="ml_extratrees">Extra Trees</a></td></tr>
    <tr><td><code>num_threads</code>, <code>seed</code>, <code>deterministic</code></td><td><code>n_jobs</code>, <code>random_state</code></td><td>auto, None</td><td>Threads, reproducibility</td></tr>
  </table>
  <h3>The alias trap, demonstrated</h3>
  <p>The sklearn wrapper's <code>subsample</code> maps to <code>bagging_fraction</code>, but bagging only runs every <code>bagging_freq</code> iterations, and that defaults to 0 (never):</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
def probs(**kw):
    m = lgb.LGBMClassifier(n_estimators=100, random_state=0, verbose=-1, **kw).fit(Xtr, ytr)
    return m.predict_proba(Xte)[:, 1]
base = probs()
print("subsample=0.5 alone      -&gt; identical to no sampling?", np.allclose(probs(subsample=0.5), base))
print("subsample=0.5 + freq=1   -&gt; identical to no sampling?", np.allclose(probs(subsample=0.5, subsample_freq=1), base))</div>
  <div class="fx" data-lang="text">subsample=0.5 alone      -&gt; identical to no sampling? True
subsample=0.5 + freq=1   -&gt; identical to no sampling? False</div>
  <p><code>subsample=0.5</code> alone gives exactly the same model as no sampling. Only with <code>subsample_freq=1</code> is half of the rows used per tree. Many tuning runs have searched over <code>subsample</code> without knowing it did nothing.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Passing two aliases of the same parameter (say <code>min_child_samples</code> in the constructor and <code>min_data_in_leaf</code> in a params dict) makes LightGBM keep one and warn. Pick one naming style per project.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> All these tricks are claimed to make LightGBM fast. Let us measure it against its relatives on a larger dataset.</div>

  <h2 id="lgb-speed"><span class="num">09</span>Speed Comparison</h2>
  <p>150,000 training rows (50,000 test), 40 numeric columns, 200 trees at learning rate 0.1, similar tree sizes (63 leaves or depth 6):</p>
  <div class="fx" data-lang="py">import numpy as np, time, xgboost as xgb, lightgbm as lgb
from sklearn.datasets import make_classification
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
X, y = make_classification(n_samples=200000, n_features=40, n_informative=15, random_state=1)
Xa, ya, Xb, yb = X[:150000], y[:150000], X[150000:], y[150000:]
models = {"LightGBM (63 leaves)": lgb.LGBMClassifier(n_estimators=200, learning_rate=0.1, num_leaves=63, verbose=-1),
          "XGBoost hist, lossguide 63": xgb.XGBClassifier(n_estimators=200, learning_rate=0.1, tree_method="hist",
                                                          grow_policy="lossguide", max_leaves=63, max_depth=0),
          "XGBoost hist, depth 6": xgb.XGBClassifier(n_estimators=200, learning_rate=0.1, tree_method="hist", max_depth=6),
          "sklearn HistGradientBoosting": HistGradientBoostingClassifier(max_iter=200, learning_rate=0.1,
                                                                         max_leaf_nodes=63, early_stopping=False),
          "XGBoost exact, depth 6": xgb.XGBClassifier(n_estimators=200, learning_rate=0.1, tree_method="exact", max_depth=6)}
for name, m in models.items():
    t0 = time.time(); m.fit(Xa, ya); fit = time.time() - t0
    print(f"{name:30s} fit {fit:6.1f}s   test AUC {roc_auc_score(yb, m.predict_proba(Xb)[:, 1]):.4f}")</div>
  <div class="fx" data-lang="text">LightGBM (63 leaves)           fit   14.8s   test AUC 0.9943
XGBoost hist, lossguide 63     fit   64.5s   test AUC 0.9942
XGBoost hist, depth 6          fit   55.0s   test AUC 0.9937
sklearn HistGradientBoosting   fit   62.0s   test AUC 0.9942
XGBoost exact, depth 6         fit  610.2s   test AUC 0.9936</div>
    <p>All five reach the same test AUC (0.9936–0.9943): on clean numeric data the algorithms agree, and only the time differs. Run single-threaded on a busy shared machine, LightGBM took 15 s; XGBoost's histogram method (either growth policy) and sklearn's HistGradientBoosting took about 55–65 s, roughly 4× longer; XGBoost's exact method took 610 s, 40× longer. Exact split search is what LightGBM was compared against in 2017, which is where the famous "10× faster" numbers come from. Against modern histogram implementations the gap is smaller and depends on data shape, threads and hardware.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Timing claims from 2017 ("LightGBM is 10× faster than XGBoost") compared against XGBoost's old exact method. Since XGBoost 2.0 made <code>hist</code> the default, the two are much closer on dense data. LightGBM's lead is largest on very large, wide, sparse data and with categorical columns. Always time on your own data and hardware.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The full working code: native API with early stopping, cross-validation, importance and saving.</div>

  <h2 id="lgb-api"><span class="num">10</span>Code: Native &amp; sklearn API</h2>
  <p>The native API in one block, on the churn data. <code>Dataset</code> bins the data once; the validation set uses the training bins via <code>reference</code>; callbacks handle early stopping and logging:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
dtr = lgb.Dataset(Xtr, label=ytr)                       # native API: binned once, reused
dva = lgb.Dataset(Xva, label=yva, reference=dtr)        # reference = use the SAME bin edges
params = {"objective": "binary", "metric": "binary_logloss", "learning_rate": 0.05, "num_leaves": 31,
          "min_data_in_leaf": 20, "feature_fraction": 0.8, "bagging_fraction": 0.8, "bagging_freq": 1,
          "lambda_l2": 1.0, "seed": 0, "verbose": -1}
bst = lgb.train(params, dtr, num_boost_round=5000, valid_sets=[dtr, dva], valid_names=["train", "val"],
                callbacks=[lgb.early_stopping(100), lgb.log_evaluation(200)])
print("best_iteration:", bst.best_iteration)
p = bst.predict(Xte, num_iteration=bst.best_iteration)
print(f"test accuracy {np.mean((p &gt; 0.5) == yte):.4f}")
imp = pd.DataFrame({"split": bst.feature_importance("split"), "gain": bst.feature_importance("gain").round(0)},
                   index=bst.feature_name()).sort_values("gain", ascending=False)
print(imp.head(4).to_string())
print(imp.loc[["row_noise", "coin_noise"]].to_string(header=False))
cv = lgb.cv(params, lgb.Dataset(Xtr, label=ytr), num_boost_round=5000, nfold=5, stratified=True,
            callbacks=[lgb.early_stopping(100, verbose=False)])
print("lgb.cv rounds:", len(cv["valid binary_logloss-mean"]),
      " cv logloss:", round(cv["valid binary_logloss-mean"][-1], 4))
bst.save_model("churn_lgb.txt", num_iteration=bst.best_iteration)
again = lgb.Booster(model_file="churn_lgb.txt")
print("reloaded model same predictions:", np.allclose(again.predict(Xte), p))</div>
  <div class="fx" data-lang="text">Training until validation scores don't improve for 100 rounds
[200]	train's binary_logloss: 0.267081	val's binary_logloss: 0.342559
[400]	train's binary_logloss: 0.189389	val's binary_logloss: 0.325983
[600]	train's binary_logloss: 0.137932	val's binary_logloss: 0.322328
Early stopping, best iteration is:
[539]	train's binary_logloss: 0.151899	val's binary_logloss: 0.321633
best_iteration: 539
test accuracy 0.8730
    split     gain
f8   1793  16932.0
f5   1753  15855.0
f4   1556  14583.0
f9   1519  14533.0
row_noise   801  2393.0
coin_noise   55   149.0
lgb.cv rounds: 528  cv logloss: 0.3353
reloaded model same predictions: True</div>
    <p>Early stopping picked 539 trees (validation log loss 0.3216) and the test accuracy is 0.873, in line with XGBoost on the same data. Look at the two importance types: by <code>split</code> count, the pure-noise column <code>row_noise</code> is used 801 times, nearly half as often as the best real feature, because a column with 12,000 distinct values offers many cut-offs to chase noise. By <code>gain</code> it is far behind (2,393 vs 16,932). The 0/1 noise column <code>coin_noise</code> is barely used at all. Split counts reward having many possible thresholds, which is why they mislead (more in <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>). <code>lgb.cv</code> with 5 folds chose 528 rounds, almost the same as the single validation split. The saved text model reloads to identical predictions.</p>
  <p>The same model with the sklearn API:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
m = lgb.LGBMClassifier(n_estimators=5000, learning_rate=0.05, num_leaves=31, min_child_samples=20,
                       colsample_bytree=0.8, subsample=0.8, subsample_freq=1, reg_lambda=1.0, verbose=-1)
m.fit(Xtr, ytr, eval_X=Xva, eval_y=yva, callbacks=[lgb.early_stopping(100, verbose=False)])
m.predict_proba(Xte)          # uses m.best_iteration_ automatically</div>
  <ul>
    <li><strong>LightGBM 4.7</strong> renamed <code>eval_set=[(X, y)]</code> to <code>eval_X=</code>, <code>eval_y=</code> (the old form still works with a deprecation warning).</li>
    <li>Early stopping is a <strong>callback</strong> (<code>lgb.early_stopping(n)</code>), not a constructor argument as in XGBoost.</li>
    <li>Importance: <code>"split"</code> (how often a feature is used, the sklearn default) or <code>"gain"</code> (total gain). For explanations prefer SHAP: <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</li>
    <li>Saving: <code>save_model("m.txt")</code> writes a readable text model; <code>lgb.Booster(model_file=…)</code> loads it.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Building the validation <code>Dataset</code> without <code>reference=dtrain</code> gives it its own bin edges. LightGBM handles it, but the evaluation is then subtly inconsistent; with the sklearn API this is done for you.</p>
  </div>

  <h2 id="lgb-cmp"><span class="num">11</span>Compared With Its Family</h2>
  <table class="tbl">
    <tr><th></th><th><a class="xref" data-note="ml_xgboost">XGBoost</a></th><th>LightGBM</th><th><a class="xref" data-note="ml_catboost">CatBoost</a></th><th>sklearn HistGradientBoosting</th></tr>
    <tr><td>Maths</td><td>g, h, λ, γ gain</td><td>same</td><td>same, on symmetric trees</td><td>same (g, h, L2)</td></tr>
    <tr><td>Split search</td><td>exact / approx / hist</td><td>hist (+ GOSS, EFB)</td><td>hist (borders)</td><td>hist</td></tr>
    <tr><td>Growth</td><td>depth-wise (lossguide optional)</td><td>leaf-wise</td><td>symmetric</td><td>leaf-wise</td></tr>
    <tr><td>Size knob</td><td>max_depth</td><td>num_leaves</td><td>depth</td><td>max_leaf_nodes</td></tr>
    <tr><td>Row sampling</td><td>uniform</td><td>uniform or GOSS</td><td>Bayesian / Bernoulli / MVS</td><td>none</td></tr>
    <tr><td>Sparse / one-hot data</td><td>sparsity-aware</td><td>EFB</td><td>ok</td><td>dense only</td></tr>
    <tr><td>Categoricals</td><td>enable_categorical (newer)</td><td>native, gradient-sorted</td><td>ordered target statistics + combos</td><td>native (≤ 255 categories)</td></tr>
    <tr><td>Default λ</td><td>1</td><td>0</td><td>3 (l2_leaf_reg)</td><td>0</td></tr>
    <tr><td>Training speed</td><td>fast</td><td>fastest on large/wide data</td><td>slower per tree</td><td>fast</td></tr>
    <tr><td>Small-data risk</td><td>medium</td><td>highest (deep leaf-wise trees)</td><td>lowest (symmetric + ordered)</td><td>medium</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>LightGBM changed <em>how fast</em> boosting runs, not <em>what</em> it computes. When people say "LightGBM is more accurate", it is usually because leaf-wise trees of 31 leaves are a bit more flexible than depth-6 level-wise trees at the same settings; tuned properly, the three libraries land within a few thousandths of AUC of each other (see <a class="xref" data-note="ml_trees">The Tree Family</a>).</p>
  </div>

  <h2 id="lgb-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: num_leaves too large on small data</span>
    <p>255 leaves on 2,000 rows memorises. Start at 15–31, raise <code>min_data_in_leaf</code>, set <code>max_depth</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: subsample without subsample_freq</span>
    <p>Does nothing. Set <code>subsample_freq=1</code> (or <code>bagging_freq</code> in native params).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: categories that change between train and predict</span>
    <p>Pandas category codes depend on the categories present. Fix a <code>CategoricalDtype</code> with the full list and apply it to every DataFrame; unseen categories become NaN.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: high-cardinality native categoricals</span>
    <p>Gradient-sorted splits on thousands of rare values overfit. Smooth (<code>cat_smooth</code>, <code>min_data_per_group</code>), group rare values, or use CatBoost.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: porting XGBoost settings 1:1</span>
    <p>λ default 0 vs 1, <code>num_leaves</code> vs <code>max_depth</code>, <code>min_child_samples</code> (rows) vs <code>min_child_weight</code> (Hessian). Translate the meaning, not the names.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: non-deterministic results</span>
    <p>Multi-threaded histogram sums can differ in the last float digits between runs. For exact reproducibility set <code>deterministic=True</code>, <code>force_row_wise=True</code> (or col-wise) and a fixed <code>seed</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: early stopping on the test set</span>
    <p>As with every booster: stop on validation, report on test.</p>
  </div>

  <h2 id="lgb-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are LightGBM's main ideas, and which cost does each reduce?</summary><div class="qa-body">Histograms (fewer candidate cuts, less memory), leaf-wise growth (more loss reduction per leaf), GOSS (fewer rows per tree), EFB (fewer columns), native categorical splits (no one-hot explosion). Split-search cost ≈ rows × columns + columns × bins; each idea cuts one factor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the histogram subtraction trick.</summary><div class="qa-body">Every parent row is in exactly one child, so hist(parent) = hist(left) + hist(right). Build the smaller child's histogram directly and compute the larger one as parent − smaller. The children together then cost as much as the smaller child alone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Leaf-wise vs level-wise growth: trade-off?</summary><div class="qa-body">Leaf-wise always splits the leaf with the largest gain, so for a fixed number of leaves it reaches lower training loss. But trees become deep and unbalanced, which overfits small data. Control with num_leaves, min_data_in_leaf, max_depth.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should num_leaves relate to max_depth?</summary><div class="qa-body">A depth-d tree has at most 2<sup>d</sup> leaves, so keep num_leaves below 2<sup>max_depth</sup> (e.g. depth 7 → 70–100 leaves). num_leaves = 2<sup>d</sup> with leaf-wise growth is much more flexible than a depth-d level-wise tree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe GOSS and why it reweights.</summary><div class="qa-body">Keep the top a fraction of rows by |g|, sample b·n of the rest, multiply the sampled rows' g and h by (1−a)/b. The rest has (1−a)n rows of which we keep bn, so the weight makes the gradient sums unbiased; without it, the well-fitted rows would be under-counted and the split gains biased.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is GOSS better than uniform subsampling at the same budget?</summary><div class="qa-body">The rows with large |g| dominate the gain. Uniform sampling often drops them, so the estimated gain has high variance. GOSS always keeps them and only samples the low-information rows. In our 10-row example: same mean, standard deviation 0.41 vs 1.12.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is EFB and why is it allowed?</summary><div class="qa-body">Features that are (almost) never non-zero in the same row are merged into one feature, with their bin ranges offset so the original feature can be recovered from the merged bin. Splits on the bundle are equivalent to splits on the originals. Optimal bundling is graph colouring (NP-hard), so a greedy method with a conflict tolerance is used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does LightGBM split a categorical feature with k values?</summary><div class="qa-body">Sort categories by G/(H + cat_smooth) (mean gradient), then evaluate only the k−1 cuts in that order. For squared error, Fisher (1958) proved the best binary partition is one of these cuts, so k−1 evaluations replace 2<sup>k−1</sup>−1. With ≤ max_cat_to_onehot (4) categories it uses one-vs-rest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your LightGBM model overfits a 3,000-row dataset. What do you change?</summary><div class="qa-body">Lower num_leaves (7–31), raise min_data_in_leaf (30–100), set max_depth (4–6), add feature_fraction and bagging (with bagging_freq=1), add lambda_l2 and path_smooth, use early stopping with a lower learning rate. Also compare with CatBoost or a random forest, which are safer on small data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name two default values that differ between XGBoost and LightGBM and why it matters.</summary><div class="qa-body">L2 on leaves: XGBoost λ = 1, LightGBM 0. Size: XGBoost max_depth 6 (level-wise), LightGBM num_leaves 31 with no depth limit. Also learning rate 0.3 vs 0.1 and min_child_weight (Hessian) vs min_child_samples (rows). Copying settings across libraries changes the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: which LightGBM ideas did XGBoost and sklearn adopt?</summary><div class="qa-body">XGBoost: tree_method="hist" (default since 2.0) and grow_policy="lossguide" with max_leaves, plus native categorical support. sklearn: HistGradientBoostingClassifier/Regressor, a LightGBM-style histogram, leaf-wise booster with native missing values and categoricals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what problem does CatBoost solve that LightGBM's categorical handling does not?</summary><div class="qa-body">LightGBM sorts categories by the same training rows' gradients, so a rare category's statistic includes its own labels: a form of target leakage that overfits high-cardinality columns. CatBoost computes category statistics with ordered target statistics (only "earlier" rows in a random order) and also uses ordered boosting to remove the same bias from the gradients.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: GOSS samples rows, Random Forest samples rows. What is different in purpose?</summary><div class="qa-body">Random Forest's bootstrap creates diversity among independent trees to reduce variance. GOSS is about speed: it keeps the rows that matter most for the current gradient step and reweights the others so the split gains stay unbiased; it is not meant to make trees different.</div></details>
</main>
`
});
