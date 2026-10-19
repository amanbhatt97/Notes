// notes/dataanalysis/da_numpy.js — NumPy
Object.assign(TOPIC_CONTENT, {
  "da_numpy": `<main>
  <h1>NumPy</h1>
  <div class="where"><span>Data Analysis</span><span>Arrays</span><span>NumPy</span></div>
  <p class="lead">NumPy is the Python library for doing maths on many numbers at once, fast. pandas, scikit-learn, Matplotlib and PyTorch are all built on its array type, so everything later in the Data Analysis track sits on what you learn here. This note builds NumPy as one chain of needs: Python lists are slow for numbers, so we get the <code>ndarray</code>; once we have arrays we need to describe them (shape, dtype), pick parts of them (slicing, and the view-vs-copy trap), filter them (masks), compute on them (ufuncs), summarise them (axis), combine arrays of different shapes (broadcasting), rearrange them (reshape, stack), solve equations with them (linear algebra), fill them with reproducible random data, and finally keep them fast and small. The running example is the same one the whole track uses: a food-delivery company's orders, eight of them small enough to check by hand, and a 1,000-row version built in section 11. Run on NumPy 2.5 and Python 3.13, single-threaded.</p>

  <h2 id="dn-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 250" width="640">
<defs><marker id="dn-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="120" y="6" width="400" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Python lists, loops, functions · Descriptive statistics</text>
<line x1="320" y1="42" x2="320" y2="64" stroke="currentColor" marker-end="url(#dn-ga)"/>
<rect x="20" y="66" width="140" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="90" y="85" text-anchor="middle" font-size="12" font-weight="700">NumPy</text>
<text x="90" y="100" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · arrays</text>
<rect x="180" y="66" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="250" y="85" text-anchor="middle" font-size="12">Pandas</text>
<text x="250" y="100" text-anchor="middle" class="tm" font-size="10">labelled tables</text>
<rect x="340" y="66" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="410" y="85" text-anchor="middle" font-size="12">Matplotlib &amp; Seaborn</text>
<text x="410" y="100" text-anchor="middle" class="tm" font-size="10">static charts</text>
<rect x="500" y="66" width="130" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="565" y="85" text-anchor="middle" font-size="12">Plotly &amp; Streamlit</text>
<text x="565" y="100" text-anchor="middle" class="tm" font-size="10">interactive apps</text>
<line x1="160" y1="88" x2="178" y2="88" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#dn-ga)"/>
<line x1="320" y1="88" x2="338" y2="88" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#dn-ga)"/>
<line x1="480" y1="88" x2="498" y2="88" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#dn-ga)"/>
<rect x="20" y="130" width="610" height="44" rx="8" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
<text x="325" y="148" text-anchor="middle" font-size="11">one running example across the track: food-delivery orders</text>
<text x="325" y="164" text-anchor="middle" class="tm" font-size="10">order_id · customer · restaurant · city · order_time · amount · delivery_minutes</text>
<line x1="320" y1="174" x2="320" y2="198" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dn-ga)"/>
<rect x="60" y="200" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="217" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="235" text-anchor="middle" font-size="11">Linear algebra · Machine learning (X is an array) · Deep learning tensors</text>
</svg><figcaption>The Data Analysis track. NumPy is first because every tool after it stores its numbers in NumPy arrays. The dotted arrows are the reading order, and all four notes use the same delivery orders.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_lists_tuples">Lists &amp; Tuples</a> and <a class="xref" data-note="st_descriptive">Descriptive Statistics</a></b><span>A Python list can hold our order amounts, and a loop can total them. Statistics told us what to compute (mean, standard deviation, z-scores). What neither gave us is a way to do that maths on a million numbers without waiting, and without writing a loop for every formula.</span></li>
    <li><b>This note adds: the ndarray and its toolkit</b><span>One block of same-typed numbers, plus the operations that run over the whole block in compiled code: indexing, masks, ufuncs, axis aggregation, broadcasting, reshaping, linear algebra, random numbers.</span></li>
    <li><b>Leads to: <a class="xref" data-note="da_pandas">Pandas</a></b><span>An array has positions but no names: column 1 is "amount" only because we remember it. pandas wraps NumPy arrays with row and column labels and mixed column types (start with <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a>). Then <a class="xref" data-note="da_viz">Matplotlib &amp; Seaborn</a> draw these arrays, <a class="xref" data-note="m_linalg">Linear Algebra</a> explains what <code>@</code> and <code>solve</code> mean, and every model in <a class="xref" data-note="ml_regression">Linear Regression</a> onwards takes an array <code>X</code>.</span></li>
  </ol>

  <h2 id="dn-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers come from the eight-order running example.</p>
  <ol class="story">
    <li><b>Lists are slow for numbers</b><span>Q: can plain Python do maths on order amounts? → Yes, with a loop for every formula, and <code>amounts * 2</code> repeats the list instead of doubling it. Measured on 1M amounts: 20.1 ms for a list loop, 32 MB of memory. Is there a container made for numbers?</span></li>
    <li><b>The ndarray</b><span>Q: what container does maths on all items at once? → One dtype, one contiguous block: <code>amounts * 1.05</code> works, the same total takes 0.96 ms and 8 MB. But a table of orders has rows and columns; how do we describe its layout?</span></li>
    <li><b>shape, dtype, ndim (and strides)</b><span>Q: what exactly is inside an array? → <code>X</code> (amount, minutes) has shape (8, 2), ndim 2, dtype int64, strides (16, 8). Now: how do we pick out one order, or one column?</span></li>
    <li><b>Indexing &amp; slicing (views)</b><span>Q: how do we take parts? → <code>X[2, 0]</code> = 610, <code>X[:, 1]</code> = the minutes column, <code>amounts[:3]</code> = first three orders. Trap: a slice is a <em>view</em>; zeroing <code>lunch[0]</code> zeroed order 1 in the original. But slices only take ranges of positions; how do we pick "all Pune orders"?</span></li>
    <li><b>Boolean &amp; fancy indexing (copies)</b><span>Q: how do we select by a condition, or by a list of positions? → <code>amounts[city == "Pune"]</code> = [450 610 150], total 1,210; <code>argsort</code> + fancy indexing sorts the orders. These return copies. We can now pick numbers; how do we compute on all of them?</span></li>
    <li><b>Vectorised ufuncs</b><span>Q: how do we apply a formula to every element? → ufuncs: <code>np.maximum(minutes - 30, 0)</code> = minutes late [2 0 11 0 0 15 0 0]; about 50x faster than a Python loop. But many questions are summaries: total per city, average per column…</span></li>
    <li><b>Aggregations with axis</b><span>Q: how do we summarise a 2-D table by rows or by columns? → city × meal revenue table: <code>sum(axis=0)</code> = [1280 1820] per meal, <code>sum(axis=1)</code> = [1210 1240 650] per city. Now we have a (2,) row of column means and an (8, 2) table: can we subtract one from the other?</span></li>
    <li><b>Broadcasting</b><span>Q: how do arrays of different shapes combine? → align shapes from the right, each pair equal or 1: (8, 2) − (2,) centres every column; z-scores in one line. (3, 2) / (3, 1) gives row shares. Sometimes the data is the right numbers in the wrong shape…</span></li>
    <li><b>Reshaping &amp; stacking</b><span>Q: how do we change shape or join arrays? → <code>reshape(-1, 1)</code> for scikit-learn, <code>column_stack</code> built <code>X</code>, <code>stack</code> adds an axis. With tables in the right shape, can we solve equations with them?</span></li>
    <li><b>Linear algebra</b><span>Q: rider pay for every order, and the unknown pay rule? → <code>A @ w</code> = pay [84 70 102 …]; <code>solve</code> recovers ₹20 base + ₹2/min; <code>lstsq</code> fits minutes ≈ 12.3 + 0.0456 × amount. To test ideas at scale we need more data than 8 orders…</span></li>
    <li><b>Random (Generator, seeds)</b><span>Q: how do we make realistic, repeatable data and splits? → <code>default_rng(42)</code>; <code>make_orders()</code> builds 1,000 orders, identical on every run. Big arrays bring the last question: is our code fast and lean?</span></li>
    <li><b>Performance &amp; memory</b><span>Q: what keeps NumPy fast and small? → stay vectorised (np.vectorize is a loop), pick dtypes (float32 halves memory, int16 overflows at 32,767), work in place (2.0 vs 7.6 ms), never grow arrays in a loop (76 ms vs 0.37 ms).</span></li>
  </ol>

  <h2 id="dn-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">NumPy</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why NumPy</div>
        <ul>
          <li><b>Lists</b> — pointers to boxed objects; <code>list * 2</code> repeats; maths needs loops</li>
          <li><b>ndarray</b> — one dtype, one contiguous block; C loops over raw bytes</li>
          <li><b>Measured</b> — 1M amounts: list loop 20.1 ms, vectorised 0.96 ms; 32 MB vs 8 MB</li>
          <li>⚠ <b>Python loop over an ndarray</b> — slowest of all (119 ms)</li>
          <li>💡 list = loose eggs in bags; array = one egg tray</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Describe an array</div>
        <ul>
          <li><b>shape / ndim / size</b> — X: (8, 2) / 2 / 16</li>
          <li><b>dtype</b> — int64, float64, &lt;U6; mixing upcasts (one string → all text)</li>
          <li><b>strides</b> — (16, 8): bytes per step; <code>.T</code> just swaps them</li>
          <li><b>Create</b> — zeros, ones, full, eye, arange (stop out), linspace (stop in)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Select</div>
        <ul>
          <li><b>Slice</b> — <code>X[1:3, :]</code>, <code>X[:, 1]</code>, <code>a[::-1]</code> → <b>view</b></li>
          <li><b>Mask</b> — <code>amounts[city == "Pune"]</code> → copy; <code>mask.mean()</code> = share</li>
          <li><b>Fancy</b> — <code>a[[0, 5]]</code>, <code>a[np.argsort(a)]</code> → copy</li>
          <li><b>np.where(cond, a, b)</b> — vectorised if/else</li>
          <li>⚠ <code>&amp;</code> <code>|</code> <code>~</code> with parentheses, never and/or</li>
          <li>⚠ <b>a[mask][0] = x</b> edits a temporary copy</li>
          <li>💡 view = window, copy = photo</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Compute</div>
        <ul>
          <li><b>ufunc</b> — element-wise compiled loop: + * maximum sqrt log</li>
          <li><b>.reduce / .accumulate / .outer</b> — sum, running sum, every pair</li>
          <li><b>NaN</b> spreads; use nanmean/nansum</li>
          <li>⚠ <b>np.vectorize</b> is a Python loop in disguise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Summarise &amp; Broadcast</div>
        <ul>
          <li><b>axis=k</b> — the axis that disappears: (3,2).sum(axis=0) → (2,)</li>
          <li><b>Rule</b> — align shapes from the right; each pair equal or 1</li>
          <li><b>z-score</b> — <code>(X - X.mean(0)) / X.std(0)</code></li>
          <li><b>keepdims=True</b> — (3,1) so it broadcasts back: row shares</li>
          <li><b>[:, None]</b> — make a column to get a 2-D "every pair" table</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shape</div>
        <ul>
          <li><b>reshape(-1, 1)</b> — -1 = infer; same total size</li>
          <li><b>concatenate</b> existing axis · <b>stack</b> new axis · <b>column_stack</b></li>
          <li><b>ravel</b> view when possible · <b>flatten</b> always copy</li>
          <li>⚠ <b>Growing in a loop</b> — O(n²): 76 ms vs 0.37 ms</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Linear Algebra &amp; Random</div>
        <ul>
          <li><b>@</b> — matrix product: pay = A @ [20, 2]; <b>*</b> element-wise</li>
          <li><b>solve(A, b)</b> — exact system; ⚠ not inv(A) @ b</li>
          <li><b>lstsq</b> — best-fit line: minutes ≈ 12.3 + 0.0456·amount</li>
          <li><b>default_rng(seed)</b> — own Generator: integers, normal, choice, permutation</li>
          <li>⚠ <b>np.random.seed</b> — global, any library draw shifts it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fast &amp; Lean</div>
        <ul>
          <li><b>dtype</b> — float32 half of float64; int16 wraps past 32,767</li>
          <li><b>In place</b> — <code>v *= 1.05</code>: no new array</li>
          <li><b>Views</b> — slicing is free; masks copy</li>
          <li><b>Tasks</b> — argpartition top-k, unique counts, one-hot <code>eye(k)[codes]</code>, moving average, pairwise distances</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dn-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="dn-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Lists Are Slow for Numbers</span><span class="rm-sub">The need, measured</span></div></div>
      <div class="rm-item rm-done" data-target="dn-nd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The ndarray</span><span class="rm-sub">One dtype, one block</span></div></div>
      <div class="rm-item rm-done" data-target="dn-shape"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">shape, dtype, ndim</span><span class="rm-sub">Describing an array</span></div></div>
      <div class="rm-item rm-done" data-target="dn-slice"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Indexing &amp; Slicing</span><span class="rm-sub">Views, and the trap</span></div></div>
      <div class="rm-item rm-done" data-target="dn-mask"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Boolean &amp; Fancy Indexing</span><span class="rm-sub">Filters and copies</span></div></div>
      <div class="rm-item rm-done" data-target="dn-ufunc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Vectorised ufuncs</span><span class="rm-sub">A formula on every element</span></div></div>
      <div class="rm-item rm-done" data-target="dn-axis"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Aggregations &amp; axis</span><span class="rm-sub">Per row, per column</span></div></div>
      <div class="rm-item rm-done" data-target="dn-bc"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Broadcasting</span><span class="rm-sub">Rules traced by hand</span></div></div>
      <div class="rm-item rm-done" data-target="dn-reshape"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Reshape &amp; Stack</span><span class="rm-sub">Change shape, join arrays</span></div></div>
      <div class="rm-item rm-done" data-target="dn-la"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Linear Algebra</span><span class="rm-sub">@, solve, lstsq</span></div></div>
      <div class="rm-item rm-done" data-target="dn-rand"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Random &amp; Seeds</span><span class="rm-sub">Generator, 1,000 orders</span></div></div>
      <div class="rm-item rm-done" data-target="dn-perf"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Performance &amp; Memory</span><span class="rm-sub">dtypes, in place, no loops</span></div></div>
      <div class="rm-item rm-done" data-target="dn-tasks"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Tasks</span><span class="rm-sub">Top-k, one-hot, distances</span></div></div>
      <div class="rm-item rm-done" data-target="dn-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dn-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="dn-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dn-need"><span class="num">01</span>Lists Are Slow for Numbers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>From the Python notes we can store order amounts in a list and total them with a loop. A delivery company has lakhs of orders a day and wants dozens of formulas on them (fees, z-scores, late minutes). Can plain lists do number-crunching at that size, and how much does it cost?</p>
  </div>
  <h3>The running example</h3>
  <p>A food-delivery company, Monday 3 March 2025. Eight orders, the same columns the <a class="xref" data-note="da_pandas">Pandas</a> notes use. Every hand calculation in this note uses these numbers.</p>
  <table class="tbl"><caption>The running example: 8 orders</caption>
    <tr><th>order_id</th><th>customer</th><th>restaurant</th><th>city</th><th>order_time</th><th>amount (₹)</th><th>delivery_minutes</th></tr>
    <tr><td>1</td><td>Asha</td><td>Pizza Hub</td><td>Pune</td><td>12:10</td><td>450</td><td>32</td></tr>
    <tr><td>2</td><td>Ben</td><td>Dosa Point</td><td>Delhi</td><td>12:25</td><td>220</td><td>25</td></tr>
    <tr><td>3</td><td>Chen</td><td>Biryani Bros</td><td>Pune</td><td>13:05</td><td>610</td><td>41</td></tr>
    <tr><td>4</td><td>Dia</td><td>Pizza Hub</td><td>Mumbai</td><td>19:40</td><td>380</td><td>28</td></tr>
    <tr><td>5</td><td>Asha</td><td>Dosa Point</td><td>Pune</td><td>20:15</td><td>150</td><td>18</td></tr>
    <tr><td>6</td><td>Esha</td><td>Biryani Bros</td><td>Delhi</td><td>20:30</td><td>720</td><td>45</td></tr>
    <tr><td>7</td><td>Ben</td><td>Pizza Hub</td><td>Delhi</td><td>21:00</td><td>300</td><td>30</td></tr>
    <tr><td>8</td><td>Dia</td><td>Dosa Point</td><td>Mumbai</td><td>21:20</td><td>270</td><td>21</td></tr>
  </table>
  <p>Totals worth remembering: amounts add to ₹3,100 (mean ₹387.5), minutes add to 240 (mean 30).</p>
  <h3>What a list does with maths</h3>
  <p>The company adds a 5% platform fee to every order. Try it with a list:</p>
  <div class="fx" data-lang="py"># the 8 orders from the running example: amount in ₹
amounts_list = [450, 220, 610, 380, 150, 720, 300, 270]

print(amounts_list * 2)                         # a list repeats itself!
print([a * 1.05 for a in amounts_list])         # 5% platform fee: you must write a loop</div>
  <div class="fx" data-lang="text">[450, 220, 610, 380, 150, 720, 300, 270, 450, 220, 610, 380, 150, 720, 300, 270]
[472.5, 231.0, 640.5, 399.0, 157.5, 756.0, 315.0, 283.5]</div>
  <p>A Python list is a general-purpose box: it can hold numbers, strings and other lists side by side, so it does not know that "times 2" should mean "multiply each number". <code>*</code> on a list means "repeat the list". To do maths you write a loop, or a comprehension (a loop in one line), for every formula.</p>
  <h3>Why lists are slow: what is inside</h3>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <text x="10" y="18">Python list: array of pointers</text>
    <rect x="10" y="28" width="40" height="28" class="fs" stroke="currentColor"/><rect x="50" y="28" width="40" height="28" class="fs" stroke="currentColor"/><rect x="90" y="28" width="40" height="28" class="fs" stroke="currentColor"/><rect x="130" y="28" width="40" height="28" class="fs" stroke="currentColor"/>
    <g stroke="currentColor" fill="none"><path d="M30 56 L60 110"/><path d="M70 56 L170 135"/><path d="M110 56 L25 135"/><path d="M150 56 L230 105"/></g>
    <rect x="40" y="108" width="54" height="24" class="fr sr"/><text x="46" y="125">int 450</text>
    <rect x="150" y="132" width="54" height="24" class="fr sr"/><text x="156" y="149">int 220</text>
    <rect x="5" y="134" width="54" height="24" class="fr sr"/><text x="11" y="151">int 610</text>
    <rect x="210" y="96" width="54" height="24" class="fr sr"/><text x="216" y="113">int 380</text>
    <text x="320" y="18">ndarray: one contiguous block</text>
    <rect x="320" y="28" width="60" height="28" class="fb sb"/><rect x="380" y="28" width="60" height="28" class="fb sb"/><rect x="440" y="28" width="60" height="28" class="fb sb"/><rect x="500" y="28" width="60" height="28" class="fb sb"/>
    <text x="330" y="47">450</text><text x="390" y="47">220</text><text x="450" y="47">610</text><text x="510" y="47">380</text>
    <text x="320" y="90" class="tg">8 bytes each, same type, no pointers:</text><text x="320" y="108" class="tg">a C loop streams through the raw bytes</text>
    <text x="10" y="184" class="tm">each Python number is a ~28-32 B object + an 8 B pointer, scattered in memory</text>
  </svg><figcaption>A list scatters boxed number objects around memory and keeps only their addresses; an array packs raw numbers side by side.</figcaption></figure>
  <p>On the left, the list stores only <em>pointers</em> (memory addresses). For each item Python must follow the address, check "what type is this?", find the right <code>*</code> for that type, and build a brand-new number object for the answer. That bookkeeping costs far more than the multiplication itself.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A list is loose eggs in many separate bags around the kitchen: to wash them you open each bag, check it really holds an egg, wash it, and put it in a new bag. An array is one egg tray: all eggs the same size, side by side, washed in one sweep.</p></div>
  <h3>Measured</h3>
  <p>Same idea at scale: one million order amounts. Each version adds the 5% fee and totals the result. <code>timeit.repeat</code> runs each 5 times and we keep the fastest.</p>
  <div class="fx" data-lang="py">import timeit, sys
import numpy as np

rng = np.random.default_rng(0)
big = rng.integers(100, 1000, 1_000_000).astype(float)   # 1M order amounts, same idea at scale
big_list = big.tolist()                                   # the same numbers as a Python list

def loop_list():                       # what we'd write without NumPy
    total = 0.0
    for a in big_list:
        total += a * 1.05
    return total

def loop_array():                      # a Python loop, but over an ndarray
    total = 0.0
    for a in big:
        total += a * 1.05
    return total

for name, f in [("loop over list", loop_list),
                ("loop over ndarray", loop_array),
                ("(big * 1.05).sum()", lambda: (big * 1.05).sum())]:
    t = min(timeit.repeat(f, number=1, repeat=5))
    print(f"{name:20s} {t*1e3:8.2f} ms")

list_bytes = sys.getsizeof(big_list) + sum(sys.getsizeof(v) for v in big_list)
print(f"list memory  {list_bytes/1e6:.1f} MB   array memory {big.nbytes/1e6:.1f} MB")</div>
  <div class="fx" data-lang="text">loop over list          20.05 ms
loop over ndarray      118.83 ms
(big * 1.05).sum()       0.96 ms
list memory  32.0 MB   array memory 8.0 MB</div>
  <p>Read it: the list loop takes about 20 ms. The one-line NumPy version, <code>(big * 1.05).sum()</code>, takes under 1 ms, roughly 20x faster, and stores the numbers in 8 MB instead of 32 MB (8 bytes per number instead of a ~32-byte object). The middle line is the surprise: a Python <code>for</code> loop over a NumPy array is the slowest of the three, because NumPy has to wrap every raw number into a Python object before handing it to your loop.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Vectorisation</strong>: expressing a computation as whole-array operations (<code>big * 1.05</code>) so the loop runs in compiled C code inside NumPy, instead of a Python loop over elements.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Importing NumPy is not enough. A Python loop over an ndarray (119 ms) is slower than the plain list loop (20 ms). NumPy is fast only when NumPy does the loop.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The ndarray.</b> We saw that an "array" fixes both speed and memory. What exactly is this object, what does "one dtype, one block" mean, and what does it give up compared with a list?</div>

  <h2 id="dn-nd"><span class="num">02</span>The ndarray</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Lists failed because each item is a separate object of unknown type. What container stores numbers so that one operation can run over all of them at C speed, and what rules does it impose?</p>
  </div>
  <p>NumPy's container is the <strong>ndarray</strong> ("n-dimensional array"). In plain words it is a block of memory holding raw numbers, all of the same type, side by side, plus a small header that says how to read the block. Because every element has the same type and size, NumPy knows where element 5 is (start + 5 × 8 bytes) and which machine instruction to use, without checking anything per element.</p>
  <div class="fx" data-lang="py">amounts = np.array([450, 220, 610, 380, 150, 720, 300, 270])
print(amounts * 1.05)                  # one call, every order
print(amounts + 40)                    # ₹40 delivery fee on every order
print(type(amounts).__name__, amounts.dtype, amounts.itemsize, "bytes each,", amounts.nbytes, "bytes total")
print(amounts.flags["C_CONTIGUOUS"])   # one unbroken block of memory

print(np.array([1, 2, 3.5]).dtype)     # one float -&gt; everything becomes float64
print(np.array([450, "Pune"]))         # one string -&gt; everything becomes text!</div>
  <div class="fx" data-lang="text">[472.5 231.  640.5 399.  157.5 756.  315.  283.5]
[490 260 650 420 190 760 340 310]
ndarray int64 8 bytes each, 64 bytes total
True
float64
['450' 'Pune']</div>
  <p>Line by line: <code>amounts * 1.05</code> applies the fee to all 8 orders, and <code>amounts + 40</code> adds a ₹40 delivery fee to each: no loop. The array's <strong>dtype</strong> (data type) is <code>int64</code>: whole numbers stored in 64 bits = 8 bytes each, so 8 orders take 64 bytes. <code>C_CONTIGUOUS</code> True means the numbers sit in one unbroken block, row after row (the "C" order, named after the C language).</p>
  <p>The price of "one dtype": when you mix types, NumPy picks one type that can hold everything, called <strong>upcasting</strong>. One decimal turns all integers into floats. One string turns everything into text, so <code>'450'</code> is no longer a number and maths on it fails.</p>
  <table class="tbl">
    <tr><th></th><th>Python list</th><th>NumPy ndarray</th></tr>
    <tr><td>Item types</td><td>anything, mixed</td><td>one dtype for all</td></tr>
    <tr><td>Memory</td><td>pointers to objects scattered around</td><td>one contiguous block of raw values</td></tr>
    <tr><td><code>x * 2</code></td><td>repeats the list</td><td>multiplies every element</td></tr>
    <tr><td>Size</td><td>grows cheaply with <code>append</code></td><td>fixed; "growing" makes a new array</td></tr>
    <tr><td>1M numbers</td><td>~32 MB, 20 ms loop</td><td>8 MB, under 1 ms</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>ndarray</strong> is a fixed-size, homogeneous (single dtype) grid of values stored in a contiguous buffer, with metadata (shape, dtype, strides) that says how to walk the buffer.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>np.array([450, "Pune"])</code> does not fail; it silently becomes an array of strings. When a CSV column of numbers has one stray word, the whole column arrives as text. Check <code>.dtype</code> after loading data.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: shape, dtype, ndim.</b> One row of amounts is easy. Our orders are a table: 8 rows, several numeric columns. How does an array describe a table's layout, and how does it find "row 3, column 2" in one flat block of memory?</div>

  <h2 id="dn-shape"><span class="num">03</span>shape, dtype, ndim</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want the amounts and delivery minutes of all 8 orders in one table. The memory block is flat. What tells NumPy that it is "8 rows of 2", and how do we read that description?</p>
  </div>
  <p>Each direction of a table is called an <strong>axis</strong>. A row of amounts has one axis. Our orders table, orders down and columns across, has two: axis 0 runs down the rows, axis 1 across the columns. Put the two numeric columns side by side:</p>
  <div class="fx" data-lang="py">minutes = np.array([32, 25, 41, 28, 18, 45, 30, 21])      # delivery_minutes
X = np.column_stack([amounts, minutes])                   # 8 orders x 2 numeric columns
print(X[:3])
print("shape", X.shape, "| ndim", X.ndim, "| size", X.size, "| dtype", X.dtype)
print("strides", X.strides, "| X.T strides", X.T.strides)
print(X[2, 0], X[2], X[:, 1])          # one cell, one order (row), one column</div>
  <div class="fx" data-lang="text">[[450  32]
 [220  25]
 [610  41]]
shape (8, 2) | ndim 2 | size 16 | dtype int64
strides (16, 8) | X.T strides (8, 16)
610 [610  41] [32 25 41 28 18 45 30 21]</div>
  <table class="tbl">
    <tr><th>Attribute</th><th>Value for X</th><th>Meaning</th></tr>
    <tr><td><code>shape</code></td><td>(8, 2)</td><td>length of each axis: 8 orders, 2 columns</td></tr>
    <tr><td><code>ndim</code></td><td>2</td><td>number of axes</td></tr>
    <tr><td><code>size</code></td><td>16</td><td>total elements = 8 × 2</td></tr>
    <tr><td><code>dtype</code></td><td>int64</td><td>the one type every element shares</td></tr>
    <tr><td><code>strides</code></td><td>(16, 8)</td><td>bytes to jump for the next row / next column</td></tr>
  </table>
  <p><strong>Strides, by hand.</strong> In memory X is one row of 16 numbers: 450, 32, 220, 25, 610, 41, … Each takes 8 bytes. Moving one column right means moving 1 number = 8 bytes. Moving one row down means skipping a whole row of 2 numbers = 16 bytes. So element <code>X[2, 0]</code> lives at byte 2 × 16 + 0 × 8 = 32, which is the 5th number, 610. The transpose <code>X.T</code> (rows and columns swapped) copies nothing: it just swaps the strides to (8, 16) and reads the same bytes in a different order.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cinema with seats numbered 1 to 16 along one long corridor. The usher's card says "8 rows of 2 seats, a row is 2 seats long". Row 3, seat 1 is seat 5. Hand the usher a different card ("2 rows of 8") and the same seats form a different hall. The card is the shape and strides; the seats never move.</p></div>
  <p>Ways to create arrays without typing every value:</p>
  <div class="fx" data-lang="py">print(np.zeros((2, 3)))                # a blank 2x3 table
print(np.arange(0, 10, 3))             # like range: stop excluded
print(np.linspace(0, 1, 5))            # 5 evenly spaced points, stop included
print(np.full((2, 2), 40))             # a table of ₹40 fees
print(np.eye(3, dtype=int))            # identity matrix
print(np.ones_like(minutes)[:4])       # same shape and dtype as minutes</div>
  <div class="fx" data-lang="text">[[0. 0. 0.]
 [0. 0. 0.]]
[0 3 6 9]
[0.   0.25 0.5  0.75 1.  ]
[[40 40]
 [40 40]]
[[1 0 0]
 [0 1 0]
 [0 0 1]]
[1 1 1 1]</div>
  <p><code>arange</code> works like Python's <code>range</code>: a step size, stop excluded. <code>linspace</code> asks "how many points?" and includes the stop. <code>full</code> fills a shape with one value, <code>eye</code> makes an identity matrix (1s on the diagonal, used for one-hot encoding in section 13), and <code>ones_like</code> copies another array's shape and dtype.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>shape</strong>: tuple of axis lengths. <strong>ndim</strong>: number of axes (<code>len(shape)</code>). <strong>size</strong>: product of the shape. <strong>dtype</strong>: element type. <strong>strides</strong>: bytes to step along each axis.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Shape <code>(8,)</code> (a flat row of 8) is not shape <code>(8, 1)</code> (a column) nor <code>(1, 8)</code> (a one-row table). They print differently and broadcast differently (section 08). When a library says "expected 2D array, got 1D", it wants <code>(8, 1)</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Indexing &amp; Slicing.</b> We can describe the table. Now: how do we pull out one order, the first three orders, or the whole minutes column, and what happens if we change the piece we pulled out?</div>

  <h2 id="dn-slice"><span class="num">04</span>Indexing &amp; Slicing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Average delivery time" needs only column 1 of X. "Refund the lunch orders" needs only the first three orders. How do we take parts of an array, and is the part a separate thing or still connected to the original?</p>
  </div>
  <p><strong>Indexing</strong> picks single elements by position, counting from 0. A <strong>slice</strong> <code>start:stop:step</code> takes a range; stop is excluded; a bare <code>:</code> means "everything along this axis". For a 2-D array you give one index or slice per axis, separated by a comma: <code>[rows, columns]</code>.</p>
  <div class="fx" data-lang="py">print(amounts[0], amounts[-1])         # first and last order
print(amounts[2:5])                    # orders 3, 4, 5 (positions 2, 3, 4)
print(amounts[::2])                    # every second order
print(amounts[::-1])                   # reversed
print(X[1:3, :])                       # rows 1-2, all columns
print(X[:, 0].mean(), X[:, 1].mean())  # average amount, average minutes</div>
  <div class="fx" data-lang="text">450 270
[610 380 150]
[450 610 150 300]
[270 300 720 150 380 610 220 450]
[[220  25]
 [610  41]]
387.5 30.0</div>
  <p><code>amounts[2:5]</code> takes positions 2, 3, 4: orders 3, 4, 5 (610, 380, 150). <code>::2</code> means every second, <code>::-1</code> walks backwards. <code>X[1:3, :]</code> is rows 1 and 2 with all columns. <code>X[:, 1].mean()</code> is the average delivery time, 30 minutes, matching our hand total 240 / 8.</p>
  <h3>Views: the slice is still connected</h3>
  <p>Here is the surprise. The support team refunds order 1 by setting its amount to 0 in the "lunch" slice. Watch the original:</p>
  <div class="fx" data-lang="py">a = amounts.copy()                     # work on a copy so the running example stays intact
lunch = a[:3]                          # slice -&gt; VIEW
lunch[0] = 0                           # "refund order 1"
print("a     ", a)                     # the original changed!
print("shares memory?", np.shares_memory(a, lunch), "| lunch.base is a?", lunch.base is a)

b = amounts.copy()
lunch_copy = b[:3].copy()              # explicit copy
lunch_copy[0] = 0
print("b     ", b)                     # untouched
print("shares memory?", np.shares_memory(b, lunch_copy))</div>
  <div class="fx" data-lang="text">a      [  0 220 610 380 150 720 300 270]
shares memory? True | lunch.base is a? True
b      [450 220 610 380 150 720 300 270]
shares memory? False</div>
  <p>Changing <code>lunch</code> changed <code>a</code>. A NumPy slice does not copy numbers; it is a new header (shape, strides, starting point) looking at the <em>same</em> memory. This is called a <strong>view</strong>. <code>lunch.base is a</code> confirms whose memory it borrows. <code>.copy()</code> makes an independent array with its own memory.</p>
  <table class="tbl out"><caption>Traced: one buffer, two headers</caption>
    <tr><th>buffer position</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
    <tr><td>value before</td><td>450</td><td>220</td><td>610</td><td>380</td><td>150</td><td>720</td><td>300</td><td>270</td></tr>
    <tr><td><code>a</code> sees</td><td>a[0]</td><td>a[1]</td><td>a[2]</td><td>a[3]</td><td>a[4]</td><td>a[5]</td><td>a[6]</td><td>a[7]</td></tr>
    <tr><td><code>lunch = a[:3]</code> sees</td><td>lunch[0]</td><td>lunch[1]</td><td>lunch[2]</td><td></td><td></td><td></td><td></td><td></td></tr>
    <tr><td>after <code>lunch[0] = 0</code></td><td><b>0</b></td><td>220</td><td>610</td><td>380</td><td>150</td><td>720</td><td>300</td><td>270</td></tr>
  </table>
  <p>There is only one row of numbers. <code>lunch[0]</code> and <code>a[0]</code> are two names for buffer position 0, so writing through either name changes what both see.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A view is a window onto a room; a copy is a photo of it. Move the sofa and everyone looking through the window sees it moved; the photo still shows the old room.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="dn-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <text x="10" y="30">a</text><text x="10" y="80">lunch = a[:3]</text>
    <path d="M30 26 L188 50" stroke="currentColor" marker-end="url(#dn-ar)"/><path d="M110 76 L188 62" stroke="currentColor" marker-end="url(#dn-ar)"/>
    <rect x="190" y="40" width="200" height="34" class="fb sb"/><text x="198" y="62">one buffer [0 220 610 ...]</text>
    <text x="420" y="30">lunch_copy = b[:3].copy()</text>
    <path d="M470 36 L470 50" stroke="currentColor" marker-end="url(#dn-ar)"/>
    <rect x="420" y="52" width="160" height="34" class="fg sg"/><text x="430" y="74">its own buffer</text>
    <text x="10" y="112" class="tm">slices, reshape, .T = views (shared memory) · .copy(), masks, fancy indexing = copies</text>
  </svg><figcaption>Writing through a view changes the original; writing to a copy doesn't.</figcaption></figure>
  <h3>Where the trap really bites: inside a function</h3>
  <div class="fx" data-lang="py">def with_discount(arr):
    first_three = arr[:3]              # looks harmless...
    first_three *= 0.9                 # ...but writes into the caller's array
    return first_three

c = amounts.astype(float)              # astype makes a new array (a copy)
print(with_discount(c))
print(c)                               # the caller's data was changed too</div>
  <div class="fx" data-lang="text">[405. 198. 549.]
[405. 198. 549. 380. 150. 720. 300. 270.]</div>
  <p>The function looked like it only computed a discounted copy of the first three orders. Because <code>arr[:3]</code> is a view and <code>*=</code> writes in place, the caller's amounts 450, 220, 610 became 405, 198, 549. Inside a big pipeline this shows up hours later as "why are my totals 10% low?".</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>view</strong> is an array that shares its data buffer with another array (<code>v.base</code> is that array; <code>np.shares_memory</code> is True). A <strong>copy</strong> owns a new buffer. Basic slicing (<code>start:stop:step</code>, single integers) always returns a view.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Slices are views. If you will modify a slice, or a function receives an array it must not change, call <code>.copy()</code> first. A small view also keeps its whole parent array alive in memory: slice 10 rows out of a 1 GB array and the 1 GB stays allocated until you copy.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Boolean &amp; Fancy Indexing.</b> Slices pick ranges of positions. Real questions pick by a condition ("all Pune orders", "late deliveries") or by an arbitrary list of positions ("orders sorted by amount"). How do we do that, and are those results views too?</div>

  <h2 id="dn-mask"><span class="num">05</span>Boolean &amp; Fancy Indexing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pune orders are at positions 0, 2, 4: not a range a slice can express. How do we select by a condition, or by any list of positions, without a loop?</p>
  </div>
  <h3>Boolean masks</h3>
  <p>Comparing an array with a value gives an array of True/False, one per element. That True/False array is a <strong>boolean mask</strong>. Put it inside the brackets and only the True positions come out.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="10" y="30">amounts</text>
    <g><rect x="90" y="12" width="60" height="28" class="fs" stroke="currentColor"/><rect x="150" y="12" width="60" height="28" class="fs" stroke="currentColor"/><rect x="210" y="12" width="60" height="28" class="fs" stroke="currentColor"/><rect x="270" y="12" width="60" height="28" class="fs" stroke="currentColor"/><rect x="330" y="12" width="60" height="28" class="fs" stroke="currentColor"/><rect x="390" y="12" width="60" height="28" class="fs" stroke="currentColor"/><rect x="450" y="12" width="60" height="28" class="fs" stroke="currentColor"/><rect x="510" y="12" width="60" height="28" class="fs" stroke="currentColor"/></g>
    <text x="108" y="31">450</text><text x="168" y="31">220</text><text x="228" y="31">610</text><text x="288" y="31">380</text><text x="348" y="31">150</text><text x="408" y="31">720</text><text x="468" y="31">300</text><text x="528" y="31">270</text>
    <text x="10" y="76">is_pune</text>
    <rect x="90" y="58" width="60" height="28" class="fg sg"/><rect x="150" y="58" width="60" height="28" class="fr sr"/><rect x="210" y="58" width="60" height="28" class="fg sg"/><rect x="270" y="58" width="60" height="28" class="fr sr"/><rect x="330" y="58" width="60" height="28" class="fg sg"/><rect x="390" y="58" width="60" height="28" class="fr sr"/><rect x="450" y="58" width="60" height="28" class="fr sr"/><rect x="510" y="58" width="60" height="28" class="fr sr"/>
    <text x="104" y="77">True</text><text x="162" y="77">False</text><text x="224" y="77">True</text><text x="282" y="77">False</text><text x="344" y="77">True</text><text x="402" y="77">False</text><text x="462" y="77">False</text><text x="522" y="77">False</text>
    <text x="10" y="122">result</text>
    <rect x="90" y="104" width="60" height="28" class="fg sg"/><rect x="150" y="104" width="60" height="28" class="fg sg"/><rect x="210" y="104" width="60" height="28" class="fg sg"/>
    <text x="108" y="123">450</text><text x="168" y="123">610</text><text x="228" y="123">150</text><text x="290" y="123" class="tm">sum 1,210 · 3 True of 8 = 0.375</text>
  </svg><figcaption>Top: amounts. Middle: the mask <code>city == "Pune"</code>. Bottom: only values under a True survive, packed into a new array.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A mask is a sieve (a chhalni): holes marked True let the value fall through, False holes block it.</p></div>
  <div class="fx" data-lang="py">city = np.array(["Pune", "Delhi", "Pune", "Mumbai", "Pune", "Delhi", "Delhi", "Mumbai"])
is_pune = city == "Pune"
print(is_pune)
print(amounts[is_pune], amounts[is_pune].sum())
print(is_pune.sum(), is_pune.mean())             # True counts as 1
late = minutes &gt; 30
print(amounts[(city == "Delhi") &amp; late])         # Delhi AND late
print(np.where(late, "late", "on time"))         # vectorised if/else</div>
  <div class="fx" data-lang="text">[ True False  True False  True False False False]
[450 610 150] 1210
3 0.375
[720]
['late' 'on time' 'late' 'on time' 'on time' 'late' 'on time' 'on time']</div>
  <p>By hand: Pune orders are 1, 3, 5 with amounts 450 + 610 + 150 = 1,210. Because True counts as 1 and False as 0, <code>is_pune.sum()</code> counts the Pune orders (3) and <code>is_pune.mean()</code> is the share (3 / 8 = 0.375). Late means more than 30 minutes: orders 1 (32), 3 (41), 6 (45). Delhi <em>and</em> late leaves only order 6, ₹720. <code>np.where(cond, a, b)</code> is an if/else run on every element at once.</p>
  <h3>Fancy indexing: a list of positions</h3>
  <p><strong>Fancy indexing</strong> means passing an array (or list) of integer positions. The most useful pair is <code>argsort</code> + fancy indexing: <code>argsort</code> returns the <em>positions</em> that would sort the array, and indexing with them reorders any column the same way.</p>
  <div class="fx" data-lang="py">print(amounts[[0, 5]])                           # orders 1 and 6 (positions 0 and 5)
order = np.argsort(amounts)[::-1]                # positions, biggest amount first
print(order)
print(amounts[order])                            # amounts sorted, via fancy indexing
print(city[order][:3])                           # same positions reorder any column

d = amounts.copy()
picked = d[is_pune]                              # mask -&gt; COPY
picked[0] = 0
print(d[:3], np.shares_memory(d, picked))        # d unchanged

d[is_pune] = 0                                   # but ASSIGNING through a mask writes in place
print(d)
d2 = amounts.copy()
d2[is_pune][0] = 999                             # chained: edits a temporary copy, then lost
print(d2[:3])</div>
  <div class="fx" data-lang="text">[450 720]
[5 2 0 3 6 7 1 4]
[720 610 450 380 300 270 220 150]
['Delhi' 'Pune' 'Pune']
[450 220 610] False
[  0 220   0 380   0 720 300 270]
[450 220 610]</div>
  <p><code>np.argsort(amounts)[::-1]</code> = [5 2 0 3 6 7 1 4]: position 5 (₹720) is biggest, then position 2 (₹610), then 0 (₹450). Indexing <code>city</code> with the same positions gives the cities of the three biggest orders: Delhi, Pune, Pune. That is how you sort a whole table by one column.</p>
  <p>The second half answers "copy or view?". <code>picked = d[is_pune]</code> is a <strong>copy</strong>: NumPy had to gather values from scattered positions into a new block, so changing <code>picked</code> leaves <code>d</code> alone. But <code>d[is_pune] = 0</code>, a mask on the <em>left</em> of <code>=</code>, writes straight into <code>d</code>. And the chained <code>d2[is_pune][0] = 999</code> does nothing: the first bracket makes a temporary copy, the second writes into that copy, and the copy is thrown away. pandas has the same trap under the name "chained assignment" (see <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a>).</p>
  <table class="tbl">
    <tr><th>Kind</th><th>Example</th><th>Returns</th></tr>
    <tr><td>Basic slice</td><td><code>amounts[2:5]</code>, <code>X[:, 1]</code></td><td>view</td></tr>
    <tr><td>Boolean mask</td><td><code>amounts[city == "Pune"]</code></td><td>copy</td></tr>
    <tr><td>Fancy (int positions)</td><td><code>amounts[[0, 5]]</code>, <code>amounts[order]</code></td><td>copy</td></tr>
    <tr><td>Mask / fancy on the left of =</td><td><code>d[is_pune] = 0</code></td><td>writes into d</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Boolean indexing</strong>: selecting with a same-shape True/False array. <strong>Fancy indexing</strong>: selecting with integer arrays of positions. Both are "advanced indexing" and always return a copy when used to read.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Combine conditions with <code>&amp;</code> (and), <code>|</code> (or), <code>~</code> (not), each condition in parentheses: <code>(city == "Delhi") &amp; (minutes &gt; 30)</code>. Python's <code>and</code> raises "truth value of an array is ambiguous", and without parentheses <code>&amp;</code> binds before <code>==</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Vectorised ufuncs.</b> We can now pick exactly the numbers we want. The next need is computing on them: "minutes late, but never negative", square roots, logs, running totals. Which operations run as one fast whole-array loop, and how do we spot a slow fake?</div>

  <h2 id="dn-ufunc"><span class="num">06</span>Vectorised ufuncs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know <code>amounts * 1.05</code> is fast. What about formulas that are not plain arithmetic, like "minutes late = minutes − 30, but 0 if on time", or a running total through the day? Must those fall back to Python loops?</p>
  </div>
  <p>NumPy's answer is the <strong>ufunc</strong> ("universal function"): a function that takes arrays, applies one small operation to each element in a compiled loop, and returns an array. <code>+ - * / **</code> and comparisons are ufuncs behind the scenes, and so are <code>np.maximum</code>, <code>np.sqrt</code>, <code>np.log</code>, <code>np.exp</code>, <code>np.abs</code> and about 60 others.</p>
  <div class="fx" data-lang="py">print(np.round(amounts * 1.05, 1))               # arithmetic operators are ufuncs
print(np.maximum(minutes - 30, 0))               # minutes late (0 if on time)
print(np.sqrt(np.array([16, 25, 36])), np.log10(np.array([10, 100, 1000])))
print(np.add.reduce(amounts), np.add.accumulate(amounts))   # reduce = sum, accumulate = running sum
print(np.maximum.accumulate(minutes))            # slowest delivery so far
print(np.multiply.outer([1, 2], [10, 20, 30]))   # every pair

m = minutes.astype(float); m[3] = np.nan         # one missing delivery time
print(m.mean(), np.nanmean(m).round(2))          # NaN spreads; nanmean skips it</div>
  <div class="fx" data-lang="text">[472.5 231.  640.5 399.  157.5 756.  315.  283.5]
[ 2  0 11  0  0 15  0  0]
[4. 5. 6.] [1. 2. 3.]
3100 [ 450  670 1280 1660 1810 2530 2830 3100]
[32 32 41 41 41 45 45 45]
[[10 20 30]
 [20 40 60]]
nan 30.29</div>
  <p>Trace the second line by hand: minutes − 30 = [2 −5 11 −2 −12 15 0 −9], and <code>np.maximum(…, 0)</code> keeps the bigger of each value and 0, giving [2 0 11 0 0 15 0 0]: three late orders, 28 late minutes in total. Every ufunc also has methods. <code>np.add.reduce</code> folds the array with + (that is what <code>sum</code> does): 3,100. <code>np.add.accumulate</code> keeps every intermediate total: the day's revenue after each order, ending at 3,100. <code>np.maximum.accumulate</code> is "slowest delivery so far". <code>.outer</code> applies the operation to every pair.</p>
  <p>The last line shows missing values. <code>np.nan</code> ("not a number") marks a missing delivery time; any arithmetic with NaN gives NaN, so the mean is <code>nan</code>. <code>np.nanmean</code> skips it: (240 − 28) / 7 = 30.29.</p>
  <h3>Real ufunc vs fake vectorisation, measured</h3>
  <div class="fx" data-lang="py">import math
vals = big_list[:200_000]
arr = big[:200_000]
t_loop = min(timeit.repeat(lambda: [math.sqrt(v) for v in vals], number=1, repeat=5))
t_ufunc = min(timeit.repeat(lambda: np.sqrt(arr), number=1, repeat=5))
vsqrt = np.vectorize(math.sqrt)
t_vec = min(timeit.repeat(lambda: vsqrt(arr), number=1, repeat=5))
print(f"list comp + math.sqrt {t_loop*1e3:6.2f} ms")
print(f"np.vectorize          {t_vec*1e3:6.2f} ms   (a Python loop in disguise)")
print(f"np.sqrt (ufunc)       {t_ufunc*1e3:6.2f} ms")</div>
  <div class="fx" data-lang="text">list comp + math.sqrt  11.35 ms
np.vectorize           15.98 ms   (a Python loop in disguise)
np.sqrt (ufunc)         0.21 ms</div>
  <p>On 200,000 amounts, <code>np.sqrt</code> takes 0.2 ms; a list comprehension with <code>math.sqrt</code> 11.4 ms (about 50x slower). <code>np.vectorize</code> sounds fast but is slower still: it is a convenience wrapper that calls your Python function once per element.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A ufunc is a stamping machine in a factory: feed in a sheet of 1,000 blanks and every one is stamped in a single press. <code>np.vectorize</code> is a worker who takes the sheet and stamps each blank by hand: same result, the sheet just looks industrial.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>ufunc</strong> is a NumPy function that operates element by element on arrays in compiled code, supports broadcasting (section 08), and provides <code>.reduce</code>, <code>.accumulate</code> and <code>.outer</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Python's built-ins are not ufuncs. <code>max(minutes - 30, 0)</code> raises "truth value is ambiguous"; <code>math.sqrt(arr)</code> fails for arrays. Use <code>np.maximum</code>, <code>np.sqrt</code>. Also remember NaN spreads: one missing value makes <code>sum</code> and <code>mean</code> NaN.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Aggregations with axis.</b> ufuncs transform every element and keep the shape. Business questions are usually summaries: revenue per city, average per column, best meal per city. On a 2-D table, how do we say "total down the columns" versus "total across the rows"?</div>

  <h2 id="dn-axis"><span class="num">07</span>Aggregations with axis</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>amounts.sum()</code> gives one number for the whole day. The manager wants a 2-D summary: revenue for each city at lunch and at dinner, then totals per meal and per city. How do we build that table and summarise it along one direction only?</p>
  </div>
  <p>First build the table with masks from section 05. Lunch is before 18:00 (orders 1, 2, 3), dinner from 18:00 (orders 4 to 8). For each city, sum the amounts where city matches and meal matches:</p>
  <table class="tbl out"><caption>The city × meal revenue table, by hand</caption>
    <tr><th></th><th>lunch</th><th>dinner</th></tr>
    <tr><td>Pune</td><td>450 + 610 = 1060</td><td>150</td></tr>
    <tr><td>Delhi</td><td>220</td><td>720 + 300 = 1020</td></tr>
    <tr><td>Mumbai</td><td>0</td><td>380 + 270 = 650</td></tr>
  </table>
  <div class="fx" data-lang="py">hour = np.array([12, 12, 13, 19, 20, 20, 21, 21])
dinner = hour &gt;= 18
cities = ["Pune", "Delhi", "Mumbai"]
table = np.array([[amounts[(city == c) &amp; ~dinner].sum(), amounts[(city == c) &amp; dinner].sum()]
                  for c in cities])                # rows = city, columns = lunch, dinner
print(table)
print("sum axis=0 -&gt;", table.sum(axis=0), "  (one per column: lunch, dinner)")
print("sum axis=1 -&gt;", table.sum(axis=1), "  (one per row: Pune, Delhi, Mumbai)")
print("sum all    -&gt;", table.sum())
print("shapes:", table.shape, table.sum(axis=0).shape, table.sum(axis=1).shape)
print("best meal per city:", table.argmax(axis=1), "| best city per meal:", table.argmax(axis=0))
print("X column means:", X.mean(axis=0), "| X column std:", X.std(axis=0).round(2))</div>
  <div class="fx" data-lang="text">[[1060  150]
 [ 220 1020]
 [   0  650]]
sum axis=0 -&gt; [1280 1820]   (one per column: lunch, dinner)
sum axis=1 -&gt; [1210 1240  650]   (one per row: Pune, Delhi, Mumbai)
sum all    -&gt; 3100
shapes: (3, 2) (2,) (3,)
best meal per city: [0 1 1] | best city per meal: [0 1]
X column means: [387.5  30. ] | X column std: [183.69   8.69]</div>
  <p>The table matches the hand version. Now the <code>axis</code> argument. Read it as <strong>"the axis you name is the one that disappears"</strong>:</p>
  <ul>
    <li><code>sum(axis=0)</code> collapses axis 0 (the rows). It walks <em>down</em> each column: lunch = 1060 + 220 + 0 = 1280, dinner = 150 + 1020 + 650 = 1820. Shape (3, 2) → (2,).</li>
    <li><code>sum(axis=1)</code> collapses axis 1 (the columns). It walks <em>across</em> each row: Pune = 1060 + 150 = 1210, Delhi = 1240, Mumbai = 650. Shape (3, 2) → (3,).</li>
    <li>No axis: everything, 3,100, the same total as the eight orders.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <defs><marker id="dn-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="70" y="16" width="160" height="84" class="fs" stroke="currentColor"/><text x="82" y="38">1060   150</text><text x="82" y="64"> 220  1020</text><text x="82" y="90">   0   650</text>
    <path d="M50 16 L50 100" stroke="currentColor" marker-end="url(#dn-ar2)"/><text x="4" y="62">axis 0</text>
    <path d="M70 120 L230 120" stroke="currentColor" marker-end="url(#dn-ar2)"/><text x="120" y="136">axis 1</text>
    <text x="260" y="40">sum(axis=0) → [1280 1820]   one per column</text>
    <text x="260" y="66">sum(axis=1) → [1210 1240 650]  one per row</text>
    <text x="260" y="92" class="tm">rows = cities, columns = lunch, dinner</text>
  </svg><figcaption>The axis you name gets squashed: summing over axis 0 runs down the rows and leaves one value per column.</figcaption></figure>
  <p>The same rule works for every aggregation: <code>mean</code>, <code>max</code>, <code>min</code>, <code>std</code>, <code>argmax</code>, <code>cumsum</code>. <code>argmax(axis=1)</code> = [0 1 1] says Pune earns most at lunch (column 0), Delhi and Mumbai at dinner. On the orders table X, <code>X.mean(axis=0)</code> = [387.5, 30] is the average amount and the average delivery time: one mean per column, exactly what we computed by hand in section 01. <code>X.std(axis=0)</code> = [183.69, 8.69] is the standard deviation of each column (the typical distance from the mean; see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school marks register: students down, subjects across. "Class average per subject" squashes the students (axis 0). "Each student's total" squashes the subjects (axis 1). You name what you squash, not what you keep.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>An <strong>aggregation</strong> (reduction) turns many values into one. With <code>axis=k</code> it is applied along axis k separately for every position of the other axes, and axis k is removed from the shape.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"axis=0 means rows" is the most common mix-up. axis=0 does not give one answer per row; it <em>removes</em> the rows and gives one answer per column. Check the result's shape: if you wanted one value per city, it must have length 3.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Broadcasting.</b> We now have the column means, shape (2,), and the table X, shape (8, 2). To compute z-scores we must subtract the means from every row and divide by the stds. Can NumPy combine arrays of different shapes without a loop, and by what rule?</div>

  <h2 id="dn-bc"><span class="num">08</span>Broadcasting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>X</code> is (8, 2); its column means are (2,). Element-wise operations need matching shapes. Must we repeat the means 8 times by hand to subtract them, or is there a rule that lets NumPy do it?</p>
  </div>
  <div class="fx" data-lang="py">mu = X.mean(axis=0)                     # shape (2,)
print(X.shape, mu.shape)
centred = X - mu                        # (8,2) - (2,) -&gt; (8,2)
print(centred[:3])
z = (X - mu) / X.std(axis=0)            # z-score every column at once
print(z[:3].round(2), z.mean(axis=0).round(10), z.std(axis=0))</div>
  <div class="fx" data-lang="text">(8, 2) (2,)
[[  62.5    2. ]
 [-167.5   -5. ]
 [ 222.5   11. ]]
[[ 0.34  0.23]
 [-0.91 -0.58]
 [ 1.21  1.27]] [ 0. -0.] [1. 1.]</div>
  <p>NumPy subtracted the (2,) means from every one of the 8 rows: order 1 becomes (450 − 387.5, 32 − 30) = (62.5, 2), order 2 (−167.5, −5). This automatic stretching of the smaller array is <strong>broadcasting</strong>. Dividing by the stds in the same way gives z-scores: order 3 is 1.21 standard deviations above the average amount and 1.27 above the average time. After standardising, every column has mean 0 and std 1, as printed.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A teacher writes the class average once on the board. Every student reads that one line and subtracts it from their own marks. Nobody makes 30 photocopies of the average: broadcasting never copies the small array, it just reuses it.</p></div>
  <h3>The rule, traced by hand</h3>
  <p>Write the two shapes one under the other, <strong>aligned on the right</strong>. Missing positions on the left count as 1. Compare each column of the alignment: the two numbers must be <strong>equal, or one of them must be 1</strong>. A 1 is stretched to the other size. The result takes the bigger number in each column.</p>
  <table class="tbl out"><caption>Four cases on the running example</caption>
    <tr><th>Operation</th><th>Shapes aligned right</th><th>Check per column</th><th>Result</th></tr>
    <tr><td><code>X - mu</code></td><td>(8, 2)<br>(&#160;&#160;&#160;&#160;2)</td><td>2 vs 2 equal; 8 vs (missing = 1) stretch</td><td>(8, 2)</td></tr>
    <tr><td><code>table / row_tot</code></td><td>(3, 2)<br>(3, 1)</td><td>2 vs 1 stretch; 3 vs 3 equal</td><td>(3, 2)</td></tr>
    <tr><td><code>amounts[:, None] &gt; thresholds[None, :]</code></td><td>(8, 1)<br>(1, 3)</td><td>1 vs 3 stretch; 8 vs 1 stretch</td><td>(8, 3)</td></tr>
    <tr><td><code>X + np.arange(8)</code></td><td>(8, 2)<br>(&#160;&#160;&#160;&#160;8)</td><td>2 vs 8: unequal, neither is 1</td><td>error</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="10" y="16" class="tm">X (8,2), first 2 rows</text>
    <rect x="10" y="24" width="150" height="60" class="fb sb"/><text x="22" y="48">450   32</text><text x="22" y="72">220   25</text>
    <text x="175" y="60">−</text>
    <text x="195" y="16" class="tm">mu (2,)</text>
    <rect x="195" y="24" width="150" height="30" class="fg sg"/><text x="207" y="44">387.5   30</text>
    <rect x="195" y="54" width="150" height="30" class="fg" stroke-dasharray="4 3" stroke="currentColor"/><text x="207" y="74" class="tm">387.5   30</text>
    <text x="360" y="60">=</text>
    <text x="385" y="16" class="tm">centred (8,2)</text>
    <rect x="385" y="24" width="170" height="60" class="ft st"/><text x="397" y="48">  62.5    2</text><text x="397" y="72">−167.5   −5</text>
    <text x="10" y="112">Align from the RIGHT:  (8, 2) and (2,) → (1, 2) → stretched to (8, 2)</text>
    <text x="10" y="132" class="tm">the dashed row is virtual: NumPy reuses the same 2 numbers, nothing is copied</text>
  </svg><figcaption>Broadcasting the column means across all 8 rows.</figcaption></figure>
  <p>The remaining three cases, run:</p>
  <div class="fx" data-lang="py">row_tot = table.sum(axis=1, keepdims=True)       # (3,1) instead of (3,)
print(row_tot.shape, table.sum(axis=1).shape)
print((table / row_tot).round(2))                # each city's lunch/dinner share; rows add to 1

thresholds = np.array([200, 400, 600])
over = amounts[:, None] &gt; thresholds[None, :]    # (8,1) vs (1,3) -&gt; (8,3)
print(over.shape)
print(over.astype(int))
print("orders above 200/400/600:", over.sum(axis=0))
try:
    X + np.array([1, 2, 3, 4, 5, 6, 7, 8])       # (8,2) + (8,)
except ValueError as e:
    print("ValueError:", e)
print((X + np.arange(8)[:, None])[:2])           # (8,2) + (8,1) works</div>
  <div class="fx" data-lang="text">(3, 1) (3,)
[[0.88 0.12]
 [0.18 0.82]
 [0.   1.  ]]
(8, 3)
[[1 1 0]
 [1 0 0]
 [1 1 1]
 [1 0 0]
 [0 0 0]
 [1 1 1]
 [1 0 0]
 [1 0 0]]
orders above 200/400/600: [7 3 2]
ValueError: operands could not be broadcast together with shapes (8,2) (8,) 
[[450  32]
 [221  26]]</div>
  <ul>
    <li><strong>keepdims=True</strong> keeps the squashed axis as size 1: row totals come back as (3, 1) instead of (3,). Now (3, 2) / (3, 1) divides each row by its own total: Pune earns 88% of its revenue at lunch (1060 / 1210), Mumbai 100% at dinner. Without keepdims, (3, 2) / (3,) would fail (2 vs 3).</li>
    <li><strong>Every pair</strong>: <code>amounts[:, None]</code> is a column (8, 1), <code>thresholds[None, :]</code> a row (1, 3); comparing them builds the full 8 × 3 table "is order i above threshold j?". Summing down the rows counts orders above ₹200, ₹400, ₹600: 7, 3, 2. Check by hand: only ₹150 is not above 200; 450, 610, 720 are above 400; 610 and 720 above 600.</li>
    <li><strong>The error</strong>: adding a per-order value (8,) to (8, 2) fails, because right-alignment compares 2 with 8. Turning it into a column (8, 1) fixes it: order 2 got +1 in both columns.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Broadcasting</strong>: the rule by which NumPy combines arrays of different shapes. Align shapes on the right, pad the shorter with 1s on the left; each pair of sizes must be equal or contain a 1; size-1 axes are virtually repeated. No data is copied.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Broadcasting can succeed when you did not intend it. <code>a.shape == (8,)</code> minus <code>b.shape == (8, 1)</code> silently produces an (8, 8) table instead of 8 differences. When a result's shape surprises you, check every input's shape first.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reshape &amp; Stack.</b> Broadcasting worked because we could turn a flat (8,) into a column (8, 1). More generally the data is often the right numbers in the wrong shape, or in several separate arrays that must be joined. How do we change an array's shape and glue arrays together?</div>

  <h2 id="dn-reshape"><span class="num">09</span>Reshape &amp; Stack</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>scikit-learn wants features as a 2-D (rows, columns) array, but <code>amounts</code> is flat. Two more orders arrive and must be added. Two days of per-city revenue must become one table. Which tools change shape or join arrays, and which of them copy?</p>
  </div>
  <p><strong>Reshape</strong> changes the arrangement without changing the numbers or their order. The total size must stay the same: 8 numbers can be 2 × 4 or 8 × 1, never 3 × 3.</p>
  <div class="fx" data-lang="py">print(amounts.reshape(2, 4))                     # 2 rows of 4 orders
print(amounts.reshape(-1, 1).shape)              # -1 = "work it out": a column for scikit-learn
print(amounts[:, None].shape, amounts[None, :].shape)
r = amounts.reshape(2, 4)
print(np.shares_memory(r, amounts), r.ravel().base is amounts, np.shares_memory(r.flatten(), amounts))
print(r.T.flatten())                             # transpose then flatten (always a copy)
try:
    amounts.reshape(3, 3)
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">[[450 220 610 380]
 [150 720 300 270]]
(8, 1)
(8, 1) (1, 8)
True True False
[450 150 220 720 610 300 380 270]
ValueError: cannot reshape array of size 8 into shape (3,3)</div>
  <p><code>reshape(2, 4)</code> fills row by row: 450 220 610 380, then 150 720 300 270. <code>-1</code> means "work this one out": 8 / 1 = 8 rows. <code>[:, None]</code> (also written <code>np.newaxis</code>) inserts a new axis of length 1: (8,) becomes (8, 1). Reshape returns a <strong>view</strong> when it can (shares memory True), and so does <code>ravel</code>; <code>flatten</code> always copies. The error shows the size rule.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Eight tiffin boxes on a shelf can be stacked 2 rows of 4 or 4 rows of 2. Re-stacking moves no food. You cannot make 3 rows of 3 without a ninth box.</p></div>
  <p><strong>Stacking</strong> joins arrays. The one question to ask: glue along an axis that already exists, or create a new axis?</p>
  <div class="fx" data-lang="py">new_amounts = np.array([510, 190])               # two more orders arrive
print(np.concatenate([amounts, new_amounts]))    # glue end to end (existing axis)
day1 = np.array([1060, 1020, 650]); day2 = np.array([980, 1100, 720])   # revenue per city
print(np.stack([day1, day2]))                    # NEW axis 0: shape (2,3), rows = days
print(np.stack([day1, day2], axis=1))            # new axis 1: shape (3,2), columns = days
print(np.vstack([day1, day2]).shape, np.hstack([day1, day2]).shape)
print(np.column_stack([amounts, minutes])[:2])   # how X was built: 1-D arrays become columns</div>
  <div class="fx" data-lang="text">[450 220 610 380 150 720 300 270 510 190]
[[1060 1020  650]
 [ 980 1100  720]]
[[1060  980]
 [1020 1100]
 [ 650  720]]
(2, 3) (6,)
[[450  32]
 [220  25]]</div>
  <table class="tbl">
    <tr><th>Call</th><th>Result here</th><th>Rule</th></tr>
    <tr><td><code>np.concatenate([a, b])</code></td><td>10 orders, shape (10,)</td><td>join along an <em>existing</em> axis</td></tr>
    <tr><td><code>np.stack([day1, day2])</code></td><td>(2, 3): rows = days</td><td>join along a <em>new</em> axis 0</td></tr>
    <tr><td><code>np.stack([day1, day2], axis=1)</code></td><td>(3, 2): columns = days</td><td>new axis at position 1</td></tr>
    <tr><td><code>np.vstack</code> / <code>np.hstack</code></td><td>(2, 3) / (6,)</td><td>on top / end to end</td></tr>
    <tr><td><code>np.column_stack([amounts, minutes])</code></td><td>(8, 2) = X</td><td>1-D arrays become columns</td></tr>
  </table>
  <h3>Never grow an array in a loop, measured</h3>
  <p>An ndarray has a fixed size, so "appending" means allocating a bigger array and copying everything over. Doing that once per batch copies the data again and again:</p>
  <div class="fx" data-lang="py">chunks = [np.ones(1000) for _ in range(500)]     # 500 batches of 1,000 orders
def grow():
    out = np.empty(0)
    for ch in chunks:
        out = np.concatenate([out, ch])          # copies everything so far, every time
    return out
def collect():
    return np.concatenate(chunks)                # one copy at the end
for name, f in [("concatenate in a loop", grow), ("collect, concatenate once", collect)]:
    print(f"{name:26s} {min(timeit.repeat(f, number=1, repeat=3))*1e3:7.2f} ms")</div>
  <div class="fx" data-lang="text">concatenate in a loop        75.93 ms
collect, concatenate once     0.37 ms</div>
  <p>500 batches of 1,000 orders: growing in the loop took 76 ms, collecting the batches in a Python list and concatenating once took 0.37 ms, over 200x faster. With n batches the loop copies 1 + 2 + … + n batches, which grows like n², written O(n²) (see <a class="xref" data-note="dsa_complexity">Complexity</a>).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>reshape</strong>: same data, new shape (product of the shape unchanged). <strong>concatenate</strong>: join along an existing axis. <strong>stack</strong>: join same-shape arrays along a new axis.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>reshape</code> is not transpose. <code>amounts.reshape(4, 2)</code> pairs consecutive orders; <code>X.T</code> swaps rows and columns. Reshaping a (8, 2) table to (2, 8) scrambles the columns; use <code>.T</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Linear Algebra.</b> We can build any table we need. Some questions are not element-wise at all: "pay each rider ₹20 + ₹2 per minute" combines a row of two numbers with two rules; "what pay rule produced these payments?" asks us to solve equations. NumPy's matrix tools answer both.</div>

  <h2 id="dn-la"><span class="num">10</span>Linear Algebra</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Rider pay is ₹20 base plus ₹2 per minute. That is "multiply matching items, then add" for every order. And in reverse: given what two riders were paid, what is the base fee and the per-minute rate? Element-wise tools and broadcasting don't express "solve for the unknowns".</p>
  </div>
  <h3>The dot product and @</h3>
  <p>For one order (32 minutes): pay = 1 × 20 + 32 × 2 = 84. "Multiply matching items, then add" is a <strong>dot product</strong>. Put <code>[1, minutes]</code> for every order in an (8, 2) matrix A and the rule in w = [20, 2]; <code>A @ w</code> does the dot product of every row with w.</p>
  <div class="fx" data-lang="py">A = np.column_stack([np.ones(8), minutes])       # [1, minutes] for each order, shape (8,2)
w = np.array([20, 2])                            # rider pay: ₹20 base + ₹2 per minute
pay = A @ w                                      # (8,2) @ (2,) -&gt; (8,)
print(A[:2]); print(pay)
print(minutes * 2 + 20)                          # the same thing with broadcasting
print(amounts @ np.ones(8), amounts.sum())       # dot with ones = sum
print(A.T @ A)                                   # (2,8) @ (8,2) -&gt; (2,2)</div>
  <div class="fx" data-lang="text">[[ 1. 32.]
 [ 1. 25.]]
[ 84.  70. 102.  76.  56. 110.  80.  62.]
[ 84  70 102  76  56 110  80  62]
3100.0 3100
[[   8.  240.]
 [ 240. 7804.]]</div>
  <p>Pay per order: 84, 70, 102, 76, 56, 110, 80, 62 (order 3: 20 + 41 × 2 = 102). Here broadcasting gives the same numbers, but <code>@</code> generalises: with 10 features and 10 weights it is still one line, and it is exactly what a linear model computes (inputs @ weights). A dot product with a vector of ones is just the sum (3,100). <code>A.T @ A</code> is (2, 8) @ (8, 2) = (2, 2): the inner sizes must match (8 and 8) and the outer ones remain. Its entries are 8 orders, 240 total minutes, and 7,804 = the sum of squared minutes; this matrix appears in the formula for linear regression.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A kirana bill: quantities times prices, then add. <code>*</code> gives the line totals; <code>@</code> gives the bill.</p></div>
  <h3>Solving for unknowns: solve and lstsq</h3>
  <p>Order 1: 32 minutes, paid ₹84. Order 2: 25 minutes, paid ₹70. Unknowns b (base) and r (rate):</p>
  <table class="tbl out"><caption>By hand</caption>
    <tr><th>Step</th><th>Work</th></tr>
    <tr><td>Equations</td><td>b + 32r = 84 and b + 25r = 70</td></tr>
    <tr><td>Subtract</td><td>7r = 14, so r = 2</td></tr>
    <tr><td>Back-substitute</td><td>b = 84 − 64 = 20</td></tr>
    <tr><td>Matrix form</td><td>[[1, 32], [1, 25]] @ [b, r] = [84, 70]</td></tr>
  </table>
  <div class="fx" data-lang="py"># Unknown: base fee b and per-minute rate r. Order 1: 32 min, paid ₹84. Order 2: 25 min, paid ₹70.
M = np.array([[1., 32.], [1., 25.]])
paid = np.array([84., 70.])
print(np.linalg.solve(M, paid))                  # [b, r]
print(np.linalg.det(M), np.linalg.inv(M) @ paid)

# All 8 orders, but now we want minutes from amount: a straight-line fit (least squares)
D = np.column_stack([np.ones(8), amounts])
coef, *_ = np.linalg.lstsq(D, minutes, rcond=None)
print(coef.round(4))                             # [intercept, minutes per ₹]
print((np.array([1, 500]) @ coef).round(1))      # predicted minutes for a ₹500 order
print(np.linalg.norm([3, 4]))</div>
  <div class="fx" data-lang="text">[20.  2.]
-6.999999999999999 [20.  2.]
[12.3152  0.0456]
35.1
5.0</div>
  <p><code>np.linalg.solve(M, paid)</code> returns [20, 2], matching the hand result. <code>det</code> (the <strong>determinant</strong>) is −7 (with a tiny rounding error): it is 0 exactly when the equations have no single answer, for example two orders with the same minutes. <code>inv(M) @ paid</code> gives the same answer but is slower and less accurate on large or nearly-singular systems.</p>
  <p>The second part asks a different question. With 8 orders and 2 unknowns there are more equations than unknowns and no line fits all points exactly, so we ask for the line with the smallest total squared error: <strong>least squares</strong>. <code>lstsq</code> says minutes ≈ 12.32 + 0.0456 × amount: every extra ₹100 of food adds about 4.6 minutes (bigger orders take longer to cook and pack). A ₹500 order is predicted at 35.1 minutes. This is linear regression in one line, derived properly in <a class="xref" data-note="ml_regression">Linear Regression</a>. <code>norm</code> is a vector's length: the 3-4-5 triangle gives 5.</p>
  <p>One more tool used later by PCA: <strong>eigenvalues</strong>. The correlation matrix of amount and minutes on the 8 orders:</p>
  <div class="fx" data-lang="py">C = np.corrcoef(X.T)                             # 2x2 correlation of amount and minutes
print(C.round(3))
vals, vecs = np.linalg.eigh(C)                   # symmetric matrix -&gt; eigh
print(vals.round(3))                             # used by PCA: how much spread per direction
print(vecs.round(3))</div>
  <div class="fx" data-lang="text">[[1.    0.965]
 [0.965 1.   ]]
[0.035 1.965]
[[-0.707  0.707]
 [ 0.707  0.707]]</div>
  <p>Amount and minutes are strongly correlated (0.965). The eigenvalues 1.965 and 0.035 say that almost all the spread lies along one direction, the eigenvector [0.707, 0.707] ("amount and minutes up together"). <code>eigh</code> is the version for symmetric matrices. <a class="xref" data-note="ml_pca">PCA</a> uses exactly this to compress many columns into a few, and <a class="xref" data-note="m_linalg">Linear Algebra</a> explains the meaning.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Matrix product</strong> <code>A @ B</code>: entry (i, j) is the dot product of row i of A with column j of B; needs A's columns = B's rows. <strong>solve(A, b)</strong>: x with A x = b for square, non-singular A. <strong>lstsq(A, b)</strong>: x minimising ‖A x − b‖², for any shape.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>*</code> is element-wise, <code>@</code> is the matrix product: <code>A * A</code> and <code>A @ A</code> are different matrices. And never write <code>inv(A) @ b</code> to solve a system; <code>solve</code> is faster and more accurate.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Random &amp; Seeds.</b> Eight orders were enough to trace every idea, but a regression on 8 points or a speed test on 8 numbers proves nothing. We need realistic data at scale, and random train/test splits, that come out identical every time we rerun.</div>

  <h2 id="dn-rand"><span class="num">11</span>Random &amp; Seeds</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want 1,000 realistic orders to test code at scale, and a random split of orders into training and test sets. Random numbers change every run, which makes results impossible to check or reproduce. How do we get randomness we can repeat?</p>
  </div>
  <p>Computers produce <strong>pseudo-random</strong> numbers: a deterministic formula that, from a starting number called the <strong>seed</strong>, produces a sequence that looks random. Same seed, same sequence. NumPy's modern API is a <strong>Generator</strong> object created with <code>np.random.default_rng(seed)</code>.</p>
  <div class="fx" data-lang="py">print(np.random.default_rng(7).integers(1, 7, 5), np.random.default_rng(7).integers(1, 7, 5))
rng = np.random.default_rng(42)
print(rng.integers(1, 7, size=5))                # dice: 7 excluded
print(rng.normal(0, 1, size=3).round(3))
print(rng.choice(["Pune", "Delhi", "Mumbai"], size=5, p=[0.4, 0.35, 0.25]))
perm = rng.permutation(8)                        # shuffle the 8 order positions
print(perm, "-&gt; train", np.sort(perm[:6]), "test", np.sort(perm[6:]))</div>
  <div class="fx" data-lang="text">[6 4 5 6 4] [6 4 5 6 4]
[1 5 4 3 3]
[ 0.941 -1.951 -1.302]
['Mumbai' 'Mumbai' 'Pune' 'Delhi' 'Pune']
[5 0 4 7 3 1 6 2] -&gt; train [0 1 3 4 5 7] test [2 6]</div>
  <p>Two Generators with seed 7 rolled the same five dice. From one Generator (seed 42): <code>integers(1, 7)</code> rolls 1 to 6 (high excluded), <code>normal(0, 1)</code> draws from the bell curve, <code>choice</code> picks cities with probabilities 40/35/25%, and <code>permutation(8)</code> shuffles the 8 order positions. Taking the first 6 shuffled positions as training and the last 2 as test is a random train/test split: exactly what <a class="xref" data-note="ml_splits">Train/Val/Test splits</a> does under the hood.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A seed is the starting order of a pack of cards before a fixed shuffling routine. Same starting order, same routine: the same cards come out in the same order every time.</p></div>
  <h3>Why not np.random.seed?</h3>
  <div class="fx" data-lang="py">np.random.seed(0); first = np.random.rand(3)
np.random.seed(0); np.random.rand(1)             # "some library" quietly draws one number
second = np.random.rand(3)
print(first.round(3), second.round(3))           # shifted by one: not reproducible any more

mine = np.random.default_rng(0); other = np.random.default_rng(99)
a1 = mine.random(3)
mine = np.random.default_rng(0); other.random(1) # the library uses ITS OWN generator
a2 = mine.random(3)
print(a1.round(3), a2.round(3))                  # identical</div>
  <div class="fx" data-lang="text">[0.549 0.715 0.603] [0.715 0.603 0.545]
[0.637 0.27  0.041] [0.637 0.27  0.041]</div>
  <p>The old API keeps one hidden <strong>global</strong> generator. Seed it, and any other code that draws a number from it (a library, a helper function) shifts your sequence: the second run is the first run moved by one. A Generator is your own object; another component with its own Generator cannot disturb it, so the two runs match exactly.</p>
  <h3>The running example at scale: 1,000 orders</h3>
  <p>Everything so far, combined into one function: <code>choice</code> for categories, <code>np.select</code> for per-restaurant base prices, <code>lognormal</code> for skewed amounts, masks for dinner, <code>datetime64</code> arithmetic for timestamps, a vectorised formula for delivery time, and <code>argsort</code> + fancy indexing to sort by time. The <a class="xref" data-note="da_viz">Matplotlib &amp; Seaborn</a> and <a class="xref" data-note="da_plotly_streamlit">Plotly &amp; Streamlit</a> notes reuse this exact function.</p>
  <div class="fx" data-lang="py">def make_orders(n=1000, seed=42):
    """The running example at scale: n food-delivery orders as a dict of arrays."""
    rng = np.random.default_rng(seed)
    city = rng.choice(["Pune", "Delhi", "Mumbai"], n, p=[0.4, 0.35, 0.25])
    restaurant = rng.choice(["Pizza Hub", "Dosa Point", "Biryani Bros"], n, p=[0.4, 0.35, 0.25])
    base = np.select([restaurant == "Pizza Hub", restaurant == "Dosa Point"], [400, 200], 600)
    amount = (base * rng.lognormal(0, 0.35, n)).round(-1)          # nearest ₹10
    dinner = rng.random(n) &lt; 0.6
    hour = np.where(dinner, rng.integers(18, 23, n), rng.integers(11, 15, n))
    minute_of_month = rng.integers(0, 31, n) * 1440 + hour * 60 + rng.integers(0, 60, n)
    order_time = np.datetime64("2025-03-01T00:00") + minute_of_month.astype("timedelta64[m]")
    extra = np.select([city == "Delhi", city == "Mumbai"], [5, 3], 0)  # traffic
    mins = 15 + amount / 40 + extra + 4 * dinner + rng.normal(0, 4, n)
    customer = np.array([f"C{i:03d}" for i in rng.integers(1, 201, n)])
    s = np.argsort(order_time)                                     # sort everything by time
    return {"order_id": np.arange(1, n + 1), "customer": customer[s],
            "restaurant": restaurant[s], "city": city[s], "order_time": order_time[s],
            "amount": amount[s], "delivery_minutes": np.clip(mins.round(), 10, None).astype(int)[s]}

o = make_orders()
print({k: v.dtype.str for k, v in o.items()})
print(o["order_time"][:2], o["amount"][:5], o["delivery_minutes"][:5])
print("mean amount", o["amount"].mean().round(1), "| mean minutes", o["delivery_minutes"].mean().round(1))
print("same again?", np.array_equal(make_orders()["amount"], o["amount"]))</div>
  <div class="fx" data-lang="text">{'order_id': '&lt;i8', 'customer': '&lt;U4', 'restaurant': '&lt;U12', 'city': '&lt;U6', 'order_time': '&lt;M8[m]', 'amount': '&lt;f8', 'delivery_minutes': '&lt;i8'}
['2025-03-01T11:37' '2025-03-01T12:19'] [170. 490. 140. 200. 220.] [22 31 18 21 29]
mean amount 415.2 | mean minutes 30.4
same again? True</div>
  <p>Each column is an array with its own dtype: integers, short strings (<code>&lt;U6</code> = up to 6 characters), timestamps to the minute (<code>&lt;M8[m]</code>), floats. The averages (₹415, 30.4 minutes) are close to our 8-order day, and calling the function again with the same seed gives identical data. This dict of same-length arrays is exactly what a pandas DataFrame stores, plus names and mixed types handled for you: <code>pd.DataFrame(make_orders())</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Seed</strong>: the starting value of a pseudo-random number generator. <strong>Generator</strong> (<code>np.random.default_rng</code>): an independent random-number object (PCG64 algorithm) with methods <code>integers</code>, <code>random</code>, <code>normal</code>, <code>choice</code>, <code>permutation</code>, <code>shuffle</code> and more.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>np.random.seed(42)</code> at the top of a notebook does not make it reproducible if any library also draws from the global generator, or if cells run in a different order. Create one <code>rng = np.random.default_rng(42)</code> and pass it around (scikit-learn takes <code>random_state=</code> for the same reason).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Performance &amp; Memory.</b> With 1,000 or 10 million rows, small choices start to matter: a dtype twice too wide, a hidden Python loop, a copy that didn't need to happen. What keeps NumPy code fast and lean?</div>

  <h2 id="dn-perf"><span class="num">12</span>Performance &amp; Memory</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 01 showed vectorised code is ~20x faster than a loop. In real pipelines, what other choices decide speed and memory, and which "optimisations" quietly make things wrong?</p>
  </div>
  <div class="fx" data-lang="py">amt = o["amount"]
print(amt.dtype, amt.nbytes, "|", amt.astype(np.float32).nbytes, "|", o["delivery_minutes"].astype(np.int16).nbytes)
print(np.array([30000], dtype=np.int16) + np.int16(30000))      # int16 max is 32767: wraps!
print(np.float32(16_777_217), np.float64(16_777_217))           # float32: only ~7 exact digits

v = rng.random(5_000_000)
t_new = min(timeit.repeat(lambda: v * 1.05, number=3, repeat=3)) / 3
def inplace():
    w = v.copy(); t = timeit.default_timer(); w *= 1.05; return timeit.default_timer() - t
t_in = min(inplace() for _ in range(5))
print(f"v * 1.05 (new 40 MB array) {t_new*1e3:.2f} ms | v *= 1.05 (in place) {t_in*1e3:.2f} ms")</div>
  <div class="fx" data-lang="text">float64 8000 | 4000 | 2000
[-5536]
1.6777216e+07 16777217.0
v * 1.05 (new 40 MB array) 7.56 ms | v *= 1.05 (in place) 1.96 ms</div>
  <ul>
    <li><strong>dtype sets memory.</strong> 1,000 amounts as float64 take 8,000 bytes; as float32 4,000; delivery minutes as int16 only 2,000. On 100 million rows that is 800 MB versus 400 or 200 MB.</li>
    <li><strong>Small dtypes overflow silently.</strong> int16 holds −32,768 to 32,767. 30,000 + 30,000 wraps around to −5,536 with no error. Use small integer types only for columns whose range you know (minutes, ages), never for money totals.</li>
    <li><strong>float32 has ~7 exact digits.</strong> 16,777,217 cannot be stored and becomes 16,777,216. Fine for ML features, wrong for adding up a year of paise.</li>
    <li><strong>In place avoids a new array.</strong> <code>v * 1.05</code> allocates a fresh 40 MB array (7.6 ms); <code>v *= 1.05</code> overwrites the existing one (2.0 ms). Use it when you no longer need the old values, remembering the view rule from section 04: in-place on a view changes the parent.</li>
  </ul>
  <table class="tbl">
    <tr><th>Habit</th><th>Measured in this note</th></tr>
    <tr><td>Let NumPy do the loop</td><td>list loop 20.1 ms vs vectorised 0.96 ms (1M)</td></tr>
    <tr><td>Never loop over an ndarray in Python</td><td>119 ms, the slowest option</td></tr>
    <tr><td>np.vectorize is not vectorisation</td><td>16.0 ms vs np.sqrt 0.2 ms (200k)</td></tr>
    <tr><td>Collect then concatenate once</td><td>76 ms vs 0.37 ms (500 batches)</td></tr>
    <tr><td>In place when safe</td><td>7.6 ms vs 2.0 ms (5M)</td></tr>
    <tr><td>Right-size dtypes</td><td>8,000 → 4,000 → 2,000 bytes per 1,000 values</td></tr>
    <tr><td>Slices are free, masks copy</td><td>views share memory (section 04)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Packing a delivery bag: the right-sized box (dtype) for each item, reuse the same bag instead of buying a new one each trip (in place), and load everything at once instead of driving back for each item (no growing in loops).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>In-place operation</strong>: an operation that writes its result into an existing array (<code>a *= 2</code>, <code>np.add(a, b, out=a)</code>) instead of allocating a new one. <strong>Overflow</strong>: a result outside a dtype's range; NumPy integer arrays wrap around without raising.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Downcasting to save memory can change answers: int16 sums wrap, float32 drops digits. Downcast storage columns, but do money arithmetic in float64 or int64.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Interview Tasks.</b> Every tool is in place. Interviews and real work combine them into short "do it without a loop" recipes: top-k, counts, z-scores, one-hot encoding, moving averages, distances. Each is a few of the ideas above in one line.</div>

  <h2 id="dn-tasks"><span class="num">13</span>Interview Tasks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know each tool on its own. Can we combine them, under interview pressure, into one-line answers to common data tasks on the orders?</p>
  </div>
  <div class="fx" data-lang="py">top3 = np.argpartition(amounts, -3)[-3:]         # top-3 positions in O(n), unordered
print(top3, top3[np.argsort(amounts[top3])[::-1]])   # then sort just those 3
print(np.unique(city, return_counts=True))
print(((minutes - minutes.mean()) / minutes.std()).round(2))      # z-score of delivery time
print(np.clip(minutes, 20, 40))                  # cap extreme values
codes = np.array([0, 1, 0, 2, 0, 1, 1, 2])       # Pune=0, Delhi=1, Mumbai=2
print(np.eye(3, dtype=int)[codes][:4])           # one-hot encode
print(np.convolve(minutes, np.ones(3) / 3, mode="valid").round(1))  # 3-order moving average</div>
  <div class="fx" data-lang="text">[0 2 5] [5 2 0]
(array(['Delhi', 'Mumbai', 'Pune'], dtype='&lt;U6'), array([3, 2, 3]))
[ 0.23 -0.58  1.27 -0.23 -1.38  1.73  0.   -1.04]
[32 25 40 28 20 40 30 21]
[[1 0 0]
 [0 1 0]
 [1 0 0]
 [0 0 1]]
[32.7 31.3 29.  30.3 31.  32. ]</div>
  <ul>
    <li><strong>Top-k</strong> (fancy indexing + partial sort): <code>argpartition(a, -3)[-3:]</code> moves the 3 biggest to the end in O(n) without sorting everything: positions 0, 2, 5 (₹450, 610, 720). Sorting just those three gives 5, 2, 0.</li>
    <li><strong>Counts</strong>: <code>np.unique(..., return_counts=True)</code>: Delhi 3, Mumbai 2, Pune 3 (sorted alphabetically).</li>
    <li><strong>z-score</strong> (aggregation + broadcasting): order 6 at 45 minutes is 1.73 standard deviations slower than average.</li>
    <li><strong>clip</strong> (a ufunc pair): below 20 becomes 20, above 40 becomes 40.</li>
    <li><strong>One-hot</strong> (fancy indexing on <code>eye</code>): row k of the identity matrix is the pattern for code k, so <code>eye(3)[codes]</code> encodes every order's city at once.</li>
    <li><strong>Moving average</strong>: <code>convolve</code> with three weights of 1/3 averages each window of 3 orders: (32 + 25 + 41) / 3 = 32.7, (25 + 41 + 28) / 3 = 31.3.</li>
  </ul>
  <h3>Pairwise distances (a k-means step)</h3>
  <p>Four customers and three restaurant hubs on a map (km). For each customer, which hub is closest? Broadcasting computes all 4 × 3 distances in one line:</p>
  <div class="fx" data-lang="py">P = np.array([[0, 0], [5, 5], [9, 0], [1, 1]])   # 4 customers (x, y) in km
H = np.array([[9, 0], [0, 0], [5, 5]])           # 3 restaurant hubs
d = np.sqrt(((P[:, None, :] - H[None, :, :]) ** 2).sum(axis=2))   # (4,3)
print(P[:, None, :].shape, H[None, :, :].shape, d.shape)
print(d.round(1))
print(d.argmin(axis=1))                          # nearest hub per customer</div>
  <div class="fx" data-lang="text">(4, 1, 2) (1, 3, 2) (4, 3)
[[9.  0.  7.1]
 [6.4 7.1 0. ]
 [0.  9.  6.4]
 [8.1 1.4 5.7]]
[1 2 0 1]</div>
  <p><code>P[:, None, :]</code> is (4, 1, 2) and <code>H[None, :, :]</code> is (1, 3, 2); broadcasting stretches both to (4, 3, 2): every customer minus every hub, in x and y. Square, sum the last axis, square root: straight-line distances. Customer (1, 1) is 1.4 km from hub 1 at (0, 0), so its answer is 1. Assigning points to their nearest centre is exactly the first step of <a class="xref" data-note="ml_kmeans">K-Means</a>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>The (n, k, d) trick builds an intermediate array of n × k × d numbers: 1M customers × 1,000 hubs × 2 is 16 GB. For large n, process in chunks or use <code>scipy.spatial.distance.cdist</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Twelve tools and many recipes. One picture and one table should show how each is built from the one before, all on the same eight orders.</div>

  <h2 id="dn-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>ndarray, shape, slicing, views, masks, ufuncs, axis, broadcasting, reshape, @, Generator, dtypes: how does each one depend on the ones before it?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 330" width="660">
<defs><marker id="dn-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Python list</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">pointers: 20.1 ms, 32 MB</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="240" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="335" y="29" text-anchor="middle" font-size="11.5" font-weight="700">ndarray</text><text x="335" y="45" text-anchor="middle" class="tm" font-size="10">one dtype, one block: 0.96 ms</text>
<line x1="430" y1="32" x2="468" y2="32" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="470" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="560" y="29" text-anchor="middle" font-size="11.5" font-weight="700">shape · dtype · strides</text><text x="560" y="45" text-anchor="middle" class="tm" font-size="10">X: (8, 2), (16, 8)</text>
<line x1="520" y1="54" x2="430" y2="90" stroke="currentColor" marker-end="url(#dn-a9)"/><line x1="600" y1="54" x2="600" y2="90" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="240" y="92" width="190" height="44" rx="7" class="ft st"/><text x="335" y="111" text-anchor="middle" font-size="11.5" font-weight="700">slicing → views</text><text x="335" y="127" text-anchor="middle" class="tm" font-size="10">same buffer, new strides</text>
<rect x="470" y="92" width="180" height="44" rx="7" class="ft st"/><text x="560" y="111" text-anchor="middle" font-size="11.5" font-weight="700">reshape · stack</text><text x="560" y="127" text-anchor="middle" class="tm" font-size="10">new shape / joined arrays</text>
<line x1="240" y1="114" x2="202" y2="114" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="10" y="92" width="190" height="44" rx="7" class="ft st"/><text x="105" y="111" text-anchor="middle" font-size="11.5" font-weight="700">masks · fancy → copies</text><text x="105" y="127" text-anchor="middle" class="tm" font-size="10">Pune: 450, 610, 150</text>
<line x1="105" y1="136" x2="105" y2="172" stroke="currentColor" marker-end="url(#dn-a9)"/><line x1="335" y1="136" x2="335" y2="172" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="10" y="174" width="190" height="44" rx="7" class="fg sg"/><text x="105" y="193" text-anchor="middle" font-size="11.5" font-weight="700">ufuncs</text><text x="105" y="209" text-anchor="middle" class="tm" font-size="10">late = max(min − 30, 0)</text>
<line x1="200" y1="196" x2="238" y2="196" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="240" y="174" width="190" height="44" rx="7" class="fg sg"/><text x="335" y="193" text-anchor="middle" font-size="11.5" font-weight="700">aggregation + axis</text><text x="335" y="209" text-anchor="middle" class="tm" font-size="10">(3,2) → [1280 1820]</text>
<line x1="430" y1="196" x2="468" y2="196" stroke="currentColor" marker-end="url(#dn-a9)"/>
<line x1="560" y1="136" x2="560" y2="172" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="470" y="174" width="180" height="44" rx="7" class="fg sg"/><text x="560" y="193" text-anchor="middle" font-size="11.5" font-weight="700">broadcasting</text><text x="560" y="209" text-anchor="middle" class="tm" font-size="10">(8,2) − (2,) → z-scores</text>
<line x1="560" y1="218" x2="560" y2="254" stroke="currentColor" marker-end="url(#dn-a9)"/><line x1="335" y1="218" x2="335" y2="254" stroke="currentColor" marker-end="url(#dn-a9)"/><line x1="105" y1="218" x2="105" y2="254" stroke="currentColor" marker-end="url(#dn-a9)"/>
<rect x="10" y="256" width="190" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="105" y="275" text-anchor="middle" font-size="11" font-weight="700">performance &amp; memory</text><text x="105" y="291" text-anchor="middle" class="tm" font-size="10">dtypes, in place, no loops</text>
<rect x="240" y="256" width="190" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="335" y="275" text-anchor="middle" font-size="11" font-weight="700">random Generator</text><text x="335" y="291" text-anchor="middle" class="tm" font-size="10">make_orders(1000, seed=42)</text>
<rect x="470" y="256" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="560" y="275" text-anchor="middle" font-size="11" font-weight="700">linear algebra @</text><text x="560" y="291" text-anchor="middle" class="tm" font-size="10">pay = A @ [20, 2]</text>
<text x="330" y="322" text-anchor="middle" class="tm" font-size="10">all of it feeds pandas, charts and ML, which store their numbers in ndarrays</text>
</svg><figcaption>One fix (a typed contiguous block) makes everything else possible: shape and strides describe the block, slicing re-describes it (views), masks gather from it (copies), ufuncs and aggregations loop over it in C, broadcasting reuses small arrays without copying, and linear algebra, random generation and performance habits build on all of them.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the eight orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>On our data</th><th>Use when</th></tr>
    <tr><td>Python list</td><td>pointers to objects</td><td>store anything</td><td><code>amounts * 2</code> repeats; 20.1 ms / 1M</td><td>small, mixed, growing data</td></tr>
    <tr><td>ndarray</td><td>one dtype + contiguous buffer</td><td>fast maths on all items</td><td><code>amounts * 1.05</code>; 0.96 ms / 1M</td><td>any numeric data</td></tr>
    <tr><td>shape / dtype / strides</td><td>ndarray header</td><td>what is the layout?</td><td>(8, 2), int64, (16, 8)</td><td>debugging, every new array</td></tr>
    <tr><td>Slicing (view)</td><td>shape + strides</td><td>take a range</td><td><code>X[:, 1].mean()</code> = 30; refund trap</td><td>contiguous parts, free</td></tr>
    <tr><td>Mask / fancy (copy)</td><td>comparison ufuncs</td><td>select by condition / positions</td><td>Pune 1,210; sort by amount</td><td>filters, sorting, sampling</td></tr>
    <tr><td>ufunc</td><td>compiled element loop</td><td>formula on every element</td><td>late = [2 0 11 0 0 15 0 0]</td><td>any element-wise formula</td></tr>
    <tr><td>Aggregation + axis</td><td>ufunc.reduce</td><td>summaries per row / column</td><td>meals [1280 1820], cities [1210 1240 650]</td><td>totals, means, argmax</td></tr>
    <tr><td>Broadcasting</td><td>shapes + size-1 stretching</td><td>combine different shapes</td><td>z-scores; Pune 88% at lunch; 7/3/2 above thresholds</td><td>normalising, pairwise tables</td></tr>
    <tr><td>Reshape / stack</td><td>shape metadata, new buffers</td><td>change shape, join</td><td>(8,) → (8, 1); X = column_stack</td><td>model inputs, combining batches</td></tr>
    <tr><td>Linear algebra</td><td>dot products</td><td>weighted sums, unknowns</td><td>pay 84…; ₹20 + ₹2/min; 12.3 + 0.0456·amount</td><td>models, systems, PCA</td></tr>
    <tr><td>Generator</td><td>seed → deterministic sequence</td><td>repeatable randomness</td><td>split [0 1 3 4 5 7] / [2 6]; 1,000 orders</td><td>simulation, splits, init</td></tr>
    <tr><td>Performance &amp; memory</td><td>all of the above</td><td>fast and lean?</td><td>int16 wraps; in place 2.0 vs 7.6 ms</td><td>large data, production</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>an ndarray is one typed block of numbers plus a description of its shape, and every NumPy tool either re-describes that block (views, reshape, broadcasting) or loops over it in compiled code (ufuncs, aggregations, @).</strong> Speed comes from the loop living in C; the traps (views that write back, masks that copy, dtypes that overflow) come from the block being shared and fixed.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="da_pandas">Pandas</a>: our columns have names only in our heads, <code>city</code> and <code>amount</code> live in separate arrays that we must keep aligned by hand, and "revenue per city" took a loop over cities. pandas puts named, mixed-type columns in one table and does groupby for us (<a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a>).</div>

  <h2 id="dn-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: 8 delivery orders. amounts = [450, 220, 610, 380, 150, 720, 300, 270] (₹, total 3,100, mean 387.5); minutes = [32, 25, 41, 28, 18, 45, 30, 21] (total 240, mean 30); city = [Pune, Delhi, Pune, Mumbai, Pune, Delhi, Delhi, Mumbai]; orders 1–3 lunch, 4–8 dinner. X = column_stack([amounts, minutes]), shape (8, 2).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Lists</td><td>maths on numbers?</td><td><code>*2</code> repeats; 20.1 ms, 32 MB per 1M</td><td>slow, needs loops</td></tr>
    <tr><td>ndarray</td><td>container for fast maths?</td><td><code>amounts*1.05</code>; 0.96 ms, 8 MB</td><td>how is a table described?</td></tr>
    <tr><td>shape/dtype/ndim</td><td>what is inside?</td><td>(8, 2), int64, strides (16, 8)</td><td>how to take parts?</td></tr>
    <tr><td>Slicing</td><td>take a range?</td><td><code>X[:,1].mean()</code> = 30; view trap</td><td>can't select by condition</td></tr>
    <tr><td>Mask / fancy</td><td>select by condition / positions?</td><td>Pune = 450, 610, 150 → 1,210</td><td>how to compute on them?</td></tr>
    <tr><td>ufuncs</td><td>formula on every element?</td><td>late = [2 0 11 0 0 15 0 0]</td><td>need summaries</td></tr>
    <tr><td>axis</td><td>summary per row / column?</td><td>[1280 1820]; [1210 1240 650]</td><td>combine (8,2) with (2,)?</td></tr>
    <tr><td>Broadcasting</td><td>different shapes together?</td><td>z-scores; 88% Pune lunch</td><td>wrong shapes / separate arrays</td></tr>
    <tr><td>Reshape/stack</td><td>change shape, join?</td><td>(8,)→(8,1); X built</td><td>weighted sums, unknowns?</td></tr>
    <tr><td>Linear algebra</td><td>pay rule, solve?</td><td>pay 84…; [20, 2]; 12.3 + 0.0456·amt</td><td>need data at scale</td></tr>
    <tr><td>Generator</td><td>repeatable randomness?</td><td>seed 42 → same 1,000 orders</td><td>is it fast and lean?</td></tr>
    <tr><td>Performance</td><td>what keeps it fast?</td><td>no loops, right dtype, in place</td><td>→ Pandas (names, groupby)</td></tr>
  </table>
  <h3>Rules and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Element address</td><td>offset = i × stride₀ + j × stride₁</td><td>X[2, 0]: 2 × 16 + 0 = byte 32 → 610</td></tr>
    <tr><td>Size</td><td>size = product of shape</td><td>reshape must keep it: 8 → (2, 4) ok, (3, 3) error</td></tr>
    <tr><td>axis</td><td>result shape = input shape with axis k removed</td><td>(3, 2).sum(axis=0) → (2,)</td></tr>
    <tr><td>Broadcasting</td><td>align right, pad with 1s; each pair equal or 1</td><td>(8,2)&amp;(2,) ok; (8,2)&amp;(8,) error; (8,1)&amp;(1,3) → (8,3)</td></tr>
    <tr><td>z-score</td><td>z = (x − μ) / σ</td><td>μ = column mean, σ = column std; <code>(X - X.mean(0)) / X.std(0)</code></td></tr>
    <tr><td>Row shares</td><td><code>T / T.sum(axis=1, keepdims=True)</code></td><td>keepdims keeps (3, 1) so it broadcasts</td></tr>
    <tr><td>Matrix product</td><td>(n, k) @ (k, m) → (n, m); entry = Σ row × column</td><td>inner sizes must match</td></tr>
    <tr><td>Solve</td><td>A x = b → <code>solve(A, b)</code></td><td>det(A) = 0 means no unique answer</td></tr>
    <tr><td>Least squares</td><td>x minimising ‖A x − b‖² → <code>lstsq</code></td><td>more rows than unknowns</td></tr>
    <tr><td>Copy or view</td><td>slice, reshape, .T, ravel → view; mask, fancy, flatten, .copy() → copy</td><td>check with <code>np.shares_memory</code></td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use NumPy arrays</b><p>Large numeric data, any formula over all elements, matrices, model inputs, simulations.</p><small>Not for mixed-type records or data that grows item by item (use lists, then convert)</small></div>
    <div><b>Use masks and np.where</b><p>Filtering rows by conditions, conditional formulas, counting with <code>mask.sum()</code> and shares with <code>mask.mean()</code>.</p><small>Not <code>and</code>/<code>or</code>; use &amp; | ~ with parentheses</small></div>
    <div><b>Use broadcasting</b><p>Normalising columns, per-row scaling, "every pair" tables, distance matrices.</p><small>Check shapes; huge (n, k, d) intermediates need chunking</small></div>
    <div><b>Use a Generator</b><p>Any randomness that must be reproducible: synthetic data, splits, shuffles, initial weights.</p><small>Not the global <code>np.random.seed</code></small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>A Python loop over an ndarray is slowest of all; slices are views, so editing them edits the original (also inside functions); <code>a[mask][0] = x</code> edits a temporary copy; one string upcasts the whole array to text; axis=0 removes rows (one answer per column); (8,) − (8, 1) silently becomes (8, 8); <code>*</code> is not <code>@</code>; <code>inv(A) @ b</code> instead of <code>solve</code>; NaN spreads through sums; int16 overflows silently; float32 drops digits; growing an array in a loop is O(n²); np.vectorize is a loop.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>a = np.arange(5); b = a[1:3]; b[:] = 0; print(a)</code>?</td><td><code>[0 0 0 3 4]</code>: the slice is a view</td></tr>
    <tr><td>Shape of <code>np.ones((3, 1)) + np.ones(4)</code>?</td><td>(3, 4): (3,1) and (1,4) both stretch</td></tr>
    <tr><td>City × meal table [[1060, 150], [220, 1020], [0, 650]]: <code>sum(axis=0)</code>?</td><td>[1280, 1820], one per meal (column)</td></tr>
    <tr><td>Minutes [32, 25, 41, 28, 18, 45, 30, 21]: how many above 30, in one line?</td><td><code>(minutes &gt; 30).sum()</code> = 3</td></tr>
    <tr><td>Pay rule from b + 32r = 84 and b + 25r = 70?</td><td>r = 2, b = 20: <code>np.linalg.solve([[1,32],[1,25]], [84,70])</code></td></tr>
  </table>

  <h2 id="dn-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is NumPy faster than Python lists?</summary><div class="qa-body">One dtype in one contiguous buffer, so operations run as compiled C loops (often SIMD, several numbers per CPU instruction) with no per-element type checks, pointer chasing or object creation. Lists hold pointers to boxed objects scattered in memory. Measured here: 20.1 ms list loop vs 0.96 ms vectorised for 1M amounts, and 32 MB vs 8 MB.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>[450, 220] * 2</code> give, and <code>np.array([450, 220]) * 2</code>?</summary><div class="qa-body">The list repeats: <code>[450, 220, 450, 220]</code>. The array multiplies each element: <code>[900 440]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's printed? <code>a = np.arange(5); b = a[1:3]; b[:] = 0; print(a)</code></summary><div class="qa-body"><code>[0 0 0 3 4]</code>. The slice is a view on a's buffer, so writing to b writes into a.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shape of <code>np.ones((3,1)) + np.ones(4)</code>? And <code>np.ones((3,2)) + np.ones(3)</code>?</summary><div class="qa-body">(3, 4): (3,1) and (4,) align as (3,1) and (1,4). The second fails: trailing sizes 2 vs 3 are unequal and neither is 1. Fix with <code>np.ones(3)[:, None]</code>, shape (3, 1).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For a (100, 5) feature matrix, how do you standardise each feature?</summary><div class="qa-body"><code>(X - X.mean(axis=0)) / X.std(axis=0)</code>. axis=0 collapses the rows, giving 5 means and 5 stds of shape (5,); broadcasting applies them to every row. On our (8, 2) X the means were [387.5, 30] and the stds [183.69, 8.69].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Difference between <code>np.dot</code>, <code>@</code> and <code>*</code>?</summary><div class="qa-body"><code>*</code> is element-wise. <code>@</code> (matmul) is the matrix product and broadcasts over leading batch dimensions. <code>np.dot</code> equals <code>@</code> for 1-D and 2-D but behaves differently for 3-D and above, so prefer <code>@</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>ravel()</code> vs <code>flatten()</code> vs <code>reshape(-1)</code>?</summary><div class="qa-body"><code>flatten</code> always copies. <code>ravel</code> and <code>reshape(-1)</code> return a view when the memory layout allows it, otherwise a copy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find the indices of the 3 largest values in a 10M array efficiently.</summary><div class="qa-body"><code>idx = np.argpartition(a, -3)[-3:]</code> is O(n); then order just those three: <code>idx[np.argsort(a[idx])[::-1]]</code>. A full <code>argsort</code> is O(n log n). On our amounts: [5 2 0].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>np.array([450, "Pune"])</code> surprise people?</summary><div class="qa-body">An array has one dtype, so NumPy upcasts to a type that holds both: strings. 450 becomes '450' and maths fails. Ints plus a NaN similarly become float64.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Replace negatives with 0 and count how many were replaced, without a loop.</summary><div class="qa-body"><code>n = (a &lt; 0).sum(); a[a &lt; 0] = 0</code>, or <code>np.maximum(a, 0)</code> / <code>np.clip(a, 0, None)</code> for a new array. True counts as 1. "Minutes late" in this note is the same idea: <code>np.maximum(minutes - 30, 0)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>np.linalg.solve</code> instead of <code>inv(A) @ b</code>?</summary><div class="qa-body">solve factorises A (LU) and back-substitutes: about 3x less work and less rounding error. An explicit inverse amplifies error when A is nearly singular. For non-square systems use <code>lstsq</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why prefer <code>np.random.default_rng(42)</code> over <code>np.random.seed(42)</code>?</summary><div class="qa-body">The Generator is your own object (PCG64). The global seed is shared state: any library that draws from it shifts your sequence. Demonstrated here: two "seeded" global runs differed by one draw, while two Generator runs matched.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does broadcasting need the axis/keepdims idea from aggregation?</summary><div class="qa-body">Most broadcasting combines a table with a summary of itself (subtract column means, divide by row totals). The summary's shape comes from the aggregation: <code>sum(axis=0)</code> on (3, 2) gives (2,), which broadcasts back over rows; <code>sum(axis=1)</code> gives (3,), which does <em>not</em> broadcast against (3, 2). <code>keepdims=True</code> keeps (3, 1) so it does. Without understanding which axis disappeared, you can't predict whether the broadcast works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why are masks copies when slices are views?</summary><div class="qa-body">A view is just new shape/strides over the same buffer, which only works when the selected elements are evenly spaced (a slice with a step). A mask picks arbitrary positions (0, 2, 4 for Pune, or anything), which no single stride can describe, so NumPy must gather them into a new buffer. That is also why <code>a[mask][0] = x</code> is lost: it writes into the gathered copy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip vectorisation and write loops anyway?</summary><div class="qa-body">Everything still gives the right numbers, but you lose the reason NumPy exists: the loop over an ndarray was the slowest option measured (119 ms vs 0.96 ms), np.vectorize was 76x slower than a ufunc, and growing arrays in a loop turned 0.37 ms into 76 ms. Speed in NumPy comes from letting ufuncs, aggregations, broadcasting and @ run the loop in C.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does this note lead into pandas?</summary><div class="qa-body">A DataFrame column is (usually) a NumPy array plus a name; the table is a dict of equal-length arrays, like <code>make_orders()</code> returned, with a shared row index. Masks become <code>df[df.city == "Pune"]</code>, axis becomes <code>df.sum(axis=0)</code>, and the per-city loop we wrote for the revenue table becomes one <code>groupby</code>. The view/copy trap reappears as pandas' chained-assignment warning.</div></details>
</main>
`
});
