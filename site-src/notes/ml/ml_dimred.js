// ml/ml_dimred.js — Dimensionality Reduction
Object.assign(TOPIC_CONTENT, {
  "ml_dimred": `<main>
  <h1>Dimensionality Reduction</h1>
  <p class="lead">Dimensionality reduction turns many features into a few. PCA compresses data before a model; t-SNE and UMAP draw high-dimensional data as a 2D picture. This page shows what each one keeps, how to read their plots, and when to use which, with real runs on the digits dataset (64 features). The eigenvector maths of PCA is in Mathematics → Linear Algebra (PCA by Hand).</p>

  <h2 id="mdr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Dimensionality Reduction</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why reduce</div>
        <ul>
          <li><b>Curse of dimensionality</b> — space grows exponentially; data gets sparse</li>
          <li><b>Distance concentration</b> — farthest/nearest ratio: d=2 → 41.7, d=1000 → 1.11</li>
          <li>Hurts kNN, KMeans, DBSCAN (all distance-based)</li>
          <li><b>Goals</b> — speed, less noise/overfit, collinearity removal, 2D plots</li>
          <li><b>Selection vs extraction</b> — keep original columns vs build new ones (PCA)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PCA</div>
        <ul>
          <li><b>What</b> — rotate to orthogonal axes of max variance; keep top k</li>
          <li><b>How</b> — eigenvectors of covariance (or SVD) → see Linear Algebra</li>
          <li><b>EVR</b> — explained_variance_ratio_ = λ<sub>i</sub> / Σλ</li>
          <li>Linear, deterministic, has <code>transform</code> for new rows</li>
          <li>💡 Photograph a cricket bat from the side where it looks longest</li>
          <li>⚠ <b>Scale first</b> — wine raw: PC1 = proline, 99.8%; scaled: 36%</li>
          <li>⚠ Max variance ≠ predictive; unsupervised. Supervised alt: LDA</li>
          <li>⚠ Components are mixes of all features → hard to explain</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing k</div>
        <ul>
          <li><b>Cumulative EVR</b> — keep 90–95%; digits: 95% → 40 of 64</li>
          <li><b>Scree plot</b> — elbow in per-component EVR</li>
          <li><code>PCA(n_components=0.95)</code> picks k for you</li>
          <li><b>Best</b> — tune k by CV of the downstream model</li>
          <li>Digits LR: 64 → 0.920, 40 → 0.914, 10 → 0.840, 2 → 0.535</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">t-SNE</div>
        <ul>
          <li><b>What</b> — non-linear 2D/3D map keeping <b>local neighbours</b></li>
          <li><b>How</b> — Gaussian neighbour probs high-D, Student-t low-D, minimise KL</li>
          <li><b>Perplexity</b> ≈ effective neighbours, 5–50 (default 30)</li>
          <li>⚠ Gaps between clusters meaningless — 10× → 1.7×</li>
          <li>⚠ Cluster sizes meaningless — 28.6× spread → 1.0×</li>
          <li>⚠ No <code>transform</code>; visualisation only, never a model feature</li>
          <li>Run on PCA-50 first for speed; Barnes–Hut O(n log n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">UMAP</div>
        <ul>
          <li><b>What</b> — kNN graph in high-D, lay it out in low-D</li>
          <li><b>n_neighbors</b> local (5–15) ↔ global (50+); <b>min_dist</b> how tight clusters pack</li>
          <li>Keeps more global layout than t-SNE (gap ratio 3.9× vs 1.7×; true 10×)</li>
          <li>Faster on big n; has <code>transform</code> for new points</li>
          <li>Common: UMAP → HDBSCAN for clustering embeddings</li>
          <li>⚠ Still stochastic; distances still only roughly meaningful</li>
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
      <div class="rm-item rm-done" data-target="mdr-pca"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">PCA</span><span class="rm-sub">Project onto max-variance axes</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-k"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Choosing Components</span><span class="rm-sub">Explained variance on digits</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-tsne"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">t-SNE</span><span class="rm-sub">Neighbours, perplexity, misreadings</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-umap"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">UMAP</span><span class="rm-sub">Faster, more global, transforms</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-which"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Which to Use</span><span class="rm-sub">Modelling vs visualisation</span></div></div>
      <div class="rm-item rm-done" data-target="mdr-qa"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mdr-curse"><span class="num">01</span>Curse of Dimensionality</h2>
  <figure class="viz"><svg viewBox="0 0 560 165" width="560">
<text x="20" y="18">Farthest ÷ nearest distance from a query (500 uniform points)</text>
<g text-anchor="end"><text x="80" y="48">d = 2</text><text x="80" y="78">d = 10</text><text x="80" y="108">d = 100</text><text x="80" y="138">d = 1000</text></g>
<rect x="90" y="34" width="332" height="20" class="fb sb"/><text x="430" y="49">41.7×</text>
<rect x="90" y="64" width="158" height="20" class="fb sb"/><text x="256" y="79">5.65×</text>
<rect x="90" y="94" width="35" height="20" class="fr sr"/><text x="133" y="109">1.36×</text>
<rect x="90" y="124" width="17" height="20" class="fr sr"/><text x="115" y="139">1.11×</text>
<text x="20" y="160" class="tm">log-scaled bars; at d=1000 nearest ≈ farthest</text>
</svg><figcaption>As dimensions grow, every point becomes roughly equally far away, so "nearest neighbour" loses meaning.</figcaption></figure>
  <p>More features (dimensions) should mean more information. But each extra dimension makes the space much bigger, so the same number of rows spreads thin. Distances then stop telling near from far.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
for d in (2, 10, 100, 1000):
    X, q = rng.random((500, d)), rng.random(d)
    dist = np.linalg.norm(X - q, axis=1)
    print(f"d={d:5d}  nearest={dist.min():6.2f} farthest={dist.max():6.2f}  ratio={dist.max()/dist.min():5.2f}")</div>
  <div class="fx" data-lang="text">d=    2  nearest=  0.03 farthest=  1.27  ratio=41.73
d=   10  nearest=  0.34 farthest=  1.91  ratio= 5.65
d=  100  nearest=  3.39 farthest=  4.60  ratio= 1.36
d= 1000  nearest= 12.32 farthest= 13.63  ratio= 1.11</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding a friend on a railway platform (one direction) is easy. On a cricket ground (two directions) it is harder. In a 100-floor building it is hopeless. Each extra direction multiplies the space, so the same 500 people spread thinner.</p>
  </div>
  <div class="cards">
    <div><b>Sparsity</b><p>To keep the same density you need exponentially more rows.</p><small>Overfitting risk</small></div>
    <div><b>Distance concentration</b><p>Nearest ≈ farthest.</p><small>kNN, KMeans, DBSCAN degrade</small></div>
    <div><b>Fixes</b><p>Feature selection, PCA, UMAP, regularisation, more data.</p><small>Trees cope better</small></div>
  </div>

  <h2 id="mdr-pca"><span class="num">02</span>PCA</h2>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><defs><marker id="mdr-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tm"/></marker></defs><line x1="28" y1="151" x2="286" y2="43" class="sb" stroke-width="2"/><line x1="177" y1="143" x2="138" y2="50" class="st" stroke-width="2" stroke-dasharray="5 3"/><line x1="277" y1="68" x2="269" y2="50" stroke="currentColor" opacity=".35"/><circle cx="277" cy="68" r="3.5" class="fs" stroke="currentColor"/><circle cx="269" cy="50" r="3" class="fb sb"/><line x1="176" y1="94" x2="174" y2="90" stroke="currentColor" opacity=".35"/><circle cx="176" cy="94" r="3.5" class="fs" stroke="currentColor"/><circle cx="174" cy="90" r="3" class="fb sb"/><line x1="127" y1="117" x2="125" y2="110" stroke="currentColor" opacity=".35"/><circle cx="127" cy="117" r="3.5" class="fs" stroke="currentColor"/><circle cx="125" cy="110" r="3" class="fb sb"/><line x1="44" y1="165" x2="36" y2="147" stroke="currentColor" opacity=".35"/><circle cx="44" cy="165" r="3.5" class="fs" stroke="currentColor"/><circle cx="36" cy="147" r="3" class="fb sb"/><line x1="81" y1="86" x2="96" y2="122" stroke="currentColor" opacity=".35"/><circle cx="81" cy="86" r="3.5" class="fs" stroke="currentColor"/><circle cx="96" cy="122" r="3" class="fb sb"/><line x1="165" y1="97" x2="163" y2="94" stroke="currentColor" opacity=".35"/><circle cx="165" cy="97" r="3.5" class="fs" stroke="currentColor"/><circle cx="163" cy="94" r="3" class="fb sb"/><line x1="140" y1="117" x2="135" y2="106" stroke="currentColor" opacity=".35"/><circle cx="140" cy="117" r="3.5" class="fs" stroke="currentColor"/><circle cx="135" cy="106" r="3" class="fb sb"/><line x1="96" y1="137" x2="91" y2="124" stroke="currentColor" opacity=".35"/><circle cx="96" cy="137" r="3.5" class="fs" stroke="currentColor"/><circle cx="91" cy="124" r="3" class="fb sb"/><line x1="177" y1="88" x2="177" y2="88" stroke="currentColor" opacity=".35"/><circle cx="177" cy="88" r="3.5" class="fs" stroke="currentColor"/><circle cx="177" cy="88" r="3" class="fb sb"/><line x1="202" y1="73" x2="204" y2="77" stroke="currentColor" opacity=".35"/><circle cx="202" cy="73" r="3.5" class="fs" stroke="currentColor"/><circle cx="204" cy="77" r="3" class="fb sb"/><line x1="140" y1="81" x2="149" y2="100" stroke="currentColor" opacity=".35"/><circle cx="140" cy="81" r="3.5" class="fs" stroke="currentColor"/><circle cx="149" cy="100" r="3" class="fb sb"/><line x1="183" y1="89" x2="181" y2="87" stroke="currentColor" opacity=".35"/><circle cx="183" cy="89" r="3.5" class="fs" stroke="currentColor"/><circle cx="181" cy="87" r="3" class="fb sb"/><line x1="136" y1="99" x2="139" y2="104" stroke="currentColor" opacity=".35"/><circle cx="136" cy="99" r="3.5" class="fs" stroke="currentColor"/><circle cx="139" cy="104" r="3" class="fb sb"/><line x1="255" y1="44" x2="259" y2="54" stroke="currentColor" opacity=".35"/><circle cx="255" cy="44" r="3.5" class="fs" stroke="currentColor"/><circle cx="259" cy="54" r="3" class="fb sb"/><text x="290" y="43" class="tb">PC1 95%</text><text x="128" y="44">PC2 5%</text><text x="330" y="60">2 features → 1 number per row</text><text x="330" y="84" class="tm">grey = original point</text><text x="330" y="104" class="tb">blue = its projection on PC1</text><text x="330" y="124" class="tm">thin line = information lost</text></svg><figcaption>PC1 is the direction of greatest spread; PC2 is perpendicular. Dropping PC2 keeps each point's position along PC1 only.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>Principal Component Analysis finds new axes along which the data spreads the most, then keeps only the top few. Each new axis (a <strong>component</strong>) is a weighted mix of the original features. The axes are at right angles (orthogonal), so they don't repeat information.</p>
  </div>
  <p>Why: 64 correlated features carry repeated information. PCA keeps most of the spread in fewer numbers, so models run faster and collinear features stop fighting. How: centre and scale the data, find the direction of most spread (PC1), then the next one at right angles (PC2), and so on. The maths (covariance eigenvectors or SVD) is in <strong>Mathematics → Linear Algebra → PCA by Hand</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You can send only one photo of a cricket bat. Shoot it from the side where it looks longest, not from the top where it looks like a thin line. That best angle is PC1. The best angle at right angles to it is PC2.</p>
  </div>
  <div class="flow"><span>Standardise</span><span>Fit PCA on train</span><span>Keep top k components</span><span>transform(train, test)</span><span>Model</span></div>
  <h3>Scale first</h3>
  <div class="fx" data-lang="py">from sklearn.datasets import load_wine
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
Xw, yw = load_wine(return_X_y=True)                      # 13 features, very different units
p = PCA().fit(Xw)
print("raw    EVR", p.explained_variance_ratio_[:3].round(3),
      "PC1 driven by:", load_wine().feature_names[np.argmax(abs(p.components_[0]))])
print("scaled EVR", PCA().fit(StandardScaler().fit_transform(Xw)).explained_variance_ratio_[:3].round(3))</div>
  <div class="fx" data-lang="text">raw    EVR [0.998 0.002 0.   ] PC1 driven by: proline
scaled EVR [0.362 0.192 0.111]</div>
  <p><code>proline</code> has variance ~98,600 (units in the hundreds), so unscaled PCA just returns "proline". After scaling, variance spreads over many components.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Max variance ≠ most predictive. A tiny-variance feature can carry the label; a huge-variance one can be noise. PCA never looks at y. If class separation is the goal, LDA maximises it directly.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PC1 = 0.4·alcohol + 0.3·phenols − 0.2·hue … has no business name. If stakeholders need "which features matter", use feature selection (Lasso, importances), not PCA.</p>
  </div>

  <h2 id="mdr-k"><span class="num">03</span>Choosing Components</h2>
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
  <div class="fx" data-lang="py">from sklearn.datasets import load_digits
X, y = load_digits(return_X_y=True)                  # 1797 x 64
Xs = StandardScaler().fit_transform(X)
pca = PCA().fit(Xs)
cum = np.cumsum(pca.explained_variance_ratio_)
print("EVR top5", pca.explained_variance_ratio_[:5].round(3))
for t in (0.8, 0.9, 0.95, 0.99): print(f"{t:.0%} variance -> {np.argmax(cum >= t) + 1} components")
print("PCA(0.95) keeps", PCA(n_components=0.95).fit(Xs).n_components_)</div>
  <div class="fx" data-lang="text">EVR top5 [0.12  0.096 0.084 0.065 0.049]
80% variance -&gt; 21 components
90% variance -&gt; 31 components
95% variance -&gt; 40 components
99% variance -&gt; 54 components
PCA(0.95) keeps 40</div>
  <h3>Let the model decide</h3>
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
  <table class="tbl">
    <tr><th>Rule</th><th>Use when</th></tr>
    <tr><td>Cumulative EVR ≥ 90–95%</td><td>Quick default, compression</td></tr>
    <tr><td>Scree elbow</td><td>Few strong components then a flat tail</td></tr>
    <tr><td>CV of downstream model</td><td>PCA is a preprocessing step: tune k like any hyperparameter</td></tr>
    <tr><td>k = 2 or 3</td><td>Plotting only; here it keeps just 21.6% of variance</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fitting the scaler and PCA on the full dataset before the train/test split leaks test information. Put them inside the Pipeline so each CV fold refits them.</p>
  </div>

  <h2 id="mdr-tsne"><span class="num">04</span>t-SNE</h2>
  <div class="flow"><span>High-D: who are my neighbours? (Gaussian)</span><span>Random 2D layout</span><span>Low-D similarities (Student-t)</span><span>Move points to match (min KL)</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p>t-SNE (t-distributed Stochastic Neighbour Embedding) draws high-dimensional points in 2D so that each point's nearest neighbours stay nearest.</p>
  </div>
  <p>Why: PCA is a straight-line method, so curved structure gets squashed and classes overlap. t-SNE only cares about who sits next to whom, so groups come out clearly. How: it turns distances into "probability of being my neighbour" in high-D, starts with a 2D layout, and moves points until the 2D neighbour probabilities match. In 2D it uses a heavy-tailed curve (Student-t), which pushes non-neighbours far apart. That is why clusters look so crisp.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Seating at a big Indian wedding. College friends sit at one table, office people at another, relatives at a third. Who shares a table is meaningful. Which table is near the stage, or how big a table looks, tells you nothing about how the groups relate.</p>
  </div>
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
    c = np.array([Z[y3 == i].mean(0) for i in range(3)])
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
  <table class="tbl">
    <tr><th>You see in a t-SNE plot</th><th>Can you trust it?</th></tr>
    <tr><td>Points that sit together</td><td><strong>Yes</strong>: neighbours in high-D</td></tr>
    <tr><td>Distance between two clusters</td><td><strong>No</strong>: true 10× became 1.7×</td></tr>
    <tr><td>Cluster size / spread</td><td><strong>No</strong>: a 28.6× wider cluster drew the same size</td></tr>
    <tr><td>Exact layout across runs</td><td><strong>Partly</strong>: <code>init="pca"</code> (default since sklearn 1.2) gave identical layouts for seeds 0 and 1; <code>init="random"</code> did not</td></tr>
    <tr><td>Apparent clusters in pure noise</td><td><strong>Careful</strong>: low perplexity can invent clumps</td></tr>
  </table>
  <h3>Perplexity</h3>
  <p>Roughly the number of neighbours each point "pays attention to". Low = very local, fragmented; high = smoother, more global. Must be smaller than n. Try a few values; a structure that survives all of them is real.</p>
  <div class="fx" data-lang="py">from sklearn.manifold import trustworthiness
from sklearn.neighbors import KNeighborsClassifier
for p in (5, 30, 100):
    Z = TSNE(2, perplexity=p, random_state=0).fit_transform(Xs)          # scaled digits
    print(p, "trust", round(trustworthiness(Xs, Z, n_neighbors=10), 3),
          "knn", round(cross_val_score(KNeighborsClassifier(5), Z, y, cv=5).mean(), 3))</div>
  <div class="fx" data-lang="text">5 trust 0.982 knn 0.952
30 trust 0.986 knn 0.954
100 trust 0.984 knn 0.945</div>
  <p><strong>Trustworthiness</strong> (0–1) = how many 2D neighbours were true neighbours. Digits is robust: all three are fine.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>t-SNE has no <code>transform</code>: new points need a full refit, and the axes mean nothing. Never feed t-SNE coordinates into a production model.</p>
  </div>

  <h2 id="mdr-umap"><span class="num">05</span>UMAP</h2>
  <div class="flow"><span>kNN graph in high-D (n_neighbors)</span><span>Fuzzy edge weights</span><span>Optimise a 2D graph to match (min_dist)</span></div>
  <p>UMAP (Uniform Manifold Approximation and Projection) also draws data in 2D while keeping neighbours together. Why another one: t-SNE is slow on big data, loses the big-picture layout, and can't place new points. How: UMAP links each point to its nearest neighbours (a graph), then finds a 2D layout where the same links stay short.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Drawing a metro map from real city streets. Stations that are connected stay connected and close; exact distances are bent to fit the page. You can add a new station later without redrawing the whole map.</p>
  </div>
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
  <p>In 2D, PCA keeps only 21.6% of variance and the digit classes overlap; both non-linear maps separate them.</p>
  <table class="tbl">
    <tr><th>Knob</th><th>Low</th><th>High</th></tr>
    <tr><td><code>n_neighbors</code> (15)</td><td>Fine local detail, fragments</td><td>Global shape, merges small groups</td></tr>
    <tr><td><code>min_dist</code> (0.1)</td><td>Tight clumps (good before clustering)</td><td>Even spread (good for viewing)</td></tr>
    <tr><td><code>metric</code></td><td colspan="2">Any distance: <code>cosine</code> for text/embeddings</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>UMAP is still stochastic. <code>random_state</code> makes it reproducible but disables parallelism. Its inter-cluster distances are better than t-SNE's (3.9× vs true 10×) but still not faithful.</p>
  </div>

  <h2 id="mdr-which"><span class="num">06</span>Which to Use</h2>
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

  <h2 id="mdr-qa"><span class="num">07</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the curse of dimensionality and which models suffer most?</summary><div class="qa-body">As dimensions grow, the space grows exponentially, so data becomes sparse and distances concentrate (farthest/nearest ratio fell from 41.7 at d=2 to 1.11 at d=1000). Distance-based methods suffer most: kNN, KMeans, DBSCAN, RBF kernels. Fix with feature selection, PCA/UMAP, regularisation, more data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain PCA in plain words. What does explained_variance_ratio_ mean?</summary><div class="qa-body">Rotate the data onto orthogonal axes ordered by how much variance they capture, then keep the top k. explained_variance_ratio_[i] = that component's share of total variance (λ<sub>i</sub> / Σλ). The maths (covariance eigenvectors / SVD) is in Linear Algebra.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you standardise before PCA?</summary><div class="qa-body">PCA maximises variance, and variance depends on units. On raw wine data PC1 explained 99.8% and was just proline (variance ~98,600). After StandardScaler the first three components explain 36%, 19%, 11%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose the number of components?</summary><div class="qa-body">Cumulative explained variance (90–95%: digits needs 40 of 64 for 95%), a scree elbow, or best of all, cross-validate the downstream model over k. <code>PCA(n_components=0.95)</code> picks the variance threshold automatically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does PCA always help a model?</summary><div class="qa-body">No. On digits, logistic regression scored 0.920 on all 64 features and 0.914 with 40 components: slightly worse, but cheaper. PCA discards low-variance directions that may be predictive, and it hurts interpretability. It helps most with many collinear features, kNN/linear models, or speed limits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>PCA vs LDA?</summary><div class="qa-body">PCA is unsupervised: directions of max variance, ignoring y. LDA is supervised: directions that maximise between-class vs within-class separation, at most (classes − 1) components.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What can and can't you conclude from a t-SNE plot?</summary><div class="qa-body">Can: which points are neighbours, roughly which groups exist. Can't: distances between clusters (10× became 1.7×), cluster sizes (28.6× spread became 1.0×), or density. Check stability across perplexities and seeds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is perplexity?</summary><div class="qa-body">A smooth measure of how many neighbours each point considers when building its high-D similarity distribution. Typical 5–50, default 30, must be below n. Low emphasises tiny local structure (can create fake clumps); high gives a smoother, more global picture.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't t-SNE output be used as model features?</summary><div class="qa-body">It has no transform for unseen rows (a refit moves everything), coordinates are arbitrary between runs, and it distorts global geometry. Use PCA, or UMAP if you need a non-linear transform.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>UMAP vs t-SNE: what changes?</summary><div class="qa-body">UMAP builds a kNN graph and optimises a low-D graph to match. Compared with t-SNE it is faster at scale, keeps more global structure (3.9× vs 1.7× of a true 10× gap), and can transform new points. Both keep local neighbourhoods well (digits 5-NN accuracy 0.959 vs 0.954). Both are stochastic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need to cluster 1M sentence embeddings (768-d). Pipeline?</summary><div class="qa-body">Normalise (cosine), reduce with PCA to ~50 or UMAP to ~5–10 dims with small min_dist, then HDBSCAN (or MiniBatchKMeans if k is known). Visualise a sample with UMAP 2D. Validate clusters by reading examples from each.</div></details>
</main>`
});
