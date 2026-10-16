// notes/dataanalysis/da_numpy.js — NumPy
Object.assign(TOPIC_CONTENT, {
  "da_numpy": `<main>
  <h1>NumPy</h1>
  <p class="lead">NumPy is a Python library for working with big grids of numbers quickly. Almost every data tool you will use (pandas, scikit-learn, PyTorch, Matplotlib) is built on top of it. Interviews test it directly: slicing, shapes, broadcasting and "do this without a loop" questions. Examples start with a tiny school marksheet, then move to a 1,000-row online-shop <code>orders</code> table (seed 42) that the whole Data Analysis phase reuses.</p>

  <h2 id="dn-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">NumPy</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why NumPy</div>
        <ul>
          <li><b>ndarray</b> — grid of numbers, one type, one block of memory</li>
          <li><b>Vectorization</b> — one call runs a fast C loop over all elements</li>
          <li><b>Math on whole arrays</b> — <code>marks + 5</code> adds 5 to every mark; a list can't</li>
          <li><b>Speed</b> — 1M squares: list loop 23.8 ms, <code>(x*x).sum()</code> 1.1 ms (~20x)</li>
          <li><b>Memory</b> — 1M floats: list ~32 MB, array 8 MB</li>
          <li>⚠ <b>Python loop over an ndarray</b> — slowest of all (133 ms); stay vectorized</li>
          <li>💡 list = loose items in many bags; array = one egg tray</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The ndarray</div>
        <ul>
          <li><b>shape / ndim / size</b> — (2,3) / 2 / 6 → rows, cols; number of axes; total items</li>
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
          <li>💡 mask = a sieve: True holes let values through</li>
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
          <li><b>Broadcasting</b> — small array is stretched to match big one, no copy</li>
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
          <li><b>@</b> — matrix product (bill total = qty @ price); <b>*</b> — element-wise</li>
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
      <div class="rm-item rm-done" data-target="dn-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why NumPy</span><span class="rm-sub">Math on a whole list at once</span></div></div>
      <div class="rm-item rm-done" data-target="dn-nd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The ndarray</span><span class="rm-sub">shape, dtype, strides</span></div></div>
      <div class="rm-item rm-done" data-target="dn-idx"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Indexing &amp; Slicing</span><span class="rm-sub">Slices, masks, fancy indexing</span></div></div>
      <div class="rm-item rm-done" data-target="dn-view"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Views vs Copies</span><span class="rm-sub">The silent-change trap</span></div></div>
      <div class="rm-item rm-done" data-target="dn-shape"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Reshape &amp; Stack</span><span class="rm-sub">Change shape, join arrays</span></div></div>
      <div class="rm-item rm-done" data-target="dn-bc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Broadcasting &amp; Axes</span><span class="rm-sub">Loops you never write</span></div></div>
      <div class="rm-item rm-done" data-target="dn-la"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Linear Algebra &amp; Random</span><span class="rm-sub">@, solve, Generator</span></div></div>
      <div class="rm-item rm-done" data-target="dn-tasks"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Interview Tasks</span><span class="rm-sub">Top-k, z-score, distances</span></div></div>
      <div class="rm-item rm-done" data-target="dn-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dn-why"><span class="num">01</span>Why NumPy</h2>
  <p>A class teacher has the marks of 3 students: 70, 85 and 92. The board says "give everyone 5 grace marks". In plain Python, a list of marks cannot do this in one step. Look at what happens:</p>
  <div class="fx" data-lang="py">import numpy as np
marks_list = [70, 85, 92]
print(marks_list * 2)               # list: repeats the list!
print([m + 5 for m in marks_list])  # list: you must write a loop

marks = np.array([70, 85, 92])      # NumPy array
print(marks * 2)                    # doubles every mark
print(marks + 5)                    # adds 5 to every mark</div>
  <div class="fx" data-lang="text">[70, 85, 92, 70, 85, 92]
[75, 90, 97]
[140 170 184]
[75 90 97]</div>
  <p>A Python list is a general box. It can hold anything, so it does not know how to do maths on its items. A <strong>NumPy array</strong> holds only numbers of one type. So it can apply one operation to every item in a single step. Applying an operation to a whole array at once, with no Python loop, is called <strong>vectorization</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A Python list is like loose eggs in many separate bags around the kitchen. A NumPy array is one egg tray: all eggs the same size, side by side. You can wash the whole tray in one go.</p></div>
  <p>Why does this matter for a job? Real data has lakhs of rows. A loop that is fine for 3 marks becomes very slow for 10 lakh orders. The picture shows why arrays are faster:</p>
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
  <p>On the left, the list only stores <em>pointers</em> (addresses) to numbers kept all over memory. Python must follow each address and check each item's type. On the right, the array keeps raw numbers next to each other. NumPy's fast C code (C is a fast low-level language) runs through them in one go. <strong>SIMD</strong> means the CPU handles several numbers per instruction.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Vectorization</strong>: one call that runs a compiled loop over the whole array, instead of a Python loop per element.</p></div>
  <p>Here is a real timing on 10 lakh (1 million) random numbers. Each version squares every number and adds them up:</p>
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
  <p>The vectorized line is about 20 times faster than the list loop. It also uses less memory: the list costs about 32 MB, the array 8 MB.</p>
  <div class="callout trap"><span class="label">Trap</span><p>A Python <code>for</code> loop over an ndarray is the <em>slowest</em> option (133 ms above). Each element gets wrapped into a Python object first. NumPy is fast only when you let NumPy do the loop.</p></div>

  <h2 id="dn-nd"><span class="num">02</span>The ndarray</h2>
  <p>NumPy's array type is called <strong>ndarray</strong> ("n-dimensional array"). "Dimension" here just means direction. A row of marks has one direction. A marksheet (students down, subjects across) has two. Each direction is called an <strong>axis</strong>.</p>
  <div class="fx" data-lang="py">sheet = np.array([[70, 85, 92],     # student 1: maths, science, english
                  [60, 75, 88],     # student 2
                  [95, 40, 81]])    # student 3
print(sheet.shape, sheet.ndim, sheet.size, sheet.dtype)
print(sheet[1, 2], sheet[0], sheet[:, 1])   # one mark, one student, one subject</div>
  <div class="fx" data-lang="text">(3, 3) 2 9 int64
88 [70 85 92] [85 75 40]</div>
  <p><code>shape</code> (3, 3) means 3 rows and 3 columns. <code>ndim</code> 2 means two axes. <code>size</code> 9 is the total count of marks. <code>dtype</code> is the one type every item shares: <code>int64</code> is a whole number stored in 64 bits (8 bytes).</p>
  <table class="tbl">
    <tr><th>Attribute</th><th><code>a = np.array([[1,2,3],[4,5,6]])</code></th><th>Meaning</th></tr>
    <tr><td><code>dtype</code></td><td>int64</td><td>One type for every element</td></tr>
    <tr><td><code>shape</code></td><td>(2, 3)</td><td>Length of each axis</td></tr>
    <tr><td><code>ndim</code> / <code>size</code></td><td>2 / 6</td><td>Number of axes / elements</td></tr>
    <tr><td><code>strides</code></td><td>(24, 8)</td><td>Bytes to jump to the next row / column</td></tr>
  </table>
  <p><strong>Strides</strong> tell NumPy how to walk through memory. In <code>a</code>, each number takes 8 bytes. To reach the next column, jump 8 bytes. To reach the next row (3 numbers later), jump 24 bytes. This is why <strong>transpose</strong> (<code>.T</code>, swapping rows and columns) and slicing cost nothing: <code>a.T.strides</code> is <code>(8, 24)</code>. Same bytes, read in a different order.</p>
  <p>Ways to create arrays without typing every value:</p>
  <div class="fx" data-lang="py">np.zeros((2, 3))          # [[0. 0. 0.] [0. 0. 0.]]
np.arange(0, 10, 3)       # [0 3 6 9]          (stop excluded)
np.linspace(0, 1, 5)      # [0. 0.25 0.5 0.75 1.]  (stop included)
np.full((2, 2), 7); np.eye(3, dtype=int); np.ones_like(a)
np.array([1, 2, 3.5]).dtype    # float64 (upcast)
np.array([1, "a"]).dtype       # &lt;U21   (everything became a string!)</div>
  <p><code>arange</code> is like Python's <code>range</code>: you give a step size, and the stop value is left out. <code>linspace</code> asks "how many points?" and includes the stop. <code>eye</code> makes an identity matrix (1s on the diagonal). <strong>Upcast</strong> means NumPy picks one type that can hold everything: one decimal turns all ints into floats; one string turns everything into strings.</p>
  <p>The same idea on real data. Each order has a quantity and a unit price; revenue is quantity × price for every row:</p>
  <div class="fx" data-lang="py">import pandas as pd
o = pd.read_csv("orders.csv")
qty, price = o.qty.to_numpy(), o.unit_price.to_numpy()
rev = qty * price                       # element-wise, no loop
print(qty[:6], price[:6]); print(rev[:6], rev.sum(), rev.mean().round(1))</div>
  <div class="fx" data-lang="text">[4 3 4 1 3 3] [ 1310.   960.   220. 12170.   610.   800.]
[ 5240.  2880.   880. 12170.  1830.  2400.] 7705590.0 7705.6</div>
  <p><strong>Element-wise</strong> means "item 1 with item 1, item 2 with item 2". So 4 × 1310 = 5240, 3 × 960 = 2880, and so on for all 1,000 rows.</p>

  <h2 id="dn-idx"><span class="num">03</span>Indexing &amp; Slicing</h2>
  <p><strong>Indexing</strong> means picking items out of an array. NumPy counts from 0, like Python. For a 2-D array you give two positions: <code>[row, column]</code>. A <strong>slice</strong> <code>start:stop</code> takes a range; the stop is not included. A bare <code>:</code> means "all".</p>
  <div class="fx" data-lang="py">m = np.arange(12).reshape(3, 4)
m[1, 2]        # 6
m[-1]          # [ 8  9 10 11]   last row
m[:, 1]        # [1 5 9]         a column
m[0:2, 1:3]    # [[1 2] [5 6]]   rows 0-1, cols 1-2
m[::2, ::-1]   # [[ 3  2  1  0] [11 10  9  8]]  every 2nd row, columns reversed</div>
  <p><code>m</code> here is the numbers 0 to 11 in 3 rows of 4. <code>::2</code> means "every 2nd one", and <code>::-1</code> means "go backwards".</p>
  <h3>Boolean masks: filter by a condition</h3>
  <p>Now the common question: "which students scored 50 or more?" Comparing an array with a number gives an array of True/False, one per item. This True/False array is called a <strong>boolean mask</strong>. Put the mask inside the brackets and only the True positions come out.</p>
  <figure class="viz"><svg viewBox="0 0 520 150" width="520">
    <text x="10" y="30">m</text>
    <rect x="80" y="12" width="70" height="28" class="fs" stroke="currentColor"/><rect x="150" y="12" width="70" height="28" class="fs" stroke="currentColor"/><rect x="220" y="12" width="70" height="28" class="fs" stroke="currentColor"/><rect x="290" y="12" width="70" height="28" class="fs" stroke="currentColor"/><rect x="360" y="12" width="70" height="28" class="fs" stroke="currentColor"/>
    <text x="104" y="31">45</text><text x="174" y="31">72</text><text x="244" y="31">38</text><text x="314" y="31">90</text><text x="384" y="31">60</text>
    <text x="10" y="76">m &gt;= 50</text>
    <rect x="80" y="58" width="70" height="28" class="fr sr"/><rect x="150" y="58" width="70" height="28" class="fg sg"/><rect x="220" y="58" width="70" height="28" class="fr sr"/><rect x="290" y="58" width="70" height="28" class="fg sg"/><rect x="360" y="58" width="70" height="28" class="fg sg"/>
    <text x="92" y="77">False</text><text x="166" y="77">True</text><text x="232" y="77">False</text><text x="306" y="77">True</text><text x="376" y="77">True</text>
    <text x="10" y="122">m[mask]</text>
    <rect x="150" y="104" width="70" height="28" class="fg sg"/><rect x="220" y="104" width="70" height="28" class="fg sg"/><rect x="290" y="104" width="70" height="28" class="fg sg"/>
    <text x="174" y="123">72</text><text x="244" y="123">90</text><text x="314" y="123">60</text>
    <text x="445" y="77" class="tm">3 True</text>
  </svg><figcaption>Top row: marks. Middle: the mask, one True/False per mark. Bottom: only the values under a True survive.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A mask is a sieve (a chhalni). Holes marked True let the value fall through; False holes block it.</p></div>
  <div class="fx" data-lang="py">m = np.array([45, 72, 38, 90, 60])
mask = m &gt;= 50
print(mask)
print(m[mask])
print(mask.sum(), mask.mean())           # True counts as 1, False as 0
print(m[(m &gt;= 50) &amp; (m &lt; 80)])          # two conditions: &amp; = "and"
print(np.where(m &gt;= 50, "pass", "fail")) # if / else for every item</div>
  <div class="fx" data-lang="text">[False  True False  True  True]
[72 90 60]
3 0.6
[72 60]
['fail' 'pass' 'fail' 'pass' 'pass']</div>
  <p>Because True counts as 1, <code>mask.sum()</code> counts how many passed (3), and <code>mask.mean()</code> gives the share that passed (0.6 = 60%). <code>np.where(condition, a, b)</code> is a vectorized if/else: "a where True, b where False".</p>
  <p><strong>Fancy indexing</strong> means passing a list of positions, such as <code>m[[0, 2]]</code> for rows 0 and 2. The same tools on the orders data:</p>
  <table class="tbl">
    <tr><th>Kind</th><th>Example on orders</th><th>Output</th><th>Returns</th></tr>
    <tr><td>Boolean mask</td><td><code>price[price &gt; 20000]</code></td><td>[23190. 22140.]</td><td>copy</td></tr>
    <tr><td>Mask stats</td><td><code>(price &gt; 20000).mean()</code></td><td>0.002 (share of rows)</td><td>scalar</td></tr>
    <tr><td>Fancy (list of ints)</td><td><code>m[[0, 2]]</code></td><td>rows 0 and 2</td><td>copy</td></tr>
    <tr><td>Paired fancy</td><td><code>m[[0, 2], [1, 3]]</code></td><td>[ 1 11] = m[0,1], m[2,3]</td><td>copy</td></tr>
    <tr><td>Vectorized if/else</td><td><code>np.where(price &gt; 5000, "high", "low")[:4]</code></td><td>['low' 'low' 'low' 'high']</td><td>new array</td></tr>
  </table>
  <p>(Here <code>m</code> is again the 3×4 grid of 0 to 11.) "Copy" in the last column matters in the next section.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Combine masks with <code>&amp;</code> (and), <code>|</code> (or), <code>~</code> (not), and put each condition in parentheses: <code>(a &gt; 1) &amp; (a &lt; 5)</code>. Python's <code>and</code> raises "truth value of an array is ambiguous", because it expects one True/False, not many.</p></div>

  <h2 id="dn-view"><span class="num">04</span>Views vs Copies</h2>
  <p>Suppose you take a slice of an array and change it. Does the original change too? With NumPy slices, yes. A slice does not copy the numbers. It is a new way of looking at the same memory. This is called a <strong>view</strong>. A <strong>copy</strong> has its own memory, so changes stay inside it.</p>
  <div class="fx" data-lang="py">a = np.array([10, 20, 30, 40])
part = a[1:3]; part[0] = 0          # slice = view
print(a)
b = np.array([10, 20, 30, 40])
safe = b[1:3].copy(); safe[0] = 0   # explicit copy
print(b)</div>
  <div class="fx" data-lang="text">[10  0 30 40]
[10 20 30 40]</div>
  <p>Changing <code>part</code> changed <code>a</code>: 20 became 0. Changing <code>safe</code> left <code>b</code> alone. NumPy does this on purpose: slicing a huge array is instant because nothing is copied.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A view is a window onto the same room; a copy is a photo of it. Rearranging furniture shows through the window, not in the photo.</p></div>
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
  <p>Left: <code>m</code> and the slice <code>v</code> both point at one <strong>buffer</strong> (the block of memory holding the numbers). Right: a mask result gets its own buffer. The rule of thumb: slices give views; masks and lists of positions give copies. <code>np.shares_memory</code> checks it for you:</p>
  <div class="fx" data-lang="py">m = np.arange(12).reshape(3, 4)
v = m[0];      v[0] = 99      # slice -&gt; view
c = m[m &gt; 5];  c[0] = -1      # mask  -&gt; copy
print(m[0])                                    # [99  1  2  3]  changed!
print(np.shares_memory(m, m[:, 1]),            # True
      np.shares_memory(m, m[:, 1].copy()),     # False
      np.shares_memory(m, m[[0]]))             # False</div>
  <div class="callout trap"><span class="label">Trap</span><p>A function that slices its input and edits the slice changes the caller's data too. Call <code>.copy()</code> when you mean to own the data. Also, a tiny view keeps its huge parent array alive in memory.</p></div>

  <h2 id="dn-shape"><span class="num">05</span>Reshape &amp; Stack</h2>
  <p>The same 6 numbers can be arranged as 1 row of 6, 2 rows of 3, or 6 rows of 1. <strong>Reshape</strong> changes the arrangement without changing the numbers. It is like re-stacking 6 tiffin boxes as 2 rows of 3 on a shelf. The total must stay the same: 6 cannot become 4×2.</p>
  <div class="fx" data-lang="py">r = np.arange(6)
r.reshape(2, 3)          # [[0 1 2] [3 4 5]]
r.reshape(-1, 1).shape   # (6, 1)   -1 = "work it out"
r[:, None].shape         # (6, 1)   add an axis (same as np.newaxis)
r[None, :].shape         # (1, 6)
m2 = r.reshape(2, 3)
m2.ravel()               # [0 1 2 3 4 5]  view when possible
m2.T.flatten()           # [0 3 1 4 2 5]  always a copy</div>
  <p><code>-1</code> tells NumPy "you calculate this one". <code>None</code> inside brackets adds a new axis of length 1. This turns a flat list into a column, which scikit-learn often wants (it expects shape (rows, features)). <code>ravel</code> and <code>flatten</code> both make a 2-D array flat again.</p>
  <p><strong>Stacking</strong> joins arrays. The question is always: do you glue them end to end, or put one on top of the other?</p>
  <table class="tbl">
    <tr><th>a=[1,2,3], b=[4,5,6]</th><th>Result</th><th>Rule</th></tr>
    <tr><td><code>np.concatenate([a, b])</code></td><td>[1 2 3 4 5 6]</td><td>Join along an <em>existing</em> axis</td></tr>
    <tr><td><code>np.stack([a, b])</code></td><td>shape (2, 3)</td><td>Join along a <em>new</em> axis</td></tr>
    <tr><td><code>np.stack([a, b], axis=1)</code></td><td>shape (3, 2)</td><td>New axis at position 1</td></tr>
    <tr><td><code>np.vstack</code> / <code>np.hstack</code></td><td>[[1 2 3] [4 5 6]] / [1 2 3 4 5 6]</td><td>Rows / columns</td></tr>
    <tr><td><code>np.column_stack([a, b])</code></td><td>[[1 4] [2 5] [3 6]]</td><td>1-D arrays become columns</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Appending in a loop (<code>np.append</code>/<code>concatenate</code>) copies the whole array every time. For n pieces that is about n² work, written O(n²). Collect pieces in a Python list, then concatenate once.</p></div>

  <h2 id="dn-bc"><span class="num">06</span>Broadcasting &amp; Axes</h2>
  <p>Back to the marksheet. The board now gives different grace marks per subject: 5 in maths, 0 in science, 2 in English. The marksheet is 3×3, but the grace list has only 3 numbers. NumPy still adds them:</p>
  <div class="fx" data-lang="py">grace = np.array([5, 0, 2])        # one value per subject
print(sheet + grace)                # added to every student's row
print(sheet + 10)                   # one number: added to every cell</div>
  <div class="fx" data-lang="text">[[ 75  85  94]
 [ 65  75  90]
 [100  40  83]]
[[ 80  95 102]
 [ 70  85  98]
 [105  50  91]]</div>
  <p>NumPy pretended the grace row was repeated for every student, then added cell by cell. This automatic stretching of a smaller array to fit a bigger one is called <strong>broadcasting</strong>. It never actually copies the small array, so it is fast and saves memory.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A teacher writes the grace marks once on the board. Every student reads the same line and adds it to their own row. Nobody makes 30 photocopies.</p></div>
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
  <p>The picture shows a price table times a per-column factor (10% off, same, 10% more). The <strong>rule</strong> NumPy uses: write both shapes one under the other, lined up on the right. Compare each pair of numbers. They must be equal, or one of them must be 1 (a size-1 axis can be stretched). A missing number counts as 1.</p>
  <div class="fx" data-lang="py">prices = np.array([[100., 200., 300.], [400., 500., 600.]])
prices - prices.mean(axis=0)        # centre each column
# [[-150. -150. -150.]
#  [ 150.  150.  150.]]
np.array([[1], [2]]) + np.array([10, 20, 30])   # (2,1) + (3,) -&gt; (2,3)
# [[11 21 31]
#  [12 22 32]]
np.ones((2, 3)) + np.ones(2)
# ValueError: operands could not be broadcast together with shapes (2,3) (2,)</div>
  <p>Checking the error case: (2, 3) against (2,). Line up on the right: 3 vs 2. Not equal, and neither is 1, so it fails. Fix it by making the 2 a column: <code>np.ones(2)[:, None]</code> has shape (2, 1), and (2,3) vs (2,1) works.</p>
  <h3>The axis argument</h3>
  <p>Functions like <code>sum</code>, <code>mean</code> and <code>max</code> take <code>axis=</code>. On the marksheet, do you want the total per subject or the total per student?</p>
  <div class="fx" data-lang="py">print(sheet.sum(axis=0), sheet.sum(axis=1), sheet.mean(axis=0).round(1))</div>
  <div class="fx" data-lang="text">[225 200 261] [247 223 216] [75.  66.7 87. ]</div>
  <p><code>axis=0</code> runs down the rows and gives one answer per subject (column). <code>axis=1</code> runs across the columns and gives one answer per student (row). Maths total: 70 + 60 + 95 = 225. Student 1 total: 70 + 85 + 92 = 247.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="dn-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="60" y="20" width="150" height="60" class="fs" stroke="currentColor"/><text x="75" y="44">5  3  8</text><text x="75" y="68">2  7  1</text>
    <path d="M40 20 L40 80" stroke="currentColor" marker-end="url(#dn-ar2)"/><text x="5" y="54">axis 0</text>
    <path d="M60 100 L210 100" stroke="currentColor" marker-end="url(#dn-ar2)"/><text x="100" y="116">axis 1</text>
    <text x="250" y="34">sum(axis=0) → [7 10 9]  one per column</text>
    <text x="250" y="60">sum(axis=1) → [16 10]   one per row</text>
    <text x="250" y="86" class="tm">rows = stores, columns = days</text>
  </svg><figcaption>The axis you name is the one that disappears.</figcaption></figure>
  <p>An easy way to remember: the axis you name gets squashed. A (2, 3) array summed over axis 0 loses the 2 and becomes shape (3,).</p>
  <div class="callout intu"><span class="label">Key insight</span><p><code>keepdims=True</code> keeps the squashed axis as size 1, so the result can broadcast back. <code>x / x.sum(axis=1, keepdims=True)</code> divides each row by its own total, so every row adds up to 1.</p></div>

  <h2 id="dn-la"><span class="num">07</span>Linear Algebra &amp; Random</h2>
  <p>At a kirana shop you buy 2 packets of biscuits at ₹40, 1 soap at ₹25 and 3 pens at ₹10. The bill is 2×40 + 1×25 + 3×10 = 135. "Multiply matching items, then add" is called a <strong>dot product</strong>. In NumPy it is the <code>@</code> operator:</p>
  <div class="fx" data-lang="py">qty = np.array([2, 1, 3]); price = np.array([40, 25, 10])
print(qty * price, (qty * price).sum(), qty @ price)</div>
  <div class="fx" data-lang="text">[80 25 30] 135 135</div>
  <p><code>*</code> only multiplies item by item. <code>@</code> also adds them up. For 2-D arrays, <code>@</code> is <strong>matrix multiplication</strong>: a dot product of every row of the first with every column of the second. Machine learning models use this all the time (inputs @ weights).</p>
  <p>Another use: solving equations. "3 samosas and 1 chai cost ₹9. 1 samosa and 2 chai cost ₹8. What does each cost?" Written as a matrix <code>A</code> (the counts) and a vector <code>b</code> (the bills), the question is "find x so that A @ x = b". <code>np.linalg.solve</code> answers it: samosa ₹2, chai ₹3.</p>
  <div class="fx" data-lang="py">A = np.array([[3., 1.], [1., 2.]]);  b = np.array([9., 8.])
A @ A                  # [[10. 5.] [5. 5.]]  matrix product (same as np.dot for 2-D)
A * A                  # element-wise, NOT a matrix product
np.linalg.inv(A)       # [[ 0.4 -0.2] [-0.2  0.6]]
np.linalg.solve(A, b)  # [2. 3.]   solves Ax = b
np.linalg.det(A)       # 5.000000000000001
np.linalg.eigh(A)[0]   # [1.382 3.618]  eigenvalues (symmetric matrix)
np.array([1,2,3]) @ np.array([4,5,6])   # 32  dot product
np.linalg.norm([3, 4]) # 5.0</div>
  <p>Words in that block: <code>inv</code> is the <strong>inverse</strong> (the matrix that "undoes" A). <code>det</code> is the <strong>determinant</strong>, one number that is 0 when the equations have no single answer. <strong>Eigenvalues</strong> are special scaling factors of a matrix, used in PCA (a method to shrink many columns into a few). <code>norm</code> is a vector's length: the 3-4-5 triangle gives 5. The tiny 0.000000000000001 in <code>det</code> is normal floating-point rounding.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Never write <code>inv(A) @ b</code> to solve a system. <code>solve</code> is faster and gives less rounding error. For regression use <code>np.linalg.lstsq(X, y)</code>; it also works when X is not square (more rows than columns).</p></div>
  <h3>Random numbers you can repeat</h3>
  <p>ML needs random numbers: shuffling data, splitting train/test, starting weights. But you also want the <em>same</em> random numbers when you rerun, so results can be checked. A <strong>seed</strong> is the starting number for the random generator. Same seed, same sequence:</p>
  <div class="fx" data-lang="py">print(np.random.default_rng(7).integers(1, 7, 5), np.random.default_rng(7).integers(1, 7, 5))</div>
  <div class="fx" data-lang="text">[6 4 5 6 4] [6 4 5 6 4]</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A seed is like the starting position of a shuffled deck. Shuffle the same way from the same start, and you get the same cards in the same order.</p></div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(42)          # new Generator API: seeded, local
rng.integers(1, 7, size=5)               # [1 5 4 3 3]   dice (high excluded)
rng.normal(0, 1, size=3).round(3)        # [ 0.941 -1.951 -1.302]
rng.choice(["A", "B", "C"], size=5, p=[.6, .3, .1])   # ['B' 'B' 'A' 'A' 'A']
rng.permutation(5)                       # [1 0 4 3 2]</div>
  <p><code>integers</code> rolls dice (7 is excluded, so 1 to 6). <code>normal</code> draws from the bell curve. <code>choice</code> picks with given chances (60%, 30%, 10%). <code>permutation</code> shuffles 0 to 4.</p>
  <p>Prefer <code>default_rng(seed)</code> over the old <code>np.random.seed</code>. The <strong>Generator</strong> it returns is your own private object. Other code drawing random numbers cannot disturb your sequence.</p>

  <h2 id="dn-tasks"><span class="num">08</span>Interview Tasks</h2>
  <p>These are short "do it without a loop" tasks that come up often. Each line uses only ideas from the sections above.</p>
  <div class="fx" data-lang="py">a = np.array([3, 1, 4, 1, 5, 9, 2, 6])
np.argsort(a)[-3:][::-1]          # [5 7 4]  indices of top-3, sorted
np.argpartition(a, -3)[-3:]       # [4 7 5]  top-3 in O(n), unsorted
np.unique(a, return_counts=True)  # ([1 2 3 4 5 6 9], [2 1 1 1 1 1 1])
z = np.array([10., 20., 30., 40.])
(z - z.mean()) / z.std()          # [-1.342 -0.447  0.447  1.342]  z-score
np.nanmean([2., np.nan, 5.])      # 3.5   ignores NaN
np.clip(a, 2, 5)                  # [3 2 4 2 5 5 2 5]
np.eye(3, dtype=int)[[0, 2, 1]]   # one-hot encode labels 0,2,1
np.convolve([1,2,3,4,5,6.], np.ones(3)/3, mode="valid")   # [2. 3. 4. 5.] moving avg</div>
  <ul>
    <li><strong>argsort / argpartition</strong>: "arg" means they return <em>positions</em>, not values. Position 5 holds 9, the biggest. <code>argpartition</code> only puts the top 3 at the end without fully sorting, so it is faster on huge arrays.</li>
    <li><strong>z-score</strong>: how many standard deviations (the typical distance from the average) a value is from the mean. 10 is 1.34 below the average of 25.</li>
    <li><strong>NaN</strong> ("not a number") marks a missing value. <code>nanmean</code> skips it: (2 + 5) / 2 = 3.5.</li>
    <li><strong>clip</strong> caps values: below 2 becomes 2, above 5 becomes 5.</li>
    <li><strong>One-hot</strong>: label 2 becomes [0 0 1]. Rows of the identity matrix are exactly these patterns.</li>
    <li><strong>Moving average</strong>: the average of each window of 3: (1+2+3)/3 = 2, (2+3+4)/3 = 3, and so on.</li>
  </ul>
  <h3>Pairwise distances (a k-means step)</h3>
  <p>A delivery app has 4 customer points and 3 delivery hubs (called <strong>centroids</strong> in k-means). For each customer, which hub is closest? Broadcasting finds all 4 × 3 distances in one line:</p>
  <div class="fx" data-lang="py">X = np.array([[0, 0], [5, 5], [9, 0], [1, 1]])   # 4 points (x, y)
C = np.array([[9, 0], [0, 0], [5, 5]])           # 3 centroids
d = np.sqrt(((X[:, None, :] - C[None, :, :]) ** 2).sum(axis=2))   # (4,3)
print(X[:, None, :].shape, C[None, :, :].shape, d.shape)
print(d.round(1))
print(d.argmin(axis=1))           # nearest centroid per point</div>
  <div class="fx" data-lang="text">(4, 1, 2) (1, 3, 2) (4, 3)
[[9.  0.  7.1]
 [6.4 7.1 0. ]
 [0.  9.  6.4]
 [8.1 1.4 5.7]]
[1 2 0 1]</div>
  <p>Step by step: <code>X[:, None, :]</code> is (4, 1, 2) and <code>C[None, :, :]</code> is (1, 3, 2). Broadcasting stretches both to (4, 3, 2): every point minus every centroid. Square, sum the last axis (x and y), take the square root: that is the straight-line distance. Row 0 of <code>d</code> says point (0,0) is 0 away from centroid 1, so its answer is 1.</p>

  <h2 id="dn-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is NumPy faster than Python lists?</summary><div class="qa-body">Homogeneous dtype in contiguous memory, so operations run as compiled C loops (often SIMD) with no per-element type checks or pointer chasing. Lists hold pointers to boxed objects scattered in memory. Measured here: 23.8 ms loop vs 1.1 ms vectorized for 1M squares.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>[70, 85] * 2</code> give, and what does <code>np.array([70, 85]) * 2</code> give?</summary><div class="qa-body">The list repeats: <code>[70, 85, 70, 85]</code>. The array multiplies each item: <code>[140 170]</code>.</div></details>
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
