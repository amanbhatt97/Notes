// notes/dataanalysis/da_pd_basics.js — Series, DataFrames & Selection
Object.assign(TOPIC_CONTENT, {
  "da_pd_basics": `<main>
<h1>Series, DataFrames &amp; Selection</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>Series, DataFrames &amp; Selection</span></div>
  <p class="lead">The first pandas note. It starts from a list of dicts, shows why a table object is needed, and builds it up one idea at a time: the Series (a column with labels), index alignment traced by hand, the DataFrame and its dtypes, reading CSV and Parquet (measured), the first look with <code>head</code>/<code>info</code>/<code>describe</code>, picking columns and rows with <code>[]</code>, <code>loc</code> and <code>iloc</code> (traced), boolean masks and <code>query</code>, why chained assignment never writes and what Copy-on-Write means, adding columns with <code>assign</code>, and why <code>apply</code> is slower than vectorised maths. The running example is the group's Biteful orders table (12 raw rows), with a generated 200,000-row version as "the same idea at scale". Run on pandas 3.0.5, Python 3.13.</p>

  <h2 id="pdb-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="pdb-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Python Collections (dicts, lists) · Files · NumPy arrays</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#pdb-ga)"/>
<line x1="320" y1="102" x2="83" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdb-ga)"/>
<line x1="320" y1="102" x2="241" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdb-ga)"/>
<line x1="320" y1="102" x2="399" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdb-ga)"/>
<line x1="320" y1="102" x2="557" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdb-ga)"/>
<line x1="158" y1="152" x2="164" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdb-ga)"/>
<line x1="316" y1="152" x2="322" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdb-ga)"/>
<line x1="474" y1="152" x2="480" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdb-ga)"/>
<rect x="200" y="62" width="240" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="400">Pandas: the map</text>
<text x="320" y="94" text-anchor="middle" class="tm" font-size="10">why each tool, in what order</text>
<rect x="8" y="132" width="150" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="83" y="149" text-anchor="middle" font-size="12" font-weight="700">Basics &amp; Selection</text>
<text x="83" y="164" text-anchor="middle" class="tg" font-size="9.5">YOU ARE HERE</text>
<rect x="166" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="241" y="149" text-anchor="middle" font-size="12" font-weight="400">Cleaning</text>
<text x="241" y="164" text-anchor="middle" class="tm" font-size="10">NaN · types · text</text>
<rect x="324" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="399" y="149" text-anchor="middle" font-size="12" font-weight="400">GroupBy &amp; Merge</text>
<text x="399" y="164" text-anchor="middle" class="tm" font-size="10">summarise · combine · reshape</text>
<rect x="482" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="557" y="149" text-anchor="middle" font-size="12" font-weight="400">Time &amp; Speed</text>
<text x="557" y="164" text-anchor="middle" class="tm" font-size="10">dates · windows · fast</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdb-ga)"/>
<rect x="40" y="210" width="560" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Visualisation · SQL joins &amp; windows · Feature Engineering · Time Series · Spark</text>
</svg><figcaption>The Pandas group. Read the map first, then left to right: each note answers a question the one before could not. Dotted arrows show the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="da_pandas">Pandas: the map</a></b><span>The map placed this note on the first two steps of the chain: "a table of mixed columns" and "pick rows and columns". Before that, <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> gave us records as dicts, <a class="xref" data-note="py_files">Files</a> gave us data as CSV text, and <a class="xref" data-note="da_numpy">NumPy</a> gave fast maths on arrays of one type. Left open: a fast table whose columns have different types and whose rows have names.</span></li>
    <li><b>This note adds: the table itself, and how to point at parts of it</b><span>Series, index, DataFrame, dtypes, file reading, inspection, selection by label, position and condition, safe assignment, new columns, and the vectorised way of computing.</span></li>
    <li><b>Leads to: <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a></b><span>By the end we can select anything, and selection itself shows that the raw table cannot be trusted: "Pune" misses " pune", the duplicate order counts twice, minutes are text. The next note fixes that.</span></li>
  </ol>

  <h2 id="pdb-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers come from the running example.</p>
  <ol class="story">
    <li><b>A list of dicts</b><span>Q: how do we hold orders in plain Python? → Three dicts and a loop: Pune revenue 240 + 520 = 760. But every new question ("Mumbai?", "above ₹400?") needs another loop…</span></li>
    <li><b>Series</b><span>Q: one column that is fast like NumPy and knows which value belongs to which row? → Values + an index of labels: <code>day2["Pizza Point"]</code> is 520, <code>day2 * 1.05</code> scales all at once. But what happens when two Series have different labels?</span></li>
    <li><b>Index alignment</b><span>Q: Monday + Tuesday revenue per restaurant? → pandas matches labels, not positions: Biryani Bros 450 + 380 = 830, the others NaN unless <code>fill_value=0</code>. One column at a time is not a table…</span></li>
    <li><b>DataFrame, dtypes, read_csv</b><span>Q: the whole export as one object? → <code>read_csv</code> gives 12 rows × 7 columns, Series sharing one index, one dtype per column (amount float64, minutes str). But 12 rows fit on screen; 200,000 do not…</span></li>
    <li><b>head / info / describe</b><span>Q: what is in a table we cannot read line by line? → <code>info</code>: 11 of 12 amounts filled, minutes stored as text; <code>describe</code>: mean amount 385.5. And CSV threw away the date type when saved and re-read…</span></li>
    <li><b>CSV vs Parquet</b><span>Q: which file format keeps types and loads fast? → Parquet: dates come back as dates, and two columns of 200,000 rows read ten or more times faster. Now: how do we ask for part of the table?</span></li>
    <li><b>[ ] for columns</b><span>Q: one column, a few columns? → <code>orders["amount"]</code> (Series), <code>orders[["customer", "amount"]]</code> (DataFrame). But <code>orders[1:3]</code> suddenly means rows. We need an unambiguous way to point at rows…</span></li>
    <li><b>loc vs iloc</b><span>Q: rows by name or by position? → <code>loc[102:104]</code> = 3 rows (labels, end included), <code>iloc[1:3]</code> = 2 rows (positions, end excluded); after sorting, <code>loc[103]</code> is still 520 but <code>iloc[0]</code> is 700. But we rarely know the labels; we know a condition…</span></li>
    <li><b>Boolean masks &amp; query</b><span>Q: "orders above ₹400"? → a True/False per row: 102, 103, 109, 111. "Pune and above ₹200" misses order 104 (" pune"). Now we can find rows; can we change them?</span></li>
    <li><b>Chained assignment &amp; Copy-on-Write</b><span>Q: set Pizza Point amounts to 0? → <code>df[mask]["amount"] = 0</code> changes nothing (it writes into a temporary copy); <code>df.loc[mask, "amount"] = 0</code> works. In pandas 3 every subset behaves as a copy. Changing values is fine; how do we add new columns cleanly?</span></li>
    <li><b>assign</b><span>Q: a new column without editing the original? → <code>assign(total=amount + 30)</code> returns a new table: 240 → 270. And a rule with an if/else, Pune fee 30, Mumbai 40?</span></li>
    <li><b>apply vs vectorised</b><span>Q: per-row logic? → <code>apply(axis=1)</code> calls Python once per row; <code>np.where</code> does it on whole columns. Same answers, a few hundred times faster on 100,000 rows. And order 104 got the Mumbai fee, because its city is " pune": the table needs cleaning (next note).</span></li>
  </ol>

  <h2 id="pdb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Series, DataFrames &amp; Selection</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Series &amp; index</div>
        <ul>
          <li><b>Series</b> = 1-D values + index labels + name + dtype</li>
          <li><code>s["label"]</code> vs <code>s.iloc[0]</code></li>
          <li><b>Alignment</b>: <code>a + b</code> matches labels; unmatched → NaN</li>
          <li><code>a.add(b, fill_value=0)</code>; NumPy adds by position</li>
          <li>💡 a column of a register with line names</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">DataFrame &amp; I/O</div>
        <ul>
          <li>Columns are Series sharing one index; one <b>dtype</b> per column</li>
          <li><code>shape</code>, <code>columns</code>, <code>index</code>, <code>dtypes</code></li>
          <li><code>read_csv(parse_dates=…, usecols=…, dtype=…)</code></li>
          <li><b>Parquet</b>: columnar, compressed, keeps types; read only needed columns</li>
          <li>⚠ CSV loses types: dates come back as text</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">First look</div>
        <ul>
          <li><code>head(n)</code>: first rows</li>
          <li><code>info()</code>: dtype + non-null count per column</li>
          <li><code>describe()</code>: count, mean, std, quartiles</li>
          <li>Biteful: 11/12 amounts; minutes are <code>str</code></li>
          <li>⚠ describe on raw data counts the duplicate</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Selection</div>
        <ul>
          <li><code>df["c"]</code> Series · <code>df[["a","b"]]</code> DataFrame · <code>df[1:3]</code> rows!</li>
          <li><b>loc</b>: labels, end included · <b>iloc</b>: positions, end excluded</li>
          <li><b>Mask</b>: <code>df[(df.a &gt; 1) &amp; (df.b == "x")]</code></li>
          <li><code>isin</code>, <code>between</code>, <code>query("a &gt; @x")</code></li>
          <li>⚠ <code>and</code>/<code>or</code> fail on columns: use <code>&amp;</code> <code>|</code> <code>~</code> + brackets</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Changing data</div>
        <ul>
          <li>✔ <code>df.loc[mask, "c"] = v</code> (one step)</li>
          <li>✘ <code>df[mask]["c"] = v</code>: chained, never writes</li>
          <li><b>Copy-on-Write</b> (pandas 3): subsets behave as copies</li>
          <li><code>assign(new=…)</code> returns a new frame; lambdas see earlier columns</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Computing</div>
        <ul>
          <li><b>Vectorised</b>: column maths, <code>np.where</code>, <code>map</code>, <code>.str</code></li>
          <li><code>apply(axis=1)</code>: Python per row, a few hundred times slower here</li>
          <li>⚠ dirty keys (" pune") give wrong rules silently</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdb-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why a Table Object?</span><span class="rm-sub">From a list of dicts</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-series"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Series: a Labelled Array</span><span class="rm-sub">Values + index</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-align"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Index Alignment</span><span class="rm-sub">Adding two Series, traced</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-df"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">DataFrame &amp; dtypes</span><span class="rm-sub">Reading the CSV</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-look"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">First Look</span><span class="rm-sub">head, info, describe</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-files"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">CSV vs Parquet</span><span class="rm-sub">Measured at 200k rows</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-brackets"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">[ ] for Columns</span><span class="rm-sub">And its one surprise</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-loc"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">loc vs iloc</span><span class="rm-sub">Labels vs positions, traced</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-mask"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Boolean Masks &amp; query</span><span class="rm-sub">Rows by condition</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-cow"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Chained Assignment &amp; CoW</span><span class="rm-sub">Why your edit vanished</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-assign"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">New Columns with assign</span><span class="rm-sub">Without touching the original</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-apply"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">apply vs Vectorised</span><span class="rm-sub">Measured</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">And how to spot them</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pdb-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pdb-why"><span class="num">01</span>Why a Table Object?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>From <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a> we can store each order as a dict and the day as a list of dicts. That holds the data. But how much work is it to <em>ask</em> something of it, and what happens when we ask ten different things?</p>
  </div>
  <h3>The running example</h3>
  <p>Biteful delivers food in Pune and Mumbai. Its app exports one row per order: <code>order_id, customer, restaurant, city, order_time, amount, delivery_minutes</code>. The full export for 2–6 March 2026 has 12 rows and is shown in section 04. To start, take just the first three orders, as plain Python:</p>
  <div class="fx" data-lang="py"># One evening of orders as plain Python: a list of dicts (see the Collections notes)
rows = [
    {"order_id": 101, "customer": "Asha", "city": "Pune",   "amount": 240},
    {"order_id": 102, "customer": "Ben",  "city": "Mumbai", "amount": 450},
    {"order_id": 103, "customer": "Chen", "city": "Pune",   "amount": 520},
]
pune_total = 0
for r in rows:                      # a loop for every question we ask
    if r["city"] == "Pune":
        pune_total += r["amount"]
print("Pune revenue:", pune_total)</div>
  <div class="fx" data-lang="text">Pune revenue: 760</div>
  <p>Correct: 240 + 520 = 760. But look at the cost. The question "Pune revenue" became five lines of loop. "Mumbai revenue", "orders above ₹400", "average per restaurant" would each be another loop, and on 200,000 orders each loop runs Python code 200,000 times.</p>
  <h3>The same rows as a DataFrame</h3>
  <div class="fx" data-lang="py">import pandas as pd
pd.set_option("display.width", 120, "display.max_columns", None)   # show every column
df3 = pd.DataFrame(rows)            # the same list of dicts becomes a table
print(df3)
print("Pune revenue:", df3.loc[df3["city"] == "Pune", "amount"].sum())</div>
  <div class="fx" data-lang="text">   order_id customer    city  amount
0       101     Asha    Pune     240
1       102      Ben  Mumbai     450
2       103     Chen    Pune     520
Pune revenue: 760</div>
  <p><code>pd.DataFrame(rows)</code> turns the list of dicts into a table: the dict keys became column names, each dict became a row, and pandas numbered the rows 0, 1, 2 on the left (the <strong>index</strong>). The question is now one line: "rows where city is Pune, column amount, sum". The first line, <code>pd.set_option(...)</code>, only tells pandas to print every column instead of hiding some behind "…"; we use it in every note.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A list of dicts is a pile of index cards, one per order: easy to write, slow to total. A DataFrame is the same information copied into a ledger with ruled columns: you can run your finger down the "amount" column and add it up at once.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>DataFrame</strong> is a two-dimensional labelled table: named columns, labelled rows (the <strong>index</strong>), and one data type per column. It can be built from a list of dicts (one dict per row), a dict of lists (one list per column), a NumPy array, or a file.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Converting to pandas and then looping over the rows anyway (<code>for i in range(len(df))</code>) throws away the benefit. The point of the table is to ask questions of whole columns.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Series.</b> The table is made of columns. What exactly is one column, and how does it know which value belongs to which row?</div>

  <h2 id="pdb-series"><span class="num">02</span>Series: a Labelled Array</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A NumPy array of amounts is fast, but <code>[240, 450, 520]</code> does not say which restaurant earned what. A dict says that, but cannot do maths on all values at once. Can one object do both?</p>
  </div>
  <p>Monday's revenue per restaurant, as a <strong>Series</strong>: the values, plus a label for each value.</p>
  <div class="fx" data-lang="py">import pandas as pd
day2 = pd.Series([240, 450, 520],
                 index=["Dosa Hut", "Biryani Bros", "Pizza Point"],
                 name="revenue")
print(day2)
print("by label   :", day2["Pizza Point"])
print("by position:", day2.iloc[0])
print("values     :", day2.to_numpy(), " index:", list(day2.index))
print(day2 * 1.05)                  # maths on every value at once, labels kept</div>
  <div class="fx" data-lang="text">Dosa Hut        240
Biryani Bros    450
Pizza Point     520
Name: revenue, dtype: int64
by label   : 520
by position: 240
values     : [240 450 520]  index: ['Dosa Hut', 'Biryani Bros', 'Pizza Point']
Dosa Hut        252.0
Biryani Bros    472.5
Pizza Point     546.0
Name: revenue, dtype: float64</div>
  <p>Reading the output line by line:</p>
  <ul>
    <li>The printout has two columns: the labels (the <strong>index</strong>) on the left and the values on the right, then the Series' <code>name</code> and <code>dtype</code> (int64, whole numbers).</li>
    <li><code>day2["Pizza Point"]</code> finds a value by its label, like a dict: 520.</li>
    <li><code>day2.iloc[0]</code> finds it by position, like a list: the first value, 240. (<code>iloc</code> means "integer location"; section 08 explains it fully.)</li>
    <li><code>to_numpy()</code> shows what is underneath: a plain NumPy array <code>[240 450 520]</code>. The labels live alongside it.</li>
    <li><code>day2 * 1.05</code> multiplies every value at once, like NumPy, and the labels come along: Dosa Hut 252.0. The dtype became float64 because the results have decimals.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>A Series is a row of labelled jars on a shelf: you can ask for "the Pizza Point jar" (label) or "the first jar" (position), and you can pour 5% more into every jar at once.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>Series</strong> is a one-dimensional array of values of one dtype, together with an <strong>index</strong> (one label per value) and an optional <strong>name</strong>. Operations on a Series run on the whole array (vectorised) and keep the labels attached to their values.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>s[0]</code> on a Series whose labels are words used to fall back to "position 0"; in pandas 3 square brackets on a Series mean <em>label</em> only, so <code>day2[0]</code> raises KeyError. Say what you mean: <code>s.iloc[0]</code> for position, <code>s.loc["Dosa Hut"]</code> or <code>s["Dosa Hut"]</code> for label.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Index Alignment.</b> Labels are nice for reading. But what do they do when we combine two Series that do not have the same labels?</div>

  <h2 id="pdb-align"><span class="num">03</span>Index Alignment: Adding Two Series, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Monday's revenue covers Dosa Hut, Biryani Bros and Pizza Point. Tuesday's covers Biryani Bros and Green Bowl. "Revenue over both days, per restaurant" means adding them. With lists we would add position 0 to position 0. Is that right here?</p>
  </div>
  <h3>By hand first</h3>
  <table class="tbl"><caption>Matching by label</caption>
    <tr><th>label</th><th>day2</th><th>day3</th><th>day2 + day3</th><th>add(fill_value=0)</th></tr>
    <tr><td>Biryani Bros</td><td>450</td><td>380</td><td>830</td><td>830</td></tr>
    <tr><td>Dosa Hut</td><td>240</td><td>(none)</td><td>NaN</td><td>240 + 0 = 240</td></tr>
    <tr><td>Green Bowl</td><td>(none)</td><td>310</td><td>NaN</td><td>0 + 310 = 310</td></tr>
    <tr><td>Pizza Point</td><td>520</td><td>(none)</td><td>NaN</td><td>520 + 0 = 520</td></tr>
  </table>
  <p>Pandas first lines the two Series up by label (the union of both label sets, sorted), then adds the pairs. Where one side has no value, the honest answer is "unknown", which pandas writes as <strong>NaN</strong> (not a number). If you know that "missing" means "zero revenue that day", say so with <code>fill_value=0</code>.</p>
  <div class="fx" data-lang="py">day3 = pd.Series([380, 310], index=["Biryani Bros", "Green Bowl"], name="revenue")
print(day2 + day3)                  # matched by LABEL, not by position
print(day2.add(day3, fill_value=0)) # treat a missing label as 0</div>
  <div class="fx" data-lang="text">Biryani Bros    830.0
Dosa Hut          NaN
Green Bowl        NaN
Pizza Point       NaN
Name: revenue, dtype: float64
Biryani Bros    830.0
Dosa Hut        240.0
Green Bowl      310.0
Pizza Point     520.0
Name: revenue, dtype: float64</div>
  <p>Exactly the hand table. Now the same arrays without labels, in NumPy:</p>
  <div class="fx" data-lang="py">import numpy as np
print(np.array([240, 450, 520])[:2] + np.array([380, 310]))   # numpy: by position</div>
  <div class="fx" data-lang="text">[620 760]</div>
  <p>NumPy adds by position: 240 + 380 = 620 adds Dosa Hut's Monday to Biryani Bros' Tuesday, which is meaningless. (We had to cut the first array to 2 values just to make the shapes match.) Alignment is the reason pandas exists alongside NumPy: values can never be paired with the wrong row by accident.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two class registers from two days. You add marks by matching roll numbers, not by matching "the 1st line of each sheet", because the sheets list different students.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Index alignment</strong>: in any operation between two Series (or DataFrames), pandas first matches values by index label, producing the union of labels; labels present on only one side give NaN unless a <code>fill_value</code> is passed to the method form (<code>add</code>, <code>sub</code>, <code>mul</code>, <code>div</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Alignment also happens when you assign a Series as a new column: <code>df["x"] = other_series</code> matches <code>other_series</code>'s labels to <code>df</code>'s index, and rows with no matching label get NaN. If you sorted or filtered one of them and expected position-by-position copying, use <code>.to_numpy()</code> on purpose.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: DataFrame &amp; dtypes.</b> We can handle one column. The export has seven columns of different kinds. How do they become one object, and how does it come from a file?</div>

  <h2 id="pdb-df"><span class="num">04</span>DataFrame Anatomy &amp; dtypes: Reading the CSV</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Real data arrives as a file (see <a class="xref" data-note="py_files">Files</a>): Biteful's app exports a CSV, text with commas. How do we turn the whole file into a table, and what does pandas decide about each column on the way in?</p>
  </div>
  <p>Here is the full export, saved as a real file and read back with <code>read_csv</code>. <code>parse_dates=["order_time"]</code> tells pandas that column holds date-times, not text:</p>
  <div class="fx" data-lang="py">from pathlib import Path
RAW = """order_id,customer,restaurant,city,order_time,amount,delivery_minutes
101,Asha,Dosa Hut,Pune,2026-03-02 12:10,240,32
102,Ben,Biryani Bros,Mumbai,2026-03-02 13:05,450,41
103,Chen,Pizza Point,Pune,2026-03-02 20:30,520,38
104,Asha,Biryani Bros, pune,2026-03-03 13:15,380,
105,Dia,Green Bowl,MUMBAI,2026-03-03 19:45,310,28 min
105,Dia,Green Bowl,MUMBAI,2026-03-03 19:45,310,28 min
106,Ben,Dosa Hut,Pune,2026-03-04 12:40,180,25
107,Esha,Pizza Point,Mumbai,2026-03-04 21:10,,45
108,Chen,Momo Magic,Pune,2026-03-05 18:20,260,240
109,Farah,Biryani Bros,Mumbai,2026-03-05 20:05,600,52
110,Asha,Green Bowl,Pune,2026-03-06 13:00,290,unknown
111,Dia,Pizza Point,Mumbai,2026-03-06 20:50,700,35
"""
Path("orders_raw.csv").write_text(RAW)          # save it as a real file on disk
orders = pd.read_csv("orders_raw.csv", parse_dates=["order_time"])
print(orders)</div>
  <div class="fx" data-lang="text">    order_id customer    restaurant    city          order_time  amount delivery_minutes
0        101     Asha      Dosa Hut    Pune 2026-03-02 12:10:00   240.0               32
1        102      Ben  Biryani Bros  Mumbai 2026-03-02 13:05:00   450.0               41
2        103     Chen   Pizza Point    Pune 2026-03-02 20:30:00   520.0               38
3        104     Asha  Biryani Bros    pune 2026-03-03 13:15:00   380.0              NaN
4        105      Dia    Green Bowl  MUMBAI 2026-03-03 19:45:00   310.0           28 min
5        105      Dia    Green Bowl  MUMBAI 2026-03-03 19:45:00   310.0           28 min
6        106      Ben      Dosa Hut    Pune 2026-03-04 12:40:00   180.0               25
7        107     Esha   Pizza Point  Mumbai 2026-03-04 21:10:00     NaN               45
8        108     Chen    Momo Magic    Pune 2026-03-05 18:20:00   260.0              240
9        109    Farah  Biryani Bros  Mumbai 2026-03-05 20:05:00   600.0               52
10       110     Asha    Green Bowl    Pune 2026-03-06 13:00:00   290.0          unknown
11       111      Dia   Pizza Point  Mumbai 2026-03-06 20:50:00   700.0               35</div>
  <p>Twelve rows, seven columns, and the mess is visible already: row 3's city is " pune" (with a space), row 4 is MUMBAI and is repeated as row 5, row 7's amount is NaN (blank in the file), row 8 has 240 minutes, row 10 says "unknown". Now the anatomy:</p>
  <div class="fx" data-lang="py">print("shape  :", orders.shape)                 # (rows, columns)
print("columns:", list(orders.columns))
print("index  :", orders.index)
print(orders.dtypes)
print(type(orders["amount"]))                   # one column = a Series</div>
  <div class="fx" data-lang="text">shape  : (12, 7)
columns: ['order_id', 'customer', 'restaurant', 'city', 'order_time', 'amount', 'delivery_minutes']
index  : RangeIndex(start=0, stop=12, step=1)
order_id                     int64
customer                       str
restaurant                     str
city                           str
order_time          datetime64[us]
amount                     float64
delivery_minutes               str
dtype: object
&lt;class 'pandas.Series'&gt;</div>
  <ul>
    <li><code>shape</code> is (rows, columns): (12, 7).</li>
    <li><code>index</code> is a <code>RangeIndex</code> 0 to 11: pandas numbered the rows because the file had no label column. Later we will make <code>order_id</code> the index.</li>
    <li><code>dtypes</code> lists one type per column. <code>int64</code>: whole numbers. <code>str</code>: text (the pandas 3 string type). <code>datetime64[us]</code>: date-times to the microsecond, thanks to <code>parse_dates</code>. <code>float64</code>: decimals.</li>
    <li>Two surprises. <code>amount</code> is float64 although every amount is whole: one blank became NaN, and NaN is a float, so the whole column became float. <code>delivery_minutes</code> is <code>str</code>: "28 min" and "unknown" are not numbers, so pandas kept the whole column as text and we cannot average it yet.</li>
    <li>Each column, taken alone, is a Series: <code>type(orders["amount"])</code>.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640">
    <rect x="10" y="34" width="50" height="104" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="14" y="26" class="tm" font-size="11">index</text>
    <text x="28" y="58" font-size="11">0</text><text x="28" y="84" font-size="11">1</text><text x="28" y="110" font-size="11">2</text><text x="26" y="132" class="tm" font-size="11">…</text>
    <rect x="60" y="34" width="90" height="104" class="fb sb"/><rect x="150" y="34" width="110" height="104" class="ft st"/><rect x="260" y="34" width="150" height="104" class="fg sg"/><rect x="410" y="34" width="80" height="104" class="fb sb"/>
    <text x="66" y="26" font-size="11">order_id</text><text x="156" y="26" font-size="11">city</text><text x="266" y="26" font-size="11">order_time</text><text x="416" y="26" font-size="11">amount</text>
    <text x="66" y="58" font-size="11">101</text><text x="156" y="58" font-size="11">Pune</text><text x="266" y="58" font-size="11">2026-03-02 12:10</text><text x="416" y="58" font-size="11">240.0</text>
    <text x="66" y="84" font-size="11">102</text><text x="156" y="84" font-size="11">Mumbai</text><text x="266" y="84" font-size="11">2026-03-02 13:05</text><text x="416" y="84" font-size="11">450.0</text>
    <text x="66" y="110" font-size="11">103</text><text x="156" y="110" font-size="11">Pune</text><text x="266" y="110" font-size="11">2026-03-02 20:30</text><text x="416" y="110" font-size="11">520.0</text>
    <text x="66" y="156" class="tm" font-size="10">int64</text><text x="156" y="156" class="tm" font-size="10">str</text><text x="266" y="156" class="tm" font-size="10">datetime64[us]</text><text x="416" y="156" class="tm" font-size="10">float64</text>
    <text x="505" y="66" font-size="11">each column</text><text x="505" y="82" font-size="11">= one Series</text><text x="505" y="98" font-size="11">= one typed array</text><text x="505" y="122" class="tm" font-size="10">all share the index</text>
  </svg><figcaption>A DataFrame is a set of Series (columns) that share one index. Each column is one array with one dtype, which is what lets pandas do maths on a whole column at NumPy speed.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school marksheet: every column is one subject and holds one kind of thing (marks are numbers, names are text, dates are dates), and the roll numbers down the side are shared by every column.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>DataFrame</strong> is a dict-like collection of Series (its columns) that share one row index and one column index. A <strong>dtype</strong> is the data type of one column; the common ones are <code>int64</code>, <code>float64</code>, <code>bool</code>, <code>str</code> (text; <code>object</code> in pandas before 3), <code>datetime64</code>, <code>timedelta64</code> and <code>category</code>. <code>read_csv</code> infers each column's dtype from its text; <code>parse_dates</code>, <code>dtype=</code> and <code>usecols=</code> let you control it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A single bad value changes a whole column's dtype: one blank makes an int column float; one "unknown" makes a number column text. Always check <code>dtypes</code> right after reading. A number column showing <code>str</code> is a cleaning job, not something to work around.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: First Look.</b> Twelve rows can be read by eye. A real export has 200,000. How do we find out what is in a table without reading it?</div>

  <h2 id="pdb-look"><span class="num">05</span>First Look: head, info, describe</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We spotted the blank amount and the text minutes by reading every row. That does not scale. Which three commands tell us the shape, the types, the gaps and the ranges of any table in seconds?</p>
  </div>
  <h3>head: what does a row look like?</h3>
  <div class="fx" data-lang="py">print(orders.head(3))</div>
  <div class="fx" data-lang="text">   order_id customer    restaurant    city          order_time  amount delivery_minutes
0       101     Asha      Dosa Hut    Pune 2026-03-02 12:10:00   240.0               32
1       102      Ben  Biryani Bros  Mumbai 2026-03-02 13:05:00   450.0               41
2       103     Chen   Pizza Point    Pune 2026-03-02 20:30:00   520.0               38</div>
  <p><code>head(3)</code> shows the first 3 rows (default 5); <code>tail</code> shows the last. Use it to see real values and spot obvious format problems.</p>
  <h3>info: types and gaps</h3>
  <div class="fx" data-lang="py">orders.info()</div>
  <div class="fx" data-lang="text">&lt;class 'pandas.DataFrame'&gt;
RangeIndex: 12 entries, 0 to 11
Data columns (total 7 columns):
 #   Column            Non-Null Count  Dtype         
---  ------            --------------  -----         
 0   order_id          12 non-null     int64         
 1   customer          12 non-null     str           
 2   restaurant        12 non-null     str           
 3   city              12 non-null     str           
 4   order_time        12 non-null     datetime64[us]
 5   amount            11 non-null     float64       
 6   delivery_minutes  11 non-null     str           
dtypes: datetime64[us](1), float64(1), int64(1), str(4)
memory usage: 1.0 KB</div>
  <p>One line per column: its position, name, how many cells are filled ("non-null") and its dtype. With 12 entries, <code>amount</code> 11 non-null means 1 blank; <code>delivery_minutes</code> 11 non-null and <code>str</code> means one blank plus text where numbers should be. The last line is the memory the table uses.</p>
  <h3>describe: the numbers at a glance</h3>
  <div class="fx" data-lang="py">print(orders.describe().round(1))</div>
  <div class="fx" data-lang="text">       order_id           order_time  amount
count      12.0                   12    11.0
mean      105.9  2026-03-04 11:02:55   385.5
min       101.0  2026-03-02 12:10:00   180.0
25%       103.8  2026-03-03 09:03:45   275.0
50%       105.5  2026-03-04 04:12:30   310.0
75%       108.2  2026-03-05 18:46:15   485.0
max       111.0  2026-03-06 20:50:00   700.0
std         3.2                  NaN   163.4</div>
  <p>For each numeric or date column: count of filled values, mean, min, the 25th/50th/75th percentiles (50% is the median) and max (the summary statistics of <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>). Check one by hand: the 11 amounts are 240, 450, 520, 380, 310, 310, 180, 260, 600, 290, 700; their sum is 4240 and 4240 / 11 = 385.5. Notice that 310 appears twice, because the duplicate order is still in the table, and that <code>describe</code> silently skipped <code>delivery_minutes</code> because it is text. The <code>order_id</code> statistics are meaningless (an id is a label, not a quantity).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A doctor's first check: look at the patient (head), read the chart of vital signs (info), take the measurements (describe). You do not operate before doing all three.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>head(n)</code>/<code>tail(n)</code>: first/last n rows. <code>info()</code>: index type, columns, non-null counts, dtypes, memory. <code>describe()</code>: count, mean, std, min, quartiles, max of numeric (and date) columns; <code>describe(include="all")</code> adds counts, unique values and the most frequent value for text columns.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Numbers from <code>describe</code> on raw data include duplicates and exclude blanks and text columns. The mean 385.5 is not Biteful's real average order (that is 393.0 after cleaning). Inspect to find problems, not to report results.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: CSV vs Parquet.</b> When we save this table and read it back, does it come back the same? And does the file format matter at 200,000 rows?</div>

  <h2 id="pdb-files"><span class="num">06</span>CSV vs Parquet: Measured</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We told <code>read_csv</code> that <code>order_time</code> is a date. A CSV file cannot store that fact: it is just text. What happens on the next read, and is there a format that remembers types and reads faster?</p>
  </div>
  <div class="fx" data-lang="py">orders.to_csv("orders.csv", index=False)
orders.to_parquet("orders.parquet")             # needs pyarrow installed
back_csv = pd.read_csv("orders.csv")
back_pq = pd.read_parquet("orders.parquet")
print("from CSV    :", back_csv["order_time"].dtype)
print("from Parquet:", back_pq["order_time"].dtype)</div>
  <div class="fx" data-lang="text">from CSV    : str
from Parquet: datetime64[us]</div>
  <p>Saved as CSV and read back without <code>parse_dates</code>, <code>order_time</code> is text again: CSV kept the characters but lost the type. <strong>Parquet</strong> stores the schema (each column's name and type) inside the file, so it comes back as <code>datetime64</code>. (Parquet needs the <code>pyarrow</code> package installed.)</p>
  <h3>The same idea at scale</h3>
  <p>To measure, we need a bigger version of the same table. This generator makes n orders with the same seven columns (random customers, five restaurants, two cities, 90 days of times, gamma-distributed amounts). The other notes reuse it.</p>
  <div class="fx" data-lang="py">def make_orders(n, seed=0):
    """The same shape of table as our 12 rows, but n rows (the idea at scale)."""
    rng = np.random.default_rng(seed)
    rest = np.array(["Dosa Hut", "Biryani Bros", "Pizza Point", "Green Bowl", "Momo Magic"])
    return pd.DataFrame({
        "order_id": np.arange(1, n + 1),
        "customer": rng.integers(1, 20_001, n).astype(str),
        "restaurant": rest[rng.integers(0, 5, n)],
        "city": np.where(rng.random(n) &lt; 0.55, "Pune", "Mumbai"),
        "order_time": pd.Timestamp("2026-01-01") + pd.to_timedelta(rng.integers(0, 90 * 24 * 60, n), unit="min"),
        "amount": rng.gamma(4, 100, n).round(0),
        "delivery_minutes": rng.normal(35, 8, n).round(0),
    })
big = make_orders(200_000)
print(big.shape)
print(big.head(3))</div>
  <div class="fx" data-lang="text">(200000, 7)
   order_id customer    restaurant    city          order_time  amount  delivery_minutes
0         1    17013  Biryani Bros    Pune 2026-01-09 08:57:00   120.0              20.0
1         2    12740    Green Bowl    Pune 2026-02-08 21:14:00   330.0              36.0
2         3    10223    Green Bowl  Mumbai 2026-01-14 09:21:00   600.0              34.0</div>
  <div class="fx" data-lang="py">import os, time
big.to_csv("big.csv", index=False); big.to_parquet("big.parquet")
def ms(f, reps=3):
    best = 1e9
    for _ in range(reps):
        t = time.perf_counter(); f(); best = min(best, time.perf_counter() - t)
    return round(best * 1000)
print("size MB   csv", round(os.path.getsize("big.csv") / 1e6, 1),
      " parquet", round(os.path.getsize("big.parquet") / 1e6, 1))
print("read all  csv", ms(lambda: pd.read_csv("big.csv", parse_dates=["order_time"])), "ms",
      " parquet", ms(lambda: pd.read_parquet("big.parquet")), "ms")
print("2 columns csv", ms(lambda: pd.read_csv("big.csv", usecols=["city", "amount"])), "ms",
      " parquet", ms(lambda: pd.read_parquet("big.parquet", columns=["city", "amount"])), "ms")</div>
  <div class="fx" data-lang="text">size MB   csv 12.0  parquet 3.2
read all  csv 196 ms  parquet 21 ms
2 columns csv 82 ms  parquet 7 ms</div>
  <p>Timing code: <code>ms</code> runs a function a few times and keeps the fastest run in milliseconds (exact numbers vary by machine; the ratios are what matter; measured single-threaded). The Parquet file is several times smaller (compressed, column by column), reading everything is several times faster (no text to parse), and reading 2 of 7 columns is ten or more times faster, because Parquet stores each column separately and reads only those, while CSV must scan every character of every line.</p>
  <table class="tbl"><caption>Which file format?</caption>
    <tr><th>Format</th><th>Keeps dtypes</th><th>Read some columns</th><th>Human-readable</th><th>Use for</th></tr>
    <tr><td>CSV</td><td>no (dates → text)</td><td>must parse all</td><td>yes</td><td>exchange with anyone, small files</td></tr>
    <tr><td>Parquet</td><td>yes (schema stored)</td><td>reads only those columns</td><td>no</td><td>analysis, storage, data lakes, Spark</td></tr>
    <tr><td>Excel</td><td>partly</td><td>slow</td><td>yes</td><td>people; <code>read_excel</code> needs openpyxl</td></tr>
    <tr><td>JSON</td><td>partly</td><td>must parse all</td><td>yes</td><td>APIs, nested records (<code>read_json</code>, <code>json_normalize</code>)</td></tr>
  </table>
  <p>Useful <code>read_csv</code> options for big files: <code>usecols=[…]</code> (load only some columns), <code>dtype={…}</code> (set types instead of letting pandas guess), <code>chunksize=100_000</code> (read in pieces when the file does not fit in memory).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A CSV is a register written as one long paragraph: to find the amounts you must read every line. Parquet is a register with each column on its own sheet, labelled with what it holds: to read amounts you pick up one sheet.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Parquet</strong> is a binary, <strong>columnar</strong> (stored column by column), compressed file format that stores a schema with the data. <code>df.to_parquet(path)</code> / <code>pd.read_parquet(path, columns=[…])</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Round-tripping through CSV silently changes types: dates become text, <code>category</code> becomes text, ids with leading zeros ("007") become numbers (7). If you must use CSV, re-apply <code>parse_dates</code> and <code>dtype</code> on every read.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: [ ] for Columns.</b> The table is loaded and understood. Now: how do we ask for just part of it?</div>

  <h2 id="pdb-brackets"><span class="num">07</span>[ ] for Columns, and Its One Surprise</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Most questions need only a few columns ("who ordered, and how much?"). What is the shortest way to pick columns, and what comes back?</p>
  </div>
  <div class="fx" data-lang="py">print(orders["amount"].head(3))                 # one name  -&gt; Series
print(orders[["customer", "amount"]].head(3))   # a list    -&gt; DataFrame</div>
  <div class="fx" data-lang="text">0    240.0
1    450.0
2    520.0
Name: amount, dtype: float64
  customer  amount
0     Asha   240.0
1      Ben   450.0
2     Chen   520.0</div>
  <p>One column name in brackets returns that column as a <strong>Series</strong> (one-dimensional, with a name). A <em>list</em> of names (note the double brackets: outer for "select", inner for the Python list) returns a smaller <strong>DataFrame</strong>. Attribute access <code>orders.amount</code> also works for simple names, but not for names with spaces or names that clash with methods (<code>orders.size</code> is the number of cells, not a column), so this note uses brackets.</p>
  <div class="fx" data-lang="py">print(orders[1:3])                              # a slice inside [] means ROWS (by position)</div>
  <div class="fx" data-lang="text">   order_id customer    restaurant    city          order_time  amount delivery_minutes
1       102      Ben  Biryani Bros  Mumbai 2026-03-02 13:05:00   450.0               41
2       103     Chen   Pizza Point    Pune 2026-03-02 20:30:00   520.0               38</div>
  <p>The surprise: a <em>slice</em> inside plain brackets selects <strong>rows</strong> by position, not columns. <code>orders[1:3]</code> gives rows 1 and 2. This double meaning of <code>[]</code> (column names or row slices or, as we will see, masks) is why pandas also has two explicit selectors.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Asking a librarian for "History" gets you that shelf; asking for "History and Maths" gets you a trolley with two shelves on it. Asking for "1 to 3" gets you rows of books, not shelves, which is confusing; hence the explicit forms next.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>df["c"]</code> → Series; <code>df[["a", "b"]]</code> → DataFrame with those columns in that order; <code>df[i:j]</code> → rows i to j−1 by position; <code>df[bool_series]</code> → rows where True (section 09).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>df["a", "b"]</code> (single brackets, two names) looks for one column literally named <code>("a", "b")</code> and raises KeyError. Two columns need a list: <code>df[["a", "b"]]</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: loc vs iloc.</b> Rows deserve an unambiguous selector. Should we point at a row by its name (label) or by where it sits (position)?</div>

  <h2 id="pdb-loc"><span class="num">08</span>loc vs iloc, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Show me order 103" is a question about a label. "Show me the top row" is a question about a position. In a fresh table labels 0, 1, 2 equal positions 0, 1, 2, so the difference is invisible. When does it matter, and which tool asks which question?</p>
  </div>
  <p>First, make the index meaningful: drop the duplicate row (so each order id appears once; the Cleaning note explains this properly) and use <code>order_id</code> as the index. Then ask the same thing two ways:</p>
  <div class="fx" data-lang="py">o = orders.drop_duplicates().set_index("order_id")   # labels = order ids (duplicate dropped first)
print(o.loc[103, "customer"], "|", o.iloc[2]["customer"])
print(o.loc[102:104, ["customer", "amount"]])     # labels 102..104, end INCLUDED
print(o.iloc[1:3, [0, 4]])                        # positions 1, 2, end EXCLUDED</div>
  <div class="fx" data-lang="text">Chen | Chen
         customer  amount
order_id                 
102           Ben   450.0
103          Chen   520.0
104          Asha   380.0
         customer  amount
order_id                 
102           Ben   450.0
103          Chen   520.0</div>
  <table class="tbl"><caption>Tracing the two slices</caption>
    <tr><th>position</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>…</th></tr>
    <tr><td>label (order_id)</td><td>101</td><td>102</td><td>103</td><td>104</td><td>105</td><td>…</td></tr>
    <tr><td><code>loc[102:104]</code></td><td></td><td>✔</td><td>✔</td><td>✔ (end included)</td><td></td><td></td></tr>
    <tr><td><code>iloc[1:3]</code></td><td></td><td>✔</td><td>✔</td><td>✘ (end excluded)</td><td></td><td></td></tr>
  </table>
  <ul>
    <li><code>o.loc[103, "customer"]</code>: row <em>labelled</em> 103, column named customer → Chen. <code>o.iloc[2]</code>: the row at <em>position</em> 2 (the third) → also Chen, because nothing has moved yet.</li>
    <li><code>loc[102:104, [...]]</code> slices by label and <strong>includes</strong> the end label: 102, 103, 104 (3 rows). Labels have no "one past the end", so inclusive is the only sensible rule.</li>
    <li><code>iloc[1:3, [0, 4]]</code> slices by position like a Python list, <strong>excluding</strong> the end: positions 1 and 2 (2 rows); columns at positions 0 and 4 (customer and amount, since order_id is now the index).</li>
  </ul>
  <h3>When labels and positions part ways</h3>
  <div class="fx" data-lang="py">s = o.sort_values("amount", ascending=False)
print(s[["customer", "amount"]].head(3))
print("loc[103] -&gt;", s.loc[103, "amount"], "  iloc[0] -&gt;", s.iloc[0]["amount"])</div>
  <div class="fx" data-lang="text">         customer  amount
order_id                 
111           Dia   700.0
109         Farah   600.0
103          Chen   520.0
loc[103] -&gt; 520.0   iloc[0] -&gt; 700.0</div>
  <p>After sorting by amount, the most expensive order (111) sits at position 0. <code>loc[103]</code> still finds order 103 (520), wherever it moved; <code>iloc[0]</code> now gives order 111's 700. Filtering has the same effect: labels stay with their rows, positions are recounted.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>In a train, <code>loc</code> is the seat number printed on your ticket; <code>iloc</code> is "the third seat from the door". If passengers change coaches the printed numbers stay with the seats, but "third from the door" now points somewhere else.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>df.loc[rows, cols]</code> selects by <strong>label</strong>: single labels, lists of labels, label slices (end included) or boolean masks. <code>df.iloc[rows, cols]</code> selects by integer <strong>position</strong>: single positions, lists, slices (end excluded). Both take a row part and an optional column part separated by a comma.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>On the default RangeIndex <code>df.loc[0:2]</code> returns 3 rows and <code>df.iloc[0:2]</code> returns 2. Code that "worked" on a fresh table breaks after a sort or filter if it used the wrong one. Decide: do I mean <em>this order</em> (loc) or <em>the n-th row</em> (iloc)?</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Boolean Masks.</b> We rarely know which labels we want. We know a condition: "orders above ₹400", "Pune orders". How do we select by condition?</div>

  <h2 id="pdb-mask"><span class="num">09</span>Boolean Masks &amp; query</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Which orders were above ₹400?" names no label and no position. It is a test applied to every row. How do we turn a test into a selection?</p>
  </div>
  <h3>A mask, traced</h3>
  <div class="fx" data-lang="py">mask = o["amount"] &gt; 400
print(mask.tolist())
print(o[mask][["customer", "city", "amount"]])</div>
  <div class="fx" data-lang="text">[False, True, True, False, False, False, False, False, True, False, True]
         customer    city  amount
order_id                         
102           Ben  Mumbai   450.0
103          Chen    Pune   520.0
109         Farah  Mumbai   600.0
111           Dia  Mumbai   700.0</div>
  <p><code>o["amount"] &gt; 400</code> compares every amount with 400 at once and returns a Series of True/False with the same index: the <strong>mask</strong>. By hand on the 11 amounts 240, 450, 520, 380, 310, 180, NaN, 260, 600, 290, 700: False, True, True, False, False, False, <strong>False</strong> (NaN &gt; 400 is False: unknown is never "greater"), False, True, False, True. Putting the mask in brackets keeps the True rows: 102, 103, 109, 111.</p>
  <h3>Two conditions</h3>
  <div class="fx" data-lang="py">print(o[(o["amount"] &gt; 200) &amp; (o["city"] == "Pune")][["customer", "city", "amount"]])</div>
  <div class="fx" data-lang="text">         customer  city  amount
order_id                       
101          Asha  Pune   240.0
103          Chen  Pune   520.0
108          Chen  Pune   260.0
110          Asha  Pune   290.0</div>
  <p>Combine masks with <code>&amp;</code> (and), <code>|</code> (or), <code>~</code> (not), and put each comparison in parentheses (Python's operator precedence would otherwise read <code>200 &amp; o["city"]</code> first). Pune orders above ₹200: 101, 103, 108, 110. Order 104 is a Pune order of ₹380 and is <strong>missing</strong>: its city is " pune", which is not equal to "Pune". The selection was correct; the data is not.</p>
  <h3>isin, between, query</h3>
  <div class="fx" data-lang="py">print(o[o["restaurant"].isin(["Dosa Hut", "Green Bowl"])].index.tolist())
print(o[o["amount"].between(250, 400)].index.tolist())</div>
  <div class="fx" data-lang="text">[101, 105, 106, 110]
[104, 105, 108, 110]</div>
  <p><code>isin([...])</code>: is the value one of these? (Dosa Hut or Green Bowl → 101, 105, 106, 110.) <code>between(250, 400)</code>: inclusive range → 104 (380), 105 (310), 108 (260), 110 (290).</p>
  <div class="fx" data-lang="py">limit = 400
print(o.query("amount &gt; @limit and restaurant == 'Pizza Point'")[["customer", "amount"]])</div>
  <div class="fx" data-lang="text">         customer  amount
order_id                 
103          Chen   520.0
111           Dia   700.0</div>
  <p><code>query</code> takes the condition as a string, reads column names directly, uses <code>and</code>/<code>or</code>, and refers to Python variables with <code>@</code>. Shorter for long filters; the bracket form is easier to build programmatically.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A mask is a stencil laid over the register: holes where the condition is true. Whatever shows through the holes is your selection.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>boolean mask</strong> is a Series of True/False aligned to the table's index. <code>df[mask]</code> or <code>df.loc[mask, cols]</code> keeps rows where it is True. <code>df.query("expr")</code> evaluates a string condition over columns; <code>@name</code> inserts a Python variable.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>o[o.amount &gt; 200 and o.city == "Pune"]</code> raises "The truth value of a Series is ambiguous": Python's <code>and</code> wants one True/False, not a column of them. Use <code>&amp;</code> with parentheses. And a mask is only as good as the data: dirty text silently drops rows.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Chained Assignment &amp; Copy-on-Write.</b> We can find any rows. Now we want to <em>change</em> some of them. Why does the obvious way silently do nothing?</div>

  <h2 id="pdb-cow"><span class="num">10</span>Chained Assignment &amp; Copy-on-Write</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Suppose Pizza Point's amounts must be set to 0 for a refund report. The line <code>df[mask]["amount"] = 0</code> reads naturally. Does it change <code>df</code>? And if we save a filtered subset in a variable and edit it, does the original change too?</p>
  </div>
  <p>We work on a copy <code>o2</code> so the running example stays intact:</p>
  <div class="fx" data-lang="py">import warnings
o2 = o.copy()
o2[o2["restaurant"] == "Pizza Point"]["amount"] = 0      # chained: two steps
print("after chained:", o2.loc[[103, 107, 111], "amount"].tolist())
o2.loc[o2["restaurant"] == "Pizza Point", "amount"] = 0  # one step on o2
print("after loc    :", o2.loc[[103, 107, 111], "amount"].tolist())</div>
  <div class="fx" data-lang="text">ChainedAssignmentError: A value is being set on a copy of a DataFrame or Series through chained assignment.
Such chained assignment never works to update the original DataFrame or Series, because the intermediate object on which we are setting values always behaves as a copy (due to Copy-on-Write).

Try using '.loc[row_indexer, col_indexer] = value' instead, to perform the assignment in a single step.

See the documentation for a more detailed explanation: https://pandas.pydata.org/pandas-docs/stable/user_guide/copy_on_write.html#chained-assignment
after chained: [520.0, nan, 700.0]
after loc    : [0.0, 0.0, 0.0]</div>
  <p>The chained line printed a <code>ChainedAssignmentError</code> warning and changed nothing: Pizza Point's amounts are still 520, NaN, 700. Why: <code>o2[mask]</code> is one operation that creates a <em>new temporary table</em> of Pizza Point rows; <code>["amount"] = 0</code> is a second operation that writes into that temporary table, which is then thrown away. The <code>.loc[mask, "amount"] = 0</code> line is <em>one</em> operation on <code>o2</code> itself, so it works.</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <defs><marker id="pdb-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="90" height="34" class="fb sb"/><text x="40" y="42" font-size="12">o2</text>
    <path d="M100 37 L170 37" stroke="currentColor" marker-end="url(#pdb-ar3)"/><text x="104" y="30" class="tm" font-size="10">[mask]</text>
    <rect x="172" y="20" width="140" height="34" class="fr sr"/><text x="180" y="42" font-size="12">temporary copy</text>
    <path d="M312 37 L380 37" stroke="currentColor" marker-end="url(#pdb-ar3)"/><text x="316" y="30" class="tm" font-size="10">["amount"]=0</text>
    <text x="386" y="42" font-size="12">edits the copy, then it is discarded</text>
    <rect x="10" y="66" width="90" height="34" class="fg sg"/><text x="40" y="88" font-size="12">o2</text>
    <path d="M100 83 L170 83" stroke="currentColor" marker-end="url(#pdb-ar3)"/><text x="178" y="88" font-size="12">.loc[mask, "amount"] = 0 → one step, edits o2</text>
  </svg><figcaption>Two brackets in a row are two operations; the write lands on the intermediate object. One <code>.loc</code> call is one operation on the real table.</figcaption></figure>
  <h3>A subset in its own variable</h3>
  <div class="fx" data-lang="py">pp = o[o["restaurant"] == "Pizza Point"]   # a subset in its own variable
pp["amount"] = 999                          # edit the subset
print("subset  :", pp["amount"].tolist())
print("original:", o.loc[[103, 107, 111], "amount"].tolist())
print("pandas", pd.__version__)</div>
  <div class="fx" data-lang="text">subset  : [999, 999, 999]
original: [520.0, nan, 700.0]
pandas 3.0.5</div>
  <p>Editing <code>pp</code> (the Pizza Point subset) changed only <code>pp</code>; the original <code>o</code> still has 520, NaN, 700. This is <strong>Copy-on-Write</strong> (CoW): in pandas 3, any table derived from another (a selection, a filter, a column) <em>behaves</em> as an independent copy. Pandas does not actually copy the data until one of them is written to (that is the "on write"), so subsets stay cheap. The installed version printed above is 3.0.5, where CoW is always on and cannot be switched off.</p>
  <h3>What older pandas did (not run here)</h3>
  <p>We can only run pandas 3.0.5 in this environment, so the following is described from the pandas documentation rather than executed. Before pandas 3 (and in 2.x without the CoW option), a subset was sometimes a <em>view</em> sharing memory with the parent and sometimes a copy, depending on how it was made. Writing into it raised <code>SettingWithCopyWarning</code> ("A value is trying to be set on a copy of a slice from a DataFrame"), and the parent might or might not change. The standard advice was to write <code>.loc</code> in one step on the original, or call <code>.copy()</code> on a subset you intend to modify. Both still work in pandas 3; the defensive <code>.copy()</code> is simply no longer needed.</p>
  <table class="tbl">
    <tr><th></th><th>pandas &lt; 3 (no CoW)</th><th>pandas 3 (CoW always on)</th></tr>
    <tr><td><code>df[mask]["c"] = v</code></td><td>SettingWithCopyWarning; usually no effect</td><td>ChainedAssignmentError warning; never has an effect</td></tr>
    <tr><td><code>sub = df[mask]; sub["c"] = v</code></td><td>warning; parent may or may not change</td><td>only <code>sub</code> changes; no warning</td></tr>
    <tr><td><code>df.loc[mask, "c"] = v</code></td><td>works</td><td>works</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Chained assignment is photocopying the Pizza Point page of the register, correcting the photocopy, and throwing it in the bin. Copy-on-Write is a library that lends you "your own copy" of a book, but only actually prints one the moment you start writing in it.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Chained assignment</strong>: assigning through two consecutive indexing operations (<code>df[a][b] = v</code>); it writes into an intermediate object. <strong>Copy-on-Write</strong>: every derived DataFrame or Series behaves as a copy of its parent; the actual copy is made lazily at the first write.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Interviewers still ask about <code>SettingWithCopyWarning</code>. Answer: "use <code>df.loc[rows, col] = value</code> in one step, or <code>.copy()</code> the subset; in pandas 3 Copy-on-Write makes subsets behave as copies and chained assignment never writes".</p></div>
  <div class="bridge"><b>What this still can't tell us → next: assign.</b> Changing values in place works with <code>.loc</code>. Often we want something different: a <em>new</em> column computed from others, without modifying the table we started from.</div>

  <h2 id="pdb-assign"><span class="num">11</span>New Columns with assign</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful adds a ₹30 delivery fee. We want <code>total = amount + 30</code> and a flag "big order" for totals above ₹400. <code>o["total"] = …</code> works but edits <code>o</code> in place. Is there a way that leaves <code>o</code> untouched and can be part of a step-by-step pipeline?</p>
  </div>
  <div class="fx" data-lang="py">fee = 30
o3 = o.assign(total=o["amount"] + fee,
              big_order=lambda d: d["total"] &gt; 400)
print(o3[["amount", "total", "big_order"]].head(4))</div>
  <div class="fx" data-lang="text">          amount  total  big_order
order_id                          
101        240.0  270.0      False
102        450.0  480.0       True
103        520.0  550.0       True
104        380.0  410.0       True</div>
  <p><code>assign</code> returns a <strong>new</strong> DataFrame with the extra columns; <code>o</code> itself is unchanged. Each keyword becomes a column. A plain expression (<code>o["amount"] + fee</code>) is computed once; a <code>lambda d: …</code> receives the table being built, so <code>big_order</code> can use <code>total</code>, created one line earlier. By hand: 240 + 30 = 270 (not big), 450 + 30 = 480 (big), 380 + 30 = 410 (big, just). Because it returns a new table, <code>assign</code> fits in method chains (<a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>df["x"] = …</code> writes in pen on the original register. <code>assign</code> photocopies the register and writes the new column on the photocopy, so the original stays clean for the next question.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>df.assign(name=value_or_function, …)</code> returns a new DataFrame with columns added or replaced. A callable receives the DataFrame (including columns assigned earlier in the same call) and must return a column.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting to keep the result: <code>o.assign(total=…)</code> on its own line does nothing visible to <code>o</code>. Write <code>o3 = o.assign(...)</code> or chain the next step onto it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: apply vs Vectorised.</b> A flat fee is easy. A rule with an if/else (₹30 in Pune, ₹40 in Mumbai) tempts us to write a Python function per row. Is that a good idea?</div>

  <h2 id="pdb-apply"><span class="num">12</span>apply vs Vectorised</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The fee depends on the city. The obvious solution is a Python function that looks at one row and returns its total, run on every row with <code>apply</code>. It works. What does it cost, and what is the alternative?</p>
  </div>
  <div class="fx" data-lang="py">def with_fee(row):
    return row["amount"] + 30 if row["city"] == "Pune" else row["amount"] + 40
slow = o.apply(with_fee, axis=1)                              # Python function, row by row
fast = o["amount"] + np.where(o["city"] == "Pune", 30, 40)    # whole columns at once
print(pd.DataFrame({"city": o["city"], "amount": o["amount"], "apply": slow, "vectorised": fast}).head(5))</div>
  <div class="fx" data-lang="text">            city  amount  apply  vectorised
order_id                                   
101         Pune   240.0  270.0       270.0
102       Mumbai   450.0  490.0       490.0
103         Pune   520.0  550.0       550.0
104         pune   380.0  420.0       420.0
105       MUMBAI   310.0  350.0       350.0</div>
  <p><code>apply(with_fee, axis=1)</code> calls the Python function once per row (<code>axis=1</code> means "row by row"), building a small Series for each row. The vectorised line does the same logic on whole columns: <code>np.where(condition, 30, 40)</code> builds the fee column in one step, and <code>+</code> adds it to all amounts at once. Same results. Look at order 104: city " pune" is not equal to "Pune", so <em>both</em> methods charged it the Mumbai fee (420 instead of 410). Speed cannot fix dirty data.</p>
  <h3>The same idea at scale</h3>
  <div class="fx" data-lang="py">b = big.head(100_000)
t1 = ms(lambda: b.apply(lambda r: r["amount"] + (30 if r["city"] == "Pune" else 40), axis=1), reps=1)
t2 = ms(lambda: b["amount"] + np.where(b["city"] == "Pune", 30, 40))
print("apply(axis=1):", t1, "ms   vectorised:", t2, "ms   -&gt;", round(t1 / max(t2, 1)), "x")</div>
  <div class="fx" data-lang="text">apply(axis=1): 538 ms   vectorised: 2 ms   -&gt; 269 x</div>
  <p>On 100,000 generated orders the row-by-row <code>apply</code> takes hundreds of milliseconds; the vectorised version takes a few. The gap grows with the number of rows, and with the complexity of the function. <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a> measures <code>iterrows</code>, <code>itertuples</code>, <code>apply</code> and vectorised side by side.</p>
  <table class="tbl"><caption>Vectorised replacements for common per-row logic</caption>
    <tr><th>Need</th><th>Vectorised tool</th></tr>
    <tr><td>Maths between columns</td><td><code>df["a"] * df["b"]</code></td></tr>
    <tr><td>If / else</td><td><code>np.where(cond, x, y)</code>; many branches: <code>np.select([c1, c2], [x1, x2], default=z)</code></td></tr>
    <tr><td>Look up a value per category</td><td><code>df["city"].map({"Pune": 30, "Mumbai": 40})</code></td></tr>
    <tr><td>Text operations</td><td><code>df["city"].str.strip().str.title()</code> (Cleaning note)</td></tr>
    <tr><td>Numbers into buckets</td><td><code>pd.cut(df["amount"], bins=[…], labels=[…])</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>apply</code> is a cashier adding a fee to each bill by hand, one customer at a time. Vectorised is a till that adds the right fee to the whole queue's bills in one press.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Vectorised</strong> code expresses an operation on whole columns, so the loop runs in compiled C code inside NumPy/pandas. <code>Series.apply(f)</code> calls <code>f</code> per value; <code>DataFrame.apply(f, axis=1)</code> calls <code>f</code> per row (as a Series); both run Python for every element.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>apply</code> looks "pandas-like" but is a Python loop in disguise. Use it only when no vectorised form exists (a complex function from another library, say), and then on as few rows as possible.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects</b>, and then the next note, <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a>. We can now hold, inspect, select, change and compute. Every section also showed the same problem: " pune" escapes the Pune filter and gets the wrong fee, the duplicate inflates <code>describe</code>, minutes cannot be averaged. Before any real answer, the table must be cleaned.</div>

  <h2 id="pdb-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Series, index, DataFrame, dtypes, files, inspection, three selectors, assignment rules, assign, apply. Which is built from which, and which answers which question?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<defs><marker id="pdb-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="10" width="170" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="105" y="28" text-anchor="middle" font-size="11.5" font-weight="700">NumPy array</text><text x="105" y="43" text-anchor="middle" class="tm" font-size="10">fast, one type, positions</text>
<rect x="245" y="10" width="170" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="28" text-anchor="middle" font-size="11.5" font-weight="700">index (labels)</text><text x="330" y="43" text-anchor="middle" class="tm" font-size="10">names for rows</text>
<rect x="470" y="10" width="170" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="555" y="28" text-anchor="middle" font-size="11.5" font-weight="700">file (CSV / Parquet)</text><text x="555" y="43" text-anchor="middle" class="tm" font-size="10">where data comes from</text>
<line x1="105" y1="50" x2="200" y2="78" stroke="currentColor" marker-end="url(#pdb-a9)"/><line x1="330" y1="50" x2="250" y2="78" stroke="currentColor" marker-end="url(#pdb-a9)"/>
<rect x="140" y="80" width="170" height="40" rx="7" class="fb sb"/><text x="225" y="98" text-anchor="middle" font-size="11.5" font-weight="700">Series</text><text x="225" y="113" text-anchor="middle" class="tm" font-size="10">array + index → alignment</text>
<line x1="310" y1="100" x2="378" y2="100" stroke="currentColor" marker-end="url(#pdb-a9)"/><line x1="555" y1="50" x2="470" y2="78" stroke="currentColor" marker-end="url(#pdb-a9)"/>
<rect x="380" y="80" width="190" height="40" rx="7" class="fb sb"/><text x="475" y="98" text-anchor="middle" font-size="11.5" font-weight="700">DataFrame</text><text x="475" y="113" text-anchor="middle" class="tm" font-size="10">Series sharing an index · dtypes</text>
<line x1="420" y1="120" x2="120" y2="152" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#pdb-a9)"/><line x1="450" y1="120" x2="330" y2="152" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#pdb-a9)"/><line x1="500" y1="120" x2="540" y2="152" stroke="currentColor" stroke-opacity="0.6" marker-end="url(#pdb-a9)"/>
<rect x="30" y="154" width="180" height="40" rx="7" class="ft st"/><text x="120" y="172" text-anchor="middle" font-size="11.5" font-weight="700">inspect</text><text x="120" y="187" text-anchor="middle" class="tm" font-size="10">head · info · describe</text>
<rect x="240" y="154" width="180" height="40" rx="7" class="ft st"/><text x="330" y="172" text-anchor="middle" font-size="11.5" font-weight="700">select</text><text x="330" y="187" text-anchor="middle" class="tm" font-size="10">[] · loc · iloc · mask · query</text>
<rect x="450" y="154" width="180" height="40" rx="7" class="ft st"/><text x="540" y="172" text-anchor="middle" font-size="11.5" font-weight="700">compute</text><text x="540" y="187" text-anchor="middle" class="tm" font-size="10">assign · vectorised · (apply)</text>
<line x1="330" y1="194" x2="330" y2="214" stroke="currentColor" marker-end="url(#pdb-a9)"/>
<rect x="210" y="216" width="240" height="40" rx="7" class="fg sg"/><text x="330" y="234" text-anchor="middle" font-size="11.5" font-weight="700">change safely</text><text x="330" y="249" text-anchor="middle" class="tm" font-size="10">.loc[mask, col] = v · Copy-on-Write</text>
</svg><figcaption>A Series is a NumPy array plus an index; a DataFrame is Series sharing an index, usually read from a file. Everything else in this note works on that object: inspecting it, selecting parts of it (by label, position or condition), computing new columns, and changing values safely.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the Biteful orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Series</td><td>array + index</td><td>labelled, fast column?</td><td>day2["Pizza Point"] = 520</td><td>any single column</td></tr>
    <tr><td>Alignment</td><td>index labels</td><td>combine by meaning?</td><td>Biryani Bros 450 + 380 = 830; others NaN / fill 0</td><td>every Series operation</td></tr>
    <tr><td>DataFrame + dtypes</td><td>Series sharing an index</td><td>whole table?</td><td>12 × 7; amount float64 (one blank); minutes str</td><td>always</td></tr>
    <tr><td>head / info / describe</td><td>DataFrame</td><td>what is in it?</td><td>11/12 amounts; mean 385.5 (duplicate included)</td><td>right after loading</td></tr>
    <tr><td>Parquet</td><td>typed columns on disk</td><td>save and reload safely, fast?</td><td>dates survive; 2 columns 10× or more faster at 200k rows</td><td>storing analysis data</td></tr>
    <tr><td><code>[]</code></td><td>column names</td><td>which columns?</td><td>orders[["customer", "amount"]]</td><td>picking columns</td></tr>
    <tr><td>loc / iloc</td><td>index / positions</td><td>which rows, by name or place?</td><td>loc[102:104] 3 rows; iloc[1:3] 2 rows</td><td>loc by default; iloc for "n-th"</td></tr>
    <tr><td>Masks / query</td><td>vectorised comparisons</td><td>rows by condition?</td><td>&gt; 400 → 102, 103, 109, 111; Pune &gt; 200 misses 104</td><td>almost every filter</td></tr>
    <tr><td><code>.loc</code> assignment, CoW</td><td>loc + masks</td><td>change values safely?</td><td>chained: unchanged; loc: Pizza Point → 0</td><td>every in-place edit</td></tr>
    <tr><td>assign</td><td>columns + lambdas</td><td>new column, original untouched?</td><td>total 270, 480, 550, 410</td><td>pipelines, chains</td></tr>
    <tr><td>Vectorised vs apply</td><td>NumPy operations</td><td>per-row logic, fast?</td><td>same fees; hundreds of times faster at 100k rows</td><td>always prefer vectorised</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>The index is the thread through the whole note.</strong> It is what makes a Series more than an array (labels), what alignment matches, what <code>loc</code> selects by, what masks are aligned to, and what keeps a row's identity when it is filtered or sorted.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The usual ways these tools are misused.</div>

  <h2 id="pdb-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which slips with Series, selection and assignment cause most wrong answers, and how do you spot them?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: positional thinking on labelled data</span><p>Adding Series with different indexes gives NaN, not position-wise sums. Check <code>index</code> on both sides or use <code>fill_value</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: not checking dtypes after reading</span><p>A number column stored as <code>str</code> cannot be summed or compared numerically. Look at <code>info()</code> first.</p></div>
  <div class="callout trap"><span class="label">Trap: CSV round trip</span><p>Dates and categories come back as text. Use Parquet, or re-apply <code>parse_dates</code>/<code>dtype</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: loc vs iloc slice ends</span><p><code>loc</code> includes the end label; <code>iloc</code> excludes the end position.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>and</code>/<code>or</code> on columns</span><p>Use <code>&amp;</code>, <code>|</code>, <code>~</code> and parentheses around each comparison.</p></div>
  <div class="callout trap"><span class="label">Trap: chained assignment</span><p><code>df[mask]["c"] = v</code> never writes. Use <code>df.loc[mask, "c"] = v</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting assign returns a new frame</span><p>Store or chain the result.</p></div>
  <div class="callout trap"><span class="label">Trap: apply for arithmetic</span><p>Row loops are hundreds of times slower than column maths; use <code>np.where</code>, <code>map</code>, <code>.str</code>, <code>pd.cut</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="pdb-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful's raw export, 12 rows, columns <code>order_id, customer, restaurant, city, order_time, amount, delivery_minutes</code>, 2–6 March 2026. Amounts (raw, with the duplicate 105): 240, 450, 520, 380, 310, 310, 180, blank, 260, 600, 290, 700. Messy: city " pune"/"MUMBAI", minutes "28 min"/"unknown"/blank, one 240.</p>
  <h3>The ladder in one line each</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on our data</th><th>Weakness → next</th></tr>
    <tr><td>list of dicts</td><td>hold rows in Python?</td><td>loop: Pune 760</td><td>a loop per question</td></tr>
    <tr><td>Series</td><td>labelled fast column?</td><td>day2["Pizza Point"] 520; ×1.05</td><td>different labels?</td></tr>
    <tr><td>Alignment</td><td>combine by label?</td><td>830 for Biryani Bros, NaN others</td><td>one column only</td></tr>
    <tr><td>DataFrame, dtypes</td><td>the whole file?</td><td>12 × 7; float64 amount, str minutes</td><td>too big to read</td></tr>
    <tr><td>head/info/describe</td><td>what is in it?</td><td>11/12 amounts; mean 385.5</td><td>CSV loses types</td></tr>
    <tr><td>Parquet</td><td>keep types, read fast?</td><td>dates survive; 10×+ for 2 columns</td><td>how to pick parts?</td></tr>
    <tr><td><code>[]</code></td><td>columns?</td><td>Series / DataFrame; slice = rows</td><td>ambiguous for rows</td></tr>
    <tr><td>loc / iloc</td><td>rows by label / position?</td><td>3 rows vs 2 rows</td><td>need conditions</td></tr>
    <tr><td>Mask / query</td><td>rows by condition?</td><td>&gt; 400: 102, 103, 109, 111</td><td>how to change rows?</td></tr>
    <tr><td>loc assignment, CoW</td><td>change safely?</td><td>chained: no change; loc: done</td><td>new columns?</td></tr>
    <tr><td>assign</td><td>new column, no side effects?</td><td>total = amount + 30</td><td>if/else rules?</td></tr>
    <tr><td>Vectorised vs apply</td><td>per-row logic fast?</td><td>same answer, hundreds of times faster</td><td>dirty keys → Cleaning</td></tr>
  </table>
  <h3>Syntax to remember</h3>
  <table class="tbl">
    <tr><th>Task</th><th>Code</th><th>Meaning of the parts</th></tr>
    <tr><td>Build</td><td><code>pd.Series(values, index=labels, name=n)</code>; <code>pd.DataFrame(list_of_dicts)</code></td><td>values + labels; keys → columns</td></tr>
    <tr><td>Align with default</td><td><code>a.add(b, fill_value=0)</code></td><td>missing label counts as 0</td></tr>
    <tr><td>Read</td><td><code>pd.read_csv(path, parse_dates=[…], usecols=[…], dtype={…})</code></td><td>types, columns, explicit dtypes</td></tr>
    <tr><td>Inspect</td><td><code>df.head()</code>, <code>df.info()</code>, <code>df.describe()</code></td><td>rows · types and gaps · summary numbers</td></tr>
    <tr><td>Select</td><td><code>df.loc[row_labels, cols]</code>, <code>df.iloc[row_pos, col_pos]</code></td><td>label (end incl.) · position (end excl.)</td></tr>
    <tr><td>Filter</td><td><code>df[(df.a &gt; x) &amp; (df.b == "y")]</code>, <code>df.query("a &gt; @x")</code></td><td>mask of True/False per row</td></tr>
    <tr><td>Change</td><td><code>df.loc[mask, "c"] = v</code></td><td>one step on the real table</td></tr>
    <tr><td>New columns</td><td><code>df.assign(c=lambda d: d.a + 1)</code></td><td>returns a new DataFrame</td></tr>
    <tr><td>If/else</td><td><code>np.where(cond, x, y)</code></td><td>vectorised choice</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>loc</b><p>You mean a specific row (order 103) or a condition.</p><small>Not for "the first n rows" after sorting</small></div>
    <div><b>iloc</b><p>You mean a position: top 3 after sorting, every 10th row.</p><small>Not for named rows</small></div>
    <div><b>query</b><p>Long readable filters, variables via @.</p><small>Not for column names with spaces (use backticks) or built masks</small></div>
    <div><b>Parquet</b><p>Storing tables between steps, big files, Spark.</p><small>Not for sending to a person who opens Excel</small></div>
    <div><b>apply</b><p>Only when no vectorised form exists.</p><small>Never for arithmetic or simple if/else</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Alignment NaNs; dtypes changed by one bad value; CSV losing types; loc includes the end, iloc excludes it; <code>and</code> instead of <code>&amp;</code>; chained assignment; ignoring <code>assign</code>'s return value; row loops; dirty text silently escaping filters.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>day2 + day3</code> for Dosa Hut?</td><td>NaN (only in day2); with <code>add(…, fill_value=0)</code> it is 240</td></tr>
    <tr><td>How many rows does <code>o.loc[102:104]</code> return? <code>o.iloc[1:3]</code>?</td><td>3 and 2</td></tr>
    <tr><td>Why is <code>amount</code> float64?</td><td>One blank became NaN, which is a float</td></tr>
    <tr><td>Does <code>df[df.city == "Pune"]["amount"] = 0</code> change df in pandas 3?</td><td>No; it warns (ChainedAssignmentError). Use <code>df.loc[df.city == "Pune", "amount"] = 0</code></td></tr>
    <tr><td>Why did order 104 get the Mumbai fee?</td><td>Its city is " pune", not "Pune": a cleaning problem, not a code problem</td></tr>
  </table>

  <h2 id="pdb-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a Series and a NumPy array?</summary><div class="qa-body">A Series is a NumPy-style array plus an index of labels (and a name). Operations between Series align on labels; between arrays they pair by position. Series also handle missing values and mixed label types.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>s1 + s2</code> do when the indexes differ?</summary><div class="qa-body">It takes the union of the labels, adds values whose labels match, and gives NaN for labels on only one side. <code>s1.add(s2, fill_value=0)</code> treats a missing side as 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>loc</code> vs <code>iloc</code>?</summary><div class="qa-body"><code>loc</code> selects by label (and masks), slice end included. <code>iloc</code> selects by integer position, slice end excluded. After sorting or filtering, labels and positions differ, so pick by meaning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did <code>pd.read_csv</code> make an integer column float?</summary><div class="qa-body">The column had a blank cell, read as NaN, which is a floating-point value; one NaN makes the whole column float64. Use the nullable <code>"Int64"</code> dtype to keep integers with missing values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why Parquet over CSV?</summary><div class="qa-body">Parquet stores types (dates stay dates), compresses, and is columnar, so reading a few columns reads only those. On 200,000 orders it was several times smaller and ten or more times faster for two columns. CSV is still best for exchanging small files with people and tools that cannot read Parquet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Filter orders in Pune above ₹200 in two ways.</summary><div class="qa-body"><code>o[(o["city"] == "Pune") &amp; (o["amount"] &gt; 200)]</code> or <code>o.query("city == 'Pune' and amount &gt; 200")</code>. On the raw table both miss order 104, whose city is " pune".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did <code>df[df.x &gt; 0]["y"] = 1</code> not change <code>df</code>?</summary><div class="qa-body">It is chained: <code>df[df.x &gt; 0]</code> creates a new object and the assignment edits that. Write <code>df.loc[df.x &gt; 0, "y"] = 1</code>. pandas 3 warns with ChainedAssignmentError; older versions raised SettingWithCopyWarning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Copy-on-Write?</summary><div class="qa-body">In pandas 3, every object derived from another behaves as an independent copy; pandas shares memory until one of them is written to, and copies only then. So editing a subset never changes its parent, and chained assignment never works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does selection need the index from section 02?</summary><div class="qa-body"><code>loc</code> selects by index label, masks are Series aligned to the index, and filtered rows keep their labels so you can still find order 103 after sorting. Without an index there would only be positions, which change after every sort or filter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must you check dtypes before writing masks or maths?</summary><div class="qa-body">A comparison like <code>delivery_minutes &gt; 30</code> on a <code>str</code> column compares text, not numbers (or fails), and sums concatenate or fail. dtypes decide what every later operation means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the vectorised habit and use apply everywhere?</summary><div class="qa-body">Correctness is the same, speed is not: a few hundred times slower on 100,000 rows here, more with heavier functions. The grouping and time-series tools in later notes are all vectorised, so the apply habit also hides the right tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: which problems seen in this note does the Cleaning note fix?</summary><div class="qa-body">The duplicate order 105 (inflating <code>describe</code>), " pune"/"MUMBAI" (escaping filters, wrong fees), text minutes ("28 min", "unknown") that cannot be averaged, the impossible 240, and the blank amount whose meaning must be decided.</div></details>
</main>
`
});
