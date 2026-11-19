// notes/dataanalysis/da_numpy.js — NumPy
Object.assign(TOPIC_CONTENT, {
  "da_numpy": `<main>
  <h1>NumPy</h1>
  <div class="where"><span>Data Analysis</span><span>Arrays</span><span>NumPy</span></div>
  <p class="lead">NumPy is the Python library for storing large amounts of numbers and doing maths on all of them at once, quickly. Almost every data tool you will meet later is built on top of it: a pandas column is a NumPy array with a name, a Matplotlib chart is drawn from NumPy arrays, and a scikit-learn model takes a NumPy array of features as its input. So the ideas on this page, such as how an array sits in memory, when a selection is a view and when it is a copy, and how arrays of different shapes combine, keep coming back in everything that follows. We will start from a problem, doing sums on order amounts with ordinary Python lists, see why it is slow and clumsy, and then build up NumPy one idea at a time. The running example is the one the whole Data Analysis track uses: a food-delivery company's orders, eight of them small enough to check every result by hand, and later a thousand generated ones to test ideas at scale. All code was run on NumPy 2.5 and Python 3.13.</p>

  <h2 id="dn-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">NumPy</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The ndarray</div>
        <ul>
          <li>One dtype, one contiguous block of raw values</li>
          <li><b>shape</b>, <b>ndim</b>, <b>size</b>, <b>dtype</b>, <b>strides</b> describe the block</li>
          <li>Mixing types upcasts: one string turns everything into text</li>
          <li>Fast only when NumPy runs the loop (vectorisation)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Selecting</div>
        <ul>
          <li>Slices <code>a[2:5]</code>, <code>X[:, 1]</code> return <b>views</b> (shared memory)</li>
          <li>Masks <code>a[city == "Pune"]</code> and fancy <code>a[[0, 5]]</code> return <b>copies</b></li>
          <li>Combine conditions with <code>&amp;</code> <code>|</code> <code>~</code> and parentheses</li>
          <li><code>.copy()</code> when a slice must stay independent</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Computing</div>
        <ul>
          <li><b>ufuncs</b>: compiled element-wise loops (<code>np.maximum</code>, <code>np.sqrt</code>)</li>
          <li><b>axis=k</b>: the axis that disappears</li>
          <li><b>Broadcasting</b>: align shapes on the right; each pair equal or 1</li>
          <li><code>@</code> matrix product, <code>solve</code>, <code>lstsq</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fast and safe</div>
        <ul>
          <li><code>np.random.default_rng(seed)</code>, not the global seed</li>
          <li>Right-size dtypes, but int16 wraps and float32 drops digits</li>
          <li>Work in place, read memory in order, never grow arrays in a loop</li>
          <li><code>np.vectorize</code> is a Python loop in disguise</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dn-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why NumPy Exists</span><span class="rm-sub">lists are slow and clumsy for numbers</span></div></div>
      <div class="rm-item rm-done" data-target="dn-nd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The ndarray: Memory Layout and dtypes</span><span class="rm-sub">one type, one block, and how it is described</span></div></div>
      <div class="rm-item rm-done" data-target="dn-slice"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Indexing and Slicing</span><span class="rm-sub">taking single values, ranges, rows and columns</span></div></div>
      <div class="rm-item rm-done" data-target="dn-mask"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Boolean and Fancy Indexing</span><span class="rm-sub">selecting by a condition or a list of positions</span></div></div>
      <div class="rm-item rm-done" data-target="dn-view"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Views and Copies</span><span class="rm-sub">when changing a piece changes the original</span></div></div>
      <div class="rm-item rm-done" data-target="dn-ufunc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Vectorisation and ufuncs</span><span class="rm-sub">a formula on every element without a loop</span></div></div>
      <div class="rm-item rm-done" data-target="dn-axis"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Aggregating Along an Axis</span><span class="rm-sub">totals per row or per column</span></div></div>
      <div class="rm-item rm-done" data-target="dn-bc"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Broadcasting</span><span class="rm-sub">combining arrays of different shapes</span></div></div>
      <div class="rm-item rm-done" data-target="dn-reshape"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Reshaping and Stacking</span><span class="rm-sub">changing shape and joining arrays</span></div></div>
      <div class="rm-item rm-done" data-target="dn-la"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Linear Algebra</span><span class="rm-sub">matrix products and solving equations</span></div></div>
      <div class="rm-item rm-done" data-target="dn-rand"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Random Number Generators</span><span class="rm-sub">repeatable randomness and 1,000 orders</span></div></div>
      <div class="rm-item rm-done" data-target="dn-perf"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Performance and Memory</span><span class="rm-sub">dtypes, in-place work, memory order</span></div></div>
      <div class="rm-item rm-done" data-target="dn-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">and/or, truncation, float equality, silent broadcasting</span></div></div>
      <div class="rm-item rm-done" data-target="dn-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">rules, syntax and gotchas in five minutes</span></div></div>
      <div class="rm-item rm-done" data-target="dn-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what data interviews ask about NumPy</span></div></div>
    </div>
  </div>

  <h2 id="dn-need"><span class="num">01</span>Why NumPy Exists</h2>
  <p>Here is the data we will use throughout. A food-delivery company records, for every order, who ordered, from which restaurant, in which city, when, how much the food cost and how many minutes the delivery took. On Monday 3 March 2025 it had these eight orders:</p>
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
  <p>Two totals are worth remembering because we will check results against them: the amounts add up to ₹3,100 (an average of ₹387.5), and the delivery minutes add up to 240 (an average of 30).</p>
  <p>Suppose the company adds a 5% platform fee to every order. With the Python you already know, the natural place to keep the amounts is a list. Let us try the obvious thing and see what happens:</p>
  <div class="fx" data-lang="py"># the 8 orders of the running example: amount in rupees
amounts_list = [450, 220, 610, 380, 150, 720, 300, 270]

print(amounts_list * 2)                         # "times 2" on a list: repeats it
print([a * 1.05 for a in amounts_list])         # 5% platform fee needs a loop</div>
  <div class="fx" data-lang="text">[450, 220, 610, 380, 150, 720, 300, 270, 450, 220, 610, 380, 150, 720, 300, 270]
[472.5, 231.0, 640.5, 399.0, 157.5, 756.0, 315.0, 283.5]</div>
  <p>The first line is a surprise if you expected maths: <code>amounts_list * 2</code> did not double each amount, it repeated the whole list. That is because a Python list is a general-purpose container. It can hold numbers, strings and other lists side by side, so it has no idea that its contents are numbers, and for a list <code>*</code> means "repeat". To actually multiply each amount we had to write a loop (here a list comprehension, which is a loop written on one line). That is fine for one formula on eight orders. A real delivery company has lakhs of orders a day and wants dozens of formulas on them, and writing and running a loop for each one becomes both tedious and slow.</p>
  <p>To see why it is slow, look at what a list actually stores. A list does not hold the numbers themselves; it holds <em>pointers</em>, which are memory addresses, and each address leads to a separate Python number object somewhere else in memory. Each of those objects carries its own type information and bookkeeping, so a single float takes 24 bytes plus the 8-byte pointer. (How numbers are encoded as bits is covered in <a class="xref" data-note="cf_data">How Data Is Stored as Bits</a>, and how RAM and the CPU cache work in <a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a>; here we only need the consequences.)</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600" style="max-width:100%">
    <text x="10" y="18">Python list: an array of pointers</text>
    <rect x="10" y="28" width="40" height="28" class="fs" stroke="currentColor"/><rect x="50" y="28" width="40" height="28" class="fs" stroke="currentColor"/><rect x="90" y="28" width="40" height="28" class="fs" stroke="currentColor"/><rect x="130" y="28" width="40" height="28" class="fs" stroke="currentColor"/>
    <g stroke="currentColor" fill="none"><path d="M30 56 L60 110"/><path d="M70 56 L170 135"/><path d="M110 56 L25 135"/><path d="M150 56 L230 105"/></g>
    <rect x="40" y="108" width="54" height="24" class="fr sr"/><text x="46" y="125">int 450</text>
    <rect x="150" y="132" width="54" height="24" class="fr sr"/><text x="156" y="149">int 220</text>
    <rect x="5" y="134" width="54" height="24" class="fr sr"/><text x="11" y="151">int 610</text>
    <rect x="210" y="96" width="54" height="24" class="fr sr"/><text x="216" y="113">int 380</text>
    <text x="320" y="18">ndarray: one contiguous block</text>
    <rect x="320" y="28" width="60" height="28" class="fb sb"/><rect x="380" y="28" width="60" height="28" class="fb sb"/><rect x="440" y="28" width="60" height="28" class="fb sb"/><rect x="500" y="28" width="60" height="28" class="fb sb"/>
    <text x="330" y="47">450</text><text x="390" y="47">220</text><text x="450" y="47">610</text><text x="510" y="47">380</text>
    <text x="320" y="90" class="tg">8 bytes each, same type, no pointers:</text><text x="320" y="108" class="tg">a compiled loop streams through the raw bytes</text>
    <text x="10" y="184" class="tm">each Python number is a separate object of about 24-28 bytes, plus an 8-byte pointer, scattered in memory</text>
  </svg><figcaption>A list keeps addresses of number objects scattered around memory; an array packs the raw numbers side by side.</figcaption></figure>
  <p>On the left of the figure, to multiply each item Python has to follow the pointer, look up what type of object it found, find the right <code>*</code> for that type, do the multiplication, and create a brand-new number object for the answer. The multiplication itself is a tiny part of that work; the bookkeeping is most of it. On the right is the alternative NumPy uses: the raw numbers packed side by side, all of the same type, with no per-item objects at all. Think of the difference between eggs kept loose in separate bags around a kitchen, where washing them means opening each bag and checking there really is an egg inside, and eggs sitting in one tray, all the same size, washed in a single sweep.</p>
  <p>Let us measure the difference on one million order amounts. Each version adds the 5% fee and totals the result; <code>timeit.repeat</code> runs each version five times and we keep the fastest run. Timings depend on the machine, so treat them as approximate:</p>
  <div class="fx" data-lang="py">import timeit, sys
import numpy as np

rng = np.random.default_rng(0)
big = rng.integers(100, 1000, 1_000_000).astype(float)   # one million order amounts
big_list = big.tolist()                                   # the same numbers as a list

def loop_list():                       # plain Python
    total = 0.0
    for a in big_list:
        total += a * 1.05
    return total

def loop_array():                      # a Python loop, but over an ndarray
    total = 0.0
    for a in big:
        total += a * 1.05
    return total

def vectorised():                      # NumPy does the loop
    return (big * 1.05).sum()

for name, f in [("loop over list", loop_list),
                ("loop over ndarray", loop_array),
                ("(big * 1.05).sum()", vectorised)]:
    t = min(timeit.repeat(f, number=1, repeat=5))
    print(f"{name:20s} {t*1e3:8.2f} ms")

print("one Python float:", sys.getsizeof(1.5), "bytes, plus an 8-byte pointer in the list")
list_bytes = sys.getsizeof(big_list) + sum(sys.getsizeof(v) for v in big_list)
print(f"list memory {list_bytes/1e6:.1f} MB | array memory {big.nbytes/1e6:.1f} MB")</div>
  <div class="fx" data-lang="text">loop over list          18.58 ms
loop over ndarray       96.76 ms
(big * 1.05).sum()       1.12 ms
one Python float: 24 bytes, plus an 8-byte pointer in the list
list memory 32.0 MB | array memory 8.0 MB</div>
  <p>The plain list loop took about 18.6 ms. The one-line NumPy version, <code>(big * 1.05).sum()</code>, took about 1.1 ms, roughly 17 times faster, and stored the numbers in 8 MB instead of 32 MB, because each number is 8 raw bytes instead of a 24-byte object plus an 8-byte pointer. The middle line is the important surprise: a Python <code>for</code> loop over a NumPy array was the slowest of all, about 97 ms. When your own loop asks for one element at a time, NumPy has to wrap each raw number in a new Python object to hand it to you, so you pay all the list costs and more.</p>
  <p>This is the central idea of NumPy, and it has a name. <strong>Vectorisation</strong> means writing a computation as an operation on whole arrays, like <code>big * 1.05</code>, so that the loop over the elements runs inside NumPy's compiled C code instead of in Python. Importing NumPy does not make code fast; letting NumPy run the loop does. Everything else on this page is a tool for expressing more kinds of computation in that vectorised way.</p>

  <h2 id="dn-nd"><span class="num">02</span>The ndarray: Memory Layout and dtypes</h2>
  <p>NumPy's container is called the <strong>ndarray</strong>, short for "n-dimensional array". An ndarray is a fixed-size block of memory holding values that all have the same type, stored one after another, together with a small header that describes how to read that block. Because every element has the same type and the same size, NumPy can find element number 5 by simple arithmetic (start of the block plus 5 times 8 bytes) and knows in advance which machine instruction to use, so it never needs to check anything per element. You create one by passing a list to <code>np.array</code>:</p>
  <div class="fx" data-lang="py">import numpy as np

amounts = np.array([450, 220, 610, 380, 150, 720, 300, 270])
print(amounts * 1.05)                  # 5% fee on every order, no loop
print(amounts + 40)                    # ₹40 delivery charge on every order
print(type(amounts).__name__, amounts.dtype, amounts.itemsize, amounts.nbytes)</div>
  <div class="fx" data-lang="text">[472.5 231.  640.5 399.  157.5 756.  315.  283.5]
[490 260 650 420 190 760 340 310]
ndarray int64 8 64</div>
  <p>Now <code>amounts * 1.05</code> applies the fee to all eight orders and <code>amounts + 40</code> adds a ₹40 delivery charge to each, with no loop in sight. The last line shows the header information. The array's <strong>dtype</strong> (data type) is <code>int64</code>, meaning whole numbers stored in 64 bits, which is 8 bytes each (<code>itemsize</code>), so eight orders take 64 bytes in total (<code>nbytes</code>).</p>
  <p>The price of "one type for everything" appears when the values you give NumPy are not all the same type. NumPy then picks a single type that can represent all of them, which is called <strong>upcasting</strong>:</p>
  <div class="fx" data-lang="py">print(np.array([1, 2, 3.5]).dtype)               # one float: everything becomes float64
mixed = np.array([450, "Pune"])                  # one string: everything becomes text
print(mixed, mixed.dtype)

small = amounts.astype(np.int16)                 # choose a narrower type
print(small.dtype, small.itemsize, small.nbytes)
print(np.iinfo(np.int16).min, np.iinfo(np.int16).max)
print(np.array([0.1, 0.5]).dtype, np.array([True, False]).dtype)</div>
  <div class="fx" data-lang="text">float64
['450' 'Pune'] &lt;U21
int16 2 16
-32768 32767
float64 bool</div>
  <p>One decimal among integers turned the whole array into <code>float64</code> (64-bit decimal numbers), which is harmless. One string among numbers turned everything into text: the dtype <code>&lt;U21</code> means Unicode strings of up to 21 characters, so <code>'450'</code> is now a piece of text and any maths on it will fail. This happens in real work when a CSV column of numbers contains one stray word, so checking <code>.dtype</code> after loading data is a good habit. You can also choose a dtype yourself with <code>astype</code>: as <code>int16</code> each amount takes 2 bytes instead of 8, but an int16 can only hold whole numbers from −32,768 to 32,767, which matters later when we talk about memory. The common dtypes are <code>int64</code> and <code>int32</code> for whole numbers, <code>float64</code> and <code>float32</code> for decimals, <code>bool</code> for True/False and <code>&lt;U</code> for text.</p>
  <p>So far our array has one direction. Our orders, though, form a table: orders going down, columns going across. Each direction of an array is called an <strong>axis</strong>. A row of amounts has one axis; a table has two, where axis 0 runs down the rows and axis 1 runs across the columns. Let us put the two numeric columns, amount and minutes, side by side in one table called <code>X</code>:</p>
  <div class="fx" data-lang="py">minutes = np.array([32, 25, 41, 28, 18, 45, 30, 21])      # delivery minutes
X = np.column_stack([amounts, minutes])                   # 8 orders x 2 columns
print(X[:3])
print("shape", X.shape, "| ndim", X.ndim, "| size", X.size, "| dtype", X.dtype)
print("strides", X.strides, "| C-contiguous", X.flags["C_CONTIGUOUS"])
print("X.T shape", X.T.shape, "| X.T strides", X.T.strides,
      "| shares memory with X:", np.shares_memory(X, X.T))</div>
  <div class="fx" data-lang="text">[[450  32]
 [220  25]
 [610  41]]
shape (8, 2) | ndim 2 | size 16 | dtype int64
strides (16, 8) | C-contiguous True
X.T shape (2, 8) | X.T strides (8, 16) | shares memory with X: True</div>
  <p>The header describes this table with a handful of attributes. <code>shape</code> is the length of each axis, here <code>(8, 2)</code>: 8 orders, 2 columns. <code>ndim</code> is the number of axes (2). <code>size</code> is the total number of elements, 8 × 2 = 16. <code>dtype</code> is the one type all of them share. The most interesting one is <code>strides</code>, the number of bytes to jump in memory to move one step along each axis.</p>
  <p>Strides explain how a flat block of memory can behave like a table. In memory, <code>X</code> is just 16 numbers in a row: 450, 32, 220, 25, 610, 41, and so on. Moving one column to the right means moving to the next number, which is 8 bytes on. Moving one row down means skipping a whole row of 2 numbers, which is 16 bytes. So the strides are <code>(16, 8)</code>, and the element in row 2, column 0 lives at byte 2 × 16 + 0 × 8 = 32, which is the fifth number, 610. Storing rows one after another like this is called <strong>C order</strong> (after the C language), which is what <code>C-contiguous True</code> confirms. Think of a cinema whose 16 seats are actually in one long corridor: the usher's card says "rows of 2 seats", so row 3, seat 1 is corridor seat 5. Hand the usher a different card and the same seats form a different hall. The card is the shape and strides; the seats never move.</p>
  <p>The last line shows why this matters. The transpose <code>X.T</code>, which swaps rows and columns, has shape <code>(2, 8)</code> but did not copy anything: it simply swapped the strides to <code>(8, 16)</code> and reads the same bytes in a different order, which is why it shares memory with <code>X</code>. Many NumPy operations are cheap for exactly this reason: they write a new header over the old block instead of moving data. We will use this idea again for views, reshaping and broadcasting.</p>
  <p>You rarely type every value of an array by hand. NumPy has functions that create arrays of a given shape:</p>
  <div class="fx" data-lang="py">print(np.zeros((2, 3)))                # a blank 2x3 table of float64
print(np.arange(0, 10, 3))             # like range(): step 3, stop excluded
print(np.linspace(0, 1, 5))            # 5 evenly spaced points, stop included
print(np.full((2, 2), 40))             # a table filled with one value
print(np.eye(3, dtype=int))            # identity matrix
print(np.ones_like(minutes))           # same shape and dtype as minutes</div>
  <div class="fx" data-lang="text">[[0. 0. 0.]
 [0. 0. 0.]]
[0 3 6 9]
[0.   0.25 0.5  0.75 1.  ]
[[40 40]
 [40 40]]
[[1 0 0]
 [0 1 0]
 [0 0 1]]
[1 1 1 1 1 1 1 1]</div>
  <p><code>zeros</code> gives a blank table (float64 by default). <code>arange</code> works like Python's <code>range</code>, with a step size and the stop value excluded, while <code>linspace</code> asks how many evenly spaced points you want and includes the stop. <code>full</code> fills a shape with one value, <code>eye</code> makes an identity matrix (1s on the diagonal, 0s elsewhere; we will use it for one-hot encoding), and <code>ones_like</code> copies the shape and dtype of an existing array. Note also that shape <code>(8,)</code>, a flat row of 8 numbers, is different from <code>(8, 1)</code>, a column, and from <code>(1, 8)</code>, a one-row table; they print differently and, as we will see, combine with other arrays differently.</p>

  <h2 id="dn-slice"><span class="num">03</span>Indexing and Slicing</h2>
  <p>Most questions only need part of the data. "What is the average delivery time?" needs only the minutes column; "refund the lunch orders" needs only the first three orders. NumPy uses the same square-bracket notation as Python lists, extended to more than one axis. <strong>Indexing</strong> means picking single elements by their position, counting from 0, with negative numbers counting from the end. A <strong>slice</strong> is written <code>start:stop:step</code> and picks a range of positions, with the stop excluded; leaving a part out means "from the beginning", "to the end" or "every one", so a bare <code>:</code> means "everything along this axis". For a table you give one index or slice per axis, separated by a comma, rows first: <code>X[rows, columns]</code>.</p>
  <div class="fx" data-lang="py">print(amounts[0], amounts[-1])         # first and last order
print(amounts[2:5])                    # positions 2, 3, 4
print(amounts[::2])                    # every second order
print(amounts[::-1])                   # reversed
print(X[2, 0])                         # row 2, column 0: one number
print(X[2])                            # row 2: one whole order
print(X[1:3, :])                       # rows 1-2, all columns
print(X[:, 1])                         # column 1: every delivery time
print(X[:, 0].mean(), X[:, 1].mean())  # average amount, average minutes</div>
  <div class="fx" data-lang="text">450 270
[610 380 150]
[450 610 150 300]
[270 300 720 150 380 610 220 450]
610
[610  41]
[[220  25]
 [610  41]]
[32 25 41 28 18 45 30 21]
387.5 30.0</div>
  <p>Reading the output from the top: positions 0 and −1 are the first and last orders (₹450 and ₹270). <code>amounts[2:5]</code> takes positions 2, 3 and 4, which are orders 3, 4 and 5 (610, 380, 150); this off-by-one between position and order number is worth getting used to. <code>::2</code> takes every second order and <code>::-1</code> walks backwards. On the table, <code>X[2, 0]</code> is one number (the amount of order 3), <code>X[2]</code> with only one index gives the whole of row 2, and <code>X[1:3, :]</code> gives rows 1 and 2 with all columns. <code>X[:, 1]</code> means "all rows, column 1", which is every delivery time, and its mean is 30, exactly our hand total of 240 divided by 8.</p>
  <p>Notice that indexing with a single integer removes that axis: <code>X[2]</code> has shape <code>(2,)</code>, not <code>(1, 2)</code>, and <code>X[:, 1]</code> is a flat <code>(8,)</code> array, not an <code>(8, 1)</code> column. A slice keeps the axis, so <code>X[2:3]</code> would still be a <code>(1, 2)</code> table. This difference becomes important when shapes have to line up later.</p>
  <p>Slices can only describe evenly spaced positions: a start, a stop and a fixed step. Many real questions do not fit that pattern. The Pune orders are at positions 0, 2 and 4, then nothing; the late orders are wherever the minutes happen to be above 30. For those we need a different kind of selection.</p>

  <h2 id="dn-mask"><span class="num">04</span>Boolean and Fancy Indexing</h2>
  <p>When you compare an array with a value, NumPy compares every element and gives back an array of True and False of the same shape. Such a True/False array is called a <strong>boolean mask</strong>, and if you put it inside the square brackets, only the elements at True positions come out. A mask works like a sieve: the True holes let a value through and the False holes hold it back. This is how you filter data by a condition without a loop:</p>
  <div class="fx" data-lang="py">city = np.array(["Pune", "Delhi", "Pune", "Mumbai", "Pune", "Delhi", "Delhi", "Mumbai"])
is_pune = city == "Pune"
print(is_pune)
print(amounts[is_pune], amounts[is_pune].sum())
print(is_pune.sum(), is_pune.mean())             # True counts as 1

late = minutes &gt; 30
print(amounts[(city == "Delhi") &amp; late])         # Delhi AND late
print(amounts[(city == "Mumbai") | ~late])       # Mumbai OR not late
print(np.where(late, "late", "on time"))         # if/else on every element
print(np.flatnonzero(late))                      # positions where the mask is True</div>
  <div class="fx" data-lang="text">[ True False  True False  True False False False]
[450 610 150] 1210
3 0.375
[720]
[220 380 150 300 270]
['late' 'on time' 'late' 'on time' 'on time' 'late' 'on time' 'on time']
[0 2 5]</div>
  <p>The mask <code>city == "Pune"</code> is True at positions 0, 2 and 4, so <code>amounts[is_pune]</code> is [450 610 150], which adds up to ₹1,210, as you can check from the table. Because NumPy treats True as 1 and False as 0 in arithmetic, <code>is_pune.sum()</code> counts the Pune orders (3) and <code>is_pune.mean()</code> gives their share (3 out of 8 = 0.375). This "sum of a mask is a count, mean of a mask is a proportion" trick is used constantly in data analysis.</p>
  <p>To combine conditions you use <code>&amp;</code> for "and", <code>|</code> for "or" and <code>~</code> for "not", and you put each condition in parentheses. Late means more than 30 minutes, which is orders 1, 3 and 6; Delhi <em>and</em> late leaves only order 6, ₹720. Mumbai <em>or</em> not late gives every order except the three late ones. Python's own <code>and</code>/<code>or</code> do not work here, for a reason we will see in Common Mistakes. <code>np.where(condition, a, b)</code> is an if/else applied to every element at once: "late" where the mask is True, "on time" where it is False. With only a condition, <code>np.flatnonzero</code> returns the positions where the mask is True.</p>
  <p>The second kind of advanced selection is <strong>fancy indexing</strong>: putting a list or array of integer positions inside the brackets. NumPy returns the elements at those positions, in that order, and positions may repeat. Its most useful partner is <code>np.argsort</code>, which does not sort an array but returns the <em>positions</em> that would sort it. Indexing any column with those positions reorders it the same way, which is how you sort a whole table by one column:</p>
  <div class="fx" data-lang="py">print(amounts[[0, 5]])                           # positions 0 and 5
order = np.argsort(amounts)[::-1]                # positions, biggest amount first
print(order)
print(amounts[order])                            # amounts, sorted
print(city[order][:3])                           # the same positions reorder any column
print(X[order][:3])                              # ...or whole rows of the table

top3 = np.argpartition(amounts, -3)[-3:]         # 3 biggest, without a full sort
print(top3, amounts[top3])

names, codes, counts = np.unique(city, return_inverse=True, return_counts=True)
print(names, counts, codes)
print(np.eye(3, dtype=int)[codes][:4])           # one-hot: row k of the identity for code k</div>
  <div class="fx" data-lang="text">[450 720]
[5 2 0 3 6 7 1 4]
[720 610 450 380 300 270 220 150]
['Delhi' 'Pune' 'Pune']
[[720  45]
 [610  41]
 [450  32]]
[0 2 5] [450 610 720]
['Delhi' 'Mumbai' 'Pune'] [3 2 3] [2 0 2 1 2 0 0 1]
[[0 0 1]
 [1 0 0]
 [0 0 1]
 [0 1 0]]</div>
  <p><code>amounts[[0, 5]]</code> picks orders 1 and 6. <code>np.argsort(amounts)[::-1]</code> is [5 2 0 3 6 7 1 4]: position 5 (₹720) holds the biggest amount, then position 2 (₹610), then position 0 (₹450). Indexing <code>amounts</code> with these positions gives the sorted amounts, indexing <code>city</code> with them gives the cities of the biggest orders (Delhi, Pune, Pune), and indexing <code>X</code> with them reorders whole rows, so the table is now sorted by amount with each order's minutes still beside it.</p>
  <p>If you only need the top few, sorting everything is wasted work. <code>np.argpartition(amounts, -3)</code> rearranges positions so that the three biggest end up at the end, in no particular order, which takes time proportional to n rather than n log n for a full sort (see <a class="xref" data-note="dsa_complexity">Complexity</a>). Its last three entries are positions 0, 2 and 5, the orders worth ₹450, ₹610 and ₹720; you can then sort just those three if order matters.</p>
  <p>The last two lines show a common pattern built from fancy indexing. <code>np.unique</code> with <code>return_counts=True</code> gives the distinct cities in alphabetical order with how often each appears (Delhi 3, Mumbai 2, Pune 3), and <code>return_inverse=True</code> gives each order's city as a code, an integer position into that list (Pune is 2, Delhi is 0, Mumbai is 1). <strong>One-hot encoding</strong>, which machine-learning models need for categories, turns each code into a row with a single 1. Row k of the identity matrix is exactly the pattern for code k, so <code>np.eye(3)[codes]</code> uses fancy indexing to pick one identity row per order: order 1 (Pune, code 2) becomes [0 0 1].</p>
  <p>Masks and fancy indexing are together called <strong>advanced indexing</strong>, and they behave differently from slices in one important way: what you get back is a separate copy of the data rather than a window onto it. That difference is the subject of the next section.</p>

  <h2 id="dn-view"><span class="num">05</span>Views and Copies</h2>
  <p>Suppose the support team refunds order 1 by setting its amount to 0, working on a slice that holds just the three lunch orders. Watch what happens to the full array:</p>
  <div class="fx" data-lang="py">a = amounts.copy()                     # a scratch copy, so the running example stays intact
lunch = a[:3]                          # a slice
lunch[0] = 0                           # "refund order 1" in the slice...
print(a)                               # ...and the original changed
print(np.shares_memory(a, lunch), lunch.base is a)

b = amounts.copy()
lunch_copy = b[:3].copy()              # an explicit copy
lunch_copy[0] = 0
print(b)                               # untouched
print(np.shares_memory(b, lunch_copy), lunch_copy.base)</div>
  <div class="fx" data-lang="text">[  0 220 610 380 150 720 300 270]
True True
[450 220 610 380 150 720 300 270]
False None</div>
  <p>Changing <code>lunch</code> changed <code>a</code>. The reason goes back to the header idea from section 02. A basic slice does not copy any numbers; NumPy creates a new header (a new shape, strides and starting point) that looks at the <em>same</em> block of memory. An array like this is called a <strong>view</strong>: an array that shares its data with another array. <code>np.shares_memory</code> confirms that the two arrays overlap, and <code>lunch.base is a</code> shows whose memory the view is borrowing. A <strong>copy</strong> is the opposite, an array with its own memory, which is what <code>.copy()</code> creates; changing <code>lunch_copy</code> left <code>b</code> alone, and its <code>base</code> is <code>None</code> because it owns its data.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600" style="max-width:100%">
    <defs><marker id="dn-arv" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <text x="10" y="30">a</text><text x="10" y="80">lunch = a[:3]</text>
    <path d="M30 26 L188 50" stroke="currentColor" marker-end="url(#dn-arv)"/><path d="M110 76 L188 62" stroke="currentColor" marker-end="url(#dn-arv)"/>
    <rect x="190" y="40" width="200" height="34" class="fb sb"/><text x="198" y="62">one buffer [0 220 610 ...]</text>
    <text x="420" y="30">lunch_copy = b[:3].copy()</text>
    <path d="M470 36 L470 50" stroke="currentColor" marker-end="url(#dn-arv)"/>
    <rect x="420" y="52" width="160" height="34" class="fg sg"/><text x="430" y="74">its own buffer</text>
    <text x="10" y="112" class="tm">slices, reshape, .T = views (shared memory) · .copy(), masks, fancy indexing = copies</text>
  </svg><figcaption>Two names, one block of memory: writing through the view changes what <code>a</code> sees. The copy has a block of its own.</figcaption></figure>
  <p>The figure shows the situation: there is only one row of numbers, and <code>a[0]</code> and <code>lunch[0]</code> are two names for the same place in it. A good everyday picture is a window and a photograph. A view is a window onto a room: if someone moves the sofa, everyone looking through the window sees it moved. A copy is a photograph: it keeps showing the room as it was.</p>
  <p>NumPy makes slices views on purpose, because it makes slicing free: taking <code>X[:, 1]</code> from a table of a billion rows costs nothing, whereas copying would double the memory. The cost is that you must know when you are holding a view. The trap bites hardest inside functions, where the slicing happens out of sight:</p>
  <div class="fx" data-lang="py">def with_discount(arr):
    first_three = arr[:3]              # looks like a separate piece...
    first_three *= 0.9                 # ...but writes into the caller's array
    return first_three

c = amounts.astype(float)              # astype returns a new array
print(with_discount(c))
print(c)                               # the caller's data changed too</div>
  <div class="fx" data-lang="text">[405. 198. 549.]
[405. 198. 549. 380. 150. 720. 300. 270.]</div>
  <p>The function looks as if it computes a discounted version of the first three orders and returns it. But <code>arr[:3]</code> is a view into the caller's array, and <code>*=</code> changes values in place, so the caller's amounts 450, 220 and 610 silently became 405, 198 and 549. In a long pipeline this shows up hours later as "why are my totals 10% low?". If a function must not change its input, it should take a <code>.copy()</code> before modifying anything, or use <code>arr[:3] * 0.9</code>, which creates a new array.</p>
  <p>Advanced indexing behaves differently, and the reason is again the header. A view can only exist when the selected elements can be described by a start and fixed strides. The Pune orders at positions 0, 2 and 4 happen to be evenly spaced, but a mask in general can select any positions, which no single stride can describe, so NumPy has to gather the chosen values into a new block. Masks and fancy indexing therefore return copies when you read with them. When they appear on the <em>left</em> of an assignment, though, NumPy writes straight into the original:</p>
  <div class="fx" data-lang="py">d = amounts.copy()
is_pune = city == "Pune"
picked = d[is_pune]                    # mask on the right of = : a COPY
picked[0] = 0
print(d, np.shares_memory(d, picked))  # d unchanged

d[is_pune] = 0                         # mask on the LEFT of = : writes into d
print(d)

d2 = amounts.copy()
d2[is_pune][0] = 999                   # chained: writes into a temporary copy
print(d2)
d2[np.flatnonzero(is_pune)[0]] = 999   # one indexing step on the left: works
print(d2)</div>
  <div class="fx" data-lang="text">[450 220 610 380 150 720 300 270] False
[  0 220   0 380   0 720 300 270]
[450 220 610 380 150 720 300 270]
[999 220 610 380 150 720 300 270]</div>
  <p><code>picked = d[is_pune]</code> is a copy, so setting <code>picked[0]</code> to 0 left <code>d</code> unchanged. <code>d[is_pune] = 0</code>, with the mask on the left of <code>=</code>, wrote zeros into <code>d</code> at the three Pune positions. The chained version <code>d2[is_pune][0] = 999</code> did nothing at all: the first pair of brackets made a temporary copy, the second wrote 999 into that copy, and the copy was thrown away. The fix is to do the selection in one indexing step on the left of the assignment, as in the last line. pandas has the same trap under the name "chained assignment" (see <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a>).</p>
  <p>Views have one more, less obvious cost: a view keeps its whole parent alive. As long as any view exists, NumPy cannot free the parent's memory, even if the view only uses a tiny part of it:</p>
  <div class="fx" data-lang="py">huge = np.zeros(10_000_000)            # 80 MB
head = huge[:10]                       # a 10-number view
print(head.nbytes, head.base.nbytes)   # the view keeps all 80 MB alive
head = huge[:10].copy()                # a copy owns just its 80 bytes
del huge                               # now the 80 MB can be freed
print(head.nbytes, head.base)</div>
  <div class="fx" data-lang="text">80 80000000
80 None</div>
  <p>The 10-number view <code>head</code> needs only 80 bytes, but its <code>base</code> is the full 80 MB array, which stays in memory as long as <code>head</code> exists. Taking a <code>.copy()</code> of the small piece gives it its own 80 bytes (and <code>base</code> becomes <code>None</code>), so the big array can be freed. The summary is short: basic slicing, <code>.T</code> and (usually) <code>reshape</code> give views; masks, fancy indexing and <code>.copy()</code> give copies; and <code>np.shares_memory</code> tells you which you have when in doubt.</p>

  <h2 id="dn-ufunc"><span class="num">06</span>Vectorisation and ufuncs</h2>
  <p>We have seen that <code>amounts * 1.05</code> runs as one fast compiled loop. But many useful formulas are not plain arithmetic. "Minutes late" is the delivery time minus 30, but zero if the order arrived on time; a dashboard might need the running total of revenue through the day. Does every such formula fall back to a slow Python loop? No: NumPy provides a large family of functions designed for exactly this, called <strong>ufuncs</strong> (universal functions). A ufunc is a function that takes arrays, applies one small operation to every element in a compiled loop, and returns an array of results. The arithmetic operators <code>+ - * / **</code> and comparisons are ufuncs behind the scenes, and so are <code>np.maximum</code>, <code>np.sqrt</code>, <code>np.log</code>, <code>np.exp</code>, <code>np.abs</code> and dozens more.</p>
  <p>Think of a stamping machine in a factory: you feed in a whole sheet of blanks and every one is stamped in a single press, instead of a worker stamping them one by one.</p>
  <div class="fx" data-lang="py">print(np.maximum(minutes - 30, 0))               # minutes late, 0 if on time
print(np.clip(minutes, 20, 40))                  # cap extreme values at both ends
print(np.sqrt([16, 25, 36]), np.log10([10, 100, 1000]))
print(np.add.reduce(amounts))                    # fold with + : the total
print(np.add.accumulate(amounts))                # every running total
print(np.maximum.accumulate(minutes))            # slowest delivery so far
print(np.multiply.outer([1, 2], [10, 20, 30]))   # every pair</div>
  <div class="fx" data-lang="text">[ 2  0 11  0  0 15  0  0]
[32 25 40 28 20 40 30 21]
[4. 5. 6.] [1. 2. 3.]
3100
[ 450  670 1280 1660 1810 2530 2830 3100]
[32 32 41 41 41 45 45 45]
[[10 20 30]
 [20 40 60]]</div>
  <p>Trace the first line by hand. <code>minutes - 30</code> is [2 −5 11 −2 −12 15 0 −9]; <code>np.maximum(..., 0)</code> keeps the larger of each value and 0, giving [2 0 11 0 0 15 0 0]. Three orders were late, by 28 minutes in total. <code>np.clip</code> caps values at both ends: everything below 20 becomes 20 and everything above 40 becomes 40, a common way to limit outliers. <code>np.sqrt</code> and <code>np.log10</code> work on every element, and accept plain lists too.</p>
  <p>Every ufunc that combines two values also has a few methods that reuse its compiled loop in different ways. <code>.reduce</code> folds the whole array into one value by applying the operation repeatedly, so <code>np.add.reduce</code> is the total, 3,100; this is literally what <code>sum</code> does. <code>.accumulate</code> keeps every intermediate result, so <code>np.add.accumulate</code> gives the day's revenue after each order, ending at 3,100, and <code>np.maximum.accumulate</code> gives "the slowest delivery so far" (32, then 41 from order 3, then 45 from order 6). <code>.outer</code> applies the operation to every pair from two arrays, building a table.</p>
  <p>Real data has gaps, and NumPy marks a missing decimal value with <strong>NaN</strong> ("not a number"), a special float value. NaN has a property that catches everyone at least once:</p>
  <div class="fx" data-lang="py">m = minutes.astype(float)
m[3] = np.nan                                    # one delivery time is missing
print(m)
print(m.sum(), m.mean())                         # NaN spreads through arithmetic
print(np.nansum(m), np.nanmean(m).round(2))      # nan-functions skip it
print(np.isnan(m).sum(), np.nan == np.nan)       # count NaNs; NaN never equals itself</div>
  <div class="fx" data-lang="text">[32. 25. 41. nan 18. 45. 30. 21.]
nan nan
212.0 30.29
1 False</div>
  <p>One missing delivery time made both the sum and the mean NaN, because any arithmetic involving NaN gives NaN; the missing value spreads into every result it touches. The <code>nan</code>-prefixed functions, such as <code>np.nansum</code> and <code>np.nanmean</code>, skip missing values: the mean of the seven known times is (240 − 28) / 7 = 30.29. Because NaN is defined to be unequal to everything, including itself, <code>np.nan == np.nan</code> is False, so you must find missing values with <code>np.isnan</code>, never with <code>==</code>. Note also that NaN is a float: an integer array cannot hold it, which is why we converted the minutes to float first.</p>
  <p>Finally, a warning about something that looks like vectorisation but is not. NumPy has a function called <code>np.vectorize</code> that turns any Python function into one that accepts arrays. It is convenient, but it simply calls your Python function once per element, so it is a Python loop in disguise. Here it is compared with a real ufunc on 200,000 numbers (timings approximate):</p>
  <div class="fx" data-lang="py">import math, timeit
import numpy as np
arr = np.random.default_rng(0).random(200_000) * 1000
vals = arr.tolist()

vsqrt = np.vectorize(math.sqrt)
tests = [("list comp + math.sqrt", lambda: [math.sqrt(v) for v in vals]),
         ("np.vectorize(math.sqrt)", lambda: vsqrt(arr)),
         ("np.sqrt (a real ufunc)", lambda: np.sqrt(arr))]
for name, f in tests:
    t = min(timeit.repeat(f, number=1, repeat=5))
    print(f"{name:24s} {t*1e3:6.2f} ms")</div>
  <div class="fx" data-lang="text">list comp + math.sqrt     10.57 ms
np.vectorize(math.sqrt)   15.45 ms
np.sqrt (a real ufunc)     0.19 ms</div>
  <p>The list comprehension with <code>math.sqrt</code> took about 10.6 ms, <code>np.vectorize</code> was even slower at about 15.5 ms, and the real ufunc <code>np.sqrt</code> took about 0.19 ms, more than 50 times faster than either. When a formula can be written with ufuncs, operators, <code>np.where</code> and masks, do that. Python's own built-ins are also not ufuncs: <code>max(minutes - 30, 0)</code> raises an error and <code>math.sqrt</code> fails on an array, which is why NumPy has its own <code>np.maximum</code> and <code>np.sqrt</code>.</p>

  <h2 id="dn-axis"><span class="num">07</span>Aggregating Along an Axis</h2>
  <p>A ufunc keeps the shape: eight minutes in, eight late-minute values out. Business questions, though, are usually summaries, where many values become one. Turning many values into one is called an <strong>aggregation</strong> (or reduction); <code>sum</code>, <code>mean</code>, <code>min</code>, <code>max</code>, <code>std</code> and <code>argmax</code> are the common ones. On a flat array there is only one way to aggregate. On a table there are several, and the manager's question shows why: they want revenue for each city at lunch and at dinner, then totals per meal and per city.</p>
  <p>First we build that table with the masks from section 04. Lunch is before 18:00, which is orders 1 to 3, and dinner is from 18:00, orders 4 to 8. By hand, Pune earned 450 + 610 = 1,060 at lunch and 150 at dinner; Delhi 220 and 720 + 300 = 1,020; Mumbai nothing at lunch and 380 + 270 = 650 at dinner.</p>
  <div class="fx" data-lang="py">hour = np.array([12, 12, 13, 19, 20, 20, 21, 21])          # hour each order was placed
dinner = hour &gt;= 18
cities = ["Pune", "Delhi", "Mumbai"]
table = np.array([[amounts[(city == c) &amp; ~dinner].sum(),
                   amounts[(city == c) &amp; dinner].sum()] for c in cities])
print(table)                                     # rows = city, columns = lunch, dinner
print("axis=0:", table.sum(axis=0), table.sum(axis=0).shape)
print("axis=1:", table.sum(axis=1), table.sum(axis=1).shape)
print("all:   ", table.sum())</div>
  <div class="fx" data-lang="text">[[1060  150]
 [ 220 1020]
 [   0  650]]
axis=0: [1280 1820] (2,)
axis=1: [1210 1240  650] (3,)
all:    3100</div>
  <p>The table matches the hand calculation, with cities as rows and meals as columns. Now the <code>axis</code> argument, which is the most commonly confused idea in NumPy. The rule that always works is: <strong>the axis you name is the axis that disappears</strong>. <code>sum(axis=0)</code> collapses axis 0, the rows, by walking down each column and adding: lunch is 1,060 + 220 + 0 = 1,280 and dinner is 150 + 1,020 + 650 = 1,820. One value per column remains, and the shape goes from <code>(3, 2)</code> to <code>(2,)</code>. <code>sum(axis=1)</code> collapses axis 1, the columns, by walking across each row: Pune 1,210, Delhi 1,240, Mumbai 650, one value per city, shape <code>(3,)</code>. With no axis, everything is added, giving 3,100, the same as the eight orders.</p>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600" style="max-width:100%">
    <defs><marker id="dn-arx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="70" y="16" width="160" height="84" class="fs" stroke="currentColor"/><text x="82" y="38">1060   150</text><text x="82" y="64"> 220  1020</text><text x="82" y="90">   0   650</text>
    <path d="M50 16 L50 100" stroke="currentColor" marker-end="url(#dn-arx)"/><text x="4" y="62">axis 0</text>
    <path d="M70 120 L230 120" stroke="currentColor" marker-end="url(#dn-arx)"/><text x="120" y="136">axis 1</text>
    <text x="260" y="40">sum(axis=0) → [1280 1820]   one per column</text>
    <text x="260" y="66">sum(axis=1) → [1210 1240 650]  one per row</text>
    <text x="260" y="92" class="tm">rows = cities, columns = lunch, dinner</text>
  </svg><figcaption>Summing along axis 0 runs down the rows and squashes them, leaving one value per column; axis 1 runs across and leaves one value per row.</figcaption></figure>
  <p>A school marks register is a good way to remember it. Students go down the rows and subjects go across the columns. "The class average for each subject" squashes the students, so it is axis 0; "each student's total" squashes the subjects, so it is axis 1. You name what gets squashed, not what you keep. When unsure, check the shape of the result: if you wanted one value per city, it must have length 3.</p>
  <p>The same rule applies to every aggregation:</p>
  <div class="fx" data-lang="py">table = np.array([[1060, 150], [220, 1020], [0, 650]])
print(table.argmax(axis=1))                      # best meal (column) for each city
print(table.argmax(axis=0))                      # best city (row) for each meal
print(table.cumsum(axis=1))                      # running total across each row
print(X.mean(axis=0), X.std(axis=0).round(2))    # mean and std of each column
print(table.sum(axis=1, keepdims=True))          # keep the squashed axis as size 1</div>
  <div class="fx" data-lang="text">[0 1 1]
[0 1]
[[1060 1210]
 [ 220 1240]
 [   0  650]]
[387.5  30. ] [183.69   8.69]
[[1210]
 [1240]
 [ 650]]</div>
  <p><code>argmax</code> returns the <em>position</em> of the largest value rather than the value. Along axis 1 it gives [0 1 1]: Pune earns most at lunch (column 0), Delhi and Mumbai at dinner (column 1). Along axis 0 it gives [0 1]: Pune is the best city at lunch and Delhi at dinner. <code>cumsum(axis=1)</code> is a running total across each row, so the last column equals the row totals. On the orders table, <code>X.mean(axis=0)</code> gives one mean per column, [387.5, 30], the average amount and the average delivery time we computed by hand, and <code>X.std(axis=0)</code> gives each column's standard deviation, the typical distance from the mean (see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>).</p>
  <p>The last line introduces <code>keepdims=True</code>, which keeps the squashed axis with length 1 instead of removing it, so the row totals come back as a <code>(3, 1)</code> column instead of a flat <code>(3,)</code>. That looks like a cosmetic difference, but it decides whether the totals can be combined with the original table, which is exactly what the next section is about.</p>

  <h2 id="dn-bc"><span class="num">08</span>Broadcasting</h2>
  <p>A common next step after computing column means is to standardise the data: subtract each column's mean and divide by its standard deviation, so that amount (hundreds of rupees) and minutes (tens) are on the same scale. The result is called a <strong>z-score</strong>, the number of standard deviations a value is above or below its column's mean. But <code>X</code> has shape <code>(8, 2)</code> and the means have shape <code>(2,)</code>. Element-by-element operations need matching elements, so do we have to repeat the means eight times by hand? Let us just try it:</p>
  <div class="fx" data-lang="py">mu = X.mean(axis=0)                     # shape (2,)
sigma = X.std(axis=0)                   # shape (2,)
print(X.shape, mu.shape)
print((X - mu)[:3])                     # (8, 2) - (2,) -&gt; (8, 2)
z = (X - mu) / sigma                    # z-score every column at once
print(z[:3].round(2))
print(z.mean(axis=0).round(10), z.std(axis=0))</div>
  <div class="fx" data-lang="text">(8, 2) (2,)
[[  62.5    2. ]
 [-167.5   -5. ]
 [ 222.5   11. ]]
[[ 0.34  0.23]
 [-0.91 -0.58]
 [ 1.21  1.27]]
[ 0. -0.] [1. 1.]</div>
  <p>It worked. NumPy subtracted the two means from every one of the eight rows: order 1 became (450 − 387.5, 32 − 30) = (62.5, 2) and order 2 became (−167.5, −5). Dividing by the standard deviations the same way gives the z-scores: order 3 is 1.21 standard deviations above the average amount and 1.27 above the average delivery time. After standardising, each column has mean 0 and standard deviation 1, as the last line confirms (the "−0." is just a tiny rounding error with a negative sign). This automatic stretching of a smaller array to fit a larger one is called <strong>broadcasting</strong>.</p>
  <p>Picture a teacher who writes the class average on the board once. Every student reads that one line and subtracts it from their own marks; nobody makes thirty photocopies of it. Broadcasting is the same: NumPy does not actually build a repeated copy of the small array, it simply reuses the same values for every row, using a stride of 0 bytes along the stretched axis.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600" style="max-width:100%">
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
  </svg><figcaption>The (2,) means are virtually repeated down all 8 rows of X.</figcaption></figure>
  <p>Broadcasting follows one precise rule, and once you know it you can predict any case. Write the two shapes one under the other, <strong>aligned on the right</strong>; if one shape is shorter, treat the missing positions on its left as 1. Then compare the sizes position by position: each pair must be <strong>equal, or one of them must be 1</strong>. A size of 1 is stretched to match the other, and the result takes the larger size in each position. If any pair is unequal and neither is 1, NumPy raises an error. For <code>X - mu</code> the shapes are <code>(8, 2)</code> and <code>(2,)</code>: on the right, 2 and 2 are equal; on the left, 8 is compared with a missing size, which counts as 1, so the means are stretched down 8 rows. Here are three more cases on our data:</p>
  <div class="fx" data-lang="py">table = np.array([[1060, 150], [220, 1020], [0, 650]])
row_tot = table.sum(axis=1, keepdims=True)       # (3, 1), not (3,)
print((table / row_tot).round(2))                # each city's lunch / dinner share

thresholds = np.array([200, 400, 600])
over = amounts[:, None] &gt; thresholds[None, :]    # (8, 1) vs (1, 3) -&gt; (8, 3)
print(over.shape)
print(over.astype(int))
print(over.sum(axis=0))                          # orders above 200 / 400 / 600

try:
    X + np.arange(8)                             # (8, 2) + (8,)
except ValueError as e:
    print("ValueError:", e)
print((X + np.arange(8)[:, None])[:3])           # (8, 2) + (8, 1) works</div>
  <div class="fx" data-lang="text">[[0.88 0.12]
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
[7 3 2]
ValueError: operands could not be broadcast together with shapes (8,2) (8,) 
[[450  32]
 [221  26]
 [612  43]]</div>
  <p>The first case is why <code>keepdims</code> exists. The row totals as a <code>(3, 1)</code> column line up with the <code>(3, 2)</code> table as 3 against 3 (equal) and 2 against 1 (stretch), so each row is divided by its own total. Pune earns 88% of its revenue at lunch (1,060 / 1,210) and Mumbai 100% at dinner, and every row adds up to 1. Without <code>keepdims</code> the totals would be <code>(3,)</code>, and aligning on the right would compare 2 with 3, which fails.</p>
  <p>The second case uses broadcasting deliberately to build an "every pair" table. <code>amounts[:, None]</code> inserts a new axis and turns the eight amounts into an <code>(8, 1)</code> column; <code>thresholds[None, :]</code> makes the three thresholds a <code>(1, 3)</code> row. Comparing them stretches both into an <code>(8, 3)</code> table answering "is order i above threshold j?". Summing down the rows counts orders above ₹200, ₹400 and ₹600: 7, 3 and 2. You can check by hand: only ₹150 is not above 200; 450, 610 and 720 are above 400; 610 and 720 are above 600.</p>
  <p>The third case is the error. Adding a per-order value, shape <code>(8,)</code>, to the <code>(8, 2)</code> table fails, because aligning on the right compares 2 with 8. People expect it to work because both have 8 orders, but broadcasting only looks at positions from the right. Making the per-order values a column with <code>[:, None]</code> gives <code>(8, 1)</code>, which works: order 2 got +1 in both columns, order 3 got +2.</p>
  <p>The every-pair idea scales up to one of the most common broadcasting tasks: distances between every point in one set and every point in another. Say four customers and three restaurant hubs have map coordinates in kilometres, and we want the nearest hub for each customer:</p>
  <div class="fx" data-lang="py">P = np.array([[0, 0], [5, 5], [9, 0], [1, 1]])   # 4 customers, (x, y) in km
H = np.array([[9, 0], [0, 0], [5, 5]])           # 3 restaurant hubs
diff = P[:, None, :] - H[None, :, :]             # (4,1,2) - (1,3,2) -&gt; (4,3,2)
d = np.sqrt((diff ** 2).sum(axis=2))             # (4, 3) distances
print(diff.shape, d.shape)
print(d.round(1))
print(d.argmin(axis=1))                          # nearest hub for each customer</div>
  <div class="fx" data-lang="text">(4, 3, 2) (4, 3)
[[9.  0.  7.1]
 [6.4 7.1 0. ]
 [0.  9.  6.4]
 [8.1 1.4 5.7]]
[1 2 0 1]</div>
  <p><code>P[:, None, :]</code> has shape <code>(4, 1, 2)</code> and <code>H[None, :, :]</code> has shape <code>(1, 3, 2)</code>. Aligned on the right they broadcast to <code>(4, 3, 2)</code>: every customer minus every hub, in both x and y. Squaring, summing over the last axis and taking the square root gives the <code>(4, 3)</code> table of straight-line distances, and <code>argmin(axis=1)</code> picks the closest hub per customer. The customer at (1, 1) is 1.4 km from hub 1 at (0, 0), so its answer is 1. Assigning each point to its nearest centre is the first step of <a class="xref" data-note="ml_kmeans">K-Means</a>. One caution: the intermediate array has n × k × d numbers, so a million customers against a thousand hubs would need 16 GB; at that size you process in chunks or use <code>scipy.spatial.distance.cdist</code>.</p>
  <p>Broadcasting is powerful precisely because it never complains when the rule is satisfied, even if that is not what you meant. We will see a silent wrong result of this kind in Common Mistakes.</p>

  <h2 id="dn-reshape"><span class="num">09</span>Reshaping and Stacking</h2>
  <p>Often the numbers are right but the shape is wrong. scikit-learn expects features as a two-dimensional (rows, columns) table, but <code>amounts</code> is flat. Broadcasting needed a column where we had a row. And data often arrives in separate arrays that have to be joined. NumPy has two families of tools for this: reshaping changes the arrangement of one array, and stacking joins several.</p>
  <p>To <strong>reshape</strong> an array is to give the same values, in the same order, a different shape. The one rule is that the total number of elements must stay the same: eight numbers can be arranged as 2 × 4 or 8 × 1, never as 3 × 3. Picture eight tiffin boxes on a shelf: you can re-stack them as two rows of four or four rows of two without moving any food, but you cannot make three rows of three without a ninth box.</p>
  <div class="fx" data-lang="py">r = amounts.reshape(2, 4)                        # 2 rows of 4 orders
print(r)
print(amounts.reshape(-1, 1).shape)              # -1 = "work it out": a column
print(amounts[:, None].shape, amounts[None, :].shape)
print(np.shares_memory(r, amounts))              # reshape gave a view
print(np.shares_memory(r.ravel(), amounts), np.shares_memory(r.flatten(), amounts))
print(np.shares_memory(r.T.ravel(), amounts))    # transposed data can't be a flat view
try:
    amounts.reshape(3, 3)
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">[[450 220 610 380]
 [150 720 300 270]]
(8, 1)
(8, 1) (1, 8)
True
True False
False
ValueError: cannot reshape array of size 8 into shape (3,3)</div>
  <p><code>reshape(2, 4)</code> fills the new shape row by row: 450 220 610 380, then 150 720 300 270. Writing <code>-1</code> for one size means "work this out for me", so <code>reshape(-1, 1)</code> becomes <code>(8, 1)</code>, the column shape scikit-learn wants. <code>[:, None]</code> and <code>[None, :]</code> insert a new axis of length 1 (you may also see this written <code>np.newaxis</code>). Because reshaping only needs a new header, <code>reshape</code> returns a view whenever the existing memory order allows it, as <code>shares_memory</code> shows.</p>
  <p>Flattening a table back into one row has two spellings that differ in exactly this respect. <code>ravel</code> returns a view when it can, while <code>flatten</code> always makes a copy. "When it can" matters: the transpose <code>r.T</code> reads memory in a jumping order, so a flat view of it is impossible and <code>ravel</code> quietly returns a copy instead. The error at the end shows the size rule: 8 elements cannot become 3 × 3. A related point: <code>reshape</code> is not a transpose. Reshaping the <code>(8, 2)</code> table to <code>(2, 8)</code> would refill row by row and scramble amounts and minutes together; to swap rows and columns use <code>.T</code>.</p>
  <p><strong>Stacking</strong> means joining arrays, and there is one question to ask before choosing a function: do you want to glue along an axis that already exists, or create a new axis?</p>
  <div class="fx" data-lang="py">new_amounts = np.array([510, 190])               # two more orders arrive
print(np.concatenate([amounts, new_amounts]))    # existing axis: end to end
day1 = np.array([1060, 1020, 650])               # revenue per city, Monday
day2 = np.array([980, 1100, 720])                # Tuesday
print(np.stack([day1, day2]))                    # new axis 0: rows = days
print(np.stack([day1, day2], axis=1))            # new axis 1: columns = days
print(np.vstack([day1, day2]).shape, np.hstack([day1, day2]).shape)
print(np.column_stack([amounts, minutes])[:2])   # how X was built</div>
  <div class="fx" data-lang="text">[450 220 610 380 150 720 300 270 510 190]
[[1060 1020  650]
 [ 980 1100  720]]
[[1060  980]
 [1020 1100]
 [ 650  720]]
(2, 3) (6,)
[[450  32]
 [220  25]]</div>
  <p><code>np.concatenate</code> joins along an existing axis, so the two new orders are simply added to the end, giving ten amounts. <code>np.stack</code> joins arrays of the same shape along a <em>new</em> axis: two days of per-city revenue, each shape <code>(3,)</code>, become a <code>(2, 3)</code> table with a row per day, or with <code>axis=1</code> a <code>(3, 2)</code> table with a column per day. <code>np.vstack</code> puts arrays on top of each other and <code>np.hstack</code> joins them end to end. <code>np.column_stack</code> turns 1-D arrays into the columns of a table, which is how we built <code>X</code>.</p>
  <p>Because an ndarray has a fixed size, there is no cheap <code>append</code> as there is for lists. Every "append" creates a new, bigger array and copies all the existing data into it. Doing that once per batch inside a loop copies the data over and over (timings approximate):</p>
  <div class="fx" data-lang="py">import timeit
import numpy as np
chunks = [np.ones(1000) for _ in range(500)]     # 500 batches of 1,000 orders

def grow():
    out = np.empty(0)
    for ch in chunks:
        out = np.concatenate([out, ch])          # copies everything so far, every time
    return out

def collect():
    return np.concatenate(chunks)                # one copy at the end

for name, f in [("concatenate in a loop", grow), ("collect, concatenate once", collect)]:
    t = min(timeit.repeat(f, number=1, repeat=3))
    print(f"{name:26s} {t*1e3:7.2f} ms")</div>
  <div class="fx" data-lang="text">concatenate in a loop        84.74 ms
collect, concatenate once     0.38 ms</div>
  <p>Growing the array inside the loop took about 85 ms for 500 batches; collecting the batches in a Python list and concatenating once at the end took about 0.4 ms, over 200 times faster. With n batches the loop copies 1 + 2 + … + n batches' worth of data, which grows like n², written O(n²). The rule: collect pieces in a list (lists are good at growing) and convert or concatenate once, or, if you know the final size, create the array up front with <code>np.empty</code> or <code>np.zeros</code> and fill it.</p>

  <h2 id="dn-la"><span class="num">10</span>Linear Algebra</h2>
  <p>Some calculations are not element by element at all. A rider is paid ₹20 per delivery plus ₹2 per minute, so for order 1 (32 minutes) the pay is 1 × 20 + 32 × 2 = 84. "Multiply matching items, then add them up" is called a <strong>dot product</strong>, and it is the basic operation of linear algebra. A kirana shop bill is a dot product: quantities times prices, added up. If we put <code>[1, minutes]</code> for every order in an <code>(8, 2)</code> matrix <code>A</code> and the pay rule in <code>w = [20, 2]</code>, then the <strong>matrix product</strong> <code>A @ w</code> computes the dot product of every row of <code>A</code> with <code>w</code>, giving every rider's pay at once:</p>
  <div class="fx" data-lang="py">A = np.column_stack([np.ones(8), minutes])       # [1, minutes] for each order: (8, 2)
w = np.array([20, 2])                            # rider pay: ₹20 base + ₹2 per minute
pay = A @ w                                      # (8, 2) @ (2,) -&gt; (8,)
print(A[:2])
print(pay)
print(amounts @ np.ones(8), amounts.sum())       # a dot product with ones is a sum
print(A.T @ A)                                   # (2, 8) @ (8, 2) -&gt; (2, 2)

M = np.array([[1, 32], [1, 25]])
print(M * M)                                     # element-wise
print(M @ M)                                     # matrix product
try:
    A @ A                                        # (8, 2) @ (8, 2): inner sizes 2 and 8
except ValueError as e:
    print("ValueError:", str(e)[:60], "...")</div>
  <div class="fx" data-lang="text">[[ 1. 32.]
 [ 1. 25.]]
[ 84.  70. 102.  76.  56. 110.  80.  62.]
3100.0 3100
[[   8.  240.]
 [ 240. 7804.]]
[[   1 1024]
 [   1  625]]
[[ 33 832]
 [ 26 657]]
ValueError: matmul: Input operand 1 has a mismatch in its core dimension ...</div>
  <p>The pay per order is 84, 70, 102 and so on (order 3: 20 + 41 × 2 = 102). For this simple rule broadcasting could do the same (<code>minutes * 2 + 20</code>), but <code>@</code> generalises: with ten features and ten weights it is still one line, and "inputs <code>@</code> weights" is exactly what a linear model computes. A dot product with a vector of ones is just a sum, 3,100.</p>
  <p>The shape rule for <code>@</code> is that the inner sizes must match and the outer sizes remain: <code>(n, k) @ (k, m)</code> gives <code>(n, m)</code>. So <code>A.T @ A</code> is <code>(2, 8) @ (8, 2)</code>, which gives <code>(2, 2)</code>. Its entries are 8 (the number of orders), 240 (total minutes) and 7,804 (the sum of squared minutes); this matrix appears in the formula for linear regression. <code>A @ A</code> fails because the inner sizes are 2 and 8. The small matrix <code>M</code> shows the difference between the two multiplications: <code>M * M</code> squares each element (32 becomes 1,024), while <code>M @ M</code> is the matrix product, where each entry is a row times a column (1 × 32 + 32 × 25 = 832). They are completely different results, and confusing them is a classic bug.</p>
  <p>Linear algebra also runs the other way: given the results, find the unknown rule. Suppose we do not know the pay rule, only that the rider of order 1 (32 minutes) was paid ₹84 and the rider of order 2 (25 minutes) ₹70. With b the base fee and r the rate per minute, that is two equations: b + 32r = 84 and b + 25r = 70. Subtracting the second from the first gives 7r = 14, so r = 2, and then b = 84 − 64 = 20. In matrix form this is <code>[[1, 32], [1, 25]] @ [b, r] = [84, 70]</code>, and <code>np.linalg.solve</code> does exactly this elimination for any number of equations:</p>
  <div class="fx" data-lang="py">M = np.array([[1., 32.], [1., 25.]])             # order 1: 32 min, order 2: 25 min
paid = np.array([84., 70.])                      # what each rider was paid
print(np.linalg.solve(M, paid))                  # [base, rate]
print(np.linalg.det(M))

D = np.column_stack([np.ones(8), amounts])       # all 8 orders: minutes from amount
coef, *_ = np.linalg.lstsq(D, minutes, rcond=None)
print(coef.round(4))                             # [intercept, minutes per rupee]
print((np.array([1, 500]) @ coef).round(1))      # predicted minutes for a ₹500 order
print(np.linalg.norm([3, 4]))</div>
  <div class="fx" data-lang="text">[20.  2.]
-6.999999999999999
[12.3152  0.0456]
35.1
5.0</div>
  <p><code>solve</code> returns [20, 2], matching the hand result. The <strong>determinant</strong> <code>det</code> is −7 (shown with a tiny rounding error); a determinant of 0 means the equations have no single answer, for example if both orders had the same number of minutes. You may see code that solves systems with <code>np.linalg.inv(M) @ paid</code>; it gives the same answer here, but computing an explicit inverse is slower and loses accuracy on large or nearly singular systems, so <code>solve</code> is the right tool.</p>
  <p>The second part asks a different question: predict delivery minutes from the order amount using all eight orders. Now there are eight equations and only two unknowns (an intercept and a slope), and no straight line passes through all eight points. <strong>Least squares</strong> finds the line with the smallest total squared error, and <code>np.linalg.lstsq</code> computes it: minutes ≈ 12.32 + 0.0456 × amount. Every extra ₹100 of food adds about 4.6 minutes, and a ₹500 order is predicted to take 35.1 minutes. This is linear regression in one line, derived properly in <a class="xref" data-note="ml_regression">Linear Regression</a>. <code>np.linalg.norm</code> gives a vector's length, here the 3-4-5 triangle's 5.</p>
  <p>One more tool appears later in dimensionality reduction: <strong>eigenvalues and eigenvectors</strong>. For a symmetric matrix such as a correlation matrix, the eigenvectors are the directions along which the data spreads, and each eigenvalue says how much spread lies along its direction:</p>
  <div class="fx" data-lang="py">C = np.corrcoef(X.T)                             # 2x2 correlation of amount and minutes
print(C.round(3))
vals, vecs = np.linalg.eigh(C)                   # eigh: for symmetric matrices
print(vals.round(3))
print(vecs.round(3))</div>
  <div class="fx" data-lang="text">[[1.    0.965]
 [0.965 1.   ]]
[0.035 1.965]
[[-0.707  0.707]
 [ 0.707  0.707]]</div>
  <p>Amount and minutes are strongly correlated (0.965). The eigenvalues 1.965 and 0.035 say that almost all of the spread lies along one direction, the eigenvector [0.707, 0.707], which means "amount and minutes rise together". <code>eigh</code> is the version for symmetric matrices, faster and more accurate than the general <code>eig</code>. <a class="xref" data-note="ml_pca">PCA</a> uses exactly this to compress many correlated columns into a few, and <a class="xref" data-note="m_linalg">Linear Algebra</a> explains the mathematics behind all of these functions.</p>

  <h2 id="dn-rand"><span class="num">11</span>Random Number Generators</h2>
  <p>Eight orders were enough to check every idea by hand, but a regression on eight points or a speed test on eight numbers proves nothing. To test code at scale we need realistic fake data, and machine learning needs random train/test splits. Random numbers bring a problem of their own: if they change every run, results cannot be checked or reproduced.</p>
  <p>The solution comes from how computers make random numbers in the first place. They do not use true randomness; they use <strong>pseudo-random</strong> numbers, produced by a fixed formula that, from a starting value called the <strong>seed</strong>, generates a sequence that looks random. The same seed always gives the same sequence. Think of a pack of cards in a known starting order and a fixed shuffling routine: start from the same order, apply the same routine, and the same cards come out every time. NumPy's modern interface is a <strong>Generator</strong> object, created with <code>np.random.default_rng(seed)</code>, with methods for every kind of random draw:</p>
  <div class="fx" data-lang="py">import numpy as np
print(np.random.default_rng(7).integers(1, 7, 5))
print(np.random.default_rng(7).integers(1, 7, 5))      # same seed, same numbers

rng = np.random.default_rng(42)
print(rng.integers(1, 7, size=5))                # dice: high end excluded
print(rng.normal(0, 1, size=3).round(3))         # bell curve, mean 0, std 1
print(rng.choice(["Pune", "Delhi", "Mumbai"], size=5, p=[0.4, 0.35, 0.25]))
perm = rng.permutation(8)                        # shuffle the 8 order positions
print(perm, "train", np.sort(perm[:6]), "test", np.sort(perm[6:]))</div>
  <div class="fx" data-lang="text">[6 4 5 6 4]
[6 4 5 6 4]
[1 5 4 3 3]
[ 0.941 -1.951 -1.302]
['Mumbai' 'Mumbai' 'Pune' 'Delhi' 'Pune']
[5 0 4 7 3 1 6 2] train [0 1 3 4 5 7] test [2 6]</div>
  <p>Two Generators created with seed 7 rolled the same five dice. From one Generator with seed 42, <code>integers(1, 7)</code> rolls numbers from 1 to 6 (the high end is excluded, as with <code>range</code>), <code>normal(0, 1)</code> draws from the bell-shaped normal distribution, <code>choice</code> picks cities with probabilities of 40%, 35% and 25%, and <code>permutation(8)</code> shuffles the eight order positions. Taking the first six shuffled positions as training data and the last two as test data is a random train/test split, which is what <a class="xref" data-note="ml_splits">Train/Val/Test splits</a> does under the hood.</p>
  <p>You will see a lot of older code that instead calls <code>np.random.seed(42)</code> and then <code>np.random.rand()</code>. That older interface keeps one hidden, <strong>global</strong> generator shared by the whole program, and that is its weakness:</p>
  <div class="fx" data-lang="py">import numpy as np
np.random.seed(0); first = np.random.rand(3)
np.random.seed(0); np.random.rand(1)             # some library quietly draws one number
second = np.random.rand(3)
print(first.round(3), second.round(3))           # shifted: no longer reproducible

mine = np.random.default_rng(0); other = np.random.default_rng(99)
a1 = mine.random(3)
mine = np.random.default_rng(0); other.random(1) # the library uses its OWN generator
a2 = mine.random(3)
print(a1.round(3), a2.round(3))                  # identical</div>
  <div class="fx" data-lang="text">[0.549 0.715 0.603] [0.715 0.603 0.545]
[0.637 0.27  0.041] [0.637 0.27  0.041]</div>
  <p>In the first pair, both runs were seeded with 0, but before the second run "some library" drew one number from the same global generator. The second run's numbers are the first run's, shifted by one, so the seed no longer guarantees reproducibility. With Generators, your code owns its own object; another component using its own Generator cannot disturb it, so the two runs match exactly. The practical rule is to create one <code>rng = np.random.default_rng(seed)</code> near the top and pass it to whatever needs randomness (scikit-learn's <code>random_state=</code> parameter exists for the same reason).</p>
  <p>Now we can build the running example at scale. The function below uses almost every tool from this page: <code>choice</code> for categories, <code>np.select</code> (a multi-branch <code>np.where</code>) for per-restaurant base prices, a lognormal distribution for realistically skewed amounts, masks for dinner orders, arithmetic on <code>datetime64</code> timestamps, a vectorised formula for delivery time, and <code>argsort</code> with fancy indexing to sort everything by time. The <a class="xref" data-note="da_viz">Matplotlib &amp; Seaborn</a> and <a class="xref" data-note="da_plotly_streamlit">Plotly &amp; Streamlit</a> notes reuse this exact function.</p>
  <div class="fx" data-lang="py">import numpy as np

def make_orders(n=1000, seed=42):
    """The running example at scale: n orders as a dict of equal-length arrays."""
    rng = np.random.default_rng(seed)
    city = rng.choice(["Pune", "Delhi", "Mumbai"], n, p=[0.4, 0.35, 0.25])
    restaurant = rng.choice(["Pizza Hub", "Dosa Point", "Biryani Bros"], n, p=[0.4, 0.35, 0.25])
    base = np.select([restaurant == "Pizza Hub", restaurant == "Dosa Point"], [400, 200], 600)
    amount = (base * rng.lognormal(0, 0.35, n)).round(-1)
    dinner = rng.random(n) &lt; 0.6
    hour = np.where(dinner, rng.integers(18, 23, n), rng.integers(11, 15, n))
    minute_of_month = rng.integers(0, 31, n) * 1440 + hour * 60 + rng.integers(0, 60, n)
    order_time = np.datetime64("2025-03-01T00:00") + minute_of_month.astype("timedelta64[m]")
    extra = np.select([city == "Delhi", city == "Mumbai"], [5, 3], 0)
    mins = 15 + amount / 40 + extra + 4 * dinner + rng.normal(0, 4, n)
    customer = np.array([f"C{i:03d}" for i in rng.integers(1, 201, n)])
    s = np.argsort(order_time)
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
  <p>Each column is an array with its own dtype: 64-bit integers (<code>&lt;i8</code>), short strings (<code>&lt;U6</code> means up to 6 characters), timestamps to the minute (<code>&lt;M8[m]</code>) and floats (<code>&lt;f8</code>). The averages, ₹415 and 30.4 minutes, are close to our eight-order day, and calling the function again with the same seed gives identical data. Notice what this dictionary is: a set of equal-length arrays, one per column, kept in line by position. That is essentially what a pandas DataFrame stores, with names, row labels and mixed types handled for you, so <code>pd.DataFrame(make_orders())</code> turns it into a table directly.</p>

  <h2 id="dn-perf"><span class="num">12</span>Performance and Memory</h2>
  <p>With a thousand rows, almost any code is fast enough. With a hundred million, small choices decide whether a job takes seconds or minutes and whether it fits in memory at all. The biggest choice is the one from section 01, letting NumPy run the loop. After that, three things matter most: the size of each element, avoiding unnecessary new arrays, and reading memory in the order it is stored.</p>
  <p>The dtype sets the memory cost of every element, and choosing a smaller one is the easiest saving, but it has limits you must respect:</p>
  <div class="fx" data-lang="py">import numpy as np
o = make_orders()
amt, mins = o["amount"], o["delivery_minutes"]
print(amt.nbytes, amt.astype(np.float32).nbytes, mins.astype(np.int16).nbytes)
print(np.array([30000], dtype=np.int16) + np.int16(30000))   # past 32767: wraps
print(np.float32(16_777_217), np.float64(16_777_217))        # float32: ~7 exact digits
print(np.array([150, 220], dtype=np.int16).sum().dtype)      # sums are widened for you</div>
  <div class="fx" data-lang="text">8000 4000 2000
[-5536]
1.6777216e+07 16777217.0
int64</div>
  <p>A thousand amounts as <code>float64</code> take 8,000 bytes, as <code>float32</code> 4,000, and the delivery minutes as <code>int16</code> only 2,000; on a hundred million rows that is the difference between 800 MB and 200 MB. But a smaller type has a smaller range, and NumPy does not warn you when you leave it. An int16 holds at most 32,767, so 30,000 + 30,000 <strong>overflows</strong>: the result wraps around to −5,536 with no error. A float32 keeps only about 7 significant digits, so 16,777,217 cannot be stored and becomes 16,777,216. NumPy protects you in one common case, since <code>sum</code> on small integers accumulates in a 64-bit type, as the last line shows, but element-wise arithmetic does not. The safe pattern is to use small types for columns whose range you know (minutes, ages, codes) and to do money arithmetic in <code>float64</code> or <code>int64</code>.</p>
  <p>Every expression like <code>v * 1.05</code> creates a new array, which means asking the operating system for fresh memory and writing all the results into it. When you no longer need the old values, an <strong>in-place operation</strong>, one that writes its result into an existing array, avoids that cost. You write it with an augmented operator such as <code>*=</code>, or with a ufunc's <code>out=</code> argument, which writes into an array you provide (timings approximate):</p>
  <div class="fx" data-lang="py">import timeit
import numpy as np
v = np.random.default_rng(1).random(5_000_000)            # 40 MB of float64
w = v.copy()
out = np.empty_like(v)

def new_array():
    return v * 1.05                                       # allocates a fresh 40 MB

def in_place():
    global w
    w *= 1.05                                             # overwrites w's own memory

def into_out():
    np.multiply(v, 1.05, out=out)                         # writes into a buffer we own

for name, f in [("v * 1.05", new_array), ("w *= 1.05", in_place),
                ("np.multiply(..., out=)", into_out)]:
    t = min(timeit.repeat(f, number=5, repeat=5)) / 5
    print(f"{name:24s} {t*1e3:6.2f} ms")</div>
  <div class="fx" data-lang="text">v * 1.05                   5.02 ms
w *= 1.05                  1.46 ms
np.multiply(..., out=)     3.28 ms</div>
  <p>On five million numbers, <code>v * 1.05</code> took about 5.0 ms because it had to allocate and fill a fresh 40 MB array; <code>w *= 1.05</code> took about 1.5 ms by overwriting <code>w</code>'s own memory; and writing into a pre-allocated <code>out</code> array fell in between, useful when you need to keep the input and run the same calculation repeatedly. Remember the view rule from section 05 when working in place: an in-place operation on a view changes the parent array.</p>
  <p>The last factor is <strong>memory layout</strong>, the order in which elements sit in memory. The CPU does not fetch single numbers from RAM; it fetches small blocks (cache lines, usually 64 bytes) into its cache, and reading neighbouring values is far cheaper than jumping around (<a class="xref" data-note="cf_memory">Memory: RAM, Cache, Stack &amp; Heap</a> explains caches in detail). Here is the effect on two arrays with the same number of elements, one contiguous and one taking every eighth number, so its stride is 64 bytes:</p>
  <div class="fx" data-lang="py">import timeit
import numpy as np
big = np.random.default_rng(2).random(16_000_000)         # 128 MB
packed = big[:2_000_000]                                  # 2M neighbours: stride 8 bytes
spread = big[::8]                                         # 2M numbers, stride 64 bytes
print(packed.size, packed.strides, spread.size, spread.strides)

for name, arr in [("contiguous", packed), ("every 8th", spread)]:
    t = min(timeit.repeat(arr.sum, number=10, repeat=5)) / 10
    print(f"{name:11s} sum of 2M numbers {t*1e3:5.2f} ms")</div>
  <div class="fx" data-lang="text">2000000 (8,) 2000000 (64,)
contiguous  sum of 2M numbers  0.84 ms
every 8th   sum of 2M numbers  5.18 ms</div>
  <p>Both sums add two million numbers, but the contiguous one took about 0.84 ms and the strided one about 5.2 ms, roughly six times slower. With a stride of 64 bytes, every number lives in a different cache line, so the CPU loads eight times as much memory to use the same amount of data. The same thing happens on a table: in a C-ordered array each row is contiguous and each column is strided, so code that processes one column at a time in a loop is working against the layout. When that pattern is unavoidable, <code>np.ascontiguousarray</code> or <code>np.asfortranarray</code> (column-by-column order) copies the data once into the order you will read it.</p>
  <p>Put together, the habits are: write whole-array operations rather than loops (and remember that <code>np.vectorize</code> is a loop); pick the smallest dtype that safely holds the data; work in place when the old values are no longer needed; prefer views and slices over copies when you only read; read memory in the order it is stored; and never grow an array inside a loop.</p>

  <h2 id="dn-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common error when filtering is combining conditions with Python's <code>and</code>/<code>or</code>, or using <code>&amp;</code> without parentheses:</p>
  <div class="fx" data-lang="py">try:
    amounts[city == "Delhi" and minutes &gt; 30]
except ValueError as e:
    print("ValueError:", e)
try:
    amounts[city == "Delhi" &amp; minutes &gt; 30]          # &amp; binds before == and &gt;
except Exception as e:
    print(type(e).__name__ + ":", e)
print(amounts[(city == "Delhi") &amp; (minutes &gt; 30)])</div>
  <div class="fx" data-lang="text">ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()
TypeError: ufunc 'bitwise_and' not supported for the input types, and the inputs could not be safely coerced to any supported types according to the casting rule ''safe''
[720]</div>
  <p><code>and</code> needs a single True or False for each side, but <code>city == "Delhi"</code> is an array of eight values, and NumPy refuses to guess whether you mean "all of them" or "any of them", hence "the truth value of an array is ambiguous". Without parentheses the second attempt fails differently: in Python <code>&amp;</code> binds more tightly than <code>==</code> and <code>&gt;</code>, so it first tries to compute <code>"Delhi" &amp; minutes</code>, which makes no sense. Writing <code>&amp;</code>, <code>|</code>, <code>~</code> with each condition in its own parentheses fixes both.</p>
  <p>A second quiet mistake is writing a decimal value into an integer array. The array's dtype does not change to fit the new value; the value is converted to fit the dtype:</p>
  <div class="fx" data-lang="py">a = amounts.copy()                      # int64
a[0] = 450.75                           # silently truncated to fit the dtype
print(a[:3])
a = amounts.astype(float)               # choose the dtype first
a[0] = 450.75
print(a[:3])</div>
  <div class="fx" data-lang="text">[450 220 610]
[450.75 220.   610.  ]</div>
  <p>The ₹450.75 was silently truncated to 450, with no warning. If an array will ever hold decimals, convert it to float first with <code>astype(float)</code>.</p>
  <p>A third mistake is comparing decimal results with <code>==</code>. Most decimal fractions cannot be stored exactly in binary (see <a class="xref" data-note="cf_data">How Data Is Stored as Bits</a>), so tiny rounding errors appear:</p>
  <div class="fx" data-lang="py">import numpy as np
fees = np.array([0.1, 0.2]).sum()
print(fees, fees == 0.3, np.isclose(fees, 0.3))</div>
  <div class="fx" data-lang="text">0.30000000000000004 False True</div>
  <p>0.1 + 0.2 is stored as 0.30000000000000004, so <code>== 0.3</code> is False. <code>np.isclose</code> (and <code>np.allclose</code> for whole arrays) compares within a small tolerance and is the right way to test floats for equality.</p>
  <p>The fourth mistake is broadcasting that succeeds when you did not mean it to. A flat <code>(8,)</code> array minus an <code>(8, 1)</code> column does not raise an error; it builds every pair:</p>
  <div class="fx" data-lang="py">target = minutes.reshape(-1, 1)          # someone made it a column earlier
err = minutes - target                   # meant: 8 differences
print(err.shape)                         # got: an 8 x 8 table, no error
print((minutes - target.ravel()).shape)</div>
  <div class="fx" data-lang="text">(8, 8)
(8,)</div>
  <p>The intended eight differences became an 8 × 8 table of 64 numbers, and any mean or sum computed from it afterwards is silently wrong. This usually happens when one array was turned into a column earlier in the code. When a result's shape surprises you, print the shape of every input; making both flat with <code>ravel()</code> gives the intended <code>(8,)</code>.</p>
  <p>The remaining classics have already appeared on this page: changing a slice and forgetting it is a view of the original (section 05), chained assignment such as <code>a[mask][0] = x</code> that writes into a temporary copy, writing a Python loop over an array or using <code>np.vectorize</code> and expecting speed, confusing <code>*</code> with <code>@</code>, mixing up <code>axis=0</code> and <code>axis=1</code>, letting NaN spread through sums, small integer dtypes overflowing, and growing an array with <code>concatenate</code> inside a loop.</p>

  <h2 id="dn-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key terms</h3>
  <ul>
    <li><b>ndarray</b>: a fixed-size block of same-typed values plus a header (shape, dtype, strides) describing how to read it.</li>
    <li><b>Vectorisation</b>: writing whole-array operations so the loop runs in NumPy's compiled code.</li>
    <li><b>dtype</b>: the single element type (<code>int64</code>, <code>float64</code>, <code>bool</code>, <code>&lt;U6</code>). <b>Upcasting</b>: mixed inputs become one common type.</li>
    <li><b>shape</b> / <b>ndim</b> / <b>size</b>: axis lengths / number of axes / total elements. <b>strides</b>: bytes to step along each axis.</li>
    <li><b>View</b>: an array sharing another's memory (slices, <code>.T</code>, usually <code>reshape</code>). <b>Copy</b>: owns its memory (masks, fancy indexing, <code>.copy()</code>, <code>flatten</code>).</li>
    <li><b>Boolean mask</b>: a True/False array used to select. <b>Fancy indexing</b>: selecting with integer positions.</li>
    <li><b>ufunc</b>: a compiled element-wise function, with <code>.reduce</code>, <code>.accumulate</code>, <code>.outer</code>.</li>
    <li><b>Aggregation</b>: many values into one; <code>axis=k</code> removes axis k.</li>
    <li><b>Broadcasting</b>: combining different shapes by virtually stretching size-1 axes.</li>
    <li><b>Seed / Generator</b>: starting value of a pseudo-random sequence / NumPy's own random-number object.</li>
  </ul>
  <h3>Rules</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Statement</th><th>Example on the orders</th></tr>
    <tr><td>Element address</td><td>offset = i × stride₀ + j × stride₁</td><td>X[2, 0] at 2 × 16 + 0 = byte 32 → 610</td></tr>
    <tr><td>axis</td><td>the named axis disappears</td><td>(3, 2).sum(axis=0) → (2,) = [1280 1820]</td></tr>
    <tr><td>Broadcasting</td><td>align right, missing = 1; each pair equal or 1</td><td>(8,2) &amp; (2,) ok; (8,2) &amp; (8,) error; (8,1) &amp; (1,3) → (8,3)</td></tr>
    <tr><td>Reshape</td><td>product of the shape must stay the same</td><td>8 → (2, 4) ok, (3, 3) error</td></tr>
    <tr><td>Matrix product</td><td>(n, k) @ (k, m) → (n, m)</td><td>(2, 8) @ (8, 2) → (2, 2)</td></tr>
    <tr><td>Masks</td><td>sum = count, mean = proportion</td><td>Pune: 3 orders, 0.375</td></tr>
  </table>
  <h3>Which tool</h3>
  <table class="tbl">
    <tr><th>Need</th><th>Use</th><th>Returns</th></tr>
    <tr><td>a range of positions</td><td><code>a[2:5]</code>, <code>X[:, 1]</code></td><td>view</td></tr>
    <tr><td>rows meeting a condition</td><td><code>a[(c1) &amp; (c2)]</code></td><td>copy</td></tr>
    <tr><td>sort a table by a column</td><td><code>X[np.argsort(X[:, 0])]</code></td><td>copy</td></tr>
    <tr><td>top k</td><td><code>np.argpartition(a, -k)[-k:]</code></td><td>positions</td></tr>
    <tr><td>if/else per element</td><td><code>np.where(cond, a, b)</code>, <code>np.select</code></td><td>new array</td></tr>
    <tr><td>join along existing / new axis</td><td><code>np.concatenate</code> / <code>np.stack</code></td><td>new array</td></tr>
    <tr><td>solve exactly / best fit</td><td><code>np.linalg.solve</code> / <code>np.linalg.lstsq</code></td><td>solution</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import numpy as np
a = np.array([450, 220, 610])            # from a list; a.dtype, a.shape
np.zeros((2, 3)); np.arange(0, 10, 3); np.linspace(0, 1, 5); np.eye(3)
X[1:3, :]; X[:, 1]; a[::-1]              # slices: views
a[(city == "Pune") &amp; (m &gt; 30)]           # mask: copy
a[np.argsort(a)[::-1]]                   # fancy: copy
np.maximum(m - 30, 0); np.clip(m, 20, 40); np.nanmean(m)
T.sum(axis=0); T.sum(axis=1, keepdims=True)
z = (X - X.mean(axis=0)) / X.std(axis=0)  # broadcasting
a.reshape(-1, 1); a[:, None]; np.column_stack([a, b])
A @ w; np.linalg.solve(M, y); np.linalg.lstsq(D, y, rcond=None)
rng = np.random.default_rng(42); rng.integers(1, 7, 5); rng.permutation(8)
v *= 1.05; np.multiply(v, 1.05, out=out)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>A Python loop over an ndarray is slower than a loop over a list; <code>np.vectorize</code> is a loop too.</li>
    <li>One string in <code>np.array</code> turns everything into text; check <code>.dtype</code>.</li>
    <li>Slices are views: modifying them modifies the original, also inside functions.</li>
    <li><code>a[mask][0] = x</code> writes into a temporary copy; index once on the left.</li>
    <li>Use <code>&amp;</code> <code>|</code> <code>~</code> with parentheses, never <code>and</code>/<code>or</code>.</li>
    <li><code>axis=0</code> removes the rows: one result per column.</li>
    <li><code>(8,) - (8, 1)</code> silently gives <code>(8, 8)</code>.</li>
    <li><code>*</code> is element-wise, <code>@</code> is the matrix product; prefer <code>solve</code> to <code>inv</code>.</li>
    <li>NaN spreads; <code>np.nan == np.nan</code> is False; use <code>np.isnan</code>.</li>
    <li>Integer arrays truncate decimals; int16 overflows silently; float32 keeps ~7 digits.</li>
    <li>Never grow an array in a loop (O(n²)); collect then concatenate once.</li>
  </ul>

  <h2 id="dn-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why is NumPy faster than Python lists for numerical work?</summary><div class="qa-body">An ndarray stores raw values of one type in one contiguous block, so an operation runs as a compiled C loop with no per-element type checks, pointer following or object creation, and it can use the CPU cache and SIMD instructions well. A list stores pointers to separate Python objects scattered in memory. On a million amounts in this note the vectorised version was about 17 times faster and used a quarter of the memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is vectorisation?</summary><div class="qa-body">Writing a computation as operations on whole arrays, such as <code>amounts * 1.05</code> or <code>np.where(late, ...)</code>, so that the loop over elements happens inside NumPy's compiled code rather than in Python. It is faster and usually shorter. A Python loop over an array, or <code>np.vectorize</code>, is not vectorisation, because Python still handles each element.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>[450, 220] * 2</code> and <code>np.array([450, 220]) * 2</code> give?</summary><div class="qa-body">The list is repeated: <code>[450, 220, 450, 220]</code>. The array multiplies each element: <code>[900 440]</code>. A list does not know its contents are numbers, so <code>*</code> means repetition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are shape, ndim, dtype and strides?</summary><div class="qa-body">shape is the length of each axis, such as (8, 2); ndim is the number of axes; dtype is the single element type, such as int64; strides are the bytes to jump to move one step along each axis, such as (16, 8). Together they tell NumPy how to read a flat block of memory as a table, which is why a transpose can just swap strides without copying.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>np.array([450, "Pune"])</code> produce, and why does it matter?</summary><div class="qa-body">An array of strings, <code>['450' 'Pune']</code>, because an array has one dtype and NumPy upcasts to a type that can hold both. The number becomes text and maths on it fails. The same thing happens when one bad value in a numeric CSV column turns the whole column into strings, so always check dtypes after loading.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a view and a copy? Which operations return which?</summary><div class="qa-body">A view shares memory with another array, so changes through one are visible in the other; a copy has its own memory. Basic slicing, <code>.T</code>, and <code>reshape</code>/<code>ravel</code> when the layout allows return views. Boolean masks, fancy indexing, <code>flatten</code> and <code>.copy()</code> return copies. You can check with <code>np.shares_memory(a, b)</code> or <code>b.base</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is printed? <code>a = np.arange(5); b = a[1:3]; b[:] = 0; print(a)</code></summary><div class="qa-body"><code>[0 0 0 3 4]</code>. <code>b</code> is a view of positions 1 and 2 of <code>a</code>, so writing zeros through <code>b</code> writes them into <code>a</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are masks copies when slices are views?</summary><div class="qa-body">A view is just a new header (start, shape, strides) over the same memory, which only works when the selected elements are evenly spaced. A mask or a list of positions can pick any elements, which no fixed stride can describe, so NumPy has to gather them into a new block. That is also why <code>a[mask][0] = x</code> has no effect: it writes into the gathered copy. Assigning with <code>a[mask] = x</code> in one step does write into <code>a</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you filter an array with two conditions?</summary><div class="qa-body">Combine boolean masks with <code>&amp;</code> (and), <code>|</code> (or) and <code>~</code> (not), with each condition in parentheses: <code>amounts[(city == "Delhi") &amp; (minutes &gt; 30)]</code>. Python's <code>and</code> raises "truth value is ambiguous", and without parentheses <code>&amp;</code> is applied before the comparisons.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the broadcasting rules.</summary><div class="qa-body">Align the two shapes on the right and treat missing leading sizes as 1. In each position the sizes must be equal or one of them must be 1; size-1 axes are virtually stretched, without copying, and the result takes the larger size. So (8, 2) with (2,) works, (3, 2) with (3, 1) works, (8, 1) with (1, 3) gives (8, 3), and (8, 2) with (8,) fails because 2 and 8 differ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the shape of <code>np.ones((3, 1)) + np.ones(4)</code>? And of <code>np.ones((3, 2)) + np.ones(3)</code>?</summary><div class="qa-body">The first is (3, 4): (3, 1) and (4,) align as (3, 1) and (1, 4), and both 1s stretch. The second fails: the trailing sizes 2 and 3 are unequal and neither is 1. Making the second array a column, <code>np.ones(3)[:, None]</code> with shape (3, 1), fixes it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>axis=0</code> mean in <code>sum</code>? How do you standardise every column of a feature matrix?</summary><div class="qa-body"><code>axis=0</code> is the axis that gets collapsed: it sums down the rows and gives one result per column, so a (100, 5) matrix gives shape (5,). To standardise: <code>(X - X.mean(axis=0)) / X.std(axis=0)</code>; the (5,) means and standard deviations broadcast across every row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>keepdims=True</code> do and when do you need it?</summary><div class="qa-body">It keeps the aggregated axis with length 1 instead of removing it, so row totals of a (3, 2) table come back as (3, 1) instead of (3,). You need it when you divide or subtract the summary back from the original along rows: (3, 2) / (3, 1) broadcasts correctly, while (3, 2) / (3,) fails or, for square tables, silently divides the wrong way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>*</code>, <code>@</code> and <code>np.dot</code>?</summary><div class="qa-body"><code>*</code> multiplies element by element (with broadcasting). <code>@</code> is the matrix product: (n, k) @ (k, m) gives (n, m), and it treats extra leading dimensions as a batch. <code>np.dot</code> is the same as <code>@</code> for 1-D and 2-D arrays but behaves differently for higher dimensions, so <code>@</code> is preferred.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>np.linalg.solve</code> rather than <code>inv(A) @ b</code>? When would you use <code>lstsq</code>?</summary><div class="qa-body"><code>solve</code> factorises A and back-substitutes, which is less work and less rounding error than computing the full inverse; an explicit inverse amplifies errors when A is nearly singular. <code>lstsq</code> is for systems with more equations than unknowns (or a non-square A), where no exact solution exists and you want the least-squares best fit, as in linear regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>ravel()</code> vs <code>flatten()</code> vs <code>reshape(-1)</code>?</summary><div class="qa-body">All give a 1-D array. <code>flatten</code> always returns a copy. <code>ravel</code> and <code>reshape(-1)</code> return a view when the memory layout allows it (for example a C-contiguous array) and a copy otherwise (for example a transpose). Modifying the result of <code>ravel</code> may therefore change the original.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get the indices of the 3 largest values in a 10-million-element array efficiently?</summary><div class="qa-body"><code>idx = np.argpartition(a, -3)[-3:]</code> finds them in O(n) without sorting the whole array; then sort only those three with <code>idx[np.argsort(a[idx])[::-1]]</code>. A full <code>np.argsort</code> is O(n log n) and wasteful for small k.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why prefer <code>np.random.default_rng(42)</code> over <code>np.random.seed(42)</code>?</summary><div class="qa-body"><code>np.random.seed</code> seeds one global generator shared by all code, so any library that draws from it shifts your sequence and breaks reproducibility. <code>default_rng</code> returns an independent Generator object you own and can pass around, so other components cannot disturb it. It also uses a better algorithm (PCG64).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you reduce the memory of a large numeric array, and what are the risks?</summary><div class="qa-body">Use smaller dtypes: float32 instead of float64 halves memory, and int16 or int8 suit small-range integers such as minutes or category codes. The risks are silent overflow (int16 wraps past 32,767) and lost precision (float32 keeps about 7 digits), so keep money and large totals in 64-bit types. Also avoid unnecessary copies: use in-place operations and views, and copy small slices of huge arrays so the parent can be freed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does NumPy relate to pandas?</summary><div class="qa-body">A pandas column is usually a NumPy array (or an Arrow-backed array) with a name, and a DataFrame is a set of equal-length columns sharing a row index, much like the dict returned by <code>make_orders()</code>. Masks become <code>df[df["city"] == "Pune"]</code>, axis arguments work the same way, and the per-city loop we wrote becomes a single <code>groupby</code>. pandas adds labels, mixed types and missing-data handling on top of NumPy's speed.</div></details>
</main>
`
});
