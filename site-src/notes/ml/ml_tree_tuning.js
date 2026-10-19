// notes/ml/ml_tree_tuning.js — Tuning & Production
Object.assign(TOPIC_CONTENT, {
  "ml_tree_tuning": `<main>
  <h1>Tuning &amp; Production</h1>
  <div class="where"><span>Machine Learning</span><span>Tree-Based Models</span><span>Tuning &amp; Production</span></div>
  <p class="lead">The model notes in this group each explained one algorithm. This note is about turning any of them into a model you can trust and ship: which hyperparameters actually matter for each model and why, how to search them (grid, random, successive halving, Bayesian with Optuna), early stopping, validating honestly (nested CV), rare classes, calibrated probabilities, categorical columns, business rules, model size and latency, saving and loading, and watching for drift after launch. It ends with a default recipe per model. Every claim is run on the shared churn dataset or a small purpose-built one, with real outputs.</p>

  <h2 id="mtt-fits" class="open"><span class="num">↖</span>Where this fits</h2>
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
<rect x="225.0" y="0" width="150" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="300" y="18" text-anchor="middle" font-size="11">Map &amp; How to Choose</text>
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
<rect x="320.0" y="286" width="200" height="28" rx="6" class="fg sg" stroke-width="2.5"/>
<text x="420" y="304" text-anchor="middle" font-size="11" font-weight="700">Tuning &amp; Production</text>
</svg><figcaption>The Tree-Based Models group. This note (green) is in the bar at the bottom: it applies to every model above it.</figcaption></figure>
  <ul>
    <li><strong>Came from:</strong> every model note introduced its own knobs: depth and pruning in <a class="xref" data-note="ml_dtree">Decision Trees</a>, <code>max_features</code> in <a class="xref" data-note="ml_rf">Random Forest</a>, learning rate and rounds in <a class="xref" data-note="ml_gbm">Gradient Boosting</a>, λ/γ/min_child_weight in <a class="xref" data-note="ml_xgboost">XGBoost</a>, <code>num_leaves</code> in <a class="xref" data-note="ml_lightgbm">LightGBM</a>, <code>cat_features</code> in <a class="xref" data-note="ml_catboost">CatBoost</a>. What remained: which of these matter, how to set them without fooling yourself, and what else a real deployment needs. <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a> gave the tools to decide which features to keep and watch.</li>
    <li><strong>What this note adds:</strong> a tuning method (which knobs, which search, which validation) and the production checklist (imbalance, calibration, categoricals, constraints, size, saving, monitoring).</li>
    <li><strong>Leads to:</strong> <a class="xref" data-note="ml_evaluation">Model Evaluation</a> (metrics, CV, calibration curves in depth), <a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a> (tracking tuning runs, model registry), <a class="xref" data-note="sd_serving">Feature Stores &amp; Online/Offline Serving</a> and <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a> (the system around a deployed model). Nested CV builds on <a class="xref" data-note="ml_core">Core Concepts</a>.</li>
  </ul>

  <h2 id="mtt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Tuning &amp; Production</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Which knobs</div>
        <ul>
          <li><b>RF</b> — max_features, min_samples_leaf; n_estimators just "enough"</li>
          <li><b>Boosters</b> — lr + rounds (early stopping) → tree size → leaf size → sampling → λ/α/γ</li>
          <li>lr 0.3 → 0.03: 17× more trees, +2.3 points</li>
          <li>num_leaves 4 / 63 / 255 → 0.851 / 0.877 / 0.873</li>
          <li>💡 Biryani: flame and time are set before; taste a fresh plate</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Search &amp; validation</div>
        <ul>
          <li><b>Grid</b> explodes; <b>random</b>: 60 trials → 95% chance of top 5%</li>
          <li>Churn: grid 0.9389 · random 0.9411 · Optuna 0.9415 test AUC</li>
          <li><b>Halving</b> — 48 → 16 → 6 candidates on 1k → 3k → 9k rows</li>
          <li><b>Optuna / TPE</b> — propose where l(x)/g(x) is high; prune</li>
          <li><b>Nested CV</b> — outer reports, inner tunes; 0.732 (tuning) vs 0.705 (nested) vs 0.723 (fresh)</li>
          <li>⚠ Preprocessing inside the folds (Pipeline)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Early stopping</div>
        <ul>
          <li>Stop when val loss has not improved for <i>patience</i> rounds; keep best round</li>
          <li>LightGBM: best 204 (0.308) vs round 3000 (0.752)</li>
          <li><code>lgb.cv</code> → 587 rounds; refit on all data with ~same or +15%</li>
          <li>⚠ ES validation score is optimistic</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Imbalance &amp; calibration</div>
        <ul>
          <li>PR-AUC, not accuracy ("always no" = 0.950)</li>
          <li>Threshold = C_FP / (C_FP + C_FN); tuned 0.13 → recall 0.176 → 0.344</li>
          <li>scale_pos_weight = n_neg/n_pos multiplies odds by w</li>
          <li>RF under-confident; isotonic ECE 0.110 → 0.019</li>
          <li>Brier = mean (p − y)²</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data &amp; rules</div>
        <ul>
          <li><b>Categoricals</b> — naive target mean leaks (train 0.877, test 0.741); CatBoost 0.765</li>
          <li><b>Monotone constraints</b> — 42 → 0 wrong-direction steps</li>
          <li><b>Custom loss</b> — supply g, h; under-forecast ×3 → cost 235 → 190</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ship &amp; watch</div>
        <ul>
          <li><b>Size</b> — RF full depth 69 MB vs boosters 1–2 MB</li>
          <li><b>Latency</b> — n_jobs=1 for single rows; boosters 1–3 ms</li>
          <li><b>Save</b> — XGB json, LGBM txt, CatBoost cbm; joblib for sklearn (pin versions)</li>
          <li><b>PSI</b> = Σ(a−e)ln(a/e); &lt;0.1 ok, &gt;0.25 major</li>
          <li>Monitor quality → drift → predictions → performance</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mtt-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Tuning Is</span><span class="rm-sub">Parameters vs hyperparameters</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-knobs"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Which Knobs Matter</span><span class="rm-sub">Per model, with runs</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-cv"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Validating Honestly</span><span class="rm-sub">CV and nested CV</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-search"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Search Strategies</span><span class="rm-sub">Grid, random, halving, Optuna</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-es"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Early Stopping</span><span class="rm-sub">Patience, CV, refitting</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-imb"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Class Imbalance</span><span class="rm-sub">Metrics, thresholds, weights</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-cal"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Probability Calibration</span><span class="rm-sub">Brier, reliability, Platt, isotonic</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-cat"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Categorical Columns</span><span class="rm-sub">One-hot, target, native, CatBoost</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-rules"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Business Rules</span><span class="rm-sub">Monotone constraints, custom loss</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-size"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Size &amp; Latency</span><span class="rm-sub">MB and milliseconds</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-save"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Saving &amp; Loading</span><span class="rm-sub">Formats that survive upgrades</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-drift"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Monitoring &amp; Drift</span><span class="rm-sub">PSI by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-recipe"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Default Recipe per Model</span><span class="rm-sub">Start here</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What costs teams the most</span></div></div>
      <div class="rm-item rm-done" data-target="mtt-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style, with connections</span></div></div>
    </div>
  </div>

  <h2 id="mtt-what"><span class="num">01</span>What Tuning Is (and Is Not)</h2>
  <p><strong>The need.</strong> Every model in this group has settings you choose before training: how deep a tree may grow, how many trees, how big a learning step. The model cannot learn these from the data by itself, because the training loss always prefers "deeper, more, bigger" (that just memorises). The right values depend on your data, so you must find them by trying candidates and judging each on data the model did not train on.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Parameters</strong> are learned by training: the split features, thresholds and leaf values of every tree. <strong>Hyperparameters</strong> are chosen before training and control how parameters are learned: <code>max_depth</code>, <code>n_estimators</code>, <code>learning_rate</code>, <code>min_samples_leaf</code>, … <strong>Tuning</strong> (hyperparameter optimisation) = searching for the hyperparameters that give the best score on held-out data.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cooking biryani. The rice absorbing water and spices is "training": it happens on its own once you start. The flame level, cooking time and amount of water are "hyperparameters": you set them before, and you only find the best values by cooking a few batches and tasting. Tasting from the same pot you seasoned while cooking (the training data) fools you; you need a fresh plate (validation data).</p>
  </div>
  <p>Three facts that shape the rest of this note:</p>
  <ol>
    <li><strong>Few knobs matter a lot; most matter a little.</strong> For boosters, learning rate, number of trees and tree size dominate. For random forests, defaults are already close to the best. Spend your budget on the knobs that matter (section 02).</li>
    <li><strong>The tuning score is optimistic.</strong> If you try 100 settings and keep the best validation score, part of that score is luck. You need a separate final check (section 03).</li>
    <li><strong>Tuning is the last few points.</strong> On our churn data, a default random forest reaches test AUC 0.936 and the best tuned booster in section 04 about 0.941: half a point. Leakage, a wrong split or a missing feature changes it by ten. Fix the data and the validation design first.</li>
  </ol>
  <div class="bridge"><b>What's still missing?</b> "A few knobs matter" is only useful if you know which ones, for which model, and in which direction they move bias and variance.</div>

  <h2 id="mtt-knobs"><span class="num">02</span>Which Knobs Matter, Model by Model</h2>
  <p>Every knob below does one of three jobs: <strong>make each tree simpler</strong> (lower variance, higher bias), <strong>make trees different from each other</strong> (lower correlation in averaging, less overfitting in boosting), or <strong>control how much each tree contributes</strong> (boosting's learning rate and number of rounds). "Impact" is how much the knob usually moves the score.</p>
  <div style="overflow-x:auto"><table class="tbl">
    <tr><th>Model</th><th>Knob</th><th>Impact</th><th>Effect of raising it</th><th>Typical range</th></tr>
    <tr><td rowspan="4"><a class="xref" data-note="ml_dtree">Decision tree</a></td><td><code>max_depth</code></td><td>High</td><td>More complex, lower bias, higher variance</td><td>3–15</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>High</td><td>Smoother, less overfitting</td><td>1–100 (or 0.1–2% of rows)</td></tr>
    <tr><td><code>ccp_alpha</code></td><td>High</td><td>More pruning, smaller tree</td><td>pick from <code>cost_complexity_pruning_path</code></td></tr>
    <tr><td><code>criterion</code></td><td>Low</td><td>Gini vs entropy rarely matters</td><td>gini</td></tr>
    <tr><td rowspan="5"><a class="xref" data-note="ml_rf">Random forest</a> / <a class="xref" data-note="ml_extratrees">Extra Trees</a></td><td><code>max_features</code></td><td>Medium–high</td><td>Trees more alike (higher ρ), each stronger</td><td>sqrt, 0.3–0.5, log2</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>Medium</td><td>Smoother trees, smaller model; can cost accuracy</td><td>1–10</td></tr>
    <tr><td><code>n_estimators</code></td><td>Low after ~200</td><td>Lower variance, never overfits, slower</td><td>300–1000</td></tr>
    <tr><td><code>max_depth</code> / <code>max_samples</code></td><td>Low–medium</td><td>Size/speed control</td><td>None / 0.5–1.0</td></tr>
    <tr><td><code>class_weight</code></td><td>Imbalance only</td><td>Up-weights the rare class</td><td>balanced_subsample</td></tr>
    <tr><td rowspan="3"><a class="xref" data-note="ml_adaboost">AdaBoost</a></td><td><code>n_estimators</code> × <code>learning_rate</code></td><td>High</td><td>More rounds/bigger steps fit more (and chase noise)</td><td>100–1000 × 0.05–1</td></tr>
    <tr><td>base learner depth</td><td>High</td><td>Stumps are weak; depth 2–3 learns interactions</td><td>1–3</td></tr>
    <tr><td colspan="3">Avoid with noisy labels</td></tr>
    <tr><td rowspan="6"><a class="xref" data-note="ml_gbm">Gradient boosting</a> (sklearn GBM / HistGB)</td><td><code>learning_rate</code></td><td>Highest</td><td>Faster fitting, needs fewer trees, overfits sooner</td><td>0.01–0.1</td></tr>
    <tr><td><code>n_estimators</code> / <code>max_iter</code></td><td>Highest</td><td>Let early stopping choose</td><td>up to several thousand</td></tr>
    <tr><td><code>max_depth</code> / <code>max_leaf_nodes</code></td><td>High</td><td>Order of interactions each tree can learn</td><td>depth 3–8, leaves 15–63</td></tr>
    <tr><td><code>min_samples_leaf</code></td><td>Medium</td><td>Smoother leaves</td><td>20–200</td></tr>
    <tr><td><code>subsample</code></td><td>Medium</td><td>Stochastic GB: less overfit, faster</td><td>0.5–0.9</td></tr>
    <tr><td><code>l2_regularization</code> (HistGB)</td><td>Low–medium</td><td>Shrinks leaf values</td><td>0–10</td></tr>
    <tr><td rowspan="7"><a class="xref" data-note="ml_xgboost">XGBoost</a></td><td><code>eta</code> (<code>learning_rate</code>) + rounds</td><td>Highest</td><td>As above; always with early stopping</td><td>0.01–0.1</td></tr>
    <tr><td><code>max_depth</code></td><td>High</td><td>Interaction order, complexity</td><td>4–10</td></tr>
    <tr><td><code>min_child_weight</code></td><td>Medium–high</td><td>Minimum Hessian sum per leaf; blocks tiny leaves</td><td>1–20</td></tr>
    <tr><td><code>subsample</code>, <code>colsample_bytree</code></td><td>Medium</td><td>Decorrelate trees, reduce overfitting</td><td>0.6–0.9</td></tr>
    <tr><td><code>gamma</code></td><td>Low–medium</td><td>Minimum gain to keep a split</td><td>0–5</td></tr>
    <tr><td><code>lambda</code>, <code>alpha</code></td><td>Low–medium</td><td>L2 / L1 shrinkage of leaf weights</td><td>0–10</td></tr>
    <tr><td><code>scale_pos_weight</code></td><td>Imbalance only</td><td>Up-weights positives</td><td>n_neg / n_pos</td></tr>
    <tr><td rowspan="5"><a class="xref" data-note="ml_lightgbm">LightGBM</a></td><td><code>learning_rate</code> + rounds</td><td>Highest</td><td>As above</td><td>0.01–0.1</td></tr>
    <tr><td><code>num_leaves</code></td><td>High</td><td>Main complexity knob for leaf-wise trees</td><td>15–255 (keep &lt; 2^max_depth)</td></tr>
    <tr><td><code>min_child_samples</code> (<code>min_data_in_leaf</code>)</td><td>High on small data</td><td>Blocks leaf-wise growth into tiny leaves</td><td>20–200</td></tr>
    <tr><td><code>feature_fraction</code>, <code>bagging_fraction</code>+<code>bagging_freq</code></td><td>Medium</td><td>Decorrelate, speed</td><td>0.6–0.9</td></tr>
    <tr><td><code>lambda_l1/l2</code>, <code>min_gain_to_split</code></td><td>Low–medium</td><td>Regularise leaves / splits</td><td>0–10</td></tr>
    <tr><td rowspan="4"><a class="xref" data-note="ml_catboost">CatBoost</a></td><td><code>learning_rate</code> + <code>iterations</code></td><td>High</td><td>As above; auto learning rate if unset</td><td>0.02–0.1</td></tr>
    <tr><td><code>depth</code></td><td>High</td><td>Symmetric tree depth</td><td>4–10 (default 6)</td></tr>
    <tr><td><code>l2_leaf_reg</code></td><td>Medium</td><td>Leaf shrinkage</td><td>1–10 (default 3)</td></tr>
    <tr><td><code>one_hot_max_size</code>, <code>border_count</code></td><td>Low</td><td>Category handling, histogram bins</td><td>defaults</td></tr>
  </table></div>
  <h3>Seeing it: random forest knobs on the churn data</h3>
  <p>The shared churn dataset (same as every note in this group): 20,000 customers, 12 columns from <code>make_classification</code> plus pure-noise columns <code>row_noise</code> and <code>coin_noise</code>, split 12,000 train / 3,000 validation / 5,000 test:</p>
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
  <p>Every churn code block below starts from this setup. First, the forest, one knob at a time:</p>
  <div class="fx" data-lang="py">for mf in [1, "sqrt", 7, None]:
    rf = RandomForestClassifier(n_estimators=200, max_features=mf, n_jobs=-1, random_state=0).fit(Xtr, ytr)
    print(f"max_features={str(mf):5s}  val acc {rf.score(Xva, yva):.3f}")
for leaf in [1, 5, 20, 100]:
    rf = RandomForestClassifier(n_estimators=200, min_samples_leaf=leaf, n_jobs=-1, random_state=0).fit(Xtr, ytr)
    print(f"min_samples_leaf={leaf:&lt;3d}  train acc {rf.score(Xtr, ytr):.3f}  val acc {rf.score(Xva, yva):.3f}")
for n in [10, 50, 200, 500]:
    rf = RandomForestClassifier(n_estimators=n, n_jobs=-1, random_state=0).fit(Xtr, ytr)
    print(f"n_estimators={n:&lt;4d}  val acc {rf.score(Xva, yva):.3f}")</div>
  <div class="fx" data-lang="text">max_features=1      val acc 0.844
max_features=sqrt   val acc 0.881
max_features=7      val acc 0.885
max_features=None   val acc 0.885
min_samples_leaf=1    train acc 1.000  val acc 0.881
min_samples_leaf=5    train acc 0.963  val acc 0.873
min_samples_leaf=20   train acc 0.897  val acc 0.858
min_samples_leaf=100  train acc 0.825  val acc 0.816
n_estimators=10    val acc 0.847
n_estimators=50    val acc 0.872
n_estimators=200   val acc 0.881
n_estimators=500   val acc 0.879</div>
  <ul>
    <li><strong>max_features</strong>: 1 feature per split is too random (0.844); √14 ≈ 3 gives 0.881; 7 or all 14 give 0.885. On this data stronger, more alike trees win slightly. That is why it is worth a few values, never just the default.</li>
    <li><strong>min_samples_leaf</strong>: 1 is best here (0.881). Bigger leaves smooth every tree and steadily lose accuracy (100 → 0.816) while shrinking the model a lot (section 10). Forests rely on deep trees; averaging handles the variance.</li>
    <li><strong>n_estimators</strong>: 10 → 50 → 200 trees: 0.847 → 0.872 → 0.881, then flat (500: 0.879, within noise). More trees never hurt accuracy; they only cost time and memory.</li>
  </ul>
  <h3>Seeing it: learning rate and tree size in a booster</h3>
  <p>The two knobs that matter most for any booster, changed one at a time on LightGBM, each run with early stopping (patience 100) choosing the number of trees:</p>
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
  <p><strong>Learning rate:</strong> 10× smaller (0.3 → 0.03) needed about 17× more trees (68 → 1,154) and gained 2.3 points. Small steps average out the noise of each tree; the price is training time. <strong>Tree size:</strong> 4 leaves cannot combine enough features (0.851, even with 3,476 trees); 255 leaves memorise in 124 rounds (train 1.000) and slip on test; 63 is the sweet spot here.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Learning rate and number of trees are one knob in disguise: their product is roughly "how far the model moves". Fix the learning rate (0.05 is a good default), let early stopping choose the number of trees, and spend the search on tree size, leaf size and sampling.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tuning <code>n_estimators</code> of a booster in a grid without early stopping wastes the budget and usually picks a wrong value for every other combination. Tuning <code>n_estimators</code> of a random forest at all is mostly pointless: pick "enough" (300–1000) and move on.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We just compared settings on the validation set. Every time we pick the best of several by that score, the score becomes a little optimistic. How do we tune and still report an honest number?</div>

  <h2 id="mtt-cv"><span class="num">03</span>Validating Honestly: CV and Nested CV</h2>
  <p>Two jobs need held-out data: <strong>choosing</strong> hyperparameters and <strong>reporting</strong> how good the final model is. If the same data does both, the report is biased upwards: you picked the setting that happened to do best on exactly those rows.</p>
  <div class="cards">
    <div><b>Holdout</b><p>Train / validation / test. Tune on validation, report on test once.</p><small>Simple; fine for 10k+ rows</small></div>
    <div><b>k-fold CV for tuning</b><p>Each setting is scored by the average over k folds. Less noisy than one validation set.</p><small><code>GridSearchCV(cv=5)</code>; still needs a test set</small></div>
    <div><b>Nested CV</b><p>Outer folds report; inner folds tune. Every outer score comes from rows the tuning never saw.</p><small>Small data; papers; model comparison</small></div>
    <div><b>Grouped / time-ordered</b><p>Rows of one customer stay in one fold (<code>GroupKFold</code>); time series train on the past only (<code>TimeSeriesSplit</code>).</p><small>Wrong splits leak more than any tuning gains</small></div>
  </div>
  <h3>Nested CV by hand</h3>
  <p>Outer loop: 5 folds. For outer fold 1, hold out its 20% of rows. On the other 80%, run the whole tuning (an inner 5-fold grid search over 96 settings) and pick a winner. Retrain the winner on that 80% and score it on the held-out 20%. That score is honest: those rows took no part in choosing. Repeat for the 5 outer folds and average. Cost: 5 outer × 96 settings × 5 inner = 2,400 fits instead of 480. The tuning may pick different settings in different outer folds; that is fine, because nested CV estimates how good <em>the tuning procedure</em> is, not one particular setting.</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import GridSearchCV, cross_val_score, StratifiedKFold
Xs, ys = Xtr.iloc[:800], ytr[:800]                      # small data makes the optimism easy to see
grid = {"max_depth": [2, 3, 4, 5, 6, 8, 10, None], "min_samples_leaf": [1, 2, 5, 10, 20, 40],
        "criterion": ["gini", "entropy"]}               # 96 configs
inner = StratifiedKFold(5, shuffle=True, random_state=1)
outer = StratifiedKFold(5, shuffle=True, random_state=2)
gs = GridSearchCV(DecisionTreeClassifier(random_state=0), grid, cv=inner).fit(Xs, ys)
print(f"non-nested: best CV accuracy of 96 configs = {gs.best_score_:.3f}  {gs.best_params_}")
nested = cross_val_score(GridSearchCV(DecisionTreeClassifier(random_state=0), grid, cv=inner), Xs, ys, cv=outer)
print(f"nested CV : outer-fold scores {nested.round(3).tolist()}  mean {nested.mean():.3f}")
print(f"fresh data: tuned tree on 5,000 test rows = {gs.score(Xte, yte):.3f}")
print(f"fits: non-nested 96x5 = {96*5}; nested 5 x 96 x 5 = {5*96*5}")</div>
  <div class="fx" data-lang="text">non-nested: best CV accuracy of 96 configs = 0.732  {'criterion': 'entropy', 'max_depth': 5, 'min_samples_leaf': 5}
nested CV : outer-fold scores [0.756, 0.656, 0.725, 0.681, 0.706]  mean 0.705
fresh data: tuned tree on 5,000 test rows = 0.723
fits: non-nested 96x5 = 480; nested 5 x 96 x 5 = 2400</div>
  <p>On 800 rows, the best of 96 decision-tree settings scores 0.732 in its own cross-validation. Nested CV reports 0.705 (outer folds range 0.656–0.756: small data is noisy). Fresh test data gives 0.723. The non-nested number was optimistic; nested CV was a little pessimistic here because each outer fold trains on only 640 rows. The fresh number sits between them, and the gap shrinks as data grows. See <a class="xref" data-note="ml_core">Core Concepts</a> and <a class="xref" data-note="ml_evaluation">Model Evaluation</a> for the cross-validation basics.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Any step that learns from data must happen inside the training folds: scaling, imputation, target encoding, feature selection, resampling (SMOTE), and early stopping. Put them in a <code>Pipeline</code> so <code>GridSearchCV</code> refits them per fold. Selecting features on all rows and then cross-validating is a classic leak.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We know which knobs to search and how to score each candidate honestly. With 5 knobs and 5 values each that is 3,125 combinations. How do we search smartly within a budget?</div>

  <h2 id="mtt-search"><span class="num">04</span>Search Strategies: Grid, Random, Halving, Bayesian</h2>
  <h3>Grid search</h3>
  <p>List values for each knob and try every combination. By hand: <code>num_leaves</code> ∈ {15, 63}, <code>min_child_samples</code> ∈ {10, 50}, <code>colsample_bytree</code> ∈ {0.6, 1.0}, <code>reg_lambda</code> ∈ {0, 5} → 2 × 2 × 2 × 2 = <strong>16 combinations</strong>; with 3-fold CV, 48 fits. Add one more knob with 4 values and it becomes 64 combinations, 192 fits. Grids explode exponentially with the number of knobs, and they waste trials: if only <code>num_leaves</code> really matters, 16 trials have tested just 2 values of it.</p>
  <h3>Random search</h3>
  <p>Draw each knob from a distribution (uniform, log-uniform for scales like λ or learning rate) for a fixed number of trials. Every trial tries a new value of <em>every</em> knob, so the important knob gets 16 different values in 16 trials. A useful fact (Bergstra &amp; Bengio, 2012): if the best 5% of the space counts as "good", each random trial hits it with probability 0.05, so n trials miss it with probability 0.95ⁿ. For n = 60: 0.95⁶⁰ = 0.046, so a <strong>95% chance</strong> of at least one good trial, regardless of how many knobs there are.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Looking for the best street food in a new city. A grid search eats at every stall on 4 fixed streets. A random search eats at 16 stalls spread across the whole city. If the best food is on a street the grid never visits, the grid can never find it.</p>
  </div>
  <h3>Successive halving (and Hyperband)</h3>
  <p>Most bad settings are visibly bad early. So start many candidates on a small budget, keep the best third, give the survivors 3× more budget, and repeat. By hand with 48 candidates, factor 3, budget = training rows starting at 1,000: round 1 trains 48 candidates on 1,000 rows; round 2 trains the best 16 on 3,000; round 3 trains the best 6 on 9,000. A fourth round would need 27,000 rows and we only have 12,000, so it stops and keeps the best of those 6. Total cost ≈ 48·1k + 16·3k + 6·9k = 150k row-fits, about the same as 12 full-data fits, for 48 candidates. Hyperband runs several such brackets with different starting budgets.</p>
  <h3>Bayesian optimisation (Optuna / TPE)</h3>
  <p>Random search ignores what it has learnt. Bayesian optimisation keeps a model of "score as a function of hyperparameters" built from past trials and picks the next trial where improvement looks most likely. Optuna's default sampler, TPE (Tree-structured Parzen Estimator), splits past trials into the best ~10–25% ("good") and the rest ("bad"), estimates the density of each over every knob, l(x) for good and g(x) for bad, and proposes the x with the largest ratio l(x)/g(x): values common among good trials and rare among bad ones. The first ~10 trials are random to get started. Optuna can also <strong>prune</strong> trials whose intermediate scores look hopeless, and an objective can use early stopping inside each trial, so each trial gets its own best number of trees.</p>
  <h3>All four on the churn data</h3>
  <p>LightGBM, learning rate 0.05, searching the same four knobs. Grid, random and halving use 3-fold CV on the 12,000 training rows (300 trees per fit) and refit the winner on all of them; Optuna (next block) uses the validation set with early stopping inside each trial. Everything is finally scored on the same 5,000 test rows. Times come from a busy shared machine with one thread per model.</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from scipy.stats import randint, uniform, loguniform
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, StratifiedKFold
from sklearn.experimental import enable_halving_search_cv
from sklearn.model_selection import HalvingRandomSearchCV
from sklearn.metrics import roc_auc_score
cv = StratifiedKFold(3, shuffle=True, random_state=0)
clean = lambda d: {k: round(float(v), 3) if isinstance(v, float) else int(v) for k, v in d.items()}
base = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, verbose=-1, n_jobs=2)

grid = {"num_leaves": [15, 63], "min_child_samples": [10, 50],
        "colsample_bytree": [0.6, 1.0], "reg_lambda": [0.0, 5.0]}           # 2*2*2*2 = 16 combos
t0 = time.time()
gs = GridSearchCV(base, grid, cv=cv, scoring="roc_auc").fit(Xtr, ytr)
print(f"grid    : 16 configs  best CV AUC {gs.best_score_:.4f}  test AUC {roc_auc_score(yte, gs.predict_proba(Xte)[:,1]):.4f}  {time.time()-t0:.0f}s  {clean(gs.best_params_)}")

dist = {"num_leaves": randint(8, 256), "min_child_samples": randint(5, 100),
        "colsample_bytree": uniform(0.5, 0.5), "reg_lambda": loguniform(1e-3, 10)}
t0 = time.time()
rs = RandomizedSearchCV(base, dist, n_iter=16, cv=cv, scoring="roc_auc", random_state=0).fit(Xtr, ytr)
bp = clean(rs.best_params_)
print(f"random  : 16 configs  best CV AUC {rs.best_score_:.4f}  test AUC {roc_auc_score(yte, rs.predict_proba(Xte)[:,1]):.4f}  {time.time()-t0:.0f}s  {bp}")

t0 = time.time()
hs = HalvingRandomSearchCV(base, dist, n_candidates=48, factor=3, resource="n_samples",
                           min_resources=1000, cv=cv, scoring="roc_auc", random_state=0).fit(Xtr, ytr)
bp = clean(hs.best_params_)
print(f"halving : 48 configs  rounds {hs.n_iterations_}  candidates per round {list(hs.n_candidates_)}  rows {list(hs.n_resources_)}")
print(f"          best CV AUC {hs.best_score_:.4f}  test AUC {roc_auc_score(yte, hs.predict_proba(Xte)[:,1]):.4f}  {time.time()-t0:.0f}s  {bp}")</div>
  <div class="fx" data-lang="text">grid    : 16 configs  best CV AUC 0.9312  test AUC 0.9389  307s  {'colsample_bytree': 1.0, 'min_child_samples': 10, 'num_leaves': 63, 'reg_lambda': 0.0}
random  : 16 configs  best CV AUC 0.9337  test AUC 0.9411  330s  {'colsample_bytree': 0.985, 'min_child_samples': 16, 'num_leaves': 182, 'reg_lambda': 0.027}
halving : 48 configs  rounds 3  candidates per round [48, 16, 6]  rows [1000, 3000, 9000]
          best CV AUC 0.9282  test AUC 0.9411  476s  {'colsample_bytree': 0.985, 'min_child_samples': 16, 'num_leaves': 182, 'reg_lambda': 0.027}</div>
  <ul>
    <li><strong>Grid</strong> (16 combinations of 2 values each): best CV AUC 0.9312, test 0.9389. It could only try 63 leaves at most.</li>
    <li><strong>Random</strong> (16 draws): best CV 0.9337, test 0.9411. With the same budget it found a better region (182 leaves, 16 rows per leaf), because <code>num_leaves</code> got 16 different values instead of 2.</li>
    <li><strong>Halving</strong> (48 candidates, 3 rounds: 48 → 16 → 6 candidates on 1,000 → 3,000 → 9,000 rows): picked the same winner, test 0.9411. Its "best CV" (0.9282) is lower only because the last round scored on 9,000-row fits, not 12,000. It examined 3× more candidates than random search. (Same seed, so its first 16 candidates are the same draws random search used; the winner was among them.)</li>
    <li>All differences are a few thousandths of AUC. The default-ish LightGBM in the recipe (section 13) already reaches 0.936.</li>
  </ul>
  <p>Now Optuna. The objective function trains one model with the suggested values, uses early stopping on the validation set (so each trial also finds its own number of trees), and returns validation AUC. TPE proposes the next values from the history.</p>
  <div class="fx" data-lang="py">import lightgbm as lgb, optuna
from sklearn.metrics import roc_auc_score
optuna.logging.set_verbosity(optuna.logging.WARNING)
def objective(trial):
    params = {"num_leaves": trial.suggest_int("num_leaves", 8, 256, log=True),
              "min_child_samples": trial.suggest_int("min_child_samples", 5, 100),
              "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
              "reg_lambda": trial.suggest_float("reg_lambda", 1e-3, 10, log=True)}
    m = lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.05, verbose=-1, n_jobs=2, **params)
    m.fit(Xtr, ytr, eval_X=Xva, eval_y=yva, eval_metric="auc",
          callbacks=[lgb.early_stopping(50, verbose=False)])
    trial.set_user_attr("trees", m.best_iteration_)
    return roc_auc_score(yva, m.predict_proba(Xva)[:, 1])
t0 = time.time()
study = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=0))
study.optimize(objective, n_trials=30)
bp = {k: round(v, 3) if isinstance(v, float) else v for k, v in study.best_params.items()}
print(f"optuna  : 30 trials  best val AUC {study.best_value:.4f}  trees {study.best_trial.user_attrs['trees']}  {time.time()-t0:.0f}s  {bp}")
vals = [t.value for t in study.trials]
print("          best-so-far after trials 1,5,10,20,30:", [round(max(vals[:k]), 4) for k in [1, 5, 10, 20, 30]])
m = lgb.LGBMClassifier(n_estimators=study.best_trial.user_attrs["trees"], learning_rate=0.05, verbose=-1,
                       n_jobs=2, **study.best_params).fit(Xtr, ytr)
print(f"          refit with best params -&gt; test AUC {roc_auc_score(yte, m.predict_proba(Xte)[:,1]):.4f}")</div>
  <div class="fx" data-lang="text">optuna  : 30 trials  best val AUC 0.9435  trees 137  467s  {'num_leaves': 252, 'min_child_samples': 7, 'colsample_bytree': 0.926, 'reg_lambda': 0.004}
          best-so-far after trials 1,5,10,20,30: [0.936, 0.9395, 0.9395, 0.9432, 0.9435]
          refit with best params -&gt; test AUC 0.9415</div>
  <ul>
    <li><strong>The learning curve of the search:</strong> the best validation AUC after 1, 5, 10, 20 and 30 trials was 0.936, 0.9395, 0.9395, 0.9432, 0.9435. Most of the gain came in the first 20 trials, once TPE had enough history to focus on large <code>num_leaves</code> and small <code>min_child_samples</code>.</li>
    <li><strong>Its winner</strong> (252 leaves, 7 rows per leaf, early-stopped at 137 trees) is a very different model from the grid's winner (63 leaves, 300 trees), yet both are good: the score surface is flat near the top, so many settings are nearly as good.</li>
    <li><strong>Optimism again:</strong> 0.9435 was the best of 30 scores on the same validation rows that also chose each trial's number of trees. Refit and scored on the untouched test set it is 0.9415. Always report the test number.</li>
  </ul>
  <table class="tbl">
    <tr><th>Strategy</th><th>Uses past results?</th><th>Strength</th><th>Weakness</th><th>Use when</th></tr>
    <tr><td>Grid</td><td>No</td><td>Simple, exhaustive, reproducible</td><td>Explodes with knobs; wastes trials on unimportant knobs</td><td>1–2 knobs, few values</td></tr>
    <tr><td>Random</td><td>No</td><td>Covers important knobs well; trivially parallel</td><td>Keeps sampling bad regions</td><td>Default for 3+ knobs</td></tr>
    <tr><td>Successive halving / Hyperband</td><td>Partly (drops losers)</td><td>Many candidates cheaply</td><td>Small budgets can mis-rank (some settings start slow)</td><td>Expensive models, big search spaces</td></tr>
    <tr><td>Bayesian (TPE, GP)</td><td>Yes</td><td>Fewest trials for a good result; pruning</td><td>Sequential by nature; more machinery</td><td>Each trial is costly; 20–200 trials</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Search ranges matter more than the search method. Use log scales for learning rate, λ and α (0.001 to 10, not 0 to 10 linearly), keep <code>num_leaves</code> &lt; 2^max_depth, and widen a range if the best value lands on its edge.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> One knob was deliberately left out of every search above: the number of trees. Boosting has a better way to choose it than searching.</div>

  <h2 id="mtt-es"><span class="num">05</span>Early Stopping</h2>
  <p><strong>The need.</strong> A booster keeps fitting the remaining training error round after round; after some point that error is noise, and validation loss rises. The right number of rounds depends on the learning rate, tree size and data, so it would have to be re-searched for every combination. Early stopping finds it during a single training run.</p>
  <h3>The rule, by hand</h3>
  <p>After each round, compute the validation loss. Remember the best so far. If it has not improved for <em>patience</em> rounds, stop and keep the model from the best round. With patience 3 and validation losses 0.52, 0.47, 0.44, 0.43, 0.431, 0.433, 0.436:</p>
  <table class="tbl">
    <tr><th>round</th><th>val loss</th><th>best so far</th><th>rounds without improvement</th><th>action</th></tr>
    <tr><td>1</td><td>0.52</td><td>0.52 (r1)</td><td>0</td><td>continue</td></tr>
    <tr><td>2</td><td>0.47</td><td>0.47 (r2)</td><td>0</td><td>continue</td></tr>
    <tr><td>3</td><td>0.44</td><td>0.44 (r3)</td><td>0</td><td>continue</td></tr>
    <tr><td>4</td><td>0.43</td><td>0.43 (r4)</td><td>0</td><td>continue</td></tr>
    <tr><td>5</td><td>0.431</td><td>0.43 (r4)</td><td>1</td><td>continue</td></tr>
    <tr><td>6</td><td>0.433</td><td>0.43 (r4)</td><td>2</td><td>continue</td></tr>
    <tr><td>7</td><td>0.436</td><td>0.43 (r4)</td><td>3</td><td><b>stop; keep 4 rounds</b></td></tr>
  </table>
  <p>Patience exists because validation loss is noisy: one bad round should not stop training. Typical patience: 50–200 rounds at learning rate 0.05.</p>
  <h3>What happens without it</h3>
  <p>A LightGBM run with no stopping (learning rate 0.1, 63 leaves), recording train and validation log loss after every one of 3,000 rounds:</p>
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
  <p>Validation loss bottoms out at round 204 (0.308) and then climbs to 0.752 by round 3,000 while training loss reaches 0. A model taken at round 3,000 is far worse than at 204.</p>
  <h3>The API in each library</h3>
  <table class="tbl">
    <tr><th>Library</th><th>Early stopping</th><th>Best round</th></tr>
    <tr><td>XGBoost</td><td><code>XGBClassifier(early_stopping_rounds=100, eval_metric="logloss")</code>, <code>fit(..., eval_set=[(Xva, yva)])</code></td><td><code>best_iteration</code></td></tr>
    <tr><td>LightGBM</td><td><code>fit(..., eval_X=Xva, eval_y=yva, callbacks=[lgb.early_stopping(100)])</code></td><td><code>best_iteration_</code></td></tr>
    <tr><td>CatBoost</td><td><code>CatBoostClassifier(early_stopping_rounds=100)</code>, <code>fit(..., eval_set=(Xva, yva))</code></td><td><code>get_best_iteration()</code></td></tr>
    <tr><td>HistGradientBoosting</td><td><code>early_stopping=True, validation_fraction=0.1, n_iter_no_change=10</code> (carves its own split)</td><td><code>n_iter_</code></td></tr>
    <tr><td>sklearn GradientBoosting</td><td><code>n_iter_no_change=10, validation_fraction=0.1</code></td><td><code>n_estimators_</code></td></tr>
  </table>
  <h3>Early stopping with cross-validation, then refitting</h3>
  <p>A single validation split gives a noisy best round. <code>lgb.cv</code> (and <code>xgb.cv</code>) run k folds in lock-step and stop when the <em>mean</em> fold loss stops improving. Then you refit on all training data with that many rounds (a bit more, since the final fit sees more rows):</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.metrics import roc_auc_score
dtr = lgb.Dataset(Xtr, ytr)
params = {"objective": "binary", "learning_rate": 0.05, "num_leaves": 31, "verbose": -1, "seed": 0}
cvres = lgb.cv(params, dtr, num_boost_round=3000, nfold=5, stratified=True, seed=0,
               callbacks=[lgb.early_stopping(50, verbose=False)])
best = len(cvres["valid binary_logloss-mean"])
print(f"5-fold CV early stopping: best rounds {best}, CV logloss {cvres['valid binary_logloss-mean'][-1]:.4f}")
Xall, yall = pd.concat([Xtr, Xva]), np.concatenate([ytr, yva])
for rounds in [best, int(best * 1.15)]:
    m = lgb.train(params, lgb.Dataset(Xall, yall), num_boost_round=rounds)
    print(f"refit on train+val with {rounds} rounds -&gt; test AUC {roc_auc_score(yte, m.predict(Xte)):.4f}")</div>
  <div class="fx" data-lang="text">5-fold CV early stopping: best rounds 587, CV logloss 0.3399
refit on train+val with 587 rounds -&gt; test AUC 0.9385
refit on train+val with 675 rounds -&gt; test AUC 0.9389</div>
  <p>5-fold CV picks 587 rounds. Refitting on train + validation (15,000 rows) with 587 or 15% more rounds gives test AUC 0.9385 and 0.9389: the exact count matters little near the optimum, which is why "about right" is good enough.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The validation set used for early stopping helped choose the model, so its score is optimistic. Report a separate test set. And when early stopping is used inside a hyperparameter search, the search's validation data must not be the test data.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> All our runs so far used a balanced 50/50 target. Real targets are often rare (fraud, serious churn, disease), and then accuracy, thresholds and even the loss behave differently.</div>

  <h2 id="mtt-imb"><span class="num">06</span>Class Imbalance</h2>
  <p><strong>The need.</strong> Fraud is 1 transaction in 1,000; serious churn might be 5 customers in 100. A model that always says "no" scores 95–99.9% accuracy and is useless. Trees are not broken by imbalance (they rank rare cases fine), but three things go wrong if you do nothing: accuracy hides failure, the default 0.5 threshold catches almost nobody, and leaf-size limits can stop trees from isolating the rare class.</p>
  <h3>The levers, worked by hand</h3>
  <ol>
    <li><strong>Measure the right thing.</strong> Use PR-AUC (average precision) and recall/precision at your operating threshold, not accuracy. A random model's PR-AUC equals the positive rate (0.05 here), so 0.42 is a big improvement even though it looks low. (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>.)</li>
    <li><strong>Move the threshold using costs.</strong> Say a missed churner costs ₹2,000 of lost revenue and a retention offer costs ₹200. Offer when expected loss avoided &gt; cost: p · 2,000 &gt; 200 → p &gt; 0.1. In general, threshold = C_FP / (C_FP + C_FN) = 200 / 2,200 = <strong>0.091</strong>. The 0.5 default assumes both mistakes cost the same.</li>
    <li><strong>Weight the rare class.</strong> <code>scale_pos_weight = n_neg / n_pos</code> (XGBoost/LightGBM) or <code>class_weight="balanced"</code> multiplies each positive row's gradient and Hessian by w, as if it appeared w times. With 5,977 negatives and 314 positives, w = <strong>19.0</strong>.</li>
    <li><strong>Resample</strong> (undersample the majority, oversample or SMOTE the minority). Always inside the training folds only. With trees, weights usually do the same job more cheaply.</li>
  </ol>
  <p>Weighting changes the probabilities in a predictable way: the odds are multiplied by w. A row the unweighted model would score p = 0.05 (odds 0.05/0.95) becomes odds 19 × 0.0526 = 1.0, i.e. p′ = 0.5. To undo it: p = p′ / (p′ + w·(1 − p′)) = 0.5 / (0.5 + 19 × 0.5) = 0.05. So a weighted model's probabilities are not real probabilities until you correct or calibrate them (section 07).</p>
  <h3>On a 5%-positive version of the churn data</h3>
  <p>We keep all stayers and only enough churners for a 5% churn rate in each split, then compare four options:</p>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.metrics import roc_auc_score, average_precision_score, precision_score, recall_score
def make_rare(Xd, yd, rate=0.05, seed=0):               # keep all 0s, only some 1s -&gt; 5% positives
    r = np.random.default_rng(seed); pos = np.where(yd == 1)[0]; neg = np.where(yd == 0)[0]
    k = int(rate / (1 - rate) * len(neg)); keep = np.concatenate([neg, r.choice(pos, k, replace=False)])
    return Xd.iloc[keep], yd[keep]
Xtr5, ytr5 = make_rare(Xtr, ytr, seed=0); Xva5, yva5 = make_rare(Xva, yva, seed=1); Xte5, yte5 = make_rare(Xte, yte, seed=2)
npos, nneg = ytr5.sum(), (ytr5 == 0).sum()
print(f"train rows {len(ytr5)}, positives {npos} ({ytr5.mean():.1%}), scale_pos_weight = {nneg}/{npos} = {nneg/npos:.1f}")
print(f"always say 'stay': test accuracy {1 - yte5.mean():.3f}, recall 0.000")
def report(name, p, thr):
    pred = p &gt;= thr
    print(f"{name:28s} ROC-AUC {roc_auc_score(yte5, p):.3f}  PR-AUC {average_precision_score(yte5, p):.3f}  "
          f"thr {thr:.2f}: precision {precision_score(yte5, pred):.3f} recall {recall_score(yte5, pred):.3f}  "
          f"mean p {p.mean():.3f}")
def best_thr(p, yv):                                    # threshold that maximises F1 on validation
    ts = np.linspace(0.05, 0.95, 91)
    f1 = [2 * precision_score(yv, p &gt;= t, zero_division=0) * recall_score(yv, p &gt;= t) /
          max(precision_score(yv, p &gt;= t, zero_division=0) + recall_score(yv, p &gt;= t), 1e-9) for t in ts]
    return ts[int(np.argmax(f1))]
kw = dict(n_estimators=400, learning_rate=0.05, verbose=-1, random_state=0)
plain = lgb.LGBMClassifier(**kw).fit(Xtr5, ytr5)
wtd = lgb.LGBMClassifier(scale_pos_weight=nneg / npos, **kw).fit(Xtr5, ytr5)
p0, p1 = plain.predict_proba(Xte5)[:, 1], wtd.predict_proba(Xte5)[:, 1]
report("plain, threshold 0.5", p0, 0.5)
report("scale_pos_weight, thr 0.5", p1, 0.5)
t = best_thr(plain.predict_proba(Xva5)[:, 1], yva5)
report("plain, threshold tuned on val", p0, t)
rfw = RandomForestClassifier(n_estimators=300, min_samples_leaf=3, class_weight="balanced_subsample",
                             n_jobs=-1, random_state=0).fit(Xtr5, ytr5)
report("RF balanced_subsample, 0.5", rfw.predict_proba(Xte5)[:, 1], 0.5)
print(f"true positive rate in test: {yte5.mean():.3f}")</div>
  <div class="fx" data-lang="text">train rows 6291, positives 314 (5.0%), scale_pos_weight = 5977/314 = 19.0
always say 'stay': test accuracy 0.950, recall 0.000
plain, threshold 0.5         ROC-AUC 0.881  PR-AUC 0.425  thr 0.50: precision 0.605 recall 0.176  mean p 0.019
scale_pos_weight, thr 0.5    ROC-AUC 0.870  PR-AUC 0.415  thr 0.50: precision 0.554 recall 0.275  mean p 0.041
plain, threshold tuned on val ROC-AUC 0.881  PR-AUC 0.425  thr 0.13: precision 0.562 recall 0.344  mean p 0.019
RF balanced_subsample, 0.5   ROC-AUC 0.888  PR-AUC 0.412  thr 0.50: precision 0.545 recall 0.046  mean p 0.076
true positive rate in test: 0.050</div>
  <ul>
    <li><strong>"Always stay" gets 0.950 accuracy and catches nobody.</strong> That is why accuracy is not reported.</li>
    <li><strong>Plain model at 0.5:</strong> precision 0.605 but recall only 0.176: it catches 1 churner in 6.</li>
    <li><strong>scale_pos_weight = 19 at 0.5:</strong> recall rises to 0.275, but ROC-AUC and PR-AUC drop slightly (0.870 / 0.415): weighting moved the operating point, it did not improve the ranking.</li>
    <li><strong>Plain model with the threshold tuned on validation (0.13):</strong> the best recall (0.344) at a precision (0.562) close to the others, with the best ranking metrics. Moving the threshold did more than reweighting, for free.</li>
    <li><strong>Random forest with balanced_subsample:</strong> the best ROC-AUC (0.888) but recall 0.046 at 0.5: forest probabilities are averages that rarely reach 0.5 for rare classes. It too needs a lower threshold.</li>
    <li><strong>Mean predicted probability</strong> vs the true rate 0.050: the plain booster says 0.019 (over-fitted: confident zeros on many real churners), the weighted one 0.041, the forest 0.076. None is calibrated; see the next section.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>For tree ensembles, imbalance is mainly a <em>decision</em> problem, not a <em>learning</em> problem. Train normally (or with mild weights), judge with PR-AUC, and pick the threshold from costs or a precision/recall target on validation data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Oversampling (or SMOTE) before splitting puts copies of the same churner in train and validation, so validation looks brilliant. Resample only inside training folds (use an imbalanced-learn <code>Pipeline</code>), or just use weights. Also, a balanced random forest (imbalanced-learn's <code>BalancedRandomForestClassifier</code>, each tree on a balanced bootstrap) is an option when positives are extremely rare.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Thresholds and expected costs need probabilities you can trust. "0.3" should mean "30 of 100 such customers churn". The table above already showed that none of the models' averages matched the true rate.</div>

  <h2 id="mtt-cal"><span class="num">07</span>Probability Calibration</h2>
  <p><strong>The need.</strong> A model is <strong>calibrated</strong> if, among all customers it scores 0.3, about 30% really churn. Ranking metrics (AUC) do not care about this; decisions do (expected profit, risk-based pricing, combining models, communicating risk). Tree ensembles are often mis-calibrated in known directions:</p>
  <ul>
    <li><strong>Random forests are under-confident</strong>: an average over trees reaches 0 or 1 only if every tree agrees, and bootstrap plus random features guarantee some disagree. Probabilities are pulled toward the middle.</li>
    <li><strong>Boosters on log loss are usually close</strong>, but over-fitted or weighted boosters are not: weights shift probabilities (section 06), and many rounds push them toward 0 and 1.</li>
  </ul>
  <h3>Measuring it by hand</h3>
  <p>Six customers, predicted probabilities 0.9, 0.8, 0.7, 0.3, 0.2, 0.1 and what really happened: 1, 1, 0, 0, 0, 1.</p>
  <ul>
    <li><strong>Brier score</strong> = mean of (p − y)²: (0.01 + 0.04 + 0.49 + 0.09 + 0.04 + 0.81) / 6 = 1.48 / 6 = <strong>0.247</strong>. Lower is better; always predicting 0.5 scores 0.25.</li>
    <li><strong>Reliability table</strong> (2 bins): predictions ≥ 0.5 average 0.8, but only 2 of 3 churned (0.667). Predictions &lt; 0.5 average 0.2, but 1 of 3 churned (0.333).</li>
    <li><strong>Expected calibration error</strong> (ECE) = Σ (bin share) × |mean prediction − actual rate| = 0.5 × 0.133 + 0.5 × 0.133 = <strong>0.133</strong>.</li>
  </ul>
  <p>A <strong>reliability diagram</strong> plots mean prediction (x) against actual rate (y) per bin; a calibrated model lies on the diagonal. scikit-learn draws it with <code>CalibrationDisplay.from_estimator</code>.</p>
  <h3>Fixing it</h3>
  <div class="cards">
    <div><b>Platt scaling (sigmoid)</b><p>Fit p = 1 / (1 + e^(A·s + B)) on held-out scores s. Two parameters: works with little data, assumes an S-shaped distortion.</p><small><code>method="sigmoid"</code></small></div>
    <div><b>Isotonic regression</b><p>Fit any non-decreasing step function from score to probability. Flexible; needs a few thousand held-out rows or it overfits.</p><small><code>method="isotonic"</code></small></div>
    <div><b>Never on training predictions</b><p>Calibrate on rows the model did not train on. <code>CalibratedClassifierCV(cv=5)</code> does this with cross-fitting.</p><small>Or <code>cv="prefit"</code>-style on a separate calibration set</small></div>
  </div>
  <div class="fx" data-lang="py">import lightgbm as lgb
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss, log_loss
def ece(y, p, bins=10):
    idx = np.minimum((p * bins).astype(int), bins - 1); e = 0
    for b in range(bins):
        s = idx == b
        if s.any(): e += s.mean() * abs(p[s].mean() - y[s].mean())
    return e
def table(y, p):
    idx = np.minimum((p * 5).astype(int), 4)
    return " ".join(f"[{b/5:.1f}-{(b+1)/5:.1f}) pred {p[idx==b].mean():.2f} true {y[idx==b].mean():.2f} n={int((idx==b).sum())} |" for b in range(5) if (idx==b).any())
rf = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0).fit(Xtr, ytr)
lg = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1).fit(Xtr, ytr)
lgw = lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, scale_pos_weight=3, verbose=-1).fit(Xtr, ytr)
models = {"RF": rf, "LightGBM": lg, "LightGBM weighted x3": lgw}
for meth in ["sigmoid", "isotonic"]:
    models[f"RF + {meth}"] = CalibratedClassifierCV(
        RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0), method=meth, cv=5).fit(Xtr, ytr)
models["LGBM weighted + isotonic"] = CalibratedClassifierCV(
    lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, scale_pos_weight=3, verbose=-1), method="isotonic", cv=5).fit(Xtr, ytr)
for name, m in models.items():
    p = m.predict_proba(Xte)[:, 1]
    print(f"{name:26s} Brier {brier_score_loss(yte, p):.4f}  logloss {log_loss(yte, p):.4f}  ECE {ece(yte, p):.4f}  acc {np.mean((p&gt;0.5)==yte):.3f}")
for name in ["RF", "RF + isotonic", "LightGBM weighted x3"]:
    print(name, "-&gt;", table(yte, models[name].predict_proba(Xte)[:, 1]))</div>
  <div class="fx" data-lang="text">RF                         Brier 0.1086  logloss 0.3666  ECE 0.1098  acc 0.877
LightGBM                   Brier 0.0971  logloss 0.3259  ECE 0.0317  acc 0.874
LightGBM weighted x3       Brier 0.1105  logloss 0.3574  ECE 0.0770  acc 0.844
RF + sigmoid               Brier 0.0952  logloss 0.3219  ECE 0.0227  acc 0.878
RF + isotonic              Brier 0.0955  logloss 0.3219  ECE 0.0185  acc 0.876
LGBM weighted + isotonic   Brier 0.0950  logloss 0.3174  ECE 0.0243  acc 0.874
RF -&gt; [0.0-0.2) pred 0.11 true 0.04 n=1174 | [0.2-0.4) pred 0.29 true 0.13 n=921 | [0.4-0.6) pred 0.50 true 0.48 n=764 | [0.6-0.8) pred 0.71 true 0.87 n=969 | [0.8-1.0) pred 0.88 true 0.96 n=1172 |
RF + isotonic -&gt; [0.0-0.2) pred 0.07 true 0.06 n=1862 | [0.2-0.4) pred 0.29 true 0.27 n=433 | [0.4-0.6) pred 0.50 true 0.50 n=448 | [0.6-0.8) pred 0.71 true 0.77 n=424 | [0.8-1.0) pred 0.93 true 0.94 n=1833 |
LightGBM weighted x3 -&gt; [0.0-0.2) pred 0.07 true 0.04 n=1378 | [0.2-0.4) pred 0.30 true 0.11 n=444 | [0.4-0.6) pred 0.50 true 0.26 n=408 | [0.6-0.8) pred 0.71 true 0.52 n=581 | [0.8-1.0) pred 0.94 true 0.91 n=2189 |</div>
  <ul>
    <li><strong>The raw forest</strong> has ECE 0.110. Its reliability rows show the classic under-confidence: when it says 0.11 the truth is 0.04, and when it says 0.71 the truth is 0.87. Its probabilities are squeezed toward the middle.</li>
    <li><strong>Isotonic on the forest</strong>: ECE 0.019, Brier 0.1086 → 0.0955, log loss 0.367 → 0.322, accuracy unchanged (0.876–0.878). The forest's ranking was always good; only the probability scale was wrong. Sigmoid does almost as well here.</li>
    <li><strong>The plain booster</strong> is already fairly calibrated (ECE 0.032).</li>
    <li><strong>The booster weighted ×3</strong> over-predicts: when it says 0.50 only 26% churn. ECE 0.077, and accuracy at 0.5 drops to 0.844. Isotonic calibration repairs it (ECE 0.024, best Brier 0.0950).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calibrating on the same rows used for early stopping or threshold selection reuses them a third time. With enough data, keep a separate calibration split; otherwise let <code>CalibratedClassifierCV</code> cross-fit. Also re-check calibration after deployment: drift breaks it before it breaks AUC.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> So far every column was a number. Real tables have text categories (city, plan, product) with hundreds of values, and how you feed them in can change both accuracy and leakage.</div>

  <h2 id="mtt-cat"><span class="num">08</span>Categorical Columns: Your Options</h2>
  <table class="tbl">
    <tr><th>Option</th><th>How</th><th>Good for</th><th>Watch out</th></tr>
    <tr><td>One-hot</td><td>One 0/1 column per category</td><td>Few categories (&lt; ~20)</td><td>Hundreds of sparse columns; each split isolates one category; slow</td></tr>
    <tr><td>Ordinal codes</td><td>City → 0, 1, 2, … as a number</td><td>Ordered categories (S/M/L), or many trees can carve arbitrary codes</td><td>Imposes a fake order; needs more splits</td></tr>
    <tr><td>Target encoding</td><td>Replace each category with the mean target of its rows</td><td>High cardinality</td><td>Leaks the row's own label unless cross-fitted / smoothed</td></tr>
    <tr><td>Native (LightGBM, HistGB, XGBoost)</td><td>Library sorts categories by gradient statistics and finds the best grouping at each split</td><td>Medium cardinality</td><td>Can overfit rare categories (LightGBM <code>min_data_per_group</code>, <code>cat_smooth</code>); HistGB limited to ≤ 255 categories per column</td></tr>
    <tr><td>CatBoost ordered target statistics</td><td>Target encoding where each row only sees earlier rows in a random order</td><td>Many / high-cardinality categoricals</td><td>Slower training</td></tr>
  </table>
  <p>A test where the choice matters: 30,000 customers, a <code>city</code> column with 1,000 possible cities (a few big ones, a long tail of tiny ones), each city with its own hidden churn tendency, plus tenure and bill.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, time, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.preprocessing import OneHotEncoder, TargetEncoder
from sklearn.metrics import roc_auc_score
rng = np.random.default_rng(0); n = 30000; K = 1000
w = 1 / np.arange(1, K + 1) ** 1.1; w /= w.sum()
city = rng.choice(K, n, p=w)                                # a few big cities, a long tail of tiny ones
city_effect = rng.normal(0, 1.0, K)                         # each city has its own churn tendency
tenure = rng.integers(1, 60, n); bill = rng.normal(800, 200, n)
logit = -1 + city_effect[city] - 0.03 * tenure + 0.002 * (bill - 800)
y = (rng.random(n) &lt; 1 / (1 + np.exp(-logit))).astype(int)
df = pd.DataFrame({"city": city, "tenure": tenure, "bill": bill})
tr, te = df[:24000], df[24000:]; ytr, yte = y[:24000], y[24000:]
vc = tr.city.value_counts()
print(f"cities in train: {len(vc)}; biggest 3 have {vc.head(3).tolist()} rows; {(vc &lt;= 5).sum()} cities have 5 rows or fewer")
num = ["tenure", "bill"]
def run(name, Xa, Xb, model=None, **fit):
    t0 = time.time()
    m = model or lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, verbose=-1, random_state=0)
    m.fit(Xa, ytr, **fit)
    a_tr = roc_auc_score(ytr, m.predict_proba(Xa)[:, 1]); a_te = roc_auc_score(yte, m.predict_proba(Xb)[:, 1])
    print(f"{name:34s} cols {Xa.shape[1]:5d}  train AUC {a_tr:.3f}  test AUC {a_te:.3f}  {time.time()-t0:5.1f}s")
oh = OneHotEncoder(handle_unknown="ignore", sparse_output=False).fit(tr[["city"]])
run("one-hot + LightGBM", np.hstack([oh.transform(tr[["city"]]), tr[num]]), np.hstack([oh.transform(te[["city"]]), te[num]]))
run("ordinal codes + LightGBM", tr, te)
means = pd.Series(ytr).groupby(tr.city.values).mean()       # naive: every row sees its own label
a = np.column_stack([tr.city.map(means), tr[num]]); b = np.column_stack([te.city.map(means).fillna(ytr.mean()), te[num]])
run("naive target mean (leaky) + LGBM", a, b)
enc = TargetEncoder(random_state=0)                         # cross-fitted inside fit_transform
a = np.hstack([enc.fit_transform(tr[["city"]], ytr), tr[num]]); b = np.hstack([enc.transform(te[["city"]]), te[num]])
run("TargetEncoder (cross-fit) + LGBM", a, b)
trc, tec = tr.astype({"city": "category"}), te.astype({"city": "category"})
tec["city"] = tec["city"].cat.set_categories(trc["city"].cat.categories)
run("LightGBM native categorical", trc, tec)
run("CatBoost native (ordered TS)", tr, te,
    model=CatBoostClassifier(iterations=300, learning_rate=0.05, verbose=False, random_seed=0), cat_features=["city"])</div>
  <div class="fx" data-lang="text">cities in train: 963; biggest 3 have [4272, 1894, 1244] rows; 518 cities have 5 rows or fewer
one-hot + LightGBM                 cols   965  train AUC 0.827  test AUC 0.753    3.6s
ordinal codes + LightGBM           cols     3  train AUC 0.848  test AUC 0.738    2.3s
naive target mean (leaky) + LGBM   cols     3  train AUC 0.877  test AUC 0.741    2.1s
TargetEncoder (cross-fit) + LGBM   cols     3  train AUC 0.850  test AUC 0.750    2.3s
LightGBM native categorical        cols     3  train AUC 0.868  test AUC 0.755    2.8s
CatBoost native (ordered TS)       cols     3  train AUC 0.806  test AUC 0.765   12.9s</div>
  <ul>
    <li><strong>Over half the cities (518 of 963) have 5 rows or fewer.</strong> That long tail is where encodings differ.</li>
    <li><strong>Naive target mean is the leakiest:</strong> highest train AUC (0.877) but only 0.741 test. A city with one churner gets the value 1.0 = its own label, so the model learns "1.0 means churn" from a lie.</li>
    <li><strong>Cross-fitted TargetEncoder</strong> (each row encoded by a model of the other folds) removes the leak: train 0.850, test 0.750.</li>
    <li><strong>One-hot</strong> (965 columns) and <strong>LightGBM native</strong> do fine here (0.753, 0.755); ordinal codes are weakest (0.738).</li>
    <li><strong>CatBoost</strong> wins on test (0.765) with the <em>lowest</em> train AUC (0.806): the smallest train-test gap, because ordered target statistics never let a row see its own label. It also took the longest (12.9 s vs 2–4 s).</li>
  </ul>
  <p>Rules of thumb: few categories → one-hot or native; many categories and you want one library → CatBoost; elsewhere → cross-fitted target encoding (<code>sklearn.preprocessing.TargetEncoder</code>) or LightGBM native with <code>min_data_per_group</code> raised. Unseen categories at prediction time must map to something sensible (the encoders above use the global mean or an "unknown" bucket). The full story, with ordered statistics worked row by row, is in <a class="xref" data-note="ml_catboost">CatBoost</a>.</p>
  <div class="bridge"><b>What's still missing?</b> The model can now be accurate, honest and calibrated, and still be unusable if it breaks a business rule or optimises the wrong cost.</div>

  <h2 id="mtt-rules"><span class="num">09</span>Business Rules: Monotone Constraints &amp; Custom Loss</h2>
  <h3>Monotone constraints</h3>
  <p>A credit model must never say "more debt → lower risk", even if noise in the training data suggests it in some region. A regulator, or common sense, will reject it. <strong>Monotone constraints</strong> tell the booster: for this feature, predictions may only go up (+1) or only down (−1) as it increases, holding the others fixed. The library enforces it during split search (a split whose left/right leaf values would break the order is rejected or clipped).</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb
rng = np.random.default_rng(0); n = 3000
debt_ratio = rng.uniform(0, 1, n); income = rng.normal(50, 15, n)
risk = 1 / (1 + np.exp(-(-3 + 4 * debt_ratio - 0.02 * (income - 50))))
y = (rng.random(n) &lt; risk).astype(int)
X = pd.DataFrame({"debt_ratio": debt_ratio, "income": income})
grid = pd.DataFrame({"debt_ratio": np.linspace(0, 1, 101), "income": 50.0})
for mc in [None, [1, -1]]:
    m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, num_leaves=31, verbose=-1,
                           monotone_constraints=mc).fit(X, y)
    p = m.predict_proba(grid)[:, 1]
    drops = int((np.diff(p) &lt; -1e-9).sum())
    print(f"monotone_constraints={mc}: risk at debt 0.0/0.5/1.0 = {p[0]:.2f}/{p[50]:.2f}/{p[100]:.2f}; "
          f"places where MORE debt gives LOWER risk: {drops} of 100")</div>
  <div class="fx" data-lang="text">monotone_constraints=None: risk at debt 0.0/0.5/1.0 = 0.00/0.13/0.65; places where MORE debt gives LOWER risk: 42 of 100
monotone_constraints=[1, -1]: risk at debt 0.0/0.5/1.0 = 0.03/0.31/0.77; places where MORE debt gives LOWER risk: 0 of 100</div>
  <p>Without the constraint, on 100 small steps of debt ratio from 0 to 1 (income fixed at 50), the predicted risk goes <em>down</em> at 42 places: noise-driven wiggles. With <code>monotone_constraints=[1, -1]</code> (risk rises with debt, falls with income) there are 0 such places, and the curve still rises from 0.03 to 0.77. Available in XGBoost, LightGBM, CatBoost and scikit-learn's HistGradientBoosting (<code>monotonic_cst</code>).</p>
  <h3>Custom loss</h3>
  <p>A shop running out of stock loses 3× more than it loses from holding extra stock. Squared error treats both mistakes the same. Gradient boosting can optimise <em>any</em> differentiable loss: you only supply its gradient and Hessian per row (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>, <a class="xref" data-note="ml_xgboost">XGBoost</a>). By hand: L = w·(y − F)² with w = 3 if y &gt; F (under-forecast) else 1. Then g = ∂L/∂F = −2w(y − F) and h = ∂²L/∂F² = 2w. For a row with y = 100, F = 90: g = −2·3·10 = −60, h = 6.</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb
rng = np.random.default_rng(0); n = 5000
X = rng.uniform(0, 10, (n, 2))
demand = 50 + 8 * X[:, 0] - 3 * X[:, 1] + rng.normal(0, 10, n)     # units sold per day
def under_costs_3x(y_true, y_pred):          # loss = 3*(y-F)^2 if we under-forecast, (y-F)^2 if over
    r = y_true - y_pred
    w = np.where(r &gt; 0, 3.0, 1.0)
    grad = -2 * w * r                          # dL/dF
    hess = 2 * w                               # d2L/dF2
    return grad, hess
Xtr, Xte, ytr, yte = X[:4000], X[4000:], demand[:4000], demand[4000:]
for name, obj in [("squared error", "regression"), ("custom: under-forecast costs 3x", under_costs_3x)]:
    m = lgb.LGBMRegressor(objective=obj, n_estimators=300, learning_rate=0.05, verbose=-1).fit(Xtr, ytr)
    p = m.predict(Xte); r = yte - p
    cost = np.mean(np.where(r &gt; 0, 3, 1) * r ** 2)
    print(f"{name:32s} mean error {r.mean():+5.2f}  under-forecast on {np.mean(r &gt; 0):.0%} of days  business cost {cost:6.1f}")</div>
  <div class="fx" data-lang="text">squared error                    mean error +0.89  under-forecast on 53% of days  business cost  235.4
custom: under-forecast costs 3x  mean error -2.82  under-forecast on 40% of days  business cost  189.8</div>
  <p>The squared-error model is unbiased (mean error +0.89) and under-forecasts on 53% of days. The custom model deliberately aims high (mean error −2.82, under-forecasts on only 40% of days) and the business cost falls from 235.4 to 189.8. The "worse" model by RMSE is the better model for the business.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With a custom objective, libraries stop starting from the average target and evaluate with their default metric, so also pass a matching custom evaluation metric for early stopping, and check that the model has enough rounds to move from 0 to the target scale.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The model is ready. Now it has to leave the notebook: it takes disk space and memory, it must answer in milliseconds, and it must load again tomorrow with identical predictions.</div>

  <h2 id="mtt-size"><span class="num">10</span>Model Size &amp; Latency</h2>
  <p>A tree is stored as arrays of nodes (feature, threshold, children, value). A fully grown classification tree on 12,000 rows has thousands of nodes; 300 of them is a lot of memory. Boosters use hundreds of small trees (31 leaves, depth 6), so they are usually 10–50× smaller. Prediction time is roughly (number of trees) × (depth): every row walks from root to leaf in every tree.</p>
  <div class="fx" data-lang="py">import pickle, lightgbm as lgb, xgboost as xgb
from catboost import CatBoostClassifier
models = {
  "RF 300 trees, full depth": RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0),
  "RF 300 trees, min_samples_leaf=20": RandomForestClassifier(n_estimators=300, min_samples_leaf=20, n_jobs=-1, random_state=0),
  "LightGBM 480 trees, 31 leaves": lgb.LGBMClassifier(n_estimators=480, learning_rate=0.05, verbose=-1),
  "XGBoost 440 trees, depth 6": xgb.XGBClassifier(n_estimators=440, learning_rate=0.05, max_depth=6),
  "CatBoost 820 trees, depth 6": CatBoostClassifier(iterations=820, learning_rate=0.05, depth=6, verbose=False)}
one = Xte.iloc[[0]]
for name, m in models.items():
    m.fit(Xtr, ytr)
    mb = len(pickle.dumps(m)) / 1e6
    m.predict_proba(one)
    t0 = time.perf_counter()
    for _ in range(50): m.predict_proba(one)
    single = (time.perf_counter() - t0) / 50 * 1000
    t0 = time.perf_counter(); m.predict_proba(Xte); batch = (time.perf_counter() - t0) * 1000
    acc = m.score(Xte, yte)
    print(f"{name:36s} {mb:7.1f} MB  1 row {single:6.1f} ms  5,000 rows {batch:7.1f} ms  test acc {acc:.3f}")</div>
  <div class="fx" data-lang="text">RF 300 trees, full depth                69.1 MB  1 row   55.1 ms  5,000 rows   276.0 ms  test acc 0.877
RF 300 trees, min_samples_leaf=20       13.3 MB  1 row   55.4 ms  5,000 rows   423.6 ms  test acc 0.852
LightGBM 480 trees, 31 leaves            1.6 MB  1 row    1.9 ms  5,000 rows   318.0 ms  test acc 0.874
XGBoost 440 trees, depth 6               1.6 MB  1 row    3.3 ms  5,000 rows    69.0 ms  test acc 0.867
CatBoost 820 trees, depth 6              0.9 MB  1 row    1.2 ms  5,000 rows    12.6 ms  test acc 0.872</div>
  <ul>
    <li><strong>Size:</strong> the full-depth forest pickles to 69 MB; forcing leaves of ≥ 20 rows cuts it to 13 MB but costs 2.5 points of accuracy. The boosters are 0.9–1.6 MB at about the forest's accuracy. CatBoost's symmetric trees store one (feature, threshold) per <em>level</em>, not per node, so they are the most compact.</li>
    <li><strong>Single-row latency</strong> (what an API serving one request sees): ~55 ms for the forests, because <code>n_jobs=-1</code> starts a thread pool for every call; that overhead dwarfs the tree walking. For serving one row at a time, set <code>n_jobs=1</code> on the loaded model. The boosters answer in 1–3 ms.</li>
    <li><strong>Batch latency</strong> (5,000 rows): CatBoost's symmetric trees vectorise well (13 ms); the others take 70–420 ms. These timings come from a busy shared machine with one thread per booster, so treat them as rough ratios.</li>
  </ul>
  <p>Ways to shrink and speed up, cheapest first: fewer trees (early stopping already helps; for forests, 200 trees are usually as good as 1,000), smaller trees (<code>min_samples_leaf</code>, <code>max_depth</code>, <code>num_leaves</code>), drop useless features (<a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a>), predict in batches, compile the trees (Treelite, ONNX Runtime, or the library's own C API), and use float32 inputs.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Notebook latency is not production latency. Measure p50/p99 for one row and for your real batch size, with the same thread settings and feature pipeline as production; feature fetching often costs more than the model (<a class="xref" data-note="sd_serving">Feature Stores &amp; Online/Offline Serving</a>).</p>
  </div>

  <h2 id="mtt-save"><span class="num">11</span>Saving &amp; Loading</h2>
  <table class="tbl">
    <tr><th>Model</th><th>Recommended format</th><th>Why</th></tr>
    <tr><td>scikit-learn (trees, RF, ET, HistGB)</td><td><code>joblib.dump</code> / <code>pickle</code> (or <code>skops</code> for safer loading)</td><td>Simple; but tied to the exact scikit-learn / Python versions, and unpickling runs code, so only load files you trust</td></tr>
    <tr><td>XGBoost</td><td><code>save_model("m.json")</code> or <code>.ubj</code></td><td>Stable, documented format; loads across versions and languages</td></tr>
    <tr><td>LightGBM</td><td><code>booster_.save_model("m.txt")</code></td><td>Plain text, readable, loads in C++/Java/Python</td></tr>
    <tr><td>CatBoost</td><td><code>save_model("m.cbm")</code> (also JSON, ONNX, C++/Python export)</td><td>Native binary; exports for other runtimes</td></tr>
  </table>
  <div class="fx" data-lang="py">import os, joblib, lightgbm as lgb, xgboost as xgb
from catboost import CatBoostClassifier
os.makedirs("models", exist_ok=True)
rf = RandomForestClassifier(n_estimators=100, min_samples_leaf=5, n_jobs=-1, random_state=0).fit(Xtr, ytr)
joblib.dump(rf, "models/rf.joblib", compress=3)
rf2 = joblib.load("models/rf.joblib")
lg = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, verbose=-1).fit(Xtr, ytr)
lg.booster_.save_model("models/lgb.txt")                    # plain text, readable, version-tolerant
lg2 = lgb.Booster(model_file="models/lgb.txt")
xg = xgb.XGBClassifier(n_estimators=300, learning_rate=0.05, max_depth=6).fit(Xtr, ytr)
xg.save_model("models/xgb.json")                            # also .ubj (binary JSON)
xg2 = xgb.XGBClassifier(); xg2.load_model("models/xgb.json")
cb = CatBoostClassifier(iterations=300, verbose=False).fit(Xtr, ytr)
cb.save_model("models/cb.cbm")
cb2 = CatBoostClassifier(); cb2.load_model("models/cb.cbm")
checks = {"RF joblib": (rf.predict_proba(Xte)[:, 1], rf2.predict_proba(Xte)[:, 1]),
          "LightGBM txt": (lg.predict_proba(Xte)[:, 1], lg2.predict(Xte)),
          "XGBoost json": (xg.predict_proba(Xte)[:, 1], xg2.predict_proba(Xte)[:, 1]),
          "CatBoost cbm": (cb.predict_proba(Xte)[:, 1], cb2.predict_proba(Xte)[:, 1])}
files = {"RF joblib": "rf.joblib", "LightGBM txt": "lgb.txt", "XGBoost json": "xgb.json", "CatBoost cbm": "cb.cbm"}
for k, (a, b) in checks.items():
    print(f"{k:13s} file {os.path.getsize('models/' + files[k]) / 1e6:5.2f} MB  max |difference| after reload {np.abs(a - b).max():.1e}")
print(open("models/lgb.txt").read().splitlines()[0:3])</div>
  <div class="fx" data-lang="text">RF joblib     file  3.20 MB  max |difference| after reload 3.3e-16
LightGBM txt  file  1.03 MB  max |difference| after reload 0.0e+00
XGBoost json  file  1.73 MB  max |difference| after reload 0.0e+00
CatBoost cbm  file  0.34 MB  max |difference| after reload 0.0e+00
['tree', 'version=v4', 'num_class=1']</div>
  <p>All four reload with identical predictions (the forest differs by 3 × 10⁻¹⁶, floating-point noise). The last line shows the first lines of LightGBM's text file: a human-readable dump of every tree. Save alongside the model: the library versions, the exact feature list and order, the category mappings, the chosen threshold and calibrator, and the training data's date range. Tools like <a class="xref" data-note="mlops_mlflow">MLflow &amp; Experiment Tracking</a> do this bookkeeping for you (<code>mlflow.lightgbm.log_model</code>, <code>mlflow.xgboost.log_model</code>).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A pickled scikit-learn model may fail to load, or silently behave differently, after a library upgrade. Pin versions in the serving image, or retrain on upgrade. Never <code>pickle.load</code> a file from an untrusted source: it can execute arbitrary code.</p>
  </div>

  <h2 id="mtt-drift"><span class="num">12</span>Monitoring &amp; Drift</h2>
  <p>A deployed model decays. Customers change, prices rise, a new plan launches, an upstream team renames a field. Monitoring catches this before the business does. Watch four things, from fastest to slowest signal:</p>
  <ol>
    <li><strong>Data quality</strong>: missing rates, new categories, values outside the training range (trees cannot extrapolate: <a class="xref" data-note="ml_trees">The Tree Family</a>).</li>
    <li><strong>Data drift</strong> (input distributions change): measured per feature, e.g. with PSI.</li>
    <li><strong>Prediction drift</strong>: the distribution of scores or the share of "churn" decisions changes.</li>
    <li><strong>Performance</strong>: AUC, precision/recall, calibration once true labels arrive (often weeks later). A drop with stable inputs points to <strong>concept drift</strong>: the relationship between inputs and target changed.</li>
  </ol>
  <h3>PSI by hand</h3>
  <p>The <strong>Population Stability Index</strong> compares a feature's distribution in production (a) against training (e), using the same bins: PSI = Σ (aᵢ − eᵢ) · ln(aᵢ / eᵢ). Monthly bills, 4 bins:</p>
  <table class="tbl">
    <tr><th>bin (₹)</th><th>train share e</th><th>production share a</th><th>(a − e) · ln(a/e)</th></tr>
    <tr><td>0–500</td><td>0.10</td><td>0.05</td><td>(−0.05) · ln(0.5) = 0.0347</td></tr>
    <tr><td>500–1000</td><td>0.40</td><td>0.25</td><td>(−0.15) · ln(0.625) = 0.0705</td></tr>
    <tr><td>1000–1500</td><td>0.40</td><td>0.45</td><td>(0.05) · ln(1.125) = 0.0059</td></tr>
    <tr><td>1500+</td><td>0.10</td><td>0.25</td><td>(0.15) · ln(2.5) = 0.1374</td></tr>
    <tr><td colspan="3"><b>PSI</b></td><td><b>0.248</b></td></tr>
  </table>
  <p>Common rule of thumb: PSI &lt; 0.1 stable, 0.1–0.25 moderate shift (investigate), &gt; 0.25 major shift (likely retrain). 0.248 is on the edge. The code repeats the table and then shows how PSI grows as the average bill slowly drifts up (10 quantile bins from training):</p>
  <div class="fx" data-lang="py">import numpy as np
def psi(expected, actual, edges):
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(actual, edges)[0] / len(actual)
    e, a = np.clip(e, 1e-4, None), np.clip(a, 1e-4, None)
    return np.sum((a - e) * np.log(a / e)), e, a
# hand example: bills in 4 bins
edges = [0, 500, 1000, 1500, 10_000]
train_bills = np.repeat([250, 750, 1250, 2000], [10, 40, 40, 10])     # 10% 40% 40% 10%
prod_bills  = np.repeat([250, 750, 1250, 2000], [5, 25, 45, 25])      # 5% 25% 45% 25%
v, e, a = psi(train_bills, prod_bills, edges)
for i in range(4):
    print(f"bin {i}: train {e[i]:.2f}  prod {a[i]:.2f}  (a-e)*ln(a/e) = {(a[i]-e[i])*np.log(a[i]/e[i]):.4f}")
print(f"PSI = {v:.3f}")
# a feature on the churn data: quantile bins from train, then a slow drift
rng = np.random.default_rng(0)
train = rng.normal(800, 200, 20000)
q = np.quantile(train, np.linspace(0, 1, 11)); q[0], q[-1] = -np.inf, np.inf
for shift in [0, 20, 60, 120]:
    prod = rng.normal(800 + shift, 200, 5000)
    print(f"mean bill +{shift:3d}: PSI {psi(train, prod, q)[0]:.3f}")</div>
  <div class="fx" data-lang="text">bin 0: train 0.10  prod 0.05  (a-e)*ln(a/e) = 0.0347
bin 1: train 0.40  prod 0.25  (a-e)*ln(a/e) = 0.0705
bin 2: train 0.40  prod 0.45  (a-e)*ln(a/e) = 0.0059
bin 3: train 0.10  prod 0.25  (a-e)*ln(a/e) = 0.1374
PSI = 0.248
mean bill +  0: PSI 0.003
mean bill + 20: PSI 0.008
mean bill + 60: PSI 0.092
mean bill +120: PSI 0.306</div>
  <p>A ₹20 shift in the average bill (0.1 standard deviations) gives PSI 0.008, nothing to worry about; ₹60 gives 0.092, close to the "investigate" line; ₹120 gives 0.306, a major shift. Use permutation importance or SHAP to decide which features to watch most closely: drift in a feature the model barely uses matters little; drift in f5 matters a lot.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A car's dashboard. Data quality is the check-engine light (something is broken now), drift is the fuel gauge slowly moving (things are changing), performance is the mileage you only learn at the end of the trip. You need all three because they arrive at different times.</p>
  </div>
  <p>When drift is confirmed: retrain on recent data (on a schedule or triggered by thresholds), re-check calibration and the threshold, compare the new model with the old one on the same recent holdout (a "champion vs challenger" check), and roll out gradually. The system-design side, with dashboards and alerting, is in <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a> and <a class="xref" data-note="mlops_lifecycle">The ML Lifecycle</a>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PSI on every feature every day produces false alarms (many features, small daily samples). Alert on the important features, use larger windows, and confirm with prediction drift and, when labels arrive, performance.</p>
  </div>

  <h2 id="mtt-recipe"><span class="num">13</span>A Default Recipe per Model</h2>
  <p>Starting points that are good on most tables. Begin here, check validation, then tune only the knobs marked in section 02.</p>
  <div style="overflow-x:auto"><table class="tbl">
    <tr><th>Model</th><th>Start with</th><th>Then tune</th><th>Do not bother</th></tr>
    <tr><td>Decision tree</td><td><code>ccp_alpha</code> from the pruning path (by CV), <code>min_samples_leaf</code> 5–20</td><td><code>max_depth</code>, <code>min_samples_leaf</code></td><td>criterion</td></tr>
    <tr><td>Random forest</td><td>500 trees, <code>max_features="sqrt"</code>, <code>min_samples_leaf=1</code>, <code>n_jobs=-1</code>, OOB on</td><td><code>max_features</code> (sqrt, 0.3, 0.5), <code>min_samples_leaf</code> (1, 3, 5)</td><td>n_estimators beyond "enough", criterion</td></tr>
    <tr><td>Extra Trees</td><td>500 trees, sqrt, <code>min_samples_leaf</code> 1–2</td><td><code>max_features</code></td><td>bootstrap</td></tr>
    <tr><td>HistGradientBoosting</td><td>lr 0.05, <code>max_iter</code> large + early stopping, 31 leaves, <code>l2_regularization=1</code></td><td><code>max_leaf_nodes</code>, <code>min_samples_leaf</code></td><td>max_bins</td></tr>
    <tr><td>XGBoost</td><td>lr 0.05, ES 100, depth 6, subsample 0.8, colsample 0.8, <code>tree_method="hist"</code></td><td>depth, <code>min_child_weight</code>, sampling, λ/α, γ</td><td>max_delta_step (unless extreme imbalance)</td></tr>
    <tr><td>LightGBM</td><td>lr 0.05, ES 100, 31 leaves, <code>min_child_samples=20</code>, bagging 0.8/1, feature_fraction 0.8</td><td><code>num_leaves</code>, <code>min_child_samples</code>, sampling, λ</td><td>max_bin (unless huge data)</td></tr>
    <tr><td>CatBoost</td><td>lr 0.05 (or auto), ES 100, depth 6, <code>cat_features</code> set</td><td>depth, <code>l2_leaf_reg</code></td><td>most others</td></tr>
  </table></div>
  <div class="fx" data-lang="py">import xgboost as xgb, lightgbm as lgb
from catboost import CatBoostClassifier
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
recipes = {
  "Decision tree": (DecisionTreeClassifier(min_samples_leaf=5, ccp_alpha=3e-4, random_state=0), {}),
  "Random forest": (RandomForestClassifier(n_estimators=500, max_features="sqrt", min_samples_leaf=1,
                                           n_jobs=-1, random_state=0), {}),
  "Extra Trees":   (ExtraTreesClassifier(n_estimators=500, max_features="sqrt", min_samples_leaf=2,
                                         n_jobs=-1, random_state=0), {}),
  "HistGradientBoosting": (HistGradientBoostingClassifier(learning_rate=0.05, max_iter=3000, max_leaf_nodes=31,
                                         min_samples_leaf=20, l2_regularization=1.0, early_stopping=True,
                                         n_iter_no_change=100, random_state=0), {}),
  "XGBoost":  (xgb.XGBClassifier(n_estimators=5000, learning_rate=0.05, max_depth=6, min_child_weight=1,
                                 subsample=0.8, colsample_bytree=0.8, reg_lambda=1.0, tree_method="hist",
                                 early_stopping_rounds=100, eval_metric="logloss"),
               {"eval_set": [(Xva, yva)], "verbose": False}),
  "LightGBM": (lgb.LGBMClassifier(n_estimators=5000, learning_rate=0.05, num_leaves=31, min_child_samples=20,
                                  subsample=0.8, subsample_freq=1, colsample_bytree=0.8, reg_lambda=1.0, verbose=-1),
               {"eval_X": Xva, "eval_y": yva, "callbacks": [lgb.early_stopping(100, verbose=False)]}),
  "CatBoost": (CatBoostClassifier(iterations=5000, learning_rate=0.05, depth=6, l2_leaf_reg=3,
                                  early_stopping_rounds=100, verbose=False, random_seed=0),
               {"eval_set": (Xva, yva)}),
}
for name, (m, fit_kw) in recipes.items():
    t0 = time.time(); m.fit(Xtr, ytr, **fit_kw)
    p = m.predict_proba(Xte)[:, 1]
    trees = (getattr(m, "best_iteration", None) or getattr(m, "best_iteration_", None) or getattr(m, "n_iter_", None)
             or (m.get_best_iteration() if name == "CatBoost" else None) or getattr(m, "n_estimators", 1))
    print(f"{name:21s} test acc {np.mean((p &gt; 0.5) == yte):.3f}  AUC {roc_auc_score(yte, p):.3f}  trees {trees}  {time.time()-t0:5.1f}s")</div>
  <div class="fx" data-lang="text">Decision tree         test acc 0.810  AUC 0.870  trees 1    0.8s
Random forest         test acc 0.877  AUC 0.937  trees 500   33.8s
Extra Trees           test acc 0.869  AUC 0.933  trees 500   13.5s
HistGradientBoosting  test acc 0.869  AUC 0.935  trees 784    6.7s
XGBoost               test acc 0.870  AUC 0.936  trees 612    5.4s
LightGBM              test acc 0.875  AUC 0.936  trees 544    3.6s
CatBoost              test acc 0.874  AUC 0.938  trees 733    9.5s</div>
  <p>With no search at all, every ensemble recipe lands within about 0.005 AUC of the others (0.933–0.938), and early stopping chose 544–784 rounds for the boosters. The single tree (0.810 accuracy) shows what the ensembles buy. From here, tuning is worth at most a few tenths of a point on this data; on harder data (more rows, more interactions, more categoricals) the boosters usually pull ahead after tuning tree size and sampling.</p>
  <div class="flow"><span>Clean data + honest split</span><span>RF baseline</span><span>Booster recipe + early stopping</span><span>Tune tree/leaf size, sampling (random search / Optuna)</span><span>Threshold + calibration</span><span>Test once</span><span>Save with metadata</span><span>Monitor drift</span></div>

  <h2 id="mtt-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: reporting the tuning score</span>
    <p>The best of many validation scores is optimistic (0.732 vs 0.723 on fresh data in section 03). Report a separate test set or nested CV.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: grid-searching the learning rate and number of trees</span>
    <p>Fix the learning rate, let early stopping pick the trees, and search the rest.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: preprocessing outside the CV loop</span>
    <p>Target encoding, feature selection, SMOTE or scaling fitted on all rows leak into validation. Put them in a Pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: accuracy on imbalanced data, and the 0.5 threshold</span>
    <p>"Always no" got 0.950 accuracy. Use PR-AUC, and choose the threshold from costs (C_FP / (C_FP + C_FN)).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting weighted or forest probabilities as-is</span>
    <p>Weighted boosters over-predict (said 0.50, truth 0.26); forests are squeezed toward the middle. Calibrate on held-out data before using probabilities in money calculations.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: naive target encoding</span>
    <p>Train AUC 0.877, test 0.741: tiny categories leak their own labels. Cross-fit, or use CatBoost.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a 70 MB forest behind a latency SLA</span>
    <p>Measure size and single-row latency before choosing; set n_jobs=1 for single-row serving; prefer boosters or smaller trees when latency matters.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shipping without monitoring</span>
    <p>Inputs drift long before labels arrive. Track PSI on important features and the prediction distribution from day one.</p>
  </div>

  <h2 id="mtt-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Parameter vs hyperparameter: give two examples of each for a gradient-boosted model.</summary><div class="qa-body">Parameters (learned): each tree's split features and thresholds, and its leaf values. Hyperparameters (chosen): learning_rate, max_depth / num_leaves, n_estimators, subsample, reg_lambda.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which hyperparameters matter most for a random forest, and which for a booster?</summary><div class="qa-body">Forest: max_features and min_samples_leaf; n_estimators just needs to be "enough" and never overfits. Booster: learning rate with the number of rounds (via early stopping), then tree size (max_depth / num_leaves), then leaf size (min_child_weight / min_child_samples), then row/column sampling, then L1/L2 and gamma.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does random search usually beat grid search for the same budget?</summary><div class="qa-body">Usually only a few knobs matter. A grid with 4 values per knob tries only 4 distinct values of the important knob however many combinations it runs; random search tries a new value of every knob in every trial. And 60 random trials have a 1 − 0.95⁶⁰ ≈ 95% chance of landing in the top 5% of the space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does Bayesian optimisation (TPE / Optuna) choose the next trial?</summary><div class="qa-body">It builds a model of how the score depends on the hyperparameters from the trials so far. TPE splits past trials into "good" and "bad" groups, models the density of each, and proposes points where good/bad density is highest. It focuses trials on promising regions; pruning stops bad trials early.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is successive halving?</summary><div class="qa-body">Start many candidates on a small budget (few rows or rounds), keep the best 1/factor, give them factor× more budget, repeat. With 48 candidates, factor 3 and 1,000 starting rows: 48 → 16 → 6 candidates on 1,000 → 3,000 → 9,000 rows, then the best survivor wins. Most of the compute goes to the few good candidates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is nested cross-validation and when do you need it?</summary><div class="qa-body">Outer folds estimate performance; inside each outer training part, an inner CV tunes hyperparameters. The outer score never sees rows used for choosing, so it is unbiased for "tune then train". Use it on small data or when comparing tuned models in a paper; with plenty of data a separate untouched test set does the job.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Early stopping chose 587 rounds with 5-fold CV. How many rounds do you use when you refit on all the data?</summary><div class="qa-body">About the same or slightly more, because more data supports a few more rounds; ~10–20% more is common. Here 587 and 675 rounds gave test AUC 0.9385 and 0.9389. Alternatively keep a small validation split and early-stop the final fit too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle a 1-in-20 positive rate with LightGBM?</summary><div class="qa-body">Judge with PR-AUC and precision/recall, not accuracy. Train normally or with scale_pos_weight = n_neg/n_pos; choose the threshold from costs (C_FP/(C_FP+C_FN)) or a recall target on validation. In our run, tuning the threshold to 0.13 gave recall 0.344 vs 0.176 at 0.5, better than reweighting. Resample only inside training folds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are random forest probabilities poorly calibrated, and how do you fix them?</summary><div class="qa-body">They are averages over trees that rarely all agree, so they are pulled toward the middle (said 0.11 when truth 0.04, 0.71 when truth 0.87). Fix with Platt scaling (sigmoid) or isotonic regression fitted on held-out predictions, e.g. CalibratedClassifierCV(cv=5): ECE 0.110 → 0.019, accuracy unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does scale_pos_weight do to predicted probabilities?</summary><div class="qa-body">It multiplies the positive class's weight by w, which roughly multiplies the predicted odds by w. A true 5% becomes about 50% with w = 19. Correct with p = p′/(p′ + w(1−p′)) or recalibrate. Ranking (AUC) is mostly unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A categorical column has 1,000 values, half with ≤ 5 rows. What are your options?</summary><div class="qa-body">CatBoost with cat_features (ordered target statistics), cross-fitted target encoding, or LightGBM native categorical with min_data_per_group/cat_smooth raised. Avoid naive target means (leaky: train AUC 0.877, test 0.741) and be careful with one-hot (thousands of sparse columns). In our run CatBoost won (0.765 test) with the smallest train-test gap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you make a credit model respect "more debt never lowers risk"?</summary><div class="qa-body">Monotone constraints: +1 for debt, −1 for income, in XGBoost/LightGBM/CatBoost/HistGB. The split search rejects splits that break the order. In our demo the unconstrained curve decreased at 42 of 100 steps; constrained, at 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you save a LightGBM model for production, and what else must you save?</summary><div class="qa-body">booster_.save_model("m.txt") (text, portable), or via MLflow. Also save library versions, the exact feature list and order, category mappings, preprocessing, the decision threshold and calibrator, and the training data window. Avoid relying on pickles across library upgrades.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is PSI and how do you read it?</summary><div class="qa-body">Population Stability Index = Σ (a − e)·ln(a/e) over bins of a feature, comparing production shares a to training shares e. &lt; 0.1 stable, 0.1–0.25 investigate, &gt; 0.25 major shift. In our example a shift of the bill distribution gave 0.248.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do tuning and production connect back to the rest of the tree family?</summary><div class="qa-body">Every knob is one of the family's ideas: tree size and leaf size come from <a class="xref" data-note="ml_dtree">Decision Trees</a>; max_features and subsampling from the bagging branch (<a class="xref" data-note="ml_rf">Random Forest</a>); learning rate and early stopping from <a class="xref" data-note="ml_boosting">How Boosting Works</a>; λ, γ, min_child_weight from <a class="xref" data-note="ml_xgboost">XGBoost</a>; categorical handling from <a class="xref" data-note="ml_catboost">CatBoost</a>. Importance from <a class="xref" data-note="ml_tree_explain">Feature Importance &amp; SHAP</a> decides which features to keep and which to monitor.</div></details>
</main>
`
});
