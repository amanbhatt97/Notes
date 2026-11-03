// notes/ml/ml_clustering.js — Clustering: The Idea & Distances
Object.assign(TOPIC_CONTENT, {
  "ml_clustering": `<main>
  <h1>Clustering: The Idea &amp; Distances</h1>
  <div class="where"><span>Machine Learning</span><span>Clustering</span><span>The Idea &amp; Distances</span></div>
  <p class="lead">Clustering means finding groups in a table that has no answer column: nobody has told us which rows belong together, so the algorithm has to discover it from the rows themselves. Shops use it to find customer segments, news sites to group stories by topic, banks to spot transactions that fit no normal pattern. Every clustering algorithm rests on one question, "how alike are these two rows?", so this note answers that question carefully before any algorithm appears: what a distance is, the main ways of measuring it for amounts, mixes, baskets and mixed tables, and why scaling and the number of columns change the answer. The running example is six customers of a neighbourhood shop, A to F; every distance on the page is computed on these same six rows, and at the end we watch four families of algorithms disagree about where customer B belongs.</p>

  <h2 id="cl-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Clustering: Idea &amp; Distances</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Unsupervised: no answer column, groups are discovered</li>
          <li>Good groups are compact inside and separated across</li>
          <li>Output: hard (one group), soft (probabilities) or a tree</li>
          <li>Always returns groups, even for pure noise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Distances</div>
        <ul>
          <li>Metric rules: ≥ 0, zero only for the same row, symmetric, triangle</li>
          <li>Euclidean (straight line), Manhattan (grid), Chebyshev (worst gap)</li>
          <li>Cosine: the mix, not the size</li>
          <li>Jaccard: overlap of sets; Gower: mixed columns</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Before you measure</div>
        <ul>
          <li>Unscaled: the widest column decides everything</li>
          <li>Scaling = choosing how much each column counts</li>
          <li>Many columns: every point looks equally far</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Four families</div>
        <ul>
          <li>Centroid (K-Means), hierarchical (tree), density (DBSCAN), distribution (GMM)</li>
          <li>Each assumes a different shape of group</li>
          <li>The algorithm choice = what you believe a group looks like</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cl-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What Clustering Is</span><span class="rm-sub">finding groups when nobody gave the answers</span></div></div>
      <div class="rm-item rm-done" data-target="cl-dist"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Distance and the Distance Matrix</span><span class="rm-sub">turning "alike" into a number</span></div></div>
      <div class="rm-item rm-done" data-target="cl-lp"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Euclidean, Manhattan &amp; Minkowski</span><span class="rm-sub">three ways to add up column gaps</span></div></div>
      <div class="rm-item rm-done" data-target="cl-cos"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Cosine Similarity</span><span class="rm-sub">comparing the mix, ignoring the size</span></div></div>
      <div class="rm-item rm-done" data-target="cl-jac"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Jaccard &amp; Binary Data</span><span class="rm-sub">how much two baskets overlap</span></div></div>
      <div class="rm-item rm-done" data-target="cl-gower"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Gower Distance</span><span class="rm-sub">one distance for numbers and categories</span></div></div>
      <div class="rm-item rm-done" data-target="cl-scale"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Scaling</span><span class="rm-sub">why units change who is nearest</span></div></div>
      <div class="rm-item rm-done" data-target="cl-curse"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Curse of Dimensionality</span><span class="rm-sub">distance with hundreds of columns</span></div></div>
      <div class="rm-item rm-done" data-target="cl-shapes"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Cluster Shapes</span><span class="rm-sub">why algorithms disagree</span></div></div>
      <div class="rm-item rm-done" data-target="cl-tax"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">The Four Families</span><span class="rm-sub">centroid, tree, density, distribution</span></div></div>
      <div class="rm-item rm-done" data-target="cl-flow"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">A Clustering Project, End to End</span><span class="rm-sub">from raw table to named segments</span></div></div>
      <div class="rm-item rm-done" data-target="cl-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">fake groups, refitted scalers, wrong rulers</span></div></div>
      <div class="rm-item rm-done" data-target="cl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, when to use what</span></div></div>
      <div class="rm-item rm-done" data-target="cl-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on clustering</span></div></div>
    </div>
  </div>

  <h2 id="cl-what"><span class="num">01</span>What Clustering Is</h2>
  <p>Every model in the earlier groups learned from an answer column. <a class="xref" data-note="ml_classification">Logistic regression</a> learned from a column saying "churned or not"; <a class="xref" data-note="ml_regression">linear regression</a> learned from a column of prices. The model's whole job was to copy that column for new rows. Very often, though, a real table has no such column. A shop owner has a card for every regular customer, with age, income and what they buy, but nobody has ever written "type of customer" on the cards. She would still like to know whether her customers fall into a few natural kinds, so she can treat each kind differently.</p>
  <p><strong>Clustering</strong> is the task of splitting the rows of a table into groups, called <strong>clusters</strong>, so that rows in the same group are alike and rows in different groups are not, without being told what the groups are. Because there is no answer column to learn from, it is called <strong>unsupervised learning</strong>, and it sits next to dimensionality reduction in the map from <a class="xref" data-note="ml_intro">What is Machine Learning</a>. Think of a new class teacher who is given forty students and no information about them. After a week of watching who sits with whom at lunch she can name the friend groups. Nobody handed her a list; she found the groups from behaviour. Clustering does the same with rows of numbers, and then a person looks at each group and gives it a name.</p>
  <p>Our running example is the card box of Mrs. Kulkarni, who runs a general store. Six regular customers, A to F, have their age, monthly income in rupees, city, whether they hold the shop's credit card, and their monthly spend (in ₹1000) on grocery, fashion and electronics. Each also has a basket: the set of items on their last bill.</p>
<div class="fx" data-lang="py">import numpy as np, pandas as pd
cust = pd.DataFrame({
    "age":      [25,      52,      55,       45,       28,      50],
    "income":   [40000,   45000,   120000,   80000,    42000,   110000],   # Rs per month
    "city":     ["Pune",  "Pune",  "Delhi",  "Mumbai", "Pune",  "Delhi"],
    "has_card": [1,       0,       1,        1,        1,       0],
    "grocery":  [3,       9,       0,        2,        4,       1],        # monthly spend, Rs 1000
    "fashion":  [2,       6,       1,        2,        2,       2],
    "electro":  [1,       3,       3,        6,        1,       8]},
    index=list("ABCDEF"))
baskets = {"A": {"milk", "bread", "eggs", "butter"}, "B": {"milk", "bread", "jam"},
           "C": {"chips", "cola", "milk"},           "D": {"rice", "dal", "soap", "milk"},
           "E": {"milk", "bread", "eggs"},           "F": {"chips", "cola", "soap"}}
print(cust)</div>
  <div class="fx" data-lang="text">   age  income    city  has_card  grocery  fashion  electro
A   25   40000    Pune         1        3        2        1
B   52   45000    Pune         0        9        6        3
C   55  120000   Delhi         1        0        1        3
D   45   80000  Mumbai         1        2        2        6
E   28   42000    Pune         1        4        2        1
F   50  110000   Delhi         0        1        2        8</div>
  <p>By eye, A and E look like young, low-income Pune customers, and C and F like older, richer Delhi customers. B and D are less obvious. Clustering's job is to make that "by eye" judgement precise and repeatable, so it works the same way for ten lakh customers as for six.</p>
  <p>What makes a grouping "good"? Two wishes pull against each other. We want groups to be <strong>compact</strong>, meaning rows inside a group are close to each other, and <strong>separated</strong>, meaning rows in different groups are far apart. Put each customer in a group of their own and every group is perfectly compact but the result is useless; put all six in one group and nothing is separated. Every algorithm and every score in this group of notes is some trade-off between these two. A third wish matters most and no formula can see it: the groups must be <strong>useful</strong>, meaning Mrs. Kulkarni would actually treat them differently.</p>
  <p>Algorithms also differ in what they hand back. A <strong>hard</strong> clustering gives every row exactly one group (B is in group 2). A <strong>soft</strong> clustering gives every row a share in each group, adding up to 1 (B is 60% group 1, 40% group 2). A <strong>hierarchical</strong> clustering gives a tree of groups inside groups (B joins D, then that pair joins C and F, then everyone). <a class="xref" data-note="ml_kmeans">K-Means</a> is hard, <a class="xref" data-note="ml_gmm">Gaussian mixtures</a> are soft, and <a class="xref" data-note="ml_hierarchical">hierarchical clustering</a> builds the tree.</p>
  <p>One warning belongs right at the start. A clustering algorithm always returns groups, even when the data has none. Ask K-Means for five groups of completely random dots and it hands back five neat groups without complaint (the Common Mistakes section shows this). Whether groups really exist is something you must check afterwards, in <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>; the output itself proves nothing. But before any algorithm can run at all, we need something more basic: a number that says how alike two customers are.</p>

  <h2 id="cl-dist"><span class="num">02</span>Distance and the Distance Matrix</h2>
  <p>"Put similar customers together" sounds simple until you try to do it. Is A more like B or more like D? A computer cannot compare two cards by feel; it needs a number. A <strong>distance</strong> (also called a dissimilarity) is a number for a pair of rows that is 0 when the rows are identical and grows as they become more different. Its mirror image is a <strong>similarity</strong>, which is large for alike rows. When a similarity lies between 0 and 1, the usual conversion is distance = 1 − similarity, and sklearn's clustering algorithms almost always want the distance.</p>
  <p>Think of the distance as the ruler a clustering algorithm holds. The algorithm itself only ever asks "which rows are close?"; the ruler decides what "close" means. Change the ruler and the same algorithm finds different groups, which is why most of this note is about rulers.</p>
  <p>Not every formula makes a trustworthy ruler. Mathematicians call a distance a <strong>metric</strong> when it obeys four common-sense rules: it is never negative; it is zero only when the two rows are the same; it is symmetric, so A to D equals D to A; and it obeys the <strong>triangle inequality</strong>, d(x, z) ≤ d(x, y) + d(y, z), which says a detour through a third row is never shorter than going straight. The last rule matters in practice: fast neighbour-search structures (KD-trees and ball trees, used by DBSCAN and <a class="xref" data-note="ml_knn">KNN</a>) skip whole regions of space using it, and give wrong answers when it fails.</p>
  <p>To start, take just two columns, age and income in ₹1000, so A = (25, 40), D = (45, 80) and E = (28, 42), and use the everyday straight-line distance (the next section defines it properly). A to E is √((28 − 25)² + (42 − 40)²) = √13 = 3.61. Doing this for every pair fills a table with one row and one column per customer, called the <strong>distance matrix</strong>. Here it is, followed by a test of the triangle rule on A, E and D:</p>
<div class="fx" data-lang="py">from scipy.spatial import distance
from sklearn.metrics import pairwise_distances

X = cust[["age", "income"]].to_numpy(float).copy()
X[:, 1] /= 1000                                     # income in Rs 1000 (section 07 revisits units)
L2 = pd.DataFrame(pairwise_distances(X), index=cust.index, columns=cust.index)
print(L2.round(2))

a, d, e = X[0], X[3], X[4]                          # customers A, D, E
print("plain L2  : A-&gt;D", round(distance.euclidean(a, d), 2),
      "  A-&gt;E-&gt;D", round(distance.euclidean(a, e) + distance.euclidean(e, d), 2))
print("squared L2: A-&gt;D", distance.sqeuclidean(a, d),
      "  A-&gt;E-&gt;D", distance.sqeuclidean(a, e) + distance.sqeuclidean(e, d))</div>
  <div class="fx" data-lang="text">       A      B      C      D      E      F
A   0.00  27.46  85.44  44.72   3.61  74.33
B  27.46   0.00  75.06  35.69  24.19  65.03
C  85.44  75.06   0.00  41.23  82.54  11.18
D  44.72  35.69  41.23   0.00  41.63  30.41
E   3.61  24.19  82.54  41.63   0.00  71.47
F  74.33  65.03  11.18  30.41  71.47   0.00
plain L2  : A-&gt;D 44.72   A-&gt;E-&gt;D 45.23
squared L2: A-&gt;D 2000.0   A-&gt;E-&gt;D 1746.0</div>
  <p>Find the hand value in the table: row A, column E is 3.61. The diagonal is all zeros (every customer is at distance 0 from themselves) and the table mirrors across that diagonal (symmetry). A's nearest customer is E and C's nearest is F (11.18), as our eyes said. Six customers give 6 × 5 / 2 = 15 different numbers; the rest is mirror and zeros.</p>
  <p>The last two lines are worth a closer look. Plain straight-line distance passes the triangle test: going directly from A to D (44.72) is shorter than the detour through E (45.23). <strong>Squared</strong> straight-line distance fails it: directly A to D costs 2,000, but the detour costs only 1,746. So squared distance is not a metric. K-Means uses squared distance inside its objective, which is perfectly fine for an objective, but you should never hand squared distances to a method that searches for neighbours.</p>
  <p>The distance matrix also explains a practical limit you will meet again and again. It holds n(n − 1)/2 numbers for n rows: 15 for six customers, but about 5 × 10⁹ for one lakh customers, which is 40 GB in 8-byte numbers. Methods that need the whole matrix (hierarchical clustering, k-medoids, Gower-based clustering) therefore stop at tens of thousands of rows, while K-Means, which only needs each row's distance to k centres, scales to millions.</p>

  <h2 id="cl-lp"><span class="num">03</span>Euclidean, Manhattan &amp; Minkowski</h2>
  <p>We filled the matrix with straight-line distance without asking whether it was the right choice. A and D differ by 20 years of age and ₹40,000 of income. Those two per-column gaps have to be combined into one number, and there is more than one honest way to combine them.</p>
  <p>The <strong>Euclidean distance</strong> (also called L2) is the straight line between the two points: square each gap, add them, take the square root. For A and D that is √(20² + 40²) = √2000 = 44.72. The <strong>Manhattan distance</strong> (L1, or city-block distance) simply adds the gaps without squaring: 20 + 40 = 60. The <strong>Chebyshev distance</strong> (L∞) keeps only the biggest gap: max(20, 40) = 40. The analogy is travelling across a city. A drone flies straight over the buildings (Euclidean). An auto-rickshaw has to follow streets laid out in a grid, first east and then north (Manhattan). And a chess king, who moves diagonally as easily as straight, needs as many moves as the longer of the two legs (Chebyshev). Same two places, three honest answers.</p>
  <p>All three are members of one family, the <strong>Minkowski distance</strong> (Lp), which raises each gap to a power p, adds, and takes the p-th root:</p>
  <p style="text-align:center"><strong>d_p(x, y) = (Σᵢ |xᵢ − yᵢ|ᵖ)^(1/p)</strong></p>
  <p>Setting p = 1 gives Manhattan, p = 2 gives Euclidean, and as p grows the biggest gap takes over until, at p = ∞, it is the only one left (Chebyshev). With p = 3 for A and D: (20³ + 40³)^(1/3) = 72,000^(1/3) = 41.60. So the numbers line up as 60 (p = 1) ≥ 44.72 (p = 2) ≥ 41.60 (p = 3) ≥ 40 (p = ∞). The code computes each one by hand from the gaps and checks it against scipy:</p>
<div class="fx" data-lang="py">a, d = X[0], X[3]                                   # A = (25, 40), D = (45, 80)
gaps = np.abs(a - d)
print("gaps          :", gaps)
print("Manhattan  L1 :", gaps.sum(), distance.cityblock(a, d))
print("Euclidean  L2 :", round(np.sqrt((gaps ** 2).sum()), 2), round(distance.euclidean(a, d), 2))
print("Minkowski  p=3:", round((gaps ** 3).sum() ** (1 / 3), 2), round(distance.minkowski(a, d, p=3), 2))
print("Chebyshev  Linf:", gaps.max(), distance.chebyshev(a, d))</div>
  <div class="fx" data-lang="text">gaps          : [20. 40.]
Manhattan  L1 : 60.0 60.0
Euclidean  L2 : 44.72 44.72
Minkowski  p=3: 41.6 41.6
Chebyshev  Linf: 40.0 40.0</div>
  <p>Every pair of numbers agrees. The left half of the figure below draws the three routes from A to D; the right half shows something more important.</p>
<figure class="viz"><svg viewBox="0 0 640 230" width="640">
<defs><marker id="cl-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="130" y="18" text-anchor="middle" font-size="12">A to D: three rulers</text>
<line x1="30" y1="200" x2="250" y2="200" stroke="currentColor" stroke-opacity="0.3"/><line x1="30" y1="200" x2="30" y2="30" stroke="currentColor" stroke-opacity="0.3"/>
<circle cx="70" cy="160" r="5" class="fb sb"/><text x="58" y="178" font-size="11">A (25, 40)</text>
<circle cx="190" cy="60" r="5" class="fr sr"/><text x="196" y="54" font-size="11">D (45, 80)</text>
<line x1="70" y1="160" x2="190" y2="60" class="sb" stroke-width="2"/><text x="112" y="100" class="tb" font-size="11">L2 = 44.72</text>
<polyline points="70,160 190,160 190,60" fill="none" class="sr" stroke-width="2" stroke-dasharray="5 3"/><text x="120" y="176" class="tr" font-size="11">20</text><text x="196" y="115" class="tr" font-size="11">40</text>
<text x="200" y="190" class="tr" font-size="11">L1 = 20 + 40 = 60</text>
<text x="130" y="222" text-anchor="middle" class="tm" font-size="10.5">L∞ = max(20, 40) = 40</text>
<text x="465" y="18" text-anchor="middle" font-size="12">All points at distance 1 from the centre</text>
<line x1="330" y1="120" x2="600" y2="120" stroke="currentColor" stroke-opacity="0.2"/><line x1="465" y1="30" x2="465" y2="210" stroke="currentColor" stroke-opacity="0.2"/>
<rect x="385" y="40" width="160" height="160" fill="none" class="sg" stroke-width="2"/>
<circle cx="465" cy="120" r="80" fill="none" class="sb" stroke-width="2"/>
<polygon points="465,40 545,120 465,200 385,120" fill="none" class="sr" stroke-width="2"/>
<circle cx="465" cy="120" r="3" fill="currentColor"/>
<text x="555" y="58" class="tg" font-size="11">L∞ square</text><text x="555" y="150" class="tb" font-size="11">L2 circle</text><text x="335" y="100" class="tr" font-size="11">L1 diamond</text>
</svg><figcaption>Left: customers A and D on (age, income in ₹1000). Euclidean goes straight (44.72), Manhattan goes along the axes (20 + 40 = 60), Chebyshev keeps only the bigger gap (40). Right: the set of points at distance exactly 1 from the centre has a different shape under each ruler, so "the nearest centre" can change.</figcaption></figure>
  <p>The right half draws every point at distance exactly 1 from a centre. Under Euclidean distance that set is a circle; under Manhattan it is a diamond, because moving diagonally costs the sum of both legs; under Chebyshev it is a square. Now picture an algorithm that gives each customer to the nearest of two centres. The border between "nearer to centre 1" and "nearer to centre 2" depends on these shapes, so changing the ruler moves the borders and changes the groups. The general rule is that <strong>the distance decides which shapes look like a group</strong>.</p>
  <p>Euclidean is the default for continuous, scaled columns and the only distance K-Means and Ward linkage support, but because gaps are squared, one huge gap dominates. Manhattan is gentler with a large gap in one column and behaves a little better with many columns. Chebyshev suits rules like "the worst single difference is what matters", such as manufacturing tolerances. When columns are correlated (height and weight move together), the <strong>Mahalanobis distance</strong>, √((x − y)ᵀ S⁻¹ (x − y)) with S the covariance matrix, first undoes the correlation and the different spreads and then measures straight-line distance; <a class="xref" data-note="ml_gmm">Gaussian mixtures</a> use this idea inside each cluster. One practical note: sklearn's <code>KMeans</code> has no <code>metric</code> argument at all, because "move the centre to the average" is only the right move for squared Euclidean distance. If you need another ruler, use k-medoids, hierarchical clustering or DBSCAN.</p>

  <h2 id="cl-cos"><span class="num">04</span>Cosine Similarity</h2>
  <p>All the rulers so far compare raw amounts, and sometimes that is exactly wrong. Look at the spending columns. A spends ₹3,000 on grocery, ₹2,000 on fashion and ₹1,000 on electronics. B spends ₹9,000, ₹6,000 and ₹3,000: exactly A's pattern, three times bigger. C spends 0, 1 and 3: mostly electronics. If the question is "what kind of shopper is this?", A and B are the same kind and C is different. Euclidean distance says the opposite: A to B is √(6² + 4² + 2²) = 7.48, but A to C is only √(3² + 1² + 2²) = 3.74. Size has drowned out habit.</p>
  <p>The fix is to picture each row as an arrow from the origin. B's arrow points in exactly the same direction as A's, just three times longer; C's arrow points somewhere else. <strong>Cosine similarity</strong> measures only the angle between two arrows and ignores their lengths:</p>
  <p style="text-align:center"><strong>cos(a, b) = (a · b) / (‖a‖ · ‖b‖)</strong></p>
  <p>Here a · b (the dot product) multiplies matching columns and adds the results, and ‖a‖ is the length of the arrow, √(Σ aᵢ²). Dividing by both lengths removes size. The result is 1 when the arrows point the same way, 0 when they have nothing in common, and −1 when they point in opposite directions (possible only with negative values). Think of two people on the same roof pointing at the same star, one with a short stick and one with a long bamboo pole. The tips of their pointers are far apart, but they point the same way; cosine asks "same direction?", not "same tip?".</p>
  <p>By hand for A and C: A · C = 3·0 + 2·1 + 1·3 = 5; ‖A‖ = √14 = 3.742; ‖C‖ = √10 = 3.162; cos = 5 / (3.742 × 3.162) = 0.423. For A and B: A · B = 27 + 12 + 3 = 42 and ‖B‖ = √126 = 11.225, so cos = 42 / (3.742 × 11.225) = 42 / 42 = 1.0, a perfect match.</p>
<figure class="viz"><svg viewBox="0 0 520 200" width="520">
<defs><marker id="cl-a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="40" y1="180" x2="500" y2="180" stroke="currentColor" stroke-opacity="0.3"/><line x1="40" y1="180" x2="40" y2="15" stroke="currentColor" stroke-opacity="0.3"/>
<text x="490" y="196" class="tm" font-size="10.5" text-anchor="end">grocery-heavy direction</text><text x="46" y="22" class="tm" font-size="10.5">electronics-heavy direction</text>
<line x1="40" y1="180" x2="140" y2="150" class="sb" stroke-width="2.5" marker-end="url(#cl-a2)"/><text x="120" y="140" class="tb" font-size="11">A</text>
<line x1="40" y1="180" x2="340" y2="90" class="sb" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#cl-a2)"/><text x="345" y="88" class="tb" font-size="11">B = 3 × A (angle 0°, cos 1.0)</text>
<line x1="40" y1="180" x2="58" y2="60" class="sr" stroke-width="2.5" marker-end="url(#cl-a2)"/><text x="65" y="58" class="tr" font-size="11">C (angle 65°, cos 0.423)</text>
<path d="M90,165 A55,55 0 0 0 58,128" fill="none" stroke="currentColor"/>
<text x="250" y="160" class="tm" font-size="11">Euclidean: A→C = 3.74 &lt; A→B = 7.48 (wrong for spending habits)</text>
</svg><figcaption>Cosine looks only at the angle between arrows. B is A stretched (three times the spend, same mix), so the angle is 0 and cosine is 1, even though the arrow tips are far apart.</figcaption></figure>
  <p>There is a neat link back to Euclidean distance. If you first shrink every row to length 1 (divide it by its own length), then for those unit arrows the squared Euclidean distance is exactly 2 − 2 × cosine. So ranking by cosine and ranking by Euclidean distance on length-normalised rows give the same order. This is how people run "K-Means with cosine distance", which sklearn does not offer directly: normalise the rows with <code>sklearn.preprocessing.normalize</code>, then run ordinary K-Means. The code checks all of this:</p>
<div class="fx" data-lang="py">from sklearn.metrics.pairwise import cosine_similarity
S = cust[["grocery", "fashion", "electro"]].to_numpy(float)     # spend mix, Rs 1000
print("Euclidean A-B", round(distance.euclidean(S[0], S[1]), 2), "  A-C", round(distance.euclidean(S[0], S[2]), 2))
cos = pd.DataFrame(cosine_similarity(S), index=cust.index, columns=cust.index)
print(cos.round(3))
U = S / np.linalg.norm(S, axis=1, keepdims=True)                # rows scaled to length 1
print("||uA - uC||^2 =", round(((U[0] - U[2]) ** 2).sum(), 3), "  2 - 2cos(A,C) =", round(2 - 2 * cos.loc["A", "C"], 3))</div>
  <div class="fx" data-lang="text">Euclidean A-B 7.48   A-C 3.74
       A      B      C      D      E      F
A  1.000  1.000  0.423  0.645  0.991  0.483
B  1.000  1.000  0.423  0.645  0.991  0.483
C  0.423  0.423  1.000  0.953  0.345  0.990
D  0.645  0.645  0.953  1.000  0.592  0.980
E  0.991  0.991  0.345  0.592  1.000  0.420
F  0.483  0.483  0.990  0.980  0.420  1.000
||uA - uC||^2 = 1.155   2 - 2cos(A,C) = 1.155</div>
  <p>The first line shows the problem (Euclidean puts C closer to A than B is). In the cosine table, A and B score 1.000 and A and C 0.423, matching the hand work. The table also tells a clear story: A, B and E (0.991 with each other) are grocery-mix shoppers, while C, D and F (0.95 to 0.99) are electronics-mix shoppers. The last line confirms 2 − 2 × 0.423 = 1.155.</p>
  <p>Cosine is the standard ruler for text (TF-IDF vectors, see <a class="xref" data-note="nlp">NLP Foundations</a>), for embeddings (<a class="xref" data-note="vectordb">Embeddings &amp; Vector Search</a>) and for user–item vectors in recommenders, all cases where the direction carries the meaning and the length mostly reflects how long a document is or how active a user is. Its blindness to size is a choice, not a virtue: if Mrs. Kulkarni wants a "big spenders" segment, A (₹6,000) and B (₹18,000) are different customers despite their cosine of 1.0. Cosine distance (1 − cosine) also breaks the triangle rule, and a row of all zeros has no direction at all, so its cosine is undefined.</p>

  <h2 id="cl-jac"><span class="num">05</span>Jaccard &amp; Binary Data</h2>
  <p>Amounts and mixes are lists of numbers. A basket is not: it is a set of items bought. A bought {milk, bread, eggs, butter} and E bought {milk, bread, eggs}. How alike are those two sets? Neither Euclidean nor cosine has anything to say until we turn sets into numbers, and the obvious way of doing that hides a trap.</p>
  <p>The <strong>Jaccard similarity</strong> counts the items two sets share and divides by the number of different items in either set:</p>
  <p style="text-align:center"><strong>J(S, T) = |S ∩ T| / |S ∪ T|</strong> &nbsp;(shared items ÷ all distinct items)</p>
  <p>A and E share milk, bread and eggs (3), and between them they bought 4 distinct items, so J = 3/4 = 0.75. A and B share milk and bread (2) out of 5 distinct items (milk, bread, eggs, butter, jam), so J = 0.4. The <strong>Jaccard distance</strong> is 1 − J, and unlike cosine distance it is a true metric.</p>
  <p>Why not simply write each basket as a row of 0s and 1s over the shop's ten items and count the positions where two rows agree? That count is called the <strong>simple matching coefficient</strong> (SMC). For A and B: 2 positions are 1–1 (milk, bread), 3 disagree (butter, eggs, jam), and 5 are 0–0 (neither bought chips, cola, dal, rice or soap). SMC = (2 + 5)/10 = 0.7, much higher than Jaccard's 0.4, because it gives credit for things neither customer bought. In a real shop with 20,000 products, any two baskets agree on about 19,990 "not bought" items, so SMC says every pair of customers is 99.9% alike. Two people who both do not own a yacht, a helicopter or a racehorse are not alike because of it. When a 1 is rare and meaningful (data like this is called <strong>asymmetric binary</strong>: purchases, tags, symptoms) use Jaccard, which ignores shared zeros. When 0 and 1 are equally informative (a yes/no survey answer) SMC is fine.</p>
<div class="fx" data-lang="py">def jaccard(s, t):
    return len(s &amp; t) / len(s | t)

for p, q in [("A", "E"), ("A", "B"), ("C", "F")]:
    s, t = baskets[p], baskets[q]
    print(f"J({p},{q}) = {len(s &amp; t)}/{len(s | t)} = {jaccard(s, t):.3f}")

items = sorted(set().union(*baskets.values()))                  # the shop's 10 items
Bm = np.array([[i in baskets[c] for i in items] for c in cust.index])   # True/False basket table
print("Jaccard distance (1 - J):")
print(pd.DataFrame(pairwise_distances(Bm, metric="jaccard"), index=cust.index, columns=cust.index).round(2))
smc = (Bm[0] == Bm[1]).mean()                                   # simple matching: 0-0 counts as agreement
print("A vs B: simple matching", smc, "  Jaccard", jaccard(baskets["A"], baskets["B"]))</div>
  <div class="fx" data-lang="text">J(A,E) = 3/4 = 0.750
J(A,B) = 2/5 = 0.400
J(C,F) = 2/4 = 0.500
Jaccard distance (1 - J):
      A     B     C     D     E     F
A  0.00  0.60  0.83  0.86  0.25  1.00
B  0.60  0.00  0.80  0.83  0.50  1.00
C  0.83  0.80  0.00  0.83  0.80  0.50
D  0.86  0.83  0.83  0.00  0.83  0.83
E  0.25  0.50  0.80  0.83  0.00  1.00
F  1.00  1.00  0.50  0.83  1.00  0.00
A vs B: simple matching 0.7   Jaccard 0.4</div>
  <p>The set calculations reproduce the hand values (0.75, 0.4, and 0.5 for C and F, who share chips and cola). sklearn's <code>metric="jaccard"</code> needs a True/False table and returns 1 − J: A–E 0.25, A–B 0.6. F shares nothing with A, B or E, so their distance is the maximum, 1.0. The last line shows the SMC inflation directly: 0.7 against 0.4.</p>
  <p>Two related measures come up in interviews. The <strong>Dice coefficient</strong>, 2|S ∩ T| / (|S| + |T|), is Jaccard with shared items counted twice, so it is a little more generous. The <strong>Hamming distance</strong> is the fraction of positions that disagree, which is just 1 − SMC. And a practical warning: sklearn's Jaccard expects booleans; passing counts or floats gives warnings or nonsense.</p>

  <h2 id="cl-gower"><span class="num">06</span>Gower Distance for Mixed Types</h2>
  <p>A full customer card mixes everything at once. How far is A (25 years, ₹40,000, Pune, has the card) from B (52, ₹45,000, Pune, no card)? Euclidean needs numbers on comparable scales, Jaccard needs sets, and "Pune minus Delhi" means nothing. A common shortcut is to one-hot encode the city and throw everything into Euclidean, but then a 50-city one-hot block can outweigh everything else, and income in rupees would swamp age anyway.</p>
  <p><strong>Gower distance</strong> (Gower, 1971) solves this by comparing two rows <strong>one column at a time</strong>, with a rule suited to each column's type, so that every column gives a partial distance between 0 and 1, and then averaging. For a numeric column the partial distance is the gap divided by the column's range (largest value minus smallest), so the two most extreme customers are exactly 1 apart. For a category such as city it is 0 if the two values match and 1 if not. A yes/no column is treated the same way, unless it is asymmetric like a basket, in which case 0–0 pairs are skipped, just as Jaccard does. A missing value simply drops that column out of that pair's average. Notice that every piece is something we already know: the numeric rule is a Manhattan gap divided by the range (min-max scaling, built in), and the asymmetric rule is Jaccard's.</p>
  <p>By hand, with age range 55 − 25 = 30 and income range ₹1,20,000 − ₹40,000 = ₹80,000: A and E give age 3/30 = 0.1, income 2/80 = 0.025, same city 0, same card 0, average 0.125/4 = <strong>0.031</strong>: almost identical customers. A and B give age 27/30 = 0.9, income 5/80 = 0.0625, same city 0, different card 1, average 1.9625/4 = <strong>0.491</strong>. Notice how much the card column weighs: one mismatch adds 1/4 = 0.25 on its own. If that seems too much, Gower allows a weight per column.</p>
  <p>sklearn has no Gower option, but the function is short, and any algorithm that accepts a <strong>precomputed</strong> distance matrix can then use it. Hierarchical clustering with average linkage (explained in <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a>) is the usual partner:</p>
<div class="fx" data-lang="py">from sklearn.cluster import AgglomerativeClustering

def gower_matrix(df, num_cols, cat_cols):
    total = np.zeros((len(df), len(df)))
    for c in num_cols:                                   # numeric: |xi - xj| / range
        x = df[c].to_numpy(float)
        total += np.abs(x[:, None] - x[None, :]) / (x.max() - x.min())
    for c in cat_cols:                                   # category or yes/no: 0 if equal, else 1
        x = df[c].to_numpy()
        total += (x[:, None] != x[None, :])
    return total / (len(num_cols) + len(cat_cols))       # average over the columns

G = gower_matrix(cust, ["age", "income"], ["city", "has_card"])
print(pd.DataFrame(G, index=cust.index, columns=cust.index).round(3))

agg = AgglomerativeClustering(n_clusters=2, metric="precomputed", linkage="average")
print("groups:", dict(zip(cust.index, agg.fit_predict(G).tolist())))</div>
  <div class="fx" data-lang="text">       A      B      C      D      E      F
A  0.000  0.491  0.750  0.542  0.031  0.927
B  0.491  0.000  0.759  0.668  0.459  0.470
C  0.750  0.759  0.000  0.458  0.719  0.323
D  0.542  0.668  0.458  0.000  0.510  0.635
E  0.031  0.459  0.719  0.510  0.000  0.896
F  0.927  0.470  0.323  0.635  0.896  0.000
groups: {'A': 1, 'B': 1, 'C': 0, 'D': 0, 'E': 1, 'F': 0}</div>
  <p>The matrix matches the hand values (A–E 0.031, A–B 0.491). B is the interesting customer: 0.491 from A but 0.470 from F, sitting between the two camps. The clustering puts B with A and E: shared city and low income outweigh the 27-year age gap. Remember this, because with a different ruler B will move. K-Means could not have done this at all; it needs an average of each group, and "the average of Pune and Delhi" does not exist.</p>
  <p>Gower has two weaknesses. It divides by the range, so a single extreme income (₹50 lakh) stretches the range and squashes every other income gap close to 0; cap outliers first. And it needs the full n × n matrix, so for large mixed tables people use k-prototypes, a K-Means variant that uses means for numeric columns and the most common value for categories.</p>

  <h2 id="cl-scale"><span class="num">07</span>Scaling</h2>
  <p>Gower scaled each column inside its own formula. Euclidean, Manhattan and cosine do not: they take the numbers exactly as stored. That means the units you happened to store a column in silently decide how much it counts. In section 02 we quietly divided income by 1000. Mrs. Kulkarni's cards store it in plain rupees. Does that change who is near whom?</p>
  <p>Completely. In plain rupees, B (52, ₹45,000) to E (28, ₹42,000) is √(24² + 3,000²) = 3,000.1, and B to D (45, ₹80,000) is √(7² + 35,000²) = 35,000.0. The 24-year age gap adds just 0.1 to a distance of 3,000; income is the only column that counts, and age might as well not exist. Now apply <strong>standard scaling</strong>: for each column subtract its mean and divide by its standard deviation, z = (x − mean) / std, so every column has mean 0 and spread 1. With age (mean 42.5, std 11.7) and income (mean ₹72,833, std ₹32,815), B becomes (0.81, −0.85), E becomes (−1.24, −0.94) and D becomes (0.21, 0.22). Now B to E is √(2.05² + 0.09²) = 2.05 and B to D is √(0.60² + 1.07²) = 1.22. B's nearest customer flips from E to D.</p>
<div class="fx" data-lang="py">Xr = cust[["age", "income"]].to_numpy(float)              # income in plain rupees
Z = (Xr - Xr.mean(0)) / Xr.std(0)                         # standard scaling: (x - mean) / std
for name, M in [("raw rupees", Xr), ("standard-scaled", Z)]:
    dB = pairwise_distances(M[[1]], M)[0]                 # distances from B to everyone
    nearest = cust.index[np.argsort(dB)[1]]
    print(f"{name:16s} B-&gt;E {dB[4]:9.2f}   B-&gt;D {dB[3]:9.2f}   nearest to B: {nearest}")</div>
  <div class="fx" data-lang="text">raw rupees       B-&gt;E   3000.10   B-&gt;D  35000.00   nearest to B: E
standard-scaled  B-&gt;E      2.05   B-&gt;D      1.22   nearest to B: D</div>
  <p>Neither answer is "the truth". Unscaled, similarity means "similar income"; scaled, it means "similar in age and income equally". This is the key idea of the section: for any distance-based method, <strong>scaling is choosing feature weights</strong>. Doubling a column makes it count twice as much in Euclidean distance. Equal spread is a sensible default, not a law of nature. Watch for hidden weights too: two columns that measure the same thing (height in cm and in inches) count that information twice.</p>
  <p>There are three common scalers. <strong>Standard scaling</strong> uses the mean and standard deviation. <strong>Min-max scaling</strong>, (x − min) / (max − min), squeezes each column into 0 to 1, exactly as Gower does. <strong>Robust scaling</strong>, (x − median) / IQR, uses the median and the interquartile range (the spread of the middle half of the values), so a few outliers cannot distort it. For A's age of 25 they give −1.49, 0 and −1.17 respectively. (Their details are in <a class="xref" data-note="ml_features">Feature Engineering</a>.) Six rows cannot show how much the choice matters, so here are 400 customers in two real groups that differ only in age, plus an income column that is pure noise on a huge scale. The <strong>ARI</strong> (adjusted Rand index, defined in <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>) compares found groups with the true ones: 1 is perfect, about 0 is no better than random.</p>
<div class="fx" data-lang="py">from sklearn.preprocessing import MinMaxScaler, RobustScaler
rng = np.random.default_rng(0)
age = np.r_[rng.normal(25, 3, 200), rng.normal(55, 3, 200)]   # two real groups: young and old
income = rng.normal(60000, 15000, 400)                          # same for both groups: pure noise
Xs, truth = np.c_[age, income], np.r_[np.zeros(200), np.ones(200)]
for name, Z in [("raw", Xs), ("standard", StandardScaler().fit_transform(Xs)),
                ("min-max", MinMaxScaler().fit_transform(Xs)), ("robust", RobustScaler().fit_transform(Xs))]:
    found = KMeans(2, n_init=10, random_state=0).fit_predict(Z)
    print(f"{name:9s} ARI = {adjusted_rand_score(truth, found):.3f}")</div>
  <div class="fx" data-lang="text">raw       ARI = -0.002
standard  ARI = 1.000
min-max   ARI = 1.000
robust    ARI = -0.002</div>
  <p>Raw data scores −0.002: income's spread (about 15,000) is a thousand times age's, so K-Means splits on income noise and ignores the real age groups. Standard and min-max scaling both reach a perfect 1.000. Robust scaling fails again, and the reason is instructive. Age here is <strong>bimodal</strong> (half the customers near 25, half near 55), so its interquartile range is huge, about 30 years, and dividing by it squeezes the two age groups to about ±0.5, which is smaller than the spread of the scaled income noise. Scaling is not a ritual to apply blindly; each scaler decides how much each column weighs, and you should check that the columns you care about still dominate. Finally, fit the scaler once on the data you cluster and reuse that same fitted scaler for new customers, ideally inside a <code>Pipeline</code> (section 11 and <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>

  <h2 id="cl-curse"><span class="num">08</span>The Curse of Dimensionality</h2>
  <p>Our customers have two numeric columns. A real feature table may have 500. Distances still compute fine with 500 columns, but something quietly goes wrong with what they mean. To see it, throw 200 random points into a cube with d dimensions and compare, for one point, its nearest and farthest neighbour:</p>
<div class="fx" data-lang="py">rng = np.random.default_rng(0)
for d in [2, 10, 100, 1000]:
    pts = rng.uniform(size=(200, d))                       # 200 random points in d dimensions
    dist = pairwise_distances(pts[:1], pts[1:])[0]         # point 0 to the other 199
    print(f"d={d:4d}  nearest={dist.min():6.2f}  farthest={dist.max():6.2f}  "
          f"(far-near)/near={(dist.max() - dist.min()) / dist.min():5.2f}")</div>
  <div class="fx" data-lang="text">d=   2  nearest=  0.06  farthest=  0.86  (far-near)/near=13.18
d=  10  nearest=  0.59  farthest=  1.99  (far-near)/near= 2.36
d= 100  nearest=  3.48  farthest=  4.81  (far-near)/near= 0.38
d=1000  nearest= 12.14  farthest= 13.49  (far-near)/near= 0.11</div>
  <p>In 2 dimensions the farthest point is about 14 times as far away as the nearest (the relative gap is 13.18), so "near" clearly means something. In 1,000 dimensions the farthest point is only 11% farther than the nearest: every point is roughly equally far from every other. This effect is called <strong>distance concentration</strong>, and it is the main face of the <strong>curse of dimensionality</strong> for clustering. The reason is simple. Each extra column that does not carry real group structure adds a little independent noise to every distance. The total grows with the number of columns, but the differences between distances grow much more slowly (roughly with the square root), so the contrast between "near" and "far" fades away.</p>
  <p>Picture trying to find your friends in a crowd where everyone is standing exactly the same distance from you. No rule of the form "join the nearest group" can work, and that describes K-Means, DBSCAN, hierarchical clustering and KNN alike. The cures are to keep only columns that matter for the question, to reduce dimensions first with PCA or UMAP (see <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a>), or, for text and embeddings, to use cosine on normalised vectors. A rough rule: beyond 20 to 50 informative columns, reduce before you cluster.</p>

  <h2 id="cl-shapes"><span class="num">09</span>Cluster Shapes: Why Algorithms Disagree</h2>
  <p>We now have rulers and know how to prepare columns for them. Yet two algorithms run on the same scaled rows, with the same ruler, can still return different groups. The reason is that a ruler measures pairs of rows, while a cluster is a whole set of rows, and each algorithm carries its own idea of what a set of rows that "belongs together" looks like. Is a group a round blob around a centre? A chain of neighbours holding hands? A crowded patch with empty space around it? An oval cloud?</p>
  <p>Six customers are too few to see shapes, so we borrow five synthetic datasets of 300 points each, where we know the true groups. The figure shows them: round blobs, stretched (elongated) blobs, groups of very unequal size and spread, two interleaved half-moons, and a ring around a core.</p>
<figure class="viz"><svg viewBox="0 0 660 170" width="660"><rect x="8" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="69.0" y="15" text-anchor="middle" font-size="12">round blobs</text><circle cx="24" cy="87" r="2.2" class="fr sr"/><circle cx="34" cy="104" r="2.2" class="fr sr"/><circle cx="61" cy="136" r="2.2" class="fg sg"/><circle cx="122" cy="50" r="2.2" class="fb sb"/><circle cx="107" cy="43" r="2.2" class="fb sb"/><circle cx="114" cy="32" r="2.2" class="fb sb"/><circle cx="27" cy="101" r="2.2" class="fr sr"/><circle cx="112" cy="35" r="2.2" class="fb sb"/><circle cx="32" cy="92" r="2.2" class="fr sr"/><circle cx="33" cy="100" r="2.2" class="fr sr"/><circle cx="62" cy="119" r="2.2" class="fg sg"/><circle cx="103" cy="45" r="2.2" class="fb sb"/><circle cx="29" cy="97" r="2.2" class="fr sr"/><circle cx="35" cy="95" r="2.2" class="fr sr"/><circle cx="102" cy="36" r="2.2" class="fb sb"/><circle cx="53" cy="122" r="2.2" class="fg sg"/><circle cx="58" cy="117" r="2.2" class="fg sg"/><circle cx="108" cy="40" r="2.2" class="fb sb"/><circle cx="30" cy="94" r="2.2" class="fr sr"/><circle cx="68" cy="118" r="2.2" class="fg sg"/><circle cx="108" cy="39" r="2.2" class="fb sb"/><circle cx="106" cy="46" r="2.2" class="fb sb"/><circle cx="57" cy="130" r="2.2" class="fg sg"/><circle cx="110" cy="41" r="2.2" class="fb sb"/><circle cx="58" cy="114" r="2.2" class="fg sg"/><circle cx="35" cy="101" r="2.2" class="fr sr"/><circle cx="30" cy="100" r="2.2" class="fr sr"/><circle cx="64" cy="126" r="2.2" class="fg sg"/><circle cx="110" cy="46" r="2.2" class="fb sb"/><circle cx="48" cy="104" r="2.2" class="fr sr"/><circle cx="16" cy="108" r="2.2" class="fr sr"/><circle cx="60" cy="138" r="2.2" class="fg sg"/><circle cx="66" cy="121" r="2.2" class="fg sg"/><circle cx="118" cy="38" r="2.2" class="fb sb"/><circle cx="37" cy="99" r="2.2" class="fr sr"/><circle cx="33" cy="96" r="2.2" class="fr sr"/><circle cx="57" cy="127" r="2.2" class="fg sg"/><circle cx="19" cy="107" r="2.2" class="fr sr"/><circle cx="67" cy="115" r="2.2" class="fg sg"/><circle cx="97" cy="38" r="2.2" class="fb sb"/><circle cx="39" cy="96" r="2.2" class="fr sr"/><circle cx="69" cy="121" r="2.2" class="fg sg"/><circle cx="24" cy="96" r="2.2" class="fr sr"/><circle cx="108" cy="28" r="2.2" class="fb sb"/><circle cx="104" cy="37" r="2.2" class="fb sb"/><circle cx="25" cy="100" r="2.2" class="fr sr"/><circle cx="55" cy="118" r="2.2" class="fg sg"/><circle cx="102" cy="38" r="2.2" class="fb sb"/><circle cx="105" cy="40" r="2.2" class="fb sb"/><circle cx="97" cy="38" r="2.2" class="fb sb"/><circle cx="110" cy="33" r="2.2" class="fb sb"/><circle cx="24" cy="106" r="2.2" class="fr sr"/><circle cx="112" cy="36" r="2.2" class="fb sb"/><circle cx="51" cy="125" r="2.2" class="fg sg"/><circle cx="38" cy="98" r="2.2" class="fr sr"/><circle cx="51" cy="125" r="2.2" class="fg sg"/><circle cx="59" cy="125" r="2.2" class="fg sg"/><circle cx="109" cy="41" r="2.2" class="fb sb"/><circle cx="99" cy="39" r="2.2" class="fb sb"/><circle cx="106" cy="44" r="2.2" class="fb sb"/><circle cx="57" cy="128" r="2.2" class="fg sg"/><circle cx="37" cy="102" r="2.2" class="fr sr"/><circle cx="107" cy="41" r="2.2" class="fb sb"/><circle cx="105" cy="37" r="2.2" class="fb sb"/><circle cx="33" cy="98" r="2.2" class="fr sr"/><circle cx="67" cy="129" r="2.2" class="fg sg"/><circle cx="38" cy="97" r="2.2" class="fr sr"/><circle cx="108" cy="41" r="2.2" class="fb sb"/><circle cx="53" cy="119" r="2.2" class="fg sg"/><circle cx="56" cy="127" r="2.2" class="fg sg"/><circle cx="36" cy="92" r="2.2" class="fr sr"/><circle cx="105" cy="43" r="2.2" class="fb sb"/><circle cx="64" cy="129" r="2.2" class="fg sg"/><circle cx="37" cy="100" r="2.2" class="fr sr"/><circle cx="44" cy="129" r="2.2" class="fg sg"/><circle cx="63" cy="130" r="2.2" class="fg sg"/><circle cx="114" cy="28" r="2.2" class="fb sb"/><circle cx="105" cy="45" r="2.2" class="fb sb"/><circle cx="58" cy="118" r="2.2" class="fg sg"/><circle cx="99" cy="34" r="2.2" class="fb sb"/><circle cx="108" cy="35" r="2.2" class="fb sb"/><circle cx="99" cy="39" r="2.2" class="fb sb"/><circle cx="43" cy="100" r="2.2" class="fr sr"/><circle cx="104" cy="35" r="2.2" class="fb sb"/><circle cx="34" cy="91" r="2.2" class="fr sr"/><circle cx="63" cy="115" r="2.2" class="fg sg"/><circle cx="54" cy="121" r="2.2" class="fg sg"/><circle cx="104" cy="53" r="2.2" class="fb sb"/><circle cx="41" cy="94" r="2.2" class="fr sr"/><circle cx="109" cy="51" r="2.2" class="fb sb"/><circle cx="30" cy="98" r="2.2" class="fr sr"/><circle cx="48" cy="100" r="2.2" class="fr sr"/><circle cx="62" cy="114" r="2.2" class="fg sg"/><circle cx="70" cy="129" r="2.2" class="fg sg"/><circle cx="62" cy="128" r="2.2" class="fg sg"/><circle cx="21" cy="92" r="2.2" class="fr sr"/><circle cx="62" cy="134" r="2.2" class="fg sg"/><circle cx="34" cy="90" r="2.2" class="fr sr"/><circle cx="32" cy="96" r="2.2" class="fr sr"/><circle cx="36" cy="102" r="2.2" class="fr sr"/><circle cx="65" cy="125" r="2.2" class="fg sg"/><circle cx="45" cy="132" r="2.2" class="fg sg"/><circle cx="62" cy="125" r="2.2" class="fg sg"/><circle cx="113" cy="43" r="2.2" class="fb sb"/><circle cx="113" cy="39" r="2.2" class="fb sb"/><circle cx="41" cy="91" r="2.2" class="fr sr"/><circle cx="108" cy="36" r="2.2" class="fb sb"/><circle cx="27" cy="97" r="2.2" class="fr sr"/><circle cx="48" cy="93" r="2.2" class="fr sr"/><circle cx="71" cy="129" r="2.2" class="fg sg"/><circle cx="96" cy="43" r="2.2" class="fb sb"/><circle cx="53" cy="121" r="2.2" class="fg sg"/><circle cx="60" cy="118" r="2.2" class="fg sg"/><circle cx="106" cy="43" r="2.2" class="fb sb"/><circle cx="65" cy="125" r="2.2" class="fg sg"/><circle cx="66" cy="132" r="2.2" class="fg sg"/><circle cx="26" cy="92" r="2.2" class="fr sr"/><circle cx="56" cy="117" r="2.2" class="fg sg"/><circle cx="110" cy="41" r="2.2" class="fb sb"/><circle cx="103" cy="46" r="2.2" class="fb sb"/><rect x="139" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="200.0" y="15" text-anchor="middle" font-size="12">stretched</text><circle cx="174" cy="73" r="2.2" class="fb sb"/><circle cx="183" cy="57" r="2.2" class="fr sr"/><circle cx="151" cy="47" r="2.2" class="fb sb"/><circle cx="189" cy="96" r="2.2" class="fb sb"/><circle cx="194" cy="105" r="2.2" class="fb sb"/><circle cx="231" cy="104" r="2.2" class="fg sg"/><circle cx="193" cy="63" r="2.2" class="fr sr"/><circle cx="200" cy="82" r="2.2" class="fr sr"/><circle cx="225" cy="92" r="2.2" class="fg sg"/><circle cx="179" cy="44" r="2.2" class="fr sr"/><circle cx="242" cy="121" r="2.2" class="fg sg"/><circle cx="244" cy="125" r="2.2" class="fg sg"/><circle cx="180" cy="50" r="2.2" class="fr sr"/><circle cx="176" cy="79" r="2.2" class="fb sb"/><circle cx="181" cy="92" r="2.2" class="fb sb"/><circle cx="165" cy="33" r="2.2" class="fr sr"/><circle cx="247" cy="124" r="2.2" class="fg sg"/><circle cx="243" cy="122" r="2.2" class="fg sg"/><circle cx="219" cy="92" r="2.2" class="fg sg"/><circle cx="226" cy="101" r="2.2" class="fg sg"/><circle cx="170" cy="76" r="2.2" class="fb sb"/><circle cx="180" cy="88" r="2.2" class="fb sb"/><circle cx="181" cy="58" r="2.2" class="fr sr"/><circle cx="192" cy="75" r="2.2" class="fr sr"/><circle cx="218" cy="91" r="2.2" class="fg sg"/><circle cx="196" cy="71" r="2.2" class="fr sr"/><circle cx="171" cy="71" r="2.2" class="fb sb"/><circle cx="170" cy="33" r="2.2" class="fr sr"/><circle cx="185" cy="86" r="2.2" class="fb sb"/><circle cx="185" cy="60" r="2.2" class="fr sr"/><circle cx="235" cy="109" r="2.2" class="fg sg"/><circle cx="215" cy="83" r="2.2" class="fg sg"/><circle cx="248" cy="135" r="2.2" class="fg sg"/><circle cx="181" cy="83" r="2.2" class="fb sb"/><circle cx="235" cy="112" r="2.2" class="fg sg"/><circle cx="176" cy="75" r="2.2" class="fb sb"/><circle cx="245" cy="131" r="2.2" class="fg sg"/><circle cx="242" cy="124" r="2.2" class="fg sg"/><circle cx="220" cy="85" r="2.2" class="fg sg"/><circle cx="178" cy="49" r="2.2" class="fr sr"/><circle cx="230" cy="99" r="2.2" class="fg sg"/><circle cx="174" cy="68" r="2.2" class="fb sb"/><circle cx="237" cy="111" r="2.2" class="fg sg"/><circle cx="184" cy="90" r="2.2" class="fb sb"/><circle cx="172" cy="44" r="2.2" class="fr sr"/><circle cx="237" cy="115" r="2.2" class="fg sg"/><circle cx="182" cy="53" r="2.2" class="fr sr"/><circle cx="194" cy="65" r="2.2" class="fr sr"/><circle cx="186" cy="61" r="2.2" class="fr sr"/><circle cx="195" cy="93" r="2.2" class="fb sb"/><circle cx="192" cy="68" r="2.2" class="fr sr"/><circle cx="227" cy="90" r="2.2" class="fg sg"/><circle cx="189" cy="102" r="2.2" class="fb sb"/><circle cx="188" cy="63" r="2.2" class="fr sr"/><circle cx="235" cy="113" r="2.2" class="fg sg"/><circle cx="229" cy="106" r="2.2" class="fg sg"/><circle cx="186" cy="102" r="2.2" class="fb sb"/><circle cx="182" cy="61" r="2.2" class="fr sr"/><circle cx="175" cy="86" r="2.2" class="fb sb"/><circle cx="181" cy="91" r="2.2" class="fb sb"/><circle cx="190" cy="97" r="2.2" class="fb sb"/><circle cx="175" cy="86" r="2.2" class="fb sb"/><circle cx="170" cy="68" r="2.2" class="fb sb"/><circle cx="182" cy="53" r="2.2" class="fr sr"/><circle cx="242" cy="119" r="2.2" class="fg sg"/><circle cx="176" cy="73" r="2.2" class="fb sb"/><circle cx="247" cy="132" r="2.2" class="fg sg"/><circle cx="187" cy="66" r="2.2" class="fr sr"/><circle cx="178" cy="90" r="2.2" class="fb sb"/><circle cx="187" cy="56" r="2.2" class="fr sr"/><circle cx="176" cy="77" r="2.2" class="fb sb"/><circle cx="182" cy="51" r="2.2" class="fr sr"/><circle cx="225" cy="91" r="2.2" class="fg sg"/><circle cx="182" cy="54" r="2.2" class="fr sr"/><circle cx="183" cy="60" r="2.2" class="fr sr"/><circle cx="203" cy="77" r="2.2" class="fr sr"/><circle cx="192" cy="106" r="2.2" class="fb sb"/><circle cx="183" cy="88" r="2.2" class="fb sb"/><circle cx="194" cy="73" r="2.2" class="fr sr"/><circle cx="183" cy="50" r="2.2" class="fr sr"/><circle cx="203" cy="73" r="2.2" class="fr sr"/><circle cx="182" cy="56" r="2.2" class="fr sr"/><circle cx="246" cy="130" r="2.2" class="fg sg"/><circle cx="169" cy="71" r="2.2" class="fb sb"/><circle cx="163" cy="65" r="2.2" class="fb sb"/><circle cx="241" cy="119" r="2.2" class="fg sg"/><circle cx="182" cy="59" r="2.2" class="fr sr"/><circle cx="234" cy="105" r="2.2" class="fg sg"/><circle cx="195" cy="69" r="2.2" class="fr sr"/><circle cx="175" cy="39" r="2.2" class="fr sr"/><circle cx="164" cy="59" r="2.2" class="fb sb"/><circle cx="232" cy="102" r="2.2" class="fg sg"/><circle cx="247" cy="125" r="2.2" class="fg sg"/><circle cx="185" cy="91" r="2.2" class="fb sb"/><circle cx="170" cy="37" r="2.2" class="fr sr"/><circle cx="176" cy="79" r="2.2" class="fb sb"/><circle cx="158" cy="58" r="2.2" class="fb sb"/><circle cx="169" cy="59" r="2.2" class="fb sb"/><circle cx="171" cy="42" r="2.2" class="fr sr"/><circle cx="243" cy="120" r="2.2" class="fg sg"/><circle cx="253" cy="138" r="2.2" class="fg sg"/><circle cx="233" cy="107" r="2.2" class="fg sg"/><circle cx="171" cy="72" r="2.2" class="fb sb"/><circle cx="163" cy="57" r="2.2" class="fb sb"/><circle cx="181" cy="66" r="2.2" class="fr sr"/><circle cx="186" cy="90" r="2.2" class="fb sb"/><circle cx="238" cy="120" r="2.2" class="fg sg"/><circle cx="185" cy="82" r="2.2" class="fb sb"/><circle cx="178" cy="79" r="2.2" class="fb sb"/><circle cx="180" cy="49" r="2.2" class="fr sr"/><circle cx="226" cy="101" r="2.2" class="fg sg"/><circle cx="231" cy="101" r="2.2" class="fg sg"/><circle cx="182" cy="52" r="2.2" class="fr sr"/><circle cx="244" cy="124" r="2.2" class="fg sg"/><circle cx="195" cy="110" r="2.2" class="fb sb"/><circle cx="192" cy="60" r="2.2" class="fr sr"/><circle cx="230" cy="90" r="2.2" class="fg sg"/><circle cx="163" cy="55" r="2.2" class="fb sb"/><circle cx="180" cy="45" r="2.2" class="fr sr"/><circle cx="182" cy="87" r="2.2" class="fb sb"/><rect x="270" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="331.0" y="15" text-anchor="middle" font-size="12">unequal</text><circle cx="317" cy="116" r="2.2" class="fb sb"/><circle cx="323" cy="72" r="2.2" class="fb sb"/><circle cx="315" cy="89" r="2.2" class="fb sb"/><circle cx="330" cy="38" r="2.2" class="fg sg"/><circle cx="380" cy="82" r="2.2" class="fr sr"/><circle cx="360" cy="110" r="2.2" class="fb sb"/><circle cx="342" cy="93" r="2.2" class="fb sb"/><circle cx="352" cy="84" r="2.2" class="fb sb"/><circle cx="325" cy="80" r="2.2" class="fb sb"/><circle cx="331" cy="93" r="2.2" class="fb sb"/><circle cx="280" cy="84" r="2.2" class="fb sb"/><circle cx="322" cy="79" r="2.2" class="fb sb"/><circle cx="377" cy="83" r="2.2" class="fr sr"/><circle cx="348" cy="54" r="2.2" class="fb sb"/><circle cx="362" cy="75" r="2.2" class="fb sb"/><circle cx="340" cy="99" r="2.2" class="fb sb"/><circle cx="333" cy="118" r="2.2" class="fb sb"/><circle cx="377" cy="80" r="2.2" class="fr sr"/><circle cx="375" cy="87" r="2.2" class="fr sr"/><circle cx="314" cy="103" r="2.2" class="fb sb"/><circle cx="337" cy="49" r="2.2" class="fb sb"/><circle cx="334" cy="37" r="2.2" class="fg sg"/><circle cx="308" cy="84" r="2.2" class="fb sb"/><circle cx="351" cy="61" r="2.2" class="fb sb"/><circle cx="337" cy="138" r="2.2" class="fb sb"/><circle cx="293" cy="102" r="2.2" class="fb sb"/><circle cx="321" cy="121" r="2.2" class="fb sb"/><circle cx="383" cy="73" r="2.2" class="fb sb"/><circle cx="326" cy="91" r="2.2" class="fb sb"/><circle cx="335" cy="35" r="2.2" class="fg sg"/><circle cx="317" cy="89" r="2.2" class="fb sb"/><circle cx="352" cy="51" r="2.2" class="fb sb"/><circle cx="380" cy="82" r="2.2" class="fr sr"/><circle cx="352" cy="65" r="2.2" class="fb sb"/><circle cx="337" cy="92" r="2.2" class="fb sb"/><circle cx="323" cy="69" r="2.2" class="fb sb"/><circle cx="325" cy="44" r="2.2" class="fg sg"/><circle cx="312" cy="103" r="2.2" class="fb sb"/><circle cx="375" cy="80" r="2.2" class="fr sr"/><circle cx="316" cy="83" r="2.2" class="fb sb"/><circle cx="378" cy="91" r="2.2" class="fr sr"/><circle cx="342" cy="90" r="2.2" class="fb sb"/><circle cx="330" cy="96" r="2.2" class="fb sb"/><circle cx="378" cy="87" r="2.2" class="fr sr"/><circle cx="378" cy="87" r="2.2" class="fr sr"/><circle cx="334" cy="68" r="2.2" class="fb sb"/><circle cx="374" cy="85" r="2.2" class="fr sr"/><circle cx="349" cy="118" r="2.2" class="fb sb"/><circle cx="375" cy="81" r="2.2" class="fr sr"/><circle cx="332" cy="38" r="2.2" class="fg sg"/><circle cx="355" cy="82" r="2.2" class="fb sb"/><circle cx="338" cy="105" r="2.2" class="fb sb"/><circle cx="323" cy="94" r="2.2" class="fb sb"/><circle cx="339" cy="89" r="2.2" class="fb sb"/><circle cx="360" cy="80" r="2.2" class="fb sb"/><circle cx="341" cy="95" r="2.2" class="fb sb"/><circle cx="313" cy="78" r="2.2" class="fb sb"/><circle cx="308" cy="87" r="2.2" class="fb sb"/><circle cx="380" cy="87" r="2.2" class="fr sr"/><circle cx="375" cy="88" r="2.2" class="fr sr"/><circle cx="347" cy="94" r="2.2" class="fb sb"/><circle cx="316" cy="128" r="2.2" class="fb sb"/><circle cx="381" cy="82" r="2.2" class="fr sr"/><circle cx="376" cy="81" r="2.2" class="fr sr"/><circle cx="374" cy="82" r="2.2" class="fr sr"/><circle cx="356" cy="112" r="2.2" class="fb sb"/><circle cx="321" cy="115" r="2.2" class="fb sb"/><circle cx="375" cy="85" r="2.2" class="fr sr"/><circle cx="321" cy="112" r="2.2" class="fb sb"/><circle cx="338" cy="55" r="2.2" class="fb sb"/><circle cx="376" cy="82" r="2.2" class="fr sr"/><circle cx="312" cy="80" r="2.2" class="fb sb"/><circle cx="373" cy="86" r="2.2" class="fr sr"/><circle cx="380" cy="86" r="2.2" class="fr sr"/><circle cx="305" cy="60" r="2.2" class="fb sb"/><circle cx="337" cy="117" r="2.2" class="fb sb"/><circle cx="309" cy="88" r="2.2" class="fb sb"/><circle cx="334" cy="105" r="2.2" class="fb sb"/><circle cx="324" cy="78" r="2.2" class="fb sb"/><circle cx="333" cy="34" r="2.2" class="fg sg"/><circle cx="328" cy="125" r="2.2" class="fb sb"/><circle cx="377" cy="78" r="2.2" class="fr sr"/><circle cx="334" cy="108" r="2.2" class="fb sb"/><circle cx="328" cy="53" r="2.2" class="fb sb"/><circle cx="318" cy="72" r="2.2" class="fb sb"/><circle cx="327" cy="45" r="2.2" class="fg sg"/><circle cx="312" cy="69" r="2.2" class="fb sb"/><circle cx="337" cy="62" r="2.2" class="fb sb"/><circle cx="366" cy="43" r="2.2" class="fb sb"/><circle cx="276" cy="102" r="2.2" class="fb sb"/><circle cx="336" cy="76" r="2.2" class="fb sb"/><circle cx="344" cy="100" r="2.2" class="fb sb"/><circle cx="330" cy="37" r="2.2" class="fg sg"/><circle cx="344" cy="79" r="2.2" class="fb sb"/><circle cx="307" cy="105" r="2.2" class="fb sb"/><circle cx="336" cy="89" r="2.2" class="fb sb"/><circle cx="327" cy="93" r="2.2" class="fb sb"/><circle cx="320" cy="50" r="2.2" class="fb sb"/><circle cx="349" cy="111" r="2.2" class="fb sb"/><circle cx="327" cy="39" r="2.2" class="fg sg"/><circle cx="312" cy="80" r="2.2" class="fb sb"/><circle cx="334" cy="62" r="2.2" class="fb sb"/><circle cx="328" cy="46" r="2.2" class="fg sg"/><circle cx="308" cy="96" r="2.2" class="fb sb"/><circle cx="339" cy="87" r="2.2" class="fb sb"/><circle cx="319" cy="96" r="2.2" class="fb sb"/><circle cx="315" cy="65" r="2.2" class="fb sb"/><circle cx="333" cy="102" r="2.2" class="fb sb"/><circle cx="281" cy="92" r="2.2" class="fb sb"/><circle cx="305" cy="80" r="2.2" class="fb sb"/><circle cx="327" cy="38" r="2.2" class="fg sg"/><circle cx="374" cy="85" r="2.2" class="fr sr"/><circle cx="333" cy="71" r="2.2" class="fb sb"/><circle cx="333" cy="43" r="2.2" class="fg sg"/><circle cx="304" cy="71" r="2.2" class="fb sb"/><circle cx="314" cy="87" r="2.2" class="fb sb"/><circle cx="332" cy="41" r="2.2" class="fg sg"/><circle cx="316" cy="61" r="2.2" class="fb sb"/><circle cx="382" cy="92" r="2.2" class="fr sr"/><circle cx="331" cy="76" r="2.2" class="fb sb"/><rect x="401" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="462.0" y="15" text-anchor="middle" font-size="12">moons</text><circle cx="498" cy="119" r="2.2" class="fr sr"/><circle cx="450" cy="82" r="2.2" class="fr sr"/><circle cx="454" cy="118" r="2.2" class="fr sr"/><circle cx="456" cy="37" r="2.2" class="fb sb"/><circle cx="441" cy="42" r="2.2" class="fb sb"/><circle cx="415" cy="68" r="2.2" class="fb sb"/><circle cx="417" cy="62" r="2.2" class="fb sb"/><circle cx="447" cy="100" r="2.2" class="fr sr"/><circle cx="510" cy="93" r="2.2" class="fr sr"/><circle cx="485" cy="129" r="2.2" class="fr sr"/><circle cx="450" cy="89" r="2.2" class="fr sr"/><circle cx="512" cy="71" r="2.2" class="fr sr"/><circle cx="418" cy="62" r="2.2" class="fb sb"/><circle cx="482" cy="126" r="2.2" class="fr sr"/><circle cx="470" cy="59" r="2.2" class="fb sb"/><circle cx="429" cy="43" r="2.2" class="fb sb"/><circle cx="501" cy="111" r="2.2" class="fr sr"/><circle cx="416" cy="71" r="2.2" class="fb sb"/><circle cx="495" cy="128" r="2.2" class="fr sr"/><circle cx="411" cy="70" r="2.2" class="fb sb"/><circle cx="486" cy="124" r="2.2" class="fr sr"/><circle cx="473" cy="63" r="2.2" class="fb sb"/><circle cx="498" cy="115" r="2.2" class="fr sr"/><circle cx="425" cy="50" r="2.2" class="fb sb"/><circle cx="435" cy="42" r="2.2" class="fb sb"/><circle cx="466" cy="46" r="2.2" class="fb sb"/><circle cx="444" cy="71" r="2.2" class="fr sr"/><circle cx="453" cy="114" r="2.2" class="fr sr"/><circle cx="474" cy="134" r="2.2" class="fr sr"/><circle cx="466" cy="48" r="2.2" class="fb sb"/><circle cx="431" cy="39" r="2.2" class="fb sb"/><circle cx="413" cy="74" r="2.2" class="fb sb"/><circle cx="485" cy="131" r="2.2" class="fr sr"/><circle cx="496" cy="118" r="2.2" class="fr sr"/><circle cx="429" cy="44" r="2.2" class="fb sb"/><circle cx="447" cy="87" r="2.2" class="fr sr"/><circle cx="475" cy="81" r="2.2" class="fb sb"/><circle cx="457" cy="48" r="2.2" class="fb sb"/><circle cx="451" cy="33" r="2.2" class="fb sb"/><circle cx="503" cy="99" r="2.2" class="fr sr"/><circle cx="492" cy="131" r="2.2" class="fr sr"/><circle cx="448" cy="89" r="2.2" class="fr sr"/><circle cx="501" cy="116" r="2.2" class="fr sr"/><circle cx="434" cy="44" r="2.2" class="fb sb"/><circle cx="513" cy="83" r="2.2" class="fr sr"/><circle cx="453" cy="115" r="2.2" class="fr sr"/><circle cx="412" cy="83" r="2.2" class="fb sb"/><circle cx="450" cy="97" r="2.2" class="fr sr"/><circle cx="474" cy="75" r="2.2" class="fb sb"/><circle cx="428" cy="37" r="2.2" class="fb sb"/><circle cx="467" cy="59" r="2.2" class="fb sb"/><circle cx="504" cy="98" r="2.2" class="fr sr"/><circle cx="500" cy="122" r="2.2" class="fr sr"/><circle cx="476" cy="77" r="2.2" class="fb sb"/><circle cx="489" cy="126" r="2.2" class="fr sr"/><circle cx="507" cy="98" r="2.2" class="fr sr"/><circle cx="478" cy="78" r="2.2" class="fb sb"/><circle cx="481" cy="134" r="2.2" class="fr sr"/><circle cx="509" cy="93" r="2.2" class="fr sr"/><circle cx="408" cy="92" r="2.2" class="fb sb"/><circle cx="452" cy="34" r="2.2" class="fb sb"/><circle cx="415" cy="63" r="2.2" class="fb sb"/><circle cx="478" cy="130" r="2.2" class="fr sr"/><circle cx="476" cy="136" r="2.2" class="fr sr"/><circle cx="453" cy="37" r="2.2" class="fb sb"/><circle cx="477" cy="80" r="2.2" class="fb sb"/><circle cx="470" cy="59" r="2.2" class="fb sb"/><circle cx="443" cy="36" r="2.2" class="fb sb"/><circle cx="506" cy="88" r="2.2" class="fr sr"/><circle cx="424" cy="42" r="2.2" class="fb sb"/><circle cx="476" cy="71" r="2.2" class="fb sb"/><circle cx="420" cy="56" r="2.2" class="fb sb"/><circle cx="459" cy="123" r="2.2" class="fr sr"/><circle cx="465" cy="129" r="2.2" class="fr sr"/><circle cx="462" cy="120" r="2.2" class="fr sr"/><circle cx="445" cy="91" r="2.2" class="fr sr"/><circle cx="480" cy="132" r="2.2" class="fr sr"/><circle cx="449" cy="109" r="2.2" class="fr sr"/><circle cx="456" cy="43" r="2.2" class="fb sb"/><circle cx="453" cy="105" r="2.2" class="fr sr"/><circle cx="504" cy="94" r="2.2" class="fr sr"/><circle cx="453" cy="45" r="2.2" class="fb sb"/><circle cx="508" cy="99" r="2.2" class="fr sr"/><circle cx="412" cy="89" r="2.2" class="fb sb"/><circle cx="472" cy="130" r="2.2" class="fr sr"/><circle cx="498" cy="121" r="2.2" class="fr sr"/><circle cx="439" cy="38" r="2.2" class="fb sb"/><circle cx="485" cy="129" r="2.2" class="fr sr"/><circle cx="510" cy="85" r="2.2" class="fr sr"/><circle cx="446" cy="91" r="2.2" class="fr sr"/><circle cx="476" cy="75" r="2.2" class="fb sb"/><circle cx="445" cy="76" r="2.2" class="fr sr"/><circle cx="461" cy="45" r="2.2" class="fb sb"/><circle cx="435" cy="40" r="2.2" class="fb sb"/><circle cx="476" cy="92" r="2.2" class="fb sb"/><circle cx="509" cy="103" r="2.2" class="fr sr"/><circle cx="508" cy="90" r="2.2" class="fr sr"/><circle cx="470" cy="133" r="2.2" class="fr sr"/><circle cx="414" cy="67" r="2.2" class="fb sb"/><circle cx="502" cy="122" r="2.2" class="fr sr"/><circle cx="462" cy="134" r="2.2" class="fr sr"/><circle cx="450" cy="106" r="2.2" class="fr sr"/><circle cx="476" cy="126" r="2.2" class="fr sr"/><circle cx="467" cy="124" r="2.2" class="fr sr"/><circle cx="502" cy="110" r="2.2" class="fr sr"/><circle cx="451" cy="104" r="2.2" class="fr sr"/><circle cx="458" cy="50" r="2.2" class="fb sb"/><circle cx="493" cy="131" r="2.2" class="fr sr"/><circle cx="459" cy="40" r="2.2" class="fb sb"/><circle cx="449" cy="37" r="2.2" class="fb sb"/><circle cx="411" cy="102" r="2.2" class="fb sb"/><circle cx="467" cy="57" r="2.2" class="fb sb"/><circle cx="507" cy="105" r="2.2" class="fr sr"/><circle cx="454" cy="118" r="2.2" class="fr sr"/><circle cx="441" cy="35" r="2.2" class="fb sb"/><circle cx="441" cy="47" r="2.2" class="fb sb"/><circle cx="469" cy="131" r="2.2" class="fr sr"/><circle cx="480" cy="77" r="2.2" class="fb sb"/><circle cx="514" cy="86" r="2.2" class="fr sr"/><circle cx="491" cy="128" r="2.2" class="fr sr"/><rect x="532" y="22" width="122" height="122" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.25"/><text x="593.0" y="15" text-anchor="middle" font-size="12">circles</text><circle cx="587" cy="102" r="2.2" class="fr sr"/><circle cx="613" cy="66" r="2.2" class="fr sr"/><circle cx="590" cy="66" r="2.2" class="fr sr"/><circle cx="553" cy="54" r="2.2" class="fb sb"/><circle cx="543" cy="95" r="2.2" class="fb sb"/><circle cx="616" cy="129" r="2.2" class="fb sb"/><circle cx="607" cy="132" r="2.2" class="fb sb"/><circle cx="607" cy="73" r="2.2" class="fr sr"/><circle cx="608" cy="99" r="2.2" class="fr sr"/><circle cx="577" cy="87" r="2.2" class="fr sr"/><circle cx="613" cy="70" r="2.2" class="fr sr"/><circle cx="613" cy="86" r="2.2" class="fr sr"/><circle cx="605" cy="134" r="2.2" class="fb sb"/><circle cx="569" cy="92" r="2.2" class="fr sr"/><circle cx="600" cy="34" r="2.2" class="fb sb"/><circle cx="553" cy="120" r="2.2" class="fb sb"/><circle cx="592" cy="103" r="2.2" class="fr sr"/><circle cx="629" cy="121" r="2.2" class="fb sb"/><circle cx="583" cy="105" r="2.2" class="fr sr"/><circle cx="624" cy="118" r="2.2" class="fb sb"/><circle cx="573" cy="93" r="2.2" class="fr sr"/><circle cx="614" cy="36" r="2.2" class="fb sb"/><circle cx="586" cy="98" r="2.2" class="fr sr"/><circle cx="584" cy="133" r="2.2" class="fb sb"/><circle cx="555" cy="116" r="2.2" class="fb sb"/><circle cx="579" cy="33" r="2.2" class="fb sb"/><circle cx="613" cy="82" r="2.2" class="fr sr"/><circle cx="590" cy="64" r="2.2" class="fr sr"/><circle cx="572" cy="82" r="2.2" class="fr sr"/><circle cx="588" cy="30" r="2.2" class="fb sb"/><circle cx="549" cy="113" r="2.2" class="fb sb"/><circle cx="632" cy="114" r="2.2" class="fb sb"/><circle cx="574" cy="93" r="2.2" class="fr sr"/><circle cx="584" cy="100" r="2.2" class="fr sr"/><circle cx="580" cy="128" r="2.2" class="fb sb"/><circle cx="612" cy="73" r="2.2" class="fr sr"/><circle cx="631" cy="53" r="2.2" class="fb sb"/><circle cx="559" cy="48" r="2.2" class="fb sb"/><circle cx="547" cy="59" r="2.2" class="fb sb"/><circle cx="595" cy="97" r="2.2" class="fr sr"/><circle cx="579" cy="100" r="2.2" class="fr sr"/><circle cx="612" cy="73" r="2.2" class="fr sr"/><circle cx="591" cy="107" r="2.2" class="fr sr"/><circle cx="561" cy="121" r="2.2" class="fb sb"/><circle cx="613" cy="94" r="2.2" class="fr sr"/><circle cx="585" cy="63" r="2.2" class="fr sr"/><circle cx="637" cy="109" r="2.2" class="fb sb"/><circle cx="601" cy="61" r="2.2" class="fr sr"/><circle cx="625" cy="46" r="2.2" class="fb sb"/><circle cx="567" cy="121" r="2.2" class="fb sb"/><circle cx="585" cy="39" r="2.2" class="fb sb"/><circle cx="598" cy="99" r="2.2" class="fr sr"/><circle cx="589" cy="106" r="2.2" class="fr sr"/><circle cx="626" cy="47" r="2.2" class="fb sb"/><circle cx="576" cy="96" r="2.2" class="fr sr"/><circle cx="602" cy="100" r="2.2" class="fr sr"/><circle cx="639" cy="57" r="2.2" class="fb sb"/><circle cx="573" cy="90" r="2.2" class="fr sr"/><circle cx="608" cy="100" r="2.2" class="fr sr"/><circle cx="635" cy="107" r="2.2" class="fb sb"/><circle cx="549" cy="56" r="2.2" class="fb sb"/><circle cx="612" cy="129" r="2.2" class="fb sb"/><circle cx="576" cy="80" r="2.2" class="fr sr"/><circle cx="569" cy="88" r="2.2" class="fr sr"/><circle cx="549" cy="71" r="2.2" class="fb sb"/><circle cx="636" cy="55" r="2.2" class="fb sb"/><circle cx="606" cy="33" r="2.2" class="fb sb"/><circle cx="540" cy="81" r="2.2" class="fb sb"/><circle cx="604" cy="96" r="2.2" class="fr sr"/><circle cx="559" cy="124" r="2.2" class="fb sb"/><circle cx="624" cy="43" r="2.2" class="fb sb"/><circle cx="589" cy="135" r="2.2" class="fb sb"/><circle cx="582" cy="67" r="2.2" class="fr sr"/><circle cx="580" cy="71" r="2.2" class="fr sr"/><circle cx="588" cy="65" r="2.2" class="fr sr"/><circle cx="605" cy="68" r="2.2" class="fr sr"/><circle cx="573" cy="86" r="2.2" class="fr sr"/><circle cx="594" cy="65" r="2.2" class="fr sr"/><circle cx="560" cy="40" r="2.2" class="fb sb"/><circle cx="593" cy="59" r="2.2" class="fr sr"/><circle cx="599" cy="98" r="2.2" class="fr sr"/><circle cx="550" cy="57" r="2.2" class="fb sb"/><circle cx="605" cy="103" r="2.2" class="fr sr"/><circle cx="642" cy="99" r="2.2" class="fb sb"/><circle cx="574" cy="76" r="2.2" class="fr sr"/><circle cx="588" cy="109" r="2.2" class="fr sr"/><circle cx="544" cy="99" r="2.2" class="fb sb"/><circle cx="573" cy="95" r="2.2" class="fr sr"/><circle cx="610" cy="95" r="2.2" class="fr sr"/><circle cx="607" cy="69" r="2.2" class="fr sr"/><circle cx="630" cy="47" r="2.2" class="fb sb"/><circle cx="612" cy="74" r="2.2" class="fr sr"/><circle cx="570" cy="37" r="2.2" class="fb sb"/><circle cx="542" cy="104" r="2.2" class="fb sb"/><circle cx="640" cy="71" r="2.2" class="fb sb"/><circle cx="604" cy="103" r="2.2" class="fr sr"/><circle cx="604" cy="97" r="2.2" class="fr sr"/><circle cx="570" cy="80" r="2.2" class="fr sr"/><circle cx="612" cy="130" r="2.2" class="fb sb"/><circle cx="592" cy="107" r="2.2" class="fr sr"/><circle cx="580" cy="74" r="2.2" class="fr sr"/><circle cx="598" cy="65" r="2.2" class="fr sr"/><circle cx="570" cy="80" r="2.2" class="fr sr"/><circle cx="582" cy="68" r="2.2" class="fr sr"/><circle cx="594" cy="104" r="2.2" class="fr sr"/><circle cx="595" cy="61" r="2.2" class="fr sr"/><circle cx="557" cy="57" r="2.2" class="fb sb"/><circle cx="580" cy="106" r="2.2" class="fr sr"/><circle cx="560" cy="46" r="2.2" class="fb sb"/><circle cx="546" cy="77" r="2.2" class="fb sb"/><circle cx="645" cy="88" r="2.2" class="fb sb"/><circle cx="599" cy="33" r="2.2" class="fb sb"/><circle cx="601" cy="103" r="2.2" class="fr sr"/><circle cx="588" cy="65" r="2.2" class="fr sr"/><circle cx="538" cy="83" r="2.2" class="fb sb"/><circle cx="555" cy="114" r="2.2" class="fb sb"/><circle cx="581" cy="73" r="2.2" class="fr sr"/><circle cx="633" cy="48" r="2.2" class="fb sb"/><circle cx="614" cy="95" r="2.2" class="fr sr"/><circle cx="578" cy="102" r="2.2" class="fr sr"/><text x="330" y="164" text-anchor="middle" class="tm" font-size="11">colour = the true group (120 of 300 points drawn, after standard scaling)</text></svg><figcaption>Five shapes of "group": round blobs, stretched (elongated) blobs, groups of unequal size and spread, two interleaved moons, and a ring around a core.</figcaption></figure>
  <p>Now run five algorithms on each, giving each the true number of groups where it needs one, and score with ARI. K-Means and Ward linkage both look for compact groups around centres; single linkage chains neighbours together; DBSCAN looks for crowded regions; a Gaussian mixture (GMM) fits oval clouds. Each has its own note later in this group.</p>
<div class="fx" data-lang="py">from sklearn.datasets import make_blobs, make_moons, make_circles
from sklearn.cluster import AgglomerativeClustering, DBSCAN
from sklearn.mixture import GaussianMixture

X1, y1 = make_blobs(300, centers=3, cluster_std=0.8, random_state=1)
X2, y2 = make_blobs(300, centers=3, random_state=170)
X2 = X2 @ np.array([[0.6, -0.64], [-0.41, 0.85]])                  # stretch the blobs
X3, y3 = make_blobs([200, 60, 40], centers=[[0, 0], [5, 0], [0, 5]],
                    cluster_std=[2.0, 0.4, 0.4], random_state=3)     # unequal size and spread
X4, y4 = make_moons(300, noise=0.06, random_state=0)
X5, y5 = make_circles(300, factor=0.4, noise=0.05, random_state=0)
data = {"round blobs": (X1, y1, 3), "stretched": (X2, y2, 3), "unequal": (X3, y3, 3),
        "moons": (X4, y4, 2), "circles": (X5, y5, 2)}

def algos(k):
    return {"k-means": KMeans(k, n_init=10, random_state=0),
            "ward": AgglomerativeClustering(k, linkage="ward"),
            "single": AgglomerativeClustering(k, linkage="single"),
            "DBSCAN": DBSCAN(eps=0.3, min_samples=5),
            "GMM": GaussianMixture(k, covariance_type="full", random_state=0)}

print(f"{'data':12s}" + "".join(f"{a:&gt;9s}" for a in algos(2)))
for name, (Xd, y, k) in data.items():
    Xd = StandardScaler().fit_transform(Xd)
    row = [adjusted_rand_score(y, m.fit_predict(Xd)) for m in algos(k).values()]
    print(f"{name:12s}" + "".join(f"{r:9.2f}" for r in row))</div>
  <div class="fx" data-lang="text">data          k-means     ward   single   DBSCAN      GMM
round blobs      0.99     0.99     0.99     0.99     0.99
stretched        0.51     0.47     0.57     0.57     1.00
unequal          0.37     0.54    -0.01     0.40     0.88
moons            0.47     0.21     1.00     0.99     0.48
circles         -0.00    -0.00     1.00     0.86    -0.00</div>
  <p>Read the table row by row. On round, well-separated blobs every method scores 0.99: every idea of "group" agrees on easy data, which is exactly why toy demos mislead. On stretched blobs K-Means manages only 0.51, because it assumes round groups and cuts across the long ones, while the GMM learns the tilt of each ellipse and scores a perfect 1.00. On unequal groups K-Means puts each border halfway between centres, so the big loose group spills into the small tight ones (0.37); the GMM, which learns each group's own spread, gets 0.88, while single linkage collapses to −0.01 because it chains stragglers to everything. On moons and circles the picture flips: single linkage scores 1.00 and DBSCAN 0.99 and 0.86, because a moon is a chain of close neighbours, not a blob around a centre. On the circles both rings share the <em>same</em> centre, so every "nearest centre" method is helpless (0.00).</p>
  <p>No column wins every row. Single linkage is perfect on moons and worthless on unequal blobs; the GMM is best on ellipses and fails on rings. The lesson is the most important sentence in this note: <strong>choosing an algorithm means choosing what you believe a group looks like</strong>. And without true labels you cannot even rely on scores to warn you. The <strong>silhouette score</strong> (defined in <a class="xref" data-note="ml_kmeans">K-Means</a> and <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a>) is the most common label-free score; see what it says about the moons:</p>
<div class="fx" data-lang="py">from sklearn.metrics import silhouette_score
Xm, ym = make_moons(300, noise=0.06, random_state=0)
Xm = StandardScaler().fit_transform(Xm)
km_lab = KMeans(2, n_init=10, random_state=0).fit_predict(Xm)
print("k-means split: ARI", round(adjusted_rand_score(ym, km_lab), 2), "  silhouette", round(silhouette_score(Xm, km_lab), 2))
print("true moons   : ARI 1.0   silhouette", round(silhouette_score(Xm, ym), 2))</div>
  <div class="fx" data-lang="text">k-means split: ARI 0.47   silhouette 0.49
true moons   : ARI 1.0   silhouette 0.38</div>
  <p>The wrong K-Means split (ARI 0.47) earns a <em>higher</em> silhouette (0.49) than the true moons (0.38). The silhouette shares K-Means' love of round, separated blobs, so it prefers the wrong answer. On real data, plot a 2-D projection (PCA or UMAP) and look before trusting any score.</p>

  <h2 id="cl-tax"><span class="num">10</span>The Four Families</h2>
  <p>The five algorithms above belong to four broad families, each built on a different answer to "what is a group?". Knowing the families, rather than a list of algorithms, is what lets you pick sensibly.</p>
<figure class="viz"><svg viewBox="0 0 660 250" width="660">
<rect x="8" y="8" width="155" height="200" rx="8" class="fb sb" fill-opacity="0.35"/><text x="85" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Centroid</text>
<circle cx="55" cy="80" r="3" class="fb sb"/><circle cx="45" cy="95" r="3" class="fb sb"/><circle cx="65" cy="98" r="3" class="fb sb"/><circle cx="58" cy="65" r="3" class="fb sb"/><circle cx="40" cy="75" r="3" class="fb sb"/>
<circle cx="115" cy="120" r="3" class="fr sr"/><circle cx="125" cy="135" r="3" class="fr sr"/><circle cx="105" cy="138" r="3" class="fr sr"/><circle cx="128" cy="115" r="3" class="fr sr"/><circle cx="112" cy="150" r="3" class="fr sr"/>
<rect x="49" y="78" width="9" height="9" class="fb sb" stroke-width="2"/><rect x="113" y="127" width="9" height="9" class="fr sr" stroke-width="2"/>
<line x1="30" y1="160" x2="145" y2="55" stroke="currentColor" stroke-dasharray="4 3"/>
<text x="85" y="180" text-anchor="middle" font-size="10.5" class="tm">nearest centre wins</text><text x="85" y="196" text-anchor="middle" font-size="10.5" class="tb">K-Means, k-medoids</text>
<rect x="172" y="8" width="155" height="200" rx="8" class="ft st" fill-opacity="0.6"/><text x="250" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Hierarchical</text>
<path d="M195,150 V135 H215 V150" fill="none" stroke="currentColor"/><path d="M235,150 V128 H255 V150" fill="none" stroke="currentColor"/><path d="M285,150 V120 H305 V150" fill="none" stroke="currentColor"/>
<path d="M205,135 V95 H245 V128" fill="none" stroke="currentColor"/><path d="M225,95 V60 H295 V120" fill="none" stroke="currentColor"/>
<line x1="185" y1="110" x2="315" y2="110" class="sr" stroke-dasharray="4 3"/>
<text x="250" y="180" text-anchor="middle" font-size="10.5" class="tm">merge closest groups → tree</text><text x="250" y="196" text-anchor="middle" font-size="10.5" class="tb">Agglomerative, divisive</text>
<rect x="336" y="8" width="155" height="200" rx="8" class="fg sg" fill-opacity="0.6"/><text x="413" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Density</text>
<path d="M360,120 Q385,60 420,90 T470,80" fill="none" class="sb" stroke-width="9" stroke-opacity="0.35"/>
<circle cx="365" cy="112" r="3" class="fb sb"/><circle cx="375" cy="92" r="3" class="fb sb"/><circle cx="390" cy="76" r="3" class="fb sb"/><circle cx="408" cy="80" r="3" class="fb sb"/><circle cx="425" cy="93" r="3" class="fb sb"/><circle cx="443" cy="92" r="3" class="fb sb"/><circle cx="460" cy="82" r="3" class="fb sb"/>
<circle cx="372" cy="150" r="3" class="fs" stroke="currentColor"/><circle cx="470" cy="140" r="3" class="fs" stroke="currentColor"/><text x="430" y="150" font-size="10" class="tm">noise</text>
<text x="413" y="180" text-anchor="middle" font-size="10.5" class="tm">crowded regions; lonely = noise</text><text x="413" y="196" text-anchor="middle" font-size="10.5" class="tb">DBSCAN, HDBSCAN, OPTICS</text>
<rect x="500" y="8" width="152" height="200" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="576" y="28" text-anchor="middle" font-size="12.5" font-weight="700">Distribution</text>
<ellipse cx="555" cy="90" rx="38" ry="18" transform="rotate(-25 555 90)" fill="none" class="sb" stroke-width="2"/><ellipse cx="555" cy="90" rx="22" ry="10" transform="rotate(-25 555 90)" fill="none" class="sb"/>
<ellipse cx="605" cy="130" rx="22" ry="22" fill="none" class="sr" stroke-width="2"/><ellipse cx="605" cy="130" rx="12" ry="12" fill="none" class="sr"/>
<text x="576" y="180" text-anchor="middle" font-size="10.5" class="tm">soft bell-shaped clouds</text><text x="576" y="196" text-anchor="middle" font-size="10.5" class="tb">GMM (EM algorithm)</text>
<text x="330" y="236" text-anchor="middle" class="tm" font-size="11">Also: graph-based (spectral clustering), grid-based (STING), and model-free tricks (BIRCH summaries for huge data).</text>
</svg><figcaption>Four answers to "what is a group?". Each family has one algorithm you must know, and each has its own note in this group.</figcaption></figure>
  <p>In the <strong>centroid</strong> family a group is everything nearest to a centre point; <a class="xref" data-note="ml_kmeans">K-Means</a> is the main algorithm, it needs k up front, finds round groups of similar size, forces outliers into some group, and scales to millions of rows. In the <strong>hierarchical</strong> (connectivity) family a group is a branch of a tree built by repeatedly merging the closest groups; <a class="xref" data-note="ml_hierarchical">Hierarchical Clustering</a> needs no k up front (you cut the tree later), accepts any distance, and stops at tens of thousands of rows. In the <strong>density</strong> family a group is a crowded region separated by sparse space; <a class="xref" data-note="ml_dbscan">DBSCAN &amp; HDBSCAN</a> find any shape and label lonely rows as noise (label −1). In the <strong>distribution</strong> family a group is one bell-shaped cloud in a mixture of clouds; <a class="xref" data-note="ml_gmm">Gaussian Mixture Models</a> give soft probabilities and oval groups of different sizes. These notes are best read in that order, with <a class="xref" data-note="ml_cluster_eval">Evaluating Clusters</a> last, since it judges all of them.</p>
  <p>The families are related more closely than their names suggest. K-Means is a GMM with equal round clouds and hard assignments. Ward linkage, a hierarchical method, minimises the same quantity as K-Means one merge at a time. Single linkage and DBSCAN both chain neighbours together, and HDBSCAN is literally a hierarchy over densities. Two smaller families are worth one line each: <strong>graph-based</strong> methods such as spectral clustering cut a neighbour graph where few edges cross (good on rings, costly for large n), and <strong>grid-based</strong> methods merge dense cells of a grid. Methods that summarise each group with a few numbers (K-Means' centres, GMM's means and covariances) are called <strong>parametric</strong> and can label new rows cheaply; DBSCAN and hierarchical clustering describe groups only through their training rows and have no <code>predict</code>.</p>
  <p>Here is one algorithm from each family on our six customers, with age and income standard-scaled, each asked for two groups:</p>
<div class="fx" data-lang="py">Z6 = StandardScaler().fit_transform(cust[["age", "income"]])     # our six customers, scaled
families = {"centroid     (k-means)": KMeans(2, n_init=10, random_state=0),
            "hierarchical (single)":  AgglomerativeClustering(2, linkage="single"),
            "density      (DBSCAN)":  DBSCAN(eps=0.6, min_samples=2),
            "distribution (GMM)":     GaussianMixture(2, random_state=0)}
for name, model in families.items():
    print(f"{name:24s}", dict(zip(cust.index, model.fit_predict(Z6).tolist())))</div>
  <div class="fx" data-lang="text">centroid     (k-means)   {'A': 1, 'B': 0, 'C': 0, 'D': 0, 'E': 1, 'F': 0}
hierarchical (single)    {'A': 1, 'B': 0, 'C': 0, 'D': 0, 'E': 1, 'F': 0}
density      (DBSCAN)    {'A': 0, 'B': -1, 'C': 1, 'D': -1, 'E': 0, 'F': 1}
distribution (GMM)       {'A': 1, 'B': 0, 'C': 0, 'D': 0, 'E': 1, 'F': 0}</div>
  <p>Three families agree: {A, E}, the young low-income pair, against {B, C, D, F}. DBSCAN, told that a dense patch needs at least 2 customers within 0.6 of each other, finds two tight pairs, {A, E} and {C, F}, and labels B and D <strong>noise</strong> (−1): neither has a neighbour within 0.6 (B's nearest, D, is 1.22 away). Compare section 06, where Gower distance put B with A and E. Same customers, three different stories about B. That is not a bug. B really is a borderline customer, and each ruler and family answers a slightly different question about him. "Which algorithm is best?" therefore has no answer without the data; the honest interview answer is "it depends on what I believe a group looks like, how many rows I have, whether I know k, whether outliers matter, and whether I must label new rows later".</p>

  <h2 id="cl-flow"><span class="num">11</span>A Clustering Project, End to End</h2>
  <p>Six customers can be grouped by eye. Mrs. Kulkarni's full list has 600. This section puts the earlier decisions in the order a real project makes them: state the goal, choose features tied to that goal, clean and encode them, scale them, reduce dimensions if there are many, choose a distance and an algorithm, choose k or the algorithm's settings, evaluate, profile and name the groups, and finally deploy and monitor.</p>
  <p>The first step is the one people skip. "Segment our customers" is not a goal. "Find three to five groups of customers who should get different discount offers" is a goal: it tells you to use buying behaviour (visits, order size), and it tells you that twenty segments would be useless however good their score. Here are 600 customers with three hidden types. Scaling and K-Means are joined in one pipeline, so new customers are scaled with exactly the same numbers; a silhouette scan (higher is better, maximum 1) helps choose k; and a profile table, the average of each column per segment, explains the result:</p>
<div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.metrics import silhouette_score

rng = np.random.default_rng(7)
n = [300, 200, 100]                                             # three hidden customer types
shop = pd.DataFrame({
    "age":    np.r_[rng.normal(24, 3, n[0]), rng.normal(38, 5, n[1]), rng.normal(52, 6, n[2])],
    "visits": np.r_[rng.poisson(14, n[0]), rng.poisson(4, n[1]), rng.poisson(2, n[2])],
    "order":  np.r_[rng.normal(400, 80, n[0]), rng.normal(1500, 250, n[1]), rng.normal(4000, 600, n[2])]})

Zs = StandardScaler().fit_transform(shop)
for k in [2, 3, 4, 5]:                                          # a quick silhouette scan for k
    print(f"k={k} silhouette={silhouette_score(Zs, KMeans(k, n_init=10, random_state=0).fit_predict(Zs)):.3f}")

pipe = make_pipeline(StandardScaler(), KMeans(3, n_init=10, random_state=0)).fit(shop)
shop["segment"] = pipe.predict(shop)
print(shop.groupby("segment").agg(customers=("age", "size"), age=("age", "mean"),
                                  visits=("visits", "mean"), order=("order", "mean")).round(0))
new = pd.DataFrame({"age": [23, 55], "visits": [12, 1], "order": [350, 4200]})
print("new customers -&gt;", pipe.predict(new))</div>
  <div class="fx" data-lang="text">k=2 silhouette=0.582
k=3 silhouette=0.628
k=4 silhouette=0.533
k=5 silhouette=0.436
         customers   age  visits   order
segment                                 
0              201  37.0     4.0  1494.0
1              299  24.0    14.0   399.0
2              100  51.0     2.0  4144.0
new customers -&gt; [1 2]</div>
  <p>The silhouette peaks at k = 3 (0.628). The profile table is the part Mrs. Kulkarni actually reads. Segment 1 (299 customers) are about 24 years old, visit 14 times a month and spend about ₹400 a visit: "frequent small-basket students". Segment 0 (201) are about 37, visit 4 times and spend about ₹1,500: "monthly family shoppers". Segment 2 (100) are about 51, visit twice and spend about ₹4,100: "big occasional buyers". The two new customers are routed through the same scaler and centres to segments 1 and 2, which matches their numbers.</p>
  <p>A clustering is finished when every group can be described in one sentence a manager understands, and the groups would be treated differently. If two segments would get the same offer, merge them; if a segment cannot be described, the features or k are wrong. And remember that segment numbers are arbitrary labels: re-run with another seed or next month's data and "segment 1" may come back as "segment 2", so never hard-code business rules on the raw ids; match new groups to old ones by their profiles.</p>

  <h2 id="cl-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most dangerous mistake is believing that groups exist because an algorithm returned them. Here K-Means is asked for five groups in 500 completely random dots:</p>
<div class="fx" data-lang="py">rng = np.random.default_rng(1)
noise = rng.uniform(size=(500, 2))                         # 500 random dots: no groups at all
km = KMeans(5, n_init=10, random_state=0).fit(noise)
print("group sizes:", np.bincount(km.labels_))
from sklearn.metrics import silhouette_score
print("silhouette:", round(silhouette_score(noise, km.labels_), 3))</div>
  <div class="fx" data-lang="text">group sizes: [ 94  92 107  90 117]
silhouette: 0.405</div>
  <p>Five tidy groups of about 100, and a silhouette of 0.405, which many people would accept as "reasonable structure". There is no structure at all. Before presenting clusters, compare the score with what the same algorithm gets on random data of the same shape (the idea behind the gap statistic in <a class="xref" data-note="ml_kmeans">K-Means</a>), check that the groups survive a different seed or a resample, and check that their profiles differ in ways that matter.</p>
  <p>A second mistake is fitting the scaler again on new data. The scaler learned the training mean and spread; new customers must be measured with that same yardstick:</p>
<div class="fx" data-lang="py">old = cust[["age", "income"]]
new = pd.DataFrame({"age": [26, 27], "income": [41000, 43000]}, index=["G", "H"])   # two young Pune-like customers
scaler = StandardScaler().fit(old)
print("same scaler as training :", scaler.transform(new).round(2).tolist())
print("scaler re-fit on new rows:", StandardScaler().fit_transform(new).round(2).tolist())</div>
  <div class="fx" data-lang="text">same scaler as training : [[-1.41, -0.97], [-1.32, -0.91]]
scaler re-fit on new rows: [[-1.0, -1.0], [1.0, 1.0]]</div>
  <p>With the training scaler, the two new young customers land at about (−1.4, −0.95), right next to A and E, where they belong. Re-fitting the scaler on just these two rows turns them into (−1, −1) and (1, 1), as if one were young and the other old; any centres learned earlier no longer mean the same thing. Keep the scaler and the clustering model together in one pipeline and only call <code>predict</code> on new rows.</p>
  <p>The other common mistakes have already appeared. Forgetting to scale lets the widest column decide everything (raw rupees gave ARI −0.002). Scaling blindly can be just as bad (robust scaling on a bimodal column). One-hot encoding categories and using Euclidean distance lets a big one-hot block dominate and gives K-Means meaningless centres such as "0.4 Pune"; use Gower with a precomputed-distance algorithm, or k-prototypes. Using Euclidean on spending mixes, text or embeddings lets size dominate; use cosine. Using simple matching on sparse yes/no data makes everyone look alike; use Jaccard. Clustering hundreds of raw columns runs into distance concentration; select or reduce first. And judging an algorithm on round toy blobs, where everything scores 0.99, tells you nothing about real data.</p>

  <h2 id="cl-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Clustering</b>: splitting unlabelled rows into groups that are alike inside and different across (unsupervised).</li>
    <li><b>Hard / soft / hierarchical</b>: one group per row / a share in every group / a tree of nested groups.</li>
    <li><b>Distance</b>: 0 for identical rows, larger for more different rows; similarity is the reverse (d = 1 − s).</li>
    <li><b>Metric</b>: d ≥ 0; d = 0 only if x = y; d(x, y) = d(y, x); d(x, z) ≤ d(x, y) + d(y, z). Squared Euclidean and cosine distance are not metrics.</li>
    <li><b>Distance matrix</b>: n × n table of all pairwise distances; n(n − 1)/2 distinct values, so memory grows with n².</li>
    <li><b>Distance concentration</b>: in many dimensions nearest and farthest neighbours become almost equally far.</li>
  </ul>
  <h3>Formulas and our numbers</h3>
  <table class="tbl">
    <tr><th>Measure</th><th>Formula</th><th>Running example</th><th>Use for</th></tr>
    <tr><td>Euclidean (L2)</td><td>√Σ(xᵢ − yᵢ)²</td><td>A(25, 40)–D(45, 80): 44.72</td><td>scaled numeric data, K-Means, Ward</td></tr>
    <tr><td>Manhattan (L1)</td><td>Σ|xᵢ − yᵢ|</td><td>60</td><td>independent costs, a big gap in one column</td></tr>
    <tr><td>Minkowski (Lp)</td><td>(Σ|xᵢ − yᵢ|ᵖ)^(1/p)</td><td>p = 3: 41.60</td><td>a dial between L1 and L∞</td></tr>
    <tr><td>Chebyshev (L∞)</td><td>max|xᵢ − yᵢ|</td><td>40</td><td>"the worst gap matters"</td></tr>
    <tr><td>Cosine</td><td>a·b / (‖a‖‖b‖)</td><td>spend A–B 1.0, A–C 0.423</td><td>mixes, text, embeddings</td></tr>
    <tr><td>Jaccard</td><td>|S∩T| / |S∪T|</td><td>baskets A–E 0.75, A–B 0.4 (SMC 0.7)</td><td>sets, sparse yes/no</td></tr>
    <tr><td>Gower</td><td>average of |Δ|/range and 0/1 mismatches</td><td>A–E 0.031, A–B 0.491</td><td>mixed tables, small n</td></tr>
  </table>
  <h3>Scalers</h3>
  <table class="tbl">
    <tr><th>Scaler</th><th>Formula</th><th>Watch out</th></tr>
    <tr><td>Standard</td><td>(x − mean) / std</td><td>outliers inflate the std</td></tr>
    <tr><td>Min-max</td><td>(x − min) / (max − min)</td><td>one outlier squashes the rest</td></tr>
    <tr><td>Robust</td><td>(x − median) / IQR</td><td>shrinks bimodal columns</td></tr>
  </table>
  <h3>The four families</h3>
  <table class="tbl">
    <tr><th>Family</th><th>A group is…</th><th>Needs k</th><th>Shapes</th><th>Outliers</th><th>Scale</th></tr>
    <tr><td>Centroid (K-Means)</td><td>everything nearest a centre</td><td>yes</td><td>round, similar size</td><td>forced in</td><td>millions</td></tr>
    <tr><td>Hierarchical</td><td>a branch of a merge tree</td><td>no, cut later</td><td>depends on linkage</td><td>forced in</td><td>~10⁴</td></tr>
    <tr><td>Density (DBSCAN)</td><td>a crowded region</td><td>no</td><td>any</td><td>noise (−1)</td><td>~10⁵–10⁶</td></tr>
    <tr><td>Distribution (GMM)</td><td>one bell-shaped cloud</td><td>yes</td><td>ellipses</td><td>low probability</td><td>~10⁵</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.metrics import pairwise_distances
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler, normalize
from sklearn.pipeline import make_pipeline
from sklearn.cluster import KMeans, AgglomerativeClustering

D = pairwise_distances(X, metric="euclidean")          # also "manhattan", "cosine", "jaccard" (bool)
U = normalize(X)                                        # unit rows: Euclidean now ranks like cosine
pipe = make_pipeline(StandardScaler(), KMeans(3, n_init=10, random_state=0)).fit(X)
labels = AgglomerativeClustering(2, metric="precomputed", linkage="average").fit_predict(G)  # e.g. Gower</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Every algorithm returns groups, even on random noise (silhouette 0.405 on pure noise).</li>
    <li>Unscaled columns: the widest one decides. Scaling = choosing weights.</li>
    <li>Fit the scaler once; reuse it for new rows.</li>
    <li>Euclidean on mixes or text lets size dominate; SMC is inflated by shared zeros.</li>
    <li>Internal scores like silhouette prefer round blobs (moons: wrong split 0.49 vs true 0.38).</li>
    <li>Segment ids are arbitrary; name groups by their profiles.</li>
  </ul>

  <h2 id="cl-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is clustering, and how is it different from classification?</summary><div class="qa-body">Clustering groups rows that are similar when there is no answer column; it is unsupervised. Classification learns to predict a known label from examples; it is supervised. Because clustering has no correct answer to compare with, it is judged by internal scores, stability and, above all, whether the groups are useful.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a clustering "good"?</summary><div class="qa-body">Rows inside a group should be close (compact) and rows in different groups far apart (separated); these two pull against each other, since one row per group is perfectly compact and one big group has no separation. Beyond the numbers, the groups must be describable and lead to different actions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between hard, soft and hierarchical clustering?</summary><div class="qa-body">Hard clustering gives each row exactly one group (K-Means, DBSCAN). Soft clustering gives each row a probability for every group, summing to 1 (GMM, fuzzy c-means). Hierarchical clustering gives a tree of nested groups that can be cut at any level.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute Euclidean, Manhattan and Chebyshev distance between (25, 40) and (45, 80).</summary><div class="qa-body">The gaps are 20 and 40. Euclidean is √(400 + 1600) = 44.72, Manhattan is 20 + 40 = 60, and Chebyshev is the larger gap, 40. Minkowski with p = 3 gives 41.60, between Euclidean and Chebyshev, because larger p gives the biggest gap more weight.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a metric, and is squared Euclidean distance one?</summary><div class="qa-body">A metric is non-negative, zero only for identical points, symmetric, and obeys the triangle inequality. Squared Euclidean fails the triangle inequality: for our customers, A to D is 2,000 but the detour through E is only 1,746. It is fine as an objective (K-Means) but not for neighbour-search structures that rely on the triangle rule.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use cosine similarity instead of Euclidean distance?</summary><div class="qa-body">When the direction or mix matters and the size does not, as with text, embeddings and spending patterns. B spends three times what A spends in the same mix: cosine is 1.0, but Euclidean puts B farther from A than an electronics buyer. Do not use it when size is the signal, such as finding big spenders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How can you run K-Means with cosine distance when sklearn does not support it?</summary><div class="qa-body">Normalise every row to length 1 and run ordinary K-Means. For unit vectors, squared Euclidean distance equals 2 − 2·cosine, so nearest by Euclidean is nearest by cosine. This is often called spherical K-Means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use Jaccard instead of simple matching for shopping baskets?</summary><div class="qa-body">Simple matching counts items neither customer bought as agreement. With thousands of products almost every pair agrees on thousands of zeros, so everyone looks about 99.9% alike. Jaccard divides shared items by the items either bought and ignores shared absences (A and B: Jaccard 0.4 versus SMC 0.7).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you cluster a table with numbers and categories?</summary><div class="qa-body">Use Gower distance: per column, numeric gap divided by the range, 0/1 mismatch for categories, then average; then cluster the precomputed matrix with hierarchical clustering (average or complete linkage), k-medoids or DBSCAN. For large tables, use k-prototypes. One-hot plus Euclidean usually lets the one-hot block dominate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you scale features before K-Means or DBSCAN?</summary><div class="qa-body">These methods use distances, and the column with the largest numbers dominates them. In raw rupees B's nearest customer is E and age is ignored; after standard scaling it is D. In a 400-row test, unscaled K-Means scored ARI −0.002 and scaled K-Means 1.000.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is standard scaling always the right choice?</summary><div class="qa-body">No. Scaling decides how much each column counts. Robust scaling on a bimodal age column shrank the real groups below the noise and broke the clustering. Columns that duplicate each other or large one-hot blocks also act as hidden weights, so choose and check weights on purpose.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the curse of dimensionality for clustering.</summary><div class="qa-body">As the number of columns grows, distances concentrate: for random points the farthest neighbour was about 14 times the nearest in 2-D but only 11% farther in 1,000-D. When everything is equally far, nearest-centre and density rules become noise. Select features or reduce dimensions (PCA, UMAP) first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the four families of clustering algorithms.</summary><div class="qa-body">Centroid (K-Means: nearest centre), hierarchical (a tree of merges), density (DBSCAN: crowded regions, with noise), and distribution (GMM: a mixture of Gaussian clouds). They assume different shapes of group, so they can disagree on the same data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two interleaved half-moons: which algorithms work and why does K-Means fail?</summary><div class="qa-body">Single linkage and DBSCAN work (ARI about 1.0) because they chain close neighbours along each moon. K-Means gives each point to the nearest centre, so the border between two groups is a straight line, which cuts across both moons (ARI 0.47). Its silhouette even beats the true grouping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your algorithm returned five neat clusters. How do you know they are real?</summary><div class="qa-body">You do not, yet: K-Means returns neat groups even on random noise. Compare the score with the same algorithm on random data of the same shape, check stability across seeds and resamples, plot a 2-D projection, and check that the group profiles differ in ways that matter to the business.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you assign new customers to existing clusters?</summary><div class="qa-body">For K-Means or GMM, keep the fitted scaler and model in one pipeline and call <code>predict</code>. For methods without <code>predict</code> (hierarchical, DBSCAN), assign to the nearest cluster centroid or train a KNN classifier on the cluster labels. Never re-fit the scaler on the new rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Marketing asks for "customer segments". What do you ask before writing code?</summary><div class="qa-body">What decision will the segments drive, and how many can the team act on? Which behaviours matter for that decision? How will new customers be assigned and how often refreshed? The answers choose the features, the range of k, the algorithm (does it need to predict?) and how success is judged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is clustering related to K-Nearest Neighbours?</summary><div class="qa-body">Both rest on "close rows are alike" and need the same care with distance choice, scaling and dimensionality. KNN is supervised: neighbours vote on a known label. Clustering is unsupervised: neighbourhoods define the groups. DBSCAN even uses the same neighbour-search indexes.</div></details>
</main>
`
});
