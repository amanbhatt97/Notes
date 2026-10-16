// notes/mathstats/m_linalg.js — Linear Algebra
Object.assign(TOPIC_CONTENT, {
  "m_linalg": `<main>
  <h1>Linear Algebra</h1>
  <p class="lead">Linear algebra is the maths of lists of numbers (vectors) and tables of numbers (matrices). Every dataset is a table, every word embedding is a list, and every neural-network layer is one table multiplied by another. This page builds each idea as a picture first, works it by hand with tiny numbers, then checks it in numpy, and ends with PCA from scratch.</p>

  <h2 id="mla-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linear Algebra</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Basics</div>
        <ul>
          <li><b>Scalar</b> — one number (a price, a mark)</li>
          <li><b>Vector</b> — a list of numbers; one row of data, or an arrow</li>
          <li><b>Matrix</b> — a table of numbers; whole dataset, or a "machine" that moves points</li>
          <li><b>Shape</b> — (rows × columns); 30 students × 5 subjects = (30, 5)</li>
          <li>💡 a marksheet: one student = vector, whole class = matrix</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Vectors &amp; norms</div>
        <ul>
          <li><b>Vector</b> — list of numbers; a data point (row) or a direction (arrow)</li>
          <li><b>L2</b> — √(Σxᵢ²), straight-line length; [3,4] → 5; ridge, kNN, gradient clipping</li>
          <li><b>L1</b> — Σ|xᵢ|, taxi distance along roads; [3,4] → 7; lasso → exact zeros</li>
          <li><b>L∞</b> — max|xᵢ|; [3,4] → 4; adversarial budgets</li>
          <li><b>Unit vector</b> — a/‖a‖, keeps direction only; [3,4] → [0.6, 0.8]</li>
          <li>⚠ Big-unit feature (sq ft) swamps small one (bedrooms) in distances → scale first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dot product &amp; cosine</div>
        <ul>
          <li><b>a·b</b> = Σaᵢbᵢ = ‖a‖‖b‖cos θ; [1,2]·[3,4] = 3+8 = 11</li>
          <li><b>Meaning</b> — how much two arrows point the same way; perpendicular → 0</li>
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
          <li><b>Matrix = transformation</b>; columns = where the x and y axis arrows land</li>
          <li><b>Matrix × vector</b> — each output = one row · the vector</li>
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
          <li><b>Identity I</b> — "do nothing"; <b>A⁻¹</b> undoes A, A⁻¹A = I (like ÷ for numbers)</li>
          <li><b>Determinant</b> — area scale factor; 2×2: ad − bc; 0 = squashed flat</li>
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
          <li><b>Av = λv</b> — v = direction A doesn't turn; λ = stretch (neg = flip, 0 = squash)</li>
          <li><b>Example</b> — [[2,1],[1,2]]: λ=3 along (1,1), λ=1 along (1,−1); (1,0) gets turned</li>
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
          <li><b>Rank 1</b> — [[2,4],[3,6]] = [2,3] × [1,2]: one pattern; σ = [8.06, 0]</li>
          <li><b>Truncate to top-k</b> — best low-rank approximation (user×movie: rank 2 holds 99.6% energy)</li>
          <li><b>Energy share</b> — σᵢ² / Σσ²</li>
          <li><b>Uses</b> — recommender latent factors, LSA, weight compression, LoRA (low-rank update), sklearn PCA</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PCA</div>
        <ul>
          <li><b>Goal</b> — fewer columns, keep most of the spread; 💡 best camera angle for a shadow</li>
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
      <div class="rm-item rm-done" data-target="mla-big"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Big Picture</span><span class="rm-sub">Numbers, lists, tables</span></div></div>
      <div class="rm-item rm-done" data-target="mla-vec"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Vectors &amp; Norms</span><span class="rm-sub">Points, arrows, lengths</span></div></div>
      <div class="rm-item rm-done" data-target="mla-dot"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Dot Product &amp; Cosine</span><span class="rm-sub">How aligned are two vectors</span></div></div>
      <div class="rm-item rm-done" data-target="mla-mat"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Matrices as Transformations</span><span class="rm-sub">Stretch, rotate, squash space</span></div></div>
      <div class="rm-item rm-done" data-target="mla-mul"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Multiplication &amp; Transpose</span><span class="rm-sub">Shape rules, order matters</span></div></div>
      <div class="rm-item rm-done" data-target="mla-inv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Inverse, Solve, Rank</span><span class="rm-sub">Undoing a transformation</span></div></div>
      <div class="rm-item rm-done" data-target="mla-eig"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Eigenvectors</span><span class="rm-sub">Directions that only stretch</span></div></div>
      <div class="rm-item rm-done" data-target="mla-svd"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">SVD</span><span class="rm-sub">Rotate, stretch, rotate</span></div></div>
      <div class="rm-item rm-done" data-target="mla-pca"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">PCA by Hand</span><span class="rm-sub">Covariance + eigenvectors vs sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="mla-ml"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Where It Shows Up in ML</span><span class="rm-sub">Regression, embeddings, layers</span></div></div>
      <div class="rm-item rm-done" data-target="mla-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mla-big"><span class="num">01</span>The Big Picture: Numbers, Lists, Tables</h2>
  <p>Look at a school marksheet. One mark, like 80 in maths, is a single number. One student's row, like Riya's marks in maths, science and English, is a list: <code>[80, 70, 90]</code>. The whole class is a table: one row per student, one column per subject.</p>
  <p>Linear algebra gives these three things names and rules for working with them:</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <rect x="20" y="55" width="44" height="34" rx="4" class="fs" stroke="currentColor"/><text x="42" y="77" text-anchor="middle">80</text>
    <text x="42" y="118" text-anchor="middle">scalar</text><text x="42" y="136" text-anchor="middle" class="tm">one number</text>
    <rect x="120" y="55" width="132" height="34" rx="4" class="fb sb"/><text x="186" y="77" text-anchor="middle">80   70   90</text>
    <text x="186" y="118" text-anchor="middle">vector</text><text x="186" y="136" text-anchor="middle" class="tm">one student = a list</text>
    <rect x="310" y="20" width="132" height="102" rx="4" class="fg sg"/>
    <text x="376" y="45" text-anchor="middle">80   70   90</text><text x="376" y="75" text-anchor="middle">60   90   70</text><text x="376" y="105" text-anchor="middle">75   65   85</text>
    <text x="376" y="140" text-anchor="middle">matrix (3 × 3)</text>
    <text x="458" y="45" class="tm">Riya</text><text x="458" y="75" class="tm">Arjun</text><text x="458" y="105" class="tm">Meena</text>
  </svg><figcaption>A scalar is one number, a vector is one row, a matrix is the whole table. Shape is written rows × columns.</figcaption></figure>
  <ul>
    <li><strong>Scalar</strong> — a single number.</li>
    <li><strong>Vector</strong> — an ordered list of numbers. In ML, one row of your data (one house, one customer, one word).</li>
    <li><strong>Matrix</strong> — a rectangle of numbers. In ML, the whole dataset, or a layer's weights.</li>
    <li><strong>Shape</strong> — how many rows and columns. 1,000 customers with 8 features each is a (1000, 8) matrix.</li>
  </ul>
  <p><strong>Why anyone needs this:</strong> a computer cannot "look" at a photo, a sentence or a customer. It can only crunch lists and tables of numbers. A photo becomes a table of pixel values. A word becomes a list of 768 numbers (an <strong>embedding</strong> — a list of numbers that stands for meaning). Training a model is mostly multiplying such tables, millions of times. GPUs exist mainly to do this fast.</p>
  <p><strong>Where you will meet it:</strong> loading data into numpy/pandas (matrices), similarity search and RAG (dot products), neural networks (matrix multiply), PCA and recommenders (eigenvectors, SVD). Interviewers ask about shapes, cosine similarity, rank, and PCA all the time.</p>
  <div class="callout intu"><span class="label">Two ways to read a matrix</span>
    <p>Keep both in mind for the whole page. (1) A matrix is a <strong>table of data</strong>. (2) A matrix is a <strong>machine that moves points</strong>: feed in a vector, get a new vector out. Section 04 builds the second reading.</p>
  </div>

  <h2 id="mla-vec"><span class="num">02</span>Vectors &amp; Norms</h2>
  <p>You take an auto from home. It goes 3 km east, then 4 km north. You can write the trip as the list <code>[3, 4]</code>. That list is a <strong>vector</strong>. You can draw it two ways: as a <em>point</em> on a map at (3, 4), or as an <em>arrow</em> from home to that point.</p>
  <p><strong>The need:</strong> ML keeps asking "how big is this?" and "how far apart are these two?". How far is one customer from another? How large are the model's weights? We need one number for the size of a vector. That number is called a <strong>norm</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 420 220" width="420">
    <defs><marker id="mla-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
    <marker id="mla-ah1b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker></defs>
    <line x1="40" y1="190" x2="200" y2="190" stroke="currentColor" opacity="0.4"/><line x1="40" y1="190" x2="40" y2="30" stroke="currentColor" opacity="0.4"/>
    <polyline points="40,190 130,190 130,70" fill="none" class="sg" stroke-width="3" stroke-dasharray="6 4"/>
    <line x1="40" y1="190" x2="130" y2="70" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah1)"/>
    <line x1="40" y1="190" x2="58" y2="166" class="sb" stroke-width="3" marker-end="url(#mla-ah1b)"/>
    <circle cx="130" cy="70" r="4" class="fr sr"/>
    <text x="138" y="66">a = [3, 4]</text>
    <text x="60" y="120">L2 = 5</text>
    <text x="138" y="140" class="tg">L1 = 3 + 4 = 7</text>
    <text x="150" y="178" class="tb">a/‖a‖ = [0.6, 0.8]</text>
    <text x="82" y="206" class="tm">3 km east</text><text x="136" y="104" class="tm">4 km north</text>
    <text x="240" y="60" class="tm">tip = a data point</text><text x="240" y="76" class="tm">arrow = a direction</text>
  </svg><figcaption>Black arrow: straight-line length (L2 = 5). Green dashed path: distance along the roads (L1 = 7). Short blue arrow: same direction, length 1.</figcaption></figure>
  <p><strong>Work it by hand</strong> for <code>a = [3, 4]</code>:</p>
  <ul>
    <li><strong>Straight-line length (L2)</strong>: the arrow is the long side of a right triangle with sides 3 and 4. Pythagoras: √(3² + 4²) = √(9 + 16) = √25 = <strong>5</strong>. This is how a crow flies.</li>
    <li><strong>Road length (L1)</strong>: an auto can't fly; it drives 3 then 4. Total 3 + 4 = <strong>7</strong>. Also called taxi or Manhattan distance.</li>
    <li><strong>Biggest step (L∞)</strong>: the largest single part, max(3, 4) = <strong>4</strong>.</li>
    <li><strong>Unit vector</strong>: divide each part by the length 5 → [3/5, 4/5] = <strong>[0.6, 0.8]</strong>. Check: 0.6² + 0.8² = 0.36 + 0.64 = 1. Same direction, length exactly 1. It keeps "which way", throws away "how far".</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>L2 is the distance a drone flies. L1 is the distance on the auto meter. A unit vector is a compass needle: it shows direction, but its length is always 1.</p>
  </div>
  <p>In numpy, each row of your data is a vector. A house can be <code>[size, bedrooms]</code>:</p>
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
  <p>The same numbers as the hand work. Now the formal names. In the formulas, <code>xᵢ</code> means "the i-th number in the list", <code>Σ</code> means "add them all up", <code>|x|</code> means "drop the minus sign", and <code>‖a‖</code> is the usual symbol for "length of a".</p>
  <table class="tbl">
    <tr><th>Norm</th><th>Formula</th><th>In words</th><th>In ML</th></tr>
    <tr><td><strong>L2</strong></td><td>√(Σ xᵢ²)</td><td>Square each, add, square-root. Straight line.</td><td>Ridge penalty, Euclidean kNN, gradient clipping</td></tr>
    <tr><td><strong>L1</strong></td><td>Σ |xᵢ|</td><td>Add the sizes, ignoring signs. Along the roads.</td><td>Lasso penalty (pushes weights to exactly 0)</td></tr>
    <tr><td><strong>L∞</strong></td><td>max |xᵢ|</td><td>The single biggest part.</td><td>Adversarial-attack budgets</td></tr>
  </table>
  <p>The <strong>distance</strong> between two vectors is just the norm of their difference: subtract them, then take the length.</p>
  <div class="fx" data-lang="py">a = np.array([1200, 3])    # house A: [area_sqft, bedrooms]
b = np.array([1210, 1])    # house B: 10 sqft bigger, 2 fewer bedrooms
c = np.array([1100, 3])    # house C: same bedrooms, 100 sqft smaller
print(round(np.linalg.norm(a - b), 1), round(np.linalg.norm(a - c), 1))</div>
  <div class="fx" data-lang="text">10.2 100.0</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>By distance, house B looks 10× "closer" to A than C does, even though B has 2 fewer bedrooms. Square feet are big numbers, so they drown out bedrooms. Before using distances (kNN, k-means, PCA), put features on the same scale, e.g. standardise each column.</p>
  </div>

  <h2 id="mla-dot"><span class="num">03</span>Dot Product &amp; Cosine Similarity</h2>
  <p>Two friends rate three movies. You want one number that says "do they have the same taste?". That number should be big when they like the same things, near zero when their tastes have nothing to do with each other, and negative when they are opposites.</p>
  <p><strong>The idea:</strong> multiply the two lists position by position, then add. This is the <strong>dot product</strong>.</p>
  <ul>
    <li><code>[1, 2] · [3, 4]</code> = 1×3 + 2×4 = 3 + 8 = <strong>11</strong>.</li>
    <li><code>[1, 0] · [0, 1]</code> = 0 + 0 = <strong>0</strong>. One arrow points east, the other north: at 90°, nothing in common.</li>
    <li><code>[1, 0] · [−1, 0]</code> = −1 + 0 = <strong>−1</strong>. East vs west: opposite.</li>
  </ul>
  <p><strong>Geometric meaning:</strong> the dot product measures how much one arrow points along the other. Same direction gives a big positive number. A right angle gives 0. Opposite directions give a negative number.</p>
  <p>One problem: longer arrows give bigger dot products, even with the same direction. To compare only the <em>direction</em>, divide by both lengths. The result is <strong>cosine similarity</strong>, always between −1 and 1. Example: <code>[3, 4]</code> and <code>[6, 8]</code> point the same way. Dot = 18 + 32 = 50, lengths 5 and 10, so cosine = 50 / (5 × 10) = <strong>1</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 480 140" width="480">
    <defs><marker id="mla-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g><line x1="30" y1="100" x2="120" y2="60" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah2)"/><line x1="30" y1="100" x2="130" y2="75" class="sb" stroke-width="2" marker-end="url(#mla-ah2)"/><text x="30" y="130" class="tg">cos ≈ 1: similar</text></g>
    <g><line x1="200" y1="100" x2="290" y2="100" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah2)"/><line x1="200" y1="100" x2="200" y2="20" class="sb" stroke-width="2" marker-end="url(#mla-ah2)"/><text x="190" y="130" class="tm">cos = 0: unrelated</text></g>
    <g><line x1="400" y1="80" x2="460" y2="80" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah2)"/><line x1="400" y1="80" x2="340" y2="80" class="sb" stroke-width="2" marker-end="url(#mla-ah2)"/><text x="345" y="130" class="tr">cos = −1: opposite</text></g>
  </svg><figcaption>Cosine similarity only looks at the angle between arrows, never their length.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two people walking in a park. Cosine asks only "are they facing the same way?", not "who walks faster?". A slow walker and a fast walker heading north get cosine 1.</p>
  </div>
  <div class="fx" data-lang="py">print(np.array([1, 2]) @ np.array([3, 4]))
print(np.array([1, 0]) @ np.array([0, 1]), np.array([1, 0]) @ np.array([-1, 0]))</div>
  <div class="fx" data-lang="text">11
0 -1</div>
  <p>Now with toy word embeddings. Each word is 3 numbers; "cat" and "kitten" should point the same way, "car" elsewhere. In numpy, <code>@</code> between two vectors is the dot product.</p>
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
  <div class="callout def"><span class="label">Formula</span>
    <p><code>a·b = Σ aᵢbᵢ = ‖a‖‖b‖cos θ</code>. In words: multiply matching parts and add; this also equals length of a × length of b × cos of the angle θ (theta) between them. So <code>cos θ = a·b / (‖a‖‖b‖)</code> is cosine similarity, from −1 to 1.</p>
  </div>
  <ul>
    <li><strong>Where in ML:</strong> semantic search and RAG retrieval (find documents whose vectors point the same way as the question), recommendation ("users like you"), attention scores (<code>QKᵀ</code> is a table of dot products).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Raw dot product rewards long vectors: a popular item with a big embedding matches everything. Normalise first (then dot = cosine) unless magnitude is meaningful.</p>
  </div>

  <h2 id="mla-mat"><span class="num">04</span>Matrices as Transformations</h2>
  <p>Think of a photo editing app. You drag a corner and the whole picture stretches. You press rotate and every pixel turns 90°. Each of these edits moves <em>every point</em> by the same rule. A 2×2 matrix is exactly such a rule for points on a flat page.</p>
  <p><strong>How a matrix moves a point (by hand).</strong> Take <code>S = [[2, 0], [0, 1]]</code> and the point <code>p = (1, 1)</code>. Each new coordinate is one row of S dotted with p:</p>
  <ul>
    <li>new x = row 1 · p = 2×1 + 0×1 = <strong>2</strong></li>
    <li>new y = row 2 · p = 0×1 + 1×1 = <strong>1</strong></li>
  </ul>
  <p>So S sends (1, 1) to (2, 1). It doubled x and left y alone: a horizontal stretch.</p>
  <p><strong>The shortcut: read the columns.</strong> Feed in the x-axis arrow (1, 0) and you get the first column of the matrix. Feed in the y-axis arrow (0, 1) and you get the second column. So the columns tell you "where the axis arrows land". Once you know that, you know where every point goes.</p>
  <figure class="viz"><svg viewBox="0 0 520 190" width="520">
    <defs><marker id="mla-ah6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker>
    <marker id="mla-ah6b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tb"/></marker>
    <marker id="mla-ah6c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <line x1="30" y1="150" x2="190" y2="150" stroke="currentColor" opacity="0.3"/><line x1="40" y1="160" x2="40" y2="20" stroke="currentColor" opacity="0.3"/>
    <rect x="40" y="90" width="60" height="60" class="fb sb" opacity="0.6"/>
    <line x1="40" y1="150" x2="100" y2="150" class="sr" stroke-width="3" marker-end="url(#mla-ah6)"/>
    <line x1="40" y1="150" x2="40" y2="90" class="sb" stroke-width="3" marker-end="url(#mla-ah6b)"/>
    <text x="104" y="166" class="tr">(1,0)</text><text x="4" y="92" class="tb">(0,1)</text>
    <text x="40" y="184">before</text>
    <line x1="210" y1="110" x2="260" y2="110" stroke="currentColor" marker-end="url(#mla-ah6c)"/><text x="196" y="96">[[1,1],[0,1]]</text>
    <line x1="290" y1="150" x2="490" y2="150" stroke="currentColor" opacity="0.3"/><line x1="300" y1="160" x2="300" y2="20" stroke="currentColor" opacity="0.3"/>
    <polygon points="300,150 360,150 420,90 360,90" class="fg sg" opacity="0.6"/>
    <line x1="300" y1="150" x2="360" y2="150" class="sr" stroke-width="3" marker-end="url(#mla-ah6)"/>
    <line x1="300" y1="150" x2="360" y2="90" class="sb" stroke-width="3" marker-end="url(#mla-ah6b)"/>
    <text x="364" y="166" class="tr">(1,0): column 1</text><text x="330" y="80" class="tb">(1,1): column 2</text>
    <circle cx="420" cy="90" r="4" class="fr sr"/><text x="426" y="94">(1,1) → (2,1)</text>
    <text x="300" y="184">after: square becomes a slanted box</text>
  </svg><figcaption>The shear [[1,1],[0,1]]. Red x-arrow stays at (1,0), the first column. Blue y-arrow lands on (1,1), the second column. The whole square follows them.</figcaption></figure>
  <div class="fx" data-lang="py">Sh = np.array([[1, 1], [0, 1]])          # a "shear"
print(Sh @ np.array([1, 0]), Sh @ np.array([0, 1]), Sh @ np.array([1, 1]))</div>
  <div class="fx" data-lang="text">[1 0] [1 1] [2 1]</div>
  <p>Now chain two moves: stretch S, then rotate R by 90° anticlockwise. A 90° turn sends (1, 0) to (0, 1) and (0, 1) to (−1, 0), so those are R's columns: <code>R = [[0, −1], [1, 0]]</code>.</p>
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
    <p>Put on socks then shoes vs shoes then socks. Same two operations, different result. <code>R @ S @ p</code> applies S first (read right to left, the matrix next to p acts first).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Order matters. Stretch-then-rotate put (1, 1) at (−1, 2); rotate-then-stretch put it at (−2, 1). Never swap matrices in a product and expect the same answer.</p>
  </div>

  <h2 id="mla-mul"><span class="num">05</span>Matrix Multiplication &amp; Transpose</h2>
  <p>Back to the marksheet. The final score counts maths 50%, science 30%, English 20%. To get each student's final score, you multiply their marks by the weights and add — a dot product per student.</p>
  <ul>
    <li>Riya [80, 70, 90]: 80×0.5 + 70×0.3 + 90×0.2 = 40 + 21 + 18 = <strong>79</strong></li>
    <li>Arjun [60, 90, 70]: 60×0.5 + 90×0.3 + 70×0.2 = 30 + 27 + 14 = <strong>71</strong></li>
  </ul>
  <p>Doing "each row · the weights" for all rows at once is <strong>matrix multiplication</strong>. Now add a second weighting scheme (a plain average, ⅓ each) as a second column. Every output cell = one row of the left table · one column of the right table.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <rect x="10" y="40" width="150" height="60" rx="4" class="fb sb"/>
    <rect x="14" y="44" width="142" height="24" rx="3" class="fr" opacity="0.5"/>
    <text x="85" y="61" text-anchor="middle">80  70  90</text><text x="85" y="89" text-anchor="middle">60  90  70</text>
    <text x="85" y="125" text-anchor="middle" class="tm">marks (2 × 3)</text>
    <text x="175" y="76">@</text>
    <rect x="195" y="20" width="110" height="100" rx="4" class="ft st"/>
    <rect x="199" y="24" width="44" height="92" rx="3" class="fr" opacity="0.5"/>
    <text x="221" y="45" text-anchor="middle">0.5</text><text x="221" y="75" text-anchor="middle">0.3</text><text x="221" y="105" text-anchor="middle">0.2</text>
    <text x="275" y="45" text-anchor="middle">⅓</text><text x="275" y="75" text-anchor="middle">⅓</text><text x="275" y="105" text-anchor="middle">⅓</text>
    <text x="250" y="140" text-anchor="middle" class="tm">weights (3 × 2)</text>
    <text x="318" y="76">=</text>
    <rect x="340" y="40" width="110" height="60" rx="4" class="fg sg"/>
    <rect x="344" y="44" width="44" height="24" rx="3" class="fr" opacity="0.5"/>
    <text x="366" y="61" text-anchor="middle">79</text><text x="420" y="61" text-anchor="middle">80</text>
    <text x="366" y="89" text-anchor="middle">71</text><text x="420" y="89" text-anchor="middle">73.3</text>
    <text x="395" y="125" text-anchor="middle" class="tm">scores (2 × 2)</text>
    <text x="462" y="58" class="tr">row 1 · col 1</text><text x="462" y="74" class="tr">= 79</text>
  </svg><figcaption>The red row of marks dotted with the red column of weights gives the red cell. The 3 subjects must match the 3 weights — that's the shape rule.</figcaption></figure>
  <div class="fx" data-lang="py">M = np.array([[80, 70, 90],     # Riya:  maths, science, english
              [60, 90, 70]])    # Arjun
w = np.array([0.5, 0.3, 0.2])   # how much each subject counts
print(M @ w)                    # one final score per student
W2 = np.array([[0.5, 1/3],
               [0.3, 1/3],
               [0.2, 1/3]])     # col 1: weighted, col 2: plain average
print(M.shape, W2.shape, (M @ W2).shape)
print(M @ W2)
print(M.T)                      # transpose: subjects become rows</div>
  <div class="fx" data-lang="text">[79. 71.]
(2, 3) (3, 2) (2, 2)
[[79.    80.   ]
 [71.    73.333]]
[[80 60]
 [70 90]
 [90 70]]</div>
  <p><strong>The shape rule:</strong> (2 × <strong>3</strong>) @ (<strong>3</strong> × 2) → (2 × 2). The inner numbers (3 subjects, 3 weights) must be equal, because each row is dotted with each column. The outer numbers give the result's shape. The same rule runs a neural-network layer: a batch of 32 images, each with 784 pixels, times a weight matrix with 784 inputs and 128 outputs.</p>
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
    <li><strong>Not commutative</strong> (order can't be swapped): <code>AB ≠ BA</code> in general. Often <code>BA</code> isn't even a legal shape, like <code>W @ A</code> above.</li>
    <li><strong>Transpose</strong> <code>Aᵀ</code> flips the table: row 1 becomes column 1. The marksheet (2 students × 3 subjects) became (3 subjects × 2 students). Rule: <code>(AB)ᵀ = BᵀAᵀ</code> — flip each and reverse the order.</li>
    <li><strong><code>XᵀX</code></strong>: if X is (rows × features), XᵀX is (features × features). It is always square and symmetric (mirror image across the diagonal, like <code>[[14, 32], [32, 77]]</code>). Each cell compares two feature columns. It is the core of covariance (section 09) and the normal equation (section 10).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>A * B</code> in numpy is <em>element-wise</em> (cell by cell). Matrix multiply is <code>A @ B</code>. Silent broadcasting with <code>*</code> is a classic shape bug.</p>
  </div>

  <h2 id="mla-inv"><span class="num">06</span>Identity, Inverse, Solve &amp; Rank</h2>
  <p>A puzzle from a school fair: 2 bananas and 1 apple cost 5 tokens. 1 banana and 3 apples cost 10 tokens. What does each cost?</p>
  <p><strong>By hand:</strong> from the first line, apple = 5 − 2×banana. Put that into the second: banana + 3×(5 − 2×banana) = 10 → banana + 15 − 6×banana = 10 → −5×banana = −5 → <strong>banana = 1</strong>, then <strong>apple = 3</strong>.</p>
  <p><strong>As matrices:</strong> the prices are unknown vector <code>x</code>. The puzzle says <code>A x = b</code> with <code>A = [[2, 1], [1, 3]]</code> (how many of each fruit) and <code>b = [5, 10]</code> (the totals). With plain numbers, 2x = 6 is solved by dividing: x = 6 / 2. Matrices have no division. Instead, they have an "undo" matrix.</p>
  <ul>
    <li><strong>Identity</strong> <code>I</code>: the "do nothing" matrix, 1s on the diagonal, 0s elsewhere. <code>I x = x</code>, like multiplying a number by 1.</li>
    <li><strong>Inverse</strong> <code>A⁻¹</code>: the matrix that undoes A. <code>A⁻¹A = I</code>. Then <code>x = A⁻¹ b</code>, like x = 6 × (1/2).</li>
  </ul>
  <div class="flow"><span>x</span><span>A transforms it</span><span>A⁻¹ undoes it</span><span>x again (A⁻¹A = I)</span></div>
  <p><strong>The 2×2 inverse by hand.</strong> For <code>[[a, b], [c, d]]</code>, first compute the <strong>determinant</strong> <code>ad − bc</code>. Here 2×3 − 1×1 = <strong>5</strong>. Geometrically, the determinant says how much the matrix scales area: the unit square becomes a shape of area 5. Then the inverse = <code>(1/5) × [[d, −b], [−c, a]]</code> = (1/5) × [[3, −1], [−1, 2]].</p>
  <div class="fx" data-lang="py">A = np.array([[2., 1.], [1., 3.]])
print(round(np.linalg.det(A), 3))                  # 2*3 - 1*1
print(np.array([[3., -1.], [-1., 2.]]) / 5)        # hand formula</div>
  <div class="fx" data-lang="text">5.0
[[ 0.6 -0.2]
 [-0.2  0.4]]</div>
  <p>numpy agrees with the hand formula, and solving the puzzle gives banana 1, apple 3:</p>
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
    <p><code>solve</code> uses an LU factorisation (splitting A into two easy triangle-shaped matrices): about 3× fewer operations and smaller rounding error than forming <code>A⁻¹</code>. You almost never need the inverse itself, only <code>A⁻¹b</code>.</p>
  </div>
  <h3>Rank: how many directions survive</h3>
  <p>Now a bad puzzle: "1 banana + 2 apples = 5, and 2 bananas + 4 apples = 10". The second line is just the first line doubled. It gives no new information, so there are endless answers. The matrix <code>L = [[1, 2], [2, 4]]</code> has this problem.</p>
  <p><strong>Geometric view:</strong> L sends (1, 0) to (1, 2) and (0, 1) to (2, 4). Both land on the same line (y = 2x). So <em>every</em> point on the page gets squashed onto that one line. A whole flat page has been flattened into a line; information is lost, and you can't un-flatten it. Area becomes 0, so the determinant is 0.</p>
  <div class="fx" data-lang="py">L = np.array([[1, 2], [2, 4]])                     # 2nd column = 2 x 1st
print(L @ np.array([1, 0]), L @ np.array([0, 1]), L @ np.array([3, -1]))
print(np.linalg.matrix_rank(L), round(np.linalg.det(L), 3))</div>
  <div class="fx" data-lang="text">[1 2] [2 4] [1 2]
1 0.0</div>
  <p>Notice (1, 0) and (3, −1) both land on (1, 2). Two different inputs, one output: no way to undo. The <strong>rank</strong> is the number of independent directions left after the matrix acts. Here only 1 direction (the line) survives, so rank = 1.</p>
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
  <p><strong>Formal words:</strong> a square matrix with rank lower than its size is <strong>singular</strong> (det = 0, no inverse). Columns that are combinations of other columns are called <strong>linearly dependent</strong>.</p>
  <div class="callout trap"><span class="label">Where it bites in ML</span>
    <p>Duplicate or perfectly collinear features (price in rupees and in thousands of rupees) make <code>XᵀX</code> singular, so plain linear regression has no unique answer. Fix: drop the duplicate, or use ridge, which adds <code>λI</code> (a small number on the diagonal) and makes it invertible.</p>
  </div>

  <h2 id="mla-eig"><span class="num">07</span>Eigenvectors &amp; Eigenvalues</h2>
  <p>Hold a rubber sheet and pull it along one diagonal. Most lines drawn on the sheet get turned to a new angle. But a line drawn exactly along the pull only gets longer; it keeps its direction. Every matrix has such special directions.</p>
  <p><strong>By hand</strong> with <code>A = [[2, 1], [1, 2]]</code> (each output = row · input):</p>
  <ul>
    <li>(1, 0) → (2×1 + 1×0, 1×1 + 2×0) = <strong>(2, 1)</strong>. Direction changed: turned.</li>
    <li>(0, 1) → <strong>(1, 2)</strong>. Also turned.</li>
    <li>(1, 1) → (2 + 1, 1 + 2) = <strong>(3, 3)</strong> = 3 × (1, 1). Same direction, 3 times longer.</li>
    <li>(1, −1) → (2 − 1, 1 − 2) = <strong>(1, −1)</strong> = 1 × (1, −1). Same direction, same length.</li>
  </ul>
  <div class="fx" data-lang="py">A = np.array([[2, 1], [1, 2]])
for v in ([1, 0], [0, 1], [1, 1], [1, -1]):
    print(v, "->", A @ np.array(v))</div>
  <div class="fx" data-lang="text">[1, 0] -&gt; [2 1]
[0, 1] -&gt; [1 2]
[1, 1] -&gt; [3 3]
[1, -1] -&gt; [ 1 -1]</div>
  <p>The special directions (1, 1) and (1, −1) are called <strong>eigenvectors</strong> ("own vectors" in German). The stretch factors 3 and 1 are the <strong>eigenvalues</strong>.</p>
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
    <p><code>Av = λv</code>. In words: "A times v gives the same v, just scaled". <strong>v</strong> = a direction the matrix doesn't turn. <strong>λ</strong> (lambda) = how much it stretches along it (negative = flips, 0 = squashed flat).</p>
  </div>
  <p>numpy finds them for you. <code>eigh</code> is the version for symmetric matrices (mirror across the diagonal); it returns eigenvalues smallest first and eigenvectors scaled to length 1, one per <em>column</em>. (1, 1)/√2 = (0.707, 0.707).</p>
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
  <p><strong>Why it matters:</strong> eigenvectors are the "natural axes" of a matrix. Along them, the complicated matrix becomes simple: just stretching.</p>
  <table class="tbl">
    <tr><th>Where in ML</th><th>What the eigen-stuff means</th></tr>
    <tr><td>PCA</td><td>Eigenvectors of the covariance = directions of most spread</td></tr>
    <tr><td>Optimization</td><td>Eigenvalues of the Hessian = curvature; big ratio = slow, zig-zag gradient descent</td></tr>
    <tr><td>RNNs</td><td>Repeated multiply by W: |λ| &gt; 1 explodes, |λ| &lt; 1 vanishes</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Eigenvectors have no fixed sign or length: <code>v</code> and <code>−v</code> are both valid (numpy above gave (−0.707, 0.707) for the (1, −1) direction). Never compare PCA components across libraries without allowing a sign flip.</p>
  </div>

  <h2 id="mla-svd"><span class="num">08</span>SVD</h2>
  <p>A movie app has a ratings table: users in rows, movies in columns. Looking at it, you notice users fall into "types": action fans, romance fans. Each user's row looks like some amount of an "action pattern" plus some amount of a "romance pattern". If you could find those hidden patterns, you could compress the table and predict missing ratings.</p>
  <p><strong>Smallest case by hand.</strong> Take <code>[[2, 4], [3, 6]]</code>. Row 2 is 1.5 × row 1. Both rows are the single pattern <code>[1, 2]</code>, used in amounts 2 and 3. So the whole table = (amounts [2, 3]) × (pattern [1, 2]). One pattern explains everything: the table has rank 1.</p>
  <div class="fx" data-lang="py">R = np.array([[2., 4.],
              [3., 6.]])                 # row 2 = 1.5 x row 1
print(np.outer([2, 3], [1, 2]))          # (amounts) x (one pattern)
print(np.linalg.svd(R, compute_uv=False))</div>
  <div class="fx" data-lang="text">[[2 4]
 [3 6]]
[8.062 0.   ]</div>
  <p>SVD returned two importance numbers: 8.062 for the one real pattern and 0 for the second. A zero means "this direction carries nothing". These numbers are called <strong>singular values</strong>.</p>
  <div class="flow"><span>Vᵀ: rotate</span><span>Σ: stretch each axis</span><span>U: rotate</span><span>= any matrix M</span></div>
  <p><strong>The idea:</strong> any matrix, of any shape, can be split into three simple moves: a rotation, a stretch along the axes, and another rotation. This split is <strong>Singular Value Decomposition (SVD)</strong>: <code>M = U Σ Vᵀ</code>.</p>
  <ul>
    <li><code>V</code> — the hidden patterns over columns (e.g. "action-ness" of each movie).</li>
    <li><code>Σ</code> (sigma) — the singular values, sorted largest first: how important each pattern is.</li>
    <li><code>U</code> — how much of each pattern every row has (each user's taste).</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Every chai a stall sells is a mix of a few base flavours: ginger, cardamom, sugar. SVD finds the base flavours (V), how strong each one is overall (Σ), and each cup's recipe (U). Drop the weakest flavours and the chai tastes almost the same.</p>
  </div>
  <p>Now a real ratings table: 4 users × 3 movies, keep only the top 2 patterns, and rebuild.</p>
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
  <p><strong>Energy share</strong> = σᵢ² / Σσ²: each singular value squared, divided by the total of all squares. Two "taste" directions hold 78.1% + 21.6% = 99.6% of the energy. A rank-2 copy rebuilds the ratings with only 6% error.</p>
  <ul>
    <li><strong>Where in ML:</strong> recommender latent factors (latent = hidden), LSA topic models, compressing weight matrices (LoRA is a low-rank update), and how sklearn's PCA is actually computed.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Eigen-decomposition works only for square matrices (and is cleanest for symmetric ones). SVD works for any shape. If someone asks you to "eigen-decompose" a 1000 × 50 data matrix, the answer is SVD.</p>
  </div>

  <h2 id="mla-pca"><span class="num">09</span>PCA by Hand</h2>
  <p>You measure the height and weight of 200 people. Tall people tend to be heavier, so the two columns move together. Could one number — "overall body size" — replace both, with little loss?</p>
  <p><strong>The need:</strong> real datasets have hundreds of columns, many repeating the same information. Fewer columns means faster models, less noise, and data you can plot in 2D.</p>
  <p><strong>The idea:</strong> find the direction along which the points are most spread out. Then describe each point by just its position along that direction. This is <strong>Principal Component Analysis (PCA)</strong>. The best direction is <strong>PC1</strong> (first principal component), the next best one at a right angle to it is PC2, and so on.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Taking a photo of a cricket bat. Shoot it from the side and you see its full length. Shoot it end-on and it looks like a small rectangle. PCA picks the camera angle that shows the most spread, so the flat photo loses the least.</p>
  </div>
  <p>Two words first. <strong>Variance</strong> — how much a column jumps around its average. <strong>Covariance</strong> — whether two columns go up and down together (positive), opposite (negative), or unrelated (near 0). The <strong>covariance matrix</strong> holds the variance of each column on the diagonal and the covariance of each pair off the diagonal.</p>
  <p><strong>Tiny example by hand:</strong> three points (1, 1), (2, 2), (3, 3), all on a diagonal line.</p>
  <ol>
    <li><strong>Centre:</strong> subtract the average (2, 2) → (−1, −1), (0, 0), (1, 1).</li>
    <li><strong>Covariance:</strong> variance of x = ((−1)² + 0² + 1²) / (3 − 1) = 2/2 = 1. Same for y. Covariance = ((−1)(−1) + 0 + 1×1) / 2 = 1. So C = [[1, 1], [1, 1]].</li>
    <li><strong>Eigenvectors of C:</strong> C × (1, 1) = (2, 2) = 2 × (1, 1). So PC1 is the diagonal direction, with eigenvalue 2. The other direction gets eigenvalue 0: no spread at all across the line.</li>
    <li><strong>Project:</strong> PC1 at length 1 is (0.707, 0.707). Each point's new single number = its dot product with PC1: −1.414, 0, 1.414.</li>
  </ol>
  <div class="fx" data-lang="py">P = np.array([[1., 1.], [2., 2.], [3., 3.]])   # 3 points on a diagonal line
Pc = P - P.mean(axis=0)                        # centre: subtract the mean (2, 2)
C = Pc.T @ Pc / (len(P) - 1)
vals, vecs = np.linalg.eigh(C)
print(Pc.tolist())
print(C.tolist(), vals)
print(vecs[:, 1], Pc @ vecs[:, 1])            # PC1 and each point's new single number</div>
  <div class="fx" data-lang="text">[[-1.0, -1.0], [0.0, 0.0], [1.0, 1.0]]
[[1.0, 1.0], [1.0, 1.0]] [0. 2.]
[0.707 0.707] [-1.414  0.     1.414]</div>
  <p>Two columns became one, and nothing was lost: eigenvalue share 2 / (2 + 0) = 100%. Real data is never perfectly on a line, so PC1 keeps "most" of the spread, not all.</p>
  <figure class="viz"><svg viewBox="0 0 390 200" width="390">
    <defs><marker id="mla-ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <g class="fb sb"><circle cx="228" cy="61" r="3"/><circle cx="47" cy="164" r="3"/><circle cx="172" cy="109" r="3"/><circle cx="131" cy="128" r="3"/><circle cx="126" cy="112" r="3"/><circle cx="138" cy="109" r="3"/><circle cx="74" cy="160" r="3"/><circle cx="136" cy="108" r="3"/><circle cx="139" cy="163" r="3"/><circle cx="266" cy="14" r="3"/><circle cx="166" cy="115" r="3"/><circle cx="150" cy="138" r="3"/><circle cx="137" cy="114" r="3"/><circle cx="120" cy="119" r="3"/><circle cx="114" cy="142" r="3"/><circle cx="144" cy="132" r="3"/><circle cx="168" cy="97" r="3"/><circle cx="142" cy="117" r="3"/><circle cx="175" cy="70" r="3"/><circle cx="137" cy="107" r="3"/><circle cx="149" cy="107" r="3"/><circle cx="199" cy="58" r="3"/><circle cx="172" cy="98" r="3"/><circle cx="138" cy="133" r="3"/><circle cx="139" cy="108" r="3"/><circle cx="166" cy="90" r="3"/><circle cx="224" cy="63" r="3"/><circle cx="146" cy="126" r="3"/></g>
    <line x1="150" y1="110" x2="241" y2="48" class="sr" stroke-width="2.5" marker-end="url(#mla-ah5)"/>
    <line x1="150" y1="110" x2="130" y2="81" class="sr" stroke-width="2" marker-end="url(#mla-ah5)"/>
    <text x="246" y="46" class="tr">PC1: most spread</text><text x="70" y="76" class="tr">PC2</text>
  </svg><figcaption>PCA finds new perpendicular axes: PC1 along the longest stretch of the cloud, PC2 across it.</figcaption></figure>
  <div class="flow"><span>Centre X</span><span>Covariance C = XᵀX/(n−1)</span><span>Eigenvectors of C</span><span>Sort by eigenvalue</span><span>Project onto top k</span></div>
  <p>Same five steps on 200 people, then compared with sklearn:</p>
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
    <li>Same eigenvalues (variance per PC) and same 95% / 5% split. PC1 ≈ (0.72, 0.70): "overall body size". One number keeps 95% of the spread.</li>
    <li><strong>Explained variance ratio</strong> = λᵢ / Σλ: each eigenvalue divided by the total. It answers "how much of the spread does this PC keep?".</li>
    <li>numpy gives eigenvectors as <strong>columns</strong>, sklearn as <strong>rows</strong>, and the signs differ. The projections still match.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Standardise features before PCA when units differ. Otherwise a column in grams beats one in kilograms purely because its numbers are bigger — the same problem as the house distances in section 02.</p>
  </div>

  <h2 id="mla-ml"><span class="num">10</span>Where It Shows Up in ML</h2>
  <div class="cards">
    <div><b>Linear regression</b><p>Normal equation: solve (XᵀX)w = Xᵀy.</p><small>One linear solve gives the best weights</small></div>
    <div><b>Embeddings</b><p>Words, users, images as vectors.</p><small>Similarity = cosine; search = top-k dot products</small></div>
    <div><b>Neural layers</b><p>A dense layer is ReLU(XW + b).</p><small>GPUs exist to do matmuls fast</small></div>
    <div><b>Dimensionality reduction</b><p>PCA / SVD keep the top directions.</p><small>Compression, denoising, visualisation</small></div>
  </div>
  <p><strong>Linear regression as a puzzle.</strong> Section 06 had 2 equations and 2 unknowns. Regression has 100 rows (equations) but only 3 unknown weights, and the data is noisy, so no weights fit every row exactly. The <strong>normal equation</strong> <code>(XᵀX) w = Xᵀy</code> turns that into a small 3 × 3 puzzle whose answer is the "best fit" (smallest squared error). Here <code>X</code> is the data table, <code>y</code> the true answers, <code>w</code> the weights. A column of 1s is added so the model can learn a constant (the intercept or bias).</p>
  <p><strong>A dense layer</strong> is one matrix multiply plus a bias, then a <strong>nonlinearity</strong> (a bend, like ReLU = "replace negatives with 0").</p>
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
  <p>The hand-rolled solve recovers the true values (1.5, 2, −3) almost exactly and matches sklearn to 3 decimals. The layer turned 4 samples × 3 features into 4 samples × 5 outputs, exactly as the shape rule predicts. For millions of rows or features, gradient descent replaces the solve (see <em>Optimization</em>).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Without the nonlinearity, stacking layers is useless: <code>(X W₁) W₂ = X (W₁W₂)</code>, and W₁W₂ is just one matrix. Ten linear layers = one linear layer.</p>
  </div>

  <h2 id="mla-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Compute by hand: L2 and L1 length of [6, 8], and its unit vector.</summary><div class="qa-body">L2 = √(36 + 64) = √100 = 10. L1 = 6 + 8 = 14. Unit vector = [6/10, 8/10] = [0.6, 0.8] — the same direction as [3, 4].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where does the matrix [[0, 1], [1, 0]] send the point (2, 5)? What does it do geometrically?</summary><div class="qa-body">Row 1 · (2, 5) = 5, row 2 · (2, 5) = 2, so (5, 2). It swaps x and y: a mirror across the diagonal line y = x. Its columns (0, 1) and (1, 0) show the x-axis landing on the y-axis and vice versa.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use cosine similarity instead of Euclidean distance for text embeddings?</summary><div class="qa-body">Embedding length often tracks things like document length or word frequency, not meaning. Cosine compares only direction, so a long and a short document on the same topic still score close to 1. On unit-normalised vectors, ranking by cosine and by Euclidean distance is identical.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A is 64×10, B is 10×3. What are the shapes of AB, BA and AᵀA?</summary><div class="qa-body">AB is 64×3. BA is illegal (inner dims 3 vs 64). AᵀA is 10×10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is matrix multiplication commutative? Give a geometric reason.</summary><div class="qa-body">No. Each matrix is a transformation, and order matters: stretch-then-rotate puts (1,1) at (−1,2), rotate-then-stretch puts it at (−2,1). It is associative, though: (AB)C = A(BC).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why call <code>np.linalg.solve(A, b)</code> instead of <code>inv(A) @ b</code>?</summary><div class="qa-body">Solve factorises A once (LU) and back-substitutes: fewer operations and less rounding error. Forming the inverse is extra work and amplifies error when A is ill-conditioned. You need A⁻¹b, not A⁻¹.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does it mean if a matrix has rank lower than its number of columns? How does it hit linear regression?</summary><div class="qa-body">Some columns are combinations of others, so the matrix squashes space and is not invertible. In regression XᵀX becomes singular, so infinitely many weight vectors fit equally well. Fix: drop the duplicate feature, or add ridge (XᵀX + λI is always invertible for λ &gt; 0).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is (1, 0) an eigenvector of [[3, 0], [0, 5]]? What about (1, 1)?</summary><div class="qa-body">(1, 0) → (3, 0) = 3 × (1, 0): yes, eigenvalue 3. (1, 1) → (3, 5): not a multiple of (1, 1), so it was turned: not an eigenvector. For a diagonal matrix, the axes are the eigenvectors and the diagonal numbers are the eigenvalues.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through PCA step by step.</summary><div class="qa-body">(1) Standardise or at least centre each feature. (2) Covariance C = XᵀX/(n−1). (3) Eigen-decompose C. (4) Sort eigenvectors by eigenvalue, largest first. (5) Project data onto the top k. Eigenvalue / total = variance explained. In practice sklearn uses SVD of the centred X, which is more stable and gives the same axes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are SVD and PCA related?</summary><div class="qa-body">If centred X = UΣVᵀ, then XᵀX = VΣ²Vᵀ. So the right singular vectors V are the PCA directions and the eigenvalues of the covariance are σ²/(n−1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your PCA components from numpy and sklearn have opposite signs. Bug?</summary><div class="qa-body">No. If v is an eigenvector, so is −v. Both span the same axis and give the same variance; projections just flip sign. Compare with <code>np.abs</code> or check the subspace.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the normal equation and say when you would not use it.</summary><div class="qa-body">w = (XᵀX)⁻¹Xᵀy, computed as <code>solve(XᵀX, Xᵀy)</code>. It costs about O(n·d² + d³). Avoid it when d is large (d³ blows up), when data doesn't fit in memory, or when XᵀX is near-singular. Use gradient descent or a QR / SVD-based least-squares solver instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a dense neural-network layer in linear-algebra terms?</summary><div class="qa-body">An affine map plus a nonlinearity: <code>σ(XW + b)</code>, with X (batch×in), W (in×out), b broadcast over rows. Without σ, stacking layers collapses into one matrix (W₁W₂ is just another matrix), so depth adds nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>a = np.array([1, 2]); print(a @ a, a * a)</code></summary><div class="qa-body"><code>5 [1 4]</code>. The first is the dot product (1+4); the second is element-wise.</div></details>
</main>`
});
