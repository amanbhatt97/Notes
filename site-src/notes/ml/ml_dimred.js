// ml/ml_dimred.js — Dimensionality Reduction
Object.assign(TOPIC_CONTENT, {
  "ml_dimred": `<main>
  <h1>Dimensionality Reduction</h1>
  <p class="lead">Dimensionality reduction turns many features into a few. PCA compresses data before a model; t-SNE and UMAP draw high-dimensional data as a 2D picture. This note first shows why many dimensions hurt, then does PCA by hand on five points, then runs everything on real data (wine, and handwritten digits with 64 features), and ends with how to read t-SNE and UMAP plots without fooling yourself. The deeper eigenvector maths is in <a class="xref" data-note="m_linalg">Linear Algebra</a> (PCA by Hand).</p>

  <h2 id="mdr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dimensionality Reduction</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why reduce</div>
        <ul>
          <li><b>Curse of dimensionality</b> — 10 bins per axis: 10 → 100 → 10¹⁰ cells; data gets sparse</li>
          <li><b>Distance concentration</b> — farthest/nearest: d=2 → 41.7, d=1000 → 1.11</li>
          <li>Hurts kNN, KMeans, DBSCAN (all distance-based)</li>
          <li><b>Goals</b> — speed, less noise/overfit, collinearity removal, 2D plots</li>
          <li><b>Selection vs extraction</b> — keep original columns vs build new ones (PCA)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PCA</div>
        <ul>
          <li><b>Steps</b> — centre → covariance → eigenvectors → sort → project</li>
          <li>Toy: cov [[2.5,2],[2,2.5]] → λ = 4.5, 0.5 → EVR 90% / 10%; PC1 = (0.707, 0.707)</li>
          <li><b>Score</b> — position along a PC; toy (−2,−1) → −2.121</li>
          <li><b>Reconstruct</b> — score × PC; lost = Σ PC2 scores² = 2.0</li>
          <li>Linear, deterministic, has <code>transform</code> for new rows</li>
          <li>💡 Photograph a cricket bat from the side where it looks longest</li>
          <li>⚠ Components are mixes of all features → hard to explain</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scale &amp; choose k</div>
        <ul>
          <li>⚠ <b>Scale first</b> — wine raw: PC1 = proline, 99.8%; scaled: 36%</li>
          <li><b>Cumulative EVR</b> — keep 90–95%; digits: 95% → 40 of 64</li>
          <li><code>PCA(n_components=0.95)</code> picks k for you</li>
          <li><b>Best</b> — tune k by CV of the downstream model</li>
          <li>Digits LR: 64 → 0.920, 40 → 0.914, 10 → 0.840, 2 → 0.535</li>
          <li>⚠ Max variance ≠ predictive; supervised alternative: LDA</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">t-SNE</div>
        <ul>
          <li><b>What</b> — non-linear 2D map keeping <b>local neighbours</b></li>
          <li><b>How</b> — Gaussian neighbour probs in high-D, Student-t in 2D, minimise KL</li>
          <li>Toy: distances 1,2,3,6 with σ=1 → probs .81/.18/.02/.00</li>
          <li><b>Perplexity</b> ≈ effective neighbours, 5–50 (default 30)</li>
          <li>⚠ Gaps meaningless (10× → 1.7×); sizes meaningless (28.6× → 1.0×)</li>
          <li>⚠ No <code>transform</code>; visualisation only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">UMAP</div>
        <ul>
          <li><b>What</b> — kNN graph in high-D, lay it out in low-D</li>
          <li><b>n_neighbors</b> local (5–15) ↔ global (50+); <b>min_dist</b> how tight clusters pack</li>
          <li>Keeps more global layout than t-SNE (3.9× vs 1.7×; true 10×)</li>
          <li>Faster on big n; has <code>transform</code> for new points</li>
          <li>Common: UMAP → HDBSCAN for clustering embeddings</li>
          <li>⚠ Still stochastic; distances only roughly meaningful</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Use which</div>
        <ul>
          <li><b>Model input</b> — PCA (in a Pipeline, fit on train only)</li>
          <li><b>Explore clusters</b> — UMAP or t-SNE, then sanity-check</li>
          <li><b>Interpretability</b> — feature selection (Lasso, importance), not PCA</li>
          <li>Digits 5-NN acc in 2D: PCA 0.51, t-SNE 0.95, UMAP 0.96</li>
          <li>⚠ Fitting PCA on all data before split = leakage</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mdr-curse"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Curse of Dimensionality</span><span class="rm-sub">Why distances stop working</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-pca"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">PCA by Hand</span><span class="rm-sub">Five points, two axes, one kept</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-scale"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Scale Before PCA</span><span class="rm-sub">Rupees drown out years</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-k"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Choosing Components</span><span class="rm-sub">Explained variance on digits</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-tsne"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">t-SNE</span><span class="rm-sub">Neighbours, perplexity, misreadings</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-umap"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">UMAP</span><span class="rm-sub">Faster, more global, transforms</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-which"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Which to Use</span><span class="rm-sub">Modelling vs visualisation</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Leakage, unscaled PCA, reading gaps</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mdr-curse"><span class="num">01</span>Curse of Dimensionality</h2>
  <p>More features should mean more information. So why do data scientists work hard to throw features away? Because every extra feature (a <strong>dimension</strong>) makes the space much bigger, while the number of rows stays the same. The rows spread thin, and methods that rely on "who is near whom" (KNN, KMeans, DBSCAN) start to fail, because everyone ends up roughly equally far from everyone else.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding a friend on a railway platform (one direction) is easy. On a cricket ground (two directions) it is harder. In a 100-floor building (three directions) it is hopeless. Each extra direction multiplies the space, so the same 500 people spread thinner.</p>
  </div>
  <h3>Worked example: count the boxes</h3>
  <p>Split each feature into 10 bins (0–0.1, 0.1–0.2, …). With 1 feature there are 10 boxes. With 2 features, 10 × 10 = 100 boxes. With 3, 1,000. With 10 features, 10¹⁰ = ten billion boxes. If you have 1,000 rows, then in 1-D each box holds about 100 rows; in 2-D about 10; in 3-D about 1; in 10-D almost every box is empty. A new point lands in an empty box with no nearby rows to learn from. To keep 10 rows per box in 10-D you would need 100 billion rows.</p>
  <table class="tbl out"><caption>1,000 rows, 10 bins per feature</caption>
    <tr><th>features d</th><th>boxes 10^d</th><th>rows per box</th></tr>
    <tr><td>1</td><td>10</td><td>100</td></tr>
    <tr><td>2</td><td>100</td><td>10</td></tr>
    <tr><td>3</td><td>1,000</td><td>1</td></tr>
    <tr><td>10</td><td>10,000,000,000</td><td>0.0000001</td></tr>
  </table>
  <p>A second symptom is that distances bunch together. The code puts 500 random points in a cube of d dimensions, picks a random query point, and compares its nearest and farthest neighbour.</p>
  <figure class="viz"><svg viewBox="0 0 560 165" width="560">
<text x="20" y="18">Farthest ÷ nearest distance from a query (500 uniform points)</text>
<g text-anchor="end"><text x="80" y="48">d = 2</text><text x="80" y="78">d = 10</text><text x="80" y="108">d = 100</text><text x="80" y="138">d = 1000</text></g>
<rect x="90" y="34" width="332" height="20" class="fb sb"/><text x="430" y="49">41.7×</text>
<rect x="90" y="64" width="158" height="20" class="fb sb"/><text x="256" y="79">5.65×</text>
<rect x="90" y="94" width="35" height="20" class="fr sr"/><text x="133" y="109">1.36×</text>
<rect x="90" y="124" width="17" height="20" class="fr sr"/><text x="115" y="139">1.11×</text>
<text x="20" y="160" class="tm">log-scaled bars; at d=1000 nearest ≈ farthest</text>
</svg><figcaption>As dimensions grow, every point becomes roughly equally far away, so "nearest neighbour" loses meaning.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
for d in (2, 10, 100, 1000):
    X, q = rng.random((500, d)), rng.random(d)          # 500 points + 1 query in a d-dim cube
    dist = np.linalg.norm(X - q, axis=1)                # distance from q to every point
    print(f"d={d:5d}  nearest={dist.min():6.2f} farthest={dist.max():6.2f}  ratio={dist.max()/dist.min():5.2f}")</div>
  <div class="fx" data-lang="text">d=    2  nearest=  0.03 farthest=  1.27  ratio=41.73
d=   10  nearest=  0.34 farthest=  1.91  ratio= 5.65
d=  100  nearest=  3.39 farthest=  4.60  ratio= 1.36
d= 1000  nearest= 12.32 farthest= 13.63  ratio= 1.11</div>
  <p>In 2-D the farthest point is 41.7 times farther than the nearest: "near" clearly means something. In 1000-D the ratio is 1.11: the nearest point is barely closer than the farthest. <code>np.linalg.norm(..., axis=1)</code> gives one distance per row.</p>
  <div class="cards">
    <div><b>Sparsity</b><p>To keep the same density you need exponentially more rows.</p><small>Overfitting risk</small></div>
    <div><b>Distance concentration</b><p>Nearest ≈ farthest.</p><small>kNN, KMeans, DBSCAN degrade</small></div>
    <div><b>Fixes</b><p>Feature selection, PCA, UMAP, regularisation, more data.</p><small>Trees cope better</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Curse of dimensionality</strong>: as the number of features grows, the volume of the space grows exponentially, data becomes sparse and distances concentrate. <strong>Feature selection</strong> keeps a subset of the original columns; <strong>feature extraction</strong> (PCA, UMAP) builds new columns from all of them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Real data is rarely as bad as uniform random noise: features are correlated, so the data lives on a much smaller "surface" inside the space. That is exactly why dimensionality reduction works. Don't assume 1,000 features means 1,000 real dimensions.</p>
  </div>

  <h2 id="mdr-pca"><span class="num">02</span>PCA by Hand</h2>
  <p>Suppose two features almost always move together, like a flat's area in square feet and its number of rooms. Keeping both is mostly repetition. You would like one new number, "flat size", that captures most of what both say. With 64 features (the pixels of a digit image), you would like 10 or 20 such summary numbers. <strong>Principal Component Analysis (PCA)</strong> finds them automatically.</p>
  <p>The idea in plain words: look at the cloud of points and find the direction in which it is most spread out. That direction is the first new axis, <strong>PC1</strong>. Then find the most spread-out direction at a right angle to PC1: that is <strong>PC2</strong>. And so on. Keep the first few axes, drop the rest. Each point is then described by its position along the kept axes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You can send only one photo of a cricket bat. Shoot it from the side where it looks longest, not from the top where it looks like a thin line. That best angle is PC1. The best angle at right angles to it is PC2. The photo from the PC1 side tells your friend almost everything about the bat.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="28" y1="151" x2="286" y2="43" class="sb" stroke-width="2"/><line x1="177" y1="143" x2="138" y2="50" class="st" stroke-width="2" stroke-dasharray="5 3"/><line x1="277" y1="68" x2="269" y2="50" stroke="currentColor" opacity=".35"/><circle cx="277" cy="68" r="3.5" class="fs" stroke="currentColor"/><circle cx="269" cy="50" r="3" class="fb sb"/><line x1="176" y1="94" x2="174" y2="90" stroke="currentColor" opacity=".35"/><circle cx="176" cy="94" r="3.5" class="fs" stroke="currentColor"/><circle cx="174" cy="90" r="3" class="fb sb"/><line x1="127" y1="117" x2="125" y2="110" stroke="currentColor" opacity=".35"/><circle cx="127" cy="117" r="3.5" class="fs" stroke="currentColor"/><circle cx="125" cy="110" r="3" class="fb sb"/><line x1="44" y1="165" x2="36" y2="147" stroke="currentColor" opacity=".35"/><circle cx="44" cy="165" r="3.5" class="fs" stroke="currentColor"/><circle cx="36" cy="147" r="3" class="fb sb"/><line x1="81" y1="86" x2="96" y2="122" stroke="currentColor" opacity=".35"/><circle cx="81" cy="86" r="3.5" class="fs" stroke="currentColor"/><circle cx="96" cy="122" r="3" class="fb sb"/><line x1="165" y1="97" x2="163" y2="94" stroke="currentColor" opacity=".35"/><circle cx="165" cy="97" r="3.5" class="fs" stroke="currentColor"/><circle cx="163" cy="94" r="3" class="fb sb"/><line x1="140" y1="117" x2="135" y2="106" stroke="currentColor" opacity=".35"/><circle cx="140" cy="117" r="3.5" class="fs" stroke="currentColor"/><circle cx="135" cy="106" r="3" class="fb sb"/><line x1="96" y1="137" x2="91" y2="124" stroke="currentColor" opacity=".35"/><circle cx="96" cy="137" r="3.5" class="fs" stroke="currentColor"/><circle cx="91" cy="124" r="3" class="fb sb"/><line x1="177" y1="88" x2="177" y2="88" stroke="currentColor" opacity=".35"/><circle cx="177" cy="88" r="3.5" class="fs" stroke="currentColor"/><circle cx="177" cy="88" r="3" class="fb sb"/><line x1="202" y1="73" x2="204" y2="77" stroke="currentColor" opacity=".35"/><circle cx="202" cy="73" r="3.5" class="fs" stroke="currentColor"/><circle cx="204" cy="77" r="3" class="fb sb"/><line x1="140" y1="81" x2="149" y2="100" stroke="currentColor" opacity=".35"/><circle cx="140" cy="81" r="3.5" class="fs" stroke="currentColor"/><circle cx="149" cy="100" r="3" class="fb sb"/><line x1="183" y1="89" x2="181" y2="87" stroke="currentColor" opacity=".35"/><circle cx="183" cy="89" r="3.5" class="fs" stroke="currentColor"/><circle cx="181" cy="87" r="3" class="fb sb"/><line x1="136" y1="99" x2="139" y2="104" stroke="currentColor" opacity=".35"/><circle cx="136" cy="99" r="3.5" class="fs" stroke="currentColor"/><circle cx="139" cy="104" r="3" class="fb sb"/><line x1="255" y1="44" x2="259" y2="54" stroke="currentColor" opacity=".35"/><circle cx="255" cy="44" r="3.5" class="fs" stroke="currentColor"/><circle cx="259" cy="54" r="3" class="fb sb"/><text x="290" y="43" class="tb">PC1 95%</text><text x="128" y="44">PC2 5%</text><text x="330" y="60">2 features → 1 number per row</text><text x="330" y="84" class="tm">grey = original point</text><text x="330" y="104" class="tb">blue = its projection on PC1</text><text x="330" y="124" class="tm">thin line = information lost</text></svg><figcaption>PC1 is the direction of greatest spread; PC2 is perpendicular. Dropping PC2 keeps each point's position along PC1 only.</figcaption></figure>
  <h3>Worked example: five points</h3>
  <p>Points (−2, −1), (−1, −2), (0, 0), (1, 2), (2, 1). They lie roughly along the diagonal.</p>
  <ol>
    <li><strong>Centre</strong>: the mean is (0, 0) already, so nothing to subtract.</li>
    <li><strong>Covariance</strong> (how features vary and co-vary, dividing by n − 1 = 4): var(x) = (4 + 1 + 0 + 1 + 4)/4 = 2.5; var(y) = 2.5; cov(x, y) = (2 + 2 + 0 + 2 + 2)/4 = 2. Matrix [[2.5, 2], [2, 2.5]].</li>
    <li><strong>Eigenvectors</strong>: for a matrix [[a, b], [b, a]] the special directions are always (1, 1)/√2 and (1, −1)/√2, with <strong>eigenvalues</strong> (spread along them) a + b = <strong>4.5</strong> and a − b = <strong>0.5</strong>.</li>
    <li><strong>Sort and share</strong>: PC1 = (0.707, 0.707) carries 4.5 / 5 = <strong>90%</strong> of the variance; PC2 carries 10%.</li>
    <li><strong>Project</strong>: a point's PC1 score = (x + y)/√2. For (−2, −1): −3/1.414 = <strong>−2.121</strong>. Scores: −2.121, −2.121, 0, 2.121, 2.121.</li>
    <li><strong>Reconstruct</strong> from PC1 only: score × (0.707, 0.707). (−2, −1) comes back as (−1.5, −1.5). The lost part is the PC2 score, ±0.707 per point; total squared loss = 4 × 0.5 = <strong>2.0</strong>.</li>
  </ol>
  <p>The code below does the six steps in NumPy, then asks sklearn's <code>PCA</code> for the same thing.</p>
  <div class="fx" data-lang="py">from sklearn.decomposition import PCA
P = np.array([[-2, -1], [-1, -2], [0, 0], [1, 2], [2, 1]], dtype=float)
C = P - P.mean(axis=0)                              # 1. centre
cov = C.T @ C / (len(P) - 1)                        # 2. covariance matrix
vals, vecs = np.linalg.eigh(cov)                    # 3. eigenvalues / eigenvectors
order = vals.argsort()[::-1]; vals, vecs = vals[order], vecs[:, order]   # 4. biggest first
print("cov:", cov.tolist(), " eigenvalues:", vals, " EVR:", vals / vals.sum())
print("PC1 scores by hand:", (C @ vecs[:, 0]).round(3))          # 5. project
p1 = PCA(n_components=1).fit(P)
Z = p1.transform(P); R = p1.inverse_transform(Z)    # 6. back to 2-D from 1 number
print("sklearn PC1:", p1.components_.round(3), " EVR:", p1.explained_variance_ratio_.round(3))
print("sklearn scores:", Z.ravel().round(3))
print("rebuilt (-2,-1) as", R[0].round(2), " total squared loss:", round(((P - R) ** 2).sum(), 3))</div>
  <div class="fx" data-lang="text">cov: [[2.5, 2.0], [2.0, 2.5]]  eigenvalues: [4.5 0.5]  EVR: [0.9 0.1]
PC1 scores by hand: [-2.121 -2.121  0.     2.121  2.121]
sklearn PC1: [[0.707 0.707]]  EVR: [0.9]
sklearn scores: [-2.121 -2.121  0.     2.121  2.121]
rebuilt (-2,-1) as [-1.5 -1.5]  total squared loss: 2.0</div>
  <p>Every number matches the pencil work. <code>eigh</code> is NumPy's eigen-solver for symmetric matrices (covariance always is). <code>components_</code> holds the PC directions, <code>explained_variance_ratio_</code> the shares. <code>transform</code> gives scores; <code>inverse_transform</code> rebuilds the points from the kept components, which is how PCA is used for compression and denoising. sklearn actually uses SVD, a faster route to the same axes; the sign of a PC can come out flipped, which means nothing.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>PCA</strong> finds orthogonal directions (<strong>principal components</strong>) ordered by the variance of the data along them: the eigenvectors of the covariance matrix, with eigenvalues λ as variances. <strong>Explained variance ratio</strong> = λᵢ / Σλ. Keeping the top k gives the best k-dimensional linear approximation in squared error.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PC1 = 0.7·area + 0.7·rooms is fine, but on real data PC1 = 0.4·alcohol + 0.3·phenols − 0.2·hue … has no business name. If stakeholders need "which features matter", use feature selection (Lasso, importances), not PCA.</p>
  </div>

  <h2 id="mdr-scale"><span class="num">03</span>Scale Before PCA</h2>
  <p>PCA hunts for the direction of biggest variance. Variance depends on units. Age in years varies by tens; income in rupees varies by tens of thousands. Run PCA on the raw numbers and PC1 is simply "income", because income's variance is millions of times bigger, not because it is more important. Change rupees to lakhs and the answer changes completely. A method whose answer depends on your choice of units is not telling you about the data.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class report card where Maths is out of 1,000 and every other subject out of 10. "Who is the best student overall" becomes "who is best at Maths". Converting every subject to percentages first is standardising.</p>
  </div>
  <h3>Worked example: four customers</h3>
  <p>Ages 25, 35, 45, 55 and incomes ₹30k, ₹32k, ₹90k, ₹95k. Variance of age ≈ 125. Variance of income ≈ 950,000,000. Raw PCA will point PC1 almost exactly along income. <strong>Standardising</strong> (subtract the mean, divide by the standard deviation) turns each column into "how many standard deviations from average", so ages become −1.34, −0.45, 0.45, 1.34 and incomes −1.03, −0.97, 0.92, 1.08. Now both features have variance 1 and get an equal say.</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import StandardScaler
cust = np.array([[25, 30000], [35, 32000], [45, 90000], [55, 95000.]])   # age, income
raw = PCA(2).fit(cust)
sc = PCA(2).fit(StandardScaler().fit_transform(cust))
print("raw    PC1:", raw.components_[0].round(3), " EVR:", raw.explained_variance_ratio_.round(4))
print("scaled PC1:", sc.components_[0].round(3), " EVR:", sc.explained_variance_ratio_.round(4))</div>
  <div class="fx" data-lang="text">raw    PC1: [0. 1.]  EVR: [1. 0.]
scaled PC1: [0.707 0.707]  EVR: [0.9591 0.0409]</div>
  <p>Raw: PC1 is (0, 1), pure income, with 100% of the variance (rounded). Age is ignored. Scaled: PC1 is (0.707, 0.707), an equal mix, "older and richer", and it still explains 96% because age and income really do rise together here. Same check on real data, the wine dataset (13 chemical measurements in very different units):</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_wine
Xw, yw = load_wine(return_X_y=True)                      # 13 features, very different units
p = PCA().fit(Xw)
print("raw    EVR", p.explained_variance_ratio_[:3].round(3),
      "PC1 driven by:", load_wine().feature_names[np.argmax(abs(p.components_[0]))])
print("scaled EVR", PCA().fit(StandardScaler().fit_transform(Xw)).explained_variance_ratio_[:3].round(3))</div>
  <div class="fx" data-lang="text">raw    EVR [0.998 0.002 0.   ] PC1 driven by: proline
scaled EVR [0.362 0.192 0.111]</div>
  <p><code>proline</code> has variance ~98,600 (values in the hundreds), so unscaled PCA just returns "proline" with 99.8%. After scaling, the variance spreads over many components (36%, 19%, 11%), and PC1 now reflects real patterns across many chemicals. <code>np.argmax(abs(...))</code> finds the feature with the largest weight in PC1.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Standardisation</strong>: z = (x − mean) / std per column, giving mean 0 and variance 1. PCA on standardised data equals PCA on the <strong>correlation</strong> matrix instead of the covariance matrix.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Max variance ≠ most predictive. A tiny-variance feature can carry the label; a huge-variance one can be noise. PCA never looks at y. If class separation is the goal, LDA (Linear Discriminant Analysis) maximises it directly. Skip scaling only when all features share one unit and their spread matters (e.g. pixel intensities).</p>
  </div>

  <h2 id="mdr-k"><span class="num">04</span>Choosing Components</h2>
  <p>PCA gives you as many components as features, sorted from most to least variance. You must decide how many to keep (k). Too few and you throw away signal; too many and you saved nothing. There are three common ways to decide, from quickest to most reliable: a variance threshold, the "elbow" of a plot, and simply testing k with the model you actually care about.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Packing for a trip with a small bag. You pack the most-used clothes first. At some point each extra item adds little. "Pack until 95% of what I'll wear is in" is the variance rule. "Pack, then try living out of the bag for a day" is cross-validation.</p>
  </div>
  <h3>Worked example: read the cumulative sum</h3>
  <p>Back to the five points: EVR was [0.9, 0.1]. The cumulative sum is [0.9, 1.0]. "Keep 90%" → k = 1. "Keep 95%" → k = 2 (no reduction). On digits (8×8 images = 64 pixel features), the first five components explain 12.0%, 9.6%, 8.4%, 6.5%, 4.9%: running total 12.0, 21.6, 30.0, 36.5, 41.4%. The variance is spread thin, so many components are needed.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560">
<line x1="50" y1="170" x2="490" y2="170" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="170" stroke="currentColor"/>
<line x1="50" y1="37" x2="490" y2="37" class="sr" stroke-dasharray="5 4"/><text x="495" y="41" class="tr">95%</text>
<line x1="323" y1="37" x2="323" y2="170" class="sr" stroke-dasharray="5 4"/>
<polyline points="50,153.2 57,139.8 64,127.9 71,118.8 78,112.0 85,106.1 92,100.6 99,95.9 106,91.7 113,87.6 120,83.7 127,80.1 134,76.9 148,70.7 162,65.6 176,61.0 190,57.1 204,53.7 218,50.8 232,48.3 246,46.0 260,43.9 274,42.1 288,40.3 302,38.8 316,37.5 330,36.3 344,35.3 358,34.3 372,33.5 386,32.7 400,32.1 414,31.5 428,31.1 442,30.6 456,30.3 470,30.0" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="323" cy="37" r="5" class="fr sr"/><text x="330" y="60" class="tr">k = 40</text>
<circle cx="57" cy="140" r="4" class="fb sb"/><text x="64" y="144" class="tm">2 comps: 21.6%</text>
<circle cx="113" cy="87.6" r="4" class="fb sb"/><text x="120" y="92" class="tm">10: 58.9%</text>
<circle cx="183" cy="59" r="4" class="fb sb"/><text x="190" y="80" class="tm">20: 79.3%</text>
<g class="tm" text-anchor="middle"><text x="50" y="186">0</text><text x="183" y="186">20</text><text x="323" y="186">40</text><text x="463" y="186">60</text></g>
<text x="270" y="198" text-anchor="middle" class="tm">number of components (of 64)</text>
<text x="44" y="41" text-anchor="end" class="tm">0.95</text><text x="44" y="174" text-anchor="end" class="tm">0</text>
</svg><figcaption>Cumulative explained variance on scaled digits (8×8 images). Variance is spread out, so 95% needs 40 of 64 components.</figcaption></figure>
  <p>The code computes the cumulative curve and finds the first k that crosses each threshold.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_digits
X, y = load_digits(return_X_y=True)                  # 1797 images x 64 pixels
Xs = StandardScaler().fit_transform(X)
pca = PCA().fit(Xs)
cum = np.cumsum(pca.explained_variance_ratio_)
print("EVR top5", pca.explained_variance_ratio_[:5].round(3))
for t in (0.8, 0.9, 0.95, 0.99): print(f"{t:.0%} variance -&gt; {np.argmax(cum &gt;= t) + 1} components")
print("PCA(0.95) keeps", PCA(n_components=0.95).fit(Xs).n_components_)</div>
  <div class="fx" data-lang="text">EVR top5 [0.12  0.096 0.084 0.065 0.049]
80% variance -&gt; 21 components
90% variance -&gt; 31 components
95% variance -&gt; 40 components
99% variance -&gt; 54 components
PCA(0.95) keeps 40</div>
  <p><code>np.cumsum</code> builds the running total; <code>np.argmax(cum &gt;= t)</code> finds the first position where it crosses t (plus 1, because positions start at 0). Passing a fraction like 0.95 as <code>n_components</code> makes sklearn pick k itself. But variance is not accuracy. The better test is to put PCA in front of a model and cross-validate:</p>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
for k in (None, 40, 20, 10, 2):
    steps = [StandardScaler()] + ([PCA(k)] if k else []) + [LogisticRegression(max_iter=3000)]
    print(f"pca={str(k):5s} cv_acc={cross_val_score(make_pipeline(*steps), X, y, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">pca=None  cv_acc=0.920
pca=40    cv_acc=0.914
pca=20    cv_acc=0.899
pca=10    cv_acc=0.840
pca=2     cv_acc=0.535</div>
  <p>40 components lose only 0.6 points of accuracy for 37% fewer columns. 2 components (great for a picture) lose almost 40 points. Because the scaler and PCA sit inside the pipeline, each CV fold fits them on its own training part only.</p>
  <table class="tbl">
    <tr><th>Rule</th><th>Use when</th></tr>
    <tr><td>Cumulative EVR ≥ 90–95%</td><td>Quick default, compression</td></tr>
    <tr><td>Scree elbow (per-component EVR plot)</td><td>Few strong components then a flat tail</td></tr>
    <tr><td>CV of downstream model</td><td>PCA is a preprocessing step: tune k like any hyperparameter</td></tr>
    <tr><td>k = 2 or 3</td><td>Plotting only; here it keeps just 21.6% of variance</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Scree plot</strong>: explained variance per component, in order; the "elbow" is where it flattens. <strong>Cumulative EVR</strong>: running total of explained_variance_ratio_.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fitting the scaler and PCA on the full dataset before the train/test split leaks test information into training. Put them inside the Pipeline so each CV fold refits them.</p>
  </div>

  <h2 id="mdr-tsne"><span class="num">05</span>t-SNE</h2>
  <p>Try plotting the digits using PCA's first two components: the ten digit classes pile on top of each other (2 components hold only 21.6% of the variance). PCA is a straight-line method: it can only rotate and flatten. If the data lies on a curved surface, flattening squashes different groups together. For <em>looking</em> at data, we want something else: a 2D map where points that were neighbours in 64-D are still neighbours on paper. That is t-SNE.</p>
  <p>How it works, in plain words. (1) For each point, turn its distances to the others into "probability that this one is my neighbour": close points get high probability, far points almost zero. (2) Scatter all points randomly in 2D. (3) Compute the same neighbour probabilities in 2D. (4) Nudge the 2D points, again and again, until the 2D probabilities match the high-D ones.</p>
  <div class="flow"><span>High-D: who are my neighbours? (Gaussian)</span><span>Random 2D layout</span><span>Low-D similarities (Student-t)</span><span>Move points to match (min KL)</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Seating at a big Indian wedding. College friends sit at one table, office people at another, relatives at a third. Who shares a table is meaningful. Which table is near the stage, or how big a table looks, tells you nothing about how the groups relate.</p>
  </div>
  <h3>Worked example: one point's neighbour probabilities</h3>
  <p>Point i has four other points at distances 1, 2, 3 and 6. t-SNE gives each a weight exp(−d² / 2σ²), then divides by the total so they sum to 1. σ is the width of i's "attention".</p>
  <table class="tbl out"><caption>Neighbour probabilities for point i (real values)</caption>
    <tr><th>distance</th><th>σ = 1: weight</th><th>σ = 1: prob</th><th>σ = 2: prob</th><th>2D Student-t 1/(1+d²)</th></tr>
    <tr><td>1</td><td>0.607</td><td>0.806</td><td>0.484</td><td>0.500</td></tr>
    <tr><td>2</td><td>0.135</td><td>0.180</td><td>0.332</td><td>0.200</td></tr>
    <tr><td>3</td><td>0.011</td><td>0.015</td><td>0.178</td><td>0.100</td></tr>
    <tr><td>6</td><td>0.000</td><td>0.000</td><td>0.006</td><td>0.027</td></tr>
    <tr><td colspan="2"><em>perplexity</em></td><td>1.72</td><td>2.87</td><td></td></tr>
  </table>
  <p>With σ = 1, point i effectively "has" 1.72 neighbours; with σ = 2, about 2.87. That number is the <strong>perplexity</strong>. You set perplexity (default 30) and t-SNE picks each point's σ to hit it, so points in dense areas get a narrow σ and points in sparse areas a wide one. In 2D, t-SNE uses the heavy-tailed Student-t curve (last column). At distance 6 it still gives 0.027 instead of 0.000, which lets moderately far points sit <em>very</em> far apart on the map. That is why t-SNE clusters look so crisp, and also why the gaps between them are unreliable.</p>
  <h3>What a t-SNE plot can and cannot tell you</h3>
  <p>The code builds data where we know the truth: cluster C is 10× farther from A than B is, and later one cluster is 28.6× more spread out than another. Then it checks what PCA, t-SNE and UMAP report.</p>
  <figure class="viz"><svg viewBox="0 0 560 175" width="560">
<text x="20" y="18">A–C gap ÷ A–B gap (true: C is 10× farther)</text>
<g text-anchor="end"><text x="100" y="45">original</text><text x="100" y="70">PCA</text><text x="100" y="95">t-SNE</text><text x="100" y="120">UMAP</text></g>
<rect x="110" y="32" width="300" height="17" class="fs" stroke="currentColor"/><text x="418" y="45">10.0×</text>
<rect x="110" y="57" width="300" height="17" class="fb"/><text x="418" y="70">10.0×</text>
<rect x="110" y="82" width="51" height="17" class="fr"/><text x="169" y="95" class="tr">1.7×</text>
<rect x="110" y="107" width="117" height="17" class="ft"/><text x="235" y="120">3.9×</text>
<text x="20" y="150">Wide ÷ tight cluster spread:</text><text x="230" y="150">original 28.6×</text><text x="360" y="150" class="tr">t-SNE 1.0×</text>
<text x="20" y="168" class="tm">10-D Gaussian clusters, real runs (code below)</text>
</svg><figcaption>t-SNE squeezed a 10× gap to 1.7× and made a 28× wider cluster look the same size. PCA, being linear, kept the gap exactly.</figcaption></figure>
  <div class="fx" data-lang="py">from sklearn.manifold import TSNE
import umap                                           # pip install umap-learn
rng = np.random.default_rng(0)
cent = np.zeros((3, 10)); cent[1, 0] = 5; cent[2, 0] = 50     # A-B close, C far
X3 = np.vstack([rng.normal(c, 1.0, (200, 10)) for c in cent]); y3 = np.repeat([0, 1, 2], 200)
def gaps(name, Z):
    c = np.array([Z[y3 == i].mean(0) for i in range(3)])      # cluster centres
    ab, ac = np.linalg.norm(c[0] - c[1]), np.linalg.norm(c[0] - c[2])
    print(f"{name:9s} A-B={ab:6.2f} A-C={ac:6.2f} ratio={ac / ab:5.1f}")
gaps("original", X3)
gaps("PCA", PCA(2).fit_transform(X3))
gaps("t-SNE", TSNE(2, perplexity=30, random_state=0).fit_transform(X3))
gaps("UMAP", umap.UMAP(random_state=0).fit_transform(X3))

X2 = np.vstack([rng.normal(0, 0.1, (200, 10)), rng.normal(20, 3.0, (200, 10))])  # tight + wide
y2 = np.repeat([0, 1], 200)
for name, Z in [("original", X2), ("t-SNE", TSNE(2, random_state=0).fit_transform(X2))]:
    sp = [np.linalg.norm(Z[y2 == i] - Z[y2 == i].mean(0), axis=1).mean() for i in range(2)]
    print(f"{name:9s} spread tight={sp[0]:.2f} wide={sp[1]:.2f} ratio={sp[1] / sp[0]:.1f}")</div>
  <div class="fx" data-lang="text">original  A-B=  5.00 A-C= 50.13 ratio= 10.0
PCA       A-B=  4.99 A-C= 50.13 ratio= 10.0
t-SNE     A-B= 28.46 A-C= 47.23 ratio=  1.7
UMAP      A-B=  6.24 A-C= 24.19 ratio=  3.9
original  spread tight=0.32 wide=9.03 ratio=28.6
t-SNE     spread tight=6.41 wide=6.35 ratio=1.0</div>
  <p><code>gaps</code> measures distances between cluster centres. PCA keeps the true 10× ratio (it only rotates). t-SNE shrinks it to 1.7×, UMAP to 3.9×. In the second test the wide cluster is 28.6× more spread out than the tight one, but t-SNE draws them the same size (1.0×), because it equalises density through per-point σ.</p>
  <table class="tbl">
    <tr><th>You see in a t-SNE plot</th><th>Can you trust it?</th></tr>
    <tr><td>Points that sit together</td><td><strong>Yes</strong>: neighbours in high-D</td></tr>
    <tr><td>Distance between two clusters</td><td><strong>No</strong>: true 10× became 1.7×</td></tr>
    <tr><td>Cluster size / spread</td><td><strong>No</strong>: a 28.6× wider cluster drew the same size</td></tr>
    <tr><td>Exact layout across runs</td><td><strong>Partly</strong>: <code>init="pca"</code> (default since sklearn 1.2) is much more stable than <code>init="random"</code></td></tr>
    <tr><td>Apparent clusters in pure noise</td><td><strong>Careful</strong>: low perplexity can invent clumps</td></tr>
  </table>
  <h3>Perplexity on real data</h3>
  <p>Low perplexity = very local, can fragment; high = smoother, more global. It must be smaller than n. Try a few values; structure that survives all of them is real. We score each map two ways: <strong>trustworthiness</strong> (0–1, how many 2D neighbours were true neighbours) and the accuracy of a 5-NN classifier on the 2D coordinates.</p>
  <div class="fx" data-lang="py">from sklearn.manifold import trustworthiness
from sklearn.neighbors import KNeighborsClassifier
for p in (5, 30, 100):
    Z = TSNE(2, perplexity=p, random_state=0).fit_transform(Xs)          # scaled digits
    print(p, "trust", round(trustworthiness(Xs, Z, n_neighbors=10), 3),
          "knn", round(cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean(), 3))</div>
  <div class="fx" data-lang="text">5 trust 0.982 knn 0.952
30 trust 0.986 knn 0.954
100 trust 0.984 knn 0.945</div>
  <p>Digits is robust: all three perplexities give a faithful neighbourhood map (trust ≈ 0.98) and digit classes stay separable (5-NN ≈ 0.95).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>t-SNE</strong> (t-distributed Stochastic Neighbour Embedding) minimises the KL divergence between Gaussian neighbour probabilities in high-D and Student-t probabilities in low-D. <strong>Perplexity</strong> = 2^(entropy of a point's neighbour distribution), roughly the effective number of neighbours.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>t-SNE has no <code>transform</code>: new points need a full refit, and the axes mean nothing. Never feed t-SNE coordinates into a production model. For big data, reduce to ~50 dimensions with PCA first; sklearn's Barnes–Hut t-SNE is O(n log n) but still slow beyond ~100k points.</p>
  </div>

  <h2 id="mdr-umap"><span class="num">06</span>UMAP</h2>
  <p>t-SNE has three practical problems: it is slow on large data, it scrambles the big-picture layout (which clusters are near which), and it cannot place a new point without redoing everything. UMAP (Uniform Manifold Approximation and Projection) also draws data in 2D while keeping neighbours together, and fixes much of that. How: it links each point to its k nearest neighbours to make a graph, then finds a 2D layout where linked points stay close and unlinked points are pushed apart.</p>
  <div class="flow"><span>kNN graph in high-D (n_neighbors)</span><span>Fuzzy edge weights</span><span>Optimise a 2D graph to match (min_dist)</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Drawing a metro map from real city streets. Stations that are connected stay connected and close; exact distances are bent to fit the page. You can add a new station later without redrawing the whole map.</p>
  </div>
  <h3>Worked example: build the neighbour graph</h3>
  <p>Six points on a line: 1, 2, 3.5 and 10, 11, 12.5. With n_neighbors = 2, each point links to its 2 closest: 1 → {2, 3.5}, 2 → {1, 3.5}, 3.5 → {2, 1}, and 10 → {11, 12.5}, 11 → {10, 12.5}, 12.5 → {11, 10}. No edge crosses between the groups, so the layout step will keep two separate clumps. With n_neighbors = 4, point 3.5 would also link to 10, and the two clumps would be tied together: that is how a larger n_neighbors keeps more global structure.</p>
  <div class="fx" data-lang="py">from sklearn.neighbors import NearestNeighbors
pts = np.array([[1.0], [2.0], [3.5], [10.0], [11.0], [12.5]])
nn = NearestNeighbors(n_neighbors=3).fit(pts)        # 3 = itself + 2 neighbours
dist, idx = nn.kneighbors(pts)
for i in range(len(pts)):
    print(f"point {pts[i,0]:4.1f} -&gt; neighbours {pts[idx[i,1:],0].tolist()}")</div>
  <div class="fx" data-lang="text">point  1.0 -&gt; neighbours [2.0, 3.5]
point  2.0 -&gt; neighbours [1.0, 3.5]
point  3.5 -&gt; neighbours [2.0, 1.0]
point 10.0 -&gt; neighbours [11.0, 12.5]
point 11.0 -&gt; neighbours [10.0, 12.5]
point 12.5 -&gt; neighbours [11.0, 10.0]</div>
  <p><code>kneighbors</code> returns each point itself as its own nearest (distance 0), so we ask for 3 and skip the first column with <code>idx[i, 1:]</code>. UMAP builds exactly this kind of graph (with fuzzy weights) as step 1. Now the real comparison on digits, plus a check that UMAP can place unseen points:</p>
  <div class="fx" data-lang="py">Z2 = PCA(2).fit_transform(Xs)
Zt = TSNE(2, perplexity=30, random_state=0).fit_transform(Xs)
Zu = umap.UMAP(random_state=0).fit_transform(Xs)
for n, Z in [("PCA", Z2), ("t-SNE", Zt), ("UMAP", Zu)]:
    print(n, "5-NN acc in 2D", round(cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean(), 3))

r = umap.UMAP(random_state=0).fit(X3[::2])                # fit on half
print("UMAP new points:", r.transform(X3[1::2]).shape, "| TSNE has transform:", hasattr(TSNE(), "transform"))</div>
  <div class="fx" data-lang="text">PCA 5-NN acc in 2D 0.514
t-SNE 5-NN acc in 2D 0.954
UMAP 5-NN acc in 2D 0.959
UMAP new points: (300, 2) | TSNE has transform: False</div>
  <p>In 2D, PCA keeps only 21.6% of variance and the digit classes overlap (0.514). Both non-linear maps separate them (0.954, 0.959). UMAP fitted on every other row of X3 and then <code>transform</code>ed the other 300 rows; t-SNE has no such method.</p>
  <table class="tbl">
    <tr><th>Knob</th><th>Low</th><th>High</th></tr>
    <tr><td><code>n_neighbors</code> (15)</td><td>Fine local detail, fragments</td><td>Global shape, merges small groups</td></tr>
    <tr><td><code>min_dist</code> (0.1)</td><td>Tight clumps (good before clustering)</td><td>Even spread (good for viewing)</td></tr>
    <tr><td><code>metric</code></td><td colspan="2">Any distance: <code>cosine</code> for text/embeddings</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>UMAP</strong> builds a weighted k-nearest-neighbour graph in high-D, then optimises a low-D graph with a cross-entropy loss so the two match. <code>n_neighbors</code> sets local vs global balance; <code>min_dist</code> sets how tightly points may pack.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>UMAP is still stochastic. <code>random_state</code> makes it reproducible but disables parallelism. Its inter-cluster distances are better than t-SNE's (3.9× vs true 10×) but still not faithful. It is a separate package: <code>pip install umap-learn</code>, imported as <code>umap</code>.</p>
  </div>

  <h2 id="mdr-which"><span class="num">07</span>Which to Use</h2>
  <p>The three methods answer different questions, so "which is best" depends on what you will do with the output. Feeding a model? You need a fixed, repeatable transform that works on new rows: PCA. Drawing a picture to see if groups exist? You need neighbourhoods preserved: t-SNE or UMAP. Explaining to a manager which inputs matter? None of them; keep the original columns and use feature selection.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>PCA is a scale model of a building: shrunk but every proportion true. t-SNE and UMAP are a metro map: great for "which stations are next to each other", useless for measuring distances.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>PCA</th><th>t-SNE</th><th>UMAP</th></tr>
    <tr><td>Type</td><td>Linear</td><td>Non-linear</td><td>Non-linear</td></tr>
    <tr><td>Preserves</td><td>Global variance</td><td>Local neighbours</td><td>Local + some global</td></tr>
    <tr><td>Speed</td><td>Fast (SVD)</td><td>Slow; Barnes–Hut O(n log n), PCA-50 first</td><td>Faster, scales to millions</td></tr>
    <tr><td>Deterministic</td><td>Yes</td><td>With PCA init + seed</td><td>With seed (single-threaded)</td></tr>
    <tr><td>New points</td><td><code>transform</code></td><td>No</td><td><code>transform</code></td></tr>
    <tr><td>Model input</td><td>Yes</td><td>Never</td><td>Sometimes (e.g. before HDBSCAN)</td></tr>
    <tr><td>Visualisation</td><td>Quick look; often overlapping</td><td>Crisp clusters</td><td>Crisp, better global layout</td></tr>
    <tr><td>Interpretable axes</td><td>Loadings (mixes)</td><td>No</td><td>No</td></tr>
  </table>
  <div class="cards">
    <div><b>Before modelling</b><p>PCA inside a Pipeline, k tuned by CV. Helps linear/kNN models, collinear features, speed.</p><small>Trees rarely need it</small></div>
    <div><b>For a picture</b><p>Scale → PCA to ~50 → t-SNE/UMAP to 2D. Colour by known labels to sanity-check.</p><small>Never read gaps or sizes</small></div>
    <div><b>To explain</b><p>Keep original features: selection by Lasso, importances, mutual information.</p><small>Stakeholder-friendly</small></div>
  </div>
  <p>A typical real pipeline: you have 1 million sentence embeddings (768 numbers each) from an LLM and want topics. Normalise, reduce with PCA to ~50 or UMAP to ~5–10 dimensions, cluster with HDBSCAN (see <a class="xref" data-note="ml_clustering">Clustering</a>), and draw a UMAP 2D map of a sample to show the team. Every step uses the method for what it is good at.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Linear</strong> reduction (PCA): new features are weighted sums of old ones; the map is a rotation plus a drop. <strong>Non-linear</strong> (t-SNE, UMAP, autoencoders): the map can bend and stretch, so curved structure unfolds.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Showing a t-SNE plot and saying "cluster A is far from B, so they are very different" or "cluster C is big, so it is diverse". Neither follows. Only "these points are neighbours" is safe.</p>
  </div>

  <h2 id="mdr-traps"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: PCA without scaling</span>
    <p>Wine raw: PC1 = proline with 99.8% of variance. Scaled: 36%. Units decided the answer. Standardise unless all features share one meaningful unit.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fitting PCA before the train/test split</span>
    <p>The components then contain test-set information (leakage). Fit scaler and PCA on train only, ideally inside a <code>Pipeline</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: choosing k by "95% variance" and stopping there</span>
    <p>Variance kept is not accuracy kept. Digits: 40 components keep 95% variance and 0.914 vs 0.920 accuracy; check with CV of the real model.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading t-SNE gaps and sizes</span>
    <p>A true 10× gap showed as 1.7×; a 28.6× wider cluster showed as the same size. Only neighbourhoods are meaningful.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: using t-SNE output as model features</span>
    <p>No <code>transform</code> for new rows, and coordinates change between runs. Use PCA, or UMAP with <code>transform</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: explaining a model with PCA components</span>
    <p>Components mix every feature. "PC3 is important" means nothing to a business user. Use feature selection or importances on original columns.</p>
  </div>

  <h2 id="mdr-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the curse of dimensionality and which models suffer most?</summary><div class="qa-body">As dimensions grow, the space grows exponentially (10 bins per axis: 10, 100, … 10¹⁰ boxes), so data becomes sparse and distances concentrate (farthest/nearest ratio fell from 41.7 at d=2 to 1.11 at d=1000). Distance-based methods suffer most: kNN, KMeans, DBSCAN, RBF kernels. Fix with feature selection, PCA/UMAP, regularisation, more data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Do PCA by hand: covariance matrix [[3, 1], [1, 3]]. What are the components and EVR?</summary><div class="qa-body">For [[a, b], [b, a]] the eigenvectors are (1, 1)/√2 and (1, −1)/√2 with eigenvalues a + b = 4 and a − b = 2. PC1 = (0.707, 0.707) with EVR 4/6 = 0.667; PC2 = (0.707, −0.707) with EVR 0.333.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain PCA in plain words. What does explained_variance_ratio_ mean?</summary><div class="qa-body">Rotate the data onto perpendicular axes ordered by how much spread they capture, then keep the top k. explained_variance_ratio_[i] = that component's share of total variance (λᵢ / Σλ); in the five-point toy, [0.9, 0.1].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you standardise before PCA?</summary><div class="qa-body">PCA maximises variance, and variance depends on units. On raw wine data PC1 explained 99.8% and was just proline. On the age/income toy, raw PC1 was pure income. After StandardScaler, wine's first three components explain 36%, 19%, 11%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose the number of components?</summary><div class="qa-body">Cumulative explained variance (90–95%: digits needs 40 of 64 for 95%), a scree elbow, or best of all, cross-validate the downstream model over k. <code>PCA(n_components=0.95)</code> picks the variance threshold automatically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does PCA always help a model?</summary><div class="qa-body">No. On digits, logistic regression scored 0.920 on all 64 features and 0.914 with 40 components: slightly worse, but cheaper. PCA discards low-variance directions that may be predictive, and it hurts interpretability. It helps most with many collinear features, kNN/linear models, or speed limits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>PCA vs LDA?</summary><div class="qa-body">PCA is unsupervised: directions of max variance, ignoring y. LDA is supervised: directions that maximise between-class vs within-class separation, at most (classes − 1) components.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What can and can't you conclude from a t-SNE plot?</summary><div class="qa-body">Can: which points are neighbours, roughly which groups exist. Can't: distances between clusters (10× became 1.7×), cluster sizes (28.6× spread became 1.0×), or density. Check stability across perplexities and seeds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is perplexity?</summary><div class="qa-body">2 to the power of the entropy of a point's neighbour probabilities: roughly how many neighbours it pays attention to. In the toy, σ = 1 gave perplexity 1.72 and σ = 2 gave 2.87. Typical 5–50, default 30, must be below n. t-SNE picks each point's σ to hit the perplexity you set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't t-SNE output be used as model features?</summary><div class="qa-body">It has no transform for unseen rows (a refit moves everything), coordinates are arbitrary between runs, and it distorts global geometry. Use PCA, or UMAP if you need a non-linear transform.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>UMAP vs t-SNE: what changes?</summary><div class="qa-body">UMAP builds a kNN graph and optimises a low-D graph to match. Compared with t-SNE it is faster at scale, keeps more global structure (3.9× vs 1.7× of a true 10× gap), and can transform new points. Both keep local neighbourhoods well (digits 5-NN accuracy 0.959 vs 0.954). Both are stochastic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need to cluster 1M sentence embeddings (768-d). Pipeline?</summary><div class="qa-body">Normalise (cosine), reduce with PCA to ~50 or UMAP to ~5–10 dims with small min_dist, then HDBSCAN (or MiniBatchKMeans if k is known). Visualise a sample with UMAP 2D. Validate clusters by reading examples from each.</div></details>
</main>`
});
