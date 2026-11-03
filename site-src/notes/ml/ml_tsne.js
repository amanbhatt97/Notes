// notes/ml/ml_tsne.js — t-SNE
Object.assign(TOPIC_CONTENT, {
  "ml_tsne": `<main>
  <h1>t-SNE</h1>
  <div class="where"><span>Machine Learning</span><span>Dimensionality Reduction</span><span>t-SNE</span></div>
  <p class="lead">t-SNE, short for t-distributed Stochastic Neighbour Embedding, draws high-dimensional data as a two-dimensional map in which points that were neighbours stay neighbours. It produces the familiar "islands of clusters" pictures seen in papers about images, single cells and word embeddings, and it is one of the best tools for <em>looking</em> at data that has many columns. It is also one of the easiest tools to misread, so this page spends as much time on what a t-SNE plot cannot tell you as on how it is made. The running example is a set of 1,797 handwritten digits, each an 8 × 8 image with 64 pixel columns. We build the method piece by piece, with every piece computed by hand on a few numbers first, then run scikit-learn's version on the digits.</p>

  <h2 id="ts-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">t-SNE</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Goal</div>
        <ul>
          <li>A 2-D map for looking at data</li>
          <li>Keep local neighbours together</li>
          <li>Non-linear; no reusable mapping</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">High-D side</div>
        <ul>
          <li>Gaussian neighbour probabilities p(j|i)</li>
          <li>Perplexity = 2^entropy = effective neighbours</li>
          <li>σᵢ per point by binary search</li>
          <li>Symmetrise: pᵢⱼ = (p(j|i) + p(i|j)) / 2n</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Map side</div>
        <ul>
          <li>Student-t similarity qᵢⱼ ∝ 1/(1 + d²)</li>
          <li>Heavy tail fixes the crowding problem</li>
          <li>Minimise KL(P‖Q) by gradient descent</li>
          <li>Early exaggeration, momentum, PCA start</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading and limits</div>
        <ul>
          <li>Trust neighbours; not gaps, sizes or axes</li>
          <li>Try several perplexities</li>
          <li>Barnes–Hut O(n log n); PCA to 50 first</li>
          <li>No transform: never model features</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ts-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Visualisation Problem</span><span class="rm-sub">why PCA's picture of the digits fails</span></div></div>
      <div class="rm-item rm-done" data-target="ts-p"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Neighbour Probabilities</span><span class="rm-sub">turning distances into "who is my neighbour"</span></div></div>
      <div class="rm-item rm-done" data-target="ts-perp"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Perplexity and Symmetric Similarities</span><span class="rm-sub">one neighbourhood size for everyone</span></div></div>
      <div class="rm-item rm-done" data-target="ts-q"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Student-t Map and the Crowding Problem</span><span class="rm-sub">why the map uses a heavy-tailed curve</span></div></div>
      <div class="rm-item rm-done" data-target="ts-kl"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The KL Objective</span><span class="rm-sub">what the map is punished for</span></div></div>
      <div class="rm-item rm-done" data-target="ts-opt"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Optimisation</span><span class="rm-sub">the gradient, the tricks, a tiny t-SNE</span></div></div>
      <div class="rm-item rm-done" data-target="ts-digits"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">t-SNE on the Digits</span><span class="rm-sub">scikit-learn and its parameters</span></div></div>
      <div class="rm-item rm-done" data-target="ts-read"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Reading t-SNE Plots</span><span class="rm-sub">gaps and sizes lie</span></div></div>
      <div class="rm-item rm-done" data-target="ts-perpfx"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Perplexity, Randomness and Initialisation</span><span class="rm-sub">how stable is the picture?</span></div></div>
      <div class="rm-item rm-done" data-target="ts-cost"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Cost and Barnes–Hut</span><span class="rm-sub">making it affordable on big data</span></div></div>
      <div class="rm-item rm-done" data-target="ts-nofeat"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">No Transform: Not for Features</span><span class="rm-sub">why the map cannot feed a model</span></div></div>
      <div class="rm-item rm-done" data-target="ts-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">over-reading plots, one setting, leakage</span></div></div>
      <div class="rm-item rm-done" data-target="ts-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="ts-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on t-SNE</span></div></div>
    </div>
  </div>

  <h2 id="ts-problem"><span class="num">01</span>The Visualisation Problem</h2>
  <p>People understand data best by looking at it, but we can only look at two or three dimensions. The digits dataset that ships with scikit-learn contains <strong>1,797 images of handwritten digits</strong> from 0 to 9. Each image is 8 × 8 pixels, so each is a row of <strong>64 numbers</strong> (ink intensity from 0 to 16) and a point in a 64-dimensional space. We know which digit each image shows, but the methods on this page never see that label; we use it only afterwards, to check whether a map put images of the same digit together. Every example imports the data from a file called <code>digits.py</code>:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler
X, y = load_digits(return_X_y=True)        # 1,797 handwritten digits, 8x8 = 64 pixel columns
Xs = StandardScaler().fit_transform(X)</div>
  <p>The previous note, <a class="xref" data-note="ml_pca">PCA</a>, gave us the best <em>flat</em> picture of a dataset: rotate the axes and keep the two directions of greatest spread. Here is how well that picture shows the digits. We use two measurements throughout this page. The first is the accuracy of a 5-nearest-neighbour classifier that sees only the two map coordinates: if images of the same digit sit together on the map, a point's five nearest map neighbours will usually share its label. The second is <strong>trustworthiness</strong>, a score from 0 to 1 that asks, for each point's 10 nearest neighbours on the map, how many of them were also genuinely near in the original 64-dimensional space, with a penalty that grows the further down the true ranking an "impostor" neighbour was.</p>
  <div class="fx" data-lang="py">from sklearn.decomposition import PCA
from sklearn.manifold import trustworthiness
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from digits import X, y, Xs
print("shape:", X.shape)
pca = PCA(2).fit(Xs)
Z = pca.transform(Xs)
print("PCA's 2 components keep", round(pca.explained_variance_ratio_.sum(), 3), "of the variance")
knn = KNeighborsClassifier(5)
print("5-NN accuracy on the 2 PCA coordinates:", round(cross_val_score(knn, Z, y, cv=5).mean(), 3))
print("5-NN accuracy on all 64 pixels:        ", round(cross_val_score(knn, Xs, y, cv=5).mean(), 3))
print("trustworthiness of the PCA map:", round(trustworthiness(Xs, Z, n_neighbors=10), 3))</div>
  <div class="fx" data-lang="text">shape: (1797, 64)
PCA's 2 components keep 0.216 of the variance
5-NN accuracy on the 2 PCA coordinates: 0.514
5-NN accuracy on all 64 pixels:         0.944
trustworthiness of the PCA map: 0.816</div>
  <p>The two PCA components keep only 21.6% of the variance. A 5-NN classifier on those two coordinates scores 0.514, so on the PCA picture a digit's nearest neighbours have the right label only about half the time; the ten digits pile on top of each other. Yet the same classifier on all 64 pixels scores 0.944. The neighbourhoods <em>are</em> there in 64 dimensions; the flat projection destroyed them. The digits lie on a curved, clustered surface, and squashing it flat along straight lines lays different groups on top of each other, the way a crumpled sheet of paper pressed flat shows creases crossing each other.</p>
  <p>So we change what we ask of the map. Instead of preserving straight-line variance, we preserve the thing a person actually looks for in a scatter plot: <strong>who is next to whom</strong>. If an image's nearest neighbours in 64 dimensions are three other 7s, they should also be its nearest neighbours on paper. Far-apart relationships may be distorted; near ones must survive. Think of seating guests at a big wedding: college friends at one table, office colleagues at another, relatives at a third. Who shares a table is meaningful. Which table is near the stage, or how big a table looks, tells you little. A t-SNE map is that seating plan. The method was introduced by Laurens van der Maaten and Geoffrey Hinton in 2008, building on Hinton and Roweis's earlier SNE, and it works in four steps: turn high-dimensional distances into neighbour probabilities, place points randomly on a 2-D map, compute similar probabilities on the map, and move the points until the two sets of probabilities match.</p>

  <h2 id="ts-p"><span class="num">02</span>Neighbour Probabilities</h2>
  <p>"Keep neighbours" needs a precise meaning. A hard list such as "the 5 nearest images" treats the 1st and 5th neighbour alike and ignores the 6th completely. t-SNE instead gives every pair of points a soft number: the probability that point i would pick point j as its neighbour if it chose one at random, favouring close points.</p>
  <p>To build it, give every other point j a weight that falls off with distance along a bell curve (a Gaussian) centred on i, then divide each weight by the total so they add up to 1:</p>
  <p><strong>p(j|i) = exp(−dᵢⱼ² / 2σᵢ²) / Σₖ≠ᵢ exp(−dᵢₖ² / 2σᵢ²)</strong></p>
  <p>Here dᵢⱼ is the distance between i and j, and σᵢ (sigma) is the width of i's bell curve, how far its attention reaches. Read "p(j|i)" as "the probability of j, given that we are standing at i". By hand: image i has four other images at distances 1, 2, 3 and 6.</p>
  <table class="tbl">
    <tr><th>distance d</th><th>σ = 1: weight exp(−d²/2)</th><th>σ = 1: p(j|i)</th><th>σ = 2: weight exp(−d²/8)</th><th>σ = 2: p(j|i)</th></tr>
    <tr><td>1</td><td>0.6065</td><td>0.6065 / 0.7529 = 0.806</td><td>0.8825</td><td>0.484</td></tr>
    <tr><td>2</td><td>0.1353</td><td>0.180</td><td>0.6065</td><td>0.332</td></tr>
    <tr><td>3</td><td>0.0111</td><td>0.015</td><td>0.3247</td><td>0.178</td></tr>
    <tr><td>6</td><td>0.0000</td><td>0.000</td><td>0.0111</td><td>0.006</td></tr>
    <tr><td><b>sum</b></td><td>0.7529</td><td>1</td><td>1.8248</td><td>1</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
d = np.array([1.0, 2.0, 3.0, 6.0])          # distances from image i to four other images
def cond_probs(d, sigma):
    w = np.exp(-d ** 2 / (2 * sigma ** 2))  # bell-curve weight
    return w / w.sum()                      # normalise so they sum to 1
for s in (1.0, 2.0):
    print(f"sigma={s}: p(j|i) = {cond_probs(d, s).round(3)}")</div>
  <div class="fx" data-lang="text">sigma=1.0: p(j|i) = [0.806 0.18  0.015 0.   ]
sigma=2.0: p(j|i) = [0.484 0.332 0.178 0.006]</div>
  <p>With σ = 1, image i is 81% sure its neighbour is the closest image and essentially ignores the one at distance 6. With σ = 2 its attention spreads wider: the closest image still gets the most (48%), but the images at 2 and 3 get a real share. So σ decides how many neighbours a point effectively has. One σ for every point would be a mistake. In a dense region, such as hundreds of nearly identical 1s, a fixed σ would include a huge crowd; in a sparse region, such as a handful of oddly written 8s, the same σ might include nobody. Each point needs its own σᵢ, and the next section shows how t-SNE chooses it.</p>

  <h2 id="ts-perp"><span class="num">03</span>Perplexity and Symmetric Similarities</h2>
  <p>We want every point to consider "about the same number" of neighbours, whether it sits in a crowd or alone. To do that we need a way to count the effective number of neighbours in a soft probability list. The tool is <strong>entropy</strong>, H = −Σ p log₂ p, which measures how spread out a probability distribution is in bits (it appeared as the impurity measure in <a class="xref" data-note="ml_dtree">Decision Trees</a>). <strong>Perplexity</strong> is 2^H, which converts entropy into "how many equally likely choices this is worth". Check: four equally likely neighbours (0.25 each) have H = 2 bits and perplexity 2² = 4. For σ = 1 above, H = −(0.806 log₂ 0.806 + 0.180 log₂ 0.180 + 0.015 log₂ 0.015) = 0.251 + 0.445 + 0.091 = 0.786 bits, so perplexity is 2^0.786 = <strong>1.72</strong>: image i is effectively choosing among fewer than two neighbours. For σ = 2 it is 2.87.</p>
  <p>You choose one perplexity for the whole dataset (scikit-learn's default is 30), and t-SNE searches for each point's σᵢ so that its perplexity hits that target. Because perplexity grows steadily with σ, a <strong>binary search</strong> works: try the middle of a range, and if the perplexity is too high, search the lower half, otherwise the upper half. Target perplexity 2 for our image:</p>
  <div class="fx" data-lang="py">import numpy as np
d = np.array([1.0, 2.0, 3.0, 6.0])
def perplexity(sigma):
    w = np.exp(-d ** 2 / (2 * sigma ** 2)); p = w / w.sum()
    p = p[p &gt; 1e-12]
    return 2 ** (-(p * np.log2(p)).sum())      # 2 ** entropy
print("sigma=1:", round(perplexity(1.0), 2), "  sigma=2:", round(perplexity(2.0), 2))
lo, hi, target = 0.1, 10.0, 2.0                # binary search: which sigma gives perplexity 2?
for it in range(1, 8):
    mid = (lo + hi) / 2
    pm = perplexity(mid)
    print(f"try sigma={mid:.4f}: perplexity={pm:.3f} -&gt; {'too wide, shrink' if pm &gt; target else 'too narrow, widen'}")
    if pm &gt; target: hi = mid
    else: lo = mid</div>
  <div class="fx" data-lang="text">sigma=1: 1.72   sigma=2: 2.87
try sigma=5.0500: perplexity=3.882 -&gt; too wide, shrink
try sigma=2.5750: perplexity=3.226 -&gt; too wide, shrink
try sigma=1.3375: perplexity=2.276 -&gt; too wide, shrink
try sigma=0.7188: perplexity=1.231 -&gt; too narrow, widen
try sigma=1.0281: perplexity=1.776 -&gt; too narrow, widen
try sigma=1.1828: perplexity=2.045 -&gt; too wide, shrink
try sigma=1.1055: perplexity=1.914 -&gt; too narrow, widen</div>
  <p>The first line repeats the hand values (1.72 and 2.87). The search starts in the middle of [0.1, 10]: σ = 5.05 gives 3.88, too many neighbours, so it searches lower. Each step halves the range, and after seven steps σ is pinned between about 1.11 and 1.18. A point in a dense region ends up with a small σᵢ and a point in a sparse region with a large one. Think of asking every wedding guest to name their five closest friends in the room. A guest in a crowded hall only needs to look at the next table; a guest alone on the terrace has to look much further. Perplexity is the "five"; σ is how far each guest must look. This is how t-SNE adapts to density, and, as section 08 shows, it is also why t-SNE erases density differences from the final picture. Perplexity is not the number of clusters and not exactly a k-nearest-neighbour count; it is a smooth neighbourhood size, usually between 5 and 50, and it must be smaller than the number of points.</p>
  <p>Because each point has its own σ, the two directions of a pair disagree: i may see j as its closest neighbour while j, with a wider σ, barely notices i. The map needs one number per pair, so t-SNE averages the two directions and rescales so that all pairs together add up to 1: <strong>pᵢⱼ = (p(j|i) + p(i|j)) / 2n</strong>, where n is the number of points. This also protects outliers. An outlier's own row of p(j|outlier) still adds up to 1, so every pair involving it gets a share of at least 1/(2n), and it stays attached to the map instead of drifting away. By hand on three images at positions 0, 1 and 3 along one direction, with σ = 1 for all to keep the arithmetic simple:</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([0.0, 1.0, 3.0])                  # three images, positions along one direction
W = np.exp(-(x[:, None] - x[None, :]) ** 2 / 2) # sigma = 1 for everyone, for simplicity
np.fill_diagonal(W, 0)
Pc = W / W.sum(axis=1, keepdims=True)          # row i holds p(j|i)
print("conditional p(j|i):\\n", Pc.round(3))
P = (Pc + Pc.T) / (2 * len(x))                 # symmetric joint p_ij
print("joint p_ij:\\n", P.round(3), "  sum =", P.sum().round(3))</div>
  <div class="fx" data-lang="text">conditional p(j|i):
 [[0.    0.982 0.018]
 [0.818 0.    0.182]
 [0.076 0.924 0.   ]]
joint p_ij:
 [[0.    0.3   0.016]
 [0.3   0.    0.184]
 [0.016 0.184 0.   ]]   sum = 1.0</div>
  <p>Each row of the first matrix is one image's view: image 1 (at 0) puts 0.982 on image 2 and 0.018 on image 3. Image 3 (at 3) puts 0.924 on image 2. Averaging gives p₁₂ = (0.982 + 0.818)/6 = 0.300, p₁₃ = (0.018 + 0.076)/6 = 0.016 and p₂₃ = (0.182 + 0.924)/6 = 0.184. Each pair appears twice in the matrix, so everything adds to 1. These three numbers are the "truth" the map will try to copy in the next three sections. In practice nearly all pᵢⱼ are tiny, so real implementations only compute them for about 3 × perplexity nearest neighbours of each point and treat the rest as zero; that is one reason perplexity also affects speed.</p>

  <h2 id="ts-q"><span class="num">04</span>The Student-t Map and the Crowding Problem</h2>
  <p>On the map we need a matching number qᵢⱼ, "how close are i and j on paper". The obvious choice would be the same Gaussian bell curve, and the original SNE did exactly that. The result was a crowded blob in the middle of the map. The reason is called the <strong>crowding problem</strong>, and it is another face of the curse of dimensionality.</p>
  <p>In 10 dimensions you can place 11 points all at exactly the same distance from each other (the corners of a shape called a simplex); in 2 dimensions you can place only 3, as a triangle. More generally, a point in high dimensions can have many neighbours at a moderate distance, spread around it in many different directions. A flat map does not have enough room at that moderate distance to hold them all, so to keep them reasonably near the point, the map squeezes them inwards, and everything collapses towards the centre. Think of drawing a city's friendship groups on a small notice board: if you keep true scale, all the groups overlap in the middle.</p>
  <p>t-SNE's fix, and the "t" in its name, is to use a curve with a much heavier tail on the map: the Student-t distribution with one degree of freedom (also called the Cauchy distribution):</p>
  <p><strong>qᵢⱼ = (1 + ‖yᵢ − yⱼ‖²)⁻¹ / Σₖ≠ₗ (1 + ‖yₖ − yₗ‖²)⁻¹</strong></p>
  <p>Here yᵢ is point i's position on the map. The bell curve falls like e^(−d²), extremely fast; the Student-t falls like 1/d², much more slowly. That slow decay is the "heavy tail". To represent a given similarity, the map can therefore place moderately distant points <em>much</em> further apart. Solving 1/(1 + y²) = e^(−d²/2) for the map distance y shows how much:</p>
  <div class="fx" data-lang="py">import numpy as np
print("high-D distance | Gaussian similarity | 2-D distance giving the same Student-t similarity")
for d in (0.5, 1, 2, 3):
    g = np.exp(-d ** 2 / 2)                     # high-D similarity (sigma = 1)
    y = np.sqrt(1 / g - 1)                      # solve 1/(1 + y^2) = g for y
    print(f"{d:15.1f} | {g:19.4f} | {y:8.3f}")</div>
  <div class="fx" data-lang="text">high-D distance | Gaussian similarity | 2-D distance giving the same Student-t similarity
            0.5 |              0.8825 |    0.365
            1.0 |              0.6065 |    0.805
            2.0 |              0.1353 |    2.528
            3.0 |              0.0111 |    9.435</div>
  <p>A close pair (distance 0.5 in high dimensions) stays close on the map (0.365). A pair at distance 2 is drawn at 2.53, and a pair at distance 3 is drawn at 9.4. Near things stay near, moderately far things get pushed much further away. That creates the room the map was missing, and clusters separate into the crisp islands t-SNE is famous for. The same mechanism has a cost we will meet in section 08: the gaps between islands are exaggerated on purpose, and not by a uniform amount, so they cannot be read as real distances.</p>
  <p>By hand for our three images, placed on a one-dimensional map at y = 0, 1 and 2: the kernel values are 1/(1 + 1²) = 0.5 for pair (1, 2), 1/(1 + 2²) = 0.2 for pair (1, 3) and 0.5 for pair (2, 3). Counting both orderings, the total is 2 × 1.2 = 2.4, so q₁₂ = 0.5/2.4 = 0.208, q₁₃ = 0.083 and q₂₃ = 0.208. Compare these with the truth p₁₂ = 0.300, p₁₃ = 0.016, p₂₃ = 0.184: image 1 and 2 are too far apart on this map, and images 1 and 3 too close.</p>

  <h2 id="ts-kl"><span class="num">05</span>The KL Objective</h2>
  <p>We now have the truth, P, and the map's version, Q. We need one number that says how badly Q misrepresents P, so the map can make that number small. t-SNE uses the <strong>Kullback–Leibler divergence</strong>, a standard measure of how different one probability distribution is from another:</p>
  <p><strong>C = KL(P‖Q) = Σᵢ≠ⱼ pᵢⱼ log(pᵢⱼ / qᵢⱼ)</strong></p>
  <p>It is zero when Q equals P exactly and positive otherwise. The important detail is that each pair's term is weighted by pᵢⱼ, the true similarity, which makes the measure <strong>asymmetric</strong>: some mistakes are punished far more than others.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([0.0, 1.0, 3.0])
W = np.exp(-(x[:, None] - x[None, :]) ** 2 / 2); np.fill_diagonal(W, 0)
P = (W / W.sum(1, keepdims=True)); P = (P + P.T) / 6          # p_ij from the previous section
def Q_of(y):
    T = 1 / (1 + (y[:, None] - y[None, :]) ** 2); np.fill_diagonal(T, 0)   # Student-t
    return T / T.sum()
def KL(P, Q):
    m = P &gt; 0
    return (P[m] * np.log(P[m] / Q[m])).sum()
for y in ([0.0, 1.0, 3.0], [0.0, 1.0, 2.0], [0.0, 3.0, 1.0]):
    Q = Q_of(np.array(y))
    print(f"map y={y}: q12={Q[0,1]:.3f} q13={Q[0,2]:.3f} q23={Q[1,2]:.3f}  KL={KL(P, Q):.4f}")
print("one pair, neighbours drawn far   (p=0.5,  q=0.05):", round(0.5 * np.log(0.5 / 0.05), 3))
print("one pair, strangers drawn close  (p=0.05, q=0.5): ", round(0.05 * np.log(0.05 / 0.5), 3))</div>
  <div class="fx" data-lang="text">map y=[0.0, 1.0, 3.0]: q12=0.312 q13=0.062 q23=0.125  KL=0.0755
map y=[0.0, 1.0, 2.0]: q12=0.208 q13=0.083 q23=0.208  KL=0.1213
map y=[0.0, 3.0, 1.0]: q12=0.063 q13=0.312 q23=0.125  KL=0.9906
one pair, neighbours drawn far   (p=0.5,  q=0.05): 1.151
one pair, strangers drawn close  (p=0.05, q=0.5):  -0.115</div>
  <p>Start with the last two lines. A pair of true neighbours (p = 0.5) drawn far apart on the map (q = 0.05) costs 0.5 × ln(10) = <strong>1.151</strong>. A pair of strangers (p = 0.05) drawn close together (q = 0.5) costs 0.05 × ln(0.1) = <strong>−0.115</strong>, almost nothing (the normalisation of Q pushes back on such mistakes elsewhere, but only weakly). So t-SNE fights hard to keep neighbours together and hardly cares where non-neighbours go. That is the precise reason for the famous rule: <strong>t-SNE preserves local structure, and global structure is not guaranteed</strong>.</p>
  <p>The first three lines score three maps of our three images. The map y = (0, 1, 2) from the previous section has KL 0.121. The map that copies the original positions (0, 1, 3) does better, 0.076. The map that swaps images 2 and 3, (0, 3, 1), tears the close pair 1–2 apart and scores 0.991, thirteen times worse. Note that the value of KL depends on P, which depends on perplexity, so KL values can be compared between runs at the same perplexity but not across perplexities. scikit-learn reports the final value as <code>kl_divergence_</code>.</p>

  <h2 id="ts-opt"><span class="num">06</span>Optimisation</h2>
  <p>Everything is now in place, and the figure shows how the pieces fit. The top row is computed once from the data: distances, each point's σ from the perplexity, the conditional probabilities, and the symmetric P. The bottom row is a loop: from the current map positions Y compute Q, measure KL against P, take a gradient step that moves Y, and repeat about a thousand times.</p>
  <figure class="viz"><svg viewBox="0 0 680 230" width="680">
<defs><marker id="ts-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="11.5">
<rect x="10" y="20" width="120" height="46" rx="7" class="fs" stroke="currentColor"/><text x="70" y="39" text-anchor="middle" font-weight="700">Distances dᵢⱼ</text><text x="70" y="55" text-anchor="middle" class="tm">scaled data</text>
<rect x="155" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="215" y="39" text-anchor="middle" font-weight="700">σᵢ search</text><text x="215" y="55" text-anchor="middle" class="tm">perplexity → σ</text>
<rect x="300" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="360" y="39" text-anchor="middle" font-weight="700">p(j|i)</text><text x="360" y="55" text-anchor="middle" class="tm">Gaussian</text>
<rect x="445" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="505" y="39" text-anchor="middle" font-weight="700">P = pᵢⱼ</text><text x="505" y="55" text-anchor="middle" class="tm">symmetrise /2n</text>
<rect x="445" y="110" width="120" height="46" rx="7" class="fg sg"/><text x="505" y="129" text-anchor="middle" font-weight="700">KL(P‖Q)</text><text x="505" y="145" text-anchor="middle" class="tm">the cost</text>
<rect x="300" y="110" width="120" height="46" rx="7" class="fg sg"/><text x="360" y="129" text-anchor="middle" font-weight="700">Q = qᵢⱼ</text><text x="360" y="145" text-anchor="middle" class="tm">Student-t on map</text>
<rect x="155" y="110" width="120" height="46" rx="7" class="ft st"/><text x="215" y="129" text-anchor="middle" font-weight="700">Map Y</text><text x="215" y="145" text-anchor="middle" class="tm">PCA or random start</text>
<rect x="445" y="180" width="200" height="40" rx="7" class="fr sr"/><text x="545" y="198" text-anchor="middle" font-weight="700">Gradient step on Y</text><text x="545" y="213" text-anchor="middle" class="tm">exaggeration, momentum</text>
<line x1="130" y1="43" x2="153" y2="43" stroke="currentColor" marker-end="url(#ts-c)"/><line x1="275" y1="43" x2="298" y2="43" stroke="currentColor" marker-end="url(#ts-c)"/><line x1="420" y1="43" x2="443" y2="43" stroke="currentColor" marker-end="url(#ts-c)"/>
<line x1="505" y1="66" x2="505" y2="108" stroke="currentColor" marker-end="url(#ts-c)"/><line x1="275" y1="133" x2="298" y2="133" stroke="currentColor" marker-end="url(#ts-c)"/><line x1="420" y1="133" x2="443" y2="133" stroke="currentColor" marker-end="url(#ts-c)"/>
<line x1="545" y1="156" x2="545" y2="178" stroke="currentColor" marker-end="url(#ts-c)"/><path d="M445 200 L215 200 L215 158" fill="none" stroke="currentColor" marker-end="url(#ts-c)"/>
<text x="20" y="200" class="tm">repeat ~1,000 times</text>
</g></svg><figcaption>Top row: computed once from the data. Bottom loop: repeated until the map's Q matches P.</figcaption></figure>
  <p>The step that moves the points uses the gradient of KL with respect to each map position, which comes out as a tidy formula:</p>
  <p><strong>∂C/∂yᵢ = 4 Σⱼ (pᵢⱼ − qᵢⱼ) (yᵢ − yⱼ) (1 + ‖yᵢ − yⱼ‖²)⁻¹</strong></p>
  <p>Read it as a set of springs between point i and every other point j. If pᵢⱼ is bigger than qᵢⱼ (the pair is closer in truth than on the map), the spring pulls them together; if it is smaller, the spring pushes them apart. The factor (1 + d²)⁻¹ weakens the springs between points that are already far apart. By hand for our map y = (0, 1, 2), image 1 at 0: the pair with image 2 contributes (0.300 − 0.208) × (0 − 1) × 0.5 = −0.046, the pair with image 3 contributes (0.016 − 0.083) × (0 − 2) × 0.2 = +0.027, and 4 × (−0.046 + 0.027) = <strong>−0.075</strong>. A negative gradient means moving right lowers the cost, so image 1 is pulled towards its true neighbour, image 2. Gradient descent moves every point a small step against its gradient: y ← y − η × gradient, where η is the learning rate.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([0.0, 1.0, 3.0])
W = np.exp(-(x[:, None] - x[None, :]) ** 2 / 2); np.fill_diagonal(W, 0)
P = (W / W.sum(1, keepdims=True)); P = (P + P.T) / 6
def kl_and_grad(y):
    diff = y[:, None] - y[None, :]
    T = 1 / (1 + diff ** 2); np.fill_diagonal(T, 0)
    Q = T / T.sum()
    kl = (P[P &gt; 0] * np.log(P[P &gt; 0] / Q[P &gt; 0])).sum()
    grad = 4 * ((P - Q) * T * diff).sum(axis=1)      # the t-SNE gradient formula
    return kl, grad
y = np.array([0.0, 1.0, 2.0])
kl, g = kl_and_grad(y)
print("KL:", kl.round(4), "  gradient:", g.round(4))
y2 = y - 1.0 * g                                      # one step downhill, learning rate 1
print("after one step: y =", y2.round(3), "  KL =", kl_and_grad(y2)[0].round(4))</div>
  <div class="fx" data-lang="text">KL: 0.1213   gradient: [-0.0749  0.231  -0.1561]
after one step: y = [0.075 0.769 2.156]   KL = 0.0872</div>
  <p>The code agrees with the hand value (−0.0749). Image 2 has gradient +0.231, so it is pulled left towards image 1 (p₁₂ is bigger than q₁₂), and image 3 has −0.156, so it is pushed right, away from both (its p values are smaller than its q values). One step with learning rate 1 moves the map to (0.075, 0.769, 2.156) and KL falls from 0.121 to 0.087. Real t-SNE adds four tricks to this plain recipe. <strong>Early exaggeration</strong> multiplies all of P by 12 for the first 250 iterations, so attraction dominates: clusters pull together into tight balls that can move past one another and find good places, and then exaggeration is switched off and the map relaxes. <strong>Momentum</strong> adds a fraction (0.5, later 0.8) of the previous step to each new one, smoothing the path like a rolling ball. The <strong>learning rate</strong> in scikit-learn defaults to "auto", which is max(n / 12 / 4, 50). And the <strong>initial map</strong> is either tiny random positions or, by default, the first two PCA components scaled down.</p>
  <p>Here is a complete t-SNE in about thirty lines, built from exactly these pieces: 90 points in three groups in 10 dimensions (stand-ins for three digit classes), perplexity 10, exact gradients, 100 iterations with exaggeration and then 400 without.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
centres = rng.normal(0, 4, (3, 10))                          # 3 groups of "images" in 10-D
Xh = np.vstack([rng.normal(c, 1.0, (30, 10)) for c in centres]); lab = np.repeat([0, 1, 2], 30)
n = len(Xh)

def joint_p(X, perplexity=10):
    D2 = ((X[:, None] - X[None]) ** 2).sum(-1)
    P = np.zeros((n, n))
    for i in range(n):                                       # binary search sigma_i for each point
        lo, hi = 1e-3, 1e3
        for _ in range(60):
            s = (lo + hi) / 2
            w = np.exp(-D2[i] / (2 * s * s)); w[i] = 0; p = w / w.sum()
            H = -(p[p &gt; 0] * np.log2(p[p &gt; 0])).sum()
            lo, hi = (lo, s) if 2 ** H &gt; perplexity else (s, hi)
        P[i] = p
    return (P + P.T) / (2 * n)                               # symmetrise

def tsne(P, iters=500, lr=50.0, exag=12.0):
    Y = np.random.default_rng(0).normal(0, 1e-2, (n, 2))     # tiny random start
    vel = np.zeros_like(Y)
    for it in range(iters):
        Pe = P * exag if it &lt; 100 else P                     # early exaggeration
        diff = Y[:, None] - Y[None]
        T = 1 / (1 + (diff ** 2).sum(-1)); np.fill_diagonal(T, 0)
        Q = T / T.sum()
        grad = 4 * (((Pe - Q) * T)[:, :, None] * diff).sum(1)
        vel = (0.5 if it &lt; 100 else 0.8) * vel - lr * grad    # momentum
        Y += vel
        if it in (0, 99, 100, 250, 499):
            kl = (P[P &gt; 0] * np.log(P[P &gt; 0] / np.maximum(Q[P &gt; 0], 1e-12))).sum()
            print(f"iter {it:3d}  KL = {kl:.3f}")
    return Y

Y = tsne(joint_p(Xh))
cent = np.array([Y[lab == k].mean(0) for k in range(3)])
nearest = np.argmin(((Y[:, None] - cent[None]) ** 2).sum(-1), axis=1)
print("share of points closest to their own group's centre:", (nearest == lab).mean())</div>
  <div class="fx" data-lang="text">iter   0  KL = 2.060
iter  99  KL = 1.912
iter 100  KL = 1.775
iter 250  KL = 0.505
iter 499  KL = 0.407
share of points closest to their own group's centre: 1.0</div>
  <p>KL starts at 2.06 from the tiny random map and barely moves during the exaggeration phase (the map is fitting the exaggerated P, not the one being measured). The moment exaggeration ends, at iteration 100, KL drops sharply, and it settles at 0.407. Every point ends up closest to its own group's centre: three clean islands from nothing but distances.</p>

  <h2 id="ts-digits"><span class="num">07</span>t-SNE on the Digits</h2>
  <p>Now the real test. PCA's picture of the digits scored 0.514 on the 5-NN check and 0.816 on trustworthiness. Here is scikit-learn's <code>TSNE</code> with default settings made explicit:</p>
  <div class="fx" data-lang="py">from sklearn.manifold import TSNE, trustworthiness
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from digits import Xs, y
tsne = TSNE(n_components=2, perplexity=30, init="pca", random_state=0)
Z = tsne.fit_transform(Xs)
print("map shape:", Z.shape, " final KL:", round(tsne.kl_divergence_, 3))
print("5-NN accuracy on the 2 t-SNE coordinates:", round(cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean(), 3))
print("trustworthiness:", round(trustworthiness(Xs, Z, n_neighbors=10), 3))</div>
  <div class="fx" data-lang="text">map shape: (1797, 2)  final KL: 0.837
5-NN accuracy on the 2 t-SNE coordinates: 0.954
trustworthiness: 0.986</div>
  <p>The map is 1,797 points by 2 coordinates. A 5-NN classifier using only those two coordinates scores <strong>0.954</strong>, better even than the 0.944 achieved on all 64 pixels, and trustworthiness is <strong>0.986</strong>. On the picture each digit forms its own island, and the few points in the wrong island are genuinely ambiguous handwriting, such as a 1 that looks like a 7. <code>kl_divergence_</code> = 0.837 is the final value of the cost. (The 5-NN score is fine for judging a picture, but section 11 explains why it must not be read as a model's accuracy.)</p>
  <p>The parameters worth knowing are few. <code>perplexity</code> (default 30) is the effective number of neighbours; try values between 5 and 50 and keep it below the number of points. <code>n_components</code> is 2 or 3; the default Barnes–Hut method supports at most 3. <code>init</code> defaults to "pca", which makes runs repeatable and gives a better large-scale layout; "random" is the older alternative. <code>early_exaggeration</code> (12) controls how tightly clusters first pull together. <code>learning_rate</code> ("auto") is rarely worth changing: too low leaves a compressed ball, too high scatters the points. <code>max_iter</code> (1,000) is the total number of steps; stopping too early leaves clusters still contracting. <code>method</code> is "barnes_hut" (fast, approximate) or "exact", and <code>angle</code> (0.5) trades accuracy for speed in Barnes–Hut (section 10). <code>metric</code> can be any distance, for example "cosine" for text embeddings. And <code>random_state</code> should be fixed for reproducible results. Before any of this, scale the data: t-SNE uses Euclidean distances, so a column with big units would dominate exactly as in PCA.</p>

  <h2 id="ts-read"><span class="num">08</span>Reading t-SNE Plots</h2>
  <p>On the digits map, some islands sit far from each other and some look bigger than others. Do those observations mean anything? The only way to know is to test t-SNE on data where we know the truth. The code builds two such datasets in 10 dimensions: three groups where group C is 10 times further from A than B is, and two groups where one is about 30 times more spread out than the other.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
rng = np.random.default_rng(0)
# three groups in 10-D: A and B close together, C ten times farther from A
cent = np.zeros((3, 10)); cent[1, 0] = 5; cent[2, 0] = 50
X3 = np.vstack([rng.normal(c, 1.0, (200, 10)) for c in cent]); y3 = np.repeat([0, 1, 2], 200)
def gap_ratio(Z):
    c = np.array([Z[y3 == i].mean(0) for i in range(3)])         # group centres
    return np.linalg.norm(c[0] - c[2]) / np.linalg.norm(c[0] - c[1])
print(f"A-C gap / A-B gap:  original {gap_ratio(X3):.1f}   PCA {gap_ratio(PCA(2).fit_transform(X3)):.1f}"
      f"   t-SNE {gap_ratio(TSNE(2, random_state=0).fit_transform(X3)):.1f}")
# a tight group and a wide group (30x more spread out)
X2 = np.vstack([rng.normal(0, 0.1, (200, 10)), rng.normal(20, 3.0, (200, 10))]); y2 = np.repeat([0, 1], 200)
def spread_ratio(Z):
    sp = [np.linalg.norm(Z[y2 == i] - Z[y2 == i].mean(0), axis=1).mean() for i in range(2)]
    return sp[1] / sp[0]
print(f"wide / tight spread: original {spread_ratio(X2):.1f}   t-SNE {spread_ratio(TSNE(2, random_state=0).fit_transform(X2)):.1f}")</div>
  <div class="fx" data-lang="text">A-C gap / A-B gap:  original 10.0   PCA 10.0   t-SNE 1.7
wide / tight spread: original 28.6   t-SNE 1.0</div>
  <p>PCA keeps the true 10× ratio of gaps exactly, because it only rotates. t-SNE shows <strong>1.7×</strong>: the small A–B gap was inflated by the heavy tail, and the large A–C gap was compressed because KL barely cares about far pairs. In the second test the wide group is 28.6 times more spread out than the tight one, and t-SNE draws them at the <strong>same size</strong> (1.0×). That is the per-point σ at work: each point's neighbourhood is scaled to contain the same effective number of neighbours, so a dense group and a sparse group look alike on the map.</p>
  <p>Think of a metro map. You can trust which stations are next to each other on a line, but not the distances on the paper or the size of a neighbourhood. A t-SNE plot is read the same way. Points that sit together are neighbours in the original space, and you can trust that. Separate islands are usually real groups, but check that they persist at several perplexities. The distance between two islands means almost nothing (a true 10× became 1.7×). The size, spread or density of an island means nothing (28.6× became 1.0×). The axes, rotation and absolute positions are arbitrary. And at very low perplexity, pure noise can form small clumps that look like clusters. Claims such as "cluster A is far from cluster B, so they are very different" or "cluster C is big, so it is diverse" must be checked in the original space, for example by comparing distances between class means or within-class variances there.</p>

  <h2 id="ts-perpfx"><span class="num">09</span>Perplexity, Randomness and Initialisation</h2>
  <p>A t-SNE map depends on its settings and, potentially, on chance. Two questions follow: how much does the picture change with perplexity, and will a colleague running the same code see the same picture? The code answers both on the digits. It measures trustworthiness at two neighbourhood sizes: trust(10) asks whether a point's 10 nearest map neighbours are real, and trust(100) asks the same about a wider neighbourhood of 100. Then it runs t-SNE twice with different seeds, for both kinds of starting map.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.manifold import TSNE, trustworthiness
from sklearn.neighbors import NearestNeighbors
from digits import Xs, y
def knn_sets(Z, k=10):
    idx = NearestNeighbors(n_neighbors=k + 1).fit(Z).kneighbors(Z, return_distance=False)[:, 1:]
    return [set(r) for r in idx]
for p in (2, 30, 100):
    Z = TSNE(2, perplexity=p, random_state=0).fit_transform(Xs)
    print(f"perplexity {p:3d}: trust(10) {trustworthiness(Xs, Z, n_neighbors=10):.3f}  "
          f"trust(100) {trustworthiness(Xs, Z, n_neighbors=100):.3f}")
a = TSNE(2, init="random", random_state=0).fit_transform(Xs)
b = TSNE(2, init="random", random_state=1).fit_transform(Xs)
shared = np.mean([len(s &amp; t) / 10 for s, t in zip(knn_sets(a), knn_sets(b))])
print(f"init='random', seeds 0 vs 1: max coordinate change {np.abs(a - b).max():.1f}, shared 10-NN {shared:.3f}")
c = TSNE(2, init="pca", random_state=0).fit_transform(Xs)
d = TSNE(2, init="pca", random_state=1).fit_transform(Xs)
print(f"init='pca',    seeds 0 vs 1: max coordinate change {np.abs(c - d).max():.1f}")</div>
  <div class="fx" data-lang="text">perplexity   2: trust(10) 0.970  trust(100) 0.861
perplexity  30: trust(10) 0.986  trust(100) 0.934
perplexity 100: trust(10) 0.984  trust(100) 0.941
init='random', seeds 0 vs 1: max coordinate change 98.9, shared 10-NN 0.817
init='pca',    seeds 0 vs 1: max coordinate change 0.0</div>
  <p>trust(10) is high at every perplexity (0.970 to 0.986): the closest neighbours are always well kept. trust(100) rises steadily with perplexity, from 0.861 at perplexity 2 to 0.934 at 30 and 0.941 at 100. Low perplexity looks only at the very closest few points, so it can split one digit into several sub-clumps and can make clumps out of noise; high perplexity respects larger neighbourhoods and gives a more coherent large-scale layout, at more computing cost. There is no single right value. The honest practice is to look at several values, trust only structure that persists across them, and report the range you tried; picking the perplexity that "shows the clusters you expected" is confirmation bias with a knob.</p>
  <p>The optimisation is not convex, which means different starting maps can settle into different final arrangements. With a random start, changing only the seed moved points by up to 98.9 units, yet 82% of each point's 10 nearest map neighbours were the same in both runs: the local story is stable, but the arrangement of the islands changes. With <code>init="pca"</code>, the default since scikit-learn 1.2, the two runs are identical, because the starting map is deterministic and Barnes–Hut adds no other randomness. PCA initialisation also tends to give a more faithful large-scale layout, because the starting map already has PCA's global structure. A practical consequence: never compare two t-SNE plots of different datasets (before and after, two hospitals) by eye. Positions, rotations and gaps are not comparable between separate fits.</p>

  <h2 id="ts-cost"><span class="num">10</span>Cost and Barnes–Hut</h2>
  <p>The gradient sums over every pair of points, and so does the normaliser of Q. For n points that is n² pairs per iteration, about a trillion for a million points, repeated a thousand times. <strong>Barnes–Hut t-SNE</strong> (van der Maaten, 2014) makes this affordable with two approximations. First, it computes P only for about 3 × perplexity nearest neighbours of each point and treats all other pᵢⱼ as zero, so the attractive forces are cheap. Second, for the repulsive forces it groups far-away points using a quadtree (a structure that recursively splits the map into four squares) and replaces each distant group by a single point at its centre, the way the gravitational pull of a distant galaxy can be treated as the pull of one heavy point. That brings the cost down to about n log n per iteration. The <code>angle</code> parameter decides when a group counts as "far enough" to summarise: larger is faster and rougher.</p>
  <div class="fx" data-lang="py">import numpy as np, time
from sklearn.manifold import TSNE, trustworthiness
from digits import Xs
S = Xs[:500]                                       # a small sample, so "exact" is affordable
for method in ("exact", "barnes_hut"):
    t = TSNE(2, method=method, random_state=0)
    Z = t.fit_transform(S)
    print(f"{method:10s} KL={t.kl_divergence_:.3f} trust={trustworthiness(S, Z, n_neighbors=10):.3f}")
n = 1_000_000
print(f"pairs per iteration at n = 1,000,000: n^2 = {n**2:.0e}; n*log2(n) = {n*np.log2(n):.1e}")</div>
  <div class="fx" data-lang="text">exact      KL=0.377 trust=0.985
barnes_hut KL=0.446 trust=0.986
pairs per iteration at n = 1,000,000: n^2 = 1e+12; n*log2(n) = 2.0e+07</div>
  <p>On 500 digits the exact method reaches a lower final KL (0.377 against 0.446), but trustworthiness is the same (0.985 against 0.986): the approximation costs almost nothing in neighbourhood quality. The last line shows why it matters: 10¹² pairs against about 2 × 10⁷ for a million points. The standard recipe for large data is <strong>scale → PCA to about 50 dimensions → t-SNE</strong>. PCA removes noise directions and makes the neighbour search much faster without losing the local structure. Beyond roughly a hundred thousand points, use faster implementations such as openTSNE or FIt-SNE (which accelerates the repulsion with Fourier transforms), or switch to UMAP. Barnes–Hut only supports 2 or 3 output dimensions, which is a reminder of what t-SNE is for: pictures, not general-purpose reduction.</p>

  <h2 id="ts-nofeat"><span class="num">11</span>No Transform: Not for Features</h2>
  <p>A 5-NN classifier on the t-SNE map scored 0.954, better than on raw pixels. It is tempting to build a production pipeline as "t-SNE, then a classifier". It does not work, and the reason teaches something basic about the method.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.manifold import TSNE
from digits import Xs
print("TSNE has transform():", hasattr(TSNE(), "transform"))
Z1 = TSNE(2, random_state=0).fit_transform(Xs[:1000])            # map 1,000 digits
Z2 = TSNE(2, random_state=0).fit_transform(Xs[:1001])            # add ONE new digit and refit
move = np.linalg.norm(Z1 - Z2[:1000], axis=1)
print(f"old points moved: median {np.median(move):.1f}, max {move.max():.1f} (map width {np.ptp(Z1[:, 0]):.1f})")</div>
  <div class="fx" data-lang="text">TSNE has transform(): False
old points moved: median 0.6, max 24.3 (map width 70.2)</div>
  <p>scikit-learn's <code>TSNE</code> has no <code>transform</code> method. The map is simply the optimised coordinates of the points it was fitted on; it is not a function that can be applied to a new image. Such a method is called <strong>non-parametric</strong>: it learns positions for the given points only, with no rule f(x) → y for unseen x. To place a new digit you must refit on old plus new data, and the refit moves the old points too: adding a single digit to 1,000 moved existing points by a median of 0.6 and up to 24.3 units on a map 70 units wide. A classifier trained on yesterday's coordinates would be lost.</p>
  <p>There is a second, quieter problem with the 0.954. It was measured on a map fitted to <em>all</em> 1,797 digits, so the test folds helped shape the coordinates the classifier was trained on. That is fine for judging how well a picture separates the classes, but as a model score it would be leakage. When a reusable non-linear mapping is needed, use PCA, <a class="xref" data-note="ml_umap">UMAP</a> (which has a <code>transform</code>), parametric t-SNE (a neural network trained with the t-SNE loss), or openTSNE's approximate placement of new points. And the same logic rules out clustering on t-SNE coordinates: DBSCAN or k-means run on the map will find the islands that t-SNE's heavy tail exaggerated. Cluster in the original space or a PCA/UMAP space, and use t-SNE only to colour the result.</p>

  <h2 id="ts-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common mistake is reading gaps and sizes as facts. In the controlled test a true 10× gap was drawn as 1.7× and a group 28.6 times more spread out was drawn at the same size. Only neighbourhoods are reliable; anything about distances between groups or the size of a group has to be checked in the original space.</p>
  <p>The second is drawing one picture with one setting and trusting it. Low perplexity fragments groups and can invent clumps; high perplexity shows more large-scale structure (trust(100) went from 0.861 to 0.941 between perplexity 2 and 100). With random initialisation, different seeds rearrange the islands. Always look at several perplexities, fix <code>random_state</code>, and prefer <code>init="pca"</code>.</p>
  <p>The third is treating t-SNE as a feature extractor. There is no <code>transform</code>, so the code below fails; and fitting t-SNE on all data before splitting leaks the test rows into every training coordinate:</p>
  <div class="fx" data-lang="py">from sklearn.manifold import TSNE
from digits import Xs
tsne = TSNE(2, random_state=0).fit(Xs[:300])         # "train" on 300 digits
try:
    tsne.transform(Xs[300:310])                      # try to place 10 new digits
except AttributeError as e:
    print("AttributeError:", e)</div>
  <div class="fx" data-lang="text">AttributeError: 'TSNE' object has no attribute 'transform'</div>
  <p>Use PCA or UMAP inside a pipeline when reduced features are needed. Two smaller mistakes complete the list. Skipping scaling lets the column with the largest units dominate the distances. And running t-SNE directly on very wide raw data (thousands of columns) suffers from the curse of dimensionality and is slow; reduce to about 50 PCA components first.</p>

  <h2 id="ts-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Embedding</b>: a low-dimensional position yᵢ for each data point xᵢ.</li>
    <li><b>p(j|i)</b>: Gaussian-weighted, normalised similarity of j to i; a soft neighbour list.</li>
    <li><b>Perplexity</b>: 2^entropy of p(·|i); the effective number of neighbours. Each σᵢ is set by binary search to hit it.</li>
    <li><b>pᵢⱼ</b>: (p(j|i) + p(i|j)) / 2n; symmetric, sums to 1.</li>
    <li><b>qᵢⱼ</b>: Student-t similarity on the map, (1 + d²)⁻¹ normalised over all pairs.</li>
    <li><b>Crowding problem</b>: 2-D lacks room for all moderately distant neighbours; the heavy tail fixes it.</li>
    <li><b>KL(P‖Q)</b>: Σ p log(p/q); asymmetric, punishes torn-apart neighbours most.</li>
    <li><b>Trustworthiness</b>: share of map neighbours that are true neighbours (1 = perfect).</li>
    <li><b>Non-parametric</b>: learns positions only; no function for new points.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Hand example</th></tr>
    <tr><td>p(j|i) = exp(−d²/2σᵢ²) / Σₖ exp(−dᵢₖ²/2σᵢ²)</td><td>d = 1, 2, 3, 6, σ = 1 → 0.806, 0.180, 0.015, 0.000</td></tr>
    <tr><td>Perp = 2^H, H = −Σ p log₂ p</td><td>σ = 1 → 1.72; σ = 2 → 2.87</td></tr>
    <tr><td>pᵢⱼ = (p(j|i) + p(i|j)) / 2n</td><td>points 0, 1, 3 → 0.300, 0.016, 0.184</td></tr>
    <tr><td>qᵢⱼ = (1 + ‖yᵢ − yⱼ‖²)⁻¹ / Σ (1 + ‖yₖ − yₗ‖²)⁻¹</td><td>map 0, 1, 2 → 0.208, 0.083, 0.208</td></tr>
    <tr><td>C = Σ pᵢⱼ log(pᵢⱼ/qᵢⱼ)</td><td>0.121; faithful map 0.076; torn map 0.991</td></tr>
    <tr><td>∂C/∂yᵢ = 4 Σⱼ (pᵢⱼ − qᵢⱼ)(yᵢ − yⱼ)(1 + ‖yᵢ − yⱼ‖²)⁻¹</td><td>−0.075, +0.231, −0.156; one step: KL 0.121 → 0.087</td></tr>
  </table>
  <h3>Numbers from the digits</h3>
  <ul>
    <li>PCA 2-D: 21.6% of variance, 5-NN 0.514, trust 0.816 (all 64 pixels 5-NN 0.944).</li>
    <li>t-SNE 2-D: 5-NN 0.954, trust 0.986, final KL 0.837.</li>
    <li>Gap test: true 10× drawn as 1.7×; 28.6× wider group drawn the same size.</li>
    <li>trust(100) at perplexity 2 / 30 / 100: 0.861 / 0.934 / 0.941.</li>
    <li>Random init, two seeds: 82% shared 10-NN; PCA init: identical maps.</li>
    <li>Refit after one new point: old points move up to 24.3 on a 70-wide map.</li>
  </ul>
  <h3>What to trust in a t-SNE plot</h3>
  <table class="tbl">
    <tr><th>You see</th><th>Trust it?</th></tr>
    <tr><td>points sitting together</td><td>yes</td></tr>
    <tr><td>separate islands</td><td>mostly; check several perplexities</td></tr>
    <tr><td>distance between islands</td><td>no</td></tr>
    <tr><td>island size or density</td><td>no</td></tr>
    <tr><td>axes, rotation, position</td><td>no</td></tr>
  </table>
  <h3>PCA vs t-SNE vs UMAP</h3>
  <table class="tbl">
    <tr><th></th><th>PCA</th><th>t-SNE</th><th>UMAP</th></tr>
    <tr><td>Type</td><td>linear, has a mapping</td><td>non-linear, no mapping</td><td>non-linear, has a mapping</td></tr>
    <tr><td>Preserves</td><td>global variance</td><td>local neighbours</td><td>local, somewhat more global</td></tr>
    <tr><td>New points</td><td>transform</td><td>no</td><td>transform</td></tr>
    <tr><td>Speed at large n</td><td>fast</td><td>slow</td><td>faster</td></tr>
    <tr><td>Use for</td><td>model input, compression</td><td>pictures only</td><td>pictures, clustering, model input</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.manifold import TSNE, trustworthiness

Xr = make_pipeline(StandardScaler(), PCA(50)).fit_transform(X)    # scale, then PCA to ~50
tsne = TSNE(n_components=2, perplexity=30, init="pca", random_state=0)
Z = tsne.fit_transform(Xr)               # no separate transform() exists
tsne.kl_divergence_
trustworthiness(Xr, Z, n_neighbors=10)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Gaps, sizes and axes are not meaningful.</li>
    <li>Try several perplexities; fix random_state; prefer init="pca".</li>
    <li>No transform: never use as model features or cluster on the map.</li>
    <li>Scale first; PCA to ~50 dimensions for wide data.</li>
    <li>KL values are only comparable at the same perplexity.</li>
  </ul>

  <h2 id="ts-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain t-SNE in plain words.</summary><div class="qa-body">t-SNE turns high-dimensional distances into neighbour probabilities using a Gaussian whose width is set by perplexity, places points on a 2-D map, computes similar probabilities on the map using a heavy-tailed Student-t curve, and moves the map points by gradient descent to minimise the KL divergence between the two. Neighbours end up together; distances between groups are not preserved.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is perplexity, and how is each point's σ chosen?</summary><div class="qa-body">Perplexity is 2 raised to the entropy of a point's neighbour distribution: a smooth effective number of neighbours (four equal neighbours give 4). You set one perplexity, typically 5–50, and t-SNE binary-searches each point's σ so its perplexity matches. Points in dense regions get small σ, points in sparse regions large σ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does t-SNE use a Student-t distribution in the low-dimensional space?</summary><div class="qa-body">To solve the crowding problem: a high-dimensional point can have many moderately distant neighbours, but a 2-D map lacks room for them, so with a Gaussian they collapse into a blob. The Student-t falls off like 1/d², so moderately distant pairs can be placed much farther apart (a Gaussian similarity at distance 3 corresponds to a map distance of 9.4), giving well-separated clusters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does t-SNE preserve local structure but not global structure?</summary><div class="qa-body">Its cost, KL(P‖Q), weights each pair by its true similarity p. Placing true neighbours far apart is expensive (0.5 · ln 10 = 1.15), while placing strangers close together is almost free (−0.115). The optimiser therefore protects neighbourhoods and is nearly indifferent to where distant groups end up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What can and cannot be concluded from a t-SNE plot?</summary><div class="qa-body">You can conclude which points are neighbours and, if stable across perplexities, which groups exist. You cannot conclude anything from distances between clusters (a true 10× gap was shown as 1.7×), from cluster sizes or densities (a 28.6× wider group was drawn the same size), or from axes and absolute positions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do all clusters in a t-SNE plot tend to look the same size?</summary><div class="qa-body">Each point's σ is chosen so that it has the same effective number of neighbours. In a sparse cluster σ is large and in a dense cluster small, so both are scaled to similar neighbourhood sizes, and the density difference disappears from the map.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the t-SNE gradient and interpret it.</summary><div class="qa-body">∂C/∂yᵢ = 4 Σⱼ (pᵢⱼ − qᵢⱼ)(yᵢ − yⱼ)(1 + ‖yᵢ − yⱼ‖²)⁻¹. Each term is a spring: pairs closer in truth than on the map (p &gt; q) attract, pairs too close on the map repel, and the last factor weakens forces between far-apart points.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is early exaggeration for?</summary><div class="qa-body">For the first 250 iterations all p values are multiplied by 12, so attraction dominates. Clusters contract into tight groups that can move past each other and settle in good positions; then exaggeration is switched off and the map relaxes into its final shape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does perplexity change the result?</summary><div class="qa-body">Low perplexity focuses on the very nearest points, which can split groups into fragments and turn noise into clumps. High perplexity considers larger neighbourhoods and gives a more coherent large-scale layout, at higher cost (digits trust(100): 0.861 at 2, 0.941 at 100). Compare several values and trust only structure that persists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is t-SNE deterministic?</summary><div class="qa-body">The optimisation is non-convex, so with random initialisation different seeds give different layouts (on the digits, points moved up to 98.9 units while 82% of nearest-neighbour sets stayed the same). With sklearn's default PCA initialisation and a fixed random_state, runs are repeatable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the computational cost of t-SNE and how is it reduced?</summary><div class="qa-body">Exact t-SNE is O(n²) per iteration in time and memory. Barnes–Hut t-SNE computes P only for about 3 × perplexity nearest neighbours and approximates far-away repulsion with a quadtree, giving O(n log n). FFT-based implementations (FIt-SNE, openTSNE) are faster still, and reducing to ~50 PCA components first speeds up the neighbour search.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should t-SNE output not be used as features for a model?</summary><div class="qa-body">It is non-parametric: there is no transform for new rows, and refitting with new data moves the old points (one extra digit moved points up to 24.3 units). Fitting it on all data leaks test rows into the coordinates, and the coordinates distort global geometry. Use PCA or UMAP inside a pipeline instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you run clustering on t-SNE coordinates?</summary><div class="qa-body">It is not recommended. The heavy tail deliberately exaggerates gaps, so a clustering algorithm finds whatever separation t-SNE created, and results change with perplexity and seed. Cluster in the original space or a PCA or UMAP space, and use t-SNE only to visualise the clusters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you run t-SNE on a million points?</summary><div class="qa-body">Scale the data, reduce to about 50 dimensions with PCA, then use Barnes–Hut or, better, an FFT-accelerated implementation such as openTSNE, or use UMAP instead. Exact t-SNE would need about 10¹² pair computations per iteration.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare PCA and t-SNE.</summary><div class="qa-body">PCA is linear, deterministic and fast, keeps global variance, has a transform and has interpretable loadings, but overlaps curved or clustered structure (digits: 5-NN 0.514 on two components). t-SNE is non-linear and keeps local neighbourhoods (0.954), but distorts global distances and sizes, is slower, depends on settings and has no transform.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does UMAP change compared with t-SNE?</summary><div class="qa-body">UMAP builds a weighted k-nearest-neighbour graph instead of full Gaussian probabilities, uses a cross-entropy loss with an explicit repulsion term for non-neighbours, optimises by sampling edges and random negative pairs (faster), starts from a spectral layout, supports any output dimension and learns a transform for new points.</div></details>
</main>
`
});
