// notes/ml/ml_features.js — Feature Engineering
Object.assign(TOPIC_CONTENT, {
  "ml_features": `<main>
  <h1>Feature Engineering</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Feature Engineering</span></div>
  <p class="lead">A model only sees the columns you give it. <strong>Feature engineering</strong> is the work of turning raw data (numbers in awkward units, text categories, blank cells, timestamps, free text) into columns from which the pattern is easy to learn. In real projects it often matters more than the choice of algorithm: one well-built column can do more than switching to a fancier model, and one badly built column can quietly leak the answer and make a useless model look brilliant. Interviewers therefore ask about it constantly, especially scaling, categorical encoding, missing values and class imbalance. Our running example is the same ten flats in Pune from the earlier Foundations notes, but now as the property portal really stores them: area in square feet, locality as text (Baner, Kothrud, Hadapsar), one flat with its age left blank, listing dates, free-text descriptions, and one 5,000 sq ft bungalow that does not fit in with the rest.</p>

  <h2 id="fe-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Feature Engineering</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Numbers</div>
        <ul>
          <li><b>Scaling</b>: standard, min-max, robust</li>
          <li><b>Transforms</b>: log, Box-Cox, Yeo-Johnson for skew</li>
          <li><b>Binning</b>: lets a linear model bend</li>
          <li><b>Outliers</b>: IQR, robust z; clip, transform, robust loss</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Categories, dates, text</div>
        <ul>
          <li><b>One-hot</b> (no order), <b>ordinal</b> (real order)</li>
          <li><b>Target encoding</b>: smoothed, out-of-fold only</li>
          <li><b>Count</b>, <b>hashing</b> for huge vocabularies</li>
          <li>Date parts, sin/cos cycles; bag of words, TF-IDF</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Missing and rare</div>
        <ul>
          <li>MCAR, MAR, MNAR: ask why it is blank</li>
          <li>Mean/median, KNN, iterative + missing indicator</li>
          <li>Imbalance: class weights, resampling, SMOTE, threshold</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The rule</div>
        <ul>
          <li>fit learns, transform applies</li>
          <li>Learn every step from training rows only</li>
          <li>Interactions for linear models; trees find them</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="fe-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Feature Is</span><span class="rm-sub">one good column beats a better model</span></div></div>
      <div class="rm-item rm-done" data-target="fe-scale"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Scaling Numeric Features</span><span class="rm-sub">standard, min-max, robust</span></div></div>
      <div class="rm-item rm-done" data-target="fe-transform"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Log and Power Transforms</span><span class="rm-sub">fixing long tails</span></div></div>
      <div class="rm-item rm-done" data-target="fe-bin"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Binning</span><span class="rm-sub">turning numbers into ranges</span></div></div>
      <div class="rm-item rm-done" data-target="fe-cat"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Encoding Categories</span><span class="rm-sub">one-hot, ordinal, count, hashing</span></div></div>
      <div class="rm-item rm-done" data-target="fe-target"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Target Encoding</span><span class="rm-sub">powerful, and a classic leak</span></div></div>
      <div class="rm-item rm-done" data-target="fe-missing"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Missing Values</span><span class="rm-sub">why it is blank, and how to fill it</span></div></div>
      <div class="rm-item rm-done" data-target="fe-outliers"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Outliers</span><span class="rm-sub">detecting and treating extreme values</span></div></div>
      <div class="rm-item rm-done" data-target="fe-time"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Dates and Free Text</span><span class="rm-sub">cycles, holidays, TF-IDF</span></div></div>
      <div class="rm-item rm-done" data-target="fe-poly"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interactions, Polynomials and Selection</span><span class="rm-sub">combining columns, and pruning them</span></div></div>
      <div class="rm-item rm-done" data-target="fe-imb"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Class Imbalance</span><span class="rm-sub">weights, resampling, SMOTE, thresholds</span></div></div>
      <div class="rm-item rm-done" data-target="fe-sklearn"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">The scikit-learn Transformer API</span><span class="rm-sub">fit, transform, ColumnTransformer</span></div></div>
      <div class="rm-item rm-done" data-target="fe-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">leaks and silent bugs</span></div></div>
      <div class="rm-item rm-done" data-target="fe-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, which step for which model</span></div></div>
      <div class="rm-item rm-done" data-target="fe-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on features</span></div></div>
    </div>
  </div>

  <h2 id="fe-why"><span class="num">01</span>What a Feature Is</h2>
  <p>A <strong>feature</strong> is one input column that the model reads, such as a flat's area or its locality. Every model learns some kind of rule that combines its features: a linear model multiplies each column by a weight and adds them up, a tree asks a series of yes/no questions about the columns, a nearest-neighbour model measures distances between rows. None of them can use information that is not in the columns, and none of them can easily use information that is hidden in an awkward form. Raw data are rarely in a convenient form, which is why feature engineering exists.</p>
  <p>The ten flats show the problem in miniature. The portal stores locality as words. A linear model cannot multiply "Baner" by a weight, so the obvious move is to leave the column out and fit price on area alone. But locality obviously matters. If we write it instead as three 0/1 columns (is it Baner? is it Hadapsar? is it Kothrud?), the model can give each locality its own price level. We score both versions with leave-one-out cross-validation (each flat predicted by a model trained on the other nine):</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneOut, cross_val_score

flats = pd.DataFrame({                                 # the portal's raw table for flats A..J
    "area_sqft": [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400],
    "locality":  ["Hadapsar", "Baner", "Kothrud", "Hadapsar", "Baner",
                  "Kothrud", "Hadapsar", "Baner", "Kothrud", "Baner"],
    "price":     [38, 49, 53, 56, 67, 68, 73, 83, 87, 96]})
raw = flats[["area_sqft"]]
eng = pd.concat([raw, pd.get_dummies(flats.locality, dtype=float)], axis=1)   # + locality as 0/1 columns
for name, X in [("area only", raw), ("area + locality 0/1", eng)]:
    mse = -cross_val_score(LinearRegression(), X, flats.price, cv=LeaveOneOut(),
                           scoring="neg_mean_squared_error").mean()
    print(f"{name:20s} columns {list(X.columns)}  LOOCV MSE {mse:.2f}")</div>
  <div class="fx" data-lang="text">area only            columns ['area_sqft']  LOOCV MSE 7.25
area + locality 0/1  columns ['area_sqft', 'Baner', 'Hadapsar', 'Kothrud']  LOOCV MSE 1.16</div>
  <p>Same ten flats, same linear model, same honest scoring: one engineered input cuts the error from 7.25 to 1.16. The bias–variance note treated the 7.25 as the error left over for "this feature set"; it turned out to be reducible by building a better feature. Engineering can also <em>create</em> information that no single raw column holds. A food-delivery company records pickup and drop-off coordinates, but delivery time depends on the distance between them:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(0)
pick, drop = rng.uniform(0, 10, (1000, 2)), rng.uniform(0, 10, (1000, 2))   # (x, y) in km
dist = np.sqrt(((pick - drop) ** 2).sum(axis=1))       # the engineered feature
minutes = 5 + 3 * dist + rng.normal(0, 2, 1000)
for name, X in [("raw coordinates", np.c_[pick, drop]), ("+ distance", np.c_[pick, drop, dist])]:
    lin = cross_val_score(LinearRegression(), X, minutes, cv=5).mean()
    rf = cross_val_score(RandomForestRegressor(n_estimators=100, random_state=0), X, minutes, cv=5).mean()
    print(f"{name:16s} linear R2 {lin:.3f}   random forest R2 {rf:.3f}")</div>
  <div class="fx" data-lang="text">raw coordinates  linear R2 -0.013   random forest R2 0.807
+ distance       linear R2 0.937   random forest R2 0.925</div>
  <p>With four raw coordinate columns the linear model explains nothing (R² −0.013), and a random forest manages 0.807 by carving the city into boxes. Add one engineered column, the straight-line distance, and the plain linear model jumps to 0.937, beating the forest on raw columns. One good feature did more than a stronger algorithm.</p>
  <p>An experienced property broker works the same way. She does not judge a flat from its raw listing fields; she thinks "Baner, so add a premium", "cheap per square foot for its age", "listed just before Diwali". Those summaries are not in any single field; she builds them in her head. Features are those summaries written down as columns. Feature engineering therefore has two halves: <strong>representation</strong>, putting existing information into a usable form (scaling, encoding, filling blanks), and <strong>creation</strong>, adding information through domain knowledge (ratios, distances, counts, time since an event). One rule applies to every feature you create: it must be computable at prediction time from data available then. "Days on market" or "final negotiated price" exist only after a flat sells, so they cannot be used to predict how it will sell (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>

  <h2 id="fe-scale"><span class="num">02</span>Scaling Numeric Features</h2>
  <p>Even numeric columns are often not ready. Take flats B (600 sq ft, 3 years old) and C (700 sq ft, 8 years old). A nearest-neighbour model measures how similar two flats are by the distance between their rows: √(100² + 5²) = 100.12. The age difference is invisible, simply because square feet happen to be big numbers. The same imbalance makes gradient descent crawl (8,549 steps instead of 1 on the flats, <a class="xref" data-note="ml_loss_gd">Loss &amp; Gradient Descent</a>) and makes penalties unfair (<a class="xref" data-note="ml_regularization">Regularization</a>). <strong>Feature scaling</strong> fixes this with a simple per-column linear change, x → (x − c)/s, that puts every column on a comparable range. It is like converting prices quoted in rupees, dollars and yen into one currency before comparing them: nothing about the prices changes except the unit.</p>
  <p>Three scalers cover almost every case. <strong>Standardization</strong> subtracts the mean and divides by the standard deviation, z = (x − mean)/std, giving a column with mean 0 and standard deviation 1. On the flats' areas 5 to 14 (in hundreds of sq ft): the mean is 9.5, the squared deviations add to 82.5, so the standard deviation is √(82.5/10) = 2.872, and flat A becomes (5 − 9.5)/2.872 = −1.567. <strong>Min-max scaling</strong> maps the smallest value to 0 and the largest to 1: (x − min)/(max − min) = (x − 5)/9. <strong>Robust scaling</strong> uses the median and the interquartile range (IQR, the spread of the middle half of the data) instead: (x − median)/IQR, here (x − 9.5)/4.5.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

area = np.arange(5, 15, dtype=float).reshape(-1, 1)    # flats A..J, 100 sq ft
for s in [StandardScaler(), MinMaxScaler(), RobustScaler()]:
    print(f"{type(s).__name__:15s}", s.fit_transform(area).ravel().round(3))
print("learnt by StandardScaler: mean_ =", StandardScaler().fit(area).mean_, " scale_ =", StandardScaler().fit(area).scale_.round(3))</div>
  <div class="fx" data-lang="text">StandardScaler  [-1.567 -1.219 -0.87  -0.522 -0.174  0.174  0.522  0.87   1.219  1.567]
MinMaxScaler    [0.    0.111 0.222 0.333 0.444 0.556 0.667 0.778 0.889 1.   ]
RobustScaler    [-1.    -0.778 -0.556 -0.333 -0.111  0.111  0.333  0.556  0.778  1.   ]
learnt by StandardScaler: mean_ = [9.5]  scale_ = [2.872]</div>
  <p>Notice the last line. The scaler <em>learns</em> two numbers in <code>fit</code>, <code>mean_</code> = 9.5 and <code>scale_</code> = 2.872, and reuses them for every later row, including new flats at prediction time. That is why it must be fitted on training rows only: fitting it on all the data lets the test rows' mean and spread leak into training.</p>
  <p>The scalers differ when the data contain an extreme value. Suppose a 5,000 sq ft bungalow (x = 50) is listed alongside the ten flats:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

area = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 50.]).reshape(-1, 1)   # + a 5,000 sq ft bungalow
for s in [StandardScaler(), MinMaxScaler(), RobustScaler()]:
    print(f"{type(s).__name__:15s}", s.fit_transform(area).ravel().round(2))</div>
  <div class="fx" data-lang="text">StandardScaler  [-0.68 -0.6  -0.52 -0.43 -0.35 -0.27 -0.18 -0.1  -0.02  0.07  3.08]
MinMaxScaler    [0.   0.02 0.04 0.07 0.09 0.11 0.13 0.16 0.18 0.2  1.  ]
RobustScaler    [-1.  -0.8 -0.6 -0.4 -0.2  0.   0.2  0.4  0.6  0.8  8. ]</div>
  <p>Standard and min-max scaling are both dragged by the bungalow: the mean jumps to 13.2 and the standard deviation to about 11.9, so the ten ordinary flats are squashed into a narrow band (−0.68 to 0.07, or 0 to 0.20), and the difference between a 500 and a 1,400 sq ft flat now looks smaller than the gap to the bungalow. Robust scaling uses the median and IQR, which one bungalow cannot move, so the ten flats keep their spread (−1 to 0.8) and only the bungalow flies off to 8. Use standardization as the default, robust scaling when outliers are present, and min-max for naturally bounded data such as pixel values 0–255. (Two less common ones: <code>MaxAbsScaler</code> divides by the largest absolute value and keeps zeros as zeros, which suits sparse data; <code>Normalizer</code> scales each <em>row</em> to length 1, which suits text vectors compared by cosine similarity.)</p>
  <p>Which models need scaling? Any model that compares sizes across columns: distance-based models (KNN, k-means, SVM with an RBF kernel), models with a penalty on weight size (ridge, lasso, regularized logistic regression), anything trained by gradient descent (including neural networks), and PCA, which chases variance. Tree-based models do not care: a split asks "is x &gt; t?", and stretching x just moves t. On the wine data, whose 13 columns range from proline in the hundreds to hue near 1:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True)                      # 13 columns: proline ~300-1700, hue ~0.5-1.7
for name, m in [("KNN", KNeighborsClassifier()), ("SVM (RBF)", SVC()), ("Tree", DecisionTreeClassifier(random_state=0))]:
    raw = cross_val_score(m, X, y, cv=5).mean()
    scaled = cross_val_score(make_pipeline(StandardScaler(), m), X, y, cv=5).mean()
    print(f"{name:10s} raw {raw:.3f}   scaled {scaled:.3f}")</div>
  <div class="fx" data-lang="text">KNN        raw 0.691   scaled 0.949
SVM (RBF)  raw 0.663   scaled 0.983
Tree       raw 0.888   scaled 0.888</div>
  <p>KNN jumps from 69% to 95% accuracy and the RBF SVM from 66% to 98%, while the decision tree does not move at all (0.888 both times). Scaling changes no information (it can be undone) and does not change the <em>shape</em> of a column's distribution; for shape you need a transform, the subject of the next section.</p>

  <h2 id="fe-transform"><span class="num">03</span>Log and Power Transforms</h2>
  <p>After standardizing, the bungalow is still more than 3 standard deviations from everything else. The column is lopsided, not just badly scaled. Money, counts, sizes and durations are usually like this: <strong>right-skewed</strong>, meaning most values are small with a long tail of huge ones. On such a column a linear model lets the few huge values dominate, and the relationship with the target is often multiplicative ("10% more area adds a fixed amount") rather than additive. A <strong>transform</strong> changes the shape of a distribution, not just its range, while keeping the order of the values.</p>
  <p>The workhorse is the logarithm, which turns ratios into differences. Five Pune listings at ₹38, 67, 96, 180 and 400 lakh become 1.58, 1.83, 1.98, 2.26 and 2.60 in log₁₀: each doubling becomes roughly the same step of 0.30, and the bungalow is now 0.34 above the large flat instead of 220 above it. Because log(0) is minus infinity, counts that can be zero (days on market, number of complaints) use log1p(x) = log(1 + x) instead. <strong>Skewness</strong> measures lopsidedness: 0 means symmetric, and values above 1 mean strongly right-skewed.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.stats import skew

price = np.array([38, 67, 96, 180, 400.])              # three flats, a large flat, the bungalow
print("log10 of prices:", np.log10(price).round(2))
print("log1p of counts [0, 1, 9, 99]:", np.log1p([0, 1, 9, 99]).round(2))
money = np.random.default_rng(0).lognormal(10, 1, 5000)   # a typical right-skewed money column
print(f"skewness: raw {skew(money):.2f}   after log {skew(np.log(money)):.2f}")</div>
  <div class="fx" data-lang="text">log10 of prices: [1.58 1.83 1.98 2.26 2.6 ]
log1p of counts [0, 1, 9, 99]: [0.   0.69 2.3  4.61]
skewness: raw 3.62   after log 0.02</div>
  <p>A typical money column has skewness 3.62; after the log it is 0.02, almost perfectly symmetric.</p>
  <p>The log is one member of a family. The <strong>Box-Cox transform</strong> (1964), for positive x, is (x^λ − 1)/λ, with ln x used when λ = 0. λ = 1 just shifts the data, λ = 0.5 is a square-root-like squash, λ = 0 is the log, and negative λ squashes even harder; the odd-looking (x^λ − 1)/λ form is chosen so that the curve slides smoothly into ln x as λ approaches 0. By hand on x = (1, 4, 9): λ = 1 gives (0, 3, 8); λ = 0.5 gives (√x − 1)/0.5 = (0, 2, 4); λ = 0 gives (0, 1.386, 2.197). Box-Cox needs positive values, so the <strong>Yeo-Johnson transform</strong> (2000) extends it to zero and negative values, which suits signed columns such as "price minus the area line". In both, the best λ is chosen by maximum likelihood: the λ under which the transformed data look most like a normal distribution.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
from sklearn.preprocessing import PowerTransformer

x = np.array([1., 4., 9.])
for lam in [1, 0.5, 0]:
    bc = np.log(x) if lam == 0 else (x ** lam - 1) / lam       # Box-Cox by the formula
    print(f"Box-Cox λ={lam:&lt;3}: {bc.round(3)}   scipy: {stats.boxcox(x, lmbda=lam).round(3)}")
print("Yeo-Johnson λ=0.5 on [-1, 0, 3]:", stats.yeojohnson(np.array([-1., 0., 3.]), lmbda=0.5).round(3))
money = np.random.default_rng(0).lognormal(10, 1, (5000, 1))
pt = PowerTransformer(method="yeo-johnson").fit(money)        # finds λ, then standardizes
print(f"fitted λ = {pt.lambdas_[0]:.3f}   skew after = {stats.skew(pt.transform(money).ravel()):.3f}")</div>
  <div class="fx" data-lang="text">Box-Cox λ=1  : [0. 3. 8.]   scipy: [0. 3. 8.]
Box-Cox λ=0.5: [0. 2. 4.]   scipy: [0. 2. 4.]
Box-Cox λ=0  : [0.    1.386 2.197]   scipy: [0.    1.386 2.197]
Yeo-Johnson λ=0.5 on [-1, 0, 3]: [-1.219  0.     2.   ]
fitted λ = -0.007   skew after = 0.000</div>
  <p>The hand values match scipy's. <code>PowerTransformer</code> fitted λ = −0.007 on the money column, essentially 0, which is its way of saying "the log is the right transform here", and the skewness drops to 0. Does it help a model? Across a city of 800 flats whose sizes are very skewed and whose price truly grows with log(area):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(1)
area = rng.lognormal(7, 0.8, 800)                      # flat sizes across a city: very skewed
price = 40 * np.log(area) + rng.normal(0, 8, 800)      # price grows with log(area)
for name, X in [("raw area", area.reshape(-1, 1)), ("log(area)", np.log(area).reshape(-1, 1))]:
    print(f"{name:10s} linear CV R2 = {cross_val_score(LinearRegression(), X, price, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">raw area   linear CV R2 = 0.644
log(area)  linear CV R2 = 0.932</div>
  <p>Fed raw area, the straight line fits badly (R² 0.644); fed log(area), it fits well (0.932). Our ten flats span only 500 to 1,400 sq ft, where a straight line in area is fine; transforms matter when the range is wide. Transforms are monotone, so tree models are unaffected by them. Two related tools are worth knowing: <code>QuantileTransformer</code>, which maps each value to its rank and then to a uniform or normal shape (very robust, but it forgets how far apart the values were), and transforming the <em>target</em> (<code>TransformedTargetRegressor</code>, for example predicting log price) when errors grow with the size of y. If you do that, remember to transform predictions back before reporting errors in rupees.</p>

  <h2 id="fe-bin"><span class="num">04</span>Binning</h2>
  <p>A linear model gives age a single weight, so every extra year changes the price by the same amount. Buyers do not think like that; they think in bands: new, a few years old, old. <strong>Binning</strong> (also called discretization) cuts a numeric column into ranges and replaces each value by the range it falls in. It throws away detail inside each bin, but it lets a linear model give every range its own weight, so the model's response to age can rise, fall or jump. It is like an income-tax slab system: instead of one rate for all income, each slab gets its own rate.</p>
  <p>There are three common ways to choose the edges. <strong>Equal width</strong> divides the range into equal-sized pieces; for the flats' ages 2 to 20 in three bins that is width 6, edges 2, 8, 14, 20. <strong>Equal frequency</strong> (quantile) bins put roughly the same number of rows in each bin. <strong>Domain</strong> bins use cut-offs that mean something to people, here new (5 years or less), mid (up to 12) and old (above 12).</p>
  <div class="fx" data-lang="py">import pandas as pd

ages = pd.Series([12, 3, 8, 15, 5, 10, 20, 2, 7, 4], index=list("ABCDEFGHIJ"))
table = pd.DataFrame({"age": ages,
                      "equal-width": pd.cut(ages, bins=3),
                      "equal-freq": pd.qcut(ages, q=3),
                      "domain": pd.cut(ages, bins=[-1, 5, 12, 100], labels=["new", "mid", "old"])})
print(table.sort_values("age").to_string())</div>
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
G   20  (14.0, 20.0]  (10.0, 20.0]    old</div>
  <p>Equal width gives lopsided bins (6, 2 and 2 flats) because the ages bunch at the young end, and one 60-year-old building would stretch every bin. Equal frequency adapts to the data (4, 3, 3). Domain bins (4, 4, 2) are the most interpretable and are often what the business already uses ("new construction", "resale"). The real benefit shows on a relationship a straight line cannot follow. Below, spending peaks in middle age and falls on both sides; eight quantile bins, each turned into its own 0/1 column, let a linear model draw a step-shaped curve:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(0)
age = rng.uniform(18, 80, (1000, 1))
spend = 50 - 0.06 * (age[:, 0] - 48) ** 2 + rng.normal(0, 5, 1000)   # peaks in middle age
binned = make_pipeline(KBinsDiscretizer(n_bins=8, encode="onehot", strategy="quantile",
                                        quantile_method="averaged_inverted_cdf"), LinearRegression())
for name, m in [("raw age", LinearRegression()), ("8 quantile bins", binned)]:
    print(f"{name:16s} linear CV R2 = {cross_val_score(m, age, spend, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">raw age          linear CV R2 = 0.001
8 quantile bins  linear CV R2 = 0.837</div>
  <p>R² goes from 0.001 to 0.837. The bin edges are learnt from training data, which makes <code>KBinsDiscretizer</code> a fitted transformer, like a scaler. Binning has costs: it creates artificial jumps at the edges (age 5.0 and 5.1 land in different bins), and it usually hurts tree models, which already find the best cut-offs themselves. When you want a smooth curve rather than steps, splines or polynomial terms are better (<a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>).</p>

  <h2 id="fe-cat"><span class="num">05</span>Encoding Categories</h2>
  <p>Locality was the most valuable column for the flats, but it holds words, and models need numbers. The danger in converting is inventing meaning that is not there. The tempting shortcut is to number the categories, Baner = 0, Hadapsar = 1, Kothrud = 2, but a linear model then reads "Kothrud is twice Hadapsar" and "Hadapsar lies halfway between Baner and Kothrud", neither of which means anything. Here is what it costs on the flats (in this and the following code blocks, <code>area</code>, <code>price</code> and <code>locality</code> are arrays holding the ten flats' columns from the first table):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import LeaveOneOut, cross_val_score

codes = np.unique(locality, return_inverse=True)[1]    # Baner=0, Hadapsar=1, Kothrud=2
onehot = (locality[:, None] == np.array(["Baner", "Hadapsar", "Kothrud"])).astype(float)
for name, X in [("area + integer code", np.c_[area, codes]), ("area + one-hot", np.c_[area, onehot])]:
    mse = -cross_val_score(LinearRegression(), X, price, cv=LeaveOneOut(), scoring="neg_mean_squared_error").mean()
    print(f"{name:20s} LOOCV MSE {mse:.2f}")</div>
  <div class="fx" data-lang="text">area + integer code  LOOCV MSE 5.44
area + one-hot       LOOCV MSE 1.16</div>
  <p>With integer codes the leave-one-out error is 5.44; with proper 0/1 columns it is 1.16. The integer version forces the three localities onto a straight line in an arbitrary order, so the model cannot give each its own level.</p>
  <p><strong>One-hot encoding</strong> is the standard fix: one 0/1 column per category, with a 1 in the column of the row's category. For flats A, B, C and D (Hadapsar, Baner, Kothrud, Hadapsar), with columns in the order Baner, Hadapsar, Kothrud, that gives (0, 1, 0), (1, 0, 0), (0, 0, 1) and (0, 1, 0). No order is implied; every locality is equally far from every other. <strong>Ordinal encoding</strong> gives each category one integer in a meaningful order, and is right only when the order is real, for example flat type 1BHK &lt; 2BHK &lt; 3BHK &lt; 4BHK → 0, 1, 2, 3, or for tree models, which can split integer codes anywhere.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

df = pd.DataFrame({"locality": ["Hadapsar", "Baner", "Kothrud", "Hadapsar"],   # flats A, B, C, D
                   "bhk": ["1BHK", "1BHK", "2BHK", "2BHK"]})
oh = OneHotEncoder(sparse_output=False, handle_unknown="ignore").fit(df[["locality"]])
print(oh.get_feature_names_out())
print(oh.transform(df[["locality"]]))
print("unseen 'Wakad' -&gt;", oh.transform(pd.DataFrame({"locality": ["Wakad"]})))
od = OrdinalEncoder(categories=[["1BHK", "2BHK", "3BHK", "4BHK"]]).fit(df[["bhk"]])
print("ordinal bhk:", od.transform(df[["bhk"]]).ravel())</div>
  <div class="fx" data-lang="text">['locality_Baner' 'locality_Hadapsar' 'locality_Kothrud']
[[0. 1. 0.]
 [1. 0. 0.]
 [0. 0. 1.]
 [0. 1. 0.]]
unseen 'Wakad' -&gt; [[0. 0. 0.]]
ordinal bhk: [0. 0. 1. 1.]</div>
  <p>A listing in a locality the model never saw in training (Wakad) becomes all zeros with <code>handle_unknown="ignore"</code> instead of crashing the production system. One more detail comes up in interviews. With all three locality columns plus an intercept, the three columns always add up to 1, an exact copy of the intercept column. This <strong>dummy variable trap</strong> (perfect multicollinearity) means unregularized linear regression has no unique solution, so for it, and for statsmodels, drop one column with <code>drop="first"</code>; the dropped category becomes the baseline. Regularized models and trees do not need the drop.</p>
  <p>One-hot encoding a column with 1,000 PIN codes creates 1,000 mostly-zero columns. The number of distinct values in a categorical column is called its <strong>cardinality</strong>, and high-cardinality columns need other encodings. <strong>Count (frequency) encoding</strong> replaces each category by how many rows have it: Baner 4, Hadapsar 3, Kothrud 3. It uses no target information, so it cannot leak the label, and it is useful when popularity itself matters (a rarely seen merchant may be suspicious); its weakness is that categories with equal counts become identical, as Hadapsar and Kothrud do here. The <strong>hashing trick</strong> passes each category string through a hash function and uses the result, modulo a chosen width m, as a column index (with the hash's sign as ±1). There is no vocabulary to store, the width is fixed, and brand-new categories work automatically, which suits huge or open-ended vocabularies such as URLs or words. The price is <strong>collisions</strong>: different categories can land in the same column.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.feature_extraction import FeatureHasher

s = pd.Series(locality)
print("count encoding:", s.map(s.value_counts()).tolist())
fh = FeatureHasher(n_features=4, input_type="string")
for c, row in zip(["Baner", "Kothrud", "Hadapsar", "Wakad"], fh.transform([[c] for c in ["Baner", "Kothrud", "Hadapsar", "Wakad"]]).toarray()):
    print(f"{c:8s} -&gt; {row}")</div>
  <div class="fx" data-lang="text">count encoding: [3, 4, 3, 3, 4, 3, 3, 4, 3, 4]
Baner    -&gt; [0. 0. 0. 1.]
Kothrud  -&gt; [0. 0. 0. 1.]
Hadapsar -&gt; [ 0.  0. -1.  0.]
Wakad    -&gt; [-1.  0.  0.  0.]</div>
  <p>With only m = 4 columns, Baner and Kothrud both land in the last column, so a model can no longer tell them apart; the new locality Wakad gets a column without any special handling. sklearn's default width of 2²⁰ makes collisions rare. The other high-cardinality options are target encoding (next section), grouping rare categories together (<code>OneHotEncoder(min_frequency=…)</code>), and models with built-in categorical handling such as <a class="xref" data-note="ml_catboost">CatBoost</a> and LightGBM. One trap: <code>LabelEncoder</code> is meant for the target y, not for features; it sorts categories alphabetically and cannot handle unseen values in a pipeline. Use <code>OrdinalEncoder</code> or <code>OneHotEncoder</code> for features.</p>

  <h2 id="fe-target"><span class="num">06</span>Target Encoding</h2>
  <p><strong>Target encoding</strong> (also called mean encoding) replaces each category by the average target value for that category. For the flats' locality and price: Baner's prices are 49, 67, 83, 96, average 73.75; Hadapsar's are 38, 56, 73, average 55.67; Kothrud's are 53, 68, 87, average 69.33. One numeric column, however many categories there are, and that column directly measures "how expensive is this locality". That makes it very powerful for high-cardinality columns like PIN codes.</p>
  <p>A locality with only three flats gives a shaky average, though, and a category seen once would be encoded with that single row's price. <strong>Smoothing</strong> fixes this by blending each category's mean with the overall mean, trusting the category more when it has more rows:</p>
  <p style="text-align:center"><strong>encoding = (n·category mean + m·global mean) / (n + m)</strong></p>
  <p>You can read m as "m imaginary flats at the global average price" added to each category. With global mean 67 and m = 2: Baner becomes (4 × 73.75 + 2 × 67)/6 = 71.5, Hadapsar (167 + 134)/5 = 60.2, and Kothrud (208 + 134)/5 = 68.4. Hadapsar, with fewer flats and an extreme mean, moves the most. sklearn's <code>TargetEncoder(smooth=m)</code> uses exactly this formula (its default, <code>smooth="auto"</code>, picks m per category from the data):</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.preprocessing import TargetEncoder

df = pd.DataFrame({"locality": locality, "price": price})
stats = df.groupby("locality").price.agg(["count", "mean"])
m = 2                                                  # smoothing: m imaginary flats at the global mean
stats["smoothed"] = (stats["count"] * stats["mean"] + m * price.mean()) / (stats["count"] + m)
print(stats.round(2))
te = TargetEncoder(smooth=m, target_type="continuous").fit(df[["locality"]], df.price)
print("sklearn TargetEncoder:", {c: round(float(v), 2) for c, v in zip(te.categories_[0], te.encodings_[0])})</div>
  <div class="fx" data-lang="text">          count   mean  smoothed
locality                        
Baner         4  73.75      71.5
Hadapsar      3  55.67      60.2
Kothrud       3  69.33      68.4
sklearn TargetEncoder: {'Baner': 71.5, 'Hadapsar': 60.2, 'Kothrud': 68.4}</div>
  <p>The danger is leakage. Look at flat J: its encoding 73.75 is the average of B, E, H <em>and J itself</em>; without J, Baner's average is 66.33. The feature contains part of the answer it is supposed to help predict. With few rows per category the model learns to lean on that self-reference, which will not exist for new flats. The fix is <strong>out-of-fold encoding</strong> (cross-fitting): each row's encoding is computed from other rows only. sklearn's <code>TargetEncoder</code> does this automatically inside <code>fit_transform</code>, and placed inside a pipeline, the encoder is also refitted within every cross-validation fold so the held-out flat's price never enters any encoding. Compare the two on the flats:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, LeaveOneOut, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import TargetEncoder

df = pd.DataFrame({"area": area, "locality": locality})
# naive: each locality's mean price computed on ALL ten flats, each flat's own price included
df["loc_mean"] = df.locality.map(pd.Series(price).groupby(locality).mean())
naive = -cross_val_score(LinearRegression(), df[["area", "loc_mean"]], price, cv=LeaveOneOut(),
                         scoring="neg_mean_squared_error").mean()
def honest(seed):                                      # encoder fitted inside each training fold
    te = TargetEncoder(smooth=2, cv=KFold(3, shuffle=True, random_state=seed), target_type="continuous")
    return make_pipeline(ColumnTransformer([("te", te, ["locality"])], remainder="passthrough"), LinearRegression())
fair = [-cross_val_score(honest(s), df[["area", "locality"]], price, cv=LeaveOneOut(),
                         scoring="neg_mean_squared_error").mean() for s in range(20)]
print(f"naive target encoding (fit on all rows): LOOCV MSE {naive:.2f}")
print(f"encoder inside each fold, 20 shuffles  : median {np.median(fair):.2f}  (range {min(fair):.2f} to {max(fair):.2f})")</div>
  <div class="fx" data-lang="text">naive target encoding (fit on all rows): LOOCV MSE 1.68
encoder inside each fold, 20 shuffles  : median 3.69  (range 1.94 to 8.08)</div>
  <p>The naive version reports a leave-one-out error of 1.68; the honest version, with the encoder fitted inside each fold, reports a median of 3.69. The honest figure wobbles (1.94 to 8.08) because the encoder's own internal split of only nine flats is random, but the leaky 1.68 is better than even the luckiest honest run. The naive number is not a better model; it is a leaky measurement, about twice as optimistic. (With three or four flats per locality, plain one-hot columns at 1.16 are the better choice anyway; target encoding earns its keep with hundreds of categories.) The leak is starkest when the target is pure noise and a category has very few rows:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.preprocessing import TargetEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = pd.DataFrame({"zip": rng.choice([f"z{i}" for i in range(1000)], 5000)})   # 1,000 PIN codes
y = (rng.random(5000) &lt; 0.3).astype(int)               # the target is pure noise
naive = X.zip.map(pd.Series(y).groupby(X.zip).mean()).to_frame()   # mean target per zip, ALL rows
print("naive target-mean AUC :", cross_val_score(LogisticRegression(), naive, y, cv=5, scoring="roc_auc").mean().round(3))
pipe = make_pipeline(TargetEncoder(cv=StratifiedKFold(5, shuffle=True, random_state=0)), LogisticRegression())
print("TargetEncoder in a pipeline AUC:", cross_val_score(pipe, X, y, cv=5, scoring="roc_auc").mean().round(3))</div>
  <div class="fx" data-lang="text">naive target-mean AUC : 0.777
TargetEncoder in a pipeline AUC: 0.495</div>
  <p>The target here is random, so any honest model should score an AUC of 0.5, a coin flip. Naive encoding computed on all rows scores 0.777, because with about five rows per PIN code, each row's own label moves its PIN code's mean. With the cross-fitted <code>TargetEncoder</code> inside a pipeline the fake signal disappears (0.495). <a class="xref" data-note="ml_catboost">CatBoost</a> solves the same problem with "ordered target statistics", encoding each row using only the rows before it.</p>

  <h2 id="fe-missing"><span class="num">07</span>Missing Values</h2>
  <p>The seller of flat G left the "age of building" field blank. Most models refuse a blank cell, so something must go in the hole. Filling it with the average age is easy, but G is in fact 20 years old, by far the oldest flat. Before filling a hole it pays to ask <em>why</em> it is empty, because the answer decides which fill is honest. Statisticians (Rubin, 1976) name three cases. <strong>MCAR</strong> (missing completely at random): the blank has nothing to do with any value, for example a form field that failed to save, so the rows with blanks are a random subset. <strong>MAR</strong> (missing at random, given what you observe): the chance of a blank depends on other <em>recorded</em> columns, for example listings from one agency skip the age field more often. <strong>MNAR</strong> (missing not at random): the chance depends on the missing value itself, for example sellers of old buildings leave the age blank because the answer would lower the price. Flat G is probably MNAR.</p>
  <p>A simulation shows why the distinction matters. 100,000 people have an income (true mean 50) that rises with age, and about 30% of incomes are hidden under each mechanism. We then fill each blank with the average observed income of people in the same 5-year age band:</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(0)
n = 100_000
age = rng.uniform(20, 60, n)
income = 10 + 1.0 * age + rng.normal(0, 8, n)          # thousand rupees; rises with age (true mean 50)
for name, p in [("MCAR", np.full(n, 0.3)),                          # everyone equally likely to skip
                ("MAR ", np.where(age &lt; 35, 0.6, 0.1)),             # young people skip more (age observed)
                ("MNAR", np.where(income &gt; 55, 0.6, 0.1))]:         # high earners skip more
    seen = rng.random(n) &gt; p
    band = (age // 5).astype(int)                      # fill each blank with its age band's observed mean
    band_mean = {b: income[seen &amp; (band == b)].mean() for b in np.unique(band)}
    filled = np.where(seen, income, [band_mean[b] for b in band])
    print(f"{name}: observed mean {income[seen].mean():.2f}   after age-band filling {filled.mean():.2f}")</div>
  <div class="fx" data-lang="text">MCAR: observed mean 50.06   after age-band filling 50.04
MAR : observed mean 53.30   after age-band filling 50.04
MNAR: observed mean 46.13   after age-band filling 48.73</div>
  <p>Under MCAR the observed rows are a fair sample (50.06), so any reasonable fill works. Under MAR the observed mean is biased (53.30, because young, lower earners hid their income more often), but filling each blank using age, the observed cause, recovers the truth (50.04). Under MNAR the observed mean is biased the other way (46.13), and using age helps only a little (48.73), because the real cause of the blanks is the hidden income itself, which no observed column fully explains. You can never prove from the data alone which case you are in; it takes domain knowledge. The practical consequences: under MAR, imputation that uses other columns is the right tool; under MNAR, the fact that a value is missing is itself information, so add a <strong>missing indicator</strong>, a 0/1 column marking which rows were filled, and let the model use it.</p>
  <p>Now fill flat G's age four ways. The nine known ages are 12, 3, 8, 15, 5, 10, 2, 7, 4. The <strong>mean</strong> is 66/9 = 7.33 and the <strong>median</strong> (middle of the sorted list) is 7. <strong>KNN imputation</strong> finds the k flats most similar to G on the columns G does have (area 11, price 73) and averages their ages; with k = 2 the nearest are F (area 10, price 68) and E (9, 67), whose ages 10 and 5 average to 7.5. <strong>Iterative imputation</strong> (also called MICE, multiple imputation by chained equations) treats age as a target, regresses it on area and price using the nine known flats, and predicts G; with several columns containing holes it cycles through them for several rounds.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.experimental import enable_iterative_imputer  # noqa: F401 (switches the class on)
from sklearn.impute import SimpleImputer, KNNImputer, IterativeImputer
from sklearn.linear_model import LinearRegression

age = np.array([12, 3, 8, 15, 5, 10, np.nan, 2, 7, 4])    # flat G's age was not recorded (truly 20)
X = np.c_[area, price, age]
for name, imp in [("mean", SimpleImputer(strategy="mean")), ("median", SimpleImputer(strategy="median")),
                  ("KNN k=2", KNNImputer(n_neighbors=2)),
                  ("iterative", IterativeImputer(estimator=LinearRegression(), random_state=0))]:
    print(f"{name:9s} fills G's age with {imp.fit_transform(X)[6, 2]:5.2f}")
print("median + indicator, G's last two columns:", SimpleImputer(strategy="median", add_indicator=True).fit_transform(X)[6, 2:])</div>
  <div class="fx" data-lang="text">mean      fills G's age with  7.33
median    fills G's age with  7.00
KNN k=2   fills G's age with  7.50
iterative fills G's age with 11.97
median + indicator, G's last two columns: [7. 1.]</div>
  <p>The truth is 20. Mean, median and KNN all guess "a typical flat" (7 to 7.5) because they ignore the one clue that G is ₹3 lakh cheaper than its size suggests. Iterative imputation has learnt that "flats cheap for their size are older" and gets closer (11.97), though nine flats cannot take it all the way. The indicator column (1 for G) lets the model learn "a blank age means older and cheaper", which is the right response to MNAR. Simple fills also shrink a column's variance and weaken its correlations, since many rows get the same value; the indicator gives the model a way to treat filled rows differently. On a larger scale, with two important columns of the diabetes data hidden under MAR:</p>
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
older = X[:, 0] &gt; np.median(X[:, 0])
for col in [2, 8]:                                     # hide bmi and s5; older patients miss more (MAR)
    Xm[rng.random(len(X)) &lt; np.where(older, 0.5, 0.1), col] = np.nan
mask = np.isnan(Xm)
for name, imp in {"mean": SimpleImputer(), "KNN k=5": KNNImputer(), "iterative": IterativeImputer(random_state=0)}.items():
    err = np.sqrt(((imp.fit_transform(Xm)[mask] - X[mask]) ** 2).mean()) / X[mask].std()
    r2 = cross_val_score(make_pipeline(imp, Ridge(alpha=0.1)), Xm, y, cv=5).mean()
    print(f"{name:10s} fill error {err:.3f} SDs   ridge CV R2 {r2:.3f}")
print(f"no missing values           ridge CV R2 {cross_val_score(Ridge(alpha=0.1), X, y, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">mean       fill error 1.020 SDs   ridge CV R2 0.422
KNN k=5    fill error 0.908 SDs   ridge CV R2 0.426
iterative  fill error 0.655 SDs   ridge CV R2 0.451
no missing values           ridge CV R2 0.480</div>
  <p>Mean filling is off by about one standard deviation, KNN a little better, and iterative imputation, which exploits the correlations between columns, much closer (0.655 SD), giving the best downstream R² (0.451, against 0.480 with no missing data at all). Rules of thumb: dropping rows is acceptable only for a few MCAR blanks (dropping G would lose the oldest flat); median plus an indicator is a robust default; iterative imputation suits MAR data with correlated columns; and many gradient-boosting libraries (HistGradientBoosting, XGBoost, LightGBM) and recent sklearn trees handle NaN natively, learning which way to send missing values at each split. Two warnings: imputers learn statistics, so fit them on training rows only; and never let an imputer use the target column as an input, because the target will not be available when predicting a new flat.</p>

  <h2 id="fe-outliers"><span class="num">08</span>Outliers</h2>
  <p>A blank is one kind of awkward value; another is a value that is present but extreme, like the ₹400 lakh bungalow among flats priced ₹38 to 96 lakh. An <strong>outlier</strong> is a value far from the rest of the data. It may be an error (a typo), a different kind of thing (a bungalow is not a flat), or a genuine but rare case. Outliers matter because squared-error models give extreme rows enormous pull: in <a class="xref" data-note="ml_loss_gd">Loss &amp; Gradient Descent</a>, one mistyped price (96 entered as 69) dragged the fitted slope from 6 to 4.53.</p>
  <p>Detecting them reliably is less obvious than it looks. The simplest rule, the <strong>z-score</strong> |x − mean|/std &gt; 3, has a flaw: the outlier inflates the very mean and standard deviation it is judged by. The <strong>IQR rule</strong> (Tukey's fences) is sturdier. Sort the eleven prices; the first quartile Q1 is 54.5 and the third quartile Q3 is 85, so IQR = 30.5. Anything below Q1 − 1.5 × IQR = 8.75 or above Q3 + 1.5 × IQR = 130.75 is flagged. The <strong>robust z-score</strong> replaces the mean with the median and the standard deviation with the <strong>MAD</strong> (median absolute deviation, the median of |x − median|): robust z = 0.6745 × (x − median)/MAD, where 0.6745 makes MAD comparable to a standard deviation for normal data. Here the median is 68 and the MAD is 15.</p>
  <div class="fx" data-lang="py">import numpy as np

x = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96, 400.])   # ten flats + the bungalow (₹ lakh)
q1, q3 = np.percentile(x, [25, 75]); iqr = q3 - q1
print(f"IQR fences [{q1 - 1.5 * iqr}, {q3 + 1.5 * iqr}]")
print(f"z-score of 400: {(400 - x.mean()) / x.std():.2f}")
med = np.median(x); mad = np.median(np.abs(x - med))
print(f"median {med}, MAD {mad}, robust z of 400: {0.6745 * (400 - med) / mad:.1f}")
x2 = np.r_[x, 380.]                                    # a second bungalow is listed
print("two bungalows, z-scores:", ((x2[-2:] - x2.mean()) / x2.std()).round(2),
      "  robust z:", (0.6745 * (x2[-2:] - np.median(x2)) / np.median(np.abs(x2 - np.median(x2)))).round(1))</div>
  <div class="fx" data-lang="text">IQR fences [8.75, 130.75]
z-score of 400: 3.12
median 68.0, MAD 15.0, robust z of 400: 14.9
two bungalows, z-scores: [2.3  2.13]   robust z: [13.1 12.3]</div>
  <p>The IQR fences flag the bungalow easily. Its ordinary z-score is only 3.12, just over the threshold, and if a second bungalow (₹380 lakh) is listed, both z-scores fall below 3 (2.30 and 2.13): the two outliers inflate the standard deviation and hide each other, an effect called <strong>masking</strong>. The robust z-score, about 15 for one bungalow and 12 to 13 for two, is unmistakable either way.</p>
  <p>What to do once an outlier is found depends on what it is. Clear errors should be fixed (69 back to 96) or removed. Genuine but extreme values that distort a linear model can be <strong>clipped</strong> (also called winsorized): capped at the fences or at a percentile, so ₹400 lakh becomes 130.75. Skewed columns with a long tail can be log-transformed or robust-scaled. If you want to keep the rows untouched, use a robust loss (Huber, quantile regression) or a tree model, which is barely affected by extreme values. If the outlier is a different kind of thing, give it its own model (bungalows priced separately). And sometimes the outliers are the point, as in fraud detection, where they should be studied rather than removed. Whatever you do, learn the clip limits from training rows only and apply them to every later row, and never drop outliers from the test set: production data will contain bungalows.</p>

  <h2 id="fe-time"><span class="num">09</span>Dates and Free Text</h2>
  <p>Some columns are neither numbers nor categories. A raw timestamp is stored as a huge number (nanoseconds since 1970) that means little to a model. What drives behaviour is the parts of the date: the month (season), the day of the week, whether it is a weekend or a holiday, and elapsed times such as the building's age when it was listed or the days since the last price cut. Turning one timestamp into these columns is the standard first step.</p>
  <p>Months, hours and weekdays raise one more problem: they go round in a cycle. December (12) and January (1) are one month apart, but as numbers they are 11 apart, and January looks closer to June than to December. The fix is <strong>cyclical encoding</strong>: put the month on a circle, like the numbers on a clock face, using two columns, sin and cos of 2π·(month − 1)/12. December lands at (−0.5, 0.866) and January at (0, 1), which are only 0.518 apart, while January and June are 1.932 apart, nearly the full diameter of 2.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd

def circle(m):                                         # month -&gt; point on a circle
    a = 2 * np.pi * (m - 1) / 12
    return np.array([np.sin(a), np.cos(a)])
print(f"Dec-Jan: raw gap 11, cyclical distance {np.linalg.norm(circle(12) - circle(1)):.3f}")
print(f"Jan-Jun: raw gap 5,  cyclical distance {np.linalg.norm(circle(1) - circle(6)):.3f}")

listed = pd.to_datetime(["2024-03-09", "2024-01-26", "2024-10-14"])   # flats A, B, J
built  = pd.to_datetime(["2012-06-01", "2021-02-01", "2020-11-01"])
print(pd.DataFrame({"flat": ["A", "B", "J"], "month": listed.month, "weekday": listed.dayofweek,
                    "weekend": (listed.dayofweek &gt;= 5).astype(int),
                    "holiday": listed.strftime("%m-%d").isin(["01-26", "08-15"]).astype(int),
                    "age_years": ((listed - built).days / 365.25).round(1)}).to_string(index=False))</div>
  <div class="fx" data-lang="text">Dec-Jan: raw gap 11, cyclical distance 0.518
Jan-Jun: raw gap 5,  cyclical distance 1.932
flat  month  weekday  weekend  holiday  age_years
   A      3        5        1        0       11.8
   B      1        4        0        1        3.0
   J     10        0        0        0        4.0</div>
  <p>Flat B, listed on 26 January, is flagged as a holiday (Republic Day); flat A, listed on a Saturday (weekday 5, with Monday as 0), as a weekend. The <code>age_years</code> column, the time between construction and listing, is far more useful than either raw date. The same sin/cos trick applies to hour of day (period 24, so 23:00 and 01:00 are close), day of week (7) and day of year. Tree models can cope with the raw month, because they can split 1–2 and 11–12 separately; linear and distance-based models need the cycle. Any feature that summarises the past, such as "average Baner price over the last 3 months", must use only rows before the listing date, and time-ordered data need time-based train/test splits (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</p>
  <p>The listing description, "new spacious flat near metro", carries information no structured field has. The simplest way to turn text into columns is the <strong>bag of words</strong>: build a vocabulary of all words in the training texts, and represent each text by how often each word appears, ignoring word order. But common words carry less information than rare ones: "flat" appears in every listing and says nothing, while "metro" is informative. <strong>TF-IDF</strong> (term frequency × inverse document frequency) weights each count by how rare the word is across documents. sklearn's version is idf = ln((1 + n)/(1 + df)) + 1, where n is the number of documents and df the number containing the word, and then each row is scaled to length 1. With three listings, "flat" (in all 3) gets idf = ln(4/4) + 1 = 1.0, "metro" (in 2) gets ln(4/3) + 1 = 1.288, and "baner" (in 1) gets ln(4/2) + 1 = 1.693.</p>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

docs = ["spacious flat near metro",                     # listing of flat H
        "new flat in baner",                            # flat B
        "new spacious flat near metro metro"]           # flat J
cv = CountVectorizer().fit(docs)
print(cv.get_feature_names_out()); print(cv.transform(docs).toarray())
tf = TfidfVectorizer().fit(docs)
print("idf:", {w: round(float(v), 3) for w, v in zip(tf.get_feature_names_out(), tf.idf_)})
print("flat J tf-idf:", tf.transform(docs[2:]).toarray().round(3))</div>
  <div class="fx" data-lang="text">['baner' 'flat' 'in' 'metro' 'near' 'new' 'spacious']
[[0 1 0 1 1 0 1]
 [1 1 1 0 0 1 0]
 [0 1 0 2 1 1 1]]
idf: {'baner': 1.693, 'flat': 1.0, 'in': 1.693, 'metro': 1.288, 'near': 1.288, 'new': 1.288, 'spacious': 1.288}
flat J tf-idf: [[0.    0.282 0.    0.725 0.363 0.363 0.363]]</div>
  <p>In flat J's listing, "flat", which every listing contains, gets the lowest weight (0.282), and "metro", which appears twice and is fairly rare, the highest (0.725). These sparse matrices feed straight into linear models and <a class="xref" data-note="ml_naivebayes">Naive Bayes</a>. Useful options are <code>ngram_range=(1, 2)</code> to add word pairs ("near metro", "not near"), <code>min_df</code> and <code>max_df</code> to drop very rare or very common words, and <code>HashingVectorizer</code> for unbounded vocabularies. The vocabulary and idf values are learnt in <code>fit</code>, so fit on training text only. Modern NLP replaces these counts with learnt embeddings (<a class="xref" data-note="nlp">NLP</a>).</p>

  <h2 id="fe-poly"><span class="num">10</span>Interactions, Polynomials and Feature Selection</h2>
  <p>Every feature so far enters a linear model on its own: the model adds up weight × column. It therefore cannot express effects that depend on two columns together, such as "revenue is price <em>times</em> quantity" or "a year of age costs more in a premium locality than in a cheap one". An <strong>interaction feature</strong> is a product of two columns; its weight lets the effect of one feature depend on the value of the other. <strong>Polynomial features</strong> of degree 2 add every square and every pairwise product. For flat A (area 5, age 12) the degree-2 expansion is 1, area, age, area², area·age, age² = 1, 5, 12, 25, 60, 144.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

pf = PolynomialFeatures(degree=2).fit([[5, 12]])       # flat A: area 5, age 12
print(pf.get_feature_names_out(["area", "age"]), pf.transform([[5, 12]]))
for d in [6, 10, 50]:
    print(f"{d} features -&gt; {PolynomialFeatures(2).fit(np.zeros((1, d))).n_output_features_} columns at degree 2")
rng = np.random.default_rng(0)
unit_price = rng.uniform(10, 100, 500); qty = rng.integers(1, 20, 500)
revenue = unit_price * qty + rng.normal(0, 20, 500)
X = np.c_[unit_price, qty]
print("revenue, linear CV R2: raw", cross_val_score(LinearRegression(), X, revenue, cv=5).mean().round(3),
      "  with price*qty", cross_val_score(LinearRegression(), np.c_[X, unit_price * qty], revenue, cv=5).mean().round(3))</div>
  <div class="fx" data-lang="text">['1' 'area' 'age' 'area^2' 'area age' 'age^2'] [[  1.   5.  12.  25.  60. 144.]]
6 features -&gt; 28 columns at degree 2
10 features -&gt; 66 columns at degree 2
50 features -&gt; 1326 columns at degree 2
revenue, linear CV R2: raw 0.88   with price*qty 0.998</div>
  <p>The number of columns explodes: degree 2 on d features gives (d + 1)(d + 2)/2 columns including the constant, so the flats' six columns become 28 (from only ten rows!), 10 features become 66, and 50 become 1,326. That is why polynomial expansion is almost always paired with regularization (<a class="xref" data-note="ml_regularization">Regularization</a>) and with scaling beforehand, because powers of unscaled columns are huge and highly correlated. The last line shows why a single well-chosen interaction is often better than brute force: revenue = price × quantity, and a linear model on price and quantity explains 88% of it because it can only add them, while with the product column it explains 99.8%. Domain ratios such as price per square foot, debt to income, or clicks per impression are interactions too, and usually beat blind expansion. Trees and boosting discover interactions themselves (a split on locality followed by a split on age), which is one reason they do so well on raw tabular data; linear models need them handed over.</p>
  <p>Engineering keeps adding columns, and more columns are not always better: carpet area added nothing once built-up area was in, and every useless column adds noise and a chance to overfit. <strong>Feature selection</strong> removes the columns that do not help. There are three families, covered with worked examples in <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a>. <strong>Filter</strong> methods score each column on its own (variance, correlation with the target, mutual information); they are fast but ignore interactions and would happily keep both area twins. <strong>Wrapper</strong> methods try subsets with a model (forward or backward selection, recursive feature elimination); they are accurate but expensive. <strong>Embedded</strong> methods select while training, such as lasso's zero weights (it kept area, age and Baner for the flats) or tree importances. Whatever you use, selection must happen inside each training fold: selecting features on all rows and then cross-validating is one of the most dramatic leaks there is, and on pure noise it can report 85% accuracy (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>

  <h2 id="fe-imb"><span class="num">11</span>Class Imbalance</h2>
  <p>Four of our ten flats sold within 30 days, a mild imbalance. Across the whole portal, perhaps 5% of listings are fraudulent. With rare classes like that, a model that always says "not fraud" is 95% accurate and completely useless, and many learners, trained to minimise the average loss, lean towards the majority class and predict the rare one too seldom. Fraud, churn, disease and machine failure all look like this. There are three families of fixes, plus one honest alternative.</p>
  <p><strong>Class weights</strong> make each mistake on the rare class cost more in the loss. sklearn's <code>class_weight="balanced"</code> gives class c the weight n/(k·n_c), where n is the number of rows, k the number of classes and n_c the size of class c, so both classes contribute equally in total. For the ten flats, 6 slow and 4 fast: slow sellers get 10/(2 × 6) = 0.833 and fast sellers 10/(2 × 4) = 1.25 (check: 6 × 0.833 = 5 = 4 × 1.25). For a 95/5 split the weights are 0.526 and 10. <strong>Resampling</strong> changes the training data instead: <strong>random oversampling</strong> duplicates rare-class rows until the classes balance (simple, but the model may memorise the copies), and <strong>random undersampling</strong> throws away majority rows (fast, but discards information). <strong>SMOTE</strong> (Chawla et al., 2002) creates <em>new</em> rare-class points on the line between a rare point and one of its nearest rare neighbours: x_new = x + u·(neighbour − x), with u random between 0 and 1. By hand on two fast sellers in (area, age), A (5, 12) and its nearest fast neighbour D (8, 15), with u = 0.4: (5 + 0.4 × 3, 12 + 0.4 × 3) = (6.2, 13.2), a plausible 620 sq ft, 13-year-old flat that never existed.</p>
  <p>Do these fixes make the model better? Here they are compared honestly on 4,000 rows with 5% positives. Every fix is applied to the training rows only, and the test set keeps its natural 5%. SMOTE is written from scratch in a few lines (the <code>imbalanced-learn</code> package provides it ready-made, along with a pipeline that resamples inside each CV fold):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import recall_score, precision_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import NearestNeighbors

def smote(X, y, k=5, seed=0):
    """Add synthetic class-1 points on lines between class-1 neighbours until classes balance."""
    rng = np.random.default_rng(seed)
    Xm = X[y == 1]; need = (y == 0).sum() - len(Xm)
    idx = NearestNeighbors(n_neighbors=k + 1).fit(Xm).kneighbors(Xm)[1]   # idx[:, 0] is the point itself
    base = rng.integers(0, len(Xm), need)
    nb = idx[base, rng.integers(1, k + 1, need)]
    new = Xm[base] + rng.random((need, 1)) * (Xm[nb] - Xm[base])          # x + u * (neighbour - x)
    return np.vstack([X, new]), np.r_[y, np.ones(need, dtype=int)]

g = np.random.default_rng(1)
y = (g.random(4000) &lt; 0.05).astype(int)                # 5% positives (say, fraud)
X = g.normal(size=(4000, 4)) + np.outer(y, [1.5, 1.5, 0, 0])
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
rng = np.random.default_rng(0)
pos, neg = np.flatnonzero(ytr == 1), np.flatnonzero(ytr == 0)
over = np.r_[neg, rng.choice(pos, len(neg))]           # duplicate positives
under = np.r_[rng.choice(neg, len(pos), replace=False), pos]   # discard negatives
print("always predict 0: accuracy", round(1 - yte.mean(), 3))
for name, (Xa, ya, cw) in {"no fix": (Xtr, ytr, None), "class_weight": (Xtr, ytr, "balanced"),
                           "oversample": (Xtr[over], ytr[over], None), "undersample": (Xtr[under], ytr[under], None),
                           "SMOTE": (*smote(Xtr, ytr), None)}.items():
    m = LogisticRegression(class_weight=cw, max_iter=1000).fit(Xa, ya)
    p = m.predict(Xte)
    print(f"{name:12s} recall {recall_score(yte, p):.2f}  precision {precision_score(yte, p):.2f}"
          f"  ROC-AUC {roc_auc_score(yte, m.predict_proba(Xte)[:, 1]):.3f}")
s0 = LogisticRegression(max_iter=1000).fit(Xtr, ytr).predict_proba(Xte)[:, 1]
p = (s0 &gt;= 0.1).astype(int)                            # no resampling, just a lower threshold
print(f"no fix, t=0.1 recall {recall_score(yte, p):.2f}  precision {precision_score(yte, p):.2f}")</div>
  <div class="fx" data-lang="text">always predict 0: accuracy 0.948
no fix       recall 0.46  precision 0.83  ROC-AUC 0.949
class_weight recall 0.86  precision 0.25  ROC-AUC 0.946
oversample   recall 0.86  precision 0.26  ROC-AUC 0.946
undersample  recall 0.86  precision 0.26  ROC-AUC 0.947
SMOTE        recall 0.83  precision 0.26  ROC-AUC 0.944
no fix, t=0.1 recall 0.75  precision 0.35</div>
  <p>Read the output carefully. Without any fix, recall is 0.46 (more than half the positives missed) but precision is high (0.83). Every fix, class weights, oversampling, undersampling with only a few hundred rows, and SMOTE, lands in almost the same place: recall about 0.85, precision about 0.25. Meanwhile ROC-AUC, which measures how well the model <em>ranks</em> positives above negatives across all thresholds, barely moves (0.944 to 0.949). The fixes did not make the model better at separating the classes; they mostly <strong>moved the decision threshold</strong>, trading precision for recall. The last line shows a similar trade obtained with no resampling at all, simply by predicting "positive" when the probability exceeds 0.1 instead of 0.5.</p>
  <p>So for most imbalance problems the honest recipe is: train normally (or with class weights, the cheapest fix), evaluate with metrics that respect the rare class (precision, recall, F1, PR-AUC; <a class="xref" data-note="ml_evaluation">Classification Metrics</a>), and choose the threshold from the business cost of each kind of error (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>). Resampling helps most with weak learners or very few positives. Two warnings: resampling and class weights distort predicted probabilities (the model now believes positives are common), so recalibrate if you need real probabilities; and never resample before the train/test split or before cross-validation, because copies or interpolations of the same rare row then appear on both sides and every score becomes fantasy.</p>

  <h2 id="fe-sklearn"><span class="num">12</span>The scikit-learn Transformer API</h2>
  <p>We now have a dozen techniques, and each one learns something from data: a scaler learns a mean, an encoder a category list, an imputer a fill value, a vectorizer a vocabulary, a binner its edges. When a new listing arrives, each must reuse exactly what it learnt, never relearn from the new row. scikit-learn organises all of them behind one interface. Every step is a <strong>transformer</strong> with two methods. <code>fit(X)</code> <em>learns</em> from data and stores what it learnt in attributes whose names end in an underscore (<code>mean_</code>, <code>categories_</code>, <code>statistics_</code>, <code>lambdas_</code>, <code>bin_edges_</code>, <code>vocabulary_</code>). <code>transform(X)</code> <em>applies</em> what was learnt to any rows. <code>fit_transform</code> does both on the same rows and is used only on training data. Think of a tailor: <code>fit</code> takes your measurements once, <code>transform</code> cuts every later garment to those measurements; he does not re-measure the cloth.</p>
  <p>Real tables need different steps for different columns, and <strong><code>ColumnTransformer</code></strong> handles that: it sends each group of columns to its own transformer and glues the results side by side. Below, three training flats (A, E and I) are used to fit a scaler and a one-hot encoder, and then a new listing arrives: 1,400 sq ft in Wakad, a locality never seen in training.</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, FunctionTransformer, OneHotEncoder
from sklearn.compose import ColumnTransformer
pd.set_option("display.width", 200)

train = pd.DataFrame({"area": [5., 9., 13.], "locality": ["Hadapsar", "Baner", "Kothrud"]})   # flats A, E, I
new = pd.DataFrame({"area": [14.], "locality": ["Wakad"]})                                   # a new listing

sc = StandardScaler().fit(train[["area"]])             # fit: LEARN mean_ and scale_ from training rows
print("mean_", sc.mean_, " scale_", sc.scale_.round(3), " transform(new):", sc.transform(new[["area"]]).ravel().round(3))
ct = ColumnTransformer([("num", StandardScaler(), ["area"]),
                        ("log", FunctionTransformer(np.log1p, feature_names_out="one-to-one"), ["area"]),
                        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), ["locality"])])
ct.set_output(transform="pandas")
ct.fit(train)
print(ct.transform(new).round(3).to_string())</div>
  <div class="fx" data-lang="text">mean_ [9.]  scale_ [3.266]  transform(new): [1.531]
   num__area  log__area  cat__locality_Baner  cat__locality_Hadapsar  cat__locality_Kothrud
0      1.531      2.708                  0.0                     0.0                    0.0</div>
  <p>By hand: the training areas 5, 9, 13 have mean 9 and standard deviation √((16 + 0 + 16)/3) = 3.266, so the new 1,400 sq ft listing becomes (14 − 9)/3.266 = 1.531, using the <em>training</em> statistics, not its own. <code>FunctionTransformer</code> wraps a function that learns nothing (log1p of 14 is ln 15 = 2.708). The unseen Wakad becomes all zeros in the locality columns. <code>set_output(transform="pandas")</code> returns a DataFrame with readable names such as <code>num__area</code>, and <code>get_feature_names_out()</code> gives the same names as a list.</p>
  <p>The full family, by job: scalers (<code>StandardScaler</code>, <code>MinMaxScaler</code>, <code>RobustScaler</code>); shape changers (<code>PowerTransformer</code>, <code>QuantileTransformer</code>, <code>FunctionTransformer</code>); <code>KBinsDiscretizer</code>; encoders (<code>OneHotEncoder</code>, <code>OrdinalEncoder</code>, <code>TargetEncoder</code>, <code>FeatureHasher</code>); imputers (<code>SimpleImputer</code>, <code>KNNImputer</code>, <code>IterativeImputer</code>, <code>MissingIndicator</code>); expanders (<code>PolynomialFeatures</code>, <code>SplineTransformer</code>); text vectorizers (<code>CountVectorizer</code>, <code>TfidfVectorizer</code>, <code>HashingVectorizer</code>); and selectors (<code>VarianceThreshold</code>, <code>SelectKBest</code>, <code>SelectFromModel</code>, <code>RFECV</code>). Because every one of them learns in <code>fit</code>, every one of them leaks if it is fitted on the wrong rows. Chaining them with the model in a <code>Pipeline</code>, so that cross-validation refits them inside every fold automatically, is the subject of the next note, <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</p>

  <h2 id="fe-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>Almost every feature-engineering bug is silent: no error message, just a score that is too good in development or a model that fails in production. The biggest family is fitting a learnt step on the wrong rows. Scalers, imputers, encoders, binners, vectorizers and selectors all learn from data; fitting any of them on the full dataset before splitting lets test information into training. The most dramatic case is naive target encoding, which on the flats turned an honest error of 3.69 into a flattering 1.68 and on pure noise produced an AUC of 0.777 instead of 0.5. Resampling before the split does the same for imbalanced data. The cure is always the same: fit on training rows only, inside each CV fold, using a pipeline.</p>
  <p>The second family is giving the model a false picture. Integer codes for unordered categories invent an order and spacing (the flats' error rose from 1.16 with one-hot to 5.44 with codes). Filling blanks without asking why they are blank hides information (every simple fill said flat G was about 7 years old; it was 20), so add a missing indicator when a blank may mean something. Using features from the future, such as days on market, final negotiated price, or locality averages computed over the whole year including later sales, makes validation look great and production fail. And <code>np.log(0)</code> is minus infinity, which breaks training silently; use log1p for counts and Yeo-Johnson for signed values.</p>
  <p>The third family is mismatching steps and models. Skipping scaling for KNN or an SVM wrecks accuracy (KNN 0.691 instead of 0.949 on the wine data), while scaling for trees wastes effort. Crashing on a category never seen in training is a production classic; use <code>handle_unknown="ignore"</code>. And judging an imbalance fix by accuracy is meaningless when always saying "no" scores 94.8%; use recall, precision, F1 or PR-AUC, and choose the threshold deliberately.</p>

  <h2 id="fe-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Feature engineering</b>: creating, transforming, encoding and selecting input columns so a model can learn the pattern. Representation (scale, encode, impute) plus creation (ratios, distances, date parts).</li>
    <li><b>Scaling</b>: per-column linear map, changes range not shape. <b>Transform</b>: monotone non-linear map (log, Box-Cox), changes shape.</li>
    <li><b>Binning</b>: replacing a number by its range (equal width, equal frequency, domain).</li>
    <li><b>Cardinality</b>: number of distinct values of a categorical column.</li>
    <li><b>One-hot / ordinal / target / count / hashing</b>: 0/1 column per category; integer by real order; smoothed category mean of the target (out-of-fold); category frequency; hash mod m.</li>
    <li><b>MCAR / MAR / MNAR</b>: missing at random overall; depending on observed columns; depending on the missing value itself.</li>
    <li><b>Missing indicator</b>: 0/1 column marking imputed rows.</li>
    <li><b>Masking</b>: outliers inflating mean and std so z-scores hide them.</li>
    <li><b>Cyclical encoding</b>: sin and cos of 2π·value/period.</li>
    <li><b>TF-IDF</b>: word count × inverse document frequency, row-normalised.</li>
    <li><b>Transformer</b>: object with <code>fit</code> (learns, stores attributes ending in _) and <code>transform</code> (applies).</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Flats example</th></tr>
    <tr><td>Standardize</td><td>(x − mean)/std</td><td>A: (5 − 9.5)/2.872 = −1.567</td></tr>
    <tr><td>Min-max / robust</td><td>(x − min)/(max − min); (x − median)/IQR</td><td>(x − 5)/9; (x − 9.5)/4.5</td></tr>
    <tr><td>Box-Cox</td><td>(x^λ − 1)/λ, ln x at λ = 0</td><td>λ = 0.5 on 9 → 4</td></tr>
    <tr><td>Smoothed target encoding</td><td>(n·mean + m·global)/(n + m)</td><td>Baner (4·73.75 + 2·67)/6 = 71.5</td></tr>
    <tr><td>IQR fences</td><td>Q1 − 1.5·IQR, Q3 + 1.5·IQR</td><td>[8.75, 130.75]</td></tr>
    <tr><td>Robust z</td><td>0.6745·(x − median)/MAD</td><td>0.6745 × 332/15 = 14.9</td></tr>
    <tr><td>Cyclical month</td><td>sin, cos of 2π(m − 1)/12</td><td>Dec–Jan distance 0.518</td></tr>
    <tr><td>idf (sklearn)</td><td>ln((1 + n)/(1 + df)) + 1</td><td>df = n → 1.0</td></tr>
    <tr><td>Degree-2 columns</td><td>(d + 1)(d + 2)/2</td><td>6 features → 28</td></tr>
    <tr><td>Balanced class weight</td><td>n/(k·n_c)</td><td>10/(2·4) = 1.25</td></tr>
    <tr><td>SMOTE point</td><td>x + u·(neighbour − x)</td><td>(5, 12) + 0.4·(3, 3) = (6.2, 13.2)</td></tr>
  </table>
  <h3>Which step for which model</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Linear / logistic</th><th>KNN / SVM / k-means</th><th>Trees / boosting</th><th>Neural nets</th></tr>
    <tr><td>Scaling</td><td>needed with penalties or GD</td><td>essential</td><td>not needed</td><td>essential</td></tr>
    <tr><td>Log / power transform</td><td>often helps</td><td>helps</td><td>no effect</td><td>helps</td></tr>
    <tr><td>Binning</td><td>lets it bend</td><td>rarely</td><td>usually hurts</td><td>rarely</td></tr>
    <tr><td>One-hot</td><td>standard</td><td>standard</td><td>fine for few categories</td><td>or embeddings</td></tr>
    <tr><td>Target encoding</td><td>high cardinality</td><td>high cardinality</td><td>good (CatBoost built-in)</td><td>possible</td></tr>
    <tr><td>Missing values</td><td>impute + indicator</td><td>impute</td><td>often native NaN</td><td>impute + indicator</td></tr>
    <tr><td>Interactions</td><td>must be added</td><td>implicit in distances</td><td>found automatically</td><td>learnt</td></tr>
    <tr><td>Cyclical time</td><td>sin/cos</td><td>sin/cos</td><td>raw month works</td><td>sin/cos</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.compose import ColumnTransformer
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, TargetEncoder

prep = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median", add_indicator=True), StandardScaler()),
            ["area", "age"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["locality"]),
    ("pin", TargetEncoder(), ["pin_code"]),          # high cardinality, cross-fitted
])
prep.fit(X_train)                                    # learn from training rows only
X_new = prep.transform(X_test)                       # reuse what was learnt</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Fit every learnt step on training rows only, inside each CV fold.</li>
    <li>Target encoding must be out-of-fold and smoothed.</li>
    <li>No integer codes for unordered categories in linear models; <code>LabelEncoder</code> is for y.</li>
    <li><code>handle_unknown="ignore"</code> for production.</li>
    <li>Ask why a value is missing; add an indicator for MNAR.</li>
    <li>Resample only training folds; judge imbalance fixes by recall/precision, not accuracy.</li>
    <li>log1p for counts with zeros; features must be known at prediction time.</li>
  </ul>

  <h2 id="fe-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is feature engineering and why does it matter?</summary><div class="qa-body">It is turning raw data into input columns that make the pattern easy for a model to learn: scaling, transforming, encoding, imputing, and creating new features from domain knowledge. It often matters more than the algorithm: a distance feature took a linear model from R² −0.01 to 0.94, beating a random forest on the raw coordinates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Normalization vs standardization: what is the difference and when do you use each?</summary><div class="qa-body">Min-max normalization maps a column to [0, 1] using its min and max; standardization subtracts the mean and divides by the standard deviation, giving mean 0 and std 1. Standardization is the usual default; min-max suits bounded data such as pixels. Both are distorted by outliers, in which case robust scaling (median and IQR) is better.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which models need feature scaling and which don't?</summary><div class="qa-body">Models that compare magnitudes across features need it: KNN, k-means, SVMs, PCA, regularized linear and logistic regression, and anything trained by gradient descent, including neural networks. Tree-based models (decision trees, random forests, gradient boosting) and Naive Bayes do not, because their splits or per-feature probabilities ignore units.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you apply a log transform to a feature?</summary><div class="qa-body">When the feature is right-skewed with a long tail (money, counts, sizes, durations) or when its effect is multiplicative. The log compresses large values, reduces the influence of extremes and often makes the relationship with the target more linear. Use log1p when zeros are possible, and Yeo-Johnson for negative values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you encode categorical variables? Compare the main methods.</summary><div class="qa-body">One-hot: a 0/1 column per category, no order implied, best for low cardinality. Ordinal: integers, only when the order is real or for trees. Target encoding: the smoothed mean target per category, compact for high cardinality but must be computed out-of-fold. Count encoding: category frequency. Hashing: fixed-width columns via a hash, handles huge or unseen vocabularies at the cost of collisions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the dummy variable trap?</summary><div class="qa-body">With one-hot columns for every category plus an intercept, the dummy columns always sum to 1, an exact copy of the intercept, so unregularized linear regression has no unique solution (perfect multicollinearity). Drop one category (drop="first") to make it the baseline. Regularized models and trees don't need this.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is target encoding, why can it leak, and how do you prevent it?</summary><div class="qa-body">It replaces a category with the mean target for that category. If computed on the same rows it encodes, each row's own label is inside its feature, so the model looks better than it is (on pure noise the AUC rose from 0.5 to 0.78). Prevent it with out-of-fold (cross-fitted) encoding inside the pipeline, and smooth rare categories towards the global mean with (n·mean + m·global)/(n + m).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you handle a categorical feature with thousands of levels?</summary><div class="qa-body">Options: smoothed out-of-fold target encoding; hashing into a fixed number of columns; grouping rare levels into "other" (min_frequency); count encoding; using a model with native categorical support such as CatBoost or LightGBM; or learnt embeddings in a neural network. Plain one-hot would create thousands of sparse columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain MCAR, MAR and MNAR.</summary><div class="qa-body">MCAR: missingness is unrelated to any value, so the observed rows are a fair sample. MAR: missingness depends on other observed columns, so imputation that uses those columns removes the bias. MNAR: missingness depends on the missing value itself (old buildings leaving age blank), so no imputation fully fixes it; add a missing indicator so the model can use the fact that it is missing. You need domain knowledge to tell them apart.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the ways to handle missing values, and their trade-offs?</summary><div class="qa-body">Drop rows (only for a few MCAR blanks; otherwise biased and wasteful). Mean/median/mode fill (simple, shrinks variance, ignores other columns). KNN imputation (uses similar rows, costly on big data). Iterative/MICE imputation (regresses each column on the others, best for MAR with correlated columns). Missing indicator (lets the model learn what missingness means). Native NaN handling in many boosting libraries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you detect and treat outliers?</summary><div class="qa-body">Detect with the IQR rule (outside Q1 − 1.5·IQR or Q3 + 1.5·IQR), robust z-scores using median and MAD, or model-based anomaly detection; plain z-scores can miss outliers because outliers inflate the std (masking). Treat by fixing errors, clipping to fences or percentiles, log-transforming, using robust losses or tree models, or modelling a different kind of case separately. Never remove outliers from the test set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why encode month or hour with sine and cosine?</summary><div class="qa-body">Because they are cyclical: December and January are adjacent but 11 apart as numbers. Placing values on a circle with sin and cos of 2π·value/period makes neighbours close (Dec–Jan distance 0.518 versus 1.932 for Jan–Jun). Linear and distance-based models need it; trees can work with the raw value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is TF-IDF?</summary><div class="qa-body">A way to turn text into numbers: each word's count in a document (term frequency) is multiplied by its inverse document frequency, which is high for words that appear in few documents and low for words that appear everywhere; each row is then normalised to length 1. Common words like "flat" get low weight and distinctive words like "metro" high weight.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When are interaction or polynomial features useful?</summary><div class="qa-body">When the effect of one feature depends on another (revenue = price × quantity) or the relationship is curved, and the model is linear. Trees and neural networks find interactions themselves. Degree-2 expansion of d features gives (d + 1)(d + 2)/2 columns, so scale first and regularize afterwards; hand-picked domain ratios often beat brute-force expansion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle an imbalanced classification problem?</summary><div class="qa-body">First use the right metrics (precision, recall, F1, PR-AUC, not accuracy). Then options are class weights, oversampling, undersampling or SMOTE (on training folds only), and above all choosing the decision threshold from the business cost of errors. In practice these fixes mostly move the threshold: recall rose from 0.46 to 0.86 while ROC-AUC stayed about 0.946.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does SMOTE do, and what can go wrong?</summary><div class="qa-body">It creates synthetic minority examples by interpolating between a minority point and one of its nearest minority neighbours: x + u·(neighbour − x). It can create unrealistic points in overlapping or noisy regions, it distorts predicted probabilities, and applying it before the train/test split leaks near-copies into the test set and inflates scores.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between fit, transform and fit_transform?</summary><div class="qa-body">fit learns parameters from data (means, categories, fill values, vocabularies), transform applies those learnt parameters to any data, and fit_transform does both on the same data. Call fit or fit_transform on training data only, and transform on validation, test and production data, so no information from those rows leaks into training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A feature makes your validation score jump from 0.75 to 0.99. What do you suspect?</summary><div class="qa-body">Leakage. Check whether the feature would be known at prediction time (no future information such as final price or days on market), whether it was computed using the target on the same rows (naive target encoding, aggregates over the full dataset), and whether any preprocessing was fitted before the split. Real features rarely produce such jumps.</div></details>
</main>
`
});
