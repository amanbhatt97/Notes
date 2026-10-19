// notes/ml/ml_tsne.js — t-SNE
Object.assign(TOPIC_CONTENT, {
  "ml_tsne": `<main>
  <h1>t-SNE</h1>
  <div class="where"><span>Machine Learning</span><span>Dimensionality Reduction</span><span>t-SNE</span></div>
  <p class="lead">t-SNE (t-distributed Stochastic Neighbour Embedding) draws high-dimensional data as a 2D map in which points that were neighbours stay neighbours. It produces the striking "islands of clusters" pictures you see in papers about images, single cells and word embeddings. This note follows one running example, 1,797 handwritten digits with 64 pixels each, and builds the whole method by hand: Gaussian neighbour probabilities, perplexity and the search for σ, symmetrising, the heavy-tailed Student-t in 2D and the crowding problem it solves, the KL-divergence objective and one gradient step. Then we write a tiny t-SNE from scratch, run sklearn's on the digits, and learn the part that matters most in practice: what a t-SNE plot can and cannot tell you.</p>

  <h2 id="ts-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <p><strong>Came from.</strong> <a class="xref" data-note="ml_pca">PCA</a> gives the best <em>flat</em> 2D view of the data: it rotates and drops axes. On the digits that view keeps only 21.6% of the variance and the ten digit classes pile on top of each other (5-NN accuracy on the 2D coordinates 0.514). The structure of digits is curved and clustered; a straight-line projection squashes different groups together.</p>
  <p><strong>What this note adds.</strong> A non-linear map that preserves <em>neighbourhoods</em> rather than straight-line variance: each point's nearest neighbours in 64-D remain its nearest neighbours in 2D (digits: 5-NN accuracy 0.954 on the t-SNE map). You will compute every ingredient by hand and learn to read the result without fooling yourself.</p>
  <p><strong>Leads to.</strong> t-SNE is slow on big data, scrambles the large-scale layout (distances between clusters mean little), and cannot place a new point without refitting. <a class="xref" data-note="ml_umap">UMAP</a> keeps the neighbourhood idea but fixes much of that.</p>
  <figure class="viz"><svg viewBox="0 0 640 120" width="640">
<defs><marker id="ts-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="12">
<rect x="10" y="30" width="140" height="56" rx="8" class="fs" stroke="currentColor"/><text x="80" y="52" text-anchor="middle" font-weight="700">Selection</text><text x="80" y="70" text-anchor="middle" class="tm" font-size="10.5">keep columns</text>
<rect x="175" y="30" width="140" height="56" rx="8" class="ft st"/><text x="245" y="52" text-anchor="middle" font-weight="700">PCA</text><text x="245" y="70" text-anchor="middle" class="tm" font-size="10.5">flat projection</text>
<rect x="340" y="24" width="140" height="68" rx="8" class="fb sb" stroke-width="3"/><text x="410" y="48" text-anchor="middle" font-weight="700">t-SNE</text><text x="410" y="66" text-anchor="middle" class="tb" font-size="10.5">keep neighbours, 2D</text><text x="410" y="82" text-anchor="middle" class="tb" font-size="10.5">YOU ARE HERE</text>
<rect x="505" y="30" width="125" height="56" rx="8" class="fg sg"/><text x="567" y="52" text-anchor="middle" font-weight="700">UMAP</text><text x="567" y="70" text-anchor="middle" class="tm" font-size="10.5">faster, global, new pts</text>
<line x1="150" y1="58" x2="173" y2="58" stroke="currentColor" marker-end="url(#ts-a)"/><line x1="315" y1="58" x2="338" y2="58" stroke="currentColor" marker-end="url(#ts-a)"/><line x1="480" y1="58" x2="503" y2="58" stroke="currentColor" marker-end="url(#ts-a)"/>
</g></svg><figcaption>t-SNE is the third note of the Dimensionality Reduction group.</figcaption></figure>

  <h2 id="ts-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <ol class="story">
    <li><b>The visualisation problem</b><span>Q: can we see 64-D digits on paper? → PCA's flat 2D view overlaps classes (0.514). We want a map that keeps neighbours together. But what exactly is "a neighbour" when distances are just numbers?</span></li>
    <li><b>Gaussian neighbour probabilities</b><span>Q: how to turn distances into "how likely is j my neighbour"? → p(j|i) ∝ exp(−d²/2σ²): distances 1, 2, 3, 6 become 0.806, 0.180, 0.015, 0.000 (σ = 1). But what σ? Dense and sparse regions need different widths.</span></li>
    <li><b>Perplexity</b><span>Q: how wide should each point's attention be? → choose σᵢ so the "effective number of neighbours" 2^H hits a target (σ = 1 → 1.72, σ = 2 → 2.87; binary search finds σ ≈ 1.15 for 2). But p(j|i) ≠ p(i|j), and an outlier gets almost no say.</span></li>
    <li><b>Symmetric p_ij</b><span>Q: one similarity per pair? → p_ij = (p(j|i) + p(i|j)) / 2n. Now: what similarity do we give points on the map?</span></li>
    <li><b>Student-t in 2D &amp; the crowding problem</b><span>Q: why not Gaussian again? → 2D has too little room for all moderate neighbours; a heavy-tailed q_ij = (1 + ‖y_i − y_j‖²)⁻¹ lets moderately far points sit much farther. Then how do we compare P with Q?</span></li>
    <li><b>KL divergence</b><span>Q: one number for "how badly the map lies"? → KL(P‖Q) = Σ p log(p/q); tearing neighbours apart costs a lot (1.151), placing strangers close costs little. How do we minimise it?</span></li>
    <li><b>Gradient descent with tricks</b><span>Q: how do we move the points? → gradient 4 Σ (p − q)(y_i − y_j)/(1 + d²), plus early exaggeration and momentum; one step cut KL 0.121 → 0.087. Does it work on real digits?</span></li>
    <li><b>t-SNE on the digits</b><span>Q: does the map separate the ten digits? → yes: 5-NN 0.954, trustworthiness 0.986. But can we read sizes and gaps off the picture?</span></li>
    <li><b>Reading plots</b><span>Q: what is trustworthy? → neighbours yes; a 10× gap shows as 1.7×, a 28.6× wider cluster as the same size. And how much does the picture depend on perplexity?</span></li>
    <li><b>Perplexity effect</b><span>Q: which perplexity? → low = very local (trust(100) 0.861 at 2), high = more global (0.941 at 100). Is the picture at least reproducible?</span></li>
    <li><b>Randomness &amp; initialisation</b><span>Q: same data, same picture? → with init="pca" yes (identical runs); random init moves everything, sharing 82% of neighbours. And how slow is it?</span></li>
    <li><b>Cost</b><span>Q: can it scale? → exact O(n²) per step; Barnes–Hut O(n log n); reduce to ~50 PCs first. Finally, can we use the map as features?</span></li>
    <li><b>Not for features or new points</b><span>Q: can we transform a new digit? → no transform(); refitting moves old points (max 24.3 on a 70-wide map). Next: a method that keeps neighbours <em>and</em> embeds new points → <a class="xref" data-note="ml_umap">UMAP</a>.</span></li>
  </ol>

  <h2 id="ts-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">t-SNE</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Goal</div>
        <ul>
          <li>2D/3D map for <b>looking</b>; keep local neighbours</li>
          <li>Digits: PCA-2D 5-NN 0.514 (21.6% var) → t-SNE 0.954</li>
          <li>Non-linear, non-parametric, stochastic</li>
          <li>💡 Wedding seating: who shares a table matters, table positions don't</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">High-D side</div>
        <ul>
          <li>p(j|i) = exp(−d²/2σᵢ²) / Σₖ exp(−d²ᵢₖ/2σᵢ²)</li>
          <li>d = 1, 2, 3, 6, σ = 1 → .806 .180 .015 .000</li>
          <li><b>Perplexity</b> = 2^H, H = −Σ p log₂ p; σ=1 → 1.72, σ=2 → 2.87</li>
          <li>σᵢ by binary search per point (dense → small σ)</li>
          <li>p_ij = (p(j|i) + p(i|j))/2n, sums to 1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Low-D side</div>
        <ul>
          <li>q_ij = (1 + ‖yᵢ − yⱼ‖²)⁻¹ / Σ (1 + ‖yₖ − yₗ‖²)⁻¹</li>
          <li><b>Crowding problem</b>: 10-D fits 11 equidistant points, 2-D only 3</li>
          <li>Heavy tail: Gaussian sim at d = 3 needs t-distance 9.4</li>
          <li>→ crisp, well-separated islands</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Objective &amp; optimisation</div>
        <ul>
          <li>KL(P‖Q) = Σ p log(p/q); asymmetric</li>
          <li>Neighbours torn apart: 1.151 · strangers too close: −0.115</li>
          <li>∂C/∂yᵢ = 4 Σⱼ (pᵢⱼ − qᵢⱼ)(yᵢ − yⱼ)(1 + ‖yᵢ − yⱼ‖²)⁻¹</li>
          <li>Early exaggeration ×12 (250 its), momentum, lr = auto</li>
          <li>Digits final KL 0.837 after 1,000 iterations</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading plots</div>
        <ul>
          <li>✔ Neighbours, which groups exist</li>
          <li>✘ Gaps: true 10× → 1.7× · ✘ sizes: 28.6× → 1.0×</li>
          <li>Perplexity 5–50 (default 30); check several</li>
          <li>init="pca": reproducible; random init: 82% shared 10-NN</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Practical limits</div>
        <ul>
          <li>Exact O(n²); Barnes–Hut O(n log n), angle 0.5</li>
          <li>Scale → PCA to ~50 → t-SNE</li>
          <li>⚠ No <code>transform</code>; refit moves old points</li>
          <li>⚠ Never model features; never fit before a split</li>
          <li>→ UMAP for speed, global layout, new points</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ts-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Visualisation Problem</span><span class="rm-sub">Digits, and why PCA's picture fails</span></div></div>
      <div class="rm-item rm-done" data-target="ts-p"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">High-D Neighbour Probabilities</span><span class="rm-sub">Gaussian kernel by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ts-perp"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Perplexity</span><span class="rm-sub">Entropy and the σ search</span></div></div>
      <div class="rm-item rm-done" data-target="ts-sym"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Symmetric Similarities</span><span class="rm-sub">One p per pair</span></div></div>
      <div class="rm-item rm-done" data-target="ts-q"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Student-t &amp; Crowding</span><span class="rm-sub">Why heavy tails in 2D</span></div></div>
      <div class="rm-item rm-done" data-target="ts-kl"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The KL Objective</span><span class="rm-sub">What the map is punished for</span></div></div>
      <div class="rm-item rm-done" data-target="ts-opt"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Optimisation</span><span class="rm-sub">Gradient by hand, tricks, from scratch</span></div></div>
      <div class="rm-item rm-done" data-target="ts-digits"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">t-SNE on the Digits</span><span class="rm-sub">sklearn and its parameters</span></div></div>
      <div class="rm-item rm-done" data-target="ts-read"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Reading t-SNE Plots</span><span class="rm-sub">Gaps and sizes lie</span></div></div>
      <div class="rm-item rm-done" data-target="ts-perpfx"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">The Perplexity Effect</span><span class="rm-sub">Local vs global</span></div></div>
      <div class="rm-item rm-done" data-target="ts-random"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Randomness &amp; Initialisation</span><span class="rm-sub">Same data, same picture?</span></div></div>
      <div class="rm-item rm-done" data-target="ts-cost"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Cost &amp; Scaling</span><span class="rm-sub">Exact vs Barnes–Hut</span></div></div>
      <div class="rm-item rm-done" data-target="ts-nofeat"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Not for Features or New Points</span><span class="rm-sub">No transform</span></div></div>
      <div class="rm-item rm-done" data-target="ts-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One chain from distances to map</span></div></div>
      <div class="rm-item rm-done" data-target="ts-compare"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Comparisons &amp; Common Mistakes</span><span class="rm-sub">vs PCA and UMAP</span></div></div>
      <div class="rm-item rm-done" data-target="ts-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ts-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ts-problem"><span class="num">01</span>The Visualisation Problem</h2>
  <p><strong>The question we can't answer yet.</strong> PCA gave us the best flat view of data. For data that forms many separate groups on curved surfaces, is the best flat view good enough to <em>see</em> the groups?</p>
  <h3>The running example</h3>
  <p>sklearn's digits dataset: <strong>1,797 images of handwritten digits</strong> 0–9, each 8 × 8 pixels = <strong>64 columns</strong> of ink intensity (0–16). Every image is a point in 64-D. We know the true digit, but the methods never see it; we use it only to check whether the map put same-digit images together. All code imports this file:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler
X, y = load_digits(return_X_y=True)        # 1,797 handwritten digits, 8x8 = 64 pixel columns
Xs = StandardScaler().fit_transform(X)</div>
  <div class="fx" data-lang="py">from sklearn.decomposition import PCA
from sklearn.manifold import trustworthiness
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from digits import X, y, Xs
print("shape:", X.shape, " classes:", sorted(set(y.tolist())))
pca = PCA(2).fit(Xs)
Z = pca.transform(Xs)
print("PCA 2 components keep", round(pca.explained_variance_ratio_.sum(), 3), "of the variance")
print("5-NN accuracy using only the 2 PCA coordinates:", round(cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean(), 3))
print("5-NN accuracy using all 64 pixels:          ", round(cross_val_score(KNeighborsClassifier(5), Xs, y, cv=5).mean(), 3))
print("trustworthiness of the PCA map:", round(trustworthiness(Xs, Z, n_neighbors=10), 3))</div>
  <div class="fx" data-lang="text">shape: (1797, 64)  classes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
PCA 2 components keep 0.216 of the variance
5-NN accuracy using only the 2 PCA coordinates: 0.514
5-NN accuracy using all 64 pixels:           0.944
trustworthiness of the PCA map: 0.816</div>
  <p>Two PCA components keep only 21.6% of the variance. A 5-NN classifier using just those two coordinates gets 0.514: on the PCA picture, a digit's 5 nearest points have the right label only about half the time, so the classes overlap heavily. In the full 64-D space the same classifier gets 0.944: the neighbourhoods <em>are</em> there; the flat projection destroyed them. <strong>Trustworthiness</strong> (0 to 1) measures this directly: of each point's 10 nearest neighbours on the map, how many were genuinely near in the original space (penalising impostors by how far down the true ranking they were). PCA's map: 0.816.</p>
  <h3>What we want instead</h3>
  <p>Give up on preserving straight-line variance. Preserve the thing a human looks for in a scatter plot: <strong>who is next to whom</strong>. If image i's nearest neighbours in 64-D are three other "7"s, they should also be its nearest neighbours on paper. Far-apart relations can be distorted; near ones must survive. That is t-SNE, introduced by van der Maaten and Hinton (2008), building on Hinton and Roweis's SNE (2002).</p>
  <div class="flow"><span>High-D: who are my neighbours? (Gaussian probabilities)</span><span>Random or PCA 2D layout</span><span>Low-D neighbour probabilities (Student-t)</span><span>Move points until the two match (min KL)</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Seating guests at a big wedding. College friends sit at one table, office colleagues at another, relatives at a third. Who shares a table is meaningful. Which table is near the stage, or how big a table looks, tells you little about how the groups relate. A t-SNE map is that seating plan.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>embedding</strong> is a low-dimensional coordinate yᵢ for each data point xᵢ. <strong>Neighbour-preserving</strong> methods (t-SNE, UMAP) choose the yᵢ so that local neighbourhoods match; <strong>trustworthiness</strong> scores how many map neighbours are true neighbours (1 = perfect).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Concluding from an overlapping PCA plot that "the classes are not separable". 64-D kNN reaches 0.944 on the same data; the overlap is the projection's fault.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: neighbour probabilities.</b> "Keep neighbours" needs a precise, soft definition of neighbour: not a hard top-k list but a number for every pair.</div>

  <h2 id="ts-p"><span class="num">02</span>High-D Neighbour Probabilities</h2>
  <p><strong>The question we can't answer yet.</strong> We have distances between digit images. How do we turn "image j is at distance 2 from image i" into "the probability that i would pick j as its neighbour"?</p>
  <p>Imagine image i chooses one neighbour at random, preferring close ones. Give every other image j a weight that falls off with distance like a bell curve (Gaussian) centred on i, then divide by the total so the weights sum to 1:</p>
  <p><strong>p(j|i) = exp(−dᵢⱼ² / 2σᵢ²) / Σₖ≠ᵢ exp(−dᵢₖ² / 2σᵢ²)</strong></p>
  <p>σᵢ is the width of i's attention. By hand: image i has four other images at distances 1, 2, 3 and 6 (in scaled pixel units).</p>
  <table class="tbl"><caption>Neighbour probabilities for image i</caption>
    <tr><th>distance d</th><th>σ = 1: weight exp(−d²/2)</th><th>σ = 1: p(j|i)</th><th>σ = 2: weight exp(−d²/8)</th><th>σ = 2: p(j|i)</th></tr>
    <tr><td>1</td><td>e^−0.5 = 0.6065</td><td>0.6065/0.7529 = 0.806</td><td>e^−0.125 = 0.8825</td><td>0.484</td></tr>
    <tr><td>2</td><td>e^−2 = 0.1353</td><td>0.180</td><td>e^−0.5 = 0.6065</td><td>0.332</td></tr>
    <tr><td>3</td><td>e^−4.5 = 0.0111</td><td>0.015</td><td>e^−1.125 = 0.3247</td><td>0.178</td></tr>
    <tr><td>6</td><td>e^−18 ≈ 0.0000</td><td>0.000</td><td>e^−4.5 = 0.0111</td><td>0.006</td></tr>
    <tr><td><b>sum</b></td><td>0.7529</td><td>1</td><td>1.8248</td><td>1</td></tr>
  </table>
  <p>With σ = 1, image i is 81% sure its neighbour is the closest image and essentially ignores the one at distance 6. With σ = 2 its attention is spread wider. The code reproduces both columns (and the perplexity we use next).</p>
  <div class="fx" data-lang="py">import numpy as np
d = np.array([1.0, 2.0, 3.0, 6.0])          # distances from image i to four other images
def cond_probs(d, sigma):
    w = np.exp(-d ** 2 / (2 * sigma ** 2))  # Gaussian weight
    return w, w / w.sum()                   # normalise so they sum to 1
def perplexity(p):
    p = p[p &gt; 0]
    H = -(p * np.log2(p)).sum()             # entropy in bits
    return H, 2 ** H
for s in (1.0, 2.0):
    w, p = cond_probs(d, s)
    H, perp = perplexity(p)
    print(f"sigma={s}: weights={w.round(4)} p={p.round(3)} H={H:.3f} bits perplexity={perp:.2f}")
print("4 equal neighbours: perplexity =", perplexity(np.full(4, 0.25))[1])</div>
  <div class="fx" data-lang="text">sigma=1.0: weights=[0.6065 0.1353 0.0111 0.    ] p=[0.806 0.18  0.015 0.   ] H=0.786 bits perplexity=1.72
sigma=2.0: weights=[0.8825 0.6065 0.3247 0.0111] p=[0.484 0.332 0.178 0.006] H=1.523 bits perplexity=2.87
4 equal neighbours: perplexity = 4.0</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>conditional neighbour probability</strong> p(j|i) is the Gaussian-weighted, normalised similarity of xⱼ to xᵢ, with p(i|i) = 0 and Σⱼ p(j|i) = 1. It is a <em>soft</em> nearest-neighbour list.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One global σ for all points fails: in a dense region (many similar "1"s) σ = 1 might include hundreds of neighbours, in a sparse region (odd-looking "8"s) none. Each point needs its own σᵢ.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: perplexity.</b> We need a rule to pick σᵢ for every point, adapting to local density.</div>

  <h2 id="ts-perp"><span class="num">03</span>Perplexity</h2>
  <p><strong>The question we can't answer yet.</strong> How wide should each point's attention be? We want every point to consider "about the same number" of neighbours, whether it sits in a crowded or an empty region.</p>
  <h3>Effective number of neighbours</h3>
  <p>The <strong>entropy</strong> H = −Σ p log₂ p measures how spread a probability distribution is (as in <a class="xref" data-note="ml_dtree">Decision Trees</a>). <strong>Perplexity = 2^H</strong> converts it into "how many equally likely choices it is worth". Check: four equal neighbours (0.25 each) give H = 2 bits, perplexity 4. For σ = 1 above: H = −(0.806 log₂ 0.806 + 0.180 log₂ 0.180 + 0.015 log₂ 0.015) = 0.251 + 0.445 + 0.091 = 0.786 bits → perplexity 2^0.786 = <strong>1.72</strong>. For σ = 2: H = 1.523 → <strong>2.87</strong>. Wider σ, more effective neighbours.</p>
  <h3>Finding σᵢ by binary search</h3>
  <p>You choose one perplexity (sklearn default 30); t-SNE searches each point's σᵢ so its perplexity matches. Perplexity grows with σ, so binary search works. Target perplexity 2 for our image:</p>
  <div class="fx" data-lang="py">import numpy as np
d = np.array([1.0, 2.0, 3.0, 6.0])
def perp(sigma):
    w = np.exp(-d ** 2 / (2 * sigma ** 2)); p = w / w.sum()
    p = p[p &gt; 1e-12]
    return 2 ** (-(p * np.log2(p)).sum())
lo, hi, target = 0.1, 10.0, 2.0                # look for sigma giving perplexity 2
for it in range(1, 9):
    mid = (lo + hi) / 2
    pm = perp(mid)
    print(f"iter {it}: sigma={mid:.4f} perplexity={pm:.3f} -&gt; {'too wide, shrink' if pm &gt; target else 'too narrow, widen'}")
    if pm &gt; target: hi = mid
    else: lo = mid</div>
  <div class="fx" data-lang="text">iter 1: sigma=5.0500 perplexity=3.882 -&gt; too wide, shrink
iter 2: sigma=2.5750 perplexity=3.226 -&gt; too wide, shrink
iter 3: sigma=1.3375 perplexity=2.276 -&gt; too wide, shrink
iter 4: sigma=0.7188 perplexity=1.231 -&gt; too narrow, widen
iter 5: sigma=1.0281 perplexity=1.776 -&gt; too narrow, widen
iter 6: sigma=1.1828 perplexity=2.045 -&gt; too wide, shrink
iter 7: sigma=1.1055 perplexity=1.914 -&gt; too narrow, widen
iter 8: sigma=1.1441 perplexity=1.981 -&gt; too narrow, widen</div>
  <p>Start in the middle of [0.1, 10]: σ = 5.05 gives 3.88, too many neighbours, so search lower. After 8 halvings σ ≈ 1.14–1.18, perplexity ≈ 2. A point in a dense region gets a small σᵢ, a point in a sparse region a large one: this is how t-SNE adapts to density, and (section 09) why it also <em>erases</em> density differences from the picture.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking every guest "who are your closest 5 friends here?". A guest in a crowded hall looks only at the next table; a guest alone on the terrace has to look far. Perplexity fixes the number 5; σ is how far each guest has to look.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Perplexity</strong> Perp(Pᵢ) = 2^H(Pᵢ), H(Pᵢ) = −Σⱼ p(j|i) log₂ p(j|i): a smooth effective neighbour count. Typical 5–50; must be smaller than n (sklearn requires perplexity &lt; n). σᵢ is set per point by binary search.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Perplexity is not "the number of clusters" and not exactly k nearest neighbours. It is a smooth neighbourhood size; changing it changes the picture (section 10).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: symmetric similarities.</b> p(j|i) and p(i|j) differ because σᵢ ≠ σⱼ. We need one similarity per pair for the map to match.</div>

  <h2 id="ts-sym"><span class="num">04</span>Symmetric Similarities</h2>
  <p><strong>The question we can't answer yet.</strong> Image i may see j as its closest neighbour while j, with a different σ, barely notices i. Which number should the map honour?</p>
  <p>t-SNE averages: <strong>pᵢⱼ = (p(j|i) + p(i|j)) / 2n</strong>. The division by 2n makes all pᵢⱼ sum to 1 over all ordered pairs. It also protects outliers: an outlier's own row p(·|outlier) still sums to 1, so every pair involving it gets at least 1/(2n) total, and it stays attached to the map.</p>
  <p>By hand on three images at positions 0, 1 and 3 along one direction (σ = 1 for all, for simplicity):</p>
  <ul>
    <li>Image 1 (at 0): distances 1, 3 → weights 0.6065, 0.0111 → p(2|1) = 0.982, p(3|1) = 0.018.</li>
    <li>Image 2 (at 1): distances 1, 2 → 0.6065, 0.1353 → p(1|2) = 0.818, p(3|2) = 0.182.</li>
    <li>Image 3 (at 3): distances 3, 2 → 0.0111, 0.1353 → p(1|3) = 0.076, p(2|3) = 0.924.</li>
    <li>p₁₂ = (0.982 + 0.818)/6 = <strong>0.300</strong>; p₁₃ = (0.018 + 0.076)/6 = <strong>0.016</strong>; p₂₃ = (0.182 + 0.924)/6 = <strong>0.184</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([0.0, 1.0, 3.0])                  # three images, positions on one high-D "line"
D2 = (x[:, None] - x[None, :]) ** 2
W = np.exp(-D2 / 2)                            # sigma = 1 for everyone, for simplicity
np.fill_diagonal(W, 0)
Pc = W / W.sum(axis=1, keepdims=True)          # row i = p(j | i)
print("conditional p(j|i):\\n", Pc.round(3))
P = (Pc + Pc.T) / (2 * len(x))                 # symmetric joint p_ij
print("joint p_ij:\\n", P.round(3), " sum =", P.sum().round(3))</div>
  <div class="fx" data-lang="text">conditional p(j|i):
 [[0.    0.982 0.018]
 [0.818 0.    0.182]
 [0.076 0.924 0.   ]]
joint p_ij:
 [[0.    0.3   0.016]
 [0.3   0.    0.184]
 [0.016 0.184 0.   ]]  sum = 1.0</div>
  <p>Each pair appears twice (pᵢⱼ and pⱼᵢ), so 2 × (0.300 + 0.016 + 0.184) = 1. These three images and their pᵢⱼ are our hand example for the rest of the method.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>joint high-dimensional similarity</strong> pᵢⱼ = (p(j|i) + p(i|j))/(2n), symmetric, pᵢᵢ = 0, Σᵢⱼ pᵢⱼ = 1.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Almost all pᵢⱼ are tiny. In practice t-SNE computes them only for about 3 × perplexity nearest neighbours of each point and treats the rest as 0; that is one reason perplexity also controls speed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: similarities on the map.</b> P describes the 64-D truth. The 2D map needs its own similarities Q to compare against, and the choice of formula turns out to be crucial.</div>

  <h2 id="ts-q"><span class="num">05</span>Student-t Similarities &amp; the Crowding Problem</h2>
  <p><strong>The question we can't answer yet.</strong> On the map we need q_ij, "how close are i and j on paper". The obvious choice is the same Gaussian. Why does t-SNE (the "t") use a Student-t curve instead?</p>
  <h3>The crowding problem</h3>
  <p>In 10-D you can place 11 points all at the same distance from each other (the corners of a simplex); in 2D you can place only 3 (a triangle). More generally, a point in high-D can have many neighbours at a <em>moderate</em> distance, all spread around it in many directions. In 2D there is not enough room: the area at moderate distance is too small, so those moderate neighbours get squeezed towards the centre, crushing everything together. That is the <strong>crowding problem</strong>, and it is why the original SNE produced a crowded blob.</p>
  <h3>The fix: a heavy-tailed curve on the map</h3>
  <p>On the map t-SNE uses the Student-t with one degree of freedom (Cauchy) kernel:</p>
  <p><strong>q_ij = (1 + ‖yᵢ − yⱼ‖²)⁻¹ / Σₖ≠ₗ (1 + ‖yₖ − yₗ‖²)⁻¹</strong></p>
  <p>It falls off like 1/d² instead of e^(−d²): a "heavy tail". To represent the same similarity, the map can therefore put moderately distant points <em>much</em> farther apart. By hand, solve 1/(1 + y²) = e^(−d²/2) for the map distance y:</p>
  <div class="fx" data-lang="py">import numpy as np
print("high-D dist | Gaussian sim | 2-D t-dist giving the same sim")
for d in (0.5, 1, 2, 3):
    g = np.exp(-d ** 2 / 2)                     # high-D similarity (sigma = 1)
    y = np.sqrt(1 / g - 1)                      # solve 1/(1+y^2) = g
    print(f"{d:11.1f} | {g:12.4f} | {y:8.3f}")
print("KL cost of (p=0.5, q=0.05):", round(0.5 * np.log(0.5 / 0.05), 3), " of (p=0.05, q=0.5):", round(0.05 * np.log(0.05 / 0.5), 3))</div>
  <div class="fx" data-lang="text">high-D dist | Gaussian sim | 2-D t-dist giving the same sim
        0.5 |       0.8825 |    0.365
        1.0 |       0.6065 |    0.805
        2.0 |       0.1353 |    2.528
        3.0 |       0.0111 |    9.435
KL cost of (p=0.5, q=0.05): 1.151  of (p=0.05, q=0.5): -0.115</div>
  <p>A close pair (high-D distance 0.5) stays close (0.365). A pair at distance 2 goes to 2.53; at distance 3, to 9.4. Near things stay near, moderately far things get pushed far: room is made, and clusters separate into crisp islands. (The last line of output belongs to the next section.)</p>
  <h3>q by hand for our three images</h3>
  <p>Place them on a 1-D map at y = 0, 1, 2. Kernel values: pair (1,2) at distance 1 → 1/(1+1) = 0.5; (1,3) at 2 → 1/5 = 0.2; (2,3) at 1 → 0.5. Over ordered pairs the total is 2 × 1.2 = 2.4, so q₁₂ = 0.5/2.4 = <strong>0.208</strong>, q₁₃ = <strong>0.083</strong>, q₂₃ = <strong>0.208</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Drawing a city's friendship groups on a small notice board. If you keep true scale, the groups overlap in the middle. So you keep each group's members tight but push the groups to the edges of the board, using space generously between them.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Low-dimensional similarity</strong> qᵢⱼ uses a Student-t (1 degree of freedom) kernel (1 + ‖yᵢ − yⱼ‖²)⁻¹, normalised over all pairs. Its heavy tail solves the <strong>crowding problem</strong>: the mismatch between how much volume is available at moderate distances in high-D versus 2D.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The heavy tail is exactly why gaps between t-SNE clusters are unreliable: the map exaggerates moderate distances on purpose, and the exaggeration is not uniform.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the KL objective.</b> We have P (truth) and Q (the map). We need a single score of how badly Q misrepresents P, which the map can then minimise.</div>

  <h2 id="ts-kl"><span class="num">06</span>The KL Objective</h2>
  <p><strong>The question we can't answer yet.</strong> How do we measure the mismatch between P and Q in one number, and which kinds of mismatch should cost the most?</p>
  <p>t-SNE minimises the <strong>Kullback–Leibler divergence</strong>:</p>
  <p><strong>C = KL(P‖Q) = Σᵢ≠ⱼ pᵢⱼ log(pᵢⱼ / qᵢⱼ)</strong></p>
  <p>It is 0 when Q = P and positive otherwise. Each pair's term is weighted by pᵢⱼ, so it is <strong>asymmetric</strong>:</p>
  <ul>
    <li>True neighbours drawn far apart (p = 0.5, q = 0.05): 0.5 × ln(10) = <strong>1.151</strong>, expensive.</li>
    <li>Strangers drawn close (p = 0.05, q = 0.5): 0.05 × ln(0.1) = <strong>−0.115</strong>, almost free (the normalisation of Q makes up the difference elsewhere, but only weakly).</li>
  </ul>
  <p>So t-SNE fights hard to keep neighbours together and cares little where non-neighbours go: <strong>local structure is preserved, global structure is not guaranteed</strong>. By hand for our three images (p₁₂ = 0.300, p₁₃ = 0.016, p₂₃ = 0.184), summing both orderings of each pair:</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([0.0, 1.0, 3.0])
W = np.exp(-(x[:, None] - x[None, :]) ** 2 / 2); np.fill_diagonal(W, 0)
Pc = W / W.sum(1, keepdims=True); P = (Pc + Pc.T) / 6
def Q_of(y):
    T = 1 / (1 + (y[:, None] - y[None, :]) ** 2); np.fill_diagonal(T, 0)   # Student-t kernel
    return T / T.sum()
def KL(P, Q):
    m = P &gt; 0
    return (P[m] * np.log(P[m] / Q[m])).sum()
for y in (np.array([0.0, 1.0, 3.0]), np.array([0.0, 1.0, 2.0]), np.array([0.0, 3.0, 1.0])):
    Q = Q_of(y)
    print(f"y={y}: q12={Q[0,1]:.3f} q13={Q[0,2]:.3f} q23={Q[1,2]:.3f}  KL={KL(P, Q):.4f}")
print(f"p12={P[0,1]:.3f} p13={P[0,2]:.3f} p23={P[1,2]:.3f}")</div>
  <div class="fx" data-lang="text">y=[0. 1. 3.]: q12=0.312 q13=0.062 q23=0.125  KL=0.0755
y=[0. 1. 2.]: q12=0.208 q13=0.083 q23=0.208  KL=0.1213
y=[0. 3. 1.]: q12=0.063 q13=0.312 q23=0.125  KL=0.9906
p12=0.300 p13=0.016 p23=0.184</div>
  <p>Map y = (0, 1, 2): KL = 2 × [0.300 ln(0.300/0.208) + 0.016 ln(0.016/0.083) + 0.184 ln(0.184/0.208)] ≈ 2 × (0.110 − 0.026 − 0.023) = <strong>0.121</strong>. The map that copies the original positions (0, 1, 3) scores 0.076. The map that swaps images 2 and 3 (0, 3, 1), tearing the close pair 1–2 apart, scores 0.991: thirteen times worse.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>KL divergence</strong> KL(P‖Q) = Σ p log(p/q) ≥ 0, = 0 iff P = Q; not symmetric. sklearn reports the final value as <code>kl_divergence_</code>; lower is better for the same data and perplexity, but values are not comparable across perplexities.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing <code>kl_divergence_</code> between runs with different perplexities to pick "the best perplexity". P itself changes with perplexity, so the numbers measure different targets.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: optimisation.</b> We can score a map. We need a procedure that moves 1,797 points to make the score small.</div>

  <h2 id="ts-opt"><span class="num">07</span>Optimisation</h2>
  <p><strong>The question we can't answer yet.</strong> How do the map points move so that KL falls?</p>
  <h3>The gradient, in words and by hand</h3>
  <p>Differentiating KL with respect to one map point gives a neat formula:</p>
  <p><strong>∂C/∂yᵢ = 4 Σⱼ (pᵢⱼ − qᵢⱼ) (yᵢ − yⱼ) (1 + ‖yᵢ − yⱼ‖²)⁻¹</strong></p>
  <p>Read it as springs. If pᵢⱼ &gt; qᵢⱼ (closer in truth than on the map) the pair attracts; if pᵢⱼ &lt; qᵢⱼ it repels; the factor (1 + d²)⁻¹ weakens forces between far-apart points. For y = (0, 1, 2), image 1 (at 0): pair (1,2): (0.300 − 0.208)(0 − 1)(0.5) = −0.046; pair (1,3): (0.016 − 0.083)(0 − 2)(0.2) = +0.027; total × 4 = <strong>−0.075</strong>. A negative gradient means "moving right lowers KL": image 1 is pulled towards its true neighbour 2. Gradient descent moves y ← y − η·gradient.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([0.0, 1.0, 3.0])
W = np.exp(-(x[:, None] - x[None, :]) ** 2 / 2); np.fill_diagonal(W, 0)
Pc = W / W.sum(1, keepdims=True); P = (Pc + Pc.T) / 6
def kl_and_grad(y):
    diff = y[:, None] - y[None, :]
    T = 1 / (1 + diff ** 2); np.fill_diagonal(T, 0)
    Q = T / T.sum()
    m = P &gt; 0
    kl = (P[m] * np.log(P[m] / Q[m])).sum()
    grad = 4 * ((P - Q) * T * diff).sum(axis=1)      # dC/dy_i
    return kl, grad, Q
y = np.array([0.0, 1.0, 2.0])
kl, g, Q = kl_and_grad(y)
print("q:", Q[0, 1].round(4), Q[0, 2].round(4), Q[1, 2].round(4), " KL:", kl.round(4))
print("gradient:", g.round(4))
eps = 1e-6
num = [(kl_and_grad(y + eps * np.eye(3)[i])[0] - kl_and_grad(y - eps * np.eye(3)[i])[0]) / (2 * eps) for i in range(3)]
print("numerical check:", np.round(num, 4))
y2 = y - 1 * g                                        # one step, learning rate 1
print("after one step y =", y2.round(3), " KL =", kl_and_grad(y2)[0].round(4))</div>
  <div class="fx" data-lang="text">q: 0.2083 0.0833 0.2083  KL: 0.1213
gradient: [-0.0749  0.231  -0.1561]
numerical check: [-0.0749  0.231  -0.1561]
after one step y = [0.075 0.769 2.156]  KL = 0.0872</div>
  <p>The formula matches a numerical derivative. Image 2 has gradient +0.231 (pulled left, towards image 1: p₁₂ &gt; q₁₂), image 3 has −0.156 (pushed right, away: p₁₃, p₂₃ &lt; q). One step with learning rate 1 moves the map to (0.075, 0.769, 2.156) and KL falls from 0.121 to 0.087. (A step that is too big overshoots; learning rate matters.)</p>
  <h3>The tricks that make it work</h3>
  <ul>
    <li><strong>Early exaggeration</strong>: for the first 250 iterations multiply all p by 12. Attractions dominate, clusters form tight and can move past each other freely; then exaggeration is switched off and the map relaxes.</li>
    <li><strong>Momentum</strong>: each step adds a fraction (0.5, later 0.8) of the previous step, smoothing the path.</li>
    <li><strong>Learning rate</strong>: sklearn's <code>learning_rate="auto"</code> = max(n / early_exaggeration / 4, 50).</li>
    <li><strong>Initialisation</strong>: small random positions, or (sklearn default) the first two PCA components scaled down.</li>
  </ul>
  <h3>A tiny t-SNE from scratch</h3>
  <p>All the pieces in 30 lines: 90 points in 3 groups in 10-D (stand-ins for three digit classes), perplexity 10, exact gradients, 100 iterations of exaggeration then 400 normal ones.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
centres = rng.normal(0, 4, (3, 10))                          # 3 groups of images in 10-D
Xh = np.vstack([rng.normal(c, 1.0, (30, 10)) for c in centres]); lab = np.repeat([0, 1, 2], 30)
n = len(Xh)

def joint_p(X, perplexity=10):
    D2 = ((X[:, None] - X[None]) ** 2).sum(-1)
    P = np.zeros((n, n))
    for i in range(n):                                       # binary search sigma_i per point
        lo, hi = 1e-3, 1e3
        for _ in range(60):
            s = (lo + hi) / 2
            w = np.exp(-D2[i] / (2 * s * s)); w[i] = 0; p = w / w.sum()
            H = -(p[p &gt; 0] * np.log2(p[p &gt; 0])).sum()
            lo, hi = (lo, s) if 2 ** H &gt; perplexity else (s, hi)
        P[i] = p
    return (P + P.T) / (2 * n)                               # symmetrise

def tsne(P, iters=500, lr=50.0, exag=12.0, seed=0):
    Y = np.random.default_rng(seed).normal(0, 1e-2, (n, 2))   # tiny random start
    vel = np.zeros_like(Y)
    for it in range(iters):
        Pe = P * exag if it &lt; 100 else P                     # early exaggeration
        diff = Y[:, None] - Y[None]
        T = 1 / (1 + (diff ** 2).sum(-1)); np.fill_diagonal(T, 0)
        Q = T / T.sum()
        grad = 4 * (((Pe - Q) * T)[:, :, None] * diff).sum(1)
        mom = 0.5 if it &lt; 100 else 0.8
        vel = mom * vel - lr * grad; Y += vel                # gradient step with momentum
        if it in (0, 99, 100, 250, 499):
            kl = (P[P &gt; 0] * np.log(P[P &gt; 0] / np.maximum(Q[P &gt; 0], 1e-12))).sum()
            print(f"iter {it:3d}  KL = {kl:.3f}")
    return Y

Y = tsne(joint_p(Xh))
cent = np.array([Y[lab == k].mean(0) for k in range(3)])
nearest = np.argmin(((Y[:, None] - cent[None]) ** 2).sum(-1), axis=1)
print("points closest to their own group's centre:", (nearest == lab).mean())</div>
  <div class="fx" data-lang="text">iter   0  KL = 2.060
iter  99  KL = 1.912
iter 100  KL = 1.775
iter 250  KL = 0.505
iter 499  KL = 0.407
points closest to their own group's centre: 1.0</div>
  <p>KL starts at 2.06 (random tiny map), barely moves during exaggeration (the exaggerated P is not the target being measured), drops as soon as exaggeration ends, and settles at 0.407. Every point ends closest to its own group's centre: three clean islands.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>t-SNE is optimised by <strong>gradient descent with momentum</strong> on KL(P‖Q), with <strong>early exaggeration</strong> (P × α, α = 12 by default, for the first 250 iterations) to form well-separated clusters early.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Stopping too early. If <code>max_iter</code> is small, clusters are still contracting and may look artificially round or merged. Defaults (1,000 iterations) are fine for most data sets.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the real digits.</b> The toy works. Does sklearn's t-SNE separate the ten digits, and which parameters matter?</div>

  <h2 id="ts-digits"><span class="num">08</span>t-SNE on the Digits</h2>
  <p><strong>The question we can't answer yet.</strong> PCA's map gave 5-NN 0.514. What does t-SNE achieve on the same 1,797 digits?</p>
  <div class="fx" data-lang="py">from sklearn.manifold import TSNE, trustworthiness
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from digits import Xs, y
tsne = TSNE(n_components=2, perplexity=30, init="pca", random_state=0)
Z = tsne.fit_transform(Xs)
print("embedding shape:", Z.shape, " final KL:", round(tsne.kl_divergence_, 3), " iterations:", tsne.n_iter_)
print("5-NN accuracy on the 2 t-SNE coordinates:", round(cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean(), 3))
print("trustworthiness:", round(trustworthiness(Xs, Z, n_neighbors=10), 3))</div>
  <div class="fx" data-lang="text">embedding shape: (1797, 2)  final KL: 0.837  iterations: 999
5-NN accuracy on the 2 t-SNE coordinates: 0.954
trustworthiness: 0.986</div>
  <p>The map is 1,797 × 2. A 5-NN classifier on just the two t-SNE coordinates reaches <strong>0.954</strong> (PCA map: 0.514; all 64 pixels: 0.944), and trustworthiness is 0.986 (PCA: 0.816). Each digit forms its own island; the few mixed points are genuinely ambiguous handwriting (a 1 that looks like a 7). <code>kl_divergence_</code> = 0.837 is the final cost; <code>n_iter_</code> is the iteration count.</p>
  <table class="tbl"><caption>sklearn <code>TSNE</code> parameters</caption>
    <tr><th>Parameter</th><th>Default</th><th>Meaning / advice</th></tr>
    <tr><td><code>n_components</code></td><td>2</td><td>2 or 3; Barnes–Hut supports at most 3</td></tr>
    <tr><td><code>perplexity</code></td><td>30</td><td>Effective neighbours; try 5–50, must be &lt; n</td></tr>
    <tr><td><code>early_exaggeration</code></td><td>12</td><td>Higher = tighter, more separated early clusters</td></tr>
    <tr><td><code>learning_rate</code></td><td>"auto"</td><td>max(n/12/4, 50); too low → compressed ball, too high → scattered "ball of points"</td></tr>
    <tr><td><code>max_iter</code></td><td>1000</td><td>Total iterations (older versions: <code>n_iter</code>)</td></tr>
    <tr><td><code>init</code></td><td>"pca"</td><td>PCA start: reproducible, better global layout; or "random"</td></tr>
    <tr><td><code>method</code></td><td>"barnes_hut"</td><td>O(n log n) approximation; "exact" is O(n²)</td></tr>
    <tr><td><code>angle</code></td><td>0.5</td><td>Barnes–Hut accuracy/speed trade-off (lower = more accurate)</td></tr>
    <tr><td><code>metric</code></td><td>"euclidean"</td><td>Any distance; "cosine" for text embeddings</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>Fix for reproducibility</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to scale. t-SNE uses Euclidean distances, so unscaled columns with big units dominate exactly as in PCA. Scale first (pixels share a unit, but we standardised anyway for consistency with the other notes).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: reading the plot.</b> The islands look convincing. Can we read the distances between islands, or their sizes, as facts about the data?</div>

  <h2 id="ts-read"><span class="num">09</span>Reading t-SNE Plots</h2>
  <p><strong>The question we can't answer yet.</strong> On the digits map, the "0" island sits far from the "1" island and the "8" island looks bigger than the "6". Do those observations mean anything?</p>
  <p>To find out we need data where we <em>know</em> the truth: three groups in 10-D where C is 10× farther from A than B is, and two groups where one is 28.6× more spread out than the other.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
<text x="20" y="18">A–C gap ÷ A–B gap (true: C is 10× farther)</text>
<g text-anchor="end"><text x="100" y="45">original</text><text x="100" y="70">PCA</text><text x="100" y="95">t-SNE</text></g>
<rect x="110" y="32" width="300" height="17" class="fs" stroke="currentColor"/><text x="418" y="45">10.0×</text>
<rect x="110" y="57" width="300" height="17" class="fb"/><text x="418" y="70">10.0×</text>
<rect x="110" y="82" width="51" height="17" class="fr"/><text x="169" y="95" class="tr">1.7×</text>
<text x="20" y="125">Wide ÷ tight cluster spread:</text><text x="230" y="125">original 28.6×</text><text x="360" y="125" class="tr">t-SNE 1.0×</text>
<text x="20" y="143" class="tm">10-D Gaussian groups, real runs (code below)</text>
</svg><figcaption>t-SNE squeezed a 10× gap to 1.7× and drew a 28.6× wider cluster at the same size. PCA, being linear, kept the gap exactly.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
rng = np.random.default_rng(0)
# three groups of "digit-like" points in 10-D: A and B close, C ten times farther
cent = np.zeros((3, 10)); cent[1, 0] = 5; cent[2, 0] = 50
X3 = np.vstack([rng.normal(c, 1.0, (200, 10)) for c in cent]); y3 = np.repeat([0, 1, 2], 200)
def gaps(name, Z):
    c = np.array([Z[y3 == i].mean(0) for i in range(3)])         # group centres
    ab, ac = np.linalg.norm(c[0] - c[1]), np.linalg.norm(c[0] - c[2])
    print(f"{name:9s} A-B={ab:6.2f} A-C={ac:6.2f} ratio={ac / ab:5.1f}")
gaps("original", X3)
gaps("PCA", PCA(2).fit_transform(X3))
gaps("t-SNE", TSNE(2, perplexity=30, random_state=0).fit_transform(X3))
# a tight group and a wide group
X2 = np.vstack([rng.normal(0, 0.1, (200, 10)), rng.normal(20, 3.0, (200, 10))]); y2 = np.repeat([0, 1], 200)
for name, Z in [("original", X2), ("t-SNE", TSNE(2, random_state=0).fit_transform(X2))]:
    sp = [np.linalg.norm(Z[y2 == i] - Z[y2 == i].mean(0), axis=1).mean() for i in range(2)]
    print(f"{name:9s} spread tight={sp[0]:.2f} wide={sp[1]:.2f} ratio={sp[1] / sp[0]:.1f}")</div>
  <div class="fx" data-lang="text">original  A-B=  5.00 A-C= 50.13 ratio= 10.0
PCA       A-B=  4.99 A-C= 50.13 ratio= 10.0
t-SNE     A-B= 28.46 A-C= 47.23 ratio=  1.7
original  spread tight=0.32 wide=9.03 ratio=28.6
t-SNE     spread tight=6.41 wide=6.35 ratio=1.0</div>
  <p>PCA keeps the true 10× ratio (it only rotates). t-SNE shows 1.7×: the A–B gap was inflated (heavy tail) and the A–C gap compressed (KL hardly cares about far pairs). In the second test the wide group is 28.6× more spread out, but t-SNE draws both the same size (1.0×), because each point's σᵢ adapts to its local density, so density differences vanish.</p>
  <table class="tbl">
    <tr><th>You see in a t-SNE plot</th><th>Can you trust it?</th></tr>
    <tr><td>Points that sit together</td><td><strong>Yes</strong>: they are neighbours in high-D</td></tr>
    <tr><td>Separate islands</td><td><strong>Mostly</strong>: check at several perplexities</td></tr>
    <tr><td>Distance between two islands</td><td><strong>No</strong>: true 10× became 1.7×</td></tr>
    <tr><td>Island size / spread / density</td><td><strong>No</strong>: a 28.6× wider group drew the same size</td></tr>
    <tr><td>Axes, rotation, absolute position</td><td><strong>No</strong>: arbitrary</td></tr>
    <tr><td>Small clumps at low perplexity</td><td><strong>Careful</strong>: noise can form clumps when perplexity is very low</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A metro map: you can trust which stations are next to each other, not the distances or the size of a neighbourhood on the paper.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Cluster A is far from cluster B, so they are very different" and "cluster C is big, so it is diverse" are both unsupported by a t-SNE plot. Check such claims in the original space (distances between class means, within-class variance).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: perplexity.</b> We used perplexity 30. How much would another value change the picture and these readings?</div>

  <h2 id="ts-perpfx"><span class="num">10</span>The Perplexity Effect</h2>
  <p><strong>The question we can't answer yet.</strong> Perplexity sets how many neighbours each point "looks at". Is there a right value, and what changes as we vary it?</p>
  <div class="fx" data-lang="py">from sklearn.manifold import TSNE, trustworthiness
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
from digits import Xs, y
for p in (2, 5, 30, 100):
    t = TSNE(2, perplexity=p, random_state=0)
    Z = t.fit_transform(Xs)
    print(f"perplexity {p:3d}: KL {t.kl_divergence_:.3f}  trust(10) {trustworthiness(Xs, Z, n_neighbors=10):.3f}  "
          f"trust(100) {trustworthiness(Xs, Z, n_neighbors=100):.3f}  5-NN {cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">perplexity   2: KL 0.925  trust(10) 0.970  trust(100) 0.861  5-NN 0.932
perplexity   5: KL 0.977  trust(10) 0.982  trust(100) 0.912  5-NN 0.952
perplexity  30: KL 0.837  trust(10) 0.986  trust(100) 0.934  5-NN 0.954
perplexity 100: KL 0.726  trust(10) 0.984  trust(100) 0.941  5-NN 0.945</div>
  <p>Two trustworthiness scores tell the story. trust(10), "are the 10 nearest map neighbours real?", is high everywhere (0.970–0.986). trust(100), a wider neighbourhood, rises steadily with perplexity: 0.861 at 2, 0.912 at 5, 0.934 at 30, 0.941 at 100. Low perplexity looks only at the very closest few, can fragment classes into sub-clumps and lets noise form clumps; high perplexity respects larger neighbourhoods and gives more coherent, globally sensible layouts, at more computation. 5-NN accuracy peaks around 30. The digits are robust; on harder data the picture can change a lot.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Low perplexity → emphasises very local structure; high perplexity → smoother, more global structure. Rule of thumb: 5–50, larger for larger n; always look at several values and trust only structure that persists.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing the perplexity that "shows the clusters you expected". That is confirmation bias with a knob; report the range you tried.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: randomness.</b> Even at a fixed perplexity, t-SNE is "stochastic". Will a colleague running the same code see the same picture?</div>

  <h2 id="ts-random"><span class="num">11</span>Randomness &amp; Initialisation</h2>
  <p><strong>The question we can't answer yet.</strong> The optimisation is non-convex: different starting maps can end in different local minima. How different are the results in practice?</p>
  <p>We run t-SNE twice with different seeds, for both initialisations, and compare: the largest coordinate change, the share of each point's 10 nearest map neighbours that are the same in both runs, and whether the 10 digit-class centres keep the same relative distances.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.manifold import TSNE
from sklearn.neighbors import NearestNeighbors
from digits import Xs, y
def knn_sets(Z, k=10):
    idx = NearestNeighbors(n_neighbors=k + 1).fit(Z).kneighbors(Z, return_distance=False)[:, 1:]
    return [set(r) for r in idx]
def overlap(A, B):
    return np.mean([len(a &amp; b) / len(a) for a, b in zip(A, B)])
def centre_corr(Z1, Z2):              # do the 10 digit-class centres sit in the same relative places?
    c1 = np.array([Z1[y == k].mean(0) for k in range(10)]); c2 = np.array([Z2[y == k].mean(0) for k in range(10)])
    d1 = np.linalg.norm(c1[:, None] - c1[None], axis=-1); d2 = np.linalg.norm(c2[:, None] - c2[None], axis=-1)
    iu = np.triu_indices(10, 1)
    return np.corrcoef(d1[iu], d2[iu])[0, 1]
runs = {(init, s): TSNE(2, init=init, random_state=s).fit_transform(Xs) for init in ("pca", "random") for s in (0, 1)}
for init in ("pca", "random"):
    a, b = runs[(init, 0)], runs[(init, 1)]
    print(f"init={init:6s} seeds 0 vs 1: max coord change {np.abs(a - b).max():6.1f} | "
          f"shared 10-NN {overlap(knn_sets(a), knn_sets(b)):.3f} | class-centre distance corr {centre_corr(a, b):.3f}")</div>
  <div class="fx" data-lang="text">init=pca    seeds 0 vs 1: max coord change    0.0 | shared 10-NN 1.000 | class-centre distance corr 1.000
init=random seeds 0 vs 1: max coord change   98.9 | shared 10-NN 0.817 | class-centre distance corr 0.648</div>
  <p>With <code>init="pca"</code> (default since sklearn 1.2) the two runs are identical: the start is deterministic and Barnes–Hut has no other randomness. With <code>init="random"</code>, coordinates move by up to 98.9 units, yet 82% of 10-nearest-neighbour sets are shared: the local story is stable, but the arrangement of islands changes (class-centre distance correlation only 0.648). PCA initialisation also gives a more faithful global layout, because the starting map already has PCA's large-scale structure.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing two t-SNE plots made on different data (before/after, two hospitals) by eye. Positions, rotations and gaps are not comparable across fits; compare neighbourhood statistics instead.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: cost.</b> The digits took seconds. What happens with a million points?</div>

  <h2 id="ts-cost"><span class="num">12</span>Cost &amp; Scaling</h2>
  <p><strong>The question we can't answer yet.</strong> The gradient sums over every pair of points. How expensive is that, and how does sklearn make it affordable?</p>
  <p>Exact t-SNE computes all n² pairwise q's and forces every iteration: for n = 1,000,000 that is 10¹² pairs per iteration. <strong>Barnes–Hut t-SNE</strong> (van der Maaten, 2014) uses only ~3 × perplexity nearest neighbours for P (sparse), and approximates the repulsive forces from far-away groups of points by a single force from their centre, using a quadtree: O(n log n) per iteration. <code>angle</code> (θ) decides when a group is "far enough" to summarise: bigger θ = faster, rougher.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.manifold import TSNE, trustworthiness
from digits import Xs
S = Xs[:500]                                                      # small sample so "exact" is affordable
for method, angle in [("exact", None), ("barnes_hut", 0.2), ("barnes_hut", 0.5), ("barnes_hut", 0.8)]:
    kw = {} if angle is None else {"angle": angle}
    t = TSNE(2, method=method, random_state=0, **kw)
    Z = t.fit_transform(S)
    print(f"{method:10s} angle={str(angle):4s} KL={t.kl_divergence_:.3f} trust={trustworthiness(S, Z, n_neighbors=10):.3f}")
n = 1_000_000
print(f"pairs for n = 1,000,000: n^2 = {n**2:.0e}; n log2 n = {n*np.log2(n):.1e}")</div>
  <div class="fx" data-lang="text">exact      angle=None KL=0.377 trust=0.985
barnes_hut angle=0.2  KL=0.448 trust=0.986
barnes_hut angle=0.5  KL=0.446 trust=0.986
barnes_hut angle=0.8  KL=0.443 trust=0.986
pairs for n = 1,000,000: n^2 = 1e+12; n log2 n = 2.0e+07</div>
  <p>On 500 digits, the exact method reaches the lowest KL (0.377); Barnes–Hut is a little higher (0.443–0.448 for every angle) with the same trustworthiness (0.986 vs 0.985): the approximation costs almost nothing in neighbourhood quality. The standard recipe for big data: <strong>scale → PCA to ~50 dimensions → t-SNE</strong>. PCA removes noise directions and makes neighbour search much faster. Beyond ~100,000 points, use openTSNE / FIt-SNE (FFT-accelerated) or UMAP.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Exact t-SNE</strong>: O(n²) time and memory per iteration. <strong>Barnes–Hut t-SNE</strong>: sparse kNN-based P plus tree-approximated repulsion, O(n log n), only for 2–3 output dimensions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Asking for <code>n_components=10</code> with the default Barnes–Hut method fails (max 3). t-SNE is a visualisation tool; if you need 10 dimensions, use PCA or UMAP.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: using the map downstream.</b> The map separates digits beautifully. Can we feed its coordinates to a classifier, or place tomorrow's new digits on it?</div>

  <h2 id="ts-nofeat"><span class="num">13</span>Not for Features or New Points</h2>
  <p><strong>The question we can't answer yet.</strong> A 5-NN on the t-SNE map scored 0.954. Can we deploy "t-SNE → classifier"?</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.manifold import TSNE
from digits import Xs
print("TSNE has transform():", hasattr(TSNE(), "transform"))
Z1 = TSNE(2, random_state=0).fit_transform(Xs[:1000])            # map 1,000 digits
Z2 = TSNE(2, random_state=0).fit_transform(Xs[:1001])            # add ONE new digit and refit
move = np.linalg.norm(Z1 - Z2[:1000], axis=1)
print(f"after adding one point, the old points moved: median {np.median(move):.1f}, max {move.max():.1f} "
      f"(map width {np.ptp(Z1[:, 0]):.1f})")</div>
  <div class="fx" data-lang="text">TSNE has transform(): False
after adding one point, the old points moved: median 0.6, max 24.3 (map width 70.2)</div>
  <p>sklearn's <code>TSNE</code> has no <code>transform</code>: the map is just the optimised coordinates of the training points, not a function you can apply to new inputs (t-SNE is <strong>non-parametric</strong>). To place a new digit you must refit on old + new, and the refit moves the old points too: adding a single digit moved existing points by a median of 0.6 and up to 24.3 units on a map 70 units wide. A classifier trained on yesterday's coordinates would be lost.</p>
  <p>And the 0.954 above was measured with t-SNE fitted on <em>all</em> digits, test folds included: the test points shaped the map, so that number is fine for judging a visualisation but would be leakage as a model score. Alternatives when you need a reusable mapping: PCA, UMAP (has <code>transform</code>), parametric t-SNE (a neural network trained with the t-SNE loss), or openTSNE's approximate placement of new points.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>non-parametric</strong> embedding learns coordinates for the given points only, with no function f(x) → y for unseen x. t-SNE is non-parametric; PCA and UMAP provide a mapping.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running t-SNE on all data and then splitting train/test on the 2D coordinates. The test rows influenced every training coordinate: leakage, and impossible to reproduce for live data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have built t-SNE piece by piece. Let us see the whole chain in one diagram and one table.</div>

  <h2 id="ts-connect"><span class="num">14</span>How It All Connects</h2>
  <p><strong>The question we can't answer yet.</strong> How does each ingredient depend on the previous one, and what number did each produce in our running example?</p>
  <figure class="viz"><svg viewBox="0 0 680 230" width="680">
<defs><marker id="ts-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="11.5">
<rect x="10" y="20" width="120" height="46" rx="7" class="fs" stroke="currentColor"/><text x="70" y="39" text-anchor="middle" font-weight="700">Distances dᵢⱼ</text><text x="70" y="55" text-anchor="middle" class="tm">scaled (PCA-50)</text>
<rect x="155" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="215" y="39" text-anchor="middle" font-weight="700">σᵢ search</text><text x="215" y="55" text-anchor="middle" class="tm">perplexity → σ</text>
<rect x="300" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="360" y="39" text-anchor="middle" font-weight="700">p(j|i)</text><text x="360" y="55" text-anchor="middle" class="tm">Gaussian, row-norm</text>
<rect x="445" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="505" y="39" text-anchor="middle" font-weight="700">P = pᵢⱼ</text><text x="505" y="55" text-anchor="middle" class="tm">symmetrise /2n</text>
<rect x="445" y="110" width="120" height="46" rx="7" class="fg sg"/><text x="505" y="129" text-anchor="middle" font-weight="700">KL(P‖Q)</text><text x="505" y="145" text-anchor="middle" class="tm">asymmetric cost</text>
<rect x="300" y="110" width="120" height="46" rx="7" class="fg sg"/><text x="360" y="129" text-anchor="middle" font-weight="700">Q = qᵢⱼ</text><text x="360" y="145" text-anchor="middle" class="tm">Student-t on map</text>
<rect x="155" y="110" width="120" height="46" rx="7" class="ft st"/><text x="215" y="129" text-anchor="middle" font-weight="700">Map Y</text><text x="215" y="145" text-anchor="middle" class="tm">PCA or random init</text>
<rect x="445" y="180" width="200" height="40" rx="7" class="fr sr"/><text x="545" y="198" text-anchor="middle" font-weight="700">Gradient step on Y</text><text x="545" y="213" text-anchor="middle" class="tm">exaggeration, momentum</text>
<line x1="130" y1="43" x2="153" y2="43" stroke="currentColor" marker-end="url(#ts-c)"/><line x1="275" y1="43" x2="298" y2="43" stroke="currentColor" marker-end="url(#ts-c)"/><line x1="420" y1="43" x2="443" y2="43" stroke="currentColor" marker-end="url(#ts-c)"/>
<line x1="505" y1="66" x2="505" y2="108" stroke="currentColor" marker-end="url(#ts-c)"/><line x1="275" y1="133" x2="298" y2="133" stroke="currentColor" marker-end="url(#ts-c)"/><line x1="420" y1="133" x2="443" y2="133" stroke="currentColor" marker-end="url(#ts-c)"/>
<line x1="545" y1="156" x2="545" y2="178" stroke="currentColor" marker-end="url(#ts-c)"/><path d="M445 200 L215 200 L215 158" fill="none" stroke="currentColor" marker-end="url(#ts-c)"/>
<text x="20" y="200" class="tm">repeat ~1,000 times</text>
</g></svg><figcaption>Top row: computed once from the data. Bottom loop: repeated until the map's Q matches P.</figcaption></figure>
  <table class="tbl"><caption>Each ingredient on the running example</caption>
    <tr><th>Ingredient</th><th>Built from</th><th>Formula</th><th>Our numbers</th><th>Answers</th></tr>
    <tr><td>p(j|i)</td><td>distances, σᵢ</td><td>exp(−d²/2σ²)/Σ</td><td>d 1,2,3,6, σ=1 → .806 .180 .015 .000</td><td>Who are i's neighbours?</td></tr>
    <tr><td>Entropy H</td><td>p(j|i)</td><td>−Σ p log₂ p</td><td>0.786 bits (σ=1)</td><td>How spread is i's attention?</td></tr>
    <tr><td>Perplexity</td><td>H</td><td>2^H</td><td>1.72 (σ=1), 2.87 (σ=2)</td><td>Effective neighbour count</td></tr>
    <tr><td>σᵢ</td><td>perplexity target</td><td>binary search</td><td>≈ 1.15 for target 2</td><td>Adapts to density</td></tr>
    <tr><td>pᵢⱼ</td><td>p(j|i), p(i|j)</td><td>(p(j|i)+p(i|j))/2n</td><td>0.300, 0.016, 0.184</td><td>One similarity per pair</td></tr>
    <tr><td>qᵢⱼ</td><td>map Y</td><td>(1+d²)⁻¹/Σ</td><td>0.208, 0.083, 0.208 for y = 0,1,2</td><td>Similarity on the map</td></tr>
    <tr><td>KL</td><td>P, Q</td><td>Σ p log(p/q)</td><td>0.121; 0.076 (faithful); 0.991 (torn)</td><td>How wrong is the map?</td></tr>
    <tr><td>Gradient</td><td>P, Q, Y</td><td>4Σ(p−q)(yᵢ−yⱼ)/(1+d²)</td><td>−0.075, +0.231, −0.156</td><td>Which way to move?</td></tr>
    <tr><td>Map on digits</td><td>all above</td><td>~1,000 iterations</td><td>5-NN 0.954, trust 0.986, KL 0.837</td><td>Does it work?</td></tr>
  </table>
  <table class="tbl"><caption>What each property of the output is sensitive to</caption>
    <tr><th>Output property</th><th>Controlled by</th><th>Reliable?</th></tr>
    <tr><td>Local neighbours</td><td>P (perplexity) + KL's asymmetry</td><td>Yes</td></tr>
    <tr><td>Cluster separation</td><td>Student-t tail, early exaggeration</td><td>Exaggerated on purpose</td></tr>
    <tr><td>Cluster sizes</td><td>Per-point σᵢ (equalises density)</td><td>No</td></tr>
    <tr><td>Global layout</td><td>Initialisation (PCA helps), perplexity</td><td>Weak</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: comparisons.</b> Where does t-SNE stand against PCA and UMAP?</div>

  <h2 id="ts-compare"><span class="num">15</span>Comparisons &amp; Common Mistakes</h2>
  <p><strong>The question we can't answer yet.</strong> Given a dataset and a goal, when is t-SNE the right tool?</p>
  <table class="tbl">
    <tr><th></th><th>PCA</th><th>t-SNE</th><th>UMAP</th></tr>
    <tr><td>Type</td><td>Linear, parametric</td><td>Non-linear, non-parametric</td><td>Non-linear, has a mapping</td></tr>
    <tr><td>Preserves</td><td>Global variance</td><td>Local neighbours</td><td>Local + more global</td></tr>
    <tr><td>Digits 2D: 5-NN · trust</td><td>0.514 · 0.816</td><td>0.954 · 0.986</td><td>see <a class="xref" data-note="ml_umap">UMAP</a></td></tr>
    <tr><td>Gap 10× shown as</td><td>10.0×</td><td>1.7×</td><td>closer to true</td></tr>
    <tr><td>New points</td><td><code>transform</code></td><td>No</td><td><code>transform</code></td></tr>
    <tr><td>Speed</td><td>Fast</td><td>Slow (O(n log n) with big constants)</td><td>Faster</td></tr>
    <tr><td>Use for</td><td>Model input, compression</td><td>Pictures only</td><td>Pictures, also input/clustering</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: reading gaps and sizes</span>
    <p>True 10× → 1.7×; 28.6× wider → same size. Only neighbourhoods are meaningful.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: one perplexity, one seed</span>
    <p>Check several perplexities (2–100 changed trust(100) from 0.861 to 0.941) and, with random init, several seeds.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: t-SNE coordinates as model features</span>
    <p>No transform; refitting moved points up to 24.3 units; leakage if fitted with test data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: clustering on the t-SNE map</span>
    <p>Running DBSCAN/k-means on t-SNE output finds the islands t-SNE exaggerated. Cluster in the original or PCA/UMAP space and only colour the t-SNE plot by the result.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: skipping scaling and PCA-50 on wide data</span>
    <p>Distances in raw high-dimensional data suffer from the curse of dimensionality and mixed units; reduce first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: UMAP.</b> t-SNE keeps neighbours brilliantly but is slow, distorts the global layout and has no transform. <a class="xref" data-note="ml_umap">UMAP</a> builds a neighbour graph and lays it out with a loss that also pushes non-neighbours apart, keeping more global structure, running faster and embedding new points.</div>

  <h2 id="ts-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>This section stands alone: the whole note in one place.</p>
  <h3>The question ladder in one line each</h3>
  <ol>
    <li><strong>Problem</strong>: PCA's flat 2D view overlaps curved/clustered data; keep neighbours instead.</li>
    <li><strong>p(j|i)</strong>: Gaussian-weighted, normalised similarity = soft neighbour list.</li>
    <li><strong>Perplexity</strong>: 2^entropy = effective neighbours; σᵢ found per point by binary search.</li>
    <li><strong>pᵢⱼ</strong>: symmetrise and normalise over all pairs.</li>
    <li><strong>qᵢⱼ</strong>: Student-t on the map; heavy tail solves the crowding problem.</li>
    <li><strong>KL(P‖Q)</strong>: asymmetric cost; tearing neighbours apart is expensive.</li>
    <li><strong>Optimisation</strong>: gradient = springs; early exaggeration, momentum.</li>
    <li><strong>Reading</strong>: neighbours yes; gaps, sizes, axes no.</li>
    <li><strong>Perplexity effect</strong>: low = local/fragmented, high = more global.</li>
    <li><strong>Randomness</strong>: init="pca" reproducible; random init changes the layout.</li>
    <li><strong>Cost</strong>: exact O(n²), Barnes–Hut O(n log n); PCA-50 first.</li>
    <li><strong>No transform</strong>: visualisation only; UMAP next.</li>
  </ol>
  <h3>Formulas and symbols</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols / meaning</th></tr>
    <tr><td>p(j|i) = exp(−‖xᵢ−xⱼ‖²/2σᵢ²) / Σₖ≠ᵢ exp(−‖xᵢ−xₖ‖²/2σᵢ²)</td><td>xᵢ high-D point, σᵢ its Gaussian width</td></tr>
    <tr><td>Perp = 2^H, H = −Σⱼ p(j|i) log₂ p(j|i)</td><td>effective number of neighbours</td></tr>
    <tr><td>pᵢⱼ = (p(j|i) + p(i|j)) / 2n</td><td>n points; Σ pᵢⱼ = 1</td></tr>
    <tr><td>qᵢⱼ = (1 + ‖yᵢ−yⱼ‖²)⁻¹ / Σₖ≠ₗ (1 + ‖yₖ−yₗ‖²)⁻¹</td><td>yᵢ map point</td></tr>
    <tr><td>C = KL(P‖Q) = Σ pᵢⱼ log(pᵢⱼ/qᵢⱼ)</td><td>cost to minimise</td></tr>
    <tr><td>∂C/∂yᵢ = 4 Σⱼ (pᵢⱼ − qᵢⱼ)(yᵢ − yⱼ)(1 + ‖yᵢ−yⱼ‖²)⁻¹</td><td>p &gt; q attracts, p &lt; q repels</td></tr>
    <tr><td>learning_rate auto = max(n/12/4, 50)</td><td>12 = early exaggeration</td></tr>
  </table>
  <h3>The running example in one table</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th></tr>
    <tr><td>Digits</td><td>1,797 images × 64 pixels, 10 classes</td></tr>
    <tr><td>PCA 2D</td><td>21.6% variance, 5-NN 0.514, trust 0.816 (64-D 5-NN 0.944)</td></tr>
    <tr><td>p(j|i), d = 1,2,3,6</td><td>σ=1: .806 .180 .015 .000 (perp 1.72); σ=2: .484 .332 .178 .006 (perp 2.87)</td></tr>
    <tr><td>σ for perplexity 2</td><td>≈ 1.15 (binary search)</td></tr>
    <tr><td>3 images at 0, 1, 3</td><td>p₁₂ .300, p₁₃ .016, p₂₃ .184</td></tr>
    <tr><td>Map y = 0, 1, 2</td><td>q .208 .083 .208, KL 0.121 → one step → 0.087</td></tr>
    <tr><td>Heavy tail</td><td>high-D 3 ↔ map 9.4</td></tr>
    <tr><td>t-SNE on digits</td><td>5-NN 0.954, trust 0.986, KL 0.837</td></tr>
    <tr><td>Gaps / sizes</td><td>10× → 1.7×; 28.6× → 1.0×</td></tr>
    <tr><td>Perplexity 2 / 5 / 30 / 100</td><td>trust(100) 0.861 / 0.912 / 0.934 / 0.941</td></tr>
    <tr><td>Seeds</td><td>pca init identical; random init 82% shared 10-NN</td></tr>
    <tr><td>Refit after 1 new point</td><td>old points move median 0.6, max 24.3</td></tr>
  </table>
  <h3>When to use / not use</h3>
  <div class="cards">
    <div><b>Use</b><p>Looking at clusters in images, embeddings, single-cell data; checking whether labels form groups; presenting neighbourhood structure.</p><small>after scaling and PCA-50</small></div>
    <div><b>Don't use</b><p>As model features, for new points, for measuring between-cluster distances or cluster sizes, for clustering itself, on millions of points (use UMAP).</p><small>pictures only</small></div>
  </div>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>Perplexity of 8 equally likely neighbours? <em>H = 3 bits → 8.</em></li>
    <li>Why Student-t on the map? <em>Heavy tail fixes the crowding problem: moderate distances can stretch.</em></li>
    <li>Which costs more in KL: neighbours drawn far, or strangers drawn close? <em>Neighbours drawn far (1.151 vs −0.115).</em></li>
    <li>What does early exaggeration do? <em>Multiplies P by 12 early so clusters form tight and separate.</em></li>
    <li>Can you call transform on sklearn's TSNE? <em>No; refit is needed and moves old points.</em></li>
  </ol>

  <h2 id="ts-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain t-SNE in plain words.</summary><div class="qa-body">Turn high-D distances into neighbour probabilities (Gaussian, width set by perplexity), scatter points on a 2D map, compute similar probabilities on the map with a heavy-tailed Student-t, and move the map points by gradient descent to minimise the KL divergence between the two. Neighbours end up together; distances between groups are not preserved.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is perplexity and how is σᵢ chosen?</summary><div class="qa-body">Perplexity = 2^H of a point's neighbour distribution: an effective neighbour count (four equal neighbours → 4; distances 1,2,3,6 with σ = 1 → 1.72). You set one perplexity (default 30, typical 5–50, must be &lt; n) and t-SNE finds each σᵢ by binary search so every point hits it, giving small σ in dense regions and large σ in sparse ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does t-SNE use a Student-t distribution in the low-dimensional space?</summary><div class="qa-body">The crowding problem: high-D points can have many moderately distant neighbours, but 2D lacks room for them, so with a Gaussian they collapse together. The t kernel (1 + d²)⁻¹ has heavy tails, so moderately distant points can be placed much farther (Gaussian similarity at distance 3 ↔ map distance 9.4), giving well-separated clusters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does t-SNE preserve local but not global structure?</summary><div class="qa-body">KL(P‖Q) weights each pair by pᵢⱼ. Placing true neighbours far apart (p large, q small) costs a lot (0.5 ln 10 = 1.151); placing non-neighbours close (p tiny) costs almost nothing. So the optimiser protects neighbourhoods and is nearly indifferent to where distant groups go.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What can and can't you conclude from a t-SNE plot?</summary><div class="qa-body">Can: which points are neighbours and roughly which groups exist (if stable across perplexities). Can't: distances between clusters (true 10× shown as 1.7×), cluster sizes or densities (28.6× wider shown the same size), axes or absolute positions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the gradient and interpret it.</summary><div class="qa-body">∂C/∂yᵢ = 4 Σⱼ (pᵢⱼ − qᵢⱼ)(yᵢ − yⱼ)(1 + ‖yᵢ − yⱼ‖²)⁻¹: a sum of springs; pairs closer in truth than on the map attract, others repel, with forces weakened for far pairs. For y = (0, 1, 2) in our example: (−0.075, +0.231, −0.156); one step with lr 1 lowered KL from 0.121 to 0.087.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is early exaggeration for?</summary><div class="qa-body">Multiplying P by 12 for the first 250 iterations makes attractive forces dominate, so clusters contract into tight groups that can move through each other and find good positions; then exaggeration is removed and the map relaxes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does perplexity change the result?</summary><div class="qa-body">Low perplexity focuses on the very nearest neighbours: can fragment groups and create clumps from noise (digits trust(100) 0.861 at 2). High perplexity considers more neighbours: smoother, more global structure (0.941 at 100), slower. Try several and trust only persistent structure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is t-SNE deterministic?</summary><div class="qa-body">With sklearn's default init="pca" and Barnes–Hut, two runs gave identical maps. With init="random", different seeds moved points up to 98.9 units; 82% of 10-NN sets were shared but the island layout changed. Always fix random_state and prefer PCA init.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you run t-SNE on 1 million points?</summary><div class="qa-body">Scale, reduce to ~50 dimensions with PCA, then use Barnes–Hut (O(n log n)) or better FFT-accelerated implementations (openTSNE/FIt-SNE), or switch to UMAP. Exact t-SNE would need 10¹² pair computations per iteration.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't t-SNE output be used as model features?</summary><div class="qa-body">It is non-parametric: no transform for new rows; refitting moves old points (one added digit moved points up to 24.3 units); fitting on all data leaks test information; and the coordinates distort global geometry. Use PCA or UMAP for features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How does t-SNE fix PCA's weakness, and what does it give up?</summary><div class="qa-body">PCA's flat projection overlapped the digits (5-NN 0.514, trust 0.816); t-SNE preserves neighbourhoods on curved structure (0.954, 0.986). It gives up global faithfulness (gaps, sizes), determinism without PCA init, speed, and a transform.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Where have entropy and KL divergence appeared before?</summary><div class="qa-body">Entropy was the impurity measure in <a class="xref" data-note="ml_dtree">Decision Trees</a> and mutual information in feature selection (<a class="xref" data-note="ml_dimred">previous notes</a>); log-loss in <a class="xref" data-note="ml_classification">logistic regression</a> is cross-entropy, which equals entropy plus KL divergence. t-SNE uses entropy for perplexity and KL as its cost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) What does UMAP change compared with t-SNE?</summary><div class="qa-body">UMAP builds a fuzzy k-nearest-neighbour graph instead of full Gaussian probabilities, uses a cross-entropy loss that also explicitly repels non-neighbours (so more global structure survives), optimises with sampled edges (faster), initialises spectrally, and learns a reusable transform for new points. See <a class="xref" data-note="ml_umap">UMAP</a>.</div></details>
</main>
`
});
