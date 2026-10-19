// notes/ml/ml_xgboost.js — XGBoost
Object.assign(TOPIC_CONTENT, {
  "ml_xgboost": `<main>
  <h1>XGBoost</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>XGBoost</span></div>
  <p class="lead">XGBoost ("eXtreme Gradient Boosting", Tianqi Chen &amp; Carlos Guestrin, 2014–2016) is gradient boosting rebuilt with better maths and better engineering. The maths: it looks at the <strong>slope and the curvature</strong> of the loss (gradient g and Hessian h), and it puts <strong>penalties inside the tree-building itself</strong>, which gives two clean formulas: the best leaf value w* = −G/(H+λ) and the split gain. The engineering: fast split search with histograms, a learned direction for missing values, row and column sampling, and parallel, cache-aware code. This note derives every formula, works them by hand on an 8-customer table, rebuilds XGBoost from scratch so that it matches the library to 7 decimal places, and then covers every knob you will touch in practice. You should have read <a class="xref" data-note="ml_gbm">Gradient Boosting</a> first.</p>

  <h2 id="xgb-fit" class="open"><span class="num">★</span>Where This Fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 226" width="680"><defs><marker id="xgb-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><line x1="122" y1="113" x2="148" y2="113" stroke="currentColor" marker-end="url(#xgb-ar)"/><line x1="262" y1="113" x2="288" y2="113" stroke="currentColor" marker-end="url(#xgb-ar)"/><line x1="430" y1="113" x2="518" y2="35" stroke="currentColor" marker-end="url(#xgb-ar)"/><line x1="430" y1="113" x2="518" y2="113" stroke="currentColor" marker-end="url(#xgb-ar)"/><line x1="430" y1="113" x2="518" y2="191" stroke="currentColor" marker-end="url(#xgb-ar)"/><line x1="595" y1="56" x2="595" y2="90" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#xgb-ar)"/><line x1="595" y1="134" x2="595" y2="168" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#xgb-ar)"/><rect x="10" y="92" width="112" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="66" y="110" text-anchor="middle" font-size="13" font-weight="600">Boosting</text><text x="66" y="126" text-anchor="middle" class="tm" font-size="10.5">the idea</text><rect x="150" y="92" width="112" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="110" text-anchor="middle" font-size="13" font-weight="600">AdaBoost</text><text x="206" y="126" text-anchor="middle" class="tm" font-size="10.5">reweight rows</text><rect x="290" y="92" width="140" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="360" y="110" text-anchor="middle" font-size="13" font-weight="600">Gradient Boosting</text><text x="360" y="126" text-anchor="middle" class="tm" font-size="10.5">fit the gradient</text><rect x="520" y="14" width="150" height="42" rx="7" class="fg sg" stroke-width="2.5"/><text x="595" y="32" text-anchor="middle" font-size="13" font-weight="600">XGBoost</text><text x="595" y="48" text-anchor="middle" class="tm" font-size="10.5">Newton steps + penalties</text><rect x="520" y="92" width="150" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="595" y="110" text-anchor="middle" font-size="13" font-weight="600">LightGBM</text><text x="595" y="126" text-anchor="middle" class="tm" font-size="10.5">bins, leaf-wise, GOSS, EFB</text><rect x="520" y="170" width="150" height="42" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="595" y="188" text-anchor="middle" font-size="13" font-weight="600">CatBoost</text><text x="595" y="204" text-anchor="middle" class="tm" font-size="10.5">ordered TS, symmetric</text><text x="602" y="77" class="tm" font-size="10">faster</text><text x="602" y="155" class="tm" font-size="10">categories</text><text x="340" y="160" text-anchor="middle" class="tm" font-size="11">same loop: F = F + η·tree</text><text x="340" y="176" text-anchor="middle" class="tm" font-size="11">fit to g (and h)</text></svg><figcaption>The boosting branch of the family. XGBoost (green) is the first of the three "industrial" gradient boosting libraries. LightGBM and CatBoost came three years later and each fixed something XGBoost left open.</figcaption></figure>
  <p><strong>Came from.</strong> <a class="xref" data-note="ml_gbm">Gradient Boosting</a> gave the core loop: start with a constant guess, then again and again fit a small tree to the negative gradient of the loss (for squared error, simply the residuals) and add a shrunk copy of it. That loop works for any loss, but the classic version had three practical problems: (1) the tree is grown with a squared-error criterion on the gradients only, so it ignores how sharply the loss curves; (2) there is no penalty on leaf values inside the tree, so the only brakes are depth, learning rate and number of trees; (3) every possible cut-off on every column is tried, which is slow on millions of rows, and missing values must be filled in by hand.</p>
  <p><strong>What XGBoost adds.</strong> A <strong>regularised objective</strong> (loss + γ·leaves + ½λ·Σw²), a <strong>second-order (Newton) approximation</strong> of it that gives exact formulas for leaf values and split quality, <strong>sparsity-aware splits</strong> that learn where missing values should go, <strong>approximate / histogram split finding</strong> and a <strong>system design</strong> (column blocks, parallel split search, out-of-core, GPU) that made it 10× faster than the libraries of its time. From 2015 to about 2017 it won most Kaggle competitions on table data.</p>
  <p><strong>Leads to.</strong> <a class="xref" data-note="ml_lightgbm">LightGBM</a> keeps XGBoost's exact maths (same g, h, λ, gain formula) but makes it much faster with histograms, leaf-wise growth, GOSS and EFB. <a class="xref" data-note="ml_catboost">CatBoost</a> also keeps the maths but fixes the target leakage of categorical encodings and of boosting itself. How to tune all three is in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>; how to explain them is in <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</p>

  <h2 id="xgb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">XGBoost</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Same loop as GBM</b> — F<sub>m</sub> = F<sub>m−1</sub> + η·f<sub>m</sub>(x); each tree fixes the team's errors</li>
          <li><b>Adds</b> — Hessian, penalties in the tree, missing-value directions, fast split search, parallel code</li>
          <li><b>A tree as a function</b> — f(x) = w<sub>q(x)</sub>: q sends x to a leaf, w is that leaf's number</li>
          <li>💡 A coach who knows not just which way the player is wrong (g) but how sensitive he is to correction (h)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The maths (memorise)</div>
        <ul>
          <li><b>Objective</b> — Σ loss + Σ<sub>trees</sub>(γT + ½λΣw² + αΣ|w|)</li>
          <li><b>Taylor</b> — loss(F+f) ≈ loss(F) + g·f + ½h·f²</li>
          <li><b>Log loss</b> — g = p − y, h = p(1−p) · <b>squared error</b> — g = F − y, h = 1</li>
          <li><b>Leaf</b> — w* = −G/(H+λ) (G, H = sums over the leaf's rows)</li>
          <li><b>Score</b> — −½ΣG²/(H+λ) + γT (lower = better tree)</li>
          <li><b>Gain</b> — ½[G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ)] − γ</li>
          <li>⚠ The library prints and compares the gain <em>without</em> the ½</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Brakes (regularisation)</div>
        <ul>
          <li><b>λ (lambda)</b> — shrinks leaf values, small leaves most; can block weak splits</li>
          <li><b>α (alpha)</b> — L1: leaf is 0 unless |G| &gt; α</li>
          <li><b>γ (gamma)</b> — price per leaf; prunes splits with gain &lt; γ (after growing)</li>
          <li><b>min_child_weight</b> — minimum H in a child (not rows!)</li>
          <li><b>max_depth</b> 6 · <b>η</b> 0.3 default · <b>subsample</b>, <b>colsample_*</b></li>
          <li><b>max_delta_step</b> — caps |w|; helps very rare classes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Finding splits</div>
        <ul>
          <li><b>exact</b> — sort, try every cut-off; O(n log n) per column</li>
          <li><b>approx</b> — candidate cuts from a <b>Hessian-weighted quantile sketch</b>, re-proposed every round</li>
          <li><b>hist</b> (default) — ≤ 256 bins once; sum g, h per bin; parent − child histogram trick</li>
          <li><b>Why weight by h</b> — objective = Σ ½h(f − (−g/h))²: a weighted least-squares problem</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Missing &amp; sparse</div>
        <ul>
          <li><b>Default direction</b> — try missing→left and missing→right, keep the better</li>
          <li><b>Cost</b> — only non-missing entries are scanned</li>
          <li>⚠ In a scipy sparse matrix, stored zeros are absent = <em>missing</em></li>
          <li>For trees, native NaN ≈ constant imputation ≈ impute + flag: the imputed constant is itself splittable</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">System &amp; API</div>
        <ul>
          <li><b>Parallel</b> — within a tree (columns / bins), never across trees</li>
          <li><b>Column blocks</b>, cache prefetch, out-of-core, <code>device="cuda"</code>, Spark/Dask</li>
          <li><b>Native</b> — DMatrix, <code>xgb.train</code>, <code>xgb.cv</code>, <code>iteration_range</code></li>
          <li><b>sklearn</b> — <code>XGBClassifier</code>, <code>early_stopping_rounds</code> in the constructor</li>
          <li><b>Imbalance</b> — <code>scale_pos_weight</code> ≈ neg/pos (ranks better, probabilities inflated)</li>
          <li><b>Save</b> — <code>save_model("m.json")</code>, not pickle</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="xgb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What XGBoost Adds</span><span class="rm-sub">The need, the history, the five changes</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-obj"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Regularised Objective</span><span class="rm-sub">Loss + γT + ½λΣw², worked</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-taylor"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Second-Order Taylor: g and h</span><span class="rm-sub">Slope and curvature, derived</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-leaf"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Best Leaf Value &amp; Structure Score</span><span class="rm-sub">w* = −G/(H+λ)</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-gain"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Split Gain Formula</span><span class="rm-sub">Before minus after, minus γ</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-hand"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Three Rounds by Hand</span><span class="rm-sub">8 customers, checked against the library</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-reg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Brakes: λ, α, γ, min_child_weight</span><span class="rm-sub">By hand, then on 20,000 rows</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-scratch"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">XGBoost From Scratch</span><span class="rm-sub">80 lines that match the library</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-split"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Finding Splits Fast</span><span class="rm-sub">Exact, weighted quantile sketch, histograms</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-missing"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Missing Values</span><span class="rm-sub">Sparsity-aware default direction</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-sample"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Shrinkage &amp; Subsampling</span><span class="rm-sub">η, subsample, colsample_*</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-system"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Why It Is Fast</span><span class="rm-sub">Parallel blocks, cache, out-of-core, GPU</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-params"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Key Parameters</span><span class="rm-sub">Every knob, its effect, scale_pos_weight</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-es"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Early Stopping</span><span class="rm-sub">best_iteration, iteration_range</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-api"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Native vs sklearn API</span><span class="rm-sub">DMatrix, xgb.cv, save/load</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-cmp"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Compared With Its Family</span><span class="rm-sub">GBM, LightGBM, CatBoost, RF</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-traps"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in real use</span></div></div>
      <div class="rm-item rm-done" data-target="xgb-qa"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="xgb-why"><span class="num">01</span>What XGBoost Adds</h2>
  <h3>The need</h3>
  <p>Picture a telecom company with 20 million customers and 300 columns per customer, many of them empty (a customer who never called support has no "last call date"). Every night it must retrain a churn model. Plain gradient boosting from <a class="xref" data-note="ml_gbm">Gradient Boosting</a> gets the maths right, but: it tries every cut-off of every column for every node (hours of work), it cannot handle the empty cells, and its only protection against overfitting is "use small trees, a small learning rate, and not too many of them". XGBoost was written for exactly this situation: big, sparse, messy table data that must be trained quickly and must not overfit.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket coach correcting a batsman. Plain gradient boosting is a coach who only knows <em>which way</em> the player is wrong ("you are too late on the shot") and always corrects by the same amount. XGBoost's coach also knows <em>how sensitive</em> the player is to correction (the curvature): a player who over-reacts gets a gentle hint, a stubborn one gets a firm push. And this coach has a rule: "no special instruction for a situation you have seen only twice" (the penalties). Better corrections, fewer wasted sessions.</p>
  </div>
  <h3>The five changes, in plain words</h3>
  <table class="tbl">
    <tr><th>#</th><th>Change</th><th>Plain meaning</th><th>Problem it fixes</th><th>Section</th></tr>
    <tr><td>1</td><td>Regularised objective</td><td>The quantity minimised is "loss + a price for complex trees"</td><td>No brakes inside the tree</td><td>02</td></tr>
    <tr><td>2</td><td>Second-order (Newton) approximation</td><td>Uses slope g <em>and</em> curvature h of the loss for every row</td><td>Split search ignored curvature; each loss needed its own leaf formula</td><td>03–06</td></tr>
    <tr><td>3</td><td>Approximate / histogram split finding</td><td>Try a few hundred good cut-offs, not every value</td><td>Slow on big data</td><td>09</td></tr>
    <tr><td>4</td><td>Sparsity-aware splits</td><td>Learn which side empty values should go</td><td>Manual imputation, sparse one-hot data</td><td>10</td></tr>
    <tr><td>5</td><td>System design</td><td>Parallel split search, cache-friendly memory layout, out-of-core, GPU, distributed</td><td>Single-threaded, in-memory only</td><td>12</td></tr>
  </table>
  <p>Shrinkage (η) and row sampling were already in Friedman's gradient boosting; XGBoost kept them and added column sampling, borrowed from <a class="xref" data-note="ml_rf">Random Forest</a> (section 11).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>XGBoost</strong> is a gradient tree boosting system. Its model is an additive sum of K regression trees, ŷ = Σ<sub>k</sub> f<sub>k</sub>(x), trained one tree at a time. Each new tree minimises a second-order Taylor approximation of a regularised objective, with split finding that is exact, quantile-sketch based, or histogram based, and handles missing values by learning a default direction at every split.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"XGBoost is a different algorithm from gradient boosting." It is not. It is gradient boosting with a Newton step, penalties and very good engineering. If an interviewer asks "how does XGBoost differ from GBM?", list the five changes above; do not say "it uses a different kind of tree" (it uses ordinary binary regression trees).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> "Loss + a price for complex trees" is a nice sentence. We need it as a formula we can compute, because the formulas for the leaf values and the split gain all come out of it.</div>

  <h2 id="xgb-obj"><span class="num">02</span>The Regularised Objective</h2>
  <h3>A tree written as a function</h3>
  <p>To put a penalty on a tree we must first describe a tree with numbers. Any regression tree does two things to a row x: it sends x down to one leaf, and it outputs that leaf's number. Write the first step as q(x) ("which leaf?", an integer from 1 to T, where T is the number of leaves) and the leaf numbers as a list w = (w<sub>1</sub>, …, w<sub>T</sub>). Then the tree is simply</p>
  <p style="text-align:center"><strong>f(x) = w<sub>q(x)</sub></strong></p>
  <p>Example: a tree "calls &lt; 5.5 ? leaf 1 : leaf 2" with w = (−0.2, 0.26). A customer with 3 calls has q = 1, so f = −0.2. The structure q says <em>how</em> rows are grouped; the weights w say <em>what</em> each group predicts. XGBoost will optimise them separately: w by a formula, q by a greedy search.</p>
  <h3>The objective</h3>
  <p>For classification the trees add up to a raw score F (log-odds), and p = sigmoid(F). After building t trees, the quantity XGBoost minimises is</p>
  <p style="text-align:center"><strong>Obj = Σ<sub>i</sub> l(y<sub>i</sub>, ŷ<sub>i</sub>) + Σ<sub>k</sub> Ω(f<sub>k</sub>),  with Ω(f) = γ·T + ½·λ·Σ<sub>j</sub> w<sub>j</sub>² + α·Σ<sub>j</sub> |w<sub>j</sub>|</strong></p>
  <ul>
    <li><strong>l(y, ŷ)</strong>: the training loss of one row (log loss for classification, squared error for regression). The first sum says "fit the data".</li>
    <li><strong>γ·T</strong> (gamma times number of leaves): every leaf costs γ. A split is only worth it if it lowers the loss by more than γ.</li>
    <li><strong>½·λ·Σw²</strong> (lambda, L2): big leaf values are expensive. Same idea as <a class="xref" data-note="ml_regression">ridge regression</a>, but on leaf values instead of coefficients.</li>
    <li><strong>α·Σ|w|</strong> (alpha, L1): like lasso; pushes small leaf values to exactly 0. Off by default (α = 0).</li>
  </ul>
  <h3>Worked: the same data, two trees, two objectives</h3>
  <p>Four rows, squared error l = ½(y − ŷ)², targets y = (1, 1, 5, 5), starting prediction 0. Take λ = 1, γ = 1. Compare a 1-leaf tree with a 2-leaf tree.</p>
  <table class="tbl">
    <tr><th>Tree</th><th>Leaf values w</th><th>Predictions</th><th>Loss Σ½(y−ŷ)²</th><th>γT</th><th>½λΣw²</th><th>Obj</th></tr>
    <tr><td>1 leaf (best value 12/(4+1))</td><td>(2.4)</td><td>2.4, 2.4, 2.4, 2.4</td><td>½(1.96+1.96+6.76+6.76) = 8.72</td><td>1</td><td>½·5.76 = 2.88</td><td><strong>12.60</strong></td></tr>
    <tr><td>2 leaves</td><td>(1, 5)</td><td>1, 1, 5, 5</td><td>0</td><td>2</td><td>½(1+25) = 13</td><td><strong>15</strong></td></tr>
    <tr><td>2 leaves, shrunk</td><td>(0.67, 3.33)</td><td>0.67, 0.67, 3.33, 3.33</td><td>½(0.11+0.11+2.78+2.78) = 2.89</td><td>2</td><td>½(0.44+11.1) = 5.78</td><td><strong>10.67</strong></td></tr>
  </table>
  <p>The perfect-fit tree (loss 0) is <em>not</em> the best: its big leaf values cost 13. The best of the three is the 2-leaf tree with <em>shrunk</em> values, 0.67 and 3.33. Where do those numbers come from? Each leaf holds 2 rows with sum of targets 2 and 10; the shrunk values are 2/(2+1) and 10/(2+1): "sum / (count + λ)". Section 04 derives that this is the exact optimum, for any loss.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Regularised objective</strong>: Obj = Σ<sub>i</sub> l(y<sub>i</sub>, ŷ<sub>i</sub>) + Σ<sub>k</sub> [γT<sub>k</sub> + ½λ‖w<sub>k</sub>‖² + α‖w<sub>k</sub>‖<sub>1</sub>]. The loss rewards fit; Ω charges for the number of leaves and the size of leaf values. In the library: <code>gamma</code> (alias <code>min_split_loss</code>, default 0), <code>lambda</code> (<code>reg_lambda</code>, default 1), <code>alpha</code> (<code>reg_alpha</code>, default 0).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>λ = 1 is ON by default. So XGBoost's leaf values are never the plain averages that sklearn's GradientBoosting would produce, even with every other setting equal. If you compare the two libraries leaf by leaf, set <code>reg_lambda=0</code> first.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> For squared error we could find the best leaf values directly. For log loss there is no neat closed form: p = sigmoid(F) sits inside a logarithm. We need a trick that turns <em>every</em> loss into something as easy as squared error. That trick is the Taylor expansion.</div>

  <h2 id="xgb-taylor"><span class="num">03</span>Second-Order Taylor: g and h</h2>
  <h3>The idea in plain words</h3>
  <p>When we add tree number t, every row's score moves from its current value F<sub>i</sub> by a small step f<sub>i</sub> = f<sub>t</sub>(x<sub>i</sub>). Near the current point, <em>any</em> smooth curve looks like a parabola. So replace the true loss by the parabola that touches it at F<sub>i</sub>: same height, same slope, same bend. A parabola is easy to minimise. (Taylor series and second derivatives are in <a class="xref" data-note="m_calculus">Calculus</a>; Newton's method in <a class="xref" data-note="m_optimization">Optimization</a>.)</p>
  <p style="text-align:center"><strong>l(y, F + f) ≈ l(y, F) + g·f + ½·h·f²</strong>,  g = ∂l/∂F (slope), h = ∂²l/∂F² (curvature)</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Walking down a valley in fog. The gradient g tells you which way is downhill. The curvature h tells you whether the valley floor is near (sharp bend, take a small step) or far (flat, take a big step). Plain gradient boosting knows only the slope; XGBoost uses both, which is exactly Newton's method.</p>
  </div>
  <h3>g and h for the two common losses, derived</h3>
  <p><strong>Squared error</strong>, l = ½(y − F)². Slope: g = F − y (prediction minus truth). Curvature: h = 1 for every row. So "−g" is just the residual y − F, as in plain gradient boosting.</p>
  <p><strong>Log loss</strong>, l = −[y·ln p + (1−y)·ln(1−p)] with p = σ(F) = 1/(1+e<sup>−F</sup>). Use the handy fact σ'(F) = p(1−p):</p>
  <ul>
    <li>dl/dp = −y/p + (1−y)/(1−p) = (p − y) / (p(1−p))</li>
    <li>g = dl/dF = dl/dp · dp/dF = (p − y)/(p(1−p)) · p(1−p) = <strong>p − y</strong></li>
    <li>h = dg/dF = dp/dF = <strong>p(1 − p)</strong></li>
  </ul>
  <table class="tbl">
    <tr><th>Row</th><th>y</th><th>current p</th><th>g = p − y</th><th>h = p(1−p)</th><th>Reading</th></tr>
    <tr><td>A</td><td>1</td><td>0.50</td><td>−0.50</td><td>0.250</td><td>Undecided: strong push up, high curvature</td></tr>
    <tr><td>B</td><td>1</td><td>0.90</td><td>−0.10</td><td>0.090</td><td>Nearly right: small push</td></tr>
    <tr><td>C</td><td>0</td><td>0.99</td><td>+0.99</td><td>0.0099</td><td>Confidently wrong: big g, tiny h</td></tr>
  </table>
  <p>Row C is the interesting one. Its Newton step −g/h = −0.99/0.0099 = −100 would be huge: the loss is almost a straight line there, so the parabola thinks the minimum is far away. This is why XGBoost needs λ in the denominator and offers <code>max_delta_step</code> (section 13) to cap such steps.</p>
  <p>The code checks the two formulas against slopes measured numerically, and shows how close the parabola is for small and large steps.</p>
  <div class="fx" data-lang="py">import numpy as np
def logloss(y, F):                       # F = raw score (log-odds); p = sigmoid(F)
    p = 1 / (1 + np.exp(-F))
    return -(y * np.log(p) + (1 - y) * np.log(1 - p))
y, F, e = 1, 0.4, 1e-4
p = 1 / (1 + np.exp(-F))
g_num = (logloss(y, F + e) - logloss(y, F - e)) / (2 * e)               # slope by finite difference
h_num = (logloss(y, F + e) - 2 * logloss(y, F) + logloss(y, F - e)) / e**2   # curvature
print(f"p = {p:.4f}")
print(f"g: formula p - y = {p - y:.4f}   numeric = {g_num:.4f}")
print(f"h: formula p(1-p) = {p * (1 - p):.4f}   numeric = {h_num:.4f}")
# the Taylor approximation is close for a small step f
for f in [0.1, 0.5, 2.0]:
    exact = logloss(y, F + f)
    approx = logloss(y, F) + (p - y) * f + 0.5 * p * (1 - p) * f**2
    print(f"step f={f}:  true loss {exact:.4f}   2nd-order Taylor {approx:.4f}")</div>
  <div class="fx" data-lang="text">p = 0.5987
g: formula p - y = -0.4013   numeric = -0.4013
h: formula p(1-p) = 0.2403   numeric = 0.2403
step f=0.1:  true loss 0.4741   2nd-order Taylor 0.4741
step f=0.5:  true loss 0.3412   2nd-order Taylor 0.3424
step f=2.0:  true loss 0.0868   2nd-order Taylor 0.1909</div>
  <p>The formulas match the numeric derivatives to 4 decimals. The Taylor parabola is almost perfect for a step of 0.1 or 0.5, and clearly wrong for a step of 2.0. That is fine: with learning rate η = 0.3 or less, each tree only moves scores by small steps, and the next tree recomputes g and h at the new point.</p>
  <h3>Plugging into the objective</h3>
  <p>Drop the term l(y, F) (it is fixed, the new tree cannot change it). The objective for tree t becomes</p>
  <p style="text-align:center"><strong>Obj<sup>(t)</sup> ≈ Σ<sub>i</sub> [g<sub>i</sub>·f(x<sub>i</sub>) + ½·h<sub>i</sub>·f(x<sub>i</sub>)²] + γT + ½λΣ<sub>j</sub>w<sub>j</sub>²</strong></p>
  <p>The loss function has disappeared. Only the numbers g<sub>i</sub> and h<sub>i</sub> are left. That is why one tree-building routine works for regression, classification, ranking, Poisson, Tweedie or your own custom loss: you only have to supply g and h.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gradient statistics</strong>: for row i at the current score F<sub>i</sub>, g<sub>i</sub> = ∂l(y<sub>i</sub>, F)/∂F and h<sub>i</sub> = ∂²l(y<sub>i</sub>, F)/∂F². They are recomputed before every tree. A custom objective in XGBoost is a function that returns the arrays (g, h).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A custom loss must be convex enough that h &gt; 0. If h ≤ 0 (for example, a loss that is flat or bends downward), w* = −G/(H+λ) can blow up or point the wrong way. Absolute error has h = 0 almost everywhere; that is why XGBoost's <code>reg:absoluteerror</code> uses a special leaf-refresh step, and why Huber (<code>reg:pseudohubererror</code>) is often preferred.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have a simple objective made of g's and h's. Now we can ask: if the tree's shape is fixed, what is the best number for each leaf?</div>

  <h2 id="xgb-leaf"><span class="num">04</span>Best Leaf Value &amp; Structure Score</h2>
  <h3>Grouping rows by leaf</h3>
  <p>Every row in leaf j gets the same output w<sub>j</sub>. So group the sum by leaf. Let I<sub>j</sub> be the rows in leaf j, and define the two leaf totals</p>
  <p style="text-align:center"><strong>G<sub>j</sub> = Σ<sub>i∈I<sub>j</sub></sub> g<sub>i</sub>,   H<sub>j</sub> = Σ<sub>i∈I<sub>j</sub></sub> h<sub>i</sub></strong></p>
  <p>Then Σ<sub>i</sub>[g<sub>i</sub>w + ½h<sub>i</sub>w²] for the rows of leaf j is G<sub>j</sub>w<sub>j</sub> + ½H<sub>j</sub>w<sub>j</sub>², and the whole objective is</p>
  <p style="text-align:center"><strong>Obj = Σ<sub>j=1..T</sub> [ G<sub>j</sub>·w<sub>j</sub> + ½(H<sub>j</sub> + λ)·w<sub>j</sub>² ] + γT</strong></p>
  <h3>Minimising one parabola per leaf</h3>
  <p>Each leaf is a separate parabola in its own w<sub>j</sub>. Set the derivative to zero: G<sub>j</sub> + (H<sub>j</sub>+λ)w<sub>j</sub> = 0, so</p>
  <p style="text-align:center"><strong>w<sub>j</sub>* = −G<sub>j</sub> / (H<sub>j</sub> + λ)</strong></p>
  <p>Put it back in: G·(−G/(H+λ)) + ½(H+λ)·G²/(H+λ)² = −G²/(H+λ) + ½G²/(H+λ) = −½G²/(H+λ). So the best objective a fixed shape can reach is</p>
  <p style="text-align:center"><strong>Obj*(q) = −½ Σ<sub>j</sub> G<sub>j</sub>² / (H<sub>j</sub> + λ) + γT</strong></p>
  <p>This number is the <strong>structure score</strong>: lower is better. It plays the role that Gini or entropy play in a single <a class="xref" data-note="ml_dtree">decision tree</a>, but it is derived from your actual loss, and it already includes the penalties.</p>
  <h3>Reading the formula</h3>
  <ul>
    <li><strong>Squared error</strong> (h = 1): H<sub>j</sub> = number of rows n<sub>j</sub>, −G<sub>j</sub> = sum of residuals, so w* = (sum of residuals)/(n<sub>j</sub> + λ). With λ = 0 it is the mean residual, exactly plain gradient boosting. With λ &gt; 0 it is the mean pulled toward 0, and pulled hardest when n<sub>j</sub> is small.</li>
    <li><strong>Log loss</strong>: w* = Σ(y − p) / (Σp(1−p) + λ). With λ = 0 this is Friedman's one-step Newton leaf for logistic gradient boosting, the same value sklearn's GradientBoostingClassifier puts in its leaves.</li>
    <li><strong>Structure score</strong> G²/(H+λ): large when the rows in a leaf agree on the direction (big |G|) relative to how many there are (H). A leaf where half want "up" and half "down" has G ≈ 0 and scores nothing.</li>
  </ul>
  <h3>Worked: λ pulls small leaves harder</h3>
  <table class="tbl">
    <tr><th>Leaf</th><th>Rows</th><th>Residuals (squared error)</th><th>G = −Σres</th><th>H</th><th>w*, λ=0</th><th>w*, λ=1</th><th>w*, λ=10</th></tr>
    <tr><td>Small</td><td>2</td><td>4, 6</td><td>−10</td><td>2</td><td>5.00</td><td>3.33</td><td>0.83</td></tr>
    <tr><td>Large</td><td>200</td><td>average 5</td><td>−1000</td><td>200</td><td>5.00</td><td>4.98</td><td>4.76</td></tr>
  </table>
  <p>Both leaves have mean residual 5. With λ = 10 the 2-row leaf predicts only 0.83, the 200-row leaf still 4.76. The penalty acts like "add λ imaginary rows with residual 0 to each leaf". A pattern seen in two customers is not trusted; one seen in two hundred is.</p>
  <h3>With L1 (α)</h3>
  <p>Adding α|w| makes each leaf's parabola have a kink at 0. The minimum is the "soft-thresholded" value:</p>
  <p style="text-align:center"><strong>w* = −sign(G)·max(|G| − α, 0) / (H + λ)</strong></p>
  <p>If the leaf's total pull |G| is smaller than α, the leaf outputs exactly 0. Otherwise α is subtracted from the pull first. Section 07 checks this against the library.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Optimal leaf weight</strong> w<sub>j</sub>* = −G<sub>j</sub>/(H<sub>j</sub>+λ) (with L1: −sign(G<sub>j</sub>)·max(|G<sub>j</sub>|−α, 0)/(H<sub>j</sub>+λ)). <strong>Structure score</strong> of a tree shape q: Obj*(q) = −½Σ<sub>j</sub>G<sub>j</sub>²/(H<sub>j</sub>+λ) + γT. The library multiplies each leaf by the learning rate η before storing it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The leaf values you see in <code>get_dump()</code> or <code>trees_to_dataframe()</code> are η·w*, not w*. With η = 0.3, a printed leaf of −0.2 means w* = −0.667. Forgetting this makes hand checks look wrong by a factor of 3.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We can score a tree once its shape is known. But there are astronomically many shapes. We need a way to grow the shape one split at a time, with a number that says how good each candidate split is.</div>

  <h2 id="xgb-gain"><span class="num">05</span>The Split Gain Formula</h2>
  <p>Take one leaf with totals G, H. A candidate split sends its rows into a left part (G<sub>L</sub>, H<sub>L</sub>) and a right part (G<sub>R</sub>, H<sub>R</sub>), with G = G<sub>L</sub> + G<sub>R</sub> and H = H<sub>L</sub> + H<sub>R</sub>. Everything else in the tree stays the same, so compare only this leaf's piece of the structure score:</p>
  <ul>
    <li>Before (one leaf): −½·G²/(H+λ) + γ</li>
    <li>After (two leaves): −½·G<sub>L</sub>²/(H<sub>L</sub>+λ) − ½·G<sub>R</sub>²/(H<sub>R</sub>+λ) + 2γ</li>
  </ul>
  <p>The improvement, before minus after:</p>
  <p style="text-align:center"><strong>Gain = ½ [ G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − (G<sub>L</sub>+G<sub>R</sub>)²/(H<sub>L</sub>+H<sub>R</sub>+λ) ] − γ</strong></p>
  <p>In words: "score of left child + score of right child − score of the parent, minus the price of one extra leaf". Split only if Gain &gt; 0. Among all candidate splits (every column, every cut-off) pick the one with the largest gain.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Because G<sup>2</sup> is convex, splitting never lowers the bracket when λ = 0: a split that separates rows pushing "up" from rows pushing "down" gains a lot, a split that leaves both sides mixed gains almost nothing. With λ &gt; 0 the bracket can become <em>negative</em> for weak splits on few rows, so λ also acts as a split filter, not only as a leaf shrinker. γ then sets a fixed minimum.</p>
  </div>
  <p>Compare with the criterion of a single CART tree: CART maximises variance reduction (or Gini decrease) and then puts the mean in each leaf. XGBoost's gain is the <em>same objective</em> that also chooses the leaf values, so split choice and leaf values are consistent, and both include the penalties. Classic gradient boosting (sklearn) chooses splits with a squared-error criterion on g only (first order) and uses h only afterwards for the leaf values.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Split gain</strong>: ℒ<sub>split</sub> = ½[G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ)] − γ, from Chen &amp; Guestrin (2016), eq. 7. A split is also refused if H<sub>L</sub> or H<sub>R</sub> is below <code>min_child_weight</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The library's code drops the ½. The "gain" printed by <code>get_dump(with_stats=True)</code> and by <code>importance_type="gain"</code> is G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ), twice the paper's bracket, and <code>gamma</code> is compared with <em>that</em> number. So in practice "a split survives if 2 × (paper gain without γ) ≥ gamma". The next section shows it.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Formulas are convincing only when the numbers come out right. Let us build XGBoost's first three trees by hand on a tiny table and check every number against the library.</div>

  <h2 id="xgb-hand"><span class="num">06</span>Three Rounds by Hand</h2>
  <h3>The data</h3>
  <p>Eight customers. One feature: support calls last month. Target: churned (1) or stayed (0). Customer 3 is the odd one: few calls, but churned anyway.</p>
  <table class="tbl">
    <tr><th>Customer</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td></tr>
    <tr><th>calls</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td></tr>
    <tr><th>churn y</th><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td></tr>
  </table>
  <p>Settings: log loss, starting probability 0.5 (<code>base_score=0.5</code>, so starting log-odds F = 0), λ = 1, γ = 0, η = 0.3, depth-1 trees (one split each), <code>min_child_weight=0</code> so that any split is allowed.</p>
  <h3>Round 1, step 1: g and h for every row</h3>
  <p>Every p is 0.5. So g = 0.5 − y is +0.5 for stayers and −0.5 for churners, and h = 0.5 × 0.5 = 0.25 for everyone.</p>
  <table class="tbl">
    <tr><th>Customer</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><th>Total</th></tr>
    <tr><th>g</th><td>+0.5</td><td>+0.5</td><td>−0.5</td><td>+0.5</td><td>+0.5</td><td>−0.5</td><td>−0.5</td><td>−0.5</td><td>G = 0</td></tr>
    <tr><th>h</th><td>0.25</td><td>0.25</td><td>0.25</td><td>0.25</td><td>0.25</td><td>0.25</td><td>0.25</td><td>0.25</td><td>H = 2</td></tr>
  </table>
  <h3>Round 1, step 2: gain of every cut-off</h3>
  <p>Candidate cut-offs are the midpoints 1.5, 2.5, …, 7.5. The parent term is G²/(H+λ) = 0/3 = 0. For each cut, add up g and h on the left, the rest is on the right:</p>
  <table class="tbl">
    <tr><th>Cut</th><th>Left rows</th><th>G<sub>L</sub>, H<sub>L</sub></th><th>G<sub>L</sub>²/(H<sub>L</sub>+1)</th><th>G<sub>R</sub>, H<sub>R</sub></th><th>G<sub>R</sub>²/(H<sub>R</sub>+1)</th><th>Gain = ½(sum − 0)</th></tr>
    <tr><td>1.5</td><td>1</td><td>0.5, 0.25</td><td>0.25/1.25 = 0.200</td><td>−0.5, 1.75</td><td>0.25/2.75 = 0.091</td><td>0.145</td></tr>
    <tr><td>2.5</td><td>1–2</td><td>1.0, 0.50</td><td>1/1.5 = 0.667</td><td>−1.0, 1.50</td><td>1/2.5 = 0.400</td><td>0.533</td></tr>
    <tr><td>3.5</td><td>1–3</td><td>0.5, 0.75</td><td>0.25/1.75 = 0.143</td><td>−0.5, 1.25</td><td>0.25/2.25 = 0.111</td><td>0.127</td></tr>
    <tr><td>4.5</td><td>1–4</td><td>1.0, 1.00</td><td>1/2 = 0.500</td><td>−1.0, 1.00</td><td>1/2 = 0.500</td><td>0.500</td></tr>
    <tr><td><strong>5.5</strong></td><td>1–5</td><td>1.5, 1.25</td><td>2.25/2.25 = 1.000</td><td>−1.5, 0.75</td><td>2.25/1.75 = 1.286</td><td><strong>1.143</strong></td></tr>
    <tr><td>6.5</td><td>1–6</td><td>1.0, 1.50</td><td>1/2.5 = 0.400</td><td>−1.0, 0.50</td><td>1/1.5 = 0.667</td><td>0.533</td></tr>
    <tr><td>7.5</td><td>1–7</td><td>0.5, 1.75</td><td>0.25/2.75 = 0.091</td><td>−0.5, 0.25</td><td>0.25/1.25 = 0.200</td><td>0.145</td></tr>
  </table>
  <p>Best cut: <strong>calls &lt; 5.5</strong>, gain 1.143. It puts four stayers and the odd churner on the left and three churners on the right. The cut at 2.5 (two pure stayers on the left) loses because its children are smaller and λ = 1 hurts small groups more.</p>
  <h3>Round 1, step 3: leaf values</h3>
  <ul>
    <li>Left: w* = −G<sub>L</sub>/(H<sub>L</sub>+λ) = −1.5/2.25 = −0.667; stored as η·w* = 0.3 × −0.667 = <strong>−0.200</strong></li>
    <li>Right: w* = 1.5/1.75 = 0.857; stored as 0.3 × 0.857 = <strong>0.257</strong></li>
  </ul>
  <p>Now the library, with exactly these settings:</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
calls = np.arange(1, 9).reshape(-1, 1).astype(float)    # support calls last month
churn = np.array([0, 0, 1, 0, 0, 1, 1, 1])
params = {"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 1,
          "lambda": 1, "min_child_weight": 0, "tree_method": "exact"}
bst = xgb.train(params, xgb.DMatrix(calls, label=churn), num_boost_round=1)
print(bst.get_dump(with_stats=True)[0])</div>
  <div class="fx" data-lang="text">0:[f0&lt;5.5] yes=1,no=2,missing=1,gain=2.28571415,cover=2
	1:leaf=-0.200000018,cover=1.25
	2:leaf=0.257142872,cover=0.75</div>
  <p>Every number matches. The split is <code>f0&lt;5.5</code>. The leaves are −0.2 and 0.257. <code>cover</code> is H: 1.25 on the left (5 rows × 0.25), 0.75 on the right. And <code>gain=2.2857</code> is exactly 2 × 1.143: the library's gain without the ½, as the trap in section 05 said.</p>
  <h3>Rounds 2 and 3</h3>
  <p>After tree 1 the left customers have F = −0.2, so p = σ(−0.2) = 0.4502; the right customers have F = 0.257, p = 0.5639. The g's and h's change:</p>
  <table class="tbl">
    <tr><th>Customer</th><td>1, 2, 4, 5 (y=0, left)</td><td>3 (y=1, left)</td><td>6, 7, 8 (y=1, right)</td></tr>
    <tr><th>p</th><td>0.4502</td><td>0.4502</td><td>0.5639</td></tr>
    <tr><th>g = p − y</th><td>+0.4502</td><td>−0.5498</td><td>−0.4361</td></tr>
    <tr><th>h = p(1−p)</th><td>0.2475</td><td>0.2475</td><td>0.2459</td></tr>
  </table>
  <p>Cut 5.5 again: G<sub>L</sub> = 4(0.4502) − 0.5498 = 1.2510, H<sub>L</sub> = 5(0.2475) = 1.2376; G<sub>R</sub> = 3(−0.4361) = −1.3083, H<sub>R</sub> = 0.7377. Left leaf: −1.2510/2.2376 = −0.559 → stored −0.168. Right leaf: 1.3083/1.7377 = 0.753 → stored 0.226. The corrections are smaller than in round 1 because the rows are already partly right. Round 3 repeats this. The library's three trees and the running predictions:</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
calls = np.arange(1, 9).reshape(-1, 1).astype(float)
churn = np.array([0, 0, 1, 0, 0, 1, 1, 1])
params = {"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 1,
          "lambda": 1, "min_child_weight": 0, "tree_method": "exact"}
d = xgb.DMatrix(calls, label=churn)
bst = xgb.train(params, d, num_boost_round=3)
for i, t in enumerate(bst.get_dump()):
    print(f"tree {i + 1}:", t.replace("\\n", " ").replace("\\t", ""))
for r in [1, 2, 3]:
    F = bst.predict(d, output_margin=True, iteration_range=(0, r))
    print(f"after {r} tree(s): log-odds {np.round(F[[0, 7]], 4)}  p {np.round(1 / (1 + np.exp(-F[[0, 7]])), 4)}  (rows 1 and 8)")</div>
  <div class="fx" data-lang="text">tree 1: 0:[f0&lt;5.5] yes=1,no=2,missing=1 1:leaf=-0.200000018 2:leaf=0.257142872 
tree 2: 0:[f0&lt;5.5] yes=1,no=2,missing=1 1:leaf=-0.167702854 2:leaf=0.225845173 
tree 3: 0:[f0&lt;5.5] yes=1,no=2,missing=1 1:leaf=-0.142005175 2:leaf=0.20106025 
after 1 tree(s): log-odds [-0.2     0.2571]  p [0.4502 0.5639]  (rows 1 and 8)
after 2 tree(s): log-odds [-0.3677  0.483 ]  p [0.4091 0.6185]  (rows 1 and 8)
after 3 tree(s): log-odds [-0.5097  0.684 ]  p [0.3753 0.6646]  (rows 1 and 8)</div>
  <p>Tree 2's leaves are −0.1677 and 0.2258, exactly our hand values. Customer 1's churn probability falls 0.50 → 0.45 → 0.41 → 0.38; customer 8's rises 0.50 → 0.56 → 0.62 → 0.66. Each tree is a smaller correction than the one before. Customer 3 (the odd churner) stays on the left side and keeps p ≈ 0.38: with one feature and depth-1 trees nothing can isolate him, and with λ = 1 a 1-row leaf would be shrunk heavily anyway. That is the regularisation doing its job: one odd customer is treated as noise.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The whole algorithm is visible in this example: compute g and h, sum them per candidate child, score with G²/(H+λ), pick the best cut, set leaves to −G/(H+λ) times η, update F, repeat. Everything else in XGBoost is about doing this faster or more safely.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The toy run used λ = 1 and γ = 0, and switched off <code>min_child_weight</code>. Each of the brakes changes these numbers in a way we can predict by hand.</div>

  <h2 id="xgb-reg"><span class="num">07</span>The Brakes: λ, α, γ, min_child_weight</h2>
  <h3>Predict first, then check</h3>
  <p>Same 8 customers, one tree, changing one setting at a time. Predictions from the formulas (stored leaf = 0.3 × w*):</p>
  <table class="tbl">
    <tr><th>Setting</th><th>Hand calculation</th><th>Predicted leaves</th></tr>
    <tr><td>λ = 0</td><td>−1.5/1.25 = −1.2; 1.5/0.75 = 2.0</td><td>−0.36, 0.60</td></tr>
    <tr><td>λ = 10</td><td>−1.5/11.25 = −0.133; 1.5/10.75 = 0.140</td><td>−0.040, 0.042</td></tr>
    <tr><td>α = 1</td><td>−(1.5 − 1)/2.25 = −0.222; (1.5 − 1)/1.75 = 0.286</td><td>−0.067, 0.086</td></tr>
    <tr><td>γ = 2.2</td><td>library gain 2.286 ≥ 2.2 → keep the split</td><td>−0.200, 0.257</td></tr>
    <tr><td>γ = 2.4</td><td>2.286 &lt; 2.4 → prune; root leaf = −0/3 = 0</td><td>single leaf 0</td></tr>
    <tr><td>min_child_weight = 1</td><td>each child needs H ≥ 1, i.e. ≥ 4 rows of h = 0.25 → only cut 4.5 allowed; G<sub>L</sub> = 1, H<sub>L</sub> = 1 → −1/2</td><td>cut 4.5, leaves −0.15, 0.15</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
calls = np.arange(1, 9).reshape(-1, 1).astype(float)
churn = np.array([0, 0, 1, 0, 0, 1, 1, 1])
d = xgb.DMatrix(calls, label=churn)
base = {"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 1,
        "lambda": 1, "min_child_weight": 0, "tree_method": "exact"}
def show(label, **change):
    t = xgb.train({**base, **change}, d, num_boost_round=1).get_dump()[0]
    print(f"{label:22s}", t.replace("\\n", " ").replace("\\t", "").strip())
show("default (lambda=1)")
show("lambda=0", **{"lambda": 0})
show("lambda=10", **{"lambda": 10})
show("alpha=1", alpha=1)
show("gamma=2.2", gamma=2.2)
show("gamma=2.4", gamma=2.4)
show("min_child_weight=1", min_child_weight=1)</div>
  <div class="fx" data-lang="text">default (lambda=1)     0:[f0&lt;5.5] yes=1,no=2,missing=1 1:leaf=-0.200000018 2:leaf=0.257142872
lambda=0               0:[f0&lt;5.5] yes=1,no=2,missing=1 1:leaf=-0.360000014 2:leaf=0.600000024
lambda=10              0:[f0&lt;5.5] yes=1,no=2,missing=1 1:leaf=-0.0400000028 2:leaf=0.0418604687
alpha=1                0:[f0&lt;5.5] yes=1,no=2,missing=1 1:leaf=-0.0666666701 2:leaf=0.0857142955
gamma=2.2              0:[f0&lt;5.5] yes=1,no=2,missing=1 1:leaf=-0.200000018 2:leaf=0.257142872
gamma=2.4              0:leaf=-0
min_child_weight=1     0:[f0&lt;4.5] yes=1,no=2,missing=1 1:leaf=-0.150000006 2:leaf=0.150000006</div>
  <p>All six predictions are right. Note what each brake does differently: λ shrinks the values (and with larger λ would eventually block the split), α subtracts a fixed amount from each leaf's pull, γ removes whole splits, and <code>min_child_weight</code> changes <em>which</em> split is chosen by forbidding small children.</p>
  <h3>min_child_weight is a Hessian sum, not a row count</h3>
  <p>For squared error h = 1, so "minimum Hessian" equals "minimum rows". For log loss h = p(1−p) ≤ 0.25. With the default <code>min_child_weight=1</code>:</p>
  <table class="tbl">
    <tr><th>Rows' current p</th><th>h per row</th><th>Rows needed for H ≥ 1</th></tr>
    <tr><td>0.5 (undecided)</td><td>0.25</td><td>4</td></tr>
    <tr><td>0.9 or 0.1</td><td>0.09</td><td>12</td></tr>
    <tr><td>0.99 or 0.01</td><td>0.0099</td><td>102</td></tr>
  </table>
  <p>So as the model becomes confident, it automatically refuses to build leaves for small groups of already-well-predicted rows. This is also why <code>cover</code> in the dump is not a row count for classification.</p>
  <h3>γ prunes after growing</h3>
  <p>XGBoost grows each tree to <code>max_depth</code> with every split whose gain is positive, and then walks back from the leaves upward, removing any split whose gain is below γ <em>and</em> whose children are both leaves. A weak split high up survives if a strong split sits below it. This is better than stopping early: a split with a small gain can open the door to a very good split one level deeper (the classic XOR case).</p>
  <h3>On the 20,000-row churn data</h3>
  <p>The shared dataset of this tree family: 20,000 customers, 12 informative / redundant / noise features f0–f11, two pure-noise columns, train 12,000 / validation 3,000 / test 5,000. Each run below starts from <code>max_depth=6, learning_rate=0.1</code>, uses early stopping on the validation set, and changes one knob.</p>
  <div class="fx" data-lang="py">import xgboost as xgb
from sklearn.metrics import roc_auc_score
base = dict(n_estimators=3000, learning_rate=0.1, max_depth=6, early_stopping_rounds=50,
            eval_metric="logloss", tree_method="hist")
def run(**change):
    m = xgb.XGBClassifier(**{**base, **change})
    m.fit(Xtr, ytr, eval_set=[(Xva, yva)], verbose=False)
    p = m.predict_proba(Xte)[:, 1]
    tr = m.score(Xtr, ytr)
    print(f"{str(change):28s} trees {m.best_iteration + 1:4d}  train acc {tr:.3f}  "
          f"test acc {np.mean((p &gt; 0.5) == yte):.3f}  test AUC {roc_auc_score(yte, p):.4f}")
for kw in [{}, {"max_depth": 3}, {"max_depth": 10}, {"min_child_weight": 10}, {"min_child_weight": 50},
           {"gamma": 1}, {"gamma": 5}, {"reg_lambda": 0}, {"reg_lambda": 10}, {"reg_lambda": 100},
           {"subsample": 0.5}, {"colsample_bytree": 0.5}]:
    run(**kw)</div>
  <div class="fx" data-lang="text">{}                           trees  202  train acc 0.956  test acc 0.867  test AUC 0.9336
{'max_depth': 3}             trees 1023  train acc 0.928  test acc 0.858  test AUC 0.9264
{'max_depth': 10}            trees  117  train acc 0.994  test acc 0.870  test AUC 0.9360
{'min_child_weight': 10}     trees  375  train acc 0.956  test acc 0.866  test AUC 0.9305
{'min_child_weight': 50}     trees  473  train acc 0.924  test acc 0.859  test AUC 0.9288
{'gamma': 1}                 trees   84  train acc 0.913  test acc 0.862  test AUC 0.9275
{'gamma': 5}                 trees   34  train acc 0.872  test acc 0.845  test AUC 0.9152
{'reg_lambda': 0}            trees  213  train acc 0.967  test acc 0.865  test AUC 0.9324
{'reg_lambda': 10}           trees  298  train acc 0.952  test acc 0.872  test AUC 0.9350
{'reg_lambda': 100}          trees  632  train acc 0.952  test acc 0.870  test AUC 0.9345
{'subsample': 0.5}           trees  136  train acc 0.933  test acc 0.863  test AUC 0.9314
{'colsample_bytree': 0.5}    trees  393  train acc 0.983  test acc 0.864  test AUC 0.9319</div>
    <p>How to read it, one knob at a time (baseline: depth 6, test AUC 0.9336 after 202 trees):</p>
  <ul>
    <li><strong>max_depth</strong>: depth 3 needed 1,023 trees and still scored lower (0.926): too simple to capture the interactions in this data. Depth 10 fitted the training set almost perfectly (0.994) yet scored best on test (0.936) with only 117 trees: here deep trees plus early stopping work well. Depth is the knob with the biggest effect.</li>
    <li><strong>min_child_weight</strong> 10 and 50: smoother trees (train accuracy drops to 0.924 at 50), more trees needed, slightly lower test AUC. This dataset is not noisy enough to need it.</li>
    <li><strong>gamma</strong> 1 and 5: training stopped after only 84 and 34 trees, and AUC fell to 0.915. The reason is instructive: as boosting proceeds, the remaining gains shrink; once almost every candidate split gains less than γ, new trees are pruned to stumps or single leaves, nothing improves, and early stopping fires. γ is in absolute gain units, so it must be set relative to the gains your data produces.</li>
    <li><strong>reg_lambda</strong>: 0 overfits a little (train 0.967, test 0.9324); 10 gives the best test accuracy (0.872). Even λ = 100 is harmless: it just needs more trees (632), because each leaf's step is smaller.</li>
    <li><strong>subsample 0.5 / colsample_bytree 0.5</strong>: slightly lower here (0.931–0.932). On a clean 12,000-row dataset with few columns, sampling mostly adds noise; it pays off on larger, wider, noisier data.</li>
  </ul>
  <p>The differences are mostly in the third decimal: typical for a reasonable baseline. The big wins come from depth, learning rate with early stopping, and good features.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>The regularisation knobs</strong>: <code>reg_lambda</code> (λ, L2 on leaf values, default 1), <code>reg_alpha</code> (α, L1, default 0), <code>gamma</code> (γ, minimum loss reduction per split, used for post-pruning, default 0), <code>min_child_weight</code> (minimum Σh per child, default 1), <code>max_depth</code> (default 6), <code>max_delta_step</code> (cap on |w|, default 0 = off).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>γ has the same units as the gain, and the gain scales with the data: double the rows and every G²/(H+λ) roughly doubles. A γ that is tiny on 10,000 rows can be meaningless on 10 million. Tune γ on the data size you will train on, and look at the gains in <code>trees_to_dataframe()</code> to see what range is sensible.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have checked single formulas. The real test of understanding is to write the whole algorithm, many rounds and deeper trees, and get the same predictions as the library.</div>

  <h2 id="xgb-scratch"><span class="num">08</span>XGBoost From Scratch</h2>
  <p>The plan, matching XGBoost's <code>tree_method="exact"</code>:</p>
  <div class="flow"><span>F = 0 for every row</span><span>g = p − y, h = p(1−p)</span><span>grow a tree: at each node try every column and cut, score with G²/(H+λ)</span><span>prune splits with gain &lt; γ</span><span>F += η·w*</span><span>repeat</span></div>
  <p>The only trick for speed is in the split search: sort the node's rows by a column once, then a running sum (<code>cumsum</code>) of g and h gives G<sub>L</sub>, H<sub>L</sub> for every cut-off at once. Read <code>_grow</code> first; it is sections 04 and 05 in code.</p>
  <div class="fx" data-lang="py">import xgboost as xgb

class TinyXGB:
    """XGBoost's core loop for binary log loss: exact greedy splits, lambda, gamma, min_child_weight, eta."""
    def __init__(self, n_rounds=20, eta=0.3, max_depth=3, lam=1.0, gamma=0.0, min_child_weight=1.0):
        self.n_rounds, self.eta, self.max_depth = n_rounds, eta, max_depth
        self.lam, self.gamma, self.mcw = lam, gamma, min_child_weight

    def _score(self, G, H):                       # G^2 / (H + lambda): the "structure score" of one leaf
        return G * G / (H + self.lam)

    def _grow(self, X, g, h, idx, depth):
        G, H = g[idx].sum(), h[idx].sum()
        leaf = {"w": -G / (H + self.lam)}             # optimal weight w* = -G / (H + lambda)
        if depth == self.max_depth:
            return leaf
        best = (1e-6, None)                           # need a positive gain to split at all
        for j in range(X.shape[1]):
            order = idx[np.argsort(X[idx, j], kind="stable")]
            xs = X[order, j]
            GL = np.cumsum(g[order])[:-1]; HL = np.cumsum(h[order])[:-1]   # left sums for every cut
            GR, HR = G - GL, H - HL
            ok = (xs[1:] != xs[:-1]) &amp; (HL &gt;= self.mcw) &amp; (HR &gt;= self.mcw)
            gain = self._score(GL, HL) + self._score(GR, HR) - self._score(G, H)
            gain[~ok] = -np.inf
            k = int(np.argmax(gain))
            if gain[k] &gt; best[0]:
                best = (gain[k], (j, (xs[k] + xs[k + 1]) / 2))
        if best[1] is None:
            return leaf
        j, thr = best[1]
        left, right = idx[X[idx, j] &lt; thr], idx[X[idx, j] &gt;= thr]
        node = {"gain": best[0], "f": j, "thr": thr, "w": leaf["w"],
                "L": self._grow(X, g, h, left, depth + 1), "R": self._grow(X, g, h, right, depth + 1)}
        return self._prune(node)

    def _prune(self, node):                       # gamma: undo a split whose gain is below gamma
        if "L" in node and "f" not in node["L"] and "f" not in node["R"] and node["gain"] &lt; self.gamma:
            return {"w": node["w"]}
        return node

    def _predict_tree(self, node, X):
        if "f" not in node:
            return np.full(len(X), node["w"])
        go_left = X[:, node["f"]] &lt; node["thr"]
        out = np.empty(len(X))
        out[go_left] = self._predict_tree(node["L"], X[go_left])
        out[~go_left] = self._predict_tree(node["R"], X[~go_left])
        return out

    def fit(self, X, y):
        X = np.asarray(X, float); self.trees = []
        F = np.zeros(len(y))                          # base_score 0.5 = log-odds 0
        for _ in range(self.n_rounds):
            p = 1 / (1 + np.exp(-F))
            g, h = p - y, p * (1 - p)                 # first and second derivative of log loss
            tree = self._grow(X, g, h, np.arange(len(y)), 0)
            self.trees.append(tree)
            F += self.eta * self._predict_tree(tree, X)
        return self

    def predict_margin(self, X):
        X = np.asarray(X, float)
        return sum(self.eta * self._predict_tree(t, X) for t in self.trees)

Xs, ys = Xtr.iloc[:600, :6].values, ytr[:600]          # 600 rows, 6 columns: small enough for pure Python
params = dict(n_rounds=20, eta=0.3, max_depth=3, lam=1.0, gamma=0.5, min_child_weight=1.0)
mine = TinyXGB(**params).fit(Xs, ys)
lib = xgb.train({"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 3,
                 "lambda": 1.0, "gamma": 0.5, "min_child_weight": 1.0, "tree_method": "exact"},
                xgb.DMatrix(Xs, label=ys), num_boost_round=20)
Xt = Xte.iloc[:, :6].values
a, b = mine.predict_margin(Xt), lib.predict(xgb.DMatrix(Xt), output_margin=True)
print("max |difference| in log-odds on 5,000 test rows:", f"{np.abs(a - b).max():.2e}")
print("test accuracy  mine:", np.mean((a &gt; 0) == yte), " xgboost:", np.mean((b &gt; 0) == yte))
print("first tree, root split  mine: f%d &lt; %.4f" % (mine.trees[0]["f"], mine.trees[0]["thr"]),
      "| xgboost:", lib.get_dump()[0].split("\\n")[0])</div>
  <div class="fx" data-lang="text">max |difference| in log-odds on 5,000 test rows: 7.85e-07
test accuracy  mine: 0.7016  xgboost: 0.7016
first tree, root split  mine: f5 &lt; 0.1967 | xgboost: 0:[f5&lt;0.196703881] yes=1,no=2,missing=1</div>
  <p>Twenty rounds, depth-3 trees, γ = 0.5, λ = 1, <code>min_child_weight</code> = 1, on 600 rows and 6 columns: our log-odds and XGBoost's agree to within 0.0000008 on all 5,000 test rows, which is float32 rounding. The first split is the same column and the same threshold. Nothing about XGBoost's core is hidden any more. What the library adds on top is speed (sections 09 and 12), missing values (section 10) and sampling (section 11).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Three details make or break a from-scratch match: (1) the threshold is the midpoint between two neighbouring distinct values, and the test is <code>x &lt; threshold</code>; (2) <code>base_score</code> must be fixed (XGBoost 2+ otherwise estimates it from the data); (3) γ is applied as post-pruning on the un-halved gain, not as a stopping rule during growth.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Our <code>_grow</code> sorts every column at every node: fine for 600 rows, hopeless for 20 million. XGBoost's answer is to try only a few hundred well-chosen cut-offs.</div>

  <h2 id="xgb-split"><span class="num">09</span>Finding Splits Fast</h2>
  <h3>Exact greedy</h3>
  <p>The exact algorithm is what we just wrote: for every node, for every column, go through the rows in sorted order and evaluate every cut. XGBoost avoids re-sorting by storing each column <em>pre-sorted once</em> in a "block" (section 12), so one pass over all non-missing entries finds the best split of every node at one depth. Cost per tree ≈ O(depth · nnz), nnz = number of non-missing entries. It is still a full pass over every distinct value, and the whole table must sit in memory.</p>
  <h3>Approximate: candidate cut-offs from quantiles</h3>
  <p>Idea: instead of every value, try only cut-offs at, say, every 1% quantile of the column (about 100 candidates), and bucket the rows between them. The question is: quantiles of what? Counting rows equally is wrong, and the reason is a nice piece of algebra. Complete the square in the per-row objective:</p>
  <p style="text-align:center">g·f + ½h·f² = ½·h·(f − (−g/h))² − g²/(2h)</p>
  <p>The last term does not depend on f. So minimising Σ[g<sub>i</sub>f + ½h<sub>i</sub>f²] is the same as a <strong>weighted least-squares</strong> fit to targets −g<sub>i</sub>/h<sub>i</sub> with <strong>weights h<sub>i</sub></strong>. A row with tiny h (a confidently predicted row) barely affects the objective, so the candidate cut-offs should be spread by h-weight, not by count. That is the <strong>weighted quantile sketch</strong>: rank function r(z) = Σ<sub>x&lt;z</sub>h / Σh, and candidates are chosen so neighbouring candidates differ in rank by at most ε (≈ 1/ε candidates; <code>sketch_eps</code>).</p>
  <h3>Worked: weighted vs plain quartiles</h3>
  <p>Eight rows of one column, already sorted, with the model's current churn probability. Rows 4–7 are confidently predicted, so their h is tiny.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([10, 20, 30, 40, 50, 60, 70, 80])           # one feature, already sorted
p = np.array([0.50, 0.45, 0.55, 0.97, 0.98, 0.02, 0.03, 0.50])   # current predicted churn prob
h = p * (1 - p)                                           # Hessian = weight of each row
rank_plain = np.arange(1, 9) / 8                          # each row counts 1/8
rank_w = np.cumsum(h) / h.sum()                           # each row counts h_i / sum(h)
print("h        ", np.round(h, 3))
print("plain r  ", np.round(rank_plain, 3))
print("weighted r", np.round(rank_w, 3))
def cuts(rank, k=4):                                      # first x whose rank reaches 1/k, 2/k, ...
    return [int(x[np.searchsorted(rank, q - 1e-9)]) for q in np.arange(1, k) / k]
print("plain quartile cuts   :", cuts(rank_plain))
print("weighted quartile cuts:", cuts(rank_w))</div>
  <div class="fx" data-lang="text">h         [0.25  0.248 0.248 0.029 0.02  0.02  0.029 0.25 ]
plain r   [0.125 0.25  0.375 0.5   0.625 0.75  0.875 1.   ]
weighted r [0.229 0.455 0.682 0.709 0.727 0.745 0.771 1.   ]
plain quartile cuts   : [20, 40, 60]
weighted quartile cuts: [20, 30, 70]</div>
  <p>Plain quartiles put cut-offs at 20, 40, 60: two of the three candidates are inside the confident block (40–70), where any split changes the objective very little. The weighted ranks jump by about 0.23 for each uncertain row and by only 0.02–0.03 for confident ones, so the weighted cut-offs are 20, 30, 70: they are spent among the uncertain rows, where a good split matters. The "approximate" algorithm in the paper re-proposes these candidates (a <em>local</em> proposal) or proposes them once per tree (<em>global</em>); the sketch itself is a mergeable data structure, so it also works on distributed data.</p>
  <h3>Histograms (<code>tree_method="hist"</code>, the default)</h3>
  <p>The histogram method goes one step further: bucket every column into at most <code>max_bin</code> = 256 bins <em>once</em>, before training, and store each value as its small bin number. To find the best split of a node, add each row's g and h into its bin (one pass over the rows), then scan the 256 bin edges with running sums. Two big savings:</p>
  <ul>
    <li><strong>Cost</strong>: building the histogram is O(rows × columns) and scanning is O(bins × columns), with no sorting. Bin numbers fit in one byte, so memory drops 4–8×.</li>
    <li><strong>Subtraction trick</strong>: a parent's histogram = left child's + right child's. Build the histogram of the smaller child only, and get the bigger one by subtraction. This roughly halves the work. (<a class="xref" data-note="ml_lightgbm">LightGBM</a> works this out in full by hand.)</li>
  </ul>
  <p><code>approx</code> in modern XGBoost is the histogram method with the bins re-sketched every iteration using the current Hessians; <code>hist</code> computes bins once. On the churn data:</p>
  <div class="fx" data-lang="py">import xgboost as xgb
from sklearn.metrics import roc_auc_score
for method, extra in [("exact", {}), ("approx", {}), ("hist", {}), ("hist", {"max_bin": 16})]:
    t0 = time.time()
    m = xgb.XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=6, tree_method=method, **extra)
    m.fit(Xtr, ytr)
    auc = roc_auc_score(yte, m.predict_proba(Xte)[:, 1])
    print(f"tree_method={method:6s} {str(extra):17s} test AUC {auc:.4f}   fit {time.time() - t0:.2f}s")</div>
  <div class="fx" data-lang="text">tree_method=exact  {}                test AUC 0.9332   fit 43.38s
tree_method=approx {}                test AUC 0.9340   fit 40.68s
tree_method=hist   {}                test AUC 0.9345   fit 11.36s
tree_method=hist   {'max_bin': 16}   test AUC 0.9322   fit 2.90s</div>
    <p>Same 300 trees, four ways of finding splits (single thread on a busy shared machine, so read the ratios, not the seconds). <code>exact</code> and <code>approx</code> take about 40 s; <code>hist</code> with 256 bins takes 11 s, about 4× faster, and its test AUC is as good (0.9345 vs 0.9332, the difference is noise). Even 16 bins per column keeps almost all the accuracy (0.9322) at 15× the speed of exact. On 12,000 rows the gap is modest; on millions of rows exact becomes impractical while hist scales linearly.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>tree_method</strong>: <code>"exact"</code> (enumerate all cut-offs over pre-sorted columns), <code>"approx"</code> (Hessian-weighted quantile candidates, re-proposed each iteration), <code>"hist"</code> (fixed bins of each column, g/h histograms, default since 2.0; with <code>device="cuda"</code> it runs on a GPU). <strong>max_bin</strong>: maximum bins per column, default 256.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not expect <code>exact</code> to be more accurate. Bucketing acts as a mild regulariser, and on most data <code>hist</code> with 256 bins is as accurate and many times faster. Use <code>exact</code> only for small data where you want to reproduce textbook numbers (as in this note).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> All split search above assumed every row has a value. Real tables have holes, and one-hot or text features are mostly zeros.</div>

  <h2 id="xgb-missing"><span class="num">10</span>Missing Values: The Default Direction</h2>
  <h3>The idea</h3>
  <p>When a row's value for the split column is missing, which child should it go to? XGBoost does not guess and does not ask you to impute. At every split it <strong>learns</strong> a default direction from the training data: it tries sending all missing rows left, then all right, and keeps whichever gives the larger gain. Rows with a missing value at prediction time follow that stored direction.</p>
  <h3>The algorithm (sparsity-aware split finding)</h3>
  <ol>
    <li>Compute G, H of the whole node (missing rows included).</li>
    <li>Scan only the rows that <em>have</em> a value, in ascending order, accumulating G<sub>L</sub>, H<sub>L</sub>; right = total − left. Missing rows land on the right automatically. Record the best gain.</li>
    <li>Scan again in descending order, accumulating G<sub>R</sub>, H<sub>R</sub>; left = total − right, so missing rows land on the left. Record the best gain.</li>
    <li>Keep the better of the two, with its direction.</li>
  </ol>
  <p>The scans touch only non-missing entries, so on a table that is 95% empty the work is 20× smaller. The paper reports a 50× speed-up on sparse data compared with a naive version.</p>
  <h3>Worked: two customers with unknown call counts</h3>
  <p>Add customers 9 and 10 to our table: calls unknown (NaN), both churned. Now G = 1.5 − 1.5 − 1.0 = −1.0 and H = 10 × 0.25 = 2.5, parent term G²/(H+λ) = 1/3.5 = 0.286. At the cut 5.5 (library gain, no ½):</p>
  <table class="tbl">
    <tr><th>Missing go</th><th>Left G<sub>L</sub>, H<sub>L</sub></th><th>Right G<sub>R</sub>, H<sub>R</sub></th><th>G<sub>L</sub>²/(H<sub>L</sub>+1) + G<sub>R</sub>²/(H<sub>R</sub>+1) − 0.286</th></tr>
    <tr><td>left</td><td>0.5, 1.75</td><td>−1.5, 0.75</td><td>0.091 + 1.286 − 0.286 = 1.091</td></tr>
    <tr><td><strong>right</strong></td><td>1.5, 1.25</td><td>−2.5, 1.25</td><td>1.000 + 2.778 − 0.286 = <strong>3.492</strong></td></tr>
  </table>
  <p>Missing → right wins: the unknown-call customers churned, like the high-call customers on the right. Right leaf: 0.3 × 2.5/2.25 = 0.333.</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
calls = np.array([1, 2, 3, 4, 5, 6, 7, 8, np.nan, np.nan]).reshape(-1, 1)   # last 2: calls not recorded
churn = np.array([0, 0, 1, 0, 0, 1, 1, 1, 1, 1])
params = {"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 1,
          "lambda": 1, "min_child_weight": 0, "tree_method": "exact"}
bst = xgb.train(params, xgb.DMatrix(calls, label=churn), num_boost_round=1)
print(bst.get_dump(with_stats=True)[0])
new = xgb.DMatrix(np.array([[2.0], [np.nan]]))
print("prediction for calls=2 and calls=NaN:", np.round(bst.predict(new, output_margin=True), 4))</div>
  <div class="fx" data-lang="text">0:[f0&lt;5.5] yes=1,no=2,missing=2,gain=3.49206352,cover=2.5
	1:leaf=-0.200000018,cover=1.25
	2:leaf=0.333333373,cover=1.25

prediction for calls=2 and calls=NaN: [-0.2     0.3333]</div>
  <p><code>missing=2</code> means "missing values go to node 2", the right child. Gain 3.492 and leaf 0.333 match the table. A new customer with NaN calls gets 0.333, the churn side.</p>
  <h3>When missingness carries signal</h3>
  <p>On the churn data, make column f1 go missing for 40% of churners but only 10% of stayers (for example, churners stop using the app that records it). Compare native NaN handling with the usual fixes:</p>
  <div class="fx" data-lang="py">import xgboost as xgb
from sklearn.metrics import roc_auc_score
rng = np.random.default_rng(1)
def punch_holes(X, y):
    X = X.copy()
    # f1 goes missing far more often for churners (e.g. they stop using the app)
    miss = rng.random(len(X)) &lt; np.where(y == 1, 0.40, 0.10)
    X.loc[miss, "f1"] = np.nan
    return X
Xtr_m, Xte_m = punch_holes(Xtr, ytr), punch_holes(Xte, yte)
print(f"f1 missing in {Xtr_m['f1'].isna().mean():.0%} of training rows")
def fit_score(name, A, B):
    m = xgb.XGBClassifier(n_estimators=400, learning_rate=0.05, max_depth=6).fit(A, ytr)
    print(f"{name:34s} test AUC {roc_auc_score(yte, m.predict_proba(B)[:, 1]):.4f}")
fit_score("XGBoost, NaN left as NaN (native)", Xtr_m, Xte_m)
mean = Xtr_m["f1"].mean()
fit_score("mean-imputed", Xtr_m.fillna({"f1": mean}), Xte_m.fillna({"f1": mean}))
add = lambda X: X.assign(f1_missing=X["f1"].isna().astype(int)).fillna({"f1": mean})
fit_score("mean-imputed + missing flag", add(Xtr_m), add(Xte_m))</div>
  <div class="fx" data-lang="text">f1 missing in 25% of training rows
XGBoost, NaN left as NaN (native)  test AUC 0.9378
mean-imputed                       test AUC 0.9402
mean-imputed + missing flag        test AUC 0.9373</div>
    <p>All three land within 0.003 AUC of each other, which is noise at this size. That surprises many people: why does plain mean imputation not lose the "missing means churn" signal? Because a tree can still find it. Every imputed row now has <em>exactly</em> the same value (the mean), so two cuts just below and just above it isolate the imputed rows. For trees, constant imputation hides missingness only partly; for a linear model it would hide it completely. So the advantages of native NaN handling are practical: no imputation code to keep in sync between training and serving, no extra column, and the learned direction is chosen by gain directly. The flag column is still the right habit for linear models and neural networks (<a class="xref" data-note="ml_core">Core Concepts</a>).</p>
  <h3>The sparse-matrix trap</h3>
  <p>For a scipy sparse matrix, XGBoost treats every entry that is not stored as <strong>missing</strong>, and a sparse matrix does not store zeros. So a real 0 becomes "missing":</p>
  <div class="fx" data-lang="py">import numpy as np, xgboost as xgb
from scipy.sparse import csr_matrix
# 0 is a REAL value here (0 support calls), and the zero-call customers never churn
calls = np.array([0, 0, 0, 0, 3, 4, 5, 6], dtype=float).reshape(-1, 1)
churn = np.array([0, 0, 0, 0, 1, 1, 1, 1])
params = {"objective": "binary:logistic", "base_score": 0.5, "eta": 0.3, "max_depth": 1,
          "lambda": 1, "min_child_weight": 0, "tree_method": "exact"}
for name, data in [("dense numpy ", calls), ("scipy sparse", csr_matrix(calls))]:
    bst = xgb.train(params, xgb.DMatrix(data, label=churn), num_boost_round=1)
    print(name, "-&gt;", bst.get_dump()[0].replace("\\n", " ").replace("\\t", ""))</div>
  <div class="fx" data-lang="text">dense numpy  -&gt; 0:[f0&lt;1.5] yes=1,no=2,missing=1 1:leaf=-0.300000012 2:leaf=0.300000012 
scipy sparse -&gt; 0:[f0&lt;12.000001] yes=1,no=2,missing=2 1:leaf=0.300000012 2:leaf=-0.300000012 </div>
  <p>Dense input splits at 1.5 (between 0 and 3), with missing values sent left. Sparse input never sees the zeros: it splits "present values (3–6) vs missing", and the zero-call customers ride the missing branch. On this training data the two trees give the same predictions, but they mean different things: if a genuinely unknown value arrives later, the sparse model treats it like "0 calls" and the dense model treats it like "few calls". Both are fine as long as you know which one you trained.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sparsity-aware split finding</strong>: every split stores a default direction for missing values, chosen to maximise the gain on the training data. The <code>missing</code> parameter (default <code>np.nan</code>) says which value means "missing" for dense input; for sparse input, absent entries are missing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If a column had no missing values in training but has them in production, the default direction was never learned from data (XGBoost picks a fixed side). Predictions for those rows are then arbitrary. Monitor missing rates between training and serving.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Better splits and good missing-value handling make each tree strong. A team of strong trees can still overfit as a group. The oldest brakes in boosting are making each tree's contribution small and each tree's view of the data partial.</div>

  <h2 id="xgb-sample"><span class="num">11</span>Shrinkage &amp; Subsampling</h2>
  <h3>Shrinkage (η, <code>learning_rate</code>)</h3>
  <p>Every new tree is multiplied by η before it is added: F ← F + η·f. With η = 0.3 (default) each tree corrects 30% of what it could. Why not 100%? Because each tree is fitted to the current g's, which contain noise; a smaller step means later trees get a chance to correct this tree's mistakes, and the final model is an average of many small, slightly different corrections. The price: more trees. Rule of thumb: halve η, roughly double the trees; the result is usually a little better. Combine with early stopping (section 14).</p>
  <h3>Row subsampling (<code>subsample</code>)</h3>
  <p>Each tree is built on a random fraction of rows, drawn without replacement (Friedman's stochastic gradient boosting). The trees become less alike and each is cheaper. Typical 0.5–0.9.</p>
  <h3>Column subsampling (<code>colsample_bytree</code>, <code>colsample_bylevel</code>, <code>colsample_bynode</code>)</h3>
  <p>Borrowed from <a class="xref" data-note="ml_rf">Random Forest</a>. A random fraction of columns is allowed per tree, then per depth level (a fraction of the tree's columns), then per split (a fraction of the level's columns). They multiply: 0.8 × 0.8 × 0.8 leaves about half the columns for each split. The paper found column sampling prevents overfitting even better than row sampling, and it speeds up training.</p>
  <table class="tbl">
    <tr><th>Knob</th><th>Default</th><th>What is sampled</th><th>Effect</th></tr>
    <tr><td><code>learning_rate</code> (eta)</td><td>0.3</td><td>—</td><td>Smaller = more trees, smoother, usually better</td></tr>
    <tr><td><code>subsample</code></td><td>1.0</td><td>rows, once per tree</td><td>Less variance, faster; too low adds noise</td></tr>
    <tr><td><code>colsample_bytree</code></td><td>1.0</td><td>columns, once per tree</td><td>Trees less alike; strong feature cannot dominate every tree</td></tr>
    <tr><td><code>colsample_bylevel</code></td><td>1.0</td><td>columns, per depth level</td><td>Finer-grained version of the above</td></tr>
    <tr><td><code>colsample_bynode</code></td><td>1.0</td><td>columns, per split</td><td>Same as Random Forest's <code>max_features</code></td></tr>
  </table>
  <p>The churn-data runs in section 07 show the effect of each at learning rate 0.1. On this dataset the differences are small (a few thousandths of AUC), which is typical: these knobs protect you on noisy, wide data more than they boost a clean benchmark.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing settings at a fixed number of trees is unfair: a model with η = 0.05 and 300 trees is simply unfinished. Always compare with early stopping, which gives each setting the number of trees it needs.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Most of XGBoost's fame came from speed. The algorithm sections explained <em>what</em> is computed; the system design explains why it runs fast on one laptop, on a GPU, and on a cluster.</div>

  <h2 id="xgb-system"><span class="num">12</span>Why It Is Fast: The System</h2>
  <h3>Where the parallelism is</h3>
  <p>Boosting is sequential: tree t needs the predictions of trees 1…t−1. So XGBoost cannot build trees in parallel. It parallelises <strong>inside</strong> one tree: the best split for each column (or each block of rows, for histograms) is searched by a different thread, and the results are combined. With <code>n_jobs</code> threads, split finding runs up to n_jobs times faster.</p>
  <h3>Column blocks</h3>
  <p>Sorting is the expensive part of exact split finding. XGBoost stores the data once in compressed-column "blocks", each column pre-sorted by value, with pointers back to the rows' g and h. The sort is done one time before training and reused for every node of every tree. Blocks can be split by rows and spread across machines or disks.</p>
  <h3>Cache awareness</h3>
  <p>Walking a column in sorted order reads g and h in a random row order, which is slow for the CPU cache. XGBoost prefetches the g, h of a batch of rows into a small contiguous buffer and accumulates from there. The paper measured about 2× speed-up on large data from this alone.</p>
  <h3>Out-of-core, distributed, GPU</h3>
  <ul>
    <li><strong>Out-of-core</strong>: blocks are stored compressed on disk and read by a separate thread while the main thread computes ("external memory" in the docs).</li>
    <li><strong>Distributed</strong>: each worker builds histograms on its rows, and the histograms are summed across machines with an all-reduce (Dask, Spark via <code>xgboost.spark</code>, Ray). Trees are identical to single-machine training.</li>
    <li><strong>GPU</strong>: <code>device="cuda"</code> with <code>tree_method="hist"</code>. Histogram building is massively parallel, often 5–20× faster than CPU on large data.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"XGBoost trains trees in parallel like a random forest." No: trees are sequential; parallelism is per split search. That is why more cores help less for small data (little work per split) and why <code>n_estimators</code> drives training time linearly.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have met most knobs one at a time. Here they all are on one page, with defaults and effects, plus the one for rare classes.</div>

  <h2 id="xgb-params"><span class="num">13</span>Key Parameters</h2>
  <table class="tbl">
    <tr><th>Native name (sklearn name)</th><th>Default</th><th>What it does</th><th>Raise it when…</th><th>Typical range</th></tr>
    <tr><td><code>eta</code> (<code>learning_rate</code>)</td><td>0.3</td><td>Shrinks every tree</td><td>— lower it for the final model</td><td>0.01–0.3</td></tr>
    <tr><td><code>num_boost_round</code> (<code>n_estimators</code>)</td><td>10 / 100</td><td>Number of trees</td><td>Set high, let early stopping cut</td><td>100–10,000</td></tr>
    <tr><td><code>max_depth</code></td><td>6</td><td>Max tree depth = max order of interactions</td><td>Underfitting; many interacting features</td><td>3–10</td></tr>
    <tr><td><code>min_child_weight</code></td><td>1</td><td>Min Σh in a child</td><td>Overfitting; noisy labels</td><td>1–100</td></tr>
    <tr><td><code>gamma</code> (<code>min_split_loss</code>)</td><td>0</td><td>Min gain to keep a split</td><td>Too many useless splits</td><td>0–10 (data-size dependent)</td></tr>
    <tr><td><code>subsample</code></td><td>1</td><td>Row fraction per tree</td><td>— lower it to fight overfitting</td><td>0.5–1</td></tr>
    <tr><td><code>colsample_bytree</code> / <code>_bylevel</code> / <code>_bynode</code></td><td>1</td><td>Column fraction per tree / level / split</td><td>— lower it for wide or correlated data</td><td>0.3–1</td></tr>
    <tr><td><code>lambda</code> (<code>reg_lambda</code>)</td><td>1</td><td>L2 on leaf values</td><td>Overfitting; small leaves</td><td>0–100</td></tr>
    <tr><td><code>alpha</code> (<code>reg_alpha</code>)</td><td>0</td><td>L1 on leaf values</td><td>Many weak features; want sparse leaves</td><td>0–10</td></tr>
    <tr><td><code>scale_pos_weight</code></td><td>1</td><td>Multiplies g and h of positive rows</td><td>Rare positive class, care about ranking/recall</td><td>1 to neg/pos</td></tr>
    <tr><td><code>max_delta_step</code></td><td>0 (off)</td><td>Caps |w| per leaf</td><td>Extremely imbalanced logistic regression</td><td>1–10</td></tr>
    <tr><td><code>tree_method</code></td><td>"hist"</td><td>exact / approx / hist</td><td>—</td><td>hist</td></tr>
    <tr><td><code>max_bin</code></td><td>256</td><td>Bins per column for hist</td><td>Very fine numeric detail matters</td><td>64–1024</td></tr>
    <tr><td><code>grow_policy</code>, <code>max_leaves</code></td><td>depthwise, 0</td><td>Level-wise or best-leaf-first (LightGBM style)</td><td>Want leaf-wise growth</td><td>lossguide + max_leaves 31–255</td></tr>
    <tr><td><code>objective</code></td><td>reg:squarederror</td><td>Loss: binary:logistic, multi:softprob, reg:absoluteerror, count:poisson, rank:ndcg, …</td><td>—</td><td>—</td></tr>
    <tr><td><code>eval_metric</code></td><td>by objective</td><td>Metric for evaluation / early stopping</td><td>—</td><td>logloss, auc, aucpr, rmse</td></tr>
    <tr><td><code>base_score</code></td><td>estimated</td><td>Starting prediction</td><td>—</td><td>leave automatic</td></tr>
    <tr><td><code>monotone_constraints</code>, <code>interaction_constraints</code></td><td>none</td><td>Force a feature's effect to be increasing/decreasing; limit which features may interact</td><td>Business rules, regulation</td><td>—</td></tr>
    <tr><td><code>device</code>, <code>n_jobs</code>, <code>random_state</code></td><td>cpu, all cores, 0</td><td>Hardware, threads, seed</td><td>—</td><td>—</td></tr>
  </table>
  <h3>scale_pos_weight, worked</h3>
  <p>With 5% churners there are about 19 stayers per churner. <code>scale_pos_weight=w</code> multiplies the g and h of every positive row by w, as if each churner appeared w times. Every leaf's G and H then count churners w times as much. The usual starting value is neg/pos.</p>
  <div class="fx" data-lang="py">import xgboost as xgb
from sklearn.metrics import roc_auc_score, recall_score, precision_score
# a rarer-churn version of the data: only ~5% of customers churn
Xi, yi = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,
                             n_clusters_per_class=3, class_sep=0.8, weights=[0.95], random_state=7)
Xa, Xb, ya, yb = train_test_split(Xi, yi, test_size=5000, stratify=yi, random_state=0)
ratio = (ya == 0).sum() / (ya == 1).sum()
print(f"churn rate {ya.mean():.3f}  -&gt;  negatives/positives = {ratio:.1f}")
for spw in [1, np.sqrt(ratio), ratio]:
    m = xgb.XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=4, scale_pos_weight=spw)
    m.fit(Xa, ya)
    p = m.predict_proba(Xb)[:, 1]
    print(f"scale_pos_weight={spw:5.1f}  AUC {roc_auc_score(yb, p):.3f}  "
          f"recall@0.5 {recall_score(yb, p &gt; 0.5):.2f}  precision@0.5 {precision_score(yb, p &gt; 0.5):.2f}  "
          f"mean predicted p {p.mean():.3f} (true rate {yb.mean():.3f})")</div>
  <div class="fx" data-lang="text">churn rate 0.055  -&gt;  negatives/positives = 17.2
scale_pos_weight=  1.0  AUC 0.850  recall@0.5 0.21  precision@0.5 0.87  mean predicted p 0.052 (true rate 0.055)
scale_pos_weight=  4.1  AUC 0.849  recall@0.5 0.39  precision@0.5 0.65  mean predicted p 0.120 (true rate 0.055)
scale_pos_weight= 17.2  AUC 0.839  recall@0.5 0.64  precision@0.5 0.25  mean predicted p 0.254 (true rate 0.055)</div>
    <p>Read the three rows left to right. <strong>AUC barely moves</strong> (0.850 → 0.839): the ranking of customers by risk is about the same. What changes is where the 0.5 cut-off falls: with weight 17.2 the model calls many more customers churners, so <strong>recall at 0.5 rises from 0.21 to 0.64</strong> while precision falls from 0.87 to 0.25. And the <strong>probabilities are inflated</strong>: the average predicted churn probability is 0.254 although the true rate is 0.055. The model was told that every churner counts 17 times, and its probabilities say so. The square root (≈ 4) is a common middle ground.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>After <code>scale_pos_weight</code> the output is no longer a calibrated probability. If you need real probabilities (pricing, expected loss), either leave it at 1 and move the decision threshold, or recalibrate afterwards (<a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a> covers calibration).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Of all the knobs, the number of trees is the one you should never tune by hand. Early stopping chooses it.</div>

  <h2 id="xgb-es"><span class="num">14</span>Early Stopping</h2>
  <p>Boosting keeps lowering the training loss forever, but the validation loss stops improving and then rises (the overfitting curve in <a class="xref" data-note="ml_gbm">Gradient Boosting</a>). Early stopping evaluates a metric on a validation set after every tree and stops when it has not improved for N rounds; the model remembers the best round. Here in the native API, printing every 100 rounds:</p>
  <div class="fx" data-lang="py">import xgboost as xgb
dtr = xgb.DMatrix(Xtr, label=ytr)                 # native API: data goes in a DMatrix
dva = xgb.DMatrix(Xva, label=yva)
dte = xgb.DMatrix(Xte, label=yte)
params = {"objective": "binary:logistic", "eval_metric": "logloss", "eta": 0.1,
          "max_depth": 6, "subsample": 0.8, "colsample_bytree": 0.8, "seed": 0}
bst = xgb.train(params, dtr, num_boost_round=3000, evals=[(dtr, "train"), (dva, "val")],
                early_stopping_rounds=50, verbose_eval=100)
print("best_iteration:", bst.best_iteration, " best val logloss:", round(bst.best_score, 4))
print("trees actually built:", bst.num_boosted_rounds())
p_best = bst.predict(dte, iteration_range=(0, bst.best_iteration + 1))
p_all = bst.predict(dte, iteration_range=(0, bst.num_boosted_rounds()))
print(f"test acc using best {bst.best_iteration + 1} trees: {np.mean((p_best &gt; 0.5) == yte):.4f}"
      f" | using all {bst.num_boosted_rounds()}: {np.mean((p_all &gt; 0.5) == yte):.4f}")</div>
  <div class="fx" data-lang="text">[0]	train-logloss:0.66410	val-logloss:0.66458
[100]	train-logloss:0.25249	val-logloss:0.33777
[200]	train-logloss:0.17366	val-logloss:0.32577
[300]	train-logloss:0.12181	val-logloss:0.32429
[331]	train-logloss:0.11029	val-logloss:0.32576
best_iteration: 281  best val logloss: 0.3237
trees actually built: 332
test acc using best 282 trees: 0.8700 | using all 332: 0.8708</div>
    <p>The log shows training loss falling steadily (0.664 → 0.110) while validation loss bottoms out near round 281 (0.3237) and starts to rise; after 50 rounds without improvement, training stops at 332 trees. <code>best_iteration</code> is 281 (0-based), so the best model has 282 trees. On test accuracy the extra 50 trees made no real difference (0.8700 vs 0.8708 is noise on 5,000 rows); early stopping chose by log loss, saved most of the 3,000 rounds, and protects you when the validation curve rises steeply (as in the overfitting curve of <a class="xref" data-note="ml_gbm">Gradient Boosting</a>).</p>
  <ul>
    <li><strong>Which metric</strong>: the <em>last</em> metric in <code>eval_metric</code> on the <em>last</em> set in <code>evals</code>. Put the validation set last.</li>
    <li><strong>What is kept</strong>: all trees up to the stop are kept; <code>best_iteration</code> is 0-based. The sklearn API's <code>predict</code> uses the best iteration automatically; with the native API pass <code>iteration_range=(0, best_iteration + 1)</code>.</li>
    <li><strong>Final model</strong>: either keep this model, or retrain on train + validation with about best_iteration × (1 + extra share of data) rounds.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never early-stop on the test set. The stopping point is chosen to look good on whatever set you give it, so that set's score is optimistic. Use a separate validation set (or <code>xgb.cv</code>) and keep the test set for the final number.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We used two different ways of calling XGBoost in this note. They are the same engine; knowing both, and how to go from one to the other, avoids a lot of confusion.</div>

  <h2 id="xgb-api"><span class="num">15</span>Native vs sklearn API</h2>
  <table class="tbl">
    <tr><th></th><th>Native API</th><th>scikit-learn API</th></tr>
    <tr><td>Data</td><td><code>xgb.DMatrix(X, label=y)</code> (also <code>QuantileDMatrix</code> for hist, less memory)</td><td>numpy / pandas / sparse directly</td></tr>
    <tr><td>Train</td><td><code>xgb.train(params, dtrain, num_boost_round, evals=…, early_stopping_rounds=…)</code></td><td><code>XGBClassifier(**params).fit(X, y, eval_set=[…])</code></td></tr>
    <tr><td>Parameter names</td><td><code>eta</code>, <code>lambda</code>, <code>alpha</code></td><td><code>learning_rate</code>, <code>reg_lambda</code>, <code>reg_alpha</code> (both accepted)</td></tr>
    <tr><td>Early stopping</td><td>argument of <code>train</code></td><td>constructor argument <code>early_stopping_rounds</code></td></tr>
    <tr><td>Predict</td><td><code>bst.predict(dmat)</code> returns probabilities for binary:logistic; <code>output_margin=True</code> for log-odds</td><td><code>predict</code> (labels), <code>predict_proba</code></td></tr>
    <tr><td>Cross-validation</td><td><code>xgb.cv</code> (also picks rounds)</td><td>sklearn <code>cross_val_score</code>, <code>GridSearchCV</code>, pipelines</td></tr>
    <tr><td>Best for</td><td>custom objectives, fine control, large data</td><td>pipelines, tuning tools, team code</td></tr>
  </table>
  <div class="fx" data-lang="py">import xgboost as xgb
# 1) the same model through the scikit-learn API
clf = xgb.XGBClassifier(n_estimators=3000, learning_rate=0.1, max_depth=6, subsample=0.8,
                        colsample_bytree=0.8, random_state=0, eval_metric="logloss",
                        early_stopping_rounds=50)
clf.fit(Xtr, ytr, eval_set=[(Xva, yva)], verbose=False)
print("sklearn API best_iteration:", clf.best_iteration)
p_sk = clf.predict_proba(Xte)[:, 1]                   # automatically uses the best iteration
booster = clf.get_booster()                           # the native Booster lives inside
p_nat = booster.predict(xgb.DMatrix(Xte), iteration_range=(0, clf.best_iteration + 1))
print("same predictions as native booster:", np.allclose(p_sk, p_nat))
# 2) xgb.cv: k-fold CV that also picks the number of rounds
cv = xgb.cv({"objective": "binary:logistic", "eval_metric": "logloss", "eta": 0.1, "max_depth": 6,
             "subsample": 0.8, "colsample_bytree": 0.8, "seed": 0},
            xgb.DMatrix(Xtr, label=ytr), num_boost_round=3000, nfold=5, early_stopping_rounds=50, seed=0)
print("xgb.cv rounds kept:", len(cv), " last row:")
print(cv.tail(1).round(4).to_string())
# 3) save and load: JSON is the portable format
clf.save_model("churn_xgb.json")
again = xgb.XGBClassifier(); again.load_model("churn_xgb.json")
print("reloaded model gives same probabilities:", np.allclose(again.predict_proba(Xte)[:, 1], p_sk))
imp = booster.get_score(importance_type="gain")
top = sorted(imp.items(), key=lambda kv: -kv[1])[:3]
print("top-3 by gain:", [(k, round(v, 1)) for k, v in top])</div>
  <div class="fx" data-lang="text">sklearn API best_iteration: 281
same predictions as native booster: True
xgb.cv rounds kept: 215  last row:
     train-logloss-mean  train-logloss-std  test-logloss-mean  test-logloss-std
214              0.1489              0.003             0.3419            0.0094
reloaded model gives same probabilities: True
top-3 by gain: [('f8', 6.5), ('f4', 5.8), ('f5', 5.8)]</div>
    <p>The sklearn model stops at the same best iteration (281) as the native run, and its <code>predict_proba</code> equals the native booster's predictions restricted to the best iteration: the sklearn class is a thin wrapper around the same <code>Booster</code>. <code>xgb.cv</code> runs 5-fold CV and stops at 215 rounds; its CV log loss (0.342) is a more stable estimate than the single validation split. The JSON model reloads to identical probabilities. Gain importance ranks f8, f4, f5 on top; remember that it is "average gain per split", one of three built-in types (<code>weight</code>, <code>gain</code>, <code>cover</code>), each with biases.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Save with <code>save_model("model.json")</code> (or <code>.ubj</code>), not pickle. JSON models load in any XGBoost version, language (R, Java, C) and platform; a pickle may fail to load after an upgrade. Also save the column order: the model stores feature names, but a numpy input with columns in a different order is silently wrong.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> XGBoost is one member of a family. Where exactly does it sit next to its parent and its younger siblings?</div>

  <h2 id="xgb-cmp"><span class="num">16</span>Compared With Its Family</h2>
  <table class="tbl">
    <tr><th></th><th>sklearn GradientBoosting</th><th>XGBoost</th><th><a class="xref" data-note="ml_lightgbm">LightGBM</a></th><th><a class="xref" data-note="ml_catboost">CatBoost</a></th></tr>
    <tr><td>Year</td><td>2001 (Friedman)</td><td>2014 / paper 2016</td><td>2017</td><td>2017 / 2018</td></tr>
    <tr><td>Split criterion</td><td>squared error on g (1st order)</td><td>gain with g, h, λ, γ</td><td>same as XGBoost</td><td>same idea, on symmetric trees</td></tr>
    <tr><td>Penalty on leaves</td><td>no</td><td>λ, α, γ</td><td>λ, α, min_gain_to_split</td><td>l2_leaf_reg</td></tr>
    <tr><td>Split search</td><td>exact</td><td>exact / approx / hist</td><td>hist + GOSS + EFB</td><td>hist (borders)</td></tr>
    <tr><td>Tree growth</td><td>depth-wise</td><td>depth-wise (lossguide optional)</td><td>leaf-wise</td><td>symmetric (oblivious)</td></tr>
    <tr><td>Missing values</td><td>no (HistGB: yes)</td><td>learned direction</td><td>learned direction</td><td>Min / Max</td></tr>
    <tr><td>Categoricals</td><td>encode yourself</td><td>encode yourself (experimental native)</td><td>native (gradient-sorted)</td><td>native, ordered target statistics</td></tr>
    <tr><td>Speed on big data</td><td>slow</td><td>fast</td><td>fastest</td><td>fast; slowest of the three on CPU</td></tr>
    <tr><td>Defaults</td><td>ok</td><td>good with tuning</td><td>good with tuning</td><td>best out of the box</td></tr>
  </table>
  <table class="tbl">
    <tr><th></th><th><a class="xref" data-note="ml_rf">Random Forest</a></th><th>XGBoost</th></tr>
    <tr><td>Trees built</td><td>independently, in parallel</td><td>in sequence, each corrects the last</td></tr>
    <tr><td>Works on</td><td>variance (deep trees averaged)</td><td>bias first (shallow trees added), variance via η, sampling, penalties</td></tr>
    <tr><td>More trees</td><td>never hurts</td><td>eventually overfits: needs early stopping</td></tr>
    <tr><td>Tuning need</td><td>low</td><td>medium</td></tr>
    <tr><td>Typical accuracy on tables</td><td>strong baseline</td><td>usually a bit higher</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>All three boosting libraries share XGBoost's maths: the g/h gain, w* = −G/(H+λ), learned missing directions. If you understand this note, LightGBM and CatBoost are "the same machine with a different engine (LightGBM) or different safety rules (CatBoost)".</p>
  </div>

  <h2 id="xgb-traps"><span class="num">17</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: tuning n_estimators by grid search</span>
    <p>Use a large number and early stopping. Grid-searching the number of trees wastes time and still lands between grid points.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: learning rate 0.3 in the final model</span>
    <p>The default η = 0.3 is fast for exploration. For the model you ship, lower it to 0.01–0.1 with early stopping; the gain is usually small but free.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading min_child_weight as a row count</span>
    <p>For log loss it is a sum of p(1−p), so it demands many more rows when predictions are confident. Setting it to 50 "because I want 50 rows per leaf" is much stricter than intended.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: label-encoding categories as integers</span>
    <p>Codes 0, 1, 2… for city names impose a fake order. Trees can cope with enough splits, but one-hot (low cardinality), target encoding done out-of-fold, <code>enable_categorical=True</code> with pandas category dtype, or CatBoost are better choices.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: early stopping on the test set</span>
    <p>The best round is chosen to fit that set. Report a different set's score.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scale_pos_weight and then trusting probabilities</span>
    <p>It improves ranking/recall but inflates probabilities. Recalibrate, or move the threshold instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: zeros in sparse input</span>
    <p>Absent entries of a sparse matrix are missing values, not zeros. Make sure that is what you mean.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: comparing gain values across models</span>
    <p>Gain depends on data size, λ and the loss. "Gain importance" is only comparable within one model; for explanations prefer permutation importance or SHAP (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: extrapolation</span>
    <p>Like every tree model, XGBoost predicts a constant beyond the range of the training data. A price model trained on prices up to ₹10 lakh will not predict ₹20 lakh. Add a linear model or engineer relative features for trends.</p>
  </div>

  <h2 id="xgb-qa"><span class="num">18</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is XGBoost's objective function?</summary><div class="qa-body">Σ<sub>i</sub> l(y<sub>i</sub>, ŷ<sub>i</sub>) + Σ<sub>k</sub> Ω(f<sub>k</sub>) with Ω(f) = γT + ½λΣw<sub>j</sub>² (+ αΣ|w<sub>j</sub>|). Loss rewards fit; γ charges per leaf, λ and α charge for large leaf values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the optimal leaf weight.</summary><div class="qa-body">Second-order Taylor: Obj ≈ Σ[g<sub>i</sub>f + ½h<sub>i</sub>f²] + Ω. Group rows by leaf: Σ<sub>j</sub>[G<sub>j</sub>w<sub>j</sub> + ½(H<sub>j</sub>+λ)w<sub>j</sub>²] + γT. Each leaf is a parabola; derivative zero gives w<sub>j</sub>* = −G<sub>j</sub>/(H<sub>j</sub>+λ). Plugging back gives the structure score −½ΣG<sub>j</sub>²/(H<sub>j</sub>+λ) + γT.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the split gain and explain each term.</summary><div class="qa-body">Gain = ½[G<sub>L</sub>²/(H<sub>L</sub>+λ) + G<sub>R</sub>²/(H<sub>R</sub>+λ) − G²/(H+λ)] − γ: score of the left child plus the right child minus the parent's, minus the price of one extra leaf. Split only if positive. (The library drops the ½.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are g and h for log loss, and what do they mean?</summary><div class="qa-body">g = p − y (how wrong and in which direction), h = p(1−p) (curvature; large near p = 0.5, tiny for confident rows). For squared error, g = ŷ − y and h = 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use the second derivative at all?</summary><div class="qa-body">It gives a Newton step instead of a fixed-size gradient step: corrections are scaled by how curved the loss is, which needs fewer trees. It also makes split finding and leaf values come from one formula that works for any twice-differentiable loss: you only supply g and h.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does min_child_weight actually limit?</summary><div class="qa-body">The sum of Hessians in each child. For squared error that is the row count; for log loss it is Σp(1−p), so confident rows count very little and many more rows are needed. It stops leaves built on tiny or already-well-predicted groups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do gamma and lambda differ?</summary><div class="qa-body">λ is L2 on leaf values: it shrinks them (most for small leaves) and can make weak splits unprofitable. γ is a fixed price per leaf: it removes splits whose gain is below γ, applied as bottom-up pruning after the tree is grown.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does XGBoost handle missing values?</summary><div class="qa-body">At each split it tries sending all missing rows left and all right, and keeps the direction with the higher gain. Prediction-time missing values follow that learned default. Only non-missing entries are scanned, so sparse data is cheap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the weighted quantile sketch and why weight by h?</summary><div class="qa-body">A mergeable summary that proposes candidate cut-offs so that each bucket holds about the same Σh. The per-row objective equals ½h(f − (−g/h))² + const, i.e. weighted least squares with weights h, so rows with large h matter more and deserve finer cut-offs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>exact vs approx vs hist?</summary><div class="qa-body">exact tries every distinct value (pre-sorted blocks); approx uses Hessian-weighted quantile candidates re-proposed each round; hist bins each column once (≤ 256 bins), accumulates g/h histograms and uses parent − child subtraction. hist is the default: as accurate and much faster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where is XGBoost parallel?</summary><div class="qa-body">Inside each tree: split search over columns / histogram building is multi-threaded. Trees themselves are sequential because each depends on the previous predictions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you handle a 1:50 class imbalance in XGBoost?</summary><div class="qa-body">Use a ranking metric (AUC-PR) for early stopping; try scale_pos_weight between 1 and neg/pos (≈ 50) and possibly max_delta_step 1–10; or keep weights at 1 and choose the decision threshold on validation data. If probabilities are needed, recalibrate after weighting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what did XGBoost add to Gradient Boosting, and what did LightGBM and CatBoost then add to XGBoost?</summary><div class="qa-body">XGBoost: Newton step in split finding, regularised objective (λ, α, γ), learned missing directions, approximate/hist split finding, parallel/out-of-core system. LightGBM: much more speed (histograms everywhere, leaf-wise growth, GOSS row sampling, EFB feature bundling, native categoricals). CatBoost: ordered target statistics and ordered boosting to remove target leakage, symmetric trees, strong defaults for categorical data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is XGBoost's leaf formula related to ridge regression and to Random Forest?</summary><div class="qa-body">λ in w* = −G/(H+λ) is exactly ridge's L2 shrinkage, applied to leaf values ("add λ imaginary rows with zero residual"). Column subsampling (colsample_*) is Random Forest's trick, used to decorrelate boosted trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your XGBoost model has train AUC 0.999 and validation AUC 0.80. What do you change, in what order?</summary><div class="qa-body">Make sure early stopping is on. Then reduce complexity: lower max_depth (or max_leaves), raise min_child_weight, add subsample/colsample around 0.7–0.8, raise lambda, try gamma; lower learning rate with more rounds. Also check for leakage features: a 0.999 train score often means a column that contains the answer.</div></details>
</main>
`
});
