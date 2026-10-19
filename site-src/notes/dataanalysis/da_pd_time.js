// notes/dataanalysis/da_pd_time.js — Time Series & Performance
Object.assign(TOPIC_CONTENT, {
  "da_pd_time": `<main>
<h1>Time Series &amp; Performance</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>Time Series &amp; Performance</span></div>
  <p class="lead">The last pandas note answers the owner's two remaining questions: "is revenue going up?" and "will this still work on a year of data?". The first half makes time the index: the <code>.dt</code> accessor, <code>DatetimeIndex</code> and date slicing, <code>resample</code> (time buckets) vs <code>rolling</code> (sliding windows) vs <code>expanding</code> (growing windows), <code>shift</code>/<code>diff</code>/<code>pct_change</code>, time zones briefly, and window functions inside groups (rank, running totals, top-N; the pandas side of <a class="xref" data-note="sql_windows">SQL Window Functions</a>). The second half is speed and memory, all measured on a million generated orders: dtypes and <code>category</code>, vectorisation vs <code>apply</code> vs <code>iterrows</code>, method chaining, and an honest look at when to move to DuckDB, Polars or Spark. Running example: Biteful's 11 clean orders, 2–6 March 2026. Run on pandas 3.0.5, Python 3.13; every timing single-threaded.</p>

  <h2 id="pdt-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="pdt-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Python Collections (dicts, lists) · Files · NumPy arrays</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#pdt-ga)"/>
<line x1="320" y1="102" x2="83" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdt-ga)"/>
<line x1="320" y1="102" x2="241" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdt-ga)"/>
<line x1="320" y1="102" x2="399" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdt-ga)"/>
<line x1="320" y1="102" x2="557" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdt-ga)"/>
<line x1="158" y1="152" x2="164" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdt-ga)"/>
<line x1="316" y1="152" x2="322" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdt-ga)"/>
<line x1="474" y1="152" x2="480" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdt-ga)"/>
<rect x="200" y="62" width="240" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="400">Pandas: the map</text>
<text x="320" y="94" text-anchor="middle" class="tm" font-size="10">why each tool, in what order</text>
<rect x="8" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="83" y="149" text-anchor="middle" font-size="12" font-weight="400">Basics &amp; Selection</text>
<text x="83" y="164" text-anchor="middle" class="tm" font-size="10">table · index · pick</text>
<rect x="166" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="241" y="149" text-anchor="middle" font-size="12" font-weight="400">Cleaning</text>
<text x="241" y="164" text-anchor="middle" class="tm" font-size="10">NaN · types · text</text>
<rect x="324" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="399" y="149" text-anchor="middle" font-size="12" font-weight="400">GroupBy &amp; Merge</text>
<text x="399" y="164" text-anchor="middle" class="tm" font-size="10">summarise · combine · reshape</text>
<rect x="482" y="132" width="150" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="557" y="149" text-anchor="middle" font-size="12" font-weight="700">Time &amp; Speed</text>
<text x="557" y="164" text-anchor="middle" class="tg" font-size="9.5">YOU ARE HERE</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdt-ga)"/>
<rect x="40" y="210" width="560" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Visualisation · SQL joins &amp; windows · Feature Engineering · Time Series · Spark</text>
</svg><figcaption>The Pandas group. Read the map first, then left to right: each note answers a question the one before could not. Dotted arrows show the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="da_pd_groupby">GroupBy, Merge &amp; Reshape</a></b><span>We can total by city, restaurant or cuisine, attach facts from other tables, and lay results out as grids. But a day treated as a label ("03-02 Mon") knows nothing about time: not which day comes next, not how far apart two orders are, not what "the last 3 days" means. And everything ran on 11 rows. The map note <a class="xref" data-note="da_pandas">Pandas: the map</a> placed this note on the last two steps: time-indexed data and making it fast.</span></li>
    <li><b>This note adds: time as a first-class index, and the habits that scale</b><span>Buckets and windows over time, changes and lags, per-group windows, and measured rules for memory and speed.</span></li>
    <li><b>Leads to: beyond pandas</b><span><a class="xref" data-note="ml_timeseries">Time Series Basics</a> (trend, seasonality, stationarity, built on these tools), <a class="xref" data-note="ml_features">Feature Engineering</a> (lag and rolling features), <a class="xref" data-note="sql_windows">Window Functions</a> (the same windows in SQL), and <a class="xref" data-note="de_spark">Apache Spark</a> when one machine is not enough.</span></li>
  </ol>

  <h2 id="pdt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers come from the running example.</p>
  <ol class="story">
    <li><b>The .dt accessor</b><span>Q: what day, what hour, how long between? → <code>order_time.dt.day_name()</code>, <code>.dt.hour</code>; first to last order: 4 days 08:40. But every time question still needs a filter on a column…</span></li>
    <li><b>DatetimeIndex</b><span>Q: can time be the row label? → <code>set_index("order_time")</code>: <code>loc["2026-03-03"]</code> gives Tuesday's 2 orders, <code>loc["2026-03-05":"2026-03-06"]</code> a range. Now: one total per day?</span></li>
    <li><b>resample</b><span>Q: revenue per day, week, month? → groupby by time bucket: 1210, 690, 180, 860, 990, and empty buckets appear as 0. Daily numbers jump around; what is the trend?</span></li>
    <li><b>rolling vs expanding</b><span>Q: a smoothed view, a running total? → <code>rolling(3).mean()</code>: Wednesday (1210 + 690 + 180) / 3 = 693.3; <code>expanding().sum()</code>: 1210, 1900, … 3930. But how does today compare to yesterday?</span></li>
    <li><b>shift, diff, pct_change</b><span>Q: change from the previous period? → Tuesday −520 (−43.0%), Thursday +680 (+377.8%). All follow row order, so sort by time first. Per customer: Asha ordered again after 1 day, then 2. But "the same time" differs between cities and servers…</span></li>
    <li><b>Time zones</b><span>Q: 12:10 where? → <code>tz_localize("Asia/Kolkata")</code> → 06:40 UTC; naive and aware times cannot be compared. Next: rankings and running totals inside each city or customer…</span></li>
    <li><b>Window functions per group</b><span>Q: rank orders within city; each customer's running spend? → <code>groupby().rank(method="dense")</code>: Mumbai 111 first; <code>groupby().cumsum()</code>: Asha 240, 620, 910. Top-2 per city in one filter. On 11 rows all of this is instant; on a million?</span></li>
    <li><b>Memory: dtypes &amp; category</b><span>Q: why does a million orders take 75.5 MB, and can it be less? → <code>category</code> for city and restaurant, downcast ids, float32 for minutes: 28.0 MB, and groupby gets faster. But memory is not the only cost…</span></li>
    <li><b>Vectorised vs apply vs iterrows</b><span>Q: how slow are row loops really? → On 100,000 rows: iterrows 2–3 s, apply about half a second, itertuples a third of a second, vectorised about 2 ms. Then: how do we write long pipelines readably?</span></li>
    <li><b>Method chaining</b><span>Q: many steps without a mess of temporary variables? → one chained expression: dinner revenue Mumbai 1610, Pune 780; <code>pipe</code> for your own functions. And when the data no longer fits pandas?</span></li>
    <li><b>Beyond pandas</b><span>Q: when do DuckDB, Polars or Spark win? → Querying a Parquet file of a million rows: DuckDB and Polars several times faster than pandas even on one thread; for data bigger than memory or a cluster, Spark.</span></li>
  </ol>

  <h2 id="pdt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Time Series &amp; Performance</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Time basics</div>
        <ul>
          <li><code>.dt.day_name()</code>, <code>.dt.hour</code>, <code>.dt.date</code>; Timedelta arithmetic</li>
          <li><code>set_index("order_time").sort_index()</code> → DatetimeIndex</li>
          <li><code>loc["2026-03-03"]</code>, <code>loc["2026-03-05":"2026-03-06"]</code> (end included)</li>
          <li>Time zones: <code>tz_localize</code> then <code>tz_convert</code>; store UTC</li>
          <li>💡 a diary where the date is the page number</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Buckets &amp; windows</div>
        <ul>
          <li><b>resample("D"/"W"/"ME")</b>: non-overlapping buckets (a groupby by time)</li>
          <li><b>rolling(3)</b> / <b>rolling("24h")</b>: sliding window, one result per row</li>
          <li><b>expanding()</b>: from the start to here</li>
          <li>Daily 1210, 690, 180, 860, 990; roll3 693.3, 576.7, 676.7</li>
          <li>⚠ first windows NaN (<code>min_periods</code>); empty buckets → 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Changes &amp; groups</div>
        <ul>
          <li><code>shift(1)</code> lag · <code>diff()</code> change · <code>pct_change()</code> growth</li>
          <li>Tue −520 (−43.0%), Thu +680 (+377.8%)</li>
          <li><code>groupby().rank(method="dense")</code>, <code>cumsum()</code>, <code>cumcount()</code>, <code>diff()</code></li>
          <li>= SQL <code>RANK() / SUM() OVER (PARTITION BY … ORDER BY …)</code></li>
          <li>⚠ all follow row order: sort by time first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Memory</div>
        <ul>
          <li>Measure: <code>memory_usage(deep=True)</code></li>
          <li><code>category</code>: city 12.9 MB → 1.0 MB</li>
          <li>Downcast: <code>to_numeric(downcast="unsigned")</code></li>
          <li>1M orders: 75.5 MB → 28.0 MB; groupby faster</li>
          <li>⚠ float32 ≈ 7 digits; category bad for ids</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Speed</div>
        <ul>
          <li>vectorised ≫ itertuples &gt; apply &gt; iterrows</li>
          <li>100k rows: ~2 ms vs 2–3 s</li>
          <li><code>np.where</code>, <code>np.select</code>, <code>map</code>, <code>.str</code>, <code>pd.cut</code></li>
          <li>Method chains + <code>assign</code>, <code>query</code>, <code>pipe</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Beyond pandas</div>
        <ul>
          <li><b>DuckDB</b>: SQL on Parquet/DataFrames, streams from disk</li>
          <li><b>Polars</b>: lazy, multi-threaded DataFrames</li>
          <li><b>Spark</b>: many machines, data far beyond RAM</li>
          <li>Rule: pandas until it hurts; measure before switching</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdt-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-dt"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Dates as Data: .dt</span><span class="rm-sub">Parts and differences</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-index"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">DatetimeIndex</span><span class="rm-sub">Time as the row label</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-resample"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">resample</span><span class="rm-sub">Buckets of time</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-rolling"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">rolling vs expanding</span><span class="rm-sub">Sliding and growing windows</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-shift"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">shift, diff, pct_change</span><span class="rm-sub">Change from before</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-tz"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Time Zones</span><span class="rm-sub">Briefly</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-win"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Window Functions per Group</span><span class="rm-sub">rank, cumsum, top-N</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-scale"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Same Idea at Scale</span><span class="rm-sub">A million orders, weekly</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-mem"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Memory Optimisation</span><span class="rm-sub">75.5 MB → 28.0 MB, measured</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-vec"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Vectorised vs apply vs iterrows</span><span class="rm-sub">Measured</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-chain"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Method Chaining</span><span class="rm-sub">Readable pipelines</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-beyond"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Beyond pandas</span><span class="rm-sub">DuckDB, Polars, Spark</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Time and speed traps</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pdt-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pdt-dt"><span class="num">01</span>Dates as Data: the .dt Accessor</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In <a class="xref" data-note="da_pd_groupby">GroupBy</a> we made a "day" label with <code>strftime</code>, a piece of text. Text cannot tell us which hour an order came in, whether it was dinner time, or how long the week lasted. What can a real date-time column do?</p>
  </div>
  <h3>The running example</h3>
  <p>Biteful's 11 clean orders (the output of <a class="xref" data-note="da_pd_cleaning">Cleaning</a>), typed as a dict of lists so this note runs on its own. <code>order_time</code> is a real <code>datetime64</code> column, and order 107's amount is honestly missing:</p>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
pd.set_option("display.width", 120, "display.max_columns", None)
orders = pd.DataFrame({
    "order_id":   [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111],
    "customer":   ["Asha", "Ben", "Chen", "Asha", "Dia", "Ben", "Esha", "Chen", "Farah", "Asha", "Dia"],
    "restaurant": ["Dosa Hut", "Biryani Bros", "Pizza Point", "Biryani Bros", "Green Bowl", "Dosa Hut",
                   "Pizza Point", "Momo Magic", "Biryani Bros", "Green Bowl", "Pizza Point"],
    "city":       ["Pune", "Mumbai", "Pune", "Pune", "Mumbai", "Pune", "Mumbai", "Pune", "Mumbai", "Pune", "Mumbai"],
    "order_time": pd.to_datetime(["2026-03-02 12:10", "2026-03-02 13:05", "2026-03-02 20:30", "2026-03-03 13:15",
                                  "2026-03-03 19:45", "2026-03-04 12:40", "2026-03-04 21:10", "2026-03-05 18:20",
                                  "2026-03-05 20:05", "2026-03-06 13:00", "2026-03-06 20:50"]),
    "amount":     [240, 450, 520, 380, 310, 180, np.nan, 260, 600, 290, 700],
    "delivery_minutes": [32, 41, 38, np.nan, 28, 25, 45, np.nan, 52, np.nan, 35],
})
print(orders[["order_id", "customer", "city", "order_time", "amount"]])</div>
  <div class="fx" data-lang="text">    order_id customer    city          order_time  amount
0        101     Asha    Pune 2026-03-02 12:10:00   240.0
1        102      Ben  Mumbai 2026-03-02 13:05:00   450.0
2        103     Chen    Pune 2026-03-02 20:30:00   520.0
3        104     Asha    Pune 2026-03-03 13:15:00   380.0
4        105      Dia  Mumbai 2026-03-03 19:45:00   310.0
5        106      Ben    Pune 2026-03-04 12:40:00   180.0
6        107     Esha  Mumbai 2026-03-04 21:10:00     NaN
7        108     Chen    Pune 2026-03-05 18:20:00   260.0
8        109    Farah  Mumbai 2026-03-05 20:05:00   600.0
9        110     Asha    Pune 2026-03-06 13:00:00   290.0
10       111      Dia  Mumbai 2026-03-06 20:50:00   700.0</div>
  <div class="fx" data-lang="py">t = orders["order_time"]
print(pd.DataFrame({"time": t, "day": t.dt.day_name(), "hour": t.dt.hour,
                    "dinner": t.dt.hour &gt;= 18}).head(4))
print(t.max() - t.min(), "|", (t.max() - t.min()).total_seconds() / 3600, "hours")</div>
  <div class="fx" data-lang="text">                 time      day  hour  dinner
0 2026-03-02 12:10:00   Monday    12   False
1 2026-03-02 13:05:00   Monday    13   False
2 2026-03-02 20:30:00   Monday    20    True
3 2026-03-03 13:15:00  Tuesday    13   False
4 days 08:40:00 | 104.66666666666667 hours</div>
  <p><code>.dt</code> gives a date-time column its date methods, applied to every value (like <code>.str</code> for text): <code>day_name()</code>, <code>hour</code>, and many more (<code>date</code>, <code>month</code>, <code>dayofweek</code>, <code>is_month_end</code>). <code>hour &gt;= 18</code> is an ordinary vectorised comparison, marking order 103 (20:30) as dinner. Subtracting two timestamps gives a <strong>Timedelta</strong>: from Monday 12:10 to Friday 20:50 is 4 days 8 hours 40 minutes, or 104.67 hours.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A date written as text is a photograph of a calendar page; a datetime is the calendar itself: you can ask it which weekday it is, count the days between two pages, or turn to the next one.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>datetime64</code></strong>: pandas' date-time dtype (a count of time units since 1970-01-01). <strong>Timestamp</strong>: one value of it. <strong>Timedelta</strong>: a duration, the difference of two timestamps. <strong><code>.dt</code></strong>: accessor for vectorised date-time attributes and methods of a Series.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>.dt</code> only works on a real datetime column. If <code>order_time</code> came from a CSV without <code>parse_dates</code> it is text, and <code>.dt</code> raises an error: convert with <code>pd.to_datetime</code> first (with a <code>format</code>, as <a class="xref" data-note="da_pd_cleaning">Cleaning</a> showed).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: DatetimeIndex.</b> Each order knows its time. To ask "everything on Tuesday" or "the last 3 days" we still filter a column. What if time were the row label itself?</div>

  <h2 id="pdt-index"><span class="num">02</span>DatetimeIndex: Time as the Row Label</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In <a class="xref" data-note="da_pd_basics">Basics</a>, making <code>order_id</code> the index let <code>loc</code> find orders by name. If the index were the order time, could <code>loc</code> find orders by date, and could pandas group and window by time?</p>
  </div>
  <div class="fx" data-lang="py">ts = orders.set_index("order_time").sort_index()
print(type(ts.index).__name__)
print(ts.loc["2026-03-03", ["customer", "amount"]])                  # one whole day by a string
print(ts.loc["2026-03-05":"2026-03-06", ["customer", "amount"]])     # a date range, end included</div>
  <div class="fx" data-lang="text">DatetimeIndex
                    customer  amount
order_time                          
2026-03-03 13:15:00     Asha   380.0
2026-03-03 19:45:00      Dia   310.0
                    customer  amount
order_time                          
2026-03-05 18:20:00     Chen   260.0
2026-03-05 20:05:00    Farah   600.0
2026-03-06 13:00:00     Asha   290.0
2026-03-06 20:50:00      Dia   700.0</div>
  <p><code>set_index("order_time")</code> moves the times into the index, and <code>sort_index()</code> puts them in time order (every time tool below assumes this). The index is now a <strong>DatetimeIndex</strong>, which understands partial date strings: <code>loc["2026-03-03"]</code> means "every row on that day" (orders 104 and 105), and <code>loc["2026-03-05":"2026-03-06"]</code> is a label slice, so both end days are included (4 orders).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A diary where the date is printed at the top of each page: you open it directly at "3 March" or flip from "5 March" to "6 March", instead of reading every entry to find the dates.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>DatetimeIndex</strong> is an index of timestamps. It enables partial-string selection (<code>"2026-03"</code>, <code>"2026-03-03"</code>), date-range slicing, <code>resample</code>, time-based <code>rolling("24h")</code>, and frequency-aware shifting.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Range slicing on an unsorted DatetimeIndex may raise an error or return unexpected rows. Sort once with <code>sort_index()</code> right after <code>set_index</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: resample.</b> We can pick a day. The owner wants every day's total at once, like groupby, but by time.</div>

  <h2 id="pdt-resample"><span class="num">03</span>resample: Buckets of Time</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Revenue per day" is split-apply-combine where the key is the calendar day. A text day label works, but it would miss days with no orders, and changing to weeks or months means making a new label. Is there a groupby that understands time?</p>
  </div>
  <div class="fx" data-lang="py">daily = ts["amount"].resample("D").sum()
print(daily)</div>
  <div class="fx" data-lang="text">order_time
2026-03-02    1210.0
2026-03-03     690.0
2026-03-04     180.0
2026-03-05     860.0
2026-03-06     990.0
Freq: D, Name: amount, dtype: float64</div>
  <p>By hand, adding each day's orders: Monday 240 + 450 + 520 = 1210; Tuesday 380 + 310 = 690; Wednesday 180 + (NaN, skipped) = 180; Thursday 260 + 600 = 860; Friday 290 + 700 = 990. <code>resample("D")</code> made one bucket per calendar day from the first to the last ("Freq: D"), then summed each.</p>
  <div class="fx" data-lang="py">print(ts.resample("D").agg(orders=("order_id", "size"), revenue=("amount", "sum"),
                           avg_minutes=("delivery_minutes", "mean")))</div>
  <div class="fx" data-lang="text">            orders  revenue  avg_minutes
order_time                              
2026-03-02       3   1210.0         37.0
2026-03-03       2    690.0         28.0
2026-03-04       2    180.0         35.0
2026-03-05       2    860.0         52.0
2026-03-06       2    990.0         35.0</div>
  <p>The same named aggregations as groupby work on resample: Wednesday has 2 orders but revenue only 180, because order 107's amount is unknown. Showing <code>orders</code> next to <code>revenue</code> makes that visible.</p>
  <div class="fx" data-lang="py">print(ts["amount"].resample("12h").sum().head(5))</div>
  <div class="fx" data-lang="text">order_time
2026-03-02 12:00:00    1210.0
2026-03-03 00:00:00       0.0
2026-03-03 12:00:00     690.0
2026-03-04 00:00:00       0.0
2026-03-04 12:00:00     180.0
Freq: 12h, Name: amount, dtype: float64</div>
  <p>With 12-hour buckets, the midnight-to-noon buckets have no orders and show 0.0. resample creates every bucket in the range, even empty ones; that is what makes it right for time series (a missing day is a real zero-order day, not a missing row), but a sum of nothing is 0, not NaN, so check counts. Common rules: <code>"h"</code> hour, <code>"D"</code> day, <code>"W"</code> week (ending Sunday), <code>"ME"</code> month end, <code>"QE"</code> quarter end, <code>"YE"</code> year end.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Sorting receipts into envelopes labelled with each date, including empty envelopes for days the shop was quiet, then writing each envelope's total on its front.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>resample(rule)</code> groups rows of a time-indexed object into consecutive, non-overlapping time bins of the given frequency (all bins in the range, even empty) and then aggregates each bin. It is <code>groupby(pd.Grouper(freq=rule))</code>. Use <code>on="col"</code> to resample by a datetime column instead of the index.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The first and last buckets are often partial: a week starting on a Thursday, a month that has only begun. Comparing a partial bucket with full ones shows fake growth or decline (section 08 has a real example).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: rolling vs expanding.</b> Daily revenue jumps from 1210 to 180 to 990. Is Biteful growing or shrinking? We need a smoothed view and a running total.</div>

  <h2 id="pdt-rolling"><span class="num">04</span>rolling vs expanding</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One bad day (Wednesday, 180) dominates the daily picture. A trend view should average over several days, and moving forward one day at a time. And "how much so far this week?" needs a total that grows. How are these different from resample?</p>
  </div>
  <div class="fx" data-lang="py">print(pd.DataFrame({"revenue": daily,
                    "roll3_mean": daily.rolling(3).mean().round(1),
                    "roll3_min1": daily.rolling(3, min_periods=1).mean().round(1),
                    "expanding_sum": daily.expanding().sum(),
                    "cumsum": daily.cumsum()}))</div>
  <div class="fx" data-lang="text">            revenue  roll3_mean  roll3_min1  expanding_sum  cumsum
order_time                                                        
2026-03-02   1210.0         NaN      1210.0         1210.0  1210.0
2026-03-03    690.0         NaN       950.0         1900.0  1900.0
2026-03-04    180.0       693.3       693.3         2080.0  2080.0
2026-03-05    860.0       576.7       576.7         2940.0  2940.0
2026-03-06    990.0       676.7       676.7         3930.0  3930.0</div>
  <table class="tbl"><caption>rolling(3).mean() by hand</caption>
    <tr><th>Day</th><th>Window</th><th>Mean</th></tr>
    <tr><td>Mon</td><td>1210 (only 1 value)</td><td>NaN (needs 3)</td></tr>
    <tr><td>Tue</td><td>1210, 690 (2 values)</td><td>NaN (needs 3)</td></tr>
    <tr><td>Wed</td><td>1210, 690, 180</td><td>2080 / 3 = 693.3</td></tr>
    <tr><td>Thu</td><td>690, 180, 860</td><td>1730 / 3 = 576.7</td></tr>
    <tr><td>Fri</td><td>180, 860, 990</td><td>2030 / 3 = 676.7</td></tr>
  </table>
  <ul>
    <li><code>rolling(3)</code>: a window of the current row and the 2 before it, sliding down one row at a time; one result per row.</li>
    <li><code>min_periods=1</code>: compute with however many values are available, so Monday = 1210 and Tuesday = (1210 + 690) / 2 = 950.</li>
    <li><code>expanding().sum()</code>: a window from the first row to the current one, so a running total: 1210, 1900, 2080, 2940, 3930. It equals <code>cumsum()</code> for sums; <code>expanding().mean()</code> would be the running average.</li>
  </ul>
  <h3>Windows measured in time, not rows</h3>
  <div class="fx" data-lang="py">per_order = ts["amount"].dropna()
print(pd.DataFrame({"amount": per_order,
                    "last_24h_sum": per_order.rolling("24h").sum()}).head(6))</div>
  <div class="fx" data-lang="text">                     amount  last_24h_sum
order_time                               
2026-03-02 12:10:00   240.0         240.0
2026-03-02 13:05:00   450.0         690.0
2026-03-02 20:30:00   520.0        1210.0
2026-03-03 13:15:00   380.0         900.0
2026-03-03 19:45:00   310.0        1210.0
2026-03-04 12:40:00   180.0         870.0</div>
  <p>On the order-level series (missing amount dropped), <code>rolling("24h")</code> uses every order in the 24 hours up to and including each order, however many there are. Tuesday 13:15: the window starts Monday 13:15, so it holds Monday 20:30 (520) and itself (380) = 900; Monday's 12:10 and 13:05 orders fell out. A row count cannot do this when orders are irregular.</p>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <text x="10" y="16" class="tm" font-size="10">daily revenue (Mon … Fri)</text>
    <rect x="20" y="24" width="110" height="24" class="fs" stroke="currentColor" stroke-opacity="0.4"/><rect x="140" y="24" width="110" height="24" class="fs" stroke="currentColor" stroke-opacity="0.4"/><rect x="260" y="24" width="110" height="24" class="fs" stroke="currentColor" stroke-opacity="0.4"/><rect x="380" y="24" width="110" height="24" class="fs" stroke="currentColor" stroke-opacity="0.4"/><rect x="500" y="24" width="110" height="24" class="fs" stroke="currentColor" stroke-opacity="0.4"/>
    <text x="75" y="41" text-anchor="middle" font-size="11">1210</text><text x="195" y="41" text-anchor="middle" font-size="11">690</text><text x="315" y="41" text-anchor="middle" font-size="11">180</text><text x="435" y="41" text-anchor="middle" font-size="11">860</text><text x="555" y="41" text-anchor="middle" font-size="11">990</text>
    <rect x="20" y="58" width="350" height="18" class="fb sb"/><text x="380" y="72" font-size="10.5">rolling(3) at Wed → 693.3</text>
    <rect x="140" y="82" width="350" height="18" class="ft st"/><text x="500" y="96" font-size="10.5">at Thu → 576.7</text>
    <rect x="20" y="106" width="470" height="18" class="fg sg"/><text x="500" y="120" font-size="10.5">expanding at Thu → 2940</text>
    <text x="10" y="144" class="tm" font-size="10">resample makes the buckets (days); rolling slides a fixed-size window over them; expanding always starts at the first row</text>
  </svg><figcaption>Three ways of looking back. resample decides what one row is (a day); rolling(3) averages the last three rows and slides; expanding keeps everything from the start.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A batter's "average over the last 3 innings" slides forward one match at a time (rolling), so one bad day does not swing it for long. Their career runs only ever grow (expanding).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>rolling(window, min_periods=None)</code>: a moving window of a fixed number of rows (or a time span like <code>"24h"</code> on a DatetimeIndex) ending at each row, followed by an aggregation (<code>mean</code>, <code>sum</code>, <code>max</code>, <code>std</code>, …). <code>expanding(min_periods=1)</code>: a window from the first row to each row. Both return one value per input row.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A row-count window on irregular data mixes different time spans ("last 3 rows" might be 3 hours or 3 weeks). Resample to a regular frequency first, or use a time-based window. And <code>center=True</code> uses future values: fine for a chart, leakage for a forecast feature (<a class="xref" data-note="ml_features">Feature Engineering</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: shift, diff, pct_change.</b> The 3-day average shows the level. The owner's sharper question is "how did today do compared with yesterday?"</div>

  <h2 id="pdt-shift"><span class="num">05</span>shift, diff, pct_change</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>To compare each day with the previous one, each row needs to see the row before it. Vectorised operations work row by row in parallel. How do we put yesterday's value on today's row?</p>
  </div>
  <div class="fx" data-lang="py">print(pd.DataFrame({"revenue": daily,
                    "yesterday": daily.shift(1),
                    "diff": daily.diff(),
                    "pct_change": (daily.pct_change() * 100).round(1)}))</div>
  <div class="fx" data-lang="text">            revenue  yesterday   diff  pct_change
order_time                                       
2026-03-02   1210.0        NaN    NaN         NaN
2026-03-03    690.0     1210.0 -520.0       -43.0
2026-03-04    180.0      690.0 -510.0       -73.9
2026-03-05    860.0      180.0  680.0       377.8
2026-03-06    990.0      860.0  130.0        15.1</div>
  <ul>
    <li><code>shift(1)</code> moves every value down one row: today's row now holds yesterday's revenue (a <strong>lag</strong>). Monday has no yesterday: NaN.</li>
    <li><code>diff()</code> = value − previous value: Tuesday 690 − 1210 = −520; Thursday 860 − 180 = +680.</li>
    <li><code>pct_change()</code> = (value − previous) / previous: Tuesday −520 / 1210 = −0.430 → −43.0%; Thursday 680 / 180 = 3.778 → +377.8%. A big percentage on a small base: the 180 was a bad day (and one amount is unknown), not a collapse.</li>
  </ul>
  <h3>Row order, not time order</h3>
  <div class="fx" data-lang="py">shuffled = daily.sample(frac=1, random_state=1)
print(pd.DataFrame({"revenue": shuffled, "diff (wrong order)": shuffled.diff()}))</div>
  <div class="fx" data-lang="text">            revenue  diff (wrong order)
order_time                             
2026-03-04    180.0                 NaN
2026-03-03    690.0               510.0
2026-03-06    990.0               300.0
2026-03-02   1210.0               220.0
2026-03-05    860.0              -350.0</div>
  <p>The same five days in shuffled order: <code>diff()</code> happily subtracts whatever row is above, so "Tuesday minus Wednesday" (690 − 180 = 510) appears as Tuesday's change. Nothing warns you. Sort by time (<code>sort_index()</code> or <code>sort_values("order_time")</code>) before any lag.</p>
  <h3>Per customer: days between orders</h3>
  <div class="fx" data-lang="py">o = orders.sort_values("order_time")
o["nth_order"] = o.groupby("customer").cumcount() + 1
o["days_since_prev"] = o.groupby("customer")["order_time"].diff().dt.days
print(o.loc[o["customer"].isin(["Asha", "Dia"]), ["customer", "order_time", "nth_order", "days_since_prev"]])</div>
  <div class="fx" data-lang="text">   customer          order_time  nth_order  days_since_prev
0      Asha 2026-03-02 12:10:00          1              NaN
3      Asha 2026-03-03 13:15:00          2              1.0
4       Dia 2026-03-03 19:45:00          1              NaN
9      Asha 2026-03-06 13:00:00          3              2.0
10      Dia 2026-03-06 20:50:00          2              3.0</div>
  <p>Inside groups the same tools number and difference each customer's orders, after sorting by time. <code>cumcount() + 1</code> numbers orders 1, 2, 3 within each customer. <code>groupby("customer")["order_time"].diff()</code> subtracts each customer's previous order time; <code>.dt.days</code> keeps whole days. Asha: Monday 12:10 → Tuesday 13:15 is 1 day 1 hour 5 minutes → 1; Tuesday 13:15 → Friday 13:00 is 2 days 23 hours 45 minutes → 2 (whole days, rounded down). Each customer's first order has no previous one: NaN.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>shift is sliding a transparent copy of the sales sheet down one line, so each day's line shows yesterday's figure underneath. If the sheet's days are out of order, you compare with the wrong day.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>shift(k)</code>: move values k rows down (k &gt; 0, lag) or up (k &lt; 0, lead). <code>diff(k)</code> = x<sub>t</sub> − x<sub>t−k</sub>. <code>pct_change(k)</code> = (x<sub>t</sub> − x<sub>t−k</sub>) / x<sub>t−k</sub>. On groups: <code>df.groupby(key)[col].shift()</code>, <code>.diff()</code>, so values never cross from one group into another.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Without <code>groupby</code>, <code>diff</code> on a table sorted by customer and time would subtract Asha's last order from Ben's first. And a lead (<code>shift(-1)</code>) uses the future: never as a model feature.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Time Zones.</b> Every time so far was "12:10" with no place attached. When Biteful's servers log in UTC and its apps in local time, which 12:10 is which?</div>

  <h2 id="pdt-tz"><span class="num">06</span>Time Zones, Briefly</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our order times have no time zone ("naive"). If Biteful expands to Dubai, or its payment system logs in UTC, the same instant has different clock readings. How does pandas attach and convert zones?</p>
  </div>
  <div class="fx" data-lang="py">local = orders["order_time"].head(3).dt.tz_localize("Asia/Kolkata")
print(pd.DataFrame({"local (IST)": local, "UTC": local.dt.tz_convert("UTC")}))
try:
    print(local.iloc[0] &lt; orders["order_time"].iloc[0])
except TypeError as e:
    print("TypeError:", e)</div>
  <div class="fx" data-lang="text">                local (IST)                       UTC
0 2026-03-02 12:10:00+05:30 2026-03-02 06:40:00+00:00
1 2026-03-02 13:05:00+05:30 2026-03-02 07:35:00+00:00
2 2026-03-02 20:30:00+05:30 2026-03-02 15:00:00+00:00
TypeError: Cannot compare tz-naive and tz-aware timestamps</div>
  <p><code>tz_localize("Asia/Kolkata")</code> says "these clock readings were Indian Standard Time" (it attaches the zone, +05:30, without changing the clock time). <code>tz_convert("UTC")</code> then expresses the same instants in another zone: 12:10 IST is 06:40 UTC. Comparing a zone-aware time with a naive one raises <code>TypeError</code>, because pandas cannot know what the naive one meant.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A meeting invitation that says "10 o'clock" without a city is useless to a team in two countries. Localizing writes the city on the invitation; converting tells each person their own local time for the same meeting.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Naive</strong> timestamps have no zone; <strong>aware</strong> timestamps carry one. <code>tz_localize(zone)</code>: naive → aware, same clock reading. <code>tz_convert(zone)</code>: aware → aware, same instant, new clock reading. On a column use <code>.dt.tz_localize</code>/<code>.dt.tz_convert</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Daylight-saving zones (Europe, US) have a missing hour in spring and a repeated hour in autumn, so localizing can fail or be ambiguous (<code>nonexistent=</code>, <code>ambiguous=</code> options). A common rule: store and compute in UTC, convert to local only for display, and resample daily totals in the zone whose "day" the business means.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Window Functions per Group.</b> All our windows ran over the whole table. Rankings within each city and running totals per customer need windows that restart for every group.</div>

  <h2 id="pdt-win"><span class="num">07</span>Window Functions per Group: rank, cumsum, top-N</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Rank each order within its city", "each customer's running spend", "the top 2 orders per city": each needs a computation that looks at other rows of the same group but still returns one value per row. In SQL these are window functions (<a class="xref" data-note="sql_windows">Window Functions</a>). What is the pandas form?</p>
  </div>
  <div class="fx" data-lang="py">o["rank_in_city"] = o.groupby("city")["amount"].rank(method="dense", ascending=False)
o["running_spend"] = o.groupby("customer")["amount"].cumsum()
print(o.sort_values(["city", "rank_in_city"])[["order_id", "city", "amount", "rank_in_city"]].head(6))
print(o.loc[o["customer"] == "Asha", ["order_id", "amount", "running_spend"]])</div>
  <div class="fx" data-lang="text">    order_id    city  amount  rank_in_city
10       111  Mumbai   700.0           1.0
8        109  Mumbai   600.0           2.0
1        102  Mumbai   450.0           3.0
4        105  Mumbai   310.0           4.0
6        107  Mumbai     NaN           NaN
2        103    Pune   520.0           1.0
   order_id  amount  running_spend
0       101   240.0          240.0
3       104   380.0          620.0
9       110   290.0          910.0</div>
  <p><code>groupby("city")["amount"].rank(method="dense", ascending=False)</code> ranks amounts within each city, largest first: Mumbai 700 → 1, 600 → 2, 450 → 3, 310 → 4, and the unknown amount gets no rank (NaN). <code>groupby("customer")["amount"].cumsum()</code> keeps a running total that restarts for each customer: Asha 240, 240 + 380 = 620, 620 + 290 = 910 (on <code>o</code>, already sorted by time). Both are <code>transform</code>-shaped: one value per original row.</p>
  <h3>Tie rules</h3>
  <div class="fx" data-lang="py">x = pd.Series([700, 600, 600, 450], index=["a", "b", "c", "d"])
print(pd.DataFrame({"amount": x, "first": x.rank(method="first", ascending=False),
                    "min": x.rank(method="min", ascending=False),
                    "dense": x.rank(method="dense", ascending=False)}))</div>
  <div class="fx" data-lang="text">   amount  first  min  dense
a     700    1.0  1.0    1.0
b     600    2.0  2.0    2.0
c     600    3.0  2.0    2.0
d     450    4.0  4.0    3.0</div>
  <p>Two orders tied at 600: <code>first</code> breaks the tie by row order (2, 3); <code>min</code> gives both the lower rank and skips the next (2, 2, then 4), like SQL <code>RANK()</code>; <code>dense</code> gives both 2 and continues with 3, like <code>DENSE_RANK()</code>. <code>first</code> matches <code>ROW_NUMBER()</code>.</p>
  <h3>Top-N per group</h3>
  <div class="fx" data-lang="py">print(o[o["rank_in_city"] &lt;= 2][["city", "order_id", "customer", "amount"]].sort_values(["city", "amount"]))</div>
  <div class="fx" data-lang="text">      city  order_id customer  amount
8   Mumbai       109    Farah   600.0
10  Mumbai       111      Dia   700.0
3     Pune       104     Asha   380.0
2     Pune       103     Chen   520.0</div>
  <p>Filter on the rank: the 2 largest orders in each city. Mumbai 600 and 700 (Farah, Dia), Pune 380 and 520 (Asha, Chen). If ties should both be kept, <code>dense</code> or <code>min</code> ranks keep them; <code>sort_values(...).groupby(...).head(2)</code> would cut at exactly 2 rows.</p>
  <table class="tbl"><caption>pandas ↔ SQL window functions</caption>
    <tr><th>pandas</th><th>SQL</th></tr>
    <tr><td><code>g.rank(method="first")</code></td><td><code>ROW_NUMBER() OVER (PARTITION BY city ORDER BY amount DESC)</code></td></tr>
    <tr><td><code>g.rank(method="min")</code> / <code>"dense"</code></td><td><code>RANK()</code> / <code>DENSE_RANK()</code></td></tr>
    <tr><td><code>g.cumsum()</code></td><td><code>SUM(amount) OVER (PARTITION BY customer ORDER BY order_time)</code></td></tr>
    <tr><td><code>g.shift(1)</code> / <code>g.diff()</code></td><td><code>LAG(x) OVER (…)</code> / <code>x − LAG(x)</code></td></tr>
    <tr><td><code>g.transform("sum")</code></td><td><code>SUM(x) OVER (PARTITION BY …)</code></td></tr>
    <tr><td><code>g.rolling(3).mean()</code></td><td><code>AVG(x) OVER (… ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school sports day: runners are ranked within their own house, not across the whole school, and each house keeps its own running points tally that resets for the next house.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>window function</strong> computes, for each row, a value from a set of related rows (its partition, optionally ordered and framed) without collapsing rows. In pandas: <code>df.groupby(partition)[col]</code> followed by <code>rank</code>, <code>cumsum</code>, <code>cumcount</code>, <code>shift</code>, <code>diff</code>, <code>transform</code> or <code>rolling</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>cumsum</code>, <code>cumcount</code>, <code>shift</code> and <code>diff</code> follow the current row order inside each group; only <code>rank</code> sorts by value itself. Sort by time first. And <code>cumsum</code> skips NaN but keeps the running total going (Esha's NaN would leave her total at NaN only on that row).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Same Idea at Scale.</b> Every tool so far is checked by hand on 11 orders. What do they look like on a full quarter of data?</div>

  <h2 id="pdt-scale"><span class="num">08</span>The Same Idea at Scale</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On five days, a 3-day average is a toy. On 90 days and a million orders, do resample, rolling and pct_change still give a readable trend, and what new trap appears?</p>
  </div>
  <div class="fx" data-lang="py">def make_orders(n, seed=0):
    """Same shape as the 11-row table, n rows (from Basics)."""
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
big = make_orders(1_000_000)
weekly = big.set_index("order_time").sort_index()["amount"].resample("W").sum()
print(pd.DataFrame({"revenue": weekly, "ma4": weekly.rolling(4).mean().round(0),
                    "wow_pct": (weekly.pct_change() * 100).round(1)}).head(6))</div>
  <div class="fx" data-lang="text">               revenue         ma4  wow_pct
order_time                                 
2026-01-04  17815382.0         NaN      NaN
2026-01-11  30975484.0         NaN     73.9
2026-01-18  30962306.0         NaN     -0.0
2026-01-25  31081886.0  27708764.0      0.4
2026-02-01  30956155.0  30993958.0     -0.4
2026-02-08  31240118.0  31060116.0      0.9</div>
  <p>The generator from <a class="xref" data-note="da_pd_basics">Basics</a> makes 1,000,000 orders over 1 January to 31 March 2026. Weekly revenue (<code>"W"</code> = weeks ending Sunday), a 4-week moving average, and week-over-week change. The first row is the trap from section 03: 1 January 2026 is a Thursday, so the first "week" holds only 4 days (Thursday to Sunday), and the "+73.9%" growth into week 2 is entirely the partial first bucket. After that, generated data is flat (changes under 1%), as it should be: the generator has no trend.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Comparing this month's sales to "last month" when last month was the shop's opening week: the growth is an artefact of the calendar, not of the business.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>partial period</strong> is a resample bucket that covers less time than the others (at the start or end of the data, or around gaps). Drop it, label it, or normalise by the number of days before comparing.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The latest bucket is usually partial too ("this month so far"). Dashboards that compare it with full months always show a fake decline.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Memory Optimisation.</b> The analysis works on a million rows. How much memory does that table use, and can the same data fit in less?</div>

  <h2 id="pdt-mem"><span class="num">09</span>Memory Optimisation, Measured</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>pandas keeps everything in RAM and usually needs a few times the table's size for intermediate results. When a year of data is ten million orders, memory decides whether the analysis runs at all. Where does the memory go, and which dtypes shrink it?</p>
  </div>
  <div class="fx" data-lang="py">def mb(df):
    return round(df.memory_usage(deep=True).sum() / 1e6, 1)
print(big.dtypes)
print("total MB:", mb(big))
print((big.memory_usage(deep=True) / 1e6).round(1))</div>
  <div class="fx" data-lang="text">order_id                     int64
customer                       str
restaurant                     str
city                           str
order_time          datetime64[us]
amount                     float64
delivery_minutes           float64
dtype: object
total MB: 75.5
Index                0.0
order_id             8.0
customer            12.4
restaurant          18.2
city                12.9
order_time           8.0
amount               8.0
delivery_minutes     8.0
dtype: float64</div>
  <p><code>memory_usage(deep=True)</code> measures each column including the text itself (without <code>deep</code>, text columns are under-counted). Numeric and datetime columns cost 8 bytes per row (8.0 MB per million). The three text columns cost more: customer 12.4 MB, restaurant 18.2 MB, city 12.9 MB. Total 75.5 MB.</p>
  <div class="fx" data-lang="py">city_str = big["city"]
print("str (pyarrow) :", round(city_str.memory_usage(deep=True) / 1e6, 1), "MB")
print("object        :", round(city_str.astype(object).memory_usage(deep=True) / 1e6, 1), "MB")
print("category      :", round(city_str.astype("category").memory_usage(deep=True) / 1e6, 1), "MB")
print("order_id as category:", round(big["order_id"].astype("category").memory_usage(deep=True) / 1e6, 1),
      "MB vs int64", round(big["order_id"].memory_usage(deep=True) / 1e6, 1), "MB")</div>
  <div class="fx" data-lang="text">str (pyarrow) : 12.9 MB
object        : 53.9 MB
category      : 1.0 MB
order_id as category: 12.0 MB vs int64 8.0 MB</div>
  <p>The same city column in three representations. pandas 3's <code>str</code> dtype (stored with pyarrow here) needs 12.9 MB; the old <code>object</code> dtype (a Python string object per row) 53.9 MB; <code>category</code> (2 labels + a 1-byte code per row) 1.0 MB. Category is not magic: for <code>order_id</code>, where every value is different, it costs 12.0 MB against 8.0 MB as plain integers.</p>
  <div class="fx" data-lang="py">small = big.copy()
for col in ["restaurant", "city"]:
    small[col] = small[col].astype("category")               # few distinct values
small["customer"] = pd.to_numeric(small["customer"], downcast="unsigned")   # "17013" -&gt; uint16
small["order_id"] = pd.to_numeric(small["order_id"], downcast="unsigned")   # -&gt; uint32
small["delivery_minutes"] = small["delivery_minutes"].astype("float32")
print(small.dtypes)
print("before:", mb(big), "MB   after:", mb(small), "MB")</div>
  <div class="fx" data-lang="text">order_id                    uint32
customer                    uint16
restaurant                category
city                      category
order_time          datetime64[us]
amount                     float64
delivery_minutes           float32
dtype: object
before: 75.5 MB   after: 28.0 MB</div>
  <p>The changes: restaurant and city → <code>category</code> (few distinct values); customer ids "1" to "20000" → numbers, and <code>downcast="unsigned"</code> picks the smallest unsigned type that fits (<code>uint16</code>, 0 to 65,535: 2 bytes); order ids up to 1,000,000 → <code>uint32</code> (4 bytes); delivery minutes → <code>float32</code> (4 bytes, ample precision for minutes). Amount stays <code>float64</code> (money). 75.5 MB → 28.0 MB.</p>
  <div class="fx" data-lang="py">import time
def best_ms(f, reps=5):
    out = []
    for _ in range(reps):
        t0 = time.perf_counter(); f(); out.append(time.perf_counter() - t0)
    return round(min(out) * 1000, 1)
print("groupby city+restaurant  str:", best_ms(lambda: big.groupby(["city", "restaurant"])["amount"].sum()), "ms",
      "  category:", best_ms(lambda: small.groupby(["city", "restaurant"], observed=True)["amount"].sum()), "ms")</div>
  <div class="fx" data-lang="text">groupby city+restaurant  str: 61.1 ms   category: 33.4 ms</div>
  <p>Smaller types also make work faster: grouping by two categorical columns works on small integer codes instead of hashing strings (<code>observed=True</code> lists only combinations that occur). Exact milliseconds vary by machine; the direction does not.</p>
  <div class="fx" data-lang="py">print(np.float32(12_345_678.91), "vs", np.float64(12_345_678.91))</div>
  <div class="fx" data-lang="text">1.2345679e+07 vs 12345678.91</div>
  <p>The limit of <code>float32</code>: about 7 significant digits. ₹1,23,45,678.91 stored as float32 loses the paise (and more for bigger sums). Keep money, and anything you will add up over many rows, in <code>float64</code> or integer paise.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Category is a phone's contact list: "Biryani Bros" is saved once and every call log entry just points to it. Downcasting is choosing the right-sized box: you do not ship a pen in a refrigerator carton.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Downcasting</strong>: converting a column to a smaller dtype that still holds all its values (<code>int64</code> → <code>uint16</code>, <code>float64</code> → <code>float32</code>), with <code>pd.to_numeric(s, downcast="integer"|"unsigned"|"float")</code> or <code>astype</code>. <strong>Cardinality</strong>: the number of distinct values in a column; low cardinality is where <code>category</code> pays.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Optimise at load time (<code>read_csv(dtype={…})</code>, Parquet keeps the dtypes) rather than after loading a huge file in its widest form. And measure: <code>category</code> on high-cardinality columns and <code>float32</code> on money make things worse.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Vectorised vs apply vs iterrows.</b> The table is small. The other cost is time: how much do row-by-row loops really cost compared with column operations?</div>

  <h2 id="pdt-vec"><span class="num">10</span>Vectorised vs apply vs iterrows, Measured</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><a class="xref" data-note="da_pd_basics">Basics</a> compared <code>apply</code> with one vectorised line. There are four common ways to compute the delivery fee (₹30 Pune, ₹40 Mumbai) for every order. How do they compare on 100,000 rows, and why?</p>
  </div>
  <div class="fx" data-lang="py">b = big.head(100_000)
def with_iterrows():
    return [r["amount"] + (30 if r["city"] == "Pune" else 40) for _, r in b.iterrows()]
def with_apply():
    return b.apply(lambda r: r["amount"] + (30 if r["city"] == "Pune" else 40), axis=1)
def with_itertuples():
    return [r.amount + (30 if r.city == "Pune" else 40) for r in b.itertuples()]
def vectorised():
    return b["amount"] + np.where(b["city"] == "Pune", 30, 40)
res = {f.__name__: best_ms(f, reps=1 if f in (with_iterrows, with_apply) else 5)
       for f in (with_iterrows, with_apply, with_itertuples, vectorised)}
for name, t_ms in res.items():
    print(f"{name:16} {t_ms:9.1f} ms   {res['with_iterrows'] / t_ms:7.0f}x faster than iterrows")
print("same answer:", np.allclose(with_itertuples(), vectorised()))</div>
  <div class="fx" data-lang="text">with_iterrows       2466.2 ms         1x faster than iterrows
with_apply           576.2 ms         4x faster than iterrows
with_itertuples      304.3 ms         8x faster than iterrows
vectorised             2.0 ms      1233x faster than iterrows
same answer: True</div>
  <ul>
    <li><code>iterrows</code>: a Python loop that builds a whole Series object for every row. The slowest by far.</li>
    <li><code>apply(axis=1)</code>: the same idea, with the loop inside pandas; still a Series per row and a Python call per row.</li>
    <li><code>itertuples</code>: a Python loop over lightweight named tuples; faster, still Python per row.</li>
    <li>Vectorised: <code>np.where</code> builds the fee column and <code>+</code> adds it, each once over the whole column in compiled code. Over a thousand times faster than <code>iterrows</code>, and the same answer (<code>np.allclose</code> → True).</li>
  </ul>
  <div class="fx" data-lang="py">print(orders["city"].map({"Pune": 30, "Mumbai": 40}).tolist())
print(np.select([orders["amount"] &gt;= 500, orders["amount"] &gt;= 300], ["large", "medium"], default="small").tolist())</div>
  <div class="fx" data-lang="text">[30, 40, 30, 30, 40, 30, 40, 30, 40, 30, 40]
['small', 'medium', 'large', 'medium', 'medium', 'small', 'small', 'small', 'large', 'small', 'large']</div>
  <p>Two more vectorised replacements for per-row if/else: <code>map(dict)</code> looks up each city's fee; <code>np.select([conditions], [choices], default)</code> handles several branches in order (500 or more → large, else 300 or more → medium, else small). Note order 107: its amount is NaN, every comparison with NaN is False, so it fell through to <code>default="small"</code>. Missing values need a deliberate branch.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>iterrows</code> is a clerk who photocopies each customer's whole file before reading one field from it. <code>itertuples</code> reads the field straight from the file. Vectorised is a machine that stamps the fee on every file in the drawer at once.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Order of preference: built-in vectorised operations (arithmetic, comparisons, <code>np.where</code>/<code>np.select</code>, <code>map</code>, <code>.str</code>, <code>.dt</code>, <code>groupby</code> aggregations) → <code>itertuples</code> when a loop is unavoidable → <code>apply</code> for complex functions on few rows → <code>iterrows</code> almost never.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>iterrows</code> also changes types: each row becomes a Series with one dtype, so ints can come back as floats. And writing into the DataFrame inside an <code>iterrows</code> loop does not change it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Method Chaining.</b> Fast steps are only half of maintainable code. A real analysis has ten steps; how do we write them so they read top to bottom?</div>

  <h2 id="pdt-chain"><span class="num">11</span>Method Chaining</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Dinner revenue per city, known amounts only, largest first" takes five steps. Written as five assignments to <code>df</code>, <code>df2</code>, <code>tmp</code>, the order and purpose get lost, and stale variables cause bugs. Can a pipeline read like a recipe?</p>
  </div>
  <div class="fx" data-lang="py">report = (
    orders
    .dropna(subset=["amount"])
    .assign(day=lambda d: d["order_time"].dt.day_name(),
            dinner=lambda d: d["order_time"].dt.hour &gt;= 18)
    .query("dinner")
    .groupby("city")
    .agg(dinners=("order_id", "size"), revenue=("amount", "sum"))
    .sort_values("revenue", ascending=False)
)
print(report)</div>
  <div class="fx" data-lang="text">        dinners  revenue
city                    
Mumbai        3   1610.0
Pune          2    780.0</div>
  <p>Each method returns a new DataFrame, so the next method is called on it. Wrapped in parentheses, the chain can span lines and read top to bottom: drop unknown amounts → add <code>day</code> and <code>dinner</code> columns (<code>assign</code> with lambdas that see the table at that step) → keep dinners (<code>query("dinner")</code>) → group by city → named aggregations → sort. By hand: Mumbai dinners with known amounts are 105 (310), 109 (600), 111 (700) = 1610; Pune 103 (520), 108 (260) = 780.</p>
  <div class="fx" data-lang="py">def add_fee(df, pune=30, mumbai=40):
    return df.assign(fee=np.where(df["city"] == "Pune", pune, mumbai))
print(orders.pipe(add_fee).groupby("city")["fee"].sum())</div>
  <div class="fx" data-lang="text">city
Mumbai    200
Pune      180
Name: fee, dtype: int64</div>
  <p><code>pipe(f)</code> calls your own function <code>f(df)</code> inside a chain, so custom steps (like <code>add_fee</code> or the <code>clean_orders</code> function from <a class="xref" data-note="da_pd_cleaning">Cleaning</a>) fit in. Mumbai has 5 orders × ₹40 = 200; Pune 6 × ₹30 = 180.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>An assembly line where each station does one thing and passes the product on, versus a workbench covered in half-finished parts labelled "tmp2".</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Method chaining</strong>: writing a pipeline as one expression of consecutive method calls, each returning a new object. Supported by <code>assign</code>, <code>query</code>, <code>loc</code> with callables, <code>pipe</code>, <code>groupby…agg</code>, <code>sort_values</code>, <code>rename</code>, <code>reset_index</code>. Copy-on-Write (Basics) keeps the intermediate objects cheap.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A very long chain is hard to debug. Break it into named stages when a step needs checking, or insert <code>.pipe(lambda d: print(d.shape) or d)</code> to look inside. And in-place methods (<code>inplace=True</code>) return None and break chains.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Beyond pandas.</b> Readable, vectorised, compact code covers most work. When does the data, or the speed requirement, outgrow pandas itself?</div>

  <h2 id="pdt-beyond"><span class="num">12</span>Beyond pandas: DuckDB, Polars, Spark</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>pandas runs on one core for most operations, reads whole columns into memory, and executes each step eagerly. For a 50 GB log or a query that must run in milliseconds, what are the alternatives, and are they really faster?</p>
  </div>
  <div class="fx" data-lang="py">import os
os.environ["POLARS_MAX_THREADS"] = "1"          # one thread each, for a fair comparison
import duckdb, polars as pl
duckdb.sql("SET threads = 1")
big.to_parquet("big.parquet")                    # the usual shape of real data: a file

def with_pandas():
    return pd.read_parquet("big.parquet", columns=["city", "amount"]).groupby("city")["amount"].sum()
def with_duckdb():
    return duckdb.sql("SELECT city, SUM(amount) AS revenue FROM 'big.parquet' GROUP BY city ORDER BY city").df()
def with_polars():
    return (pl.scan_parquet("big.parquet").group_by("city")
              .agg(pl.col("amount").sum().alias("revenue")).sort("city").collect())
print(with_pandas().round(0))
print(with_duckdb().round(0))
print(with_polars().with_columns(pl.col("revenue").round(0).cast(pl.Int64)))
for f in (with_pandas, with_duckdb, with_polars):
    print(f"{f.__name__:12} {best_ms(f, reps=5):7.1f} ms")</div>
  <div class="fx" data-lang="text">city
Mumbai    179917675.0
Pune      219909322.0
Name: amount, dtype: float64
     city      revenue
0  Mumbai  179917675.0
1    Pune  219909322.0
shape: (2, 2)
┌────────┬───────────┐
│ city   ┆ revenue   │
│ ---    ┆ ---       │
│ str    ┆ i64       │
╞════════╪═══════════╡
│ Mumbai ┆ 179917675 │
│ Pune   ┆ 219909322 │
└────────┴───────────┘
with_pandas     63.1 ms
with_duckdb     11.6 ms
with_polars     17.1 ms</div>
  <p>The same question ("revenue per city") on the same million-row Parquet file, three ways, each limited to one thread for a fair comparison. All three agree on the answer. pandas reads the two columns into memory and then groups; DuckDB (a SQL engine that queries Parquet files and DataFrames directly) and Polars (a DataFrame library with a lazy query planner) scan the file and aggregate in one optimised pass, here several times faster than pandas. With their default multi-threading the gap usually grows; on a quick groupby over a DataFrame already in memory, pandas is often just as fast. These are single runs on one machine; measure on your own data.</p>
  <table class="tbl"><caption>When to reach for what (brief, honest)</caption>
    <tr><th>Tool</th><th>Good at</th><th>Costs</th><th>Move when</th></tr>
    <tr><td>pandas</td><td>everything up to a few GB in RAM; richest ecosystem (plotting, sklearn, statsmodels)</td><td>mostly single-threaded; eager; memory 2–5× data</td><td>stay by default</td></tr>
    <tr><td>DuckDB</td><td>SQL over Parquet/CSV/DataFrames, larger-than-memory, fast joins and aggregations</td><td>SQL rather than methods; one machine</td><td>heavy aggregations on big files; you think in SQL</td></tr>
    <tr><td>Polars</td><td>multi-threaded, lazy DataFrame API, streaming, strict types</td><td>different API (expressions), smaller ecosystem</td><td>pipelines too slow in pandas on one machine</td></tr>
    <tr><td>Spark</td><td>data across many machines, terabytes, fault tolerance</td><td>cluster set-up, overhead on small data</td><td>data no longer fits one machine (<a class="xref" data-note="de_spark">Apache Spark</a>)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>pandas is a well-equipped home kitchen. DuckDB and Polars are a restaurant kitchen: faster for big batches, a different way of working. Spark is a catering company with many kitchens, worth it only for very large events.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Eager</strong> execution runs each step immediately (pandas). <strong>Lazy</strong> execution builds a query plan and optimises the whole pipeline before running it (Polars <code>scan_*</code>/<code>collect</code>, DuckDB, Spark), which allows reading only needed columns and rows (projection and predicate pushdown) and streaming data larger than memory.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Switching tools to fix a slow <code>iterrows</code> loop is the wrong fix: vectorise first (section 10 gained over 1,000×, far more than any engine change). Move when vectorised pandas on sensible dtypes is still too slow or too big.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture and one table for the note, and for the end of the pandas group.</div>

  <h2 id="pdt-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Buckets, windows, lags, zones, ranks, dtypes, loops, chains, engines. How do they build on each other, and on the earlier notes?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 280" width="660">
<defs><marker id="pdt-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="8" width="200" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="120" y="26" text-anchor="middle" font-size="11.5" font-weight="700">datetime64 + .dt</text><text x="120" y="41" text-anchor="middle" class="tm" font-size="10">parsed in Cleaning</text>
<rect x="440" y="8" width="200" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="540" y="26" text-anchor="middle" font-size="11.5" font-weight="700">groupby (previous note)</text><text x="540" y="41" text-anchor="middle" class="tm" font-size="10">split-apply-combine · transform</text>
<line x1="120" y1="48" x2="200" y2="74" stroke="currentColor" marker-end="url(#pdt-a9)"/>
<rect x="130" y="76" width="200" height="40" rx="7" class="fb sb"/><text x="230" y="94" text-anchor="middle" font-size="11.5" font-weight="700">DatetimeIndex</text><text x="230" y="109" text-anchor="middle" class="tm" font-size="10">sorted time labels · tz</text>
<line x1="540" y1="48" x2="430" y2="142" stroke="currentColor" marker-end="url(#pdt-a9)"/><line x1="560" y1="48" x2="560" y2="142" stroke="currentColor" marker-end="url(#pdt-a9)"/>
<line x1="190" y1="116" x2="100" y2="142" stroke="currentColor" marker-end="url(#pdt-a9)"/><line x1="230" y1="116" x2="230" y2="142" stroke="currentColor" marker-end="url(#pdt-a9)"/><line x1="280" y1="116" x2="380" y2="142" stroke="currentColor" marker-end="url(#pdt-a9)"/>
<rect x="20" y="144" width="150" height="40" rx="7" class="ft st"/><text x="95" y="162" text-anchor="middle" font-size="11.5" font-weight="700">resample</text><text x="95" y="177" text-anchor="middle" class="tm" font-size="10">groupby by time bucket</text>
<rect x="180" y="144" width="150" height="40" rx="7" class="ft st"/><text x="255" y="162" text-anchor="middle" font-size="11.5" font-weight="700">rolling / expanding</text><text x="255" y="177" text-anchor="middle" class="tm" font-size="10">windows, 1 value per row</text>
<rect x="340" y="144" width="150" height="40" rx="7" class="ft st"/><text x="415" y="162" text-anchor="middle" font-size="11.5" font-weight="700">shift / diff / pct</text><text x="415" y="177" text-anchor="middle" class="tm" font-size="10">lags (sorted order)</text>
<rect x="500" y="144" width="150" height="40" rx="7" class="ft st"/><text x="575" y="162" text-anchor="middle" font-size="11.5" font-weight="700">per-group windows</text><text x="575" y="177" text-anchor="middle" class="tm" font-size="10">rank · cumsum · SQL OVER</text>
<rect x="60" y="216" width="160" height="40" rx="7" class="fg sg"/><text x="140" y="234" text-anchor="middle" font-size="11.5" font-weight="700">compact dtypes</text><text x="140" y="249" text-anchor="middle" class="tm" font-size="10">category · downcast</text>
<rect x="250" y="216" width="160" height="40" rx="7" class="fg sg"/><text x="330" y="234" text-anchor="middle" font-size="11.5" font-weight="700">vectorise + chain</text><text x="330" y="249" text-anchor="middle" class="tm" font-size="10">no row loops · readable</text>
<rect x="440" y="216" width="160" height="40" rx="7" class="fg sg"/><text x="520" y="234" text-anchor="middle" font-size="11.5" font-weight="700">DuckDB / Polars / Spark</text><text x="520" y="249" text-anchor="middle" class="tm" font-size="10">only after the first two</text>
<line x1="220" y1="236" x2="248" y2="236" stroke="currentColor" marker-end="url(#pdt-a9)"/><line x1="410" y1="236" x2="438" y2="236" stroke="currentColor" marker-end="url(#pdt-a9)"/>
<text x="330" y="276" text-anchor="middle" class="tm" font-size="10">every tool in the middle row is fast only because it is vectorised over typed columns (bottom row)</text>
</svg><figcaption>Top: a parsed datetime column becomes a sorted DatetimeIndex. Middle: resample is groupby by time; rolling/expanding and shift are windows over the sorted rows; per-group windows combine them with the previous note's groupby. Bottom: speed comes first from compact dtypes, then from vectorised, chained code, and only then from another engine.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the Biteful orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>.dt</td><td>datetime64</td><td>parts of a time?</td><td>103 at 20:30 → dinner; span 4 days 08:40</td><td>features, filters</td></tr>
    <tr><td>DatetimeIndex</td><td>set_index + sort_index</td><td>select by date?</td><td>loc["2026-03-03"] → 104, 105</td><td>any time series</td></tr>
    <tr><td>resample</td><td>groupby by time bin</td><td>total per period?</td><td>1210, 690, 180, 860, 990</td><td>daily/weekly/monthly reports</td></tr>
    <tr><td>rolling</td><td>sliding window</td><td>smoothed trend?</td><td>693.3, 576.7, 676.7</td><td>moving averages, rolling features</td></tr>
    <tr><td>expanding</td><td>growing window</td><td>so far?</td><td>1210 … 3930</td><td>running totals/averages</td></tr>
    <tr><td>shift / diff / pct_change</td><td>lag of sorted rows</td><td>change from before?</td><td>Tue −520 (−43.0%); Thu +680 (+377.8%)</td><td>growth, lag features</td></tr>
    <tr><td>Time zones</td><td>aware timestamps</td><td>which 12:10?</td><td>12:10 IST = 06:40 UTC</td><td>multi-region data</td></tr>
    <tr><td>Per-group windows</td><td>groupby + rank/cumsum</td><td>rank/running total within group?</td><td>Mumbai #1 = 111; Asha 240, 620, 910</td><td>top-N, cohorts, sessions</td></tr>
    <tr><td>Memory dtypes</td><td>category, downcast</td><td>fit and speed?</td><td>75.5 → 28.0 MB on 1M rows</td><td>large tables</td></tr>
    <tr><td>Vectorised vs loops</td><td>NumPy operations</td><td>fast per-row logic?</td><td>~2 ms vs 2–3 s (iterrows)</td><td>always</td></tr>
    <tr><td>Chaining / pipe</td><td>methods returning new frames</td><td>readable pipelines?</td><td>dinners: Mumbai 1610, Pune 780</td><td>analysis code</td></tr>
    <tr><td>DuckDB / Polars / Spark</td><td>lazy, multi-threaded engines</td><td>beyond pandas?</td><td>same totals, several× faster on Parquet</td><td>big files, clusters</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Time series in pandas is grouping and windowing where the key is time, and performance is choosing representations that let those operations run on whole typed columns.</strong> resample is groupby; rolling is a window; per-group windows are groupby plus window; and all of them are fast or slow depending on dtypes and on whether any Python loop runs per row.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The time and speed traps in one list.</div>

  <h2 id="pdt-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which time-series and performance slips give wrong trends or slow code, and how do you spot them?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: windows on unsorted rows</span><p>shift, diff, rolling, cumsum and cumcount follow row order. Sort by time first.</p></div>
  <div class="callout trap"><span class="label">Trap: lags across groups</span><p>Use <code>groupby(key).shift()</code>/<code>.diff()</code> so one customer's values never leak into another's.</p></div>
  <div class="callout trap"><span class="label">Trap: partial periods</span><p>The first week (Thursday start) showed +73.9%. Drop or normalise partial buckets.</p></div>
  <div class="callout trap"><span class="label">Trap: empty buckets as zeros</span><p>resample sums of nothing are 0; show counts too.</p></div>
  <div class="callout trap"><span class="label">Trap: row-count windows on irregular data</span><p>Use time-based windows (<code>"24h"</code>) or resample first.</p></div>
  <div class="callout trap"><span class="label">Trap: naive vs aware times</span><p>Comparing them raises TypeError; mixing zones silently shifts days. Store UTC.</p></div>
  <div class="callout trap"><span class="label">Trap: future leakage</span><p><code>shift(-1)</code>, <code>center=True</code> and full-period statistics use future data; never as model features.</p></div>
  <div class="callout trap"><span class="label">Trap: iterrows / apply for arithmetic</span><p>Over a thousand times slower than vectorised code on 100,000 rows.</p></div>
  <div class="callout trap"><span class="label">Trap: wrong dtype optimisations</span><p>category on ids grows memory; float32 on money loses paise.</p></div>
  <div class="callout trap"><span class="label">Trap: switching engines first</span><p>Vectorise and fix dtypes before reaching for Polars, DuckDB or Spark.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="pdt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful's 11 clean orders, Monday 2 to Friday 6 March 2026. Daily revenue (order 107's amount unknown): Mon 1210 (240 + 450 + 520), Tue 690 (380 + 310), Wed 180 (180 + unknown), Thu 860 (260 + 600), Fri 990 (290 + 700); total 3930. Asha ordered Mon 12:10, Tue 13:15, Fri 13:00 (240, 380, 290). At scale: 1,000,000 generated orders over 90 days.</p>
  <h3>The ladder in one line each</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on our data</th><th>Weakness → next</th></tr>
    <tr><td>.dt</td><td>parts of a time?</td><td>day name, hour; span 4 days 08:40</td><td>still filtering columns</td></tr>
    <tr><td>DatetimeIndex</td><td>time as label?</td><td>loc["2026-03-03"]: 2 orders</td><td>one total per day?</td></tr>
    <tr><td>resample</td><td>per period?</td><td>1210, 690, 180, 860, 990</td><td>noisy</td></tr>
    <tr><td>rolling / expanding</td><td>trend, so far?</td><td>693.3, 576.7, 676.7; 3930 total</td><td>vs yesterday?</td></tr>
    <tr><td>shift / diff / pct</td><td>change?</td><td>−520 (−43.0%), +680 (+377.8%)</td><td>which clock?</td></tr>
    <tr><td>Time zones</td><td>which 12:10?</td><td>06:40 UTC</td><td>per-group windows</td></tr>
    <tr><td>rank / cumsum per group</td><td>within city/customer?</td><td>Mumbai #1 111; Asha 240, 620, 910</td><td>scale</td></tr>
    <tr><td>Memory</td><td>fit?</td><td>75.5 → 28.0 MB</td><td>time cost</td></tr>
    <tr><td>Vectorised</td><td>fast?</td><td>~2 ms vs 2–3 s</td><td>readability</td></tr>
    <tr><td>Chaining</td><td>readable?</td><td>Mumbai 1610, Pune 780</td><td>too big for pandas?</td></tr>
    <tr><td>Beyond pandas</td><td>other engines?</td><td>same totals, faster on Parquet</td><td>→ Spark, ML time series</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Formula</th><th>Symbols</th><th>On our data</th></tr>
    <tr><td>rolling(k).mean()</td><td>m<sub>t</sub> = (x<sub>t−k+1</sub> + … + x<sub>t</sub>) / k</td><td>k = window size; NaN until k values (or min_periods)</td><td>Wed: (1210 + 690 + 180) / 3 = 693.3</td></tr>
    <tr><td>expanding().sum()</td><td>S<sub>t</sub> = x<sub>1</sub> + … + x<sub>t</sub></td><td>t = current row</td><td>Thu: 2940</td></tr>
    <tr><td>diff()</td><td>d<sub>t</sub> = x<sub>t</sub> − x<sub>t−1</sub></td><td>x<sub>t−1</sub> = previous row</td><td>Thu: 860 − 180 = 680</td></tr>
    <tr><td>pct_change()</td><td>g<sub>t</sub> = (x<sub>t</sub> − x<sub>t−1</sub>) / x<sub>t−1</sub></td><td>multiply by 100 for %</td><td>Tue: −520 / 1210 = −43.0%</td></tr>
    <tr><td>Memory</td><td>bytes ≈ rows × bytes per value</td><td>int64/float64 8, float32/uint32 4, uint16 2, uint8 1</td><td>1M × 8 = 8.0 MB per column</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>resample</b><p>Regular periods from irregular events; reports.</p><small>Watch partial first/last buckets</small></div>
    <div><b>rolling</b><p>Smoothing, moving features, last-N windows.</p><small>Not centred for forecasting features</small></div>
    <div><b>expanding</b><p>Running totals and averages.</p><small>Equals cumsum for sums</small></div>
    <div><b>category</b><p>Few distinct values; faster groupby.</p><small>Not for ids or free text</small></div>
    <div><b>itertuples</b><p>When a loop is truly unavoidable.</p><small>Never iterrows for arithmetic</small></div>
    <div><b>DuckDB / Polars</b><p>Big files, heavy aggregations, after vectorising.</p><small>Not as a fix for row loops</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Unsorted windows; lags across groups; partial periods; empty buckets as 0; row-count windows on irregular data; naive vs aware times; future leakage; row loops; wrong dtype optimisations; switching engines first.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>resample vs rolling in one sentence?</td><td>resample makes non-overlapping time buckets (fewer rows); rolling computes over a sliding window (one value per row)</td></tr>
    <tr><td>3-day rolling mean on Friday?</td><td>(180 + 860 + 990) / 3 = 676.7</td></tr>
    <tr><td>Thursday's pct_change?</td><td>(860 − 180) / 180 = +377.8%</td></tr>
    <tr><td>Asha's running spend after her third order?</td><td>240 + 380 + 290 = 910</td></tr>
    <tr><td>Which dtype for a city column with 2 values in 1M rows, and the saving?</td><td>category: about 12.9 MB → 1.0 MB</td></tr>
  </table>

  <h2 id="pdt-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>resample vs rolling vs expanding?</summary><div class="qa-body">resample: non-overlapping time buckets, one row per bucket (a groupby by time). rolling: a fixed-size window (rows or a time span) sliding over the rows, one value per row. expanding: a window from the start to each row (running statistics).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Month-over-month revenue growth.</summary><div class="qa-body"><code>m = df.set_index("order_time")["amount"].resample("ME").sum(); m.pct_change() * 100</code>. Check that the first and last months are complete.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Rolling 7-day average revenue per city.</summary><div class="qa-body">Daily totals per city first: <code>d = df.groupby(["city", pd.Grouper(key="order_time", freq="D")])["amount"].sum()</code>, then <code>d.groupby(level="city").rolling(7, min_periods=1).mean()</code> (rolling repeats the group level; <code>droplevel(0)</code> removes it). Or <code>rolling("7D")</code> on a DatetimeIndex for calendar windows with gaps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Days between each customer's consecutive orders.</summary><div class="qa-body"><code>df.sort_values("order_time").groupby("customer")["order_time"].diff().dt.days</code>. Asha: NaN, 1, 2. Sorting first is essential.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RANK vs DENSE_RANK vs ROW_NUMBER in pandas?</summary><div class="qa-body"><code>rank(method="min")</code>, <code>rank(method="dense")</code>, <code>rank(method="first")</code>, usually on <code>groupby(partition)[col]</code> with <code>ascending=False</code>. For 700, 600, 600, 450: min 1, 2, 2, 4; dense 1, 2, 2, 3; first 1, 2, 3, 4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>tz_localize vs tz_convert?</summary><div class="qa-body">tz_localize attaches a zone to naive times without changing the clock reading; tz_convert changes the zone of aware times, keeping the instant. 12:10 localized to Asia/Kolkata, converted to UTC, is 06:40.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you reduce a DataFrame's memory?</summary><div class="qa-body">Measure with <code>memory_usage(deep=True)</code>; convert low-cardinality text to <code>category</code>; downcast integers (<code>to_numeric(downcast=…)</code>); use float32 only where precision allows; read only needed columns with explicit dtypes (or Parquet). On a million orders: 75.5 MB → 28.0 MB.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Rank iterrows, itertuples, apply and vectorised by speed, and explain why.</summary><div class="qa-body">Vectorised (compiled loop over arrays) ≫ itertuples (Python loop, light tuples) &gt; apply(axis=1) (Python call plus a Series per row) &gt; iterrows (builds a full Series per row). On 100,000 rows: about 2 ms vs 0.3 s vs 0.5 s vs 2–3 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you move from pandas to Polars, DuckDB or Spark?</summary><div class="qa-body">After vectorising and fixing dtypes, when data no longer fits comfortably in RAM or pipelines are still too slow: DuckDB for SQL over big files, Polars for a lazy multi-threaded DataFrame API, Spark when the data needs many machines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is resample "a groupby"?</summary><div class="qa-body">It splits rows into time bins, applies an aggregation to each, and combines the results indexed by bin: split-apply-combine from <a class="xref" data-note="da_pd_groupby">GroupBy</a> with the key "which day/week/month". The difference is that it creates empty bins too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in this note if Cleaning was skipped?</summary><div class="qa-body">Without parsed dates there is no DatetimeIndex (<code>.dt</code> fails); the duplicate order inflates Tuesday's revenue by 310; the 240-minute delivery distorts rolling delivery-time averages; and text cities make per-city windows split into four groups.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do these windows become machine-learning features?</summary><div class="qa-body">Lags (<code>shift</code>), rolling means and expanding counts per customer or city, computed with past data only, are the standard inputs of forecasting and churn models (<a class="xref" data-note="ml_features">Feature Engineering</a>, <a class="xref" data-note="ml_timeseries">Time Series Basics</a>). The leakage rule (no <code>shift(-1)</code>, no centred windows) is what separates a valid feature from a cheating one.</div></details>
</main>
`
});
