// notes/ml/ml_pca.js — PCA
Object.assign(TOPIC_CONTENT, {
  "ml_pca": `<main>
  <h1>Principal Component Analysis (PCA)</h1>
  <div class="where"><span>Machine Learning</span><span>Dimensionality Reduction</span><span>PCA</span></div>
  <p class="lead">PCA replaces many correlated columns with a few new ones, called principal components, that keep as much of the data's spread as possible. It is the workhorse of dimensionality reduction: compression before a model, noise removal, a first look at a dataset. This note continues the tumour story from the previous note. Every step of PCA (centring, the covariance matrix, eigenvalues and eigenvectors, projection, reconstruction, explained variance) is computed by hand on 5 tumours with 2 measurements, then repeated on all 569 tumours with 30 measurements. We then see why you must standardise first, how PCA is really computed (SVD), how to choose the number of components, how to read them, where PCA fails, and we rebuild it from scratch in NumPy to match scikit-learn exactly.</p>

  <h2 id="pca-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <p><strong>Came from.</strong> In <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a> we cut the tumours' 30 columns by <em>choosing</em> some. That left a problem: radius and perimeter correlate 0.999, and the filters could only keep both (waste) or drop one (losing its small extra information). The 30 measurements overlap heavily (size appears as radius, perimeter and area, each in "mean", "error" and "worst" versions), so choosing columns throws away information that is spread across many of them.</p>
  <p><strong>What this note adds.</strong> A way to <em>merge</em> columns: new axes, each a weighted mix of all 30 measurements, ordered so the first carries the most information (variance), the second the most of what remains, and so on. You will compute every piece by hand, understand why it is an eigenvector problem (link: <a class="xref" data-note="m_linalg">Linear Algebra</a>), and use it correctly in a pipeline.</p>
  <p><strong>Leads to.</strong> PCA only rotates and drops axes: it is <em>linear</em>. When the data lies on a curved surface or forms many separate clusters, two principal components often overlap groups badly. <a class="xref" data-note="ml_tsne">t-SNE</a> and <a class="xref" data-note="ml_umap">UMAP</a> draw curved structure in 2D, and they usually start from a PCA-reduced input.</p>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
<defs><marker id="pca-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="12">
<rect x="10" y="40" width="140" height="56" rx="8" class="fs" stroke="currentColor"/><text x="80" y="62" text-anchor="middle" font-weight="700">Curse &amp; Selection</text><text x="80" y="80" text-anchor="middle" class="tm" font-size="10.5">keep/drop columns</text>
<rect x="175" y="34" width="140" height="68" rx="8" class="fb sb" stroke-width="3"/><text x="245" y="58" text-anchor="middle" font-weight="700">PCA</text><text x="245" y="76" text-anchor="middle" class="tb" font-size="10.5">merge columns linearly</text><text x="245" y="92" text-anchor="middle" class="tb" font-size="10.5">YOU ARE HERE</text>
<rect x="340" y="40" width="140" height="56" rx="8" class="fg sg"/><text x="410" y="62" text-anchor="middle" font-weight="700">t-SNE</text><text x="410" y="80" text-anchor="middle" class="tm" font-size="10.5">curved, 2D pictures</text>
<rect x="505" y="40" width="125" height="56" rx="8" class="fg sg"/><text x="567" y="62" text-anchor="middle" font-weight="700">UMAP</text><text x="567" y="80" text-anchor="middle" class="tm" font-size="10.5">faster, new points</text>
<line x1="150" y1="68" x2="173" y2="68" stroke="currentColor" marker-end="url(#pca-a)"/><line x1="315" y1="68" x2="338" y2="68" stroke="currentColor" marker-end="url(#pca-a)"/><line x1="480" y1="68" x2="503" y2="68" stroke="currentColor" marker-end="url(#pca-a)"/>
<text x="20" y="130" class="tm" font-size="11">Weakness passed on: selection can't merge → PCA; PCA can't bend → t-SNE; t-SNE is slow, no transform → UMAP.</text>
</g></svg><figcaption>PCA is the second note of the Dimensionality Reduction group.</figcaption></figure>

  <h2 id="pca-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>Each concept in this note answers a question the previous one raised. The sections follow this order.</p>
  <ol class="story">
    <li><b>Direction of maximum spread</b><span>Q: radius and texture rise together; can one number describe both? → the position along the direction in which the tumours are most spread out (variance 7.0 along 33.7°, vs 5.0 along radius alone). But we found it by trying angles; how do we find it exactly?</span></li>
    <li><b>Centring</b><span>Q: spread around what? → around the mean tumour (15, 18); subtract it first. But spread in one direction is not enough to describe a cloud.</span></li>
    <li><b>Covariance matrix</b><span>Q: how do we store all spreads and co-movements at once? → S = [[5, 3], [3, 2.5]]; the variance along any unit direction w is wᵀSw. But which w makes it largest?</span></li>
    <li><b>Eigenvectors &amp; eigenvalues</b><span>Q: which direction maximises wᵀSw? → the top eigenvector of S, (0.832, 0.555), with variance = eigenvalue 7; the next is (−0.555, 0.832) with 0.5. But what does each tumour become?</span></li>
    <li><b>Projection (scores) &amp; reconstruction</b><span>Q: what single number replaces each tumour, and what is lost? → score = (centred row)·PC1; rebuilding from it loses Σ(PC2 scores)² = 2 of the total 30. But how much is "enough" to keep?</span></li>
    <li><b>Explained variance ratio &amp; choosing k</b><span>Q: what share of information does each component keep? → λ/Σλ = 93.3% for PC1; on 30 tumour columns 10 components reach 95%. But the raw tumour data gives PC1 = 98.2% — suspicious.</span></li>
    <li><b>Standardise first</b><span>Q: why does raw PCA say one component is enough? → "worst area" (std 569) dwarfs "smoothness error" (0.003): units, not information. Scale → PC1 44.3%. But how does sklearn actually compute all this?</span></li>
    <li><b>SVD</b><span>Q: is there a faster, more stable route than forming S? → X = UΣVᵀ: V's rows are the components, s²/(n−1) are the eigenvalues, UΣ are the scores. But what do the components mean?</span></li>
    <li><b>Loadings &amp; interpretation</b><span>Q: what is PC1 of the tumours? → all 30 weights positive: "overall size/irregularity"; malignant average +3.71, benign −2.21. But how do we use PCA safely in a model?</span></li>
    <li><b>PCA in a pipeline</b><span>Q: how to pick k and avoid leakage? → scale + PCA + model in one Pipeline, k tuned by GridSearchCV (k = 10: 0.981). But is PCA always the right compression?</span></li>
    <li><b>Limits</b><span>Q: when does PCA fail? → when the useful direction has small variance (PCA 0.470 vs LDA 0.995), when structure is curved (rings 0.450), with outliers, and for interpretation. Can it be bent or scaled up?</span></li>
    <li><b>Kernel &amp; incremental PCA</b><span>Q: curved data or data too big for memory? → Kernel PCA unrolls the rings (1.000); IncrementalPCA fits in chunks. Finally: can we build it ourselves?</span></li>
    <li><b>From scratch</b><span>Q: do we really understand every step? → seven lines of NumPy match sklearn exactly. Next: when we want a 2D picture of curved, clustered data → <a class="xref" data-note="ml_tsne">t-SNE</a>.</span></li>
  </ol>

  <h2 id="pca-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">PCA</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Idea</div>
        <ul>
          <li>New axes = directions of maximum variance, mutually perpendicular</li>
          <li>Each axis (PC) = weighted mix of all columns; keep the top k</li>
          <li>Variance along unit w = wᵀSw; 5 tumours: 0° → 5.0, 45° → 6.75, 33.7° → 7.0</li>
          <li>💡 Photograph a cricket bat from the side where it looks longest</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The maths (5 tumours)</div>
        <ul>
          <li>Centre: mean (15, 18) → rows (−3,−1) (−1,−2) (0,0) (1,1) (3,2)</li>
          <li>Covariance S = CᵀC/(n−1) = [[5, 3], [3, 2.5]]</li>
          <li>det(S − λI) = λ² − 7.5λ + 3.5 = 0 → λ = 7, 0.5</li>
          <li>PC1 = (3, 2)/√13 = (0.832, 0.555); PC2 = (−0.555, 0.832)</li>
          <li>Max wᵀSw s.t. ‖w‖=1 → Sw = λw (Lagrange)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scores, rebuild, EVR</div>
        <ul>
          <li>Score = centred row · PC; PC1 scores −3.051 −1.941 0 1.387 3.606</li>
          <li>Rebuild = mean + score × PC; lost = Σ PC2² = 2.0 of total 30</li>
          <li>Total SS = kept 28 + lost 2 (Pythagoras)</li>
          <li>EVR = λᵢ/Σλ = 7/7.5 = 93.3%</li>
          <li>Max variance = min reconstruction error (same problem)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Practice on 569 tumours</div>
        <ul>
          <li>⚠ Raw: PC1 = worst area, 98.2% → scale first → 44.3%, 19.0%, 9.4%</li>
          <li>Scaled PCA = eigen of correlation matrix</li>
          <li>k: 80% → 5, 90% → 7, 95% → 10; Kaiser (λ&gt;1) → 6</li>
          <li>CV (logistic): k=1 0.912, 2 0.958, 5 0.974, 10 0.981, 30 0.979</li>
          <li>PC1 = size/irregularity (all + weights); malignant +3.71 vs benign −2.21</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Computation</div>
        <ul>
          <li><b>SVD</b> C = UΣVᵀ: rows of Vᵀ = PCs, s²/(n−1) = λ, UΣ = scores</li>
          <li>Toy: s = 5.292, 1.414 → s² = 28, 2 → λ = 7, 0.5</li>
          <li>svd_solver: full, randomized, arpack, covariance_eigh</li>
          <li>Signs are arbitrary; sklearn flips for determinism</li>
          <li>From scratch: centre → cov → eigh → sort → project</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Limits &amp; variants</div>
        <ul>
          <li>⚠ Variance ≠ importance: PCA 0.470 vs LDA 0.995</li>
          <li>⚠ Linear: rings PCA 0.450 → Kernel PCA (rbf) 1.000</li>
          <li>⚠ Outliers: one bad row turns PC1 (0.832, 0.555) → (0.03, 1.00)</li>
          <li>IncrementalPCA: chunks, same EVR; TruncatedSVD for sparse</li>
          <li>Fit in a Pipeline (train folds only)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pca-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Direction of Maximum Spread</span><span class="rm-sub">Projection and variance by angle</span></div></div>
      <div class="rm-item rm-done" data-target="pca-cov"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Centring &amp; the Covariance Matrix</span><span class="rm-sub">By hand on 5 tumours</span></div></div>
      <div class="rm-item rm-done" data-target="pca-eig"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Eigenvectors &amp; Eigenvalues</span><span class="rm-sub">Why they maximise variance</span></div></div>
      <div class="rm-item rm-done" data-target="pca-proj"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Projection &amp; Reconstruction</span><span class="rm-sub">Scores, what is kept and lost</span></div></div>
      <div class="rm-item rm-done" data-target="pca-evr"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Explained Variance &amp; Choosing k</span><span class="rm-sub">Scree, 95%, Kaiser, CV</span></div></div>
      <div class="rm-item rm-done" data-target="pca-scale"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Standardise First</span><span class="rm-sub">Raw tumours: area takes all</span></div></div>
      <div class="rm-item rm-done" data-target="pca-svd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The SVD Connection</span><span class="rm-sub">How sklearn really computes PCA</span></div></div>
      <div class="rm-item rm-done" data-target="pca-read"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Reading Components</span><span class="rm-sub">Weights, loadings, meaning</span></div></div>
      <div class="rm-item rm-done" data-target="pca-pipe"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">PCA in a Pipeline</span><span class="rm-sub">Tuning k without leakage</span></div></div>
      <div class="rm-item rm-done" data-target="pca-limits"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Limits of PCA</span><span class="rm-sub">Variance ≠ importance, curves, outliers</span></div></div>
      <div class="rm-item rm-done" data-target="pca-variants"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Kernel &amp; Incremental PCA</span><span class="rm-sub">Bending and scaling up</span></div></div>
      <div class="rm-item rm-done" data-target="pca-scratch"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">NumPy matching sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="pca-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One chain from mean to scores</span></div></div>
      <div class="rm-item rm-done" data-target="pca-compare"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Comparisons &amp; Common Mistakes</span><span class="rm-sub">vs selection, LDA, t-SNE, UMAP</span></div></div>
      <div class="rm-item rm-done" data-target="pca-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pca-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pca-idea"><span class="num">01</span>The Direction of Maximum Spread</h2>
  <p><strong>The question we can't answer yet.</strong> Feature selection could keep radius or texture, but not a blend. If two measurements rise together, is there one number that captures most of what both say?</p>
  <h3>The running example</h3>
  <p>The same hospital, the same tumours. For hand calculations we take <strong>5 tumours with 2 measurements</strong>, radius (mm) and texture:</p>
  <table class="tbl"><caption>Five tumours</caption>
    <tr><th>tumour</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr>
    <tr><td>radius</td><td>12</td><td>14</td><td>15</td><td>16</td><td>18</td></tr>
    <tr><td>texture</td><td>17</td><td>16</td><td>18</td><td>19</td><td>20</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
# five tumours: radius (mm) and texture, from the breast-cancer story
P = np.array([[12, 17], [14, 16], [15, 18], [16, 19], [18, 20]], dtype=float)</div>
  <p>Bigger tumours tend to have rougher texture, so the five dots lie roughly along a tilted line. For full-size work we use all <strong>569 tumours × 30 measurements</strong> from <code>load_breast_cancer</code>, exactly as in the previous note.</p>
  <h3>Plain words</h3>
  <p>Look at the cloud of points and find the direction in which it is most spread out. That direction is the first new axis, <strong>PC1</strong> (first principal component). Then, at a right angle to it, the direction of most remaining spread: <strong>PC2</strong>. With d columns you get d such axes. Keep the first few, drop the rest, and describe each tumour by its position along the kept axes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You may send only one photo of a cricket bat. Shoot it from the side where it looks longest, not from the end where it looks like a small rectangle. That best angle is PC1. A photo along PC1 tells your friend almost everything about the bat.</p>
  </div>
  <h3>Position along a direction (projection), by hand</h3>
  <p>A direction is a <strong>unit vector</strong> w = (cos θ, sin θ): length 1, pointing at angle θ. A point's position along it is the dot product. First subtract the mean tumour (15, 18) so positions are measured from the centre of the cloud (section 02 explains why). Tumour A becomes (−3, −1).</p>
  <ul>
    <li>Along θ = 0° (pure radius), w = (1, 0): A's position = −3·1 + (−1)·0 = −3.</li>
    <li>Along θ = 45°, w = (0.707, 0.707): A's position = (−3 − 1) × 0.707 = −2.83.</li>
  </ul>
  <p>Do this for all five tumours and compute the variance of the five positions (divide by n − 1 = 4). Along 0° the positions are −3, −1, 0, 1, 3: variance (9 + 1 + 0 + 1 + 9)/4 = <strong>5.0</strong>, just radius's own variance. Along 90° (pure texture): −1, −2, 0, 1, 2 → 10/4 = <strong>2.5</strong>. The code tries several angles:</p>
  <div class="fx" data-lang="py">import numpy as np
from five import P
C = P - P.mean(axis=0)                         # centre: subtract (15, 18)
for deg in (0, 30, 33.7, 45, 60, 90, 123.7):
    t = np.radians(deg)
    w = np.array([np.cos(t), np.sin(t)])       # unit-length direction
    z = C @ w                                  # each tumour's position along w
    print(f"angle {deg:5.1f}  w=({w[0]:.3f}, {w[1]:.3f})  scores={np.round(z, 2)}  variance={z.var(ddof=1):.3f}")</div>
  <div class="fx" data-lang="text">angle   0.0  w=(1.000, 0.000)  scores=[-3. -1.  0.  1.  3.]  variance=5.000
angle  30.0  w=(0.866, 0.500)  scores=[-3.1  -1.87  0.    1.37  3.6 ]  variance=6.973
angle  33.7  w=(0.832, 0.555)  scores=[-3.05 -1.94  0.    1.39  3.61]  variance=7.000
angle  45.0  w=(0.707, 0.707)  scores=[-2.83 -2.12  0.    1.41  3.54]  variance=6.750
angle  60.0  w=(0.500, 0.866)  scores=[-2.37 -2.23  0.    1.37  3.23]  variance=5.723
angle  90.0  w=(0.000, 1.000)  scores=[-1. -2.  0.  1.  2.]  variance=2.500
angle 123.7  w=(-0.555, 0.832)  scores=[ 0.83 -1.11  0.    0.28 -0.  ]  variance=0.500</div>
  <p>The variance rises from 5.0 at 0° to a peak of <strong>7.000 at 33.7°</strong>, then falls; at 123.7° (exactly perpendicular) it is only <strong>0.500</strong>. So one number per tumour, its position along 33.7°, carries a spread of 7.0, more than radius alone (5.0) or texture alone (2.5). That direction is PC1 and the perpendicular one is PC2. Notice 7.0 + 0.5 = 5.0 + 2.5 = 7.5: rotating the axes moves variance between directions but never creates or destroys it.</p>
  <figure class="viz"><svg viewBox="0 0 560 230" width="560">
<line x1="40" y1="200" x2="300" y2="200" stroke="currentColor" opacity=".4"/><line x1="40" y1="200" x2="40" y2="20" stroke="currentColor" opacity=".4"/>
<text x="170" y="222" text-anchor="middle" class="tm" font-size="11">radius 11 → 19</text><text x="30" y="110" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 30 110)">texture 15 → 21</text>
<line x1="56" y1="180" x2="284" y2="40" class="sb" stroke-width="2.5"/><text x="200" y="30" class="tb" font-size="12">PC1 (33.7°): var 7.0</text>
<line x1="134" y1="60" x2="206" y2="160" class="sr" stroke-width="2" stroke-dasharray="5 3"/><text x="212" y="172" class="tr" font-size="12">PC2: var 0.5</text>
<g class="fb sb"><circle cx="72" cy="140" r="5"/><circle cx="137" cy="170" r="5"/><circle cx="170" cy="110" r="5"/><circle cx="202" cy="80" r="5"/><circle cx="267" cy="50" r="5"/></g>
<g font-size="11"><text x="58" y="134">A</text><text x="120" y="182">B</text><text x="178" y="116">C (mean)</text><text x="208" y="78">D</text><text x="274" y="62">E</text></g>
<g font-size="12"><text x="330" y="60">Along radius: var 5.0</text><text x="330" y="82">Along texture: var 2.5</text><text x="330" y="104" class="tb">Along PC1: var 7.0 (93.3%)</text><text x="330" y="126" class="tr">Along PC2: var 0.5 (6.7%)</text><text x="330" y="150" class="tm">total always 7.5</text></g>
</svg><figcaption>The five tumours. PC1 runs along the cloud; PC2 is perpendicular and carries little spread.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>projection</strong> (score) of a centred row x onto a unit vector w is z = x·w. The <strong>first principal component</strong> is the unit vector w₁ that maximises the variance of the scores; each next component maximises variance among directions perpendicular to all previous ones.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The direction must have length 1. Without that rule you could "increase variance" just by stretching w (w = (2, 0) gives variance 20 along radius). PCA directions are always unit vectors.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: centring and the covariance matrix.</b> We found PC1 by trying angles. With 30 columns there are infinitely many directions; we need a formula for the variance along any direction.</div>

  <h2 id="pca-cov"><span class="num">02</span>Centring &amp; the Covariance Matrix</h2>
  <p><strong>The question we can't answer yet.</strong> Trying angles worked in 2-D. In 30-D we need the variance along <em>any</em> direction from one compact summary of the data. What summary contains all of it?</p>
  <h3>Step 1: centre</h3>
  <p>Subtract each column's mean: radius mean = (12 + 14 + 15 + 16 + 18)/5 = 15; texture mean = (17 + 16 + 18 + 19 + 20)/5 = 18. Centred rows: A (−3, −1), B (−1, −2), C (0, 0), D (1, 1), E (3, 2). Centring makes "spread" mean spread around the middle of the cloud. Without it, the "direction of max spread" would just point from the origin to the cloud.</p>
  <h3>Step 2: variances and covariance</h3>
  <ul>
    <li>var(radius) = (9 + 1 + 0 + 1 + 9)/4 = <strong>5</strong></li>
    <li>var(texture) = (1 + 4 + 0 + 1 + 4)/4 = <strong>2.5</strong></li>
    <li>cov(radius, texture) = mean of products: ((−3)(−1) + (−1)(−2) + 0 + 1·1 + 3·2)/4 = (3 + 2 + 0 + 1 + 6)/4 = <strong>3</strong></li>
  </ul>
  <p>Covariance is positive because the two rise together. Put them in a table: the <strong>covariance matrix</strong> S = [[5, 3], [3, 2.5]]. Diagonal = each column's variance; off-diagonal = how pairs move together. In matrix form S = CᵀC / (n − 1), where C is the centred data.</p>
  <div class="fx" data-lang="py">import numpy as np
from five import P
print("mean:", P.mean(axis=0))
C = P - P.mean(axis=0)
print("centred:\\n", C)
S = C.T @ C / (len(P) - 1)                    # covariance matrix by the formula
print("covariance:\\n", S)
print("np.cov agrees:", np.allclose(S, np.cov(P, rowvar=False)))</div>
  <div class="fx" data-lang="text">mean: [15. 18.]
centred:
 [[-3. -1.]
 [-1. -2.]
 [ 0.  0.]
 [ 1.  1.]
 [ 3.  2.]]
covariance:
 [[5.  3. ]
 [3.  2.5]]
np.cov agrees: True</div>
  <h3>Why S is "all we need": variance along any direction</h3>
  <p>For a unit vector w the scores are z = Cw, and their variance is zᵀz/(n − 1) = wᵀ(CᵀC/(n − 1))w = <strong>wᵀSw</strong>. Check at 45°, w = (0.707, 0.707): wᵀSw = 0.5·(5 + 2·3 + 2.5) = 0.5 × 13.5 = 6.75, the same as the angle table. At 33.7°, w = (0.832, 0.555): 5(0.692) + 2·3(0.462) + 2.5(0.308) = 3.46 + 2.77 + 0.77 = 7.00. So the whole search for PC1 becomes: <em>find the unit w that maximises wᵀSw</em>. With 30 columns S is 30 × 30 and the same formula holds.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tailor records your measurements once (chest, waist, shoulder and how they relate). From that sheet alone they can cut cloth for any garment. The covariance matrix is the measurement sheet of the data cloud: the spread in any direction can be read from it.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For centred data C (n × d), the <strong>covariance matrix</strong> is S = CᵀC/(n − 1), a symmetric d × d matrix with Sⱼⱼ = var(xⱼ) and Sⱼₖ = cov(xⱼ, xₖ). The variance of the projection onto a unit vector w is wᵀSw.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting to centre. sklearn's PCA centres for you; a hand-rolled SVD on raw data does not, and its first "component" then mostly points at the mean. (TruncatedSVD deliberately skips centring, which is why it is used for sparse text matrices.)</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: eigenvectors.</b> We have the formula wᵀSw. We still need the w that makes it largest, without trying angles.</div>

  <h2 id="pca-eig"><span class="num">03</span>Eigenvectors &amp; Eigenvalues</h2>
  <p><strong>The question we can't answer yet.</strong> Which unit vector w maximises wᵀSw? There is a clean answer, and it is why PCA is "an eigenvector problem".</p>
  <h3>Why the answer is an eigenvector (derivation)</h3>
  <p>Maximise wᵀSw subject to wᵀw = 1. With a Lagrange multiplier λ (see <a class="xref" data-note="m_calculus">Calculus</a>), maximise L = wᵀSw − λ(wᵀw − 1). Setting the gradient to zero: 2Sw − 2λw = 0, so</p>
  <p><strong>S w = λ w</strong>.</p>
  <p>That is the definition of an <strong>eigenvector</strong> w of S with <strong>eigenvalue</strong> λ: multiplying by S only stretches w, never turns it. And the variance along it is wᵀSw = wᵀ(λw) = λ. So every eigenvector is a "stationary" direction, its variance equals its eigenvalue, and the <em>largest</em> eigenvalue gives the maximum. Because S is symmetric, its eigenvectors are perpendicular to each other, which is why the PCs are perpendicular.</p>
  <h3>By hand on S = [[5, 3], [3, 2.5]]</h3>
  <ol>
    <li><strong>Characteristic equation</strong>: Sw = λw has a non-zero solution only if det(S − λI) = 0: (5 − λ)(2.5 − λ) − 3·3 = 0 → λ² − 7.5λ + 12.5 − 9 = <strong>λ² − 7.5λ + 3.5 = 0</strong>.</li>
    <li><strong>Solve</strong>: λ = (7.5 ± √(56.25 − 14))/2 = (7.5 ± √42.25)/2 = (7.5 ± 6.5)/2 → <strong>λ₁ = 7</strong>, <strong>λ₂ = 0.5</strong>. Check: sum 7.5 = trace (5 + 2.5); product 3.5 = determinant (12.5 − 9).</li>
    <li><strong>Eigenvector for 7</strong>: (5 − 7)a + 3b = 0 → b = (2/3)a → direction (3, 2); divide by its length √13 = 3.606: <strong>v₁ = (0.832, 0.555)</strong>, angle atan(2/3) = 33.7°, the peak we found by trial.</li>
    <li><strong>Eigenvector for 0.5</strong>: (5 − 0.5)a + 3b = 0 → b = −1.5a → direction (2, −3)/√13 = (0.555, −0.832), or equivalently (−0.555, 0.832): perpendicular to v₁ (0.832·0.555 − 0.555·0.832 = 0).</li>
    <li><strong>Check</strong>: S v₁ = (5·0.832 + 3·0.555, 3·0.832 + 2.5·0.555) = (5.824, 3.883) = 7 × (0.832, 0.555). ✓</li>
  </ol>
  <div class="fx" data-lang="py">import numpy as np
from five import P
S = np.cov(P, rowvar=False)
vals, vecs = np.linalg.eigh(S)                 # symmetric matrix -&gt; eigh
order = np.argsort(vals)[::-1]                 # largest first
vals, vecs = vals[order], vecs[:, order]
print("eigenvalues:", vals.round(4))
print("eigenvectors (columns):\\n", vecs.round(4))
v1 = vecs[:, 0]
print("S @ v1 =", (S @ v1).round(4), " 7 * v1 =", (7 * v1).round(4))
print("(3, 2)/sqrt(13) =", (np.array([3, 2]) / np.sqrt(13)).round(4))</div>
  <div class="fx" data-lang="text">eigenvalues: [7.  0.5]
eigenvectors (columns):
 [[-0.8321  0.5547]
 [-0.5547 -0.8321]]
S @ v1 = [-5.8244 -3.8829]  7 * v1 = [-5.8244 -3.8829]
(3, 2)/sqrt(13) = [0.8321 0.5547]</div>
  <p><code>np.linalg.eigh</code> is NumPy's solver for symmetric matrices; it returns eigenvalues in ascending order, so we sort them descending. It returned v₁ = (−0.832, −0.555): the same line pointing the other way. An eigenvector's <strong>sign is arbitrary</strong> (if Sw = λw then S(−w) = λ(−w)); only the line matters. S·v₁ equals 7·v₁ as promised.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Stretch a rubber sheet with a grid drawn on it. Most arrows drawn on the sheet both stretch and turn. A few special arrows only get longer or shorter without turning: those are the eigenvectors, and how much they stretch is the eigenvalue. For a data cloud, the special arrows are its natural axes.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>eigenvector</strong> v of a square matrix S satisfies Sv = λv with v ≠ 0; λ is its <strong>eigenvalue</strong>. For a covariance matrix (symmetric, positive semi-definite) all λ ≥ 0, eigenvectors can be chosen orthonormal, and the principal components are the eigenvectors sorted by decreasing λ, with λᵢ = variance of the data along PCᵢ. Σλᵢ = trace(S) = total variance. More: <a class="xref" data-note="m_linalg">Linear Algebra</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Comparing PCs across runs or libraries and concluding they "disagree" because the signs differ. (0.832, 0.555) and (−0.832, −0.555) are the same component; the scores just flip sign.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: projection and reconstruction.</b> We have the axes. We have not yet turned each tumour into its new numbers, nor measured exactly what is thrown away when PC2 is dropped.</div>

  <h2 id="pca-proj"><span class="num">04</span>Projection &amp; Reconstruction</h2>
  <p><strong>The question we can't answer yet.</strong> We know PC1 = (0.832, 0.555). What single number now stands for each tumour, and if we keep only that number, how close can we get back to the original measurements?</p>
  <h3>Scores (projection)</h3>
  <p>Score on PC1 = centred row · v₁ = (3·Δradius + 2·Δtexture)/√13. By hand:</p>
  <table class="tbl"><caption>Scores of the five tumours</caption>
    <tr><th>tumour</th><th>centred</th><th>PC1 score (3a + 2b)/3.606</th><th>PC2 score (2a − 3b)/3.606</th></tr>
    <tr><td>A</td><td>(−3, −1)</td><td>−11/3.606 = −3.051</td><td>−3/3.606 = −0.832</td></tr>
    <tr><td>B</td><td>(−1, −2)</td><td>−7/3.606 = −1.941</td><td>4/3.606 = 1.109</td></tr>
    <tr><td>C</td><td>(0, 0)</td><td>0</td><td>0</td></tr>
    <tr><td>D</td><td>(1, 1)</td><td>5/3.606 = 1.387</td><td>−1/3.606 = −0.277</td></tr>
    <tr><td>E</td><td>(3, 2)</td><td>13/3.606 = 3.606</td><td>0</td></tr>
  </table>
  <p>Variance of PC1 scores: (9.31 + 3.77 + 0 + 1.92 + 13.0)/4 = 28/4 = <strong>7</strong> = λ₁. Variance of PC2 scores: (0.69 + 1.23 + 0 + 0.08 + 0)/4 = 2/4 = <strong>0.5</strong> = λ₂.</p>
  <h3>Reconstruction</h3>
  <p>Keeping only the PC1 score, rebuild a tumour as mean + score × v₁. For A: (15, 18) + (−3.051)(0.832, 0.555) = (15 − 2.538, 18 − 1.692) = <strong>(12.462, 16.308)</strong>, against the true (12, 17). The error is exactly the dropped PC2 part: its squared length is (−0.832)² = 0.692. Over all five tumours, total squared error = Σ (PC2 score)² = 0.692 + 1.231 + 0 + 0.077 + 0 = <strong>2.0</strong>.</p>
  <h3>Kept + lost = total (Pythagoras)</h3>
  <p>Each centred row splits into a part along PC1 and a perpendicular part along PC2, so by Pythagoras ‖row‖² = (PC1 score)² + (PC2 score)². Summed over rows: total sum of squares 30 (= 4 × 7.5) = kept 28 + lost 2. This is why <strong>maximising the variance kept and minimising the reconstruction error are the same problem</strong>: the total is fixed, so more kept means less lost. PCA gives the best possible k-dimensional <em>flat</em> approximation of the data in squared error (the Eckart–Young theorem).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.decomposition import PCA
from five import P
mean = P.mean(axis=0)
C = P - mean
v1 = np.array([3, 2]) / np.sqrt(13); v2 = np.array([2, -3]) / np.sqrt(13)
z1, z2 = C @ v1, C @ v2                                  # scores on PC1 and PC2
print("PC1 scores:", z1.round(3), " var:", z1.var(ddof=1).round(3))
print("PC2 scores:", z2.round(3), " var:", z2.var(ddof=1).round(3))
R = mean + np.outer(z1, v1)                              # rebuild from PC1 only
print("rebuilt from PC1:\\n", R.round(3))
print("squared error per tumour:", ((P - R) ** 2).sum(axis=1).round(3), " total:", ((P - R) ** 2).sum().round(3))
print("total sum of squares:", (C ** 2).sum(), "= kept", (z1 ** 2).sum().round(3), "+ lost", (z2 ** 2).sum().round(3))

pca = PCA(n_components=1).fit(P)
print("sklearn components_:", pca.components_.round(4), " explained_variance_:", pca.explained_variance_.round(4),
      " ratio:", pca.explained_variance_ratio_.round(4))
print("sklearn scores:", pca.transform(P).ravel().round(3))
print("sklearn rebuild matches:", np.allclose(pca.inverse_transform(pca.transform(P)), R))</div>
  <div class="fx" data-lang="text">PC1 scores: [-3.051 -1.941  0.     1.387  3.606]  var: 7.0
PC2 scores: [-0.832  1.109  0.    -0.277  0.   ]  var: 0.5
rebuilt from PC1:
 [[12.462 16.308]
 [13.385 16.923]
 [15.    18.   ]
 [16.154 18.769]
 [18.    20.   ]]
squared error per tumour: [0.692 1.231 0.    0.077 0.   ]  total: 2.0
total sum of squares: 30.0 = kept 28.0 + lost 2.0
sklearn components_: [[0.8321 0.5547]]  explained_variance_: [7.]  ratio: [0.9333]
sklearn scores: [-3.051 -1.941  0.     1.387  3.606]
sklearn rebuild matches: True</div>
  <p>Every hand number appears: scores −3.051 … 3.606, rebuilt A = (12.462, 16.308), per-tumour errors 0.692, 1.231, 0, 0.077, 0, total 2.0, and 30 = 28 + 2. sklearn's <code>PCA</code> agrees: <code>components_</code> = (0.8321, 0.5547), <code>explained_variance_</code> = 7, <code>transform</code> gives the scores, <code>inverse_transform</code> gives the same rebuild.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Describing a city's location by "kilometres along the highway" only. For towns on the highway that is exact; for a town 2 km off it you lose that 2 km. PCA picks the highway that passes closest to all towns.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>With the top-k components as rows of W (k × d) and mean μ: <strong>scores</strong> Z = (X − μ)Wᵀ; <strong>reconstruction</strong> X̂ = ZW + μ. The reconstruction error Σ‖x − x̂‖² = (n − 1) Σ_{i&gt;k} λᵢ, the variance of the dropped components.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PCA is not regression. Regression minimises <em>vertical</em> errors in y; PCA minimises <em>perpendicular</em> distances to the line and treats all columns alike. The PC1 line through the tumours is not the regression line of texture on radius.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: explained variance and choosing k.</b> With 2 columns, keeping 1 is obvious. With 30 tumour measurements, how many components are "enough"?</div>

  <h2 id="pca-evr"><span class="num">05</span>Explained Variance &amp; Choosing k</h2>
  <p><strong>The question we can't answer yet.</strong> Each component carries a variance λ. How do we turn that into "how much information is kept", and how many components should we keep for the 30 tumour measurements?</p>
  <h3>Explained variance ratio</h3>
  <p>EVR of component i = λᵢ / Σλ. Five tumours: PC1 = 7/7.5 = <strong>93.3%</strong>, PC2 = 6.7%. Keeping PC1 keeps 93.3% of the spread; the lost 6.7% is exactly the 2 out of 30 in the reconstruction error.</p>
  <h3>On all 569 tumours (standardised; section 06 explains why)</h3>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
X, y = load_breast_cancer(return_X_y=True)
Xs = StandardScaler().fit_transform(X)
pca = PCA().fit(Xs)
evr, lam = pca.explained_variance_ratio_, pca.explained_variance_
cum = np.cumsum(evr)
print("EVR  1-7:", evr[:7].round(3))
print("cum  1-7:", cum[:7].round(3))
for t in (0.8, 0.9, 0.95, 0.99):
    print(f"{t:.0%} variance -&gt; k = {np.argmax(cum &gt;= t) + 1}")
print("Kaiser (eigenvalue &gt; 1) -&gt; k =", int((lam &gt; 1).sum()), " eigenvalues 1-7:", lam[:7].round(2))
print("PCA(0.95).n_components_ =", PCA(n_components=0.95).fit(Xs).n_components_)</div>
  <div class="fx" data-lang="text">EVR  1-7: [0.443 0.19  0.094 0.066 0.055 0.04  0.023]
cum  1-7: [0.443 0.632 0.726 0.792 0.847 0.888 0.91 ]
80% variance -&gt; k = 5
90% variance -&gt; k = 7
95% variance -&gt; k = 10
99% variance -&gt; k = 17
Kaiser (eigenvalue &gt; 1) -&gt; k = 6  eigenvalues 1-7: [13.3   5.7   2.82  1.98  1.65  1.21  0.68]
PCA(0.95).n_components_ = 10</div>
  <p>PC1 alone carries 44.3% of the variance of 30 columns, PC2 19.0%, PC3 9.4%: the first three hold 72.6%. Four rules for choosing k:</p>
  <table class="tbl">
    <tr><th>Rule</th><th>How</th><th>Tumours</th><th>Use when</th></tr>
    <tr><td>Cumulative EVR threshold</td><td>Smallest k with Σ EVR ≥ 90% / 95%</td><td>90% → 7, 95% → 10</td><td>Quick default, compression</td></tr>
    <tr><td>Scree elbow</td><td>Plot EVR per component; cut where it flattens</td><td>Bends after 3 (0.443, 0.190, 0.094, then ≤ 0.066)</td><td>A few strong components then a flat tail</td></tr>
    <tr><td>Kaiser rule</td><td>On standardised data keep λ &gt; 1 (better than one original column)</td><td>6 (λ = 13.3, 5.7, 2.82, 1.98, 1.65, 1.21)</td><td>Rough guide; tends to over-keep with many columns</td></tr>
    <tr><td>CV of the downstream model</td><td>Treat k as a hyperparameter</td><td>section 09: k = 10 best (0.981)</td><td>PCA feeds a model: the best rule</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 560 210" width="560">
<line x1="50" y1="180" x2="520" y2="180" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="180" stroke="currentColor"/>
<g class="fb sb"><rect x="60" y="109" width="18" height="71"/><rect x="88" y="150" width="18" height="30"/><rect x="116" y="165" width="18" height="15"/><rect x="144" y="169" width="18" height="11"/><rect x="172" y="171" width="18" height="9"/><rect x="200" y="174" width="18" height="6"/><rect x="228" y="176" width="18" height="4"/></g>
<polyline points="69,109 97,79 125,64 153,53 181,44 209,38 237,34 265,31 293,29 321,28" fill="none" class="sr" stroke-width="2.5"/>
<line x1="50" y1="28" x2="520" y2="28" stroke="currentColor" stroke-dasharray="4 4" opacity=".5"/><text x="470" y="24" class="tm" font-size="11">95%</text>
<circle cx="321" cy="28" r="5" class="fr sr"/><text x="330" y="44" class="tr" font-size="12">k = 10 reaches 95%</text>
<g font-size="11" class="tm"><text x="69" y="196" text-anchor="middle">1</text><text x="125" y="196" text-anchor="middle">3</text><text x="181" y="196" text-anchor="middle">5</text><text x="237" y="196" text-anchor="middle">7</text><text x="321" y="196" text-anchor="middle">10</text></g>
<text x="360" y="120" font-size="12" class="tb">bars: EVR per component (scree)</text><text x="360" y="140" font-size="12" class="tr">line: cumulative EVR</text>
<text x="60" y="100" font-size="11">44.3%</text>
</svg><figcaption>Scree (bars) and cumulative explained variance (line) for the 30 standardised tumour measurements.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Explained variance ratio</strong> EVRᵢ = λᵢ / Σⱼλⱼ (<code>explained_variance_ratio_</code>). <strong>Scree plot</strong>: EVR by component. <code>PCA(n_components=0.95)</code> chooses the smallest k whose cumulative EVR reaches 95%; <code>n_components_</code> reports it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"95% of the variance" is not "95% of the predictive information". Variance kept is about reconstructing X, not predicting y (section 10 shows a case where the 5% you drop is all the signal).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: standardise first.</b> We quietly standardised the tumours. What happens if we do not, and why?</div>

  <h2 id="pca-scale"><span class="num">06</span>Standardise First</h2>
  <p><strong>The question we can't answer yet.</strong> PCA hunts for the largest variance. But variance depends on units. Are the tumour columns on comparable scales, and what does PCA do if they are not?</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
data = load_breast_cancer()
X, names = data.data, data.feature_names
sd = X.std(axis=0)
print("largest std:", [f"{names[i]} {sd[i]:.1f}" for i in np.argsort(sd)[::-1][:3]])
print("smallest std:", [f"{names[i]} {sd[i]:.4f}" for i in np.argsort(sd)[:2]])
raw = PCA().fit(X)
print("RAW    EVR top3:", raw.explained_variance_ratio_[:3].round(4),
      " PC1 biggest weight:", names[np.argmax(abs(raw.components_[0]))], round(abs(raw.components_[0]).max(), 3))
sc = PCA().fit(StandardScaler().fit_transform(X))
print("SCALED EVR top3:", sc.explained_variance_ratio_[:3].round(4))
corr = np.corrcoef(X, rowvar=False)
ev = np.sort(np.linalg.eigvalsh(corr))[::-1]
print("eigenvalues of the correlation matrix / 30:", (ev[:3] / 30).round(4))</div>
  <div class="fx" data-lang="text">largest std: ['worst area 568.9', 'mean area 351.6', 'area error 45.5']
smallest std: ['fractal dimension error 0.0026', 'smoothness error 0.0030']
RAW    EVR top3: [0.982  0.0162 0.0016]  PC1 biggest weight: worst area 0.852
SCALED EVR top3: [0.4427 0.1897 0.0939]
eigenvalues of the correlation matrix / 30: [0.4427 0.1897 0.0939]</div>
  <p>"worst area" (square pixels, std 568.9) has a variance over ten billion times that of "fractal dimension error" (std 0.0026). Raw PCA therefore reports PC1 = 98.2% and PC1 is basically "worst area" (weight 0.852): it "found" the column with the biggest numbers, not the most important pattern. After <code>StandardScaler</code> (each column: subtract mean, divide by std, so every variance is 1) the variance spreads out: 44.3%, 19.0%, 9.4%. The last line shows that PCA on standardised data equals the eigen-decomposition of the <strong>correlation matrix</strong>: its eigenvalues ÷ 30 are exactly the scaled EVRs.</p>
  <p>Our 5-tumour toy used raw values deliberately: radius and texture are both in similar units with variances 5 and 2.5, so raw PCA is reasonable there. Scaled, the variances become 1 and 1, the correlation is 3/√(5 × 2.5) = 0.849, and PC1 becomes (0.707, 0.707) with EVR (1 + 0.849)/2 = 92.4%.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A report card where Maths is marked out of 1,000 and every other subject out of 10. "Who is best overall" becomes "who is best at Maths". Converting every subject to a percentage first is standardising.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Standardisation</strong>: zⱼ = (xⱼ − meanⱼ)/stdⱼ. PCA on standardised data = PCA of the correlation matrix; each column then contributes variance 1 and total variance = d.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not standardise when all columns share one meaningful unit and their spread matters (pixel intensities, a spectrum of measurements in the same unit); scaling would inflate pure-noise columns to the same weight as signal. The rule is "standardise when units differ".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SVD.</b> We have computed PCA through the covariance matrix. sklearn does not form that matrix at all. How does it compute PCA, and do we get the same answer?</div>

  <h2 id="pca-svd"><span class="num">07</span>The SVD Connection</h2>
  <p><strong>The question we can't answer yet.</strong> Forming S = CᵀC for 30 columns is cheap, but for 100,000 columns it is a 100,000 × 100,000 matrix, and squaring numbers loses precision. Is there a route that skips S?</p>
  <p>The <strong>singular value decomposition</strong> writes any matrix as C = U Σ Vᵀ: U (n × r) and V (d × r) have orthonormal columns, Σ is diagonal with singular values s₁ ≥ s₂ ≥ … ≥ 0. Then</p>
  <p>CᵀC = V Σ Uᵀ U Σ Vᵀ = V Σ² Vᵀ, so S = CᵀC/(n − 1) = V (Σ²/(n − 1)) Vᵀ.</p>
  <p>That is an eigen-decomposition of S: <strong>the columns of V are the principal components</strong> and <strong>λᵢ = sᵢ²/(n − 1)</strong>. The scores are CV = UΣ. By hand: λ = 7 and 0.5 with n − 1 = 4 means s² = 28 and 2, so <strong>s = 5.292 and 1.414</strong>; s₁² = 28 is exactly the "kept" sum of squares from section 04.</p>
  <div class="fx" data-lang="py">import numpy as np
from five import P
C = P - P.mean(axis=0)
U, s, Vt = np.linalg.svd(C, full_matrices=False)       # C = U diag(s) Vt
print("singular values s:", s.round(4), " s^2:", (s ** 2).round(4), " s^2/(n-1):", (s ** 2 / 4).round(4))
print("rows of Vt (= PC directions):\\n", Vt.round(4))
print("U*s (= scores):\\n", (U * s).round(3))
print("C rebuilt from U s Vt:", np.allclose(U @ np.diag(s) @ Vt, C))</div>
  <div class="fx" data-lang="text">singular values s: [5.2915 1.4142]  s^2: [28.  2.]  s^2/(n-1): [7.  0.5]
rows of Vt (= PC directions):
 [[ 0.8321  0.5547]
 [-0.5547  0.8321]]
U*s (= scores):
 [[-3.051  0.832]
 [-1.941 -1.109]
 [ 0.     0.   ]
 [ 1.387  0.277]
 [ 3.606  0.   ]]
C rebuilt from U s Vt: True</div>
  <p>Singular values 5.2915 and 1.4142; squared 28 and 2; divided by 4: 7 and 0.5. The rows of Vᵀ are the PCs (second one with the opposite sign, which is allowed). U·s gives the same scores as the hand table (PC2 sign flipped). sklearn's <code>PCA</code> centres the data and runs an SVD (<code>svd_solver="full"</code> exact LAPACK, <code>"randomized"</code> fast approximation for the top k of a big matrix, <code>"arpack"</code> for a few components, <code>"covariance_eigh"</code> forms S when n ≫ d, <code>"auto"</code> picks one), then flips signs with a fixed rule so results are deterministic.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For centred data C = UΣVᵀ: principal directions = columns of V (rows of <code>components_</code>), explained variances λᵢ = sᵢ²/(n − 1) (<code>explained_variance_</code>; <code>singular_values_</code> = s), scores = UΣ = CV.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing up n and n − 1: <code>explained_variance_</code> uses n − 1 (sample variance) while NumPy's <code>.var()</code> defaults to n. The ratios (EVR) are unaffected; the raw λ differ by a factor n/(n − 1).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: reading the components.</b> We can compute the 30 tumour components. What does PC1 of the tumours actually <em>mean</em>?</div>

  <h2 id="pca-read"><span class="num">08</span>Reading Components</h2>
  <p><strong>The question we can't answer yet.</strong> A component is a list of 30 weights. Can we give it a name a doctor would understand, and how strongly is each original measurement tied to it?</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
data = load_breast_cancer()
Xs = StandardScaler().fit_transform(data.data)
pca = PCA(3).fit(Xs)
W = pd.DataFrame(pca.components_.T, index=data.feature_names, columns=["PC1", "PC2", "PC3"])
for pc in ["PC1", "PC2"]:
    top = W[pc].abs().sort_values(ascending=False).index[:5]
    print(pc, "top weights:", ", ".join(f"{n} {W.loc[n, pc]:+.2f}" for n in top))
print("PC1: all 30 weights same sign?", bool((np.sign(W.PC1) == np.sign(W.PC1.iloc[0])).all()) or
      f"{(W.PC1 &gt; 0).sum()} positive / {(W.PC1 &lt; 0).sum()} negative")
Z = pca.transform(Xs)
print("mean PC1 score  malignant:", Z[data.target == 0, 0].mean().round(2), " benign:", Z[data.target == 1, 0].mean().round(2))
load = pca.components_.T * np.sqrt(pca.explained_variance_)       # loadings
print("loading of 'mean radius' on PC1:", load[0, 0].round(3), " corr(mean radius, PC1 score):",
      np.corrcoef(Xs[:, 0], Z[:, 0])[0, 1].round(3))</div>
  <div class="fx" data-lang="text">PC1 top weights: mean concave points +0.26, mean concavity +0.26, worst concave points +0.25, mean compactness +0.24, worst perimeter +0.24
PC2 top weights: mean fractal dimension +0.37, fractal dimension error +0.28, worst fractal dimension +0.28, mean radius -0.23, compactness error +0.23
PC1: all 30 weights same sign? True
mean PC1 score  malignant: 3.71  benign: -2.21
loading of 'mean radius' on PC1: 0.798  corr(mean radius, PC1 score): 0.798</div>
  <p><strong>PC1</strong>: all 30 weights have the same sign, the largest on concave points, concavity, compactness and perimeter. It is an "overall size and irregularity" score: a tumour that is big and jagged on every measurement scores high. Malignant tumours average <strong>+3.71</strong> on it, benign <strong>−2.21</strong>: PC1 alone separates the classes well (0.912 accuracy, next section). <strong>PC2</strong> contrasts fractal-dimension measurements (+) with radius (−): "complex outline relative to size". Further components get harder to name.</p>
  <p><strong>Weights vs loadings</strong>: <code>components_</code> holds unit-length weights (how to build the score). Multiplying by √λ gives <strong>loadings</strong>, which on standardised data equal the correlation between each original column and the component score: mean radius has loading 0.798 on PC1, and its correlation with the PC1 score is exactly 0.798. A <strong>biplot</strong> draws the scores as points and the loadings as arrows on the same PC1–PC2 axes.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Weights</strong> (components, eigenvectors) wⱼ: score = Σ wⱼ zⱼ. <strong>Loadings</strong> = wⱼ√λ; on standardised data, loading = corr(original column, PC score).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Telling a doctor "PC3 matters" means nothing. Components mix every column and their meaning can change when data changes. If stakeholders need named drivers, use feature selection or explain the model on original columns.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: PCA in a pipeline.</b> We can compute and read PCA. How do we use it to feed a classifier, choose k properly, and avoid leaking test data into the components?</div>

  <h2 id="pca-pipe"><span class="num">09</span>PCA in a Pipeline</h2>
  <p><strong>The question we can't answer yet.</strong> The variance rules suggested k between 3 and 10. Which k actually gives the best malignant/benign classifier, and how do we measure it honestly?</p>
  <p>PCA learns a mean and components from data. If you fit it on all 569 tumours and then cross-validate a classifier, the test folds helped choose the axes: mild leakage. Put <code>StandardScaler → PCA → model</code> in one <code>Pipeline</code>, so each fold fits scaling and PCA on its training part only, and tune <code>pca__n_components</code> like any hyperparameter (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_score
X, y = load_breast_cancer(return_X_y=True)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
for name, model in [("logistic", LogisticRegression(max_iter=5000)), ("5-NN", KNeighborsClassifier(5))]:
    row = []
    for k in (1, 2, 3, 5, 7, 10, 30):
        pipe = Pipeline([("scale", StandardScaler()), ("pca", PCA(k)), ("clf", model)])
        row.append(f"k={k}: {cross_val_score(pipe, X, y, cv=cv).mean():.3f}")
    print(f"{name:8s}", "  ".join(row))
pipe = Pipeline([("scale", StandardScaler()), ("pca", PCA()), ("clf", LogisticRegression(max_iter=5000))])
grid = GridSearchCV(pipe, {"pca__n_components": [2, 3, 5, 7, 10, 15, 20],
                           "clf__C": [0.1, 1, 10]}, cv=cv).fit(X, y)
print("GridSearchCV best:", grid.best_params_, "cv acc", round(grid.best_score_, 3))</div>
  <div class="fx" data-lang="text">logistic k=1: 0.912  k=2: 0.958  k=3: 0.949  k=5: 0.974  k=7: 0.968  k=10: 0.981  k=30: 0.979
5-NN     k=1: 0.903  k=2: 0.939  k=3: 0.939  k=5: 0.960  k=7: 0.961  k=10: 0.965  k=30: 0.965
GridSearchCV best: {'clf__C': 1, 'pca__n_components': 10} cv acc 0.981</div>
  <p>Logistic regression: one component (PC1, "size/irregularity") already gives 0.912; two give 0.958; ten give <strong>0.981</strong>, slightly better than all 30 columns (0.979) because dropping 20 noisy, collinear directions regularises the model. 5-NN improves steadily up to 0.965. <code>GridSearchCV</code> searching k and C together picks k = 10, C = 1. Parameter names use the step name: <code>pca__n_components</code>.</p>
  <h3>Other uses of the same machinery</h3>
  <ul>
    <li><strong>Compression</strong>: store 10 scores instead of 30 numbers; <code>inverse_transform</code> rebuilds an approximation (with k = 10, losing under 5% of the variance).</li>
    <li><strong>Denoising</strong>: noise spreads over all directions while signal sits in the top few, so rebuilding from the top components removes much of the noise (classic on images).</li>
    <li><strong>Decorrelation / whitening</strong>: PC scores are uncorrelated; <code>whiten=True</code> also rescales each to variance 1, useful before some models (and before ICA).</li>
    <li><strong>Before t-SNE, UMAP, clustering</strong>: reduce to ~50 components first to remove noise and speed up neighbour search.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>Pipeline([("scale", StandardScaler()), ("pca", PCA(k)), ("clf", model)])</code>: <code>fit</code> learns scaling, components and model on training data; <code>predict</code> applies the same learned transforms to new rows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Trees and boosting rarely benefit from PCA: they split on single columns, and rotated axes destroy the "one meaningful column" structure they exploit. PCA helps most for linear models, kNN, SVMs and neural nets on many correlated columns.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the limits of PCA.</b> On the tumours PCA worked well. Is that guaranteed? When does keeping the largest-variance directions throw away exactly what we needed?</div>

  <h2 id="pca-limits"><span class="num">10</span>Limits of PCA</h2>
  <p><strong>The question we can't answer yet.</strong> PCA makes three assumptions without saying so: high variance means important, the structure is flat (linear), and every row is trustworthy. What happens when each fails?</p>
  <h3>1. Variance is not importance</h3>
  <p>Imagine two tumour subtypes that differ by a small, consistent texture shift, while size varies hugely between patients for unrelated reasons. PCA never looks at the label, so it keeps the size direction.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_circles
from sklearn.decomposition import PCA, KernelPCA
from sklearn.linear_model import LogisticRegression
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.model_selection import cross_val_score

# 1) variance is not importance: classes differ along the LOW-variance direction
rng = np.random.default_rng(0)
n = 200
big = rng.normal(0, 10, n)                       # huge spread, unrelated to the class
y = np.repeat([0, 1], n // 2)
small = rng.normal(0, 0.5, n) + np.where(y == 1, 1.5, -1.5)   # small spread, carries the class
X = np.c_[big, small]
print("variances:", X.var(axis=0).round(2))
z_pca = PCA(1).fit_transform(X)
z_lda = LinearDiscriminantAnalysis(n_components=1).fit_transform(X, y)
for name, Z in [("PCA 1 comp", z_pca), ("LDA 1 comp", z_lda), ("both cols", X)]:
    print(f"{name:11s} acc = {cross_val_score(LogisticRegression(), Z, y, cv=5).mean():.3f}")

# 2) linear only: two rings
Xc, yc = make_circles(400, factor=0.3, noise=0.05, random_state=0)   # inner ring vs outer ring
z_lin = PCA(1).fit_transform(Xc)
z_ker = KernelPCA(1, kernel="rbf", gamma=2).fit_transform(Xc)
for name, Z in [("PCA 1 comp", z_lin), ("KernelPCA rbf", z_ker)]:
    print(f"rings {name:14s} acc = {cross_val_score(LogisticRegression(), Z, yc, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">variances: [92.39  2.59]
PCA 1 comp  acc = 0.470
LDA 1 comp  acc = 0.995
both cols   acc = 0.995
rings PCA 1 comp     acc = 0.450
rings KernelPCA rbf  acc = 1.000</div>
  <p>The useless column has variance 92.4, the useful one 2.6. PCA's one component is the useless direction: accuracy <strong>0.470</strong>, a coin flip. <strong>LDA</strong> (Linear Discriminant Analysis), which uses the labels to find the direction that best separates classes (between-class ÷ within-class variance, the ANOVA-F idea from the previous note), keeps the right one: <strong>0.995</strong>.</p>
  <h3>2. Linear only</h3>
  <p>The second part of the output: two rings, inner and outer. No straight-line projection separates them: PCA's one component gives <strong>0.450</strong>. Kernel PCA (section 11) reaches <strong>1.000</strong>.</p>
  <h3>3. Outliers</h3>
  <p>Squared distances let one extreme row dominate. Add one tumour with a mistyped texture of 40 to our five:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.decomposition import PCA
from five import P
print("PC1 without outlier:", PCA(1).fit(P).components_.round(3))
Q = np.vstack([P, [[15, 40]]])                 # one mis-typed texture value
print("PC1 with one outlier:", PCA(1).fit(Q).components_.round(3))</div>
  <div class="fx" data-lang="text">PC1 without outlier: [[0.832 0.555]]
PC1 with one outlier: [[0.03 1.  ]]</div>
  <p>PC1 swings from (0.832, 0.555) to (0.03, 1.00): it now just points at the bad row. Clean outliers first, or use a robust scaler / robust PCA variants.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LDA</strong> finds up to (classes − 1) directions maximising between-class over within-class variance; it is supervised. <strong>PCA</strong> is unsupervised and maximises total variance.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading a PCA scatter plot where classes overlap and concluding "the classes are not separable". The separating direction may simply have low variance, or be curved.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: kernel and incremental PCA.</b> Can PCA be bent to handle curves, and stretched to handle data that does not fit in memory?</div>

  <h2 id="pca-variants"><span class="num">11</span>Kernel &amp; Incremental PCA</h2>
  <p><strong>The question we can't answer yet.</strong> The rings defeated linear PCA, and a hospital network with millions of scans cannot load them all at once. Are there versions of PCA for these two cases?</p>
  <h3>Kernel PCA (brief)</h3>
  <p>Idea: first map each point into a richer space where the structure becomes flat, then do PCA there. For the rings, adding the feature r² = x² + y² would do: inner ring small, outer large, and a straight line separates them. The <strong>kernel trick</strong> (as in <a class="xref" data-note="ml_svm">Support Vector Machines</a>) does this without building the new features: it only needs the similarities k(xᵢ, xⱼ) between all pairs, e.g. the RBF kernel exp(−γ‖xᵢ − xⱼ‖²). Kernel PCA centres the n × n kernel matrix and takes its top eigenvectors; the scores are the components. With γ = 2, one kernel component separated the rings perfectly (1.000 above). Costs: an n × n matrix (memory O(n²)), a γ to tune, no explicit component weights, and <code>inverse_transform</code> is only approximate (<code>fit_inverse_transform=True</code>).</p>
  <h3>Incremental PCA (brief)</h3>
  <p><code>IncrementalPCA</code> updates the components chunk by chunk with <code>partial_fit</code>, so memory depends on the batch size, not n.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA, IncrementalPCA
from sklearn.preprocessing import StandardScaler
Xs = StandardScaler().fit_transform(load_breast_cancer().data)
full = PCA(10).fit(Xs)
inc = IncrementalPCA(10, batch_size=100)
for start in range(0, len(Xs), 100):                 # feed 100 rows at a time
    inc.partial_fit(Xs[start:start + 100])           # (in real use: read each chunk from disk)
print("full EVR 1-5:", full.explained_variance_ratio_[:5].round(4))
print("incr EVR 1-5:", inc.explained_variance_ratio_[:5].round(4))
cos = np.abs((full.components_ * inc.components_).sum(axis=1))
print("|cosine| between matching components 1-10:", cos.round(3))
r = PCA(5, svd_solver="randomized", random_state=0).fit(Xs)
print("randomized EVR 1-5:", r.explained_variance_ratio_.round(4))</div>
  <div class="fx" data-lang="text">full EVR 1-5: [0.4427 0.1897 0.0939 0.066  0.055 ]
incr EVR 1-5: [0.4427 0.1897 0.0939 0.066  0.0549]
|cosine| between matching components 1-10: [1.    1.    1.    1.    1.    1.    0.998 0.999 0.958 0.984]
randomized EVR 1-5: [0.4427 0.1897 0.0939 0.066  0.055 ]</div>
  <p>Feeding 100 tumours at a time reproduces the full PCA's EVR (0.4427, 0.1897, 0.0939, 0.066, 0.0549) and the first 8 components almost exactly (|cosine| ≥ 0.998); components 9–10 drift slightly, so ask for a few more components than you need. Randomized PCA gives the same top-5 EVR at a fraction of the cost on big matrices. Related: <code>TruncatedSVD</code> (no centring, works on sparse text matrices: "LSA"), <code>SparsePCA</code> (components with many zero weights, easier to name).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Kernel PCA</strong>: PCA on the centred kernel matrix K, Kᵢⱼ = k(xᵢ, xⱼ), giving non-linear components. <strong>Incremental PCA</strong>: PCA computed from successive mini-batches with <code>partial_fit</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Kernel PCA is not a free upgrade: with n = 1,000,000 the kernel matrix has 10¹² entries, and a bad γ gives useless components (γ = 1 put the ring signal in the 3rd component, not the 1st). For big non-linear data, UMAP is usually the practical choice.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: from scratch.</b> We have used PCA through sklearn. Can we write every step ourselves and get identical numbers?</div>

  <h2 id="pca-scratch"><span class="num">12</span>From Scratch</h2>
  <p><strong>The question we can't answer yet.</strong> Do we understand PCA well enough to rebuild it? The steps are the ones we did by hand: centre, covariance, eigen-decomposition, sort, fix signs, project, rebuild.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

class MyPCA:
    def __init__(self, n_components):
        self.k = n_components
    def fit(self, X):
        self.mean_ = X.mean(axis=0)
        C = X - self.mean_                                   # 1. centre
        S = C.T @ C / (len(X) - 1)                           # 2. covariance
        vals, vecs = np.linalg.eigh(S)                       # 3. eigen-decomposition
        order = np.argsort(vals)[::-1]                       # 4. sort, largest first
        vals, vecs = vals[order], vecs[:, order]
        for j in range(vecs.shape[1]):                       # 5. sign rule: largest |weight| positive
            if vecs[np.argmax(np.abs(vecs[:, j])), j] &lt; 0:
                vecs[:, j] *= -1
        self.components_ = vecs[:, :self.k].T
        self.explained_variance_ = vals[:self.k]
        self.explained_variance_ratio_ = vals[:self.k] / vals.sum()
        return self
    def transform(self, X):
        return (X - self.mean_) @ self.components_.T         # 6. project
    def inverse_transform(self, Z):
        return Z @ self.components_ + self.mean_             # 7. rebuild

Xs = StandardScaler().fit_transform(load_breast_cancer().data)
mine, sk = MyPCA(5).fit(Xs), PCA(5).fit(Xs)
print("EVR mine   :", mine.explained_variance_ratio_.round(4))
print("EVR sklearn:", sk.explained_variance_ratio_.round(4))
signs = np.sign((mine.components_ * sk.components_).sum(axis=1))   # align arbitrary signs
print("components equal (up to sign):", np.allclose(mine.components_ * signs[:, None], sk.components_, atol=1e-8))
print("scores equal (up to sign):   ", np.allclose(mine.transform(Xs) * signs, sk.transform(Xs), atol=1e-8))
err = ((Xs - mine.inverse_transform(mine.transform(Xs))) ** 2).sum() / ((Xs - Xs.mean(0)) ** 2).sum()
print(f"share of total variance lost with 5 comps: {err:.4f}  = 1 - sum(EVR) = {1 - sk.explained_variance_ratio_.sum():.4f}")</div>
  <div class="fx" data-lang="text">EVR mine   : [0.4427 0.1897 0.0939 0.066  0.055 ]
EVR sklearn: [0.4427 0.1897 0.0939 0.066  0.055 ]
components equal (up to sign): True
scores equal (up to sign):    True
share of total variance lost with 5 comps: 0.1527  = 1 - sum(EVR) = 0.1527</div>
  <p>On the 569 standardised tumours our class matches sklearn's EVR to four decimals, and components and scores agree up to sign (we align signs before comparing). The last line checks the identity from section 04 on real data: the share of variance lost by keeping 5 components, measured by actual reconstruction error, is 0.1527 = 1 − Σ EVR.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The covariance route is fine for 30 columns but numerically worse than SVD for ill-conditioned data and expensive for very wide data. Use it to learn; use sklearn in production.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have many pieces. Let us see how each is built from the previous one, on the five tumours, in one place.</div>

  <h2 id="pca-connect"><span class="num">13</span>How It All Connects</h2>
  <p><strong>The question we can't answer yet.</strong> How do mean, covariance, eigenvalues, scores, EVR, SVD and reconstruction depend on one another?</p>
  <figure class="viz"><svg viewBox="0 0 680 250" width="680">
<defs><marker id="pca-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="11.5">
<rect x="10" y="20" width="110" height="46" rx="7" class="fs" stroke="currentColor"/><text x="65" y="39" text-anchor="middle" font-weight="700">Data X</text><text x="65" y="55" text-anchor="middle" class="tm">(standardise?)</text>
<rect x="145" y="20" width="110" height="46" rx="7" class="fb sb"/><text x="200" y="39" text-anchor="middle" font-weight="700">Mean μ</text><text x="200" y="55" text-anchor="middle" class="tm">(15, 18)</text>
<rect x="280" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="340" y="39" text-anchor="middle" font-weight="700">Centred C</text><text x="340" y="55" text-anchor="middle" class="tm">X − μ</text>
<rect x="425" y="10" width="120" height="46" rx="7" class="fb sb"/><text x="485" y="29" text-anchor="middle" font-weight="700">Covariance S</text><text x="485" y="45" text-anchor="middle" class="tm">CᵀC/(n−1)</text>
<rect x="425" y="70" width="120" height="46" rx="7" class="ft st"/><text x="485" y="89" text-anchor="middle" font-weight="700">SVD of C</text><text x="485" y="105" text-anchor="middle" class="tm">UΣVᵀ</text>
<rect x="570" y="40" width="100" height="50" rx="7" class="fg sg"/><text x="620" y="60" text-anchor="middle" font-weight="700">PCs v, λ</text><text x="620" y="77" text-anchor="middle" class="tm">7 · 0.5</text>
<line x1="120" y1="43" x2="143" y2="43" stroke="currentColor" marker-end="url(#pca-c)"/><line x1="255" y1="43" x2="278" y2="43" stroke="currentColor" marker-end="url(#pca-c)"/>
<line x1="400" y1="38" x2="423" y2="33" stroke="currentColor" marker-end="url(#pca-c)"/><line x1="400" y1="50" x2="423" y2="88" stroke="currentColor" marker-end="url(#pca-c)"/>
<line x1="545" y1="33" x2="568" y2="55" stroke="currentColor" marker-end="url(#pca-c)"/><line x1="545" y1="93" x2="568" y2="75" stroke="currentColor" marker-end="url(#pca-c)"/>
<rect x="420" y="150" width="120" height="46" rx="7" class="fg sg"/><text x="480" y="169" text-anchor="middle" font-weight="700">Scores Z</text><text x="480" y="185" text-anchor="middle" class="tm">C·v = UΣ</text>
<rect x="570" y="150" width="100" height="46" rx="7" class="fg sg"/><text x="620" y="169" text-anchor="middle" font-weight="700">EVR</text><text x="620" y="185" text-anchor="middle" class="tm">λ/Σλ = 93.3%</text>
<rect x="250" y="150" width="140" height="46" rx="7" class="fr sr"/><text x="320" y="169" text-anchor="middle" font-weight="700">Rebuild X̂</text><text x="320" y="185" text-anchor="middle" class="tm">μ + Z·v</text>
<rect x="60" y="150" width="160" height="46" rx="7" class="fr sr"/><text x="140" y="169" text-anchor="middle" font-weight="700">Error = dropped λ</text><text x="140" y="185" text-anchor="middle" class="tm">30 = 28 kept + 2 lost</text>
<line x1="610" y1="90" x2="490" y2="148" stroke="currentColor" marker-end="url(#pca-c)"/><line x1="620" y1="90" x2="620" y2="148" stroke="currentColor" marker-end="url(#pca-c)"/>
<line x1="420" y1="173" x2="392" y2="173" stroke="currentColor" marker-end="url(#pca-c)"/><line x1="250" y1="173" x2="222" y2="173" stroke="currentColor" marker-end="url(#pca-c)"/>
<text x="10" y="232" class="tm">Two roads reach the same PCs: eigen-decomposition of S (by hand) or SVD of C (what sklearn does).</text>
</g></svg><figcaption>Every quantity in PCA is built from the one before it. Numbers are the five tumours.</figcaption></figure>
  <table class="tbl"><caption>Every quantity on the five tumours</caption>
    <tr><th>Quantity</th><th>Built from</th><th>Formula</th><th>Five tumours</th><th>Answers</th></tr>
    <tr><td>Mean μ</td><td>X</td><td>column averages</td><td>(15, 18)</td><td>Where is the centre?</td></tr>
    <tr><td>Centred C</td><td>X, μ</td><td>X − μ</td><td>(−3,−1) (−1,−2) (0,0) (1,1) (3,2)</td><td>Spread around what?</td></tr>
    <tr><td>Covariance S</td><td>C</td><td>CᵀC/(n−1)</td><td>[[5, 3], [3, 2.5]]</td><td>All spreads and co-movements</td></tr>
    <tr><td>Variance along w</td><td>S, w</td><td>wᵀSw</td><td>0°: 5 · 45°: 6.75 · 33.7°: 7</td><td>Spread in any direction</td></tr>
    <tr><td>Eigenvalues λ</td><td>S</td><td>det(S − λI) = 0</td><td>7, 0.5</td><td>Variance along each PC</td></tr>
    <tr><td>PCs v</td><td>S, λ</td><td>(S − λI)v = 0, ‖v‖ = 1</td><td>(0.832, 0.555), (−0.555, 0.832)</td><td>Which directions</td></tr>
    <tr><td>Singular values s</td><td>C</td><td>s² = (n−1)λ</td><td>5.292, 1.414</td><td>Same PCs without S</td></tr>
    <tr><td>Scores Z</td><td>C, v</td><td>C·v</td><td>PC1: −3.051 −1.941 0 1.387 3.606</td><td>New coordinates</td></tr>
    <tr><td>EVR</td><td>λ</td><td>λᵢ/Σλ</td><td>93.3%, 6.7%</td><td>Share of information kept</td></tr>
    <tr><td>Reconstruction X̂</td><td>μ, Z, v</td><td>μ + Z·v</td><td>A → (12.462, 16.308)</td><td>What we can rebuild</td></tr>
    <tr><td>Error</td><td>dropped λ</td><td>(n−1)Σ dropped λ</td><td>4 × 0.5 = 2 of 30</td><td>What we lost</td></tr>
  </table>
  <table class="tbl"><caption>Sensitivity and when to use</caption>
    <tr><th>Piece</th><th>Sensitive to</th><th>Guard</th></tr>
    <tr><td>Covariance / PCs</td><td>Units, outliers</td><td>Standardise when units differ; remove outliers</td></tr>
    <tr><td>EVR</td><td>Number of columns, scaling</td><td>Read the cumulative curve, not one number</td></tr>
    <tr><td>Choice of k</td><td>Task</td><td>CV of the downstream model</td></tr>
    <tr><td>Signs of PCs</td><td>Solver</td><td>Never interpret a sign alone</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: comparisons.</b> Where does PCA sit against selection, LDA, and the non-linear methods of the next notes?</div>

  <h2 id="pca-compare"><span class="num">14</span>Comparisons &amp; Common Mistakes</h2>
  <p><strong>The question we can't answer yet.</strong> Given a new problem, when is PCA the right reduction and when is a sibling method better?</p>
  <table class="tbl">
    <tr><th></th><th>Feature selection</th><th>PCA</th><th>LDA</th><th>Kernel PCA</th><th>t-SNE / UMAP</th></tr>
    <tr><td>Supervised?</td><td>Usually</td><td>No</td><td>Yes</td><td>No</td><td>No (UMAP optional)</td></tr>
    <tr><td>Linear?</td><td>— (keeps columns)</td><td>Yes</td><td>Yes</td><td>No</td><td>No</td></tr>
    <tr><td>Keeps names</td><td>Yes</td><td>No</td><td>No</td><td>No</td><td>No</td></tr>
    <tr><td>New rows</td><td>Trivial</td><td><code>transform</code></td><td><code>transform</code></td><td><code>transform</code></td><td>t-SNE no · UMAP yes</td></tr>
    <tr><td>Max components</td><td>d</td><td>min(n, d)</td><td>classes − 1</td><td>n</td><td>any (usually 2)</td></tr>
    <tr><td>Main use</td><td>Explain, cheaper inputs</td><td>Compression, model input, denoising</td><td>Class separation</td><td>Curved structure, small n</td><td>Pictures (UMAP also input)</td></tr>
    <tr><td>Tumours, 5 dims</td><td>0.968 (RFE)</td><td>0.974</td><td>1 dim max</td><td>—</td><td>—</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: PCA without standardising mixed units</span>
    <p>Raw tumours: PC1 = worst area, 98.2%. Scaled: 44.3%. Units decided the answer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fitting PCA on all data before CV</span>
    <p>The components see the test folds. Put scaler and PCA inside the Pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: choosing k only by "95% variance"</span>
    <p>Variance kept is not accuracy kept; the variance-≠-importance demo lost everything with a 1-component PCA. Tune k by CV.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: interpreting signs or naming late components</span>
    <p>Signs are arbitrary; components beyond the first two or three rarely have a stable meaning.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting PCA to unfold curves</span>
    <p>Rings: 0.450 with PCA. Use kernel PCA, t-SNE or UMAP for curved structure.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ignoring outliers</span>
    <p>One bad texture value turned PC1 from (0.832, 0.555) into (0.03, 1.00).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: t-SNE.</b> PCA's 2-component picture is the best <em>flat</em> view. When the data has many clusters on curved surfaces (handwritten digits are the classic case), a flat view overlaps them. <a class="xref" data-note="ml_tsne">t-SNE</a> draws a map that keeps neighbours together instead.</div>

  <h2 id="pca-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>This section stands alone: the whole note in one place.</p>
  <h3>The question ladder in one line each</h3>
  <ol>
    <li><strong>Max-spread direction</strong>: one number per row = position along the most spread-out direction.</li>
    <li><strong>Centring</strong>: measure spread around the mean.</li>
    <li><strong>Covariance matrix</strong>: S stores all spreads; variance along w is wᵀSw.</li>
    <li><strong>Eigenvectors</strong>: max wᵀSw with ‖w‖ = 1 ⇒ Sw = λw; λ = variance along w.</li>
    <li><strong>Scores &amp; reconstruction</strong>: z = C·v; rebuild μ + z·v; lost = dropped variance.</li>
    <li><strong>EVR &amp; k</strong>: λ/Σλ; choose k by cumulative EVR, scree, Kaiser, or CV.</li>
    <li><strong>Standardise</strong>: otherwise the biggest-unit column wins.</li>
    <li><strong>SVD</strong>: C = UΣVᵀ gives PCs (V), λ = s²/(n−1), scores UΣ.</li>
    <li><strong>Loadings</strong>: weight × √λ = correlation with the PC (standardised data).</li>
    <li><strong>Pipeline</strong>: scale → PCA → model, k tuned by CV.</li>
    <li><strong>Limits</strong>: variance ≠ importance, linear only, outlier-sensitive, unnamed axes.</li>
    <li><strong>Variants</strong>: kernel PCA for curves, incremental PCA for big data.</li>
  </ol>
  <h3>Definitions</h3>
  <div class="cards">
    <div><b>Principal component</b><p>A unit direction of maximum remaining variance, perpendicular to earlier ones; an eigenvector of the covariance matrix.</p><small>components_</small></div>
    <div><b>Eigenvalue λ</b><p>Variance of the data along its PC. Σλ = total variance.</p><small>explained_variance_</small></div>
    <div><b>Score</b><p>A row's coordinate on a PC: centred row · PC.</p><small>transform</small></div>
    <div><b>EVR</b><p>λᵢ/Σλ: share of variance kept by PCᵢ.</p><small>explained_variance_ratio_</small></div>
    <div><b>Loading</b><p>Weight × √λ; correlation of a column with the PC on standardised data.</p><small>interpretation</small></div>
    <div><b>Reconstruction</b><p>μ + scores · PCs; error = variance of dropped PCs.</p><small>inverse_transform</small></div>
  </div>
  <h3>Formulas and symbols</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols</th></tr>
    <tr><td>C = X − μ; S = CᵀC/(n − 1)</td><td>X data (n × d), μ column means, S covariance</td></tr>
    <tr><td>var along w = wᵀSw, ‖w‖ = 1</td><td>w unit direction</td></tr>
    <tr><td>Sv = λv; det(S − λI) = 0</td><td>v eigenvector (PC), λ eigenvalue</td></tr>
    <tr><td>2×2: λ² − (trace)λ + det = 0</td><td>trace = sum of diagonal, det = ad − bc</td></tr>
    <tr><td>Z = C Vₖ; X̂ = Z Vₖᵀ + μ</td><td>Vₖ top-k PCs as columns</td></tr>
    <tr><td>EVRᵢ = λᵢ / Σλ</td><td>share of variance</td></tr>
    <tr><td>‖C − Ĉ‖² = (n − 1) Σ_{i&gt;k} λᵢ</td><td>reconstruction error</td></tr>
    <tr><td>C = UΣVᵀ; λᵢ = sᵢ²/(n − 1); Z = UΣ</td><td>s singular values</td></tr>
    <tr><td>loading = w √λ</td><td>= corr(column, score) when standardised</td></tr>
  </table>
  <h3>The running example in one table</h3>
  <table class="tbl">
    <tr><th>Five tumours (radius, texture)</th><th>Value</th><th>All 569 tumours (30 cols, standardised)</th><th>Value</th></tr>
    <tr><td>mean</td><td>(15, 18)</td><td>raw PC1 EVR (unscaled!)</td><td>98.2% (worst area)</td></tr>
    <tr><td>S</td><td>[[5, 3], [3, 2.5]]</td><td>scaled EVR 1–3</td><td>44.3%, 19.0%, 9.4%</td></tr>
    <tr><td>λ</td><td>7, 0.5</td><td>k for 90% / 95%</td><td>7 / 10</td></tr>
    <tr><td>PC1, PC2</td><td>(0.832, 0.555), (−0.555, 0.832)</td><td>Kaiser k</td><td>6</td></tr>
    <tr><td>PC1 scores</td><td>−3.051, −1.941, 0, 1.387, 3.606</td><td>Logistic CV k = 1 / 2 / 10 / 30</td><td>0.912 / 0.958 / 0.981 / 0.979</td></tr>
    <tr><td>EVR</td><td>93.3%, 6.7%</td><td>PC1 mean score malignant / benign</td><td>+3.71 / −2.21</td></tr>
    <tr><td>rebuild of A (12, 17)</td><td>(12.462, 16.308)</td><td>loading of mean radius on PC1</td><td>0.798</td></tr>
    <tr><td>SS total = kept + lost</td><td>30 = 28 + 2</td><td>variance lost with k = 5</td><td>15.3%</td></tr>
    <tr><td>singular values</td><td>5.292, 1.414</td><td>Limits demos</td><td>PCA 0.470 vs LDA 0.995; rings 0.450 vs kernel 1.000</td></tr>
  </table>
  <h3>When to use / not use</h3>
  <ul>
    <li><strong>Use</strong>: many correlated numeric columns; linear models, kNN, SVM inputs; compression and denoising; a first 2-D look; before t-SNE/UMAP/clustering.</li>
    <li><strong>Avoid</strong>: when you need named drivers; when the signal may be in low-variance directions (try LDA or supervised selection); curved structure (kernel PCA, UMAP); tree models (rarely help); heavy outliers without cleaning.</li>
  </ul>
  <h3>Key traps</h3>
  <ul>
    <li>Standardise mixed units; fit inside a Pipeline; tune k by CV.</li>
    <li>Signs are arbitrary; late components rarely have stable meaning.</li>
    <li>Variance ≠ importance; PCA ≠ regression line.</li>
  </ul>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>Eigenvalues of [[4, 2], [2, 1]]? <em>λ² − 5λ + 0 = 0 → 5 and 0 (the data lies on a line).</em></li>
    <li>EVR of PC1 for λ = 7, 0.5? <em>7 / 7.5 = 93.3%.</em></li>
    <li>Singular value of PC1 for λ = 7 and n = 5? <em>√(4 × 7) = 5.292.</em></li>
    <li>Why scale before PCA on the tumours? <em>Worst area's variance swamps everything (98.2% raw).</em></li>
    <li>Reconstruction error from keeping PC1 of the five tumours? <em>(n − 1)λ₂ = 4 × 0.5 = 2.</em></li>
  </ol>

  <h2 id="pca-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain PCA in plain words.</summary><div class="qa-body">Find the direction in which the data is most spread out (PC1), then the most spread-out direction perpendicular to it (PC2), and so on. Describe each row by its positions along the first k directions and drop the rest. It is a rotation of the axes followed by dropping the low-variance ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Do PCA by hand on the covariance matrix [[5, 3], [3, 2.5]].</summary><div class="qa-body">det(S − λI) = λ² − 7.5λ + 3.5 = 0 → λ = 7, 0.5. For λ = 7: −2a + 3b = 0 → (3, 2)/√13 = (0.832, 0.555). For 0.5: (2, −3)/√13. EVR = 7/7.5 = 93.3% and 6.7%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are the principal components eigenvectors of the covariance matrix?</summary><div class="qa-body">The variance of projections onto a unit vector w is wᵀSw. Maximising it subject to wᵀw = 1 with a Lagrange multiplier gives Sw = λw, and the variance achieved is λ, so the best direction is the eigenvector with the largest eigenvalue; later PCs are the next eigenvectors, perpendicular because S is symmetric.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is maximising variance the same as minimising reconstruction error?</summary><div class="qa-body">Each centred row splits into a part on the kept subspace and a perpendicular remainder, so total sum of squares = kept + lost (Pythagoras: 30 = 28 + 2 for the five tumours). The total is fixed, so maximising kept minimises lost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why standardise before PCA, and when not to?</summary><div class="qa-body">PCA maximises variance, which depends on units: raw tumour PCA gave PC1 = worst area with 98.2%. Standardise when columns have different units (then PCA = eigen of the correlation matrix). Do not when all columns share one unit and their spread is meaningful (pixels, spectra).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose the number of components?</summary><div class="qa-body">Cumulative EVR threshold (tumours: 90% → 7, 95% → 10), scree elbow (~3), Kaiser λ &gt; 1 on standardised data (6), or best: tune k by CV of the downstream model inside a pipeline (k = 10 gave 0.981).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is PCA related to SVD?</summary><div class="qa-body">For centred C = UΣVᵀ, CᵀC = VΣ²Vᵀ, so the columns of V are the PCs, λᵢ = sᵢ²/(n − 1), and scores = UΣ. sklearn uses SVD (more stable, no need to form CᵀC; randomized SVD for big data). Five tumours: s = 5.292, 1.414 → λ = 7, 0.5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Weights vs loadings?</summary><div class="qa-body">Weights (components_) are the unit eigenvector entries used to compute scores. Loadings = weight × √λ; on standardised data they equal the correlation between each original column and the PC score (mean radius: 0.798 on PC1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does PCA always help a model?</summary><div class="qa-body">No. It can drop low-variance but predictive directions (PCA 0.470 vs LDA 0.995 in the demo), it hurts interpretability, and tree models rarely benefit. It helps linear models, kNN and SVMs on many correlated columns, and can regularise slightly (tumours: 0.981 with 10 components vs 0.979 with all 30).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>PCA vs LDA?</summary><div class="qa-body">PCA is unsupervised: directions of maximum total variance. LDA is supervised: directions maximising between-class over within-class variance, at most classes − 1 of them. Use LDA when class separation is the goal.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the effect of an outlier on PCA?</summary><div class="qa-body">Variance uses squared distances, so one extreme row can rotate PC1 towards itself: adding one tumour with texture 40 moved PC1 from (0.832, 0.555) to (0.03, 1.00). Clean or down-weight outliers, or use robust PCA.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use Kernel PCA or IncrementalPCA?</summary><div class="qa-body">Kernel PCA for curved structure on modest n (rings: 0.450 → 1.000 with an RBF kernel), at O(n²) memory and with γ to tune. IncrementalPCA when data does not fit in memory: partial_fit on chunks reproduced the full EVR. For sparse text use TruncatedSVD.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) How does PCA fix the weakness of feature selection from the previous note?</summary><div class="qa-body">Selection could only keep or drop radius and perimeter (r = 0.999). PCA merges all correlated measurements into uncorrelated components, so information spread across many columns is kept: 5 PCs gave 0.974 vs 0.968 for the best 5 selected columns. The price is that components have no simple names.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Why is PCA usually run before t-SNE or UMAP?</summary><div class="qa-body">Those methods start from nearest neighbours, which are noisy in high dimensions (the curse of dimensionality) and slow to compute. Reducing to ~50 principal components removes noise directions and speeds neighbour search, while keeping most of the structure; sklearn's t-SNE even uses PCA for its default initialisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>(Connection) Where else have you met eigenvectors and SVD in this course?</summary><div class="qa-body">The same decomposition underlies <a class="xref" data-note="m_linalg">Linear Algebra</a> (eigen-decomposition, SVD), matrix factorization in <a class="xref" data-note="ml_mf">recommender systems</a> (low-rank approximation of the rating matrix, the Eckart–Young idea), and LSA for text (TruncatedSVD).</div></details>
</main>
`
});
