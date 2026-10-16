// notes/mathstats/m_linalg.js — Linear Algebra
Object.assign(TOPIC_CONTENT, {
  "m_linalg": `<main>
  <h1>Linear Algebra</h1>
  <p class="lead">Every dataset is a matrix, every embedding is a vector, every neural layer is a matrix multiply. This page builds the picture behind each idea, checks it in numpy, and ends with PCA from scratch.</p>

  <h2 id="mla-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linear Algebra</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Vectors &amp; norms</div>
        <ul>
          <li><b>Vector</b> — list of numbers; a data point (row) or a direction (arrow)</li>
          <li><b>L2</b> — √(Σxᵢ²), straight-line length; ridge, kNN, gradient clipping</li>
          <li><b>L1</b> — Σ|xᵢ|, taxi distance; lasso → exact zeros</li>
          <li><b>L∞</b> — max|xᵢ|; adversarial budgets</li>
          <li><b>Unit vector</b> — a/‖a‖, keeps direction only; [3,4] → [0.6, 0.8]</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dot product &amp; cosine</div>
        <ul>
          <li><b>a·b</b> = Σaᵢbᵢ = ‖a‖‖b‖cos θ</li>
          <li><b>Cosine similarity</b> — angle only, −1 to 1: 1 same, 0 unrelated, −1 opposite</li>
          <li><b>Scale-invariant</b> — cos(a, 10a) = 1</li>
          <li><b>Uses</b> — semantic search/RAG, recommenders, attention (<code>QKᵀ</code> = table of dot products)</li>
          <li>⚠ Raw dot rewards long vectors (popular items) → normalise first</li>
          <li><b>Unit vectors</b> → cosine ranking = Euclidean ranking</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matrices &amp; multiplication</div>
        <ul>
          <li><b>Matrix = transformation</b>; columns = where the axes land</li>
          <li><b>Shape rule</b> — (n×k) @ (k×m) → (n×m); inner dims must match</li>
          <li><b>Not commutative</b> — AB ≠ BA; <code>R @ S @ p</code> applies S first; 💡 socks then shoes</li>
          <li><b>Associative</b> — (AB)C = A(BC)</li>
          <li><b>Transpose</b> — rows ↔ cols; <b>(AB)ᵀ = BᵀAᵀ</b></li>
          <li><b>XᵀX</b> — square, symmetric (features × features); core of covariance &amp; normal equation</li>
          <li>⚠ numpy <code>A * B</code> = element-wise; matmul is <code>A @ B</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inverse, solve, rank</div>
        <ul>
          <li><b>Identity I</b> — "do nothing"; <b>A⁻¹</b> undoes A, A⁻¹A = I</li>
          <li><b>Solve, don't invert</b> — <code>np.linalg.solve(A, b)</code> (LU): ~3× fewer ops, more stable</li>
          <li><b>Rank</b> — number of independent directions that survive</li>
          <li><b>Singular</b> — rank-deficient, det = 0, squashes space → no inverse (LinAlgError)</li>
          <li><b>ML hit</b> — duplicate/collinear features → XᵀX singular → no unique regression fit</li>
          <li><b>Fix</b> — drop feature or ridge: XᵀX + λI always invertible (λ &gt; 0)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Eigenvectors</div>
        <ul>
          <li><b>Av = λv</b> — v = direction A doesn't rotate; λ = stretch (neg = flip, 0 = squash)</li>
          <li><b>Example</b> — [[2,1],[1,2]]: λ=3 along (1,1), λ=1 along (1,−1)</li>
          <li><b>Symmetric matrices</b> — real λ, perpendicular v; use <code>np.linalg.eigh</code> (eigvecs = columns)</li>
          <li><b>ML</b> — PCA (covariance eigvecs), Hessian eigvals = curvature (GD zig-zag), RNN |λ|&gt;1 explodes / &lt;1 vanishes</li>
          <li>⚠ Sign/length arbitrary: v and −v both valid</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SVD</div>
        <ul>
          <li><b>M = UΣVᵀ</b> — any matrix, even non-square: rotate · stretch · rotate</li>
          <li><b>Singular values</b> — sorted largest first = importance of each direction</li>
          <li><b>Truncate to top-k</b> — best low-rank approximation (user×movie: rank 2 holds 99.6% energy)</li>
          <li><b>Energy share</b> — σᵢ² / Σσ²</li>
          <li><b>Uses</b> — recommender latent factors, LSA, weight compression, LoRA (low-rank update), sklearn PCA</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PCA</div>
        <ul>
          <li><b>Steps</b> — centre (standardise) → C = XᵀX/(n−1) → eigen-decompose → sort by λ → project onto top k</li>
          <li><b>Explained variance</b> — λᵢ / Σλ</li>
          <li><b>PC1</b> — direction of most spread; PCs perpendicular</li>
          <li><b>SVD link</b> — centred X = UΣVᵀ ⇒ XᵀX = VΣ²Vᵀ; V = PCs, variance = σ²/(n−1)</li>
          <li><b>numpy vs sklearn</b> — eigvecs as columns vs <code>components_</code> as rows; signs may flip</li>
          <li>⚠ Standardise when units differ, else big-number column dominates</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Where it shows up in ML</div>
        <ul>
          <li><b>Linear regression</b> — normal equation: solve (XᵀX)w = Xᵀy; cost O(n·d² + d³)</li>
          <li><b>Avoid normal eq.</b> when d large, data too big, or XᵀX near-singular → GD / QR / SVD lstsq</li>
          <li><b>Dense layer</b> — σ(XW + b), X (batch×in), W (in×out)</li>
          <li><b>No nonlinearity</b> → stacked layers collapse to one matrix (W₁W₂)</li>
          <li><b>Embeddings</b> — words/users as vectors; search = top-k dot products</li>
          <li><b>Mini quiz</b> — <code>a=[1,2]</code>: <code>a @ a</code> = 5, <code>a * a</code> = [1 4]</li>
        </ul>
      </div>
    </div>
  </div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mla-vec"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Vectors &amp; Norms</span><span class="rm-sub">Points, arrows, lengths</span></div></div>
      <div class="rm-item rm-done" data-target="mla-dot"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Dot Product &amp; Cosine</span><span class="rm-sub">How aligned are two vectors</span></div></div>
      <div class="rm-item rm-done" data-target="mla-mat"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Matrices as Transformations</span><span class="rm-sub">Stretch, rotate, squash space</span></div></div>
      <div class="rm-item rm-done" data-target="mla-mul"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Multiplication &amp; Transpose</span><span class="rm-sub">Shape rules, order matters</span></div></div>
      <div class="rm-item rm-done" data-target="mla-inv"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Inverse, Solve, Rank</span><span class="rm-sub">Undoing a transformation</span></div></div>
      <div class="rm-item rm-done" data-target="mla-eig"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Eigenvectors</span><span class="rm-sub">Directions that only stretch</span></div></div>
      <div class="rm-item rm-done" data-target="mla-svd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SVD</span><span class="rm-sub">Rotate, stretch, rotate</span></div></div>
      <div class="rm-item rm-done" data-target="mla-pca"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">PCA by Hand</span><span class="rm-sub">Covariance + eigenvectors vs sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="mla-ml"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Where It Shows Up in ML</span><span class="rm-sub">Regression, embeddings, layers</span></div></div>
      <div class="rm-item rm-done" data-target="mla-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mla-vec"><span class="num">01</span>Vectors &amp; Norms</h2>
  <figure class="viz"><svg viewBox="0 0 380 220" width="380">
    <defs><marker id="mla-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
    <marker id="mla-ah1b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
    <line x1="40" y1="190" x2="200" y2="190" stroke="currentColor" opacity="0.4"/><line x1="40" y1="190" x2="40" y2="30" stroke="currentColor" opacity="0.4"/>
    <line x1="40" y1="190" x2="130" y2="70" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah1)"/>
    <line x1="40" y1="190" x2="58" y2="166" class="sb" stroke-width="3" marker-end="url(#mla-ah1b)"/>
    <line x1="130" y1="70" x2="130" y2="190" stroke="currentColor" stroke-dasharray="3 3" opacity="0.5"/>
    <circle cx="130" cy="70" r="4" class="fr sr"/>
    <text x="138" y="66">a = [3, 4], ‖a‖ = 5</text>
    <text x="150" y="178" class="tb">a/‖a‖ = [0.6, 0.8]</text>
    <text x="134" y="140" class="tm">4</text><text x="82" y="206" class="tm">3</text>
    <text x="220" y="110" class="tm">tip = a data point</text><text x="220" y="126" class="tm">arrow = a direction</text>
  </svg><figcaption>Same numbers, two readings: a point in space, or an arrow from the origin. The unit vector keeps only the direction.</figcaption></figure>
  <p>A <strong>vector</strong> is a list of numbers. In ML each row of your data is one: a house is <code>[size, bedrooms]</code>, a word is a 768-number embedding.</p>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=3, suppress=True)   # tidy output
X = np.array([[12, 3], [8, 2], [20, 4]])   # 3 houses: [size_100sqft, bedrooms]
print(X[0])                                # one data point
a = np.array([3, 4])
print(np.linalg.norm(a))                   # L2 length
print(np.abs(a).sum())                     # L1 length
print(a / np.linalg.norm(a))               # unit vector</div>
  <div class="fx" data-lang="text">[12  3]
5.0
7
[0.6 0.8]</div>
  <table class="tbl">
    <tr><th>Norm</th><th>Formula</th><th>Picture</th><th>In ML</th></tr>
    <tr><td><strong>L2</strong></td><td>√(Σ xᵢ²)</td><td>Straight-line distance</td><td>Ridge penalty, Euclidean kNN, gradient clipping</td></tr>
    <tr><td><strong>L1</strong></td><td>Σ |xᵢ|</td><td>City-block (taxi) distance</td><td>Lasso penalty (pushes weights to exactly 0)</td></tr>
    <tr><td><strong>L∞</strong></td><td>max |xᵢ|</td><td>Biggest single coordinate</td><td>Adversarial-attack budgets</td></tr>
  </table>

  <h2 id="mla-dot"><span class="num">02</span>Dot Product &amp; Cosine Similarity</h2>
  <figure class="viz"><svg viewBox="0 0 480 140" width="480">
    <defs><marker id="mla-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g><line x1="30" y1="100" x2="120" y2="60" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah2)"/><line x1="30" y1="100" x2="130" y2="75" class="sb" stroke-width="2" marker-end="url(#mla-ah2)"/><text x="30" y="130" class="tg">cos ≈ 1: similar</text></g>
    <g><line x1="200" y1="100" x2="290" y2="100" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah2)"/><line x1="200" y1="100" x2="200" y2="20" class="sb" stroke-width="2" marker-end="url(#mla-ah2)"/><text x="190" y="130" class="tm">cos = 0: unrelated</text></g>
    <g><line x1="400" y1="80" x2="460" y2="80" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah2)"/><line x1="400" y1="80" x2="340" y2="80" class="sb" stroke-width="2" marker-end="url(#mla-ah2)"/><text x="345" y="130" class="tr">cos = −1: opposite</text></g>
  </svg><figcaption>Cosine similarity only looks at the angle between arrows, never their length.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>a·b = Σ aᵢbᵢ = ‖a‖‖b‖cos θ</code>. Divide out the lengths and you get <strong>cosine similarity</strong>, from −1 to 1.</p>
  </div>
  <div class="fx" data-lang="py">cat    = np.array([0.9, 0.8, 0.1])     # toy word embeddings
kitten = np.array([0.8, 0.9, 0.2])
car    = np.array([0.1, 0.2, 0.9])
def cos(u, v):
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))
print(round(cat @ kitten, 3), round(cat @ car, 3))
print(round(cos(cat, kitten), 3), round(cos(cat, car), 3))
print(round(cos(cat, 10 * cat), 3))    # scaling doesn't change direction</div>
  <div class="fx" data-lang="text">1.46 0.34
0.99 0.303
1.0</div>
  <ul>
    <li><strong>Where in ML:</strong> semantic search and RAG retrieval, recommendation ("users like you"), attention scores (<code>QKᵀ</code> is a table of dot products).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Raw dot product rewards long vectors: a popular item with a big embedding matches everything. Normalise first (then dot = cosine) unless magnitude is meaningful.</p>
  </div>

  <h2 id="mla-mat"><span class="num">03</span>Matrices as Transformations</h2>
  <figure class="viz"><svg viewBox="0 0 520 170" width="520">
    <defs><marker id="mla-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="30" y="80" width="50" height="50" class="fb sb"/><circle cx="80" cy="80" r="4" class="fr sr"/><text x="86" y="76">p = (1,1)</text><text x="30" y="155">start</text>
    <line x1="140" y1="105" x2="185" y2="105" stroke="currentColor" marker-end="url(#mla-ah3)"/><text x="138" y="96">S</text>
    <rect x="200" y="80" width="100" height="50" class="fg sg"/><circle cx="300" cy="80" r="4" class="fr sr"/><text x="268" y="70">(2,1)</text><text x="200" y="155">S: stretch x by 2</text>
    <line x1="330" y1="105" x2="375" y2="105" stroke="currentColor" marker-end="url(#mla-ah3)"/><text x="328" y="96">R</text>
    <rect x="410" y="80" width="50" height="50" class="ft st"/><circle cx="410" cy="80" r="4" class="fr sr"/><text x="380" y="70">(−1,1)</text><text x="400" y="155">R: rotate 90°</text>
    <line x1="460" y1="70" x2="460" y2="140" stroke="currentColor" opacity="0.4"/><text x="464" y="140" class="tm">y-axis</text>
  </svg><figcaption>A matrix is a function that moves every point. Read its columns as "where the x-axis and y-axis arrows land".</figcaption></figure>
  <div class="fx" data-lang="py">p = np.array([1, 1])
S = np.array([[2, 0], [0, 1]])     # stretch x by 2
R = np.array([[0, -1], [1, 0]])    # rotate 90° anticlockwise
print(S @ p, R @ p)
print(R @ S @ p)                   # stretch first, then rotate
print(S @ R @ p)                   # rotate first, then stretch
print(np.array_equal(R @ S, S @ R))</div>
  <div class="fx" data-lang="text">[2 1] [-1  1]
[-1  2]
[-2  1]
False</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Put on socks then shoes vs shoes then socks. Same two operations, different result. <code>R @ S @ p</code> applies S first (read right to left).</p>
  </div>

  <h2 id="mla-mul"><span class="num">04</span>Matrix Multiplication &amp; Transpose</h2>
  <figure class="viz"><svg viewBox="0 0 570 170" width="570">
    <rect x="20" y="60" width="140" height="44" class="fb sb"/><text x="50" y="87">A (32 × 784)</text>
    <text x="172" y="88">@</text>
    <rect x="195" y="20" width="44" height="130" class="ft st"/><text x="200" y="88" font-size="11">W</text><text x="185" y="165" font-size="11">(784 × 128)</text>
    <text x="255" y="88">=</text>
    <rect x="280" y="60" width="44" height="44" class="fg sg"/><text x="276" y="125" font-size="11">(32 × 128)</text>
    <text x="350" y="60" class="tb">inner dims must match:</text>
    <text x="350" y="80">32 × <tspan class="tr">784</tspan> @ <tspan class="tr">784</tspan> × 128</text>
    <text x="350" y="100" class="tg">outer dims = result shape</text>
  </svg><figcaption>(n×k) @ (k×m) → (n×m). Each output cell is the dot product of a row of A with a column of W.</figcaption></figure>
  <div class="fx" data-lang="py">A = np.ones((32, 784))     # batch of 32 images, 784 pixels each
W = np.ones((784, 128))    # layer weights: 784 inputs -&gt; 128 units
print((A @ W).shape)
try:
    W @ A
except ValueError as e:
    print("ValueError:", e)
B = np.array([[1, 2, 3], [4, 5, 6]])
print(B.T.shape, (B @ B.T).shape, (B.T @ B).shape)
print(B @ B.T)</div>
  <div class="fx" data-lang="text">(32, 128)
ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)-&gt;(n?,m?) (size 32 is different from 128)
(3, 2) (2, 2) (3, 3)
[[14 32]
 [32 77]]</div>
  <ul>
    <li><strong>Not commutative:</strong> <code>AB ≠ BA</code> in general. Often <code>BA</code> isn't even a legal shape.</li>
    <li><strong>Transpose</strong> <code>Aᵀ</code> flips rows ↔ columns. Rule: <code>(AB)ᵀ = BᵀAᵀ</code>.</li>
    <li><strong><code>XᵀX</code></strong> (features × features) is always square and symmetric. It's the core of covariance and the normal equation.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>A * B</code> in numpy is <em>element-wise</em>. Matrix multiply is <code>A @ B</code>. Silent broadcasting with <code>*</code> is a classic shape bug.</p>
  </div>

  <h2 id="mla-inv"><span class="num">05</span>Identity, Inverse, Solve &amp; Rank</h2>
  <div class="flow"><span>x</span><span>A transforms it</span><span>A⁻¹ undoes it</span><span>x again (A⁻¹A = I)</span></div>
  <p><strong>Identity</strong> <code>I</code> = "do nothing" (1s on the diagonal). <strong>Inverse</strong> <code>A⁻¹</code> = the transformation that undoes A.</p>
  <div class="fx" data-lang="py">A = np.array([[2., 1.], [1., 3.]])
b = np.array([5., 10.])
print(np.linalg.inv(A))
print(np.linalg.solve(A, b))       # x such that A @ x = b
print(np.linalg.inv(A) @ b)        # same answer: slower, less stable
print(np.allclose(A @ np.linalg.inv(A), np.eye(2)))</div>
  <div class="fx" data-lang="text">[[ 0.6 -0.2]
 [-0.2  0.4]]
[1. 3.]
[1. 3.]
True</div>
  <div class="callout intu"><span class="label">Solve, don't invert</span>
    <p><code>solve</code> uses an LU factorisation: about 3× fewer operations and smaller rounding error than forming <code>A⁻¹</code>. You almost never need the inverse itself, only <code>A⁻¹b</code>.</p>
  </div>
  <h3>Rank: how many directions survive</h3>
  <figure class="viz"><svg viewBox="0 0 480 130" width="480">
    <rect x="20" y="30" width="70" height="70" class="fg sg"/><text x="20" y="120">rank 2: plane → plane</text>
    <text x="115" y="70">vs</text>
    <rect x="160" y="30" width="70" height="70" class="fb sb"/>
    <line x1="245" y1="65" x2="280" y2="65" stroke="currentColor"/><text x="248" y="58" class="tm">squash</text>
    <line x1="300" y1="100" x2="400" y2="30" class="sr" stroke-width="3"/><text x="230" y="120" class="tr">rank 1: plane → line (info lost)</text>
  </svg><figcaption>A rank-deficient (singular) matrix flattens space. You can't un-flatten, so no inverse exists.</figcaption></figure>
  <div class="fx" data-lang="py">F = np.array([[1, 2, 3],
              [2, 4, 6],           # = 2 x row 1
              [1, 0, 1]])
print(np.linalg.matrix_rank(F))
print(np.linalg.det(F))
try:
    np.linalg.inv(F.astype(float))
except np.linalg.LinAlgError as e:
    print("LinAlgError:", e)
# Same feature twice: price in rupees and in thousands of rupees
X = np.array([[100., 0.1], [250., 0.25], [400., 0.4]])
print(np.linalg.matrix_rank(X))</div>
  <div class="fx" data-lang="text">2
0.0
LinAlgError: Singular matrix
1</div>
  <p><strong>Where in ML:</strong> duplicate or perfectly collinear features make <code>XᵀX</code> singular, so plain linear regression has no unique answer. Ridge fixes it by adding <code>λI</code>.</p>

  <h2 id="mla-eig"><span class="num">06</span>Eigenvectors &amp; Eigenvalues</h2>
  <figure class="viz"><svg viewBox="0 0 400 230" width="400">
    <defs><marker id="mla-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
    <marker id="mla-ah4r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <circle cx="160" cy="150" r="30" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
    <ellipse cx="160" cy="150" rx="90" ry="30" transform="rotate(-45 160 150)" class="fb sb"/>
    <line x1="160" y1="150" x2="224" y2="86" class="sr" stroke-width="2.5" marker-end="url(#mla-ah4r)"/>
    <line x1="160" y1="150" x2="181" y2="171" class="sr" stroke-width="2.5" marker-end="url(#mla-ah4r)"/>
    <line x1="160" y1="150" x2="190" y2="150" stroke="currentColor" opacity="0.5" marker-end="url(#mla-ah4)"/>
    <line x1="160" y1="150" x2="220" y2="120" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#mla-ah4)"/>
    <text x="228" y="82" class="tr">v₁ stretched ×3</text>
    <text x="186" y="188" class="tr">v₂ kept ×1</text>
    <text x="228" y="124" class="tm">[1,0] → [2,1]: turned</text>
  </svg><figcaption>Dashed circle = unit vectors; blue = where A sends them. A = [[2,1],[1,2]] turns most arrows. Along its eigenvectors it only stretches: by λ=3 along (1,1), by λ=1 along (1,−1).</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>Av = λv</code>. <strong>v</strong> = a direction the matrix doesn't rotate. <strong>λ</strong> = how much it stretches along it (negative = flips, 0 = squashed flat).</p>
  </div>
  <div class="fx" data-lang="py">A = np.array([[2., 1.], [1., 2.]])
vals, vecs = np.linalg.eigh(A)     # eigh: for symmetric matrices
print(vals)
print(vecs)                        # columns are eigenvectors
v = vecs[:, 1]
print(A @ v, 3 * v)                # A only stretches v, by 3
print(A @ np.array([1., 0.]))      # an ordinary vector gets turned</div>
  <div class="fx" data-lang="text">[1. 3.]
[[-0.707  0.707]
 [ 0.707  0.707]]
[2.121 2.121] [2.121 2.121]
[2. 1.]</div>
  <table class="tbl">
    <tr><th>Where in ML</th><th>What the eigen-stuff means</th></tr>
    <tr><td>PCA</td><td>Eigenvectors of the covariance = directions of most spread</td></tr>
    <tr><td>Optimization</td><td>Eigenvalues of the Hessian = curvature; big ratio = slow, zig-zag gradient descent</td></tr>
    <tr><td>RNNs</td><td>Repeated multiply by W: |λ| &gt; 1 explodes, |λ| &lt; 1 vanishes</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Eigenvectors have no fixed sign or length: <code>v</code> and <code>−v</code> are both valid. Never compare PCA components across libraries without allowing a sign flip.</p>
  </div>

  <h2 id="mla-svd"><span class="num">07</span>SVD</h2>
  <div class="flow"><span>Vᵀ: rotate</span><span>Σ: stretch each axis</span><span>U: rotate</span><span>= any matrix M</span></div>
  <p>Every matrix, even non-square, factors as <code>M = U Σ Vᵀ</code>. The singular values in Σ, sorted largest first, say how important each direction is.</p>
  <div class="fx" data-lang="py">M = np.array([[5., 5., 1.],        # 4 users x 3 movies
              [4., 5., 1.],        # (two action fans,
              [1., 1., 5.],        #  two romance fans)
              [1., 2., 4.]])
U, s, Vt = np.linalg.svd(M, full_matrices=False)
print(U.shape, s.shape, Vt.shape)
print(s)
M2 = U[:, :2] @ np.diag(s[:2]) @ Vt[:2]          # keep top-2 only
print(np.round(M2, 1))
print(round(np.linalg.norm(M - M2) / np.linalg.norm(M), 3))
print(np.round(s**2 / (s**2).sum(), 3))           # share of "energy"</div>
  <div class="fx" data-lang="text">(4, 3) (3,) (3, 3)
[10.491  5.514  0.733]
[[4.7 5.3 1. ]
 [4.3 4.8 1. ]
 [0.8 1.2 5. ]
 [1.3 1.7 4. ]]
0.062
[0.781 0.216 0.004]</div>
  <p>Two "taste" directions hold 99.6% of the energy. A rank-2 copy rebuilds the ratings with 6% error.</p>
  <ul>
    <li><strong>Where in ML:</strong> recommender latent factors, LSA topic models, compressing weight matrices (LoRA is a low-rank update), and how sklearn's PCA is actually computed.</li>
  </ul>

  <h2 id="mla-pca"><span class="num">08</span>PCA by Hand</h2>
  <figure class="viz"><svg viewBox="0 0 390 200" width="390">
    <defs><marker id="mla-ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <g class="fb sb"><circle cx="228" cy="61" r="3"/><circle cx="47" cy="164" r="3"/><circle cx="172" cy="109" r="3"/><circle cx="131" cy="128" r="3"/><circle cx="126" cy="112" r="3"/><circle cx="138" cy="109" r="3"/><circle cx="74" cy="160" r="3"/><circle cx="136" cy="108" r="3"/><circle cx="139" cy="163" r="3"/><circle cx="266" cy="14" r="3"/><circle cx="166" cy="115" r="3"/><circle cx="150" cy="138" r="3"/><circle cx="137" cy="114" r="3"/><circle cx="120" cy="119" r="3"/><circle cx="114" cy="142" r="3"/><circle cx="144" cy="132" r="3"/><circle cx="168" cy="97" r="3"/><circle cx="142" cy="117" r="3"/><circle cx="175" cy="70" r="3"/><circle cx="137" cy="107" r="3"/><circle cx="149" cy="107" r="3"/><circle cx="199" cy="58" r="3"/><circle cx="172" cy="98" r="3"/><circle cx="138" cy="133" r="3"/><circle cx="139" cy="108" r="3"/><circle cx="166" cy="90" r="3"/><circle cx="224" cy="63" r="3"/><circle cx="146" cy="126" r="3"/></g>
    <line x1="150" y1="110" x2="241" y2="48" class="sr" stroke-width="2.5" marker-end="url(#mla-ah5)"/>
    <line x1="150" y1="110" x2="130" y2="81" class="sr" stroke-width="2" marker-end="url(#mla-ah5)"/>
    <text x="246" y="46" class="tr">PC1: most spread</text><text x="70" y="76" class="tr">PC2</text>
  </svg><figcaption>PCA finds new perpendicular axes: PC1 along the longest stretch of the cloud, PC2 across it.</figcaption></figure>
  <div class="flow"><span>Centre X</span><span>Covariance C = XᵀX/(n−1)</span><span>Eigenvectors of C</span><span>Sort by eigenvalue</span><span>Project onto top k</span></div>
  <div class="fx" data-lang="py">from sklearn.decomposition import PCA
rng = np.random.default_rng(0)
h = rng.normal(170, 10, 200)                  # height (cm)
w = 0.9 * h - 90 + rng.normal(0, 4, 200)      # weight tracks height
X = np.column_stack([h, w])

Xc = X - X.mean(axis=0)                       # 1. centre
C = Xc.T @ Xc / (len(X) - 1)                  # 2. covariance
vals, vecs = np.linalg.eigh(C)                # 3. eigen-decompose
order = np.argsort(vals)[::-1]                # 4. sort big -&gt; small
vals, vecs = vals[order], vecs[:, order]
Z = Xc @ vecs[:, :1]                          # 5. project onto PC1
print(C); print(vals); print(vecs); print(vals / vals.sum())

pca = PCA(n_components=2).fit(X)
print(pca.explained_variance_)
print(pca.components_)                        # rows = PCs
print(pca.explained_variance_ratio_)
print(np.allclose(np.abs(Z), np.abs(pca.transform(X)[:, :1])))</div>
  <div class="fx" data-lang="text">[[92.851 80.994]
 [80.994 87.484]]
[171.206   9.129]
[[-0.719  0.695]
 [-0.695 -0.719]]
[0.949 0.051]
[171.206   9.129]
[[ 0.719  0.695]
 [-0.695  0.719]]
[0.949 0.051]
True</div>
  <ul>
    <li>Same eigenvalues (variance per PC) and same 95% / 5% split. PC1 ≈ (0.72, 0.70): "overall body size".</li>
    <li>numpy gives eigenvectors as <strong>columns</strong>, sklearn as <strong>rows</strong>, and the signs differ. The projections still match.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Standardise features before PCA when units differ. Otherwise a column in grams beats one in kilograms purely because its numbers are bigger.</p>
  </div>

  <h2 id="mla-ml"><span class="num">09</span>Where It Shows Up in ML</h2>
  <div class="cards">
    <div><b>Linear regression</b><p>Normal equation: solve (XᵀX)w = Xᵀy.</p><small>One linear solve gives the best weights</small></div>
    <div><b>Embeddings</b><p>Words, users, images as vectors.</p><small>Similarity = cosine; search = top-k dot products</small></div>
    <div><b>Neural layers</b><p>A dense layer is ReLU(XW + b).</p><small>GPUs exist to do matmuls fast</small></div>
    <div><b>Dimensionality reduction</b><p>PCA / SVD keep the top directions.</p><small>Compression, denoising, visualisation</small></div>
  </div>
  <h3>Build it: normal equation and a dense layer</h3>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(0)
X = rng.normal(size=(100, 2))
y = 1.5 + X @ np.array([2.0, -3.0]) + rng.normal(0, 0.1, 100)

Xb = np.column_stack([np.ones(100), X])        # bias column of 1s
w = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)       # (XᵀX) w = Xᵀy
print(w)
m = LinearRegression().fit(X, y)
print(round(m.intercept_, 3), m.coef_)

batch = rng.normal(size=(4, 3))                # 4 samples, 3 features
W, b = rng.normal(size=(3, 5)), np.zeros(5)    # 3 -&gt; 5 units
print(np.maximum(0, batch @ W + b).shape)      # ReLU(XW + b)</div>
  <div class="fx" data-lang="text">[ 1.484  1.989 -2.983]
1.484 [ 1.989 -2.983]
(4, 5)</div>
  <p>The hand-rolled solve matches sklearn to 3 decimals. For millions of rows or features, gradient descent replaces the solve (see <em>Optimization</em>).</p>

  <h2 id="mla-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why use cosine similarity instead of Euclidean distance for text embeddings?</summary><div class="qa-body">Embedding length often tracks things like document length or word frequency, not meaning. Cosine compares only direction, so a long and a short document on the same topic still score close to 1. On unit-normalised vectors, ranking by cosine and by Euclidean distance is identical.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A is 64×10, B is 10×3. What are the shapes of AB, BA and AᵀA?</summary><div class="qa-body">AB is 64×3. BA is illegal (inner dims 3 vs 64). AᵀA is 10×10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is matrix multiplication commutative? Give a geometric reason.</summary><div class="qa-body">No. Each matrix is a transformation, and order matters: stretch-then-rotate puts (1,1) at (−1,2), rotate-then-stretch puts it at (−2,1). It is associative, though: (AB)C = A(BC).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why call <code>np.linalg.solve(A, b)</code> instead of <code>inv(A) @ b</code>?</summary><div class="qa-body">Solve factorises A once (LU) and back-substitutes: fewer operations and less rounding error. Forming the inverse is extra work and amplifies error when A is ill-conditioned. You need A⁻¹b, not A⁻¹.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does it mean if a matrix has rank lower than its number of columns? How does it hit linear regression?</summary><div class="qa-body">Some columns are combinations of others, so the matrix squashes space and is not invertible. In regression XᵀX becomes singular, so infinitely many weight vectors fit equally well. Fix: drop the duplicate feature, or add ridge (XᵀX + λI is always invertible for λ &gt; 0).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through PCA step by step.</summary><div class="qa-body">(1) Standardise or at least centre each feature. (2) Covariance C = XᵀX/(n−1). (3) Eigen-decompose C. (4) Sort eigenvectors by eigenvalue, largest first. (5) Project data onto the top k. Eigenvalue / total = variance explained. In practice sklearn uses SVD of the centred X, which is more stable and gives the same axes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are SVD and PCA related?</summary><div class="qa-body">If centred X = UΣVᵀ, then XᵀX = VΣ²Vᵀ. So the right singular vectors V are the PCA directions and the eigenvalues of the covariance are σ²/(n−1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your PCA components from numpy and sklearn have opposite signs. Bug?</summary><div class="qa-body">No. If v is an eigenvector, so is −v. Both span the same axis and give the same variance; projections just flip sign. Compare with <code>np.abs</code> or check the subspace.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the normal equation and say when you would not use it.</summary><div class="qa-body">w = (XᵀX)⁻¹Xᵀy, computed as <code>solve(XᵀX, Xᵀy)</code>. It costs about O(n·d² + d³). Avoid it when d is large (d³ blows up), when data doesn't fit in memory, or when XᵀX is near-singular. Use gradient descent or a QR / SVD-based least-squares solver instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a dense neural-network layer in linear-algebra terms?</summary><div class="qa-body">An affine map plus a nonlinearity: <code>σ(XW + b)</code>, with X (batch×in), W (in×out), b broadcast over rows. Without σ, stacking layers collapses into one matrix (W₁W₂ is just another matrix), so depth adds nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>a = np.array([1, 2]); print(a @ a, a * a)</code></summary><div class="qa-body"><code>5 [1 4]</code>. The first is the dot product (1+4); the second is element-wise.</div></details>
</main>`
});
