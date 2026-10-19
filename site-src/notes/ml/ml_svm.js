// notes/ml/ml_svm.js — Support Vector Machines
Object.assign(TOPIC_CONTENT, {
  "ml_svm": `<main>
  <h1>Support Vector Machines</h1>
  <div class="where"><span>Machine Learning</span><span>Classification</span><span>Support Vector Machines</span></div>
  <p class="lead">A support vector machine (SVM) separates two classes with the widest possible empty "street", decided only by the few training points that touch its edges. This note builds it completely on one tiny running example, six students: the geometry of w·x + b by hand, the margin 2/‖w‖, the hard-margin problem solved by hand, the dual and its α values, soft margins with C and the hinge loss, the kernel trick computed both ways, polynomial and RBF kernels and what γ and C do, why scaling is required, SVR, multiclass strategies, probabilities (and why <code>probability=True</code> is deprecated in scikit-learn 1.9), cost and when to use it, every scikit-learn parameter, and from-scratch solvers that match scikit-learn.</p>

  <h2 id="svm-fit" class="open"><span class="num">★</span>Where this fits</h2>
<figure class="viz"><svg viewBox="0 0 640 220" width="640">
<defs><marker id="svm-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="245" y="8" width="150" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="30" text-anchor="middle" font-size="13">Classification</text>
<line x1="290" y1="42" x2="95" y2="78" stroke="currentColor" marker-end="url(#svm-a0)"/><line x1="305" y1="42" x2="250" y2="78" stroke="currentColor" marker-end="url(#svm-a0)"/><line x1="335" y1="42" x2="400" y2="78" stroke="currentColor" marker-end="url(#svm-a0)"/><line x1="350" y1="42" x2="550" y2="78" stroke="currentColor" marker-end="url(#svm-a0)"/>
<rect x="20" y="80" width="150" height="44" rx="7" class="fb sb"/><text x="95" y="99" text-anchor="middle" font-size="12.5">Logistic Regression</text><text x="95" y="115" text-anchor="middle" font-size="10.5" class="tm">a line from log loss</text>
<rect x="180" y="80" width="140" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="250" y="99" text-anchor="middle" font-size="12.5">Naive Bayes</text><text x="250" y="115" text-anchor="middle" font-size="10.5" class="tm">class counts</text>
<rect x="330" y="80" width="140" height="44" rx="7" class="fb sb"/><text x="400" y="99" text-anchor="middle" font-size="12.5">K-Nearest Neighbors</text><text x="400" y="115" text-anchor="middle" font-size="10.5" class="tm">keeps every point</text>
<rect x="480" y="76" width="150" height="52" rx="7" class="fg sg" stroke-width="3"/><text x="555" y="98" text-anchor="middle" font-size="13" font-weight="700">Support Vector Machines</text><text x="555" y="116" text-anchor="middle" font-size="10.5" class="tg">you are here</text>
<line x1="470" y1="102" x2="478" y2="102" stroke="currentColor" marker-end="url(#svm-a0)"/>
<rect x="170" y="160" width="170" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="255" y="184" text-anchor="middle" font-size="12" class="tm">Tree-Based Models (next group)</text>
<rect x="360" y="160" width="130" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="425" y="184" text-anchor="middle" font-size="12" class="tm">Calibration</text>
<rect x="510" y="160" width="120" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="570" y="184" text-anchor="middle" font-size="12" class="tm">Kernel PCA</text>
<line x1="530" y1="128" x2="270" y2="158" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#svm-a0)"/><line x1="545" y1="128" x2="430" y2="158" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#svm-a0)"/><line x1="565" y1="128" x2="570" y2="158" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#svm-a0)"/>
</svg><figcaption>The Classification group. The SVM takes logistic regression's straight line and KNN's "similarity to training points", and keeps only the few points on the border.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_classification">Logistic Regression</a> and <a class="xref" data-note="ml_knn">K-Nearest Neighbors</a></b><span>Logistic regression draws one straight line, chosen by probabilities (log loss): every training point pulls on it a little, even points far from the border. KNN draws any shape, but keeps all n points, predicts slowly and has no notion of a "safe gap" between classes. Neither asks the question "how far is my boundary from the nearest examples?"</span></li>
    <li><b>This note adds: the maximum-margin boundary</b><span>Among all lines that separate the classes, pick the one with the widest empty gap. It depends only on the border points (support vectors). With the kernel trick the same machinery draws curved boundaries without ever building the curved features.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_trees">Tree-Based Models</a>, <a class="xref" data-note="ml_evaluation">Model Evaluation</a> and <a class="xref" data-note="ml_calibration">Calibration</a></b><span>SVMs need scaling, struggle beyond ~100k rows and give no probabilities. Trees and boosting need no scaling and scale to millions of rows; evaluation and calibration turn SVM scores into decisions and probabilities. Kernels return in kernel PCA (<a class="xref" data-note="ml_pca">PCA</a>).</span></li>
  </ol>
  <p>Helpful background: dot products and vector length (<a class="xref" data-note="m_linalg">Linear Algebra</a>), minimising a function with constraints (<a class="xref" data-note="m_optimization">Optimization</a>), and loss functions (<a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>). Each is re-explained where it is used.</p>

  <h2 id="svm-ladder" class="open"><span class="num">★</span>The Question Ladder</h2>
  <p>One running example carries the whole note: <strong>six students</strong> described by (hours studied per day, mock tests taken). S1 (1,1), S2 (2,1), S3 (1,2) failed; S4 (3,3), S5 (4,3), S6 (3,4) passed. We code Fail as −1 and Pass as +1. Later we add one awkward student S7 (2.5, 2.5, Fail), then three burnt-out students, then marks and a third grade, always on top of the same six.</p>
  <ol class="story">
    <li><b>Many lines (01)</b><span>Q: many lines separate the six students; which is best? → The one that stays farthest from the nearest student: x1 + x2 = 4.5, 1.061 from the closest. But "farthest" needs a formula…</span></li>
    <li><b>Geometry of a line (02)</b><span>Q: how far is a student from a line w·x + b = 0? → |w·x + b| / ‖w‖ (S4: 1.5 / 1.414 = 1.061). But we compared four hand-picked lines; we need the best of all lines…</span></li>
    <li><b>Hard margin (03)</b><span>Q: which w, b give the widest street? → Minimise ½‖w‖² with every yᵢ(w·xᵢ + b) ≥ 1: w = (2/3, 2/3), b = −3, margin 2/‖w‖ = 2.121. But why did only three students matter?</span></li>
    <li><b>Dual &amp; support vectors (04)</b><span>Q: which students decide the line? → Only those with αᵢ &gt; 0: S2, S3 (2/9 each), S4 (4/9). And the dual uses the data only through dot products. But real data is not perfectly separable…</span></li>
    <li><b>Soft margin &amp; C (05)</b><span>Q: what if S7 (2.5, 2.5, Fail) sits among the Pass students? → Allow slack ξᵢ and pay C per unit: C = 1 gives a 2.828-wide street, C = 10 squeezes it to 0.707. But what is this objective in the language of losses?</span></li>
    <li><b>Hinge loss (06)</b><span>Q: how does the SVM compare with logistic regression? → Both minimise "penalty + loss"; the SVM's hinge max(0, 1 − y·f) is exactly zero beyond the kerb, log loss never is. But both draw only straight lines…</span></li>
    <li><b>Kernel trick (07)</b><span>Q: three burnt-out students (5,5), (6,5), (5,6) also failed; no straight line works. → Lift the data (effort s → (s, s²)) and cut there; the dual needs only dot products, so a kernel K(a, b) gives them without lifting (121 = 121). But which kernel?</span></li>
    <li><b>Kernels, γ and C (08)</b><span>Q: linear, polynomial or RBF, and how do γ and C shape the boundary? → RBF exp(−γ‖a − b‖²) is a similarity; large γ = tiny bubbles (overfit), tune γ and C together. But distances assume comparable columns…</span></li>
    <li><b>Scaling (09)</b><span>Q: what if hours are in minutes? → The widest street turns into "hours = 2.5" and ignores mocks; standardising restores it. But we have only predicted classes…</span></li>
    <li><b>SVR (10)</b><span>Q: can the same idea predict marks? → Fit the flattest line with every mark inside a ±ε tube: mark = 8·s + 9 with ε = 5. And more than two classes?</span></li>
    <li><b>Multiclass (11)</b><span>Q: Fail / Pass / Distinction? → One-vs-one: 3 pairwise SVMs vote; (4, 4) → Pass with 2 votes. But a score of +1 is not a probability…</span></li>
    <li><b>Probabilities (12)</b><span>Q: what is P(Pass)? → Platt's sigmoid on the score (f = 1 → 0.818), fitted on held-out data via CalibratedClassifierCV. And what does all this cost?</span></li>
    <li><b>Cost &amp; when to use (13)</b><span>Q: how big can the data be? → Kernel SVMs grow roughly as n² to n³; use LinearSVC or kernel approximations beyond ~100k rows; class_weight for imbalance. Then sklearn (14), from scratch (15), comparisons (16) and how it all connects (17).</span></li>
  </ol>
  <div class="bridge"><b>What this still can't tell us →</b> the ladder is only the map. <b>Next: the one-page Mind Map, then step 01.</b></div>

  <h2 id="svm-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Support Vector Machines</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Geometry</div>
        <ul>
          <li><b>Boundary</b> w·x + b = 0; predict sign(w·x + b)</li>
          <li><b>w</b> is perpendicular to the boundary; distance = |w·x + b| / ‖w‖</li>
          <li>Scale (w, b) so the nearest points have |w·x + b| = 1 → <b>margin = 2/‖w‖</b></li>
          <li>Six students: x1 + x2 = 4.5, w = (2/3, 2/3), b = −3, margin 2.121</li>
          <li>💡 The widest road between two villages</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Hard margin &amp; dual</div>
        <ul>
          <li><b>Primal</b>: min ½‖w‖² s.t. yᵢ(w·xᵢ + b) ≥ 1</li>
          <li><b>Dual</b>: max Σαᵢ − ½ΣΣαᵢαⱼyᵢyⱼ xᵢ·xⱼ, αᵢ ≥ 0, Σαᵢyᵢ = 0</li>
          <li><b>w = Σ αᵢyᵢxᵢ</b>; αᵢ &gt; 0 only for <b>support vectors</b></li>
          <li>Students: α = 2/9 (S2), 2/9 (S3), 4/9 (S4); ‖w‖² = Σα = 8/9</li>
          <li>Data enters only through dot products xᵢ·xⱼ</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Soft margin &amp; hinge</div>
        <ul>
          <li>min ½‖w‖² + C Σ ξᵢ, ξᵢ = max(0, 1 − yᵢfᵢ) = <b>hinge loss</b></li>
          <li>Small C: wide street, many SVs · large C: narrow, few violations</li>
          <li>S7 added: C=0.1 margin 3.143 · C=1 2.828 · C=10 0.707</li>
          <li>Dual: 0 ≤ αᵢ ≤ C (box); αᵢ = C → inside the street or wrong side</li>
          <li>vs logistic: hinge = 0 beyond the kerb, log loss never 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Kernels</div>
        <ul>
          <li><b>K(a, b) = φ(a)·φ(b)</b> without building φ: (a·b)² = 121 both ways</li>
          <li><b>Linear</b> a·b · <b>poly</b> (γa·b + r)^d · <b>RBF</b> exp(−γ‖a−b‖²) · sigmoid</li>
          <li>Burnt-out students: linear 0.667, poly / RBF 1.000</li>
          <li><b>γ</b> large → tiny bubbles, wiggly (overfit); small → smooth</li>
          <li>f(x) = Σ αᵢyᵢK(xᵢ, x) + b; tune C and γ together</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Variants</div>
        <ul>
          <li><b>SVR</b>: flattest f with |y − f| ≤ ε; ε-insensitive loss; marks = 8s + 9</li>
          <li><b>Multiclass</b>: SVC one-vs-one (k(k−1)/2 models, vote); LinearSVC one-vs-rest</li>
          <li><b>Probabilities</b>: Platt sigmoid; use <code>CalibratedClassifierCV(SVC(), ensemble=False)</code></li>
          <li>⚠ <code>probability=True</code> deprecated in sklearn 1.9</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Practice</div>
        <ul>
          <li>⚠ <b>Scale features</b>: wine RBF 0.663 raw → 0.983 scaled</li>
          <li>Kernel SVC ≈ O(n²)–O(n³) time, O(n²) kernel memory; great for n ≲ 50k</li>
          <li>Large n: LinearSVC, SGDClassifier(hinge), Nystroem + linear</li>
          <li><code>class_weight="balanced"</code>: minority recall 0.183 → 0.865</li>
          <li>Strong for high-d, small-n (text, genes); no native probabilities</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="svm-ladder"><span class="rm-num">★</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The story in 13 questions</span></div></div>
      <div class="rm-item rm-done" data-target="svm-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Widest Street</span><span class="rm-sub">Four lines on six students</span></div></div>
      <div class="rm-item rm-done" data-target="svm-geom"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hyperplane Geometry</span><span class="rm-sub">w·x + b, distance, 2/‖w‖</span></div></div>
      <div class="rm-item rm-done" data-target="svm-hard"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Hard Margin</span><span class="rm-sub">The primal, solved by hand</span></div></div>
      <div class="rm-item rm-done" data-target="svm-dual"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Support Vectors &amp; the Dual</span><span class="rm-sub">α by hand, KKT</span></div></div>
      <div class="rm-item rm-done" data-target="svm-soft"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Soft Margin &amp; C</span><span class="rm-sub">Slack for student S7</span></div></div>
      <div class="rm-item rm-done" data-target="svm-hinge"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Hinge Loss</span><span class="rm-sub">vs log loss and 0-1</span></div></div>
      <div class="rm-item rm-done" data-target="svm-kernel"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Kernel Trick</span><span class="rm-sub">Lift by hand, then skip the lift</span></div></div>
      <div class="rm-item rm-done" data-target="svm-kernels"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Kernels, γ and C</span><span class="rm-sub">Linear, poly, RBF, sigmoid</span></div></div>
      <div class="rm-item rm-done" data-target="svm-scale"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Feature Scaling</span><span class="rm-sub">Hours vs minutes</span></div></div>
      <div class="rm-item rm-done" data-target="svm-svr"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">SVR</span><span class="rm-sub">The ε-tube on marks</span></div></div>
      <div class="rm-item rm-done" data-target="svm-multi"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Multiclass</span><span class="rm-sub">One-vs-one, one-vs-rest</span></div></div>
      <div class="rm-item rm-done" data-target="svm-prob"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Probabilities &amp; Calibration</span><span class="rm-sub">Platt, the 1.9 deprecation</span></div></div>
      <div class="rm-item rm-done" data-target="svm-cost"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Cost &amp; When to Use</span><span class="rm-sub">n², LinearSVC, imbalance</span></div></div>
      <div class="rm-item rm-done" data-target="svm-sklearn"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">scikit-learn in Practice</span><span class="rm-sub">Every parameter, C × γ grid</span></div></div>
      <div class="rm-item rm-done" data-target="svm-scratch"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">QP and subgradient solvers</span></div></div>
      <div class="rm-item rm-done" data-target="svm-compare"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Strengths &amp; Comparisons</span><span class="rm-sub">vs logistic, KNN, trees</span></div></div>
      <div class="rm-item rm-done" data-target="svm-connect"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One chain, one table</span></div></div>
      <div class="rm-item rm-done" data-target="svm-traps"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Scaling, γ, probabilities</span></div></div>
      <div class="rm-item rm-done" data-target="svm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="svm-qa"><span class="rm-num">19</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="svm-idea"><span class="num">01</span>The Widest Street</h2>
  <p><strong>The question we can't answer yet:</strong> logistic regression gives us <em>a</em> straight line between Pass and Fail, and KNN gives a boundary made of votes. Neither asks how much room the boundary leaves. When several lines all separate the students perfectly, which one should we trust for the next student?</p>
  <h3>The need</h3>
  <p>The six students can be separated by many lines. All of them make zero mistakes on these six, so "accuracy on the training data" cannot choose. But a line that passes very close to a student is fragile: the next student who is a little different from that one lands on the wrong side.</p>
<figure class="viz"><svg viewBox="0 0 620 350" width="620">
<line x1="40.0" y1="310.0" x2="40.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="40.0" y="324.0" text-anchor="middle" class="tm" font-size="10">0</text>
<line x1="100.0" y1="310.0" x2="100.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="100.0" y="324.0" text-anchor="middle" class="tm" font-size="10">1</text>
<line x1="160.0" y1="310.0" x2="160.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="160.0" y="324.0" text-anchor="middle" class="tm" font-size="10">2</text>
<line x1="220.0" y1="310.0" x2="220.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="220.0" y="324.0" text-anchor="middle" class="tm" font-size="10">3</text>
<line x1="280.0" y1="310.0" x2="280.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="280.0" y="324.0" text-anchor="middle" class="tm" font-size="10">4</text>
<line x1="340.0" y1="310.0" x2="340.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="340.0" y="324.0" text-anchor="middle" class="tm" font-size="10">5</text>
<line x1="40.0" y1="310.0" x2="340.0" y2="310.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="314.0" text-anchor="end" class="tm" font-size="10">0</text>
<line x1="40.0" y1="250.0" x2="340.0" y2="250.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="254.0" text-anchor="end" class="tm" font-size="10">1</text>
<line x1="40.0" y1="190.0" x2="340.0" y2="190.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="194.0" text-anchor="end" class="tm" font-size="10">2</text>
<line x1="40.0" y1="130.0" x2="340.0" y2="130.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="134.0" text-anchor="end" class="tm" font-size="10">3</text>
<line x1="40.0" y1="70.0" x2="340.0" y2="70.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="74.0" text-anchor="end" class="tm" font-size="10">4</text>
<line x1="40.0" y1="10.0" x2="340.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="14.0" text-anchor="end" class="tm" font-size="10">5</text>
<line x1="40.0" y1="310.0" x2="340.0" y2="310.0" stroke="currentColor"/><line x1="40.0" y1="310.0" x2="40.0" y2="10.0" stroke="currentColor"/>
<text x="190.0" y="338.0" text-anchor="middle" font-size="11">hours</text>
<line x1="190.0" y1="310.0" x2="190.0" y2="10.0" stroke="currentColor" stroke-opacity="0.45" stroke-dasharray="6 4"/>
<line x1="40.0" y1="160.0" x2="340.0" y2="160.0" stroke="currentColor" stroke-opacity="0.45" stroke-dasharray="2 4"/>
<line x1="40.0" y1="70.0" x2="280.0" y2="310.0" class="sb" stroke-width="1.6"/>
<line x1="40.0" y1="40.0" x2="310.0" y2="310.0" class="sg" stroke-width="3"/>
<rect x="94.0" y="244.0" width="12" height="12" class="fr sr"/>
<rect x="154.0" y="244.0" width="12" height="12" class="fr sr"/>
<rect x="94.0" y="184.0" width="12" height="12" class="fr sr"/>
<circle cx="220.0" cy="130.0" r="6.5" class="fg sg"/>
<circle cx="280.0" cy="130.0" r="6.5" class="fg sg"/>
<circle cx="220.0" cy="70.0" r="6.5" class="fg sg"/>
<text x="109.0" y="265.0" font-size="10.5" class="tm">S1</text>
<text x="169.0" y="265.0" font-size="10.5" class="tm">S2</text>
<text x="109.0" y="205.0" font-size="10.5" class="tm">S3</text>
<text x="229.0" y="145.0" font-size="10.5" class="tm">S4</text>
<text x="289.0" y="145.0" font-size="10.5" class="tm">S5</text>
<text x="229.0" y="85.0" font-size="10.5" class="tm">S6</text>
<line x1="380" y1="40" x2="410" y2="40" stroke="currentColor" stroke-opacity="0.45" stroke-dasharray="6 4"/><text x="418" y="44" font-size="12">x1 = 2.5</text><text x="418" y="59" font-size="10.5" class="tm">closest student 0.500</text>
<line x1="380" y1="84" x2="410" y2="84" stroke="currentColor" stroke-opacity="0.45" stroke-dasharray="2 4"/><text x="418" y="88" font-size="12">x2 = 2.5</text><text x="418" y="103" font-size="10.5" class="tm">closest student 0.500</text>
<line x1="380" y1="128" x2="410" y2="128" class="sb" stroke-width="1.6"/><text x="418" y="132" font-size="12">x1 + x2 = 4</text><text x="418" y="147" font-size="10.5" class="tm">closest student 0.707</text>
<line x1="380" y1="172" x2="410" y2="172" class="sg" stroke-width="3"/><text x="418" y="176" font-size="12">x1 + x2 = 4.5</text><text x="418" y="191" font-size="10.5" class="tm">closest student 1.061 ★</text>
<circle cx="390" cy="230" r="6" class="fg sg"/><text x="402" y="234" font-size="12">Pass (+1)</text><rect x="384" y="250" width="12" height="12" class="fr sr"/><text x="402" y="260" font-size="12">Fail (−1)</text>
</svg><figcaption>The six students and four lines that all separate them perfectly. They differ in how close they pass to the nearest student. The green line x1 + x2 = 4.5 keeps every student at least 1.061 away: the widest street.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You are building the widest possible road between two villages. Only the houses right at the roadside decide where the road can go. Houses deep inside the villages do not matter: you could demolish them and the road would not move. Those roadside houses are the <strong>support vectors</strong>.</p>
  </div>
  <h3>By hand: how close does each line pass?</h3>
  <p>For each line we measure the distance of every student from it (the formula is derived in section 02) and keep the <strong>smallest</strong>, because the weakest point is what matters.</p>
  <table class="tbl">
    <tr><th>Line</th><th>S1 (1,1)</th><th>S2 (2,1)</th><th>S3 (1,2)</th><th>S4 (3,3)</th><th>S5 (4,3)</th><th>S6 (3,4)</th><th>Smallest</th></tr>
    <tr><td>hours = 2.5</td><td>1.5</td><td>0.5</td><td>1.5</td><td>0.5</td><td>1.5</td><td>0.5</td><td>0.500</td></tr>
    <tr><td>mocks = 2.5</td><td>1.5</td><td>1.5</td><td>0.5</td><td>0.5</td><td>0.5</td><td>1.5</td><td>0.500</td></tr>
    <tr><td>x1 + x2 = 4</td><td>1.414</td><td>0.707</td><td>0.707</td><td>1.414</td><td>2.121</td><td>2.121</td><td>0.707</td></tr>
    <tr><td><strong>x1 + x2 = 4.5</strong></td><td>1.768</td><td>1.061</td><td>1.061</td><td>1.061</td><td>1.768</td><td>1.768</td><td><strong>1.061</strong></td></tr>
  </table>
  <p>The vertical line hours = 2.5 passes 0.5 from S2, S4 and S6. The diagonal x1 + x2 = 4 is better (0.707) but sits closer to the Fail side. The diagonal x1 + x2 = 4.5, exactly halfway between the Fail students' best total (3) and the Pass students' worst total (6), keeps everyone at least 1.061 away. That is the SVM's choice.</p>
<div class="fx" data-lang="py">import numpy as np
X6 = np.array([[1, 1], [2, 1], [1, 2], [3, 3], [4, 3], [3, 4]], dtype=float)   # (hours, mocks)
y6 = np.array([-1, -1, -1, 1, 1, 1])                                         # -1 = Fail, +1 = Pass
lines = {"x1 = 2.5":      (np.array([1, 0]), -2.5),
         "x2 = 2.5":      (np.array([0, 1]), -2.5),
         "x1 + x2 = 4":   (np.array([1, 1]), -4.0),
         "x1 + x2 = 4.5": (np.array([1, 1]), -4.5)}
for name, (w, b) in lines.items():
    dist = y6 * (X6 @ w + b) / np.linalg.norm(w)        # signed distance, positive = correct side
    print(f"{name:14s} distances {dist.round(3)}  all correct: {bool((dist &gt; 0).all())}  smallest: {dist.min():.3f}")</div>
<div class="fx" data-lang="text">x1 = 2.5       distances [1.5 0.5 1.5 0.5 1.5 0.5]  all correct: True  smallest: 0.500
x2 = 2.5       distances [1.5 1.5 0.5 0.5 0.5 1.5]  all correct: True  smallest: 0.500
x1 + x2 = 4    distances [1.414 0.707 0.707 1.414 2.121 2.121]  all correct: True  smallest: 0.707
x1 + x2 = 4.5  distances [1.768 1.061 1.061 1.061 1.768 1.768]  all correct: True  smallest: 1.061</div>
  <p>All four lines put every student on the correct side ("all correct: True"); the last column is what separates them. The SVM picks the line that <strong>maximises the smallest distance</strong>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>margin</strong> of a separating line is the distance from the line to the closest training point; the street between the two classes is twice that wide. A <strong>maximum-margin classifier</strong> chooses, among all separating lines (hyperplanes in more dimensions), the one with the largest margin. The training points at that closest distance are the <strong>support vectors</strong>.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Why should the widest street generalise better? A new student is like an old one plus a little noise. If every training student is at least 1.061 from the line, a new student must differ from them by more than 1.061 to cross it. A wider margin means more tolerance for noise. Statistical learning theory makes this precise: the margin, not the number of features, controls how complex the classifier really is.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"The SVM finds the line with the highest accuracy." No: all four lines above have 100% training accuracy. The SVM optimises the margin, and with a soft margin (section 05) it may even accept some training mistakes to keep a wider street.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we measured distances with a formula we have not explained, and we only compared four hand-picked lines. <b>Next: the geometry of w·x + b, so the distance and the margin become formulas.</b></div>

  <h2 id="svm-geom"><span class="num">02</span>Hyperplane Geometry by Hand</h2>
  <p><strong>The question we can't answer yet:</strong> how do we write a line so that a computer can (a) decide which side a student is on and (b) measure how far away the student is, in any number of dimensions?</p>
  <h3>A line as w·x + b = 0</h3>
  <p>Write the boundary as w·x + b = 0, where w = (w₁, w₂) is a vector of weights and b a number. For the green line, w = (1, 1) and b = −4.5: the line is 1·hours + 1·mocks − 4.5 = 0, i.e. x1 + x2 = 4.5. Every point gets a <strong>score</strong> f(x) = w·x + b.</p>
  <ul>
    <li>f(x) &gt; 0: Pass side. S4: 3 + 3 − 4.5 = +1.5.</li>
    <li>f(x) &lt; 0: Fail side. S1: 1 + 1 − 4.5 = −2.5.</li>
    <li>f(x) = 0: on the line, e.g. (2.25, 2.25).</li>
  </ul>
  <p>In 3 dimensions w·x + b = 0 is a flat plane, in d dimensions a <strong>hyperplane</strong>; the formulas do not change.</p>
  <h3>w points across the line</h3>
  <p>Take two points on the line, p = (2, 2.5) and q = (2.5, 2). Their difference p − q = (−0.5, 0.5) runs along the line. w·(p − q) = 1×(−0.5) + 1×0.5 = 0, so w is perpendicular to every direction along the line. w is the line's <strong>normal vector</strong>, pointing toward the Pass side.</p>
  <h3>Deriving the distance formula</h3>
  <p>Start from a point x and walk straight toward the line along w until you hit it. The unit vector in w's direction is w/‖w‖. Walking a distance r changes the score by r·‖w‖ (because w·(r·w/‖w‖) = r‖w‖²/‖w‖ = r‖w‖). To reduce the score from f(x) to 0 we need r = f(x)/‖w‖. So:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Distance from x to the hyperplane w·x + b = 0</strong>: d = |w·x + b| / ‖w‖, where ‖w‖ = √(w₁² + w₂² + …). The sign of w·x + b tells the side; for a labelled point, yᵢ(w·xᵢ + b)/‖w‖ is positive when it is on the correct side (this is the <em>geometric margin</em> of the point).</p>
  </div>
  <p>By hand with w = (1, 1), ‖w‖ = √2 = 1.414: S4 has score 1.5 → distance 1.5/1.414 = <strong>1.061</strong>; S1 has score −2.5 → 2.5/1.414 = <strong>1.768</strong>. The origin (0,0) has score −4.5 → 3.182 from the line.</p>
  <h3>The same line has many (w, b): fix the scale</h3>
  <p>Multiply w and b by any positive number and the line does not move: (2/3)·(x1 + x2 − 4.5) = 0 is the same line as x1 + x2 − 4.5 = 0. The scores change, the distances do not. The SVM uses this freedom to fix one convenient scale: <strong>choose (w, b) so that the closest students have score exactly ±1</strong>. Here the closest score was ±1.5, so divide by 1.5: w = (2/3, 2/3), b = −3. Now S2, S3 score −1 and S4 scores +1.</p>
<div class="fx" data-lang="py">for w, b in [(np.array([1.0, 1.0]), -4.5), (np.array([2 / 3, 2 / 3]), -3.0)]:
    f = X6 @ w + b                                       # the score w.x + b of every student
    print(f"w={w.round(3)} b={b}:  w.x+b = {f.round(3)}   distance |w.x+b|/||w|| = {(np.abs(f) / np.linalg.norm(w)).round(3)}")
print("origin's distance |b|/||w|| =", round(4.5 / np.sqrt(2), 3))</div>
<div class="fx" data-lang="text">w=[1. 1.] b=-4.5:  w.x+b = [-2.5 -1.5 -1.5  1.5  2.5  2.5]   distance |w.x+b|/||w|| = [1.768 1.061 1.061 1.061 1.768 1.768]
w=[0.667 0.667] b=-3.0:  w.x+b = [-1.667 -1.    -1.     1.     1.667  1.667]   distance |w.x+b|/||w|| = [1.768 1.061 1.061 1.061 1.768 1.768]
origin's distance |b|/||w|| = 3.182</div>
  <p>Both rows describe the same line: scores differ by the factor 1.5, distances are identical. In the second, the three closest students have score exactly ±1.</p>
  <h3>Margin = 2/‖w‖</h3>
  <p>With that scaling, the two kerbs of the street are the lines w·x + b = +1 and w·x + b = −1. A point on the +1 kerb is 1/‖w‖ from the centre line (distance formula with |f| = 1), and the same on the −1 side. The street is <strong>2/‖w‖</strong> wide. Here ‖w‖ = √((2/3)² + (2/3)²) = 0.943, so the width is 2/0.943 = <strong>2.121</strong>, twice 1.061.</p>
<figure class="viz"><svg viewBox="0 0 620 350" width="620">
<defs><marker id="svm-w" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="tb"/></marker></defs>
<line x1="40.0" y1="310.0" x2="40.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="40.0" y="324.0" text-anchor="middle" class="tm" font-size="10">0</text>
<line x1="100.0" y1="310.0" x2="100.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="100.0" y="324.0" text-anchor="middle" class="tm" font-size="10">1</text>
<line x1="160.0" y1="310.0" x2="160.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="160.0" y="324.0" text-anchor="middle" class="tm" font-size="10">2</text>
<line x1="220.0" y1="310.0" x2="220.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="220.0" y="324.0" text-anchor="middle" class="tm" font-size="10">3</text>
<line x1="280.0" y1="310.0" x2="280.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="280.0" y="324.0" text-anchor="middle" class="tm" font-size="10">4</text>
<line x1="340.0" y1="310.0" x2="340.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="340.0" y="324.0" text-anchor="middle" class="tm" font-size="10">5</text>
<line x1="40.0" y1="310.0" x2="340.0" y2="310.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="314.0" text-anchor="end" class="tm" font-size="10">0</text>
<line x1="40.0" y1="250.0" x2="340.0" y2="250.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="254.0" text-anchor="end" class="tm" font-size="10">1</text>
<line x1="40.0" y1="190.0" x2="340.0" y2="190.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="194.0" text-anchor="end" class="tm" font-size="10">2</text>
<line x1="40.0" y1="130.0" x2="340.0" y2="130.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="134.0" text-anchor="end" class="tm" font-size="10">3</text>
<line x1="40.0" y1="70.0" x2="340.0" y2="70.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="74.0" text-anchor="end" class="tm" font-size="10">4</text>
<line x1="40.0" y1="10.0" x2="340.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="34.0" y="14.0" text-anchor="end" class="tm" font-size="10">5</text>
<line x1="40.0" y1="310.0" x2="340.0" y2="310.0" stroke="currentColor"/><line x1="40.0" y1="310.0" x2="40.0" y2="10.0" stroke="currentColor"/>
<text x="190.0" y="338.0" text-anchor="middle" font-size="11">hours</text>
<polygon points="40.0,130.0 220.0,310.0 340.0,310.0 340.0,250.0 100.0,10.0 40.0,10.0" class="fb" fill-opacity="0.35"/>
<line x1="40.0" y1="130.0" x2="220.0" y2="310.0" stroke="currentColor" stroke-dasharray="5 4"/>
<line x1="100.0" y1="10.0" x2="340.0" y2="250.0" stroke="currentColor" stroke-dasharray="5 4"/>
<line x1="40.0" y1="40.0" x2="310.0" y2="310.0" class="sg" stroke-width="3"/>
<rect x="94.0" y="244.0" width="12" height="12" class="fr sr"/>
<rect x="154.0" y="244.0" width="12" height="12" class="fr sr"/>
<circle cx="160.0" cy="250.0" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="94.0" y="184.0" width="12" height="12" class="fr sr"/>
<circle cx="100.0" cy="190.0" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="220.0" cy="130.0" r="6.5" class="fg sg"/>
<circle cx="220.0" cy="130.0" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="280.0" cy="130.0" r="6.5" class="fg sg"/>
<circle cx="220.0" cy="70.0" r="6.5" class="fg sg"/>
<line x1="175.0" y1="175.0" x2="217.0" y2="133.0" class="sb" stroke-width="2.2" marker-end="url(#svm-w)"/><text x="179.0" y="145.0" class="tb" font-size="12" text-anchor="end">w</text>
<line x1="130.0" y1="220.0" x2="220.0" y2="130.0" class="sr" stroke-width="1.5"/>
<text x="202.0" y="196.0" font-size="11" class="tr">margin 2/‖w‖ = 2.121</text>
<text x="380" y="40" font-size="12">solid: w·x + b = 0  (x1 + x2 = 4.5)</text>
<text x="380" y="62" font-size="12">dashed: w·x + b = −1 and +1</text>
<text x="380" y="78" font-size="10.5" class="tm">(x1 + x2 = 3 and x1 + x2 = 6)</text>
<text x="380" y="102" font-size="12">w = (2/3, 2/3), b = −3</text>
<text x="380" y="126" font-size="12">ringed: support vectors</text>
<text x="380" y="142" font-size="10.5" class="tm">S2 (2,1), S3 (1,2), S4 (3,3)</text>
<text x="380" y="170" font-size="12" class="tb">w is perpendicular to the line</text>
</svg><figcaption>The hard-margin SVM on the six students. The street between the dashed kerbs is as wide as possible (2.121). Only the three ringed students touch the kerbs; delete S1, S5 or S6 and nothing moves.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The raw score w·x + b is <em>not</em> a distance and not a probability. Multiplying w and b by 10 multiplies every score by 10 and changes nothing about the line. Only |w·x + b|/‖w‖ is a distance, and only after calibration (section 12) does a score become a probability.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we can measure the street for any given line, but we found the best line by trying four. <b>Next: state "widest street" as an optimisation problem and solve it.</b></div>

  <h2 id="svm-hard"><span class="num">03</span>Hard Margin: the Optimisation Problem</h2>
  <p><strong>The question we can't answer yet:</strong> there are infinitely many lines. How do we find the one with the widest street without trying them all, and how would a computer do it in 100 dimensions?</p>
  <h3>From "widest street" to a clean problem</h3>
  <ol>
    <li>We want to maximise the width 2/‖w‖.</li>
    <li>Subject to: every student on the correct side and outside the street. With the ±1 scaling this is yᵢ(w·xᵢ + b) ≥ 1 for every i (Pass students score ≥ +1, Fail students ≤ −1).</li>
    <li>Maximising 2/‖w‖ is the same as minimising ‖w‖, which is the same as minimising ½‖w‖² (squaring removes the square root; ½ makes the derivative tidy). That is a smooth bowl, so there is exactly one best answer.</li>
  </ol>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hard-margin SVM (primal)</strong>: minimise ½‖w‖² over w, b, subject to yᵢ(w·xᵢ + b) ≥ 1 for all training points i. It is a <strong>convex quadratic program</strong>: a quadratic bowl with linear constraints, so any local minimum is the global one. It has a solution only if the classes are linearly separable.</p>
  </div>
  <h3>Solving it by hand for the six students</h3>
  <p>By symmetry (the data is mirror-symmetric across the line hours = mocks) the best w has equal parts: w = (a, a). The score is a·(x1 + x2) + b, so only the total x1 + x2 matters. Fail totals: 2, 3, 3; Pass totals: 6, 7, 7. The constraints that can bind are the closest ones:</p>
  <ul>
    <li>Fail with total 3 (S2, S3): a·3 + b ≤ −1.</li>
    <li>Pass with total 6 (S4): a·6 + b ≥ +1.</li>
  </ul>
  <p>To make ‖w‖ = a√2 as small as possible we want a small, so both constraints are tight: 3a + b = −1 and 6a + b = 1. Subtract: 3a = 2, so <strong>a = 2/3</strong>, and b = −1 − 3·(2/3) = <strong>−3</strong>. Check the other students: S1 total 2 → (2/3)·2 − 3 = −1.667 ≤ −1 ✓; S5, S6 total 7 → +1.667 ≥ 1 ✓. ‖w‖ = (2/3)√2 = 0.943, margin 2.121.</p>
<div class="fx" data-lang="py">from sklearn.svm import SVC
hard = SVC(kernel="linear", C=1e6, tol=1e-10).fit(X6, y6)   # huge C: no violations; tight tol: exact answer
w, b = hard.coef_[0], hard.intercept_[0]
print("w =", w.round(4), " b =", round(b, 4), " ||w|| =", round(np.linalg.norm(w), 4), " margin 2/||w|| =", round(2 / np.linalg.norm(w), 4))
print("support vectors:", hard.support_vectors_.tolist(), " indices:", hard.support_)
print("y(w.x+b) for every student:", (y6 * (X6 @ w + b)).round(3))</div>
<div class="fx" data-lang="text">w = [0.6667 0.6667]  b = -3.0  ||w|| = 0.9428  margin 2/||w|| = 2.1213
support vectors: [[2.0, 1.0], [1.0, 2.0], [3.0, 3.0]]  indices: [1 2 3]
y(w.x+b) for every student: [1.667 1.    1.    1.    1.667 1.667]</div>
  <p>sklearn (with a huge C, which forbids violations, and a tight tolerance) gives exactly w = (2/3, 2/3), b = −3, margin 2.121, and lists S2, S3, S4 (rows 1, 2, 3) as support vectors: the three students with y·f = 1 exactly. S1, S5, S6 have 1.667: safely beyond the kerbs.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Hard margin has no solution if even one point is on the wrong side, and it lets a single odd point squeeze the street to almost nothing. Real data always needs the soft margin of section 05. sklearn has no "hard margin" switch; a very large C imitates it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> only three of the six students ended up mattering. Why exactly those three, and is there a way to see that from the problem itself? <b>Next: the dual problem and support vectors.</b></div>

  <h2 id="svm-dual"><span class="num">04</span>Support Vectors and the Dual</h2>
  <p><strong>The question we can't answer yet:</strong> the line was decided by S2, S3 and S4 alone. How does the mathematics "know" which points matter, how much each one matters, and why is this the key to kernels later?</p>
  <h3>Lagrange multipliers in plain words</h3>
  <p>A constrained problem can be turned into an unconstrained one by giving every constraint a "price" αᵢ ≥ 0 (a Lagrange multiplier; see <a class="xref" data-note="m_optimization">Optimization</a>). The Lagrangian is</p>
  <p>L(w, b, α) = ½‖w‖² − Σᵢ αᵢ [yᵢ(w·xᵢ + b) − 1].</p>
  <p>Setting the derivatives with respect to w and b to zero gives two famous equations:</p>
  <ul>
    <li>∂L/∂w = 0 → <strong>w = Σᵢ αᵢ yᵢ xᵢ</strong>: the weight vector is a weighted sum of training points.</li>
    <li>∂L/∂b = 0 → <strong>Σᵢ αᵢ yᵢ = 0</strong>: the prices on the two sides balance.</li>
  </ul>
  <p>And the optimality (KKT) conditions add <strong>complementary slackness</strong>: αᵢ · [yᵢ(w·xᵢ + b) − 1] = 0. Either a point is exactly on its kerb, or its price is zero. Points beyond the kerb get αᵢ = 0 and vanish from w. The points with αᵢ &gt; 0 are the support vectors.</p>
  <h3>The α values by hand</h3>
  <p>Only S2 (2,1), S3 (1,2) and S4 (3,3) can have α &gt; 0. By symmetry α₂ = α₃ = α. Balance: α₄·(+1) + α·(−1) + α·(−1) = 0, so α₄ = 2α. Now w = Σ αᵢyᵢxᵢ:</p>
  <p>w = 2α·(3, 3) − α·(2, 1) − α·(1, 2) = (6α − 3α, 6α − 3α) = (3α, 3α). We know w = (2/3, 2/3), so 3α = 2/3, <strong>α = 2/9 = 0.222</strong> and <strong>α₄ = 4/9 = 0.444</strong>.</p>
  <p>A neat check for hard margins: ‖w‖² = Σαᵢ. Here ‖w‖² = 8/9 = 0.889 and Σα = 2/9 + 2/9 + 4/9 = 8/9 ✓. S4 carries twice the weight of S2 or S3 because it alone holds the Pass kerb against two Fail students.</p>
<div class="fx" data-lang="py">print("dual_coef_ (= alpha_i * y_i, support vectors only):", hard.dual_coef_.round(4))
alpha = np.abs(hard.dual_coef_[0])
sv, ysv = hard.support_vectors_, y6[hard.support_]
print("alphas:", alpha.round(4), " sum(alpha*y) =", round(float((alpha * ysv).sum()), 6))
print("w rebuilt = sum(alpha*y*x):", ((alpha * ysv) @ sv).round(4), "  ||w||^2 =", round(np.linalg.norm(w) ** 2, 4), " sum(alpha) =", round(alpha.sum(), 4))
xnew = np.array([3.0, 2.0])
print("f(3,2) via dual:", round(float((alpha * ysv) @ (sv @ xnew) + b), 4), "  via w:", round(float(w @ xnew + b), 4))</div>
<div class="fx" data-lang="text">dual_coef_ (= alpha_i * y_i, support vectors only): [[-0.2222 -0.2222  0.4444]]
alphas: [0.2222 0.2222 0.4444]  sum(alpha*y) = 0.0
w rebuilt = sum(alpha*y*x): [0.6667 0.6667]   ||w||^2 = 0.8889  sum(alpha) = 0.8889
f(3,2) via dual: 0.3333   via w: 0.3333</div>
  <p>sklearn stores αᵢyᵢ for support vectors only in <code>dual_coef_</code>: −0.2222, −0.2222, +0.4444, exactly the hand values. Rebuilding w from them gives (2/3, 2/3). The last line scores a new student (3, 2) two ways: through w, and through the dual form, which uses only dot products with the three support vectors.</p>
  <h3>The dual problem: only dot products</h3>
  <p>Substituting w = Σαᵢyᵢxᵢ back into L removes w and b and leaves a problem in α alone:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Dual SVM</strong>: maximise Σᵢ αᵢ − ½ Σᵢ Σⱼ αᵢ αⱼ yᵢ yⱼ (xᵢ·xⱼ) subject to αᵢ ≥ 0 and Σᵢ αᵢyᵢ = 0. Prediction: f(x) = Σᵢ αᵢ yᵢ (xᵢ·x) + b, summing over support vectors only. <strong>Support vectors</strong> are the training points with αᵢ &gt; 0.</p>
  </div>
  <p>By hand for the new student (3, 2): dot products with the support vectors: (2,1)·(3,2) = 8, (1,2)·(3,2) = 7, (3,3)·(3,2) = 15. f = −(2/9)·8 − (2/9)·7 + (4/9)·15 − 3 = −1.778 − 1.556 + 6.667 − 3 = <strong>0.333</strong> → Pass, just inside the street. Same as w·x + b = (2/3)·5 − 3 = 0.333.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Look at what the dual needs: never the points themselves, only the dot products xᵢ·xⱼ between pairs. That single fact is what makes the kernel trick (section 07) possible: replace every dot product by a kernel K(xᵢ, xⱼ) and the SVM works in a lifted space it never builds.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Support vectors are the points closest to the other class." Close, but the definition is αᵢ &gt; 0. With a soft margin they include every point on the kerb, inside the street or misclassified; there can be many (416 of 420 on noisy data with tiny C, section 08).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> everything so far assumed a perfect, empty street exists. One awkward student can destroy it. <b>Next: soft margins, slack and C.</b></div>

  <h2 id="svm-soft"><span class="num">05</span>Soft Margin, Slack and C</h2>
  <p><strong>The question we can't answer yet:</strong> a seventh student, S7, studied 2.5 hours and took 2.5 mocks, and failed. S7's total effort is 5, more than the centre of our street (4.5), so the six-student line puts S7 on the Pass side, inside the street. Should the street squeeze until S7 fits, or should we accept one awkward student and keep a wide street?</p>
  <h3>Slack: paying for violations</h3>
  <p>Give every student a slack ξᵢ ≥ 0 that measures how far it intrudes: yᵢ(w·xᵢ + b) ≥ 1 − ξᵢ. ξ = 0: beyond the kerb (no cost). 0 &lt; ξ &lt; 1: inside the street but on the correct side. ξ &gt; 1: on the wrong side. Each unit of slack costs C.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Soft-margin SVM</strong>: minimise ½‖w‖² + C Σᵢ ξᵢ subject to yᵢ(w·xᵢ + b) ≥ 1 − ξᵢ and ξᵢ ≥ 0. At the optimum ξᵢ = max(0, 1 − yᵢ(w·xᵢ + b)). <strong>C</strong> is the price of one unit of violation: small C = wide street, more violations tolerated; large C = narrow street, few violations.</p>
  </div>
  <h3>By hand: three candidate lines at C = 1</h3>
  <table class="tbl">
    <tr><th>Candidate</th><th>½‖w‖²</th><th>Slacks (who pays)</th><th>Objective at C = 1</th></tr>
    <tr><td>Old six-student line: w = (2/3, 2/3), b = −3</td><td>½ · 8/9 = 0.444</td><td>S7: score (2/3)·5 − 3 = 0.333, y·f = −0.333 → ξ = 1.333</td><td>0.444 + 1.333 = 1.778</td></tr>
    <tr><td>Narrow line: w = (2, 2), b = −11 (x1 + x2 = 5.5)</td><td>½ · 8 = 4.000</td><td>none: S7 scores −1, S4 scores +1</td><td>4.000</td></tr>
    <tr><td>sklearn's answer: w = (0.5, 0.5), b = −2.5 (x1 + x2 = 5)</td><td>½ · 0.5 = 0.250</td><td>S4: y·f = 0.5 → ξ = 0.5; S7: y·f = 0 → ξ = 1</td><td>0.25 + 1.5 = <strong>1.750</strong></td></tr>
  </table>
  <p>At C = 1 the narrow line that obeys every student costs 4.0, while tolerating S7 costs about 1.75. The SVM prefers the wide street and pays for S7. Raise C to 10 and violations become expensive: 0.25 + 10 × 1.5 = 15.25 for the wide line versus 4.0 for the narrow one, so the narrow line wins.</p>
<div class="fx" data-lang="py">X7 = np.vstack([X6, [2.5, 2.5]])                     # student 7: 2.5 hours, 2.5 mocks, failed
y7 = np.append(y6, -1)
print(" C      w             b       margin   slacks xi (students 1..7)            objective")
for C in [0.1, 1, 2, 10]:
    m = SVC(kernel="linear", C=C, tol=1e-10).fit(X7, y7)
    w, b = m.coef_[0], m.intercept_[0]
    xi = np.maximum(0, 1 - y7 * (X7 @ w + b))           # hinge loss of every student
    obj = 0.5 * w @ w + C * xi.sum()
    print(f"{C:&lt;5}  {w.round(3)}  {b:7.3f}   {2 / np.linalg.norm(w):.3f}    {xi.round(2)}   {obj:.3f}")</div>
<div class="fx" data-lang="text"> C      w             b       margin   slacks xi (students 1..7)            objective
0.1    [0.45 0.45]   -2.250   3.143    [0.   0.1  0.1  0.55 0.1  0.1  1.  ]   0.398
1      [0.5 0.5]   -2.500   2.828    [0.  0.  0.  0.5 0.  0.  1. ]   1.750
2      [1. 1.]   -5.500   1.414    [0.  0.  0.  0.5 0.  0.  0.5]   3.000
10     [2. 2.]  -11.000   0.707    [0. 0. 0. 0. 0. 0. 0.]   4.000</div>
<figure class="viz"><svg viewBox="0 0 640 305" width="640">
<line x1="30.0" y1="240.0" x2="30.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="30.0" y="254.0" text-anchor="middle" class="tm" font-size="10">0</text>
<line x1="76.0" y1="240.0" x2="76.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="76.0" y="254.0" text-anchor="middle" class="tm" font-size="10">1</text>
<line x1="122.0" y1="240.0" x2="122.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="122.0" y="254.0" text-anchor="middle" class="tm" font-size="10">2</text>
<line x1="168.0" y1="240.0" x2="168.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="168.0" y="254.0" text-anchor="middle" class="tm" font-size="10">3</text>
<line x1="214.0" y1="240.0" x2="214.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="214.0" y="254.0" text-anchor="middle" class="tm" font-size="10">4</text>
<line x1="260.0" y1="240.0" x2="260.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="260.0" y="254.0" text-anchor="middle" class="tm" font-size="10">5</text>
<line x1="30.0" y1="240.0" x2="260.0" y2="240.0" stroke="currentColor" stroke-opacity="0.07"/><text x="24.0" y="244.0" text-anchor="end" class="tm" font-size="10">0</text>
<line x1="30.0" y1="194.0" x2="260.0" y2="194.0" stroke="currentColor" stroke-opacity="0.07"/><text x="24.0" y="198.0" text-anchor="end" class="tm" font-size="10">1</text>
<line x1="30.0" y1="148.0" x2="260.0" y2="148.0" stroke="currentColor" stroke-opacity="0.07"/><text x="24.0" y="152.0" text-anchor="end" class="tm" font-size="10">2</text>
<line x1="30.0" y1="102.0" x2="260.0" y2="102.0" stroke="currentColor" stroke-opacity="0.07"/><text x="24.0" y="106.0" text-anchor="end" class="tm" font-size="10">3</text>
<line x1="30.0" y1="56.0" x2="260.0" y2="56.0" stroke="currentColor" stroke-opacity="0.07"/><text x="24.0" y="60.0" text-anchor="end" class="tm" font-size="10">4</text>
<line x1="30.0" y1="10.0" x2="260.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="24.0" y="14.0" text-anchor="end" class="tm" font-size="10">5</text>
<line x1="30.0" y1="240.0" x2="260.0" y2="240.0" stroke="currentColor"/><line x1="30.0" y1="240.0" x2="30.0" y2="10.0" stroke="currentColor"/>
<text x="145.0" y="268.0" text-anchor="middle" font-size="11">hours</text>
<line x1="30.0" y1="112.2" x2="157.8" y2="240.0" stroke="currentColor" stroke-dasharray="5 4"/>
<line x1="132.2" y1="10.0" x2="260.0" y2="137.8" stroke="currentColor" stroke-dasharray="5 4"/>
<line x1="30.0" y1="10.0" x2="260.0" y2="240.0" class="sg" stroke-width="2.6"/>
<rect x="70.0" y="188.0" width="12" height="12" class="fr sr"/>
<rect x="116.0" y="188.0" width="12" height="12" class="fr sr"/>
<rect x="70.0" y="142.0" width="12" height="12" class="fr sr"/>
<circle cx="168.0" cy="102.0" r="6.5" class="fg sg"/>
<circle cx="214.0" cy="102.0" r="6.5" class="fg sg"/>
<circle cx="168.0" cy="56.0" r="6.5" class="fg sg"/>
<rect x="139.0" y="119.0" width="12" height="12" class="fr sr"/>
<circle cx="145.0" cy="125.0" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="145" y="282" text-anchor="middle" font-size="12.5" font-weight="700">C = 0.1: margin 3.143</text>
<line x1="350.0" y1="240.0" x2="350.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="350.0" y="254.0" text-anchor="middle" class="tm" font-size="10">0</text>
<line x1="396.0" y1="240.0" x2="396.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="396.0" y="254.0" text-anchor="middle" class="tm" font-size="10">1</text>
<line x1="442.0" y1="240.0" x2="442.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="442.0" y="254.0" text-anchor="middle" class="tm" font-size="10">2</text>
<line x1="488.0" y1="240.0" x2="488.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="488.0" y="254.0" text-anchor="middle" class="tm" font-size="10">3</text>
<line x1="534.0" y1="240.0" x2="534.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="534.0" y="254.0" text-anchor="middle" class="tm" font-size="10">4</text>
<line x1="580.0" y1="240.0" x2="580.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="580.0" y="254.0" text-anchor="middle" class="tm" font-size="10">5</text>
<line x1="350.0" y1="240.0" x2="580.0" y2="240.0" stroke="currentColor" stroke-opacity="0.07"/><text x="344.0" y="244.0" text-anchor="end" class="tm" font-size="10">0</text>
<line x1="350.0" y1="194.0" x2="580.0" y2="194.0" stroke="currentColor" stroke-opacity="0.07"/><text x="344.0" y="198.0" text-anchor="end" class="tm" font-size="10">1</text>
<line x1="350.0" y1="148.0" x2="580.0" y2="148.0" stroke="currentColor" stroke-opacity="0.07"/><text x="344.0" y="152.0" text-anchor="end" class="tm" font-size="10">2</text>
<line x1="350.0" y1="102.0" x2="580.0" y2="102.0" stroke="currentColor" stroke-opacity="0.07"/><text x="344.0" y="106.0" text-anchor="end" class="tm" font-size="10">3</text>
<line x1="350.0" y1="56.0" x2="580.0" y2="56.0" stroke="currentColor" stroke-opacity="0.07"/><text x="344.0" y="60.0" text-anchor="end" class="tm" font-size="10">4</text>
<line x1="350.0" y1="10.0" x2="580.0" y2="10.0" stroke="currentColor" stroke-opacity="0.07"/><text x="344.0" y="14.0" text-anchor="end" class="tm" font-size="10">5</text>
<line x1="350.0" y1="240.0" x2="580.0" y2="240.0" stroke="currentColor"/><line x1="350.0" y1="240.0" x2="350.0" y2="10.0" stroke="currentColor"/>
<text x="465.0" y="268.0" text-anchor="middle" font-size="11">hours</text>
<line x1="350.0" y1="10.0" x2="580.0" y2="240.0" stroke="currentColor" stroke-dasharray="5 4"/>
<line x1="396.0" y1="10.0" x2="580.0" y2="194.0" stroke="currentColor" stroke-dasharray="5 4"/>
<line x1="373.0" y1="10.0" x2="580.0" y2="217.0" class="sg" stroke-width="2.6"/>
<rect x="390.0" y="188.0" width="12" height="12" class="fr sr"/>
<rect x="436.0" y="188.0" width="12" height="12" class="fr sr"/>
<rect x="390.0" y="142.0" width="12" height="12" class="fr sr"/>
<circle cx="488.0" cy="102.0" r="6.5" class="fg sg"/>
<circle cx="534.0" cy="102.0" r="6.5" class="fg sg"/>
<circle cx="488.0" cy="56.0" r="6.5" class="fg sg"/>
<rect x="459.0" y="119.0" width="12" height="12" class="fr sr"/>
<circle cx="465.0" cy="125.0" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="465" y="282" text-anchor="middle" font-size="12.5" font-weight="700">C = 10: margin 0.707</text>
<text x="145" y="296" text-anchor="middle" font-size="10.5" class="tm">wide street, S7 and others inside it</text>
<text x="465" y="296" text-anchor="middle" font-size="10.5" class="tm">narrow street, nobody inside</text>
</svg><figcaption>Student S7 (2.5, 2.5, Fail, ringed) sits among the Pass students. Small C (left) accepts paying for S7 and a few others to keep a wide street; large C (right) squeezes the street to 0.707 so that every student is on the correct side.</figcaption></figure>
  <p>Read the table from top to bottom. C = 0.1: the widest street (3.143), five students pay a little and S7 pays 1. C = 1 and 2: narrower. C = 10: the street shrinks to 0.707 and nobody pays, which is the hard-margin answer for seven students. In the dual, soft margin only adds an upper limit: <strong>0 ≤ αᵢ ≤ C</strong>. Points with αᵢ = C are the ones inside the street or on the wrong side.</p>
  <table class="tbl">
    <tr><th>C</th><th>Street</th><th>Support vectors</th><th>Risk</th></tr>
    <tr><td>small (0.01–0.1)</td><td>wide; many points inside</td><td>many</td><td>underfit: ignores real structure</td></tr>
    <tr><td>medium (1)</td><td>balanced</td><td>moderate</td><td>usually the best starting point (sklearn default)</td></tr>
    <tr><td>large (100+)</td><td>narrow; bends around single points</td><td>few, but each decisive</td><td>overfit to noise or mislabelled rows</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>C is the <em>inverse</em> of regularisation strength, like C in LogisticRegression and unlike α in Ridge. "Increase C to regularise more" is backwards. Also, the best C depends on the number of rows (the slack sum grows with n), so re-tune C when the dataset size changes a lot.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we wrote the SVM as "margin + C × slacks". How does that compare with logistic regression, which we know as "penalty + log loss"? <b>Next: the hinge loss.</b></div>

  <h2 id="svm-hinge"><span class="num">06</span>Hinge Loss: the SVM as Penalty + Loss</h2>
  <p><strong>The question we can't answer yet:</strong> logistic regression minimises a loss (log loss) plus a penalty on the weights. Is the SVM a completely different animal, or the same recipe with a different loss? And what difference does the loss make?</p>
  <h3>The slack is a loss</h3>
  <p>At the optimum ξᵢ = max(0, 1 − yᵢf(xᵢ)). So the soft-margin problem is simply</p>
  <p><strong>minimise ½‖w‖² + C Σᵢ max(0, 1 − yᵢ f(xᵢ))</strong>, where f(x) = w·x + b.</p>
  <p>The term max(0, 1 − z) with z = y·f is the <strong>hinge loss</strong>. Dividing by C·n shows it is the same shape as regularised logistic regression: average loss + λ‖w‖², with λ = 1/(2Cn).</p>
  <h3>By hand on the seven students (C = 1 line, f = 0.5·(x1 + x2) − 2.5)</h3>
  <table class="tbl">
    <tr><th>Student</th><th>y</th><th>f</th><th>z = y·f</th><th>0-1 loss</th><th>hinge max(0, 1−z)</th><th>log loss log₂(1+e^(−z))</th></tr>
    <tr><td>S1 (1,1)</td><td>−1</td><td>−1.5</td><td>1.5</td><td>0</td><td>0</td><td>0.291</td></tr>
    <tr><td>S2, S3</td><td>−1</td><td>−1.0</td><td>1.0</td><td>0</td><td>0</td><td>0.452</td></tr>
    <tr><td>S4 (3,3)</td><td>+1</td><td>0.5</td><td>0.5</td><td>0</td><td>0.5</td><td>0.684</td></tr>
    <tr><td>S5, S6</td><td>+1</td><td>1.0</td><td>1.0</td><td>0</td><td>0</td><td>0.452</td></tr>
    <tr><td>S7 (2.5,2.5)</td><td>−1</td><td>0.0</td><td>0.0</td><td>1</td><td>1</td><td>1.000</td></tr>
  </table>
<div class="fx" data-lang="py">m1 = SVC(kernel="linear", C=1, tol=1e-10).fit(X7, y7)
z = y7 * m1.decision_function(X7)                      # z = y * f(x), the signed score
print("z = y*f(x)     :", z.round(3))
print("0-1 loss       :", (z &lt;= 0).astype(float))
print("hinge          :", np.maximum(0, 1 - z).round(3))
print("log loss (bits):", np.log2(1 + np.exp(-z)).round(3))
print("squared hinge  :", (np.maximum(0, 1 - z) ** 2).round(3))</div>
<div class="fx" data-lang="text">z = y*f(x)     : [1.5 1.  1.  0.5 1.  1.  0. ]
0-1 loss       : [0. 0. 0. 0. 0. 0. 1.]
hinge          : [0.  0.  0.  0.5 0.  0.  1. ]
log loss (bits): [0.291 0.452 0.452 0.684 0.452 0.452 1.   ]
squared hinge  : [0.   0.   0.   0.25 0.   0.   1.  ]</div>
<figure class="viz"><svg viewBox="0 0 600 280" width="600">
<line x1="60.0" y1="235.0" x2="60.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/><text x="60.0" y="250.0" text-anchor="middle" class="tm" font-size="11">-2</text>
<line x1="160.0" y1="235.0" x2="160.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/><text x="160.0" y="250.0" text-anchor="middle" class="tm" font-size="11">-1</text>
<line x1="260.0" y1="235.0" x2="260.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/><text x="260.0" y="250.0" text-anchor="middle" class="tm" font-size="11">0</text>
<line x1="360.0" y1="235.0" x2="360.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/><text x="360.0" y="250.0" text-anchor="middle" class="tm" font-size="11">1</text>
<line x1="460.0" y1="235.0" x2="460.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/><text x="460.0" y="250.0" text-anchor="middle" class="tm" font-size="11">2</text>
<line x1="560.0" y1="235.0" x2="560.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/><text x="560.0" y="250.0" text-anchor="middle" class="tm" font-size="11">3</text>
<text x="52.0" y="239.0" text-anchor="end" class="tm" font-size="11">0</text><line x1="60.0" y1="235.0" x2="560.0" y2="235.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="52.0" y="165.7" text-anchor="end" class="tm" font-size="11">1</text><line x1="60.0" y1="161.7" x2="560.0" y2="161.7" stroke="currentColor" stroke-opacity="0.08"/>
<text x="52.0" y="92.3" text-anchor="end" class="tm" font-size="11">2</text><line x1="60.0" y1="88.3" x2="560.0" y2="88.3" stroke="currentColor" stroke-opacity="0.08"/>
<text x="52.0" y="19.0" text-anchor="end" class="tm" font-size="11">3</text><line x1="60.0" y1="15.0" x2="560.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<polyline points="60.0,15.0 62.5,16.8 65.0,18.7 67.5,20.5 70.1,22.4 72.6,24.2 75.1,26.1 77.6,27.9 80.1,29.7 82.6,31.6 85.1,33.4 87.6,35.3 90.2,37.1 92.7,39.0 95.2,40.8 97.7,42.6 100.2,44.5 102.7,46.3 105.2,48.2 107.7,50.0 110.3,51.9 112.8,53.7 115.3,55.5 117.8,57.4 120.3,59.2 122.8,61.1 125.3,62.9 127.8,64.7 130.4,66.6 132.9,68.4 135.4,70.3 137.9,72.1 140.4,74.0 142.9,75.8 145.4,77.6 147.9,79.5 150.5,81.3 153.0,83.2 155.5,85.0 158.0,86.9 160.5,88.7 163.0,90.5 165.5,92.4 168.0,94.2 170.6,96.1 173.1,97.9 175.6,99.8 178.1,101.6 180.6,103.4 183.1,105.3 185.6,107.1 188.1,109.0 190.7,110.8 193.2,112.7 195.7,114.5 198.2,116.3 200.7,118.2 203.2,120.0 205.7,121.9 208.2,123.7 210.8,125.6 213.3,127.4 215.8,129.2 218.3,131.1 220.8,132.9 223.3,134.8 225.8,136.6 228.3,138.5 230.9,140.3 233.4,142.1 235.9,144.0 238.4,145.8 240.9,147.7 243.4,149.5 245.9,151.3 248.4,153.2 251.0,155.0 253.5,156.9 256.0,158.7 258.5,160.6 261.0,162.4 263.5,164.2 266.0,166.1 268.5,167.9 271.1,169.8 273.6,171.6 276.1,173.5 278.6,175.3 281.1,177.1 283.6,179.0 286.1,180.8 288.6,182.7 291.2,184.5 293.7,186.4 296.2,188.2 298.7,190.0 301.2,191.9 303.7,193.7 306.2,195.6 308.7,197.4 311.3,199.3 313.8,201.1 316.3,202.9 318.8,204.8 321.3,206.6 323.8,208.5 326.3,210.3 328.8,212.2 331.4,214.0 333.9,215.8 336.4,217.7 338.9,219.5 341.4,221.4 343.9,223.2 346.4,225.1 348.9,226.9 351.5,228.7 354.0,230.6 356.5,232.4 359.0,234.3 361.5,235.0 364.0,235.0 366.5,235.0 369.0,235.0 371.6,235.0 374.1,235.0 376.6,235.0 379.1,235.0 381.6,235.0 384.1,235.0 386.6,235.0 389.1,235.0 391.7,235.0 394.2,235.0 396.7,235.0 399.2,235.0 401.7,235.0 404.2,235.0 406.7,235.0 409.2,235.0 411.8,235.0 414.3,235.0 416.8,235.0 419.3,235.0 421.8,235.0 424.3,235.0 426.8,235.0 429.3,235.0 431.9,235.0 434.4,235.0 436.9,235.0 439.4,235.0 441.9,235.0 444.4,235.0 446.9,235.0 449.4,235.0 452.0,235.0 454.5,235.0 457.0,235.0 459.5,235.0 462.0,235.0 464.5,235.0 467.0,235.0 469.5,235.0 472.1,235.0 474.6,235.0 477.1,235.0 479.6,235.0 482.1,235.0 484.6,235.0 487.1,235.0 489.6,235.0 492.2,235.0 494.7,235.0 497.2,235.0 499.7,235.0 502.2,235.0 504.7,235.0 507.2,235.0 509.7,235.0 512.3,235.0 514.8,235.0 517.3,235.0 519.8,235.0 522.3,235.0 524.8,235.0 527.3,235.0 529.8,235.0 532.4,235.0 534.9,235.0 537.4,235.0 539.9,235.0 542.4,235.0 544.9,235.0 547.4,235.0 549.9,235.0 552.5,235.0 555.0,235.0 557.5,235.0 560.0,235.0" fill="none" class="sg" stroke-width="2.6"/>
<polyline points="60.0,15.0 62.5,15.0 65.0,15.0 67.5,17.0 70.1,19.3 72.6,21.6 75.1,23.9 77.6,26.2 80.1,28.5 82.6,30.7 85.1,33.0 87.6,35.3 90.2,37.5 92.7,39.8 95.2,42.0 97.7,44.2 100.2,46.4 102.7,48.7 105.2,50.8 107.7,53.0 110.3,55.2 112.8,57.4 115.3,59.5 117.8,61.7 120.3,63.8 122.8,65.9 125.3,68.1 127.8,70.2 130.4,72.3 132.9,74.3 135.4,76.4 137.9,78.5 140.4,80.5 142.9,82.5 145.4,84.6 147.9,86.6 150.5,88.6 153.0,90.6 155.5,92.5 158.0,94.5 160.5,96.4 163.0,98.4 165.5,100.3 168.0,102.2 170.6,104.1 173.1,106.0 175.6,107.9 178.1,109.7 180.6,111.5 183.1,113.4 185.6,115.2 188.1,117.0 190.7,118.7 193.2,120.5 195.7,122.3 198.2,124.0 200.7,125.7 203.2,127.4 205.7,129.1 208.2,130.8 210.8,132.4 213.3,134.1 215.8,135.7 218.3,137.3 220.8,138.9 223.3,140.5 225.8,142.1 228.3,143.6 230.9,145.1 233.4,146.6 235.9,148.1 238.4,149.6 240.9,151.1 243.4,152.5 245.9,154.0 248.4,155.4 251.0,156.8 253.5,158.2 256.0,159.5 258.5,160.9 261.0,162.2 263.5,163.5 266.0,164.8 268.5,166.1 271.1,167.4 273.6,168.6 276.1,169.8 278.6,171.0 281.1,172.2 283.6,173.4 286.1,174.6 288.6,175.7 291.2,176.9 293.7,178.0 296.2,179.1 298.7,180.2 301.2,181.2 303.7,182.3 306.2,183.3 308.7,184.3 311.3,185.3 313.8,186.3 316.3,187.3 318.8,188.3 321.3,189.2 323.8,190.1 326.3,191.0 328.8,191.9 331.4,192.8 333.9,193.7 336.4,194.5 338.9,195.4 341.4,196.2 343.9,197.0 346.4,197.8 348.9,198.6 351.5,199.4 354.0,200.1 356.5,200.8 359.0,201.6 361.5,202.3 364.0,203.0 366.5,203.7 369.0,204.3 371.6,205.0 374.1,205.7 376.6,206.3 379.1,206.9 381.6,207.5 384.1,208.1 386.6,208.7 389.1,209.3 391.7,209.9 394.2,210.4 396.7,211.0 399.2,211.5 401.7,212.0 404.2,212.5 406.7,213.1 409.2,213.5 411.8,214.0 414.3,214.5 416.8,215.0 419.3,215.4 421.8,215.9 424.3,216.3 426.8,216.7 429.3,217.1 431.9,217.6 434.4,218.0 436.9,218.3 439.4,218.7 441.9,219.1 444.4,219.5 446.9,219.8 449.4,220.2 452.0,220.5 454.5,220.9 457.0,221.2 459.5,221.5 462.0,221.8 464.5,222.1 467.0,222.4 469.5,222.7 472.1,223.0 474.6,223.3 477.1,223.6 479.6,223.8 482.1,224.1 484.6,224.4 487.1,224.6 489.6,224.9 492.2,225.1 494.7,225.3 497.2,225.6 499.7,225.8 502.2,226.0 504.7,226.2 507.2,226.4 509.7,226.6 512.3,226.8 514.8,227.0 517.3,227.2 519.8,227.4 522.3,227.6 524.8,227.8 527.3,227.9 529.8,228.1 532.4,228.3 534.9,228.4 537.4,228.6 539.9,228.7 542.4,228.9 544.9,229.0 547.4,229.2 549.9,229.3 552.5,229.5 555.0,229.6 557.5,229.7 560.0,229.9" fill="none" class="sb" stroke-width="2"/>
<polyline points="60.0,161.7 260.0,161.7 260.0,235.0 560.0,235.0" fill="none" class="sr" stroke-width="2" stroke-dasharray="6 4"/>
<text x="310.0" y="267.0" text-anchor="middle" font-size="12">z = y · f(x)   (negative = wrong side, ≥ 1 = beyond the kerb)</text>
<circle cx="410.0" cy="235.0" r="4.5" fill="currentColor"/><text x="416.0" y="227.0" font-size="11">S1</text>
<circle cx="310.0" cy="198.3" r="4.5" fill="currentColor"/><text x="316.0" y="190.3" font-size="11">S4</text>
<circle cx="260.0" cy="161.7" r="4.5" fill="currentColor"/><text x="266.0" y="153.7" font-size="11">S7</text>
<line x1="400" y1="40" x2="430" y2="40" class="sg" stroke-width="2.6"/><text x="436" y="44" font-size="12">hinge max(0, 1 − z)</text>
<line x1="400" y1="62" x2="430" y2="62" class="sb" stroke-width="2"/><text x="436" y="66" font-size="12">log loss (bits)</text>
<line x1="400" y1="84" x2="430" y2="84" class="sr" stroke-width="2" stroke-dasharray="6 4"/><text x="436" y="88" font-size="12">0-1 loss</text>
</svg><figcaption>Three losses against the signed score z. Hinge is exactly zero once a student is beyond the kerb (z ≥ 1), so those students have no influence. Log loss never reaches zero, so logistic regression listens to every point. Dots: three of the seven students under the C = 1 line.</figcaption></figure>
  <p>The hinge column is exactly the slack column of section 05 for C = 1 (0.5 for S4, 1 for S7). Two differences from log loss matter:</p>
  <ul>
    <li><strong>Exactly zero beyond the kerb.</strong> S1, S2, S3, S5, S6 contribute nothing to the hinge loss, so moving them (without crossing the kerb) cannot move the line. That is why only support vectors matter. Under log loss every student still pulls (0.291 for S1).</li>
    <li><strong>Linear, not exponential, for bad mistakes.</strong> Both grow roughly linearly for very wrong points, so both are more robust to outliers than squared losses. The squared hinge (sklearn <code>LinearSVC(loss="squared_hinge")</code>, its default) punishes big violations more.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hinge loss</strong>: ℓ(y, f) = max(0, 1 − y·f), for y ∈ {−1, +1}. It is a convex upper bound of the 0-1 loss. <strong>SVM = L2-regularised hinge-loss minimisation</strong>; logistic regression = L2-regularised log-loss minimisation (see <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Because the hinge is flat at zero beyond the kerb, the SVM has no reason to push points further out, so its scores carry no probability meaning. Logistic regression's log loss keeps rewarding confidence, which is why its outputs are (roughly) calibrated probabilities and the SVM's are not.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> every boundary so far was a straight line. Some students fail because they did too little and others because they burnt out from too much; no straight line can separate that. <b>Next: the kernel trick.</b></div>

  <h2 id="svm-kernel"><span class="num">07</span>The Kernel Trick</h2>
  <p><strong>The question we can't answer yet:</strong> three over-worked students, (5,5), (6,5) and (5,6), burnt out and failed. Now Fail students sit on <em>both</em> sides of the Pass students. A straight line cannot separate them. Can the same SVM machinery draw a curved boundary?</p>
  <h3>By hand: lift one feature</h3>
  <p>Use one number per student, effort s = hours + mocks. The nine efforts are 2, 3, 3 (Fail), 6, 7, 7 (Pass), 10, 11, 11 (Fail). On a line, Pass is in the middle: no single cut works. Now give each student a second feature s². The points move onto a parabola: (2, 4), (3, 9), (6, 36), (7, 49), (10, 100), (11, 121). In this 2-D space a straight line can separate them.</p>
  <p>The hard-margin SVM on (s, s²) finds w = (13/6, −1/6), b = −6, i.e. f(s) = (13s − s²)/6 − 6 = −(s − 4)(s − 9)/6. Check the kerbs: s = 3 → −(−1)(−6)/6 = −1 ✓; s = 6 → −(2)(−3)/6 = +1 ✓; s = 7 → +1 ✓; s = 10 → −(6)(1)/6 = −1 ✓. f &gt; 0 exactly when 4 &lt; s &lt; 9. One straight line in the lifted space = <strong>two cuts</strong>, s = 4 and s = 9, back on the original line.</p>
<figure class="viz"><svg viewBox="0 0 640 280" width="640">
<line x1="20" y1="130" x2="250" y2="130" stroke="currentColor"/>
<text x="20.0" y="150" text-anchor="middle" class="tm" font-size="10">0</text>
<text x="96.7" y="150" text-anchor="middle" class="tm" font-size="10">4</text>
<text x="173.3" y="150" text-anchor="middle" class="tm" font-size="10">8</text>
<text x="250.0" y="150" text-anchor="middle" class="tm" font-size="10">12</text>
<circle cx="58.3" cy="130" r="5.5" class="fr sr"/>
<circle cx="77.5" cy="130" r="5.5" class="fr sr"/>
<circle cx="77.5" cy="118" r="5.5" class="fr sr"/>
<circle cx="135.0" cy="130" r="5.5" class="fg sg"/>
<circle cx="154.2" cy="130" r="5.5" class="fg sg"/>
<circle cx="154.2" cy="118" r="5.5" class="fg sg"/>
<circle cx="211.7" cy="130" r="5.5" class="fr sr"/>
<circle cx="230.8" cy="130" r="5.5" class="fr sr"/>
<circle cx="230.8" cy="118" r="5.5" class="fr sr"/>
<text x="135" y="95" text-anchor="middle" font-size="12">effort s = hours + mocks</text><text x="135" y="175" text-anchor="middle" class="tm" font-size="11">Fail · Pass · Fail: no single cut works</text>
<text x="290" y="135" font-size="20">→</text>
<line x1="340" y1="245" x2="620" y2="245" stroke="currentColor"/><line x1="340" y1="15" x2="340" y2="245" stroke="currentColor"/>
<polyline points="340.0,245.0 344.5,244.9 349.0,244.7 353.5,244.4 358.0,243.9 362.5,243.3 367.1,242.6 371.6,241.8 376.1,240.8 380.6,239.6 385.1,238.4 389.6,237.0 394.1,235.5 398.6,233.8 403.1,232.1 407.6,230.1 412.1,228.1 416.6,225.9 421.2,223.6 425.7,221.2 430.2,218.6 434.7,215.9 439.2,213.0 443.7,210.1 448.2,207.0 452.7,203.7 457.2,200.3 461.7,196.8 466.2,193.2 470.7,189.4 475.3,185.6 479.8,181.5 484.3,177.4 488.8,173.1 493.3,168.6 497.8,164.1 502.3,159.4 506.8,154.6 511.3,149.6 515.8,144.5 520.3,139.3 524.8,134.0 529.4,128.5 533.9,122.9 538.4,117.1 542.9,111.2 547.4,105.2 551.9,99.1 556.4,92.8 560.9,86.4 565.4,79.9 569.9,73.2 574.4,66.4 578.9,59.5 583.5,52.4 588.0,45.2 592.5,37.9 597.0,30.4 601.5,22.8 606.0,15.1" fill="none" stroke="currentColor" stroke-dasharray="2 3"/>
<line x1="404.6" y1="245.0" x2="637.9" y2="15.0" class="sg" stroke-width="2.5"/>
<circle cx="386.7" cy="237.9" r="5.5" class="fr sr"/>
<circle cx="410.0" cy="229.1" r="5.5" class="fr sr"/>
<circle cx="410.0" cy="229.1" r="5.5" class="fr sr"/>
<circle cx="480.0" cy="181.3" r="5.5" class="fg sg"/>
<circle cx="503.3" cy="158.3" r="5.5" class="fg sg"/>
<circle cx="503.3" cy="158.3" r="5.5" class="fg sg"/>
<circle cx="573.3" cy="68.1" r="5.5" class="fr sr"/>
<circle cx="596.7" cy="30.9" r="5.5" class="fr sr"/>
<circle cx="596.7" cy="30.9" r="5.5" class="fr sr"/>
<text x="340.0" y="260" text-anchor="middle" class="tm" font-size="10">0</text>
<text x="433.3" y="260" text-anchor="middle" class="tm" font-size="10">4</text>
<text x="526.7" y="260" text-anchor="middle" class="tm" font-size="10">8</text>
<text x="620.0" y="260" text-anchor="middle" class="tm" font-size="10">12</text>
<text x="480" y="275" text-anchor="middle" font-size="11">s</text><text x="350" y="28" font-size="11">s²</text>
<text x="440.3" y="121.2" font-size="11" class="tg">s² = 13s − 36</text>
</svg><figcaption>Left: on the effort line the Pass students sit between two groups of Fail students. Right: add s² as a second feature; the points move onto a parabola, and one straight line (green) separates them. Back on the original line that one cut is two boundaries, s = 4 and s = 9.</figcaption></figure>
<div class="fx" data-lang="py">XB = np.vstack([X6, [[5, 5], [6, 5], [5, 6]]])        # three over-worked students who burnt out
yB = np.append(y6, [-1, -1, -1])
effort = XB.sum(axis=1)                               # hours + mocks
print("effort:", effort, " label:", yB)
lin = SVC(kernel="linear", C=1).fit(XB, yB)
print("linear SVM on (hours, mocks): accuracy", round(lin.score(XB, yB), 3), " predictions", lin.predict(XB))
F = np.c_[effort, effort ** 2]                        # lift by hand: (s, s^2)
lift = SVC(kernel="linear", C=1e6, tol=1e-10).fit(F, yB)
w, b = lift.coef_[0], lift.intercept_[0]
print("linear SVM on (s, s^2): accuracy", lift.score(F, yB), " w =", w.round(4), " b =", round(b, 4))
print("boundary s values (roots of w2*s^2 + w1*s + b = 0):", np.sort(np.roots([w[1], w[0], b])).round(3))</div>
<div class="fx" data-lang="text">effort: [ 2.  3.  3.  6.  7.  7. 10. 11. 11.]  label: [-1 -1 -1  1  1  1 -1 -1 -1]
linear SVM on (hours, mocks): accuracy 0.667  predictions [-1 -1 -1 -1 -1 -1 -1 -1 -1]
linear SVM on (s, s^2): accuracy 1.0  w = [ 2.1667 -0.1667]  b = -6.0
boundary s values (roots of w2*s^2 + w1*s + b = 0): [4. 9.]</div>
  <p>The linear SVM on (hours, mocks) gives up and predicts Fail for everyone (accuracy 6/9 = 0.667). After adding s², a linear SVM separates all nine, and the roots of the score are exactly 4 and 9.</p>
  <h3>The problem with lifting</h3>
  <p>Lifting by hand needs you to guess the right new features, and the number of features explodes. All degree-2 products of 2 features: 6 features; of 100 features: 5,151; degree 3 of 1,000 features: 167 million. Computing and storing those is hopeless.</p>
  <h3>The trick: never lift, compute the dot product directly</h3>
  <p>Section 04 showed that the SVM touches the data only through dot products xᵢ·xⱼ. So we only need φ(a)·φ(b), not φ itself. Take S3 = a = (1, 2) and S6 = b = (3, 4) and the lift φ(v) = (v₁², √2·v₁v₂, v₂²):</p>
  <ul>
    <li><strong>Lift then dot:</strong> φ(a) = (1, 2.828, 4), φ(b) = (9, 16.971, 16). Dot = 9 + 48 + 64 = <strong>121</strong>.</li>
    <li><strong>Kernel:</strong> a·b = 3 + 8 = 11, then square: 11² = <strong>121</strong>.</li>
  </ul>
  <p>Same number, but the kernel needed 2 multiplications and a square instead of building two 3-D vectors. With the extra constant, (a·b + 1)² = 12² = 144 equals the dot product of a 6-D lift (1, √2a₁, √2a₂, a₁², √2a₁a₂, a₂²), which contains all degree-0, 1 and 2 terms.</p>
<div class="fx" data-lang="py">a, bb = np.array([1.0, 2.0]), np.array([3.0, 4.0])     # student 3 (Fail) and student 6 (Pass)
phi2 = lambda v: np.array([v[0]**2, np.sqrt(2) * v[0] * v[1], v[1]**2])
phi2c = lambda v: np.array([1, np.sqrt(2) * v[0], np.sqrt(2) * v[1], v[0]**2, np.sqrt(2) * v[0] * v[1], v[1]**2])
print("phi(a) =", phi2(a).round(3), " phi(b) =", phi2(bb).round(3))
print("(a.b)^2      : lift then dot =", round(float(phi2(a) @ phi2(bb)), 6), "  kernel =", (a @ bb) ** 2)
print("(a.b + 1)^2  : lift then dot =", round(float(phi2c(a) @ phi2c(bb)), 6), "  kernel =", (a @ bb + 1) ** 2)
from math import comb
for n, d in [(2, 2), (10, 2), (100, 2), (100, 3), (1000, 3)]:
    print(f"{n:5d} features, degree {d}: lifted space has {comb(n + d, d):&gt;12,} dimensions; kernel cost ~{n} multiplications")</div>
<div class="fx" data-lang="text">phi(a) = [1.    2.828 4.   ]  phi(b) = [ 9.    16.971 16.   ]
(a.b)^2      : lift then dot = 121.0   kernel = 121.0
(a.b + 1)^2  : lift then dot = 144.0   kernel = 144.0
    2 features, degree 2: lifted space has            6 dimensions; kernel cost ~2 multiplications
   10 features, degree 2: lifted space has           66 dimensions; kernel cost ~10 multiplications
  100 features, degree 2: lifted space has        5,151 dimensions; kernel cost ~100 multiplications
  100 features, degree 3: lifted space has      176,851 dimensions; kernel cost ~100 multiplications
 1000 features, degree 3: lifted space has  167,668,501 dimensions; kernel cost ~1000 multiplications</div>
  <p>Both identities hold to the last digit. The table shows why it matters: the lifted space grows to 167 million dimensions, while the kernel still costs about 1,000 multiplications per pair.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>kernel</strong> is a function K(a, b) that equals φ(a)·φ(b) for some feature map φ. The <strong>kernel trick</strong>: replace every xᵢ·xⱼ in the dual by K(xᵢ, xⱼ). Training uses the n × n <strong>Gram matrix</strong> Kᵢⱼ = K(xᵢ, xⱼ); prediction is f(x) = Σᵢ αᵢyᵢK(xᵢ, x) + b. <strong>Mercer's condition</strong>: K is a valid kernel when every Gram matrix it produces is symmetric positive semi-definite.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With a kernel there is no w you can print (it lives in the lifted space), so <code>coef_</code> exists only for <code>kernel="linear"</code>. Explanations of a kernel SVM must go through the support vectors, permutation importance or SHAP.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we used one particular kernel. Which kernels exist, what do their settings (degree, γ) do to the boundary, and how does C interact with them? <b>Next: kernels, γ and C.</b></div>

  <h2 id="svm-kernels"><span class="num">08</span>Kernels, γ and C</h2>
  <p><strong>The question we can't answer yet:</strong> the effort lift worked because we guessed s². Without guessing, which kernel should we use on the nine students, and what do its knobs do?</p>
  <h3>The four standard kernels</h3>
  <table class="tbl">
    <tr><th>Kernel</th><th>K(a, b)</th><th>Lifted space</th><th>Boundary in the original space</th><th>sklearn</th></tr>
    <tr><td>Linear</td><td>a·b</td><td>none</td><td>straight</td><td><code>kernel="linear"</code></td></tr>
    <tr><td>Polynomial</td><td>(γ a·b + r)^d</td><td>all products up to degree d</td><td>curves of degree d</td><td><code>kernel="poly", degree, gamma, coef0</code></td></tr>
    <tr><td>RBF (Gaussian)</td><td>exp(−γ‖a − b‖²)</td><td>infinite-dimensional</td><td>any smooth shape</td><td><code>kernel="rbf"</code> (default), <code>gamma</code></td></tr>
    <tr><td>Sigmoid</td><td>tanh(γ a·b + r)</td><td>not always a valid kernel</td><td>neural-net-like; rarely best</td><td><code>kernel="sigmoid"</code></td></tr>
  </table>
  <h3>By hand: three students' Gram matrices</h3>
  <p>For S1 (1,1), S2 (2,1), S4 (3,3): dot products S1·S1 = 2, S1·S2 = 3, S1·S4 = 6, S2·S2 = 5, S2·S4 = 9, S4·S4 = 18. Polynomial (a·b + 1)²: (2+1)² = 9, (3+1)² = 16, (6+1)² = 49, … RBF with γ = 0.5 needs squared distances: S1–S2: 1 → e^(−0.5) = 0.6065; S1–S4: 8 → e^(−4) = 0.0183; S2–S4: 5 → e^(−2.5) = 0.0821.</p>
  <h3>RBF as a similarity, and what γ does</h3>
  <p>The RBF kernel is 1 for identical points and fades toward 0 as they move apart; γ sets how fast. For S3 = (1,2) and S6 = (3,4), ‖a − b‖² = 8:</p>
<div class="fx" data-lang="py">sq = ((a - bb) ** 2).sum()
print("||a - b||^2 =", sq)
for g in [0.01, 0.1, 0.5, 1, 10]:
    print(f"gamma={g:&lt;5} K(a,b) = exp(-{g} x {sq:g}) = {np.exp(-g * sq):.6f}")
from sklearn.metrics.pairwise import rbf_kernel, polynomial_kernel, linear_kernel
P3 = X6[[0, 1, 3]]                                    # students (1,1), (2,1), (3,3)
print("linear Gram:\\n", linear_kernel(P3))
print("poly Gram, (a.b + 1)^2:\\n", polynomial_kernel(P3, degree=2, gamma=1, coef0=1))
print("RBF Gram, gamma=0.5:\\n", rbf_kernel(P3, gamma=0.5).round(4))</div>
<div class="fx" data-lang="text">||a - b||^2 = 8.0
gamma=0.01  K(a,b) = exp(-0.01 x 8) = 0.923116
gamma=0.1   K(a,b) = exp(-0.1 x 8) = 0.449329
gamma=0.5   K(a,b) = exp(-0.5 x 8) = 0.018316
gamma=1     K(a,b) = exp(-1 x 8) = 0.000335
gamma=10    K(a,b) = exp(-10 x 8) = 0.000000
linear Gram:
 [[ 2.  3.  6.]
 [ 3.  5.  9.]
 [ 6.  9. 18.]]
poly Gram, (a.b + 1)^2:
 [[  9.  16.  49.]
 [ 16.  36. 100.]
 [ 49. 100. 361.]]
RBF Gram, gamma=0.5:
 [[1.     0.6065 0.0183]
 [0.6065 1.     0.0821]
 [0.0183 0.0821 1.    ]]</div>
  <p>With γ = 0.01 the two students look 92% similar (everyone influences everyone, a nearly linear boundary). With γ = 1 they are 0.03% similar (each student influences only its immediate neighbourhood). Gram matrices: the linear and polynomial ones grow with vector length; the RBF one has 1s on the diagonal and similarities in between. An RBF SVM predicts with f(x) = Σ αᵢyᵢ exp(−γ‖xᵢ − x‖²) + b: a weighted vote of similarities to the support vectors, like a KNN whose weights are learned.</p>
  <h3>Back to the burnt-out students</h3>
<div class="fx" data-lang="py">for name, mdl in [("linear", SVC(kernel="linear", C=1)),
                  ("poly d=2, (a.b+1)^2", SVC(kernel="poly", degree=2, gamma=1, coef0=1, C=100)),
                  ("rbf gamma=0.5", SVC(kernel="rbf", gamma=0.5, C=100))]:
    mdl.fit(XB, yB)
    print(f"{name:20s} accuracy {mdl.score(XB, yB):.3f}  support vectors {mdl.support_.tolist()}")
print("f(4,4) under rbf:", SVC(gamma=0.5, C=100).fit(XB, yB).decision_function([[4, 4]]).round(3))</div>
<div class="fx" data-lang="text">linear               accuracy 0.667  support vectors [0, 1, 2, 7, 8, 3, 4, 5]
poly d=2, (a.b+1)^2  accuracy 1.000  support vectors [1, 2, 6, 3, 4, 5]
rbf gamma=0.5        accuracy 1.000  support vectors [0, 1, 2, 6, 7, 8, 3, 4, 5]
f(4,4) under rbf: [0.616]</div>
<figure class="viz"><svg viewBox="0 0 640 290" width="640">
<clipPath id="svm-b0"><rect x="15" y="10" width="190" height="220"/></clipPath>
<rect x="15" y="10" width="190" height="220" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<rect x="36.1" y="192.6" width="12" height="12" class="fr sr"/>
<circle cx="42.1" cy="198.6" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="63.3" y="192.6" width="12" height="12" class="fr sr"/>
<circle cx="69.3" cy="198.6" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="36.1" y="161.1" width="12" height="12" class="fr sr"/>
<circle cx="42.1" cy="167.1" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="96.4" cy="135.7" r="6.5" class="fg sg"/>
<circle cx="96.4" cy="135.7" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="123.6" cy="135.7" r="6.5" class="fg sg"/>
<circle cx="123.6" cy="135.7" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="96.4" cy="104.3" r="6.5" class="fg sg"/>
<circle cx="96.4" cy="104.3" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="144.7" y="66.9" width="12" height="12" class="fr sr"/>
<rect x="171.9" y="66.9" width="12" height="12" class="fr sr"/>
<circle cx="177.9" cy="72.9" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="144.7" y="35.4" width="12" height="12" class="fr sr"/>
<circle cx="150.7" cy="41.4" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="110" y="252" text-anchor="middle" font-size="12" font-weight="700">linear: accuracy 0.667</text>
<text x="110" y="26" text-anchor="middle" font-size="11" class="tr">predicts Fail everywhere</text>
<clipPath id="svm-b1"><rect x="227" y="10" width="190" height="220"/></clipPath>
<rect x="227" y="10" width="190" height="220" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<polyline clip-path="url(#svm-b1)" points="417,168 416,166 414,165 413,163 412,162 411,160 409,159 408,157 407,156 406,154 404,153 403,151 402,150 400,148 399,147 398,145 397,144 395,142 394,141 393,139 391,138 390,136 389,135 388,133 386,132 385,130 384,129 383,127 381,126 380,124 379,123 377,121 376,120 375,118 374,117 372,116 371,114 370,113 369,111 367,110 366,108 365,107 363,105 362,104 361,102 360,101 358,99 357,98 356,96 355,95 353,93 352,92 351,90 349,89 348,87 347,86 346,84 344,83 343,82 342,80 340,79 339,77 338,76 337,74 335,73 334,71 333,70 332,68 330,67 329,65 328,64 326,62 325,61 324,59 323,58 321,56 320,55 319,54 318,52 316,51 315,49 314,48 312,46 311,45 310,43 309,42 307,40 306,39 305,37 304,36 302,34 301,33 300,31 298,30 297,29 296,27 295,26 293,24 292,23 291,21 289,20 288,18 287,17 286,15 284,14 283,12 282,11 281,10" fill="none" class="sg" stroke-width="2.2"/>
<polyline clip-path="url(#svm-b1)" points="227,104 228,106 230,107 231,109 232,110 233,111 235,113 236,114 237,116 238,117 240,119 241,120 242,122 244,123 245,125 246,126 247,128 249,129 250,131 251,132 253,134 254,135 255,137 256,138 258,140 259,141 260,143 261,144 263,146 264,147 265,149 267,150 268,152 269,153 270,154 272,156 273,157 274,159 275,160 277,162 278,163 279,165 281,166 282,168 283,169 284,171 286,172 287,174 288,175 289,177 291,178 292,180 293,181 295,183 296,184 297,185 298,187 300,188 301,190 302,191 304,193 305,194 306,196 307,197 309,199 310,200 311,202 312,203 314,205 315,206 316,208 318,209 319,210 320,212 321,213 323,215 324,216 325,218 326,219 328,221 329,222 330,224 332,225 333,227 334,228 335,230 336,230" fill="none" class="sg" stroke-width="2.2"/>
<polyline clip-path="url(#svm-b1)" points="227,136 228,137 230,139 231,140 232,142 233,143 235,145 236,146 237,147 238,149 240,150 241,152 242,153 244,155 245,156 246,158 247,159 249,161 250,162 251,164 253,165 254,167 255,168 256,170 258,171 259,173 260,174 261,176 263,177 264,179 265,180 267,181 268,183 269,184 270,186 272,187 273,189 274,190 275,192 277,193 278,195 279,196 281,198 282,199 283,201 284,202 286,204 287,205 288,207 289,208 291,210 292,211 293,212 295,214 296,215 297,217 298,218 300,220 301,221 302,223 304,224 305,226 306,227 307,229 309,230" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-dasharray="4 3"/>
<polyline clip-path="url(#svm-b1)" points="417,136 416,134 414,133 413,131 412,130 411,128 409,127 408,126 407,124 406,123 404,121 403,120 402,118 400,117 399,115 398,114 397,112 395,111 394,109 393,108 391,106 390,105 389,103 388,102 386,100 385,99 384,97 383,96 381,94 380,93 379,91 377,90 376,88 375,87 374,86 372,84 371,83 370,81 369,80 367,78 366,77 365,75 363,74 362,72 361,71 360,69 358,68 357,66 356,65 355,63 353,62 352,60 351,59 349,57 348,56 347,55 346,53 344,52 343,50 342,49 340,47 339,46 338,44 337,43 335,41 334,40 333,38 332,37 330,35 329,34 328,32 326,31 325,29 324,28 323,27 321,25 320,24 319,22 318,21 316,19 315,18 314,16 312,15 311,13 310,12 309,10 308,10" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-dasharray="4 3"/>
<polyline clip-path="url(#svm-b1)" points="414,230 412,229 411,227 410,226 409,224 408,223 407,221 405,220 404,218 403,217 402,215 400,213 399,212 398,210 397,209 395,207 394,206 393,204 391,202 390,201 389,199 388,198 386,196 385,195 384,193 383,192 381,190 380,189 379,187 378,186 376,184 375,183 374,181 373,180 372,178 370,177 369,175 368,174 367,172 365,171 364,169 363,168 362,167 360,165 359,164 358,162 357,161 355,159 354,158 353,156 352,155 350,153 349,152 348,150 347,149 345,147 344,146 343,144 342,143 340,141 339,140 338,138 337,137 335,135 334,134 333,132 332,131 330,130 329,128 328,127 326,125 325,124 324,122 323,121 321,119 320,118 319,116 318,115 316,113 315,112 314,110 312,109 311,107 310,106 309,104 307,103 306,102 305,100 303,99 302,97 301,96 300,94 298,93 297,91 296,90 294,88 293,87 292,85 290,84 289,82 288,81 287,79 285,78 284,76 283,75 281,73 280,72 279,71 277,69 276,68 275,66 273,65 272,63 271,62 269,60 268,59 267,57 265,56 264,54 263,53 262,51 260,50 259,48 258,47 256,46 255,44 254,43 253,41 251,40 250,39 249,37 247,36 246,34 245,33 244,32 242,30 241,29 240,28 238,26 237,25 236,23 234,22 233,20 232,19 230,17 229,16 228,14 227,14" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-dasharray="4 3"/>
<polyline clip-path="url(#svm-b1)" points="227,39 228,40 230,42 231,43 232,45 233,46 235,48 236,50 237,51 238,53 240,54 241,56 242,57 243,59 245,60 246,62 247,63 248,65 250,66 251,68 252,69 253,71 254,72 256,73 257,75 258,76 259,78 261,79 262,81 263,82 264,84 265,85 267,87 268,88 269,90 270,91 272,93 273,94 274,96 275,97 277,99 278,100 279,102 281,103 282,105 283,106 284,108 286,109 287,111 288,112 289,114 291,115 292,117 293,118 295,120 296,121 297,123 298,124 300,126 301,127 302,129 304,130 305,132 306,133 307,135 309,136 310,138 311,139 312,140 314,142 315,143 316,145 318,146 319,148 320,149 321,151 323,152 324,154 325,155 326,157 328,158 329,159 330,161 332,162 333,164 334,165 335,167 337,168 338,170 339,171 340,173 342,174 343,175 344,177 346,178 347,180 348,181 350,183 351,184 352,186 353,187 355,189 356,190 357,192 359,193 360,195 361,196 363,198 364,199 365,200 367,202 368,203 369,205 371,206 372,208 373,209 375,211 376,212 377,214 379,215 380,217 381,218 383,219 384,221 385,222 386,224 388,225 389,226 390,228 391,229 392,230" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-dasharray="4 3"/>
<rect x="248.1" y="192.6" width="12" height="12" class="fr sr"/>
<rect x="275.3" y="192.6" width="12" height="12" class="fr sr"/>
<circle cx="281.3" cy="198.6" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="248.1" y="161.1" width="12" height="12" class="fr sr"/>
<circle cx="254.1" cy="167.1" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="308.4" cy="135.7" r="6.5" class="fg sg"/>
<circle cx="308.4" cy="135.7" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="335.6" cy="135.7" r="6.5" class="fg sg"/>
<circle cx="335.6" cy="135.7" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="308.4" cy="104.3" r="6.5" class="fg sg"/>
<circle cx="308.4" cy="104.3" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="356.7" y="66.9" width="12" height="12" class="fr sr"/>
<circle cx="362.7" cy="72.9" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="383.9" y="66.9" width="12" height="12" class="fr sr"/>
<rect x="356.7" y="35.4" width="12" height="12" class="fr sr"/>
<text x="322" y="252" text-anchor="middle" font-size="12" font-weight="700">poly (a·b+1)²: 1.000</text>
<clipPath id="svm-b2"><rect x="439" y="10" width="190" height="220"/></clipPath>
<rect x="439" y="10" width="190" height="220" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<polyline clip-path="url(#svm-b2)" points="547,181 550,181 551,181 554,181 556,180 558,180 560,179 561,178 564,177 565,176 567,175 568,174 570,172 572,171 573,170 574,168 575,167 577,165 577,164 578,162 579,160 580,158 581,156 582,153 582,152 583,149 583,146 583,144 583,141 583,140 583,137 582,134 582,133 581,130 580,128 579,126 578,124 577,122 577,121 575,119 574,117 573,115 572,113 571,112 570,110 569,109 567,107 566,106 565,104 564,103 563,102 561,100 560,99 559,97 558,96 556,94 555,93 554,91 552,90 551,88 550,87 549,85 547,84 546,82 544,81 543,79 541,78 540,76 538,75 537,74 536,73 535,72 533,71 531,69 530,68 528,67 526,66 524,65 523,65 521,64 518,63 516,63 514,63 512,63 510,63 508,64 505,65 504,65 502,66 500,67 499,68 497,69 495,71 494,72 493,73 491,75 490,76 489,78 488,79 487,81 486,82 485,85 484,87 484,88 483,91 482,93 482,96 481,99 481,102 481,103 481,105 481,107 482,110 482,113 482,115 483,118 484,119 485,122 485,124 486,126 487,128 488,130 489,132 490,134 491,136 492,137 493,138 494,140 495,142 496,144 498,146 499,147 500,149 501,150 502,152 503,153 505,155 506,156 507,158 509,159 510,161 512,162 513,163 514,165 516,166 517,167 518,168 520,169 522,171 523,172 524,173 526,174 528,175 530,176 531,177 533,178 535,178 537,179 539,180 541,180 544,181 546,181 547,181 547,181" fill="none" class="sg" stroke-width="2.2"/>
<polyline clip-path="url(#svm-b2)" points="477,206 476,206 474,205 472,204 471,203 470,202 468,200 467,199 465,198 464,196 463,195 462,192 461,190 460,189 459,186 459,184 459,181 459,178 459,175 459,174 461,171 462,170 463,169 465,168 467,167 470,167 472,168 473,168 476,169 477,170 479,171 480,172 482,174 483,175 485,177 486,178 487,180 488,181 489,183 490,184 491,187 492,189 493,190 493,193 494,196 493,199 493,201 491,203 490,205 489,206 487,206 485,207 482,207 480,207 477,206 477,206" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-dasharray="4 3"/>
<polyline clip-path="url(#svm-b2)" points="587,81 586,81 583,79 582,79 580,78 578,76 577,75 575,74 574,72 573,71 572,69 571,68 570,66 569,63 569,62 568,59 568,57 567,54 568,51 568,50 569,47 570,45 571,44 573,43 574,42 576,41 578,40 581,40 583,40 586,41 587,41 589,42 591,43 592,44 594,45 595,47 597,48 598,50 599,51 600,53 601,55 602,57 602,59 603,62 603,65 603,68 603,71 602,72 601,75 600,76 599,78 597,79 596,80 593,81 592,81 589,81 587,81 587,81" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-dasharray="4 3"/>
<polyline clip-path="url(#svm-b2)" points="531,143 533,144 536,144 538,144 541,143 542,142 544,141 545,140 546,138 547,136 548,134 548,131 548,128 548,125 547,124 546,121 546,119 545,118 544,116 542,114 541,112 540,111 538,110 537,108 536,107 534,106 532,105 531,104 528,104 526,103 523,103 521,104 519,105 518,106 517,107 516,109 514,112 514,113 513,116 513,119 514,122 514,124 515,127 516,128 517,130 518,133 519,134 520,136 522,137 523,138 524,140 526,140 527,141 530,143 531,143 531,143" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-dasharray="4 3"/>
<rect x="460.1" y="192.6" width="12" height="12" class="fr sr"/>
<circle cx="466.1" cy="198.6" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="487.3" y="192.6" width="12" height="12" class="fr sr"/>
<circle cx="493.3" cy="198.6" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="460.1" y="161.1" width="12" height="12" class="fr sr"/>
<circle cx="466.1" cy="167.1" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="520.4" cy="135.7" r="6.5" class="fg sg"/>
<circle cx="520.4" cy="135.7" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="547.6" cy="135.7" r="6.5" class="fg sg"/>
<circle cx="547.6" cy="135.7" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="520.4" cy="104.3" r="6.5" class="fg sg"/>
<circle cx="520.4" cy="104.3" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="568.7" y="66.9" width="12" height="12" class="fr sr"/>
<circle cx="574.7" cy="72.9" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="595.9" y="66.9" width="12" height="12" class="fr sr"/>
<circle cx="601.9" cy="72.9" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="568.7" y="35.4" width="12" height="12" class="fr sr"/>
<circle cx="574.7" cy="41.4" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
<text x="534" y="252" text-anchor="middle" font-size="12" font-weight="700">RBF γ = 0.5: 1.000</text>
<text x="320" y="278" text-anchor="middle" font-size="11" class="tm">axes: hours 0–7 (across), mocks 0–7 (up); ringed = support vectors</text>
</svg><figcaption>Nine students: the six from before plus three over-worked students at (5,5), (6,5), (5,6) who failed. No straight line works; the polynomial and RBF kernels both draw a closed region around the Pass band.</figcaption></figure>
  <p>Linear fails (0.667). The degree-2 polynomial kernel (a·b + 1)² contains the s² feature we built by hand (and more), and separates all nine with six support vectors. RBF also separates them; with only nine points every student ends up a support vector. The new student (4, 4) gets an RBF score of +0.616: Pass.</p>
  <h3>At scale: rings and moons</h3>
  <p>Two data sets show the kernels on more data. <code>make_circles</code> is one class inside a ring of the other (like the burnt-out students, but in 2-D); two-moons is two interleaved half-circles with noise.</p>
<div class="fx" data-lang="py">from sklearn.datasets import make_circles, make_moons
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
Xc, yc = make_circles(n_samples=400, noise=0.1, factor=0.4, random_state=0)
for n, mdl in [("linear", SVC(kernel="linear")), ("poly d=2", SVC(kernel="poly", degree=2)),
               ("poly d=3", SVC(kernel="poly", degree=3)), ("rbf", SVC(kernel="rbf")),
               ("sigmoid", SVC(kernel="sigmoid"))]:
    print(f"{n:9s} CV acc {cross_val_score(mdl, Xc, yc, cv=5).mean():.3f}")
Z = np.c_[Xc, (Xc ** 2).sum(axis=1)]                      # lift by hand: add r^2 = x1^2 + x2^2
print(f"linear on [x1, x2, x1^2 + x2^2] CV acc {cross_val_score(SVC(kernel='linear'), Z, yc, cv=5).mean():.3f}")</div>
<div class="fx" data-lang="text">linear    CV acc 0.547
poly d=2  CV acc 1.000
poly d=3  CV acc 0.637
rbf       CV acc 1.000
sigmoid   CV acc 0.653
linear on [x1, x2, x1^2 + x2^2] CV acc 1.000</div>
  <p>On rings, linear is a coin toss (0.547), degree-2 polynomial and RBF are perfect, degree-3 is poor (an odd-degree polynomial cannot make a closed ring shape centred on the origin here), and adding r² = x1² + x2² by hand rescues even the linear SVM: the same lesson as s² for the students.</p>
<div class="fx" data-lang="py">Xm, ym = make_moons(n_samples=600, noise=0.3, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(Xm, ym, test_size=0.3, random_state=0)
print("gamma \\\\ C      0.01           1            100")
for g in [0.1, 1, 10, 100]:
    row = []
    for C in [0.01, 1, 100]:
        p = make_pipeline(StandardScaler(), SVC(C=C, gamma=g)).fit(Xtr, ytr)
        row.append(f"{p.score(Xtr, ytr):.2f}/{p.score(Xte, yte):.2f} ({p[-1].n_support_.sum():3d})")
    print(f"{g:&lt;6}  " + "   ".join(row))</div>
<div class="fx" data-lang="text">gamma \\ C      0.01           1            100
0.1     0.81/0.81 (416)   0.88/0.85 (156)   0.90/0.88 (106)
1       0.79/0.81 (416)   0.91/0.88 (115)   0.93/0.89 ( 90)
10      0.50/0.49 (418)   0.94/0.88 (222)   0.98/0.86 (156)
100     0.50/0.49 (418)   0.98/0.81 (386)   1.00/0.81 (378)</div>
  <p>Each cell is train/test accuracy (number of support vectors) for the moons data. Read it in three directions:</p>
  <ul>
    <li><strong>Small C (0.01)</strong>: almost every point is a support vector (416 of 420), the street covers everything, and at large γ the model collapses to guessing (0.50).</li>
    <li><strong>Large γ (100)</strong>: train accuracy 0.98–1.00, test 0.81: each point gets its own bubble. Classic overfitting.</li>
    <li><strong>The sweet spot</strong> is γ around 0.1–1 with C 1–100: test 0.85–0.89.</li>
  </ul>
<figure class="viz"><svg viewBox="0 0 620 215" width="620">
<clipPath id="svm-g0"><rect x="10" y="10" width="190" height="150"/></clipPath>
<rect x="10" y="10" width="190" height="150" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<path clip-path="url(#svm-g0)" d="M107 53h0 M92 64h0 M67 68h0 M43 69h0 M79 76h0 M42 47h0 M50 97h0 M34 89h0 M105 100h0 M60 51h0 M49 72h0 M122 63h0 M116 44h0 M110 72h0 M36 57h0 M55 53h0 M131 73h0 M117 99h0 M94 77h0 M80 51h0 M100 30h0 M62 92h0 M79 33h0 M121 45h0 M50 78h0 M78 71h0 M84 44h0 M37 91h0 M55 117h0 M124 91h0 M52 99h0 M51 67h0 M122 100h0 M141 76h0 M60 60h0 M105 61h0 M33 113h0 M148 90h0 M72 47h0 M97 38h0 M113 58h0 M94 81h0 M106 46h0 M120 76h0 M48 73h0 M54 79h0 M133 48h0 M76 67h0 M86 57h0 M64 51h0 M140 80h0 M50 55h0 M67 71h0 M46 95h0 M23 93h0 M108 80h0 M69 74h0 M90 58h0 M37 79h0 M132 93h0 M126 60h0 M88 57h0 M69 59h0 M128 65h0 M80 49h0 M148 95h0 M60 32h0 M139 91h0 M102 58h0 M118 73h0 M132 94h0 M41 27h0 M27 51h0 M23 105h0 M33 83h0 M106 79h0 M99 95h0 M120 48h0 M122 58h0 M133 76h0 M112 85h0 M58 58h0 M38 79h0 M97 54h0 M109 23h0 M137 75h0 M39 89h0 M88 68h0 M71 97h0 M43 118h0 M70 55h0 M80 78h0 M89 54h0 M42 79h0 M88 71h0 M67 94h0 M40 97h0 M130 56h0 M46 53h0 M107 78h0 M114 79h0 M90 15h0 M58 65h0 M102 81h0 M105 79h0 M124 86h0 M37 84h0 M15 80h0 M114 43h0 M119 62h0 M33 102h0 M120 50h0 M95 27h0 M50 56h0 M118 52h0 M109 45h0 M89 54h0 M56 73h0 M66 81h0 M127 67h0 M119 87h0 M40 96h0 M56 65h0 M89 55h0 M40 83h0 M84 24h0 M38 86h0 M117 71h0 M99 71h0 M88 44h0 M92 62h0 M42 103h0 M132 97h0 M48 96h0 M107 38h0 M60 56h0 M104 39h0 M23 97h0 M87 69h0 M61 63h0 M93 63h0 M56 77h0 M60 64h0 M106 56h0 M121 56h0 M40 109h0 M84 63h0 M53 59h0 M125 79h0 M117 52h0 M101 82h0 M77 52h0 M75 70h0 M31 64h0 M41 35h0 M85 26h0 M34 78h0 M71 52h0 M19 58h0 M43 106h0 M109 68h0 M57 74h0 M132 66h0 M113 55h0 M116 51h0 M47 89h0 M30 73h0 M70 57h0 M36 87h0 M129 62h0 M98 76h0 M113 84h0 M34 74h0 M46 90h0 M138 92h0 M37 87h0 M111 72h0 M85 70h0 M70 52h0 M113 57h0 M112 68h0 M27 87h0 M113 91h0 M45 74h0 M119 50h0 M89 42h0 M100 48h0 M33 64h0 M110 100h0 M54 80h0 M81 50h0 M100 86h0 M104 67h0 M134 94h0 M69 30h0 M119 53h0 M86 62h0 M93 54h0 M124 77h0 M35 67h0 M117 36h0 M28 90h0 M66 33h0 M57 108h0 M156 78h0 M89 44h0 M48 88h0 M115 82h0" class="sb" stroke-width="4" stroke-linecap="round" stroke-opacity="0.55"/>
<path clip-path="url(#svm-g0)" d="M72 94h0 M105 134h0 M73 81h0 M86 79h0 M149 69h0 M118 120h0 M174 124h0 M153 101h0 M163 144h0 M80 105h0 M161 89h0 M145 85h0 M109 114h0 M83 95h0 M113 115h0 M170 122h0 M85 82h0 M117 101h0 M164 125h0 M148 107h0 M181 78h0 M152 111h0 M156 113h0 M163 120h0 M117 108h0 M177 56h0 M153 109h0 M97 74h0 M154 97h0 M138 103h0 M110 87h0 M101 102h0 M167 117h0 M160 131h0 M64 91h0 M102 83h0 M89 97h0 M118 97h0 M109 132h0 M192 103h0 M135 84h0 M149 112h0 M95 97h0 M103 113h0 M111 118h0 M66 64h0 M107 89h0 M165 99h0 M98 128h0 M138 116h0 M85 95h0 M114 131h0 M56 68h0 M144 86h0 M155 136h0 M145 95h0 M151 96h0 M162 95h0 M154 90h0 M166 89h0 M135 118h0 M110 93h0 M134 150h0 M135 119h0 M168 65h0 M82 75h0 M91 121h0 M173 110h0 M89 127h0 M146 93h0 M90 121h0 M122 142h0 M59 101h0 M195 102h0 M81 112h0 M108 128h0 M164 104h0 M70 108h0 M167 68h0 M172 100h0 M70 131h0 M119 119h0 M110 107h0 M115 106h0 M173 64h0 M114 105h0 M106 93h0 M86 112h0 M99 100h0 M159 81h0 M132 140h0 M173 105h0 M75 104h0 M59 97h0 M130 133h0 M125 114h0 M148 110h0 M152 134h0 M114 101h0 M161 92h0 M126 125h0 M195 73h0 M183 70h0 M179 93h0 M86 54h0 M128 116h0 M168 103h0 M172 113h0 M165 70h0 M94 125h0 M173 99h0 M166 117h0 M81 102h0 M165 124h0 M186 80h0 M136 143h0 M109 108h0 M165 95h0 M85 103h0 M73 83h0 M124 117h0 M111 97h0 M104 102h0 M151 87h0 M84 109h0 M86 114h0 M85 93h0 M183 92h0 M187 84h0 M130 87h0 M170 75h0 M89 96h0 M85 96h0 M176 81h0 M120 104h0 M165 100h0 M112 102h0 M81 98h0 M124 99h0 M151 141h0 M128 147h0 M171 120h0 M89 93h0 M154 114h0 M106 120h0 M135 127h0 M173 86h0 M144 123h0 M169 100h0 M182 82h0 M93 96h0 M62 118h0 M108 99h0 M125 95h0 M87 112h0 M153 129h0 M130 118h0 M131 140h0 M107 107h0 M143 122h0 M158 85h0 M157 121h0 M160 96h0 M181 119h0 M163 86h0 M144 118h0 M90 116h0 M112 128h0 M145 119h0 M103 121h0 M159 104h0 M153 121h0 M96 119h0 M175 108h0 M118 116h0 M107 97h0 M94 89h0 M92 97h0 M168 75h0 M173 64h0 M157 108h0 M100 76h0 M169 80h0 M171 92h0 M65 84h0 M141 136h0 M103 92h0 M180 76h0 M102 128h0 M100 77h0 M160 85h0 M98 119h0 M62 96h0 M184 65h0 M122 109h0 M81 91h0 M158 93h0 M76 79h0 M172 89h0 M130 113h0 M152 71h0 M118 137h0 M106 88h0 M94 93h0 M109 90h0 M133 106h0 M186 110h0 M145 125h0 M78 107h0 M154 113h0 M90 75h0 M115 120h0" class="sr" stroke-width="4" stroke-linecap="round" stroke-opacity="0.55"/>
<polyline clip-path="url(#svm-g0)" points="195,10 194,12 194,13 193,15 193,17 192,18 192,19 191,20 191,22 190,23 190,25 189,26 188,28 188,29 187,31 186,32 186,33 185,35 184,35 183,37 183,38 182,39 181,41 180,42 179,43 178,44 177,46 176,47 176,48 175,49 174,50 173,51 171,52 170,53 169,54 168,55 167,56 166,57 165,58 164,59 162,60 161,61 160,62 158,63 157,64 156,64 155,65 153,66 152,67 150,68 149,68 147,69 146,70 145,70 143,71 141,72 140,72 139,73 137,74 135,75 134,75 132,76 131,76 129,77 127,78 126,78 124,79 122,79 121,80 119,81 118,81 115,82 114,82 113,83 110,83 109,84 107,84 106,85 104,85 102,86 101,86 98,87 97,88 95,88 94,89 92,89 90,90 89,90 87,91 85,92 84,92 82,93 81,93 79,94 77,95 76,95 75,96 73,97 71,98 70,98 69,99 67,100 65,101 64,101 63,102 61,102 60,103 58,104 57,105 55,106 54,107 53,108 52,109 51,110 49,110 48,111 47,112 46,113 45,114 43,116 42,117 41,118 40,118 40,119 39,120 37,122 36,123 35,124 35,125 34,126 33,128 32,129 31,130 30,131 29,133 29,134 28,135 27,136 27,137 26,139 25,140 24,142 24,143 23,144 22,146 22,147 21,149 21,150 20,152 20,153 19,154 18,156 18,157 17,159 17,160 17,160" fill="none" stroke="currentColor" stroke-width="1.8"/>
<text x="105.0" y="180" text-anchor="middle" font-size="12.5" font-weight="700">γ = 0.1</text>
<text x="105.0" y="196" text-anchor="middle" font-size="11" class="tm">train 0.88 · test 0.85</text>
<clipPath id="svm-g1"><rect x="215" y="10" width="190" height="150"/></clipPath>
<rect x="215" y="10" width="190" height="150" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<path clip-path="url(#svm-g1)" d="M312 53h0 M297 64h0 M272 68h0 M248 69h0 M284 76h0 M247 47h0 M255 97h0 M239 89h0 M310 100h0 M265 51h0 M254 72h0 M327 63h0 M321 44h0 M315 72h0 M241 57h0 M260 53h0 M336 73h0 M322 99h0 M299 77h0 M285 51h0 M305 30h0 M267 92h0 M284 33h0 M326 45h0 M255 78h0 M283 71h0 M289 44h0 M242 91h0 M260 117h0 M329 91h0 M257 99h0 M256 67h0 M327 100h0 M346 76h0 M265 60h0 M310 61h0 M238 113h0 M353 90h0 M277 47h0 M302 38h0 M318 58h0 M299 81h0 M311 46h0 M325 76h0 M253 73h0 M259 79h0 M338 48h0 M281 67h0 M291 57h0 M269 51h0 M345 80h0 M255 55h0 M272 71h0 M251 95h0 M228 93h0 M313 80h0 M274 74h0 M295 58h0 M242 79h0 M337 93h0 M331 60h0 M293 57h0 M274 59h0 M333 65h0 M285 49h0 M353 95h0 M265 32h0 M344 91h0 M307 58h0 M323 73h0 M337 94h0 M246 27h0 M232 51h0 M228 105h0 M238 83h0 M311 79h0 M304 95h0 M325 48h0 M327 58h0 M338 76h0 M317 85h0 M263 58h0 M243 79h0 M302 54h0 M314 23h0 M342 75h0 M244 89h0 M293 68h0 M276 97h0 M248 118h0 M275 55h0 M285 78h0 M294 54h0 M247 79h0 M293 71h0 M272 94h0 M245 97h0 M335 56h0 M251 53h0 M312 78h0 M319 79h0 M295 15h0 M263 65h0 M307 81h0 M310 79h0 M329 86h0 M242 84h0 M220 80h0 M319 43h0 M324 62h0 M238 102h0 M325 50h0 M300 27h0 M255 56h0 M323 52h0 M314 45h0 M294 54h0 M261 73h0 M271 81h0 M332 67h0 M324 87h0 M245 96h0 M261 65h0 M294 55h0 M245 83h0 M289 24h0 M243 86h0 M322 71h0 M304 71h0 M293 44h0 M297 62h0 M247 103h0 M337 97h0 M253 96h0 M312 38h0 M265 56h0 M309 39h0 M228 97h0 M292 69h0 M266 63h0 M298 63h0 M261 77h0 M265 64h0 M311 56h0 M326 56h0 M245 109h0 M289 63h0 M258 59h0 M330 79h0 M322 52h0 M306 82h0 M282 52h0 M280 70h0 M236 64h0 M246 35h0 M290 26h0 M239 78h0 M276 52h0 M224 58h0 M248 106h0 M314 68h0 M262 74h0 M337 66h0 M318 55h0 M321 51h0 M252 89h0 M235 73h0 M275 57h0 M241 87h0 M334 62h0 M303 76h0 M318 84h0 M239 74h0 M251 90h0 M343 92h0 M242 87h0 M316 72h0 M290 70h0 M275 52h0 M318 57h0 M317 68h0 M232 87h0 M318 91h0 M250 74h0 M324 50h0 M294 42h0 M305 48h0 M238 64h0 M315 100h0 M259 80h0 M286 50h0 M305 86h0 M309 67h0 M339 94h0 M274 30h0 M324 53h0 M291 62h0 M298 54h0 M329 77h0 M240 67h0 M322 36h0 M233 90h0 M271 33h0 M262 108h0 M361 78h0 M294 44h0 M253 88h0 M320 82h0" class="sb" stroke-width="4" stroke-linecap="round" stroke-opacity="0.55"/>
<path clip-path="url(#svm-g1)" d="M277 94h0 M310 134h0 M278 81h0 M291 79h0 M354 69h0 M323 120h0 M379 124h0 M358 101h0 M368 144h0 M285 105h0 M366 89h0 M350 85h0 M314 114h0 M288 95h0 M318 115h0 M375 122h0 M290 82h0 M322 101h0 M369 125h0 M353 107h0 M386 78h0 M357 111h0 M361 113h0 M368 120h0 M322 108h0 M382 56h0 M358 109h0 M302 74h0 M359 97h0 M343 103h0 M315 87h0 M306 102h0 M372 117h0 M365 131h0 M269 91h0 M307 83h0 M294 97h0 M323 97h0 M314 132h0 M397 103h0 M340 84h0 M354 112h0 M300 97h0 M308 113h0 M316 118h0 M271 64h0 M312 89h0 M370 99h0 M303 128h0 M343 116h0 M290 95h0 M319 131h0 M261 68h0 M349 86h0 M360 136h0 M350 95h0 M356 96h0 M367 95h0 M359 90h0 M371 89h0 M340 118h0 M315 93h0 M339 150h0 M340 119h0 M373 65h0 M287 75h0 M296 121h0 M378 110h0 M294 127h0 M351 93h0 M295 121h0 M327 142h0 M264 101h0 M400 102h0 M286 112h0 M313 128h0 M369 104h0 M275 108h0 M372 68h0 M377 100h0 M275 131h0 M324 119h0 M315 107h0 M320 106h0 M378 64h0 M319 105h0 M311 93h0 M291 112h0 M304 100h0 M364 81h0 M337 140h0 M378 105h0 M280 104h0 M264 97h0 M335 133h0 M330 114h0 M353 110h0 M357 134h0 M319 101h0 M366 92h0 M331 125h0 M400 73h0 M388 70h0 M384 93h0 M291 54h0 M333 116h0 M373 103h0 M377 113h0 M370 70h0 M299 125h0 M378 99h0 M371 117h0 M286 102h0 M370 124h0 M391 80h0 M341 143h0 M314 108h0 M370 95h0 M290 103h0 M278 83h0 M329 117h0 M316 97h0 M309 102h0 M356 87h0 M289 109h0 M291 114h0 M290 93h0 M388 92h0 M392 84h0 M335 87h0 M375 75h0 M294 96h0 M290 96h0 M381 81h0 M325 104h0 M370 100h0 M317 102h0 M286 98h0 M329 99h0 M356 141h0 M333 147h0 M376 120h0 M294 93h0 M359 114h0 M311 120h0 M340 127h0 M378 86h0 M349 123h0 M374 100h0 M387 82h0 M298 96h0 M267 118h0 M313 99h0 M330 95h0 M292 112h0 M358 129h0 M335 118h0 M336 140h0 M312 107h0 M348 122h0 M363 85h0 M362 121h0 M365 96h0 M386 119h0 M368 86h0 M349 118h0 M295 116h0 M317 128h0 M350 119h0 M308 121h0 M364 104h0 M358 121h0 M301 119h0 M380 108h0 M323 116h0 M312 97h0 M299 89h0 M297 97h0 M373 75h0 M378 64h0 M362 108h0 M305 76h0 M374 80h0 M376 92h0 M270 84h0 M346 136h0 M308 92h0 M385 76h0 M307 128h0 M305 77h0 M365 85h0 M303 119h0 M267 96h0 M389 65h0 M327 109h0 M286 91h0 M363 93h0 M281 79h0 M377 89h0 M335 113h0 M357 71h0 M323 137h0 M311 88h0 M299 93h0 M314 90h0 M338 106h0 M391 110h0 M350 125h0 M283 107h0 M359 113h0 M295 75h0 M320 120h0" class="sr" stroke-width="4" stroke-linecap="round" stroke-opacity="0.55"/>
<polyline clip-path="url(#svm-g1)" points="405,18 403,18 400,18 398,18 397,19 394,19 393,20 391,20 389,21 388,21 387,22 385,23 383,24 382,25 381,26 380,27 379,28 378,29 376,30 375,31 374,32 373,33 372,34 371,35 370,36 369,37 368,38 367,39 366,40 365,41 364,42 363,44 363,45 362,46 361,47 360,49 360,50 359,52 358,52 357,54 357,55 356,57 356,59 356,60 355,62 355,64 355,65 355,67 354,68 354,70 354,72 354,73 353,75 353,77 352,78 352,80 351,81 350,83 350,84 349,85 348,86 346,87 345,88 344,89 343,90 342,91 340,91 338,92 337,92 334,93 332,93 330,93 327,93 325,92 324,92 321,91 320,91 318,90 317,90 315,89 313,88 312,88 311,87 308,86 307,86 306,85 303,85 302,84 300,84 299,83 297,83 295,82 293,82 291,82 289,81 287,81 284,82 283,82 281,82 279,83 277,83 276,84 275,85 273,85 272,86 271,87 270,88 269,90 268,91 268,92 267,94 266,95 266,97 266,99 265,101 265,102 265,103 265,105 265,107 265,109 265,111 265,113 264,115 264,117 264,118 263,119 263,121 262,122 262,123 261,125 260,126 259,127 258,129 257,130 256,131 256,132 254,133 253,134 252,135 251,136 250,137 249,138 248,139 247,140 246,142 245,143 244,144 243,145 242,146 241,147 240,148 239,149 238,151 237,152 237,153 236,154 235,155 235,157 234,159 235,160" fill="none" stroke="currentColor" stroke-width="1.8"/>
<text x="310.0" y="180" text-anchor="middle" font-size="12.5" font-weight="700">γ = 1</text>
<text x="310.0" y="196" text-anchor="middle" font-size="11" class="tm">train 0.91 · test 0.88</text>
<clipPath id="svm-g2"><rect x="420" y="10" width="190" height="150"/></clipPath>
<rect x="420" y="10" width="190" height="150" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<path clip-path="url(#svm-g2)" d="M517 53h0 M502 64h0 M477 68h0 M453 69h0 M489 76h0 M452 47h0 M460 97h0 M444 89h0 M515 100h0 M470 51h0 M459 72h0 M532 63h0 M526 44h0 M520 72h0 M446 57h0 M465 53h0 M541 73h0 M527 99h0 M504 77h0 M490 51h0 M510 30h0 M472 92h0 M489 33h0 M531 45h0 M460 78h0 M488 71h0 M494 44h0 M447 91h0 M465 117h0 M534 91h0 M462 99h0 M461 67h0 M532 100h0 M551 76h0 M470 60h0 M515 61h0 M443 113h0 M558 90h0 M482 47h0 M507 38h0 M523 58h0 M504 81h0 M516 46h0 M530 76h0 M458 73h0 M464 79h0 M543 48h0 M486 67h0 M496 57h0 M474 51h0 M550 80h0 M460 55h0 M477 71h0 M456 95h0 M433 93h0 M518 80h0 M479 74h0 M500 58h0 M447 79h0 M542 93h0 M536 60h0 M498 57h0 M479 59h0 M538 65h0 M490 49h0 M558 95h0 M470 32h0 M549 91h0 M512 58h0 M528 73h0 M542 94h0 M451 27h0 M437 51h0 M433 105h0 M443 83h0 M516 79h0 M509 95h0 M530 48h0 M532 58h0 M543 76h0 M522 85h0 M468 58h0 M448 79h0 M507 54h0 M519 23h0 M547 75h0 M449 89h0 M498 68h0 M481 97h0 M453 118h0 M480 55h0 M490 78h0 M499 54h0 M452 79h0 M498 71h0 M477 94h0 M450 97h0 M540 56h0 M456 53h0 M517 78h0 M524 79h0 M500 15h0 M468 65h0 M512 81h0 M515 79h0 M534 86h0 M447 84h0 M425 80h0 M524 43h0 M529 62h0 M443 102h0 M530 50h0 M505 27h0 M460 56h0 M528 52h0 M519 45h0 M499 54h0 M466 73h0 M476 81h0 M537 67h0 M529 87h0 M450 96h0 M466 65h0 M499 55h0 M450 83h0 M494 24h0 M448 86h0 M527 71h0 M509 71h0 M498 44h0 M502 62h0 M452 103h0 M542 97h0 M458 96h0 M517 38h0 M470 56h0 M514 39h0 M433 97h0 M497 69h0 M471 63h0 M503 63h0 M466 77h0 M470 64h0 M516 56h0 M531 56h0 M450 109h0 M494 63h0 M463 59h0 M535 79h0 M527 52h0 M511 82h0 M487 52h0 M485 70h0 M441 64h0 M451 35h0 M495 26h0 M444 78h0 M481 52h0 M429 58h0 M453 106h0 M519 68h0 M467 74h0 M542 66h0 M523 55h0 M526 51h0 M457 89h0 M440 73h0 M480 57h0 M446 87h0 M539 62h0 M508 76h0 M523 84h0 M444 74h0 M456 90h0 M548 92h0 M447 87h0 M521 72h0 M495 70h0 M480 52h0 M523 57h0 M522 68h0 M437 87h0 M523 91h0 M455 74h0 M529 50h0 M499 42h0 M510 48h0 M443 64h0 M520 100h0 M464 80h0 M491 50h0 M510 86h0 M514 67h0 M544 94h0 M479 30h0 M529 53h0 M496 62h0 M503 54h0 M534 77h0 M445 67h0 M527 36h0 M438 90h0 M476 33h0 M467 108h0 M566 78h0 M499 44h0 M458 88h0 M525 82h0" class="sb" stroke-width="4" stroke-linecap="round" stroke-opacity="0.55"/>
<path clip-path="url(#svm-g2)" d="M482 94h0 M515 134h0 M483 81h0 M496 79h0 M559 69h0 M528 120h0 M584 124h0 M563 101h0 M573 144h0 M490 105h0 M571 89h0 M555 85h0 M519 114h0 M493 95h0 M523 115h0 M580 122h0 M495 82h0 M527 101h0 M574 125h0 M558 107h0 M591 78h0 M562 111h0 M566 113h0 M573 120h0 M527 108h0 M587 56h0 M563 109h0 M507 74h0 M564 97h0 M548 103h0 M520 87h0 M511 102h0 M577 117h0 M570 131h0 M474 91h0 M512 83h0 M499 97h0 M528 97h0 M519 132h0 M602 103h0 M545 84h0 M559 112h0 M505 97h0 M513 113h0 M521 118h0 M476 64h0 M517 89h0 M575 99h0 M508 128h0 M548 116h0 M495 95h0 M524 131h0 M466 68h0 M554 86h0 M565 136h0 M555 95h0 M561 96h0 M572 95h0 M564 90h0 M576 89h0 M545 118h0 M520 93h0 M544 150h0 M545 119h0 M578 65h0 M492 75h0 M501 121h0 M583 110h0 M499 127h0 M556 93h0 M500 121h0 M532 142h0 M469 101h0 M605 102h0 M491 112h0 M518 128h0 M574 104h0 M480 108h0 M577 68h0 M582 100h0 M480 131h0 M529 119h0 M520 107h0 M525 106h0 M583 64h0 M524 105h0 M516 93h0 M496 112h0 M509 100h0 M569 81h0 M542 140h0 M583 105h0 M485 104h0 M469 97h0 M540 133h0 M535 114h0 M558 110h0 M562 134h0 M524 101h0 M571 92h0 M536 125h0 M605 73h0 M593 70h0 M589 93h0 M496 54h0 M538 116h0 M578 103h0 M582 113h0 M575 70h0 M504 125h0 M583 99h0 M576 117h0 M491 102h0 M575 124h0 M596 80h0 M546 143h0 M519 108h0 M575 95h0 M495 103h0 M483 83h0 M534 117h0 M521 97h0 M514 102h0 M561 87h0 M494 109h0 M496 114h0 M495 93h0 M593 92h0 M597 84h0 M540 87h0 M580 75h0 M499 96h0 M495 96h0 M586 81h0 M530 104h0 M575 100h0 M522 102h0 M491 98h0 M534 99h0 M561 141h0 M538 147h0 M581 120h0 M499 93h0 M564 114h0 M516 120h0 M545 127h0 M583 86h0 M554 123h0 M579 100h0 M592 82h0 M503 96h0 M472 118h0 M518 99h0 M535 95h0 M497 112h0 M563 129h0 M540 118h0 M541 140h0 M517 107h0 M553 122h0 M568 85h0 M567 121h0 M570 96h0 M591 119h0 M573 86h0 M554 118h0 M500 116h0 M522 128h0 M555 119h0 M513 121h0 M569 104h0 M563 121h0 M506 119h0 M585 108h0 M528 116h0 M517 97h0 M504 89h0 M502 97h0 M578 75h0 M583 64h0 M567 108h0 M510 76h0 M579 80h0 M581 92h0 M475 84h0 M551 136h0 M513 92h0 M590 76h0 M512 128h0 M510 77h0 M570 85h0 M508 119h0 M472 96h0 M594 65h0 M532 109h0 M491 91h0 M568 93h0 M486 79h0 M582 89h0 M540 113h0 M562 71h0 M528 137h0 M516 88h0 M504 93h0 M519 90h0 M543 106h0 M596 110h0 M555 125h0 M488 107h0 M564 113h0 M500 75h0 M525 120h0" class="sr" stroke-width="4" stroke-linecap="round" stroke-opacity="0.55"/>
<polyline clip-path="url(#svm-g2)" points="420,76 421,76 424,75 425,75 426,75 428,75 430,76 432,77 433,78 433,79 434,81 435,81 436,80 436,78 435,77 433,76 433,75 432,73 433,71 434,70 435,69 436,68 435,68 434,67 433,65 433,63 432,62 430,63 427,62 425,62 424,61 422,60 421,59 421,58 421,57 422,55 423,54 425,53 426,53 428,52 429,52 429,50 430,49 431,48 433,47 434,46 437,46 439,46 440,47 443,48 444,48 444,47 445,45 445,44 447,43 449,42 450,42 452,42 454,42 456,42 457,43 458,44 459,45 460,47 461,48 463,48 464,48 467,47 468,47 470,46 473,46 474,46 475,45 476,44 477,43 480,42 481,42 483,42 485,42 487,42 488,41 489,41 491,40 493,39 494,39 495,38 498,38 499,37 500,36 501,35 502,34 503,33 501,32 500,31 499,31 496,31 496,32 497,33 497,35 496,35 495,36 494,37 492,38 490,38 488,38 487,38 485,38 483,37 481,37 480,37 477,38 475,38 473,37 471,37 469,37 467,36 465,36 464,35 463,35 462,33 462,32 462,31 463,29 464,28 465,28 468,27 470,27 471,27 474,26 476,26 477,26 480,26 482,26 483,26 485,27 486,28 487,28 487,27 486,25 487,23 487,22 488,21 490,20 492,20 494,19 493,18 492,17 492,15 493,13 494,12 495,11 496,11 499,10 501,10 503,11 505,11 506,12 507,14 508,15 507,17 507,18 506,18 504,19 502,20 500,20 501,22 502,22 505,22 507,23 510,23 511,22 512,20 513,19 514,19 516,18 518,18 520,18 523,18 524,19 525,20 526,21 527,22 526,24 526,25 524,26 523,27 522,27 519,28 518,28 518,30 518,32 518,33 520,33 522,33 524,32 525,32 528,31 529,32 531,32 532,33 534,34 535,35 535,36 535,38 534,39 535,40 536,41 538,42 539,43 541,43 543,43 545,43 547,44 549,45 550,46 550,47 551,49 550,50 549,51 548,52 547,53 547,54 548,55 548,57 547,59 547,60 547,61 548,63 549,64 549,65 550,67 549,68 549,69 550,70 551,71 553,71 554,72 555,73 557,74 558,75 559,76 560,76 562,75 563,75 566,74 567,74 569,74 571,75 572,76 572,77 571,78 570,79 568,79 567,80 565,81 563,81 561,81 560,80 557,81 556,81 555,82 553,82 550,82 548,82 547,81 545,81 543,80 541,81 539,82 538,83 538,84 537,85 537,86 537,88 538,89 539,90 542,90 544,89 545,89 547,88 549,88 551,88 553,89 555,88 556,88 558,88 560,89 560,90 560,91 557,91 556,91 554,91 553,92 551,93 550,94 549,95 549,97 549,98 548,99 546,100 544,100 542,101 541,101 539,101 539,99 539,97 538,95 537,94 536,93 534,93 531,93 529,93 526,93 524,93 523,92 522,91 523,89 524,88 523,87 522,86 519,85 518,85 517,84 515,84 514,84 514,85 513,87 512,88 511,89 508,89 507,88 506,87 505,85 504,85 502,84 501,84 500,82 500,80 500,78 501,77 502,76 504,75 506,75 507,76 508,77 508,79 510,79 511,79 513,78 514,77 515,76 516,75 516,74 514,73 512,73 510,73 507,72 506,72 504,72 501,72 500,73 498,73 496,73 495,73 493,73 491,73 490,74 491,75 492,76 493,78 493,78 492,80 491,81 488,80 487,79 486,78 485,77 483,76 481,77 480,77 479,79 479,81 479,82 477,83 475,83 473,83 471,83 470,83 468,84 467,85 465,85 465,86 466,87 467,89 469,89 470,89 472,90 474,91 475,91 477,92 479,93 480,94 481,95 482,95 485,96 485,97 485,99 484,100 482,100 481,101 479,101 477,100 476,99 476,98 475,96 474,95 473,94 471,93 469,93 468,93 465,92 464,93 464,94 465,96 465,97 466,99 465,100 464,101 463,102 462,103 464,104 467,104 468,104 470,105 472,105 473,106 473,108 473,110 472,111 471,112 469,113 470,115 469,116 468,118 468,118 467,120 465,121 464,122 462,121 461,121 459,121 457,122 456,122 453,123 451,123 450,122 447,121 446,120 445,119 445,118 443,118 442,117 439,117 438,116 437,115 436,114 436,112 436,110 434,110 432,110 430,109 428,109 427,108 426,106 425,105 426,103 426,102 427,102 427,100 426,99 425,98 425,96 425,94 425,92 426,91 427,90 428,89 429,87 430,86 430,85 427,85 425,85 423,85 421,84 420,83 420,83" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#svm-g2)" points="457,113 459,113 461,113 462,112 461,111 460,110 458,110 458,111 457,112 457,113 457,113" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#svm-g2)" points="534,103 532,102 531,102 531,100 534,100 536,101 537,101 537,102 536,103 534,103 534,103" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#svm-g2)" points="510,97 508,96 507,95 507,94 508,93 510,93 511,93 512,94 513,95 513,96 512,97 510,97 510,97" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#svm-g2)" points="464,70 467,70 469,70 471,69 471,68 469,67 467,67 464,67 463,68 464,70 464,70" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#svm-g2)" points="475,66 477,66 480,66 481,65 482,64 483,63 481,62 479,62 477,62 476,62 475,63 474,65 474,65 475,66 475,66" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#svm-g2)" points="452,64 454,64 456,63 456,62 456,61 455,60 452,60 451,61 450,62 450,62 451,63 452,64 452,64" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#svm-g2)" points="492,56 494,55 495,55 496,53 494,53 493,53 491,54 492,56 492,56" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#svm-g2)" points="446,52 446,51 445,50 445,51 446,52 446,52" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#svm-g2)" points="449,39 447,39 446,38 444,37 443,36 443,35 443,33 444,32 444,30 443,29 443,27 444,25 445,24 446,23 447,23 450,22 452,22 455,23 456,24 457,25 458,26 458,27 458,28 458,30 457,31 457,32 458,33 459,35 458,36 457,37 456,38 455,39 453,39 451,40 449,39 449,39" fill="none" stroke="currentColor" stroke-width="1.8"/>
<text x="515.0" y="180" text-anchor="middle" font-size="12.5" font-weight="700">γ = 100</text>
<text x="515.0" y="196" text-anchor="middle" font-size="11" class="tm">train 0.98 · test 0.81</text>
</svg><figcaption>RBF SVM (C = 1) on the two-moons data at scale. Small γ: each training point influences a wide area, the boundary is a gentle curve. γ = 100: each point influences a tiny bubble, the boundary wraps individual points and test accuracy falls.</figcaption></figure>
<div class="fx" data-lang="py">print("gamma='scale' on scaled moons =", round(1 / (2 * StandardScaler().fit_transform(Xtr).var()), 3))</div>
<div class="fx" data-lang="text">gamma='scale' on scaled moons = 0.5</div>
  <p>sklearn's default <code>gamma="scale"</code> is 1 / (number of features × variance of X). After standardising two features, that is 1/(2 × 1) = 0.5, a sensible middle value. Finally, a check that the prediction formula is really just a weighted sum of RBF similarities to the support vectors:</p>
<div class="fx" data-lang="py">p = make_pipeline(StandardScaler(), SVC(C=1, gamma=1)).fit(Xtr, ytr)
svc, Ztr = p[-1], p[0].transform(Xte[:5])
from sklearn.metrics.pairwise import rbf_kernel
K = rbf_kernel(Ztr, svc.support_vectors_, gamma=1)        # similarity of 5 test points to every SV
mine = K @ svc.dual_coef_[0] + svc.intercept_[0]           # f(x) = sum(alpha_i y_i K(x_i, x)) + b
print("support vectors:", svc.support_vectors_.shape[0], "of", len(Xtr))
print("by formula     :", mine.round(4))
print("decision_func  :", p.decision_function(Xte[:5]).round(4))
print("|alpha| &lt;= C   :", np.abs(svc.dual_coef_).max().round(4), " at the bound C:", int(np.isclose(np.abs(svc.dual_coef_), 1).sum()))</div>
<div class="fx" data-lang="text">support vectors: 115 of 420
by formula     : [-1.5521  1.4092 -1.0694  1.3758  1.4371]
decision_func  : [-1.5521  1.4092 -1.0694  1.3758  1.4371]
|alpha| &lt;= C   : 1.0  at the bound C: 95</div>
  <p>Our formula reproduces <code>decision_function</code> exactly. 115 of 420 training points are support vectors, and 95 of them sit at the upper bound |α| = C = 1: they are inside the street or on the wrong side.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>RBF kernel</strong>: K(a, b) = exp(−γ‖a − b‖²), γ &gt; 0. Large γ = narrow similarity = complex boundary (low bias, high variance); small γ = broad similarity = smooth boundary. <strong>C</strong> trades margin width against violations. The two interact and must be tuned together, usually on a log grid (C, γ ∈ 10⁻³ … 10³).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Train 0.98, test 0.81 is the signature of γ too large. And trying a kernel because it "sounds powerful" is not a strategy: start with linear (fast, interpretable), then RBF, and keep polynomial for cases where the degree has a meaning.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> both the margin (‖w‖) and the RBF kernel (‖a − b‖²) are built from distances. What if the columns are measured in very different units? <b>Next: feature scaling.</b></div>

  <h2 id="svm-scale"><span class="num">09</span>Feature Scaling</h2>
  <p><strong>The question we can't answer yet:</strong> suppose the institute records study time in <em>minutes</em>. The students are the same people; does the SVM still draw the same boundary?</p>
  <h3>By hand: the six students in minutes</h3>
  <p>In minutes S2 = (120, 1), S4 = (180, 3). The widest street in this space: the Fail and Pass groups are 60 minutes apart along the first axis but only 0–2 apart along mocks, so the widest gap is simply "between 120 and 180 minutes". The margin becomes 60 (minutes!), and the line is almost vertical: about 2·hours = 5, i.e. <strong>hours = 2.5</strong>, ignoring mocks. In hours, the widest street was the diagonal x1 + x2 = 4.5, using both columns equally.</p>
<div class="fx" data-lang="py">Xmin = X6.copy(); Xmin[:, 0] *= 60                     # study time in MINUTES
hm = SVC(kernel="linear", C=1e6, tol=1e-10).fit(Xmin, y6)
wm, bm = hm.coef_[0], hm.intercept_[0]
print("minutes: w =", wm.round(5), " b =", round(bm, 3), " SVs:", hm.support_vectors_.tolist())
print("boundary in hours units: %.3f*hours + %.5f*mocks = %.3f" % (wm[0] * 60, wm[1], -bm))
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
for name, Xs in [("hours", X6), ("minutes", Xmin)]:
    p = make_pipeline(StandardScaler(), SVC(kernel="linear", C=1e6, tol=1e-10)).fit(Xs, y6)
    print(f"standardised {name:7s}: decision values {p.decision_function(Xs).round(3)}")</div>
<div class="fx" data-lang="text">minutes: w = [0.0333  0.00111]  b = -4.997  SVs: [[120.0, 1.0], [180.0, 3.0]]
boundary in hours units: 1.998*hours + 0.00111*mocks = 4.997
standardised hours  : decision values [-1.667 -1.    -1.     1.     1.667  1.667]
standardised minutes: decision values [-1.667 -1.    -1.     1.     1.667  1.667]</div>
  <p>sklearn confirms: in minutes w ≈ (0.0333, 0.0011); converted back to hours the line is 1.998·hours + 0.0011·mocks = 4.997, i.e. hours ≈ 2.5. Only the unit changed, and the "best" boundary changed with it. After standardising each column (z = (x − mean)/std), hours and minutes give identical scores, equal to the original diagonal line's (−1.667, −1, −1, 1, 1.667, 1.667).</p>
  <h3>At scale: the wine data</h3>
<div class="fx" data-lang="py">from sklearn.datasets import load_wine
Xw, yw = load_wine(return_X_y=True)
for name, mdl in [("RBF, raw", SVC()), ("RBF, scaled", make_pipeline(StandardScaler(), SVC())),
                  ("linear, raw", SVC(kernel="linear")), ("linear, scaled", make_pipeline(StandardScaler(), SVC(kernel="linear")))]:
    print(f"{name:15s} 5-fold CV acc {cross_val_score(mdl, Xw, yw, cv=5).mean():.3f}")</div>
<div class="fx" data-lang="text">RBF, raw        5-fold CV acc 0.663
RBF, scaled     5-fold CV acc 0.983
linear, raw     5-fold CV acc 0.961
linear, scaled  5-fold CV acc 0.961</div>
  <p>The RBF SVM on raw wine features scores 0.663 (proline, in the hundreds to thousands, dominates every ‖a − b‖²); scaled it scores 0.983. The linear SVM happens to score the same here, but its margin still depends on the units (as the minutes example shows), and unscaled linear SVMs also train much more slowly.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Always put the scaler inside a pipeline (<code>make_pipeline(StandardScaler(), SVC())</code>) so it is fit on training folds only (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). For sparse text features (TF-IDF), do not centre (it destroys sparsity); TF-IDF rows are already normalised.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we can now classify reliably, but the institute also wants a predicted <em>mark</em>. <b>Next: support vector regression.</b></div>

  <h2 id="svm-svr"><span class="num">10</span>Support Vector Regression (SVR)</h2>
  <p><strong>The question we can't answer yet:</strong> the six students' final marks are 20, 28, 30 (the Fail students) and 62, 70, 66. Can the margin idea predict a number instead of a side?</p>
  <h3>The idea: a tube instead of a street</h3>
  <p>Turn the street inside out. In classification, points should stay <em>outside</em> the street. In regression, points should stay <em>inside</em> a tube of half-width ε around the prediction. Errors smaller than ε cost nothing; larger ones cost the excess. Among all functions that fit, choose the <strong>flattest</strong> (smallest ‖w‖).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ε-insensitive loss</strong>: ℓ(y, f) = max(0, |y − f| − ε). <strong>SVR</strong>: minimise ½‖w‖² + C Σᵢ max(0, |yᵢ − f(xᵢ)| − ε). Points strictly inside the tube have α = 0; only points on or outside the tube edge are support vectors.</p>
  </div>
  <h3>By hand with ε = 5</h3>
  <p>sklearn's linear SVR with ε = 5 returns w = (8, 8), b = 9: mark = 8·hours + 8·mocks + 9 = 8s + 9.</p>
  <table class="tbl">
    <tr><th>Student</th><th>s</th><th>Mark</th><th>8s + 9</th><th>Residual</th><th>ε-loss max(0, |r| − 5)</th></tr>
    <tr><td>S1</td><td>2</td><td>20</td><td>25</td><td>−5</td><td>0 (on the edge)</td></tr>
    <tr><td>S2</td><td>3</td><td>28</td><td>33</td><td>−5</td><td>0 (on the edge)</td></tr>
    <tr><td>S3</td><td>3</td><td>30</td><td>33</td><td>−3</td><td>0</td></tr>
    <tr><td>S4</td><td>6</td><td>62</td><td>57</td><td>+5</td><td>0 (on the edge)</td></tr>
    <tr><td>S5</td><td>7</td><td>70</td><td>65</td><td>+5</td><td>0 (on the edge)</td></tr>
    <tr><td>S6</td><td>7</td><td>66</td><td>65</td><td>+1</td><td>0</td></tr>
  </table>
  <p>Every student fits in the ±5 tube, so the loss is zero and only ½‖w‖² = ½(64 + 64) = 64 remains. A steeper line such as 10·hours + 10·mocks fits even better (ε = 0 gives exactly that) but has ½‖w‖² = 100. SVR picks the flatter one because the tube lets it.</p>
<div class="fx" data-lang="py">from sklearn.svm import SVR
marks6 = np.array([20, 28, 30, 62, 70, 66])          # final marks of the six students
for e in [0, 2, 5]:
    r = SVR(kernel="linear", C=100, epsilon=e).fit(X6, marks6)
    print(f"eps={e}: w={r.coef_[0].round(3)} b={r.intercept_[0]:.3f}  SVs={r.support_.tolist()}"
          f"  fitted={r.predict(X6).round(1)}  (8 h, 8 mocks) -&gt; {r.predict([[8, 8]])[0]:.1f}")
r5 = SVR(kernel="linear", C=100, epsilon=5).fit(X6, marks6)
res = marks6 - r5.predict(X6)
print("residuals:", res.round(2), " eps-insensitive loss:", np.maximum(0, np.abs(res) - 5).round(2))</div>
<div class="fx" data-lang="text">eps=0: w=[10.     9.999] b=0.001  SVs=[0, 1, 2, 3, 4, 5]  fitted=[20. 30. 30. 60. 70. 70.]  (8 h, 8 mocks) -&gt; 160.0
eps=2: w=[11.  9.] b=-1.000  SVs=[1, 2, 3, 5]  fitted=[19. 30. 28. 59. 70. 68.]  (8 h, 8 mocks) -&gt; 159.0
eps=5: w=[8. 8.] b=9.000  SVs=[1, 4]  fitted=[25. 33. 33. 57. 65. 65.]  (8 h, 8 mocks) -&gt; 137.0
residuals: [-5. -5. -3.  5.  5.  1.]  eps-insensitive loss: [0. 0. 0. 0. 0. 0.]</div>
<figure class="viz"><svg viewBox="0 0 620 275" width="620">
<text x="60.0" y="250" text-anchor="middle" class="tm" font-size="10">0</text>
<text x="100.0" y="250" text-anchor="middle" class="tm" font-size="10">1</text>
<text x="140.0" y="250" text-anchor="middle" class="tm" font-size="10">2</text>
<text x="180.0" y="250" text-anchor="middle" class="tm" font-size="10">3</text>
<text x="220.0" y="250" text-anchor="middle" class="tm" font-size="10">4</text>
<text x="260.0" y="250" text-anchor="middle" class="tm" font-size="10">5</text>
<text x="300.0" y="250" text-anchor="middle" class="tm" font-size="10">6</text>
<text x="340.0" y="250" text-anchor="middle" class="tm" font-size="10">7</text>
<text x="380.0" y="250" text-anchor="middle" class="tm" font-size="10">8</text>
<text x="420.0" y="250" text-anchor="middle" class="tm" font-size="10">9</text>
<text x="52" y="239.0" text-anchor="end" class="tm" font-size="10">0</text><line x1="60" y1="235.0" x2="420" y2="235.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="52" y="165.7" text-anchor="end" class="tm" font-size="10">30</text><line x1="60" y1="161.7" x2="420" y2="161.7" stroke="currentColor" stroke-opacity="0.08"/>
<text x="52" y="92.3" text-anchor="end" class="tm" font-size="10">60</text><line x1="60" y1="88.3" x2="420" y2="88.3" stroke="currentColor" stroke-opacity="0.08"/>
<text x="52" y="19.0" text-anchor="end" class="tm" font-size="10">90</text><line x1="60" y1="15.0" x2="420" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="60" y1="235" x2="420" y2="235" stroke="currentColor"/><line x1="60" y1="15" x2="60" y2="235" stroke="currentColor"/>
<polygon points="60.0,200.8 420.0,24.8 420.0,49.2 60.0,225.2" class="fb" fill-opacity="0.5"/>
<line x1="60.0" y1="213.0" x2="420.0" y2="37.0" class="sb" stroke-width="2.4"/>
<circle cx="140.0" cy="186.1" r="5" fill="currentColor"/>
<circle cx="180.0" cy="166.6" r="5" fill="currentColor"/>
<circle cx="180.0" cy="166.6" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="180.0" cy="161.7" r="5" fill="currentColor"/>
<circle cx="300.0" cy="83.4" r="5" fill="currentColor"/>
<circle cx="340.0" cy="63.9" r="5" fill="currentColor"/>
<circle cx="340.0" cy="63.9" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle cx="340.0" cy="73.7" r="5" fill="currentColor"/>
<text x="240" y="268" text-anchor="middle" font-size="11">effort s = hours + mocks</text>
<text x="440" y="50" font-size="12">mark = 8·s + 9</text><text x="440" y="70" font-size="12">tube: ± ε = ± 5 marks</text>
<text x="440" y="94" font-size="11" class="tm">inside the tube: no loss</text><text x="440" y="110" font-size="11" class="tm">ringed: on the tube edge</text><text x="440" y="126" font-size="11" class="tm">= the 2 support vectors</text>
</svg><figcaption>Linear SVR (ε = 5) on the six students' marks. Because its w = (8, 8) treats hours and mocks equally, the prediction depends only on effort s. All six marks fit inside the ±5 tube, so the loss is zero and SVR chooses the flattest such line.</figcaption></figure>
  <p>ε = 0 behaves like least absolute deviations and uses all six students; ε = 5 uses only 2 as support vectors (sklearn reports S2 and S5, two of the four students exactly on the tube edge; when several points tie on the edge the solver may give some of them α = 0). Unlike KNN regression, a linear SVR extrapolates: a student with 8 hours and 8 mocks gets 137, beyond any mark seen (which is also a warning: marks cannot exceed 100).</p>
  <h3>At scale: RBF SVR on a noisy sine</h3>
<div class="fx" data-lang="py">from sklearn.metrics import root_mean_squared_error
rng = np.random.default_rng(0)
xs = np.sort(rng.uniform(0, 6, 200)).reshape(-1, 1)
ys = np.sin(xs).ravel() + rng.normal(0, 0.3, 200)
xa, xb, ya, yb = train_test_split(xs, ys, test_size=0.5, random_state=0)
print(" epsilon  support vectors  test RMSE")
for e in [0.0, 0.1, 0.3, 0.5, 1.0]:
    s = SVR(kernel="rbf", C=10, epsilon=e).fit(xa, ya)
    print(f"  {e:&lt;5}       {len(s.support_):3d} / {len(xa)}       {root_mean_squared_error(yb, s.predict(xb)):.3f}")
s = SVR(C=10, epsilon=0.3).fit(xa, ya)
print("prediction at x=20 (far outside 0..6):", s.predict([[20]]).round(3), " intercept:", s.intercept_.round(3))</div>
<div class="fx" data-lang="text"> epsilon  support vectors  test RMSE
  0.0         100 / 100       0.327
  0.1          76 / 100       0.322
  0.3          38 / 100       0.322
  0.5          11 / 100       0.327
  1.0           2 / 100       0.450
prediction at x=20 (far outside 0..6): [-0.014]  intercept: [-0.014]</div>
  <p>Raising ε from 0 to 0.5 cuts the support vectors from 100 to 11 at nearly the same test error: the tube absorbs the noise (σ = 0.3). At ε = 1.0 the tube is wider than the signal's wiggles and the error rises. Far from the data, an RBF SVR falls back to the intercept, because every RBF similarity fades to zero.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>ε is in the units of y. ε = 0.1 is tiny for house prices in rupees and huge for probabilities. Scale y (or choose ε relative to its spread), and tune C, ε and γ together.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> an SVM separates two classes. The institute also awards a third grade, Distinction. <b>Next: multiclass strategies.</b></div>

  <h2 id="svm-multi"><span class="num">11</span>Multiclass SVMs</h2>
  <p><strong>The question we can't answer yet:</strong> relabel the three top students (5,5), (6,5), (5,6) as Distinction. Now there are three classes, but an SVM has only two sides. How do we predict a grade for a new student at (4, 4)?</p>
  <h3>Two strategies</h3>
  <table class="tbl">
    <tr><th></th><th>One-vs-one (OvO)</th><th>One-vs-rest (OvR)</th></tr>
    <tr><td>Models</td><td>one per pair: k(k−1)/2 (3 classes → 3; 10 → 45)</td><td>one per class: k</td></tr>
    <tr><td>Each trained on</td><td>only the two classes' rows (small)</td><td>all rows (one class vs everything else)</td></tr>
    <tr><td>Prediction</td><td>each model votes; most votes wins</td><td>highest score wins</td></tr>
    <tr><td>Used by</td><td><code>SVC</code>, <code>NuSVC</code> (libsvm)</td><td><code>LinearSVC</code> (liblinear)</td></tr>
    <tr><td>Why</td><td>kernel cost grows ≈ n², so many small problems are cheaper</td><td>linear training is fast; k models are fewer</td></tr>
  </table>
  <h3>By hand: OvO votes for (4, 4)</h3>
  <p>The classes in alphabetical order are Distinction, Fail, Pass, so the three pairwise SVMs are D-vs-F, D-vs-P, F-vs-P. A positive score votes for the first class of the pair.</p>
  <table class="tbl">
    <tr><th>Pair</th><th>Score for (4, 4)</th><th>Vote</th></tr>
    <tr><td>Distinction vs Fail</td><td>+0.429</td><td>Distinction</td></tr>
    <tr><td>Distinction vs Pass</td><td>−0.333</td><td>Pass</td></tr>
    <tr><td>Fail vs Pass</td><td>−2.333</td><td>Pass</td></tr>
    <tr><td colspan="2"><strong>Votes</strong></td><td>Pass 2, Distinction 1, Fail 0 → <strong>Pass</strong></td></tr>
  </table>
<div class="fx" data-lang="py">yM = np.array(["Fail"] * 3 + ["Pass"] * 3 + ["Distinction"] * 3)   # the 3 top students now scored a distinction
ovo = SVC(kernel="linear", decision_function_shape="ovo").fit(XB, yM)
print("classes_:", ovo.classes_)
print("pairwise scores for (4,4) [D-F, D-P, F-P]:", ovo.decision_function([[4, 4]]).round(3))
print("predictions for (4,4), (2,2), (6,6):", ovo.predict([[4, 4], [2, 2], [6, 6]]))</div>
<div class="fx" data-lang="text">classes_: ['Distinction' 'Fail' 'Pass']
pairwise scores for (4,4) [D-F, D-P, F-P]: [[ 0.429 -0.333 -2.333]]
predictions for (4,4), (2,2), (6,6): ['Pass' 'Fail' 'Distinction']</div>
<div class="fx" data-lang="py">from sklearn.svm import LinearSVC
from sklearn.datasets import make_blobs
Xb4, yb4 = make_blobs(n_samples=200, centers=4, random_state=0)
ovo = SVC(kernel="linear", decision_function_shape="ovo").fit(Xb4, yb4)
ovr = SVC(kernel="linear").fit(Xb4, yb4)                  # default shape "ovr" (still trained one-vs-one)
lin = LinearSVC().fit(Xb4, yb4)                           # truly one-vs-rest
print("classes:", ovo.classes_)
print("SVC ovo decision shape:", ovo.decision_function(Xb4[:1]).shape, " (4*3/2 = 6 pairwise classifiers)")
print("SVC ovr decision shape:", ovr.decision_function(Xb4[:1]).shape)
print("LinearSVC coef_ shape  :", lin.coef_.shape, " (one weight vector per class)")
print("pairwise scores, row 0:", ovo.decision_function(Xb4[:1]).round(2), " -&gt; predicted", ovo.predict(Xb4[:1]))
print("accuracies: SVC", ovo.score(Xb4, yb4), " LinearSVC", lin.score(Xb4, yb4))</div>
<div class="fx" data-lang="text">classes: [0 1 2 3]
SVC ovo decision shape: (1, 6)  (4*3/2 = 6 pairwise classifiers)
SVC ovr decision shape: (1, 4)
LinearSVC coef_ shape  : (4, 2)  (one weight vector per class)
pairwise scores, row 0: [[-1.    1.52  8.36  2.79  1.54  2.26]]  -&gt; predicted [1]
accuracies: SVC 0.925  LinearSVC 0.92</div>
  <p>On four blob classes, <code>SVC</code> trains 6 pairwise models; with the default <code>decision_function_shape="ovr"</code> it still trains one-vs-one but reshapes the output into one column per class. <code>LinearSVC</code> trains 4 one-vs-rest models (one weight vector per class). Accuracies are similar.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>OvO votes can tie (each class wins once with three classes); libsvm then breaks ties using the summed confidences, so results can depend on class order. With many classes (hundreds), OvO's k(k−1)/2 models become slow at prediction time.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> the SVM says "Pass" with score +1, but a counsellor asks "how likely is Q to pass?". A score is not a probability. <b>Next: probabilities and calibration.</b></div>

  <h2 id="svm-prob"><span class="num">12</span>Probabilities and Calibration</h2>
  <p><strong>The question we can't answer yet:</strong> the six students' scores under the hard-margin line are −1.667, −1, −1, +1, +1.667, +1.667. What is P(Pass) for a student with score +1? The hinge loss never asked the model to make that meaningful.</p>
  <h3>Platt scaling by hand</h3>
  <p>John Platt's idea (1999): pass the score through a sigmoid, P(y = 1 | f) = 1 / (1 + exp(A·f + B)), and fit A and B by logistic regression on held-out scores. With A = −1.5, B = 0 (made-up values for illustration):</p>
  <ul>
    <li>f = +1: 1 / (1 + e^(−1.5)) = 1 / (1 + 0.223) = <strong>0.818</strong>.</li>
    <li>f = −1: 1 / (1 + e^(1.5)) = 1 / (1 + 4.482) = <strong>0.182</strong>.</li>
    <li>f = +1.667: 1 / (1 + e^(−2.5)) = <strong>0.924</strong>.</li>
  </ul>
<div class="fx" data-lang="py">f6 = hard.decision_function(X6)                       # the six students' scores under the hard-margin line
A, B = -1.5, 0.0                                      # Platt parameters (in practice fitted on held-out data)
print("f        :", f6.round(3))
print("P(Pass|f):", (1 / (1 + np.exp(A * f6 + B))).round(3))</div>
<div class="fx" data-lang="text">f        : [-1.667 -1.    -1.     1.     1.667  1.667]
P(Pass|f): [0.076 0.182 0.182 0.818 0.924 0.924]</div>
  <h3>scikit-learn 1.9: <code>probability=True</code> is deprecated</h3>
  <p>For years the way to get probabilities was <code>SVC(probability=True)</code>, which ran an internal 5-fold cross-validation to fit Platt's A and B. In the installed scikit-learn 1.9 this raises a warning:</p>
<div class="fx" data-lang="py">import warnings
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    SVC(probability=True).fit(Xtr, ytr)
print(caught[0].category.__name__ + ":", caught[0].message)</div>
<div class="fx" data-lang="text">FutureWarning: The \`probability\` parameter was deprecated in 1.9 and will be removed in version 1.11. Use \`CalibratedClassifierCV(SVC(), ensemble=False)\` instead of \`SVC(probability=True)\`</div>
  <p>It says: the parameter is deprecated in 1.9 and will be removed in 1.11, and the replacement is <code>CalibratedClassifierCV(SVC(), ensemble=False)</code>. That wrapper does the same job in the open: it gets cross-validated scores from the SVC, fits a calibrator on them (sigmoid = Platt, or isotonic), and with <code>ensemble=False</code> refits one SVC on all the data so that prediction uses a single model. It also works for any classifier, which is why scikit-learn is removing the special SVC path.</p>
<div class="fx" data-lang="py">from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import log_loss, brier_score_loss
base = make_pipeline(StandardScaler(), SVC(C=1, gamma=1))
for method in ["sigmoid", "isotonic"]:
    cal = CalibratedClassifierCV(base, method=method, cv=5, ensemble=False).fit(Xtr, ytr)
    pr = cal.predict_proba(Xte)[:, 1]
    print(f"{method:8s}: log loss {log_loss(yte, pr):.3f}  Brier {brier_score_loss(yte, pr):.3f}"
          f"  P(class 1) for first 3 test rows {pr[:3].round(3)}")
svm_only = base.fit(Xtr, ytr)
print("raw decision_function, first 3 rows:", svm_only.decision_function(Xte[:3]).round(3), " true labels:", yte[:3])
agree = (cal.predict(Xte) == svm_only.predict(Xte)).mean()
print(f"calibrated argmax agrees with SVC.predict on {agree:.3f} of test rows")</div>
<div class="fx" data-lang="text">sigmoid : log loss 0.345  Brier 0.099  P(class 1) for first 3 test rows [0.023 0.973 0.072]
isotonic: log loss 0.923  Brier 0.101  P(class 1) for first 3 test rows [0.    1.    0.052]
raw decision_function, first 3 rows: [-1.552  1.409 -1.069]  true labels: [0 0 1]
calibrated argmax agrees with SVC.predict on 1.000 of test rows</div>
  <p>Sigmoid (Platt) calibration gives a log loss of 0.345 and Brier score 0.099 on the moons test set. Isotonic calibration has a similar Brier score but a far worse log loss (0.923): with 420 rows it produces some probabilities of exactly 0 and 1, and a single confident mistake costs a huge log loss. Prefer sigmoid for small data, isotonic for large. The calibrated model's predicted class agrees with <code>SVC.predict</code> on every test row here; in general the two can disagree near the boundary, because calibration is fitted separately.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Platt scaling</strong>: P(y=1 | f) = σ(−(A·f + B)) with A, B fitted by maximum likelihood on held-out decision values. Use <code>CalibratedClassifierCV(SVC(), method="sigmoid", ensemble=False)</code>. Without calibration, use <code>decision_function</code> scores for ranking (ROC-AUC) and thresholds; see <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not write new code with <code>SVC(probability=True)</code>: it is deprecated, slow (5 extra fits), and its <code>predict_proba</code> can disagree with <code>predict</code>. Calibrating on the same rows used to train the SVM gives over-confident probabilities; always calibrate on held-out folds (which CalibratedClassifierCV does).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we can now classify, regress and give probabilities on six students instantly. Would it still be instant on six million? <b>Next: cost, scale and when to use an SVM.</b></div>

  <h2 id="svm-cost"><span class="num">13</span>Cost, Scale and When to Use It</h2>
  <p><strong>The question we can't answer yet:</strong> with six students the Gram matrix is 6 × 6. With n students it is n × n. How does training time grow, and what are the alternatives when n is large or one class is rare?</p>
  <h3>How the cost grows</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Training</th><th>Memory</th><th>Prediction per row</th></tr>
    <tr><td>Kernel SVC (libsvm, SMO)</td><td>between O(n²) and O(n³)</td><td>kernel cache, up to O(n²)</td><td>O(#SV · d)</td></tr>
    <tr><td>LinearSVC (liblinear)</td><td>≈ O(n · d) per pass</td><td>O(n · d)</td><td>O(d)</td></tr>
    <tr><td>SGDClassifier(loss="hinge")</td><td>O(n · d) per epoch, streams</td><td>O(d)</td><td>O(d)</td></tr>
    <tr><td>Nystroem / RBFSampler + linear</td><td>O(n · m · d) for m components</td><td>O(n · m)</td><td>O(m · d)</td></tr>
  </table>
<div class="fx" data-lang="py">import time
from sklearn.datasets import make_classification
print("     n    SVC rbf fit (s)   #SV    LinearSVC fit (s)")
for n in [1000, 2000, 4000, 8000]:
    Xn, yn = make_classification(n_samples=n, n_features=20, flip_y=0.1, random_state=0)
    t0 = time.perf_counter(); s = SVC().fit(Xn, yn); t1 = time.perf_counter() - t0
    t0 = time.perf_counter(); LinearSVC().fit(Xn, yn); t2 = time.perf_counter() - t0
    print(f"{n:6d}      {t1:6.3f}        {len(s.support_):5d}       {t2:6.3f}")</div>
<div class="fx" data-lang="text">     n    SVC rbf fit (s)   #SV    LinearSVC fit (s)
  1000       0.064          429        0.003
  2000       0.111          673        0.003
  4000       0.482         1869        0.009
  8000       1.843         3642        0.012</div>
  <p>(Times vary by machine; the pattern does not.) Going from 1,000 to 8,000 rows (8 times the data) multiplies the kernel SVC's fit time by far more than 8, and the number of support vectors (and hence prediction cost) grows with n on noisy data. LinearSVC stays in milliseconds. A middle way is to approximate the RBF kernel with explicit features, <code>make_pipeline(Nystroem(n_components=300), LinearSVC())</code> or <code>RBFSampler</code>, whose cost grows linearly in n; it pays off from roughly a hundred thousand rows upward.</p>
  <h3>Imbalanced classes: class_weight</h3>
  <p>With 10% positives, the cheapest way to reduce Σξ is to let the minority's points pay: the street drifts into the minority class. <code>class_weight</code> multiplies C per class, so violations by the rare class cost more.</p>
<div class="fx" data-lang="py">from sklearn.metrics import recall_score, balanced_accuracy_score
Xi, yi = make_classification(n_samples=2000, n_features=4, n_informative=3, n_redundant=0,
                             weights=[0.9, 0.1], class_sep=0.8, random_state=0)
Xa, Xb2, ya2, yb2 = train_test_split(Xi, yi, test_size=0.5, stratify=yi, random_state=0)
for cw in [None, "balanced", {0: 1, 1: 3}]:
    p = make_pipeline(StandardScaler(), SVC(class_weight=cw)).fit(Xa, ya2)
    pr = p.predict(Xb2)
    print(f"class_weight={str(cw):15s} recall(class 1) {recall_score(yb2, pr):.3f}  balanced acc {balanced_accuracy_score(yb2, pr):.3f}")</div>
<div class="fx" data-lang="text">class_weight=None            recall(class 1) 0.183  balanced acc 0.591
class_weight=balanced        recall(class 1) 0.865  balanced acc 0.861
class_weight={0: 1, 1: 3}    recall(class 1) 0.596  balanced acc 0.777</div>
  <p>Without weights the SVM finds only 18% of the minority. <code>class_weight="balanced"</code> (weights n / (k · count) = about 1 and 4.8 here) raises minority recall to 0.865 and balanced accuracy to 0.861. A manual 1:3 weight sits in between.</p>
  <h3>When to use an SVM</h3>
  <div class="cards">
    <div><b>Good fit</b><p>Small-to-medium data (up to tens of thousands of rows), many features relative to rows (text, genomics), clear margins, curved boundaries with RBF.</p><small>Strong accuracy with few hyperparameters</small></div>
    <div><b>Poor fit</b><p>Hundreds of thousands of rows with a kernel; need for calibrated probabilities or easy explanations; messy tabular data with mixed types and missing values.</p><small>Use boosting or logistic regression</small></div>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we have used sklearn's SVM classes piece by piece. <b>Next: every parameter in one place and a proper C × γ search.</b></div>

  <h2 id="svm-sklearn"><span class="num">14</span>scikit-learn in Practice</h2>
  <p><strong>The question we can't answer yet:</strong> which sklearn class should we use for which job, what does every parameter do, and how do we tune C and γ honestly?</p>
  <h3>The classes</h3>
  <table class="tbl">
    <tr><th>Class</th><th>Use</th><th>Notes</th></tr>
    <tr><td><code>SVC</code></td><td>kernel classification</td><td>libsvm, OvO; <code>probability</code> deprecated in 1.9</td></tr>
    <tr><td><code>NuSVC</code></td><td>same, parameterised by ν</td><td>ν ∈ (0, 1] bounds the share of support vectors / margin errors</td></tr>
    <tr><td><code>LinearSVC</code></td><td>large linear problems</td><td>liblinear, OvR, squared hinge by default, penalises b too</td></tr>
    <tr><td><code>SVR</code>, <code>NuSVR</code>, <code>LinearSVR</code></td><td>regression</td><td>ε-tube</td></tr>
    <tr><td><code>OneClassSVM</code></td><td>novelty / anomaly detection</td><td>learns a boundary around "normal" data</td></tr>
  </table>
  <h3>Every SVC parameter</h3>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>Meaning</th></tr>
    <tr><td><code>C</code></td><td>1.0</td><td>Price of violations (inverse regularisation)</td></tr>
    <tr><td><code>kernel</code></td><td>"rbf"</td><td>"linear", "poly", "rbf", "sigmoid", "precomputed" or a callable</td></tr>
    <tr><td><code>degree</code></td><td>3</td><td>Polynomial degree (poly only)</td></tr>
    <tr><td><code>gamma</code></td><td>"scale"</td><td>1/(n_features · X.var()); or "auto" = 1/n_features; or a number</td></tr>
    <tr><td><code>coef0</code></td><td>0.0</td><td>The constant r in poly and sigmoid</td></tr>
    <tr><td><code>shrinking</code></td><td>True</td><td>Solver heuristic; speed only</td></tr>
    <tr><td><code>probability</code></td><td>False</td><td>Deprecated in 1.9; use CalibratedClassifierCV</td></tr>
    <tr><td><code>tol</code></td><td>1e-3</td><td>Stopping tolerance (we used 1e-10 to see exact values)</td></tr>
    <tr><td><code>cache_size</code></td><td>200 (MB)</td><td>Kernel cache; raise it for big data</td></tr>
    <tr><td><code>class_weight</code></td><td>None</td><td>Per-class multiplier on C; "balanced"</td></tr>
    <tr><td><code>max_iter</code></td><td>−1</td><td>No limit; set one if training hangs on non-separable data with huge C</td></tr>
    <tr><td><code>decision_function_shape</code></td><td>"ovr"</td><td>Output shape only; training is always OvO</td></tr>
    <tr><td><code>break_ties</code></td><td>False</td><td>Use confidences to break OvR ties (slower)</td></tr>
  </table>
  <p>Fitted attributes: <code>support_</code> (row indices), <code>support_vectors_</code>, <code>n_support_</code> (per class), <code>dual_coef_</code> (αᵢyᵢ), <code>intercept_</code> (b), <code>coef_</code> (w, linear kernel only), <code>classes_</code>.</p>
  <h3>Tuning C and γ together</h3>
<div class="fx" data-lang="py">from sklearn.model_selection import GridSearchCV
pipe = make_pipeline(StandardScaler(), SVC())
grid = GridSearchCV(pipe, {"svc__C": [0.1, 1, 10, 100], "svc__gamma": [0.01, 0.1, 1, 10]}, cv=5, n_jobs=1)
grid.fit(Xtr, ytr)
print("best:", grid.best_params_, " CV acc", round(grid.best_score_, 3), " test acc", round(grid.score(Xte, yte), 3))
res = grid.cv_results_["mean_test_score"].reshape(4, 4)
print("CV accuracy (rows C = 0.1, 1, 10, 100; columns gamma = 0.01, 0.1, 1, 10):\\n", res.round(3))</div>
<div class="fx" data-lang="text">best: {'svc__C': 0.1, 'svc__gamma': 10}  CV acc 0.905  test acc 0.883
CV accuracy (rows C = 0.1, 1, 10, 100; columns gamma = 0.01, 0.1, 1, 10):
 [[0.869 0.876 0.895 0.905]
 [0.869 0.881 0.902 0.902]
 [0.874 0.895 0.905 0.898]
 [0.871 0.905 0.9   0.876]]</div>
  <p>The grid shows the interaction: the best cells run along a diagonal (C = 0.1 with γ = 10, C = 10 with γ = 1, C = 100 with γ = 0.1 are all about 0.90). Large γ needs small C and vice versa, because both control how tightly the boundary follows individual points. Differences of 0.01 on 420 rows are noise; the untouched test set gives 0.883.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Grids over C and γ should be logarithmic (0.01, 0.1, 1, 10, 100), not linear. And never search with the scaler outside the pipeline: <code>svc__C</code> naming only works because the SVC is a pipeline step.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> sklearn solved every problem for us. Could we solve the SVM problem ourselves and get the same answer? <b>Next: from scratch.</b></div>

  <h2 id="svm-scratch"><span class="num">15</span>From Scratch</h2>
  <p><strong>The question we can't answer yet:</strong> is the SVM really "just" the optimisation problems written in sections 03 and 05, or does sklearn do something extra? Let us solve both with general-purpose tools and compare.</p>
  <h3>Hard margin with a generic optimiser</h3>
  <p>The primal of section 03 is a small constrained problem in three numbers (w₁, w₂, b). scipy's SLSQP solver accepts an objective and inequality constraints directly.</p>
<div class="fx" data-lang="py">from scipy.optimize import minimize
# variables v = (w1, w2, b); minimise 1/2 ||w||^2 subject to y_i (w.x_i + b) - 1 &gt;= 0 for every student
res = minimize(lambda v: 0.5 * v[:2] @ v[:2], x0=np.zeros(3), method="SLSQP",
               constraints=[{"type": "ineq", "fun": lambda v: y6 * (X6 @ v[:2] + v[2]) - 1}])
print("hard margin by a generic optimiser: w =", res.x[:2].round(4), " b =", round(res.x[2], 4), " sklearn:", hard.coef_[0].round(4), round(hard.intercept_[0], 4))</div>
<div class="fx" data-lang="text">hard margin by a generic optimiser: w = [0.6667 0.6667]  b = -3.0  sklearn: [0.6667 0.6667] -3.0</div>
  <p>Exactly w = (2/3, 2/3), b = −3: the hand answer and sklearn's.</p>
  <h3>Soft margin by subgradient descent</h3>
  <p>The hinge form of section 06 is unconstrained: ½‖w‖² + C Σ max(0, 1 − yᵢf(xᵢ)). It is not differentiable at the kink, but a <em>subgradient</em> works: for students with y·f &lt; 1 the hinge contributes −C·yᵢxᵢ to the gradient of w (and −C·yᵢ for b); for the others nothing. We take shrinking steps and keep the best point seen.</p>
<div class="fx" data-lang="py">def soft_svm_subgradient(X, y, C, steps=20000, lr0=0.1):
    """Minimise 1/2||w||^2 + C * sum(hinge) by subgradient descent; keep the best point seen."""
    w, b = np.zeros(X.shape[1]), 0.0
    best = (np.inf, w.copy(), b)
    for t in range(1, steps + 1):
        inside = y * (X @ w + b) &lt; 1                          # students with non-zero hinge loss
        gw = w - C * (y[inside, None] * X[inside]).sum(axis=0)
        gb = -C * y[inside].sum()
        lr = lr0 / np.sqrt(t)                                 # shrinking step size
        w, b = w - lr * gw, b - lr * gb
        obj = 0.5 * w @ w + C * np.maximum(0, 1 - y * (X @ w + b)).sum()
        if obj &lt; best[0]:
            best = (obj, w.copy(), b)
    return best

for C in [0.1, 1, 10]:
    obj, w, b = soft_svm_subgradient(X7, y7, C)
    sk = SVC(kernel="linear", C=C, tol=1e-10).fit(X7, y7)
    ws, bs = sk.coef_[0], sk.intercept_[0]
    obj_sk = 0.5 * ws @ ws + C * np.maximum(0, 1 - y7 * (X7 @ ws + bs)).sum()
    print(f"C={C:&lt;4} scratch w={w.round(3)} b={b:7.3f} obj={obj:.4f} | sklearn w={ws.round(3)} b={bs:7.3f} obj={obj_sk:.4f}")</div>
<div class="fx" data-lang="text">C=0.1  scratch w=[0.418 0.418] b= -1.928 obj=0.3985 | sklearn w=[0.45 0.45] b= -2.250 obj=0.3975
C=1    scratch w=[0.503 0.503] b= -2.523 obj=1.7500 | sklearn w=[0.5 0.5] b= -2.500 obj=1.7500
C=10   scratch w=[2.006 2.006] b=-11.031 obj=4.0328 | sklearn w=[2. 2.] b=-11.000 obj=4.0000</div>
  <p>For C = 1 the scratch solver reaches the same objective (1.7500) and almost the same line. For C = 0.1 and C = 10 its objective is within 0.001 and 0.033 of sklearn's: subgradient descent zig-zags near the kink and converges slowly, which is why real solvers use the dual with SMO (libsvm), coordinate descent (liblinear) or Pegasos-style stochastic steps. The kernel prediction formula was already reproduced exactly in section 08.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The objectives are equal at C = 0.1 to three decimals while the lines differ (0.418 vs 0.45): near the optimum the objective is flat, so many nearby (w, b) are almost equally good. Compare objective values, not raw coefficients, when testing a solver.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> we know how the SVM works; we have not placed it against the other models we know. <b>Next: strengths and comparisons.</b></div>

  <h2 id="svm-compare"><span class="num">16</span>Strengths, Weaknesses and Comparisons</h2>
  <p><strong>The question we can't answer yet:</strong> given the six students (or a real dataset), why choose an SVM rather than logistic regression, KNN or a tree?</p>
  <div class="cards">
    <div><b>Maximum margin</b><p>A principled boundary that depends only on border points; robust to points far from the boundary.</p><small>Good generalisation with little data</small></div>
    <div><b>Kernels</b><p>Curved boundaries without hand-built features; works with any similarity (strings, graphs) via custom kernels.</p><small>RBF is a strong default</small></div>
    <div><b>High dimensions</b><p>Works when features outnumber rows (text, genes); the margin, not d, controls complexity.</p><small>Linear SVM on TF-IDF is a classic</small></div>
    <div><b>Convex</b><p>One global optimum; same answer every run.</p><small>No random restarts</small></div>
  </div>
  <div class="cards">
    <div><b>Scales badly with n</b><p>Kernel training ~n² to n³; memory for the kernel cache.</p><small>LinearSVC / Nystroem beyond ~100k</small></div>
    <div><b>Needs scaling and tuning</b><p>Sensitive to units; C and γ interact.</p><small>Pipeline + log grid</small></div>
    <div><b>No probabilities</b><p>Scores only; calibration needs extra fits.</p><small>CalibratedClassifierCV</small></div>
    <div><b>Hard to explain</b><p>Kernel models have no coefficients; support vectors are not a story for a manager.</p><small>Use SHAP or simpler models</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>SVM</th><th><a class="xref" data-note="ml_classification">Logistic Regression</a></th><th><a class="xref" data-note="ml_knn">KNN</a></th><th><a class="xref" data-note="ml_naivebayes">Naive Bayes</a></th><th><a class="xref" data-note="ml_dtree">Decision Tree</a></th></tr>
    <tr><td>Loss</td><td>hinge</td><td>log loss</td><td>none (votes)</td><td>likelihood (counting)</td><td>impurity</td></tr>
    <tr><td>Boundary</td><td>max-margin line, or any shape with kernels</td><td>straight</td><td>any shape</td><td>straight / quadratic</td><td>axis-aligned boxes</td></tr>
    <tr><td>Points that matter</td><td>support vectors only</td><td>all, weighted by error</td><td>the k nearest</td><td>all (through counts)</td><td>all (through splits)</td></tr>
    <tr><td>Probabilities</td><td>needs calibration</td><td>good</td><td>coarse</td><td>too extreme</td><td>coarse</td></tr>
    <tr><td>Scaling needed</td><td>yes</td><td>yes (with penalty)</td><td>yes</td><td>no</td><td>no</td></tr>
    <tr><td>Large n</td><td>linear only</td><td>excellent</td><td>slow prediction</td><td>excellent</td><td>good</td></tr>
    <tr><td>Main knobs</td><td>C, kernel, γ</td><td>C</td><td>k, weights</td><td>α smoothing</td><td>depth, leaf size</td></tr>
  </table>
  <p><strong>SVM vs logistic regression</strong>, the classic interview question: same "penalty + loss" recipe, different loss. Logistic regression gives probabilities and uses every point; a linear SVM ignores points beyond the margin and often wins slightly when classes are well separated. With a kernel, an SVM is an RBF-similarity model with learned, sparse weights; logistic regression would need hand-built features. <strong>SVM vs KNN</strong>: both use similarity to training points, but the RBF SVM learns which points matter (α) and keeps few of them, while KNN keeps all and weights them equally.</p>
  <div class="bridge"><b>What this still can't tell us →</b> we have seen every concept and every comparison, but not the whole note at once. <b>Next: how it all connects.</b></div>

  <h2 id="svm-connect"><span class="num">17</span>How It All Connects</h2>
  <p><strong>The question we can't answer yet:</strong> how does each concept in this note grow out of the one before, which question does each answer, and what are all the numbers for the six students side by side?</p>
<figure class="viz"><svg viewBox="0 0 660 360" width="660">
<defs><marker id="svm-cx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="15" width="140" height="44" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.5"/><text x="80.0" y="33" text-anchor="middle" font-size="12" font-weight="700">Score w·x + b (02)</text><text x="80.0" y="49" text-anchor="middle" font-size="10.5" class="tm">sign = class</text>
<rect x="175" y="15" width="145" height="44" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.5"/><text x="247.5" y="33" text-anchor="middle" font-size="12" font-weight="700">Distance |f|/‖w‖ (02)</text><text x="247.5" y="49" text-anchor="middle" font-size="10.5" class="tm">S4: 1.061</text>
<rect x="345" y="15" width="145" height="44" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.5"/><text x="417.5" y="33" text-anchor="middle" font-size="12" font-weight="700">Hard margin (03)</text><text x="417.5" y="49" text-anchor="middle" font-size="10.5" class="tm">min ½‖w‖²: margin 2.121</text>
<rect x="515" y="15" width="135" height="44" rx="8" class="fb" stroke="currentColor" stroke-opacity="0.5"/><text x="582.5" y="33" text-anchor="middle" font-size="12" font-weight="700">Dual α (04)</text><text x="582.5" y="49" text-anchor="middle" font-size="10.5" class="tm">2/9, 2/9, 4/9</text>
<line x1="150" y1="37" x2="173" y2="37" stroke="currentColor" marker-end="url(#svm-cx)"/>
<line x1="320" y1="37" x2="343" y2="37" stroke="currentColor" marker-end="url(#svm-cx)"/>
<line x1="490" y1="37" x2="513" y2="37" stroke="currentColor" marker-end="url(#svm-cx)"/>
<rect x="345" y="100" width="145" height="44" rx="8" class="ft" stroke="currentColor" stroke-opacity="0.5"/><text x="417.5" y="118" text-anchor="middle" font-size="12" font-weight="700">Soft margin + C (05)</text><text x="417.5" y="134" text-anchor="middle" font-size="10.5" class="tm">S7: slack 1, C=1 obj 1.75</text>
<line x1="417" y1="59" x2="417" y2="98" stroke="currentColor" marker-end="url(#svm-cx)"/>
<rect x="175" y="100" width="145" height="44" rx="8" class="ft" stroke="currentColor" stroke-opacity="0.5"/><text x="247.5" y="118" text-anchor="middle" font-size="12" font-weight="700">Hinge loss (06)</text><text x="247.5" y="134" text-anchor="middle" font-size="10.5" class="tm">max(0, 1 − y·f)</text>
<line x1="345" y1="122" x2="322" y2="122" stroke="currentColor" marker-end="url(#svm-cx)"/>
<rect x="515" y="100" width="135" height="44" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.5"/><text x="582.5" y="118" text-anchor="middle" font-size="12" font-weight="700">Kernel trick (07)</text><text x="582.5" y="134" text-anchor="middle" font-size="10.5" class="tm">only dot products</text>
<line x1="582" y1="59" x2="582" y2="98" stroke="currentColor" marker-end="url(#svm-cx)"/>
<rect x="515" y="185" width="135" height="44" rx="8" class="fg" stroke="currentColor" stroke-opacity="0.5"/><text x="582.5" y="203" text-anchor="middle" font-size="12" font-weight="700">Kernels, γ, C (08)</text><text x="582.5" y="219" text-anchor="middle" font-size="10.5" class="tm">burnout: RBF 1.000</text>
<line x1="582" y1="144" x2="582" y2="183" stroke="currentColor" marker-end="url(#svm-cx)"/>
<rect x="345" y="185" width="145" height="44" rx="8" class="fr" stroke="currentColor" stroke-opacity="0.5"/><text x="417.5" y="203" text-anchor="middle" font-size="12" font-weight="700">Scaling (09)</text><text x="417.5" y="219" text-anchor="middle" font-size="10.5" class="tm">minutes → x1 = 2.5</text>
<line x1="400" y1="185" x2="260" y2="61" stroke="currentColor" stroke-dasharray="4 3" class="sr" marker-end="url(#svm-cx)"/>
<rect x="10" y="185" width="140" height="44" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="80.0" y="203" text-anchor="middle" font-size="12" font-weight="700">SVR (10)</text><text x="80.0" y="219" text-anchor="middle" font-size="10.5" class="tm">ε-tube: 8s + 9</text>
<rect x="175" y="185" width="145" height="44" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="247.5" y="203" text-anchor="middle" font-size="12" font-weight="700">Multiclass (11)</text><text x="247.5" y="219" text-anchor="middle" font-size="10.5" class="tm">OvO votes → Pass</text>
<rect x="10" y="100" width="140" height="44" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.5"/><text x="80.0" y="118" text-anchor="middle" font-size="12" font-weight="700">Platt / calibration (12)</text><text x="80.0" y="134" text-anchor="middle" font-size="10.5" class="tm">f = 1 → 0.818</text>
<line x1="175" y1="122" x2="152" y2="122" stroke="currentColor" marker-end="url(#svm-cx)"/>
<line x1="200" y1="144" x2="100" y2="183" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#svm-cx)"/>
<line x1="250" y1="144" x2="250" y2="183" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#svm-cx)"/>
<rect x="175" y="270" width="315" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="332.5" y="288" text-anchor="middle" font-size="12" font-weight="700">Cost (13): kernel matrix n × n</text><text x="332.5" y="304" text-anchor="middle" font-size="10.5" class="tm">LinearSVC / Nystroem when n is large</text>
<line x1="582" y1="229" x2="490" y2="290" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#svm-cx)"/>
<text x="330" y="340" text-anchor="middle" font-size="11" class="tm">Solid: each idea built from the previous one. Dashed: reused by (violet), breaks (red) or limits (grey).</text>
</svg><figcaption>The SVM note as one chain on the six students: score → distance → widest street → dual → soft margin = hinge loss; the dual's dot products open the kernel trick; the same machinery gives SVR, multiclass and (with Platt) probabilities.</figcaption></figure>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Built from</th><th>On the students</th><th>Sensitive to</th></tr>
    <tr><td>Score f = w·x + b</td><td>Which side?</td><td>weights w, bias b</td><td>S4: 1.5 (w = (1,1), b = −4.5)</td><td>scale of w (not meaningful alone)</td></tr>
    <tr><td>Distance |f|/‖w‖</td><td>How far from the line?</td><td>score ÷ length of w</td><td>S4: 1.061; S1: 1.768</td><td>units of the columns</td></tr>
    <tr><td>Margin 2/‖w‖</td><td>How wide is the street?</td><td>distance with |f| = 1 on the kerbs</td><td>2.121</td><td>a single close point (hard margin)</td></tr>
    <tr><td>Hard-margin primal</td><td>Which line is widest?</td><td>min ½‖w‖² with yᵢfᵢ ≥ 1</td><td>w = (2/3, 2/3), b = −3</td><td>any overlap → no solution</td></tr>
    <tr><td>Dual α</td><td>Which points matter, how much?</td><td>Lagrange multipliers; w = Σαᵢyᵢxᵢ</td><td>S2, S3: 2/9; S4: 4/9; Σα = ‖w‖² = 8/9</td><td>—</td></tr>
    <tr><td>Soft margin, C</td><td>What if one point does not fit?</td><td>slack ξᵢ priced at C</td><td>S7: C=1 → margin 2.828, objective 1.75</td><td>C (inverse regularisation)</td></tr>
    <tr><td>Hinge loss</td><td>How does it relate to other models?</td><td>ξᵢ = max(0, 1 − yᵢfᵢ)</td><td>S4: 0.5, S7: 1, others 0</td><td>—</td></tr>
    <tr><td>Kernel K(a, b)</td><td>How to bend the boundary cheaply?</td><td>dot products in the dual</td><td>(S3·S6)² = 121 = φ·φ; burnout: s = 4 and 9</td><td>choice of kernel</td></tr>
    <tr><td>γ (RBF)</td><td>How local is similarity?</td><td>exp(−γ‖a − b‖²)</td><td>S3–S6: 0.449 at γ = 0.1, 0.0003 at γ = 1</td><td>overfits when large</td></tr>
    <tr><td>Scaling</td><td>Are columns comparable?</td><td>z-scores</td><td>minutes → hours = 2.5; z-scored → diagonal again</td><td>leakage if fit on all data</td></tr>
    <tr><td>SVR</td><td>Predict a number?</td><td>ε-tube + flattest w</td><td>marks = 8s + 9, ε = 5</td><td>units of y (ε)</td></tr>
    <tr><td>OvO multiclass</td><td>More than two classes?</td><td>k(k−1)/2 binary SVMs vote</td><td>(4,4) → Pass, 2 votes</td><td>ties</td></tr>
    <tr><td>Platt scaling</td><td>A probability?</td><td>sigmoid of the score</td><td>f = 1 → 0.818 (A = −1.5)</td><td>needs held-out data</td></tr>
  </table>
  <h3>Which to reach for, when</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Reach for</th></tr>
    <tr><td>Linearly separable or many features (text)</td><td>LinearSVC (or SVC linear), tune C</td></tr>
    <tr><td>Curved boundary, up to tens of thousands of rows</td><td>SVC RBF in a pipeline with StandardScaler; log grid over C and γ</td></tr>
    <tr><td>Hundreds of thousands of rows</td><td>LinearSVC / SGDClassifier(hinge) / Nystroem + LinearSVC</td></tr>
    <tr><td>Need probabilities</td><td>CalibratedClassifierCV(SVC(), ensemble=False)</td></tr>
    <tr><td>Rare class</td><td>class_weight="balanced", then tune the threshold on decision_function</td></tr>
    <tr><td>Numeric target</td><td>SVR with ε matched to the noise in y</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us →</b> the map shows how the ideas fit; it does not list how people misuse them. <b>Next: common mistakes.</b></div>

  <h2 id="svm-traps"><span class="num">18</span>Common Mistakes</h2>
  <p><strong>The question we can't answer yet:</strong> which SVM mistakes actually happen in projects and interviews, in one list?</p>
  <div class="callout trap"><span class="label">Trap: not scaling</span>
    <p>Minutes instead of hours turned the best line into "hours = 2.5"; on wine, RBF drops from 0.983 to 0.663. Scale inside a pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: C backwards</span>
    <p>Large C = less regularisation (narrow street, risk of overfit). Small C = more regularisation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: tuning γ alone</span>
    <p>γ and C interact (the best cells lie on a diagonal). Search both on a log grid with CV.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: using probability=True</span>
    <p>Deprecated in scikit-learn 1.9 (removed in 1.11), slow, and can disagree with predict. Use <code>CalibratedClassifierCV(SVC(), ensemble=False)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading scores as probabilities or distances</span>
    <p>w·x + b changes when (w, b) is rescaled; only |w·x + b|/‖w‖ is a distance, and only a calibrated score is a probability.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: kernel SVM on huge data</span>
    <p>Fit time grows roughly n² to n³. Beyond ~100k rows switch to linear models or kernel approximations.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: huge C on overlapping data</span>
    <p>Imitating a hard margin with C = 10⁶ on non-separable data can make libsvm run for a very long time. Set <code>max_iter</code> or use a sensible C.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ignoring imbalance</span>
    <p>Minority recall 0.183 without weights vs 0.865 with <code>class_weight="balanced"</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ε in the wrong units (SVR)</span>
    <p>ε is measured in the target's units; scale y or choose ε from its spread.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us →</b> everything is explained, but spread over eighteen sections. <b>Next: the revision sheet.</b></div>

  <h2 id="svm-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: six students (hours, mocks), Fail = −1: S1 (1,1), S2 (2,1), S3 (1,2); Pass = +1: S4 (3,3), S5 (4,3), S6 (3,4). Extensions: S7 (2.5, 2.5) Fail; burnt-out Fail students (5,5), (6,5), (5,6); marks 20, 28, 30, 62, 70, 66.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question</th><th>Answer</th><th>Leaves open</th></tr>
    <tr><td>1. Widest street</td><td>Which of many separating lines?</td><td>The one farthest from the nearest point</td><td>How to measure distance</td></tr>
    <tr><td>2. Geometry</td><td>Side and distance?</td><td>sign(w·x + b); |w·x + b|/‖w‖; margin 2/‖w‖</td><td>How to find the best line</td></tr>
    <tr><td>3. Hard margin</td><td>Best line?</td><td>min ½‖w‖² s.t. yᵢ(w·xᵢ + b) ≥ 1</td><td>Why only 3 points matter</td></tr>
    <tr><td>4. Dual</td><td>Which points matter?</td><td>α &gt; 0 = support vectors; w = Σαᵢyᵢxᵢ; only dot products</td><td>Overlapping data</td></tr>
    <tr><td>5. Soft margin</td><td>What if a point does not fit?</td><td>Slack ξ priced at C</td><td>Link to other losses</td></tr>
    <tr><td>6. Hinge</td><td>SVM vs logistic?</td><td>Same recipe, hinge vs log loss</td><td>Only straight lines</td></tr>
    <tr><td>7. Kernel trick</td><td>Curved boundaries?</td><td>Replace xᵢ·xⱼ by K(xᵢ, xⱼ)</td><td>Which kernel</td></tr>
    <tr><td>8. Kernels</td><td>Which, and the knobs?</td><td>Linear, poly, RBF (γ); tune C, γ together</td><td>Units of columns</td></tr>
    <tr><td>9. Scaling</td><td>Different units?</td><td>Standardise in a pipeline</td><td>Numeric targets</td></tr>
    <tr><td>10. SVR</td><td>Predict numbers?</td><td>Flattest function inside a ±ε tube</td><td>More classes</td></tr>
    <tr><td>11. Multiclass</td><td>3+ classes?</td><td>OvO voting (SVC), OvR (LinearSVC)</td><td>Probabilities</td></tr>
    <tr><td>12. Probabilities</td><td>P(class)?</td><td>Platt sigmoid via CalibratedClassifierCV</td><td>Cost at scale</td></tr>
    <tr><td>13. Cost</td><td>Big data, rare classes?</td><td>n² – n³; LinearSVC, Nystroem; class_weight</td><td>—</td></tr>
  </table>
  <h3>Every formula</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Decision function</td><td>f(x) = w·x + b; predict sign f</td><td>w weights (normal to the boundary), b bias</td></tr>
    <tr><td>Distance to hyperplane</td><td>|w·x + b| / ‖w‖</td><td>‖w‖ = √Σwⱼ²</td></tr>
    <tr><td>Margin (canonical scaling)</td><td>2 / ‖w‖</td><td>nearest points have |f| = 1</td></tr>
    <tr><td>Hard-margin primal</td><td>min ½‖w‖² s.t. yᵢ(w·xᵢ + b) ≥ 1</td><td>yᵢ ∈ {−1, +1}</td></tr>
    <tr><td>Soft-margin primal</td><td>min ½‖w‖² + C Σξᵢ s.t. yᵢ(w·xᵢ + b) ≥ 1 − ξᵢ, ξᵢ ≥ 0</td><td>ξᵢ slack, C price of slack</td></tr>
    <tr><td>Hinge form</td><td>min ½‖w‖² + C Σ max(0, 1 − yᵢf(xᵢ))</td><td>z = y·f signed score</td></tr>
    <tr><td>Dual</td><td>max Σαᵢ − ½ΣΣαᵢαⱼyᵢyⱼK(xᵢ, xⱼ), 0 ≤ αᵢ ≤ C, Σαᵢyᵢ = 0</td><td>αᵢ Lagrange multipliers</td></tr>
    <tr><td>Weights from the dual</td><td>w = Σαᵢyᵢxᵢ; hard margin: ‖w‖² = Σαᵢ</td><td>sum over support vectors</td></tr>
    <tr><td>Kernel prediction</td><td>f(x) = Σαᵢyᵢ K(xᵢ, x) + b</td><td>dual_coef_ = αᵢyᵢ</td></tr>
    <tr><td>Kernels</td><td>linear a·b; poly (γa·b + r)^d; RBF exp(−γ‖a − b‖²)</td><td>γ, r = coef0, d = degree</td></tr>
    <tr><td>gamma="scale"</td><td>1 / (n_features · Var(X))</td><td>0.5 for two standardised columns</td></tr>
    <tr><td>ε-insensitive loss</td><td>max(0, |y − f| − ε)</td><td>ε tube half-width</td></tr>
    <tr><td>Platt scaling</td><td>P(y=1|f) = 1 / (1 + exp(A·f + B))</td><td>A, B fitted on held-out scores</td></tr>
    <tr><td>OvO model count</td><td>k(k − 1)/2</td><td>k classes</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th></tr>
    <tr><td>Smallest distance of candidate lines</td><td>hours = 2.5: 0.5 · mocks = 2.5: 0.5 · x1+x2 = 4: 0.707 · x1+x2 = 4.5: 1.061</td></tr>
    <tr><td>Hard-margin solution</td><td>w = (2/3, 2/3), b = −3, ‖w‖ = 0.943, margin 2.121, SVs S2, S3, S4</td></tr>
    <tr><td>Dual</td><td>α = 2/9, 2/9, 4/9; Σαᵢyᵢ = 0; ‖w‖² = Σα = 8/9; f(3,2) = 0.333</td></tr>
    <tr><td>Soft margin with S7</td><td>C=0.1: margin 3.143, obj 0.398 · C=1: 2.828, 1.750 · C=2: 1.414, 3.0 · C=10: 0.707, 4.0</td></tr>
    <tr><td>Hinge at C = 1</td><td>S4: 0.5, S7: 1, others 0</td></tr>
    <tr><td>Kernel identity</td><td>S3 = (1,2), S6 = (3,4): (a·b)² = 121, (a·b + 1)² = 144</td></tr>
    <tr><td>Burnt-out students</td><td>linear 0.667; (s, s²) lift: f = −(s − 4)(s − 9)/6; poly, RBF 1.000</td></tr>
    <tr><td>RBF similarity S3–S6</td><td>‖a − b‖² = 8: γ=0.01 → 0.923, 0.1 → 0.449, 1 → 0.0003</td></tr>
    <tr><td>Minutes</td><td>boundary becomes hours ≈ 2.5 (mocks ignored); standardised → original line</td></tr>
    <tr><td>SVR (ε = 5)</td><td>marks = 8·hours + 8·mocks + 9; residuals −5, −5, −3, 5, 5, 1</td></tr>
    <tr><td>OvO for (4, 4)</td><td>D-F +0.429, D-P −0.333, F-P −2.333 → Pass</td></tr>
    <tr><td>Platt (A = −1.5)</td><td>f = −1 → 0.182, 1 → 0.818, 1.667 → 0.924</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use an SVM</b><p>Up to tens of thousands of rows, scaled numeric features or text, curved boundaries (RBF), many features relative to rows, when accuracy matters more than explanation.</p><small>Start: StandardScaler + SVC(), grid C, γ</small></div>
    <div><b>Avoid it</b><p>Very large n with a kernel, mixed raw tabular data with missing values, when calibrated probabilities or simple explanations are required.</p><small>Use logistic regression or gradient boosting</small></div>
  </div>
  <h3>Key traps</h3>
  <ul>
    <li><strong>No scaling</strong>: the margin and RBF distances follow the biggest units.</li>
    <li><strong>C direction</strong>: large C = less regularisation.</li>
    <li><strong>γ too large</strong>: train ≈ 1.00, test drops (0.81 on moons).</li>
    <li><strong>probability=True</strong>: deprecated in 1.9; use CalibratedClassifierCV(SVC(), ensemble=False).</li>
    <li><strong>Scores are not probabilities</strong> and not distances unless divided by ‖w‖.</li>
    <li><strong>Kernel SVM cost</strong> grows ≈ n² – n³.</li>
    <li><strong>Imbalance</strong>: use class_weight.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Distance of S4 (3,3) from x1 + x2 = 4.5?</td><td>|3 + 3 − 4.5| / √2 = 1.5 / 1.414 = 1.061</td></tr>
    <tr><td>Margin when w = (2/3, 2/3)?</td><td>2 / ‖w‖ = 2 / 0.943 = 2.121</td></tr>
    <tr><td>Hinge loss for a point with y·f = 0.5?</td><td>max(0, 1 − 0.5) = 0.5</td></tr>
    <tr><td>(a·b)² for a = (1,2), b = (3,4), and why it matters?</td><td>121 = φ(a)·φ(b) for the degree-2 lift, computed without lifting</td></tr>
    <tr><td>How many SVMs does one-vs-one train for 10 classes?</td><td>10 × 9 / 2 = 45</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us →</b> a summary does not prove you can explain it. <b>Next: questions to answer out loud.</b></div>

  <h2 id="svm-qa"><span class="num">19</span>Questions &amp; Answers</h2>
  <p><strong>The question we can't answer yet:</strong> can you explain every step of the ladder, with the six students' numbers, without looking? Answer each question before revealing it.</p>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does an SVM optimise, in one sentence?</summary><div class="qa-body">It finds the separating hyperplane with the largest margin (distance to the nearest training points), trading margin width against violations with C: minimise ½‖w‖² + C Σ max(0, 1 − yᵢ(w·xᵢ + b)).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the margin 2/‖w‖.</summary><div class="qa-body">Distance from x to w·x + b = 0 is |w·x + b|/‖w‖ (walking along the unit normal w/‖w‖ changes the score by ‖w‖ per unit). Rescale (w, b) so the nearest points have |w·x + b| = 1; each kerb is then 1/‖w‖ from the centre line, so the street is 2/‖w‖ wide. Six students: w = (2/3, 2/3), ‖w‖ = 0.943, margin 2.121.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why minimise ½‖w‖² instead of maximising 2/‖w‖?</summary><div class="qa-body">They have the same solution, but ½‖w‖² is a smooth convex quadratic, so with linear constraints the problem is a convex quadratic program with one global optimum and efficient solvers. The ½ just makes the derivative w instead of 2w.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are support vectors, and what happens if you delete a non-support vector?</summary><div class="qa-body">Training points with αᵢ &gt; 0: on the kerb, inside the street or misclassified. w = Σαᵢyᵢxᵢ uses only them, so deleting any other point (S1, S5 or S6 in our example) and retraining gives exactly the same boundary.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the α values for the six students.</summary><div class="qa-body">Support vectors S2 (2,1), S3 (1,2), S4 (3,3). Symmetry: α₂ = α₃ = α; balance Σαᵢyᵢ = 0 gives α₄ = 2α; w = 2α(3,3) − α(2,1) − α(1,2) = (3α, 3α) = (2/3, 2/3) → α = 2/9, α₄ = 4/9. Check: Σα = 8/9 = ‖w‖².</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does C do? What happens as C → ∞ and C → 0?</summary><div class="qa-body">C is the price per unit of slack. C → ∞: violations forbidden, hard margin (narrow street 0.707 once S7 is added; may not exist if data overlaps). C → 0: violations free, the street widens until almost every point is a support vector (416/420 at C = 0.01 on moons) and the model underfits. C is inverse regularisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>SVM vs logistic regression: what is the real difference?</summary><div class="qa-body">Both minimise L2 penalty + loss. SVM uses hinge max(0, 1 − yf), which is exactly 0 beyond the margin, so only support vectors matter and outputs are not probabilities. Logistic uses log loss, which is never 0, so every point pulls and outputs are calibrated-ish probabilities. In practice accuracy is often similar; logistic is preferred when probabilities are needed, SVM with kernels for curved boundaries on modest data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the kernel trick with numbers.</summary><div class="qa-body">The dual needs only dot products. For a = (1,2), b = (3,4) and φ(v) = (v₁², √2v₁v₂, v₂²): φ(a)·φ(b) = 9 + 48 + 64 = 121, and (a·b)² = 11² = 121. So K(a,b) = (a·b)² gives the lifted dot product without building φ. For RBF the lifted space is infinite-dimensional, so the kernel is the only way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does γ do in the RBF kernel, and how does it interact with C?</summary><div class="qa-body">K = exp(−γ‖a − b‖²): γ sets how fast similarity fades. Large γ → each point influences a tiny region → wiggly boundary, overfit (moons: train 0.98–1.00, test 0.81 at γ = 100). Small γ → nearly linear. Large γ pairs with small C and vice versa (the best grid cells lie on a diagonal), so tune both together on a log grid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be scaled for an SVM?</summary><div class="qa-body">The margin (‖w‖) and RBF distances depend on units. Recording the six students' hours in minutes turned the widest street into "hours = 2.5", ignoring mocks; standardising restored the diagonal line. On wine, RBF SVC goes 0.663 → 0.983 with scaling. Fit the scaler inside a pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does SVR work?</summary><div class="qa-body">It fits the flattest function such that residuals within ±ε cost nothing (ε-insensitive loss), paying C per unit beyond. Points inside the tube are not support vectors. Six students' marks with ε = 5: mark = 8·hours + 8·mocks + 9, all residuals within ±5, only two support vectors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does sklearn's SVC handle 3+ classes?</summary><div class="qa-body">One-vs-one: k(k−1)/2 binary SVMs, each on two classes' rows, then voting. For (4,4) with Fail/Pass/Distinction: D-vs-F votes D, D-vs-P votes P, F-vs-P votes P → Pass. decision_function_shape only changes the output shape. LinearSVC uses one-vs-rest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get probabilities from an SVM in scikit-learn 1.9?</summary><div class="qa-body"><code>SVC(probability=True)</code> is deprecated in 1.9 (removed in 1.11) and warns to use <code>CalibratedClassifierCV(SVC(), ensemble=False)</code>. That fits Platt's sigmoid P = 1/(1 + exp(A·f + B)) (or isotonic) on cross-validated scores and refits one SVC on all data. Example: A = −1.5, f = 1 → 0.818.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your dataset has 2 million rows. Would you use SVC(kernel="rbf")?</summary><div class="qa-body">No: training grows roughly n² to n³ (in our test 8 times the rows cost far more than 8 times the fit time) and the kernel cache does not fit. Use LinearSVC or SGDClassifier(loss="hinge"), a kernel approximation (Nystroem / RBFSampler) followed by a linear SVM, or gradient boosting for tabular data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is an RBF SVM related to KNN, and what comes after SVMs in this track?</summary><div class="qa-body">Both predict from similarity to training points. KNN uses the k nearest with equal (or 1/d) weights and keeps everything; an RBF SVM uses f(x) = Σαᵢyᵢexp(−γ‖xᵢ − x‖²) + b with learned, sparse weights, keeping only support vectors. Next come tree-based models, which need no scaling, handle mixed data and scale to millions of rows, and evaluation/calibration notes that turn scores into decisions.</div></details>
</main>
`
});
