// notes/ml/ml_boosting.js — How Boosting Works
Object.assign(TOPIC_CONTENT, {
  "ml_boosting": `<main>
<h1>How Boosting Works</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Boosting</span><span>How Boosting Works</span></div>
  <p class="lead">Boosting builds a team of weak models <strong>one after another</strong>, where each new member is trained to fix what the team so far still gets wrong, and the members' outputs are <strong>added up</strong>. Bagging and random forests average independent models and so cut variance; boosting attacks the other half of the error, <strong>bias</strong>. This note is the idea behind every booster: weak learners, the additive model F_m = F_{m−1} + ν·h_m, forward stagewise fitting, shrinkage, why boosting can overfit and why it hates noisy labels, how it differs from bagging, and the family of algorithms (AdaBoost → Gradient Boosting → XGBoost / LightGBM / CatBoost / HistGradientBoosting) with what each one changed.</p>

  <h2 id="bst-where" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 760 372" width="760"><defs><marker id="bst-wa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><line x1="380" y1="38" x2="380" y2="60" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><line x1="380" y1="92" x2="110" y2="120" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><text x="239" y="111" text-anchor="end" class="tm" font-size="11">parallel</text><line x1="380" y1="92" x2="400" y2="120" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><text x="396" y="111" text-anchor="start" class="tm" font-size="11">sequential</text><line x1="380" y1="92" x2="670" y2="120" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><text x="531" y="111" text-anchor="start" class="tm" font-size="11">blend</text><line x1="110" y1="152" x2="110" y2="178" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><line x1="110" y1="210" x2="110" y2="236" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><line x1="400" y1="152" x2="400" y2="178" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><line x1="400" y1="210" x2="400" y2="236" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><line x1="400" y1="268" x2="270" y2="298" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><line x1="400" y1="268" x2="400" y2="298" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><line x1="400" y1="268" x2="530" y2="298" stroke="currentColor" stroke-opacity="0.55" marker-end="url(#bst-wa)"/><rect x="305" y="8" width="150" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="380" y="27" text-anchor="middle" font-size="12.5">Decision Trees</text><rect x="300" y="62" width="160" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="380" y="81" text-anchor="middle" font-size="12.5">Ensemble Learning</text><rect x="45" y="122" width="130" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="110" y="141" text-anchor="middle" font-size="12.5">Bagging</text><rect x="315" y="122" width="170" height="30" rx="7" class="fg sg" stroke-width="2.5"/><text x="400" y="141" text-anchor="middle" font-size="12.5" font-weight="700">How Boosting Works</text><rect x="595" y="122" width="150" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="670" y="141" text-anchor="middle" font-size="12.5">Stacking &amp; Voting</text><rect x="45" y="180" width="130" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="110" y="199" text-anchor="middle" font-size="12.5">Random Forest</text><rect x="45" y="238" width="130" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="110" y="257" text-anchor="middle" font-size="12.5">Extra Trees</text><rect x="330" y="180" width="140" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="400" y="199" text-anchor="middle" font-size="12.5">AdaBoost</text><rect x="320" y="238" width="160" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="400" y="257" text-anchor="middle" font-size="12.5">Gradient Boosting</text><rect x="215" y="300" width="110" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="270" y="319" text-anchor="middle" font-size="12.5">XGBoost</text><rect x="345" y="300" width="110" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="400" y="319" text-anchor="middle" font-size="12.5">LightGBM</text><rect x="475" y="300" width="110" height="30" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.45"/><text x="530" y="319" text-anchor="middle" font-size="12.5">CatBoost</text><rect x="20" y="344" width="720" height="24" rx="6" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.5"/><text x="380" y="360" text-anchor="middle" class="tm" font-size="11.5">used by every model above: Feature Importance &amp; SHAP · Tuning &amp; Production</text></svg><figcaption>The tree-based family. "How Boosting Works" (green) is the root of the boosting branch: every booster below it is one way of carrying out this note's plan.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_ensembles">Ensemble Learning</a>, <a class="xref" data-note="ml_bagging">Bagging</a>, <a class="xref" data-note="ml_rf">Random Forest</a></b><span>Averaging many models cancels their <em>random</em> mistakes: the variance of an average of n models is ρσ² + (1−ρ)σ²/n. Bagging and random forests use this with deep, low-bias trees. But averaging cannot touch a mistake that every member makes in the same way (bias): the average of 300 stumps is still roughly a stump.</span></li>
    <li><b>This note: How Boosting Works</b><span>A different way to combine: in sequence, each new model aimed at the team's current errors, outputs added with a small step ν. That removes bias, step by step, using models too weak to do anything alone.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_adaboost">AdaBoost</a> → <a class="xref" data-note="ml_gbm">Gradient Boosting</a> → <a class="xref" data-note="ml_xgboost">XGBoost</a>, <a class="xref" data-note="ml_lightgbm">LightGBM</a>, <a class="xref" data-note="ml_catboost">CatBoost</a></b><span>This note says <em>what</em> boosting does. The next notes say <em>how</em> the next model is pointed at the errors: by re-weighting rows (AdaBoost) or by fitting the gradient of a loss (Gradient Boosting), and how the modern libraries made that fast and safe. Choosing the number of rounds in practice is in <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>.</span></li>
  </ol>
  <p>Before this note you should know: bias and variance and overfitting (<a class="xref" data-note="ml_core">Core Concepts</a>), decision and regression trees (<a class="xref" data-note="ml_dtree">Decision Trees</a>), and why ensembles help (<a class="xref" data-note="ml_ensembles">Ensemble Learning</a>).</p>

  <h2 id="bst-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">How Boosting Works</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why</div>
        <ul>
          <li><b>Bagging cuts variance</b>, not bias: average of stumps ≈ a stump</li>
          <li><b>Boosting cuts bias</b>: each model fixes the team's leftover error</li>
          <li><b>Sequential</b> — model m sees the errors of models 1…m−1</li>
          <li>💡 A run chase: each batting pair plays for the runs still needed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Weak learners</div>
        <ul>
          <li><b>Weak</b> = a bit better than chance on any weighting of the data</li>
          <li>Kearns–Valiant question (1988) → Schapire's yes (1990)</li>
          <li><b>Stumps</b> → additive model; depth d → interactions of d features</li>
          <li>Trees: fast, accept weights/any target, no scaling</li>
          <li>⚠ Boosting linear models gives a linear model</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The additive model</div>
        <ul>
          <li><b>F_M(x) = F₀ + Σ ν·hₘ(x)</b></li>
          <li><b>Forward stagewise</b>: add one term at a time, never revisit old ones</li>
          <li>Each step: (β, h) = argmin Σ L(y, F_{m−1} + β·h)</li>
          <li>Exponential loss → AdaBoost; any loss via gradients → Gradient Boosting</li>
          <li>Squared loss: fit residuals; line search gives β = 1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shrinkage &amp; rounds</div>
        <ul>
          <li><b>ν (learning rate)</b> — take only a fraction of each step</li>
          <li>Smaller ν → more rounds, usually better generalisation</li>
          <li>Halve ν ≈ double the rounds</li>
          <li><b>Too many rounds overfit</b>: train loss → 0, validation U-shaped</li>
          <li><b>Early stopping</b> picks the number of rounds</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Risks</div>
        <ul>
          <li><b>Label noise</b> — wrong labels are "hardest", boosting chases them</li>
          <li><b>Outliers</b> — big residuals dominate squared loss</li>
          <li>Fixes: robust loss (log-loss, Huber), small ν, early stopping, subsampling</li>
          <li><b>Sequential</b> — rounds can't run in parallel (splits can)</li>
          <li>Many trees → harder to explain (SHAP)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The family</div>
        <ul>
          <li><b>AdaBoost</b> 1995 — re-weight wrong rows</li>
          <li><b>Gradient Boosting</b> 2001 — any loss, fit gradients</li>
          <li><b>Stochastic GB</b> 2002 — subsample rows</li>
          <li><b>XGBoost</b> 2014 — 2nd order, regularised, sparse</li>
          <li><b>LightGBM</b> 2017 — histograms, leaf-wise, GOSS, EFB</li>
          <li><b>CatBoost</b> 2017 — ordered boosting, categories</li>
          <li><b>HistGradientBoosting</b> 2019 — sklearn's fast version</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="bst-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Error Averaging Can't Fix</span><span class="rm-sub">Bias, and a team that learns in turns</span></div></div>
      <div class="rm-item rm-done" data-target="bst-weak"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Weak Learners</span><span class="rm-sub">What "weak" means and why it is enough</span></div></div>
      <div class="rm-item rm-done" data-target="bst-seq"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Sequential Correction by Hand</span><span class="rm-sub">6 rows, 3 rounds</span></div></div>
      <div class="rm-item rm-done" data-target="bst-add"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Additive Model</span><span class="rm-sub">Forward stagewise additive modelling</span></div></div>
      <div class="rm-item rm-done" data-target="bst-shrink"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Shrinkage</span><span class="rm-sub">The learning rate ν</span></div></div>
      <div class="rm-item rm-done" data-target="bst-bv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Bias, Variance &amp; Too Many Rounds</span><span class="rm-sub">Why boosting can overfit</span></div></div>
      <div class="rm-item rm-done" data-target="bst-noise"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Noise &amp; Outliers</span><span class="rm-sub">Boosting's blind spot</span></div></div>
      <div class="rm-item rm-done" data-target="bst-vs"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Boosting vs Bagging</span><span class="rm-sub">Side by side</span></div></div>
      <div class="rm-item rm-done" data-target="bst-family"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Boosting Family</span><span class="rm-sub">What each algorithm changed</span></div></div>
      <div class="rm-item rm-done" data-target="bst-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in practice</span></div></div>
      <div class="rm-item rm-done" data-target="bst-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="bst-need"><span class="num">01</span>The Error Averaging Can't Fix</h2>
  <p><strong>Recall the two kinds of error</strong> (<a class="xref" data-note="ml_core">Core Concepts</a>). <strong>Variance</strong>: the model changes a lot when the training rows change, so its mistakes are partly random. <strong>Bias</strong>: the model is too simple for the pattern, so it makes the <em>same</em> mistake whatever rows it sees. Averaging n models leaves the expected prediction unchanged (the average of things that all lean left still leans left), so it can only shrink variance. That is the whole job of bagging and random forests, and why they use deep trees: deep trees have low bias and high variance, and averaging removes the variance.</p>
  <p>Now take models with <strong>high bias</strong>, like stumps (one-question trees). Averaging 200 of them, each trained on a bootstrap sample, gives… roughly one stump. Boosting 200 of them is a different story. A curve y = 3·sin(x) plus noise, and then the churn data (20,000 fake customers; full setup in section 06):</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingRegressor, BaggingClassifier, GradientBoostingRegressor, GradientBoostingClassifier
# 1. a curve that one question cannot draw
rng1 = np.random.default_rng(0)
x = np.sort(rng1.uniform(0, 6, 300))[:, None]
y = np.sin(x[:, 0]) * 3 + rng1.normal(0, 0.3, 300)
xt = np.linspace(0, 6, 500)[:, None]; yt = np.sin(xt[:, 0]) * 3
stump = DecisionTreeRegressor(max_depth=1)
models = {
    "1 stump": stump,
    "bagging, 200 stumps": BaggingRegressor(stump, n_estimators=200, random_state=0),
    "boosting, 200 stumps": GradientBoostingRegressor(max_depth=1, n_estimators=200, learning_rate=0.1),
    "1 deep tree": DecisionTreeRegressor(),
}
for name, m in models.items():
    m.fit(x, y)
    print(f"sine curve  {name:22s} train MSE {np.mean((m.predict(x) - y)**2):.3f}   test MSE {np.mean((m.predict(xt) - yt)**2):.3f}")
# 2. same story on the churn data
for name, m in {
    "1 stump": DecisionTreeClassifier(max_depth=1),
    "bagging, 300 stumps": BaggingClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=300, n_jobs=-1, random_state=0),
    "boosting, 300 stumps": GradientBoostingClassifier(max_depth=1, n_estimators=300, random_state=0),
    "boosting, 300 depth-3": GradientBoostingClassifier(max_depth=3, n_estimators=300, random_state=0),
}.items():
    m.fit(Xtr, ytr)
    print(f"churn       {name:22s} train acc {m.score(Xtr, ytr):.3f}   val acc {m.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">sine curve  1 stump                train MSE 0.818   test MSE 0.829
sine curve  bagging, 200 stumps    train MSE 0.713   test MSE 0.683
sine curve  boosting, 200 stumps   train MSE 0.081   test MSE 0.029
sine curve  1 deep tree            train MSE 0.000   test MSE 0.078
churn       1 stump                train acc 0.601   val acc 0.597
churn       bagging, 300 stumps    train acc 0.601   val acc 0.596
churn       boosting, 300 stumps   train acc 0.667   val acc 0.652
churn       boosting, 300 depth-3  train acc 0.873   val acc 0.827</div>
  <p>On the sine curve: one stump has test MSE 0.829; bagging 200 stumps only gets to 0.683, because every bootstrap stump splits near the same place; boosting 200 stumps gets 0.029, better even than one fully grown tree (0.078, which memorises the noise). On churn: bagging 300 stumps is exactly as good as one stump (0.596 vs 0.597), boosting 300 stumps reaches 0.652, and boosting depth-3 trees 0.827. Bagging made the weak model more stable; boosting made it <em>stronger</em>.</p>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720"><defs><marker id="bst-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><text x="170" y="20" text-anchor="middle" font-size="13" font-weight="700">Bagging: in parallel</text><rect x="120" y="34" width="100" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="170" y="54" text-anchor="middle" font-size="12">training data</text><line x1="170" y1="64" x2="50" y2="104" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="16" y="106" width="68" height="28" rx="5" class="fb sb"/><text x="50" y="124" text-anchor="middle" font-size="11">sample 1</text><line x1="50" y1="134" x2="50" y2="160" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="16" y="162" width="68" height="28" rx="5" class="fb sb"/><text x="50" y="180" text-anchor="middle" font-size="11">deep tree</text><line x1="50" y1="190" x2="170" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><line x1="170" y1="64" x2="130" y2="104" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="96" y="106" width="68" height="28" rx="5" class="fb sb"/><text x="130" y="124" text-anchor="middle" font-size="11">sample 2</text><line x1="130" y1="134" x2="130" y2="160" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="96" y="162" width="68" height="28" rx="5" class="fb sb"/><text x="130" y="180" text-anchor="middle" font-size="11">deep tree</text><line x1="130" y1="190" x2="170" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><line x1="170" y1="64" x2="210" y2="104" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="176" y="106" width="68" height="28" rx="5" class="fb sb"/><text x="210" y="124" text-anchor="middle" font-size="11">sample 3</text><line x1="210" y1="134" x2="210" y2="160" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="176" y="162" width="68" height="28" rx="5" class="fb sb"/><text x="210" y="180" text-anchor="middle" font-size="11">deep tree</text><line x1="210" y1="190" x2="170" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><line x1="170" y1="64" x2="290" y2="104" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="256" y="106" width="68" height="28" rx="5" class="fb sb"/><text x="290" y="124" text-anchor="middle" font-size="11">sample 4</text><line x1="290" y1="134" x2="290" y2="160" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="256" y="162" width="68" height="28" rx="5" class="fb sb"/><text x="290" y="180" text-anchor="middle" font-size="11">deep tree</text><line x1="290" y1="190" x2="170" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="110" y="228" width="120" height="30" rx="6" class="fg sg"/><text x="170" y="248" text-anchor="middle" font-size="12">average / vote</text><text x="170" y="284" text-anchor="middle" class="tm" font-size="11">independent trees → less variance</text><line x1="355" y1="10" x2="355" y2="290" stroke="currentColor" stroke-opacity="0.2"/><text x="540" y="20" text-anchor="middle" font-size="13" font-weight="700">Boosting: in sequence</text><rect x="370" y="106" width="60" height="28" rx="5" class="ft st"/><text x="400" y="124" text-anchor="middle" font-size="11">tree 1</text><text x="400" y="96" text-anchor="middle" class="tm" font-size="10.5">data</text><line x1="430" y1="120" x2="458" y2="120" class="sr" stroke-width="1.6" marker-end="url(#bst-ar)"/><line x1="400" y1="134" x2="535" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="460" y="106" width="60" height="28" rx="5" class="ft st"/><text x="490" y="124" text-anchor="middle" font-size="11">tree 2</text><text x="490" y="96" text-anchor="middle" class="tm" font-size="10.5">errors left</text><line x1="520" y1="120" x2="548" y2="120" class="sr" stroke-width="1.6" marker-end="url(#bst-ar)"/><line x1="490" y1="134" x2="535" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="550" y="106" width="60" height="28" rx="5" class="ft st"/><text x="580" y="124" text-anchor="middle" font-size="11">tree 3</text><text x="580" y="96" text-anchor="middle" class="tm" font-size="10.5">errors left</text><line x1="610" y1="120" x2="638" y2="120" class="sr" stroke-width="1.6" marker-end="url(#bst-ar)"/><line x1="580" y1="134" x2="535" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="640" y="106" width="60" height="28" rx="5" class="ft st"/><text x="670" y="124" text-anchor="middle" font-size="11">tree 4</text><text x="670" y="96" text-anchor="middle" class="tm" font-size="10.5">errors left</text><line x1="670" y1="134" x2="535" y2="226" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#bst-ar)"/><rect x="420" y="228" width="230" height="30" rx="6" class="fg sg"/><text x="535" y="248" text-anchor="middle" font-size="12">F₀ + ν·(tree 1 + … + tree 4)</text><text x="535" y="284" text-anchor="middle" class="tm" font-size="11">each tree fixes the rest → less bias</text><text x="535" y="60" text-anchor="middle" class="tr" font-size="11">red arrows: "here is what we still get wrong"</text></svg><figcaption>The two ways to build a team of trees. Bagging trains independent deep trees on resampled data and averages them. Boosting trains small trees one after another; each one is aimed at the errors the previous ones left, and their shrunken outputs are added.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Chasing 250 in an ODI. The openers put on 120. The next pair does not start from zero; their whole job is the 130 still needed. The pair after that plays for whatever is left after them. No single pair needs to be great; each one only has to make some progress on what remains, and all their runs add up. That is boosting: each model works on the remainder, and the outputs are summed. (Bagging would be four separate teams each chasing 250 from scratch, and then averaging their scores.)</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Boosting</strong> is a family of ensemble methods that build a strong predictor as a weighted sum of weak learners trained <strong>sequentially</strong>, where each learner is fitted to emphasise the examples (or the part of the target) that the current ensemble predicts worst. It mainly reduces bias.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> "Weak learner" carries the whole idea. How weak is allowed, and why would a pile of weak models ever become strong?</div>

  <h2 id="bst-weak"><span class="num">02</span>Weak Learners</h2>
  <p><strong>Plain words.</strong> A weak learner is a model that is only slightly better than guessing, but reliably so: whatever weighting of the rows you hand it, it can find something a bit better than a coin flip. For two classes that means weighted error below 0.5. A <strong>stump</strong> is the classic example. It is fast to train, has almost no variance, and on its own is useless for anything complicated.</p>
  <p><strong>The question that started boosting.</strong> In 1988 Kearns and Valiant asked: if you can always get slightly-better-than-chance models, can you always get a model that is as accurate as you like? In 1990 Schapire proved yes, with a construction: train learner 1; train learner 2 on a sample where half the rows are ones learner 1 got wrong; train learner 3 on rows where 1 and 2 disagree; take the majority vote. The intuition, if the three learners' mistakes were independent, is the jury arithmetic of <a class="xref" data-note="ml_ensembles">Ensemble Learning</a>: a majority of 3 is wrong only when at least 2 are wrong, probability 3e²(1−e) + e³ = 3e² − 2e³.</p>
  <table class="tbl">
    <tr><th>level</th><th>error of each voter</th><th>majority-of-3 error = 3e² − 2e³</th></tr>
    <tr><td>0 (single learner)</td><td>—</td><td>0.300</td></tr>
    <tr><td>1 (3 learners)</td><td>0.300</td><td>3·0.09 − 2·0.027 = 0.216</td></tr>
    <tr><td>2 (3 × 3 = 9 learners)</td><td>0.216</td><td>0.120</td></tr>
    <tr><td>3 (27 learners)</td><td>0.120</td><td>0.040</td></tr>
    <tr><td>4 (81 learners)</td><td>0.040</td><td>0.005</td></tr>
  </table>
  <p>Error 0.3 → 0.005 in four levels. The catch is "if their mistakes were independent": three stumps trained on the same data make the same mistakes. Schapire's filtering (and later AdaBoost's re-weighting) is a way of <em>forcing</em> each new learner to differ, by showing it the rows the others got wrong. Freund's boost-by-majority (1995) and then AdaBoost (Freund &amp; Schapire, 1995) turned this into practical algorithms.</p>
  <h3>Choosing the weak learner</h3>
  <table class="tbl">
    <tr><th>weak learner</th><th>what the sum can express</th><th>notes</th></tr>
    <tr><td>stump (depth 1)</td><td>additive model: f₁(x₁) + f₂(x₂) + …</td><td>no interactions; readable; AdaBoost's default</td></tr>
    <tr><td>depth-d tree (d = 2–8)</td><td>interactions of up to d features</td><td>the usual choice for gradient boosting (sklearn default depth 3; LightGBM 31 leaves)</td></tr>
    <tr><td>fully grown tree</td><td>—</td><td>not weak: fits the training data in round 1, nothing left to boost</td></tr>
    <tr><td>linear model</td><td>still a linear model (a sum of lines is a line)</td><td>boosting adds nothing a single linear fit could not; XGBoost's <code>gblinear</code> is mostly regularised linear regression</td></tr>
  </table>
  <p>Trees are the default because they are fast, need no feature scaling, handle mixed feature types, can be fitted to row weights or to any real-valued target (residuals, gradients), and control interactions through depth.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>weak learner</strong> is a learning algorithm that, for any distribution over the training rows, returns a hypothesis with error at most ½ − γ for some fixed γ &gt; 0 (an "edge" over random guessing). Boosting theory shows that weak learnability implies strong learnability: such learners can be combined to reach arbitrarily low training error.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Boosting needs weak learners, so the base model should be as weak as possible." Too weak is also a problem: stumps cannot model interactions at all (section 01: 0.652 vs 0.827 with depth 3 on churn). "Weak" means "simple enough not to fit everything in one go", not "one split".</p>
  </div>

  <h2 id="bst-seq"><span class="num">03</span>Sequential Correction by Hand</h2>
  <p>The simplest boosting there is: squared error, stumps, and each stump fitted to the current residuals (what the team still gets wrong). Six employees, x = years of experience, y = salary in lakh:</p>
  <table class="tbl">
    <tr><th>x</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
    <tr><th>y</th><td>3</td><td>4</td><td>6</td><td>8</td><td>12</td><td>15</td></tr>
  </table>
  <p><strong>Start</strong>: the best single guess under squared error is the mean, F₀ = 48/6 = 8. Residuals y − F₀ = −5, −4, −2, 0, +4, +7. MSE = 110/6 = 18.33.</p>
  <p><strong>Round 1</strong>: the stump that best predicts those residuals splits at x ≤ 4.5 (left mean (−5−4−2+0)/4 = −2.75, right mean (4+7)/2 = +5.5). Add it in full (ν = 1): F₁ = 5.25, 5.25, 5.25, 5.25, 13.5, 13.5. New residuals −2.25, −1.25, 0.75, 2.75, −1.5, 1.5. MSE 3.21.</p>
  <p><strong>Round 2</strong>: the next stump looks at <em>those</em> residuals, not at y. Best split x ≤ 2.5 (left mean −1.75, right mean +0.875). F₂ = 3.5, 3.5, 6.125, 6.125, 14.375, 14.375. MSE 1.68.</p>
  <p><strong>Round 3</strong>: residuals −0.5, 0.5, −0.125, 1.875, −2.375, 0.625. Best split x ≤ 4.5 again, but now with the <em>opposite sign</em> (+0.44 left, −0.88 right): round 1 overshot rows 5–6 (13.5 vs a true 12) and this round pulls them back.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([1, 2, 3, 4, 5, 6], float)          # years of experience
y = np.array([3, 4, 6, 8, 12, 15], float)        # salary (lakh)
def best_stump(r):
    best = None
    for t in [1.5, 2.5, 3.5, 4.5, 5.5]:
        L, R = r[x &lt;= t], r[x &gt; t]
        sse = ((L - L.mean())**2).sum() + ((R - R.mean())**2).sum()
        if best is None or sse &lt; best[0]:
            best = (sse, t, L.mean(), R.mean())
    _, t, a, b = best
    return t, a, b
for nu in [1.0, 0.5, 0.1]:
    F = np.full(6, y.mean())
    print(f"nu = {nu}:  start F0 = {y.mean()}  MSE {np.mean((y-F)**2):.2f}")
    for m in range(1, 31):
        t, a, b = best_stump(y - F)
        F = F + nu * np.where(x &lt;= t, a, b)
        if m &lt;= 3 or m in (10, 30):
            print(f"   round {m:2d}: stump x &lt;= {t} -&gt; ({a:+.2f}, {b:+.2f})   F = {np.round(F, 2).tolist()}   MSE {np.mean((y-F)**2):.3f}")</div>
  <div class="fx" data-lang="text">x</div>
  <p>Look at the ν = 1 block: rounds 1–3 match the hand numbers above, and by round 30 the six salaries are fitted almost exactly (MSE 0.002). Three things to see in this tiny example:</p>
  <ul>
    <li><strong>Each model works on the remainder</strong>: round 2 splits at 2.5, not at 4.5, because the 4.5-pattern has already been taken out of the residuals.</li>
    <li><strong>Full steps overshoot</strong>: with ν = 1, round 3 has to undo part of round 1. That is the motivation for shrinkage (section 05), shown in the other two blocks.</li>
    <li><strong>It will fit anything eventually</strong>: with enough rounds the training error goes to 0, including any noise in y. That is why the number of rounds must be controlled (section 06).</li>
  </ul>
  <div class="callout intu"><span class="label">Classification version</span>
    <p>For classes there is no "residual" to subtract, so the first successful booster did something else: it kept a <strong>weight</strong> on every row and raised the weights of rows the team misclassified, so the next stump had to care about them. Ten rows, three stumps, every weight by hand: <a class="xref" data-note="ml_adaboost">AdaBoost</a>. Gradient boosting later unified both views: the "residual" becomes the gradient of a loss, which works for classes too (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have a loop that works. To reason about it (which loss is it minimising? why add instead of average? what is the "right" size for each step?) we need to write the model down.</div>

  <h2 id="bst-add"><span class="num">04</span>The Additive Model &amp; Forward Stagewise Fitting</h2>
  <p>After M rounds the model is a sum:</p>
  <p style="text-align:center"><strong>F_M(x) = F₀ + ν·h₁(x) + ν·h₂(x) + … + ν·h_M(x),&nbsp;&nbsp;&nbsp; or step by step: F_m(x) = F_{m−1}(x) + ν·h_m(x)</strong></p>
  <p>F₀ is a constant start (mean, median, log-odds…), each h_m is a weak learner, and ν is the learning rate. For regression F is the prediction; for classification it is a score (log-odds), turned into a probability with the sigmoid. Compare it with linear regression: ŷ = b₀ + Σ βⱼxⱼ is a weighted sum of the <em>given</em> features; a boosted model is a weighted sum of <em>learned</em> features, each one a small tree chosen from the huge set of all possible trees. That is why it is called an <strong>additive model</strong> (or a basis expansion).</p>
  <h3>Why not fit all the trees at once?</h3>
  <p>The ideal would be to choose all M trees and their weights together to minimise the loss. That is hopeless: the number of possible trees is astronomical, and the choices interact. So boosting is <strong>greedy</strong>: it adds one term at a time, chooses it to reduce the loss as much as possible given everything already in the model, and <strong>never goes back</strong> to change earlier terms. This is called <strong>forward stagewise additive modelling</strong> (FSAM).</p>
  <div class="callout def"><span class="label">Forward stagewise additive modelling</span>
    <p><strong>1.</strong> F₀ = argmin_c Σᵢ L(yᵢ, c).<br>
    <strong>2.</strong> For m = 1 … M: (β_m, h_m) = argmin_{β, h} Σᵢ L(yᵢ, F_{m−1}(xᵢ) + β·h(xᵢ)); then F_m = F_{m−1} + ν·β_m·h_m.<br>
    "Stagewise" (old terms frozen) is different from "stepwise" (old terms re-fitted each time a new one is added). Freezing is what makes each step cheap.</p>
  </div>
  <p>Everything in the boosting family is a way of solving that one inner argmin:</p>
  <table class="tbl">
    <tr><th>loss L</th><th>the inner step becomes</th><th>algorithm</th></tr>
    <tr><td>squared error ½(y − F)²</td><td>fit h to the residuals y − F_{m−1}</td><td>least-squares boosting (section 03)</td></tr>
    <tr><td>exponential e^{−yF}</td><td>re-weight rows by e^{−yF_{m−1}}, fit a classifier, β = ½ln((1−ε)/ε)</td><td><a class="xref" data-note="ml_adaboost">AdaBoost</a></td></tr>
    <tr><td>any differentiable loss</td><td>fit h to the negative gradient −∂L/∂F, then line-search β (per leaf)</td><td><a class="xref" data-note="ml_gbm">Gradient Boosting</a></td></tr>
    <tr><td>any twice-differentiable loss + penalty</td><td>2nd-order Taylor expansion; leaf weight −G/(H+λ)</td><td><a class="xref" data-note="ml_xgboost">XGBoost</a> and later libraries</td></tr>
  </table>
  <h3>Worked: the line search for squared error gives β = 1</h3>
  <p>For squared loss, once h is fixed, the best multiplier is β = Σrᵢhᵢ / Σhᵢ² (the slope of a line through the origin fitted to residuals r against h). Round 1 of section 03: r = (−5, −4, −2, 0, 4, 7), h = (−2.75, −2.75, −2.75, −2.75, 5.5, 5.5). Σrh = (−5−4−2+0)(−2.75) + (4+7)(5.5) = 30.25 + 60.5 = 90.75. Σh² = 4·7.5625 + 2·30.25 = 30.25 + 60.5 = 90.75. So β = 1: a regression tree whose leaves are mean residuals is already the best step size. The code confirms it on random data, and shows that this hand-written FSAM is exactly sklearn's <code>GradientBoostingRegressor</code>:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingRegressor

def forward_stagewise(X, y, M=100, nu=0.1, depth=2):
    """Forward stagewise additive modelling with squared loss."""
    F = np.full(len(y), y.mean())                  # F0: best constant
    f0, terms = y.mean(), []
    for m in range(M):
        r = y - F                                  # what the team still gets wrong
        h = DecisionTreeRegressor(max_depth=depth, random_state=0).fit(X, r)
        hx = h.predict(X)
        beta = (r @ hx) / (hx @ hx)                # line search: best multiplier for h
        F = F + nu * beta * hx                     # shrink, add, never revisit old terms
        terms.append((nu * beta, h))
        if m &lt; 3:
            print(f"  round {m+1}: line-search beta = {beta:.6f}   train MSE {np.mean((y - F)**2):.4f}")
    return lambda Xn: f0 + sum(c * h.predict(Xn) for c, h in terms)

rng = np.random.default_rng(0)
X = rng.uniform(0, 10, (500, 3))
y = X[:, 0] * np.sin(X[:, 1]) + X[:, 2] + rng.normal(0, 0.5, 500)
model = forward_stagewise(X, y)
sk = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=2, random_state=0).fit(X, y)
print(f"max |ours - sklearn GradientBoostingRegressor| = {np.abs(model(X) - sk.predict(X)).max():.2e}")</div>
  <div class="fx" data-lang="text">x</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Bagging: F = (1/M)·Σ h_m with each h_m trained independently on the same target. Boosting: F = F₀ + ν·Σ h_m with each h_m trained on what the previous sum gets wrong. Same "sum of trees" shape, opposite philosophy: averaging independent guesses vs adding corrections.</p>
  </div>

  <h2 id="bst-shrink"><span class="num">05</span>Shrinkage (the Learning Rate ν)</h2>
  <p><strong>The need.</strong> Each weak learner is fitted to residuals of a finite, noisy sample, so its exact numbers are partly luck. Adding it at full strength (ν = 1) commits fully to that luck, and as section 03 showed, later rounds then spend effort undoing earlier overshoots. Friedman's fix: add only a fraction ν of each learner.</p>
  <p>Look at the three blocks in the section 03 output again:</p>
  <table class="tbl">
    <tr><th>ν</th><th>MSE after 1 round</th><th>after 3</th><th>after 10</th><th>after 30</th></tr>
    <tr><td>1.0</td><td>3.208</td><td>1.294</td><td>0.128</td><td>0.002</td></tr>
    <tr><td>0.5</td><td>6.990</td><td>1.582</td><td>0.020</td><td>0.002</td></tr>
    <tr><td>0.1</td><td>15.460</td><td>11.246</td><td>4.198</td><td>0.350</td></tr>
  </table>
  <p>Smaller ν moves slower per round. ν = 0.5 starts behind ν = 1 but is ahead by round 10, because it wastes no rounds on undoing overshoots. ν = 0.1 is still far behind after 30 rounds. On training data, small steps just look slow. The real benefit shows on <em>unseen</em> data. Churn, HistGradientBoosting, 3,000 rounds at four learning rates:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import log_loss
for lr in [1.0, 0.3, 0.1, 0.03]:
    t0 = time.time()
    m = HistGradientBoostingClassifier(learning_rate=lr, max_iter=3000, early_stopping=False,
                                       random_state=0).fit(Xtr, ytr)
    va = np.array([log_loss(yva, p[:, 1]) for p in m.staged_predict_proba(Xva)])
    tr = np.array([log_loss(ytr, p[:, 1]) for p in m.staged_predict_proba(Xtr)])
    b = int(np.argmin(va))
    print(f"lr={lr:4.2f}  best val log-loss {va[b]:.3f} at round {b+1:4d}   "
          f"at round 3000: train {tr[-1]:.3f} val {va[-1]:.3f}   {time.time()-t0:.0f}s")
    if lr == 0.1:
        for r in [1, 10, 50, 100, b + 1, 500, 1000, 3000]:
            print(f"     round {r:4d}: train log-loss {tr[r-1]:.3f}   val log-loss {va[r-1]:.3f}")
        np.save("b3_curve.npy", np.vstack([tr, va]))</div>
  <div class="fx" data-lang="text">x</div>
  <p>x</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shrinkage</strong>: F_m = F_{m−1} + ν·h_m with 0 &lt; ν ≤ 1. Empirically, smaller ν improves generalisation at the cost of more rounds; the best number of rounds grows roughly like 1/ν. With very small ν and stagewise steps, boosting traces a path similar to L1-regularised (lasso) fitting over the space of trees, which is one explanation of why it acts as a regulariser.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating ν and the number of rounds as independent knobs. Lowering ν without raising the rounds just gives an underfit model. Fix ν (0.05–0.1 is a common start) and let early stopping choose the rounds.</p>
  </div>

  <h2 id="bst-bv"><span class="num">06</span>Bias, Variance &amp; Too Many Rounds</h2>
  <p>Round by round, boosting lowers bias: the model can express more and more shapes. But every round also fits a bit of the sample's noise, so variance creeps up. Early on the bias drop wins; later the noise wins. The lr = 0.1 curve from the run above:</p>
  
  <p>This is the most important practical difference from a random forest. A forest averages: more trees can only make the average more stable, so you cannot overfit by adding trees. Boosting adds: more rounds keep fitting whatever is left, and after a point what is left is noise. <strong>Every boosted model needs a stopping rule</strong>: hold out validation data and stop when its loss has not improved for k rounds (early stopping; details in <a class="xref" data-note="ml_gbm">Gradient Boosting</a> and <a class="xref" data-note="ml_tree_tuning">Tuning &amp; Production</a>).</p>
  <table class="tbl">
    <tr><th>knob</th><th>bias</th><th>variance</th></tr>
    <tr><td>more rounds</td><td>↓</td><td>↑ (eventually)</td></tr>
    <tr><td>deeper base trees</td><td>↓ (interactions)</td><td>↑</td></tr>
    <tr><td>smaller learning rate ν</td><td>↑ per round (needs more rounds)</td><td>↓</td></tr>
    <tr><td>row / column subsampling</td><td>≈</td><td>↓</td></tr>
    <tr><td>min samples per leaf, leaf penalties</td><td>↑ slightly</td><td>↓</td></tr>
  </table>
  <div class="callout intu"><span class="label">The AdaBoost puzzle</span>
    <p>Early experiments found AdaBoost's test error kept falling even after its training error reached zero, which seemed to say "boosting does not overfit". The margin explanation (Schapire et al., 1998): extra rounds keep pushing training rows further from the decision boundary. It holds on clean data; with noisy labels AdaBoost does overfit. See <a class="xref" data-note="ml_adaboost">AdaBoost</a>.</p>
  </div>

  <h2 id="bst-noise"><span class="num">07</span>Noise &amp; Outliers: Boosting's Blind Spot</h2>
  <p><strong>Why.</strong> Boosting's strength is that it focuses on what the team gets wrong. A mislabeled row (a customer marked as churned who did not) is something the team <em>should</em> get "wrong", forever. Boosting does not know that; it sees a hard row and keeps pushing:</p>
  <ul>
    <li>In <strong>AdaBoost</strong> a misclassified row's weight is multiplied by e^{α} every round it stays wrong. With α ≈ 0.42 that is ×1.53 per round before normalising. After 10 rounds of staying wrong its weight has been multiplied by e^{4.2} ≈ 67, while a row that stayed right has been multiplied by e^{−4.2} ≈ 0.015: the wrong row now counts about 4,400 times as much.</li>
    <li>In <strong>squared-error boosting</strong> an outlier with residual 100 gets a target 100 times bigger than a normal row's residual of 1, so trees spend leaves on it.</li>
  </ul>
  <p>Experiment: flip 20% of the churn <em>training</em> labels at random (validation stays clean) and watch validation accuracy as rounds are added, next to a random forest:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import HistGradientBoostingClassifier, AdaBoostClassifier
rng2 = np.random.default_rng(3)
flip = rng2.random(len(ytr)) &lt; 0.2
yn = np.where(flip, 1 - ytr, ytr)                         # 20% of training labels made wrong
for name, yy in [("clean labels", ytr), ("20% flipped", yn)]:
    m = HistGradientBoostingClassifier(learning_rate=0.1, max_iter=1000, early_stopping=False,
                                       random_state=0).fit(Xtr, yy)
    acc = [np.mean(p == yva) for p in m.staged_predict(Xva)]
    rf = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0).fit(Xtr, yy)
    print(f"{name:13s} boosting val acc @50 {acc[49]:.3f}  @200 {acc[199]:.3f}  @1000 {acc[-1]:.3f}"
          f"  (best {max(acc):.3f} @ {int(np.argmax(acc))+1})   random forest {rf.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">x</div>
  <p>x</p>
  <p><strong>Remedies</strong>: a loss that grows slowly for big mistakes (log-loss instead of exponential for classification; Huber or absolute instead of squared for regression), a small learning rate with early stopping, row subsampling, minimum leaf sizes, and cleaning labels. When labels are very noisy, a random forest is often the safer choice.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading "boosting is the most accurate tabular model" as "always use boosting". On noisy labels or tiny datasets the extra flexibility hurts, and a forest (or a regularised linear model) can win. Compare on validation data.</p>
  </div>

  <h2 id="bst-vs"><span class="num">08</span>Boosting vs Bagging</h2>
  <table class="tbl">
    <tr><th></th><th>Bagging / Random Forest</th><th>Boosting</th></tr>
    <tr><td>How models are trained</td><td>in parallel, independently</td><td>in sequence, each depends on the previous ones</td></tr>
    <tr><td>What each model sees</td><td>a bootstrap sample (random rows)</td><td>all rows, re-weighted (AdaBoost) or re-targeted to residuals / gradients (GBM)</td></tr>
    <tr><td>Base learner</td><td>strong, deep trees (low bias, high variance)</td><td>weak, shallow trees (high bias, low variance)</td></tr>
    <tr><td>Combination</td><td>plain average / majority vote</td><td>weighted sum F₀ + ν·Σ h</td></tr>
    <tr><td>Main error reduced</td><td>variance</td><td>bias (and some variance with shrinkage)</td></tr>
    <tr><td>More models</td><td>never hurts (just slower)</td><td>eventually overfits → early stopping</td></tr>
    <tr><td>Label noise / outliers</td><td>robust</td><td>sensitive (depends on loss)</td></tr>
    <tr><td>Tuning effort</td><td>low; defaults work</td><td>higher: ν, rounds, depth, subsampling</td></tr>
    <tr><td>Parallelism</td><td>trees in parallel</td><td>rounds in sequence (split search in parallel)</td></tr>
    <tr><td>Built-in validation</td><td>out-of-bag error</td><td>early stopping on a validation slice</td></tr>
    <tr><td>Churn (this data)</td><td>RF ≈ 0.88 val accuracy</td><td>0.83–0.87 depending on settings</td></tr>
    <tr><td>Examples</td><td>BaggingClassifier, RandomForest, ExtraTrees</td><td>AdaBoost, GradientBoosting, XGBoost, LightGBM, CatBoost</td></tr>
  </table>
  <p>The two ideas also combine: stochastic gradient boosting and XGBoost/LightGBM's row and column subsampling put bagging-style randomness inside boosting; a random forest can be the first stage of a stacked model (<a class="xref" data-note="ml_stacking">Stacking &amp; Voting</a>).</p>

  <h2 id="bst-family"><span class="num">09</span>The Boosting Family: What Each One Changed</h2>
  <figure class="viz"><svg viewBox="0 0 760 326" width="760"><line x1="70" y1="24" x2="70" y2="296" stroke="currentColor" stroke-opacity="0.4" stroke-width="2"/><text x="56" y="28" text-anchor="end" class="tm" font-size="12">1990</text><circle cx="70" cy="24" r="6" class="ft st" stroke-width="2"/><text x="86" y="28" font-size="12.5" font-weight="700">Boosting is possible</text><text x="262" y="28" class="tm" font-size="11.5">Schapire: any weak learner can be boosted into a strong one (theory)</text><text x="56" y="62" text-anchor="end" class="tm" font-size="12">1995</text><circle cx="70" cy="58" r="6" class="ft st" stroke-width="2"/><text x="86" y="62" font-size="12.5" font-weight="700">AdaBoost</text><text x="262" y="62" class="tm" font-size="11.5">Freund &amp; Schapire: re-weight the wrong rows; first practical booster</text><text x="56" y="96" text-anchor="end" class="tm" font-size="12">2000</text><circle cx="70" cy="92" r="6" class="ft st" stroke-width="2"/><text x="86" y="96" font-size="12.5" font-weight="700">Statistical view</text><text x="262" y="96" class="tm" font-size="11.5">Friedman, Hastie, Tibshirani: AdaBoost = stagewise exp. loss</text><text x="56" y="130" text-anchor="end" class="tm" font-size="12">2001</text><circle cx="70" cy="126" r="6" class="ft st" stroke-width="2"/><text x="86" y="130" font-size="12.5" font-weight="700">Gradient Boosting</text><text x="262" y="130" class="tm" font-size="11.5">Friedman: any differentiable loss; trees fit the negative gradient</text><text x="56" y="164" text-anchor="end" class="tm" font-size="12">2002</text><circle cx="70" cy="160" r="6" class="ft st" stroke-width="2"/><text x="86" y="164" font-size="12.5" font-weight="700">Stochastic GB</text><text x="262" y="164" class="tm" font-size="11.5">Friedman: each tree on a random half of the rows</text><text x="56" y="198" text-anchor="end" class="tm" font-size="12">2014</text><circle cx="70" cy="194" r="6" class="ft st" stroke-width="2"/><text x="86" y="198" font-size="12.5" font-weight="700">XGBoost</text><text x="262" y="198" class="tm" font-size="11.5">Chen &amp; Guestrin: 2nd-order steps, leaf penalties, missing values, speed</text><text x="56" y="232" text-anchor="end" class="tm" font-size="12">2017</text><circle cx="70" cy="228" r="6" class="ft st" stroke-width="2"/><text x="86" y="232" font-size="12.5" font-weight="700">LightGBM</text><text x="262" y="232" class="tm" font-size="11.5">Microsoft: histogram bins, leaf-wise trees, GOSS, EFB</text><text x="56" y="266" text-anchor="end" class="tm" font-size="12">2017</text><circle cx="70" cy="262" r="6" class="ft st" stroke-width="2"/><text x="86" y="266" font-size="12.5" font-weight="700">CatBoost</text><text x="262" y="266" class="tm" font-size="11.5">Yandex: ordered boosting, leak-free categorical encoding</text><text x="56" y="300" text-anchor="end" class="tm" font-size="12">2019</text><circle cx="70" cy="296" r="6" class="ft st" stroke-width="2"/><text x="86" y="300" font-size="12.5" font-weight="700">HistGradientBoosting</text><text x="262" y="300" class="tm" font-size="11.5">sklearn: LightGBM-style boosting built in</text></svg><figcaption>Thirty years of boosting: each step kept the "add small models in sequence" plan and fixed a limit of the one before.</figcaption></figure>
  <table class="tbl">
    <tr><th>algorithm</th><th>how the next tree is aimed at the errors</th><th>main change vs the one before</th><th>its remaining weakness</th></tr>
    <tr><td><a class="xref" data-note="ml_adaboost">AdaBoost</a> (1995)</td><td>row weights ∝ e^{−yF}; classifier on weighted rows</td><td>first practical, adaptive booster</td><td>exponential loss only; noise-sensitive; classification-first</td></tr>
    <tr><td><a class="xref" data-note="ml_gbm">Gradient Boosting</a> (2001)</td><td>regression tree on −∂L/∂F, line-searched leaves</td><td>any differentiable loss; regression, classification, quantiles</td><td>exact split search is slow; no leaf penalties</td></tr>
    <tr><td>Stochastic GB (2002)</td><td>same, on a random subsample each round</td><td>lower variance, faster</td><td>same engineering limits</td></tr>
    <tr><td><a class="xref" data-note="ml_xgboost">XGBoost</a> (2014)</td><td>gradient g and Hessian h; split gain and leaf weight −G/(H+λ)</td><td>regularised objective (γ, λ, α), 2nd-order steps, sparse-aware NaN handling, parallel / histogram splits</td><td>level-wise growth and many cut-offs: slower on very large data</td></tr>
    <tr><td><a class="xref" data-note="ml_lightgbm">LightGBM</a> (2017)</td><td>same objective on histogram bins</td><td>leaf-wise growth, GOSS row sampling, EFB feature bundling, native categories: fastest</td><td>leaf-wise trees overfit small data; categories can still leak</td></tr>
    <tr><td><a class="xref" data-note="ml_catboost">CatBoost</a> (2017)</td><td>ordered boosting; symmetric (oblivious) trees</td><td>leak-free ordered target statistics for categories; strong defaults</td><td>slower per tree to train</td></tr>
    <tr><td>HistGradientBoosting (2019)</td><td>LightGBM-style histograms in sklearn</td><td>fast, NaN + categories, early stopping built into sklearn</td><td>fewer knobs than the big libraries</td></tr>
  </table>
  <p>All of them on the churn data with similar settings (500 trees, no early stopping, so the numbers compare the engines, not tuning):</p>
  <div class="fx" data-lang="py">import xgboost as xgb, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.ensemble import AdaBoostClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier
def show(name, m, t0):
    print(f"{name:28s} test acc {m.score(Xte, yte):.3f}   {time.time()-t0:5.1f}s")
t0 = time.time(); show("AdaBoost (depth 6, 300)", AdaBoostClassifier(DecisionTreeClassifier(max_depth=6), n_estimators=300, learning_rate=0.5, random_state=0).fit(Xtr, ytr), t0)
t0 = time.time(); show("GradientBoosting (500)", GradientBoostingClassifier(n_estimators=500, max_depth=5, random_state=0).fit(Xtr, ytr), t0)
t0 = time.time(); show("HistGradientBoosting (500)", HistGradientBoostingClassifier(max_iter=500, early_stopping=False, random_state=0).fit(Xtr, ytr), t0)
t0 = time.time(); show("XGBoost (500)", xgb.XGBClassifier(n_estimators=500, learning_rate=0.1, max_depth=6, n_jobs=4).fit(Xtr, ytr), t0)
t0 = time.time(); show("LightGBM (500)", lgb.LGBMClassifier(n_estimators=500, learning_rate=0.1, verbose=-1, n_jobs=4).fit(Xtr, ytr), t0)
t0 = time.time(); show("CatBoost (500)", CatBoostClassifier(iterations=500, learning_rate=0.1, verbose=False, thread_count=4).fit(Xtr, ytr), t0)</div>
  <div class="fx" data-lang="text">x</div>
  <p>x</p>
  <p>Reading order from here: <a class="xref" data-note="ml_adaboost">AdaBoost</a> (re-weighting, the exponential-loss view, a full hand trace), then <a class="xref" data-note="ml_gbm">Gradient Boosting</a> (pseudo-residuals, losses, line search, learning rate, early stopping), then the three libraries.</p>

  <h2 id="bst-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: "more trees is always better"</span>
    <p>True for a random forest, false for boosting. Use early stopping on a validation set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deep base trees</span>
    <p>Fully grown trees leave nothing for later rounds and overfit in one step. Boosting wants shallow trees (depth 3–8, or ~31 leaves).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tuning rounds and learning rate separately</span>
    <p>The best number of rounds scales like 1/ν. Change one, re-tune the other (or use early stopping).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: boosting noisy labels with an aggressive loss</span>
    <p>Exponential and squared losses chase mislabeled rows and outliers. Prefer log-loss / Huber, and compare with a forest.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: boosting linear models expecting non-linearity</span>
    <p>A sum of linear models is linear. The weak learner itself must be able to bend (trees).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: early stopping on the test set</span>
    <p>The test score is then optimistic. Use a separate validation split (or CV) to choose the number of rounds.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "boosting is sequential, so it can't use many cores"</span>
    <p>The rounds are sequential, but inside each round the split search over features and bins is parallel. That is how XGBoost and LightGBM are fast.</p>
  </div>

  <h2 id="bst-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is boosting, in two sentences?</summary><div class="qa-body">An ensemble built sequentially: each new weak model is trained to fix the errors the current ensemble still makes, and the models' outputs are added with a small weight. It mainly reduces bias, turning weak learners into a strong one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bagging reduces variance and boosting reduces bias. Explain why.</summary><div class="qa-body">Averaging models leaves the expected prediction unchanged and only cancels random, model-to-model fluctuation, i.e. variance; it needs low-bias members (deep trees). Boosting changes the target of each new model to the remaining error, so the sum can express patterns no single member can, i.e. it removes bias; it uses high-bias, low-variance members (shallow trees). On churn, 300 bagged stumps = 0.596 (same as one stump), 300 boosted stumps = 0.652.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a weak learner, and why not use a strong one?</summary><div class="qa-body">A model slightly better than chance on any weighting of the data (error ≤ ½ − γ). A strong learner (a full tree) fits the training set in round 1, leaving nothing to correct, and the ensemble is just that overfit model. Weak learners leave room for many small, controlled corrections.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the boosting model and explain each symbol.</summary><div class="qa-body">F_M(x) = F₀ + Σₘ ν·hₘ(x), or F_m = F_{m−1} + ν·h_m. F₀: constant start that minimises the loss; h_m: the m-th weak learner (small tree) trained on what F_{m−1} gets wrong; ν: learning rate (shrinkage); M: number of rounds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is forward stagewise additive modelling?</summary><div class="qa-body">A greedy way to fit an additive model: add one term at a time, choosing it (and its weight) to minimise the loss given the current model, and never re-fit earlier terms. With exponential loss it gives AdaBoost; with any differentiable loss and a gradient approximation it gives gradient boosting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a learning rate below 1?</summary><div class="qa-body">Each learner is fit to noisy residuals; a full step commits to that noise and causes overshoots later rounds must undo. Small steps average the learners' quirks, which generalises better. The cost is more rounds (≈ 1/ν). In practice ν = 0.05–0.1 with early stopping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can boosting overfit? How do you detect and prevent it?</summary><div class="qa-body">Yes. Training loss keeps decreasing with rounds while validation loss is U-shaped (on churn with lr 0.1 the validation log-loss bottoms out and then rises while training loss heads to 0). Prevent with early stopping on a validation set, smaller ν, shallower trees, subsampling, leaf-size limits and regularisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is boosting sensitive to label noise?</summary><div class="qa-body">It concentrates on rows the ensemble gets wrong. Mislabeled rows are always "wrong", so they get growing weights (AdaBoost) or large targets (squared loss) and later learners bend to fit them. Robust losses, shrinkage, early stopping and subsampling help; forests are inherently more robust.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you parallelise boosting?</summary><div class="qa-body">Not across rounds: round m needs the result of round m−1. Within a round, yes: finding the best split over features/bins is parallel, which XGBoost, LightGBM and HistGradientBoosting exploit. Bagging parallelises across whole trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do AdaBoost and gradient boosting differ in aiming the next tree?</summary><div class="qa-body">AdaBoost changes the <em>weights</em> of rows (e^{−yF}) and fits a classifier to the original labels; gradient boosting changes the <em>targets</em> to the negative gradient of the loss (residuals for squared error) and fits a regression tree. AdaBoost is gradient-style boosting with exponential loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what did XGBoost, LightGBM and CatBoost each add?</summary><div class="qa-body">XGBoost: second-order (gradient + Hessian) objective with leaf penalties, sparsity-aware missing values, fast parallel/histogram splits. LightGBM: histogram binning, leaf-wise growth, GOSS sampling and EFB bundling for speed. CatBoost: ordered boosting and ordered target statistics to use categorical features without target leakage, plus symmetric trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your data has 30% label noise and 2,000 rows. Boosting or random forest?</summary><div class="qa-body">Start with a random forest: it is robust to noisy labels, needs little tuning and cannot overfit by adding trees. If you try boosting, use log-loss, a small learning rate, shallow trees, subsampling and early stopping, and compare both on the same validation folds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is a boosted model of stumps interpretable?</summary><div class="qa-body">More than deep boosting: a sum of stumps is an additive model, so each feature's effect can be drawn as one curve (summing all stumps on that feature). With deeper trees, interactions appear and you need tools like SHAP (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>).</div></details>
</main>
`
});
