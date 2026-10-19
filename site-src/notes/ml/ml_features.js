// notes/ml/ml_features.js — Feature Engineering
Object.assign(TOPIC_CONTENT, {
  "ml_features": `<main>
  <h1>Feature Engineering</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Feature Engineering</span></div>
  <p class="lead">A model only sees the columns you give it. Feature engineering is the work of turning raw data (numbers in odd units, text categories, blanks, timestamps, free text) into columns that make the pattern easy to learn. This note covers every standard technique, each worked by hand on a few numbers before the code: scaling (standard, min-max, robust), transforms (log, Box-Cox, Yeo-Johnson), binning, categorical encoding (one-hot, ordinal, target encoding with its leakage and smoothing, frequency, hashing), missing values (MCAR/MAR/MNAR, simple, KNN and iterative imputation, missing indicators), outliers, date and time features, a first look at text, interactions and polynomial features, and class imbalance (resampling, SMOTE, class weights). It ends with the scikit-learn transformer API that every one of these uses.</p>

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
    <li><b>Came from: <a class="xref" data-note="ml_regularization">Regularization</a> and <a class="xref" data-note="ml_loss_gd">Loss &amp; Gradient Descent</a></b><span>Penalties on weight size and gradient descent both behave badly when one column is in thousands and another in single digits; regularization quietly assumed the features were already scaled. And every model so far assumed clean numeric input: no text categories, no blanks, no timestamps. Real tables have all three.</span></li>
    <li><b>This note adds: the toolbox for building the input columns</b><span>How to rescale numbers, reshape skewed ones, turn categories and dates into numbers without inventing false meaning, fill holes honestly, tame outliers, create interactions, and rebalance rare classes. For each: when it helps, which models need it, and the leak it can cause.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a></b><span>Almost every step here learns something from data (a mean, a category list, a target average). If it learns from validation or test rows, scores are inflated. The next note packages these steps into a Pipeline so they are learnt from training rows only, inside every CV fold, and shipped as one object.</span></li>
  </ol>
  <p>You should know what a feature, a label and a train/test split are (<a class="xref" data-note="ml_intro">What is ML</a>, <a class="xref" data-note="ml_splits">Splits &amp; CV</a>) and roughly how linear models, KNN and trees make predictions. Where a model's behaviour matters, it is re-explained in a line.</p>

  <h2 id="fe-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Feature Engineering</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Numbers</div>
        <ul>
          <li><b>Standard</b> (x − mean)/std · <b>min-max</b> (x − min)/(max − min) · <b>robust</b> (x − median)/IQR · maxabs x/max|x|</li>
          <li>[2,4,6,8,10] → z = ±1.414, ±0.707, 0</li>
          <li>Needed: KNN, SVM, k-means, PCA, regularized linear, nets · Not: trees, forests, boosting</li>
          <li><b>log / log1p</b> for right skew (skew 3.62 → 0.02) · <b>Box-Cox</b> (x &gt; 0), <b>Yeo-Johnson</b> (any sign), λ by max likelihood</li>
          <li><b>Binning</b>: equal width, equal frequency, domain cut-offs; lets a linear model bend (R² 0.001 → 0.837)</li>
          <li><b>Outliers</b>: IQR fences Q1 − 1.5·IQR, Q3 + 1.5·IQR; robust z = 0.6745(x − med)/MAD; clip, transform or Huber</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Categories</div>
        <ul>
          <li><b>One-hot</b> — one 0/1 column each; handle_unknown="ignore"; drop="first" for unregularized linear</li>
          <li><b>Ordinal</b> — only for real order (S &lt; M &lt; L) or trees</li>
          <li><b>Target / mean</b> — (n·mean + m·global)/(n + m); ⚠ must be out-of-fold (naive AUC 0.777 on pure noise)</li>
          <li><b>Count / frequency</b> — how common the category is</li>
          <li><b>Hashing</b> — |hash| mod m buckets; collisions (Pune and Delhi share a bucket at m = 4)</li>
          <li>High cardinality: min_frequency, target enc., hashing, native (CatBoost/LightGBM), embeddings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Missing values</div>
        <ul>
          <li><b>MCAR</b> random · <b>MAR</b> depends on observed columns · <b>MNAR</b> depends on the missing value itself</li>
          <li>MAR: observed mean 53.3 vs true 50; fix by conditioning on age → 50.04; MNAR can't be fixed this way</li>
          <li><b>Simple</b> mean/median/most_frequent/constant · <b>missing indicator</b> flag</li>
          <li><b>KNN</b> — average of k nearest rows (nan-Euclidean) · <b>Iterative</b> (MICE) — regress each column on the others, repeat</li>
          <li>Trees/HistGB handle NaN natively</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Time, text, interactions</div>
        <ul>
          <li><b>Date parts</b> hour, day of week, month, weekend, holiday, time since</li>
          <li><b>Cyclical</b> sin/cos(2π·h/24): 23h↔1h distance 0.518 not 22</li>
          <li><b>Bag of words</b> counts · <b>TF-IDF</b> idf = ln((1+n)/(1+df)) + 1, then L2-normalise</li>
          <li><b>Interactions</b> a·b · <b>polynomial</b> degree 2 of d features → C(d+2, 2) columns (50 → 1,326)</li>
          <li>Domain ratios beat brute force (distance feature: R² −0.013 → 0.937)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Class imbalance</div>
        <ul>
          <li>Accuracy lies: always "no" = 94.8%</li>
          <li><b>Class weight</b> n/(k·n_c): 95/5 → 0.526 and 10</li>
          <li><b>Random over / under</b> sampling · <b>SMOTE</b> x + u·(neighbour − x)</li>
          <li>All mostly <b>move the threshold</b>: recall 0.46 → 0.86, precision 0.83 → 0.25, AUC ≈ 0.946–0.949 unchanged</li>
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
      <div class="rm-item rm-done" data-target="fe-compare"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Which Step for Which Model</span><span class="rm-sub">Cheat-sheet tables</span></div></div>
      <div class="rm-item rm-done" data-target="fe-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Leaks and silent bugs</span></div></div>
      <div class="rm-item rm-done" data-target="fe-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="fe-why"><span class="num">01</span>What a Feature Is, and Why Engineer It</h2>
  <h3>The need</h3>
  <p>A <strong>feature</strong> is one input column the model reads. Raw data is rarely in the form that makes the pattern easy. A food-delivery company records pickup and drop-off coordinates; delivery time depends on the <em>distance</em> between them, which is not any single column. A linear model can only add up columns times weights, so it cannot invent "distance" from four coordinates. Engineering is writing that column yourself.</p>
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
  <p>With raw coordinates, the linear model explains nothing (R² −0.013, slightly worse than the average). The random forest manages 0.807 by carving the space into boxes. Add the one engineered column and the linear model jumps to 0.937, beating the forest on raw columns; the forest improves too (0.925). One good feature did more than a stronger algorithm.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana shop owner does not judge a customer from each bill. He thinks "orders late at night", "usually spends ₹100", "today's bill is 75% of his salary". Those summaries are not in any single bill; he built them. Features are those summaries.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Feature engineering</strong>: creating, transforming, encoding and selecting input columns so that a model can learn the pattern more easily. It has two halves: <strong>representation</strong> (put existing information in a usable form: scaling, encoding, imputing) and <strong>creation</strong> (add information through domain knowledge: ratios, distances, counts, time since an event).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every engineered column must be computable at prediction time from data available then. "Average spend of this user" computed over all rows, including later ones, uses the future. Ask of every feature: "would I know this when I make the prediction?" (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  </div>

  <h2 id="fe-scale"><span class="num">02</span>Numeric Scaling</h2>
  <h3>The need</h3>
  <p>Three flats: tenant income ₹20,000, ₹50,000, ₹80,000 and rooms 1, 2, 3. KNN measures similarity by distance between rows. The distance from flat 1 to flat 2 is √(30,000² + 1²) ≈ 30,000.00002: the room difference is invisible, just because rupees are big numbers. Scaling puts columns on comparable ranges so each gets a fair voice.</p>
  <h3>Four scalers, by hand</h3>
  <p>Take x = (2, 4, 6, 8, 10).</p>
  <ul>
    <li><strong>Standardisation</strong> z = (x − mean)/std. Mean = 30/5 = 6. Deviations −4, −2, 0, 2, 4; squares 16, 4, 0, 4, 16; average 40/5 = 8; std = √8 = 2.828 (sklearn divides by n, not n − 1). z = −4/2.828 = −1.414, −0.707, 0, 0.707, 1.414.</li>
    <li><strong>Min-max</strong> (x − min)/(max − min) = (x − 2)/8 → 0, 0.25, 0.5, 0.75, 1.</li>
    <li><strong>Robust</strong> (x − median)/IQR. Median 6; Q1 = 4, Q3 = 8, IQR = 4 → −1, −0.5, 0, 0.5, 1.</li>
    <li><strong>Max-abs</strong> x / max|x| = x/10 → 0.2 … 1. Keeps zeros as zeros, so it is safe for sparse data.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, MaxAbsScaler

x = np.array([[2], [4], [6], [8], [10]])
for s in [StandardScaler(), MinMaxScaler(), RobustScaler(), MaxAbsScaler()]:
    print(f"{type(s).__name__:15s}", s.fit_transform(x).ravel().round(3))
sc = StandardScaler().fit(x)
print("learnt: mean_ =", sc.mean_, " scale_ =", sc.scale_.round(3))</div>
  <div class="fx" data-lang="text">StandardScaler  [-1.414 -0.707  0.     0.707  1.414]
MinMaxScaler    [0.   0.25 0.5  0.75 1.  ]
RobustScaler    [-1.  -0.5  0.   0.5  1. ]
MaxAbsScaler    [0.2 0.4 0.6 0.8 1. ]
learnt: mean_ = [6.]  scale_ = [2.828]</div>
  <p>The scaler <em>learns</em> two numbers (<code>mean_</code> = 6, <code>scale_</code> = 2.828) in <code>fit</code> and reuses them for every later row. That is why it must be fit on training rows only.</p>
  <h3>What one outlier does</h3>
  <p>Five incomes (in thousands) where one is a CEO: 20, 25, 30, 35, 500. Mean = 610/5 = 122, pulled far from the typical 30; std = √(178,730/5) ≈ 189. The four normal people all get z ≈ −0.5.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

x = np.array([[20], [25], [30], [35], [500]])         # incomes in thousands; one CEO
for s in [StandardScaler(), MinMaxScaler(), RobustScaler()]:
    print(f"{type(s).__name__:15s}", s.fit_transform(x).ravel().round(2))</div>
  <div class="fx" data-lang="text">StandardScaler  [-0.54 -0.51 -0.49 -0.46  2.  ]
MinMaxScaler    [0.   0.01 0.02 0.03 1.  ]
RobustScaler    [-1.  -0.5  0.   0.5 47. ]</div>
  <p>Standard and min-max squash the four normal incomes into almost one value (−0.54 to −0.46, or 0.00 to 0.03): their differences are lost. Robust scaling uses the median (30) and IQR (35 − 25 = 10), which the CEO cannot move, so the normal four keep their spread (−1 to 0.5) and only the CEO flies off to 47.</p>
  <table class="tbl">
    <tr><th>Scaler</th><th>Formula</th><th>Result range</th><th>Use when</th><th>Weak spot</th></tr>
    <tr><td><code>StandardScaler</code></td><td>(x − mean)/std</td><td>mean 0, std 1, unbounded</td><td>default; roughly bell-shaped data; PCA, linear models, SVM</td><td>outliers inflate std</td></tr>
    <tr><td><code>MinMaxScaler</code></td><td>(x − min)/(max − min)</td><td>[0, 1]</td><td>bounded data (pixels 0–255), nets needing [0, 1]</td><td>one outlier squashes the rest</td></tr>
    <tr><td><code>RobustScaler</code></td><td>(x − median)/IQR</td><td>median 0, unbounded</td><td>outliers present</td><td>outliers stay large (not removed)</td></tr>
    <tr><td><code>MaxAbsScaler</code></td><td>x / max|x|</td><td>[−1, 1]</td><td>sparse data (keeps zeros)</td><td>outliers</td></tr>
    <tr><td><code>Normalizer</code></td><td>row / ‖row‖</td><td>each <em>row</em> length 1</td><td>text vectors, cosine similarity</td><td>works per row, not per column</td></tr>
  </table>
  <h3>When scaling matters and when it does not</h3>
  <p>Scaling matters for any model that compares sizes across columns: distances (KNN, k-means, SVM with RBF kernel), penalties on weight size (ridge, lasso, regularized logistic regression: <a class="xref" data-note="ml_regularization">Regularization</a>), gradient descent (badly scaled columns make the loss a long thin valley and slow convergence: <a class="xref" data-note="ml_loss_gd">Loss &amp; GD</a>) and PCA (which chases variance). It does not matter for trees: a split asks "is x &gt; t?", and stretching x just moves t.</p>
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

  <h2 id="fe-transform"><span class="num">03</span>Transforms: Log, Box-Cox, Yeo-Johnson</h2>
  <h3>The need</h3>
  <p>Money, counts, sizes and durations are usually <strong>right-skewed</strong>: most values small, a long tail of huge ones. A linear model on such a column lets the few huge values dominate the fit, and the relationship with the target is often multiplicative ("10% more area adds a fixed amount to price") rather than additive. A transform changes the <em>shape</em> of the distribution, not just its range.</p>
  <h3>Log, by hand</h3>
  <p>Incomes 10, 20, 40, 80, 1000 (thousands). log₁₀ gives 1, 1.30, 1.60, 1.90, 3. Each doubling became the same step (+0.30), and 1000 is now just 1.1 above 80 instead of 920 above it. Log turns ratios into differences. For counts that can be 0, use log1p(x) = log(1 + x): 0 → 0, 9 → 2.30, 99 → 4.61.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.stats import skew

income = np.array([10, 20, 40, 80, 1000.])           # thousand rupees per month
print("log10:", np.log10(income).round(2))
print("log1p of counts [0, 1, 9, 99]:", np.log1p([0, 1, 9, 99]).round(2))
rng = np.random.default_rng(0)
big = rng.lognormal(10, 1, 5000)                       # a typical right-skewed money column
print(f"skewness raw {skew(big):.2f}   after log {skew(np.log(big)):.2f}")</div>
  <div class="fx" data-lang="text">log10: [1.  1.3 1.6 1.9 3. ]
log1p of counts [0, 1, 9, 99]: [0.   0.69 2.3  4.61]
skewness raw 3.62   after log 0.02</div>
  <p><strong>Skewness</strong> measures lopsidedness (0 = symmetric; above 1 = strongly right-skewed). A typical money column has skew 3.62; after log, 0.02.</p>
  <h3>Box-Cox, by hand</h3>
  <p>Log is one member of a family. Box-Cox (1964), for positive x:</p>
  <p style="text-align:center"><strong>x(λ) = (x^λ − 1)/λ</strong> for λ ≠ 0, and <strong>ln x</strong> for λ = 0</p>
  <p>λ = 1 is just a shift (x − 1), λ = 0.5 is a square-root-like squash, λ = 0 is log, negative λ squashes even harder. On x = (1, 4, 9): λ = 1 → (0, 3, 8); λ = 0.5 → (√x − 1)/0.5 = (0, 2, 4); λ = 0 → (0, 1.386, 2.197). The (x^λ − 1)/λ form is chosen so that the curve slides smoothly into ln x as λ → 0. The best λ is found by maximum likelihood: the λ under which the transformed data looks most like a normal distribution.</p>
  <h3>Yeo-Johnson, for zero and negative values</h3>
  <p>Box-Cox needs x &gt; 0. Yeo-Johnson (2000) extends it: for x ≥ 0 it is Box-Cox applied to x + 1, i.e. ((x + 1)^λ − 1)/λ; for x &lt; 0 it mirrors with power 2 − λ: −((1 − x)^(2−λ) − 1)/(2 − λ). By hand with λ = 0.5: x = 3 → (4^0.5 − 1)/0.5 = (2 − 1)/0.5 = 2; x = 0 → 0; x = −1 → −(2^1.5 − 1)/1.5 = −(2.828 − 1)/1.5 = −1.219.</p>
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
  <p>Price truly grows with log(area). Fed raw area, the straight line fits badly (R² 0.644); fed log(area), 0.932. Two related tools: <code>QuantileTransformer</code> maps each value to its rank and then to a uniform or normal shape (very robust, but it forgets how far apart values were), and transforming the <em>target</em> (<code>TransformedTargetRegressor</code>, e.g. predict log price) when errors grow with the size of y.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Power transform</strong>: a monotone, invertible change of shape that makes a column more symmetric and closer to normal. Box-Cox (x &gt; 0), Yeo-Johnson (any x), λ chosen by maximum likelihood. Monotone means order is kept, so trees are unaffected; linear models, distance-based models and anything assuming normal-ish inputs benefit.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>np.log(0)</code> is −∞ and <code>np.log</code> of a negative is NaN, which silently breaks training. Use log1p for counts, Yeo-Johnson for signed values. And if you transform the target, transform predictions back (exp) before reporting errors in real units; note that exp of a predicted mean log is the median, not the mean.</p>
  </div>

  <h2 id="fe-bin"><span class="num">04</span>Binning</h2>
  <h3>The idea</h3>
  <p><strong>Binning</strong> (discretisation) cuts a numeric column into ranges and replaces each value by its range. It throws away detail inside a bin, but it lets a linear model give each range its own weight, so the model can bend. It also makes a model robust to small measurement noise and outliers.</p>
  <h3>By hand: ten ages, three bins</h3>
  <p>Ages 18, 22, 25, 31, 38, 45, 52, 60, 67, 75.</p>
  <ul>
    <li><strong>Equal width</strong>: (75 − 18)/3 = 19, so edges 18, 37, 56, 75. Bins hold 4, 3, 3 people.</li>
    <li><strong>Equal frequency</strong> (quantile): edges at the 1/3 and 2/3 quantiles, 31 and 52. Each bin holds about a third of the people (4, 3, 3 here because 10 does not divide by 3).</li>
    <li><strong>Domain</strong>: cut-offs that mean something: young ≤ 25, adult ≤ 60, senior above.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd

ages = pd.Series([18, 22, 25, 31, 38, 45, 52, 60, 67, 75])
width = pd.cut(ages, bins=3)                          # equal width
freq = pd.qcut(ages, q=3)                             # equal frequency (quantiles)
domain = pd.cut(ages, bins=[0, 25, 60, 120], labels=["young", "adult", "senior"])
print(pd.DataFrame({"age": ages, "equal-width": width, "equal-freq": freq, "domain": domain}).to_string(index=False))
print("counts equal-width:", width.value_counts(sort=False).tolist(), " equal-freq:", freq.value_counts(sort=False).tolist())</div>
  <div class="fx" data-lang="text"> age    equal-width     equal-freq domain
  18 (17.943, 37.0] (17.999, 31.0]  young
  22 (17.943, 37.0] (17.999, 31.0]  young
  25 (17.943, 37.0] (17.999, 31.0]  young
  31 (17.943, 37.0] (17.999, 31.0]  adult
  38   (37.0, 56.0]   (31.0, 52.0]  adult
  45   (37.0, 56.0]   (31.0, 52.0]  adult
  52   (37.0, 56.0]   (31.0, 52.0]  adult
  60   (56.0, 75.0]   (52.0, 75.0]  adult
  67   (56.0, 75.0]   (52.0, 75.0] senior
  75   (56.0, 75.0]   (52.0, 75.0] senior
counts equal-width: [4, 3, 3]  equal-freq: [4, 3, 3]</div>
  <p>Equal width is sensitive to outliers (one age of 120 would stretch every bin); equal frequency adapts to the data; domain bins are the most interpretable and are often what the business already uses.</p>
  <h3>Binning lets a straight line bend</h3>
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
    <p>Binning a column for a tree model usually hurts: the tree already finds the best cut-offs itself, and binning removes its freedom. Binning also creates artificial jumps at the edges (age 35.0 and 35.1 in different bins). Splines or polynomial terms (<a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>) give smooth curves instead. And never choose bin edges by looking at the target on the full dataset; that is leakage.</p>
  </div>

  <h2 id="fe-cat"><span class="num">05</span>Categorical Encoding</h2>
  <h3>The need</h3>
  <p>A column like city holds words. Models need numbers. The danger is inventing meaning: numbering Delhi = 0, Mumbai = 1, Pune = 2 tells a linear model "Pune is twice Mumbai" and "Mumbai is between Delhi and Pune", which is nonsense. Each encoding below is a different trade-off between honesty, number of columns and leakage risk.</p>
  <h3>One-hot and ordinal</h3>
  <p><strong>One-hot</strong>: one 0/1 column per category, 1 in the column of the row's category. By hand for (Pune, Delhi, Mumbai, Pune) with columns sorted Delhi, Mumbai, Pune: Pune → (0, 0, 1), Delhi → (1, 0, 0), Mumbai → (0, 1, 0). No order is implied; every city is equally far from every other.</p>
  <p><strong>Ordinal</strong>: one integer per category, in a meaningful order. Shirt sizes S &lt; M &lt; L → 0, 1, 2. Right only when the order is real (sizes, education levels, ratings), or for tree models, which can split integer codes anywhere.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

df = pd.DataFrame({"city": ["Pune", "Delhi", "Mumbai", "Pune"], "size": ["M", "S", "L", "M"]})
oh = OneHotEncoder(sparse_output=False, handle_unknown="ignore").fit(df[["city"]])
print(oh.get_feature_names_out(), "\\n", oh.transform(df[["city"]]))
print("unseen 'Goa' -&gt;", oh.transform(pd.DataFrame({"city": ["Goa"]})))
drop = OneHotEncoder(sparse_output=False, drop="first").fit(df[["city"]])
print("drop='first':", drop.get_feature_names_out())
od = OrdinalEncoder(categories=[["S", "M", "L"]]).fit(df[["size"]])
print("ordinal size:", od.transform(df[["size"]]).ravel())</div>
  <div class="fx" data-lang="text">['city_Delhi' 'city_Mumbai' 'city_Pune'] 
 [[0. 0. 1.]
 [1. 0. 0.]
 [0. 1. 0.]
 [0. 0. 1.]]
unseen 'Goa' -&gt; [[0. 0. 0.]]
drop='first': ['city_Mumbai' 'city_Pune']
ordinal size: [1. 0. 2. 1.]</div>
  <p>An unseen city (Goa) becomes all zeros with <code>handle_unknown="ignore"</code> instead of crashing in production. <code>drop="first"</code> removes one column (Delhi becomes "all zeros"): with all three columns plus an intercept, the columns always add up to 1, an exact copy of the intercept (the <strong>dummy variable trap</strong>, perfect multicollinearity). Unregularized linear regression and statsmodels need the drop; regularized models and trees do not, and keeping all columns is easier to read.</p>
  <h3>Target (mean) encoding, by hand</h3>
  <p>One-hot on a column with 1,000 PIN codes creates 1,000 mostly-zero columns. <strong>Target encoding</strong> replaces each category by the average target of that category: one numeric column, however many categories. Eight customers:</p>
  <table class="tbl">
    <tr><th>city</th><th>churn values</th><th>n</th><th>raw mean</th><th>smoothed, m = 2</th></tr>
    <tr><td>A</td><td>1, 1, 0, 1</td><td>4</td><td>0.75</td><td>(4·0.75 + 2·0.625)/(4 + 2) = 4.25/6 = 0.708</td></tr>
    <tr><td>B</td><td>0, 0</td><td>2</td><td>0.00</td><td>(0 + 1.25)/4 = 0.3125</td></tr>
    <tr><td>C</td><td>1, 1</td><td>2</td><td>1.00</td><td>(2 + 1.25)/4 = 0.8125</td></tr>
  </table>
  <p>The global churn rate is 5/8 = 0.625. City C has only two customers who both churned; a raw mean of 1.00 claims certainty from two rows. <strong>Smoothing</strong> blends the category mean with the global mean, trusting the category more when it has more rows:</p>
  <p style="text-align:center"><strong>enc(c) = (n_c · mean_c + m · global) / (n_c + m)</strong></p>
  <p>m acts like "m imaginary rows at the global rate". With m = 2, C drops from 1.00 to 0.81 and B rises from 0 to 0.31; A, with more rows, moves less (0.75 → 0.708). sklearn's <code>TargetEncoder(smooth=m)</code> uses exactly this formula (its default <code>smooth="auto"</code> picks m per category from the variances, an empirical-Bayes estimate):</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.preprocessing import TargetEncoder

df = pd.DataFrame({"city": ["A", "A", "A", "A", "B", "B", "C", "C"],
                   "churn": [1, 1, 0, 1, 0, 0, 1, 1]})
glob = df.churn.mean()
stats = df.groupby("city").churn.agg(["count", "mean"])
m = 2                                                   # smoothing strength
stats["smoothed"] = (stats["count"] * stats["mean"] + m * glob) / (stats["count"] + m)
print("global mean:", glob); print(stats.round(3))
te = TargetEncoder(smooth=m, target_type="binary").fit(df[["city"]], df.churn)
print("sklearn encodings_:", np.round(te.encodings_[0], 3))</div>
  <div class="fx" data-lang="text">global mean: 0.625
      count  mean  smoothed
city                       
A         4  0.75     0.708
B         2  0.00     0.312
C         2  1.00     0.812
sklearn encodings_: [0.708 0.312 0.812]</div>
  <h3>Why naive target encoding leaks</h3>
  <p>Look at city C again: both rows have churn = 1, and both get the feature value 1.00, computed from their own labels. The feature contains the answer. With few rows per category, the model learns "feature high → churn" from that self-reference, which will not exist for new customers. On pure noise:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, TargetEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = pd.DataFrame({"zip": rng.choice([f"z{i}" for i in range(1000)], 5000)})  # 1,000 categories
y = (rng.random(5000) &lt; 0.3).astype(int)                  # target is pure noise
print("one-hot columns:", OneHotEncoder().fit_transform(X).shape[1])
print("one-hot, min_frequency=8:", OneHotEncoder(min_frequency=8).fit_transform(X).shape[1])

naive = X.zip.map(pd.Series(y).groupby(X.zip).mean()).to_frame()   # mean target per zip, ALL rows
print("naive target-mean AUC:", cross_val_score(LogisticRegression(), naive, y, cv=5, scoring="roc_auc").mean().round(3))
pipe = make_pipeline(TargetEncoder(), LogisticRegression())   # cross-fitted
print("TargetEncoder pipe AUC:", cross_val_score(pipe, X, y, cv=5, scoring="roc_auc").mean().round(3))</div>
  <div class="fx" data-lang="text">one-hot columns: 994
one-hot, min_frequency=8: 121
naive target-mean AUC: 0.777
TargetEncoder pipe AUC: 0.495</div>
  <p>The target is random, so an honest score is AUC 0.5. Naive encoding computed on all rows scores 0.777: with about 5 rows per zip, each row's own label moves its zip's mean. sklearn's <code>TargetEncoder</code> uses <strong>cross fitting</strong> in <code>fit_transform</code>: it splits the training rows into 5 folds and encodes each fold's rows with means computed from the other 4 folds, so no row ever sees its own label. The fake signal disappears (0.495). At prediction time (<code>transform</code>), it uses means from all training rows. Also shown: <code>min_frequency=8</code> groups rare zips into one "infrequent" column, shrinking one-hot from 994 to 121 columns.</p>
  <h3>Count, frequency and hashing</h3>
  <p><strong>Count / frequency encoding</strong>: replace a category by how many rows have it (or that share). For (Pune, Delhi, Mumbai, Pune, Pune, Delhi): Pune → 3 (0.5), Delhi → 2 (0.333), Mumbai → 1 (0.167). Uses no target, so no target leakage; useful when popularity itself matters (a rare merchant is suspicious). Two categories with equal counts become indistinguishable.</p>
  <p><strong>Hashing trick</strong>: pass the category string through a hash function and keep |hash| mod m as a column index, with the hash's sign as ±1. No vocabulary to store, fixed width m, and brand-new categories work automatically, which suits huge or open-ended vocabularies (user agents, URLs, words). The price is <strong>collisions</strong>: different categories can land in the same column.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.feature_extraction import FeatureHasher
from sklearn.utils import murmurhash3_32

cities = ["Pune", "Delhi", "Mumbai", "Pune", "Pune", "Delhi"]
s = pd.Series(cities)
print("count encoding:", s.map(s.value_counts()).tolist())
print("frequency enc.:", s.map(s.value_counts(normalize=True)).round(3).tolist())
for c in ["Pune", "Delhi", "Mumbai"]:
    h = murmurhash3_32(c, seed=0)                         # the hash FeatureHasher uses
    print(f"{c:7s} hash={h:12d}  bucket=|h| % 4 = {abs(h) % 4}  sign={'+' if h &gt;= 0 else '-'}")
fh = FeatureHasher(n_features=4, input_type="string")
print(fh.transform([[c] for c in ["Pune", "Delhi", "Mumbai"]]).toarray())</div>
  <div class="fx" data-lang="text">count encoding: [3, 2, 1, 3, 3, 2]
frequency enc.: [0.5, 0.333, 0.167, 0.5, 0.5, 0.333]
Pune    hash=  -664136931  bucket=|h| % 4 = 3  sign=-
Delhi   hash= -1145532383  bucket=|h| % 4 = 3  sign=-
Mumbai  hash= -1285594882  bucket=|h| % 4 = 2  sign=-
[[ 0.  0.  0. -1.]
 [ 0.  0.  0. -1.]
 [ 0.  0. -1.  0.]]</div>
  <p>By hand from the printed hashes with m = 4: Pune → |−664136931| mod 4 = 3, Delhi → 3, Mumbai → 2. Pune and Delhi collide in column 3, so this model cannot tell them apart. With m = 2²⁰ (sklearn's default) collisions are rare; the sign trick makes colliding values partly cancel instead of always adding up.</p>
  <table class="tbl">
    <tr><th>Encoding</th><th>Columns</th><th>Uses target?</th><th>Best for</th><th>Watch out</th></tr>
    <tr><td>One-hot</td><td>one per category</td><td>no</td><td>nominal, up to ~50 categories, any model</td><td>width; unseen → ignore; dummy trap</td></tr>
    <tr><td>Ordinal</td><td>1</td><td>no</td><td>ordered categories; trees</td><td>fake order for linear models</td></tr>
    <tr><td>Target / mean</td><td>1 (per class)</td><td><strong>yes</strong></td><td>high cardinality</td><td>leaks unless out-of-fold; smooth rare ones</td></tr>
    <tr><td>Count / frequency</td><td>1</td><td>no</td><td>when popularity matters</td><td>ties merge categories</td></tr>
    <tr><td>Hashing</td><td>m (fixed)</td><td>no</td><td>huge / open vocabularies, streaming</td><td>collisions; not invertible</td></tr>
    <tr><td>Native / embeddings</td><td>–</td><td>–</td><td>CatBoost, LightGBM, HistGB; neural nets</td><td>library-specific</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cardinality</strong>: the number of distinct values in a categorical column. Low cardinality → one-hot. High cardinality (PIN codes, merchant IDs) → target encoding (out-of-fold, smoothed), hashing, grouping rare values (<code>min_frequency</code>, <code>max_categories</code>), or a model with native categorical support (<a class="xref" data-note="ml_catboost">CatBoost</a> uses ordered target statistics, its own leak-free target encoding).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>LabelEncoder</code> is for the target y, not features: it sorts categories alphabetically, which imposes a meaningless order and cannot handle unseen values in a pipeline. For features use <code>OrdinalEncoder</code> (with explicit <code>categories=</code> when the order matters) or <code>OneHotEncoder</code>.</p>
  </div>

  <h2 id="fe-missing"><span class="num">06</span>Missing Values</h2>
  <h3>Why the reason for a blank matters</h3>
  <p>Before filling a hole, ask <em>why</em> it is empty. Statisticians (Rubin, 1976) name three mechanisms:</p>
  <ul>
    <li><strong>MCAR</strong> (missing completely at random): the blank has nothing to do with any value. A lab sample was dropped on the floor. Rows with blanks are a random subset.</li>
    <li><strong>MAR</strong> (missing at random, given what you observe): the chance of a blank depends on other <em>observed</em> columns. Young applicants skip the income field more often; age is recorded.</li>
    <li><strong>MNAR</strong> (missing not at random): the chance depends on the missing value itself. High earners skip the income field because their income is high.</li>
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
  <p>Under MCAR the observed rows are a fair sample (50.06). Under MAR the observed mean is biased (53.30, because the young, lower earners are under-represented), but filling each blank with the mean of the same age band recovers the truth (50.04): conditioning on the observed cause removes the bias. Under MNAR the observed mean is biased the other way (46.13) and using age helps only a little (48.73); the cause of missingness is the hidden income itself, which no observed column fully explains.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>You can never prove MCAR vs MNAR from the data alone; it needs domain knowledge. Practical consequence: under MAR, imputation that uses other columns (KNN, iterative) is the right tool; under MNAR, the fact that a value is missing is itself information, so add a <strong>missing indicator</strong> column and let the model use it.</p>
  </div>
  <h3>Simple imputation, by hand</h3>
  <p>Column x = (10, ?, 30, 40, ?, 100). Observed values: 10, 30, 40, 100. Mean = 180/4 = 45. Median of (10, 30, 40, 100) = (30 + 40)/2 = 35. Most frequent (for categories) is the mode. Constant fills a chosen value (0, or "missing" for text).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.impute import SimpleImputer

x = np.array([[10.], [np.nan], [30.], [40.], [np.nan], [100.]])
for strategy in ["mean", "median", "constant"]:
    imp = SimpleImputer(strategy=strategy, fill_value=0)
    print(f"{strategy:8s} statistics_={imp.fit(x).statistics_}  -&gt;", imp.transform(x).ravel())
ind = SimpleImputer(strategy="median", add_indicator=True).fit_transform(x)
print("median + indicator:\\n", ind)</div>
  <div class="fx" data-lang="text">mean     statistics_=[45.]  -&gt; [ 10.  45.  30.  40.  45. 100.]
median   statistics_=[35.]  -&gt; [ 10.  35.  30.  40.  35. 100.]
constant statistics_=[0]  -&gt; [ 10.   0.  30.  40.   0. 100.]
median + indicator:
 [[ 10.   0.]
 [ 35.   1.]
 [ 30.   0.]
 [ 40.   0.]
 [ 35.   1.]
 [100.   0.]]</div>
  <p>The median is not dragged by the 100, so it is the safer default for skewed columns. <code>add_indicator=True</code> appends a 0/1 column marking which rows were filled. Simple imputation shrinks the column's variance (many identical values) and weakens its correlations with other columns; the indicator gives the model a way to treat filled rows differently.</p>
  <h3>KNN imputation, by hand</h3>
  <p>Fill a blank with the average of that column among the k most similar rows. Similarity is measured on the columns both rows have, with the <strong>nan-Euclidean</strong> distance: √(weight × Σ squared differences over shared columns), weight = (total columns)/(shared columns).</p>
  <table class="tbl">
    <tr><th>row</th><th>x1</th><th>x2</th><th>x3</th><th>distance to row 4 (shared x1, x2; weight 3/2)</th></tr>
    <tr><td>1</td><td>1</td><td>2</td><td>3</td><td>√(1.5 × (1² + 0²)) = 1.225</td></tr>
    <tr><td>2</td><td>2</td><td>3</td><td>5</td><td>√(1.5 × (0² + 1²)) = 1.225</td></tr>
    <tr><td>3</td><td>8</td><td>9</td><td>20</td><td>√(1.5 × (6² + 7²)) = √127.5 = 11.292</td></tr>
    <tr><td>4</td><td>2</td><td>2</td><td><strong>?</strong></td><td>–</td></tr>
  </table>
  <p>With k = 2 the neighbours are rows 1 and 2, so x3 = (3 + 5)/2 = 4. The column mean would give (3 + 5 + 20)/3 = 9.33, dragged up by row 3, which is nothing like row 4.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.impute import KNNImputer
from sklearn.metrics.pairwise import nan_euclidean_distances

X = np.array([[1, 2, 3], [2, 3, 5], [8, 9, 20], [2, 2, np.nan]])
print("distances from row 4:", nan_euclidean_distances(X[3:], X[:3]).round(3))
print("KNN (k=2) fills:", KNNImputer(n_neighbors=2).fit_transform(X)[3])
print("column mean would give:", np.nanmean(X[:, 2]).round(3))</div>
  <div class="fx" data-lang="text">distances from row 4: [[ 1.225  1.225 11.292]]
KNN (k=2) fills: [2. 2. 4.]
column mean would give: 9.333</div>
  <h3>Iterative imputation (MICE), by hand</h3>
  <p>Treat each column with holes as a target: fit a regression of that column on the other columns using rows where it is known, predict the blanks. With several incomplete columns, start with mean fills and cycle through the columns, re-fitting each with the latest fills of the others, for several rounds (Multiple Imputation by Chained Equations). By hand with two columns, rows (1, 3), (2, 5), (8, 20) known and (2, ?) to fill: mean x1 = 3.667, mean x2 = 9.333. Σ(dx1·dx2) = (−2.667)(−6.333) + (−1.667)(−4.333) + (4.333)(10.667) = 16.89 + 7.22 + 46.22 = 70.33. Σdx1² = 7.11 + 2.78 + 18.78 = 28.67. Slope = 70.33/28.67 = 2.4535, intercept = 9.333 − 2.4535 × 3.667 = 0.337. Fill = 0.337 + 2.4535 × 2 = 5.244.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.experimental import enable_iterative_imputer  # noqa: F401 (switches the class on)
from sklearn.impute import IterativeImputer
from sklearn.linear_model import LinearRegression

X = np.array([[1, 3], [2, 5], [8, 20], [2, np.nan]])
b, a = np.polyfit(X[:3, 0], X[:3, 1], 1)                 # regress column 2 on column 1
print(f"hand: x2 = {a:.4f} + {b:.4f}·x1  -&gt;  fill {a + b * 2:.3f}")
it = IterativeImputer(estimator=LinearRegression(), random_state=0).fit(X)
print("IterativeImputer fills:", it.transform(X)[3, 1].round(3))</div>
  <div class="fx" data-lang="text">hand: x2 = 0.3372 + 2.4535·x1  -&gt;  fill 5.244
IterativeImputer fills: 5.244</div>
  <h3>Comparing imputers on real data</h3>
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
  <p>Mean filling is off by about one standard deviation, as expected (it ignores everything about the patient). KNN does a little better (0.908), and iterative imputation, which exploits the correlations between columns, is much closer (0.655) and gives the best downstream R² (0.451, against 0.480 with no missing data at all). The indicator adds little here because the missingness depends on age, which the model already sees.</p>
  <table class="tbl">
    <tr><th>Method</th><th>Uses other columns?</th><th>Cost</th><th>Good for</th></tr>
    <tr><td>Drop rows</td><td>–</td><td>none</td><td>very few blanks, MCAR (otherwise biased and wasteful)</td></tr>
    <tr><td>Mean / median / mode</td><td>no</td><td>tiny</td><td>baseline; trees; with an indicator</td></tr>
    <tr><td>Constant + indicator</td><td>no</td><td>tiny</td><td>MNAR ("missing" means something)</td></tr>
    <tr><td>KNN imputer</td><td>yes (similar rows)</td><td>O(n²) distances</td><td>small/medium data, local structure</td></tr>
    <tr><td>Iterative (MICE)</td><td>yes (regressions)</td><td>several model fits per column</td><td>MAR with correlated columns</td></tr>
    <tr><td>Native NaN handling</td><td>model decides</td><td>none</td><td>HistGradientBoosting, XGBoost, LightGBM, sklearn trees ≥ 1.3 (<a class="xref" data-note="ml_dtree">Decision Trees</a>)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Imputers learn statistics (means, neighbours, regressions). Fitting them on all rows before the split leaks test information. Also: never impute the target, and do not let an imputer use the target column as a predictor at prediction time (it will not be there).</p>
  </div>

  <h2 id="fe-outliers"><span class="num">07</span>Outliers</h2>
  <h3>Detecting them, by hand</h3>
  <p>Eight daily order counts: 12, 14, 15, 15, 16, 18, 19, 95.</p>
  <ul>
    <li><strong>IQR rule</strong> (Tukey): Q1 = 14.75, Q3 = 18.25 (numpy's linear interpolation: position 0.25 × 7 = 1.75 → 14 + 0.75 × (15 − 14)), IQR = 3.5. Fences: 14.75 − 1.5 × 3.5 = 9.5 and 18.25 + 5.25 = 23.5. 95 is outside → outlier.</li>
    <li><strong>z-score</strong> |x − mean|/std &gt; 3: mean = 204/8 = 25.5, std = 26.35. z(95) = 69.5/26.35 = 2.64 &lt; 3, so the z rule <em>misses</em> it. The outlier inflated the mean and std it is judged by (<strong>masking</strong>).</li>
    <li><strong>Robust z</strong> = 0.6745 × (x − median)/MAD, MAD = median of |x − median|. Median 15.5; absolute deviations 3.5, 1.5, 0.5, 0.5, 0.5, 2.5, 3.5, 79.5; their median = (1.5 + 2.5)/2 = 2. Robust z(95) = 0.6745 × 79.5/2 = 26.8: unmistakable. (0.6745 makes MAD comparable to a std for normal data.)</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np

x = np.array([12, 14, 15, 15, 16, 18, 19, 95.])
q1, q3 = np.percentile(x, [25, 75]); iqr = q3 - q1
lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(f"Q1={q1} Q3={q3} IQR={iqr}  fences [{lo}, {hi}]  outliers: {x[(x &lt; lo) | (x &gt; hi)]}")
z = (x - x.mean()) / x.std()
print(f"mean={x.mean()} std={x.std():.2f}  z-scores: {z.round(2)}")
med = np.median(x); mad = np.median(np.abs(x - med))
rz = 0.6745 * (x - med) / mad
print(f"median={med} MAD={mad}  robust z: {rz.round(2)}")
print("clipped to fences:", np.clip(x, lo, hi))</div>
  <div class="fx" data-lang="text">Q1=14.75 Q3=18.25 IQR=3.5  fences [9.5, 23.5]  outliers: [95.]
mean=25.5 std=26.35  z-scores: [-0.51 -0.44 -0.4  -0.4  -0.36 -0.28 -0.25  2.64]
median=15.5 MAD=2.0  robust z: [-1.18 -0.51 -0.17 -0.17  0.17  0.84  1.18 26.81]
clipped to fences: [12.  14.  15.  15.  16.  18.  19.  23.5]</div>
  <h3>Why they matter, and what to do</h3>
  <p>Squared-error models give an extreme row enormous pull. Twenty points on the line y ≈ 2x, then one data-entry error (y = 0 at x = 20):</p>
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
  <p>One bad row out of twenty drags the least-squares slope from 1.97 to 1.39. <code>HuberRegressor</code> uses squared loss for small errors and absolute loss for large ones (<a class="xref" data-note="ml_loss_gd">Huber loss</a>), so the bad row's pull is capped: slope 1.94.</p>
  <table class="tbl">
    <tr><th>Treatment</th><th>How</th><th>When</th></tr>
    <tr><td>Fix or remove</td><td>correct typos, drop impossible values (age 250)</td><td>clear data errors</td></tr>
    <tr><td>Clip / winsorise</td><td>cap at fences or percentiles (95 → 23.5)</td><td>genuine but extreme values distorting a linear model</td></tr>
    <tr><td>Transform</td><td>log, Yeo-Johnson, RobustScaler</td><td>skewed columns with a long tail</td></tr>
    <tr><td>Robust model / loss</td><td>Huber, quantile regression, trees</td><td>you want to keep the rows</td></tr>
    <tr><td>Keep and study</td><td>anomaly detection</td><td>outliers are the point (fraud)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deleting outliers from the test set (or computing clip limits on all rows) makes the reported score unrealistically good: production will contain them. Learn the clip limits from training rows only, apply them to every later row, and never drop test rows.</p>
  </div>

  <h2 id="fe-time"><span class="num">08</span>Date and Time Features</h2>
  <h3>Parts, flags and elapsed time</h3>
  <p>A raw timestamp is a huge number (nanoseconds since 1970) that means little to a model. Break it into the parts that drive behaviour: hour, day of week, month, weekend flag, holiday flag, and "time since" an event (account age, days since last purchase).</p>
  <h3>Cyclical encoding, by hand</h3>
  <p>Hour 23 and hour 1 are two hours apart, but as numbers they are 22 apart, and hour 1 looks closer to noon than to 23. Put the hour on a circle: angle = 2π·h/24, features sin(angle) and cos(angle).</p>
  <ul>
    <li>h = 23: angle = 2π × 23/24 = 345°; sin = −0.259, cos = 0.966.</li>
    <li>h = 1: angle = 15°; sin = 0.259, cos = 0.966.</li>
    <li>Distance between them = √((0.518)² + 0²) = 0.518. Between 1 and 12 (noon: sin 0, cos −1): 1.983, nearly the diameter 2.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd

for h in [23, 1, 12]:
    ang = 2 * np.pi * h / 24
    print(f"hour {h:2d}: sin={np.sin(ang):6.3f} cos={np.cos(ang):6.3f}")
d = lambda a, b: np.hypot(np.sin(2*np.pi*a/24) - np.sin(2*np.pi*b/24), np.cos(2*np.pi*a/24) - np.cos(2*np.pi*b/24))
print(f"distance 23h-1h: raw {abs(23 - 1)}, cyclical {d(23, 1):.3f};  1h-12h: raw 11, cyclical {d(1, 12):.3f}")

orders = pd.DataFrame({"ts": pd.to_datetime(["2024-08-14 23:10", "2024-08-15 09:30", "2024-08-17 13:00"]),
                       "signup": pd.to_datetime(["2023-01-01", "2024-08-01", "2022-06-15"])})
f = pd.DataFrame({"hour": orders.ts.dt.hour, "dow": orders.ts.dt.dayofweek,
                  "weekend": (orders.ts.dt.dayofweek &gt;= 5).astype(int), "month": orders.ts.dt.month,
                  "holiday": orders.ts.dt.strftime("%m-%d").isin(["08-15", "01-26"]).astype(int),
                  "tenure_days": (orders.ts - orders.signup).dt.days})
print(f.to_string(index=False))</div>
  <div class="fx" data-lang="text">hour 23: sin=-0.259 cos= 0.966
hour  1: sin= 0.259 cos= 0.966
hour 12: sin= 0.000 cos=-1.000
distance 23h-1h: raw 22, cyclical 0.518;  1h-12h: raw 11, cyclical 1.983
 hour  dow  weekend  month  holiday  tenure_days
   23    2        0      8        0          591
    9    3        0      8        1           14
   13    5        1      8        0          794</div>
  <p>The 15 August order is flagged as a holiday (Independence Day), the Saturday order as a weekend. <code>tenure_days</code> is "time since signup", usually far more useful than the signup date itself. The same sin/cos trick applies to day of week (period 7), month (12) and day of year (365.25).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Lags and rolling averages ("sales last week", "user's average so far") must use only rows <em>before</em> the prediction time: <code>shift(1)</code> before <code>rolling</code>, never <code>center=True</code>. Time-based data also needs time-based splits. Both are covered in <a class="xref" data-note="ml_ts_ml">ML Forecasting</a> and <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>. A tree needs no cyclical encoding for hour (it can split 0–5 and 22–23 separately), but linear and distance models do.</p>
  </div>

  <h2 id="fe-text"><span class="num">09</span>Text Basics</h2>
  <h3>Bag of words, by hand</h3>
  <p>The simplest way to turn text into columns: build a vocabulary of all words, and represent each document by how often each word appears, ignoring order. Three messages: "free money now", "meeting at noon", "free meeting now now". Vocabulary (sorted): at, free, meeting, money, noon, now. Message 3 → at 0, free 1, meeting 1, money 0, noon 0, now 2.</p>
  <h3>TF-IDF, by hand</h3>
  <p>Common words (like "now" in every spam) carry less information than rare ones. <strong>TF-IDF</strong> multiplies the count (term frequency) by the <strong>inverse document frequency</strong>; sklearn's version is idf = ln((1 + n)/(1 + df)) + 1, where n is the number of documents and df the number containing the word, then scales each row to length 1. Here n = 3. "free" is in 2 documents: idf = ln(4/3) + 1 = 1.288. "at" is in 1: ln(4/2) + 1 = 1.693. Message 3: free 1 × 1.288, meeting 1 × 1.288, now 2 × 1.288 = 2.575. Length √(1.288² + 1.288² + 2.575²) = √9.95 = 3.154. Divide: 0.408, 0.408, 0.816.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

docs = ["free money now", "meeting at noon", "free meeting now now"]
cv = CountVectorizer().fit(docs)
print(cv.get_feature_names_out()); print(cv.transform(docs).toarray())
tf = TfidfVectorizer().fit(docs)
print("idf:", {w: round(float(v), 3) for w, v in zip(tf.get_feature_names_out(), tf.idf_)})
print("doc 3 tf-idf:", tf.transform(docs[2:]).toarray().round(3))</div>
  <div class="fx" data-lang="text">['at' 'free' 'meeting' 'money' 'noon' 'now']
[[0 1 0 1 0 1]
 [1 0 1 0 1 0]
 [0 1 1 0 0 2]]
idf: {'at': 1.693, 'free': 1.288, 'meeting': 1.288, 'money': 1.693, 'noon': 1.693, 'now': 1.288}
doc 3 tf-idf: [[0.    0.408 0.408 0.    0.    0.816]]</div>
  <p>These sparse matrices feed straight into linear models and Naive Bayes (<a class="xref" data-note="ml_naivebayes">Naive Bayes</a>). Options worth knowing: <code>ngram_range=(1, 2)</code> adds word pairs ("not good"), <code>min_df</code>/<code>max_df</code> drop very rare/very common words, <code>stop_words</code>, and <code>HashingVectorizer</code> for unbounded vocabularies. Modern NLP replaces these counts with learnt embeddings; the full story is in <a class="xref" data-note="nlp">NLP</a>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The vocabulary and the idf values are learnt in <code>fit</code>. Fitting the vectorizer on all documents (including test) leaks test words and their frequencies. Fit on training text only; unseen words at prediction time are simply ignored.</p>
  </div>

  <h2 id="fe-poly"><span class="num">10</span>Interaction and Polynomial Features</h2>
  <h3>By hand</h3>
  <p>An <strong>interaction</strong> is a product of two columns: its weight lets the effect of one feature depend on the other. <strong>Polynomial features</strong> of degree 2 add all squares and pairwise products. For a row (a, b) = (2, 3): 1, a, b, a², ab, b² = 1, 2, 3, 4, 6, 9.</p>
  <div class="fx" data-lang="py">import numpy as np
from math import comb
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

pf = PolynomialFeatures(degree=2).fit([[2, 3]])
print(pf.get_feature_names_out(["a", "b"]), pf.transform([[2, 3]]))
for d in [10, 50]:
    print(f"{d} features, degree 2 -&gt; {PolynomialFeatures(2).fit(np.zeros((1, d))).n_output_features_} columns"
          f" (formula C(d+2, 2) = {comb(d + 2, 2)})")
rng = np.random.default_rng(0)
price = rng.uniform(10, 100, 500); qty = rng.integers(1, 20, 500)
revenue = price * qty + rng.normal(0, 20, 500)
X = np.c_[price, qty]
print("linear R2 raw:", cross_val_score(LinearRegression(), X, revenue, cv=5).mean().round(3),
      "  with price*qty:", cross_val_score(LinearRegression(), np.c_[X, price * qty], revenue, cv=5).mean().round(3))</div>
  <div class="fx" data-lang="text">['1' 'a' 'b' 'a^2' 'a b' 'b^2'] [[1. 2. 3. 4. 6. 9.]]
10 features, degree 2 -&gt; 66 columns (formula C(d+2, 2) = 66)
50 features, degree 2 -&gt; 1326 columns (formula C(d+2, 2) = 1326)
linear R2 raw: 0.88   with price*qty: 0.998</div>
  <p>The number of columns explodes: degree 2 on d features gives C(d + 2, 2) columns including the constant: 66 for 10 features, 1,326 for 50. Hence the need for regularization (<a class="xref" data-note="ml_regularization">Regularization</a>) or a hand-picked interaction. The last line shows why a single well-chosen interaction is powerful: revenue = price × quantity. A linear model on price and quantity explains 88% (it can only add them); with the product column it explains 99.8%.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Trees and boosting discover interactions themselves (a split on price followed by a split on quantity), which is one reason they win on raw tabular data. Linear models need them handed over. Domain ratios (debt/income, price per square foot, clicks per impression) are interactions too, and usually beat brute-force polynomial expansion. Degree, scaling of powers and splines are covered in <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Polynomial terms of unscaled data are huge and highly correlated (x and x² for x in the thousands). Scale before expanding, and regularize after.</p>
  </div>

  <h2 id="fe-select"><span class="num">11</span>Feature Selection (Pointer)</h2>
  <p>Engineering creates columns; selection removes the ones that do not help, which cuts noise, training time and the risk of overfitting. The three families, each covered fully with worked examples in <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a>:</p>
  <div class="cards">
    <div><b>Filter</b><p>Score each column alone: variance threshold, correlation, chi², mutual information. <code>SelectKBest</code>, <code>VarianceThreshold</code>.</p><small>Fast; ignores interactions</small></div>
    <div><b>Wrapper</b><p>Try subsets with a model: forward/backward selection, recursive feature elimination. <code>RFECV</code>, <code>SequentialFeatureSelector</code>.</p><small>Accurate; expensive</small></div>
    <div><b>Embedded</b><p>The model selects while training: lasso zeros (<a class="xref" data-note="ml_regularization">Regularization</a>), tree importances. <code>SelectFromModel</code>.</p><small>Good middle ground</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Selecting features using all rows and then cross-validating is one of the most dramatic leaks there is: on pure noise it can report 85% accuracy (demonstrated in <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). Selection must happen inside each training fold.</p>
  </div>

  <h2 id="fe-imb"><span class="num">12</span>Class Imbalance</h2>
  <h3>The need</h3>
  <p>Fraud, churn, disease: the class you care about is often rare. With 5% positives, a model that always says "no" is 95% accurate and useless. Many learners, trained to minimise average loss, lean toward the majority and predict the rare class too seldom. There are three families of fixes, and one honest alternative.</p>
  <h3>Class weights, by hand</h3>
  <p>Make each rare-class mistake cost more in the loss. sklearn's <code>class_weight="balanced"</code> gives class c the weight n/(k·n_c), where k is the number of classes, so that both classes contribute equally in total. For 100 rows with 95 negatives and 5 positives: negatives 100/(2·95) = 0.526, positives 100/(2·5) = 10. Check: 95 × 0.526 = 50 and 5 × 10 = 50.</p>
  <h3>Resampling, and SMOTE by hand</h3>
  <ul>
    <li><strong>Random oversampling</strong>: duplicate minority rows until the classes balance. Simple; the model may memorise the copies.</li>
    <li><strong>Random undersampling</strong>: throw away majority rows. Fast; discards information.</li>
    <li><strong>SMOTE</strong> (Chawla et al., 2002): create <em>new</em> minority points on the line between a minority point and one of its k nearest minority neighbours: x_new = x + u·(neighbour − x), u random in [0, 1]. By hand: x = (1, 2), neighbour (3, 3), u = 0.4 → (1 + 0.4 × 2, 2 + 0.4 × 1) = (1.8, 2.4).</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np

# class weights, sklearn's "balanced" rule: w_c = n / (k * n_c)
n, counts = 100, {0: 95, 1: 5}
for c, n_c in counts.items():
    print(f"class {c}: n_c={n_c:2d}  weight = {n}/(2*{n_c}) = {n / (2 * n_c):.3f}")

# one SMOTE point by hand
x, nb, u = np.array([1.0, 2.0]), np.array([3.0, 3.0]), 0.4
print("SMOTE: x + u*(neighbour - x) =", x + u * (nb - x))</div>
  <div class="fx" data-lang="text">class 0: n_c=95  weight = 100/(2*95) = 0.526
class 1: n_c= 5  weight = 100/(2*5) = 10.000
SMOTE: x + u*(neighbour - x) = [1.8 2.4]</div>
  <h3>Comparing the fixes honestly</h3>
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
  <p>Read the table carefully. Without any fix, recall is 0.46 (half the frauds missed) but precision is high (0.83). Every fix, weights, oversampling, undersampling with only 294 rows, SMOTE, lands in the same place: recall about 0.85, precision about 0.25. ROC-AUC, which measures ranking quality across all thresholds, barely moves (0.944–0.949). The fixes did not make the model better at <em>separating</em> the classes; they mostly <strong>moved the decision threshold</strong>. The last two lines show the same trade-off obtained with no resampling at all, just a lower threshold (0.1 or 0.2 instead of 0.5).</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>For most imbalance problems the honest recipe is: train normally (or with class weights), evaluate with metrics that respect the rare class (precision, recall, F1, PR-AUC; <a class="xref" data-note="ml_evaluation">Classification Metrics</a>), and pick the threshold from the business cost of each error type (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>). Resampling helps most with weak learners or very few positives, and class weights are the cheapest version. Note that resampling and weights distort predicted probabilities (the model now believes positives are common); recalibrate if you need real probabilities.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Oversampling or SMOTE <em>before</em> the train/test split (or before CV) puts copies or interpolations of the same minority row on both sides, and the scores become fantasy. Resample inside the training fold only, and evaluate on data with the natural class balance.</p>
  </div>

  <h2 id="fe-sklearn"><span class="num">13</span>scikit-learn Transformers</h2>
  <h3>One interface for every step</h3>
  <p>Every technique in this note is a sklearn <strong>transformer</strong> with the same two methods. <code>fit(X)</code> <em>learns</em> from data and stores what it learnt in attributes ending in an underscore (<code>mean_</code>, <code>categories_</code>, <code>statistics_</code>, <code>lambdas_</code>, <code>bin_edges_</code>, <code>vocabulary_</code>). <code>transform(X)</code> <em>applies</em> what was learnt to any rows. <code>fit_transform</code> does both on the same rows, for training data only.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, FunctionTransformer, OneHotEncoder
from sklearn.compose import ColumnTransformer

train = pd.DataFrame({"income": [20., 40., 60.], "city": ["Pune", "Delhi", "Pune"]})
test = pd.DataFrame({"income": [80.], "city": ["Goa"]})

sc = StandardScaler().fit(train[["income"]])               # fit: LEARN mean_ and scale_ from train
print("mean_", sc.mean_, "scale_", sc.scale_.round(3))
print("transform(test):", sc.transform(test[["income"]]).ravel().round(3))   # APPLY to new rows

log = FunctionTransformer(np.log1p, feature_names_out="one-to-one")      # stateless: learns nothing
ct = ColumnTransformer([("num", StandardScaler(), ["income"]),
                        ("log", log, ["income"]),
                        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["city"])])
ct.set_output(transform="pandas")                           # DataFrames with names out
print(ct.fit_transform(train).round(3))
print(ct.transform(test).round(3))</div>
  <div class="fx" data-lang="text">mean_ [40.] scale_ [16.33]
transform(test): [2.449]
   num__income  log__income  cat__city_Delhi  cat__city_Pune
0       -1.225        3.045              0.0             1.0
1        0.000        3.714              1.0             0.0
2        1.225        4.111              0.0             1.0
   num__income  log__income  cat__city_Delhi  cat__city_Pune
0        2.449        4.394              0.0             0.0</div>
  <p>By hand: training incomes 20, 40, 60 have mean 40 and std √((400 + 0 + 400)/3) = 16.33; a test income of 80 becomes (80 − 40)/16.33 = 2.449, using the <em>training</em> statistics. <code>FunctionTransformer</code> wraps a stateless function (log1p learns nothing). <code>ColumnTransformer</code> sends different columns to different steps and glues the results; <code>set_output(transform="pandas")</code> returns a DataFrame with readable names like <code>num__income</code>. Goa, unseen, becomes zeros. Wrapping all of this with the model in a <code>Pipeline</code> is the subject of <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</p>
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

  <h2 id="fe-compare"><span class="num">14</span>Which Step for Which Model</h2>
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
    <tr><td>Cyclical time</td><td>sin/cos</td><td>sin/cos</td><td>raw hour works</td><td>sin/cos</td></tr>
  </table>

  <h2 id="fe-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: fitting any learnt step on all rows</span>
    <p>Scalers, imputers, encoders, binners, vectorizers and selectors all learn from data. Fit them on training rows (inside each CV fold), then only transform the rest. Use a pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: naive target encoding</span>
    <p>Category means computed on the same rows they encode leak each row's own label (noise scored AUC 0.777). Use out-of-fold encoding (<code>TargetEncoder</code>) and smoothing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: integer codes as numbers in a linear model</span>
    <p>City codes 0, 1, 2 impose a fake order and spacing. One-hot for nominal categories; ordinal only when the order is real.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: crashing on unseen categories</span>
    <p>Production always brings a new city or product. <code>handle_unknown="ignore"</code> (one-hot), <code>handle_unknown="use_encoded_value"</code> (ordinal), hashing, or target encoding's fallback to the global mean.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: resampling before the split</span>
    <p>SMOTE or duplicated rows on both sides of a split inflate every metric. Resample training folds only.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging imbalance fixes by accuracy</span>
    <p>Always-"no" scores 94.8%. Use recall/precision/F1/PR-AUC and a business-driven threshold.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: features from the future</span>
    <p>Aggregates over all rows of a user, centred rolling windows, "days until churn"… anything not known at prediction time inflates validation and fails in production.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: log of zero or negatives</span>
    <p>np.log(0) = −inf breaks training silently. Use log1p or Yeo-Johnson.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scaling for trees, skipping it for KNN</span>
    <p>The first wastes effort, the second wrecks accuracy (KNN 0.691 vs 0.949). Know which family you are feeding.</p>
  </div>

  <h2 id="fe-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Standardise x = (2, 4, 6, 8, 10) by hand. Which models need it?</summary><div class="qa-body">Mean 6, std √(40/5) = 2.828, so z = −1.414, −0.707, 0, 0.707, 1.414. Needed for distance-based models (KNN, k-means, SVM), penalised models (ridge, lasso, regularized logistic), PCA and anything trained by gradient descent. Not needed for trees and their ensembles, whose splits ignore units.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>StandardScaler vs MinMaxScaler vs RobustScaler: when do you use each?</summary><div class="qa-body">Standard (mean/std): default for roughly symmetric data. MinMax (into [0, 1]): bounded data like pixels or when an algorithm expects [0, 1]. Robust (median/IQR): when outliers exist, because they cannot move the median or IQR: with incomes 20, 25, 30, 35, 500 the normal four keep their spread (−1 … 0.5) instead of being squashed to −0.54 … −0.46.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do Box-Cox and Yeo-Johnson do, and how is λ chosen?</summary><div class="qa-body">Power transforms that reduce skew and make a column closer to normal: Box-Cox (x^λ − 1)/λ, ln x at λ = 0, needs x &gt; 0; Yeo-Johnson extends it to zero and negatives. λ is chosen by maximum likelihood under a normal model. On log-normal money data the fitted λ is ≈ 0, i.e. "use log".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain target encoding, its leakage, and two fixes.</summary><div class="qa-body">Replace a category by the mean target of that category. Computed on the same rows, each row's own label sits inside its feature, so rare categories look predictive (pure noise gave AUC 0.777). Fixes: out-of-fold (cross-fitted) encoding, so each row is encoded from other folds (sklearn TargetEncoder, AUC 0.495), and smoothing toward the global mean, (n·mean + m·global)/(n + m), so tiny categories are not trusted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the smoothed encoding for a category with 2 rows, both positive, global rate 0.625, m = 2.</summary><div class="qa-body">(2 × 1.0 + 2 × 0.625)/(2 + 2) = 3.25/4 = 0.8125, instead of the raw 1.0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the dummy variable trap and when do you need drop="first"?</summary><div class="qa-body">With all k one-hot columns plus an intercept, the columns sum to 1 for every row, an exact copy of the intercept: perfect multicollinearity, so unregularized least squares has no unique solution. Drop one column for unregularized linear/logistic regression and statsmodels. Regularized models and trees do not need it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the hashing trick? Advantages and drawbacks?</summary><div class="qa-body">Map each category (or word) to column |hash| mod m with sign ±1. Fixed width, no stored vocabulary, unseen values handled, works on streams. Drawbacks: collisions merge unrelated categories (Pune and Delhi both landed in column 3 with m = 4), and columns cannot be mapped back to names for interpretation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain MCAR, MAR and MNAR with an example each. How does each affect imputation?</summary><div class="qa-body">MCAR: a dropped lab sample; observed rows are a fair sample, any reasonable imputation is unbiased. MAR: young people skip income, age is known; plain means are biased (53.3 vs 50) but imputation conditioned on age fixes it (50.04). MNAR: high earners hide income; bias remains (48.7) even after using age; add a missing indicator and use domain knowledge.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does KNN imputation work? Compute one fill.</summary><div class="qa-body">For a row with a blank, find the k nearest rows using nan-Euclidean distance on shared columns (√(total/shared × Σ squared differences)) and average their values. Row (2, 2, ?) vs (1, 2, 3), (2, 3, 5), (8, 9, 20): distances 1.225, 1.225, 11.29; k = 2 → (3 + 5)/2 = 4, where the column mean would give 9.33.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can the z-score rule miss an outlier? What is better?</summary><div class="qa-body">The outlier inflates the mean and std it is measured against (masking): in 12, 14, 15, 15, 16, 18, 19, 95 the 95 has z = 2.64 &lt; 3. Robust alternatives: IQR fences (9.5, 23.5) flag it, and robust z with median and MAD gives 26.8.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why encode hour of day with sin and cos?</summary><div class="qa-body">Hours wrap around: 23:00 and 01:00 are 2 hours apart but 22 apart as numbers. sin/cos(2π·h/24) place hours on a circle, so 23 and 1 are 0.518 apart while 1 and 12 are 1.983 apart. Needed for linear and distance-based models; trees can cope with the raw hour.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the TF-IDF weight idea for a word in 2 of 3 documents (sklearn formula).</summary><div class="qa-body">idf = ln((1 + n)/(1 + df)) + 1 = ln(4/3) + 1 = 1.288; a word in 1 document gets ln(2) + 1 = 1.693. Multiply by the count in the document, then L2-normalise the row. "free meeting now now" → 0.408, 0.408, 0.816.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do interaction features help, and which models need them?</summary><div class="qa-body">When the effect of one feature depends on another (revenue = price × quantity: linear R² 0.88 → 0.998 with the product). Linear and logistic models need them added explicitly; trees and boosting find them through successive splits; neural networks learn them. Degree-2 expansion of d features creates C(d + 2, 2) columns, so regularize.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Class weights, oversampling, SMOTE: what do they actually change?</summary><div class="qa-body">They make the rare class count more in training (weight n/(k·n_c), or more copies / synthetic points x + u·(neighbour − x)). In practice they mostly shift the decision threshold: recall rose 0.46 → 0.86 and precision fell 0.83 → 0.25 while ROC-AUC stayed ≈ 0.946; a lower threshold on the plain model gave the same trade-off. Choose the threshold by business cost and evaluate with PR-based metrics; resample only training folds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between fit, transform and fit_transform? Why does it matter for leakage?</summary><div class="qa-body">fit learns parameters from data (mean_, categories_, idf_), transform applies them, fit_transform does both on the same rows. Call fit/fit_transform on training rows only and transform on validation/test/production; refitting on test rows or fitting before the split leaks information. Pipelines enforce this automatically, which is the next note.</div></details>
</main>
`
});
