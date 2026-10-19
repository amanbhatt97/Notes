// notes/ml/ml_features.js — Feature Engineering
Object.assign(TOPIC_CONTENT, {
  "ml_features": `<main>
  <h1>Feature Engineering</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Feature Engineering</span></div>
  <p class="lead">A model only sees the columns you give it. Feature engineering is the work of turning raw data (numbers in odd units, text categories, blanks, timestamps, free text) into columns that make the pattern easy to learn. This note covers every standard technique, each worked by hand before the code: scaling (standard, min-max, robust), transforms (log, Box-Cox, Yeo-Johnson), binning, categorical encoding (one-hot, ordinal, target encoding with its leakage and smoothing, frequency, hashing), missing values (MCAR/MAR/MNAR, simple, KNN and iterative imputation, missing indicators), outliers, date and time features, a first look at text, interactions and polynomial features, and class imbalance (resampling, SMOTE, class weights). It ends with the scikit-learn transformer API that every one of these uses. The running example is the Foundations group's <strong>ten flats in Pune</strong>, now as the portal really stores them: area in square feet, locality as text, a missing age, a listing date, a free-text description, and one 5,000 sq ft bungalow that does not fit.</p>

  <h2 id="fe-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 250" width="660">
<defs><marker id="fea-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="18" text-anchor="middle" class="tm" font-size="11">Machine Learning › Foundations</text>
<rect x="20" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="90" y="61" text-anchor="middle" font-size="12.5">What is ML</text>
<rect x="180" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="250" y="61" text-anchor="middle" font-size="12.5">Splits &amp; CV</text>
<rect x="340" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="410" y="61" text-anchor="middle" font-size="12.5">Bias &amp; Variance</text>
<rect x="500" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="570" y="61" text-anchor="middle" font-size="12.5">Loss &amp; Grad. Descent</text>
<rect x="500" y="114" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="570" y="141" text-anchor="middle" font-size="12.5">Regularization</text>
<rect x="340" y="114" width="140" height="44" rx="8" class="fb sb" stroke-width="3"/>
<text x="410" y="134" text-anchor="middle" font-size="12.5" font-weight="700">Feature Engineering</text>
<text x="410" y="150" text-anchor="middle" class="tb" font-size="10.5">YOU ARE HERE</text>
<rect x="180" y="114" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="250" y="141" text-anchor="middle" font-size="12.5">Pipelines &amp; Leakage</text>
<line x1="160" y1="56" x2="178" y2="56" stroke="currentColor" marker-end="url(#fea-fa)"/>
<line x1="320" y1="56" x2="338" y2="56" stroke="currentColor" marker-end="url(#fea-fa)"/>
<line x1="480" y1="56" x2="498" y2="56" stroke="currentColor" marker-end="url(#fea-fa)"/>
<line x1="570" y1="78" x2="570" y2="112" stroke="currentColor" marker-end="url(#fea-fa)"/>
<line x1="500" y1="136" x2="482" y2="136" stroke="currentColor" marker-end="url(#fea-fa)"/>
<line x1="340" y1="136" x2="322" y2="136" stroke="currentColor" marker-end="url(#fea-fa)"/>
<text x="330" y="186" text-anchor="middle" class="tm" font-size="11">then every model group uses all seven ideas</text>
<rect x="40" y="196" width="130" height="34" rx="7" class="ft st"/><text x="105" y="217" text-anchor="middle" font-size="12">Regression</text>
<rect x="190" y="196" width="130" height="34" rx="7" class="ft st"/><text x="255" y="217" text-anchor="middle" font-size="12">Classification</text>
<rect x="340" y="196" width="130" height="34" rx="7" class="ft st"/><text x="405" y="217" text-anchor="middle" font-size="12">Trees</text>
<rect x="490" y="196" width="130" height="34" rx="7" class="ft st"/><text x="555" y="217" text-anchor="middle" font-size="12">Evaluation</text>
</svg><figcaption>The Foundations group. Feature engineering turns raw columns into what the model sees; the next note, Pipelines &amp; Leakage, makes sure those steps are learnt from training rows only.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_regularization">Regularization</a> and <a class="xref" data-note="ml_loss_gd">Loss &amp; Gradient Descent</a></b><span>Penalties on weight size and gradient descent both behave badly when one column is in thousands and another in single digits (on the flats: 8,549 GD steps with raw area, ridge almost switched off with area in sq ft); regularization quietly assumed the features were already scaled. And every model so far assumed clean numeric input: no text categories, no blanks, no timestamps. Real tables have all three.</span></li>
    <li><b>This note adds: the toolbox for building the input columns</b><span>How to rescale numbers, reshape skewed ones, turn categories and dates into numbers without inventing false meaning, fill holes honestly, tame outliers, create interactions, and rebalance rare classes. For each: when it helps, which models need it, and the leak it can cause. On the flats one engineered input, locality as 0/1 columns, cuts the honest error from 7.25 to 1.16.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a></b><span>Almost every step here learns something from data (a mean, a category list, a locality's average price). If it learns from validation or test rows, scores are inflated: naive target encoding of locality makes the flats' LOOCV look like 1.68 when the honest figure is 3.69. The next note packages these steps into a Pipeline so they are learnt from training rows only, inside every CV fold, and shipped as one object.</span></li>
  </ol>
  <p>You should know what a feature, a label and a train/test split are (<a class="xref" data-note="ml_intro">What is ML</a>, <a class="xref" data-note="ml_splits">Splits &amp; CV</a>) and roughly how linear models, KNN and trees make predictions. Where a model's behaviour matters, it is re-explained in a line.</p>

  <h2 id="fe-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Every step is applied to the ten flats.</p>
  <ol class="story">
    <li><b>What a feature is</b><span>Q: why touch the columns at all? → Because the model can only combine what it is given: area alone gives LOOCV MSE 7.25, area + locality as 0/1 columns 1.16. But raw columns come in wildly different units…</span></li>
    <li><b>Scaling</b><span>Q: how do we give columns a fair voice? → Standardise (area 5 … 14 → −1.567 … 1.567), min-max, or robust. One 5,000 sq ft bungalow squashes standard scaling (ten flats into −0.68 … 0.07); robust scaling survives. But scaling keeps the shape of a skewed column…</span></li>
    <li><b>Transforms</b><span>Q: how do we fix a long right tail? → Log or Box-Cox/Yeo-Johnson: prices 38 … 400 become 1.58 … 2.60. But a smooth transform cannot make a straight line bend…</span></li>
    <li><b>Binning</b><span>Q: can a linear model learn steps? → Cut age into bins: new (≤ 5), mid, old (&gt; 12). Now each band gets its own weight. But locality is not a number at all…</span></li>
    <li><b>Categorical encoding</b><span>Q: how do we turn words into numbers without inventing order? → One-hot (Baner, Hadapsar, Kothrud), ordinal for real order (1BHK &lt; 2BHK), target encoding (Baner 73.75 → smoothed 71.5) with its leak (1.68 vs an honest 3.69), counts, hashing. Then a value is simply missing…</span></li>
    <li><b>Missing values</b><span>Q: how do we fill flat G's unknown age? → It depends why it is missing: mean 7.33, KNN 7.5, iterative 11.97, truth 20; add a missing indicator. And some values are not missing but extreme…</span></li>
    <li><b>Outliers</b><span>Q: what do we do with the ₹400 lakh bungalow? → Detect with IQR fences [8.75, 130.75] or robust z (14.9), then clip, transform, or use a robust loss. Then there are columns that are dates…</span></li>
    <li><b>Date and time</b><span>Q: how does a model read "listed on 26 Jan 2024"? → Month, weekday, holiday flag, age at listing; months on a circle (Dec–Jan 0.518 apart, not 11). And the listing's description is free text…</span></li>
    <li><b>Text basics</b><span>Q: how do words become columns? → Bag of words and TF-IDF: "metro metro" in J's listing weighs 0.725. And some effects only appear in combination…</span></li>
    <li><b>Interactions and polynomials</b><span>Q: how does a linear model learn "depends on both"? → Products: (area, age) → 1, 5, 12, 25, 60, 144 for flat A; 6 columns → 28 at degree 2. So many columns; which should we keep?</span></li>
    <li><b>Feature selection</b><span>Q: which columns earn their place? → Filter, wrapper, embedded (lasso kept area, age, Baner). And when the label is rare?</span></li>
    <li><b>Class imbalance</b><span>Q: how do we make the rare class count? → Weights n/(k·n_c): 1.25 for the 4 fast sellers, 0.833 for the 6 slow; SMOTE between A and D: (6.2, 13.2). Mostly this moves the threshold. Finally, how does sklearn run all of this?</span></li>
    <li><b>sklearn transformers</b><span>Q: one interface for every step? → fit learns (mean_ = 9, categories_), transform applies (a new 1,400 sq ft flat → 1.531; unseen Wakad → zeros). Every learnt step leaks if fit on the wrong rows → <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</span></li>
  </ol>

  <h2 id="fe-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Feature Engineering</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Numbers</div>
        <ul>
          <li><b>Standard</b> (x − mean)/std · <b>min-max</b> (x − min)/(max − min) · <b>robust</b> (x − median)/IQR · maxabs x/max|x|</li>
          <li>Flats' area 5 … 14: mean 9.5, std 2.872 → z = −1.567 … 1.567; robust IQR 4.5</li>
          <li>Needed: KNN, SVM, k-means, PCA, regularized linear, nets · Not: trees, forests, boosting</li>
          <li><b>log / log1p</b> for right skew (skew 3.62 → 0.02) · <b>Box-Cox</b> (x &gt; 0), <b>Yeo-Johnson</b> (any sign), λ by max likelihood</li>
          <li><b>Binning</b>: equal width, equal frequency, domain (age new/mid/old); lets a linear model bend (R² 0.001 → 0.837)</li>
          <li><b>Outliers</b>: IQR fences (flats + bungalow: [8.75, 130.75]); robust z = 0.6745(x − med)/MAD; clip, transform or Huber</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Categories</div>
        <ul>
          <li><b>One-hot</b> — one 0/1 column each; handle_unknown="ignore" (Wakad → zeros); drop="first" for unregularized linear</li>
          <li><b>Ordinal</b> — only for real order (1BHK &lt; 2BHK &lt; 3BHK) or trees</li>
          <li><b>Target / mean</b> — (n·mean + m·global)/(n + m): Baner 73.75 → 71.5; ⚠ out-of-fold (flats 1.68 fake vs 3.69 honest; noise AUC 0.777)</li>
          <li><b>Count / frequency</b> — Hadapsar and Kothrud tie at 3</li>
          <li><b>Hashing</b> — |hash| mod m buckets; Baner and Kothrud collide at m = 4</li>
          <li>High cardinality: min_frequency, target enc., hashing, native (CatBoost/LightGBM), embeddings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Missing values</div>
        <ul>
          <li><b>MCAR</b> random · <b>MAR</b> depends on observed columns · <b>MNAR</b> depends on the missing value itself</li>
          <li>MAR: observed mean 53.3 vs true 50; fix by conditioning on age → 50.04; MNAR can't be fixed this way</li>
          <li><b>Simple</b> mean/median · <b>missing indicator</b> flag · flat G: mean 7.33, median 7 (truth 20)</li>
          <li><b>KNN</b> (nan-Euclidean; G → 7.5) · <b>Iterative</b> MICE (G → 11.97, uses "cheap for its size")</li>
          <li>Trees/HistGB handle NaN natively</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Time, text, interactions</div>
        <ul>
          <li><b>Date parts</b> month, day of week, weekend, holiday (26 Jan), age at listing</li>
          <li><b>Cyclical</b> sin/cos: Dec–Jan 0.518 apart, not 11; hours 23↔1 likewise</li>
          <li><b>Bag of words</b> counts · <b>TF-IDF</b> idf = ln((1+n)/(1+df)) + 1, then L2-normalise ("metro" 0.725)</li>
          <li><b>Interactions</b> a·b · <b>polynomial</b> degree 2 of d features → C(d+2, 2) columns (6 → 28, 50 → 1,326)</li>
          <li>Domain ratios beat brute force (distance feature: R² −0.013 → 0.937)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Class imbalance</div>
        <ul>
          <li>Accuracy lies: always "no" = 94.8%</li>
          <li><b>Class weight</b> n/(k·n_c): flats 6/4 → 0.833 and 1.25; 95/5 → 0.526 and 10</li>
          <li><b>Random over / under</b> sampling · <b>SMOTE</b> x + u·(neighbour − x): A, D → (6.2, 13.2)</li>
          <li>All mostly <b>move the threshold</b>: recall 0.46 → 0.86, precision 0.83 → 0.25, AUC ≈ 0.946–0.949</li>
          <li>⚠ Resample training folds only; prefer threshold tuning + right metric</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · sklearn API</div>
        <ul>
          <li><b>fit</b> learns (mean_, categories_, statistics_) · <b>transform</b> applies · fit_transform on train only</li>
          <li>StandardScaler, PowerTransformer, KBinsDiscretizer, OneHotEncoder, TargetEncoder, SimpleImputer, KNNImputer, IterativeImputer, PolynomialFeatures, FunctionTransformer</li>
          <li><b>ColumnTransformer</b> per-column steps · <code>set_output(transform="pandas")</code> · <code>get_feature_names_out()</code></li>
          <li>⚠ Every learnt step leaks if fit before the split → <a class="xref" data-note="ml_pipelines">Pipelines</a></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="fe-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="fe-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Feature Is</span><span class="rm-sub">One good column beats a better model</span></div></div>
      <div class="rm-item rm-done" data-target="fe-scale"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Numeric Scaling</span><span class="rm-sub">Standard, min-max, robust, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="fe-transform"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Transforms</span><span class="rm-sub">Log, Box-Cox, Yeo-Johnson</span></div></div>
      <div class="rm-item rm-done" data-target="fe-bin"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Binning</span><span class="rm-sub">Width, frequency, domain</span></div></div>
      <div class="rm-item rm-done" data-target="fe-cat"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Categorical Encoding</span><span class="rm-sub">One-hot to hashing</span></div></div>
      <div class="rm-item rm-done" data-target="fe-missing"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Missing Values</span><span class="rm-sub">Types and imputers</span></div></div>
      <div class="rm-item rm-done" data-target="fe-outliers"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Outliers</span><span class="rm-sub">Detect and treat</span></div></div>
      <div class="rm-item rm-done" data-target="fe-time"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Date &amp; Time</span><span class="rm-sub">Parts and cycles</span></div></div>
      <div class="rm-item rm-done" data-target="fe-text"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Text Basics</span><span class="rm-sub">Bag of words, TF-IDF</span></div></div>
      <div class="rm-item rm-done" data-target="fe-poly"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interactions &amp; Polynomials</span><span class="rm-sub">Products of columns</span></div></div>
      <div class="rm-item rm-done" data-target="fe-select"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Feature Selection</span><span class="rm-sub">Pointer to the full note</span></div></div>
      <div class="rm-item rm-done" data-target="fe-imb"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Class Imbalance</span><span class="rm-sub">Weights, resampling, SMOTE</span></div></div>
      <div class="rm-item rm-done" data-target="fe-sklearn"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">sklearn Transformers</span><span class="rm-sub">fit, transform, ColumnTransformer</span></div></div>
      <div class="rm-item rm-done" data-target="fe-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="fe-compare"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Which Step for Which Model</span><span class="rm-sub">Cheat-sheet tables</span></div></div>
      <div class="rm-item rm-done" data-target="fe-traps"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Leaks and silent bugs</span></div></div>
      <div class="rm-item rm-done" data-target="fe-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="fe-qa"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="fe-why"><span class="num">01</span>What a Feature Is, and Why Engineer It</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every earlier note fed the flats' model a tidy number: area in hundreds of square feet. The portal's real table holds area in square feet, locality as text, a blank age, listing dates and free-text descriptions. Does the way those columns are prepared change what a model can learn, or only how convenient the code is?</p>
  </div>
  <h3>The need</h3>
  <p>A <strong>feature</strong> is one input column the model reads. Raw data is rarely in the form that makes the pattern easy. The ten flats show it in miniature: the locality column holds words, and a linear model can only add up numbers times weights. Write locality as three 0/1 columns (Baner, Hadapsar, Kothrud) and the model can give each locality its own price level:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneOut, cross_val_score

# the portal's raw listing table for the ten flats
flats = pd.DataFrame({
    "area_sqft": [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400],
    "locality":  ["Hadapsar", "Baner", "Kothrud", "Hadapsar", "Baner",
                  "Kothrud", "Hadapsar", "Baner", "Kothrud", "Baner"],
    "price":     [38, 49, 53, 56, 67, 68, 73, 83, 87, 96]})
y = flats.price
raw = flats[["area_sqft"]]                                         # the only numeric column
eng = pd.concat([raw, pd.get_dummies(flats.locality, dtype=float)], axis=1)  # + locality as 0/1 columns
for name, X in [("area only", raw), ("area + locality 0/1", eng)]:
    mse = -cross_val_score(LinearRegression(), X, y, cv=LeaveOneOut(), scoring="neg_mean_squared_error").mean()
    print(f"{name:20s} columns {list(X.columns)}  LOOCV MSE {mse:.2f}")</div>
  <div class="fx" data-lang="text">area only            columns ['area_sqft']  LOOCV MSE 7.25
area + locality 0/1  columns ['area_sqft', 'Baner', 'Hadapsar', 'Kothrud']  LOOCV MSE 1.16</div>
  <p>Same ten flats, same linear model, same honest leave-one-out scoring: one engineered input cuts the error from 7.25 to 1.16. The bias–variance note called the 7.25 "irreducible error for this feature set"; it was reducible by building a better feature. At scale, a food-delivery company records pickup and drop-off coordinates, but delivery time depends on the <em>distance</em> between them, which is no single column:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(0)
n = 1000
pick = rng.uniform(0, 10, (n, 2))                     # pickup (x, y) on a 10 km city grid
drop = rng.uniform(0, 10, (n, 2))                     # drop-off (x, y)
dist = np.sqrt(((pick - drop) ** 2).sum(axis=1))      # straight-line km
minutes = 5 + 3 * dist + rng.normal(0, 2, n)          # delivery time

raw = np.c_[pick, drop]                               # 4 raw coordinate columns
eng = np.c_[raw, dist]                                # + 1 engineered column
for name, X in [("raw coordinates", raw), ("+ distance feature", eng)]:
    lin = cross_val_score(LinearRegression(), X, minutes, cv=5).mean()
    rf = cross_val_score(RandomForestRegressor(n_estimators=100, random_state=0, n_jobs=1),
                         X, minutes, cv=5).mean()
    print(f"{name:20s} linear R2 {lin:.3f}   random forest R2 {rf:.3f}")</div>
  <div class="fx" data-lang="text">raw coordinates      linear R2 -0.013   random forest R2 0.807
+ distance feature   linear R2 0.937   random forest R2 0.925</div>
  <p>With raw coordinates, the linear model explains nothing (R² −0.013). The random forest manages 0.807 by carving the space into boxes. Add the one engineered column and the linear model jumps to 0.937, beating the forest on raw columns. One good feature did more than a stronger algorithm.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An experienced broker does not judge a flat from its raw listing. She thinks "Baner, so add a premium", "price per sq ft is low for its age", "listed just before Diwali". Those summaries are not in any single field; she built them. Features are those summaries.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Feature engineering</strong>: creating, transforming, encoding and selecting input columns so that a model can learn the pattern more easily. It has two halves: <strong>representation</strong> (put existing information in a usable form: scaling, encoding, imputing) and <strong>creation</strong> (add information through domain knowledge: ratios, distances, counts, time since an event).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every engineered column must be computable at prediction time from data available then. "Days on market" or "final negotiated price" exist only after the flat sells. Ask of every feature: "would I know this when I make the prediction?" (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Numeric Scaling.</b> Even the numeric columns are not ready: area in square feet runs into the thousands, bedrooms are 1 to 4. Models that compare sizes across columns will listen to one and ignore the other. How do we give each column a fair voice?</div>

  <h2 id="fe-scale"><span class="num">02</span>Numeric Scaling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gradient descent on raw area took 8,549 steps and ridge barely noticed area in square feet. Distances suffer too: two flats 100 sq ft apart look 100 units apart, while a 5-year age difference looks like 5. How do we put columns on comparable scales, and which scaler survives an extreme value?</p>
  </div>
  <h3>The need</h3>
  <p>Flats B (600 sq ft, 3 years old) and C (700 sq ft, 8 years old). KNN measures similarity by distance between rows: √(100² + 5²) = 100.12. The age difference is invisible, just because square feet are big numbers. Scaling puts columns on comparable ranges so each gets a fair voice.</p>
  <h3>Four scalers, by hand on the ten areas</h3>
  <p>Area x (100 sq ft) = 5, 6, …, 14.</p>
  <ul>
    <li><strong>Standardisation</strong> z = (x − mean)/std. Mean = 95/10 = 9.5. Squared deviations sum to 82.5; divided by 10 = 8.25; std = √8.25 = 2.872 (sklearn divides by n, not n − 1). A: (5 − 9.5)/2.872 = −1.567; J: +1.567; E: −0.5/2.872 = −0.174.</li>
    <li><strong>Min-max</strong> (x − min)/(max − min) = (x − 5)/9 → 0, 0.111, …, 1.</li>
    <li><strong>Robust</strong> (x − median)/IQR. Median 9.5; numpy's quartiles are Q1 = 7.25, Q3 = 11.75, IQR = 4.5 → A: −4.5/4.5 = −1, J: +1.</li>
    <li><strong>Max-abs</strong> x / max|x| = x/14 → 0.357 … 1. Keeps zeros as zeros, so it is safe for sparse data.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, MaxAbsScaler

area = np.array([[5], [6], [7], [8], [9], [10], [11], [12], [13], [14]])   # flats A..J, 100 sq ft
for s in [StandardScaler(), MinMaxScaler(), RobustScaler(), MaxAbsScaler()]:
    print(f"{type(s).__name__:15s}", s.fit_transform(area).ravel().round(3))
sc = StandardScaler().fit(area)
print("learnt: mean_ =", sc.mean_, " scale_ =", sc.scale_.round(3))
rb = RobustScaler().fit(area)
print("learnt: center_ =", rb.center_, " scale_ (IQR) =", rb.scale_)</div>
  <div class="fx" data-lang="text">StandardScaler  [-1.567 -1.219 -0.87  -0.522 -0.174  0.174  0.522  0.87   1.219  1.567]
MinMaxScaler    [0.    0.111 0.222 0.333 0.444 0.556 0.667 0.778 0.889 1.   ]
RobustScaler    [-1.    -0.778 -0.556 -0.333 -0.111  0.111  0.333  0.556  0.778  1.   ]
MaxAbsScaler    [0.357 0.429 0.5   0.571 0.643 0.714 0.786 0.857 0.929 1.   ]
learnt: mean_ = [9.5]  scale_ = [2.872]
learnt: center_ = [9.5]  scale_ (IQR) = [4.5]</div>
  <p>The scaler <em>learns</em> numbers (<code>mean_</code> = 9.5, <code>scale_</code> = 2.872; for robust, centre 9.5 and IQR 4.5) in <code>fit</code> and reuses them for every later row. That is why it must be fit on training rows only.</p>
  <h3>What one outlier does</h3>
  <p>A 5,000 sq ft bungalow (x = 50) is listed alongside our ten flats. The mean jumps from 9.5 to 145/11 = 13.2 and the std to about 11.9:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

# the ten flats plus one 5,000 sq ft bungalow listed in Baner
area = np.array([[5], [6], [7], [8], [9], [10], [11], [12], [13], [14], [50]])
for s in [StandardScaler(), MinMaxScaler(), RobustScaler()]:
    print(f"{type(s).__name__:15s}", s.fit_transform(area).ravel().round(2))</div>
  <div class="fx" data-lang="text">StandardScaler  [-0.68 -0.6  -0.52 -0.43 -0.35 -0.27 -0.18 -0.1  -0.02  0.07  3.08]
MinMaxScaler    [0.   0.02 0.04 0.07 0.09 0.11 0.13 0.16 0.18 0.2  1.  ]
RobustScaler    [-1.  -0.8 -0.6 -0.4 -0.2  0.   0.2  0.4  0.6  0.8  8. ]</div>
  <p>Standard and min-max squash the ten ordinary flats into a narrow band (−0.68 to 0.07, or 0.00 to 0.20): the difference between a 500 and a 1,400 sq ft flat is now smaller than the gap to the bungalow. Robust scaling uses the median (10) and IQR (12.5 − 7.5 = 5), which one bungalow cannot move, so the ten flats keep their spread (−1 to 0.8) and only the bungalow flies off to 8.</p>
  <table class="tbl">
    <tr><th>Scaler</th><th>Formula</th><th>Result range</th><th>Use when</th><th>Weak spot</th></tr>
    <tr><td><code>StandardScaler</code></td><td>(x − mean)/std</td><td>mean 0, std 1, unbounded</td><td>default; roughly bell-shaped data; PCA, linear models, SVM</td><td>outliers inflate std</td></tr>
    <tr><td><code>MinMaxScaler</code></td><td>(x − min)/(max − min)</td><td>[0, 1]</td><td>bounded data (pixels 0–255), nets needing [0, 1]</td><td>one outlier squashes the rest</td></tr>
    <tr><td><code>RobustScaler</code></td><td>(x − median)/IQR</td><td>median 0, unbounded</td><td>outliers present</td><td>outliers stay large (not removed)</td></tr>
    <tr><td><code>MaxAbsScaler</code></td><td>x / max|x|</td><td>[−1, 1]</td><td>sparse data (keeps zeros)</td><td>outliers</td></tr>
    <tr><td><code>Normalizer</code></td><td>row / ‖row‖</td><td>each <em>row</em> length 1</td><td>text vectors, cosine similarity</td><td>works per row, not per column</td></tr>
  </table>
  <h3>When scaling matters and when it does not</h3>
  <p>Scaling matters for any model that compares sizes across columns: distances (KNN, k-means, SVM with RBF kernel), penalties on weight size (ridge, lasso, regularized logistic regression: <a class="xref" data-note="ml_regularization">Regularization</a>), gradient descent (badly scaled columns make the loss a long thin valley: <a class="xref" data-note="ml_loss_gd">Loss &amp; GD</a>, 8,549 steps vs 1 on the flats) and PCA (which chases variance). It does not matter for trees: a split asks "is x &gt; t?", and stretching x just moves t. At scale, on the wine data:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True)          # 13 columns: proline ~300-1700, hue ~0.5-1.7
models = {"KNN": KNeighborsClassifier(), "SVM (RBF)": SVC(),
          "Logistic": LogisticRegression(max_iter=10000), "Tree": DecisionTreeClassifier(random_state=0)}
for name, m in models.items():
    raw = cross_val_score(m, X, y, cv=5).mean()
    scaled = cross_val_score(make_pipeline(StandardScaler(), m), X, y, cv=5).mean()
    print(f"{name:10s} raw {raw:.3f}   scaled {scaled:.3f}")</div>
  <div class="fx" data-lang="text">KNN        raw 0.691   scaled 0.949
SVM (RBF)  raw 0.663   scaled 0.983
Logistic   raw 0.961   scaled 0.983
Tree       raw 0.888   scaled 0.888</div>
  <p>On the wine data (proline in the hundreds, hue near 1), KNN jumps from 0.691 to 0.949 and the RBF SVM from 0.663 to 0.983. Logistic regression gains less (0.961 → 0.983): it can compensate with weight sizes, but its default L2 penalty and solver still prefer scaled input. The tree does not move (0.888 both times).</p>
  <div class="cards">
    <div><b>Needs scaling</b><p>KNN, k-means, SVM, PCA, ridge/lasso/elastic net, regularized logistic, neural nets, anything trained by gradient descent</p><small>They compare magnitudes across columns</small></div>
    <div><b>Does not care</b><p>Decision trees, random forests, gradient boosting (XGBoost, LightGBM, CatBoost), Naive Bayes</p><small>Splits and per-feature likelihoods ignore units</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Feature scaling</strong>: a per-column linear map x → (x − c)/s with c and s learnt from training data, putting columns on comparable ranges. It changes no information (it is reversible) and does not change the shape of a distribution; for shape, use a transform (next section).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fitting the scaler on all rows before splitting leaks the test rows' mean and std into training. Fit on training rows (or inside each CV fold via a pipeline), then <code>transform</code> validation, test and production rows with those same numbers.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Transforms.</b> Scaling moves and stretches a column but keeps its shape. Prices across Pune run from ₹38 lakh to ₹4 crore, a long right tail that no linear rescaling can fold in. How do we change the shape?</div>

  <h2 id="fe-transform"><span class="num">03</span>Transforms: Log, Box-Cox, Yeo-Johnson</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>After standardising, the bungalow is still 3 standard deviations from everything else: the column is lopsided, not just badly scaled. Money and sizes are usually like that. Which transformation pulls in the long tail while keeping the order of the values?</p>
  </div>
  <h3>The need</h3>
  <p>Money, counts, sizes and durations are usually <strong>right-skewed</strong>: most values small, a long tail of huge ones. A linear model on such a column lets the few huge values dominate the fit, and the relationship with the target is often multiplicative ("10% more area adds a fixed amount") rather than additive. A transform changes the <em>shape</em> of the distribution, not just its range.</p>
  <h3>Log, by hand</h3>
  <p>Five Pune listings: flats A (₹38 lakh), E (67), J (96), a large flat (180) and the bungalow (400). log₁₀ gives 1.58, 1.83, 1.98, 2.26, 2.60. Each doubling became roughly the same step (+0.30), and the bungalow is now 0.34 above the large flat instead of 220 above it. Log turns ratios into differences. For counts that can be 0 (days on market), use log1p(x) = log(1 + x): 0 → 0, 9 → 2.30, 99 → 4.61.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.stats import skew

# prices (₹ lakh) of five Pune listings: three of our flats, a large flat and the bungalow
price = np.array([38, 67, 96, 180, 400.])
print("log10:", np.log10(price).round(2))
print("log1p of days-on-market counts [0, 1, 9, 99]:", np.log1p([0, 1, 9, 99]).round(2))
rng = np.random.default_rng(0)
big = rng.lognormal(10, 1, 5000)                       # a typical right-skewed money column
print(f"skewness raw {skew(big):.2f}   after log {skew(np.log(big)):.2f}")</div>
  <div class="fx" data-lang="text">log10: [1.58 1.83 1.98 2.26 2.6 ]
log1p of days-on-market counts [0, 1, 9, 99]: [0.   0.69 2.3  4.61]
skewness raw 3.62   after log 0.02</div>
  <p><strong>Skewness</strong> measures lopsidedness (0 = symmetric; above 1 = strongly right-skewed). A typical money column has skew 3.62; after log, 0.02.</p>
  <h3>Box-Cox, by hand</h3>
  <p>Log is one member of a family. Box-Cox (1964), for positive x:</p>
  <p style="text-align:center"><strong>x(λ) = (x^λ − 1)/λ</strong> for λ ≠ 0, and <strong>ln x</strong> for λ = 0</p>
  <p>λ = 1 is just a shift (x − 1), λ = 0.5 is a square-root-like squash, λ = 0 is log, negative λ squashes even harder. On x = (1, 4, 9): λ = 1 → (0, 3, 8); λ = 0.5 → (√x − 1)/0.5 = (0, 2, 4); λ = 0 → (0, 1.386, 2.197). The (x^λ − 1)/λ form is chosen so that the curve slides smoothly into ln x as λ → 0. The best λ is found by maximum likelihood: the λ under which the transformed data looks most like a normal distribution.</p>
  <h3>Yeo-Johnson, for zero and negative values</h3>
  <p>Box-Cox needs x &gt; 0. Yeo-Johnson (2000) extends it: for x ≥ 0 it is Box-Cox applied to x + 1, i.e. ((x + 1)^λ − 1)/λ; for x &lt; 0 it mirrors with power 2 − λ: −((1 − x)^(2−λ) − 1)/(2 − λ). By hand with λ = 0.5: x = 3 → (4^0.5 − 1)/0.5 = 2; x = 0 → 0; x = −1 → −(2^1.5 − 1)/1.5 = −1.219. Useful for signed columns such as "price minus the line" (the flats' residuals −3 … +3).</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
from sklearn.preprocessing import PowerTransformer

x = np.array([1., 4., 9.])
for lam in [1, 0.5, 0]:
    bc = np.log(x) if lam == 0 else (x ** lam - 1) / lam      # Box-Cox by the formula
    print(f"Box-Cox λ={lam:&lt;3}: {bc.round(3)}  scipy: {stats.boxcox(x, lmbda=lam).round(3)}")
z = np.array([-1., 0., 3.])
print("Yeo-Johnson λ=0.5 on [-1, 0, 3]:", stats.yeojohnson(z, lmbda=0.5).round(3))

rng = np.random.default_rng(0)
money = rng.lognormal(10, 1, (5000, 1))
for method in ["box-cox", "yeo-johnson"]:
    pt = PowerTransformer(method=method).fit(money)         # also standardises by default
    out = pt.transform(money).ravel()
    print(f"{method:11s} fitted λ = {pt.lambdas_[0]:.3f}   skew after = {stats.skew(out):.3f}")</div>
  <div class="fx" data-lang="text">Box-Cox λ=1  : [0. 3. 8.]  scipy: [0. 3. 8.]
Box-Cox λ=0.5: [0. 2. 4.]  scipy: [0. 2. 4.]
Box-Cox λ=0  : [0.    1.386 2.197]  scipy: [0.    1.386 2.197]
Yeo-Johnson λ=0.5 on [-1, 0, 3]: [-1.219  0.     2.   ]
box-cox     fitted λ = -0.007   skew after = 0.000
yeo-johnson fitted λ = -0.007   skew after = 0.000</div>
  <p>The hand values match scipy. <code>PowerTransformer</code> fits λ by maximum likelihood (here −0.007, essentially 0, which tells you "log is the right transform for this column") and then standardises. Skew goes to 0.</p>
  <h3>Does it help? A linear model on a skewed column</h3>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(1)
area = rng.lognormal(7, 0.8, 800)                      # flat sizes, very skewed
price = 40 * np.log(area) + rng.normal(0, 8, 800)      # price grows with log(area)
for name, X in [("raw area", area[:, None]), ("log(area)", np.log(area)[:, None])]:
    print(f"{name:10s} linear CV R2 = {cross_val_score(LinearRegression(), X, price, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">raw area   linear CV R2 = 0.644
log(area)  linear CV R2 = 0.932</div>
  <p>Across a city of 800 flats whose sizes are very skewed, price truly grows with log(area). Fed raw area, the straight line fits badly (R² 0.644); fed log(area), 0.932. (Our ten flats span only 500–1,400 sq ft, where a straight line in area is fine; transforms matter when the range is wide.) Two related tools: <code>QuantileTransformer</code> maps each value to its rank and then to a uniform or normal shape (very robust, but it forgets how far apart values were), and transforming the <em>target</em> (<code>TransformedTargetRegressor</code>, e.g. predict log price) when errors grow with the size of y.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Power transform</strong>: a monotone, invertible change of shape that makes a column more symmetric and closer to normal. Box-Cox (x &gt; 0), Yeo-Johnson (any x), λ chosen by maximum likelihood. Monotone means order is kept, so trees are unaffected; linear models, distance-based models and anything assuming normal-ish inputs benefit.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>np.log(0)</code> is −∞ and <code>np.log</code> of a negative is NaN, which silently breaks training. Use log1p for counts, Yeo-Johnson for signed values. And if you transform the target, transform predictions back (exp) before reporting errors in rupees; note that exp of a predicted mean log is the median, not the mean.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Binning.</b> Log and power transforms are smooth and monotone: a linear model on them still draws one smooth curve. What if the effect jumps between ranges, like "flats under 5 years old fetch a premium, older ones do not"?</div>

  <h2 id="fe-bin"><span class="num">04</span>Binning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A linear model gives age one weight: every extra year changes the price by the same amount. Buyers think in bands: new, a few years old, old. How can a linear model learn a different effect for each band?</p>
  </div>
  <h3>The idea</h3>
  <p><strong>Binning</strong> (discretisation) cuts a numeric column into ranges and replaces each value by its range. It throws away detail inside a bin, but it lets a linear model give each range its own weight, so the model can bend. It also makes a model robust to small measurement noise and outliers.</p>
  <h3>By hand: the ten flats' ages, three bins</h3>
  <p>Ages (years) sorted: 2 (H), 3 (B), 4 (J), 5 (E), 7 (I), 8 (C), 10 (F), 12 (A), 15 (D), 20 (G).</p>
  <ul>
    <li><strong>Equal width</strong>: (20 − 2)/3 = 6, so edges 2, 8, 14, 20. Bins hold 6, 2, 2 flats: lopsided, because the ages bunch at the young end.</li>
    <li><strong>Equal frequency</strong> (quantile): edges at the 1/3 and 2/3 quantiles, 5 and 10. Bins hold 4, 3, 3.</li>
    <li><strong>Domain</strong>: cut-offs that mean something to buyers: new ≤ 5 years, mid ≤ 12, old above. Bins hold 4, 4, 2.</li>
  </ul>
  <div class="fx" data-lang="py">import pandas as pd

flats = list("ABCDEFGHIJ")
ages = pd.Series([12, 3, 8, 15, 5, 10, 20, 2, 7, 4], index=flats)   # years since construction
width = pd.cut(ages, bins=3)                                         # equal width
freq = pd.qcut(ages, q=3)                                            # equal frequency (quantiles)
domain = pd.cut(ages, bins=[-1, 5, 12, 100], labels=["new", "mid", "old"])
table = pd.DataFrame({"age": ages, "equal-width": width, "equal-freq": freq, "domain": domain}).sort_values("age")
print(table.to_string())
print("counts equal-width:", width.value_counts(sort=False).tolist(), " equal-freq:", freq.value_counts(sort=False).tolist(),
      " domain:", domain.value_counts(sort=False).tolist())</div>
  <div class="fx" data-lang="text">   age   equal-width    equal-freq domain
H    2  (1.982, 8.0]  (1.999, 5.0]    new
B    3  (1.982, 8.0]  (1.999, 5.0]    new
J    4  (1.982, 8.0]  (1.999, 5.0]    new
E    5  (1.982, 8.0]  (1.999, 5.0]    new
I    7  (1.982, 8.0]   (5.0, 10.0]    mid
C    8  (1.982, 8.0]   (5.0, 10.0]    mid
F   10   (8.0, 14.0]   (5.0, 10.0]    mid
A   12   (8.0, 14.0]  (10.0, 20.0]    mid
D   15  (14.0, 20.0]  (10.0, 20.0]    old
G   20  (14.0, 20.0]  (10.0, 20.0]    old
counts equal-width: [6, 2, 2]  equal-freq: [4, 3, 3]  domain: [4, 4, 2]</div>
  <p>Equal width is sensitive to outliers (one 60-year-old building would stretch every bin); equal frequency adapts to the data; domain bins are the most interpretable and are often what the business already uses ("new construction", "resale").</p>
  <h3>The same idea at scale: binning lets a straight line bend</h3>
  <p>Spending peaks in middle age and falls on both sides: an upside-down U. A straight line in age cannot represent that. Eight quantile bins, one-hot encoded, give the linear model one weight per age band, a step-shaped curve.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import KBinsDiscretizer, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(0)
age = rng.uniform(18, 80, (1000, 1))
spend = 50 - 0.06 * (age[:, 0] - 48) ** 2 + rng.normal(0, 5, 1000)   # peaks in middle age
plain = LinearRegression()
binned = make_pipeline(KBinsDiscretizer(n_bins=8, encode="onehot", strategy="quantile",
                                        quantile_method="averaged_inverted_cdf"), LinearRegression())
for name, m in [("raw age", plain), ("8 quantile bins", binned)]:
    print(f"{name:16s} linear CV R2 = {cross_val_score(m, age, spend, cv=5).mean():.3f}")
kb = binned.fit(age, spend)[0]
print("bin edges:", kb.bin_edges_[0].round(1))</div>
  <div class="fx" data-lang="text">raw age          linear CV R2 = 0.001
8 quantile bins  linear CV R2 = 0.837
bin edges: [18.  26.9 35.  43.  50.8 58.2 65.4 72.2 80. ]</div>
  <p>R² from 0.001 to 0.837. The learnt bin edges come from training data (here 26.9, 35.0, … years), which is why <code>KBinsDiscretizer</code> is a fitted transformer like a scaler.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Binning a column for a tree model usually hurts: the tree already finds the best cut-offs itself (the intro's stump found "age ≥ 9" on its own), and binning removes its freedom. Binning also creates artificial jumps at the edges (age 5.0 and 5.1 in different bins). Splines or polynomial terms (<a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>) give smooth curves instead. And never choose bin edges by looking at the target on the full dataset; that is leakage.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Categorical Encoding.</b> Binning turns numbers into categories. The locality column is a category from the start, and it holds words. How do we turn Baner, Kothrud and Hadapsar into numbers without inventing an order?</div>

  <h2 id="fe-cat"><span class="num">05</span>Categorical Encoding</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Locality was worth more than any other column for the flats (LOOCV 7.25 → 1.16). But it is text. Numbering Baner = 0, Hadapsar = 1, Kothrud = 2 tells a linear model "Kothrud is twice Hadapsar". What are the honest ways to encode a category, and what does each risk?</p>
  </div>
  <h3>The need</h3>
  <p>A column like locality holds words. Models need numbers. The danger is inventing meaning: integer codes imply an order and a spacing that do not exist. Each encoding below is a different trade-off between honesty, number of columns and leakage risk.</p>
  <h3>One-hot and ordinal</h3>
  <p><strong>One-hot</strong>: one 0/1 column per category, 1 in the column of the row's category. By hand for flats A, B, C, D (Hadapsar, Baner, Kothrud, Hadapsar) with columns sorted Baner, Hadapsar, Kothrud: A → (0, 1, 0), B → (1, 0, 0), C → (0, 0, 1), D → (0, 1, 0). No order is implied; every locality is equally far from every other.</p>
  <p><strong>Ordinal</strong>: one integer per category, in a meaningful order. Flat type 1BHK &lt; 2BHK &lt; 3BHK &lt; 4BHK → 0, 1, 2, 3. Right only when the order is real (sizes, ratings, education levels), or for tree models, which can split integer codes anywhere.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

df = pd.DataFrame({"locality": ["Hadapsar", "Baner", "Kothrud", "Hadapsar"],     # flats A, B, C, D
                   "bhk": ["1BHK", "1BHK", "2BHK", "2BHK"]})
oh = OneHotEncoder(sparse_output=False, handle_unknown="ignore").fit(df[["locality"]])
print(oh.get_feature_names_out(), "\\n", oh.transform(df[["locality"]]))
print("unseen 'Wakad' -&gt;", oh.transform(pd.DataFrame({"locality": ["Wakad"]})))
drop = OneHotEncoder(sparse_output=False, drop="first").fit(df[["locality"]])
print("drop='first':", drop.get_feature_names_out())
od = OrdinalEncoder(categories=[["1BHK", "2BHK", "3BHK", "4BHK"]]).fit(df[["bhk"]])
print("ordinal bhk:", od.transform(df[["bhk"]]).ravel())</div>
  <div class="fx" data-lang="text">['locality_Baner' 'locality_Hadapsar' 'locality_Kothrud'] 
 [[0. 1. 0.]
 [1. 0. 0.]
 [0. 0. 1.]
 [0. 1. 0.]]
unseen 'Wakad' -&gt; [[0. 0. 0.]]
drop='first': ['locality_Hadapsar' 'locality_Kothrud']
ordinal bhk: [0. 0. 1. 1.]</div>
  <p>A listing in a new locality (Wakad) becomes all zeros with <code>handle_unknown="ignore"</code> instead of crashing in production. <code>drop="first"</code> removes one column (Baner becomes "all zeros"): with all three columns plus an intercept, the columns always add up to 1, an exact copy of the intercept (the <strong>dummy variable trap</strong>, perfect multicollinearity). Unregularized linear regression and statsmodels need the drop; regularized models and trees do not, and keeping all columns is easier to read. (sklearn's <code>LinearRegression</code> in section 01 coped with all three because its least-squares solver picks the minimum-norm answer.)</p>
  <h3>Target (mean) encoding, by hand</h3>
  <p>One-hot on a column with 1,000 PIN codes creates 1,000 mostly-zero columns. <strong>Target encoding</strong> replaces each category by the average target of that category: one numeric column, however many categories. For the flats' locality and price:</p>
  <table class="tbl">
    <tr><th>locality</th><th>prices</th><th>n</th><th>raw mean</th><th>smoothed, m = 2</th></tr>
    <tr><td>Baner</td><td>49, 67, 83, 96</td><td>4</td><td>73.75</td><td>(4·73.75 + 2·67)/(4 + 2) = 429/6 = 71.5</td></tr>
    <tr><td>Hadapsar</td><td>38, 56, 73</td><td>3</td><td>55.67</td><td>(167 + 134)/5 = 60.2</td></tr>
    <tr><td>Kothrud</td><td>53, 68, 87</td><td>3</td><td>69.33</td><td>(208 + 134)/5 = 68.4</td></tr>
  </table>
  <p>The global mean price is 67. A locality with only three flats is a shaky estimate, so <strong>smoothing</strong> blends the category mean with the global mean, trusting the category more when it has more rows:</p>
  <p style="text-align:center"><strong>enc(c) = (n_c · mean_c + m · global) / (n_c + m)</strong></p>
  <p>m acts like "m imaginary flats at the global price". With m = 2, Hadapsar rises from 55.67 to 60.2 and Baner, with more rows, moves less (73.75 → 71.5). sklearn's <code>TargetEncoder(smooth=m)</code> uses exactly this formula (its default <code>smooth="auto"</code> picks m per category from the variances, an empirical-Bayes estimate):</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.preprocessing import TargetEncoder

df = pd.DataFrame({"locality": list("HBKHBKHBKB"),                 # H = Hadapsar, B = Baner, K = Kothrud
                   "price": [38, 49, 53, 56, 67, 68, 73, 83, 87, 96]})
glob = df.price.mean()
stats = df.groupby("locality").price.agg(["count", "mean"])
m = 2                                                    # smoothing strength
stats["smoothed"] = (stats["count"] * stats["mean"] + m * glob) / (stats["count"] + m)
print("global mean:", glob); print(stats.round(3))
te = TargetEncoder(smooth=m, target_type="continuous").fit(df[["locality"]], df.price)
print("sklearn categories:", te.categories_[0], " encodings_:", np.round(te.encodings_[0], 3))</div>
  <div class="fx" data-lang="text">global mean: 67.0
          count    mean  smoothed
locality                         
B             4  73.750      71.5
H             3  55.667      60.2
K             3  69.333      68.4
sklearn categories: ['B' 'H' 'K']  encodings_: [71.5 60.2 68.4]</div>
  <h3>Why naive target encoding leaks</h3>
  <p>Look at flat J: its encoding 73.75 is the mean of B, E, H <em>and J itself</em>. Without J the Baner mean is 66.33. The feature contains part of the answer it is meant to help predict. With few rows per category, the model learns from that self-reference, which will not exist for new flats. On the flats:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, LeaveOneOut, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import TargetEncoder

df = pd.DataFrame({"area": np.arange(5, 15), "locality": list("HBKHBKHBKB"),
                   "price": [38, 49, 53, 56, 67, 68, 73, 83, 87, 96]})
y = df.price
# naive: locality mean price computed on ALL ten flats, each flat's own price included
df["loc_mean_naive"] = df.locality.map(df.groupby("locality").price.mean())
print("flat J's naive encoding (Baner mean incl. J):", df.loc[9, "loc_mean_naive"],
      "  without J:", df[(df.locality == "B") &amp; (df.index != 9)].price.mean().round(2))
naive = -cross_val_score(LinearRegression(), df[["area", "loc_mean_naive"]], y, cv=LeaveOneOut(),
                         scoring="neg_mean_squared_error").mean()
def honest(seed):    # TargetEncoder cross-fits inside each training fold; its inner split is shuffled
    te = TargetEncoder(smooth=2, cv=KFold(3, shuffle=True, random_state=seed), target_type="continuous")
    return make_pipeline(ColumnTransformer([("te", te, ["locality"])], remainder="passthrough"), LinearRegression())
fair = [-cross_val_score(honest(s), df[["area", "locality"]], y, cv=LeaveOneOut(),
                         scoring="neg_mean_squared_error").mean() for s in range(20)]
print(f"LOOCV MSE, naive target encoding (fit on all rows): {naive:.2f}")
print(f"LOOCV MSE, TargetEncoder inside each fold, 20 inner shuffles: median {np.median(fair):.2f}, "
      f"range {min(fair):.2f} to {max(fair):.2f}")</div>
  <div class="fx" data-lang="text">flat J's naive encoding (Baner mean incl. J): 73.75   without J: 66.33
LOOCV MSE, naive target encoding (fit on all rows): 1.68
LOOCV MSE, TargetEncoder inside each fold, 20 inner shuffles: median 3.69, range 1.94 to 8.08</div>
  <p>The naive version reports LOOCV MSE 1.68; the honest version, with the encoder fitted inside each fold so the held-out flat's price never enters its own encoding, reports a median of 3.69. That honest figure wobbles (1.94 to 8.08) because <code>TargetEncoder</code> cross-fits again inside each training fold with a shuffled 3-way split of only nine flats; the leaky 1.68 is better than even the luckiest honest run. The naive number is not a better model; it is a leaky measurement, about twice as optimistic. (With three or four flats per locality, plain one-hot columns at 1.16 are the better choice here anyway; target encoding earns its keep with hundreds of categories.) At scale, on a target that is pure noise:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, TargetEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = pd.DataFrame({"zip": rng.choice([f"z{i}" for i in range(1000)], 5000)})  # 1,000 categories
y = (rng.random(5000) &lt; 0.3).astype(int)                  # target is pure noise
print("one-hot columns:", OneHotEncoder().fit_transform(X).shape[1])
print("one-hot, min_frequency=8:", OneHotEncoder(min_frequency=8).fit_transform(X).shape[1])

naive = X.zip.map(pd.Series(y).groupby(X.zip).mean()).to_frame()   # mean target per zip, ALL rows
print("naive target-mean AUC:", cross_val_score(LogisticRegression(), naive, y, cv=5, scoring="roc_auc").mean().round(3))
pipe = make_pipeline(TargetEncoder(cv=StratifiedKFold(5, shuffle=True, random_state=0)), LogisticRegression())   # cross-fitted, seeded
print("TargetEncoder pipe AUC:", cross_val_score(pipe, X, y, cv=5, scoring="roc_auc").mean().round(3))</div>
  <div class="fx" data-lang="text">one-hot columns: 994
one-hot, min_frequency=8: 121
naive target-mean AUC: 0.777
TargetEncoder pipe AUC: 0.495</div>
  <p>The target is random, so an honest score is AUC 0.5. Naive encoding computed on all rows scores 0.777: with about 5 rows per zip, each row's own label moves its zip's mean. sklearn's <code>TargetEncoder</code> uses <strong>cross fitting</strong> in <code>fit_transform</code>: it splits the training rows into folds and encodes each fold's rows with means computed from the other folds, so no row ever sees its own label. The fake signal disappears (0.495). At prediction time (<code>transform</code>), it uses means from all training rows. Also shown: <code>min_frequency=8</code> groups rare zips into one "infrequent" column, shrinking one-hot from 994 to 121 columns.</p>
  <h3>Count, frequency and hashing</h3>
  <p><strong>Count / frequency encoding</strong>: replace a category by how many rows have it (or that share). For the flats: Baner → 4 (0.4), Hadapsar → 3 (0.3), Kothrud → 3 (0.3). Uses no target, so no target leakage; useful when popularity itself matters (a rare merchant is suspicious). Two categories with equal counts become indistinguishable: Hadapsar and Kothrud are now the same number.</p>
  <p><strong>Hashing trick</strong>: pass the category string through a hash function and keep |hash| mod m as a column index, with the hash's sign as ±1. No vocabulary to store, fixed width m, and brand-new categories work automatically, which suits huge or open-ended vocabularies (user agents, URLs, words). The price is <strong>collisions</strong>: different categories can land in the same column.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.feature_extraction import FeatureHasher
from sklearn.utils import murmurhash3_32

s = pd.Series(["Hadapsar", "Baner", "Kothrud", "Hadapsar", "Baner",
               "Kothrud", "Hadapsar", "Baner", "Kothrud", "Baner"])       # flats A..J
print("count encoding:", s.map(s.value_counts()).tolist())
print("frequency enc.:", s.map(s.value_counts(normalize=True)).tolist())
for c in ["Baner", "Kothrud", "Hadapsar", "Wakad"]:
    h = murmurhash3_32(c, seed=0)                         # the hash FeatureHasher uses
    print(f"{c:8s} hash={h:12d}  bucket=|h| % 4 = {abs(h) % 4}  sign={'+' if h &gt;= 0 else '-'}")
fh = FeatureHasher(n_features=4, input_type="string")
print(fh.transform([[c] for c in ["Baner", "Kothrud", "Hadapsar", "Wakad"]]).toarray())</div>
  <div class="fx" data-lang="text">count encoding: [3, 4, 3, 3, 4, 3, 3, 4, 3, 4]
frequency enc.: [0.3, 0.4, 0.3, 0.3, 0.4, 0.3, 0.3, 0.4, 0.3, 0.4]
Baner    hash=   546626403  bucket=|h| % 4 = 3  sign=+
Kothrud  hash=   988271803  bucket=|h| % 4 = 3  sign=+
Hadapsar hash=  -839561346  bucket=|h| % 4 = 2  sign=-
Wakad    hash=   -59743384  bucket=|h| % 4 = 0  sign=-
[[ 0.  0.  0.  1.]
 [ 0.  0.  0.  1.]
 [ 0.  0. -1.  0.]
 [-1.  0.  0.  0.]]</div>
  <p>By hand from the printed hashes with m = 4: Baner → 546626403 mod 4 = 3, Kothrud → 3, Hadapsar → |−839561346| mod 4 = 2, and the new Wakad → 0. Baner and Kothrud collide in column 3, so this model cannot tell them apart. With m = 2²⁰ (sklearn's default) collisions are rare; the sign trick makes colliding values partly cancel instead of always adding up.</p>
  <table class="tbl">
    <tr><th>Encoding</th><th>Columns</th><th>Uses target?</th><th>Best for</th><th>Watch out</th></tr>
    <tr><td>One-hot</td><td>one per category</td><td>no</td><td>nominal, up to ~50 categories, any model</td><td>width; unseen → ignore; dummy trap</td></tr>
    <tr><td>Ordinal</td><td>1</td><td>no</td><td>ordered categories (BHK); trees</td><td>fake order for linear models</td></tr>
    <tr><td>Target / mean</td><td>1 (per class)</td><td><strong>yes</strong></td><td>high cardinality</td><td>leaks unless out-of-fold; smooth rare ones</td></tr>
    <tr><td>Count / frequency</td><td>1</td><td>no</td><td>when popularity matters</td><td>ties merge categories</td></tr>
    <tr><td>Hashing</td><td>m (fixed)</td><td>no</td><td>huge / open vocabularies, streaming</td><td>collisions; not invertible</td></tr>
    <tr><td>Native / embeddings</td><td>–</td><td>–</td><td>CatBoost, LightGBM, HistGB; neural nets</td><td>library-specific</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cardinality</strong>: the number of distinct values in a categorical column. Low cardinality (3 localities) → one-hot. High cardinality (PIN codes, society names, merchant IDs) → target encoding (out-of-fold, smoothed), hashing, grouping rare values (<code>min_frequency</code>, <code>max_categories</code>), or a model with native categorical support (<a class="xref" data-note="ml_catboost">CatBoost</a> uses ordered target statistics, its own leak-free target encoding).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>LabelEncoder</code> is for the target y, not features: it sorts categories alphabetically, which imposes a meaningless order and cannot handle unseen values in a pipeline. For features use <code>OrdinalEncoder</code> (with explicit <code>categories=</code> when the order matters) or <code>OneHotEncoder</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Missing Values.</b> Every encoder assumed each flat has a value. Flat G's age was never recorded. What do we put in the hole, and does it matter why the hole is there?</div>

  <h2 id="fe-missing"><span class="num">06</span>Missing Values</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The seller of flat G left the "age of building" field blank. Most models refuse a blank. Filling it with the average age is easy, but G is in fact 20 years old, by far the oldest. Can we fill holes in a way that does not mislead the model, and how would we know?</p>
  </div>
  <h3>Why the reason for a blank matters</h3>
  <p>Before filling a hole, ask <em>why</em> it is empty. Statisticians (Rubin, 1976) name three mechanisms:</p>
  <ul>
    <li><strong>MCAR</strong> (missing completely at random): the blank has nothing to do with any value. A form field failed to save. Rows with blanks are a random subset.</li>
    <li><strong>MAR</strong> (missing at random, given what you observe): the chance of a blank depends on other <em>observed</em> columns. Listings from one agency (recorded) skip the age field more often.</li>
    <li><strong>MNAR</strong> (missing not at random): the chance depends on the missing value itself. Sellers of old buildings leave "age" blank because the answer hurts the price. Flat G is probably this case.</li>
  </ul>
  <p>A simulation of 100,000 people whose income (true mean 50) rises with age, with about 30% of incomes hidden under each mechanism:</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(0)
n = 100000
age = rng.uniform(20, 60, n)
income = 10 + 1.0 * age + rng.normal(0, 8, n)          # thousand rupees; rises with age
p_mcar = np.full(n, 0.3)                                 # everyone equally likely to skip
p_mar = np.where(age &lt; 35, 0.6, 0.1)                     # young people skip more (age is observed)
p_mnar = np.where(income &gt; 55, 0.6, 0.1)                 # high earners skip more (depends on income itself)
print(f"true mean income: {income.mean():.2f}")
for name, p in [("MCAR", p_mcar), ("MAR", p_mar), ("MNAR", p_mnar)]:
    seen = rng.random(n) &gt; p
    by_age = np.zeros(n)                                 # impute with the mean of the same age band
    bands = (age // 5).astype(int)
    for b in np.unique(bands):
        by_age[bands == b] = income[seen &amp; (bands == b)].mean()
    filled = np.where(seen, income, by_age)
    print(f"{name:4s}: {100 * (1 - seen.mean()):4.1f}% missing   observed mean {income[seen].mean():.2f}"
          f"   after age-band imputation {filled.mean():.2f}")</div>
  <div class="fx" data-lang="text">true mean income: 50.00
MCAR: 30.0% missing   observed mean 50.06   after age-band imputation 50.04
MAR : 28.5% missing   observed mean 53.30   after age-band imputation 50.04
MNAR: 28.8% missing   observed mean 46.13   after age-band imputation 48.73</div>
  <p>Under MCAR the observed rows are a fair sample (50.06). Under MAR the observed mean is biased (53.30, because the young, lower earners are under-represented), but filling each blank with the mean of the same age band recovers the truth (50.04): conditioning on the observed cause removes the bias. Under MNAR the observed mean is biased the other way (46.13) and using age helps only a little (48.73); the cause of missingness is the hidden value itself, which no observed column fully explains.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>You can never prove MCAR vs MNAR from the data alone; it needs domain knowledge. Practical consequence: under MAR, imputation that uses other columns (KNN, iterative) is the right tool; under MNAR, the fact that a value is missing is itself information, so add a <strong>missing indicator</strong> column and let the model use it.</p>
  </div>
  <h3>Filling flat G's age, four ways</h3>
  <p>The nine known ages are 12, 3, 8, 15, 5, 10, 2, 7, 4.</p>
  <ul>
    <li><strong>Mean</strong>: 66/9 = 7.33. <strong>Median</strong>: sorted 2, 3, 4, 5, 7, 8, 10, 12, 15 → the 5th value, 7.</li>
    <li><strong>KNN</strong> (k = 2): find the two flats most like G on the columns G does have (area 11, price 73), with the nan-Euclidean distance √(weight × Σ squared differences over shared columns), weight = total/shared = 3/2. F (10, 68): √(1.5 × (1 + 25)) = 6.24; E (9, 67): √(1.5 × (4 + 36)) = 7.75; H (12, 83): √(1.5 × (1 + 100)) = 12.31. Neighbours F and E have ages 10 and 5 → fill 7.5.</li>
    <li><strong>Iterative</strong> (MICE): treat age as a target and regress it on area and price using the nine known flats, predict G, and cycle through columns with holes for several rounds (Multiple Imputation by Chained Equations). The regression has learnt "flats cheap for their size are older"; G is ₹3 lakh below the area line, so it fills 11.97.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.experimental import enable_iterative_imputer  # noqa: F401 (switches the class on)
from sklearn.impute import SimpleImputer, KNNImputer, IterativeImputer
from sklearn.linear_model import LinearRegression

area  = np.arange(5, 15, dtype=float)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
age   = np.array([12, 3, 8, 15, 5, 10, np.nan, 2, 7, 4])     # flat G's age was not recorded (truly 20)
X = np.c_[area, price, age]
print("observed ages:", age[~np.isnan(age)], " mean", np.nanmean(age).round(3), " median", np.nanmedian(age))
for name, imp in [("mean", SimpleImputer(strategy="mean")), ("median", SimpleImputer(strategy="median")),
                  ("KNN k=2", KNNImputer(n_neighbors=2)),
                  ("iterative", IterativeImputer(estimator=LinearRegression(), random_state=0))]:
    print(f"{name:9s} fills G's age with {imp.fit_transform(X)[6, 2]:6.2f}   (true value 20)")
print("median + indicator, last two columns for G:", SimpleImputer(strategy="median", add_indicator=True).fit_transform(X)[6, 2:])
# the "price below the line" signal: residual of G from price = 6 x area + 10
print("G's price vs the area line:", price[6] - (6 * area[6] + 10))</div>
  <div class="fx" data-lang="text">observed ages: [12.  3.  8. 15.  5. 10.  2.  7.  4.]  mean 7.333  median 7.0
mean      fills G's age with   7.33   (true value 20)
median    fills G's age with   7.00   (true value 20)
KNN k=2   fills G's age with   7.50   (true value 20)
iterative fills G's age with  11.97   (true value 20)
median + indicator, last two columns for G: [7. 1.]
G's price vs the area line: -3.0</div>
  <p>The truth is 20. Mean, median and KNN all guess "a typical flat" (7–7.5) because they ignore the one clue that G is cheap for its size. Iterative imputation uses that clue and gets closer (11.97), but cannot reach 20 from nine flats. The <strong>indicator</strong> column (1 for G) lets the model learn "a blank age means older and cheaper", which is the right response to MNAR. Simple imputation also shrinks a column's variance (many identical fills) and weakens its correlations; the indicator gives the model a way to treat filled rows differently.</p>
  <h3>Comparing imputers at scale</h3>
  <p>442 diabetes patients; we hide values of bmi and s5 (the two strongest predictors) with MAR missingness: older patients miss a test 50% of the time, younger 10%. Since we know the hidden values, we can measure how close each fill is (in standard deviations), and how a ridge model does after each imputer:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.experimental import enable_iterative_imputer  # noqa: F401
from sklearn.impute import SimpleImputer, KNNImputer, IterativeImputer
from sklearn.linear_model import Ridge
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

X, y = load_diabetes(return_X_y=True)
rng = np.random.default_rng(0)
Xm = X.copy()
older = X[:, 0] &gt; np.median(X[:, 0])                      # MAR: older patients miss more tests
for col in [2, 8]:                                        # bmi and s5, the two strongest features
    Xm[(rng.random(len(X)) &lt; np.where(older, 0.5, 0.1)), col] = np.nan
mask = np.isnan(Xm)
print(f"{mask.any(axis=1).mean():.0%} of rows have a hole")
imputers = {"mean": SimpleImputer(), "mean + indicator": SimpleImputer(add_indicator=True),
            "KNN k=5": KNNImputer(), "iterative": IterativeImputer(random_state=0)}
for name, imp in imputers.items():
    filled = imp.fit_transform(Xm)[:, :X.shape[1]]
    err = np.sqrt(((filled[mask] - X[mask]) ** 2).mean()) / X[mask].std()
    r2 = cross_val_score(make_pipeline(imp, Ridge(alpha=0.1)), Xm, y, cv=5).mean()
    print(f"{name:17s} fill error (in SDs) {err:.3f}   ridge CV R2 {r2:.3f}")
print(f"{'no missing values':17s} {'':25s}   ridge CV R2 {cross_val_score(Ridge(alpha=0.1), X, y, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">42% of rows have a hole
mean              fill error (in SDs) 1.020   ridge CV R2 0.422
mean + indicator  fill error (in SDs) 1.020   ridge CV R2 0.423
KNN k=5           fill error (in SDs) 0.908   ridge CV R2 0.426
iterative         fill error (in SDs) 0.655   ridge CV R2 0.451
no missing values                             ridge CV R2 0.480</div>
  <p>Mean filling is off by about one standard deviation (it ignores everything about the patient). KNN does a little better (0.908), and iterative imputation, which exploits the correlations between columns, is much closer (0.655) and gives the best downstream R² (0.451, against 0.480 with no missing data at all). The indicator adds little here because the missingness depends on age, which the model already sees: the MAR case, unlike flat G's.</p>
  <table class="tbl">
    <tr><th>Method</th><th>Uses other columns?</th><th>Cost</th><th>Good for</th></tr>
    <tr><td>Drop rows</td><td>–</td><td>none</td><td>very few blanks, MCAR (otherwise biased and wasteful: dropping G loses the oldest flat)</td></tr>
    <tr><td>Mean / median / mode</td><td>no</td><td>tiny</td><td>baseline; trees; with an indicator</td></tr>
    <tr><td>Constant + indicator</td><td>no</td><td>tiny</td><td>MNAR ("missing" means something)</td></tr>
    <tr><td>KNN imputer</td><td>yes (similar rows)</td><td>O(n²) distances</td><td>small/medium data, local structure</td></tr>
    <tr><td>Iterative (MICE)</td><td>yes (regressions)</td><td>several model fits per column</td><td>MAR with correlated columns</td></tr>
    <tr><td>Native NaN handling</td><td>model decides</td><td>none</td><td>HistGradientBoosting, XGBoost, LightGBM, sklearn trees ≥ 1.3 (<a class="xref" data-note="ml_dtree">Decision Trees</a>)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Imputers learn statistics (means, neighbours, regressions). Fitting them on all rows before the split leaks test information. Also: never impute the target, and do not let an imputer use the target column as a predictor at prediction time (here: the iterative imputer used price to fill age; that is fine for training rows only if price is a feature, not if price is what you are predicting for a new listing).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Outliers.</b> A blank is one kind of awkward value. Another is a value that is present but extreme: the ₹400 lakh bungalow among ₹38–96 lakh flats. Is it an error, a different kind of property, or just rare, and what should the model see?</div>

  <h2 id="fe-outliers"><span class="num">07</span>Outliers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The bungalow squashed the standard scaler, and in the loss-functions note one mistyped price (96 → 69) bent the fitted slope from 6 to 4.53. How do we detect values like these reliably, and once found, what should we do with them?</p>
  </div>
  <h3>Detecting them, by hand</h3>
  <p>Eleven prices (₹ lakh): the ten flats 38, 49, 53, 56, 67, 68, 73, 83, 87, 96 and the bungalow 400.</p>
  <ul>
    <li><strong>IQR rule</strong> (Tukey): numpy's linear interpolation gives Q1 = 54.5 (position 2.5: halfway between 53 and 56) and Q3 = 85 (position 7.5: halfway between 83 and 87), IQR = 30.5. Fences: 54.5 − 1.5 × 30.5 = 8.75 and 85 + 45.75 = 130.75. 400 is outside → outlier.</li>
    <li><strong>z-score</strong> |x − mean|/std &gt; 3: mean = 1070/11 = 97.27, std = 97.15. z(400) = 302.7/97.15 = 3.12: just over 3. The outlier inflated the mean and std it is judged by. Add a second bungalow (₹380 lakh) and both z-scores fall below 3 (2.30, 2.13): the outliers hide each other (<strong>masking</strong>).</li>
    <li><strong>Robust z</strong> = 0.6745 × (x − median)/MAD, MAD = median of |x − median|. Median 68; absolute deviations 30, 19, 15, 12, 1, 0, 5, 15, 19, 28, 332; their median = 15. Robust z(400) = 0.6745 × 332/15 = 14.9: unmistakable. (0.6745 makes MAD comparable to a std for normal data.)</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np

# prices of the ten flats plus the 5,000 sq ft bungalow (₹ lakh)
x = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96, 400.])
q1, q3 = np.percentile(x, [25, 75]); iqr = q3 - q1
lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(f"Q1={q1} Q3={q3} IQR={iqr}  fences [{lo}, {hi}]  outliers: {x[(x &lt; lo) | (x &gt; hi)]}")
z = (x - x.mean()) / x.std()
print(f"mean={x.mean():.2f} std={x.std():.2f}  z(400) = {z[-1]:.2f}")
med = np.median(x); mad = np.median(np.abs(x - med))
rz = 0.6745 * (x - med) / mad
print(f"median={med} MAD={mad}  robust z: {rz.round(2)}")
print("clipped to fences:", np.clip(x, lo, hi))
x2 = np.r_[x, 380.]                                  # a second bungalow is listed
z2 = (x2 - x2.mean()) / x2.std()
print(f"with two bungalows: z = {z2[-2:].round(2)}  (masking: both below 3)   robust z = "
      f"{(0.6745 * (x2 - np.median(x2)) / np.median(np.abs(x2 - np.median(x2))))[-2:].round(2)}")</div>
  <div class="fx" data-lang="text">Q1=54.5 Q3=85.0 IQR=30.5  fences [8.75, 130.75]  outliers: [400.]
mean=97.27 std=97.15  z(400) = 3.12
median=68.0 MAD=15.0  robust z: [-1.35 -0.85 -0.67 -0.54 -0.04  0.    0.22  0.67  0.85  1.26 14.93]
clipped to fences: [ 38.    49.    53.    56.    67.    68.    73.    83.    87.    96.
 130.75]
with two bungalows: z = [2.3  2.13]  (masking: both below 3)   robust z = [13.07 12.28]</div>
  <h3>Why they matter, and what to do</h3>
  <p>Squared-error models give an extreme row enormous pull. On the flats with J's price mistyped (as in <a class="xref" data-note="ml_loss_gd">Loss &amp; GD</a>):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, HuberRegressor

area  = np.arange(5, 15, dtype=float).reshape(-1, 1)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
typo = price.copy(); typo[9] = 69                     # flat J's 96 typed as 69
for name, model, target in [("OLS, clean data", LinearRegression(), price),
                            ("OLS, one bad row", LinearRegression(), typo),
                            ("Huber, one bad row", HuberRegressor(), typo)]:
    print(f"{name:20s} slope = {model.fit(area, target).coef_[0]:.3f}")</div>
  <div class="fx" data-lang="text">OLS, clean data      slope = 6.000
OLS, one bad row     slope = 4.527
Huber, one bad row   slope = 5.579</div>
  <p>One bad row out of ten drags the least-squares slope from 6.00 to 4.53. <code>HuberRegressor</code> caps each row's pull (<a class="xref" data-note="ml_loss_gd">Huber loss</a>): slope 5.58. The same at scale, twenty points with one data-entry error:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, HuberRegressor

rng = np.random.default_rng(0)
x = np.arange(1, 21, dtype=float)[:, None]
y = 2 * x[:, 0] + rng.normal(0, 1, 20)
y_bad = y.copy(); y_bad[19] = 0                       # one data-entry error at x = 20
for name, model, target in [("OLS, clean data", LinearRegression(), y),
                            ("OLS, one bad row", LinearRegression(), y_bad),
                            ("Huber, one bad row", HuberRegressor(), y_bad)]:
    print(f"{name:20s} slope = {model.fit(x, target).coef_[0]:.3f}")</div>
  <div class="fx" data-lang="text">OLS, clean data      slope = 1.972
OLS, one bad row     slope = 1.386
Huber, one bad row   slope = 1.936</div>
  <table class="tbl">
    <tr><th>Treatment</th><th>How</th><th>When</th></tr>
    <tr><td>Fix or remove</td><td>correct typos (69 → 96), drop impossible values (area 0)</td><td>clear data errors</td></tr>
    <tr><td>Clip / winsorise</td><td>cap at fences or percentiles (400 → 130.75)</td><td>genuine but extreme values distorting a linear model</td></tr>
    <tr><td>Transform</td><td>log, Yeo-Johnson, RobustScaler</td><td>skewed columns with a long tail</td></tr>
    <tr><td>Robust model / loss</td><td>Huber, quantile regression, trees</td><td>you want to keep the rows</td></tr>
    <tr><td>Separate model or segment</td><td>bungalows priced by their own model</td><td>the outlier is a different kind of thing</td></tr>
    <tr><td>Keep and study</td><td>anomaly detection</td><td>outliers are the point (fraud)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deleting outliers from the test set (or computing clip limits on all rows) makes the reported score unrealistically good: production will contain bungalows. Learn the clip limits from training rows only, apply them to every later row, and never drop test rows.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Date and Time Features.</b> So far every column was a number or a category. The listing date is neither: as a raw timestamp it is a huge integer that means little. How do we turn "listed on Saturday 9 March" into columns a model can use?</div>

  <h2 id="fe-time"><span class="num">08</span>Date and Time Features</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Flats listed around Republic Day or Diwali might attract more buyers; December and January are neighbours on the calendar but 11 apart as month numbers. What should a timestamp become, so that the model sees seasons, weekends and holidays?</p>
  </div>
  <h3>Parts, flags and elapsed time</h3>
  <p>A raw timestamp is a huge number (nanoseconds since 1970) that means little to a model. Break it into the parts that drive behaviour: month, day of week, weekend flag, holiday flag, and "time since" an event (the building's age at listing, days since the last price cut).</p>
  <h3>Cyclical encoding, by hand</h3>
  <p>December (12) and January (1) are one month apart, but as numbers they are 11 apart, and January looks closer to June than to December. Put the month on a circle: angle = 2π·(m − 1)/12, features sin(angle) and cos(angle).</p>
  <ul>
    <li>December: angle 330°; sin = −0.5, cos = 0.866. January: angle 0°; sin = 0, cos = 1.</li>
    <li>Distance between them = √(0.5² + 0.134²) = 0.518. Between January and June (sin 0.5, cos −0.866): 1.932, nearly the diameter 2.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd

for m in [12, 1, 6]:                                          # December, January, June
    ang = 2 * np.pi * (m - 1) / 12
    print(f"month {m:2d}: sin={np.sin(ang):6.3f} cos={np.cos(ang):6.3f}")
d = lambda a, b: np.hypot(np.sin(2*np.pi*(a-1)/12) - np.sin(2*np.pi*(b-1)/12), np.cos(2*np.pi*(a-1)/12) - np.cos(2*np.pi*(b-1)/12))
print(f"distance Dec-Jan: raw {12 - 1}, cyclical {d(12, 1):.3f};  Jan-Jun: raw 5, cyclical {d(1, 6):.3f}")

listings = pd.DataFrame({"flat": ["A", "B", "J"],
                         "listed": pd.to_datetime(["2024-03-09", "2024-01-26", "2024-10-14"]),
                         "built":  pd.to_datetime(["2012-06-01", "2021-02-01", "2020-11-01"])})
f = pd.DataFrame({"flat": listings.flat, "month": listings.listed.dt.month, "dow": listings.listed.dt.dayofweek,
                  "weekend": (listings.listed.dt.dayofweek &gt;= 5).astype(int),
                  "holiday": listings.listed.dt.strftime("%m-%d").isin(["01-26", "08-15"]).astype(int),
                  "age_years": ((listings.listed - listings.built).dt.days / 365.25).round(1)})
print(f.to_string(index=False))</div>
  <div class="fx" data-lang="text">month 12: sin=-0.500 cos= 0.866
month  1: sin= 0.000 cos= 1.000
month  6: sin= 0.500 cos=-0.866
distance Dec-Jan: raw 11, cyclical 0.518;  Jan-Jun: raw 5, cyclical 1.932
flat  month  dow  weekend  holiday  age_years
   A      3    5        1        0       11.8
   B      1    4        0        1        3.0
   J     10    0        0        0        4.0</div>
  <p>Flat B, listed on 26 January, is flagged as a holiday (Republic Day); flat A, listed on a Saturday, as a weekend. <code>age_years</code> (time between construction and listing) is far more useful than either raw date; it reproduces the age column of the running example (A about 12 years, B 3, J 4). The same sin/cos trick applies to hour of day (period 24: 23:00 and 01:00 are 0.518 apart), day of week (7) and day of year (365.25).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Lags and rolling averages ("average Baner price over the last 3 months") must use only rows <em>before</em> the listing date: <code>shift(1)</code> before <code>rolling</code>, never <code>center=True</code>. Time-based data also needs time-based splits. Both are covered in <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> and <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>. A tree needs no cyclical encoding for month (it can split 1–2 and 11–12 separately), but linear and distance models do.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Text Basics.</b> The listing description, "spacious flat near metro", carries information no structured field has. How does free text become columns?</div>

  <h2 id="fe-text"><span class="num">09</span>Text Basics</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sellers write descriptions: "new spacious flat near metro". "Metro" probably adds value; "flat" appears in every listing and says nothing. How do we turn sentences into numbers, and weight the informative words more than the common ones?</p>
  </div>
  <h3>Bag of words, by hand</h3>
  <p>The simplest way to turn text into columns: build a vocabulary of all words, and represent each document by how often each word appears, ignoring order. Three listings: H "spacious flat near metro", B "new flat in baner", J "new spacious flat near metro metro". Vocabulary (sorted): baner, flat, in, metro, near, new, spacious. Listing J → baner 0, flat 1, in 0, metro 2, near 1, new 1, spacious 1.</p>
  <h3>TF-IDF, by hand</h3>
  <p>Common words carry less information than rare ones. <strong>TF-IDF</strong> multiplies the count (term frequency) by the <strong>inverse document frequency</strong>; sklearn's version is idf = ln((1 + n)/(1 + df)) + 1, where n is the number of documents and df the number containing the word, then scales each row to length 1. Here n = 3. "flat" is in all 3: idf = ln(4/4) + 1 = 1.0. "metro" is in 2: ln(4/3) + 1 = 1.288. "baner" is in 1: ln(4/2) + 1 = 1.693. Listing J: flat 1 × 1.0, metro 2 × 1.288 = 2.575, near, new, spacious 1.288 each. Length √(1 + 6.633 + 3 × 1.659) = √12.61 = 3.551. Divide: flat 0.282, metro 0.725, the other three 0.363.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

docs = ["spacious flat near metro",                  # listing text of flat H
        "new flat in baner",                         # flat B
        "new spacious flat near metro metro"]        # flat J
cv = CountVectorizer().fit(docs)
print(cv.get_feature_names_out()); print(cv.transform(docs).toarray())
tf = TfidfVectorizer().fit(docs)
print("idf:", {w: round(float(v), 3) for w, v in zip(tf.get_feature_names_out(), tf.idf_)})
print("doc 3 tf-idf:", tf.transform(docs[2:]).toarray().round(3))</div>
  <div class="fx" data-lang="text">['baner' 'flat' 'in' 'metro' 'near' 'new' 'spacious']
[[0 1 0 1 1 0 1]
 [1 1 1 0 0 1 0]
 [0 1 0 2 1 1 1]]
idf: {'baner': 1.693, 'flat': 1.0, 'in': 1.693, 'metro': 1.288, 'near': 1.288, 'new': 1.288, 'spacious': 1.288}
doc 3 tf-idf: [[0.    0.282 0.    0.725 0.363 0.363 0.363]]</div>
  <p>"flat", which every listing contains, gets the lowest weight; "metro", mentioned twice, the highest. These sparse matrices feed straight into linear models and Naive Bayes (<a class="xref" data-note="ml_naivebayes">Naive Bayes</a>). Options worth knowing: <code>ngram_range=(1, 2)</code> adds word pairs ("near metro", "not near"), <code>min_df</code>/<code>max_df</code> drop very rare/very common words, <code>stop_words</code>, and <code>HashingVectorizer</code> for unbounded vocabularies. Modern NLP replaces these counts with learnt embeddings; the full story is in <a class="xref" data-note="nlp">NLP</a>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The vocabulary and the idf values are learnt in <code>fit</code>. Fitting the vectorizer on all documents (including test) leaks test words and their frequencies. Fit on training text only; unseen words at prediction time are simply ignored.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Interaction and Polynomial Features.</b> Every feature so far enters the model on its own. But a year of age might cost more in a premium locality than in a cheap one. How does a model learn effects that depend on two columns at once?</div>

  <h2 id="fe-poly"><span class="num">10</span>Interaction and Polynomial Features</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A linear model adds up weight × column. It cannot express "revenue is price <em>times</em> quantity" or "age hurts big flats more". What extra columns let it represent effects that depend on combinations?</p>
  </div>
  <h3>By hand</h3>
  <p>An <strong>interaction</strong> is a product of two columns: its weight lets the effect of one feature depend on the other. <strong>Polynomial features</strong> of degree 2 add all squares and pairwise products. For flat A (area 5, age 12): 1, area, age, area², area·age, age² = 1, 5, 12, 25, 60, 144.</p>
  <div class="fx" data-lang="py">import numpy as np
from math import comb
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

pf = PolynomialFeatures(degree=2).fit([[5, 12]])                 # flat A: area 5, age 12
print(pf.get_feature_names_out(["area", "age"]), pf.transform([[5, 12]]))
for d in [6, 10, 50]:
    print(f"{d} features, degree 2 -&gt; {PolynomialFeatures(2).fit(np.zeros((1, d))).n_output_features_} columns"
          f" (formula C(d+2, 2) = {comb(d + 2, 2)})")
rng = np.random.default_rng(0)
price = rng.uniform(10, 100, 500); qty = rng.integers(1, 20, 500)
revenue = price * qty + rng.normal(0, 20, 500)
X = np.c_[price, qty]
print("revenue: linear R2 raw:", cross_val_score(LinearRegression(), X, revenue, cv=5).mean().round(3),
      "  with price*qty:", cross_val_score(LinearRegression(), np.c_[X, price * qty], revenue, cv=5).mean().round(3))</div>
  <div class="fx" data-lang="text">['1' 'area' 'age' 'area^2' 'area age' 'age^2'] [[  1.   5.  12.  25.  60. 144.]]
6 features, degree 2 -&gt; 28 columns (formula C(d+2, 2) = 28)
10 features, degree 2 -&gt; 66 columns (formula C(d+2, 2) = 66)
50 features, degree 2 -&gt; 1326 columns (formula C(d+2, 2) = 1326)
revenue: linear R2 raw: 0.88   with price*qty: 0.998</div>
  <p>The number of columns explodes: degree 2 on d features gives C(d + 2, 2) columns including the constant: 28 for the flats' six columns (from ten rows!), 66 for 10 features, 1,326 for 50. Hence the need for regularization (<a class="xref" data-note="ml_regularization">Regularization</a>) or a hand-picked interaction. The last line shows why a single well-chosen interaction is powerful: revenue = price × quantity. A linear model on price and quantity explains 88% (it can only add them); with the product column it explains 99.8%.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Trees and boosting discover interactions themselves (a split on locality followed by a split on age), which is one reason they win on raw tabular data. Linear models need them handed over. Domain ratios (price per sq ft, debt/income, clicks per impression) are interactions too, and usually beat brute-force polynomial expansion. Degree, scaling of powers and splines are covered in <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Polynomial terms of unscaled data are huge and highly correlated (area and area² for area in square feet: 250,000 to 1,960,000). Scale before expanding, and regularize after.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Feature Selection.</b> Engineering keeps adding columns: one-hot, indicators, interactions, words. Six columns became 28 at degree 2. Which ones should the model keep?</div>

  <h2 id="fe-select"><span class="num">11</span>Feature Selection (Pointer)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>More columns are not always better: carpet area added nothing once built-up area was in, and bedrooms repeated area. How do we decide which engineered columns stay?</p>
  </div>
  <p>Engineering creates columns; selection removes the ones that do not help, which cuts noise, training time and the risk of overfitting. The three families, each covered fully with worked examples in <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a>:</p>
  <div class="cards">
    <div><b>Filter</b><p>Score each column alone: variance threshold, correlation, chi², mutual information. <code>SelectKBest</code>, <code>VarianceThreshold</code>.</p><small>Fast; ignores interactions (would keep both area twins)</small></div>
    <div><b>Wrapper</b><p>Try subsets with a model: forward/backward selection, recursive feature elimination. <code>RFECV</code>, <code>SequentialFeatureSelector</code>.</p><small>Accurate; expensive (64 subsets of the flats' 6 columns)</small></div>
    <div><b>Embedded</b><p>The model selects while training: lasso zeros (<a class="xref" data-note="ml_regularization">Regularization</a>: kept area, age, Baner), tree importances. <code>SelectFromModel</code>.</p><small>Good middle ground</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Selecting features using all rows and then cross-validating is one of the most dramatic leaks there is: on pure noise it can report 85% accuracy (demonstrated in <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). Selection must happen inside each training fold.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Class Imbalance.</b> All the steps so far shape the inputs. One more problem sits in the label: when the class you care about is rare, the model learns to ignore it. What can be done to the training data to fix that?</div>

  <h2 id="fe-imb"><span class="num">12</span>Class Imbalance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Four of our ten flats sold within 30 days, a mild imbalance. Across the whole portal, perhaps 5% of listings get a fraud flag. A model that always says "no" is then 95% accurate and useless. How do we make the rare class count during training, and what do those fixes really change?</p>
  </div>
  <h3>The need</h3>
  <p>Fraud, churn, disease, a flat that sells in a week: the class you care about is often rare. Many learners, trained to minimise average loss, lean toward the majority and predict the rare class too seldom. There are three families of fixes, and one honest alternative.</p>
  <h3>Class weights, by hand</h3>
  <p>Make each rare-class mistake cost more in the loss. sklearn's <code>class_weight="balanced"</code> gives class c the weight n/(k·n_c), where k is the number of classes, so that both classes contribute equally in total. Ten flats, 6 slow and 4 fast: slow 10/(2·6) = 0.833, fast 10/(2·4) = 1.25; check 6 × 0.833 = 5 and 4 × 1.25 = 5. For a portal-wide 95/5 split: 100/(2·95) = 0.526 and 100/(2·5) = 10.</p>
  <h3>Resampling, and SMOTE by hand</h3>
  <ul>
    <li><strong>Random oversampling</strong>: duplicate minority rows until the classes balance. Simple; the model may memorise the copies.</li>
    <li><strong>Random undersampling</strong>: throw away majority rows. Fast; discards information.</li>
    <li><strong>SMOTE</strong> (Chawla et al., 2002): create <em>new</em> minority points on the line between a minority point and one of its k nearest minority neighbours: x_new = x + u·(neighbour − x), u random in [0, 1]. By hand on two fast sellers in (area, age): A (5, 12) and its nearest fast neighbour D (8, 15), u = 0.4 → (5 + 0.4 × 3, 12 + 0.4 × 3) = (6.2, 13.2): a plausible 620 sq ft, 13-year-old flat that never existed.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np

# class weights, sklearn's "balanced" rule w_c = n / (k * n_c), on the ten flats (4 sold fast, 6 did not)
n, counts = 10, {"slow (0)": 6, "fast (1)": 4}
for c, n_c in counts.items():
    print(f"class {c}: n_c={n_c}  weight = {n}/(2*{n_c}) = {n / (2 * n_c):.3f}   total weight {n_c * n / (2 * n_c):.1f}")
# and for a portal-wide 95/5 split
print("95/5 split:", round(100 / (2 * 95), 3), "and", 100 / (2 * 5))

# one SMOTE point by hand: fast sellers A (area 5, age 12) and its fast neighbour D (8, 15)
x, nb, u = np.array([5.0, 12.0]), np.array([8.0, 15.0]), 0.4
print("SMOTE: x + u*(neighbour - x) =", x + u * (nb - x))</div>
  <div class="fx" data-lang="text">class slow (0): n_c=6  weight = 10/(2*6) = 0.833   total weight 5.0
class fast (1): n_c=4  weight = 10/(2*4) = 1.250   total weight 5.0
95/5 split: 0.526 and 10.0
SMOTE: x + u*(neighbour - x) = [ 6.2 13.2]</div>
  <h3>Comparing the fixes honestly, at scale</h3>
  <p>4,000 rows, 5% positives, four features (positives shifted on two of them). Every fix is applied to the <strong>training rows only</strong>; the test set keeps its natural 5%. SMOTE is written from scratch (the <code>imbalanced-learn</code> package provides <code>SMOTE</code> and friends, plus a pipeline that resamples inside CV folds).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import recall_score, precision_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import NearestNeighbors

def smote(X, y, k=5, seed=0):
    """Oversample class 1 until it matches class 0, by interpolating to its k nearest class-1 neighbours."""
    rng = np.random.default_rng(seed)
    Xm = X[y == 1]
    need = (y == 0).sum() - len(Xm)
    nn = NearestNeighbors(n_neighbors=k + 1).fit(Xm)
    _, idx = nn.kneighbors(Xm)                       # idx[:, 0] is the point itself
    base = rng.integers(0, len(Xm), need)
    pick = idx[base, rng.integers(1, k + 1, need)]
    u = rng.random((need, 1))
    new = Xm[base] + u * (Xm[pick] - Xm[base])
    return np.vstack([X, new]), np.r_[y, np.ones(need, dtype=int)]

g = np.random.default_rng(1)
y = (g.random(4000) &lt; 0.05).astype(int)                  # 5% positives (e.g. fraud)
X = g.normal(size=(4000, 4)) + np.outer(y, [1.5, 1.5, 0, 0])   # positives shifted on 2 features
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
print(f"train: {ytr.sum()} positives of {len(ytr)} ({ytr.mean():.1%})")
rng = np.random.default_rng(0)
pos, neg = np.flatnonzero(ytr == 1), np.flatnonzero(ytr == 0)
over = np.r_[neg, rng.choice(pos, len(neg))]               # random oversampling
under = np.r_[rng.choice(neg, len(pos), replace=False), pos]   # random undersampling
Xs, ys = smote(Xtr, ytr)
setups = {"no fix": (Xtr, ytr, None), "class_weight": (Xtr, ytr, "balanced"),
          "random over": (Xtr[over], ytr[over], None), "random under": (Xtr[under], ytr[under], None),
          "SMOTE": (Xs, ys, None)}
print("always predict 0: accuracy", round(1 - yte.mean(), 3))
for name, (Xa, ya, cw) in setups.items():
    m = LogisticRegression(class_weight=cw, max_iter=1000).fit(Xa, ya)
    p = m.predict(Xte); s = m.predict_proba(Xte)[:, 1]
    print(f"{name:13s} n_train={len(ya):5d}  recall {recall_score(yte, p):.2f}  precision "
          f"{precision_score(yte, p):.2f}  F1 {f1_score(yte, p):.2f}  ROC-AUC {roc_auc_score(yte, s):.3f}")
s0 = LogisticRegression(max_iter=1000).fit(Xtr, ytr).predict_proba(Xte)[:, 1]
for t in [0.1, 0.2]:                                       # no resampling, just a lower threshold
    p = (s0 &gt;= t).astype(int)
    print(f"no fix, t={t:&lt;4} recall {recall_score(yte, p):.2f}  precision {precision_score(yte, p):.2f}  F1 {f1_score(yte, p):.2f}")</div>
  <div class="fx" data-lang="text">train: 147 positives of 2800 (5.2%)
always predict 0: accuracy 0.948
no fix        n_train= 2800  recall 0.46  precision 0.83  F1 0.59  ROC-AUC 0.949
class_weight  n_train= 2800  recall 0.86  precision 0.25  F1 0.39  ROC-AUC 0.946
random over   n_train= 5306  recall 0.86  precision 0.26  F1 0.40  ROC-AUC 0.946
random under  n_train=  294  recall 0.86  precision 0.26  F1 0.40  ROC-AUC 0.947
SMOTE         n_train= 5306  recall 0.83  precision 0.26  F1 0.39  ROC-AUC 0.944
no fix, t=0.1  recall 0.75  precision 0.35  F1 0.47
no fix, t=0.2  recall 0.62  precision 0.48  F1 0.54</div>
  <p>Read the table carefully. Without any fix, recall is 0.46 (half the positives missed) but precision is high (0.83). Every fix, weights, oversampling, undersampling with only 294 rows, SMOTE, lands in the same place: recall about 0.85, precision about 0.25. ROC-AUC, which measures ranking quality across all thresholds, barely moves (0.944–0.949). The fixes did not make the model better at <em>separating</em> the classes; they mostly <strong>moved the decision threshold</strong>. The last two lines show the same trade-off obtained with no resampling at all, just a lower threshold (0.1 or 0.2 instead of 0.5).</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>For most imbalance problems the honest recipe is: train normally (or with class weights), evaluate with metrics that respect the rare class (precision, recall, F1, PR-AUC; <a class="xref" data-note="ml_evaluation">Classification Metrics</a>), and pick the threshold from the business cost of each error type (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>; the intro's "call the seller if p &gt; 0.133"). Resampling helps most with weak learners or very few positives, and class weights are the cheapest version. Resampling and weights distort predicted probabilities (the model now believes positives are common); recalibrate if you need real probabilities.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Oversampling or SMOTE <em>before</em> the train/test split (or before CV) puts copies or interpolations of the same minority row on both sides, and the scores become fantasy. Resample inside the training fold only, and evaluate on data with the natural class balance.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: scikit-learn Transformers.</b> We have a dozen techniques. In code they must all behave the same way: learn from training rows, apply to new ones. What is that shared interface?</div>

  <h2 id="fe-sklearn"><span class="num">13</span>scikit-learn Transformers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A scaler learns a mean, an encoder learns a category list, an imputer learns a fill value, a vectorizer learns a vocabulary. When a new listing arrives, each must reuse exactly what it learnt. How does sklearn organise that, and how do different columns get different steps?</p>
  </div>
  <h3>One interface for every step</h3>
  <p>Every technique in this note is a sklearn <strong>transformer</strong> with the same two methods. <code>fit(X)</code> <em>learns</em> from data and stores what it learnt in attributes ending in an underscore (<code>mean_</code>, <code>categories_</code>, <code>statistics_</code>, <code>lambdas_</code>, <code>bin_edges_</code>, <code>vocabulary_</code>). <code>transform(X)</code> <em>applies</em> what was learnt to any rows. <code>fit_transform</code> does both on the same rows, for training data only.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, FunctionTransformer, OneHotEncoder
from sklearn.compose import ColumnTransformer
pd.set_option("display.width", 200); pd.set_option("display.max_columns", 10)

train = pd.DataFrame({"area": [5., 9., 13.], "locality": ["Hadapsar", "Baner", "Kothrud"]})   # flats A, E, I
test = pd.DataFrame({"area": [14.], "locality": ["Wakad"]})                                  # a new listing

sc = StandardScaler().fit(train[["area"]])               # fit: LEARN mean_ and scale_ from train
print("mean_", sc.mean_, "scale_", sc.scale_.round(3))
print("transform(test):", sc.transform(test[["area"]]).ravel().round(3))   # APPLY to new rows

log = FunctionTransformer(np.log1p, feature_names_out="one-to-one")      # stateless: learns nothing
ct = ColumnTransformer([("num", StandardScaler(), ["area"]),
                        ("log", log, ["area"]),
                        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["locality"])])
ct.set_output(transform="pandas")                           # DataFrames with names out
print(ct.fit_transform(train).round(3))
print(ct.transform(test).round(3))</div>
  <div class="fx" data-lang="text">mean_ [9.] scale_ [3.266]
transform(test): [1.531]
   num__area  log__area  cat__locality_Baner  cat__locality_Hadapsar  cat__locality_Kothrud
0     -1.225      1.792                  0.0                     1.0                    0.0
1      0.000      2.303                  1.0                     0.0                    0.0
2      1.225      2.639                  0.0                     0.0                    1.0
   num__area  log__area  cat__locality_Baner  cat__locality_Hadapsar  cat__locality_Kothrud
0      1.531      2.708                  0.0                     0.0                    0.0</div>
  <p>By hand: training areas 5, 9, 13 (flats A, E, I) have mean 9 and std √((16 + 0 + 16)/3) = 3.266; a new 1,400 sq ft listing becomes (14 − 9)/3.266 = 1.531, using the <em>training</em> statistics. <code>FunctionTransformer</code> wraps a stateless function (log1p learns nothing: ln 15 = 2.708). <code>ColumnTransformer</code> sends different columns to different steps and glues the results; <code>set_output(transform="pandas")</code> returns a DataFrame with readable names like <code>num__area</code>. Wakad, unseen, becomes zeros. Wrapping all of this with the model in a <code>Pipeline</code> is the subject of <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</p>
  <table class="tbl">
    <tr><th>Task</th><th>Transformer</th><th>Learns in fit</th></tr>
    <tr><td>Scale</td><td><code>StandardScaler</code>, <code>MinMaxScaler</code>, <code>RobustScaler</code>, <code>MaxAbsScaler</code></td><td>mean/std, min/max, median/IQR</td></tr>
    <tr><td>Reshape</td><td><code>PowerTransformer</code>, <code>QuantileTransformer</code>, <code>FunctionTransformer</code></td><td>λ, quantiles, nothing</td></tr>
    <tr><td>Bin</td><td><code>KBinsDiscretizer</code></td><td>bin edges</td></tr>
    <tr><td>Encode</td><td><code>OneHotEncoder</code>, <code>OrdinalEncoder</code>, <code>TargetEncoder</code>, <code>FeatureHasher</code></td><td>categories, category means, nothing</td></tr>
    <tr><td>Impute</td><td><code>SimpleImputer</code>, <code>KNNImputer</code>, <code>IterativeImputer</code>, <code>MissingIndicator</code></td><td>fill values, stored rows, regressions</td></tr>
    <tr><td>Expand</td><td><code>PolynomialFeatures</code>, <code>SplineTransformer</code></td><td>number of inputs, knots</td></tr>
    <tr><td>Text</td><td><code>CountVectorizer</code>, <code>TfidfVectorizer</code>, <code>HashingVectorizer</code></td><td>vocabulary, idf</td></tr>
    <tr><td>Select</td><td><code>VarianceThreshold</code>, <code>SelectKBest</code>, <code>SelectFromModel</code>, <code>RFECV</code></td><td>which columns to keep</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Thirteen techniques, one interface. How do they fit together into a single preparation of the flats' table, and which one answers which question?</div>

  <h2 id="fe-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Scaling, transforms, bins, encoders, imputers, clipping, date parts, TF-IDF, interactions, selection, rebalancing: a toolbox of unrelated tricks, or one flow from a raw listing to a model-ready row?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 320" width="680">
<defs><marker id="fe-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="8" width="180" height="40" rx="7" class="fr sr"/><text x="340" y="26" text-anchor="middle" font-size="11.5" font-weight="700">raw listing table</text><text x="340" y="41" text-anchor="middle" class="tm" font-size="10">sq ft · text · blanks · dates</text>
<line x1="280" y1="48" x2="85" y2="78" stroke="currentColor" marker-end="url(#fe-c9)"/><line x1="320" y1="48" x2="255" y2="78" stroke="currentColor" marker-end="url(#fe-c9)"/><line x1="360" y1="48" x2="425" y2="78" stroke="currentColor" marker-end="url(#fe-c9)"/><line x1="400" y1="48" x2="595" y2="78" stroke="currentColor" marker-end="url(#fe-c9)"/>
<rect x="10" y="80" width="150" height="40" rx="7" class="fb sb"/><text x="85" y="98" text-anchor="middle" font-size="11" font-weight="700">numbers</text><text x="85" y="113" text-anchor="middle" class="tm" font-size="9.5">impute → clip → transform</text>
<rect x="180" y="80" width="150" height="40" rx="7" class="fb sb"/><text x="255" y="98" text-anchor="middle" font-size="11" font-weight="700">categories</text><text x="255" y="113" text-anchor="middle" class="tm" font-size="9.5">one-hot · target · hash</text>
<rect x="350" y="80" width="150" height="40" rx="7" class="fb sb"/><text x="425" y="98" text-anchor="middle" font-size="11" font-weight="700">dates</text><text x="425" y="113" text-anchor="middle" class="tm" font-size="9.5">parts · sin/cos · age</text>
<rect x="520" y="80" width="150" height="40" rx="7" class="fb sb"/><text x="595" y="98" text-anchor="middle" font-size="11" font-weight="700">text</text><text x="595" y="113" text-anchor="middle" class="tm" font-size="9.5">bag of words · TF-IDF</text>
<line x1="85" y1="120" x2="85" y2="150" stroke="currentColor" marker-end="url(#fe-c9)"/>
<rect x="10" y="152" width="150" height="40" rx="7" class="ft st"/><text x="85" y="170" text-anchor="middle" font-size="11" font-weight="700">scale</text><text x="85" y="185" text-anchor="middle" class="tm" font-size="9.5">standard / robust</text>
<line x1="85" y1="192" x2="250" y2="218" stroke="currentColor" marker-end="url(#fe-c9)"/><line x1="255" y1="120" x2="290" y2="218" stroke="currentColor" marker-end="url(#fe-c9)"/><line x1="425" y1="120" x2="390" y2="218" stroke="currentColor" marker-end="url(#fe-c9)"/><line x1="595" y1="120" x2="430" y2="218" stroke="currentColor" marker-end="url(#fe-c9)"/>
<rect x="200" y="220" width="280" height="40" rx="7" class="fg sg"/><text x="340" y="238" text-anchor="middle" font-size="11.5" font-weight="700">ColumnTransformer → one numeric row</text><text x="340" y="253" text-anchor="middle" class="tm" font-size="9.5">+ interactions, then selection</text>
<line x1="340" y1="260" x2="340" y2="282" stroke="currentColor" marker-end="url(#fe-c9)"/>
<rect x="200" y="284" width="280" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="305" text-anchor="middle" font-size="11">model (+ class weights): LOOCV 7.25 → 1.16</text>
<rect x="520" y="150" width="150" height="54" rx="7" class="fr sr" fill-opacity="0.5"/><text x="595" y="170" text-anchor="middle" font-size="11" font-weight="700">every step that fits</text><text x="595" y="185" text-anchor="middle" class="tm" font-size="9.5">learns from data →</text><text x="595" y="198" text-anchor="middle" class="tm" font-size="9.5">training rows only</text>
</svg><figcaption>One flow. Each kind of raw column gets its own small chain (numbers: impute, clip, transform, scale; categories: encode; dates: parts and cycles; text: vectorize), a ColumnTransformer glues them into one numeric row, interactions and selection shape it, and the model reads it. Every box that fits (means, categories, fill values, idf, bin edges) must learn from training rows only, which is the next note.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the ten flats</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our flats</th><th>When to use</th></tr>
    <tr><td>Engineered feature</td><td>domain knowledge</td><td>can the model see the pattern?</td><td>+ locality: LOOCV 7.25 → 1.16</td><td>always the first lever</td></tr>
    <tr><td>Standard scaling</td><td>mean, std</td><td>fair units?</td><td>mean 9.5, std 2.872; A → −1.567</td><td>distance, penalty, GD models</td></tr>
    <tr><td>Robust scaling</td><td>median, IQR</td><td>fair units despite outliers?</td><td>bungalow: flats keep −1 … 0.8</td><td>outliers present</td></tr>
    <tr><td>Log / power transform</td><td>monotone reshaping</td><td>fix a long tail?</td><td>38 … 400 → 1.58 … 2.60</td><td>money, counts, sizes</td></tr>
    <tr><td>Binning</td><td>cut points</td><td>steps for a linear model?</td><td>ages: new 4, mid 4, old 2</td><td>linear models, interpretability</td></tr>
    <tr><td>One-hot</td><td>category list</td><td>words to numbers, no order?</td><td>Baner/Hadapsar/Kothrud; Wakad → zeros</td><td>low cardinality</td></tr>
    <tr><td>Target encoding</td><td>category means + smoothing</td><td>many categories in one column?</td><td>Baner 73.75 → 71.5; leak 1.68 vs 3.69</td><td>high cardinality, out-of-fold only</td></tr>
    <tr><td>Count / hashing</td><td>frequencies / hash mod m</td><td>no target, fixed width?</td><td>4, 3, 3; Baner and Kothrud collide</td><td>huge vocabularies</td></tr>
    <tr><td>Imputation + indicator</td><td>fill statistic or model</td><td>what goes in a blank?</td><td>G: 7.33 / 7.5 / 11.97 (truth 20)</td><td>any blanks; indicator for MNAR</td></tr>
    <tr><td>Outlier handling</td><td>IQR, MAD</td><td>which values are extreme?</td><td>fences [8.75, 130.75]; robust z 14.9</td><td>linear models, scaling</td></tr>
    <tr><td>Date features</td><td>parts, sin/cos</td><td>what does a timestamp mean?</td><td>Dec–Jan 0.518; holiday 26 Jan</td><td>any timestamp</td></tr>
    <tr><td>TF-IDF</td><td>counts × idf, normalised</td><td>text to columns?</td><td>J: metro 0.725, flat 0.282</td><td>descriptions, reviews</td></tr>
    <tr><td>Interactions</td><td>products</td><td>effects that combine?</td><td>A: 1, 5, 12, 25, 60, 144</td><td>linear models, with regularization</td></tr>
    <tr><td>Class weights / SMOTE</td><td>n/(k·n_c); interpolation</td><td>make the rare class count?</td><td>1.25 / 0.833; (6.2, 13.2)</td><td>rare positives; mostly moves threshold</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>feature engineering puts information into a form the chosen model can use, and every step that learns from data must learn from training rows only.</strong> On the flats: locality as 0/1 columns did more than any model change, robust scaling survived the bungalow, an indicator told the model what G's blank meant, and naive target encoding made a leaky score look twice as good as the honest one.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Which Step for Which Model.</b> Not every model needs every step. Which steps does each family require, ignore, or get hurt by?</div>

  <h2 id="fe-compare"><span class="num">15</span>Which Step for Which Model</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Scaling is essential for KNN and pointless for a tree; binning helps a linear model and hurts a tree. Before building a pipeline, which steps does your model actually need?</p>
  </div>
  <table class="tbl">
    <tr><th>Step</th><th>Linear / logistic</th><th>KNN / SVM / k-means</th><th>Trees / forests / boosting</th><th>Neural nets</th></tr>
    <tr><td>Scaling</td><td>needed with regularization or GD</td><td>essential</td><td>not needed</td><td>essential</td></tr>
    <tr><td>Log / power transform</td><td>often helps</td><td>helps</td><td>no effect (monotone)</td><td>helps</td></tr>
    <tr><td>Binning</td><td>lets it bend</td><td>rarely</td><td>usually hurts</td><td>rarely</td></tr>
    <tr><td>One-hot</td><td>standard</td><td>standard (distances get odd with many)</td><td>fine for few categories</td><td>or embeddings</td></tr>
    <tr><td>Ordinal codes</td><td>only real order</td><td>only real order</td><td>fine</td><td>embeddings better</td></tr>
    <tr><td>Target encoding</td><td>good for high cardinality</td><td>good</td><td>good (CatBoost built-in)</td><td>possible</td></tr>
    <tr><td>Missing values</td><td>impute (+ indicator)</td><td>impute</td><td>native NaN in many libraries</td><td>impute + indicator</td></tr>
    <tr><td>Outliers</td><td>clip / transform / Huber</td><td>robust scaling</td><td>mostly robust</td><td>clip / transform</td></tr>
    <tr><td>Interactions</td><td>must be added</td><td>implicit in distances</td><td>found automatically</td><td>learnt</td></tr>
    <tr><td>Cyclical time</td><td>sin/cos</td><td>sin/cos</td><td>raw month works</td><td>sin/cos</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Most feature-engineering bugs are silent: no error, just a score that is too good or a model that fails in production. Which ones?</div>

  <h2 id="fe-traps"><span class="num">16</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every technique in this note has a way to go quietly wrong. What are the classic slips, and what did each look like on the flats?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fitting any learnt step on all rows</span>
    <p>Scalers, imputers, encoders, binners, vectorizers and selectors all learn from data. Fit them on training rows (inside each CV fold), then only transform the rest. Use a pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: naive target encoding</span>
    <p>Category means computed on the same rows they encode leak each row's own label: the flats reported 1.68 instead of an honest 3.69, pure noise scored AUC 0.777. Use out-of-fold encoding (<code>TargetEncoder</code>) and smoothing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: integer codes as numbers in a linear model</span>
    <p>Locality codes 0, 1, 2 impose a fake order and spacing. One-hot for nominal categories; ordinal only when the order is real (1BHK &lt; 2BHK).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: crashing on unseen categories</span>
    <p>Production always brings a new locality (Wakad). <code>handle_unknown="ignore"</code> (one-hot), <code>handle_unknown="use_encoded_value"</code> (ordinal), hashing, or target encoding's fallback to the global mean.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: filling blanks without asking why</span>
    <p>Flat G's blank age hid the oldest flat; every simple fill said "about 7". Add a missing indicator when blanks may mean something.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: resampling before the split</span>
    <p>SMOTE or duplicated rows on both sides of a split inflate every metric. Resample training folds only.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging imbalance fixes by accuracy</span>
    <p>Always-"no" scores 94.8%. Use recall/precision/F1/PR-AUC and a business-driven threshold.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: features from the future</span>
    <p>Days on market, final negotiated price, locality averages computed over the whole year, centred rolling windows: anything not known at prediction time inflates validation and fails in production.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: log of zero or negatives</span>
    <p>np.log(0) = −inf breaks training silently. Use log1p or Yeo-Johnson.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scaling for trees, skipping it for KNN</span>
    <p>The first wastes effort, the second wrecks accuracy (KNN 0.691 vs 0.949). Know which family you are feeding.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet, then <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</b> Nearly every trap above is the same trap: a step that learns from data learnt from the wrong rows. How do we make that impossible, inside cross-validation and in production, rather than relying on care?</div>

  <h2 id="fe-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: ten flats A–J, area 500 … 1,400 sq ft, price 38 … 96 (₹ lakh), locality Hadapsar (A, D, G), Baner (B, E, H, J), Kothrud (C, F, I), ages 12, 3, 8, 15, 5, 10, [G missing; truly 20], 2, 7, 4, listing dates, descriptions; plus a 5,000 sq ft bungalow at ₹400 lakh.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our flats</th><th>Weakness → next</th></tr>
    <tr><td>Features</td><td>why engineer?</td><td>+ locality: 7.25 → 1.16</td><td>units differ</td></tr>
    <tr><td>Scaling</td><td>fair voice per column?</td><td>z: −1.567 … 1.567; robust survives bungalow</td><td>shape unchanged</td></tr>
    <tr><td>Transforms</td><td>fix long tails?</td><td>log10: 1.58 … 2.60</td><td>still smooth</td></tr>
    <tr><td>Binning</td><td>steps for linear models?</td><td>new / mid / old: 4, 4, 2</td><td>words not numbers</td></tr>
    <tr><td>Encoding</td><td>categories to numbers?</td><td>one-hot; target 71.5 / 60.2 / 68.4; leak 1.68 vs 3.69</td><td>blanks</td></tr>
    <tr><td>Missing</td><td>fill G's age?</td><td>7.33 / 7.5 / 11.97 (truth 20) + indicator</td><td>extremes</td></tr>
    <tr><td>Outliers</td><td>detect and treat?</td><td>fences [8.75, 130.75]; robust z 14.9; slope 4.53 → 5.58 Huber</td><td>timestamps</td></tr>
    <tr><td>Dates</td><td>what is a date?</td><td>Dec–Jan 0.518; 26 Jan holiday</td><td>free text</td></tr>
    <tr><td>Text</td><td>words to columns?</td><td>TF-IDF: metro 0.725, flat 0.282</td><td>combined effects</td></tr>
    <tr><td>Interactions</td><td>depends on two?</td><td>6 columns → 28 at degree 2</td><td>too many columns</td></tr>
    <tr><td>Selection</td><td>which to keep?</td><td>lasso: area, age, Baner</td><td>rare labels</td></tr>
    <tr><td>Imbalance</td><td>rare class count?</td><td>weights 1.25 / 0.833; SMOTE (6.2, 13.2)</td><td>one interface?</td></tr>
    <tr><td>Transformers</td><td>learn once, apply later?</td><td>mean_ 9 → new flat 1.531</td><td>fit on wrong rows → pipelines</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Feature engineering</td><td>Creating, transforming, encoding and selecting input columns so the model can learn the pattern: representation plus creation.</td></tr>
    <tr><td>Scaling vs transform</td><td>A per-column linear map (changes range, not shape) vs a monotone non-linear map such as log or Box-Cox (changes shape).</td></tr>
    <tr><td>Binning</td><td>Replacing a number by its range (equal width, equal frequency, domain).</td></tr>
    <tr><td>One-hot, ordinal, target, count, hashing</td><td>0/1 column per category; integer by real order; smoothed category mean of the target (out-of-fold); category frequency; |hash| mod m.</td></tr>
    <tr><td>Cardinality</td><td>Number of distinct values of a categorical column.</td></tr>
    <tr><td>MCAR, MAR, MNAR</td><td>Missing at random overall; depending on observed columns; depending on the missing value itself.</td></tr>
    <tr><td>Missing indicator</td><td>A 0/1 column marking which rows were imputed.</td></tr>
    <tr><td>Outlier, masking</td><td>A value far from the rest; extreme values inflating the mean/std so z-scores hide them.</td></tr>
    <tr><td>Cyclical encoding</td><td>sin/cos of 2π·value/period so that the end of a cycle is next to its start.</td></tr>
    <tr><td>TF-IDF</td><td>Word count × inverse document frequency, row-normalised.</td></tr>
    <tr><td>Interaction</td><td>A product of columns, letting one feature's effect depend on another.</td></tr>
    <tr><td>Transformer (sklearn)</td><td>An object with fit (learn, stores attributes ending in _) and transform (apply).</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols and our numbers</th></tr>
    <tr><td>Standardise</td><td>z = (x − mean)/std (std divides by n)</td><td>A: (5 − 9.5)/2.872 = −1.567</td></tr>
    <tr><td>Min-max / robust</td><td>(x − min)/(max − min); (x − median)/IQR</td><td>(x − 5)/9; (x − 9.5)/4.5</td></tr>
    <tr><td>Box-Cox / Yeo-Johnson</td><td>(x^λ − 1)/λ, ln x at λ = 0; ((x + 1)^λ − 1)/λ for x ≥ 0</td><td>λ = 0.5 on 9 → 4; on 3 → 2</td></tr>
    <tr><td>Smoothed target encoding</td><td>(n_c·mean_c + m·global)/(n_c + m)</td><td>Baner (4·73.75 + 2·67)/6 = 71.5</td></tr>
    <tr><td>nan-Euclidean distance</td><td>√((total/shared) × Σ squared differences on shared columns)</td><td>G–F: √(1.5 × 26) = 6.24</td></tr>
    <tr><td>IQR fences</td><td>Q1 − 1.5·IQR, Q3 + 1.5·IQR</td><td>54.5 − 45.75 = 8.75; 85 + 45.75 = 130.75</td></tr>
    <tr><td>Robust z</td><td>0.6745 (x − median)/MAD</td><td>0.6745 × 332/15 = 14.9</td></tr>
    <tr><td>Cyclical</td><td>sin, cos of 2π(m − 1)/12</td><td>Dec–Jan distance 0.518</td></tr>
    <tr><td>idf (sklearn)</td><td>ln((1 + n)/(1 + df)) + 1</td><td>n = 3: df 3 → 1.0, df 2 → 1.288, df 1 → 1.693</td></tr>
    <tr><td>Polynomial columns</td><td>C(d + 2, 2) at degree 2 (incl. constant)</td><td>d = 6 → 28</td></tr>
    <tr><td>Balanced class weight</td><td>n/(k·n_c)</td><td>10/(2·4) = 1.25; 10/(2·6) = 0.833</td></tr>
    <tr><td>SMOTE</td><td>x + u·(neighbour − x)</td><td>(5, 12) + 0.4·(3, 3) = (6.2, 13.2)</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Scale</b><p>Distance, penalty and gradient-descent models; robust scaler with outliers.</p><small>Not needed for trees</small></div>
    <div><b>Encode</b><p>One-hot for few categories, target encoding (out-of-fold, smoothed) or hashing for many, ordinal only for real order.</p><small>Never integer codes for nominal data in linear models</small></div>
    <div><b>Impute</b><p>Median + indicator as a robust default; iterative when columns are correlated (MAR); native NaN in boosting.</p><small>Ask why it is missing</small></div>
    <div><b>Imbalance</b><p>Class weights or a tuned threshold first; resample only inside training folds.</p><small>Judge with recall/precision, not accuracy</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Fitting any learnt step on all rows; naive target encoding; integer codes for nominal categories; crashing on unseen categories; blind imputation of meaningful blanks; resampling before the split; judging imbalance by accuracy; features from the future; log of zero; scaling trees but not KNN.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Standardise flat J's area (14) with mean 9.5 and std 2.872.</td><td>4.5/2.872 = 1.567</td></tr>
    <tr><td>Kothrud prices 53, 68, 87, global 67, m = 2: smoothed encoding?</td><td>(208 + 134)/5 = 68.4</td></tr>
    <tr><td>Nine known ages 12, 3, 8, 15, 5, 10, 2, 7, 4: median fill for G?</td><td>7</td></tr>
    <tr><td>Q1 54.5, Q3 85: upper fence? Is ₹400 lakh an outlier?</td><td>85 + 1.5 × 30.5 = 130.75; yes</td></tr>
    <tr><td>Why can't one-hot fit inside a pipeline before the split?</td><td>It can be fit only on training rows; fitting before the split leaks the category list and (for target encoding) the labels</td></tr>
  </table>

  <h2 id="fe-qa"><span class="num">17</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Standardise the flats' areas 5 … 14 by hand. Which models need it?</summary><div class="qa-body">Mean 9.5, std √(82.5/10) = 2.872, so A → −1.567, E → −0.174, J → +1.567. Needed for distance-based models (KNN, k-means, SVM), penalised models (ridge, lasso, regularized logistic), PCA and anything trained by gradient descent. Not needed for trees and their ensembles, whose splits ignore units.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>StandardScaler vs MinMaxScaler vs RobustScaler: when do you use each?</summary><div class="qa-body">Standard (mean/std): default for roughly symmetric data. MinMax (into [0, 1]): bounded data like pixels or when an algorithm expects [0, 1]. Robust (median/IQR): when outliers exist, because they cannot move the median or IQR: with the 5,000 sq ft bungalow added, the ten flats keep their spread (−1 … 0.8) under robust scaling but are squashed into −0.68 … 0.07 by standard scaling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do Box-Cox and Yeo-Johnson do, and how is λ chosen?</summary><div class="qa-body">Power transforms that reduce skew and make a column closer to normal: Box-Cox (x^λ − 1)/λ, ln x at λ = 0, needs x &gt; 0; Yeo-Johnson extends it to zero and negatives. λ is chosen by maximum likelihood under a normal model. On log-normal money data the fitted λ is ≈ 0, i.e. "use log".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain target encoding, its leakage, and two fixes.</summary><div class="qa-body">Replace a category by the mean target of that category (Baner → 73.75). Computed on the same rows, each row's own label sits inside its feature (flat J's 96 is inside Baner's 73.75; without J it is 66.33), so scores look better than they are: flats LOOCV 1.68 vs an honest 3.69; pure noise AUC 0.777. Fixes: out-of-fold (cross-fitted) encoding (sklearn TargetEncoder inside the pipeline) and smoothing toward the global mean, (n·mean + m·global)/(n + m).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the smoothed encoding for Hadapsar (prices 38, 56, 73), global mean 67, m = 2.</summary><div class="qa-body">(3 × 55.67 + 2 × 67)/(3 + 2) = (167 + 134)/5 = 60.2, instead of the raw 55.67.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the dummy variable trap and when do you need drop="first"?</summary><div class="qa-body">With all k one-hot columns plus an intercept, the columns sum to 1 for every row, an exact copy of the intercept: perfect multicollinearity, so unregularized least squares has no unique solution. Drop one column for unregularized linear/logistic regression and statsmodels. Regularized models and trees do not need it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the hashing trick? Advantages and drawbacks?</summary><div class="qa-body">Map each category (or word) to column |hash| mod m with sign ±1. Fixed width, no stored vocabulary, unseen values handled (Wakad → column 0), works on streams. Drawbacks: collisions merge unrelated categories (Baner and Kothrud both landed in column 3 with m = 4), and columns cannot be mapped back to names for interpretation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain MCAR, MAR and MNAR. Which is flat G's blank age likely to be, and what follows?</summary><div class="qa-body">MCAR: missing for no reason related to any value; MAR: depends on observed columns (fixable by conditioning on them: 53.3 → 50.04 in the simulation); MNAR: depends on the hidden value itself. G's seller probably left age blank because the building is old (20 years): MNAR. Mean, median and KNN fill about 7; iterative 11.97 using "cheap for its size"; add a missing indicator so the model can learn what a blank means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does KNN imputation work? Compute G's fill.</summary><div class="qa-body">Find the k nearest rows by nan-Euclidean distance on the columns the row has (√(total/shared × Σ squared differences)) and average their values. G (area 11, price 73): F 6.24, E 7.75, H 12.31; k = 2 → ages of F and E: (10 + 5)/2 = 7.5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can the z-score rule miss an outlier? What is better?</summary><div class="qa-body">Outliers inflate the mean and std they are measured against (masking): with one bungalow z = 3.12, with two both fall to 2.30 and 2.13. Robust alternatives: IQR fences [8.75, 130.75] flag the bungalow, and robust z with median and MAD gives about 13–15.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why encode month or hour with sin and cos?</summary><div class="qa-body">They wrap around: December and January are one month apart but 11 apart as numbers. sin/cos of 2π·(m − 1)/12 place months on a circle, so Dec–Jan are 0.518 apart and Jan–Jun 1.932. Needed for linear and distance-based models; trees can cope with the raw value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the TF-IDF weights of listing J "new spacious flat near metro metro" among three listings.</summary><div class="qa-body">idf = ln((1 + n)/(1 + df)) + 1 with n = 3: "flat" (df 3) 1.0; "metro", "near", "new", "spacious" (df 2) 1.288. Weights: flat 1.0, metro 2 × 1.288 = 2.575, others 1.288; row length 3.551; normalised: flat 0.282, metro 0.725, the rest 0.363.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do interaction features help, and which models need them?</summary><div class="qa-body">When the effect of one feature depends on another (revenue = price × quantity: linear R² 0.88 → 0.998 with the product). Linear and logistic models need them added explicitly; trees and boosting find them through successive splits; neural networks learn them. Degree-2 expansion of d features creates C(d + 2, 2) columns (28 for the flats' six), so regularize.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Class weights, oversampling, SMOTE: what do they actually change?</summary><div class="qa-body">They make the rare class count more in training (weight n/(k·n_c): 1.25 for the 4 fast flats; or more copies; or synthetic points x + u·(neighbour − x), e.g. (6.2, 13.2) between A and D). In practice they mostly shift the decision threshold: recall rose 0.46 → 0.86 and precision fell 0.83 → 0.25 while ROC-AUC stayed ≈ 0.946; a lower threshold on the plain model gave the same trade-off. Resample only training folds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did regularization need this note? What breaks if you skip scaling and encoding?</summary><div class="qa-body">The penalty compares weight sizes, which depend on units: ridge kept 75% of the slope with area in 100 sq ft and 99.997% with area in sq ft, and unscaled lasso dropped "rooms" because area was in big numbers. Without one-hot encoding, lasso could not even consider Baner, the column it kept. Scaling makes the penalty fair; encoding gives it the right columns to choose from.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what is the difference between fit, transform and fit_transform, and why does the next note exist?</summary><div class="qa-body">fit learns parameters (mean_, categories_, idf_, fill values), transform applies them, fit_transform does both on the same rows. Call fit only on training rows and transform on validation/test/production. Doing this by hand in every CV fold is error-prone; naive target encoding already turned an honest 3.69 into a leaky 1.68 on the flats. <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a> packages the steps so fit can only ever see training rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how did engineering a feature change the "irreducible error" of the bias–variance note?</summary><div class="qa-body">With area as the only feature, the leftover error (LOOCV 7.25) looked like noise. Adding locality as 0/1 columns cut it to 1.16. Irreducible error is irreducible only for a given feature set; feature engineering is the main tool for lowering it, while capacity and regularization only trade bias against variance (<a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>).</div></details>
</main>
`
});
