// ml/ml_trees.js — Tree-Based Models
Object.assign(TOPIC_CONTENT, {
  "ml_trees": `<main>
  <h1>Tree-Based Models</h1>
  <p class="lead">The strongest family of classic ML for table data (rows and columns, like an Excel sheet). This note tells it as one family story: a single <strong>decision tree</strong> has one big weakness, and every other model here (random forest, AdaBoost, gradient boosting, XGBoost, LightGBM, CatBoost, stacking) was invented to fix the weakness of the one before it. You should know <a class="xref" data-note="ml_core">Core Concepts</a> (overfitting, train / validation / test) and <a class="xref" data-note="ml_classification">Classification</a> (logistic regression, log loss) first. Afterwards, <a class="xref" data-note="ml_evaluation">Model Evaluation</a>, <a class="xref" data-note="ml_timeseries">Time Series Forecasting</a> and <a class="xref" data-note="ml_recsys">Recommendation Systems</a> all use these models. The big runs below share one 20,000-row dataset, so their numbers can be compared. The tiny examples use small tables you can check by hand.</p>

  <h2 id="mt-big" class="open"><span class="num">★</span>The Big Picture</h2>
  <p>Before any detail, here is the whole family on one page. Each box is a model; each arrow says how the lower box is related to the upper one. Read it top-down: it is also the order in which the ideas appeared, because each one was built to fix a problem in the one above.</p>
  <figure class="viz"><svg viewBox="0 0 760 568" width="760">
<defs><marker id="mt-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="285" y="8" width="190" height="42" rx="7" class="fs" stroke="currentColor"/>
<text x="380" y="26" text-anchor="middle" font-size="14" font-weight="600">Decision Tree</text>
<text x="380" y="42" text-anchor="middle" class="tm" font-size="11">yes/no questions (CART)</text>
<line x1="380" y1="50" x2="380" y2="96" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="392" y="69" class="tr" font-size="11">weakness: high variance</text>
<text x="392" y="84" class="tm" font-size="11">fix: combine many models</text>
<rect x="275" y="98" width="210" height="42" rx="7" class="fv" stroke="currentColor"/>
<text x="380" y="116" text-anchor="middle" font-size="14" font-weight="600">Ensembles</text>
<text x="380" y="132" text-anchor="middle" class="tm" font-size="11">many models, one answer</text>
<line x1="320" y1="140" x2="135" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="400" y1="140" x2="420" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="460" y1="140" x2="660" y2="208" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="222" y="164" text-anchor="end" class="tm" font-size="11">kind of · in parallel</text>
<text x="400" y="190" text-anchor="end" class="tm" font-size="11">kind of · in sequence</text>
<text x="604" y="166" class="tm" font-size="11">kind of · blend</text>
<rect x="60" y="210" width="140" height="42" rx="7" class="fb sb" fill-opacity="0.25"/>
<text x="130" y="228" text-anchor="middle" font-size="14" font-weight="600">Bagging</text>
<text x="130" y="244" text-anchor="middle" class="tm" font-size="11">bootstrap + average</text>
<rect x="345" y="210" width="150" height="42" rx="7" class="ft st" fill-opacity="0.25"/>
<text x="420" y="228" text-anchor="middle" font-size="14" font-weight="600">Boosting</text>
<text x="420" y="244" text-anchor="middle" class="tm" font-size="11">fix earlier mistakes</text>
<rect x="585" y="210" width="160" height="42" rx="7" class="fg sg" fill-opacity="0.25"/>
<text x="665" y="228" text-anchor="middle" font-size="14" font-weight="600">Stacking / Voting</text>
<text x="665" y="244" text-anchor="middle" class="tm" font-size="11">blend different models</text>
<text x="665" y="276" text-anchor="middle" class="tm" font-size="11">its inputs can be any</text>
<text x="665" y="291" text-anchor="middle" class="tm" font-size="11">model on the left</text>
<line x1="130" y1="252" x2="130" y2="298" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="140" y="279" class="tm" font-size="11">+ random columns</text>
<rect x="60" y="300" width="140" height="42" rx="7" class="fb sb" fill-opacity="0.25"/>
<text x="130" y="318" text-anchor="middle" font-size="14" font-weight="600">Random Forest</text>
<text x="130" y="334" text-anchor="middle" class="tm" font-size="11">trees less alike</text>
<line x1="130" y1="342" x2="130" y2="388" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="140" y="369" class="tm" font-size="11">+ random cut-offs</text>
<rect x="60" y="390" width="140" height="42" rx="7" class="fb sb" fill-opacity="0.25"/>
<text x="130" y="408" text-anchor="middle" font-size="14" font-weight="600">Extra Trees</text>
<text x="130" y="424" text-anchor="middle" class="tm" font-size="11">faster, more random</text>
<line x1="420" y1="252" x2="420" y2="298" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="430" y="279" class="tm" font-size="11">first version</text>
<rect x="350" y="300" width="140" height="42" rx="7" class="ft st" fill-opacity="0.25"/>
<text x="420" y="318" text-anchor="middle" font-size="14" font-weight="600">AdaBoost</text>
<text x="420" y="334" text-anchor="middle" class="tm" font-size="11">reweight wrong rows</text>
<line x1="420" y1="342" x2="420" y2="388" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="430" y="369" class="tm" font-size="11">generalised to any loss</text>
<rect x="335" y="390" width="170" height="42" rx="7" class="ft st" fill-opacity="0.25"/>
<text x="420" y="408" text-anchor="middle" font-size="14" font-weight="600">Gradient Boosting</text>
<text x="420" y="424" text-anchor="middle" class="tm" font-size="11">fit the loss gradient</text>
<line x1="400" y1="432" x2="266" y2="478" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="420" y1="432" x2="420" y2="478" stroke="currentColor" marker-end="url(#mt-fa)"/>
<line x1="440" y1="432" x2="574" y2="478" stroke="currentColor" marker-end="url(#mt-fa)"/>
<text x="290" y="452" text-anchor="end" class="tm" font-size="11">faster, safer versions</text>
<rect x="190" y="480" width="152" height="42" rx="7" class="ft st" fill-opacity="0.25"/>
<text x="266" y="498" text-anchor="middle" font-size="14" font-weight="600">XGBoost</text>
<text x="266" y="514" text-anchor="middle" class="tm" font-size="11">Hessian + penalties</text>
<rect x="344" y="480" width="152" height="42" rx="7" class="ft st" fill-opacity="0.25"/>
<text x="420" y="498" text-anchor="middle" font-size="14" font-weight="600">LightGBM</text>
<text x="420" y="514" text-anchor="middle" class="tm" font-size="11">bins + leaf-wise</text>
<rect x="498" y="480" width="152" height="42" rx="7" class="ft st" fill-opacity="0.25"/>
<text x="574" y="498" text-anchor="middle" font-size="14" font-weight="600">CatBoost</text>
<text x="574" y="514" text-anchor="middle" class="tm" font-size="11">ordered, categories</text>
<rect x="10" y="536" width="740" height="26" rx="6" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.6"/>
<text x="380" y="553" text-anchor="middle" class="tm" font-size="11.5">Used across the whole family: early stopping &amp; tuning (06) · feature importance (09) · production (10)</text>
</svg><figcaption>The family tree. Blue = bagging branch (works on variance), teal = boosting branch (works on bias), green = blending. Each arrow is labelled with how the lower model relates to the upper one.</figcaption></figure>
  <p>The same tree as a story. Each step exists because of the weakness written at the end of the step before it.</p>
  <ol class="story">
    <li><b>Decision Tree</b><span>Learns readable yes/no rules, handles bends and combinations of columns, needs no scaling → but if it grows freely it memorises, and a small change in the data gives a very different tree (high variance).</span></li>
    <li><b>Pruning</b><span>Stops the tree early or cuts it back, so it memorises less → but it is still one shaky model, and on our data it tops out around 0.81 accuracy.</span></li>
    <li><b>Ensembles</b><span>Many models vote; their separate mistakes cancel (the wisdom of crowds) → but we only have one dataset, so how do we get trees that are different from each other?</span></li>
    <li><b>Bagging</b><span>Trains each tree on a random resample of the rows and averages them; 1 tree 0.77 → 100 trees 0.88 → but the trees still look alike, because the strongest column wins the top split in all of them.</span></li>
    <li><b>Random Forest</b><span>Lets each split see only a random few columns, so the trees differ more and train faster → but all the trees still learn alone; averaging only lowers variance, it cannot fix a mistake every tree shares (bias).</span></li>
    <li><b>Extra Trees</b><span>Also picks the cut-off at random: even less alike, even faster → same limit as the forest.</span></li>
    <li><b>Boosting</b><span>A new idea: build trees one after another, each one working on what the previous ones got wrong, so the team's shared mistakes shrink → but how exactly should a new tree "focus" on the mistakes?</span></li>
    <li><b>AdaBoost</b><span>The first answer: give wrongly classified rows more weight for the next tree → but it is tied to one loss, it chases mislabeled rows, and its original form has no clean way to plug in other losses or custom costs.</span></li>
    <li><b>Gradient Boosting</b><span>The general answer: each new tree fits the gradient of any loss (for squared error, simply the residuals) → but the plain version is slow on big data, has few brakes, and overfits if you add too many trees.</span></li>
    <li><b>XGBoost</b><span>Adds second-order (curvature) steps, regularisation on leaves and built-in handling of missing values → but it still tries many cut-offs and grows trees level by level, which is slow on very large data.</span></li>
    <li><b>LightGBM</b><span>Buckets values into histograms, grows the best leaf first, samples rows (GOSS) and bundles sparse columns (EFB): the fastest → but text categories and target leakage are still the user's problem, and leaf-wise trees overfit small data.</span></li>
    <li><b>CatBoost</b><span>Ordered boosting and ordered target statistics handle categories without leaking the answer, with strong defaults → but each tree is slower to train.</span></li>
    <li><b>Stacking / Voting</b><span>Blends different families (forest + booster) so their different mistakes cancel → small gains for more complexity.</span></li>
    <li><b>Feature importance &amp; SHAP</b><span>A forest of 500 trees cannot be read aloud like one tree, so these methods give back the "why" → but they explain the model, not the real world.</span></li>
  </ol>
  <p><strong>How to read this note.</strong> Sections 01–02 are the root of the tree: the decision tree and the weakness it leaves. Section 03 is the "Ensembles" box. Section 04 is the blue (bagging) branch, sections 05–06 the teal (boosting) branch, section 07 the green (blending) box. Section 08 compares the siblings side by side. Sections 09–10 are the dashed bar at the bottom: tools that apply to every member. Each section starts with a breadcrumb that shows where you are in this tree, and ends with a "What's still missing?" box that leads into the next one.</p>

  <h2 id="mt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Tree-Based Models</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Decision tree (the root)</div>
        <ul>
          <li><b>How</b> — greedily pick the (column, cut-off) that most reduces impurity; repeat in each child</li>
          <li><b>Gini</b> — 1 − Σpᵢ²; 0 = pure, 0.5 = 50/50 · <b>Entropy</b> — −Σpᵢlog₂pᵢ</li>
          <li>Worked: [4/6] → [4/1] + [0/5]: Gini 0.48 → 0.16, gain 0.32</li>
          <li><b>Overfits</b> — unlimited: 1413 leaves, train 1.000, val 0.773</li>
          <li><b>Pruning</b> — max_depth 10 → 0.807; ccp_alpha 3e-4 → 0.815</li>
          <li>💡 Doctor's checklist: ask the question that rules out most first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Weakness → ensembles</div>
        <ul>
          <li><b>High variance</b> — 5 trees on 5 different 80% samples disagree on 50% of rows</li>
          <li>Their majority vote: 0.840 vs ~0.78 each</li>
          <li><b>Wisdom of crowds</b> — 100 independent guesses: error 80 → 8; copiers: 64.5</li>
          <li><b>Var</b> = ρσ² + (1−ρ)σ²/n; low ρ (trees less alike) lowers the floor</li>
          <li><b>Three ways</b> — parallel (bagging), sequential (boosting), blend (stacking)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Bagging branch (cuts variance)</div>
        <ul>
          <li><b>Bagging</b> — bootstrap (~63% unique rows) + average; 1 tree 0.766 → 100 trees 0.881</li>
          <li><b>Random forest</b> — + √d columns per split; same accuracy, 3× faster</li>
          <li><b>Extra Trees</b> — + random cut-offs; two trees agree 63.5% (bagging 73.4%); fastest</li>
          <li><b>OOB</b> — free check on the ~37% rows a tree never saw</li>
          <li>More trees never overfit; little tuning</li>
          <li>💡 Laddoo jar: average many independent guesses</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Boosting branch (cuts bias)</div>
        <ul>
          <li><b>Idea</b> — trees in sequence, each on the mistakes so far</li>
          <li><b>AdaBoost</b> — reweight wrong rows; tree's vote α = ½ln((1−err)/err)</li>
          <li><b>Gradient boosting</b> — F_m = F_{m−1} + η·h_m; h fits −∂L/∂F (= residual for MSE)</li>
          <li>Hand demo: MSE 2450 → 1005 → 411 → 233 with 3 stumps</li>
          <li>⚠ Too many trees overfit → early stopping</li>
          <li>💡 ODI chase: each pair plays only for the runs still needed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · XGBoost / LightGBM / CatBoost</div>
        <ul>
          <li><b>XGBoost</b> — gradient + Hessian; leaf w* = −G/(H+λ); γ per leaf; missing-value direction</li>
          <li><b>LightGBM</b> — 255-bin histograms, leaf-wise, GOSS, EFB; fastest</li>
          <li><b>CatBoost</b> — ordered boosting + ordered target stats; symmetric trees; good defaults</li>
          <li>Here: all ≈ 0.87 acc / 0.935–0.938 AUC; RF 0.877 too</li>
          <li><b>Early stopping</b> — best round 204 (val 0.308); round 3000: 0.752</li>
          <li><b>Tune</b> — lr 0.05 + ES → tree size → min_child → sampling → reg → lower lr</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Blending &amp; comparing</div>
        <ul>
          <li><b>Voting</b> — average RF + ET + LightGBM: AUC 0.9364 → 0.9397</li>
          <li><b>Stacking</b> — a small model learns the blend from out-of-fold predictions</li>
          <li><b>Bagging vs boosting</b> — parallel, deep trees, variance vs sequential, shallow trees, bias</li>
          <li><b>Pick</b> — RF baseline → LightGBM/XGBoost + ES; CatBoost for many categories</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">7 · Across the family</div>
        <ul>
          <li><b>MDI</b> — free, on train; ⚠ favours many-valued columns (noise 0.036 vs 0.005)</li>
          <li><b>Permutation</b> — shuffle a column on validation; noise ≈ 0</li>
          <li><b>SHAP</b> — per-prediction, signed, adds up to the model's score</li>
          <li><b>Production</b> — imbalance, monotone constraints, custom loss, categoricals</li>
          <li>⚠ Trees cannot predict beyond the target range they saw</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mt-tree"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Decision Tree</span><span class="rm-sub">Splits, Gini/entropy, pruning</span></div></div>
      <div class="rm-item rm-done" data-target="mt-var"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Its Weakness: High Variance</span><span class="rm-sub">Same data, different trees</span></div></div>
      <div class="rm-item rm-done" data-target="mt-ens"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Ensembles</span><span class="rm-sub">Why many models beat one</span></div></div>
      <div class="rm-item rm-done" data-target="mt-bag"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Bagging Branch</span><span class="rm-sub">Bagging, Random Forest, Extra Trees</span></div></div>
      <div class="rm-item rm-done" data-target="mt-boost"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Boosting Branch</span><span class="rm-sub">AdaBoost, Gradient Boosting</span></div></div>
      <div class="rm-item rm-done" data-target="mt-gbm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">XGBoost, LightGBM, CatBoost</span><span class="rm-sub">+ early stopping &amp; tuning</span></div></div>
      <div class="rm-item rm-done" data-target="mt-stack"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Stacking &amp; Voting</span><span class="rm-sub">Blend different families</span></div></div>
      <div class="rm-item rm-done" data-target="mt-cmp"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Comparing the Family</span><span class="rm-sub">Side-by-side tables, which one when</span></div></div>
      <div class="rm-item rm-done" data-target="mt-imp"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Feature Importance</span><span class="rm-sub">MDI vs permutation vs SHAP</span></div></div>
      <div class="rm-item rm-done" data-target="mt-prod"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Production Concerns</span><span class="rm-sub">Imbalance, monotone, custom loss</span></div></div>
      <div class="rm-item rm-done" data-target="mt-conn"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How This Connects</span><span class="rm-sub">Notes before and after</span></div></div>
      <div class="rm-item rm-done" data-target="mt-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps across the family</span></div></div>
      <div class="rm-item rm-done" data-target="mt-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including "why did X come after Y?"</span></div></div>
    </div>
  </div>

  <h2 id="mt-tree"><span class="num">01</span>The Decision Tree</h2>
  <div class="where"><span>Tree-Based Models</span><span>Decision Tree</span></div>
  <p>This is the root of the family; everything else in the note is built out of these trees. Why it exists: logistic regression (from <a class="xref" data-note="ml_classification">Classification</a>) draws one straight line through the data. Real patterns bend: "plays if temperature is 29–39 and no exam, unless it rains". A tree handles bends and combinations of columns on its own, needs no scaling of the numbers, and you can read its rules aloud.</p>
  <h3>Asking yes/no questions</h3>
  <p>You decide every evening whether to go out and play cricket. Over a week, your reasons settle into questions: "Is it raining? Is there an exam tomorrow? Is it too hot?" Each question has a yes/no answer, and the answers lead you to a decision. A <strong>decision tree</strong> is exactly this: a list of yes/no questions about the columns of a table, ending in an answer. The machine learns which questions to ask, and in which order, from past rows. The code builds one from ten past evenings and asks it about a new day.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
df = pd.DataFrame({
    "raining":       [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    "exam_tomorrow": [0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    "temp_c":        [30, 31, 30, 44, 32, 33, 29, 45, 34, 29],
    "plays":         ["no", "yes", "no", "no", "no", "no", "yes", "no", "yes", "no"]})
X, y = df.drop(columns="plays"), df["plays"]          # X = the questions' columns, y = the answer
tree = DecisionTreeClassifier(random_state=0).fit(X, y)
print(export_text(tree, feature_names=list(X.columns)))
new_day = pd.DataFrame({"raining": [0], "exam_tomorrow": [0], "temp_c": [32]})
print(tree.predict(new_day))</div>
  <div class="fx" data-lang="text">|--- raining &lt;= 0.50
|   |--- temp_c &lt;= 39.00
|   |   |--- exam_tomorrow &lt;= 0.50
|   |   |   |--- class: yes
|   |   |--- exam_tomorrow &gt;  0.50
|   |   |   |--- class: no
|   |--- temp_c &gt;  39.00
|   |   |--- class: no
|--- raining &gt;  0.50
|   |--- class: no

['yes']</div>
  <p>Read it top to bottom. First question: raining? If yes (raining &gt; 0.5), the answer is "no" straight away. If not raining, next question: hotter than 39°C? And so on. The new day (no rain, no exam, 32°C) walks down the left branches and lands on "yes". The tree picked these questions itself. Next: <em>how</em> it picks them.</p>
  <h3>Gini and entropy: picking the best question</h3>
  <p>The tree wants each question to separate the "yes" rows from the "no" rows as cleanly as possible. A group where everyone has the same answer is called <strong>pure</strong>. A group that is half and half is as mixed as it gets. The tree needs a number that says how mixed a group is, so it can compare questions. That number is called <strong>impurity</strong>.</p>
  <p>The usual impurity score is <strong>Gini</strong>. Its meaning in words: pick two rows from the group at random; Gini is the chance they have different answers. Tiny worked example with a group of 5 rows:</p>
  <ul>
    <li>Group [4 yes, 1 no]: share of yes = 0.8, share of no = 0.2. Gini = 1 − (0.8² + 0.2²) = 1 − (0.64 + 0.04) = <strong>0.32</strong>.</li>
    <li>Group [0 yes, 5 no]: Gini = 1 − (0² + 1²) = <strong>0</strong>. Pure.</li>
    <li>Group [5 yes, 5 no]: Gini = 1 − (0.25 + 0.25) = <strong>0.5</strong>. The most mixed a two-class group can be.</li>
  </ul>
  <p>Now the search. Take 10 customers of a mobile company: 4 left (churned), 6 stayed. The tree tries every column and every cut-off, and for each one it computes how much the impurity falls. The question with the biggest fall wins. The picture shows one such comparison.</p>
  <figure class="viz"><svg viewBox="0 0 560 210" width="560">
<defs><marker id="mt-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="40" y="10" width="270" height="50" rx="6" class="fs" stroke="currentColor"/>
<text x="175" y="31" text-anchor="middle" font-size="13">10 customers: 4 churn / 6 stay</text>
<text x="175" y="50" text-anchor="middle" class="tm" font-size="12">Gini 0.480 · contract = monthly?</text>
<line x1="150" y1="60" x2="95" y2="120" stroke="currentColor" marker-end="url(#mt-ah)"/><line x1="210" y1="60" x2="265" y2="120" stroke="currentColor" marker-end="url(#mt-ah)"/>
<text x="105" y="88" class="tm" font-size="12">yes</text><text x="245" y="88" class="tm" font-size="12">no</text>
<rect x="10" y="122" width="150" height="48" rx="6" class="fr sr" fill-opacity="0.25"/>
<text x="85" y="142" text-anchor="middle" font-size="13">4 churn / 1 stay</text><text x="85" y="161" text-anchor="middle" class="tm" font-size="12">Gini 0.320</text>
<rect x="200" y="122" width="150" height="48" rx="6" class="fg sg" fill-opacity="0.25"/>
<text x="275" y="142" text-anchor="middle" font-size="13">0 churn / 5 stay</text><text x="275" y="161" text-anchor="middle" class="tm" font-size="12">Gini 0 (pure)</text>
<text x="340" y="30" font-size="12">weighted child Gini</text>
<text x="340" y="50" font-size="12">= 0.5·0.32 + 0.5·0 = 0.16</text>
<text x="340" y="74" class="tg" font-size="12">gain = 0.48 − 0.16 = 0.32</text>
<text x="370" y="110" class="tm" font-size="12">rival split "age &lt; 30":</text>
<text x="370" y="128" class="tm" font-size="12">[2/2] + [2/4] → gain 0.013</text>
<text x="370" y="160" class="tb" font-size="13">tree picks "contract"</text>
<text x="10" y="200" class="tm" font-size="12">Try every feature × cut-off, keep the biggest drop, repeat in each child.</text>
</svg><figcaption>One split, worked by hand: the question that leaves the purest children wins.</figcaption></figure>
  <p>Look at the two children of "contract = monthly?". The left child has Gini 0.32, the right child is pure (Gini 0). The tree averages the children, giving more weight to the bigger child: here both have 5 rows, so 0.5 × 0.32 + 0.5 × 0 = 0.16. The parent was 0.48, so this question removes 0.48 − 0.16 = 0.32 of impurity. The rival question "age &lt; 30" removes only 0.013. So the tree asks about the contract first, then repeats the same search inside each child. The code below checks the picture, and also computes <strong>entropy</strong>, a second way to score mixing.</p>
  <div class="fx" data-lang="py">import numpy as np
def gini(c): p = np.array(c)/sum(c); return 1 - (p**2).sum()
def ent(c):  p = np.array(c)/sum(c); p = p[p &gt; 0]; return -(p*np.log2(p)).sum()
parent = [4, 6]                                         # [churn, stay]
splits = {"contract = monthly": ([4, 1], [0, 5]), "age &lt; 30": ([2, 2], [2, 4])}
print(f"parent  gini {gini(parent):.3f}  entropy {ent(parent):.3f}")
for n, (l, r) in splits.items():
    wl, wr = sum(l)/10, sum(r)/10                       # share of rows in each child
    g = wl*gini(l) + wr*gini(r); e = wl*ent(l) + wr*ent(r)
    print(f"{n:20s} Gini gain {gini(parent)-g:.3f} | info gain {ent(parent)-e:.3f}")</div>
  <div class="fx" data-lang="text">parent  gini 0.480  entropy 0.971
contract = monthly   Gini gain 0.320 | info gain 0.610
age &lt; 30             Gini gain 0.013 | info gain 0.020</div>
  <p><code>gini(c)</code> takes the counts in a group and returns 1 − Σp². <code>ent(c)</code> uses logs instead. Both rank the two questions the same way, and in practice they almost always agree. Gini is sklearn's default because it has no log, so it is a little faster.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor's checklist: "Fever? → Cough? → Get a test." A good doctor asks first the question that rules out the most diseases. The tree does the same: the first question is the one that separates the answers most.</p>
  </div>
  <div class="callout intu"><span class="label">Formal terms</span>
    <p><strong>CART</strong> (Classification And Regression Trees) is the name of this build-by-greedy-splits method. <strong>Gini = 1 − Σpᵢ²</strong>, where pᵢ is the share of rows in class i (chance two random picks disagree). <strong>Entropy = −Σ pᵢ log₂ pᵢ</strong> (how many bits of surprise per row). <strong>Gain = impurity(parent) − Σ (nₖ/n) · impurity(childₖ)</strong>: parent's impurity minus the size-weighted impurity of the children (nₖ = rows in child k, n = rows in parent); with entropy this is called <strong>information gain</strong>. A <strong>regression tree</strong> does the same search for a number target, but it measures mixing by MSE (mean squared error) and each leaf predicts the average of its rows. Remember regression trees: gradient boosting (section 05) is built from them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every question is "one column, one cut-off", so a tree's borders are always straight lines parallel to the axes. A pattern like "price &gt; 2 × size" needs a staircase of many splits. Give the tree a column for the ratio and it gets easy.</p>
  </div>
  <h3>Overfitting and pruning</h3>
  <p>From here on we use a bigger, realistic table: 20,000 customers with 14 columns (built in the box below). Nobody stops the tree, so it keeps asking questions until every leaf is pure. On 12,000 training rows it ends with 1,413 leaves. Some of those leaves hold two or three rows and a rule like "customer from Pune, aged 41, who called on a Tuesday → churns". That rule fits those three people, not a pattern. On new customers it is wrong. This is <strong>overfitting</strong>: the model memorised its training rows instead of learning what repeats.</p>
  <div class="callout def"><span class="label">The dataset used on this page</span>
    <p>Fake churn data: 12 columns from <code>make_classification</code> (6 carry signal, 2 are mixes of those, 4 are useless) plus two pure-noise columns, <code>row_noise</code> (20,000 different random values) and <code>coin_noise</code> (0 or 1 at random). Split 12,000 train / 3,000 validation / 5,000 test. Logistic regression scores only 0.596 on the test set, so the pattern is far from a straight line. Every churn code block below starts from this setup.</p>
  </div>
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
  <p>You can see overfitting with two scores: <strong>train accuracy</strong> (how well it does on the rows it learnt from) and <strong>validation accuracy</strong> (how well it does on rows kept aside, which it never saw). The cure is called <strong>pruning</strong>: keep the tree small. Two ways:</p>
  <div class="cards">
    <div><b>Pre-pruning (stop early)</b><p>Set limits before training: <code>max_depth</code> (how many questions deep), <code>min_samples_leaf</code> (a leaf must hold at least this many rows), <code>min_impurity_decrease</code> (a split must remove at least this much impurity).</p><small>Cheap, the usual choice</small></div>
    <div><b>Post-pruning (grow, then cut)</b><p>Grow the full tree, then cut back branches that do not pay for themselves. Each leaf costs a fixed penalty α; a branch stays only if it reduces error by more than its leaves cost.</p><small><code>ccp_alpha</code>; pick α by validation / CV</small></div>
  </div>
  <p>The code tries both: five depth limits, then five values of the leaf penalty α.</p>
  <div class="fx" data-lang="py">for d in [1, 3, 6, 10, None]:
    t = DecisionTreeClassifier(max_depth=d, random_state=0).fit(Xtr, ytr)
    print(f"max_depth={str(d):5s} leaves={t.get_n_leaves():5d}  train {t.score(Xtr,ytr):.3f}  val {t.score(Xva,yva):.3f}")
for a in [0, 1e-4, 3e-4, 1e-3, 3e-3]:
    t = DecisionTreeClassifier(ccp_alpha=a, random_state=0).fit(Xtr, ytr)
    print(f"ccp_alpha={a:&lt;6} leaves={t.get_n_leaves():5d}  train {t.score(Xtr,ytr):.3f}  val {t.score(Xva,yva):.3f}")</div>
  <div class="fx" data-lang="text">max_depth=1     leaves=    2  train 0.601  val 0.597
max_depth=3     leaves=    8  train 0.684  val 0.690
max_depth=6     leaves=   61  train 0.781  val 0.767
max_depth=10    leaves=  399  train 0.876  val 0.807
max_depth=None  leaves= 1413  train 1.000  val 0.773
ccp_alpha=0      leaves= 1413  train 1.000  val 0.773
ccp_alpha=0.0001 leaves= 1142  train 0.988  val 0.782
ccp_alpha=0.0003 leaves=  280  train 0.891  val 0.815
ccp_alpha=0.001  leaves=   58  train 0.804  val 0.788
ccp_alpha=0.003  leaves=   26  train 0.770  val 0.765</div>
  <figure class="viz"><svg viewBox="0 0 560 235" width="560">
<line x1="50" y1="200" x2="530" y2="200" stroke="currentColor"/><line x1="50" y1="15" x2="50" y2="200" stroke="currentColor"/>
<text x="44" y="184" text-anchor="end" class="tm" font-size="11">0.6</text><text x="44" y="104" text-anchor="end" class="tm" font-size="11">0.8</text><text x="44" y="24" text-anchor="end" class="tm" font-size="11">1.0</text>
<line x1="50" y1="100" x2="530" y2="100" stroke="currentColor" stroke-opacity="0.15"/>
<polyline points="80,180 180,146 280,108 380,70 480,20" fill="none" class="sb" stroke-width="2.5"/>
<polyline points="80,181 180,144 280,113 380,97 480,111" fill="none" class="sr" stroke-width="2.5"/>
<circle cx="380" cy="97" r="5" class="fg sg"/>
<text x="80" y="217" text-anchor="middle" class="tm" font-size="11">1</text><text x="180" y="217" text-anchor="middle" class="tm" font-size="11">3</text><text x="280" y="217" text-anchor="middle" class="tm" font-size="11">6</text><text x="380" y="217" text-anchor="middle" class="tm" font-size="11">10</text><text x="480" y="217" text-anchor="middle" class="tm" font-size="11">None</text>
<text x="290" y="232" text-anchor="middle" class="tm" font-size="12">max_depth</text>
<text x="398" y="40" text-anchor="end" class="tb" font-size="12">train → 1.000</text><text x="425" y="150" class="tr" font-size="12">validation 0.773</text>
<text x="380" y="132" text-anchor="middle" class="tg" font-size="12">sweet spot 0.807</text>
</svg><figcaption>Deeper trees keep improving on training data and start losing on validation after depth ~10.</figcaption></figure>
  <p>Each printed line is one tree; the chart plots the first block. Blue is the train score, red the validation score. With <code>max_depth=1</code> (a single question) the tree is too simple: 0.60 on both sets. Depth 10 is the sweet spot at 0.807. After that the blue line keeps climbing to 1.000 while the red line falls to 0.773: the extra depth only learns noise. The second block uses post-pruning: <code>ccp_alpha=0.0003</code> cuts 1,413 leaves down to 280 and gives the best validation score of all, 0.815.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Preparing for an exam from last year's paper. Learning the chapters is like a depth-10 tree. Memorising that "question 7 answer is (c)" is a 1,413-leaf tree: perfect on last year's paper, useless on this year's.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Pruning stops the memorising, but the best single tree still scores only about 0.81, and it hides a deeper problem: train the same tree on slightly different rows and you get a different tree. The next section measures how bad that is.</div>

  <h2 id="mt-var"><span class="num">02</span>Its Weakness: High Variance</h2>
  <div class="where"><span>Tree-Based Models</span><span>Decision Tree</span><span>Weakness: high variance</span></div>
  <p>Why this section exists: it is the bridge between the single tree and every ensemble. If you understand the problem shown here, you understand why random forests and boosting were invented.</p>
  <p>Imagine five data scientists in five offices. Each gets almost the same customer table: a different random 80% of our 12,000 training rows. Each grows a full tree. If trees were stable, all five would ask the same questions and give the same answers. The code checks.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
preds = []
for k in range(5):
    idx = rng.choice(len(Xtr), size=len(Xtr)*8//10, replace=False)   # a different 80% of the rows
    t = DecisionTreeClassifier(random_state=0).fit(Xtr.iloc[idx], ytr[idx])
    s = t.tree_; L = s.children_left[0]                    # node 0 = first question, L = its "yes" child
    name = lambda i: f"{Xtr.columns[s.feature[i]]} &lt;= {s.threshold[i]:.2f}"
    p = t.predict(Xva); preds.append(p)
    print(f"tree {k+1}: 1st q '{name(0)}'  2nd q '{name(L)}'  leaves {t.get_n_leaves()}  val {np.mean(p == yva):.3f}")
P = np.array(preds)                                        # 5 trees x 3000 validation rows
print(f"rows where the 5 trees do not all agree: {np.mean(P.min(0) != P.max(0)):.1%}")
vote = (P.mean(0) &gt; 0.5).astype(int)                       # majority vote of the 5 trees
print(f"majority vote of the 5 trees: val {np.mean(vote == yva):.3f}")</div>
  <div class="fx" data-lang="text">tree 1: 1st q 'f5 &lt;= 0.31'  2nd q 'f3 &lt;= -0.63'  leaves 1142  val 0.779
tree 2: 1st q 'f5 &lt;= 0.31'  2nd q 'f6 &lt;= -1.03'  leaves 1162  val 0.774
tree 3: 1st q 'f5 &lt;= 0.30'  2nd q 'f3 &lt;= -0.53'  leaves 1143  val 0.776
tree 4: 1st q 'f5 &lt;= 0.05'  2nd q 'f6 &lt;= -1.13'  leaves 1153  val 0.791
tree 5: 1st q 'f5 &lt;= -0.09'  2nd q 'f6 &lt;= -1.13'  leaves 1172  val 0.779
rows where the 5 trees do not all agree: 50.0%
majority vote of the 5 trees: val 0.840</div>
  <p>Line by line: all five trees ask about <code>f5</code> first, but at different cut-offs (0.31, 0.30, 0.05, −0.09). Because the first cut-off moved, the rows reaching the second question are different, so the second question changes too (<code>f3</code> for some trees, <code>f6</code> for others). Every question below changes after that. Each tree scores about 0.78. But they do not make the <em>same</em> mistakes: on half of the validation customers at least one tree disagrees with the others. And when the five simply vote, accuracy jumps to <strong>0.840</strong>, better than any single one of them.</p>
  <p>That last line is the whole idea of this note in one number. A model whose answer changes a lot when the training data changes a little is said to have <strong>high variance</strong>. High variance is bad for one model, but it also means the mistakes are partly random, and random mistakes cancel when you combine many models.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ask five friends the way to a new restaurant. Each gives slightly different directions and each has a wrong turn somewhere, but rarely the same wrong turn. Follow the majority at every junction and you get there.</p>
  </div>
  <div class="callout intu"><span class="label">Formal terms</span>
    <p><strong>Variance</strong> (of a model) — how much its predictions change when it is trained on a different sample from the same source. <strong>Bias</strong> — the error that stays even on average over many training samples, because the model is too simple or too constrained to capture the pattern. A deep tree has <em>low bias</em> (it can fit anything) and <em>high variance</em>. A depth-1 stump has the opposite. <a class="xref" data-note="ml_core">Core Concepts</a> covers this bias-variance trade-off in general.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not read a single tree's top split as "the most important factor" for the business. As shown above, a slightly different sample moves the cut-offs and reshuffles every question below. Section 09 shows importance methods that are stable.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We saw that five shaky trees voting beat each one of them. We need a general theory of <em>why</em> combining works, and when it does not. That theory is "ensembles".</div>

  <h2 id="mt-ens"><span class="num">03</span>Ensembles: Why One Model Isn't Enough</h2>
  <div class="where"><span>Tree-Based Models</span><span>Ensembles</span></div>
  <p>Why it exists: one tree is either too simple (pruned, high bias) or too shaky (deep, high variance). An <strong>ensemble</strong> is a group of models whose answers are combined into one. It is the parent of every other model in this note.</p>
  <h3>The wisdom of crowds</h3>
  <p>At a mela there is a jar of laddoos and a prize for the closest guess of how many are inside. One person's guess is often far off. But the average of 100 people's guesses is usually very close, because one guesses too high, another too low, and the mistakes cancel. The trick only works if the 100 people guess on their own. If they all copy one loud friend, the average is just that friend's guess. The simulation plays the game 10,000 times.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
true = 500
one = true + rng.normal(0, 100, 10_000)                          # one person's guess, 10k trials
avg = true + rng.normal(0, 100, (10_000, 100)).mean(1)            # mean of 100 independent guesses
friend = rng.normal(0, 100, (10_000, 1))                          # shared mistake
copy = true + (0.8*friend + 0.2*rng.normal(0, 100, (10_000, 100))).mean(1)
for n, g in [("one guess", one), ("avg of 100 independent", avg), ("avg of 100 copiers", copy)]:
    print(f"{n:24s} typical error {np.abs(g - true).mean():5.1f}")</div>
  <div class="fx" data-lang="text">one guess                typical error  80.0
avg of 100 independent   typical error   8.0
avg of 100 copiers       typical error  64.5</div>
  <p>Averaging 100 independent guesses cut the error 10×. Averaging 100 copiers barely helped. The same holds for yes/no votes. Suppose each voter (each model) is right 70% of the time and voters err independently. The code computes how often the majority is right.</p>
  <div class="fx" data-lang="py">from math import comb
p = 0.70                                   # each voter is right 70% of the time, independently
for n in [1, 3, 5, 25, 101]:
    need = n // 2 + 1                      # votes needed for a majority
    right = sum(comb(n, k) * p**k * (1-p)**(n-k) for k in range(need, n + 1))
    print(f"{n:3d} voters -&gt; majority is right {right:.3f}")</div>
  <div class="fx" data-lang="text">  1 voters -&gt; majority is right 0.700
  3 voters -&gt; majority is right 0.784
  5 voters -&gt; majority is right 0.837
 25 voters -&gt; majority is right 0.983
101 voters -&gt; majority is right 1.000</div>
  <p>Three 70% voters make a 78% team; twenty-five make a 98% team. Two conditions hide in that maths: each voter must be <strong>better than a coin flip</strong> (if p were below 0.5, adding voters would make things worse), and the voters must make <strong>different mistakes</strong>. Real trees trained on the same data are never fully independent, so the real gain is smaller, as the next formula shows.</p>
  <h3>Bias and variance: what averaging can and cannot fix</h3>
  <p>Averaging n models with the same bias gives a model with that same bias; only the variance shrinks. How much it shrinks depends on how alike the models are:</p>
  <div class="callout intu"><span class="label">Formal terms</span>
    <p><strong>Var(average of n models) = ρσ² + (1 − ρ)σ²/n</strong>. σ² is one model's variance, n is the number of models, ρ (rho) is the correlation between them: how much they copy each other (0 = independent, 1 = identical). More models shrink only the second term. The first term, ρσ², is a floor that only drops if the models become less alike. Keep this formula in mind: Random Forest and Extra Trees (section 04) are both tricks for lowering ρ.</p>
  </div>
  <h3>Three ways to combine</h3>
  <p>Every ensemble in this note is one of three designs. They are the three children of "Ensembles" in the family tree.</p>
  <table class="tbl">
    <tr><th></th><th>Bagging (section 04)</th><th>Boosting (sections 05–06)</th><th>Stacking / voting (section 07)</th></tr>
    <tr><td>Models built</td><td>In parallel, independently</td><td>In sequence, each sees the earlier ones' mistakes</td><td>Separately, can be different kinds</td></tr>
    <tr><td>Combined by</td><td>Plain average / majority vote</td><td>Weighted sum</td><td>Average, or a small model that learns the weights</td></tr>
    <tr><td>Each member</td><td>Deep tree: low bias, high variance</td><td>Small tree: high bias, low variance</td><td>Already-strong models</td></tr>
    <tr><td>Mainly fixes</td><td>Variance</td><td>Bias</td><td>Whatever the members disagree on</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Bagging is a panel of judges scoring independently, then averaging. Boosting is a relay of tutors: each one teaches only the chapters the student still fails. Stacking is a head judge who has learnt which panel member to trust for which kind of case.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>An ensemble of identical models is just one model, slower. Ten copies of the same pruned tree trained on the same rows vote the same way every time. Diversity is not a side detail; it is where the whole gain comes from.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have exactly one training table. How do we grow many trees from it that are good but <em>different</em>? The first answer, and the simplest, is bagging.</div>

  <h2 id="mt-bag"><span class="num">04</span>The Bagging Branch: Bagging, Random Forest, Extra Trees</h2>
  <div class="where"><span>Tree-Based Models</span><span>Ensembles</span><span>Bagging</span></div>
  <p>Why it exists: section 03 says we need many different trees, but we have one dataset. Bagging manufactures different datasets out of the one we have. This branch attacks the <em>variance</em> of deep trees; each sibling below makes the trees a little less alike than the one before.</p>
  <h3>The idea: bootstrap + aggregate</h3>
  <p><strong>Bagging</strong> is short for <strong>b</strong>ootstrap <strong>agg</strong>regat<strong>ing</strong>. A <strong>bootstrap sample</strong> is made by picking rows at random <em>with replacement</em> until you have as many rows as the original. Some rows appear twice, some never. Each tree is grown on its own bootstrap sample, and at the end all trees vote (or average, for numbers). Tiny example with 10 rows:</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(3)
rows = rng.integers(0, 10, 10)                       # draw 10 row numbers from 0..9, with replacement
print("bootstrap rows:", sorted(rows.tolist()))
print("never picked:  ", sorted(set(range(10)) - set(rows.tolist())))
big = rng.integers(0, 100_000, 100_000)
print("share of unique rows (n=100,000):", round(len(np.unique(big)) / 100_000, 3))</div>
  <div class="fx" data-lang="text">bootstrap rows: [0, 0, 0, 1, 1, 2, 5, 8, 8, 8]
never picked:   [3, 4, 6, 7, 9]
share of unique rows (n=100,000): 0.631</div>
  <p>This bootstrap sample picked row 0 three times and never picked rows 3, 4, 6, 7, 9. On big data about 63% of rows get into each tree and about 37% are left out. Those left-out rows are a free mini test set for that tree, called <strong>out-of-bag (OOB)</strong> rows. Now bagging on the churn data, with full-depth trees:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
for n in [1, 10, 100]:
    bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=n, n_jobs=-1, random_state=0).fit(Xtr, ytr)
    print(f"bagged trees={n:3d}  val {bag.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">bagged trees=  1  val 0.766
bagged trees= 10  val 0.857
bagged trees=100  val 0.881</div>
  <p>One bagged tree: 0.766 (similar to the single tree, slightly worse because it saw only 63% of the unique rows). Ten trees: 0.857. One hundred: 0.881. That is +11 points without changing the tree at all, only by averaging away its variance.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The laddoo jar again. Each bootstrap sample is a different person who saw the jar from a different angle; averaging their guesses cancels the angle-specific mistakes.</p>
  </div>
  <h3>Random Forest: bagging + random columns</h3>
  <p><strong>How it differs from plain bagging:</strong> bagged trees still look alike. On our data the strongest column (<code>f5</code>) wins the first question in nearly every bootstrap sample, so every tree starts the same way and the trees share mistakes (high ρ in the formula). A <strong>random forest</strong> adds one rule: at every split, the tree may look at only a random handful of columns (√14 ≈ 3 here), not all of them. Sometimes <code>f5</code> is not on offer, so the tree must start with something else.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<defs><marker id="mt-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="75" width="90" height="50" rx="6" class="fs" stroke="currentColor"/><text x="55" y="97" text-anchor="middle" font-size="12">training</text><text x="55" y="113" text-anchor="middle" font-size="12">data</text>
<rect x="150" y="15" width="120" height="40" rx="6" class="fb sb" fill-opacity="0.25"/><text x="210" y="39" text-anchor="middle" font-size="12">bootstrap 1</text>
<rect x="150" y="80" width="120" height="40" rx="6" class="fb sb" fill-opacity="0.25"/><text x="210" y="104" text-anchor="middle" font-size="12">bootstrap 2</text>
<rect x="150" y="145" width="120" height="40" rx="6" class="fb sb" fill-opacity="0.25"/><text x="210" y="169" text-anchor="middle" font-size="12">bootstrap …500</text>
<line x1="100" y1="90" x2="148" y2="40" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="100" y1="100" x2="148" y2="100" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="100" y1="110" x2="148" y2="160" stroke="currentColor" marker-end="url(#mt-ah2)"/>
<rect x="300" y="15" width="150" height="40" rx="6" class="ft st" fill-opacity="0.25"/><text x="375" y="32" text-anchor="middle" font-size="12">tree 1</text><text x="375" y="48" text-anchor="middle" class="tm" font-size="10">splits try {f2,f7,f9}</text>
<rect x="300" y="80" width="150" height="40" rx="6" class="ft st" fill-opacity="0.25"/><text x="375" y="97" text-anchor="middle" font-size="12">tree 2</text><text x="375" y="113" text-anchor="middle" class="tm" font-size="10">splits try {f0,f5,f8}</text>
<rect x="300" y="145" width="150" height="40" rx="6" class="ft st" fill-opacity="0.25"/><text x="375" y="162" text-anchor="middle" font-size="12">tree 500</text><text x="375" y="178" text-anchor="middle" class="tm" font-size="10">splits try {f1,f4,f5}</text>
<line x1="270" y1="35" x2="298" y2="35" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="270" y1="100" x2="298" y2="100" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="270" y1="165" x2="298" y2="165" stroke="currentColor" marker-end="url(#mt-ah2)"/>
<rect x="480" y="75" width="70" height="50" rx="6" class="fg sg" fill-opacity="0.25"/><text x="515" y="97" text-anchor="middle" font-size="12">vote /</text><text x="515" y="113" text-anchor="middle" font-size="12">average</text>
<line x1="450" y1="35" x2="478" y2="90" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="450" y1="100" x2="478" y2="100" stroke="currentColor" marker-end="url(#mt-ah2)"/><line x1="450" y1="165" x2="478" y2="110" stroke="currentColor" marker-end="url(#mt-ah2)"/>
</svg><figcaption>Random forest = bagging (different rows per tree) + a random few columns at every split. Different trees make different mistakes, which cancel in the vote.</figcaption></figure>
  <p>Follow the arrows: the training data becomes many bootstrap samples (the bagging part), each grows its own tree that may only look at a random few columns at each split (the forest's addition), and all votes are combined at the end. The run compares "bagging only" (<code>max_features=None</code>, all columns) with a real forest (<code>"sqrt"</code>):</p>
  <div class="fx" data-lang="py">for n, mf in [(1, None), (100, None), (100, "sqrt"), (300, "sqrt")]:
    t0 = time.time()
    rf = RandomForestClassifier(n_estimators=n, max_features=mf, oob_score=(n &gt; 1),
                                n_jobs=-1, random_state=0).fit(Xtr, ytr)
    oob = f"{rf.oob_score_:.3f}" if n &gt; 1 else "  -  "
    print(f"trees={n:3d} max_features={str(mf):5s} train {rf.score(Xtr,ytr):.3f}  "
          f"val {rf.score(Xva,yva):.3f}  OOB {oob}  {time.time()-t0:.1f}s")</div>
  <div class="fx" data-lang="text">trees=  1 max_features=None  train 0.907  val 0.770  OOB   -    0.1s
trees=100 max_features=None  train 1.000  val 0.879  OOB 0.861  3.7s
trees=100 max_features=sqrt  train 1.000  val 0.880  OOB 0.858  1.2s
trees=300 max_features=sqrt  train 1.000  val 0.879  OOB 0.864  3.4s</div>
  <p>One tree: 0.770. One hundred trees: 0.879. Letting each split see only √d columns gave the same accuracy and ran about 3× faster, because each split checks 3 columns instead of 14. Going from 100 to 300 trees changed nothing: after a few hundred trees the average has settled. Train accuracy 1.000 is normal for a forest (each deep tree memorises its own sample) and is not a warning by itself; the OOB score (0.86) is the honest one. Times are from a shared 4-core machine and vary run to run.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The OOB score is free, but it ignores any preprocessing you fitted outside the forest and it is noisy on small data. Use it as a sanity check; pick models on a proper validation set or cross-validation.</p>
  </div>
  <h3>Extra Trees: random cut-offs too</h3>
  <p><strong>How it differs from Random Forest:</strong> a forest still searches for the <em>best</em> cut-off on each of its few columns. <strong>Extra Trees</strong> ("extremely randomised trees") draws one <em>random</em> cut-off per candidate column and keeps the best of those. Each tree becomes worse on its own, but the trees become even less alike, and training is faster because there is no search over cut-offs. (By default Extra Trees also skips the bootstrap and uses all rows, since the random cut-offs already give enough diversity.) The code measures all three siblings on the same footing, including how often two trees from the same ensemble give the same answer, which is a direct look at ρ.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier, ExtraTreesClassifier
models = {
    "bagging (all columns)": BaggingClassifier(DecisionTreeClassifier(), n_estimators=300, n_jobs=-1, random_state=0),
    "random forest (sqrt)":  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0),
    "extra trees (sqrt)":    ExtraTreesClassifier(n_estimators=300, n_jobs=-1, random_state=0)}
for name, m in models.items():
    t0 = time.time(); m.fit(Xtr, ytr); sec = time.time() - t0
    P = np.array([t.predict(Xva.values) for t in m.estimators_[:50]])  # 50 trees' answers
    agree = np.mean([np.mean(P[i] == P[j]) for i in range(50) for j in range(i)])
    one = np.mean(P[0] == yva)
    print(f"{name:22s} one tree {one:.3f}  two trees agree {agree:.1%}  forest val {m.score(Xva, yva):.3f}  {sec:.1f}s")</div>
  <div class="fx" data-lang="text">bagging (all columns)  one tree 0.766  two trees agree 73.4%  forest val 0.883  11.4s
random forest (sqrt)   one tree 0.746  two trees agree 68.3%  forest val 0.879  2.7s
extra trees (sqrt)     one tree 0.654  two trees agree 63.5%  forest val 0.878  1.4s</div>
  <p>Read across the three lines and the family's logic is visible. Each step down makes a single tree weaker (0.766 → 0.746 → 0.654) and makes trees agree less (73% → 68% → 64%). The two effects pull in opposite directions, and on this data they almost cancel: all three ensembles land at 0.88. The real gain is speed: 11.4 s → 2.7 s → 1.4 s. On data with many columns or lots of noise, the extra randomness often wins outright; on other data, bagging or the forest does. Try all three; they cost almost nothing to tune.</p>
  <div class="callout intu"><span class="label">Formal terms</span>
    <p><strong>Bagging</strong>: train each model on a bootstrap sample, average them. <strong>Random forest</strong>: bagged trees + random subset of <code>max_features</code> columns per split (sklearn default √d for classification, all d for regression). <strong>Extra Trees</strong>: random subset of columns + one random threshold per column per split, usually no bootstrap. All three lower variance by lowering ρ; none of them lowers bias, which stays about that of one deep tree.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Every tree in this branch learns alone and never sees what the others got wrong. Averaging cancels <em>random</em> mistakes, but if every tree misses the same pattern (bias), a thousand trees miss it too. To fix shared mistakes, the trees must work as a team in sequence. That is boosting.</div>

  <h2 id="mt-boost"><span class="num">05</span>The Boosting Branch: AdaBoost and Gradient Boosting</h2>
  <div class="where"><span>Tree-Based Models</span><span>Ensembles</span><span>Boosting</span></div>
  <p>Why it exists: bagging can only cancel the mistakes trees make at random. Boosting goes after the mistakes they make <em>together</em>. Instead of many deep trees in parallel, it builds many small trees one after another, and each new tree is trained on what the team so far gets wrong.</p>
  <h3>The idea: learn from the previous mistakes</h3>
  <p>A very simple tree (a <strong>weak learner</strong>, for example a one-question tree called a <strong>stump</strong>) can fix only a little of the error. But a chain of small trees, each fixing part of what is left, adds up to a strong model. Small trees have high bias and low variance, the exact opposite of the deep trees in the bagging branch, and boosting's job is to remove that bias step by step.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Chasing 250 in an ODI. The openers make 120. The next pair does not start from zero; they work only on the 130 still needed. The pair after them works on whatever is still left. Each pair's job is "what remains", and all their runs add up.</p>
  </div>
  <p>There are two classic ways to tell the next tree "what remains". The first one invented was AdaBoost.</p>
  <h3>AdaBoost: reweight the rows you got wrong</h3>
  <p><strong>AdaBoost</strong> (Adaptive Boosting, 1995) gives every row a weight. The next stump is trained to do well on the <em>weighted</em> rows, so rows the team keeps getting wrong count more and more. Each stump also gets a say in the final vote, called α (alpha): accurate stumps get a bigger say. Tiny worked example: 10 rows on a line, labels +1 / −1, arranged so that no single cut-off gets all of them right.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeClassifier
x = np.arange(1, 11)[:, None]                        # 10 rows, one feature
y = np.array([1, 1, 1, -1, -1, -1, 1, 1, 1, -1])     # +1 / -1 labels: no single cut gets all right
w = np.full(10, 0.1)                                 # every row starts with equal weight
F = np.zeros(10)                                     # running weighted vote
for m in range(1, 4):
    stump = DecisionTreeClassifier(max_depth=1).fit(x, y, sample_weight=w)
    pred = stump.predict(x)
    err = w[pred != y].sum()                         # weighted error of this stump
    alpha = 0.5 * np.log((1 - err) / err)            # its say in the final vote
    w = w * np.exp(-alpha * y * pred); w /= w.sum()  # wrong rows get heavier
    F += alpha * pred
    print(f"stump {m}: x &lt;= {stump.tree_.threshold[0]:.1f}  wrong rows {(np.where(pred != y)[0] + 1).tolist()}  "
          f"err {err:.2f}  alpha {alpha:.2f}")
    print("   weights:", np.round(w, 2).tolist())
print("ensemble right on", int((np.sign(F) == y).sum()), "of 10 rows")</div>
  <div class="fx" data-lang="text">stump 1: x &lt;= 3.5  wrong rows [7, 8, 9]  err 0.30  alpha 0.42
   weights: [0.07, 0.07, 0.07, 0.07, 0.07, 0.07, 0.17, 0.17, 0.17, 0.07]
stump 2: x &lt;= 9.5  wrong rows [4, 5, 6]  err 0.21  alpha 0.65
   weights: [0.05, 0.05, 0.05, 0.17, 0.17, 0.17, 0.11, 0.11, 0.11, 0.05]
stump 3: x &lt;= 6.5  wrong rows [1, 2, 3, 10]  err 0.18  alpha 0.75
   weights: [0.12, 0.12, 0.12, 0.1, 0.1, 0.1, 0.06, 0.06, 0.06, 0.12]
ensemble right on 10 of 10 rows</div>
  <p>Trace it. Stump 1 cuts at 3.5 and gets rows 7, 8, 9 wrong; weighted error 0.30, so α = ½ ln(0.7/0.3) = 0.42. Those three rows' weights jump from 0.07 to 0.17. Stump 2 now cares most about rows 7–9, so it cuts at 9.5 to get them right, and instead misses rows 4–6, whose weights rise in turn. Stump 3 cuts at 6.5. No stump is right on all 10 rows, but their α-weighted vote is right on all 10. The same thing on the churn data:</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import AdaBoostClassifier
for depth, n in [(1, 50), (1, 500), (3, 500), (6, 300)]:
    t0 = time.time()
    ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=depth), n_estimators=n,
                             learning_rate=0.5, random_state=0).fit(Xtr, ytr)
    print(f"AdaBoost depth={depth} trees={n:3d}  train {ada.score(Xtr,ytr):.3f}  val {ada.score(Xva,yva):.3f}  {time.time()-t0:.1f}s")</div>
  <div class="fx" data-lang="text">AdaBoost depth=1 trees= 50  train 0.639  val 0.627  1.3s
AdaBoost depth=1 trees=500  train 0.663  val 0.647  12.1s
AdaBoost depth=3 trees=500  train 0.812  val 0.791  31.7s
AdaBoost depth=6 trees=300  train 0.916  val 0.851  36.6s</div>
  <p>With stumps AdaBoost reaches only 0.647, because a one-question tree cannot express combinations of columns, and this data is full of them. Deeper trees help (0.851 with depth 6), but it is still behind the 0.88 of a random forest and much slower. Remember the 5% of labels we flipped at random when building the data (<code>flip_y=0.05</code>): AdaBoost keeps raising the weight of those mislabeled rows, because it can never get them "right", and so it spends more and more effort chasing noise.</p>
  <div class="callout intu"><span class="label">Formal terms</span>
    <p>Weighted error <strong>err = Σ wᵢ</strong> over wrong rows. Stump weight <strong>α = ½ ln((1 − err)/err)</strong>. Row update <strong>wᵢ ← wᵢ · exp(−α yᵢ h(xᵢ))</strong>, then normalise (yᵢ, h(xᵢ) ∈ {−1, +1}: the weight grows by e^α when wrong, shrinks by e^−α when right). Final model: <strong>sign(Σ αₘ hₘ(x))</strong>. It was later shown that AdaBoost is exactly what you get by greedily minimising the <strong>exponential loss</strong> e^(−y·F(x)). That discovery is the link to the next idea: if AdaBoost is "minimise one particular loss", why not any loss?</p>
  </div>
  <h3>Gradient Boosting: fit the gradient of any loss</h3>
  <p><strong>How it differs from AdaBoost:</strong> instead of reweighting rows, each new tree directly predicts <em>how far off</em> the current model is for each row, and that prediction is added to the model. It works for any loss you can differentiate: squared error for prices, log loss for churn, a custom cost for your business. Tiny worked example: eight flats, size in square metres and price in lakh rupees.</p>
  <ol>
    <li>Start with the dumbest guess for every flat: the average price, 170. The leftover error for each flat is called its <strong>residual</strong> (actual − predicted). The flat at 50 sq m costs 100, so its residual is −70.</li>
    <li>Train a one-question <strong>regression tree</strong> (from section 01) to predict the residuals from size. It learns "size ≤ 95 → about −34, else → about +57".</li>
    <li>Add <em>half</em> of the stump's answer to every prediction. Half, not all, so each step is cautious. That fraction is the <strong>learning rate</strong>.</li>
    <li>Recompute residuals. They are smaller now. Train the next stump on them. Repeat.</li>
  </ol>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
x = np.array([50, 60, 70, 80, 90, 100, 110, 120])[:, None]       # flat size (sq m)
y = np.array([100, 120, 130, 160, 170, 210, 220, 250], float)   # price (₹ lakh)
F = np.full(len(y), y.mean()); lr = 0.5
print("start: predict mean", y.mean(), " MSE", round(((y-F)**2).mean(), 1))
for m in range(1, 4):
    r = y - F                                                     # residuals
    t = DecisionTreeRegressor(max_depth=1).fit(x, r)              # stump on residuals
    F += lr * t.predict(x)
    print(f"tree {m}: split size &lt;= {t.tree_.threshold[0]:.0f}  leaf values "
          f"{t.tree_.value[1:,0,0].round(1)}  MSE {((y-F)**2).mean():.1f}")</div>
  <div class="fx" data-lang="text">start: predict mean 170.0  MSE 2450.0
tree 1: split size &lt;= 95  leaf values [-34.   56.7]  MSE 1005.0
tree 2: split size &lt;= 75  leaf values [-36.3  21.8]  MSE 410.9
tree 3: split size &lt;= 115  leaf values [-5.8 40.8]  MSE 232.9</div>
  <p>MSE (mean squared error, the average of residual²) goes 2450 → 1005 → 411 → 233 in three steps. Each stump splits at a different size, because it is chasing whatever error is left, not the original prices.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<defs><marker id="mt-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="110" height="46" rx="6" class="fs" stroke="currentColor"/><text x="65" y="40" text-anchor="middle" font-size="12">F₀ = mean</text><text x="65" y="57" text-anchor="middle" class="tm" font-size="11">170 for all</text>
<rect x="150" y="20" width="110" height="46" rx="6" class="ft st" fill-opacity="0.25"/><text x="205" y="40" text-anchor="middle" font-size="12">+ 0.5·tree₁</text><text x="205" y="57" text-anchor="middle" class="tm" font-size="11">size ≤ 95?</text>
<rect x="290" y="20" width="110" height="46" rx="6" class="ft st" fill-opacity="0.25"/><text x="345" y="40" text-anchor="middle" font-size="12">+ 0.5·tree₂</text><text x="345" y="57" text-anchor="middle" class="tm" font-size="11">size ≤ 75?</text>
<rect x="430" y="20" width="110" height="46" rx="6" class="ft st" fill-opacity="0.25"/><text x="485" y="40" text-anchor="middle" font-size="12">+ 0.5·tree₃</text><text x="485" y="57" text-anchor="middle" class="tm" font-size="11">size ≤ 115?</text>
<line x1="120" y1="43" x2="148" y2="43" stroke="currentColor" marker-end="url(#mt-ah3)"/><line x1="260" y1="43" x2="288" y2="43" stroke="currentColor" marker-end="url(#mt-ah3)"/><line x1="400" y1="43" x2="428" y2="43" stroke="currentColor" marker-end="url(#mt-ah3)"/>
<text x="135" y="14" text-anchor="middle" class="tm" font-size="10">fit residuals</text><text x="275" y="14" text-anchor="middle" class="tm" font-size="10">fit residuals</text><text x="415" y="14" text-anchor="middle" class="tm" font-size="10">fit residuals</text>
<line x1="10" y1="180" x2="550" y2="180" stroke="currentColor"/>
<rect x="40" y="90" width="50" height="90" class="fr sr" fill-opacity="0.5"/><rect x="180" y="143" width="50" height="37" class="fr sr" fill-opacity="0.5"/><rect x="320" y="165" width="50" height="15" class="fr sr" fill-opacity="0.5"/><rect x="460" y="171" width="50" height="9" class="fr sr" fill-opacity="0.5"/>
<text x="65" y="86" text-anchor="middle" font-size="12">MSE 2450</text><text x="205" y="139" text-anchor="middle" font-size="12">1005</text><text x="345" y="161" text-anchor="middle" font-size="12">411</text><text x="485" y="167" text-anchor="middle" font-size="12">233</text>
<text x="280" y="197" text-anchor="middle" class="tm" font-size="11">training error after each step (8 flat prices, depth-1 trees, learning rate 0.5)</text>
</svg><figcaption>Each new small tree is trained on what the model still gets wrong; adding a shrunken copy of it chips the error down.</figcaption></figure>
  <p>Top row: the model is the starting guess plus a shrunken copy of each stump. Bottom row: the red bars are the training error after each step, shrinking every time.</p>
  <div class="callout intu"><span class="label">Formal terms</span>
    <p><strong>F_m(x) = F_{m−1}(x) + η · h_m(x)</strong>. F_m is the whole model after m trees, F_{m−1} is the model before this step, h_m is the new small tree, η (eta) is the learning rate (0.5 above, usually 0.01–0.1). <strong>Gradient</strong> boosting means h_m is trained on the negative gradient of the loss, −∂L/∂F: "which way, and how much, should each prediction move to reduce the loss fastest?" For squared error that direction is exactly the residual y − F, which is why the demo says "fit the residuals". For other losses (log loss for classification, MAE, a custom one) the targets are called <strong>pseudo-residuals</strong>, but the loop is the same. This is gradient descent from <a class="xref" data-note="m_optimization">Optimization</a>, except each step moves the model's predictions instead of a weight vector. With exponential loss and classification, it gives back AdaBoost.</p>
  </div>
  <p>On the churn data, sklearn's plain <code>GradientBoostingClassifier</code> with 300 depth-3 trees scores 0.836 test accuracy and takes about 15 seconds (full run in section 06). Better than AdaBoost, but still behind the forest, and slow.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A forest cannot overfit by adding trees; it just averages more. Boosting can, because each new tree keeps chasing the remaining error, and after a point the remaining error is noise. Boosting always needs a stop signal (early stopping, section 06).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Plain gradient boosting is the right idea with weak engineering: it tries every cut-off on every column (slow), it has no penalty on how big a leaf's value may get (easy to overfit), and it needs you to turn text categories into numbers yourself. Three libraries fixed these problems, each in its own way.</div>

  <h2 id="mt-gbm"><span class="num">06</span>XGBoost, LightGBM, CatBoost</h2>
  <div class="where"><span>Tree-Based Models</span><span>Ensembles</span><span>Boosting</span><span>Gradient Boosting</span><span>XGBoost · LightGBM · CatBoost</span></div>
  <p>Why they exist: all three run exactly the gradient boosting loop from section 05. They are not new families; they are engineered versions of the same idea, built for speed and safety on real data. They win most table-data competitions and run in most banks and e-commerce companies. Their accuracy is usually close, so the useful knowledge is what each one added on top of the one before it.</p>
  <h3>XGBoost (2014): better steps and brakes</h3>
  <p><strong>What it adds to plain gradient boosting:</strong> three things.</p>
  <ul>
    <li><strong>Second-order steps.</strong> Plain gradient boosting only knows which way the loss slopes (the gradient). XGBoost also uses how sharply the loss curves there (the <strong>Hessian</strong>, the second derivative). Where the loss curves sharply it takes a smaller step. Better steps mean fewer trees for the same accuracy.</li>
    <li><strong>Regularisation built into the tree.</strong> A penalty λ shrinks every leaf's value toward 0, and a price γ must be paid for every new leaf. The tree's split search itself includes these penalties.</li>
    <li><strong>Sparsity handling.</strong> Missing values and zeros in sparse data are not imputed: at each split XGBoost learns a default direction (left or right) for rows where the value is missing.</li>
  </ul>
  <p>The leaf value formula shows the brakes at work. For squared error, every row's gradient is (prediction − truth) and every Hessian is 1. A leaf holds four rows with residuals −70, −50, −40, −10:</p>
  <div class="fx" data-lang="py">import numpy as np
# squared error: gradient g = F - y (prediction minus truth), Hessian h = 1 for every row
residuals = np.array([-70., -50., -40., -10.])     # y - F for the 4 rows in one leaf
G, H = (-residuals).sum(), len(residuals)          # sum of gradients, sum of Hessians
for lam in [0, 4, 20]:
    print(f"lambda={lam:2d}  leaf value w* = -G/(H+lambda) = {-G/(H+lam):6.2f}")</div>
  <div class="fx" data-lang="text">lambda= 0  leaf value w* = -G/(H+lambda) = -42.50
lambda= 4  leaf value w* = -G/(H+lambda) = -21.25
lambda=20  leaf value w* = -G/(H+lambda) =  -7.08</div>
  <p>With λ = 0 the leaf predicts the plain average residual, −42.5, which is what plain gradient boosting would do. With λ = 4 it predicts only half of that, and with λ = 20 just −7. A leaf holding few rows is pulled hard toward zero; a leaf holding thousands of rows barely notices λ. That is exactly the behaviour you want: do not trust a correction learnt from four customers.</p>
  <div class="callout intu"><span class="label">Formal terms (XGBoost)</span>
    <p>Best leaf value <strong>w* = −G / (H + λ)</strong>: G is the sum of gradients of the rows in the leaf (total "how far off, and which way"), H the sum of their Hessians (total curvature), λ (lambda) the L2 penalty. <strong>Split gain = ½[G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ)] − γ</strong>: how much the loss improves by splitting a leaf into left (L) and right (R), minus γ (gamma), the fixed price of a new leaf. Both formulas come from a second-order Taylor expansion of the loss (see <a class="xref" data-note="m_calculus">Calculus</a> for Taylor series and the Hessian). Trees grow <strong>level-wise</strong>: every node at one depth is split before going deeper, limited by <code>max_depth</code>.</p>
  </div>
  <h3>LightGBM (2017): the same, much faster</h3>
  <p><strong>What it adds to XGBoost:</strong> speed on big data, through four tricks.</p>
  <ul>
    <li><strong>Histogram bins.</strong> Instead of trying every one of 20,000 cut-offs on a column, it groups values into at most 255 buckets once, and tries only the bucket edges. Much faster, almost no loss. (XGBoost later added the same trick as <code>tree_method="hist"</code>, now its default.)</li>
    <li><strong>Leaf-wise growth.</strong> Instead of filling a whole level, it always splits the one leaf, anywhere in the tree, that reduces the loss most (picture below). Lower loss for the same number of leaves; the size limit is <code>num_leaves</code>.</li>
    <li><strong>GOSS</strong> (Gradient-based One-Side Sampling). Rows with large gradients are the ones the model still gets badly wrong; GOSS keeps all of them and only a random sample of the well-fitted rows, so each tree is computed on fewer rows.</li>
    <li><strong>EFB</strong> (Exclusive Feature Bundling). Sparse columns that are almost never non-zero at the same time (for example, one-hot columns) are packed into one column, so there are fewer columns to scan.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 520 140" width="520">
<g stroke="currentColor"><line x1="120" y1="25" x2="70" y2="65"/><line x1="120" y1="25" x2="170" y2="65"/><line x1="70" y1="65" x2="45" y2="105"/><line x1="70" y1="65" x2="95" y2="105"/><line x1="170" y1="65" x2="145" y2="105"/><line x1="170" y1="65" x2="195" y2="105"/>
<line x1="380" y1="25" x2="330" y2="55"/><line x1="380" y1="25" x2="430" y2="55"/><line x1="430" y1="55" x2="400" y2="85"/><line x1="430" y1="55" x2="460" y2="85"/><line x1="460" y1="85" x2="440" y2="115"/><line x1="460" y1="85" x2="485" y2="115"/></g>
<g class="fb sb"><circle cx="120" cy="25" r="7"/><circle cx="70" cy="65" r="7"/><circle cx="170" cy="65" r="7"/><circle cx="45" cy="105" r="7"/><circle cx="95" cy="105" r="7"/><circle cx="145" cy="105" r="7"/><circle cx="195" cy="105" r="7"/></g>
<g class="ft st"><circle cx="380" cy="25" r="7"/><circle cx="330" cy="55" r="7"/><circle cx="430" cy="55" r="7"/><circle cx="400" cy="85" r="7"/><circle cx="460" cy="85" r="7"/><circle cx="440" cy="115" r="7"/><circle cx="485" cy="115" r="7"/></g>
<text x="120" y="134" text-anchor="middle" font-size="12">level-wise (XGBoost)</text>
<text x="400" y="134" text-anchor="middle" font-size="12">leaf-wise (LightGBM)</text>
</svg><figcaption>Same number of nodes; leaf-wise goes deep where the loss drops most. Lower loss per leaf, more overfitting risk on small data.</figcaption></figure>
  <p>Both trees have seven nodes. The left one fills each level fully before going deeper. The right one keeps splitting whichever leaf reduces the loss most, so it grows deep on one side. On small data that deep branch can chase noise.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>LightGBM's leaf-wise growth overfits small datasets (a few thousand rows). Cap <code>num_leaves</code> (try 15–31), raise <code>min_child_samples</code> so a leaf must hold enough rows, or set <code>max_depth</code> as well.</p>
  </div>
  <h3>CatBoost (2017): categories without leakage</h3>
  <p><strong>What it adds to LightGBM:</strong> correctness with text categories, and good results without tuning. Columns like "city" or "plan name" must become numbers. A popular way is <strong>target encoding</strong>: replace "Pune" by the average churn rate of Pune customers. The trap is that the average includes the row's own answer. A city with one customer gets exactly that customer's label, so the feature secretly contains the answer. CatBoost's <strong>ordered target statistics</strong> compute each row's number only from rows that came before it in a random order:</p>
  <div class="fx" data-lang="py">import pandas as pd
df = pd.DataFrame({"city":  ["Pune", "Pune", "Delhi", "Pune", "Delhi", "Goa"],
                   "churn": [1,      0,      1,       1,      0,       1]})
# naive target encoding: mean churn of the city, using ALL rows (including the row itself)
df["naive"] = df.groupby("city")["churn"].transform("mean").round(2)
# ordered target statistic: use only rows ABOVE this one; prior 0.5 counts as one extra row
prior = 0.5
seen_sum = df.groupby("city")["churn"].cumsum() - df["churn"]    # churn total of earlier same-city rows
seen_cnt = df.groupby("city").cumcount()                          # how many earlier same-city rows
df["ordered"] = ((seen_sum + prior) / (seen_cnt + 1)).round(2)
print(df)</div>
  <div class="fx" data-lang="text">    city  churn  naive  ordered
0   Pune      1   0.67     0.50
1   Pune      0   0.67     0.75
2  Delhi      1   0.50     0.50
3   Pune      1   0.67     0.50
4  Delhi      0   0.50     0.75
5    Goa      1   1.00     0.50</div>
  <p>Look at Goa: only one customer, who churned. The naive encoding gives 1.00, which is that customer's own label: a model would learn "1.00 means churn" and fail on new Goa customers. The ordered value is 0.50: just the prior, because no earlier Goa row exists. Pune's first row gets 0.50 (nothing seen yet), its second row 0.75 (one earlier churner, plus the prior), and so on. No row ever sees its own label. CatBoost applies the same idea to the boosting itself (<strong>ordered boosting</strong>): a row's residual is computed by a model that was not trained on that row. It also grows <strong>symmetric (oblivious) trees</strong>: every node at one depth asks the same question, which makes trees regular, fast to predict and less prone to overfit.</p>
  <h3>Early stopping: when to stop adding trees</h3>
  <p>Before comparing the three, one rule they all share. Section 05 warned that boosting overfits if it runs too long. <strong>Early stopping</strong>: after every new tree, check the loss on a validation set; if it has not improved for N trees in a row, stop and keep the best round. The run below lets LightGBM build 3,000 trees with no stop, and records the loss after every tree.</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
m = lgb.LGBMClassifier(n_estimators=3000, learning_rate=0.1, num_leaves=63, verbose=-1)
m.fit(Xtr, ytr, eval_X=(Xtr, Xva), eval_y=(ytr, yva), eval_names=["train", "val"])
tr = m.evals_result_["train"]["binary_logloss"]                  # loss per round
va = m.evals_result_["val"]["binary_logloss"]
best = int(np.argmin(va)) + 1
for r in [10, 50, 100, best, 500, 1000, 3000]:
    print(f"round {r:4d}  train logloss {tr[r-1]:.3f}  val logloss {va[r-1]:.3f}")
print("best round (min val loss):", best)
np.save("es_curves.npy", np.array([tr, va]))</div>
  <div class="fx" data-lang="text">round   10  train logloss 0.449  val logloss 0.464
round   50  train logloss 0.250  val logloss 0.332
round  100  train logloss 0.173  val logloss 0.317
round  204  train logloss 0.086  val logloss 0.308
round  500  train logloss 0.013  val logloss 0.347
round 1000  train logloss 0.000  val logloss 0.465
round 3000  train logloss 0.000  val logloss 0.752
best round (min val loss): 204</div>
  <figure class="viz"><svg viewBox="0 0 560 235" width="560">
<line x1="50" y1="200" x2="515" y2="200" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="200" stroke="currentColor"/>
<text x="44" y="204" text-anchor="end" class="tm" font-size="11">0</text><text x="44" y="152" text-anchor="end" class="tm" font-size="11">0.2</text><text x="44" y="101" text-anchor="end" class="tm" font-size="11">0.4</text><text x="44" y="50" text-anchor="end" class="tm" font-size="11">0.6</text>
<text x="50" y="216" text-anchor="middle" class="tm" font-size="11">1</text><text x="234" y="216" text-anchor="middle" class="tm" font-size="11">400</text><text x="418" y="216" text-anchor="middle" class="tm" font-size="11">800</text><text x="510" y="216" text-anchor="middle" class="tm" font-size="11">1000</text>
<text x="280" y="232" text-anchor="middle" class="tm" font-size="12">boosting round (LightGBM, lr 0.1, 63 leaves)</text>
<polyline points="50,32 51,56 53,72 54,84 56,94 57,101 58,107 60,112 61,116 62,119 64,123 68,131 73,136 78,141 82,145 87,149 91,153 96,156 110,164 124,171 137,176 143,178 151,180 165,183 179,186 193,189 207,191 220,192 234,194 248,195 262,196 276,197 289,197 303,198 317,198 331,198 345,199 359,199 372,199 386,199 400,199 414,200 428,200 441,200 455,200 469,200 483,200 497,200 510,200" fill="none" class="sb" stroke-width="2"/>
<polyline points="50,32 51,55 53,70 54,81 56,89 57,95 58,100 60,103 61,106 62,108 64,110 68,114 73,115 78,116 82,116 87,117 91,118 96,118 110,119 124,120 137,120 143,121 151,121 165,120 179,119 193,119 207,118 220,116 234,115 248,113 262,113 276,111 289,110 303,109 317,107 331,105 345,104 359,102 372,100 386,98 400,97 414,95 428,93 441,90 455,89 469,87 483,85 497,83 510,80" fill="none" class="sr" stroke-width="2"/>
<line x1="143" y1="25" x2="143" y2="200" class="sg" stroke-dasharray="4 3" stroke-width="2"/>
<text x="150" y="40" class="tg" font-size="12">best round 204: val 0.308</text>
<text x="400" y="72" class="tr" font-size="12">validation ↑ 0.465</text>
<text x="400" y="190" class="tb" font-size="12">train → 0.000</text>
<text x="56" y="30" class="tm" font-size="11">log loss</text>
</svg><figcaption>Training loss keeps falling; validation loss bottoms out at round 204 and then climbs as the model fits noise.</figcaption></figure>
  <p>Blue (train log loss) keeps falling to zero. Red (validation log loss, a score for predicted probabilities where lower is better) bottoms out at round 204 at 0.308 and then climbs; by round 3,000 it is 0.752, far worse. The green line marks where early stopping would stop. In practice you pass <code>callbacks=[lgb.early_stopping(50)]</code> (LightGBM) or <code>early_stopping_rounds=50</code> (XGBoost, CatBoost), which stops about 50 rounds after the best one; the runs below do exactly that.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Revising for boards with mock tests. After a point, re-reading the same guide raises your score on that guide but not on new papers. Stop when the mock-test score stops going up.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The validation set used for early stopping is now part of choosing the model, so its score is a little optimistic. Report the final number on a separate test set (as the next run does). For the final fit on all the data, reuse the best round count, scaled up a little for the extra rows.</p>
  </div>
  <h3>Head-to-head on the churn data</h3>
  <p>Every member of the family met so far, on the same 5,000 test rows. The boosters use learning rate 0.05, early stopping on the validation set, and otherwise mostly defaults.</p>
  <div class="fx" data-lang="py">import xgboost as xgb, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.ensemble import GradientBoostingClassifier, HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
def report(name, m, trees, t0):
    p = m.predict_proba(Xte)[:, 1]
    print(f"{name:34s} test acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.3f}  "
          f"trees {trees:4d}  {time.time()-t0:.1f}s")
t0 = time.time(); m = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0).fit(Xtr, ytr)
report("Random forest (300)", m, 300, t0)
t0 = time.time(); m = GradientBoostingClassifier(n_estimators=300, max_depth=3, random_state=0).fit(Xtr, ytr)
report("sklearn GradientBoosting (no ES)", m, 300, t0)
t0 = time.time()
m = HistGradientBoostingClassifier(max_iter=2000, learning_rate=0.05, early_stopping=True,
                                   validation_fraction=0.2, n_iter_no_change=50, random_state=0).fit(Xtr, ytr)
report("HistGradientBoosting (ES)", m, m.n_iter_, t0)
t0 = time.time()
m = xgb.XGBClassifier(n_estimators=2000, learning_rate=0.05, max_depth=6, subsample=0.8,
                      colsample_bytree=0.8, early_stopping_rounds=50, eval_metric="logloss")
m.fit(Xtr, ytr, eval_set=[(Xva, yva)], verbose=False)
report("XGBoost (ES)", m, m.best_iteration + 1, t0)
t0 = time.time()
m = lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.05, num_leaves=31, subsample=0.8,
                       subsample_freq=1, colsample_bytree=0.8, verbose=-1)
m.fit(Xtr, ytr, eval_X=Xva, eval_y=yva, callbacks=[lgb.early_stopping(50, verbose=False)])
report("LightGBM (ES)", m, m.best_iteration_, t0)
t0 = time.time()
m = CatBoostClassifier(iterations=2000, learning_rate=0.05, depth=6, early_stopping_rounds=50, verbose=False)
m.fit(Xtr, ytr, eval_set=(Xva, yva))
report("CatBoost (ES)", m, m.get_best_iteration() + 1, t0)
t0 = time.time(); m = CatBoostClassifier(iterations=500, verbose=False).fit(Xtr, ytr)
report("CatBoost, pure defaults (500)", m, 500, t0)</div>
  <div class="fx" data-lang="text">Random forest (300)                test acc 0.877  AUC 0.936  trees  300  2.7s
sklearn GradientBoosting (no ES)   test acc 0.836  AUC 0.908  trees  300  15.1s
HistGradientBoosting (ES)          test acc 0.867  AUC 0.934  trees  487  1.4s
XGBoost (ES)                       test acc 0.872  AUC 0.935  trees  441  1.0s
LightGBM (ES)                      test acc 0.874  AUC 0.937  trees  483  0.7s
CatBoost (ES)                      test acc 0.873  AUC 0.938  trees  822  2.9s
CatBoost, pure defaults (500)      test acc 0.872  AUC 0.937  trees  500  1.5s</div>
  <p>All three libraries land within 0.003 AUC of each other, and the random forest ties them on this data. The histogram-based learners (HistGradientBoosting, sklearn's LightGBM-inspired version, XGBoost and LightGBM) are 10–20× faster than classic sklearn GradientBoosting and 3–4 points more accurate, because early stopping let them use the right number of trees. CatBoost with no tuning at all is already as good as the others. The lesson for real work: good features and a correct validation setup matter far more than which library you pick. (xgboost 3.4.1, lightgbm 4.7.0, catboost 1.2.10, scikit-learn 1.9.1; 4 threads on a shared machine, so times vary run to run.)</p>
  <h3>Tuning the knobs</h3>
  <p>A <strong>hyperparameter</strong> is a setting you choose before training starts: how deep a tree may go, how big the learning rate is, how many trees to build. The model cannot learn these from the data. Defaults are decent, but on most problems the right tree size and learning rate add a few points. Tune a few knobs in a fixed order; do not turn everything at once.</p>
  <table class="tbl">
    <tr><th>Knob</th><th>XGBoost / LightGBM / CatBoost</th><th>Effect</th><th>Typical</th></tr>
    <tr><td>Learning rate</td><td><code>learning_rate</code></td><td>Smaller = more trees, usually better</td><td>0.01–0.1</td></tr>
    <tr><td>Number of trees</td><td><code>n_estimators</code> / <code>iterations</code></td><td>Set high; let early stopping choose</td><td>1000–5000</td></tr>
    <tr><td>Tree size</td><td><code>max_depth</code> / <code>num_leaves</code> / <code>depth</code></td><td>How many columns a tree can combine; main complexity knob</td><td>depth 4–8, leaves 15–127</td></tr>
    <tr><td>Leaf size</td><td><code>min_child_weight</code> / <code>min_child_samples</code></td><td>Bigger = smoother, less overfit</td><td>5–100</td></tr>
    <tr><td>Row / column sampling</td><td><code>subsample</code>, <code>colsample_bytree</code></td><td>Randomness borrowed from the bagging branch; makes trees less alike</td><td>0.6–0.9</td></tr>
    <tr><td>Regularisation</td><td><code>reg_lambda</code>, <code>reg_alpha</code>, <code>gamma</code> / <code>l2_leaf_reg</code></td><td>Shrink leaf values; minimum gain to split</td><td>0–10</td></tr>
  </table>
  <div class="flow"><span>lr 0.05 + early stopping</span><span>depth / num_leaves</span><span>min_child_*</span><span>subsample / colsample</span><span>reg_lambda / alpha</span><span>lower lr, retrain</span></div>
  <p>Note the row "Row / column sampling": boosting borrowed the random forest's trick. The branches of the family tree are not sealed off from each other. The two knobs that matter most are the learning rate and the tree size. The runs below change one at a time on LightGBM:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
def fit(**kw):
    m = lgb.LGBMClassifier(n_estimators=5000, verbose=-1, **kw)
    m.fit(Xtr, ytr, eval_X=Xva, eval_y=yva, callbacks=[lgb.early_stopping(100, verbose=False)])
    return m
for lr in [0.3, 0.1, 0.03]:
    m = fit(learning_rate=lr, num_leaves=31)
    print(f"lr={lr:&lt;5} best trees {m.best_iteration_:5d}  test acc {m.score(Xte, yte):.3f}")
for nl in [4, 15, 63, 255]:
    m = fit(learning_rate=0.05, num_leaves=nl)
    print(f"num_leaves={nl:&lt;4d} best trees {m.best_iteration_:5d}  train acc {m.score(Xtr, ytr):.3f}  test acc {m.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">lr=0.3   best trees    68  test acc 0.851
lr=0.1   best trees   216  test acc 0.869
lr=0.03  best trees  1154  test acc 0.874
num_leaves=4    best trees  3476  train acc 0.913  test acc 0.851
num_leaves=15   best trees  1116  train acc 0.966  test acc 0.864
num_leaves=63   best trees   418  train acc 0.996  test acc 0.877
num_leaves=255  best trees   124  train acc 1.000  test acc 0.873</div>
  <p>Learning rate: a smaller step needs more trees. Going from 0.3 to 0.03 (10× smaller) needed about 17× more trees and gained 2.3 points. Tree size: with only 4 leaves each tree can combine at most a few columns, so it misses interactions and scores 0.851. With 255 leaves each tree memorises fast (train accuracy 1.000) and test accuracy slips. Around 63 leaves is the sweet spot here.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Learning rate is step size when walking down a hill in fog. Big steps get you down fast but you overshoot the bottom. Small steps take longer but land closer. Early stopping tells you when to stop walking.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not grid-search the learning rate together with everything else; it interacts with every other knob and multiplies the search. Fix it at about 0.05, tune the rest with random search or Optuna on a validation set (or CV), then lower it for the final model.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We now have strong members from both branches: a random forest at 0.877 and boosters at 0.872–0.874. They were built in completely different ways, so they probably make different mistakes. Can we combine <em>them</em>?</div>

  <h2 id="mt-stack"><span class="num">07</span>Stacking &amp; Voting: Blending Different Families</h2>
  <div class="where"><span>Tree-Based Models</span><span>Ensembles</span><span>Stacking &amp; Voting</span></div>
  <p>Why it exists: bagging combines copies of one kind of model, and boosting chains copies of one kind of model. The third child of "Ensembles" combines <em>different kinds</em>. A random forest and a booster were trained in opposite ways (parallel deep trees vs sequential small trees), so their mistakes overlap less than two forests' would. That is the ensemble rule from section 03, applied one level up.</p>
  <ul>
    <li><strong>Voting</strong>: average the predicted probabilities of the members (soft voting) or take the majority class (hard voting). No learning involved.</li>
    <li><strong>Stacking</strong>: train a small second-level model (often logistic regression) whose inputs are the members' predictions. It learns how much to trust each member. To avoid leakage, the members' predictions it learns from are <strong>out-of-fold</strong>: each row's prediction comes from a copy of the member that did not train on that row (cross-validation, <code>cv=5</code> below).</li>
  </ul>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.ensemble import ExtraTreesClassifier, VotingClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
base = [("rf",  RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
        ("et",  ExtraTreesClassifier(n_estimators=300, n_jobs=-1, random_state=0)),
        ("lgb", lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1))]
models = dict(base)
models["soft vote (average)"] = VotingClassifier(base, voting="soft")
models["stacking (+ logistic)"] = StackingClassifier(base, final_estimator=LogisticRegression(), cv=5)
for name, m in models.items():
    p = m.fit(Xtr, ytr).predict_proba(Xte)[:, 1]
    print(f"{name:22s} test acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.4f}")
print("stacking weights (rf, et, lgb):", models["stacking (+ logistic)"].final_estimator_.coef_.round(2))</div>
  <div class="fx" data-lang="text">rf                     test acc 0.877  AUC 0.9364
et                     test acc 0.869  AUC 0.9347
lgb                    test acc 0.874  AUC 0.9368
soft vote (average)    test acc 0.878  AUC 0.9397
stacking (+ logistic)  test acc 0.878  AUC 0.9396
stacking weights (rf, et, lgb): [[2.69 3.37 2.6 ]]</div>
  <p>The members alone reach AUC 0.9347–0.9368. Simply averaging their probabilities gives 0.9397, higher than every member. Stacking gives the same here, and its learnt weights (2.69, 3.37, 2.60) show it trusts all three about equally, so plain averaging was already near the best blend. The gain is real but small: about +0.003 AUC for running three models instead of one. (The LightGBM member uses 480 trees, about the count early stopping chose in section 06.)</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hospital board: a radiologist, a pathologist and a physician each give a diagnosis. Voting takes the average opinion. Stacking is the senior doctor who has learnt over years that the radiologist is right more often on fractures and the pathologist on infections.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never train the stacking model on predictions the members made on their own training rows. Those predictions are near perfect (a forest scores 1.000 on its training rows), so the meta-model learns "trust the forest completely" and fails on new data. Use out-of-fold predictions, which <code>StackingClassifier</code> does for you.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We now have the whole family. Before using it, we need a clear side-by-side view of the siblings: which one to try first and when each one is the right tool.</div>

  <h2 id="mt-cmp"><span class="num">08</span>Comparing the Family</h2>
  <div class="where"><span>Tree-Based Models</span><span>Comparing the Family</span></div>
  <p>Why it exists: the family tree shows how the models are related; this section shows how they differ in use. Each table compares siblings that share a parent.</p>
  <h3>Bagging vs boosting (the two big branches)</h3>
  <table class="tbl">
    <tr><th></th><th>Bagging branch (RF, Extra Trees)</th><th>Boosting branch (AdaBoost, GBM, XGB, LGBM, CatBoost)</th></tr>
    <tr><td>Trees built</td><td>Independently, in parallel</td><td>Sequentially, each on the last ones' errors</td></tr>
    <tr><td>Each tree</td><td>Deep, low bias, high variance</td><td>Shallow (depth 3–8), weak learner</td></tr>
    <tr><td>Mainly reduces</td><td>Variance</td><td>Bias (and variance via shrinkage, subsampling)</td></tr>
    <tr><td>Too many trees</td><td>Harmless, just slower</td><td>Overfits → needs early stopping</td></tr>
    <tr><td>Noisy labels</td><td>Robust (averaging)</td><td>Can chase noise (AdaBoost most)</td></tr>
    <tr><td>Tuning effort</td><td>Low</td><td>Moderate–high</td></tr>
    <tr><td>On our data (test)</td><td>RF 0.877 acc, 0.936 AUC</td><td>LightGBM 0.874 acc, 0.937 AUC</td></tr>
  </table>
  <h3>Inside the bagging branch</h3>
  <table class="tbl">
    <tr><th></th><th>Bagging</th><th>Random Forest</th><th>Extra Trees</th></tr>
    <tr><td>Rows per tree</td><td>Bootstrap</td><td>Bootstrap</td><td>All rows (default)</td></tr>
    <tr><td>Columns per split</td><td>All</td><td>Random √d</td><td>Random √d</td></tr>
    <tr><td>Cut-off per column</td><td>Best</td><td>Best</td><td>Random</td></tr>
    <tr><td>Two trees agree (ours)</td><td>73%</td><td>68%</td><td>64%</td></tr>
    <tr><td>Val accuracy / fit time (ours)</td><td>0.883 / 11.4 s</td><td>0.879 / 2.7 s</td><td>0.878 / 1.4 s</td></tr>
  </table>
  <h3>Inside the boosting branch</h3>
  <table class="tbl">
    <tr><th></th><th>AdaBoost</th><th>Gradient Boosting</th><th>XGBoost</th><th>LightGBM</th><th>CatBoost</th></tr>
    <tr><td>Focus on mistakes by</td><td>Reweighting rows</td><td>Fitting the gradient</td><td>Gradient + Hessian</td><td>Gradient + Hessian</td><td>Gradient + Hessian, ordered</td></tr>
    <tr><td>Key addition</td><td>The first booster</td><td>Any differentiable loss</td><td>λ, γ penalties; missing-value direction</td><td>Histograms, GOSS, EFB</td><td>Ordered target stats, ordered boosting</td></tr>
    <tr><td>Tree growth</td><td>Usually stumps</td><td>Level / depth limit</td><td>Level-wise, <code>max_depth</code></td><td>Leaf-wise, <code>num_leaves</code></td><td>Symmetric (oblivious)</td></tr>
    <tr><td>Categoricals</td><td>Encode yourself</td><td>Encode yourself</td><td>Native (<code>enable_categorical</code>) or encode</td><td>Native (<code>categorical_feature</code>)</td><td>Best-in-class, native</td></tr>
    <tr><td>Strength</td><td>Simple, historic</td><td>Clear reference version</td><td>Mature, robust, GPU, everywhere</td><td>Fastest on large data, low memory</td><td>Great defaults, many categoricals, small data</td></tr>
    <tr><td>Watch out</td><td>Noisy labels</td><td>Slow, no ES by default</td><td>A bit slower than LightGBM on big data</td><td>Leaf-wise overfits small data</td><td>Slower per tree</td></tr>
  </table>
  <h3>Which one when</h3>
  <ol>
    <li><strong>Need to explain every rule to a regulator or a non-technical team?</strong> A single pruned decision tree (accept lower accuracy).</li>
    <li><strong>First model on any new table?</strong> Random forest: fast, almost no tuning, hard to break. It is your baseline.</li>
    <li><strong>Want the best accuracy on a large, clean table?</strong> LightGBM or XGBoost with early stopping, then tune tree size and learning rate.</li>
    <li><strong>Many text categories (city, product, plan) or small data, little time to tune?</strong> CatBoost.</li>
    <li><strong>Very noisy labels?</strong> Random forest or Extra Trees; avoid AdaBoost.</li>
    <li><strong>Need the fastest training on many columns?</strong> Extra Trees (bagging branch) or LightGBM (boosting branch).</li>
    <li><strong>Competition, or the last 0.3% matters?</strong> Average or stack a forest and one or two boosters.</li>
    <li><strong>If boosting does not clearly beat the forest on validation</strong> (here it did not: 0.874 vs 0.877), keep the simpler forest.</li>
  </ol>
  <div class="bridge"><b>What's still missing?</b> A single tree could be read aloud. A forest of 300 trees or a booster of 500 cannot. Before anyone trusts these models, they will ask "what is it looking at?" The next section gives that answer back.</div>

  <h2 id="mt-imp"><span class="num">09</span>Opening the Box: Feature Importance</h2>
  <div class="where"><span>Tree-Based Models</span><span>Using the family</span><span>Feature importance</span></div>
  <p>Why it exists: the ensembles bought accuracy by giving up the one thing a single tree did well, being readable. After the churn model is built, the business team asks: "So what makes customers leave?" You also want to know which of your 14 columns are doing nothing, so you can drop them. <strong>Feature importance</strong> is a score per column saying how much the model leans on it. There are three common ways, and on this data the first two disagree badly.</p>
  <div class="cards">
    <div><b>Impurity importance (MDI)</b><p>Add up how much impurity each column removed across all splits in all trees. Free: it comes out of training.</p><small><code>rf.feature_importances_</code>; "gain" in XGBoost/LightGBM</small></div>
    <div><b>Permutation importance</b><p>Take validation rows, shuffle one column so it becomes nonsense, and see how far the score falls. A big fall means the model really needs that column.</p><small><code>permutation_importance</code></small></div>
  </div>
  <div class="fx" data-lang="py">from sklearn.inspection import permutation_importance
rf = RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=0).fit(Xtr, ytr)
perm = permutation_importance(rf, Xva, yva, n_repeats=5, random_state=0, n_jobs=-1)
df = pd.DataFrame({"impurity (MDI)": rf.feature_importances_,
                   "permutation (val)": perm.importances_mean}, index=Xtr.columns)
df["MDI rank"] = df["impurity (MDI)"].rank(ascending=False).astype(int)
df["perm rank"] = df["permutation (val)"].rank(ascending=False).astype(int)
print(df.sort_values("impurity (MDI)", ascending=False).round(3))</div>
  <div class="fx" data-lang="text">            impurity (MDI)  permutation (val)  MDI rank  perm rank
f5                   0.139              0.193         1          1
f8                   0.113              0.106         2          2
f9                   0.099              0.072         3          3
f4                   0.099              0.064         4          5
f6                   0.094              0.061         5          6
f2                   0.093              0.051         6          8
f7                   0.089              0.070         7          4
f3                   0.089              0.060         8          7
f10                  0.037              0.001         9         11
f11                  0.037              0.000        10         14
row_noise            0.036              0.004        11          9
f0                   0.035              0.001        12         12
f1                   0.035              0.001        13         10
coin_noise           0.005              0.001        14         13</div>
  <p>Look at <code>row_noise</code> and <code>coin_noise</code>. Both are pure random numbers: neither can tell churners from stayers. Yet impurity importance gives <code>row_noise</code> 0.036, about the same as the weak real columns, and 7× more than <code>coin_noise</code> (0.005). Permutation importance puts both near zero, which is the truth.</p>
  <div class="callout trap"><span class="label">Trap: the cardinality bias</span>
    <p>A column with many distinct values (<code>row_noise</code> has 20,000) offers the tree 20,000 cut-offs to try. With that many tries, some cut-off will separate the training rows a little by pure luck, and impurity importance counts that luck as skill. A 0/1 column offers one cut-off and no luck. This is why a customer-ID-like column often shows up as "important". Never report raw impurity importance as "what drives churn" without checking it with permutation importance on validation data.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Permutation importance is like testing a cricket team by removing one player at a time and seeing how badly the team does without him. Impurity importance is like counting how many balls each player touched during practice: a player who touched many balls may still not matter in a match.</p>
  </div>
  <p><strong>SHAP</strong> goes one step further: for a single prediction, it says how much each column pushed the answer up or down, and the pushes add up exactly to the model's output. Use it when someone asks "why did the model flag <em>this</em> customer?" For tree models it is fast (<code>TreeExplainer</code>). Here it explains the LightGBM model from section 06:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb, shap
m = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1).fit(Xtr, ytr)
ex = shap.TreeExplainer(m)(Xva)                      # one SHAP value per (row, column), in log-odds
glob = pd.Series(np.abs(ex.values).mean(0), index=Xva.columns).sort_values(ascending=False)
print("mean |SHAP|:", glob.round(3)[["f5", "f8", "f11", "row_noise", "coin_noise"]].to_dict())
c = pd.Series(ex.values[0], index=Xva.columns).sort_values(key=abs, ascending=False)   # customer 0
base = float(ex.base_values[0])
print(f"customer 0: base {base:.2f} + contributions {c.sum():.2f} = {base + c.sum():.2f} log-odds")
print("biggest pushes:", c.round(2).head(3).to_dict())
print("model's own raw score:", round(float(m.predict(Xva.iloc[[0]], raw_score=True)[0]), 2))</div>
  <div class="fx" data-lang="text">mean |SHAP|: {'f5': 0.767, 'f8': 0.5, 'f11': 0.062, 'row_noise': 0.089, 'coin_noise': 0.008}
customer 0: base 0.02 + contributions 3.88 = 3.90 log-odds
biggest pushes: {'f8': 1.55, 'f3': 0.66, 'f9': 0.49}
model's own raw score: 3.9</div>
  <p>First line: averaged over all validation customers, <code>f5</code> moves the score most (0.767 on average), matching the other two methods. Second line: for customer 0, the model starts from a base score of 0.02 (the average, in log-odds), and the columns together add 3.88, giving 3.90, which is exactly the model's own raw score in the last line. That "adds up exactly" property is what makes SHAP trustworthy for explaining one prediction: <code>f8</code> alone pushed this customer up by 1.55.</p>
  <div class="callout trap"><span class="label">Trap: SHAP explains the model, not the world</span>
    <p>Look again at the first line: <code>row_noise</code> gets 0.089, more than the useless <code>f11</code> (0.062). The booster really did use the noise column to fit its training rows, and SHAP faithfully reports what the model uses, including its mistakes. SHAP also does not say "changing this column would change churn"; that is a causal question. To find useless columns, use permutation importance on validation data.</p>
  </div>
  <table class="tbl">
    <tr><th>Method</th><th>Measures</th><th>Watch out</th></tr>
    <tr><td>Split count / impurity (MDI, "gain")</td><td>How much training impurity a column removed</td><td>High-cardinality bias, computed on train</td></tr>
    <tr><td>Permutation</td><td>Validation score drop when a column is shuffled</td><td>Correlated columns share credit (shuffle one, the twin covers)</td></tr>
    <tr><td>SHAP (TreeExplainer)</td><td>Each column's signed contribution to each prediction; sums to prediction − baseline</td><td>Slower; explains the model (including its overfitting), not causality</td></tr>
  </table>
  <div class="bridge"><b>What's still missing?</b> A model that is accurate and explainable on a clean benchmark can still fail in real use: rare classes, business rules, uneven costs, and targets that grow beyond anything in the training data.</div>

  <h2 id="mt-prod"><span class="num">10</span>Production Concerns</h2>
  <div class="where"><span>Tree-Based Models</span><span>Using the family</span><span>Production</span></div>
  <p>Why it exists: real projects add problems the toy runs hide: rare classes (fraud is 1 transaction in 1,000), business rules the model must respect, costs that are not symmetric (missing a fraud costs far more than a false alarm), and messy categories. Most of the fixes are knobs on the boosting libraries from section 06.</p>
  <div class="cards">
    <div><b>Class imbalance</b><p><code>scale_pos_weight = n_neg / n_pos</code> (XGBoost) or <code>class_weight</code>. Distorts probabilities; alternatively train unweighted and move the threshold using the PR curve.</p><small>Monitor AUC-PR, not accuracy</small></div>
    <div><b>Monotone constraints</b><p><code>monotone_constraints</code>: +1 / −1 per column forces the prediction to only rise / fall with it.</p><small>Price vs demand, debt vs risk, temperature vs load</small></div>
    <div><b>Custom loss</b><p>Pass a function returning gradient and Hessian per row (XGBoost <code>obj=</code>, LightGBM <code>objective=</code>).</p><small>Works because boosting fits any loss's gradient (section 05)</small></div>
    <div><b>Categoricals</b><p>CatBoost raw; LightGBM <code>categorical_feature</code>. Naive target encoding leaks the row's own label.</p><small>CatBoost's ordered stats avoid it (section 06)</small></div>
  </div>
  <p>In plain words. <strong>Class imbalance</strong>: with 999 honest rows per fraud, a model that says "honest" to everything scores 99.9% accuracy and catches nothing. Weighting the rare class, or moving the decision threshold, fixes it; judge it with AUC-PR, not accuracy (see <a class="xref" data-note="ml_evaluation">Model Evaluation</a>). <strong>Monotone constraints</strong>: "a bigger loan must never lower the risk score", a rule a tree would otherwise break in noisy regions. <strong>Custom loss</strong>: tell the booster that under-forecasting costs 3× more than over-forecasting, and it will aim high; this is the direct pay-off of gradient boosting's "any loss" idea. <strong>Categoricals</strong>: let the library handle text columns natively instead of hand-encoding them.</p>
  <div class="callout trap"><span class="label">Trap: trees cannot go beyond what they saw</span>
    <p>Every member of this family predicts with leaf values learnt from training rows. A forest trained on flat prices up to ₹1 crore can never predict ₹2 crore, no matter how big the flat; a booster's sum of leaves is just as capped. For targets that grow over time, predict the <em>change</em> (this year − last year), or add a linear model for the trend. <a class="xref" data-note="ml_timeseries">Time Series Forecasting</a> shows this fix.</p>
  </div>

  <h2 id="mt-conn"><span class="num">11</span>How This Connects</h2>
  <div class="where"><span>Tree-Based Models</span><span>How this connects</span></div>
  <p>This note sits in the middle of the ML path. What it builds on:</p>
  <ul>
    <li><a class="xref" data-note="ml_core">Core Concepts</a> — overfitting, train/validation/test and the bias-variance trade-off; the whole family tree is a story about variance (bagging) and bias (boosting).</li>
    <li><a class="xref" data-note="ml_classification">Classification</a> — logistic regression is the straight-line baseline (0.596 here) that trees beat, and log loss is the loss the boosters minimise.</li>
    <li><a class="xref" data-note="ml_regression">Regression</a> — MSE and residuals; a regression tree is the building block of every gradient booster.</li>
    <li><a class="xref" data-note="st_probability">Probability</a> — the majority-vote maths in section 03 is the binomial distribution.</li>
    <li><a class="xref" data-note="m_calculus">Calculus</a> — gradients and the Hessian behind gradient boosting and XGBoost's second-order steps.</li>
    <li><a class="xref" data-note="m_optimization">Optimization</a> — gradient boosting is gradient descent where each step is a tree; learning rate means the same thing in both.</li>
  </ul>
  <p>What builds on it:</p>
  <ul>
    <li><a class="xref" data-note="ml_evaluation">Model Evaluation</a> — cross-validation for tuning, AUC-PR for imbalanced data, and calibration (forests tend to be under-confident).</li>
    <li><a class="xref" data-note="ml_timeseries">Time Series Forecasting</a> — one LightGBM over many series with lag features, and the "trees cannot extrapolate" fix.</li>
    <li><a class="xref" data-note="ml_recsys">Recommendation Systems</a> — the ranking stage is often a LightGBM ranker (LambdaMART).</li>
    <li><a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a> — logging the tuning runs of section 06; autolog supports XGBoost and LightGBM.</li>
    <li><a class="xref" data-note="sd_cases">Case Studies</a> — system-design answers that use a global LightGBM, and why "I'd use XGBoost" is not a design.</li>
    <li><a class="xref" data-note="dl_foundations">NN Foundations</a> — neural nets take over for images, text and audio; on plain tables, tree ensembles usually still win.</li>
  </ul>

  <h2 id="mt-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: trusting one deep tree</span>
    <p>An unlimited tree scores 1.000 on train and 0.773 on validation, and its questions change with a different sample (section 02). Prune it, or use an ensemble.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: thinking more forest trees can overfit (or that more boosting trees cannot)</span>
    <p>Adding trees to a forest only averages more; adding trees to a booster keeps fitting the leftover error, which ends up being noise (val log loss 0.308 → 0.752). Always use early stopping for boosting.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: an ensemble of look-alike models</span>
    <p>The gain comes from different mistakes. Same model, same rows, same settings = no gain. Bootstrap, random columns, random cut-offs and blending different families are all ways to make members differ.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reporting impurity importance as the truth</span>
    <p>It favours columns with many values (random noise scored 0.036 vs 0.005). Check with permutation importance on validation data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: target encoding with the row's own label</span>
    <p>A one-customer city gets that customer's answer as its feature. Use CatBoost's ordered statistics or cross-fitted encoding.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: stacking on in-sample predictions</span>
    <p>Members are near perfect on their own training rows, so the meta-model learns the wrong trust. Use out-of-fold predictions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reporting the early-stopping validation score</span>
    <p>That set helped pick the number of trees, so it is optimistic. Report a separate test set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: LightGBM defaults on small data</span>
    <p>Leaf-wise growth with 31 leaves can chase noise on a few thousand rows. Lower <code>num_leaves</code>, raise <code>min_child_samples</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting trees to extrapolate</span>
    <p>No tree model predicts outside the target range it saw. Model the change, or add a trend model.</p>
  </div>

  <h2 id="mt-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Tell the family story in five sentences: from one decision tree to XGBoost.</summary><div class="qa-body">A decision tree learns yes/no rules but has high variance: a slightly different sample gives a different tree. Ensembles fix this by combining many models whose mistakes partly cancel. Bagging (and the random forest, which also randomises columns) averages many independent deep trees, which cuts variance but cannot fix mistakes all trees share. Boosting builds small trees in sequence, each on the previous ones' errors, which cuts bias; AdaBoost did it by reweighting rows, gradient boosting by fitting the loss gradient. XGBoost, LightGBM and CatBoost are engineered gradient boosting: second-order steps and regularisation, histograms and leaf-wise growth, and leak-free categorical handling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did ensembles appear at all? What exact weakness of a single tree do they fix?</summary><div class="qa-body">High variance. An unpruned tree memorises (train 1.000, val 0.773), and five trees on five different 80% samples changed their cut-offs and second questions and disagreed on 50% of validation rows. Because those mistakes are partly random, voting cancels them: the 5-tree vote scored 0.840 vs about 0.78 each. Pruning lowers variance too, but only by making the one tree simpler (higher bias).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did boosting appear after bagging? What could bagging not do?</summary><div class="qa-body">Bagging only reduces variance: Var = ρσ² + (1−ρ)σ²/n shrinks, but the bias of the average equals the bias of one tree. Its trees learn alone, so a pattern every tree misses stays missed. Boosting makes trees work in sequence on the remaining errors, so the team removes bias step by step, using small high-bias trees that bagging could not help.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is a random forest related to bagging, and Extra Trees to a random forest?</summary><div class="qa-body">A random forest is bagging plus a random subset of columns at each split, which makes the trees less alike (lower ρ). Extra Trees is a random forest that also picks the cut-off at random (and by default uses all rows instead of a bootstrap): even less alike, faster, each tree weaker. In our run, two trees agreed 73% (bagging), 68% (RF), 64% (ET); all reached about 0.88.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is gradient boosting related to AdaBoost?</summary><div class="qa-body">AdaBoost came first: it reweights wrongly classified rows and gives each stump a vote α = ½ln((1−err)/err). It was later shown to be greedy minimisation of the exponential loss. Gradient boosting generalises this: each new tree fits the negative gradient of any differentiable loss (squared error, log loss, custom). With exponential loss you recover AdaBoost; with squared error each tree fits the plain residuals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>XGBoost, LightGBM and CatBoost: what does each add over the one before?</summary><div class="qa-body">XGBoost over plain gradient boosting: second-order steps (gradient + Hessian, leaf w* = −G/(H+λ)), λ/γ regularisation inside the split search, and a learned direction for missing values. LightGBM over XGBoost: speed via 255-bin histograms, leaf-wise growth, GOSS (sample well-fitted rows) and EFB (bundle sparse columns). CatBoost over LightGBM: leak-free categorical handling (ordered target statistics), ordered boosting and symmetric trees, so strong results with defaults.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A node has 4 positives and 6 negatives. What's its Gini? A split gives [4/1] and [0/5]. What's the gain?</summary><div class="qa-body">Gini = 1 − (0.4² + 0.6²) = 0.48. Children: 1 − (0.8² + 0.2²) = 0.32 and 0. Weighted = 0.5·0.32 + 0.5·0 = 0.16. Gain = 0.48 − 0.16 = 0.32.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does bagging reduce variance? Give the formula.</summary><div class="qa-body">Var(mean of n trees) = ρσ² + (1 − ρ)σ²/n. More trees shrink the second term; the floor ρσ² depends on the correlation between trees. Bootstrap rows and random column subsets per split lower ρ. Bias stays about the same as one deep tree, which is already low.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What exactly does each tree in gradient boosting fit?</summary><div class="qa-body">The negative gradient of the loss with respect to the current prediction, −∂L/∂F, for each row. For squared error that equals the residual y − F. The tree's output is scaled by the learning rate and added to the ensemble.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does XGBoost use the Hessian, and what does λ do to a leaf?</summary><div class="qa-body">It takes a second-order Taylor expansion of the loss, so each leaf's best value has a closed form w* = −G/(H + λ) and split gain is computed from G and H sums. The Hessian is curvature: where the loss curves sharply, steps are smaller. λ shrinks leaves with little data: four residuals averaging −42.5 give −42.5 at λ = 0 but −21.25 at λ = 4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Impurity-based importance ranks a customer-ID-like column highly. What's going on?</summary><div class="qa-body">MDI is computed on training data and favours columns with many unique values: more cut-offs means more chances to find a split that looks good by luck. In our run, random noise with 20,000 values got 7× the MDI of random 0/1 noise. Check with permutation importance on validation data (both ≈ 0). SHAP would not fully save you: it reported 0.089 for the noise column, because the booster really used it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is early stopping mandatory for boosting but not for random forest?</summary><div class="qa-body">Boosting keeps fitting the remaining errors, which eventually are noise: validation log loss went 0.308 (round 204) → 0.752 (round 3000) while training loss reached 0. Forest trees are independent; adding more only averages more and cannot overfit further.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does CatBoost's ordered approach prevent?</summary><div class="qa-body">Target leakage. Naive target encoding gives a one-row category its own label (Goa → 1.00). Ordered target statistics compute each row's value only from earlier rows in a random order (Goa → 0.50, the prior). Ordered boosting applies the same idea to residuals: a row's residual comes from a model that did not see that row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is stacking worth it, and what is the leakage trap?</summary><div class="qa-body">When members are strong and different (e.g., a forest and a booster). Here averaging RF + ET + LightGBM raised AUC from at most 0.9368 to 0.9397: real but small, for 3× the cost. The trap: training the meta-model on in-sample predictions, which are near perfect; use out-of-fold predictions (StackingClassifier's cv).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Random forest vs gradient boosting: which do you try first?</summary><div class="qa-body">RF as a fast, robust baseline that barely needs tuning and handles noise well. Then boosting with early stopping, which usually wins on large, clean tabular data with interactions. If boosting doesn't beat RF meaningfully on validation (here it didn't: 0.874 vs 0.877), RF's simplicity wins.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you tune a gradient boosting model, and in what order?</summary><div class="qa-body">Fix learning rate ≈ 0.05 with many trees and early stopping. Tune tree size (max_depth / num_leaves), then min_child_weight / min_child_samples, then subsample and colsample_bytree, then L1/L2 regularisation. Use random search or Optuna. Finally lower the learning rate and let early stopping pick more trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Boosting's <code>subsample</code> and <code>colsample_bytree</code> look familiar. Where do they come from?</summary><div class="qa-body">From the bagging branch: random rows (like a bootstrap) and random columns (like a random forest) make consecutive trees less alike and reduce variance. Boosting borrowed them on top of its own bias-reducing loop; this is called stochastic gradient boosting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are monotone constraints and when do you use them?</summary><div class="qa-body">A per-column +1 / −1 setting that forces predictions to only increase / decrease as that column increases, all else fixed; enforced when choosing splits. Use when domain knowledge demands a direction (risk rises with debt, demand falls with price) so the model can't learn noisy reversals.</div></details>
</main>`
});
