// notes/ml/ml_core.js — Bias, Variance & Generalization
Object.assign(TOPIC_CONTENT, {
  "ml_core": `<main>
  <h1>Bias, Variance &amp; Generalization</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Bias, Variance &amp; Generalization</span></div>
  <p class="lead">A model is only useful on rows it has never seen. This note explains why a model that is perfect on its training data can fail on new data, and gives you the tools to measure, predict and fix that failure. You will meet underfitting and overfitting, model capacity, the bias–variance decomposition (derived line by line and checked by simulation), irreducible error, learning curves, validation curves, a diagnosis table for "high bias vs high variance", and the modern twist called double descent. Every formula is first worked by hand on a handful of numbers.</p>

  <h2 id="bv-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 200" width="660">
<defs><marker id="bv-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Foundations</text>
<rect x="20" y="32" width="170" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="105" y="57" text-anchor="middle" font-size="12.5">What is ML</text>
<rect x="240" y="32" width="170" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="325" y="50" text-anchor="middle" font-size="12.5">Train/Val/Test</text><text x="325" y="65" text-anchor="middle" font-size="11" class="tm">&amp; Cross-Validation</text>
<rect x="460" y="26" width="180" height="52" rx="8" class="fg sg" stroke-width="3"/><text x="550" y="47" text-anchor="middle" font-size="12.5" font-weight="700">Bias, Variance &amp;</text><text x="550" y="62" text-anchor="middle" font-size="12.5" font-weight="700">Generalization</text><text x="550" y="74" text-anchor="middle" font-size="10" class="tg">YOU ARE HERE</text>
<line x1="190" y1="52" x2="238" y2="52" stroke="currentColor" marker-end="url(#bv-a0)"/>
<line x1="410" y1="52" x2="458" y2="52" stroke="currentColor" marker-end="url(#bv-a0)"/>
<line x1="550" y1="78" x2="550" y2="104" stroke="currentColor"/><line x1="550" y1="104" x2="95" y2="104" stroke="currentColor"/><line x1="95" y1="104" x2="95" y2="124" stroke="currentColor" marker-end="url(#bv-a0)"/>
<rect x="20" y="126" width="150" height="40" rx="8" class="fb sb"/><text x="95" y="145" text-anchor="middle" font-size="12">Loss Functions &amp;</text><text x="95" y="159" text-anchor="middle" font-size="12">Gradient Descent</text>
<rect x="185" y="126" width="140" height="40" rx="8" class="fb sb"/><text x="255" y="151" text-anchor="middle" font-size="12">Regularization</text>
<rect x="340" y="126" width="140" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="410" y="151" text-anchor="middle" font-size="12">Feature Engineering</text>
<rect x="495" y="126" width="145" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="567" y="145" text-anchor="middle" font-size="12">Pipelines &amp;</text><text x="567" y="159" text-anchor="middle" font-size="12">Data Leakage</text>
<line x1="170" y1="146" x2="183" y2="146" stroke="currentColor" marker-end="url(#bv-a0)"/><line x1="325" y1="146" x2="338" y2="146" stroke="currentColor" marker-end="url(#bv-a0)"/><line x1="480" y1="146" x2="493" y2="146" stroke="currentColor" marker-end="url(#bv-a0)"/>
<text x="330" y="190" text-anchor="middle" class="tm" font-size="11">Blue boxes are the direct next steps: how a model is fitted, and how to control its variance.</text>
</svg><figcaption>The Foundations group of the ML track. This note explains the gap between training and test error that the split note taught you to measure.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a></b><span>You learnt to hold data back and score a model on rows it never saw, because the training score lies. That note told you <em>how to measure</em> the gap between training and test error. It did not explain <em>why</em> the gap exists, how big it should be, or what to do about it.</span></li>
    <li><b>This note adds: the theory of generalization</b><span>Why a model fails on new data (bias, variance, noise), a formula that splits test error into those three parts, the knob that trades them (capacity), and two plots that tell you which problem you have (learning and validation curves), with a fix table for each.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a> and <a class="xref" data-note="ml_regularization">Regularization</a></b><span>Every model is fitted by minimising a training loss, which is exactly the number that can lie. The next note shows what that loss is and how it is minimised. Regularization is the main tool for moving a model along the bias–variance curve on purpose. Every model family later (trees, kNN, SVMs, ensembles) is described by where it sits on that curve.</span></li>
  </ol>
  <p>You only need the idea of a mean and a variance (<a class="xref" data-note="st_descriptive">Descriptive Statistics</a>) and of an expected value (<a class="xref" data-note="st_probability">Probability</a>). Both are re-explained in one line where they are used.</p>

  <h2 id="bv-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Bias, Variance &amp; Generalization</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Generalization</div>
        <ul>
          <li><b>Goal</b> — low error on <em>new</em> rows from the same source, not on the training rows</li>
          <li><b>Training error</b> (empirical risk) vs <b>test error</b> (true risk); <b>gap</b> = test − train</li>
          <li>Memoriser (1-NN): train MSE 0.00, test 1.00 · line: train 0.32, test 0.05</li>
          <li>Needs <b>i.i.d.</b>: new rows come from the same distribution</li>
          <li>💡 Mugging up last year's paper vs understanding the chapter</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Under / overfitting</div>
        <ul>
          <li><b>Underfit</b> — too simple; train and val both high, small gap</li>
          <li><b>Overfit</b> — fits noise; train low, val much higher</li>
          <li>3 points: degree 2 has train MSE 0 but error 25 on the next point</li>
          <li>Sine demo: val MSE 0.592 (deg 0) → 0.122 (deg 5) → 0.701 (deg 9)</li>
          <li><b>Capacity</b> — how many patterns a model can fit; degree, depth, 1/k, 1/λ, #params</li>
          <li>n points → degree n−1 fits them exactly</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The decomposition</div>
        <ul>
          <li><b>E[(y − f̂)²] = Bias² + Variance + σ²</b></li>
          <li><b>Bias</b> = f̄ − f: average model vs truth · <b>Variance</b> = E[(f̂ − f̄)²]: spread across training sets</li>
          <li>By hand: preds 7, 9, 9, 11, truth 10, noise ±1 → 4 = 1 + 2 + 1</li>
          <li>Derived by add-and-subtract twice; cross terms vanish (test noise independent, E[f̂ − f̄] = 0)</li>
          <li>Biased can win: shrink x̄ by c = 0.556 → MSE 0.80 → 0.44</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The curve &amp; noise</div>
        <ul>
          <li>Capacity ↑ → bias² ↓, variance ↑ → test error is U-shaped</li>
          <li>Sim: degree 3 best (0.117); degree 13 variance 3.06</li>
          <li><b>Irreducible error σ²</b> — noise + missing features; floor for every model</li>
          <li>Rent without floor: RMSE 2,506 floor; add floor → 1,000</li>
          <li>Classification: <b>Bayes error</b> = average of min(p, 1−p)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Diagnose with curves</div>
        <ul>
          <li><b>Learning curve</b> — error vs training size; high bias: both flat &amp; high, tiny gap; high variance: big gap that closes slowly</li>
          <li><b>Validation curve</b> — error vs one hyperparameter; pick the bottom of val</li>
          <li>Tree depth: val best at 3 (0.104); kNN: best at k = 10–20</li>
          <li>Avoidable bias = train − baseline · variance = val − train</li>
          <li>⚠ More data never fixes bias</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fixes &amp; modern view</div>
        <ul>
          <li><b>High bias</b> → bigger model, more features, less regularization, train longer</li>
          <li><b>High variance</b> → more data, regularize, simpler model, early stopping, bagging</li>
          <li>Bagging cuts variance; boosting cuts bias</li>
          <li><b>Double descent</b> — test error peaks at p = n (56.6) then falls again (0.96 at p = 300)</li>
          <li>Ridge removes the peak (1.78 at p = n)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="bv-gen"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Generalization</span><span class="rm-sub">Training error vs test error</span></div></div>
      <div class="rm-item rm-done" data-target="bv-uo"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Under- &amp; Overfitting</span><span class="rm-sub">The polynomial demo</span></div></div>
      <div class="rm-item rm-done" data-target="bv-cap"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Model Capacity</span><span class="rm-sub">The knob in every model</span></div></div>
      <div class="rm-item rm-done" data-target="bv-derive"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Decomposition, Derived</span><span class="rm-sub">Bias² + variance + noise</span></div></div>
      <div class="rm-item rm-done" data-target="bv-sim"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Estimating by Simulation</span><span class="rm-sub">500 training sets</span></div></div>
      <div class="rm-item rm-done" data-target="bv-curve"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Trade-off Curve</span><span class="rm-sub">The U and the sweet spot</span></div></div>
      <div class="rm-item rm-done" data-target="bv-noise"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Irreducible Error</span><span class="rm-sub">Noise, missing features, Bayes error</span></div></div>
      <div class="rm-item rm-done" data-target="bv-lc"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Learning Curves</span><span class="rm-sub">Error vs amount of data</span></div></div>
      <div class="rm-item rm-done" data-target="bv-vc"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Validation Curves</span><span class="rm-sub">Error vs one hyperparameter</span></div></div>
      <div class="rm-item rm-done" data-target="bv-fix"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Diagnose &amp; Fix</span><span class="rm-sub">High bias vs high variance</span></div></div>
      <div class="rm-item rm-done" data-target="bv-dd"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Double Descent</span><span class="rm-sub">The modern twist</span></div></div>
      <div class="rm-item rm-done" data-target="bv-compare"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">Model families on the curve</span></div></div>
      <div class="rm-item rm-done" data-target="bv-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Interview and code traps</span></div></div>
      <div class="rm-item rm-done" data-target="bv-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="bv-gen"><span class="num">01</span>Generalization: The Real Goal</h2>
  <h3>The need</h3>
  <p>A bank builds a model on last year's 50,000 loan applications. Nobody at the bank cares how well it predicts <em>those</em> applications: their outcome is already known. The model is only worth money on <strong>next month's</strong> applicants. The ability to do well on new rows from the same source is called <strong>generalization</strong>, and it is the only thing that matters in machine learning.</p>
  <p>The difficulty: the model is built by making it good on the training rows. Being good on the training rows and being good on new rows are <em>not</em> the same thing. This whole note is about the difference.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two students prepare for the board exam with last year's paper. Ravi mugs up every answer word for word. Asha understands each chapter. On last year's paper both score 100. On this year's paper, with new questions on the same syllabus, Asha still scores well and Ravi collapses. The training paper could not tell them apart. Only new questions can.</p>
  </div>
  <h3>Training error vs test error</h3>
  <ul>
    <li><strong>Training error</strong>: the average loss on the rows the model learnt from. Cheap to compute, and always too optimistic.</li>
    <li><strong>Test (generalization) error</strong>: the average loss on new rows from the same source. This is what we want, but we can only estimate it on held-out data (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>).</li>
    <li><strong>Generalization gap</strong> = test error − training error. A large gap means the model learnt things about its training rows that are not true in general.</li>
  </ul>
  <h3>Worked by hand: a memoriser vs a straight line</h3>
  <p>Five training rows (hours studied → marks out of 12), and four new students we will test on:</p>
  <table class="tbl">
    <tr><th></th><th colspan="5">training rows</th><th colspan="4">new rows</th></tr>
    <tr><td>x (hours)</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>1.4</td><td>2.6</td><td>3.4</td><td>4.6</td></tr>
    <tr><td>y (marks)</td><td>3</td><td>6</td><td>7</td><td>8</td><td>11</td><td>4</td><td>6</td><td>8</td><td>10</td></tr>
  </table>
  <p><strong>Model A, the memoriser.</strong> "For a new x, copy the marks of the closest training student." On the training rows it returns the stored answer, so every training error is 0. On the new rows: 1.4 is closest to 1 → predicts 3 (true 4, error −1); 2.6 → closest 3 → 7 (true 6, error +1); 3.4 → 3 → 7 (true 8, −1); 4.6 → 5 → 11 (true 10, +1). Test MSE = (1 + 1 + 1 + 1)/4 = <strong>1.00</strong>.</p>
  <p><strong>Model B, a straight line</strong> fitted by least squares (derived in <a class="xref" data-note="ml_regression">Linear Regression</a>). Means: x̄ = 3, ȳ = 7. Slope = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)² = [(−2)(−4) + (−1)(−1) + 0 + (1)(1) + (2)(4)] / [4 + 1 + 0 + 1 + 4] = 18/10 = 1.8. Intercept = 7 − 1.8·3 = 1.6. So ŷ = 1.8x + 1.6.</p>
  <table class="tbl">
    <tr><th>row</th><th>x</th><th>y</th><th>line ŷ</th><th>error</th><th>error²</th></tr>
    <tr><td>train</td><td>1</td><td>3</td><td>3.4</td><td>0.4</td><td>0.16</td></tr>
    <tr><td>train</td><td>2</td><td>6</td><td>5.2</td><td>−0.8</td><td>0.64</td></tr>
    <tr><td>train</td><td>3</td><td>7</td><td>7.0</td><td>0</td><td>0</td></tr>
    <tr><td>train</td><td>4</td><td>8</td><td>8.8</td><td>0.8</td><td>0.64</td></tr>
    <tr><td>train</td><td>5</td><td>11</td><td>10.6</td><td>−0.4</td><td>0.16</td></tr>
    <tr><td colspan="5"><strong>training MSE</strong> = 1.60 / 5</td><td><strong>0.32</strong></td></tr>
    <tr><td>new</td><td>1.4</td><td>4</td><td>4.12</td><td>0.12</td><td>0.0144</td></tr>
    <tr><td>new</td><td>2.6</td><td>6</td><td>6.28</td><td>0.28</td><td>0.0784</td></tr>
    <tr><td>new</td><td>3.4</td><td>8</td><td>7.72</td><td>−0.28</td><td>0.0784</td></tr>
    <tr><td>new</td><td>4.6</td><td>10</td><td>9.88</td><td>−0.12</td><td>0.0144</td></tr>
    <tr><td colspan="5"><strong>test MSE</strong> = 0.1856 / 4</td><td><strong>0.046</strong></td></tr>
  </table>
  <p>The memoriser wins on training data (0 vs 0.32) and loses on new data (1.00 vs 0.05). If you had picked the model by training error, you would have picked the wrong one. The same check in code (a 1-nearest-neighbour regressor <em>is</em> the memoriser):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.neighbors import KNeighborsRegressor

X_tr = np.array([[1], [2], [3], [4], [5]]);  y_tr = np.array([3, 6, 7, 8, 11])
X_te = np.array([[1.4], [2.6], [3.4], [4.6]]); y_te = np.array([4, 6, 8, 10])

memo = KNeighborsRegressor(n_neighbors=1).fit(X_tr, y_tr)   # "copy the nearest answer"
line = LinearRegression().fit(X_tr, y_tr)
print("line: y = %.1f x + %.1f" % (line.coef_[0], line.intercept_))
for name, m in [("memoriser", memo), ("line", line)]:
    tr = ((m.predict(X_tr) - y_tr) ** 2).mean()
    te = ((m.predict(X_te) - y_te) ** 2).mean()
    print(f"{name:9s} test preds={m.predict(X_te).round(1)}  train MSE={tr:.2f}  test MSE={te:.2f}  gap={te - tr:.2f}")</div>
  <div class="fx" data-lang="text">line: y = 1.8 x + 1.6
memoriser test preds=[ 3.  7.  7. 11.]  train MSE=0.00  test MSE=1.00  gap=1.00
line      test preds=[4.1 6.3 7.7 9.9]  train MSE=0.32  test MSE=0.05  gap=-0.27</div>
  <p>The numbers match the hand tables. The line's gap is even negative here (test error below training error): with only four test rows, luck plays a part. On average over many test sets, test error is higher than training error, because the model was tuned to its own training rows.</p>
  <h3>The assumption that makes generalization possible</h3>
  <p>Nothing can predict truly new <em>kinds</em> of data. Learning from the past only works if the future looks like the past. The formal version: training rows and future rows are <strong>i.i.d.</strong>, independent and identically distributed draws from the same unknown distribution P(x, y). When that breaks (a new product, a pandemic, a policy change), test error on old held-out data stops predicting live error. That problem is called <strong>distribution shift</strong> and is covered under monitoring in MLOps.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a model f̂ and a loss L: the <strong>empirical risk</strong> (training error) is R̂(f̂) = (1/n) Σᵢ L(yᵢ, f̂(xᵢ)) over the n training rows. The <strong>true risk</strong> (generalization error) is R(f̂) = E<sub>(x,y)~P</sub>[L(y, f̂(x))], the expected loss on a fresh row from the same distribution. The <strong>generalization gap</strong> is R(f̂) − R̂(f̂). A model <strong>generalizes</strong> when its true risk is low, not merely its empirical risk.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"My model has 99% training accuracy, so it is good." Training accuracy can always be pushed to 100% by memorising (a 1-NN model or an unpruned tree does it automatically). Only a held-out or cross-validated score says anything about generalization.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The memoriser failed by being too flexible. Can a model also fail by being too rigid? And is there a way to see both failures with one family of models where we can turn flexibility up and down?</div>

  <h2 id="bv-uo"><span class="num">02</span>Underfitting and Overfitting</h2>
  <h3>Plain words</h3>
  <p><strong>Underfitting</strong>: the model is too simple to capture the real pattern. It is wrong on training rows and on new rows, in a systematic way. <strong>Overfitting</strong>: the model is flexible enough to follow the random noise in its training rows. It looks excellent on them and fails on new rows. Between the two is a model flexible enough for the pattern but not for the noise.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tailor making a shirt from one measurement session. Underfit: he sells you a "free size" shirt, wrong for everybody. Overfit: he records the exact shape you had after a heavy lunch, including the bulge, and the shirt never fits again. A good tailor measures the real shape and ignores today's accident.</p>
  </div>
  <h3>Worked by hand: three points, three polynomials</h3>
  <p>Three training points (0, 1), (1, 3), (2, 2), and one new point (3, 3). We fit a polynomial of degree 0 (a constant), 1 (a line) and 2 (a parabola) by least squares.</p>
  <ul>
    <li><strong>Degree 0</strong>: the best constant is the mean, (1 + 3 + 2)/3 = 2. Training errors −1, +1, 0 → MSE = (1 + 1 + 0)/3 = 0.667. At x = 3 it predicts 2, error² (3 − 2)² = 1.</li>
    <li><strong>Degree 1</strong>: x̄ = 1, ȳ = 2, slope = [(−1)(−1) + 0·1 + (1)(0)] / [1 + 0 + 1] = 1/2 = 0.5, intercept = 2 − 0.5 = 1.5. Predictions 1.5, 2, 2.5; errors 0.5, −1, 0.5 → MSE = (0.25 + 1 + 0.25)/3 = 0.5. At x = 3: 1.5 + 1.5 = 3, error 0.</li>
    <li><strong>Degree 2</strong> has 3 coefficients and there are 3 points, so it can pass through all of them. Solve a + b·x + c·x² for the three points: x = 0 gives a = 1; x = 1 gives 1 + b + c = 3; x = 2 gives 1 + 2b + 4c = 2. From the second, b = 2 − c; put into the third: 1 + 4 − 2c + 4c = 2 → c = −1.5, b = 3.5. Training MSE = <strong>0</strong>. At x = 3: 1 + 10.5 − 13.5 = −2, error² (3 − (−2))² = <strong>25</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([0, 1, 2]); y = np.array([1, 3, 2])          # three training points
x_new, y_new = 3, 3                                        # one new point
for deg in [0, 1, 2]:
    c = np.polyfit(x, y, deg)                              # least-squares polynomial
    train = ((np.polyval(c, x) - y) ** 2).mean()
    pred = np.polyval(c, x_new)
    print(f"degree {deg}: coefs={np.round(c, 2)}  train MSE={train:.3f}  "
          f"pred at x=3: {pred:5.2f}  new error={(pred - y_new) ** 2:5.2f}")</div>
  <div class="fx" data-lang="text">degree 0: coefs=[2.]  train MSE=0.667  pred at x=3:  2.00  new error= 1.00
degree 1: coefs=[0.5 1.5]  train MSE=0.500  pred at x=3:  3.00  new error= 0.00
degree 2: coefs=[-1.5  3.5  1. ]  train MSE=0.000  pred at x=3: -2.00  new error=25.00</div>
  <p><code>np.polyfit</code> lists coefficients from the highest power down, so <code>[-1.5 3.5 1.]</code> is −1.5x² + 3.5x + 1, exactly what we solved. Training error falls steadily (0.667 → 0.5 → 0) as the degree grows. The error on the new point does not: the "perfect" parabola is by far the worst.</p>
  <h3>The polynomial demo on a sine wave</h3>
  <p>Now a bigger, controlled experiment. Because we generate the data ourselves, we know the truth: y = sin(2πx) + noise, where the noise has standard deviation 0.3 (so variance σ² = 0.09). No model can get below MSE 0.09 on new data; that is the noise. This helper file is used by every simulation in the note:</p>
  <div class="fx" data-lang="py"># sine.py
import numpy as np

def f(x):                                   # the true pattern (nobody knows it in real life)
    return np.sin(2 * np.pi * x)

SIGMA = 0.3                                 # noise std -&gt; irreducible error 0.09

def sample(n, rng):
    x = rng.uniform(0, 1, n)
    y = f(x) + rng.normal(0, SIGMA, n)
    return x[:, None], y                    # X as a column, y as a vector</div>
  <p>We take 10 training rows at evenly spaced x, plus 1,000 fresh validation rows, and fit polynomials of degree 0 to 9. <code>Polynomial.fit</code> is numpy's least-squares polynomial fit (it rescales x internally, which keeps high degrees numerically stable).</p>
  <div class="fx" data-lang="py">import numpy as np
from sine import f, SIGMA

rng = np.random.default_rng(2)
x_tr = np.linspace(0, 1, 10)                       # 10 training rows, evenly spaced
y_tr = f(x_tr) + rng.normal(0, SIGMA, 10)
x_val = rng.uniform(0, 1, 1000)                    # 1000 fresh rows to judge on
y_val = f(x_val) + rng.normal(0, SIGMA, 1000)

print("degree  train MSE  val MSE")
for d in range(10):
    p = np.polynomial.Polynomial.fit(x_tr, y_tr, d)   # least-squares polynomial of degree d
    tr = ((p(x_tr) - y_tr) ** 2).mean()
    va = ((p(x_val) - y_val) ** 2).mean()
    print(f"{d:6d} {tr:9.3f} {va:8.3f}")</div>
  <div class="fx" data-lang="text">degree  train MSE  val MSE
     0     0.361    0.592
     1     0.220    0.325
     2     0.217    0.329
     3     0.086    0.125
     4     0.081    0.133
     5     0.077    0.122
     6     0.060    0.144
     7     0.060    0.145
     8     0.009    0.367
     9     0.000    0.701</div>
  <p>Read the two columns like "practice marks" and "exam marks":</p>
  <ul>
    <li><strong>Degrees 0–2</strong>: both errors are high (0.33–0.59 on validation). A constant, a line and a parabola cannot make an S-shaped wave. <strong>Underfit.</strong></li>
    <li><strong>Degrees 3–5</strong>: training error ≈ 0.08, validation ≈ 0.12–0.13, close to the noise floor 0.09. <strong>Good fit.</strong></li>
    <li><strong>Degrees 8–9</strong>: training error ≈ 0 (degree 9 has 10 coefficients for 10 points, so it passes through all of them), validation 0.37 and 0.70. <strong>Overfit.</strong></li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 640 232" width="640">
<line x1="30" y1="180" x2="205" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="30" y1="30" x2="30" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="30" y="194" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="30" y1="180" x2="30" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="205" y="194" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="205" y1="180" x2="205" y2="183" stroke="currentColor" opacity="0.5"/>
<polyline points="30,105 32.5,101.2 35.1,97.5 37.6,93.8 40.1,90.2 42.7,86.7 45.2,83.4 47.8,80.2 50.3,77.3 52.8,74.5 55.4,72.1 57.9,69.9 60.4,68 63,66.4 65.5,65.1 68,64.2 70.6,63.6 73.1,63.3 75.7,63.4 78.2,63.9 80.7,64.6 83.3,65.7 85.8,67.2 88.3,68.9 90.9,71 93.4,73.3 95.9,75.9 98.5,78.7 101,81.8 103.6,85 106.1,88.4 108.6,91.9 111.2,95.6 113.7,99.3 116.2,103.1 118.8,106.9 121.3,110.7 123.8,114.4 126.4,118.1 128.9,121.6 131.4,125 134,128.2 136.5,131.3 139.1,134.1 141.6,136.7 144.1,139 146.7,141.1 149.2,142.8 151.7,144.3 154.3,145.4 156.8,146.1 159.3,146.6 161.9,146.7 164.4,146.4 167,145.8 169.5,144.9 172,143.6 174.6,142 177.1,140.1 179.6,137.9 182.2,135.5 184.7,132.7 187.2,129.8 189.8,126.6 192.3,123.3 194.9,119.8 197.4,116.2 199.9,112.5 202.5,108.8 205,105" fill="none" class="sb" stroke-width="1.2" stroke-dasharray="4 3"/>
<polyline points="30,80.6 32.5,81.3 35.1,82 37.6,82.7 40.1,83.4 42.7,84.1 45.2,84.8 47.8,85.6 50.3,86.3 52.8,87 55.4,87.7 57.9,88.4 60.4,89.1 63,89.8 65.5,90.5 68,91.2 70.6,92 73.1,92.7 75.7,93.4 78.2,94.1 80.7,94.8 83.3,95.5 85.8,96.2 88.3,96.9 90.9,97.6 93.4,98.3 95.9,99.1 98.5,99.8 101,100.5 103.6,101.2 106.1,101.9 108.6,102.6 111.2,103.3 113.7,104 116.2,104.7 118.8,105.4 121.3,106.2 123.8,106.9 126.4,107.6 128.9,108.3 131.4,109 134,109.7 136.5,110.4 139.1,111.1 141.6,111.8 144.1,112.5 146.7,113.3 149.2,114 151.7,114.7 154.3,115.4 156.8,116.1 159.3,116.8 161.9,117.5 164.4,118.2 167,118.9 169.5,119.6 172,120.4 174.6,121.1 177.1,121.8 179.6,122.5 182.2,123.2 184.7,123.9 187.2,124.6 189.8,125.3 192.3,126 194.9,126.7 197.4,127.5 199.9,128.2 202.5,128.9 205,129.6" fill="none" class="sr" stroke-width="2.2"/>
<circle cx="30" cy="102.6" r="3.2" class="tb"/>
<circle cx="49.4" cy="84.8" r="3.2" class="tb"/>
<circle cx="68.9" cy="69.1" r="3.2" class="tb"/>
<circle cx="88.3" cy="99.4" r="3.2" class="tb"/>
<circle cx="107.8" cy="68.3" r="3.2" class="tb"/>
<circle cx="127.2" cy="104.9" r="3.2" class="tb"/>
<circle cx="146.7" cy="145.2" r="3.2" class="tb"/>
<circle cx="166.1" cy="136.4" r="3.2" class="tb"/>
<circle cx="185.6" cy="128.3" r="3.2" class="tb"/>
<circle cx="205" cy="111.9" r="3.2" class="tb"/>
<text x="117.5" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 1: underfit</text>
<line x1="235" y1="180" x2="410" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="235" y1="30" x2="235" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="235" y="194" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="235" y1="180" x2="235" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="410" y="194" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="410" y1="180" x2="410" y2="183" stroke="currentColor" opacity="0.5"/>
<polyline points="235,105 237.5,101.2 240.1,97.5 242.6,93.8 245.1,90.2 247.7,86.7 250.2,83.4 252.8,80.2 255.3,77.3 257.8,74.5 260.4,72.1 262.9,69.9 265.4,68 268,66.4 270.5,65.1 273,64.2 275.6,63.6 278.1,63.3 280.7,63.4 283.2,63.9 285.7,64.6 288.3,65.7 290.8,67.2 293.3,68.9 295.9,71 298.4,73.3 300.9,75.9 303.5,78.7 306,81.8 308.6,85 311.1,88.4 313.6,91.9 316.2,95.6 318.7,99.3 321.2,103.1 323.8,106.9 326.3,110.7 328.8,114.4 331.4,118.1 333.9,121.6 336.4,125 339,128.2 341.5,131.3 344.1,134.1 346.6,136.7 349.1,139 351.7,141.1 354.2,142.8 356.7,144.3 359.3,145.4 361.8,146.1 364.3,146.6 366.9,146.7 369.4,146.4 372,145.8 374.5,144.9 377,143.6 379.6,142 382.1,140.1 384.6,137.9 387.2,135.5 389.7,132.7 392.2,129.8 394.8,126.6 397.3,123.3 399.9,119.8 402.4,116.2 404.9,112.5 407.5,108.8 410,105" fill="none" class="sb" stroke-width="1.2" stroke-dasharray="4 3"/>
<polyline points="235,106 237.5,101.3 240.1,97.1 242.6,93.3 245.1,89.8 247.7,86.7 250.2,83.9 252.8,81.5 255.3,79.4 257.8,77.6 260.4,76.1 262.9,74.9 265.4,74 268,73.3 270.5,72.9 273,72.8 275.6,72.9 278.1,73.2 280.7,73.7 283.2,74.4 285.7,75.3 288.3,76.4 290.8,77.7 293.3,79.1 295.9,80.6 298.4,82.3 300.9,84.1 303.5,86 306,88 308.6,90.1 311.1,92.2 313.6,94.4 316.2,96.7 318.7,99 321.2,101.4 323.8,103.7 326.3,106.1 328.8,108.4 331.4,110.8 333.9,113.1 336.4,115.3 339,117.5 341.5,119.7 344.1,121.8 346.6,123.7 349.1,125.6 351.7,127.4 354.2,129.1 356.7,130.6 359.3,132 361.8,133.2 364.3,134.2 366.9,135.1 369.4,135.8 372,136.3 374.5,136.6 377,136.6 379.6,136.4 382.1,136 384.6,135.3 387.2,134.3 389.7,133.1 392.2,131.5 394.8,129.7 397.3,127.5 399.9,125 402.4,122.2 404.9,119 407.5,115.5 410,111.6" fill="none" class="sg" stroke-width="2.2"/>
<circle cx="235" cy="102.6" r="3.2" class="tb"/>
<circle cx="254.4" cy="84.8" r="3.2" class="tb"/>
<circle cx="273.9" cy="69.1" r="3.2" class="tb"/>
<circle cx="293.3" cy="99.4" r="3.2" class="tb"/>
<circle cx="312.8" cy="68.3" r="3.2" class="tb"/>
<circle cx="332.2" cy="104.9" r="3.2" class="tb"/>
<circle cx="351.7" cy="145.2" r="3.2" class="tb"/>
<circle cx="371.1" cy="136.4" r="3.2" class="tb"/>
<circle cx="390.6" cy="128.3" r="3.2" class="tb"/>
<circle cx="410" cy="111.9" r="3.2" class="tb"/>
<text x="322.5" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 3: good fit</text>
<line x1="440" y1="180" x2="615" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="440" y1="30" x2="440" y2="180" stroke="currentColor" opacity="0.5"/>
<text x="440" y="194" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="440" y1="180" x2="440" y2="183" stroke="currentColor" opacity="0.5"/>
<text x="615" y="194" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="615" y1="180" x2="615" y2="183" stroke="currentColor" opacity="0.5"/>
<polyline points="440,105 442.5,101.2 445.1,97.5 447.6,93.8 450.1,90.2 452.7,86.7 455.2,83.4 457.8,80.2 460.3,77.3 462.8,74.5 465.4,72.1 467.9,69.9 470.4,68 473,66.4 475.5,65.1 478,64.2 480.6,63.6 483.1,63.3 485.7,63.4 488.2,63.9 490.7,64.6 493.3,65.7 495.8,67.2 498.3,68.9 500.9,71 503.4,73.3 505.9,75.9 508.5,78.7 511,81.8 513.6,85 516.1,88.4 518.6,91.9 521.2,95.6 523.7,99.3 526.2,103.1 528.8,106.9 531.3,110.7 533.8,114.4 536.4,118.1 538.9,121.6 541.4,125 544,128.2 546.5,131.3 549.1,134.1 551.6,136.7 554.1,139 556.7,141.1 559.2,142.8 561.7,144.3 564.3,145.4 566.8,146.1 569.3,146.6 571.9,146.7 574.4,146.4 577,145.8 579.5,144.9 582,143.6 584.6,142 587.1,140.1 589.6,137.9 592.2,135.5 594.7,132.7 597.2,129.8 599.8,126.6 602.3,123.3 604.9,119.8 607.4,116.2 609.9,112.5 612.5,108.8 615,105" fill="none" class="sb" stroke-width="1.2" stroke-dasharray="4 3"/>
<polyline points="440,102.6 442.5,180 445.1,180 447.6,180 450.1,180 452.7,172.9 455.2,136.5 457.8,103.4 460.3,76.6 462.8,57.4 465.4,45.8 467.9,41.1 470.4,42.2 473,47.7 475.5,56 478,65.8 480.6,75.8 483.1,85 485.7,92.8 488.2,98.5 490.7,101.9 493.3,103.1 495.8,102.2 498.3,99.4 500.9,95.3 503.4,90.3 505.9,84.9 508.5,79.7 511,75 513.6,71.4 516.1,69 518.6,68.2 521.2,68.9 523.7,71.4 526.2,75.4 528.8,80.7 531.3,87.2 533.8,94.5 536.4,102.3 538.9,110.2 541.4,117.9 544,125 546.5,131.3 549.1,136.6 551.6,140.7 554.1,143.5 556.7,145.2 559.2,145.6 561.7,145.2 564.3,144 566.8,142.3 569.3,140.5 571.9,138.7 574.4,137.1 577,136 579.5,135.4 582,135.2 584.6,135.2 587.1,135.1 589.6,134.5 592.2,132.9 594.7,129.7 597.2,124.6 599.8,117.4 602.3,108.4 604.9,98.5 607.4,89.6 609.9,85 612.5,90 615,111.9" fill="none" class="sr" stroke-width="2.2"/>
<circle cx="440" cy="102.6" r="3.2" class="tb"/>
<circle cx="459.4" cy="84.8" r="3.2" class="tb"/>
<circle cx="478.9" cy="69.1" r="3.2" class="tb"/>
<circle cx="498.3" cy="99.4" r="3.2" class="tb"/>
<circle cx="517.8" cy="68.3" r="3.2" class="tb"/>
<circle cx="537.2" cy="104.9" r="3.2" class="tb"/>
<circle cx="556.7" cy="145.2" r="3.2" class="tb"/>
<circle cx="576.1" cy="136.4" r="3.2" class="tb"/>
<circle cx="595.6" cy="128.3" r="3.2" class="tb"/>
<circle cx="615" cy="111.9" r="3.2" class="tb"/>
<text x="527.5" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 9: overfit</text>
<text x="320" y="222" text-anchor="middle" class="tm" font-size="11">dots = 10 noisy training rows · dashed blue = true sine · solid = fitted polynomial</text>
</svg><figcaption>The same 10 training rows, three models. Degree 1 misses the shape. Degree 3 follows the true sine closely. Degree 9 passes through every dot, including the noise, and swings wildly between them (it dives off the bottom of the chart near x = 0.05).</figcaption></figure>
  <div class="cards">
    <div><b>Underfitting</b><p>Training error high. Validation error high. Gap small.</p><small>The model cannot express the pattern</small></div>
    <div><b>Good fit</b><p>Training error close to the noise level. Validation slightly above training.</p><small>Keep it, confirm once on the test set</small></div>
    <div><b>Overfitting</b><p>Training error very low (often near 0). Validation error much higher. Gap large.</p><small>The model learnt the noise</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A model <strong>underfits</strong> when a more flexible model from the same family would lower <em>both</em> training and validation error. It <strong>overfits</strong> when a less flexible model (or the same model with more regularization) would raise training error but <em>lower</em> validation error. The point between, where validation error is lowest, is the best capacity for this amount of data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Overfitting means training error is low." Low training error is fine if validation error is also low (degree 3: 0.086 and 0.125). Overfitting is about the <em>gap</em> and about validation error rising as flexibility grows, not about any single number.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We used "degree" as the flexibility dial. Trees have depth, kNN has k, neural nets have layers. Is there one name for this dial, and how does it compare with the amount of data?</div>

  <h2 id="bv-cap"><span class="num">03</span>Model Capacity</h2>
  <h3>What capacity means</h3>
  <p>The <strong>capacity</strong> of a model family is how many different patterns it is able to fit. A constant can fit only flat patterns. A line can fit any trend. A degree-9 polynomial can fit any 10 points exactly. More capacity means lower training error is possible, and also that noise can be fitted.</p>
  <p>The rule from the three-point example generalises: a polynomial with p coefficients can pass exactly through any p points (with different x values). So <strong>when the number of free parameters reaches the number of training rows, a model can usually memorise</strong>. Capacity must always be judged <em>relative to the amount of data</em>: degree 9 overfits 10 rows but would be fine with 10,000.</p>
  <h3>The capacity knob in every model</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Capacity goes UP when…</th><th>Too low → </th><th>Too high →</th></tr>
    <tr><td>Polynomial regression</td><td>degree ↑</td><td>straight line through a curve</td><td>wiggles through noise</td></tr>
    <tr><td>Linear / logistic + penalty</td><td>λ (alpha) ↓, or C ↑</td><td>all weights squeezed to 0</td><td>huge weights</td></tr>
    <tr><td><a class="xref" data-note="ml_knn">k-nearest neighbours</a></td><td><strong>k ↓</strong> (reversed!)</td><td>k = n predicts the global average</td><td>k = 1 memorises</td></tr>
    <tr><td><a class="xref" data-note="ml_dtree">Decision tree</a></td><td>max_depth ↑, min_samples_leaf ↓</td><td>a stump</td><td>one leaf per row</td></tr>
    <tr><td><a class="xref" data-note="ml_svm">SVM with RBF kernel</a></td><td>C ↑, gamma ↑</td><td>almost linear</td><td>an island around each point</td></tr>
    <tr><td><a class="xref" data-note="ml_gbm">Gradient boosting</a></td><td>more trees, deeper trees, larger learning rate</td><td>too few rounds</td><td>fits noise late in training</td></tr>
    <tr><td>Neural network</td><td>layers / units ↑, epochs ↑, dropout ↓</td><td>tiny network</td><td>memorises labels, even random ones</td></tr>
  </table>
  <h3>A precise measure, briefly: VC dimension</h3>
  <p>Learning theory measures the capacity of a classifier family by the largest number of points it can <strong>shatter</strong>, that is, label in every possible way. A straight line in 2D can separate 3 points (not on one line) under all 2³ = 8 labelings, but no line can produce the XOR labeling of 4 points at the corners of a square. So the VC dimension of lines in 2D is 3; in d dimensions a linear classifier has VC dimension d + 1. Classic bounds say the generalization gap shrinks roughly like √(capacity / n): more capacity needs more rows. You will not compute these bounds at work, but the shape of the statement is worth remembering.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Capacity</strong> (or complexity, flexibility) is the richness of the set of functions a learning algorithm can produce. It is controlled by the model family and its hyperparameters (degree, depth, k, λ, number of parameters, training time). The appropriate capacity depends on the number of training rows and the noise level.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Capacity = number of parameters." Not always. Ridge regression has as many parameters as plain regression but less effective capacity. kNN has no trained parameters at all, yet k = 1 has huge capacity. Deep networks with millions of parameters can generalise well because training and regularization limit what they actually fit (section 11).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We can see that test error goes down then up as capacity grows. Why exactly? The answer is a formula that splits test error into three parts, each of which moves differently with capacity.</div>

  <h2 id="bv-derive"><span class="num">04</span>The Bias–Variance Decomposition, Derived</h2>
  <h3>The setup: what is random?</h3>
  <p>Imagine the data really comes from y = f(x) + ε, where f is the true pattern and ε is noise with mean 0 and variance σ². Your training set is one random sample. If you had collected a <em>different</em> sample (another month, other customers), you would have trained a different model. So the fitted model f̂ is itself random: it depends on which training set D you happened to get. We write f̂<sub>D</sub>.</p>
  <p>Fix one test input x. Two things are random when we score the model there:</p>
  <ol>
    <li>which training set D we got (so which f̂<sub>D</sub>(x) we predict), and</li>
    <li>the noise ε in the test answer y = f(x) + ε.</li>
  </ol>
  <p>The <strong>average model</strong> is f̄(x) = E<sub>D</sub>[f̂<sub>D</sub>(x)]: train on very many training sets and average the predictions at x.</p>
  <h3>Bias and variance in plain words</h3>
  <ul>
    <li><strong>Bias</strong> = f̄(x) − f(x): how far the <em>average</em> model is from the truth. A systematic error that more training sets cannot average away.</li>
    <li><strong>Variance</strong> = E<sub>D</sub>[(f̂<sub>D</sub>(x) − f̄(x))²]: how much the models trained on different samples disagree with each other.</li>
    <li><strong>Noise</strong> σ² = E[ε²]: how much y wobbles around f(x) even with x known exactly.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An archer shooting at a target, where every arrow is a model trained on a different sample. Arrows tightly grouped but off-centre: high bias (the sight is bent). Arrows centred on average but scattered: high variance (shaky hands). Fixing the hands does not fix the sight.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 138" width="560">
    <g fill="none" stroke="currentColor" opacity="0.5">
      <circle cx="70" cy="60" r="40"/><circle cx="70" cy="60" r="26"/><circle cx="70" cy="60" r="12"/>
      <circle cx="210" cy="60" r="40"/><circle cx="210" cy="60" r="26"/><circle cx="210" cy="60" r="12"/>
      <circle cx="350" cy="60" r="40"/><circle cx="350" cy="60" r="26"/><circle cx="350" cy="60" r="12"/>
      <circle cx="490" cy="60" r="40"/><circle cx="490" cy="60" r="26"/><circle cx="490" cy="60" r="12"/>
    </g>
    <g class="tb"><circle cx="68" cy="58" r="3.5"/><circle cx="73" cy="62" r="3.5"/><circle cx="70" cy="55" r="3.5"/><circle cx="66" cy="63" r="3.5"/><circle cx="74" cy="57" r="3.5"/></g>
    <g class="tr"><circle cx="190" cy="40" r="3.5"/><circle cx="232" cy="52" r="3.5"/><circle cx="205" cy="88" r="3.5"/><circle cx="222" cy="78" r="3.5"/><circle cx="193" cy="70" r="3.5"/></g>
    <g class="tb"><circle cx="370" cy="38" r="3.5"/><circle cx="375" cy="42" r="3.5"/><circle cx="368" cy="44" r="3.5"/><circle cx="377" cy="36" r="3.5"/><circle cx="372" cy="47" r="3.5"/></g>
    <g class="tr"><circle cx="512" cy="36" r="3.5"/><circle cx="525" cy="62" r="3.5"/><circle cx="498" cy="30" r="3.5"/><circle cx="520" cy="45" r="3.5"/><circle cx="505" cy="52" r="3.5"/></g>
    <g text-anchor="middle"><text x="70" y="116" class="tg">low bias</text><text x="70" y="130" class="tg">low variance</text><text x="210" y="116">low bias</text><text x="210" y="130" class="tr">high variance</text><text x="350" y="116" class="tr">high bias</text><text x="350" y="130">low variance</text><text x="490" y="116" class="tr">high bias</text><text x="490" y="130" class="tr">high variance</text></g>
  </svg><figcaption>Each dot is one model trained on a different sample; the centre is the truth f(x). Bias is where the group sits; variance is how spread out it is.</figcaption></figure>
  <h3>By hand first: four models, two outcomes</h3>
  <p>At a test point x₀ the truth is f(x₀) = 10. The test answer y is 9 or 11 with equal chance (noise ±1, so σ² = 1). We trained on four possible training sets and got four predictions: 7, 9, 9, 11.</p>
  <p><strong>Direct expected error</strong>: average (y − prediction)² over all 4 × 2 equally likely combinations.</p>
  <table class="tbl">
    <tr><th>prediction</th><th>y = 9</th><th>y = 11</th><th>average</th></tr>
    <tr><td>7</td><td>(9−7)² = 4</td><td>(11−7)² = 16</td><td>10</td></tr>
    <tr><td>9</td><td>0</td><td>4</td><td>2</td></tr>
    <tr><td>9</td><td>0</td><td>4</td><td>2</td></tr>
    <tr><td>11</td><td>4</td><td>0</td><td>2</td></tr>
    <tr><td colspan="3"><strong>expected squared error</strong> = (10 + 2 + 2 + 2)/4</td><td><strong>4</strong></td></tr>
  </table>
  <p><strong>The three parts</strong>:</p>
  <ul>
    <li>Average model f̄ = (7 + 9 + 9 + 11)/4 = 9. Bias = 9 − 10 = −1, so <strong>bias² = 1</strong>.</li>
    <li>Variance = average of (prediction − 9)² = [(−2)² + 0² + 0² + 2²]/4 = 8/4 = <strong>2</strong>.</li>
    <li>Noise = average of (y − 10)² = [1 + 1]/2 = <strong>1</strong>.</li>
  </ul>
  <p>1 + 2 + 1 = 4. The three parts add up exactly to the expected error. That is not a coincidence; the derivation below shows it always happens for squared error.</p>
  <div class="fx" data-lang="py">import numpy as np
f_x0 = 10                                  # true value at the point x0
preds = np.array([7, 9, 9, 11])            # 4 models, one per training set
ys = np.array([9, 11])                     # the real answer: 10 - 1 or 10 + 1, equally likely

errors = (ys[None, :] - preds[:, None]) ** 2      # every (model, outcome) pair
print(errors)
print("expected error  =", errors.mean())
bias2 = (preds.mean() - f_x0) ** 2
var = preds.var()                          # population variance: mean of squared deviations
noise = ((ys - f_x0) ** 2).mean()
print(f"bias^2 + var + noise = {bias2} + {var} + {noise} = {bias2 + var + noise}")</div>
  <div class="fx" data-lang="text">[[ 4 16]
 [ 0  4]
 [ 0  4]
 [ 4  0]]
expected error  = 4.0
bias^2 + var + noise = 1.0 + 2.0 + 1.0 = 4.0</div>
  <p>The 4 × 2 matrix is the hand table (rows = models, columns = the two possible answers). Note <code>preds.var()</code>: numpy's default divides by n, the population variance, which is what the decomposition uses.</p>
  <h3>The derivation, step by step</h3>
  <p>We want E[(y − f̂<sub>D</sub>(x))²], averaged over training sets D and test noise ε. To keep the symbols short, write f = f(x), f̂ = f̂<sub>D</sub>(x), f̄ = f̄(x). The whole trick is "add and subtract the same thing, then expand a square", done twice.</p>
  <p><strong>Step 1: separate the noise.</strong> Since y = f + ε:</p>
  <div class="flow"><span>y − f̂ = (f − f̂) + ε</span><span>square: (f − f̂)² + 2ε(f − f̂) + ε²</span><span>take the average E[…]</span></div>
  <p>The middle term: the test noise ε is new noise, independent of the training set (and so of f̂), and it has mean 0. The average of a product of independent things is the product of averages: E[2ε(f − f̂)] = 2·E[ε]·E[f − f̂] = 2·0·(…) = 0. The last term is E[ε²] = σ². So</p>
  <p style="text-align:center"><strong>E[(y − f̂)²] = E[(f − f̂)²] + σ²</strong></p>
  <p><strong>Step 2: separate bias and variance.</strong> Add and subtract the average model f̄ inside the first term:</p>
  <div class="flow"><span>f − f̂ = (f − f̄) + (f̄ − f̂)</span><span>square: (f − f̄)² + 2(f − f̄)(f̄ − f̂) + (f̄ − f̂)²</span><span>take E over D</span></div>
  <p>(f − f̄) does not depend on D: it is a fixed number. So the middle term averages to 2(f − f̄)·E[f̄ − f̂] = 2(f − f̄)·(f̄ − f̄) = 0, because the average of f̂ is f̄ by definition. The first term stays as (f − f̄)², the squared bias. The last term is E[(f̂ − f̄)²], the variance.</p>
  <p><strong>Put together</strong>:</p>
  <p style="text-align:center"><strong>E[(y − f̂(x))²] = (f̄(x) − f(x))² + E[(f̂(x) − f̄(x))²] + σ² = Bias² + Variance + Noise</strong></p>
  <p>Averaging this over all test points x gives the same split for the whole test MSE. In the hand example: Step 1 says E[(f − f̂)²] = average of (10 − 7)², (10 − 9)², (10 − 9)², (10 − 11)² = (9 + 1 + 1 + 1)/4 = 3, plus σ² = 1 → 4. Step 2 splits the 3 into bias² 1 + variance 2.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For y = f(x) + ε with E[ε] = 0, Var(ε) = σ², and a model f̂<sub>D</sub> trained on a random training set D, the expected squared prediction error at x is <strong>E<sub>D,ε</sub>[(y − f̂<sub>D</sub>(x))²] = Bias[f̂(x)]² + Var[f̂(x)] + σ²</strong>, with Bias[f̂(x)] = E<sub>D</sub>[f̂<sub>D</sub>(x)] − f(x) and Var[f̂(x)] = E<sub>D</sub>[(f̂<sub>D</sub>(x) − E<sub>D</sub>[f̂<sub>D</sub>(x)])²]. The identity is exact for squared error. For other losses (0-1, log loss) there are analogous but non-additive versions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Variance" here is <em>not</em> the variance of the predictions across different test rows, and not the variance of the data. It is the variance of the prediction <em>at one fixed x</em> across different training sets. A model that predicts a very wiggly curve can still have low variance if it predicts the same wiggly curve every time.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The formula needs "many training sets" and the true f. In real life you have one training set and no f. But in a simulation we control both, so we can measure each term and watch it move with capacity.</div>

  <h2 id="bv-sim"><span class="num">05</span>Estimating Bias and Variance by Simulation</h2>
  <h3>The recipe</h3>
  <div class="flow"><span>Draw a training set (fresh noise)</span><span>Fit the model, predict on fixed test x's</span><span>Repeat R = 500 times</span><span>Average model f̄ = mean of the 500 predictions</span><span>bias² = (f̄ − f)², variance = spread of the 500</span></div>
  <p>We keep the 15 training x-locations fixed and redraw only the noise each time (statisticians call this "fixed design"). We also measure the real expected test error directly, with fresh noisy answers, to check that bias² + variance + noise equals it.</p>
  <div class="fx" data-lang="py">import numpy as np
from sine import f, SIGMA

rng = np.random.default_rng(42)
x_tr = np.linspace(0, 1, 15)                 # where the 15 training rows are measured
x_te = np.linspace(0.02, 0.98, 50)           # 50 test locations
R = 500                                      # 500 different training sets
print("degree   bias^2   variance   noise   sum      measured test MSE")
for d in [0, 1, 2, 3, 4, 5, 7, 9, 11, 13]:
    P = np.empty((R, len(x_te)))
    for r in range(R):
        y_tr = f(x_tr) + rng.normal(0, SIGMA, len(x_tr))     # new noise = new training set
        P[r] = np.polynomial.Polynomial.fit(x_tr, y_tr, d)(x_te)
    avg = P.mean(axis=0)                                      # the "average model"
    bias2 = ((avg - f(x_te)) ** 2).mean()
    var = P.var(axis=0).mean()
    y_te = f(x_te) + rng.normal(0, SIGMA, (R, len(x_te)))     # fresh noisy answers
    measured = ((y_te - P) ** 2).mean()
    print(f"{d:6d} {bias2:9.4f} {var:9.4f} {SIGMA**2:8.3f} {bias2 + var + SIGMA**2:8.4f} {measured:10.4f}")</div>
  <div class="fx" data-lang="text">degree   bias^2   variance   noise   sum      measured test MSE
     0    0.5104    0.0062    0.090   0.6066     0.6045
     1    0.2009    0.0108    0.090   0.3017     0.3030
     2    0.1997    0.0163    0.090   0.3059     0.3059
     3    0.0059    0.0206    0.090   0.1165     0.1166
     4    0.0057    0.0242    0.090   0.1199     0.1207
     5    0.0001    0.0297    0.090   0.1199     0.1208
     7    0.0001    0.0415    0.090   0.1316     0.1302
     9    0.0002    0.0618    0.090   0.1520     0.1527
    11    0.0006    0.1503    0.090   0.2410     0.2438
    13    0.0032    3.0622    0.090   3.1554     3.1605</div>
  <h3>Reading the table</h3>
  <ul>
    <li><strong>The decomposition holds</strong>: "sum" and "measured test MSE" agree to about 0.003 in every row (the small differences are simulation noise from using 500 repeats).</li>
    <li><strong>Bias² falls</strong> as degree rises: 0.51 (a constant cannot follow a sine) → 0.20 (a line or parabola) → 0.006 (cubic) → ≈ 0 (degree 5+). A sine is very close to a degree-5 polynomial on [0, 1].</li>
    <li><strong>Variance rises</strong>: 0.006 → 0.021 (degree 3) → 0.062 (degree 9) → 3.06 (degree 13, with 14 coefficients for 15 rows). Each extra coefficient is one more thing the noise can push around.</li>
    <li><strong>Noise is constant</strong> at 0.09, whatever the model.</li>
    <li><strong>Best total</strong> at degree 3 (0.117), with 5 close behind. That is the sweet spot for 15 rows.</li>
  </ul>
  <p>Why does bias creep up again for degree 11–13? Those fits are so unstable near the edges that even the average of 500 of them has not settled exactly on the sine. With infinitely many repeats it would go to 0.</p>
  <h3>A biased estimator can beat an unbiased one</h3>
  <p>The decomposition is not only about curves. It applies to estimating a single number, and it gives a surprising result: deliberately adding bias can <em>lower</em> the total error. Suppose the true mean is μ = 1, each observation has noise σ = 2, and you have n = 5 observations. The usual estimate is the sample mean x̄ (unbiased, variance σ²/n = 4/5 = 0.8). Now try the shrunk estimate c·x̄ for some c between 0 and 1.</p>
  <ul>
    <li>Bias = E[c·x̄] − μ = cμ − μ = (c − 1)μ, so bias² = (c − 1)²μ².</li>
    <li>Variance = Var(c·x̄) = c²·σ²/n.</li>
    <li>MSE = (c − 1)²·1 + c²·0.8.</li>
  </ul>
  <table class="tbl">
    <tr><th>c</th><th>bias² = (c−1)²</th><th>variance = 0.8c²</th><th>MSE</th></tr>
    <tr><td>1 (plain mean)</td><td>0</td><td>0.8</td><td>0.800</td></tr>
    <tr><td>0.8</td><td>0.04</td><td>0.512</td><td>0.552</td></tr>
    <tr><td>0.5</td><td>0.25</td><td>0.2</td><td>0.450</td></tr>
    <tr><td>0 (always say 0)</td><td>1</td><td>0</td><td>1.000</td></tr>
  </table>
  <p>Setting the derivative of MSE to zero, 2(c − 1) + 1.6c = 0, gives the best c = 1/1.8 = 0.556 (in general c* = μ²/(μ² + σ²/n)), with MSE 0.444. Shrinking towards zero trades a little bias for a big cut in variance. Simulated with 200,000 repeated studies:</p>
  <div class="fx" data-lang="py">import numpy as np
mu, sigma, n = 1.0, 2.0, 5                  # true mean, noise std, sample size
rng = np.random.default_rng(0)
samples = rng.normal(mu, sigma, (200_000, n))   # 200,000 repeated studies of 5 rows
xbar = samples.mean(axis=1)
c_best = mu**2 / (mu**2 + sigma**2 / n)
for c in [1.0, 0.8, c_best, 0.5, 0.0]:
    est = c * xbar                           # shrink the sample mean towards 0
    bias2 = (est.mean() - mu) ** 2
    var = est.var()
    mse = ((est - mu) ** 2).mean()
    theory = (c - 1) ** 2 * mu**2 + c**2 * sigma**2 / n
    print(f"c={c:.3f}  bias^2={bias2:.3f}  var={var:.3f}  MSE={mse:.3f}  formula={theory:.3f}")</div>
  <div class="fx" data-lang="text">c=1.000  bias^2=0.000  var=0.798  MSE=0.798  formula=0.800
c=0.800  bias^2=0.039  var=0.511  MSE=0.550  formula=0.552
c=0.556  bias^2=0.197  var=0.246  MSE=0.443  formula=0.444
c=0.500  bias^2=0.249  var=0.200  MSE=0.449  formula=0.450
c=0.000  bias^2=1.000  var=0.000  MSE=1.000  formula=1.000</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>This is regularization in miniature. <a class="xref" data-note="ml_ridge_lasso">Ridge regression</a> shrinks every coefficient towards 0 in exactly this spirit: the coefficients become biased, their variance drops more, and test error goes down. "Unbiased" is not the same as "best". (In practice c* depends on the unknown μ, which is why λ is tuned by cross-validation.)</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>You cannot compute bias and variance on a real dataset this way, because you do not know f and you have only one training set. On real data you see their <em>symptoms</em>: training error (mostly bias) and the train–validation gap (mostly variance). Sections 08–10 turn those symptoms into a diagnosis. Bootstrap resampling can approximate the variance term, but not the bias.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have the table; now the picture. Plotting the three terms against capacity gives the most famous figure in machine learning.</div>

  <h2 id="bv-curve"><span class="num">06</span>The Trade-off Curve</h2>
  <figure class="viz"><svg viewBox="0 0 620 265" width="620">
<line x1="80" y1="215" x2="580" y2="215" stroke="currentColor" opacity="0.5"/>
<line x1="80" y1="25" x2="80" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="80" y="229" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="80" y1="215" x2="80" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="118.5" y="229" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="118.5" y1="215" x2="118.5" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="156.9" y="229" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="156.9" y1="215" x2="156.9" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="195.4" y="229" text-anchor="middle" class="tm" font-size="10.5">3</text>
<line x1="195.4" y1="215" x2="195.4" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="233.8" y="229" text-anchor="middle" class="tm" font-size="10.5">4</text>
<line x1="233.8" y1="215" x2="233.8" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="272.3" y="229" text-anchor="middle" class="tm" font-size="10.5">5</text>
<line x1="272.3" y1="215" x2="272.3" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="349.2" y="229" text-anchor="middle" class="tm" font-size="10.5">7</text>
<line x1="349.2" y1="215" x2="349.2" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="426.2" y="229" text-anchor="middle" class="tm" font-size="10.5">9</text>
<line x1="426.2" y1="215" x2="426.2" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="503.1" y="229" text-anchor="middle" class="tm" font-size="10.5">11</text>
<line x1="503.1" y1="215" x2="503.1" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="580" y="229" text-anchor="middle" class="tm" font-size="10.5">13</text>
<line x1="580" y1="215" x2="580" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="75" y="218.5" text-anchor="end" class="tm" font-size="10.5">0.0001</text>
<line x1="77" y1="215" x2="80" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="75" y="177.2" text-anchor="end" class="tm" font-size="10.5">0.001</text>
<line x1="77" y1="173.7" x2="80" y2="173.7" stroke="currentColor" opacity="0.5"/>
<text x="75" y="135.9" text-anchor="end" class="tm" font-size="10.5">0.01</text>
<line x1="77" y1="132.4" x2="80" y2="132.4" stroke="currentColor" opacity="0.5"/>
<text x="75" y="94.6" text-anchor="end" class="tm" font-size="10.5">0.1</text>
<line x1="77" y1="91.1" x2="80" y2="91.1" stroke="currentColor" opacity="0.5"/>
<text x="75" y="53.4" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="77" y1="49.9" x2="80" y2="49.9" stroke="currentColor" opacity="0.5"/>
<line x1="80" y1="93" x2="580" y2="93" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<line x1="195.4" y1="25" x2="195.4" y2="215" stroke-dasharray="3 3" class="sg"/>
<text x="199.4" y="35" class="tm" font-size="10.5">best: degree 3</text>
<polyline points="80,61.9 118.5,78.6 156.9,78.7 195.4,141.9 233.8,142.5 272.3,215 349.2,215 426.2,202.6 503.1,182.9 580,152.9" fill="none" class="sb" stroke-width="2"/>
<circle cx="80" cy="61.9" r="3" class="tb"/>
<circle cx="118.5" cy="78.6" r="3" class="tb"/>
<circle cx="156.9" cy="78.7" r="3" class="tb"/>
<circle cx="195.4" cy="141.9" r="3" class="tb"/>
<circle cx="233.8" cy="142.5" r="3" class="tb"/>
<circle cx="272.3" cy="215" r="3" class="tb"/>
<circle cx="349.2" cy="215" r="3" class="tb"/>
<circle cx="426.2" cy="202.6" r="3" class="tb"/>
<circle cx="503.1" cy="182.9" r="3" class="tb"/>
<circle cx="580" cy="152.9" r="3" class="tb"/>
<text x="120" y="60" class="tb" font-size="11.5">bias²</text>
<polyline points="80,141 118.5,131 156.9,123.7 195.4,119.5 233.8,116.6 272.3,112.9 349.2,106.9 426.2,99.8 503.1,83.8 580,29.8" fill="none" class="sr" stroke-width="2"/>
<circle cx="80" cy="141" r="3" class="tr"/>
<circle cx="118.5" cy="131" r="3" class="tr"/>
<circle cx="156.9" cy="123.7" r="3" class="tr"/>
<circle cx="195.4" cy="119.5" r="3" class="tr"/>
<circle cx="233.8" cy="116.6" r="3" class="tr"/>
<circle cx="272.3" cy="112.9" r="3" class="tr"/>
<circle cx="349.2" cy="106.9" r="3" class="tr"/>
<circle cx="426.2" cy="99.8" r="3" class="tr"/>
<circle cx="503.1" cy="83.8" r="3" class="tr"/>
<circle cx="580" cy="29.8" r="3" class="tr"/>
<text x="440" y="120" class="tr" font-size="11.5">variance</text>
<polyline points="80,58.8 118.5,71.3 156.9,71.1 195.4,88.4 233.8,87.9 272.3,87.9 349.2,86.2 426.2,83.6 503.1,75.4 580,29.3" fill="none" stroke="currentColor" stroke-width="3"/>
<text x="250" y="66" class="tm" font-size="11.5">total = bias² + variance + noise</text>
<text x="330" y="245" text-anchor="middle" class="tm" font-size="11">polynomial degree (model capacity) →</text>
<text x="26" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 120)">error (log scale)</text>
<text x="470" y="104" class="tm" font-size="11">noise σ² = 0.09</text>
</svg><figcaption>The simulation table, drawn on a log scale. Blue: bias² falls with capacity. Red: variance rises. Black: their sum plus noise, the expected test error, is lowest at degree 3. The dashed line is the noise floor that no model can go below.</figcaption></figure>
  <p>Follow the blue line from left to right: more capacity, less bias. Follow the red line: more capacity, more variance. The black total is their sum plus the constant noise, so it first falls (bias shrinking faster than variance grows), flattens, then rises (variance growing faster). The bottom of the black curve is the <strong>sweet spot</strong>.</p>
  <h3>Why a trade-off, in one sentence each</h3>
  <ul>
    <li>A rigid model makes the <strong>same mistake</strong> on every training set: high bias, low variance.</li>
    <li>A flexible model makes a <strong>different mistake</strong> on every training set: low bias, high variance.</li>
    <li>With a fixed amount of data you cannot make both small by choosing capacity alone; you choose the balance.</li>
  </ul>
  <h3>Things that move the whole curve</h3>
  <table class="tbl">
    <tr><th>Change</th><th>Effect on bias</th><th>Effect on variance</th><th>Effect on the sweet spot</th></tr>
    <tr><td>More training rows</td><td>none</td><td>↓ (about 1/n for simple models)</td><td>moves right: you can afford more capacity</td></tr>
    <tr><td>Less noise (better labels)</td><td>none</td><td>↓</td><td>moves right, floor drops</td></tr>
    <tr><td>Better features</td><td>↓ (the pattern becomes simpler)</td><td>often ↓</td><td>lower curve overall</td></tr>
    <tr><td>Regularization (λ ↑)</td><td>↑</td><td>↓</td><td>a finer dial than degree</td></tr>
    <tr><td><a class="xref" data-note="ml_bagging">Bagging</a> (average many models)</td><td>≈ same</td><td>↓↓</td><td>lets you use high-capacity models safely</td></tr>
    <tr><td><a class="xref" data-note="ml_boosting">Boosting</a> (add models in sequence)</td><td>↓↓</td><td>↑ slowly</td><td>builds capacity step by step</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The trade-off is between bias and variance <em>for a fixed amount of data and a fixed model family</em>. Ensembles bend that rule: a random forest keeps the low bias of deep trees and averages away much of their variance. That is why the <a class="xref" data-note="ml_ensembles">ensemble</a> notes start from this decomposition.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Drawing the U with the minimum at "bias² = variance". The best point is where the <em>slopes</em> cancel (bias² falling as fast as variance rises), not where the two curves cross. In our table they cross between degrees 2 and 3 by luck; in general they need not.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The noise term σ² sat under every model like a floor. What is it really made of, and is it truly impossible to remove?</div>

  <h2 id="bv-noise"><span class="num">07</span>Irreducible Error</h2>
  <h3>Where it comes from</h3>
  <ul>
    <li><strong>Measurement noise</strong>: a weighing scale off by a few grams, a typo in a form, two doctors labelling the same X-ray differently.</li>
    <li><strong>Missing information</strong>: the answer depends on something you did not record (the floor of a flat, a customer's mood that day).</li>
    <li><strong>True randomness</strong>: whether a fair coin lands heads, whether a customer happens to see an ad.</li>
  </ul>
  <h3>Worked by hand: identical rows, different answers</h3>
  <p>Four flats in your data have exactly the same recorded features (650 sq ft, 2 rooms, same area). Their rents are ₹14,000, ₹16,000, ₹15,000 and ₹15,000. Any model sees the same input for all four, so it must give them the same prediction. The best single number under squared error is their mean, ₹15,000, and even then the errors are −1,000, +1,000, 0, 0 (in ₹), so MSE = (1,000² + 1,000² + 0 + 0)/4 = 500,000, RMSE ≈ ₹707. No model, however clever, can do better on these four rows <em>with these features</em>.</p>
  <h3>"Irreducible" is relative to your features</h3>
  <p>A simulation: rent = 10 × size + 800 × floor + noise (noise std ₹1,000). Suppose we forgot to record the floor. Then the floor's effect becomes part of the noise from the model's point of view. Floor is a whole number from 0 to 9, whose variance is (10² − 1)/12 = 8.25, so the extra noise variance is 800² × 8.25 = 5,280,000. Total noise variance = 5,280,000 + 1,000² = 6,280,000, and the best possible RMSE is √6,280,000 ≈ ₹2,506.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(0)
n = 20_000
size = rng.uniform(500, 2000, n)             # flat size (sq ft), we record it
floor = rng.integers(0, 10, n)               # floor number, we FORGOT to record it
rent = 10 * size + 800 * floor + rng.normal(0, 1000, n)    # true rule + pure noise (std 1000)

for cols, name in [([size], "size only"), ([size, floor], "size + floor")]:
    X = np.column_stack(cols)
    X_tr, X_te, y_tr, y_te = train_test_split(X, rent, test_size=0.5, random_state=0)
    m = LinearRegression().fit(X_tr, y_tr)
    rmse = np.sqrt(((m.predict(X_te) - y_te) ** 2).mean())
    print(f"{name:13s} test RMSE = {rmse:7.0f}")
print("theory, size only   :", round(np.sqrt(800**2 * 8.25 + 1000**2)))   # Var(floor 0..9) = 8.25
print("theory, size + floor:", 1000)</div>
  <div class="fx" data-lang="text">size only     test RMSE =    2534
size + floor  test RMSE =    1019
theory, size only   : 2506
theory, size + floor: 1000</div>
  <p>Both models are as good as linear regression can be (the true rule is linear), and both sit on their theoretical floor (2,534 vs 2,506 and 1,019 vs 1,000, the small excess is estimation noise). Adding one feature cut the "irreducible" error by 60%. No tuning of the first model could have done that.</p>
  <h3>Classification: the Bayes error</h3>
  <p>For classification, the same idea is the <strong>Bayes error rate</strong>. If, for customers with a given profile, 80% default, then the best possible rule says "default" for all of them and is still wrong 20% of the time. In general the Bayes classifier predicts the most likely class at each x, and its error at x is min(p, 1 − p) for two classes.</p>
  <table class="tbl">
    <tr><th>Profile (equally common)</th><th>P(default)</th><th>best prediction</th><th>unavoidable error</th></tr>
    <tr><td>A</td><td>0.9</td><td>default</td><td>0.1</td></tr>
    <tr><td>B</td><td>0.5</td><td>either</td><td>0.5</td></tr>
    <tr><td>C</td><td>0.2</td><td>no default</td><td>0.2</td></tr>
    <tr><td colspan="3"><strong>Bayes error</strong> = (0.1 + 0.5 + 0.2)/3</td><td><strong>0.267</strong></td></tr>
  </table>
  <p>A model with 27% error on this data is perfect, and a model with 10% error on it is leaking information or being scored wrongly. Knowing roughly where the floor is (human expert error is a common proxy) tells you how much improvement is even possible.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>irreducible error</strong> is the expected loss of the best possible predictor given the available features: σ² = E[(y − E[y | x])²] for squared error, and the <strong>Bayes error</strong> E<sub>x</sub>[1 − max<sub>k</sub> P(y = k | x)] for 0-1 loss. No model using the same features can beat it; new features or better labels can lower it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling all remaining error "noise" too early. If training error is still far above what a domain expert achieves, the error is probably <em>reducible</em> bias (missing features, wrong model), not noise. Conversely, a validation score far below the plausible floor is a red flag for <a class="xref" data-note="ml_pipelines">data leakage</a>.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> On real data we cannot simulate 500 training sets. We need plots built from one dataset that still reveal whether bias or variance is the bigger problem. The first one varies the amount of data.</div>

  <h2 id="bv-lc"><span class="num">08</span>Learning Curves</h2>
  <h3>What a learning curve is</h3>
  <p>Train the same model on growing subsets of the training data (say 15, 30, 60, … rows). For each size, record the training error (on the rows used) and the validation error (on held-out rows). Plot both against the training size. That is a <strong>learning curve</strong>.</p>
  <p>What to expect, by reasoning alone:</p>
  <ul>
    <li><strong>Training error rises</strong> with more rows: memorising 15 points is easy, memorising 480 is hard.</li>
    <li><strong>Validation error falls</strong> with more rows: more data means less variance.</li>
    <li>Both approach the same level: the error the model family can achieve with unlimited data, which is bias² + noise.</li>
  </ul>
  <p>So the <strong>height</strong> where the curves meet shows bias (plus noise), and the <strong>gap</strong> between them shows variance.</p>
  <h3>Building them in code</h3>
  <p><code>learning_curve</code> takes a model, the data, a list of training sizes and a cross-validation splitter. For each split and size it fits on the first n training rows and scores on the validation part. We use 20 random 80/20 splits and report the median, which is steadier than the mean when one tiny fit explodes.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import learning_curve, ShuffleSplit
from sine import sample

X, y = sample(600, np.random.default_rng(1))
cv = ShuffleSplit(n_splits=20, test_size=0.2, random_state=0)   # 20 random 80/20 splits
sizes = [15, 30, 60, 120, 240, 480]
models = {
    "degree 1 (too simple)": make_pipeline(PolynomialFeatures(1), StandardScaler(), LinearRegression()),
    "degree 12 (very flexible)": make_pipeline(PolynomialFeatures(12), StandardScaler(), LinearRegression()),
}
for name, model in models.items():
    n, tr, va = learning_curve(model, X, y, train_sizes=sizes, cv=cv,
                               scoring="neg_mean_squared_error", n_jobs=1)
    print(name)
    for k in range(len(n)):
        trm, vam = -np.median(tr[k]), -np.median(va[k])   # median over the 20 splits
        print(f"  n={n[k]:4d}  train MSE={trm:6.3f}  val MSE={vam:7.3f}  gap={vam - trm:6.3f}")</div>
  <div class="fx" data-lang="text">degree 1 (too simple)
  n=  15  train MSE= 0.217  val MSE=  0.308  gap= 0.091
  n=  30  train MSE= 0.270  val MSE=  0.304  gap= 0.033
  n=  60  train MSE= 0.252  val MSE=  0.299  gap= 0.047
  n= 120  train MSE= 0.285  val MSE=  0.294  gap= 0.009
  n= 240  train MSE= 0.278  val MSE=  0.293  gap= 0.015
  n= 480  train MSE= 0.289  val MSE=  0.292  gap= 0.003
degree 12 (very flexible)
  n=  15  train MSE= 0.033  val MSE=  2.059  gap= 2.026
  n=  30  train MSE= 0.061  val MSE=  0.174  gap= 0.113
  n=  60  train MSE= 0.080  val MSE=  0.134  gap= 0.054
  n= 120  train MSE= 0.088  val MSE=  0.109  gap= 0.021
  n= 240  train MSE= 0.094  val MSE=  0.105  gap= 0.011
  n= 480  train MSE= 0.097  val MSE=  0.102  gap= 0.005</div>
  <figure class="viz"><svg viewBox="0 0 650 235" width="650">
<line x1="55" y1="190" x2="295" y2="190" stroke="currentColor" opacity="0.5"/>
<line x1="55" y1="30" x2="55" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="55" y="204" text-anchor="middle" class="tm" font-size="10.5">15</text>
<line x1="55" y1="190" x2="55" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="151" y="204" text-anchor="middle" class="tm" font-size="10.5">60</text>
<line x1="151" y1="190" x2="151" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="247" y="204" text-anchor="middle" class="tm" font-size="10.5">240</text>
<line x1="247" y1="190" x2="247" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="295" y="204" text-anchor="middle" class="tm" font-size="10.5">480</text>
<line x1="295" y1="190" x2="295" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="50" y="193.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="52" y1="190" x2="55" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="50" y="153.5" text-anchor="end" class="tm" font-size="10.5">0.1</text>
<line x1="52" y1="150" x2="55" y2="150" stroke="currentColor" opacity="0.5"/>
<text x="50" y="113.5" text-anchor="end" class="tm" font-size="10.5">0.2</text>
<line x1="52" y1="110" x2="55" y2="110" stroke="currentColor" opacity="0.5"/>
<text x="50" y="73.5" text-anchor="end" class="tm" font-size="10.5">0.3</text>
<line x1="52" y1="70" x2="55" y2="70" stroke="currentColor" opacity="0.5"/>
<text x="50" y="33.5" text-anchor="end" class="tm" font-size="10.5">0.4</text>
<line x1="52" y1="30" x2="55" y2="30" stroke="currentColor" opacity="0.5"/>
<line x1="55" y1="154" x2="295" y2="154" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<text x="293" y="150" text-anchor="end" class="tm" font-size="10.5">noise</text>
<polyline points="55,103.2 103,82 151,89.2 199,76 247,78.8 295,74.4" fill="none" class="sb" stroke-width="2"/>
<circle cx="55" cy="103.2" r="3" class="tb"/>
<circle cx="103" cy="82" r="3" class="tb"/>
<circle cx="151" cy="89.2" r="3" class="tb"/>
<circle cx="199" cy="76" r="3" class="tb"/>
<circle cx="247" cy="78.8" r="3" class="tb"/>
<circle cx="295" cy="74.4" r="3" class="tb"/>
<text x="230" y="128" class="tb" font-size="11.5">train</text>
<polyline points="55,66.8 103,68.4 151,70.4 199,72.4 247,72.8 295,73.2" fill="none" class="sr" stroke-width="2"/>
<circle cx="55" cy="66.8" r="3" class="tr"/>
<circle cx="103" cy="68.4" r="3" class="tr"/>
<circle cx="151" cy="70.4" r="3" class="tr"/>
<circle cx="199" cy="72.4" r="3" class="tr"/>
<circle cx="247" cy="72.8" r="3" class="tr"/>
<circle cx="295" cy="73.2" r="3" class="tr"/>
<text x="120" y="60" class="tr" font-size="11.5">validation</text>
<text x="175" y="220" text-anchor="middle" class="tm" font-size="11">training rows (log)</text>
<text x="21" y="110" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 21 110)">MSE</text>
<text x="175" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 1: HIGH BIAS</text>
<line x1="385" y1="190" x2="625" y2="190" stroke="currentColor" opacity="0.5"/>
<line x1="385" y1="30" x2="385" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="385" y="204" text-anchor="middle" class="tm" font-size="10.5">15</text>
<line x1="385" y1="190" x2="385" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="481" y="204" text-anchor="middle" class="tm" font-size="10.5">60</text>
<line x1="481" y1="190" x2="481" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="577" y="204" text-anchor="middle" class="tm" font-size="10.5">240</text>
<line x1="577" y1="190" x2="577" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="625" y="204" text-anchor="middle" class="tm" font-size="10.5">480</text>
<line x1="625" y1="190" x2="625" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="380" y="193.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="382" y1="190" x2="385" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="380" y="153.5" text-anchor="end" class="tm" font-size="10.5">0.1</text>
<line x1="382" y1="150" x2="385" y2="150" stroke="currentColor" opacity="0.5"/>
<text x="380" y="113.5" text-anchor="end" class="tm" font-size="10.5">0.2</text>
<line x1="382" y1="110" x2="385" y2="110" stroke="currentColor" opacity="0.5"/>
<text x="380" y="73.5" text-anchor="end" class="tm" font-size="10.5">0.3</text>
<line x1="382" y1="70" x2="385" y2="70" stroke="currentColor" opacity="0.5"/>
<text x="380" y="33.5" text-anchor="end" class="tm" font-size="10.5">0.4</text>
<line x1="382" y1="30" x2="385" y2="30" stroke="currentColor" opacity="0.5"/>
<line x1="385" y1="154" x2="625" y2="154" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<polyline points="385,176.8 433,165.6 481,158 529,154.8 577,152.4 625,151.2" fill="none" class="sb" stroke-width="2"/>
<circle cx="385" cy="176.8" r="3" class="tb"/>
<circle cx="433" cy="165.6" r="3" class="tb"/>
<circle cx="481" cy="158" r="3" class="tb"/>
<circle cx="529" cy="154.8" r="3" class="tb"/>
<circle cx="577" cy="152.4" r="3" class="tb"/>
<circle cx="625" cy="151.2" r="3" class="tb"/>
<text x="470" y="182" class="tb" font-size="11.5">train</text>
<polyline points="385,30 433,120.4 481,136.4 529,146.4 577,148 625,149.2" fill="none" class="sr" stroke-width="2"/>
<circle cx="385" cy="30" r="3" class="tr"/>
<circle cx="433" cy="120.4" r="3" class="tr"/>
<circle cx="481" cy="136.4" r="3" class="tr"/>
<circle cx="529" cy="146.4" r="3" class="tr"/>
<circle cx="577" cy="148" r="3" class="tr"/>
<circle cx="625" cy="149.2" r="3" class="tr"/>
<text x="430" y="70" class="tr" font-size="11.5">validation (2.06 at n=15 ↑)</text>
<text x="505" y="220" text-anchor="middle" class="tm" font-size="11">training rows (log)</text>
<text x="351" y="110" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 351 110)">MSE</text>
<text x="505" y="22" text-anchor="middle" font-size="12.5" font-weight="700">degree 12: HIGH VARIANCE at small n</text>
<text x="392" y="150" class="tm" font-size="11">noise</text>
</svg><figcaption>Left: a line on sine data. The curves meet quickly at about 0.29, far above the noise floor 0.09: more data cannot help, the model is too simple. Right: a degree-12 polynomial. A huge gap at small n that closes as data grows, ending near the noise floor: more data helped a lot.</figcaption></figure>
  <h3>How to read a learning curve</h3>
  <table class="tbl">
    <tr><th>What you see</th><th>Diagnosis</th><th>Will more data help?</th></tr>
    <tr><td>Both curves flat and close together, high above the target error</td><td>high bias</td><td>No. Degree 1: 0.292 at 480 rows, same as at 60.</td></tr>
    <tr><td>Training error far below validation; gap shrinking as n grows</td><td>high variance</td><td>Yes. Degree 12: gap 2.03 → 0.005.</td></tr>
    <tr><td>Big gap that is <em>not</em> shrinking at the right edge</td><td>variance, and data alone will be slow</td><td>Some; also regularize</td></tr>
    <tr><td>Both curves close together near the target error</td><td>good fit</td><td>Little</td></tr>
    <tr><td>Validation better than training at every size</td><td>suspicious</td><td>Check for leakage, or for regularization / dropout that is only active in training</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>learning curve</strong> plots training and validation error (or score) of a fixed model configuration against the number of training examples. The value the curves converge to estimates the model family's asymptotic error (bias² + noise); the gap at a given n estimates the variance-driven part of the generalization gap at that n.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two traps in sklearn. (1) <code>scoring="neg_mean_squared_error"</code> returns <em>negative</em> numbers so that "higher is better"; flip the sign before plotting. (2) <code>learning_curve</code> takes the first n rows of each training fold, so with sorted data (by date, by class) use a shuffled splitter, or the small subsets are not representative.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> A learning curve fixes the model and varies the data. The opposite plot fixes the data and varies one capacity knob. That is how you actually choose depth, k or λ.</div>

  <h2 id="bv-vc"><span class="num">09</span>Validation Curves</h2>
  <h3>What a validation curve is</h3>
  <p>Pick one hyperparameter that controls capacity. For each value, compute cross-validated training and validation error. Plot both against the hyperparameter. It is the U-curve of section 06, measured on real data instead of simulated.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import validation_curve, KFold
from sine import sample

X, y = sample(200, np.random.default_rng(3))
cv = KFold(5, shuffle=True, random_state=0)

depths = [1, 2, 3, 4, 5, 6, 8, 12, 20]
tr, va = validation_curve(DecisionTreeRegressor(random_state=0), X, y, param_name="max_depth",
                          param_range=depths, cv=cv, scoring="neg_mean_squared_error", n_jobs=1)
print("tree max_depth:  ", "  ".join(f"{d:5d}" for d in depths))
print("  train MSE:     ", "  ".join(f"{v:5.3f}" for v in np.abs(tr.mean(1))))
print("  val MSE:       ", "  ".join(f"{v:5.3f}" for v in np.abs(va.mean(1))))

ks = [1, 2, 3, 5, 10, 20, 40, 80, 160]
tr, va = validation_curve(KNeighborsRegressor(), X, y, param_name="n_neighbors",
                          param_range=ks, cv=cv, scoring="neg_mean_squared_error", n_jobs=1)
print("knn n_neighbors: ", "  ".join(f"{k:5d}" for k in ks))
print("  train MSE:     ", "  ".join(f"{v:5.3f}" for v in np.abs(tr.mean(1))))
print("  val MSE:       ", "  ".join(f"{v:5.3f}" for v in np.abs(va.mean(1))))</div>
  <div class="fx" data-lang="text">tree max_depth:       1      2      3      4      5      6      8     12     20
  train MSE:      0.177  0.125  0.078  0.065  0.055  0.043  0.025  0.005  0.000
  val MSE:        0.203  0.133  0.104  0.107  0.119  0.135  0.154  0.176  0.184
knn n_neighbors:      1      2      3      5     10     20     40     80    160
  train MSE:      0.000  0.042  0.057  0.069  0.079  0.091  0.117  0.152  0.601
  val MSE:        0.184  0.134  0.121  0.107  0.099  0.099  0.121  0.156  0.603</div>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600">
<line x1="60" y1="195" x2="560" y2="195" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="25" x2="60" y2="195" stroke="currentColor" opacity="0.5"/>
<text x="60" y="209" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="60" y1="195" x2="60" y2="198" stroke="currentColor" opacity="0.5"/>
<text x="86.3" y="209" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="86.3" y1="195" x2="86.3" y2="198" stroke="currentColor" opacity="0.5"/>
<text x="112.6" y="209" text-anchor="middle" class="tm" font-size="10.5">3</text>
<line x1="112.6" y1="195" x2="112.6" y2="198" stroke="currentColor" opacity="0.5"/>
<text x="138.9" y="209" text-anchor="middle" class="tm" font-size="10.5">4</text>
<line x1="138.9" y1="195" x2="138.9" y2="198" stroke="currentColor" opacity="0.5"/>
<text x="165.3" y="209" text-anchor="middle" class="tm" font-size="10.5">5</text>
<line x1="165.3" y1="195" x2="165.3" y2="198" stroke="currentColor" opacity="0.5"/>
<text x="191.6" y="209" text-anchor="middle" class="tm" font-size="10.5">6</text>
<line x1="191.6" y1="195" x2="191.6" y2="198" stroke="currentColor" opacity="0.5"/>
<text x="244.2" y="209" text-anchor="middle" class="tm" font-size="10.5">8</text>
<line x1="244.2" y1="195" x2="244.2" y2="198" stroke="currentColor" opacity="0.5"/>
<text x="349.5" y="209" text-anchor="middle" class="tm" font-size="10.5">12</text>
<line x1="349.5" y1="195" x2="349.5" y2="198" stroke="currentColor" opacity="0.5"/>
<text x="560" y="209" text-anchor="middle" class="tm" font-size="10.5">20</text>
<line x1="560" y1="195" x2="560" y2="198" stroke="currentColor" opacity="0.5"/>
<text x="55" y="198.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="57" y1="195" x2="60" y2="195" stroke="currentColor" opacity="0.5"/>
<text x="55" y="159.9" text-anchor="end" class="tm" font-size="10.5">0.05</text>
<line x1="57" y1="156.4" x2="60" y2="156.4" stroke="currentColor" opacity="0.5"/>
<text x="55" y="121.2" text-anchor="end" class="tm" font-size="10.5">0.1</text>
<line x1="57" y1="117.7" x2="60" y2="117.7" stroke="currentColor" opacity="0.5"/>
<text x="55" y="82.6" text-anchor="end" class="tm" font-size="10.5">0.15</text>
<line x1="57" y1="79.1" x2="60" y2="79.1" stroke="currentColor" opacity="0.5"/>
<text x="55" y="44" text-anchor="end" class="tm" font-size="10.5">0.2</text>
<line x1="57" y1="40.5" x2="60" y2="40.5" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="125.5" x2="560" y2="125.5" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<text x="558" y="121.5" text-anchor="end" class="tm" font-size="10.5">noise 0.09</text>
<line x1="112.6" y1="25" x2="112.6" y2="195" stroke-dasharray="3 3" class="sg"/>
<text x="116.6" y="35" class="tm" font-size="10.5">best depth = 3</text>
<polyline points="60,58.2 86.3,98.4 112.6,134.7 138.9,144.8 165.3,152.5 191.6,161.8 244.2,175.7 349.5,191.1 560,195" fill="none" class="sb" stroke-width="2"/>
<circle cx="60" cy="58.2" r="3" class="tb"/>
<circle cx="86.3" cy="98.4" r="3" class="tb"/>
<circle cx="112.6" cy="134.7" r="3" class="tb"/>
<circle cx="138.9" cy="144.8" r="3" class="tb"/>
<circle cx="165.3" cy="152.5" r="3" class="tb"/>
<circle cx="191.6" cy="161.8" r="3" class="tb"/>
<circle cx="244.2" cy="175.7" r="3" class="tb"/>
<circle cx="349.5" cy="191.1" r="3" class="tb"/>
<circle cx="560" cy="195" r="3" class="tb"/>
<text x="470" y="180" class="tb" font-size="11.5">train MSE</text>
<polyline points="60,38.1 86.3,92.2 112.6,114.6 138.9,112.3 165.3,103 191.6,90.7 244.2,76 349.5,59 560,52.8" fill="none" class="sr" stroke-width="2"/>
<circle cx="60" cy="38.1" r="3" class="tr"/>
<circle cx="86.3" cy="92.2" r="3" class="tr"/>
<circle cx="112.6" cy="114.6" r="3" class="tr"/>
<circle cx="138.9" cy="112.3" r="3" class="tr"/>
<circle cx="165.3" cy="103" r="3" class="tr"/>
<circle cx="191.6" cy="90.7" r="3" class="tr"/>
<circle cx="244.2" cy="76" r="3" class="tr"/>
<circle cx="349.5" cy="59" r="3" class="tr"/>
<circle cx="560" cy="52.8" r="3" class="tr"/>
<text x="450" y="50" class="tr" font-size="11.5">validation MSE</text>
<text x="310" y="225" text-anchor="middle" class="tm" font-size="11">max_depth of a decision tree →</text>
<text x="26" y="110" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 110)">MSE</text>
<text x="66" y="180" class="tm" font-size="11">← underfit</text>
<text x="300" y="40" class="tm" font-size="11">overfit →</text>
</svg><figcaption>Decision-tree depth on 200 sine rows. Training error falls to 0 as depth grows; validation error is lowest at depth 3 and then climbs as the tree starts carving out single noisy rows.</figcaption></figure>
  <h3>Reading it</h3>
  <ul>
    <li><strong>Trees</strong>: depth 1–2 underfit (val 0.203, 0.133). Depth 3 is best (0.104, close to the noise floor 0.09). From depth 4 on, training error keeps falling but validation rises, reaching 0.184 at depth 20 where training error is 0: every leaf holds one row.</li>
    <li><strong>kNN</strong>: the axis runs the other way. k = 1 is the memoriser (train 0.000, val 0.184). k = 10–20 is best (0.099). k = 160 averages 160 of the 160 training rows in each fold, i.e. predicts nearly the global mean: train and val both ≈ 0.60, pure underfitting.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>validation curve</strong> plots training and cross-validated error against the values of one hyperparameter, with everything else fixed. The value with the lowest validation error is the estimate of the best capacity; the training curve shows how much of the improvement on the right side is just memorisation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The validation error at the chosen value is <em>optimistically biased</em>: you picked the minimum of nine noisy numbers. Report the final model's performance on an untouched test set, or use nested cross-validation (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>). And when two values are within noise of each other, prefer the simpler model (the "one standard error rule").</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We can now measure symptoms. The last practical step: turn the numbers into a decision about what to change next.</div>

  <h2 id="bv-fix"><span class="num">10</span>Diagnosing and Fixing: High Bias vs High Variance</h2>
  <h3>Three numbers</h3>
  <p>A quick diagnosis needs only three error numbers:</p>
  <ol>
    <li><strong>Baseline error</strong>: the best error you could hope for (expert or human-level error, a strong existing system, or an estimate of the noise floor).</li>
    <li><strong>Training error</strong>.</li>
    <li><strong>Validation error</strong>.</li>
  </ol>
  <p>Then <strong>avoidable bias ≈ training − baseline</strong>, and <strong>variance ≈ validation − training</strong>. Whichever is larger is the problem to work on first.</p>
  <h3>Worked by hand: four projects</h3>
  <table class="tbl">
    <tr><th>Project (error %)</th><th>baseline</th><th>train</th><th>val</th><th>avoidable bias</th><th>variance</th><th>verdict</th></tr>
    <tr><td>A</td><td>1</td><td>9</td><td>10</td><td>8</td><td>1</td><td>high bias</td></tr>
    <tr><td>B</td><td>1</td><td>2</td><td>12</td><td>1</td><td>10</td><td>high variance</td></tr>
    <tr><td>C</td><td>1</td><td>9</td><td>20</td><td>8</td><td>11</td><td>both (fix variance first, then bias)</td></tr>
    <tr><td>D</td><td>1</td><td>1.5</td><td>2</td><td>0.5</td><td>0.5</td><td>good fit</td></tr>
  </table>
  <p>Note project A: if the baseline were 8% instead of 1% (a very noisy problem), the same 9% / 10% would be a good fit. The baseline decides whether training error is "high".</p>
  <div class="fx" data-lang="py">def diagnose(base_err, train_err, val_err, tol=0.05):
    avoidable_bias = train_err - base_err     # how far training is from the best possible
    variance = val_err - train_err            # how much worse on unseen rows
    if avoidable_bias &lt; tol and variance &lt; tol:
        verdict = "good fit"
    elif avoidable_bias &gt;= variance:
        verdict = "mainly HIGH BIAS -&gt; bigger model / better features / less regularisation"
    else:
        verdict = "mainly HIGH VARIANCE -&gt; more data / regularise / simpler model"
    return round(avoidable_bias, 3), round(variance, 3), verdict

noise = 0.09                                  # irreducible error of the sine data
for name, tr, va in [("degree 1", 0.220, 0.325), ("degree 3", 0.086, 0.125), ("degree 9", 0.000, 0.701)]:
    print(name, diagnose(noise, tr, va))</div>
  <div class="fx" data-lang="text">degree 1 (0.13, 0.105, 'mainly HIGH BIAS -&gt; bigger model / better features / less regularisation')
degree 3 (-0.004, 0.039, 'good fit')
degree 9 (-0.09, 0.701, 'mainly HIGH VARIANCE -&gt; more data / regularise / simpler model')</div>
  <p>Fed the sine polynomial results from section 02 (baseline = noise 0.09), the function calls degree 1 high bias, degree 3 a good fit, and degree 9 high variance. Negative "avoidable bias" (−0.09 for degree 9) means training error is <em>below</em> the noise floor, which is only possible by fitting noise: a strong overfitting signal by itself.</p>
  <h3>The fix table</h3>
  <table class="tbl">
    <tr><th>High bias (underfitting): try</th><th>High variance (overfitting): try</th></tr>
    <tr><td>A more flexible model (higher degree, deeper trees, bigger network, kernel SVM)</td><td>More training data (or data augmentation)</td></tr>
    <tr><td>Better or more features (interactions, domain ratios, see <a class="xref" data-note="ml_features">Feature Engineering</a>)</td><td>Stronger <a class="xref" data-note="ml_regularization">regularization</a> (larger λ, smaller C, dropout)</td></tr>
    <tr><td>Less regularization (smaller λ, larger C)</td><td>A simpler model or fewer features (feature selection)</td></tr>
    <tr><td>Train longer (more epochs, more boosting rounds)</td><td>Early stopping</td></tr>
    <tr><td>Boosting (adds capacity step by step)</td><td>Bagging / random forest (averages variance away)</td></tr>
    <tr><td><em>Will not help:</em> more data of the same kind</td><td><em>Will not help:</em> a bigger model, training longer</td></tr>
  </table>
  <div class="flow"><span>Is train error near baseline?</span><span>No → fix bias, repeat</span><span>Yes → is val near train?</span><span>No → fix variance, repeat</span><span>Yes → check once on the test set</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Collecting more data for a high-bias model. It is the most expensive mistake on this page: months of labelling, and the learning curve of section 08 shows the result in advance (degree 1 stays at 0.29 whether it has 60 or 480 rows).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Everything so far says "too much capacity hurts". Yet modern neural networks have far more parameters than training rows and generalise well. The classic U-curve is not the whole story.</div>

  <h2 id="bv-dd"><span class="num">11</span>Double Descent (Brief)</h2>
  <h3>The observation</h3>
  <p>Keep increasing capacity past the point where the model can fit the training data exactly (the <strong>interpolation threshold</strong>, about "parameters = rows"). The classic picture says test error keeps rising. In many settings it instead peaks right at the threshold and then <em>falls again</em>, sometimes below the best point of the classic U. This is called <strong>double descent</strong>.</p>
  <p>A small linear demonstration: the target depends a little on each of 300 features, but we have only 40 training rows. The model sees the first p features. When p &gt; 40 there are infinitely many weight vectors that fit the training rows exactly; <code>np.linalg.lstsq</code> returns the one with the smallest length (the <strong>minimum-norm</strong> solution). We also fit ridge regression with λ = 5 at every p.</p>
  <div class="fx" data-lang="py">import numpy as np

D, n_train, n_test = 300, 40, 2000           # 300 real causes, only 40 training rows
ps = [5, 10, 20, 30, 35, 40, 45, 50, 70, 100, 200, 300]
res = {p: [] for p in ps}
for seed in range(30):                        # 30 repeats, report the median
    rng = np.random.default_rng(seed)
    beta = rng.normal(0, 1, D) / np.sqrt(D)  # every feature matters a little
    X_tr = rng.normal(size=(n_train, D)); X_te = rng.normal(size=(n_test, D))
    y_tr = X_tr @ beta + rng.normal(0, 0.3, n_train)
    y_te = X_te @ beta + rng.normal(0, 0.3, n_test)
    for p in ps:                              # model sees only the first p features
        A, B = X_tr[:, :p], X_te[:, :p]
        w, *_ = np.linalg.lstsq(A, y_tr, rcond=None)              # min-norm solution if p &gt; n
        w_r = np.linalg.solve(A.T @ A + 5.0 * np.eye(p), A.T @ y_tr)  # ridge, lambda = 5
        res[p].append((((A @ w - y_tr) ** 2).mean(), ((B @ w - y_te) ** 2).mean(),
                       ((B @ w_r - y_te) ** 2).mean()))
print("  p   train MSE   test MSE   ridge test MSE")
for p in ps:
    v = np.median(np.array(res[p]), axis=0)
    print(f"{p:4d} {v[0]:10.3f} {v[1]:10.3f} {v[2]:12.3f}")</div>
  <div class="fx" data-lang="text">  p   train MSE   test MSE   ridge test MSE
   5      0.894      1.197        1.165
  10      0.730      1.331        1.244
  20      0.416      2.014        1.520
  30      0.200      3.959        1.823
  35      0.069      5.977        1.823
  40      0.000     56.630        1.781
  45      0.000      7.355        1.775
  50      0.000      4.453        1.737
  70      0.000      2.029        1.575
 100      0.000      1.410        1.331
 200      0.000      1.082        1.075
 300      0.000      0.962        0.961</div>
  <figure class="viz"><svg viewBox="0 0 620 250" width="620">
<line x1="60" y1="205" x2="580" y2="205" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="25" x2="60" y2="205" stroke="currentColor" opacity="0.5"/>
<text x="60" y="219" text-anchor="middle" class="tm" font-size="10.5">5</text>
<line x1="60" y1="205" x2="60" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="148" y="219" text-anchor="middle" class="tm" font-size="10.5">10</text>
<line x1="148" y1="205" x2="148" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="236.1" y="219" text-anchor="middle" class="tm" font-size="10.5">20</text>
<line x1="236.1" y1="205" x2="236.1" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="324.1" y="219" text-anchor="middle" class="tm" font-size="10.5">40</text>
<line x1="324.1" y1="205" x2="324.1" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="440.5" y="219" text-anchor="middle" class="tm" font-size="10.5">100</text>
<line x1="440.5" y1="205" x2="440.5" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="580" y="219" text-anchor="middle" class="tm" font-size="10.5">300</text>
<line x1="580" y1="205" x2="580" y2="208" stroke="currentColor" opacity="0.5"/>
<text x="55" y="208.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="57" y1="205" x2="60" y2="205" stroke="currentColor" opacity="0.5"/>
<text x="55" y="163.5" text-anchor="end" class="tm" font-size="10.5">2</text>
<line x1="57" y1="160" x2="60" y2="160" stroke="currentColor" opacity="0.5"/>
<text x="55" y="118.5" text-anchor="end" class="tm" font-size="10.5">4</text>
<line x1="57" y1="115" x2="60" y2="115" stroke="currentColor" opacity="0.5"/>
<text x="55" y="73.5" text-anchor="end" class="tm" font-size="10.5">6</text>
<line x1="57" y1="70" x2="60" y2="70" stroke="currentColor" opacity="0.5"/>
<text x="55" y="28.5" text-anchor="end" class="tm" font-size="10.5">8</text>
<line x1="57" y1="25" x2="60" y2="25" stroke="currentColor" opacity="0.5"/>
<line x1="324.1" y1="25" x2="324.1" y2="205" stroke-dasharray="3 3" class="sg"/>
<polyline points="60,184.9 148,188.6 236.1,195.6 287.6,200.5 307.1,203.4 324.1,205 339.1,205 352.4,205 395.2,205 440.5,205 528.5,205 580,205" fill="none" class="sb" stroke-width="2"/>
<circle cx="60" cy="184.9" r="3" class="tb"/>
<circle cx="148" cy="188.6" r="3" class="tb"/>
<circle cx="236.1" cy="195.6" r="3" class="tb"/>
<circle cx="287.6" cy="200.5" r="3" class="tb"/>
<circle cx="307.1" cy="203.4" r="3" class="tb"/>
<circle cx="324.1" cy="205" r="3" class="tb"/>
<circle cx="339.1" cy="205" r="3" class="tb"/>
<circle cx="352.4" cy="205" r="3" class="tb"/>
<circle cx="395.2" cy="205" r="3" class="tb"/>
<circle cx="440.5" cy="205" r="3" class="tb"/>
<circle cx="528.5" cy="205" r="3" class="tb"/>
<circle cx="580" cy="205" r="3" class="tb"/>
<text x="330" y="196" class="tb" font-size="11.5">train MSE (hits 0 at p = n)</text>
<polyline points="60,178.1 148,175.1 236.1,159.7 287.6,115.9 307.1,70.5 324.1,25 339.1,39.5 352.4,104.8 395.2,159.3 440.5,173.3 528.5,180.7 580,183.4" fill="none" class="sr" stroke-width="2"/>
<circle cx="60" cy="178.1" r="3" class="tr"/>
<circle cx="148" cy="175.1" r="3" class="tr"/>
<circle cx="236.1" cy="159.7" r="3" class="tr"/>
<circle cx="287.6" cy="115.9" r="3" class="tr"/>
<circle cx="307.1" cy="70.5" r="3" class="tr"/>
<circle cx="324.1" cy="25" r="3" class="tr"/>
<circle cx="339.1" cy="39.5" r="3" class="tr"/>
<circle cx="352.4" cy="104.8" r="3" class="tr"/>
<circle cx="395.2" cy="159.3" r="3" class="tr"/>
<circle cx="440.5" cy="173.3" r="3" class="tr"/>
<circle cx="528.5" cy="180.7" r="3" class="tr"/>
<circle cx="580" cy="183.4" r="3" class="tr"/>
<text x="70" y="45" class="tr" font-size="11.5">test MSE (peak 56.6, clipped)</text>
<text x="320" y="235" text-anchor="middle" class="tm" font-size="11">number of parameters p (log scale)</text>
<text x="26" y="115" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 115)">MSE</text>
<text x="75" y="120" class="tm" font-size="11">classic U</text>
<text x="470" y="150" class="tm" font-size="11">second descent</text>
<text x="400" y="100" class="tg" font-size="11">p = n = 40 (threshold)</text>
</svg><figcaption>Plain least squares: the classic U on the left (best near p = 5), a spike exactly where p equals the number of rows, then a second descent that ends lower (0.96 at p = 300) than the first minimum (1.20).</figcaption></figure>
  <h3>Why it happens</h3>
  <ul>
    <li><strong>At p = n</strong> there is exactly one weight vector that fits all 40 rows, including their noise. To hit every noisy point it needs enormous weights, so its variance explodes (median test MSE 56.6).</li>
    <li><strong>Beyond p = n</strong> many weight vectors fit the rows. The minimum-norm choice spreads the fit thinly over many features and keeps weights small: an <em>implicit</em> regularization. The more features, the smaller the norm needed, so variance falls again.</li>
    <li><strong>With explicit regularization</strong> (the ridge column) the spike disappears: 1.78 at p = 40 instead of 56.6. Properly tuned regularization largely removes double descent.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Double descent does not overturn bias–variance; it shows that "number of parameters" is a poor measure of capacity. What matters is the effective capacity of the solution the training procedure actually picks (minimum norm, early-stopped gradient descent, weight decay). Gradient descent started from zero on a linear least-squares problem converges to exactly that minimum-norm solution, which is one reason heavily over-parameterised networks still generalise.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Double descent means overfitting is a myth, just make models bigger." For classical tabular models (polynomials, trees, kNN, boosting) the U-curve still describes what you will see, and the peak region is real and dangerous. Always check with a validation curve.</p>
  </div>

  <h2 id="bv-compare"><span class="num">12</span>Comparisons</h2>
  <h3>Where common models sit</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Typical bias</th><th>Typical variance</th><th>Main capacity knob</th></tr>
    <tr><td><a class="xref" data-note="ml_regression">Linear / logistic regression</a></td><td>high (if the pattern bends)</td><td>low</td><td>features, λ</td></tr>
    <tr><td><a class="xref" data-note="ml_naivebayes">Naive Bayes</a></td><td>high (independence assumption)</td><td>very low</td><td>smoothing</td></tr>
    <tr><td><a class="xref" data-note="ml_knn">kNN</a></td><td>low at small k</td><td>high at small k</td><td>k (reversed)</td></tr>
    <tr><td><a class="xref" data-note="ml_dtree">Deep decision tree</a></td><td>low</td><td>very high</td><td>depth, leaf size, pruning</td></tr>
    <tr><td><a class="xref" data-note="ml_rf">Random forest</a></td><td>low (deep trees)</td><td>reduced by averaging</td><td>max_features, leaf size</td></tr>
    <tr><td><a class="xref" data-note="ml_gbm">Gradient boosting</a></td><td>starts high, reduced each round</td><td>grows with rounds</td><td>rounds × learning rate, depth</td></tr>
    <tr><td><a class="xref" data-note="ml_svm">RBF SVM</a></td><td>depends on C, gamma</td><td>depends on C, gamma</td><td>C, gamma</td></tr>
  </table>
  <h3>The two diagnostic plots</h3>
  <table class="tbl">
    <tr><th></th><th>Learning curve</th><th>Validation curve</th></tr>
    <tr><td>x-axis</td><td>number of training rows</td><td>one hyperparameter</td></tr>
    <tr><td>Held fixed</td><td>model and hyperparameters</td><td>dataset size</td></tr>
    <tr><td>Answers</td><td>"will more data help?"</td><td>"which capacity is best?"</td></tr>
    <tr><td>High bias looks like</td><td>curves meet early, high up</td><td>both errors high at the chosen value; the best value is at the "flexible" end of the range</td></tr>
    <tr><td>High variance looks like</td><td>wide gap closing slowly</td><td>validation rising while training keeps falling</td></tr>
    <tr><td>sklearn</td><td><code>learning_curve</code>, <code>LearningCurveDisplay</code></td><td><code>validation_curve</code>, <code>ValidationCurveDisplay</code></td></tr>
  </table>
  <h3>Bias vs variance in one table</h3>
  <table class="tbl">
    <tr><th></th><th>Bias</th><th>Variance</th><th>Irreducible error</th></tr>
    <tr><td>Meaning</td><td>average model is wrong</td><td>models disagree across samples</td><td>noise given the features</td></tr>
    <tr><td>Symptom</td><td>high training error</td><td>train–val gap</td><td>a floor nobody beats</td></tr>
    <tr><td>Shrinks with more data?</td><td>no</td><td>yes</td><td>no</td></tr>
    <tr><td>Shrinks with more capacity?</td><td>yes</td><td>no (grows)</td><td>no</td></tr>
    <tr><td>Shrinks with better features?</td><td>often</td><td>sometimes</td><td>yes</td></tr>
  </table>

  <h2 id="bv-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: choosing a model by training score</span>
    <p>The memoriser (train MSE 0) lost to a straight line, and degree 9 (train MSE 0) lost to degree 3. Training error always favours the most flexible model.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: more data as the universal fix</span>
    <p>It shrinks variance only. A high-bias model's learning curve is already flat; more rows change nothing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mixing up the meaning of "variance"</span>
    <p>Model variance is the spread of predictions at a fixed x across training sets, not the variance of y, of a feature, or of predictions across rows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the kNN direction</span>
    <p>Small k = high capacity = high variance; large k = low capacity = high bias. Interviewers ask this precisely because it is the reverse of most knobs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tuning on the test set</span>
    <p>Picking the depth or degree with the best test score turns the test set into a validation set; its score is no longer an honest estimate. Use a validation split or CV for choosing, and the test set once at the end.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging a gap without a baseline</span>
    <p>9% training error is high bias if experts get 1% and a good fit if the Bayes error is 8%. Always estimate the floor.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scores that beat the floor</span>
    <p>Validation error below any plausible noise level usually means leakage (a feature computed from the target, duplicates across the split, scaling fitted on all data). Investigate before celebrating.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the sign in sklearn</span>
    <p><code>neg_mean_squared_error</code> and friends are negative. Plotting them unflipped makes the "best" model look worst.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "parameters = capacity" in both directions</span>
    <p>A regularized model with many parameters can have low effective capacity (ridge, min-norm, early stopping), and a model with no parameters (1-NN) can have maximal capacity.</p>
  </div>

  <h2 id="bv-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is generalization, and why can't training error measure it?</summary><div class="qa-body">Generalization is low expected loss on new rows from the same distribution (the true risk). Training error is computed on the rows the model was fitted to, so it rewards memorisation: a 1-NN memoriser had training MSE 0 but test MSE 1.00, while a line had 0.32 and 0.05. Only held-out data or cross-validation estimates true risk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the bias–variance decomposition and explain each term.</summary><div class="qa-body">E[(y − f̂(x))²] = (E[f̂(x)] − f(x))² + E[(f̂(x) − E[f̂(x)])²] + σ². Bias²: how far the average model (over many training sets) is from the truth. Variance: how much models trained on different samples disagree at x. σ²: noise in y given x, which no model can remove.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive it. Why do the cross terms vanish?</summary><div class="qa-body">Write y − f̂ = (f − f̂) + ε and expand; E[ε(f − f̂)] = 0 because test noise is independent of the training set and has mean 0, leaving E[(f − f̂)²] + σ². Then write f − f̂ = (f − f̄) + (f̄ − f̂) and expand; (f − f̄) is a constant and E[f̄ − f̂] = 0 by the definition of f̄, so the cross term is 0, leaving (f − f̄)² + E[(f̂ − f̄)²].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predictions from four training sets are 7, 9, 9, 11; truth 10; test noise ±1 equally likely. Compute the expected error and its parts.</summary><div class="qa-body">Mean prediction 9 → bias² = 1. Variance = (4 + 0 + 0 + 4)/4 = 2. Noise = 1. Total 4, which matches the direct average of (y − pred)² over the 8 combinations: (10 + 2 + 2 + 2)/4 = 4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you tell underfitting from overfitting in practice?</summary><div class="qa-body">Compare training error, validation error and a baseline. Underfitting: training error well above the baseline and validation close to training. Overfitting: training error low (possibly below the noise floor) and validation much higher. Learning curves and validation curves show the same thing across data sizes and hyperparameter values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your learning curves converge quickly to a high error. What do you do, and what don't you do?</summary><div class="qa-body">That is high bias. Increase capacity (more flexible model, more or better features, less regularization, more training rounds). Do not spend effort on more data: a converged learning curve shows extra rows will not move the error (degree 1 stayed at 0.29 from 60 to 480 rows).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does k in kNN, depth in a tree and λ in ridge each move bias and variance?</summary><div class="qa-body">kNN: smaller k → lower bias, higher variance (k = 1 memorises). Tree: deeper → lower bias, higher variance. Ridge: larger λ → higher bias, lower variance. Only kNN's knob runs "backwards" relative to capacity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is irreducible error, and can it ever be reduced?</summary><div class="qa-body">It is the error of the best possible predictor given the features: σ² = E[(y − E[y|x])²] (or the Bayes error for classification). No model can beat it with the same features, but new features or cleaner labels can lower it: adding the floor feature cut the rent RMSE floor from about 2,506 to 1,000.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a biased estimator be better than an unbiased one? Give an example.</summary><div class="qa-body">Yes. Estimating μ = 1 with n = 5 noisy observations (σ = 2): the sample mean has MSE 0.8. Shrinking it, 0.556·x̄, adds bias² 0.197 but cuts variance to 0.247, for MSE 0.444. Ridge regression, lasso and early stopping all exploit this trade.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is model capacity, and is it the same as the number of parameters?</summary><div class="qa-body">Capacity is the richness of the functions a model can fit (VC dimension is one formal measure: d + 1 for linear classifiers in d dimensions). It is related to but not equal to the parameter count: ridge has the same parameters as OLS but lower effective capacity; 1-NN has no parameters but maximal capacity; trained deep nets have far fewer effective degrees of freedom than parameters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is double descent and why does it happen?</summary><div class="qa-body">Test error versus number of parameters shows the classic U, a spike at the interpolation threshold (parameters ≈ rows), then a second decrease. At the threshold the only interpolating solution needs huge weights (test MSE 56.6 in the demo); past it, minimum-norm solutions spread the fit and act as implicit regularization (0.96 at p = 300). Explicit ridge removes the spike (1.78 at p = n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do random forests average many deep trees instead of using one shallow tree?</summary><div class="qa-body">A shallow tree has high bias; a deep tree has low bias but high variance. Averaging B trees whose errors are not perfectly correlated divides the variance part (ρσ² + (1 − ρ)σ²/B) while leaving bias almost unchanged. So the forest keeps the low bias and loses much of the variance. Boosting goes the other way: it starts from high-bias stumps and reduces bias round by round.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does regularization relate to this note, and what will the next notes add?</summary><div class="qa-body">Regularization adds a penalty on model complexity to the training loss, moving the model towards higher bias and lower variance with a continuous dial λ chosen by a validation curve or CV. The <a class="xref" data-note="ml_loss_gd">loss and gradient descent</a> note shows what the training loss is and how it is minimised; the <a class="xref" data-note="ml_regularization">regularization</a> note adds the penalty term and shows L1 vs L2 behaviour.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your validation error is lower than your training error. List possible reasons.</summary><div class="qa-body">Small or easy validation set (luck: our line had test 0.05 vs train 0.32 on 4 rows); regularization active only during training (dropout, data augmentation); training error measured during an epoch while weights were still changing; or leakage from validation into training features. Check with more folds and inspect the pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is there a bias–variance decomposition for classification accuracy?</summary><div class="qa-body">Not an additive one. For 0-1 loss, variance can even help when the average model is wrong (it sometimes flips to the right answer) and hurt when it is right. Several definitions exist (Domingos, Kohavi–Wolpert), but the clean sum Bias² + Var + σ² holds only for squared error. The qualitative lessons (capacity trade-off, averaging cuts variance) still apply, and for probabilistic classifiers you can apply the squared-error version to predicted probabilities (Brier score).</div></details>
</main>
`
});
