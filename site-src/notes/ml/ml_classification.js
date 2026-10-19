// notes/ml/ml_classification.js — Logistic Regression
Object.assign(TOPIC_CONTENT, {
  "ml_classification": `<main>
  <h1>Logistic Regression</h1>
  <div class="where"><span>Machine Learning</span><span>Classification</span><span>Logistic Regression</span></div>
  <p class="lead">Logistic regression answers yes/no questions with a probability: will this student pass, will this customer miss an EMI, is this tumour benign. It keeps the weighted sum you know from linear regression and squashes it through the sigmoid curve so the answer always lands between 0 and 1. This note builds it completely by hand: odds and log-odds, the sigmoid, the log-loss derived from likelihood, the gradient derived with the chain rule and one gradient-descent step on six students, the decision boundary, odds ratios, softmax for many classes, regularization with C, class imbalance, every sklearn solver, the statsmodels summary line by line, and a from-scratch version that matches sklearn to seven decimals. It also opens the Classification group.</p>

  <h2 id="lg-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_regression">Linear Regression</a> and <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a></b><span>Linear regression predicts a number with ŷ = b + w₁x₁ + … + w_dx_d and finds the weights by minimising squared error. The Foundations notes taught losses and gradient descent. The open question: what if the target is not a number but a class (pass / fail, spam / ham)? Fitting a straight line to 0/1 labels gives "probabilities" of −0.2 and 1.4, and one extreme row drags the cut-off around.</span></li>
    <li><b>This note adds: the same weighted sum, turned into a probability</b><span>p = σ(w·x + b). The weighted sum is now read as the log-odds, the sigmoid turns it into a probability, the log-loss (from maximum likelihood) trains it, and the weights become odds ratios you can explain to a manager. Softmax extends it to many classes; C regularizes it; class weights handle rare classes.</span></li>
    <li><b>Leads to: the rest of the Classification group, and beyond</b><span><a class="xref" data-note="ml_naivebayes">Naive Bayes</a> also outputs P(class | x) but gets it by counting and Bayes' rule instead of fitting weights. <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a> drops the formula and asks the neighbours, so boundaries can bend. <a class="xref" data-note="ml_svm">Support Vector Machines</a> keep the straight boundary but place it for the widest gap, and kernels bend it. Outside the group, <a class="xref" data-note="ml_evaluation">Classification Metrics</a> and <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a> judge any classifier's probabilities, and <a class="xref" data-note="ml_gbm">Gradient Boosting</a> reuses this note's log-loss and its gradient p − y in every tree.</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 680 350" width="680">
<defs><marker id="lg-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="60" y="8" width="250" height="44" rx="8" class="fs" stroke="currentColor"/>
<text x="185" y="27" text-anchor="middle" font-size="13">Foundations</text><text x="185" y="43" text-anchor="middle" class="tm" font-size="11">loss · gradient descent · regularization</text>
<rect x="370" y="8" width="250" height="44" rx="8" class="fs" stroke="currentColor"/>
<text x="495" y="27" text-anchor="middle" font-size="13">Linear Regression</text><text x="495" y="43" text-anchor="middle" class="tm" font-size="11">weighted sum, least squares</text>
<line x1="185" y1="52" x2="300" y2="96" stroke="currentColor" marker-end="url(#lg-fa)"/>
<line x1="495" y1="52" x2="380" y2="96" stroke="currentColor" marker-end="url(#lg-fa)"/>
<rect x="20" y="84" width="640" height="160" rx="12" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.5"/>
<text x="34" y="102" class="tm" font-size="11.5">CLASSIFICATION GROUP</text>
<rect x="250" y="96" width="180" height="50" rx="8" class="fb sb" stroke-width="3"/>
<text x="340" y="117" text-anchor="middle" font-size="14" font-weight="700">Logistic Regression</text><text x="340" y="136" text-anchor="middle" class="tb" font-size="11">YOU ARE HERE · opens the group</text>
<line x1="300" y1="146" x2="130" y2="182" stroke="currentColor" marker-end="url(#lg-fa)"/>
<line x1="340" y1="146" x2="340" y2="182" stroke="currentColor" marker-end="url(#lg-fa)"/>
<line x1="380" y1="146" x2="550" y2="182" stroke="currentColor" marker-end="url(#lg-fa)"/>
<rect x="40" y="184" width="180" height="50" rx="8" class="ft st"/>
<text x="130" y="204" text-anchor="middle" font-size="12.5">Naive Bayes</text><text x="130" y="222" text-anchor="middle" class="tm" font-size="11">P(class|x) by counting</text>
<rect x="250" y="184" width="180" height="50" rx="8" class="ft st"/>
<text x="340" y="204" text-anchor="middle" font-size="12.5">K-Nearest Neighbors</text><text x="340" y="222" text-anchor="middle" class="tm" font-size="11">no formula, ask neighbours</text>
<rect x="460" y="184" width="180" height="50" rx="8" class="ft st"/>
<text x="550" y="204" text-anchor="middle" font-size="12.5">Support Vector Machines</text><text x="550" y="222" text-anchor="middle" class="tm" font-size="11">widest gap, kernels</text>
<line x1="340" y1="244" x2="130" y2="282" stroke="currentColor" marker-end="url(#lg-fa)"/>
<line x1="340" y1="244" x2="340" y2="282" stroke="currentColor" marker-end="url(#lg-fa)"/>
<line x1="340" y1="244" x2="550" y2="282" stroke="currentColor" marker-end="url(#lg-fa)"/>
<rect x="40" y="284" width="180" height="50" rx="8" class="fg sg"/>
<text x="130" y="304" text-anchor="middle" font-size="12.5">Classification Metrics</text><text x="130" y="322" text-anchor="middle" class="tm" font-size="11">precision, recall, ROC</text>
<rect x="250" y="284" width="180" height="50" rx="8" class="fg sg"/>
<text x="340" y="304" text-anchor="middle" font-size="12.5">Thresholds &amp; Calibration</text><text x="340" y="322" text-anchor="middle" class="tm" font-size="11">is p = 0.8 really 80%?</text>
<rect x="460" y="284" width="180" height="50" rx="8" class="fg sg"/>
<text x="550" y="304" text-anchor="middle" font-size="12.5">Trees &amp; Boosting</text><text x="550" y="322" text-anchor="middle" class="tm" font-size="11">log-loss, gradient p − y</text>
</svg><figcaption>The Classification group. Logistic regression is the root: it defines the task (predict P(class | x)), the loss (log-loss) and the vocabulary (boundary, threshold, odds). The three siblings are different answers to "how do I get P(class | x)?". Green boxes reuse this note's ideas.</figcaption></figure>
  <h3>How the four Classification notes connect</h3>
  <table class="tbl">
    <tr><th>Note</th><th>How it gets P(class | x)</th><th>Boundary shape</th><th>Uses from this note</th></tr>
    <tr><td><strong>Logistic Regression</strong> (this)</td><td>Fits weights so σ(w·x + b) maximises the likelihood</td><td>Straight line / flat plane</td><td>–</td></tr>
    <tr><td><a class="xref" data-note="ml_naivebayes">Naive Bayes</a></td><td>Counts P(x | class) and P(class), flips them with Bayes' rule</td><td>Linear (multinomial) or quadratic (Gaussian)</td><td>log-odds, log-loss, threshold, calibration</td></tr>
    <tr><td><a class="xref" data-note="ml_knn">K-Nearest Neighbors</a></td><td>Share of each class among the k nearest rows</td><td>Any shape, jagged</td><td>scaling, decision boundary, imbalance</td></tr>
    <tr><td><a class="xref" data-note="ml_svm">Support Vector Machines</a></td><td>Gives a score, not a probability (needs calibration)</td><td>Straight, or curved with kernels</td><td>w·x + b, regularization C, hinge vs log-loss</td></tr>
  </table>
  <p>Suggested order: this note, then <a class="xref" data-note="ml_naivebayes">Naive Bayes</a> (the "generative" twin of logistic regression), then <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a>, then <a class="xref" data-note="ml_svm">Support Vector Machines</a>. Read <a class="xref" data-note="ml_evaluation">Classification Metrics</a> alongside: every classifier here is judged with it. The maths you need is the derivative of a log and the chain rule (<a class="xref" data-note="m_calculus">Calculus</a>), re-explained where used.</p>

  <h2 id="lg-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>This whole note follows one story: <strong>six students, their hours of study, and whether they passed</strong> (hours 1–6, passed 0, 0, 1, 0, 1, 1), later joined by mock tests and a few more students. Each concept below answers the question left open by the one before it. Read the ladder first; every section then fills in one rung.</p>
  <ol class="story">
    <li><b>Classification</b><span>Q: what should a model output when the answer is "pass" or "fail"? → a probability P(pass | x), then a decision by threshold. But how do we produce a probability from features?</span></li>
    <li><b>Linear regression on 0/1 (the failed attempt)</b><span>Q: can we reuse the line we already know? → ŷ = −0.2 + 0.2·hours. But it says −0.2 at 0 hours and 1.8 at 10 hours, and one easy 20-hour student drags the cut from 3.50 to 4.16. We need a bounded output.</span></li>
    <li><b>Odds and log-odds</b><span>Q: on what scale may a straight line run from −∞ to +∞ and still mean "probability"? → log-odds ln(p/(1 − p)). But a line on that scale must be turned back into p.</span></li>
    <li><b>Sigmoid</b><span>Q: how do we go from log-odds back to p? → σ(z) = 1/(1 + e^(−z)), the inverse of the log-odds. The students' scores become 0.046 … 0.954. But where do the score's weights come from?</span></li>
    <li><b>The logistic model</b><span>Q: how do features become a probability? → p = σ(w·x + b). But how do we tell good weights from bad ones?</span></li>
    <li><b>Likelihood → log-loss</b><span>Q: what number scores a set of weights? → the probability the model gives to what actually happened; as a per-row average of −ln, the log-loss (0.693 for w = 0, 0.413 for the fitted weights). But it cannot be minimised by a formula.</span></li>
    <li><b>Gradient and gradient descent</b><span>Q: how do we find the weights with the smallest log-loss? → follow the gradient (1/n)Σ(p − y)x downhill: w = 0 → 0.292 → … → 1.214, b → −4.249. But what has the model learnt to <em>do</em>?</span></li>
    <li><b>Decision boundary</b><span>Q: where does the model switch from fail to pass? → where w·x + b = 0: 3.50 hours; with mock tests, the line tests = 6.52 − 1.39·hours. But how big is the effect of one extra hour?</span></li>
    <li><b>Odds ratio</b><span>Q: how do we explain a weight in words? → e^w: each hour multiplies the odds of passing by 4.56. But this only works for two classes.</span></li>
    <li><b>Softmax</b><span>Q: what about fail / pass / distinction? → K scores and pₖ = e^(zₖ)/Σe^(zⱼ). But likelihood alone lets weights explode on separable or wide data.</span></li>
    <li><b>Regularization (C)</b><span>Q: how do we keep the weights finite and the model from overfitting? → add ½‖w‖² (C = 1 shrinks the students' w from 1.214 to 0.767). But a rare class can still be ignored.</span></li>
    <li><b>Class weights and thresholds</b><span>Q: how do we make the 5% who will fail count? → weight rows n/(K·nₖ) or lower the threshold. But how do we run all this in practice?</span></li>
    <li><b>sklearn solvers</b><span>Q: which settings and algorithm do the minimisation? → LogisticRegression(C, l1_ratio, solver), scaled inputs. But is an effect real or noise?</span></li>
    <li><b>statsmodels inference</b><span>Q: how sure are we about each weight? → standard errors, z, p-values, confidence intervals, odds-ratio CIs. But do we understand it well enough to build it ourselves?</span></li>
    <li><b>From scratch</b><span>Q: can we reproduce every number? → Newton and gradient descent match sklearn to about 10⁻⁷ (and the students' C = 1 answer exactly). But when should we pick this model at all?</span></li>
    <li><b>Comparisons, connections, mistakes</b><span>Q: when is it the right tool, how do all the pieces fit, and where do people go wrong? → sections 15–17, then the Revision Sheet.</span></li>
  </ol>


  <h2 id="lg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Logistic Regression</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The task</div>
        <ul>
          <li><b>Classification</b> = predict a category; <b>regression</b> = predict a number</li>
          <li>Binary · multiclass (one of K) · multilabel (any subset)</li>
          <li>Model gives a <b>score</b> → <b>probability</b> → <b>decision</b> (threshold)</li>
          <li>Linear regression on 0/1: ŷ = −0.2 at 0 h, 1.8 at 10 h; one 20-hour student moves the cut 3.50 → 4.16</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Odds &amp; sigmoid</div>
        <ul>
          <li><b>Odds</b> = p / (1 − p): p = 0.8 → odds 4</li>
          <li><b>Log-odds (logit)</b> = ln(p / (1 − p)): any real number</li>
          <li><b>Sigmoid</b> σ(z) = 1 / (1 + e⁻ᶻ) = inverse of logit</li>
          <li>σ(0) = 0.5 · σ(−z) = 1 − σ(z) · σ′ = σ(1 − σ), max 0.25</li>
          <li>💡 A fan regulator: the knob (z) is linear, the speed (p) saturates</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Model &amp; loss</div>
        <ul>
          <li><b>P(y = 1 | x) = σ(w·x + b)</b>; linear in the log-odds</li>
          <li>Bernoulli likelihood Π p^y (1 − p)^(1−y)</li>
          <li><b>Log-loss</b> = −mean[y ln p + (1 − y) ln(1 − p)] = −ln(likelihood)/n</li>
          <li>Six students: know-nothing model 0.693 → fitted model 0.413</li>
          <li>Convex in w; MSE through a sigmoid is not, and its gradient vanishes when confidently wrong</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Training</div>
        <ul>
          <li><b>Gradient</b>: ∂L/∂z = p − y → ∂L/∂w = mean((p − y)x), ∂L/∂b = mean(p − y)</li>
          <li>6 students, lr 0.5: loss 0.693 → w = 0.292 after step 1</li>
          <li>Converges to w = 1.214, b = −4.249 (= sklearn, C = ∞)</li>
          <li>No closed form; solvers: lbfgs, newton (IRLS), liblinear, sag/saga</li>
          <li>⚠ Perfect separation → weights run to infinity</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading it</div>
        <ul>
          <li><b>Boundary</b> w·x + b = 0 (p = 0.5): straight line; curves need x², x₁x₂</li>
          <li><b>Odds ratio</b> e^w: +1 hour × 4.56 odds</li>
          <li>Probability change depends on where you start: p(1 − p)·w</li>
          <li>Scaled features → coefficients per 1 SD, comparable</li>
          <li>statsmodels: coef, std err, z = coef/se, p-value, 95% CI, pseudo R²</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Extensions &amp; sklearn</div>
        <ul>
          <li><b>Softmax</b>: pₖ = e^zₖ / Σ e^zⱼ; [2, 1, 0.1] → [0.659, 0.242, 0.099]</li>
          <li><b>OvR</b>: K sigmoids, normalised; softmax is the default</li>
          <li><b>C = 1/λ</b>: small C = strong shrink; L2 default; l1_ratio=1 → L1, sparse</li>
          <li><b>class_weight="balanced"</b>: wₖ = n / (K·nₖ); mostly moves the intercept</li>
          <li>Always scale; C = np.inf for no penalty (penalty= is deprecated)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lg-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The whole story in one chain</span></div></div>
      <div class="rm-item rm-done" data-target="lg-task"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Classification vs Regression</span><span class="rm-sub">Score, probability, decision</span></div></div>
      <div class="rm-item rm-done" data-target="lg-linfail"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Why Linear Regression Fails</span><span class="rm-sub">A demo on six students</span></div></div>
      <div class="rm-item rm-done" data-target="lg-sigmoid"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Odds, Log-Odds &amp; Sigmoid</span><span class="rm-sub">Every number by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lg-model"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Logistic Model</span><span class="rm-sub">σ(w·x + b), three readings</span></div></div>
      <div class="rm-item rm-done" data-target="lg-loss"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Log-Loss from Likelihood</span><span class="rm-sub">Derived, and why not MSE</span></div></div>
      <div class="rm-item rm-done" data-target="lg-grad"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Gradient &amp; Gradient Descent</span><span class="rm-sub">Chain rule, one step by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lg-boundary"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Decision Boundary</span><span class="rm-sub">Lines, thresholds, curves</span></div></div>
      <div class="rm-item rm-done" data-target="lg-coef"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Odds Ratios</span><span class="rm-sub">Interpreting coefficients</span></div></div>
      <div class="rm-item rm-done" data-target="lg-multi"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Multiclass</span><span class="rm-sub">One-vs-rest and softmax</span></div></div>
      <div class="rm-item rm-done" data-target="lg-reg"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Regularization &amp; C</span><span class="rm-sub">L2, L1, separation</span></div></div>
      <div class="rm-item rm-done" data-target="lg-imb"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Class Imbalance</span><span class="rm-sub">class_weight vs threshold</span></div></div>
      <div class="rm-item rm-done" data-target="lg-sklearn"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">sklearn in Practice</span><span class="rm-sub">Parameters and solvers</span></div></div>
      <div class="rm-item rm-done" data-target="lg-sm"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">statsmodels Logit</span><span class="rm-sub">The summary, line by line</span></div></div>
      <div class="rm-item rm-done" data-target="lg-scratch"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Newton and GD = sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="lg-compare"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Strengths &amp; Comparisons</span><span class="rm-sub">vs NB, KNN, SVM, trees</span></div></div>
      <div class="rm-item rm-done" data-target="lg-connect"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Each concept built from the last</span></div></div>
      <div class="rm-item rm-done" data-target="lg-traps"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Interview and code traps</span></div></div>
      <div class="rm-item rm-done" data-target="lg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="lg-qa"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="lg-task"><span class="num">01</span>Classification vs Regression</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We know how to predict a number (marks, rent). But many questions have a category as the answer: pass or fail. What exactly is different about predicting a category, and what should the model output?</p>
  <h3>The need</h3>
  <p>In <a class="xref" data-note="ml_regression">Linear Regression</a> the target was a number: a flat's rent, a salary. Many real questions have a <strong>category</strong> as the answer instead:</p>
  <table class="tbl">
    <tr><th>Question</th><th>Answer type</th><th>Kind</th></tr>
    <tr><td>Will this student pass the exam?</td><td>pass / fail</td><td>binary classification</td></tr>
    <tr><td>Will this customer miss next month's EMI?</td><td>yes / no</td><td>binary classification</td></tr>
    <tr><td>Which flower species is this: setosa, versicolor or virginica?</td><td>one of 3</td><td>multiclass classification</td></tr>
    <tr><td>Which topics does this news article cover: sports, politics, business?</td><td>any subset</td><td>multilabel classification</td></tr>
    <tr><td>How many marks will the student get?</td><td>a number</td><td>regression</td></tr>
  </table>
  <p>The test is simple: <strong>can you average two answers and get a sensible answer?</strong> Marks 60 and 80 average to 70, a real mark: regression. "Pass" and "fail" do not average to anything: classification. Classes are usually coded as numbers (fail = 0, pass = 1), but the numbers are only names; "2 = virginica" is not twice "1 = versicolor".</p>
  <h3>Score → probability → decision</h3>
  <p>A good classifier does not jump straight to "pass". It goes through three stages, and keeping them separate is one of the most useful habits in ML:</p>
  <div class="flow"><span>Score z (any real number): how strong is the evidence?</span><span>Probability p in [0, 1]: how likely is "yes"?</span><span>Decision: "yes" if p ≥ threshold</span></div>
  <p>Why separate? A bank may reject loans with default risk above 30%, a hospital may test every patient with cancer risk above 5%, and a spam filter may only block mail above 99%. Same kind of model, different thresholds. The model's job is the honest probability; the business chooses the threshold (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A weather forecast says "70% chance of rain" (probability). Whether <em>you</em> carry an umbrella (decision) depends on how much you hate getting wet. Logistic regression is the forecaster; you choose the threshold.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Classification</strong> is supervised learning where the target y takes one of K discrete values (classes). A <strong>probabilistic classifier</strong> outputs P(y = k | x) for each class k; a <strong>decision rule</strong> (for two classes: predict 1 if P(y = 1 | x) ≥ t) turns it into a label. With t = 0.5 and two classes this picks the more likely class.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Logistic <em>regression</em>" is a classification model. The name is historical: it regresses the <em>log-odds</em> on the features. In interviews, say "it is a classifier; it is called regression because the log-odds are a linear regression on x".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Why Linear Regression Fails.</b> We know we need a probability, not yet how to make one. The obvious try is to reuse linear regression on 0/1 labels.</div>

  <h2 id="lg-linfail"><span class="num">02</span>Why Linear Regression Fails for Classes</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We want P(pass) for each of our six students. We already own a tool that turns hours into a number: least squares. Does a straight line through 0/1 labels give usable probabilities?</p>
  <h3>Try it by hand</h3>
  <p>Six students. The 3-hour student got lucky and passed; the 4-hour student did not.</p>
  <table class="tbl"><caption>Hours studied and result (1 = pass)</caption>
    <tr><th>hours x</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
    <tr><th>passed y</th><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td></tr>
  </table>
  <p>Least squares (from <a class="xref" data-note="ml_regression">Linear Regression</a>): slope = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)². Here x̄ = 3.5, ȳ = 0.5.</p>
  <table class="tbl">
    <tr><th>x</th><th>y</th><th>x − 3.5</th><th>y − 0.5</th><th>product</th><th>(x − 3.5)²</th></tr>
    <tr><td>1</td><td>0</td><td>−2.5</td><td>−0.5</td><td>1.25</td><td>6.25</td></tr>
    <tr><td>2</td><td>0</td><td>−1.5</td><td>−0.5</td><td>0.75</td><td>2.25</td></tr>
    <tr><td>3</td><td>1</td><td>−0.5</td><td>+0.5</td><td>−0.25</td><td>0.25</td></tr>
    <tr><td>4</td><td>0</td><td>+0.5</td><td>−0.5</td><td>−0.25</td><td>0.25</td></tr>
    <tr><td>5</td><td>1</td><td>+1.5</td><td>+0.5</td><td>0.75</td><td>2.25</td></tr>
    <tr><td>6</td><td>1</td><td>+2.5</td><td>+0.5</td><td>1.25</td><td>6.25</td></tr>
    <tr><td colspan="4"><strong>sum</strong></td><td><strong>3.5</strong></td><td><strong>17.5</strong></td></tr>
  </table>
  <p>Slope = 3.5 / 17.5 = 0.2, intercept = 0.5 − 0.2 × 3.5 = −0.2. So ŷ = −0.2 + 0.2·hours. At 0 hours ŷ = −0.2; at 10 hours ŷ = 1.8. A "probability" of −20% or 180% is nonsense. The line crosses 0.5 at hours = 3.5, which happens to look fine here.</p>
  <p>Now add one more student who studied 20 hours and passed. Nobody is surprised. But least squares hates the big error this student makes against the old line (ŷ = 3.8, truth 1), so it tilts the whole line flatter to reduce it, and the 0.5 crossing walks right:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
hours = np.array([1, 2, 3, 4, 5, 6.])           # hours studied
passed = np.array([0, 0, 1, 0, 1, 1])           # 1 = passed the exam
ols = LinearRegression().fit(hours[:, None], passed)
print(f"line: y_hat = {ols.intercept_:.3f} + {ols.coef_[0]:.3f} * hours")
for h in [0, 3.5, 6, 10]:
    print(f"  hours={h:&lt;4} y_hat={ols.predict([[h]])[0]:.3f}")
print(f"  cut at y_hat=0.5 -&gt; hours = {(0.5 - ols.intercept_) / ols.coef_[0]:.2f}")
# one extra student who studied 20 hours and (of course) passed
h2 = np.append(hours, 20); p2 = np.append(passed, 1)
ols2 = LinearRegression().fit(h2[:, None], p2)
cut2 = (0.5 - ols2.intercept_) / ols2.coef_[0]
print(f"with a 20-hour student: y_hat = {ols2.intercept_:.3f} + {ols2.coef_[0]:.3f} * hours, cut = {cut2:.2f}")
print("  predicted labels:", (ols2.predict(h2[:, None]) &gt;= 0.5).astype(int), " true:", p2)</div>
  <div class="fx" data-lang="text">line: y_hat = -0.200 + 0.200 * hours
  hours=0    y_hat=-0.200
  hours=3.5  y_hat=0.500
  hours=6    y_hat=1.000
  hours=10   y_hat=1.800
  cut at y_hat=0.5 -&gt; hours = 3.50
with a 20-hour student: y_hat = 0.325 + 0.042 * hours, cut = 4.16
  predicted labels: [0 0 0 0 1 1 1]  true: [0 0 1 0 1 1 1]</div>
  <p>The obvious, easy student moved the cut from 3.50 to 4.16 hours, and the 3-hour student who passed is now predicted to fail. Squared error punishes the line for being "too right" (ŷ = 3.8 for a 1), which makes no sense for classes.</p>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640">
<line x1="60" y1="250" x2="600" y2="250" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60" y1="250" x2="60" y2="50" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60.0" y1="250" x2="60.0" y2="254" stroke="currentColor"/><text x="60.0" y="266" text-anchor="middle" class="tm" font-size="11">0</text>
<line x1="168.0" y1="250" x2="168.0" y2="254" stroke="currentColor"/><text x="168.0" y="266" text-anchor="middle" class="tm" font-size="11">2</text>
<line x1="276.0" y1="250" x2="276.0" y2="254" stroke="currentColor"/><text x="276.0" y="266" text-anchor="middle" class="tm" font-size="11">4</text>
<line x1="384.0" y1="250" x2="384.0" y2="254" stroke="currentColor"/><text x="384.0" y="266" text-anchor="middle" class="tm" font-size="11">6</text>
<line x1="492.0" y1="250" x2="492.0" y2="254" stroke="currentColor"/><text x="492.0" y="266" text-anchor="middle" class="tm" font-size="11">8</text>
<line x1="600.0" y1="250" x2="600.0" y2="254" stroke="currentColor"/><text x="600.0" y="266" text-anchor="middle" class="tm" font-size="11">10</text>
<line x1="56" y1="250.0" x2="60" y2="250.0" stroke="currentColor"/><text x="53" y="254.0" text-anchor="end" class="tm" font-size="11">-0.4</text>
<line x1="56" y1="205.6" x2="60" y2="205.6" stroke="currentColor"/><text x="53" y="209.6" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="56" y1="150.0" x2="60" y2="150.0" stroke="currentColor"/><text x="53" y="154.0" text-anchor="end" class="tm" font-size="11">0.5</text>
<line x1="56" y1="94.4" x2="60" y2="94.4" stroke="currentColor"/><text x="53" y="98.4" text-anchor="end" class="tm" font-size="11">1</text>
<line x1="56" y1="50.0" x2="60" y2="50.0" stroke="currentColor"/><text x="53" y="54.0" text-anchor="end" class="tm" font-size="11">1.4</text>
<text x="330.0" y="282" text-anchor="middle" font-size="12">hours studied</text>
<text x="22" y="150.0" text-anchor="middle" font-size="12" transform="rotate(-90 22 150.0)">y or p</text>
<line x1="60" y1="205.6" x2="600" y2="205.6" stroke="currentColor" stroke-dasharray="3 4" stroke-opacity="0.35"/>
<line x1="60" y1="94.4" x2="600" y2="94.4" stroke="currentColor" stroke-dasharray="3 4" stroke-opacity="0.35"/>
<path d="M60.0 227.8 L65.4 225.6 L70.8 223.3 L76.2 221.1 L81.6 218.9 L87.0 216.7 L92.4 214.4 L97.8 212.2 L103.2 210.0 L108.6 207.8 L114.0 205.6 L119.4 203.3 L124.8 201.1 L130.2 198.9 L135.6 196.7 L141.0 194.4 L146.4 192.2 L151.8 190.0 L157.2 187.8 L162.6 185.6 L168.0 183.3 L173.4 181.1 L178.8 178.9 L184.2 176.7 L189.6 174.4 L195.0 172.2 L200.4 170.0 L205.8 167.8 L211.2 165.6 L216.6 163.3 L222.0 161.1 L227.4 158.9 L232.8 156.7 L238.2 154.4 L243.6 152.2 L249.0 150.0 L254.4 147.8 L259.8 145.6 L265.2 143.3 L270.6 141.1 L276.0 138.9 L281.4 136.7 L286.8 134.4 L292.2 132.2 L297.6 130.0 L303.0 127.8 L308.4 125.6 L313.8 123.3 L319.2 121.1 L324.6 118.9 L330.0 116.7 L335.4 114.4 L340.8 112.2 L346.2 110.0 L351.6 107.8 L357.0 105.6 L362.4 103.3 L367.8 101.1 L373.2 98.9 L378.6 96.7 L384.0 94.4 L389.4 92.2 L394.8 90.0 L400.2 87.8 L405.6 85.6 L411.0 83.3 L416.4 81.1 L421.8 78.9 L427.2 76.7 L432.6 74.4 L438.0 72.2 L443.4 70.0 L448.8 67.8 L454.2 65.6 L459.6 63.3 L465.0 61.1 L470.4 58.9 L475.8 56.7 L481.2 54.4 L486.6 52.2 L492.0 50.0" fill="none" class="sr" stroke-width="2.2"/>
<path d="M60.0 204.0 L65.4 203.8 L70.8 203.6 L76.2 203.3 L81.6 203.0 L87.0 202.7 L92.4 202.4 L97.8 202.0 L103.2 201.5 L108.6 201.0 L114.0 200.5 L119.4 199.8 L124.8 199.1 L130.2 198.4 L135.6 197.5 L141.0 196.5 L146.4 195.5 L151.8 194.3 L157.2 193.0 L162.6 191.6 L168.0 190.1 L173.4 188.4 L178.8 186.5 L184.2 184.6 L189.6 182.4 L195.0 180.1 L200.4 177.7 L205.8 175.0 L211.2 172.3 L216.6 169.4 L222.0 166.4 L227.4 163.2 L232.8 160.0 L238.2 156.7 L243.6 153.4 L249.0 150.0 L254.4 146.6 L259.8 143.3 L265.2 140.0 L270.6 136.8 L276.0 133.6 L281.4 130.6 L286.8 127.7 L292.2 125.0 L297.6 122.3 L303.0 119.9 L308.4 117.6 L313.8 115.4 L319.2 113.5 L324.6 111.6 L330.0 109.9 L335.4 108.4 L340.8 107.0 L346.2 105.7 L351.6 104.5 L357.0 103.5 L362.4 102.5 L367.8 101.6 L373.2 100.9 L378.6 100.2 L384.0 99.5 L389.4 99.0 L394.8 98.5 L400.2 98.0 L405.6 97.6 L411.0 97.3 L416.4 97.0 L421.8 96.7 L427.2 96.4 L432.6 96.2 L438.0 96.0 L443.4 95.8 L448.8 95.7 L454.2 95.5 L459.6 95.4 L465.0 95.3 L470.4 95.2 L475.8 95.1 L481.2 95.0 L486.6 95.0 L492.0 94.9 L497.4 94.9 L502.8 94.8 L508.2 94.8 L513.6 94.7 L519.0 94.7 L524.4 94.7 L529.8 94.6 L535.2 94.6 L540.6 94.6 L546.0 94.6 L551.4 94.6 L556.8 94.6 L562.2 94.5 L567.6 94.5 L573.0 94.5 L578.4 94.5 L583.8 94.5 L589.2 94.5 L594.6 94.5 L600.0 94.5" fill="none" class="sb" stroke-width="2.6"/>
<circle cx="114.0" cy="205.6" r="6" class="fr sr" stroke-width="1.5"/>
<circle cx="168.0" cy="205.6" r="6" class="fr sr" stroke-width="1.5"/>
<circle cx="222.0" cy="94.4" r="6" class="fg sg" stroke-width="1.5"/>
<circle cx="276.0" cy="205.6" r="6" class="fr sr" stroke-width="1.5"/>
<circle cx="330.0" cy="94.4" r="6" class="fg sg" stroke-width="1.5"/>
<circle cx="384.0" cy="94.4" r="6" class="fg sg" stroke-width="1.5"/>
<text x="500.1" y="54.4" class="tr" font-size="12">line: 1.4 at 8 h</text>
<text x="459.6" y="110.0" class="tb" font-size="12">sigmoid: stays in 0..1</text>
<text x="70.8" y="238.9" class="tr" font-size="12">−0.2 at 0 h</text>
<line x1="249.0" y1="250.0" x2="249.0" y2="50.0" stroke="currentColor" stroke-dasharray="2 3" stroke-opacity="0.6"/>
<text x="254.4" y="61.1" class="tm" font-size="11">both cross 0.5 at 3.5 h</text>
</svg><figcaption>Red: the least-squares line on the six students; it leaves [0, 1] on both sides. Blue: the logistic curve fitted to the same students (section 06); it bends to stay between 0 and 1. Green dots passed, red dots failed.</figcaption></figure>
  <h3>The three failures</h3>
  <table class="tbl">
    <tr><th>Problem</th><th>Why it happens</th><th>What we want instead</th></tr>
    <tr><td>Outputs outside [0, 1]</td><td>A straight line is unbounded</td><td>A curve that flattens at 0 and 1</td></tr>
    <tr><td>Easy, far-away points drag the cut</td><td>Squared error punishes being "too right"</td><td>A loss that does not punish confident correct answers</td></tr>
    <tr><td>Constant effect: +1 hour always adds 0.2</td><td>Linear in p</td><td>Big effect near 50/50, tiny effect when already sure</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>Fitting ordinary least squares to a 0/1 target is called the <strong>linear probability model (LPM)</strong>. Economists sometimes use it for its easy coefficients, but its predictions can leave [0, 1], its errors are heteroscedastic by construction (variance p(1 − p)), and its threshold is moved by easy points.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Linear regression with a 0.5 threshold works fine on my data" can be true on balanced, well-behaved data. Interviewers want the reasons it breaks: unbounded outputs, sensitivity to far-away correct points, and no probabilistic meaning.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Odds, Log-Odds and the Sigmoid.</b> A line is unbounded and bent by easy points. We need a function that squashes any score into (0, 1), steep in the middle and flat at the ends; the language of odds leads straight to it.</div>

  <h2 id="lg-sigmoid"><span class="num">03</span>Odds, Log-Odds and the Sigmoid</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The straight line gave −0.2 and 1.8 for our students. We need a scale on which a straight line is allowed to run from −∞ to +∞ and that still converts back to a probability. Which scale is that?</p>
  <h3>Odds in plain words</h3>
  <p>Cricket commentators say "the odds are 4 to 1 that India wins". That means: for every 1 time India loses, it wins 4 times. Out of 5 matches, 4 wins, so p = 4/5 = 0.8. Odds and probability are two ways to say the same thing:</p>
  <p style="text-align:center"><strong>odds = p / (1 − p)</strong> &nbsp;&nbsp;and back&nbsp;&nbsp; <strong>p = odds / (1 + odds)</strong></p>
  <table class="tbl"><caption>Probability, odds and log-odds by hand</caption>
    <tr><th>p</th><th>odds = p/(1 − p)</th><th>log-odds = ln(odds)</th><th>reading</th></tr>
    <tr><td>0.1</td><td>0.1/0.9 = 0.111</td><td>−2.197</td><td>1 to 9 in favour</td></tr>
    <tr><td>0.5</td><td>0.5/0.5 = 1</td><td>0</td><td>even</td></tr>
    <tr><td>0.8</td><td>0.8/0.2 = 4</td><td>+1.386</td><td>4 to 1 in favour</td></tr>
    <tr><td>0.99</td><td>0.99/0.01 = 99</td><td>+4.595</td><td>99 to 1</td></tr>
  </table>
  <p>Look at the ranges. p lives in [0, 1]. Odds live in [0, ∞). Log-odds live in (−∞, +∞), symmetric around 0 (p = 0.1 and p = 0.9 give −2.197 and +2.197). That last range is exactly what a straight line w·x + b produces. So the trick is:</p>
  <div class="callout intu"><span class="label">Intuition</span>
    <p>Do not ask the line to predict p (bounded). Ask it to predict the <strong>log-odds</strong> (unbounded), then convert back. Log-odds are also called the <strong>logit</strong>: logit(p) = ln(p / (1 − p)).</p>
  </div>
  <h3>Deriving the sigmoid</h3>
  <p>Set the log-odds equal to the line's score z and solve for p:</p>
  <ol>
    <li>ln(p / (1 − p)) = z</li>
    <li>Undo the log: p / (1 − p) = e^z</li>
    <li>Multiply out: p = e^z − p·e^z, so p(1 + e^z) = e^z</li>
    <li>p = e^z / (1 + e^z). Divide top and bottom by e^z: <strong>p = 1 / (1 + e^(−z)) = σ(z)</strong></li>
  </ol>
  <p>That is the <strong>sigmoid</strong> (or logistic function). It is not chosen for looks; it is simply "log-odds back to probability".</p>
  <h3>The sigmoid by hand</h3>
  <p>Take z = 1: e^(−1) = 0.368, so σ(1) = 1 / 1.368 = 0.731. Take z = −2: e^2 = 7.389, so σ(−2) = 1 / 8.389 = 0.119. The code fills in the rest, and also the slope p(1 − p), derived below:</p>
  <div class="fx" data-lang="py">def sigmoid(z):
    return 1 / (1 + np.exp(-z))
print(" z    odds=e^z   p=sigmoid(z)  slope p(1-p)")
for z in [-4, -2, -1, 0, 1, 2, 4]:
    p = sigmoid(z)
    print(f"{z:+d}  {np.exp(z):9.3f}   {p:.3f}         {p * (1 - p):.3f}")
# inverse: from a probability back to the log-odds (the "logit")
for p in [0.1, 0.5, 0.8]:
    print(f"p={p}: odds={p / (1 - p):.3f}  log-odds={np.log(p / (1 - p)):+.3f}")
print("symmetry sigmoid(-1.5) =", round(sigmoid(-1.5), 4), " 1 - sigmoid(1.5) =", round(1 - sigmoid(1.5), 4))
# our six students under the weights section 06 will find (w = 1.214, b = -4.249)
z_st = 1.214 * hours - 4.249
print("students z:", z_st.round(2), "\\n         p:", sigmoid(z_st).round(3))</div>
  <div class="fx" data-lang="text"> z    odds=e^z   p=sigmoid(z)  slope p(1-p)
-4      0.018   0.018         0.018
-2      0.135   0.119         0.105
-1      0.368   0.269         0.197
+0      1.000   0.500         0.250
+1      2.718   0.731         0.197
+2      7.389   0.881         0.105
+4     54.598   0.982         0.018
p=0.1: odds=0.111  log-odds=-2.197
p=0.5: odds=1.000  log-odds=+0.000
p=0.8: odds=4.000  log-odds=+1.386
symmetry sigmoid(-1.5) = 0.1824  1 - sigmoid(1.5) = 0.1824
students z: [-3.03 -1.82 -0.61  0.61  1.82  3.04] 
         p: [0.046 0.139 0.353 0.647 0.861 0.954]</div>
  <figure class="viz"><svg viewBox="0 0 640 290" width="640">
<line x1="60" y1="240" x2="600" y2="240" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60" y1="240" x2="60" y2="40" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60.0" y1="240" x2="60.0" y2="244" stroke="currentColor"/><text x="60.0" y="256" text-anchor="middle" class="tm" font-size="11">-6</text>
<line x1="150.0" y1="240" x2="150.0" y2="244" stroke="currentColor"/><text x="150.0" y="256" text-anchor="middle" class="tm" font-size="11">-4</text>
<line x1="240.0" y1="240" x2="240.0" y2="244" stroke="currentColor"/><text x="240.0" y="256" text-anchor="middle" class="tm" font-size="11">-2</text>
<line x1="330.0" y1="240" x2="330.0" y2="244" stroke="currentColor"/><text x="330.0" y="256" text-anchor="middle" class="tm" font-size="11">0</text>
<line x1="420.0" y1="240" x2="420.0" y2="244" stroke="currentColor"/><text x="420.0" y="256" text-anchor="middle" class="tm" font-size="11">2</text>
<line x1="510.0" y1="240" x2="510.0" y2="244" stroke="currentColor"/><text x="510.0" y="256" text-anchor="middle" class="tm" font-size="11">4</text>
<line x1="600.0" y1="240" x2="600.0" y2="244" stroke="currentColor"/><text x="600.0" y="256" text-anchor="middle" class="tm" font-size="11">6</text>
<line x1="56" y1="240.0" x2="60" y2="240.0" stroke="currentColor"/><text x="53" y="244.0" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="56" y1="140.0" x2="60" y2="140.0" stroke="currentColor"/><text x="53" y="144.0" text-anchor="end" class="tm" font-size="11">0.5</text>
<line x1="56" y1="40.0" x2="60" y2="40.0" stroke="currentColor"/><text x="53" y="44.0" text-anchor="end" class="tm" font-size="11">1</text>
<text x="330.0" y="272" text-anchor="middle" font-size="12">z = w·x + b  (log-odds)</text>
<text x="22" y="140.0" text-anchor="middle" font-size="12" transform="rotate(-90 22 140.0)">p = σ(z)</text>
<line x1="60" y1="140.0" x2="600" y2="140.0" stroke="currentColor" stroke-dasharray="3 4" stroke-opacity="0.35"/>
<path d="M60.0 239.5 L64.5 239.5 L69.0 239.4 L73.5 239.3 L78.0 239.3 L82.5 239.2 L87.0 239.1 L91.5 239.0 L96.0 238.9 L100.5 238.8 L105.0 238.7 L109.5 238.5 L114.0 238.4 L118.5 238.2 L123.0 238.0 L127.5 237.8 L132.0 237.6 L136.5 237.3 L141.0 237.0 L145.5 236.7 L150.0 236.4 L154.5 236.0 L159.0 235.6 L163.5 235.2 L168.0 234.7 L172.5 234.1 L177.0 233.5 L181.5 232.9 L186.0 232.2 L190.5 231.4 L195.0 230.5 L199.5 229.6 L204.0 228.5 L208.5 227.4 L213.0 226.2 L217.5 224.8 L222.0 223.4 L226.5 221.8 L231.0 220.0 L235.5 218.2 L240.0 216.2 L244.5 214.0 L249.0 211.6 L253.5 209.1 L258.0 206.4 L262.5 203.5 L267.0 200.4 L271.5 197.2 L276.0 193.7 L280.5 190.1 L285.0 186.2 L289.5 182.2 L294.0 178.0 L298.5 173.6 L303.0 169.1 L307.5 164.5 L312.0 159.7 L316.5 154.9 L321.0 150.0 L325.5 145.0 L330.0 140.0 L334.5 135.0 L339.0 130.0 L343.5 125.1 L348.0 120.3 L352.5 115.5 L357.0 110.9 L361.5 106.4 L366.0 102.0 L370.5 97.8 L375.0 93.8 L379.5 89.9 L384.0 86.3 L388.5 82.8 L393.0 79.6 L397.5 76.5 L402.0 73.6 L406.5 70.9 L411.0 68.4 L415.5 66.0 L420.0 63.8 L424.5 61.8 L429.0 60.0 L433.5 58.2 L438.0 56.6 L442.5 55.2 L447.0 53.8 L451.5 52.6 L456.0 51.5 L460.5 50.4 L465.0 49.5 L469.5 48.6 L474.0 47.8 L478.5 47.1 L483.0 46.5 L487.5 45.9 L492.0 45.3 L496.5 44.8 L501.0 44.4 L505.5 44.0 L510.0 43.6 L514.5 43.3 L519.0 43.0 L523.5 42.7 L528.0 42.4 L532.5 42.2 L537.0 42.0 L541.5 41.8 L546.0 41.6 L550.5 41.5 L555.0 41.3 L559.5 41.2 L564.0 41.1 L568.5 41.0 L573.0 40.9 L577.5 40.8 L582.0 40.7 L586.5 40.7 L591.0 40.6 L595.5 40.5 L600.0 40.5" fill="none" class="sb" stroke-width="2.6"/>
<circle cx="150.0" cy="236.4" r="4.5" class="fb sb"/>
<circle cx="240.0" cy="216.2" r="4.5" class="fb sb"/>
<circle cx="285.0" cy="186.2" r="4.5" class="fb sb"/>
<circle cx="330.0" cy="140.0" r="4.5" class="fb sb"/>
<circle cx="375.0" cy="93.8" r="4.5" class="fb sb"/>
<circle cx="420.0" cy="63.8" r="4.5" class="fb sb"/>
<circle cx="510.0" cy="43.6" r="4.5" class="fb sb"/>
<text x="341.2" y="146.0" class="tb" font-size="11.5">z = 0 → p = 0.5, slope 0.25 (steepest)</text>
<text x="69.0" y="216.0" class="tm" font-size="11.5">z = −4 → p = 0.018</text>
<text x="433.5" y="80.0" class="tm" font-size="11.5">z = +4 → p = 0.982</text>
<text x="69.0" y="54.0" class="tm" font-size="11.5">σ(z) = 1 / (1 + e^(−z))</text>
</svg><figcaption>The sigmoid turns any log-odds score into a probability. It is steepest at z = 0 (slope 0.25) and almost flat beyond |z| = 4.</figcaption></figure>
  <p>The last two lines apply the sigmoid to our six students, using the weights we will derive in section 06 (w = 1.214, b = −4.249): scores −3.03 … +3.04 become probabilities 0.046, 0.139, 0.353, 0.647, 0.861, 0.954. Every probability is safely inside (0, 1), unlike the straight line's −0.2 and 1.8.</p>
  <p>Three properties you will use again and again:</p>
  <ul>
    <li><strong>σ(0) = 0.5</strong>: a score of 0 means "even odds". This is where the decision boundary will be.</li>
    <li><strong>Symmetry σ(−z) = 1 − σ(z)</strong>: checked above, 0.1824 both ways. So P(y = 0) = σ(−z); swapping the class labels just flips the sign of every weight.</li>
    <li><strong>Slope σ′(z) = σ(z)(1 − σ(z))</strong>. Derivation: σ = (1 + e^(−z))^(−1); chain rule gives σ′ = e^(−z) / (1 + e^(−z))² = [1/(1 + e^(−z))]·[e^(−z)/(1 + e^(−z))] = σ·(1 − σ). The slope is largest, 0.25, at z = 0, and only 0.018 at z = ±4. So +1 in score moves p by about 0.23 near the middle (0.500 → 0.731) but only by about 0.03 near the edge (0.018 → 0.047).</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fan regulator, not an on/off switch. Turning the knob (the score z) is linear. The fan speed (p) responds strongly in the middle range and hardly at all when the fan is already almost off or at full speed.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Odds</strong>(p) = p / (1 − p). <strong>Logit</strong>(p) = ln(p / (1 − p)), the log-odds, mapping (0, 1) onto ℝ. The <strong>sigmoid</strong> σ(z) = 1 / (1 + e^(−z)) is its inverse, mapping ℝ onto (0, 1), with σ(−z) = 1 − σ(z) and σ′(z) = σ(z)(1 − σ(z)).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Odds are not probabilities. "Odds of 2" means p = 2/3, not 2. For rare events they are nearly equal (z = −4: odds 0.018, p = 0.018), which is why doctors loosely mix them up; for common events they are very different (p = 0.8, odds 4).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Logistic Model.</b> The sigmoid converts a score to a probability, but we have not said how features produce the score or what the full model claims.</div>

  <h2 id="lg-model"><span class="num">04</span>The Logistic Regression Model</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We have a converter (the sigmoid) from score to probability. How do the hours and mock tests of a student become that score, and what exactly does the finished model claim?</p>
  <h3>Putting the pieces together</h3>
  <div class="flow"><span>Features x₁ … x_d</span><span>Score z = b + w₁x₁ + … + w_dx_d (log-odds)</span><span>p = σ(z) = P(y = 1 | x)</span><span>Label = 1 if p ≥ 0.5 (z ≥ 0)</span></div>
  <p>Same weighted sum as linear regression, one extra squash. Every weight now means "how much this feature adds to the log-odds".</p>
  <h3>Worked example: predict one student by hand</h3>
  <p>Suppose training (section 06) gave b = −7.14, w_hours = 1.52, w_tests = 1.10 (number of mock tests taken). A new student studied 3 hours and took 2 mock tests:</p>
  <table class="tbl">
    <tr><th>step</th><th>calculation</th><th>result</th></tr>
    <tr><td>score</td><td>−7.14 + 1.52 × 3 + 1.10 × 2 = −7.14 + 4.55 + 2.19</td><td>z = −0.40</td></tr>
    <tr><td>odds</td><td>e^(−0.40)</td><td>0.67 (2 to 3 in favour)</td></tr>
    <tr><td>probability</td><td>1 / (1 + e^(0.40)) = 1 / (1 + 1.49)</td><td>p = 0.40</td></tr>
    <tr><td>decision</td><td>0.40 &lt; 0.5</td><td>predict fail</td></tr>
  </table>
  <p>Section 08 shows how to read these weights in words ("each extra hour multiplies the odds of passing by 4.6").</p>
  <h3>Three ways to read the same model</h3>
  <table class="tbl">
    <tr><th>View</th><th>Statement</th><th>Why it matters</th></tr>
    <tr><td>Probabilistic</td><td>y ~ Bernoulli(p), p = σ(w·x + b)</td><td>Gives the likelihood and hence the loss (section 05)</td></tr>
    <tr><td>Log-odds (GLM)</td><td>logit(p) = w·x + b</td><td>Coefficients are additive on the log-odds scale (section 08); it is a <em>generalised linear model</em> with logit link</td></tr>
    <tr><td>Latent variable</td><td>y* = w·x + b + ε with ε ~ Logistic(0, 1); y = 1 if y* &gt; 0</td><td>Explains the link to probit (ε normal instead) and to "utility" models in economics</td></tr>
    <tr><td>Geometric</td><td>The boundary w·x + b = 0 is a hyperplane; |z| / ‖w‖ is the distance to it</td><td>Same geometry as <a class="xref" data-note="ml_svm">SVM</a>; far from the plane = confident</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Binary logistic regression</strong>: P(y = 1 | x) = σ(wᵀx + b) = 1 / (1 + e^(−(wᵀx + b))), with parameters w ∈ ℝ^d (weights) and b ∈ ℝ (intercept / bias), estimated by maximum likelihood (minimum log-loss), usually with a penalty.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Linear model" here means linear in the <em>log-odds</em>, not in the probability. The curve p(x) is S-shaped; only z(x) is a straight line. Also, the model assumes the effect on log-odds is additive: if hours matter more for students who also took mock tests, you must add an interaction column hours × tests yourself.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Log-Loss from Likelihood.</b> We can compute p for any weights, but cannot yet say which weights are good.</div>

  <h2 id="lg-loss"><span class="num">05</span>Log-Loss, Derived from Likelihood</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> The model has weights, but we have no way yet to say whether w = 1.214 is better than w = 0 for our six students. What number measures how good a set of weights is?</p>
  <h3>The need</h3>
  <p>For lines we minimised squared error. For probabilities there is a more natural question: <strong>how likely is the data we actually saw, if the model were true?</strong> Good weights make the observed passes and fails likely. That quantity is the <strong>likelihood</strong>.</p>
  <h3>Building the likelihood by hand</h3>
  <p>For one row the model says P(y = 1) = p. If the row really is a 1, the model gave it probability p; if it is a 0, it gave 1 − p. One formula covers both, because y is 0 or 1:</p>
  <p style="text-align:center"><strong>P(yᵢ | xᵢ) = pᵢ^yᵢ · (1 − pᵢ)^(1 − yᵢ)</strong> &nbsp; (y = 1 → p; y = 0 → 1 − p)</p>
  <p>Rows are assumed independent, so the probability of the whole dataset is the product. Take our six students and two candidate models: a "know-nothing" model (w = 0, b = 0, every p = 0.5) and the weights section 06 will find (w = 1.214, b = −4.249, whose p values we computed in section 03).</p>
  <table class="tbl"><caption>Six students under the fitted model w = 1.214, b = −4.249</caption>
    <tr><th>hours</th><th>y</th><th>model p</th><th>prob. given to the truth</th><th>row loss −ln(…)</th><th>know-nothing row loss</th></tr>
    <tr><td>1</td><td>0</td><td>0.046</td><td>1 − 0.046 = 0.954</td><td>0.047</td><td>0.693</td></tr>
    <tr><td>2</td><td>0</td><td>0.139</td><td>1 − 0.139 = 0.861</td><td>0.150</td><td>0.693</td></tr>
    <tr><td>3</td><td>1</td><td>0.353</td><td>0.353</td><td>1.042</td><td>0.693</td></tr>
    <tr><td>4</td><td>0</td><td>0.647</td><td>1 − 0.647 = 0.353</td><td>1.042</td><td>0.693</td></tr>
    <tr><td>5</td><td>1</td><td>0.861</td><td>0.861</td><td>0.150</td><td>0.693</td></tr>
    <tr><td>6</td><td>1</td><td>0.954</td><td>0.954</td><td>0.047</td><td>0.693</td></tr>
    <tr><td colspan="3"><strong>product / mean</strong></td><td>0.954² × 0.861² × 0.353² ≈ <strong>0.084</strong></td><td>2.478 / 6 = <strong>0.413</strong></td><td>0.5⁶ = 0.0156 → <strong>0.693</strong></td></tr>
  </table>
  <p>The fitted model makes what actually happened 0.084 / 0.0156 ≈ 5 times more likely than the coin-flip model. Almost all of its loss comes from the two "surprising" students (3 hours passed, 4 hours failed), each costing 1.042.</p>
  <p>Products of many numbers below 1 become tiny (with 10,000 rows, around 10^(−3000), which underflows to 0 on a computer), and products are awkward to differentiate. Taking the log fixes both: ln turns the product into a sum, and since ln is increasing, the best weights do not change. Maximising the log-likelihood is the same as minimising its negative, and dividing by n gives a per-row average:</p>
  <p style="text-align:center"><strong>Log-loss L(w, b) = −(1/n) Σ [yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)]</strong></p>
  <p>Check: −ln(0.084) / 6 ≈ 2.48 / 6 = 0.413, the same as the mean of the row losses. This 0.413 is the number gradient descent will reach in section 06.</p>
  <div class="fx" data-lang="py">y = passed                                               # the six students: 0, 0, 1, 0, 1, 1
for w, b in [(0.0, 0.0), (1.214, -4.249)]:               # a "know-nothing" model and the fitted one
    p = sigmoid(w * hours + b)
    loss_rows = -(y * np.log(p) + (1 - y) * np.log(1 - p))
    lik = np.prod(np.where(y == 1, p, 1 - p))            # probability the model gives to what happened
    print(f"w={w}, b={b}: p={p.round(3)}")
    print(f"   row losses={loss_rows.round(3)}  mean log-loss={loss_rows.mean():.3f}  "
          f"likelihood={lik:.4f}  -ln(lik)/6={-np.log(lik) / 6:.3f}")
from sklearn.metrics import log_loss
print("sklearn log_loss (fitted):", round(log_loss(y, sigmoid(1.214 * hours - 4.249)), 3))
# a confidently wrong row: truth y=1, model says p=0.01
for p1 in [0.99, 0.5, 0.1, 0.01]:
    print(f"y=1 p={p1:&lt;5} logloss={-np.log(p1):6.3f}  squared={(1 - p1)**2:.3f}  "
          f"|grad wrt z|: logloss {abs(p1 - 1):.3f}  squared {abs(2 * (p1 - 1) * p1 * (1 - p1)):.4f}")</div>
  <div class="fx" data-lang="text">w=0.0, b=0.0: p=[0.5 0.5 0.5 0.5 0.5 0.5]
   row losses=[0.693 0.693 0.693 0.693 0.693 0.693]  mean log-loss=0.693  likelihood=0.0156  -ln(lik)/6=0.693
w=1.214, b=-4.249: p=[0.046 0.139 0.353 0.647 0.861 0.954]
   row losses=[0.047 0.15  1.042 1.042 0.15  0.047]  mean log-loss=0.413  likelihood=0.0839  -ln(lik)/6=0.413
sklearn log_loss (fitted): 0.413
y=1 p=0.99  logloss= 0.010  squared=0.000  |grad wrt z|: logloss 0.010  squared 0.0002
y=1 p=0.5   logloss= 0.693  squared=0.250  |grad wrt z|: logloss 0.500  squared 0.2500
y=1 p=0.1   logloss= 2.303  squared=0.810  |grad wrt z|: logloss 0.900  squared 0.1620
y=1 p=0.01  logloss= 4.605  squared=0.980  |grad wrt z|: logloss 0.990  squared 0.0196</div>
  <p>The first five lines confirm the hand table (both models) and sklearn's <code>log_loss</code>. The last four lines compare log-loss with squared error for a row whose truth is 1. Read the plot below with them.</p>
  <figure class="viz"><svg viewBox="0 0 640 290" width="640">
<line x1="60" y1="240" x2="600" y2="240" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60" y1="240" x2="60" y2="40" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60.0" y1="240" x2="60.0" y2="244" stroke="currentColor"/><text x="60.0" y="256" text-anchor="middle" class="tm" font-size="11">0</text>
<line x1="168.0" y1="240" x2="168.0" y2="244" stroke="currentColor"/><text x="168.0" y="256" text-anchor="middle" class="tm" font-size="11">0.2</text>
<line x1="276.0" y1="240" x2="276.0" y2="244" stroke="currentColor"/><text x="276.0" y="256" text-anchor="middle" class="tm" font-size="11">0.4</text>
<line x1="384.0" y1="240" x2="384.0" y2="244" stroke="currentColor"/><text x="384.0" y="256" text-anchor="middle" class="tm" font-size="11">0.6</text>
<line x1="492.0" y1="240" x2="492.0" y2="244" stroke="currentColor"/><text x="492.0" y="256" text-anchor="middle" class="tm" font-size="11">0.8</text>
<line x1="600.0" y1="240" x2="600.0" y2="244" stroke="currentColor"/><text x="600.0" y="256" text-anchor="middle" class="tm" font-size="11">1</text>
<line x1="56" y1="240.0" x2="60" y2="240.0" stroke="currentColor"/><text x="53" y="244.0" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="56" y1="200.0" x2="60" y2="200.0" stroke="currentColor"/><text x="53" y="204.0" text-anchor="end" class="tm" font-size="11">1</text>
<line x1="56" y1="160.0" x2="60" y2="160.0" stroke="currentColor"/><text x="53" y="164.0" text-anchor="end" class="tm" font-size="11">2</text>
<line x1="56" y1="120.0" x2="60" y2="120.0" stroke="currentColor"/><text x="53" y="124.0" text-anchor="end" class="tm" font-size="11">3</text>
<line x1="56" y1="80.0" x2="60" y2="80.0" stroke="currentColor"/><text x="53" y="84.0" text-anchor="end" class="tm" font-size="11">4</text>
<line x1="56" y1="40.0" x2="60" y2="40.0" stroke="currentColor"/><text x="53" y="44.0" text-anchor="end" class="tm" font-size="11">5</text>
<text x="330.0" y="272" text-anchor="middle" font-size="12">predicted p = P(y = 1)</text>
<text x="22" y="140.0" text-anchor="middle" font-size="12" transform="rotate(-90 22 140.0)">loss for one row</text>
<path d="M63.6 39.8 L67.2 67.3 L70.8 83.4 L74.3 94.9 L77.9 103.8 L81.5 111.1 L85.1 117.2 L88.6 122.5 L92.2 127.2 L95.8 131.5 L99.4 135.3 L102.9 138.7 L106.5 141.9 L110.1 144.9 L113.7 147.7 L117.3 150.2 L120.8 152.7 L124.4 154.9 L128.0 157.1 L131.6 159.2 L135.1 161.1 L138.7 163.0 L142.3 164.7 L145.9 166.4 L149.4 168.1 L153.0 169.6 L156.6 171.2 L160.2 172.6 L163.7 174.0 L167.3 175.4 L170.9 176.7 L174.5 177.9 L178.0 179.2 L181.6 180.4 L185.2 181.5 L188.8 182.7 L192.3 183.8 L195.9 184.8 L199.5 185.9 L203.1 186.9 L206.6 187.9 L210.2 188.8 L213.8 189.8 L217.4 190.7 L220.9 191.6 L224.5 192.5 L228.1 193.3 L231.7 194.2 L235.2 195.0 L238.8 195.8 L242.4 196.6 L246.0 197.4 L249.5 198.1 L253.1 198.9 L256.7 199.6 L260.3 200.3 L263.9 201.0 L267.4 201.7 L271.0 202.4 L274.6 203.1 L278.2 203.7 L281.7 204.4 L285.3 205.0 L288.9 205.7 L292.5 206.3 L296.0 206.9 L299.6 207.5 L303.2 208.1 L306.8 208.7 L310.3 209.2 L313.9 209.8 L317.5 210.4 L321.1 210.9 L324.6 211.5 L328.2 212.0 L331.8 212.5 L335.4 213.1 L338.9 213.6 L342.5 214.1 L346.1 214.6 L349.7 215.1 L353.2 215.6 L356.8 216.1 L360.4 216.5 L364.0 217.0 L367.5 217.5 L371.1 217.9 L374.7 218.4 L378.3 218.9 L381.8 219.3 L385.4 219.7 L389.0 220.2 L392.6 220.6 L396.1 221.0 L399.7 221.5 L403.3 221.9 L406.9 222.3 L410.5 222.7 L414.0 223.1 L417.6 223.5 L421.2 223.9 L424.8 224.3 L428.3 224.7 L431.9 225.1 L435.5 225.5 L439.1 225.8 L442.6 226.2 L446.2 226.6 L449.8 227.0 L453.4 227.3 L456.9 227.7 L460.5 228.0 L464.1 228.4 L467.7 228.8 L471.2 229.1 L474.8 229.5 L478.4 229.8 L482.0 230.1 L485.5 230.5 L489.1 230.8 L492.7 231.1 L496.3 231.5 L499.8 231.8 L503.4 232.1 L507.0 232.4 L510.6 232.8 L514.1 233.1 L517.7 233.4 L521.3 233.7 L524.9 234.0 L528.4 234.3 L532.0 234.6 L535.6 234.9 L539.2 235.2 L542.7 235.5 L546.3 235.8 L549.9 236.1 L553.5 236.4 L557.1 236.7 L560.6 237.0 L564.2 237.3 L567.8 237.5 L571.4 237.8 L574.9 238.1 L578.5 238.4 L582.1 238.7 L585.7 238.9 L589.2 239.2 L592.8 239.5 L596.4 239.7" fill="none" class="sg" stroke-width="2.6"/>
<path d="M63.6 239.7 L67.2 239.5 L70.8 239.2 L74.3 238.9 L77.9 238.7 L81.5 238.4 L85.1 238.1 L88.6 237.8 L92.2 237.5 L95.8 237.3 L99.4 237.0 L102.9 236.7 L106.5 236.4 L110.1 236.1 L113.7 235.8 L117.3 235.5 L120.8 235.2 L124.4 234.9 L128.0 234.6 L131.6 234.3 L135.1 234.0 L138.7 233.7 L142.3 233.4 L145.9 233.1 L149.4 232.8 L153.0 232.4 L156.6 232.1 L160.2 231.8 L163.7 231.5 L167.3 231.1 L170.9 230.8 L174.5 230.5 L178.0 230.1 L181.6 229.8 L185.2 229.5 L188.8 229.1 L192.3 228.8 L195.9 228.4 L199.5 228.0 L203.1 227.7 L206.6 227.3 L210.2 227.0 L213.8 226.6 L217.4 226.2 L220.9 225.8 L224.5 225.5 L228.1 225.1 L231.7 224.7 L235.2 224.3 L238.8 223.9 L242.4 223.5 L246.0 223.1 L249.5 222.7 L253.1 222.3 L256.7 221.9 L260.3 221.5 L263.9 221.0 L267.4 220.6 L271.0 220.2 L274.6 219.7 L278.2 219.3 L281.7 218.9 L285.3 218.4 L288.9 217.9 L292.5 217.5 L296.0 217.0 L299.6 216.5 L303.2 216.1 L306.8 215.6 L310.3 215.1 L313.9 214.6 L317.5 214.1 L321.1 213.6 L324.6 213.1 L328.2 212.5 L331.8 212.0 L335.4 211.5 L338.9 210.9 L342.5 210.4 L346.1 209.8 L349.7 209.2 L353.2 208.7 L356.8 208.1 L360.4 207.5 L364.0 206.9 L367.5 206.3 L371.1 205.7 L374.7 205.0 L378.3 204.4 L381.8 203.7 L385.4 203.1 L389.0 202.4 L392.6 201.7 L396.1 201.0 L399.7 200.3 L403.3 199.6 L406.9 198.9 L410.5 198.1 L414.0 197.4 L417.6 196.6 L421.2 195.8 L424.8 195.0 L428.3 194.2 L431.9 193.3 L435.5 192.5 L439.1 191.6 L442.6 190.7 L446.2 189.8 L449.8 188.8 L453.4 187.9 L456.9 186.9 L460.5 185.9 L464.1 184.8 L467.7 183.8 L471.2 182.7 L474.8 181.5 L478.4 180.4 L482.0 179.2 L485.5 177.9 L489.1 176.7 L492.7 175.4 L496.3 174.0 L499.8 172.6 L503.4 171.2 L507.0 169.6 L510.6 168.1 L514.1 166.4 L517.7 164.7 L521.3 163.0 L524.9 161.1 L528.4 159.2 L532.0 157.1 L535.6 154.9 L539.2 152.7 L542.7 150.2 L546.3 147.7 L549.9 144.9 L553.5 141.9 L557.1 138.7 L560.6 135.3 L564.2 131.5 L567.8 127.2 L571.4 122.5 L574.9 117.2 L578.5 111.1 L582.1 103.8 L585.7 94.9 L589.2 83.4 L592.8 67.3 L596.4 39.8" fill="none" class="sr" stroke-width="2.6"/>
<path d="M63.6 200.5 L67.2 201.1 L70.8 201.6 L74.3 202.1 L77.9 202.6 L81.5 203.1 L85.1 203.6 L88.6 204.1 L92.2 204.6 L95.8 205.1 L99.4 205.6 L102.9 206.1 L106.5 206.6 L110.1 207.1 L113.7 207.6 L117.3 208.0 L120.8 208.5 L124.4 209.0 L128.0 209.4 L131.6 209.9 L135.1 210.4 L138.7 210.8 L142.3 211.3 L145.9 211.7 L149.4 212.2 L153.0 212.6 L156.6 213.0 L160.2 213.5 L163.7 213.9 L167.3 214.3 L170.9 214.7 L174.5 215.2 L178.0 215.6 L181.6 216.0 L185.2 216.4 L188.8 216.8 L192.3 217.2 L195.9 217.6 L199.5 218.0 L203.1 218.4 L206.6 218.8 L210.2 219.2 L213.8 219.5 L217.4 219.9 L220.9 220.3 L224.5 220.7 L228.1 221.0 L231.7 221.4 L235.2 221.7 L238.8 222.1 L242.4 222.5 L246.0 222.8 L249.5 223.2 L253.1 223.5 L256.7 223.8 L260.3 224.2 L263.9 224.5 L267.4 224.8 L271.0 225.2 L274.6 225.5 L278.2 225.8 L281.7 226.1 L285.3 226.4 L288.9 226.7 L292.5 227.0 L296.0 227.3 L299.6 227.6 L303.2 227.9 L306.8 228.2 L310.3 228.5 L313.9 228.8 L317.5 229.1 L321.1 229.3 L324.6 229.6 L328.2 229.9 L331.8 230.1 L335.4 230.4 L338.9 230.7 L342.5 230.9 L346.1 231.2 L349.7 231.4 L353.2 231.6 L356.8 231.9 L360.4 232.1 L364.0 232.4 L367.5 232.6 L371.1 232.8 L374.7 233.0 L378.3 233.3 L381.8 233.5 L385.4 233.7 L389.0 233.9 L392.6 234.1 L396.1 234.3 L399.7 234.5 L403.3 234.7 L406.9 234.9 L410.5 235.1 L414.0 235.3 L417.6 235.4 L421.2 235.6 L424.8 235.8 L428.3 236.0 L431.9 236.1 L435.5 236.3 L439.1 236.4 L442.6 236.6 L446.2 236.8 L449.8 236.9 L453.4 237.1 L456.9 237.2 L460.5 237.3 L464.1 237.5 L467.7 237.6 L471.2 237.7 L474.8 237.9 L478.4 238.0 L482.0 238.1 L485.5 238.2 L489.1 238.3 L492.7 238.4 L496.3 238.5 L499.8 238.6 L503.4 238.7 L507.0 238.8 L510.6 238.9 L514.1 239.0 L517.7 239.1 L521.3 239.2 L524.9 239.2 L528.4 239.3 L532.0 239.4 L535.6 239.4 L539.2 239.5 L542.7 239.6 L546.3 239.6 L549.9 239.7 L553.5 239.7 L557.1 239.7 L560.6 239.8 L564.2 239.8 L567.8 239.9 L571.4 239.9 L574.9 239.9 L578.5 239.9 L582.1 240.0 L585.7 240.0 L589.2 240.0 L592.8 240.0 L596.4 240.0" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-width="1.6"/>
<text x="76.2" y="50.0" class="tg" font-size="12">truth y = 1: −ln p</text>
<text x="416.4" y="50.0" class="tr" font-size="12">truth y = 0: −ln(1 − p)</text>
<text x="195.0" y="112.0" class="tm" font-size="11.5">dashed: squared error (1 − p)² for y = 1</text>
<circle cx="546.0" cy="235.8" r="4.5" class="fg sg"/><text x="554.0" y="229.8" font-size="11.5">0.105</text>
<circle cx="114.0" cy="147.9" r="4.5" class="fg sg"/><text x="122.0" y="141.9" font-size="11.5">2.303</text>
</svg><figcaption>Log-loss for one row. Green: the truth is 1, loss −ln p explodes as p → 0. Red: the truth is 0, mirror image. Dashed: squared error for a true 1, which never exceeds 1.</figcaption></figure>
  <h3>Why not squared error?</h3>
  <ul>
    <li><strong>Punishment</strong>: saying p = 0.01 for a true 1 costs 4.605 in log-loss but only 0.980 in squared error. Squared error can never cost more than 1 per row, so a confidently wrong model is barely punished. Log-loss goes to infinity: "never say 0% for something that happens".</li>
    <li><strong>Gradient</strong> (how hard training pushes): with log-loss the push on the score is |p − y| = 0.990 for the confidently wrong row, the strongest push of all. With squared error through a sigmoid it is 2(p − y)·p(1 − p) = 0.0196, almost nothing, because the sigmoid's slope p(1 − p) is tiny at p = 0.01. Training would get stuck exactly where it is most wrong.</li>
    <li><strong>Shape</strong>: log-loss of logistic regression is <strong>convex</strong> in (w, b): one bowl, no false bottoms, so any descent method finds the global best. Squared error through a sigmoid is not convex.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two weather forecasters. On a dry day one said "55% rain", the other "99% rain". Log-loss charges the first 0.80 and the second 4.61. A forecaster who bluffs with extreme confidence and is wrong loses credibility fast; one who is honestly unsure loses a little.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Log-loss</strong> (binary cross-entropy, negative log-likelihood per row): L = −(1/n) Σ [yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)]. Minimising it = maximum likelihood estimation under yᵢ ~ Bernoulli(pᵢ). Baseline: a model that always says p = 0.5 scores ln 2 = 0.693; always saying the base rate π scores the entropy −[π ln π + (1 − π) ln(1 − π)].</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Log-loss uses the natural log (ln), so 0.693 means "coin-flip". Some texts use log₂ (then a coin-flip is 1 bit). And one prediction of exactly 0 or 1 that is wrong makes the loss infinite; sklearn clips probabilities to avoid this, which is another reason to keep the model regularised.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Gradient Descent.</b> Log-loss scores weights, but setting its derivative to zero has no closed-form solution. We must walk downhill, so we need the gradient.</div>

  <h2 id="lg-grad"><span class="num">06</span>The Gradient and Gradient Descent by Hand</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Log-loss scores any weights: 0.693 for w = 0, 0.413 for w = 1.214. But nobody handed us 1.214. With no formula to solve, how do we find the weights that make the loss smallest?</p>
  <h3>The need</h3>
  <p>For linear regression, setting the derivative of squared error to zero gave the normal equation, one formula. For log-loss, setting the derivative to zero gives Σ(σ(w·xᵢ + b) − yᵢ)xᵢ = 0, and the w sits inside a sigmoid: there is no way to isolate it. So we do what <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a> taught: start somewhere, compute which way is downhill, take a step, repeat.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Walking down a hill in fog. You cannot see the valley, but you can feel the slope under your feet. Take a step in the steepest downhill direction, feel again, repeat. Because the log-loss "hill" is a single smooth bowl (convex), you always reach the one true bottom.</p>
  </div>
  <h3>Deriving the gradient with the chain rule</h3>
  <p>Work on one row with loss ℓ = −[y ln p + (1 − y) ln(1 − p)], where p = σ(z) and z = w·x + b. Break it into three small derivatives and multiply them (the chain rule, see <a class="xref" data-note="m_calculus">Calculus</a>):</p>
  <table class="tbl">
    <tr><th>piece</th><th>derivative</th><th>why</th></tr>
    <tr><td>∂ℓ/∂p</td><td>−y/p + (1 − y)/(1 − p) = (p − y) / (p(1 − p))</td><td>d(ln p)/dp = 1/p; put over a common denominator</td></tr>
    <tr><td>∂p/∂z</td><td>p(1 − p)</td><td>the sigmoid slope from section 03</td></tr>
    <tr><td>∂z/∂wⱼ, ∂z/∂b</td><td>xⱼ, 1</td><td>z is a weighted sum</td></tr>
    <tr><td><strong>∂ℓ/∂z</strong></td><td>(p − y)/(p(1 − p)) × p(1 − p) = <strong>p − y</strong></td><td>the p(1 − p) cancels: the whole point of pairing log-loss with the sigmoid</td></tr>
  </table>
  <p>Averaging over the n rows:</p>
  <p style="text-align:center"><strong>∂L/∂wⱼ = (1/n) Σ (pᵢ − yᵢ)·xᵢⱼ &nbsp;&nbsp;&nbsp; ∂L/∂b = (1/n) Σ (pᵢ − yᵢ)</strong> &nbsp;&nbsp; or in matrix form ∇L = (1/n) Xᵀ(p − y)</p>
  <p>Read it in words: <em>error (p − y) times input x</em>. A row the model already gets right (p ≈ y) contributes nothing; a confidently wrong row contributes the most. It is the same form as linear regression's gradient (ŷ − y)·x. That is not luck: both are generalised linear models with their "natural" link function, and for all of them the gradient is (prediction − target) × input.</p>
  <h3>One step by hand on six students</h3>
  <p>Data: hours x = 1…6, passed y = 0, 0, 1, 0, 1, 1. Start at w = 0, b = 0, learning rate η = 0.5.</p>
  <table class="tbl"><caption>Step 1 from w = 0, b = 0</caption>
    <tr><th>x</th><th>y</th><th>z = 0·x + 0</th><th>p = σ(z)</th><th>p − y</th><th>(p − y)·x</th><th>row loss</th></tr>
    <tr><td>1</td><td>0</td><td>0</td><td>0.5</td><td>+0.5</td><td>+0.5</td><td>0.693</td></tr>
    <tr><td>2</td><td>0</td><td>0</td><td>0.5</td><td>+0.5</td><td>+1.0</td><td>0.693</td></tr>
    <tr><td>3</td><td>1</td><td>0</td><td>0.5</td><td>−0.5</td><td>−1.5</td><td>0.693</td></tr>
    <tr><td>4</td><td>0</td><td>0</td><td>0.5</td><td>+0.5</td><td>+2.0</td><td>0.693</td></tr>
    <tr><td>5</td><td>1</td><td>0</td><td>0.5</td><td>−0.5</td><td>−2.5</td><td>0.693</td></tr>
    <tr><td>6</td><td>1</td><td>0</td><td>0.5</td><td>−0.5</td><td>−3.0</td><td>0.693</td></tr>
    <tr><td colspan="4"><strong>mean</strong></td><td><strong>0.000</strong></td><td><strong>−3.5/6 = −0.583</strong></td><td><strong>0.693</strong></td></tr>
  </table>
  <ul>
    <li>Gradients: ∂L/∂w = −0.583, ∂L/∂b = 0.000.</li>
    <li>Update: w ← 0 − 0.5 × (−0.583) = <strong>0.292</strong>; b ← 0 − 0.5 × 0 = <strong>0</strong>. A negative gradient means "loss falls if w grows", so w grows: more hours, more likely to pass.</li>
    <li>New scores z = 0.292·x = 0.29, 0.58, 0.88, 1.17, 1.46, 1.75, so p = 0.572, 0.642, 0.706, 0.763, 0.811, 0.852. The loss drops from 0.693 to <strong>0.672</strong>.</li>
  </ul>
  <p>The code repeats exactly this for three steps, then runs 20,000 steps and compares with sklearn (with <code>C=np.inf</code>, which switches off sklearn's default penalty so both minimise the same loss):</p>
  <div class="fx" data-lang="py">x, y = hours, passed
w, b, lr = 0.0, 0.0, 0.5
def logloss(p, y):
    return -(y * np.log(p) + (1 - y) * np.log(1 - p)).mean()
for step in range(1, 4):
    p = sigmoid(w * x + b)
    gw = ((p - y) * x).mean(); gb = (p - y).mean()
    print(f"step {step}: p={p.round(3)} loss={logloss(p, y):.3f} gw={gw:.3f} gb={gb:.3f}")
    w, b = w - lr * gw, b - lr * gb
    print(f"         -&gt; w={w:.3f} b={b:.3f}")
for step in range(4, 20001):
    p = sigmoid(w * x + b)
    w, b = w - lr * ((p - y) * x).mean(), b - lr * (p - y).mean()
p = sigmoid(w * x + b)
print(f"after 20000 steps: w={w:.3f} b={b:.3f} loss={logloss(p, y):.4f}  boundary hours={-b / w:.2f}")
from sklearn.linear_model import LogisticRegression
m = LogisticRegression(C=np.inf).fit(x[:, None], y)          # C=inf: no penalty
print(f"sklearn (C=inf):   w={m.coef_[0, 0]:.3f} b={m.intercept_[0]:.3f}")</div>
  <div class="fx" data-lang="text">step 1: p=[0.5 0.5 0.5 0.5 0.5 0.5] loss=0.693 gw=-0.583 gb=0.000
         -&gt; w=0.292 b=0.000
step 2: p=[0.572 0.642 0.706 0.763 0.811 0.852] loss=0.672 gw=0.365 gb=0.224
         -&gt; w=0.109 b=-0.112
step 3: p=[0.499 0.526 0.554 0.58  0.607 0.632] loss=0.643 gw=-0.273 gb=0.066
         -&gt; w=0.246 b=-0.145
after 20000 steps: w=1.214 b=-4.249 loss=0.4130  boundary hours=3.50
sklearn (C=inf):   w=1.214 b=-4.249</div>
  <p>Step 1 matches the table. In step 2 every p is above 0.5, so the model now over-predicts passing: the mean of p − y is +0.224, the intercept gradient turns positive and b is pushed down to −0.112. That zig-zag is normal with a large learning rate. After 20,000 steps we land on w = 1.214, b = −4.249, identical to sklearn. The final loss 0.413 is well below the coin-flip 0.693. The boundary −b/w = 3.50 hours sits right between the confusing 3- and 4-hour students.</p>
  <h3>Convexity, Newton's method and IRLS</h3>
  <p>The second derivative (Hessian) of the log-loss is H = (1/n) Xᵀ S X with S = diag(pᵢ(1 − pᵢ)). Every pᵢ(1 − pᵢ) ≥ 0, so H is positive semi-definite: the loss is <strong>convex</strong>, and every local minimum is the global minimum. That lets solvers use curvature:</p>
  <ul>
    <li><strong>Newton's method</strong>: θ ← θ − H⁻¹∇L. Uses the bowl's curvature to jump nearly to the bottom; converges in about 5–10 steps (section 14: 10 steps vs about 17,500 for gradient descent).</li>
    <li><strong>IRLS</strong> (iteratively reweighted least squares) is the same Newton step written as a weighted least-squares problem with weights pᵢ(1 − pᵢ). statsmodels and R's <code>glm</code> use it.</li>
    <li><strong>L-BFGS</strong> (sklearn's default) approximates H⁻¹ from recent gradients: nearly Newton's speed without building the d × d matrix.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>For logistic regression with log-loss L: ∇_w L = (1/n) Xᵀ(σ(Xw + b) − y), ∂L/∂b = (1/n) Σ(pᵢ − yᵢ), and Hessian (1/n) Xᵀ diag(p(1 − p)) X ⪰ 0. Gradient descent iterates θ ← θ − η∇L; there is no closed-form minimiser.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Convex does not mean "always has a finite answer". If some line separates the classes perfectly, the loss keeps falling as the weights grow, and the minimum is at infinity (section 10). Also, unscaled features make the bowl a long thin valley: gradient descent zig-zags and sklearn's lbfgs hits <code>max_iter</code> (section 12).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Decision Boundary.</b> We have the best weights, but not a picture of what they decide: where does the model switch its answer?</div>

  <h2 id="lg-boundary"><span class="num">07</span>The Decision Boundary</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We found w = 1.214, b = −4.249 for the six students. What does the model actually draw: at which hours (or which combination of hours and tests) does it switch from "fail" to "pass"?</p>
  <h3>Where p = 0.5</h3>
  <p>The model predicts 1 when p ≥ 0.5, i.e. when σ(z) ≥ 0.5, i.e. when <strong>z ≥ 0</strong>. So the boundary is the set of points where w·x + b = 0.</p>
  <ul>
    <li><strong>One feature</strong>: 1.214·x − 4.249 = 0 gives x = 3.50 hours. A single cut point.</li>
    <li><strong>Two features</strong>: b + w₁x₁ + w₂x₂ = 0 is a straight line. With the ten-student model (hours, mock tests): −7.14 + 1.52·hours + 1.10·tests = 0, so tests = 7.14/1.10 − (1.52/1.10)·hours = <strong>6.52 − 1.39·hours</strong>.</li>
    <li><strong>d features</strong>: a flat hyperplane. The weight vector w points across it, toward class 1.</li>
  </ul>
  <h3>Worked example: ten students</h3>
  <table class="tbl"><caption>Hours, mock tests, result</caption>
    <tr><th>hours</th><td>1</td><td>2</td><td>3</td><td>4</td><td>2</td><td>5</td><td>6</td><td>4</td><td>5</td><td>3</td></tr>
    <tr><th>tests</th><td>0</td><td>1</td><td>0</td><td>1</td><td>3</td><td>2</td><td>1</td><td>3</td><td>0</td><td>3</td></tr>
    <tr><th>passed</th><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td></tr>
  </table>
  <div class="fx" data-lang="py"># two features: hours studied and mock tests taken
X2 = np.array([[1, 0], [2, 1], [3, 0], [4, 1], [2, 3], [5, 2], [6, 1], [4, 3], [5, 0], [3, 3]], dtype=float)
y2 = np.array([0, 0, 0, 0, 1, 1, 1, 1, 1, 0])
m2 = LogisticRegression(C=np.inf).fit(X2, y2)
w1, w2 = m2.coef_[0]; b2 = m2.intercept_[0]
print(f"z = {b2:.2f} + {w1:.2f}*hours + {w2:.2f}*tests")
print(f"boundary: tests = {-b2 / w2:.2f} + {-w1 / w2:.2f}*hours")
for row in [[3, 2], [4, 1], [1, 3]]:
    z = b2 + w1 * row[0] + w2 * row[1]
    print(f"  student {row}: z={z:+.2f}  p={sigmoid(z):.3f}  label={int(z &gt;= 0)}")
# a round boundary needs round features
from sklearn.datasets import make_circles
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.pipeline import make_pipeline
Xc, yc = make_circles(n_samples=300, noise=0.1, factor=0.4, random_state=0)
plain = cross_val_score(LogisticRegression(), Xc, yc, cv=5).mean()
poly = make_pipeline(PolynomialFeatures(2), StandardScaler(), LogisticRegression())
print(f"circles: plain logistic CV acc {plain:.3f} | with x1^2, x1*x2, x2^2: {cross_val_score(poly, Xc, yc, cv=5).mean():.3f}")
pf = poly.fit(Xc, yc)
print("names:", pf[0].get_feature_names_out(["x1", "x2"]).tolist())
print("coefs:", pf[-1].coef_[0].round(2).tolist())</div>
  <div class="fx" data-lang="text">z = -7.14 + 1.52*hours + 1.10*tests
boundary: tests = 6.52 + -1.39*hours
  student [3, 2]: z=-0.40  p=0.402  label=0
  student [4, 1]: z=+0.02  p=0.506  label=1
  student [1, 3]: z=-2.34  p=0.088  label=0
circles: plain logistic CV acc 0.457 | with x1^2, x1*x2, x2^2: 1.000
names: ['1', 'x1', 'x2', 'x1^2', 'x1 x2', 'x2^2']
coefs: [0.0, -0.06, -0.15, -3.65, 0.11, -3.55]</div>
  <p>Check the hand calculation of section 04: student (3, 2) gets z = −0.40, p = 0.402, fail. Student (4, 1) is almost exactly on the line (z = +0.02, p = 0.506). Student (1, 3) is far on the fail side (p = 0.088). Plugging hours = 3 into the boundary gives tests = 6.52 − 4.16 = 2.36: this student would need about 2.36 mock tests to reach 50%.</p>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640">
<line x1="60" y1="250" x2="560" y2="250" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60" y1="250" x2="60" y2="40" stroke="currentColor" stroke-opacity="0.6"/>
<line x1="60.0" y1="250" x2="60.0" y2="254" stroke="currentColor"/><text x="60.0" y="266" text-anchor="middle" class="tm" font-size="11">0</text>
<line x1="131.4" y1="250" x2="131.4" y2="254" stroke="currentColor"/><text x="131.4" y="266" text-anchor="middle" class="tm" font-size="11">1</text>
<line x1="202.9" y1="250" x2="202.9" y2="254" stroke="currentColor"/><text x="202.9" y="266" text-anchor="middle" class="tm" font-size="11">2</text>
<line x1="274.3" y1="250" x2="274.3" y2="254" stroke="currentColor"/><text x="274.3" y="266" text-anchor="middle" class="tm" font-size="11">3</text>
<line x1="345.7" y1="250" x2="345.7" y2="254" stroke="currentColor"/><text x="345.7" y="266" text-anchor="middle" class="tm" font-size="11">4</text>
<line x1="417.1" y1="250" x2="417.1" y2="254" stroke="currentColor"/><text x="417.1" y="266" text-anchor="middle" class="tm" font-size="11">5</text>
<line x1="488.6" y1="250" x2="488.6" y2="254" stroke="currentColor"/><text x="488.6" y="266" text-anchor="middle" class="tm" font-size="11">6</text>
<line x1="560.0" y1="250" x2="560.0" y2="254" stroke="currentColor"/><text x="560.0" y="266" text-anchor="middle" class="tm" font-size="11">7</text>
<line x1="56" y1="250.0" x2="60" y2="250.0" stroke="currentColor"/><text x="53" y="254.0" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="56" y1="202.3" x2="60" y2="202.3" stroke="currentColor"/><text x="53" y="206.3" text-anchor="end" class="tm" font-size="11">1</text>
<line x1="56" y1="154.5" x2="60" y2="154.5" stroke="currentColor"/><text x="53" y="158.5" text-anchor="end" class="tm" font-size="11">2</text>
<line x1="56" y1="106.8" x2="60" y2="106.8" stroke="currentColor"/><text x="53" y="110.8" text-anchor="end" class="tm" font-size="11">3</text>
<line x1="56" y1="59.1" x2="60" y2="59.1" stroke="currentColor"/><text x="53" y="63.1" text-anchor="end" class="tm" font-size="11">4</text>
<text x="310.0" y="282" text-anchor="middle" font-size="12">hours studied</text>
<text x="22" y="145.0" text-anchor="middle" font-size="12" transform="rotate(-90 22 145.0)">mock tests</text>
<path d="M120.7 55.4 L124.3 58.8 L127.9 62.1 L131.4 65.4 L135.0 68.7 L138.6 72.0 L142.1 75.3 L145.7 78.6 L149.3 81.9 L152.9 85.2 L156.4 88.5 L160.0 91.8 L163.6 95.1 L167.1 98.4 L170.7 101.7 L174.3 105.0 L177.9 108.3 L181.4 111.7 L185.0 115.0 L188.6 118.3 L192.1 121.6 L195.7 124.9 L199.3 128.2 L202.9 131.5 L206.4 134.8 L210.0 138.1 L213.6 141.4 L217.1 144.7 L220.7 148.0 L224.3 151.3 L227.9 154.6 L231.4 157.9 L235.0 161.2 L238.6 164.6 L242.1 167.9 L245.7 171.2 L249.3 174.5 L252.9 177.8 L256.4 181.1 L260.0 184.4 L263.6 187.7 L267.1 191.0 L270.7 194.3 L274.3 197.6 L277.9 200.9 L281.4 204.2 L285.0 207.5 L288.6 210.8 L292.1 214.1 L295.7 217.5 L299.3 220.8 L302.9 224.1 L306.4 227.4 L310.0 230.7 L313.6 234.0 L317.1 237.3 L320.7 240.6 L324.3 243.9 L327.9 247.2" fill="none" class="sr" stroke-width="1.4" stroke-dasharray="5 4"/>
<text x="106.7" y="47.4" font-size="11.5" class="tr">p = 0.2</text>
<path d="M185.0 54.6 L188.6 57.9 L192.1 61.2 L195.7 64.5 L199.3 67.8 L202.9 71.1 L206.4 74.4 L210.0 77.7 L213.6 81.0 L217.1 84.3 L220.7 87.6 L224.3 90.9 L227.9 94.2 L231.4 97.6 L235.0 100.9 L238.6 104.2 L242.1 107.5 L245.7 110.8 L249.3 114.1 L252.9 117.4 L256.4 120.7 L260.0 124.0 L263.6 127.3 L267.1 130.6 L270.7 133.9 L274.3 137.2 L277.9 140.5 L281.4 143.8 L285.0 147.1 L288.6 150.4 L292.1 153.8 L295.7 157.1 L299.3 160.4 L302.9 163.7 L306.4 167.0 L310.0 170.3 L313.6 173.6 L317.1 176.9 L320.7 180.2 L324.3 183.5 L327.9 186.8 L331.4 190.1 L335.0 193.4 L338.6 196.7 L342.1 200.0 L345.7 203.3 L349.3 206.7 L352.9 210.0 L356.4 213.3 L360.0 216.6 L363.6 219.9 L367.1 223.2 L370.7 226.5 L374.3 229.8 L377.9 233.1 L381.4 236.4 L385.0 239.7 L388.6 243.0 L392.1 246.3 L395.7 249.6" fill="none" class="sb" stroke-width="2.6" />
<text x="171.0" y="46.6" font-size="11.5" class="tb">p = 0.5</text>
<path d="M252.9 57.0 L256.4 60.3 L260.0 63.6 L263.6 66.9 L267.1 70.2 L270.7 73.5 L274.3 76.8 L277.9 80.1 L281.4 83.4 L285.0 86.8 L288.6 90.1 L292.1 93.4 L295.7 96.7 L299.3 100.0 L302.9 103.3 L306.4 106.6 L310.0 109.9 L313.6 113.2 L317.1 116.5 L320.7 119.8 L324.3 123.1 L327.9 126.4 L331.4 129.7 L335.0 133.0 L338.6 136.3 L342.1 139.7 L345.7 143.0 L349.3 146.3 L352.9 149.6 L356.4 152.9 L360.0 156.2 L363.6 159.5 L367.1 162.8 L370.7 166.1 L374.3 169.4 L377.9 172.7 L381.4 176.0 L385.0 179.3 L388.6 182.6 L392.1 185.9 L395.7 189.2 L399.3 192.6 L402.9 195.9 L406.4 199.2 L410.0 202.5 L413.6 205.8 L417.1 209.1 L420.7 212.4 L424.3 215.7 L427.9 219.0 L431.4 222.3 L435.0 225.6 L438.6 228.9 L442.1 232.2 L445.7 235.5 L449.3 238.8 L452.9 242.1 L456.4 245.4 L460.0 248.8" fill="none" class="sg" stroke-width="1.4" stroke-dasharray="5 4"/>
<text x="238.9" y="49.0" font-size="11.5" class="tg">p = 0.8</text>
<circle cx="131.4" cy="250.0" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="202.9" cy="202.3" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="274.3" cy="250.0" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="345.7" cy="202.3" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="202.9" cy="106.8" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="417.1" cy="154.5" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="488.6" cy="202.3" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="345.7" cy="106.8" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="417.1" cy="250.0" r="6.5" class="fg sg" stroke-width="1.6"/>
<circle cx="274.3" cy="106.8" r="6.5" class="fr sr" stroke-width="1.6"/>
<circle cx="274.3" cy="154.5" r="6.5" fill="none" stroke="currentColor" stroke-dasharray="2 2" stroke-width="1.6"/><text x="146.3" y="180.5" font-size="11" class="tm">new (3, 2): p = 0.40</text>
<text x="417.1" y="78.2" font-size="11.5" class="tm">green = passed, red = failed</text>
</svg><figcaption>The ten students. The solid blue line is the 50% boundary; the dashed lines are where p = 0.2 and p = 0.8. All three are parallel, because each is just z = constant. Two students sit on the "wrong" side: no straight line can separate this data perfectly (which is why the weights stay finite).</figcaption></figure>
  <h3>Moving the threshold moves the line, not its angle</h3>
  <p>If the business wants "pass" only when p ≥ 0.8, the rule becomes z ≥ logit(0.8) = ln 4 = 1.386. That is the parallel line b + w·x = 1.386, shifted toward the pass side. Changing the threshold never rotates the boundary; only the weights do. This is why threshold tuning and model fitting are separate jobs.</p>
  <h3>Curved boundaries need new features</h3>
  <p>The second part of the code uses two rings (one class inside the other). No straight line works: plain logistic regression scores 0.457, worse than guessing. Add the squared and product terms (x₁², x₁x₂, x₂²) and the model is still linear <em>in its weights</em>, but its boundary in the original (x₁, x₂) plane is now a curve: accuracy 1.000. The learnt weights are about −3.65 on x₁² and −3.55 on x₂², with the others near 0: z ≈ c − 3.6(x₁² + x₂²), which is a circle. This is the same trick as <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>, and the idea that kernels automate in <a class="xref" data-note="ml_svm">SVM</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>decision boundary</strong> of a binary classifier is the set {x : P(y = 1 | x) = t}. For logistic regression it is the hyperplane wᵀx + b = logit(t); with t = 0.5, wᵀx + b = 0. The signed distance of a point to it is (wᵀx + b)/‖w‖.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Logistic regression can only learn linear boundaries" is true only in the features you give it. With polynomial, spline or interaction features it learns curves, but then you must scale and regularise, since there are many more weights.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Odds Ratios.</b> We know where the switch is, but cannot yet explain a weight in words a teacher or manager understands.</div>

  <h2 id="lg-coef"><span class="num">08</span>Interpreting Coefficients: Odds Ratios</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We can see where the model switches, but a teacher asks a different question: "how much does one extra hour of study help?" How do we turn a weight like 1.518 into a sentence?</p>
  <h3>The need</h3>
  <p>A manager asks: "How much does one extra hour of study help?" Linear regression would say "+0.2 marks". For logistic regression, the honest answer has to choose a scale: log-odds, odds, or probability. Only one of them gives a single number.</p>
  <h3>Worked example by hand</h3>
  <p>Ten-student model: z = −7.14 + 1.518·hours + 1.096·tests. Fix tests = 1 and vary hours:</p>
  <div class="fx" data-lang="py">print(f"hours: w={w1:.3f}  odds ratio e^w = {np.exp(w1):.3f}")
for h in [3, 4, 5]:
    z = b2 + w1 * h + w2 * 1
    print(f"  hours={h}, tests=1: z={z:+.3f}  odds={np.exp(z):.3f}  p={sigmoid(z):.3f}")
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
Xb, yb = load_breast_cancer(return_X_y=True, as_frame=True)          # y=1 means benign
cols = ["mean radius", "mean texture", "worst concave points", "worst smoothness"]
Xtr, Xte, ytr, yte = train_test_split(Xb[cols], yb, test_size=0.25, stratify=yb, random_state=0)
clf = make_pipeline(StandardScaler(), LogisticRegression()).fit(Xtr, ytr)
lr = clf[-1]; sd = clf[0].scale_
print(pd.DataFrame({"coef per 1 SD": lr.coef_[0], "odds ratio per SD": np.exp(lr.coef_[0]),
                    "1 SD =": sd, "coef per 1 unit": lr.coef_[0] / sd}, index=cols).round(3))
print(f"intercept {lr.intercept_[0]:.3f} -&gt; P(benign) for an average tumour = {sigmoid(lr.intercept_[0]):.3f}")
p_te = clf.predict_proba(Xte)[:, 1]
print(f"average marginal effect of +1 SD radius on P(benign): {np.mean(p_te * (1 - p_te)) * lr.coef_[0][0]:.3f}")</div>
  <div class="fx" data-lang="text">hours: w=1.518  odds ratio e^w = 4.563
  hours=3, tests=1: z=-1.493  odds=0.225  p=0.183
  hours=4, tests=1: z=+0.025  odds=1.025  p=0.506
  hours=5, tests=1: z=+1.543  odds=4.676  p=0.824
                      coef per 1 SD  odds ratio per SD  1 SD =  coef per 1 unit
mean radius                  -3.034              0.048   3.609           -0.841
mean texture                 -1.167              0.311   4.370           -0.267
worst concave points         -2.451              0.086   0.067          -36.654
worst smoothness             -0.827              0.437   0.023          -36.330
intercept 1.142 -&gt; P(benign) for an average tumour = 0.758
average marginal effect of +1 SD radius on P(benign): -0.146</div>
  <table class="tbl"><caption>Same +1 hour, three scales (tests = 1)</caption>
    <tr><th>hours</th><th>z (log-odds)</th><th>odds = e^z</th><th>p</th></tr>
    <tr><td>3</td><td>−1.493</td><td>0.225</td><td>0.183</td></tr>
    <tr><td>4</td><td>+0.025 (+1.518)</td><td>1.025 (× 4.56)</td><td>0.506 (+0.32)</td></tr>
    <tr><td>5</td><td>+1.543 (+1.518)</td><td>4.676 (× 4.56)</td><td>0.824 (+0.32)</td></tr>
  </table>
  <ul>
    <li><strong>Log-odds</strong>: every extra hour adds exactly w = 1.518. Always the same.</li>
    <li><strong>Odds</strong>: every extra hour multiplies the odds by e^1.518 = <strong>4.56</strong>, the <strong>odds ratio</strong>. Always the same. Check: 0.225 × 4.56 = 1.03 ≈ 1.025.</li>
    <li><strong>Probability</strong>: depends on where you start. Here it is +0.32 both times only because 3 → 4 → 5 hours happens to straddle p = 0.5 symmetrically; from a student already at p = 0.98 it would be about +0.02.</li>
  </ul>
  <p>Why the odds ratio is constant: odds(x + 1) / odds(x) = e^(b + w(x + 1)) / e^(b + wx) = e^w. The approximate probability change for a small change is the slope: Δp ≈ p(1 − p)·w. At p = 0.5 that is 0.25 × 1.518 = 0.38 per hour; the "average marginal effect" averages p(1 − p)·w over all rows.</p>
  <h3>Scaled features and real data</h3>
  <p>On the breast-cancer data (target 1 = benign) the features have wildly different units: "mean radius" has a standard deviation of 3.6 mm, "worst smoothness" of 0.023. The raw per-unit coefficients (−0.84 vs −36.3) are not comparable: one unit of smoothness is a huge change. After <code>StandardScaler</code> each coefficient means "per one standard deviation", and they can be ranked: mean radius (−3.03, odds ratio 0.048) matters most. Reading: one SD larger radius multiplies the odds of benign by 0.048, i.e. the odds of malignant by 1/0.048 ≈ 21. The per-unit coefficient is just the per-SD one divided by the SD (−3.034 / 3.609 = −0.841).</p>
  <p>The <strong>intercept</strong> is the log-odds when every feature is 0. With standardised features, 0 means "average", so 1.142 → σ(1.142) = 0.758: an average tumour is benign with probability 0.76 (the data is 63% benign; the intercept is not exactly the base rate because of the nonlinearity).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Compound interest. A 5% interest rate always multiplies your balance by 1.05 (like the odds ratio), but the rupees added depend on your current balance (like the probability change). Saying "+1 hour adds 32 percentage points" is like saying "interest adds ₹500": true only for one starting balance.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For logistic regression, wⱼ is the change in log-odds for a one-unit increase in xⱼ, holding the other features fixed. <strong>Odds ratio</strong> ORⱼ = e^(wⱼ): OR &gt; 1 raises the odds, OR &lt; 1 lowers them, OR = 1 means no effect. The <strong>marginal effect</strong> on probability is ∂p/∂xⱼ = p(1 − p)wⱼ, which varies by row.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Three classic mistakes: (1) "w = 1.5 means +1.5 in probability" (no, in log-odds); (2) comparing raw coefficients of features in different units (scale first); (3) reading coefficients causally or ignoring "holding others fixed". With correlated features (radius and perimeter) the individual coefficients can even flip sign while predictions stay good. And regularised coefficients (sklearn's default C = 1) are shrunk toward 0, so for inference use statsmodels (section 13).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Multiclass.</b> Every formula so far assumes exactly two classes.</div>

  <h2 id="lg-multi"><span class="num">09</span>Multiclass: One-vs-Rest and Softmax</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Everything so far answers pass/fail. What if the school wants three grades (fail, pass, distinction), or a flower must be one of three species?</p>
  <h3>Two ways to extend</h3>
  <p><strong>One-vs-rest (OvR)</strong>: train K separate binary logistic regressions ("setosa vs not", "versicolor vs not", "virginica vs not"), each with its own sigmoid. Predict the class whose model is most confident. The K probabilities do not naturally add to 1, so they are divided by their sum.</p>
  <p><strong>Softmax (multinomial) regression</strong>: one model with K score functions zₖ = wₖ·x + bₖ, turned into K probabilities that add to 1 by the softmax function:</p>
  <p style="text-align:center"><strong>P(y = k | x) = e^(zₖ) / Σⱼ e^(zⱼ)</strong></p>
  <h3>Softmax by hand</h3>
  <p>Extend our exam story to three grades. For one student a 3-class model gives the scores z = [2.0, 1.0, 0.1] for distinction, pass, fail.</p>
  <table class="tbl">
    <tr><th>class</th><th>z</th><th>e^z</th><th>÷ sum (11.213)</th></tr>
    <tr><td>distinction</td><td>2.0</td><td>7.389</td><td>0.659</td></tr>
    <tr><td>pass</td><td>1.0</td><td>2.718</td><td>0.242</td></tr>
    <tr><td>fail</td><td>0.1</td><td>1.105</td><td>0.099</td></tr>
  </table>
  <p>Exponentiate (makes everything positive and stretches the gaps), then divide by the total (makes them add to 1). If the student actually got a plain pass, the <strong>cross-entropy</strong> loss is −ln(0.242) = 1.417: the same "−ln of the probability given to the truth" as binary log-loss. With one-hot targets Y, L = −(1/n) Σᵢ Σₖ Yᵢₖ ln Pᵢₖ, and its gradient for the class-k weights is again (1/n) Σᵢ (Pᵢₖ − Yᵢₖ)xᵢ: prediction minus target, times input.</p>
  <p>Two facts worth proving once:</p>
  <ul>
    <li><strong>Adding the same constant to every z changes nothing</strong> (it multiplies top and bottom by e^c). Code subtracts max(z) before exponentiating so e^1000 never overflows.</li>
    <li><strong>With K = 2, softmax is the sigmoid</strong>: e^(z₁)/(e^(z₁) + e^(z₀)) = 1/(1 + e^(−(z₁ − z₀))) = σ(z₁ − z₀). Only the difference of scores matters, which is why binary logistic regression needs one weight vector, not two.</li>
  </ul>
  <div class="fx" data-lang="py">z = np.array([2.0, 1.0, 0.1])                      # one student's scores for distinction, pass, fail
e = np.exp(z)
print("e^z =", e.round(3), " sum =", round(e.sum(), 3))
print("softmax =", (e / e.sum()).round(3))
print("cross-entropy if the truth is pass:", round(-np.log(e[1] / e.sum()), 3))
print("same after subtracting max(z):", (np.exp(z - z.max()) / np.exp(z - z.max()).sum()).round(3))
# two classes: softmax of [z1, z0] equals sigmoid(z1 - z0)
print("K=2 check:", round(np.exp(1.5) / (np.exp(1.5) + np.exp(0.3)), 4), round(sigmoid(1.5 - 0.3), 4))
from sklearn.datasets import load_iris
from sklearn.multiclass import OneVsRestClassifier
Xi, yi = load_iris(return_X_y=True)
soft = make_pipeline(StandardScaler(), LogisticRegression())                     # multinomial (softmax)
ovr = make_pipeline(StandardScaler(), OneVsRestClassifier(LogisticRegression())) # 3 separate sigmoids
for name, mdl in [("softmax", soft), ("one-vs-rest", ovr)]:
    acc = cross_val_score(mdl, Xi, yi, cv=5).mean()
    pr = mdl.fit(Xi, yi).predict_proba(Xi[[70]])[0]
    print(f"{name:12s} CV acc {acc:.3f}  P(flower 70) = {pr.round(3)}  sum={pr.sum():.3f}")
print("softmax coef_ shape:", soft[-1].coef_.shape, " intercept_:", soft[-1].intercept_.round(2))
raw = ovr[-1].estimators_
s70 = soft[0].transform(Xi[[70]])
pk = np.array([e.predict_proba(s70)[0, 1] for e in raw])
print("OvR raw sigmoids:", pk.round(3), " sum", round(pk.sum(), 3), "-&gt; divided by sum:", (pk / pk.sum()).round(3))</div>
  <div class="fx" data-lang="text">e^z = [7.389 2.718 1.105]  sum = 11.213
softmax = [0.659 0.242 0.099]
cross-entropy if the truth is pass: 1.417
same after subtracting max(z): [0.659 0.242 0.099]
K=2 check: 0.7685 0.7685
softmax      CV acc 0.960  P(flower 70) = [0.012 0.44  0.548]  sum=1.000
one-vs-rest  CV acc 0.927  P(flower 70) = [0.017 0.248 0.735]  sum=1.000
softmax coef_ shape: (3, 4)  intercept_: [-0.2   2.07 -1.87]
OvR raw sigmoids: [0.011 0.168 0.498]  sum 0.677 -&gt; divided by sum: [0.017 0.248 0.735]</div>
  <p>Line one to five confirm the hand table and the two facts. On iris, softmax scores 0.960 and OvR 0.927 in 5-fold CV. For flower 70 (a hard versicolor that looks like virginica) the two disagree: softmax says 0.44 / 0.548, OvR says 0.248 / 0.735. The last line shows how OvR got its numbers: three independent sigmoids gave 0.011, 0.168, 0.498 (sum 0.677, not 1), and sklearn divided them by 0.677. <code>coef_</code> has shape (3, 4): one weight vector per class.</p>
  <table class="tbl">
    <tr><th></th><th>One-vs-rest</th><th>Softmax (multinomial)</th></tr>
    <tr><td>Models</td><td>K independent binary fits</td><td>One joint fit</td></tr>
    <tr><td>Probabilities</td><td>Normalised after the fact</td><td>Sum to 1 by construction; better calibrated</td></tr>
    <tr><td>Loss</td><td>Sum of K binary log-losses</td><td>Multiclass cross-entropy</td></tr>
    <tr><td>sklearn</td><td><code>OneVsRestClassifier(LogisticRegression())</code></td><td><code>LogisticRegression()</code> (default for K ≥ 3; the old <code>multi_class</code> parameter is gone)</td></tr>
    <tr><td>When</td><td>Classes not mutually exclusive (multilabel); parallel training</td><td>Exactly one class per row: the usual case</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Multinomial logistic (softmax) regression</strong>: P(y = k | x) = exp(wₖᵀx + bₖ) / Σⱼ exp(wⱼᵀx + bⱼ), trained by minimising cross-entropy −(1/n) Σᵢ ln P(yᵢ | xᵢ). The parameters are identifiable only up to a common shift; a penalty or fixing one class to zero removes the ambiguity.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>For <strong>multilabel</strong> problems (an article can be both "sports" and "business") do not use softmax: it forces the probabilities to compete. Use K independent sigmoids (OvR / <code>MultiOutputClassifier</code>). Also, <code>liblinear</code> cannot do multinomial; in sklearn 1.9 it raises an error for K ≥ 3.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Regularization and C.</b> Plain likelihood lets weights grow without limit on separable or high-dimensional data, so the model overfits or never converges.</div>

  <h2 id="lg-reg"><span class="num">10</span>Regularization and C</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Our weights are found by pure likelihood. What stops them from becoming huge when there are many features, or infinite when the classes can be separated perfectly?</p>
  <h3>The need</h3>
  <p>Two things go wrong without a penalty. First, with many features (30 tumour measurements, 10,000 words) the model fits noise: big weights that carve the training data perfectly and generalise badly (<a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>). Second, and special to logistic regression: if the training classes can be separated perfectly by a line, the log-loss keeps falling as the weights grow. Each doubling of w pushes every p closer to exactly 0 or 1, so the "best" weights are infinite.</p>
  <h3>The penalised objective (sklearn's exact form)</h3>
  <p style="text-align:center"><strong>J(w, b) = ½‖w‖² + C · Σᵢ ℓᵢ(w, b)</strong> &nbsp;&nbsp; (L2, the default) &nbsp;&nbsp;&nbsp; or &nbsp;&nbsp; ‖w‖₁ + C · Σᵢ ℓᵢ &nbsp; (L1)</p>
  <p>C multiplies the <em>data</em> term, so <strong>C is the inverse of the penalty strength</strong>: C = 1/λ. Small C = the penalty dominates = small weights (high bias). Large C = the data dominates. C = ∞ = no penalty. The intercept b is not penalised. Note the sum over rows: with the same C, more data means relatively less penalty. (The general theory of L1 and L2 penalties is in <a class="xref" data-note="ml_regularization">Regularization</a>.)</p>
  <h3>Worked example: what the penalty does to the six students</h3>
  <p>At the best point the gradient of J is zero: w + C·Σ(pᵢ − yᵢ)xᵢ = 0, i.e. <strong>w = −C · Σ(pᵢ − yᵢ)xᵢ</strong>. Without a penalty the data gradient must be exactly 0 (w = 1.214). With C = 1 the data gradient only needs to <em>balance</em> the pull of the penalty. sklearn finds w = 0.767, b = −2.685; check by hand:</p>
  <table class="tbl">
    <tr><th>x</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><th>sum</th></tr>
    <tr><th>p = σ(0.767x − 2.685)</th><td>0.128</td><td>0.240</td><td>0.405</td><td>0.595</td><td>0.760</td><td>0.872</td><td></td></tr>
    <tr><th>y</th><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td></td></tr>
    <tr><th>(p − y)·x</th><td>0.128</td><td>0.480</td><td>−1.785</td><td>2.380</td><td>−1.200</td><td>−0.768</td><td><strong>−0.765</strong></td></tr>
  </table>
  <p>−C × (−0.765) = 0.765 ≈ w = 0.767 (the gap is rounding). The model is deliberately left a bit "under-confident": the data still wants w larger, but the penalty pays for stopping here.</p>
  <div class="fx" data-lang="py">import warnings
from sklearn.exceptions import ConvergenceWarning
warnings.filterwarnings("ignore", category=ConvergenceWarning)
print("6 students, w for different C (C = 1/lambda):")
for C in [0.01, 0.1, 1, 10, np.inf]:
    mm = LogisticRegression(C=C).fit(hours[:, None], passed)
    print(f"  C={C:&lt;5} w={mm.coef_[0, 0]:.3f}  b={mm.intercept_[0]:+.3f}")
xs = np.array([1, 2, 3, 4, 5, 6.]); ys = np.array([0, 0, 0, 1, 1, 1])   # perfectly separable
print("separable data, w as C grows:", [round(float(LogisticRegression(C=C, max_iter=1000).fit(xs[:, None], ys).coef_[0, 0]), 1)
                                        for C in [1, 10, 100, 1e4, np.inf]])
Xa_tr, Xa_te, ya_tr, ya_te = train_test_split(Xb, yb, test_size=0.25, stratify=yb, random_state=0)  # all 30 columns
print("breast cancer, 30 features:")
for l1 in [0, 1]:
    for C in [0.01, 0.1, 1, 100]:
        mdl = make_pipeline(StandardScaler(), LogisticRegression(C=C, l1_ratio=l1, solver="saga" if l1 else "lbfgs", random_state=0,
                                                                 max_iter=5000)).fit(Xa_tr, ya_tr)
        print(f"  {'L1' if l1 else 'L2'} C={C:&lt;5} nonzero={np.sum(mdl[-1].coef_ != 0):2d}  "
              f"max|w|={np.abs(mdl[-1].coef_).max():6.2f}  train {mdl.score(Xa_tr, ya_tr):.3f}  test {mdl.score(Xa_te, ya_te):.3f}")
from sklearn.linear_model import LogisticRegressionCV
cvm = make_pipeline(StandardScaler(), LogisticRegressionCV(Cs=10, cv=5, l1_ratios=(0,), scoring="neg_log_loss",
                                                           use_legacy_attributes=False)).fit(Xa_tr, ya_tr)
from sklearn.metrics import accuracy_score
print(f"LogisticRegressionCV picked C = {cvm[-1].C_:.4f}  test acc {accuracy_score(ya_te, cvm.predict(Xa_te)):.3f}")</div>
  <div class="fx" data-lang="text">6 students, w for different C (C = 1/lambda):
  C=0.01  w=0.034  b=-0.117
  C=0.1   w=0.245  b=-0.859
  C=1     w=0.767  b=-2.685
  C=10    w=1.126  b=-3.940
  C=inf   w=1.214  b=-4.249
separable data, w as C grows: [1.1, 2.7, 5.7, 13.0, 15.2]
breast cancer, 30 features:
  L2 C=0.01  nonzero=30  max|w|=  0.24  train 0.953  test 0.951
  L2 C=0.1   nonzero=30  max|w|=  0.56  train 0.988  test 0.958
  L2 C=1     nonzero=30  max|w|=  1.21  train 0.991  test 0.958
  L2 C=100   nonzero=30  max|w|= 13.90  train 0.998  test 0.951
  L1 C=0.01  nonzero= 3  max|w|=  0.52  train 0.869  test 0.867
  L1 C=0.1   nonzero= 6  max|w|=  1.91  train 0.979  test 0.937
  L1 C=1     nonzero=13  max|w|=  3.53  train 0.988  test 0.958
  L1 C=100   nonzero=30  max|w|=  8.97  train 0.991  test 0.951
LogisticRegressionCV picked C = 0.3594  test acc 0.965</div>
  <p>Read the output top to bottom:</p>
  <ul>
    <li><strong>Shrinkage</strong>: as C falls from ∞ to 0.01, w shrinks 1.214 → 1.126 → 0.767 → 0.245 → 0.034. At C = 0.01 the model hardly uses hours at all.</li>
    <li><strong>Separation</strong>: on data where x ≤ 3 always fails and x ≥ 4 always passes, w grows without limit as C grows (1.1, 2.7, 5.7, 13.0, 15.2). At C = ∞ the solver only stops because the remaining improvement is below its tolerance; the true optimum is infinite. A penalty is what keeps the answer finite.</li>
    <li><strong>L2 on 30 features</strong>: all 30 weights stay non-zero at every C; only their size changes (max |w| 0.24 at C = 0.01 up to 13.9 at C = 100). Training accuracy rises with C (0.953 → 0.998) while test accuracy peaks at 0.958 and then falls back to 0.951: the bias-variance trade-off in one table.</li>
    <li><strong>L1</strong> (<code>l1_ratio=1</code>, solver saga) sets weights exactly to zero: 3 features survive at C = 0.01, 6 at C = 0.1, 13 at C = 1. That is built-in feature selection. Small C with L1 can over-shrink (0.867 test).</li>
    <li><strong>LogisticRegressionCV</strong> tries 10 values of C on a log grid with 5-fold CV (scored by log-loss here) and refits with the best: C = 0.36, test accuracy 0.965.</li>
  </ul>
  <table class="tbl">
    <tr><th>Penalty</th><th>sklearn setting</th><th>Effect</th><th>Solvers</th></tr>
    <tr><td>None</td><td><code>C=np.inf</code></td><td>Plain maximum likelihood; infinite weights on separable data</td><td>all except liblinear</td></tr>
    <tr><td>L2 (ridge)</td><td><code>l1_ratio=0</code> (default)</td><td>Shrinks all weights smoothly; handles correlated features by sharing</td><td>all</td></tr>
    <tr><td>L1 (lasso)</td><td><code>l1_ratio=1</code></td><td>Exact zeros: sparse model, feature selection; picks one of correlated features</td><td>liblinear, saga</td></tr>
    <tr><td>Elastic net</td><td><code>0 &lt; l1_ratio &lt; 1</code></td><td>Mix: some zeros, but correlated features kept together</td><td>saga</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>C is how much you trust the training data. A teacher with low C says "don't over-react to one test; stay close to average". A teacher with huge C changes the whole grading scheme because of one student's answer sheet.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Regularised logistic regression</strong> (sklearn form): minimise r(w) + C Σᵢ ℓ(yᵢ, σ(wᵀxᵢ + b)), with r(w) = ½‖w‖₂² (L2), ‖w‖₁ (L1), or (1 − ρ)·½‖w‖₂² + ρ‖w‖₁ (elastic net, ρ = <code>l1_ratio</code>). Equivalently, mean log-loss + (λ/2)‖w‖² with λ = 1/(nC). In Bayesian terms, L2 is a Gaussian prior on w and L1 a Laplace prior (MAP estimate).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn regularises <em>by default</em> (C = 1). Coefficients from <code>LogisticRegression()</code> are therefore shrunk and do not match textbook or statsmodels values; that surprises many people. Also, the penalty treats all weights alike, so unscaled features are penalised unfairly: a feature measured in rupees (tiny weight) is barely penalised, one in lakhs (big weight) heavily. Always scale before a penalised model.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Class Imbalance.</b> The penalty controls weight size, but a rare class can still be ignored by an average loss.</div>

  <h2 id="lg-imb"><span class="num">11</span>Class Imbalance</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> Regularization keeps the weights sensible. But if only 5% of students fail, a model can ignore them and still be 95% accurate. How do we make a rare class count?</p>
  <h3>The need</h3>
  <p>Scale our exam story up: a school wants an early-warning system for the roughly 5% of students who will fail the board exam (the same shape as fraud, default or disease: the class you care about is 1–5% of the rows). Below we simulate 4,000 such students with six features; class 1 = "will fail". Log-loss is an average over rows, so 95 easy negatives outvote 5 positives. The model learns a large negative intercept, most probabilities stay below 0.5, and at the 0.5 threshold it rarely predicts the rare class. Accuracy looks great (95% by always saying "no") while recall is poor (<a class="xref" data-note="ml_evaluation">Classification Metrics</a>).</p>
  <h3>class_weight by hand</h3>
  <p><code>class_weight="balanced"</code> gives each row of class k the weight wₖ = n / (K · nₖ), and the loss becomes Σᵢ w_{yᵢ} ℓᵢ. With 3,000 training rows, 2,838 negatives and 162 positives (K = 2):</p>
  <ul>
    <li>w₀ = 3000 / (2 × 2838) = <strong>0.529</strong></li>
    <li>w₁ = 3000 / (2 × 162) = <strong>9.259</strong></li>
    <li>Total weight per class: 2838 × 0.529 = 1500 and 162 × 9.259 = 1500. Each class now "counts" equally.</li>
  </ul>
  <p>The ratio 9.259 / 0.529 = 17.5 acts like copying every positive 17.5 times. For logistic regression, re-weighting mainly moves the intercept by about ln(17.5) = 2.86, which is exactly the same as lowering the threshold. The slopes change a little too, because the weighting also changes which rows the fit cares about.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_classification
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.utils.class_weight import compute_class_weight
Xm, ym = make_classification(n_samples=4000, n_features=6, n_informative=3, weights=[0.95],
                             class_sep=0.8, flip_y=0.01, random_state=1)
Xm_tr, Xm_te, ym_tr, ym_te = train_test_split(Xm, ym, test_size=0.25, stratify=ym, random_state=0)
cw = compute_class_weight("balanced", classes=np.array([0, 1]), y=ym_tr)
print("train counts:", np.bincount(ym_tr), " balanced weights n/(2*n_c):", cw.round(3))
def report(name, p, thr=0.5):
    pred = (p &gt;= thr).astype(int)
    print(f"{name:24s} precision {precision_score(ym_te, pred):.3f}  recall {recall_score(ym_te, pred):.3f}  "
          f"F1 {f1_score(ym_te, pred):.3f}  mean p {p.mean():.3f}")
plain = make_pipeline(StandardScaler(), LogisticRegression()).fit(Xm_tr, ym_tr)
bal = make_pipeline(StandardScaler(), LogisticRegression(class_weight="balanced")).fit(Xm_tr, ym_tr)
p_plain, p_bal = plain.predict_proba(Xm_te)[:, 1], bal.predict_proba(Xm_te)[:, 1]
report("plain, threshold 0.5", p_plain)
report("balanced, threshold 0.5", p_bal)
report("plain, threshold 0.10", p_plain, 0.10)
print(f"intercepts: plain {plain[-1].intercept_[0]:.3f}  balanced {bal[-1].intercept_[0]:.3f}  "
      f"difference {bal[-1].intercept_[0] - plain[-1].intercept_[0]:.3f}  ln(w1/w0) = {np.log(cw[1] / cw[0]):.3f}")
print(f"slopes: plain {plain[-1].coef_[0].round(2)}\\n        balanced {bal[-1].coef_[0].round(2)}")
print(f"true positive rate in test: {ym_te.mean():.3f}")</div>
  <div class="fx" data-lang="text">train counts: [2838  162]  balanced weights n/(2*n_c): [0.529 9.259]
plain, threshold 0.5     precision 0.882  recall 0.278  F1 0.423  mean p 0.056
balanced, threshold 0.5  precision 0.163  recall 0.741  F1 0.267  mean p 0.345
plain, threshold 0.10    precision 0.246  recall 0.630  F1 0.354  mean p 0.056
intercepts: plain -3.886  balanced -0.801  difference 3.085  ln(w1/w0) = 2.863
slopes: plain [ 0.08  0.03  0.7  -0.88  0.26  0.5 ]
        balanced [-0.01  0.04  0.5  -0.72  0.29  0.39]
true positive rate in test: 0.054</div>
  <p>The plain model finds only 27.8% of positives at 0.5 (but is right 88% of the time when it flags one). Balanced weights find 74.1% at the cost of precision 0.163. The intercept moved by 3.085, close to the predicted ln(w₁/w₀) = 2.863. Note the mean predicted p: 0.056 for the plain model (matching the true rate 0.054) vs 0.345 for the balanced one. <strong>Class weights break calibration</strong>: the balanced model's probabilities are no longer real probabilities. The third line keeps the plain, calibrated model and simply lowers the threshold to 0.10: recall 0.630 with better precision (0.246) than the balanced model.</p>
  <table class="tbl">
    <tr><th>Fix</th><th>What it changes</th><th>Keeps probabilities honest?</th><th>When</th></tr>
    <tr><td>Lower the threshold</td><td>Decision only</td><td>Yes</td><td>First choice when you need P(y = 1) (pricing, risk)</td></tr>
    <tr><td><code>class_weight</code></td><td>Loss weights (mostly the intercept)</td><td>No (inflated)</td><td>When only rankings/labels matter; quick fix</td></tr>
    <tr><td>Resampling (under/over, SMOTE)</td><td>Training data</td><td>No</td><td>See <a class="xref" data-note="ml_features">Feature Engineering</a>; apply inside CV only</td></tr>
    <tr><td>Better metric</td><td>How you judge</td><td>–</td><td>Always: PR-AUC, recall at fixed precision, log-loss</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Weighted log-loss</strong>: L = −Σᵢ s_{yᵢ}[yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)] / Σᵢ s_{yᵢ}. With "balanced", s_k = n / (K nₖ). For a well-specified logistic model, weighting class 1 by s₁/s₀ shifts the intercept by about ln(s₁/s₀) and leaves the slopes nearly unchanged ("prior correction").</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not use <code>class_weight="balanced"</code> and then report <code>predict_proba</code> as a risk. Either recalibrate (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>) or keep the unweighted model and move the threshold. And never judge an imbalanced model by accuracy.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sklearn in Practice.</b> We know the ideas; we have not mapped them onto sklearn's parameters and solvers.</div>

  <h2 id="lg-sklearn"><span class="num">12</span>scikit-learn LogisticRegression in Practice</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We understand every ingredient. Which sklearn settings implement them, which solver should run the minimisation, and why does it sometimes print a ConvergenceWarning?</p>
  <h3>The parameters that matter</h3>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Meaning</th><th>Advice</th></tr>
    <tr><td><code>C</code></td><td>1.0</td><td>Inverse penalty strength; <code>np.inf</code> = no penalty</td><td>Tune on a log grid (0.001 … 100) or use <code>LogisticRegressionCV</code></td></tr>
    <tr><td><code>l1_ratio</code></td><td>0.0</td><td>0 = L2, 1 = L1, between = elastic net</td><td>Replaces <code>penalty=</code>, deprecated in 1.8 and removed in 1.10</td></tr>
    <tr><td><code>solver</code></td><td>"lbfgs"</td><td>Optimisation algorithm (table below)</td><td>lbfgs for most; saga for L1/elastic net on big data</td></tr>
    <tr><td><code>max_iter</code></td><td>100</td><td>Iteration cap</td><td>A <code>ConvergenceWarning</code> usually means "scale your features", not "raise max_iter"</td></tr>
    <tr><td><code>tol</code></td><td>1e-4</td><td>Stopping tolerance</td><td>Lower it only when matching another implementation</td></tr>
    <tr><td><code>class_weight</code></td><td>None</td><td>"balanced" or a dict {class: weight}</td><td>Section 11</td></tr>
    <tr><td><code>fit_intercept</code></td><td>True</td><td>Learn b</td><td>Keep True</td></tr>
    <tr><td><code>intercept_scaling</code></td><td>1</td><td>liblinear only: it penalises b, this reduces the effect</td><td>Another reason liblinear differs slightly</td></tr>
    <tr><td><code>warm_start</code></td><td>False</td><td>Start from the previous solution</td><td>Speeds up a path over many C values</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>Shuffling for sag, saga, liblinear</td><td>Set it for reproducible results</td></tr>
  </table>
  <h3>Solvers</h3>
  <table class="tbl">
    <tr><th>Solver</th><th>Method</th><th>Penalties</th><th>Multinomial</th><th>Good for</th></tr>
    <tr><td>lbfgs</td><td>Quasi-Newton</td><td>L2, none</td><td>yes</td><td>Default; small to medium dense data</td></tr>
    <tr><td>newton-cholesky</td><td>Exact Newton (full Hessian)</td><td>L2, none</td><td>yes</td><td>n ≫ d, e.g. one-hot features; very few iterations</td></tr>
    <tr><td>newton-cg</td><td>Newton with conjugate gradient</td><td>L2, none</td><td>yes</td><td>Medium data, many features</td></tr>
    <tr><td>liblinear</td><td>Coordinate descent (C++ library)</td><td>L1, L2</td><td>no (binary only)</td><td>Small data, L1; penalises the intercept</td></tr>
    <tr><td>sag</td><td>Stochastic average gradient</td><td>L2, none</td><td>yes</td><td>Large n, scaled features</td></tr>
    <tr><td>saga</td><td>SAG with proximal step</td><td>L1, L2, elastic net, none</td><td>yes</td><td>Large n, sparse models</td></tr>
  </table>
  <p>The code fits every solver on the 30 breast-cancer features, unscaled and scaled, and reports iterations and convergence warnings. Then it shows how <code>decision_function</code>, <code>predict_proba</code> and <code>predict</code> relate.</p>
  <div class="fx" data-lang="py">import time
Xs_tr = StandardScaler().fit_transform(Xa_tr)
print("solver           unscaled: iters warn | scaled: iters warn | train acc")
coefs = {}
for solver in ["lbfgs", "liblinear", "newton-cg", "newton-cholesky", "sag", "saga"]:
    row = []
    for data in [Xa_tr.values, Xs_tr]:
        with warnings.catch_warnings(record=True) as wl:
            warnings.simplefilter("always")
            mdl = LogisticRegression(solver=solver, random_state=0).fit(data, ya_tr)
        warned = any(issubclass(w_.category, ConvergenceWarning) for w_ in wl)
        row.append((int(np.max(mdl.n_iter_)), "yes" if warned else "no"))
    coefs[solver] = mdl.coef_[0]
    print(f"{solver:16s} {row[0][0]:5d}  {row[0][1]:3s}      | {row[1][0]:5d}  {row[1][1]:3s}      | {mdl.score(Xs_tr, ya_tr):.3f}")
ref = coefs["lbfgs"]
print("max |coef - lbfgs coef| on scaled data:", {k: float(f"{np.abs(v - ref).max():.0e}") for k, v in coefs.items() if k != "lbfgs"})
m_s = LogisticRegression().fit(Xs_tr, ya_tr)
z5 = m_s.decision_function(Xs_tr[:3]); p5 = m_s.predict_proba(Xs_tr[:3])[:, 1]
print("decision_function (z):", z5.round(3))
print("sigmoid(z)           :", sigmoid(z5).round(3))
print("predict_proba[:, 1]  :", p5.round(3))
print("predict              :", m_s.predict(Xs_tr[:3]), " = (z &gt; 0):", (z5 &gt; 0).astype(int))</div>
  <div class="fx" data-lang="text">solver           unscaled: iters warn | scaled: iters warn | train acc
lbfgs              100  yes      |    18  no       | 0.991
liblinear           19  no       |     8  no       | 0.991
newton-cg           50  no       |     8  no       | 0.991
newton-cholesky      9  no       |     7  no       | 0.991
sag                100  yes      |   100  yes      | 0.991
saga               100  yes      |   100  yes      | 0.988
max |coef - lbfgs coef| on scaled data: {'liblinear': 0.03, 'newton-cg': 0.008, 'newton-cholesky': 0.01, 'sag': 0.2, 'saga': 0.3}
decision_function (z): [ 6.266 -6.376  9.49 ]
sigmoid(z)           : [0.998 0.002 1.   ]
predict_proba[:, 1]  : [0.998 0.002 1.   ]
predict              : [1 0 1]  = (z &gt; 0): [1 0 1]</div>
  <ul>
    <li><strong>Unscaled data</strong> (areas in the thousands next to smoothness around 0.1): lbfgs, sag and saga hit the 100-iteration cap with a warning. After scaling, lbfgs converges in 18 iterations and the Newton solvers in 7–8. sag/saga still need more than 100 passes here; they shine on large n, not on 426 rows.</li>
    <li><strong>Same answer</strong>: on scaled data the solvers agree to about 0.01 (the tolerance), except sag/saga which stopped early and liblinear which also penalises the intercept.</li>
    <li><strong>Three outputs</strong>: <code>decision_function</code> returns the score z; <code>predict_proba[:, 1]</code> is σ(z) (identical numbers); <code>predict</code> is z &gt; 0, i.e. threshold 0.5. To use another threshold, take <code>predict_proba</code> and compare yourself, or use <code>TunedThresholdClassifierCV</code>.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>Fitted attributes: <code>coef_</code> (shape (1, d) for binary, (K, d) for multiclass), <code>intercept_</code>, <code>classes_</code> (column order of <code>predict_proba</code>), <code>n_iter_</code>. Typical pipeline: <code>make_pipeline(StandardScaler(), LogisticRegression(C=...))</code> so the scaler is fit inside each CV fold (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Old tutorials write <code>LogisticRegression(penalty='none', multi_class='ovr')</code>. In sklearn 1.9 <code>multi_class</code> no longer exists, <code>penalty</code> is deprecated (use <code>C=np.inf</code> and <code>l1_ratio</code>), and the string 'none' was removed long ago. Use <code>OneVsRestClassifier</code> for OvR.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: statsmodels Logit.</b> sklearn predicts well, but gives no standard errors, p-values or confidence intervals for the weights.</div>

  <h2 id="lg-sm"><span class="num">13</span>statsmodels Logit: the Statistician's View</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> sklearn tells us how well the model predicts. It cannot tell us whether the effect of sleep is real or noise, or how sure we are about an odds ratio. Where do standard errors and p-values come from?</p>
  <h3>The need</h3>
  <p>sklearn answers "how well does it predict?". A doctor or an economist also asks: "is the effect of sleep real or noise? How sure are we about the odds ratio?" That needs standard errors, p-values and confidence intervals, which <code>statsmodels</code> provides (unpenalised maximum likelihood, fitted by Newton/IRLS).</p>
  <p>Simulated data so we know the truth: 400 students, true log-odds −6 + 0.8·hours + 0.5·sleep + 0·phone. Phone time truly has no effect.</p>
  <div class="fx" data-lang="py">import statsmodels.api as sm
rng = np.random.default_rng(42)
n = 400
df = pd.DataFrame({"hours": rng.uniform(0, 10, n).round(1),          # hours studied
                   "sleep": rng.uniform(4, 9, n).round(1),           # hours slept the night before
                   "phone": rng.uniform(0, 5, n).round(1)})          # hours on phone (true effect 0)
true_z = -6 + 0.8 * df.hours + 0.5 * df.sleep + 0.0 * df.phone
df["passed"] = (rng.random(n) &lt; sigmoid(true_z)).astype(int)
res = sm.Logit(df.passed, sm.add_constant(df[["hours", "sleep", "phone"]])).fit(disp=0)
print(res.summary().tables[1])
print(f"n={int(res.nobs)}  logLik={res.llf:.2f}  LL-Null={res.llnull:.2f}  pseudo R2={res.prsquared:.3f}  "
      f"LLR p={res.llr_pvalue:.2e}  AIC={res.aic:.1f}")
ci = res.conf_int()
print(pd.DataFrame({"odds ratio": np.exp(res.params), "2.5%": np.exp(ci[0]), "97.5%": np.exp(ci[1])}).round(3))
sk = LogisticRegression(C=np.inf).fit(df[["hours", "sleep", "phone"]], df.passed)
print("sklearn C=inf:", np.r_[sk.intercept_, sk.coef_[0]].round(4))
print("statsmodels  :", res.params.values.round(4))
se_h = res.bse["hours"]
print(f"by hand: z = {res.params['hours']:.4f} / {se_h:.4f} = {res.params['hours'] / se_h:.2f};  "
      f"CI = {res.params['hours']:.3f} +/- 1.96 * {se_h:.3f} = [{res.params['hours'] - 1.96 * se_h:.3f}, {res.params['hours'] + 1.96 * se_h:.3f}]")</div>
  <div class="fx" data-lang="text">==============================================================================
                 coef    std err          z      P&gt;|z|      [0.025      0.975]
------------------------------------------------------------------------------
const         -4.8110      0.817     -5.886      0.000      -6.413      -3.209
hours          0.7335      0.073     10.099      0.000       0.591       0.876
sleep          0.3409      0.098      3.486      0.000       0.149       0.533
phone          0.1043      0.100      1.048      0.295      -0.091       0.299
==============================================================================
n=400  logLik=-152.84  LL-Null=-254.37  pseudo R2=0.399  LLR p=9.19e-44  AIC=313.7
       odds ratio   2.5%  97.5%
const       0.008  0.002  0.040
hours       2.082  1.806  2.401
sleep       1.406  1.161  1.703
phone       1.110  0.913  1.349
sklearn C=inf: [-4.8103  0.7334  0.3408  0.1042]
statsmodels  : [-4.811   0.7335  0.3409  0.1043]
by hand: z = 0.7335 / 0.0726 = 10.10;  CI = 0.734 +/- 1.96 * 0.073 = [0.591, 0.876]</div>
  <h3>The table, line by line</h3>
  <table class="tbl">
    <tr><th>Column</th><th>Meaning</th><th>hours row, by hand</th></tr>
    <tr><td><strong>coef</strong></td><td>Maximum-likelihood weight: change in log-odds per unit</td><td>0.7335 (truth 0.8)</td></tr>
    <tr><td><strong>std err</strong></td><td>How much the coef would wobble across new samples; square root of the diagonal of the inverse Hessian (the "Fisher information")</td><td>0.073</td></tr>
    <tr><td><strong>z</strong></td><td>coef / std err: how many standard errors away from 0 (a Wald test; logistic uses z, not t)</td><td>0.7335 / 0.0726 = 10.10</td></tr>
    <tr><td><strong>P&gt;|z|</strong></td><td>Chance of a |z| this large if the true coef were 0</td><td>0.000 (tiny): real effect</td></tr>
    <tr><td><strong>[0.025, 0.975]</strong></td><td>95% confidence interval: coef ± 1.96 × std err</td><td>0.734 ± 1.96 × 0.073 = [0.591, 0.876]</td></tr>
  </table>
  <ul>
    <li><strong>phone</strong>: coef 0.104, std err 0.100, z = 1.05, p = 0.295, CI [−0.091, 0.299] contains 0. We cannot tell its effect from zero, which is right: the true effect is 0.</li>
    <li><strong>sleep</strong>: z = 3.49, p &lt; 0.001; CI [0.149, 0.533] contains the truth 0.5.</li>
    <li><strong>Odds ratios with CI</strong>: exponentiate the coef and both CI ends. Each extra hour of study multiplies the odds of passing by 2.08 (95% CI 1.81–2.40). The phone CI 0.91–1.35 includes 1 ("no effect").</li>
  </ul>
  <h3>The model-level numbers</h3>
  <table class="tbl">
    <tr><th>Number</th><th>Meaning</th><th>Here</th></tr>
    <tr><td>Log-Likelihood</td><td>Σ ln P(yᵢ | xᵢ) at the fitted weights (= −n × log-loss)</td><td>−152.84 (log-loss 0.382)</td></tr>
    <tr><td>LL-Null</td><td>Log-likelihood of an intercept-only model (always predict the base rate)</td><td>−254.37</td></tr>
    <tr><td>Pseudo R² (McFadden)</td><td>1 − LL / LL-Null: share of "surprise" removed; 0.2–0.4 is already a good fit</td><td>1 − 152.84/254.37 = 0.399</td></tr>
    <tr><td>LLR p-value</td><td>Likelihood-ratio test: 2(LL − LL-Null) = 203.1 vs χ² with 3 df. "Are all slopes 0?"</td><td>9.2 × 10⁻⁴⁴</td></tr>
    <tr><td>AIC</td><td>2k − 2LL (k = 4 parameters); lower is better when comparing models</td><td>8 + 305.7 = 313.7</td></tr>
  </table>
  <p>The last two lines show sklearn with <code>C=np.inf</code> gives the same weights (to the 4th decimal; the difference is the stopping tolerance). With the default C = 1 they would be shrunk.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For the MLE ŵ, the estimated covariance is (XᵀŜX)⁻¹ with Ŝ = diag(p̂ᵢ(1 − p̂ᵢ)); std errors are the square roots of its diagonal. The <strong>Wald z</strong> = ŵⱼ / se(ŵⱼ) is approximately standard normal under H₀: wⱼ = 0. The formula API <code>smf.logit("passed ~ hours + sleep + C(group)", data=df)</code> builds dummies automatically.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>p-values from a penalised sklearn model do not exist (and naive ones would be wrong). For inference use unpenalised statsmodels on data with more rows than features, no perfect separation (it raises a PerfectSeparation warning/error and the std errors blow up), and features that are not nearly collinear (<a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> explains VIF).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From Scratch.</b> We have trusted libraries for every number. Rebuilding the model proves we understand each step.</div>

  <h2 id="lg-scratch"><span class="num">14</span>From Scratch, Matched to sklearn</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We have used three libraries. Do we really understand every line well enough to rebuild the model ourselves and get the same numbers?</p>
  <p>Now everything together in about 30 lines. The class minimises <em>exactly</em> sklearn's objective, C·Σ log-loss + ½‖w‖² with the intercept unpenalised, so the answers should agree to many decimals. Two training methods:</p>
  <ul>
    <li><strong>Newton</strong>: gradient g = C·X₁ᵀ(p − y) + [0, w]; Hessian H = C·X₁ᵀ diag(p(1 − p)) X₁ + diag(0, 1, …, 1); step θ ← θ − H⁻¹g. (X₁ is X with a column of ones in front, so θ = [b, w].)</li>
    <li><strong>Gradient descent</strong>: θ ← θ − η · g / n, the section 06 loop plus the penalty term.</li>
  </ul>
  <p>Then a softmax version for three classes, same objective with cross-entropy.</p>
  <div class="fx" data-lang="py">class ScratchLogReg:
    """Binary logistic regression. Minimises C * sum(log-loss) + 0.5 * ||w||^2 (intercept not penalised),
    which is exactly sklearn's objective."""
    def __init__(self, C=1.0, method="newton", lr=0.1, n_iter=100, tol=1e-10):
        self.C, self.method, self.lr, self.n_iter, self.tol = C, method, lr, n_iter, tol

    def fit(self, X, y):
        X1 = np.c_[np.ones(len(X)), X]                 # column of 1s for the intercept
        theta = np.zeros(X1.shape[1])                  # [b, w1, ..., wd]
        pen = np.r_[0.0, np.ones(X.shape[1])]          # 0 = do not penalise the intercept
        for it in range(self.n_iter):
            p = sigmoid(X1 @ theta)
            grad = self.C * X1.T @ (p - y) + pen * theta
            if np.abs(grad).max() &lt; self.tol:
                break
            if self.method == "newton":                # Newton / IRLS step: solve H d = grad
                H = self.C * (X1.T * (p * (1 - p))) @ X1 + np.diag(pen)
                theta -= np.linalg.solve(H, grad)
            else:                                      # plain gradient descent
                theta -= self.lr * grad / len(y)
        self.n_iter_, self.intercept_, self.coef_ = it, theta[0], theta[1:]
        return self

    def predict_proba(self, X):
        p1 = sigmoid(self.intercept_ + X @ self.coef_)
        return np.c_[1 - p1, p1]

    def predict(self, X):
        return (self.intercept_ + X @ self.coef_ &gt; 0).astype(int)

six = ScratchLogReg(C=1.0).fit(hours[:, None], passed)        # the six students, C = 1 as in section 10
print(f"six students, scratch Newton: w={six.coef_[0]:.3f} b={six.intercept_:.3f}  (sklearn C=1: 0.767, -2.685)")
y_tr = ya_tr.values
newton = ScratchLogReg(C=1.0).fit(Xs_tr, y_tr)
gd = ScratchLogReg(C=1.0, method="gd", lr=0.5, n_iter=50000).fit(Xs_tr, y_tr)
sk_tight = LogisticRegression(C=1.0, tol=1e-10, max_iter=10000).fit(Xs_tr, y_tr)
sk_default = LogisticRegression(C=1.0).fit(Xs_tr, y_tr)
print(f"Newton stopped after {newton.n_iter_} steps, GD after {gd.n_iter_} steps")
for name, mdl in [("Newton", newton), ("GD", gd), ("sklearn default tol", sk_default)]:
    dc = np.abs(mdl.coef_.ravel() - sk_tight.coef_[0]).max()
    dp = np.abs(mdl.predict_proba(Xs_tr)[:, 1] - sk_tight.predict_proba(Xs_tr)[:, 1]).max()
    print(f"{name:20s} max |coef diff| = {dc:.1e}   max |proba diff| = {dp:.1e}")
print("same labels as sklearn:", np.array_equal(newton.predict(Xs_tr), sk_tight.predict(Xs_tr)))

# softmax (multinomial) from scratch on iris, same objective: C * sum(cross-entropy) + 0.5 * ||W||^2
Xi_s = StandardScaler().fit_transform(Xi); Y = np.eye(3)[yi]          # one-hot targets
W, b3 = np.zeros((4, 3)), np.zeros(3)
for _ in range(30000):
    Z = Xi_s @ W + b3
    P = np.exp(Z - Z.max(1, keepdims=True)); P /= P.sum(1, keepdims=True)
    W -= 0.002 * (Xi_s.T @ (P - Y) + W)                                # C = 1
    b3 -= 0.002 * (P - Y).sum(0)
sk3 = LogisticRegression(tol=1e-10, max_iter=10000).fit(Xi_s, yi)
print(f"softmax from scratch vs sklearn: max |W diff| = {np.abs(W.T - sk3.coef_).max():.1e}, "
      f"max |b diff| = {np.abs(b3 - sk3.intercept_).max():.1e}")</div>
  <div class="fx" data-lang="text">six students, scratch Newton: w=0.767 b=-2.685  (sklearn C=1: 0.767, -2.685)
Newton stopped after 10 steps, GD after 17539 steps
Newton               max |coef diff| = 5.1e-07   max |proba diff| = 8.0e-08
GD                   max |coef diff| = 5.1e-07   max |proba diff| = 8.0e-08
sklearn default tol  max |coef diff| = 8.6e-03   max |proba diff| = 3.6e-03
same labels as sklearn: True
softmax from scratch vs sklearn: max |W diff| = 3.0e-07, max |b diff| = 1.4e-07</div>
  <p>First line: on our six students the scratch class reproduces section 10's C = 1 answer (w = 0.767, b = −2.685) exactly. On the 30-feature data, Newton needed 10 steps to drive the gradient below 10⁻¹⁰; gradient descent needed 17,539. Both land on the same weights as sklearn run with a tight tolerance (differences around 5 × 10⁻⁷, the precision of sklearn's own stop). sklearn with its default tolerance is "only" within 0.009 in coefficients and 0.004 in probabilities: plenty for prediction. The softmax loop matches sklearn's multinomial fit on iris to 3 × 10⁻⁷. Key lines: <code>np.c_[np.ones(len(X)), X]</code> adds the intercept column; <code>pen</code> switches the penalty off for it; <code>Z - Z.max(1, keepdims=True)</code> is the overflow-safe softmax from section 09.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>When your own implementation "doesn't match sklearn", check in this order: (1) sklearn's default penalty (C = 1), (2) sum vs mean in the loss (sklearn sums, so C scales with n), (3) whether the intercept is penalised (liblinear does), (4) tolerances, (5) feature scaling.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Strengths &amp; Comparisons.</b> We can build it, but not yet judge when it is the right model compared with its siblings.</div>

  <h2 id="lg-compare"><span class="num">15</span>Strengths, Weaknesses &amp; Comparisons</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We can build and read logistic regression. When is it the right tool, and when should we reach for its siblings or for trees?</p>
  <div class="cards">
    <div><b>Strengths</b><p>Honest probabilities out of the box (it directly minimises log-loss); coefficients with a clear meaning (odds ratios) and statistical tests; fast to train and to predict (one dot product); works with millions of sparse features (text); convex, so no bad local minima.</p><small>A strong, explainable baseline for any tabular yes/no problem</small></div>
    <div><b>Weaknesses</b><p>Straight boundaries only, unless you engineer features; no automatic interactions; needs scaling and encoding; sensitive to correlated features (unstable coefficients); infinite weights on separable data without a penalty.</p><small>Trees and boosting win when the signal is nonlinear and interactive</small></div>
    <div><b>Use it when</b><p>You need a probability or an explanation (credit scoring, medicine, regulated domains), as the first baseline, for high-dimensional sparse text, or as the final "stacker" / calibrator on top of other models.</p><small>Platt scaling in <a class="xref" data-note="ml_calibration">Calibration</a> is a 1-feature logistic regression</small></div>
  </div>
  <p>The same "two moons" data (two curved, interleaved half-circles with noise) for six models, with train/test accuracy and test log-loss (lower is better):</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_moons
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import log_loss
Xo, yo = make_moons(n_samples=600, noise=0.3, random_state=0)
Xo_tr, Xo_te, yo_tr, yo_te = train_test_split(Xo, yo, test_size=0.3, random_state=0)
models = {"Logistic": LogisticRegression(),
          "Logistic + poly(3)": make_pipeline(PolynomialFeatures(3), StandardScaler(), LogisticRegression()),
          "Gaussian NB": GaussianNB(), "KNN k=15": KNeighborsClassifier(15),
          "SVM RBF (calibrated)": CalibratedClassifierCV(SVC(), ensemble=False), "Tree depth 4": DecisionTreeClassifier(max_depth=4, random_state=0)}
print(f"{'model':21s} train  test   test log-loss")
for name, mdl in models.items():
    p = make_pipeline(StandardScaler(), mdl).fit(Xo_tr, yo_tr)
    print(f"{name:21s} {p.score(Xo_tr, yo_tr):.3f}  {p.score(Xo_te, yo_te):.3f}  {log_loss(yo_te, p.predict_proba(Xo_te)):.3f}")</div>
  <div class="fx" data-lang="text">model                 train  test   test log-loss
Logistic              0.874  0.844  0.374
Logistic + poly(3)    0.902  0.872  0.294
Gaussian NB           0.871  0.856  0.378
KNN k=15              0.931  0.889  1.193
SVM RBF (calibrated)  0.902  0.872  0.355
Tree depth 4          0.919  0.861  2.754</div>
  <p>Plain logistic regression is limited by its straight line (0.844), but its log-loss (0.374) is decent: its probabilities are honest even when its boundary is too simple. Adding cubic features lifts it to 0.872 and the best log-loss of all (0.294). KNN has the best accuracy but a terrible log-loss (1.193): its k = 15 vote shares include hard 0s and 1s that are sometimes wrong. The depth-4 tree is worse still (2.754) for the same reason.</p>
  <table class="tbl">
    <tr><th></th><th>Logistic regression</th><th><a class="xref" data-note="ml_naivebayes">Naive Bayes</a></th><th><a class="xref" data-note="ml_knn">KNN</a></th><th><a class="xref" data-note="ml_svm">SVM</a></th><th><a class="xref" data-note="ml_dtree">Decision tree</a> / boosting</th></tr>
    <tr><td>Type</td><td>Discriminative: models P(y | x) directly</td><td>Generative: models P(x | y), P(y)</td><td>Instance-based (lazy)</td><td>Discriminative, margin-based</td><td>Rule-based partitions</td></tr>
    <tr><td>Boundary</td><td>Linear (in features)</td><td>Linear / quadratic</td><td>Any</td><td>Linear or kernel-curved</td><td>Axis-aligned boxes</td></tr>
    <tr><td>Loss</td><td>Log-loss</td><td>Joint likelihood (counting)</td><td>None</td><td>Hinge</td><td>Impurity / log-loss (GBM)</td></tr>
    <tr><td>Probabilities</td><td>Good</td><td>Too extreme</td><td>Coarse (k shares)</td><td>Need calibration</td><td>Tree: coarse; GBM: decent</td></tr>
    <tr><td>Scaling needed</td><td>Yes (penalty, solvers)</td><td>No</td><td>Yes (critical)</td><td>Yes</td><td>No</td></tr>
    <tr><td>Small data</td><td>Good</td><td>Very good</td><td>OK</td><td>Good</td><td>Tree: unstable</td></tr>
    <tr><td>Interpretability</td><td>Odds ratios, p-values</td><td>Per-feature likelihoods</td><td>"Similar cases"</td><td>Support vectors (weak)</td><td>Rules / SHAP</td></tr>
  </table>
  <p>Versus its parent <a class="xref" data-note="ml_regression">linear regression</a>: same weighted sum and same "prediction minus target times input" gradient, but a sigmoid output, log-loss instead of squared error, no closed form, and coefficients on the log-odds scale. Versus <a class="xref" data-note="ml_svm">SVM</a>: both learn a hyperplane; logistic uses log-loss (every point contributes, smoothly less when far on the right side), SVM uses hinge loss (points beyond the margin contribute exactly zero). Logistic regression is also a one-layer neural network with a sigmoid output, and softmax regression is the last layer of every deep classifier.</p>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have seen each concept separately; next we lay out how they build on each other in one chain.</div>

  <h2 id="lg-connect"><span class="num">16</span>How It All Connects</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We have met many pieces one at a time: odds, sigmoid, likelihood, gradient, boundary, odds ratio, softmax, C, class weights. How does each one come out of the previous, and which question does each answer?</p>
  <p>Every concept in this note is computed from the one before it. The diagram follows a single student (3 hours, passed) through the chain; the table puts every number from our six students in one place.</p>
  <figure class="viz"><svg viewBox="0 0 700 400" width="700">
<defs><marker id="lg-ca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="54" rx="8" class="fs" stroke="currentColor"/><text x="70" y="42" text-anchor="middle" font-size="12.5">features x</text><text x="70" y="60" text-anchor="middle" class="tm" font-size="11">hours = 3</text>
<line x1="130" y1="47" x2="158" y2="47" stroke="currentColor" marker-end="url(#lg-ca)"/>
<rect x="160" y="20" width="150" height="54" rx="8" class="fb sb"/><text x="235" y="40" text-anchor="middle" font-size="12.5">score / log-odds</text><text x="235" y="58" text-anchor="middle" class="tm" font-size="11">z = w·x + b = −0.61</text>
<line x1="310" y1="47" x2="338" y2="47" stroke="currentColor" marker-end="url(#lg-ca)"/>
<rect x="340" y="20" width="150" height="54" rx="8" class="fb sb"/><text x="415" y="40" text-anchor="middle" font-size="12.5">sigmoid</text><text x="415" y="58" text-anchor="middle" class="tm" font-size="11">p = σ(z) = 0.353</text>
<line x1="490" y1="47" x2="518" y2="47" stroke="currentColor" marker-end="url(#lg-ca)"/>
<rect x="520" y="20" width="170" height="54" rx="8" class="ft st"/><text x="605" y="40" text-anchor="middle" font-size="12.5">row log-loss</text><text x="605" y="58" text-anchor="middle" class="tm" font-size="11">−ln 0.353 = 1.042</text>
<line x1="605" y1="74" x2="605" y2="118" stroke="currentColor" marker-end="url(#lg-ca)"/>
<rect x="520" y="120" width="170" height="54" rx="8" class="ft st"/><text x="605" y="140" text-anchor="middle" font-size="12.5">mean log-loss</text><text x="605" y="158" text-anchor="middle" class="tm" font-size="11">= −ln(likelihood)/n = 0.413</text>
<line x1="520" y1="147" x2="492" y2="147" stroke="currentColor" marker-end="url(#lg-ca)"/>
<rect x="320" y="120" width="170" height="54" rx="8" class="ft st"/><text x="405" y="140" text-anchor="middle" font-size="12.5">gradient</text><text x="405" y="158" text-anchor="middle" class="tm" font-size="11">(1/n) Σ (p − y)·x</text>
<line x1="320" y1="147" x2="292" y2="147" stroke="currentColor" marker-end="url(#lg-ca)"/>
<rect x="120" y="120" width="170" height="54" rx="8" class="fg sg"/><text x="205" y="140" text-anchor="middle" font-size="12.5">fitted weights</text><text x="205" y="158" text-anchor="middle" class="tm" font-size="11">w = 1.214, b = −4.249</text>
<path d="M120 147 L70 147 L70 76" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#lg-ca)"/><text x="16" y="110" class="tm" font-size="10.5">repeat</text>
<line x1="160" y1="174" x2="100" y2="226" stroke="currentColor" marker-end="url(#lg-ca)"/>
<line x1="205" y1="174" x2="250" y2="226" stroke="currentColor" marker-end="url(#lg-ca)"/>
<rect x="20" y="228" width="160" height="54" rx="8" class="fg sg"/><text x="100" y="248" text-anchor="middle" font-size="12.5">decision boundary</text><text x="100" y="266" text-anchor="middle" class="tm" font-size="11">−b/w = 3.50 hours</text>
<rect x="190" y="228" width="160" height="54" rx="8" class="fg sg"/><text x="270" y="248" text-anchor="middle" font-size="12.5">odds ratio</text><text x="270" y="266" text-anchor="middle" class="tm" font-size="11">e^w = 3.37 per hour</text>
<rect x="400" y="228" width="140" height="54" rx="8" class="fv" stroke="currentColor"/><text x="470" y="248" text-anchor="middle" font-size="12.5">+ penalty ½‖w‖²/C</text><text x="470" y="266" text-anchor="middle" class="tm" font-size="11">C = 1 → w = 0.767</text>
<line x1="490" y1="228" x2="580" y2="176" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#lg-ca)"/>
<rect x="550" y="228" width="140" height="54" rx="8" class="fv" stroke="currentColor"/><text x="620" y="248" text-anchor="middle" font-size="12.5">× class weights</text><text x="620" y="266" text-anchor="middle" class="tm" font-size="11">nₖ rare → weight up</text>
<line x1="620" y1="228" x2="640" y2="176" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#lg-ca)"/>
<rect x="160" y="320" width="380" height="54" rx="8" class="fs" stroke="currentColor"/><text x="350" y="340" text-anchor="middle" font-size="12.5">softmax = sigmoid for K classes</text><text x="350" y="358" text-anchor="middle" class="tm" font-size="11">replaces the σ box; log-loss becomes cross-entropy; gradient still P − Y</text>
<line x1="415" y1="320" x2="415" y2="76" stroke="currentColor" stroke-dasharray="2 4" stroke-opacity="0.6"/>
</svg><figcaption>The chain for the student who studied 3 hours and passed. Forward (top row): features → score → probability → loss. Backward (middle row): loss → gradient → better weights, repeated until the gradient is zero. Bottom: what the weights give us (boundary, odds ratio) and the two add-ons that change the loss (penalty, class weights). Softmax swaps out the sigmoid box for many classes.</figcaption></figure>
  <table class="tbl"><caption>Every concept, what it is built from, and its value on the six students</caption>
    <tr><th>Concept</th><th>Built from</th><th>Formula</th><th>Question it answers</th><th>Six students</th><th>Use / watch out</th></tr>
    <tr><td>Linear probability model</td><td>least squares</td><td>ŷ = b + wx</td><td>(failed attempt) can a line give P?</td><td>−0.2 + 0.2·hours; −0.2 at 0 h</td><td>Unbounded; easy points move the cut</td></tr>
    <tr><td>Odds</td><td>probability</td><td>p/(1 − p)</td><td>"how many to one"?</td><td>p = 0.353 → 0.546</td><td>Not a probability; ≈ p only when rare</td></tr>
    <tr><td>Log-odds (score) z</td><td>odds; weights</td><td>ln(p/(1 − p)) = w·x + b</td><td>a scale a line may cover</td><td>−3.03, −1.82, −0.61, 0.61, 1.82, 3.04</td><td>Weights add here</td></tr>
    <tr><td>Sigmoid p</td><td>log-odds (inverse)</td><td>1/(1 + e^(−z))</td><td>score → probability</td><td>0.046, 0.139, 0.353, 0.647, 0.861, 0.954</td><td>Saturates: slope p(1 − p) ≤ 0.25</td></tr>
    <tr><td>Likelihood</td><td>p of every row</td><td>Π p^y (1 − p)^(1 − y)</td><td>how probable is what happened?</td><td>0.084 (coin-flip model 0.0156)</td><td>Underflows; take logs</td></tr>
    <tr><td>Log-loss</td><td>−ln likelihood / n</td><td>−mean[y ln p + (1 − y) ln(1 − p)]</td><td>how good are these weights?</td><td>0.413 (coin-flip 0.693)</td><td>Convex; explodes for confident mistakes</td></tr>
    <tr><td>Gradient</td><td>log-loss + chain rule</td><td>(1/n)Σ(p − y)x, (1/n)Σ(p − y)</td><td>which way is downhill?</td><td>first step: −0.583, 0</td><td>p(1 − p) cancels; scale features</td></tr>
    <tr><td>Fitted weights</td><td>gradient = 0</td><td>iterate θ ← θ − η∇L</td><td>the best model</td><td>w = 1.214, b = −4.249</td><td>No closed form; infinite if separable</td></tr>
    <tr><td>Decision boundary</td><td>weights</td><td>w·x + b = logit(t)</td><td>where does it switch?</td><td>3.50 hours (t = 0.5)</td><td>Threshold shifts it, never rotates it</td></tr>
    <tr><td>Odds ratio</td><td>weight</td><td>e^(wⱼ)</td><td>effect of +1 unit in words</td><td>e^1.214 = 3.37 per hour</td><td>Constant on odds; Δp = p(1 − p)w varies</td></tr>
    <tr><td>Softmax</td><td>sigmoid, K scores</td><td>e^(zₖ)/Σe^(zⱼ)</td><td>more than two classes</td><td>[2, 1, 0.1] → 0.659, 0.242, 0.099</td><td>Not for multilabel</td></tr>
    <tr><td>Penalty C</td><td>log-loss + ½‖w‖²</td><td>½‖w‖² + C·Σℓ</td><td>keep weights finite, reduce variance</td><td>C = 1: w = 0.767, b = −2.685</td><td>sklearn's default; scale first</td></tr>
    <tr><td>Class weights</td><td>weighted log-loss</td><td>wₖ = n/(K·nₖ)</td><td>make a rare class count</td><td>(simulated 3,000) 0.529 / 9.259</td><td>Breaks calibration; ≈ intercept shift</td></tr>
    <tr><td>Standard errors, p-values</td><td>Hessian at the optimum</td><td>se = √diag((XᵀSX)⁻¹), z = w/se</td><td>is the effect real?</td><td>(400 simulated) hours z = 10.1</td><td>Unpenalised fits only</td></tr>
  </table>
  <p>Two threads run through the table. The <strong>forward thread</strong> (score → sigmoid → probability → likelihood → loss) is how the model predicts and is judged. The <strong>backward thread</strong> (loss → gradient → weights) is how it learns, and everything we interpret (boundary, odds ratio, p-values) is read off the finished weights. The add-ons (penalty, class weights, softmax) each change exactly one box of the chain.</p>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The chain tells us how things fit when used correctly; it does not list the ways people misuse them.</div>

  <h2 id="lg-traps"><span class="num">17</span>Common Mistakes</h2>
  <p class="gap"><strong>The question we can't answer yet.</strong> We know how everything works. Where do people (and interviewers' trick questions) most often go wrong?</p>
  <div class="callout trap"><span class="label">Trap: reading w as a probability change</span>
    <p>w is a change in log-odds; e^w is the odds multiplier. The probability change is p(1 − p)w and depends on the row.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the default penalty</span>
    <p><code>LogisticRegression()</code> uses C = 1. Coefficients are shrunk, and they change if you add rows (the penalty does not scale with n). For textbook maximum likelihood use <code>C=np.inf</code> or statsmodels.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: not scaling</span>
    <p>Unscaled features cause <code>ConvergenceWarning</code>s, unfair penalties and incomparable coefficients. Put <code>StandardScaler</code> in a pipeline, fitted on training folds only.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: using 0.5 as the threshold by habit</span>
    <p>0.5 is optimal only when false positives and false negatives cost the same and the probabilities are calibrated. Choose the threshold from costs or a precision-recall target (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: perfect separation</span>
    <p>Huge coefficients, huge standard errors, warnings in statsmodels: some feature (or combination) splits the classes perfectly, often a leaked feature ("account_closed_date" predicting churn). Check for leakage first, then regularise.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: class_weight then trusting predict_proba</span>
    <p>Re-weighting inflates the minority probabilities (mean p 0.345 vs true rate 0.054 in section 11). Recalibrate or move the threshold instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dummy-variable trap and collinearity</span>
    <p>One-hot encoding all K categories plus an intercept makes the columns perfectly collinear. With a penalty sklearn copes; statsmodels fails or gives meaningless std errors. Drop one level (<code>drop="first"</code>) for inference.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: softmax for multilabel</span>
    <p>If a row can belong to several classes, use independent sigmoids, not softmax.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: claiming it cannot do nonlinear problems</span>
    <p>It is linear in the features you give it. Polynomial, spline, interaction or binned features make curved boundaries (circles: 0.457 → 1.000 in section 07).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> Everything is covered; next comes the whole note condensed for revision.</div>

  <h2 id="lg-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Logistic regression predicts the probability of a yes/no outcome by passing a weighted sum of the features through the sigmoid. It is trained by minimising log-loss (maximum likelihood) and read through odds ratios. Running example: six students with hours 1–6 and results 0, 0, 1, 0, 1, 1.</p>
  <h3>The story in one line per step</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Answer</th><th>Weakness that forces the next step</th></tr>
    <tr><td>Classification</td><td>What to output for a category?</td><td>P(class | x), then a threshold</td><td>How to produce P?</td></tr>
    <tr><td>Line on 0/1</td><td>Reuse linear regression?</td><td>ŷ = −0.2 + 0.2·hours</td><td>Leaves [0, 1]; easy points move the cut</td></tr>
    <tr><td>Log-odds</td><td>Which scale can a line cover?</td><td>ln(p/(1 − p)) ∈ (−∞, ∞)</td><td>Must convert back</td></tr>
    <tr><td>Sigmoid</td><td>Log-odds → p?</td><td>σ(z) = 1/(1 + e^(−z))</td><td>Weights unknown</td></tr>
    <tr><td>Log-loss</td><td>How good are weights?</td><td>−mean[y ln p + (1 − y) ln(1 − p)]</td><td>No closed-form minimum</td></tr>
    <tr><td>Gradient descent</td><td>How to find weights?</td><td>θ ← θ − η·(1/n)Xᵀ(p − y)</td><td>What did it learn?</td></tr>
    <tr><td>Boundary</td><td>Where does it switch?</td><td>w·x + b = 0 → 3.50 h</td><td>How to explain a weight?</td></tr>
    <tr><td>Odds ratio</td><td>Effect of +1 unit?</td><td>e^w (3.37 per hour)</td><td>Only two classes</td></tr>
    <tr><td>Softmax</td><td>K classes?</td><td>e^(zₖ)/Σe^(zⱼ)</td><td>Weights can explode</td></tr>
    <tr><td>Regularization</td><td>Keep weights sane?</td><td>½‖w‖² + C·Σℓ</td><td>Rare class ignored</td></tr>
    <tr><td>Imbalance</td><td>Make rare class count?</td><td>class_weight or lower threshold</td><td>Which solver/settings?</td></tr>
    <tr><td>sklearn / statsmodels</td><td>Run it; is an effect real?</td><td>LogisticRegression; Logit summary (se, z, p, CI)</td><td>–</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <div class="cards">
    <div><b>Model</b><p>P(y = 1 | x) = σ(wᵀx + b). x = feature vector, w = weights (one per feature), b = intercept, σ = sigmoid. Linear in the log-odds: ln(p/(1 − p)) = wᵀx + b.</p><small>Predict 1 if p ≥ t (default t = 0.5 ⇔ z ≥ 0)</small></div>
    <div><b>Sigmoid facts</b><p>σ(0) = 0.5; σ(−z) = 1 − σ(z); σ′(z) = σ(z)(1 − σ(z)), largest (0.25) at z = 0. It is the inverse of the logit.</p><small>+1 in z: p 0.50 → 0.73, but 0.018 → 0.047</small></div>
    <div><b>Log-loss</b><p>L = −(1/n)Σ[yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)] = −ln(likelihood)/n, from yᵢ ~ Bernoulli(pᵢ). Convex in (w, b). Coin-flip baseline ln 2 = 0.693.</p><small>MSE through a sigmoid: non-convex, vanishing gradient</small></div>
    <div><b>Gradient &amp; Hessian</b><p>∂L/∂w = (1/n)Xᵀ(p − y), ∂L/∂b = mean(p − y), H = (1/n)XᵀSX with S = diag(p(1 − p)). Newton/IRLS: θ ← θ − H⁻¹g.</p><small>No closed form; lbfgs default in sklearn</small></div>
    <div><b>Interpretation</b><p>wⱼ = change in log-odds per unit of xⱼ, others fixed. Odds ratio e^(wⱼ). Probability change ≈ p(1 − p)wⱼ, depends on the row. Scale features to compare coefficients.</p><small>Boundary: wᵀx + b = logit(t)</small></div>
    <div><b>Multiclass</b><p>Softmax pₖ = e^(zₖ)/Σⱼe^(zⱼ), cross-entropy −ln p_true, gradient (P − Y)ᵀX. K = 2 reduces to σ(z₁ − z₀). One-vs-rest: K sigmoids normalised.</p><small>Multilabel → independent sigmoids</small></div>
    <div><b>Regularization</b><p>sklearn minimises r(w) + C·Σℓᵢ; C = 1/λ. L2 (default) shrinks; L1 (l1_ratio = 1) zeroes weights; elastic net mixes. Intercept unpenalised. C = np.inf = none.</p><small>Separable data without penalty → infinite weights</small></div>
    <div><b>Imbalance</b><p>"balanced" weights wₖ = n/(K·nₖ); mostly shifts the intercept by ≈ ln(w₁/w₀); probabilities become inflated. Lowering the threshold keeps them honest.</p><small>Judge with recall/precision/PR-AUC, not accuracy</small></div>
    <div><b>Inference (statsmodels)</b><p>se = √diag((XᵀŜX)⁻¹); z = coef/se; 95% CI = coef ± 1.96·se; odds-ratio CI = e^(CI). McFadden pseudo R² = 1 − LL/LL₀; LLR test vs intercept-only; AIC = 2k − 2LL.</p><small>Only for unpenalised fits</small></div>
  </div>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>hours</th><th>y</th><th>z (fitted)</th><th>p</th><th>row loss</th><th>first GD step: (p − y)·x at w = 0</th></tr>
    <tr><td>1</td><td>0</td><td>−3.03</td><td>0.046</td><td>0.047</td><td>+0.5</td></tr>
    <tr><td>2</td><td>0</td><td>−1.82</td><td>0.139</td><td>0.150</td><td>+1.0</td></tr>
    <tr><td>3</td><td>1</td><td>−0.61</td><td>0.353</td><td>1.042</td><td>−1.5</td></tr>
    <tr><td>4</td><td>0</td><td>+0.61</td><td>0.647</td><td>1.042</td><td>+2.0</td></tr>
    <tr><td>5</td><td>1</td><td>+1.82</td><td>0.861</td><td>0.150</td><td>−2.5</td></tr>
    <tr><td>6</td><td>1</td><td>+3.04</td><td>0.954</td><td>0.047</td><td>−3.0</td></tr>
    <tr><td colspan="6">Fitted w = 1.214, b = −4.249 · log-loss 0.413 (vs 0.693) · boundary 3.50 h · odds ratio 3.37/hour · first GD step (η = 0.5): w 0 → 0.292, loss 0.693 → 0.672 · C = 1: w = 0.767 · linear-regression line −0.2 + 0.2·hours · with mock tests: z = −7.14 + 1.52·hours + 1.10·tests, boundary tests = 6.52 − 1.39·hours, odds ratio 4.56 per hour.</td></tr>
  </table>
  <h3>When to use it, when not</h3>
  <table class="tbl">
    <tr><th>Use</th><th>Avoid / extend</th></tr>
    <tr><td>You need honest probabilities or explainable effects (credit, medicine); a first baseline; very many sparse features (text); a calibrator or stacker on top of other models.</td><td>Strongly nonlinear or interacting signal (use trees/boosting, or add polynomial/interaction features); perfectly separable data without a penalty; inference on penalised coefficients.</td></tr>
  </table>
  <h3>Key traps</h3>
  <ul>
    <li>A weight is a change in <em>log-odds</em>, not in probability.</li>
    <li>sklearn penalises by default (C = 1): coefficients are shrunk and differ from statsmodels.</li>
    <li>Scale features: unfair penalties, slow solvers and incomparable coefficients otherwise.</li>
    <li>0.5 is not a law; choose the threshold from costs. class_weight inflates predict_proba.</li>
    <li>Huge coefficients and standard errors signal separation, often leakage.</li>
    <li>Softmax for exclusive classes only; sklearn 1.9 has no multi_class and deprecates penalty=.</li>
  </ul>
  <h3>Rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>p = 0.8: odds and log-odds?</td><td>Odds 4, log-odds ln 4 = 1.386.</td></tr>
    <tr><td>Gradient of log-loss with respect to z for one row?</td><td>p − y.</td></tr>
    <tr><td>w = 0.7 on hours: odds ratio?</td><td>e^0.7 ≈ 2.01: each hour doubles the odds.</td></tr>
    <tr><td>Threshold raised from 0.5 to 0.8: what happens to the boundary?</td><td>It shifts in parallel to w·x + b = 1.386; its direction is unchanged.</td></tr>
    <tr><td>C made smaller: what happens to the weights and to bias/variance?</td><td>Weights shrink toward 0; bias rises, variance falls.</td></tr>
  </table>


  <h2 id="lg-qa"><span class="num">18</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use linear regression for a 0/1 target?</summary><div class="qa-body">Its predictions are unbounded (−0.2 at 0 hours and 1.8 at 10 hours on our six students), so they are not probabilities. Squared error also punishes being "too right", so a far-away, easy point tilts the line and moves the cut-off (3.50 → 4.16 hours after adding one 20-hour student), and the effect of a feature on p is constant instead of saturating.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the sigmoid from the log-odds.</summary><div class="qa-body">Set ln(p/(1 − p)) = z. Then p/(1 − p) = e^z, p = e^z(1 − p), p(1 + e^z) = e^z, p = e^z/(1 + e^z) = 1/(1 + e^(−z)). So the sigmoid is just the inverse of the logit: "log-odds back to probability".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the log-loss from maximum likelihood.</summary><div class="qa-body">Each yᵢ ~ Bernoulli(pᵢ), so P(yᵢ) = pᵢ^yᵢ(1 − pᵢ)^(1 − yᵢ). Independence gives the likelihood Πᵢ pᵢ^yᵢ(1 − pᵢ)^(1 − yᵢ). Take logs (product → sum, same maximiser), negate (maximise → minimise) and divide by n: L = −(1/n) Σ[yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)]. On our six students the fitted model (w = 1.214, b = −4.249) gives likelihood ≈ 0.084 and log-loss 0.413, against 0.693 for the coin-flip model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the gradient of the log-loss. Why is it so simple?</summary><div class="qa-body">∂ℓ/∂p = (p − y)/(p(1 − p)), ∂p/∂z = p(1 − p), ∂z/∂w = x. The p(1 − p) cancels, giving ∂ℓ/∂w = (p − y)x and ∂L/∂w = (1/n)Xᵀ(p − y). It mirrors linear regression's (ŷ − y)x because log-loss is the negative log-likelihood of a GLM with its canonical (logit) link.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is MSE a bad loss for logistic regression?</summary><div class="qa-body">Through a sigmoid it is non-convex, and its gradient 2(p − y)p(1 − p) vanishes exactly when the model is confidently wrong (0.0196 at p = 0.01 for a true 1, vs 0.990 for log-loss). It also caps the penalty for a wrong confident answer at 1 instead of letting it grow without bound.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is there a closed-form solution? How is it actually trained?</summary><div class="qa-body">No: the weights sit inside the sigmoid in the zero-gradient equation. It is trained iteratively: gradient descent, Newton/IRLS (uses the Hessian XᵀSX, converges in ~10 steps), L-BFGS (sklearn default), coordinate descent (liblinear), or SAG/SAGA for large data. The loss is convex, so all of them reach the same optimum.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you interpret a coefficient of 0.7 on "hours"?</summary><div class="qa-body">Each extra hour, holding the other features fixed, adds 0.7 to the log-odds of passing, i.e. multiplies the odds by e^0.7 ≈ 2.01. The probability change depends on the starting point: about 0.25 × 0.7 = 0.175 near p = 0.5, much less near 0 or 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the decision boundary, and what happens when you change the threshold?</summary><div class="qa-body">The set where w·x + b = logit(t); for t = 0.5 that is w·x + b = 0, a hyperplane. Changing t only shifts it parallel (to w·x + b = ln(t/(1 − t))); it never rotates it. Curved boundaries require transformed features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens with perfectly separable data?</summary><div class="qa-body">The likelihood keeps increasing as ‖w‖ grows, so the MLE does not exist (infinite weights); we saw w climb 1.1 → 15.2 as C grew. Statsmodels reports separation and huge standard errors. Fix with a penalty (finite C), or check for target leakage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does C mean in sklearn, and how does L1 differ from L2?</summary><div class="qa-body">sklearn minimises r(w) + C Σ log-loss, so C = 1/λ: small C = strong regularisation. L2 (½‖w‖²) shrinks all weights smoothly; L1 (‖w‖₁) drives some exactly to zero (3 of 30 kept at C = 0.01 on breast cancer), doing feature selection. Elastic net mixes them via l1_ratio. Choose C by CV (LogisticRegressionCV).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Softmax vs one-vs-rest?</summary><div class="qa-body">OvR trains K binary models and normalises their sigmoids afterwards; softmax trains one model whose K probabilities e^zₖ/Σe^zⱼ sum to 1 by construction and minimises cross-entropy. Softmax is the default and usually better calibrated (0.960 vs 0.927 on iris); OvR suits multilabel problems. With K = 2 softmax reduces to σ(z₁ − z₀).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does class_weight="balanced" work, and what does it cost?</summary><div class="qa-body">Each row of class k gets weight n/(K·nₖ) (0.529 and 9.259 for 2,838 vs 162 rows), so each class carries equal total weight. For logistic regression it mostly shifts the intercept by about ln(w₁/w₀), equivalent to lowering the threshold. Cost: probabilities are no longer calibrated (mean p 0.345 vs base rate 0.054).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Read a statsmodels Logit row: coef 0.10, std err 0.10, P&gt;|z| 0.30.</summary><div class="qa-body">z = 0.10/0.10 = 1.0, so the estimate is one standard error from zero; a p-value of 0.30 means data like this is common even if the true effect is zero; the 95% CI (≈ −0.10 to 0.30) includes 0, and the odds-ratio CI includes 1. We cannot claim an effect (our "phone" feature, whose true effect was 0).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How is logistic regression related to Naive Bayes?</summary><div class="qa-body">They are a discriminative/generative pair. Gaussian NB with shared variances (or multinomial NB) gives a posterior whose log-odds are linear in x, the same functional form as logistic regression. NB gets the weights by counting P(x | y) under an independence assumption (fast, good with little data); logistic regression fits them directly to maximise P(y | x) (better with more data, better calibrated). See <a class="xref" data-note="ml_naivebayes">Naive Bayes</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Where does this note's log-loss reappear in gradient boosting and neural networks?</summary><div class="qa-body">Gradient boosting for classification minimises the same log-loss on the log-odds scale; each new tree is fit to the negative gradient y − p (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>). A neural network classifier ends with a softmax layer trained by cross-entropy: its last layer is a softmax regression on learnt features.</div></details>
</main>
`
});
