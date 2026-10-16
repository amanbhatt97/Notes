// notes/dataanalysis/da_numpy.js — NumPy
Object.assign(TOPIC_CONTENT, {
  "da_numpy": `<main>
  <h1>NumPy</h1>
  <p class="lead">NumPy is the array engine under pandas, scikit-learn, PyTorch and Matplotlib. Learn how arrays sit in memory, how to slice them, and how broadcasting replaces loops. Examples use a 1,000-row e-commerce <code>orders</code> table (seed 42) reused across this phase.</p>

  <h2 id="dn-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">NumPy</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why NumPy</div>
        <ul>
          <li><b>ndarray</b> — one dtype, one contiguous memory block</li>
          <li><b>Vectorization</b> — one call runs a compiled C loop over all elements</li>
          <li><b>Speed</b> — 1M squares: list loop 23.8 ms, <code>(x*x).sum()</code> 1.1 ms (~20x)</li>
          <li><b>Memory</b> — 1M floats: list ~32 MB, array 8 MB</li>
          <li>⚠ <b>Python loop over an ndarray</b> — slowest of all (133 ms); stay vectorized</li>
          <li>💡 list = scattered boxes with pointers; array = one egg tray</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The ndarray</div>
        <ul>
          <li><b>shape / ndim / size</b> — (2,3) / 2 / 6</li>
          <li><b>dtype</b> — int64, float64; mixing upcasts (<code>[1,"a"]</code> → strings)</li>
          <li><b>strides</b> — bytes per step on each axis; make <code>.T</code> and slicing free</li>
          <li><b>Create</b> — <code>zeros, ones, full, eye, arange</code> (stop excluded), <code>linspace</code> (stop included)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Indexing</div>
        <ul>
          <li><b>Slice</b> — <code>m[0:2, 1:3]</code>, <code>m[:, 1]</code>, <code>m[::-1]</code> → view</li>
          <li><b>Boolean mask</b> — <code>a[a &gt; 5]</code>; <code>mask.mean()</code> = share True → copy</li>
          <li><b>Fancy</b> — <code>m[[0,2]]</code> rows; <code>m[[0,2],[1,3]]</code> pairs → copy</li>
          <li><b>np.where(cond, a, b)</b> — vectorized if/else</li>
          <li>⚠ <b>and/or on arrays</b> — error; use <code>(a&gt;1) &amp; (a&lt;5)</code> with parentheses</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Views vs Copies</div>
        <ul>
          <li><b>View</b> — shares memory (slices, reshape, <code>.T</code>, <code>ravel</code> when possible)</li>
          <li><b>Copy</b> — own memory (masks, fancy indexing, <code>.copy()</code>, <code>flatten</code>)</li>
          <li><b>Check</b> — <code>np.shares_memory(a, b)</code></li>
          <li>⚠ <b>Editing a slice edits the original</b> — <code>.copy()</code> when you mean to own it</li>
          <li>💡 view = window onto the room; copy = photo of it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reshape &amp; Stack</div>
        <ul>
          <li><b>reshape(-1, 1)</b> — -1 = infer; <code>a[:, None]</code> adds an axis</li>
          <li><b>concatenate</b> — join along existing axis; <b>stack</b> — new axis</li>
          <li><b>vstack / hstack / column_stack</b> — rows / flat / 1-D as columns</li>
          <li>⚠ <b>Appending in a loop</b> — O(n²) copies; collect a list, concatenate once</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Broadcasting &amp; Axes</div>
        <ul>
          <li><b>Rule</b> — align shapes from the right; each dim equal or 1</li>
          <li><b>Examples</b> — (2,3)+(3,) ok; (2,1)+(3,) → (2,3); (2,3)+(2,) error</li>
          <li><b>axis=k</b> — the axis that disappears: <code>sum(axis=0)</code> = per column</li>
          <li><b>keepdims=True</b> — keeps size-1 axis so result broadcasts back (row normalise)</li>
          <li><b>Standardise</b> — <code>(X - X.mean(0)) / X.std(0)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Linear Algebra &amp; Random</div>
        <ul>
          <li><b>@</b> — matrix product; <b>*</b> — element-wise</li>
          <li><b>solve(A, b)</b> — Ax=b; ⚠ never <code>inv(A) @ b</code> (slower, less stable)</li>
          <li><b>lstsq, eigh, det, norm</b> — regression, eigenvalues, determinant, length</li>
          <li><b>default_rng(seed)</b> — local Generator: <code>integers, normal, choice, permutation</code></li>
          <li>⚠ <b>np.random.seed</b> — global state; any library call shifts your sequence</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interview Tasks</div>
        <ul>
          <li><b>Top-k</b> — <code>argpartition</code> O(n), then sort k</li>
          <li><b>Counts</b> — <code>np.unique(a, return_counts=True)</code></li>
          <li><b>NaN-safe</b> — <code>nanmean</code>, <code>isnan().sum()</code></li>
          <li><b>One-hot</b> — <code>np.eye(k)[labels]</code></li>
          <li><b>Moving average</b> — <code>np.convolve(x, np.ones(w)/w, "valid")</code></li>
          <li><b>Pairwise distance</b> — <code>X[:, None] - C[None]</code> → (n,k,d), sum last axis</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dn-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why NumPy</span><span class="rm-sub">Contiguous memory, 20x faster</span></div></div>
      <div class="rm-item rm-done" data-target="dn-nd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The ndarray</span><span class="rm-sub">dtype, shape, strides</span></div></div>
      <div class="rm-item rm-done" data-target="dn-idx"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Indexing &amp; Slicing</span><span class="rm-sub">Slices, masks, fancy indexing</span></div></div>
      <div class="rm-item rm-done" data-target="dn-view"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Views vs Copies</span><span class="rm-sub">The silent-mutation trap</span></div></div>
      <div class="rm-item rm-done" data-target="dn-shape"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Reshape &amp; Stack</span><span class="rm-sub">Change shape, join arrays</span></div></div>
      <div class="rm-item rm-done" data-target="dn-bc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Broadcasting &amp; Axes</span><span class="rm-sub">Loops you never write</span></div></div>
      <div class="rm-item rm-done" data-target="dn-la"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Linear Algebra &amp; Random</span><span class="rm-sub">@, solve, Generator</span></div></div>
      <div class="rm-item rm-done" data-target="dn-tasks"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Interview Tasks</span><span class="rm-sub">Top-k, z-score, distances</span></div></div>
      <div class="rm-item rm-done" data-target="dn-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dn-why"><span class="num">01</span>Why NumPy</h2>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <text x="10" y="18">Python list: array of pointers</text>
    <rect x="10" y="28" width="40" height="28" class="fs" stroke="currentColor"/><rect x="50" y="28" width="40" height="28" class="fs" stroke="currentColor"/><rect x="90" y="28" width="40" height="28" class="fs" stroke="currentColor"/><rect x="130" y="28" width="40" height="28" class="fs" stroke="currentColor"/>
    <g stroke="currentColor" fill="none"><path d="M30 56 L60 110"/><path d="M70 56 L170 135"/><path d="M110 56 L25 135"/><path d="M150 56 L230 105"/></g>
    <rect x="40" y="108" width="54" height="24" class="fr sr"/><text x="46" y="125">float</text>
    <rect x="150" y="132" width="54" height="24" class="fr sr"/><text x="156" y="149">float</text>
    <rect x="5" y="134" width="54" height="24" class="fr sr"/><text x="11" y="151">float</text>
    <rect x="210" y="96" width="54" height="24" class="fr sr"/><text x="216" y="113">float</text>
    <text x="320" y="18">ndarray: one contiguous block</text>
    <rect x="320" y="28" width="60" height="28" class="fb sb"/><rect x="380" y="28" width="60" height="28" class="fb sb"/><rect x="440" y="28" width="60" height="28" class="fb sb"/><rect x="500" y="28" width="60" height="28" class="fb sb"/>
    <text x="330" y="47">8 B</text><text x="390" y="47">8 B</text><text x="450" y="47">8 B</text><text x="510" y="47">8 B</text>
    <text x="320" y="90" class="tg">same type, no pointers,</text><text x="320" y="108" class="tg">C loop + SIMD over raw bytes</text>
    <text x="10" y="184" class="tm">each float object ~24 B + 8 B pointer</text>
  </svg><figcaption>A list scatters boxed objects; an array packs raw numbers side by side, so C code can stream through them.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p><strong>Vectorization</strong>: one call that runs a compiled loop over the whole array, instead of a Python loop per element.</p></div>
  <div class="fx" data-lang="py">import numpy as np, timeit
rng = np.random.default_rng(0)
x = rng.random(1_000_000)     # 1M floats
xl = x.tolist()               # same data as a Python list

def loop_list():
    s = 0.0
    for v in xl: s += v * v
    return s
def loop_array():
    s = 0.0
    for v in x: s += v * v    # iterating an ndarray boxes every element
    return s
for name, f in [("loop over list", loop_list), ("loop over ndarray", loop_array),
                ("(x * x).sum()", lambda: (x * x).sum())]:
    t = min(timeit.repeat(f, number=1, repeat=5))
    print(f"{name:18s} {t*1e3:8.2f} ms")</div>
  <div class="fx" data-lang="text">loop over list        23.79 ms
loop over ndarray    133.44 ms
(x * x).sum()          1.14 ms</div>
  <p>Vectorized is ~20x faster than the list loop. Memory: the list costs ~32 MB, the array 8 MB.</p>
  <div class="callout trap"><span class="label">Trap</span><p>A Python <code>for</code> loop over an ndarray is the <em>slowest</em> option: each element is wrapped into a Python object. Use NumPy only if you stay vectorized.</p></div>

  <h2 id="dn-nd"><span class="num">02</span>The ndarray</h2>
  <table class="tbl">
    <tr><th>Attribute</th><th><code>a = np.array([[1,2,3],[4,5,6]])</code></th><th>Meaning</th></tr>
    <tr><td><code>dtype</code></td><td>int64</td><td>One type for every element</td></tr>
    <tr><td><code>shape</code></td><td>(2, 3)</td><td>Length of each axis</td></tr>
    <tr><td><code>ndim</code> / <code>size</code></td><td>2 / 6</td><td>Number of axes / elements</td></tr>
    <tr><td><code>strides</code></td><td>(24, 8)</td><td>Bytes to jump to the next row / column</td></tr>
  </table>
  <p><strong>Strides</strong> are why transpose and slicing are free: <code>a.T.strides</code> is <code>(8, 24)</code>. Same bytes, read in a different order.</p>
  <div class="fx" data-lang="py">np.zeros((2, 3))          # [[0. 0. 0.] [0. 0. 0.]]
np.arange(0, 10, 3)       # [0 3 6 9]          (stop excluded)
np.linspace(0, 1, 5)      # [0. 0.25 0.5 0.75 1.]  (stop included)
np.full((2, 2), 7); np.eye(3, dtype=int); np.ones_like(a)
np.array([1, 2, 3.5]).dtype    # float64 (upcast)
np.array([1, "a"]).dtype       # &lt;U21   (everything became a string!)</div>
  <div class="fx" data-lang="py">import pandas as pd
o = pd.read_csv("orders.csv")
qty, price = o.qty.to_numpy(), o.unit_price.to_numpy()
rev = qty * price                       # element-wise, no loop
print(qty[:6], price[:6]); print(rev[:6], rev.sum(), rev.mean().round(1))</div>
  <div class="fx" data-lang="text">[4 3 4 1 3 3] [ 1310.   960.   220. 12170.   610.   800.]
[ 5240.  2880.   880. 12170.  1830.  2400.] 7705590.0 7705.6</div>

  <h2 id="dn-idx"><span class="num">03</span>Indexing &amp; Slicing</h2>
  <div class="fx" data-lang="py">m = np.arange(12).reshape(3, 4)
m[1, 2]        # 6
m[-1]          # [ 8  9 10 11]   last row
m[:, 1]        # [1 5 9]         a column
m[0:2, 1:3]    # [[1 2] [5 6]]   rows 0-1, cols 1-2
m[::2, ::-1]   # [[ 3  2  1  0] [11 10  9  8]]  every 2nd row, columns reversed</div>
  <table class="tbl">
    <tr><th>Kind</th><th>Example on orders</th><th>Output</th><th>Returns</th></tr>
    <tr><td>Boolean mask</td><td><code>price[price &gt; 20000]</code></td><td>[23190. 22140.]</td><td>copy</td></tr>
    <tr><td>Mask stats</td><td><code>(price &gt; 20000).mean()</code></td><td>0.002 (share of rows)</td><td>scalar</td></tr>
    <tr><td>Fancy (list of ints)</td><td><code>m[[0, 2]]</code></td><td>rows 0 and 2</td><td>copy</td></tr>
    <tr><td>Paired fancy</td><td><code>m[[0, 2], [1, 3]]</code></td><td>[ 1 11] = m[0,1], m[2,3]</td><td>copy</td></tr>
    <tr><td>Vectorized if/else</td><td><code>np.where(price &gt; 5000, "high", "low")[:4]</code></td><td>['low' 'low' 'low' 'high']</td><td>new array</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Combine masks with <code>&amp;</code>, <code>|</code>, <code>~</code> and parentheses: <code>(a &gt; 1) &amp; (a &lt; 5)</code>. Python's <code>and</code> raises "truth value of an array is ambiguous".</p></div>

  <h2 id="dn-view"><span class="num">04</span>Views vs Copies</h2>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="dn-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <text x="10" y="30">m</text><text x="10" y="80">v = m[0]</text>
    <path d="M30 26 L188 50" stroke="currentColor" marker-end="url(#dn-ar)"/><path d="M80 76 L188 62" stroke="currentColor" marker-end="url(#dn-ar)"/>
    <rect x="190" y="40" width="190" height="34" class="fb sb"/><text x="198" y="62">one buffer [99 1 2 3..]</text>
    <text x="410" y="30">c = m[m &gt; 5]</text>
    <path d="M450 36 L450 50" stroke="currentColor" marker-end="url(#dn-ar)"/>
    <rect x="410" y="52" width="160" height="34" class="fg sg"/><text x="420" y="74">its own buffer</text>
    <text x="10" y="118" class="tm">slices = views (shared memory) · masks / fancy indexing = copies</text>
  </svg><figcaption>Writing through a view changes the original; writing to a copy doesn't.</figcaption></figure>
  <div class="fx" data-lang="py">m = np.arange(12).reshape(3, 4)
v = m[0];      v[0] = 99      # slice -&gt; view
c = m[m &gt; 5];  c[0] = -1      # mask  -&gt; copy
print(m[0])                                    # [99  1  2  3]  changed!
print(np.shares_memory(m, m[:, 1]),            # True
      np.shares_memory(m, m[:, 1].copy()),     # False
      np.shares_memory(m, m[[0]]))             # False</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A view is a window onto the same room; a copy is a photo of it. Rearranging furniture shows through the window, not in the photo.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A function that slices its input and edits the slice mutates the caller's data. Call <code>.copy()</code> when you mean to own the data. A tiny view also keeps a huge parent array alive in memory.</p></div>

  <h2 id="dn-shape"><span class="num">05</span>Reshape &amp; Stack</h2>
  <div class="fx" data-lang="py">r = np.arange(6)
r.reshape(2, 3)          # [[0 1 2] [3 4 5]]
r.reshape(-1, 1).shape   # (6, 1)   -1 = "work it out"
r[:, None].shape         # (6, 1)   add an axis (same as np.newaxis)
r[None, :].shape         # (1, 6)
m2 = r.reshape(2, 3)
m2.ravel()               # [0 1 2 3 4 5]  view when possible
m2.T.flatten()           # [0 3 1 4 2 5]  always a copy</div>
  <table class="tbl">
    <tr><th>a=[1,2,3], b=[4,5,6]</th><th>Result</th><th>Rule</th></tr>
    <tr><td><code>np.concatenate([a, b])</code></td><td>[1 2 3 4 5 6]</td><td>Join along an <em>existing</em> axis</td></tr>
    <tr><td><code>np.stack([a, b])</code></td><td>shape (2, 3)</td><td>Join along a <em>new</em> axis</td></tr>
    <tr><td><code>np.stack([a, b], axis=1)</code></td><td>shape (3, 2)</td><td>New axis at position 1</td></tr>
    <tr><td><code>np.vstack</code> / <code>np.hstack</code></td><td>[[1 2 3] [4 5 6]] / [1 2 3 4 5 6]</td><td>Rows / columns</td></tr>
    <tr><td><code>np.column_stack([a, b])</code></td><td>[[1 4] [2 5] [3 6]]</td><td>1-D arrays become columns</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Appending in a loop (<code>np.append</code>/<code>concatenate</code>) copies the whole array every time: O(n²). Collect pieces in a list, concatenate once.</p></div>

  <h2 id="dn-bc"><span class="num">06</span>Broadcasting &amp; Axes</h2>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <text x="10" y="16" class="tm">prices (2,3)</text>
    <rect x="10" y="24" width="150" height="60" class="fb sb"/><text x="22" y="48">100 200 300</text><text x="22" y="72">400 500 600</text>
    <text x="175" y="60">*</text>
    <text x="195" y="16" class="tm">factor (3,)</text>
    <rect x="195" y="24" width="150" height="30" class="fg sg"/><text x="207" y="44">0.9 1.0 1.1</text>
    <rect x="195" y="54" width="150" height="30" class="fg" stroke-dasharray="4 3" stroke="currentColor"/><text x="207" y="74" class="tm">0.9 1.0 1.1</text>
    <text x="360" y="60">=</text>
    <text x="385" y="16" class="tm">result (2,3)</text>
    <rect x="385" y="24" width="160" height="60" class="ft st"/><text x="397" y="48"> 90 200 330</text><text x="397" y="72">360 500 660</text>
    <text x="10" y="112">Align shapes from the RIGHT:  (2, 3)</text>
    <text x="10" y="130">each dim must be equal or 1  →   (   3)  ⇒  (1,3) stretched to (2,3)</text>
  </svg><figcaption>The dashed row is virtual: NumPy repeats the smaller array without copying it.</figcaption></figure>
  <div class="fx" data-lang="py">prices = np.array([[100., 200., 300.], [400., 500., 600.]])
prices - prices.mean(axis=0)        # centre each column
# [[-150. -150. -150.]
#  [ 150.  150.  150.]]
np.array([[1], [2]]) + np.array([10, 20, 30])   # (2,1) + (3,) -&gt; (2,3)
# [[11 21 31]
#  [12 22 32]]
np.ones((2, 3)) + np.ones(2)
# ValueError: operands could not be broadcast together with shapes (2,3) (2,)</div>
  <p>Fix the last one by making the 2 a column: <code>np.ones(2)[:, None]</code> has shape (2,1).</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="dn-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="60" y="20" width="150" height="60" class="fs" stroke="currentColor"/><text x="75" y="44">5  3  8</text><text x="75" y="68">2  7  1</text>
    <path d="M40 20 L40 80" stroke="currentColor" marker-end="url(#dn-ar2)"/><text x="5" y="54">axis 0</text>
    <path d="M60 100 L210 100" stroke="currentColor" marker-end="url(#dn-ar2)"/><text x="100" y="116">axis 1</text>
    <text x="250" y="34">sum(axis=0) → [7 10 9]  one per column</text>
    <text x="250" y="60">sum(axis=1) → [16 10]   one per row</text>
    <text x="250" y="86" class="tm">rows = stores, columns = days</text>
  </svg><figcaption>The axis you name is the one that disappears.</figcaption></figure>
  <div class="callout intu"><span class="label">Key insight</span><p><code>keepdims=True</code> keeps the collapsed axis as size 1, so the result broadcasts back: <code>x / x.sum(axis=1, keepdims=True)</code> normalises each row.</p></div>

  <h2 id="dn-la"><span class="num">07</span>Linear Algebra &amp; Random</h2>
  <div class="fx" data-lang="py">A = np.array([[3., 1.], [1., 2.]]);  b = np.array([9., 8.])
A @ A                  # [[10. 5.] [5. 5.]]  matrix product (same as np.dot for 2-D)
A * A                  # element-wise, NOT a matrix product
np.linalg.inv(A)       # [[ 0.4 -0.2] [-0.2  0.6]]
np.linalg.solve(A, b)  # [2. 3.]   solves Ax = b
np.linalg.det(A)       # 5.000000000000001
np.linalg.eigh(A)[0]   # [1.382 3.618]  eigenvalues (symmetric matrix)
np.array([1,2,3]) @ np.array([4,5,6])   # 32  dot product
np.linalg.norm([3, 4]) # 5.0</div>
  <div class="callout trap"><span class="label">Trap</span><p>Never write <code>inv(A) @ b</code> to solve a system. <code>solve</code> is faster and numerically stabler. For regression use <code>np.linalg.lstsq(X, y)</code>, which also handles non-square X.</p></div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(42)          # new Generator API: seeded, local
rng.integers(1, 7, size=5)               # [1 5 4 3 3]   dice (high excluded)
rng.normal(0, 1, size=3).round(3)        # [ 0.941 -1.951 -1.302]
rng.choice(["A", "B", "C"], size=5, p=[.6, .3, .1])   # ['B' 'B' 'A' 'A' 'A']
rng.permutation(5)                       # [1 0 4 3 2]</div>
  <p>Prefer <code>default_rng(seed)</code> over the legacy <code>np.random.seed</code>: it's a local object, so two pieces of code can't disturb each other's stream.</p>

  <h2 id="dn-tasks"><span class="num">08</span>Interview Tasks</h2>
  <div class="fx" data-lang="py">a = np.array([3, 1, 4, 1, 5, 9, 2, 6])
np.argsort(a)[-3:][::-1]          # [5 7 4]  indices of top-3, sorted
np.argpartition(a, -3)[-3:]       # [4 7 5]  top-3 in O(n), unsorted
np.unique(a, return_counts=True)  # ([1 2 3 4 5 6 9], [2 1 1 1 1 1 1])
z = np.array([10., 20., 30., 40.])
(z - z.mean()) / z.std()          # [-1.342 -0.447  0.447  1.342]  z-score
np.nanmean([2., np.nan, 5.])      # 3.5   ignores NaN
np.clip(a, 2, 5)                  # [3 2 4 2 5 5 2 5]
np.eye(3, dtype=int)[[0, 2, 1]]   # one-hot encode labels 0,2,1
np.convolve([1,2,3,4,5,6.], np.ones(3)/3, mode="valid")   # [2. 3. 4. 5.] moving avg

# pairwise distances, points X (4,2) vs centroids C (3,2): k-means step
d = np.sqrt(((X[:, None, :] - C[None, :, :]) ** 2).sum(axis=2))   # (4,3)
d.argmin(axis=1)                  # [1 2 0 1] nearest centroid per point</div>
  <p>The distance trick is broadcasting at its best: (4,1,2) − (1,3,2) → (4,3,2), then sum the last axis.</p>

  <h2 id="dn-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is NumPy faster than Python lists?</summary><div class="qa-body">Homogeneous dtype in contiguous memory, so operations run as compiled C loops (often SIMD) with no per-element type checks or pointer chasing. Lists hold pointers to boxed objects scattered in memory. Measured here: 23.8 ms loop vs 1.1 ms vectorized for 1M squares.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>a = np.arange(5); b = a[1:3]; b[:] = 0; print(a)</code></summary><div class="qa-body"><code>[0 0 0 3 4]</code>. The slice is a view, so writing to <code>b</code> writes into <code>a</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shape of <code>np.ones((3,1)) + np.ones(4)</code>? And <code>np.ones((3,2)) + np.ones(3)</code>?</summary><div class="qa-body">(3,4): (3,1) and (4,) align as (3,1)/(1,4). The second fails: trailing dims 2 vs 3 are unequal and neither is 1. Fix with <code>np.ones(3)[:, None]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For a (100, 5) feature matrix, how do you standardise each feature?</summary><div class="qa-body"><code>(X - X.mean(axis=0)) / X.std(axis=0)</code>. axis=0 collapses rows, giving 5 means; broadcasting subtracts them from every row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Difference between <code>np.dot</code>, <code>@</code> and <code>*</code>?</summary><div class="qa-body"><code>*</code> is element-wise. <code>@</code> (matmul) is matrix multiplication and broadcasts over leading batch dims. <code>np.dot</code> equals <code>@</code> for 1-D/2-D but behaves differently for 3-D+, so prefer <code>@</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>ravel()</code> vs <code>flatten()</code> vs <code>reshape(-1)</code>?</summary><div class="qa-body"><code>flatten</code> always copies. <code>ravel</code> and <code>reshape(-1)</code> return a view when memory layout allows, else a copy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the indices of the 3 largest values in a 10M array efficiently.</summary><div class="qa-body"><code>idx = np.argpartition(a, -3)[-3:]</code> is O(n); then sort just those three: <code>idx[np.argsort(a[idx])[::-1]]</code>. A full <code>argsort</code> is O(n log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>np.array([1, "a"])</code> surprise people?</summary><div class="qa-body">Arrays have one dtype, so NumPy upcasts to a common type: here <code>&lt;U21</code> (strings). Mixed data turns numbers into text and math fails. Same with ints plus NaN: they become float64.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Replace negatives with 0 and count how many were replaced, without a loop.</summary><div class="qa-body"><code>n = (a &lt; 0).sum(); a[a &lt; 0] = 0</code>, or <code>np.maximum(a, 0)</code> / <code>np.clip(a, 0, None)</code> for a new array. Boolean True counts as 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>np.linalg.solve</code> instead of <code>inv(A) @ b</code>?</summary><div class="qa-body">Solve uses an LU factorisation directly: about 3x less work and less floating-point error. Explicit inverses amplify error on ill-conditioned matrices.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why prefer <code>np.random.default_rng(42)</code> over <code>np.random.seed(42)</code>?</summary><div class="qa-body">The Generator is a local object with a better algorithm (PCG64). Global seeding is shared state: any library call that draws numbers shifts your sequence and breaks reproducibility.</div></details>
</main>`
});
