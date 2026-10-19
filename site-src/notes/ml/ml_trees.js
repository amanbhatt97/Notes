// notes/ml/ml_trees.js — The Tree Family: Map & How to Choose
Object.assign(TOPIC_CONTENT, {
  "ml_trees": `<main>
  <h1>The Tree Family: Map &amp; How to Choose</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>The Tree Family: Map &amp; How to Choose</span></div>
  <p class="lead">Start here. This is the opening note of the Tree-Based Models group, and its job is to give you the whole map before you walk the roads. Tree models are the strongest family of classic machine learning for table data (rows and columns, like an Excel sheet): the decision tree, bagging, random forest, Extra Trees, AdaBoost, gradient boosting, XGBoost, LightGBM, CatBoost, and stacking. They are not fourteen unrelated algorithms. They are one family, and every member was invented to fix a weakness of the one before it. This page shows the family tree, tells that story, gives a one-paragraph summary of every note in reading order, runs every member on the same dataset, compares them side by side, and ends with a guide for choosing one. Each child note then teaches its model completely, from the formula worked by hand to production code.</p>

  <h2 id="mt-fits" class="open"><span class="num">↖</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 600 316" width="600">
<line x1="300" y1="28" x2="300" y2="42" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="70" x2="300" y2="84" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="112" x2="95" y2="132" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="112" x2="300" y2="132" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="112" x2="505" y2="132" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="95" y1="160" x2="60" y2="180" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="110.0" y1="194" x2="117.5" y2="194" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="160" x2="250" y2="180" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="295.0" y1="194" x2="300.0" y2="194" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="355" y1="208" x2="255" y2="228" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="355" y1="208" x2="355" y2="228" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="355" y1="208" x2="455" y2="228" stroke="currentColor" stroke-opacity="0.45"/>
<rect x="70" y="270" width="460" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.45"/>
<text x="300" y="284" text-anchor="middle" class="tm" font-size="10">used by every model above</text>
<rect x="225.0" y="0" width="150" height="28" rx="6" class="fg sg" stroke-width="2.5"/>
<text x="300" y="18" text-anchor="middle" font-size="11" font-weight="700">Map &amp; How to Choose</text>
<rect x="235.0" y="42" width="130" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="60" text-anchor="middle" font-size="11">Decision Trees</text>
<rect x="225.0" y="84" width="150" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="102" text-anchor="middle" font-size="11">Ensemble Learning</text>
<rect x="35.0" y="132" width="120" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="95" y="150" text-anchor="middle" font-size="11">Bagging</text>
<rect x="235.0" y="132" width="130" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="150" text-anchor="middle" font-size="11">How Boosting Works</text>
<rect x="440.0" y="132" width="130" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="505" y="150" text-anchor="middle" font-size="11">Stacking &amp; Voting</text>
<rect x="10.0" y="180" width="100" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="60" y="198" text-anchor="middle" font-size="11">Random Forest</text>
<rect x="117.5" y="180" width="95" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="165" y="198" text-anchor="middle" font-size="11">Extra Trees</text>
<rect x="205.0" y="180" width="90" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="250" y="198" text-anchor="middle" font-size="11">AdaBoost</text>
<rect x="300.0" y="180" width="110" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="355" y="198" text-anchor="middle" font-size="11">Gradient Boosting</text>
<rect x="212.5" y="228" width="85" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="255" y="246" text-anchor="middle" font-size="11">XGBoost</text>
<rect x="312.5" y="228" width="85" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="355" y="246" text-anchor="middle" font-size="11">LightGBM</text>
<rect x="412.5" y="228" width="85" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="455" y="246" text-anchor="middle" font-size="11">CatBoost</text>
<rect x="90.0" y="278" width="190" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="185" y="296" text-anchor="middle" font-size="11">Feature Importance &amp; SHAP</text>
<rect x="320.0" y="278" width="190" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="415" y="296" text-anchor="middle" font-size="11">Tuning &amp; Production</text>
</svg><figcaption>The Tree-Based Models group as it appears in the sidebar. You are on the top node (green): the map of everything below it.</figcaption></figure>
  <ul>
    <li><strong>Came from:</strong> <a class="xref" data-note="ml_regression">Regression</a> and <a class="xref" data-note="ml_classification">Classification</a> taught linear and logistic regression. They draw one straight line (or flat surface) through the data, need scaled numbers, and miss patterns like "churns only if tenure is short <em>and</em> complaints are high" unless you build that column by hand. <a class="xref" data-note="ml_core">Core Concepts</a> gave you overfitting, train / validation / test and the bias-variance trade-off, which is the language this whole group speaks.</li>
    <li><strong>What this note adds:</strong> the big picture. The family tree, the chain of "weakness → fix" that connects the members, a summary and link for every child note, one comparison table, and a decision guide. No single model is taught in depth here; each has its own note.</li>
    <li><strong>Leads to:</strong> <a class="xref" data-note="ml_dtree">Decision Trees</a>, the root of the family and the next note to read. After the group, <a class="xref" data-note="ml_evaluation">Model Evaluation</a>, <a class="xref" data-note="ml_timeseries">Time Series Forecasting</a> and <a class="xref" data-note="ml_recsys">Recommendation Systems</a> all use these models.</li>
  </ul>

  <h2 id="mt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">The Tree Family</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The root: decision tree</div>
        <ul>
          <li><b>How</b> — greedy yes/no splits that lower impurity; leaf = class vote or mean</li>
          <li><b>Entropy</b> −Σp log₂p · <b>Gini</b> 1−Σp² · <b>IG</b> = parent − weighted children</li>
          <li><b>ID3 → C4.5 → CART</b>; pruning (cost-complexity α)</li>
          <li>⚠ High variance: small data change → different tree</li>
          <li>💡 A doctor's checklist of yes/no questions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The ensemble idea</div>
        <ul>
          <li><b>Var(avg)</b> = ρσ² + (1−ρ)σ²/n → lower ρ, more models</li>
          <li><b>Condorcet</b> — 11 voters at 60% → majority right 75%</li>
          <li><b>Parallel</b> (bagging) cuts variance · <b>sequential</b> (boosting) cuts bias · <b>blend</b> (stacking)</li>
          <li>💡 Wisdom of crowds: average many independent guesses</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bagging branch</div>
        <ul>
          <li><b>Bagging</b> — bootstrap rows (63.2% unique) + average; OOB error for free</li>
          <li><b>Random Forest</b> — + random √d features per split → trees less alike</li>
          <li><b>Extra Trees</b> — + random thresholds, all rows → fastest</li>
          <li>More trees never overfit; little tuning</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Boosting branch</div>
        <ul>
          <li><b>Idea</b> — F_m = F_m−1 + ν·h_m; each tree fixes the team's errors</li>
          <li><b>AdaBoost</b> — reweight wrong rows; α = ½ln((1−ε)/ε)</li>
          <li><b>GBM</b> — fit pseudo-residuals −∂L/∂F of any loss</li>
          <li><b>XGBoost</b> — 2nd order, w* = −G/(H+λ), γ · <b>LightGBM</b> — histograms, leaf-wise, GOSS, EFB · <b>CatBoost</b> — ordered target stats, symmetric trees</li>
          <li>⚠ Too many rounds overfit → early stopping</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Blending &amp; tools</div>
        <ul>
          <li><b>Voting</b> — average members · <b>Stacking</b> — meta-model on out-of-fold predictions</li>
          <li><b>Explain</b> — MDI (biased), permutation, SHAP (adds up exactly)</li>
          <li><b>Tune</b> — lr + early stopping → tree size → leaf size → sampling → regularisation</li>
          <li><b>Production</b> — imbalance, calibration, size/latency, drift</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How to choose</div>
        <ul>
          <li>Must read every rule → <b>pruned tree</b></li>
          <li>First baseline → <b>random forest</b></li>
          <li>Best accuracy, big clean table → <b>LightGBM / XGBoost</b> + early stopping</li>
          <li>Many text categories, little tuning time → <b>CatBoost</b></li>
          <li>Last 0.3% matters → <b>blend</b> forest + booster</li>
          <li>⚠ No tree model extrapolates beyond the target range it saw</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mt-family"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Family Tree</span><span class="rm-sub">Every note as a node, every arrow labelled</span></div></div>
      <div class="rm-item rm-done" data-target="mt-story"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Story Chain</span><span class="rm-sub">Each model fixes the last one's weakness</span></div></div>
      <div class="rm-item rm-done" data-target="mt-guide"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Reading Guide</span><span class="rm-sub">One paragraph per note, in order</span></div></div>
      <div class="rm-item rm-done" data-target="mt-ideas"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Five Ideas Behind Everything</span><span class="rm-sub">Splits, variance, randomness, gradients, brakes</span></div></div>
      <div class="rm-item rm-done" data-target="mt-race"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Every Member, One Dataset</span><span class="rm-sub">13 models on the same churn data</span></div></div>
      <div class="rm-item rm-done" data-target="mt-cmp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Big Comparison Table</span><span class="rm-sub">Bias/variance, speed, missing, categoricals, …</span></div></div>
      <div class="rm-item rm-done" data-target="mt-choose"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Which One When</span><span class="rm-sub">A decision guide</span></div></div>
      <div class="rm-item rm-done" data-target="mt-limits"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">What No Tree Model Can Do</span><span class="rm-sub">Extrapolation, smooth lines, raw images/text</span></div></div>
      <div class="rm-item rm-done" data-target="mt-conn"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How the Group Connects</span><span class="rm-sub">Notes before and after</span></div></div>
      <div class="rm-item rm-done" data-target="mt-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Across the whole family</span></div></div>
      <div class="rm-item rm-done" data-target="mt-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Top connection interview questions</span></div></div>
    </div>
  </div>

  <h2 id="mt-family"><span class="num">01</span>The Family Tree</h2>
  <p>Here is the whole group on one picture. Every box is one note in the sidebar. Read it top-down: that is also roughly the order in which the ideas were invented (1984 CART → 1996 bagging → 1997 AdaBoost → 2001 random forest and gradient boosting → 2006 Extra Trees → 2014–2017 XGBoost, LightGBM, CatBoost), because each was built to fix a problem in the one above.</p>
  <figure class="viz"><svg viewBox="0 0 760 640" width="760">
<defs><marker id="mt-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="275" y="8" width="210" height="44" rx="8" class="fs" stroke="currentColor"/>
<text x="380" y="27" text-anchor="middle" font-size="14" font-weight="700">Decision Trees</text>
<text x="380" y="44" text-anchor="middle" class="tm" font-size="11">entropy · Gini · CART · pruning</text>
<line x1="380" y1="52" x2="380" y2="98" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="392" y="70" class="tr" font-size="11">weakness: high variance</text>
<text x="392" y="85" class="tm" font-size="11">fix: combine many models</text>
<rect x="265" y="100" width="230" height="44" rx="8" class="fv" stroke="currentColor"/>
<text x="380" y="119" text-anchor="middle" font-size="14" font-weight="700">Ensemble Learning: The Idea</text>
<text x="380" y="136" text-anchor="middle" class="tm" font-size="11">Var = ρσ² + (1−ρ)σ²/n · Condorcet</text>
<line x1="310" y1="144" x2="140" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="390" y1="144" x2="420" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="460" y1="144" x2="655" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="200" y="168" text-anchor="end" class="tm" font-size="11">in parallel → cuts variance</text>
<text x="408" y="192" text-anchor="end" class="tm" font-size="11">in sequence → cuts bias</text>
<text x="590" y="166" class="tm" font-size="11">blend different models</text>
<rect x="55" y="210" width="170" height="44" rx="8" class="fb sb" fill-opacity="0.25"/>
<text x="140" y="229" text-anchor="middle" font-size="14" font-weight="700">Bagging &amp; Bootstrap</text>
<text x="140" y="246" text-anchor="middle" class="tm" font-size="11">resample rows · OOB · 63.2%</text>
<rect x="335" y="210" width="170" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="229" text-anchor="middle" font-size="14" font-weight="700">How Boosting Works</text>
<text x="420" y="246" text-anchor="middle" class="tm" font-size="11">F_m = F_m−1 + ν·h_m</text>
<rect x="580" y="210" width="170" height="44" rx="8" class="fg sg" fill-opacity="0.25"/>
<text x="665" y="229" text-anchor="middle" font-size="14" font-weight="700">Stacking &amp; Voting</text>
<text x="665" y="246" text-anchor="middle" class="tm" font-size="11">meta-model on OOF preds</text>
<line x1="140" y1="254" x2="140" y2="300" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="150" y="276" class="tm" font-size="11">+ random features</text>
<text x="150" y="290" class="tm" font-size="11">at every split</text>
<rect x="65" y="302" width="150" height="44" rx="8" class="fb sb" fill-opacity="0.25"/>
<text x="140" y="321" text-anchor="middle" font-size="14" font-weight="700">Random Forest</text>
<text x="140" y="338" text-anchor="middle" class="tm" font-size="11">lower ρ between trees</text>
<line x1="140" y1="346" x2="140" y2="392" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="150" y="368" class="tm" font-size="11">+ random thresholds,</text>
<text x="150" y="382" class="tm" font-size="11">no bootstrap</text>
<rect x="65" y="394" width="150" height="44" rx="8" class="fb sb" fill-opacity="0.25"/>
<text x="140" y="413" text-anchor="middle" font-size="14" font-weight="700">Extra Trees</text>
<text x="140" y="430" text-anchor="middle" class="tm" font-size="11">even more random, faster</text>
<line x1="420" y1="254" x2="420" y2="300" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="430" y="276" class="tm" font-size="11">first answer:</text>
<text x="430" y="290" class="tm" font-size="11">reweight wrong rows</text>
<rect x="345" y="302" width="150" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="321" text-anchor="middle" font-size="14" font-weight="700">AdaBoost</text>
<text x="420" y="338" text-anchor="middle" class="tm" font-size="11">α = ½ ln((1−ε)/ε)</text>
<line x1="420" y1="346" x2="420" y2="392" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="430" y="368" class="tm" font-size="11">generalised: fit the</text>
<text x="430" y="382" class="tm" font-size="11">gradient of any loss</text>
<rect x="335" y="394" width="170" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="413" text-anchor="middle" font-size="14" font-weight="700">Gradient Boosting</text>
<text x="420" y="430" text-anchor="middle" class="tm" font-size="11">pseudo-residuals −∂L/∂F</text>
<line x1="395" y1="438" x2="268" y2="490" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="420" y1="438" x2="420" y2="490" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="445" y1="438" x2="572" y2="490" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="318" y="458" text-anchor="end" class="tm" font-size="11">engineered GBM:</text>
<text x="318" y="472" text-anchor="end" class="tm" font-size="11">same idea, faster, safer</text>
<rect x="190" y="492" width="156" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="268" y="511" text-anchor="middle" font-size="14" font-weight="700">XGBoost</text>
<text x="268" y="528" text-anchor="middle" class="tm" font-size="11">w* = −G/(H+λ) · γ</text>
<rect x="348" y="492" width="144" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="511" text-anchor="middle" font-size="14" font-weight="700">LightGBM</text>
<text x="420" y="528" text-anchor="middle" class="tm" font-size="11">histograms · leaf-wise</text>
<rect x="494" y="492" width="156" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="572" y="511" text-anchor="middle" font-size="14" font-weight="700">CatBoost</text>
<text x="572" y="528" text-anchor="middle" class="tm" font-size="11">ordered TS · oblivious</text>
<path d="M215 330 C 280 360, 300 395, 335 410" fill="none" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.7" marker-end="url(#mt-fa)"/>
<text x="292" y="358" class="tm" font-size="10.5">borrows row/column</text>
<text x="292" y="371" class="tm" font-size="10.5">subsampling</text>
<path d="M665 254 L665 470 L652 500" fill="none" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.7"/>
<text x="657" y="300" text-anchor="end" class="tm" font-size="10.5">its members can be</text>
<text x="657" y="313" text-anchor="end" class="tm" font-size="10.5">any model here,</text>
<text x="657" y="326" text-anchor="end" class="tm" font-size="10.5">e.g. RF + LightGBM</text>
<rect x="20" y="566" width="720" height="66" rx="8" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.6"/>
<text x="380" y="582" text-anchor="middle" class="tm" font-size="11">tools that apply to every model above</text>
<rect x="110" y="590" width="250" height="34" rx="7" class="fs" stroke="currentColor"/>
<text x="235" y="612" text-anchor="middle" font-size="13" font-weight="700">Feature Importance &amp; SHAP</text>
<rect x="400" y="590" width="250" height="34" rx="7" class="fs" stroke="currentColor"/>
<text x="525" y="612" text-anchor="middle" font-size="13" font-weight="700">Tuning &amp; Production</text>
</svg><figcaption>The family tree of the Tree-Based Models group: every box is one note. Solid arrows: "was built from / fixes the weakness of". Dashed arrows: ideas that cross branches. Blue = bagging branch (cuts variance), teal = boosting branch (cuts bias), green = blending; the dashed bar holds tools for the whole family.</figcaption></figure>
  <p>Three things to notice before reading any detail:</p>
  <ul>
    <li><strong>There is one root.</strong> Every model in this group is made of decision trees. Learn the tree properly (entropy, Gini, splits, pruning) and every later note becomes "the same trees, combined in a new way".</li>
    <li><strong>There are two big branches with opposite goals.</strong> The blue bagging branch builds many deep, independent trees and averages them: it attacks <em>variance</em> (the shakiness of one tree). The teal boosting branch builds many small trees in sequence, each correcting the team so far: it attacks <em>bias</em> (patterns one small tree misses). Section 04 shows why these are different jobs.</li>
    <li><strong>The branches borrow from each other.</strong> Modern boosters subsample rows and columns, a trick taken from the bagging branch (dashed arrow). Stacking can blend members of both branches. The tools in the dashed bar (explaining, tuning, shipping) apply to every box.</li>
  </ul>
  <table class="tbl">
    <tr><th>Arrow</th><th>Relation in plain words</th><th>Read in</th></tr>
    <tr><td>Decision Trees → Ensembles</td><td>One tree is unstable; many combined are not</td><td><a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a></td></tr>
    <tr><td>Ensembles → Bagging</td><td>Make many trees different by training each on a bootstrap resample, then average</td><td><a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a></td></tr>
    <tr><td>Bagging → Random Forest</td><td>Same, plus each split only sees a random few features, so trees are less alike</td><td><a class="xref" data-note="ml_rf">Random Forest</a></td></tr>
    <tr><td>Random Forest → Extra Trees</td><td>Same, plus random thresholds and no bootstrap: more random, faster</td><td><a class="xref" data-note="ml_extratrees">Extra Trees</a></td></tr>
    <tr><td>Ensembles → Boosting</td><td>Train trees one after another, each on what the team still gets wrong</td><td><a class="xref" data-note="ml_boosting">How Boosting Works</a></td></tr>
    <tr><td>Boosting → AdaBoost</td><td>The first working booster: up-weight misclassified rows</td><td><a class="xref" data-note="ml_adaboost">AdaBoost</a></td></tr>
    <tr><td>AdaBoost → Gradient Boosting</td><td>Generalised: every tree fits the negative gradient of any loss</td><td><a class="xref" data-note="ml_gbm">Gradient Boosting</a></td></tr>
    <tr><td>Gradient Boosting → XGBoost</td><td>Second-order (Newton) steps, regularised leaves, missing-value directions, speed</td><td><a class="xref" data-note="ml_xgboost">XGBoost</a></td></tr>
    <tr><td>Gradient Boosting → LightGBM</td><td>Histogram bins, leaf-wise growth, GOSS and EFB: the fastest</td><td><a class="xref" data-note="ml_lightgbm">LightGBM</a></td></tr>
    <tr><td>Gradient Boosting → CatBoost</td><td>Leak-free categorical encoding (ordered target statistics), ordered boosting, symmetric trees</td><td><a class="xref" data-note="ml_catboost">CatBoost</a></td></tr>
    <tr><td>Ensembles → Stacking &amp; Voting</td><td>Blend <em>different</em> models; a meta-model learns how much to trust each</td><td><a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a></td></tr>
    <tr><td>Dashed bar</td><td>Open the black box; tune, calibrate, ship and monitor any member</td><td><a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>, <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a></td></tr>
  </table>
  <div class="bridge"><b>What's still missing?</b> A picture shows <em>that</em> the models are related. To remember the group you need <em>why</em> each one exists: which weakness of the previous one it fixes. That is the story chain.</div>

  <h2 id="mt-story"><span class="num">02</span>The Story Chain</h2>
  <p>Read this list top to bottom once, slowly. Each step names what the model does well, then the weakness that forced the next step. If you can retell this chain in your own words, you understand how the group fits together; the child notes fill in the maths.</p>
  <ol class="story">
    <li><b>Decision Tree</b><span>Learns readable if-else rules by asking the question that most reduces impurity (entropy or Gini). Handles bends, interactions and mixed column types; needs no scaling. → <em>Weakness:</em> grown fully, it memorises (train 1.000, validation 0.773 on our data), and a slightly different sample gives a very different tree. High variance. <a class="xref" data-note="ml_dtree">Decision Trees</a></span></li>
    <li><b>Pruning</b><span>Stops the tree early (max_depth, min_samples_leaf) or cuts it back (cost-complexity α). Memorises less. → <em>Weakness:</em> it is still one unstable model, and making it simpler adds bias; on our data the best pruned tree tops out around 0.81. <a class="xref" data-note="ml_dtree">Decision Trees</a></span></li>
    <li><b>Ensembles</b><span>Many models vote, and their independent mistakes cancel: the variance of an average of n models is ρσ² + (1−ρ)σ²/n. → <em>Weakness:</em> we have only one training table. How do we get many models that are good but <em>different</em> (low ρ)? <a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a></span></li>
    <li><b>Bagging</b><span>Trains each tree on a bootstrap resample of the rows (about 63.2% unique rows each) and averages; the left-out rows give a free out-of-bag test. one tree 0.78 → 100 bagged trees 0.87 on our test set. → <em>Weakness:</em> the trees still look alike, because the single strongest feature wins the top split in nearly all of them, so ρ stays high. <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a></span></li>
    <li><b>Random Forest</b><span>Lets each split choose from only a random subset of features (√d for classification), so trees are forced to differ: lower ρ, and faster. → <em>Weakness:</em> averaging only lowers variance. If every tree misses the same pattern (bias), a thousand trees miss it too. <a class="xref" data-note="ml_rf">Random Forest</a></span></li>
    <li><b>Extra Trees</b><span>Also draws the threshold at random and uses all rows: even less alike, even faster, similar accuracy. → <em>Weakness:</em> same limit as the forest: no tree ever learns from another tree's mistakes. <a class="xref" data-note="ml_extratrees">Extra Trees</a></span></li>
    <li><b>Boosting</b><span>A new idea: build small trees one after another, each fitted to what the team so far gets wrong, and add it with a small step: F_m = F_m−1 + ν·h_m. Shared mistakes shrink round by round, so bias falls. → <em>Weakness:</em> how exactly should the next tree "focus on the mistakes"? <a class="xref" data-note="ml_boosting">How Boosting Works</a></span></li>
    <li><b>AdaBoost</b><span>The first answer: increase the weight of misclassified rows and give each stump a vote α = ½ln((1−ε)/ε). → <em>Weakness:</em> it is tied to one loss (exponential), so a few mislabeled rows get huge weights, and it does not extend cleanly to regression or custom costs. <a class="xref" data-note="ml_adaboost">AdaBoost</a></span></li>
    <li><b>Gradient Boosting</b><span>The general answer: every new tree fits the negative gradient of <em>any</em> differentiable loss (for squared error, simply the residuals). → <em>Weakness:</em> the classic implementation is slow (it tries every threshold), has few brakes, and overfits if you keep adding trees. <a class="xref" data-note="ml_gbm">Gradient Boosting</a></span></li>
    <li><b>XGBoost</b><span>Uses gradient and curvature (Hessian) for better steps, puts penalties λ and γ inside the split search, learns where missing values should go, and runs in parallel. → <em>Weakness:</em> exact split search and level-by-level growth are still heavy on very large data. <a class="xref" data-note="ml_xgboost">XGBoost</a></span></li>
    <li><b>LightGBM</b><span>Buckets each feature into ≤ 255 histogram bins, grows the most useful leaf first, samples rows by gradient size (GOSS) and bundles sparse columns (EFB): usually the fastest. → <em>Weakness:</em> text categories and target leakage are still largely your problem, and leaf-wise trees overfit small data. <a class="xref" data-note="ml_lightgbm">LightGBM</a></span></li>
    <li><b>CatBoost</b><span>Encodes categories with ordered target statistics (each row sees only earlier rows' labels), boosts in the same ordered way, and uses symmetric trees: strong results with defaults. → <em>Weakness:</em> slower per tree on purely numeric data. <a class="xref" data-note="ml_catboost">CatBoost</a></span></li>
    <li><b>Stacking &amp; Voting</b><span>Forests and boosters make different mistakes, so blend them: average (voting) or let a meta-model learn the blend from out-of-fold predictions (stacking). → <em>Weakness:</em> small gains (≈ +0.003 AUC here) for several times the cost and complexity. <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a></span></li>
    <li><b>Feature Importance &amp; SHAP</b><span>Hundreds of trees cannot be read aloud, so these methods give back the "why": which columns matter, how the prediction moves, why this row got this score. → <em>Weakness:</em> they explain the model, not the real world. <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a></span></li>
    <li><b>Tuning &amp; Production</b><span>Pick the right knobs, validate honestly, handle rare classes, calibrate probabilities, save, serve and monitor the model. → This is where the story meets a real system. <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a></span></li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket team over the years. First, one star player decides everything (one tree): brilliant on his day, unreliable on others. Then a selection committee that averages many independent opinions (bagging), and makes sure the selectors do not all watch the same matches (random forest). Then a coaching staff where each new coach works only on what the team still does badly (boosting), with better video analysis and fitness data each generation (XGBoost, LightGBM, CatBoost). Finally a captain who listens to both the selectors and the coaches and has learned whose advice to trust when (stacking).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> A chain tells you why the notes exist. Before reading them, it helps to know what each one contains and in what order to read them.</div>

  <h2 id="mt-guide"><span class="num">03</span>Reading Guide: Every Note in Order</h2>
  <p>Read the notes in this order; each one assumes the ones before it. The summaries below tell you what you will be able to do after each note.</p>
  <h3>The root</h3>
  <p><strong>1. <a class="xref" data-note="ml_dtree">Decision Trees</a>.</strong> The foundation of everything else. You build a whole tree by hand on a classic 14-row table: compute entropy (the "surprise" in a node), information gain for every column at the root, pick the best, recurse until the leaves are pure. Then gain ratio (C4.5's fix for many-valued columns), Gini impurity and why it usually gives the same tree, ID3 vs C4.5 vs CART, thresholds for numeric columns, regression trees that minimise squared error, pre-pruning knobs, cost-complexity pruning with its α path, missing values, axis-aligned boundaries, and a from-scratch implementation that matches scikit-learn.</p>
  <h3>The ensemble idea</h3>
  <p><strong>2. <a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a>.</strong> Why combining models works, in numbers. The Condorcet jury theorem (eleven 60%-accurate voters are right 75% of the time if they are independent), the variance of an average of correlated models ρσ² + (1−ρ)σ²/n worked with real values, what averaging does to bias and to variance, the sources of diversity, the taxonomy (bagging, boosting, stacking, voting; homogeneous vs heterogeneous), and when ensembles do not help.</p>
  <h3>The bagging branch</h3>
  <p><strong>3. <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a>.</strong> Sampling rows with replacement, the derivation of the famous 63.2% ((1 − 1/n)ⁿ → 1/e), majority vote vs probability averaging, why unstable learners (trees) gain a lot and stable ones (kNN, linear models) barely gain, out-of-bag error as free validation, pasting, random subspaces and random patches, and bagging from scratch.</p>
  <p><strong>4. <a class="xref" data-note="ml_rf">Random Forest</a>.</strong> Why bagged trees stay correlated (one dominant feature), how per-split feature sampling (max_features) lowers that correlation, the full algorithm step by step, every important hyperparameter and its effect, OOB score, MDI vs permutation importance, regression forests, class imbalance, proximities, why forests cannot extrapolate, memory and speed, and a forest built from scratch on scikit-learn trees.</p>
  <p><strong>5. <a class="xref" data-note="ml_extratrees">Extra Trees</a>.</strong> Random thresholds as well as random features, no bootstrap by default, one random split worked by hand, the effect on bias, variance and speed, and when it beats the random forest.</p>
  <h3>The boosting branch</h3>
  <p><strong>6. <a class="xref" data-note="ml_boosting">How Boosting Works</a>.</strong> Weak learners, the additive model F_m = F_m−1 + ν·h_m, forward stagewise fitting, shrinkage, why boosting reduces bias, its sensitivity to noise and to too many rounds, a boosting-vs-bagging table, and the family map from AdaBoost to CatBoost with what each changed.</p>
  <p><strong>7. <a class="xref" data-note="ml_adaboost">AdaBoost</a>.</strong> Sample weights, decision stumps, weighted error ε, the vote α = ½·ln((1−ε)/ε), the weight update, a full three-round hand trace on ten points, the link to exponential loss, SAMME for many classes, AdaBoost.R2 for regression, and a from-scratch version that matches scikit-learn.</p>
  <p><strong>8. <a class="xref" data-note="ml_gbm">Gradient Boosting</a>.</strong> Residual fitting by hand (three rounds on six points), why the pseudo-residual is the negative gradient, losses for regression (squared, absolute, Huber) and classification (log loss with a log-odds start), leaf values by line search, learning rate vs number of trees, depth, subsampling, early stopping, sklearn's GradientBoosting vs HistGradientBoosting, and from-scratch versions that match the library.</p>
  <p><strong>9. <a class="xref" data-note="ml_xgboost">XGBoost</a>.</strong> The regularised objective, the second-order Taylor expansion with g and h, the optimal leaf weight w* = −G/(H+λ), the split gain formula worked with numbers, exact vs histogram split finding, the sparsity-aware default direction for missing values, and every important parameter (eta, max_depth, min_child_weight, gamma, subsample, colsample_bytree, lambda, alpha, scale_pos_weight, tree_method).</p>
  <p><strong>10. <a class="xref" data-note="ml_lightgbm">LightGBM</a>.</strong> Histogram binning worked by hand, level-wise vs leaf-wise growth, num_leaves vs max_depth, min_data_in_leaf, GOSS (keep large gradients, sample and re-weight small ones) and EFB (bundle columns that are never non-zero together) worked, native categorical splits, and why it overfits small data.</p>
  <p><strong>11. <a class="xref" data-note="ml_catboost">CatBoost</a>.</strong> Why categorical columns are hard (one-hot blow-up, target-encoding leakage shown by hand), ordered target statistics row by row, ordered boosting, oblivious (symmetric) trees, feature combinations, defaults and parameters, and when to choose it.</p>
  <h3>Blending</h3>
  <p><strong>12. <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>.</strong> Hard, soft and weighted voting worked, level-0 models and the meta-learner, out-of-fold predictions to avoid leakage (by hand and as a diagram), blending vs stacking, multi-level stacking, and when the gain is not worth the cost.</p>
  <h3>Tools for the whole family</h3>
  <p><strong>13. <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</strong> MDI importance and its bias toward many-valued columns, permutation and drop-column importance, partial dependence and ICE curves, Shapley values computed by hand on a three-feature model, TreeSHAP, SHAP plots and interaction values, correlated-feature caveats, and why explanation is not causation.</p>
  <p><strong>14. <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</strong> Which knobs matter for each model, grid / random / successive-halving / Bayesian (Optuna) search, early stopping, honest validation (nested CV), class imbalance, probability calibration, categorical choices, model size and latency, saving and loading, drift monitoring, and a default recipe per model.</p>
  <div class="bridge"><b>What's still missing?</b> Fourteen notes can feel like fourteen topics. In fact, five ideas do almost all the work. Seeing them once, up front, makes every later note shorter.</div>

  <h2 id="mt-ideas"><span class="num">04</span>Five Ideas Behind Everything</h2>
  <h3>Idea 1: greedy splitting on impurity</h3>
  <p>Every tree in every model is grown the same way: at each node, try every (feature, threshold) pair and keep the one whose children are "purest". Purity is measured by Gini (1 − Σp²) or entropy (−Σ p log₂ p) for classes, and by variance (squared error) for numbers. Tiny example: a node with 4 churners and 6 stayers has Gini 1 − (0.4² + 0.6²) = 0.48. A split into [4 churn, 1 stay] and [0 churn, 5 stay] gives children 0.32 and 0, weighted 0.5·0.32 + 0.5·0 = 0.16, so the split removes 0.48 − 0.16 = 0.32 of impurity. The tree picks the split that removes the most. Boosters use the same search but score splits by how much they reduce the boosting loss (XGBoost's gain formula is this idea with gradients). Taught in <a class="xref" data-note="ml_dtree">Decision Trees</a>.</p>
  <h3>Idea 2: bias and variance, and what averaging can fix</h3>
  <p>Error on new data = bias² + variance + noise (<a class="xref" data-note="ml_core">Core Concepts</a>). A deep tree has low bias and high variance; a stump has high bias and low variance. Averaging n models, each with variance σ² and pairwise correlation ρ, gives variance <strong>ρσ² + (1−ρ)σ²/n</strong>. Worked: σ² = 1, ρ = 0.5. One tree: 1. Ten trees: 0.5 + 0.5/10 = 0.55. A thousand: 0.5 + 0.0005 ≈ 0.50. More trees can only remove the second term; the floor is ρσ². Lower ρ (random forest: 0.3) → floor 0.3. Averaging never changes bias. That single formula explains why the bagging branch exists (lower variance), why random forest beat bagging (lower ρ), and why boosting was needed (bias). Taught in <a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a>.</p>
  <h3>Idea 3: randomness as a tool</h3>
  <p>Randomness is used on purpose to make trees different: bootstrap rows (bagging), random features per split (random forest), random thresholds (Extra Trees), row and column subsampling per tree (stochastic gradient boosting, XGBoost, LightGBM), gradient-based row sampling (GOSS), random permutations for ordered statistics (CatBoost). Every one of them trades a little accuracy per tree for lower correlation between trees or less overfitting.</p>
  <h3>Idea 4: additive models fitted by gradient steps</h3>
  <p>A booster is a sum: F(x) = F₀ + ν·h₁(x) + ν·h₂(x) + … Each new tree h_m is fitted to the negative gradient of the loss at the current prediction. Worked, squared error: three houses priced 50, 60, 100 (lakh). Start F₀ = mean = 70. Residuals −20, −10, +30. A stump that splits off the third house predicts −15 for the first two and +30 for the third. With ν = 0.5: new predictions 62.5, 62.5, 85, and squared error falls from 400 + 100 + 900 = 1400 to 156.25 + 6.25 + 225 = 387.5. Repeat. This is gradient descent where each step is a tree (<a class="xref" data-note="m_optimization">Optimization</a>, <a class="xref" data-note="m_calculus">Calculus</a>). Taught in <a class="xref" data-note="ml_boosting">How Boosting Works</a> and <a class="xref" data-note="ml_gbm">Gradient Boosting</a>.</p>
  <h3>Idea 5: brakes (regularisation)</h3>
  <p>Every member has knobs that stop it from memorising: depth and leaf size for any tree, α for pruning, learning rate and number of rounds (with early stopping) for boosters, λ and γ penalties on leaves in XGBoost, num_leaves and min_data_in_leaf in LightGBM, l2_leaf_reg in CatBoost. They all do one thing: make each tree's contribution smaller or simpler so the model generalises. Taught across the model notes and collected in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>If a later note confuses you, ask which of the five ideas it is changing. XGBoost changes ideas 1 and 5 (a better split score, built-in penalties). LightGBM changes how idea 1 is computed (histograms) and idea 3 (GOSS). CatBoost changes idea 3 (ordered permutations) to fix a leak. Random forest changes idea 3 to improve idea 2.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Ideas are cheap; numbers decide. How do all these members actually compare on one real dataset, with the same split and the same test rows?</div>

  <h2 id="mt-race"><span class="num">05</span>Every Member, One Dataset</h2>
  <p>The whole group uses one shared dataset so that numbers in different notes can be compared. It is a synthetic customer-churn table: 20,000 customers, 12 columns from <code>make_classification</code> (6 carry signal, 2 are mixes of those, 4 are useless) plus two pure-noise columns, <code>row_noise</code> (20,000 different random values) and <code>coin_noise</code> (random 0 or 1). It is split 12,000 train / 3,000 validation / 5,000 test. The pattern is far from a straight line, which is exactly where tree models shine.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,
                           n_clusters_per_class=3, class_sep=0.8, flip_y=0.05, random_state=7)
X = pd.DataFrame(X, columns=[f"f{i}" for i in range(12)])
rng = np.random.default_rng(0)
X["row_noise"] = rng.random(20000)               # pure noise, 20,000 different values
X["coin_noise"] = rng.integers(0, 2, 20000)      # pure noise, only 0 or 1
Xtmp, Xte, ytmp, yte = train_test_split(X, y, test_size=5000, stratify=y, random_state=0)
Xtr, Xva, ytr, yva = train_test_split(Xtmp, ytmp, test_size=3000, stratify=ytmp, random_state=0)</div>
  <p>Now every member of the family, from the straight-line baseline to a blend, fitted on the same 12,000 rows and scored on the same 5,000 test rows. The boosters use learning rate 0.05 with early stopping on the validation rows; everything else is close to defaults, so this is a fair "out of the box" comparison, not a tuned contest.</p>
  <div class="fx" data-lang="py">import xgboost as xgb, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import (BaggingClassifier, ExtraTreesClassifier, AdaBoostClassifier,
                              GradientBoostingClassifier, HistGradientBoostingClassifier, VotingClassifier)
from sklearn.metrics import roc_auc_score
def run(name, make, fit=lambda m: m.fit(Xtr, ytr)):
    t0 = time.time(); m = make(); fit(m); sec = time.time() - t0
    p = m.predict_proba(Xte)[:, 1]
    print(f"{name:30s} test acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.3f}  fit {sec:5.1f}s")
    return m
run("Logistic regression (baseline)", lambda: LogisticRegression(max_iter=1000))
run("Decision tree, unlimited", lambda: DecisionTreeClassifier(random_state=0))
run("Decision tree, ccp_alpha=3e-4", lambda: DecisionTreeClassifier(ccp_alpha=3e-4, random_state=0))
run("Bagging, 100 trees", lambda: BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, n_jobs=-1, random_state=0))
run("Random forest, 300 trees", lambda: RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0))
run("Extra Trees, 300 trees", lambda: ExtraTreesClassifier(n_estimators=300, n_jobs=-1, random_state=0))
run("AdaBoost, 300 stumps", lambda: AdaBoostClassifier(n_estimators=300, random_state=0))
run("Gradient boosting (sklearn)", lambda: GradientBoostingClassifier(n_estimators=300, max_depth=3, random_state=0))
run("HistGradientBoosting + ES", lambda: HistGradientBoostingClassifier(max_iter=2000, learning_rate=0.05,
    early_stopping=True, n_iter_no_change=50, random_state=0))
run("XGBoost + ES", lambda: xgb.XGBClassifier(n_estimators=2000, learning_rate=0.05, max_depth=6, subsample=0.8,
    colsample_bytree=0.8, early_stopping_rounds=50), lambda m: m.fit(Xtr, ytr, eval_set=[(Xva, yva)], verbose=False))
run("LightGBM + ES", lambda: lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.05, subsample=0.8, subsample_freq=1,
    colsample_bytree=0.8, verbose=-1), lambda m: m.fit(Xtr, ytr, eval_X=Xva, eval_y=yva,
    callbacks=[lgb.early_stopping(50, verbose=False)]))
run("CatBoost + ES", lambda: CatBoostClassifier(iterations=2000, learning_rate=0.05, depth=6,
    early_stopping_rounds=50, verbose=False), lambda m: m.fit(Xtr, ytr, eval_set=(Xva, yva)))
run("Soft vote: RF + ET + LightGBM", lambda: VotingClassifier([
    ("rf", RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
    ("et", ExtraTreesClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
    ("lgb", lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1))], voting="soft"))</div>
  <div class="fx" data-lang="text">Logistic regression (baseline) test acc 0.596  AUC 0.629  fit   0.3s
Decision tree, unlimited       test acc 0.778  AUC 0.778  fit   0.6s
Decision tree, ccp_alpha=3e-4  test acc 0.814  AUC 0.869  fit   0.6s
Bagging, 100 trees             test acc 0.870  AUC 0.933  fit  49.6s
Random forest, 300 trees       test acc 0.877  AUC 0.936  fit  23.4s
Extra Trees, 300 trees         test acc 0.869  AUC 0.935  fit  11.9s
AdaBoost, 300 stumps           test acc 0.655  AUC 0.710  fit  18.0s
Gradient boosting (sklearn)    test acc 0.836  AUC 0.908  fit  38.2s
HistGradientBoosting + ES      test acc 0.872  AUC 0.935  fit   5.5s
XGBoost + ES                   test acc 0.872  AUC 0.935  fit   4.5s
LightGBM + ES                  test acc 0.874  AUC 0.937  fit   3.2s
CatBoost + ES                  test acc 0.874  AUC 0.938  fit  10.6s
Soft vote: RF + ET + LightGBM  test acc 0.878  AUC 0.940  fit  31.2s</div>
  <p>How to read it, top to bottom, following the story chain:</p>
  <ul>
    <li><strong>Straight line: 0.596.</strong> Logistic regression barely beats a coin. The pattern bends and interacts; this is why the group exists.</li>
    <li><strong>One tree: 0.778 → pruned 0.814.</strong> A single unlimited tree already beats the line by 18 points, but it memorises. Cost-complexity pruning adds 3.6 points and an AUC jump from 0.778 to 0.869 (an unpruned tree's probabilities are all 0 or 1, so its AUC is poor).</li>
    <li><strong>Bagging branch: 0.870 / 0.877 / 0.869.</strong> Averaging many trees adds another 6 points. The random forest matches bagging's accuracy while training each split on fewer features; Extra Trees is the fastest of the three that use 300 trees.</li>
    <li><strong>AdaBoost with stumps: 0.655.</strong> One-split trees are too weak for this pattern (it needs combinations of several columns), and 300 rounds are not enough. A deeper base tree would help; the AdaBoost note explores this.</li>
    <li><strong>Classic gradient boosting: 0.836.</strong> 300 depth-3 trees with learning rate 0.1 and no early stopping: decent but slow and not at its best number of trees.</li>
    <li><strong>Modern boosters with early stopping: 0.872–0.874, AUC 0.935–0.938.</strong> HistGradientBoosting, XGBoost, LightGBM and CatBoost all land within 0.003 AUC of each other, in a few seconds each.</li>
    <li><strong>Blend: 0.878, AUC 0.940.</strong> Averaging a forest, Extra Trees and LightGBM beats every member: they make different mistakes. The gain over the best single model is small (≈ +0.003 AUC).</li>
  </ul>
  <p>Times are from a busy shared machine with the boosting libraries on one thread, so treat them as rough ratios, not benchmarks. Library versions: scikit-learn 1.9.1, xgboost 3.4.1, lightgbm 4.7.0, catboost 1.2.10.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not read a table like this as "model X is best". On another dataset the order changes, and a few points of tuning move every row. What transfers is the <em>shape</em>: one tree &lt; pruned tree &lt; ensembles; ensembles within a point or two of each other; good features and honest validation matter more than the library.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Accuracy is one column of a real decision. Speed, missing values, categorical columns, interpretability and tuning effort decide just as often. Those go in one big table.</div>

  <h2 id="mt-cmp"><span class="num">06</span>The Big Comparison Table</h2>
  <p>Each row is one member. "Bias / variance" says which error the model mainly fights. "Missing values" says what happens if a cell is empty. "Categoricals" says whether text categories need encoding by you.</p>
  <div style="overflow-x:auto"><table class="tbl">
    <tr><th>Model</th><th>Bias / variance</th><th>Training speed</th><th>Missing values</th><th>Categoricals</th><th>Interpretability</th><th>Tuning effort</th><th>Typical use</th></tr>
    <tr><td><a class="xref" data-note="ml_dtree">Decision tree</a></td><td>Low bias, very high variance (unpruned)</td><td>Fast: O(n·d·log n)</td><td>sklearn ≥ 1.3 learns a direction for NaN; C4.5 fractional rows; CART surrogates</td><td>Encode (sklearn); C4.5 multiway natively</td><td>Highest: read the rules</td><td>Low (depth, leaf size, α)</td><td>Explainable rules, teaching, building block</td></tr>
    <tr><td><a class="xref" data-note="ml_bagging">Bagging</a></td><td>Cuts variance; bias ≈ one deep tree</td><td>n × one tree; parallel</td><td>As its base trees</td><td>Encode</td><td>Low</td><td>Low</td><td>Stabilising any unstable model</td></tr>
    <tr><td><a class="xref" data-note="ml_rf">Random forest</a></td><td>Cuts variance more (lower ρ)</td><td>Faster than bagging (√d features per split); parallel</td><td>sklearn ≥ 1.4 handles NaN natively</td><td>Encode</td><td>Low; MDI/permutation/SHAP</td><td>Very low: defaults work</td><td>First baseline on any table; noisy labels</td></tr>
    <tr><td><a class="xref" data-note="ml_extratrees">Extra Trees</a></td><td>Lowest variance of the branch, slightly more bias</td><td>Fastest of the branch (no threshold search)</td><td>Encode / impute (sklearn)</td><td>Encode</td><td>Low</td><td>Very low</td><td>Fast strong baseline, many features</td></tr>
    <tr><td><a class="xref" data-note="ml_adaboost">AdaBoost</a></td><td>Cuts bias (stumps)</td><td>Sequential; fast with stumps</td><td>As its base learner</td><td>Encode</td><td>Low–medium (stumps)</td><td>Low</td><td>Historic, teaching; clean low-noise data</td></tr>
    <tr><td><a class="xref" data-note="ml_gbm">Gradient boosting (sklearn classic)</a></td><td>Cuts bias; variance via ν, subsample</td><td>Slow: exact splits, sequential</td><td>Impute first</td><td>Encode</td><td>Low</td><td>Medium–high</td><td>Reference implementation, small data</td></tr>
    <tr><td>HistGradientBoosting (sklearn)</td><td>Same as GBM</td><td>Fast (histograms)</td><td>Native</td><td>Native (<code>categorical_features</code>)</td><td>Low</td><td>Medium</td><td>Boosting without extra libraries</td></tr>
    <tr><td><a class="xref" data-note="ml_xgboost">XGBoost</a></td><td>Cuts bias; λ, γ, subsampling for variance</td><td>Fast; parallel split search; GPU</td><td>Native: learned default direction</td><td>Native (<code>enable_categorical</code>) or encode</td><td>Low; built-in SHAP</td><td>Medium–high</td><td>Mature all-rounder, competitions, production</td></tr>
    <tr><td><a class="xref" data-note="ml_lightgbm">LightGBM</a></td><td>Cuts bias; leaf-wise can raise variance</td><td>Usually fastest; low memory</td><td>Native</td><td>Native (<code>categorical_feature</code>)</td><td>Low; built-in SHAP</td><td>Medium–high (num_leaves!)</td><td>Large tables, many rows/columns, ranking</td></tr>
    <tr><td><a class="xref" data-note="ml_catboost">CatBoost</a></td><td>Cuts bias; ordered boosting limits leakage-driven variance</td><td>Slower per tree; fast prediction (symmetric trees)</td><td>Native</td><td>Best: ordered target statistics</td><td>Low; built-in SHAP</td><td>Low: strong defaults</td><td>Many categorical columns, small–medium data</td></tr>
    <tr><td><a class="xref" data-note="ml_stacking">Stacking / voting</a></td><td>Combines strengths; small extra gain</td><td>Sum of members (+ CV for stacking)</td><td>As members</td><td>As members</td><td>Lowest</td><td>High (more parts)</td><td>Competitions; last fraction of a point</td></tr>
  </table></div>
  <h3>Bagging branch vs boosting branch</h3>
  <table class="tbl">
    <tr><th></th><th>Bagging branch (bagging, RF, Extra Trees)</th><th>Boosting branch (AdaBoost → CatBoost)</th></tr>
    <tr><td>Trees built</td><td>Independently, in parallel</td><td>Sequentially, each on the team's remaining errors</td></tr>
    <tr><td>Each tree</td><td>Deep, low bias, high variance</td><td>Shallow (stumps to depth ~8), weak learner</td></tr>
    <tr><td>Mainly reduces</td><td>Variance</td><td>Bias (and variance via shrinkage, subsampling)</td></tr>
    <tr><td>Too many trees</td><td>Harmless, just slower</td><td>Overfits → needs early stopping</td></tr>
    <tr><td>Noisy labels</td><td>Robust (averaging)</td><td>Can chase noise (AdaBoost most)</td></tr>
    <tr><td>Tuning effort</td><td>Low</td><td>Moderate to high</td></tr>
    <tr><td>Combine with</td><td colspan="2">Each other, via voting or stacking (they make different mistakes)</td></tr>
  </table>
  <h3>Trees vs the other families</h3>
  <table class="tbl">
    <tr><th></th><th>Tree ensembles</th><th>Linear / logistic regression</th><th>k-nearest neighbours</th><th>Neural networks</th></tr>
    <tr><td>Best data</td><td>Tables with mixed columns</td><td>Tables where effects add up in straight lines</td><td>Small, low-dimensional, scaled</td><td>Images, text, audio, huge data</td></tr>
    <tr><td>Feature scaling</td><td>Not needed</td><td>Needed for regularisation</td><td>Essential</td><td>Essential</td></tr>
    <tr><td>Interactions</td><td>Learned automatically</td><td>Must be built by hand</td><td>Implicit</td><td>Learned</td></tr>
    <tr><td>Extrapolation</td><td>None: flat outside the training range</td><td>Natural (straight line continues)</td><td>None</td><td>Unreliable</td></tr>
    <tr><td>Smooth relations</td><td>Staircase approximation</td><td>Exact if linear</td><td>Local average</td><td>Smooth</td></tr>
    <tr><td>Where to read</td><td>This group</td><td><a class="xref" data-note="ml_regression">Regression</a>, <a class="xref" data-note="ml_classification">Classification</a></td><td><a class="xref" data-note="ml_classification">Classification</a></td><td><a class="xref" data-note="dl_foundations">NN Foundations</a></td></tr>
  </table>
  <div class="bridge"><b>What's still missing?</b> A table lists facts. When a real problem lands on your desk, you need a short procedure that turns those facts into a choice.</div>

  <h2 id="mt-choose"><span class="num">07</span>Which One When</h2>
  <p>A practical decision guide. Start at the top and stop at the first "yes".</p>
  <figure class="viz"><svg viewBox="0 0 700 420" width="700">
<defs><marker id="mt-ch" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="10" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="35" text-anchor="middle" font-size="12.5">Must a person read and audit every rule?</text>
<line x1="400" y1="30" x2="460" y2="30" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="24" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="10" width="220" height="40" rx="8" class="fg sg"/><text x="572" y="35" text-anchor="middle" font-size="12.5">Pruned decision tree</text>
<line x1="210" y1="50" x2="210" y2="78" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="68" class="tr" font-size="11">no</text>
<rect x="20" y="80" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="105" text-anchor="middle" font-size="12.5">First model on a new table? (baseline)</text>
<line x1="400" y1="100" x2="460" y2="100" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="94" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="80" width="220" height="40" rx="8" class="fb sb" fill-opacity="0.25"/><text x="572" y="105" text-anchor="middle" font-size="12.5">Random forest (defaults)</text>
<line x1="210" y1="120" x2="210" y2="148" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="138" class="tr" font-size="11">no</text>
<rect x="20" y="150" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="175" text-anchor="middle" font-size="12.5">Many text categories, or little time to tune?</text>
<line x1="400" y1="170" x2="460" y2="170" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="164" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="150" width="220" height="40" rx="8" class="ft st" fill-opacity="0.25"/><text x="572" y="175" text-anchor="middle" font-size="12.5">CatBoost</text>
<line x1="210" y1="190" x2="210" y2="218" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="208" class="tr" font-size="11">no</text>
<rect x="20" y="220" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="245" text-anchor="middle" font-size="12.5">Very noisy / mislabeled targets?</text>
<line x1="400" y1="240" x2="460" y2="240" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="234" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="220" width="220" height="40" rx="8" class="fb sb" fill-opacity="0.25"/><text x="572" y="245" text-anchor="middle" font-size="12.5">Random forest / Extra Trees</text>
<line x1="210" y1="260" x2="210" y2="288" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="278" class="tr" font-size="11">no</text>
<rect x="20" y="290" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="315" text-anchor="middle" font-size="12.5">Want the best accuracy on a large table?</text>
<line x1="400" y1="310" x2="460" y2="310" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="304" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="290" width="220" height="40" rx="8" class="ft st" fill-opacity="0.25"/><text x="572" y="309" text-anchor="middle" font-size="12.5">LightGBM / XGBoost</text><text x="572" y="324" text-anchor="middle" class="tm" font-size="10.5">+ early stopping, then tune</text>
<line x1="210" y1="330" x2="210" y2="358" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="220" y="348" class="tr" font-size="11">no / still not enough</text>
<rect x="20" y="360" width="380" height="40" rx="8" class="fs" stroke="currentColor"/><text x="210" y="385" text-anchor="middle" font-size="12.5">Last fraction of a point matters (competition)?</text>
<line x1="400" y1="380" x2="460" y2="380" stroke="currentColor" marker-end="url(#mt-ch)"/><text x="430" y="374" text-anchor="middle" class="tg" font-size="11">yes</text>
<rect x="462" y="360" width="220" height="40" rx="8" class="fg sg"/><text x="572" y="385" text-anchor="middle" font-size="12.5">Blend RF + boosters</text>
</svg><figcaption>A first-pass decision guide. In practice you often run the first two or three candidates and keep the simplest one that is not clearly worse on validation.</figcaption></figure>
  <ol>
    <li><strong>Need to explain every rule to a regulator or a non-technical team?</strong> A single pruned decision tree. Accept lower accuracy (0.81 vs 0.88 here), or use a strong model plus SHAP if "explainable" means reason codes rather than readable rules.</li>
    <li><strong>First model on any new table?</strong> Random forest with defaults. Hard to break, almost no tuning, gives an honest baseline and an OOB score for free.</li>
    <li><strong>Many categorical columns (city, plan, product) or small data and little tuning time?</strong> CatBoost: native categorical handling without leakage and strong defaults.</li>
    <li><strong>Very noisy labels?</strong> Random forest or Extra Trees. Avoid AdaBoost, which puts ever more weight on the mislabeled rows.</li>
    <li><strong>Best accuracy on a large, clean table?</strong> LightGBM (fastest) or XGBoost (most mature), learning rate ≈ 0.05, early stopping, then tune tree size and leaf size.</li>
    <li><strong>Need the fastest training on very many columns?</strong> Extra Trees (bagging branch) or LightGBM (boosting branch).</li>
    <li><strong>Hard latency budget at prediction time?</strong> Fewer, shallower trees; CatBoost's symmetric trees and LightGBM are fast to predict; a 300-tree full-depth forest can be hundreds of megabytes (<a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a> measures this).</li>
    <li><strong>Target must be predicted outside the range seen in training (prices that keep rising)?</strong> Not a tree model alone: predict the change, or combine with a linear trend (section 08).</li>
    <li><strong>Competition, or the last 0.3% matters?</strong> Average or stack a forest and one or two boosters.</li>
    <li><strong>Always:</strong> if the fancier model does not clearly beat the simpler one on validation, keep the simpler one.</li>
  </ol>
  <table class="tbl">
    <tr><th>Scenario</th><th>Pick</th><th>Why</th></tr>
    <tr><td>Bank credit approval with reason codes</td><td>XGBoost/LightGBM + monotone constraints + SHAP, or a pruned tree</td><td>Accuracy plus explanations per applicant; monotone rules for debt and income</td></tr>
    <tr><td>E-commerce churn with 300 product categories</td><td>CatBoost</td><td>High-cardinality categoricals without leakage</td></tr>
    <tr><td>Fraud, 1 in 1,000 positive, 50M rows</td><td>LightGBM with class weights, PR-AUC, threshold tuning</td><td>Speed on huge data; imbalance handling</td></tr>
    <tr><td>Hospital readmission, 3,000 rows, doctors want rules</td><td>Pruned tree or small RF</td><td>Small data, explainability; leaf-wise boosting would overfit</td></tr>
    <tr><td>Sales forecast for 10,000 shops with lag features</td><td>LightGBM global model</td><td>Many series, many rows, fast retraining (<a class="xref" data-note="ml_timeseries">Time Series Forecasting</a>)</td></tr>
    <tr><td>Search / recommendation ranking stage</td><td>LightGBM / XGBoost ranker (LambdaMART)</td><td>Native ranking objectives (<a class="xref" data-note="ml_recsys">Recommendation Systems</a>)</td></tr>
  </table>
  <div class="bridge"><b>What's still missing?</b> A guide for when to use the family is incomplete without the cases where you should not use it at all.</div>

  <h2 id="mt-limits"><span class="num">08</span>What No Tree Model Can Do</h2>
  <p>Every member of the family predicts with leaf values learnt from training rows. A tree's output is always one of its leaf values, and an ensemble's output is an average or sum of such values. Two consequences follow, and no amount of tuning removes them. The run below trains three models on flats of 0–1,000 sq ft whose price is a straight line (₹30 lakh per 100 sq ft plus noise), then asks about flats of 1,500 and 2,000 sq ft.</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 300).reshape(-1, 1)          # flat size, in hundreds of sq ft (0-1000)
y = 30 * x[:, 0] + rng.normal(0, 10, 300)           # price in lakh: a straight line + noise
new = np.array([[5.0], [10.0], [15.0], [20.0]])     # 15 and 20 are bigger than anything seen
models = {"linear regression": LinearRegression(),
          "random forest": RandomForestRegressor(n_estimators=200, random_state=0),
          "LightGBM": lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, verbose=-1)}
print("true values:        ", (30 * new[:, 0]).tolist())
for name, m in models.items():
    m.fit(x, y)
    grid = np.linspace(0, 10, 1001).reshape(-1, 1)
    steps = len(np.unique(m.predict(grid).round(6)))
    print(f"{name:19s} predicts {m.predict(new).round(0).tolist()}   distinct outputs on 1,001 points in [0,10]: {steps}")</div>
  <div class="fx" data-lang="text">true values:         [150.0, 300.0, 450.0, 600.0]
linear regression   predicts [150.0, 300.0, 449.0, 598.0]   distinct outputs on 1,001 points in [0,10]: 1001
random forest       predicts [148.0, 296.0, 296.0, 296.0]   distinct outputs on 1,001 points in [0,10]: 764
LightGBM            predicts [154.0, 292.0, 292.0, 292.0]   distinct outputs on 1,001 points in [0,10]: 77</div>
  <p>Inside the training range (x = 5 and 10) all three are close to the truth. Outside it, the straight line keeps going (449 and 598 vs the true 450 and 600), while the random forest is stuck at 296 and LightGBM at 292 for both 1,500 and 2,000 sq ft: the same answer as for the biggest flat they saw. The last column shows the second limit: on 1,001 evenly spaced points the line gives 1,001 different outputs, the forest 764 and LightGBM only 77. Tree models approximate a straight line by a staircase of flat steps.</p>
  <ul>
    <li><strong>No extrapolation.</strong> Beyond the largest x seen in training, every tree sends the row to the same right-most leaves, so the prediction freezes. For targets that grow over time (prices, sales, users), predict the <em>change</em> or the ratio, add a trend from a linear model, or use linear trees (LightGBM <code>linear_tree=True</code>). See <a class="xref" data-note="ml_timeseries">Time Series Forecasting</a>.</li>
    <li><strong>Staircases, not lines.</strong> A smooth or straight relationship is approximated by many small steps, which wastes data. With few rows and a truly linear effect, plain linear regression wins.</li>
    <li><strong>Raw images, audio, text.</strong> Tree splits on single pixels or single words do not capture shapes or meaning. Use neural networks (<a class="xref" data-note="dl_foundations">NN Foundations</a>), or feed trees with features extracted by them (embeddings).</li>
    <li><strong>Axis-aligned cuts.</strong> Every split is "feature ≤ threshold", so a diagonal boundary (x₁ &gt; x₂) needs many steps. Adding the engineered feature x₁ − x₂ fixes it in one split.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A model that validates beautifully on a random split can still fail in production if production rows lie outside the training range (a new price segment, a bigger customer, next year's inflation). Check the range of key features in production against training; <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a> shows a drift check (PSI).</p>
  </div>

  <h2 id="mt-conn"><span class="num">09</span>How the Group Connects</h2>
  <p>What this group builds on:</p>
  <ul>
    <li><a class="xref" data-note="ml_core">Core Concepts</a> — overfitting, train/validation/test, bias-variance; the family tree is a story about variance (bagging) and bias (boosting).</li>
    <li><a class="xref" data-note="ml_classification">Classification</a> — logistic regression is the straight-line baseline (0.596 here) and log loss is the loss boosters minimise.</li>
    <li><a class="xref" data-note="ml_regression">Regression</a> — squared error and residuals; regression trees are the building block of every gradient booster, even for classification.</li>
    <li><a class="xref" data-note="st_probability">Probability</a> — the binomial maths behind majority voting, the bootstrap's 1/e, entropy.</li>
    <li><a class="xref" data-note="st_descriptive">Descriptive Statistics</a> — mean, median and variance are the leaf values and impurity of regression trees.</li>
    <li><a class="xref" data-note="m_calculus">Calculus</a> and <a class="xref" data-note="m_optimization">Optimization</a> — gradients, Hessians and Taylor expansions behind gradient boosting and XGBoost; learning rate means the same thing as in gradient descent.</li>
  </ul>
  <p>What builds on it:</p>
  <ul>
    <li><a class="xref" data-note="ml_evaluation">Model Evaluation</a> — cross-validation for tuning, PR-AUC for imbalanced data, calibration curves.</li>
    <li><a class="xref" data-note="ml_timeseries">Time Series Forecasting</a> — one LightGBM over many series with lag features, and the extrapolation fix.</li>
    <li><a class="xref" data-note="ml_recsys">Recommendation Systems</a> — the ranking stage is often a LightGBM or XGBoost ranker.</li>
    <li><a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a> — logging tuning runs; autologging for XGBoost and LightGBM.</li>
    <li><a class="xref" data-note="sd_monitoring">Monitoring</a> — drift and performance tracking for deployed tree models.</li>
    <li><a class="xref" data-note="sd_cases">Case Studies</a> — system-design answers that use a global LightGBM, and why "I'd use XGBoost" is not a design.</li>
  </ul>

  <h2 id="mt-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: trusting one deep tree</span>
    <p>An unlimited tree scores 1.000 on train and about 0.77 on validation, and changes shape when the data changes slightly. Prune it, or use an ensemble.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: thinking forests can overfit by adding trees, or boosters cannot</span>
    <p>More trees in a forest only average more (slower, never worse). More rounds in a booster keep fitting the remaining error, which ends up being noise. Always use early stopping for boosting.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: an ensemble of look-alike models</span>
    <p>The gain comes from members making different mistakes. Same model, same rows, same settings = no gain. Bootstrap, random features, random thresholds and blending different families all exist to make members differ.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: picking the library before checking the data</span>
    <p>On our data every ensemble lands within about a point of the others. Leakage, a wrong validation split or a missing feature costs far more than the choice between XGBoost and LightGBM.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reporting impurity importance as "what drives the target"</span>
    <p>It favours many-valued columns (pure noise with 20,000 values scored like a real feature) and describes the model, not the world. Use permutation importance on validation data and read <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: naive target encoding and in-sample stacking</span>
    <p>Both let a row see its own label: a one-customer city gets that customer's answer as a feature, and a meta-model learns from near-perfect training predictions. Use ordered statistics (CatBoost) or cross-fitting, and out-of-fold predictions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting trees to extrapolate</span>
    <p>No tree model predicts outside the target range it saw (section 08). Model the change, or add a trend.</p>
  </div>

  <h2 id="mt-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Tell the family story in five sentences, from one decision tree to CatBoost.</summary><div class="qa-body">A decision tree learns yes/no rules by greedy impurity reduction but has high variance. Ensembles fix that by combining many models whose mistakes partly cancel. Bagging, and the random forest that also randomises features per split, average many independent deep trees, which cuts variance but cannot fix mistakes all trees share. Boosting builds small trees in sequence, each fitted to the team's remaining errors, which cuts bias; AdaBoost did it by reweighting rows and gradient boosting by fitting the loss gradient. XGBoost, LightGBM and CatBoost are engineered gradient boosting: second-order steps and penalties, histograms and leaf-wise growth, and leak-free categorical handling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exact weakness of a single tree do ensembles fix, and why doesn't pruning fix it fully?</summary><div class="qa-body">High variance: a slightly different sample gives a different tree and different predictions. Pruning reduces variance only by making the one tree simpler, which raises bias (here it plateaus near 0.81). Averaging many trees reduces variance while keeping each tree deep and low-bias: Var = ρσ² + (1−ρ)σ²/n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did boosting appear after bagging? What could bagging not do?</summary><div class="qa-body">Averaging leaves bias unchanged: the average of many trees that all miss a pattern still misses it. Bagged trees learn independently and never see each other's errors. Boosting makes each new tree work on the current team's errors, so systematic mistakes shrink round by round. It therefore uses small, high-bias trees that bagging could not help.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is a random forest related to bagging, and Extra Trees to a random forest?</summary><div class="qa-body">Random forest = bagging + a random subset of features at every split (max_features ≈ √d), which lowers the correlation ρ between trees, so the variance floor ρσ² drops. Extra Trees = random forest + random thresholds, usually without bootstrap: still less correlated, faster, each tree a bit weaker.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is gradient boosting related to AdaBoost?</summary><div class="qa-body">AdaBoost was later shown to be forward stagewise additive modelling with exponential loss. Gradient boosting generalises it: each tree fits the negative gradient of any differentiable loss. With exponential loss you get AdaBoost-like behaviour; with squared error each tree fits plain residuals; with log loss you get the usual classifier.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>XGBoost, LightGBM, CatBoost: one sentence each on what they add to gradient boosting.</summary><div class="qa-body">XGBoost: second-order Taylor steps with leaf weight w* = −G/(H+λ), penalties λ and γ inside the split gain, learned missing-value directions, parallel and histogram split search. LightGBM: histogram bins, leaf-wise growth, GOSS row sampling and EFB feature bundling for speed. CatBoost: ordered target statistics and ordered boosting to avoid target leakage with categoricals, plus symmetric trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Random forest or gradient boosting first?</summary><div class="qa-body">Random forest first as a fast, robust, nearly tuning-free baseline. Then a booster with early stopping, which usually wins on large clean tables with interactions. If the booster does not clearly beat the forest on validation, keep the forest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is early stopping essential for boosting but not for a random forest?</summary><div class="qa-body">Each boosting round fits what is left of the training error; after a point that is noise, and validation loss rises (in our LightGBM run, best round 204 at 0.308 log loss, round 3,000 at 0.752). Forest trees are independent; adding more just averages more and converges.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bagging reduces variance. Show the formula and what it implies for design.</summary><div class="qa-body">Var(average of n) = ρσ² + (1−ρ)σ²/n. More trees shrink only the second term; the floor ρσ² depends on how alike the trees are. So design for low correlation: bootstrap rows, random features per split, random thresholds, different model families in a blend.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name three ideas that cross from the bagging branch to the boosting branch.</summary><div class="qa-body">Row subsampling per tree (stochastic gradient boosting's <code>subsample</code>, like a bootstrap without replacement), column subsampling (<code>colsample_bytree</code>, like random forest's feature sampling), and out-of-bag style estimates (sklearn GradientBoosting's <code>oob_improvement_</code> when subsample &lt; 1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which members handle missing values and categorical columns natively?</summary><div class="qa-body">Missing: XGBoost, LightGBM, CatBoost, HistGradientBoosting, and recent scikit-learn decision trees and random forests learn where NaN goes. Categorical: CatBoost (best, ordered target statistics), LightGBM and HistGradientBoosting (native category splits), XGBoost with enable_categorical. Classic sklearn GradientBoosting, AdaBoost and Extra Trees need encoding.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use any tree model?</summary><div class="qa-body">When the target must be extrapolated (trend growth), when the relation is simple and linear with little data (a line wins), on raw images, audio or text (neural networks), and when you need smooth predictions or exact monotone curves without constraints.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your boosted model and random forest score the same. Would stacking them help?</summary><div class="qa-body">Probably a little, because they make different mistakes (parallel deep trees vs sequential shallow trees). On our data averaging RF, Extra Trees and LightGBM raised AUC by about 0.003. Whether that is worth running three models depends on the cost of errors vs the cost of latency and maintenance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A colleague says "XGBoost is always the best model for tabular data". How do you respond?</summary><div class="qa-body">Gradient-boosted trees are usually among the best on tabular data, but LightGBM, CatBoost and even a random forest are often within noise of XGBoost (as in our race). The choice depends on data size, categorical columns, latency, tuning time and team familiarity. Features and validation design matter more than the library.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do the explainability tools differ for a single tree vs an ensemble?</summary><div class="qa-body">A single tree can be read directly (export_text, plot_tree). An ensemble needs summaries: MDI importance (free but biased), permutation importance (on validation), partial dependence / ICE for effects, and SHAP for per-prediction reasons that add up exactly to the model output.</div></details>
</main>
`
});
