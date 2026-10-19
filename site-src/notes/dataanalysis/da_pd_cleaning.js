// notes/dataanalysis/da_pd_cleaning.js — Cleaning & Missing Data
Object.assign(TOPIC_CONTENT, {
  "da_pd_cleaning": `<main>
<h1>Cleaning &amp; Missing Data</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>Cleaning &amp; Missing Data</span></div>
  <p class="lead">A table that loads without an error can still be wrong. This note takes Biteful's raw 12-row export and makes it trustworthy, one problem at a time, always asking first what the mess <em>means</em>: the three ways pandas marks a missing value (NaN, None, NA) and how they behave in sums and means, when to drop, fill or interpolate (with the cost of each on our totals), duplicates, text tidying with <code>.str</code>, fixing types with <code>to_numeric(errors="coerce")</code> and <code>to_datetime(format=…)</code>, categoricals, outliers by the IQR rule, and finally a reusable cleaning function, checked with assertions and run on 200,000 messy rows as "the same idea at scale". Run on pandas 3.0.5, Python 3.13.</p>

  <h2 id="pdc-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="pdc-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Python Collections (dicts, lists) · Files · NumPy arrays</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#pdc-ga)"/>
<line x1="320" y1="102" x2="83" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdc-ga)"/>
<line x1="320" y1="102" x2="241" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdc-ga)"/>
<line x1="320" y1="102" x2="399" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdc-ga)"/>
<line x1="320" y1="102" x2="557" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdc-ga)"/>
<line x1="158" y1="152" x2="164" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdc-ga)"/>
<line x1="316" y1="152" x2="322" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdc-ga)"/>
<line x1="474" y1="152" x2="480" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdc-ga)"/>
<rect x="200" y="62" width="240" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="400">Pandas: the map</text>
<text x="320" y="94" text-anchor="middle" class="tm" font-size="10">why each tool, in what order</text>
<rect x="8" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="83" y="149" text-anchor="middle" font-size="12" font-weight="400">Basics &amp; Selection</text>
<text x="83" y="164" text-anchor="middle" class="tm" font-size="10">table · index · pick</text>
<rect x="166" y="132" width="150" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="241" y="149" text-anchor="middle" font-size="12" font-weight="700">Cleaning</text>
<text x="241" y="164" text-anchor="middle" class="tg" font-size="9.5">YOU ARE HERE</text>
<rect x="324" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="399" y="149" text-anchor="middle" font-size="12" font-weight="400">GroupBy &amp; Merge</text>
<text x="399" y="164" text-anchor="middle" class="tm" font-size="10">summarise · combine · reshape</text>
<rect x="482" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="557" y="149" text-anchor="middle" font-size="12" font-weight="400">Time &amp; Speed</text>
<text x="557" y="164" text-anchor="middle" class="tm" font-size="10">dates · windows · fast</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdc-ga)"/>
<rect x="40" y="210" width="560" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Visualisation · SQL joins &amp; windows · Feature Engineering · Time Series · Spark</text>
</svg><figcaption>The Pandas group. Read the map first, then left to right: each note answers a question the one before could not. Dotted arrows show the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="da_pd_basics">Series, DataFrames &amp; Selection</a></b><span>We can load, inspect and select. And every section there tripped over the same problems: the filter <code>city == "Pune"</code> missed order 104 (" pune"), <code>describe</code> counted order 105 twice, <code>delivery_minutes</code> was text and could not be averaged, and one amount was blank. The map note <a class="xref" data-note="da_pandas">Pandas: the map</a> placed this note on the step "fix messy data".</span></li>
    <li><b>This note adds: a trustworthy table</b><span>How to find every kind of problem, how to decide what each one means, the pandas tools that fix it, and a checklist that turns the raw 12 rows into 11 clean ones.</span></li>
    <li><b>Leads to: <a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a></b><span>Only clean keys can be grouped and joined correctly. The clean 11-row table is where the next note starts. Further on: <a class="xref" data-note="st_descriptive">Descriptive Statistics</a> for outliers and spread, and <a class="xref" data-note="ml_features">Feature Engineering</a> for imputation inside a model pipeline.</span></li>
  </ol>

  <h2 id="pdc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers come from the running example.</p>
  <ol class="story">
    <li><b>Scanning for problems</b><span>Q: what exactly is wrong with this table? → <code>isna().sum()</code>, <code>duplicated()</code>, <code>value_counts()</code>, <code>unique()</code>: 1 blank amount, 1 blank minutes, 1 duplicate row, 4 spellings of 2 cities, minutes like "28 min" and "unknown". First, what is a "blank" to pandas?</span></li>
    <li><b>NaN, None, NA</b><span>Q: how is "missing" stored, and how does it behave? → NaN in float columns, <code>&lt;NA&gt;</code> in nullable ones; NaN == NaN is False, so use <code>isna</code>. Sums and means skip it: 10 known amounts of 11, total 3930, mean 393.0. But skipping is a decision too…</span></li>
    <li><b>Drop, fill or interpolate</b><span>Q: what should we do with a missing value? → It depends on what it means: <code>dropna</code> keeps the total but loses the order, <code>fillna(0)</code> drags the mean to 357.3, a restaurant median invents ₹610. <code>interpolate</code> fits only ordered measurements. Then: what about rows that are there twice?</span></li>
    <li><b>Duplicates</b><span>Q: is any row counted twice? → <code>duplicated()</code> finds order 105 again; <code>drop_duplicates()</code>: 12 → 11 rows. Now the city: " pune" and "MUMBAI"…</span></li>
    <li><b>Text with .str</b><span>Q: how do we tidy text in a whole column at once? → <code>.str.strip().str.title()</code>: 4 spellings → Pune 6, Mumbai 5; <code>.str.extract</code> pulls "28" out of "28 min". But "28" is still text, not a number…</span></li>
    <li><b>Types: to_numeric, to_datetime</b><span>Q: how do we turn text into numbers and dates safely? → <code>to_numeric</code> raises on "28 min"; <code>errors="coerce"</code> turns bad values into NaN (but would also destroy the 28 unless we extract first); <code>to_datetime</code> without a format read 04/01/2025 as 1 April. Now the city column holds the same two words thousands of times…</span></li>
    <li><b>Categoricals</b><span>Q: how do we store a column with few distinct values, or with a natural order? → <code>category</code>: 2 labels + small integer codes; ordered small &lt; medium &lt; large from <code>pd.cut</code>. One number still looks wrong: a 240-minute delivery…</span></li>
    <li><b>Outliers</b><span>Q: which values are implausible? → IQR rule: Q1 = 32, Q3 = 45, fences 12.5 and 64.5, so 240 is flagged; it is impossible, so it becomes NaN. Now we have many fixes; how do we apply them the same way every day?</span></li>
    <li><b>The cleaning checklist</b><span>Q: one repeatable, checked procedure? → <code>clean_orders()</code>: 11 rows, 2 cities, numeric minutes, amount blank kept on purpose, verified with <code>assert</code>; the same function cleans 202,000 messy rows in a fraction of a second.</span></li>
  </ol>

  <h2 id="pdc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Cleaning &amp; Missing Data</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Find</div>
        <ul>
          <li><code>info()</code>, <code>isna().sum()</code>, <code>duplicated().sum()</code></li>
          <li><code>value_counts()</code> for spellings; <code>unique()</code> for odd values</li>
          <li>Rows with any gap: <code>df[df.isna().any(axis=1)]</code></li>
          <li>💡 a health check before surgery</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Missing values</div>
        <ul>
          <li>NaN (float), None → NaN, <code>pd.NA</code> (nullable <code>Int64</code>, <code>boolean</code>)</li>
          <li>⚠ NaN == NaN is False → <code>isna()</code></li>
          <li>sum/mean skip NaN; <code>count</code> skips, <code>len</code>/<code>size</code> do not</li>
          <li>Biteful: total 3930, mean 393.0 of 10 known</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Decide</div>
        <ul>
          <li><b>Leave</b>: unknown stays unknown, report it</li>
          <li><b>dropna</b>: row useless without it</li>
          <li><b>fillna</b>: you know the true value (0 = no tip) or a model needs a number</li>
          <li><b>interpolate</b>: ordered measurements between known points</li>
          <li>⚠ fill(0) → mean 357.3; median fill invents ₹610</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Duplicates &amp; text</div>
        <ul>
          <li><code>duplicated(subset=…, keep=…)</code>, <code>drop_duplicates()</code></li>
          <li><code>.str.strip()</code>, <code>.lower()</code>, <code>.title()</code>, <code>.replace()</code></li>
          <li><code>.str.contains</code>, <code>.split</code>, <code>.extract(r"(\\d+)")</code></li>
          <li>Biteful: 12 → 11 rows; " pune"/MUMBAI → Pune/Mumbai</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Types</div>
        <ul>
          <li><code>to_numeric(errors="raise"|"coerce")</code></li>
          <li>⚠ coerce turns "28 min" into NaN: extract digits first</li>
          <li><code>to_datetime(format="%d/%m/%Y", errors="coerce")</code></li>
          <li>⚠ guessing read 04/01/2025 as 1 April</li>
          <li><code>astype("category")</code>; <code>pd.cut</code> → ordered categories</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Outliers &amp; checklist</div>
        <ul>
          <li>IQR fences Q1 − 1.5·IQR, Q3 + 1.5·IQR: (12.5, 64.5) → 240 flagged</li>
          <li>Impossible → NaN; rare but real → keep, maybe cap</li>
          <li>Checklist: dups → text → types → impossible values → dates → assert</li>
          <li>One function, same result every day; 202k rows in ~0.3 s</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdc-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-scan"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Meet the Mess</span><span class="rm-sub">Scanning a raw table</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-na"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">NaN, None &amp; NA</span><span class="rm-sub">How missing is stored</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-decide"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Drop, Fill or Interpolate?</span><span class="rm-sub">Decide by meaning</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-dups"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Duplicates</span><span class="rm-sub">Counted twice</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-str"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Messy Text: .str</span><span class="rm-sub">Whole-column string methods</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-types"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Fixing Types</span><span class="rm-sub">to_numeric, to_datetime</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-cat"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Categoricals</span><span class="rm-sub">Few values, or an order</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-out"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Outliers</span><span class="rm-sub">The IQR rule</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-check"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Cleaning Checklist</span><span class="rm-sub">One function, at scale</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Cleaning that makes it worse</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pdc-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pdc-scan"><span class="num">01</span>Meet the Mess</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><a class="xref" data-note="da_pd_basics">Basics</a> showed symptoms one at a time, by accident. Before fixing anything we need the full list: which columns have gaps, which rows repeat, which values are spelt several ways, and which "numbers" are not numbers?</p>
  </div>
  <h3>The running example</h3>
  <p>Biteful's raw export for 2–6 March 2026, exactly as in Basics (the CSV text is inlined with <code>io.StringIO</code>, which makes a string behave like a file):</p>
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
orders = pd.read_csv(io.StringIO(RAW), parse_dates=["order_time"])
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
  <h3>Four scans</h3>
  <div class="fx" data-lang="py">print(orders.isna().sum())
print("duplicate rows:", orders.duplicated().sum())
print(orders["city"].value_counts())
print(orders["delivery_minutes"].unique())</div>
  <div class="fx" data-lang="text">order_id            0
customer            0
restaurant          0
city                0
order_time          0
amount              1
delivery_minutes    1
dtype: int64
duplicate rows: 1
city
Pune      5
Mumbai    4
MUMBAI    2
 pune     1
Name: count, dtype: int64
&lt;ArrowStringArray&gt;
['32', '41', '38', nan, '28 min', '25', '45', '240', '52', 'unknown', '35']
Length: 11, dtype: str</div>
  <ul>
    <li><code>isna().sum()</code>: <code>isna()</code> gives True where a cell is missing; summing True/False counts the Trues per column. One missing amount (row 7, order 107), one missing delivery time (row 3, order 104).</li>
    <li><code>duplicated().sum()</code>: rows identical to an earlier row. One: the second copy of order 105.</li>
    <li><code>value_counts()</code> on city: four spellings of two cities. "Pune" 5, "Mumbai" 4, "MUMBAI" 2, " pune" 1.</li>
    <li><code>unique()</code> on delivery_minutes: the distinct values, which expose "28 min", "unknown", NaN and an implausible "240".</li>
  </ul>
  <table class="tbl"><caption>The problem list, and where each is fixed</caption>
    <tr><th>Problem</th><th>Where</th><th>Section</th></tr>
    <tr><td>Blank amount</td><td>order 107</td><td>02–03</td></tr>
    <tr><td>Blank / "unknown" delivery time</td><td>orders 104, 110</td><td>02, 06</td></tr>
    <tr><td>Exact duplicate row</td><td>order 105</td><td>04</td></tr>
    <tr><td>City spelt 4 ways</td><td>orders 104, 105</td><td>05</td></tr>
    <tr><td>Minutes as text ("28 min")</td><td>order 105</td><td>05–06</td></tr>
    <tr><td>Dates typed day-first</td><td>customers.signup_date</td><td>06</td></tr>
    <tr><td>Impossible 240-minute delivery</td><td>order 108</td><td>08</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A mechanic first runs the diagnostic and writes down every fault code before touching a single bolt. Fixing the first fault you see often hides the others.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Data cleaning</strong> is making a table fit for its purpose: every row is one real thing, once; every column has the right type; every value is valid or explicitly marked missing; categories are spelt one way. The standard scans are <code>info()</code>, <code>isna().sum()</code>, <code>duplicated().sum()</code>, <code>value_counts()</code>, <code>unique()</code> and <code>describe()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>isna()</code> only finds what pandas recognised as missing. "unknown", "n/a", "-", "0" or a single space are ordinary text or numbers to pandas. Look at <code>unique()</code> and <code>value_counts()</code> too, or pass <code>na_values=["unknown", "n/a"]</code> to <code>read_csv</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: NaN, None &amp; NA.</b> Two problems on the list are "missing". Before deciding what to do with them, we need to know how pandas stores "missing" and how it behaves in calculations.</div>

  <h2 id="pdc-na"><span class="num">02</span>NaN, None &amp; NA: How Missing Is Stored</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The blank amount shows as NaN, Python has <code>None</code>, and pandas also prints <code>&lt;NA&gt;</code> sometimes. Are these the same thing? And when we total the amounts, is the blank treated as zero, skipped, or does it poison the answer?</p>
  </div>
  <h3>Three markers</h3>
  <div class="fx" data-lang="py">a = pd.Series([240, None, 520])                 # None in numbers -&gt; NaN, column becomes float
b = pd.Series([240, None, 520], dtype="Int64")  # nullable integer -&gt; &lt;NA&gt;, stays integer
c = pd.Series(["Pune", None, "Mumbai"])         # None in text -&gt; NaN (pandas 3 str dtype)
print(a.tolist(), a.dtype)
print(b.tolist(), b.dtype)
print(c.tolist(), c.dtype)
print("NaN == NaN ?", np.nan == np.nan, "  isna:", a.isna().tolist(), b.isna().tolist(), c.isna().tolist())</div>
  <div class="fx" data-lang="text">[240.0, nan, 520.0] float64
[240, &lt;NA&gt;, 520] Int64
['Pune', nan, 'Mumbai'] str
NaN == NaN ? False   isna: [False, True, False] [False, True, False] [False, True, False]</div>
  <ul>
    <li><code>a</code>: a number column given <code>None</code>. Pandas stores it as <strong>NaN</strong> ("not a number", a special floating-point value), so the whole column becomes <code>float64</code>: 240 became 240.0.</li>
    <li><code>b</code>: the same with <code>dtype="Int64"</code> (capital I, a <em>nullable</em> integer type). Missing is stored as <strong><code>pd.NA</code></strong> and the numbers stay integers.</li>
    <li><code>c</code>: a text column. In pandas 3 the <code>str</code> dtype marks missing text as NaN.</li>
    <li>The famous rule: <code>NaN == NaN</code> is <strong>False</strong> (by the floating-point standard, "unknown" is not equal to "unknown"). So you can never find missing values with <code>==</code>. <code>isna()</code> recognises all three markers.</li>
  </ul>
  <h3>How missing behaves in maths</h3>
  <div class="fx" data-lang="py">amt = orders.drop_duplicates()["amount"]
print("values :", amt.tolist())
print("count  :", amt.count(), " len:", len(amt))
print("sum    :", amt.sum(), "  mean:", round(amt.mean(), 1))
print("sum of all-NaN column:", pd.Series([np.nan, np.nan]).sum())</div>
  <div class="fx" data-lang="text">values : [240.0, 450.0, 520.0, 380.0, 310.0, 180.0, nan, 260.0, 600.0, 290.0, 700.0]
count  : 10  len: 11
sum    : 3930.0   mean: 393.0
sum of all-NaN column: 0.0</div>
  <p>On the 11 distinct orders (duplicate removed): <code>count</code> says 10 values are known, <code>len</code> says 11 rows. <code>sum</code> adds the 10 known amounts, 240 + 450 + 520 + 380 + 310 + 180 + 260 + 600 + 290 + 700 = 3930, and <code>mean</code> divides by the 10 known values, 3930 / 10 = 393.0, not by 11. Pandas <strong>skips</strong> missing values by default (<code>skipna=True</code>). And the sum of a column that is entirely missing is 0.0, not "unknown", which can make a gap look like a real zero.</p>
  <div class="fx" data-lang="py">print(orders[orders.isna().any(axis=1)][["order_id", "restaurant", "amount", "delivery_minutes"]])</div>
  <div class="fx" data-lang="text">   order_id    restaurant  amount delivery_minutes
3       104  Biryani Bros   380.0              NaN
7       107   Pizza Point     NaN               45</div>
  <p><code>isna().any(axis=1)</code> asks, for each row, "is any cell missing?" (<code>axis=1</code> = across the columns of a row). Two rows: order 104 (minutes) and order 107 (amount). Order 110's "unknown" is not here, because to pandas it is ordinary text.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A class register with a blank where a student was absent from the test. When the teacher averages the marks she divides by the students who sat it (skip), not by the whole class (treat as zero). And two blanks are not "equal marks"; they are two unknowns.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>NaN</strong>: IEEE floating-point "not a number", pandas' missing marker in float columns. <strong>None</strong>: Python's null object; pandas converts it to NaN or NA depending on the column. <strong><code>pd.NA</code></strong>: pandas' missing marker for nullable dtypes (<code>Int64</code>, <code>boolean</code>, <code>string</code>). <strong><code>NaT</code></strong>: missing date-time. <code>isna()</code>/<code>notna()</code> detect all of them; aggregations skip them by default.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Because sums skip NaN silently, a total can look complete when rows are missing. Always report <code>count</code> next to <code>sum</code>: "₹3,930 from 10 of 11 orders" is honest; "₹3,930" is not.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Drop, Fill or Interpolate?</b> We know how missing values behave. We still have not decided what to <em>do</em> with order 107's blank amount, and each choice changes the numbers.</div>

  <h2 id="pdc-decide"><span class="num">03</span>Drop, Fill or Interpolate?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pandas offers <code>dropna</code>, <code>fillna</code> and <code>interpolate</code>. They are not interchangeable. Which one is right depends on what the blank <em>means</em>. What does each do to Biteful's totals?</p>
  </div>
  <h3>Four choices for order 107's amount, compared</h3>
  <div class="fx" data-lang="py">d = orders.drop_duplicates()
fill_rest = d.groupby("restaurant")["amount"].transform("median")
options = {
    "leave NaN (skip)": d["amount"],
    "dropna rows":      d["amount"].dropna(),
    "fillna(0)":        d["amount"].fillna(0),
    "fill restaurant median": d["amount"].fillna(fill_rest),
}
for name, s in options.items():
    print(f"{name:24} rows={len(s):2}  total={s.sum():6.0f}  mean={s.mean():6.1f}")
print("Pizza Point amounts:", d.loc[d.restaurant == "Pizza Point", "amount"].tolist(),
      "-&gt; median", fill_rest[d.order_id == 107].iloc[0])</div>
  <div class="fx" data-lang="text">leave NaN (skip)         rows=11  total=  3930  mean= 393.0
dropna rows              rows=10  total=  3930  mean= 393.0
fillna(0)                rows=11  total=  3930  mean= 357.3
fill restaurant median   rows=11  total=  4540  mean= 412.7
Pizza Point amounts: [520.0, nan, 700.0] -&gt; median 610.0</div>
  <table class="tbl"><caption>What each choice does, by hand</caption>
    <tr><th>Choice</th><th>Rows</th><th>Total</th><th>Mean</th><th>What it claims</th></tr>
    <tr><td>Leave NaN (pandas skips it)</td><td>11</td><td>3930</td><td>3930 / 10 = 393.0</td><td>"we don't know order 107's amount"</td></tr>
    <tr><td><code>dropna()</code></td><td>10</td><td>3930</td><td>393.0</td><td>"order 107 did not happen" (it did: order counts drop)</td></tr>
    <tr><td><code>fillna(0)</code></td><td>11</td><td>3930</td><td>3930 / 11 = 357.3</td><td>"order 107 was free"</td></tr>
    <tr><td>Restaurant median</td><td>11</td><td>3930 + 610 = 4540</td><td>4540 / 11 = 412.7</td><td>"order 107 cost the typical Pizza Point price" (520 and 700 → median 610)</td></tr>
  </table>
  <p>The code: <code>groupby("restaurant")["amount"].transform("median")</code> computes each restaurant's median and writes it next to every row of that restaurant (groupby and transform are taught in the next note), and <code>fillna(fill_rest)</code> takes the value from that column only where the amount is missing. For Biteful's revenue report the honest choice is the first: keep the order, keep the amount unknown, and report "10 of 11 amounts known". Filling with 0 understates the average; filling with the median invents ₹610 of revenue that the accounts will never see.</p>
  <h3>Interpolation: only for ordered measurements</h3>
  <p>Interpolation guesses a missing value from its neighbours <em>in order</em>, so it only makes sense when the rows are ordered (usually by time) and the quantity changes smoothly. Example from our data: Pune's average delivery time per day after cleaning (computed for real in section 09) is 35 on Monday, unknown on Tuesday (order 104 has no time), 25 on Wednesday, and unknown on Thursday and Friday:</p>
  <div class="fx" data-lang="py">pune_daily = pd.Series([35.0, np.nan, 25.0, np.nan, np.nan],
                       index=pd.date_range("2026-03-02", periods=5, freq="D"),
                       name="pune_avg_minutes")
print(pd.DataFrame({"raw": pune_daily,
                    "ffill": pune_daily.ffill(),
                    "interpolate": pune_daily.interpolate()}))</div>
  <div class="fx" data-lang="text">             raw  ffill  interpolate
2026-03-02  35.0   35.0         35.0
2026-03-03   NaN   35.0         30.0
2026-03-04  25.0   25.0         25.0
2026-03-05   NaN   25.0         25.0
2026-03-06   NaN   25.0         25.0</div>
  <ul>
    <li><code>ffill()</code> (forward fill) copies the last known value forward: Tuesday = 35.</li>
    <li><code>interpolate()</code> draws a straight line between known neighbours: Tuesday = (35 + 25) / 2 = 30.</li>
    <li>After the last known value (Thursday, Friday) there is no right-hand neighbour, so <code>interpolate</code> can only repeat 25. Neither method knows anything about Thursday; they just copy.</li>
  </ul>
  <table class="tbl"><caption>When to use which</caption>
    <tr><th>Situation</th><th>Use</th><th>Example</th></tr>
    <tr><td>Value unknown, row still real</td><td>leave NaN, report the count</td><td>order 107's amount</td></tr>
    <tr><td>Row useless without the value</td><td><code>dropna(subset=[col])</code></td><td>an order with no order_id</td></tr>
    <tr><td>You know the true value</td><td><code>fillna(value)</code></td><td>blank "tip" means no tip → 0</td></tr>
    <tr><td>A model needs a number</td><td><code>fillna(group median)</code> + a "was missing" flag, computed on training data only</td><td>delivery time as a feature (<a class="xref" data-note="ml_features">Feature Engineering</a>)</td></tr>
    <tr><td>Ordered, smoothly changing measurements</td><td><code>interpolate()</code> / <code>ffill()</code></td><td>a temperature sensor, a stock price, daily averages</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A torn page in a diary. If the page was blank anyway, tear it out (drop). If you know what was written ("no expenses that day"), write it back (fill). If it was the middle of a temperature log, you can estimate from the days on either side (interpolate). If it was a receipt, you cannot invent the amount: you note "receipt missing".</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>dropna(subset=…, how="any"|"all")</code>: remove rows (or columns with <code>axis=1</code>) with missing values. <code>fillna(value | Series)</code>: replace missing values with a constant or with aligned values. <code>ffill()</code>/<code>bfill()</code>: copy the previous/next known value. <code>interpolate(method="linear"|"time"|…)</code>: estimate from neighbouring known values in index order.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Filling before analysis is invisible afterwards: nobody looking at the total 4540 can tell ₹610 was invented. If you must fill, add an indicator column (<code>df["amount_missing"] = df["amount"].isna()</code>) first, and for machine learning compute fill values on the training split only, or the test score is optimistic (leakage).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Duplicates.</b> Missing values are decided. The opposite problem is also on our list: a row that is there <em>twice</em>.</div>

  <h2 id="pdc-dups"><span class="num">04</span>Duplicates</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>describe</code> in Basics counted the ₹310 order twice. Exports duplicate rows when a sync retries or two files overlap. How do we find rows counted twice, and what counts as "the same row"?</p>
  </div>
  <div class="fx" data-lang="py">print(orders.duplicated().tolist())
print("same order_id twice:", orders["order_id"].duplicated().sum())
o = orders.drop_duplicates()
print(len(orders), "-&gt;", len(o), "rows")</div>
  <div class="fx" data-lang="text">[False, False, False, False, False, True, False, False, False, False, False, False]
same order_id twice: 1
12 -&gt; 11 rows</div>
  <p><code>duplicated()</code> marks each row True if an identical row appeared <em>earlier</em> (<code>keep="first"</code> is the default), so only the second copy, position 5, is True. <code>duplicated()</code> on just the <code>order_id</code> column asks a stricter question: does any order id repeat, even if other columns differ? Also 1 here. <code>drop_duplicates()</code> keeps the first copy of each: 12 → 11 rows. From now on <code>o</code> is the de-duplicated table.</p>
  <ul>
    <li><code>subset=["order_id"]</code>: compare only some columns ("same order id = same order").</li>
    <li><code>keep="last"</code>: keep the latest copy (useful after sorting by an update time); <code>keep=False</code>: mark every copy, to inspect them all.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>A wedding guest list compiled from two relatives' lists: the same cousin appears on both. You strike the second entry, and you decide whether "same name" or "same name and phone number" means "same person".</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>duplicate</strong> is a row whose values in the chosen columns equal those of another row. <code>df.duplicated(subset=None, keep="first")</code> returns a mask; <code>df.drop_duplicates(subset=None, keep="first")</code> removes the marked rows.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Exact-duplicate checks miss near-duplicates: "MUMBAI" vs "Mumbai" or a trailing space make two copies look different. Tidy the text first when the key is text, or de-duplicate on a reliable id (<code>subset=["order_id"]</code>). And two genuinely different orders can have identical values (same customer, same restaurant, same minute), so only de-duplicate on all columns if the data has no id.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Messy Text with .str.</b> One copy per order now. But the city column still has " pune" and "MUMBAI", and the minutes column has "28 min". Both are text problems.</div>

  <h2 id="pdc-str"><span class="num">05</span>Messy Text: the .str Methods</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Python strings have <code>strip()</code>, <code>title()</code> and <code>split()</code> (see <a class="xref" data-note="py_strings">Strings</a>). A column has thousands of strings. Must we loop over them, or can we apply a string method to the whole column at once?</p>
  </div>
  <div class="fx" data-lang="py">print(o["city"].tolist())
city = o["city"].str.strip().str.title()
print(city.tolist())
print(city.value_counts())</div>
  <div class="fx" data-lang="text">['Pune', 'Mumbai', 'Pune', ' pune', 'MUMBAI', 'Pune', 'Mumbai', 'Pune', 'Mumbai', 'Pune', 'Mumbai']
['Pune', 'Mumbai', 'Pune', 'Pune', 'Mumbai', 'Pune', 'Mumbai', 'Pune', 'Mumbai', 'Pune', 'Mumbai']
city
Pune      6
Mumbai    5
Name: count, dtype: int64</div>
  <p><code>.str</code> is an <em>accessor</em>: it gives a text column the string methods, applied to every value (missing values pass through as missing). <code>.str.strip()</code> removes leading and trailing spaces (" pune" → "pune"); <code>.str.title()</code> capitalises each word ("pune" → "Pune", "MUMBAI" → "Mumbai"). Four spellings become two cities: Pune 6, Mumbai 5. Order 104 is now a Pune order.</p>
  <div class="fx" data-lang="py">r = o["restaurant"]
print(r.str.lower().str.contains("pizza").tolist())
print(r.str.split(" ").str[0].tolist())
print(r.str.len().tolist())</div>
  <div class="fx" data-lang="text">[False, False, True, False, False, False, True, False, False, False, True]
['Dosa', 'Biryani', 'Pizza', 'Biryani', 'Green', 'Dosa', 'Pizza', 'Momo', 'Biryani', 'Green', 'Pizza']
[8, 12, 11, 12, 10, 8, 11, 10, 12, 10, 11]</div>
  <ul>
    <li><code>.str.lower().str.contains("pizza")</code>: True for the three Pizza Point orders. Lower-casing first makes the test case-insensitive (or pass <code>case=False</code>).</li>
    <li><code>.str.split(" ").str[0]</code>: split each name on spaces into a list, then take element 0 of every list: "Dosa", "Biryani", …</li>
    <li><code>.str.len()</code>: number of characters of each value.</li>
  </ul>
  <p>And the method that rescues the minutes column, <code>.str.extract</code>, which keeps the part of each string that matches a regular expression. <code>r"(\\d+)"</code> means "one or more digits, captured":</p>
  <div class="fx" data-lang="py">digits = o["delivery_minutes"].str.extract(r"(\\d+)", expand=False)
print(digits.tolist())
mins = pd.to_numeric(digits, errors="coerce")
print(mins.tolist(), mins.dtype)</div>
  <div class="fx" data-lang="text">['32', '41', '38', nan, '28', '25', '45', '240', '52', nan, '35']
[32.0, 41.0, 38.0, nan, 28.0, 25.0, 45.0, 240.0, 52.0, nan, 35.0] float64</div>
  <p>First line: "28 min" → "28"; "unknown" has no digits → NaN; NaN stays NaN. The result is still <em>text</em> ("28" in quotes). Turning it into numbers is the next section's job; the second line previews it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A rubber stamp versus a pen: instead of correcting every name card by hand, you set the stamp once ("trim and capitalise") and press it on the whole stack.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The <strong><code>.str</code> accessor</strong> applies vectorised string methods to every element of a text Series: <code>strip</code>, <code>lower</code>, <code>upper</code>, <code>title</code>, <code>replace</code>, <code>contains</code>, <code>startswith</code>, <code>split</code>, <code>len</code>, <code>slice</code>/<code>[i]</code>, <code>extract</code> (regex capture groups), <code>pad</code>/<code>zfill</code>. Missing values propagate as missing.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>.str.contains</code> treats its pattern as a regular expression by default, so <code>"."</code> means "any character" and matches everything; pass <code>regex=False</code> for literal text. (<code>.str.replace</code> is literal by default since pandas 2; pass <code>regex=True</code> when you want a pattern.) And <code>.str</code> on a column that is not text (numbers) raises an error: convert or check the dtype first.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Fixing Types.</b> Text is tidy, and we have "28" instead of "28 min". But "28" is still a string: we cannot average it, and dates typed as "04/01/2025" are strings too.</div>

  <h2 id="pdc-types"><span class="num">06</span>Fixing Types: to_numeric &amp; to_datetime</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A column whose dtype is <code>str</code> cannot be summed, compared as numbers or used as dates. How do we convert a column of text to numbers or dates, and what happens to the values that do not convert?</p>
  </div>
  <h3>Numbers: three behaviours</h3>
  <div class="fx" data-lang="py">try:
    pd.to_numeric(o["delivery_minutes"])
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">ValueError: Unable to parse string "28 min" at position 4</div>
  <p>The default, <code>errors="raise"</code>, stops at the first bad value and says where: "28 min" at position 4. Safe, because nothing is silently lost.</p>
  <div class="fx" data-lang="py">print(pd.to_numeric(o["delivery_minutes"], errors="coerce").tolist())</div>
  <div class="fx" data-lang="text">[32.0, 41.0, 38.0, nan, nan, 25.0, 45.0, 240.0, 52.0, nan, 35.0]</div>
  <p><code>errors="coerce"</code> converts what it can and turns everything else into NaN. Convenient, but look at position 4: "28 min" became NaN, although the 28 was perfectly usable. Coercing first throws data away.</p>
  <p>The right order is the one from section 05: extract the digits, then coerce the rest. That gave <code>[32.0, 41.0, 38.0, nan, 28.0, 25.0, 45.0, 240.0, 52.0, nan, 35.0]</code>, <code>float64</code>: "28 min" kept as 28, "unknown" honestly NaN. Compare the NaN count before and after to see what coerce dropped: here only the value that really had no number.</p>
  <h3>Dates: never let pandas guess day vs month</h3>
  <p>The customers table stores signup dates as typed by the sign-up form, day first (Indian style):</p>
  <div class="fx" data-lang="py">customers = pd.DataFrame({
    "customer": ["Asha", "Ben", "Chen", "Dia", "Esha", "Gita"],
    "plan": ["gold", "free", "gold", "free", "free", "gold"],
    "signup_date": ["04/01/2025", "13/06/2025", "22/11/2024", "unknown", "09/02/2026", "30/12/2025"],
})
guess = pd.to_datetime(customers["signup_date"], errors="coerce")             # let pandas guess
right = pd.to_datetime(customers["signup_date"], format="%d/%m/%Y", errors="coerce")
print(pd.DataFrame({"text": customers["signup_date"], "guessed": guess, "with format": right}))</div>
  <div class="fx" data-lang="text">         text    guessed with format
0  04/01/2025 2025-04-01  2025-01-04
1  13/06/2025        NaT  2025-06-13
2  22/11/2024        NaT  2024-11-22
3     unknown        NaT         NaT
4  09/02/2026 2026-09-02  2026-02-09
5  30/12/2025        NaT  2025-12-30</div>
  <p>Without a format, pandas looked at the first value "04/01/2025", guessed the US month-first pattern, and applied it to the whole column: Asha's 4 January became <strong>1 April</strong>, Esha's 9 February became 2 September, and every date with a day above 12 (13/06, 22/11, 30/12) could not fit the guessed pattern and became <code>NaT</code> (missing date). With <code>format="%d/%m/%Y"</code> (day/month/4-digit year) every date is right, and only "unknown" becomes NaT.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Converting text to numbers is a cashier counting a pile of notes: <code>raise</code> stops and calls the manager at the first foreign note, <code>coerce</code> quietly drops every odd note in a bin. Extracting first is checking whether the "odd" note is just a normal note in a plastic sleeve.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>pd.to_numeric(s, errors="raise"|"coerce", downcast=None)</code>: text → numbers; with <code>coerce</code>, unparseable values become NaN. <code>pd.to_datetime(s, format=…, errors=…)</code>: text → <code>datetime64</code>; unparseable values become <code>NaT</code> with <code>coerce</code>. <code>astype(dtype)</code>: convert when every value is known to be valid. Format codes: <code>%d</code> day, <code>%m</code> month, <code>%Y</code> 4-digit year, <code>%H:%M</code> hours:minutes.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>errors="coerce"</code> hides problems by design. Count NaN before and after (<code>s.isna().sum()</code>), and look at the values that turned into NaN (<code>s[converted.isna() &amp; s.notna()]</code>) before accepting the result. For dates, always pass <code>format=</code> (or <code>dayfirst=True</code>) when the data is not ISO <code>YYYY-MM-DD</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Categoricals.</b> Numbers are numbers and dates are dates. The tidy city column, though, is two words repeated on every row. Is plain text the right type for it?</div>

  <h2 id="pdc-cat"><span class="num">07</span>Categoricals</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>City has 2 distinct values across 11 rows (and across a million rows in the full data). Storing the word on every row wastes memory, and nothing stops a new typo from appearing. Some columns also have a natural order (small &lt; medium &lt; large) that text sorting gets wrong. Is there a type for "one of a few known values"?</p>
  </div>
  <div class="fx" data-lang="py">city_cat = city.astype("category")
print(city_cat.cat.categories.tolist(), city_cat.cat.codes.tolist())
size = pd.cut(o["amount"], bins=[0, 300, 500, np.inf], labels=["small", "medium", "large"])
print(pd.DataFrame({"amount": o["amount"], "size": size}).head(6))
print(size.dtype, "| ordered:", size.cat.ordered, "| medium or bigger:", (size &gt;= "medium").sum())</div>
  <div class="fx" data-lang="text">['Mumbai', 'Pune'] [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0]
   amount    size
0   240.0   small
1   450.0  medium
2   520.0   large
3   380.0  medium
4   310.0  medium
6   180.0   small
category | ordered: True | medium or bigger: 6</div>
  <ul>
    <li><code>astype("category")</code> stores the distinct values once (<code>categories</code>: Mumbai, Pune, sorted) and one small integer per row (<code>codes</code>: Mumbai = 0, Pune = 1). Our 11 cities become 1, 0, 1, 1, 0, …</li>
    <li><code>pd.cut</code> puts numbers into labelled bins: up to 300 small, 300–500 medium, above 500 large (each bin includes its right edge). 240 → small, 450 → medium, 520 → large.</li>
    <li>The result is an <strong>ordered</strong> categorical, so comparisons follow the order you gave, not the alphabet: <code>size &gt;= "medium"</code> counts 6 orders (450, 520, 380, 310, 600, 700). As plain text, "large" &lt; "medium" &lt; "small" alphabetically.</li>
  </ul>
  <p>The memory benefit is measured at scale in <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>: a million city names drop from about 13 MB as text to about 1 MB as a category.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A phone's contact list: you save "Biryani Bros, Pune" once and every call log entry just points to the saved contact, instead of retyping the name each time.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>categorical</strong> column stores a fixed set of <code>categories</code> plus an integer <code>code</code> per row (−1 for missing). It can be <code>ordered</code>, which enables <code>&lt;</code>, <code>&gt;</code>, <code>min</code>, <code>max</code> and sorting by the category order. Create with <code>astype("category")</code>, <code>pd.Categorical(values, categories=…, ordered=True)</code> or <code>pd.cut</code>/<code>pd.qcut</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Category helps only with low <strong>cardinality</strong> (few distinct values). A column of unique ids as category is bigger, not smaller. And when grouping by a categorical, pandas 3 shows only categories that occur (<code>observed=True</code> is now the default); older versions listed every category, even empty ones, unless you passed <code>observed=True</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Outliers.</b> Types are right. One value still looks wrong though it is a valid number: order 108 took 240 minutes. How do we decide what is too far out?</div>

  <h2 id="pdc-out"><span class="num">08</span>Outliers: the IQR Rule</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A 240-minute food delivery would mean four hours on the road. Is it an error or a rare real event? We need a rule for "unusually far from the rest" that a single extreme value cannot distort.</p>
  </div>
  <div class="fx" data-lang="py">m = mins.dropna()
q1, q3 = m.quantile(0.25), m.quantile(0.75)
iqr = q3 - q1
lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print("sorted:", sorted(m.tolist()))
print(f"Q1={q1}  Q3={q3}  IQR={iqr}  fences=({lo}, {hi})")
print("outside fences:", m[(m &lt; lo) | (m &gt; hi)].tolist())</div>
  <div class="fx" data-lang="text">sorted: [25.0, 28.0, 32.0, 35.0, 38.0, 41.0, 45.0, 52.0, 240.0]
Q1=32.0  Q3=45.0  IQR=13.0  fences=(12.5, 64.5)
outside fences: [240.0]</div>
  <p>By hand, on the 9 known delivery times sorted: 25, 28, 32, 35, 38, 41, 45, 52, 240.</p>
  <ul>
    <li><strong>Q1</strong> (25th percentile) = 32 and <strong>Q3</strong> (75th percentile) = 45: a quarter of the values are at or below 32, three quarters at or below 45 (pandas uses linear interpolation between sorted positions; with 9 values those fall exactly on the 3rd and 7th values).</li>
    <li><strong>IQR</strong> (inter-quartile range) = Q3 − Q1 = 13: the width of the middle half of the data.</li>
    <li><strong>Fences</strong>: Q1 − 1.5 × 13 = 12.5 and Q3 + 1.5 × 13 = 64.5. Values outside are flagged.</li>
    <li>Only 240 is outside. Because quartiles ignore the extremes, the 240 itself barely moved the fences (the mean, by contrast, jumps from 296 / 8 = 37.0 without it to 536 / 9 = 59.6 with it).</li>
  </ul>
  <p>Flagging is statistics; deciding is business knowledge. Biteful's app cancels any delivery after 2 hours, so 240 is impossible: a logging error, set to NaN. A real but rare value (a 70-minute delivery in a storm) would be kept, perhaps capped for some charts. <a class="xref" data-note="st_descriptive">Descriptive Statistics</a> covers quartiles, IQR, z-scores and robust statistics in depth.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cricket team's batting scores: most innings fall between 20 and 60. A score of 240 in a T20 is not "a great innings", it is a scoring error. A 98 is rare and real.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>IQR rule</strong> flags values below Q1 − 1.5·IQR or above Q3 + 1.5·IQR, where Q1 and Q3 are the 25th and 75th percentiles (<code>s.quantile(0.25)</code>, <code>s.quantile(0.75)</code>) and IQR = Q3 − Q1. Options after flagging: correct, set to NaN, cap (<code>s.clip(lower, upper)</code>, "winsorising"), or keep.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Deleting every flagged value deletes real, important events (the biggest orders, the slowest deliveries are often exactly what the business needs to see). Flag automatically, decide with domain rules, and record what you changed.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Cleaning Checklist.</b> Every problem has a fix. But fixes scattered over a notebook are applied in a different order every time, or forgotten on tomorrow's export. We need one repeatable procedure.</div>

  <h2 id="pdc-check"><span class="num">09</span>The Cleaning Checklist, Applied</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful exports a new file every day. How do we apply exactly the same fixes, in the right order, every time, and know the result is right?</p>
  </div>
  <h3>The checklist</h3>
  <ol>
    <li><strong>Scan</strong>: <code>info</code>, <code>isna().sum()</code>, <code>duplicated().sum()</code>, <code>value_counts</code>, <code>unique</code>.</li>
    <li><strong>Duplicates</strong>: remove exact copies (or by id).</li>
    <li><strong>Text</strong>: strip, fix case, unify spellings; convert few-valued columns to <code>category</code>.</li>
    <li><strong>Types</strong>: extract, then <code>to_numeric(errors="coerce")</code>; <code>to_datetime(format=…)</code>.</li>
    <li><strong>Invalid values</strong>: domain rules (minutes &gt; 120 impossible) and outlier flags.</li>
    <li><strong>Missing</strong>: decide per column by meaning (here: leave amount NaN, leave minutes NaN).</li>
    <li><strong>Verify</strong>: <code>assert</code> the rules you rely on.</li>
  </ol>
  <h3>As one function</h3>
  <div class="fx" data-lang="py">def clean_orders(raw: pd.DataFrame) -&gt; pd.DataFrame:
    df = raw.drop_duplicates().copy()                                   # 1 exact duplicates
    df["city"] = df["city"].str.strip().str.title().astype("category")  # 2 text + category
    df["restaurant"] = df["restaurant"].str.strip()
    df["customer"] = df["customer"].str.strip()
    mins = df["delivery_minutes"].astype("str").str.extract(r"(\\d+)", expand=False)
    df["delivery_minutes"] = pd.to_numeric(mins, errors="coerce")       # 3 types
    df.loc[df["delivery_minutes"] &gt; 120, "delivery_minutes"] = np.nan   # 4 impossible values
    df["order_time"] = pd.to_datetime(df["order_time"])                 # 5 dates (no-op if parsed)
    return df.reset_index(drop=True)                                    # amount NaN kept on purpose

clean = clean_orders(orders)
print(clean)
clean.info()</div>
  <div class="fx" data-lang="text">    order_id customer    restaurant    city          order_time  amount  delivery_minutes
0        101     Asha      Dosa Hut    Pune 2026-03-02 12:10:00   240.0              32.0
1        102      Ben  Biryani Bros  Mumbai 2026-03-02 13:05:00   450.0              41.0
2        103     Chen   Pizza Point    Pune 2026-03-02 20:30:00   520.0              38.0
3        104     Asha  Biryani Bros    Pune 2026-03-03 13:15:00   380.0               NaN
4        105      Dia    Green Bowl  Mumbai 2026-03-03 19:45:00   310.0              28.0
5        106      Ben      Dosa Hut    Pune 2026-03-04 12:40:00   180.0              25.0
6        107     Esha   Pizza Point  Mumbai 2026-03-04 21:10:00     NaN              45.0
7        108     Chen    Momo Magic    Pune 2026-03-05 18:20:00   260.0               NaN
8        109    Farah  Biryani Bros  Mumbai 2026-03-05 20:05:00   600.0              52.0
9        110     Asha    Green Bowl    Pune 2026-03-06 13:00:00   290.0               NaN
10       111      Dia   Pizza Point  Mumbai 2026-03-06 20:50:00   700.0              35.0
&lt;class 'pandas.DataFrame'&gt;
RangeIndex: 11 entries, 0 to 10
Data columns (total 7 columns):
 #   Column            Non-Null Count  Dtype         
---  ------            --------------  -----         
 0   order_id          11 non-null     int64         
 1   customer          11 non-null     str           
 2   restaurant        11 non-null     str           
 3   city              11 non-null     category      
 4   order_time        11 non-null     datetime64[us]
 5   amount            10 non-null     float64       
 6   delivery_minutes  8 non-null      float64       
dtypes: category(1), datetime64[us](1), float64(2), int64(1), str(2)
memory usage: 858.0 bytes</div>
  <p>Read it top to bottom against the checklist. <code>.copy()</code> after <code>drop_duplicates</code> makes the intention explicit (we are building a new table). Each step writes a whole column at once. <code>astype("str")</code> before <code>.str.extract</code> makes the function also work when the minutes column arrived as numbers (as in the generated data). The <code>.loc[mask, col] = np.nan</code> line is the safe one-step assignment from Basics. The result: 11 rows, city <code>category</code>, minutes <code>float64</code> with 8 known values, and amount with 10 known values, the blank kept on purpose.</p>
  <div class="fx" data-lang="py">assert clean["order_id"].is_unique
assert set(clean["city"].cat.categories) == {"Mumbai", "Pune"}
assert clean["delivery_minutes"].dropna().between(5, 120).all()
print("rows:", len(clean), "| missing:", clean.isna().sum()[lambda s: s &gt; 0].to_dict())</div>
  <div class="fx" data-lang="text">rows: 11 | missing: {'amount': 1, 'delivery_minutes': 3}</div>
  <p><code>assert</code> stops the program if a condition is false: order ids are unique, there are exactly two cities, every known delivery time is between 5 and 120 minutes. These three lines turn "I think it's clean" into "it is clean by these rules", and they will fail loudly on the day the app starts exporting "Bengaluru".</p>
  <div class="fx" data-lang="py">pune = clean[clean["city"] == "Pune"].set_index("order_time")["delivery_minutes"]
print(pune.resample("D").mean())</div>
  <div class="fx" data-lang="text">order_time
2026-03-02    35.0
2026-03-03     NaN
2026-03-04    25.0
2026-03-05     NaN
2026-03-06     NaN
Freq: D, Name: delivery_minutes, dtype: float64</div>
  <p>This is where section 03's interpolation example came from: Pune's daily average delivery time from the clean table, 35 (= (32 + 38) / 2) on Monday, then gaps on Tuesday (104 has no time), Thursday (108's 240 removed) and Friday (110 "unknown").</p>
  <h3>The same idea at scale</h3>
  <p>The generator from Basics, plus a function that sprinkles the same kinds of mess at random: "min" suffixes, "unknown", impossible 240s, lower-case cities with spaces, blank amounts, and 1% duplicated rows.</p>
  <div class="fx" data-lang="py">def make_orders(n, seed=0):
    """Same shape as the 12-row table, n rows (from Basics)."""
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

def make_messy(n, seed=0):
    """Add the same kinds of mess as our 12 rows, at random."""
    df = make_orders(n, seed)
    rng = np.random.default_rng(seed + 1)
    pick = lambda p: rng.random(n) &lt; p
    df["delivery_minutes"] = df["delivery_minutes"].astype(int).astype(str)
    df.loc[pick(0.02), "delivery_minutes"] = df["delivery_minutes"] + " min"
    df.loc[pick(0.01), "delivery_minutes"] = "unknown"
    df.loc[pick(0.005), "delivery_minutes"] = "240"
    df.loc[pick(0.03), "city"] = " " + df["city"].str.lower()
    df.loc[pick(0.01), "amount"] = np.nan
    return pd.concat([df, df.sample(frac=0.01, random_state=seed)], ignore_index=True)

messy = make_messy(200_000)
print("messy :", messy.shape, "| city spellings:", messy["city"].nunique(),
      "| dup rows:", messy.duplicated().sum())
import time
t = time.perf_counter()
big_clean = clean_orders(messy)
print("clean :", big_clean.shape, "| cities:", big_clean["city"].cat.categories.tolist(),
      f"| {time.perf_counter() - t:.2f} s")
print(big_clean.isna().sum()[lambda s: s &gt; 0].to_dict())</div>
  <div class="fx" data-lang="text">messy : (202000, 7) | city spellings: 4 | dup rows: 2000
clean : (200000, 7) | cities: ['Mumbai', 'Pune'] | 0.26 s
{'amount': 1950, 'delivery_minutes': 2986}</div>
  <p>202,000 messy rows with 4 city spellings and 2,000 duplicates go in; 200,000 rows with 2 cities come out, in a fraction of a second, because every step is a whole-column operation. The remaining missing values are the ones we chose to keep: unknown amounts, and delivery times that were "unknown" or impossible.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A pilot's pre-flight checklist: the same items, in the same order, every flight, ticked off, no matter how experienced the pilot. The function is the checklist; the asserts are the ticks.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>cleaning function</strong> takes raw data and returns clean data with no side effects, so it can be re-run on every new export and tested. Validation checks (<code>assert</code>, or libraries such as pandera and Great Expectations) state the rules the clean data must satisfy.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Cleaning by hand in a notebook (editing a cell here, dropping a row there) cannot be repeated or reviewed. And never overwrite the raw file: keep raw and clean separately, so a wrong cleaning decision can be undone.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects</b>, and then <a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a>. The table is trustworthy: 11 orders, 2 cities, numeric minutes. But it is still one row per order. "Which city earns more?" and "which cuisine?" need rows summarised by group and facts from other tables.</div>

  <h2 id="pdc-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Scanning, missing values, drop/fill, duplicates, text, types, categories, outliers, the checklist. How do they depend on each other, and why in this order?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 250" width="660">
<defs><marker id="pdc-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="8" width="160" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="26" text-anchor="middle" font-size="11.5" font-weight="700">scan</text><text x="330" y="41" text-anchor="middle" class="tm" font-size="10">isna · duplicated · value_counts</text>
<line x1="300" y1="48" x2="120" y2="76" stroke="currentColor" marker-end="url(#pdc-a9)"/><line x1="330" y1="48" x2="330" y2="76" stroke="currentColor" marker-end="url(#pdc-a9)"/><line x1="360" y1="48" x2="540" y2="76" stroke="currentColor" marker-end="url(#pdc-a9)"/>
<rect x="30" y="78" width="180" height="40" rx="7" class="fb sb"/><text x="120" y="96" text-anchor="middle" font-size="11.5" font-weight="700">missing: NaN / NA</text><text x="120" y="111" text-anchor="middle" class="tm" font-size="10">→ leave · drop · fill · interpolate</text>
<rect x="240" y="78" width="180" height="40" rx="7" class="fb sb"/><text x="330" y="96" text-anchor="middle" font-size="11.5" font-weight="700">duplicates</text><text x="330" y="111" text-anchor="middle" class="tm" font-size="10">needs tidy keys</text>
<rect x="450" y="78" width="180" height="40" rx="7" class="fb sb"/><text x="540" y="96" text-anchor="middle" font-size="11.5" font-weight="700">text: .str</text><text x="540" y="111" text-anchor="middle" class="tm" font-size="10">strip · title · extract</text>
<line x1="450" y1="98" x2="422" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdc-a9)"/>
<line x1="540" y1="118" x2="540" y2="142" stroke="currentColor" marker-end="url(#pdc-a9)"/>
<rect x="450" y="144" width="180" height="40" rx="7" class="ft st"/><text x="540" y="162" text-anchor="middle" font-size="11.5" font-weight="700">types</text><text x="540" y="177" text-anchor="middle" class="tm" font-size="10">to_numeric · to_datetime</text>
<line x1="450" y1="164" x2="422" y2="164" stroke="currentColor" marker-end="url(#pdc-a9)"/><line x1="540" y1="184" x2="440" y2="212" stroke="currentColor" marker-end="url(#pdc-a9)"/>
<rect x="240" y="144" width="180" height="40" rx="7" class="ft st"/><text x="330" y="162" text-anchor="middle" font-size="11.5" font-weight="700">category</text><text x="330" y="177" text-anchor="middle" class="tm" font-size="10">tidy text → few labels</text>
<rect x="30" y="144" width="180" height="40" rx="7" class="ft st"/><text x="120" y="162" text-anchor="middle" font-size="11.5" font-weight="700">outliers (IQR)</text><text x="120" y="177" text-anchor="middle" class="tm" font-size="10">needs numeric type</text>
<path d="M450,180 C350,205 250,205 210,180" fill="none" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdc-a9)"/>
<line x1="120" y1="118" x2="120" y2="142" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdc-a9)"/><text x="126" y="134" class="tm" font-size="9.5">flagged → NaN</text>
<rect x="230" y="206" width="200" height="40" rx="7" class="fg sg"/><text x="330" y="224" text-anchor="middle" font-size="11.5" font-weight="700">clean_orders() + asserts</text><text x="330" y="239" text-anchor="middle" class="tm" font-size="10">same fixes, same order, every day</text>
<line x1="120" y1="184" x2="228" y2="222" stroke="currentColor" marker-end="url(#pdc-a9)"/><line x1="330" y1="184" x2="330" y2="204" stroke="currentColor" marker-end="url(#pdc-a9)"/>
</svg><figcaption>Scanning finds three kinds of problem: missing values, repeated rows, and wrong text. Tidy text feeds both duplicate detection (keys must match) and type conversion (extract before coerce); tidy text with few values becomes a category; numeric types make outlier rules possible, and flagged values return to the missing-value decision. The checklist function applies all of it in that order.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the Biteful export</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Scanning</td><td>isna, duplicated, value_counts</td><td>what is wrong?</td><td>1 + 1 blanks, 1 duplicate, 4 city spellings</td><td>every new dataset</td></tr>
    <tr><td>NaN / None / NA</td><td>float NaN, nullable NA</td><td>how is missing stored?</td><td>amount float64; sum 3930, mean 393.0 of 10</td><td>reading any total</td></tr>
    <tr><td>Drop / fill / interpolate</td><td>isna + meaning</td><td>what to do with a gap?</td><td>leave: 393.0; fill 0: 357.3; median: 4540 total</td><td>per column, by meaning</td></tr>
    <tr><td>Duplicates</td><td>row equality</td><td>counted twice?</td><td>order 105: 12 → 11 rows</td><td>after every concat/export</td></tr>
    <tr><td>.str</td><td>vectorised string methods</td><td>tidy text?</td><td>4 spellings → Pune 6, Mumbai 5; "28 min" → "28"</td><td>keys, labels, embedded numbers</td></tr>
    <tr><td>to_numeric / to_datetime</td><td>.str + coerce / format</td><td>right types?</td><td>minutes float64; 04/01/2025 = 4 Jan, not 1 Apr</td><td>any text that should be numbers/dates</td></tr>
    <tr><td>category</td><td>tidy text</td><td>few values / ordered?</td><td>city codes 0/1; size small &lt; medium &lt; large</td><td>low-cardinality columns</td></tr>
    <tr><td>IQR outliers</td><td>numeric type, quartiles</td><td>implausible values?</td><td>fences 12.5, 64.5 → 240 set to NaN</td><td>numeric measurements</td></tr>
    <tr><td>Checklist + asserts</td><td>all of the above</td><td>same, verified, every day?</td><td>11 clean rows; 202k → 200k in ~0.3 s</td><td>any recurring data</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Cleaning is a sequence of decisions, not a sequence of functions.</strong> Every tool here is one line; what makes it right or wrong is the question "what does this value mean?" (a blank amount is unknown revenue, a blank tip is zero, a 240 is a logging error). Order matters because each fix makes the next one possible: tidy text before de-duplicating and converting, numeric types before outlier rules.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The cleaning steps that make data worse.</div>

  <h2 id="pdc-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which "fixes" quietly damage data, and how do you catch them?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: <code>== np.nan</code></span><p>Always False. Use <code>isna()</code> / <code>notna()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: fillna(0) by reflex</span><p>Turns "unknown" into "zero" and drags means down (393.0 → 357.3).</p></div>
  <div class="callout trap"><span class="label">Trap: imputing revenue</span><p>A median fill adds ₹610 that never existed. Leave unknown money unknown and report the count.</p></div>
  <div class="callout trap"><span class="label">Trap: coerce before extract</span><p><code>to_numeric(errors="coerce")</code> on "28 min" gives NaN; extract the digits first and compare NaN counts.</p></div>
  <div class="callout trap"><span class="label">Trap: guessed date formats</span><p>04/01/2025 became 1 April. Pass <code>format=</code> or <code>dayfirst=True</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: missing values hiding as text</span><p>"unknown", "n/a", "-" are not NaN to <code>isna()</code>. Use <code>na_values=</code> or <code>unique()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: de-duplicating untidy keys</span><p>"MUMBAI" and "Mumbai" rows look different. Tidy first, or use an id.</p></div>
  <div class="callout trap"><span class="label">Trap: deleting all outliers</span><p>Flag statistically, decide with domain rules.</p></div>
  <div class="callout trap"><span class="label">Trap: cleaning by hand</span><p>Not repeatable. Write a function, assert its rules, keep the raw data.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="pdc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful's raw export, 12 rows for 2–6 March 2026. Problems: order 105 duplicated; city "Pune"/"Mumbai"/"MUMBAI"/" pune"; amount blank for 107; delivery_minutes "28 min" (105), blank (104), "unknown" (110), 240 (108); customers' signup dates typed dd/mm/yyyy. After cleaning: 11 orders, cities Pune 6 / Mumbai 5, amounts 240, 450, 520, 380, 310, 180, NaN, 260, 600, 290, 700, minutes 32, 41, 38, NaN, 28, 25, 45, NaN, 52, NaN, 35.</p>
  <h3>The ladder in one line each</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on our data</th><th>Weakness → next</th></tr>
    <tr><td>Scan</td><td>what is wrong?</td><td>blanks 1+1, 1 duplicate, 4 spellings, text minutes</td><td>what is "missing"?</td></tr>
    <tr><td>NaN/None/NA</td><td>how stored, how counted?</td><td>count 10 of 11; sum 3930; mean 393.0</td><td>skipping is a choice</td></tr>
    <tr><td>Drop/fill/interpolate</td><td>what to do with gaps?</td><td>leave 393.0 · fill 0 357.3 · median 412.7</td><td>rows counted twice</td></tr>
    <tr><td>Duplicates</td><td>same row twice?</td><td>12 → 11</td><td>text spelt many ways</td></tr>
    <tr><td>.str</td><td>tidy text?</td><td>Pune 6, Mumbai 5; "28 min" → "28"</td><td>still text, not numbers</td></tr>
    <tr><td>Types</td><td>numbers and dates?</td><td>minutes float64; 04/01/2025 = 4 Jan</td><td>repeated labels</td></tr>
    <tr><td>Category</td><td>few or ordered values?</td><td>codes 0/1; small &lt; medium &lt; large</td><td>a valid but absurd value</td></tr>
    <tr><td>Outliers</td><td>implausible?</td><td>fences 12.5–64.5; 240 → NaN</td><td>need it every day</td></tr>
    <tr><td>Checklist</td><td>repeatable, verified?</td><td>clean_orders + asserts; 200k rows</td><td>→ GroupBy</td></tr>
  </table>
  <h3>Formulas and rules</h3>
  <table class="tbl">
    <tr><th>Rule</th><th>Formula</th><th>Symbols</th><th>On our data</th></tr>
    <tr><td>Mean with missing</td><td>mean = Σ known values / number of known values</td><td>NaN excluded from both sums</td><td>3930 / 10 = 393.0</td></tr>
    <tr><td>Linear interpolation</td><td>x<sub>t</sub> = x<sub>a</sub> + (x<sub>b</sub> − x<sub>a</sub>) · (t − a)/(b − a)</td><td>a, b = nearest known positions around t</td><td>(35 + 25)/2 = 30</td></tr>
    <tr><td>IQR</td><td>IQR = Q3 − Q1</td><td>Q1, Q3 = 25th, 75th percentiles</td><td>45 − 32 = 13</td></tr>
    <tr><td>Fences</td><td>Q1 − 1.5·IQR, Q3 + 1.5·IQR</td><td>1.5 = Tukey's conventional multiplier</td><td>12.5, 64.5</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Leave NaN</b><p>Value unknown, row real; report counts.</p><small>Not when a model needs numbers</small></div>
    <div><b>dropna</b><p>Row is useless without the value.</p><small>Not when the row still counts (orders)</small></div>
    <div><b>fillna</b><p>True value known (blank tip = 0), or model input with a missing flag.</p><small>Not for money or facts you do not know</small></div>
    <div><b>interpolate</b><p>Ordered, smooth measurements between known points.</p><small>Not for independent records; not past the last known value</small></div>
    <div><b>coerce</b><p>After extracting what is recoverable; then count new NaN.</p><small>Never blind</small></div>
    <div><b>category</b><p>Few distinct values, or an order.</p><small>Not for ids or free text</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p><code>== np.nan</code>; reflex <code>fillna(0)</code>; imputing money; coerce before extract; guessed date formats; "unknown" not seen by <code>isna</code>; de-duplicating untidy keys; deleting every outlier; cleaning by hand and overwriting raw data.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>pd.Series([240, None, 520]).dtype</code>?</td><td>float64 (None → NaN, a float); use <code>"Int64"</code> to keep integers</td></tr>
    <tr><td>Mean amount if order 107 is filled with 0?</td><td>3930 / 11 = 357.3 (vs 393.0 leaving it NaN)</td></tr>
    <tr><td>What does <code>to_numeric(["28 min"], errors="coerce")</code> give?</td><td>NaN; extract the digits first to keep 28</td></tr>
    <tr><td>IQR fences for 25, 28, 32, 35, 38, 41, 45, 52, 240?</td><td>Q1 32, Q3 45, IQR 13 → 12.5 and 64.5; 240 is outside</td></tr>
    <tr><td>Why tidy text before <code>drop_duplicates</code>?</td><td>"MUMBAI" and "Mumbai" differ, so copies would not be detected</td></tr>
  </table>

  <h2 id="pdc-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>NaN vs None vs pd.NA?</summary><div class="qa-body">NaN is the floating-point missing marker used in float columns; None is Python's null, converted by pandas to NaN or NA; pd.NA is the missing marker of nullable dtypes (Int64, boolean, string) that keeps integers as integers. <code>isna()</code> detects all of them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>np.nan == np.nan</code> False, and what do you use instead?</summary><div class="qa-body">The floating-point standard defines NaN as unequal to everything, itself included ("unknown is not equal to unknown"). Use <code>isna()</code>/<code>notna()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does pandas treat NaN in sum, mean and count?</summary><div class="qa-body">It skips them: sum and mean use only known values (mean divides by the known count), count returns the number of known values, while <code>len</code>/<code>size</code> count rows. The sum of an all-NaN column is 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you drop, fill or interpolate?</summary><div class="qa-body">Drop when the row is useless without the value; fill when you know the true value (0 tip) or a model needs a number (with a missing flag, fitted on training data); interpolate for ordered, smoothly varying measurements; otherwise leave it missing and report the count.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you convert "28 min", "41", "unknown" to numbers?</summary><div class="qa-body"><code>pd.to_numeric(s.str.extract(r"(\\d+)", expand=False), errors="coerce")</code> → 28, 41, NaN. Coercing directly would also turn "28 min" into NaN.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why pass <code>format=</code> to <code>to_datetime</code>?</summary><div class="qa-body">Without it pandas infers the pattern from the first value; "04/01/2025" made it assume month-first, so 4 January became 1 April and every day above 12 became NaT. <code>format="%d/%m/%Y"</code> (or <code>dayfirst=True</code>) removes the guess.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does <code>category</code> help and when does it hurt?</summary><div class="qa-body">It helps for few distinct values (city, status): memory drops and groupby speeds up, and ordered categories sort correctly. It hurts for high-cardinality columns such as ids, where the category table is as big as the data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Remove duplicate customers keeping their latest record.</summary><div class="qa-body"><code>df.sort_values("updated_at").drop_duplicates("customer_id", keep="last")</code>. Check first with <code>df["customer_id"].duplicated().sum()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does .str come before type conversion?</summary><div class="qa-body">Because the numbers are trapped in text ("28 min"). Extracting with <code>.str.extract</code> recovers them; converting first with <code>errors="coerce"</code> would destroy them. Text tools prepare the values that type tools convert.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must outlier rules wait for the type fix?</summary><div class="qa-body">Quartiles and comparisons need numbers. While delivery_minutes was text, "240" was just a string, and "240" &lt; "28" as text. After conversion the IQR rule can flag 240.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in the GroupBy note if you skip cleaning?</summary><div class="qa-body">Grouping by city gives four groups (Pune, Mumbai, MUMBAI, " pune"); the duplicate order 105 adds ₹310 twice to Mumbai; the average delivery time cannot be computed (text) or is pulled up by the 240. Every summary is wrong while looking precise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does missing-data handling here relate to Feature Engineering?</summary><div class="qa-body">The same tools (fillna with a median, missing indicators) become model preprocessing in <a class="xref" data-note="ml_features">Feature Engineering</a>, with one extra rule: fit fill values on the training split only, inside a pipeline, to avoid leakage.</div></details>
</main>
`
});
