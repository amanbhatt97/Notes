// ml/ml_core.js — Core Concepts
Object.assign(TOPIC_CONTENT, {
  "ml_core": `<main>
  <h1>Core Concepts</h1>
  <p class="lead">Why does a model that scores 99% in the notebook score 70% on real customers? This page answers that. It covers the ideas behind every model you will ever train: bias vs variance, under- and overfitting, regularisation (a fine on big weights), cross-validation (fair testing), data leakage (cheating by accident), and data prep (features, scaling, encoding) kept safe inside scikit-learn Pipelines. These are the most asked topics in DS interviews. Builds on ML Basics.</p>

  <h2 id="mc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Core Concepts</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Bias–variance</div>
        <ul>
          <li><b>E[(y − f̂)²] = Bias² + Variance + σ²</b> — expected test error splits into three parts</li>
          <li><b>Bias</b> — the average model is off from the truth (too simple); more data doesn't fix it</li>
          <li><b>Variance</b> — the model changes a lot when the training sample changes (too flexible)</li>
          <li><b>σ²</b> — noise; no model can remove it</li>
          <li>More complex → bias ↓, variance ↑ → test error is a U (deg 15: variance 5.09)</li>
          <li>💡 Exam: one shortcut trick = bias; memorised last year's paper = variance</li>
          <li>💡 Archer: tight group off-centre = bias; scattered around centre = variance</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Under / overfitting</div>
        <ul>
          <li><b>Underfit</b> — train bad, val bad, small gap → more features, more complex, less λ</li>
          <li><b>Overfit</b> — train great, val bad, big gap → more data, more λ, simpler, early stop</li>
          <li>Demo: deg 1 val 0.323 · deg 4 val 0.139 · deg 15 train 0.056 / val 10.2</li>
          <li>💡 Overfit = student who mugged up last year's answers</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regularisation</div>
        <ul>
          <li><b>Idea</b> — add a fine for big weights so the model stays simple; λ = how strict</li>
          <li><b>L2 / Ridge</b> — +λΣw²; shrinks all, none to 0; stable with twin features</li>
          <li><b>L1 / Lasso</b> — +λΣ|w|; makes exact zeros = picks features (5/50 kept in demo)</li>
          <li><b>Why zeros</b> — L1 region is a diamond; loss contours touch it at a corner (on an axis)</li>
          <li><b>Elastic Net</b> — both · ⚠ scale first; Lasso keeps one twin at random; tune α by CV</li>
          <li>⚠ sklearn <code>alpha</code> = λ (bigger = stricter) but <code>C</code> = 1/λ (bigger = looser)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cross-validation</div>
        <ul>
          <li><b>K-fold</b> — K fits, each row is validation once; report mean ± std</li>
          <li><b>Stratified</b> — same class ratio per fold (sorted labels: [10,0,0,0,0] vs [2,2,2,2,2])</li>
          <li><b>TimeSeriesSplit</b> — train always before val</li>
          <li><b>GroupKFold</b> — one patient/user never on both sides</li>
          <li><b>Nested</b> — inner loop tunes, outer loop scores; noise: 0.58 vs honest 0.50</li>
          <li>⚠ Best GridSearch score is too rosy; report nested CV or an untouched test set</li>
          <li>💡 Judge a batsman on 5 matches, not 1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data leakage</div>
        <ul>
          <li><b>Leakage</b> — info not available at prediction time sneaks into training</li>
          <li><b>Contamination</b> — scaler/selector/imputer fit on all rows (noise: 0.85 vs 0.48)</li>
          <li><b>Target leakage</b> — feature known only after the event (refund_issued: 0.978 vs 0.822)</li>
          <li><b>Temporal</b> — shuffled time split, future averages · <b>group</b> — same person both sides</li>
          <li><b>Target encoding without CV</b> — noise AUC 0.777 vs 0.495 cross-fitted</li>
          <li>💡 Exam paper leaked before the exam · Ask: "would I know this at prediction time?"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Features &amp; scaling</div>
        <ul>
          <li><b>FE</b> — date parts, ratios, log1p, bins, per-user averages, interactions, lags, missing flags</li>
          <li><b>Standard</b> — (x − μ)/σ · <b>MinMax</b> — to [0, 1] · <b>Robust</b> — median/IQR, ignores outliers</li>
          <li><b>Power/Quantile</b> — fix skew for linear models</li>
          <li><b>Need scaling</b> — KNN, SVM, KMeans, PCA, regularised linear, neural nets (KNN 0.691 → 0.949)</li>
          <li><b>No scaling</b> — trees, forests, boosting (0.888 both ways)</li>
          <li>💡 Rupees vs room count: without scaling, rupees shout over rooms</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Encoding</div>
        <ul>
          <li><b>One-hot</b> — one 0/1 column per category; few categories; <code>handle_unknown="ignore"</code></li>
          <li><b>Ordinal</b> — ordered categories (S &lt; M &lt; L) → 0, 1, 2; fine for trees</li>
          <li><b>LabelEncoder</b> — for y only, not features</li>
          <li><b>Many categories</b> — <code>min_frequency</code> (994 → 121 cols), target encoding (cross-fitted), hashing, embeddings, native in LightGBM/CatBoost</li>
          <li>⚠ Ordinal codes in a linear model invent a fake order</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pipelines</div>
        <ul>
          <li><b>Pipeline</b> — chain of steps; <code>fit</code> learns every step from training rows only</li>
          <li><b>ColumnTransformer</b> — different prep per column group (num: impute+scale, cat: one-hot)</li>
          <li><b>Why</b> — no leakage in CV, tune all in one place (<code>step__param</code>), ship one object</li>
          <li>💡 A recipe card used the same way in kitchen and restaurant</li>
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
  <p>You are preparing for exams using last year's papers. Two ways to fail:</p>
  <ul>
    <li><strong>(a)</strong> you only learn one shortcut trick. It is too simple, so you get many questions wrong in every exam, old or new.</li>
    <li><strong>(b)</strong> you memorise last year's exact answers. Perfect on old papers, lost on new questions. And if you had memorised a different year's paper, your answers would be completely different.</li>
  </ul>
  <p>In ML, (a) is called <strong>high bias</strong>: the model is too simple to capture the pattern. (b) is called <strong>high variance</strong>: the model learnt the noise of its training data, so it changes a lot when the data changes. Every model sits somewhere between these two. The job is to find the middle.</p>
  <p>A tiny example. A student's true marks are 50. We train two models, each on 5 different small samples of data, and record each model's guess.</p>
  <div class="fx" data-lang="py">import numpy as np
truth = 50                                   # real marks of a student
guesses_A = np.array([42, 43, 41, 42, 42])   # model A, trained on 5 different samples
guesses_B = np.array([35, 62, 48, 70, 36])   # model B, trained on the same 5 samples
for name, g in [("A", guesses_A), ("B", guesses_B)]:
    bias = g.mean() - truth
    var = g.var()
    print(f"model {name}: average guess={g.mean():.1f}  bias={bias:+.1f}  variance={var:.1f}  total sq. error={((g-truth)**2).mean():.1f}")</div>
  <div class="fx" data-lang="text">model A: average guess=42.0  bias=-8.0  variance=0.4  total sq. error=64.4
model B: average guess=50.2  bias=+0.2  variance=193.8  total sq. error=193.8</div>
  <p>Model A always says about 42. It is steady (variance 0.4) but always 8 marks too low (bias −8). Model B is right on average (bias 0.2) but its guesses jump from 35 to 70 (variance 194). Note that 64.4 ≈ 8² + 0.4 and 193.8 ≈ 0.2² + 193.8: the total error is bias squared plus variance. That is the whole formula, before any symbols.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An archer. Arrows close together but off-centre = bias (the sight is bent). Arrows centred on average but scattered = variance (shaky hands). Fixing the hands won't fix the sight.</p>
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
  </svg><figcaption>Each dot = a model trained on a different sample. Bias = where the group sits. Variance = how spread out it is.</figcaption></figure>
  <p>The centre of each target is the truth. Model A from the code is the third target (tight group, off-centre). Model B is the second (centred on average, scattered).</p>
  <h3>Why there is a trade-off</h3>
  <p>Making a model more flexible (more features, a higher-degree curve, a deeper tree) lets it follow the real pattern better, so bias falls. But a flexible model also follows the random noise in its particular sample, so variance rises. Test error is the sum of both, so it goes down, then back up. The best model is at the bottom of the U.</p>
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
  <p>Follow the blue line (bias) falling from left to right, and the red line (variance) rising. The black curve is their sum. The dashed line at the bottom is noise: error that stays even with a perfect model, because the data itself is a bit random.</p>
  <p>Now the same thing measured on real curves. The truth is a sine wave. We train a straight line (degree 1), a gentle curve (degree 4) and a very wiggly curve (degree 15), each on 200 fresh samples of 30 noisy points, and measure both parts.</p>
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
  <p>A straight line is wrong in the same way every time (bias 0.153). Degree 15 is right on average but changes wildly per sample (variance 5.09). Degree 4 is low on both, and wins.</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><code>E[(y − f̂(x))²] = Bias[f̂(x)]² + Var[f̂(x)] + σ²</code>. In words: the expected squared error on a new point = (how far the average model is from the truth)² + (how much the models differ from each other) + (noise nobody can remove). <strong>E[…]</strong> = the average over many training sets. <strong>f̂</strong> ("f-hat") = the trained model. <strong>σ²</strong> ("sigma squared") = the noise. It matters because the fix for each part is opposite: bias needs a richer model, variance needs a simpler one or more data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"More data" is not a universal fix. More data shrinks variance, but a straight line stays a straight line: bias does not move. First find out which one you have (next section).</p>
  </div>

  <h2 id="mc-fit"><span class="num">02</span>Under- &amp; Overfitting</h2>
  <p>The two exam failures from section 01 have names. <strong>Underfitting</strong>: the model is too simple to catch the pattern (high bias). <strong>Overfitting</strong>: it learns the noise of the training rows too, so it fails on new rows (high variance). You cannot see either by looking at the model. You spot them by comparing two scores: the error on the training rows, and the error on validation rows the model never saw.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Underfit = a student who read only chapter headings: fails practice and exam. Overfit = a student who mugged up last year's paper word for word: 100% on that paper, fails when questions change.</p>
  </div>
  <p>Same sine-wave data, now one training set of 20 points and one validation set of 200. MSE = mean squared error, the average squared miss (lower is better).</p>
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
  <p>Read each line as "practice marks vs exam marks". Degree 1: bad at both (underfit). Degree 4: good at both (just right). Degree 15: best on practice, terrible in the exam (overfit). The train score alone would have told you degree 15 was the best model.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <g stroke="currentColor" opacity="0.5"><line x1="20" y1="120" x2="170" y2="120"/><line x1="210" y1="120" x2="360" y2="120"/><line x1="400" y1="120" x2="550" y2="120"/></g>
    <g fill="currentColor" opacity="0.7"><circle cx="35" cy="80" r="3"/><circle cx="60" cy="40" r="3"/><circle cx="85" cy="55" r="3"/><circle cx="110" cy="95" r="3"/><circle cx="135" cy="105" r="3"/><circle cx="160" cy="70" r="3"/>
      <circle cx="225" cy="80" r="3"/><circle cx="250" cy="40" r="3"/><circle cx="275" cy="55" r="3"/><circle cx="300" cy="95" r="3"/><circle cx="325" cy="105" r="3"/><circle cx="350" cy="70" r="3"/>
      <circle cx="415" cy="80" r="3"/><circle cx="440" cy="40" r="3"/><circle cx="465" cy="55" r="3"/><circle cx="490" cy="95" r="3"/><circle cx="515" cy="105" r="3"/><circle cx="540" cy="70" r="3"/></g>
    <line x1="25" y1="60" x2="165" y2="90" class="sr" stroke-width="2"/>
    <path d="M220 85 C 240 20, 270 40, 300 95 S 340 110, 355 65" fill="none" class="sg" stroke-width="2"/>
    <path d="M415 80 C 425 20, 440 40, 440 40 S 450 70, 465 55 S 480 120, 490 95 S 505 90, 515 105 S 535 30, 540 70" fill="none" class="sr" stroke-width="2"/>
    <g text-anchor="middle"><text x="95" y="140" class="tr">underfit: misses the shape</text><text x="285" y="140" class="tg">good fit: follows the trend</text><text x="475" y="140" class="tr">overfit: hits every dot</text></g>
  </svg><figcaption>Same six points, three models. The right one passes through every point, including the noise, so it will be wrong on the next point.</figcaption></figure>
  <p>Look at the right panel: the curve bends to touch every dot. The middle panel ignores small wobbles and keeps the overall shape. That is the one that will work on new data.</p>
  <div class="cards">
    <div><b>Underfitting (high bias)</b><p>Train error high, val error high, small gap.</p><small>Fix: more features, more complex model, less regularisation, train longer</small></div>
    <div><b>Good fit</b><p>Both low, val ≈ train.</p><small>Ship it (after one test-set check)</small></div>
    <div><b>Overfitting (high variance)</b><p>Train low, val much higher.</p><small>Fix: more data, more regularisation, simpler model, early stopping, bagging</small></div>
  </div>
  <p>Two new words in the cards: <strong>regularisation</strong> is a fine on big weights (next section). <strong>Early stopping</strong> means stop training as soon as the validation error starts rising. <strong>Bagging</strong> averages many models trained on different samples (Trees page).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Find the problem before fixing it. More data can't fix bias (a line stays a line). Degree 15 had the <em>best</em> training error and the worst validation error.</p>
  </div>

  <h2 id="mc-reg"><span class="num">03</span>Regularisation</h2>
  <p>Why could degree 15 bend to every point? Because its weights were allowed to become huge. A huge positive weight next to a huge negative weight lets a curve swing up and down between two data points. If we could keep the weights small, the curve would stay calm.</p>
  <p>That is the whole idea of <strong>regularisation</strong>: add a fine to the loss for big weights. The model now has two goals at once, fit the data <em>and</em> keep weights small. A number called <strong>λ</strong> (lambda; sklearn calls it <code>alpha</code>) sets how strict the fine is. λ = 0 means no fine (plain OLS). A huge λ makes every weight 0, so the model just predicts the average.</p>
  <p>There are two popular ways to add up the fine. <strong>L2 / Ridge</strong> fines the <em>squares</em> of the weights. <strong>L1 / Lasso</strong> fines their <em>absolute values</em>. Here is the fine on three weights, worked out by hand:</p>
  <div class="fx" data-lang="py">import numpy as np
w = np.array([0.5, 3.0, -8.0])
for lam in [0, 0.1, 1]:
    ridge = (w**2).sum() * lam
    lasso = np.abs(w).sum() * lam
    print(f"lambda={lam:&lt;4} ridge fine={ridge:5.2f}   lasso fine={lasso:5.2f}")</div>
  <div class="fx" data-lang="text">lambda=0    ridge fine= 0.00   lasso fine= 0.00
lambda=0.1  ridge fine= 7.33   lasso fine= 1.15
lambda=1    ridge fine=73.25   lasso fine=11.50</div>
  <p>Ridge at λ = 1: 0.5² + 3² + 8² = 0.25 + 9 + 64 = 73.25. Lasso at λ = 1: 0.5 + 3 + 8 = 11.5. Notice that the −8 weight alone contributes 64 of the 73 ridge fine. Squaring means ridge hates the biggest weights most. Lasso treats every unit of weight the same.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A monthly budget. Ridge = every expense gets cut a little, the biggest ones most. Lasso = you cancel some subscriptions fully and keep only the few that matter.</p>
  </div>
  <p>That difference has a surprising effect: Lasso can make weights <em>exactly</em> zero, which means "this feature is switched off". Ridge only makes them small. The picture explains why.</p>
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
  </svg><figcaption>Red rings grow out from the best unpenalised weights until they touch the allowed zone (blue). The diamond gets touched at a corner, where one weight is exactly 0.</figcaption></figure>
  <p>How to read it: the two axes are two weights, w₁ and w₂. The red dot is where plain OLS would land. The blue shape is the "allowed zone" the fine creates: weights must stay inside it. The red rings are the loss growing as you move away from the OLS point. The answer is the first point where a ring touches the blue zone. The diamond has sharp corners on the axes, so the ring usually hits a corner, and at a corner one weight is exactly 0. The circle has no corners, so the touch point is almost never on an axis.</p>
  <table class="tbl">
    <tr><th></th><th>L2 Ridge</th><th>L1 Lasso</th><th>Elastic Net</th></tr>
    <tr><td>Penalty</td><td>λΣw²</td><td>λΣ|w|</td><td>λ₁Σ|w| + λ₂Σw²</td></tr>
    <tr><td>Penalty gradient (the pull towards 0)</td><td>2λw: shrinks big weights most, pull fades as w → 0</td><td>λ·sign(w): same push to 0 for all, never fades</td><td>Both</td></tr>
    <tr><td>Exact zeros?</td><td>No</td><td>Yes → feature selection</td><td>Yes</td></tr>
    <tr><td>Correlated features</td><td>Shares weight, stable</td><td>Keeps one at random</td><td>Keeps them together</td></tr>
    <tr><td>Use when</td><td>Most features matter a bit</td><td>Few features matter</td><td>Many, correlated, some useless</td></tr>
  </table>
  <p>(Σ, "sigma", means "add up over all weights".) Now on real data: 100 rows, 50 features, but only 5 of them actually matter. Which method notices?</p>
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
LassoCV          best alpha=1.53, kept 6/50</div>
  <p>Plain regression gives a weight to all 50 features, including the 45 useless ones. Ridge shrinks them but keeps all 50. Lasso switches off 45 and keeps exactly the 5 real ones. <code>LassoCV</code> picks λ automatically by cross-validation (section 04) and keeps 6.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The fine is on weight size, so unscaled features get fined unfairly: a feature in rupees needs a tiny weight, a feature in crores a huge one. Scale first (section 07). Also, in sklearn <code>alpha</code> = λ (bigger = stronger), but LogisticRegression/SVC use <code>C</code> = 1/λ (bigger = weaker). Easy to get backwards.</p>
  </div>

  <h2 id="mc-cv"><span class="num">04</span>Cross-Validation</h2>
  <p>In ML Basics, we kept one validation set aside to compare models. But one split can be lucky or unlucky. If the few hardest rows all land in validation, every model looks bad. If they all land in training, every model looks great. With small data, this luck can be bigger than the real difference between models.</p>
  <p><strong>Cross-validation (CV)</strong> fixes this by splitting more than once. Cut the data into K equal parts (called <strong>folds</strong>). Train on K−1 parts, check on the one left out. Then rotate, so every part gets its turn as the check set. You get K scores; report their average and spread.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a batsman on one match is luck. Judging him on 5 matches against 5 teams is fair. Each fold is one match.</p>
  </div>
  <p>Here is 5-fold CV on 10 rows, so you can see every rotation:</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import KFold
rows = list(range(10))             # 10 rows, numbered 0-9
for i, (train, val) in enumerate(KFold(5).split(rows), 1):
    print(f"fold {i}: train on {train.tolist()}  check on {val.tolist()}")</div>
  <div class="fx" data-lang="text">fold 1: train on [2, 3, 4, 5, 6, 7, 8, 9]  check on [0, 1]
fold 2: train on [0, 1, 4, 5, 6, 7, 8, 9]  check on [2, 3]
fold 3: train on [0, 1, 2, 3, 6, 7, 8, 9]  check on [4, 5]
fold 4: train on [0, 1, 2, 3, 4, 5, 8, 9]  check on [6, 7]
fold 5: train on [0, 1, 2, 3, 4, 5, 6, 7]  check on [8, 9]</div>
  <p>Every row is checked exactly once, and every row also helps train four times. Five models are trained in total, so CV costs K times more compute than one split.</p>
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
  </svg><figcaption>K-fold: every row is in validation exactly once; report mean ± std. Time series: never train on the future.</figcaption></figure>
  <p>Left: each row of bars is one fold; the green block (validation) slides along. Right: for data in time order, the validation block must always come <em>after</em> the training block, so the model is never tested on the past it already saw.</p>
  <h3>Which kind of fold?</h3>
  <p>Plain K-fold has a hidden danger. Data exports are often sorted by label. If the 10 positive rows all come first, the first fold's check set holds all the positives and the others hold none. <strong>Stratified</strong> folds keep the same class mix in every fold.</p>
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
  <p>With plain KFold, four of the five folds have zero positives to check on: useless. Stratified gives 2 in each. TimeSeriesSplit always validates on later rows than it trains on.</p>
  <table class="tbl">
    <tr><th>Splitter</th><th>Use when</th></tr>
    <tr><td><code>KFold</code></td><td>Regression, or balanced classes</td></tr>
    <tr><td><code>StratifiedKFold</code></td><td>Classification (the default inside <code>cross_val_score</code> for classifiers)</td></tr>
    <tr><td><code>TimeSeriesSplit</code></td><td>Data in time order: train on past, validate on future</td></tr>
    <tr><td><code>GroupKFold</code></td><td>Many rows per patient or user; keeps all of one person's rows on one side, so the model can't recognise them</td></tr>
  </table>
  <h3>Nested CV: honest score while tuning</h3>
  <p>Suppose you try 144 different settings of a model, each scored by 5-fold CV, and keep the best. That best score is too good to be true. Out of 144 tries on the same folds, one will score well by pure luck, and you just picked it. Interviewers love this question.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>144 students sit the same paper. The topper's mark is partly luck. To know how good the topper really is, give them a fresh paper.</p>
  </div>
  <p><strong>Nested CV</strong> is that fresh paper. An inner CV loop picks the best setting; an outer CV loop, on folds the inner loop never saw, scores it. Below, the data is pure noise, so the honest accuracy is 0.5 (a coin toss).</p>
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
  <p>Picking the best of 144 tries on the same folds finds lucky noise (0.58). In nested CV the outer folds never touch tuning, so they report the truth (0.50). <code>GridSearchCV</code> is sklearn's "try every setting" tool; wrapping it in <code>cross_val_score</code> is the outer loop.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reporting <code>GridSearchCV.best_score_</code> as your model's accuracy. It is a selection score, not an honest estimate. Report nested CV, or the score on an untouched test set.</p>
  </div>

  <h2 id="mc-leak"><span class="num">05</span>Data Leakage</h2>
  <p>A school's exam paper leaks the day before. Everyone scores 95%. The marks look great, but they say nothing about what anyone knows. In ML this happens all the time, by accident, and it is called <strong>leakage</strong>: information that will not exist at prediction time somehow gets into training. Validation looks wonderful; in production the model falls apart.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Leakage</strong>: information that won't exist at prediction time gets into training. Validation looks great; in production the model falls apart. The one question that catches most of it: "would I know this column's value at the moment I make the prediction?"</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The exam paper leaked a day early. Everyone scores 95%, but the marks say nothing about what they know.</p>
  </div>
  <p>Leakage has several shapes. The first two are the ones that catch most people.</p>
  <table class="tbl">
    <tr><th>Type</th><th>What goes wrong</th><th>Example</th><th>Fix</th></tr>
    <tr><td><strong>Train–test contamination</strong></td><td>A prep step peeks at the validation rows before the split is honoured</td><td>Scaler, imputer, feature selector fit on all rows</td><td>Fit inside a Pipeline</td></tr>
    <tr><td><strong>Target leakage</strong></td><td>A column secretly contains the answer</td><td>"refund_issued" to predict churn; "on_antibiotics" to predict infection</td><td>Keep only features known before the event</td></tr>
    <tr><td><strong>Temporal</strong></td><td>The future leaks into the past</td><td>Random split on time data; actual weather to predict yesterday's demand (prod only has a forecast)</td><td>Split by time; use as-of data</td></tr>
    <tr><td><strong>Group</strong></td><td>The model recognises a person, not a pattern</td><td>Same patient's scans in train and test</td><td>GroupKFold / split by entity</td></tr>
    <tr><td><strong>Target encoding w/o CV</strong></td><td>A row's own label is baked into its feature</td><td>Category mean of y computed on all rows</td><td>Cross-fitted <code>TargetEncoder</code></td></tr>
    <tr><td><strong>ID / artefact</strong></td><td>A meaningless column happens to track the label</td><td>Row ID, file name, timestamp correlated with label</td><td>Drop; check top feature importances</td></tr>
  </table>
  <h3>Contamination, shown on pure noise</h3>
  <p>Here the data is random: 100 rows, 5,000 random columns, random labels. There is nothing to learn, so an honest score is 0.5. A "feature selector" picks the 20 columns that best match the labels. Watch what happens when it looks at all rows before CV.</p>
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
  <p>Pure noise scored 85%. Why? Among 5,000 random columns, a few will match the labels by chance. The selector found them using <em>all</em> rows, including the validation rows, so by the time CV ran, the validation labels had already been peeked at. Inside a Pipeline the selector is re-run on each training fold only, and the fake score disappears (0.48).</p>
  <h3>Target leakage, shown on a churn model</h3>
  <p><strong>Churn</strong> means a customer leaving. Say the company refunds most customers who leave. A column "refund_issued" would then predict churn almost perfectly. But a refund happens <em>after</em> the customer leaves. At prediction time, when you want to stop them leaving, that column is always empty.</p>
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
  <p>With the leaky column the test accuracy is 97.8%, a number that will never happen in production. Without it, the honest model (82.2%) is actually a bit worse than always guessing "no churn" (84.6%). Painful, but true, and better to learn now than after launch.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Warning signs: a score that is too good, one feature with almost all the importance, a big drop from validation to production. Ask of every column: "would I know this at prediction time?"</p>
  </div>

  <h2 id="mc-fe"><span class="num">06</span>Feature Engineering</h2>
  <p>A kirana shop owner does not look at every bill to judge a customer. He thinks in summaries: "this one orders at night", "this one usually spends ₹100", "today's bill is 75% of his salary". Those summaries are not in any single bill. He made them from the raw bills.</p>
  <p><strong>Feature engineering</strong> is exactly this: making new columns from raw ones so the pattern is easier for the model to see. It is usually the biggest win in a project. A simple model with good features beats a complex model with raw ones.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana owner doesn't look at each bill. He thinks "night orders", "this customer usually spends ₹100", "this is 75% of his salary". Those summaries are features.</p>
  </div>
  <p>Five transactions from two users. Each new column is one trick, with a comment saying which.</p>
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
  <p>Look at user b's last two rows. The raw amount (900) says little on its own. But "2 am" + "75% of monthly income" + "6× this user's usual" together scream fraud. None of those three facts were columns before.</p>
  <table class="tbl">
    <tr><th>Technique</th><th>Helps when</th></tr>
    <tr><td>Date parts, holidays, cyclical sin/cos of hour</td><td>Behaviour depends on time (sin/cos makes 23:00 and 01:00 "close")</td></tr>
    <tr><td>Ratios, differences</td><td>The relationship matters more than raw size (debt / income)</td></tr>
    <tr><td>log1p / power transform</td><td>Right-skewed money, counts (for linear models). log1p squashes 15 → 2.8 and 950 → 6.9, so huge values stop dominating</td></tr>
    <tr><td>Binning</td><td>Non-linear effect in a linear model (age bands)</td></tr>
    <tr><td>Group aggregates, lags, rolling stats</td><td>Entity history (user's average spend, last-7-day sales)</td></tr>
    <tr><td>Interactions; missing-value flags</td><td>Effects combine (price × discount); "missing" is itself informative</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>user_avg_amt</code> above averages <em>all</em> of user b's rows, including later ones. For a fraud model scoring the 02:15 payment, that uses the future (the 02:20 payment): temporal leakage from section 05. Build averages from past rows only (expanding / shifted windows).</p>
  </div>

  <h2 id="mc-scale"><span class="num">07</span>Feature Scaling</h2>
  <p>Three flats: monthly income of the tenant (₹20,000, ₹50,000, ₹80,000) and number of rooms (1, 2, 3). A model like KNN asks "which flats are most similar?" by measuring distance between rows. Watch what happens to that distance.</p>
  <div class="fx" data-lang="py">import numpy as np
income = np.array([20000, 50000, 80000])     # rupees per month
rooms  = np.array([1, 2, 3])
d = lambda a, b, i, j: np.sqrt((a[i]-a[j])**2 + (b[i]-b[j])**2)
print("raw distance flat0 -> flat1:", round(d(income, rooms, 0, 1), 1))
z = lambda a: (a - a.mean()) / a.std()                    # StandardScaler by hand
print("scaled income:", z(income).round(2), " scaled rooms:", z(rooms).round(2))
print("scaled distance flat0 -> flat1:", round(d(z(income), z(rooms), 0, 1), 2))</div>
  <div class="fx" data-lang="text">raw distance flat0 -> flat1: 30000.0
scaled income: [-1.22  0.    1.22]  scaled rooms: [-1.22  0.    1.22]
scaled distance flat0 -> flat1: 1.73</div>
  <p>Raw: the distance is 30,000, and the room difference (1) is invisible inside it. Rooms do not matter at all to this model, just because rupees are big numbers. After scaling, both columns run from −1.22 to 1.22 and each gets a fair voice. That is all <strong>scaling</strong> is: putting features on a similar range.</p>
  <p>Three common scalers, shown on five incomes where one is a CEO:</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
x = np.array([[20], [25], [30], [35], [500]])        # incomes in k; one CEO
for s in [StandardScaler(), MinMaxScaler(), RobustScaler()]:
    print(f"{type(s).__name__:15s}", s.fit_transform(x).ravel().round(2))</div>
  <div class="fx" data-lang="text">StandardScaler  [-0.54 -0.51 -0.49 -0.46  2.  ]
MinMaxScaler    [0.   0.01 0.02 0.03 1.  ]
RobustScaler    [-1.  -0.5  0.   0.5 47. ]</div>
  <p>The CEO (500) wrecks the first two: the four normal incomes get squashed into almost the same value (−0.54 to −0.46, or 0.00 to 0.03). RobustScaler uses the median and the middle 50% range (IQR), so the normal four keep their spread (−1 to 0.5) and only the CEO flies off.</p>
  <table class="tbl">
    <tr><th>Scaler</th><th>Formula</th><th>In words</th><th>Use / avoid</th></tr>
    <tr><td><strong>StandardScaler</strong></td><td>(x − mean) / std</td><td>Centre at 0, spread of 1</td><td>Default for bell-shaped data; one outlier blows up std</td></tr>
    <tr><td><strong>MinMaxScaler</strong></td><td>(x − min) / (max − min)</td><td>Squeeze into 0 to 1</td><td>Clean, bounded data like pixels; one outlier squashes the rest near 0</td></tr>
    <tr><td><strong>RobustScaler</strong></td><td>(x − median) / IQR</td><td>Like Standard, but ignores extremes</td><td>Outliers present: normal rows keep their spread</td></tr>
    <tr><td><strong>Power / Quantile</strong></td><td>Yeo-Johnson; rank → normal</td><td>Reshape a lopsided column into a bell shape</td><td>Skewed features for linear models (quantile forgets how big outliers were)</td></tr>
  </table>
  <h3>Which models care?</h3>
  <p>Not every model measures distance. A decision tree asks questions like "is proline &gt; 750?". If you multiply proline by 1000, the tree just asks "&gt; 750,000" and gets the same split. Here is the proof on the wine dataset, where one column (proline) is in the hundreds and another (hue) is near 1.</p>
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
  <p>KNN jumps 26 points with scaling. The tree does not move at all.</p>
  <div class="cards">
    <div><b>Needs scaling</b><p>KNN, SVM, KMeans, PCA, regularised linear/logistic, neural nets</p><small>Distances, penalties and gradient descent see raw size (rupees swamp room counts)</small></div>
    <div><b>Doesn't care</b><p>Decision trees, random forests, gradient boosting, Naive Bayes</p><small>A split is "x &gt; threshold"; stretching x moves the threshold, not the split</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The scaler must learn its mean and std from training rows only, then apply them to validation and test. Fit it on all rows and you have the contamination leak from section 05. Section 09 shows the safe way.</p>
  </div>

  <h2 id="mc-enc"><span class="num">08</span>Categorical Encoding</h2>
  <p>Models only understand numbers. But a column like city holds words: Pune, Delhi, Mumbai. <strong>Encoding</strong> turns these categories into numbers without inventing false meaning. The most common way is <strong>one-hot</strong>: one 0/1 column per category, with a 1 in the column of the city that row belongs to.</p>
  <div class="fx" data-lang="py">import pandas as pd
df = pd.DataFrame({"city": ["Pune", "Delhi", "Mumbai", "Pune"]})
print(pd.get_dummies(df, dtype=int))</div>
  <div class="fx" data-lang="text">   city_Delhi  city_Mumbai  city_Pune
0           0            0          1
1           1            0          0
2           0            1          0
3           0            0          1</div>
  <p>Why not just number them, Delhi = 0, Mumbai = 1, Pune = 2? Because a linear model would read that as "Pune is twice Mumbai" and "Delhi is nothing", which is nonsense. Numbering (called <strong>ordinal</strong> encoding) is only right when the categories really have an order, like S &lt; M &lt; L.</p>
  <table class="tbl">
    <tr><th>Encoding</th><th>For</th><th>Watch out</th></tr>
    <tr><td><strong>One-hot</strong></td><td>Nominal (no order), few categories; any model</td><td>Column explosion; <code>handle_unknown="ignore"</code> maps an unseen city to all zeros</td></tr>
    <tr><td><strong>Ordinal</strong></td><td>Ordered: <code>OrdinalEncoder(categories=[["S","M","L"]])</code> → 0, 1, 2; also OK for trees</td><td>Linear models read codes as distances: Pune(2) isn't "twice" Mumbai(1)</td></tr>
    <tr><td><strong>LabelEncoder</strong></td><td>The target y only</td><td>Not meant for feature columns</td></tr>
    <tr><td><strong>Target encoding</strong></td><td>High cardinality (many categories: zip, merchant). Replace each category by the average y of that category</td><td>Must be cross-fitted or it leaks</td></tr>
    <tr><td><strong>Frequency / hashing</strong></td><td>Huge or open-ended vocabularies</td><td>Hash collisions; frequency ties</td></tr>
    <tr><td><strong>Native / embeddings</strong></td><td>LightGBM, CatBoost, HistGradientBoosting; neural nets</td><td>Easiest at very high cardinality</td></tr>
  </table>
  <h3>When there are 1,000 categories</h3>
  <p>One-hot on a PIN-code column with 1,000 values makes 1,000 columns, most of them almost all zeros. Two fixes: group the rare ones together (<code>min_frequency</code>), or <strong>target encoding</strong>: replace each PIN by "the average target for that PIN". Target encoding is powerful but leaks if done naively, because each row's own label is inside its own average.</p>
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
  <p>The target is random, so a fair score is AUC 0.5 (AUC is a ranking score; Model Evaluation explains it). With ~5 rows per zip, each row's own label pulls its zip's mean, so noise looks useful (0.777). sklearn's <code>TargetEncoder</code> encodes each row using other folds only, so the trick disappears (0.495).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A city the model never saw in training appears in production. Plain one-hot crashes. <code>OneHotEncoder(handle_unknown="ignore")</code> turns it into all zeros and carries on.</p>
  </div>

  <h2 id="mc-pipe"><span class="num">09</span>Pipelines &amp; ColumnTransformer</h2>
  <p>By now the model has many prep steps: fill missing values, scale numbers, one-hot the cities, then fit. Each step must learn from training rows only (sections 05, 07) and be repeated exactly the same way on validation, test and production rows. Doing this by hand, in the right order, every time, is where most leaks and bugs come from.</p>
  <p>A <strong>Pipeline</strong> is a list of steps bundled into one object. Calling <code>fit</code> on it fits every step in order, on the rows you give it, and nothing else. Calling <code>predict</code> runs the same steps on new rows. A <strong>ColumnTransformer</strong> lets different columns get different steps (numbers: fill + scale; text categories: one-hot).</p>
  <div class="flow"><span>Wrong: fit scaler on ALL rows</span><span>split</span><span>train</span><span>val score inflated</span></div>
  <div class="flow"><span>Right: split</span><span>fit scaler + model on train fold</span><span>transform val with train stats</span><span>honest score</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe card: every step, in order, worked out from training ingredients only. The same card is used when serving, so training and production can't go out of sync.</p>
  </div>
  <p>Below: 1,000 loan applicants with income (10% missing), age, city and job. <code>SimpleImputer</code> fills missing values (here with the median). <code>cross_val_score</code> gets the whole pipeline, so each fold re-learns its medians, means and city lists from its own training rows.</p>
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
    <li><strong>Leak-proof CV</strong>: <code>cross_val_score(model, …)</code> re-learns medians, scaler stats and categories on each training fold.</li>
    <li><strong>Feature names</strong>: the middle print shows the 8 columns the model actually sees after prep.</li>
    <li><strong>Serving</strong>: one object handles a NaN income and the never-seen city "Goa" (all zeros) without crashing. Save it with <code>joblib.dump</code>. Columns not listed are dropped unless <code>remainder="passthrough"</code>.</li>
    <li><strong>Tuning</strong>: grid keys reach inside with double underscores, e.g. <code>{"clf__C": [0.1, 1, 10]}</code> tunes C of the step named "clf".</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>fit_transform</code> on the test set re-learns the prep from test data. On new data, only call <code>transform</code> (or <code>predict</code>) on a fitted pipeline.</p>
  </div>

  <h2 id="mc-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>A model trained on 5 samples guesses 42, 43, 41, 42, 42 when the truth is 50. High bias or high variance?</summary><div class="qa-body">High bias, low variance. The guesses barely move (variance 0.4) but are always about 8 too low. A richer model is needed; more data will not fix it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the bias–variance trade-off with its decomposition.</summary><div class="qa-body">Expected squared error = Bias² + Variance + σ². Bias: gap between the average prediction (over many training sets) and the truth, e.g. a line fit to a sine curve. Variance: how much predictions jump between training sets, e.g. a degree-15 polynomial. σ²: noise nobody can remove. More flexibility lowers bias and raises variance, so test error is U-shaped.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Train error 0.02, validation error 0.25. What's wrong and what do you try?</summary><div class="qa-body">High variance (overfitting): big train–val gap. Try more data, stronger regularisation, a simpler model or fewer features, early stopping, bagging. If both errors were high and close, it would be bias: add features or complexity instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does L1 give exact zeros but L2 doesn't?</summary><div class="qa-body">Think of the penalty as a fence on the weights. L1's fence is a diamond with corners on the axes; the loss rings usually touch it first at a corner, where some weights are 0. L2's fence is round, so the touch point is almost never on an axis. With two near-twin features, Lasso keeps one at random, Ridge shares weight, Elastic Net keeps both together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you use stratified, time-series, group and nested CV?</summary><div class="qa-body">Stratified: classification, especially imbalanced, so every fold has positives. TimeSeriesSplit: data in time order; train always before validation. GroupKFold: many rows per person or entity. Nested: you tune and also need an honest score without a separate test set; inner loop tunes, outer loop scores.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You tuned 144 hyperparameter combos with 5-fold CV and report the best CV score. Problem?</summary><div class="qa-body">It is too rosy: you picked the max of many noisy scores on the same folds. On pure noise this gave 0.58 instead of 0.50. Use nested CV or report on an untouched test set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>StandardScaler fit on all 1,000 rows, then 5-fold CV. Leakage? How bad?</summary><div class="qa-body">Yes, technically: validation folds affected the mean/std. For a plain scaler the boost is usually small. For steps that look at labels (feature selection, target encoding, oversampling) it is huge: 0.85 vs 0.48 on noise. Same fix for all: put them in a Pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which models need feature scaling and which don't?</summary><div class="qa-body">Need: anything using distances, dot products, penalties or gradient descent: KNN (0.691 → 0.949 on wine), SVM, KMeans, PCA, regularised linear/logistic, neural nets. Don't: tree models (a threshold split doesn't care about scale: 0.888 both ways), Naive Bayes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you encode a column with 50,000 merchant IDs?</summary><div class="qa-body">Not plain one-hot (50,000 columns). Options: cross-fitted target encoding, frequency encoding, one-hot with <code>min_frequency</code>/<code>max_categories</code> to group rare ones as "infrequent", feature hashing, learned embeddings, or native category support (CatBoost, LightGBM). Always handle unseen IDs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a Pipeline with ColumnTransformer rather than preprocessing manually?</summary><div class="qa-body">Leak-proof CV (every step re-learned per fold), tuning prep and model together, and one object to ship that applies the same steps to new rows. Manual steps slowly go out of sync between training and production.</div></details>
</main>`
});
