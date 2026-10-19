// notes/ml/ml_gbm.js — Gradient Boosting
Object.assign(TOPIC_CONTENT, {
  "ml_gbm": `<main>
<h1>Gradient Boosting</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>Gradient Boosting</span></div>
  <p class="lead">Gradient boosting (Friedman, 1999–2001) builds a model as a sum of small regression trees. Each new tree is trained to predict <strong>what the current model still gets wrong</strong>, measured as the negative gradient of a loss you choose: plain residuals for squared error, y − p for log-loss, and so on. It is the engine inside XGBoost, LightGBM, CatBoost and sklearn's HistGradientBoosting, and the most used model family for table data. This note follows one running example throughout, the captain's 14-day cricket diary shared by the whole tree group (turnout for regression, Play for classification). It works three rounds by hand, derives why "residual" really means "negative gradient", covers every common loss (with the classification maths by hand), the leaf-value line search, the learning rate, tree depth, subsampling and early stopping, and then writes it from scratch to match sklearn to 15 decimal places.</p>

  <h2 id="gbm-where" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 760 372" width="760"><defs><marker id="gbm-wa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><line x1="380" y1="38" x2="380" y2="60" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><line x1="380" y1="92" x2="110" y2="120" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><text x="239" y="111" text-anchor="end" class="tm" font-size="11">parallel</text><line x1="380" y1="92" x2="400" y2="120" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><text x="396" y="111" text-anchor="start" class="tm" font-size="11">sequential</text><line x1="380" y1="92" x2="670" y2="120" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><text x="531" y="111" text-anchor="start" class="tm" font-size="11">blend</text><line x1="110" y1="152" x2="110" y2="178" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><line x1="110" y1="210" x2="110" y2="236" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><line x1="400" y1="152" x2="400" y2="178" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><line x1="400" y1="210" x2="400" y2="236" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><line x1="400" y1="268" x2="270" y2="298" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><line x1="400" y1="268" x2="400" y2="298" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><line x1="400" y1="268" x2="530" y2="298" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#gbm-wa)"/><rect x="305" y="8" width="150" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="380" y="27" text-anchor="middle" font-size="12.5">Decision Trees</text><rect x="300" y="62" width="160" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="380" y="81" text-anchor="middle" font-size="12.5">Ensemble Learning</text><rect x="45" y="122" width="130" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="110" y="141" text-anchor="middle" font-size="12.5">Bagging</text><rect x="315" y="122" width="170" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="400" y="141" text-anchor="middle" font-size="12.5">How Boosting Works</text><rect x="595" y="122" width="150" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="670" y="141" text-anchor="middle" font-size="12.5">Stacking &amp; Voting</text><rect x="45" y="180" width="130" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="110" y="199" text-anchor="middle" font-size="12.5">Random Forest</text><rect x="45" y="238" width="130" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="110" y="257" text-anchor="middle" font-size="12.5">Extra Trees</text><rect x="330" y="180" width="140" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="400" y="199" text-anchor="middle" font-size="12.5">AdaBoost</text><rect x="320" y="238" width="160" height="30" rx="7" class="fg sg" stroke-width="2.5"/><text x="400" y="257" text-anchor="middle" font-size="12.5" font-weight="700">Gradient Boosting</text><rect x="215" y="300" width="110" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="270" y="319" text-anchor="middle" font-size="12.5">XGBoost</text><rect x="345" y="300" width="110" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="400" y="319" text-anchor="middle" font-size="12.5">LightGBM</text><rect x="475" y="300" width="110" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="530" y="319" text-anchor="middle" font-size="12.5">CatBoost</text><rect x="20" y="344" width="720" height="24" rx="6" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.5"/><text x="380" y="360" text-anchor="middle" class="tm" font-size="11.5">used by every model above: Feature Importance &amp; SHAP · Tuning &amp; Production</text></svg><figcaption>The tree-based family. Gradient boosting (green) generalises AdaBoost and is the parent of XGBoost, LightGBM and CatBoost.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_adaboost">AdaBoost</a></b><span>AdaBoost showed that small trees added one after another can become a strong model, and it was later understood as "greedily minimise the exponential loss". But that loss is fixed: it only does classification, and it lets mislabeled rows take over. There was no recipe for regression, for log-loss, or for a business's own cost.</span></li>
    <li><b>This note: Gradient Boosting</b><span>One recipe for <em>any</em> differentiable loss: compute the negative gradient of the loss at the current predictions (for squared error, simply the residuals), fit a regression tree to it, set each leaf to the best step for the real loss, add a shrunken copy, repeat. Plus the brakes that make it work in practice: learning rate, depth, subsampling, early stopping.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_xgboost">XGBoost</a>, <a class="xref" data-note="ml_lightgbm">LightGBM</a>, <a class="xref" data-note="ml_catboost">CatBoost</a></b><span>Plain gradient boosting is correct but slow on big data (it tries every cut-off), has no penalty on leaf sizes, and leaves categories to you. XGBoost adds second-order steps and regularisation, LightGBM adds histograms and leaf-wise growth, CatBoost adds leak-free category handling. Tuning all of them is in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</span></li>
  </ol>
  <p>Before this note: regression trees and how they pick splits (<a class="xref" data-note="ml_dtree">Decision Trees</a>), the boosting plan F = F₀ + Σ ν·h (<a class="xref" data-note="ml_boosting">How Boosting Works</a>), derivatives and gradients (<a class="xref" data-note="m_calculus">Calculus</a>), gradient descent (<a class="xref" data-note="m_optimization">Optimization</a>), and log-loss (<a class="xref" data-note="ml_classification">Classification</a>).</p>

    <h2 id="gbm-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next question. Numbers are from the running example, the captain's 14-day cricket diary: Turnout (players who came) for regression, Play / No play for classification.</p>
  <ol class="story">
    <li><b>Fit what's left</b><span>Q: AdaBoost's re-weighting works only for right/wrong and one loss; how do we boost a number like turnout? → Start at a constant and fit each new tree to what the model still gets wrong. But what exactly does a tree fit, and how do the numbers move?</span></li>
    <li><b>Three rounds by hand (squared error)</b><span>Q: what does one round do? → Fit a stump to the residuals, add half of it: HumPct ≤ 82.5, then Overcast?, then Wind strong?; SSE 1280 → 902 → 696.2 → 555.1, matching sklearn exactly. But "residual" has no meaning for Play / No play…</span></li>
    <li><b>The negative gradient</b><span>Q: what is a residual, really? → The negative gradient of ½(y − F)² with respect to the prediction. Boosting is gradient descent on the 14 predictions, with a tree to generalise each step. So any loss with a derivative works; which ones?</span></li>
    <li><b>Loss functions</b><span>Q: which loss for which job? → Squared, absolute, Huber, quantile, log-loss. With D6 typed as 83, squared error tells the next tree +44.64, Huber +18, absolute +1. For Play, log-loss gives pseudo-residuals y − p = +0.357 / −0.643. But a tree's leaf holds the mean pseudo-residual, which is in the wrong units for log-loss…</span></li>
    <li><b>Leaf values: the line search</b><span>Q: what number should each leaf add? → The value that minimises the real loss in that leaf; for log-loss one Newton step Σ(y−p)/Σp(1−p): +1.556 on the overcast leaf instead of the mean +0.357. Then: how big should each step be overall?</span></li>
    <li><b>Learning rate &amp; number of trees</b><span>Q: how much of each tree to keep, and how many trees? → Small ν is slightly better but needs proportionally more trees (churn: ν 1.0 best 0.420 at 24 trees; ν 0.1 0.363 at ≈ 1,000). How big should each tree be?</span></li>
    <li><b>Tree depth &amp; interactions</b><span>Q: how many questions per tree? → Depth d allows d-feature interactions. Diary stumps get 11/14 days (rain-and-windy is an interaction), depth 2 gets 14/14. Can we also make trees less alike and faster?</span></li>
    <li><b>Stochastic gradient boosting</b><span>Q: does randomness help boosting too? → Each tree on a random half of the rows: slightly better and twice as fast on churn. But when do we stop adding trees?</span></li>
    <li><b>Overfitting &amp; early stopping</b><span>Q: how many trees? → Watch validation loss and stop when it stops improving (398 trees chosen automatically). Can we write all of this ourselves?</span></li>
    <li><b>From scratch</b><span>Q: is the recipe complete? → 60 lines match sklearn to 1e-14 on 20,000 rows (and the diary rounds match exactly). Which sklearn class should you use?</span></li>
    <li><b>GradientBoosting vs HistGradientBoosting</b><span>Q: exact or binned splits? → Bins: 34× faster, NaN and categories handled. How does it compare with the rest of the family?</span></li>
  </ol>

<h2 id="gbm-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Gradient Boosting</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The loop</div>
        <ul>
          <li><b>F₀</b> = best constant (mean, median, log-odds)</li>
          <li><b>Pseudo-residuals</b> rᵢ = −∂L/∂F at the current F</li>
          <li><b>Fit a regression tree</b> to r (least squares)</li>
          <li><b>Leaf values</b> = best step for the real loss (line search)</li>
          <li><b>Update</b> F ← F + ν·tree; repeat M times</li>
          <li>💡 Golf: every shot aims from where the ball is now</li>
          <li><b>Diary turnout</b> (ν 0.5): HumPct ≤ 82.5 → Overcast? → Wind strong?; SSE 1280 → 902 → 696.2 → 555.1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why "gradient"</div>
        <ul>
          <li>Gradient descent on the n predictions themselves</li>
          <li>For ½(y−F)²: −gradient = y − F = the residual</li>
          <li>The tree turns n numbers into a rule that works for new x</li>
          <li>"Gradient descent in function space"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Losses</div>
        <ul>
          <li><b>Squared</b> — r = y − F; F₀ = mean; leaf = mean</li>
          <li><b>Absolute</b> — r = sign(y − F); F₀ = median; leaf = median</li>
          <li><b>Huber</b> — squared near 0, absolute beyond δ (robust)</li>
          <li><b>Quantile α</b> — prediction intervals</li>
          <li><b>Log-loss</b> — r = y − p; F₀ = log-odds; leaf = Σ(y−p)/Σp(1−p)</li>
          <li><b>Exponential</b> — gives back AdaBoost</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Knobs (brakes)</div>
        <ul>
          <li><b>learning_rate ν</b> — smaller = more trees, slightly better</li>
          <li><b>n_estimators</b> — pick by early stopping</li>
          <li><b>max_depth / max_leaf_nodes</b> — depth d = interactions up to order d</li>
          <li><b>min_samples_leaf</b> — no tiny leaves</li>
          <li><b>subsample &lt; 1</b> — stochastic GB, less variance</li>
          <li><b>max_features</b> — column sampling per split</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Overfitting</div>
        <ul>
          <li>Train loss → 0; validation loss is U-shaped</li>
          <li>More trees CAN hurt (unlike a forest)</li>
          <li><b>Early stopping</b> — validation_fraction + n_iter_no_change</li>
          <li>Tune ν and M together, never M alone</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">sklearn</div>
        <ul>
          <li><b>GradientBoosting*</b> — exact splits, slow, no NaN</li>
          <li><b>HistGradientBoosting*</b> — 255 bins, fast, NaN + categories, ES on by default for n &gt; 10k</li>
          <li>Multiclass: K trees per round</li>
          <li>Next: XGBoost / LightGBM / CatBoost</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="gbm-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Idea: Fit What's Left</span><span class="rm-sub">The cricket diary, one tree at a time</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-hand"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Three Rounds by Hand</span><span class="rm-sub">14 days, squared error</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-grad"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Why Residuals = Negative Gradient</span><span class="rm-sub">Gradient descent in function space</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-loss"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Loss Functions</span><span class="rm-sub">Squared, absolute, Huber, quantile, log-loss</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-leaf"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Leaf Values: Line Search</span><span class="rm-sub">Newton step for log-loss, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-lr"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Learning Rate &amp; Number of Trees</span><span class="rm-sub">The central trade-off</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-depth"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Tree Depth &amp; Interactions</span><span class="rm-sub">Why stumps fail on rain-and-windy</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-sub"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Stochastic Gradient Boosting</span><span class="rm-sub">subsample, max_features, OOB</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-es"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Overfitting &amp; Early Stopping</span><span class="rm-sub">When to stop adding trees</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-scratch"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Regression + classification = sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-sk"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">GradientBoosting vs HistGradientBoosting</span><span class="rm-sub">Parameters, speed, NaN, categories</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-cmp"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs AdaBoost, forest, XGBoost family</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One loop, any loss</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in practice</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="gbm-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="gbm-idea"><span class="num">01</span>The Idea: Fit What's Left</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><a class="xref" data-note="ml_adaboost">AdaBoost</a> pointed each new stump at the team's mistakes by re-weighting rows, which only works for right/wrong labels and one fixed loss. How do we boost a number, such as how many players turn up, or use a loss we choose ourselves?</p>
  </div>
  <p><strong>The need.</strong> AdaBoost focuses on mistakes by re-weighting rows, and that only makes sense for "right / wrong" classification under one fixed loss. For a house price, "wrong" is not yes/no: missing by ₹1 lakh and missing by ₹50 lakh are very different. And for churn we usually want good <em>probabilities</em> (log-loss), not the exponential loss. We want one boosting recipe that works for any target and any loss.</p>
  <p><strong>The idea in plain words.</strong> Start with the simplest possible guess for everyone (for prices, the average price). For each row, measure how far off that guess is. Train a small tree to predict those "how far off" numbers from the features. Add a small fraction of that tree's answer to the guess. Measure again, train another small tree on what is still off, add it, and so on. Each tree is a correction to the sum of all trees before it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Golf. The first shot sends the ball roughly toward the hole. You do not hit the second shot from the tee; you walk to where the ball landed and aim from there at what is left. Each shot is shorter and more careful. Gradient boosting is the same: every tree "aims" from the current prediction at the remaining gap. The learning rate is choosing to hit a little softer than you think you need, so you do not overshoot.</p>
  </div>
  <h3>The running example</h3>
  <p>The whole tree group follows a college cricket captain's diary of 14 days, D1–D14 (Quinlan's PlayTennis table with three numeric columns added). For each day: Outlook, Humidity (and the humidity reading HumPct in %), Wind, the temperature TempC, whether the match was played (Play), and how many club members turned up (Turnout). Sections 02–03 boost <strong>Turnout</strong> (a number, squared error); sections 04–05 boost <strong>Play</strong> (yes/no, log-loss). Every column becomes a number for the trees: HumPct and TempC as they are, and each word answer as a 0/1 column (Outlook_Overcast, Humidity_High, Wind_Strong, …).</p>
  <table class="tbl">
    <tr><th>day</th><th>D1</th><th>D2</th><th>D3</th><th>D4</th><th>D5</th><th>D6</th><th>D7</th><th>D8</th><th>D9</th><th>D10</th><th>D11</th><th>D12</th><th>D13</th><th>D14</th></tr>
    <tr><td>Outlook</td><td>Sun</td><td>Sun</td><td>Ovc</td><td>Rain</td><td>Rain</td><td>Rain</td><td>Ovc</td><td>Sun</td><td>Sun</td><td>Rain</td><td>Sun</td><td>Ovc</td><td>Ovc</td><td>Rain</td></tr>
    <tr><td>Humidity</td><td>High</td><td>High</td><td>High</td><td>High</td><td>Norm</td><td>Norm</td><td>Norm</td><td>High</td><td>Norm</td><td>Norm</td><td>Norm</td><td>High</td><td>Norm</td><td>High</td></tr>
    <tr><td>Wind</td><td>Weak</td><td>Str</td><td>Weak</td><td>Weak</td><td>Weak</td><td>Str</td><td>Str</td><td>Weak</td><td>Weak</td><td>Weak</td><td>Str</td><td>Str</td><td>Weak</td><td>Str</td></tr>
    <tr><td>HumPct</td><td>85</td><td>90</td><td>86</td><td>96</td><td>80</td><td>70</td><td>65</td><td>95</td><td>70</td><td>80</td><td>70</td><td>90</td><td>75</td><td>91</td></tr>
    <tr><td>TempC</td><td>29</td><td>27</td><td>28</td><td>21</td><td>20</td><td>18</td><td>18</td><td>22</td><td>21</td><td>24</td><td>24</td><td>22</td><td>27</td><td>22</td></tr>
    <tr><td>Play</td><td>No</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>No</td><td>Yes</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td><td>No</td></tr>
    <tr><td>Turnout</td><td>25</td><td>30</td><td>46</td><td>45</td><td>52</td><td>23</td><td>43</td><td>35</td><td>38</td><td>46</td><td>48</td><td>52</td><td>44</td><td>30</td></tr>
  </table>
  <div class="flow"><span>F₀ = constant guess</span><span>r = how far off each row is</span><span>Fit a small regression tree to r</span><span>F ← F + ν·tree</span><span>Repeat M times</span></div>
  <p>Two words to keep apart. A <strong>residual</strong> is y − F, the plain gap. A <strong>pseudo-residual</strong> is the negative gradient of the loss, which equals the residual for squared error and is something else for other losses (section 03). The trees are always <em>regression</em> trees, even for classification, because pseudo-residuals are real numbers.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gradient boosting</strong> builds F_M(x) = F₀ + ν·Σₘ hₘ(x), where each hₘ is a small regression tree fitted by least squares to the pseudo-residuals rᵢₘ = −∂L(yᵢ, F)/∂F evaluated at F = F_{m−1}(xᵢ), with leaf values then set to minimise the loss L itself, and ν ∈ (0, 1] is the learning rate (shrinkage).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Three rounds by hand.</b> The words are simple; the details (which split, which leaf value, how the numbers move) only become clear with numbers.</div>

  <h2 id="gbm-hand"><span class="num">02</span>Three Rounds by Hand (Squared Error, the Diary)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Fit a small tree to what is left, add a fraction of it": on real numbers, which split does each tree choose, what do its leaves hold, and how do the 14 predictions move round by round?</p>
  </div>
  <p>Predict Turnout. Loss: squared error. Learning rate ν = 0.5. Trees: stumps that may use any column (HumPct, TempC, or a 0/1 word column).</p>
  <h3>Round 0: the starting constant</h3>
  <p>Which single number c makes Σ(yᵢ − c)² smallest? Take the derivative: −2Σ(yᵢ − c) = 0 → c = Σyᵢ/n = the <strong>mean</strong>. Here 476/14 = <strong>34</strong>. So F₀ = 34 for every day; SSE = Σ(y − 34)² = 1280, MSE 91.43.</p>
  <h3>Round 1</h3>
  <p>Residuals r = y − F₀: D1 −10, D2 −14, D3 +2, D4 −2, D5 +10, D6 −12, D7 +8, D8 −8, D9 +6, D10 +12, D11 +4, D12 +4, D13 +14, D14 −14. Now fit a stump to r: try every cut-off of every column (halfway between neighbouring values), put the mean residual of each side in its leaf, and measure the leftover sum of squared errors (SSE). The best ones:</p>
  <table class="tbl">
    <tr><th>split</th><th>left (≤)</th><th>right (&gt;)</th><th>SSE</th></tr>
    <tr><td>HumPct ≤ 82.5 (= Humidity Normal / High)</td><td>7 normal days, mean +6</td><td>7 humid days, −6</td><td><b>776.00</b></td></tr>
    <tr><td>HumPct ≤ 88.0</td><td>9 days, +3.778</td><td>5 days, −6.800</td><td>920.36</td></tr>
    <tr><td>Outlook_Overcast ≤ 0.5 (not overcast)</td><td>10 days, −2.8</td><td>4 overcast days, +7</td><td>1005.60</td></tr>
  </table>
  <p>HumPct ≤ 82.5 wins, the same cut as the diary's High / Normal humidity (the 0/1 Humidity columns tie with it; the code keeps the first). By hand: the 7 normal-humidity days have residuals +10, −12, +8, +6, +12, +4, +14 (sum 42, mean +6); the humid days sum to −42, mean −6. SSE drops from 1280 to 776. Add half of the stump (ν = 0.5): normal days 34 + 3 = <b>37</b>, humid days 34 − 3 = <b>31</b>. SSE 1280 → 902 (the same first step as in <a class="xref" data-note="ml_trees">The Tree Family</a>).</p>
  <h3>Round 2</h3>
  <p>The new residuals are the targets now. Every normal day is still 3 too low on average and every humid day 3 too high (we only took half a step), but a stronger pattern has appeared: the overcast days D3, D7, D12, D13 are under-predicted by +5, +5, +7, +11. The best stump is "Overcast?": overcast days +7, the others −2.8. Half of it: overcast days get +3.5, the others −1.4 (D7: 37 + 3.5 = 40.5; D1: 31 − 1.4 = 29.6). SSE 696.2.</p>
  <h3>Round 3</h3>
  <p>Best split "Wind strong?" (Wind_Strong ≤ 0.5): calm days +3.175, windy days −4.233. Half of it: D6 (rainy, windy, 22 players) falls from 35.6 to 33.48, D13 (overcast, calm) rises to 42.09. SSE 555.07, MSE 39.65.</p>
  <p>Each round uses a <em>different</em> split (humidity, then outlook, then wind), because each tree looks at what is left, not at the original turnouts. The code below does the same search and then asks sklearn to do it:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.ensemble import GradientBoostingRegressor
# every column as a number: humidity %, temperature, and 0/1 for each word answer
X = pd.concat([df[["HumPct", "TempC"]], pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)], axis=1)
y = df.Turnout.values.astype(float)
lr = 0.5
def stump_candidates(r):
    out = []
    for c in X.columns:
        v = np.sort(X[c].unique())
        for t in (v[:-1] + v[1:]) / 2:                     # cut-offs halfway between values
            L = X[c].values &lt;= t
            sse = ((r[L] - r[L].mean()) ** 2).sum() + ((r[~L] - r[~L].mean()) ** 2).sum()
            out.append((sse, c, t, r[L].mean(), r[~L].mean(), L))
    return sorted(out, key=lambda o: o[0])
F = np.full(14, y.mean())
print(f"F0 = mean = {y.mean():.2f}   SSE {((y - F) ** 2).sum():.2f}   MSE {np.mean((y - F) ** 2):.2f}")
for m in range(1, 4):
    r = y - F
    print(f"\\n--- round {m}: residuals r = y - F =", " ".join(f"{v:+.2f}" for v in r))
    cands = stump_candidates(r)
    for sse, c, t, a, b, L in cands[:4]:
        print(f"  {c:&gt;17s} &lt;= {t:5.1f}: left mean {a:+7.3f} ({L.sum():2d} days)  right mean {b:+7.3f}  SSE {sse:7.2f}")
    sse, c, t, a, b, L = cands[0]
    F = F + lr * np.where(L, a, b)
    print(f"  chosen {c} &lt;= {t}; F{m} =", " ".join(f"{v:.2f}" for v in F), f"  SSE {((y - F) ** 2).sum():.2f}  MSE {np.mean((y - F) ** 2):.2f}")
sk = GradientBoostingRegressor(n_estimators=3, learning_rate=lr, max_depth=1).fit(X, y)
print("\\nsklearn GradientBoostingRegressor(3 stumps, lr 0.5): max |ours - sklearn| =", f"{np.abs(sk.predict(X) - F).max():.2e}")</div>
  <div class="fx" data-lang="text">F0 = mean = 34.00   SSE 1280.00   MSE 91.43

--- round 1: residuals r = y - F = -10.00 -14.00 +2.00 -2.00 +10.00 -12.00 +8.00 -8.00 +6.00 +12.00 +4.00 +4.00 +14.00 -14.00
             HumPct &lt;=  82.5: left mean  +6.000 ( 7 days)  right mean  -6.000  SSE  776.00
      Humidity_High &lt;=   0.5: left mean  +6.000 ( 7 days)  right mean  -6.000  SSE  776.00
    Humidity_Normal &lt;=   0.5: left mean  -6.000 ( 7 days)  right mean  +6.000  SSE  776.00
             HumPct &lt;=  88.0: left mean  +3.778 ( 9 days)  right mean  -6.800  SSE  920.36
  chosen HumPct &lt;= 82.5; F1 = 31.00 31.00 31.00 31.00 37.00 37.00 37.00 31.00 37.00 37.00 37.00 31.00 37.00 31.00   SSE 902.00  MSE 64.43

--- round 2: residuals r = y - F = -7.00 -11.00 +5.00 +1.00 +7.00 -15.00 +5.00 -5.00 +3.00 +9.00 +1.00 +7.00 +11.00 -11.00
   Outlook_Overcast &lt;=   0.5: left mean  -2.800 (10 days)  right mean  +7.000  SSE  627.60
        Wind_Strong &lt;=   0.5: left mean  +3.000 ( 8 days)  right mean  -4.000  SSE  734.00
          Wind_Weak &lt;=   0.5: left mean  -4.000 ( 6 days)  right mean  +3.000  SSE  734.00
             HumPct &lt;=  82.5: left mean  +3.000 ( 7 days)  right mean  -3.000  SSE  776.00
  chosen Outlook_Overcast &lt;= 0.5; F2 = 29.60 29.60 34.50 29.60 35.60 35.60 40.50 29.60 35.60 35.60 35.60 34.50 40.50 29.60   SSE 696.20  MSE 49.73

--- round 3: residuals r = y - F = -5.60 -9.60 +1.50 +2.40 +8.40 -13.60 +1.50 -3.60 +4.40 +10.40 +2.40 +3.50 +7.50 -9.60
        Wind_Strong &lt;=   0.5: left mean  +3.175 ( 8 days)  right mean  -4.233  SSE  508.03
          Wind_Weak &lt;=   0.5: left mean  -4.233 ( 6 days)  right mean  +3.175  SSE  508.03
             HumPct &lt;=  82.5: left mean  +3.000 ( 7 days)  right mean  -3.000  SSE  570.20
      Humidity_High &lt;=   0.5: left mean  +3.000 ( 7 days)  right mean  -3.000  SSE  570.20
  chosen Wind_Strong &lt;= 0.5; F3 = 31.19 27.48 36.09 31.19 37.19 33.48 38.38 31.19 37.19 37.19 33.48 32.38 42.09 27.48   SSE 555.07  MSE 39.65

sklearn GradientBoostingRegressor(3 stumps, lr 0.5): max |ours - sklearn| = 0.00e+00</div>
  <p>sklearn's <code>GradientBoostingRegressor</code> with 3 stumps and learning rate 0.5 gives exactly our F₃ (difference 0).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The tree is fit to the <em>residuals</em>, not to y. A common bug in hand-written boosting is <code>tree.fit(X, y)</code> every round: then every tree is the same and nothing is learned after round 1.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The negative gradient.</b> For squared error "fit the residual" is obvious. But for Play / No play there is no natural residual of a probability, and for absolute error the residual is the wrong target. The general rule comes from seeing the residual as a gradient.</div>

  <h2 id="gbm-grad"><span class="num">03</span>Why Residuals? The Negative Gradient</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 02 fitted residuals because, for squared error, that obviously helps. But what is a residual in general, and what should the trees fit when the loss is something else?</p>
  </div>
  <p><strong>Plain words first.</strong> Forget trees for a moment. Treat the n training predictions F(x₁), …, F(xₙ) as n numbers you are free to move. You want to move them so the loss goes down. Gradient descent (<a class="xref" data-note="m_optimization">Optimization</a>) says: move each number a small step against its own derivative.</p>
  <p>For the loss L = ½(y − F)² (the ½ just cancels the 2), the derivative with respect to the prediction is ∂L/∂F = −(y − F). So the gradient descent step is:</p>
  <p style="text-align:center"><strong>F(xᵢ) ← F(xᵢ) − ν · ∂L/∂F = F(xᵢ) + ν · (yᵢ − F(xᵢ))</strong></p>
  <p>The step is ν times the residual. <strong>The residual is the negative gradient of squared error.</strong> Round 1 on the diary: at F₀ = 34 the gradient is (+10, +14, −2, …, +14) and the negative gradient is (−10, −14, +2, …, −14): exactly the residuals we fitted. Moving all 14 predictions straight along it with ν = 0.5 would halve every residual, but only for these 14 days; the stump instead gives one step per leaf (+3 for every normal-humidity day, −3 for every humid one), a rule that also works for day 15.</p>
  <p><strong>Why do we need a tree then?</strong> Moving the n numbers directly would only change predictions for the training rows; a new customer would get nothing. So instead of taking the raw gradient step, we fit a regression tree to the negative gradient. The tree groups similar rows (same leaf) and gives them the same step, and it can be applied to any new x. The tree is the closest "tree-shaped" approximation (least squares) of the steepest-descent direction. That is why the method is called <strong>gradient descent in function space</strong>: each step moves a whole function, not a weight vector.</p>
  <table class="tbl">
    <tr><th></th><th>Gradient descent (e.g. linear regression)</th><th>Gradient boosting</th></tr>
    <tr><td>What is being moved</td><td>weights w</td><td>the prediction function F (its values at the data)</td></tr>
    <tr><td>Gradient taken with respect to</td><td>w</td><td>F(xᵢ) for each row</td></tr>
    <tr><td>Step</td><td>w ← w − η∇_w L</td><td>F ← F + ν·h, where h ≈ −∇_F L (a tree)</td></tr>
    <tr><td>Step size</td><td>learning rate η</td><td>learning rate ν, plus a line search per leaf</td></tr>
    <tr><td>Result after M steps</td><td>one weight vector</td><td>a sum of M trees</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pseudo-residual</strong> of row i at round m: <strong>rᵢₘ = −[∂L(yᵢ, F)/∂F] evaluated at F = F_{m−1}(xᵢ)</strong>. For squared error it is the residual y − F. For other losses it is "the direction, and roughly the amount, by which this row's prediction should move to reduce the loss fastest".</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>This one step is what makes the method general. Any loss you can differentiate gives pseudo-residuals, so the same loop handles regression, classification, ranking, counts, quantiles, or your own business cost. Change the loss, and only two lines change: the pseudo-residual and the leaf value.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Gradient boosting uses gradient descent to train each tree." No: each tree is grown by the usual greedy least-squares splitting (<a class="xref" data-note="ml_dtree">Decision Trees</a>). The gradient is taken with respect to the model's <em>predictions</em>, and gives each tree its targets.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Loss functions.</b> Any differentiable loss gives pseudo-residuals. Which losses are there, what does each one tell the next tree, and which one turns this into classification?</div>

  <h2 id="gbm-loss"><span class="num">04</span>Loss Functions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Any loss with a derivative now works. Which losses are worth knowing, what does each one tell the next tree, and how does the recipe handle yes/no targets like Play?</p>
  </div>
  <table class="tbl">
    <tr><th>Loss</th><th>L(y, F)</th><th>pseudo-residual −∂L/∂F</th><th>F₀ (best constant)</th><th>leaf value</th><th>use for</th></tr>
    <tr><td>Squared</td><td>½(y − F)²</td><td>y − F</td><td>mean</td><td>mean of residuals in the leaf</td><td>regression (default)</td></tr>
    <tr><td>Absolute</td><td>|y − F|</td><td>sign(y − F)</td><td>median</td><td>median of residuals in the leaf</td><td>regression with outliers</td></tr>
    <tr><td>Huber (δ)</td><td>½r² if |r| ≤ δ, else δ(|r| − ½δ)</td><td>r if |r| ≤ δ, else δ·sign(r)</td><td>median</td><td>line search (sklearn: median + mean of clipped residuals)</td><td>regression, mostly clean with some outliers</td></tr>
    <tr><td>Quantile (α)</td><td>α·r if r ≥ 0, else (α−1)·r</td><td>α if r &gt; 0, else α − 1</td><td>α-quantile</td><td>α-quantile of residuals</td><td>prediction intervals, asymmetric costs</td></tr>
    <tr><td>Log-loss (binary)</td><td>−[y ln p + (1−y) ln(1−p)], p = σ(F)</td><td>y − p</td><td>log-odds ln(ȳ/(1−ȳ))</td><td>Σ(y−p) / Σp(1−p) (Newton)</td><td>classification (default)</td></tr>
    <tr><td>Exponential</td><td>e^{−ỹF}, ỹ ∈ {−1, +1}</td><td>ỹ·e^{−ỹF}</td><td>½ log-odds</td><td>Newton step</td><td>gives AdaBoost; rarely better</td></tr>
  </table>
  <p>(r = y − F above.) HistGradientBoostingRegressor also offers Poisson and gamma losses for counts and positive amounts.</p>
  <figure class="viz"><svg viewBox="0 0 560 270" width="560"><line x1="50" y1="120.0" x2="530" y2="120.0" stroke="currentColor" stroke-opacity="0.5"/><line x1="290.0" y1="20" x2="290.0" y2="220" stroke="currentColor" stroke-opacity="0.5"/><text x="50.0" y="234" text-anchor="middle" class="tm" font-size="10.5">-6</text><text x="284.0" y="224.0" text-anchor="end" class="tm" font-size="10.5">-6</text><text x="170.0" y="234" text-anchor="middle" class="tm" font-size="10.5">-3</text><text x="284.0" y="174.0" text-anchor="end" class="tm" font-size="10.5">-3</text><text x="410.0" y="234" text-anchor="middle" class="tm" font-size="10.5">3</text><text x="284.0" y="74.0" text-anchor="end" class="tm" font-size="10.5">3</text><text x="530.0" y="234" text-anchor="middle" class="tm" font-size="10.5">6</text><text x="284.0" y="24.0" text-anchor="end" class="tm" font-size="10.5">6</text><polyline points="50.0,220.0 52.0,219.2 54.0,218.3 56.0,217.5 58.0,216.7 60.0,215.8 62.0,215.0 64.0,214.2 66.0,213.3 68.0,212.5 70.0,211.7 72.0,210.8 74.0,210.0 76.0,209.2 78.0,208.3 80.0,207.5 82.0,206.7 84.0,205.8 86.0,205.0 88.0,204.2 90.0,203.3 92.0,202.5 94.0,201.7 96.0,200.8 98.0,200.0 100.0,199.2 102.0,198.3 104.0,197.5 106.0,196.7 108.0,195.8 110.0,195.0 112.0,194.2 114.0,193.3 116.0,192.5 118.0,191.7 120.0,190.8 122.0,190.0 124.0,189.2 126.0,188.3 128.0,187.5 130.0,186.7 132.0,185.8 134.0,185.0 136.0,184.2 138.0,183.3 140.0,182.5 142.0,181.7 144.0,180.8 146.0,180.0 148.0,179.2 150.0,178.3 152.0,177.5 154.0,176.7 156.0,175.8 158.0,175.0 160.0,174.2 162.0,173.3 164.0,172.5 166.0,171.7 168.0,170.8 170.0,170.0 172.0,169.2 174.0,168.3 176.0,167.5 178.0,166.7 180.0,165.8 182.0,165.0 184.0,164.2 186.0,163.3 188.0,162.5 190.0,161.7 192.0,160.8 194.0,160.0 196.0,159.2 198.0,158.3 200.0,157.5 202.0,156.7 204.0,155.8 206.0,155.0 208.0,154.2 210.0,153.3 212.0,152.5 214.0,151.7 216.0,150.8 218.0,150.0 220.0,149.2 222.0,148.3 224.0,147.5 226.0,146.7 228.0,145.8 230.0,145.0 232.0,144.2 234.0,143.3 236.0,142.5 238.0,141.7 240.0,140.8 242.0,140.0 244.0,139.2 246.0,138.3 248.0,137.5 250.0,136.7 252.0,135.8 254.0,135.0 256.0,134.2 258.0,133.3 260.0,132.5 262.0,131.7 264.0,130.8 266.0,130.0 268.0,129.2 270.0,128.3 272.0,127.5 274.0,126.7 276.0,125.8 278.0,125.0 280.0,124.2 282.0,123.3 284.0,122.5 286.0,121.7 288.0,120.8 290.0,120.0 292.0,119.2 294.0,118.3 296.0,117.5 298.0,116.7 300.0,115.8 302.0,115.0 304.0,114.2 306.0,113.3 308.0,112.5 310.0,111.7 312.0,110.8 314.0,110.0 316.0,109.2 318.0,108.3 320.0,107.5 322.0,106.7 324.0,105.8 326.0,105.0 328.0,104.2 330.0,103.3 332.0,102.5 334.0,101.7 336.0,100.8 338.0,100.0 340.0,99.2 342.0,98.3 344.0,97.5 346.0,96.7 348.0,95.8 350.0,95.0 352.0,94.2 354.0,93.3 356.0,92.5 358.0,91.7 360.0,90.8 362.0,90.0 364.0,89.2 366.0,88.3 368.0,87.5 370.0,86.7 372.0,85.8 374.0,85.0 376.0,84.2 378.0,83.3 380.0,82.5 382.0,81.7 384.0,80.8 386.0,80.0 388.0,79.2 390.0,78.3 392.0,77.5 394.0,76.7 396.0,75.8 398.0,75.0 400.0,74.2 402.0,73.3 404.0,72.5 406.0,71.7 408.0,70.8 410.0,70.0 412.0,69.2 414.0,68.3 416.0,67.5 418.0,66.7 420.0,65.8 422.0,65.0 424.0,64.2 426.0,63.3 428.0,62.5 430.0,61.7 432.0,60.8 434.0,60.0 436.0,59.2 438.0,58.3 440.0,57.5 442.0,56.7 444.0,55.8 446.0,55.0 448.0,54.2 450.0,53.3 452.0,52.5 454.0,51.7 456.0,50.8 458.0,50.0 460.0,49.2 462.0,48.3 464.0,47.5 466.0,46.7 468.0,45.8 470.0,45.0 472.0,44.2 474.0,43.3 476.0,42.5 478.0,41.7 480.0,40.8 482.0,40.0 484.0,39.2 486.0,38.3 488.0,37.5 490.0,36.7 492.0,35.8 494.0,35.0 496.0,34.2 498.0,33.3 500.0,32.5 502.0,31.7 504.0,30.8 506.0,30.0 508.0,29.2 510.0,28.3 512.0,27.5 514.0,26.7 516.0,25.8 518.0,25.0 520.0,24.2 522.0,23.3 524.0,22.5 526.0,21.7 528.0,20.8 530.0,20.0" fill="none" class="sb" stroke-width="2.4"/><line x1="58" y1="32" x2="80" y2="32" class="sb" stroke-width="2.5"/><text x="86" y="36" font-size="11.5" text-anchor="start">squared: r</text><polyline points="50.0,170.0 52.0,170.0 54.0,170.0 56.0,170.0 58.0,170.0 60.0,170.0 62.0,170.0 64.0,170.0 66.0,170.0 68.0,170.0 70.0,170.0 72.0,170.0 74.0,170.0 76.0,170.0 78.0,170.0 80.0,170.0 82.0,170.0 84.0,170.0 86.0,170.0 88.0,170.0 90.0,170.0 92.0,170.0 94.0,170.0 96.0,170.0 98.0,170.0 100.0,170.0 102.0,170.0 104.0,170.0 106.0,170.0 108.0,170.0 110.0,170.0 112.0,170.0 114.0,170.0 116.0,170.0 118.0,170.0 120.0,170.0 122.0,170.0 124.0,170.0 126.0,170.0 128.0,170.0 130.0,170.0 132.0,170.0 134.0,170.0 136.0,170.0 138.0,170.0 140.0,170.0 142.0,170.0 144.0,170.0 146.0,170.0 148.0,170.0 150.0,170.0 152.0,170.0 154.0,170.0 156.0,170.0 158.0,170.0 160.0,170.0 162.0,170.0 164.0,170.0 166.0,170.0 168.0,170.0 170.0,170.0 172.0,169.2 174.0,168.3 176.0,167.5 178.0,166.7 180.0,165.8 182.0,165.0 184.0,164.2 186.0,163.3 188.0,162.5 190.0,161.7 192.0,160.8 194.0,160.0 196.0,159.2 198.0,158.3 200.0,157.5 202.0,156.7 204.0,155.8 206.0,155.0 208.0,154.2 210.0,153.3 212.0,152.5 214.0,151.7 216.0,150.8 218.0,150.0 220.0,149.2 222.0,148.3 224.0,147.5 226.0,146.7 228.0,145.8 230.0,145.0 232.0,144.2 234.0,143.3 236.0,142.5 238.0,141.7 240.0,140.8 242.0,140.0 244.0,139.2 246.0,138.3 248.0,137.5 250.0,136.7 252.0,135.8 254.0,135.0 256.0,134.2 258.0,133.3 260.0,132.5 262.0,131.7 264.0,130.8 266.0,130.0 268.0,129.2 270.0,128.3 272.0,127.5 274.0,126.7 276.0,125.8 278.0,125.0 280.0,124.2 282.0,123.3 284.0,122.5 286.0,121.7 288.0,120.8 290.0,120.0 292.0,119.2 294.0,118.3 296.0,117.5 298.0,116.7 300.0,115.8 302.0,115.0 304.0,114.2 306.0,113.3 308.0,112.5 310.0,111.7 312.0,110.8 314.0,110.0 316.0,109.2 318.0,108.3 320.0,107.5 322.0,106.7 324.0,105.8 326.0,105.0 328.0,104.2 330.0,103.3 332.0,102.5 334.0,101.7 336.0,100.8 338.0,100.0 340.0,99.2 342.0,98.3 344.0,97.5 346.0,96.7 348.0,95.8 350.0,95.0 352.0,94.2 354.0,93.3 356.0,92.5 358.0,91.7 360.0,90.8 362.0,90.0 364.0,89.2 366.0,88.3 368.0,87.5 370.0,86.7 372.0,85.8 374.0,85.0 376.0,84.2 378.0,83.3 380.0,82.5 382.0,81.7 384.0,80.8 386.0,80.0 388.0,79.2 390.0,78.3 392.0,77.5 394.0,76.7 396.0,75.8 398.0,75.0 400.0,74.2 402.0,73.3 404.0,72.5 406.0,71.7 408.0,70.8 410.0,70.0 412.0,70.0 414.0,70.0 416.0,70.0 418.0,70.0 420.0,70.0 422.0,70.0 424.0,70.0 426.0,70.0 428.0,70.0 430.0,70.0 432.0,70.0 434.0,70.0 436.0,70.0 438.0,70.0 440.0,70.0 442.0,70.0 444.0,70.0 446.0,70.0 448.0,70.0 450.0,70.0 452.0,70.0 454.0,70.0 456.0,70.0 458.0,70.0 460.0,70.0 462.0,70.0 464.0,70.0 466.0,70.0 468.0,70.0 470.0,70.0 472.0,70.0 474.0,70.0 476.0,70.0 478.0,70.0 480.0,70.0 482.0,70.0 484.0,70.0 486.0,70.0 488.0,70.0 490.0,70.0 492.0,70.0 494.0,70.0 496.0,70.0 498.0,70.0 500.0,70.0 502.0,70.0 504.0,70.0 506.0,70.0 508.0,70.0 510.0,70.0 512.0,70.0 514.0,70.0 516.0,70.0 518.0,70.0 520.0,70.0 522.0,70.0 524.0,70.0 526.0,70.0 528.0,70.0 530.0,70.0" fill="none" class="sg" stroke-width="2.4"/><line x1="58" y1="49" x2="80" y2="49" class="sg" stroke-width="2.5"/><text x="86" y="53" font-size="11.5" text-anchor="start">Huber δ=3: clip(r, −3, 3)</text><polyline points="50.0,136.7 52.0,136.7 54.0,136.7 56.0,136.7 58.0,136.7 60.0,136.7 62.0,136.7 64.0,136.7 66.0,136.7 68.0,136.7 70.0,136.7 72.0,136.7 74.0,136.7 76.0,136.7 78.0,136.7 80.0,136.7 82.0,136.7 84.0,136.7 86.0,136.7 88.0,136.7 90.0,136.7 92.0,136.7 94.0,136.7 96.0,136.7 98.0,136.7 100.0,136.7 102.0,136.7 104.0,136.7 106.0,136.7 108.0,136.7 110.0,136.7 112.0,136.7 114.0,136.7 116.0,136.7 118.0,136.7 120.0,136.7 122.0,136.7 124.0,136.7 126.0,136.7 128.0,136.7 130.0,136.7 132.0,136.7 134.0,136.7 136.0,136.7 138.0,136.7 140.0,136.7 142.0,136.7 144.0,136.7 146.0,136.7 148.0,136.7 150.0,136.7 152.0,136.7 154.0,136.7 156.0,136.7 158.0,136.7 160.0,136.7 162.0,136.7 164.0,136.7 166.0,136.7 168.0,136.7 170.0,136.7 172.0,136.7 174.0,136.7 176.0,136.7 178.0,136.7 180.0,136.7 182.0,136.7 184.0,136.7 186.0,136.7 188.0,136.7 190.0,136.7 192.0,136.7 194.0,136.7 196.0,136.7 198.0,136.7 200.0,136.7 202.0,136.7 204.0,136.7 206.0,136.7 208.0,136.7 210.0,136.7 212.0,136.7 214.0,136.7 216.0,136.7 218.0,136.7 220.0,136.7 222.0,136.7 224.0,136.7 226.0,136.7 228.0,136.7 230.0,136.7 232.0,136.7 234.0,136.7 236.0,136.7 238.0,136.7 240.0,136.7 242.0,136.7 244.0,136.7 246.0,136.7 248.0,136.7 250.0,136.7 252.0,136.7 254.0,136.7 256.0,136.7 258.0,136.7 260.0,136.7 262.0,136.7 264.0,136.7 266.0,136.7 268.0,136.7 270.0,136.7 272.0,136.7 274.0,136.7 276.0,136.7 278.0,136.7 280.0,136.7 282.0,136.7 284.0,136.7 286.0,136.7 288.0,136.7 290.0,120.0 292.0,103.3 294.0,103.3 296.0,103.3 298.0,103.3 300.0,103.3 302.0,103.3 304.0,103.3 306.0,103.3 308.0,103.3 310.0,103.3 312.0,103.3 314.0,103.3 316.0,103.3 318.0,103.3 320.0,103.3 322.0,103.3 324.0,103.3 326.0,103.3 328.0,103.3 330.0,103.3 332.0,103.3 334.0,103.3 336.0,103.3 338.0,103.3 340.0,103.3 342.0,103.3 344.0,103.3 346.0,103.3 348.0,103.3 350.0,103.3 352.0,103.3 354.0,103.3 356.0,103.3 358.0,103.3 360.0,103.3 362.0,103.3 364.0,103.3 366.0,103.3 368.0,103.3 370.0,103.3 372.0,103.3 374.0,103.3 376.0,103.3 378.0,103.3 380.0,103.3 382.0,103.3 384.0,103.3 386.0,103.3 388.0,103.3 390.0,103.3 392.0,103.3 394.0,103.3 396.0,103.3 398.0,103.3 400.0,103.3 402.0,103.3 404.0,103.3 406.0,103.3 408.0,103.3 410.0,103.3 412.0,103.3 414.0,103.3 416.0,103.3 418.0,103.3 420.0,103.3 422.0,103.3 424.0,103.3 426.0,103.3 428.0,103.3 430.0,103.3 432.0,103.3 434.0,103.3 436.0,103.3 438.0,103.3 440.0,103.3 442.0,103.3 444.0,103.3 446.0,103.3 448.0,103.3 450.0,103.3 452.0,103.3 454.0,103.3 456.0,103.3 458.0,103.3 460.0,103.3 462.0,103.3 464.0,103.3 466.0,103.3 468.0,103.3 470.0,103.3 472.0,103.3 474.0,103.3 476.0,103.3 478.0,103.3 480.0,103.3 482.0,103.3 484.0,103.3 486.0,103.3 488.0,103.3 490.0,103.3 492.0,103.3 494.0,103.3 496.0,103.3 498.0,103.3 500.0,103.3 502.0,103.3 504.0,103.3 506.0,103.3 508.0,103.3 510.0,103.3 512.0,103.3 514.0,103.3 516.0,103.3 518.0,103.3 520.0,103.3 522.0,103.3 524.0,103.3 526.0,103.3 528.0,103.3 530.0,103.3" fill="none" class="sr" stroke-width="2.4"/><line x1="58" y1="66" x2="80" y2="66" class="sr" stroke-width="2.5"/><text x="86" y="70" font-size="11.5" text-anchor="start">absolute: sign(r)</text><text x="290.0" y="266" text-anchor="middle" class="tm" font-size="11.5">residual y − F  →  what the next tree is asked to fit</text></svg><figcaption>What each loss tells the next tree. Squared error passes residuals through unchanged, so a residual of 6 pulls 6 times harder than a residual of 1. Absolute error only passes the direction. Huber is squared for small residuals and absolute beyond δ.</figcaption></figure>
  <h3>On the diary: one typo</h3>
  <p>Suppose the captain wrote 83 instead of 23 for D6. What does each loss tell the first tree about D6?</p>
<div class="fx" data-lang="py">import numpy as np
from play import df
y = df.Turnout.values.astype(float)
y_typo = y.copy(); y_typo[5] = 83                     # D6: 23 players written down as 83
for name, yy in [("clean", y), ("D6 typed as 83", y_typo)]:
    r_sq = yy - yy.mean()                              # squared error: F0 = mean, pseudo-residual = y - F
    r_abs = np.sign(yy - np.median(yy))                # absolute error: F0 = median, pseudo-residual = sign(y - F)
    d = np.quantile(np.abs(yy - np.median(yy)), 0.9)   # Huber: sklearn sets delta to the 90th percentile of |r|
    r_hub = np.clip(yy - np.median(yy), -d, d)
    print(f"{name:15s} mean {yy.mean():5.2f} median {np.median(yy):5.1f} | D6 pseudo-residual: "
          f"squared {r_sq[5]:+6.2f}  absolute {r_abs[5]:+.0f}  Huber (delta {d:.1f}) {r_hub[5]:+6.2f}")</div>
  <div class="fx" data-lang="text">clean           mean 34.00 median  37.0 | D6 pseudo-residual: squared -12.00  absolute -1  Huber (delta 16.4) -15.00
D6 typed as 83  mean 38.36 median  38.0 | D6 pseudo-residual: squared +44.64  absolute +1  Huber (delta 18.0) +18.00</div>
  <p>Squared error starts at the mean, which the typo drags from 34 to 38.36, and then tells the first tree that D6 is +44.64 off, three times anyone else. Absolute error starts at the median (37 → 38, barely moved) and passes only the direction, +1, like every other day. Huber passes the residual itself up to δ (sklearn: the 90th percentile of |residual|, here 18.0) and caps it there, so D6 shouts +18, not +44.64.</p>
  <h3>What the next tree is told, side by side (at scale)</h3>
  <p>The same six residual sizes, run through each loss's pseudo-residual formula, and then a test of what that means with dirty labels: 2,000 house prices where 3% of the labels were typed with an extra zero (10× too big).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
# 1. what each loss tells the next tree to fit, for residuals y - F of different sizes
res = np.array([-10.0, -2.0, -0.5, 0.5, 2.0, 10.0])
delta = 3.0
print("residual y-F :", res.tolist())
print("squared      :", res.tolist())
print("absolute     :", np.sign(res).tolist())
print("huber (d=3)  :", np.clip(res, -delta, delta).tolist())
print("quantile 0.9 :", np.where(res &gt; 0, 0.9, -0.1).tolist())
# 2. why it matters: house prices with a few typo outliers in the training labels
rng = np.random.default_rng(0)
n = 2000
X = rng.uniform(0, 10, (n, 2))
y = 50 + 10 * np.sin(X[:, 0]) + 3 * X[:, 1] + rng.normal(0, 2, n)
Xte = rng.uniform(0, 10, (1000, 2))
yte = 50 + 10 * np.sin(Xte[:, 0]) + 3 * Xte[:, 1] + rng.normal(0, 2, 1000)
bad = rng.random(n) &lt; 0.03                       # 3% of labels typed with an extra zero
y_dirty = np.where(bad, y * 10, y)
for loss in ["squared_error", "absolute_error", "huber"]:
    m = GradientBoostingRegressor(loss=loss, n_estimators=300, max_depth=3, learning_rate=0.1,
                                  random_state=0).fit(X, y_dirty)
    print(f"{loss:15s} init {m.init_.predict(X[:1])[0]:6.1f}   test MAE on clean data {mean_absolute_error(yte, m.predict(Xte)):5.2f}")
# 3. quantile loss gives prediction intervals
lo = GradientBoostingRegressor(loss="quantile", alpha=0.05, n_estimators=300, max_depth=3, random_state=0).fit(X, y)
hi = GradientBoostingRegressor(loss="quantile", alpha=0.95, n_estimators=300, max_depth=3, random_state=0).fit(X, y)
inside = np.mean((yte &gt;= lo.predict(Xte)) &amp; (yte &lt;= hi.predict(Xte)))
print(f"5%-95% quantile band covers {inside:.1%} of test points (target 90%)")</div>
  <div class="fx" data-lang="text">residual y-F : [-10.0, -2.0, -0.5, 0.5, 2.0, 10.0]
squared      : [-10.0, -2.0, -0.5, 0.5, 2.0, 10.0]
absolute     : [-1.0, -1.0, -1.0, 1.0, 1.0, 1.0]
huber (d=3)  : [-3.0, -2.0, -0.5, 0.5, 2.0, 3.0]
quantile 0.9 : [-0.1, -0.1, -0.1, 0.9, 0.9, 0.9]
squared_error   init   84.9   test MAE on clean data 19.80
absolute_error  init   67.7   test MAE on clean data  1.98
huber           init   67.7   test MAE on clean data  4.16
5%-95% quantile band covers 82.6% of test points (target 90%)</div>
  <ul>
    <li><strong>Squared error</strong> passes a residual of 10 on as 10: the outlier rows shout 10 times louder than normal rows, and trees spend their leaves chasing them. Its starting value (the mean, 84.9) is already dragged up from the clean median of about 67, and its clean-test MAE is 19.80.</li>
    <li><strong>Absolute error</strong> only passes the direction (±1), so a typo row pulls exactly as hard as any other row. Its start is the median (67.7), which outliers barely move. Test MAE 1.98, ten times better.</li>
    <li><strong>Huber</strong> sits between them: test MAE 4.16. In sklearn its δ is not fixed; each round it is set to the 90th percentile (parameter <code>alpha=0.9</code>) of the absolute residuals, so with 3% outliers some large-but-honest residuals are also clipped and some outlier pull remains.</li>
    <li><strong>Quantile</strong> loss at α = 0.05 and 0.95 gives a band that should contain 90% of new points; here it covers 82.6%. Quantile boosting bands are often too narrow, because the trees overfit the training residuals; check coverage on held-out data (or use conformal prediction) before trusting them.</li>
  </ul>
  <h3>Log-loss for classification, derived and worked by hand</h3>
  <p><strong>The model's output F is a log-odds</strong>, any real number, and the probability is p = σ(F) = 1/(1 + e^{−F}). Log-loss for one row is L = −[y ln p + (1−y) ln(1−p)] (see <a class="xref" data-note="ml_classification">Classification</a>).</p>
  <p><strong>Derivative.</strong> Use dσ/dF = σ(1−σ) = p(1−p) and the chain rule: ∂L/∂F = −[y·(1/p) − (1−y)·1/(1−p)]·p(1−p) = −[y(1−p) − (1−y)p] = p − y. So the <strong>pseudo-residual is y − p</strong>: "actual label minus predicted probability". A churner (y = 1) predicted at p = 0.3 has pseudo-residual +0.7: push F up. A stayer predicted at 0.3 has −0.3: push down a little. The second derivative, which we need in section 05, is <strong>∂²L/∂F² = p(1−p)</strong>.</p>
  <p><strong>Start value.</strong> The best constant probability is the base rate ȳ, so F₀ = ln(ȳ/(1−ȳ)), the log-odds of the base rate.</p>
  <p>Classify Play on the diary: y = 1 for the 9 played days, 0 for the 5 others.</p>
  <p>Base rate ȳ = 9/14 = 0.643, so F₀ = ln(0.643/0.357) = ln 1.8 = 0.5878, and every day starts at p = 0.643. Log-loss = −(9·ln 0.643 + 5·ln 0.357)/14 = (9·0.442 + 5·1.030)/14 = 0.6518. Pseudo-residuals y − p: the 9 played days get +0.357, the 5 others −0.643. A regression stump on those (least squares) splits on "Overcast?": the 4 overcast days are all played (+0.357 each), the other 10 average −0.143. The leaf <em>values</em> are the subject of the next section.</p>
  <div class="bridge"><b>What this still can't tell us → next: Leaf values: the line search.</b> The tree is fitted to pseudo-residuals by least squares, so each leaf holds the mean pseudo-residual. For squared error that is the right step. For log-loss it is not even in the right units: pseudo-residuals are probabilities (between −1 and 1), but F is in log-odds. We need a better leaf value.</div>

  <h2 id="gbm-leaf"><span class="num">05</span>Leaf Values: the Line Search</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A tree fitted to y − p puts the <em>mean</em> pseudo-residual in each leaf: +0.357 for the overcast days. But F is measured in log-odds, not probability. What number should a leaf really add?</p>
  </div>
  <p><strong>The idea</strong> (Friedman's "TreeBoost"). Use the tree only for its <em>structure</em>: which rows land in which leaf. Then, separately for each leaf j, choose the one number γⱼ that makes the <strong>real loss</strong> of the rows in that leaf as small as possible:</p>
  <p style="text-align:center"><strong>γⱼ = argmin_γ Σ_{xᵢ in leaf j} L(yᵢ, F_{m−1}(xᵢ) + γ)</strong></p>
  <ul>
    <li><strong>Squared error:</strong> the best γ is the mean residual in the leaf, which the tree already holds. Nothing changes.</li>
    <li><strong>Absolute error:</strong> the best γ is the <em>median</em> residual in the leaf (the median minimises a sum of absolute values). The tree's mean would be pulled by outliers, so the line search matters.</li>
    <li><strong>Log-loss:</strong> no closed form. Take one <strong>Newton step</strong> from γ = 0: γ = −(Σ first derivatives)/(Σ second derivatives) = <strong>Σ(yᵢ − pᵢ) / Σ pᵢ(1 − pᵢ)</strong>.</li>
  </ul>
  <p>Why Newton, in plain words: the first derivative says which way to go, the second says how curved the loss is. Dividing by the curvature converts "probability units" into "log-odds units". Near p = 0.5 the sigmoid is steep (p(1−p) = 0.25 is at its largest), so a small move in F changes p a lot; near p = 0.95 it is flat (p(1−p) = 0.0475), so F must move much further for the same change in p.</p>
  <h3>Worked: the diary, two rounds, ν = 0.5</h3>
  <p><strong>Round 1, overcast leaf (D3, D7, D12, D13):</strong> all four were played, Σ(y − p) = 4 · 0.357 = 1.429. Σ p(1−p) = 4 · 0.643 · 0.357 = 4 · 0.2296 = 0.918. Newton value γ = 1.429 / 0.918 = <strong>+1.556</strong>. The mean residual would have been +0.357, more than 4 times too timid.</p>
  <p><strong>Round 1, other leaf (10 days, 5 played):</strong> Σ(y − p) = 5 · 0.357 − 5 · 0.643 = −1.429, Σ p(1−p) = 10 · 0.2296 = 2.296, γ = <strong>−0.622</strong>.</p>
  <p>Update: overcast days F = 0.5878 + 0.5 · 1.556 = 1.366 → p = σ(1.366) = 0.797. Other days F = 0.5878 − 0.311 = 0.277 → p = 0.569. Log-loss falls 0.6518 → 0.5669.</p>
  <p><strong>Round 2:</strong> new pseudo-residuals: overcast days +0.203, other played days +0.431, not-played days −0.569. The stump now splits on "Humidity high?" (the High/Normal question the decision tree in <a class="xref" data-note="ml_dtree">Decision Trees</a> asks on sunny days). Normal-humidity leaf (7 days): Σ(y − p) = 1.563, Σp(1−p) = 1.550, γ = +1.008. High-humidity leaf: −1.437 / 1.550 = −0.927. Log-loss 0.4887.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingClassifier
X = pd.concat([df[["HumPct", "TempC"]], pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)], axis=1)
y = (df.Play == "Yes").astype(int).values            # 1 = played
lr = 0.5
sig = lambda F: 1 / (1 + np.exp(-F))
logloss = lambda p: -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
p0 = y.mean(); F = np.full(14, np.log(p0 / (1 - p0)))
print(f"p0 = {p0:.4f}   F0 = ln({p0:.4f}/{1 - p0:.4f}) = {F[0]:.4f}   log-loss {logloss(sig(F)):.4f}")
rs = np.random.RandomState(0)
for m in range(1, 3):
    p = sig(F); r = y - p                             # pseudo-residuals
    print(f"\\n--- round {m}: p =", " ".join(f"{v:.3f}" for v in p))
    print("  pseudo-residuals y - p =", " ".join(f"{v:+.3f}" for v in r))
    t = DecisionTreeRegressor(max_depth=1, random_state=rs).fit(X, r)
    feat, thr = X.columns[t.tree_.feature[0]], t.tree_.threshold[0]
    print(f"  tree splits at {feat} &lt;= {thr}")
    leaf = t.apply(X)
    for j in np.unique(leaf):
        s = leaf == j
        num, den = r[s].sum(), (p[s] * (1 - p[s])).sum()
        print(f"  leaf {list(df.index[s])}: mean residual {r[s].mean():+.4f}   Newton value sum(y-p)/sum(p(1-p)) = {num:+.3f}/{den:.3f} = {num / den:+.4f}")
        F[s] += lr * num / den
    print(f"  log-loss after round {m}: {logloss(sig(F)):.4f}")
sk = GradientBoostingClassifier(n_estimators=2, learning_rate=lr, max_depth=1, random_state=0).fit(X, y)
print(f"\\nsklearn: max |F_ours - decision_function| = {np.abs(sk.decision_function(X) - F).max():.2e},"
      f"  max |p_ours - predict_proba| = {np.abs(sk.predict_proba(X)[:, 1] - sig(F)).max():.2e}")</div>
  <div class="fx" data-lang="text">p0 = 0.6429   F0 = ln(0.6429/0.3571) = 0.5878   log-loss 0.6518

--- round 1: p = 0.643 0.643 0.643 0.643 0.643 0.643 0.643 0.643 0.643 0.643 0.643 0.643 0.643 0.643
  pseudo-residuals y - p = -0.643 -0.643 +0.357 +0.357 +0.357 -0.643 +0.357 -0.643 +0.357 +0.357 +0.357 +0.357 +0.357 -0.643
  tree splits at Outlook_Overcast &lt;= 0.5
  leaf ['D1', 'D2', 'D4', 'D5', 'D6', 'D8', 'D9', 'D10', 'D11', 'D14']: mean residual -0.1429   Newton value sum(y-p)/sum(p(1-p)) = -1.429/2.296 = -0.6222
  leaf ['D3', 'D7', 'D12', 'D13']: mean residual +0.3571   Newton value sum(y-p)/sum(p(1-p)) = +1.429/0.918 = +1.5556
  log-loss after round 1: 0.5669

--- round 2: p = 0.569 0.569 0.797 0.569 0.569 0.569 0.797 0.569 0.569 0.569 0.569 0.797 0.797 0.569
  pseudo-residuals y - p = -0.569 -0.569 +0.203 +0.431 +0.431 -0.569 +0.203 -0.569 +0.431 +0.431 +0.431 +0.203 +0.203 -0.569
  tree splits at Humidity_High &lt;= 0.5
  leaf ['D5', 'D6', 'D7', 'D9', 'D10', 'D11', 'D13']: mean residual +0.2233   Newton value sum(y-p)/sum(p(1-p)) = +1.563/1.550 = +1.0082
  leaf ['D1', 'D2', 'D3', 'D4', 'D8', 'D12', 'D14']: mean residual -0.2053   Newton value sum(y-p)/sum(p(1-p)) = -1.437/1.550 = -0.9269
  log-loss after round 2: 0.4887

sklearn: max |F_ours - decision_function| = 2.22e-16,  max |p_ours - predict_proba| = 1.11e-16</div>
  <p>Our hand numbers and sklearn's <code>GradientBoostingClassifier</code> agree to about 1e-16 in both the raw score F (<code>decision_function</code>) and the probability. sklearn computes exactly this Newton value in its leaf update.</p>
  <h3>The full algorithm</h3>
  <div class="callout def"><span class="label">Gradient tree boosting (Friedman 2001, Algorithm with line search)</span>
    <p><strong>1.</strong> F₀(x) = argmin_c Σᵢ L(yᵢ, c).<br>
    <strong>2.</strong> For m = 1 … M:<br>
    &nbsp;&nbsp;(a) rᵢ = −∂L(yᵢ, F)/∂F at F = F_{m−1}(xᵢ), for every row;<br>
    &nbsp;&nbsp;(b) fit a regression tree with J leaves to {(xᵢ, rᵢ)} by least squares → leaf regions R₁ … R_J;<br>
    &nbsp;&nbsp;(c) for each leaf j: γⱼ = argmin_γ Σ_{xᵢ∈Rⱼ} L(yᵢ, F_{m−1}(xᵢ) + γ);<br>
    &nbsp;&nbsp;(d) F_m(x) = F_{m−1}(x) + ν · Σⱼ γⱼ · 1[x ∈ Rⱼ].<br>
    <strong>3.</strong> Output F_M (for classification, p = σ(F_M)).</p>
  </div>
  <p>Multiclass (K classes, softmax log-loss): each round fits <strong>K trees</strong>, one per class, each on its own pseudo-residuals 1[y = k] − p_k. So 100 rounds on 10 classes is 1,000 trees.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing a log-loss booster that adds the tree's mean pseudo-residual directly (no Newton step). It still improves, but each step is far too small (+0.357 instead of +1.556 on the diary's overcast leaf), so it needs many more trees, and the learning rate no longer means what you think.</p>
  </div>
  <div class="callout intu"><span class="label">Connection</span>
    <p>Using the second derivative inside each leaf is a small Newton step. XGBoost takes this idea all the way: it uses first and second derivatives (g and h) not just for the leaf values but also to choose the splits, and adds a penalty λ: w* = −G/(H + λ). See <a class="xref" data-note="ml_xgboost">XGBoost</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Learning rate &amp; number of trees.</b> We know what each tree fits and what each leaf adds. How much of each tree should we keep, and how many trees should we add?</div>

  <h2 id="gbm-lr"><span class="num">06</span>Learning Rate &amp; Number of Trees</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each leaf now holds the best step for its rows. Should we take that whole step every round, and how many rounds should we run?</p>
  </div>
  <p><strong>The need.</strong> With ν = 1 each tree takes its full step. Each tree is fitted to noisy residuals of a finite sample, so a full step bakes that noise straight into the model. With a small ν each tree only contributes a little, and the final model is the sum of many trees whose individual quirks partly cancel. The price: you need more trees.</p>
  <p>On the diary, section 02's three half-steps took SSE from 1280 to 555; <a class="xref" data-note="ml_boosting">How Boosting Works</a> showed on the same 14 days that ν = 0.1 needs about ten times the rounds of ν = 1 to reach the same fit. Whether small steps <em>generalise</em> better can only be seen on held-out data, so the same model (depth 3) on the churn data with four learning rates, 1,000 trees each, tracking validation log-loss after every tree (<code>staged_predict_proba</code> gives the model after 1, 2, … trees without refitting):</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import log_loss
curves = {}
for lr in [1.0, 0.3, 0.1, 0.03]:
    t0 = time.time()
    gb = GradientBoostingClassifier(learning_rate=lr, n_estimators=1000, max_depth=3, random_state=0).fit(Xtr, ytr)
    va = np.array([log_loss(yva, p[:, 1]) for p in gb.staged_predict_proba(Xva)])
    tr = np.array([log_loss(ytr, p[:, 1]) for p in gb.staged_predict_proba(Xtr)])
    acc = np.array([np.mean(p == yva) for p in gb.staged_predict(Xva)])
    b = int(np.argmin(va))
    curves[lr] = (tr, va)
    print(f"lr={lr:4.2f}  val log-loss @10 {va[9]:.3f} @100 {va[99]:.3f} @300 {va[299]:.3f} @1000 {va[-1]:.3f}"
          f"   best {va[b]:.3f} at tree {b+1} (val acc there {acc[b]:.3f})   train @1000 {tr[-1]:.3f}  {time.time()-t0:.0f}s")
np.save("g4_curves.npy", np.array([np.vstack(curves[k]) for k in [1.0, 0.3, 0.1, 0.03]]))</div>
  <div class="fx" data-lang="text">lr=1.00  val log-loss @10 0.477 @100 0.437 @300 0.510 @1000 0.611   best 0.420 at tree 24 (val acc there 0.812)   train @1000 0.051  59s
lr=0.30  val log-loss @10 0.514 @100 0.388 @300 0.370 @1000 0.385   best 0.366 at tree 471 (val acc there 0.843)   train @1000 0.085  58s
lr=0.10  val log-loss @10 0.584 @100 0.456 @300 0.400 @1000 0.363   best 0.363 at tree 997 (val acc there 0.843)   train @1000 0.223  58s
lr=0.03  val log-loss @10 0.647 @100 0.521 @300 0.462 @1000 0.404   best 0.404 at tree 1000 (val acc there 0.825)   train @1000 0.351  57s</div>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640"><line x1="60" y1="250" x2="620" y2="250" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="250" stroke="currentColor"/><line x1="60.0" y1="250" x2="60.0" y2="255" stroke="currentColor"/><text x="60.0" y="268" text-anchor="middle" class="tm" font-size="11">1</text><line x1="246.7" y1="250" x2="246.7" y2="255" stroke="currentColor"/><text x="246.7" y="268" text-anchor="middle" class="tm" font-size="11">10</text><line x1="433.3" y1="250" x2="433.3" y2="255" stroke="currentColor"/><text x="433.3" y="268" text-anchor="middle" class="tm" font-size="11">100</text><line x1="620.0" y1="250" x2="620.0" y2="255" stroke="currentColor"/><text x="620.0" y="268" text-anchor="middle" class="tm" font-size="11">1000</text><line x1="55" y1="204.0" x2="620" y2="204.0" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="208.0" text-anchor="end" class="tm" font-size="11">0.3</text><line x1="55" y1="158.0" x2="620" y2="158.0" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="162.0" text-anchor="end" class="tm" font-size="11">0.4</text><line x1="55" y1="112.0" x2="620" y2="112.0" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="116.0" text-anchor="end" class="tm" font-size="11">0.5</text><line x1="55" y1="66.0" x2="620" y2="66.0" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="70.0" text-anchor="end" class="tm" font-size="11">0.6</text><line x1="55" y1="20.0" x2="620" y2="20.0" stroke="currentColor" stroke-opacity="0.12"/><text x="52" y="24.0" text-anchor="end" class="tm" font-size="11">0.7</text><text x="340.0" y="292" text-anchor="middle" class="tm" font-size="11.5">number of trees (log scale)</text><text x="14" y="135.0" text-anchor="middle" class="tm" font-size="11.5" transform="rotate(-90 14 135.0)">log-loss</text><polyline points="60.0,69.1 116.2,79.5 149.1,86.5 172.4,97.2 190.5,107.1 205.3,112.1 217.8,112.2 228.6,114.5 238.1,118.8 246.7,122.6 254.4,124.5 261.4,127.7 267.9,132.9 273.9,134.4 279.5,137.4 284.8,137.4 289.7,137.9 294.3,138.5 298.7,140.0 302.9,141.8 306.8,141.3 310.6,144.0 314.2,147.0 317.6,148.7 320.9,147.5 324.1,148.3 327.2,148.7 330.1,147.7 335.7,143.4 338.4,142.4 341.0,142.4 345.9,142.4 348.2,142.8 352.7,144.6 354.9,145.9 359.1,146.1 363.0,146.1 366.8,146.4 370.4,145.8 373.8,145.3 377.1,146.4 380.3,146.6 383.4,144.4 387.8,146.7 390.6,146.0 394.6,147.1 398.4,146.5 402.1,144.9 405.6,144.4 408.9,144.5 412.1,144.4 415.2,143.2 419.2,142.6 423.0,142.6 426.6,142.4 430.0,141.7 433.3,141.0 436.5,139.9 440.3,140.2 444.0,138.1 447.4,137.0 450.8,135.4 454.6,133.9 458.3,134.3 461.8,134.3 465.1,132.3 468.3,132.0 471.9,130.7 475.4,129.8 479.2,129.1 482.8,126.6 486.2,120.2 489.5,119.1 493.1,117.1 496.9,116.1 500.1,116.1 503.6,115.0 507.3,113.7 510.8,114.1 514.5,113.6 518.0,111.0 521.3,107.6 524.8,106.3 528.4,106.9 532.1,105.5 535.6,105.0 539.0,101.3 542.6,98.8 546.1,99.0 549.5,95.7 553.1,91.2 556.5,89.3 560.2,86.4 563.6,84.7 567.1,84.1 570.6,84.2 574.1,79.9 577.8,78.9 581.2,77.4 584.8,75.7 588.3,71.2 591.8,68.7 595.4,67.5 598.9,67.7 602.4,67.7 605.9,66.0 609.5,63.1 613.0,61.5 616.4,59.8 620.0,61.1" fill="none" class="sr" stroke-width="2"/><line x1="74" y1="170" x2="96" y2="170" class="sr" stroke-width="2.5"/><text x="102" y="174" font-size="11.5">lr 1.0 (val)</text><polyline points="60.0,45.1 116.2,60.4 149.1,70.8 172.4,78.0 190.5,82.7 205.3,89.1 217.8,95.1 228.6,98.9 238.1,102.9 246.7,105.5 254.4,107.7 261.4,110.6 267.9,113.1 273.9,114.1 279.5,115.9 284.8,117.2 289.7,118.4 294.3,118.9 298.7,119.3 302.9,120.4 306.8,122.7 310.6,123.8 314.2,124.5 317.6,125.9 320.9,126.4 324.1,128.3 327.2,129.3 330.1,129.6 335.7,129.7 338.4,130.1 341.0,130.8 345.9,134.0 348.2,134.5 352.7,136.8 354.9,136.8 359.1,138.1 363.0,138.2 366.8,138.5 370.4,140.1 373.8,142.3 377.1,144.9 380.3,144.9 383.4,146.0 387.8,147.2 390.6,147.3 394.6,147.4 398.4,149.9 402.1,151.1 405.6,151.3 408.9,151.6 412.1,151.9 415.2,152.4 419.2,154.8 423.0,156.2 426.6,158.2 430.0,159.5 433.3,163.4 436.5,163.8 440.3,163.8 444.0,163.8 447.4,165.3 450.8,165.8 454.6,164.2 458.3,165.2 461.8,165.3 465.1,164.9 468.3,165.1 471.9,165.6 475.4,165.4 479.2,166.3 482.8,167.1 486.2,168.6 489.5,169.5 493.1,170.4 496.9,170.4 500.1,171.1 503.6,171.6 507.3,171.7 510.8,171.8 514.5,171.9 518.0,172.0 521.3,171.6 524.8,172.4 528.4,171.7 532.1,171.9 535.6,172.7 539.0,173.1 542.6,172.9 546.1,172.8 549.5,172.6 553.1,173.3 556.5,173.3 560.2,173.2 563.6,172.2 567.1,171.9 570.6,171.9 574.1,171.9 577.8,171.8 581.2,171.0 584.8,170.9 588.3,170.2 591.8,169.8 595.4,168.9 598.9,168.6 602.4,168.2 605.9,167.9 609.5,167.5 613.0,166.3 616.4,165.5 620.0,164.8" fill="none" class="sg" stroke-width="2"/><line x1="74" y1="187" x2="96" y2="187" class="sg" stroke-width="2.5"/><text x="102" y="191" font-size="11.5">lr 0.3 (val)</text><polyline points="60.0,31.3 116.2,38.6 149.1,44.9 172.4,50.6 190.5,54.6 205.3,59.0 217.8,62.9 228.6,66.6 238.1,70.1 246.7,73.5 254.4,76.2 261.4,78.3 267.9,80.8 273.9,82.5 279.5,84.9 284.8,86.6 289.7,88.4 294.3,89.8 298.7,90.9 302.9,92.1 306.8,93.3 310.6,94.6 314.2,96.4 317.6,97.4 320.9,98.5 324.1,99.5 327.2,100.5 330.1,101.4 335.7,104.2 338.4,105.0 341.0,105.8 345.9,107.1 348.2,108.4 352.7,109.5 354.9,110.0 359.1,111.0 363.0,112.1 366.8,113.9 370.4,114.6 373.8,115.2 377.1,116.7 380.3,118.0 383.4,118.8 387.8,119.6 390.6,121.0 394.6,121.8 398.4,123.0 402.1,124.4 405.6,125.8 408.9,126.0 412.1,126.9 415.2,127.7 419.2,128.6 423.0,129.5 426.6,129.8 430.0,130.8 433.3,132.4 436.5,133.4 440.3,133.6 444.0,135.1 447.4,136.8 450.8,137.3 454.6,137.8 458.3,138.9 461.8,139.8 465.1,142.0 468.3,143.5 471.9,144.5 475.4,144.7 479.2,146.1 482.8,147.4 486.2,149.1 489.5,150.1 493.1,150.6 496.9,151.5 500.1,151.8 503.6,153.3 507.3,155.0 510.8,156.1 514.5,156.9 518.0,157.6 521.3,158.2 524.8,158.1 528.4,159.8 532.1,160.3 535.6,161.7 539.0,161.8 542.6,162.6 546.1,163.8 549.5,164.4 553.1,165.1 556.5,165.9 560.2,166.4 563.6,167.4 567.1,168.3 570.6,169.3 574.1,169.5 577.8,170.5 581.2,170.9 584.8,171.6 588.3,172.2 591.8,172.1 595.4,172.2 598.9,172.8 602.4,173.4 605.9,173.8 609.5,174.3 613.0,174.7 616.4,174.8 620.0,175.0" fill="none" class="sb" stroke-width="2"/><line x1="74" y1="204" x2="96" y2="204" class="sb" stroke-width="2.5"/><text x="102" y="208" font-size="11.5">lr 0.1 (val)</text><polyline points="60.0,25.7 116.2,28.1 149.1,30.4 172.4,32.7 190.5,34.8 205.3,36.9 217.8,38.8 228.6,40.8 238.1,42.6 246.7,44.4 254.4,46.1 261.4,47.6 267.9,49.2 273.9,50.6 279.5,52.0 284.8,53.4 289.7,54.8 294.3,56.1 298.7,57.2 302.9,58.4 306.8,59.6 310.6,60.8 314.2,61.8 317.6,63.1 320.9,64.0 324.1,65.1 327.2,66.1 330.1,67.1 335.7,69.1 338.4,69.9 341.0,70.8 345.9,72.6 348.2,73.5 352.7,74.9 354.9,75.6 359.1,76.7 363.0,78.3 366.8,79.5 370.4,80.7 373.8,81.8 377.1,83.0 380.3,84.1 383.4,85.3 387.8,86.7 390.6,87.8 394.6,89.4 398.4,90.5 402.1,91.7 405.6,93.0 408.9,94.1 412.1,95.0 415.2,95.9 419.2,97.2 423.0,98.6 426.6,100.0 430.0,101.1 433.3,102.1 436.5,103.2 440.3,104.4 444.0,105.4 447.4,106.5 450.8,107.7 454.6,108.6 458.3,109.9 461.8,111.1 465.1,112.1 468.3,113.0 471.9,114.3 475.4,115.3 479.2,116.5 482.8,117.7 486.2,118.6 489.5,119.3 493.1,120.2 496.9,121.8 500.1,123.1 503.6,124.1 507.3,125.6 510.8,126.5 514.5,127.7 518.0,128.8 521.3,129.4 524.8,130.5 528.4,131.6 532.1,132.8 535.6,133.5 539.0,134.4 542.6,135.2 546.1,135.9 549.5,136.6 553.1,137.2 556.5,138.2 560.2,138.9 563.6,139.2 567.1,140.6 570.6,141.4 574.1,143.0 577.8,145.2 581.2,146.0 584.8,146.6 588.3,147.0 591.8,147.6 595.4,148.8 598.9,149.6 602.4,150.3 605.9,152.2 609.5,152.6 613.0,153.7 616.4,155.2 620.0,156.0" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="2"/><line x1="74" y1="221" x2="96" y2="221" stroke="currentColor" stroke-opacity="0.5" stroke-width="2.5"/><text x="102" y="225" font-size="11.5">lr 0.03 (val)</text><polyline points="60.0,31.1 116.2,38.3 149.1,44.5 172.4,50.0 190.5,54.5 205.3,58.9 217.8,62.8 228.6,66.6 238.1,70.1 246.7,73.5 254.4,76.1 261.4,78.4 267.9,81.2 273.9,83.1 279.5,85.3 284.8,87.2 289.7,89.0 294.3,90.8 298.7,92.0 302.9,93.3 306.8,94.6 310.6,96.1 314.2,98.0 317.6,99.2 320.9,100.3 324.1,101.3 327.2,102.3 330.1,103.3 335.7,106.0 338.4,106.8 341.0,107.7 345.9,109.2 348.2,110.4 352.7,111.7 354.9,112.4 359.1,113.6 363.0,115.1 366.8,117.3 370.4,118.2 373.8,119.2 377.1,120.9 380.3,122.4 383.4,123.4 387.8,124.6 390.6,125.8 394.6,127.1 398.4,128.8 402.1,130.5 405.6,132.5 408.9,133.2 412.1,134.5 415.2,135.8 419.2,137.2 423.0,138.8 426.6,139.5 430.0,140.9 433.3,143.1 436.5,144.7 440.3,145.2 444.0,147.1 447.4,149.2 450.8,150.3 454.6,151.3 458.3,152.9 461.8,154.1 465.1,156.7 468.3,158.6 471.9,160.3 475.4,161.2 479.2,163.0 482.8,164.8 486.2,167.2 489.5,168.9 493.1,170.3 496.9,172.2 500.1,172.9 503.6,175.1 507.3,177.4 510.8,179.3 514.5,180.9 518.0,182.6 521.3,184.1 524.8,185.2 528.4,187.6 532.1,189.2 535.6,191.5 539.0,192.6 542.6,194.3 546.1,196.7 549.5,198.3 553.1,200.3 556.5,202.0 560.2,203.9 563.6,205.7 567.1,207.7 570.6,209.8 574.1,211.5 577.8,214.2 581.2,215.9 584.8,218.3 588.3,220.8 591.8,222.6 595.4,224.5 598.9,226.4 602.4,228.9 605.9,231.1 609.5,233.4 613.0,235.4 616.4,237.4 620.0,239.6" fill="none" class="st" stroke-width="2"/><line x1="74" y1="238" x2="96" y2="238" class="st" stroke-width="2.5"/><text x="102" y="242" font-size="11.5">lr 0.1 (train)</text><line x1="317.6" y1="20" x2="317.6" y2="250" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.6"/><text x="322.6" y="32" text-anchor="start" class="tm" font-size="11">lr 1.0 best: 24</text><line x1="559.0" y1="20" x2="559.0" y2="250" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.6"/><text x="554.0" y="32" text-anchor="end" class="tm" font-size="11">lr 0.3 best: 471</text></svg><figcaption>Validation log-loss (and training log-loss for lr 0.1) on the churn data, sklearn GradientBoostingClassifier, depth 3. Big steps reach their best quickly and then overfit; small steps are slower but end lower.</figcaption></figure>
  <table class="tbl">
    <tr><th>learning rate</th><th>best val log-loss</th><th>trees needed</th><th>what happens after the best point</th></tr>
    <tr><td>1.0</td><td>0.420</td><td>24</td><td>overfits fast: 0.611 by 1,000 trees</td></tr>
    <tr><td>0.3</td><td>0.366</td><td>471</td><td>slow rise: 0.385 at 1,000</td></tr>
    <tr><td>0.1</td><td>0.363</td><td>≈ 1,000 (still falling)</td><td>would keep improving a little</td></tr>
    <tr><td>0.03</td><td>0.404 at 1,000</td><td>≫ 1,000</td><td>far from done</td></tr>
  </table>
  <p>Read it as a rule: <strong>smaller ν gives a slightly better best score, but needs proportionally more trees</strong> (roughly, halving ν doubles the trees). ν = 1 is clearly worse (0.420 vs 0.363) even at its best point. Below about 0.1 the gain is small and the cost large. The practical recipe: fix ν around 0.05–0.1, set a large n_estimators, and let early stopping (section 09) choose the number of trees.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tuning n_estimators while keeping ν fixed, then changing ν later. The best number of trees depends on ν. Always tune them together, or (better) fix ν and use early stopping.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Tree depth &amp; interactions.</b> The learning rate sets how much each tree counts. But how big should each tree be: one question, or several?</div>

  <h2 id="gbm-depth"><span class="num">07</span>Tree Depth &amp; Interactions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>So far every tree was a one-question stump. Is that enough, or are there patterns a sum of one-question trees can never learn?</p>
  </div>
  <p><strong>Plain words.</strong> A path from the root to a leaf in a depth-d tree asks at most d questions, so it can involve at most d different features. Each tree can therefore model an <strong>interaction of order at most d</strong>. A sum of stumps (d = 1) is an <strong>additive model</strong>: F(x) = f₁(x₁) + f₂(x₂) + … , one curve per feature, no "this AND that".</p>
  <p>The diary already has such a pattern. Play follows the rule "overcast → play; sunny → play only if humidity is normal; rain → play only if the wind is weak" (<a class="xref" data-note="ml_dtree">Decision Trees</a>). Whether humidity matters <em>depends on</em> the outlook: an interaction. Boosting 200 trees of each depth on Play (word columns only):</p>
<div class="fx" data-lang="py">import numpy as np, pandas as pd
from play import df
from sklearn.ensemble import GradientBoostingClassifier
X = pd.get_dummies(df[["Outlook", "Humidity", "Wind"]]).astype(int)
y = (df.Play == "Yes").astype(int)
for depth in [1, 2]:
    gb = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, max_depth=depth, random_state=0).fit(X, y)
    p = gb.predict_proba(X)[:, 1]
    print(f"depth {depth}: days right {int((gb.predict(X) == y).sum())}/14   training log-loss {-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)):.3f}"
          f"   P(play) on D4 {p[3]:.2f} (played), D6 {p[5]:.2f} (not played)")</div>
  <div class="fx" data-lang="text">depth 1: days right 11/14   training log-loss 0.248   P(play) on D4 0.43 (played), D6 0.59 (not played)
depth 2: days right 14/14   training log-loss 0.000   P(play) on D4 1.00 (played), D6 0.00 (not played)</div>
  <p>Stumps stop at 11 of 14 days: they can only add up "effect of sunny" + "effect of humid" + "effect of windy", so a rainy humid calm day like D4 (played) and a rainy normal windy day like D6 (not played) get muddled (P(play) 0.43 and 0.59, both on the wrong side). Depth-2 trees can ask "rain? then windy?" and get all 14 (and, on 14 days, memorise them: log-loss 0.000). The cleanest test at scale: y = x₁ · x₂ with x₁, x₂ uniform on [−1, 1]. Its average effect of x₁ alone is zero (for every x₁, x₂ is equally likely positive or negative), and the same for x₂. Only the combination matters.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.metrics import log_loss
# 1. a pure interaction: y depends on x1 * x2 only
rng = np.random.default_rng(0)
Xi = rng.uniform(-1, 1, (3000, 2)); yi = Xi[:, 0] * Xi[:, 1] + rng.normal(0, 0.05, 3000)
Xit = rng.uniform(-1, 1, (2000, 2)); yit = Xit[:, 0] * Xit[:, 1]
for d in [1, 2, 3]:
    m = GradientBoostingRegressor(max_depth=d, n_estimators=500, learning_rate=0.1, random_state=0).fit(Xi, yi)
    print(f"y = x1*x2, depth {d}: test R^2 {m.score(Xit, yit):.3f}")
# 2. churn: depth sweep at a fixed budget of 300 trees, lr 0.1
for d in [1, 2, 3, 5, 8]:
    t0 = time.time()
    gb = GradientBoostingClassifier(max_depth=d, n_estimators=300, learning_rate=0.1, random_state=0).fit(Xtr, ytr)
    print(f"churn depth {d}: train acc {gb.score(Xtr, ytr):.3f}  val acc {gb.score(Xva, yva):.3f}  "
          f"val log-loss {log_loss(yva, gb.predict_proba(Xva)[:, 1]):.3f}  {time.time()-t0:.0f}s")</div>
  <div class="fx" data-lang="text">y = x1*x2, depth 1: test R^2 -0.034
y = x1*x2, depth 2: test R^2 0.928
y = x1*x2, depth 3: test R^2 0.990
churn depth 1: train acc 0.667  val acc 0.652  val log-loss 0.625  5s
churn depth 2: train acc 0.794  val acc 0.770  val log-loss 0.493  10s
churn depth 3: train acc 0.873  val acc 0.827  val log-loss 0.400  15s
churn depth 5: train acc 0.954  val acc 0.861  val log-loss 0.340  26s
churn depth 8: train acc 1.000  val acc 0.879  val log-loss 0.327  39s</div>
  <p>Stumps score R² = −0.03 on x₁·x₂: worse than predicting the mean, because no single-feature split helps at all. Depth 2 gets 0.928, depth 3 0.990. The churn data was generated with interacting clusters, and its validation accuracy climbs 0.652 → 0.770 → 0.827 → 0.861 → 0.879 from depth 1 to 8, while training accuracy reaches 1.000 at depth 8 and fitting time grows about eightfold (5 s → 39 s). On most real tables depth 3–8 (or 8–64 leaves) is the useful range; Friedman found 4–8 leaves (<code>max_leaf_nodes</code>) usually enough.</p>
  <table class="tbl">
    <tr><th>knob</th><th>controls</th><th>raise it to</th><th>lower it to</th></tr>
    <tr><td><code>max_depth</code></td><td>interaction order, tree size</td><td>capture combinations of features</td><td>reduce variance, speed up</td></tr>
    <tr><td><code>max_leaf_nodes</code></td><td>tree size directly (best-first growth)</td><td>more complex trees</td><td>simpler trees; overrides max_depth in sklearn GB</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>smallest leaf</td><td>smoother, fewer noisy leaves (also stabilises the Newton step: p(1−p) sums over more rows)</td><td>fit small groups (risky)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Copying random-forest habits (fully grown trees) into boosting. A forest averages deep, low-bias trees; boosting adds shallow, high-bias trees. Deep trees in boosting overfit within a handful of rounds.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Stochastic gradient boosting.</b> Depth sets what each tree can express. Can we also make the trees less alike, as bagging does, and cheaper to fit?</div>

  <h2 id="gbm-sub"><span class="num">08</span>Stochastic Gradient Boosting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Bagging made trees different by training each on a random sample. Boosting's trees all see the same rows. Would a little randomness help boosting too?</p>
  </div>
  <p><strong>The idea</strong> (Friedman, 2002): fit each tree on a random fraction of the rows, drawn <em>without</em> replacement each round (<code>subsample=0.5</code> means half the rows). It is the bagging idea inside boosting: trees see different data, so their errors are less correlated, which lowers variance; and each tree is faster to fit. The rows left out of a round act as an out-of-bag sample, so sklearn reports <code>oob_improvement_</code>: the loss improvement each tree brings on its unseen rows. <code>max_features</code> adds random-forest-style column sampling at each split. On the diary, <code>subsample=0.5</code> would fit each round's stump on 7 randomly chosen days; the other 7 are that round's out-of-bag days.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import log_loss
for sub, mf in [(1.0, None), (0.5, None), (0.5, 0.5)]:
    t0 = time.time()
    gb = GradientBoostingClassifier(n_estimators=500, learning_rate=0.1, max_depth=4, subsample=sub,
                                    max_features=mf, random_state=0).fit(Xtr, ytr)
    va = [log_loss(yva, p[:, 1]) for p in gb.staged_predict_proba(Xva)]
    print(f"subsample={sub} max_features={mf}:  val log-loss best {min(va):.3f} (tree {int(np.argmin(va))+1}), "
          f"at 500 {va[-1]:.3f}   val acc {gb.score(Xva, yva):.3f}   {time.time()-t0:.0f}s")
    if sub &lt; 1 and mf is None:
        oob = np.cumsum(gb.oob_improvement_)
        print(f"   OOB estimate says stop at tree {int(np.argmax(oob))+1}")</div>
  <div class="fx" data-lang="text">subsample=1.0 max_features=None:  val log-loss best 0.351 (tree 498), at 500 0.351   val acc 0.848   34s
subsample=0.5 max_features=None:  val log-loss best 0.348 (tree 498), at 500 0.349   val acc 0.854   18s
   OOB estimate says stop at tree 499
subsample=0.5 max_features=0.5:  val log-loss best 0.349 (tree 495), at 500 0.349   val acc 0.853   10s</div>
  <p>Same 500 depth-4 trees at learning rate 0.1. Using half the rows per tree gives a slightly <em>better</em> validation log-loss (0.348 vs 0.351) and accuracy (0.854 vs 0.848) while fitting about twice as fast (18 s vs 34 s), because each tree sees half the data and the trees are less alike. Adding column sampling (half the features per split) keeps the same quality and almost halves the time again (10 s). The out-of-bag estimate says "keep going until tree 499", agreeing with the validation curve, which is still flat-to-falling at 500. Typical values: subsample 0.5–0.8; column sampling 0.5–1.0.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The out-of-bag improvement in gradient boosting is measured on a different random set of rows each round, so it is noisy and, in sklearn's own documentation and experiments, tends to underestimate the best number of trees. Here it happened to agree with validation; do not rely on that. Treat it as a quick guide, not a replacement for a real validation set.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Overfitting &amp; early stopping.</b> Randomness lowers variance a little. But the big danger remains: every extra tree fits more of what is left, and eventually what is left is noise. When do we stop?</div>

  <h2 id="gbm-es"><span class="num">09</span>Overfitting &amp; Early Stopping</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On the diary, depth-2 boosting drove training log-loss to 0.000: it memorised 14 days. Training loss always falls with more trees. How do we know when the trees have started fitting noise, and stop there?</p>
  </div>
  <p><strong>Why boosting can overfit by adding trees.</strong> A random forest averages; another tree barely changes the average. Boosting <em>adds</em>; each new tree fits whatever is left, and after a while what is left is noise. Look at the learning-rate picture in section 06: for ν = 0.1 the training log-loss falls without stopping (0.223 at 1,000 trees and still dropping), while for ν = 1.0 the validation loss is U-shaped, lowest at 24 trees and much worse at 1,000. Training loss always goes down; only validation loss tells you when to stop.</p>
  <p><strong>Early stopping</strong> automates this: hold back a slice of the training data, evaluate after every tree, and stop when the validation loss has not improved by at least <code>tol</code> for <code>n_iter_no_change</code> trees in a row. The model keeps the trees up to the stop.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingClassifier, HistGradientBoostingClassifier
t0 = time.time()
gb = GradientBoostingClassifier(n_estimators=5000, learning_rate=0.1, max_depth=4,
                                validation_fraction=0.2, n_iter_no_change=30, tol=1e-4,
                                random_state=0).fit(Xtr, ytr)
print(f"GradientBoosting + early stopping: stopped at {gb.n_estimators_} trees   test acc {gb.score(Xte, yte):.3f}   {time.time()-t0:.0f}s")
t0 = time.time()
hgb = HistGradientBoostingClassifier(max_iter=5000, learning_rate=0.1, early_stopping=True,
                                     validation_fraction=0.2, n_iter_no_change=30,
                                     random_state=0).fit(Xtr, ytr)
print(f"HistGradientBoosting + early stopping: stopped at {hgb.n_iter_} trees   test acc {hgb.score(Xte, yte):.3f}   {time.time()-t0:.1f}s")</div>
  <div class="fx" data-lang="text">GradientBoosting + early stopping: stopped at 398 trees   test acc 0.847   43s
HistGradientBoosting + early stopping: stopped at 239 trees   test acc 0.866   1.7s</div>
  <p>The classic estimator was allowed 5,000 trees but stopped by itself at 398, when 30 trees in a row had not improved the held-out 20% by at least 0.0001; test accuracy 0.847. HistGradientBoosting stopped at 239 trees (its default trees have up to 31 leaves, so each one does more) with test accuracy 0.866, in under 2 seconds. Nobody had to guess the number of trees.</p>
  <table class="tbl">
    <tr><th></th><th>GradientBoosting*</th><th>HistGradientBoosting*</th></tr>
    <tr><td>switch</td><td><code>n_iter_no_change</code> (default None = off)</td><td><code>early_stopping</code> (default "auto" = on when n &gt; 10,000)</td></tr>
    <tr><td>validation slice</td><td><code>validation_fraction=0.1</code></td><td><code>validation_fraction=0.1</code></td></tr>
    <tr><td>patience</td><td><code>n_iter_no_change</code></td><td><code>n_iter_no_change=10</code></td></tr>
    <tr><td>trees actually used</td><td><code>n_estimators_</code></td><td><code>n_iter_</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Early stopping on the <em>test</em> set. The number of trees is then chosen to look good on test, and the test score is no longer an honest estimate. Use a validation split (or the built-in validation_fraction), and keep the test set for the very end. For tuning other parameters too, see nested CV in <a class="xref" data-note="ml_core">Core Concepts</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From scratch.</b> We have every piece: start value, pseudo-residuals, tree, Newton leaves, shrinkage, subsampling, stopping. Is that really the whole algorithm? Writing it ourselves and matching sklearn is the test.</div>

  <h2 id="gbm-scratch"><span class="num">10</span>From Scratch: Regression and Classification</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The diary rounds matched sklearn exactly. Does a complete from-scratch version, for regression and classification, also match sklearn on 20,000 rows with depth-3 trees?</p>
  </div>
  <p>Both models below use sklearn's <code>DecisionTreeRegressor</code> only to grow each tree; the boosting itself (start value, pseudo-residuals, Newton leaf values, shrinkage, summing) is ours. The churn setup used by this and every other churn block:</p>
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
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier

class MyGBRegressor:                                    # squared error
    def __init__(self, n_estimators=100, learning_rate=0.1, max_depth=3):
        self.M, self.lr, self.depth = n_estimators, learning_rate, max_depth
    def fit(self, X, y):
        self.f0 = y.mean()                              # 1. best constant = mean
        F = np.full(len(y), self.f0)
        self.trees = []
        rs = np.random.RandomState(0)                   # one shared RNG breaks ties like sklearn
        for m in range(self.M):
            r = y - F                                   # 2. negative gradient = residual
            t = DecisionTreeRegressor(max_depth=self.depth, min_samples_leaf=20, random_state=rs).fit(X, r)
            F += self.lr * t.predict(X)                 # 3. leaf = mean residual, shrink, add
            self.trees.append(t)
        return self
    def predict(self, X):
        return self.f0 + self.lr * sum(t.predict(X) for t in self.trees)

class MyGBClassifier:                                   # log-loss, labels 0/1
    def __init__(self, n_estimators=100, learning_rate=0.1, max_depth=3):
        self.M, self.lr, self.depth = n_estimators, learning_rate, max_depth
    def fit(self, X, y):
        p = y.mean()
        self.f0 = np.log(p / (1 - p))                   # 1. best constant = log-odds
        F = np.full(len(y), self.f0)
        self.trees = []
        rs = np.random.RandomState(0)                   # one shared RNG breaks ties like sklearn
        for m in range(self.M):
            p = 1 / (1 + np.exp(-F))                    # current probability
            g = y - p                                   # 2. negative gradient of log-loss
            t = DecisionTreeRegressor(max_depth=self.depth, min_samples_leaf=20, random_state=rs).fit(X, g)
            leaf = t.apply(X)                           # 3. Newton value per leaf:
            vals = t.tree_.value[:, 0, 0].copy()        #    sum(y - p) / sum(p (1 - p))
            for j in np.unique(leaf):
                idx = leaf == j
                vals[j] = g[idx].sum() / (p[idx] * (1 - p[idx])).sum()
            t.tree_.value[:, 0, 0] = vals               # overwrite the leaf values
            F += self.lr * vals[leaf]
            self.trees.append(t)
        return self
    def decision_function(self, X):
        return self.f0 + self.lr * sum(t.tree_.value[t.apply(X), 0, 0] for t in self.trees)
    def predict_proba1(self, X):
        return 1 / (1 + np.exp(-self.decision_function(X)))

# regression target: a smooth function of the churn columns (so we have numbers to predict)
Xa, Xb = Xtr.values, Xva.values
yr = 3 * np.sin(Xa[:, 0]) + Xa[:, 1] * Xa[:, 2] + rng.normal(0, 0.3, len(Xa))
t0 = time.time(); mine = MyGBRegressor(200, 0.1, 3).fit(Xa, yr); t1 = time.time()
sk = GradientBoostingRegressor(n_estimators=200, learning_rate=0.1, max_depth=3, min_samples_leaf=20, random_state=0).fit(Xa, yr); t2 = time.time()
print(f"regression : max |mine - sklearn| on val = {np.abs(mine.predict(Xb) - sk.predict(Xb)).max():.2e}"
      f"   ({t1-t0:.1f}s vs {t2-t1:.1f}s)")
t0 = time.time(); mine = MyGBClassifier(200, 0.1, 3).fit(Xa, ytr); t1 = time.time()
sk = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, max_depth=3, min_samples_leaf=20, random_state=0).fit(Xa, ytr); t2 = time.time()
pm, ps = mine.predict_proba1(Xb), sk.predict_proba(Xb)[:, 1]
print(f"classifier : max |p_mine - p_sklearn| on val = {np.abs(pm - ps).max():.2e}"
      f"   val acc {np.mean((pm &gt; 0.5) == yva):.4f} vs {sk.score(Xb, yva):.4f}   ({t1-t0:.1f}s vs {t2-t1:.1f}s)")</div>
  <div class="fx" data-lang="text">regression : max |mine - sklearn| on val = 1.15e-14   (10.1s vs 10.0s)
classifier : max |p_mine - p_sklearn| on val = 5.55e-16   val acc 0.8177 vs 0.8177   (10.5s vs 10.2s)</div>
  <p>Differences of 1e-14 and 5e-16 are floating-point rounding: the from-scratch models are the same models as sklearn's. Three details were needed to get there, and each teaches something:</p>
  <ul>
    <li><strong>Regression</strong>: start at the mean, fit the tree to y − F, add ν × the tree's prediction. The tree's leaf means are already the line-search answer for squared error.</li>
    <li><strong>Classification</strong>: start at the log-odds, fit the tree to y − p, then <em>overwrite</em> each leaf with Σ(y − p)/Σp(1−p) (the Newton step from section 05). Without that overwrite the probabilities differ noticeably.</li>
    <li><strong>Ties</strong>: in a small node, two different features can split the training rows in exactly the same way. The tree picks between them using a random feature order. sklearn passes one shared random generator to all its trees, so we do the same (<code>rs</code>), and <code>min_samples_leaf=20</code> keeps nodes from getting small enough for such ties to matter. The training predictions agree either way; only unseen rows can land differently.</li>
  </ul>
  <div class="bridge"><b>What this still can't tell us → next: GradientBoosting vs HistGradientBoosting.</b> Our version and sklearn's classic one try every cut-off of every column, which is slow on big data. sklearn has a second, faster implementation. What does it change?</div>

  <h2 id="gbm-sk"><span class="num">11</span>GradientBoosting vs HistGradientBoosting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The classic algorithm tries every distinct value of every column as a cut-off (9 cut-offs for the diary's 10 distinct HumPct values, nearly 12,000 for a churn column). Is there a faster way that gives nearly the same trees?</p>
  </div>
  <p>sklearn has two implementations. <code>GradientBoostingClassifier/Regressor</code> is the classic algorithm of this note: every tree tries every distinct value of every feature as a cut-off. <code>HistGradientBoostingClassifier/Regressor</code> (2019, modelled on LightGBM) first buckets each feature into at most 255 bins and only tries bin edges, which makes it far faster on large data and adds native missing values and categories.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import GradientBoostingClassifier, HistGradientBoostingClassifier
from sklearn.datasets import load_iris
# speed and accuracy, same settings
for name, M in [("GradientBoosting", GradientBoostingClassifier), ("HistGradientBoosting", HistGradientBoostingClassifier)]:
    kw = dict(n_estimators=300) if M is GradientBoostingClassifier else dict(max_iter=300, early_stopping=False)
    t0 = time.time()
    m = M(learning_rate=0.1, max_depth=5, random_state=0, **kw).fit(Xtr, ytr)
    print(f"{name:21s} 300 trees depth 5:  test acc {m.score(Xte, yte):.3f}   fit {time.time()-t0:5.1f}s")
# bins: how many distinct values does HGB see per column?
hgb = HistGradientBoostingClassifier(max_iter=1, early_stopping=False).fit(Xtr, ytr)
print("distinct values in f0:", Xtr["f0"].nunique(), "-&gt; bins used by HGB:", len(hgb._bin_mapper.bin_thresholds_[0]) + 1)
# missing values: HGB takes NaN as is; GradientBoosting refuses
Xmiss = Xtr.copy(); Xmiss.loc[Xmiss.sample(frac=0.2, random_state=0).index, "f0"] = np.nan
hgb = HistGradientBoostingClassifier(max_iter=300, early_stopping=False, random_state=0).fit(Xmiss, ytr)
print("HGB with 20% NaN in f0: test acc", round(hgb.score(Xte, yte), 3))
try:
    GradientBoostingClassifier(n_estimators=5).fit(Xmiss, ytr); print("GB accepted NaN")
except ValueError as e:
    print("GradientBoosting:", str(e).split("\\n")[0][:70])
# multiclass: one tree per class per round
X3, y3 = load_iris(return_X_y=True)
gb3 = GradientBoostingClassifier(n_estimators=50).fit(X3, y3)
print("iris (3 classes), 50 rounds -&gt; estimators_ shape", gb3.estimators_.shape)</div>
  <div class="fx" data-lang="text">GradientBoosting      300 trees depth 5:  test acc 0.856   fit  47.9s
HistGradientBoosting  300 trees depth 5:  test acc 0.861   fit   1.4s
distinct values in f0: 12000 -&gt; bins used by HGB: 255
HGB with 20% NaN in f0: test acc 0.87
GradientBoosting: Input X contains NaN.
iris (3 classes), 50 rounds -&gt; estimators_ shape (50, 3)</div>
  <ul>
    <li><strong>Speed</strong>: same 300 depth-5 trees, 47.9 s vs 1.4 s, and the histogram version is even slightly more accurate here (0.861 vs 0.856). Column f0 has 12,000 distinct training values; the histogram version only ever looks at 255 bins of it.</li>
    <li><strong>Missing values</strong>: with 20% of f0 set to NaN, HistGradientBoosting trains as is (test accuracy 0.870): at every split it tries sending the NaN rows left and right and keeps the better side. The classic estimator refuses with "Input X contains NaN", so you would have to impute first.</li>
    <li><strong>Multiclass</strong>: 50 rounds on 3-class iris store a (50, 3) grid of trees: one regression tree per class per round.</li>
  </ul>
  <table class="tbl">
    <tr><th></th><th>GradientBoosting*</th><th>HistGradientBoosting*</th></tr>
    <tr><td>split search</td><td>exact: every distinct value (sort-based)</td><td>histogram: ≤ 255 bins per feature</td></tr>
    <tr><td>speed on 10k+ rows</td><td>slow</td><td>much faster (multi-threaded)</td></tr>
    <tr><td>tree size knob</td><td><code>max_depth=3</code> (default)</td><td><code>max_leaf_nodes=31</code> (default), <code>max_depth=None</code></td></tr>
    <tr><td>number of trees</td><td><code>n_estimators=100</code></td><td><code>max_iter=100</code></td></tr>
    <tr><td>missing values</td><td>error</td><td>native: learns which side NaN goes</td></tr>
    <tr><td>categorical features</td><td>encode yourself</td><td><code>categorical_features=</code> (native splits)</td></tr>
    <tr><td>regularisation</td><td>subsample, max_features, min_samples_leaf, ccp_alpha</td><td><code>l2_regularization</code>, min_samples_leaf=20, max_features</td></tr>
    <tr><td>early stopping</td><td>off by default</td><td>on by default for n &gt; 10,000</td></tr>
    <tr><td>losses</td><td>squared, absolute, huber, quantile; log_loss, exponential</td><td>squared, absolute, gamma, poisson, quantile; log_loss</td></tr>
    <tr><td>extras</td><td><code>oob_improvement_</code>, <code>init</code>, <code>warm_start</code></td><td><code>monotonic_cst</code>, <code>interaction_cst</code>, <code>class_weight</code></td></tr>
    <tr><td>when to use</td><td>small data, teaching, exact splits</td><td>default choice in sklearn</td></tr>
  </table>
  <p>Key parameters of the classic estimator and their effect: <code>loss</code> (what is minimised), <code>learning_rate</code> (step size, section 06), <code>n_estimators</code> (trees), <code>max_depth</code> / <code>max_leaf_nodes</code> (interactions, section 07), <code>min_samples_leaf</code> (smoothness), <code>subsample</code> and <code>max_features</code> (randomness, section 08), <code>validation_fraction</code> + <code>n_iter_no_change</code> + <code>tol</code> (early stopping, section 09), <code>init</code> (custom F₀ model), <code>warm_start</code> (add trees to an existing fit), <code>ccp_alpha</code> (prune each tree). In sklearn 1.9 the <code>criterion</code> argument is deprecated: trees always split on squared error of the pseudo-residuals.</p>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> We know both sklearn versions. How does gradient boosting compare with AdaBoost, random forests and the big libraries built on it?</div>

  <h2 id="gbm-cmp"><span class="num">12</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gradient boosting generalises AdaBoost and underlies XGBoost, LightGBM and CatBoost. Side by side with them and with a random forest, what differs and when do you pick which?</p>
  </div>
  <table class="tbl">
    <tr><th></th><th><a class="xref" data-note="ml_adaboost">AdaBoost</a></th><th>Gradient Boosting</th><th><a class="xref" data-note="ml_rf">Random Forest</a></th><th><a class="xref" data-note="ml_xgboost">XGBoost</a> / <a class="xref" data-note="ml_lightgbm">LightGBM</a> / <a class="xref" data-note="ml_catboost">CatBoost</a></th></tr>
    <tr><td>Loss</td><td>exponential only</td><td>any differentiable</td><td>none (impurity per tree)</td><td>any twice-differentiable + regularisation</td></tr>
    <tr><td>Each tree fits</td><td>labels, on re-weighted rows</td><td>pseudo-residuals</td><td>labels, on a bootstrap sample</td><td>gradients and Hessians</td></tr>
    <tr><td>Trees</td><td>stumps / shallow</td><td>shallow (3–8)</td><td>deep</td><td>shallow; leaf-wise (LGBM), symmetric (CatBoost)</td></tr>
    <tr><td>Leaf value</td><td>class vote × α</td><td>line search (Newton for log-loss)</td><td>mean / majority</td><td>−G/(H+λ)</td></tr>
    <tr><td>Main error reduced</td><td>bias</td><td>bias</td><td>variance</td><td>bias</td></tr>
    <tr><td>More trees can hurt</td><td>yes (noise)</td><td>yes, needs early stopping</td><td>no</td><td>yes, early stopping built in</td></tr>
    <tr><td>Outliers / label noise</td><td>sensitive</td><td>choose loss (Huber, absolute)</td><td>robust</td><td>choose loss</td></tr>
    <tr><td>Missing values</td><td>no</td><td>no (Hist: yes)</td><td>sklearn ≥ 1.4: yes</td><td>yes, learned default direction</td></tr>
    <tr><td>Speed</td><td>slow</td><td>slow (Hist: fast)</td><td>fast, parallel</td><td>fastest</td></tr>
    <tr><td>Diary (training, Play)</td><td>stumps 12/14</td><td>stumps 11/14, depth 2 14/14</td><td>—</td><td>—</td></tr>
    <tr><td>Churn test accuracy</td><td>≈ 0.85 (depth 6)</td><td>≈ 0.84–0.87</td><td>≈ 0.88</td><td>≈ 0.87</td></tr>
  </table>
  <p>On this particular synthetic dataset a random forest is as good as any booster: it was generated with many clusters and 5% flipped labels, which suits averaging. On most real tabular benchmarks, tuned gradient boosting libraries come out ahead. Always try both.</p>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have met the loop, pseudo-residuals, losses, Newton leaves, learning rate, depth, subsampling and early stopping. How do they fit together?</div>

    <h2 id="gbm-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>F₀, pseudo-residuals, losses, Newton leaves, ν, depth, subsampling, early stopping: a list of tricks, or one algorithm with a few dials?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="gbm-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="8" width="180" height="44" rx="7" class="fg sg" stroke-width="2"/><text x="340" y="27" text-anchor="middle" font-size="12" font-weight="700">a loss L(y, F)</text><text x="340" y="43" text-anchor="middle" class="tm" font-size="10">squared, absolute, Huber, log-loss</text>
<line x1="280" y1="52" x2="110" y2="84" stroke="currentColor" marker-end="url(#gbm-c9)"/><line x1="340" y1="52" x2="340" y2="84" stroke="currentColor" marker-end="url(#gbm-c9)"/><line x1="400" y1="52" x2="570" y2="84" stroke="currentColor" marker-end="url(#gbm-c9)"/>
<rect x="10" y="86" width="200" height="46" rx="7" class="fb sb"/><text x="110" y="105" text-anchor="middle" font-size="11.5" font-weight="700">F₀ = argmin_c Σ L</text><text x="110" y="122" text-anchor="middle" class="tm" font-size="10">34 · log-odds 0.588</text>
<rect x="240" y="86" width="200" height="46" rx="7" class="fb sb"/><text x="340" y="105" text-anchor="middle" font-size="11.5" font-weight="700">pseudo-residual −∂L/∂F</text><text x="340" y="122" text-anchor="middle" class="tm" font-size="10">y − F · y − p · sign · clipped</text>
<rect x="470" y="86" width="200" height="46" rx="7" class="fb sb"/><text x="570" y="105" text-anchor="middle" font-size="11.5" font-weight="700">leaf = argmin of real loss</text><text x="570" y="122" text-anchor="middle" class="tm" font-size="10">Newton: +1.556 (not +0.357)</text>
<line x1="340" y1="132" x2="340" y2="164" stroke="currentColor" marker-end="url(#gbm-c9)"/><line x1="570" y1="132" x2="430" y2="180" stroke="currentColor" marker-end="url(#gbm-c9)"/>
<rect x="210" y="166" width="260" height="46" rx="7" class="ft st"/><text x="340" y="185" text-anchor="middle" font-size="11.5" font-weight="700">fit a regression tree to it</text><text x="340" y="202" text-anchor="middle" class="tm" font-size="10">HumPct ≤ 82.5 · Overcast? · Wind strong?</text>
<line x1="340" y1="212" x2="340" y2="240" stroke="currentColor" marker-end="url(#gbm-c9)"/>
<rect x="210" y="242" width="260" height="40" rx="7" class="ft st"/><text x="340" y="267" text-anchor="middle" font-size="11.5" font-weight="700">F ← F + ν·tree, repeat</text>
<path d="M470,262 Q560,262 560,190 Q560,150 470,150" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#gbm-c9)"/>
<rect x="10" y="166" width="170" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="95" y="185" text-anchor="middle" font-size="11" font-weight="700">depth = interactions</text><text x="95" y="202" text-anchor="middle" class="tm" font-size="10">stumps 11/14 · depth 2 14/14</text>
<rect x="10" y="242" width="170" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="95" y="267" text-anchor="middle" font-size="11">subsample: rows per tree</text>
<line x1="180" y1="189" x2="208" y2="189" stroke="currentColor" stroke-dasharray="3 2"/><line x1="180" y1="262" x2="208" y2="262" stroke="currentColor" stroke-dasharray="3 2"/>
<rect x="500" y="242" width="170" height="40" rx="7" class="fr sr"/><text x="585" y="260" text-anchor="middle" font-size="11" font-weight="700">early stopping</text><text x="585" y="275" text-anchor="middle" class="tm" font-size="10">validation decides M</text>
<text x="340" y="312" text-anchor="middle" class="tm" font-size="10.5">XGBoost: also uses the 2nd derivative to choose splits · LightGBM: bins + leaf-wise · CatBoost: ordered statistics</text>
</svg><figcaption>One loop, with the loss as the only input that changes: the loss fixes the start value, the pseudo-residuals the tree is fitted to, and the leaf values; ν, depth, subsampling and early stopping are the brakes around the loop.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same 14 diary days</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the diary</th><th>When to use / watch</th></tr>
    <tr><td>F₀</td><td>best constant for the loss</td><td>where do we start?</td><td>turnout mean 34; Play log-odds ln(9/5) = 0.588</td><td>mean / median / log-odds; never 0</td></tr>
    <tr><td>Residual</td><td>y − F</td><td>what is left (squared error)?</td><td>D13: +14 at F₀</td><td>regression with clean targets</td></tr>
    <tr><td>Stump on residuals</td><td>least-squares split search</td><td>which pattern explains most of what is left?</td><td>HumPct ≤ 82.5 (SSE 776), then Overcast?, then Wind strong?</td><td>fit r, never y</td></tr>
    <tr><td>Negative gradient</td><td>−∂L/∂F</td><td>what is a residual for any loss?</td><td>= residual for ½(y − F)²</td><td>the general rule</td></tr>
    <tr><td>Robust losses</td><td>capped / sign gradients</td><td>what about typos?</td><td>D6 = 83: squared +44.64, Huber +18, absolute +1</td><td>outliers: Huber / absolute</td></tr>
    <tr><td>Log-loss pseudo-residual</td><td>p − y derivative</td><td>how to boost yes/no?</td><td>+0.357 (played), −0.643 (not)</td><td>classification default</td></tr>
    <tr><td>Newton leaf</td><td>Σ(y − p)/Σp(1 − p)</td><td>what should a leaf add?</td><td>overcast leaf +1.556 (mean only +0.357)</td><td>log-loss; XGBoost generalises</td></tr>
    <tr><td>Learning rate ν</td><td>fraction of each tree</td><td>how big a step?</td><td>ν 0.5: SSE 1280 → 555 in 3 rounds</td><td>0.05–0.1 + early stopping</td></tr>
    <tr><td>Depth</td><td>questions per tree</td><td>interactions?</td><td>stumps 11/14, depth 2 14/14</td><td>3–8 in practice</td></tr>
    <tr><td>Subsample</td><td>random rows per tree</td><td>less variance, faster?</td><td>0.5 → 7 days per stump</td><td>0.5–0.8</td></tr>
    <tr><td>Early stopping</td><td>validation loss per tree</td><td>how many trees?</td><td>depth 2 memorises (log-loss 0.000) → need held-out data</td><td>always</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>gradient boosting is gradient descent on the model's predictions, where each step is a small regression tree fitted to the negative gradient of a loss you choose, with each leaf's value set to minimise that loss.</strong> Choosing the loss chooses the start, the targets and the leaf values; everything else (ν, depth, subsampling, early stopping) controls how fast and how far the descent goes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> Knowing how the parts fit, which mistakes do people actually make?</div>

<h2 id="gbm-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We understand the algorithm. Which mistakes cost people the most when they write or use gradient boosting?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fitting y instead of residuals</span>
    <p>Each tree must fit the pseudo-residuals at the current F. Fitting y every round gives the same tree again and again.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting F₀</span>
    <p>Starting from 0 instead of the mean / log-odds wastes the first many trees on learning a constant, and with shrinkage that takes a long time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: classification trees inside gradient boosting</span>
    <p>Even for classification, every tree is a <em>regression</em> tree fitted to real-valued pseudo-residuals (y − p). The output F is log-odds, not a class.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: n_estimators without early stopping</span>
    <p>Too many trees overfit (the ν = 1 curve goes from 0.420 to 0.611). Set a large number and let validation-based early stopping pick it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: squared error on data with outliers</span>
    <p>Outlier residuals dominate the pseudo-residuals. Use absolute or Huber loss, or fix the labels: on the typo data, MAE 19.80 vs 1.98.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deep trees "like a random forest"</span>
    <p>Boosting wants weak learners. Start at depth 3–6 and move up only if validation says so.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: extrapolation</span>
    <p>A sum of trees is a sum of step functions: outside the training range of a feature the prediction is flat. Gradient boosting cannot predict a sales figure bigger than anything the trees have seen a path to. Model trends separately (e.g. predict growth ratios) for time series; see <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: slow classic GB on big data</span>
    <p>sklearn's exact <code>GradientBoostingClassifier</code> is O(n·d) per split with sorting; on 100k+ rows use HistGradientBoosting, LightGBM or XGBoost.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision sheet.</b> The whole note on one page, for revising.</div>

    <h2 id="gbm-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: the captain's cricket diary, 14 days. Turnout (24, 20, 36, 32, 44, 22, 42, 26, 40, 46, 38, 38, 48, 20; mean 34) for regression; Play (9 Yes, 5 No) for classification. Features: HumPct, TempC and 0/1 word columns.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on the diary</th><th>Weakness → next</th></tr>
    <tr><td>Fit what's left</td><td>how to boost a number?</td><td>start 34, trees on residuals</td><td>details?</td></tr>
    <tr><td>Hand rounds (squared)</td><td>what does a round do?</td><td>HumPct ≤ 82.5, Overcast?, Wind strong?; SSE 1280 → 902 → 696 → 555</td><td>no residual for Play</td></tr>
    <tr><td>Negative gradient</td><td>residual in general?</td><td>−∂L/∂F; = y − F for squared</td><td>which loss?</td></tr>
    <tr><td>Losses</td><td>which loss for which job?</td><td>D6 typo: +44.64 / +18 / +1; Play: +0.357 / −0.643</td><td>leaf units wrong for log-loss</td></tr>
    <tr><td>Newton leaves</td><td>what should a leaf add?</td><td>+1.556 / −0.622; log-loss 0.652 → 0.567 → 0.489</td><td>step size?</td></tr>
    <tr><td>Learning rate</td><td>how much of each tree?</td><td>churn: ν 1 best 0.420 @24; ν 0.1 0.363 @≈1000</td><td>tree size?</td></tr>
    <tr><td>Depth</td><td>interactions?</td><td>stumps 11/14; depth 2 14/14</td><td>trees too alike</td></tr>
    <tr><td>Subsampling</td><td>randomness?</td><td>churn: 0.348 vs 0.351, 2× faster</td><td>when to stop?</td></tr>
    <tr><td>Early stopping</td><td>how many trees?</td><td>398 chosen automatically (churn)</td><td>speed on big data</td></tr>
    <tr><td>Hist version</td><td>faster splits?</td><td>255 bins: 47.9 s → 1.4 s</td><td>→ XGBoost / LightGBM</td></tr>
  </table>
  <h3>Definitions</h3>
  <ul>
    <li><strong>Gradient boosting</strong>: F_M = F₀ + ν·Σ hₘ, each hₘ a small regression tree fitted to the pseudo-residuals of the current model, with leaf values chosen to minimise the loss.</li>
    <li><strong>Pseudo-residual</strong>: rᵢ = −∂L(yᵢ, F)/∂F at F = F_{m−1}(xᵢ): the direction and rough size by which row i's prediction should move.</li>
    <li><strong>Line search / Newton leaf</strong>: re-pick each leaf's value to minimise the true loss of its rows; for log-loss one Newton step.</li>
    <li><strong>Stochastic GB</strong>: each tree fitted on a random subsample of rows (without replacement).</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th><th>Diary value</th></tr>
    <tr><td>Start</td><td>F₀ = argmin_c Σ L(yᵢ, c)</td><td>mean / median / log-odds</td><td>34; ln(9/5) = 0.588</td></tr>
    <tr><td>Pseudo-residual</td><td>rᵢ = −∂L/∂F</td><td>at F = F_{m−1}(xᵢ)</td><td>D13: +14</td></tr>
    <tr><td>Squared</td><td>L = ½(y − F)², r = y − F</td><td>leaf = mean</td><td>—</td></tr>
    <tr><td>Absolute</td><td>L = |y − F|, r = sign(y − F)</td><td>leaf = median</td><td>D6 typo: +1</td></tr>
    <tr><td>Huber</td><td>r = y − F if |y − F| ≤ δ, else δ·sign</td><td>δ = 90th pct of |r| (sklearn)</td><td>D6 typo: +18</td></tr>
    <tr><td>Log-loss</td><td>L = −[y ln p + (1−y) ln(1−p)], p = σ(F); r = y − p</td><td>∂²L/∂F² = p(1 − p)</td><td>+0.357 / −0.643</td></tr>
    <tr><td>Newton leaf</td><td>γⱼ = Σ(yᵢ − pᵢ) / Σ pᵢ(1 − pᵢ)</td><td>sums over leaf j</td><td>1.429/0.918 = 1.556</td></tr>
    <tr><td>Update</td><td>F_m = F_{m−1} + ν·Σⱼ γⱼ·1[x ∈ Rⱼ]</td><td>Rⱼ leaf regions</td><td>normal days: 34 + 0.5 × 6 = 37</td></tr>
    <tr><td>Probability</td><td>p = 1/(1 + e^{−F})</td><td>F in log-odds</td><td>F 1.366 → 0.797</td></tr>
    <tr><td>Multiclass</td><td>K trees per round on 1[y = k] − p_k</td><td>softmax</td><td>—</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use gradient boosting</b><p>Tabular data, any target with a sensible differentiable loss; you can hold out data for early stopping.</p><small>HistGradientBoosting or XGBoost / LightGBM / CatBoost</small></div>
    <div><b>Choose the loss</b><p>Squared for clean regression, Huber / absolute with outliers, quantile for intervals, log-loss for classes.</p><small>D6 typo: 44.64 vs 18 vs 1</small></div>
    <div><b>Depth</b><p>Stumps for an additive, readable model; depth 3–8 when features interact (diary: 11/14 vs 14/14).</p><small>Friedman: 4–8 leaves often enough</small></div>
    <div><b>Avoid / careful</b><p>Very noisy labels (try a forest), extrapolating trends (flat beyond the data), the classic sklearn class on 100k+ rows.</p><small>Use Hist / libraries</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Fitting y instead of residuals; starting from 0 instead of F₀; using classification trees inside; no early stopping; squared error with outliers; deep "forest-style" trees; expecting extrapolation; mean-residual leaves for log-loss (no Newton step); early stopping on the test set.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Pseudo-residual of log-loss? Of squared error?</td><td>y − p; y − F</td></tr>
    <tr><td>9 of 14 days played. F₀?</td><td>ln(9/5) = 0.588 (p = 0.643)</td></tr>
    <tr><td>Overcast leaf: Σ(y − p) = 1.429, Σp(1−p) = 0.918. Leaf value?</td><td>+1.556</td></tr>
    <tr><td>Round 1 on turnout: normal days' residuals sum to +42 over 7 days. Leaf value, and what ν = 0.5 adds?</td><td>+6; each normal day moves 34 → 37</td></tr>
    <tr><td>Why can more trees hurt boosting but not a forest?</td><td>Boosting adds fits to what is left (eventually noise); a forest averages</td></tr>
  </table>

<h2 id="gbm-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain gradient boosting in five sentences.</summary><div class="qa-body">Start with a constant prediction that minimises the loss (mean, log-odds). Each round, compute for every row the negative gradient of the loss with respect to the current prediction (the pseudo-residual). Fit a small regression tree to those values. Set each leaf to the value that best reduces the real loss for its rows (line search), shrink it by the learning rate, and add it to the model. Repeat until validation loss stops improving.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is it called "gradient" boosting? Show it for squared error.</summary><div class="qa-body">It is gradient descent where the parameters are the model's predictions F(xᵢ). For L = ½(y−F)², ∂L/∂F = −(y−F), so the negative gradient is the residual y − F. Fitting a tree to the residuals is fitting a tree to the steepest-descent direction; the tree generalises the step to new x.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the pseudo-residuals and initial value for binary log-loss?</summary><div class="qa-body">With p = σ(F), ∂L/∂F = p − y, so pseudo-residuals are y − p. The initial value is the log-odds of the base rate, F₀ = ln(ȳ/(1−ȳ)). For the diary's 9 played days in 14: F₀ = ln(0.643/0.357) = ln 1.8 = 0.588.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do leaf values need a separate line search? Give the log-loss formula.</summary><div class="qa-body">The tree is fitted to pseudo-residuals by least squares, so its leaves hold mean pseudo-residuals, which are the right step only for squared error. For other losses we re-pick each leaf value to minimise the actual loss of its rows. For log-loss there is no closed form, so one Newton step is used: γ = Σ(y−p)/Σp(1−p). For absolute loss it is the median residual.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the learning rate do, and how does it interact with the number of trees?</summary><div class="qa-body">It scales each tree's contribution. Smaller steps reduce the noise each tree bakes in and usually reach a slightly better optimum, but need proportionally more trees (halve ν ≈ double M). On churn: ν = 1.0 best log-loss 0.420 at 24 trees; ν = 0.3 0.366 at 471; ν = 0.1 0.363 at ≈ 1,000. Fix ν (0.05–0.1) and use early stopping for M.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a model of stumps learn y = x₁·x₂?</summary><div class="qa-body">A sum of stumps is additive: f₁(x₁) + f₂(x₂). For x₁·x₂ with symmetric inputs, each feature alone has zero average effect, so no single-feature split reduces error; R² stays at about 0. A depth-d tree can model interactions of up to d features, and depth 2 already reaches R² 0.93.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Random forest does not overfit with more trees. Why does gradient boosting?</summary><div class="qa-body">A forest averages independent-ish trees; adding one barely moves the average. Boosting adds trees that each fit the current remaining error; once the remaining error is mostly noise, new trees fit noise. Training loss keeps falling, validation loss turns up. Hence early stopping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is stochastic gradient boosting and why does it help?</summary><div class="qa-body">Each tree is fitted on a random subsample of rows (without replacement), e.g. 50%. Trees become less correlated (bagging-like variance reduction), each fit is faster, and out-of-bag rows give a rough estimate of improvement. Column subsampling (max_features) adds more diversity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which loss would you use for house prices with some typo outliers? For a delivery-time SLA?</summary><div class="qa-body">Prices with outliers: absolute or Huber (the outliers' pull is capped; on the typo demo MAE 1.98 vs 19.80 for squared). Delivery-time SLA ("late is costlier than early"): quantile loss at a high α, e.g. 0.9, to predict a time you will beat 90% of the time; check its coverage on held-out data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does gradient boosting handle multiclass?</summary><div class="qa-body">With softmax log-loss, each round fits K regression trees, one per class, on pseudo-residuals 1[y=k] − p_k, each with its own Newton leaf values. Predictions are softmax over the K summed scores. So M rounds produce M·K trees (sklearn's estimators_ has shape (M, K)).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>GradientBoostingClassifier or HistGradientBoostingClassifier?</summary><div class="qa-body">Hist for almost everything above a few thousand rows: binning into ≤ 255 bins makes it much faster with nearly the same accuracy, and it handles NaN and categorical features natively, with early stopping on by default for big data. The classic one is fine for small data, for exact splits, or when you need oob_improvement_ / custom init.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does AdaBoost fit into gradient boosting?</summary><div class="qa-body">AdaBoost is forward stagewise additive modelling with exponential loss. Gradient boosting with loss="exponential" uses pseudo-residuals ỹe^{−ỹF}, which are AdaBoost's row weights times the label, so it behaves like AdaBoost. Gradient boosting generalises the idea to any loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does XGBoost change in this algorithm?</summary><div class="qa-body">It uses a second-order Taylor expansion of the loss for every split, not just the leaf values: split gain and leaf weight w* = −G/(H+λ) come from sums of gradients G and Hessians H. It adds penalties (γ per leaf, λ and α on leaf weights), histogram/approximate split finding, sparsity-aware missing values, column subsampling and parallel split search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can gradient boosting extrapolate a trend?</summary><div class="qa-body">No. Each tree is piecewise constant, so the sum is too; beyond the largest training value of a feature the prediction stays flat. For trending targets, model the trend separately (differences, ratios, a linear model on top) or add features that stay inside the training range.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does gradient boosting need a separate leaf-value step, when How Boosting Works just used the tree's leaf means?</summary><div class="qa-body">For squared error the leaf mean of the residuals is already the best step (β = 1). For any other loss it is not: with log-loss the residuals y − p are probabilities while F is in log-odds, so the mean (+0.357 on the diary's overcast leaf) is far too small; the Newton step gives +1.556. Skip it and the model still improves, but slowly, and ν no longer means what you think.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip F₀ and start every prediction at 0?</summary><div class="qa-body">The first trees must learn the constant. On the diary turnout, F = 0 means every residual is about +34; with ν = 0.5 it takes several rounds just to climb to the mean, and with ν = 0.1 dozens, all spent on something a single number gives for free. For log-loss, starting at 0 means p = 0.5 instead of 0.643.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are AdaBoost's row weights, gradient boosting's pseudo-residuals and XGBoost's g and h related?</summary><div class="qa-body">All three tell the next tree what the current model gets wrong, derived from the loss. AdaBoost: exponential loss, expressed as row weights e^{−yF}. Gradient boosting: first derivative of any loss as the tree's target (plus a Newton leaf for log-loss). XGBoost: first and second derivatives g and h for every row, used for the leaf values −G/(H + λ) and for choosing the splits too.</div></details>
</main>
`
});
