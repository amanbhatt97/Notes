// notes/ml/ml_svm.js — Support Vector Machines
Object.assign(TOPIC_CONTENT, {
  "ml_svm": `<main>
  <h1>Support Vector Machines</h1>
  <div class="where"><span>Machine Learning</span><span>Classification</span><span>Support Vector Machines</span></div>
  <p class="lead">A support vector machine, or SVM, separates two classes with the widest possible empty "street" between them, and that street is decided only by the few training points that touch its edges. With a mathematical shortcut called the kernel trick, the same idea draws curved boundaries without ever building curved features. Before gradient boosting took over tabular data, SVMs were the strongest general-purpose classifiers, and they are still excellent on small-to-medium datasets with many features, such as text and genomics; interviewers love them because they connect geometry, optimisation and loss functions in one model. Our running example is deliberately tiny: six students described by (hours studied per day, mock tests taken), three who failed, S1 (1, 1), S2 (2, 1) and S3 (1, 2), and three who passed, S4 (3, 3), S5 (4, 3) and S6 (3, 4). We will solve the SVM on them by hand and then add one awkward student, three burnt-out students, marks and a third grade, always on top of the same six.</p>

  <h2 id="svm-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Support Vector Machines</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Geometry</div>
        <ul>
          <li>Boundary w·x + b = 0; predict the sign of w·x + b</li>
          <li>Distance to the boundary = |w·x + b| / ‖w‖</li>
          <li>Scale so the nearest points score ±1 → <b>margin = 2/‖w‖</b></li>
          <li><b>Support vectors</b>: the points that fix the street</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Optimisation</div>
        <ul>
          <li>Hard margin: min ½‖w‖² s.t. yᵢ(w·xᵢ + b) ≥ 1</li>
          <li>Soft margin: + C Σ ξᵢ; <b>C</b> = price of violations</li>
          <li>= L2 penalty + <b>hinge loss</b> max(0, 1 − y·f)</li>
          <li>Dual: w = Σ αᵢyᵢxᵢ, uses only dot products</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Kernels</div>
        <ul>
          <li>K(a, b) = φ(a)·φ(b) without building φ</li>
          <li>Linear, polynomial, <b>RBF</b> exp(−γ‖a − b‖²)</li>
          <li>Large γ → wiggly, overfits; tune C and γ together</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In practice</div>
        <ul>
          <li><b>Always scale</b> (pipeline with StandardScaler)</li>
          <li>SVR (ε-tube), multiclass one-vs-one</li>
          <li>No probabilities: CalibratedClassifierCV(SVC(), ensemble=False)</li>
          <li>Kernel cost ≈ n² to n³; LinearSVC for big data; class_weight</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="svm-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Widest Street</span><span class="rm-sub">many lines separate the students; which is best?</span></div></div>
      <div class="rm-item rm-done" data-target="svm-geom"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hyperplanes and the Margin</span><span class="rm-sub">w·x + b, distance to a line, 2/‖w‖</span></div></div>
      <div class="rm-item rm-done" data-target="svm-hard"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Hard-Margin SVM</span><span class="rm-sub">the widest street as an optimisation problem</span></div></div>
      <div class="rm-item rm-done" data-target="svm-dual"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Support Vectors and the Dual</span><span class="rm-sub">why only three students matter</span></div></div>
      <div class="rm-item rm-done" data-target="svm-soft"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Soft Margin and C</span><span class="rm-sub">paying for points that do not fit</span></div></div>
      <div class="rm-item rm-done" data-target="svm-hinge"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Hinge Loss</span><span class="rm-sub">SVM vs logistic regression</span></div></div>
      <div class="rm-item rm-done" data-target="svm-kernel"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The Kernel Trick</span><span class="rm-sub">curved boundaries without curved features</span></div></div>
      <div class="rm-item rm-done" data-target="svm-kernels"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Kernels, γ and C</span><span class="rm-sub">polynomial, RBF, and how to tune them</span></div></div>
      <div class="rm-item rm-done" data-target="svm-scale"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Feature Scaling</span><span class="rm-sub">why minutes instead of hours changes the line</span></div></div>
      <div class="rm-item rm-done" data-target="svm-svr"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Support Vector Regression</span><span class="rm-sub">a tube instead of a street</span></div></div>
      <div class="rm-item rm-done" data-target="svm-multi"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Multiclass and Probabilities</span><span class="rm-sub">one-vs-one voting, Platt scaling, the 1.9 change</span></div></div>
      <div class="rm-item rm-done" data-target="svm-practice"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">SVMs in Practice</span><span class="rm-sub">cost, imbalance, tuning, from scratch, when to use</span></div></div>
      <div class="rm-item rm-done" data-target="svm-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">scaling, C backwards, γ, probabilities</span></div></div>
      <div class="rm-item rm-done" data-target="svm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, kernels, the students' numbers</span></div></div>
      <div class="rm-item rm-done" data-target="svm-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on SVMs</span></div></div>
    </div>
  </div>

  <h2 id="svm-idea"><span class="num">01</span>The Widest Street</h2>
  <p>Plot the six students with hours across and mocks up. The three failing students sit in the bottom-left corner, the three passing students further up and to the right, and many different straight lines separate them perfectly. <a class="xref" data-note="ml_classification">Logistic regression</a> would give us one of those lines, chosen by fitting probabilities, and every training point would pull on it a little, even points far from the border. <a class="xref" data-note="ml_knn">KNN</a> would give a boundary made of local votes. Neither asks the question that matters most for the next student: how much room does the boundary leave?</p>
  <p>All the lines below make zero mistakes on these six students, so training accuracy cannot choose between them. But a line that passes very close to a student is fragile: the next student who is only slightly different from that one will land on the wrong side.</p>
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
  <p>To compare the lines, measure every student's distance from each line and keep the <em>smallest</em>, because the weakest point is what matters. (The distance formula is explained in the next section.)</p>
  <div class="fx" data-lang="py">import numpy as np
X6 = np.array([[1, 1], [2, 1], [1, 2], [3, 3], [4, 3], [3, 4]], dtype=float)   # (hours, mocks)
y6 = np.array([-1, -1, -1, 1, 1, 1])                                         # -1 = Fail, +1 = Pass
lines = {"x1 = 2.5":      (np.array([1, 0]), -2.5),        # each line written as w.x + b = 0
         "x2 = 2.5":      (np.array([0, 1]), -2.5),
         "x1 + x2 = 4":   (np.array([1, 1]), -4.0),
         "x1 + x2 = 4.5": (np.array([1, 1]), -4.5)}
for name, (w, b) in lines.items():
    dist = y6 * (X6 @ w + b) / np.linalg.norm(w)            # signed distance, positive = correct side
    print(f"{name:14s} distances {dist.round(3)}  smallest: {dist.min():.3f}")</div>
  <div class="fx" data-lang="text">x1 = 2.5       distances [1.5 0.5 1.5 0.5 1.5 0.5]  smallest: 0.500
x2 = 2.5       distances [1.5 1.5 0.5 0.5 0.5 1.5]  smallest: 0.500
x1 + x2 = 4    distances [1.414 0.707 0.707 1.414 2.121 2.121]  smallest: 0.707
x1 + x2 = 4.5  distances [1.768 1.061 1.061 1.061 1.768 1.768]  smallest: 1.061</div>
  <p>The vertical line hours = 2.5 passes only 0.5 from S2, S4 and S6, and the horizontal line mocks = 2.5 is just as tight. The diagonal x1 + x2 = 4 (hours + mocks = 4) does better, keeping everyone at least 0.707 away, but it sits closer to the Fail side than the Pass side. The diagonal x1 + x2 = 4.5, exactly halfway between the failing students' best total (3) and the passing students' worst total (6), keeps every student at least 1.061 away. Among all separating lines, an SVM chooses the one that <strong>maximises the smallest distance</strong>. That smallest distance is called the <strong>margin</strong>, and the empty band on either side of the line, twice the margin wide, is the "street".</p>
  <p>Think of building the widest possible road between two villages. Only the houses right at the roadside decide where the road can go; houses deep inside the villages do not matter, and you could demolish them without moving the road. In the SVM those roadside houses are called <strong>support vectors</strong>: the training points that sit exactly on the edges of the street and hold it in place. Here they are S2, S3 and S4.</p>
  <p>Why should the widest street work best on new data? A new student is like an old one plus a little noise. If every training student is at least 1.061 from the line, a new student has to differ from them by more than 1.061 to cross it. A wider margin means more tolerance for noise, and statistical learning theory makes this precise: it is the margin, not the number of features, that controls how complex the classifier really is. That is why SVMs work well even when there are more features than rows.</p>

  <h2 id="svm-geom"><span class="num">02</span>Hyperplanes and the Margin</h2>
  <p>To let a computer find the widest street, we need to describe a line with numbers, decide which side a point is on, and measure distances, in any number of dimensions. Write the boundary as <strong>w·x + b = 0</strong>, where x is a point (hours, mocks), w = (w₁, w₂) is a vector of weights and b is a number called the bias. For the line x1 + x2 = 4.5, w = (1, 1) and b = −4.5: 1 × hours + 1 × mocks − 4.5 = 0. Every point gets a <strong>score</strong> f(x) = w·x + b. A positive score means the Pass side (S4: 3 + 3 − 4.5 = +1.5), a negative score the Fail side (S1: 1 + 1 − 4.5 = −2.5), and zero means the point lies on the line. In three dimensions w·x + b = 0 is a flat plane, and in d dimensions it is called a <strong>hyperplane</strong>; the formulas do not change.</p>
  <p>The vector w has a geometric meaning: it points straight across the line. Take two points on the line, (2, 2.5) and (2.5, 2); their difference (−0.5, 0.5) runs along the line, and w·(−0.5, 0.5) = −0.5 + 0.5 = 0, so w is perpendicular to every direction along the line. It is the line's <strong>normal vector</strong>, pointing toward the Pass side. That gives us the distance formula. Start at a point and walk straight toward the line along w. Each unit of distance walked changes the score by ‖w‖ (the length of w, √(w₁² + w₂²)). To bring the score from f(x) down to 0 you must therefore walk f(x)/‖w‖. So:</p>
  <p style="text-align:center"><strong>distance from x to the hyperplane = |w·x + b| / ‖w‖</strong></p>
  <p>By hand with w = (1, 1), so ‖w‖ = √2 = 1.414: S4 has score 1.5, distance 1.5/1.414 = 1.061; S1 has score −2.5, distance 1.768. Those are the numbers in the table of section 01. For a labelled point, multiplying by its label y (+1 for Pass, −1 for Fail) gives y(w·x + b)/‖w‖, which is positive when the point is on its correct side; that is what the code in section 01 computed.</p>
  <p>There is one more subtlety. The same line has many descriptions: multiply w and b by any positive number and the line does not move, because 2·(x1 + x2 − 4.5) = 0 is the same line as x1 + x2 − 4.5 = 0. The scores change but the distances do not. The SVM uses this freedom to fix one convenient scale: <strong>choose w and b so that the closest points have scores of exactly +1 and −1</strong>. Here the closest scores are ±1.5, so divide everything by 1.5, giving w = (2/3, 2/3) and b = −3.</p>
  <div class="fx" data-lang="py">for w, b in [(np.array([1.0, 1.0]), -4.5), (np.array([2 / 3, 2 / 3]), -3.0)]:
    f = X6 @ w + b                                           # the score w.x + b of every student
    print(f"w={w.round(3)} b={b}:  scores {f.round(3)}   distances {(np.abs(f) / np.linalg.norm(w)).round(3)}")</div>
  <div class="fx" data-lang="text">w=[1. 1.] b=-4.5:  scores [-2.5 -1.5 -1.5  1.5  2.5  2.5]   distances [1.768 1.061 1.061 1.061 1.768 1.768]
w=[0.667 0.667] b=-3.0:  scores [-1.667 -1.    -1.     1.     1.667  1.667]   distances [1.768 1.061 1.061 1.061 1.768 1.768]</div>
  <p>Both rows describe the same line: the scores differ by the factor 1.5, the distances are identical, and in the second row the three closest students score exactly −1, −1 and +1. With this scaling, the two edges of the street are the lines w·x + b = +1 and w·x + b = −1. A point on the +1 edge is 1/‖w‖ from the centre line, and the same on the other side, so the street is <strong>2/‖w‖</strong> wide. Here ‖w‖ = √((2/3)² + (2/3)²) = 0.943, so the width is 2/0.943 = 2.121, twice the 1.061 we found. This formula is the key to the whole method: <em>a wider street means a smaller ‖w‖</em>.</p>
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
  <p>The figure shows the result: the centre line x1 + x2 = 4.5, the two dashed edges at scores ±1, and the three ringed support vectors touching them. S1, S5 and S6 sit beyond the edges and play no part. Remember also that the raw score w·x + b is neither a distance nor a probability: multiply w and b by 10 and every score is multiplied by 10 while the line stays put.</p>

  <h2 id="svm-hard"><span class="num">03</span>The Hard-Margin SVM</h2>
  <p>We found the best line by trying four. There are infinitely many lines, and in 100 dimensions we could not even draw them, so we need to state "widest street" as a mathematical problem a computer can solve. We want to maximise the width 2/‖w‖, subject to every training point being on its correct side and outside the street. With the ±1 scaling, "outside the street on the correct side" is yᵢ(w·xᵢ + b) ≥ 1 for every point i: passing students must score at least +1, failing students at most −1. Maximising 2/‖w‖ is the same as minimising ‖w‖, which is the same as minimising ½‖w‖² (squaring removes the square root, and the ½ makes the derivative neater). So:</p>
  <p style="text-align:center"><strong>minimise ½‖w‖² over w and b, subject to yᵢ(w·xᵢ + b) ≥ 1 for every training point</strong></p>
  <p>This is the <strong>hard-margin SVM</strong>, "hard" because no point is allowed inside the street. Mathematically it is a <strong>convex quadratic program</strong>: a bowl-shaped objective with straight-line constraints, which means it has exactly one best answer and reliable algorithms find it. It has a solution only when the classes can be separated by a straight line.</p>
  <p>On the six students we can solve it by hand. The data is mirror-symmetric across the line hours = mocks, so the best w has equal parts, w = (a, a), and the score becomes a × (hours + mocks) + b: only each student's total matters. The failing totals are 2, 3, 3 and the passing totals 6, 7, 7. The constraints that can bind are the closest students: the failing students with total 3 need 3a + b ≤ −1, and the passing student with total 6 needs 6a + b ≥ +1. To make ‖w‖ = a√2 as small as possible we want a as small as possible, which happens when both constraints are tight: 3a + b = −1 and 6a + b = +1. Subtracting gives 3a = 2, so a = 2/3, and then b = −1 − 2 = −3. Check the others: S1 (total 2) scores −1.667 ≤ −1, and S5 and S6 (total 7) score +1.667 ≥ 1. The answer is w = (2/3, 2/3), b = −3, exactly the line from section 02.</p>
  <div class="fx" data-lang="py">from sklearn.svm import SVC
hard = SVC(kernel="linear", C=1e6, tol=1e-10).fit(X6, y6)  # huge C: no violations allowed
w, b = hard.coef_[0], hard.intercept_[0]
print("w =", w.round(4), " b =", round(b, 4), " margin 2/||w|| =", round(2 / np.linalg.norm(w), 4))
print("support vectors:", hard.support_vectors_.tolist())
print("y(w.x + b) for every student:", (y6 * (X6 @ w + b)).round(3))</div>
  <div class="fx" data-lang="text">w = [0.6667 0.6667]  b = -3.0  margin 2/||w|| = 2.1213
support vectors: [[2.0, 1.0], [1.0, 2.0], [3.0, 3.0]]
y(w.x + b) for every student: [1.667 1.    1.    1.    1.667 1.667]</div>
  <p>scikit-learn's <code>SVC</code> agrees exactly. It has no "hard margin" switch, so we imitate one with an enormous C (the next sections explain C), which forbids violations, and a tight tolerance so the solver stops at the exact answer. The support vectors it reports are (2, 1), (1, 2) and (3, 3): S2, S3 and S4, the three students whose y·f is exactly 1. The others have 1.667, safely beyond the edges. The hard margin has a serious weakness, though: if even one point sits on the wrong side there is no solution at all, and a single odd point near the border can squeeze the street to almost nothing. Section 05 fixes that.</p>

  <h2 id="svm-dual"><span class="num">04</span>Support Vectors and the Dual</h2>
  <p>Only three of the six students decided the line. How does the mathematics "know" which points matter, and how much each one matters? The answer comes from rewriting the problem in a second form, called the <strong>dual</strong>, and this rewriting is also what makes kernels possible later.</p>
  <p>The standard tool for an optimisation problem with constraints is to give every constraint a "price", a number αᵢ ≥ 0 called a <strong>Lagrange multiplier</strong> (see <a class="xref" data-note="m_optimization">Optimization</a>). Combining the objective and the priced constraints and setting the derivatives to zero gives two famous equations. The first is <strong>w = Σ αᵢ yᵢ xᵢ</strong>: the weight vector is a weighted sum of the training points themselves. The second is <strong>Σ αᵢ yᵢ = 0</strong>: the total price on the Pass side balances the total on the Fail side. The optimality conditions (called the KKT conditions) add one more rule, <strong>complementary slackness</strong>: for every point, either it sits exactly on its edge of the street, or its price αᵢ is zero. Points beyond the edge get αᵢ = 0 and vanish from w. The points with αᵢ &gt; 0 are, by definition, the support vectors.</p>
  <p>We can find the α values by hand. Only S2 (2, 1), S3 (1, 2) and S4 (3, 3) can have α &gt; 0, and by symmetry S2 and S3 have the same value, call it α. The balance condition says α₄ × (+1) + α × (−1) + α × (−1) = 0, so α₄ = 2α. Then w = 2α(3, 3) − α(2, 1) − α(1, 2) = (3α, 3α). We know w = (2/3, 2/3), so 3α = 2/3, giving α = 2/9 ≈ 0.222 for S2 and S3 and α₄ = 4/9 ≈ 0.444 for S4. S4 carries twice the weight because it alone holds the Pass edge against two failing students. There is a neat check for hard margins: ‖w‖² should equal Σαᵢ, and indeed 8/9 = 2/9 + 2/9 + 4/9.</p>
  <div class="fx" data-lang="py">print("dual_coef_ (alpha_i * y_i):", hard.dual_coef_.round(4))
alpha = np.abs(hard.dual_coef_[0])
sv, ysv = hard.support_vectors_, y6[hard.support_]
print("w rebuilt as sum(alpha*y*x):", ((alpha * ysv) @ sv).round(4),
      "  sum(alpha) =", alpha.sum().round(4), " ||w||^2 =", round(float(w @ w), 4))
xnew = np.array([3.0, 2.0])
print("score of (3,2) via dot products with SVs:", round(float((alpha * ysv) @ (sv @ xnew) + b), 4),
      "  via w:", round(float(w @ xnew + b), 4))</div>
  <div class="fx" data-lang="text">dual_coef_ (alpha_i * y_i): [[-0.2222 -0.2222  0.4444]]
w rebuilt as sum(alpha*y*x): [0.6667 0.6667]   sum(alpha) = 0.8889  ||w||^2 = 0.8889
score of (3,2) via dot products with SVs: 0.3333   via w: 0.3333</div>
  <p>scikit-learn stores αᵢyᵢ for the support vectors only, in <code>dual_coef_</code>: −0.2222, −0.2222, +0.4444, exactly the hand values. Rebuilding w from them gives (2/3, 2/3), and Σα = ‖w‖² = 0.8889. The last line scores a new student (3, 2) in two ways. Through w it is (2/3)·5 − 3 = 0.333. Through the dual it uses only the dot products of (3, 2) with the three support vectors, 8, 7 and 15: −(2/9)·8 − (2/9)·7 + (4/9)·15 − 3 = 0.333. The answer is Pass, just inside the street.</p>
  <p>Substituting w = Σαᵢyᵢxᵢ back into the problem removes w and b entirely and leaves a problem in the α values alone, the <strong>dual problem</strong>: maximise Σαᵢ − ½ Σᵢ Σⱼ αᵢαⱼyᵢyⱼ (xᵢ·xⱼ), subject to αᵢ ≥ 0 and Σαᵢyᵢ = 0; then predict with f(x) = Σ αᵢyᵢ (xᵢ·x) + b over the support vectors. Look carefully at what the dual needs: never the points themselves, only the <strong>dot products</strong> xᵢ·xⱼ between pairs of points. That single observation is what the kernel trick in section 07 exploits. It also explains a practical fact: deleting any point that is not a support vector (S1, S5 or S6 here) and retraining gives exactly the same model.</p>

  <h2 id="svm-soft"><span class="num">05</span>Soft Margin and C</h2>
  <p>Real data is never perfectly separable. Suppose a seventh student, S7, studied 2.5 hours, took 2.5 mocks, and failed. S7's total effort is 5, more than the centre of our street (4.5), so the six-student line puts S7 on the Pass side. The hard-margin SVM now has two bad options: squeeze the street until S7 fits on the correct side, or, if a student lands deep in the other class, give up because no solution exists. What we want instead is to accept that one awkward student does not fit and keep a wide street for everyone else.</p>
  <p>The <strong>soft-margin SVM</strong> allows this by giving every point a <strong>slack</strong> ξᵢ ≥ 0 (the Greek letter xi) that measures how far it intrudes: the constraint becomes yᵢ(w·xᵢ + b) ≥ 1 − ξᵢ. A slack of 0 means the point is outside the street on its correct side; between 0 and 1, inside the street but still on the correct side; above 1, on the wrong side. Slack is not free: each unit costs C, so the problem becomes</p>
  <p style="text-align:center"><strong>minimise ½‖w‖² + C Σ ξᵢ, subject to yᵢ(w·xᵢ + b) ≥ 1 − ξᵢ and ξᵢ ≥ 0</strong></p>
  <p>C is the price of one unit of violation. A small C makes violations cheap, so the SVM keeps a wide street and lets several points intrude. A large C makes them expensive, so the street narrows until almost no point intrudes. Think of a strict versus a relaxed teacher drawing a pass mark: the strict one (large C) moves the line to accommodate every individual case, the relaxed one (small C) keeps a simple, generous rule and accepts a few exceptions.</p>
  <p>Compare three candidate lines at C = 1 by hand. The old six-student line, w = (2/3, 2/3), b = −3, has ½‖w‖² = 0.444; S7 scores (2/3)·5 − 3 = 0.333, but it is a failing student, so y·f = −0.333 and its slack is 1 − (−0.333) = 1.333, for a total of 1.778. A narrow line that obeys everyone, w = (2, 2), b = −11 (the line x1 + x2 = 5.5), has no slack but ½‖w‖² = 4.0. The line x1 + x2 = 5 with w = (0.5, 0.5), b = −2.5 has ½‖w‖² = 0.25, and makes S4 pay 0.5 (it scores only +0.5) and S7 pay 1 (it scores 0), for a total of 0.25 + 1.5 = 1.75. That is the cheapest, and it is what scikit-learn finds. Raise C to 10 and the same line costs 0.25 + 10 × 1.5 = 15.25, so the narrow line, at 4.0, wins instead.</p>
  <div class="fx" data-lang="py">X7 = np.vstack([X6, [2.5, 2.5]])                             # student 7: 2.5 hours, 2.5 mocks, failed
y7 = np.append(y6, -1)
print(" C     w              b       margin   slacks of students 1..7            objective")
for C in [0.1, 1, 10]:
    m = SVC(kernel="linear", C=C, tol=1e-10).fit(X7, y7)
    w, b = m.coef_[0], m.intercept_[0]
    xi = np.maximum(0, 1 - y7 * (X7 @ w + b))                # slack = hinge loss of every student
    print(f"{C:&lt;5} {w.round(3)}  {b:7.3f}   {2 / np.linalg.norm(w):.3f}    {xi.round(2)}   {0.5 * w @ w + C * xi.sum():.3f}")</div>
  <div class="fx" data-lang="text"> C     w              b       margin   slacks of students 1..7            objective
0.1   [0.45 0.45]   -2.250   3.143    [0.   0.1  0.1  0.55 0.1  0.1  1.  ]   0.398
1     [0.5 0.5]   -2.500   2.828    [0.  0.  0.  0.5 0.  0.  1. ]   1.750
10    [2. 2.]  -11.000   0.707    [0. 0. 0. 0. 0. 0. 0.]   4.000</div>
  <p>Read the table from top to bottom. At C = 0.1 the street is widest (3.143); five students pay a little slack and S7 pays 1. At C = 1 the street is 2.828 wide and only S4 and S7 pay, exactly as computed by hand (objective 1.750). At C = 10 the street shrinks to 0.707 and nobody pays: the model has bent to fit every student.</p>
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
  <p>The figure shows the two extremes: with small C the street stays wide and S7 sits inside it, paying its cost; with large C the street squeezes between S7 and S4. Which is better depends on whether S7 is a genuine pattern or noise, and that is exactly what cross-validation decides when we tune C. In the dual, the soft margin changes only one thing: each α is capped, <strong>0 ≤ αᵢ ≤ C</strong>. Points with αᵢ = C are the ones inside the street or on the wrong side. Note the direction carefully, because it trips people up: C is the <em>inverse</em> of regularisation strength, like C in logistic regression and unlike α in ridge regression. Large C means less regularisation and a risk of overfitting; small C means more regularisation and a risk of underfitting. The default, C = 1, is a reasonable starting point.</p>

  <h2 id="svm-hinge"><span class="num">06</span>The Hinge Loss</h2>
  <p>Logistic regression is usually described as "minimise a loss (log loss) plus a penalty on the weights". Is the SVM a completely different kind of model, or the same recipe with a different loss? At the optimum, each slack takes the smallest value its constraint allows, ξᵢ = max(0, 1 − yᵢf(xᵢ)). Substituting that in, the soft-margin SVM is simply</p>
  <p style="text-align:center"><strong>minimise ½‖w‖² + C Σ max(0, 1 − yᵢ f(xᵢ))</strong></p>
  <p>The term max(0, 1 − y·f) is called the <strong>hinge loss</strong>, because its graph looks like a door hinge: flat at zero, then a straight line rising. So an SVM is exactly <strong>L2-regularised hinge-loss minimisation</strong>, while logistic regression is L2-regularised log-loss minimisation. Same recipe, different loss (<a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>). Write z = y·f, the signed score, which is positive when a point is on its correct side. Here are the losses for the seven students under the C = 1 line:</p>
  <div class="fx" data-lang="py">m1 = SVC(kernel="linear", C=1, tol=1e-10).fit(X7, y7)
z = y7 * m1.decision_function(X7)                            # z = y * f(x)
print("z = y*f(x)      :", z.round(3))
print("0-1 loss        :", (z &lt;= 0).astype(float))
print("hinge loss      :", np.maximum(0, 1 - z).round(3))
print("log loss (bits) :", np.log2(1 + np.exp(-z)).round(3))</div>
  <div class="fx" data-lang="text">z = y*f(x)      : [1.5 1.  1.  0.5 1.  1.  0. ]
0-1 loss        : [0. 0. 0. 0. 0. 0. 1.]
hinge loss      : [0.  0.  0.  0.5 0.  0.  1. ]
log loss (bits) : [0.291 0.452 0.452 0.684 0.452 0.452 1.   ]</div>
  <p>The hinge column is exactly the slack column from section 05: 0.5 for S4, 1 for S7, zero for everyone else. The plain 0-1 loss (1 for a mistake, 0 otherwise) only charges S7. Log loss charges every student something, even S1, who is far on the correct side (0.291).</p>
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
  <p>The figure shows the three losses against z, and two differences matter. First, the hinge is <em>exactly zero</em> once a point is beyond the edge of the street (z ≥ 1). Moving such a point around, without crossing the edge, cannot change the loss, so it cannot move the line. That is the loss-function view of why only support vectors matter. Log loss never reaches zero, so in logistic regression every point keeps pulling a little. Second, because the hinge stops rewarding a point once it is past the edge, the SVM has no reason to make its scores mean anything beyond "which side, and is it past the edge"; its scores are not probabilities. Log loss keeps rewarding confidence, which is why logistic regression's outputs are roughly calibrated probabilities. Both losses grow only linearly for badly wrong points, so both are more robust to outliers than a squared loss would be; the <strong>squared hinge</strong>, max(0, 1 − z)², which <code>LinearSVC</code> uses by default, punishes large violations more heavily.</p>

  <h2 id="svm-kernel"><span class="num">07</span>The Kernel Trick</h2>
  <p>Every boundary so far has been a straight line. Now add three over-worked students, (5, 5), (6, 5) and (5, 6), who burnt out and failed. Failing students now sit on <em>both</em> sides of the passing ones: too little effort fails, and so does too much. No straight line can separate that. Can the same SVM machinery draw a curved boundary?</p>
  <p>Start with a hand-made fix. Use one number per student, effort s = hours + mocks. The nine efforts are 2, 3, 3 (Fail), 6, 7, 7 (Pass), 10, 11, 11 (Fail). On a number line, Pass is in the middle, so no single cut works. Now give each student a second feature, s². The points move onto a parabola, (2, 4), (3, 9), (6, 36), (7, 49), (10, 100), (11, 121), and in this two-dimensional space a straight line <em>can</em> separate them. Adding new features computed from the old ones like this is called <strong>lifting</strong> the data into a higher-dimensional space, and the function that does it is written φ (phi), here φ(s) = (s, s²).</p>
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
  <p>On the left the classes cannot be split with one cut; on the right, after lifting, one straight line (green) separates them. Solving the hard-margin SVM on (s, s²) gives w = (13/6, −1/6), b = −6, so f(s) = −(s − 4)(s − 9)/6, which is positive exactly when 4 &lt; s &lt; 9. Check the edges: s = 3 gives −(−1)(−6)/6 = −1, s = 6 gives +1, s = 10 gives −1. One straight line in the lifted space is <em>two</em> cuts, s = 4 and s = 9, back on the original line.</p>
  <div class="fx" data-lang="py">XB = np.vstack([X6, [[5, 5], [6, 5], [5, 6]]])               # three over-worked students who burnt out
yB = np.append(y6, [-1, -1, -1])
s = XB.sum(axis=1)                                           # effort = hours + mocks
print("effort:", s, " label:", yB)
lin = SVC(kernel="linear", C=1).fit(XB, yB)
print("linear SVM on (hours, mocks): accuracy", round(lin.score(XB, yB), 3))
F = np.c_[s, s ** 2]                                         # lift by hand: (s, s^2)
lift = SVC(kernel="linear", C=1e6, tol=1e-10).fit(F, yB)
w, b = lift.coef_[0], lift.intercept_[0]
print("linear SVM on (s, s^2): accuracy", lift.score(F, yB), " w =", w.round(4), " b =", round(b, 4))
print("boundary at s =", np.sort(np.roots([w[1], w[0], b])).round(3))</div>
  <div class="fx" data-lang="text">effort: [ 2.  3.  3.  6.  7.  7. 10. 11. 11.]  label: [-1 -1 -1  1  1  1 -1 -1 -1]
linear SVM on (hours, mocks): accuracy 0.667
linear SVM on (s, s^2): accuracy 1.0  w = [ 2.1667 -0.1667]  b = -6.0
boundary at s = [4. 9.]</div>
  <p>A linear SVM on (hours, mocks) gives up and predicts Fail for everyone (6 of 9 correct). After adding s², a linear SVM separates all nine, and the roots of its score are exactly 4 and 9. Lifting has two problems, though. You must guess the right new features, and their number explodes: all products of degree 2 of 100 features is already 5,151 features, and of degree 3 of 1,000 features, about 167 million. Computing and storing those is hopeless.</p>
  <p>Here is the trick. Section 04 showed that the SVM only ever uses the data through dot products xᵢ·xⱼ. In a lifted space it would only need φ(xᵢ)·φ(xⱼ), never φ itself. And for many useful lifts, that dot product can be computed directly from the original points, cheaply. Take S3 = a = (1, 2), S6 = b = (3, 4) and the lift φ(v) = (v₁², √2·v₁v₂, v₂²), all degree-2 products. Lifting then taking the dot product: φ(a) = (1, 2.828, 4), φ(b) = (9, 16.971, 16), and the dot product is 9 + 48 + 64 = 121. Alternatively: a·b = 3 + 8 = 11, and 11² = 121. The same number, without ever building the lifted vectors.</p>
  <div class="fx" data-lang="py">a, bb = np.array([1.0, 2.0]), np.array([3.0, 4.0])          # S3 and S6
phi = lambda v: np.array([v[0] ** 2, np.sqrt(2) * v[0] * v[1], v[1] ** 2])   # explicit degree-2 lift
print("phi(a) =", phi(a).round(3), " phi(b) =", phi(bb).round(3))
print("lift then dot:", round(float(phi(a) @ phi(bb)), 6), "   kernel (a.b)^2:", (a @ bb) ** 2)
from math import comb
for n, d in [(2, 2), (100, 2), (1000, 3)]:
    print(f"{n:5d} features, degree {d}: lifted space has {comb(n + d, d):&gt;12,} dimensions")</div>
  <div class="fx" data-lang="text">phi(a) = [1.    2.828 4.   ]  phi(b) = [ 9.    16.971 16.   ]
lift then dot: 121.0    kernel (a.b)^2: 121.0
    2 features, degree 2: lifted space has            6 dimensions
  100 features, degree 2: lifted space has        5,151 dimensions
 1000 features, degree 3: lifted space has  167,668,501 dimensions</div>
  <p>The identity holds exactly, and the table shows why it matters: the lifted space grows to 167 million dimensions for 1,000 features at degree 3, while the shortcut still costs about 1,000 multiplications per pair. A function K(a, b) that equals φ(a)·φ(b) for some lift φ is called a <strong>kernel</strong>, and the <strong>kernel trick</strong> is to replace every dot product xᵢ·xⱼ in the dual by K(xᵢ, xⱼ). Training then works with the n × n table of kernel values between all pairs of training points (the <strong>Gram matrix</strong>), and prediction becomes f(x) = Σ αᵢyᵢ K(xᵢ, x) + b over the support vectors. The SVM effectively draws a straight line in a huge lifted space, which looks like a curve in the original one, without ever visiting that space. (Not every function is a valid kernel: Mercer's condition says the Gram matrices it produces must be symmetric and positive semi-definite.) One consequence: a kernel SVM has no w you can print, because w lives in the lifted space, so <code>coef_</code> exists only for the linear kernel, and explaining a kernel SVM needs the support vectors, permutation importance or SHAP.</p>

  <h2 id="svm-kernels"><span class="num">08</span>Kernels, γ and C</h2>
  <p>We used the polynomial lift because we guessed it. In practice you choose from a few standard kernels. The <strong>linear kernel</strong> K(a, b) = a·b is no lift at all: a straight boundary. The <strong>polynomial kernel</strong> (γ a·b + r)^d corresponds to all products of features up to degree d and draws curves of degree d (in scikit-learn, <code>degree</code>, <code>gamma</code> and <code>coef0</code> = r). The <strong>RBF kernel</strong> (radial basis function, also called the Gaussian kernel), K(a, b) = exp(−γ‖a − b‖²), corresponds to an <em>infinite</em>-dimensional lift, so the kernel trick is the only way to use it, and it can draw any smooth shape; it is scikit-learn's default. (A sigmoid kernel tanh(γ a·b + r) also exists but is rarely the best choice.)</p>
  <p>The RBF kernel is easiest to understand as a <strong>similarity</strong>: it is 1 for identical points and fades toward 0 as points move apart, and γ (gamma) sets how fast it fades. For S3 and S6 the squared distance is (1 − 3)² + (2 − 4)² = 8:</p>
  <div class="fx" data-lang="py">sq = ((a - bb) ** 2).sum()
for g in [0.01, 0.1, 1, 10]:
    print(f"gamma={g:&lt;5} K(S3, S6) = exp(-{g} x {sq:g}) = {np.exp(-g * sq):.6f}")</div>
  <div class="fx" data-lang="text">gamma=0.01  K(S3, S6) = exp(-0.01 x 8) = 0.923116
gamma=0.1   K(S3, S6) = exp(-0.1 x 8) = 0.449329
gamma=1     K(S3, S6) = exp(-1 x 8) = 0.000335
gamma=10    K(S3, S6) = exp(-10 x 8) = 0.000000</div>
  <p>With γ = 0.01 the two students look 92% similar, so every point influences every other and the boundary is almost straight. With γ = 1 they are 0.03% similar, so each point influences only its immediate surroundings. An RBF SVM therefore predicts with f(x) = Σ αᵢyᵢ exp(−γ‖xᵢ − x‖²) + b: a weighted vote of similarities to the support vectors. That is very like a KNN with soft, distance-based weights, except that the SVM <em>learns</em> the weights αᵢ and sets most of them to zero. Back to the burnt-out students:</p>
  <div class="fx" data-lang="py">for name, mdl in [("linear", SVC(kernel="linear", C=1)),
                  ("poly, (a.b+1)^2", SVC(kernel="poly", degree=2, gamma=1, coef0=1, C=100)),
                  ("rbf, gamma=0.5", SVC(kernel="rbf", gamma=0.5, C=100))]:
    mdl.fit(XB, yB)
    print(f"{name:16s} accuracy {mdl.score(XB, yB):.3f}  support vectors: {len(mdl.support_)} of 9")</div>
  <div class="fx" data-lang="text">linear           accuracy 0.667  support vectors: 8 of 9
poly, (a.b+1)^2  accuracy 1.000  support vectors: 6 of 9
rbf, gamma=0.5   accuracy 1.000  support vectors: 9 of 9</div>
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
  <p>The linear kernel fails (0.667). The degree-2 polynomial kernel (a·b + 1)² contains the s² feature we built by hand, and more, and separates all nine; the RBF kernel separates them too, and the figure shows both drawing a closed region around the Pass band. With only nine points, every student ends up a support vector for the RBF model. On a larger example, one class inside a ring of the other (<code>make_circles</code>), the pattern is the same:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_circles, make_moons
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
Xc, yc = make_circles(n_samples=400, noise=0.1, factor=0.4, random_state=0)   # one class inside a ring
for n, mdl in [("linear", SVC(kernel="linear")), ("poly d=2", SVC(kernel="poly", degree=2)),
               ("poly d=3", SVC(kernel="poly", degree=3)), ("rbf", SVC(kernel="rbf"))]:
    print(f"{n:9s} CV accuracy {cross_val_score(mdl, Xc, yc, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">linear    CV accuracy 0.547
poly d=2  CV accuracy 1.000
poly d=3  CV accuracy 0.637
rbf       CV accuracy 1.000</div>
  <p>Linear is a coin toss, degree 2 and RBF are perfect, and degree 3 is poor, a reminder that the polynomial degree must fit the shape (here an odd degree cannot make a ring centred on the origin). RBF is the safest general choice because it does not need you to guess the shape.</p>
  <p>The two RBF knobs, γ and C, both control how tightly the boundary follows individual points, so they must be tuned together. The table below uses the two-moons dataset (600 points in two interleaved half-circles with noise, 420 for training). Each cell shows train/test accuracy and, in brackets, the number of support vectors:</p>
  <div class="fx" data-lang="py">Xm, ym = make_moons(n_samples=600, noise=0.3, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(Xm, ym, test_size=0.3, random_state=0)
print("train/test accuracy (support vectors)")
print("gamma      C=0.01              C=1                 C=100")
for g in [0.1, 1, 10, 100]:
    row = []
    for C in [0.01, 1, 100]:
        p = make_pipeline(StandardScaler(), SVC(C=C, gamma=g)).fit(Xtr, ytr)
        row.append(f"{p.score(Xtr, ytr):.2f}/{p.score(Xte, yte):.2f} ({p[-1].n_support_.sum():3d})")
    print(f"{g:&lt;6}   " + "   ".join(row))</div>
  <div class="fx" data-lang="text">train/test accuracy (support vectors)
gamma      C=0.01              C=1                 C=100
0.1      0.81/0.81 (416)   0.88/0.85 (156)   0.90/0.88 (106)
1        0.79/0.81 (416)   0.91/0.88 (115)   0.93/0.89 ( 90)
10       0.50/0.49 (418)   0.94/0.88 (222)   0.98/0.86 (156)
100      0.50/0.49 (418)   0.98/0.81 (386)   1.00/0.81 (378)</div>
  <p>Read it in three directions. With tiny C (0.01), violations are almost free, nearly every point becomes a support vector (416 of 420), and at large γ the model collapses to guessing (0.50). With large γ (100), training accuracy reaches 0.98 to 1.00 while test accuracy falls to 0.81: each point gets its own little bubble, which is classic overfitting. The sweet spot is γ around 0.1 to 1 with C between 1 and 100, at a test accuracy of 0.85 to 0.89.</p>
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
  <p>The figure shows the γ effect directly: a small γ gives a gentle curve, while γ = 100 wraps the boundary around individual points. So "train high, test much lower" in an RBF SVM usually means γ is too large. scikit-learn's default <code>gamma="scale"</code> sets γ = 1 / (number of features × variance of X), which for two standardised features is 1/(2 × 1) = 0.5, a sensible middle value. Finally, a check that the prediction formula really is just a weighted sum of RBF similarities to the support vectors:</p>
  <div class="fx" data-lang="py">from sklearn.metrics.pairwise import rbf_kernel
p = make_pipeline(StandardScaler(), SVC(C=1, gamma=1)).fit(Xtr, ytr)
svc, Zte = p[-1], p[0].transform(Xte[:5])
K = rbf_kernel(Zte, svc.support_vectors_, gamma=1)           # similarity of 5 test points to every SV
mine = K @ svc.dual_coef_[0] + svc.intercept_[0]             # f(x) = sum(alpha_i y_i K(x_i, x)) + b
print("support vectors:", len(svc.support_), "of", len(Xtr))
print("by the formula   :", mine.round(4))
print("decision_function:", p.decision_function(Xte[:5]).round(4))</div>
  <div class="fx" data-lang="text">support vectors: 115 of 420
by the formula   : [-1.5521  1.4092 -1.0694  1.3758  1.4371]
decision_function: [-1.5521  1.4092 -1.0694  1.3758  1.4371]</div>
  <p>Our formula, using the support vectors, <code>dual_coef_</code> (the αᵢyᵢ values) and <code>intercept_</code> (b), reproduces <code>decision_function</code> exactly. Only 115 of the 420 training points are needed to make any prediction. A sensible order for trying kernels: linear first (fast, interpretable, often enough with many features), then RBF, and polynomial only when the degree means something in your problem.</p>

  <h2 id="svm-scale"><span class="num">09</span>Feature Scaling</h2>
  <p>Both the margin (through ‖w‖) and the RBF kernel (through ‖a − b‖²) are built from distances, so they inherit the problem every distance-based model has: they depend on the units of the columns. Suppose the institute records study time in <em>minutes</em>. The students are the same people, so the boundary should be the same. In minutes, S2 = (120, 1) and S4 = (180, 3). The failing and passing groups are now 60 units apart along the first axis but only 0 to 2 apart along mocks, so the widest street is simply "between 120 and 180 minutes". The margin becomes 60 (in minutes) and the line is almost vertical, at about hours = 2.5, ignoring mocks completely. In hours, the widest street was the diagonal x1 + x2 = 4.5, which used both columns equally.</p>
  <div class="fx" data-lang="py">Xmin = X6.copy(); Xmin[:, 0] *= 60                           # study time in MINUTES
hm = SVC(kernel="linear", C=1e6, tol=1e-10).fit(Xmin, y6)
wm, bm = hm.coef_[0], hm.intercept_[0]
print("minutes: boundary in hours units: %.3f*hours + %.4f*mocks = %.3f" % (wm[0] * 60, wm[1], -bm))
for name, Xs in [("hours", X6), ("minutes", Xmin)]:
    pz = make_pipeline(StandardScaler(), SVC(kernel="linear", C=1e6, tol=1e-10)).fit(Xs, y6)
    print(f"standardised {name:7s}: scores {pz.decision_function(Xs).round(3)}")</div>
  <div class="fx" data-lang="text">minutes: boundary in hours units: 1.998*hours + 0.0011*mocks = 4.997
standardised hours  : scores [-1.667 -1.    -1.     1.     1.667  1.667]
standardised minutes: scores [-1.667 -1.    -1.     1.     1.667  1.667]</div>
  <p>scikit-learn confirms it: in minutes, converted back to hours, the boundary is 1.998·hours + 0.0011·mocks = 4.997, which is hours ≈ 2.5. Only the unit changed, and the "best" boundary changed with it. After standardising each column (z = (x − mean)/standard deviation), hours and minutes give identical scores, equal to the original diagonal's −1.667, −1, −1, 1, 1.667, 1.667. On a real dataset the effect is large: the wine data has 13 chemical measurements on very different scales.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_wine
Xw, yw = load_wine(return_X_y=True)
for name, mdl in [("RBF, raw", SVC()), ("RBF, scaled", make_pipeline(StandardScaler(), SVC()))]:
    print(f"{name:12s} 5-fold CV accuracy {cross_val_score(mdl, Xw, yw, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">RBF, raw     5-fold CV accuracy 0.663
RBF, scaled  5-fold CV accuracy 0.983</div>
  <p>The RBF SVM on raw wine features scores 0.663, because one column (proline, in the hundreds to thousands) dominates every distance; scaled, it scores 0.983. Always put the scaler inside a pipeline, <code>make_pipeline(StandardScaler(), SVC())</code>, so that it is fitted on the training folds only during cross-validation (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). One exception: for sparse text features such as TF-IDF, do not centre the data (subtracting the mean destroys sparsity); TF-IDF rows are already normalised.</p>

  <h2 id="svm-svr"><span class="num">10</span>Support Vector Regression</h2>
  <p>The institute also wants to predict marks. The six students scored 20, 28 and 30 (the failing students) and 62, 70 and 66. Can the margin idea predict a number instead of a side? <strong>Support vector regression</strong> (SVR) turns the street inside out. In classification, points should stay <em>outside</em> the street. In regression, points should stay <em>inside</em> a tube of half-width ε (epsilon) around the prediction. Errors smaller than ε cost nothing; larger ones cost the amount by which they exceed ε, max(0, |y − f| − ε), which is called the <strong>ε-insensitive loss</strong>. Among all functions that keep the points in the tube, SVR picks the <strong>flattest</strong> one (smallest ‖w‖), and C prices any points outside the tube.</p>
  <p>Think of a tolerance band in manufacturing: any part within ±5 mm of spec is accepted at no cost, and only parts beyond the band count as defects. SVR does not care about small errors at all, which makes it robust to noise inside the band and leaves only the points on or outside the tube's edge as support vectors.</p>
  <div class="fx" data-lang="py">from sklearn.svm import SVR
marks6 = np.array([20, 28, 30, 62, 70, 66])                 # final marks of the six students
for e in [0, 5]:
    r = SVR(kernel="linear", C=100, epsilon=e).fit(X6, marks6)
    print(f"epsilon={e}: w={r.coef_[0].round(3)} b={r.intercept_[0]:.3f}  support vectors={len(r.support_)}"
          f"  fitted={r.predict(X6).round(1)}")
r5 = SVR(kernel="linear", C=100, epsilon=5).fit(X6, marks6)
print("residuals at epsilon=5:", (marks6 - r5.predict(X6)).round(2), "  prediction for (8, 8):", r5.predict([[8, 8]]).round(1))</div>
  <div class="fx" data-lang="text">epsilon=0: w=[10.     9.999] b=0.001  support vectors=6  fitted=[20. 30. 30. 60. 70. 70.]
epsilon=5: w=[8. 8.] b=9.000  support vectors=2  fitted=[25. 33. 33. 57. 65. 65.]
residuals at epsilon=5: [-5. -5. -3.  5.  5.  1.]   prediction for (8, 8): [137.]</div>
  <p>With ε = 0 there is no tube, and SVR fits the steeper line mark ≈ 10·hours + 10·mocks, using all six students as support vectors. With ε = 5 it fits mark = 8·hours + 8·mocks + 9. Check by hand: S1 has effort 2, so the fit is 8 × 2 + 9 = 25 and the residual is 20 − 25 = −5, exactly on the tube's edge; S6 has effort 7, fit 65, residual +1, inside the tube. All six residuals are within ±5, so the loss is zero and only ½‖w‖² = ½(64 + 64) = 64 remains, less than the 100 of the steeper line. SVR picks the flatter line because the tube allows it. Only two students are reported as support vectors (four lie exactly on the edge; when points tie, the solver may give some of them α = 0).</p>
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
  <p>Unlike KNN regression, a linear SVR extrapolates: a student with 8 hours and 8 mocks gets 137, beyond any mark seen, which is also a warning, since marks cannot exceed 100. With an RBF kernel, SVR fits curves. On 100 noisy points from a sine wave (noise standard deviation 0.3):</p>
  <div class="fx" data-lang="py">from sklearn.metrics import root_mean_squared_error
rng = np.random.default_rng(0)
xs = np.sort(rng.uniform(0, 6, 200)).reshape(-1, 1)
ys = np.sin(xs).ravel() + rng.normal(0, 0.3, 200)           # sine + noise with sd 0.3
xa, xb, ya, yb = train_test_split(xs, ys, test_size=0.5, random_state=0)
print(" epsilon   support vectors   test RMSE")
for e in [0.0, 0.1, 0.3, 0.5, 1.0]:
    sr = SVR(kernel="rbf", C=10, epsilon=e).fit(xa, ya)
    print(f"   {e:&lt;5}      {len(sr.support_):3d} / 100        {root_mean_squared_error(yb, sr.predict(xb)):.3f}")</div>
  <div class="fx" data-lang="text"> epsilon   support vectors   test RMSE
   0.0        100 / 100        0.327
   0.1         76 / 100        0.322
   0.3         38 / 100        0.322
   0.5         11 / 100        0.327
   1.0          2 / 100        0.450</div>
  <p>Raising ε from 0 to 0.5 cuts the support vectors from 100 to 11 at almost the same test error: the tube absorbs the noise. At ε = 1.0 the tube is wider than the curve's real wiggles and the error rises to 0.450. ε is measured in the units of the target, so 0.1 is tiny for house prices and huge for probabilities; scale y or choose ε relative to its spread, and tune C, ε and γ together.</p>

  <h2 id="svm-multi"><span class="num">11</span>Multiclass and Probabilities</h2>
  <p>An SVM has two sides, so it separates two classes. Suppose the three top students, (5, 5), (6, 5) and (5, 6), are now relabelled Distinction, giving three grades. There are two standard ways to build a multiclass classifier from binary ones. <strong>One-vs-rest</strong> (OvR) trains one model per class, "this class against everything else", and picks the class with the highest score. <strong>One-vs-one</strong> (OvO) trains one model for every pair of classes, k(k − 1)/2 of them (3 for 3 classes, 45 for 10), each on only those two classes' rows, and lets them vote. scikit-learn's <code>SVC</code> always uses one-vs-one, because kernel training cost grows roughly with n², so many small problems are cheaper than a few big ones; <code>LinearSVC</code> uses one-vs-rest. (<code>SVC</code>'s <code>decision_function_shape</code> parameter only changes the shape of the output, not how it trains.)</p>
  <div class="fx" data-lang="py">yM = np.array(["Fail"] * 3 + ["Pass"] * 3 + ["Distinction"] * 3)   # the 3 top students got a distinction
ovo = SVC(kernel="linear", decision_function_shape="ovo").fit(XB, yM)
print("classes_:", ovo.classes_)
print("pairwise scores for (4,4) [D-vs-F, D-vs-P, F-vs-P]:", ovo.decision_function([[4, 4]]).round(3))
print("predictions for (4,4), (2,2), (6,6):", ovo.predict([[4, 4], [2, 2], [6, 6]]))</div>
  <div class="fx" data-lang="text">classes_: ['Distinction' 'Fail' 'Pass']
pairwise scores for (4,4) [D-vs-F, D-vs-P, F-vs-P]: [[ 0.429 -0.333 -2.333]]
predictions for (4,4), (2,2), (6,6): ['Pass' 'Fail' 'Distinction']</div>
  <p>The classes in alphabetical order are Distinction, Fail and Pass, so the three pairwise models are D-vs-F, D-vs-P and F-vs-P, and a positive score votes for the first class of the pair. For a new student at (4, 4), D-vs-F scores +0.429 (a vote for Distinction), D-vs-P scores −0.333 (a vote for Pass), and F-vs-P scores −2.333 (a vote for Pass). Pass wins with two votes. (With three classes, votes can tie one each; libsvm then breaks the tie using the summed confidences.)</p>
  <p>The next question a counsellor asks is "how likely is this student to pass?". The SVM gives a score, not a probability, and section 06 explained why the hinge loss never asked that score to mean anything more. The standard fix is <strong>Platt scaling</strong> (John Platt, 1999): pass the score through a sigmoid, P(y = 1 | f) = 1 / (1 + exp(A·f + B)), and fit A and B by logistic regression on scores from data the SVM was not trained on. To see what it does, take A = −1.5 and B = 0 (illustrative values): a score of +1 becomes 1/(1 + e^(−1.5)) = 0.818, a score of −1 becomes 0.182.</p>
  <div class="fx" data-lang="py">f6 = hard.decision_function(X6)                              # scores under the hard-margin line
A, B = -1.5, 0.0                                             # illustrative Platt parameters
print("score f  :", f6.round(3))
print("P(Pass|f):", (1 / (1 + np.exp(A * f6 + B))).round(3))</div>
  <div class="fx" data-lang="text">score f  : [-1.667 -1.    -1.     1.     1.667  1.667]
P(Pass|f): [0.076 0.182 0.182 0.818 0.924 0.924]</div>
  <p>For years the way to get probabilities was <code>SVC(probability=True)</code>, which ran Platt scaling internally with five extra fits. In scikit-learn 1.9, installed here, that is deprecated:</p>
  <div class="fx" data-lang="py">with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    SVC(probability=True).fit(Xtr, ytr)
print(caught[0].category.__name__ + ":", caught[0].message)</div>
  <div class="fx" data-lang="text">FutureWarning: The \`probability\` parameter was deprecated in 1.9 and will be removed in version 1.11. Use \`CalibratedClassifierCV(SVC(), ensemble=False)\` instead of \`SVC(probability=True)\`</div>
  <p>The message says the parameter will be removed in version 1.11 and names the replacement, <code>CalibratedClassifierCV(SVC(), ensemble=False)</code>. That wrapper does the same job in the open, and works for any classifier: it gets cross-validated scores from the SVC, fits a calibrator on them (method="sigmoid" for Platt, or "isotonic" for a free-form increasing curve), and with <code>ensemble=False</code> refits a single SVC on all the data for prediction.</p>
  <div class="fx" data-lang="py">from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import log_loss
base = make_pipeline(StandardScaler(), SVC(C=1, gamma=1))
for method in ["sigmoid", "isotonic"]:
    cal = CalibratedClassifierCV(base, method=method, cv=5, ensemble=False).fit(Xtr, ytr)
    pr = cal.predict_proba(Xte)[:, 1]
    print(f"{method:8s}: log loss {log_loss(yte, pr):.3f}   P(class 1) for the first 3 test rows {pr[:3].round(3)}")
print("raw decision_function for the same rows:", base.fit(Xtr, ytr).decision_function(Xte[:3]).round(3))</div>
  <div class="fx" data-lang="text">sigmoid : log loss 0.345   P(class 1) for the first 3 test rows [0.023 0.973 0.072]
isotonic: log loss 0.923   P(class 1) for the first 3 test rows [0.    1.    0.052]
raw decision_function for the same rows: [-1.552  1.409 -1.069]</div>
  <p>The raw scores −1.552, 1.409 and −1.069 have become probabilities 0.023, 0.973 and 0.072 under sigmoid calibration, with a test log loss of 0.345. Isotonic calibration gives a much worse log loss here (0.923), because with only 420 rows it produces some probabilities of exactly 0 and 1, and a single confident mistake costs an enormous log loss. Prefer sigmoid for small data and isotonic for large. If you only need to rank examples (for ROC-AUC or choosing a threshold), the raw <code>decision_function</code> scores are enough (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>

  <h2 id="svm-practice"><span class="num">12</span>SVMs in Practice</h2>
  <p>With six students the Gram matrix is 6 × 6; with n rows it is n × n. Kernel SVM training (scikit-learn uses the libsvm library and an algorithm called SMO) takes somewhere between O(n²) and O(n³) time, and prediction costs grow with the number of support vectors, which on noisy data grows with n. Here is the effect (times are approximate and vary by machine):</p>
  <div class="fx" data-lang="py">import time
from sklearn.datasets import make_classification
from sklearn.svm import LinearSVC
print("     n    SVC (rbf) fit seconds   support vectors   LinearSVC fit seconds")
for n in [1000, 2000, 4000, 8000]:
    Xn, yn = make_classification(n_samples=n, n_features=20, flip_y=0.1, random_state=0)
    t0 = time.perf_counter(); sm = SVC().fit(Xn, yn); t1 = time.perf_counter() - t0
    t0 = time.perf_counter(); LinearSVC().fit(Xn, yn); t2 = time.perf_counter() - t0
    print(f"{n:6d}         {t1:6.3f}              {len(sm.support_):5d}               {t2:6.3f}")</div>
  <div class="fx" data-lang="text">     n    SVC (rbf) fit seconds   support vectors   LinearSVC fit seconds
  1000          0.035                429                0.002
  2000          0.102                673                0.011
  4000          0.504               1869                0.019
  8000          2.159               3642                0.026</div>
  <p>Going from 1,000 to 8,000 rows, eight times the data, multiplies the RBF SVC's fit time by far more than eight, and the number of support vectors grows almost in proportion to n. <code>LinearSVC</code>, which uses a different library (liblinear) and solves only the linear problem, stays in milliseconds. For large data the options are therefore <code>LinearSVC</code> or <code>SGDClassifier(loss="hinge")</code> (a linear SVM trained by stochastic gradient descent, which can stream data), or approximating the RBF kernel with explicit features, <code>make_pipeline(Nystroem(n_components=300), LinearSVC())</code> or <code>RBFSampler</code>, whose cost grows linearly in n. A rough rule: kernel SVC is comfortable up to a few tens of thousands of rows.</p>
  <p>Imbalanced classes need attention too. With 10% positives, the cheapest way to reduce total slack is to let the minority's points pay, so the street drifts into the minority class. The <code>class_weight</code> parameter multiplies C per class, making violations by the rare class more expensive:</p>
  <div class="fx" data-lang="py">from sklearn.metrics import recall_score, balanced_accuracy_score
Xi, yi = make_classification(n_samples=2000, n_features=4, n_informative=3, n_redundant=0,
                             weights=[0.9, 0.1], class_sep=0.8, random_state=0)
Xa, Xb2, ya2, yb2 = train_test_split(Xi, yi, test_size=0.5, stratify=yi, random_state=0)
for cw in [None, "balanced"]:
    pr = make_pipeline(StandardScaler(), SVC(class_weight=cw)).fit(Xa, ya2).predict(Xb2)
    print(f"class_weight={str(cw):9s} recall of the rare class {recall_score(yb2, pr):.3f}"
          f"   balanced accuracy {balanced_accuracy_score(yb2, pr):.3f}")</div>
  <div class="fx" data-lang="text">class_weight=None      recall of the rare class 0.183   balanced accuracy 0.591
class_weight=balanced  recall of the rare class 0.865   balanced accuracy 0.861</div>
  <p>Without weights the SVM finds only 18% of the rare class. <code>class_weight="balanced"</code>, which sets each class's weight inversely proportional to its frequency (here about 1 and 4.8), raises that to 86.5% and balanced accuracy from 0.591 to 0.861.</p>
  <p>The main parameters of <code>SVC</code> are <code>C</code> (default 1.0), <code>kernel</code> (default "rbf"; also "linear", "poly", "sigmoid", "precomputed" or your own function), <code>gamma</code> (default "scale"), <code>degree</code> and <code>coef0</code> for the polynomial kernel, <code>class_weight</code>, <code>cache_size</code> (memory in MB for kernel values; raise it for big data) and <code>max_iter</code> (set it if training hangs). After fitting, <code>support_</code>, <code>support_vectors_</code>, <code>n_support_</code>, <code>dual_coef_</code> (αᵢyᵢ), <code>intercept_</code> (b) and, for the linear kernel only, <code>coef_</code> (w) hold everything we computed by hand. The family also includes <code>NuSVC</code> (which replaces C by ν, a bound on the share of support vectors), <code>SVR</code>, <code>LinearSVR</code>, and <code>OneClassSVM</code>, which learns a boundary around "normal" data for anomaly detection. Tuning C and γ is a grid search over logarithmic values with the scaler inside the pipeline:</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import GridSearchCV
grid = GridSearchCV(make_pipeline(StandardScaler(), SVC()),
                    {"svc__C": [0.1, 1, 10, 100], "svc__gamma": [0.01, 0.1, 1, 10]}, cv=5).fit(Xtr, ytr)
print("best:", grid.best_params_, " CV accuracy", round(grid.best_score_, 3), " test accuracy", round(grid.score(Xte, yte), 3))
print("CV accuracy (rows C = 0.1, 1, 10, 100; columns gamma = 0.01, 0.1, 1, 10):")
print(grid.cv_results_["mean_test_score"].reshape(4, 4).round(3))</div>
  <div class="fx" data-lang="text">best: {'svc__C': 0.1, 'svc__gamma': 10}  CV accuracy 0.905  test accuracy 0.883
CV accuracy (rows C = 0.1, 1, 10, 100; columns gamma = 0.01, 0.1, 1, 10):
[[0.869 0.876 0.895 0.905]
 [0.869 0.881 0.902 0.902]
 [0.874 0.895 0.905 0.898]
 [0.871 0.905 0.9   0.876]]</div>
  <p>The grid shows the interaction between the two knobs: the best cells run along a diagonal (C = 0.1 with γ = 10, C = 10 with γ = 1, C = 100 with γ = 0.1 are all about 0.90). Large γ pairs with small C and vice versa, because both control how tightly the boundary follows individual points. Differences of 0.01 on 420 rows are noise; the untouched test set gives 0.883.</p>
  <p>Is the SVM really just the optimisation problems of sections 03 and 05? We can solve both with general-purpose tools. The hard margin is a small constrained problem in three numbers (w₁, w₂, b), which scipy's SLSQP optimiser accepts directly. The soft margin in its hinge form has no constraints at all, so we can minimise it by <strong>subgradient descent</strong>: gradient descent where, at the kink of the hinge, we use any valid slope. Students with y·f &lt; 1 contribute −C·yᵢxᵢ to the slope for w; the others contribute nothing.</p>
  <div class="fx" data-lang="py">from scipy.optimize import minimize
# variables v = (w1, w2, b): minimise 1/2 ||w||^2 subject to y_i (w.x_i + b) - 1 &gt;= 0 for every student
res = minimize(lambda v: 0.5 * v[:2] @ v[:2], x0=np.zeros(3), method="SLSQP",
               constraints=[{"type": "ineq", "fun": lambda v: y6 * (X6 @ v[:2] + v[2]) - 1}])
print("hard margin, generic optimiser: w =", res.x[:2].round(4), " b =", round(res.x[2], 4))

def soft_svm(X, y, C, steps=20000, lr0=0.1):
    """Minimise 1/2||w||^2 + C*sum(hinge) by subgradient descent; keep the best point seen."""
    w, b, best = np.zeros(X.shape[1]), 0.0, (np.inf, None, None)
    for t in range(1, steps + 1):
        inside = y * (X @ w + b) &lt; 1                          # students with non-zero hinge loss
        gw = w - C * (y[inside, None] * X[inside]).sum(axis=0)
        gb = -C * y[inside].sum()
        w, b = w - lr0 / np.sqrt(t) * gw, b - lr0 / np.sqrt(t) * gb
        obj = 0.5 * w @ w + C * np.maximum(0, 1 - y * (X @ w + b)).sum()
        if obj &lt; best[0]:
            best = (obj, w.copy(), b)
    return best

obj, w, b = soft_svm(X7, y7, C=1)
print(f"soft margin C=1, subgradient: w={w.round(3)} b={b:.3f} objective={obj:.4f}   (sklearn: w=[0.5 0.5], b=-2.5, 1.75)")</div>
  <div class="fx" data-lang="text">hard margin, generic optimiser: w = [0.6667 0.6667]  b = -3.0
soft margin C=1, subgradient: w=[0.503 0.503] b=-2.523 objective=1.7500   (sklearn: w=[0.5 0.5], b=-2.5, 1.75)</div>
  <p>The generic optimiser finds exactly w = (2/3, 2/3), b = −3, and subgradient descent reaches the same objective as scikit-learn, 1.75, with almost the same line. Subgradient descent zig-zags near the kink and converges slowly, which is why real solvers use the dual with SMO (libsvm), coordinate descent (liblinear), or stochastic steps (Pegasos, SGD).</p>
  <p>So when should you choose an SVM? Its strengths are a principled maximum-margin boundary that depends only on border points; curved boundaries through kernels without hand-built features (and custom kernels for strings or graphs); strong performance when features outnumber rows, as with text and genes, since the margin rather than the number of features controls complexity; and a convex problem with one global optimum, so the same answer every run. Its weaknesses are poor scaling beyond tens of thousands of rows with a kernel, sensitivity to feature scale and to the C and γ settings, no native probabilities, and hard-to-explain kernel models. For messy tabular data with mixed types and missing values, gradient boosting is usually the better tool.</p>
  <table class="tbl">
    <tr><th></th><th>SVM</th><th><a class="xref" data-note="ml_classification">Logistic Regression</a></th><th><a class="xref" data-note="ml_knn">KNN</a></th><th><a class="xref" data-note="ml_naivebayes">Naive Bayes</a></th><th><a class="xref" data-note="ml_dtree">Decision Tree</a></th></tr>
    <tr><td>Loss</td><td>hinge</td><td>log loss</td><td>none (votes)</td><td>likelihood (counting)</td><td>impurity</td></tr>
    <tr><td>Boundary</td><td>max-margin line, any shape with kernels</td><td>straight</td><td>any shape</td><td>straight or quadratic</td><td>axis-aligned boxes</td></tr>
    <tr><td>Points that matter</td><td>support vectors only</td><td>all</td><td>the k nearest</td><td>all, through counts</td><td>all, through splits</td></tr>
    <tr><td>Probabilities</td><td>need calibration</td><td>good</td><td>coarse</td><td>too extreme</td><td>coarse</td></tr>
    <tr><td>Needs scaling</td><td>yes</td><td>yes (with penalty)</td><td>yes</td><td>no</td><td>no</td></tr>
    <tr><td>Large n</td><td>linear only</td><td>excellent</td><td>slow prediction</td><td>excellent</td><td>good</td></tr>
  </table>
  <p>Two comparisons come up in every interview. <strong>SVM versus logistic regression</strong>: the same "penalty + loss" recipe with a different loss; logistic regression gives probabilities and listens to every point, while a linear SVM ignores points beyond the margin and often does slightly better when classes are well separated. Their accuracy is usually similar; choose logistic regression when you need probabilities, and a kernel SVM for curved boundaries on modest data. <strong>SVM versus KNN</strong>: both predict from similarity to training points, but an RBF SVM learns which points matter and how much, and keeps only a few, while KNN keeps all of them and weights them equally. Next in this track, <a class="xref" data-note="ml_trees">tree-based models</a> need no scaling, handle mixed data and scale to millions of rows.</p>

  <h2 id="svm-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common SVM mistake is not scaling the features. Section 09 showed both symptoms: changing hours to minutes turned the best line into "hours = 2.5", ignoring mocks, and on the wine data the RBF SVM fell from 0.983 to 0.663. Put <code>StandardScaler</code> and the SVM together in a pipeline, and fit them only on training data.</p>
  <p>The second is getting C backwards. Because C is the price of violations, a larger C means <em>less</em> regularisation, not more:</p>
  <div class="fx" data-lang="py">for C in [1e6, 1]:
    m = SVC(kernel="linear", C=C, tol=1e-10).fit(X7, y7)
    print(f"C={C:&lt;9g} margin {2 / np.linalg.norm(m.coef_[0]):.3f}  training accuracy {m.score(X7, y7):.3f}")</div>
  <div class="fx" data-lang="text">C=1e+06     margin 0.707  training accuracy 1.000
C=1         margin 2.828  training accuracy 0.857</div>
  <p>The enormous C fits every one of the seven students, including the awkward S7, by squeezing the street to 0.707; C = 1 keeps a street four times wider and accepts one training mistake. If a model overfits, <em>decrease</em> C (and, for RBF, decrease γ). Relatedly, tuning γ without C, or over a linear grid such as 1, 2, 3, misses the diagonal interaction of section 12; search both together on a logarithmic grid.</p>
  <p>Third, treating scores as something they are not. The raw <code>decision_function</code> value is not a distance (only |w·x + b|/‖w‖ is) and not a probability. Do not write new code with <code>SVC(probability=True)</code>: it is deprecated in scikit-learn 1.9, slow (five extra fits), and its probabilities can disagree with <code>predict</code>. Use <code>CalibratedClassifierCV(SVC(), ensemble=False)</code>, which calibrates on held-out folds.</p>
  <p>Finally, three practical traps. Running a kernel SVC on hundreds of thousands of rows will take a very long time, because cost grows between n² and n³; use <code>LinearSVC</code> or a kernel approximation. Imitating a hard margin with a huge C on data that overlaps can make the solver run for a very long time too; use a sensible C or set <code>max_iter</code>. And ignoring class imbalance lets the street drift into the rare class; use <code>class_weight="balanced"</code> and then tune the decision threshold.</p>

  <h2 id="svm-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Hyperplane</b>: w·x + b = 0; predict the sign of the score f(x) = w·x + b.</li>
    <li><b>Margin</b>: distance from the boundary to the nearest training point; with canonical scaling the street is 2/‖w‖ wide.</li>
    <li><b>Support vectors</b>: training points with αᵢ &gt; 0 (on the edge, inside the street, or misclassified).</li>
    <li><b>Slack</b> ξᵢ: how far a point intrudes; <b>C</b>: price per unit of slack (inverse regularisation).</li>
    <li><b>Hinge loss</b>: max(0, 1 − y·f); SVM = L2 penalty + hinge loss.</li>
    <li><b>Kernel</b>: K(a, b) = φ(a)·φ(b); <b>kernel trick</b>: replace xᵢ·xⱼ in the dual by K(xᵢ, xⱼ).</li>
    <li><b>ε-insensitive loss</b> (SVR): max(0, |y − f| − ε).</li>
    <li><b>Platt scaling</b>: P(y = 1 | f) = 1/(1 + exp(A·f + B)), fitted on held-out scores.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>Distance to the hyperplane</td><td>|w·x + b| / ‖w‖</td></tr>
    <tr><td>Hard margin</td><td>min ½‖w‖² s.t. yᵢ(w·xᵢ + b) ≥ 1</td></tr>
    <tr><td>Soft margin</td><td>min ½‖w‖² + C Σ max(0, 1 − yᵢ(w·xᵢ + b))</td></tr>
    <tr><td>Dual</td><td>max Σαᵢ − ½ ΣΣ αᵢαⱼyᵢyⱼK(xᵢ, xⱼ), 0 ≤ αᵢ ≤ C, Σαᵢyᵢ = 0</td></tr>
    <tr><td>Weights and prediction</td><td>w = Σαᵢyᵢxᵢ; f(x) = Σαᵢyᵢ K(xᵢ, x) + b</td></tr>
    <tr><td>Kernels</td><td>linear a·b; polynomial (γ a·b + r)^d; RBF exp(−γ‖a − b‖²)</td></tr>
    <tr><td>gamma="scale"</td><td>1 / (n_features × Var(X))</td></tr>
    <tr><td>One-vs-one models</td><td>k(k − 1)/2</td></tr>
  </table>
  <h3>The students' numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th></tr>
    <tr><td>Smallest distance of candidate lines</td><td>hours = 2.5: 0.5 · x1 + x2 = 4: 0.707 · x1 + x2 = 4.5: 1.061</td></tr>
    <tr><td>Hard margin</td><td>w = (2/3, 2/3), b = −3, margin 2.121; support vectors S2, S3, S4</td></tr>
    <tr><td>Dual</td><td>α = 2/9, 2/9, 4/9; Σα = ‖w‖² = 8/9</td></tr>
    <tr><td>Soft margin with S7</td><td>C = 0.1: margin 3.143 · C = 1: 2.828, objective 1.75 · C = 10: 0.707</td></tr>
    <tr><td>Kernel identity</td><td>(1, 2), (3, 4): φ(a)·φ(b) = 121 = (a·b)²</td></tr>
    <tr><td>Burnt-out students</td><td>linear 0.667; lift (s, s²): boundaries s = 4 and 9; poly and RBF 1.000</td></tr>
    <tr><td>SVR, ε = 5</td><td>mark = 8·hours + 8·mocks + 9</td></tr>
    <tr><td>One-vs-one for (4, 4)</td><td>+0.429, −0.333, −2.333 → Pass</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC, LinearSVC, SVR
from sklearn.model_selection import GridSearchCV
from sklearn.calibration import CalibratedClassifierCV

pipe = make_pipeline(StandardScaler(), SVC(kernel="rbf", class_weight="balanced"))
grid = GridSearchCV(pipe, {"svc__C": [0.1, 1, 10, 100], "svc__gamma": [0.01, 0.1, 1, 10]}, cv=5)
grid.fit(X_train, y_train)
proba_model = CalibratedClassifierCV(SVC(), method="sigmoid", ensemble=False)   # not probability=True
make_pipeline(StandardScaler(), LinearSVC(C=1.0))                     # large data
make_pipeline(StandardScaler(), SVR(C=10, epsilon=0.1))              # regression</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Always scale, inside a pipeline.</li>
    <li>Large C = less regularisation; large γ = wigglier boundary. Tune both on a log grid.</li>
    <li>Scores are not probabilities; probability=True is deprecated in 1.9.</li>
    <li>coef_ exists only for the linear kernel.</li>
    <li>Kernel SVC cost ≈ n² to n³; use LinearSVC or Nystroem for large n.</li>
    <li>ε in SVR is in the units of y.</li>
  </ul>

  <h2 id="svm-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does an SVM optimise, in one sentence?</summary><div class="qa-body">It finds the separating hyperplane with the largest margin to the nearest training points, trading margin width against violations through C: minimise ½‖w‖² + C Σ max(0, 1 − yᵢ(w·xᵢ + b)).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the margin 2/‖w‖.</summary><div class="qa-body">The distance from x to w·x + b = 0 is |w·x + b|/‖w‖, because walking along the unit normal changes the score by ‖w‖ per unit. Rescale w and b so the nearest points have |w·x + b| = 1; each edge of the street is then 1/‖w‖ from the centre line, so the street is 2/‖w‖ wide. For the six students, w = (2/3, 2/3), ‖w‖ = 0.943, margin 2.121.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why minimise ½‖w‖² instead of maximising 2/‖w‖?</summary><div class="qa-body">Both have the same solution, but ½‖w‖² is a smooth convex quadratic. With linear constraints that makes the problem a convex quadratic program, which has a single global optimum and efficient solvers. The ½ only tidies the derivative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are support vectors? What happens if you remove a point that is not one?</summary><div class="qa-body">Support vectors are the training points with αᵢ &gt; 0: on the edge of the street, inside it, or misclassified. Since w = Σαᵢyᵢxᵢ uses only them, removing any other point and retraining gives exactly the same boundary.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a hard and a soft margin?</summary><div class="qa-body">A hard margin requires every point to be outside the street on its correct side; it has no solution if the classes overlap and is very sensitive to a single odd point. A soft margin adds a slack for each point and a cost C per unit of slack, so a few points may sit inside the street or on the wrong side in exchange for a wider, more robust street.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does C do? What happens as C becomes very large or very small?</summary><div class="qa-body">C is the price of each unit of violation, the inverse of regularisation strength. Very large C forbids violations, approaching a hard margin with a narrow street that can overfit. Very small C makes violations nearly free, so the street widens until almost every point is a support vector and the model underfits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the hinge loss, and how does it differ from log loss?</summary><div class="qa-body">Hinge loss is max(0, 1 − y·f). It is exactly zero for points beyond the margin, so those points do not influence the model, which is why only support vectors matter and why SVM scores are not probabilities. Log loss is never zero, so every point pulls on logistic regression and its outputs are roughly calibrated probabilities. Both grow linearly for badly wrong points.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>SVM vs logistic regression: what is the real difference?</summary><div class="qa-body">Both minimise an L2 penalty plus a loss; the SVM uses the hinge loss, logistic regression the log loss. So the SVM depends only on points near the boundary and gives scores, while logistic regression uses every point and gives probabilities. Accuracy is often similar; choose logistic regression when probabilities matter and a kernel SVM for curved boundaries on modest data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the kernel trick.</summary><div class="qa-body">The SVM dual uses the data only through dot products xᵢ·xⱼ. A kernel K(a, b) computes the dot product φ(a)·φ(b) in a lifted feature space directly from the original vectors, so we can replace every dot product with K and fit a linear boundary in the lifted space without building it. For a = (1, 2), b = (3, 4): the explicit degree-2 lift gives 121, and (a·b)² = 11² = 121.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does γ do in the RBF kernel, and how does it interact with C?</summary><div class="qa-body">K = exp(−γ‖a − b‖²), so γ sets how quickly similarity fades with distance. Large γ means each point influences only a tiny region, giving a wiggly boundary that overfits (on moons: training 0.98–1.00, test 0.81 at γ = 100); small γ gives a nearly linear boundary. Both γ and C control how closely the boundary follows individual points, so large γ pairs with small C; tune them together on a logarithmic grid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which kernel would you try first?</summary><div class="qa-body">Linear first when there are many features (such as text) or lots of data: it is fast, interpretable and often enough. Then RBF, which can fit any smooth boundary and is the default. Polynomial only when a particular degree of interaction is meaningful for the problem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be scaled for an SVM?</summary><div class="qa-body">The margin (through ‖w‖) and the RBF kernel (through ‖a − b‖²) depend on the units of each column, so the column with the largest numbers dominates. Recording study time in minutes made the widest street "hours = 2.5", ignoring mocks; on wine, scaling lifted RBF SVC from 0.663 to 0.983. Fit the scaler inside a pipeline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does support vector regression work?</summary><div class="qa-body">It fits the flattest function such that errors within ±ε cost nothing (the ε-insensitive loss), with C pricing errors beyond the tube. Points inside the tube are not support vectors. For the six students' marks with ε = 5 it fitted mark = 8·hours + 8·mocks + 9, with every residual within ±5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does scikit-learn's SVC handle more than two classes?</summary><div class="qa-body">One-vs-one: it trains k(k − 1)/2 binary SVMs, each on two classes' rows, and the class with the most votes wins. This is cheaper than one-vs-rest for kernel SVMs because each problem is small. decision_function_shape only changes the output shape. LinearSVC uses one-vs-rest.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get probabilities from an SVM?</summary><div class="qa-body">Fit a calibrator on held-out scores: Platt scaling fits P = 1/(1 + exp(A·f + B)), isotonic regression fits a free increasing curve. In scikit-learn 1.9, SVC(probability=True) is deprecated in favour of CalibratedClassifierCV(SVC(), ensemble=False), which does this with cross-validation and then refits one SVC on all the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your dataset has 2 million rows. Would you use SVC(kernel="rbf")?</summary><div class="qa-body">No. Kernel SVM training grows between n² and n³ and the number of support vectors grows with n, so it would be far too slow. Use LinearSVC or SGDClassifier(loss="hinge"), a kernel approximation (Nystroem or RBFSampler) followed by a linear SVM, or gradient boosting for tabular data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle class imbalance with an SVM?</summary><div class="qa-body">Without help, the cheapest solution lets the rare class's points pay slack, so the boundary drifts into it. class_weight multiplies C per class; "balanced" uses weights inversely proportional to class frequency (rare-class recall went from 0.18 to 0.87 in our example). Then tune the threshold on decision_function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are SVMs good when there are more features than samples?</summary><div class="qa-body">Their complexity is controlled by the margin, not the number of features, and the solution depends only on the support vectors; with a linear kernel the problem stays small in n. That is why linear SVMs on TF-IDF text and SVMs on gene-expression data, both with many more features than rows, work well.</div></details>
</main>
`
});
