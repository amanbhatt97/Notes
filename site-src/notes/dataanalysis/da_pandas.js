// notes/dataanalysis/da_pandas.js — Pandas
Object.assign(TOPIC_CONTENT, {
  "da_pandas": `<main>
  <h1>Pandas</h1>
  <p class="lead">Pandas is the Python library for tables: load a file, filter rows, group and total, join two tables, reshape. It is Excel and SQL inside Python, and it is the first tool a data scientist opens every day. Examples start with a 4-row kirana shop register, then move to the same 1,000-row online-shop <code>orders</code> table (seed 42) plus a 200-row <code>customers</code> table used across this phase, on pandas 3.0.</p>

  <h2 id="dp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Pandas</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Core &amp; I/O</div>
        <ul>
          <li><b>Series</b> — one column: values + index; <b>DataFrame</b> — the whole table, columns share one index</li>
          <li><b>Inspect</b> — <code>shape, dtypes, info(), describe(), head()</code></li>
          <li><b>Parquet</b> — columnar, compressed, typed; read 2 cols in 8 ms vs CSV 259 ms</li>
          <li><b>CSV</b> — <code>parse_dates</code>, <code>usecols</code>, <code>dtype</code>, <code>chunksize</code> for huge files</li>
          <li>⚠ <b>CSV loses types</b> — dates return as strings</li>
          <li>💡 DataFrame = a shop register: each column one kind of fact, each row one sale</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Selection</div>
        <ul>
          <li><b>loc</b> — by label/mask, end inclusive; <b>iloc</b> — by position, end exclusive</li>
          <li><b>Mask</b> — <code>df[(df.a &gt; 1) &amp; (df.b == "x")]</code>; <code>isin</code>, <code>between</code></li>
          <li><b>query</b> — <code>df.query("status == 'returned' and qty &gt;= 4")</code></li>
          <li>⚠ <b>loc[0:2] = 3 rows, iloc[0:2] = 2</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GroupBy</div>
        <ul>
          <li><b>Split → apply → combine</b> — sort rows into piles, total each pile, list the totals</li>
          <li><b>Named agg</b> — <code>agg(revenue=("revenue", "sum"), n=("order_id", "count"))</code></li>
          <li><b>agg</b> = GROUP BY (1 row/group); <b>transform</b> = window (every row); <b>filter</b> = HAVING</li>
          <li><b>Crosstab</b> — <code>groupby([a, b]).size().unstack(fill_value=0)</code></li>
          <li>⚠ <b>count skips NaN, size doesn't</b>; NaN keys dropped unless <code>dropna=False</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Merge &amp; Join</div>
        <ul>
          <li><b>merge(how=inner/left/right/outer)</b> — SQL joins on columns</li>
          <li><b>join</b> — on index; <b>concat</b> — stack rows (UNION ALL)</li>
          <li><b>indicator=True</b> — <code>_merge</code> column; anti-join = <code>left_only</code></li>
          <li>⚠ <b>Fan-out</b> — duplicate keys multiply rows: 356 → 570, revenue doubled</li>
          <li><b>Guard</b> — <code>validate="many_to_one"</code>, compare <code>len()</code> before/after, same key dtypes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Missing &amp; Reshape</div>
        <ul>
          <li><b>NaN</b> — "not a number", the empty cell marker</li>
          <li><b>Find</b> — <code>isna().sum()</code>, <code>value_counts(dropna=False)</code></li>
          <li><b>Fill</b> — <code>fillna(0)</code>, group median via <code>transform</code>, or drop</li>
          <li>⚠ <b>NaN ≠ NaN</b>; one NaN turns int → float (use <code>"Int64"</code>); mean skips NaN</li>
          <li><b>pivot_table</b> — long → wide, aggregates (default mean!), <code>margins=True</code></li>
          <li><b>melt</b> — wide → long (tidy) for groupby, Seaborn, Plotly</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Windows &amp; Time</div>
        <ul>
          <li><b>rolling(4).mean()</b> — moving average; first 3 NaN (<code>min_periods</code>)</li>
          <li><b>expanding().sum()</b> — running total; <b>shift(1)</b> — lag; <b>pct_change</b> — growth</li>
          <li><b>rank(method="dense")</b> per group — top-N per category</li>
          <li><b>cumcount() + 1</b> — nth order; <b>diff()</b> — days between orders</li>
          <li><b>resample("W"/"ME")</b> — needs datetime index; <code>.dt</code> accessor; <code>loc["2024-03"]</code></li>
          <li>⚠ <b>Sort by time first</b> — shift/diff follow row order</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Performance &amp; CoW</div>
        <ul>
          <li><b>apply(axis=1)</b> — Python per row: 1,792 ms vs vectorized 1.2 ms</li>
          <li><b>Fast tools</b> — <code>map(dict)</code>, <code>.str</code>, <code>np.where</code>, <code>np.select</code>, <code>pd.cut</code></li>
          <li>⚠ <b>Chained assignment</b> — <code>df[mask]["c"] = v</code> edits a temp; use <code>df.loc[mask, "c"] = v</code></li>
          <li><b>pandas 3 Copy-on-Write</b> — every subset behaves as a copy, copied lazily on write</li>
          <li><b>pandas &lt; 3</b> — SettingWithCopyWarning; <code>.copy()</code> the subset</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Memory</div>
        <ul>
          <li><b>Measure</b> — <code>memory_usage(deep=True)</code></li>
          <li><b>category</b> — few unique strings → int codes: 14.8 MB → 1.0 MB</li>
          <li><b>Downcast</b> — <code>pd.to_numeric(s, downcast="unsigned")</code>: int64 → uint8</li>
          <li><b>Result</b> — 1M orders 87.7 MB → 28.0 MB; groupby 39 → 24 ms</li>
          <li>⚠ <b>float32</b> — ~7 digits; keep money sums float64; category only for low cardinality</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dp-core"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Series, DataFrame &amp; I/O</span><span class="rm-sub">A table in Python; Parquet vs CSV</span></div></div>
      <div class="rm-item rm-done" data-target="dp-sel"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Selecting Data</span><span class="rm-sub">loc, iloc, masks, query</span></div></div>
      <div class="rm-item rm-done" data-target="dp-gb"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">GroupBy &amp; Aggregation</span><span class="rm-sub">Split, apply, combine</span></div></div>
      <div class="rm-item rm-done" data-target="dp-merge"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Merge &amp; Join</span><span class="rm-sub">SQL joins, fan-out trap</span></div></div>
      <div class="rm-item rm-done" data-target="dp-na"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Missing Values</span><span class="rm-sub">Count, fill, beware means</span></div></div>
      <div class="rm-item rm-done" data-target="dp-reshape"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">pivot_table &amp; melt</span><span class="rm-sub">Wide ↔ long</span></div></div>
      <div class="rm-item rm-done" data-target="dp-win"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Windows &amp; Time Series</span><span class="rm-sub">rolling, shift, rank, resample</span></div></div>
      <div class="rm-item rm-done" data-target="dp-perf"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">apply vs Vectorization</span><span class="rm-sub">1,500x on 100k rows</span></div></div>
      <div class="rm-item rm-done" data-target="dp-cow"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Chained Assignment &amp; CoW</span><span class="rm-sub">Why your edit vanished</span></div></div>
      <div class="rm-item rm-done" data-target="dp-mem"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Memory Optimization</span><span class="rm-sub">87.7 MB → 28.0 MB</span></div></div>
      <div class="rm-item rm-done" data-target="dp-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Classic pandas tasks</span></div></div>
    </div>
  </div>

  <h2 id="dp-core"><span class="num">01</span>Series, DataFrame &amp; I/O</h2>
  <p>A kirana shop keeps a register: one line per sale, with the item, the city branch, the quantity and the price. In pandas that register is a <strong>DataFrame</strong>: a table with named columns and numbered rows. Each single column is a <strong>Series</strong>.</p>
  <div class="fx" data-lang="py">import pandas as pd, numpy as np
t = pd.DataFrame({"item":  ["Maggi", "Parle-G", "Dettol", "Maggi"],
                  "city":  ["Pune", "Pune", "Delhi", "Delhi"],
                  "qty":   [2, 5, 1, 3],
                  "price": [14, 10, 45, 14]})
t["amount"] = t.qty * t.price          # a new column, computed for every row at once
print(t)
print(t["amount"])                     # one column = a Series
print(t["amount"].sum(), t["amount"].mean())</div>
  <div class="fx" data-lang="text">      item   city  qty  price  amount
0    Maggi   Pune    2     14      28
1  Parle-G   Pune    5     10      50
2   Dettol  Delhi    1     45      45
3    Maggi  Delhi    3     14      42
0    28
1    50
2    45
3    42
Name: amount, dtype: int64
165 41.25</div>
  <p>The numbers 0 to 3 on the left are the <strong>index</strong>: a label for each row. <code>t.qty * t.price</code> multiplies the whole column in one step, exactly like a NumPy array (every column is a NumPy array underneath). A Series carries its index along, so <code>t["amount"]</code> still knows which amount belongs to row 2.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <rect x="10" y="30" width="60" height="100" class="fs" stroke="currentColor"/><text x="20" y="22" class="tm">index</text>
    <text x="30" y="56">0</text><text x="30" y="82">1</text><text x="30" y="108">2</text>
    <rect x="70" y="30" width="110" height="100" class="fb sb"/><rect x="180" y="30" width="110" height="100" class="ft st"/><rect x="290" y="30" width="110" height="100" class="fg sg"/>
    <text x="80" y="22">order_id</text><text x="190" y="22">category</text><text x="300" y="22">revenue</text>
    <text x="80" y="56">1001</text><text x="190" y="56">Fashion</text><text x="300" y="56">5240.0</text>
    <text x="80" y="82">1002</text><text x="190" y="82">Beauty</text><text x="300" y="82">2880.0</text>
    <text x="80" y="108">1003</text><text x="190" y="108">Books</text><text x="300" y="108">880.0</text>
    <text x="420" y="56">each column = a Series</text><text x="420" y="76">(1-D array + index)</text><text x="420" y="104" class="tm">int64 · str · float64</text>
    <text x="10" y="146" class="tm">DataFrame = dict of Series sharing one index; one dtype per column</text>
  </svg><figcaption>Columns are NumPy/Arrow arrays; the index labels rows and drives alignment.</figcaption></figure>
  <p>This is the bigger <code>orders</code> table. Notice each column has its own <strong>dtype</strong> (data type): whole numbers, text, decimals. One column, one type. That is what makes pandas fast.</p>
  <p>Real data comes from files. <code>read_csv</code> loads a CSV (comma-separated text) into a DataFrame. Then look at it before doing anything else:</p>
  <div class="fx" data-lang="py">import pandas as pd, numpy as np
o = pd.read_csv("orders.csv", parse_dates=["order_date"])
c = pd.read_csv("customers.csv")          # customer_id, city, segment
o.shape, o.dtypes                         # (1000, 9); order_date datetime64, category str ...
o.describe(); o.info(); o.head()
s = pd.Series([120, 80, 45], index=["Mumbai", "Delhi", "Pune"])
s["Delhi"], s.iloc[0]                     # (80, 120)  label vs position</div>
  <p><code>shape</code> is (rows, columns). <code>head()</code> shows the first 5 rows. <code>info()</code> lists each column's type and how many values are filled. <code>describe()</code> gives count, mean, min, max for number columns. <code>parse_dates</code> tells pandas that <code>order_date</code> is a date, not plain text. The last two lines show the index can be words too: <code>s["Delhi"]</code> finds by label, <code>s.iloc[0]</code> by position.</p>
  <h3>Which file format?</h3>
  <p>CSV is easy to open anywhere, but it is just text. Pandas must read every character and guess each column's type. <strong>Parquet</strong> is a binary format that stores each column separately, compressed, with its type saved. Measured on a 200,000-row table:</p>
  <table class="tbl"><caption>Same 200k-row table on disk (real measurement)</caption>
    <tr><th>Format</th><th>Size</th><th>Read all</th><th>Read 2 columns</th><th>Keeps dtypes?</th></tr>
    <tr><td>CSV</td><td>11.4 MB</td><td>259 ms</td><td>259 ms (must parse all)</td><td>No: dates come back as str</td></tr>
    <tr><td>Parquet</td><td>0.2 MB</td><td>191 ms</td><td><strong>8 ms</strong></td><td>Yes: schema stored</td></tr>
    <tr><td>Excel</td><td>45.7 KB for 1k rows</td><td colspan="2">slowest; use for humans only</td><td>Partly</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A CSV is a register written as one long paragraph: to find the price column you must read every line. Parquet is a register with each column on its own sheet: to read prices you pick up one sheet.</p></div>
  <p>Parquet is <strong>columnar</strong> (stored column by column) and compressed. It reads only the columns you ask for and keeps types. (This test table repeats rows, so compression is unusually high.)</p>
  <div class="fx" data-lang="py">o.to_parquet("orders.parquet")                      # needs pyarrow
pd.read_parquet("orders.parquet", columns=["category", "revenue"])
o.to_excel("orders.xlsx", index=False)              # needs openpyxl
pd.read_csv("big.csv", usecols=["category", "revenue"], chunksize=100_000)   # stream huge CSVs</div>
  <p><code>usecols</code> loads only the columns you name. <code>chunksize</code> reads a huge CSV in pieces of 100,000 rows so it never has to fit in memory at once.</p>

  <h2 id="dp-sel"><span class="num">02</span>Selecting Data</h2>
  <p>"Show me the second sale." "Show me sales of 3 or more." Picking rows and columns is the most common pandas action, and there are two ways to point at a row: by its <strong>label</strong> (the index value) or by its <strong>position</strong> (0th, 1st, 2nd). <code>loc</code> uses labels; <code>iloc</code> ("integer location") uses positions.</p>
  <div class="fx" data-lang="py">print(t.loc[1, "item"], t.iloc[1, 0])                    # label 1 / position 1, column "item" / column 0
print(t.loc[0:2, "item"].tolist(), t.iloc[0:2, 0].tolist())</div>
  <div class="fx" data-lang="text">Parle-G Parle-G
['Maggi', 'Parle-G', 'Dettol'] ['Maggi', 'Parle-G']</div>
  <p>In a fresh table labels and positions are the same numbers, so both give Parle-G. The slice shows the one real difference: <code>loc[0:2]</code> includes label 2 (3 rows), <code>iloc[0:2]</code> stops before position 2 (2 rows), like normal Python slicing.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>In a train coach, <code>loc</code> is the seat number printed on the ticket (a label). <code>iloc</code> is "the 3rd seat from the door" (a position). After some seats are removed, the printed numbers stay but the counting changes.</p></div>
  <p>To filter by a condition, compare a column and put the result in brackets. This is a <strong>boolean mask</strong>: a True/False per row, and only True rows come through.</p>
  <div class="fx" data-lang="py">print(t[t.qty &gt;= 3])
print(t[(t.city == "Pune") &amp; (t.qty &gt;= 3)])     # two conditions: parentheses + &amp;</div>
  <div class="fx" data-lang="text">      item   city  qty  price  amount
1  Parle-G   Pune    5     10      50
3    Maggi  Delhi    3     14      42
      item  city  qty  price  amount
1  Parle-G  Pune    5     10      50</div>
  <p>The index labels 1 and 3 stayed with their rows. That is the point of labels: a row keeps its name no matter how you filter.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Selects by</th><th>Example</th><th>Slice end</th></tr>
    <tr><td><code>loc</code></td><td>labels / boolean mask</td><td><code>o.loc[0:2, ["order_id", "revenue"]]</code></td><td>included (3 rows)</td></tr>
    <tr><td><code>iloc</code></td><td>integer positions</td><td><code>o.iloc[0:2, [0, 3]]</code></td><td>excluded (2 rows)</td></tr>
    <tr><td><code>[]</code></td><td>columns, or a mask</td><td><code>o["revenue"]</code>, <code>o[o.qty &gt; 2]</code></td><td>-</td></tr>
    <tr><td><code>query</code></td><td>a string expression</td><td><code>o.query("status == 'returned' and qty &gt;= 4")</code></td><td>-</td></tr>
  </table>
  <p>The same on the orders table. "Electronics orders worth more than ₹60,000, show four columns":</p>
  <div class="fx" data-lang="py">o.loc[(o.category == "Electronics") &amp; (o.revenue &gt; 60000),
      ["order_id", "qty", "unit_price", "revenue"]]</div>
  <table class="tbl out"><caption>Result</caption><tr><th></th><th>order_id</th><th>qty</th><th>unit_price</th><th>revenue</th></tr>
    <tr><td>639</td><td>1640</td><td>4</td><td>19530.0</td><td>78120.0</td></tr>
    <tr><td>651</td><td>1652</td><td>4</td><td>16760.0</td><td>67040.0</td></tr></table>
  <div class="fx" data-lang="py">o.query("status == 'returned' and qty &gt;= 4").shape   # (10, 9)
o[o.category.isin(["Books", "Beauty"])].shape            # (304, 9)</div>
  <p><code>query</code> lets you write the condition as plain text, with <code>and</code> instead of <code>&amp;</code>. <code>isin</code> checks membership in a list: "is the category one of these?"</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>loc[0:2]</code> returns 3 rows, <code>iloc[0:2]</code> returns 2. After filtering or sorting, labels and positions no longer match, so pick on purpose. Python's <code>and</code>/<code>or</code> do not work on columns; use <code>&amp;</code>/<code>|</code> with parentheses.</p></div>

  <h2 id="dp-gb"><span class="num">03</span>GroupBy &amp; Aggregation</h2>
  <p>"How much did each city branch sell?" By hand you would sort the register pages into a Pune pile and a Delhi pile, total each pile, and write the two totals. That is exactly what <code>groupby</code> does, in three steps:</p>
  <div class="flow"><span>Split rows by key</span><span>Apply agg to each group</span><span>Combine into one table</span></div>
  <div class="fx" data-lang="py">print(t.groupby("city").amount.sum())
print(t.groupby("item").agg(n=("qty", "sum"), money=("amount", "sum")))</div>
  <div class="fx" data-lang="text">city
Delhi    87
Pune     78
Name: amount, dtype: int64
         n  money
item
Dettol   1     45
Maggi    5     70
Parle-G  5     50
</div>
  <p>Delhi: 45 + 42 = 87. Pune: 28 + 50 = 78. One row per group. An <strong>aggregation</strong> (agg) is any function that turns many values into one: sum, mean, count, max. The second form, <code>agg(new_name=(column, function))</code>, is called <strong>named aggregation</strong>: you choose the output column names.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school marksheet grouped by class: pile up each class's sheets, compute the class average, write one line per class.</p></div>
  <p>On the orders table, per category and only for delivered orders:</p>
  <div class="fx" data-lang="py">(o[o.status == "delivered"]
   .groupby("category")
   .agg(orders=("order_id", "count"),        # named aggregation: new_col=(column, func)
        revenue=("revenue", "sum"),
        avg_price=("unit_price", "mean"),
        max_qty=("qty", "max"))
   .sort_values("revenue", ascending=False).round(0))</div>
  <table class="tbl out"><caption>Result</caption><tr><th>category</th><th>orders</th><th>revenue</th><th>avg_price</th><th>max_qty</th></tr>
    <tr><td>Electronics</td><td>185</td><td>4258540.0</td><td>9302.0</td><td>4</td></tr>
    <tr><td>Home</td><td>164</td><td>1067810.0</td><td>2558.0</td><td>4</td></tr>
    <tr><td>Fashion</td><td>249</td><td>948710.0</td><td>1565.0</td><td>4</td></tr>
    <tr><td>Beauty</td><td>142</td><td>281120.0</td><td>758.0</td><td>4</td></tr>
    <tr><td>Books</td><td>124</td><td>136080.0</td><td>422.0</td><td>4</td></tr></table>
  <p>Grouping by two keys gives one row per pair. <code>size()</code> counts rows; <code>unstack</code> turns the second key into columns, making a <strong>crosstab</strong> (a count grid):</p>
  <div class="fx" data-lang="py">o.groupby(["category", "status"]).size().unstack(fill_value=0)   # a crosstab</div>
  <table class="tbl out"><caption>Result</caption><tr><th>category</th><th>cancelled</th><th>delivered</th><th>returned</th></tr>
    <tr><td>Beauty</td><td>14</td><td>142</td><td>6</td></tr><tr><td>Books</td><td>10</td><td>124</td><td>8</td></tr>
    <tr><td>Electronics</td><td>22</td><td>185</td><td>7</td></tr><tr><td>Fashion</td><td>22</td><td>249</td><td>21</td></tr>
    <tr><td>Home</td><td>13</td><td>164</td><td>13</td></tr></table>
  <h3>agg vs transform</h3>
  <p><code>agg</code> shrinks the table to one row per group. Sometimes you want the group's total written <em>next to every row</em>, for example "what share of its city's sales is this sale?" That is <code>transform</code>: it computes per group but returns a value for every original row.</p>
  <div class="fx" data-lang="py">t["city_total"] = t.groupby("city").amount.transform("sum")
t["share"] = (t.amount / t.city_total).round(2)
print(t)</div>
  <div class="fx" data-lang="text">      item   city  qty  price  amount  city_total  share
0    Maggi   Pune    2     14      28          78   0.36
1  Parle-G   Pune    5     10      50          78   0.64
2   Dettol  Delhi    1     45      45          87   0.52
3    Maggi  Delhi    3     14      42          87   0.48</div>
  <p>Both Pune rows got 78, both Delhi rows got 87; the table kept all 4 rows. (If you know SQL: this is a window function.)</p>
  <table class="tbl">
    <tr><th>Method</th><th>Output shape</th><th>SQL analogy</th></tr>
    <tr><td><code>agg</code></td><td>one row per group</td><td><code>GROUP BY</code></td></tr>
    <tr><td><code>transform</code></td><td>same rows as input</td><td>window function <code>OVER (PARTITION BY)</code></td></tr>
    <tr><td><code>filter</code></td><td>original rows of groups that pass</td><td><code>HAVING</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p><code>count</code> skips empty (NaN) cells, <code>size</code> counts every row. Group keys that are NaN are dropped unless <code>dropna=False</code>, so a whole "unknown" group can silently vanish.</p></div>

  <h2 id="dp-merge"><span class="num">04</span>Merge &amp; Join</h2>
  <p>The register says which item sold, but the shelf location lives in a different list. To see both together you must join the two tables on the column they share (<code>item</code>). This is <code>merge</code>, and the shared column is the <strong>key</strong>.</p>
  <div class="fx" data-lang="py">stock = pd.DataFrame({"item": ["Maggi", "Parle-G", "Lays"], "shelf": ["A1", "B2", "C3"]})
print(t[["item", "qty"]].merge(stock, on="item", how="inner"))
print(t[["item", "qty"]].merge(stock, on="item", how="left"))</div>
  <div class="fx" data-lang="text">      item  qty shelf
0    Maggi    2    A1
1  Parle-G    5    B2
2    Maggi    3    A1
      item  qty shelf
0    Maggi    2    A1
1  Parle-G    5    B2
2   Dettol    1   NaN
3    Maggi    3    A1</div>
  <p><code>how</code> decides what happens to rows without a partner. <strong>inner</strong> keeps only matches: Dettol (not in stock list) and Lays (never sold) are dropped. <strong>left</strong> keeps every row from the left table and writes NaN where nothing matched, so Dettol stays with an empty shelf.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Matching a class attendance list with the fee-paid list by roll number. Inner join: students on both lists. Left join: everyone on the attendance list, with a blank where no fee record exists.</p></div>
  <table class="tbl">
    <tr><th>pandas</th><th>SQL</th><th>Keeps</th></tr>
    <tr><td><code>o.merge(c, on="customer_id", how="inner")</code></td><td><code>INNER JOIN</code></td><td>matches only</td></tr>
    <tr><td><code>how="left"</code></td><td><code>LEFT JOIN</code></td><td>all orders, NaN if no customer</td></tr>
    <tr><td><code>how="outer"</code>, <code>indicator=True</code></td><td><code>FULL OUTER JOIN</code></td><td>everything, plus a <code>_merge</code> column</td></tr>
    <tr><td><code>pd.concat([a, b])</code></td><td><code>UNION ALL</code></td><td>stacks rows</td></tr>
  </table>
  <p>On the real data: attach each order's customer (and so their city), then total revenue per city.</p>
  <div class="fx" data-lang="py">m = o.merge(c, on="customer_id", how="left", validate="many_to_one")
m.groupby("city").revenue.sum().sort_values(ascending=False).head(3)
# Mumbai 2302120.0 · Delhi 1826970.0 · Bengaluru 1603830.0</div>
  <h3>The fan-out trap</h3>
  <p>What if the stock list has Maggi twice (two shelves)? Each Maggi sale matches both lines, so the sale appears twice:</p>
  <div class="fx" data-lang="py">stock2 = pd.DataFrame({"item": ["Maggi", "Maggi", "Parle-G"], "shelf": ["A1", "A9", "B2"]})
m2 = t[["item", "qty"]].merge(stock2, on="item")
print(m2); print(len(t), "-&gt;", len(m2), "qty sum", t.qty.sum(), "-&gt;", m2.qty.sum())</div>
  <div class="fx" data-lang="text">      item  qty shelf
0    Maggi    2    A1
1    Maggi    2    A9
2  Parle-G    5    B2
3    Maggi    3    A1
4    Maggi    3    A9
4 -&gt; 5 qty sum 11 -&gt; 15</div>
  <p>Four sales became five rows, and the total quantity jumped from 11 to 15 without anyone selling anything. This is <strong>fan-out</strong>: a duplicate key on the lookup side multiplies rows. On a big table nobody notices, and every total afterwards is wrong.</p>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="dp-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="170" height="26" class="fb sb"/><text x="16" y="48">1004 Electronics</text>
    <rect x="230" y="14" width="160" height="26" class="ft st"/><text x="236" y="32">Electronics Diwali</text>
    <rect x="230" y="46" width="160" height="26" class="ft st"/><text x="236" y="64">Electronics BlackFri</text>
    <path d="M180 40 L228 28" stroke="currentColor" marker-end="url(#dp-ar)"/><path d="M180 46 L228 58" stroke="currentColor" marker-end="url(#dp-ar)"/>
    <rect x="420" y="14" width="170" height="26" class="fr sr"/><text x="428" y="32">1004 ... Diwali</text>
    <rect x="420" y="46" width="170" height="26" class="fr sr"/><text x="428" y="64">1004 ... BlackFri</text>
    <text x="10" y="100">1 order × 2 promo rows = 2 output rows → revenue counted twice</text>
    <text x="10" y="120" class="tm">356 rows in → 570 rows out; Electronics revenue 4.89M → 9.78M</text>
  </svg><figcaption>Fan-out: a duplicate key on the "one" side multiplies rows and silently inflates sums.</figcaption></figure>
  <p>Same thing on the orders data: one Electronics order meets two promo rows and comes out twice. The guard is <code>validate="many_to_one"</code>: "many orders may share one category, but each category must appear once on the right". Pandas then refuses instead of doubling:</p>
  <div class="fx" data-lang="py">promos = pd.DataFrame({"category": ["Electronics", "Electronics", "Books"],
                       "promo": ["Diwali", "BlackFri", "BookWeek"]})
o.merge(promos, on="category", validate="many_to_one")</div>
  <div class="fx" data-lang="text">MergeError: Merge keys are not unique in right dataset; not a many-to-one merge</div>
  <div class="callout trap"><span class="label">Trap</span><p>Always compare <code>len()</code> before and after a merge, or pass <code>validate=</code>. Also check the key columns have the same dtype: an int <code>customer_id</code> never matches a str <code>"30"</code>, so you get all NaN and no error.</p></div>

  <h2 id="dp-na"><span class="num">05</span>Missing Values</h2>
  <p>Real registers have blanks: a discount nobody wrote down, a phone number not given. Pandas marks a blank cell as <strong>NaN</strong> ("not a number"). Three facts about NaN cause most bugs, so test them on a 3-value column with one blank:</p>
  <div class="fx" data-lang="py">s = pd.Series([80, None, 60])
print(s.dtype, s.mean(), s.fillna(0).mean(), s.isna().sum())
print(np.nan == np.nan)</div>
  <div class="fx" data-lang="text">float64 70.0 46.666666666666664 1
False</div>
  <ul>
    <li>The column became <code>float64</code> even though you typed whole numbers: NaN is a float, so one blank changes the whole column's type.</li>
    <li><code>mean()</code> quietly skipped the blank: (80 + 60) / 2 = 70. Fill the blank with 0 and the mean drops to 46.7. Same data, two different "averages". You must decide which one is true.</li>
    <li><code>NaN == NaN</code> is False, so you can never find blanks with <code>==</code>. Use <code>isna()</code>.</li>
  </ul>
  <p>On the orders table, 56 of 1,000 discounts are blank:</p>
  <div class="fx" data-lang="py">o.isna().sum()[lambda s: s &gt; 0]          # discount_pct    56
o.discount_pct.value_counts(dropna=False)   # 0.0: 478, 5.0: 239, 10.0: 144, 20.0: 83, NaN: 56
o.discount_pct.mean()                       # 4.55   (NaN skipped)
o.discount_pct.fillna(0).mean()             # 4.295  (NaN treated as 0)
# fill with each category's median (no leakage across groups)
o["discount_pct"] = o.discount_pct.fillna(o.groupby("category").discount_pct.transform("median"))</div>
  <p>The last line fills each blank with the <strong>median</strong> (middle value) of its own category, using <code>transform</code> from section 03. A Books order gets the typical Books discount, not the overall one.</p>
  <table class="tbl">
    <tr><th>Fact</th><th>Consequence</th></tr>
    <tr><td><code>np.nan == np.nan</code> is False</td><td>Test with <code>isna()</code>, never <code>== np.nan</code></td></tr>
    <tr><td><code>pd.Series([1, None, 3])</code> is float64</td><td>One NaN turns an int column into float (use <code>"Int64"</code> to avoid)</td></tr>
    <tr><td><code>pd.Series([np.nan]).sum()</code> is 0.0</td><td>Sums hide missing data; means change silently</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>"Missing" usually means something. A NaN discount may mean "no promo" (fill 0) or "logging failed" (impute or drop). Ask before filling. For ML, work out fill values on the training data only, or the test score is cheating.</p></div>

  <h2 id="dp-reshape"><span class="num">06</span>pivot_table &amp; melt</h2>
  <p>The register has one row per sale: this is called <strong>long</strong> format. The shop owner wants a summary grid: cities down the side, items across the top, total amount in each cell. That grid is <strong>wide</strong> format, and <code>pivot_table</code> builds it:</p>
  <div class="fx" data-lang="py">w = t.pivot_table(index="city", columns="item", values="amount", aggfunc="sum", fill_value=0)
print(w)
print(w.reset_index().melt(id_vars="city", var_name="item", value_name="amount"))</div>
  <div class="fx" data-lang="text">item   Dettol  Maggi  Parle-G
city
Delhi      45     42        0
Pune        0     28       50
    city     item  amount
0  Delhi   Dettol      45
1   Pune   Dettol       0
2  Delhi    Maggi      42
3   Pune    Maggi      28
4  Delhi  Parle-G       0
5   Pune  Parle-G      50</div>
  <p>The four arguments: <code>index</code> goes down the side, <code>columns</code> across the top, <code>values</code> fills the cells, <code>aggfunc</code> says how to combine when several rows land in one cell. <code>melt</code> is the reverse: it unrolls the grid back into one row per (city, item) pair. Wide is for people to read; long is what groupby and plotting libraries want.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="dp-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" class="tm">long (tidy): one row per fact</text>
    <rect x="10" y="24" width="180" height="84" class="fb sb"/>
    <text x="18" y="42">q  category  revenue</text><text x="18" y="62">1  Beauty     74000</text><text x="18" y="82">1  Books      49000</text><text x="18" y="102">2  Beauty     94000</text>
    <path d="M200 50 L300 50" stroke="currentColor" marker-end="url(#dp-ar2)"/><text x="212" y="42">pivot_table</text>
    <path d="M300 84 L200 84" stroke="currentColor" marker-end="url(#dp-ar2)"/><text x="230" y="102">melt</text>
    <text x="310" y="16" class="tm">wide: one column per category</text>
    <rect x="310" y="24" width="270" height="64" class="ft st"/>
    <text x="318" y="42">q  Beauty  Books  Electronics ...</text><text x="318" y="62">1  74000   49000  1147000</text><text x="318" y="82">2  94000   31000  1119000</text>
  </svg><figcaption>Wide is for reading and reports; long is what groupby, Seaborn and Plotly want.</figcaption></figure>
  <p>The same two shapes on the orders data, by quarter. Monthly revenue per category, with <code>margins=True</code> adding an "All" total column:</p>
  <div class="fx" data-lang="py">o["month"] = o.order_date.dt.to_period("M")
o.pivot_table(index="month", columns="category", values="revenue",
              aggfunc="sum", margins=True).head(3).round(0)</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>Beauty</th><th>Books</th><th>Electronics</th><th>Fashion</th><th>Home</th><th>All</th></tr>
    <tr><td>2024-01</td><td>33560.0</td><td>12480.0</td><td>432880.0</td><td>55200.0</td><td>90810.0</td><td>624930.0</td></tr>
    <tr><td>2024-02</td><td>11670.0</td><td>15700.0</td><td>285230.0</td><td>92850.0</td><td>107460.0</td><td>512910.0</td></tr>
    <tr><td>2024-03</td><td>28370.0</td><td>20670.0</td><td>428830.0</td><td>89370.0</td><td>105300.0</td><td>672540.0</td></tr></table>
  <div class="fx" data-lang="py">wide = o.pivot_table(index=o.order_date.dt.quarter.rename("q"), columns="category",
                     values="revenue", aggfunc="sum")
wide.reset_index().melt(id_vars="q", var_name="category", value_name="revenue")   # (20, 3)</div>
  <div class="callout trap"><span class="label">Trap</span><p>Plain <code>pivot</code> fails if two rows land in the same cell. <code>pivot_table</code> combines them, but its default <code>aggfunc</code> is <strong>mean</strong>, not sum. Forgetting <code>aggfunc="sum"</code> gives averages where you expected totals.</p></div>

  <h2 id="dp-win"><span class="num">07</span>Windows &amp; Time Series</h2>
  <p>Daily sales go up and down. To see the real trend you smooth them: the average of the last 3 days, today's sales versus yesterday's, the running total so far. Each of these looks at a small <strong>window</strong> of nearby rows. Five days of sales make it clear:</p>
  <div class="fx" data-lang="py">r = pd.Series([10, 20, 30, 40, 50], index=pd.date_range("2024-01-01", periods=5, freq="D"), name="sales")
pd.DataFrame({"sales": r, "ma3": r.rolling(3).mean(), "prev": r.shift(1),
              "cum": r.cumsum(), "growth": r.pct_change().round(2)})</div>
  <div class="fx" data-lang="text">            sales   ma3  prev  cum  growth
2024-01-01     10   NaN   NaN   10     NaN
2024-01-02     20   NaN  10.0   30    1.00
2024-01-03     30  20.0  20.0   60    0.50
2024-01-04     40  30.0  30.0  100    0.33
2024-01-05     50  40.0  40.0  150    0.25</div>
  <ul>
    <li><code>rolling(3).mean()</code>: average of this row and the 2 before. Day 3: (10+20+30)/3 = 20. Days 1 and 2 have no full window, so NaN.</li>
    <li><code>shift(1)</code>: yesterday's value moved down one row (a <strong>lag</strong>).</li>
    <li><code>cumsum()</code>: running total.</li>
    <li><code>pct_change()</code>: growth versus the previous row. Day 2: (20−10)/10 = 1.00, which is +100%.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>A moving average is a cricket batsman's "average of the last 3 innings": the window slides forward one match at a time, so one bad day does not swing it.</p></div>
  <p>The orders table has one row per order, not per week. <code>resample("W")</code> groups a date index into weeks (like groupby, but by time). Then the same window tools:</p>
  <div class="fx" data-lang="py">w = o.set_index("order_date").revenue.resample("W").sum()     # weekly revenue
pd.DataFrame({"rev": w,
              "ma4": w.rolling(4).mean().round(0),     # 4-week moving average
              "cum": w.expanding().sum(),              # running total
              "prev": w.shift(1),                      # last week (lag)
              "wow_pct": (w.pct_change() * 100).round(1)}).head(5)</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_date</th><th>rev</th><th>ma4</th><th>cum</th><th>prev</th><th>wow_pct</th></tr>
    <tr><td>2024-01-07</td><td>88560.0</td><td>NaN</td><td>88560.0</td><td>NaN</td><td>NaN</td></tr>
    <tr><td>2024-01-14</td><td>218250.0</td><td>NaN</td><td>306810.0</td><td>88560.0</td><td>146.4</td></tr>
    <tr><td>2024-01-21</td><td>178730.0</td><td>NaN</td><td>485540.0</td><td>218250.0</td><td>-18.1</td></tr>
    <tr><td>2024-01-28</td><td>109060.0</td><td>148650.0</td><td>594600.0</td><td>178730.0</td><td>-39.0</td></tr>
    <tr><td>2024-02-04</td><td>101110.0</td><td>151788.0</td><td>695710.0</td><td>109060.0</td><td>-7.3</td></tr></table>
  <p>First 3 <code>ma4</code> values are NaN: the 4-week window isn't full yet (<code>min_periods=1</code> would average whatever is available). <code>expanding()</code> is a window that starts at the first row and only grows.</p>
  <div class="fx" data-lang="py">o.set_index("order_date").resample("ME").agg(orders=("order_id", "count"),
                                             revenue=("revenue", "sum"))   # 2024-01-31: 78, 624930.0
o.set_index("order_date").loc["2024-03-01":"2024-03-03"]   # date-string slicing (inclusive)
o.order_date.dt.day_name().value_counts().head(1)          # Friday 163</div>
  <p><code>"ME"</code> means month-end. With a date index you can slice by writing dates as text. The <code>.dt</code> accessor pulls parts out of a date column: day name, month, year.</p>
  <h3>Windows inside groups</h3>
  <p>"Rank each order within its category" and "how many days since this customer's previous order" are windows per group: <code>groupby</code> plus a window method.</p>
  <div class="fx" data-lang="py">o["cat_avg"]     = o.groupby("category").revenue.transform("mean").round(0)
o["vs_cat"]      = (o.revenue / o.cat_avg).round(2)
o["rank_in_cat"] = o.groupby("category").revenue.rank(method="dense", ascending=False)
o[o.rank_in_cat &lt;= 2]       # top-2 orders per category (SQL: DENSE_RANK() OVER ...)

c = o.sort_values("order_date")
c["nth_order"]       = c.groupby("customer_id").cumcount() + 1
c["days_since_prev"] = c.groupby("customer_id").order_date.diff().dt.days</div>
  <table class="tbl out"><caption>Customer 30</caption><tr><th>order_id</th><th>order_date</th><th>nth_order</th><th>days_since_prev</th></tr>
    <tr><td>1004</td><td>2024-01-02</td><td>1</td><td>NaN</td></tr><tr><td>1086</td><td>2024-02-03</td><td>2</td><td>32.0</td></tr>
    <tr><td>1101</td><td>2024-02-08</td><td>3</td><td>5.0</td></tr><tr><td>1249</td><td>2024-04-03</td><td>4</td><td>55.0</td></tr></table>
  <p><code>cumcount()</code> numbers rows inside each group from 0, so +1 gives "1st, 2nd, 3rd order". <code>diff()</code> subtracts the previous row inside the group: 3 Feb minus 2 Jan is 32 days. <code>rank(method="dense")</code> gives ties the same rank with no gaps after them.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>shift</code>, <code>diff</code> and <code>cumcount</code> follow row order, not time. Sort by date first, or "previous order" means "previous row in the file".</p></div>

  <h2 id="dp-perf"><span class="num">08</span>apply vs Vectorization</h2>
  <p>Net revenue is <code>qty × price × (1 − discount/100)</code>. Beginners write a function and <code>apply</code> it to each row. It works, but it is a Python loop in disguise: pandas builds a small Series for every single row. The vectorized version does the maths on whole columns at once, like NumPy. On 100,000 rows:</p>
  <div class="fx" data-lang="py"># net revenue on 100,000 rows (discount_pct already filled)
big.apply(lambda r: r.qty * r.unit_price * (1 - r.discount_pct / 100), axis=1)  # 1791.9 ms
big.qty * big.unit_price * (1 - big.discount_pct / 100)                        #    1.2 ms</div>
  <p>Same answer (<code>np.allclose</code> → True), about 1,500 times faster. Rule: if you can write it as column maths, never write <code>apply(axis=1)</code>. For the usual "but I need an if/else" cases, there is a fast tool:</p>
  <table class="tbl">
    <tr><th>Need</th><th>Fast tool</th></tr>
    <tr><td>Map values via a dict</td><td><code>o.status.map({"delivered": 1, "cancelled": 0, "returned": 0})</code></td></tr>
    <tr><td>Text ops</td><td><code>o.category.str.upper().str[:3]</code> → FAS, BEA, BOO</td></tr>
    <tr><td>If / else</td><td><code>np.where(cond, a, b)</code>; many branches: <code>np.select([c1, c2], ["big", "mid"], default="small")</code></td></tr>
    <tr><td>Binning</td><td><code>pd.cut(o.revenue, [0, 1000, 10000, np.inf], labels=["small", "mid", "large"])</code> → mid 669, large 205, small 126</td></tr>
  </table>
  <p><strong>Binning</strong> means putting numbers into buckets. <code>pd.cut</code> with edges 0, 10, 100, 1000, ∞ turns 5, 50, 500, 5000 into tiny, small, mid, big:</p>
  <div class="fx" data-lang="py">pd.cut(pd.Series([5, 50, 500, 5000]), [0, 10, 100, 1000, np.inf], labels=["tiny", "small", "mid", "big"]).tolist()</div>
  <div class="fx" data-lang="text">['tiny', 'small', 'mid', 'big']</div>

  <h2 id="dp-cow"><span class="num">09</span>Chained Assignment &amp; Copy-on-Write</h2>
  <p>You want to set quantity to 0 for all Books orders. The natural-looking line <code>df[df.category == "Books"]["qty"] = 0</code> runs without error and changes nothing. Why? It is two separate steps: the first bracket makes a <em>new temporary table</em> of Books rows; the second bracket writes 0 into that temporary table, which is then thrown away.</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <defs><marker id="dp-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="90" height="34" class="fb sb"/><text x="36" y="42">df</text>
    <path d="M100 37 L170 37" stroke="currentColor" marker-end="url(#dp-ar3)"/><text x="104" y="30" class="tm">[mask]</text>
    <rect x="172" y="20" width="140" height="34" class="fr sr"/><text x="180" y="42">temporary copy</text>
    <path d="M312 37 L380 37" stroke="currentColor" marker-end="url(#dp-ar3)"/><text x="318" y="30" class="tm">["qty"]=0</text>
    <text x="386" y="42">edits the copy only</text>
    <rect x="10" y="66" width="90" height="34" class="fg sg"/><text x="36" y="88">df</text>
    <path d="M100 83 L170 83" stroke="currentColor" marker-end="url(#dp-ar3)"/><text x="178" y="88">.loc[mask, "qty"] = 0 → one step, edits df</text>
  </svg><figcaption>Two brackets = two operations; the write lands on the intermediate object.</figcaption></figure>
  <p>Top row: the write lands on the red temporary copy. Bottom row: <code>.loc[rows, column] = value</code> is one operation on <code>df</code> itself, so it works. Writing with two brackets in a row is called <strong>chained assignment</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Photocopying the Books page of the register, correcting the photocopy, and throwing it in the bin. The original register never changed.</p></div>
  <div class="fx" data-lang="py">df[df.category == "Books"]["qty"] = 0     # ChainedAssignmentError warning, df unchanged (0 rows set)
df.loc[df.category == "Books", "qty"] = 0 # correct: 142 rows set

books = o[o.category == "Books"]
books["qty"] = 0                          # pandas 3: modifies books only; o is untouched</div>
  <p>The last two lines are the other side of the same question: if you save a filtered subset in a variable and edit it, does the original change? In pandas 3 the answer is always no, thanks to <strong>Copy-on-Write</strong> (CoW): every subset behaves like its own copy, and pandas only actually copies the data at the moment you write to it. Older pandas was unpredictable: the subset was sometimes a view (shared), sometimes a copy, and it warned with <code>SettingWithCopyWarning</code>.</p>
  <table class="tbl">
    <tr><th>pandas &lt; 3</th><th>pandas 3 (Copy-on-Write always on)</th></tr>
    <tr><td><code>SettingWithCopyWarning</code>; result could be a view or copy, so edits sometimes leaked into the parent</td><td>Every derived object <em>behaves</em> as a copy; data is copied lazily only when written</td></tr>
    <tr><td>Defensive <code>.copy()</code> everywhere</td><td>No warning for <code>books["qty"] = 0</code>; chained assignment never works and warns</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>On pandas 2.x without CoW, <code>books["qty"] = 0</code> warns and the parent may or may not change. Interviewers still ask: answer "use <code>.loc</code> in one step, or <code>.copy()</code> the subset".</p></div>

  <h2 id="dp-mem"><span class="num">10</span>Memory Optimization</h2>
  <p>A status column holds one of three words: delivered, cancelled, returned. Stored as text, 10 lakh rows means 10 lakh copies of those words. Stored as a <strong>category</strong>, pandas keeps the three words once and a tiny number (0, 1, 2) per row. Measured on 1,000,000 identical strings:</p>
  <div class="fx" data-lang="py">s1 = pd.Series(["delivered"] * 1_000_000)
print(round(s1.memory_usage(deep=True) / 1e6, 1), round(s1.astype("category").memory_usage(deep=True) / 1e6, 1))</div>
  <div class="fx" data-lang="text">17.0 1.0</div>
  <p>17 MB down to 1 MB. The same idea for numbers: <code>qty</code> is never above 4, so it does not need <code>int64</code> (8 bytes, up to 9 quintillion). <code>uint8</code> (1 byte, 0 to 255) is enough. Shrinking a column to a smaller type is called <strong>downcasting</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Category is like a UPI contact list: you save "Raju Kirana" once and then just tap the saved name instead of typing it every time.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="10" y="16" class="tm">1,000,000 orders, memory_usage(deep=True), MB</text>
    <text x="10" y="44">before</text><rect x="70" y="30" width="438" height="22" class="fr sr"/><text x="514" y="46">87.7</text>
    <text x="10" y="80">after</text><rect x="70" y="66" width="140" height="22" class="fg sg"/><text x="216" y="82">28.0</text>
    <text x="10" y="116" class="tm">status: str 16.9 → category 1.0 · qty: int64 8.0 → uint8 1.0</text>
    <text x="10" y="136" class="tm">customer_id: int64 8.0 → uint8 1.0 · prices: float64 8.0 → float32 4.0</text>
  </svg><figcaption>3.1x smaller; groupby on category also got faster (39.2 ms → 23.9 ms).</figcaption></figure>
  <div class="fx" data-lang="py">for col in ["category", "status"]:                 # few unique values -&gt; category
    big[col] = big[col].astype("category")         # stores int8 codes + 5 labels
for col in ["qty", "customer_id", "order_id"]:
    big[col] = pd.to_numeric(big[col], downcast="unsigned")   # uint8 / uint32
big[["unit_price", "revenue", "discount_pct"]] = big[["unit_price", "revenue", "discount_pct"]].astype("float32")
big.memory_usage(deep=True).sum() / 1e6            # 87.7 -&gt; 28.0</div>
  <p><code>pd.to_numeric(..., downcast="unsigned")</code> picks the smallest unsigned (no negatives) type that fits the column's values. One string column, 1M rows: <code>object</code> 55.8 MB, pandas 3 <code>str</code> (Arrow) 14.8 MB, <code>category</code> 1.0 MB.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>category</code> only helps with low <strong>cardinality</strong> (few unique values). A column of 1M unique order IDs as category is bigger, not smaller. <code>float32</code> keeps only about 7 digits, so a crore-rupee total loses paise: keep money sums in float64 or integer paise.</p></div>

  <h2 id="dp-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line each: what is a Series, a DataFrame, and the index?</summary><div class="qa-body">A Series is one column: values plus an index. A DataFrame is a table of Series that share one index. The index is the row labels, which stay attached to rows through filtering and drive alignment in joins and arithmetic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top-2 orders by revenue within each category.</summary><div class="qa-body"><code>o.sort_values("revenue", ascending=False).groupby("category").head(2)</code>, or rank with <code>groupby().revenue.rank(method="dense", ascending=False) &lt;= 2</code> if ties should both be kept. <code>nlargest</code> per group also works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Add a column with each row's share of its category's total revenue.</summary><div class="qa-body"><code>o["share"] = o.revenue / o.groupby("category").revenue.transform("sum")</code>. <code>transform</code> returns a value per row, aligned to the original index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Month-over-month revenue growth.</summary><div class="qa-body"><code>m = o.set_index("order_date").revenue.resample("ME").sum(); m.pct_change()</code>. Jan → Feb: 624930 → 512910, about -17.9%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>After merging orders (1,000 rows) with a lookup table, you have 1,214 rows. What happened?</summary><div class="qa-body">Fan-out: some keys appear more than once in the lookup table. Find them with <code>lookup[lookup.key.duplicated(keep=False)]</code>, dedupe, and add <code>validate="many_to_one"</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find customers who never ordered.</summary><div class="qa-body">Anti-join: <code>c[~c.customer_id.isin(o.customer_id)]</code>, or <code>c.merge(o, how="left", indicator=True).query("_merge == 'left_only'")</code>. (In our data every customer ordered, so it's empty.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Days between each customer's consecutive orders.</summary><div class="qa-body"><code>o.sort_values("order_date").groupby("customer_id").order_date.diff().dt.days</code>. Customer 30: NaN, 32, 5, 55. Sorting first is essential.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>pd.Series([1, None, 3]).dtype</code> and <code>.sum()</code></summary><div class="qa-body"><code>float64</code> (None became NaN, which needs float) and <code>4.0</code>, because sum skips NaN. Use <code>dtype="Int64"</code> for nullable integers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did <code>df[df.x &gt; 0]["y"] = 1</code> not change <code>df</code>?</summary><div class="qa-body">It's chained: the first <code>[]</code> creates a new object and the assignment edits that. Write <code>df.loc[df.x &gt; 0, "y"] = 1</code>. Pandas 3 warns with ChainedAssignmentError; older versions raise SettingWithCopyWarning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>merge</code> vs <code>join</code> vs <code>concat</code>?</summary><div class="qa-body"><code>merge</code>: SQL-style join on columns. <code>join</code>: shortcut joining on the index (default left). <code>concat</code>: stacks frames along an axis, aligning on labels, like <code>UNION ALL</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A 5 GB CSV doesn't fit in RAM. Options?</summary><div class="qa-body"><code>usecols</code> + explicit <code>dtype</code> (category, downcasts); <code>chunksize</code> to aggregate in pieces; convert once to Parquet and read only needed columns; or use Polars / DuckDB, which stream and run multi-threaded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Rolling 7-day average revenue per category.</summary><div class="qa-body"><code>d = o.groupby(["category", pd.Grouper(key="order_date", freq="D")]).revenue.sum()</code> then <code>d.groupby(level=0).rolling(7, min_periods=1).mean().droplevel(0)</code> (rolling repeats the group key level). Or with a datetime index: <code>.rolling("7D")</code> for calendar windows with gaps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Remove duplicate customers, keeping their latest signup row.</summary><div class="qa-body"><code>df.sort_values("signup_date").drop_duplicates("customer_id", keep="last")</code>. Check first with <code>df.customer_id.duplicated().sum()</code>.</div></details>
</main>`
});
