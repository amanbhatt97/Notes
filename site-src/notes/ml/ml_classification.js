// ml/ml_classification.js — Classification
Object.assign(TOPIC_CONTENT, {
  "ml_classification": `<main>
  <h1>Classification</h1>
  <p class="lead">Classification predicts a category: spam or not, loan default or not, which disease. This note covers the four classic methods, each first worked by hand on a handful of points and then run in sklearn: logistic regression (a line through log-odds, trained one gradient step at a time), Naive Bayes (counting words with Bayes' rule), KNN (ask the neighbours) and SVM (the widest gap, bent by kernels). At the end all of them run on one dataset. Builds on <a class="xref" data-note="ml_regression">Regression</a> and basic probability.</p>

  <h2 id="mcl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Classification</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Logistic regression</div>
        <ul>
          <li><b>Model</b> — P(y=1|x) = σ(wᵀx + b), σ(z) = 1/(1 + e⁻ᶻ)</li>
          <li><b>Log-odds</b> — log(p/(1−p)) = wᵀx + b; linear in log-odds</li>
          <li><b>Coefficient</b> — +1 unit multiplies odds by e^w (odds ratio)</li>
          <li><b>Boundary</b> — wᵀx + b = 0: a straight line / hyperplane</li>
          <li>⚠ +1 log-odds moves p by 0.23 at p=0.5, only 0.03 at p=0.02</li>
          <li>💡 A fan regulator, not an on/off switch</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training logistic</div>
        <ul>
          <li><b>Loss</b> — log loss −mean[y·log p + (1−y)·log(1−p)]; no closed form</li>
          <li><b>Gradient</b> — ∂/∂w = mean((p − y)·x); ∂/∂b = mean(p − y)</li>
          <li>Toy: start loss 0.693 → step 1 → 0.672; converges w=1.21, b=−4.25</li>
          <li>Boundary at −b/w = 3.5 hours</li>
          <li><b>C</b> — inverse regularisation; smaller C = stronger shrink</li>
          <li>⚠ 0.5 threshold is arbitrary; pick from the PR curve</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Naive Bayes</div>
        <ul>
          <li><b>Rule</b> — P(y|x) ∝ P(y)·Π P(xᵢ|y)</li>
          <li><b>Naive</b> — features independent given the class</li>
          <li><b>Laplace</b> — (count+1)/(total+V); toy P(free|spam) = 4/40 = 0.10</li>
          <li>"free lunch monday" → spam 0.382 by hand and in sklearn</li>
          <li><b>Gaussian</b> continuous · <b>Multinomial</b> counts · <b>Bernoulli</b> present/absent</li>
          <li>⚠ Trust the winning class, not the exact probability</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">KNN</div>
        <ul>
          <li><b>How</b> — majority vote of the k nearest training points</li>
          <li>Toy: query (3,3) → k=1 red, k=3 red, k=5 blue</li>
          <li><b>Lazy</b> — no training; O(n·d) per prediction</li>
          <li><b>k</b> — small = jagged; large = blurry; pick by CV</li>
          <li>⚠ <b>Scale first</b> — wine: 0.691 raw → 0.949 scaled</li>
          <li>⚠ <b>Curse of dimensionality</b> — nearest/farthest 0.01 at d=2, 0.90 at d=1000</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SVM &amp; kernels</div>
        <ul>
          <li><b>Goal</b> — widest margin; margin = 2/‖w‖</li>
          <li>Toy 1-D: −{1,2}, +{4,5} → w=1, b=−3, boundary 3, margin 2, SVs 2 and 4</li>
          <li><b>C</b> — high C: narrow, strict; low C: wide, tolerant (moons 416 → 88 SVs)</li>
          <li><b>Kernel</b> — K(a,b) = φ(a)·φ(b) without building φ; (a·b)² = 121 both ways</li>
          <li><b>RBF</b> — exp(−γ‖a−b‖²); γ high = wiggly (train .983, test .811)</li>
          <li>⚠ Scale features; kernel SVM is O(n²)+ — avoid beyond ~100k rows</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing</div>
        <ul>
          <li><b>Baseline</b> — logistic: fast, explainable, calibrated</li>
          <li><b>Text, tiny data</b> — Naive Bayes</li>
          <li><b>Small, low-d, odd shapes</b> — KNN or RBF SVM</li>
          <li><b>Tabular, real money</b> — gradient boosting usually wins</li>
          <li>Moons test acc: logistic 0.844, KNN-15 0.889, RBF 0.872, tree 0.883</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mcl-logit"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Logistic Regression</span><span class="rm-sub">Sigmoid, odds, log-odds</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-train"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Training Logistic by Hand</span><span class="rm-sub">Log loss, one gradient step, real data</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-nb"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Naive Bayes</span><span class="rm-sub">Count words, multiply, compare</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-knn"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">K-Nearest Neighbours</span><span class="rm-sub">Distance, k, scaling</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-svm"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Support Vector Machines</span><span class="rm-sub">Margin, support vectors, C</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-kernel"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Kernels</span><span class="rm-sub">Lifting into a new space</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-cmp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Boundaries Compared</span><span class="rm-sub">One dataset, eight models</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-choose"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">When to Use Each</span><span class="rm-sub">Decision table</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Scaling, thresholds, odds</span></div></div>
      <div class="rm-item rm-done" data-target="mcl-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mcl-logit"><span class="num">01</span>Logistic Regression</h2>
  <p>A bank wants to know: will this customer miss an EMI? The answer is yes or no, but the bank wants more than a yes/no. It wants a <em>probability</em>, so it can set its own cut-off: reject above 30% risk, review between 10% and 30%. Plain linear regression (from the Regression note) is the wrong tool. Fit a line to 0/1 labels and it happily predicts −0.3 or 1.4 for some customers. Those are not probabilities.</p>
  <p>Logistic regression keeps the familiar linear score, z = w·x + b, and then passes it through a squashing curve called the <strong>sigmoid</strong>, σ(z) = 1 / (1 + e⁻ᶻ). Any number goes in; a number between 0 and 1 comes out. Big positive z gives nearly 1, big negative z gives nearly 0, and z = 0 gives exactly 0.5.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fan regulator, not an on/off switch. Evidence adds up in a straight line as you turn the knob (the score z). The sigmoid turns it into a fan speed between "off" and "full". Near the middle, a small turn changes the speed a lot; near the ends, the fan is already at its limit and barely changes.</p>
  </div>
  <h3>Worked example: squash a few scores</h3>
  <p>The <strong>odds</strong> are p / (1 − p): "3 to 1 in favour" means odds 3, p = 0.75. The trick of logistic regression is that the linear score z equals the log of the odds. So e^z is the odds, and σ(z) is the probability.</p>
  <table class="tbl out"><caption>Sigmoid at a few scores (real values)</caption>
    <tr><th>score z</th><th>odds e^z</th><th>p = σ(z)</th><th>reading</th></tr>
    <tr><td>−4</td><td>0.018</td><td>0.018</td><td>almost surely no</td></tr>
    <tr><td>−3</td><td>0.050</td><td>0.047</td><td>very unlikely</td></tr>
    <tr><td>−1</td><td>0.368</td><td>0.269</td><td>unlikely</td></tr>
    <tr><td>0</td><td>1.000</td><td>0.500</td><td>coin toss: the boundary</td></tr>
    <tr><td>+1</td><td>2.718</td><td>0.731</td><td>likely</td></tr>
    <tr><td>+2</td><td>7.389</td><td>0.881</td><td>very likely</td></tr>
    <tr><td>+4</td><td>54.6</td><td>0.982</td><td>almost surely yes</td></tr>
  </table>
  <p>Look at the steps. z from 0 to 1 moves p from 0.50 to 0.73 (a jump of 0.23). z from −4 to −3 moves p from 0.018 to 0.047 (a jump of 0.03). Same +1 in score, very different change in probability. Every +1 in z does the same thing to the <em>odds</em>, though: it multiplies them by e ≈ 2.72.</p>
  <figure class="viz"><svg viewBox="0 0 560 230" width="560">
<line x1="40" y1="190" x2="525" y2="190" stroke="currentColor"/><line x1="280" y1="15" x2="280" y2="195" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="40" y1="105" x2="525" y2="105" stroke="currentColor" stroke-dasharray="2 4"/>
<text x="34" y="194" text-anchor="end" class="tm" font-size="11">0</text><text x="34" y="109" text-anchor="end" class="tm" font-size="11">0.5</text><text x="34" y="24" text-anchor="end" class="tm" font-size="11">1</text>
<text x="40" y="207" text-anchor="middle" class="tm" font-size="11">−6</text><text x="160" y="207" text-anchor="middle" class="tm" font-size="11">−3</text><text x="280" y="207" text-anchor="middle" class="tm" font-size="11">0</text><text x="400" y="207" text-anchor="middle" class="tm" font-size="11">3</text><text x="520" y="207" text-anchor="middle" class="tm" font-size="11">6</text>
<polyline points="40,190 60,189 80,189 100,188 120,187 140,185 160,182 180,177 200,170 220,159 240,144 260,126 280,105 300,84 320,66 340,51 360,40 380,33 400,28 420,25 440,23 460,22 480,21 500,21 520,20" fill="none" class="sb" stroke-width="2.5"/>
<line x1="280" y1="105" x2="320" y2="105" class="sg" stroke-width="3"/><line x1="320" y1="105" x2="320" y2="66" class="sg" stroke-width="3"/>
<text x="328" y="96" class="tg" font-size="12">z 0→1: p 0.50→0.73</text>
<line x1="120" y1="187" x2="160" y2="187" class="sr" stroke-width="3"/><line x1="160" y1="187" x2="160" y2="182" class="sr" stroke-width="3"/>
<text x="50" y="150" class="tr" font-size="12">z −4→−3: p 0.02→0.05</text>
<text x="272" y="34" text-anchor="end" font-size="12">boundary: wᵀx + b = 0</text>
<text x="525" y="222" text-anchor="end" class="tm" font-size="12">z = wᵀx + b (log-odds)</text>
</svg><figcaption>The sigmoid squashes any score into a probability. The same +1 step in log-odds moves p a lot in the middle, barely at the ends.</figcaption></figure>
  <p>The code below computes the same table, so you can see σ and e^z are one line each in NumPy.</p>
  <div class="fx" data-lang="py">import numpy as np
def sigmoid(z): return 1 / (1 + np.exp(-z))
for z in [-4, -3, -1, 0, 1, 2, 4]:
    print(f"z={z:+d}  p={sigmoid(z):.3f}  odds={np.exp(z):.3f}")</div>
  <div class="fx" data-lang="text">z=-4  p=0.018  odds=0.018
z=-3  p=0.047  odds=0.050
z=-1  p=0.269  odds=0.368
z=+0  p=0.500  odds=1.000
z=+1  p=0.731  odds=2.718
z=+2  p=0.881  odds=7.389
z=+4  p=0.982  odds=54.598</div>
  <p><code>sigmoid</code> works on whole arrays because <code>np.exp</code> does. Notice odds and p are almost equal when p is tiny (z = −4): for rare events, odds ≈ probability.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Logistic regression</strong>: P(y = 1 | x) = σ(wᵀx + b). Equivalently <strong>log(p / (1 − p)) = wᵀx + b</strong>: the model is linear in the <strong>log-odds</strong> (also called the logit). A coefficient w means "+1 unit of this feature adds w to the log-odds", i.e. multiplies the odds by e^w, the <strong>odds ratio</strong>. The <strong>decision boundary</strong> is where p = 0.5, i.e. wᵀx + b = 0, a straight line (hyperplane).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never say "w increases the probability by w". It changes the <em>log-odds</em> by w; the probability change depends on where you start (0.23 at p = 0.5, 0.03 at p = 0.02). Also, the boundary is a straight line: logistic regression cannot learn circles or XOR unless you add features like x² or x₁·x₂.</p>
  </div>

  <h2 id="mcl-train"><span class="num">02</span>Training Logistic Regression by Hand</h2>
  <p>For the regression line we had a formula for the best weights. Logistic regression has none: no closed form exists. So we start with a guess and improve it step by step with gradient descent. But improve by what measure? Squared error through a sigmoid gives a bumpy loss with tiny gradients when the model is confidently wrong. Instead we use <strong>log loss</strong>: for each row, −log of the probability the model gave to the <em>true</em> answer. Say 0.9 for the truth: cost 0.105. Say 0.1 for the truth: cost 2.30. Confident and wrong is punished hard.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A weather forecaster who said "90% chance of rain" on a dry day should lose more credibility than one who said "55%". Log loss scores forecasters this way: it rewards honest confidence and punishes bluffing.</p>
  </div>
  <h3>Worked example: one gradient step on six students</h3>
  <p>Hours studied x = 1, 2, 3, 4, 5, 6 and passed y = 0, 0, 1, 0, 1, 1 (the 3-hour student got lucky, the 4-hour one did not). Start with w = 0, b = 0. The gradient of log loss is simple: ∂/∂w = mean((p − y)·x) and ∂/∂b = mean(p − y). Learning rate 0.5.</p>
  <table class="tbl out"><caption>Step 1 from w = 0, b = 0</caption>
    <tr><th>x</th><th>y</th><th>z = 0·x + 0</th><th>p</th><th>p − y</th><th>(p − y)·x</th></tr>
    <tr><td>1</td><td>0</td><td>0</td><td>0.5</td><td>0.5</td><td>0.5</td></tr>
    <tr><td>2</td><td>0</td><td>0</td><td>0.5</td><td>0.5</td><td>1.0</td></tr>
    <tr><td>3</td><td>1</td><td>0</td><td>0.5</td><td>−0.5</td><td>−1.5</td></tr>
    <tr><td>4</td><td>0</td><td>0</td><td>0.5</td><td>0.5</td><td>2.0</td></tr>
    <tr><td>5</td><td>1</td><td>0</td><td>0.5</td><td>−0.5</td><td>−2.5</td></tr>
    <tr><td>6</td><td>1</td><td>0</td><td>0.5</td><td>−0.5</td><td>−3.0</td></tr>
    <tr><td colspan="4"><strong>mean</strong></td><td><strong>0.000</strong></td><td><strong>−0.583</strong></td></tr>
  </table>
  <ol>
    <li>Loss before: every p is 0.5, so each row costs −log 0.5 = 0.693. Mean <strong>0.693</strong>.</li>
    <li>Gradients: ∂/∂w = −3.5 / 6 = −0.583; ∂/∂b = 0.</li>
    <li>Update: w = 0 − 0.5 × (−0.583) = <strong>0.292</strong>; b stays 0. A positive w means "more hours, more likely to pass". Good direction.</li>
    <li>New probabilities rise with hours (0.57 … 0.85), and the loss drops to <strong>0.672</strong>.</li>
  </ol>
  <p>The code repeats exactly this, prints the first three steps, then runs 5,000 steps and compares with sklearn.</p>
  <div class="fx" data-lang="py">hours = np.array([1, 2, 3, 4, 5, 6.]); passed = np.array([0, 0, 1, 0, 1, 1])
w, b, lr = 0.0, 0.0, 0.5
def logloss(p, y): return -(y*np.log(p) + (1-y)*np.log(1-p)).mean()
for step in range(1, 4):
    p = sigmoid(w * hours + b)
    gw = ((p - passed) * hours).mean(); gb = (p - passed).mean()
    print(f"step {step}: p={p.round(3)} loss={logloss(p, passed):.3f} gw={gw:.3f} gb={gb:.3f}")
    w -= lr * gw; b -= lr * gb
    print(f"   -&gt; w={w:.3f} b={b:.3f}")
for step in range(4, 5001):
    p = sigmoid(w * hours + b)
    w -= lr * ((p - passed) * hours).mean(); b -= lr * (p - passed).mean()
p = sigmoid(w*hours+b)
print(f"after 5000 steps w={w:.3f} b={b:.3f} loss={logloss(p, passed):.3f} boundary x={-b/w:.2f}")
from sklearn.linear_model import LogisticRegression
m = LogisticRegression(C=1e6).fit(hours[:, None], passed)
print(f"sklearn w={m.coef_[0,0]:.3f} b={m.intercept_[0]:.3f}  P(pass|3.5h)={m.predict_proba([[3.5]])[0,1]:.3f}")</div>
  <div class="fx" data-lang="text">step 1: p=[0.5 0.5 0.5 0.5 0.5 0.5] loss=0.693 gw=-0.583 gb=0.000
   -&gt; w=0.292 b=0.000
step 2: p=[0.572 0.642 0.706 0.763 0.811 0.852] loss=0.672 gw=0.365 gb=0.224
   -&gt; w=0.109 b=-0.112
step 3: p=[0.499 0.526 0.554 0.58  0.607 0.632] loss=0.643 gw=-0.273 gb=0.066
   -&gt; w=0.246 b=-0.145
after 5000 steps w=1.214 b=-4.249 loss=0.413 boundary x=3.50
sklearn w=1.214 b=-4.249  P(pass|3.5h)=0.500</div>
  <p>Step 1 matches the hand table. Step 2 overshot (everyone now looks likely to pass), so the gradient flips sign and pulls back: that is normal zig-zag. After 5,000 steps we land on w = 1.214, b = −4.249, the same numbers as sklearn. The boundary is where z = 0: x = 4.249 / 1.214 = <strong>3.5 hours</strong>, right between the confusing 3- and 4-hour students. <code>C=1e6</code> switches off sklearn's default regularisation so the two answers match exactly.</p>
  <h3>On real data: breast cancer</h3>
  <p>Four tumour measurements, target 1 = benign. We scale, fit, and read the coefficients as odds ratios.</p>
  <div class="fx" data-lang="py">import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import accuracy_score, roc_auc_score, log_loss
X, y = load_breast_cancer(return_X_y=True, as_frame=True)     # y=1 benign
X = X[["mean radius", "mean texture", "worst concave points", "worst smoothness"]]
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
clf = make_pipeline(StandardScaler(), LogisticRegression(C=1.0)).fit(Xtr, ytr)
p = clf.predict_proba(Xte)[:, 1]
print(f"acc {accuracy_score(yte, p &gt; 0.5):.3f}  AUC {roc_auc_score(yte, p):.3f}  logloss {log_loss(yte, p):.3f}")
lr = clf[-1]
print(pd.DataFrame({"coef (per 1 SD)": lr.coef_[0], "odds ratio": np.exp(lr.coef_[0])},
                   index=X.columns).round(2))</div>
  <div class="fx" data-lang="text">acc 0.930  AUC 0.984  logloss 0.153
                      coef (per 1 SD)  odds ratio
mean radius                     -3.03        0.05
mean texture                    -1.17        0.31
worst concave points            -2.45        0.09
worst smoothness                -0.83        0.44</div>
  <p><code>predict_proba(...)[:, 1]</code> takes the probability of class 1. <code>p &gt; 0.5</code> turns it into labels. Reading row one: one standard deviation more of mean radius multiplies the odds of <em>benign</em> by 0.05, so the odds of malignant go up about 20 times. All coefficients are negative: bigger, rougher, more concave tumours are less likely benign.</p>
  <div class="cards">
    <div><b>C</b><p>Inverse regularisation (C = 1/λ). Smaller C = stronger L2 shrinkage.</p><small>Default 1.0</small></div>
    <div><b>class_weight="balanced"</b><p>Up-weights the rare class in the loss.</p><small>Imbalanced targets</small></div>
    <div><b>Threshold</b><p>Use <code>predict_proba</code> and pick a cut-off from the precision–recall curve.</p><small>0.5 is rarely right</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Log loss</strong> (binary cross-entropy) = −mean[y·log p + (1 − y)·log(1 − p)]. Minimising it is <strong>maximum likelihood</strong> for a yes/no (Bernoulli) model. It is convex in w, so gradient descent finds the single best answer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If one feature separates the classes perfectly, unregularised logistic regression pushes w toward infinity and never converges. sklearn's default <code>C=1.0</code> prevents this, which is why its coefficients are slightly smaller than "pure" maximum likelihood.</p>
  </div>

  <h2 id="mcl-nb"><span class="num">03</span>Naive Bayes</h2>
  <p>You run an SMS service and want a spam filter by tonight. You have 8 labelled messages, not 8 million. Logistic regression would have to learn one weight per word from almost no data. Naive Bayes does something much simpler: it counts how often each word appears in spam and in normal messages ("ham"), turns the counts into chances, and multiplies the chances for the words in a new message. Whichever class gets the bigger product wins.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An SMS says "free", "prize", "claim". You have seen "free" mostly in spam, "prize" mostly in spam. Each clue pushes your guess separately; you never ask how the clues relate to each other. That "treat each clue alone" shortcut is the <em>naive</em> part.</p>
  </div>
  <div class="flow"><span>Prior P(spam)</span><span>× P(word₁ | spam)</span><span>× P(word₂ | spam) …</span><span>Compare with ham</span><span>Bigger wins</span></div>
  <h3>Worked example: is "free lunch monday" spam?</h3>
  <p>Four spam messages ("win a free prize now", "free cash offer win", "claim your free prize", "cheap offer buy now") and four ham. sklearn's tokenizer drops one-letter words like "a", so spam has 16 words in total, ham has 15, and the whole vocabulary has V = 24 different words. A word never seen in a class would get chance 0 and wipe out the product, so we add 1 to every count (<strong>Laplace smoothing</strong>): P(word | class) = (count + 1) / (class total + V).</p>
  <table class="tbl out"><caption>Smoothed word chances</caption>
    <tr><th>word</th><th>count in spam</th><th>P(word | spam)</th><th>count in ham</th><th>P(word | ham)</th></tr>
    <tr><td>free</td><td>3</td><td>4/40 = 0.100</td><td>0</td><td>1/39 = 0.0256</td></tr>
    <tr><td>lunch</td><td>0</td><td>1/40 = 0.025</td><td>1</td><td>2/39 = 0.0513</td></tr>
    <tr><td>monday</td><td>0</td><td>1/40 = 0.025</td><td>2</td><td>3/39 = 0.0769</td></tr>
  </table>
  <ol>
    <li>Priors: 4 of 8 messages are spam, so P(spam) = P(ham) = 0.5.</li>
    <li>Spam score = 0.5 × 0.100 × 0.025 × 0.025 = 3.13 × 10⁻⁵.</li>
    <li>Ham score = 0.5 × 0.0256 × 0.0513 × 0.0769 = 5.06 × 10⁻⁵.</li>
    <li>Normalise: P(spam) = 3.13 / (3.13 + 5.06) = <strong>0.382</strong>. Ham wins. "free" pulled toward spam, but "lunch" and "monday" pulled harder toward ham.</li>
  </ol>
  <p>The code fits sklearn's Naive Bayes on the same 8 messages and scores three test messages. The first one is the hand example. It also tries Bernoulli NB and Gaussian NB, explained after the output.</p>
  <div class="fx" data-lang="py">from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB, BernoulliNB, GaussianNB
from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score
train = ["win a free prize now", "free cash offer win", "claim your free prize",
         "cheap offer buy now", "meeting moved to monday", "see you at lunch",
         "project update attached", "can we meet monday"]
ys = [1, 1, 1, 1, 0, 0, 0, 0]                                  # 1 = spam
vec = CountVectorizer(); Xs = vec.fit_transform(train)          # word-count table
mnb = MultinomialNB(alpha=1).fit(Xs, ys); bnb = BernoulliNB(alpha=1).fit(Xs, ys)
print("vocabulary size:", len(vec.vocabulary_))
for msg in ["free lunch monday", "free free free lunch monday", "project prize"]:
    x = vec.transform([msg])
    print(f"{msg:28s} P(spam) multinomial={mnb.predict_proba(x)[0,1]:.3f}  "
          f"bernoulli={bnb.predict_proba(x)[0,1]:.3f}")
Xw, yw = load_wine(return_X_y=True)
print(f"GaussianNB on wine CV acc {cross_val_score(GaussianNB(), Xw, yw, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">vocabulary size: 24
free lunch monday            P(spam) multinomial=0.382  bernoulli=0.292
free free free lunch monday  P(spam) multinomial=0.904  bernoulli=0.292
project prize                P(spam) multinomial=0.588  bernoulli=0.507
GaussianNB on wine CV acc 0.966</div>
  <p>Line one matches the hand answer, 0.382. <code>CountVectorizer</code> built the word-count table; <code>alpha=1</code> is the +1 smoothing. Repeating "free" three times multiplies 0.100 in three times, and Multinomial jumps to 0.904. Bernoulli only asks "is the word present?", so the repeats change nothing. GaussianNB handles continuous measurements (wine chemistry) by fitting a bell curve per feature per class.</p>
  <div class="cards">
    <div><b>GaussianNB</b><p>Each feature ~ normal per class (mean, variance).</p><small>Continuous features, sensors</small></div>
    <div><b>MultinomialNB</b><p>Word <em>counts</em>; a word seen 3 times counts 3 times.</p><small>Text with counts / TF-IDF</small></div>
    <div><b>BernoulliNB</b><p>Word present or absent; missing words are evidence too.</p><small>Short texts, binary flags</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Naive Bayes</strong>: P(y | x) ∝ P(y) · Π P(xᵢ | y), from Bayes' rule plus the naive assumption that features are <strong>conditionally independent</strong> given the class. P(y) is the <strong>prior</strong>, P(xᵢ | y) the <strong>likelihood</strong>. In practice it adds logs instead of multiplying, to avoid tiny numbers underflowing to 0.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Words are clearly not independent ("free" and "prize" travel together), so NB double-counts evidence and its probabilities are too extreme. Trust which class wins, not the exact number. Without smoothing, one unseen word makes a class impossible.</p>
  </div>

  <h2 id="mcl-knn"><span class="num">04</span>K-Nearest Neighbours</h2>
  <p>Some boundaries are oddly shaped: a curve, an island, two blobs. Logistic regression can only draw a straight line. K-nearest neighbours (KNN) draws no line at all. To label a new point, it finds the k training points closest to it and takes a majority vote. No formula is learned; the training data itself is the model.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Guessing a flat's rent by asking the k nearest flats in your society. Ask only 1: one odd flat (the owner's cousin pays half) fools you. Ask 500: you are averaging the whole city, and your sea-facing flat gets the city average.</p>
  </div>
  <h3>Worked example: vote with k = 1, 3, 5</h3>
  <p>Six labelled points and a new query at (3, 3). Distance is the ordinary straight-line (Euclidean) distance √((x₁−x₂)² + (y₁−y₂)²). Sort by distance:</p>
  <table class="tbl out"><caption>Distances from the query (3, 3)</caption>
    <tr><th>point</th><th>label</th><th>distance</th><th>rank</th></tr>
    <tr><td>(2, 4)</td><td>red</td><td>√2 = 1.41</td><td>1</td></tr>
    <tr><td>(4, 4)</td><td>red</td><td>√2 = 1.41</td><td>2</td></tr>
    <tr><td>(3, 5)</td><td>blue</td><td>2.00</td><td>3</td></tr>
    <tr><td>(1, 1)</td><td>blue</td><td>√8 = 2.83</td><td>4</td></tr>
    <tr><td>(5, 1)</td><td>blue</td><td>√8 = 2.83</td><td>5</td></tr>
    <tr><td>(6, 6)</td><td>blue</td><td>4.24</td><td>6</td></tr>
  </table>
  <p>k = 1: nearest is red → <strong>red</strong>. k = 3: red, red, blue → <strong>red</strong>. k = 5: 2 red, 3 blue → <strong>blue</strong>. The answer depends on k. sklearn agrees:</p>
  <div class="fx" data-lang="py">from sklearn.neighbors import KNeighborsClassifier
pts = np.array([[1, 1], [2, 4], [4, 4], [5, 1], [3, 5], [6, 6]])
lab = np.array(["blue", "red", "red", "blue", "blue", "blue"])
q = np.array([3, 3])
d = np.sqrt(((pts - q) ** 2).sum(axis=1))           # distance to every point
print("sorted:", [(str(lab[i]), round(float(d[i]), 2)) for i in np.argsort(d, kind="stable")])
for k in (1, 3, 5):
    print(k, KNeighborsClassifier(k).fit(pts, lab).predict([q]))</div>
  <div class="fx" data-lang="text">sorted: [('red', 1.41), ('red', 1.41), ('blue', 2.0), ('blue', 2.83), ('blue', 2.83), ('blue', 4.24)]
1 ['red']
3 ['red']
5 ['blue']</div>
  <p><code>d</code> is the distance column of the table, computed for all points at once. <code>fit</code> only stores the six points; all the work happens in <code>predict</code>.</p>
  <h3>Why you must scale</h3>
  <p>Customer A is 30 years old with income ₹50,000. Neighbour 1: 31 years, ₹52,000. Neighbour 2: 60 years, ₹50,500. Neighbour 1 is clearly more similar. But the raw distances are √(1² + 2000²) ≈ 2000 and √(30² + 500²) ≈ 501, so KNN picks the 60-year-old. Rupees drown out years. Standardising (each column to mean 0, std 1) fixes it. On real data:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_moons
X, y = make_moons(n_samples=600, noise=0.3, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
for k in [1, 5, 15, 51, 151]:
    s = cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(k)), Xtr, ytr, cv=5).mean()
    print(f"k={k:&lt;4d} CV acc {s:.3f}")
print(f"KNN raw     CV acc {cross_val_score(KNeighborsClassifier(5), Xw, yw, cv=5).mean():.3f}")
print(f"KNN scaled  CV acc {cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(5)), Xw, yw, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">k=1    CV acc 0.895
k=5    CV acc 0.921
k=15   CV acc 0.907
k=51   CV acc 0.898
k=151  CV acc 0.869
KNN raw     CV acc 0.691
KNN scaled  CV acc 0.949</div>
  <p>On the two-moons data, k = 5 wins; k = 1 copies noise, k = 151 blurs the classes. On wine (proline ranges 278–1680, hue 0.48–1.71), scaling lifts accuracy from 0.691 to 0.949.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>KNN</strong>: predict the majority label (or mean value, for regression) of the k nearest training points. It is a <strong>lazy learner</strong>: <code>fit</code> stores data, each prediction costs O(n·d). Speed-ups: KD/ball trees in low dimensions, approximate nearest-neighbour indexes (FAISS) at scale.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Curse of dimensionality: with many features, everything is "equally far", so "nearest" means little. Check it yourself:</p>
  </div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
for d in (2, 10, 100, 1000):
    P = rng.random((1000, d)); qd = rng.random(d)          # 1000 random points, 1 query
    dist = np.linalg.norm(P - qd, axis=1)
    print(f"d={d:4d}  nearest/farthest = {dist.min() / dist.max():.2f}")</div>
  <div class="fx" data-lang="text">d=   2  nearest/farthest = 0.01
d=  10  nearest/farthest = 0.22
d= 100  nearest/farthest = 0.72
d=1000  nearest/farthest = 0.90</div>
  <p>At d = 2 the nearest point is 100 times closer than the farthest. At d = 1000 it is only 10% closer. Reduce dimensions first (see <a class="xref" data-note="ml_dimred">Dimensionality Reduction</a>).</p>

  <h2 id="mcl-svm"><span class="num">05</span>Support Vector Machines</h2>
  <p>When two classes can be split by a line, there are usually many lines that work. Logistic regression picks one based on probabilities. But a line that passes very close to some training points is fragile: a new point that is a little different lands on the wrong side. A support vector machine (SVM) picks the line with the widest empty gap (the <strong>margin</strong>) on both sides. Only the points right at the edge of the gap, the <strong>support vectors</strong>, decide where it goes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Building the widest possible road between two villages. Only the houses right at the roadside (the support vectors) decide where the road can go. Houses deep inside the villages do not matter; you could demolish them and the road would not move.</p>
  </div>
  <h3>Worked example: the widest gap on a number line</h3>
  <p>Four points on a line: class −1 at x = 1 and 2, class +1 at x = 4 and 5. Any cut between 2 and 4 separates them. The widest gap puts the cut exactly in the middle, at 3, with 1 unit of space on each side. The SVM writes the boundary as w·x + b = 0 and asks the nearest points to sit exactly at w·x + b = ±1. With x = 2 → −1 and x = 4 → +1: 2w + b = −1 and 4w + b = 1, so w = 1, b = −3. Margin = 2/|w| = <strong>2</strong>. Check every point with y·(w·x + b) ≥ 1: x=1 gives 2, x=2 gives 1, x=4 gives 1, x=5 gives 2. The two points with exactly 1 are the support vectors.</p>
  <div class="fx" data-lang="py">from sklearn.svm import SVC
X1 = np.array([[1], [2], [4], [5]]); y1 = np.array([-1, -1, 1, 1])
s = SVC(kernel="linear", C=1e6).fit(X1, y1)           # huge C = no mistakes allowed
w, b = s.coef_[0, 0], s.intercept_[0]
print(f"w={w:.3f} b={b:.3f} boundary x={-b/w:.2f} margin={2/abs(w):.2f} SVs={s.support_vectors_.ravel()}")
print("y*(wx+b):", (y1 * (w * X1.ravel() + b)).round(2))</div>
  <div class="fx" data-lang="text">w=1.000 b=-3.000 boundary x=3.00 margin=2.00 SVs=[2. 4.]
y*(wx+b): [2. 1. 1. 2.]</div>
  <p>sklearn finds w = 1, b = −3 and lists x = 2 and x = 4 as <code>support_vectors_</code>. Points 1 and 5 have y·(wx + b) = 2, safely beyond the kerb. In 2-D it looks like this:</p>
  <figure class="viz"><svg viewBox="0 0 540 270" width="540">
<line x1="40" y1="260" x2="300" y2="0" stroke="currentColor" stroke-width="2.5"/>
<line x1="0" y1="250" x2="250" y2="0" stroke="currentColor" stroke-dasharray="5 4"/>
<line x1="90" y1="260" x2="350" y2="0" stroke="currentColor" stroke-dasharray="5 4"/>
<circle cx="80" cy="120" r="6" class="fb sb"/><circle cx="110" cy="80" r="6" class="fb sb"/><circle cx="60" cy="150" r="6" class="fb sb"/><circle cx="50" cy="90" r="6" class="fb sb"/><circle cx="140" cy="110" r="6" class="fb sb"/><circle cx="100" cy="150" r="6" class="fb sb"/>
<circle cx="220" cy="200" r="6" class="fr sr"/><circle cx="260" cy="150" r="6" class="fr sr"/><circle cx="200" cy="150" r="6" class="fr sr"/><circle cx="240" cy="230" r="6" class="fr sr"/><circle cx="300" cy="120" r="6" class="fr sr"/><circle cx="160" cy="190" r="6" class="fr sr"/>
<circle cx="140" cy="110" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="100" cy="150" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="200" cy="150" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="160" cy="190" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<line x1="125" y1="125" x2="175" y2="175" class="sg" stroke-width="2"/>
<text x="360" y="60" font-size="13">solid: wᵀx + b = 0</text>
<text x="360" y="84" font-size="13">dashed: wᵀx + b = ±1</text>
<text x="360" y="108" class="tg" font-size="13">margin = 2 / ‖w‖</text>
<text x="360" y="132" font-size="13">ringed: support vectors</text>
<text x="360" y="170" class="tm" font-size="12">delete any other point:</text>
<text x="360" y="188" class="tm" font-size="12">the boundary doesn't move</text>
</svg><figcaption>SVM picks the separating line with the widest empty street. Only the points touching the street matter.</figcaption></figure>
  <h3>Soft margin and C</h3>
  <p>Real data overlaps, so a perfect gap rarely exists. The <strong>soft-margin</strong> SVM lets some points sit inside the street or on the wrong side, and charges a fee for each (the hinge loss). <strong>C</strong> is the fee. Low C: cheap mistakes, wide street, many support vectors. High C: expensive mistakes, narrow street. On the moons data:</p>
  <div class="fx" data-lang="py">for C in [0.01, 1, 100]:
    p = make_pipeline(StandardScaler(), SVC(C=C)).fit(Xtr, ytr)      # moons, RBF kernel
    print(f"C={C:&lt;5} SVs={p[-1].n_support_.sum():3d}/{len(Xtr)}  "
          f"train {p.score(Xtr, ytr):.3f}  test {p.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">C=0.01  SVs=416/420  train 0.871  test 0.861
C=1     SVs=123/420  train 0.902  test 0.872
C=100   SVs= 88/420  train 0.929  test 0.889</div>
  <p>At C = 0.01 almost every point (416 of 420) is a support vector: the street is so wide everyone is on it. At C = 100 only 88 are. Here C = 100 still does best on test; on noisier data it would overfit. <code>n_support_</code> counts support vectors per class.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Soft-margin SVM</strong>: minimise ½‖w‖² + C·Σ max(0, 1 − yᵢ(wᵀxᵢ + b)). The first term widens the margin (margin = 2/‖w‖); the second is the <strong>hinge loss</strong>, zero for points beyond their kerb. <strong>Support vectors</strong> are the points with yᵢ(wᵀxᵢ + b) ≤ 1.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Kernel SVM training is O(n²)–O(n³): fine up to tens of thousands of rows, painful beyond ~100k. Use <code>LinearSVC</code> or logistic regression at scale. Always scale features. SVM gives scores, not probabilities; <code>probability=True</code> adds slow, extra cross-validated Platt scaling.</p>
  </div>

  <h2 id="mcl-kernel"><span class="num">06</span>Kernels: Lifting the Data</h2>
  <p>Some data cannot be split by any straight line: one class in the middle, the other all around it. You could add new features by hand (x², x₁·x₂) and hope one of them makes a straight cut possible, as polynomial regression did. A <strong>kernel</strong> does this automatically and cheaply. The SVM behaves as if it had the extra features, finds a flat cut in that bigger space, and the cut looks curved back in the original space.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>₹1 coins sit in the middle of a table, ₹5 coins around them. No ruler on the table can separate them. Lift the middle coins up a little, and a flat sheet slides between the two groups. The kernel is the lift.</p>
  </div>
  <h3>Worked example 1: lift a line of points</h3>
  <p>Points at x = −3, −2 (red), −1, 0, 1 (blue), 2, 3 (red). No single cut on the line works: red is on both sides. Add a second feature x²: red points get 9, 4, 4, 9; blue get 1, 0, 1. Now the cut "x² = 2.5" separates them perfectly. In the original line that cut is two boundaries, at x = ±1.58.</p>
  <figure class="viz"><svg viewBox="0 0 540 240" width="540">
<line x1="15" y1="130" x2="245" y2="130" stroke="currentColor"/>
<circle cx="35" cy="130" r="6" class="fr sr"/><circle cx="55" cy="130" r="6" class="fr sr"/><circle cx="95" cy="130" r="6" class="fb sb"/><circle cx="115" cy="130" r="6" class="fb sb"/><circle cx="145" cy="130" r="6" class="fb sb"/><circle cx="165" cy="130" r="6" class="fb sb"/><circle cx="205" cy="130" r="6" class="fr sr"/><circle cx="225" cy="130" r="6" class="fr sr"/>
<text x="130" y="100" text-anchor="middle" font-size="13">1-D: no single cut works</text>
<text x="130" y="160" text-anchor="middle" class="tm" font-size="12">x</text>
<text x="270" y="135" font-size="20">→</text>
<line x1="295" y1="220" x2="525" y2="220" stroke="currentColor"/><line x1="410" y1="40" x2="410" y2="225" stroke="currentColor"/>
<polyline points="305,61 320,103 335,139 350,168 365,191 380,207 395,217 410,220 425,217 440,207 455,191 470,168 485,139 500,103 515,61" fill="none" stroke="currentColor" stroke-dasharray="2 3"/>
<circle cx="315" cy="89" r="6" class="fr sr"/><circle cx="335" cy="139" r="6" class="fr sr"/><circle cx="375" cy="202" r="6" class="fb sb"/><circle cx="395" cy="217" r="6" class="fb sb"/><circle cx="425" cy="217" r="6" class="fb sb"/><circle cx="445" cy="202" r="6" class="fb sb"/><circle cx="485" cy="139" r="6" class="fr sr"/><circle cx="505" cy="89" r="6" class="fr sr"/>
<line x1="295" y1="172" x2="525" y2="172" class="sg" stroke-width="2.5"/>
<text x="416" y="52" class="tm" font-size="12">x²</text>
<text x="298" y="192" class="tg" font-size="12">flat cut</text>
</svg><figcaption>Add the feature x², and the inner points sit low, the outer ones high. A straight cut in the lifted space is a curved boundary back in x.</figcaption></figure>
  <h3>Worked example 2: the kernel trick in numbers</h3>
  <p>The SVM only ever needs dot products between pairs of points. Take a = (1, 2), b = (3, 4) and the lift φ(v) = (v₁², √2·v₁v₂, v₂²). Lifting first: φ(a) = (1, 2.83, 4), φ(b) = (9, 16.97, 16), dot product = 9 + 48 + 64 = <strong>121</strong>. Shortcut: (a·b)² = (3 + 8)² = <strong>121</strong>. Same answer, without ever building φ. That shortcut is the kernel K(a, b) = (a·b)². For huge lifts (the RBF kernel corresponds to infinitely many features) the shortcut is the only way.</p>
  <div class="fx" data-lang="py">a = np.array([1., 2.]); bb = np.array([3., 4.])
phi = lambda v: np.array([v[0]**2, np.sqrt(2)*v[0]*v[1], v[1]**2])   # explicit lift to 3-D
print("lift then dot:", round(phi(a) @ phi(bb), 6), "  kernel (a.b)^2:", (a @ bb) ** 2)
from sklearn.datasets import make_circles
Xc, yc = make_circles(n_samples=400, noise=0.1, factor=0.4, random_state=0)
for n, mdl in [("linear", SVC(kernel="linear")), ("poly d=2", SVC(kernel="poly", degree=2)), ("rbf", SVC())]:
    print(f"{n:9s} CV acc {cross_val_score(mdl, Xc, yc, cv=5).mean():.3f}")
Z = np.c_[Xc, (Xc**2).sum(1)]                           # lift by hand: add r² = x1² + x2²
print(f"linear on lifted [x1,x2,x1²+x2²] CV acc {cross_val_score(SVC(kernel='linear'), Z, yc, cv=5).mean():.3f}")
for g in [0.1, 1, 100]:                                  # back on moons
    p = make_pipeline(StandardScaler(), SVC(gamma=g)).fit(Xtr, ytr)
    print(f"gamma={g:&lt;4} train {p.score(Xtr, ytr):.3f}  test {p.score(Xte, yte):.3f}")</div>
  <div class="fx" data-lang="text">lift then dot: 121.0   kernel (a.b)^2: 121.0
linear    CV acc 0.547
poly d=2  CV acc 1.000
rbf       CV acc 1.000
linear on lifted [x1,x2,x1²+x2²] CV acc 1.000
gamma=0.1  train 0.881  test 0.850
gamma=1    train 0.912  test 0.878
gamma=100  train 0.983  test 0.811</div>
  <p>Line one confirms the 121. On two rings (<code>make_circles</code>), a linear SVM is a coin toss (0.547) while poly and RBF kernels get 1.000. Adding r² = x₁² + x₂² by hand (the <code>Z</code> line) lets even a linear SVM score 1.000: that is what the kernel did for us. γ controls RBF's reach: γ = 100 makes each point influence only a tiny bubble, the boundary wraps single points, and test accuracy drops to 0.811.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Kernel</strong>: K(a, b) = φ(a)·φ(b), a dot product in a lifted space computed without building φ. <strong>RBF</strong>: K = exp(−γ‖a − b‖²), similarity that fades with distance. <strong>Polynomial</strong>: K = (γ a·b + r)^d. Large γ = very local, wiggly boundary.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Tune C and γ together (grid or random search with CV); they interact. Train 0.98, test 0.81 is the signature of γ too large. Kernels also work in other models (kernel ridge, kernel PCA), not just SVM.</p>
  </div>

  <h2 id="mcl-cmp"><span class="num">07</span>Decision Boundaries Compared</h2>
  <p>You now know four families. Which to pick? A good habit is to look at the <strong>decision boundary</strong>, the line where a model switches its answer. Its shape tells you what a model <em>can</em> learn. A straight-line model can never fit a curved class border, however much data you give it (that is bias). A model that can draw any shape may trace every noisy point (that is variance). Here all models get the same "two moons" data: two interleaved half-circles with noise.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Drawing the border between two neighbourhoods on a city map. A ruler gives a clean but wrong border. Tracing around every single house gives a messy border that changes whenever one family moves. A smooth hand-drawn curve is usually right.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 280" width="560">
<defs><clipPath id="mcl-clip"><rect x="10" y="10" width="400" height="260"/></clipPath></defs>
<rect x="10" y="10" width="400" height="260" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<polyline clip-path="url(#mcl-clip)" points="410,69 401,74 390,76 379,78 370,83 361,87 352,92 340,94 331,98 320,100 311,105 302,109 293,114 282,116 271,118 262,122 253,127 244,131 232,133 221,136 212,140 203,144 194,149 183,151 174,155 163,158 154,162 145,166 136,171 125,173 113,175 104,180 95,184 86,188 75,191 64,193 55,197 46,202 37,206 26,208 17,213" fill="none" class="sb" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="345,10 343,21 338,30 334,39 329,47 325,56 320,65 316,74 309,81 300,85 293,92 286,98 286,111 295,116 302,122 311,118 325,118 331,125 322,129 311,131 304,133 295,133 284,136 275,131 264,133 257,140 257,149 271,149 280,144 289,149 298,144 307,149 307,158 300,164 295,160 304,155 293,153 284,158 280,166 271,171 259,173 248,175 239,171 226,171 217,175 208,171 199,166 192,160 199,153 206,160 212,166 219,169 228,164 235,166 246,169 257,171 259,160 248,158 235,158 226,153 228,147 221,140 212,136 199,136 194,140 208,140 206,147 197,147 190,140 179,138 179,125 185,118 192,120 197,125 206,125 208,118 199,114 185,114 176,118 165,116 158,118 163,122 163,131 152,129 145,122 136,127 131,136 118,136 109,140 113,144 120,151 131,153 138,160 147,164 140,171 129,169 125,160 113,158 102,160 107,169 102,177 113,180 125,182 120,191 116,199 111,208 107,217 100,224 93,230 84,235 77,241 68,246 62,252 53,257 46,263 37,268" fill="none" class="sr" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="104,109 118,109 113,105 102,107" fill="none" class="sr" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="122,105 131,100 143,98 134,94 125,94 120,103" fill="none" class="sr" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="158,83 172,83 172,74 163,78 158,83" fill="none" class="sr" stroke-width="2"/>
<polyline clip-path="url(#mcl-clip)" points="358,10 352,17 343,21 336,28 329,34 322,41 318,50 316,61 313,72 311,83 309,94 309,107 304,116 300,125 295,133 289,140 280,144 271,149 257,149 248,153 239,149 226,149 214,147 203,144 192,142 181,140 167,140 154,140 143,142 134,147 125,151 118,158 113,166 109,175 107,186 102,195 102,208 98,217 98,230 93,239 89,248 84,257 80,266" fill="none" class="sg" stroke-width="2"/>
<path d="M255 99h0M231 199h0M95 62h0M110 114h0M253 83h0M122 99h0M113 61h0M184 89h0M270 154h0M226 111h0M80 93h0M259 111h0M194 46h0M241 176h0M85 171h0M97 91h0M112 13h0M211 118h0M120 92h0M198 91h0M132 100h0M270 125h0M110 56h0M138 20h0M103 59h0M179 67h0M233 146h0M38 78h0M227 66h0M216 64h0M79 125h0M244 87h0M60 171h0M185 83h0M290 177h0M221 86h0M162 53h0M109 65h0M176 77h0M194 84h0M131 103h0M196 75h0M281 150h0M117 142h0M212 83h0M96 105h0M54 133h0M80 114h0M229 144h0M216 105h0M138 95h0M165 84h0M174 97h0M48 152h0M166 23h0M87 168h0M62 175h0M95 81h0M193 107h0M100 51h0M90 141h0M257 84h0M243 187h0M202 82h0M177 40h0M251 91h0M248 131h0M251 97h0M253 69h0M41 83h0M200 38h0M147 79h0M122 94h0M91 47h0M247 191h0M99 168h0M167 108h0M284 145h0M99 89h0M198 68h0M111 134h0M178 56h0M234 55h0M158 103h0M248 100h0M92 131h0M220 100h0M115 43h0M135 89h0M91 167h0M197 44h0" class="sb" stroke-width="5" stroke-linecap="round" stroke-opacity="0.75"/>
<path d="M137 79h0M228 208h0M342 135h0M191 238h0M321 223h0M147 185h0M253 251h0M224 243h0M210 189h0M263 245h0M205 200h0M240 236h0M309 176h0M279 126h0M149 151h0M227 175h0M247 198h0M298 183h0M146 171h0M260 182h0M267 212h0M289 211h0M259 250h0M249 251h0M159 166h0M378 135h0M326 209h0M321 189h0M203 212h0M196 128h0M287 210h0M211 99h0M258 237h0M342 161h0M337 175h0M173 202h0M341 190h0M232 212h0M215 174h0M262 229h0M116 139h0M220 187h0M328 198h0M335 186h0M349 172h0M186 166h0M375 159h0M340 173h0M267 198h0M188 224h0M123 94h0M163 126h0M275 223h0M202 86h0M276 130h0M180 197h0M255 125h0M335 198h0M108 148h0M232 194h0M207 132h0M239 234h0M160 91h0M238 247h0M168 165h0M326 143h0M213 227h0M234 214h0M343 176h0M365 81h0M206 204h0M237 217h0M176 111h0M386 125h0M201 168h0M195 231h0M230 219h0M345 155h0M260 225h0M197 207h0M407 141h0M336 177h0M145 154h0M367 122h0M306 162h0M166 175h0M152 113h0M293 237h0" class="sr" stroke-width="5" stroke-linecap="round" stroke-opacity="0.75"/>
<line x1="425" y1="40" x2="455" y2="40" class="sb" stroke-width="2"/><text x="462" y="44" font-size="12">logistic</text>
<line x1="425" y1="64" x2="455" y2="64" class="sr" stroke-width="2"/><text x="462" y="68" font-size="12">KNN k=1</text>
<line x1="425" y1="88" x2="455" y2="88" class="sg" stroke-width="2"/><text x="462" y="92" font-size="12">RBF SVM</text>
<circle cx="440" cy="120" r="4" class="fb sb"/><text x="462" y="124" font-size="12">class 0</text>
<circle cx="440" cy="142" r="4" class="fr sr"/><text x="462" y="146" font-size="12">class 1</text>
<text x="425" y="190" class="tm" font-size="11">real boundaries,</text><text x="425" y="206" class="tm" font-size="11">180 test points</text>
</svg><figcaption>Same moons data: logistic can only draw a straight line, KNN-1 traces every noisy point, RBF bends smoothly.</figcaption></figure>
  <p>The code fits eight models on the same split and prints train and test accuracy for each.</p>
  <div class="fx" data-lang="py">from sklearn.tree import DecisionTreeClassifier
X, y = make_moons(n_samples=600, noise=0.3, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
models = {"Logistic": LogisticRegression(), "GaussianNB": GaussianNB(),
          "KNN k=1": KNeighborsClassifier(1), "KNN k=15": KNeighborsClassifier(15),
          "SVM linear": SVC(kernel="linear"), "SVM poly d=3": SVC(kernel="poly", degree=3, coef0=1),
          "SVM RBF": SVC(), "Tree depth=None": DecisionTreeClassifier(random_state=0)}
for n, mdl in models.items():
    p = make_pipeline(StandardScaler(), mdl).fit(Xtr, ytr)
    print(f"{n:16s} {p.score(Xtr, ytr):.3f}  {p.score(Xte, yte):.3f}")</div>
  <table class="tbl out"><caption>Accuracy on moons (noise 0.3), real output</caption>
    <tr><th>Model</th><th>Train</th><th>Test</th><th>Boundary shape</th></tr>
    <tr><td>Logistic</td><td>0.874</td><td>0.844</td><td>Straight line</td></tr>
    <tr><td>GaussianNB</td><td>0.871</td><td>0.856</td><td>Quadratic (ellipse pieces)</td></tr>
    <tr><td>KNN k=1</td><td>1.000</td><td>0.878</td><td>Jagged, memorises</td></tr>
    <tr><td>KNN k=15</td><td>0.931</td><td><strong>0.889</strong></td><td>Smooth curve</td></tr>
    <tr><td>SVM linear</td><td>0.876</td><td>0.856</td><td>Straight line</td></tr>
    <tr><td>SVM poly d=3</td><td>0.898</td><td>0.878</td><td>Cubic curve</td></tr>
    <tr><td>SVM RBF</td><td>0.902</td><td>0.872</td><td>Smooth curve</td></tr>
    <tr><td>Decision tree (no limit)</td><td>1.000</td><td>0.883</td><td>Axis-aligned staircase</td></tr>
  </table>
  <p>Read the table in three groups. The straight-line models (logistic, linear SVM) stop near 0.85 because the true border is curved. The perfect-train models (KNN-1, unlimited tree) score 1.000 on train: they memorised, and drop on test. The smooth curved models (KNN-15, RBF, poly) do best. With only 180 test points, differences under about 3 points are just noise, so do not crown a winner from one split; use cross-validation.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Decision boundary</strong>: the set of inputs where the predicted class changes. <strong>Linear classifier</strong>: one whose boundary is a hyperplane (logistic regression, linear SVM, and in effect Naive Bayes with shared variances).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A train accuracy of 1.000 is a warning sign, not a success. Always compare train and test (or CV) together: a big gap means overfitting.</p>
  </div>

  <h2 id="mcl-choose"><span class="num">08</span>When to Use Each</h2>
  <p>In an interview or at work, nobody asks "what is the best classifier". They ask "what would you try first for <em>this</em> problem, and why". The honest answer depends on four things: how many rows, how many features, whether you need explanations or probabilities, and how much time you have at prediction. The table sums up what the sections above showed with numbers.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Choosing transport in a city. An auto (logistic) is cheap, quick and gets you most places. The metro (gradient boosting) is the fastest for long routes but needs setup. Walking with directions from neighbours (KNN) works in a small lane, not across the city.</p>
  </div>
  <table class="tbl">
    <tr><th>Model</th><th>Wins when</th><th>Fails when</th><th>Typical use</th></tr>
    <tr><td>Logistic regression</td><td>Need explainability, calibrated probabilities, fast baseline</td><td>Curved boundaries, interactions (unless engineered)</td><td>Credit scoring, first baseline</td></tr>
    <tr><td>Naive Bayes</td><td>Text, tiny data, need speed</td><td>Correlated continuous features; need good probabilities</td><td>Spam filters, quick text baselines</td></tr>
    <tr><td>KNN</td><td>Small, low-dimensional data, irregular boundary</td><td>High d, large n (slow predictions), unscaled data</td><td>Similarity search, recommenders</td></tr>
    <tr><td>SVM (RBF)</td><td>Medium n (&lt; ~50k), clear margins, non-linear</td><td>Huge n, need probabilities</td><td>Bioinformatics, small image sets (pre-DL)</td></tr>
    <tr><td>Gradient boosting</td><td>Tabular data, accuracy matters</td><td>Strict linear model required by regulation</td><td>Most production tabular tasks (see <a class="xref" data-note="ml_trees">Trees &amp; Ensembles</a>)</td></tr>
  </table>
  <p>A sensible default order on a new tabular problem: (1) a dummy "predict the majority class" model, so you know the floor; (2) logistic regression with scaling, as the honest baseline; (3) gradient boosting; (4) only then KNN/SVM if the data is small and the boundary odd. For text with few labels, start with Naive Bayes or logistic on TF-IDF.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Calibrated</strong> probabilities: among cases the model scores 0.7, about 70% really are positive. Logistic regression is usually well calibrated; Naive Bayes and SVM scores are not, and need <code>CalibratedClassifierCV</code> if you use them as probabilities.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Scale-sensitive: KNN, SVM, regularised logistic. Scale-insensitive: Naive Bayes (Gaussian fits each feature separately) and trees. Put the scaler in a <code>Pipeline</code> so CV folds don't leak.</p>
  </div>

  <h2 id="mcl-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: forgetting to scale for distance or margin models</span>
    <p>KNN on raw wine: 0.691. Scaled: 0.949. Same for SVM and regularised logistic regression. Scale inside a <code>Pipeline</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading a coefficient as a probability change</span>
    <p>A logistic weight of 0.7 multiplies the odds by e^0.7 ≈ 2. It does not add 0.7 (or 70%) to the probability.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: using 0.5 as the threshold by habit</span>
    <p>For fraud or disease, missing a positive costs far more than a false alarm. Choose the cut-off from the precision–recall curve and the business cost, not from the default.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: accuracy on imbalanced data</span>
    <p>With 1% fraud, "never fraud" scores 99% accuracy and catches nothing. Use recall, precision, F1, PR-AUC (see <a class="xref" data-note="ml_evaluation">Model Evaluation</a>) and consider <code>class_weight="balanced"</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting Naive Bayes or SVM probabilities</span>
    <p>NB double-counts correlated words and is over-confident; SVM gives margins, not probabilities. Calibrate before using them as risk scores.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: kernel SVM or KNN on millions of rows</span>
    <p>SVM training grows O(n²) or worse; KNN scans all rows per prediction. Use logistic, LinearSVC, boosting, or an approximate-NN index.</p>
  </div>

  <h2 id="mcl-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does a logistic regression coefficient of 0.7 mean?</summary><div class="qa-body">A one-unit increase in that feature adds 0.7 to the log-odds, i.e. multiplies the odds by e^0.7 ≈ 2.01. It is not a fixed change in probability: that depends on where on the sigmoid you start.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Start logistic regression at w = 0, b = 0 with one feature x = [1, 2], y = [0, 1]. What is the first gradient for w?</summary><div class="qa-body">All p = 0.5. p − y = [0.5, −0.5]. ∂/∂w = mean((p − y)·x) = (0.5·1 − 0.5·2)/2 = −0.25. So w moves up (w = 0 − lr·(−0.25)): bigger x, more likely class 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is logistic regression called a linear classifier if the sigmoid is non-linear?</summary><div class="qa-body">The boundary is where p = 0.5, i.e. σ(wᵀx + b) = 0.5, i.e. wᵀx + b = 0: a hyperplane. The sigmoid only maps the linear score to a probability. It can't separate XOR or circles without added features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why train logistic regression with log loss instead of MSE?</summary><div class="qa-body">Log loss is the negative log-likelihood of a Bernoulli model, so minimising it is maximum likelihood. It's convex in w (one global minimum) and heavily punishes confident wrong answers. MSE through a sigmoid is non-convex and gives tiny gradients when predictions are confidently wrong.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In Naive Bayes, why add 1 to every word count?</summary><div class="qa-body">Laplace smoothing. Without it, a word never seen in a class gets probability 0 and the product for that class becomes 0, whatever the other words say. With it, P(word | class) = (count + 1)/(total + V), e.g. P(lunch | spam) = 1/40 instead of 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Gaussian vs Multinomial vs Bernoulli Naive Bayes: which for what?</summary><div class="qa-body">Gaussian: continuous features. Multinomial: counts (word frequencies, TF-IDF); repeats raise evidence ("free" ×3 took spam from 0.38 to 0.90). Bernoulli: binary presence flags; absent words also count as evidence, good for short texts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does Naive Bayes work even though features are clearly dependent?</summary><div class="qa-body">Classification only needs the right class to have the highest score, not correct probabilities. Errors across many features partly cancel, and the strong assumption acts as regularisation on small data. Its probabilities, though, are usually over-confident.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose k in KNN, and what happens at the extremes?</summary><div class="qa-body">Cross-validate. k = 1: zero training error, jagged boundary, high variance. k ≈ n: predicts the majority class everywhere, high bias. Odd k avoids ties in binary problems. On moons, k = 5 scored best (0.921 CV). In the toy, k = 3 said red and k = 5 said blue.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are support vectors, and what does C control?</summary><div class="qa-body">The training points on or inside the margin (or misclassified); only they determine the boundary. In the 1-D toy they were x = 2 and x = 4. C trades margin width for training errors: small C = wide, tolerant margin with many SVs (416 at C = 0.01); large C = narrow, strict margin with fewer SVs (88 at C = 100) and higher overfitting risk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the kernel trick in two sentences.</summary><div class="qa-body">SVM's optimisation and predictions use only dot products between points, so replace each dot product with a kernel K(a, b) that equals φ(a)·φ(b) in a richer feature space. You get a non-linear boundary without computing φ: for a = (1,2), b = (3,4), (a·b)² = 121 equals the dot product of the explicit 3-D lifts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RBF SVM: train 0.98, test 0.81. Which knob, which direction?</summary><div class="qa-body">Overfitting: γ is too large (each point's influence too local) and/or C too large. Lower γ first (here γ = 100 → 1 took test from 0.811 to 0.878), then tune C with a grid or random search over both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You have 2 million rows and 50 features. Would you use a kernel SVM or KNN?</summary><div class="qa-body">Neither by default. Kernel SVM training is O(n²) or worse; KNN predictions scan all rows. Start with logistic regression (or LinearSVC) as a baseline, then gradient boosting. If you need neighbours, use an approximate-NN index.</div></details>
</main>`
});
