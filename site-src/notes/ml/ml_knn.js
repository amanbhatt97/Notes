// notes/ml/ml_knn.js — K-Nearest Neighbors
Object.assign(TOPIC_CONTENT, {
  "ml_knn": `<main>
  <h1>K-Nearest Neighbors</h1>
  <div class="where"><span>Machine Learning</span><span>Classification</span><span>K-Nearest Neighbors</span></div>
  <p class="lead">K-nearest neighbors, or KNN, predicts for a new example by finding the k most similar examples it has already seen and letting them vote (or, for numbers, averaging their values). It learns no weights and assumes nothing about the shape of the boundary between classes, which makes it the simplest model in machine learning, a strong baseline, and the core of everyday tools such as recommendation, missing-value filling and vector search. Its simplicity hides real decisions, though: what "similar" means, how many neighbours to ask, why the columns must be scaled, and why it breaks down when there are many columns. We will learn all of these on one small running example: a coaching institute with eight past students, described by hours studied per day and mock tests taken, each of whom passed or failed, and one new student, Q, with 4 hours and 5 mocks, whose result we want to predict.</p>

  <h2 id="knn-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">K-Nearest Neighbors</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Similar inputs → similar outputs; ask the k closest rows</li>
          <li>Classification: majority vote; regression: average</li>
          <li><b>Lazy</b>, <b>instance-based</b>, <b>non-parametric</b>: fit only stores the data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The choices</div>
        <ul>
          <li><b>Distance</b>: Euclidean (default), Manhattan, Minkowski p, cosine</li>
          <li><b>k</b>: small = jagged, overfits; large = flat, underfits; pick by CV</li>
          <li><b>weights="distance"</b>: closer neighbours count more (1/d)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The dangers</div>
        <ul>
          <li><b>Always scale</b>: the biggest-unit column decides everything</li>
          <li><b>Curse of dimensionality</b>: with many columns everyone is equally far</li>
          <li>Prediction is O(n·d): slow on big data</li>
          <li>Majority class swamps neighbourhoods; no extrapolation</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In practice</div>
        <ul>
          <li>Pipeline(StandardScaler, KNeighborsClassifier), grid over k, weights, p</li>
          <li>KD-tree / ball tree for few columns; ANN (HNSW, IVF) for embeddings</li>
          <li>Also: KNNImputer, recommenders, anomaly scores, RAG retrieval</li>
          <li>Not K-means (that is clustering)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="knn-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Ask the Neighbours</span><span class="rm-sub">why a model with no assumptions is useful</span></div></div>
      <div class="rm-item rm-done" data-target="knn-dist"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Measuring Distance</span><span class="rm-sub">Euclidean, Manhattan, Minkowski, cosine</span></div></div>
      <div class="rm-item rm-done" data-target="knn-hand"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Predicting by Hand</span><span class="rm-sub">rank the students, let k of them vote</span></div></div>
      <div class="rm-item rm-done" data-target="knn-k"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Choosing k</span><span class="rm-sub">leave-one-out, bias and variance</span></div></div>
      <div class="rm-item rm-done" data-target="knn-weight"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Distance Weighting</span><span class="rm-sub">letting closer neighbours count more</span></div></div>
      <div class="rm-item rm-done" data-target="knn-scale"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Feature Scaling</span><span class="rm-sub">hours vs minutes, and why z-scores fix it</span></div></div>
      <div class="rm-item rm-done" data-target="knn-reg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">KNN Regression</span><span class="rm-sub">predicting a mark, and why it cannot extrapolate</span></div></div>
      <div class="rm-item rm-done" data-target="knn-curse"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Curse of Dimensionality</span><span class="rm-sub">when every point is equally far away</span></div></div>
      <div class="rm-item rm-done" data-target="knn-speed"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Making Search Fast</span><span class="rm-sub">KD-trees, ball trees, approximate search</span></div></div>
      <div class="rm-item rm-done" data-target="knn-imb"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Votes, Imbalance and Other Uses</span><span class="rm-sub">ties, rare classes, theory, imputation</span></div></div>
      <div class="rm-item rm-done" data-target="knn-practice"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">KNN in Practice</span><span class="rm-sub">sklearn, tuning, from scratch, when to use</span></div></div>
      <div class="rm-item rm-done" data-target="knn-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">scaling, leakage, duplicates, choosing k</span></div></div>
      <div class="rm-item rm-done" data-target="knn-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, the students' numbers, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="knn-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on KNN</span></div></div>
    </div>
  </div>

  <h2 id="knn-idea"><span class="num">01</span>Ask the Neighbours</h2>
  <p>A coaching institute wants to warn students who are likely to fail the final exam, early enough to help them. For each past student it knows two numbers, hours studied per day and mock tests taken, plus the result. Here is the data, including each student's final mark (we will use the marks in section 07):</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.neighbors import KNeighborsClassifier
students = pd.DataFrame({
    "name":   list("ABCDEFGH"),
    "hours":  [5, 4, 2, 2, 1, 7, 7, 2],      # hours studied per day
    "mocks":  [5, 7, 4, 7, 5, 6, 2, 1],      # mock tests taken
    "result": ["Pass", "Pass", "Fail", "Fail", "Fail", "Pass", "Pass", "Fail"],
    "mark":   [68, 61, 38, 45, 30, 82, 71, 25]})
X = students[["hours", "mocks"]].to_numpy()
y = students["result"].to_numpy()
q = np.array([[4, 5]])                       # the new student Q
print(students.to_string(index=False))</div>
  <div class="fx" data-lang="text">name  hours  mocks result  mark
   A      5      5   Pass    68
   B      4      7   Pass    61
   C      2      4   Fail    38
   D      2      7   Fail    45
   E      1      5   Fail    30
   F      7      6   Pass    82
   G      7      2   Pass    71
   H      2      1   Fail    25</div>
  <p>A new student, Q, studies 4 hours a day and has taken 5 mocks. What should we predict? A model such as <a class="xref" data-note="ml_classification">logistic regression</a> would fit one straight line through this plane and check which side Q falls on. That works if the border between Pass and Fail really is a straight line, but nothing promised us that. Real borders bend, form islands or come in several pieces, and a model that can only draw straight lines will be wrong near those bends however much data it gets. <a class="xref" data-note="ml_naivebayes">Naive Bayes</a> makes a different assumption (independent columns with a fixed shape) and has the same kind of problem when its assumption is wrong.</p>
  <p>There is a much simpler thought: look at the past students who were most like Q and see how they did. That is the whole of the <strong>k-nearest neighbors</strong> algorithm: to predict for a new example, find the k training examples closest to it and let them vote on the class (or, for a number, average their values). Think of moving to a new city and wanting a fair rent for your flat. You do not build a formula; you ask the owners of the five most similar flats nearby and take the typical answer. Ask only one and an odd owner who rents to his cousin at half price fools you. Ask five hundred and you are averaging the whole city, so your sea-facing flat gets the city average. Choosing how many to ask is choosing k.</p>
  <p>Step by step, KNN does four things. When you call <code>fit</code>, it simply stores all the training rows. When a new row arrives, it computes the distance from that row to every stored row. It keeps the k smallest distances. And it returns the majority class among those k (or their average value). There is no training loop, no loss to minimise and no weights. All the work happens when a prediction is requested, which is why KNN is called a <strong>lazy learner</strong>; models such as logistic regression are <strong>eager learners</strong>, which do the work up front and then predict quickly from a few stored numbers. KNN is also called <strong>instance-based</strong> (it predicts directly from stored examples; the training data <em>is</em> the model) and <strong>non-parametric</strong> (what it keeps grows with the data, n rows, rather than being a fixed set of weights; it still has a hyperparameter, k).</p>
  <p>Every model carries an assumption about the world. Logistic regression assumes "the classes are separated by a straight line". KNN assumes only "points that are close together usually share a label", which is called the smoothness assumption. That is a much weaker assumption, which is why KNN can follow any shape of boundary. It also means that everything depends on what "close" means, so that is where we start.</p>

  <h2 id="knn-dist"><span class="num">02</span>Measuring Distance</h2>
  <p>"The most similar students" is still a feeling. To compute anything we need one number for how far apart two students are. Each student is a point (hours, mocks), and there are several sensible ways to measure the distance between two points; each gives a different idea of "nearest". We will compute them all for the same pair, Q = (4, 5) and student H = (2, 1). The gaps are 2 hours and 4 mocks.</p>
  <p>The most familiar is the <strong>Euclidean distance</strong>, the straight-line distance you would measure with a ruler. By Pythagoras, the two gaps are the sides of a right-angled triangle and the distance is the long side: √(2² + 4²) = √20 = 4.472. In general it is √Σ(aᵢ − bᵢ)², the square root of the sum of squared gaps over all columns. This is KNN's default.</p>
  <p>The <strong>Manhattan distance</strong> adds the absolute gaps: |4 − 2| + |5 − 1| = 6. The name comes from a taxi in a city grid, which cannot cut diagonally through buildings and must drive along the streets. It is never shorter than the Euclidean distance, and because it does not square the gaps, one large gap dominates it less. The <strong>Chebyshev distance</strong> keeps only the largest gap, max(2, 4) = 4; think of a king on a chessboard, who needs as many moves as the bigger of the two gaps because he can move diagonally.</p>
  <p>These three are members of one family, the <strong>Minkowski distance</strong>: raise each absolute gap to a power p, add them up, and take the p-th root, (Σ|aᵢ − bᵢ|ᵖ)^(1/p). With p = 1 it is Manhattan (6), with p = 2 Euclidean (4.472), and as p grows the biggest gap dominates more and more until, as p → ∞, it becomes Chebyshev (4). In scikit-learn, the <code>p</code> parameter chooses which one.</p>
  <p>Sometimes the size of a vector is not what matters at all. Two news articles about cricket, one of 200 words and one of 2,000, have word-count vectors that point in the same direction, but one is ten times longer. The <strong>cosine distance</strong> ignores length and measures only the angle between two vectors, drawn as arrows from the origin: cosine similarity = (a · b) / (‖a‖ ‖b‖), and cosine distance = 1 − similarity. For Q and H: Q · H = 4×2 + 5×1 = 13, ‖Q‖ = √41 = 6.403, ‖H‖ = √5 = 2.236, so the similarity is 13 / 14.318 = 0.908 and the distance 0.092. A student with 8 hours and 10 mocks, exactly 2Q, has cosine distance 0 from Q ("identical direction") although she works twice as hard. For students that is clearly the wrong notion of similarity; for text and embeddings it is the right one. Finally, for rows of categories there is the <strong>Hamming distance</strong>, the share of positions that differ: (CBSE, Hindi, coaching) against (CBSE, English, coaching) differ in 1 of 3 places, 0.333.</p>
  <div class="fx" data-lang="py">from scipy.spatial import distance
qv, h = np.array([4., 5.]), np.array([2., 1.])          # Q and student H
print("Euclidean :", round(distance.euclidean(qv, h), 3))
print("Manhattan :", distance.cityblock(qv, h))
print("Chebyshev :", distance.chebyshev(qv, h))
for p in [1, 2, 3, 10]:
    print(f"Minkowski p={p:&lt;2}:", round(distance.minkowski(qv, h, p), 3))
print("cosine distance Q,H :", round(distance.cosine(qv, h), 4))
print("Q vs 2Q: Euclidean", round(distance.euclidean(qv, 2 * qv), 3), " cosine", round(distance.cosine(qv, 2 * qv), 4))
print("Hamming:", round(distance.hamming(["CBSE", "Hindi", "coaching"], ["CBSE", "English", "coaching"]), 3))</div>
  <div class="fx" data-lang="text">Euclidean : 4.472
Manhattan : 6.0
Chebyshev : 4.0
Minkowski p=1 : 6.0
Minkowski p=2 : 4.472
Minkowski p=3 : 4.16
Minkowski p=10: 4.0
cosine distance Q,H : 0.092
Q vs 2Q: Euclidean 6.403  cosine 0.0
Hamming: 0.333</div>
  <p>Every number matches the hand work, including the Minkowski distance sliding from 6 down to 4 as p grows, and the "2Q" student who is 6.403 away in a straight line but at cosine distance 0. The figure shows what the metric does to the idea of a neighbourhood:</p>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600">
<path d="M100 30 L170 100 L100 170 L30 100 z" class="fr sr" fill-opacity="0.6" stroke-width="2"/>
<circle cx="300" cy="100" r="70" class="fb sb" fill-opacity="0.6" stroke-width="2"/>
<rect x="430" y="30" width="140" height="140" class="fg sg" fill-opacity="0.6" stroke-width="2"/>
<line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" stroke-opacity="0.3"/><line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" stroke-opacity="0.3"/>
<circle cx="100" cy="100" r="3" fill="currentColor"/>
<text x="100" y="210" text-anchor="middle" font-size="12.5">Manhattan (p=1)</text>
<line x1="210" y1="100" x2="390" y2="100" stroke="currentColor" stroke-opacity="0.3"/><line x1="300" y1="10" x2="300" y2="190" stroke="currentColor" stroke-opacity="0.3"/>
<circle cx="300" cy="100" r="3" fill="currentColor"/>
<text x="300" y="210" text-anchor="middle" font-size="12.5">Euclidean (p=2)</text>
<line x1="410" y1="100" x2="590" y2="100" stroke="currentColor" stroke-opacity="0.3"/><line x1="500" y1="10" x2="500" y2="190" stroke="currentColor" stroke-opacity="0.3"/>
<circle cx="500" cy="100" r="3" fill="currentColor"/>
<text x="500" y="210" text-anchor="middle" font-size="12.5">Chebyshev (p=∞)</text>
<text x="100" y="226" text-anchor="middle" class="tm" font-size="11">|Δx| + |Δy| = 1</text>
<text x="300" y="226" text-anchor="middle" class="tm" font-size="11">√(Δx² + Δy²) = 1</text>
<text x="500" y="226" text-anchor="middle" class="tm" font-size="11">max(|Δx|, |Δy|) = 1</text>
</svg><figcaption>All points at distance exactly 1 from the centre, under three metrics. "Nearest" means "inside the smallest such shape", so the metric decides the shape of the neighbourhood.</figcaption></figure>
  <p>Each shape is the set of points exactly 1 unit from the centre. Under Manhattan distance it is a diamond, under Euclidean a circle, under Chebyshev a square. "The nearest neighbours" are the points inside the smallest such shape that holds k of them, so the metric literally decides the shape of the neighbourhood. In practice: use Euclidean on scaled numeric columns, try Manhattan when there are many columns or outliers, use cosine for text, ratings and embeddings, and treat p as a hyperparameter to tune. One technical note that matters later: Euclidean, Manhattan, Chebyshev and Minkowski with p ≥ 1 are true <strong>metrics</strong>, meaning they obey the triangle inequality (going from a to c directly is never longer than going via b). Cosine distance is not a true metric, and the fast search trees of section 09 rely on the triangle inequality, so they cannot use it.</p>

  <h2 id="knn-hand"><span class="num">03</span>Predicting by Hand</h2>
  <p>With a distance chosen, prediction is mechanical: compute Q's distance to every student, sort, take the k closest, and vote. Here are all eight distances, using Euclidean distance:</p>
  <div class="fx" data-lang="py">students["dist"] = np.sqrt(((X - q) ** 2).sum(axis=1)).round(3)   # Euclidean distance to Q
print(students.sort_values("dist")[["name", "hours", "mocks", "result", "dist"]].to_string(index=False))
for k in [1, 3, 5, 7]:
    m = KNeighborsClassifier(n_neighbors=k).fit(X, y)
    print(f"k={k}: {m.predict(q)[0]}   P(Fail), P(Pass) = {m.predict_proba(q)[0].round(3)}")</div>
  <div class="fx" data-lang="text">name  hours  mocks result  dist
   A      5      5   Pass 1.000
   B      4      7   Pass 2.000
   C      2      4   Fail 2.236
   D      2      7   Fail 2.828
   E      1      5   Fail 3.000
   F      7      6   Pass 3.162
   G      7      2   Pass 4.243
   H      2      1   Fail 4.472
k=1: Pass   P(Fail), P(Pass) = [0. 1.]
k=3: Pass   P(Fail), P(Pass) = [0.333 0.667]
k=5: Fail   P(Fail), P(Pass) = [0.6 0.4]
k=7: Pass   P(Fail), P(Pass) = [0.429 0.571]</div>
  <p>A (5, 5) is closest at 1.0, then B at 2.0, C at 2.236 (√(4 + 1)), and so on down to H at 4.472. Now the vote. With k = 1 we ask only A, who passed, so the prediction is Pass. With k = 3 we ask A, B and C: two Pass, one Fail, so Pass, and the share of votes, 2/3 = 0.667, is what <code>predict_proba</code> reports as P(Pass). With k = 5 we add D and E, both Fail: 2 Pass against 3 Fail, so the prediction flips to Fail with P(Pass) = 0.4. With k = 7, F and G (both Pass) join and it flips back to Pass, 4/7 = 0.571. The probabilities appear in alphabetical order of the classes, Fail then Pass.</p>
  <p>The picture explains the flipping:</p>
  <figure class="viz"><svg viewBox="0 0 600 370" width="600">
<line x1="50.0" y1="335.0" x2="50.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="50.0" y1="335.0" x2="370.0" y2="335.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="50.0" y="351.0" text-anchor="middle" class="tm" font-size="11">0</text>
<text x="42.0" y="339.0" text-anchor="end" class="tm" font-size="11">0</text>
<line x1="90.0" y1="335.0" x2="90.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="50.0" y1="295.0" x2="370.0" y2="295.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="90.0" y="351.0" text-anchor="middle" class="tm" font-size="11">1</text>
<text x="42.0" y="299.0" text-anchor="end" class="tm" font-size="11">1</text>
<line x1="130.0" y1="335.0" x2="130.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="50.0" y1="255.0" x2="370.0" y2="255.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="130.0" y="351.0" text-anchor="middle" class="tm" font-size="11">2</text>
<text x="42.0" y="259.0" text-anchor="end" class="tm" font-size="11">2</text>
<line x1="170.0" y1="335.0" x2="170.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="50.0" y1="215.0" x2="370.0" y2="215.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="170.0" y="351.0" text-anchor="middle" class="tm" font-size="11">3</text>
<text x="42.0" y="219.0" text-anchor="end" class="tm" font-size="11">3</text>
<line x1="210.0" y1="335.0" x2="210.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="50.0" y1="175.0" x2="370.0" y2="175.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="210.0" y="351.0" text-anchor="middle" class="tm" font-size="11">4</text>
<text x="42.0" y="179.0" text-anchor="end" class="tm" font-size="11">4</text>
<line x1="250.0" y1="335.0" x2="250.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="50.0" y1="135.0" x2="370.0" y2="135.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="250.0" y="351.0" text-anchor="middle" class="tm" font-size="11">5</text>
<text x="42.0" y="139.0" text-anchor="end" class="tm" font-size="11">5</text>
<line x1="290.0" y1="335.0" x2="290.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="50.0" y1="95.0" x2="370.0" y2="95.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="290.0" y="351.0" text-anchor="middle" class="tm" font-size="11">6</text>
<text x="42.0" y="99.0" text-anchor="end" class="tm" font-size="11">6</text>
<line x1="330.0" y1="335.0" x2="330.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="50.0" y1="55.0" x2="370.0" y2="55.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="330.0" y="351.0" text-anchor="middle" class="tm" font-size="11">7</text>
<text x="42.0" y="59.0" text-anchor="end" class="tm" font-size="11">7</text>
<line x1="370.0" y1="335.0" x2="370.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<line x1="50.0" y1="15.0" x2="370.0" y2="15.0" stroke="currentColor" stroke-opacity="0.08"/>
<text x="370.0" y="351.0" text-anchor="middle" class="tm" font-size="11">8</text>
<text x="42.0" y="19.0" text-anchor="end" class="tm" font-size="11">8</text>
<line x1="50.0" y1="335.0" x2="370.0" y2="335.0" stroke="currentColor"/><line x1="50.0" y1="335.0" x2="50.0" y2="15.0" stroke="currentColor"/>
<text x="210.0" y="367.0" text-anchor="middle" font-size="12">hours studied per day</text>
<text x="14" y="175.0" font-size="12" transform="rotate(-90 14 175.0)" text-anchor="middle">mock tests taken</text>
<circle cx="210.0" cy="135.0" r="43.0" fill="none" class="sg" stroke-dasharray="5 4" stroke-width="1.6"/>
<circle cx="210.0" cy="135.0" r="92.4" fill="none" class="sb" stroke-dasharray="5 4" stroke-width="1.6"/>
<circle cx="210.0" cy="135.0" r="123.0" fill="none" class="sr" stroke-dasharray="5 4" stroke-width="1.6"/>
<circle cx="250.0" cy="135.0" r="8" class="fg sg"/>
<text x="261.0" y="127.0" font-size="12" font-weight="700">A</text>
<circle cx="210.0" cy="55.0" r="8" class="fg sg"/>
<text x="221.0" y="47.0" font-size="12" font-weight="700">B</text>
<rect x="123.0" y="168.0" width="14" height="14" class="fr sr"/>
<text x="141.0" y="167.0" font-size="12" font-weight="700">C</text>
<rect x="123.0" y="48.0" width="14" height="14" class="fr sr"/>
<text x="141.0" y="47.0" font-size="12" font-weight="700">D</text>
<rect x="83.0" y="128.0" width="14" height="14" class="fr sr"/>
<text x="101.0" y="127.0" font-size="12" font-weight="700">E</text>
<circle cx="330.0" cy="95.0" r="8" class="fg sg"/>
<text x="341.0" y="87.0" font-size="12" font-weight="700">F</text>
<circle cx="330.0" cy="255.0" r="8" class="fg sg"/>
<text x="341.0" y="247.0" font-size="12" font-weight="700">G</text>
<rect x="123.0" y="288.0" width="14" height="14" class="fr sr"/>
<text x="141.0" y="287.0" font-size="12" font-weight="700">H</text>
<path d="M210.0 126.0 L218.0 135.0 L210.0 144.0 L202.0 135.0 z" class="fv" stroke="currentColor" stroke-width="1.5"/><text x="220.0" y="153.0" font-size="12">?</text>
<circle cx="400" cy="40" r="7" class="fg sg"/><text x="414" y="44" font-size="12">Pass</text>
<rect x="393" y="58" width="14" height="14" class="fr sr"/><text x="414" y="70" font-size="12">Fail</text>
<path d="M400 84 L407 92 L400 100 L393 92 z" class="fv" stroke="currentColor"/><text x="414" y="96" font-size="12">new student (4, 5)</text>
<line x1="390" y1="124" x2="410" y2="124" class="sg" stroke-dasharray="5 4" stroke-width="1.6"/><text x="414" y="128" font-size="12">k=1 reaches A → Pass</text>
<line x1="390" y1="146" x2="410" y2="146" class="sb" stroke-dasharray="5 4" stroke-width="1.6"/><text x="414" y="150" font-size="12">k=3 adds B, C → 2:1 Pass</text>
<line x1="390" y1="168" x2="410" y2="168" class="sr" stroke-dasharray="5 4" stroke-width="1.6"/><text x="414" y="172" font-size="12">k=5 adds D, E → 3:2 Fail</text>
<text x="390" y="210" font-size="11" class="tm">Each ring is drawn at the</text><text x="390" y="225" font-size="11" class="tm">distance of the k-th neighbour.</text>
</svg><figcaption>Eight past students and one new one. Growing k widens the circle of people we ask, and the vote flips from Pass to Fail.</figcaption></figure>
  <p>Passing students sit on the right (more hours), failing ones on the left, and Q is right on the border between the two regions. Each value of k draws a wider circle around Q, and as the circle grows it takes in students from one side and then the other. Far from the border, every k would give the same answer. Near it, the answer depends on how wide a circle we draw, which is why choosing k is the main decision in KNN. (A small aside: to <em>rank</em> neighbours you never need the square root, because √ preserves order; libraries compare squared distances to save time.)</p>
  <p>A fitted model can also tell you <em>which</em> neighbours it used, which is one of KNN's best features:</p>
  <div class="fx" data-lang="py">m = KNeighborsClassifier(n_neighbors=3).fit(X, y)
dist, idx = m.kneighbors(q)                  # the 3 nearest training rows: distances and positions
print("distances:", dist.round(3), " names:", students["name"].to_numpy()[idx])</div>
  <div class="fx" data-lang="text">distances: [[1.    2.    2.236]]  names: [['A' 'B' 'C']]</div>
  <p><code>kneighbors</code> returns the three distances (1, 2, 2.236) and the matching rows, A, B and C. This is how you explain a KNN prediction to a manager: "these three past students were most like Q, and two of them passed". Few models are this easy to explain.</p>

  <h2 id="knn-k"><span class="num">04</span>Choosing k</h2>
  <p>Q's prediction was Pass for k = 3 and Fail for k = 5. Both cannot be right, so how do we choose k without cheating? The obvious idea, picking the k with the best accuracy on the training data, fails completely. With k = 1, every training student's nearest neighbour is itself (distance 0), so training accuracy is always 100%. We must score each k on students the model did not use to make the prediction. That is <strong>cross-validation</strong>: hold some data out, predict it from the rest, and repeat (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>).</p>
  <p>With only eight students, the natural version is <strong>leave-one-out cross-validation</strong> (LOOCV): hide one student, predict them from the other seven, check, and repeat for all eight. For KNN this is cheap because there is nothing to retrain. By hand, take B (4, 7, Pass). Its nearest other students are D (2.00 away, Fail), A (2.24, Pass) and F (3.16, Pass). With k = 1, D alone says Fail: wrong. With k = 3, the vote is 2 Pass to 1 Fail: right. D, hidden in turn, has B as its nearest neighbour, so k = 1 gets D wrong too. These two students are each other's nearest neighbours but have different labels, and k = 1 cannot cope with that; k = 3 outvotes the one odd neighbour.</p>
  <p>Now the extreme case, k = 7, which with one student hidden means "ask everyone else". Hide a Pass student, and the remaining seven are 3 Pass and 4 Fail, so the vote says Fail. Hide a Fail student, and the rest are 4 Pass and 3 Fail, so it says Pass. Every single prediction is wrong. When k is as large as the training set, KNN ignores the query entirely and always predicts the training majority:</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import LeaveOneOut, cross_val_score
for k in [1, 3, 5, 7]:
    acc = cross_val_score(KNeighborsClassifier(n_neighbors=k), X, y, cv=LeaveOneOut())
    print(f"k={k}: LOOCV errors = {int((1 - acc).sum())} of 8")</div>
  <div class="fx" data-lang="text">k=1: LOOCV errors = 2 of 8
k=3: LOOCV errors = 0 of 8
k=5: LOOCV errors = 2 of 8
k=7: LOOCV errors = 8 of 8</div>
  <p>scikit-learn's <code>LeaveOneOut</code> splitter confirms the counts: 2 errors for k = 1, 0 for k = 3, 2 for k = 5, and 8 out of 8 for k = 7. On this data, k = 3 is the best choice, and it predicts Pass for Q.</p>
  <p>This is a clean example of the <strong>bias–variance trade-off</strong> (<a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>). With small k, each prediction depends on one or two points, so a single noisy or mislabelled row changes predictions around it: low bias, high <strong>variance</strong>, which is overfitting. With large k, predictions average over a wide region and stop following the real shape of the data: low variance, high <strong>bias</strong>, which is underfitting, and k = n is the extreme where the model always gives the same answer. A useful rule of thumb is that KNN with n rows and neighbourhoods of size k behaves roughly like a model with n/k free parameters: k = 1 memorises everything, k = n keeps a single number. Eight students cannot show the full curve, so here is a larger dataset, "two moons" (600 points in two interleaved half-circles, with noise), with 420 rows for training:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
Xm, ym = make_moons(n_samples=600, noise=0.3, random_state=0)
Xtr, Xte, ytr, yte = train_test_split(Xm, ym, test_size=0.3, random_state=0)
print("  k    train   5-fold CV")
for k in [1, 3, 5, 15, 25, 51, 201, 335]:
    m = KNeighborsClassifier(n_neighbors=k)
    cv = cross_val_score(m, Xtr, ytr, cv=5).mean()
    print(f"{k:3d}    {m.fit(Xtr, ytr).score(Xtr, ytr):.3f}   {cv:.3f}")</div>
  <div class="fx" data-lang="text">  k    train   5-fold CV
  1    1.000   0.893
  3    0.945   0.907
  5    0.940   0.907
 15    0.924   0.912
 25    0.917   0.912
 51    0.907   0.898
201    0.857   0.802
335    0.733   0.505</div>
  <p>Training accuracy is 1.000 at k = 1, as predicted, and falls as k grows. Cross-validated accuracy is lowest at small k (0.893), plateaus around 0.91 for k between 3 and 25, and collapses to 0.505, a coin toss, at k = 335, which is nearly "ask every training row". Notice how flat the middle is: any k from about 5 to 25 is fine, which is typical. Tuning k matters most at the extremes. The figure shows the actual boundaries:</p>
  <figure class="viz"><svg viewBox="0 0 620 210" width="620">
<clipPath id="knn-c0"><rect x="10" y="10" width="190" height="150"/></clipPath>
<rect x="10" y="10" width="190" height="150" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<path clip-path="url(#knn-c0)" d="M107 53h0 M92 64h0 M67 68h0 M43 69h0 M79 76h0 M42 47h0 M50 97h0 M34 89h0 M105 100h0 M60 51h0 M49 72h0 M122 63h0 M116 44h0 M110 72h0 M36 57h0 M55 53h0 M131 73h0 M117 99h0 M94 77h0 M80 51h0 M100 30h0 M62 92h0 M79 33h0 M121 45h0 M50 78h0 M78 71h0 M84 44h0 M37 91h0 M55 117h0 M124 91h0 M52 99h0 M51 67h0 M122 100h0 M141 76h0 M60 60h0 M105 61h0 M33 113h0 M148 90h0 M72 47h0 M97 38h0 M113 58h0 M94 81h0 M106 46h0 M120 76h0 M48 73h0 M54 79h0 M133 48h0 M76 67h0 M86 57h0 M64 51h0 M140 80h0 M50 55h0 M67 71h0 M46 95h0 M23 93h0 M108 80h0 M69 74h0 M90 58h0 M37 79h0 M132 93h0 M126 60h0 M88 57h0 M69 59h0 M128 65h0 M80 49h0 M148 95h0 M60 32h0 M139 91h0 M102 58h0 M118 73h0 M132 94h0 M41 27h0 M27 51h0 M23 105h0 M33 83h0 M106 79h0 M99 95h0 M120 48h0 M122 58h0 M133 76h0 M112 85h0 M58 58h0 M38 79h0 M97 54h0 M109 23h0 M137 75h0 M39 89h0 M88 68h0 M71 97h0 M43 118h0 M70 55h0 M80 78h0 M89 54h0 M42 79h0 M88 71h0 M67 94h0 M40 97h0 M130 56h0 M46 53h0 M107 78h0 M114 79h0 M90 15h0 M58 65h0 M102 81h0 M105 79h0 M124 86h0 M37 84h0 M15 80h0 M114 43h0 M119 62h0 M33 102h0 M120 50h0 M95 27h0 M50 56h0 M118 52h0 M109 45h0 M89 54h0 M56 73h0 M66 81h0 M127 67h0 M119 87h0 M40 96h0 M56 65h0 M89 55h0 M40 83h0 M84 24h0 M38 86h0 M117 71h0 M99 71h0 M88 44h0 M92 62h0 M42 103h0 M132 97h0 M48 96h0 M107 38h0 M60 56h0 M104 39h0 M23 97h0 M87 69h0 M61 63h0 M93 63h0 M56 77h0 M60 64h0 M106 56h0 M121 56h0 M40 109h0 M84 63h0 M53 59h0 M125 79h0 M117 52h0 M101 82h0 M77 52h0 M75 70h0 M31 64h0 M41 35h0 M85 26h0 M34 78h0 M71 52h0 M19 58h0 M43 106h0 M109 68h0 M57 74h0 M132 66h0 M113 55h0 M116 51h0 M47 89h0 M30 73h0 M70 57h0 M36 87h0 M129 62h0 M98 76h0 M113 84h0 M34 74h0 M46 90h0 M138 92h0 M37 87h0 M111 72h0 M85 70h0 M70 52h0 M113 57h0 M112 68h0 M27 87h0 M113 91h0 M45 74h0 M119 50h0 M89 42h0 M100 48h0 M33 64h0 M110 100h0 M54 80h0 M81 50h0 M100 86h0 M104 67h0 M134 94h0 M69 30h0 M119 53h0 M86 62h0 M93 54h0 M124 77h0 M35 67h0 M117 36h0 M28 90h0 M66 33h0 M57 108h0 M156 78h0 M89 44h0 M48 88h0 M115 82h0" class="sb" stroke-width="4" stroke-linecap="round" stroke-opacity="0.6"/>
<path clip-path="url(#knn-c0)" d="M72 94h0 M105 134h0 M73 81h0 M86 79h0 M149 69h0 M118 120h0 M174 124h0 M153 101h0 M163 144h0 M80 105h0 M161 89h0 M145 85h0 M109 114h0 M83 95h0 M113 115h0 M170 122h0 M85 82h0 M117 101h0 M164 125h0 M148 107h0 M181 78h0 M152 111h0 M156 113h0 M163 120h0 M117 108h0 M177 56h0 M153 109h0 M97 74h0 M154 97h0 M138 103h0 M110 87h0 M101 102h0 M167 117h0 M160 131h0 M64 91h0 M102 83h0 M89 97h0 M118 97h0 M109 132h0 M192 103h0 M135 84h0 M149 112h0 M95 97h0 M103 113h0 M111 118h0 M66 64h0 M107 89h0 M165 99h0 M98 128h0 M138 116h0 M85 95h0 M114 131h0 M56 68h0 M144 86h0 M155 136h0 M145 95h0 M151 96h0 M162 95h0 M154 90h0 M166 89h0 M135 118h0 M110 93h0 M134 150h0 M135 119h0 M168 65h0 M82 75h0 M91 121h0 M173 110h0 M89 127h0 M146 93h0 M90 121h0 M122 142h0 M59 101h0 M195 102h0 M81 112h0 M108 128h0 M164 104h0 M70 108h0 M167 68h0 M172 100h0 M70 131h0 M119 119h0 M110 107h0 M115 106h0 M173 64h0 M114 105h0 M106 93h0 M86 112h0 M99 100h0 M159 81h0 M132 140h0 M173 105h0 M75 104h0 M59 97h0 M130 133h0 M125 114h0 M148 110h0 M152 134h0 M114 101h0 M161 92h0 M126 125h0 M195 73h0 M183 70h0 M179 93h0 M86 54h0 M128 116h0 M168 103h0 M172 113h0 M165 70h0 M94 125h0 M173 99h0 M166 117h0 M81 102h0 M165 124h0 M186 80h0 M136 143h0 M109 108h0 M165 95h0 M85 103h0 M73 83h0 M124 117h0 M111 97h0 M104 102h0 M151 87h0 M84 109h0 M86 114h0 M85 93h0 M183 92h0 M187 84h0 M130 87h0 M170 75h0 M89 96h0 M85 96h0 M176 81h0 M120 104h0 M165 100h0 M112 102h0 M81 98h0 M124 99h0 M151 141h0 M128 147h0 M171 120h0 M89 93h0 M154 114h0 M106 120h0 M135 127h0 M173 86h0 M144 123h0 M169 100h0 M182 82h0 M93 96h0 M62 118h0 M108 99h0 M125 95h0 M87 112h0 M153 129h0 M130 118h0 M131 140h0 M107 107h0 M143 122h0 M158 85h0 M157 121h0 M160 96h0 M181 119h0 M163 86h0 M144 118h0 M90 116h0 M112 128h0 M145 119h0 M103 121h0 M159 104h0 M153 121h0 M96 119h0 M175 108h0 M118 116h0 M107 97h0 M94 89h0 M92 97h0 M168 75h0 M173 64h0 M157 108h0 M100 76h0 M169 80h0 M171 92h0 M65 84h0 M141 136h0 M103 92h0 M180 76h0 M102 128h0 M100 77h0 M160 85h0 M98 119h0 M62 96h0 M184 65h0 M122 109h0 M81 91h0 M158 93h0 M76 79h0 M172 89h0 M130 113h0 M152 71h0 M118 137h0 M106 88h0 M94 93h0 M109 90h0 M133 106h0 M186 110h0 M145 125h0 M78 107h0 M154 113h0 M90 75h0 M115 120h0" class="sr" stroke-width="4" stroke-linecap="round" stroke-opacity="0.6"/>
<polyline clip-path="url(#knn-c0)" points="161.2,10.0 161.2,10.9 161.2,11.9 161.2,12.8 161.2,13.8 161.2,14.7 161.2,15.7 161.2,16.6 160.6,17.1 160.0,17.5 160.0,18.5 160.0,19.4 160.0,20.4 160.0,21.3 160.0,22.3 160.0,23.2 160.0,24.2 159.4,24.6 158.8,25.1 158.8,26.0 158.8,27.0 158.8,27.9 158.8,28.9 158.8,29.8 158.8,30.8 158.8,31.7 158.2,32.2 157.6,32.6 157.6,33.6 157.6,34.5 157.6,35.5 157.6,36.4 157.6,37.4 157.6,38.3 157.6,39.2 157.0,39.7 156.4,40.2 156.4,41.1 156.4,42.1 156.4,43.0 155.8,43.5 155.2,44.0 155.2,44.9 155.2,45.8 154.6,46.3 154.0,46.8 153.4,47.3 152.8,47.7 152.2,48.2 151.6,48.7 151.0,49.2 150.4,49.6 150.4,50.6 149.8,51.0 149.2,51.5 148.6,52.0 148.0,52.5 147.4,52.9 146.8,53.4 146.2,53.9 145.6,54.3 145.0,54.8 144.4,55.3 143.8,55.8 143.2,56.2 143.2,57.2 142.6,57.6 142.0,58.1 142.0,59.1 142.0,60.0 142.0,60.9 142.0,61.9 141.4,62.4 140.8,62.8 140.8,63.8 140.8,64.7 140.8,65.7 140.8,66.6 141.4,67.1 142.0,67.5 142.0,68.5 142.6,69.0 143.2,69.4 143.2,70.4 143.8,70.8 144.4,71.3 144.4,72.3 145.0,72.7 145.6,73.2 145.6,74.2 146.2,74.6 146.8,75.1 146.8,76.0 147.4,76.5 148.0,77.0 148.0,77.9 147.4,78.4 146.8,78.9 146.2,79.3 145.6,79.8 145.0,80.3 144.4,80.8 143.8,81.2 143.2,81.7 142.6,82.2 142.0,82.6 141.4,83.1 140.8,83.6 140.3,84.1 139.7,83.6 139.1,83.1 138.5,82.6 137.9,82.2 137.3,81.7 137.3,80.8 136.7,80.3 136.1,79.8 135.5,79.3 134.9,79.8 134.3,80.3 133.1,80.3 132.5,80.8 131.9,81.2 130.7,81.2 129.5,81.2 128.9,81.7 128.3,82.2 127.7,82.6 127.7,83.6 127.7,84.5 127.7,85.5 127.1,85.9 126.5,86.4 126.5,87.4 126.5,88.3 127.1,88.8 127.7,89.2 127.7,90.2 128.3,90.7 129.5,90.7 130.1,90.2 130.7,89.7 131.9,89.7 133.1,89.7 133.7,89.2 134.3,88.8 135.5,88.8 136.1,88.3 136.7,87.8 137.3,87.4 137.9,86.9 138.5,86.4 139.1,85.9 139.7,86.4 140.3,86.9 140.8,87.4 140.8,88.3 141.4,88.8 142.0,89.2 142.6,89.7 143.2,90.2 143.2,91.1 142.6,91.6 142.0,92.1 142.0,93.0 142.0,94.0 141.4,94.4 140.8,94.9 140.8,95.8 140.8,96.8 140.3,97.3 139.1,97.3 137.9,97.3 137.3,97.7 136.7,98.2 136.1,98.7 135.5,99.2 134.9,99.6 134.9,100.6 134.3,101.0 133.1,101.0 131.9,101.0 130.7,101.0 129.5,101.0 128.9,100.6 128.3,100.1 127.7,99.6 127.7,98.7 128.3,98.2 128.9,97.7 128.9,96.8 128.9,95.8 128.9,94.9 128.9,94.0 128.3,93.5 127.7,93.0 127.1,92.5 126.5,93.0 125.9,93.5 124.7,93.5 123.5,93.5 122.3,93.5 121.1,93.5 120.5,93.0 119.9,92.5 119.3,92.1 118.7,91.6 118.1,92.1 117.5,92.5 116.9,93.0 116.4,93.5 115.8,94.0 115.2,94.4 114.0,94.4 112.8,94.4 112.2,94.0 112.2,93.0 112.2,92.1 111.6,91.6 111.0,91.1 111.0,90.2 111.0,89.2 111.6,88.8 112.2,88.3 112.2,87.4 111.6,86.9 111.0,86.4 110.4,85.9 109.8,85.5 109.8,84.5 109.2,84.1 108.0,84.1 106.8,84.1 105.6,84.1 105.0,83.6 105.0,82.6 104.4,82.2 103.2,82.2 102.0,82.2 100.8,82.2 100.2,82.6 99.6,83.1 99.0,83.6 99.6,84.1 100.2,84.5 100.8,85.0 102.0,85.0 102.6,85.5 103.2,85.9 103.8,86.4 103.2,86.9 102.6,87.4 102.6,88.3 102.0,88.8 101.4,89.2 100.8,89.7 100.2,90.2 100.2,91.1 100.2,92.1 100.8,92.5 101.4,93.0 101.4,94.0 102.0,94.4 102.6,94.9 102.6,95.8 103.2,96.3 103.8,96.8 104.4,97.3 105.0,97.7 105.6,98.2 106.2,98.7 106.8,99.2 107.4,99.6 107.4,100.6 107.4,101.5 108.0,102.0 108.6,101.5 108.6,100.6 109.2,100.1 109.8,99.6 109.8,98.7 110.4,98.2 111.0,98.7 111.6,99.2 112.2,99.6 111.6,100.1 111.0,100.6 111.0,101.5 110.4,102.0 109.8,102.5 109.2,102.9 108.0,102.9 106.8,102.9 106.2,102.5 105.6,102.0 105.0,101.5 105.0,100.6 104.4,100.1 103.8,99.6 103.2,99.2 102.6,98.7 102.6,97.7 102.0,97.3 100.8,97.3 99.6,97.3 98.4,97.3 97.8,96.8 97.2,96.3 96.6,95.8 96.6,94.9 96.6,94.0 96.6,93.0 96.6,92.1 97.2,91.6 97.8,91.1 97.8,90.2 97.8,89.2 97.8,88.3 97.2,87.8 96.6,87.4 96.6,86.4 96.6,85.5 96.0,85.0 94.8,85.0 93.6,85.0 92.5,85.0 91.3,85.0 90.7,84.5 90.7,83.6 90.1,83.1 89.5,82.6 89.5,81.7 89.5,80.8 90.1,80.3 90.7,79.8 90.7,78.9 90.7,77.9 91.3,77.5 91.9,77.0 91.9,76.0 91.9,75.1 92.5,74.6 93.1,74.2 93.1,73.2 93.6,72.7 94.2,73.2 94.2,74.2 94.8,74.6 95.4,75.1 96.0,75.6 96.6,75.1 97.2,74.6 98.4,74.6 99.0,75.1 99.0,76.0 99.0,77.0 98.4,77.5 97.8,77.9 97.8,78.9 97.8,79.8 98.4,80.3 99.0,79.8 99.6,79.3 100.8,79.3 101.4,78.9 102.0,78.4 102.6,77.9 103.2,77.5 103.8,77.0 103.8,76.0 103.8,75.1 104.4,74.6 105.0,74.2 105.0,73.2 104.4,72.7 103.2,72.7 102.0,72.7 101.4,73.2 100.8,73.7 99.6,73.7 99.0,73.2 98.4,72.7 97.8,72.3 97.2,71.8 96.6,71.3 96.0,70.8 95.4,70.4 94.8,69.9 93.6,69.9 93.1,70.4 92.5,70.8 91.9,71.3 91.3,71.8 90.7,72.3 90.1,72.7 89.5,73.2 88.9,73.7 87.7,73.7 87.1,74.2 86.5,74.6 85.9,74.2 85.3,73.7 84.1,73.7 83.5,73.2 82.9,72.7 82.3,72.3 81.7,71.8 81.1,72.3 80.5,72.7 79.9,73.2 79.9,74.2 79.9,75.1 79.9,76.0 80.5,76.5 81.1,77.0 81.7,77.5 82.3,77.9 82.9,78.4 83.5,78.9 82.9,79.3 82.3,79.8 82.3,80.8 82.3,81.7 81.7,82.2 81.1,82.6 81.1,83.6 80.5,84.1 79.9,84.5 79.3,85.0 78.7,84.5 78.7,83.6 78.7,82.6 78.7,81.7 78.1,81.2 77.5,80.8 77.5,79.8 77.5,78.9 77.5,77.9 76.9,77.5 76.3,77.0 76.3,76.0 75.7,75.6 75.1,75.1 74.5,74.6 73.9,75.1 73.3,75.6 72.7,76.0 72.1,76.5 71.5,77.0 70.9,77.5 69.7,77.5 69.2,77.9 69.2,78.9 69.2,79.8 69.2,80.8 69.2,81.7 69.2,82.6 69.2,83.6 68.6,84.1 68.0,83.6 67.4,83.1 66.2,83.1 65.0,83.1 64.4,82.6 63.8,82.2 62.6,82.2 61.4,82.2 60.8,81.7 60.2,81.2 59.6,81.7 59.6,82.6 59.6,83.6 59.0,84.1 58.4,84.5 58.4,85.5 59.0,85.9 59.6,86.4 60.2,86.9 61.4,86.9 62.0,87.4 62.0,88.3 62.0,89.2 62.6,89.7 63.2,90.2 63.2,91.1 63.2,92.1 63.2,93.0 62.6,93.5 61.4,93.5 60.2,93.5 59.6,93.0 59.0,92.5 58.4,92.1 57.8,91.6 56.6,91.6 56.0,91.1 55.4,90.7 54.8,91.1 54.8,92.1 54.8,93.0 54.8,94.0 54.8,94.9 54.8,95.8 55.4,96.3 56.0,96.8 56.0,97.7 56.0,98.7 56.0,99.6 56.0,100.6 55.4,101.0 54.8,101.5 54.8,102.5 55.4,102.9 56.0,103.4 56.6,103.9 57.8,103.9 58.4,104.3 59.0,104.8 60.2,104.8 60.8,105.3 61.4,105.8 62.6,105.8 63.2,106.2 63.2,107.2 63.2,108.1 63.2,109.1 63.2,110.0 63.2,110.9 62.6,111.4 62.0,111.9 61.4,112.4 60.2,112.4 59.6,112.8 59.6,113.8 59.0,114.2 58.4,114.7 58.4,115.7 58.4,116.6 58.4,117.5 58.4,118.5 58.4,119.4 58.4,120.4 57.8,120.8 57.2,121.3 57.2,122.3 57.2,123.2 57.2,124.2 57.2,125.1 57.2,126.0 57.2,127.0 56.6,127.5 56.0,127.9 56.0,128.9 56.0,129.8 56.0,130.8 56.0,131.7 55.4,132.2 54.8,132.6 54.2,133.1 53.6,133.6 53.6,134.5 53.0,135.0 52.4,135.5 51.8,135.9 51.2,136.4 51.2,137.4 50.6,137.8 50.0,138.3 50.0,139.2 49.4,139.7 48.8,140.2 48.8,141.1 48.8,142.1 48.2,142.5 47.6,143.0 47.6,144.0 47.6,144.9 47.0,145.4 46.4,145.8 46.4,146.8 46.4,147.7 45.8,148.2 45.3,148.7 45.3,149.6 45.3,150.6 44.7,151.0 44.1,151.5 44.1,152.5 44.1,153.4 43.5,153.9 42.9,154.3 42.9,155.3 42.3,155.8 41.7,156.2 41.7,157.2 41.7,158.1 41.1,158.6 40.5,159.1 40.5,160.0" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c0)" points="124.7,104.8 124.1,104.3 123.5,103.9 122.9,103.4 122.3,102.9 121.1,102.9 120.5,102.5 119.9,102.0 119.3,101.5 119.3,100.6 119.3,99.6 119.9,99.2 120.5,98.7 121.1,98.2 121.7,98.7 122.3,99.2 122.9,99.6 123.5,100.1 124.1,100.6 124.7,101.0 125.3,101.5 125.9,102.0 126.5,102.5 127.1,102.9 127.7,103.4 127.1,103.9 126.5,104.3 125.9,104.8 124.7,104.8" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c0)" points="66.2,102.0 65.6,101.5 66.2,101.0 66.8,100.6 66.8,99.6 66.8,98.7 66.2,98.2 65.6,97.7 65.6,96.8 65.0,96.3 64.4,95.8 64.4,94.9 64.4,94.0 64.4,93.0 65.0,92.5 65.6,92.1 66.2,91.6 66.8,91.1 67.4,90.7 68.0,90.2 68.0,89.2 68.6,88.8 69.2,89.2 69.2,90.2 69.2,91.1 69.2,92.1 69.2,93.0 69.2,94.0 69.7,94.4 70.3,94.9 70.9,95.4 72.1,95.4 72.7,95.8 73.3,96.3 74.5,96.3 75.1,96.8 75.1,97.7 75.1,98.7 74.5,99.2 73.9,99.6 73.3,100.1 72.7,100.6 72.1,101.0 70.9,101.0 70.3,101.5 69.7,102.0 68.6,102.0 67.4,102.0 66.2,102.0" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c0)" points="146.2,101.0 145.6,100.6 145.6,99.6 145.6,98.7 146.2,98.2 146.8,97.7 146.8,96.8 146.8,95.8 146.8,94.9 146.8,94.0 147.4,93.5 148.0,93.0 148.0,92.1 147.4,91.6 146.8,91.1 146.2,90.7 145.6,90.2 145.0,89.7 144.4,89.2 145.0,88.8 145.6,88.3 146.2,87.8 146.8,87.4 147.4,86.9 148.6,86.9 149.2,87.4 149.2,88.3 149.8,88.8 150.4,89.2 150.4,90.2 151.0,90.7 151.6,91.1 151.0,91.6 150.4,92.1 150.4,93.0 149.8,93.5 149.2,94.0 149.2,94.9 149.2,95.8 149.2,96.8 149.2,97.7 148.6,98.2 148.0,98.7 148.0,99.6 148.0,100.6 147.4,101.0 146.2,101.0" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c0)" points="115.2,100.1 114.6,99.6 114.6,98.7 114.0,98.2 113.4,97.7 114.0,97.3 114.6,96.8 114.6,95.8 115.2,95.4 115.8,95.8 116.4,96.3 116.9,96.8 116.9,97.7 117.5,98.2 118.1,98.7 118.1,99.6 117.5,100.1 116.4,100.1 115.2,100.1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c0)" points="153.4,82.2 152.8,81.7 152.2,81.2 151.6,80.8 151.0,80.3 149.8,80.3 149.2,79.8 149.2,78.9 149.2,77.9 149.8,77.5 150.4,77.0 151.0,76.5 151.6,76.0 152.2,75.6 152.8,75.1 153.4,74.6 154.6,74.6 155.2,74.2 155.8,73.7 156.4,73.2 157.0,72.7 157.6,72.3 158.2,71.8 158.8,72.3 159.4,72.7 160.0,73.2 160.6,73.7 161.2,74.2 161.2,75.1 161.2,76.0 160.6,76.5 160.0,77.0 159.4,77.5 158.8,77.9 158.8,78.9 158.2,79.3 157.6,79.8 157.0,80.3 156.4,80.8 156.4,81.7 155.8,82.2 154.6,82.2 153.4,82.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c0)" points="53.0,69.9 54.2,69.9 55.4,69.9 56.6,69.9 57.8,69.9 59.0,69.9 60.2,69.9 60.8,69.4 60.2,69.0 59.6,68.5 59.6,67.5 59.0,67.1 57.8,67.1 57.2,66.6 56.6,66.1 55.4,66.1 54.2,66.1 53.6,66.6 53.6,67.5 53.6,68.5 53.0,69.0 52.4,69.4 53.0,69.9" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c0)" points="63.8,67.1 64.4,66.6 65.0,66.1 66.2,66.1 67.4,66.1 68.6,66.1 69.2,65.7 69.7,65.2 70.9,65.2 71.5,64.7 71.5,63.8 70.9,63.3 69.7,63.3 69.2,62.8 68.6,62.4 68.0,61.9 67.4,61.4 66.8,60.9 66.2,60.5 65.0,60.5 64.4,60.9 64.4,61.9 64.4,62.8 64.4,63.8 63.8,64.2 63.2,64.7 63.2,65.7 63.2,66.6 63.8,67.1" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c0)" points="81.7,56.7 82.3,56.2 81.7,55.8 81.1,56.2 81.7,56.7" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c0)" points="82.9,55.8 84.1,55.8 85.3,55.8 86.5,55.8 87.1,55.3 87.1,54.3 87.1,53.4 87.1,52.5 87.1,51.5 87.1,50.6 87.1,49.6 86.5,49.2 85.9,49.6 85.3,50.1 84.7,50.6 84.1,51.0 83.5,51.5 83.5,52.5 82.9,52.9 82.3,53.4 82.3,54.3 82.3,55.3 82.9,55.8" fill="none" stroke="currentColor" stroke-width="1.8"/>
<text x="105.0" y="178" text-anchor="middle" font-size="12.5" font-weight="700">k = 1</text>
<text x="105.0" y="194" text-anchor="middle" font-size="11" class="tm">train 1.000 · test 0.894</text>
<clipPath id="knn-c1"><rect x="215" y="10" width="190" height="150"/></clipPath>
<rect x="215" y="10" width="190" height="150" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<path clip-path="url(#knn-c1)" d="M312 53h0 M297 64h0 M272 68h0 M248 69h0 M284 76h0 M247 47h0 M255 97h0 M239 89h0 M310 100h0 M265 51h0 M254 72h0 M327 63h0 M321 44h0 M315 72h0 M241 57h0 M260 53h0 M336 73h0 M322 99h0 M299 77h0 M285 51h0 M305 30h0 M267 92h0 M284 33h0 M326 45h0 M255 78h0 M283 71h0 M289 44h0 M242 91h0 M260 117h0 M329 91h0 M257 99h0 M256 67h0 M327 100h0 M346 76h0 M265 60h0 M310 61h0 M238 113h0 M353 90h0 M277 47h0 M302 38h0 M318 58h0 M299 81h0 M311 46h0 M325 76h0 M253 73h0 M259 79h0 M338 48h0 M281 67h0 M291 57h0 M269 51h0 M345 80h0 M255 55h0 M272 71h0 M251 95h0 M228 93h0 M313 80h0 M274 74h0 M295 58h0 M242 79h0 M337 93h0 M331 60h0 M293 57h0 M274 59h0 M333 65h0 M285 49h0 M353 95h0 M265 32h0 M344 91h0 M307 58h0 M323 73h0 M337 94h0 M246 27h0 M232 51h0 M228 105h0 M238 83h0 M311 79h0 M304 95h0 M325 48h0 M327 58h0 M338 76h0 M317 85h0 M263 58h0 M243 79h0 M302 54h0 M314 23h0 M342 75h0 M244 89h0 M293 68h0 M276 97h0 M248 118h0 M275 55h0 M285 78h0 M294 54h0 M247 79h0 M293 71h0 M272 94h0 M245 97h0 M335 56h0 M251 53h0 M312 78h0 M319 79h0 M295 15h0 M263 65h0 M307 81h0 M310 79h0 M329 86h0 M242 84h0 M220 80h0 M319 43h0 M324 62h0 M238 102h0 M325 50h0 M300 27h0 M255 56h0 M323 52h0 M314 45h0 M294 54h0 M261 73h0 M271 81h0 M332 67h0 M324 87h0 M245 96h0 M261 65h0 M294 55h0 M245 83h0 M289 24h0 M243 86h0 M322 71h0 M304 71h0 M293 44h0 M297 62h0 M247 103h0 M337 97h0 M253 96h0 M312 38h0 M265 56h0 M309 39h0 M228 97h0 M292 69h0 M266 63h0 M298 63h0 M261 77h0 M265 64h0 M311 56h0 M326 56h0 M245 109h0 M289 63h0 M258 59h0 M330 79h0 M322 52h0 M306 82h0 M282 52h0 M280 70h0 M236 64h0 M246 35h0 M290 26h0 M239 78h0 M276 52h0 M224 58h0 M248 106h0 M314 68h0 M262 74h0 M337 66h0 M318 55h0 M321 51h0 M252 89h0 M235 73h0 M275 57h0 M241 87h0 M334 62h0 M303 76h0 M318 84h0 M239 74h0 M251 90h0 M343 92h0 M242 87h0 M316 72h0 M290 70h0 M275 52h0 M318 57h0 M317 68h0 M232 87h0 M318 91h0 M250 74h0 M324 50h0 M294 42h0 M305 48h0 M238 64h0 M315 100h0 M259 80h0 M286 50h0 M305 86h0 M309 67h0 M339 94h0 M274 30h0 M324 53h0 M291 62h0 M298 54h0 M329 77h0 M240 67h0 M322 36h0 M233 90h0 M271 33h0 M262 108h0 M361 78h0 M294 44h0 M253 88h0 M320 82h0" class="sb" stroke-width="4" stroke-linecap="round" stroke-opacity="0.6"/>
<path clip-path="url(#knn-c1)" d="M277 94h0 M310 134h0 M278 81h0 M291 79h0 M354 69h0 M323 120h0 M379 124h0 M358 101h0 M368 144h0 M285 105h0 M366 89h0 M350 85h0 M314 114h0 M288 95h0 M318 115h0 M375 122h0 M290 82h0 M322 101h0 M369 125h0 M353 107h0 M386 78h0 M357 111h0 M361 113h0 M368 120h0 M322 108h0 M382 56h0 M358 109h0 M302 74h0 M359 97h0 M343 103h0 M315 87h0 M306 102h0 M372 117h0 M365 131h0 M269 91h0 M307 83h0 M294 97h0 M323 97h0 M314 132h0 M397 103h0 M340 84h0 M354 112h0 M300 97h0 M308 113h0 M316 118h0 M271 64h0 M312 89h0 M370 99h0 M303 128h0 M343 116h0 M290 95h0 M319 131h0 M261 68h0 M349 86h0 M360 136h0 M350 95h0 M356 96h0 M367 95h0 M359 90h0 M371 89h0 M340 118h0 M315 93h0 M339 150h0 M340 119h0 M373 65h0 M287 75h0 M296 121h0 M378 110h0 M294 127h0 M351 93h0 M295 121h0 M327 142h0 M264 101h0 M400 102h0 M286 112h0 M313 128h0 M369 104h0 M275 108h0 M372 68h0 M377 100h0 M275 131h0 M324 119h0 M315 107h0 M320 106h0 M378 64h0 M319 105h0 M311 93h0 M291 112h0 M304 100h0 M364 81h0 M337 140h0 M378 105h0 M280 104h0 M264 97h0 M335 133h0 M330 114h0 M353 110h0 M357 134h0 M319 101h0 M366 92h0 M331 125h0 M400 73h0 M388 70h0 M384 93h0 M291 54h0 M333 116h0 M373 103h0 M377 113h0 M370 70h0 M299 125h0 M378 99h0 M371 117h0 M286 102h0 M370 124h0 M391 80h0 M341 143h0 M314 108h0 M370 95h0 M290 103h0 M278 83h0 M329 117h0 M316 97h0 M309 102h0 M356 87h0 M289 109h0 M291 114h0 M290 93h0 M388 92h0 M392 84h0 M335 87h0 M375 75h0 M294 96h0 M290 96h0 M381 81h0 M325 104h0 M370 100h0 M317 102h0 M286 98h0 M329 99h0 M356 141h0 M333 147h0 M376 120h0 M294 93h0 M359 114h0 M311 120h0 M340 127h0 M378 86h0 M349 123h0 M374 100h0 M387 82h0 M298 96h0 M267 118h0 M313 99h0 M330 95h0 M292 112h0 M358 129h0 M335 118h0 M336 140h0 M312 107h0 M348 122h0 M363 85h0 M362 121h0 M365 96h0 M386 119h0 M368 86h0 M349 118h0 M295 116h0 M317 128h0 M350 119h0 M308 121h0 M364 104h0 M358 121h0 M301 119h0 M380 108h0 M323 116h0 M312 97h0 M299 89h0 M297 97h0 M373 75h0 M378 64h0 M362 108h0 M305 76h0 M374 80h0 M376 92h0 M270 84h0 M346 136h0 M308 92h0 M385 76h0 M307 128h0 M305 77h0 M365 85h0 M303 119h0 M267 96h0 M389 65h0 M327 109h0 M286 91h0 M363 93h0 M281 79h0 M377 89h0 M335 113h0 M357 71h0 M323 137h0 M311 88h0 M299 93h0 M314 90h0 M338 106h0 M391 110h0 M350 125h0 M283 107h0 M359 113h0 M295 75h0 M320 120h0" class="sr" stroke-width="4" stroke-linecap="round" stroke-opacity="0.6"/>
<polyline clip-path="url(#knn-c1)" points="367.4,10.0 367.4,10.9 366.8,11.4 366.5,11.9 366.2,12.8 366.2,13.8 366.2,14.7 365.6,15.2 365.0,15.7 364.7,16.6 364.7,17.5 364.4,18.0 363.8,18.5 363.8,19.4 363.2,19.9 362.6,20.4 362.6,21.3 362.0,21.8 361.7,22.3 361.4,23.2 360.8,23.7 360.5,24.2 360.5,25.1 360.2,26.0 360.2,27.0 359.6,27.5 359.0,27.9 359.0,28.9 359.0,29.8 359.0,30.8 358.4,31.2 357.8,31.7 357.8,32.6 357.8,33.6 357.8,34.5 357.2,35.0 356.9,35.5 356.9,36.4 356.6,37.4 356.6,38.3 356.0,38.8 355.8,39.2 355.8,40.2 355.7,41.1 355.7,42.1 355.4,43.0 355.4,44.0 355.4,44.9 354.8,45.4 354.6,45.8 354.8,46.3 355.4,46.8 355.4,47.7 355.4,48.7 355.4,49.6 356.0,50.1 356.6,50.6 356.6,51.5 356.6,52.5 356.6,53.4 356.6,54.3 356.6,55.3 356.6,56.2 356.0,56.7 355.8,57.2 355.8,58.1 356.0,58.6 356.3,59.1 356.3,60.0 356.2,60.9 356.0,61.4 355.7,61.9 355.7,62.8 355.0,63.8 354.8,64.2 354.2,64.7 353.6,65.2 353.3,65.7 353.3,66.6 353.0,67.5 352.4,68.0 351.8,68.5 351.8,69.4 351.2,69.9 350.6,70.4 350.6,71.3 350.6,72.3 351.2,72.7 351.5,73.2 351.2,73.7 350.6,74.2 350.6,75.1 350.0,75.6 349.7,76.0 350.0,76.5 350.3,77.0 350.0,77.5 349.4,77.9 349.4,78.9 349.4,79.8 349.4,80.8 348.8,81.2 348.2,81.7 348.8,82.2 350.0,82.2 350.6,82.6 350.6,83.6 350.0,84.1 348.8,84.1 348.5,84.5 348.2,85.5 347.6,85.9 347.0,86.4 347.3,87.4 347.0,88.3 347.6,88.8 348.2,89.2 348.2,90.2 347.9,91.1 347.9,92.1 347.9,93.0 347.8,94.0 347.9,94.9 347.6,95.4 347.0,95.8 347.0,96.8 347.0,97.7 347.0,98.7 346.7,99.6 346.4,100.1 345.3,100.1 344.7,100.6 344.1,101.0 343.5,100.6 342.9,100.1 342.3,99.6 342.3,98.7 342.3,97.7 342.3,96.8 342.3,95.8 342.3,94.9 342.3,94.0 341.7,93.5 341.1,93.0 341.1,92.1 341.1,91.1 340.5,90.7 339.3,90.9 338.7,91.1 338.7,92.1 338.7,93.0 338.7,94.0 338.7,94.9 338.7,95.8 338.7,96.8 339.3,97.3 340.5,97.3 341.1,97.7 341.1,98.7 341.1,99.6 341.1,100.6 340.5,101.0 339.3,101.0 338.7,101.5 338.1,102.0 336.9,101.7 335.7,102.0 335.4,101.5 335.1,100.6 335.1,99.6 335.1,98.7 334.5,98.2 333.9,97.7 333.3,97.3 332.1,97.3 330.9,97.3 329.7,97.5 329.1,97.7 328.5,98.0 328.2,97.7 327.3,97.3 326.9,96.8 326.7,95.8 326.4,94.9 326.4,94.0 326.4,93.0 326.1,92.5 324.9,92.5 323.7,92.5 323.1,92.1 322.5,91.6 321.4,91.4 320.8,91.1 320.2,90.7 319.9,90.2 319.6,89.2 319.6,88.3 319.0,87.8 317.8,87.8 317.2,87.4 316.6,87.1 316.0,87.4 315.4,87.6 314.2,87.5 313.6,87.4 313.6,86.4 313.3,85.5 313.0,85.3 312.4,85.5 311.8,85.9 310.6,85.9 310.0,86.4 309.4,86.9 308.2,86.9 307.6,86.4 308.2,85.9 308.8,85.5 308.8,84.5 308.8,83.6 308.2,83.1 307.9,83.6 307.0,84.3 306.4,84.5 305.8,85.0 304.6,85.0 303.4,85.0 302.8,85.5 302.2,85.9 301.6,85.5 301.6,84.5 301.6,83.6 301.6,82.6 301.0,82.2 300.7,81.7 300.4,80.8 300.4,79.8 300.4,78.9 299.8,78.4 299.2,77.9 298.6,77.5 298.1,77.9 297.5,78.4 296.3,78.4 295.7,78.9 295.1,79.3 294.8,79.8 294.5,80.8 293.9,81.2 292.7,81.2 292.1,80.8 291.5,80.5 290.3,80.5 289.1,80.3 288.5,79.8 287.9,79.3 287.3,78.9 286.7,78.4 285.5,78.4 284.3,78.4 283.7,78.9 283.7,79.8 283.7,80.8 283.1,81.2 282.5,80.8 281.9,80.3 281.3,79.8 280.7,79.3 279.5,79.3 278.9,79.8 278.3,80.3 277.1,80.5 276.5,80.8 276.5,81.7 276.5,82.6 276.5,83.6 276.5,84.5 275.9,85.0 274.7,85.0 273.6,85.0 272.4,85.0 271.2,85.0 270.6,85.5 270.0,85.9 269.4,86.4 268.8,86.9 267.6,86.9 267.0,87.4 267.0,88.3 267.0,89.2 267.3,90.2 267.6,90.7 268.2,91.1 268.2,92.1 267.9,93.0 268.2,94.0 268.2,94.9 267.6,95.4 267.0,95.8 266.4,96.3 265.8,96.8 265.8,97.7 265.8,98.7 265.8,99.6 265.8,100.6 265.8,101.5 265.8,102.5 265.8,103.4 265.8,104.3 265.8,105.3 265.8,106.2 265.8,107.2 265.8,108.1 265.8,109.1 265.8,110.0 265.8,110.9 266.4,111.4 266.7,111.9 266.4,112.4 265.8,112.8 265.2,113.3 264.6,113.8 264.0,114.2 263.4,114.7 263.4,115.7 263.4,116.6 263.4,117.5 263.4,118.5 263.4,119.4 263.1,120.4 263.1,121.3 263.4,122.3 262.8,122.7 262.5,123.2 262.2,124.2 262.2,125.1 262.2,126.0 262.8,126.5 263.4,127.0 263.4,127.9 264.0,128.4 264.3,128.9 264.0,129.3 263.4,129.8 263.4,130.8 262.8,131.2 262.2,131.7 262.2,132.6 262.2,133.6 262.2,134.5 261.6,135.0 261.0,135.5 261.0,136.4 261.0,137.4 261.0,138.3 261.0,139.2 261.0,140.2 260.4,140.7 259.8,141.1 259.8,142.1 259.8,143.0 259.2,143.5 258.6,144.0 258.6,144.9 258.0,145.4 257.4,145.8 257.4,146.8 257.4,147.7 256.8,148.2 256.2,148.7 256.2,149.6 256.2,150.6 255.6,151.0 255.3,151.5 255.3,152.5 255.0,153.4 254.4,153.9 254.1,154.3 253.8,155.3 253.8,156.2 253.8,157.2 253.2,157.6 252.9,158.1 252.9,159.1 252.6,160.0" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c1)" points="305.8,86.7 305.2,86.4 305.8,85.9 306.4,86.4 305.8,86.7" fill="none" stroke="currentColor" stroke-width="1.8"/>
<polyline clip-path="url(#knn-c1)" points="347.6,81.2 348.2,80.8 347.6,80.3 347.0,80.8 347.6,81.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
<text x="310.0" y="178" text-anchor="middle" font-size="12.5" font-weight="700">k = 15</text>
<text x="310.0" y="194" text-anchor="middle" font-size="11" class="tm">train 0.924 · test 0.889</text>
<clipPath id="knn-c2"><rect x="420" y="10" width="190" height="150"/></clipPath>
<rect x="420" y="10" width="190" height="150" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<path clip-path="url(#knn-c2)" d="M517 53h0 M502 64h0 M477 68h0 M453 69h0 M489 76h0 M452 47h0 M460 97h0 M444 89h0 M515 100h0 M470 51h0 M459 72h0 M532 63h0 M526 44h0 M520 72h0 M446 57h0 M465 53h0 M541 73h0 M527 99h0 M504 77h0 M490 51h0 M510 30h0 M472 92h0 M489 33h0 M531 45h0 M460 78h0 M488 71h0 M494 44h0 M447 91h0 M465 117h0 M534 91h0 M462 99h0 M461 67h0 M532 100h0 M551 76h0 M470 60h0 M515 61h0 M443 113h0 M558 90h0 M482 47h0 M507 38h0 M523 58h0 M504 81h0 M516 46h0 M530 76h0 M458 73h0 M464 79h0 M543 48h0 M486 67h0 M496 57h0 M474 51h0 M550 80h0 M460 55h0 M477 71h0 M456 95h0 M433 93h0 M518 80h0 M479 74h0 M500 58h0 M447 79h0 M542 93h0 M536 60h0 M498 57h0 M479 59h0 M538 65h0 M490 49h0 M558 95h0 M470 32h0 M549 91h0 M512 58h0 M528 73h0 M542 94h0 M451 27h0 M437 51h0 M433 105h0 M443 83h0 M516 79h0 M509 95h0 M530 48h0 M532 58h0 M543 76h0 M522 85h0 M468 58h0 M448 79h0 M507 54h0 M519 23h0 M547 75h0 M449 89h0 M498 68h0 M481 97h0 M453 118h0 M480 55h0 M490 78h0 M499 54h0 M452 79h0 M498 71h0 M477 94h0 M450 97h0 M540 56h0 M456 53h0 M517 78h0 M524 79h0 M500 15h0 M468 65h0 M512 81h0 M515 79h0 M534 86h0 M447 84h0 M425 80h0 M524 43h0 M529 62h0 M443 102h0 M530 50h0 M505 27h0 M460 56h0 M528 52h0 M519 45h0 M499 54h0 M466 73h0 M476 81h0 M537 67h0 M529 87h0 M450 96h0 M466 65h0 M499 55h0 M450 83h0 M494 24h0 M448 86h0 M527 71h0 M509 71h0 M498 44h0 M502 62h0 M452 103h0 M542 97h0 M458 96h0 M517 38h0 M470 56h0 M514 39h0 M433 97h0 M497 69h0 M471 63h0 M503 63h0 M466 77h0 M470 64h0 M516 56h0 M531 56h0 M450 109h0 M494 63h0 M463 59h0 M535 79h0 M527 52h0 M511 82h0 M487 52h0 M485 70h0 M441 64h0 M451 35h0 M495 26h0 M444 78h0 M481 52h0 M429 58h0 M453 106h0 M519 68h0 M467 74h0 M542 66h0 M523 55h0 M526 51h0 M457 89h0 M440 73h0 M480 57h0 M446 87h0 M539 62h0 M508 76h0 M523 84h0 M444 74h0 M456 90h0 M548 92h0 M447 87h0 M521 72h0 M495 70h0 M480 52h0 M523 57h0 M522 68h0 M437 87h0 M523 91h0 M455 74h0 M529 50h0 M499 42h0 M510 48h0 M443 64h0 M520 100h0 M464 80h0 M491 50h0 M510 86h0 M514 67h0 M544 94h0 M479 30h0 M529 53h0 M496 62h0 M503 54h0 M534 77h0 M445 67h0 M527 36h0 M438 90h0 M476 33h0 M467 108h0 M566 78h0 M499 44h0 M458 88h0 M525 82h0" class="sb" stroke-width="4" stroke-linecap="round" stroke-opacity="0.6"/>
<path clip-path="url(#knn-c2)" d="M482 94h0 M515 134h0 M483 81h0 M496 79h0 M559 69h0 M528 120h0 M584 124h0 M563 101h0 M573 144h0 M490 105h0 M571 89h0 M555 85h0 M519 114h0 M493 95h0 M523 115h0 M580 122h0 M495 82h0 M527 101h0 M574 125h0 M558 107h0 M591 78h0 M562 111h0 M566 113h0 M573 120h0 M527 108h0 M587 56h0 M563 109h0 M507 74h0 M564 97h0 M548 103h0 M520 87h0 M511 102h0 M577 117h0 M570 131h0 M474 91h0 M512 83h0 M499 97h0 M528 97h0 M519 132h0 M602 103h0 M545 84h0 M559 112h0 M505 97h0 M513 113h0 M521 118h0 M476 64h0 M517 89h0 M575 99h0 M508 128h0 M548 116h0 M495 95h0 M524 131h0 M466 68h0 M554 86h0 M565 136h0 M555 95h0 M561 96h0 M572 95h0 M564 90h0 M576 89h0 M545 118h0 M520 93h0 M544 150h0 M545 119h0 M578 65h0 M492 75h0 M501 121h0 M583 110h0 M499 127h0 M556 93h0 M500 121h0 M532 142h0 M469 101h0 M605 102h0 M491 112h0 M518 128h0 M574 104h0 M480 108h0 M577 68h0 M582 100h0 M480 131h0 M529 119h0 M520 107h0 M525 106h0 M583 64h0 M524 105h0 M516 93h0 M496 112h0 M509 100h0 M569 81h0 M542 140h0 M583 105h0 M485 104h0 M469 97h0 M540 133h0 M535 114h0 M558 110h0 M562 134h0 M524 101h0 M571 92h0 M536 125h0 M605 73h0 M593 70h0 M589 93h0 M496 54h0 M538 116h0 M578 103h0 M582 113h0 M575 70h0 M504 125h0 M583 99h0 M576 117h0 M491 102h0 M575 124h0 M596 80h0 M546 143h0 M519 108h0 M575 95h0 M495 103h0 M483 83h0 M534 117h0 M521 97h0 M514 102h0 M561 87h0 M494 109h0 M496 114h0 M495 93h0 M593 92h0 M597 84h0 M540 87h0 M580 75h0 M499 96h0 M495 96h0 M586 81h0 M530 104h0 M575 100h0 M522 102h0 M491 98h0 M534 99h0 M561 141h0 M538 147h0 M581 120h0 M499 93h0 M564 114h0 M516 120h0 M545 127h0 M583 86h0 M554 123h0 M579 100h0 M592 82h0 M503 96h0 M472 118h0 M518 99h0 M535 95h0 M497 112h0 M563 129h0 M540 118h0 M541 140h0 M517 107h0 M553 122h0 M568 85h0 M567 121h0 M570 96h0 M591 119h0 M573 86h0 M554 118h0 M500 116h0 M522 128h0 M555 119h0 M513 121h0 M569 104h0 M563 121h0 M506 119h0 M585 108h0 M528 116h0 M517 97h0 M504 89h0 M502 97h0 M578 75h0 M583 64h0 M567 108h0 M510 76h0 M579 80h0 M581 92h0 M475 84h0 M551 136h0 M513 92h0 M590 76h0 M512 128h0 M510 77h0 M570 85h0 M508 119h0 M472 96h0 M594 65h0 M532 109h0 M491 91h0 M568 93h0 M486 79h0 M582 89h0 M540 113h0 M562 71h0 M528 137h0 M516 88h0 M504 93h0 M519 90h0 M543 106h0 M596 110h0 M555 125h0 M488 107h0 M564 113h0 M500 75h0 M525 120h0" class="sr" stroke-width="4" stroke-linecap="round" stroke-opacity="0.6"/>
<polyline clip-path="url(#knn-c2)" points="592.7,10.0 592.7,10.9 592.1,11.4 591.5,11.9 590.9,12.4 590.3,12.8 589.7,13.3 589.5,13.8 588.8,14.7 588.5,15.2 588.3,15.7 587.3,16.4 587.1,16.6 586.7,17.5 586.4,18.5 586.1,18.7 585.2,19.4 584.9,19.9 584.7,20.4 583.9,21.3 583.7,21.6 583.1,22.3 582.5,23.0 582.2,23.2 581.6,24.2 581.3,24.6 580.7,25.1 580.1,25.6 579.8,26.0 579.2,27.0 578.9,27.5 578.6,27.9 577.7,28.6 577.4,28.9 576.8,29.8 576.5,30.3 576.2,30.8 575.3,31.5 575.0,31.7 574.7,32.6 574.2,33.1 573.9,33.6 573.0,34.3 572.7,34.5 572.7,35.5 571.8,36.2 571.5,36.4 570.6,37.1 570.4,37.4 570.0,38.3 569.4,38.8 568.8,39.2 568.2,39.7 567.6,40.2 567.2,41.1 567.0,41.4 566.1,42.1 565.8,42.5 565.2,43.0 564.6,43.3 564.0,44.0 563.4,44.7 563.1,44.9 562.2,45.6 561.9,45.8 561.3,46.8 561.0,47.3 560.7,47.7 560.1,48.7 560.1,49.6 559.8,50.1 559.2,50.6 558.6,51.0 558.3,51.5 557.7,52.5 557.4,52.7 556.8,53.4 556.2,54.1 556.0,54.3 555.3,55.3 555.0,55.8 554.8,56.2 553.8,57.0 553.7,57.2 552.9,58.1 552.6,58.3 551.6,59.1 551.4,59.5 550.8,60.0 550.3,60.2 549.7,60.9 549.1,61.7 548.8,61.9 548.1,62.8 547.9,63.0 546.9,63.8 546.7,64.0 545.5,64.5 545.2,64.7 544.6,65.7 544.3,66.1 544.0,66.6 543.1,67.3 542.9,67.5 541.9,68.1 541.3,68.5 540.7,69.2 540.4,69.4 539.5,70.1 538.9,70.4 538.3,70.8 537.7,71.3 537.1,71.8 536.5,72.3 535.9,72.7 535.6,73.2 535.3,74.2 534.7,74.6 534.5,75.1 534.1,76.0 533.5,76.5 533.3,77.0 532.9,77.9 532.9,78.9 532.6,79.8 532.3,80.0 531.4,80.8 531.1,81.0 530.2,81.7 529.9,81.9 528.7,82.2 527.5,82.2 526.4,82.4 526.1,82.6 525.5,83.6 525.2,83.8 524.6,83.6 524.0,83.3 522.8,83.3 521.6,83.1 521.0,83.6 521.0,84.5 520.4,85.0 519.2,85.2 518.6,85.5 518.0,85.9 517.4,86.4 516.8,86.7 515.6,86.6 514.4,87.1 514.1,87.4 513.2,88.1 512.6,88.3 512.0,88.8 510.8,88.8 509.6,88.8 508.4,88.8 507.5,89.2 507.2,89.4 506.0,89.5 504.8,90.0 503.6,90.0 503.1,90.2 502.5,90.7 502.2,91.1 501.3,91.6 500.4,92.1 500.1,92.5 499.5,93.0 498.9,93.5 497.7,93.5 497.4,94.0 497.1,94.9 496.5,95.4 495.9,95.8 495.9,96.8 495.6,97.7 495.3,98.2 494.7,98.7 494.7,99.6 494.1,100.1 493.5,100.6 493.5,101.5 492.9,102.0 492.3,102.5 491.9,103.4 491.7,103.6 490.8,104.3 490.5,104.8 489.9,105.3 489.3,105.8 488.1,105.8 487.5,106.2 486.9,106.7 486.6,107.2 486.9,107.6 487.5,108.1 486.9,108.6 486.3,109.1 486.0,110.0 485.7,110.5 485.4,110.9 484.5,111.7 484.2,111.9 484.2,112.8 483.6,113.8 483.3,114.0 482.4,114.7 482.1,115.2 481.5,115.7 480.9,116.1 480.3,116.6 479.7,117.1 479.2,117.5 478.6,118.0 478.0,118.5 477.4,119.0 476.8,119.4 476.8,120.4 476.2,120.8 475.6,121.3 475.0,121.8 474.4,122.3 474.4,123.2 473.8,123.7 473.2,124.2 473.2,125.1 472.9,126.0 472.6,126.3 471.7,127.0 471.4,127.5 470.8,127.9 470.5,128.9 470.2,129.3 469.6,129.8 469.2,130.8 469.0,131.0 467.8,131.2 467.2,131.7 466.6,132.2 466.0,132.6 465.4,133.1 464.8,133.6 464.2,134.1 463.6,134.5 463.0,135.0 461.8,135.0 461.2,135.5 460.6,135.9 460.0,136.4 459.4,136.9 458.8,137.4 458.2,137.8 457.6,138.3 457.0,138.8 456.4,139.2 455.8,139.7 455.3,140.2 454.7,140.7 454.1,141.1 453.5,141.6 453.2,142.1 452.9,143.0 452.3,143.5 451.7,144.0 451.1,144.4 450.5,144.9 449.9,145.4 449.3,145.8 448.7,146.3 448.1,146.8 447.5,147.3 446.9,147.7 446.3,148.2 446.0,148.7 445.1,149.4 444.8,149.6 444.2,150.6 443.9,150.8 443.0,151.5 442.7,152.0 442.1,152.5 441.5,152.9 440.9,153.4 440.3,153.9 439.7,154.3 439.1,154.8 437.9,154.8 437.3,155.3 436.7,155.8 435.5,156.0 435.2,156.2 434.3,156.9 434.0,157.2 433.1,157.9 432.8,158.1 431.9,158.8 431.4,159.1 430.8,159.5 430.2,160.0" fill="none" stroke="currentColor" stroke-width="1.8"/>
<text x="515.0" y="178" text-anchor="middle" font-size="12.5" font-weight="700">k = 201</text>
<text x="515.0" y="194" text-anchor="middle" font-size="11" class="tm">train 0.857 · test 0.833</text>
</svg><figcaption>Real KNN boundaries on the two-moons training data (blue = class 0, red = class 1). k = 1 draws islands around single noisy points (overfit); k = 15 draws a smooth S-curve; k = 201 asks almost half the data and flattens toward a straight cut (underfit).</figcaption></figure>
  <p>At k = 1 the boundary draws little islands around individual noisy points, which will not be there in new data. At k = 15 it is a smooth S-curve that follows the true shape of the moons. At k = 201, almost half the data votes on every point, and the boundary flattens toward a straight cut. In practice: choose k by cross-validation over a grid such as 1, 3, 5, 7, 11, 15, 21, 31; use odd k for two classes so that votes cannot tie; start near √n if you need a first guess; use larger k when labels are noisy and when you have more data.</p>

  <h2 id="knn-weight"><span class="num">05</span>Distance Weighting</h2>
  <p>With k = 5, student A, who is 1.0 away from Q, and student E, who is 3.0 away, each get exactly one vote. Common sense says A, who is three times closer, is the better guide. Plain voting cannot express that. <strong>Distance weighting</strong> gives each neighbour a vote of weight 1/d, so a neighbour twice as close has twice the say, and then compares the total weight per class instead of the count.</p>
  <p>By hand for Q with k = 5: A (Pass, d = 1.000) has weight 1.000, B (Pass, 2.000) 0.500, C (Fail, 2.236) 0.447, D (Fail, 2.828) 0.354 and E (Fail, 3.000) 0.333. Pass totals 1.500, Fail totals 1.134. The plain vote was 3 Fail to 2 Pass; the weighted vote is Pass, with P(Pass) = 1.500 / 2.634 = 0.569. The two Pass students are the two closest, and weighting lets them win. With k = 7, F (0.316) and G (0.236) add to Pass, giving 2.052 against 1.134, or 0.644.</p>
  <div class="fx" data-lang="py">for k in [5, 7]:
    for w in ["uniform", "distance"]:
        m = KNeighborsClassifier(n_neighbors=k, weights=w).fit(X, y)
        print(f"k={k} {w:8s}: {m.predict(q)[0]}  P(Fail), P(Pass) = {m.predict_proba(q)[0].round(3)}")</div>
  <div class="fx" data-lang="text">k=5 uniform : Fail  P(Fail), P(Pass) = [0.6 0.4]
k=5 distance: Pass  P(Fail), P(Pass) = [0.431 0.569]
k=7 uniform : Pass  P(Fail), P(Pass) = [0.429 0.571]
k=7 distance: Pass  P(Fail), P(Pass) = [0.356 0.644]</div>
  <p>All four probabilities match. Weighting has one special case: if the query sits exactly on a training row, the distance is 0 and 1/d is infinite, so scikit-learn gives that row all the weight and predicts its label with probability 1. A consequence is that with <code>weights="distance"</code> every training row predicts itself perfectly, so training accuracy is 100% for <em>any</em> k; only cross-validation scores mean anything.</p>
  <p>Does weighting help on real data? It matters most for large k, where far-away neighbours would otherwise dilute the vote:</p>
  <div class="fx" data-lang="py">print("  k    uniform  distance")
for k in [1, 5, 15, 51, 101]:
    u = cross_val_score(KNeighborsClassifier(k), Xtr, ytr, cv=5).mean()
    d = cross_val_score(KNeighborsClassifier(k, weights="distance"), Xtr, ytr, cv=5).mean()
    print(f"{k:3d}    {u:.3f}    {d:.3f}")</div>
  <div class="fx" data-lang="text">  k    uniform  distance
  1    0.893    0.893
  5    0.907    0.907
 15    0.912    0.926
 51    0.898    0.917
101    0.905    0.902</div>
  <p>For k = 1 and 5 the two are identical. At k = 15 and 51, distance weights add about 1.5 to 2 points of accuracy, because the far neighbours no longer outvote the near ones. Weighted KNN is also less sensitive to the exact k you choose. So it is always worth including both settings in the search. (The <code>weights</code> parameter also accepts any function of the distances, for example a Gaussian kernel exp(−d²/2h²).)</p>

  <h2 id="knn-scale"><span class="num">06</span>Feature Scaling</h2>
  <p>Every distance so far added an hours gap and a mocks gap as if one hour were worth one mock test. That happened to be reasonable, because both columns run from about 1 to 7. Now suppose the institute had recorded study time in <em>minutes</em>. The students are exactly the same people, so the prediction should not change. Does it?</p>
  <p>In minutes, Q = (240, 5), A = (300, 5) and B = (240, 7). A one-hour gap is now a gap of 60, while mock gaps are still between 0 and 6. Q to B is √(0² + 2²) = 2, while Q to A is √(60² + 0²) = 60. Q to H is √(120² + 4²) = 120.07, barely more than Q to C at 120.00, although H took only 1 mock and C took 4. The mocks column has become invisible: distance now means "difference in study time" and nothing else.</p>
  <p>The fix is to put every column on the same scale before measuring distances. The standard way is <strong>standardisation</strong>: replace each value by its <strong>z-score</strong>, z = (x − mean) / standard deviation, which says how many standard deviations the value is from its column's average. By hand for hours (5, 4, 2, 2, 1, 7, 7, 2): the mean is 30/8 = 3.75, the squared deviations add up to 39.5, the variance is 39.5/8 = 4.94 and the standard deviation √4.94 = 2.222. Q's hours become (4 − 3.75)/2.222 = 0.113 and A's (5 − 3.75)/2.222 = 0.563. For mocks the mean is 4.625 and the standard deviation 2.058, and Q and A both have 5 mocks, so both become 0.182. The scaled distance Q→A is √((0.563 − 0.113)² + 0²) = 0.450. In minutes, the mean of the hours column would be 225 and its standard deviation 133.3, and Q's z-score would still be (240 − 225)/133.3 = 0.113: standardising removes the unit.</p>
  <div class="fx" data-lang="py">Xmin = X.astype(float).copy(); Xmin[:, 0] *= 60                 # same students, study time in MINUTES
qmin = np.array([[240., 5.]])
names = students["name"].to_numpy()
order = lambda d: " ".join(f"{n}:{v:.2f}" for n, v in sorted(zip(names, d), key=lambda t: t[1]))
print("minutes, raw      :", order(np.sqrt(((Xmin - qmin) ** 2).sum(axis=1))))
from sklearn.preprocessing import StandardScaler
for label, data, query in [("hours", X, q), ("minutes", Xmin, qmin)]:
    sc = StandardScaler().fit(data)                              # z = (x - mean) / std, per column
    d = np.sqrt(((sc.transform(data) - sc.transform(query)) ** 2).sum(axis=1))
    print(f"{label + ', z-scored':18s}:", order(d))</div>
  <div class="fx" data-lang="text">minutes, raw      : B:2.00 A:60.00 C:120.00 D:120.02 H:120.07 E:180.00 F:180.00 G:180.02
hours, z-scored   : A:0.45 B:0.97 C:1.02 D:1.32 E:1.35 F:1.43 G:1.99 H:2.14
minutes, z-scored : A:0.45 B:0.97 C:1.02 D:1.32 E:1.35 F:1.43 G:1.99 H:2.14</div>
  <p>The first line shows the damage in minutes: B is now nearest and H has jumped ahead of E. The next two lines show that after standardising, the distances from hours and from minutes are identical, and the order is A, B, C, D, E, F, G, H again. Other scalers do the same job differently: <strong>min-max scaling</strong> maps every column to the range 0 to 1, and <strong>robust scaling</strong> uses the median and interquartile range so that extreme outliers do not squash everything else (see <a class="xref" data-note="ml_features">Feature Engineering</a>). The effect on a real dataset is dramatic. The wine dataset has 178 wines, 13 chemical measurements and 3 grape types, with columns on wildly different scales:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_wine
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import MinMaxScaler
Xw, yw = load_wine(return_X_y=True, as_frame=True)
print(Xw.agg(["min", "max"]).T.loc[["proline", "magnesium", "hue"]])
for name, model in [("no scaling", KNeighborsClassifier(5)),
                    ("StandardScaler", make_pipeline(StandardScaler(), KNeighborsClassifier(5))),
                    ("MinMaxScaler", make_pipeline(MinMaxScaler(), KNeighborsClassifier(5)))]:
    print(f"{name:15s} 5-fold CV accuracy {cross_val_score(model, Xw, yw, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">              min      max
proline    278.00  1680.00
magnesium   70.00   162.00
hue          0.48     1.71
no scaling      5-fold CV accuracy 0.691
StandardScaler  5-fold CV accuracy 0.949
MinMaxScaler    5-fold CV accuracy 0.950</div>
  <p>Proline runs from 278 to 1,680 while hue runs from 0.48 to 1.71. Without scaling, distance is essentially "difference in proline", just as it was "difference in minutes" for the students, and KNN scores 0.691. With either scaler it scores about 0.95. Notice that the scaler is placed <em>inside</em> a pipeline with <code>make_pipeline</code>. That way, in each cross-validation fold, the means and standard deviations are computed from the training folds only; fitting the scaler on all the data first would let information about the test rows leak into training (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  <p>Any model built on distances or penalties is <strong>scale-sensitive</strong> in this way: KNN, SVM, K-means, PCA and regularised linear models. Decision trees and their ensembles are not, because they split one column at a time. Remember one more consequence: scaling makes every column count <em>equally</em>. That is only right if every column is equally relevant, and section 08 shows what happens when some are not.</p>

  <h2 id="knn-reg"><span class="num">07</span>KNN Regression</h2>
  <p>The institute also wants to tell Q, "you are on track for a mark of about 55". Marks are numbers, not classes, so there is nothing to vote on. <strong>KNN regression</strong> replaces the vote by an average of the neighbours' values. The marks are A 68, B 61, C 38, D 45, E 30, F 82, G 71, H 25. With k = 1, Q's prediction is A's mark, 68. With k = 3, the plain average of A, B and C is (68 + 61 + 38)/3 = 55.67. With distance weights it is (68×1 + 61×0.5 + 38×0.447)/(1 + 0.5 + 0.447) = 115.49/1.947 = 59.31: the very close A pulls the answer up. With all eight students (k = 8), the prediction is the class average, 420/8 = 52.50, whoever asks.</p>
  <p>Now a student far outside the data: 12 hours a day and 10 mocks, more than anyone has ever done. With k = 3 the nearest are F (82), B (61) and A (68), so the prediction is 70.33, <em>lower</em> than F's 82 although this student works far harder than F. KNN can never predict outside the range of values it has seen, because an average of marks always lies between the smallest and largest of them.</p>
  <div class="fx" data-lang="py">from sklearn.neighbors import KNeighborsRegressor
marks = students["mark"].to_numpy()
for k in [1, 3, 5, 8]:
    for w in ["uniform", "distance"]:
        r = KNeighborsRegressor(n_neighbors=k, weights=w).fit(X, marks)
        print(f"k={k} {w:8s}: mark(Q) = {r.predict(q)[0]:.2f}   mark(12 h, 10 mocks) = {r.predict([[12, 10]])[0]:.2f}")</div>
  <div class="fx" data-lang="text">k=1 uniform : mark(Q) = 68.00   mark(12 h, 10 mocks) = 82.00
k=1 distance: mark(Q) = 68.00   mark(12 h, 10 mocks) = 82.00
k=3 uniform : mark(Q) = 55.67   mark(12 h, 10 mocks) = 70.33
k=3 distance: mark(Q) = 59.31   mark(12 h, 10 mocks) = 71.51
k=5 uniform : mark(Q) = 48.40   mark(12 h, 10 mocks) = 65.40
k=5 distance: mark(Q) = 53.68   mark(12 h, 10 mocks) = 67.12
k=8 uniform : mark(Q) = 52.50   mark(12 h, 10 mocks) = 52.50
k=8 distance: mark(Q) = 55.62   mark(12 h, 10 mocks) = 56.69</div>
  <p>Every number matches the hand work. Look at k = 8: Q and the 12-hour student both get 52.50, because when everyone is a neighbour the query no longer matters. The figure shows what KNN regression looks like on a continuous input:</p>
  <figure class="viz"><svg viewBox="0 0 600 260" width="600">
<line x1="50" y1="115" x2="590" y2="115" stroke="currentColor" stroke-opacity="0.2"/><line x1="50" y1="15" x2="50" y2="215" stroke="currentColor"/>
<path d="M515 161h0 M575 152h0 M206 27h0 M51 123h0 M341 141h0 M378 148h0 M342 111h0 M249 82h0 M530 168h0 M179 112h0 M264 89h0 M206 71h0 M198 62h0 M314 108h0 M82 96h0 M516 147h0 M117 82h0 M567 139h0 M445 153h0 M99 98h0 M86 107h0 M282 89h0 M362 122h0 M212 85h0 M353 122h0 M280 107h0 M58 121h0 M390 161h0 M525 127h0 M587 129h0 M65 96h0 M261 68h0 M312 109h0 M411 167h0 M504 168h0 M542 163h0 M508 175h0 M334 125h0 M588 106h0 M73 109h0 M401 162h0 M359 117h0 M157 50h0 M232 58h0 M256 93h0 M53 120h0 M402 154h0 M517 145h0 M181 82h0 M363 123h0 M444 167h0 M549 143h0 M92 95h0 M173 84h0 M444 158h0 M217 64h0 M513 138h0 M434 162h0 M155 91h0 M129 56h0 M387 150h0 M494 138h0 M140 80h0 M530 161h0 M429 145h0 M551 127h0 M145 87h0 M474 191h0 M531 154h0 M489 168h0 M130 61h0 M353 130h0 M298 75h0 M288 91h0 M388 126h0 M489 186h0 M578 123h0 M273 97h0 M282 103h0 M118 90h0 M526 143h0 M293 113h0 M568 148h0 M550 154h0 M573 147h0 M175 92h0 M232 57h0 M467 181h0 M326 109h0 M268 85h0 M320 152h0 M158 45h0 M107 98h0 M72 101h0 M359 111h0 M260 79h0 M577 130h0 M394 131h0 M196 39h0 M543 139h0" stroke="currentColor" stroke-opacity="0.45" stroke-width="4" stroke-linecap="round"/>
<polyline points="50.0,123.0 50.9,123.0 51.8,123.0 52.7,120.2 53.6,120.2 54.5,120.2 55.4,120.2 56.3,120.5 57.2,120.5 58.1,120.5 59.0,120.5 59.9,120.5 60.8,120.5 61.7,95.6 62.6,95.6 63.5,95.6 64.4,95.6 65.3,95.6 66.2,95.6 67.1,95.6 68.0,95.6 68.9,100.5 69.8,100.5 70.7,100.5 71.6,100.5 72.5,100.5 73.4,109.3 74.3,109.3 75.2,109.3 76.1,109.3 77.0,109.3 77.9,95.8 78.8,95.8 79.7,95.8 80.7,95.8 81.6,95.8 82.5,95.8 83.4,95.8 84.3,107.5 85.2,107.5 86.1,107.5 87.0,107.5 87.9,107.5 88.8,107.5 89.7,95.2 90.6,95.2 91.5,95.2 92.4,95.2 93.3,95.2 94.2,95.2 95.1,95.2 96.0,97.5 96.9,97.5 97.8,97.5 98.7,97.5 99.6,97.5 100.5,97.5 101.4,97.5 102.3,97.5 103.2,98.4 104.1,98.4 105.0,98.4 105.9,98.4 106.8,98.4 107.7,98.4 108.6,98.4 109.5,98.4 110.4,98.4 111.3,98.4 112.2,82.2 113.1,82.2 114.0,82.2 114.9,82.2 115.8,82.2 116.7,82.2 117.6,82.2 118.5,90.3 119.4,90.3 120.3,90.3 121.2,90.3 122.1,90.3 123.0,90.3 123.9,56.3 124.8,56.3 125.7,56.3 126.6,56.3 127.5,56.3 128.4,56.3 129.3,56.3 130.2,61.0 131.1,61.0 132.0,61.0 132.9,61.0 133.8,61.0 134.7,61.0 135.6,79.9 136.5,79.9 137.4,79.9 138.3,79.9 139.2,79.9 140.2,79.9 141.1,79.9 142.0,79.9 142.9,86.6 143.8,86.6 144.7,86.6 145.6,86.6 146.5,86.6 147.4,86.6 148.3,86.6 149.2,86.6 150.1,91.2 151.0,91.2 151.9,91.2 152.8,91.2 153.7,91.2 154.6,91.2 155.5,91.2 156.4,50.5 157.3,50.5 158.2,44.6 159.1,44.6 160.0,44.6 160.9,44.6 161.8,44.6 162.7,44.6 163.6,44.6 164.5,44.6 165.4,83.8 166.3,83.8 167.2,83.8 168.1,83.8 169.0,83.8 169.9,83.8 170.8,83.8 171.7,83.8 172.6,83.8 173.5,83.8 174.4,92.4 175.3,92.4 176.2,92.4 177.1,112.0 178.0,112.0 178.9,112.0 179.8,112.0 180.7,82.5 181.6,82.5 182.5,82.5 183.4,82.5 184.3,82.5 185.2,82.5 186.1,82.5 187.0,82.5 187.9,82.5 188.8,38.6 189.7,38.6 190.6,38.6 191.5,38.6 192.4,38.6 193.3,38.6 194.2,38.6 195.1,38.6 196.0,38.6 196.9,62.1 197.8,62.1 198.7,62.1 199.6,62.1 200.6,62.1 201.5,62.1 202.4,71.4 203.3,71.4 204.2,71.4 205.1,71.4 206.0,27.4 206.9,27.4 207.8,27.4 208.7,27.4 209.6,84.6 210.5,84.6 211.4,84.6 212.3,84.6 213.2,84.6 214.1,84.6 215.0,64.0 215.9,64.0 216.8,64.0 217.7,64.0 218.6,64.0 219.5,64.0 220.4,64.0 221.3,64.0 222.2,64.0 223.1,64.0 224.0,64.0 224.9,57.8 225.8,57.8 226.7,57.8 227.6,57.8 228.5,57.8 229.4,57.8 230.3,57.8 231.2,57.8 232.1,57.3 233.0,57.3 233.9,57.3 234.8,57.3 235.7,57.3 236.6,57.3 237.5,57.3 238.4,57.3 239.3,57.3 240.2,57.3 241.1,81.9 242.0,81.9 242.9,81.9 243.8,81.9 244.7,81.9 245.6,81.9 246.5,81.9 247.4,81.9 248.3,81.9 249.2,81.9 250.1,81.9 251.0,81.9 251.9,81.9 252.8,93.2 253.7,93.2 254.6,93.2 255.5,93.2 256.4,93.2 257.3,93.2 258.2,78.9 259.1,78.9 260.1,78.9 261.0,67.9 261.9,67.9 262.8,89.4 263.7,89.4 264.6,89.4 265.5,89.4 266.4,85.0 267.3,85.0 268.2,85.0 269.1,85.0 270.0,85.0 270.9,96.6 271.8,96.6 272.7,96.6 273.6,96.6 274.5,96.6 275.4,96.6 276.3,96.6 277.2,107.2 278.1,107.2 279.0,107.2 279.9,107.2 280.8,107.2 281.7,102.9 282.6,88.8 283.5,88.8 284.4,88.8 285.3,90.5 286.2,90.5 287.1,90.5 288.0,90.5 288.9,90.5 289.8,90.5 290.7,113.0 291.6,113.0 292.5,113.0 293.4,113.0 294.3,113.0 295.2,113.0 296.1,75.1 297.0,75.1 297.9,75.1 298.8,75.1 299.7,75.1 300.6,75.1 301.5,75.1 302.4,75.1 303.3,75.1 304.2,75.1 305.1,75.1 306.0,109.4 306.9,109.4 307.8,109.4 308.7,109.4 309.6,109.4 310.5,109.4 311.4,109.4 312.3,109.4 313.2,108.0 314.1,108.0 315.0,108.0 315.9,108.0 316.8,108.0 317.7,152.0 318.6,152.0 319.5,152.0 320.5,152.0 321.4,152.0 322.3,152.0 323.2,109.4 324.1,109.4 325.0,109.4 325.9,109.4 326.8,109.4 327.7,109.4 328.6,109.4 329.5,109.4 330.4,125.1 331.3,125.1 332.2,125.1 333.1,125.1 334.0,125.1 334.9,125.1 335.8,125.1 336.7,125.1 337.6,141.1 338.5,141.1 339.4,141.1 340.3,141.1 341.2,141.1 342.1,110.8 343.0,110.8 343.9,110.8 344.8,110.8 345.7,110.8 346.6,110.8 347.5,110.8 348.4,130.3 349.3,130.3 350.2,130.3 351.1,130.3 352.0,130.3 352.9,130.3 353.8,121.7 354.7,121.7 355.6,121.7 356.5,116.6 357.4,116.6 358.3,116.6 359.2,111.1 360.1,111.1 361.0,121.6 361.9,121.6 362.8,121.6 363.7,123.3 364.6,123.3 365.5,123.3 366.4,123.3 367.3,123.3 368.2,123.3 369.1,123.3 370.0,123.3 370.9,148.4 371.8,148.4 372.7,148.4 373.6,148.4 374.5,148.4 375.4,148.4 376.3,148.4 377.2,148.4 378.1,148.4 379.0,148.4 379.9,148.4 380.9,148.4 381.8,148.4 382.7,150.1 383.6,150.1 384.5,150.1 385.4,150.1 386.3,150.1 387.2,150.1 388.1,125.5 389.0,125.5 389.9,161.2 390.8,161.2 391.7,161.2 392.6,131.0 393.5,131.0 394.4,131.0 395.3,131.0 396.2,131.0 397.1,131.0 398.0,161.6 398.9,161.6 399.8,161.6 400.7,161.6 401.6,161.6 402.5,154.3 403.4,154.3 404.3,154.3 405.2,154.3 406.1,154.3 407.0,166.9 407.9,166.9 408.8,166.9 409.7,166.9 410.6,166.9 411.5,166.9 412.4,166.9 413.3,166.9 414.2,166.9 415.1,166.9 416.0,166.9 416.9,166.9 417.8,166.9 418.7,166.9 419.6,166.9 420.5,144.6 421.4,144.6 422.3,144.6 423.2,144.6 424.1,144.6 425.0,144.6 425.9,144.6 426.8,144.6 427.7,144.6 428.6,144.6 429.5,144.6 430.4,144.6 431.3,144.6 432.2,161.8 433.1,161.8 434.0,161.8 434.9,161.8 435.8,161.8 436.7,161.8 437.6,161.8 438.5,161.8 439.4,166.5 440.4,166.5 441.3,166.5 442.2,166.5 443.1,166.5 444.0,157.8 444.9,152.8 445.8,152.8 446.7,152.8 447.6,152.8 448.5,152.8 449.4,152.8 450.3,152.8 451.2,152.8 452.1,152.8 453.0,152.8 453.9,152.8 454.8,152.8 455.7,152.8 456.6,180.9 457.5,180.9 458.4,180.9 459.3,180.9 460.2,180.9 461.1,180.9 462.0,180.9 462.9,180.9 463.8,180.9 464.7,180.9 465.6,180.9 466.5,180.9 467.4,180.9 468.3,180.9 469.2,180.9 470.1,180.9 471.0,190.6 471.9,190.6 472.8,190.6 473.7,190.6 474.6,190.6 475.5,190.6 476.4,190.6 477.3,190.6 478.2,190.6 479.1,190.6 480.0,190.6 480.9,190.6 481.8,168.1 482.7,168.1 483.6,168.1 484.5,168.1 485.4,168.1 486.3,168.1 487.2,168.1 488.1,168.1 489.0,185.7 489.9,185.7 490.8,185.7 491.7,138.4 492.6,138.4 493.5,138.4 494.4,138.4 495.3,138.4 496.2,138.4 497.1,138.4 498.0,138.4 498.9,138.4 499.8,168.1 500.8,168.1 501.7,168.1 502.6,168.1 503.5,168.1 504.4,168.1 505.3,168.1 506.2,168.1 507.1,174.7 508.0,174.7 508.9,174.7 509.8,174.7 510.7,138.3 511.6,138.3 512.5,138.3 513.4,138.3 514.3,160.7 515.2,160.7 516.1,146.9 517.0,144.5 517.9,144.5 518.8,144.5 519.7,144.5 520.6,144.5 521.5,127.2 522.4,127.2 523.3,127.2 524.2,127.2 525.1,127.2 526.0,142.7 526.9,142.7 527.8,161.5 528.7,161.5 529.6,161.5 530.5,167.8 531.4,153.6 532.3,153.6 533.2,153.6 534.1,153.6 535.0,153.6 535.9,153.6 536.8,163.1 537.7,163.1 538.6,163.1 539.5,163.1 540.4,163.1 541.3,163.1 542.2,138.9 543.1,138.9 544.0,138.9 544.9,138.9 545.8,143.3 546.7,143.3 547.6,143.3 548.5,143.3 549.4,154.2 550.3,154.2 551.2,127.4 552.1,127.4 553.0,127.4 553.9,127.4 554.8,127.4 555.7,127.4 556.6,127.4 557.5,127.4 558.4,127.4 559.3,138.9 560.3,138.9 561.2,138.9 562.1,138.9 563.0,138.9 563.9,138.9 564.8,138.9 565.7,138.9 566.6,138.9 567.5,147.5 568.4,147.5 569.3,147.5 570.2,147.5 571.1,147.2 572.0,147.2 572.9,147.2 573.8,147.2 574.7,151.7 575.6,151.7 576.5,130.1 577.4,130.1 578.3,123.2 579.2,123.2 580.1,123.2 581.0,123.2 581.9,123.2 582.8,123.2 583.7,129.0 584.6,129.0 585.5,129.0 586.4,129.0 587.3,129.0 588.2,105.9 589.1,105.9 590.0,105.9" fill="none" class="sr" stroke-width="1.2"/>
<polyline points="50.0,106.5 50.9,106.5 51.8,106.5 52.7,106.5 53.6,106.5 54.5,106.5 55.4,106.5 56.3,106.5 57.2,106.5 58.1,106.5 59.0,106.5 59.9,106.5 60.8,106.5 61.7,106.5 62.6,106.5 63.5,106.5 64.4,106.5 65.3,106.5 66.2,106.5 67.1,106.5 68.0,106.5 68.9,106.5 69.8,106.5 70.7,106.5 71.6,106.5 72.5,106.5 73.4,106.5 74.3,106.5 75.2,106.5 76.1,106.5 77.0,106.5 77.9,106.5 78.8,106.5 79.7,104.1 80.7,104.1 81.6,104.1 82.5,104.1 83.4,104.1 84.3,104.1 85.2,104.1 86.1,100.3 87.0,100.3 87.9,100.3 88.8,97.2 89.7,97.2 90.6,97.2 91.5,97.2 92.4,97.2 93.3,97.2 94.2,97.2 95.1,97.2 96.0,97.2 96.9,97.2 97.8,93.3 98.7,93.3 99.6,93.3 100.5,93.3 101.4,89.4 102.3,89.4 103.2,89.4 104.1,89.4 105.0,89.4 105.9,89.4 106.8,86.4 107.7,86.4 108.6,86.4 109.5,86.4 110.4,86.4 111.3,86.4 112.2,86.4 113.1,86.4 114.0,85.5 114.9,85.5 115.8,85.5 116.7,85.5 117.6,85.5 118.5,85.5 119.4,85.5 120.3,83.9 121.2,83.9 122.1,83.9 123.0,83.9 123.9,83.9 124.8,83.9 125.7,79.4 126.6,79.4 127.5,79.4 128.4,74.1 129.3,74.1 130.2,74.1 131.1,74.1 132.0,74.1 132.9,74.1 133.8,74.1 134.7,74.1 135.6,74.1 136.5,74.1 137.4,74.1 138.3,74.1 139.2,74.1 140.2,72.6 141.1,72.6 142.0,72.6 142.9,72.6 143.8,72.6 144.7,72.6 145.6,72.6 146.5,73.7 147.4,73.7 148.3,73.7 149.2,75.8 150.1,75.8 151.0,75.8 151.9,75.8 152.8,75.8 153.7,75.8 154.6,78.5 155.5,78.5 156.4,78.5 157.3,78.5 158.2,78.5 159.1,78.5 160.0,78.5 160.9,78.5 161.8,78.5 162.7,78.5 163.6,76.2 164.5,76.2 165.4,76.2 166.3,76.2 167.2,76.2 168.1,76.2 169.0,76.2 169.9,74.4 170.8,74.4 171.7,74.4 172.6,74.4 173.5,74.4 174.4,74.4 175.3,72.9 176.2,72.9 177.1,72.9 178.0,72.9 178.9,72.9 179.8,72.9 180.7,66.5 181.6,66.5 182.5,66.5 183.4,66.5 184.3,66.5 185.2,69.9 186.1,69.9 187.0,69.9 187.9,71.9 188.8,71.9 189.7,71.9 190.6,71.9 191.5,71.9 192.4,71.9 193.3,71.9 194.2,71.9 195.1,71.9 196.0,71.9 196.9,71.9 197.8,71.9 198.7,71.9 199.6,71.9 200.6,71.9 201.5,71.9 202.4,69.3 203.3,69.3 204.2,65.8 205.1,65.8 206.0,65.8 206.9,65.8 207.8,65.8 208.7,65.8 209.6,65.8 210.5,65.8 211.4,65.8 212.3,65.8 213.2,65.8 214.1,65.8 215.0,62.8 215.9,62.8 216.8,62.8 217.7,62.8 218.6,63.8 219.5,63.8 220.4,63.8 221.3,63.8 222.2,63.8 223.1,63.8 224.0,63.8 224.9,63.8 225.8,63.8 226.7,63.8 227.6,63.8 228.5,67.9 229.4,67.9 230.3,68.4 231.2,68.4 232.1,68.4 233.0,68.4 233.9,68.4 234.8,70.2 235.7,70.2 236.6,70.2 237.5,76.0 238.4,76.0 239.3,76.0 240.2,76.0 241.1,76.0 242.0,76.0 242.9,77.2 243.8,77.2 244.7,77.2 245.6,77.2 246.5,77.2 247.4,77.2 248.3,81.5 249.2,81.5 250.1,81.5 251.0,81.5 251.9,81.5 252.8,81.5 253.7,81.5 254.6,81.5 255.5,81.5 256.4,81.5 257.3,86.0 258.2,89.2 259.1,89.2 260.1,89.2 261.0,89.2 261.9,89.2 262.8,89.2 263.7,89.2 264.6,89.2 265.5,89.2 266.4,89.2 267.3,89.2 268.2,89.2 269.1,90.1 270.0,90.1 270.9,90.1 271.8,90.1 272.7,90.1 273.6,90.1 274.5,92.0 275.4,92.0 276.3,92.0 277.2,92.0 278.1,92.0 279.0,92.0 279.9,91.7 280.8,91.7 281.7,91.7 282.6,91.7 283.5,91.7 284.4,91.7 285.3,91.7 286.2,91.7 287.1,95.8 288.0,95.8 288.9,97.7 289.8,97.7 290.7,97.7 291.6,97.7 292.5,97.7 293.4,97.7 294.3,104.3 295.2,104.3 296.1,104.3 297.0,104.3 297.9,104.3 298.8,104.3 299.7,105.6 300.6,105.6 301.5,105.6 302.4,105.6 303.3,105.6 304.2,105.6 305.1,105.6 306.0,105.6 306.9,107.4 307.8,107.4 308.7,107.4 309.6,107.4 310.5,107.4 311.4,107.4 312.3,111.2 313.2,113.4 314.1,113.4 315.0,113.4 315.9,113.4 316.8,113.4 317.7,113.4 318.6,113.4 319.5,113.4 320.5,117.4 321.4,117.4 322.3,117.4 323.2,117.4 324.1,118.3 325.0,118.3 325.9,118.3 326.8,118.3 327.7,118.3 328.6,122.4 329.5,122.4 330.4,122.4 331.3,122.4 332.2,122.4 333.1,122.4 334.0,122.4 334.9,122.4 335.8,122.6 336.7,122.6 337.6,122.6 338.5,124.0 339.4,124.0 340.3,124.0 341.2,124.0 342.1,121.1 343.0,121.1 343.9,121.1 344.8,121.1 345.7,121.1 346.6,121.1 347.5,121.1 348.4,121.1 349.3,121.1 350.2,121.1 351.1,121.1 352.0,125.0 352.9,125.0 353.8,125.0 354.7,125.0 355.6,125.0 356.5,125.0 357.4,125.0 358.3,125.0 359.2,125.0 360.1,127.5 361.0,127.5 361.9,127.5 362.8,127.5 363.7,127.5 364.6,127.5 365.5,125.9 366.4,131.0 367.3,131.0 368.2,131.0 369.1,131.0 370.0,131.0 370.9,131.0 371.8,131.0 372.7,131.0 373.6,131.0 374.5,131.0 375.4,131.0 376.3,131.0 377.2,135.0 378.1,135.0 379.0,135.0 379.9,135.0 380.9,138.8 381.8,138.8 382.7,138.8 383.6,138.8 384.5,138.8 385.4,144.4 386.3,144.4 387.2,144.4 388.1,144.4 389.0,144.4 389.9,144.4 390.8,144.4 391.7,144.4 392.6,144.4 393.5,144.4 394.4,144.4 395.3,144.4 396.2,146.7 397.1,146.7 398.0,146.7 398.9,150.5 399.8,150.5 400.7,150.5 401.6,150.5 402.5,150.5 403.4,150.5 404.3,150.5 405.2,150.5 406.1,150.5 407.0,150.5 407.9,150.5 408.8,150.5 409.7,150.5 410.6,150.5 411.5,152.3 412.4,152.3 413.3,152.3 414.2,152.3 415.1,152.3 416.0,153.1 416.9,155.8 417.8,155.8 418.7,155.8 419.6,155.8 420.5,155.8 421.4,155.8 422.3,155.8 423.2,155.8 424.1,155.8 425.0,155.8 425.9,155.8 426.8,155.8 427.7,155.8 428.6,157.8 429.5,157.8 430.4,157.8 431.3,157.8 432.2,157.8 433.1,157.8 434.0,157.8 434.9,163.8 435.8,163.8 436.7,163.8 437.6,163.8 438.5,163.8 439.4,163.8 440.4,163.8 441.3,163.8 442.2,163.8 443.1,163.8 444.0,163.8 444.9,163.8 445.8,164.4 446.7,167.6 447.6,167.6 448.5,167.6 449.4,167.6 450.3,167.6 451.2,167.6 452.1,167.6 453.0,164.7 453.9,164.7 454.8,164.7 455.7,164.7 456.6,164.7 457.5,164.7 458.4,164.7 459.3,164.7 460.2,164.7 461.1,164.7 462.0,164.7 462.9,164.7 463.8,164.7 464.7,164.7 465.6,164.7 466.5,164.7 467.4,167.1 468.3,167.1 469.2,167.1 470.1,167.1 471.0,167.1 471.9,168.4 472.8,168.4 473.7,168.4 474.6,168.4 475.5,168.4 476.4,168.4 477.3,168.4 478.2,168.4 479.1,165.5 480.0,165.8 480.9,165.2 481.8,165.2 482.7,165.2 483.6,165.2 484.5,165.2 485.4,165.2 486.3,165.2 487.2,165.2 488.1,165.2 489.0,165.2 489.9,165.2 490.8,165.2 491.7,165.2 492.6,161.6 493.5,161.6 494.4,161.6 495.3,161.6 496.2,161.6 497.1,161.6 498.0,161.6 498.9,161.6 499.8,155.3 500.8,155.3 501.7,155.3 502.6,155.3 503.5,155.3 504.4,155.3 505.3,155.3 506.2,155.3 507.1,155.3 508.0,152.7 508.9,152.7 509.8,150.3 510.7,150.3 511.6,150.3 512.5,153.3 513.4,153.3 514.3,153.3 515.2,153.3 516.1,153.3 517.0,153.3 517.9,151.8 518.8,151.8 519.7,151.8 520.6,151.8 521.5,151.8 522.4,151.8 523.3,151.8 524.2,151.8 525.1,150.6 526.0,150.6 526.9,150.6 527.8,150.6 528.7,150.7 529.6,150.7 530.5,150.7 531.4,150.7 532.3,149.0 533.2,149.7 534.1,148.0 535.0,148.0 535.9,148.0 536.8,148.0 537.7,148.0 538.6,148.0 539.5,148.0 540.4,148.0 541.3,148.0 542.2,148.0 543.1,148.0 544.0,148.0 544.9,148.0 545.8,148.0 546.7,149.1 547.6,149.6 548.5,149.6 549.4,149.6 550.3,149.6 551.2,148.2 552.1,148.2 553.0,146.6 553.9,146.6 554.8,144.2 555.7,144.2 556.6,144.2 557.5,144.2 558.4,144.2 559.3,144.2 560.3,140.2 561.2,140.2 562.1,140.2 563.0,140.2 563.9,140.2 564.8,140.2 565.7,139.3 566.6,139.3 567.5,139.3 568.4,139.3 569.3,135.5 570.2,135.5 571.1,135.5 572.0,135.5 572.9,135.5 573.8,135.5 574.7,135.5 575.6,135.5 576.5,135.5 577.4,135.5 578.3,135.5 579.2,135.5 580.1,135.5 581.0,135.5 581.9,135.5 582.8,135.5 583.7,135.5 584.6,135.5 585.5,135.5 586.4,135.5 587.3,135.5 588.2,135.5 589.1,135.5 590.0,135.5" fill="none" class="sb" stroke-width="2.4"/>
<polyline points="50.0,115.0 50.9,114.5 51.8,114.0 52.7,113.5 53.6,113.0 54.5,112.5 55.4,112.0 56.3,111.5 57.2,111.0 58.1,110.5 59.0,110.0 59.9,109.5 60.8,109.0 61.7,108.5 62.6,108.0 63.5,107.5 64.4,107.0 65.3,106.5 66.2,106.0 67.1,105.5 68.0,105.1 68.9,104.6 69.8,104.1 70.7,103.6 71.6,103.1 72.5,102.6 73.4,102.1 74.3,101.6 75.2,101.2 76.1,100.7 77.0,100.2 77.9,99.7 78.8,99.2 79.7,98.8 80.7,98.3 81.6,97.8 82.5,97.4 83.4,96.9 84.3,96.4 85.2,96.0 86.1,95.5 87.0,95.0 87.9,94.6 88.8,94.1 89.7,93.7 90.6,93.2 91.5,92.8 92.4,92.3 93.3,91.9 94.2,91.4 95.1,91.0 96.0,90.6 96.9,90.1 97.8,89.7 98.7,89.3 99.6,88.8 100.5,88.4 101.4,88.0 102.3,87.6 103.2,87.1 104.1,86.7 105.0,86.3 105.9,85.9 106.8,85.5 107.7,85.1 108.6,84.7 109.5,84.3 110.4,83.9 111.3,83.5 112.2,83.1 113.1,82.7 114.0,82.4 114.9,82.0 115.8,81.6 116.7,81.2 117.6,80.9 118.5,80.5 119.4,80.1 120.3,79.8 121.2,79.4 122.1,79.1 123.0,78.7 123.9,78.4 124.8,78.1 125.7,77.7 126.6,77.4 127.5,77.1 128.4,76.7 129.3,76.4 130.2,76.1 131.1,75.8 132.0,75.5 132.9,75.2 133.8,74.9 134.7,74.6 135.6,74.3 136.5,74.0 137.4,73.7 138.3,73.4 139.2,73.2 140.2,72.9 141.1,72.6 142.0,72.4 142.9,72.1 143.8,71.8 144.7,71.6 145.6,71.3 146.5,71.1 147.4,70.9 148.3,70.6 149.2,70.4 150.1,70.2 151.0,70.0 151.9,69.7 152.8,69.5 153.7,69.3 154.6,69.1 155.5,68.9 156.4,68.7 157.3,68.5 158.2,68.4 159.1,68.2 160.0,68.0 160.9,67.8 161.8,67.7 162.7,67.5 163.6,67.4 164.5,67.2 165.4,67.1 166.3,66.9 167.2,66.8 168.1,66.7 169.0,66.5 169.9,66.4 170.8,66.3 171.7,66.2 172.6,66.1 173.5,66.0 174.4,65.9 175.3,65.8 176.2,65.7 177.1,65.6 178.0,65.5 178.9,65.5 179.8,65.4 180.7,65.3 181.6,65.3 182.5,65.2 183.4,65.2 184.3,65.2 185.2,65.1 186.1,65.1 187.0,65.1 187.9,65.0 188.8,65.0 189.7,65.0 190.6,65.0 191.5,65.0 192.4,65.0 193.3,65.0 194.2,65.0 195.1,65.0 196.0,65.1 196.9,65.1 197.8,65.1 198.7,65.2 199.6,65.2 200.6,65.3 201.5,65.3 202.4,65.4 203.3,65.4 204.2,65.5 205.1,65.6 206.0,65.7 206.9,65.7 207.8,65.8 208.7,65.9 209.6,66.0 210.5,66.1 211.4,66.2 212.3,66.3 213.2,66.5 214.1,66.6 215.0,66.7 215.9,66.8 216.8,67.0 217.7,67.1 218.6,67.3 219.5,67.4 220.4,67.6 221.3,67.7 222.2,67.9 223.1,68.1 224.0,68.2 224.9,68.4 225.8,68.6 226.7,68.8 227.6,69.0 228.5,69.2 229.4,69.4 230.3,69.6 231.2,69.8 232.1,70.0 233.0,70.3 233.9,70.5 234.8,70.7 235.7,70.9 236.6,71.2 237.5,71.4 238.4,71.7 239.3,71.9 240.2,72.2 241.1,72.4 242.0,72.7 242.9,73.0 243.8,73.3 244.7,73.5 245.6,73.8 246.5,74.1 247.4,74.4 248.3,74.7 249.2,75.0 250.1,75.3 251.0,75.6 251.9,75.9 252.8,76.2 253.7,76.5 254.6,76.9 255.5,77.2 256.4,77.5 257.3,77.8 258.2,78.2 259.1,78.5 260.1,78.9 261.0,79.2 261.9,79.6 262.8,79.9 263.7,80.3 264.6,80.6 265.5,81.0 266.4,81.4 267.3,81.7 268.2,82.1 269.1,82.5 270.0,82.9 270.9,83.3 271.8,83.7 272.7,84.0 273.6,84.4 274.5,84.8 275.4,85.2 276.3,85.6 277.2,86.1 278.1,86.5 279.0,86.9 279.9,87.3 280.8,87.7 281.7,88.1 282.6,88.6 283.5,89.0 284.4,89.4 285.3,89.8 286.2,90.3 287.1,90.7 288.0,91.2 288.9,91.6 289.8,92.0 290.7,92.5 291.6,92.9 292.5,93.4 293.4,93.8 294.3,94.3 295.2,94.7 296.1,95.2 297.0,95.7 297.9,96.1 298.8,96.6 299.7,97.1 300.6,97.5 301.5,98.0 302.4,98.5 303.3,98.9 304.2,99.4 305.1,99.9 306.0,100.4 306.9,100.9 307.8,101.3 308.7,101.8 309.6,102.3 310.5,102.8 311.4,103.3 312.3,103.8 313.2,104.2 314.1,104.7 315.0,105.2 315.9,105.7 316.8,106.2 317.7,106.7 318.6,107.2 319.5,107.7 320.5,108.2 321.4,108.7 322.3,109.2 323.2,109.7 324.1,110.2 325.0,110.7 325.9,111.2 326.8,111.7 327.7,112.2 328.6,112.7 329.5,113.2 330.4,113.7 331.3,114.2 332.2,114.7 333.1,115.2 334.0,115.7 334.9,116.2 335.8,116.7 336.7,117.2 337.6,117.7 338.5,118.2 339.4,118.7 340.3,119.2 341.2,119.7 342.1,120.2 343.0,120.7 343.9,121.2 344.8,121.7 345.7,122.2 346.6,122.7 347.5,123.2 348.4,123.7 349.3,124.1 350.2,124.6 351.1,125.1 352.0,125.6 352.9,126.1 353.8,126.6 354.7,127.1 355.6,127.6 356.5,128.1 357.4,128.5 358.3,129.0 359.2,129.5 360.1,130.0 361.0,130.5 361.9,130.9 362.8,131.4 363.7,131.9 364.6,132.3 365.5,132.8 366.4,133.3 367.3,133.7 368.2,134.2 369.1,134.7 370.0,135.1 370.9,135.6 371.8,136.0 372.7,136.5 373.6,136.9 374.5,137.4 375.4,137.8 376.3,138.3 377.2,138.7 378.1,139.2 379.0,139.6 379.9,140.0 380.9,140.5 381.8,140.9 382.7,141.3 383.6,141.8 384.5,142.2 385.4,142.6 386.3,143.0 387.2,143.4 388.1,143.8 389.0,144.2 389.9,144.6 390.8,145.0 391.7,145.4 392.6,145.8 393.5,146.2 394.4,146.6 395.3,147.0 396.2,147.4 397.1,147.8 398.0,148.2 398.9,148.5 399.8,148.9 400.7,149.3 401.6,149.6 402.5,150.0 403.4,150.3 404.3,150.7 405.2,151.0 406.1,151.4 407.0,151.7 407.9,152.1 408.8,152.4 409.7,152.7 410.6,153.1 411.5,153.4 412.4,153.7 413.3,154.0 414.2,154.3 415.1,154.6 416.0,154.9 416.9,155.2 417.8,155.5 418.7,155.8 419.6,156.1 420.5,156.4 421.4,156.7 422.3,156.9 423.2,157.2 424.1,157.5 425.0,157.7 425.9,158.0 426.8,158.3 427.7,158.5 428.6,158.7 429.5,159.0 430.4,159.2 431.3,159.5 432.2,159.7 433.1,159.9 434.0,160.1 434.9,160.3 435.8,160.5 436.7,160.8 437.6,161.0 438.5,161.1 439.4,161.3 440.4,161.5 441.3,161.7 442.2,161.9 443.1,162.1 444.0,162.2 444.9,162.4 445.8,162.5 446.7,162.7 447.6,162.8 448.5,163.0 449.4,163.1 450.3,163.3 451.2,163.4 452.1,163.5 453.0,163.6 453.9,163.7 454.8,163.8 455.7,164.0 456.6,164.1 457.5,164.1 458.4,164.2 459.3,164.3 460.2,164.4 461.1,164.5 462.0,164.5 462.9,164.6 463.8,164.7 464.7,164.7 465.6,164.8 466.5,164.8 467.4,164.9 468.3,164.9 469.2,164.9 470.1,165.0 471.0,165.0 471.9,165.0 472.8,165.0 473.7,165.0 474.6,165.0 475.5,165.0 476.4,165.0 477.3,165.0 478.2,164.9 479.1,164.9 480.0,164.9 480.9,164.9 481.8,164.8 482.7,164.8 483.6,164.7 484.5,164.7 485.4,164.6 486.3,164.5 487.2,164.5 488.1,164.4 489.0,164.3 489.9,164.2 490.8,164.1 491.7,164.0 492.6,163.9 493.5,163.8 494.4,163.7 495.3,163.6 496.2,163.5 497.1,163.4 498.0,163.2 498.9,163.1 499.8,163.0 500.8,162.8 501.7,162.7 502.6,162.5 503.5,162.4 504.4,162.2 505.3,162.0 506.2,161.9 507.1,161.7 508.0,161.5 508.9,161.3 509.8,161.1 510.7,160.9 511.6,160.7 512.5,160.5 513.4,160.3 514.3,160.1 515.2,159.9 516.1,159.7 517.0,159.4 517.9,159.2 518.8,159.0 519.7,158.7 520.6,158.5 521.5,158.2 522.4,158.0 523.3,157.7 524.2,157.5 525.1,157.2 526.0,156.9 526.9,156.6 527.8,156.4 528.7,156.1 529.6,155.8 530.5,155.5 531.4,155.2 532.3,154.9 533.2,154.6 534.1,154.3 535.0,154.0 535.9,153.7 536.8,153.4 537.7,153.0 538.6,152.7 539.5,152.4 540.4,152.0 541.3,151.7 542.2,151.4 543.1,151.0 544.0,150.7 544.9,150.3 545.8,150.0 546.7,149.6 547.6,149.2 548.5,148.9 549.4,148.5 550.3,148.1 551.2,147.7 552.1,147.4 553.0,147.0 553.9,146.6 554.8,146.2 555.7,145.8 556.6,145.4 557.5,145.0 558.4,144.6 559.3,144.2 560.3,143.8 561.2,143.4 562.1,143.0 563.0,142.6 563.9,142.1 564.8,141.7 565.7,141.3 566.6,140.9 567.5,140.4 568.4,140.0 569.3,139.6 570.2,139.1 571.1,138.7 572.0,138.2 572.9,137.8 573.8,137.4 574.7,136.9 575.6,136.5 576.5,136.0 577.4,135.5 578.3,135.1 579.2,134.6 580.1,134.2 581.0,133.7 581.9,133.2 582.8,132.8 583.7,132.3 584.6,131.8 585.5,131.4 586.4,130.9 587.3,130.4 588.2,129.9 589.1,129.5 590.0,129.0" fill="none" class="sg" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="380" y1="30" x2="405" y2="30" class="sr" stroke-width="1.5"/><text x="410" y="34" font-size="12">k = 1 (jumps to every point)</text>
<line x1="380" y1="50" x2="405" y2="50" class="sb" stroke-width="2.4"/><text x="410" y="54" font-size="12">k = 10 (average of 10)</text>
<line x1="380" y1="70" x2="405" y2="70" class="sg" stroke-width="1.5" stroke-dasharray="5 4"/><text x="410" y="74" font-size="12">true curve sin(x)</text>
<text x="320" y="245" text-anchor="middle" class="tm" font-size="11">x from 0 to 6; grey dots = 100 noisy training points</text>
</svg><figcaption>KNN regression predicts a flat step between neighbours. k = 1 follows every noisy point; k = 10 averages them into a curve close to the truth. Both flatten out beyond the data.</figcaption></figure>
  <p>The prediction is a staircase: it stays flat while the set of k neighbours stays the same and jumps when it changes. With k = 1 it follows every noisy point; with k = 10 the steps average out into something close to the true curve. Beyond the edge of the data both lines go flat, because the nearest neighbours of any far-away point are always the same few edge points. That makes KNN regression a poor choice for forecasting anything that keeps growing, such as sales or prices with inflation; a linear model, or a trend feature, is needed for that (trees have the same weakness; see <a class="xref" data-note="ml_dtree">Decision Trees</a>).</p>
  <p>For regression the bias–variance trade-off from section 04 can be written exactly. If each target is a true value plus random noise with variance σ², the expected squared error of KNN at a point is σ² + bias² + σ²/k. The first term is noise no model can remove. The last term is the variance of an average of k noisy values, which falls as k grows. The bias term grows as the k neighbours spread further away and their true values differ from the true value at the query. To see it, we use 200 points from y = sin(x) plus noise with σ = 0.3, half for training:</p>
  <div class="fx" data-lang="py">from sklearn.metrics import root_mean_squared_error
rng = np.random.default_rng(0)
xs = np.sort(rng.uniform(0, 6, 200)).reshape(-1, 1)
ys = np.sin(xs).ravel() + rng.normal(0, 0.3, 200)              # true curve + noise with sd 0.3
xtr, xte, ytr_r, yte_r = train_test_split(xs, ys, test_size=0.5, random_state=0)
print("  k   train RMSE  test RMSE")
for k in [1, 3, 10, 30, 100]:
    r = KNeighborsRegressor(n_neighbors=k).fit(xtr, ytr_r)
    print(f"{k:3d}     {root_mean_squared_error(ytr_r, r.predict(xtr)):.3f}     {root_mean_squared_error(yte_r, r.predict(xte)):.3f}")</div>
  <div class="fx" data-lang="text">  k   train RMSE  test RMSE
  1     0.000     0.433
  3     0.232     0.382
 10     0.296     0.329
 30     0.368     0.365
100     0.726     0.787</div>
  <p>With k = 1 the formula predicts a test error of at least √(0.09 + 0.09) = 0.42 even with zero bias, and we measure 0.433. With k = 10 the floor is √(0.09 + 0.009) = 0.31, and we measure 0.329; the small extra is bias. With k = 100, half the training set, the neighbours span most of the sine wave, the average is nearly flat, and the test error jumps to 0.787: almost pure bias.</p>

  <h2 id="knn-curse"><span class="num">08</span>The Curse of Dimensionality</h2>
  <p>Our students have two columns, and both genuinely relate to passing. A real student record might have fifty: attendance, marks in each subject, travel time, roll-number digits, seat row. Many of those have nothing to do with the result. KNN has no way of knowing that: its distance treats every column the same. What happens to Q's neighbours when useless columns are added? Below we append 2, 10 and 50 columns of random numbers (between 0 and 3) to the eight students and to Q:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
for extra in [0, 2, 10, 50]:
    noise = rng.random((9, extra)) * 3                           # useless columns, values 0..3
    A = np.hstack([X, noise[:8]]); qa = np.hstack([q[0], noise[8]])
    d = np.sqrt(((A - qa) ** 2).sum(axis=1))
    print(f"{extra:2d} noise columns: neighbour order {''.join(names[np.argsort(d)])}"
          f"   nearest/farthest = {d.min() / d.max():.2f}")</div>
  <div class="fx" data-lang="text"> 0 noise columns: neighbour order ABCDEFGH   nearest/farthest = 0.22
 2 noise columns: neighbour order ACDEBFGH   nearest/farthest = 0.32
10 noise columns: neighbour order BACGDFEH   nearest/farthest = 0.49
50 noise columns: neighbour order BDCGAEHF   nearest/farthest = 0.81</div>
  <p>With no noise the order is A B C D E F G H, and the nearest student is 0.22 times as far as the farthest. With just 2 noise columns B, who passed and was second nearest, drops to fifth. With 50 noise columns the order is mostly decided by the noise, and the nearest student is 0.81 times as far as the farthest: everyone is roughly equally far from Q, so "nearest" carries very little information. This is the <strong>curse of dimensionality</strong>, a name for the ways that space behaves strangely when it has many dimensions, and it has two symptoms.</p>
  <p>The first is that neighbourhoods stop being local. Suppose data is spread evenly inside a unit cube (every column between 0 and 1) and we want a small neighbourhood containing 10% of the points. In one dimension that is an interval of length 0.1. In two dimensions it is a square of area 0.1, so each side is √0.1 = 0.316. In d dimensions each side is 0.1^(1/d). The second is that distances concentrate: as columns are added, each one contributes a little random difference to every distance, and these add up to almost the same total for every pair of points.</p>
  <div class="fx" data-lang="py">print("  d   cube side holding 10% of the data")
for d in [1, 2, 3, 10, 100]:
    print(f"{d:3d}   {0.10 ** (1 / d):.3f}")
rng = np.random.default_rng(0)
for d in (2, 10, 100, 1000):
    P = rng.random((1000, d)); qd = rng.random(d)                # 1000 random points, 1 query
    dd = np.linalg.norm(P - qd, axis=1)
    print(f"d={d:4d}  nearest={dd.min():.2f}  farthest={dd.max():.2f}  ratio={dd.min() / dd.max():.2f}")</div>
  <div class="fx" data-lang="text">  d   cube side holding 10% of the data
  1   0.100
  2   0.316
  3   0.464
 10   0.794
100   0.977
d=   2  nearest=0.01  farthest=1.33  ratio=0.01
d=  10  nearest=0.47  farthest=2.11  ratio=0.22
d= 100  nearest=3.35  farthest=4.65  ratio=0.72
d=1000  nearest=12.17  farthest=13.55  ratio=0.90</div>
  <p>In 10 dimensions, to collect just 10% of the data you must stretch 79% of the way along every column; in 100 dimensions, 98%. The "neighbours" differ from the query on almost every column, so the local average is not local any more. And in the second table, among 1,000 random points, the nearest is 100 times closer than the farthest in 2 dimensions (ratio 0.01) but only 10% closer in 1,000 dimensions (ratio 0.90). Here is what that costs in accuracy on the moons data, with k = 15 and scaling, as useless columns are added:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
print("noise columns   KNN (k=15) CV accuracy")
for extra in [0, 2, 8, 32, 128]:
    Xn = np.hstack([Xtr, rng.normal(0, 1, (len(Xtr), extra))])  # moons + useless columns
    acc = cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(15)), Xn, ytr, cv=5).mean()
    print(f"{extra:13d}   {acc:.3f}")</div>
  <div class="fx" data-lang="text">noise columns   KNN (k=15) CV accuracy
            0   0.907
            2   0.888
            8   0.850
           32   0.755
          128   0.652</div>
  <p>Two real columns plus 8 noise columns drop accuracy from 0.907 to 0.850; plus 128, to 0.652, close to guessing. A logistic regression or a tree would learn to give the noise columns zero weight; plain KNN cannot. So for KNN, choosing columns is part of the model. The standard remedies are feature selection (drop columns unrelated to the target; see <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a>), compressing to a few informative directions with <a class="xref" data-note="ml_pca">PCA</a> or a learned embedding, metric learning (scikit-learn's <code>NeighborhoodComponentsAnalysis</code> learns a distance that stretches useful columns and shrinks useless ones), or weighting important columns by hand after scaling. Real data is kinder than random data, too: it usually lies near a much lower-dimensional surface (photos of faces do not fill all of pixel space), and KNN's performance depends on that intrinsic dimension rather than the raw column count. The same warning applies to one-hot encoding: a categorical column with 500 categories adds 500 columns to every distance.</p>

  <h2 id="knn-speed"><span class="num">09</span>Making Search Fast</h2>
  <p>For every prediction so far we measured Q's distance to all eight students. That is the <strong>brute-force</strong> method: for one query, compute n distances, each over d columns, so the cost is O(n·d) per prediction, and the whole training set must be kept in memory. With eight students it is nothing. With ten million records and an app that must answer in 50 milliseconds, it is impossible. Unusually, KNN gets <em>slower</em> to predict as you give it more training data. Can we find the nearest rows without measuring all of them?</p>
  <p>The classic answer is a <strong>KD-tree</strong> ("k-dimensional tree"), which is binary search extended to several columns. You cut the space in two at the median of one column, then cut each half at the median of the next column, and so on, alternating. On the eight students, sorted by hours (E 1, C 2, D 2, H 2, B 4, A 5, F 7, G 7), the median is B (4, 7), so the root cuts at hours = 4, with E, C, D, H on the left and A, F, G on the right. The left half is then cut on mocks at E (1, 5), with H and C below and D above; C (2, 4) makes one more cut with H below it. The right half is cut on mocks at A (5, 5), with G below and F above.</p>
  <figure class="viz"><svg viewBox="0 0 640 290" width="640">
<rect x="40.0" y="10.0" width="300.0" height="240.0" fill="none" stroke="currentColor"/>
<line x1="173.33333333333331" y1="250.0" x2="173.33333333333331" y2="10.0" class="sr" stroke-width="2.5"/>
<line x1="40.0" y1="100.0" x2="173.33333333333331" y2="100.0" class="sb" stroke-width="2"/>
<line x1="173.33333333333331" y1="100.0" x2="340.0" y2="100.0" class="sb" stroke-width="2"/>
<line x1="106.66666666666666" y1="250.0" x2="106.66666666666666" y2="100.0" class="sg" stroke-width="1.5"/>
<circle cx="206.66666666666669" cy="100.0" r="6" class="fg sg"/><text x="214.66666666666669" y="93.0" font-size="11">A (5,5)</text>
<circle cx="173.33333333333331" cy="40.0" r="6" class="fg sg"/><text x="181.33333333333331" y="33.0" font-size="11">B (4,7)</text>
<circle cx="106.66666666666666" cy="130.0" r="6" class="fr sr"/><text x="114.66666666666666" y="123.0" font-size="11">C (2,4)</text>
<circle cx="106.66666666666666" cy="40.0" r="6" class="fr sr"/><text x="114.66666666666666" y="33.0" font-size="11">D (2,7)</text>
<circle cx="73.33333333333333" cy="100.0" r="6" class="fr sr"/><text x="81.33333333333333" y="93.0" font-size="11">E (1,5)</text>
<circle cx="273.33333333333337" cy="70.0" r="6" class="fg sg"/><text x="281.33333333333337" y="63.0" font-size="11">F (7,6)</text>
<circle cx="273.33333333333337" cy="190.0" r="6" class="fg sg"/><text x="281.33333333333337" y="183.0" font-size="11">G (7,2)</text>
<circle cx="106.66666666666666" cy="220.0" r="6" class="fr sr"/><text x="114.66666666666666" y="213.0" font-size="11">H (2,1)</text>
<path d="M306.66666666666663 153.0 L312.66666666666663 160.0 L306.66666666666663 167.0 L300.66666666666663 160.0 z" class="fv" stroke="currentColor"/><text x="306.66666666666663" y="148.0" font-size="11" text-anchor="middle">new (8,3)</text>
<circle cx="306.66666666666663" cy="160.0" r="42.4" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="177.33333333333331" y="24.0" font-size="10.5" class="tr">x = 4</text><text x="44.0" y="95.0" font-size="10.5" class="tb">y = 5</text><text x="302.66666666666663" y="95.0" font-size="10.5" class="tb" text-anchor="end">y = 5</text>
<line x1="500" y1="42" x2="430" y2="88" stroke="currentColor"/>
<line x1="500" y1="42" x2="570" y2="88" stroke="currentColor"/>
<line x1="430" y1="112" x2="390" y2="158" stroke="currentColor"/>
<line x1="430" y1="112" x2="470" y2="158" stroke="currentColor"/>
<line x1="570" y1="112" x2="530" y2="158" stroke="currentColor"/>
<line x1="570" y1="112" x2="610" y2="158" stroke="currentColor"/>
<line x1="390" y1="182" x2="390" y2="223" stroke="currentColor"/>
<rect x="476" y="18" width="48" height="24" rx="6" class="fg sg" stroke="currentColor" stroke-opacity="0.6"/><text x="500" y="34" text-anchor="middle" font-size="11.5">B x</text>
<rect x="406" y="88" width="48" height="24" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.6"/><text x="430" y="104" text-anchor="middle" font-size="11.5">E y</text>
<rect x="546" y="88" width="48" height="24" rx="6" class="fg sg" stroke="currentColor" stroke-opacity="0.6"/><text x="570" y="104" text-anchor="middle" font-size="11.5">A y</text>
<rect x="366" y="158" width="48" height="24" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.6"/><text x="390" y="174" text-anchor="middle" font-size="11.5">C x</text>
<rect x="446" y="158" width="48" height="24" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.6"/><text x="470" y="174" text-anchor="middle" font-size="11.5">D</text>
<rect x="506" y="158" width="48" height="24" rx="6" class="fg sg" stroke="currentColor" stroke-opacity="0.6"/><text x="530" y="174" text-anchor="middle" font-size="11.5">G</text>
<rect x="586" y="158" width="48" height="24" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.6"/><text x="610" y="174" text-anchor="middle" font-size="11.5">F</text>
<rect x="366" y="223" width="48" height="24" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.6"/><text x="390" y="239" text-anchor="middle" font-size="11.5">H</text>
<text x="450" y="62" font-size="10.5" class="tm">x &lt; 4</text><text x="545" y="62" font-size="10.5" class="tm">x ≥ 4</text>
<text x="500" y="272" text-anchor="middle" font-size="11" class="tg">green = visited for (8,3): 3 of 8</text>
</svg><figcaption>Left: the KD-tree on the eight students. The root B cuts at hours = 4 (red); E and A cut their halves at mocks = 5 (blue); C cuts once more at hours = 2 (green). Right: the same cuts as a tree. For a new student at (8, 3) the dashed circle of the best distance so far (1.414, to G) never reaches the walls, so F and the whole left half are skipped.</figcaption></figure>
  <p>Now search it for a new student at (8, 3). Start at the root B: distance √(16 + 16) = 5.657, the best so far. The query's hours (8) are at least 4, so go right first. At A: distance √(9 + 4) = 3.606, a new best. The query's mocks (3) are below 5, so go to A's lower side. At G: distance √(1 + 1) = 1.414, a new best, and G has no children. Now back up. Could A's other side (mocks above 5, where F lives) hold anything closer? The wall at mocks = 5 is |3 − 5| = 2 away, more than our best distance of 1.414, so no: skip F. Back at the root, the wall at hours = 4 is |8 − 4| = 4 away, so the entire left half (E, C, D, H) cannot contain anything closer either. The answer is G, found with 3 distance calculations instead of 8. The pruning rule is the whole trick: <em>only search the far side of a wall if the wall is closer than the best distance found so far</em>. The dashed circle in the figure is that best distance; it never reaches either wall.</p>
  <div class="fx" data-lang="py">def build(idx, depth=0):
    """Split at the median point, on hours (x) at even depths and mocks (y) at odd depths."""
    if not idx:
        return None
    axis = depth % 2
    idx = sorted(idx, key=lambda i: X[i][axis])
    mid = len(idx) // 2
    return {"i": idx[mid], "axis": axis,
            "left": build(idx[:mid], depth + 1), "right": build(idx[mid + 1:], depth + 1)}

def nearest(node, qp, best=None, log=None):
    if node is None:
        return best
    p = X[node["i"]]
    d = float(np.linalg.norm(p - qp)); log.append(names[node["i"]])
    if best is None or d &lt; best[1]:
        best = (names[node["i"]], d)
    diff = qp[node["axis"]] - p[node["axis"]]
    near, far = (node["left"], node["right"]) if diff &lt; 0 else (node["right"], node["left"])
    best = nearest(near, qp, best, log)          # search the side the query is on first
    if abs(diff) &lt; best[1]:                      # could the far side hold anything closer?
        best = nearest(far, qp, best, log)
    return best

tree = build(list(range(8)))
for qp in [np.array([8, 3]), np.array([4, 5])]:
    log = []
    best = nearest(tree, qp, log=log)
    print(f"query {tuple(qp.tolist())}: nearest {best[0]} (d={best[1]:.3f}); measured {len(log)} of 8: {log}")</div>
  <div class="fx" data-lang="text">query (8, 3): nearest G (d=1.414); measured 3 of 8: ['B', 'A', 'G']
query (4, 5): nearest A (d=1.000); measured 7 of 8: ['B', 'A', 'F', 'G', 'E', 'D', 'C']</div>
  <p>The code builds the tree exactly as described and logs which students it measured. For (8, 3) it measures B, A and G, as in the hand trace. Q itself is the bad case: Q has exactly 4 hours, so it sits <em>on</em> the root's wall, the best distance (1.0, to A) is larger than several walls, and 7 of the 8 students get measured. With a million points in two or three dimensions a typical query touches only a few dozen; but queries near many walls, and high-dimensional data where almost every wall is close, get little speed-up.</p>
  <p>A <strong>ball tree</strong> does the same with nested spheres instead of axis-aligned walls: if the query's distance to a sphere's centre, minus the sphere's radius, is already larger than the best distance found, every point inside the sphere is skipped (this uses the triangle inequality). Spheres fit clustered or curved data better than boxes, so ball trees hold up better as the number of columns grows. Here is the effect of dimension on speed (times are approximate and vary by machine):</p>
  <div class="fx" data-lang="py">import time
rng = np.random.default_rng(0)
print("   d    brute   kd_tree   (seconds for 2,000 queries among 20,000 points; approximate)")
for d in [3, 40]:
    P = rng.random((20000, d)); Q = rng.random((2000, d))
    row = []
    for algo in ["brute", "kd_tree"]:
        nn = KNeighborsClassifier(5, algorithm=algo, n_jobs=1).fit(P, np.zeros(20000))
        nn.kneighbors(Q[:10])                                    # warm-up call
        t0 = time.perf_counter(); nn.kneighbors(Q); row.append(time.perf_counter() - t0)
    print(f"{d:4d}    {row[0]:.3f}    {row[1]:.3f}")</div>
  <div class="fx" data-lang="text">   d    brute   kd_tree   (seconds for 2,000 queries among 20,000 points; approximate)
   3    1.713    0.027
  40    1.937    7.710</div>
  <p>With 3 columns the KD-tree answers the 2,000 queries many times faster than brute force. With 40 columns it is several times <em>slower</em>: nearly every wall is close, so it visits almost everything and pays for the tree as well. Brute force, on the other hand, is one big matrix calculation that modern CPUs do very efficiently. scikit-learn's default <code>algorithm="auto"</code> chooses between brute force, KD-tree and ball tree based on the data; a rough rule is that trees pay off only when n is much larger than 2^d.</p>
  <p>For millions of vectors with hundreds of dimensions (search engines, recommendations, retrieval for LLMs), even exact search with trees is too slow, so systems use <strong>approximate nearest neighbour</strong> (ANN) search, which accepts occasionally missing the true nearest neighbour in exchange for being 100 to 1,000 times faster. HNSW builds a layered graph and hops greedily toward the query; IVF clusters the vectors with k-means and searches only the clusters nearest the query; product quantisation compresses each vector to a few bytes; LSH uses hash functions that put nearby points in the same bucket. Their quality is measured by <strong>recall@k</strong>, the share of the true k nearest neighbours the index returns. Details are in <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>.</p>

  <h2 id="knn-imb"><span class="num">10</span>Votes, Imbalance and Other Uses</h2>
  <p>We have been reading the vote as the answer, so it is worth looking at what the vote can and cannot tell us. Ties come first. With an even k, votes can tie (2 against 2 with k = 4), and scikit-learn then picks the class that comes first in <code>classes_</code> (alphabetically "Fail"), not a random one, so ties silently favour one class. Use odd k for two classes, or distance weights, where exact ties are practically impossible. Distances can also tie at the k-th place; scikit-learn then keeps whichever row comes first in the training data, so shuffling the rows can change a prediction. On continuous data this rarely matters; with integer or duplicated values it can.</p>
  <p>The probabilities are coarse. With uniform weights and k = 5, <code>predict_proba</code> can only return 0, 0.2, 0.4, 0.6, 0.8 or 1, and with k = 1 every prediction is 0 or 1. They rank examples reasonably, so they are fine for ROC-AUC, but they should be calibrated before being used as real risk numbers (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>
  <p>Imbalanced classes are a bigger problem. If 90% of rows are class 0, a neighbourhood of size k contains on average nine class-0 rows for every class-1 row, and the larger k is, the more surely the majority wins every vote. On the students, Q got P(Pass) = 0.4 with k = 5, so the usual "more than half" rule said Fail. But 0.5 is only a convention. If Pass were the rare and important class, say when choosing students for a scholarship exam where missing a likely passer is costly, the institute could predict Pass whenever at least 40% of the neighbours passed, and Q becomes Pass. Here is the effect on data with 10% positives:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import make_classification
from sklearn.metrics import recall_score, balanced_accuracy_score
Xi, yi = make_classification(n_samples=2000, n_features=4, n_informative=3, n_redundant=0,
                             weights=[0.9, 0.1], class_sep=0.8, random_state=0)
Xa, Xb, ya, yb = train_test_split(Xi, yi, test_size=0.5, stratify=yi, random_state=0)
print("  k   recall of the rare class   balanced accuracy")
for k in [1, 5, 25, 101]:
    pr = make_pipeline(StandardScaler(), KNeighborsClassifier(k)).fit(Xa, ya).predict(Xb)
    print(f"{k:3d}   {recall_score(yb, pr):.3f}                     {balanced_accuracy_score(yb, pr):.3f}")
p25 = make_pipeline(StandardScaler(), KNeighborsClassifier(25)).fit(Xa, ya)
pr = (p25.predict_proba(Xb)[:, 1] &gt;= 0.2).astype(int)           # rare class if &gt;= 20% of neighbours vote for it
print(f"k=25, threshold 20%: recall {recall_score(yb, pr):.3f}   balanced accuracy {balanced_accuracy_score(yb, pr):.3f}")</div>
  <div class="fx" data-lang="text">  k   recall of the rare class   balanced accuracy
  1   0.490                     0.719
  5   0.394                     0.690
 25   0.067                     0.534
101   0.000                     0.500
k=25, threshold 20%: recall 0.721   balanced accuracy 0.810</div>
  <p>At k = 1 about half of the rare class is found (recall 0.490). At k = 25 only 6.7%, and at k = 101 none at all: the majority swamps every neighbourhood. The strongest fix is to stop requiring a majority. Predicting the rare class whenever at least 20% of the 25 neighbours belong to it lifts recall to 0.721 and balanced accuracy to 0.810. Other fixes are distance weights, a smaller k, and resampling (SMOTE, the popular oversampling method, is itself built on nearest neighbours). Note that <code>KNeighborsClassifier</code> has no <code>class_weight</code> parameter, unlike logistic regression or SVM.</p>
  <p>How good can such a simple method be in principle? Cover and Hart proved in 1967 that, as the training set grows without limit, the error of the 1-nearest-neighbour rule is at most <strong>twice the Bayes error</strong>, the error of the best possible classifier. The reason is simple: with infinite data the nearest neighbour sits right on top of the query, so its label is like a second random draw from the same class probabilities. If the query is Pass with probability p, 1-NN is wrong when the two draws disagree, which happens with probability 2p(1 − p); with p = 0.9 the best rule errs 10% of the time and 1-NN 18%. If k also grows, slowly enough that k/n → 0, KNN's error approaches the Bayes error itself (it is "universally consistent"). The catch is "with enough data", which in high dimensions means an impossible amount.</p>
  <p>The same neighbour search is useful well beyond classification. <code>RadiusNeighborsClassifier</code> votes among all training rows within a fixed distance instead of a fixed number, asking many neighbours in dense regions, few in sparse ones, and none at all far from the data, where it can answer "unknown". <code>KNNImputer</code> fills a missing value with the average of that column over the k most similar rows. Suppose B's mark was lost: B's two nearest students are D (2.00 away, mark 45) and A (2.24 away, mark 68), so the filled value is (45 + 68)/2 = 56.5.</p>
  <div class="fx" data-lang="py">from sklearn.neighbors import RadiusNeighborsClassifier
from sklearn.impute import KNNImputer
rn = RadiusNeighborsClassifier(radius=2.5, outlier_label="unknown").fit(X, y)
print("radius 2.5 around Q (4,5):", rn.predict(q), " around (9,9):", rn.predict([[9, 9]]))
table = np.column_stack([X, marks]).astype(float)
table[1, 2] = np.nan                                              # B's mark is missing
print("B's mark filled by KNNImputer(k=2):", KNNImputer(n_neighbors=2).fit_transform(table)[1, 2],
      "  column mean would give:", np.nanmean(table[:, 2]).round(2))</div>
  <div class="fx" data-lang="text">radius 2.5 around Q (4,5): ['Pass']  around (9,9): ['unknown']
B's mark filled by KNNImputer(k=2): 56.5   column mean would give: 51.29</div>
  <p>Within 2.5 of Q are A, B and C (2 Pass, 1 Fail), so Q is Pass; (9, 9) has nobody within 2.5, so it gets the outlier label. The imputer fills B's mark with 56.5, while the column mean, 51.29, would ignore everything we know about B. Beyond scikit-learn, the distance to the k-th nearest neighbour is a common anomaly score (far from everyone means unusual); user-based and item-based collaborative filtering are KNN on rating vectors with cosine similarity (<a class="xref" data-note="ml_cf">Collaborative Filtering</a>); DBSCAN, t-SNE and UMAP all start from a nearest-neighbour graph (<a class="xref" data-note="ml_dbscan">DBSCAN</a>, <a class="xref" data-note="ml_umap">UMAP</a>); and retrieval for LLMs finds the k document chunks nearest to a question's embedding.</p>

  <h2 id="knn-practice"><span class="num">11</span>KNN in Practice</h2>
  <p>scikit-learn's <code>KNeighborsClassifier</code> (and its twin <code>KNeighborsRegressor</code>) has only a few settings, and every one of them has appeared in this note. <code>n_neighbors</code> (default 5) is k. <code>weights</code> is "uniform" or "distance" (or your own function). <code>p</code> (default 2) is the Minkowski power, and <code>metric</code> chooses another distance such as "cosine" or "hamming", or "precomputed" if you pass a distance matrix. <code>algorithm</code> ("auto", "brute", "kd_tree", "ball_tree") and <code>leaf_size</code> change only the speed, never the answer (apart from ties). <code>n_jobs=-1</code> searches in parallel. After fitting, <code>kneighbors</code> returns the neighbours and distances, and <code>classes_</code> gives the column order of <code>predict_proba</code>.</p>
  <p>The honest way to tune is a pipeline with the scaler, searched with cross-validation on the training part only, and the test set touched once at the end. Below we search k, the weighting and p together on 70% of the wine data. Parameter names have the form <code>step__parameter</code>, where the step name is the lower-cased class name that <code>make_pipeline</code> generates:</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import GridSearchCV
Xwa, Xwb, ywa, ywb = train_test_split(Xw, yw, test_size=0.3, stratify=yw, random_state=0)
pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
grid = GridSearchCV(pipe, {"kneighborsclassifier__n_neighbors": [1, 3, 5, 7, 11, 15, 21],
                           "kneighborsclassifier__weights": ["uniform", "distance"],
                           "kneighborsclassifier__p": [1, 2]}, cv=5).fit(Xwa, ywa)
print("best params:", grid.best_params_)
print("best CV accuracy:", round(grid.best_score_, 3), "  test accuracy:", round(grid.score(Xwb, ywb), 3))</div>
  <div class="fx" data-lang="text">best params: {'kneighborsclassifier__n_neighbors': 21, 'kneighborsclassifier__p': 2, 'kneighborsclassifier__weights': 'uniform'}
best CV accuracy: 0.968   test accuracy: 0.981</div>
  <p>The search picked k = 21 with uniform votes and Euclidean distance, with a cross-validated accuracy of 0.968, and the untouched test set gives 0.981. With 124 training rows, many settings are within a row or two of each other, so do not over-read the exact winner. (If you include a k larger than a cross-validation training fold, scikit-learn raises "Expected n_neighbors &lt;= n_samples_fit".)</p>
  <p>To see that nothing else happens inside, here is the whole classifier from scratch: a matrix of distances from every query to every training row, a sort, and a weighted vote:</p>
  <div class="fx" data-lang="py">class KNNScratch:
    def __init__(self, k=5, weights="uniform"):
        self.k, self.weights = k, weights
    def fit(self, X, y):
        self.X = np.asarray(X, dtype=float)                       # "training" = remembering
        self.classes_, self.y = np.unique(y, return_inverse=True)
        return self
    def predict_proba(self, Q):
        D = np.sqrt(((np.asarray(Q, float)[:, None, :] - self.X[None]) ** 2).sum(axis=2))  # all distances
        idx = np.argsort(D, axis=1, kind="stable")[:, :self.k]   # the k nearest per query
        d = np.take_along_axis(D, idx, axis=1)
        W = np.ones_like(d) if self.weights == "uniform" else 1 / np.maximum(d, 1e-12)
        votes = np.stack([(W * (self.y[idx] == c)).sum(axis=1) for c in range(len(self.classes_))], axis=1)
        return votes / votes.sum(axis=1, keepdims=True)
    def predict(self, Q):
        return self.classes_[self.predict_proba(Q).argmax(axis=1)]

print("students, k=5:", KNNScratch(5).fit(X, y).predict(q), KNNScratch(5, "distance").fit(X, y).predict_proba(q).round(3))
sc = StandardScaler().fit(Xwa)
A, B = sc.transform(Xwa), sc.transform(Xwb)
for k, w in [(5, "uniform"), (15, "distance")]:
    mine = KNNScratch(k, w).fit(A, ywa).predict_proba(B)
    sk = KNeighborsClassifier(k, weights=w).fit(A, ywa).predict_proba(B)
    print(f"wine, k={k} {w}: largest probability difference from sklearn {np.abs(mine - sk).max():.1e}")</div>
  <div class="fx" data-lang="text">students, k=5: ['Fail'] [[0.431 0.569]]
wine, k=5 uniform: largest probability difference from sklearn 0.0e+00
wine, k=15 distance: largest probability difference from sklearn 1.1e-16</div>
  <p>It reproduces the students' results (k = 5 gives Fail; with distance weights, 0.569 Pass) and agrees with scikit-learn on every wine probability to within 10⁻¹⁶, which is rounding. One caution about this compact version: it builds a queries × rows × columns array, which for 10,000 queries, 100,000 rows and 50 columns is 50 billion numbers. Real implementations work in chunks and use ‖a − b‖² = ‖a‖² + ‖b‖² − 2a·b, which turns the work into one matrix multiplication.</p>
  <p>So when should you choose KNN? Its strengths are that it assumes nothing about the boundary, handles many classes naturally, needs no training (so adding or removing data is instant), explains itself by example ("these five similar cases were approved"), and has very few hyperparameters, which makes scaled KNN a good sanity-check baseline. Its weaknesses are slow prediction and large memory on big data, dependence on scaling and good features, the curse of dimensionality beyond about 20 informative columns, weakness on imbalanced data, coarse probabilities and no extrapolation. Use it for small-to-medium tables with a few meaningful numeric columns, for similarity search over good embeddings, and for imputation; avoid it for wide raw tables, for very large data with tight time limits (unless with an ANN index), and for anything that must extrapolate.</p>
  <table class="tbl">
    <tr><th></th><th>KNN</th><th><a class="xref" data-note="ml_classification">Logistic Regression</a></th><th><a class="xref" data-note="ml_naivebayes">Naive Bayes</a></th><th><a class="xref" data-note="ml_svm">SVM</a></th><th><a class="xref" data-note="ml_dtree">Decision Tree</a></th></tr>
    <tr><td>What is learned</td><td>nothing; stores the rows</td><td>one weight per column</td><td>counts / means per class</td><td>support vectors + weights</td><td>a tree of questions</td></tr>
    <tr><td>Boundary</td><td>any shape</td><td>straight</td><td>straight or quadratic</td><td>straight or curved (kernel)</td><td>axis-aligned boxes</td></tr>
    <tr><td>Training / prediction</td><td>none / slow, O(n·d)</td><td>fast / O(d)</td><td>fastest / O(d)</td><td>slow with kernels / O(#SV·d)</td><td>medium / O(depth)</td></tr>
    <tr><td>Needs scaling</td><td>yes</td><td>yes (with penalty)</td><td>no</td><td>yes</td><td>no</td></tr>
    <tr><td>Many columns</td><td>poor</td><td>good</td><td>good</td><td>good</td><td>good</td></tr>
  </table>
  <p>One comparison deserves its own paragraph because it is a classic interview trap: KNN is not <a class="xref" data-note="ml_kmeans">K-means</a>. KNN is supervised: it needs labels, k is the number of neighbours asked, and it predicts a label or value for a new row. K-means is unsupervised clustering: it has no labels, k is the number of clusters to create, and it iteratively moves k centres to group the rows. They share only the use of distances, which means both need scaled features and both suffer in high dimensions. And looking ahead, an <a class="xref" data-note="ml_svm">SVM</a> with an RBF kernel also predicts from similarity to training points, but it learns which points matter and keeps only the few on the border.</p>

  <h2 id="knn-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The single most common KNN bug is forgetting to scale. Section 06 showed the damage: in minutes, the mocks column vanished from the distance, and on the wine data accuracy fell from 0.949 to 0.691. Close behind is scaling the wrong way: fitting <code>StandardScaler</code> on the whole dataset before splitting, which leaks the test rows' means and spreads into training. Both are fixed by the same habit, always putting the scaler and the model together in a pipeline:</p>
  <div class="fx" data-lang="py">model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=15))   # scaler refitted on each training fold
print("wine, CV accuracy with the scaler inside the pipeline:", cross_val_score(model, Xwa, ywa, cv=5).mean().round(3))</div>
  <div class="fx" data-lang="text">wine, CV accuracy with the scaler inside the pipeline: 0.944</div>
  <p>Choosing k by training accuracy is the next mistake: k = 1, and any k with distance weights, scores 100% on the training data because every row is its own nearest neighbour. Use cross-validation. Using an even k with two classes lets votes tie, and the tie silently goes to the first class in <code>classes_</code>; use odd k or distance weights.</p>
  <p>A sneakier mistake is having the same row in both training and test sets, for example when a customer appears twice in the data. 1-NN then finds the copy at distance zero and the scores look far better than reality. Below, 100 rows of the moons data were accidentally duplicated before the split:</p>
  <div class="fx" data-lang="py">Xd = np.vstack([Xtr, Xtr[:100]]); yd = np.append(ytr, ytr[:100])   # 100 rows accidentally duplicated
Xd_tr, Xd_te, yd_tr, yd_te = train_test_split(Xd, yd, test_size=0.3, random_state=1)
m1 = KNeighborsClassifier(1).fit(Xd_tr, yd_tr)
copies = (np.abs(Xd_te[:, None] - Xd_tr[None]).sum(-1) == 0).any(1)  # test rows with an exact copy in train
print(f"1-NN accuracy on test rows that have a copy in training: {m1.score(Xd_te[copies], yd_te[copies]):.3f}")
print(f"1-NN accuracy on genuinely new test rows               : {m1.score(Xd_te[~copies], yd_te[~copies]):.3f}")</div>
  <div class="fx" data-lang="text">1-NN accuracy on test rows that have a copy in training: 1.000
1-NN accuracy on genuinely new test rows               : 0.913</div>
  <p>On test rows whose copy landed in training, 1-NN is 100% accurate; on genuinely new rows it is 91.3%. The overall test score is inflated by the copies. Remove duplicates before splitting, or split by group (for example with <code>GroupKFold</code>) so that all rows of one customer stay on the same side.</p>
  <p>Finally, three design mistakes. Throwing every available column into the distance lets irrelevant and one-hot-exploded columns drown the useful ones (moons accuracy fell from 0.907 to 0.652 with 128 noise columns); select or compress features first. Forcing a KD-tree on high-dimensional data makes search slower, not faster; let <code>algorithm="auto"</code> decide, or use an ANN index for large embedding sets. And in interviews, confusing KNN with K-means: different problems (supervised versus clustering), and k means something different in each.</p>

  <h2 id="knn-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>KNN classification</b>: majority class among the k nearest training rows; P̂(c | x) = (neighbours of class c)/k.</li>
    <li><b>KNN regression</b>: average (or 1/d-weighted average) of the k nearest targets.</li>
    <li><b>Lazy / instance-based / non-parametric</b>: fit only stores data; the data is the model; size grows with n.</li>
    <li><b>Weighted KNN</b>: vote weight 1/d; an exact match (d = 0) takes all the weight.</li>
    <li><b>Standardisation</b>: z = (x − mean)/std per column, learned on training data.</li>
    <li><b>Curse of dimensionality</b>: with many columns, neighbourhoods stop being local and distances concentrate.</li>
    <li><b>Cover–Hart</b>: with infinite data, 1-NN error ≤ 2 × Bayes error.</li>
  </ul>
  <h3>Distances</h3>
  <table class="tbl">
    <tr><th>Metric</th><th>Formula</th><th>Q (4,5) → H (2,1)</th><th>Use for</th></tr>
    <tr><td>Euclidean</td><td>√Σ(aᵢ − bᵢ)²</td><td>4.472</td><td>default, scaled numeric columns</td></tr>
    <tr><td>Manhattan</td><td>Σ|aᵢ − bᵢ|</td><td>6</td><td>many columns, outliers</td></tr>
    <tr><td>Chebyshev</td><td>max|aᵢ − bᵢ|</td><td>4</td><td>"close in every column"</td></tr>
    <tr><td>Minkowski</td><td>(Σ|aᵢ − bᵢ|ᵖ)^(1/p)</td><td>p=3: 4.160</td><td>tune p</td></tr>
    <tr><td>Cosine</td><td>1 − a·b/(‖a‖‖b‖)</td><td>0.092</td><td>text, embeddings (ignores length)</td></tr>
  </table>
  <h3>The students' numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th></tr>
    <tr><td>Distances Q → A…H</td><td>1.000, 2.000, 2.236, 2.828, 3.000, 3.162, 4.243, 4.472</td></tr>
    <tr><td>Votes</td><td>k=1 Pass · k=3 Pass (0.667) · k=5 Fail (0.4) · k=7 Pass (0.571)</td></tr>
    <tr><td>LOOCV errors</td><td>k=1: 2 · k=3: 0 · k=5: 2 · k=7: 8 of 8</td></tr>
    <tr><td>Weighted, k = 5</td><td>Pass 1.500 vs Fail 1.134 → 0.569</td></tr>
    <tr><td>z-scores</td><td>mean (3.75, 4.625), std (2.222, 2.058); Q → (0.113, 0.182)</td></tr>
    <tr><td>Marks for Q</td><td>k=1: 68 · k=3: 55.67 (weighted 59.31) · k=8: 52.50; 12 h, 10 mocks → 70.33</td></tr>
    <tr><td>KD-tree</td><td>root B (hours = 4); (8, 3) → G with 3 of 8 distances</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.model_selection import GridSearchCV

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
grid = GridSearchCV(pipe, {"kneighborsclassifier__n_neighbors": [1, 3, 5, 11, 21],
                           "kneighborsclassifier__weights": ["uniform", "distance"],
                           "kneighborsclassifier__p": [1, 2]}, cv=5)
grid.fit(X_train, y_train)
dist, idx = grid.best_estimator_[-1].kneighbors(scaled_query)   # explain a prediction
KNeighborsRegressor(n_neighbors=5, weights="distance")</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Always scale, and scale inside a pipeline.</li>
    <li>Choose k by cross-validation, never by training accuracy; odd k for two classes.</li>
    <li>Small k overfits, large k underfits; k = n always predicts the majority.</li>
    <li>Irrelevant columns ruin distances; select or compress features.</li>
    <li>KD-trees help only in low dimensions; ANN for large embedding sets.</li>
    <li>No class_weight: handle imbalance with the threshold or resampling.</li>
    <li>Regression cannot extrapolate beyond the targets it has seen.</li>
  </ul>

  <h2 id="knn-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain KNN in two sentences.</summary><div class="qa-body">To predict for a new row, find the k training rows closest to it under some distance, then take a majority vote of their classes (classification) or the average of their values (regression). Nothing is learned in advance; the stored training data is the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is KNN called lazy, instance-based and non-parametric?</summary><div class="qa-body">Lazy because fit only stores the data and all the work happens at prediction time. Instance-based because it predicts directly from stored examples rather than from a summary. Non-parametric because what it keeps grows with the data (all n rows) instead of being a fixed set of weights; it still has hyperparameters such as k.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the Euclidean, Manhattan and Chebyshev distances between (4, 5) and (2, 1).</summary><div class="qa-body">The gaps are 2 and 4. Euclidean √(4 + 16) = 4.472, Manhattan 2 + 4 = 6, Chebyshev max(2, 4) = 4. They are Minkowski distances with p = 2, 1 and ∞.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use cosine distance instead of Euclidean?</summary><div class="qa-body">When the direction of a vector matters and its length does not: word counts of documents of different lengths, rating vectors, embeddings. (4, 5) and (8, 10) have cosine distance 0 but Euclidean distance 6.4. For unit-length vectors the two rank neighbours identically, because ‖a − b‖² = 2 − 2 cos θ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens at k = 1 and at k = n? Relate this to bias and variance.</summary><div class="qa-body">k = 1 gives 100% training accuracy and a jagged boundary that follows every noisy point: low bias, high variance, overfitting. k = n ignores the query and always predicts the training majority: high bias, no variance, underfitting. In leave-one-out on our 8 balanced students, k = 7 got all 8 wrong, because removing a student makes the other class the majority.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose k?</summary><div class="qa-body">By cross-validation over a grid of values, with the scaler inside a pipeline; use odd k for two classes. √n is a reasonable first guess, noisier labels and more data allow larger k, and the CV curve is usually flat over a wide middle range. Never choose k by training accuracy (k = 1 always wins) or on the test set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be scaled for KNN? Give an example.</summary><div class="qa-body">The distance adds up raw differences, so the column with the biggest numbers dominates. Recording study time in minutes instead of hours makes a one-hour gap worth 60 while mock-test gaps stay below 6, so the mocks column effectively disappears from the distance. Standardising each column gives identical distances whatever the unit; on the wine data accuracy rose from 0.691 to 0.949.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does weights="distance" do, and when does it help?</summary><div class="qa-body">Each neighbour's vote is weighted by 1/d, so closer neighbours count more and an exact match takes all the weight. It reduces sensitivity to k and helps most at large k, where far neighbours would otherwise dilute the vote (k = 51 on moons: 0.898 → 0.917). Side effect: training accuracy is always 100%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the curse of dimensionality and how it affects KNN.</summary><div class="qa-body">In many dimensions, a neighbourhood holding a small share of the data must span most of every axis (10% of uniform data in 10-D needs 79% of each side), so neighbours are not really near. Distances also concentrate: the nearest and farthest points become almost equally far (ratio 0.90 in 1,000-D). Irrelevant columns add noise to every distance and scramble the neighbour order. Fix with feature selection, PCA, embeddings or metric learning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the time and memory complexity of KNN?</summary><div class="qa-body">Training is O(1) for brute force (just storing) or O(n log n) to build a tree. Prediction is O(n·d) per query with brute force, roughly O(log n) with a tree in low dimensions. Memory is O(n·d), the whole training set. Unlike most models, prediction gets slower as you add training data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a KD-tree speed up neighbour search, and when does it stop helping?</summary><div class="qa-body">It recursively splits the data at the median of alternating columns. A query descends to its region and then backtracks, searching the far side of a split only if that wall is closer than the best distance found so far, so whole regions are skipped. In high dimensions almost every wall is close, nothing is pruned, and it becomes slower than brute force; ball trees cope somewhat better, and approximate methods (HNSW, IVF) are used at scale.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does KNN regression work, and what can it not do?</summary><div class="qa-body">It predicts the average (or distance-weighted average) of the k nearest targets, producing a piecewise-constant, staircase-shaped function. Because an average always lies between the smallest and largest values averaged, it cannot extrapolate: a student far beyond the data got 70.33, less than the best neighbour's 82.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle class imbalance with KNN?</summary><div class="qa-body">Large k lets the majority swamp every neighbourhood (rare-class recall fell from 0.49 at k = 1 to 0 at k = 101). Lower the decision threshold on predict_proba (20% of neighbours raised recall to 0.72), use distance weights or a smaller k, or resample (undersampling, SMOTE). There is no class_weight parameter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Cover–Hart result say?</summary><div class="qa-body">With infinite data, the 1-nearest-neighbour error is at most twice the Bayes (best possible) error, because the nearest neighbour's label behaves like an independent draw from the same class probabilities, giving error 2p(1 − p). If k grows with n while k/n → 0, KNN approaches the Bayes error. The amount of data needed grows exponentially with dimension.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between KNN and K-means?</summary><div class="qa-body">KNN is supervised: k is the number of labelled neighbours asked to predict a new row, and there is no training. K-means is unsupervised clustering: k is the number of clusters, found by iteratively moving centroids. Both rely on distances, so both need scaled features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your KNN model scores much better on the test set than in production. What might be wrong?</summary><div class="qa-body">Common causes: duplicate or near-duplicate rows shared between train and test (1-NN finds the copy at distance 0), the scaler fitted on all data before splitting, or k chosen on the test set. Production data may also contain new columns' noise, different units or a different class balance. Deduplicate, split by group, and keep scaling and tuning inside cross-validation on the training data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where is nearest-neighbour search used besides classification?</summary><div class="qa-body">Missing-value imputation (KNNImputer), recommendation (user- and item-based collaborative filtering with cosine similarity), anomaly detection (distance to the k-th neighbour), clustering and visualisation methods built on neighbour graphs (DBSCAN, t-SNE, UMAP), and vector search for retrieval-augmented generation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is an RBF-kernel SVM related to KNN?</summary><div class="qa-body">Both predict from similarity to training points. KNN uses the k nearest with equal or 1/d weights and keeps every training row. An RBF SVM computes Σ αᵢyᵢ exp(−γ‖x − xᵢ‖²) + b, learning the weights αᵢ, most of which become exactly zero, so only the support vectors near the border are kept, and the boundary has the maximum margin.</div></details>
</main>
`
});
