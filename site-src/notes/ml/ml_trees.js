// notes/ml/ml_trees.js — The Tree Family: Map & How to Choose
Object.assign(TOPIC_CONTENT, {
  "ml_trees": `<main>
  <h1>The Tree Family: Map &amp; How to Choose</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>The Tree Family: Map &amp; How to Choose</span></div>
  <p class="lead">Start here. This is the opening note of the Tree-Based Models group, and its job is to give you the whole map before you walk the roads. Tree models are the strongest family of classic machine learning for table data (rows and columns, like an Excel sheet): the decision tree, bagging, random forest, Extra Trees, AdaBoost, gradient boosting, XGBoost, LightGBM, CatBoost, and stacking. They are not fourteen unrelated algorithms. They are one family, and every member was invented to fix a weakness of the one before it. This page tells that story as a ladder of questions, follows one tiny running example through the whole family (the captain's 14-day cricket diary, which every note in the group reuses), shows the family tree, gives a one-paragraph summary of every note in reading order, runs every member on the same large dataset, compares them side by side, and ends with a guide for choosing one and a revision sheet. Each child note then teaches its model completely, from the formula worked by hand to production code.</p>

  <h2 id="mt-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 600 324" width="600">
<line x1="300" y1="28" x2="300" y2="42" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="70" x2="300" y2="84" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="112" x2="116" y2="132" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="112" x2="330" y2="132" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="300" y1="112" x2="530" y2="132" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="116" y1="160" x2="62" y2="180" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="114.0" y1="194" x2="122.0" y2="194" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="330" y1="160" x2="272" y2="180" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="317.0" y1="194" x2="324.0" y2="194" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="392" y1="208" x2="300" y2="228" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="392" y1="208" x2="395" y2="228" stroke="currentColor" stroke-opacity="0.45"/>
<line x1="392" y1="208" x2="490" y2="228" stroke="currentColor" stroke-opacity="0.45"/>
<rect x="70" y="263" width="460" height="58" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.45"/>
<text x="300" y="277" text-anchor="middle" class="tm" font-size="10">used by every model above</text>
<rect x="225.0" y="0" width="150" height="28" rx="6" class="fg sg" stroke-width="2.5"/>
<text x="300" y="18" text-anchor="middle" font-size="11" font-weight="700">Map &amp; How to Choose</text>
<rect x="235.0" y="42" width="130" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="60" text-anchor="middle" font-size="11">Decision Trees</text>
<rect x="225.0" y="84" width="150" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="102" text-anchor="middle" font-size="11">Ensemble Learning</text>
<rect x="61.0" y="132" width="110" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="116" y="150" text-anchor="middle" font-size="11">Bagging</text>
<rect x="262.0" y="132" width="136" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="330" y="150" text-anchor="middle" font-size="11">How Boosting Works</text>
<rect x="465.0" y="132" width="130" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="150" text-anchor="middle" font-size="11">Stacking &amp; Voting</text>
<rect x="10.0" y="180" width="104" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="62" y="198" text-anchor="middle" font-size="11">Random Forest</text>
<rect x="122.0" y="180" width="96" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="170" y="198" text-anchor="middle" font-size="11">Extra Trees</text>
<rect x="227.0" y="180" width="90" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="272" y="198" text-anchor="middle" font-size="11">AdaBoost</text>
<rect x="324.0" y="180" width="136" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="392" y="198" text-anchor="middle" font-size="11">Gradient Boosting</text>
<rect x="257.5" y="228" width="85" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="246" text-anchor="middle" font-size="11">XGBoost</text>
<rect x="352.5" y="228" width="85" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="395" y="246" text-anchor="middle" font-size="11">LightGBM</text>
<rect x="447.5" y="228" width="85" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="490" y="246" text-anchor="middle" font-size="11">CatBoost</text>
<rect x="90.0" y="286" width="200" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="190" y="304" text-anchor="middle" font-size="11">Feature Importance &amp; SHAP</text>
<rect x="320.0" y="286" width="200" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="420" y="304" text-anchor="middle" font-size="11">Tuning &amp; Production</text>
</svg><figcaption>The Tree-Based Models group as it appears in the sidebar. You are on the top node (green): the map of everything below it.</figcaption></figure>
  <ul>
    <li><strong>Came from:</strong> <a class="xref" data-note="ml_regression">Regression</a> and <a class="xref" data-note="ml_classification">Classification</a> taught linear and logistic regression. They draw one straight line (or flat surface) through the data, need scaled numbers, and miss patterns like "churns only if tenure is short <em>and</em> complaints are high" unless you build that column by hand. <a class="xref" data-note="ml_core">Core Concepts</a> gave you overfitting, train / validation / test and the bias-variance trade-off, which is the language this whole group speaks.</li>
    <li><strong>What this note adds:</strong> the big picture. The family tree, the chain of "weakness → fix" that connects the members, a summary and link for every child note, one comparison table, and a decision guide. No single model is taught in depth here; each has its own note.</li>
    <li><strong>Leads to:</strong> <a class="xref" data-note="ml_dtree">Decision Trees</a>, the root of the family and the next note to read. After the group, <a class="xref" data-note="ml_evaluation">Model Evaluation</a>, <a class="xref" data-note="ml_timeseries">Time Series Forecasting</a> and <a class="xref" data-note="ml_recsys">Recommendation Systems</a> all use these models.</li>
  </ul>

  <h2 id="mt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole group as one chain. Each model answers the question above it; its weakness raises the next question. Read it top to bottom once, slowly: if you can retell it in your own words, you understand how the fourteen notes fit together. Numbers in brackets come from the running example, the captain's 14-day cricket diary (section 01).</p>
  <ol class="story">
    <li><b>Decision Tree</b><span>Q: how can a model learn readable if-else rules that bend and interact, with no scaling? → At every node ask the question that most reduces impurity (entropy or Gini). On the diary the root question is Outlook (information gain 0.247, against 0.152 for Humidity) and five rules fit all 14 days. But grown fully it memorises (train 1.000, validation 0.773 on 20,000 customers), and a slightly different sample gives a different tree: drop day D3 and the root becomes Humidity. High variance. <a class="xref" data-note="ml_dtree">Decision Trees</a></span></li>
    <li><b>Pruning</b><span>Q: can we stop one tree from memorising? → Stop early (max_depth, min_samples_leaf) or cut back (cost-complexity α). But it is still one unstable model, and simpler means more bias: on the large data the best pruned tree tops out near 0.81. <a class="xref" data-note="ml_dtree">Decision Trees</a></span></li>
    <li><b>Ensembles</b><span>Q: if one tree is shaky, can many shaky trees be steady? → Yes, if their mistakes differ: the variance of an average of n models is ρσ² + (1−ρ)σ²/n, and three independent 70%-right voters make a 78.4%-right team. But we have only one diary. Where do many <em>different</em> trees come from? <a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a></span></li>
    <li><b>Bagging</b><span>Q: how do we get many training sets from one? → The bootstrap: draw 14 days with replacement (one sample used only 9 different days; the other 5 are out-of-bag, a free test), grow a tree on each sample, let them vote. One tree 0.78 → 100 bagged trees 0.87 at scale. But the trees still look alike: Outlook wins the root in 562 of 1,000 bootstrap trees, so ρ stays high. <a class="xref" data-note="ml_bagging">Bagging &amp; Bootstrap</a></span></li>
    <li><b>Random Forest</b><span>Q: how do we stop one strong column from deciding every tree? → Let each split look at only m random columns. With 2 of the diary's 4, Outlook can win the root only when it is drawn (3 of the 6 pairs), and it wins in 375 of 1,000 trees instead of 562: lower ρ, and faster. But averaging only lowers variance; a pattern every tree misses (bias) stays missed. <a class="xref" data-note="ml_rf">Random Forest</a></span></li>
    <li><b>Extra Trees</b><span>Q: can trees be made even less alike, and cheaper? → Also draw the cut-off at random: humidity ≤ 89.96 instead of the best ≤ 82.5 (Gini drop 0.066 instead of 0.092), and use all rows. Even less alike, even faster, similar accuracy. But still no tree ever learns from another tree's mistakes. <a class="xref" data-note="ml_extratrees">Extra Trees</a></span></li>
    <li><b>Boosting</b><span>Q: can trees be built to fix each other's mistakes? → Build small trees one after another, each fitted to what the team so far gets wrong, and add it with a small step: F_m = F_m−1 + ν·h_m. On the diary's turnout column one stump with ν = 0.5 cuts the squared error from 1280 to 902. Shared mistakes shrink round by round, so bias falls. But how exactly should the next tree "focus on the mistakes"? <a class="xref" data-note="ml_boosting">How Boosting Works</a></span></li>
    <li><b>AdaBoost</b><span>Q: what is the simplest way to focus on mistakes? → Increase the weight of misclassified rows and give each stump a vote α = ½ln((1−ε)/ε). But it is tied to one loss (exponential), so a few mislabeled rows get huge weights, and it does not extend cleanly to regression or custom costs. <a class="xref" data-note="ml_adaboost">AdaBoost</a></span></li>
    <li><b>Gradient Boosting</b><span>Q: how do we boost any loss, for classes or numbers? → Every new tree fits the negative gradient of a differentiable loss (for squared error, simply the residuals). But the classic implementation is slow (it tries every threshold), has few brakes, and overfits if you keep adding trees. <a class="xref" data-note="ml_gbm">Gradient Boosting</a></span></li>
    <li><b>XGBoost</b><span>Q: can each boosting step be better aimed and better braked? → Use gradient and curvature (Hessian), put penalties λ and γ inside the split search, learn where missing values go, run in parallel. But exact split search and level-by-level growth are still heavy on very large data. <a class="xref" data-note="ml_xgboost">XGBoost</a></span></li>
    <li><b>LightGBM</b><span>Q: how do we boost on millions of rows quickly? → Bucket each feature into ≤ 255 histogram bins, grow the most useful leaf first, sample rows by gradient size (GOSS), bundle sparse columns (EFB). But text categories and target leakage are still largely your problem, and leaf-wise trees overfit small data. <a class="xref" data-note="ml_lightgbm">LightGBM</a></span></li>
    <li><b>CatBoost</b><span>Q: how do we use text categories without leaking the target? → Ordered target statistics (each row sees only earlier rows' labels), ordered boosting and symmetric trees: strong results with defaults. But slower per tree on purely numeric data. <a class="xref" data-note="ml_catboost">CatBoost</a></span></li>
    <li><b>Stacking &amp; Voting</b><span>Q: forests and boosters make different mistakes; can we blend them? → Average them (voting), or let a meta-model learn the blend from out-of-fold predictions. Why out-of-fold: a 1-nearest-neighbour model is right on all 14 of its own training days but on only 4 of 14 days it did not see. But the gain is small (≈ +0.003 AUC at scale) for several times the cost. <a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a></span></li>
    <li><b>Feature Importance &amp; SHAP</b><span>Q: hundreds of trees cannot be read aloud; why did the model say this? → Importance scores, partial dependence and SHAP give back the "why" (on the diary tree, MDI gives Outlook 0.26, Humidity 0.37, Wind 0.37). But they explain the model, not the real world. <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a></span></li>
    <li><b>Tuning &amp; Production</b><span>Q: how do we pick the knobs and ship it safely? → Tune the few knobs that matter, validate honestly, handle rare classes, calibrate, save, serve and monitor. This is where the story meets a real system. <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a></span></li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket team over the years. First, one star player decides everything (one tree): brilliant on his day, unreliable on others. Then a selection committee that averages many independent opinions (bagging), and makes sure the selectors do not all watch the same matches (random forest). Then a coaching staff where each new coach works only on what the team still does badly (boosting), with better video analysis and fitness data each generation (XGBoost, LightGBM, CatBoost). Finally a captain who listens to both the selectors and the coaches and has learned whose advice to trust when (stacking).</p>
  </div>

  <h2 id="mt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">The Tree Family</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Running example: the diary</div>
        <ul>
          <li>14 days, 9 play / 5 not; Outlook, Temp, Humidity, Wind + HumPct, TempC, Turnout</li>
          <li><b>Tree</b>: root Outlook (IG 0.247); drop D3 → root Humidity</li>
          <li><b>Bagging</b>: 9 days in a sample, 5 out-of-bag; (13/14)¹⁴ = 0.354</li>
          <li><b>Forest</b>: Outlook root 562 → 375 of 1,000 trees · <b>Extra Trees</b>: cut 89.96 vs 82.5</li>
          <li><b>Boosting</b>: SSE 1280 → 902 · <b>Stacking</b>: 1-NN 14/14 in-sample, 4/14 out of fold</li>
        </ul>
      </div>
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
      <div class="rm-item rm-done" data-target="mt-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The group as one chain of questions</span></div></div>
      <div class="rm-item rm-done" data-target="mt-diary"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Diary for the Whole Family</span><span class="rm-sub">The running example, every member on it</span></div></div>
      <div class="rm-item rm-done" data-target="mt-family"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Family Tree</span><span class="rm-sub">Every note as a node, every arrow labelled</span></div></div>
      <div class="rm-item rm-done" data-target="mt-guide"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Reading Guide</span><span class="rm-sub">One paragraph per note, in order</span></div></div>
      <div class="rm-item rm-done" data-target="mt-ideas"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Five Ideas Behind Everything</span><span class="rm-sub">Splits, variance, randomness, gradients, brakes</span></div></div>
      <div class="rm-item rm-done" data-target="mt-race"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Every Member at Scale</span><span class="rm-sub">13 models on 20,000 customers</span></div></div>
      <div class="rm-item rm-done" data-target="mt-cmp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Big Comparison Table</span><span class="rm-sub">Bias/variance, speed, missing, categoricals, …</span></div></div>
      <div class="rm-item rm-done" data-target="mt-choose"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Which One When</span><span class="rm-sub">A decision guide</span></div></div>
      <div class="rm-item rm-done" data-target="mt-limits"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">What No Tree Model Can Do</span><span class="rm-sub">Extrapolation, smooth lines, raw images/text</span></div></div>
      <div class="rm-item rm-done" data-target="mt-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table, notes before and after</span></div></div>
      <div class="rm-item rm-done" data-target="mt-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Across the whole family</span></div></div>
      <div class="rm-item rm-done" data-target="mt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole group on one page</span></div></div>
      <div class="rm-item rm-done" data-target="mt-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Top connection interview questions</span></div></div>
    </div>
  </div>

  <h2 id="mt-diary"><span class="num">01</span>One Diary for the Whole Family</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Fourteen models are hard to relate when each is shown on a different dataset. Is there one small problem, small enough to work by hand, on which every member of the family can be computed, so that each new model is seen changing the numbers of the previous one?</p>
  </div>
  <h3>The running example</h3>
  <p>A college cricket team plays only on some evenings. For 14 days the captain wrote down the weather and whether the match was played. This is Ross Quinlan's famous "PlayTennis" table from the 1986 paper that introduced ID3, renamed "play cricket", plus three numbers the captain also noted: the humidity reading in %, the temperature in °C, and the <em>turnout</em> (how many club members came to the ground). Every note in this group starts from this same table, so you can watch each model change the previous model's numbers.</p>
  <table class="tbl"><caption>The captain's 14-day diary (9 played, 5 not)</caption>
    <tr><th>Day</th><th>Outlook</th><th>Temp</th><th>Humidity</th><th>Wind</th><th>Play</th><th>HumPct</th><th>TempC</th><th>Turnout</th></tr>
    <tr><td>D1</td><td>Sunny</td><td>Hot</td><td>High</td><td>Weak</td><td>No</td><td>85</td><td>29</td><td>24</td></tr>
    <tr><td>D2</td><td>Sunny</td><td>Hot</td><td>High</td><td>Strong</td><td>No</td><td>90</td><td>27</td><td>20</td></tr>
    <tr><td>D3</td><td>Overcast</td><td>Hot</td><td>High</td><td>Weak</td><td>Yes</td><td>86</td><td>28</td><td>36</td></tr>
    <tr><td>D4</td><td>Rain</td><td>Mild</td><td>High</td><td>Weak</td><td>Yes</td><td>96</td><td>21</td><td>32</td></tr>
    <tr><td>D5</td><td>Rain</td><td>Cool</td><td>Normal</td><td>Weak</td><td>Yes</td><td>80</td><td>20</td><td>44</td></tr>
    <tr><td>D6</td><td>Rain</td><td>Cool</td><td>Normal</td><td>Strong</td><td>No</td><td>70</td><td>18</td><td>22</td></tr>
    <tr><td>D7</td><td>Overcast</td><td>Cool</td><td>Normal</td><td>Strong</td><td>Yes</td><td>65</td><td>18</td><td>42</td></tr>
    <tr><td>D8</td><td>Sunny</td><td>Mild</td><td>High</td><td>Weak</td><td>No</td><td>95</td><td>22</td><td>26</td></tr>
    <tr><td>D9</td><td>Sunny</td><td>Cool</td><td>Normal</td><td>Weak</td><td>Yes</td><td>70</td><td>21</td><td>40</td></tr>
    <tr><td>D10</td><td>Rain</td><td>Mild</td><td>Normal</td><td>Weak</td><td>Yes</td><td>80</td><td>24</td><td>46</td></tr>
    <tr><td>D11</td><td>Sunny</td><td>Mild</td><td>Normal</td><td>Strong</td><td>Yes</td><td>70</td><td>24</td><td>38</td></tr>
    <tr><td>D12</td><td>Overcast</td><td>Mild</td><td>High</td><td>Strong</td><td>Yes</td><td>90</td><td>22</td><td>38</td></tr>
    <tr><td>D13</td><td>Overcast</td><td>Hot</td><td>Normal</td><td>Weak</td><td>Yes</td><td>75</td><td>27</td><td>48</td></tr>
    <tr><td>D14</td><td>Rain</td><td>Mild</td><td>High</td><td>Strong</td><td>No</td><td>91</td><td>22</td><td>20</td></tr>
  </table>
  <p>The first four columns are categories; Play is the label to predict (classification). HumPct and TempC are the same humidity and temperature as numbers (High humidity is 85–96%, Normal is 65–80%), for the models that cut numbers at thresholds. Turnout is a number to predict (regression), used where a model averages or adds numbers. In code, every note keeps the table in a small file <code>play.py</code>:</p>
  <div class="fx" data-lang="py">import pandas as pd
rows = [  # Outlook,   Temp,  Humidity, Wind,    Play, HumPct, TempC, Turnout
    ("Sunny",    "Hot",  "High",   "Weak",   "No",  85,  29, 24),
    ("Sunny",    "Hot",  "High",   "Strong", "No",  90,  27, 20),
    ("Overcast", "Hot",  "High",   "Weak",   "Yes", 86,  28, 36),
    ("Rain",     "Mild", "High",   "Weak",   "Yes", 96,  21, 32),
    ("Rain",     "Cool", "Normal", "Weak",   "Yes", 80,  20, 44),
    ("Rain",     "Cool", "Normal", "Strong", "No",  70,  18, 22),
    ("Overcast", "Cool", "Normal", "Strong", "Yes", 65,  18, 42),
    ("Sunny",    "Mild", "High",   "Weak",   "No",  95,  22, 26),
    ("Sunny",    "Cool", "Normal", "Weak",   "Yes", 70,  21, 40),
    ("Rain",     "Mild", "Normal", "Weak",   "Yes", 80,  24, 46),
    ("Sunny",    "Mild", "Normal", "Strong", "Yes", 70,  24, 38),
    ("Overcast", "Mild", "High",   "Strong", "Yes", 90,  22, 38),
    ("Overcast", "Hot",  "Normal", "Weak",   "Yes", 75,  27, 48),
    ("Rain",     "Mild", "High",   "Strong", "No",  91,  22, 20)]
df = pd.DataFrame(rows, columns=["Outlook", "Temp", "Humidity", "Wind", "Play", "HumPct", "TempC", "Turnout"])
df.index = [f"D{i}" for i in range(1, 15)]</div>
  <h3>Every member, computed on the diary</h3>
  <p>The block below computes one key number for each step of the question ladder. You do not need to follow every line now: each child note derives its number by hand.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from itertools import combinations
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import KFold, cross_val_predict
from play import df

def H(y):                                         # entropy of a column of labels, in bits
    p = y.value_counts(normalize=True).values
    return float(-(p * np.log2(p)).sum()) + 0.0
def IG(d, col):                                   # information gain of splitting d on col
    return H(d.Play) - sum(len(g) / len(d) * H(g.Play) for _, g in d.groupby(col))
cols = ["Outlook", "Temp", "Humidity", "Wind"]

g = {c: round(IG(df, c), 3) for c in cols}
print("tree:        root entropy", round(H(df.Play), 3), " IG", g)
print("instability: without D3  ", {c: round(IG(df.drop("D3"), c), 3) for c in cols})

rng = np.random.default_rng(171)
idx = rng.integers(0, 14, 14)                     # 14 draws WITH replacement
picked = sorted(set(df.index[idx]), key=lambda s: int(s[1:]))
print("bagging:     sample uses", len(picked), "different days; out-of-bag:",
      [d for d in df.index if d not in picked], " (13/14)^14 =", round((13 / 14) ** 14, 3))

print("forest:      best of each random pair:", [max(p, key=g.get) for p in combinations(cols, 2)])

def gini(v):
    p = v.mean(); return 1 - p ** 2 - (1 - p) ** 2
yes = (df.Play == "Yes").astype(int).values
def drop(x, t):                                   # Gini decrease of the split x &lt;= t
    L, R = yes[x &lt;= t], yes[x &gt; t]
    return gini(yes) - (len(L) * gini(L) + len(R) * gini(R)) / len(yes)
t = np.random.default_rng(5).uniform(65, 96)      # ONE random cut-off in the humidity range
print(f"extra trees: random cut HumPct &lt;= {t:.2f} drop {drop(df.HumPct.values, t):.4f}"
      f"  vs best cut 82.5 drop {drop(df.HumPct.values, 82.5):.4f}")

X = df[["HumPct", "TempC"]]
knn = KNeighborsClassifier(n_neighbors=1)
inside = (knn.fit(X, df.Play).predict(X) == df.Play).sum()
oof = (cross_val_predict(knn, X, df.Play, cv=KFold(7)) == df.Play).sum()
print(f"stacking:    1-NN right on {inside}/14 of its own training days, on {oof}/14 out of fold")

F0 = df.Turnout.mean(); r = df.Turnout - F0; left = df.HumPct &lt;= 82.5
F1 = F0 + 0.5 * np.where(left, r[left].mean(), r[~left].mean())
print(f"boosting:    F0 = {F0:.2f}, SSE {(r ** 2).sum():.1f} -&gt; after one stump x 0.5: {((df.Turnout - F1) ** 2).sum():.1f}")</div>
  <div class="fx" data-lang="text">tree:        root entropy 0.94  IG {'Outlook': 0.247, 'Temp': 0.029, 'Humidity': 0.152, 'Wind': 0.048}
instability: without D3   {'Outlook': 0.214, 'Temp': 0.076, 'Humidity': 0.219, 'Wind': 0.035}
bagging:     sample uses 9 different days; out-of-bag: ['D1', 'D3', 'D9', 'D13', 'D14']  (13/14)^14 = 0.354
forest:      best of each random pair: ['Outlook', 'Outlook', 'Outlook', 'Humidity', 'Wind', 'Humidity']
extra trees: random cut HumPct &lt;= 89.96 drop 0.0655  vs best cut 82.5 drop 0.0918
stacking:    1-NN right on 14/14 of its own training days, on 4/14 out of fold
boosting:    F0 = 34.00, SSE 1280.0 -&gt; after one stump x 0.5: 902.0</div>
  <table class="tbl"><caption>What each note does to the same 14 days</caption>
    <tr><th>Member</th><th>What it does to the diary</th><th>The number</th><th>Weakness it leaves</th></tr>
    <tr><td><a class="xref" data-note="ml_dtree">Decision tree</a></td><td>Scores each column by information gain and asks the best one first</td><td>Outlook 0.247 &gt; Humidity 0.152 &gt; Wind 0.048 &gt; Temp 0.029</td><td>One day changes the tree</td></tr>
    <tr><td>Instability</td><td>Same algorithm, day D3 removed</td><td>Humidity 0.219 now beats Outlook 0.214: a different root</td><td>High variance</td></tr>
    <tr><td><a class="xref" data-note="ml_bagging">Bagging</a></td><td>Draws 14 days with replacement for each tree</td><td>One sample: 9 different days, 5 out-of-bag; a day is left out with probability (13/14)¹⁴ = 0.354</td><td>Outlook still wins most roots</td></tr>
    <tr><td><a class="xref" data-note="ml_rf">Random forest</a></td><td>Each split may use only 2 random columns of 4</td><td>The 6 pairs pick Outlook 3 times, Humidity 2, Wind 1</td><td>Averaging cannot remove bias</td></tr>
    <tr><td><a class="xref" data-note="ml_extratrees">Extra Trees</a></td><td>Also draws the humidity cut-off at random</td><td>≤ 89.96 removes 0.066 of Gini impurity; the best cut ≤ 82.5 removes 0.092</td><td>Trees still independent</td></tr>
    <tr><td><a class="xref" data-note="ml_boosting">Boosting</a></td><td>Predicts turnout: start at the mean, add a small tree fitted to the errors</td><td>F₀ = 34; squared error 1280 → 902 after one stump × 0.5</td><td>Needs brakes (rounds, learning rate)</td></tr>
    <tr><td><a class="xref" data-note="ml_stacking">Stacking</a></td><td>Feeds one model's predictions to another; needs honest predictions</td><td>1-NN: 14/14 on its own days, 4/14 out of fold</td><td>Small gains, high cost</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cooking class where every student gets the same 14 ingredients. Each new recipe (model) is easier to understand when you can taste the difference from the last recipe on the same ingredients, instead of a new basket each time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The diary is for <em>understanding</em>, not for choosing a model. With 14 rows, one prediction more or less moves accuracy by 7 points, so leave-one-out scores on it are mostly noise. Accuracy comparisons in this group always use the large 20,000-customer table (section 05): "the same idea at scale".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Family Tree.</b> We have one problem and fourteen models. Which model was built from which, and which ideas cross between the branches?</div>

  <h2 id="mt-family"><span class="num">02</span>The Family Tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The ladder says why each model exists, and the diary shows each one at work. But how do the fourteen notes hang together as a structure: which ones form a branch, which ideas cross between branches, and which tools serve all of them?</p>
  </div>
  <p>Here is the whole group on one picture. Every box is one note in the sidebar. Read it top-down: that is also roughly the order in which the ideas were invented (1984 CART → 1996 bagging → 1997 AdaBoost → 2001 random forest and gradient boosting → 2006 Extra Trees → 2014–2017 XGBoost, LightGBM, CatBoost), because each was built to fix a problem in the one above.</p>
  <figure class="viz"><svg viewBox="0 0 760 640" width="760">
<defs><marker id="mt-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="255" y="8" width="250" height="44" rx="8" class="fs" stroke="currentColor"/>
<text x="380" y="27" text-anchor="middle" font-size="14" font-weight="700">Decision Trees</text>
<text x="380" y="44" text-anchor="middle" class="tm" font-size="10">entropy · Gini · CART · pruning</text>
<line x1="380" y1="52" x2="380" y2="98" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="392" y="70" class="tr" font-size="10">weakness: high variance</text>
<text x="392" y="85" class="tm" font-size="10">fix: combine many models</text>
<rect x="245" y="100" width="270" height="44" rx="8" class="fv" stroke="currentColor"/>
<text x="380" y="119" text-anchor="middle" font-size="14" font-weight="700">Ensemble Learning: The Idea</text>
<text x="380" y="136" text-anchor="middle" class="tm" font-size="10">Var = ρσ² + (1−ρ)σ²/n · Condorcet</text>
<line x1="310" y1="144" x2="140" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="390" y1="144" x2="420" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="460" y1="144" x2="655" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="200" y="168" text-anchor="end" class="tm" font-size="10">in parallel → cuts variance</text>
<text x="408" y="192" text-anchor="end" class="tm" font-size="10">in sequence → cuts bias</text>
<text x="590" y="166" class="tm" font-size="10">blend different models</text>
<rect x="55" y="210" width="170" height="44" rx="8" class="fb sb" fill-opacity="0.25"/>
<text x="140" y="229" text-anchor="middle" font-size="14" font-weight="700">Bagging &amp; Bootstrap</text>
<text x="140" y="246" text-anchor="middle" class="tm" font-size="10">resample rows · OOB · 63.2%</text>
<rect x="335" y="210" width="170" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="229" text-anchor="middle" font-size="14" font-weight="700">How Boosting Works</text>
<text x="420" y="246" text-anchor="middle" class="tm" font-size="10">F_m = F_m−1 + ν·h_m</text>
<rect x="580" y="210" width="170" height="44" rx="8" class="fg sg" fill-opacity="0.25"/>
<text x="665" y="229" text-anchor="middle" font-size="14" font-weight="700">Stacking &amp; Voting</text>
<text x="665" y="246" text-anchor="middle" class="tm" font-size="10">meta-model on OOF preds</text>
<line x1="140" y1="254" x2="140" y2="300" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="150" y="276" class="tm" font-size="10">+ random features</text>
<text x="150" y="290" class="tm" font-size="10">at every split</text>
<rect x="65" y="302" width="150" height="44" rx="8" class="fb sb" fill-opacity="0.25"/>
<text x="140" y="321" text-anchor="middle" font-size="14" font-weight="700">Random Forest</text>
<text x="140" y="338" text-anchor="middle" class="tm" font-size="10">lower ρ between trees</text>
<line x1="140" y1="346" x2="140" y2="392" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="150" y="368" class="tm" font-size="10">+ random cut-offs,</text>
<text x="150" y="382" class="tm" font-size="10">no bootstrap</text>
<rect x="65" y="394" width="150" height="44" rx="8" class="fb sb" fill-opacity="0.25"/>
<text x="140" y="413" text-anchor="middle" font-size="14" font-weight="700">Extra Trees</text>
<text x="140" y="430" text-anchor="middle" class="tm" font-size="10">even more random, faster</text>
<line x1="420" y1="254" x2="420" y2="300" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="430" y="276" class="tm" font-size="10">first answer:</text>
<text x="430" y="290" class="tm" font-size="10">reweight wrong rows</text>
<rect x="345" y="302" width="150" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="321" text-anchor="middle" font-size="14" font-weight="700">AdaBoost</text>
<text x="420" y="338" text-anchor="middle" class="tm" font-size="10">α = ½ ln((1−ε)/ε)</text>
<line x1="420" y1="346" x2="420" y2="392" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="430" y="368" class="tm" font-size="10">generalised: fit the</text>
<text x="430" y="382" class="tm" font-size="10">gradient of any loss</text>
<rect x="335" y="394" width="170" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="413" text-anchor="middle" font-size="14" font-weight="700">Gradient Boosting</text>
<text x="420" y="430" text-anchor="middle" class="tm" font-size="10">pseudo-residuals −∂L/∂F</text>
<line x1="395" y1="438" x2="268" y2="490" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="420" y1="438" x2="420" y2="490" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="445" y1="438" x2="572" y2="490" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="318" y="458" text-anchor="end" class="tm" font-size="10">engineered GBM:</text>
<text x="318" y="472" text-anchor="end" class="tm" font-size="10">same idea, faster, safer</text>
<rect x="190" y="492" width="156" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="268" y="511" text-anchor="middle" font-size="14" font-weight="700">XGBoost</text>
<text x="268" y="528" text-anchor="middle" class="tm" font-size="10">w* = −G/(H+λ) · γ</text>
<rect x="348" y="492" width="144" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="420" y="511" text-anchor="middle" font-size="14" font-weight="700">LightGBM</text>
<text x="420" y="528" text-anchor="middle" class="tm" font-size="10">histograms · leaf-wise</text>
<rect x="494" y="492" width="156" height="44" rx="8" class="ft st" fill-opacity="0.25"/>
<text x="572" y="511" text-anchor="middle" font-size="14" font-weight="700">CatBoost</text>
<text x="572" y="528" text-anchor="middle" class="tm" font-size="10">ordered TS · oblivious</text>
<path d="M215 330 C 280 360, 300 395, 335 410" fill="none" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.7" marker-end="url(#mt-fa)"/>
<text x="296" y="360" class="tm" font-size="10">borrows row/column</text>
<text x="296" y="373" class="tm" font-size="10">subsampling</text>
<path d="M665 254 L665 470 L652 500" fill="none" stroke="currentColor" stroke-dasharray="4 3" stroke-opacity="0.7"/>
<text x="657" y="448" text-anchor="end" class="tm" font-size="10">blends any models,</text>
<text x="657" y="461" text-anchor="end" class="tm" font-size="10">e.g. RF + LightGBM</text>
<rect x="20" y="566" width="720" height="66" rx="8" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.6"/>
<text x="380" y="582" text-anchor="middle" class="tm" font-size="10">tools that apply to every model above</text>
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
  <div class="bridge"><b>What this still can't tell us → next: Reading Guide.</b> The picture shows who came from whom. It does not say what each note contains, or in which order to read them.</div>

  <h2 id="mt-guide"><span class="num">03</span>Reading Guide: Every Note in Order</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The family tree shows the structure. Before reading fourteen notes, what exactly will each one teach you, and what must you have read first?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Five Ideas Behind Everything.</b> Fourteen notes can feel like fourteen topics. In fact, five ideas do almost all the work; seeing them once, up front, makes every later note shorter.</div>

  <h2 id="mt-ideas"><span class="num">04</span>Five Ideas Behind Everything</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every note brings its own formulas: entropy, ρσ², α, w* = −G/(H+λ) … Is there a small set of ideas that all members share, so that a new note is mostly a variation of something already known?</p>
  </div>
  <h3>Idea 1: greedy splitting on impurity</h3>
  <p>Every tree in every model is grown the same way: at each node, try every (feature, threshold) pair and keep the one whose children are "purest". Purity is measured by Gini (1 − Σp²) or entropy (−Σ p log₂ p) for classes, and by variance (squared error) for numbers. Tiny example on the diary: the root holds 9 played and 5 not-played days, Gini 1 − ((9/14)² + (5/14)²) = 0.459. Splitting on Humidity gives High = [3 played, 4 not] with Gini 1 − (3/7)² − (4/7)² = 0.490 and Normal = [6, 1] with Gini 1 − (6/7)² − (1/7)² = 0.245. Both children hold 7 days, so the weighted child Gini is 0.5·0.490 + 0.5·0.245 = 0.367, and the split removes 0.459 − 0.367 = 0.092 of impurity. The tree tries every column (and every cut-off of HumPct, where ≤ 82.5 gives exactly this split) and picks the one that removes the most. Boosters use the same search but score splits by how much they reduce the boosting loss (XGBoost's gain formula is this idea with gradients). Taught in <a class="xref" data-note="ml_dtree">Decision Trees</a>.</p>
  <h3>Idea 2: bias and variance, and what averaging can fix</h3>
  <p>Error on new data = bias² + variance + noise (<a class="xref" data-note="ml_core">Core Concepts</a>). A deep tree has low bias and high variance; a stump has high bias and low variance. Averaging n models, each with variance σ² and pairwise correlation ρ, gives variance <strong>ρσ² + (1−ρ)σ²/n</strong>. Worked: σ² = 1, ρ = 0.5. One tree: 1. Ten trees: 0.5 + 0.5/10 = 0.55. A thousand: 0.5 + 0.0005 ≈ 0.50. More trees can only remove the second term; the floor is ρσ². Lower ρ (random forest: 0.3) → floor 0.3. Averaging never changes bias. That single formula explains why the bagging branch exists (lower variance), why random forest beat bagging (lower ρ), and why boosting was needed (bias). Taught in <a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a>.</p>
  <h3>Idea 3: randomness as a tool</h3>
  <p>Randomness is used on purpose to make trees different: bootstrap rows (bagging), random features per split (random forest), random thresholds (Extra Trees), row and column subsampling per tree (stochastic gradient boosting, XGBoost, LightGBM), gradient-based row sampling (GOSS), random permutations for ordered statistics (CatBoost). Every one of them trades a little accuracy per tree for lower correlation between trees or less overfitting.</p>
  <h3>Idea 4: additive models fitted by gradient steps</h3>
  <p>A booster is a sum: F(x) = F₀ + ν·h₁(x) + ν·h₂(x) + … Each new tree h_m is fitted to the negative gradient of the loss at the current prediction. Worked on the diary's turnout (how many club members came, a number to predict), squared error: start with F₀ = mean = 476/14 = 34 members for every day; the total squared error is 1280. The residuals y − F₀ run from −14 (D2 and D14, 20 members) to +14 (D13, 48 members). The best one-split tree (a stump) on those residuals is HumPct ≤ 82.5: it predicts +6 for the 7 normal-humidity days and −6 for the 7 humid ones (the mean residual on each side). Add it with ν = 0.5: normal days become 34 + 3 = 37, humid days 34 − 3 = 31, and the squared error falls from 1280 to 902. Repeat with the new residuals. This is gradient descent where each step is a tree (<a class="xref" data-note="m_optimization">Optimization</a>, <a class="xref" data-note="m_calculus">Calculus</a>). Taught in <a class="xref" data-note="ml_boosting">How Boosting Works</a> and <a class="xref" data-note="ml_gbm">Gradient Boosting</a>.</p>
  <h3>Idea 5: brakes (regularisation)</h3>
  <p>Every member has knobs that stop it from memorising: depth and leaf size for any tree, α for pruning, learning rate and number of rounds (with early stopping) for boosters, λ and γ penalties on leaves in XGBoost, num_leaves and min_data_in_leaf in LightGBM, l2_leaf_reg in CatBoost. They all do one thing: make each tree's contribution smaller or simpler so the model generalises. Taught across the model notes and collected in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>If a later note confuses you, ask which of the five ideas it is changing. XGBoost changes ideas 1 and 5 (a better split score, built-in penalties). LightGBM changes how idea 1 is computed (histograms) and idea 3 (GOSS). CatBoost changes idea 3 (ordered permutations) to fix a leak. Random forest changes idea 3 to improve idea 2.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Every Member at Scale.</b> Ideas are cheap and the diary is tiny; numbers on realistic data decide. How do all these members actually compare on one large dataset, with the same split and the same test rows?</div>

  <h2 id="mt-race"><span class="num">05</span>Every Member at Scale: 20,000 Customers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The diary shows how each model works, but with 14 rows one prediction moves accuracy by 7 points, so it cannot say which model is more accurate. How do the members compare on realistic data, all trained on the same rows and tested on the same unseen rows?</p>
  </div>
  <p>This is the same idea at scale. Besides the diary, the whole group uses one shared large dataset so that accuracy numbers in different notes can be compared. It is a synthetic customer-churn table: 20,000 customers, 12 columns from <code>make_classification</code> (6 carry signal, 2 are mixes of those, 4 are useless) plus two pure-noise columns, <code>row_noise</code> (20,000 different random values) and <code>coin_noise</code> (random 0 or 1). It is split 12,000 train / 3,000 validation / 5,000 test. The pattern is far from a straight line, which is exactly where tree models shine.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: The Big Comparison Table.</b> Accuracy is one column of a real decision. Speed, missing values, categorical columns, interpretability and tuning effort decide just as often.</div>

  <h2 id="mt-cmp"><span class="num">06</span>The Big Comparison Table</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The race ranked the members by accuracy. A real project also asks: how fast is it, what does it do with empty cells and text categories, can I explain it, how much tuning does it need?</p>
  </div>
  <p>Each row is one member. "Bias / variance" says which error the model mainly fights. "Missing values" says what happens if a cell is empty. "Categoricals" says whether text categories need encoding by you.</p>
  <div style="overflow-x:auto"><table class="tbl">
    <tr><th>Model</th><th>Bias / variance</th><th>Training speed</th><th>Missing values</th><th>Categoricals</th><th>Interpretability</th><th>Tuning effort</th><th>Typical use</th></tr>
    <tr><td><a class="xref" data-note="ml_dtree">Decision tree</a></td><td>Low bias, very high variance (unpruned)</td><td>Fast: O(n·d·log n)</td><td>sklearn ≥ 1.3 learns a direction for NaN; C4.5 fractional rows; CART surrogates</td><td>Encode (sklearn); C4.5 multiway natively</td><td>Highest: read the rules</td><td>Low (depth, leaf size, α)</td><td>Explainable rules, teaching, building block</td></tr>
    <tr><td><a class="xref" data-note="ml_bagging">Bagging</a></td><td>Cuts variance; bias ≈ one deep tree</td><td>n × one tree; parallel</td><td>As its base trees</td><td>Encode</td><td>Low</td><td>Low</td><td>Stabilising any unstable model</td></tr>
    <tr><td><a class="xref" data-note="ml_rf">Random forest</a></td><td>Cuts variance more (lower ρ)</td><td>Faster than bagging (√d features per split); parallel</td><td>sklearn ≥ 1.4 handles NaN natively</td><td>Encode</td><td>Low; MDI/permutation/SHAP</td><td>Very low: defaults work</td><td>First baseline on any table; noisy labels</td></tr>
    <tr><td><a class="xref" data-note="ml_extratrees">Extra Trees</a></td><td>Lowest variance of the branch, slightly more bias</td><td>Fastest of the branch (no threshold search)</td><td>Recent sklearn handles NaN natively</td><td>Encode</td><td>Low</td><td>Very low</td><td>Fast strong baseline, many features</td></tr>
    <tr><td><a class="xref" data-note="ml_adaboost">AdaBoost</a></td><td>Cuts bias (stumps)</td><td>Sequential; fast with stumps</td><td>Impute first (sklearn rejects NaN)</td><td>Encode</td><td>Low–medium (stumps)</td><td>Low</td><td>Historic, teaching; clean low-noise data</td></tr>
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
  <div class="bridge"><b>What this still can't tell us → next: Which One When.</b> A table lists facts. When a real problem lands on your desk, you need a short procedure that turns those facts into one choice.</div>

  <h2 id="mt-choose"><span class="num">07</span>Which One When</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know every member's strengths and costs. Given one concrete problem (a regulator, many categories, 50 million rows, a latency budget), which member should we try first?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: What No Tree Model Can Do.</b> A guide for when to use the family is incomplete without the cases where you should not use it at all.</div>

  <h2 id="mt-limits"><span class="num">08</span>What No Tree Model Can Do</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The decision guide always ends with some tree model. Are there problems where every member of the family fails for the same structural reason, however well tuned?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have the ladder, the diary numbers, the race, the tables and the limits. One picture and one table should now hold the whole family together.</div>

  <h2 id="mt-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Impurity, gain, pruning, variance, the bootstrap, random columns, random cut-offs, residuals, gradients, out-of-fold predictions: separate tricks, or one system in which each piece is built from the previous ones?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 760 372" width="760">
<defs><marker id="mt-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="170" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.35"/><text x="95" y="29" text-anchor="middle" font-size="11.5" font-weight="700">impurity</text><text x="95" y="45" text-anchor="middle" class="tm" font-size="10">H 0.940 · Gini 0.459</text>
<line x1="180" y1="32" x2="198" y2="32" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="200" y="10" width="170" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.35"/><text x="285" y="29" text-anchor="middle" font-size="11.5" font-weight="700">information gain</text><text x="285" y="45" text-anchor="middle" class="tm" font-size="10">Outlook 0.247 wins the root</text>
<line x1="370" y1="32" x2="388" y2="32" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="390" y="10" width="170" height="44" rx="7" class="fg sg"/><text x="475" y="29" text-anchor="middle" font-size="11.5" font-weight="700">decision tree</text><text x="475" y="45" text-anchor="middle" class="tm" font-size="10">5 rules fit all 14 days</text>
<line x1="560" y1="32" x2="578" y2="32" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="580" y="10" width="170" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.35"/><text x="665" y="29" text-anchor="middle" font-size="11.5" font-weight="700">pruning (α, depth)</text><text x="665" y="45" text-anchor="middle" class="tm" font-size="10">simpler, more bias</text>
<line x1="475" y1="54" x2="475" y2="90" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="390" y="92" width="170" height="44" rx="7" class="fr sr"/><text x="475" y="111" text-anchor="middle" font-size="11.5" font-weight="700">high variance</text><text x="475" y="127" text-anchor="middle" class="tm" font-size="10">drop D3 → root Humidity</text>
<line x1="390" y1="114" x2="372" y2="114" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="200" y="92" width="170" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.35"/><text x="285" y="111" text-anchor="middle" font-size="11.5" font-weight="700">ensembles</text><text x="285" y="127" text-anchor="middle" class="tm" font-size="10">Var = ρσ² + (1−ρ)σ²/n</text>
<line x1="250" y1="136" x2="110" y2="172" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="10" y="174" width="170" height="44" rx="7" class="fb sb"/><text x="95" y="193" text-anchor="middle" font-size="11.5" font-weight="700">bagging</text><text x="95" y="209" text-anchor="middle" class="tm" font-size="10">9 days in, 5 out-of-bag</text>
<line x1="180" y1="196" x2="198" y2="196" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="200" y="174" width="170" height="44" rx="7" class="fb sb"/><text x="285" y="193" text-anchor="middle" font-size="11.5" font-weight="700">random forest</text><text x="285" y="209" text-anchor="middle" class="tm" font-size="10">Outlook root: 562 → 375</text>
<line x1="370" y1="196" x2="388" y2="196" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="390" y="174" width="170" height="44" rx="7" class="fb sb"/><text x="475" y="193" text-anchor="middle" font-size="11.5" font-weight="700">Extra Trees</text><text x="475" y="209" text-anchor="middle" class="tm" font-size="10">random cut HumPct ≤ 89.96</text>
<path d="M200,124 L4,124 L4,278 L8,278" fill="none" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="10" y="256" width="170" height="44" rx="7" class="ft st"/><text x="95" y="275" text-anchor="middle" font-size="11.5" font-weight="700">boosting</text><text x="95" y="291" text-anchor="middle" class="tm" font-size="10">SSE 1280 → 902</text>
<line x1="180" y1="278" x2="198" y2="278" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="200" y="256" width="170" height="44" rx="7" class="ft st"/><text x="285" y="275" text-anchor="middle" font-size="11.5" font-weight="700">AdaBoost → GBM</text><text x="285" y="291" text-anchor="middle" class="tm" font-size="10">row weights → gradients</text>
<line x1="370" y1="278" x2="388" y2="278" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="390" y="256" width="170" height="44" rx="7" class="ft st"/><text x="475" y="275" text-anchor="middle" font-size="10.5" font-weight="700">XGBoost·LightGBM·CatBoost</text><text x="475" y="291" text-anchor="middle" class="tm" font-size="10">Hessian · bins · ordered TS</text>
<line x1="560" y1="196" x2="590" y2="226" stroke="currentColor" marker-end="url(#mt-ca)"/>
<line x1="560" y1="278" x2="590" y2="250" stroke="currentColor" marker-end="url(#mt-ca)"/>
<rect x="580" y="216" width="170" height="44" rx="7" class="fg sg"/><text x="665" y="235" text-anchor="middle" font-size="11.5" font-weight="700">stacking &amp; voting</text><text x="665" y="251" text-anchor="middle" class="tm" font-size="10">1-NN 14/14 in, 4/14 OOF</text>
<rect x="10" y="318" width="740" height="44" rx="7" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="380" y="337" text-anchor="middle" font-size="11.5" font-weight="700">explain (MDI, permutation, SHAP) · tune (depth, leaves, learning rate, early stopping) · ship and monitor</text><text x="380" y="353" text-anchor="middle" class="tm" font-size="10">applies to every box above; on the diary tree MDI = Outlook 0.26, Humidity 0.37, Wind 0.37</text>
</svg><figcaption>The whole family grows out of one quantity, impurity. Gain picks splits, splits make a tree, the tree's high variance motivates ensembles, and the two ensemble branches attack variance (blue: bagging → forest → Extra Trees) and bias (teal: boosting → AdaBoost → gradient boosting → XGBoost, LightGBM, CatBoost). Stacking blends the two branches. Small grey numbers are the running example.</figcaption></figure>
  <table class="tbl"><caption>Every step of the ladder, built from the one before, on the same 14 days</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the diary</th><th>When to use</th></tr>
    <tr><td>Impurity (entropy, Gini)</td><td>class shares p in a node</td><td>how mixed is a group?</td><td>root: entropy 0.940 bits, Gini 0.459</td><td>inside every split of every tree</td></tr>
    <tr><td>Information gain / split gain</td><td>impurity of parent − weighted impurity of children</td><td>which question first?</td><td>Outlook 0.247, Humidity 0.152, Wind 0.048, Temp 0.029</td><td>growing any tree (boosters use a gradient version)</td></tr>
    <tr><td>Decision tree</td><td>gain, applied greedily and recursively</td><td>readable rules that bend and interact?</td><td>5 rules, 0 training errors, 11/14 days right when each day is left out</td><td>rules must be read; teaching; building block</td></tr>
    <tr><td>Pruning</td><td>tree + penalty α per leaf, or depth/leaf limits</td><td>how to stop memorising?</td><td>a 1-question tree (Outlook) is right on 10/14 training days</td><td>always, for a single tree</td></tr>
    <tr><td>Variance (instability)</td><td>the same tree on a slightly different sample</td><td>how shaky is one tree?</td><td>without D3: Humidity 0.219 beats Outlook 0.214</td><td>the reason ensembles exist</td></tr>
    <tr><td>Ensemble average</td><td>many models + vote/average; Var = ρσ² + (1−ρ)σ²/n</td><td>can shaky models make a steady team?</td><td>3 independent 70% voters → 78.4%</td><td>members good and different</td></tr>
    <tr><td>Bagging</td><td>ensemble + bootstrap samples of rows</td><td>where do different trees come from?</td><td>9 days used, 5 out-of-bag; P(left out) = 0.354</td><td>any unstable model</td></tr>
    <tr><td>Random forest</td><td>bagging + m random columns per split</td><td>how to stop one column deciding every tree?</td><td>Outlook root in 375 of 1,000 trees (562 in bagging)</td><td>first baseline on any table</td></tr>
    <tr><td>Extra Trees</td><td>forest + random cut-offs, no bootstrap</td><td>even less alike, faster?</td><td>HumPct ≤ 89.96 (drop 0.066) instead of ≤ 82.5 (0.092)</td><td>many columns, speed</td></tr>
    <tr><td>Boosting</td><td>ensemble built in sequence on the current errors</td><td>how to remove mistakes every tree shares (bias)?</td><td>turnout SSE 1280 → 902 after one stump × 0.5</td><td>best accuracy on clean tables, with early stopping</td></tr>
    <tr><td>AdaBoost → GBM → XGBoost / LightGBM / CatBoost</td><td>boosting + row weights → loss gradients → curvature, bins, ordered statistics</td><td>how to focus, for any loss, faster, with categories?</td><td>worked in the boosting notes on the same diary</td><td>per data size, categories, latency</td></tr>
    <tr><td>Stacking &amp; voting</td><td>finished members + out-of-fold predictions + a meta-model</td><td>can different families be blended?</td><td>1-NN: 14/14 in-sample, 4/14 out of fold</td><td>when the last fraction of a point matters</td></tr>
    <tr><td>Explain &amp; tune</td><td>any fitted member</td><td>why this prediction; which knobs?</td><td>MDI on the diary tree: Outlook 0.26, Humidity 0.37, Wind 0.37</td><td>every model you ship</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the group: <strong>a tree greedily lowers impurity, which makes it accurate but shaky; bagging-type ensembles average many shaky trees that are made different on purpose (rows, columns, cut-offs), boosting-type ensembles add small trees that each fix the team's remaining error, and stacking blends the two.</strong> Every later formula is a detail of one of those four clauses.</p>
  </div>
  <h3>Notes before and after this group</h3>
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
    <li><a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a> — drift and performance tracking for deployed tree models.</li>
    <li><a class="xref" data-note="sd_cases">Case Studies</a> — system-design answers that use a global LightGBM, and why "I'd use XGBoost" is not a design.</li>
  </ul>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Knowing how the pieces fit is half the job; the other half is knowing where people usually go wrong with them.</div>

  <h2 id="mt-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know what each member does and how they connect. Which mistakes, made again and again in projects and interviews, cost the most across the whole family?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything in this note, condensed to one page for revision.</div>

  <h2 id="mt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole group on one sheet. Running example: the captain's 14-day cricket diary (Outlook, Temp, Humidity, Wind → Play; 9 played, 5 not; plus HumPct, TempC and Turnout as numbers). Larger numbers come from the 20,000-customer churn table.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Question it answers</th><th>Answer on the diary / at scale</th><th>Weakness → next</th></tr>
    <tr><td>Decision tree</td><td>readable rules that bend and interact?</td><td>root Outlook, IG 0.247; 5 rules; churn: train 1.000, val 0.773</td><td>memorises, shaky → pruning</td></tr>
    <tr><td>Pruning</td><td>stop memorising?</td><td>best pruned tree ≈ 0.81 at scale</td><td>still one shaky model → ensembles</td></tr>
    <tr><td>Ensembles</td><td>many shaky → one steady?</td><td>Var = ρσ² + (1−ρ)σ²/n; 3 voters at 70% → 78.4%</td><td>need different members → bagging</td></tr>
    <tr><td>Bagging</td><td>many training sets from one?</td><td>9 days in, 5 out-of-bag; churn 0.78 → 0.87</td><td>Outlook root in 562/1000 → forest</td></tr>
    <tr><td>Random forest</td><td>stop one column dominating?</td><td>Outlook root 375/1000; churn 0.877</td><td>bias untouched → boosting</td></tr>
    <tr><td>Extra Trees</td><td>less alike, faster?</td><td>cut 89.96 (0.066) vs 82.5 (0.092); churn 0.869, fastest</td><td>no learning from mistakes</td></tr>
    <tr><td>Boosting</td><td>fix shared mistakes?</td><td>SSE 1280 → 902 after one stump × 0.5</td><td>how to focus? → AdaBoost</td></tr>
    <tr><td>AdaBoost</td><td>simplest focusing?</td><td>reweight rows; α = ½ln((1−ε)/ε)</td><td>one loss, noise-sensitive → GBM</td></tr>
    <tr><td>Gradient boosting</td><td>any loss?</td><td>trees fit −∂L/∂F (residuals for squared error)</td><td>slow, few brakes → XGBoost</td></tr>
    <tr><td>XGBoost / LightGBM / CatBoost</td><td>better steps, speed, categories?</td><td>churn AUC 0.935–0.938 in seconds</td><td>small extra gains → blend</td></tr>
    <tr><td>Stacking &amp; voting</td><td>blend different families?</td><td>1-NN 14/14 in-sample vs 4/14 OOF; blend +0.003 AUC</td><td>cost, complexity</td></tr>
    <tr><td>Explain, tune, ship</td><td>why, which knobs, how to run?</td><td>diary MDI: Outlook 0.26, Humidity 0.37, Wind 0.37</td><td>explains the model, not the world</td></tr>
  </table>
  <h3>Formulas (each is derived in its own note)</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Entropy</td><td>H = −Σ pᵢ log₂ pᵢ</td><td>pᵢ share of class i in the node; 0.940 bits at the diary root</td></tr>
    <tr><td>Gini</td><td>G = 1 − Σ pᵢ²</td><td>chance two random rows from the node disagree; 0.459 at the root</td></tr>
    <tr><td>Gain</td><td>Δ = i(parent) − Σₖ (nₖ/n)·i(childₖ)</td><td>i = entropy (information gain) or Gini; nₖ rows in child k</td></tr>
    <tr><td>Cost-complexity</td><td>R_α(T) = R(T) + α·|T|</td><td>R training error, |T| number of leaves, α price per leaf</td></tr>
    <tr><td>Variance of an average</td><td>ρσ² + (1 − ρ)σ²/n</td><td>σ² one model's variance, ρ correlation between models, n models</td></tr>
    <tr><td>Bootstrap</td><td>P(row left out) = (1 − 1/n)ⁿ → 1/e ≈ 0.368</td><td>n rows; 14 days: 0.354; so ≈ 63.2% of rows are in a sample</td></tr>
    <tr><td>Random forest</td><td>m = √p columns per split (classification), p/3 (regression)</td><td>p columns in the data</td></tr>
    <tr><td>Boosting</td><td>F_m(x) = F_m−1(x) + ν·h_m(x)</td><td>h_m tree fitted to the current errors (negative gradient), ν learning rate</td></tr>
    <tr><td>AdaBoost vote</td><td>α = ½·ln((1 − ε)/ε)</td><td>ε weighted error of the stump</td></tr>
    <tr><td>XGBoost leaf</td><td>w* = −G/(H + λ)</td><td>G, H sums of gradients and Hessians in the leaf, λ L2 penalty</td></tr>
    <tr><td>Stacking</td><td>ŷ = g(f₁(x), …, f_M(x)), g trained on out-of-fold fᵢ</td><td>fᵢ base models, g meta-learner</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Pruned single tree</b><p>Every rule must be read by a person; tiny data; teaching.</p><small>Avoid when accuracy matters most</small></div>
    <div><b>Random forest</b><p>First model on any table, noisy labels, little tuning time; OOB score for free.</p><small>Avoid for tight latency or memory</small></div>
    <div><b>LightGBM / XGBoost</b><p>Best accuracy on large clean tables, with learning rate ≈ 0.05 and early stopping.</p><small>Avoid untuned on small data</small></div>
    <div><b>CatBoost</b><p>Many text categories, small to medium data, little tuning time.</p><small>Slower per tree on numeric data</small></div>
    <div><b>Blend / stack</b><p>Competitions; the last 0.3% is worth several models.</p><small>Out-of-fold predictions only</small></div>
    <div><b>No tree model</b><p>Trend extrapolation, small truly linear data, raw images/audio/text.</p><small>Linear models, neural networks</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Trusting one deep tree; thinking more forest trees overfit or more boosting rounds cannot; ensembles of look-alike members; picking the library before fixing validation and features; reading impurity importance as cause; in-sample stacking and naive target encoding; expecting any tree model to extrapolate; judging models on a 14-row table.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Diary root: 9 Yes, 5 No. Gini?</td><td>1 − (9/14)² − (5/14)² = 0.459</td></tr>
    <tr><td>ρ = 0.5, σ² = 1, n = 10 trees: variance of the average?</td><td>0.5 + 0.5/10 = 0.55 (floor 0.5)</td></tr>
    <tr><td>Chance a given day is out of one bootstrap sample of the 14 days?</td><td>(13/14)¹⁴ = 0.354</td></tr>
    <tr><td>Which branch cuts variance, which cuts bias?</td><td>Bagging / forest / Extra Trees: variance. Boosting: bias.</td></tr>
    <tr><td>Why must stacking use out-of-fold predictions?</td><td>In-sample predictions look perfect (1-NN 14/14) but are right only 4/14 on unseen days; the meta-model would trust the wrong member.</td></tr>
  </table>

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
  <details class="qa"><summary><span class="qmark">Q</span>Which members handle missing values and categorical columns natively?</summary><div class="qa-body">Missing: XGBoost, LightGBM, CatBoost, HistGradientBoosting, and recent scikit-learn decision trees, random forests and Extra Trees learn where NaN goes; sklearn AdaBoost and classic GradientBoosting reject NaN, so impute first. Categorical: CatBoost (best, ordered target statistics), LightGBM and HistGradientBoosting (native category splits), XGBoost with enable_categorical. Classic sklearn GradientBoosting, AdaBoost and Extra Trees need encoding.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you not use any tree model?</summary><div class="qa-body">When the target must be extrapolated (trend growth), when the relation is simple and linear with little data (a line wins), on raw images, audio or text (neural networks), and when you need smooth predictions or exact monotone curves without constraints.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your boosted model and random forest score the same. Would stacking them help?</summary><div class="qa-body">Probably a little, because they make different mistakes (parallel deep trees vs sequential shallow trees). On our data averaging RF, Extra Trees and LightGBM raised AUC by about 0.003. Whether that is worth running three models depends on the cost of errors vs the cost of latency and maintenance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A colleague says "XGBoost is always the best model for tabular data". How do you respond?</summary><div class="qa-body">Gradient-boosted trees are usually among the best on tabular data, but LightGBM, CatBoost and even a random forest are often within noise of XGBoost (as in our race). The choice depends on data size, categorical columns, latency, tuning time and team familiarity. Features and validation design matter more than the library.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do the explainability tools differ for a single tree vs an ensemble?</summary><div class="qa-body">A single tree can be read directly (export_text, plot_tree). An ensemble needs summaries: MDI importance (free but biased), permutation importance (on validation), partial dependence / ICE for effects, and SHAP for per-prediction reasons that add up exactly to the model output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>On the diary, why does a random forest need both the bootstrap and random columns? What breaks if you drop either one?</summary><div class="qa-body">Drop random columns and you have plain bagging: Outlook is the best column in most bootstrap samples, so it wins the root in 562 of 1,000 trees, the trees look alike and ρ stays high. Drop the bootstrap and every tree sees the same 14 days; with random columns the trees still differ (the root is Outlook only when it is drawn, 3 of 6 pairs), but every tree learns from every day, so there is no out-of-bag test and the trees are more alike. Together they give the lowest correlation for the least loss in strength.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does boosting use small trees while bagging uses deep ones?</summary><div class="qa-body">Each branch fixes the other error. Bagging averages, which removes variance but never bias, so its members must already have low bias: deep trees. Boosting adds trees one after another, which removes bias step by step, so each member can be a high-bias, low-variance small tree; deep members would make each step overfit. On the diary a single stump moved the turnout error from 1280 to 902; many such steps add up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Removing day D3 changes the diary tree's root from Outlook to Humidity. Which note's idea does this observation start, and how does each later note use it?</summary><div class="qa-body">It is high variance, the starting point of <a class="xref" data-note="ml_ensembles">Ensemble Learning</a>: models that change with the sample make partly random mistakes, and random mistakes cancel in a vote. Bagging creates such samples on purpose (bootstrap), the random forest and Extra Trees make the trees even more different (random columns, random cut-offs), and boosting takes the opposite route, making each new tree depend on the previous ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What breaks if you compare models on the 14-day diary instead of the 20,000-row table?</summary><div class="qa-body">The numbers become noise. One prediction more or less moves accuracy by 7 points, so leave-one-out scores on the diary (the tree is right on 11 of 14) cannot separate models that differ by 1–2 points. The diary is for following the mechanics by hand; accuracy comparisons need many rows and an untouched test set.</div></details>
</main>
`
});
