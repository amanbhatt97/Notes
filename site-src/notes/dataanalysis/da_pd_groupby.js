// notes/dataanalysis/da_pd_groupby.js — GroupBy, Merge & Reshape
Object.assign(TOPIC_CONTENT, {
  "da_pd_groupby": `<main>
<h1>GroupBy, Merge &amp; Reshape</h1>
  <div class="where"><span>Data Analysis</span><span>Pandas</span><span>GroupBy, Merge &amp; Reshape</span></div>
  <p class="lead">The clean table has one row per order. Business questions are about groups ("which city earns more?"), about facts kept in other tables ("which cuisine?"), and about layouts people can read ("days down the side, cities across"). This note answers them in that order: split-apply-combine traced by hand, <code>size</code> vs <code>count</code>, named aggregations, the difference between <code>agg</code>, <code>transform</code> and <code>filter</code>, every merge type traced on the restaurants and customers tables, the fan-out trap and <code>validate=</code>, <code>join</code> and <code>concat</code>, then <code>pivot_table</code> vs <code>pivot</code> vs <code>melt</code> vs <code>stack</code>/<code>unstack</code>, and <code>crosstab</code>. The running example is Biteful's 11 clean orders; a generated million-order version is "the same idea at scale". Run on pandas 3.0.5, Python 3.13.</p>

  <h2 id="pdg-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="pdg-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="100" y="6" width="440" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Python Collections (dicts, lists) · Files · NumPy arrays</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#pdg-ga)"/>
<line x1="320" y1="102" x2="83" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdg-ga)"/>
<line x1="320" y1="102" x2="241" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdg-ga)"/>
<line x1="320" y1="102" x2="399" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdg-ga)"/>
<line x1="320" y1="102" x2="557" y2="130" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdg-ga)"/>
<line x1="158" y1="152" x2="164" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdg-ga)"/>
<line x1="316" y1="152" x2="322" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdg-ga)"/>
<line x1="474" y1="152" x2="480" y2="152" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pdg-ga)"/>
<rect x="200" y="62" width="240" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="79" text-anchor="middle" font-size="12" font-weight="400">Pandas: the map</text>
<text x="320" y="94" text-anchor="middle" class="tm" font-size="10">why each tool, in what order</text>
<rect x="8" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="83" y="149" text-anchor="middle" font-size="12" font-weight="400">Basics &amp; Selection</text>
<text x="83" y="164" text-anchor="middle" class="tm" font-size="10">table · index · pick</text>
<rect x="166" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="241" y="149" text-anchor="middle" font-size="12" font-weight="400">Cleaning</text>
<text x="241" y="164" text-anchor="middle" class="tm" font-size="10">NaN · types · text</text>
<rect x="324" y="132" width="150" height="40" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="399" y="149" text-anchor="middle" font-size="12" font-weight="700">GroupBy &amp; Merge</text>
<text x="399" y="164" text-anchor="middle" class="tg" font-size="9.5">YOU ARE HERE</text>
<rect x="482" y="132" width="150" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="557" y="149" text-anchor="middle" font-size="12" font-weight="400">Time &amp; Speed</text>
<text x="557" y="164" text-anchor="middle" class="tm" font-size="10">dates · windows · fast</text>
<line x1="320" y1="172" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#pdg-ga)"/>
<rect x="40" y="210" width="560" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">leads to</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Visualisation · SQL joins &amp; windows · Feature Engineering · Time Series · Spark</text>
</svg><figcaption>The Pandas group. Read the map first, then left to right: each note answers a question the one before could not. Dotted arrows show the reading order.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="da_pd_cleaning">Cleaning &amp; Missing Data</a></b><span>We now have a trustworthy table: 11 orders, two cities spelt one way, numeric delivery times, and one amount (order 107) honestly unknown. Before that, <a class="xref" data-note="da_pd_basics">Basics</a> taught selecting rows by mask, which answers "Pune orders" but not "every city's total at once". The map note <a class="xref" data-note="da_pandas">Pandas: the map</a> placed this note on three steps: summarise by group, combine tables, reshape.</span></li>
    <li><b>This note adds: many rows → few rows, and tables → one table</b><span>groupby (split-apply-combine), merge/join/concat (combining tables by keys or by stacking), and reshaping (long ↔ wide).</span></li>
    <li><b>Leads to: <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a></b><span>Grouping by a time bucket is <code>resample</code>, and "the group's total next to every row" (<code>transform</code>) grows into window functions. The same ideas in SQL: <a class="xref" data-note="sql_joins">SQL JOINs</a> and <a class="xref" data-note="sql_windows">Window Functions</a>; at cluster scale: <a class="xref" data-note="de_spark">Apache Spark</a>.</span></li>
  </ol>

  <h2 id="pdg-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. Numbers come from the running example.</p>
  <ol class="story">
    <li><b>Split-apply-combine</b><span>Q: revenue per city, all cities at once? → Split the rows into a Mumbai pile and a Pune pile, sum each, combine: Mumbai 2060, Pune 1870. But Mumbai's 2060 comes from 5 orders with only 4 known amounts…</span></li>
    <li><b>size vs count</b><span>Q: how many rows vs how many values? → Mumbai size 5, count 4. Always report both. Then: several numbers per group, with readable names?</span></li>
    <li><b>Named aggregations, several keys</b><span>Q: orders, revenue and average minutes per restaurant in one table? → <code>agg(orders=("order_id", "size"), …)</code>: Biryani Bros 3 orders, ₹1,430, 46.5 min. Two keys (city, restaurant) give one row per pair. But agg shrinks the table: what if we need the group total next to each order?</span></li>
    <li><b>agg vs transform vs filter</b><span>Q: each order's share of its city's revenue? → <code>transform("sum")</code> writes 1870 next to every Pune row: order 101 is 13%. <code>filter</code> keeps whole groups that pass a test (restaurants with ≥ 2 orders: 10 rows). But cuisine is not in the orders table at all…</span></li>
    <li><b>merge and join types</b><span>Q: attach each restaurant's cuisine? → <code>merge(on="restaurant", how=…)</code>: inner 10 rows (Momo Magic lost), left 11 (Momo Magic NaN), right 11 (Tandoor Tales appears), outer 12. What if the lookup table lists a restaurant twice?</span></li>
    <li><b>Fan-out and validate=</b><span>Q: why did revenue jump? → A duplicate key multiplies rows: 11 → 14, ₹3,930 → ₹5,150. <code>validate="many_to_one"</code> refuses instead. Then: tables that share an index, or tables that simply continue each other?</span></li>
    <li><b>join and concat</b><span>Q: attach by index; append the next day's orders? → <code>join</code> merges on the index; <code>concat</code> stacks rows: 11 + 2 late orders = 13. Our answers are long lists; the manager wants a grid…</span></li>
    <li><b>pivot_table, pivot, melt</b><span>Q: days down, cities across? → <code>pivot_table(aggfunc="sum")</code>: Monday Pune 760. Its default is the <em>mean</em>; <code>pivot</code> refuses duplicate cells; <code>melt</code> turns the grid back into rows. And a grouped result with two keys?</span></li>
    <li><b>stack/unstack, crosstab</b><span>Q: move a key between rows and columns; count combinations? → <code>unstack</code> turns restaurants into columns, <code>stack</code> back; <code>crosstab</code>: Mumbai has 2 Biryani Bros orders. Then: does any of this survive a million rows?</span></li>
    <li><b>At scale</b><span>Q: same code on 1,000,000 orders? → merge + groupby in well under a second, with Momo Magic's revenue still visible as a NaN cuisine.</span></li>
  </ol>

  <h2 id="pdg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">GroupBy, Merge &amp; Reshape</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">GroupBy</div>
        <ul>
          <li><b>Split → apply → combine</b>; result indexed by the key</li>
          <li>Mumbai 2060 (size 5, count 4), Pune 1870 (6, 6)</li>
          <li>Named agg: <code>agg(new=(col, func))</code></li>
          <li>Several keys → MultiIndex; <code>as_index=False</code> / <code>reset_index()</code></li>
          <li>⚠ <code>count</code> skips NaN, <code>size</code> does not; NaN keys dropped unless <code>dropna=False</code></li>
          <li>💡 sorting receipts into piles and totalling each</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">agg / transform / filter</div>
        <ul>
          <li><b>agg</b>: one row per group (SQL GROUP BY)</li>
          <li><b>transform</b>: same rows, group value repeated (window)</li>
          <li><b>filter</b>: whole groups kept or dropped (HAVING)</li>
          <li>Shares: 101 → 240 / 1870 = 0.13</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Merge</div>
        <ul>
          <li><code>merge(on=, how="inner|left|right|outer")</code></li>
          <li>Rows: 10 · 11 · 11 · 12 on our tables</li>
          <li><code>indicator=True</code> → <code>_merge</code>; anti-join = <code>left_only</code> or <code>~isin</code></li>
          <li>⚠ fan-out: duplicate key → 11 → 14 rows, 3930 → 5150</li>
          <li>✔ <code>validate="many_to_one"</code>; compare <code>len</code>; same key dtype</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">join &amp; concat</div>
        <ul>
          <li><code>join</code>: merge on the index (left by default)</li>
          <li><code>concat([a, b], ignore_index=True)</code>: stack rows (UNION ALL)</li>
          <li><code>concat(axis=1)</code>: side by side, aligned on index</li>
          <li>⚠ concat does not de-duplicate</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reshape</div>
        <ul>
          <li><b>pivot_table</b>: long → wide with aggregation; ⚠ default mean</li>
          <li><b>pivot</b>: long → wide, no aggregation; fails on duplicate cells</li>
          <li><b>melt</b>: wide → long</li>
          <li><b>unstack</b>: index level → columns; <b>stack</b>: columns → index level</li>
          <li><b>crosstab</b>: counts (or shares) of combinations</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SQL mapping</div>
        <ul>
          <li>groupby + agg = <code>GROUP BY</code></li>
          <li>transform = <code>SUM(...) OVER (PARTITION BY ...)</code></li>
          <li>filter = <code>HAVING</code></li>
          <li>merge = <code>JOIN</code>; concat = <code>UNION ALL</code></li>
          <li>pivot_table = conditional aggregation / PIVOT</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pdg-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-data"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Clean Tables</span><span class="rm-sub">Orders, restaurants, customers</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-sac"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Split-Apply-Combine</span><span class="rm-sub">Traced by hand; size vs count</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-named"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Named Aggregations</span><span class="rm-sub">Several numbers, several keys</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-atf"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">agg vs transform vs filter</span><span class="rm-sub">Three output shapes</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-merge"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Merge: Join Types</span><span class="rm-sub">inner, left, right, outer traced</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-fan"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Fan-out Trap</span><span class="rm-sub">validate= and key dtypes</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-concat"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">join &amp; concat</span><span class="rm-sub">By index, by stacking</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-pivot"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">pivot_table, pivot, melt</span><span class="rm-sub">Long ↔ wide</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-stack"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">stack, unstack, crosstab</span><span class="rm-sub">Moving keys, counting pairs</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-scale"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">The Same Idea at Scale</span><span class="rm-sub">A million orders</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Wrong totals that look right</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pdg-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pdg-data"><span class="num">01</span>The Clean Tables</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With masks from <a class="xref" data-note="da_pd_basics">Basics</a> we can total Pune's orders, then Mumbai's, one filter per city. With 50 cities, 50 filters. And the restaurants' cuisines and the customers' plans are in different tables. What do we start from?</p>
  </div>
  <h3>The running example</h3>
  <p>The output of <a class="xref" data-note="da_pd_cleaning">Cleaning</a>: Biteful's 11 orders (duplicate removed, cities tidied, minutes numeric, the impossible 240 and the "unknown" blanked, order 107's amount honestly missing). Typed here as a dict of lists so this note runs on its own, with the two lookup tables:</p>
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
restaurants = pd.DataFrame({
    "restaurant": ["Dosa Hut", "Biryani Bros", "Pizza Point", "Green Bowl", "Tandoor Tales"],
    "cuisine":    ["South Indian", "Biryani", "Pizza", "Salads", "North Indian"],
    "rating":     [4.4, 4.1, 3.9, 4.6, 4.2],
})
customers = pd.DataFrame({
    "customer": ["Asha", "Ben", "Chen", "Dia", "Esha", "Gita"],
    "plan":     ["gold", "free", "gold", "free", "free", "gold"],
})
print(orders[["order_id", "customer", "restaurant", "city", "amount"]])</div>
  <div class="fx" data-lang="text">    order_id customer    restaurant    city  amount
0        101     Asha      Dosa Hut    Pune   240.0
1        102      Ben  Biryani Bros  Mumbai   450.0
2        103     Chen   Pizza Point    Pune   520.0
3        104     Asha  Biryani Bros    Pune   380.0
4        105      Dia    Green Bowl  Mumbai   310.0
5        106      Ben      Dosa Hut    Pune   180.0
6        107     Esha   Pizza Point  Mumbai     NaN
7        108     Chen    Momo Magic    Pune   260.0
8        109    Farah  Biryani Bros  Mumbai   600.0
9        110     Asha    Green Bowl    Pune   290.0
10       111      Dia   Pizza Point  Mumbai   700.0</div>
  <ul>
    <li><code>restaurants</code> has one row per restaurant. Momo Magic (order 108) is <em>missing</em> from it; Tandoor Tales has no orders.</li>
    <li><code>customers</code> has one row per customer. Gita never ordered; Farah (order 109) has no profile.</li>
  </ul>
  <p>These gaps are deliberate: they are what makes the join types differ.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A shop with three ledgers: the daily sales book (orders), the supplier register (restaurants) and the loyalty-card list (customers). Each answers some questions alone; the interesting ones need two of them side by side.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>key</strong> is a column whose values identify the thing a row is about (<code>restaurant</code>, <code>customer</code>). A <strong>fact table</strong> (orders) has many rows per key; a <strong>lookup</strong> or <strong>dimension table</strong> (restaurants, customers) should have exactly one row per key.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Should have exactly one row per key" is an assumption, not a fact. Check it (<code>restaurants["restaurant"].is_unique</code>) before relying on it; section 06 shows what happens when it is false.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Split-Apply-Combine.</b> The tables are ready. How do we get one total per city in one step, for any number of cities?</div>

  <h2 id="pdg-sac"><span class="num">02</span>Split-Apply-Combine, Traced by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Revenue per city" means: for every distinct city, total the amounts of that city's orders. A mask per city works but does not scale. What is the general operation?</p>
  </div>
  <h3>By hand</h3>
  <div class="flow"><span>Split rows by key</span><span>Apply sum to each pile</span><span>Combine into one table</span></div>
  <table class="tbl"><caption>Split-apply-combine on the 11 orders</caption>
    <tr><th>Step</th><th>Mumbai</th><th>Pune</th></tr>
    <tr><td>Split</td><td>102: 450 · 105: 310 · 107: NaN · 109: 600 · 111: 700</td><td>101: 240 · 103: 520 · 104: 380 · 106: 180 · 108: 260 · 110: 290</td></tr>
    <tr><td>Apply <code>sum</code></td><td>450 + 310 + 600 + 700 = 2060 (NaN skipped)</td><td>240 + 520 + 380 + 180 + 260 + 290 = 1870</td></tr>
    <tr><td>Combine</td><td colspan="2">a Series indexed by city: Mumbai 2060, Pune 1870</td></tr>
  </table>
  <h3>The split, made visible</h3>
  <div class="fx" data-lang="py">for city, pile in orders.groupby("city"):
    print(f"--- {city}: amounts {pile['amount'].tolist()}")</div>
  <div class="fx" data-lang="text">--- Mumbai: amounts [450.0, 310.0, nan, 600.0, 700.0]
--- Pune: amounts [240.0, 520.0, 380.0, 180.0, 260.0, 290.0]</div>
  <p>Looping over a groupby object yields <code>(key, sub-table)</code> pairs: the piles. Pandas builds them with a hash table (the dict idea from <a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>): each row's key is hashed to find its pile, so splitting is one pass over the data. Keys come out sorted (Mumbai before Pune) by default.</p>
  <h3>The whole operation in one line</h3>
  <div class="fx" data-lang="py">print(orders.groupby("city")["amount"].sum())</div>
  <div class="fx" data-lang="text">city
Mumbai    2060.0
Pune      1870.0
Name: amount, dtype: float64</div>
  <p><code>orders.groupby("city")</code> does the split; <code>["amount"]</code> picks the column to aggregate; <code>.sum()</code> is the apply; the combined result is a Series whose index is the group key. Exactly the hand table.</p>
  <h3>size vs count</h3>
  <div class="fx" data-lang="py">g = orders.groupby("city")["amount"]
print(pd.DataFrame({"size": g.size(), "count": g.count(), "sum": g.sum(), "mean": g.mean().round(1)}))</div>
  <div class="fx" data-lang="text">        size  count     sum   mean
city                              
Mumbai     5      4  2060.0  515.0
Pune       6      6  1870.0  311.7</div>
  <p><code>size</code> counts rows per group (Mumbai 5); <code>count</code> counts non-missing values (Mumbai 4, because order 107's amount is unknown). <code>mean</code> divides by <code>count</code>: Mumbai 2060 / 4 = 515.0, Pune 1870 / 6 = 311.7. A report saying "Mumbai: 5 orders, ₹2,060" without the 4 would hide that one order's amount is unknown.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Counting a day's receipts by branch: sort them into one pile per branch (split), add up each pile (apply), and write the totals on one summary sheet (combine). <code>size</code> is the number of receipts in the pile; <code>count</code> is the number with a legible amount.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Split-apply-combine</strong>: split rows into groups by the values of one or more keys, apply a function to each group independently, combine the results into a new object indexed by the keys. <code>df.groupby(keys)[cols].agg_func()</code>. <code>size()</code>: rows per group. <code>count()</code>: non-null values per group and column.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Rows whose <em>key</em> is NaN are dropped from groupby by default: a whole "unknown city" group can vanish from your totals. Pass <code>dropna=False</code> to keep it (section 10 uses this for the unknown cuisine).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Named Aggregations.</b> One number per group is rarely enough. A manager wants orders, revenue and average delivery time per restaurant in one readable table.</div>

  <h2 id="pdg-named"><span class="num">03</span>Named Aggregations &amp; Several Keys</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we compute several different summaries of different columns per group, give them clear names, and group by more than one key?</p>
  </div>
  <div class="fx" data-lang="py">per_rest = (orders.groupby("restaurant")
            .agg(orders=("order_id", "size"),
                 revenue=("amount", "sum"),
                 avg_minutes=("delivery_minutes", "mean"))
            .sort_values("revenue", ascending=False)
            .round(1))
print(per_rest)</div>
  <div class="fx" data-lang="text">              orders  revenue  avg_minutes
restaurant                                
Biryani Bros       3   1430.0         46.5
Pizza Point        3   1220.0         39.3
Green Bowl         2    600.0         28.0
Dosa Hut           2    420.0         28.5
Momo Magic         1    260.0          NaN</div>
  <p>Each keyword in <code>agg</code> is one output column: <code>new_name=(input_column, function)</code>. Check Biryani Bros by hand: orders 102, 104, 109 → 3 orders, 450 + 380 + 600 = 1430, delivery minutes 41, NaN, 52 → (41 + 52) / 2 = 46.5. Momo Magic's only delivery time was the removed 240, so its average is NaN. <code>sort_values</code> ranks by revenue; <code>round(1)</code> tidies the decimals.</p>
  <div class="fx" data-lang="py">print(orders.groupby(["city", "restaurant"])["amount"].sum())</div>
  <div class="fx" data-lang="text">city    restaurant  
Mumbai  Biryani Bros    1050.0
        Green Bowl       310.0
        Pizza Point      700.0
Pune    Biryani Bros     380.0
        Dosa Hut         420.0
        Green Bowl       290.0
        Momo Magic       260.0
        Pizza Point      520.0
Name: amount, dtype: float64</div>
  <p>Two keys give one row per (city, restaurant) pair that occurs, with a two-level index (a <strong>MultiIndex</strong>): Mumbai/Biryani Bros = 450 + 600 = 1050, Pune/Biryani Bros = 380. Pairs with no orders (Mumbai/Dosa Hut) simply do not appear. <code>.reset_index()</code> (or <code>groupby(..., as_index=False)</code>) turns the keys back into ordinary columns.</p>
  <div class="fx" data-lang="py">print(orders.groupby("city")["amount"].agg(cheapest="min", dearest="max", middle="median",
                                           spread=lambda s: s.max() - s.min()))</div>
  <div class="fx" data-lang="text">        cheapest  dearest  middle  spread
city                                     
Mumbai     310.0    700.0   525.0   390.0
Pune       180.0    520.0   275.0   340.0</div>
  <p>Built-in function names (<code>"min"</code>, <code>"max"</code>, <code>"median"</code>) run fast compiled code; a <code>lambda</code> runs Python once per group, fine for a handful of groups. Mumbai's spread is 700 − 310 = 390.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A school report card per class: number of students, average mark, highest mark, each in its own named column, instead of three separate lists you must line up by hand.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Named aggregation</strong>: <code>df.groupby(keys).agg(out1=(col1, func1), out2=(col2, func2))</code>; on a single column, <code>s.groupby(keys).agg(out=func)</code>. Functions may be names (<code>"sum"</code>, <code>"mean"</code>, <code>"size"</code>, <code>"nunique"</code>, <code>"first"</code>, …) or callables.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>The old dict style <code>agg({"amount": ["sum", "mean"]})</code> produces two-level column names like <code>("amount", "sum")</code> that are awkward to use. Named aggregation gives flat, chosen names.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: agg vs transform vs filter.</b> Every result so far has one row per group: the orders themselves disappeared. What if we need the group total <em>next to each order</em>, or want to keep only some groups' orders?</div>

  <h2 id="pdg-atf"><span class="num">04</span>agg vs transform vs filter</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"What share of its city's revenue is each order?" needs every order <em>and</em> its city's total on the same row. "Only restaurants with at least 2 orders" needs whole groups kept or dropped. agg can do neither. What can?</p>
  </div>
  <h3>transform: the group's value on every row</h3>
  <div class="fx" data-lang="py">orders["city_total"] = orders.groupby("city")["amount"].transform("sum")
orders["share"] = (orders["amount"] / orders["city_total"]).round(2)
print(orders[["order_id", "city", "amount", "city_total", "share"]])</div>
  <div class="fx" data-lang="text">    order_id    city  amount  city_total  share
0        101    Pune   240.0      1870.0   0.13
1        102  Mumbai   450.0      2060.0   0.22
2        103    Pune   520.0      1870.0   0.28
3        104    Pune   380.0      1870.0   0.20
4        105  Mumbai   310.0      2060.0   0.15
5        106    Pune   180.0      1870.0   0.10
6        107  Mumbai     NaN      2060.0    NaN
7        108    Pune   260.0      1870.0   0.14
8        109  Mumbai   600.0      2060.0   0.29
9        110    Pune   290.0      1870.0   0.16
10       111  Mumbai   700.0      2060.0   0.34</div>
  <p><code>transform("sum")</code> computes the same per-group sums as agg (Mumbai 2060, Pune 1870) and then writes each group's value back onto every row of that group, so the result has 11 rows aligned to the original index. Then the share is an ordinary column division: order 101 is 240 / 1870 = 0.128 → 0.13; order 111 is 700 / 2060 = 0.34. Order 107's share is NaN: unknown amount, unknown share. (The Cleaning note used the same trick to fill with a group median.)</p>
  <h3>filter: keep or drop whole groups</h3>
  <div class="fx" data-lang="py">regular = orders.groupby("restaurant").filter(lambda pile: len(pile) &gt;= 2)
print(sorted(regular["restaurant"].unique()), len(regular), "rows")</div>
  <div class="fx" data-lang="text">['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Pizza Point'] 10 rows</div>
  <p><code>filter(f)</code> calls <code>f</code> on each group's sub-table; groups where it returns True keep <em>all</em> their original rows. Momo Magic has 1 order, so its group is dropped: 11 − 1 = 10 rows remain.</p>
  <h3>Three shapes, side by side</h3>
  <div class="fx" data-lang="py">gb = orders.groupby("restaurant")["amount"]
print("agg      :", gb.agg("sum").shape)
print("transform:", gb.transform("sum").shape)
print("filter   :", orders.groupby("restaurant").filter(lambda p: len(p) &gt;= 2).shape)</div>
  <div class="fx" data-lang="text">agg      : (5,)
transform: (11,)
filter   : (10, 9)</div>
  <table class="tbl">
    <tr><th>Method</th><th>Output shape</th><th>On our data</th><th>SQL analogy</th></tr>
    <tr><td><code>agg</code></td><td>one row per group</td><td>5 restaurants</td><td><code>GROUP BY</code></td></tr>
    <tr><td><code>transform</code></td><td>same rows as input</td><td>11 orders, group value repeated</td><td><code>SUM(amount) OVER (PARTITION BY city)</code></td></tr>
    <tr><td><code>filter</code></td><td>original rows of groups that pass</td><td>10 orders (Momo Magic gone)</td><td><code>HAVING COUNT(*) &gt;= 2</code> (then back to rows)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Exam results by class. <code>agg</code>: the notice board with one average per class. <code>transform</code>: each student's sheet stamped with their class average, so they can compare. <code>filter</code>: only the classes with at least 30 students go to the inter-school round, every student of those classes included.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>GroupBy.agg(f)</code> reduces each group to one value per column. <code>GroupBy.transform(f)</code> returns an object indexed like the input, where each row gets its group's result (<code>f</code> must return a scalar or a same-length result per group). <code>GroupBy.filter(f)</code> returns the input rows of groups for which <code>f(group)</code> is True.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Trying to put an agg result back on the rows by assignment (<code>orders["city_total"] = orders.groupby("city")["amount"].sum()</code>) aligns the 2-row result (indexed Mumbai, Pune) with the orders' index 0–10: no labels match, so the column is all NaN. That is exactly what <code>transform</code> is for.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Merge.</b> Everything so far used columns already in the orders table. "Revenue per cuisine" needs the cuisine, which lives in the restaurants table.</div>

  <h2 id="pdg-merge"><span class="num">05</span>Merge: Join Types, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>For each order we want its restaurant's cuisine and rating. Two tables share the column <code>restaurant</code>. How do we line them up, and what happens to an order whose restaurant is not in the lookup table (Momo Magic), or a restaurant with no orders (Tandoor Tales)?</p>
  </div>
  <h3>A left merge, by hand</h3>
  <p>For every order (left table), look up its restaurant in <code>restaurants</code> (right table) and copy that row's cuisine and rating onto the order. Dosa Hut → South Indian, 4.4; … Momo Magic → not found → NaN.</p>
  <div class="fx" data-lang="py">m = orders.merge(restaurants, on="restaurant", how="left")
print(m[["order_id", "restaurant", "amount", "cuisine", "rating"]])</div>
  <div class="fx" data-lang="text">    order_id    restaurant  amount       cuisine  rating
0        101      Dosa Hut   240.0  South Indian     4.4
1        102  Biryani Bros   450.0       Biryani     4.1
2        103   Pizza Point   520.0         Pizza     3.9
3        104  Biryani Bros   380.0       Biryani     4.1
4        105    Green Bowl   310.0        Salads     4.6
5        106      Dosa Hut   180.0  South Indian     4.4
6        107   Pizza Point     NaN         Pizza     3.9
7        108    Momo Magic   260.0           NaN     NaN
8        109  Biryani Bros   600.0       Biryani     4.1
9        110    Green Bowl   290.0        Salads     4.6
10       111   Pizza Point   700.0         Pizza     3.9</div>
  <p>All 11 orders kept, in their original order, each with its restaurant's details; order 108 (Momo Magic) has NaN cuisine and rating. Tandoor Tales does not appear because no order points to it.</p>
  <h3>All four join types</h3>
  <div class="fx" data-lang="py">for how in ["inner", "left", "right", "outer"]:
    r = orders.merge(restaurants, on="restaurant", how=how)
    print(f"{how:6} -&gt; {len(r):2} rows   restaurants: {sorted(r['restaurant'].unique())}")</div>
  <div class="fx" data-lang="text">inner  -&gt; 10 rows   restaurants: ['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Pizza Point']
left   -&gt; 11 rows   restaurants: ['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Momo Magic', 'Pizza Point']
right  -&gt; 11 rows   restaurants: ['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Pizza Point', 'Tandoor Tales']
outer  -&gt; 12 rows   restaurants: ['Biryani Bros', 'Dosa Hut', 'Green Bowl', 'Momo Magic', 'Pizza Point', 'Tandoor Tales']</div>
  <table class="tbl"><caption>Who survives each join (keys: restaurant)</caption>
    <tr><th>how</th><th>Keeps</th><th>Momo Magic (only in orders)</th><th>Tandoor Tales (only in restaurants)</th><th>Rows</th></tr>
    <tr><td><code>inner</code></td><td>keys in both</td><td>dropped</td><td>dropped</td><td>11 − 1 = 10</td></tr>
    <tr><td><code>left</code></td><td>every left row</td><td>kept, cuisine NaN</td><td>dropped</td><td>11</td></tr>
    <tr><td><code>right</code></td><td>every right row</td><td>dropped</td><td>kept, order columns NaN</td><td>10 + 1 = 11</td></tr>
    <tr><td><code>outer</code></td><td>every row of both</td><td>kept</td><td>kept</td><td>10 + 1 + 1 = 12</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 640 120" width="640">
    <circle cx="70" cy="60" r="38" class="fb sb" fill-opacity="0.5"/><circle cx="110" cy="60" r="38" class="ft st" fill-opacity="0.5"/><text x="90" y="112" text-anchor="middle" font-size="11">inner: overlap</text>
    <circle cx="230" cy="60" r="38" class="fg sg"/><circle cx="270" cy="60" r="38" class="ft st" fill-opacity="0.4"/><text x="250" y="112" text-anchor="middle" font-size="11">left: all orders</text>
    <circle cx="390" cy="60" r="38" class="fb sb" fill-opacity="0.4"/><circle cx="430" cy="60" r="38" class="fg sg"/><text x="410" y="112" text-anchor="middle" font-size="11">right: all restaurants</text>
    <circle cx="550" cy="60" r="38" class="fg sg"/><circle cx="590" cy="60" r="38" class="fg sg"/><text x="570" y="112" text-anchor="middle" font-size="11">outer: everything</text>
    <text x="40" y="16" class="tm" font-size="10">orders</text><text x="122" y="16" class="tm" font-size="10">restaurants</text>
  </svg><figcaption>Join types as overlapping key sets (orders on the left, restaurants on the right). The shaded part is what each join keeps; unmatched rows that are kept get NaN in the other table's columns.</figcaption></figure>
  <h3>Seeing the unmatched rows</h3>
  <div class="fx" data-lang="py">full = orders.merge(restaurants, on="restaurant", how="outer", indicator=True)
print(full["_merge"].value_counts())
print(full.loc[full["_merge"] != "both", ["order_id", "restaurant", "cuisine", "_merge"]])</div>
  <div class="fx" data-lang="text">_merge
both          10
left_only      1
right_only     1
Name: count, dtype: int64
    order_id     restaurant       cuisine      _merge
7      108.0     Momo Magic           NaN   left_only
11       NaN  Tandoor Tales  North Indian  right_only</div>
  <p><code>indicator=True</code> adds a <code>_merge</code> column saying where each row came from: <code>both</code>, <code>left_only</code> (Momo Magic: an order whose restaurant is missing from the register, a data problem to report), <code>right_only</code> (Tandoor Tales: a restaurant with no orders, a business question). <code>order_id</code> became float (108.0) because the outer join introduced a NaN into it.</p>
  <h3>Anti-joins: who is on one side only?</h3>
  <div class="fx" data-lang="py">print(customers[~customers["customer"].isin(orders["customer"])])           # never ordered
print(sorted(set(orders["customer"]) - set(customers["customer"])))         # order but no profile</div>
  <div class="fx" data-lang="text">  customer  plan
5     Gita  gold
['Farah']</div>
  <p>"Customers who never ordered": customers whose name is <em>not</em> in the orders' customer column → Gita. "Orders from people with no profile" by set difference (<a class="xref" data-note="py_dicts_sets">Dicts &amp; Sets</a>) → Farah. Both are <strong>anti-joins</strong>; <code>merge(how="left", indicator=True)</code> then keeping <code>left_only</code> gives the same result with all columns.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Matching a class attendance list with the fee-paid list by roll number. Inner: students on both lists. Left: everyone who attended, with a blank where no fee record exists. Right: everyone who paid, with a blank where they never attended. Outer: everybody on either list.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>left.merge(right, on=key, how=…)</code> combines rows whose key values are equal, like SQL <code>JOIN</code> (<a class="xref" data-note="sql_joins">SQL JOINs</a>). Use <code>left_on=</code>/<code>right_on=</code> for different column names, <code>suffixes=</code> for clashing column names, <code>indicator=True</code> to label the origin of each row. Unmatched rows that are kept get NaN in the other side's columns.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A left join can silently turn an int column into float and add NaN that later sums skip. After every merge, check row count and <code>isna().sum()</code> of the new columns: Momo Magic's NaN cuisine is a finding, not noise.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Fan-out Trap.</b> Every restaurant appeared once in the lookup table, so each order matched at most one row. What if the lookup table is not as clean as we assumed?</div>

  <h2 id="pdg-fan"><span class="num">06</span>The Fan-out Trap &amp; validate=</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Suppose a bad import added Pizza Point to the restaurants table a second time (as "Italian", rating 4.0). Nothing errors. What happens to each Pizza Point order in a merge, and to the totals afterwards?</p>
  </div>
  <div class="fx" data-lang="py">restaurants_bad = pd.concat([restaurants,
                             pd.DataFrame({"restaurant": ["Pizza Point"], "cuisine": ["Italian"], "rating": [4.0]})],
                            ignore_index=True)        # Pizza Point now listed TWICE
fan = orders.merge(restaurants_bad, on="restaurant", how="left")
print(len(orders), "-&gt;", len(fan), "rows")
print("revenue", orders["amount"].sum(), "-&gt;", fan["amount"].sum())
print(fan.loc[fan["restaurant"] == "Pizza Point", ["order_id", "amount", "cuisine"]])</div>
  <div class="fx" data-lang="text">11 -&gt; 14 rows
revenue 3930.0 -&gt; 5150.0
    order_id  amount  cuisine
2        103   520.0    Pizza
3        103   520.0  Italian
7        107     NaN    Pizza
8        107     NaN  Italian
12       111   700.0    Pizza
13       111   700.0  Italian</div>
  <p>By hand: a merge pairs every left row with <em>every</em> matching right row. Each of the 3 Pizza Point orders now matches 2 restaurant rows, so it comes out twice: 3 orders become 6 rows, and the table grows from 11 to 11 − 3 + 6 = 14 rows. Revenue grows by the Pizza Point amounts counted a second time: 3930 + 520 + 700 = 5150 (order 107's NaN adds nothing). Nobody sold anything; the total is simply wrong. This is <strong>fan-out</strong> (row multiplication).</p>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="pdg-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="170" height="26" class="fb sb"/><text x="16" y="48" font-size="11">103 Pizza Point ₹520</text>
    <rect x="230" y="14" width="160" height="26" class="ft st"/><text x="236" y="32" font-size="11">Pizza Point · Pizza</text>
    <rect x="230" y="46" width="160" height="26" class="ft st"/><text x="236" y="64" font-size="11">Pizza Point · Italian</text>
    <path d="M180 40 L228 28" stroke="currentColor" marker-end="url(#pdg-ar)"/><path d="M180 46 L228 58" stroke="currentColor" marker-end="url(#pdg-ar)"/>
    <rect x="420" y="14" width="170" height="26" class="fr sr"/><text x="428" y="32" font-size="11">103 ₹520 Pizza</text>
    <rect x="420" y="46" width="170" height="26" class="fr sr"/><text x="428" y="64" font-size="11">103 ₹520 Italian</text>
    <text x="10" y="100" font-size="11">1 order × 2 matching lookup rows = 2 output rows → ₹520 counted twice</text>
    <text x="10" y="120" class="tm" font-size="10">11 rows in → 14 rows out; revenue 3930 → 5150</text>
  </svg><figcaption>Fan-out: a duplicate key on the side that should have one row per key multiplies rows and silently inflates every sum computed afterwards.</figcaption></figure>
  <h3>The guard: validate=</h3>
  <div class="fx" data-lang="py">try:
    orders.merge(restaurants_bad, on="restaurant", how="left", validate="many_to_one")
except pd.errors.MergeError as e:
    print("MergeError:", str(e).splitlines()[0])
ok = orders.merge(restaurants, on="restaurant", how="left", validate="many_to_one")
print("clean table passes:", len(ok), "rows")</div>
  <div class="fx" data-lang="text">MergeError: Merge keys are not unique in right dataset; not a many-to-one merge
clean table passes: 11 rows</div>
  <p><code>validate="many_to_one"</code> declares the relationship we expect: many orders may share a restaurant, but each restaurant appears once on the right. Pandas checks before merging and raises <code>MergeError</code> instead of quietly doubling. The clean table passes. Other options: <code>"one_to_one"</code>, <code>"one_to_many"</code>, <code>"many_to_many"</code> (no check).</p>
  <div class="fx" data-lang="py">print(restaurants_bad[restaurants_bad["restaurant"].duplicated(keep=False)])</div>
  <div class="fx" data-lang="text">    restaurant  cuisine  rating
2  Pizza Point    Pizza     3.9
5  Pizza Point  Italian     4.0</div>
  <p>To find the offending keys: <code>duplicated(keep=False)</code> marks every copy, so both Pizza Point rows are shown and someone can decide which is right.</p>
  <h3>A cousin of fan-out: keys of different types</h3>
  <div class="fx" data-lang="py">ids = pd.DataFrame({"order_id": ["101", "102"], "rider": ["Ravi", "Meena"]})   # ids stored as text
try:
    orders.merge(ids, on="order_id")
except ValueError as e:
    print("ValueError:", e)
print(orders.merge(ids.astype({"order_id": "int64"}), on="order_id")[["order_id", "rider"]])</div>
  <div class="fx" data-lang="text">ValueError: You are trying to merge on int64 and str columns for key 'order_id'. If you wish to proceed you should use pd.concat
   order_id  rider
0       101   Ravi
1       102  Meena</div>
  <p>A rider-assignment file stored order ids as text ("101"). Pandas refuses to merge an <code>int64</code> key with a <code>str</code> key rather than silently matching nothing. Convert one side, then the two orders match. Text keys with different spellings or spaces ("Pizza Point " vs "Pizza Point") are worse: they are the same type, so the merge runs and silently matches nothing, which is why keys are cleaned first.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two people with the same roll number in the fee register: when you match attendance to fees, that student's attendance gets copied onto both fee rows, and the class appears to have more attendance than students.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Fan-out</strong>: a join on a key that is not unique on the side assumed to be unique, producing more output rows than input rows. <code>validate=</code> in <code>merge</code> checks uniqueness of keys before joining: <code>"1:1"</code>/<code>"one_to_one"</code>, <code>"1:m"</code>, <code>"m:1"</code>/<code>"many_to_one"</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Three habits after every merge: pass <code>validate=</code>; compare <code>len()</code> before and after (a left many-to-one merge must keep the left row count exactly); check the key dtypes and spellings match. Fan-out is the most common cause of "revenue doubled overnight".</p></div>
  <div class="bridge"><b>What this still can't tell us → next: join &amp; concat.</b> merge matches on columns. Sometimes the key is already the index; sometimes the tables do not need matching at all, because the second simply continues the first.</div>

  <h2 id="pdg-concat"><span class="num">07</span>join &amp; concat</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two cases merge does not fit neatly: attaching a table whose key is its index, and appending tomorrow's orders under today's. Which tools are for these?</p>
  </div>
  <h3>join: merge on the index</h3>
  <div class="fx" data-lang="py">plans = customers.set_index("customer")
print(orders.set_index("customer")[["order_id", "amount"]].join(plans).head(4))</div>
  <div class="fx" data-lang="text">          order_id  amount  plan
customer                        
Asha           101   240.0  gold
Ben            102   450.0  free
Chen           103   520.0  gold
Asha           104   380.0  gold</div>
  <p><code>a.join(b)</code> matches <code>a</code>'s index with <code>b</code>'s index (a left join by default). With customer names as both indexes, every order gets its customer's plan: Asha's two orders both get "gold". It is shorthand for <code>merge(left_index=True, right_index=True, how="left")</code>, the index alignment of <a class="xref" data-note="da_pd_basics">Basics</a> applied to whole tables.</p>
  <h3>concat: stack tables</h3>
  <div class="fx" data-lang="py">late = pd.DataFrame({"order_id": [112, 113], "customer": ["Gita", "Ben"], "restaurant": ["Tandoor Tales", "Dosa Hut"],
                     "city": ["Mumbai", "Pune"], "order_time": pd.to_datetime(["2026-03-07 13:30", "2026-03-07 20:00"]),
                     "amount": [430, 210], "delivery_minutes": [40, 30]})
week = pd.concat([orders.drop(columns=["city_total", "share"]), late], ignore_index=True)
print(week.tail(3)[["order_id", "customer", "restaurant", "amount"]], "\\nrows:", len(week))</div>
  <div class="fx" data-lang="text">    order_id customer     restaurant  amount
10       111      Dia    Pizza Point   700.0
11       112     Gita  Tandoor Tales   430.0
12       113      Ben       Dosa Hut   210.0 
rows: 13</div>
  <p>Two late orders arrived on Saturday in a separate file. <code>pd.concat([a, b])</code> stacks the rows (columns matched by name); <code>ignore_index=True</code> renumbers the index 0–12 instead of keeping two overlapping 0-based indexes. 11 + 2 = 13 rows, and Gita finally ordered (from Tandoor Tales). We dropped the helper columns <code>city_total</code> and <code>share</code> first, since the late file does not have them; otherwise they would be NaN for the new rows.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>concat</code> is stapling Saturday's sales sheet under Friday's. <code>join</code> is clipping each customer's loyalty card to their receipts using the name printed on both.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>pd.concat(objs, axis=0, ignore_index=False, join="outer")</code>: stack along rows (<code>axis=0</code>, like SQL <code>UNION ALL</code>) or side by side (<code>axis=1</code>, aligned on the index); columns missing in one input become NaN. <code>DataFrame.join(other, how="left", on=None)</code>: join on the index (or a column of the caller to the other's index).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>concat</code> does not remove duplicates: if Saturday's file repeats an order from Friday, it is now there twice. Run the duplicate check from <a class="xref" data-note="da_pd_cleaning">Cleaning</a> after every concat. And never <code>concat</code> inside a loop one row at a time (quadratic copying); collect the pieces in a list and concat once.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: pivot_table, pivot, melt.</b> All our answers are long lists: one row per (day, city) or (city, restaurant). A manager wants a grid: days down the side, cities across.</div>

  <h2 id="pdg-pivot"><span class="num">08</span>pivot_table, pivot, melt</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A grid has one row per day and one column per city. Our data has one row per order. How do we go from long (one row per fact) to wide (one column per category value), and back?</p>
  </div>
  <h3>pivot_table: group and spread in one call</h3>
  <div class="fx" data-lang="py">orders["day"] = orders["order_time"].dt.strftime("%m-%d %a")       # "03-02 Mon": sorts by date
wide = orders.pivot_table(index="day", columns="city", values="amount", aggfunc="sum", fill_value=0)
print(wide)</div>
  <div class="fx" data-lang="text">city       Mumbai   Pune
day                     
03-02 Mon   450.0  760.0
03-03 Tue   310.0  380.0
03-04 Wed     0.0  180.0
03-05 Thu   600.0  260.0
03-06 Fri   700.0  290.0</div>
  <p>First a <code>day</code> label per order ("03-02 Mon", month-day first so it sorts in date order). Then the four arguments: <code>index</code> goes down the side, <code>columns</code> across the top, <code>values</code> is what fills the cells, <code>aggfunc</code> says how to combine several orders landing in one cell. By hand: Monday Pune holds orders 101 and 103 → 240 + 520 = 760; Monday Mumbai holds 102 → 450. Wednesday Mumbai shows 0.0: Esha did order (107), but her amount is unknown and a sum of nothing is 0; <code>fill_value=0</code> fills cells with no orders at all with 0 too. A grid cannot tell those two cases apart, so report counts beside it.</p>
  <h3>The default is the mean</h3>
  <div class="fx" data-lang="py">print(orders.pivot_table(index="city", values="amount"))          # no aggfunc -&gt; MEAN
print(orders.pivot_table(index="city", values="amount", aggfunc="sum", margins=True))</div>
  <div class="fx" data-lang="text">            amount
city              
Mumbai  515.000000
Pune    311.666667
        amount
city          
Mumbai  2060.0
Pune    1870.0
All     3930.0</div>
  <p>Without <code>aggfunc</code>, <code>pivot_table</code> averages: Mumbai 2060 / 4 = 515.0. With <code>aggfunc="sum"</code> and <code>margins=True</code> we get totals plus an "All" row: 2060 + 1870 = 3930.</p>
  <h3>pivot: reshape without aggregating</h3>
  <div class="fx" data-lang="py">try:
    orders.pivot(index="day", columns="city", values="amount")
except ValueError as e:
    print("ValueError:", e)</div>
  <div class="fx" data-lang="text">ValueError: Index contains duplicate entries, cannot reshape</div>
  <p><code>pivot</code> only moves values; it cannot combine. Monday/Pune has two orders, so the cell would need two values and pivot refuses. Use <code>pivot</code> only when each (index, column) pair occurs once (for example on the output of a groupby); otherwise use <code>pivot_table</code>.</p>
  <h3>melt: wide back to long</h3>
  <div class="fx" data-lang="py">long = wide.reset_index().melt(id_vars="day", var_name="city", value_name="revenue")
print(long)</div>
  <div class="fx" data-lang="text">         day    city  revenue
0  03-02 Mon  Mumbai    450.0
1  03-03 Tue  Mumbai    310.0
2  03-04 Wed  Mumbai      0.0
3  03-05 Thu  Mumbai    600.0
4  03-06 Fri  Mumbai    700.0
5  03-02 Mon    Pune    760.0
6  03-03 Tue    Pune    380.0
7  03-04 Wed    Pune    180.0
8  03-05 Thu    Pune    260.0
9  03-06 Fri    Pune    290.0</div>
  <p><code>melt</code> unrolls the grid: <code>id_vars</code> stay as columns, every other column becomes rows of (<code>var_name</code>, <code>value_name</code>) pairs. 5 days × 2 cities = 10 rows. This long ("tidy") shape is what groupby, Seaborn and Plotly want (<a class="xref" data-note="da_viz">Visualisation</a>).</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <defs><marker id="pdg-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" class="tm" font-size="10">long: one row per fact</text>
    <rect x="10" y="24" width="190" height="84" class="fb sb"/>
    <text x="18" y="42" font-size="11">day        city    revenue</text><text x="18" y="62" font-size="11">03-02 Mon  Mumbai  450</text><text x="18" y="82" font-size="11">03-02 Mon  Pune    760</text><text x="18" y="102" font-size="11">03-03 Tue  Mumbai  310</text>
    <path d="M210 50 L300 50" stroke="currentColor" marker-end="url(#pdg-ar2)"/><text x="216" y="42" font-size="11">pivot_table</text>
    <path d="M300 84 L210 84" stroke="currentColor" marker-end="url(#pdg-ar2)"/><text x="240" y="102" font-size="11">melt</text>
    <text x="310" y="16" class="tm" font-size="10">wide: one column per city</text>
    <rect x="310" y="24" width="270" height="64" class="ft st"/>
    <text x="318" y="42" font-size="11">day        Mumbai  Pune</text><text x="318" y="62" font-size="11">03-02 Mon  450     760</text><text x="318" y="82" font-size="11">03-03 Tue  310     380</text>
  </svg><figcaption>Long (tidy) is for computing and plotting; wide is for people to read. pivot_table goes long → wide (aggregating); melt goes wide → long.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A long list of exam results (student, subject, mark) versus the printed mark sheet with subjects as columns. The list is easy to add to and to analyse; the sheet is easy to read. pivot_table prints the sheet; melt types it back into the list.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>pivot_table(index, columns, values, aggfunc="mean", fill_value=None, margins=False)</code>: group by index and columns, aggregate, spread columns across. <code>pivot(index, columns, values)</code>: reshape only; each pair must be unique. <code>melt(id_vars, value_vars, var_name, value_name)</code>: wide → long.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>aggfunc="sum"</code> gives averages where you expected totals, and nothing looks wrong. And day names alone ("Mon", "Tue") sort alphabetically (Fri, Mon, Thu, …): use real dates or sortable labels as the index.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: stack, unstack, crosstab.</b> pivot_table builds a grid from raw rows. A groupby with two keys already gives a grouped result: how do we turn one of its keys into columns, and how do we count combinations?</div>

  <h2 id="pdg-stack"><span class="num">09</span>stack, unstack, crosstab</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The (city, restaurant) revenue from section 03 is a long Series with a two-level index. How do we move the restaurant level into columns (and back), and how do we just count how often each combination occurs?</p>
  </div>
  <div class="fx" data-lang="py">s = orders.groupby(["city", "restaurant"])["amount"].sum()
grid = s.unstack(fill_value=0)
print(grid)
print(grid.stack().head(4))</div>
  <div class="fx" data-lang="text">restaurant  Biryani Bros  Dosa Hut  Green Bowl  Momo Magic  Pizza Point
city                                                                   
Mumbai            1050.0       0.0       310.0         0.0        700.0
Pune               380.0     420.0       290.0       260.0        520.0
city    restaurant  
Mumbai  Biryani Bros    1050.0
        Dosa Hut           0.0
        Green Bowl       310.0
        Momo Magic         0.0
dtype: float64</div>
  <p><code>unstack()</code> takes the innermost index level (restaurant) and turns its values into columns: one row per city, one column per restaurant; pairs that never occurred get <code>fill_value=0</code>. <code>stack()</code> does the reverse: columns become the inner index level again (now including the filled zeros, such as Mumbai/Dosa Hut 0.0). So <code>pivot_table</code> is essentially groupby + aggregate + unstack in one call.</p>
  <div class="fx" data-lang="py">print(pd.crosstab(orders["city"], orders["restaurant"], margins=True))
print(pd.crosstab(orders["city"], orders["restaurant"], normalize="index").round(2))</div>
  <div class="fx" data-lang="text">restaurant  Biryani Bros  Dosa Hut  Green Bowl  Momo Magic  Pizza Point  All
city                                                                        
Mumbai                 2         0           1           0            2    5
Pune                   1         2           1           1            1    6
All                    3         2           2           1            3   11
restaurant  Biryani Bros  Dosa Hut  Green Bowl  Momo Magic  Pizza Point
city                                                                   
Mumbai              0.40      0.00        0.20        0.00         0.40
Pune                0.17      0.33        0.17        0.17         0.17</div>
  <p><code>pd.crosstab(rows, cols)</code> counts how many orders fall in each (city, restaurant) cell: Mumbai/Biryani Bros 2 (orders 102, 109). <code>margins=True</code> adds totals (Mumbai 5, Pune 6, all 11). <code>normalize="index"</code> divides each row by its total, giving shares within a city: 40% of Mumbai's orders are Biryani Bros (2 of 5). Counts include order 107, because crosstab counts rows, not amounts.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>unstack is turning a list of (shop, item, sales) into a table with items across the top; stack is reading that table back out line by line. A crosstab is the tally sheet a surveyor keeps: one tick per person in the right (area, answer) box.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><code>unstack(level=-1, fill_value=None)</code>: index level → columns. <code>stack()</code>: columns → innermost index level. <code>pd.crosstab(index, columns, values=None, aggfunc=None, margins=False, normalize=False)</code>: a frequency table (or an aggregation if <code>values</code>/<code>aggfunc</code> are given).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>After <code>unstack</code>, combinations that never happened show as NaN (or your fill value), and <code>stack</code> keeps those zeros as if they were data. Decide whether "no orders" should read as 0 or stay missing before reshaping back.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Same Idea at Scale.</b> Everything was checked by hand on 11 rows. Does the same code hold up on a million?</div>

  <h2 id="pdg-scale"><span class="num">10</span>The Same Idea at Scale</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On 11 rows we can see every pile and every match. On 1,000,000 generated orders, can we still trust the merge (no fan-out), keep the unmatched restaurant visible, and get the answer quickly?</p>
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
import time
big = make_orders(1_000_000)
t = time.perf_counter()
summary = (big.merge(restaurants, on="restaurant", how="left", validate="many_to_one")
              .groupby(["city", "cuisine"], dropna=False)
              .agg(orders=("order_id", "size"), revenue=("amount", "sum"), avg_amount=("amount", "mean")))
print(summary.round(1))
print(f"merge + groupby on {len(big):,} rows: {time.perf_counter() - t:.2f} s")</div>
  <div class="fx" data-lang="text">                     orders     revenue  avg_amount
city   cuisine                                     
Mumbai Biryani        90419  36095006.0       399.2
       Pizza          90272  36048651.0       399.3
       Salads         89833  35843110.0       399.0
       South Indian   89797  35893389.0       399.7
       NaN            90087  36037519.0       400.0
Pune   Biryani       109632  43953921.0       400.9
       Pizza         109948  43882476.0       399.1
       Salads        109607  43906094.0       400.6
       South Indian  110227  44135437.0       400.4
       NaN           110178  44031394.0       399.6
merge + groupby on 1,000,000 rows: 0.28 s</div>
  <p>The generator from <a class="xref" data-note="da_pd_basics">Basics</a> makes a million orders over five restaurants, including Momo Magic. The pipeline merges with <code>validate="many_to_one"</code> (guarding against fan-out), groups by city and cuisine with <code>dropna=False</code> so Momo Magic's orders appear under a NaN cuisine instead of vanishing, and computes three named aggregations. Generated amounts average about ₹400 everywhere (the generator draws them all from the same distribution), so the interesting check is structural: five cuisine rows per city, the NaN row present, order counts adding to 1,000,000. It runs in well under a second, because both the merge and the groupby use hash tables over whole columns.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The same sorting method works for one day's receipts on a desk and a year's receipts in a warehouse; only the size of the piles changes. What must not change is the rule "one supplier card per supplier".</p></div>
  <div class="callout def"><span class="label">Definition</span><p>groupby and merge are implemented with <strong>hash tables</strong>: each key is hashed once, so their cost grows roughly linearly with the number of rows (plus sorting the group keys when <code>sort=True</code>, the default).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>At scale nobody looks at the rows, so the guards must be in the code: <code>validate=</code>, row counts before/after, <code>dropna=False</code> for keys that may be missing. A fan-out on a million rows produces a perfectly plausible-looking wrong number.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects</b>, and then <a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>. We grouped by city, restaurant and cuisine. The owner's last questions are about <em>time</em>: is revenue rising, what is the 3-day average, how many days between a customer's orders? Grouping by a time bucket and sliding windows are the next note.</div>

  <h2 id="pdg-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>groupby, agg, transform, filter, merge, join, concat, pivot_table, pivot, melt, stack, unstack, crosstab. Which are built from which, and which answers which question?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 270" width="660">
<defs><marker id="pdg-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="230" y="8" width="200" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="26" text-anchor="middle" font-size="11.5" font-weight="700">clean keys (Cleaning)</text><text x="330" y="41" text-anchor="middle" class="tm" font-size="10">one spelling · right dtype · unique where needed</text>
<line x1="290" y1="48" x2="150" y2="74" stroke="currentColor" marker-end="url(#pdg-a9)"/><line x1="370" y1="48" x2="510" y2="74" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="40" y="76" width="220" height="40" rx="7" class="fb sb"/><text x="150" y="94" text-anchor="middle" font-size="11.5" font-weight="700">groupby: split by key</text><text x="150" y="109" text-anchor="middle" class="tm" font-size="10">hash rows into piles</text>
<rect x="400" y="76" width="220" height="40" rx="7" class="fb sb"/><text x="510" y="94" text-anchor="middle" font-size="11.5" font-weight="700">merge: match by key</text><text x="510" y="109" text-anchor="middle" class="tm" font-size="10">hash one table, probe the other</text>
<line x1="90" y1="116" x2="60" y2="144" stroke="currentColor" marker-end="url(#pdg-a9)"/><line x1="150" y1="116" x2="150" y2="144" stroke="currentColor" marker-end="url(#pdg-a9)"/><line x1="210" y1="116" x2="240" y2="144" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="10" y="146" width="100" height="36" rx="7" class="ft st"/><text x="60" y="168" text-anchor="middle" font-size="11">agg</text>
<rect x="120" y="146" width="100" height="36" rx="7" class="ft st"/><text x="170" y="168" text-anchor="middle" font-size="11">transform</text>
<rect x="230" y="146" width="100" height="36" rx="7" class="ft st"/><text x="280" y="168" text-anchor="middle" font-size="11">filter</text>
<line x1="470" y1="116" x2="430" y2="144" stroke="currentColor" marker-end="url(#pdg-a9)"/><line x1="550" y1="116" x2="580" y2="144" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="370" y="146" width="130" height="36" rx="7" class="ft st"/><text x="435" y="168" text-anchor="middle" font-size="11">join (index keys)</text>
<rect x="515" y="146" width="130" height="36" rx="7" class="ft st"/><text x="580" y="168" text-anchor="middle" font-size="11">validate= (fan-out)</text>
<line x1="60" y1="182" x2="150" y2="210" stroke="currentColor" marker-end="url(#pdg-a9)"/>
<rect x="60" y="212" width="250" height="40" rx="7" class="fg sg"/><text x="185" y="230" text-anchor="middle" font-size="11.5" font-weight="700">reshape: unstack / pivot_table</text><text x="185" y="245" text-anchor="middle" class="tm" font-size="10">agg + key → columns · melt / stack back</text>
<rect x="380" y="212" width="250" height="40" rx="7" class="fg sg"/><text x="505" y="230" text-anchor="middle" font-size="11.5" font-weight="700">concat</text><text x="505" y="245" text-anchor="middle" class="tm" font-size="10">no keys: stack rows or columns</text>
<line x1="310" y1="232" x2="378" y2="232" stroke="currentColor" stroke-dasharray="3 3"/>
</svg><figcaption>Both big operations rest on clean keys. groupby splits by key and then reduces (agg), broadcasts back (transform) or selects groups (filter); a reduced result with two keys becomes a grid by unstacking (pivot_table does both at once). merge matches rows of two tables by key (join is merge on the index), and validate= protects it from duplicate keys. concat needs no keys at all.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the Biteful tables</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>groupby + sum</td><td>split-apply-combine</td><td>total per group?</td><td>Mumbai 2060, Pune 1870</td><td>any per-category summary</td></tr>
    <tr><td>size vs count</td><td>rows vs non-null</td><td>how complete is each group?</td><td>Mumbai 5 vs 4</td><td>always beside sums/means</td></tr>
    <tr><td>Named agg</td><td>agg</td><td>several labelled summaries?</td><td>Biryani Bros 3 orders, 1430, 46.5 min</td><td>report tables</td></tr>
    <tr><td>transform</td><td>groupby, broadcast back</td><td>group value on each row?</td><td>101: 240 / 1870 = 0.13</td><td>shares, group-normalising, fills</td></tr>
    <tr><td>filter</td><td>groupby + test</td><td>keep whole groups?</td><td>≥ 2 orders: 10 rows</td><td>HAVING-style conditions</td></tr>
    <tr><td>merge (4 types)</td><td>key matching</td><td>facts from another table?</td><td>10 / 11 / 11 / 12 rows</td><td>enrichment, lookups</td></tr>
    <tr><td>indicator / anti-join</td><td>merge or isin</td><td>who is unmatched?</td><td>Momo Magic, Tandoor Tales; Gita, Farah</td><td>data-quality and business checks</td></tr>
    <tr><td>validate=</td><td>uniqueness check</td><td>is the merge safe?</td><td>duplicate Pizza Point: 11 → 14, 3930 → 5150 caught</td><td>every merge</td></tr>
    <tr><td>join / concat</td><td>index alignment / stacking</td><td>attach by index; append?</td><td>plans per order; 11 + 2 = 13</td><td>indexed lookups; new batches</td></tr>
    <tr><td>pivot_table / pivot</td><td>groupby + unstack</td><td>a grid?</td><td>Mon: Mumbai 450, Pune 760; default mean 515.0</td><td>reports</td></tr>
    <tr><td>melt / stack</td><td>reverse of the above</td><td>back to long?</td><td>5 days × 2 cities = 10 rows</td><td>plotting, further grouping</td></tr>
    <tr><td>crosstab</td><td>counting pairs</td><td>how often each combination?</td><td>Mumbai/Biryani Bros 2; 40% of Mumbai</td><td>frequency tables</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Everything in this note is "match rows by key".</strong> groupby matches rows of one table to each other (same key → same pile); merge matches rows of two tables (same key → same output row); reshaping moves a key between the row index and the column header. That is why clean, correctly typed, appropriately unique keys decide whether every result is right.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The ways these tools give wrong totals that look right.</div>

  <h2 id="pdg-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which slips with grouping, joining and reshaping produce plausible but wrong numbers, and how do you catch them?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: count vs size</span><p><code>count</code> skips NaN values; <code>size</code> counts rows. Mumbai: 4 vs 5.</p></div>
  <div class="callout trap"><span class="label">Trap: NaN keys vanish</span><p>groupby drops rows whose key is NaN unless <code>dropna=False</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: assigning an agg result as a column</span><p>Index mismatch → all NaN. Use <code>transform</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: fan-out</span><p>Duplicate lookup keys multiply rows (11 → 14) and inflate sums (3930 → 5150). Use <code>validate=</code> and compare lengths.</p></div>
  <div class="callout trap"><span class="label">Trap: key dtype or spelling mismatch</span><p>int vs str keys refuse to merge; "Pizza Point " vs "Pizza Point" silently match nothing.</p></div>
  <div class="callout trap"><span class="label">Trap: inner join by default</span><p><code>merge</code> defaults to <code>how="inner"</code>, silently dropping Momo Magic's order. Choose <code>how</code> on purpose.</p></div>
  <div class="callout trap"><span class="label">Trap: pivot_table's mean</span><p>Pass <code>aggfunc="sum"</code> for totals.</p></div>
  <div class="callout trap"><span class="label">Trap: zeros that mean "unknown"</span><p>A sum of only NaN is 0; Wednesday Mumbai shows 0.0 although an order exists. Show counts beside grids.</p></div>
  <div class="callout trap"><span class="label">Trap: concat duplicates</span><p>concat never de-duplicates; check after appending.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="pdg-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: Biteful's 11 clean orders, 2–6 March 2026. Mumbai: 102 Ben Biryani Bros 450 · 105 Dia Green Bowl 310 · 107 Esha Pizza Point NaN · 109 Farah Biryani Bros 600 · 111 Dia Pizza Point 700. Pune: 101 Asha Dosa Hut 240 · 103 Chen Pizza Point 520 · 104 Asha Biryani Bros 380 · 106 Ben Dosa Hut 180 · 108 Chen Momo Magic 260 · 110 Asha Green Bowl 290. restaurants: Dosa Hut, Biryani Bros, Pizza Point, Green Bowl, Tandoor Tales (no Momo Magic). customers: Asha, Ben, Chen, Dia, Esha, Gita (no Farah).</p>
  <h3>The ladder in one line each</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer on our data</th><th>Weakness → next</th></tr>
    <tr><td>Split-apply-combine</td><td>total per group?</td><td>Mumbai 2060, Pune 1870</td><td>hides unknown amounts</td></tr>
    <tr><td>size vs count</td><td>rows vs values?</td><td>Mumbai 5 vs 4</td><td>one number per group</td></tr>
    <tr><td>Named agg, 2 keys</td><td>several summaries?</td><td>Biryani Bros 3, 1430, 46.5</td><td>rows disappear</td></tr>
    <tr><td>transform / filter</td><td>group value per row; keep groups?</td><td>101 share 0.13; 10 rows</td><td>cuisine elsewhere</td></tr>
    <tr><td>merge</td><td>facts from another table?</td><td>inner 10, left 11, right 11, outer 12</td><td>duplicate keys?</td></tr>
    <tr><td>validate=</td><td>safe merge?</td><td>11 → 14, 3930 → 5150 caught</td><td>index keys, appending</td></tr>
    <tr><td>join / concat</td><td>by index; stack rows?</td><td>13 rows with Saturday</td><td>long lists</td></tr>
    <tr><td>pivot_table / melt</td><td>grid and back?</td><td>Mon Pune 760; default mean 515</td><td>moving keys of grouped results</td></tr>
    <tr><td>stack / unstack / crosstab</td><td>move keys; count pairs?</td><td>Mumbai/Biryani Bros 2 (40%)</td><td>scale</td></tr>
    <tr><td>At scale</td><td>1M rows?</td><td>validate + dropna=False, &lt; 1 s</td><td>→ time series</td></tr>
  </table>
  <h3>Syntax and formulas</h3>
  <table class="tbl">
    <tr><th>Task</th><th>Code</th><th>Meaning</th></tr>
    <tr><td>Group total</td><td><code>df.groupby("k")["v"].sum()</code></td><td>Σ v over rows with the same k</td></tr>
    <tr><td>Group mean</td><td><code>…["v"].mean()</code></td><td>Σ known v / count of known v (515.0 = 2060 / 4)</td></tr>
    <tr><td>Named agg</td><td><code>agg(out=("col", "func"), …)</code></td><td>one output column per keyword</td></tr>
    <tr><td>Share of group</td><td><code>df.v / df.groupby("k").v.transform("sum")</code></td><td>row value ÷ its group's total</td></tr>
    <tr><td>Keep groups</td><td><code>df.groupby("k").filter(lambda g: len(g) &gt;= 2)</code></td><td>all rows of passing groups</td></tr>
    <tr><td>Join</td><td><code>a.merge(b, on="k", how="left", validate="many_to_one")</code></td><td>rows out = rows of a when keys of b are unique</td></tr>
    <tr><td>Fan-out size</td><td>for each matching key: rows out = (left rows with it) × (right rows with it)</td><td>Pizza Point: 3 × 2 = 6</td></tr>
    <tr><td>Anti-join</td><td><code>a[~a.k.isin(b.k)]</code></td><td>rows of a with no partner</td></tr>
    <tr><td>Grid</td><td><code>pivot_table(index=, columns=, values=, aggfunc="sum")</code></td><td>group + unstack</td></tr>
    <tr><td>Back to long</td><td><code>melt(id_vars=…, var_name=…, value_name=…)</code></td><td>columns → rows</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>agg</b><p>One summary row per group.</p><small>Not when you need per-row context</small></div>
    <div><b>transform</b><p>Group value beside every row (shares, z-scores within group, fills).</p><small>Not for building a summary table</small></div>
    <div><b>left merge</b><p>Enrich every fact row with lookup details.</p><small>Not without validate= and a row-count check</small></div>
    <div><b>inner merge</b><p>Only rows with a partner matter.</p><small>Not when silently losing rows would bias totals</small></div>
    <div><b>pivot_table</b><p>Grids for people, with aggfunc set.</p><small>Not as input to further computation (melt it back)</small></div>
    <div><b>concat</b><p>Append batches with the same columns.</p><small>Not to match rows by key (that is merge)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>count vs size; NaN keys dropped; agg result assigned as a column; fan-out; key dtype/spelling mismatch; inner join by default; pivot_table mean; zeros meaning unknown; concat duplicates.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Mumbai's mean amount, and why not 2060 / 5?</td><td>515.0 = 2060 / 4: the mean divides by known values only</td></tr>
    <tr><td>Rows after an inner merge of orders with restaurants?</td><td>10: Momo Magic's order has no partner</td></tr>
    <tr><td>Pizza Point listed twice: rows and revenue after a left merge?</td><td>14 rows; 3930 + 520 + 700 = 5150</td></tr>
    <tr><td>agg, transform or filter for "each order's share of its city"?</td><td>transform (city total on every row), then divide</td></tr>
    <tr><td>Why does <code>pivot</code> fail on day × city?</td><td>Monday/Pune has two orders; pivot cannot aggregate; use pivot_table</td></tr>
  </table>

  <h2 id="pdg-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain split-apply-combine on an example.</summary><div class="qa-body">Revenue per city: split the 11 orders into Mumbai (5) and Pune (6) piles, apply sum to each (2060 and 1870, NaN skipped), combine into a Series indexed by city. <code>orders.groupby("city")["amount"].sum()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>agg vs transform vs filter?</summary><div class="qa-body">agg: one row per group (GROUP BY). transform: same rows as input, each with its group's value (window function). filter: the original rows of groups passing a test (HAVING).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top-2 orders by amount within each city.</summary><div class="qa-body"><code>orders.sort_values("amount", ascending=False).groupby("city").head(2)</code>, or rank within groups (<a class="xref" data-note="da_pd_time">Time Series &amp; Performance</a>): Mumbai 111 (700) and 109 (600), Pune 103 (520) and 104 (380).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>After merging orders (1,000 rows) with a lookup table you have 1,214 rows. What happened and how do you fix it?</summary><div class="qa-body">Fan-out: some keys appear more than once in the lookup table. Find them with <code>lookup[lookup.key.duplicated(keep=False)]</code>, fix or de-duplicate, and add <code>validate="many_to_one"</code> so it fails loudly next time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find customers who never ordered.</summary><div class="qa-body">Anti-join: <code>customers[~customers.customer.isin(orders.customer)]</code> → Gita; or <code>customers.merge(orders, how="left", indicator=True).query("_merge == 'left_only'")</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>merge vs join vs concat?</summary><div class="qa-body">merge: SQL-style join on columns (or indexes). join: shortcut for joining on the index, left by default. concat: stacks tables along rows or columns, aligning labels, without matching keys (UNION ALL).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>pivot vs pivot_table?</summary><div class="qa-body">pivot only reshapes and fails if an (index, column) pair repeats; pivot_table groups and aggregates (default mean), so it handles repeats, and supports fill_value and margins.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you go from a wide sales grid back to one row per (day, city)?</summary><div class="qa-body"><code>wide.reset_index().melt(id_vars="day", var_name="city", value_name="revenue")</code>, or <code>wide.stack()</code> for a Series with a two-level index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does groupby need the Cleaning note?</summary><div class="qa-body">groupby splits by exact key values. Before cleaning, Pune/" pune" and Mumbai/MUMBAI are four groups and the duplicate order 105 adds ₹310 twice. The totals 2060 and 1870 are only right on clean keys.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is transform related to Series alignment from Basics?</summary><div class="qa-body">transform returns a result indexed like the original rows, so assigning it as a column aligns perfectly. An agg result is indexed by group keys; assigning it aligns those labels with row labels and gives NaN. Alignment explains both outcomes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you merge before checking key uniqueness?</summary><div class="qa-body">Every later number: a duplicate restaurant row turns 11 orders into 14 rows and ₹3,930 into ₹5,150, and groupby, pivot_table and charts all faithfully summarise the inflated table. validate= is the cheap guard.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do these ideas map to SQL and Spark?</summary><div class="qa-body">groupby+agg is GROUP BY, filter is HAVING, transform is a window function (<a class="xref" data-note="sql_windows">Window Functions</a>), merge is JOIN (<a class="xref" data-note="sql_joins">SQL JOINs</a>), concat is UNION ALL. Spark DataFrames (<a class="xref" data-note="de_spark">Apache Spark</a>) offer the same operations distributed over machines, where a fan-out or a skewed key costs far more.</div></details>
</main>
`
});
