// notes/dataanalysis/da_pandas.js — Pandas: the map
Object.assign(TOPIC_CONTENT, {
  "da_pandas": `<main>
<h1>Pandas: the map</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>Pandas: the map</span></div>
  <p class="lead">Start here. Pandas is the Python library for tables: load a file, pick rows, fix messy values, total by group, join tables, reshape them, work with dates, and do it fast. Those are not ten unrelated tricks. Each one exists because the step before it left a question unanswered. This page tells that story as one chain of needs, follows one running example through all of it (one week of orders at Biteful, a small food-delivery company in Pune and Mumbai: 12 raw order rows, a restaurants table and a customers table), compares pandas with the tools you already know, and lays out the reading order of the four notes that teach it in depth. It ends with a revision sheet. Every output on this page comes from a real run on pandas 3.0.5 (Python 3.13).</p>

  <h2 id="pdm-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="pdm-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Python Collections (dicts, lists) · Files · NumPy arrays</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#pdm-ga)"/>
<line x1="320" y1="102" x2="83" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdm-ga)"/>
<line x1="320" y1="102" x2="241" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdm-ga)"/>
<line x1="320" y1="102" x2="399" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdm-ga)"/>
<line x1="320" y1="102" x2="557" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdm-ga)"/>
<line x1="158" y1="152" x2="164" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdm-ga)"/>
<line x1="316" y1="152" x2="322" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdm-ga)"/>
<line x1="474" y1="152" x2="480" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdm-ga)"/>
<rect x="200" y="62" width="240" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="700">Pandas: the map</text>
<text x="320" y="94" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · why each tool, in what order</text>
<rect x="8" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="83" y="149" text-anchor="middle" font-size="12" font-weight="400">Basics &amp; Selection</text>
<text x="83" y="164" text-anchor="middle" class="tm" font-size="10">table · index · pick</text>
<rect x="166" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="241" y="149" text-anchor="middle" font-size="12" font-weight="400">Cleaning</text>
<text x="241" y="164" text-anchor="middle" class="tm" font-size="10">NaN · types · text</text>
<rect x="324" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="399" y="149" text-anchor="middle" font-size="12" font-weight="400">GroupBy &amp; Merge</text>
<text x="399" y="164" text-anchor="middle" class="tm" font-size="10">summarise · combine · reshape</text>
<rect x="482" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="557" y="149" text-anchor="middle" font-size="12" font-weight="400">Time &amp; Speed</text>
<text x="557" y="164" text-anchor="middle" class="tm" font-size="10">dates · windows · fast</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdm-ga)"/>
<rect x="40" y="210" width="560" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Visualisation · SQL joins &amp; windows · Feature Engineering · Time Series · Spark</text>
</svg><figcaption>The Pandas group. Read the map first, then left to right: each note answers a question the one before could not. Dotted arrows show the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_ds">Python Collections</a>, <a class="xref" data-note="py_files">Files</a> and <a class="xref" data-note="da_numpy">NumPy</a></b><span>A list of dicts can hold our orders, and a loop can total them, but every new question needs a new loop. A file gives us the data as text. NumPy gives fast maths on whole arrays, but one array holds one type and rows have no names. Left open: how do we work with a <em>table</em> whose columns have different types (names, times, money) as easily as NumPy works with numbers?</span></li>
    <li><b>This note adds: the map of pandas</b><span>Why each part of pandas exists (the need chain), what pandas adds on top of lists, dicts and NumPy, how the four child notes divide the work, and the order to read them. Nothing is taught in full here; each child note does that.</span></li>
    <li><b>Leads to: the four child notes, then beyond</b><span><a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a> → <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a> → <a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a> → <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>. After the group: <a class="xref" data-note="st_descriptive">Descriptive Statistics</a> (what to compute on a clean table), <a class="xref" data-note="da_viz">Visualisation</a>, <a class="xref" data-note="sql_joins">SQL JOINs</a> and <a class="xref" data-note="sql_windows">Window Functions</a> (the same ideas in a database), <a class="xref" data-note="ml_features">Feature Engineering</a>, <a class="xref" data-note="ml_timeseries">Time Series Basics</a>, and <a class="xref" data-note="de_spark">Apache Spark</a> when one machine is not enough.</span></li>
  </ol>

  <h2 id="pdm-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole group as one chain of needs. Each step answers the question above it; its weakness raises the next question. Numbers come from the running example (section 01). If you can retell this list in your own words, you know how pandas fits together.</p>
  <ol class="story">
    <li><b>A table of mixed columns</b><span>Q: how do we hold "order 101, Asha, Dosa Hut, Pune, 2 March 12:10, ₹240, 32 minutes" for every order? → A list of dicts works, but "Pune revenue" needs a hand-written loop, and so does every other question. NumPy is fast, but one array has one type… <a class="xref" data-note="da_pd_basics">Basics</a></span></li>
    <li><b>Series &amp; DataFrame, with an index</b><span>Q: how do we get NumPy speed on columns of different types, and keep track of which value belongs to which row? → A <strong>Series</strong> is one labelled column; a <strong>DataFrame</strong> is Series sharing one row index. <code>read_csv</code> gives 12 rows × 7 columns, each column with its own dtype. But a table is only useful if we can ask for part of it… <a class="xref" data-note="da_pd_basics">Basics</a></span></li>
    <li><b>Pick rows and columns</b><span>Q: "orders above ₹500, show who and how much"? → <code>loc</code> (by label), <code>iloc</code> (by position) and boolean masks: orders 103, 109, 111. But "Pune orders" misses order 104, because its city is typed " pune"… <a class="xref" data-note="da_pd_basics">Basics</a></span></li>
    <li><b>Fix messy data</b><span>Q: how do we trust the table? → Find blanks (<code>isna</code>), decide drop or fill, remove the duplicate row (12 → 11), fix types ("28 min" → 28), tidy text (" pune" → Pune), flag the impossible 240-minute delivery. Now the numbers are right, but they are still one row per order… <a class="xref" data-note="da_pd_cleaning">Cleaning</a></span></li>
    <li><b>Summarise by group</b><span>Q: revenue per city? → <code>groupby</code>: split, apply, combine. Mumbai ₹2,060 from 5 orders (one amount unknown), Pune ₹1,870 from 6. But cuisine is not in the orders table at all… <a class="xref" data-note="da_pd_groupby">GroupBy</a></span></li>
    <li><b>Combine tables</b><span>Q: revenue per cuisine? → <code>merge</code> orders with restaurants: Biryani ₹1,430, Pizza ₹1,220… and one order (Momo Magic) has no restaurant row. A duplicate key would silently double rows (the fan-out trap). The result is long; the manager wants a grid… <a class="xref" data-note="da_pd_groupby">Merge</a></span></li>
    <li><b>Reshape</b><span>Q: days down the side, cities across? → <code>pivot_table</code> (long → wide) and <code>melt</code> (wide → long). Monday: Mumbai 450, Pune 760. But "is revenue going up?" is a question about time, not about categories… <a class="xref" data-note="da_pd_groupby">Reshape</a></span></li>
    <li><b>Time-indexed data</b><span>Q: daily revenue, its 3-day average, change from yesterday? → A <code>DatetimeIndex</code> with <code>resample</code>, <code>rolling</code>, <code>shift</code>: 1210, 690, 180, 860, 990; 3-day average 693.3 on Wednesday. On 11 rows everything is instant; on 1,000,000 rows the wrong habits take seconds and gigabytes… <a class="xref" data-note="da_pd_time">Time Series</a></span></li>
    <li><b>Make it fast</b><span>Q: how do we keep it quick and small at scale? → Vectorise instead of looping (over 1,000× faster than <code>iterrows</code> on 100,000 rows), use <code>category</code> and smaller dtypes (75.5 MB → 28.0 MB on a million orders), chain methods, and know when to hand over to DuckDB, Polars or Spark. <a class="xref" data-note="da_pd_time">Performance</a></span></li>
  </ol>

  <h2 id="pdm-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Pandas</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Basics &amp; Selection</div>
        <ul>
          <li><b>Series</b> = values + index; <b>DataFrame</b> = Series sharing an index</li>
          <li>Arithmetic aligns by <b>label</b>, not position</li>
          <li>One dtype per column; <code>read_csv</code>, Parquet keeps types</li>
          <li><code>loc</code> labels (end included) · <code>iloc</code> positions (end excluded) · masks · <code>query</code></li>
          <li>⚠ chained assignment never writes (Copy-on-Write, pandas 3)</li>
          <li>💡 a register where every column is one kind of fact</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cleaning</div>
        <ul>
          <li>Missing: NaN / None / <code>pd.NA</code>; find with <code>isna</code></li>
          <li><code>dropna</code> vs <code>fillna</code> vs <code>interpolate</code>: decide by meaning</li>
          <li><code>drop_duplicates</code>; <code>to_numeric(errors="coerce")</code>; <code>to_datetime(format=…)</code></li>
          <li><code>.str</code> methods; <code>category</code>; outliers by IQR</li>
          <li>Biteful: 12 rows → 11; " pune" → Pune; "28 min" → 28</li>
          <li>⚠ NaN == NaN is False; filling invents data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GroupBy, Merge, Reshape</div>
        <ul>
          <li>Split → apply → combine; <code>agg</code> / <code>transform</code> / <code>filter</code></li>
          <li>Mumbai 2060 (size 5, count 4), Pune 1870</li>
          <li><code>merge(how=inner/left/right/outer)</code>, <code>validate=</code></li>
          <li>⚠ fan-out: a duplicate key multiplies rows (11 → 14)</li>
          <li><code>pivot_table</code> ↔ <code>melt</code>; <code>stack</code>/<code>unstack</code>; <code>crosstab</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Time &amp; Performance</div>
        <ul>
          <li><code>DatetimeIndex</code>; <code>.dt</code>; <code>loc["2026-03-03"]</code></li>
          <li><code>resample</code> (buckets) vs <code>rolling</code> (sliding) vs <code>expanding</code> (growing)</li>
          <li><code>shift</code> / <code>diff</code> / <code>pct_change</code>; rank and cumsum per group</li>
          <li>Vectorise: ~2 ms vs 2–3 s <code>iterrows</code> (100k rows)</li>
          <li><code>category</code> + downcast: 75.5 → 28.0 MB</li>
          <li>Too big? DuckDB, Polars, Spark</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The running example</div>
        <ul>
          <li>Biteful, 2–6 March 2026, Pune and Mumbai</li>
          <li><code>orders</code>: 12 raw rows (1 duplicate, messy city, "28 min", "unknown", a 240, a blank amount)</li>
          <li><code>restaurants</code>: 5 rows (Tandoor Tales has no orders; Momo Magic is missing)</li>
          <li><code>customers</code>: 6 rows (Gita never ordered; Farah has no profile)</li>
          <li>Generated 200k–1M rows: "the same idea at scale"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading order</div>
        <ul>
          <li>This map → Basics → Cleaning → GroupBy → Time</li>
          <li>Each note starts with the question the last one left open</li>
          <li>After: Descriptive Stats, Visualisation, SQL, Features, Spark</li>
          <li>⚠ do not skip Cleaning: every later total depends on it</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdm-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The group as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-week"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Week at Biteful</span><span class="rm-sub">The running example</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-chain"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Need Chain</span><span class="rm-sub">Eight steps, one script</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-vs"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Pandas vs What You Know</span><span class="rm-sub">Lists, NumPy, SQL, Excel</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-read"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Reading Order</span><span class="rm-sub">The four notes and after</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-connect"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-traps"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ones that cost hours</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The group in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pdm-qa"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pdm-week"><span class="num">01</span>One Week at Biteful</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In <a class="xref" data-note="py_ds">Python Collections</a> one morning of six orders fitted in a list of tuples. A real business exports thousands of rows from its app every day, as a file, with mistakes in it. What does such a table look like, and what will we want to ask of it?</p>
  </div>
  <h3>The running example</h3>
  <p>Biteful is a small food-delivery company in Pune and Mumbai. Its app exports one row per order. Below is the export for Monday 2 to Friday 6 March 2026: 12 rows, small enough to check every number by hand, and messy in the ways real exports are messy. The same three tables are used in every note of this group, so you can watch the same numbers come back, each time computed by a new tool.</p>
  <table class="tbl"><caption>orders (raw export, 12 rows)</caption>
    <tr><th>order_id</th><th>customer</th><th>restaurant</th><th>city</th><th>order_time</th><th>amount ₹</th><th>delivery_minutes</th></tr>
    <tr><td>101</td><td>Asha</td><td>Dosa Hut</td><td>Pune</td><td>2026-03-02 12:10</td><td>240</td><td>32</td></tr>
    <tr><td>102</td><td>Ben</td><td>Biryani Bros</td><td>Mumbai</td><td>2026-03-02 13:05</td><td>450</td><td>41</td></tr>
    <tr><td>103</td><td>Chen</td><td>Pizza Point</td><td>Pune</td><td>2026-03-02 20:30</td><td>520</td><td>38</td></tr>
    <tr><td>104</td><td>Asha</td><td>Biryani Bros</td><td><b>" pune"</b></td><td>2026-03-03 13:15</td><td>380</td><td><b>(blank)</b></td></tr>
    <tr><td>105</td><td>Dia</td><td>Green Bowl</td><td><b>MUMBAI</b></td><td>2026-03-03 19:45</td><td>310</td><td><b>28 min</b></td></tr>
    <tr><td>105</td><td>Dia</td><td>Green Bowl</td><td>MUMBAI</td><td>2026-03-03 19:45</td><td>310</td><td>28 min <b>(duplicate row)</b></td></tr>
    <tr><td>106</td><td>Ben</td><td>Dosa Hut</td><td>Pune</td><td>2026-03-04 12:40</td><td>180</td><td>25</td></tr>
    <tr><td>107</td><td>Esha</td><td>Pizza Point</td><td>Mumbai</td><td>2026-03-04 21:10</td><td><b>(blank)</b></td><td>45</td></tr>
    <tr><td>108</td><td>Chen</td><td>Momo Magic</td><td>Pune</td><td>2026-03-05 18:20</td><td>260</td><td><b>240</b></td></tr>
    <tr><td>109</td><td>Farah</td><td>Biryani Bros</td><td>Mumbai</td><td>2026-03-05 20:05</td><td>600</td><td>52</td></tr>
    <tr><td>110</td><td>Asha</td><td>Green Bowl</td><td>Pune</td><td>2026-03-06 13:00</td><td>290</td><td><b>unknown</b></td></tr>
    <tr><td>111</td><td>Dia</td><td>Pizza Point</td><td>Mumbai</td><td>2026-03-06 20:50</td><td>700</td><td>35</td></tr>
  </table>
  <table class="tbl"><caption>The two lookup tables</caption>
    <tr><th>restaurants (restaurant, cuisine, rating)</th><th>customers (customer, plan, signup_date as typed)</th></tr>
    <tr><td>Dosa Hut, South Indian, 4.4 · Biryani Bros, Biryani, 4.1 · Pizza Point, Pizza, 3.9 · Green Bowl, Salads, 4.6 · Tandoor Tales, North Indian, 4.2</td><td>Asha, gold, 04/01/2025 · Ben, free, 13/06/2025 · Chen, gold, 22/11/2024 · Dia, free, unknown · Esha, free, 09/02/2026 · Gita, gold, 30/12/2025</td></tr>
  </table>
  <p>The mess is deliberate, and each piece is fixed in a specific note: a duplicate row (order 105 twice), the same city spelt three ways, a blank amount (order 107: the order happened but the amount was not logged), delivery minutes typed as text ("28 min", "unknown"), an impossible 240-minute delivery, a restaurant with no row in the restaurants table (Momo Magic), a restaurant with no orders (Tandoor Tales), a customer who never ordered (Gita), a customer with no profile (Farah), and dates typed day-first.</p>
  <h3>The owner's questions</h3>
  <ul>
    <li>How many orders, and which were above ₹500? (<strong>a table you can select from</strong>)</li>
    <li>Can I trust these numbers? (<strong>cleaning</strong>)</li>
    <li>Which city earns more? Which cuisine? (<strong>groupby</strong> and <strong>merge</strong>)</li>
    <li>Show me a grid of days × cities. (<strong>reshape</strong>)</li>
    <li>Is revenue going up or down this week? (<strong>time series</strong>)</li>
    <li>Will all this still work on the full year, a million rows? (<strong>performance</strong>)</li>
  </ul>
  <h3>The tables as code</h3>
  <p>All four notes start from these same lines. <code>RAW</code> is the CSV text exactly as the app exported it; the two lookup tables are small enough to type as dicts of lists:</p>
  <div class="fx" data-lang="py">import io
import numpy as np
import pandas as pd
pd.set_option("display.width", 120, "display.max_columns", None)
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
restaurants = pd.DataFrame({
    "restaurant": ["Dosa Hut", "Biryani Bros", "Pizza Point", "Green Bowl", "Tandoor Tales"],
    "cuisine":    ["South Indian", "Biryani", "Pizza", "Salads", "North Indian"],
    "rating":     [4.4, 4.1, 3.9, 4.6, 4.2],
})
customers = pd.DataFrame({
    "customer":    ["Asha", "Ben", "Chen", "Dia", "Esha", "Gita"],
    "plan":        ["gold", "free", "gold", "free", "free", "gold"],
    "signup_date": ["04/01/2025", "13/06/2025", "22/11/2024", "unknown", "09/02/2026", "30/12/2025"],
})</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A DataFrame is the order register at a restaurant counter: every line is one order (a row), every column is one kind of fact (who, where, when, how much), and the line numbers on the left (the index) let you point at a line without reading it.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Pandas</strong> is a Python library for labelled, column-typed tables. Its two objects are the <strong>Series</strong> (a one-dimensional array with an index of labels) and the <strong>DataFrame</strong> (a two-dimensional table: columns are Series that share one row index). Each column is stored as one typed array (NumPy or Arrow) underneath.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Do not trust a table because it loaded without an error. This file loads cleanly and still has a duplicate, three spellings of two cities and numbers stored as text. The second note exists because loading is not the same as being right.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Need Chain.</b> We have the data and the questions. Which pandas tool answers which question, and why do they come in this order?</div>

  <h2 id="pdm-chain"><span class="num">02</span>The Need Chain: Eight Steps, One Script</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pandas has hundreds of functions. Learners often meet them as a list to memorise. The better question is: which problem does each group of functions solve that the previous one could not? Walk the chain on the Biteful data, one short step at a time. Do not worry about every detail of the code; each line is taught in a child note.</p>
  </div>
  <h3>Step 1: a table of mixed columns → DataFrame with an index</h3>
  <div class="fx" data-lang="py">orders = pd.read_csv(io.StringIO(RAW), parse_dates=["order_time"])     # 1 a table with an index
print(orders.shape, "| amount is", orders["amount"].dtype, "| delivery_minutes is", orders["delivery_minutes"].dtype)</div>
  <div class="fx" data-lang="text">(12, 7) | amount is float64 | delivery_minutes is str</div>
  <p>One call turns the CSV text into a table of 12 rows and 7 columns, each column with its own type. Already two warnings: <code>amount</code> is <code>float64</code> (decimals) although we typed whole rupees, because one amount is blank, and <code>delivery_minutes</code> is <code>str</code> (text), because of "28 min" and "unknown". <em>New need:</em> ask for part of the table. → <a class="xref" data-note="da_pd_basics">Basics</a></p>
  <h3>Step 2: pick rows and columns → loc, iloc, masks</h3>
  <div class="fx" data-lang="py">print(orders.loc[orders["amount"] &gt; 500, ["order_id", "customer", "amount"]])   # 2 pick rows/columns</div>
  <div class="fx" data-lang="text">    order_id customer  amount
2        103     Chen   520.0
9        109    Farah   600.0
11       111      Dia   700.0</div>
  <p><code>orders["amount"] &gt; 500</code> makes a True/False per row (a <strong>mask</strong>); <code>loc</code> keeps the True rows and the named columns. Three orders: 103, 109, 111. The numbers on the left are the index labels, still attached to their rows. <em>New weakness:</em> try the same with <code>city == "Pune"</code> and order 104 (" pune") is silently missed. → <a class="xref" data-note="da_pd_basics">Basics</a></p>
  <h3>Step 3: fix messy data → cleaning</h3>
  <div class="fx" data-lang="py">clean = orders.drop_duplicates().assign(                                # 3 fix messy data
    city=lambda d: d["city"].str.strip().str.title(),
    delivery_minutes=lambda d: pd.to_numeric(d["delivery_minutes"].str.extract(r"(\\d+)", expand=False)))
clean.loc[clean["delivery_minutes"] &gt; 120, "delivery_minutes"] = np.nan
print(len(orders), "-&gt;", len(clean), "rows | cities:", sorted(clean["city"].unique()))</div>
  <div class="fx" data-lang="text">12 -&gt; 11 rows | cities: ['Mumbai', 'Pune']</div>
  <p>Drop the exact duplicate (12 → 11 rows), trim and capitalise the city (" pune" and "MUMBAI" become Pune and Mumbai, so 2 cities instead of 4 spellings), pull the digits out of "28 min" and turn them into numbers ("unknown" becomes missing), and blank the impossible 240-minute delivery. The blank amount of order 107 is left blank on purpose: the order is real, its amount is unknown, and inventing one would invent revenue. → <a class="xref" data-note="da_pd_cleaning">Cleaning</a></p>
  <h3>Step 4: summarise by group → groupby</h3>
  <div class="fx" data-lang="py">print(clean.groupby("city")["amount"].agg(["size", "count", "sum"]))   # 4 summarise by group</div>
  <div class="fx" data-lang="text">        size  count     sum
city                       
Mumbai     5      4  2060.0
Pune       6      6  1870.0</div>
  <p>Split the rows into a Mumbai pile and a Pune pile, total each, and combine the totals into one small table. Mumbai: 450 + 310 + 600 + 700 = 2060 from 5 orders, but only 4 amounts are known (<code>size</code> counts rows, <code>count</code> counts known values). Pune: 240 + 520 + 380 + 180 + 260 + 290 = 1870. <em>New weakness:</em> "per cuisine" is impossible, because cuisine lives in another table. → <a class="xref" data-note="da_pd_groupby">GroupBy</a></p>
  <h3>Step 5: combine tables → merge</h3>
  <div class="fx" data-lang="py">m = clean.merge(restaurants, on="restaurant", how="left", validate="many_to_one")   # 5 combine tables
print(m.groupby("cuisine", dropna=False)["amount"].sum().sort_values(ascending=False))</div>
  <div class="fx" data-lang="text">cuisine
Biryani         1430.0
Pizza           1220.0
Salads           600.0
South Indian     420.0
NaN              260.0
Name: amount, dtype: float64</div>
  <p>A left merge looks up each order's restaurant in the restaurants table and copies its cuisine onto the order. Biryani: 450 + 380 + 600 = 1430. Momo Magic has no restaurant row, so its ₹260 lands under NaN (unknown cuisine); that is a real finding about the data, not a bug. <code>validate="many_to_one"</code> makes pandas refuse if a restaurant were listed twice (the fan-out trap). → <a class="xref" data-note="da_pd_groupby">Merge</a></p>
  <h3>Step 6: reshape → pivot_table and melt</h3>
  <div class="fx" data-lang="py">print(clean.pivot_table(index=clean["order_time"].dt.strftime("%m-%d %a"),          # 6 reshape
                        columns="city", values="amount", aggfunc="sum", fill_value=0))</div>
  <div class="fx" data-lang="text">city        Mumbai   Pune
order_time               
03-02 Mon    450.0  760.0
03-03 Tue    310.0  380.0
03-04 Wed      0.0  180.0
03-05 Thu    600.0  260.0
03-06 Fri    700.0  290.0</div>
  <p>Days down the side, cities across, revenue in the cells: Monday Pune = 240 + 520 = 760. Wednesday Mumbai shows 0.0 although Esha did order: her amount is unknown, and a sum of nothing is 0. Grids like this hide gaps, which is why the groupby note shows <code>size</code> next to <code>sum</code>. → <a class="xref" data-note="da_pd_groupby">Reshape</a></p>
  <h3>Step 7: time-indexed data → resample and rolling</h3>
  <div class="fx" data-lang="py">daily = clean.set_index("order_time")["amount"].resample("D").sum()                  # 7 time-indexed
print(pd.DataFrame({"revenue": daily, "3-day avg": daily.rolling(3).mean().round(1)}))</div>
  <div class="fx" data-lang="text">            revenue  3-day avg
order_time                    
2026-03-02   1210.0        NaN
2026-03-03    690.0        NaN
2026-03-04    180.0      693.3
2026-03-05    860.0      576.7
2026-03-06    990.0      676.7</div>
  <p>With the order time as the index, <code>resample("D")</code> makes one bucket per calendar day (1210 = 240 + 450 + 520 on Monday), and <code>rolling(3)</code> averages each day with the two before it: (1210 + 690 + 180) / 3 = 693.3. The first two days have no full 3-day window, so NaN. → <a class="xref" data-note="da_pd_time">Time Series</a></p>
  <h3>Step 8: make it fast → vectorise, smaller types</h3>
  <div class="fx" data-lang="py">fee = clean["amount"] + np.where(clean["city"] == "Pune", 30, 40)                    # 8 fast: no loops
print(fee.tolist())</div>
  <div class="fx" data-lang="text">[270.0, 490.0, 550.0, 410.0, 350.0, 210.0, nan, 290.0, 640.0, 320.0, 740.0]</div>
  <p>A delivery fee of ₹30 in Pune and ₹40 in Mumbai, added to all 11 orders in one expression with no Python loop. On 11 rows any method is instant. On 100,000 rows this vectorised line takes about 2 ms, where a row-by-row <code>iterrows</code> loop takes 2–3 s, and on a million orders the right dtypes cut memory from 75.5 MB to 28.0 MB (both measured in <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>).</p>
  <div class="flow"><span>table + index</span><span>pick</span><span>fix</span><span>group</span><span>combine</span><span>reshape</span><span>time</span><span>fast</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>An accountant with a box of receipts: first lay them out in a ledger (DataFrame), find the ones you need (select), throw out the duplicates and fix the smudged ones (clean), total them by branch (group), staple on the supplier details (merge), draw the monthly summary grid (reshape), plot the weekly trend (time), and finally hire a faster clerk when the box becomes a warehouse (performance).</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The chain in one line each. <strong>DataFrame</strong>: labelled, column-typed table. <strong>Selection</strong>: <code>loc</code> by label, <code>iloc</code> by position, masks by condition. <strong>Cleaning</strong>: making missing values, duplicates, types and text trustworthy. <strong>GroupBy</strong>: split-apply-combine. <strong>Merge</strong>: SQL-style join on key columns. <strong>Reshape</strong>: long ↔ wide. <strong>Time series</strong>: data indexed by timestamps, with buckets and windows. <strong>Performance</strong>: vectorised column operations and compact dtypes.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The order matters. Grouping before cleaning gives four "cities" (Pune, Mumbai, MUMBAI, " pune") and counts the duplicate twice; merging before checking keys can double revenue. Most wrong pandas answers come from doing a later step before an earlier one.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Pandas vs What You Know.</b> We used pandas without saying what it adds to lists, dicts, NumPy, SQL and Excel. Knowing that tells you when to reach for it, and when not to.</div>

  <h2 id="pdm-vs"><span class="num">03</span>Pandas vs What You Know</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You already know several ways to hold a table: a list of dicts, a NumPy array, a SQL table, a spreadsheet. What exactly does pandas add, and where is each of the others still the better tool?</p>
  </div>
  <table class="tbl"><caption>The same Biteful orders in five tools</caption>
    <tr><th></th><th>list of dicts</th><th>NumPy array</th><th>pandas DataFrame</th><th>SQL table</th><th>Excel sheet</th></tr>
    <tr><td>Mixed column types</td><td>yes</td><td>no (one dtype)</td><td>yes, one dtype per column</td><td>yes</td><td>yes (per cell)</td></tr>
    <tr><td>Row labels / index</td><td>no</td><td>positions only</td><td>yes, drives alignment</td><td>primary key</td><td>row numbers</td></tr>
    <tr><td>Speed of column maths</td><td>slow (Python loop)</td><td>fast (C)</td><td>fast (NumPy/Arrow)</td><td>fast (engine)</td><td>slow-ish</td></tr>
    <tr><td>Missing values</td><td>None, by hand</td><td>NaN for floats only</td><td>NaN / NA everywhere, skipped by sums</td><td>NULL</td><td>blank cell</td></tr>
    <tr><td>Group, join, pivot</td><td>hand-written loops</td><td>no</td><td>built in</td><td>GROUP BY, JOIN</td><td>pivot tables, VLOOKUP</td></tr>
    <tr><td>Size limit</td><td>RAM, inefficiently</td><td>RAM</td><td>RAM (needs 2–5× the data size)</td><td>disk</td><td>about 1M rows</td></tr>
    <tr><td>Best for</td><td>JSON, small records</td><td>pure numbers, maths</td><td>analysis in Python up to a few GB</td><td>shared, persistent data</td><td>people looking at data</td></tr>
  </table>
  <p>Three ideas in that table carry the whole group:</p>
  <ul>
    <li><strong>One type per column.</strong> Because a column is one typed array, pandas can run maths on the whole column at C speed, like NumPy. That is why <code>amount</code> must be numbers, not text, and why cleaning comes before analysis.</li>
    <li><strong>The index.</strong> Rows have labels that survive filtering and sorting, and arithmetic between two Series matches labels, not positions. That is why <code>loc</code> and <code>iloc</code> differ, and why <code>groupby</code> results come back indexed by the group key.</li>
    <li><strong>Vectorised operations.</strong> You describe what happens to a column, not to each row. That is why <code>apply</code> with a Python function is slow and why the performance section is mostly "remove the loop".</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>A list of dicts is a stack of index cards: flexible but slow to total. A NumPy array is a calculator tape: fast but numbers only. Pandas is a ledger with typed columns and numbered lines. SQL is the company's filing room. Excel is the whiteboard in the meeting room.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>dtype</strong>: the data type of a column (<code>int64</code>, <code>float64</code>, <code>str</code>, <code>datetime64</code>, <code>category</code>, <code>bool</code>). <strong>Index</strong>: the row labels of a Series or DataFrame. <strong>Vectorised</strong>: one operation applied to a whole array at once, executed in compiled code instead of a Python loop.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Pandas is not a database. It holds everything in memory, keeps nothing after the program ends unless you write a file, and is single-machine. For data shared by many people use SQL; for data bigger than memory use DuckDB, Polars or Spark (<a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>, section on scaling out).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Order.</b> The map is drawn. Where do we go to learn each part completely, and in which order?</div>

  <h2 id="pdm-read"><span class="num">04</span>Reading Order: The Four Notes and After</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each step of the chain has far more to it than one line of code: alignment rules, copy rules, missing-value rules, join rules. Which note teaches what, and why in this order?</p>
  </div>
  <h3>1. Series, DataFrames &amp; Selection</h3>
  <p><a class="xref" data-note="da_pd_basics">Basics</a> starts from the list of dicts and shows why a table object is needed. It teaches the Series as a labelled array (adding two Series with different indexes, traced), DataFrame anatomy and dtypes, reading CSV and Parquet (measured: Parquet reads 2 columns of 200,000 rows ten or more times faster), <code>head</code>/<code>info</code>/<code>describe</code>, <code>[]</code> vs <code>loc</code> vs <code>iloc</code> traced, masks and <code>query</code>, the chained-assignment trap and Copy-on-Write, <code>assign</code>, and <code>apply</code> vs vectorised.</p>
  <h3>2. Cleaning &amp; Missing Data</h3>
  <p><a class="xref" data-note="da_pd_cleaning">Cleaning</a> takes the raw export and fixes it step by step: NaN vs None vs NA, <code>isna</code>, when to drop, fill or interpolate (with the cost of each on our totals), duplicates, <code>to_numeric(errors="coerce")</code> and <code>to_datetime(format=…)</code>, <code>.str</code> methods, categoricals, outliers by IQR (link <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>), and a reusable cleaning function run on 200,000 messy rows.</p>
  <h3>3. GroupBy, Merge &amp; Reshape</h3>
  <p><a class="xref" data-note="da_pd_groupby">GroupBy</a> traces split-apply-combine by hand on the 11 clean rows, contrasts <code>agg</code>, <code>transform</code> and <code>filter</code>, uses named aggregations, traces every join type with the restaurants and customers tables, shows the fan-out trap (11 → 14 rows, revenue 3930 → 5150) and <code>validate=</code>, then <code>concat</code>, <code>pivot_table</code> vs <code>pivot</code> vs <code>melt</code> vs <code>stack</code>/<code>unstack</code>, and <code>crosstab</code>. Links to <a class="xref" data-note="sql_joins">SQL JOINs</a>.</p>
  <h3>4. Time Series &amp; Performance</h3>
  <p><a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a> makes the order time the index: <code>resample</code> vs <code>rolling</code> vs <code>expanding</code>, <code>shift</code>/<code>diff</code>/<code>pct_change</code>, time zones, rank and running totals per group (link <a class="xref" data-note="sql_windows">Window Functions</a>), then speed and memory on a million generated orders, measured: dtypes and <code>category</code>, vectorisation vs <code>apply</code> vs <code>iterrows</code>, method chaining, and when to move to Polars, DuckDB or Spark.</p>
  <h3>After the group</h3>
  <ul>
    <li><a class="xref" data-note="st_descriptive">Descriptive Statistics</a>: what the numbers you can now compute (means, medians, spreads, IQR) actually tell you.</li>
    <li><a class="xref" data-note="da_viz">Visualisation</a>: plotting the grouped and time-indexed tables you built.</li>
    <li><a class="xref" data-note="sql_joins">SQL JOINs</a> and <a class="xref" data-note="sql_windows">Window Functions</a>: the same merge, group and window ideas inside a database.</li>
    <li><a class="xref" data-note="ml_features">Feature Engineering</a> and <a class="xref" data-note="ml_timeseries">Time Series Basics</a>: cleaning and lag features become model inputs.</li>
    <li><a class="xref" data-note="de_spark">Apache Spark</a>: DataFrames spread over many machines when one is not enough.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Learning pandas in this order is like learning to cook: first know your ingredients and knives (basics), then wash and cut (cleaning), then combine and season (group, merge, reshape), and only then learn timing and doing it for a hundred guests (time and performance).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Reading order</strong>: da_pandas (this map) → da_pd_basics → da_pd_cleaning → da_pd_groupby → da_pd_time. Each note's first section names what it needs from the one before.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Jumping straight to groupby and merge without the basics leaves "index" and "alignment" as magic words, and every surprising NaN after a merge or a Series addition looks like a bug. Skipping cleaning gives confident, wrong totals.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture and one table to hold the whole group together.</div>

  <h2 id="pdm-connect"><span class="num">05</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Eight steps, four notes. Which step is built on which, and which answers which of the owner's questions?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="pdm-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="230" y="8" width="200" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="26" text-anchor="middle" font-size="11.5" font-weight="700">typed columns + an index</text><text x="330" y="41" text-anchor="middle" class="tm" font-size="10">Series · DataFrame (Basics)</text>
<line x1="330" y1="48" x2="330" y2="68" stroke="currentColor" marker-end="url(#pdm-a9)"/>
<rect x="60" y="70" width="250" height="40" rx="7" class="fb sb"/><text x="185" y="88" text-anchor="middle" font-size="11.5" font-weight="700">select: loc · iloc · masks</text><text x="185" y="103" text-anchor="middle" class="tm" font-size="10">needs the index (Basics)</text>
<rect x="350" y="70" width="250" height="40" rx="7" class="fb sb"/><text x="475" y="88" text-anchor="middle" font-size="11.5" font-weight="700">clean: NaN · types · text · dups</text><text x="475" y="103" text-anchor="middle" class="tm" font-size="10">needs dtypes + masks (Cleaning)</text>
<line x1="310" y1="90" x2="348" y2="90" stroke="currentColor" marker-end="url(#pdm-a9)"/>
<line x1="475" y1="110" x2="475" y2="134" stroke="currentColor" marker-end="url(#pdm-a9)"/>
<rect x="40" y="136" width="180" height="40" rx="7" class="ft st"/><text x="130" y="154" text-anchor="middle" font-size="11.5" font-weight="700">groupby</text><text x="130" y="169" text-anchor="middle" class="tm" font-size="10">split-apply-combine</text>
<rect x="240" y="136" width="180" height="40" rx="7" class="ft st"/><text x="330" y="154" text-anchor="middle" font-size="11.5" font-weight="700">merge / concat</text><text x="330" y="169" text-anchor="middle" class="tm" font-size="10">keys must be clean + unique</text>
<rect x="440" y="136" width="180" height="40" rx="7" class="ft st"/><text x="530" y="154" text-anchor="middle" font-size="11.5" font-weight="700">reshape</text><text x="530" y="169" text-anchor="middle" class="tm" font-size="10">pivot_table = group + unstack</text>
<line x1="420" y1="120" x2="140" y2="134" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdm-a9)"/><line x1="440" y1="120" x2="335" y2="134" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdm-a9)"/>
<line x1="220" y1="156" x2="238" y2="156" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdm-a9)"/><line x1="420" y1="156" x2="438" y2="156" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdm-a9)"/>
<rect x="110" y="208" width="200" height="40" rx="7" class="fg sg"/><text x="210" y="226" text-anchor="middle" font-size="11.5" font-weight="700">time: resample · rolling · shift</text><text x="210" y="241" text-anchor="middle" class="tm" font-size="10">groupby by time + windows</text>
<rect x="350" y="208" width="200" height="40" rx="7" class="fg sg"/><text x="450" y="226" text-anchor="middle" font-size="11.5" font-weight="700">performance</text><text x="450" y="241" text-anchor="middle" class="tm" font-size="10">vectorise · dtypes · category</text>
<line x1="130" y1="176" x2="190" y2="206" stroke="currentColor" marker-end="url(#pdm-a9)"/><line x1="530" y1="176" x2="470" y2="206" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdm-a9)"/>
<line x1="310" y1="228" x2="348" y2="228" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdm-a9)"/>
<text x="330" y="280" text-anchor="middle" class="tm" font-size="10.5">every arrow is a dependency: a later tool gives wrong answers if the earlier step was skipped</text>
</svg><figcaption>The group as a dependency picture. Typed columns and the index make selection possible; selection and dtypes make cleaning possible; clean keys make grouping, merging and reshaping correct; grouping by time plus sliding windows is time-series work; and the dtypes chosen during cleaning decide how fast and small everything is.</figcaption></figure>
  <table class="tbl"><caption>Every step on one week at Biteful</caption>
    <tr><th>Step</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>DataFrame + index</td><td>NumPy arrays + labels</td><td>hold a mixed table?</td><td>12 rows × 7 columns; amount float64, minutes str</td><td>always, first</td></tr>
    <tr><td>Selection</td><td>index + boolean masks</td><td>which rows, which columns?</td><td>amount &gt; 500 → 103, 109, 111</td><td>every question</td></tr>
    <tr><td>Cleaning</td><td>masks + dtypes + .str</td><td>can I trust it?</td><td>12 → 11 rows; 4 city spellings → 2; 240 min removed</td><td>before any total</td></tr>
    <tr><td>GroupBy</td><td>clean keys + aggregations</td><td>total per category?</td><td>Mumbai 2060 (5 orders, 4 amounts), Pune 1870</td><td>summaries, KPIs</td></tr>
    <tr><td>Merge</td><td>clean, unique keys</td><td>facts from another table?</td><td>Biryani 1430, Pizza 1220; Momo Magic → NaN</td><td>lookups, enrichment</td></tr>
    <tr><td>Reshape</td><td>groupby + unstack</td><td>a grid for people?</td><td>Mon: Mumbai 450, Pune 760</td><td>reports, plotting</td></tr>
    <tr><td>Time series</td><td>DatetimeIndex + groupby + windows</td><td>trend, change, smoothing?</td><td>daily 1210, 690, 180, 860, 990; 3-day avg 693.3</td><td>anything over time</td></tr>
    <tr><td>Performance</td><td>vectorised ops + compact dtypes</td><td>will it scale?</td><td>2 ms vs 2–3 s; 75.5 → 28.0 MB on 1M rows</td><td>large data, repeated jobs</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the group: <strong>a DataFrame is typed columns sharing an index, and every pandas tool is either choosing rows by that index, making the columns' types and values trustworthy, or turning many rows into fewer rows by a key (a group, another table, a time bucket).</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The usual ways people get wrong answers from pandas, and the note that fixes each.</div>

  <h2 id="pdm-traps"><span class="num">06</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which mistakes cost the most time or give confidently wrong numbers, and how do you recognise each one?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: analysing before cleaning</span><p>Grouping on raw city text gives Pune, Mumbai, MUMBAI and " pune" as four groups; the duplicate order is counted twice. Clean first (<a class="xref" data-note="da_pd_cleaning">Cleaning</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: loc vs iloc confusion</span><p><code>loc[102:104]</code> includes 104 (labels, end included); <code>iloc[1:3]</code> excludes position 3. After a sort or filter, labels and positions no longer match (<a class="xref" data-note="da_pd_basics">Basics</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: chained assignment</span><p><code>df[mask]["col"] = v</code> writes into a temporary copy and changes nothing. Use <code>df.loc[mask, "col"] = v</code> (<a class="xref" data-note="da_pd_basics">Basics</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: silently filling missing values</span><p><code>fillna(0)</code> on order 107's amount drags the mean from 393.0 to 357.3; filling with the restaurant median invents ₹610 of revenue (<a class="xref" data-note="da_pd_cleaning">Cleaning</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: merge fan-out</span><p>A restaurant listed twice turns 11 orders into 14 rows and revenue 3930 into 5150. Pass <code>validate=</code> and compare <code>len()</code> before and after (<a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: pivot_table's default is the mean</span><p>Forget <code>aggfunc="sum"</code> and you get averages where you expected totals (<a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: windows on unsorted rows</span><p><code>shift</code>, <code>diff</code>, <code>rolling</code> and <code>cumcount</code> follow row order, not time. Sort by time first (<a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>).</p></div>
  <div class="callout trap"><span class="label">Trap: row loops</span><p><code>iterrows</code> and <code>apply(axis=1)</code> run Python once per row; on 100,000 rows that is seconds instead of milliseconds (<a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole group on one page.</div>

  <h2 id="pdm-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole group on one sheet. Running example: Biteful, a food-delivery company, orders from Monday 2 to Friday 6 March 2026 in Pune and Mumbai. Raw export: 12 rows (order 105 duplicated), columns order_id, customer, restaurant, city, order_time, amount, delivery_minutes. After cleaning: 11 orders, amounts 240, 450, 520, 380, 310, 180, (blank), 260, 600, 290, 700 (total 3930). Plus a restaurants table (5 rows, cuisine and rating) and a customers table (6 rows, plan and signup date).</p>
  <h3>The need chain</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Question it answers</th><th>On our data</th><th>Weakness → next</th><th>Note</th></tr>
    <tr><td>DataFrame + index</td><td>hold a mixed table?</td><td>12 × 7; amount float64, minutes str</td><td>we need parts of it</td><td>Basics</td></tr>
    <tr><td>Selection</td><td>which rows/columns?</td><td>&gt; ₹500: 103, 109, 111</td><td>" pune" is missed</td><td>Basics</td></tr>
    <tr><td>Cleaning</td><td>can I trust it?</td><td>11 rows, 2 cities, 240 min removed</td><td>still one row per order</td><td>Cleaning</td></tr>
    <tr><td>GroupBy</td><td>total per group?</td><td>Mumbai 2060, Pune 1870</td><td>cuisine is in another table</td><td>GroupBy</td></tr>
    <tr><td>Merge</td><td>facts from another table?</td><td>Biryani 1430; Momo Magic NaN</td><td>result is long</td><td>GroupBy</td></tr>
    <tr><td>Reshape</td><td>a grid?</td><td>Mon: Mumbai 450, Pune 760</td><td>time is not a category</td><td>GroupBy</td></tr>
    <tr><td>Time series</td><td>trend and change?</td><td>daily 1210 … 990; 3-day avg 693.3</td><td>slow and big at scale</td><td>Time</td></tr>
    <tr><td>Performance</td><td>will it scale?</td><td>2 ms vs 2–3 s; 75.5 → 28.0 MB</td><td>beyond RAM → DuckDB/Polars/Spark</td><td>Time</td></tr>
  </table>
  <h3>The three ideas under everything</h3>
  <div class="cards">
    <div><b>Typed columns</b><p>Each column is one array with one dtype. Text where numbers belong ("28 min") blocks maths, so fix types first.</p><small>Check with <code>info()</code> / <code>dtypes</code></small></div>
    <div><b>The index</b><p>Row labels survive filtering and drive alignment: Series arithmetic, <code>loc</code>, groupby results and joins all match by label.</p><small><code>loc</code> = label, <code>iloc</code> = position</small></div>
    <div><b>Vectorised</b><p>Say what happens to a whole column. Python loops over rows are the slow path.</p><small>Avoid <code>iterrows</code>, <code>apply(axis=1)</code></small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Analysing before cleaning; <code>loc</code> end included vs <code>iloc</code> end excluded; chained assignment; filling missing values without asking what they mean; merge fan-out; <code>pivot_table</code> defaulting to mean; windows on unsorted rows; row loops.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why is <code>amount</code> float64 when every amount is a whole number?</td><td>One amount is blank; NaN is a float, so the whole column becomes float</td></tr>
    <tr><td>Mumbai has 5 orders but <code>count</code> says 4. Why?</td><td><code>count</code> skips the unknown amount of order 107; <code>size</code> counts rows</td></tr>
    <tr><td>Revenue doubled after a merge. First suspect?</td><td>Fan-out: a duplicate key in the lookup table; check with <code>validate="many_to_one"</code></td></tr>
    <tr><td>3-day rolling mean on Wednesday?</td><td>(1210 + 690 + 180) / 3 = 693.3</td></tr>
    <tr><td>Reading order of the group?</td><td>This map → Basics → Cleaning → GroupBy, Merge &amp; Reshape → Time Series &amp; Performance</td></tr>
  </table>

  <h2 id="pdm-qa"><span class="num">07</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line each: Series, DataFrame, index.</summary><div class="qa-body">A Series is one column: values plus an index of labels. A DataFrame is a table of Series sharing one index. The index is the row labels, which stay attached through filtering and decide how arithmetic, joins and groupby results line up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does pandas add on top of NumPy?</summary><div class="qa-body">Different types per column, row and column labels with label-based alignment, missing-value handling everywhere, and built-in group/join/reshape/time tools. The fast maths itself still comes from NumPy-style arrays (or Arrow) underneath.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the eight steps of the need chain.</summary><div class="qa-body">Table with an index → select → clean → group → merge → reshape → time series → performance. Each answers the question the previous step left open.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must cleaning come before groupby?</summary><div class="qa-body">groupby splits rows by the exact key value. " pune", "Pune" and "MUMBAI" are different values, so they become separate groups, and the duplicate order is counted twice. The totals are confidently wrong until the keys are clean.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does merge need the index and dtype ideas from Basics?</summary><div class="qa-body">A merge matches key values exactly, like Series alignment matches labels. If the keys differ in type (an <code>int</code> order_id vs a <code>str</code> "101") pandas refuses; if they differ in spelling the rows silently find no partner and get NaN.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: in what sense is resample a groupby?</summary><div class="qa-body">resample splits rows into time buckets (one per day, week, month), applies an aggregation to each bucket and combines the results: split-apply-combine where the key is a time interval. rolling is different: overlapping windows, one result per row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip performance and loop over rows?</summary><div class="qa-body">Nothing on 11 rows, everything on a million: a row loop that takes 2–3 s on 100,000 rows takes roughly half a minute on a million, every time it runs, and wide <code>object</code> strings can need several times the memory of <code>category</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you not use pandas?</summary><div class="qa-body">When data is bigger than memory (use DuckDB, Polars streaming, or Spark), when many users must share and update it (a database), for pure numeric arrays where NumPy is simpler, and for tiny configs or JSON records where a dict is enough.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What changed in pandas 3 that a beginner notices?</summary><div class="qa-body">Copy-on-Write is always on, so a subset always behaves like a copy and chained assignment never writes (it warns). Text columns get the new <code>str</code> dtype (Arrow-backed when pyarrow is installed) instead of <code>object</code>. Both are shown, run on 3.0.5, in <a class="xref" data-note="da_pd_basics">Basics</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The Biteful owner asks "which cuisine earns most?". Which steps of the chain do you need?</summary><div class="qa-body">Load (table), clean (dedupe, fix the city and types), merge with restaurants (cuisine lives there, with <code>validate="many_to_one"</code>), then groupby cuisine and sum: Biryani ₹1,430 first, with ₹260 of Momo Magic under an unknown cuisine to report, not hide.</div></details>
</main>
`
});
