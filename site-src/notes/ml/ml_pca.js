// notes/ml/ml_pca.js — PCA
Object.assign(TOPIC_CONTENT, {
  "ml_pca": `<main>
  <h1>Principal Component Analysis (PCA)</h1>
  <div class="where"><span>Machine Learning</span><span>Dimensionality Reduction</span><span>PCA</span></div>
  <p class="lead">Principal Component Analysis, or PCA, replaces many overlapping columns with a few new ones, called principal components, that keep as much of the data's spread as possible. It is the most widely used dimensionality-reduction method: it compresses inputs before a model, removes noise, makes a first picture of a dataset, and prepares data for t-SNE, UMAP and clustering. Feature selection, from the previous note, could only keep or drop whole columns; PCA can <em>merge</em> them, so radius and perimeter, which say almost the same thing, become one stronger column. We continue the breast-tumour story: every step of PCA is first worked by hand on 5 tumours with 2 measurements, then repeated on the real 569 tumours with 30 measurements, and finally built from scratch in NumPy to match scikit-learn exactly.</p>

  <h2 id="pca-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">PCA</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>New axes along the directions of greatest spread</li>
          <li>Each PC is a weighted mix of all columns; PCs are perpendicular</li>
          <li>Keep the top k, drop the rest</li>
          <li>Unsupervised and linear</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The maths</div>
        <ul>
          <li>Centre → covariance S = CᵀC/(n−1)</li>
          <li>Variance along unit w = wᵀSw</li>
          <li>Best w: eigenvector of S; its variance = eigenvalue λ</li>
          <li>Computed via SVD: C = UΣVᵀ, λ = s²/(n−1)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using it</div>
        <ul>
          <li>Standardise first when units differ</li>
          <li>EVR = λ/Σλ; choose k by 95%, scree, or best by CV</li>
          <li>Fit inside a Pipeline</li>
          <li>Scores = transform; rebuild = inverse_transform</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Limits</div>
        <ul>
          <li>High variance ≠ useful for the label (LDA)</li>
          <li>Straight lines only (Kernel PCA, UMAP)</li>
          <li>Outliers swing the axes</li>
          <li>Components have no names; signs are arbitrary</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pca-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Direction of Greatest Spread</span><span class="rm-sub">one number that captures two columns</span></div></div>
      <div class="rm-item rm-done" data-target="pca-cov"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Centring and the Covariance Matrix</span><span class="rm-sub">the spread in every direction at once</span></div></div>
      <div class="rm-item rm-done" data-target="pca-eig"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Eigenvectors and Eigenvalues</span><span class="rm-sub">why the best direction is an eigenvector</span></div></div>
      <div class="rm-item rm-done" data-target="pca-proj"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Scores and Reconstruction</span><span class="rm-sub">what each tumour becomes, and what is lost</span></div></div>
      <div class="rm-item rm-done" data-target="pca-scale"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Standardise First</span><span class="rm-sub">why units can hijack PCA</span></div></div>
      <div class="rm-item rm-done" data-target="pca-evr"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Explained Variance and Choosing k</span><span class="rm-sub">how many components to keep</span></div></div>
      <div class="rm-item rm-done" data-target="pca-svd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">How PCA Is Computed: SVD</span><span class="rm-sub">and a from-scratch version</span></div></div>
      <div class="rm-item rm-done" data-target="pca-read"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Reading the Components</span><span class="rm-sub">weights, loadings and meaning</span></div></div>
      <div class="rm-item rm-done" data-target="pca-pipe"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">PCA in a Pipeline</span><span class="rm-sub">feeding a model and tuning k</span></div></div>
      <div class="rm-item rm-done" data-target="pca-limits"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Where PCA Fails</span><span class="rm-sub">variance ≠ importance, curves, outliers</span></div></div>
      <div class="rm-item rm-done" data-target="pca-variants"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Kernel PCA and Incremental PCA</span><span class="rm-sub">bending PCA and scaling it up</span></div></div>
      <div class="rm-item rm-done" data-target="pca-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">scaling, leakage, signs, choosing k</span></div></div>
      <div class="rm-item rm-done" data-target="pca-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="pca-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on PCA</span></div></div>
    </div>
  </div>

  <h2 id="pca-idea"><span class="num">01</span>The Direction of Greatest Spread</h2>
  <p>In the previous note, <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a>, feature selection had to choose between radius and perimeter, two columns that correlate 0.999. Keeping both wastes a column; dropping one loses its small extra information. More generally, the 30 tumour measurements overlap heavily (size appears as radius, perimeter and area, each in "mean", "error" and "worst" versions), so information is spread thinly across many columns and choosing a few of them throws some away. What we would like is a way to combine overlapping columns into one number that captures most of what they say together.</p>
  <p>To see how, start very small. Here are 5 tumours with two measurements each, radius in millimetres and texture:</p>
  <table class="tbl">
    <tr><th>tumour</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr>
    <tr><td>radius</td><td>12</td><td>14</td><td>15</td><td>16</td><td>18</td></tr>
    <tr><td>texture</td><td>17</td><td>16</td><td>18</td><td>19</td><td>20</td></tr>
  </table>
  <p>Every hand-worked example imports this table from a file called <code>five.py</code>:</p>
  <div class="fx" data-lang="py">import numpy as np
# five tumours: radius (mm) and texture, from the breast-cancer story
P = np.array([[12, 17], [14, 16], [15, 18], [16, 19], [18, 20]], dtype=float)</div>
  <p>Bigger tumours tend to have rougher texture, so if you plot the five as dots (radius across, texture up) they lie roughly along a tilted line. The idea of PCA is to look at a cloud of points and find the direction in which it is most spread out. That direction becomes the first new axis, called the <strong>first principal component</strong>, or PC1. Then, at right angles to it, find the direction of greatest remaining spread: PC2. With d columns you get d such axes. You keep the first few, drop the rest, and describe each tumour by its position along the kept axes.</p>
  <p>Think of being allowed to send only one photograph of a cricket bat. You would shoot it from the side where it looks longest, not from the end where it looks like a small rectangle. That best angle shows the most of the object in a single flat picture. PC1 is the "best angle" for a data cloud: one number per row that shows as much of the spread as possible.</p>
  <p>To make this precise we need two ideas. A <strong>direction</strong> is described by a unit vector w = (cos θ, sin θ), an arrow of length 1 pointing at angle θ. A point's <strong>position along</strong> that direction, also called its <strong>projection</strong> or <strong>score</strong>, is the dot product of the point with w. Before projecting we subtract the mean tumour, (15, 18), so that positions are measured from the centre of the cloud (the next section explains why). Tumour A becomes (12 − 15, 17 − 18) = (−3, −1). Along θ = 0°, which is pure radius, w = (1, 0) and A's position is −3 × 1 + (−1) × 0 = −3. Along 45°, w = (0.707, 0.707) and A's position is (−3 − 1) × 0.707 = −2.83. Do this for all five tumours, and measure how spread out the five positions are with their variance (dividing by n − 1 = 4). The code tries several angles:</p>
  <div class="fx" data-lang="py">import numpy as np
from five import P
C = P - P.mean(axis=0)                         # centre: subtract the mean tumour (15, 18)
for deg in (0, 30, 33.7, 45, 90, 123.7):
    t = np.radians(deg)
    w = np.array([np.cos(t), np.sin(t)])       # a direction of length 1
    z = C @ w                                  # each tumour's position along w
    print(f"angle {deg:5.1f}  w=({w[0]:.3f}, {w[1]:.3f})  positions={np.round(z, 2)}  variance={z.var(ddof=1):.3f}")</div>
  <div class="fx" data-lang="text">angle   0.0  w=(1.000, 0.000)  positions=[-3. -1.  0.  1.  3.]  variance=5.000
angle  30.0  w=(0.866, 0.500)  positions=[-3.1  -1.87  0.    1.37  3.6 ]  variance=6.973
angle  33.7  w=(0.832, 0.555)  positions=[-3.05 -1.94  0.    1.39  3.61]  variance=7.000
angle  45.0  w=(0.707, 0.707)  positions=[-2.83 -2.12  0.    1.41  3.54]  variance=6.750
angle  90.0  w=(0.000, 1.000)  positions=[-1. -2.  0.  1.  2.]  variance=2.500
angle 123.7  w=(-0.555, 0.832)  positions=[ 0.83 -1.11  0.    0.28 -0.  ]  variance=0.500</div>
  <p>Along 0° the positions are −3, −1, 0, 1, 3, with variance (9 + 1 + 0 + 1 + 9)/4 = 5.0, which is just radius's own variance. Along 90°, pure texture, the variance is 2.5. As the angle turns, the variance rises to a peak of <strong>7.000 at 33.7°</strong> and then falls; at 123.7°, exactly perpendicular to the peak, it is only <strong>0.500</strong>. So a single number per tumour, its position along 33.7°, carries a spread of 7.0, more than radius alone (5.0) or texture alone (2.5). That direction is PC1 and the perpendicular one is PC2. Notice also that 7.0 + 0.5 = 5.0 + 2.5 = 7.5: turning the axes moves variance between directions but never creates or destroys it.</p>
  <figure class="viz"><svg viewBox="0 0 560 230" width="560">
<line x1="40" y1="200" x2="300" y2="200" stroke="currentColor" opacity=".4"/><line x1="40" y1="200" x2="40" y2="20" stroke="currentColor" opacity=".4"/>
<text x="170" y="222" text-anchor="middle" class="tm" font-size="11">radius 11 → 19</text><text x="30" y="110" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 30 110)">texture 15 → 21</text>
<line x1="56" y1="180" x2="284" y2="40" class="sb" stroke-width="2.5"/><text x="200" y="30" class="tb" font-size="12">PC1 (33.7°): var 7.0</text>
<line x1="134" y1="60" x2="206" y2="160" class="sr" stroke-width="2" stroke-dasharray="5 3"/><text x="212" y="172" class="tr" font-size="12">PC2: var 0.5</text>
<g class="fb sb"><circle cx="72" cy="140" r="5"/><circle cx="137" cy="170" r="5"/><circle cx="170" cy="110" r="5"/><circle cx="202" cy="80" r="5"/><circle cx="267" cy="50" r="5"/></g>
<g font-size="11"><text x="58" y="134">A</text><text x="120" y="182">B</text><text x="178" y="116">C (mean)</text><text x="208" y="78">D</text><text x="274" y="62">E</text></g>
<g font-size="12"><text x="330" y="60">Along radius: var 5.0</text><text x="330" y="82">Along texture: var 2.5</text><text x="330" y="104" class="tb">Along PC1: var 7.0 (93.3%)</text><text x="330" y="126" class="tr">Along PC2: var 0.5 (6.7%)</text><text x="330" y="150" class="tm">total always 7.5</text></g>
</svg><figcaption>The five tumours. PC1 runs along the length of the cloud; PC2 is perpendicular to it and carries little spread.</figcaption></figure>
  <p>In the figure, each tumour's PC1 score is where its dot lands if you drop it straight onto the solid blue line, and its PC2 score is how far it sits off that line. The dots hug the PC1 line closely, which is why almost all of the spread (7.0 out of 7.5, or 93.3%) is along it. One rule matters here: the direction must have length exactly 1. Without it you could "increase the variance" just by making w longer (w = (2, 0) gives four times the variance), so PCA directions are always unit vectors.</p>

  <h2 id="pca-cov"><span class="num">02</span>Centring and the Covariance Matrix</h2>
  <p>Trying angles one by one worked with two columns. With 30 columns there are infinitely many directions to try, so we need a formula that gives the variance along <em>any</em> direction from one compact summary of the data. That summary is the covariance matrix, and building it takes two steps.</p>
  <p>The first step is <strong>centring</strong>: subtract each column's mean. Radius has mean (12 + 14 + 15 + 16 + 18)/5 = 15 and texture (17 + 16 + 18 + 19 + 20)/5 = 18, so the centred rows are A (−3, −1), B (−1, −2), C (0, 0), D (1, 1), E (3, 2). Centring makes "spread" mean spread around the middle of the cloud. Without it, the direction of greatest spread would simply point from the origin towards the cloud, which describes where the data is, not how it varies.</p>
  <p>The second step measures how each column spreads and how pairs of columns move together. The variance of radius is (9 + 1 + 0 + 1 + 9)/4 = 5 and of texture (1 + 4 + 0 + 1 + 4)/4 = 2.5. The <strong>covariance</strong> of radius and texture is the average product of their centred values: ((−3)(−1) + (−1)(−2) + 0 + 1·1 + 3·2)/4 = 12/4 = 3. It is positive because the two tend to be above or below their means together. Putting these numbers in a grid gives the <strong>covariance matrix</strong> S = [[5, 3], [3, 2.5]]: each column's variance on the diagonal, and how each pair moves together off the diagonal. In matrix form, S = CᵀC / (n − 1), where C is the centred data.</p>
  <p>Why is S all we need? For a unit direction w, the positions are z = Cw and their variance is zᵀz/(n − 1) = wᵀ(CᵀC/(n − 1))w = <strong>wᵀSw</strong>. Check it at 45°, w = (0.707, 0.707): wᵀSw = 0.5 × (5 + 2 × 3 + 2.5) = 6.75, exactly the value in the angle table.</p>
  <div class="fx" data-lang="py">import numpy as np
from five import P
C = P - P.mean(axis=0)
S = C.T @ C / (len(P) - 1)                    # covariance matrix by the formula
print("covariance S:\\n", S)
w = np.array([np.cos(np.radians(45)), np.sin(np.radians(45))])
print("variance along 45 degrees = w.T @ S @ w =", round(w @ S @ w, 3))</div>
  <div class="fx" data-lang="text">covariance S:
 [[5.  3. ]
 [3.  2.5]]
variance along 45 degrees = w.T @ S @ w = 6.75</div>
  <p>Think of a tailor who takes your measurements once: chest, waist, shoulders, and how they relate to each other. From that one sheet they can cut cloth for any garment you order. The covariance matrix is the measurement sheet of a data cloud: the spread in any direction you ask about can be read from it with wᵀSw. With 30 columns S is a 30 × 30 grid and the same formula holds, so the whole search for PC1 becomes one clean question: <em>which unit vector w makes wᵀSw as large as possible?</em></p>

  <h2 id="pca-eig"><span class="num">03</span>Eigenvectors and Eigenvalues</h2>
  <p>That question has an exact answer, and it is the reason PCA is always described as "an eigenvector problem". We want to maximise wᵀSw while keeping wᵀw = 1. The standard tool for "maximise something subject to a constraint" is a Lagrange multiplier (see <a class="xref" data-note="m_calculus">Calculus</a>): maximise L = wᵀSw − λ(wᵀw − 1), where λ is an extra unknown. Setting the derivative to zero gives 2Sw − 2λw = 0, which simplifies to</p>
  <p><strong>S w = λ w</strong>.</p>
  <p>A vector w that satisfies this equation is called an <strong>eigenvector</strong> of S, and the number λ is its <strong>eigenvalue</strong>. In words: multiplying an eigenvector by the matrix only stretches it, by the factor λ, and never turns it. Picture a rubber sheet with arrows drawn on it. When you stretch the sheet, most arrows both lengthen and swing round to a new angle. A few special arrows only get longer or shorter without turning; those are the eigenvectors. For a data cloud, those special arrows are its natural axes. And the variance along an eigenvector is wᵀSw = wᵀ(λw) = λ, so every eigenvalue is exactly the variance along its eigenvector, and the direction we want is the eigenvector with the <em>largest</em> eigenvalue. Because S is symmetric, its eigenvectors are automatically perpendicular to each other, which is why the principal components are perpendicular. (Eigenvectors in general are covered in <a class="xref" data-note="m_linalg">Linear Algebra</a>.)</p>
  <p>By hand on S = [[5, 3], [3, 2.5]]. The equation Sw = λw has a non-zero solution only if det(S − λI) = 0, where det is the determinant (for a 2 × 2 matrix [[a, b], [c, d]] it is ad − bc). That gives (5 − λ)(2.5 − λ) − 3 × 3 = 0, which expands to λ² − 7.5λ + 3.5 = 0. The quadratic formula gives λ = (7.5 ± √(56.25 − 14))/2 = (7.5 ± 6.5)/2, so <strong>λ₁ = 7</strong> and <strong>λ₂ = 0.5</strong>: exactly the peak and the minimum we found by trying angles. As a check, the eigenvalues add up to the sum of the diagonal (5 + 2.5 = 7.5, the total variance) and multiply to the determinant (12.5 − 9 = 3.5).</p>
  <p>For the eigenvector of 7, solve (5 − 7)a + 3b = 0, so b = (2/3)a and the direction is (3, 2). Dividing by its length √13 = 3.606 gives <strong>v₁ = (0.832, 0.555)</strong>, which points at atan(2/3) = 33.7°, the angle of the peak. The eigenvector of 0.5 comes out as (2, −3)/√13 = (0.555, −0.832), perpendicular to v₁. NumPy's <code>eigh</code>, the eigen-solver for symmetric matrices, confirms all of this:</p>
  <div class="fx" data-lang="py">import numpy as np
from five import P
S = np.cov(P, rowvar=False)
vals, vecs = np.linalg.eigh(S)                 # eigh: solver for symmetric matrices
order = np.argsort(vals)[::-1]                 # it returns ascending order; put largest first
vals, vecs = vals[order], vecs[:, order]
print("eigenvalues:", vals.round(4))
print("eigenvectors (as columns):\\n", vecs.round(4))
v1 = vecs[:, 0]
print("S @ v1 =", (S @ v1).round(4), "   7 * v1 =", (7 * v1).round(4))</div>
  <div class="fx" data-lang="text">eigenvalues: [7.  0.5]
eigenvectors (as columns):
 [[-0.8321  0.5547]
 [-0.5547 -0.8321]]
S @ v1 = [-5.8244 -3.8829]    7 * v1 = [-5.8244 -3.8829]</div>
  <p>The eigenvalues are 7 and 0.5, and multiplying S by v₁ gives exactly 7 times v₁. But NumPy returned v₁ = (−0.832, −0.555), our vector pointing the opposite way. That is not an error. If Sw = λw then also S(−w) = λ(−w), so an eigenvector's <strong>sign is arbitrary</strong>; only the line it lies on matters. Different libraries, and even different versions of one library, may return opposite signs, and all the scores simply flip. Never draw conclusions from the sign of a component on its own.</p>

  <h2 id="pca-proj"><span class="num">04</span>Scores and Reconstruction</h2>
  <p>We now have the axes. Each tumour's new number, its <strong>score</strong> on PC1, is its centred row dotted with v₁: (3 × Δradius + 2 × Δtexture)/√13. For A, with centred values (−3, −1), that is (−9 − 2)/3.606 = −3.051. For E, (3, 2), it is (9 + 4)/3.606 = 3.606. The five PC1 scores are −3.051, −1.941, 0, 1.387 and 3.606, and their variance is exactly 7 = λ₁. The PC2 scores are much smaller, and their variance is 0.5 = λ₂.</p>
  <p>If we keep only the PC1 score, how close can we get back to the original measurements? <strong>Reconstruction</strong> runs the projection backwards: start at the mean and walk the score's distance along v₁, giving mean + score × v₁. For A: (15, 18) + (−3.051) × (0.832, 0.555) = (12.462, 16.308), against the true (12, 17). The error is exactly the part of A that lies along the dropped PC2 direction. Think of describing every town's location only by "kilometres along the highway". For towns on the highway that is exact; for a town 2 km off it, you lose those 2 km. PCA chooses the highway that passes as close as possible to all the towns.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.decomposition import PCA
from five import P
mean = P.mean(axis=0)
C = P - mean
v1, v2 = np.array([3, 2]) / np.sqrt(13), np.array([2, -3]) / np.sqrt(13)
z1, z2 = C @ v1, C @ v2                                  # scores on PC1 and PC2
print("PC1 scores:", z1.round(3), " variance:", z1.var(ddof=1).round(3))
print("PC2 scores:", z2.round(3), " variance:", z2.var(ddof=1).round(3))
R = mean + np.outer(z1, v1)                              # rebuild using PC1 only
print("tumour A rebuilt from PC1:", R[0].round(3), "(true", P[0], ")")
print("total squared error:", ((P - R) ** 2).sum().round(3))
print("total sum of squares:", (C ** 2).sum(), "= kept", (z1 ** 2).sum().round(3), "+ lost", (z2 ** 2).sum().round(3))

pca = PCA(n_components=1).fit(P)
print("sklearn components_:", pca.components_.round(4), " explained_variance_:", pca.explained_variance_.round(4))
print("sklearn transform:  ", pca.transform(P).ravel().round(3))
print("sklearn inverse_transform matches our rebuild:", np.allclose(pca.inverse_transform(pca.transform(P)), R))</div>
  <div class="fx" data-lang="text">PC1 scores: [-3.051 -1.941  0.     1.387  3.606]  variance: 7.0
PC2 scores: [-0.832  1.109  0.    -0.277  0.   ]  variance: 0.5
tumour A rebuilt from PC1: [12.462 16.308] (true [12. 17.] )
total squared error: 2.0
total sum of squares: 30.0 = kept 28.0 + lost 2.0
sklearn components_: [[0.8321 0.5547]]  explained_variance_: [7.]
sklearn transform:   [-3.051 -1.941  0.     1.387  3.606]
sklearn inverse_transform matches our rebuild: True</div>
  <p>The output contains every hand number: scores −3.051 to 3.606 with variance 7, rebuilt A = (12.462, 16.308), and a total squared error of 2.0. The line "30 = 28 + 2" is worth understanding. Each centred row splits into a piece along PC1 and a piece along PC2, at right angles, so by Pythagoras its squared length equals (PC1 score)² + (PC2 score)². Summed over the five tumours, the total sum of squares 30 equals the part kept by PC1, 28, plus the part lost, 2. Because the total is fixed, <strong>maximising the variance kept and minimising the reconstruction error are the same problem</strong>. PCA therefore gives the best possible flat k-dimensional approximation of the data in squared error, a result known as the Eckart–Young theorem.</p>
  <p>The last three lines show that scikit-learn's <code>PCA</code> agrees: <code>components_</code> holds the directions as rows, (0.8321, 0.5547); <code>explained_variance_</code> holds the eigenvalues; <code>transform</code> returns the scores; and <code>inverse_transform</code> returns the same reconstruction. A common confusion is to think the PC1 line is the regression line of texture on radius. It is not. Regression minimises <em>vertical</em> errors in one chosen target column; PCA minimises <em>perpendicular</em> distances to the line and treats all columns alike, with no target at all.</p>

  <h2 id="pca-scale"><span class="num">05</span>Standardise First</h2>
  <p>Now we move to the real data, and there is a trap waiting. PCA hunts for the direction of largest variance, but variance depends on units. Our toy columns, radius and texture, happened to be on similar scales. The 30 real measurements are not: some are areas in square pixels running into the thousands, others are tiny ratios. Watch what PCA does with the raw numbers:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
data = load_breast_cancer()
X, names = data.data, data.feature_names
sd = X.std(axis=0)
print("largest std: ", [f"{names[i]} {sd[i]:.1f}" for i in np.argsort(sd)[::-1][:2]])
print("smallest std:", [f"{names[i]} {sd[i]:.4f}" for i in np.argsort(sd)[:2]])
raw = PCA().fit(X)
print("RAW    share of variance, PC1-3:", raw.explained_variance_ratio_[:3].round(3),
      " PC1's biggest weight:", names[np.argmax(abs(raw.components_[0]))])
scaled = PCA().fit(StandardScaler().fit_transform(X))
print("SCALED share of variance, PC1-3:", scaled.explained_variance_ratio_[:3].round(3))</div>
  <div class="fx" data-lang="text">largest std:  ['worst area 568.9', 'mean area 351.6']
smallest std: ['fractal dimension error 0.0026', 'smoothness error 0.0030']
RAW    share of variance, PC1-3: [0.982 0.016 0.002]  PC1's biggest weight: worst area
SCALED share of variance, PC1-3: [0.443 0.19  0.094]</div>
  <p>"Worst area" has a standard deviation of 568.9 while "fractal dimension error" has 0.0026, so its variance is tens of billions of times larger. Raw PCA reports that PC1 alone explains 98.2% of the variance and that PC1 is basically "worst area". It has not discovered an important pattern; it has discovered the column with the biggest numbers. After <code>StandardScaler</code>, which subtracts each column's mean and divides by its standard deviation so that every column has variance 1, the variance is shared out much more honestly: 44.3%, 19.0%, 9.4%. Think of a report card where Maths is marked out of 1,000 and every other subject out of 10: "who is best overall" just becomes "who is best at Maths". Converting every subject to a percentage first is standardising.</p>
  <p>PCA on standardised data is the same as an eigen-decomposition of the <strong>correlation matrix</strong> instead of the covariance matrix, because correlations are covariances of standardised columns. The rule is to standardise whenever columns are measured in different units. The exception is when all columns share one meaningful unit and their size differences are real information, such as pixel intensities of an image or a spectrum of readings; there, standardising would blow up noisy, nearly constant columns to the same importance as the informative ones. Every full-size example from here on uses standardised tumours.</p>

  <h2 id="pca-evr"><span class="num">06</span>Explained Variance and Choosing k</h2>
  <p>Each component carries a variance λ, and the total variance is the sum of all the λ's. The <strong>explained variance ratio</strong> (EVR) of a component is its share of the total, λᵢ / Σλ. For the five tumours PC1 explains 7/7.5 = <strong>93.3%</strong> and PC2 the remaining 6.7%, which is exactly the 2 out of 30 lost in the reconstruction. EVR is how we turn "how many components should I keep?" into a number. On the 569 standardised tumours:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
X, y = load_breast_cancer(return_X_y=True)
Xs = StandardScaler().fit_transform(X)
pca = PCA().fit(Xs)
evr, lam = pca.explained_variance_ratio_, pca.explained_variance_
cum = np.cumsum(evr)
print("EVR        PC1-7:", evr[:7].round(3))
print("cumulative PC1-7:", cum[:7].round(3))
for t in (0.8, 0.9, 0.95):
    print(f"{t:.0%} of variance -&gt; k = {np.argmax(cum &gt;= t) + 1}")
print("Kaiser rule (eigenvalue &gt; 1) -&gt; k =", int((lam &gt; 1).sum()))
print("PCA(n_components=0.95) chose k =", PCA(n_components=0.95).fit(Xs).n_components_)</div>
  <div class="fx" data-lang="text">EVR        PC1-7: [0.443 0.19  0.094 0.066 0.055 0.04  0.023]
cumulative PC1-7: [0.443 0.632 0.726 0.792 0.847 0.888 0.91 ]
80% of variance -&gt; k = 5
90% of variance -&gt; k = 7
95% of variance -&gt; k = 10
Kaiser rule (eigenvalue &gt; 1) -&gt; k = 6
PCA(n_components=0.95) chose k = 10</div>
  <p>PC1 alone carries 44.3% of the variance of 30 columns, PC2 another 19.0% and PC3 9.4%, so three new columns hold 72.6% of the information in thirty. The cumulative line keeps climbing more and more slowly. There are four common ways to choose how many components, k, to keep. The quickest is a <strong>cumulative threshold</strong>: the smallest k whose cumulative EVR reaches 90% or 95% (here 7 or 10). scikit-learn does this for you if you pass a fraction, <code>PCA(n_components=0.95)</code>, which chose 10. The <strong>scree plot</strong> draws EVR for each component, like the side of a hill with loose stones ("scree") at the bottom, and you cut where the steep part turns into the flat tail; here the drop flattens after about three components (0.443, 0.190, 0.094, then 0.066 and below). The <strong>Kaiser rule</strong>, used on standardised data, keeps components with eigenvalue greater than 1, meaning "worth more than one original column"; here that gives 6. It is a rough guide that tends to keep too many when there are many columns.</p>
  <p>The fourth way is the best whenever PCA feeds a model: treat k as a hyperparameter and pick it by the model's cross-validated score, which section 09 does. The reason is a warning worth remembering: "95% of the variance" is not "95% of the predictive information". Variance is about rebuilding the inputs, not about predicting the label, and section 10 shows a case where the dropped 5% contains all the signal.</p>

  <h2 id="pca-svd"><span class="num">07</span>How PCA Is Computed: SVD</h2>
  <p>So far we computed PCA through the covariance matrix. scikit-learn does not actually build that matrix. For data with 100,000 columns it would be a 100,000 × 100,000 grid, and forming CᵀC squares every number, which loses precision for very large or very small values. Instead it uses the <strong>singular value decomposition</strong> (SVD), which splits any matrix into three simpler pieces: C = U Σ Vᵀ. U and V have perpendicular unit-length columns, and Σ is a diagonal matrix of non-negative numbers s₁ ≥ s₂ ≥ … called the <strong>singular values</strong>. Think of any linear transformation as "rotate, then stretch along the axes, then rotate again"; SVD finds those rotations and stretches.</p>
  <p>Substitute the SVD into the covariance: CᵀC = VΣUᵀUΣVᵀ = VΣ²Vᵀ, because UᵀU is the identity. So S = V (Σ²/(n − 1)) Vᵀ, which is exactly an eigen-decomposition of S. That tells us three things at once: the columns of V (rows of Vᵀ) are the principal components, the eigenvalues are <strong>λᵢ = sᵢ²/(n − 1)</strong>, and the scores are CV = UΣ. By hand: λ = 7 and 0.5 with n − 1 = 4 means s² = 28 and 2, so s = 5.292 and 1.414. And s₁² = 28 is the "kept" sum of squares from section 04.</p>
  <div class="fx" data-lang="py">import numpy as np
from five import P
C = P - P.mean(axis=0)
U, s, Vt = np.linalg.svd(C, full_matrices=False)       # C = U @ diag(s) @ Vt
print("singular values s:", s.round(4), "  s^2/(n-1):", (s ** 2 / 4).round(4))
print("rows of Vt (the PCs):\\n", Vt.round(4))
print("U*s (the scores), first column:", (U * s)[:, 0].round(3))</div>
  <div class="fx" data-lang="text">singular values s: [5.2915 1.4142]   s^2/(n-1): [7.  0.5]
rows of Vt (the PCs):
 [[ 0.8321  0.5547]
 [-0.5547  0.8321]]
U*s (the scores), first column: [-3.051 -1.941  0.     1.387  3.606]</div>
  <p>The singular values are 5.2915 and 1.4142; squared and divided by 4 they give 7 and 0.5. The rows of Vᵀ are the two PCs, and U times s gives the same PC1 scores as the hand table. scikit-learn's <code>PCA</code> centres the data and runs an SVD, choosing a method with <code>svd_solver</code>: <code>"full"</code> for an exact answer, <code>"randomized"</code> for a fast approximation of the top few components of a big matrix, <code>"arpack"</code> for a few components of a sparse-ish problem, <code>"covariance_eigh"</code> when there are far more rows than columns, and <code>"auto"</code> to let it decide. It then flips signs by a fixed rule, so results are repeatable.</p>
  <p>To make sure every step is understood, here is the whole of PCA written from scratch in six numbered steps, checked against scikit-learn on the standardised tumours:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

class MyPCA:
    def __init__(self, k):
        self.k = k
    def fit(self, X):
        self.mean_ = X.mean(axis=0)
        C = X - self.mean_                                   # 1. centre
        U, s, Vt = np.linalg.svd(C, full_matrices=False)     # 2. SVD (no covariance matrix needed)
        self.components_ = Vt[:self.k]                       # 3. top-k directions
        lam = s ** 2 / (len(X) - 1)                          # 4. eigenvalues = variances
        self.explained_variance_ratio_ = lam[:self.k] / lam.sum()
        return self
    def transform(self, X):
        return (X - self.mean_) @ self.components_.T         # 5. project
    def inverse_transform(self, Z):
        return Z @ self.components_ + self.mean_             # 6. rebuild

Xs = StandardScaler().fit_transform(load_breast_cancer().data)
mine, sk = MyPCA(5).fit(Xs), PCA(5).fit(Xs)
print("EVR mine   :", mine.explained_variance_ratio_.round(4))
print("EVR sklearn:", sk.explained_variance_ratio_.round(4))
signs = np.sign((mine.components_ * sk.components_).sum(axis=1))   # signs are arbitrary: align them
print("same scores (up to sign):", np.allclose(mine.transform(Xs) * signs, sk.transform(Xs)))
lost = ((Xs - mine.inverse_transform(mine.transform(Xs))) ** 2).sum() / (Xs ** 2).sum()
print(f"variance lost with 5 components: {lost:.4f} = 1 - sum(EVR) = {1 - sk.explained_variance_ratio_.sum():.4f}")</div>
  <div class="fx" data-lang="text">EVR mine   : [0.4427 0.1897 0.0939 0.066  0.055 ]
EVR sklearn: [0.4427 0.1897 0.0939 0.066  0.055 ]
same scores (up to sign): True
variance lost with 5 components: 0.1527 = 1 - sum(EVR) = 0.1527</div>
  <p>Our class matches scikit-learn's explained variance ratios to four decimals, and the scores agree once the arbitrary signs are aligned. The last line checks the reconstruction identity on real data: keeping 5 components and rebuilding loses 15.27% of the total squared size of the data, exactly 1 minus the sum of the five EVRs. One small trap is the n versus n − 1: <code>explained_variance_</code> divides by n − 1 (the sample variance), while NumPy's <code>.var()</code> divides by n unless told otherwise. The ratios are unaffected.</p>

  <h2 id="pca-read"><span class="num">08</span>Reading the Components</h2>
  <p>A principal component is a list of 30 weights, one per original measurement. Can we give it a meaning that a doctor would understand? Sometimes, for the first one or two. The code prints the largest weights of PC1 and PC2 on the standardised tumours, and checks how the two classes score on PC1:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
data = load_breast_cancer()
Xs = StandardScaler().fit_transform(data.data)
pca = PCA(2).fit(Xs)
W = pd.DataFrame(pca.components_.T, index=data.feature_names, columns=["PC1", "PC2"])
for pc in ["PC1", "PC2"]:
    top = W[pc].abs().sort_values(ascending=False).index[:4]
    print(pc, "largest weights:", ", ".join(f"{n} {W.loc[n, pc]:+.2f}" for n in top))
print("PC1: weights &gt; 0:", int((W.PC1 &gt; 0).sum()), "of 30")
Z = pca.transform(Xs)
print("mean PC1 score  malignant:", Z[data.target == 0, 0].mean().round(2),
      " benign:", Z[data.target == 1, 0].mean().round(2))
loading = pca.components_[0, 0] * np.sqrt(pca.explained_variance_[0])
print("loading of 'mean radius' on PC1:", loading.round(3),
      " corr(mean radius, PC1 score):", np.corrcoef(Xs[:, 0], Z[:, 0])[0, 1].round(3))</div>
  <div class="fx" data-lang="text">PC1 largest weights: mean concave points +0.26, mean concavity +0.26, worst concave points +0.25, mean compactness +0.24
PC2 largest weights: mean fractal dimension +0.37, fractal dimension error +0.28, worst fractal dimension +0.28, mean radius -0.23
PC1: weights &gt; 0: 30 of 30
mean PC1 score  malignant: 3.71  benign: -2.21
loading of 'mean radius' on PC1: 0.798  corr(mean radius, PC1 score): 0.798</div>
  <p>All 30 weights of PC1 are positive, and the biggest belong to concave points, concavity, compactness and perimeter. So PC1 is an "overall size and irregularity" score: a tumour that is large and jagged on every measurement scores high. Malignant tumours average <strong>+3.71</strong> on it and benign ones <strong>−2.21</strong>, so this single new column already separates the classes well. PC2 contrasts the fractal-dimension measurements (positive weights) with radius (negative weight): roughly "a complicated outline for its size". Components after the first two or three are usually much harder to name, and their meaning can change when the data changes.</p>
  <p>Two words are often mixed up. The <strong>weights</strong>, stored in <code>components_</code>, are the unit-length eigenvector entries used to compute a score. Multiplying a weight by √λ gives a <strong>loading</strong>, and on standardised data a loading equals the correlation between that original column and the component's score. Mean radius has a loading of 0.798 on PC1, and its correlation with the PC1 scores is exactly 0.798. A <strong>biplot</strong> draws the scores as dots and the loadings as arrows on the same PC1–PC2 axes, so you can see which original measurements point towards which group of tumours. Even so, telling a stakeholder "PC3 matters" means little. If people need named drivers, use feature selection, or explain the model in terms of the original columns.</p>

  <h2 id="pca-pipe"><span class="num">09</span>PCA in a Pipeline</h2>
  <p>PCA learns things from data: the mean of each column and the component directions. That means it can leak. If you fit PCA on all 569 tumours and then cross-validate a classifier on the scores, the test folds have helped choose the axes. The fix is the same as for feature selection: put <code>StandardScaler → PCA → model</code> inside one <code>Pipeline</code>, so each fold fits the scaler and PCA on its training rows only (see <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). Then the number of components is just another hyperparameter, named <code>pca__n_components</code> (step name, two underscores, parameter name), which <code>GridSearchCV</code> can tune together with the model's own settings:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_score
X, y = load_breast_cancer(return_X_y=True)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
pipe = Pipeline([("scale", StandardScaler()), ("pca", PCA()), ("clf", LogisticRegression(max_iter=5000))])
for k in (1, 2, 5, 10, 30):
    pipe.set_params(pca__n_components=k)
    print(f"k={k:2d}: cv acc {cross_val_score(pipe, X, y, cv=cv).mean():.3f}")
grid = GridSearchCV(pipe, {"pca__n_components": [2, 5, 7, 10, 15], "clf__C": [0.1, 1, 10]}, cv=cv).fit(X, y)
print("GridSearchCV best:", grid.best_params_, "cv acc", round(grid.best_score_, 3))</div>
  <div class="fx" data-lang="text">k= 1: cv acc 0.912
k= 2: cv acc 0.958
k= 5: cv acc 0.974
k=10: cv acc 0.981
k=30: cv acc 0.979
GridSearchCV best: {'clf__C': 1, 'pca__n_components': 10} cv acc 0.981</div>
  <p>One component, the "size and irregularity" score, already gives 0.912 accuracy; two give 0.958; ten give <strong>0.981</strong>, slightly better than all 30 columns (0.979). Dropping the 20 weakest directions removes mostly noise and collinearity, which acts like mild regularisation. <code>GridSearchCV</code>, searching k and the regularisation strength C together, picks k = 10 and C = 1. In the previous note, the best five selected columns scored 0.968, while five PCA components score 0.974: merging beats choosing when information is spread across many columns.</p>
  <p>The same machinery has several other uses. For <strong>compression</strong>, store 10 scores instead of 30 numbers and rebuild an approximation with <code>inverse_transform</code> when needed. For <strong>denoising</strong>, rebuild from the top components only: random noise is spread over all directions while signal concentrates in the first few, so the rebuild drops much of the noise (a classic trick on images). For <strong>decorrelation</strong>, use the scores directly, since PC scores are uncorrelated with each other; <code>whiten=True</code> also rescales each to variance 1. And before t-SNE, UMAP or clustering, reducing to about 50 components removes noise directions and speeds up neighbour search. One kind of model rarely benefits: trees and boosting split on one column at a time, and rotated axes destroy the "one meaningful column" structure they exploit. PCA helps most for linear models, kNN, SVMs and neural networks fed with many correlated columns.</p>

  <h2 id="pca-limits"><span class="num">10</span>Where PCA Fails</h2>
  <p>PCA rests on three assumptions it never states: that high variance means important, that the structure is flat (linear), and that every row is trustworthy. Each can fail. The first is the most surprising. Imagine two tumour subtypes that differ by a small, consistent shift in one measurement, while another measurement varies hugely between patients for reasons unrelated to the subtype. PCA never looks at the label, so it keeps the big, useless direction. The code builds exactly that situation, then also tries two concentric rings, which no straight line can separate:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import make_circles
from sklearn.decomposition import PCA, KernelPCA
from sklearn.linear_model import LogisticRegression
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.model_selection import cross_val_score
rng = np.random.default_rng(0)

# 1) the class lives in the LOW-variance direction
y = np.repeat([0, 1], 100)
big = rng.normal(0, 10, 200)                                  # huge spread, unrelated to the class
small = rng.normal(0, 0.5, 200) + np.where(y == 1, 1.5, -1.5)  # small spread, carries the class
X = np.c_[big, small]
print("variances of the two columns:", X.var(axis=0).round(1))
for name, Z in [("PCA, 1 component", PCA(1).fit_transform(X)),
                ("LDA, 1 component", LinearDiscriminantAnalysis(n_components=1).fit_transform(X, y))]:
    print(f"{name}: acc = {cross_val_score(LogisticRegression(), Z, y, cv=5).mean():.3f}")

# 2) two rings: no straight line separates them
Xc, yc = make_circles(400, factor=0.3, noise=0.05, random_state=0)
for name, Z in [("rings, PCA", PCA(1).fit_transform(Xc)),
                ("rings, KernelPCA rbf", KernelPCA(1, kernel="rbf", gamma=2).fit_transform(Xc))]:
    print(f"{name}: acc = {cross_val_score(LogisticRegression(), Z, yc, cv=5).mean():.3f}")</div>
  <div class="fx" data-lang="text">variances of the two columns: [92.4  2.6]
PCA, 1 component: acc = 0.470
LDA, 1 component: acc = 0.995
rings, PCA: acc = 0.450
rings, KernelPCA rbf: acc = 1.000</div>
  <p>The useless column has variance 92.4 and the useful one 2.6, so PCA's single component is the useless direction and a classifier on it scores <strong>0.470</strong>, a coin flip. <strong>Linear Discriminant Analysis</strong> (LDA) is a supervised cousin of PCA: instead of maximising total variance, it uses the labels to find the direction that maximises the spread <em>between</em> class means relative to the spread <em>within</em> classes, the same idea as the ANOVA F-test of the previous note. It keeps the right direction and scores <strong>0.995</strong>. LDA can produce at most (number of classes − 1) components and needs labels, so it is a tool for separating known classes rather than general compression.</p>
  <p>The rings show the second failure: an inner ring of one class and an outer ring of the other. Any straight-line projection mixes them, and PCA scores <strong>0.450</strong>. Kernel PCA, explained in the next section, scores 1.000. The third failure is outliers. Variance is built from squared distances, so a single extreme row can drag the axes towards itself. Add one tumour with a mistyped texture of 40 to our five:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.decomposition import PCA
from five import P
print("PC1 of the five tumours:  ", PCA(1).fit(P).components_.round(3))
Q = np.vstack([P, [[15, 40]]])                 # add one tumour with a mistyped texture
print("PC1 with one bad row added:", PCA(1).fit(Q).components_.round(3))</div>
  <div class="fx" data-lang="text">PC1 of the five tumours:   [[0.832 0.555]]
PC1 with one bad row added: [[0.03 1.  ]]</div>
  <p>PC1 swings from (0.832, 0.555) to (0.03, 1.00): it now just points at the bad row. Clean obvious errors first, or use robust scaling or a robust PCA variant. All three failures lead to the same practical warning. If the classes overlap in a PCA scatter plot, do not conclude that they cannot be separated; the separating direction may simply have low variance, or be curved.</p>

  <h2 id="pca-variants"><span class="num">11</span>Kernel PCA and Incremental PCA</h2>
  <p>Two variants fix two practical limits. <strong>Kernel PCA</strong> handles curved structure. The idea is to first map each point into a richer space where the structure becomes flat, then do ordinary PCA there. For the rings, adding the single extra feature r² = x² + y² would be enough: the inner ring has small r², the outer ring large, and a straight line separates them. The <strong>kernel trick</strong>, the same one used by <a class="xref" data-note="ml_svm">Support Vector Machines</a>, does this without ever building the new features. It only needs a similarity k(xᵢ, xⱼ) between every pair of points, for example the RBF kernel exp(−γ‖xᵢ − xⱼ‖²), which is close to 1 for nearby points and close to 0 for distant ones. Kernel PCA centres this n × n similarity matrix and takes its top eigenvectors. That is how one kernel component separated the rings perfectly above. The costs are real: an n × n matrix (a million rows means 10¹² entries), a γ to tune (a poor γ can bury the useful pattern in a later component), no explicit weights to interpret, and an <code>inverse_transform</code> that is only approximate. For large non-linear data <a class="xref" data-note="ml_umap">UMAP</a> is usually the practical choice.</p>
  <p><strong>Incremental PCA</strong> handles data too large for memory. <code>IncrementalPCA</code> updates the components chunk by chunk with <code>partial_fit</code>, so memory depends on the batch size rather than the number of rows. Here it is fed 100 tumours at a time:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA, IncrementalPCA
from sklearn.preprocessing import StandardScaler
Xs = StandardScaler().fit_transform(load_breast_cancer().data)
print("full PCA, EVR 1-5:          ", PCA(5).fit(Xs).explained_variance_ratio_.round(4))
for k in (5, 10):
    inc = IncrementalPCA(k, batch_size=100)
    for start in range(0, len(Xs), 100):             # feed 100 rows at a time
        inc.partial_fit(Xs[start:start + 100])       # (in real use: read each chunk from disk)
    print(f"incremental, k={k:2d}, EVR 1-5:", inc.explained_variance_ratio_[:5].round(4))</div>
  <div class="fx" data-lang="text">full PCA, EVR 1-5:           [0.4427 0.1897 0.0939 0.066  0.055 ]
incremental, k= 5, EVR 1-5: [0.4427 0.1896 0.093  0.0637 0.0432]
incremental, k=10, EVR 1-5: [0.4427 0.1897 0.0939 0.066  0.0549]</div>
  <p>Asking for exactly 5 components, the incremental version gets the first three right but drifts on the 4th and 5th (0.0637 and 0.0432 instead of 0.066 and 0.055), because each update can only keep k directions and loses a little information about the weaker ones. Asking for 10 and using the first 5 reproduces the full PCA almost exactly. The lesson: with incremental PCA, request a few more components than you need. Related tools include randomized PCA (<code>svd_solver="randomized"</code>, fast for the top components of a big matrix), <code>TruncatedSVD</code> (skips centring, so it works on sparse text matrices; on word counts this is called latent semantic analysis) and <code>SparsePCA</code> (components with many zero weights, which are easier to name).</p>

  <h2 id="pca-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common mistake is running PCA on columns with different units. On the raw tumours PC1 "explained" 98.2% of the variance and was just "worst area"; after standardising, PC1 explained 44.3% and described real structure. The damage shows up downstream too. Here two PCA components feed a 5-nearest-neighbour classifier, with and without a scaler in front:</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score
X, y = load_breast_cancer(return_X_y=True)
wrong = make_pipeline(PCA(2), KNeighborsClassifier(5))                   # biggest-unit column wins
right = make_pipeline(StandardScaler(), PCA(2), KNeighborsClassifier(5)) # every column on one scale
print("PCA(2) on raw columns:    ", round(cross_val_score(wrong, X, y, cv=5).mean(), 3))
print("PCA(2) after standardising:", round(cross_val_score(right, X, y, cv=5).mean(), 3))</div>
  <div class="fx" data-lang="text">PCA(2) on raw columns:     0.923
PCA(2) after standardising: 0.937</div>
  <p>Without scaling, the two components are essentially "worst area" and "mean area", so the classifier sees only size and scores 0.923; with scaling, the components summarise all 30 measurements and it scores 0.937. The fix is a single <code>StandardScaler()</code> step, and it belongs inside the pipeline.</p>
  <p>The second is fitting PCA on all the data before cross-validation, so the components have seen the test folds. Put the scaler and PCA inside the same <code>Pipeline</code> as the model, as in section 09. The third is choosing k only by "95% of the variance" when the goal is prediction: variance kept is not accuracy kept, and the low-variance example lost everything with one component. Tune k by cross-validation.</p>
  <p>Three more are about interpretation. Treating the sign of a component as meaningful is a mistake, because eigenvectors can be flipped freely; compare components up to sign. Naming late components ("PC7 is the risk factor") is rarely stable. And expecting PCA to unfold curved structure fails, as the rings showed (0.450); use Kernel PCA, <a class="xref" data-note="ml_tsne">t-SNE</a> or <a class="xref" data-note="ml_umap">UMAP</a>. Finally, a single bad row can rotate the axes (PC1 went from (0.832, 0.555) to (0.03, 1.00)), so look for outliers before trusting a PCA.</p>

  <h2 id="pca-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Principal component</b>: a unit direction of greatest remaining variance, perpendicular to earlier ones; an eigenvector of the covariance matrix (<code>components_</code>).</li>
    <li><b>Eigenvalue λ</b>: the variance of the data along its component (<code>explained_variance_</code>); Σλ = total variance.</li>
    <li><b>Score</b>: a row's coordinate on a component = centred row · component (<code>transform</code>).</li>
    <li><b>Explained variance ratio</b>: λᵢ/Σλ (<code>explained_variance_ratio_</code>).</li>
    <li><b>Reconstruction</b>: mean + scores · components (<code>inverse_transform</code>); error = variance of dropped components.</li>
    <li><b>Loading</b>: weight × √λ; on standardised data, the correlation of a column with the component.</li>
    <li><b>LDA</b>: supervised; maximises between-class over within-class variance; at most classes − 1 components.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Meaning</th><th>Five tumours</th></tr>
    <tr><td>C = X − μ; S = CᵀC/(n − 1)</td><td>centre, covariance</td><td>μ = (15, 18); S = [[5, 3], [3, 2.5]]</td></tr>
    <tr><td>variance along unit w = wᵀSw</td><td>spread in any direction</td><td>45°: 6.75</td></tr>
    <tr><td>Sv = λv; det(S − λI) = 0</td><td>components and their variances</td><td>λ = 7, 0.5; v₁ = (0.832, 0.555)</td></tr>
    <tr><td>Z = C·V; X̂ = Z·Vᵀ + μ</td><td>scores, reconstruction</td><td>A → (12.462, 16.308)</td></tr>
    <tr><td>total SS = kept + lost</td><td>max variance = min error</td><td>30 = 28 + 2</td></tr>
    <tr><td>EVRᵢ = λᵢ/Σλ</td><td>share of variance</td><td>93.3%, 6.7%</td></tr>
    <tr><td>C = UΣVᵀ; λ = s²/(n − 1); Z = UΣ</td><td>PCA via SVD</td><td>s = 5.292, 1.414</td></tr>
  </table>
  <h3>Numbers from the 569 tumours</h3>
  <ul>
    <li>Raw PC1: 98.2% ("worst area"); standardised: 44.3%, 19.0%, 9.4%.</li>
    <li>k for 80% / 90% / 95%: 5 / 7 / 10; Kaiser rule: 6.</li>
    <li>Logistic regression CV: k = 1: 0.912, 2: 0.958, 5: 0.974, 10: 0.981, all 30: 0.979.</li>
    <li>PC1 scores: malignant +3.71, benign −2.21; loading of mean radius 0.798.</li>
    <li>Limits: PCA 0.470 vs LDA 0.995; rings PCA 0.450 vs Kernel PCA 1.000.</li>
  </ul>
  <h3>PCA and its neighbours</h3>
  <table class="tbl">
    <tr><th></th><th>Feature selection</th><th>PCA</th><th>LDA</th><th>Kernel PCA</th><th>t-SNE / UMAP</th></tr>
    <tr><td>Uses labels</td><td>usually</td><td>no</td><td>yes</td><td>no</td><td>no (UMAP optional)</td></tr>
    <tr><td>Linear</td><td>keeps columns</td><td>yes</td><td>yes</td><td>no</td><td>no</td></tr>
    <tr><td>Keeps names</td><td>yes</td><td>no</td><td>no</td><td>no</td><td>no</td></tr>
    <tr><td>New rows</td><td>trivial</td><td>transform</td><td>transform</td><td>transform</td><td>t-SNE no, UMAP yes</td></tr>
    <tr><td>Main use</td><td>explain, cheaper inputs</td><td>compression, model input</td><td>separate classes</td><td>curves, small n</td><td>pictures</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.decomposition import PCA, KernelPCA, IncrementalPCA, TruncatedSVD

pipe = make_pipeline(StandardScaler(), PCA(n_components=10), LogisticRegression())
PCA(n_components=0.95)                     # smallest k reaching 95% of the variance
pca.components_, pca.explained_variance_, pca.explained_variance_ratio_
Z = pca.transform(X); X_back = pca.inverse_transform(Z)
GridSearchCV(pipe, {"pca__n_components": [2, 5, 10, 20]}, cv=5)
KernelPCA(n_components=2, kernel="rbf", gamma=2)
IncrementalPCA(n_components=10, batch_size=1000).partial_fit(chunk)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Standardise when units differ; not when one shared unit is meaningful.</li>
    <li>Fit scaler and PCA inside the Pipeline.</li>
    <li>Variance kept ≠ predictive information kept; tune k by CV.</li>
    <li>Component signs are arbitrary.</li>
    <li>PCA is not a regression line; it minimises perpendicular distances.</li>
    <li>Outliers and curved structure break it.</li>
  </ul>

  <h2 id="pca-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain PCA in plain words.</summary><div class="qa-body">PCA finds the direction in which the data is most spread out, then the most spread-out direction perpendicular to it, and so on. It describes each row by its positions along the first few of these directions and drops the rest. It is a rotation of the axes followed by throwing away the axes with little variance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are the principal components eigenvectors of the covariance matrix?</summary><div class="qa-body">The variance of the data projected onto a unit vector w is wᵀSw. Maximising it subject to wᵀw = 1 with a Lagrange multiplier gives Sw = λw, so the optimum is an eigenvector, and the variance achieved is λ. The largest eigenvalue gives PC1; the next eigenvectors give the later components, which are perpendicular because S is symmetric.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Do PCA by hand on the covariance matrix [[5, 3], [3, 2.5]].</summary><div class="qa-body">Solve det(S − λI) = λ² − 7.5λ + 3.5 = 0, giving λ = 7 and 0.5. For λ = 7, −2a + 3b = 0, so the direction is (3, 2)/√13 = (0.832, 0.555). The second component is (2, −3)/√13. PC1 explains 7/7.5 = 93.3% of the variance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must data be centred before PCA?</summary><div class="qa-body">PCA measures spread around the mean. Without centring, the first direction found mostly points from the origin to the cloud's centre, describing where the data sits rather than how it varies. sklearn's PCA centres automatically; a hand-written SVD does not, and TruncatedSVD deliberately skips centring for sparse data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why standardise before PCA, and when should you not?</summary><div class="qa-body">PCA maximises variance, and variance depends on units, so the column with the biggest numbers dominates (raw tumour PCA: 98.2% for "worst area"). Standardise when columns have different units; PCA then works on the correlation matrix. Do not when all columns share one unit and their spread is meaningful, such as image pixels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is maximising variance the same as minimising reconstruction error?</summary><div class="qa-body">Each centred row splits into a part inside the kept subspace and a perpendicular remainder, so by Pythagoras the total sum of squares equals kept plus lost (30 = 28 + 2 for the five tumours). The total is fixed, so keeping as much as possible means losing as little as possible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the explained variance ratio, and how do you choose the number of components?</summary><div class="qa-body">EVR is each component's eigenvalue divided by the sum of all eigenvalues: its share of the total variance. Choose k by a cumulative threshold (90–95%), the elbow of the scree plot, the Kaiser rule (eigenvalue above 1 on standardised data), or, best when PCA feeds a model, by cross-validating the whole pipeline over k.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is PCA related to SVD?</summary><div class="qa-body">For centred data C = UΣVᵀ, so CᵀC = VΣ²Vᵀ. The columns of V are the principal components, the eigenvalues are sᵢ²/(n − 1), and the scores are UΣ. Libraries use SVD because it avoids forming CᵀC, is numerically more stable and has fast randomized versions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between weights and loadings?</summary><div class="qa-body">Weights are the unit-length entries of the eigenvector used to compute a score. Loadings are weights multiplied by √λ; on standardised data a loading equals the correlation between an original column and the component score, which makes loadings easier to interpret.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can two libraries return principal components with opposite signs?</summary><div class="qa-body">If w is an eigenvector then so is −w, with the same eigenvalue. The solver may return either, so the component line is the same but the scores flip sign. sklearn applies a fixed sign rule for repeatability; never interpret a sign on its own.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does PCA always improve a model?</summary><div class="qa-body">No. It can throw away low-variance directions that carry the signal (PCA 0.470 versus LDA 0.995 in the demo), it hides feature names, and tree models rarely benefit. It helps linear models, kNN and SVMs on many correlated columns and can regularise slightly (tumours: 0.981 with 10 components versus 0.979 with all 30).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>PCA versus LDA?</summary><div class="qa-body">PCA is unsupervised and finds directions of maximum total variance. LDA is supervised and finds directions that maximise between-class variance relative to within-class variance, giving at most (classes − 1) components. Use LDA when the goal is separating known classes; use PCA for general compression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do outliers affect PCA?</summary><div class="qa-body">Variance is built from squared distances, so one extreme row can pull a component towards itself; one mistyped texture value moved PC1 from (0.832, 0.555) to (0.03, 1.00). Remove or fix outliers, use robust scaling, or use a robust PCA variant.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between PCA and linear regression?</summary><div class="qa-body">Regression predicts one chosen target column and minimises vertical errors in that column. PCA has no target; it treats all columns alike and minimises perpendicular distances from the points to the fitted line or plane. Their lines through the same data are generally different.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use Kernel PCA or Incremental PCA?</summary><div class="qa-body">Kernel PCA when the structure is curved and n is modest, since it needs an n × n kernel matrix and a tuned kernel width (rings: 0.450 with PCA, 1.000 with an RBF kernel). Incremental PCA when the data does not fit in memory: it updates the components chunk by chunk with partial_fit, and should be asked for a few more components than you need.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you use PCA without data leakage?</summary><div class="qa-body">Make the scaler and PCA steps of a Pipeline together with the model, so that cross-validation fits them on each training fold only and applies them with transform to the held-out fold. Tune pca__n_components inside GridSearchCV in the same way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is PCA often run before t-SNE, UMAP or clustering?</summary><div class="qa-body">Those methods depend on nearest neighbours, which are noisy and slow to compute in high dimensions. Reducing to about 50 components keeps most of the structure, removes noise directions and speeds up neighbour search. sklearn's t-SNE also uses PCA for its default starting layout.</div></details>
</main>
`
});
