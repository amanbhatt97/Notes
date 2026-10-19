// notes/ml/ml_lightgbm.js — LightGBM
Object.assign(TOPIC_CONTENT, {
  "ml_lightgbm": `<main>
  <h1>LightGBM</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>LightGBM</span></div>
  <p class="lead">LightGBM ("Light Gradient Boosting Machine", Microsoft, Ke et al., NeurIPS 2017) is gradient boosting built for speed. It keeps XGBoost's mathematics (gradients g, Hessians h, the gain G²/(H+λ), the leaf value −G/(H+λ)) and attacks the cost of finding splits from every side: <strong>histograms</strong> instead of sorted values, <strong>leaf-wise</strong> tree growth, <strong>GOSS</strong> to use fewer rows, <strong>EFB</strong> to use fewer columns, and <strong>native categorical splits</strong>. This note works each trick by hand on the running example of the whole tree group, the captain's 14-day cricket diary, checks every number against the library, and then covers parameters, overfitting on small data, speed and code. Read <a class="xref" data-note="ml_xgboost">XGBoost</a> first: this note reuses its formulas.</p>

  <h2 id="lgb-fit" class="open"><span class="num">★</span>Where This Fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 226" width="680"><defs><marker id="lgb-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="122" y1="113" x2="148" y2="113" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="262" y1="113" x2="288" y2="113" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="430" y1="113" x2="518" y2="35" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="430" y1="113" x2="518" y2="113" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="430" y1="113" x2="518" y2="191" stroke="currentColor" marker-end="url(#lgb-ar)"/><line x1="595" y1="56" x2="595" y2="90" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#lgb-ar)"/><line x1="595" y1="134" x2="595" y2="168" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#lgb-ar)"/><rect x="10" y="92" width="112" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="66" y="110" text-anchor="middle" font-size="13" font-weight="600">Boosting</text><text x="66" y="126" text-anchor="middle" class="tm" font-size="10.5">the idea</text><rect x="150" y="92" width="112" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="110" text-anchor="middle" font-size="13" font-weight="600">AdaBoost</text><text x="206" y="126" text-anchor="middle" class="tm" font-size="10.5">reweight rows</text><rect x="290" y="92" width="140" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="360" y="110" text-anchor="middle" font-size="13" font-weight="600">Gradient Boosting</text><text x="360" y="126" text-anchor="middle" class="tm" font-size="10.5">fit the gradient</text><rect x="520" y="14" width="150" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="595" y="32" text-anchor="middle" font-size="13" font-weight="600">XGBoost</text><text x="595" y="48" text-anchor="middle" class="tm" font-size="10.5">Newton steps + penalties</text><rect x="520" y="92" width="150" height="42" rx="7" class="fg sg" stroke-width="2.5"/><text x="595" y="110" text-anchor="middle" font-size="13" font-weight="600">LightGBM</text><text x="595" y="126" text-anchor="middle" class="tm" font-size="10.5">bins, leaf-wise, GOSS, EFB</text><rect x="520" y="170" width="150" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="595" y="188" text-anchor="middle" font-size="13" font-weight="600">CatBoost</text><text x="595" y="204" text-anchor="middle" class="tm" font-size="10.5">ordered TS, symmetric</text><text x="602" y="77" class="tm" font-size="10">faster</text><text x="602" y="155" class="tm" font-size="10">categories</text><text x="340" y="160" text-anchor="middle" class="tm" font-size="11">same loop: F = F + η·tree</text><text x="340" y="176" text-anchor="middle" class="tm" font-size="11">fit to g (and h)</text></svg><figcaption>The boosting branch. LightGBM (green) takes XGBoost's maths and makes split finding much cheaper. CatBoost, next, keeps the speed ideas but fixes target leakage.</figcaption></figure>
  <p><strong>Came from.</strong> <a class="xref" data-note="ml_xgboost">XGBoost</a> gave the second-order objective, regularised leaves and learned missing-value directions. But in 2016 its default split search still went through every distinct value of every column in sorted order (pre-sorted blocks), and it grew trees level by level. On data with tens of millions of rows and thousands of sparse columns (click logs, ad data), each tree still took a long time, because the cost of a split search grows with <em>rows × columns</em>.</p>
  <p><strong>What LightGBM adds.</strong> Five ideas, each attacking one factor of that cost: bins instead of values (histograms), better use of each split (leaf-wise growth), fewer rows (GOSS: Gradient-based One-Side Sampling), fewer columns (EFB: Exclusive Feature Bundling), and categorical columns split directly (no one-hot). Typical result: several times faster than XGBoost of that time, with the same accuracy, and much less memory.</p>
  <p><strong>Leads to.</strong> XGBoost adopted the histogram and leaf-wise ideas (<code>tree_method="hist"</code>, <code>grow_policy="lossguide"</code>), and sklearn's <code>HistGradientBoosting</code> is a LightGBM-style implementation. <a class="xref" data-note="ml_catboost">CatBoost</a> answers what LightGBM leaves open: its categorical handling uses the training labels directly and can overfit high-cardinality columns, and boosting itself leaks a little target information. Tuning all three is in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>

    <h2 id="lgb-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next question. Numbers are from the running example, the captain's 14-day cricket diary (Play, humidity %, temperature, outlook, wind, turnout).</p>
  <ol class="story">
    <li><b>Where the time goes</b><span>Q: XGBoost's maths is fine; why is it slow on huge data? → Every split search costs rows × columns to collect g and h plus columns × cut-offs to scan. Can we try fewer cut-offs?</span></li>
    <li><b>Histogram binning</b><span>Q: how to scan only a few cut-offs? → Bin each column once and add g, h per bin: the diary's humidity in 3 bins needs 2 evaluations instead of 9 (and 3 bins miss the best cut 82.5; 6 bins find it). The bigger child's histogram comes free by subtraction. Which leaves should get the splits?</span></li>
    <li><b>Leaf-wise growth</b><span>Q: is splitting level by level wasteful? → Split the leaf with the biggest gain: with 4 leaves the diary tree gains 2.857 + 3.6 + 3.2, while depth 2 stops at 3 leaves because the overcast branch is pure. But deep lopsided trees can memorise…</span></li>
    <li><b>Controlling tree size</b><span>Q: what holds leaf-wise trees back? → num_leaves, max_depth and above all min_data_in_leaf: with the default 20, LightGBM cannot split the 14-day diary at all. Fewer rows per tree next?</span></li>
    <li><b>GOSS</b><span>Q: can each tree look at fewer rows? → Keep the big-|g| rows, sample the rest and up-weight them: on round-2 diary turnout gradients the estimated G stays unbiased (+23.94 vs +24) with sd 18.2 instead of 27.3 for uniform sampling. And fewer columns?</span></li>
    <li><b>EFB</b><span>Q: can sparse columns share one histogram? → Columns never non-zero together can be bundled: the three one-hot Outlook columns become one column again; Wind_Strong conflicts and stays alone. Better than bundling one-hot columns: not making them…</span></li>
    <li><b>Native categorical splits</b><span>Q: how to split a category without one-hot? → Sort categories by mean gradient and scan: of the 6 outlook-wind combinations, {Overcast-Strong, Overcast-Weak, Rain-Weak} vs the rest (gain 658.29), codes 0, 1, 3, which no integer cut could find. Then: which parameters, how fast, and how to use it?</span></li>
    <li><b>Parameters, speed, code</b><span>Q: how do you run it well? → Mind the aliases (subsample does nothing without subsample_freq), time it on your own data, use the native or sklearn API with early stopping. How does it compare with its family?</span></li>
  </ol>

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
          <li>Diary humidity, 3 bins: best cut 90.5 (gain 1.463); 6 bins find 82.5 (2.571)</li>
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
          <li>Merge by <b>offsetting bins</b>: diary Overcast 1, Rain 2, Sunny 3 = Outlook again</li>
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
      <div class="rm-item rm-done" data-target="lgb-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where the Time Goes</span><span class="rm-sub">The cost of a split search</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-hist"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Histogram Binning</span><span class="rm-sub">The diary's humidity in 3 bins</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-leaf"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Leaf-wise vs Level-wise</span><span class="rm-sub">Who gets the next split</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-size"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Controlling Tree Size</span><span class="rm-sub">num_leaves, min_data_in_leaf</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-goss"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">GOSS</span><span class="rm-sub">Fewer rows, unbiased gains</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-efb"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">EFB</span><span class="rm-sub">Fewer columns by bundling</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-cat"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Native Categorical Splits</span><span class="rm-sub">Sort by gradient, then scan</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-params"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Parameters</span><span class="rm-sub">Names, aliases, defaults</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-speed"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Speed Comparison</span><span class="rm-sub">Measured, not claimed</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-api"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Code: Native &amp; sklearn API</span><span class="rm-sub">Early stopping, CV, saving</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-cmp"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Compared With Its Family</span><span class="rm-sub">XGBoost, CatBoost, HistGB</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Five cuts to one cost</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in practice</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="lgb-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="lgb-why"><span class="num">01</span>Where the Time Goes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><a class="xref" data-note="ml_xgboost">XGBoost</a> gave the right formulas: g, h, the gain and w* = −G/(H+λ). On tens of millions of rows and thousands of columns it was still slow. Where exactly does the time go, and which parts can be cut?</p>
  </div>
  <p>Every boosting library spends almost all its time on one job: for each node, find the best (column, cut-off) pair. Recall from <a class="xref" data-note="ml_xgboost">XGBoost</a> that the quality of a cut is</p>
  <p style="text-align:center"><strong>gain = G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ)</strong></p>
  <p>(LightGBM, like the XGBoost code, drops the paper's ½). Computing it needs G<sub>L</sub>, H<sub>L</sub> for every candidate cut, so the cost per tree is roughly</p>
  <p style="text-align:center"><strong>rows × columns</strong> (to collect g and h) <strong>+ columns × candidate cuts</strong> (to scan)</p>
  <p>LightGBM shrinks every factor: candidate cuts (histograms, section 02), wasted splits (leaf-wise, 03), rows (GOSS, 05), columns (EFB, 06), and the categorical blow-up of one-hot encoding (07).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A railway ticket checker with 2,000 passengers. The slow way: sort all passengers by age every time a new question comes ("how many below 30?"). LightGBM's way: on day one, put each passenger into one of a few age bands (histograms); check the passengers who look most suspicious first, plus a fair random sample of the rest (GOSS); and since nobody holds a sleeper ticket and an AC ticket at the same time, keep those two lists on one register (EFB).</p>
  </div>
  <h3>The running example</h3>
  <p>Like every note of the tree group, this one works by hand on the captain's cricket diary: 14 days with Outlook, Humidity (and the reading HumPct in %), Wind, TempC, Play (9 yes, 5 no) and Turnout. Fourteen rows cannot show speed, so speed is measured on bigger data; but every mechanism (bins, growth order, GOSS, bundles, categorical sorting) is small enough to follow on the diary.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LightGBM</strong> is a gradient boosting decision tree (GBDT) framework that finds splits on pre-computed feature histograms, grows trees leaf-wise (best-first) with a limit on the number of leaves, and adds Gradient-based One-Side Sampling and Exclusive Feature Bundling to cut the number of rows and columns each split search touches.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Histogram binning.</b> The biggest single saving is in the number of candidate cuts. How can we try only a handful of cut-offs and still find a good split?</div>

  <h2 id="lgb-hist"><span class="num">02</span>Histogram Binning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Exact split search tries every distinct value of every column as a cut-off. Can we decide on a few cut-offs once, before training, and still find good splits?</p>
  </div>
  <h3>The idea</h3>
  <p>Before training, put each column's values into at most <code>max_bin</code> buckets (default 255), chosen so each bucket holds about the same number of rows. Store every value as its small bucket number (one byte). Then, for any node:</p>
  <ol>
    <li>Go through the node's rows once; add each row's g and h into the bucket of its value. Now you have, per bucket, a total G<sub>b</sub> and H<sub>b</sub>: the <strong>histogram</strong>.</li>
    <li>Scan the bucket edges from left to right with running sums: G<sub>L</sub> = sum of buckets so far, G<sub>R</sub> = total − G<sub>L</sub>. Only (buckets − 1) candidate cuts.</li>
  </ol>
  <p>No sorting during training, and the scan costs 255 steps instead of one per distinct value.</p>
  <h3>Worked: the diary's humidity</h3>
  <p>Play from HumPct, starting probability 0.5, so (as in the XGBoost note) g = 0.5 − y and h = 0.25. With <code>max_bin=4</code> LightGBM forms three buckets (it treats <code>max_bin</code> as an upper limit), with edges at 77.5 and 90.5:</p>
  <table class="tbl">
    <tr><th>Bucket</th><th>Humidity values (days)</th><th>Play</th><th>G<sub>b</sub> = Σ(0.5 − y)</th><th>H<sub>b</sub> = Σ0.25</th></tr>
    <tr><td>0 (≤ 77.5)</td><td>65, 70, 70, 70, 75 (D7, D6, D9, D11, D13)</td><td>1, 0, 1, 1, 1</td><td>4(−0.5) + 0.5 = −1.5</td><td>1.25</td></tr>
    <tr><td>1 (77.5–90.5)</td><td>80, 80, 85, 86, 90, 90 (D5, D10, D1, D3, D2, D12)</td><td>1, 1, 0, 1, 0, 1</td><td>4(−0.5) + 2(0.5) = −1.0</td><td>1.50</td></tr>
    <tr><td>2 (&gt; 90.5)</td><td>91, 95, 96 (D14, D8, D4)</td><td>0, 0, 1</td><td>−0.5 + 2(0.5) = +0.5</td><td>0.75</td></tr>
    <tr><th>Total</th><td></td><td></td><td>G = −2.0</td><td>H = 3.5</td></tr>
  </table>
  <p>Only two cuts to try (LightGBM's default λ = 0; parent term G²/H = 4/3.5 = 1.143):</p>
  <table class="tbl">
    <tr><th>Cut after</th><th>G<sub>L</sub>, H<sub>L</sub></th><th>G<sub>L</sub>²/H<sub>L</sub></th><th>G<sub>R</sub>, H<sub>R</sub></th><th>G<sub>R</sub>²/H<sub>R</sub></th><th>Gain</th></tr>
    <tr><td>bucket 0 (≤ 77.5)</td><td>−1.5, 1.25</td><td>1.800</td><td>−0.5, 2.25</td><td>0.111</td><td>0.768</td></tr>
    <tr><td><strong>bucket 1 (≤ 90.5)</strong></td><td>−2.5, 2.75</td><td>2.273</td><td>+0.5, 0.75</td><td>0.333</td><td><strong>1.463</strong></td></tr>
  </table>
  <p>Best cut: HumPct ≤ 90.5. Leaf values (learning rate 1): left −G/H = 2.5/2.75 = 0.909, right −0.5/0.75 = −0.667. The code repeats the hand computation, including the subtraction trick below:</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
hum, temp = df.HumPct.values, df.TempC.values
play = (df.Play == "Yes").astype(int).values
g, h = 0.5 - play, np.full(14, 0.25)              # log loss at p = 0.5
hum_bin = np.digitize(hum, [77.5, 90.5])          # 3 bins: &lt;=77.5, 77.5-90.5, &gt;90.5 (LightGBM's edges for max_bin=4)
temp_bin = np.digitize(temp, [20.5, 24.5])        # 3 bins: 18-20, 21-24, 27-29
def hist(rows, b):                                # sum g and h of the given rows per bin
    return np.bincount(b[rows], g[rows], 3), np.bincount(b[rows], h[rows], 3)
all_rows = np.arange(14)
G, H = hist(all_rows, hum_bin)
print("HumPct histogram  G per bin", G, " H per bin", H)
lam = 0
score = lambda G, H: G**2 / (H + lam)
for k in [1, 2]:                                  # cut after bin k-1: only 2 candidates, not 9
    GL, HL = G[:k].sum(), H[:k].sum()
    gain = score(GL, HL) + score(G.sum() - GL, H.sum() - HL) - score(G.sum(), H.sum())
    print(f"cut after bin {k - 1}: G_L={GL:+.1f} H_L={HL:.2f}  gain={gain:.4f}")
left, right = all_rows[hum &lt; 90.5], all_rows[hum &gt;= 90.5]
Gp, Hp = hist(all_rows, temp_bin)
Gr, Hr = hist(right, temp_bin)                    # build the SMALLER child (3 days) directly
Gl, Hl = Gp - Gr, Hp - Hr                         # bigger child = parent - smaller child
print("TempC hist parent G", Gp, "| right child G", Gr, "| left = parent - right", Gl)
print("left child built directly G", hist(left, temp_bin)[0], " H", hist(left, temp_bin)[1], "vs subtraction H", Hl)</div>
  <div class="fx" data-lang="text">HumPct histogram  G per bin [-1.5 -1.   0.5]  H per bin [1.25 1.5  0.75]
cut after bin 0: G_L=-1.5 H_L=1.25  gain=0.7683
cut after bin 1: G_L=-2.5 H_L=2.75  gain=1.4632
TempC hist parent G [-0.5 -1.5  0. ] | right child G [0.  0.5 0. ] | left = parent - right [-0.5 -2.   0. ]
left child built directly G [-0.5 -2.   0. ]  H [0.75 1.   1.  ] vs subtraction H [0.75 1.   1.  ]</div>
  <p>And LightGBM itself, once with <code>max_bin=4</code> and once with 6:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from play import df
hum = df.HumPct.values.astype(float).reshape(-1, 1)
play = (df.Play == "Yes").astype(int).values
for max_bin in [4, 6]:
    params = {"objective": "binary", "max_bin": max_bin, "min_data_in_bin": 1, "min_data_in_leaf": 1,
              "min_sum_hessian_in_leaf": 0, "num_leaves": 2, "learning_rate": 1.0, "lambda_l2": 0,
              "boost_from_average": False, "verbose": -1}        # start at p = 0.5 like the hand table
    bst = lgb.train(params, lgb.Dataset(hum, label=play, params=params), num_boost_round=1)
    t = bst.trees_to_dataframe()
    print(f"max_bin={max_bin}"); print(t[["node_depth", "threshold", "split_gain", "value", "count"]].to_string(index=False))</div>
  <div class="fx" data-lang="text">max_bin=4
 node_depth  threshold  split_gain     value  count
          1       90.5      1.4632  0.571429     14
          2        NaN         NaN  0.909091     11
          2        NaN         NaN -0.666667      3
max_bin=6
 node_depth  threshold  split_gain     value  count
          1       82.5     2.57143  0.571429     14
          2        NaN         NaN  1.428571      7
          2        NaN         NaN -0.285714      7</div>
  <p>With <code>max_bin=4</code> LightGBM splits at 90.5 with gain 1.4632 and leaves 0.909 and −0.667, exactly the table. But notice what the 3 buckets cost here: the exact best cut, HumPct ≤ 82.5 (the diary's High / Normal line, gain 2.571 with λ = 0), is <em>not</em> a bucket edge, so it cannot be found. With 6 bins it is. On 14 rows, 3 bins are far too coarse; on millions of rows 255 bins almost never miss anything that matters. (No learning rate or λ shrinkage here, because we set both to "off".)</p>
  <h3>The subtraction trick, worked</h3>
  <p>After splitting on humidity, both children need histograms of every <em>other</em> column (here TempC, in three buckets 18–20, 21–24, 27–29) to find their own best split. Building a histogram costs one pass over the child's rows. But every row of the parent is in exactly one child, so</p>
  <p style="text-align:center"><strong>histogram(left) + histogram(right) = histogram(parent)</strong></p>
  <p>The parent's histogram is already known. So build only the <em>smaller</em> child's (right: 3 days, D14, D8, D4) and get the bigger one by subtraction: TempC G per bucket, parent (−0.5, −1.5, 0) minus right (0, 0.5, 0) = left (−0.5, −2.0, 0). The last output line of the first code block confirms that building the left child directly gives the same G and H. The work for the two children is the cost of the smaller one alone, at most half of the rows.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Leaf-wise growth.</b> Cheaper split search makes every split fast. The next question is <em>which</em> leaves to split at all: a level-wise tree spends splits on leaves that barely need them.</div>

  <h2 id="lgb-leaf"><span class="num">03</span>Leaf-wise vs Level-wise Growth</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Histograms make each split cheap. But a tree has a budget of leaves. Level-wise growth spends splits evenly across a level; is that the best use of the budget?</p>
  </div>
  <h3>The idea</h3>
  <p><strong>Level-wise</strong> (depth-wise, XGBoost's default): split every leaf at the current depth, then go one level deeper. <strong>Leaf-wise</strong> (best-first, LightGBM): keep a list of all current leaves with their best possible split gain; always split the single leaf with the largest gain, wherever it is; stop at <code>num_leaves</code> leaves.</p>
  <figure class="viz"><svg viewBox="0 0 640 220" width="640"><g stroke="currentColor"><line x1="150" y1="34" x2="90" y2="84"/><line x1="150" y1="34" x2="210" y2="84"/><line x1="90" y1="84" x2="60" y2="140"/><line x1="90" y1="84" x2="120" y2="140"/><line x1="210" y1="84" x2="180" y2="140"/><line x1="210" y1="84" x2="240" y2="140"/><line x1="460" y1="34" x2="410" y2="84"/><line x1="460" y1="34" x2="520" y2="84"/><line x1="410" y1="84" x2="380" y2="140"/><line x1="410" y1="84" x2="440" y2="140"/><line x1="380" y1="140" x2="355" y2="190"/><line x1="380" y1="140" x2="405" y2="190"/></g><g class="fb sb"><circle cx="150" cy="34" r="13"/><circle cx="90" cy="84" r="13"/><circle cx="210" cy="84" r="13"/></g><g class="fs" stroke="currentColor"><circle cx="60" cy="140" r="10"/><circle cx="120" cy="140" r="10"/><circle cx="180" cy="140" r="10"/><circle cx="240" cy="140" r="10"/></g><text x="150" y="38" text-anchor="middle" font-size="11">1</text><text x="90" y="88" text-anchor="middle" font-size="11">2</text><text x="210" y="88" text-anchor="middle" font-size="11">3</text><text x="232" y="74" class="tr" font-size="11">gain 1.5</text><text x="60" y="74" class="tm" font-size="11">gain 12</text><g class="ft st"><circle cx="460" cy="34" r="13"/><circle cx="410" cy="84" r="13"/><circle cx="380" cy="140" r="13"/></g><g class="fs" stroke="currentColor"><circle cx="520" cy="84" r="10"/><circle cx="440" cy="140" r="10"/><circle cx="355" cy="190" r="10"/><circle cx="405" cy="190" r="10"/></g><text x="460" y="38" text-anchor="middle" font-size="11">1</text><text x="410" y="88" text-anchor="middle" font-size="11">2</text><text x="380" y="144" text-anchor="middle" font-size="11">3</text><text x="534" y="80" class="tm" font-size="10">gain 1.5 (waits)</text><text x="350" y="80" class="tm" font-size="11">gain 12</text><text x="318" y="136" class="tm" font-size="11">gain 6</text><text x="150" y="182" text-anchor="middle" font-size="12">level-wise: splits 1, 2, 3</text><text x="150" y="198" text-anchor="middle" class="tm" font-size="11">total gain 40 + 12 + 1.5 = 53.5</text><text x="480" y="182" text-anchor="start" font-size="12">leaf-wise: 1, 2, then 3</text><text x="480" y="198" text-anchor="start" class="tm" font-size="11">total gain 40 + 12 + 6 = 58</text></svg><figcaption>Both trees use three splits and have four leaves. Level-wise must split node 3 (gain only 1.5) to finish the level. Leaf-wise spends that split on the more useful leaf below node 2 (gain 6).</figcaption></figure>
  <h3>Worked on the diary: who gets the splits?</h3>
  <p>Play from HumPct, TempC, the three Outlook columns and Wind_Strong; g = 0.5 − y, h = 0.25, λ = 0, any leaf size allowed. Gains (library scale, no ½):</p>
  <table class="tbl">
    <tr><th>Step</th><th>Leaves available (best gain if split)</th><th>Level-wise, max_depth = 2</th><th>Leaf-wise, num_leaves = 4</th></tr>
    <tr><td>1</td><td>root: Overcast? (2.857)</td><td>root</td><td>root</td></tr>
    <tr><td>2</td><td>not overcast, 10 days: HumPct &lt; 82.5 (3.6); overcast, 4 days all played (0)</td><td>not-overcast leaf; the overcast leaf has nothing to gain</td><td>not-overcast leaf</td></tr>
    <tr><td>3</td><td>humid non-overcast (5 days): HumPct &lt; 95.5 (3.2); dry non-overcast (5 days): TempC &lt; 19 (3.2); overcast (0)</td><td>stop: depth 2 reached, 3 leaves</td><td>splits a depth-2 leaf (3.2): 4 leaves, depth 3</td></tr>
    <tr><td>Total gain</td><td></td><td>6.457</td><td>9.657</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, xgboost as xgb, lightgbm as lgb
from play import df
X = pd.concat([df[["HumPct", "TempC"]], pd.get_dummies(df[["Outlook"]]).astype(int),
               (df.Wind == "Strong").astype(int).rename("Wind_Strong")], axis=1)
y = (df.Play == "Yes").astype(int)
common = dict(base_score=0.5, learning_rate=1.0, reg_lambda=0, min_child_weight=0, n_estimators=1, tree_method="exact")
lw = dict(objective="binary", num_leaves=4, learning_rate=1.0, lambda_l2=0, min_data_in_leaf=1, min_data_in_bin=1,
          min_sum_hessian_in_leaf=0, boost_from_average=False, verbose=-1)
x_level = xgb.XGBClassifier(max_depth=2, **common).fit(X, y)
l_leaf = lgb.train(lw, lgb.Dataset(X, label=y, params=lw), num_boost_round=1)
t = x_level.get_booster().trees_to_dataframe()
print("level-wise (XGBoost, max_depth=2):")
print(t[t.Feature != "Leaf"][["ID", "Feature", "Split", "Gain"]].to_string(index=False), "| leaves:", (t.Feature == "Leaf").sum())
t = l_leaf.trees_to_dataframe()
print("leaf-wise (LightGBM, num_leaves=4):")
print(t[t.split_feature.notna()][["node_depth", "split_feature", "threshold", "split_gain", "count"]].to_string(index=False),
      "| leaves:", t.split_feature.isna().sum())</div>
  <div class="fx" data-lang="text">level-wise (XGBoost, max_depth=2):
 ID          Feature  Split      Gain
0-0 Outlook_Overcast    1.0  2.857143
0-1           HumPct   83.0       3.6 | leaves: 3
leaf-wise (LightGBM, num_leaves=4):
 node_depth    split_feature    threshold  split_gain  count
          1 Outlook_Overcast 1.000000e-35     2.85714     14
          2           HumPct 8.250000e+01     3.60000     10
          3           HumPct 9.550000e+01     3.20000      5 | leaves: 4</div>
  <p>Both libraries agree with the table. XGBoost's level-wise tree (max_depth 2) uses only 3 of a possible 4 leaves, because the overcast branch is already pure and depth 2 forbids going further down the other side. LightGBM's leaf-wise tree spends its fourth leaf where gain remains: it separates D4 (96%, played) from the other humid non-overcast days, at depth 3. (The thresholds look odd: LightGBM splits a 0/1 column at a tiny number, 1e-35, i.e. 0 left and 1 right; XGBoost prints 83.0 for a cut that separates 80 from 85.) For the same number of leaves, leaf-wise always reaches a loss at least as low, because every split is the best available one. The price: trees become deep and lopsided, and a deep branch on a few rows can be fitting noise (here, one day).</p>
  <h3>Measured: the growth order alone</h3>
  <p>At scale: to isolate the effect, use one library (XGBoost) with the two growth policies at the same leaf budget, then LightGBM, on the 20,000-row churn data of this family (300 trees, learning rate 0.1, no early stopping):</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Controlling tree size.</b> Leaf-wise trees are powerful but can go too deep, as the one-day leaf above shows. Which knobs hold them back, and what happens when we do not use them?</div>

  <h2 id="lgb-size"><span class="num">04</span>Controlling Tree Size</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Leaf-wise growth happily builds a 3-level branch for one diary day. Which knobs stop it from memorising, and which one is the real brake?</p>
  </div>
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
  <p>The diary shows the brake at its most extreme:</p>
<div class="fx" data-lang="py">import pandas as pd, lightgbm as lgb
from play import df
X = pd.concat([df[["HumPct", "TempC"]], pd.get_dummies(df[["Outlook", "Wind"]]).astype(int)], axis=1)
y = (df.Play == "Yes").astype(int)
for kw in [{}, {"min_child_samples": 2}]:
    m = lgb.LGBMClassifier(n_estimators=50, verbose=-1, **kw).fit(X, y)
    leaves = [t["num_leaves"] for t in m.booster_.dump_model()["tree_info"]]
    print(f"{str(kw) or 'defaults':25s} leaves per tree (first 5): {leaves[:5]}   training days right: {int((m.predict(X) == y).sum())}/14")</div>
  <div class="fx" data-lang="text">{}                        leaves per tree (first 5): [1]   training days right: 9/14
{'min_child_samples': 2}  leaves per tree (first 5): [5, 5, 5, 5, 5]   training days right: 14/14</div>
  <p>With the defaults, every leaf needs 20 rows and the diary has 14, so no split is ever allowed: LightGBM builds one single-leaf tree (it logs "No further splits with positive gain" when not silenced) and predicts "Play" for every day, 9 of 14 right. Allow leaves of 2 days and 50 trees of 5 leaves memorise all 14. The same brake decides everything on small data.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: GOSS.</b> Histograms and leaf-wise growth make each tree cheaper per row. The remaining cost is that every tree still looks at every row. Can we look at fewer rows without biasing the gains?</div>

  <h2 id="lgb-goss"><span class="num">05</span>GOSS: Gradient-based One-Side Sampling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every tree still visits every row to build its histograms. Rows the model already predicts well carry almost no information. Can we skip most of them without biasing the split gains?</p>
  </div>
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
  <h3>Worked: the diary's turnout</h3>
  <p>Regression on Turnout, at the start of round 2 of <a class="xref" data-note="ml_boosting">How Boosting Works</a>: after the first stump ("Humidity high?": 28 for humid days, 40 for the others), with squared error g = F − y and h = 1. The g's are very uneven: D6 (+18, a dry day with only 22 players), D12 (−10), D3 and D13 (−8) are far off, D9 (0) exactly right. A candidate split sends the 6 windy days left; its true G<sub>L</sub> is +24. GOSS with a = b = 3/14: keep the 3 days with the largest |g| (D6, D12, D3), sample 3 of the other 11, and weight each sampled day by (1 − a)/b = (11/14)/(3/14) = 11/3 = 3.667. The code averages 100,000 random samples and compares with (1) forgetting the reweighting and (2) uniform sampling of the same number of days (6):</p>
  <div class="fx" data-lang="py">import numpy as np
from play import df
F1 = np.where(df.Humidity == "High", 28.0, 40.0)  # the team after round 1 (stump "Humidity high?")
g = F1 - df.Turnout.values                        # squared error: g = F - y, h = 1
left = (df.Wind == "Strong").values               # one candidate split for round 2: windy days left
print("g per day:", " ".join(f"{d}:{v:+.2f}" for d, v in zip(df.index, g)))
print(f"true G_left = {g[left].sum():+.2f}")
n, a_n, b_n = 14, 3, 3                            # keep the top 3 |g| (a = 3/14), sample 3 of the other 11 (b = 3/14)
top = np.argsort(-np.abs(g))[:a_n]
rest = np.setdiff1d(np.arange(n), top)
w = (n - a_n) / b_n                               # (1 - a) / b = 11/3
print("top days:", list(df.index[top]), f" weight for sampled days: {w:.3f}")
rng = np.random.default_rng(0)
goss, noweight, uniform = [], [], []
for _ in range(100_000):
    s = rng.choice(rest, b_n, replace=False)
    goss.append(g[top][left[top]].sum() + w * g[s][left[s]].sum())
    noweight.append(g[top][left[top]].sum() + g[s][left[s]].sum())
    u = rng.choice(n, a_n + b_n, replace=False)   # uniform sampling of the same 6 days
    uniform.append(n / (a_n + b_n) * g[u][left[u]].sum())
for name, est in [("GOSS estimate:", goss), ("GOSS, no reweighting:", noweight), ("uniform 6 of 14:", uniform)]:
    print(f"{name:22s} mean {np.mean(est):+.2f}  sd {np.std(est):.2f}")</div>
  <div class="fx" data-lang="text">g per day: D1:+4.00 D2:+8.00 D3:-8.00 D4:-4.00 D5:-4.00 D6:+18.00 D7:-2.00 D8:+2.00 D9:+0.00 D10:-6.00 D11:+2.00 D12:-10.00 D13:-8.00 D14:+8.00
true G_left = +24.00
top days: ['D6', 'D12', 'D3']  weight for sampled days: 3.667
GOSS estimate:         mean +23.94  sd 18.19
GOSS, no reweighting:  mean +12.35  sd 4.96
uniform 6 of 14:       mean +23.91  sd 27.27</div>
  <p>GOSS: mean +23.94, the truth up to simulation noise, with spread 18.2. Without the reweighting the estimate is badly biased (+12.35): the 11 smaller-gradient days are under-counted 3.7 times. Uniform sampling of 6 days is also unbiased, but its spread is 27.3, 1.5× larger, because it often misses D6, the single day that carries the most signal. That is the whole point of GOSS: same budget, more reliable gains, as long as the gradients are uneven. (On the very first round, when every residual is between 2 and 14 in size, GOSS has much less of an edge; LightGBM therefore starts sampling only after the first rounds.)</p>
  <h3>At scale: the churn data</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: EFB.</b> GOSS cuts the rows. On wide sparse data (thousands of one-hot or click columns) the other factor, columns, dominates. Most of those columns are zero in almost every row.</div>

  <h2 id="lgb-efb"><span class="num">06</span>EFB: Exclusive Feature Bundling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One-hot encoding turns one categorical column into many columns that are almost always zero. Each needs its own histogram. Can columns that are never non-zero together share one?</p>
  </div>
  <h3>The idea</h3>
  <p>One-hot columns of one category ("city = Pune", "city = Delhi", …) are never non-zero in the same row: they are <strong>mutually exclusive</strong>. Many sparse columns in practice are nearly so. Exclusive columns can be packed into a single column without losing information, as long as each original column gets its own range of bin numbers. Fewer columns means fewer histograms to build and scan.</p>
  <h3>Step 1: which columns can share a bundle?</h3>
  <p>Count <strong>conflicts</strong>: the rows where two columns are both non-zero. Build a graph with a node per column and edges weighted by conflicts. Bundling with no conflicts is graph colouring (each bundle is one colour), which is NP-hard, so LightGBM uses a greedy rule: take columns in order of how many conflicts they have, and put each into the first bundle where it would add no more than K conflicts (<code>max_conflict_rate</code>, default 0); otherwise start a new bundle.</p>
  <h3>Step 2: merge with offsets</h3>
  <p>Inside a bundle, shift each column's bins past the previous column's range, so the merged value tells you which original column it came from.</p>
  <h3>Worked: the diary's one-hot columns</h3>
  <p>One-hot encode Outlook into Overcast, Rain, Sunny, and add Wind_Strong. Count conflicts (days where two columns are both 1), then bundle greedily:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
X = pd.get_dummies(df[["Outlook"]]).astype(int)                     # three one-hot columns
X["Wind_Strong"] = (df.Wind == "Strong").astype(int)
X.columns = ["Overcast", "Rain", "Sunny", "Strong"]
nz = X.values != 0
conflicts = nz.T.astype(int) @ nz.astype(int)                         # days where two columns are both non-zero
np.fill_diagonal(conflicts, 0)
print("conflict counts\\n", pd.DataFrame(conflicts, index=X.columns, columns=X.columns).to_string())
bundles = []                                                          # greedy: first bundle with 0 conflicts
for c in X.columns[np.argsort(-conflicts.sum(1), kind="stable")]:
    for b in bundles:
        if all(conflicts[X.columns.get_loc(c), X.columns.get_loc(o)] == 0 for o in b):
            b.append(c); break
    else:
        bundles.append([c])
print("bundles:", bundles)
b = [bb for bb in bundles if len(bb) &gt; 1][0]
merged, offset = np.zeros(14, int), 0
for c in b:                                                          # each column gets its own bin range
    merged += np.where(X[c] &gt; 0, X[c] + offset, 0); offset += X[c].max()
print("bundle", "+".join(b), "per day:", " ".join(f"{d}:{v}" for d, v in zip(df.index, merged)))
print(pd.crosstab(df.Outlook, merged, colnames=["bundle value"]).to_string())</div>
  <div class="fx" data-lang="text">conflict counts
           Overcast  Rain  Sunny  Strong
Overcast         0     0      0       2
Rain             0     0      0       2
Sunny            0     0      0       2
Strong           2     2      2       0
bundles: [['Strong'], ['Overcast', 'Rain', 'Sunny']]
bundle Overcast+Rain+Sunny per day: D1:3 D2:3 D3:1 D4:2 D5:2 D6:2 D7:1 D8:3 D9:3 D10:2 D11:3 D12:1 D13:1 D14:2
bundle value  1  2  3
Outlook              
Overcast      4  0  0
Rain          0  5  0
Sunny         0  0  5</div>
  <p>Overcast, Rain and Sunny never clash (a day has one outlook), but Wind_Strong clashes with each of them twice (a windy overcast day, a windy rainy day, a windy sunny day). So Wind_Strong stays alone and the three Outlook columns form one bundle. Overcast uses bin 1; Rain's bin 1 becomes 2 (offset 1); Sunny's bin 1 becomes 3 (offset 2). The bundle is exactly the original Outlook column coded 1, 2, 3: EFB has undone the one-hot encoding. A split "bundle ≤ 1" is the same as "Overcast = 1"; "bundle = 3" means "Sunny = 1". Four columns became two.</p>
  <h3>At scale: timing on wide one-hot data</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Native categorical splits.</b> Better than bundling one-hot columns is not creating them at all. Can LightGBM split a categorical column directly into two groups of categories?</div>

  <h2 id="lgb-cat"><span class="num">07</span>Native Categorical Splits</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One-hot columns only allow "one category versus the rest" splits, and integer codes impose a fake order. How can a tree split a category column into any two groups, without trying all 2<sup>k−1</sup> − 1 of them?</p>
  </div>
  <h3>The problem</h3>
  <p>A category with k values can be split into two groups in 2<sup>k−1</sup> − 1 ways: 15 ways for k = 5, about 5 × 10<sup>29</sup> for k = 100. One-hot only allows the k "one vs rest" splits, which wastes depth: to group 30 high-churn cities together a one-hot tree needs 30 splits.</p>
  <h3>The trick: sort, then scan</h3>
  <p>Fisher (1958) showed that for squared error (and for binary classification) the best two-group split is always a cut in the list of categories <em>sorted by their mean target</em>. With gradients, "mean target" becomes "mean gradient": LightGBM sorts the categories by G<sub>c</sub>/(H<sub>c</sub> + <code>cat_smooth</code>) and scans the k − 1 cuts of that sorted list with the usual gain formula. Cost: one sort, k − 1 evaluations.</p>
  <h3>Worked: six kinds of weather, turnout</h3>
  <p>Combine Outlook and Wind into one category column with 6 values (Overcast-Strong, …, Sunny-Weak; codes 0–5 alphabetically) and predict Turnout. First guess = mean turnout 34, so g = 34 − y and h = 1; each category's G<sub>c</sub> = count × 34 − (sum of its turnouts). Sort the categories by mean (equivalently by −G/H), then scan the 5 cuts of the sorted list (λ = 0, parent term 0 because G = 0):</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
from play import df
d = pd.DataFrame({"weather": (df.Outlook + "-" + df.Wind).values, "turnout": df.Turnout.values})
d["weather"] = d["weather"].astype("category")            # 6 categories, codes in alphabetical order
print(dict(enumerate(d["weather"].cat.categories)))
s = d.groupby("weather", observed=True)["turnout"].agg(["sum", "count", "mean"])
s["G"] = s["count"] * d.turnout.mean() - s["sum"]         # g = mean - y, h = 1
s = s.sort_values("mean"); print(s.round(2).to_string())
G, H = s["G"].values, s["count"].values.astype(float)       # sorted by mean gradient, scan the 5 cuts
for k in range(1, 6):
    gain = G[:k].sum() ** 2 / H[:k].sum() + G[k:].sum() ** 2 / H[k:].sum() - G.sum() ** 2 / H.sum()
    print(f"left = {list(s.index[:k])}: gain {gain:.2f}")
params = {"objective": "regression", "num_leaves": 2, "learning_rate": 1.0, "lambda_l2": 0,
          "min_data_in_leaf": 1, "min_data_in_bin": 1, "min_data_per_group": 1,
          "cat_smooth": 0, "cat_l2": 0, "max_cat_to_onehot": 4, "verbose": -1}
bst = lgb.train(params, lgb.Dataset(d[["weather"]], label=d["turnout"], params=params), num_boost_round=1)
t = bst.trees_to_dataframe()
print(t[["node_depth", "decision_type", "threshold", "split_gain", "value", "count"]].to_string(index=False))</div>
  <div class="fx" data-lang="text">{0: 'Overcast-Strong', 1: 'Overcast-Weak', 2: 'Rain-Strong', 3: 'Rain-Weak', 4: 'Sunny-Strong', 5: 'Sunny-Weak'}
                 sum  count   mean     G
weather                                 
Rain-Strong       42      2  21.00  26.0
Sunny-Strong      58      2  29.00  10.0
Sunny-Weak        90      3  30.00  12.0
Overcast-Strong   80      2  40.00 -12.0
Rain-Weak        122      3  40.67 -20.0
Overcast-Weak     84      2  42.00 -16.0
left = ['Rain-Strong']: gain 394.33
left = ['Rain-Strong', 'Sunny-Strong']: gain 453.60
left = ['Rain-Strong', 'Sunny-Strong', 'Sunny-Weak']: gain 658.29
left = ['Rain-Strong', 'Sunny-Strong', 'Sunny-Weak', 'Overcast-Strong']: gain 403.20
left = ['Rain-Strong', 'Sunny-Strong', 'Sunny-Weak', 'Overcast-Strong', 'Rain-Weak']: gain 149.33
 node_depth decision_type threshold  split_gain     value  count
          1            ==   0||1||3  658.286011 34.000000     14
          2           NaN       NaN         NaN 40.857143      7
          2           NaN       NaN         NaN 27.142857      7</div>
  <p>By hand for the best cut: the three low-turnout groups {Rain-Strong, Sunny-Strong, Sunny-Weak} have G = 26 + 10 + 12 = 48 over H = 7 days, the other three G = −48 over 7: gain = 48²/7 + 48²/7 = 329.1 + 329.1 = 658.3. Leaf values: 34 − 48/7 = 27.14 (windy rain and all sunny days) and 34 + 48/7 = 40.86 (overcast days and calm rain). LightGBM sends the high group left: <code>decision_type ==</code> with <code>threshold 0||1||3</code> means "category code in {0, 1, 3} goes left" (Overcast-Strong, Overcast-Weak, Rain-Weak), gain 658.29. Codes 0, 1, 3 skip code 2 (Rain-Strong), so no single cut on label-encoded integers could find this split: rainy days belong on both sides depending on the wind. (We switched off the smoothing knobs so the numbers are exact; the defaults add <code>cat_smooth=10</code> and <code>cat_l2=10</code>, and <code>min_data_per_group=100</code> would forbid any categorical split on 14 rows.)</p>
  <h3>At scale: a real categorical churn table</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Parameters.</b> We have met the five ideas. In practice you work through parameters, and LightGBM has many, with several names each.</div>

  <h2 id="lgb-params"><span class="num">08</span>Parameters</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every idea above has knobs, and LightGBM accepts several names for most of them. Which parameters matter, what are the defaults, and where do the names trip people up?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Speed comparison.</b> All these tricks are claimed to make LightGBM fast. How fast, measured against its relatives on a larger dataset?</div>

  <h2 id="lgb-speed"><span class="num">09</span>Speed Comparison</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The diary is far too small to time anything. On 150,000 rows, how much faster is LightGBM than XGBoost and sklearn, and does it give up any accuracy?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Code.</b> We know what LightGBM does and how fast it is. What does a complete, correct training script look like?</div>

  <h2 id="lgb-api"><span class="num">10</span>Code: Native &amp; sklearn API</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know the ideas and the knobs. What does a complete training run look like, with early stopping, cross-validation, importance and saving, in both APIs?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Compared with its family.</b> LightGBM is one of three industrial boosters plus sklearn's own. Where exactly does it differ from them?</div>

  <h2 id="lgb-cmp"><span class="num">11</span>Compared With Its Family</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>LightGBM, XGBoost, CatBoost and sklearn's HistGradientBoosting share the same maths. What actually differs between them, and when does each win?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have met histograms, leaf-wise growth, size brakes, GOSS, EFB and categorical sorting. How do they fit together?</div>

    <h2 id="lgb-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Histograms, subtraction, leaf-wise growth, min_data_in_leaf, GOSS, EFB, categorical sorting: five unrelated tricks, or one plan?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 320" width="680">
<defs><marker id="lgb-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="190" y="8" width="300" height="46" rx="7" class="fg sg" stroke-width="2"/><text x="340" y="27" text-anchor="middle" font-size="12" font-weight="700">XGBoost's gain from G, H (unchanged)</text><text x="340" y="44" text-anchor="middle" class="tm" font-size="10">cost ≈ rows × columns + columns × cut-offs</text>
<line x1="230" y1="54" x2="80" y2="90" stroke="currentColor" marker-end="url(#lgb-c9)"/><line x1="290" y1="54" x2="215" y2="90" stroke="currentColor" marker-end="url(#lgb-c9)"/><line x1="340" y1="54" x2="350" y2="90" stroke="currentColor" marker-end="url(#lgb-c9)"/><line x1="390" y1="54" x2="485" y2="90" stroke="currentColor" marker-end="url(#lgb-c9)"/><line x1="450" y1="54" x2="610" y2="90" stroke="currentColor" marker-end="url(#lgb-c9)"/>
<rect x="10" y="92" width="130" height="58" rx="7" class="fb sb"/><text x="75" y="111" text-anchor="middle" font-size="11" font-weight="700">histograms</text><text x="75" y="127" text-anchor="middle" class="tm" font-size="9.5">fewer cut-offs</text><text x="75" y="141" text-anchor="middle" class="tm" font-size="9.5">humidity: 2 not 9</text>
<rect x="150" y="92" width="130" height="58" rx="7" class="fb sb"/><text x="215" y="111" text-anchor="middle" font-size="11" font-weight="700">leaf-wise</text><text x="215" y="127" text-anchor="middle" class="tm" font-size="9.5">best use of leaves</text><text x="215" y="141" text-anchor="middle" class="tm" font-size="9.5">9.657 vs 6.457</text>
<rect x="290" y="92" width="120" height="58" rx="7" class="fb sb"/><text x="350" y="111" text-anchor="middle" font-size="11" font-weight="700">GOSS</text><text x="350" y="127" text-anchor="middle" class="tm" font-size="9.5">fewer rows</text><text x="350" y="141" text-anchor="middle" class="tm" font-size="9.5">sd 18.2 vs 27.3</text>
<rect x="420" y="92" width="130" height="58" rx="7" class="fb sb"/><text x="485" y="111" text-anchor="middle" font-size="11" font-weight="700">EFB</text><text x="485" y="127" text-anchor="middle" class="tm" font-size="9.5">fewer columns</text><text x="485" y="141" text-anchor="middle" class="tm" font-size="9.5">3 Outlook cols → 1</text>
<rect x="560" y="92" width="110" height="58" rx="7" class="fb sb"/><text x="615" y="111" text-anchor="middle" font-size="11" font-weight="700">categorical</text><text x="615" y="127" text-anchor="middle" class="tm" font-size="9.5">no one-hot</text><text x="615" y="141" text-anchor="middle" class="tm" font-size="9.5">{0, 1, 3}: 658.29</text>
<line x1="75" y1="150" x2="75" y2="182" stroke="currentColor" marker-end="url(#lgb-c9)"/><line x1="215" y1="150" x2="215" y2="182" stroke="currentColor" marker-end="url(#lgb-c9)"/><line x1="615" y1="150" x2="560" y2="182" stroke="currentColor" marker-end="url(#lgb-c9)"/>
<rect x="10" y="184" width="130" height="46" rx="7" class="ft st"/><text x="75" y="203" text-anchor="middle" font-size="11" font-weight="700">subtraction</text><text x="75" y="219" text-anchor="middle" class="tm" font-size="9.5">big child = parent − small</text>
<rect x="150" y="184" width="200" height="46" rx="7" class="fr sr"/><text x="250" y="203" text-anchor="middle" font-size="11" font-weight="700">risk: deep trees memorise</text><text x="250" y="219" text-anchor="middle" class="tm" font-size="9.5">brake: min_data_in_leaf (20 &gt; 14 days)</text>
<rect x="430" y="184" width="240" height="46" rx="7" class="fr sr"/><text x="550" y="203" text-anchor="middle" font-size="11" font-weight="700">risk: gradient sort leaks labels</text><text x="550" y="219" text-anchor="middle" class="tm" font-size="9.5">brake: cat_smooth, min_data_per_group → CatBoost</text>
<rect x="150" y="252" width="380" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="340" y="277" text-anchor="middle" font-size="11">same accuracy as XGBoost, several times faster on large, wide data</text>
<line x1="250" y1="230" x2="300" y2="250" stroke="currentColor" marker-end="url(#lgb-c9)"/><line x1="550" y1="230" x2="420" y2="250" stroke="currentColor" marker-end="url(#lgb-c9)"/>
</svg><figcaption>LightGBM keeps XGBoost's gain and attacks each factor of its cost: cut-offs (histograms, subtraction), wasted splits (leaf-wise), rows (GOSS), columns (EFB) and one-hot blow-up (categorical sorting). Two of the tricks create risks that need brakes: leaf-wise depth and label-driven category sorting.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same 14 diary days</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the diary</th><th>When to use / watch</th></tr>
    <tr><td>Split cost</td><td>rows × columns + columns × cuts</td><td>where does time go?</td><td>9 humidity cut-offs per node</td><td>matters at millions of rows</td></tr>
    <tr><td>Histogram</td><td>G, H summed per bin</td><td>scan fewer cut-offs?</td><td>3 bins: gain 1.463 at 90.5; 6 bins find 82.5 (2.571)</td><td>max_bin 255 default; raise for exact thresholds</td></tr>
    <tr><td>Subtraction</td><td>parent = left + right</td><td>children cheaper?</td><td>TempC: (−0.5, −1.5, 0) − (0, 0.5, 0)</td><td>always on</td></tr>
    <tr><td>Leaf-wise growth</td><td>split the largest-gain leaf</td><td>best use of a leaf budget?</td><td>4 leaves: 9.657 vs level-wise 6.457</td><td>num_leaves &lt; 2^max_depth</td></tr>
    <tr><td>min_data_in_leaf</td><td>rows per leaf</td><td>stop memorising?</td><td>default 20 &gt; 14: no split at all</td><td>main brake on small data</td></tr>
    <tr><td>GOSS</td><td>top |g| + reweighted sample</td><td>fewer rows, unbiased?</td><td>G_L +23.94 (true +24), sd 18.2 vs 27.3</td><td>millions of rows</td></tr>
    <tr><td>EFB</td><td>conflict graph + offsets</td><td>fewer columns?</td><td>3 Outlook one-hots → 1 bundle; Wind alone</td><td>wide sparse data</td></tr>
    <tr><td>Categorical sort</td><td>sort by G/H, scan k − 1 cuts</td><td>split a category without one-hot?</td><td>{0, 1, 3} vs {2, 4, 5}: 658.29</td><td>medium cardinality; smooth rare values</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>LightGBM computes exactly XGBoost's gain, but on histograms of a sample of rows and bundles of columns, and spends each split on the leaf that gains most.</strong> Every trick cuts one factor of the split-search cost; the price is a model that can grow deep on small data and a categorical sort that can leak labels, which is where min_data_in_leaf and, next, <a class="xref" data-note="ml_catboost">CatBoost</a> come in.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> Knowing how the parts fit, which mistakes do people actually make with LightGBM?</div>

<h2 id="lgb-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know what LightGBM does and why. Which mistakes cost people the most in practice?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Revision sheet.</b> The whole note on one page, for revising.</div>

    <h2 id="lgb-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: the captain's cricket diary, 14 days (Play 9/5, HumPct, TempC, Outlook, Wind, Turnout). Log-loss at p = 0.5: g = 0.5 − y, h = 0.25; squared error on turnout: g = F − y, h = 1. LightGBM's default λ = 0.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on the diary</th><th>Weakness → next</th></tr>
    <tr><td>Split cost</td><td>where does time go?</td><td>rows × columns + columns × cuts</td><td>too many cuts</td></tr>
    <tr><td>Histograms</td><td>fewer cuts?</td><td>3 bins → 2 cuts; best 90.5 (1.463); 6 bins find 82.5</td><td>which leaves to split?</td></tr>
    <tr><td>Leaf-wise</td><td>best use of leaves?</td><td>4 leaves: +3.2 on a depth-2 leaf; total 9.657 vs 6.457</td><td>deep trees memorise</td></tr>
    <tr><td>Size brakes</td><td>what stops it?</td><td>min_data_in_leaf 20: no split on 14 days</td><td>still all rows per tree</td></tr>
    <tr><td>GOSS</td><td>fewer rows?</td><td>unbiased +23.94, sd 18.2 vs 27.3</td><td>many sparse columns</td></tr>
    <tr><td>EFB</td><td>fewer columns?</td><td>Outlook one-hots → one bundle</td><td>one-hot itself</td></tr>
    <tr><td>Categorical</td><td>split categories directly?</td><td>{Overcast ×2, Rain-Weak} vs rest, gain 658.29</td><td>leaks labels on rare values → CatBoost</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th><th>Diary value</th></tr>
    <tr><td>Gain (library)</td><td>G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ)</td><td>no ½; λ = 0 default</td><td>1.463 (3 bins)</td></tr>
    <tr><td>Leaf value</td><td>−G/(H + λ) × learning rate</td><td>—</td><td>0.909, −0.667</td></tr>
    <tr><td>Bin histogram</td><td>G_b = Σ_{i in bin b} gᵢ, H_b = Σ hᵢ</td><td>b bin index</td><td>(−1.5, −1.0, +0.5)</td></tr>
    <tr><td>Subtraction</td><td>hist(large child) = hist(parent) − hist(small child)</td><td>—</td><td>(−0.5, −2.0, 0)</td></tr>
    <tr><td>GOSS weight</td><td>(1 − a)/b</td><td>a top share, b sampled share</td><td>(11/14)/(3/14) = 3.667</td></tr>
    <tr><td>EFB offset</td><td>bin of column k + Σ (bins of earlier columns in the bundle)</td><td>—</td><td>Overcast 1, Rain 2, Sunny 3</td></tr>
    <tr><td>Category order</td><td>sort by G_c/(H_c + cat_smooth)</td><td>scan k − 1 cuts</td><td>6 categories → 5 cuts</td></tr>
    <tr><td>Size</td><td>num_leaves &lt; 2^max_depth</td><td>leaf-wise depth unbounded otherwise</td><td>—</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use LightGBM</b><p>Large or wide tabular data where training time matters; many one-hot / sparse columns; medium-cardinality categoricals.</p><small>lr 0.05, ES 100, 31 leaves, min 20 rows</small></div>
    <div><b>Careful on small data</b><p>Leaf-wise trees memorise; raise min_data_in_leaf, cap max_depth, add bagging and path_smooth.</p><small>Or CatBoost / random forest</small></div>
    <div><b>High-cardinality categories</b><p>Gradient-sorted splits overfit rare values.</p><small>cat_smooth, min_data_per_group, or CatBoost</small></div>
    <div><b>Need exact thresholds</b><p>Coarse bins can miss them (3 bins missed 82.5 on the diary).</p><small>max_bin / max_bin_by_feature</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>num_leaves too large on small data; subsample without subsample_freq (does nothing); category codes that change between train and predict; high-cardinality native categoricals; porting XGBoost settings 1:1 (λ 0 vs 1, rows vs Hessian); non-deterministic threads; early stopping on the test set.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Parent histogram (−0.5, −1.5, 0), small child (0, 0.5, 0). Large child?</td><td>(−0.5, −2.0, 0)</td></tr>
    <tr><td>a = 0.2, b = 0.1. GOSS weight?</td><td>(1 − 0.2)/0.1 = 8</td></tr>
    <tr><td>Why did LightGBM with defaults not split the diary at all?</td><td>min_data_in_leaf = 20 &gt; 14 rows</td></tr>
    <tr><td>Which columns can EFB bundle?</td><td>Those (almost) never non-zero in the same row, e.g. one-hots of one category</td></tr>
    <tr><td>How many cuts does LightGBM scan for a 6-value category?</td><td>5, after sorting by mean gradient</td></tr>
  </table>

<h2 id="lgb-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What are LightGBM's main ideas, and which cost does each reduce?</summary><div class="qa-body">Histograms (fewer candidate cuts, less memory), leaf-wise growth (more loss reduction per leaf), GOSS (fewer rows per tree), EFB (fewer columns), native categorical splits (no one-hot explosion). Split-search cost ≈ rows × columns + columns × bins; each idea cuts one factor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the histogram subtraction trick.</summary><div class="qa-body">Every parent row is in exactly one child, so hist(parent) = hist(left) + hist(right). Build the smaller child's histogram directly and compute the larger one as parent − smaller. The children together then cost as much as the smaller child alone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Leaf-wise vs level-wise growth: trade-off?</summary><div class="qa-body">Leaf-wise always splits the leaf with the largest gain, so for a fixed number of leaves it reaches lower training loss. But trees become deep and unbalanced, which overfits small data. Control with num_leaves, min_data_in_leaf, max_depth.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should num_leaves relate to max_depth?</summary><div class="qa-body">A depth-d tree has at most 2<sup>d</sup> leaves, so keep num_leaves below 2<sup>max_depth</sup> (e.g. depth 7 → 70–100 leaves). num_leaves = 2<sup>d</sup> with leaf-wise growth is much more flexible than a depth-d level-wise tree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Describe GOSS and why it reweights.</summary><div class="qa-body">Keep the top a fraction of rows by |g|, sample b·n of the rest, multiply the sampled rows' g and h by (1−a)/b. The rest has (1−a)n rows of which we keep bn, so the weight makes the gradient sums unbiased; without it, the well-fitted rows would be under-counted and the split gains biased.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is GOSS better than uniform subsampling at the same budget?</summary><div class="qa-body">The rows with large |g| dominate the gain. Uniform sampling often drops them, so the estimated gain has high variance. GOSS always keeps them and only samples the low-information rows. On the diary's turnout gradients: same mean, standard deviation 18.2 vs 27.3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is EFB and why is it allowed?</summary><div class="qa-body">Features that are (almost) never non-zero in the same row are merged into one feature, with their bin ranges offset so the original feature can be recovered from the merged bin. Splits on the bundle are equivalent to splits on the originals. Optimal bundling is graph colouring (NP-hard), so a greedy method with a conflict tolerance is used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does LightGBM split a categorical feature with k values?</summary><div class="qa-body">Sort categories by G/(H + cat_smooth) (mean gradient), then evaluate only the k−1 cuts in that order. For squared error, Fisher (1958) proved the best binary partition is one of these cuts, so k−1 evaluations replace 2<sup>k−1</sup>−1. With ≤ max_cat_to_onehot (4) categories it uses one-vs-rest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your LightGBM model overfits a 3,000-row dataset. What do you change?</summary><div class="qa-body">Lower num_leaves (7–31), raise min_data_in_leaf (30–100), set max_depth (4–6), add feature_fraction and bagging (with bagging_freq=1), add lambda_l2 and path_smooth, use early stopping with a lower learning rate. Also compare with CatBoost or a random forest, which are safer on small data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name two default values that differ between XGBoost and LightGBM and why it matters.</summary><div class="qa-body">L2 on leaves: XGBoost λ = 1, LightGBM 0. Size: XGBoost max_depth 6 (level-wise), LightGBM num_leaves 31 with no depth limit. Also learning rate 0.3 vs 0.1 and min_child_weight (Hessian) vs min_child_samples (rows). Copying settings across libraries changes the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: which LightGBM ideas did XGBoost and sklearn adopt?</summary><div class="qa-body">XGBoost: tree_method="hist" (default since 2.0) and grow_policy="lossguide" with max_leaves, plus native categorical support. sklearn: HistGradientBoostingClassifier/Regressor, a LightGBM-style histogram, leaf-wise booster with native missing values and categoricals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what problem does CatBoost solve that LightGBM's categorical handling does not?</summary><div class="qa-body">LightGBM sorts categories by the same training rows' gradients, so a rare category's statistic includes its own labels: a form of target leakage that overfits high-cardinality columns. CatBoost computes category statistics with ordered target statistics (only "earlier" rows in a random order) and also uses ordered boosting to remove the same bias from the gradients.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: GOSS samples rows, Random Forest samples rows. What is different in purpose?</summary><div class="qa-body">Random Forest's bootstrap creates diversity among independent trees to reduce variance. GOSS is about speed: it keeps the rows that matter most for the current gradient step and reweights the others so the split gains stay unbiased; it is not meant to make trees different.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: LightGBM changes how splits are found. Why do its trees still come out the same as XGBoost's on the diary when the bins are fine enough?</summary><div class="qa-body">Because the quantity being maximised is identical: G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ) with the same g and h. Histograms only restrict which cut-offs are candidates. With 6 bins the diary's best humidity cut (82.5) is a bin edge and both libraries find it; with 3 bins it is not, and LightGBM settles for 90.5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if GOSS samples the small-gradient rows but skips the (1 − a)/b reweighting?</summary><div class="qa-body">The gradient sums become biased toward the large-gradient rows, so split gains are wrong systematically, not just noisily. On the diary's round-2 turnout gradients the estimate of G_L drops from +24 (true) to about +12.4 on average: the sampled smaller-|g| days are under-counted 3.7 times.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does leaf-wise growth make min_data_in_leaf more important than max_depth?</summary><div class="qa-body">Leaf-wise growth follows the largest gain wherever it is, so a branch can keep splitting off ever smaller groups (on the diary, a third level to isolate one day). A depth cap stops it only late; a minimum leaf size stops every tiny leaf. On 500 churn rows, num_leaves 31 and 255 gave the identical model because min_data_in_leaf = 20 was the binding limit; on the 14 diary days it forbids every split.</div></details>
</main>
`
});
