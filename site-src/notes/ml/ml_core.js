// ml/ml_core.js — Core Concepts
Object.assign(TOPIC_CONTENT, {
  "ml_core": `<main>
  <h1>Core Concepts</h1>
  <p class="lead">The ideas behind every model you will train: the bias–variance trade-off, over- and underfitting, regularisation, cross-validation, data leakage, and the preprocessing (features, scaling, encoding) that scikit-learn Pipelines keep leak-free. Builds on ML Basics.</p>

  <h2 id="mc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Core Concepts</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Bias–variance</div>
        <ul>
          <li><b>E[(y − f̂)²] = Bias² + Variance + σ²</b></li>
          <li><b>Bias</b> — avg prediction vs truth over many training sets; systematic, stays with more data</li>
          <li><b>Variance</b> — how much f̂ changes between training sets; σ² irreducible</li>
          <li>Complexity ↑ → bias ↓, variance ↑ → U-shaped test error (deg 15: variance 5.09)</li>
          <li>💡 Archery: tight cluster off-centre = bias; scattered around centre = variance</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Under / overfitting</div>
        <ul>
          <li><b>Underfit</b> — train high, val high, small gap → more features/complexity, less λ</li>
          <li><b>Overfit</b> — train low, val high, big gap → more data, more λ, simpler, early stop</li>
          <li>Poly demo: deg 1 val 0.323 · deg 4 0.139 · deg 15 train 0.056 / val 10.2</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regularisation</div>
        <ul>
          <li><b>L2 / Ridge</b> — +λΣw²; shrinks all, none to 0; stable with correlated features</li>
          <li><b>L1 / Lasso</b> — +λΣ|w|; exact zeros = feature selection (5/50 kept in demo)</li>
          <li><b>Why zeros</b> — L1 ball is a diamond with corners on axes; contours hit corners</li>
          <li><b>Elastic Net</b> — both · ⚠ Lasso keeps one of correlated twins arbitrarily; tune α by CV</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cross-validation</div>
        <ul>
          <li><b>K-fold</b> — K fits, each row validated once; mean ± std</li>
          <li><b>Stratified</b> — same class ratio per fold (sorted labels: [10,0,0,0,0] vs [2,2,2,2,2])</li>
          <li><b>TimeSeriesSplit</b> — train always before val</li>
          <li><b>GroupKFold</b> — same patient/user never in both sides</li>
          <li><b>Nested</b> — inner tunes, outer scores; noise data: 0.58 non-nested vs 0.50 nested</li>
          <li>⚠ Best GridSearch score is optimistic; report nested CV or an untouched test set</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data leakage</div>
        <ul>
          <li><b>Contamination</b> — scaler/selector/imputer fit on all rows (noise: 0.85 vs 0.48)</li>
          <li><b>Target leakage</b> — post-event feature (refund_issued: 0.978 vs 0.822)</li>
          <li><b>Temporal</b> — shuffled time split, future aggregates; <b>group</b> — same entity both sides</li>
          <li><b>Target encoding w/o CV</b> — noise AUC 0.777 vs 0.495 cross-fitted</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Features &amp; scaling</div>
        <ul>
          <li><b>FE</b> — date parts, ratios, log1p, bins, group aggregates, interactions, lags, missing flags</li>
          <li><b>Standard</b> — (x − μ)/σ; <b>MinMax</b> — [0, 1]; <b>Robust</b> — median/IQR, outlier-proof</li>
          <li><b>Power/Quantile</b> — fix skew for linear models</li>
          <li><b>Need scaling</b> — KNN, SVM, KMeans, PCA, regularised linear, neural nets (KNN 0.691 → 0.949)</li>
          <li><b>No scaling</b> — trees, forests, boosting (0.888 both ways)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Encoding</div>
        <ul>
          <li><b>One-hot</b> — nominal, low cardinality; <code>handle_unknown="ignore"</code></li>
          <li><b>Ordinal</b> — ordered categories (S &lt; M &lt; L); fine for trees</li>
          <li><b>LabelEncoder</b> — for y only, not features</li>
          <li><b>High cardinality</b> — <code>min_frequency</code> (994 → 121 cols), target encoding (cross-fitted), hashing, embeddings, native categorical in LightGBM/CatBoost</li>
          <li>⚠ Ordinal codes in a linear model invent a fake order</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pipelines</div>
        <ul>
          <li><b>Pipeline</b> — chain steps; <code>fit</code> learns each step on training data only</li>
          <li><b>ColumnTransformer</b> — different prep per column group (num: impute+scale, cat: one-hot)</li>
          <li><b>Why</b> — no leakage in CV, one object to tune (<code>step__param</code>) and ship</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mc-bv"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Bias–Variance Trade-off</span><span class="rm-sub">The U-curve, with numbers</span></div></div>
      <div class="rm-item rm-done" data-target="mc-fit"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Under- &amp; Overfitting</span><span class="rm-sub">Polynomial demo, diagnosis</span></div></div>
      <div class="rm-item rm-done" data-target="mc-reg"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Regularisation</span><span class="rm-sub">L1 vs L2, geometrically</span></div></div>
      <div class="rm-item rm-done" data-target="mc-cv"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Cross-Validation</span><span class="rm-sub">K-fold, stratified, time, nested</span></div></div>
      <div class="rm-item rm-done" data-target="mc-leak"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Data Leakage</span><span class="rm-sub">Fake scores, real demos</span></div></div>
      <div class="rm-item rm-done" data-target="mc-fe"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Feature Engineering</span><span class="rm-sub">Raw columns → signal</span></div></div>
      <div class="rm-item rm-done" data-target="mc-scale"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Feature Scaling</span><span class="rm-sub">Which scaler, which models</span></div></div>
      <div class="rm-item rm-done" data-target="mc-enc"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Categorical Encoding</span><span class="rm-sub">One-hot, ordinal, high-cardinality</span></div></div>
      <div class="rm-item rm-done" data-target="mc-pipe"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Pipelines &amp; ColumnTransformer</span><span class="rm-sub">Leak-proof by construction</span></div></div>
      <div class="rm-item rm-done" data-target="mc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mc-bv"><span class="num">01</span>Bias–Variance Trade-off</h2>
  <figure class="viz"><svg viewBox="0 0 560 210" width="560">
    <line x1="50" y1="175" x2="530" y2="175" stroke="currentColor" opacity="0.5"/><line x1="50" y1="175" x2="50" y2="15" stroke="currentColor" opacity="0.5"/>
    <text x="290" y="200" text-anchor="middle" class="tm">model complexity →</text><text x="14" y="95" class="tm" transform="rotate(-90 14 95)">error</text>
    <line x1="55" y1="152" x2="525" y2="152" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/><text x="520" y="147" text-anchor="end" class="tm">noise σ²</text>
    <path d="M60 30 C 150 140, 300 165, 520 170" fill="none" class="sb" stroke-width="2"/>
    <path d="M60 170 C 300 168, 430 150, 520 45" fill="none" class="sr" stroke-width="2"/>
    <path d="M60 22 Q 285 205 520 22" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <line x1="285" y1="20" x2="285" y2="175" class="sg" stroke-dasharray="3 3"/>
    <text x="125" y="128" class="tb">bias²</text><text x="500" y="88" text-anchor="end" class="tr">variance</text>
    <text x="300" y="100">total error</text><text x="285" y="15" text-anchor="middle" class="tg">sweet spot</text>
    <text x="70" y="192" class="tm">underfit</text><text x="520" y="192" text-anchor="end" class="tm">overfit</text>
  </svg><figcaption>As complexity grows, bias falls and variance rises. Test error is their sum (plus noise), so it is U-shaped.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>E[(y − f̂(x))²] = Bias[f̂(x)]² + Var[f̂(x)] + σ²</code>. <strong>Bias</strong> = E[f̂(x)] − f(x): how far the <em>average</em> model (over many training sets) is from the truth. <strong>Variance</strong> = how much f̂ changes from one training set to another. σ² is noise no model removes.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 138" width="560">
    <g fill="none" stroke="currentColor" opacity="0.5">
      <circle cx="70" cy="60" r="40"/><circle cx="70" cy="60" r="26"/><circle cx="70" cy="60" r="12"/>
      <circle cx="210" cy="60" r="40"/><circle cx="210" cy="60" r="26"/><circle cx="210" cy="60" r="12"/>
      <circle cx="350" cy="60" r="40"/><circle cx="350" cy="60" r="26"/><circle cx="350" cy="60" r="12"/>
      <circle cx="490" cy="60" r="40"/><circle cx="490" cy="60" r="26"/><circle cx="490" cy="60" r="12"/>
    </g>
    <g class="fb sb"><circle cx="68" cy="58" r="3.5"/><circle cx="73" cy="62" r="3.5"/><circle cx="70" cy="55" r="3.5"/><circle cx="66" cy="63" r="3.5"/><circle cx="74" cy="57" r="3.5"/></g>
    <g class="fr sr"><circle cx="190" cy="40" r="3.5"/><circle cx="232" cy="52" r="3.5"/><circle cx="205" cy="88" r="3.5"/><circle cx="222" cy="78" r="3.5"/><circle cx="193" cy="70" r="3.5"/></g>
    <g class="fb sb"><circle cx="370" cy="38" r="3.5"/><circle cx="375" cy="42" r="3.5"/><circle cx="368" cy="44" r="3.5"/><circle cx="377" cy="36" r="3.5"/><circle cx="372" cy="47" r="3.5"/></g>
    <g class="fr sr"><circle cx="512" cy="36" r="3.5"/><circle cx="525" cy="62" r="3.5"/><circle cx="498" cy="30" r="3.5"/><circle cx="520" cy="45" r="3.5"/><circle cx="505" cy="52" r="3.5"/></g>
    <g text-anchor="middle"><text x="70" y="116" class="tg">low bias</text><text x="70" y="130" class="tg">low var</text><text x="210" y="116">low bias</text><text x="210" y="130" class="tr">high var</text><text x="350" y="116" class="tr">high bias</text><text x="350" y="130">low var</text><text x="490" y="116" class="tr">high bias</text><text x="490" y="130" class="tr">high var</text></g>
  </svg><figcaption>Each dot = a model trained on a different sample. Bias = where the cluster sits; variance = its spread.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An archer: arrows tightly grouped but off-centre = bias (a bent sight). Arrows centred on average but scattered = variance (shaky hands).</p>
  </div>
  <p>Measure it for real: train the same model on 200 fresh samples of 30 noisy points from <code>sin(2πx)</code> (σ² = 0.09).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(2)
f = lambda x: np.sin(2 * np.pi * x)
x_test = np.linspace(0.05, 0.95, 50)[:, None]
for d in [1, 4, 15]:
    preds = []
    for _ in range(200):                              # 200 different training sets
        x = rng.uniform(0, 1, 30)
        y = f(x) + rng.normal(0, 0.3, 30)
        m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression()).fit(x[:, None], y)
        preds.append(m.predict(x_test))
    P = np.array(preds)
    bias2 = ((P.mean(0) - f(x_test[:, 0])) ** 2).mean()
    var = P.var(0).mean()
    print(f"degree {d:2d}: bias^2={bias2:.3f}  variance={var:.3f}  + noise 0.090")</div>
  <div class="fx" data-lang="text">degree  1: bias^2=0.153  variance=0.020  + noise 0.090
degree  4: bias^2=0.003  variance=0.019  + noise 0.090
degree 15: bias^2=0.005  variance=5.094  + noise 0.090</div>
  <p>A line is consistently wrong (bias). Degree 15 is right on average but wildly different per sample (variance). Degree 4 wins.</p>

  <h2 id="mc-fit"><span class="num">02</span>Under- &amp; Overfitting</h2>
  <div class="fx" data-lang="py">from sklearn.metrics import mean_squared_error as mse
rng = np.random.default_rng(1)
def sample(n):
    x = rng.uniform(0, 1, n)
    return x[:, None], f(x) + rng.normal(0, 0.3, n)
X_tr, y_tr = sample(20)
X_val, y_val = sample(200)
for d in [1, 4, 15]:
    m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression()).fit(X_tr, y_tr)
    print(f"degree {d:2d}: train MSE={mse(y_tr, m.predict(X_tr)):.3f}  val MSE={mse(y_val, m.predict(X_val)):.3f}")</div>
  <div class="fx" data-lang="text">degree  1: train MSE=0.164  val MSE=0.323
degree  4: train MSE=0.076  val MSE=0.139
degree 15: train MSE=0.056  val MSE=10.165</div>
  <div class="cards">
    <div><b>Underfitting (high bias)</b><p>Train error high, val error high, small gap.</p><small>Fix: more features, more complex model, less regularisation, train longer</small></div>
    <div><b>Good fit</b><p>Both low, val ≈ train.</p><small>Ship it (after one test-set check)</small></div>
    <div><b>Overfitting (high variance)</b><p>Train low, val much higher.</p><small>Fix: more data, more regularisation, simpler model, early stopping, bagging</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Diagnose first: more data can't fix bias (a line stays a line). Degree 15 had the <em>best</em> training error and the worst validation error.</p>
  </div>

  <h2 id="mc-reg"><span class="num">03</span>Regularisation</h2>
  <figure class="viz"><svg viewBox="0 0 560 225" width="560">
    <g stroke="currentColor" opacity="0.4"><line x1="50" y1="130" x2="230" y2="130"/><line x1="130" y1="30" x2="130" y2="195"/><line x1="330" y1="130" x2="510" y2="130"/><line x1="410" y1="30" x2="410" y2="195"/></g>
    <polygon points="130,80 180,130 130,180 80,130" class="fb sb"/>
    <circle cx="410" cy="130" r="50" class="fb sb"/>
    <g fill="none" class="sr"><ellipse cx="200" cy="45" rx="89.6" ry="56"/><ellipse cx="200" cy="45" rx="54" ry="34"/><ellipse cx="200" cy="45" rx="20" ry="12.5"/>
      <ellipse cx="480" cy="45" rx="80.1" ry="50.1"/><ellipse cx="480" cy="45" rx="48" ry="30"/><ellipse cx="480" cy="45" rx="18" ry="11"/></g>
    <circle cx="200" cy="45" r="3" class="fr sr"/><circle cx="480" cy="45" r="3" class="fr sr"/>
    <circle cx="130" cy="80" r="5" class="fg sg"/><circle cx="431" cy="85" r="5" class="fg sg"/>
    <text x="112" y="92" text-anchor="end" class="tg">w₁ = 0</text><text x="395" y="72" text-anchor="end" class="tg">w₁, w₂ ≠ 0</text>
    <text x="212" y="42" class="tr">OLS</text><text x="492" y="42" class="tr">OLS</text>
    <text x="235" y="134" class="tm">w₁</text><text x="136" y="196" class="tm">w₂</text>
    <text x="130" y="218" text-anchor="middle">L1 / Lasso: diamond</text><text x="410" y="218" text-anchor="middle">L2 / Ridge: circle</text>
  </svg><figcaption>Loss contours (red) expand from the unregularised optimum until they touch the allowed region (blue). The diamond is touched at a corner, where a weight is exactly 0.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>L2 Ridge</th><th>L1 Lasso</th><th>Elastic Net</th></tr>
    <tr><td>Penalty</td><td>λΣw²</td><td>λΣ|w|</td><td>λ₁Σ|w| + λ₂Σw²</td></tr>
    <tr><td>Penalty gradient</td><td>2λw: shrinks big weights most</td><td>λ·sign(w): constant push to 0</td><td>Both</td></tr>
    <tr><td>Exact zeros?</td><td>No</td><td>Yes → feature selection</td><td>Yes</td></tr>
    <tr><td>Correlated features</td><td>Shares weight, stable</td><td>Keeps one arbitrarily</td><td>Groups them</td></tr>
    <tr><td>Use when</td><td>Most features matter a bit</td><td>Few features matter</td><td>Many, correlated, some useless</td></tr>
  </table>
  <div class="fx" data-lang="py">from sklearn.datasets import make_regression
from sklearn.linear_model import Ridge, Lasso, LinearRegression, LassoCV
X, y = make_regression(n_samples=100, n_features=50, n_informative=5, noise=10, random_state=0)
for m in [LinearRegression(), Ridge(alpha=10), Lasso(alpha=5)]:
    m.fit(X, y)
    print(f"{type(m).__name__:16s} non-zero coefs={np.sum(np.abs(m.coef_) &gt; 1e-6):2d}/50  max|w|={np.abs(m.coef_).max():.1f}")
cv = LassoCV(cv=5, random_state=0).fit(X, y)
print(f"LassoCV best alpha={cv.alpha_:.2f}, kept {np.sum(cv.coef_ != 0)}/50")</div>
  <div class="fx" data-lang="text">LinearRegression non-zero coefs=50/50  max|w|=68.1
Ridge            non-zero coefs=50/50  max|w|=57.2
Lasso            non-zero coefs= 5/50  max|w|=61.3
LassoCV best alpha=1.53, kept 6/50</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Regularisation penalises weight size, so unscaled features are penalised unfairly: scale first. In sklearn <code>alpha</code> = λ (bigger = stronger) but LogisticRegression/SVC use <code>C</code> = 1/λ (bigger = weaker).</p>
  </div>

  <h2 id="mc-cv"><span class="num">04</span>Cross-Validation</h2>
  <figure class="viz"><svg viewBox="0 0 560 160" width="560">
    <text x="20" y="16">5-fold CV</text><text x="300" y="16">TimeSeriesSplit</text>
    <rect x="20" y="26" width="240" height="18" class="fb sb"/><rect x="20" y="26" width="48" height="18" class="fg sg"/>
    <rect x="20" y="50" width="240" height="18" class="fb sb"/><rect x="68" y="50" width="48" height="18" class="fg sg"/>
    <rect x="20" y="74" width="240" height="18" class="fb sb"/><rect x="116" y="74" width="48" height="18" class="fg sg"/>
    <rect x="20" y="98" width="240" height="18" class="fb sb"/><rect x="164" y="98" width="48" height="18" class="fg sg"/>
    <rect x="20" y="122" width="240" height="18" class="fb sb"/><rect x="212" y="122" width="48" height="18" class="fg sg"/>
    <rect x="300" y="26" width="60" height="18" class="fb sb"/><rect x="360" y="26" width="60" height="18" class="fg sg"/><rect x="420" y="26" width="120" height="18" fill="none" stroke="currentColor" stroke-opacity="0.3"/>
    <rect x="300" y="50" width="120" height="18" class="fb sb"/><rect x="420" y="50" width="60" height="18" class="fg sg"/><rect x="480" y="50" width="60" height="18" fill="none" stroke="currentColor" stroke-opacity="0.3"/>
    <rect x="300" y="74" width="180" height="18" class="fb sb"/><rect x="480" y="74" width="60" height="18" class="fg sg"/>
    <g stroke="currentColor" stroke-opacity="0.35"><line x1="68" y1="26" x2="68" y2="140"/><line x1="116" y1="26" x2="116" y2="140"/><line x1="164" y1="26" x2="164" y2="140"/><line x1="212" y1="26" x2="212" y2="140"/></g>
    <text x="300" y="116" class="tm">time →  train grows,</text><text x="300" y="132" class="tm">validation is always later</text>
    <rect x="300" y="142" width="12" height="10" class="fb sb"/><text x="316" y="151" class="tm">train</text><rect x="370" y="142" width="12" height="10" class="fg sg"/><text x="386" y="151" class="tm">validate</text>
  </svg><figcaption>K-fold: every row is validated exactly once; report mean ± std. Time series: never train on the future.</figcaption></figure>
  <div class="fx" data-lang="py">from sklearn.model_selection import KFold, StratifiedKFold, TimeSeriesSplit
y = np.array([1]*10 + [0]*90)                  # 10% positives, sorted (as exports often are)
X = np.zeros((100, 1))
for name, cv in [("KFold(no shuffle)", KFold(5)), ("StratifiedKFold", StratifiedKFold(5, shuffle=True, random_state=0))]:
    print(f"{name:18s} positives per val fold:", [int(y[v].sum()) for _, v in cv.split(X, y)])
for tr, va in TimeSeriesSplit(n_splits=3).split(np.arange(12)):
    print("train", tr.min(), "-", tr.max(), "| val", va.min(), "-", va.max())</div>
  <div class="fx" data-lang="text">KFold(no shuffle)  positives per val fold: [10, 0, 0, 0, 0]
StratifiedKFold    positives per val fold: [2, 2, 2, 2, 2]
train 0 - 2 | val 3 - 5
train 0 - 5 | val 6 - 8
train 0 - 8 | val 9 - 11</div>
  <p><code>KFold</code>: regression / balanced data. <code>StratifiedKFold</code>: classification (the default in <code>cross_val_score</code>). <code>TimeSeriesSplit</code>: ordered data. <code>GroupKFold</code>: several rows per patient or user, kept on one side.</p>
  <h3>Nested CV: honest score while tuning</h3>
  <div class="fx" data-lang="py">from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.svm import SVC
rng = np.random.default_rng(0)
X, y = rng.normal(size=(100, 20)), rng.integers(0, 2, 100)   # pure noise: true accuracy = 0.5
grid = {"C": np.logspace(-2, 3, 12), "gamma": np.logspace(-4, 1, 12)}  # 144 combos
inner = StratifiedKFold(3, shuffle=True, random_state=0)
outer = StratifiedKFold(5, shuffle=True, random_state=1)
gs = GridSearchCV(SVC(), grid, cv=inner).fit(X, y)
print("non-nested best CV score:", round(gs.best_score_, 3))
print("nested CV score:         ", round(cross_val_score(GridSearchCV(SVC(), grid, cv=inner), X, y, cv=outer).mean(), 3))</div>
  <div class="fx" data-lang="text">non-nested best CV score: 0.58
nested CV score:          0.5</div>
  <p>Picking the best of 144 tries on the same folds finds lucky noise (0.58). The outer loop never influenced tuning, so it reports the truth (0.50).</p>

  <h2 id="mc-leak"><span class="num">05</span>Data Leakage</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Leakage</strong>: information that won't exist at prediction time gets into training. Validation looks great; production collapses. Confidently wrong models.</p>
  </div>
  <table class="tbl">
    <tr><th>Type</th><th>Example</th><th>Fix</th></tr>
    <tr><td><strong>Train–test contamination</strong></td><td>Scaler, imputer, feature selector fit on all rows</td><td>Fit inside a Pipeline</td></tr>
    <tr><td><strong>Target leakage</strong></td><td>"refund_issued" to predict churn; "on_antibiotics" to predict infection</td><td>Keep only features known before the event</td></tr>
    <tr><td><strong>Temporal</strong></td><td>Random split on time data; actual weather to predict yesterday's demand (prod only has a forecast)</td><td>Split by time; use as-of data</td></tr>
    <tr><td><strong>Group</strong></td><td>Same patient's scans in train and test</td><td>GroupKFold / split by entity</td></tr>
    <tr><td><strong>Target encoding w/o CV</strong></td><td>Category mean of y computed on all rows</td><td>Cross-fitted <code>TargetEncoder</code></td></tr>
    <tr><td><strong>ID / artefact</strong></td><td>Row ID, file name, timestamp correlated with label</td><td>Drop; check top feature importances</td></tr>
  </table>
  <div class="fx" data-lang="py">from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
rng = np.random.default_rng(0)
X = rng.normal(size=(100, 5000))          # 5,000 random features
y = rng.integers(0, 2, 100)               # random labels: nothing to learn

# LEAKY: pick the 20 "best" features using ALL rows, then cross-validate
X_sel = SelectKBest(f_classif, k=20).fit_transform(X, y)
print("leaky CV accuracy:", cross_val_score(LogisticRegression(), X_sel, y, cv=5).mean().round(3))

# CORRECT: selection inside the pipeline -> refit on each training fold only
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
print("pipeline CV accuracy:", cross_val_score(pipe, X, y, cv=5).mean().round(3))</div>
  <div class="fx" data-lang="text">leaky CV accuracy: 0.85
pipeline CV accuracy: 0.48</div>
  <p>Pure noise scored 85% because the selector had already seen the validation labels. Target leakage looks the same:</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.ensemble import RandomForestClassifier
# df: 2,000 synthetic customers (tenure, tickets, churn ~15–20%); setup omitted
df["refund_issued"] = df.churn &amp; (rng.random(n) &lt; 0.9)   # only known AFTER churn happens
for cols in [["tenure", "tickets", "refund_issued"], ["tenure", "tickets"]]:
    Xtr, Xte, ytr, yte = train_test_split(df[cols], df.churn, random_state=0, stratify=df.churn)
    print(f"{'+'.join(cols):30s} test acc={RandomForestClassifier(random_state=0).fit(Xtr, ytr).score(Xte, yte):.3f}")
print("always 'no churn' acc =", round(1 - df.churn.mean(), 3))</div>
  <div class="fx" data-lang="text">tenure+tickets+refund_issued   test acc=0.978
tenure+tickets                 test acc=0.822
always 'no churn' acc = 0.846</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Red flags: a too-good score, one feature dominating importance, a big validation → production drop. Ask of every column: "would I know this at prediction time?"</p>
  </div>

  <h2 id="mc-fe"><span class="num">06</span>Feature Engineering</h2>
  <p>Turn raw columns into signals. Usually the highest-leverage work: simple model + good features beats complex model + raw ones.</p>
  <div class="fx" data-lang="py">tx = pd.DataFrame({
    "user": ["a", "a", "b", "b", "b"],
    "ts": pd.to_datetime(["2024-05-03 09:10", "2024-05-04 23:50", "2024-05-04 13:00",
                          "2024-05-05 02:15", "2024-05-05 02:20"]),
    "amount": [120, 80, 15, 900, 950],
    "income": [5000, 5000, 1200, 1200, 1200]})
tx["hour"] = tx.ts.dt.hour                                  # date parts
tx["is_night"] = tx.hour.isin(range(0, 6)).astype(int)      # domain flag
tx["log_amount"] = np.log1p(tx.amount).round(2)             # tame skew
tx["amt_to_income"] = (tx.amount / tx.income).round(3)      # ratio
tx["user_avg_amt"] = tx.groupby("user").amount.transform("mean").round(1)   # aggregate
print(tx.drop(columns=["ts", "income"]).to_string(index=False))</div>
  <div class="fx" data-lang="text">user  amount  hour  is_night  log_amount  amt_to_income  user_avg_amt
   a     120     9         0        4.80          0.024         100.0
   a      80    23         0        4.39          0.016         100.0
   b      15    13         0        2.77          0.012         621.7
   b     900     2         1        6.80          0.750         621.7
   b     950     2         1        6.86          0.792         621.7</div>
  <table class="tbl">
    <tr><th>Technique</th><th>Helps when</th></tr>
    <tr><td>Date parts, holidays, cyclical sin/cos of hour</td><td>Behaviour depends on time</td></tr>
    <tr><td>Ratios, differences</td><td>The relationship matters more than raw size (debt / income)</td></tr>
    <tr><td>log1p / power transform</td><td>Right-skewed money, counts (for linear models)</td></tr>
    <tr><td>Binning</td><td>Non-linear effect in a linear model (age bands)</td></tr>
    <tr><td>Group aggregates, lags, rolling stats</td><td>Entity history (user's average spend, last-7-day sales)</td></tr>
    <tr><td>Interactions; missing-value flags</td><td>Effects combine (price × discount); "missing" is itself informative</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>user_avg_amt</code> above averages over <em>all</em> of user b's rows, including later ones. For a fraud model scoring the 02:15 transaction that is future data: compute aggregates from past rows only (expanding / shifted windows).</p>
  </div>

  <h2 id="mc-scale"><span class="num">07</span>Feature Scaling</h2>
  <div class="fx" data-lang="py">from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
x = np.array([[20], [25], [30], [35], [500]])        # incomes in k; one CEO
for s in [StandardScaler(), MinMaxScaler(), RobustScaler()]:
    print(f"{type(s).__name__:15s}", s.fit_transform(x).ravel().round(2))</div>
  <div class="fx" data-lang="text">StandardScaler  [-0.54 -0.51 -0.49 -0.46  2.  ]
MinMaxScaler    [0.   0.01 0.02 0.03 1.  ]
RobustScaler    [-1.  -0.5  0.   0.5 47. ]</div>
  <table class="tbl">
    <tr><th>Scaler</th><th>Formula</th><th>Use / avoid</th></tr>
    <tr><td><strong>StandardScaler</strong></td><td>(x − mean) / std</td><td>Default for roughly bell-shaped data; one outlier inflates std</td></tr>
    <tr><td><strong>MinMaxScaler</strong></td><td>(x − min) / (max − min)</td><td>Bounded, clean features, pixel values; one outlier squashes the rest near 0</td></tr>
    <tr><td><strong>RobustScaler</strong></td><td>(x − median) / IQR</td><td>Outliers present: normal rows keep their spread</td></tr>
    <tr><td><strong>Power / Quantile</strong></td><td>Yeo-Johnson; rank → normal</td><td>Skewed or heavy-tailed features into linear models (quantile loses outlier size)</td></tr>
  </table>
  <div class="fx" data-lang="py">from sklearn.datasets import load_wine
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
X, y = load_wine(return_X_y=True)          # proline ~ 300-1700, hue ~ 0.5-1.7
for name, m in [("KNN raw", KNeighborsClassifier()),
                ("KNN scaled", make_pipeline(StandardScaler(), KNeighborsClassifier())),
                ("Tree raw", DecisionTreeClassifier(random_state=0)),
                ("Tree scaled", make_pipeline(StandardScaler(), DecisionTreeClassifier(random_state=0)))]:
    print(f"{name:12s} CV acc={cross_val_score(m, X, y, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">KNN raw      CV acc=0.691
KNN scaled   CV acc=0.949
Tree raw     CV acc=0.888
Tree scaled  CV acc=0.888</div>
  <div class="cards">
    <div><b>Needs scaling</b><p>KNN, SVM, KMeans, PCA, regularised linear/logistic, neural nets</p><small>Distances, penalties, gradient descent see raw magnitudes (rupees swamp room counts)</small></div>
    <div><b>Doesn't care</b><p>Decision trees, random forests, gradient boosting, Naive Bayes</p><small>Splits are thresholds; monotone rescaling changes nothing</small></div>
  </div>

  <h2 id="mc-enc"><span class="num">08</span>Categorical Encoding</h2>
  <table class="tbl">
    <tr><th>Encoding</th><th>For</th><th>Watch out</th></tr>
    <tr><td><strong>One-hot</strong></td><td>Nominal, few categories; any model</td><td>Column explosion; <code>handle_unknown="ignore"</code> maps an unseen city to all zeros</td></tr>
    <tr><td><strong>Ordinal</strong></td><td>Ordered: <code>OrdinalEncoder(categories=[["S","M","L"]])</code> → 0, 1, 2; also OK for trees</td><td>Linear models read codes as distances: Pune(2) isn't "twice" Mumbai(1)</td></tr>
    <tr><td><strong>LabelEncoder</strong></td><td>The target y only</td><td>Not meant for feature columns</td></tr>
    <tr><td><strong>Target encoding</strong></td><td>High cardinality (zip, merchant)</td><td>Must be cross-fitted or it leaks</td></tr>
    <tr><td><strong>Frequency / hashing</strong></td><td>Huge or open-ended vocabularies</td><td>Hash collisions; frequency ties</td></tr>
    <tr><td><strong>Native / embeddings</strong></td><td>LightGBM, CatBoost, HistGradientBoosting; neural nets</td><td>Easiest at very high cardinality</td></tr>
  </table>
  <div class="fx" data-lang="py">from sklearn.preprocessing import OneHotEncoder, TargetEncoder
rng = np.random.default_rng(0)
X = pd.DataFrame({"zip": rng.choice([f"z{i}" for i in range(1000)], 5000)})  # 1,000 categories
y = (rng.random(5000) &lt; 0.3).astype(int)          # target is pure noise
print("one-hot columns:", OneHotEncoder().fit_transform(X).shape[1])
print("one-hot, min_frequency=8:", OneHotEncoder(min_frequency=8).fit_transform(X).shape[1])

naive = X.zip.map(pd.Series(y).groupby(X.zip).mean()).to_frame()   # mean target per zip, ALL rows
print("naive target-mean AUC:", cross_val_score(LogisticRegression(), naive, y, cv=5, scoring="roc_auc").mean().round(3))
pipe = make_pipeline(TargetEncoder(), LogisticRegression())          # cross-fitted inside each fold
print("TargetEncoder pipe AUC:", cross_val_score(pipe, X, y, cv=5, scoring="roc_auc").mean().round(3))</div>
  <div class="fx" data-lang="text">one-hot columns: 994
one-hot, min_frequency=8: 121
naive target-mean AUC: 0.777
TargetEncoder pipe AUC: 0.495</div>
  <p>With ~5 rows per zip, each row's own label drives its zip's mean, so noise looks predictive (0.777). sklearn's <code>TargetEncoder</code> encodes each row using other folds only.</p>

  <h2 id="mc-pipe"><span class="num">09</span>Pipelines &amp; ColumnTransformer</h2>
  <div class="flow"><span>Wrong: fit scaler on ALL rows</span><span>split</span><span>train</span><span>val score inflated</span></div>
  <div class="flow"><span>Right: split</span><span>fit scaler + model on train fold</span><span>transform val with train stats</span><span>honest score</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe card: every step, in order, learned from training ingredients only. The same card is used at serve time, so training and production can't drift apart.</p>
  </div>
  <div class="fx" data-lang="py">from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
# df: 1,000 synthetic loan applicants: income (10% NaN), age, city, job; y = default flag
num, cat = ["income", "age"], ["city", "job"]
pre = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), num),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat)])
model = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])

print("CV AUC:", cross_val_score(model, df, y, cv=5, scoring="roc_auc").mean().round(3))
model.fit(df, y)
print(model[:-1].get_feature_names_out())
new = pd.DataFrame({"income": [np.nan], "age": [30.0], "city": ["Goa"], "job": ["student"]})
print("P(default) for a new applicant:", model.predict_proba(new)[0, 1].round(3))</div>
  <div class="fx" data-lang="text">CV AUC: 0.871
['num__income' 'num__age' 'cat__city_Delhi' 'cat__city_Mumbai'
 'cat__city_Pune' 'cat__job_salaried' 'cat__job_self' 'cat__job_student']
P(default) for a new applicant: 0.971</div>
  <ul>
    <li><strong>Leak-proof CV</strong>: <code>cross_val_score(model, …)</code> refits imputer medians, scaler stats and categories on each training fold.</li>
    <li><strong>Tuning</strong>: grid keys reach inside with double underscores, e.g. <code>{"clf__C": [0.1, 1, 10]}</code>.</li>
    <li><strong>Serving</strong>: one object handles NaN income and unseen "Goa"; <code>joblib.dump</code> it. Unlisted columns are dropped unless <code>remainder="passthrough"</code>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling <code>fit_transform</code> on the test set refits the preprocessing on test data. Only ever <code>transform</code> (or <code>predict</code>) new data with a fitted pipeline.</p>
  </div>

  <h2 id="mc-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the bias–variance trade-off with its decomposition.</summary><div class="qa-body">Expected squared error = Bias² + Variance + σ². Bias: gap between the average prediction over many training sets and the truth (a line fit to a sine curve). Variance: how much predictions move between training sets (a degree-15 polynomial). σ²: irreducible noise. More flexibility lowers bias and raises variance, so test error is U-shaped.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Train error 0.02, validation error 0.25. What's wrong and what do you try?</summary><div class="qa-body">High variance (overfitting): large train–val gap. Try more data, stronger regularisation, a simpler model / fewer features, early stopping, bagging. If both errors were high and close, it would be bias: add features or complexity instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does L1 give exact zeros but L2 doesn't?</summary><div class="qa-body">As constrained optimisation, L1 limits weights to a diamond whose corners lie on the axes; elliptical loss contours usually first touch it at a corner, where some weights are 0. The L2 ball is round, so the touching point is almost never on an axis. With two near-duplicate features Lasso keeps one arbitrarily; Ridge shares weight stably; Elastic Net groups them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you use stratified, time-series, group and nested CV?</summary><div class="qa-body">Stratified: classification, especially imbalanced, so each fold has positives. TimeSeriesSplit: ordered data; train always precedes validation. GroupKFold: multiple rows per entity. Nested: you tune hyperparameters and need an unbiased estimate without a separate test set; inner loop tunes, outer loop scores.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You tuned 144 hyperparameter combos with 5-fold CV and report the best CV score. Problem?</summary><div class="qa-body">It's optimistically biased: you selected the max over many noisy estimates on the same folds. On pure noise this gave 0.58 instead of 0.50. Use nested CV or report on an untouched test set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>StandardScaler fit on all 1,000 rows, then 5-fold CV. Leakage? How bad?</summary><div class="qa-body">Yes, technically: validation folds influenced mean/std. For a plain scaler the inflation is usually small. For data-hungry steps (feature selection, target encoding, oversampling) it is huge: 0.85 vs 0.48 on noise. Same fix for all: put them in a Pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which models need feature scaling and which don't?</summary><div class="qa-body">Need: anything using distances, dot products, penalties or gradient descent: KNN (0.691 → 0.949 on wine), SVM, KMeans, PCA, regularised linear/logistic, neural nets. Don't: tree models (threshold splits are scale-invariant: 0.888 both ways), Naive Bayes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you encode a column with 50,000 merchant IDs?</summary><div class="qa-body">Not plain one-hot. Options: cross-fitted target encoding, frequency encoding, one-hot with <code>min_frequency</code>/<code>max_categories</code> grouping rare ones into "infrequent", feature hashing, learned embeddings, or native categorical handling (CatBoost, LightGBM). Always handle unseen IDs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a Pipeline with ColumnTransformer rather than preprocessing manually?</summary><div class="qa-body">Leak-proof CV (every step refit per fold), joint tuning of preprocessing and model, and one serving artefact that applies identical steps to new rows. Manual steps drift between training and production.</div></details>
</main>`
});
