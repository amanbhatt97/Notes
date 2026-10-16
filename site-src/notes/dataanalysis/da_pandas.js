// notes/dataanalysis/da_pandas.js — Pandas
Object.assign(TOPIC_CONTENT, {
  "da_pandas": `<main>
  <h1>Pandas</h1>
  <p class="lead">Pandas is SQL plus Excel inside Python: load, filter, group, join and reshape tables. Every example runs on the same 1,000-row <code>orders</code> table (seed 42) plus a 200-row <code>customers</code> table, with pandas 3.0.</p>

  <h2 id="dp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Pandas</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Core &amp; I/O</div>
        <ul>
          <li><b>Series</b> — 1-D array + index; <b>DataFrame</b> — dict of Series sharing an index</li>
          <li><b>Inspect</b> — <code>shape, dtypes, info(), describe(), head()</code></li>
          <li><b>Parquet</b> — columnar, compressed, typed; read 2 cols in 8 ms vs CSV 259 ms</li>
          <li><b>CSV</b> — <code>parse_dates</code>, <code>usecols</code>, <code>dtype</code>, <code>chunksize</code> for huge files</li>
          <li>⚠ <b>CSV loses types</b> — dates return as strings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Selection</div>
        <ul>
          <li><b>loc</b> — labels/masks, end inclusive; <b>iloc</b> — positions, end exclusive</li>
          <li><b>Mask</b> — <code>df[(df.a &gt; 1) &amp; (df.b == "x")]</code>; <code>isin</code>, <code>between</code></li>
          <li><b>query</b> — <code>df.query("status == 'returned' and qty &gt;= 4")</code></li>
          <li>⚠ <b>loc[0:2] = 3 rows, iloc[0:2] = 2</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GroupBy</div>
        <ul>
          <li><b>Split → apply → combine</b></li>
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
      <div class="rm-item rm-done" data-target="dp-core"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Series, DataFrame &amp; I/O</span><span class="rm-sub">Why Parquet beats CSV</span></div></div>
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
  <div class="fx" data-lang="py">import pandas as pd, numpy as np
o = pd.read_csv("orders.csv", parse_dates=["order_date"])
c = pd.read_csv("customers.csv")          # customer_id, city, segment
o.shape, o.dtypes                         # (1000, 9); order_date datetime64, category str ...
o.describe(); o.info(); o.head()
s = pd.Series([120, 80, 45], index=["Mumbai", "Delhi", "Pune"])
s["Delhi"], s.iloc[0]                     # (80, 120)  label vs position</div>
  <table class="tbl"><caption>Same 200k-row table on disk (real measurement)</caption>
    <tr><th>Format</th><th>Size</th><th>Read all</th><th>Read 2 columns</th><th>Keeps dtypes?</th></tr>
    <tr><td>CSV</td><td>11.4 MB</td><td>259 ms</td><td>259 ms (must parse all)</td><td>No: dates come back as str</td></tr>
    <tr><td>Parquet</td><td>0.2 MB</td><td>191 ms</td><td><strong>8 ms</strong></td><td>Yes: schema stored</td></tr>
    <tr><td>Excel</td><td>45.7 KB for 1k rows</td><td colspan="2">slowest; use for humans only</td><td>Partly</td></tr>
  </table>
  <p><strong>Parquet</strong> is columnar and compressed: reads only the columns you ask for and keeps types. (This table repeats rows, so compression is unusually high.)</p>
  <div class="fx" data-lang="py">o.to_parquet("orders.parquet")                      # needs pyarrow
pd.read_parquet("orders.parquet", columns=["category", "revenue"])
o.to_excel("orders.xlsx", index=False)              # needs openpyxl
pd.read_csv("big.csv", usecols=["category", "revenue"], chunksize=100_000)   # stream huge CSVs</div>

  <h2 id="dp-sel"><span class="num">02</span>Selecting Data</h2>
  <table class="tbl">
    <tr><th>Tool</th><th>Selects by</th><th>Example</th><th>Slice end</th></tr>
    <tr><td><code>loc</code></td><td>labels / boolean mask</td><td><code>o.loc[0:2, ["order_id", "revenue"]]</code></td><td>included (3 rows)</td></tr>
    <tr><td><code>iloc</code></td><td>integer positions</td><td><code>o.iloc[0:2, [0, 3]]</code></td><td>excluded (2 rows)</td></tr>
    <tr><td><code>[]</code></td><td>columns, or a mask</td><td><code>o["revenue"]</code>, <code>o[o.qty &gt; 2]</code></td><td>-</td></tr>
    <tr><td><code>query</code></td><td>a string expression</td><td><code>o.query("status == 'returned' and qty &gt;= 4")</code></td><td>-</td></tr>
  </table>
  <div class="fx" data-lang="py">o.loc[(o.category == "Electronics") &amp; (o.revenue &gt; 60000),
      ["order_id", "qty", "unit_price", "revenue"]]</div>
  <table class="tbl out"><caption>Result</caption><tr><th></th><th>order_id</th><th>qty</th><th>unit_price</th><th>revenue</th></tr>
    <tr><td>639</td><td>1640</td><td>4</td><td>19530.0</td><td>78120.0</td></tr>
    <tr><td>651</td><td>1652</td><td>4</td><td>16760.0</td><td>67040.0</td></tr></table>
  <div class="fx" data-lang="py">o.query("status == 'returned' and qty &gt;= 4").shape   # (10, 9)
o[o.category.isin(["Books", "Beauty"])].shape            # (304, 9)</div>
  <div class="callout trap"><span class="label">Trap</span><p><code>loc[0:2]</code> returns 3 rows, <code>iloc[0:2]</code> returns 2. After filtering or sorting, labels and positions differ, so pick deliberately.</p></div>

  <h2 id="dp-gb"><span class="num">03</span>GroupBy &amp; Aggregation</h2>
  <div class="flow"><span>Split rows by key</span><span>Apply agg to each group</span><span>Combine into one table</span></div>
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
  <div class="fx" data-lang="py">o.groupby(["category", "status"]).size().unstack(fill_value=0)   # a crosstab</div>
  <table class="tbl out"><caption>Result</caption><tr><th>category</th><th>cancelled</th><th>delivered</th><th>returned</th></tr>
    <tr><td>Beauty</td><td>14</td><td>142</td><td>6</td></tr><tr><td>Books</td><td>10</td><td>124</td><td>8</td></tr>
    <tr><td>Electronics</td><td>22</td><td>185</td><td>7</td></tr><tr><td>Fashion</td><td>22</td><td>249</td><td>21</td></tr>
    <tr><td>Home</td><td>13</td><td>164</td><td>13</td></tr></table>
  <table class="tbl">
    <tr><th>Method</th><th>Output shape</th><th>SQL analogy</th></tr>
    <tr><td><code>agg</code></td><td>one row per group</td><td><code>GROUP BY</code></td></tr>
    <tr><td><code>transform</code></td><td>same rows as input</td><td>window function <code>OVER (PARTITION BY)</code></td></tr>
    <tr><td><code>filter</code></td><td>original rows of groups that pass</td><td><code>HAVING</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p><code>count</code> skips NaN, <code>size</code> doesn't. Group keys that are NaN are dropped unless <code>dropna=False</code>.</p></div>

  <h2 id="dp-merge"><span class="num">04</span>Merge &amp; Join</h2>
  <table class="tbl">
    <tr><th>pandas</th><th>SQL</th><th>Keeps</th></tr>
    <tr><td><code>o.merge(c, on="customer_id", how="inner")</code></td><td><code>INNER JOIN</code></td><td>matches only</td></tr>
    <tr><td><code>how="left"</code></td><td><code>LEFT JOIN</code></td><td>all orders, NaN if no customer</td></tr>
    <tr><td><code>how="outer"</code>, <code>indicator=True</code></td><td><code>FULL OUTER JOIN</code></td><td>everything, plus a <code>_merge</code> column</td></tr>
    <tr><td><code>pd.concat([a, b])</code></td><td><code>UNION ALL</code></td><td>stacks rows</td></tr>
  </table>
  <div class="fx" data-lang="py">m = o.merge(c, on="customer_id", how="left", validate="many_to_one")
m.groupby("city").revenue.sum().sort_values(ascending=False).head(3)
# Mumbai 2302120.0 · Delhi 1826970.0 · Bengaluru 1603830.0</div>
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
  <div class="fx" data-lang="py">promos = pd.DataFrame({"category": ["Electronics", "Electronics", "Books"],
                       "promo": ["Diwali", "BlackFri", "BookWeek"]})
o.merge(promos, on="category", validate="many_to_one")</div>
  <div class="fx" data-lang="text">MergeError: Merge keys are not unique in right dataset; not a many-to-one merge</div>
  <div class="callout trap"><span class="label">Trap</span><p>Always check <code>len()</code> before and after a merge, or pass <code>validate=</code>. Join keys with different dtypes (int vs str) match nothing.</p></div>

  <h2 id="dp-na"><span class="num">05</span>Missing Values</h2>
  <div class="fx" data-lang="py">o.isna().sum()[lambda s: s &gt; 0]          # discount_pct    56
o.discount_pct.value_counts(dropna=False)   # 0.0: 478, 5.0: 239, 10.0: 144, 20.0: 83, NaN: 56
o.discount_pct.mean()                       # 4.55   (NaN skipped)
o.discount_pct.fillna(0).mean()             # 4.295  (NaN treated as 0)
# fill with each category's median (no leakage across groups)
o["discount_pct"] = o.discount_pct.fillna(o.groupby("category").discount_pct.transform("median"))</div>
  <table class="tbl">
    <tr><th>Fact</th><th>Consequence</th></tr>
    <tr><td><code>np.nan == np.nan</code> is False</td><td>Test with <code>isna()</code>, never <code>== np.nan</code></td></tr>
    <tr><td><code>pd.Series([1, None, 3])</code> is float64</td><td>One NaN turns an int column into float (use <code>"Int64"</code> to avoid)</td></tr>
    <tr><td><code>pd.Series([np.nan]).sum()</code> is 0.0</td><td>Sums hide missing data; means change silently</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>"Missing" usually means something. A NaN discount may mean "no promo" (fill 0) or "logging failed" (impute or drop). Ask before filling; for ML, fit imputers on train only.</p></div>

  <h2 id="dp-reshape"><span class="num">06</span>pivot_table &amp; melt</h2>
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
  <p><code>pivot</code> fails on duplicate index/column pairs; <code>pivot_table</code> aggregates them (default <code>mean</code>!).</p>

  <h2 id="dp-win"><span class="num">07</span>Windows &amp; Time Series</h2>
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
  <p>First 3 <code>ma4</code> values are NaN: the window isn't full yet (<code>min_periods</code> changes that).</p>
  <div class="fx" data-lang="py">o.set_index("order_date").resample("ME").agg(orders=("order_id", "count"),
                                             revenue=("revenue", "sum"))   # 2024-01-31: 78, 624930.0
o.set_index("order_date").loc["2024-03-01":"2024-03-03"]   # date-string slicing (inclusive)
o.order_date.dt.day_name().value_counts().head(1)          # Friday 163</div>
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
  <div class="callout trap"><span class="label">Trap</span><p><code>shift</code>, <code>diff</code> and <code>cumcount</code> follow row order. Sort by time first, or "previous order" means "previous row in the file".</p></div>

  <h2 id="dp-perf"><span class="num">08</span>apply vs Vectorization</h2>
  <div class="fx" data-lang="py"># net revenue on 100,000 rows (discount_pct already filled)
big.apply(lambda r: r.qty * r.unit_price * (1 - r.discount_pct / 100), axis=1)  # 1791.9 ms
big.qty * big.unit_price * (1 - big.discount_pct / 100)                        #    1.2 ms</div>
  <p>Same answer (<code>np.allclose</code> → True), ~1,500x faster. <code>apply(axis=1)</code> builds a Python Series for every row.</p>
  <table class="tbl">
    <tr><th>Need</th><th>Fast tool</th></tr>
    <tr><td>Map values via a dict</td><td><code>o.status.map({"delivered": 1, "cancelled": 0, "returned": 0})</code></td></tr>
    <tr><td>Text ops</td><td><code>o.category.str.upper().str[:3]</code> → FAS, BEA, BOO</td></tr>
    <tr><td>If / else</td><td><code>np.where(cond, a, b)</code>; many branches: <code>np.select([c1, c2], ["big", "mid"], default="small")</code></td></tr>
    <tr><td>Binning</td><td><code>pd.cut(o.revenue, [0, 1000, 10000, np.inf], labels=["small", "mid", "large"])</code> → mid 669, large 205, small 126</td></tr>
  </table>

  <h2 id="dp-cow"><span class="num">09</span>Chained Assignment &amp; Copy-on-Write</h2>
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
  <div class="fx" data-lang="py">df[df.category == "Books"]["qty"] = 0     # ChainedAssignmentError warning, df unchanged (0 rows set)
df.loc[df.category == "Books", "qty"] = 0 # correct: 142 rows set

books = o[o.category == "Books"]
books["qty"] = 0                          # pandas 3: modifies books only; o is untouched</div>
  <table class="tbl">
    <tr><th>pandas &lt; 3</th><th>pandas 3 (Copy-on-Write always on)</th></tr>
    <tr><td><code>SettingWithCopyWarning</code>; result could be a view or copy, so edits sometimes leaked into the parent</td><td>Every derived object <em>behaves</em> as a copy; data is copied lazily only when written</td></tr>
    <tr><td>Defensive <code>.copy()</code> everywhere</td><td>No warning for <code>books["qty"] = 0</code>; chained assignment never works and warns</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>On pandas 2.x without CoW, <code>books["qty"] = 0</code> warns and the parent may or may not change. Interviewers still ask: answer "use <code>.loc</code> in one step, or <code>.copy()</code> the subset".</p></div>

  <h2 id="dp-mem"><span class="num">10</span>Memory Optimization</h2>
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
  <p>One string column, 1M rows: <code>object</code> 55.8 MB, pandas 3 <code>str</code> (Arrow) 14.8 MB, <code>category</code> 1.0 MB.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>category</code> only helps with low cardinality (few unique values). Downcasting to float32 loses precision (~7 digits), so keep money sums in float64 or integer paise.</p></div>

  <h2 id="dp-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
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
