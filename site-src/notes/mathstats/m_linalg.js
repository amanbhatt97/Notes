// notes/mathstats/m_linalg.js — Linear Algebra
Object.assign(TOPIC_CONTENT, {
  "m_linalg": `<main>
  <h1>Linear Algebra</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Math for ML</span><span>Linear Algebra</span></div>
  <p class="lead">Linear algebra is the maths of lists of numbers (vectors) and tables of numbers (matrices). Every dataset is a table, every word embedding is a list, and every neural-network layer is one table multiplied by another. This note builds each idea as the answer to a question the previous idea could not answer, all on ONE running example: three houses described by [size, rooms] with a price each. You will store a house as a vector, measure how far apart and how alike two houses are, turn the whole table into predictions with one multiplication, solve for the best weights (the normal equations), find the directions a matrix only stretches (eigenvectors), split any matrix into simple moves (SVD), and finish with PCA by hand. The same three houses return in <a class="xref" data-note="m_calculus">Calculus</a> and <a class="xref" data-note="m_optimization">Optimization</a>.</p>

  <h2 id="mla-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="mla-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="130" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="75" y="41" text-anchor="middle" font-size="12" font-weight="700">Linear Algebra</text><text x="75" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="140" y1="45" x2="168" y2="45" stroke="currentColor" marker-end="url(#mla-a0)"/>
<rect x="170" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="230" y="41" text-anchor="middle" font-size="12">Calculus</text><text x="230" y="58" text-anchor="middle" class="tm" font-size="10">which way is downhill?</text>
<line x1="290" y1="45" x2="318" y2="45" stroke="currentColor" marker-end="url(#mla-a0)"/>
<rect x="320" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="380" y="41" text-anchor="middle" font-size="12">Optimization</text><text x="380" y="58" text-anchor="middle" class="tm" font-size="10">walk down to the best w</text>
<line x1="440" y1="45" x2="468" y2="45" stroke="currentColor" marker-end="url(#mla-a0)"/>
<rect x="470" y="20" width="180" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="41" text-anchor="middle" font-size="12">ML models</text><text x="560" y="58" text-anchor="middle" class="tm" font-size="10">regression, PCA, neural nets</text>
<line x1="75" y1="70" x2="75" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#mla-a0)"/>
<rect x="10" y="110" width="200" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="110" y="130" text-anchor="middle" font-size="12">Statistics: covariance</text><text x="110" y="147" text-anchor="middle" class="tm" font-size="10">XᵀX / (n − 1) of a centred table</text>
<text x="440" y="125" text-anchor="middle" class="tm" font-size="10.5">the 3-house table [size, rooms] → price is the running</text><text x="440" y="141" text-anchor="middle" class="tm" font-size="10.5">example of all three Math-for-ML notes</text>
</svg><figcaption>The Math for ML track: Linear Algebra → Calculus → Optimization, then the ML notes. Linear algebra gives the objects (vectors, matrices) that the other two differentiate and minimise.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: a table of data</b><span>You loaded rows and columns (see <a class="xref" data-note="da_numpy">NumPy</a>) and summarised single columns (see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>). Now you need to compute with whole rows and whole tables at once.</span></li>
    <li><b>This note adds: the language of rows, tables and the machines that move them</b><span>Vectors, lengths and angles, matrix multiplication, solving for weights, eigenvectors, SVD and PCA, all on three houses.</span></li>
    <li><b>Leads to: <a class="xref" data-note="m_calculus">Calculus</a></b><span>We will solve for the best weights here in one shot. Calculus asks the question that scales to millions of weights and to models with no formula: "if I nudge the weights, how fast does the error change?". Then <a class="xref" data-note="m_optimization">Optimization</a> walks downhill, <a class="xref" data-note="ml_regression">Linear Regression</a> uses the normal equations from section 06, and <a class="xref" data-note="ml_pca">PCA</a> builds on sections 07–09.</span></li>
  </ol>

  <h2 id="mla-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. All numbers come from the same three houses: A = [1, 1], B = [2, 3], C = [3, 2] ([size in 1000 sq ft, rooms]) with prices 2, 4, 6 (₹ crore).</p>
  <ol class="story">
    <li><b>Vector</b><span>Q: how do I store one house so a computer can work with it? → An ordered list of numbers: house B = [2, 3]. A list can also be read as an arrow. But we have three houses; how do they compare?</span></li>
    <li><b>Norm &amp; distance</b><span>Q: how big is one house's vector, and how far apart are two houses? → Length ‖B‖ = √13 = 3.61; distance B–C = ‖B − C‖ = 1.41, A–B = 2.24. But distance mixes "how big" with "what kind": is a big house of the same kind "far"?</span></li>
    <li><b>Dot product &amp; cosine</b><span>Q: do two houses have the same <em>mix</em>, regardless of size? → Multiply matching parts and add: B·C = 12; divide by both lengths: cos(B, C) = 0.92, cos(A, B) = 0.98. Now we can compare rows. But we still handle one row at a time…</span></li>
    <li><b>Matrix &amp; matrix × vector</b><span>Q: how do I apply the same pricing rule to every house at once? → Stack the rows into a table X (3 × 2) and multiply by a weight vector: X·[1, 1] = [2, 5, 5] predicted prices, errors [0, 1, −1]. But we want to try many weight vectors, and combine tables…</span></li>
    <li><b>Matrix × matrix &amp; transpose</b><span>Q: how do I apply many rules, or chain transformations? → Rows · columns with the shape rule (n×k)(k×m). The transpose flips the table, and XᵀX = [[14, 13], [13, 14]] compares every feature with every other. But which weights are <em>right</em>?</span></li>
    <li><b>Inverse, rank &amp; the normal equations</b><span>Q: can I undo the multiplication and solve for the weights? → Solve XᵀX·w = Xᵀy: det 27, w = [2, 0], exactly ₹2 crore per 1000 sq ft. If a column repeats another, the rank drops, det = 0, and there is no unique answer (fix: ridge). But XᵀX is still a black box: what does it <em>do</em>?</span></li>
    <li><b>Eigenvectors &amp; eigenvalues</b><span>Q: which directions does a matrix only stretch, not turn? → XᵀX stretches (1, 1) by 27 and (1, −1) by 1. Changing both weights together changes predictions a lot; trading one for the other barely does. But eigenvectors need a square matrix; X itself is 3 × 2…</span></li>
    <li><b>SVD</b><span>Q: can any matrix, of any shape, be split into simple moves? → X = UΣVᵀ: rotate, stretch by σ = 5.20 and 1, rotate. σ² = 27 and 1, the eigenvalues of XᵀX. The top pattern alone holds 96.4% of the "energy". Can we use that to shrink the data itself?</span></li>
    <li><b>PCA</b><span>Q: can I replace the two columns by one number that keeps most of the spread? → Centre, covariance [[1, 0.5], [0.5, 1]], eigenvectors: PC1 = (0.707, 0.707) keeps 75%. Scores −1.41, 0.71, 0.71. This is <a class="xref" data-note="ml_pca">PCA</a>.</span></li>
    <li><b>Where it shows up in ML</b><span>Q: where do these pieces appear in real models? → Regression (normal equations), embeddings (cosine), dense layers (XW + b), compression and recommenders (SVD).</span></li>
  </ol>

  <h2 id="mla-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linear Algebra</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Basics</div>
        <ul>
          <li><b>Scalar</b> — one number (a price, a size)</li>
          <li><b>Vector</b> — a list of numbers; one row of data, or an arrow; house B = [2, 3]</li>
          <li><b>Matrix</b> — a table of numbers; whole dataset, or a "machine" that moves points</li>
          <li><b>Shape</b> — (rows × columns); 3 houses × 2 features = (3, 2)</li>
          <li>💡 a property listing: one house = vector, the whole listing = matrix</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Vectors &amp; norms</div>
        <ul>
          <li><b>L2</b> — √(Σxᵢ²), straight-line length; ‖B‖ = √13 = 3.61; ridge, kNN, gradient clipping</li>
          <li><b>L1</b> — Σ|xᵢ|, taxi distance along roads; B → 5; lasso → exact zeros</li>
          <li><b>L∞</b> — max|xᵢ|; B → 3; adversarial budgets</li>
          <li><b>Distance</b> — ‖a − b‖; B–C 1.41, A–B 2.24</li>
          <li><b>Unit vector</b> — a/‖a‖, keeps direction only; B → [0.555, 0.832]</li>
          <li>⚠ Size in sq ft (1000s) swamps rooms in distances → scale first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dot product &amp; cosine</div>
        <ul>
          <li><b>a·b</b> = Σaᵢbᵢ = ‖a‖‖b‖cos θ; B·C = 6 + 6 = 12</li>
          <li><b>Meaning</b> — how much two arrows point the same way; perpendicular → 0</li>
          <li><b>Cosine similarity</b> — angle only, −1 to 1; cos(B, C) = 0.92, cos(A, B) = 0.98</li>
          <li><b>Scale-invariant</b> — cos(B, 10B) = 1</li>
          <li><b>Uses</b> — semantic search/RAG, recommenders, attention (<code>QKᵀ</code> = table of dot products)</li>
          <li>⚠ Raw dot rewards long vectors → normalise first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matrices &amp; multiplication</div>
        <ul>
          <li><b>X·w</b> — each output = one row · w; X·[1, 1] = [2, 5, 5]</li>
          <li><b>Matrix = transformation</b>; columns = where the axis arrows land</li>
          <li><b>Shape rule</b> — (n×k) @ (k×m) → (n×m); inner dims must match</li>
          <li><b>Not commutative</b> — AB ≠ BA; 💡 socks then shoes</li>
          <li><b>Transpose</b> — rows ↔ cols; <b>(AB)ᵀ = BᵀAᵀ</b></li>
          <li><b>XᵀX</b> — (features × features), symmetric; ours [[14, 13], [13, 14]]</li>
          <li>⚠ numpy <code>A * B</code> = element-wise; matmul is <code>A @ B</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inverse, solve, rank</div>
        <ul>
          <li><b>Identity I</b> — "do nothing"; <b>A⁻¹</b> undoes A, A⁻¹A = I</li>
          <li><b>Determinant</b> — area scale factor; 2×2: ad − bc; XᵀX → 196 − 169 = 27</li>
          <li><b>Normal equations</b> — XᵀX·w = Xᵀy → w = [2, 0]</li>
          <li><b>Solve, don't invert</b> — <code>np.linalg.solve</code>: fewer ops, more stable</li>
          <li><b>Rank</b> — number of independent directions; duplicate column → rank drops</li>
          <li><b>Fix</b> — drop the duplicate or ridge: XᵀX + λI always invertible (λ &gt; 0)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Eigenvectors</div>
        <ul>
          <li><b>Av = λv</b> — v = direction A doesn't turn; λ = stretch</li>
          <li><b>Ours</b> — XᵀX: λ = 27 along (1, 1), λ = 1 along (1, −1)</li>
          <li><b>Symmetric matrices</b> — real λ, perpendicular v; use <code>np.linalg.eigh</code></li>
          <li><b>ML</b> — PCA, Hessian curvature (27 : 1 → narrow valley for GD), RNN explode/vanish</li>
          <li>⚠ Sign/length arbitrary: v and −v both valid</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SVD</div>
        <ul>
          <li><b>M = UΣVᵀ</b> — any matrix, even non-square: rotate · stretch · rotate</li>
          <li><b>Ours</b> — σ = 5.196, 1; σ² = 27, 1 = eigenvalues of XᵀX</li>
          <li><b>Truncate to top-k</b> — best low-rank approximation; top pattern = 96.4% energy</li>
          <li><b>Energy share</b> — σᵢ² / Σσ²</li>
          <li><b>Uses</b> — recommenders, LSA, weight compression, LoRA, sklearn PCA</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PCA</div>
        <ul>
          <li><b>Goal</b> — fewer columns, keep most of the spread; 💡 best camera angle for a shadow</li>
          <li><b>Steps</b> — centre → C = XᵀX/(n−1) → eigen-decompose → sort → project onto top k</li>
          <li><b>Ours</b> — C = [[1, 0.5], [0.5, 1]]; PC1 = (0.707, 0.707) keeps 75%</li>
          <li><b>SVD link</b> — centred X = UΣVᵀ ⇒ V = PCs, variance = σ²/(n−1)</li>
          <li>⚠ Standardise when units differ</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mla-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="mla-big"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One House = a Vector</span><span class="rm-sub">Scalars, vectors, tables</span></div></div>
      <div class="rm-item rm-done" data-target="mla-vec"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Norms &amp; Distance</span><span class="rm-sub">How big, how far apart</span></div></div>
      <div class="rm-item rm-done" data-target="mla-dot"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Dot Product &amp; Cosine</span><span class="rm-sub">Same mix, any size</span></div></div>
      <div class="rm-item rm-done" data-target="mla-mat"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Matrix × Vector</span><span class="rm-sub">Price every house at once</span></div></div>
      <div class="rm-item rm-done" data-target="mla-mul"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Matrix × Matrix &amp; Transpose</span><span class="rm-sub">Shape rules, XᵀX</span></div></div>
      <div class="rm-item rm-done" data-target="mla-inv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Inverse, Rank, Normal Equations</span><span class="rm-sub">Solving for the weights</span></div></div>
      <div class="rm-item rm-done" data-target="mla-eig"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Eigenvectors</span><span class="rm-sub">Directions that only stretch</span></div></div>
      <div class="rm-item rm-done" data-target="mla-svd"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">SVD</span><span class="rm-sub">Any shape: rotate, stretch, rotate</span></div></div>
      <div class="rm-item rm-done" data-target="mla-pca"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">PCA by Hand</span><span class="rm-sub">Two columns into one</span></div></div>
      <div class="rm-item rm-done" data-target="mla-ml"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Where It Shows Up in ML</span><span class="rm-sub">Regression, embeddings, layers</span></div></div>
      <div class="rm-item rm-done" data-target="mla-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table, three houses</span></div></div>
      <div class="rm-item rm-done" data-target="mla-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="mla-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="mla-big"><span class="num">01</span>One House = a Vector</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A computer cannot "look" at a house, a photo or a sentence. It can only crunch numbers. How do we write one house down so that a program can compare it, price it and learn from it?</p>
  </div>
  <p><strong>Plain words:</strong> describe each house by the same few measurements, always in the same order. One house becomes a short list of numbers. A whole listing of houses becomes a table: one row per house, one column per measurement.</p>
  <h3>The running example</h3>
  <p>Three houses. Size is in thousands of square feet, price in ₹ crore. Every section of this note, and the <a class="xref" data-note="m_calculus">Calculus</a> and <a class="xref" data-note="m_optimization">Optimization</a> notes, use this same table.</p>
  <table class="tbl out"><caption>The running example: three houses</caption>
    <tr><th>House</th><th>Size (1000 sq ft)</th><th>Rooms</th><th>Price (₹ crore)</th></tr>
    <tr><td>A</td><td>1</td><td>1</td><td>2</td></tr>
    <tr><td>B</td><td>2</td><td>3</td><td>4</td></tr>
    <tr><td>C</td><td>3</td><td>2</td><td>6</td></tr>
  </table>
  <p>House C is a big open-plan flat: the largest, but with fewer rooms than B. Look at the prices: each is exactly 2 × size. Keep that in mind; section 06 will discover it from the numbers alone.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <rect x="20" y="55" width="44" height="34" rx="4" class="fs" stroke="currentColor"/><text x="42" y="77" text-anchor="middle">4</text>
    <text x="42" y="118" text-anchor="middle">scalar</text><text x="42" y="136" text-anchor="middle" class="tm">B's price</text>
    <rect x="120" y="55" width="132" height="34" rx="4" class="fb sb"/><text x="186" y="77" text-anchor="middle">2     3</text>
    <text x="186" y="118" text-anchor="middle">vector</text><text x="186" y="136" text-anchor="middle" class="tm">house B = [size, rooms]</text>
    <rect x="310" y="20" width="132" height="102" rx="4" class="fg sg"/>
    <text x="376" y="45" text-anchor="middle">1     1</text><text x="376" y="75" text-anchor="middle">2     3</text><text x="376" y="105" text-anchor="middle">3     2</text>
    <text x="376" y="140" text-anchor="middle">matrix X (3 × 2)</text>
    <text x="458" y="45" class="tm">A</text><text x="458" y="75" class="tm">B</text><text x="458" y="105" class="tm">C</text>
  </svg><figcaption>A scalar is one number, a vector is one row, a matrix is the whole table. Shape is written rows × columns: X is (3, 2).</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A property listing site. Each house gets a card with the same fields in the same order: size, rooms. One card is a vector. The whole listing page is a matrix. The prices are a separate column, the answers we want a model to predict.</p>
  </div>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=3, suppress=True)   # tidy output
# The running example: 3 houses. Columns: [size in 1000 sq ft, rooms]
X = np.array([[1., 1.],     # house A
              [2., 3.],     # house B
              [3., 2.]])    # house C
y = np.array([2., 4., 6.])  # price of each house, Rs crore
A, B, C = X                 # each row is one vector
print("house B:", B, "  shape:", B.shape)
print("table:", X.shape, "  prices:", y.shape)</div>
  <div class="fx" data-lang="text">house B: [2. 3.]   shape: (2,)
table: (3, 2)   prices: (3,)</div>
  <p>What the code does: <code>np.array</code> with nested lists builds the table; each inner list is one row. <code>A, B, C = X</code> unpacks the three rows into three vectors. <code>.shape</code> reports (rows, columns): one house is a 1-D vector of 2 numbers, the table is (3, 2), and the prices are a vector of 3.</p>
  <ul>
    <li><strong>Scalar</strong> — a single number (one price).</li>
    <li><strong>Vector</strong> — an ordered list of numbers. In ML, one row of your data (one house, one customer, one word). It can be drawn as a point, or as an arrow from 0 to that point.</li>
    <li><strong>Matrix</strong> — a rectangle of numbers. In ML, the whole dataset, or a layer's weights.</li>
    <li><strong>Shape</strong> — how many rows and columns. 1,000 customers with 8 features each is a (1000, 8) matrix.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>vector</strong> x = [x₁, x₂, …, x_d] is an ordered list of d numbers; xᵢ is its i-th entry and d its dimension. A <strong>matrix</strong> X of shape (n, d) has n rows and d columns; X[i] is row i, X[:, j] is column j.</p>
  </div>
  <p><strong>Why anyone needs this:</strong> a photo becomes a table of pixel values; a word becomes a list of 768 numbers (an <strong>embedding</strong>, a list of numbers that stands for meaning). Training a model is mostly multiplying such tables, millions of times; GPUs exist mainly to do this fast.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Order matters. [2, 3] means "size 2, rooms 3" only because every row uses the same column order. Shuffle the columns of one row and it describes a different house. Keep the column order fixed between training and prediction.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: norms and distance.</b> We can store three houses, but we can't yet say how big one is, or how far apart two are. Is B more like A or like C?</div>

  <h2 id="mla-vec"><span class="num">02</span>How Far Apart? Norms &amp; Distance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have three vectors. "Which house is most like B?" needs one number for the size of a vector, and one number for the gap between two vectors. kNN, k-means and many other models run on exactly that.</p>
  </div>
  <p><strong>Plain words:</strong> a vector is an arrow; its <strong>norm</strong> is the arrow's length. The <strong>distance</strong> between two houses is the length of the arrow from one to the other: subtract them, then take the length.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You take an auto from home: 3 km east, then 4 km north, the trip [3, 4]. A drone flies straight: √(3² + 4²) = 5 km (L2). The auto meter counts the roads: 3 + 4 = 7 km (L1). A unit vector is a compass needle: direction only, length always 1.</p>
  </div>
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
  </svg><figcaption>The auto-trip analogy. Black arrow: straight-line length (L2 = 5). Green dashed path: distance along the roads (L1 = 7). Short blue arrow: same direction, length 1.</figcaption></figure>
  <p><strong>Traced on the houses.</strong> House B = [2, 3]:</p>
  <ul>
    <li><strong>L2 length</strong>: √(2² + 3²) = √(4 + 9) = √13 = <strong>3.606</strong>. Pythagoras, as the crow flies.</li>
    <li><strong>L1 length</strong>: 2 + 3 = <strong>5</strong>. <strong>L∞</strong>: the biggest part, max(2, 3) = <strong>3</strong>.</li>
    <li><strong>Unit vector</strong>: [2, 3] / 3.606 = <strong>[0.555, 0.832]</strong>. Same direction, length 1 (0.555² + 0.832² = 1).</li>
    <li><strong>Distance A to B</strong>: B − A = [1, 2], length √(1 + 4) = √5 = <strong>2.236</strong>.</li>
    <li><strong>Distance B to C</strong>: C − B = [1, −1], length √(1 + 1) = √2 = <strong>1.414</strong>. So C is B's nearest neighbour.</li>
  </ul>
  <div class="fx" data-lang="py">print(np.linalg.norm(B))                   # L2 length of house B
print(np.abs(B).sum(), np.abs(B).max())    # L1 and L-infinity lengths
print(B / np.linalg.norm(B))               # unit vector: direction only
print(round(np.linalg.norm(A - B), 3),     # distance A to B
      round(np.linalg.norm(B - C), 3))     # distance B to C</div>
  <div class="fx" data-lang="text">3.605551275463989
5.0 3.0
[0.555 0.832]
2.236 1.414</div>
  <p>What the code does: <code>np.linalg.norm(v)</code> is the L2 length (square, add, square-root). <code>np.abs(B).sum()</code> is L1 and <code>.max()</code> is L∞. Dividing a vector by its norm keeps its direction and sets its length to 1. <code>A - B</code> subtracts position by position, so <code>norm(A - B)</code> is the distance.</p>
  <table class="tbl">
    <tr><th>Norm</th><th>Formula</th><th>In words</th><th>On house B</th><th>In ML</th></tr>
    <tr><td><strong>L2</strong></td><td>√(Σ xᵢ²)</td><td>Square each, add, square-root. Straight line.</td><td>3.606</td><td>Ridge penalty, Euclidean kNN, gradient clipping</td></tr>
    <tr><td><strong>L1</strong></td><td>Σ |xᵢ|</td><td>Add the sizes, ignoring signs. Along the roads.</td><td>5</td><td>Lasso penalty (pushes weights to exactly 0)</td></tr>
    <tr><td><strong>L∞</strong></td><td>max |xᵢ|</td><td>The single biggest part.</td><td>3</td><td>Adversarial-attack budgets</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>The L2 norm ‖x‖ = √(x₁² + … + x_d²). The distance between vectors a and b is ‖a − b‖. Symbols: xᵢ is the i-th number, Σ means "add them all up", |x| means "drop the minus sign", ‖a‖ is read "the length of a".</p>
  </div>
  <p>Now the same houses with size written in plain square feet (1000, 2000, 3000) instead of thousands:</p>
  <div class="fx" data-lang="py">Xft = X * np.array([1000, 1])              # size in plain sq ft instead of thousands
Aft, Bft, Cft = Xft
print(Xft)
print(round(np.linalg.norm(Aft - Bft), 3), round(np.linalg.norm(Bft - Cft), 3))</div>
  <div class="fx" data-lang="text">[[1000.    1.]
 [2000.    3.]
 [3000.    2.]]
1000.002 1000.0</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Both distances became ≈ 1000: the room differences (2 rooms between A and B, 1 between B and C) vanished, because square feet are big numbers. The same houses, a different unit, a different "nearest neighbour". Before using distances (kNN, k-means, PCA), put features on the same scale, e.g. standardise each column (subtract its mean, divide by its standard deviation).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: dot product and cosine.</b> Distance mixes two things: how big a house is and what kind of house it is. A twice-as-big house with the same size-to-rooms mix is "far away" by distance. How do we ask "same mix, any size?"</div>

  <h2 id="mla-dot"><span class="num">03</span>How Alike? Dot Product &amp; Cosine Similarity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Distance says B is nearest to C. But A = [1, 1] and B = [2, 3] might be "the same kind of house, just smaller". We need a number that compares the <em>direction</em> of two vectors and ignores their length.</p>
  </div>
  <p><strong>Plain words:</strong> multiply the two lists position by position, then add. This is the <strong>dot product</strong>. It is big when both vectors are large in the same positions, 0 when they have nothing in common (a right angle), negative when they point opposite ways. Divide by both lengths and you get <strong>cosine similarity</strong>: direction only, always between −1 and 1.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two people walking in a park. Cosine asks only "are they facing the same way?", not "who walks faster?". A slow walker and a fast walker heading north get cosine 1.</p>
  </div>
  <p><strong>Traced on the houses:</strong></p>
  <ul>
    <li>A·B = 1×2 + 1×3 = <strong>5</strong>. B·C = 2×3 + 3×2 = <strong>12</strong>. A·C = 1×3 + 1×2 = <strong>5</strong>.</li>
    <li>Lengths: ‖A‖ = √2 = 1.414, ‖B‖ = ‖C‖ = √13 = 3.606.</li>
    <li>cos(B, C) = 12 / (3.606 × 3.606) = 12 / 13 = <strong>0.923</strong>.</li>
    <li>cos(A, B) = 5 / (1.414 × 3.606) = 5 / 5.099 = <strong>0.981</strong>. Same for A and C.</li>
  </ul>
  <p>So by distance B's nearest is C, but by direction B is more like small house A. Both answers are right; they answer different questions ("how far" vs "what mix").</p>
  <figure class="viz"><svg viewBox="0 0 480 140" width="480">
    <defs><marker id="mla-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g><line x1="30" y1="100" x2="120" y2="60" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah2)"/><line x1="30" y1="100" x2="130" y2="75" class="sb" stroke-width="2" marker-end="url(#mla-ah2)"/><text x="30" y="130" class="tg">cos ≈ 1: similar</text></g>
    <g><line x1="200" y1="100" x2="290" y2="100" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah2)"/><line x1="200" y1="100" x2="200" y2="20" class="sb" stroke-width="2" marker-end="url(#mla-ah2)"/><text x="190" y="130" class="tm">cos = 0: unrelated</text></g>
    <g><line x1="400" y1="80" x2="460" y2="80" stroke="currentColor" stroke-width="2" marker-end="url(#mla-ah2)"/><line x1="400" y1="80" x2="340" y2="80" class="sb" stroke-width="2" marker-end="url(#mla-ah2)"/><text x="345" y="130" class="tr">cos = −1: opposite</text></g>
  </svg><figcaption>Cosine similarity only looks at the angle between arrows, never their length.</figcaption></figure>
  <div class="fx" data-lang="py">print(A @ B, B @ C, A @ C)                 # dot products (@ between two vectors)
def cos(u, v):
    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))
print(round(cos(A, B), 3), round(cos(B, C), 3), round(cos(A, C), 3))
print(round(cos(B, 10 * B), 3))            # a 10x bigger house, same mix of size and rooms</div>
  <div class="fx" data-lang="text">5.0 12.0 5.0
0.981 0.923 0.981
1.0</div>
  <p>What the code does: <code>@</code> between two 1-D arrays is the dot product. <code>cos</code> divides it by both L2 lengths from section 02. The last line scales B by 10: the dot product grows 10×, but the cosine stays 1, because the direction did not change.</p>
  <p>The same idea at scale, with toy 3-number word embeddings: "cat" and "kitten" should point the same way, "car" elsewhere.</p>
  <div class="fx" data-lang="py">cat    = np.array([0.9, 0.8, 0.1])     # toy word embeddings
kitten = np.array([0.8, 0.9, 0.2])
car    = np.array([0.1, 0.2, 0.9])
print(round(cat @ kitten, 3), round(cat @ car, 3))
print(round(cos(cat, kitten), 3), round(cos(cat, car), 3))</div>
  <div class="fx" data-lang="text">1.46 0.34
0.99 0.303</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>a·b = Σ aᵢbᵢ = ‖a‖‖b‖cos θ</code>. Multiply matching parts and add; this also equals length of a × length of b × cos of the angle θ (theta) between them. So <code>cos θ = a·b / (‖a‖‖b‖)</code> is cosine similarity, from −1 to 1. Two vectors are <strong>perpendicular</strong> (orthogonal) when a·b = 0, a fact section 06 needs.</p>
  </div>
  <ul>
    <li><strong>Where in ML:</strong> semantic search and RAG retrieval (find documents whose vectors point the same way as the question), recommendation ("users like you"), attention scores (<code>QKᵀ</code> is a table of dot products).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Raw dot product rewards long vectors: B·C = 12 beats A·B = 5 only because B and C are bigger houses. A popular item with a big embedding matches everything. Normalise first (then dot = cosine) unless magnitude is meaningful.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: matrix × vector.</b> We can compare rows, but only one pair at a time. A pricing rule like "₹1 crore per 1000 sq ft plus ₹1 crore per room" is a dot product with one house. How do we apply it to every house in one go?</div>

  <h2 id="mla-mat"><span class="num">04</span>The Whole Table: Matrix × Vector</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A model's prediction for one house is a dot product: weights · features. With a million houses we don't want a million separate dot products in a Python loop. How do we price the whole table in one operation?</p>
  </div>
  <p><strong>Plain words:</strong> stack the houses into a matrix X and the weights into a vector w. <strong>X × w</strong> means "dot every row of X with w"; the answers form a new vector, one prediction per house.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop's price list. Each customer's basket is a row (how many of each item); the price list is the vector. The till multiplies each basket by the price list and adds up: one bill per customer. X·w is the till run on every basket at once.</p>
  </div>
  <p><strong>Traced on the houses</strong> with a first guess w = [1, 1] (₹1 crore per 1000 sq ft, ₹1 crore per room):</p>
  <ul>
    <li>A: [1, 1]·[1, 1] = 1 + 1 = <strong>2</strong> (true 2, error 0)</li>
    <li>B: [2, 3]·[1, 1] = 2 + 3 = <strong>5</strong> (true 4, error +1)</li>
    <li>C: [3, 2]·[1, 1] = 3 + 2 = <strong>5</strong> (true 6, error −1)</li>
  </ul>
  <p>A second guess w = [2, 0] (₹2 crore per 1000 sq ft, rooms ignored) gives 2, 4, 6: every error is 0.</p>
  <div class="fx" data-lang="py">w = np.array([1., 1.])          # first guess: Rs 1 crore per 1000 sq ft, Rs 1 crore per room
print(X @ w)                    # one prediction per house: each row . w
print(X @ w - y)                # errors: prediction - true price
w_good = np.array([2., 0.])     # another guess: Rs 2 crore per 1000 sq ft, rooms ignored
print(X @ w_good, X @ w_good - y)
print(X * w_good)               # trap: * is element-wise, NOT a prediction</div>
  <div class="fx" data-lang="text">[2. 5. 5.]
[ 0.  1. -1.]
[2. 4. 6.] [0. 0. 0.]
[[2. 0.]
 [4. 0.]
 [6. 0.]]</div>
  <p>What the code does: <code>X @ w</code> dots each row with w, so a (3, 2) table times a 2-vector gives a 3-vector of predictions. Subtracting <code>y</code> gives the errors. The last line is the classic bug: <code>X * w_good</code> multiplies cell by cell (column 1 by 2, column 2 by 0) and never adds across the row, so it returns a table, not predictions.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For X of shape (n, d) and w of length d, <code>Xw</code> is the n-vector with entry i = X[i]·w = Σⱼ X[i, j] wⱼ. Linear regression's prediction is exactly <code>ŷ = Xw</code> (ŷ, "y hat", is the prediction).</p>
  </div>
  <h3>The second reading: a matrix moves points</h3>
  <p>A matrix is also a <strong>machine that moves every point by the same rule</strong>, like a photo editor that stretches or rotates the whole picture. Feed in the x-axis arrow (1, 0) and you get the first column; feed in (0, 1) and you get the second column. So the columns say "where the axis arrows land", and that fixes where every point goes. X itself is such a machine: it takes a 2-number weight vector and returns 3 predictions; its columns [1, 2, 3] and [1, 3, 2] are what w = (1, 0) and w = (0, 1) produce.</p>
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
  <p>Chaining two moves: stretch S = [[2, 0], [0, 1]], then rotate R = [[0, −1], [1, 0]] (90° anticlockwise; its columns are where (1, 0) and (0, 1) land).</p>
  <figure class="viz"><svg viewBox="0 0 520 170" width="520">
    <defs><marker id="mla-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="30" y="80" width="50" height="50" class="fb sb"/><circle cx="80" cy="80" r="4" class="fr sr"/><text x="86" y="76">p = (1,1)</text><text x="30" y="155">start</text>
    <line x1="140" y1="105" x2="185" y2="105" stroke="currentColor" marker-end="url(#mla-ah3)"/><text x="138" y="96">S</text>
    <rect x="200" y="80" width="100" height="50" class="fg sg"/><circle cx="300" cy="80" r="4" class="fr sr"/><text x="268" y="70">(2,1)</text><text x="200" y="155">S: stretch x by 2</text>
    <line x1="330" y1="105" x2="375" y2="105" stroke="currentColor" marker-end="url(#mla-ah3)"/><text x="328" y="96">R</text>
    <rect x="410" y="80" width="50" height="50" class="ft st"/><circle cx="410" cy="80" r="4" class="fr sr"/><text x="380" y="70">(−1,1)</text><text x="400" y="155">R: rotate 90°</text>
    <line x1="460" y1="70" x2="460" y2="140" stroke="currentColor" opacity="0.4"/><text x="464" y="140" class="tm">y-axis</text>
  </svg><figcaption>A matrix is a function that moves every point. Read its columns as "where the x-axis and y-axis arrows land".</figcaption></figure>
  <div class="fx" data-lang="py">Sh = np.array([[1, 1], [0, 1]])          # a "shear"
print(Sh @ np.array([1, 0]), Sh @ np.array([0, 1]), Sh @ np.array([1, 1]))
p = np.array([1, 1])
S = np.array([[2, 0], [0, 1]])     # stretch x by 2
R = np.array([[0, -1], [1, 0]])    # rotate 90° anticlockwise
print(R @ S @ p)                   # stretch first, then rotate
print(S @ R @ p)                   # rotate first, then stretch
print(np.array_equal(R @ S, S @ R))</div>
  <div class="fx" data-lang="text">[1 0] [1 1] [2 1]
[-1  2]
[-2  1]
False</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Socks then shoes vs shoes then socks: same two operations, different result. <code>R @ S @ p</code> applies S first (read right to left; the matrix next to p acts first).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Order matters. Stretch-then-rotate put (1, 1) at (−1, 2); rotate-then-stretch put it at (−2, 1). And in numpy, <code>*</code> is element-wise: <code>X * w</code> is not <code>X @ w</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: matrix × matrix.</b> We priced every house with one weight vector. How do we try several weight vectors at once, chain several transformations, and compare the feature columns with each other?</div>

  <h2 id="mla-mul"><span class="num">05</span>Matrix × Matrix &amp; Transpose</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Matrix × vector applies one rule to every row. A neural layer applies 128 rules at once; solving for the best weights needs us to compare every feature column with every other. We need to multiply a table by a table.</p>
  </div>
  <p><strong>Plain words:</strong> put several weight vectors side by side as the columns of W. <strong>X × W</strong> computes X × (each column) and lays the answers side by side. Every output cell = one row of the left table · one column of the right table.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two estate agents with different pricing rules. Run the till of section 04 once per agent and put their price lists side by side: a table of (houses × agents). That table is X × W.</p>
  </div>
  <p><strong>Traced:</strong> W has columns [1, 1] (agent 1) and [2, 0] (agent 2). Row B · column 1 = 2 + 3 = 5; row B · column 2 = 4 + 0 = 4. The shape rule: (3 × <strong>2</strong>) @ (<strong>2</strong> × 2) → (3 × 2). The inner 2s (features of a house, weights per rule) must match.</p>
  <p><strong>Transpose</strong> Xᵀ flips the table: row i becomes column i, so Xᵀ is (2 × 3), one row per feature. Then <strong>XᵀX</strong> is (2 × 3) @ (3 × 2) = (2 × 2): every feature column dotted with every feature column.</p>
  <ul>
    <li>size · size = 1×1 + 2×2 + 3×3 = <strong>14</strong></li>
    <li>size · rooms = 1×1 + 2×3 + 3×2 = <strong>13</strong></li>
    <li>rooms · rooms = 1×1 + 3×3 + 2×2 = <strong>14</strong></li>
    <li>And <strong>Xᵀy</strong>: size · price = 2 + 8 + 18 = <strong>28</strong>; rooms · price = 2 + 12 + 12 = <strong>26</strong>.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <rect x="10" y="30" width="110" height="90" rx="4" class="fb sb"/>
    <rect x="14" y="62" width="102" height="24" rx="3" class="fr" opacity="0.5"/>
    <text x="65" y="52" text-anchor="middle">1    1</text><text x="65" y="79" text-anchor="middle">2    3</text><text x="65" y="106" text-anchor="middle">3    2</text>
    <text x="65" y="140" text-anchor="middle" class="tm">X (3 × 2)</text>
    <text x="133" y="80">@</text>
    <rect x="155" y="45" width="100" height="60" rx="4" class="ft st"/>
    <rect x="159" y="49" width="40" height="52" rx="3" class="fr" opacity="0.5"/>
    <text x="179" y="70" text-anchor="middle">1</text><text x="179" y="95" text-anchor="middle">1</text>
    <text x="229" y="70" text-anchor="middle">2</text><text x="229" y="95" text-anchor="middle">0</text>
    <text x="205" y="125" text-anchor="middle" class="tm">W (2 × 2)</text>
    <text x="268" y="80">=</text>
    <rect x="290" y="30" width="100" height="90" rx="4" class="fg sg"/>
    <rect x="294" y="62" width="40" height="24" rx="3" class="fr" opacity="0.5"/>
    <text x="314" y="52" text-anchor="middle">2</text><text x="366" y="52" text-anchor="middle">2</text>
    <text x="314" y="79" text-anchor="middle">5</text><text x="366" y="79" text-anchor="middle">4</text>
    <text x="314" y="106" text-anchor="middle">5</text><text x="366" y="106" text-anchor="middle">6</text>
    <text x="340" y="140" text-anchor="middle" class="tm">XW (3 × 2)</text>
    <text x="405" y="70" class="tr">row B · col 1</text><text x="405" y="86" class="tr">= 2 + 3 = 5</text>
  </svg><figcaption>The red row of X dotted with the red column of W gives the red cell. Inner sizes (2 features, 2 weights per column) must match.</figcaption></figure>
  <div class="fx" data-lang="py">W = np.column_stack([[1., 1.], [2., 0.]])   # two candidate weight vectors, as columns
print(X.shape, W.shape, (X @ W).shape)
print(X @ W)                    # column j = predictions of candidate j
print(X.T)                      # transpose: rows &lt;-&gt; columns
G = X.T @ X                     # (2x3) @ (3x2) -&gt; 2x2: features x features
print(G)
print(X.T @ y)                  # each feature column . prices</div>
  <div class="fx" data-lang="text">(3, 2) (2, 2) (3, 2)
[[2. 2.]
 [5. 4.]
 [5. 6.]]
[[1. 2. 3.]
 [1. 3. 2.]]
[[14. 13.]
 [13. 14.]]
[28. 26.]</div>
  <p>What the code does: <code>np.column_stack</code> puts the two weight vectors side by side as columns. <code>X @ W</code> follows the shape rule. <code>X.T</code> is the transpose. <code>X.T @ X</code> and <code>X.T @ y</code> are the two quantities section 06 needs; check them against the hand sums above.</p>
  <p>The same shape rule runs a neural-network layer: a batch of 32 images, each with 784 pixels, times a weight matrix with 784 inputs and 128 outputs.</p>
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
  <div class="fx" data-lang="py">batch = np.ones((32, 784))      # same rule at scale: 32 images, 784 pixels each
Wl = np.ones((784, 128))        # layer weights: 784 inputs -&gt; 128 units
print((batch @ Wl).shape)
try:
    Wl @ batch
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">(32, 128)
ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)-&gt;(n?,m?) (size 32 is different from 128)</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For A (n × k) and B (k × m), (AB)[i, j] = row i of A · column j of B, and AB is (n × m). Transpose: (Aᵀ)[i, j] = A[j, i]. Rules: <code>AB ≠ BA</code> in general (not commutative; often BA is not even a legal shape), <code>(AB)C = A(BC)</code> (associative), <code>(AB)ᵀ = BᵀAᵀ</code> (flip each and reverse the order). XᵀX is always square and symmetric (a mirror image across its diagonal).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shape errors are the most common linear-algebra bug in ML code. Before multiplying, write the shapes down: (3, 2) @ (2, 2) works, (2, 2) @ (3, 2) does not. And <code>A * B</code> is element-wise; silent broadcasting with <code>*</code> gives a wrong-shaped answer without any error.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: inverse, rank and the normal equations.</b> We can compute predictions for any weights we guess. But we guessed [2, 0]. Can we <em>solve</em> for the best weights directly, the way 2x = 6 is solved by dividing?</div>

  <h2 id="mla-inv"><span class="num">06</span>Solving for the Weights: Inverse, Rank &amp; Normal Equations</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want w such that Xw matches the prices y. With plain numbers, 2x = 6 is solved by dividing by 2. Matrices have no division. And X is 3 × 2: three equations (one per house) but only two unknowns, so in real noisy data no w fits every house exactly. What do we do?</p>
  </div>
  <p><strong>Plain words:</strong> (1) For a square matrix A, the <strong>inverse</strong> A⁻¹ is the "undo" machine: whatever A does, A⁻¹ reverses it. (2) When there are more equations than unknowns, ask for the w whose predictions are as close as possible to y. The best w leaves an error that is perpendicular to every feature column (no column can explain any more of it). Perpendicular means dot product 0 (section 03), which gives Xᵀ(y − Xw) = 0, i.e. the <strong>normal equations</strong> XᵀX·w = Xᵀy: a small square system we can solve.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your shadow on the floor at noon. The closest point on the floor to your head is straight below it: the line from your head to the shadow is perpendicular to the floor. Xw is the "shadow" of y on the space of all possible predictions, and the best one is the one straight below.</p>
  </div>
  <div class="flow"><span>x</span><span>A transforms it</span><span>A⁻¹ undoes it</span><span>x again (A⁻¹A = I)</span></div>
  <p><strong>Traced on the houses.</strong> From section 05, XᵀX = [[14, 13], [13, 14]] and Xᵀy = [28, 26].</p>
  <ol>
    <li><strong>Determinant</strong> of [[a, b], [c, d]] is ad − bc: 14×14 − 13×13 = 196 − 169 = <strong>27</strong>. Not zero, so an inverse exists. (Geometrically, the matrix scales areas by 27.)</li>
    <li><strong>2×2 inverse</strong> = (1/det) × [[d, −b], [−c, a]] = (1/27) × [[14, −13], [−13, 14]] = [[0.519, −0.481], [−0.481, 0.519]].</li>
    <li><strong>w = inverse × Xᵀy</strong>: first weight = (14×28 − 13×26)/27 = (392 − 338)/27 = 54/27 = <strong>2</strong>; second = (−13×28 + 14×26)/27 = (−364 + 364)/27 = <strong>0</strong>.</li>
  </ol>
  <p>The data itself says: ₹2 crore per 1000 sq ft, and rooms add nothing once you know size. That is exactly how the prices were made. Check the perpendicular condition for the bad guess w = [1, 1]: errors y − Xw = [0, −1, 1], and Xᵀ·errors = [0 − 2 + 3, 0 − 3 + 2] = [1, −1], not zero, so [1, 1] is not the best.</p>
  <div class="fx" data-lang="py">G, r = X.T @ X, X.T @ y                     # normal equations: G w = r
print(round(np.linalg.det(G), 3))           # 14*14 - 13*13
print(np.array([[14., -13.], [-13., 14.]]) / 27)   # hand formula for the inverse
print(np.linalg.inv(G))
print(np.linalg.solve(G, r))                # best weights: solve, don't invert
print(np.linalg.lstsq(X, y, rcond=None)[0]) # same answer, never forms X^T X
print(X.T @ (y - X @ np.array([1., 1.])))   # w=[1,1]: errors NOT perpendicular to columns</div>
  <div class="fx" data-lang="text">27.0
[[ 0.519 -0.481]
 [-0.481  0.519]]
[[ 0.519 -0.481]
 [-0.481  0.519]]
[2. 0.]
[2. 0.]
[ 1. -1.]</div>
  <p>What the code does: <code>det</code> and <code>inv</code> confirm the hand numbers. <code>np.linalg.solve(G, r)</code> finds w with G·w = r without forming the inverse. <code>lstsq</code> solves the least-squares problem straight from X (via a QR/SVD factorisation), never forming XᵀX, which is more accurate on messy data. The last line is the perpendicular check for w = [1, 1].</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Identity</strong> I: 1s on the diagonal, 0s elsewhere; Ix = x. <strong>Inverse</strong>: A⁻¹A = AA⁻¹ = I, exists only for square A with det(A) ≠ 0. <strong>Normal equations</strong>: the least-squares weights satisfy (XᵀX)w = Xᵀy, so w = (XᵀX)⁻¹Xᵀy when XᵀX is invertible. Here X is (n × d) data, y the n true answers, w the d weights.</p>
  </div>
  <div class="callout intu"><span class="label">Solve, don't invert</span>
    <p><code>solve</code> uses an LU factorisation (splitting A into two easy triangle-shaped matrices): about 3× fewer operations and smaller rounding error than forming <code>A⁻¹</code>. You almost never need the inverse itself, only <code>A⁻¹b</code>.</p>
  </div>
  <h3>Rank: when the answer is not unique</h3>
  <p>Suppose someone adds size again as a third column, in hundreds of square feet (10, 20, 30). The new column is just 10 × the size column. It brings no new information, so infinitely many weight combinations give the same predictions (more on size-in-hundreds, less on size-in-thousands).</p>
  <p><strong>Geometric view</strong> on a 2 × 2 case, L = [[1, 2], [2, 4]]: its columns (1, 2) and (2, 4) lie on the same line, so L squashes the whole flat page onto that line. Two different inputs, (1, 0) and (3, −1), land on the same output (1, 2): there is no way to undo, so no inverse, and the squashed area is 0, so det = 0.</p>
  <figure class="viz"><svg viewBox="0 0 480 130" width="480">
    <rect x="20" y="30" width="70" height="70" class="fg sg"/><text x="20" y="120">rank 2: plane → plane</text>
    <text x="115" y="70">vs</text>
    <rect x="160" y="30" width="70" height="70" class="fb sb"/>
    <line x1="245" y1="65" x2="280" y2="65" stroke="currentColor"/><text x="248" y="58" class="tm">squash</text>
    <line x1="300" y1="100" x2="400" y2="30" class="sr" stroke-width="3"/><text x="230" y="120" class="tr">rank 1: plane → line (info lost)</text>
  </svg><figcaption>A rank-deficient (singular) matrix flattens space. You can't un-flatten, so no inverse exists.</figcaption></figure>
  <div class="fx" data-lang="py">L = np.array([[1, 2], [2, 4]])              # 2nd column = 2 x 1st
print(L @ np.array([1, 0]), L @ np.array([3, -1]))
print(np.linalg.matrix_rank(L), round(np.linalg.det(L), 3))
X3 = np.column_stack([X, X[:, 0] * 10])     # add size again, in hundreds of sq ft
print(X3)
G3 = X3.T @ X3
print(np.linalg.matrix_rank(X3), np.linalg.matrix_rank(G3), f"{np.linalg.cond(G3):.1e}")
w3 = np.linalg.solve(G3 + 0.1 * np.eye(3), X3.T @ y)   # ridge: add 0.1 on the diagonal
print(np.linalg.matrix_rank(G3 + 0.1 * np.eye(3)), np.round(w3, 3), np.round(X3 @ w3, 3))</div>
  <div class="fx" data-lang="text">[1 2] [1 2]
1 0.0
[[ 1.  1. 10.]
 [ 2.  3. 20.]
 [ 3.  2. 30.]]
2 2 3.4e+16
3 [0.02  0.001 0.198] [2.    4.001 5.999]</div>
  <p>What the code does: <code>matrix_rank</code> counts independent directions. X3 has 3 columns but rank 2, and X3ᵀX3 (3 × 3) also has rank 2: singular. Its <strong>condition number</strong> (how badly a matrix amplifies rounding errors; 1 is perfect) is 3.4e16, i.e. "numerically infinite". Adding 0.1 on the diagonal (<strong>ridge</strong>) restores rank 3 and gives one sensible answer: 0.02 per 1000 sq ft plus 0.198 per 100 sq ft, which is 0.02 + 10 × 0.198 = 2.0 per 1000 sq ft in total, the same effect shared between the two copies. Predictions stay 2, 4, 6.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>rank</strong> of a matrix is the number of linearly independent columns (equivalently, rows): directions that survive the transformation. Columns that are combinations of other columns are <strong>linearly dependent</strong>. A square matrix with rank below its size is <strong>singular</strong>: det = 0, no inverse.</p>
  </div>
  <div class="callout trap"><span class="label">Where it bites in ML</span>
    <p>Duplicate or perfectly collinear features (size in two units, one-hot columns plus an intercept) make <code>XᵀX</code> singular, so plain linear regression has no unique answer, and nearly collinear ones make the weights wild. Fix: drop the duplicate, or use ridge, which adds <code>λI</code> and makes XᵀX + λI invertible for any λ &gt; 0 (see <a class="xref" data-note="ml_ridge_lasso">Ridge &amp; Lasso</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: eigenvectors.</b> We solved with XᵀX, but it is still a black box of four numbers. Why did 13 (size and rooms overlap) matter, and what does this matrix actually <em>do</em> to a weight vector? Is there a direction it treats specially?</div>

  <h2 id="mla-eig"><span class="num">07</span>Eigenvectors &amp; Eigenvalues</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A 2 × 2 matrix turns most arrows to a new angle and stretches them. That makes it hard to "see" what it does. Are there special directions where the matrix does something simple, so we can describe the whole matrix by a few numbers?</p>
  </div>
  <p><strong>Plain words:</strong> an <strong>eigenvector</strong> of a square matrix is a direction the matrix does not turn; it only stretches (or shrinks, or flips) it. The stretch factor is the <strong>eigenvalue</strong>. Along its eigenvectors, a complicated matrix is just "multiply by a number".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hold a rubber sheet and pull it along one diagonal. Most lines drawn on the sheet get turned to a new angle. A line drawn exactly along the pull only gets longer; it keeps its direction. That line is an eigenvector.</p>
  </div>
  <p><strong>Traced on XᵀX = [[14, 13], [13, 14]]</strong> (each output = row · input):</p>
  <ul>
    <li>(1, 0) → (14, 13). Direction changed: turned.</li>
    <li>(1, 1) → (14 + 13, 13 + 14) = (27, 27) = <strong>27</strong> × (1, 1). Same direction, 27 times longer.</li>
    <li>(1, −1) → (14 − 13, 13 − 14) = (1, −1) = <strong>1</strong> × (1, −1). Same direction, same length.</li>
  </ul>
  <p><strong>What it means for the houses:</strong> moving the weights along (1, 1) (raise both the size weight and the room weight) changes the predictions a lot: X·(1, 1) = [2, 5, 5]. Moving along (1, −1) (raise one, lower the other) barely changes them: X·(1, −1) = [0, −1, 1]. Size and rooms overlap (that's the 13), so trading one for the other is almost invisible in the predictions. That 27 : 1 ratio is why the loss surface in <a class="xref" data-note="m_calculus">Calculus</a> is a long narrow valley, and why plain gradient descent zig-zags in <a class="xref" data-note="m_optimization">Optimization</a>.</p>
  <div class="fx" data-lang="py">for v in ([1, 0], [1, 1], [1, -1]):
    print(v, "-&gt;", G @ np.array(v))
vals, vecs = np.linalg.eigh(G)     # eigh: for symmetric matrices
print(vals)
print(vecs)                        # columns are eigenvectors (length 1)
print(X @ np.array([1., -1.]), X @ np.array([1., 1.]))   # what each direction does to predictions</div>
  <div class="fx" data-lang="text">[1, 0] -&gt; [14. 13.]
[1, 1] -&gt; [27. 27.]
[1, -1] -&gt; [ 1. -1.]
[ 1. 27.]
[[-0.707  0.707]
 [ 0.707  0.707]]
[ 0. -1.  1.] [2. 5. 5.]</div>
  <p>What the code does: the loop applies G to three directions, matching the hand work. <code>np.linalg.eigh</code> (for symmetric matrices) returns eigenvalues smallest first and unit-length eigenvectors as <em>columns</em>: (1, 1)/√2 = (0.707, 0.707) for 27, and (−0.707, 0.707), the (1, −1) direction with its sign flipped, for 1. The last line shows the effect of each direction on the predictions.</p>
  <figure class="viz"><svg viewBox="0 0 400 230" width="400">
    <defs><marker id="mla-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
    <marker id="mla-ah4r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <circle cx="160" cy="150" r="30" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
    <ellipse cx="160" cy="150" rx="110" ry="14" transform="rotate(-45 160 150)" class="fb sb"/>
    <line x1="160" y1="150" x2="230" y2="80" class="sr" stroke-width="2.5" marker-end="url(#mla-ah4r)"/>
    <line x1="160" y1="150" x2="174" y2="164" class="sr" stroke-width="2.5" marker-end="url(#mla-ah4r)"/>
    <text x="234" y="76" class="tr">(1,1): stretched ×27</text>
    <text x="180" y="186" class="tr">(1,−1): kept ×1</text>
    <text x="10" y="20" class="tm">(drawn shrunk: the long axis would be 27× the short one)</text>
  </svg><figcaption>Dashed circle = unit vectors; blue = where XᵀX sends them (scaled down to fit). Along (1, 1) it stretches by 27, along (1, −1) by only 1: a very thin ellipse.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>Av = λv</code>: "A times v gives the same v, just scaled". <strong>v</strong> (non-zero) = a direction A doesn't turn. <strong>λ</strong> (lambda) = the stretch along it (negative = flips, 0 = squashed flat, which means A is singular). A symmetric matrix (like XᵀX or a covariance matrix) always has real eigenvalues and perpendicular eigenvectors.</p>
  </div>
  <table class="tbl">
    <tr><th>Where in ML</th><th>What the eigen-stuff means</th></tr>
    <tr><td>PCA</td><td>Eigenvectors of the covariance = directions of most spread (section 09)</td></tr>
    <tr><td>Optimization</td><td>Eigenvalues of the Hessian (for our loss: (2/3)·XᵀX, eigenvalues 18 and 0.67) = curvature; big ratio = slow, zig-zag gradient descent</td></tr>
    <tr><td>Singular XᵀX</td><td>An eigenvalue of 0 = a direction that changes nothing = rank deficiency (section 06)</td></tr>
    <tr><td>RNNs</td><td>Repeated multiply by W: |λ| &gt; 1 explodes, |λ| &lt; 1 vanishes</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Eigenvectors have no fixed sign or length: v and −v are both valid (numpy gave (−0.707, 0.707) for the (1, −1) direction). Never compare PCA components across libraries without allowing a sign flip.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SVD.</b> Eigenvectors need a square matrix that maps a space to itself. Our data X is 3 × 2: it maps 2 weights to 3 predictions, so "a direction it doesn't turn" makes no sense. Can <em>any</em> matrix be broken into simple stretches?</div>

  <h2 id="mla-svd"><span class="num">08</span>SVD: Any Matrix, Any Shape</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Real data tables are tall and thin (many rows, few columns), not square. We still want their "natural directions" and how important each one is, to compress the table or find hidden patterns. Eigenvectors can't be applied to X directly.</p>
  </div>
  <p><strong>Plain words:</strong> any matrix, of any shape, can be split into three simple moves: a rotation (Vᵀ), a stretch along the axes (Σ), and another rotation (U). This is the <strong>Singular Value Decomposition</strong>, M = UΣVᵀ. The stretch factors, sorted largest first, are the <strong>singular values</strong>: how important each hidden pattern is.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Every chai a stall sells is a mix of a few base flavours: ginger, cardamom, sugar. SVD finds the base flavours (V), how strong each one is overall (Σ), and each cup's recipe (U). Drop the weakest flavours and the chai tastes almost the same.</p>
  </div>
  <div class="flow"><span>Vᵀ: rotate</span><span>Σ: stretch each axis</span><span>U: rotate</span><span>= any matrix M</span></div>
  <p><strong>Traced on X.</strong> The input directions of X's SVD are the eigenvectors of XᵀX from section 07, and the singular values are the square roots of its eigenvalues:</p>
  <ul>
    <li>v₁ = (1, 1)/√2. X·v₁ = [2, 5, 5]/√2, whose length is √(4 + 25 + 25)/√2 = √27 = <strong>σ₁ = 5.196</strong>. Then u₁ = X·v₁ / σ₁ = [0.272, 0.680, 0.680].</li>
    <li>v₂ = (1, −1)/√2. X·v₂ = [0, −1, 1]/√2, length <strong>σ₂ = 1</strong>, u₂ = [0, −0.707, 0.707].</li>
    <li>Energy share σᵢ² / Σσ²: 27 / 28 = <strong>96.4%</strong> and 1 / 28 = 3.6%.</li>
    <li>Rank-1 copy σ₁u₁v₁ᵀ: every house becomes "overall bigness" with an equal size/rooms mix: A → [1, 1], B → [2.5, 2.5], C → [2.5, 2.5]. B and C differ only in the weak second pattern, the size-vs-rooms trade-off.</li>
  </ul>
  <div class="fx" data-lang="py">U, s, Vt = np.linalg.svd(X, full_matrices=False)
sg = np.sign(Vt[:, 0]); U, Vt = U * sg, Vt * sg[:, None]   # signs are arbitrary: make them readable
print(U.shape, s.shape, Vt.shape)
print(s, s**2)                     # singular values; squared = eigenvalues of X^T X
print(Vt)                          # rows = right singular vectors
print(np.round(U, 3) + 0.0)          # + 0.0 turns -0.0 into 0.0
print(np.allclose(U @ np.diag(s) @ Vt, X))
X1 = s[0] * np.outer(U[:, 0], Vt[0])    # keep only the top pattern (rank 1)
print(X1)
print(np.round(s**2 / (s**2).sum(), 3)) # share of "energy"</div>
  <div class="fx" data-lang="text">(3, 2) (2,) (2, 2)
[5.196 1.   ] [27.  1.]
[[ 0.707  0.707]
 [ 0.707 -0.707]]
[[ 0.272  0.   ]
 [ 0.68  -0.707]
 [ 0.68   0.707]]
True
[[1.  1. ]
 [2.5 2.5]
 [2.5 2.5]]
[0.964 0.036]</div>
  <p>What the code does: <code>np.linalg.svd(X, full_matrices=False)</code> returns U (3 × 2), the singular values s and Vᵀ (2 × 2). Signs of singular vectors are arbitrary, so the second line flips them to read positively (it does not change the product). <code>allclose</code> confirms UΣVᵀ rebuilds X. <code>np.outer</code> builds the rank-1 copy from the top pattern.</p>
  <p>The same idea at scale: a ratings table, 4 users × 3 movies, keep only the top 2 patterns and rebuild.</p>
  <div class="fx" data-lang="py">M = np.array([[5., 5., 1.],        # 4 users x 3 movies
              [4., 5., 1.],        # (two action fans,
              [1., 1., 5.],        #  two romance fans)
              [1., 2., 4.]])
Um, sm, Vtm = np.linalg.svd(M, full_matrices=False)
print(sm)
M2 = Um[:, :2] @ np.diag(sm[:2]) @ Vtm[:2]          # keep top-2 only
print(np.round(M2, 1))
print(round(np.linalg.norm(M - M2) / np.linalg.norm(M), 3))
print(np.round(sm**2 / (sm**2).sum(), 3))</div>
  <div class="fx" data-lang="text">[10.491  5.514  0.733]
[[4.7 5.3 1. ]
 [4.3 4.8 1. ]
 [0.8 1.2 5. ]
 [1.3 1.7 4. ]]
0.062
[0.781 0.216 0.004]</div>
  <p>Two "taste" directions (action, romance) hold 78.1% + 21.6% = 99.6% of the energy; the rank-2 copy rebuilds the ratings with 6% error.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>M = UΣVᵀ</code> for any (n × d) matrix M. <strong>V</strong> (d × d): orthonormal input directions (patterns over columns). <strong>Σ</strong>: diagonal, singular values σ₁ ≥ σ₂ ≥ … ≥ 0. <strong>U</strong> (n × d): how much of each pattern every row has. Facts: σᵢ² are the eigenvalues of MᵀM; the number of non-zero σ is the rank; keeping the top k terms gives the best rank-k approximation (Eckart–Young).</p>
  </div>
  <ul>
    <li><strong>Where in ML:</strong> recommender latent factors (latent = hidden; see <a class="xref" data-note="ml_mf">Matrix Factorization</a>), LSA topic models, compressing weight matrices (LoRA is a low-rank update), <code>lstsq</code>, and how sklearn's PCA is actually computed.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Eigen-decomposition works only for square matrices (and is cleanest for symmetric ones). SVD works for any shape. If someone asks you to "eigen-decompose" a 1000 × 50 data matrix, the answer is SVD (or eigen-decompose the 50 × 50 XᵀX, which squares the condition number and loses accuracy).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: PCA.</b> SVD found that one pattern holds 96% of the energy of X. But "energy" here includes the plain size of the numbers (all houses are positive, far from 0). What we usually want is the direction of most <em>spread</em> between houses, so we can replace two columns with one. That needs the data centred first.</div>

  <h2 id="mla-pca"><span class="num">09</span>PCA by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Size and rooms move together (the 13 in XᵀX). Real datasets have hundreds of columns, many repeating the same information. Can we replace two columns by one number per house, keeping as much of the differences between houses as possible?</p>
  </div>
  <p><strong>Plain words:</strong> find the direction along which the houses are most spread out, then describe each house by just its position along that direction. This is <strong>Principal Component Analysis (PCA)</strong>. The best direction is <strong>PC1</strong>; the next best, at a right angle to it, is PC2, and so on.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Taking a photo of a cricket bat. Shoot it from the side and you see its full length. Shoot it end-on and it looks like a small rectangle. PCA picks the camera angle that shows the most spread, so the flat photo loses the least.</p>
  </div>
  <p>Two words first (see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a> and <a class="xref" data-note="st_correlation">Correlation</a>). <strong>Variance</strong>: how much a column jumps around its average. <strong>Covariance</strong>: whether two columns go up and down together (positive), opposite (negative), or unrelated (near 0). The <strong>covariance matrix</strong> holds variances on the diagonal and covariances off it; it is XᵀX/(n − 1) of the centred table.</p>
  <p><strong>Traced on the houses:</strong></p>
  <ol>
    <li><strong>Centre:</strong> column means are size 2, rooms 2. Subtract: A → (−1, −1), B → (0, 1), C → (1, 0).</li>
    <li><strong>Covariance:</strong> var(size) = ((−1)² + 0² + 1²)/(3 − 1) = 2/2 = 1; var(rooms) = ((−1)² + 1² + 0²)/2 = 1; cov = ((−1)(−1) + 0×1 + 1×0)/2 = 0.5. So C = [[1, 0.5], [0.5, 1]].</li>
    <li><strong>Eigenvectors of C:</strong> same pattern as section 07: (1, 1) → (1.5, 1.5), eigenvalue <strong>1.5</strong>; (1, −1) → (0.5, −0.5), eigenvalue <strong>0.5</strong>.</li>
    <li><strong>Explained variance:</strong> 1.5 / (1.5 + 0.5) = <strong>75%</strong> on PC1.</li>
    <li><strong>Project:</strong> PC1 at length 1 is (0.707, 0.707). Each house's single number = its centred row · PC1: A = (−1 − 1)×0.707 = <strong>−1.414</strong>, B = (0 + 1)×0.707 = <strong>0.707</strong>, C = (1 + 0)×0.707 = <strong>0.707</strong>.</li>
  </ol>
  <p>PC1 is "overall bigness". A is small; B and C are equally big, they differ only along PC2 (more rooms vs more floor area), which carries the other 25%.</p>
  <div class="fx" data-lang="py">Xc = X - X.mean(axis=0)            # 1. centre: subtract column means (2, 2)
Cv = Xc.T @ Xc / (len(X) - 1)      # 2. covariance matrix
lam, V = np.linalg.eigh(Cv)        # 3. eigen-decompose
order = np.argsort(lam)[::-1]      # 4. sort big -&gt; small
lam, V = lam[order], V[:, order]
pc1 = V[:, 0] * np.sign(V[0, 0])   # fix the sign so PC1 points "bigger"
print(Xc)
print(Cv)
print(lam, lam / lam.sum())
print(pc1, Xc @ pc1)               # 5. project: one number per house
from sklearn.decomposition import PCA
pca = PCA(n_components=1).fit(X)
print(pca.components_, pca.explained_variance_, pca.explained_variance_ratio_)
print(pca.transform(X).ravel())</div>
  <div class="fx" data-lang="text">[[-1. -1.]
 [ 0.  1.]
 [ 1.  0.]]
[[1.  0.5]
 [0.5 1. ]]
[1.5 0.5] [0.75 0.25]
[0.707 0.707] [-1.414  0.707  0.707]
[[0.707 0.707]] [1.5] [0.75]
[-1.414  0.707  0.707]</div>
  <p>What the code does: steps 1–5 by hand, then sklearn's <code>PCA</code>, which centres internally and gives the same direction, variance 1.5, ratio 0.75 and the same scores. The sign fix in step 4 matters only for reading: eigenvectors can come out as −v.</p>
  <figure class="viz"><svg viewBox="0 0 390 200" width="390">
    <defs><marker id="mla-ah5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <g class="fb sb"><circle cx="228" cy="61" r="3"/><circle cx="47" cy="164" r="3"/><circle cx="172" cy="109" r="3"/><circle cx="131" cy="128" r="3"/><circle cx="126" cy="112" r="3"/><circle cx="138" cy="109" r="3"/><circle cx="74" cy="160" r="3"/><circle cx="136" cy="108" r="3"/><circle cx="139" cy="163" r="3"/><circle cx="266" cy="14" r="3"/><circle cx="166" cy="115" r="3"/><circle cx="150" cy="138" r="3"/><circle cx="137" cy="114" r="3"/><circle cx="120" cy="119" r="3"/><circle cx="114" cy="142" r="3"/><circle cx="144" cy="132" r="3"/><circle cx="168" cy="97" r="3"/><circle cx="142" cy="117" r="3"/><circle cx="175" cy="70" r="3"/><circle cx="137" cy="107" r="3"/><circle cx="149" cy="107" r="3"/><circle cx="199" cy="58" r="3"/><circle cx="172" cy="98" r="3"/><circle cx="138" cy="133" r="3"/><circle cx="139" cy="108" r="3"/><circle cx="166" cy="90" r="3"/><circle cx="224" cy="63" r="3"/><circle cx="146" cy="126" r="3"/></g>
    <line x1="150" y1="110" x2="241" y2="48" class="sr" stroke-width="2.5" marker-end="url(#mla-ah5)"/>
    <line x1="150" y1="110" x2="130" y2="81" class="sr" stroke-width="2" marker-end="url(#mla-ah5)"/>
    <text x="246" y="46" class="tr">PC1: most spread</text><text x="70" y="76" class="tr">PC2</text>
  </svg><figcaption>PCA at scale: new perpendicular axes, PC1 along the longest stretch of the cloud, PC2 across it.</figcaption></figure>
  <div class="flow"><span>Centre X</span><span>Covariance C = XᵀX/(n−1)</span><span>Eigenvectors of C</span><span>Sort by eigenvalue</span><span>Project onto top k</span></div>
  <p>The same five steps at scale: height and weight of 200 people, compared with sklearn.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
h = rng.normal(170, 10, 200)                  # height (cm)
wt = 0.9 * h - 90 + rng.normal(0, 4, 200)     # weight tracks height
P = np.column_stack([h, wt])
Pc = P - P.mean(axis=0)
lamp, Vp = np.linalg.eigh(Pc.T @ Pc / (len(P) - 1))
lamp, Vp = lamp[::-1], Vp[:, ::-1]
print(lamp, lamp / lamp.sum())
pp = PCA(n_components=2).fit(P)
print(pp.explained_variance_, pp.explained_variance_ratio_)
print(pp.components_)</div>
  <div class="fx" data-lang="text">[171.206   9.129] [0.949 0.051]
[171.206   9.129] [0.949 0.051]
[[ 0.719  0.695]
 [-0.695  0.719]]</div>
  <p>Same eigenvalues by hand and in sklearn, a 95% / 5% split: one number, "overall body size" ≈ (0.72, 0.70), keeps 95% of the spread. numpy gives eigenvectors as <strong>columns</strong>, sklearn's <code>components_</code> as <strong>rows</strong>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>PCA on n × d data X: centre (X_c = X − column means), covariance C = X_cᵀX_c/(n − 1), eigen-decompose C = VΛVᵀ, sort eigenvalues λ₁ ≥ λ₂ ≥ …, scores Z = X_c V_k. <strong>Explained variance ratio</strong> = λᵢ / Σλ. SVD link: if X_c = UΣVᵀ then the PCs are V and λᵢ = σᵢ²/(n − 1).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Standardise features before PCA when units differ. With size in square feet (section 02), the size column's variance would be a million times bigger and PC1 would simply be "size", whatever the data looks like. And always centre: SVD of the uncentred X (section 08) found "distance from zero" (96%), not spread between houses (75%).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: where it shows up in ML.</b> We have every piece. Where exactly do they appear in the models you will build?</div>

  <h2 id="mla-ml"><span class="num">10</span>Where It Shows Up in ML</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We used three houses. Do the same operations really sit inside regression on 100 noisy rows, word embeddings and neural networks?</p>
  </div>
  <div class="cards">
    <div><b>Linear regression</b><p>Normal equations: solve (XᵀX)w = Xᵀy.</p><small>Section 06; one linear solve gives the best weights</small></div>
    <div><b>Embeddings</b><p>Words, users, images as vectors.</p><small>Section 03; similarity = cosine; search = top-k dot products</small></div>
    <div><b>Neural layers</b><p>A dense layer is ReLU(XW + b).</p><small>Section 05; GPUs exist to do matmuls fast</small></div>
    <div><b>Dimensionality reduction</b><p>PCA / SVD keep the top directions.</p><small>Sections 08–09; compression, denoising, plots</small></div>
  </div>
  <p><strong>Regression at scale.</strong> Our three houses fit exactly. Real prices are noisy: with 100 rows and 3 unknown weights, no w fits every row, and the normal equations give the best compromise (smallest squared error). A column of 1s is added so the model can learn a constant (the intercept or bias). A <strong>dense layer</strong> is one matrix multiply plus a bias, then a <strong>nonlinearity</strong> (a bend, like ReLU = "replace negatives with 0").</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
rng = np.random.default_rng(0)
Xr = rng.normal(size=(100, 2))                 # same normal equations, 100 noisy rows
yr = 1.5 + Xr @ np.array([2.0, -3.0]) + rng.normal(0, 0.1, 100)
Xb = np.column_stack([np.ones(100), Xr])       # bias column of 1s
print(np.linalg.solve(Xb.T @ Xb, Xb.T @ yr))   # (XᵀX) w = Xᵀy
m = LinearRegression().fit(Xr, yr)
print(round(m.intercept_, 3), m.coef_)
xb = rng.normal(size=(4, 3))                   # a dense layer: 4 samples, 3 features
Wd, bd = rng.normal(size=(3, 5)), np.zeros(5)  # 3 -&gt; 5 units
print(np.maximum(0, xb @ Wd + bd).shape)       # ReLU(XW + b)</div>
  <div class="fx" data-lang="text">[ 1.484  1.989 -2.983]
1.484 [ 1.989 -2.983]
(4, 5)</div>
  <p>The hand-rolled solve recovers the true values (1.5, 2, −3) almost exactly and matches sklearn to 3 decimals. The layer turned 4 samples × 3 features into 4 samples × 5 outputs, as the shape rule predicts. Solving costs about O(n·d² + d³); for millions of rows or features, gradient descent replaces the solve: that is where <a class="xref" data-note="m_calculus">Calculus</a> and <a class="xref" data-note="m_optimization">Optimization</a> take over.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Without the nonlinearity, stacking layers is useless: <code>(X W₁) W₂ = X (W₁W₂)</code>, and W₁W₂ is just one matrix. Ten linear layers = one linear layer.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We built ten ideas, each fixing the gap left by the one before. How do they fit together as one system?</div>

  <h2 id="mla-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Vector, norm, dot product, matrix product, transpose, inverse, rank, eigenvector, SVD, PCA: a list of separate tricks, or one idea grown in steps?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="mla-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="110" height="46" rx="7" class="fb sb"/><text x="65" y="39" text-anchor="middle" font-size="11.5" font-weight="700">vector</text><text x="65" y="56" text-anchor="middle" class="tm" font-size="10">B = [2, 3]</text>
<line x1="120" y1="43" x2="138" y2="43" stroke="currentColor" marker-end="url(#mla-a9)"/>
<rect x="140" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="200" y="39" text-anchor="middle" font-size="11.5" font-weight="700">dot product</text><text x="200" y="56" text-anchor="middle" class="tm" font-size="10">B·C = 12</text>
<line x1="200" y1="66" x2="200" y2="90" stroke="currentColor" marker-end="url(#mla-a9)"/>
<rect x="140" y="92" width="120" height="46" rx="7" class="fb sb"/><text x="200" y="111" text-anchor="middle" font-size="11" font-weight="700">norm, cosine</text><text x="200" y="128" text-anchor="middle" class="tm" font-size="10">√(v·v); 0.92</text>
<line x1="260" y1="43" x2="278" y2="43" stroke="currentColor" marker-end="url(#mla-a9)"/>
<rect x="280" y="20" width="130" height="46" rx="7" class="fg sg"/><text x="345" y="39" text-anchor="middle" font-size="11.5" font-weight="700">X·w (many dots)</text><text x="345" y="56" text-anchor="middle" class="tm" font-size="10">[2, 5, 5]</text>
<line x1="410" y1="43" x2="428" y2="43" stroke="currentColor" marker-end="url(#mla-a9)"/>
<rect x="430" y="20" width="130" height="46" rx="7" class="fg sg"/><text x="495" y="39" text-anchor="middle" font-size="11.5" font-weight="700">XᵀX, Xᵀy</text><text x="495" y="56" text-anchor="middle" class="tm" font-size="10">[[14,13],[13,14]]</text>
<line x1="560" y1="43" x2="578" y2="43" stroke="currentColor" marker-end="url(#mla-a9)"/>
<rect x="580" y="20" width="130" height="46" rx="7" class="fg sg"/><text x="645" y="39" text-anchor="middle" font-size="11.5" font-weight="700">solve (det 27)</text><text x="645" y="56" text-anchor="middle" class="tm" font-size="10">w = [2, 0]</text>
<line x1="645" y1="66" x2="645" y2="90" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#mla-a9)"/>
<rect x="580" y="92" width="130" height="46" rx="7" class="fr sr"/><text x="645" y="111" text-anchor="middle" font-size="11" font-weight="700">rank &lt; d → singular</text><text x="645" y="128" text-anchor="middle" class="tm" font-size="10">fix: + λI (ridge)</text>
<line x1="495" y1="66" x2="495" y2="170" stroke="currentColor" marker-end="url(#mla-a9)"/>
<rect x="430" y="172" width="130" height="46" rx="7" class="ft st"/><text x="495" y="191" text-anchor="middle" font-size="11.5" font-weight="700">eigen of XᵀX</text><text x="495" y="208" text-anchor="middle" class="tm" font-size="10">27 on (1,1), 1 on (1,−1)</text>
<line x1="430" y1="195" x2="412" y2="195" stroke="currentColor" marker-end="url(#mla-a9)"/>
<rect x="280" y="172" width="130" height="46" rx="7" class="ft st"/><text x="345" y="191" text-anchor="middle" font-size="11.5" font-weight="700">SVD of X</text><text x="345" y="208" text-anchor="middle" class="tm" font-size="10">σ = √27, 1</text>
<line x1="280" y1="195" x2="262" y2="195" stroke="currentColor" marker-end="url(#mla-a9)"/>
<rect x="130" y="172" width="130" height="46" rx="7" class="ft st"/><text x="195" y="191" text-anchor="middle" font-size="11.5" font-weight="700">PCA (centred)</text><text x="195" y="208" text-anchor="middle" class="tm" font-size="10">PC1 75%</text>
<line x1="645" y1="138" x2="645" y2="250" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#mla-a9)"/>
<line x1="495" y1="218" x2="495" y2="250" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#mla-a9)"/>
<rect x="430" y="252" width="280" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="570" y="276" text-anchor="middle" font-size="10.5">Calculus: Hessian = (2/3)XᵀX → narrow valley 27 : 1</text>
<text x="10" y="250" font-size="11" class="tm">Row 1: everything is a dot product.</text>
<text x="10" y="268" font-size="11" class="tm">Right column: solving for weights.</text>
<text x="10" y="286" font-size="11" class="tm">Row 3: the natural directions of the table.</text>
</svg><figcaption>Every idea grows from the dot product. Many dots make a matrix product; the matrix XᵀX both solves for the weights (normal equations) and, through its eigenvectors, gives SVD and PCA. Its eigenvalue ratio returns in Calculus as the shape of the loss valley.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same three houses</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Vector</td><td>an ordered list</td><td>how do I store one row?</td><td>B = [2, 3]</td><td>always: every data point</td></tr>
    <tr><td>L2 norm</td><td>√(dot with itself)</td><td>how big is it?</td><td>‖B‖ = 3.606</td><td>lengths, ridge, clipping</td></tr>
    <tr><td>Distance</td><td>norm of a difference</td><td>how far apart are two rows?</td><td>B–C 1.414, A–B 2.236</td><td>kNN, k-means (after scaling)</td></tr>
    <tr><td>Dot product</td><td>multiply matching parts, add</td><td>how much do two arrows agree?</td><td>B·C = 12</td><td>scores, attention, predictions</td></tr>
    <tr><td>Cosine</td><td>dot ÷ both norms</td><td>same mix, any size?</td><td>cos(B, C) 0.923, cos(A, B) 0.981</td><td>embeddings, text, recommenders</td></tr>
    <tr><td>X·w</td><td>one dot per row</td><td>predict every row at once</td><td>X·[1, 1] = [2, 5, 5]</td><td>linear models, layers</td></tr>
    <tr><td>Matrix product, transpose</td><td>row · column for every pair</td><td>many rules at once; compare features</td><td>XᵀX = [[14, 13], [13, 14]], Xᵀy = [28, 26]</td><td>layers, Gram matrices, covariance</td></tr>
    <tr><td>Determinant, inverse</td><td>ad − bc; (1/det)[[d, −b], [−c, a]]</td><td>can the transformation be undone?</td><td>det 27; inverse (1/27)[[14, −13], [−13, 14]]</td><td>theory; in code use solve</td></tr>
    <tr><td>Normal equations</td><td>error ⟂ columns: Xᵀ(y − Xw) = 0</td><td>which weights fit best?</td><td>w = [2, 0]</td><td>small d; else GD or lstsq</td></tr>
    <tr><td>Rank</td><td>independent columns</td><td>is the answer unique?</td><td>X: 2; with size twice: still 2 of 3</td><td>check for duplicate features</td></tr>
    <tr><td>Eigenvectors</td><td>Av = λv (square A)</td><td>which directions only stretch?</td><td>27 on (1, 1), 1 on (1, −1)</td><td>PCA, curvature, stability</td></tr>
    <tr><td>SVD</td><td>eigen of XᵀX and XXᵀ</td><td>natural directions of any matrix?</td><td>σ = 5.196, 1; 96.4% energy</td><td>compression, recommenders, lstsq</td></tr>
    <tr><td>PCA</td><td>centre + covariance + eigen</td><td>one number instead of two columns?</td><td>PC1 (0.707, 0.707), 75%; scores −1.41, 0.71, 0.71</td><td>visualise, compress, de-noise</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>everything is dot products, organised.</strong> A norm is a vector dotted with itself; cosine is a scaled dot; a matrix product is a table of dots; XᵀX is every feature dotted with every feature; the normal equations say "the error has zero dot product with every feature"; and eigenvectors, SVD and PCA find the directions in which that table of dots is simplest. The 27 : 1 eigenvalue ratio of our three houses will reappear as the shape of the loss valley in Calculus and the zig-zag of gradient descent in Optimization.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="mla-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: three houses, X = [[1, 1], [2, 3], [3, 2]] (size in 1000 sq ft, rooms), prices y = [2, 4, 6] (₹ crore).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our houses</th><th>Weakness → next</th></tr>
    <tr><td>Vector</td><td>how do I store one row?</td><td>B = [2, 3]</td><td>can't compare rows → norms</td></tr>
    <tr><td>Norm, distance</td><td>how big, how far apart?</td><td>‖B‖ 3.606; B–C 1.414; A–B 2.236</td><td>mixes size with kind → cosine</td></tr>
    <tr><td>Dot, cosine</td><td>same mix, any size?</td><td>B·C 12; cos 0.923; cos(A, B) 0.981</td><td>one row at a time → X·w</td></tr>
    <tr><td>X·w</td><td>predict every row at once?</td><td>X·[1, 1] = [2, 5, 5], errors [0, 1, −1]</td><td>one rule only → matrix product</td></tr>
    <tr><td>Matrix product, transpose</td><td>many rules; compare features?</td><td>XᵀX [[14, 13], [13, 14]], Xᵀy [28, 26]</td><td>no way to solve yet → inverse</td></tr>
    <tr><td>Inverse, normal equations, rank</td><td>which weights are best? unique?</td><td>det 27, w = [2, 0]; duplicate column → rank 2 of 3</td><td>XᵀX is a black box → eigen</td></tr>
    <tr><td>Eigenvectors</td><td>which directions only stretch?</td><td>27 on (1, 1); 1 on (1, −1)</td><td>square only → SVD</td></tr>
    <tr><td>SVD</td><td>natural directions of any matrix?</td><td>σ 5.196, 1; 96.4% energy</td><td>uncentred → PCA</td></tr>
    <tr><td>PCA</td><td>one number instead of two columns?</td><td>C [[1, .5], [.5, 1]]; PC1 75%</td><td>→ <a class="xref" data-note="ml_pca">PCA</a>, <a class="xref" data-note="m_calculus">Calculus</a></td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>L2, L1, L∞ norms</td><td>√(Σxᵢ²), Σ|xᵢ|, max|xᵢ|</td><td>xᵢ = i-th entry; Σ = add over all entries</td></tr>
    <tr><td>Distance</td><td>‖a − b‖</td><td>norm of the difference</td></tr>
    <tr><td>Dot product</td><td>a·b = Σaᵢbᵢ = ‖a‖‖b‖cos θ</td><td>θ = angle between the arrows; 0 ⇔ perpendicular</td></tr>
    <tr><td>Cosine similarity</td><td>a·b / (‖a‖‖b‖)</td><td>−1 … 1, ignores length</td></tr>
    <tr><td>Matrix–vector</td><td>(Xw)ᵢ = X[i]·w</td><td>X (n × d), w (d) → n predictions</td></tr>
    <tr><td>Matrix product</td><td>(AB)ᵢⱼ = row i of A · column j of B</td><td>(n×k)(k×m) → (n×m); AB ≠ BA; (AB)ᵀ = BᵀAᵀ</td></tr>
    <tr><td>2×2 determinant, inverse</td><td>ad − bc; (1/(ad − bc))·[[d, −b], [−c, a]]</td><td>det = area scale; det 0 ⇒ no inverse</td></tr>
    <tr><td>Normal equations</td><td>XᵀX w = Xᵀy</td><td>y = targets, w = weights; ridge: (XᵀX + λI) w = Xᵀy</td></tr>
    <tr><td>Eigen</td><td>Av = λv</td><td>v = unturned direction, λ = stretch</td></tr>
    <tr><td>SVD</td><td>M = UΣVᵀ; σᵢ² = eigenvalues of MᵀM</td><td>U, V rotations; Σ diagonal, sorted; energy σᵢ²/Σσ²</td></tr>
    <tr><td>PCA</td><td>C = X_cᵀX_c/(n − 1); ratio λᵢ/Σλ</td><td>X_c = centred data; PCs = eigenvectors of C</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Euclidean distance</b><p>Use when magnitudes matter and features share a scale (kNN, k-means on standardised data).</p><small>Avoid on raw mixed units: the biggest unit wins</small></div>
    <div><b>Cosine</b><p>Use when only direction or mix matters: text, embeddings, user tastes.</p><small>Avoid when size itself is the signal</small></div>
    <div><b>solve / lstsq</b><p>Use to get weights from the normal equations on small d.</p><small>Avoid <code>inv(A) @ b</code>; avoid the normal equations for huge d (use GD)</small></div>
    <div><b>eigh</b><p>Use on symmetric matrices: covariance, XᵀX, Hessians.</p><small>Not for non-square matrices: use SVD</small></div>
    <div><b>SVD</b><p>Use for any shape: low-rank compression, recommenders, stable least squares.</p><small>Centre first if you want spread (PCA)</small></div>
    <div><b>PCA</b><p>Use to compress correlated columns, plot high-dim data, de-noise.</p><small>Standardise mixed units; components are hard to interpret</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Unscaled features in distances or PCA; raw dot products rewarding long vectors; <code>*</code> vs <code>@</code>; swapping matrix order (AB ≠ BA); shape mismatches; computing <code>inv</code> instead of <code>solve</code>; duplicate/collinear features making XᵀX singular; comparing eigenvectors without allowing a sign flip; running "PCA" without centring; using eigen-decomposition on a non-square matrix.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>L2 and L1 length of [6, 8]?</td><td>10 and 14</td></tr>
    <tr><td>X is 64 × 10, W is 10 × 3: shapes of XW and WX?</td><td>64 × 3; WX is illegal (3 ≠ 64)</td></tr>
    <tr><td>det of [[2, 1], [1, 3]]; invertible?</td><td>6 − 1 = 5; yes</td></tr>
    <tr><td>Is (1, 1) an eigenvector of [[14, 13], [13, 14]]? Eigenvalue?</td><td>Yes: (27, 27) = 27·(1, 1)</td></tr>
    <tr><td>Singular values 4, 2, 0: rank? energy share of the first?</td><td>Rank 2; 16 / 20 = 80%</td></tr>
  </table>

  <h2 id="mla-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you compute each idea on small numbers and explain why it exists, out loud, without notes?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Compute by hand: L2 and L1 length of [6, 8], and its unit vector.</summary><div class="qa-body">L2 = √(36 + 64) = √100 = 10. L1 = 6 + 8 = 14. Unit vector = [6/10, 8/10] = [0.6, 0.8] — the same direction as [3, 4].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where does the matrix [[0, 1], [1, 0]] send the point (2, 5)? What does it do geometrically?</summary><div class="qa-body">Row 1 · (2, 5) = 5, row 2 · (2, 5) = 2, so (5, 2). It swaps x and y: a mirror across the line y = x. Its columns (0, 1) and (1, 0) show the x-axis landing on the y-axis and vice versa.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use cosine similarity instead of Euclidean distance for text embeddings?</summary><div class="qa-body">Embedding length often tracks things like document length or word frequency, not meaning. Cosine compares only direction, so a long and a short document on the same topic still score close to 1 (like small house A and big house B, cosine 0.98). On unit-normalised vectors, ranking by cosine and by Euclidean distance is identical.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A is 64×10, B is 10×3. What are the shapes of AB, BA and AᵀA?</summary><div class="qa-body">AB is 64×3. BA is illegal (inner dims 3 vs 64). AᵀA is 10×10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is matrix multiplication commutative? Give a geometric reason.</summary><div class="qa-body">No. Each matrix is a transformation, and order matters: stretch-then-rotate puts (1,1) at (−1,2), rotate-then-stretch puts it at (−2,1). It is associative, though: (AB)C = A(BC).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why call <code>np.linalg.solve(A, b)</code> instead of <code>inv(A) @ b</code>?</summary><div class="qa-body">Solve factorises A once (LU) and back-substitutes: fewer operations and less rounding error. Forming the inverse is extra work and amplifies error when A is ill-conditioned. You need A⁻¹b, not A⁻¹.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does it mean if a matrix has rank lower than its number of columns? How does it hit linear regression?</summary><div class="qa-body">Some columns are combinations of others, so the matrix squashes space and XᵀX is not invertible. In regression, infinitely many weight vectors fit equally well (size in 1000s and in 100s of sq ft can trade weight freely). Fix: drop the duplicate feature, or add ridge (XᵀX + λI is always invertible for λ &gt; 0).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is (1, 0) an eigenvector of [[3, 0], [0, 5]]? What about (1, 1)?</summary><div class="qa-body">(1, 0) → (3, 0) = 3 × (1, 0): yes, eigenvalue 3. (1, 1) → (3, 5): not a multiple of (1, 1), so it was turned: not an eigenvector. For a diagonal matrix, the axes are the eigenvectors and the diagonal numbers are the eigenvalues.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through PCA step by step.</summary><div class="qa-body">(1) Standardise or at least centre each feature. (2) Covariance C = XᵀX/(n−1). (3) Eigen-decompose C. (4) Sort eigenvectors by eigenvalue, largest first. (5) Project data onto the top k. Eigenvalue / total = variance explained (our houses: 1.5 / 2 = 75%). In practice sklearn uses SVD of the centred X, which is more stable and gives the same axes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your PCA components from numpy and sklearn have opposite signs. Bug?</summary><div class="qa-body">No. If v is an eigenvector, so is −v. Both span the same axis and give the same variance; projections just flip sign. Compare with <code>np.abs</code> or check the subspace.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the normal equation and say when you would not use it.</summary><div class="qa-body">w = (XᵀX)⁻¹Xᵀy, computed as <code>solve(XᵀX, Xᵀy)</code> (or <code>lstsq(X, y)</code>). It costs about O(n·d² + d³). Avoid it when d is large (d³ blows up), when data doesn't fit in memory, or when XᵀX is near-singular. Use gradient descent or a QR / SVD-based solver instead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a dense neural-network layer in linear-algebra terms?</summary><div class="qa-body">An affine map plus a nonlinearity: <code>σ(XW + b)</code>, with X (batch×in), W (in×out), b broadcast over rows. Without σ, stacking layers collapses into one matrix (W₁W₂ is just another matrix), so depth adds nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>a = np.array([1, 2]); print(a @ a, a * a)</code></summary><div class="qa-body"><code>5 [1 4]</code>. The first is the dot product (1+4); the second is element-wise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does solving for regression weights need the transpose? Where does XᵀX come from?</summary><div class="qa-body">X is 3 × 2, not square, so it has no inverse and Xw = y usually has no exact solution. The best w leaves an error y − Xw with zero dot product with every feature column (perpendicular, section 03). Writing "every column dotted with the error" is Xᵀ(y − Xw) = 0, which rearranges to XᵀX w = Xᵀy: a square 2 × 2 system. The transpose is just "dot every column with this vector".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why are the singular values of X the square roots of the eigenvalues of XᵀX?</summary><div class="qa-body">If X = UΣVᵀ then XᵀX = VΣUᵀUΣVᵀ = VΣ²Vᵀ, because UᵀU = I. That is an eigen-decomposition of XᵀX with eigenvectors V and eigenvalues σ². On our houses: σ = 5.196 and 1, eigenvalues 27 and 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip scaling before distances or PCA?</summary><div class="qa-body">Both are built from norms and dot products, which add squared numbers, so the column with the biggest units dominates. With size in square feet, every house pair was ≈ 1000 apart and rooms stopped mattering; PCA would make PC1 "size" by fiat. Standardise first so each column contributes on equal terms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: a duplicate feature makes XᵀX singular. How does that show up in its determinant, rank and eigenvalues at once?</summary><div class="qa-body">They are three views of the same fact: some direction of weights changes nothing (more weight on one copy, less on the other). That direction is squashed to zero, so an eigenvalue is 0, the rank drops below the number of columns, and the determinant (the product of the eigenvalues) is 0, so there is no inverse. Ridge adds λ to every eigenvalue, lifting the 0 to λ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do the eigenvalues of XᵀX (27 and 1) matter for training with gradient descent?</summary><div class="qa-body">For the MSE loss, the curvature (Hessian) is (2/n)XᵀX, so the loss bowl is 27 times steeper along (1, 1) than along (1, −1): a long narrow valley. The learning rate must be small enough for the steep direction, so progress along the flat one is slow and GD zig-zags. That is why <a class="xref" data-note="m_optimization">Optimization</a> uses feature scaling, momentum and Adam.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="m_calculus">Calculus</a>.</b> We solved for w = [2, 0] in one shot because the model is linear and tiny. With millions of weights, or a model that is not linear (a neural net), there is no formula to solve. We need a different question: "if I nudge the weights a little, how fast does the error change, and in which direction?" That is a derivative.</div>
</main>
`
});
