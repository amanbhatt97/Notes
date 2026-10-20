// notes/databases/sql_optimization.js — Indexes & Performance
Object.assign(TOPIC_CONTENT, {
  "sql_optimization": `<main>
  <h1>Indexes &amp; Performance</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Indexes &amp; Performance</span></div>
  <p class="lead">Why a query that was instant on 10 rows takes 60 ms on a million, how an index makes it fast again, and how to read the plan that proves it. The whole note follows ONE query on ONE running example: <strong>Asha's "My orders" screen</strong> on <strong>Biteful</strong>, the food-delivery company from <a class="xref" data-note="sql_relational">Relational Model</a> and <a class="xref" data-note="sql_joins">JOINs</a>. Every concept is first traced by hand on the 10-order Biteful tables, then shown on <strong>the same idea at scale</strong>: the same four-table schema with 100,000 customers and 1,000,000 orders (customer 1 is still Asha). Every plan and number below is real PostgreSQL 16 output from those databases (parallel workers turned off so plans are easy to read; timings are from one laptop-class machine and will differ on yours, page counts will not).</p>

  <h2 id="so-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="so-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="115" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="67" y="41" text-anchor="middle" font-size="12">Fundamentals</text><text x="67" y="58" text-anchor="middle" class="tm" font-size="10">WHERE, ORDER BY</text>
<line x1="125" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#so-a0)"/>
<rect x="145" y="20" width="115" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="202" y="41" text-anchor="middle" font-size="12">JOINs / Windows</text><text x="202" y="58" text-anchor="middle" class="tm" font-size="10">what to compute</text>
<line x1="260" y1="45" x2="278" y2="45" stroke="currentColor" marker-end="url(#so-a0)"/>
<rect x="280" y="20" width="130" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="345" y="41" text-anchor="middle" font-size="12" font-weight="700">Indexes &amp; Perf.</text><text x="345" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="410" y1="45" x2="428" y2="45" stroke="currentColor" marker-end="url(#so-a0)"/>
<rect x="430" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="485" y="41" text-anchor="middle" font-size="12">Transactions</text><text x="485" y="58" text-anchor="middle" class="tm" font-size="10">many users at once</text>
<line x1="540" y1="45" x2="558" y2="45" stroke="currentColor" marker-end="url(#so-a0)"/>
<rect x="560" y="20" width="90" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="605" y="41" text-anchor="middle" font-size="12">Modeling</text><text x="605" y="58" text-anchor="middle" class="tm" font-size="10">table design</text>
<text x="10" y="105" class="tm" font-size="10.5">Earlier notes decide WHAT a query returns. This note decides HOW FAST: the same result, read from 25 pages instead of 9,345.</text>
<text x="10" y="123" class="tm" font-size="10.5">Nothing here changes a query's answer; everything here changes how much of the disk the database must touch to get it.</text>
</svg><figcaption>The SQL group of the Databases track. You can write correct queries; now they must stay fast when the table grows a hundred-thousand-fold.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: correct queries</b><span><a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a>, <a class="xref" data-note="sql_joins">JOINs</a>, <a class="xref" data-note="sql_subqueries">Subqueries</a> and <a class="xref" data-note="sql_windows">Window Functions</a> taught what to write so the answer is right. On Biteful's 10 orders every query was instant, so speed never came up. (<a class="xref" data-note="sql_joins">JOINs</a> section 10 already showed that the engine picks a join algorithm; here we learn how it decides.)</span></li>
    <li><b>This note adds: the physical side</b><span>How rows sit on disk, why a filter reads the whole table, how a B-tree index turns that into a handful of page reads, how to read EXPLAIN, how to shape an index for a query, why the planner sometimes ignores it, and what indexes, partitions and column stores cost.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sql_transactions">Transactions &amp; Concurrency</a></b><span>One fast query is not the end: thousands of users read and write the same rows at the same time. The row versions you see here (a row's address changes when it is updated, VACUUM cleans up) are the MVCC machinery that note explains. <a class="xref" data-note="sql_modeling">Data Modeling</a> then designs tables (OLTP vs OLAP, star schemas) with this cost model in mind.</span></li>
  </ol>

  <h2 id="so-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. The running query is Asha's "My orders" screen: <code>SELECT order_id, ordered_at, amount FROM orders WHERE customer_id = 1 ORDER BY ordered_at DESC</code>.</p>
  <ol class="story">
    <li><b>The slow query</b><span>Q: why does Asha's screen take 0.02 ms on 10 orders but ~60 ms on 1,000,000? → the time grew with the table, not with Asha's 12 orders. But what exactly is being read?</span></li>
    <li><b>Pages and the heap</b><span>Q: how is a table stored? → rows packed into 8 KB pages, in arrival order (the heap); Asha's 12 orders sit on 12 different pages out of 9,345. But how much does finding them cost?</span></li>
    <li><b>Full scan cost</b><span>Q: what does a Seq Scan pay? → every page plus a test on every row: 9,345 + 1,000,000 × 0.0125 = 21,845 cost units, computed by hand and matched by EXPLAIN. Cost grows with the table. How do we read only Asha's pages?</span></li>
    <li><b>B-tree index</b><span>Q: how do we jump to the right pages? → a sorted copy of customer_id with row addresses, as a 3-level tree: root → internal → leaf, searched by hand to the exact 12 addresses. But how do we know the database used it?</span></li>
    <li><b>EXPLAIN / EXPLAIN ANALYZE</b><span>Q: what did the database actually do? → the plan tree, line by line: 9,345 pages → 15 pages, ~60 ms → ~0.1 ms. But the screen also sorts by date, and other screens filter on two columns…</span></li>
    <li><b>Composite index and column order</b><span>Q: one index for "customer = 1 AND since January, newest first"? → (customer_id, ordered_at): sorted by customer, then by time inside each customer; the leftmost-prefix rule traced. It still visits the table for <code>amount</code>…</span></li>
    <li><b>Covering index / Index Only Scan</b><span>Q: can we skip the table entirely? → INCLUDE the selected columns; Heap Fetches 0 (after VACUUM). But the same index is useless if the query wraps the column in a function…</span></li>
    <li><b>Sargability</b><span>Q: why is my index ignored when I write <code>date(ordered_at) = …</code>? → the index is sorted by the stored value, not by a function of it; rewrite as a range. But sometimes the index is ignored even for a perfect predicate…</span></li>
    <li><b>Planner statistics</b><span>Q: how does the planner guess row counts, and what if it guesses wrong? → per-column stats from ANALYZE; a ₹199 promotion added 300,000 rows the stats didn't know about → estimate 10, actual 300,007 → bad Nested Loop. B-trees also can't answer "name contains kapoor"…</span></li>
    <li><b>Other index types</b><span>Q: what about "contains", huge time-ordered tables, or only a few hot rows? → GIN (trigrams), BRIN (24 kB vs 21 MB), partial (240 kB), hash (= only). But a billion-row table is still one table to scan and to clean up…</span></li>
    <li><b>Partitioning</b><span>Q: can we skip whole months and delete old ones cheaply? → one child table per month; pruning reads 1 of 13 partitions; DROP instead of DELETE. But a report that sums one column still reads every column of every row…</span></li>
    <li><b>Row vs column store</b><span>Q: why are analytics engines faster at <code>SUM(amount)</code>? → they store each column separately and read only what is asked. And all these indexes are not free…</span></li>
    <li><b>Write cost of indexes</b><span>Q: what does each index cost? → every INSERT updates every index: 200,000 inserts became roughly ten times slower with 5 indexes. Even with perfect indexes, the app can still waste them…</span></li>
    <li><b>OFFSET pagination and N+1</b><span>Q: why is page 5,000 slow, and why is a loop of tiny queries slow? → OFFSET reads rows to throw them away; N+1 pays a round trip per row. Keyset pagination and one set-based query fix them.</span></li>
  </ol>

  <h2 id="so-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">Indexes &amp; Performance</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Storage &amp; scans</div>
      <ul>
        <li><b>Page</b> — 8 KB block; the unit of reading</li>
        <li><b>Heap</b> — table rows in arrival order; address = ctid (page, slot)</li>
        <li><b>Seq Scan cost</b> — pages × 1 + rows × (0.01 + 0.0025) = 21,845</li>
        <li><b>Cost ∝ pages read</b>, not rows returned</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">B-tree</div>
      <ul>
        <li><b>Sorted keys + ctids</b>; 💡 index at the back of a textbook</li>
        <li><b>Root → internal → leaf</b>: 3 levels for 1M rows</li>
        <li><b>Linked leaves</b> → ranges, ORDER BY, prefix LIKE</li>
        <li>Asha: 3 index pages + 12 heap pages</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">EXPLAIN</div>
      <ul>
        <li><b>EXPLAIN</b> — plan + estimates; <b>ANALYZE</b> runs it</li>
        <li><b>BUFFERS</b> — pages touched (hit = cache, read = disk)</li>
        <li><b>Read inside-out</b>; compare estimated vs actual rows</li>
        <li>⚠ ANALYZE executes writes → BEGIN … ROLLBACK</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Shaping the index</div>
      <ul>
        <li><b>Composite (a, b)</b> — serves a, a+b; not b alone</li>
        <li><b>Equality first, range last</b></li>
        <li><b>INCLUDE</b> → Index Only Scan; needs VACUUM (visibility map)</li>
        <li><b>Expression</b> — <code>ON (lower(name))</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Why the index is ignored</div>
      <ul>
        <li>⚠ <b>Function / cast on the column</b> → keep the column bare</li>
        <li>⚠ <b>Leading %</b> → trigram GIN</li>
        <li><b>Low selectivity</b> → Seq Scan is right</li>
        <li><b>Stale stats</b> → wrong estimate → <code>ANALYZE</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Other structures</div>
      <ul>
        <li><b>Hash</b> = only · <b>GIN</b> contains · <b>BRIN</b> min/max per block range · <b>partial</b> WHERE</li>
        <li><b>Partitioning</b> — pruning + DROP old months</li>
        <li><b>Column store</b> — reads only the columns asked (OLAP)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Costs &amp; app patterns</div>
      <ul>
        <li><b>Every index slows every write</b> and takes space</li>
        <li><b>OFFSET</b> reads and discards; <b>keyset</b> seeks</li>
        <li><b>N+1</b> — one round trip per row → one set-based query</li>
      </ul>
    </div>
  </div>
</div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="so-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="so-slow"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Slow at 1M Rows</span><span class="rm-sub">Same query, thousands of times slower</span></div></div>
      <div class="rm-item rm-done" data-target="so-store"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pages &amp; the Heap</span><span class="rm-sub">How a table is stored</span></div></div>
      <div class="rm-item rm-done" data-target="so-scan"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Full Scan Cost</span><span class="rm-sub">21,845 by hand</span></div></div>
      <div class="rm-item rm-done" data-target="so-btree"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">B-tree Index</span><span class="rm-sub">Drawn and searched by hand</span></div></div>
      <div class="rm-item rm-done" data-target="so-explain"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">EXPLAIN ANALYZE</span><span class="rm-sub">A plan, line by line</span></div></div>
      <div class="rm-item rm-done" data-target="so-composite"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Composite Indexes</span><span class="rm-sub">Leftmost prefix traced</span></div></div>
      <div class="rm-item rm-done" data-target="so-cover"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Covering Indexes</span><span class="rm-sub">Index Only Scan</span></div></div>
      <div class="rm-item rm-done" data-target="so-sarg"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Sargability</span><span class="rm-sub">Functions kill indexes</span></div></div>
      <div class="rm-item rm-done" data-target="so-stats"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Planner Statistics</span><span class="rm-sub">Stale stats, bad plan</span></div></div>
      <div class="rm-item rm-done" data-target="so-types"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Other Index Types</span><span class="rm-sub">Hash, GIN, BRIN, partial</span></div></div>
      <div class="rm-item rm-done" data-target="so-part"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Partitioning</span><span class="rm-sub">Pruning and cheap retention</span></div></div>
      <div class="rm-item rm-done" data-target="so-column"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Row vs Column Store</span><span class="rm-sub">Postgres vs DuckDB</span></div></div>
      <div class="rm-item rm-done" data-target="so-cost"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Write Cost of Indexes</span><span class="rm-sub">Nothing is free</span></div></div>
      <div class="rm-item rm-done" data-target="so-app"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Pagination &amp; N+1</span><span class="rm-sub">App-side slowness</span></div></div>
      <div class="rm-item rm-done" data-target="so-connect"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One cost model</span></div></div>
      <div class="rm-item rm-done" data-target="so-traps"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Checklist</span></div></div>
      <div class="rm-item rm-done" data-target="so-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="so-qa"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="so-slow"><span class="num">01</span>This Query Got Slow at 1M Rows</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every query in the earlier notes ran on Biteful's 10 orders and came back instantly, so we only ever asked "is the answer right?". Biteful has now grown to a million orders, and the "My orders" screen got slow. Nothing in the query changed. Why does the same, correct query get slower, and slower by how much?</p>
  </div>
  <p>When Asha opens the app and taps "My orders", the app runs this query: her orders, newest first. Here it is on the original Biteful tables (7 customers, 10 orders). <code>EXPLAIN ANALYZE</code> runs the query and reports what the database did and how long it took; section 05 reads it line by line, for now just look at the last line.</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Sort  (cost=1.15..1.16 rows=3 width=17) (actual time=0.016..0.016 rows=3 loops=1)
  Sort Key: ordered_at DESC
  Sort Method: quicksort  Memory: 25kB
  -&gt;  Seq Scan on orders  (cost=0.00..1.12 rows=3 width=17) (actual time=0.008..0.009 rows=3 loops=1)
        Filter: (customer_id = 1)
        Rows Removed by Filter: 7
Planning Time: 0.181 ms
Execution Time: 0.030 ms</div>
  <p>Execution Time is a few hundredths of a millisecond. Now <strong>the same idea at scale</strong>: the same schema with 100,000 customers and 1,000,000 orders, one order every 30 seconds from March 2025 to February 2026 (the script is at the end of this section). Customer 1 is still Asha; at this size she has 12 orders. Same query, word for word:</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Sort  (cost=21845.19..21845.22 rows=11 width=18) (actual time=59.438..59.440 rows=12 loops=1)
  Sort Key: ordered_at DESC
  Sort Method: quicksort  Memory: 25kB
  -&gt;  Seq Scan on orders  (cost=0.00..21845.00 rows=11 width=18) (actual time=0.117..59.396 rows=12 loops=1)
        Filter: (customer_id = 1)
        Rows Removed by Filter: 999988
Planning Time: 0.186 ms
Execution Time: 59.483 ms</div>
  <p>Two lines tell the story. <code>Rows Removed by Filter: 999988</code>: the database tested a million rows to keep 12. And the time went up by roughly the same factor as the table: 100,000 times more rows, thousands of times slower. Asha's 12 rows did not get harder to return; the work grew with the <em>table</em>, not with the <em>answer</em>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop keeps all bills in one shoebox, in the order they were written. With 10 bills, finding Asha's takes a glance. With a million bills, the clerk must still look at every single one, because nothing tells him where Asha's are. He is not slow at reading bills; there are just too many to read.</p>
  </div>
  <p>Why it matters: 60 ms sounds small. But if 1,000 people open "My orders" every second, that is 60 seconds of database work per second of real time; the server falls over. In interviews, "this query is slow, what do you do?" is one of the most common SQL questions, and the answer starts with understanding <em>what</em> is being read.</p>
  <details><summary>The script that builds "Biteful at scale"</summary>
  <div class="fx" data-lang="sql">-- same CREATE TABLEs as Biteful; customers 1-7 and restaurants 10-14 are the originals
SELECT setseed(0.42);                      -- same random numbers on every run
INSERT INTO customers SELECT g, first || ' ' || last, city, signup, NULL
  FROM generate_series(8, 100000) g ...;  -- names like 'Kavya Kapoor'
INSERT INTO orders
SELECT g,
       1 + floor(random()*100000)::int,                          -- customer
       10 + floor(random()*2000)::int,                           -- restaurant
       timestamptz '2025-03-10 00:00+05:30' + g * interval '30 seconds',  -- time order
       s,                                                         -- 93% delivered, 6% cancelled, 1% pending
       round((80 + random()*1120)::numeric, 2), ...
FROM generate_series(1, 1000000) g ...;
VACUUM ANALYZE customers; VACUUM ANALYZE restaurants; VACUUM ANALYZE orders;</div>
  </details>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Query performance</strong> is how much work the database does to produce a result. The result is fixed by the SQL; the work is not. The same query can read 1 page or 9,345 pages depending on how the data is stored and which <strong>indexes</strong> exist.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Testing performance on a tiny development table. Every plan is fast on 10 rows. Always test on production-sized data (or generate it, as we did): problems only appear at scale.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: pages and the heap.</b> We know the work grows with the table. To shrink it we must know what the database physically reads when it "looks at a row".</div>

  <h2 id="so-store"><span class="num">02</span>How a Table Is Stored: Pages and the Heap</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Tested a million rows" is vague. Rows are not loose objects; they live in files on disk. What is the unit the database reads, and where exactly are Asha's 12 orders?</p>
  </div>
  <p>PostgreSQL stores a table as a file cut into fixed blocks called <strong>pages</strong>, each 8 KB. New rows are appended wherever there is room, in no particular order; this unordered pile of pages is called the <strong>heap</strong>. Every row has a physical address called its <strong>ctid</strong>: <code>(page number, slot within the page)</code>. You can see it as a hidden column:</p>
  <div class="fx" data-lang="sql">SELECT ctid, order_id, customer_id, amount FROM orders ORDER BY ctid;</div>
  <table class="tbl out"><caption>Biteful's 10 orders: all on page 0</caption><tr><th>ctid</th><th>order_id</th><th>customer_id</th><th>amount</th></tr><tr><td>(0,1)</td><td>101</td><td>1</td><td>240.00</td></tr><tr><td>(0,2)</td><td>102</td><td>2</td><td>450.00</td></tr><tr><td>(0,3)</td><td>103</td><td>3</td><td>520.00</td></tr><tr><td>(0,4)</td><td>104</td><td>1</td><td>380.00</td></tr><tr><td>(0,5)</td><td>105</td><td>4</td><td>310.00</td></tr><tr><td>(0,6)</td><td>106</td><td>2</td><td>180.00</td></tr><tr><td>(0,7)</td><td>107</td><td>5</td><td>260.00</td></tr><tr><td>(0,8)</td><td>108</td><td>3</td><td>260.00</td></tr><tr><td>(0,9)</td><td>109</td><td>6</td><td>600.00</td></tr><tr><td>(0,10)</td><td>110</td><td>1</td><td>310.00</td></tr></table>
  <div class="fx" data-lang="sql">SELECT pg_relation_size('orders') AS bytes,
       pg_relation_size('orders') / 8192 AS pages;</div>
  <table class="tbl out"><caption>Size of the table file</caption><tr><th>bytes</th><th>pages</th></tr><tr><td>8192</td><td>1</td></tr></table>
  <p>Trace it: all 10 orders sit in page 0, slots 1 to 10, in the order they were inserted. The file is 8,192 bytes, exactly one page. To read <em>any</em> order the database reads that page; to read <em>all</em> of them it reads the same page. That is why the tiny query was instant.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A register with numbered pages. Each bill is written on the next free line. The ctid is "page 812, line 5". To read one line you must open (fetch) the whole page; you never fetch half a page.</p>
  </div>
  <p>Now at scale. How many pages, and where are Asha's 12 orders?</p>
  <div class="fx" data-lang="sql">SELECT relpages AS pages, reltuples::bigint AS rows,
       round(reltuples / relpages) AS rows_per_page,
       pg_size_pretty(pg_relation_size('orders')) AS size
FROM pg_class WHERE relname = 'orders';</div>
  <table class="tbl out"><caption>orders at scale</caption><tr><th>pages</th><th>rows</th><th>rows_per_page</th><th>size</th></tr><tr><td>9345</td><td>1000000</td><td>107</td><td>73 MB</td></tr></table>
  <div class="fx" data-lang="sql">SELECT ctid, order_id, ordered_at::date AS day FROM orders
WHERE customer_id = 1 ORDER BY ctid;</div>
  <table class="tbl out"><caption>Asha's 12 orders and their physical addresses</caption><tr><th>ctid</th><th>order_id</th><th>day</th></tr><tr><td>(11,48)</td><td>1226</td><td>2025-03-10</td></tr><tr><td>(742,77)</td><td>79479</td><td>2025-04-06</td></tr><tr><td>(1122,42)</td><td>120112</td><td>2025-04-20</td></tr><tr><td>(1214,2)</td><td>129916</td><td>2025-04-24</td></tr><tr><td>(1466,32)</td><td>156911</td><td>2025-05-03</td></tr><tr><td>(4124,20)</td><td>441353</td><td>2025-08-10</td></tr><tr><td>(5315,19)</td><td>568802</td><td>2025-09-23</td></tr><tr><td>(6113,18)</td><td>654206</td><td>2025-10-23</td></tr><tr><td>(7286,21)</td><td>779734</td><td>2025-12-05</td></tr><tr><td>(8370,104)</td><td>895821</td><td>2026-01-15</td></tr><tr><td>(8894,41)</td><td>951835</td><td>2026-02-03</td></tr><tr><td>(9277,43)</td><td>992824</td><td>2026-02-17</td></tr></table>
  <p>About 107 orders fit on a page, so a million orders fill 9,345 pages (73 MB). Asha's 12 orders are on 12 different pages scattered from page 11 to page 9,277, because she ordered on 12 different days and rows are stored in arrival order. Nothing in the heap groups rows by customer. To find "all rows with customer_id = 1" with only the heap, there is no choice but to open all 9,345 pages.</p>
  <figure class="viz"><svg viewBox="0 0 640 120" width="640">
    <text x="0" y="14" font-size="11" class="tm">heap of orders: 9,345 pages, rows in arrival (time) order; blue = a page holding one of Asha's orders</text>
    <rect x="0" y="24" width="640" height="34" class="fs" stroke="currentColor" stroke-opacity="0.3"/>
    <g class="fb sb"><rect x="1" y="24" width="4" height="34"/><rect x="51" y="24" width="4" height="34"/><rect x="77" y="24" width="4" height="34"/><rect x="83" y="24" width="4" height="34"/><rect x="100" y="24" width="4" height="34"/><rect x="282" y="24" width="4" height="34"/><rect x="364" y="24" width="4" height="34"/><rect x="418" y="24" width="4" height="34"/><rect x="499" y="24" width="4" height="34"/><rect x="573" y="24" width="4" height="34"/><rect x="609" y="24" width="4" height="34"/><rect x="635" y="24" width="4" height="34"/></g>
    <text x="0" y="76" font-size="10" class="tm">page 0 (Mar 2025)</text><text x="640" y="76" font-size="10" class="tm" text-anchor="end">page 9,344 (Feb 2026)</text>
    <text x="0" y="100" font-size="11">Seq Scan opens every page left to right and tests ~107 rows on each: 9,345 pages to find 12 rows.</text>
  </svg><figcaption>Asha's rows (pages 11, 742, 1122, 1214, 1466, 4124, 5315, 6113, 7286, 8370, 8894, 9277) drawn to scale. The heap has no order by customer.</figcaption></figure>
  <p>One more property of the heap matters later. An UPDATE in PostgreSQL does not overwrite the row in place; it writes a new version of the row and marks the old one dead. Watch the ctid move:</p>
  <div class="fx" data-lang="sql">SELECT ctid, order_id, amount FROM orders WHERE order_id = 110;
UPDATE orders SET amount = 320 WHERE order_id = 110;
SELECT ctid, order_id, amount FROM orders WHERE order_id = 110;</div>
  <table class="tbl out"><caption>Before</caption><tr><th>ctid</th><th>order_id</th><th>amount</th></tr><tr><td>(0,10)</td><td>110</td><td>310.00</td></tr></table>
  <table class="tbl out"><caption>After the UPDATE</caption><tr><th>ctid</th><th>order_id</th><th>amount</th></tr><tr><td>(0,11)</td><td>110</td><td>320.00</td></tr></table>
  <p>Order 110 moved from slot (0,10) to (0,11): a new row version. The old version stays in the page until <strong>VACUUM</strong> (PostgreSQL's clean-up process) reclaims it. This is how PostgreSQL lets readers see the old version while a writer creates the new one; <a class="xref" data-note="sql_transactions">Transactions</a> explains it as MVCC. For performance it means: dead versions take space, and indexes must point at the right version (section 07).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>page</strong> (block) is the 8 KB unit PostgreSQL reads and writes. The <strong>heap</strong> is the table's main storage: pages of rows in no useful order. A <strong>ctid</strong> is a row version's physical address (page, slot). The basic cost of any query is the number of pages it touches.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not use ctid as an ID in your app. It changes on every UPDATE (we just saw it) and after VACUUM FULL. It is an internal address, shown here only to see where rows live.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: full scan cost.</b> We know Asha's rows are on 12 pages out of 9,345 and that the heap cannot tell us which 12. How does the database price "read everything", and can we predict that price before running the query?</div>

  <h2 id="so-scan"><span class="num">03</span>The Cost of a Full Scan</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Without any help, the only way to answer <code>customer_id = 1</code> is to read every page and test every row. How does the database put a number on that work, and does that number really grow with the table?</p>
  </div>
  <p>Before running a query, a part of the database called the <strong>planner</strong> (optimizer) estimates the cost of each possible way to run it and picks the cheapest. Costs are in arbitrary units where reading one page sequentially = 1. Three settings define the units:</p>
  <div class="fx" data-lang="sql">SELECT current_setting('seq_page_cost') AS seq_page_cost,
       current_setting('random_page_cost') AS random_page_cost,
       current_setting('cpu_tuple_cost') AS cpu_tuple_cost,
       current_setting('cpu_operator_cost') AS cpu_operator_cost;</div>
  <table class="tbl out"><caption>The planner's price list (defaults)</caption><tr><th>seq_page_cost</th><th>random_page_cost</th><th>cpu_tuple_cost</th><th>cpu_operator_cost</th></tr><tr><td>1</td><td>4</td><td>0.01</td><td>0.0025</td></tr></table>
  <p>A <strong>Seq Scan</strong> (sequential scan: read the heap from first page to last) with one filter costs</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><strong>cost = pages × seq_page_cost + rows × cpu_tuple_cost + rows × cpu_operator_cost</strong><br>pages = pages in the table; rows = rows in the table; cpu_tuple_cost = handling one row (0.01); cpu_operator_cost = evaluating one operator such as <code>=</code> (0.0025).</p>
  </div>
  <table class="tbl"><caption>Traced by hand</caption>
    <tr><th>Table</th><th>pages × 1</th><th>rows × 0.01</th><th>rows × 0.0025</th><th>total</th></tr>
    <tr><td>Biteful (10 orders)</td><td>1</td><td>0.1</td><td>0.025</td><td>1.125</td></tr>
    <tr><td>At scale (1,000,000)</td><td>9,345</td><td>10,000</td><td>2,500</td><td><strong>21,845</strong></td></tr>
  </table>
  <p>Now ask the planner with plain <code>EXPLAIN</code>, which only plans and does not run the query:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT * FROM orders WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Seq Scan on orders  (cost=0.00..1.12 rows=3 width=38)
  Filter: (customer_id = 1)</div>
  <div class="fx" data-lang="sql">EXPLAIN SELECT * FROM orders WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Seq Scan on orders  (cost=0.00..21845.00 rows=11 width=39)
  Filter: (customer_id = 1)</div>
  <p><code>cost=0.00..1.12</code> and <code>cost=0.00..21845.00</code>: exactly our hand numbers (1.125 is printed rounded). The first number is the cost before the first row can come out (0: a scan can emit a row immediately); the second is the cost to finish. Nothing in the formula depends on how many rows <em>match</em>. Asking for Asha (12 rows) or for everyone costs the same pages:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS) SELECT count(*) FROM orders WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Aggregate  (cost=21845.03..21845.04 rows=1 width=8) (actual time=59.353..59.355 rows=1 loops=1)
  Buffers: shared hit=2112 read=7233
  -&gt;  Seq Scan on orders  (cost=0.00..21845.00 rows=11 width=0) (actual time=0.128..59.335 rows=12 loops=1)
        Filter: (customer_id = 1)
        Rows Removed by Filter: 999988
        Buffers: shared hit=2112 read=7233
Planning:
  Buffers: shared hit=33
Planning Time: 0.164 ms
Execution Time: 59.407 ms</div>
  <p><code>Buffers: shared hit=… read=…</code> counts pages: <em>hit</em> = found in PostgreSQL's memory cache, <em>read</em> = fetched from the operating system / disk. Add them: 9,345, every page of the table, to count 12 rows. Double the table and both the cost and the time double. This straight line is the problem the rest of the note attacks.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Reading a whole book to find one word. The time depends on the number of pages in the book, not on how often the word appears.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>planner</strong> chooses a plan by estimated <strong>cost</strong>. A <strong>Seq Scan</strong> costs about <em>pages + 0.0125 × rows</em>: linear in table size, independent of how many rows match. <strong>Selectivity</strong> = matching rows / all rows (Asha: 12 / 1,000,000 = 0.0012%). A Seq Scan wastes effort when selectivity is tiny.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Cost units are not milliseconds. Compare costs of plans for the same query; never compare a cost with a time, or costs across different machines' settings.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the B-tree index.</b> A Seq Scan pays for 9,345 pages to find rows on 12. We need a structure that tells us <em>which</em> 12 pages to read, without reading the others.</div>

  <h2 id="so-btree"><span class="num">04</span>Index = Sorted Lookup: the B-tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The heap is in arrival order, so customer 1's rows could be anywhere. If we had a copy of the <code>customer_id</code> column kept <em>sorted</em>, each value with the address of its row, could we jump straight to Asha's addresses? How do we search it without reading all of it?</p>
  </div>
  <p>Play a game: a friend picks a number from 1 to 1,000; you may ask only "is it bigger than X?". Always ask about the middle and you need about 10 questions, not 1,000. Halving works only because the numbers are <em>in order</em>. An <strong>index</strong> is exactly that: a separate, sorted list of a column's values, each with the ctid of its row.</p>
  <h3>Built by hand on the 10 orders</h3>
  <p>Take Biteful's orders, keep only <code>(customer_id, ctid)</code>, and sort by customer_id. That sorted list <em>is</em> the index's content:</p>
  <div class="fx" data-lang="sql">SELECT customer_id AS key, ctid AS points_to, order_id
FROM orders ORDER BY customer_id, ctid;</div>
  <table class="tbl out"><caption>The index on customer_id, by hand: sorted keys with row addresses</caption><tr><th>key</th><th>points_to</th><th>order_id</th></tr><tr><td>1</td><td>(0,1)</td><td>101</td></tr><tr><td>1</td><td>(0,4)</td><td>104</td></tr><tr><td>1</td><td>(0,10)</td><td>110</td></tr><tr><td>2</td><td>(0,2)</td><td>102</td></tr><tr><td>2</td><td>(0,6)</td><td>106</td></tr><tr><td>3</td><td>(0,3)</td><td>103</td></tr><tr><td>3</td><td>(0,8)</td><td>108</td></tr><tr><td>4</td><td>(0,5)</td><td>105</td></tr><tr><td>5</td><td>(0,7)</td><td>107</td></tr><tr><td>6</td><td>(0,9)</td><td>109</td></tr></table>
  <p>Search for key 1 by halving: 10 entries, look at the middle (entry 5: key 2). 1 &lt; 2, so go left: entries 1–4. Middle (entry 2: key 1). Found; walk left and right while the key is 1: entries 1, 2, 3, pointing to (0,1), (0,4), (0,10). Three addresses, three orders: 101, 104, 110. Then fetch just those rows from the heap.</p>
  <h3>Too big for one list: the tree</h3>
  <p>A million sorted entries do not fit on one 8 KB page; they fill about 1,100 pages. Halving across 1,100 pages would still mean jumping around a lot. So the index adds <strong>guide pages</strong> on top: each guide entry says "keys from here on are in that page below". This is the <strong>B-tree</strong> (balanced tree):</p>
  <ul>
    <li><strong>Leaf pages</strong> (bottom): all keys in sorted order, each with ctids; each leaf links to the next one.</li>
    <li><strong>Internal pages</strong>: guide entries "from key k → child page p".</li>
    <li><strong>Root</strong>: one page at the top, where every search starts.</li>
  </ul>
  <p>Let us build the real one on the million orders and open it with <code>pageinspect</code>, an extension that shows raw index pages. (The helper <code>k()</code> turns a page item's raw bytes back into the integer key.)</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_customer_idx ON orders (customer_id);
SELECT pg_size_pretty(pg_relation_size('orders_customer_idx')) AS size,
       pg_relation_size('orders_customer_idx') / 8192 AS pages,
       root AS root_page, level AS root_level
FROM bt_metap('orders_customer_idx');</div>
  <table class="tbl out"><caption>Index metadata</caption><tr><th>size</th><th>pages</th><th>root_page</th><th>root_level</th></tr><tr><td>9088 kB</td><td>1136</td><td>290</td><td>2</td></tr></table>
  <p>The root is page 290 at level 2, so the tree has 3 levels: root (2), internal (1), leaves (0). Search for Asha, key 1, step by step.</p>
  <div class="fx" data-lang="sql">SELECT itemoffset AS entry, ctid AS child, k(data) AS keys_from
FROM bt_page_items('orders_customer_idx', 290);</div>
  <table class="tbl out"><caption>Step 1: the root page (290)</caption><tr><th>entry</th><th>child</th><th>keys_from</th></tr><tr><td>1</td><td>(3,0)</td><td>NULL</td></tr><tr><td>2</td><td>(289,1)</td><td>25091</td></tr><tr><td>3</td><td>(575,1)</td><td>50284</td></tr><tr><td>4</td><td>(860,1)</td><td>75467</td></tr></table>
  <p>Read the root as a signboard: entry 1 (no key = "minus infinity") covers keys below 25,091 → child page 3; entry 2 covers 25,091 to 50,283 → page 289; and so on. Key 1 is below 25,091: go to page 3.</p>
  <div class="fx" data-lang="sql">SELECT itemoffset AS entry, ctid AS child, k(data) AS keys_from
FROM bt_page_items('orders_customer_idx', 3) LIMIT 4;</div>
  <table class="tbl out"><caption>Step 2: internal page 3 (first entries)</caption><tr><th>entry</th><th>child</th><th>keys_from</th></tr><tr><td>1</td><td>(286,1)</td><td>25091</td></tr><tr><td>2</td><td>(1,0)</td><td>NULL</td></tr><tr><td>3</td><td>(2,1)</td><td>90</td></tr><tr><td>4</td><td>(4,1)</td><td>174</td></tr></table>
  <p>Entry 1 of a non-rightmost page is its <em>high key</em> (25,091: "everything on this page is below this"), not a pointer to follow. Entry 2 (minus infinity) covers keys below 90 → leaf page 1. Key 1 &lt; 90: go to page 1.</p>
  <div class="fx" data-lang="sql">SELECT itemoffset AS entry, k(data) AS key, tids AS row_addresses
FROM bt_page_items('orders_customer_idx', 1) LIMIT 3;</div>
  <table class="tbl out"><caption>Step 3: leaf page 1 (first entries)</caption><tr><th>entry</th><th>key</th><th>row_addresses</th></tr><tr><td>1</td><td>90</td><td>NULL</td></tr><tr><td>2</td><td>1</td><td>{"(11,48)","(742,77)","(1122,42)","(1214,2)","(1466,32)","(4124,20)","(5315,19)","(6113,18)","(7286,21)","(8370,104)","(8894,41)","(9277,43)"}</td></tr><tr><td>3</td><td>2</td><td>{"(2322,98)","(2479,65)","(3110,92)","(3970,65)","(5489,42)","(6304,49)","(6676,12)","(6835,54)","(7091,47)","(7471,1)","(8753,46)"}</td></tr></table>
  <p>Entry 2 is key 1 with a list of 12 row addresses. Compare with section 02's table: (11,48), (742,77), … (9277,43). The same 12 addresses. (PostgreSQL 13+ stores a repeated key once with a list of ctids, called <em>deduplication</em>, which is why the index is only 9 MB.) The search read 3 index pages; fetching the rows reads 12 heap pages: 15 pages instead of 9,345.</p>
  <figure class="viz"><svg viewBox="0 0 620 250" width="620">
    <defs><marker id="so-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g stroke="currentColor" fill="none" opacity=".45"><line x1="310" y1="38" x2="300" y2="70"/><line x1="310" y1="38" x2="440" y2="70"/><line x1="310" y1="38" x2="560" y2="70"/><line x1="140" y1="98" x2="200" y2="130"/><line x1="140" y1="98" x2="300" y2="130"/></g>
    <g stroke-width="2.5" class="sb" fill="none"><line x1="310" y1="38" x2="140" y2="70"/><line x1="140" y1="98" x2="70" y2="130"/></g>
    <rect x="220" y="10" width="180" height="28" rx="5" class="fb sb"/><text x="310" y="29" text-anchor="middle" font-size="11">root p290: −∞ | 25091 | 50284 | 75467</text>
    <rect x="60" y="70" width="160" height="28" rx="5" class="fb sb"/><text x="140" y="89" text-anchor="middle" font-size="11">p3: −∞ | 90 | 174 | …</text>
    <rect x="250" y="70" width="100" height="28" rx="5" class="fs"/><text x="300" y="89" text-anchor="middle" font-size="11">p289</text>
    <rect x="390" y="70" width="100" height="28" rx="5" class="fs"/><text x="440" y="89" text-anchor="middle" font-size="11">p575</text>
    <rect x="510" y="70" width="100" height="28" rx="5" class="fs"/><text x="560" y="89" text-anchor="middle" font-size="11">p860</text>
    <rect x="0" y="130" width="140" height="28" rx="5" class="ft st"/><text x="70" y="149" text-anchor="middle" font-size="11" font-weight="bold">leaf p1: keys 1‥89</text>
    <rect x="150" y="130" width="100" height="28" rx="5" class="fs"/><text x="200" y="149" text-anchor="middle" font-size="11">p2: 90‥173</text>
    <rect x="260" y="130" width="80" height="28" rx="5" class="fs"/><text x="300" y="149" text-anchor="middle" font-size="11">p4 …</text>
    <g stroke="currentColor" opacity=".6"><line x1="140" y1="144" x2="150" y2="144"/><line x1="250" y1="144" x2="260" y2="144"/></g>
    <line x1="70" y1="158" x2="70" y2="190" stroke="currentColor" marker-end="url(#so-ar)"/>
    <text x="78" y="180" font-size="11" class="tb">key 1 → 12 ctids</text>
    <rect x="0" y="192" width="420" height="30" rx="5" class="fg sg"/><text x="210" y="212" text-anchor="middle" font-size="11">heap pages 11, 742, 1122, 1214, 1466, 4124, 5315, 6113, 7286, 8370, 8894, 9277</text>
    <text x="360" y="150" font-size="11" class="tm">leaves sorted and linked ⇄</text>
    <text x="360" y="166" font-size="11" class="tm">→ ranges and ORDER BY walk right</text>
    <text x="0" y="244" font-size="11" class="tm">3 index pages + 12 heap pages = 15 page reads (Seq Scan: 9,345)</text>
  </svg><figcaption>The real search for customer_id = 1: one page per level (thick path), then one heap page per matching row.</figcaption></figure>
  <p><strong>Why only 3 levels for a million rows?</strong> Each internal page holds a few hundred guide entries (page 3 has 285). Root with 4 children × ~285 × ~90 keys per leaf ≈ 100,000 distinct keys, which is all our customer ids. Each extra level multiplies reach by ~300, so a billion rows still need only 4–5 levels. Programmers write this slow growth as <strong>O(log n)</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A dictionary: guide words at the top of each page ("mango – market") let you skip whole pages; the thumb tabs (A, B, C…) skip whole sections. Root = thumb tabs, internal = guide words, leaf = the word list itself.</p>
  </div>
  <div class="cards">
    <div><b>O(log n) lookup</b><p>Hundreds of keys per page → 3–4 levels.</p></div>
    <div><b>Balanced</b><p>Every leaf is at the same depth, so no search is unlucky.</p></div>
    <div><b>Linked leaves</b><p><code>BETWEEN</code>, <code>ORDER BY</code>, <code>LIKE 'abc%'</code> find the start once, then walk right.</p></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>index</strong> is a separate structure holding a column's values in sorted order with the ctid of each row. A <strong>B-tree</strong> (PostgreSQL's default, <code>CREATE INDEX … ON t (col)</code>) is a balanced tree of pages: root → internal → leaf; a lookup reads one page per level, then the matching heap pages. Every PRIMARY KEY and UNIQUE constraint creates one automatically; a FOREIGN KEY does <em>not</em> (that is why <code>orders.customer_id</code> had none).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>An index helps only when it skips most pages. If the matches are spread over most pages anyway (e.g. 93% of orders are "delivered"), index + heap jumping costs more than one Seq Scan, and the planner correctly ignores the index (section 09).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: EXPLAIN ANALYZE.</b> We built the index and traced the search by hand. But we never saw the database <em>choose</em> it for Asha's query, or measured the gain. We need to read the plan it actually ran.</div>

  <h2 id="so-explain"><span class="num">05</span>EXPLAIN and EXPLAIN ANALYZE, Line by Line</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An index you created is useless if the planner doesn't use it. How do we see the route the database chose, what each step did, and how much it read?</p>
  </div>
  <p><code>EXPLAIN</code> shows the chosen plan with estimates. <code>EXPLAIN ANALYZE</code> also <em>runs</em> the query and adds real times and row counts; <code>BUFFERS</code> adds pages touched. Asha's screen, now that the index exists:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Sort  (cost=47.71..47.73 rows=11 width=18) (actual time=0.129..0.130 rows=12 loops=1)
  Sort Key: ordered_at DESC
  Sort Method: quicksort  Memory: 25kB
  Buffers: shared hit=10 read=8
  -&gt;  Bitmap Heap Scan on orders  (cost=4.51..47.52 rows=11 width=18) (actual time=0.039..0.104 rows=12 loops=1)
        Recheck Cond: (customer_id = 1)
        Heap Blocks: exact=12
        Buffers: shared hit=7 read=8
        -&gt;  Bitmap Index Scan on orders_customer_idx  (cost=0.00..4.51 rows=11 width=0) (actual time=0.014..0.015 rows=12 loops=1)
              Index Cond: (customer_id = 1)
              Buffers: shared hit=3
Planning:
  Buffers: shared hit=68
Planning Time: 0.237 ms
Execution Time: 0.162 ms</div>
  <p>A plan is a tree of steps (<strong>nodes</strong>). Each node gets rows from the nodes indented under it (marked <code>-&gt;</code>) and passes rows up. So read it <strong>inside-out</strong>: the most indented node runs first.</p>
  <table class="tbl"><caption>The plan above, read from the innermost line outwards</caption>
    <tr><th>Line</th><th>Meaning in plain words</th></tr>
    <tr><td><code>Bitmap Index Scan on orders_customer_idx</code>, <code>Index Cond: (customer_id = 1)</code></td><td>Walk the B-tree for key 1 (our 3-page search) and collect the 12 ctids into a bitmap: a checklist of heap pages to visit</td></tr>
    <tr><td><code>cost=0.00..4.51 rows=11</code></td><td>Planner's guess before running: tiny cost, about 11 rows (the real answer is 12; close is good)</td></tr>
    <tr><td><code>actual time=…..… rows=12 loops=1</code></td><td>What really happened: ms to first row .. last row, real rows, how many times the node ran</td></tr>
    <tr><td><code>Bitmap Heap Scan on orders</code>, <code>Heap Blocks: exact=12</code></td><td>Visit the 12 heap pages in physical order (each once) and fetch the rows</td></tr>
    <tr><td><code>Recheck Cond</code></td><td>Re-test the condition on fetched rows (needed if the bitmap gets "lossy" under memory pressure; here it is exact)</td></tr>
    <tr><td><code>Sort … Sort Key: ordered_at DESC</code>, <code>quicksort Memory: 25kB</code></td><td>Sort the 12 rows newest first, in memory</td></tr>
    <tr><td><code>Buffers: shared hit=… read=…</code></td><td>Pages touched by this node and its children: about 15 instead of 9,345</td></tr>
    <tr><td><code>Planning Time</code> / <code>Execution Time</code></td><td>Time to choose the plan / time to run it</td></tr>
  </table>
  <table class="tbl"><caption>Asha's screen, before and after the index (numbers from the two real plans above)</caption>
    <tr><th></th><th>No index (section 01)</th><th>B-tree on customer_id</th></tr>
    <tr><td>Scan</td><td>Seq Scan, 999,988 rows removed</td><td>Bitmap Index Scan + Bitmap Heap Scan</td></tr>
    <tr><td>Pages</td><td>9,345</td><td>~15 (3 index + 12 heap)</td></tr>
    <tr><td>Time</td><td>tens of ms</td><td>a fraction of a ms</td></tr>
  </table>
  <p>Why "Bitmap" and not a plain Index Scan? For a handful of rows on scattered pages, PostgreSQL often collects all ctids first, sorts them by page, and reads each page once. A plain <strong>Index Scan</strong> fetches rows in index order, one by one; the planner uses it for very few rows or when the index order itself is useful (section 06). The common scan nodes:</p>
  <table class="tbl">
    <tr><th>Node</th><th>What it does</th><th>When chosen</th></tr>
    <tr><td><strong>Seq Scan</strong></td><td>Reads every page</td><td>No usable index, tiny table, or most rows needed</td></tr>
    <tr><td><strong>Index Scan</strong></td><td>Walks the index, fetches each row from the heap</td><td>Few rows, or rows needed in index order</td></tr>
    <tr><td><strong>Index Only Scan</strong></td><td>Answers from the index alone</td><td>Covering index on a vacuumed table (section 07)</td></tr>
    <tr><td><strong>Bitmap Index + Heap Scan</strong></td><td>Collects ctids, then reads pages in physical order</td><td>Medium row counts; combining two indexes (BitmapAnd/BitmapOr)</td></tr>
  </table>
  <h3>A bigger plan: a join with an aggregate</h3>
  <p>"Orders per city on Valentine's Day" joins orders to customers and groups (<a class="xref" data-note="sql_joins">JOINs</a> section 10 introduced the join algorithms):</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE
SELECT c.city, count(*) FROM orders o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.ordered_at &gt;= '2026-02-14' AND o.ordered_at &lt; '2026-02-15'
GROUP BY c.city;</div>
  <div class="fx" data-lang="text">GroupAggregate  (cost=27491.16..27513.37 rows=4 width=15) (actual time=89.981..90.226 rows=4 loops=1)
  Group Key: c.city
  -&gt;  Sort  (cost=27491.16..27498.55 rows=2956 width=7) (actual time=89.884..90.015 rows=2880 loops=1)
        Sort Key: c.city
        Sort Method: quicksort  Memory: 147kB
        -&gt;  Hash Join  (cost=2968.00..27320.76 rows=2956 width=7) (actual time=87.216..89.446 rows=2880 loops=1)
              Hash Cond: (o.customer_id = c.customer_id)
              -&gt;  Seq Scan on orders o  (cost=0.00..24345.00 rows=2956 width=4) (actual time=61.557..62.790 rows=2880 loops=1)
                    Filter: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
                    Rows Removed by Filter: 997120
              -&gt;  Hash  (cost=1718.00..1718.00 rows=100000 width=11) (actual time=25.054..25.055 rows=100000 loops=1)
                    Buckets: 131072  Batches: 1  Memory Usage: 5420kB
                    -&gt;  Seq Scan on customers c  (cost=0.00..1718.00 rows=100000 width=11) (actual time=0.015..8.992 rows=100000 loops=1)
Planning Time: 0.496 ms
Execution Time: 91.307 ms</div>
  <p>Inside-out: the Seq Scan on orders reads all pages and keeps one day's ~2,880 orders (there is no index on <code>ordered_at</code> yet); meanwhile the Seq Scan on customers feeds a <strong>Hash</strong> node that builds an in-memory lookup of all 100,000 customers (5 MB); the <strong>Hash Join</strong> probes that lookup once per order; <strong>Sort</strong> orders the 2,880 joined rows by city and <strong>GroupAggregate</strong> counts each run of equal cities. Almost all of the time is the Seq Scan on orders (look at its actual time): an index on <code>ordered_at</code> would fix it, and section 08 adds one. The habit to build: for every node compare <strong>estimated rows</strong> (<code>rows=</code> in the cost bracket) with <strong>actual rows</strong>. When they are close, the planner understood the data. When they differ by 10× or more, the plan was chosen for the wrong data (section 09).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A maps app picks a route before you drive (EXPLAIN), based on its traffic estimates. EXPLAIN ANALYZE is driving the route with a stopwatch and a counter at every junction, then comparing "expected cars" with "actual cars".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>EXPLAIN</strong> prints the planner's chosen plan and estimates without running it. <strong>EXPLAIN ANALYZE</strong> runs the query and adds actual time, rows and loops per node. <strong>BUFFERS</strong> adds pages hit (cache) and read (disk). Read plans inside-out; the expensive node is where time or buffers jump.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: EXPLAIN ANALYZE really executes</span>
    <p>On an UPDATE or DELETE it changes data. Wrap it:</p>
  </div>
  <div class="fx" data-lang="sql">BEGIN;
EXPLAIN ANALYZE DELETE FROM order_items WHERE order_id = 101;
ROLLBACK;</div>
  <div class="fx" data-lang="text">Delete on order_items  (cost=4.19..12.66 rows=0 width=0) (actual time=0.030..0.030 rows=0 loops=1)
  -&gt;  Bitmap Heap Scan on order_items  (cost=4.19..12.66 rows=5 width=6) (actual time=0.014..0.015 rows=1 loops=1)
        Recheck Cond: (order_id = 101)
        Heap Blocks: exact=1
        -&gt;  Bitmap Index Scan on order_items_pkey  (cost=0.00..4.19 rows=5 width=0) (actual time=0.003..0.004 rows=1 loops=1)
              Index Cond: (order_id = 101)
Planning Time: 0.185 ms
Execution Time: 0.105 ms</div>
  <div class="fx" data-lang="sql">SELECT count(*) FROM order_items WHERE order_id = 101;</div>
  <table class="tbl out"><caption>Still there after the ROLLBACK</caption><tr><th>count</th></tr><tr><td>1</td></tr></table>
  <div class="bridge"><b>What this still can't tell us → next: composite indexes.</b> Asha's screen sorts by date, and the "since January" filter adds a second column. The index on customer_id alone finds the rows but leaves the sort, and the date filter, to be done row by row. Can one index hold both columns?</div>

  <h2 id="so-composite"><span class="num">06</span>Composite Indexes and Column Order</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The customer_id index finds Asha's 12 rows, but then the database must still sort them by date, and a filter like "since 1 January" is tested row by row after fetching. The screen really asks two things at once: <em>this customer</em> and <em>in date order</em>. Can one index answer both?</p>
  </div>
  <p>A <strong>composite index</strong> is an index on two or more columns. It sorts by the first column, and only <em>within ties</em> of the first column by the second. Build it by hand on the 10 orders:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at, ctid, order_id
FROM orders ORDER BY customer_id, ordered_at;</div>
  <table class="tbl out"><caption>Index (customer_id, ordered_at), by hand: the order its leaf entries are in</caption><tr><th>customer_id</th><th>ordered_at</th><th>ctid</th><th>order_id</th></tr><tr><td>1</td><td>Mar 02 12:10</td><td>(0,1)</td><td>101</td></tr><tr><td>1</td><td>Mar 03 13:15</td><td>(0,4)</td><td>104</td></tr><tr><td>1</td><td>Mar 08 20:50</td><td>(0,10)</td><td>110</td></tr><tr><td>2</td><td>Mar 02 13:05</td><td>(0,2)</td><td>102</td></tr><tr><td>2</td><td>Mar 04 12:40</td><td>(0,6)</td><td>106</td></tr><tr><td>3</td><td>Mar 02 20:30</td><td>(0,3)</td><td>103</td></tr><tr><td>3</td><td>Mar 05 18:20</td><td>(0,8)</td><td>108</td></tr><tr><td>4</td><td>Mar 03 19:45</td><td>(0,5)</td><td>105</td></tr><tr><td>5</td><td>Mar 04 21:10</td><td>(0,7)</td><td>107</td></tr><tr><td>6</td><td>Mar 05 20:05</td><td>(0,9)</td><td>109</td></tr></table>
  <p>Trace three questions against this sorted list:</p>
  <table class="tbl"><caption>The leftmost-prefix rule, traced on the list above</caption>
    <tr><th>Question</th><th>What the sorted list lets us do</th><th>Usable?</th></tr>
    <tr><td><code>customer_id = 1</code></td><td>Jump to the first 1, read the three 1-rows (101, 104, 110), stop at the first 2</td><td>Yes: one contiguous slice</td></tr>
    <tr><td><code>customer_id = 1 AND ordered_at &gt;= 'Mar 03'</code></td><td>Jump to (1, Mar 03), read 104 and 110, stop at the first 2. Already in date order, so no sort; read it backwards for DESC</td><td>Yes: an even smaller slice</td></tr>
    <tr><td><code>ordered_at &gt;= 'Mar 05'</code> alone</td><td>Matches are 108 (row 7 of the list) and 109, 110 (rows 10 and 3): scattered, because dates are only sorted inside each customer</td><td>No: no place to jump to</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="0" y="14" font-size="11" class="tm">index (customer_id, ordered_at) at scale, in its sorted order:</text>
    <g font-size="11" text-anchor="middle">
      <rect x="0" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="32" y="36">1</text><text x="32" y="50" class="tm">2025-03</text>
      <rect x="66" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="98" y="36">1</text><text x="98" y="50" class="tm">2025-12</text>
      <rect x="132" y="22" width="64" height="34" class="fb sb"/><text x="164" y="36">1</text><text x="164" y="50" class="tm">2026-01</text>
      <rect x="198" y="22" width="64" height="34" class="fb sb"/><text x="230" y="36">1</text><text x="230" y="50" class="tm">2026-02-03</text>
      <rect x="264" y="22" width="64" height="34" class="fb sb"/><text x="296" y="36">1</text><text x="296" y="50" class="tm">2026-02-17</text>
      <rect x="330" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="362" y="36">2</text><text x="362" y="50" class="tm">2025-04</text>
      <rect x="396" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="428" y="36">2</text><text x="428" y="50" class="tm">2026-01</text>
      <rect x="462" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="494" y="36">3</text><text x="494" y="50" class="tm">2025-03</text>
      <rect x="528" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="560" y="36">3</text><text x="560" y="50" class="tm">2026-02</text>
    </g>
    <text x="230" y="74" text-anchor="middle" font-size="11" class="tb">customer 1 since 2026-01-01 → one contiguous slice, already in date order ✓</text>
    <g font-size="11" text-anchor="middle">
      <rect x="0" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="32" y="100">1</text><text x="32" y="114" class="tm">2025-03</text>
      <rect x="66" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="98" y="100">1</text><text x="98" y="114" class="tm">2025-12</text>
      <rect x="132" y="86" width="64" height="34" class="fr sr"/><text x="164" y="100">1</text><text x="164" y="114">2026-01</text>
      <rect x="198" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="230" y="100">1</text><text x="230" y="114" class="tm">2026-02-03</text>
      <rect x="264" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="296" y="100">1</text><text x="296" y="114" class="tm">2026-02-17</text>
      <rect x="330" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="362" y="100">2</text><text x="362" y="114" class="tm">2025-04</text>
      <rect x="396" y="86" width="64" height="34" class="fr sr"/><text x="428" y="100">2</text><text x="428" y="114">2026-01</text>
      <rect x="462" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="494" y="100">3</text><text x="494" y="114" class="tm">2025-03</text>
      <rect x="528" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="560" y="100">3</text><text x="560" y="114" class="tm">2026-02</text>
    </g>
    <text x="300" y="140" text-anchor="middle" font-size="11" class="tr">"January 2026" for everyone → matches scattered across all 100,000 customers → can't seek ✗</text>
  </svg><figcaption>The second column is sorted only within each value of the first. That is the leftmost-prefix rule.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A phone book sorted by (surname, first name). "Sharma, Asha" is instant; "all Sharmas" is instant; "everyone named Asha" means reading the whole book, because first names are only sorted within each surname.</p>
  </div>
  <p>Now at scale. Create the composite index, and drop the single-column one: (customer_id, ordered_at) can answer everything (customer_id) answered, because customer_id is its leftmost column.</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_cust_time_idx ON orders (customer_id, ordered_at);
DROP INDEX orders_customer_idx;
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 AND ordered_at &gt;= '2026-01-01'
ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Index Scan Backward using orders_cust_time_idx on orders  (cost=0.42..12.46 rows=2 width=18) (actual time=0.022..0.026 rows=3 loops=1)
  Index Cond: ((customer_id = 1) AND (ordered_at &gt;= '2026-01-01 00:00:00+05:30'::timestamp with time zone))
  Buffers: shared hit=4 read=3
Planning:
  Buffers: shared hit=74 read=1
Planning Time: 0.257 ms
Execution Time: 0.048 ms</div>
  <p><code>Index Scan Backward</code>: the planner jumped to the end of Asha's 2026 slice and walked the leaves backwards, so rows come out newest first with <strong>no Sort node</strong>. Both columns appear in <code>Index Cond</code>, meaning both narrowed the search inside the index. The leading column alone still works:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Bitmap Heap Scan on orders  (cost=4.51..47.52 rows=11 width=18) (actual time=0.027..0.059 rows=12 loops=1)
  Recheck Cond: (customer_id = 1)
  Heap Blocks: exact=12
  Buffers: shared hit=15
  -&gt;  Bitmap Index Scan on orders_cust_time_idx  (cost=0.00..4.51 rows=11 width=0) (actual time=0.015..0.015 rows=12 loops=1)
        Index Cond: (customer_id = 1)
        Buffers: shared hit=3
Planning:
  Buffers: shared hit=62
Planning Time: 0.216 ms
Execution Time: 0.175 ms</div>
  <p>The second column alone does not:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, customer_id FROM orders
WHERE ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15';</div>
  <div class="fx" data-lang="text">Seq Scan on orders  (cost=0.00..24345.00 rows=2956 width=8) (actual time=59.050..60.212 rows=2880 loops=1)
  Filter: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
  Rows Removed by Filter: 997120
  Buffers: shared hit=2312 read=7033
Planning:
  Buffers: shared hit=62
Planning Time: 0.227 ms
Execution Time: 60.355 ms</div>
  <p>Seq Scan over every page, exactly as the trace predicted: one day's orders are spread across all 100,000 customer slices of the index.</p>
  <h3>Does column order matter? Reverse it and measure</h3>
  <p>An index on <code>(ordered_at, customer_id)</code> contains the same two columns. For "customer 1 since 1 January", it sorts by time first, so all orders since 1 January (every customer) form one slice, and customer 1's rows are sprinkled through it. We build it and, inside a transaction, hide the good index to force the comparison (DDL in PostgreSQL is transactional, so the ROLLBACK brings it back):</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_time_cust_idx ON orders (ordered_at, customer_id);
BEGIN;
DROP INDEX orders_cust_time_idx;
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 AND ordered_at &gt;= '2026-01-01'
ORDER BY ordered_at DESC;
ROLLBACK;
DROP INDEX orders_time_cust_idx;</div>
  <div class="fx" data-lang="text">Index Scan Backward using orders_time_cust_idx on orders  (cost=0.42..3680.91 rows=2 width=18) (actual time=0.286..6.418 rows=3 loops=1)
  Index Cond: ((ordered_at &gt;= '2026-01-01 00:00:00+05:30'::timestamp with time zone) AND (customer_id = 1))
  Buffers: shared hit=6 read=557
Planning:
  Buffers: shared hit=70 read=1
Planning Time: 0.231 ms
Execution Time: 6.443 ms</div>
  <p>Same columns, same answer, but the Index Cond can only <em>seek</em> on <code>ordered_at</code>; <code>customer_id = 1</code> is checked on every index entry since 1 January (about 140,000 of them), so Buffers jump from a handful to hundreds. Hence the rule:</p>
  <div class="callout intu"><span class="label">Column order rule</span>
    <p><strong>Equality columns first, then the range or sort column.</strong> With (customer_id, ordered_at), the equality picks one customer's slice and the range cuts it. Reversed, the range picks a huge slice and the equality filters inside it.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>composite</strong> (multi-column) index on (a, b) is sorted by a, then by b within equal a. <strong>Leftmost-prefix rule</strong>: it can seek on a, on a + b, and on a + a range of b; not on b alone. An index on (a, b) makes a separate index on (a) redundant; it does not replace an index on (b).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Creating one single-column index per column and hoping the database combines them. PostgreSQL can AND two bitmaps, but that is slower than one composite index that matches the query, and it never gives you pre-sorted output for ORDER BY … LIMIT.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: covering indexes.</b> The composite index finds and orders Asha's rows inside the index, but <code>amount</code> is not in it, so every match still costs a visit to a heap page. Could the index alone answer the screen?</div>

  <h2 id="so-cover"><span class="num">07</span>Covering Indexes and Index-Only Scans</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An index lookup is two trips: the index gives a ctid, then the heap page gives the other columns. For Asha's 12 orders on 12 different pages, the second trip is most of the work. If everything the query needs were already in the index, could we skip the heap altogether?</p>
  </div>
  <p>Asha's screen needs <code>order_id</code>, <code>ordered_at</code>, <code>amount</code>, filtered by <code>customer_id</code>. A <strong>covering index</strong> holds all of them. Extra columns that are only <em>returned</em>, not searched, go in <code>INCLUDE</code>: they ride along in the leaf entries without being part of the sort order.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library catalogue card that also prints each book's price and year. If price and year are all you wanted, you never walk to the shelf.</p>
  </div>
  <p>Traced on the 10 orders: the leaf entries for customer 1 would be <code>(1, Mar 02 12:10 | 101, 240)</code>, <code>(1, Mar 03 13:15 | 104, 380)</code>, <code>(1, Mar 08 20:50 | 110, 310)</code>. Every column the screen shows is right there; the heap rows (0,1), (0,4), (0,10) are never needed. At scale:</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_cust_time_cov ON orders (customer_id, ordered_at) INCLUDE (order_id, amount);
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Index Only Scan Backward using orders_cust_time_cov on orders  (cost=0.42..4.62 rows=11 width=18) (actual time=0.030..0.032 rows=12 loops=1)
  Index Cond: (customer_id = 1)
  Heap Fetches: 0
  Buffers: shared hit=1 read=3
Planning:
  Buffers: shared hit=88 read=1
Planning Time: 0.260 ms
Execution Time: 0.059 ms</div>
  <p><code>Index Only Scan</code> with <code>Heap Fetches: 0</code>: the table was never read, and the buffers are just the 3 or so index pages. But there is a catch, hidden in the word "visible".</p>
  <h3>Why "index only" sometimes still reads the heap</h3>
  <p>Section 02 showed that an UPDATE leaves an old row version behind. An index entry does not know whether its row version is visible to the current transaction; only the heap row does. PostgreSQL keeps a tiny <strong>visibility map</strong>: one bit per heap page meaning "every row on this page is visible to everyone". If the bit is set, the index-only scan trusts the index; if not, it must visit the heap page to check. VACUUM sets the bits. Watch: touch Asha's 12 rows with a no-op UPDATE, then run the same query.</p>
  <div class="fx" data-lang="sql">UPDATE orders SET amount = amount WHERE customer_id = 1;
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Index Only Scan Backward using orders_cust_time_cov on orders  (cost=0.42..4.62 rows=11 width=18) (actual time=0.009..0.065 rows=12 loops=1)
  Index Cond: (customer_id = 1)
  Heap Fetches: 24
  Buffers: shared hit=28
Planning:
  Buffers: shared hit=20
Planning Time: 0.086 ms
Execution Time: 0.080 ms</div>
  <p>Heap Fetches jumped from 0 to 24. The 12 updated heap pages lost their "all visible" bit, and because <code>amount</code> is in the index, each UPDATE also added a new index entry: the index now holds 24 entries for Asha (12 dead old versions + 12 new ones), and each one must be checked against its heap page. After VACUUM removes the dead versions and sets the bits again:</p>
  <div class="fx" data-lang="sql">VACUUM orders;
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Index Only Scan Backward using orders_cust_time_cov on orders  (cost=0.42..8.62 rows=11 width=18) (actual time=0.015..0.028 rows=12 loops=1)
  Index Cond: (customer_id = 1)
  Heap Fetches: 0
  Buffers: shared hit=4
Planning:
  Buffers: shared hit=42
Planning Time: 0.137 ms
Execution Time: 0.073 ms</div>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <defs><marker id="so-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="0" y="22" font-weight="bold">Index Scan</text>
    <rect x="110" y="2" width="130" height="40" rx="6" class="fb sb"/><text x="175" y="20" text-anchor="middle">index leaf</text><text x="175" y="35" text-anchor="middle" font-size="10" class="tm">(1, time) → ctid</text>
    <line x1="240" y1="22" x2="318" y2="22" stroke="currentColor" marker-end="url(#so-ar2)"/><text x="279" y="16" text-anchor="middle" font-size="10" class="tm">heap fetch ×12</text>
    <rect x="320" y="2" width="130" height="40" rx="6" class="fg sg"/><text x="385" y="20" text-anchor="middle">heap</text><text x="385" y="35" text-anchor="middle" font-size="10" class="tm">order_id, amount</text>
    <text x="0" y="92" font-weight="bold">Index Only</text>
    <rect x="110" y="72" width="230" height="40" rx="6" class="fb sb"/><text x="225" y="90" text-anchor="middle">index leaf + INCLUDE</text><text x="225" y="105" text-anchor="middle" font-size="10" class="tm">(1, time | order_id, amount)</text>
    <line x1="340" y1="92" x2="470" y2="92" stroke="currentColor" marker-end="url(#so-ar2)"/><text x="478" y="96" class="tg">done</text>
    <text x="110" y="132" font-size="10" class="tm">heap skipped only for pages whose visibility-map bit says "all visible" (set by VACUUM)</text>
  </svg><figcaption>Covering index: every needed column is in the leaf, so the heap is skipped (Heap Fetches: 0 on a vacuumed table).</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>covering index</strong> contains every column a query reads (key columns + <code>INCLUDE</code> columns). The plan node is <strong>Index Only Scan</strong>; its <code>Heap Fetches</code> counts rows that still needed a heap visit because their page was not marked all-visible in the <strong>visibility map</strong>. Autovacuum normally keeps the map current.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>SELECT *</code> can never be covered (it would need every column in the index). Name the columns the screen needs; it is the difference between "index only" and "index + heap". And a table with heavy updates and lagging autovacuum shows high Heap Fetches: the covering index quietly stops helping.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sargability.</b> We now have an index that answers the screen alone. But the same index is useless if the query wraps the column in a function, like <code>date(ordered_at)</code> or <code>lower(name)</code>. Why, and how do we write queries the index can serve?</div>

  <h2 id="so-sarg"><span class="num">08</span>Sargability: Functions on Columns Kill Indexes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A report asks "all orders placed on 14 February 2026". There is a perfect B-tree on <code>ordered_at</code>. The natural way to write it, <code>ordered_at::date = '2026-02-14'</code>, still reads every page. Why does a small change in how we <em>write</em> the condition switch the index off?</p>
  </div>
  <p>The index on <code>ordered_at</code> is sorted by the stored timestamps: 2026-02-13 23:59:30, 2026-02-14 00:00:00, 2026-02-14 00:00:30… Ask "is <code>ordered_at::date</code> equal to 14 Feb?" and the database must compute the date of every row before it can compare; the sorted order of the raw timestamps doesn't tell it where the results of that computation are. Ask instead "is <code>ordered_at</code> between 14 Feb 00:00 and 15 Feb 00:00?" and it can jump to the first entry and walk until the end. Same rows, different shape.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A dictionary is sorted by the word. "Words starting with <em>ma</em>" is quick. "Words whose <em>last</em> letter is <em>a</em>" means reading the whole book, even though it is the same dictionary. A function on the column turns the first kind of question into the second.</p>
  </div>
  <p>Trace on the 10 orders: the stored times of orders 103 (Mar 02 20:30) and 104 (Mar 03 13:15) are neighbours in an index on <code>ordered_at</code>. "<code>ordered_at &gt;= 'Mar 03' AND ordered_at &lt; 'Mar 04'</code>" is a slice starting at 104 and ending before 106 (Mar 04 12:40): 104, 105. "<code>ordered_at::date = 'Mar 03'</code>" gives the same two orders, but only after converting all 10 timestamps. At scale:</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_time_idx ON orders (ordered_at);
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM orders WHERE ordered_at::date = '2026-02-14';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=24357.50..24357.51 rows=1 width=8) (actual time=103.429..103.431 rows=1 loops=1)
  Buffers: shared hit=2547 read=6798
  -&gt;  Seq Scan on orders  (cost=0.00..24345.00 rows=5000 width=0) (actual time=101.302..103.267 rows=2880 loops=1)
        Filter: ((ordered_at)::date = '2026-02-14'::date)
        Rows Removed by Filter: 997120
        Buffers: shared hit=2547 read=6798
Planning:
  Buffers: shared hit=86 read=1
Planning Time: 0.297 ms
Execution Time: 103.464 ms</div>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM orders
WHERE ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=106.94..106.95 rows=1 width=8) (actual time=0.499..0.500 rows=1 loops=1)
  Buffers: shared hit=3 read=9
  -&gt;  Index Only Scan using orders_time_idx on orders  (cost=0.42..99.55 rows=2956 width=0) (actual time=0.030..0.335 rows=2880 loops=1)
        Index Cond: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
        Heap Fetches: 0
        Buffers: shared hit=3 read=9
Planning:
  Buffers: shared hit=104 read=3
Planning Time: 0.331 ms
Execution Time: 0.527 ms</div>
  <p>Same count (2,880), Seq Scan of every page vs an index range read of a few dozen pages. The half-open range <code>&gt;= day AND &lt; next day</code> also avoids the BETWEEN trap from <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a> (BETWEEN includes the midnight that starts the next day).</p>
  <p>Text has the same problem. People type "asha", "Asha" or "ASHA", so the login query lowercases the column:</p>
  <div class="fx" data-lang="sql">CREATE INDEX customers_name_idx ON customers (name);
EXPLAIN ANALYZE SELECT customer_id FROM customers WHERE lower(name) = 'asha';</div>
  <div class="fx" data-lang="text">Seq Scan on customers  (cost=0.00..2218.00 rows=500 width=4) (actual time=0.035..23.876 rows=1 loops=1)
  Filter: (lower(name) = 'asha'::text)
  Rows Removed by Filter: 99999
Planning Time: 0.203 ms
Execution Time: 23.899 ms</div>
  <p>A plain index on <code>name</code> stores "Asha", not "asha", so it cannot answer a question about <code>lower(name)</code>. Here we cannot move the function to the constant side (the stored values have mixed case), so we index the expression itself. The query must use exactly the same expression:</p>
  <div class="fx" data-lang="sql">CREATE INDEX customers_lower_name_idx ON customers (lower(name));
EXPLAIN ANALYZE SELECT customer_id FROM customers WHERE lower(name) = 'asha';</div>
  <div class="fx" data-lang="text">Bitmap Heap Scan on customers  (cost=8.17..699.61 rows=500 width=4) (actual time=0.024..0.024 rows=1 loops=1)
  Recheck Cond: (lower(name) = 'asha'::text)
  Heap Blocks: exact=1
  -&gt;  Bitmap Index Scan on customers_lower_name_idx  (cost=0.00..8.04 rows=500 width=0) (actual time=0.015..0.015 rows=1 loops=1)
        Index Cond: (lower(name) = 'asha'::text)
Planning Time: 0.218 ms
Execution Time: 0.048 ms</div>
  <p>Two more ways to hide the column, both checked here:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT order_id FROM orders WHERE customer_id + 0 = 1;</div>
  <div class="fx" data-lang="text">Seq Scan on orders  (cost=0.00..24345.00 rows=5000 width=4)
  Filter: ((customer_id + 0) = 1)</div>
  <div class="fx" data-lang="sql">EXPLAIN SELECT customer_id FROM customers WHERE name LIKE '%Kapoor';</div>
  <div class="fx" data-lang="text">Seq Scan on customers  (cost=0.00..1968.00 rows=13060 width=4)
  Filter: (name ~~ '%Kapoor'::text)</div>
  <p>Arithmetic on the column (<code>customer_id + 0</code>) is a function too: Seq Scan. A pattern that <em>starts</em> with <code>%</code> has no fixed beginning to jump to, like the "last letter" dictionary question: Seq Scan. (Section 10 fixes "contains" searches with a different index type.)</p>
  <table class="tbl"><caption>Non-sargable → sargable rewrites (all measured above)</caption>
    <tr><th>Problem</th><th>Non-sargable</th><th>Rewrite</th></tr>
    <tr><td>Function on a timestamp</td><td><code>ordered_at::date = '2026-02-14'</code></td><td><code>ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15'</code></td></tr>
    <tr><td>Function on text</td><td><code>lower(name) = 'asha'</code> with an index on name</td><td>Expression index <code>ON (lower(name))</code></td></tr>
    <tr><td>Arithmetic</td><td><code>customer_id + 0 = 1</code></td><td><code>customer_id = 1</code>: move the math to the constant side</td></tr>
    <tr><td>Leading wildcard</td><td><code>name LIKE '%Kapoor'</code></td><td>Anchor the start if you can; otherwise a trigram GIN index (section 10)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A condition is <strong>sargable</strong> (Search-ARGument-able) if an index can be used to find the matching rows: the indexed column (or indexed expression) appears <em>bare</em> on one side of a comparison the index understands (<code>=</code>, <code>&lt;</code>, <code>&gt;</code>, BETWEEN, prefix LIKE). Rule: leave the column alone; do the work on the constant.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: implicit casts and collation</span>
    <p>Comparing a column with a value of another type can make the database cast the <em>column</em> (e.g. a text column compared with a number in MySQL, or an int column with a numeric parameter from some drivers); the plan then shows the cast in a <code>Filter</code> on the column. Check the types your driver sends. And prefix <code>LIKE 'Asha%'</code> can use a plain B-tree only under the "C" collation or with a <code>text_pattern_ops</code> index; on other collations PostgreSQL falls back to a scan.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: planner statistics.</b> Sargable conditions make an index <em>usable</em>. Whether the planner <em>uses</em> it depends on how many rows it expects. Where does that expectation come from, and what happens when it is wrong?</div>

  <h2 id="so-stats"><span class="num">09</span>Planner Statistics: Stale Stats, Bad Plan</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every plan so far began with an estimate (<code>rows=11</code>, <code>rows=2956</code>) before a single row was read. The planner chose index or Seq Scan, hash join or nested loop, from those guesses. Where do the guesses come from, and what happens when the data changes but the guesses don't?</p>
  </div>
  <p><code>ANALYZE</code> (run by autovacuum in the background, or by hand) reads a random sample of each table (30,000 rows by default) and stores a summary per column in <code>pg_stats</code>: the fraction of NULLs, the number of distinct values, the most common values with their frequencies, and a histogram of the rest.</p>
  <div class="fx" data-lang="sql">SELECT attname, n_distinct, most_common_vals, most_common_freqs
FROM pg_stats WHERE tablename = 'orders' AND attname = 'status';</div>
  <table class="tbl out"><caption>What the planner knows about orders.status</caption><tr><th>attname</th><th>n_distinct</th><th>most_common_vals</th><th>most_common_freqs</th></tr><tr><td>status</td><td>3</td><td>{delivered,cancelled,pending}</td><td>{0.92973334,0.060466666,0.0098}</td></tr></table>
  <p>Estimate by hand: <code>status = 'pending'</code> has frequency 0.0098, and the table has 1,000,000 rows, so the planner expects 0.0098 × 1,000,000 = 9,800 rows. Ask it:</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_status_idx ON orders (status);
EXPLAIN SELECT order_id FROM orders WHERE status = 'pending';</div>
  <div class="fx" data-lang="text">Index Scan using orders_status_idx on orders  (cost=0.42..6781.58 rows=9800 width=4)
  Index Cond: (status = 'pending'::text)</div>
  <div class="fx" data-lang="sql">EXPLAIN SELECT order_id FROM orders WHERE status = 'delivered';</div>
  <div class="fx" data-lang="text">Seq Scan on orders  (cost=0.00..21845.00 rows=929733 width=4)
  Filter: (status = 'delivered'::text)</div>
  <p>rows=9800: our hand number. With an index on status, the rare value <em>pending</em> (about 1%) gets an Index Scan, but <em>delivered</em> (93%) gets a Seq Scan <strong>despite the index</strong>: almost every page holds a delivered order, so jumping through the index would read every page anyway, plus the index. That is the planner being right (this is the "low selectivity" case from the section 04 trap).</p>
  <h3>When the statistics go stale</h3>
  <p>Now the dangerous case. Biteful runs a "₹199 combo" promotion and 300,000 orders of exactly ₹199.00 arrive before statistics are refreshed. We reproduce it on a copy of orders with autovacuum (and so auto-analyze) switched off for that table:</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_promo AS SELECT * FROM orders;
ALTER TABLE orders_promo SET (autovacuum_enabled = false);
ANALYZE orders_promo;
INSERT INTO orders_promo
SELECT 1000000 + g, 1 + (g % 100000), 10 + (g % 2000),
       timestamptz '2026-02-21' + g * interval '1 second', 'delivered', 199, 30
FROM generate_series(1, 300000) g;
EXPLAIN ANALYZE
SELECT c.city, count(*) FROM orders_promo o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.amount = 199 GROUP BY c.city;</div>
  <div class="fx" data-lang="text">GroupAggregate  (cost=28518.49..28518.61 rows=4 width=15) (actual time=609.486..645.824 rows=5 loops=1)
  Group Key: c.city
  -&gt;  Sort  (cost=28518.49..28518.52 rows=10 width=7) (actual time=596.782..624.046 rows=300007 loops=1)
        Sort Key: c.city
        Sort Method: external merge  Disk: 3256kB
        -&gt;  Nested Loop  (cost=0.29..28518.33 rows=10 width=7) (actual time=71.151..543.943 rows=300007 loops=1)
              -&gt;  Seq Scan on orders_promo o  (cost=0.00..28435.22 rows=10 width=4) (actual time=71.097..188.747 rows=300007 loops=1)
                    Filter: (amount = '199'::numeric)
                    Rows Removed by Filter: 999993
              -&gt;  Index Scan using customers_pkey on customers c  (cost=0.29..8.31 rows=1 width=11) (actual time=0.001..0.001 rows=1 loops=300007)
                    Index Cond: (customer_id = o.customer_id)
Planning Time: 0.630 ms
Execution Time: 646.247 ms</div>
  <p>Find the node where estimate and actual disagree: the Seq Scan on orders_promo expected <code>rows=10</code> (the stats think ₹199.00 is one rare amount among ~100,000 distinct ones) but produced 300,007. Every decision above it was made for 10 rows: a <strong>Nested Loop</strong> doing one customers_pkey lookup per order (<code>loops=300007</code>), and a sort that spilled to disk. Refresh the statistics and run the identical query:</p>
  <div class="fx" data-lang="sql">ANALYZE orders_promo;
EXPLAIN ANALYZE
SELECT c.city, count(*) FROM orders_promo o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.amount = 199 GROUP BY c.city;</div>
  <div class="fx" data-lang="text">HashAggregate  (cost=33743.60..33743.64 rows=4 width=15) (actual time=287.714..287.720 rows=5 loops=1)
  Group Key: c.city
  Batches: 1  Memory Usage: 24kB
  -&gt;  Hash Join  (cost=2968.00..32225.85 rows=303550 width=7) (actual time=81.184..245.880 rows=300007 loops=1)
        Hash Cond: (o.customer_id = c.customer_id)
        -&gt;  Seq Scan on orders_promo o  (cost=0.00..28461.00 rows=303550 width=4) (actual time=55.012..154.039 rows=300007 loops=1)
              Filter: (amount = '199'::numeric)
              Rows Removed by Filter: 999993
        -&gt;  Hash  (cost=1718.00..1718.00 rows=100000 width=11) (actual time=25.628..25.630 rows=100000 loops=1)
              Buckets: 131072  Batches: 1  Memory Usage: 5420kB
              -&gt;  Seq Scan on customers c  (cost=0.00..1718.00 rows=100000 width=11) (actual time=0.016..9.117 rows=100000 loops=1)
Planning Time: 0.498 ms
Execution Time: 287.784 ms</div>
  <p>Estimate ≈ 300,000, so the planner builds one hash of customers and streams the orders through it: a Hash Join and an in-memory HashAggregate, and the query is clearly faster. Nothing changed but the statistics.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cab app that believes a road is empty because its traffic data is from last night. Its route is perfect for the data it has and terrible for the jam you are in. ANALYZE is refreshing the traffic data.</p>
  </div>
  <div class="callout intu"><span class="label">Debugging recipe</span>
    <p>Run EXPLAIN ANALYZE. Find the lowest node where <strong>estimated and actual rows differ by 10× or more</strong>: that is where the plan went wrong. First fix: <code>ANALYZE table</code>. If it persists: the column is skewed (raise its statistics target), two columns are correlated (<code>CREATE STATISTICS</code>), or the predicate is non-sargable (section 08).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Planner statistics</strong> are per-column summaries (null fraction, n_distinct, most common values and frequencies, histogram) collected by <strong>ANALYZE</strong> from a sample. Estimated rows = table rows × selectivity from these stats. Every plan choice (scan type, join algorithm, join order, memory) follows from the estimates.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>After a bulk load or big batch update, run <code>ANALYZE</code> yourself; don't wait for autovacuum. And "the index exists but isn't used" is not always a bug: for a value that matches most rows, a Seq Scan is the correct plan.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: other index types.</b> A B-tree answers =, &lt;, &gt;, ranges and sorts on values that fit in one sorted line. "Name contains kapoor" (section 08's leading wildcard), a 1-billion-row log searched by time, or "only the 1% pending orders" are questions a plain B-tree answers badly or wastefully.</div>

  <h2 id="so-types"><span class="num">10</span>Other Index Types: Hash, GIN, BRIN, Partial</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The B-tree needs the question to be "where in this sorted line does my value start?". Some questions don't have that shape (contains a word), and some tables are so large or so skewed that a full B-tree is wasteful. What else can an index look like?</p>
  </div>
  <h3>GIN: "contains" (the leading-wildcard fix)</h3>
  <p>A <strong>GIN</strong> (Generalized INverted) index stores, for each small piece of a value, the list of rows containing it, like the index at the back of a textbook that maps each <em>word</em> to every page it appears on. With the <code>pg_trgm</code> extension the pieces are <strong>trigrams</strong>, every 3-letter chunk of the text: "Kapoor" → "  k", " ka", "kap", "apo", "poo", "oor", "or ". "Contains kapoor" becomes "rows that have all of kap, apo, poo, oor", which the GIN index answers by intersecting lists.</p>
  <div class="fx" data-lang="sql">SELECT show_trgm('Kapoor') AS trigrams;</div>
  <table class="tbl out"><caption>Trigrams of a name</caption><tr><th>trigrams</th></tr><tr><td>{"  k"," ka",apo,kap,oor,"or ",poo}</td></tr></table>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE SELECT count(*) FROM customers WHERE name ILIKE '%kapoor%';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=2000.65..2000.66 rows=1 width=8) (actual time=66.486..66.488 rows=1 loops=1)
  -&gt;  Seq Scan on customers  (cost=0.00..1968.00 rows=13060 width=0) (actual time=0.028..65.786 rows=6582 loops=1)
        Filter: (name ~~* '%kapoor%'::text)
        Rows Removed by Filter: 93418
Planning Time: 0.388 ms
Execution Time: 66.532 ms</div>
  <div class="fx" data-lang="sql">CREATE INDEX customers_name_trgm ON customers USING gin (name gin_trgm_ops);
EXPLAIN ANALYZE SELECT count(*) FROM customers WHERE name ILIKE '%kapoor%';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=1020.76..1020.77 rows=1 width=8) (actual time=9.304..9.306 rows=1 loops=1)
  -&gt;  Bitmap Heap Scan on customers  (cost=106.86..988.11 rows=13060 width=0) (actual time=1.622..8.803 rows=6582 loops=1)
        Recheck Cond: (name ~~* '%kapoor%'::text)
        Heap Blocks: exact=718
        -&gt;  Bitmap Index Scan on customers_name_trgm  (cost=0.00..103.60 rows=13060 width=0) (actual time=1.450..1.451 rows=6582 loops=1)
              Index Cond: (name ~~* '%kapoor%'::text)
Planning Time: 0.514 ms
Execution Time: 9.358 ms</div>
  <p>Seq Scan of 100,000 names → Bitmap Index Scan on the GIN index. (Here about 1 customer in 15 is a Kapoor, so the heap part still visits many pages; for a rarer search term the gain is far larger.) GIN also indexes JSONB (<code>@&gt;</code>), arrays and full-text search (<code>@@</code>).</p>
  <h3>BRIN: tiny summaries for huge time-ordered tables</h3>
  <p>Our orders are stored in time order (section 02: page 0 is March 2025, page 9,344 is February 2026). A <strong>BRIN</strong> (Block Range INdex) stores only the min and max <code>ordered_at</code> of each range of 128 pages. For "14 Feb", it skips every block range whose [min, max] doesn't overlap that day and reads the rest, rechecking rows.</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_time_brin ON orders USING brin (ordered_at);
BEGIN;
DROP INDEX orders_time_idx;
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM orders WHERE ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15';
ROLLBACK;</div>
  <div class="fx" data-lang="text">Aggregate  (cost=10039.41..10039.42 rows=1 width=8) (actual time=1.331..1.332 rows=1 loops=1)
  Buffers: shared hit=134
  -&gt;  Bitmap Heap Scan on orders  (cost=12.77..10032.02 rows=2956 width=0) (actual time=0.764..1.175 rows=2880 loops=1)
        Recheck Cond: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
        Rows Removed by Index Recheck: 10878
        Heap Blocks: lossy=129
        Buffers: shared hit=134
        -&gt;  Bitmap Index Scan on orders_time_brin  (cost=0.00..12.03 rows=13514 width=0) (actual time=0.033..0.033 rows=1290 loops=1)
              Index Cond: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
              Buffers: shared hit=5
Planning:
  Buffers: shared hit=102
Planning Time: 0.283 ms
Execution Time: 1.369 ms</div>
  <p><code>Heap Blocks: lossy</code>: BRIN can only say "somewhere in these 128 pages", so it reads one block range and rechecks every row in it (<code>Rows Removed by Index Recheck</code>). That is more work than the B-tree, but the index is tiny (sizes below). It only works because the column follows the physical order; on a shuffled column every range would span all dates and BRIN would skip nothing.</p>
  <h3>Partial: index only the rows you ask about</h3>
  <p>The kitchen dashboard only ever shows <em>pending</em> orders, 1% of the table. A <strong>partial index</strong> has a WHERE clause and contains only the matching rows:</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_pending_idx ON orders (ordered_at) WHERE status = 'pending';
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at FROM orders
WHERE status = 'pending' AND ordered_at &gt;= '2026-02-14';</div>
  <div class="fx" data-lang="text">Index Scan using orders_pending_idx on orders  (cost=0.29..12.29 rows=172 width=12) (actual time=0.018..0.132 rows=194 loops=1)
  Index Cond: (ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone)
  Buffers: shared hit=109 read=3
Planning:
  Buffers: shared hit=158 read=1
Planning Time: 0.417 ms
Execution Time: 0.170 ms</div>
  <p>The query's WHERE must imply the index's WHERE (<code>status = 'pending'</code> appears in both), otherwise the planner can't use it.</p>
  <h3>Hash: equality only</h3>
  <p>A <strong>hash index</strong> stores a hash code of each value. It answers <code>=</code> and nothing else: no ranges, no sorting.</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_cust_hash ON orders USING hash (customer_id);
EXPLAIN SELECT order_id FROM orders WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Index Only Scan using orders_cust_time_cov on orders  (cost=0.42..8.62 rows=11 width=4)
  Index Cond: (customer_id = 1)</div>
  <p>Even with a hash index available, the planner prefers the covering B-tree for Asha (index-only). The sizes tell the rest:</p>
  <div class="fx" data-lang="sql">SELECT c.relname AS index, am.amname AS type, pg_size_pretty(pg_relation_size(c.oid)) AS size
FROM pg_class c JOIN pg_am am ON am.oid = c.relam
WHERE c.relname IN ('orders_cust_time_idx', 'orders_cust_time_cov', 'orders_time_idx', 'orders_time_brin',
                    'orders_pending_idx', 'orders_cust_hash', 'customers_name_trgm')
ORDER BY pg_relation_size(c.oid) DESC;</div>
  <table class="tbl out"><caption>Index sizes on the 73 MB orders table (customers_name_trgm is on the 5.6 MB customers table)</caption><tr><th>index</th><th>type</th><th>size</th></tr><tr><td>orders_cust_time_cov</td><td>btree</td><td>47 MB</td></tr><tr><td>orders_cust_hash</td><td>hash</td><td>32 MB</td></tr><tr><td>orders_cust_time_idx</td><td>btree</td><td>30 MB</td></tr><tr><td>orders_time_idx</td><td>btree</td><td>21 MB</td></tr><tr><td>customers_name_trgm</td><td>gin</td><td>1792 kB</td></tr><tr><td>orders_pending_idx</td><td>btree</td><td>240 kB</td></tr><tr><td>orders_time_brin</td><td>brin</td><td>24 kB</td></tr></table>
  <table class="tbl"><caption>Which index for which question</caption>
    <tr><th>Type</th><th>Answers</th><th>Biteful example</th><th>Avoid when</th></tr>
    <tr><td><strong>B-tree</strong> (default)</td><td>=, &lt;, &gt;, BETWEEN, ORDER BY, prefix LIKE</td><td>Asha's orders by time</td><td>"contains" searches</td></tr>
    <tr><td><strong>Hash</strong></td><td>= only</td><td>customer_id = 1</td><td>almost always: a B-tree does = too, plus ranges and sorts</td></tr>
    <tr><td><strong>GIN</strong></td><td>contains: trigrams, JSONB, arrays, full text</td><td>name ILIKE '%kapoor%'</td><td>write-heavy columns (GIN updates are expensive)</td></tr>
    <tr><td><strong>GiST</strong> (not demoed)</td><td>overlap / nearest: geometry, ranges</td><td>restaurants within 5 km</td><td>plain equality</td></tr>
    <tr><td><strong>BRIN</strong></td><td>ranges on a column that follows physical order</td><td>ordered_at on an append-only table</td><td>shuffled columns; needle lookups</td></tr>
    <tr><td><strong>Partial</strong> (any type + WHERE)</td><td>queries that always target a small subset</td><td>pending orders</td><td>queries that don't repeat the WHERE</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy: BRIN</span>
    <p>Date labels on archive boxes: "Feb 1–4", "Feb 4–8". To find 14 Feb, open only the boxes whose labels cover it. Useless if papers were shuffled between boxes.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>PostgreSQL index <strong>access methods</strong>: <code>btree</code> (sorted), <code>hash</code> (equality), <code>gin</code> (inverted lists per element), <code>gist</code> (geometric/overlap trees), <code>brin</code> (min/max per block range). Any of them can be <strong>partial</strong> (<code>WHERE …</code>) or on an <strong>expression</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Hash indexes are rarely worth it in PostgreSQL: here it was 32 MB, more than 3× the 9 MB deduplicated B-tree on the same column from section 04, and it can do less. (Before PostgreSQL 10 they were also not crash-safe.) MySQL's InnoDB doesn't let you create persistent hash indexes on ordinary tables at all.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: partitioning.</b> Indexes find a few rows inside one big table. But some work touches whole slices of time ("all of last February", "delete everything older than a year") and on a billion-row table even the indexes, VACUUM and DELETE become huge. Could the table itself be split?</div>

  <h2 id="so-part"><span class="num">11</span>Partitioning</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Indexes find needles. But "February's revenue" reads a whole month, and "delete orders older than a year" (a legal retention rule) on one huge table is a giant DELETE that leaves millions of dead rows for VACUUM. Can we split the table so whole months are skipped, or thrown away, at once?</p>
  </div>
  <p><strong>Partitioning</strong> splits one logical table into child tables (<strong>partitions</strong>) by a key, usually time. You still query <code>orders_part</code>; PostgreSQL routes each row to its month's child table and, when a query filters on the key, skips the months that can't match (<strong>partition pruning</strong>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school keeps one attendance register per month instead of one giant register. To check June, open only June's. To discard last year's records, throw away twelve registers; no need to erase line by line.</p>
  </div>
  <p>Traced on the 10 orders: with daily partitions (just for the trace), March 2 would hold 101, 102, 103; March 3: 104, 105; March 4: 106, 107; March 5: 108, 109; March 8: 110. "Orders on March 3" opens one partition with 2 rows and never looks at the other 8. At scale, one partition per month:</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_part (LIKE orders) PARTITION BY RANGE (ordered_at);
-- one CREATE TABLE ... PARTITION OF per month, Mar 2025 .. Feb 2026 (12 partitions)
DO $$ DECLARE m date; BEGIN FOR m IN SELECT generate_series(date '2025-03-01', date '2026-02-01', interval '1 month')::date LOOP EXECUTE format('CREATE TABLE %I PARTITION OF orders_part FOR VALUES FROM (%L) TO (%L)', 'orders_' || to_char(m, 'YYYY_MM'), m, (m + interval '1 month')::date); END LOOP; END $$;
INSERT INTO orders_part SELECT * FROM orders;
ANALYZE orders_part;
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*), sum(amount) FROM orders_part
WHERE ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=1362.86..1362.87 rows=1 width=40) (actual time=4.900..4.901 rows=1 loops=1)
  Buffers: shared hit=518
  -&gt;  Seq Scan on orders_2026_02 orders_part  (cost=0.00..1348.41 rows=2889 width=6) (actual time=2.682..4.634 rows=2880 loops=1)
        Filter: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
        Rows Removed by Filter: 52481
        Buffers: shared hit=518
Planning:
  Buffers: shared hit=89 read=3
Planning Time: 0.617 ms
Execution Time: 4.958 ms</div>
  <p>Only <code>orders_2026_02</code> appears in the plan: the other 11 months were pruned at planning time without reading a page. Inside that partition it still did a Seq Scan (we created no index on the partitions), but of one month's pages, not twelve. A query that does <em>not</em> filter on the key gets no help:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT order_id FROM orders_part WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Append  (cost=0.00..21853.11 rows=22 width=4)
  -&gt;  Seq Scan on orders_2025_03 orders_part_1  (cost=0.00..1384.99 rows=1 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2025_04 orders_part_2  (cost=0.00..1888.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2025_05 orders_part_3  (cost=0.00..1951.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2025_06 orders_part_4  (cost=0.00..1888.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2025_07 orders_part_5  (cost=0.00..1951.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2025_08 orders_part_6  (cost=0.00..1951.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2025_09 orders_part_7  (cost=0.00..1888.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2025_10 orders_part_8  (cost=0.00..1951.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2025_11 orders_part_9  (cost=0.00..1888.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2025_12 orders_part_10  (cost=0.00..1951.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2026_01 orders_part_11  (cost=0.00..1951.00 rows=2 width=4)
        Filter: (customer_id = 1)
  -&gt;  Seq Scan on orders_2026_02 orders_part_12  (cost=0.00..1210.01 rows=1 width=4)
        Filter: (customer_id = 1)</div>
  <p>An <code>Append</code> over all 12 partitions: Asha's orders could be in any month. Now retention: remove March 2025 (about 63,000 orders) from a plain table with an index, versus dropping its partition:</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_flat AS SELECT * FROM orders;
CREATE INDEX ON orders_flat (ordered_at);
\\timing on
DELETE FROM orders_flat WHERE ordered_at &lt; '2025-04-01';
DROP TABLE orders_2025_03;</div>
  <div class="fx" data-lang="text">SELECT 1000000
CREATE INDEX
Timing is on.
DELETE 63359
Time: 39.918 ms
DROP TABLE
Time: 5.714 ms</div>
  <p>The DELETE visits every old row, writes a dead version marker for each, and leaves them for VACUUM; dropping the partition just removes a file. Same effect for the user, very different work.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Partitioning</strong> (<code>PARTITION BY RANGE / LIST / HASH</code>) stores one logical table as several child tables. <strong>Pruning</strong> skips partitions whose key range can't match the WHERE. Each partition has its own (smaller) indexes. It is a tool for <em>very</em> large tables (hundreds of millions of rows, time-based retention), not a replacement for indexes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Partitioning a table whose queries don't filter on the partition key: every query becomes 12 (or 1,200) scans. And thousands of tiny partitions slow down planning. Partition by the column almost every query filters on, with partitions big enough to matter.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: row vs column store.</b> Pruning skips whole months, but inside a month PostgreSQL still reads every <em>column</em> of every row, even for <code>sum(amount)</code> which needs one column out of seven. Reports that scan everything want a different layout.</div>

  <h2 id="so-column"><span class="num">12</span>Row Store vs Column Store</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Revenue by status for the whole year" must touch every order, so no index helps. In PostgreSQL each page holds whole rows, so reading <code>amount</code> means reading all seven columns. Why do analytics databases answer such questions much faster?</p>
  </div>
  <p>Two kinds of work hit databases. <strong>OLTP</strong> (online transaction processing): the app placing an order or showing Asha's 12 orders, many tiny reads and writes of whole rows. <strong>OLAP</strong> (online analytical processing): reports over millions of rows that touch a few columns. A <strong>row store</strong> (PostgreSQL, MySQL) puts each row's columns together on a page: perfect for "fetch order 101". A <strong>column store</strong> (DuckDB, BigQuery, Snowflake, Redshift, ClickHouse, Parquet files) stores each column separately and compressed: <code>sum(amount)</code> reads only the amount column.</p>
  <p>Traced on the 10 orders: a row store's page 0 holds <code>(101, 1, 10, Mar 02, delivered, 240, 32)</code>, <code>(102, 2, 11, …)</code>, … one full row after another. A column store keeps <code>amount</code> as one list: 240, 450, 520, 380, 310, 180, 260, 260, 600, 310; and <code>status</code> as delivered ×4, cancelled, delivered, cancelled, delivered ×2, pending, which compresses to a few runs. <code>sum(amount)</code> reads one list of 10 numbers instead of 10 whole rows.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A row store is a stack of filled-in forms: great for "show me form 101". A column store is one ledger per field: great for "total of all amounts", clumsy for reassembling one form.</p>
  </div>
  <p>The same idea at scale: copy the million orders from PostgreSQL into DuckDB (an in-process column-store engine) and into a Parquet file (a columnar file format), then compare. Run as a Python script; timings are best of 3 on this machine.</p>
  <div class="fx" data-lang="py">import io, time, duckdb, psycopg

pg = psycopg.connect()                      # connection details come from PG* env variables
buf = io.BytesIO()
with pg.cursor().copy("COPY orders TO STDOUT (FORMAT csv, HEADER)") as cp:
    for chunk in cp:
        buf.write(chunk)
open('orders.csv', 'wb').write(buf.getvalue())

duck = duckdb.connect()                      # in-memory column store
duck.execute("CREATE TABLE orders AS SELECT * FROM read_csv('orders.csv')")
duck.execute("COPY orders TO 'orders.parquet' (FORMAT parquet)")

q = "SELECT status, count(*), sum(amount) FROM orders GROUP BY status ORDER BY status"
def best(run):
    times = []
    for _ in range(3):
        t = time.perf_counter(); res = run(); times.append(time.perf_counter() - t)
    return res, min(times) * 1000

pg_res, pg_ms = best(lambda: pg.execute(q).fetchall())
dk_res, dk_ms = best(lambda: duck.execute(q).fetchall())
print("PostgreSQL:", pg_res, f"{pg_ms:.0f} ms")
print("DuckDB    :", dk_res, f"{dk_ms:.0f} ms")

print("\\nParquet file: compressed bytes per column")
for col, b in duck.execute("""SELECT path_in_schema, sum(total_compressed_size)
                              FROM parquet_metadata('orders.parquet') GROUP BY 1 ORDER BY 2 DESC""").fetchall():
    print(f"  {col:&lt;17}{b/1e6:6.2f} MB")
print("PostgreSQL heap:", pg.execute("SELECT pg_size_pretty(pg_relation_size('orders'))").fetchone()[0])</div>
  <div class="fx" data-lang="text">PostgreSQL: [('cancelled', 59672, Decimal('38119539.70')), ('delivered', 930322, Decimal('595711394.57')), ('pending', 10006, Decimal('6359010.21'))] 201 ms
DuckDB    : [('cancelled', 59672, 38119539.70000008), ('delivered', 930322, 595711394.5699997), ('pending', 10006, 6359010.210000003)] 22 ms

Parquet file: compressed bytes per column
  ordered_at         7.01 MB
  amount             4.79 MB
  customer_id        4.49 MB
  order_id           4.00 MB
  restaurant_id      1.46 MB
  delivery_minutes   0.80 MB
  status             0.12 MB
PostgreSQL heap: 73 MB</div>
  <p>Same answer, both engines. The PostgreSQL query must read all 73 MB of heap pages (every column of every row). The column store reads only <code>status</code> (about 0.1 MB compressed: three values repeated in long runs) and <code>amount</code> (about 5 MB), and processes them in tight batches. That is the whole idea of OLAP engines, and why <a class="xref" data-note="sql_modeling">Data Modeling</a> separates OLTP tables from OLAP star schemas.</p>
  <div class="cards">
    <div><b>Row store</b><p>All columns of a row together. One page read fetches a whole order; updates touch one place.</p><small>OLTP: PostgreSQL, MySQL, SQL Server</small></div>
    <div><b>Column store</b><p>Each column stored separately, compressed. Scans read only the named columns; single-row updates are expensive.</p><small>OLAP: DuckDB, BigQuery, Snowflake, Redshift, ClickHouse, Parquet</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>row store</strong> lays out data row by row (good for point reads and writes). A <strong>column store</strong> lays out data column by column with compression (good for scans and aggregates over few columns). The rule of thumb: the app's database is a row store; the analytics warehouse is a column store, loaded from it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In a column store, <code>SELECT *</code> is the expensive habit: it reassembles every column. BigQuery bills by bytes scanned, so naming 2 columns instead of 7 is literally cheaper. And don't run the app on a column store: updating one order means touching seven separate compressed columns.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the write cost of indexes.</b> Every structure in this note (indexes, partitions, a separate analytics copy) makes some reads cheaper by keeping extra data. What does all that extra data cost every time Biteful <em>writes</em> an order?</div>

  <h2 id="so-cost"><span class="num">13</span>The Write Cost of Indexes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If indexes make reads so much faster, why not index every column? By now orders has seven indexes. What does each new order pay for them?</p>
  </div>
  <p>Every index is a second, sorted copy of some columns. An INSERT must add an entry to <em>every</em> index of the table, each in its correct sorted position (a B-tree search per index, sometimes a page split). An UPDATE of an indexed column does the same. Trace one new Biteful order, 111: the heap gets one row on page 0; the primary key index gets 111; an index on customer_id must find customer's slot; (customer_id, ordered_at) another slot; a covering index another. Five indexes means six writes instead of one.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana shopkeeper writes each sale in his main register. To answer questions faster he also keeps a notebook per customer and one per product. Lookups are quick, but every sale is now written in three books, and the books take shelf space.</p>
  </div>
  <p>The same idea at scale: insert the same 200,000 orders into an empty table with no indexes, and into one with a primary key plus the four secondary indexes this note created on orders.</p>
  <div class="fx" data-lang="py">import time, psycopg

pg = psycopg.connect(autocommit=True)
pg.execute("DROP TABLE IF EXISTS w0, w5")
pg.execute("CREATE TABLE w0 (LIKE orders)")                       # no indexes
pg.execute("CREATE TABLE w5 (LIKE orders)")
pg.execute("ALTER TABLE w5 ADD PRIMARY KEY (order_id)")
pg.execute("CREATE INDEX ON w5 (customer_id, ordered_at)")
pg.execute("CREATE INDEX ON w5 (customer_id, ordered_at) INCLUDE (order_id, amount)")
pg.execute("CREATE INDEX ON w5 (ordered_at)")
pg.execute("CREATE INDEX ON w5 (status)")

for t in ("w0", "w5"):
    start = time.perf_counter()
    pg.execute(f"INSERT INTO {t} SELECT * FROM orders WHERE order_id &lt;= 200000")
    ms = (time.perf_counter() - start) * 1000
    n_idx, idx_size, heap = pg.execute(f"""
        SELECT count(i.indexrelid), pg_size_pretty(coalesce(sum(pg_relation_size(i.indexrelid)), 0)),
               pg_size_pretty(pg_relation_size('{t}'))
        FROM pg_class c LEFT JOIN pg_index i ON i.indrelid = c.oid WHERE c.relname = '{t}'""").fetchone()
    print(f"{t}: {n_idx} indexes  insert 200,000 rows: {ms:7.0f} ms   heap {heap}, indexes {idx_size}")</div>
  <div class="fx" data-lang="text">w0: 0 indexes  insert 200,000 rows:     179 ms   heap 15 MB, indexes 0 bytes
w5: 5 indexes  insert 200,000 rows:    1806 ms   heap 15 MB, indexes 30 MB</div>
  <p>Same rows, roughly ten times slower with five indexes, and the indexes take more space than the table itself. Reads got faster; every write got slower. That is the trade.</p>
  <ul>
    <li><strong>Slower writes</strong>: each INSERT, and each UPDATE of an indexed column, maintains every index. (An UPDATE that changes no indexed column can be "HOT": PostgreSQL then skips index maintenance; that is why the covering index's INCLUDE columns have a cost.)</li>
    <li><strong>Space and memory</strong>: indexes compete with table pages for the cache.</li>
    <li><strong>Unused indexes</strong> cost writes and give nothing. Find them with <code>SELECT indexrelname, idx_scan FROM pg_stat_user_indexes WHERE idx_scan = 0</code>.</li>
    <li><strong>Redundant indexes</strong>: (customer_id) next to (customer_id, ordered_at) is pure overhead (section 06).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Write amplification</strong> from indexes: one logical write becomes 1 + (number of indexes) physical writes. Index what the hot queries filter, join and sort on, measured with EXPLAIN, not on a hunch. For bulk loads, drop secondary indexes, load, then rebuild.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Add an index" as a reflex fix for every slow query. On a write-heavy table (an events log, order status updates) ten indexes can make inserts the bottleneck. Check what the table does more of.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: pagination and N+1.</b> With the right indexes and fresh stats, each query is cheap. Yet apps are still slow when they ask for page 45,000 with OFFSET, or loop over customers sending one query each. Those are query-<em>shape</em> problems that no index fixes.</div>

  <h2 id="so-app"><span class="num">14</span>App-Side Patterns: OFFSET Pagination and N+1</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The admin panel lists all orders 20 per page. Page 1 is instant; page 45,000 is slow, with the same index. And a script that prints each customer's order count takes minutes although each query takes a fraction of a millisecond. What is being wasted?</p>
  </div>
  <h3>OFFSET vs keyset pagination</h3>
  <p><code>LIMIT 20 OFFSET 900000</code> means "produce 900,020 rows in order, throw away the first 900,000". Even walking the primary-key index, the database must step over every skipped row. <strong>Keyset</strong> (seek) pagination remembers the last key shown and asks for the next 20 after it, which the B-tree answers with one descent. Traced on the 10 orders with pages of 3: page 3 by OFFSET reads 101…109 and keeps 107, 108, 109; by keyset, "after 106" jumps straight to 107.</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE SELECT * FROM orders ORDER BY order_id LIMIT 20 OFFSET 900000;</div>
  <div class="fx" data-lang="text">Limit  (cost=31795.62..31796.33 rows=20 width=39) (actual time=171.780..171.785 rows=20 loops=1)
  -&gt;  Index Scan using orders_pkey on orders  (cost=0.42..35328.43 rows=1000000 width=39) (actual time=0.014..139.275 rows=900020 loops=1)
Planning Time: 0.455 ms
Execution Time: 171.817 ms</div>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE SELECT * FROM orders WHERE order_id &gt; 900000 ORDER BY order_id LIMIT 20;</div>
  <div class="fx" data-lang="text">Limit  (cost=0.42..1.18 rows=20 width=39) (actual time=0.029..0.033 rows=20 loops=1)
  -&gt;  Index Scan using orders_pkey on orders  (cost=0.42..3813.35 rows=100624 width=39) (actual time=0.028..0.030 rows=20 loops=1)
        Index Cond: (order_id &gt; 900000)
Planning Time: 0.510 ms
Execution Time: 0.060 ms</div>
  <p>OFFSET: the index scan produced <code>rows=900020</code> to return 20. Keyset: <code>Index Cond: (order_id &gt; 900000)</code>, 20 rows read, and every page costs the same no matter how deep.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>OFFSET is counting 900,000 lines from the start of the book every time you turn a page. Keyset is a bookmark.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Keyset needs a unique order. Sorting by <code>ordered_at</code>? Add a tie-breaker: <code>WHERE (ordered_at, order_id) &lt; (:last_ts, :last_id) ORDER BY ordered_at DESC, order_id DESC</code>, with an index on (ordered_at, order_id). The cost: no "jump to page 500", only next/previous.</p>
  </div>
  <h3>The N+1 query problem</h3>
  <p>Code asks for a list of customers (1 query), then inside a loop asks for each one's orders (N queries). Each query is a round trip: send, parse, plan, execute, return. The fixed cost per trip dominates when each answer is tiny. Measured on 2,000 customers over a local Unix socket (a real network adds more per trip):</p>
  <div class="fx" data-lang="py">import time, psycopg

pg = psycopg.connect()
ids = [r[0] for r in pg.execute("SELECT customer_id FROM customers ORDER BY customer_id LIMIT 2000")]

t = time.perf_counter()
counts = {}
for cid in ids:                                    # N+1: one query per customer
    counts[cid] = pg.execute("SELECT count(*) FROM orders WHERE customer_id = %s", (cid,)).fetchone()[0]
loop_ms = (time.perf_counter() - t) * 1000

t = time.perf_counter()
rows = pg.execute("""SELECT customer_id, count(*) FROM orders
                     WHERE customer_id = ANY(%s) GROUP BY customer_id""", (ids,)).fetchall()
one_ms = (time.perf_counter() - t) * 1000

print(f"N+1 loop : {len(ids)} queries, {loop_ms:6.0f} ms, Asha has {counts[1]} orders")
print(f"one query: 1 query,    {one_ms:6.0f} ms, Asha has {dict(rows)[1]} orders")</div>
  <div class="fx" data-lang="text">N+1 loop : 2000 queries,    199 ms, Asha has 12 orders
one query: 1 query,        14 ms, Asha has 12 orders</div>
  <p>Same numbers, one round trip instead of 2,000. ORMs (Django, SQLAlchemy) cause N+1 silently through lazy loading (<code>for c in customers: c.orders</code>); fix it with eager loading (<code>select_related</code>/<code>prefetch_related</code>, <code>joinedload</code>/<code>selectinload</code>), a JOIN, or <code>= ANY(:ids)</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Needing 10 items from the shop and walking there 10 times, one item per trip. The fix is one trip with the whole list.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Keyset pagination</strong>: <code>WHERE key &gt; :last ORDER BY key LIMIT n</code>, constant cost per page. <strong>N+1</strong>: 1 query for parents + 1 per parent; replace with one set-based query.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have a dozen tools. Are they a list of tricks, or one cost model with a few levers?</div>

  <h2 id="so-connect"><span class="num">15</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pages, Seq Scan cost, B-trees, EXPLAIN, composite and covering indexes, sargability, statistics, GIN/BRIN/partial, partitions, column stores, write cost, keyset: how do they fit into one picture?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="so-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="150" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="85" y="40" text-anchor="middle" font-weight="700">cost = pages read</text><text x="85" y="57" text-anchor="middle" class="tm">heap: 9,345 pages</text>
<line x1="160" y1="45" x2="193" y2="45" stroke="currentColor" marker-end="url(#so-a9)"/>
<rect x="195" y="20" width="150" height="50" rx="8" class="fr sr"/><text x="270" y="40" text-anchor="middle" font-weight="700">Seq Scan</text><text x="270" y="57" text-anchor="middle" class="tm">21,845 units, ∝ table</text>
<line x1="345" y1="45" x2="378" y2="45" stroke="currentColor" marker-end="url(#so-a9)"/>
<rect x="380" y="20" width="150" height="50" rx="8" class="fb sb"/><text x="455" y="40" text-anchor="middle" font-weight="700">B-tree</text><text x="455" y="57" text-anchor="middle" class="tm">3 + 12 pages, ∝ log n</text>
<line x1="530" y1="45" x2="563" y2="45" stroke="currentColor" marker-end="url(#so-a9)"/>
<rect x="565" y="20" width="145" height="50" rx="8" class="fg sg"/><text x="637" y="40" text-anchor="middle" font-weight="700">composite + INCLUDE</text><text x="637" y="57" text-anchor="middle" class="tm">~4 pages, no heap</text>
<line x1="455" y1="70" x2="455" y2="103" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#so-a9)"/>
<rect x="370" y="105" width="170" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="455" y="123" text-anchor="middle">is the index usable?</text><text x="455" y="139" text-anchor="middle" class="tm">sargable: column bare</text>
<line x1="370" y1="127" x2="337" y2="127" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#so-a9)"/>
<rect x="165" y="105" width="170" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="250" y="123" text-anchor="middle">will the planner pick it?</text><text x="250" y="139" text-anchor="middle" class="tm">stats → estimated rows</text>
<line x1="250" y1="149" x2="250" y2="183" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#so-a9)"/>
<rect x="150" y="185" width="200" height="44" rx="8" class="fb sb"/><text x="250" y="203" text-anchor="middle">EXPLAIN ANALYZE checks it</text><text x="250" y="219" text-anchor="middle" class="tm">estimate vs actual, buffers</text>
<rect x="400" y="185" width="310" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="555" y="203" text-anchor="middle">other shapes: GIN · BRIN · partial · partitions · columns</text><text x="555" y="219" text-anchor="middle" class="tm">skip pages a B-tree can't skip</text>
<text x="10" y="262" class="tm">Every tool reduces the pages a query must touch; every tool costs pages (and writes) to maintain.</text>
<text x="10" y="280" class="tm">The planner picks among the tools using statistics; EXPLAIN ANALYZE is how you see its choice and check its guesses.</text>
</g>
</svg><figcaption>One cost model: work = pages touched. Indexes, partitions and column stores are ways to skip pages; sargability and statistics decide whether the skip happens; write cost is the price.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same running example (Asha's "My orders" at scale unless noted)</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>Use when</th></tr>
    <tr><td>Page / heap / ctid</td><td>storage basics</td><td>what is read?</td><td>9,345 pages; Asha on 12 of them</td><td>reasoning about any cost</td></tr>
    <tr><td>Seq Scan cost</td><td>pages + 0.0125 × rows</td><td>what does "read everything" cost?</td><td>21,845 units (Biteful: 1.125)</td><td>most rows needed, tiny tables</td></tr>
    <tr><td>B-tree</td><td>sorted keys + ctids + guide pages</td><td>how to jump to the rows?</td><td>3 levels; 3 index + 12 heap pages</td><td>selective =, ranges, sorts</td></tr>
    <tr><td>EXPLAIN ANALYZE</td><td>the plan tree + real counts</td><td>what did the database do?</td><td>Seq Scan tens of ms → bitmap scan well under 1 ms</td><td>every performance question</td></tr>
    <tr><td>Composite index</td><td>B-tree on (a, b)</td><td>two conditions + order?</td><td>Index Scan Backward, no Sort; reversed order: hundreds of buffers</td><td>equality first, range/sort last</td></tr>
    <tr><td>Covering index</td><td>composite + INCLUDE + visibility map</td><td>skip the heap?</td><td>Index Only Scan, Heap Fetches 0 (24 before VACUUM)</td><td>hot, narrow SELECT lists</td></tr>
    <tr><td>Sargability</td><td>how the B-tree is sorted</td><td>why is my index ignored?</td><td>::date Seq Scan vs range read of a few pages</td><td>always: keep columns bare</td></tr>
    <tr><td>Statistics</td><td>ANALYZE sample → pg_stats</td><td>how many rows will match?</td><td>pending 0.0098 × 1M = 9,800; ₹199: est 10 vs 300,007</td><td>after bulk changes: ANALYZE</td></tr>
    <tr><td>GIN / BRIN / partial / hash</td><td>other index layouts</td><td>contains? huge ordered? hot subset?</td><td>GIN for %kapoor%; BRIN 24 kB; partial 240 kB; hash 32 MB</td><td>see the type table</td></tr>
    <tr><td>Partitioning</td><td>child table per month</td><td>skip months, drop old data?</td><td>1 of 12 partitions scanned; DROP vs DELETE</td><td>huge time-series tables</td></tr>
    <tr><td>Column store</td><td>one file per column</td><td>scan few columns of all rows?</td><td>amount ≈ 5 MB vs 73 MB heap</td><td>analytics (OLAP)</td></tr>
    <tr><td>Write cost</td><td>1 + #indexes writes per row</td><td>what do indexes cost?</td><td>200k inserts: roughly 10× slower with 5 indexes</td><td>drop unused/redundant indexes</td></tr>
    <tr><td>Keyset / N+1 fix</td><td>B-tree seek; set-based SQL</td><td>why is the app slow?</td><td>OFFSET reads 900,020 rows; 2,000 queries vs 1</td><td>deep pages; loops over rows</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>the cost of a query is the pages it touches; an index is a pre-sorted copy that lets the database touch fewer pages, if the query is written so the sorted order is usable and the statistics tell the planner it pays off; every copy costs writes.</strong> When something is slow, ask: how many pages did it read (BUFFERS), how many did it need, and which of the levers (index shape, sargability, stats, layout, query shape) closes the gap?</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Which of these slips show up most in real code reviews?</div>

  <h2 id="so-traps"><span class="num">16</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Performance bugs never throw errors; the query is right and just slow, often only in production. Which ones should you check first?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no index on a foreign key</span><p>PostgreSQL indexes primary keys automatically, not foreign keys. <code>orders.customer_id</code> had no index, so every "orders of a customer" query and every join from customers to orders scanned the whole table.</p></div>
  <div class="callout trap"><span class="label">Trap: a function or cast on the indexed column</span><p><code>ordered_at::date = …</code>, <code>lower(name) = …</code>, <code>col + 0 = …</code>: Seq Scan. Keep the column bare or index the expression.</p></div>
  <div class="callout trap"><span class="label">Trap: wrong column order in a composite index</span><p>(ordered_at, customer_id) for "customer = 1 AND since January" read hundreds of pages instead of a few. Equality first, range last.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting estimates after a bulk change</span><p>The ₹199 promotion: estimate 10, actual 300,007, Nested Loop with 300,007 loops. Run ANALYZE after big loads.</p></div>
  <div class="callout trap"><span class="label">Trap: "the index isn't used, so it's broken"</span><p>For <code>status = 'delivered'</code> (93% of rows) the Seq Scan is the right plan.</p></div>
  <div class="callout trap"><span class="label">Trap: EXPLAIN ANALYZE on a DELETE in production</span><p>It runs. Wrap it in BEGIN … ROLLBACK.</p></div>
  <div class="callout trap"><span class="label">Trap: indexing everything</span><p>Five indexes made 200,000 inserts roughly ten times slower and took more space than the table. Drop unused (<code>idx_scan = 0</code>) and redundant indexes.</p></div>
  <div class="callout trap"><span class="label">Trap: OFFSET for deep pages, and N+1 loops</span><p>Both multiply work that no index removes. Use keyset pagination and one set-based query.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above on one page.</div>

  <h2 id="so-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <strong>Asha's "My orders" screen</strong>, <code>SELECT order_id, ordered_at, amount FROM orders WHERE customer_id = 1 ORDER BY ordered_at DESC</code>, on Biteful (10 orders, 1 page) and on Biteful at scale (100,000 customers, 1,000,000 orders in 9,345 pages of 8 KB = 73 MB, stored in time order; Asha has 12 orders on 12 different pages).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On the running example</th><th>Weakness → next</th></tr>
    <tr><td>Slow query</td><td>why did it get slow?</td><td>0.03 ms on 10 rows → ~60 ms on 1M</td><td>what is read? → pages</td></tr>
    <tr><td>Pages &amp; heap</td><td>how is a table stored?</td><td>107 rows/page; Asha on pages 11 … 9,277</td><td>how much to find them? → scan cost</td></tr>
    <tr><td>Seq Scan cost</td><td>price of reading everything</td><td>9,345 + 10,000 + 2,500 = 21,845</td><td>grows with table → B-tree</td></tr>
    <tr><td>B-tree</td><td>jump to the rows</td><td>root p290 → p3 → leaf p1 → 12 ctids; 15 pages</td><td>did it get used? → EXPLAIN</td></tr>
    <tr><td>EXPLAIN ANALYZE</td><td>what really happened</td><td>Bitmap Index + Heap Scan, Sort, ~15 buffers</td><td>sort + 2nd filter → composite</td></tr>
    <tr><td>Composite</td><td>two conditions and order</td><td>(customer_id, ordered_at): Index Scan Backward, no Sort</td><td>still visits heap → covering</td></tr>
    <tr><td>Covering</td><td>skip the heap</td><td>INCLUDE (order_id, amount): Heap Fetches 0</td><td>functions break it → sargability</td></tr>
    <tr><td>Sargability</td><td>why index ignored</td><td>::date Seq Scan vs range ~0.5 ms</td><td>estimates can be wrong → stats</td></tr>
    <tr><td>Statistics</td><td>how many rows will match</td><td>pending 9,800; ₹199 est 10 vs 300,007</td><td>"contains", huge, subsets → other types</td></tr>
    <tr><td>GIN/BRIN/partial/hash</td><td>other shapes of question</td><td>%kapoor% via GIN; BRIN 24 kB; partial 240 kB</td><td>whole months → partitioning</td></tr>
    <tr><td>Partitioning</td><td>skip/drop whole months</td><td>1 of 12 scanned; DROP beats DELETE</td><td>reads all columns → column store</td></tr>
    <tr><td>Column store</td><td>scan few columns fast</td><td>amount ≈ 5 MB vs 73 MB heap</td><td>extra copies cost → write cost</td></tr>
    <tr><td>Write cost</td><td>what indexes cost</td><td>200k inserts ~10× slower with 5 indexes</td><td>query shape → keyset, N+1</td></tr>
    <tr><td>Keyset, N+1</td><td>app-side waste</td><td>OFFSET reads 900,020 rows; 2,000 trips vs 1</td><td>→ <a class="xref" data-note="sql_transactions">Transactions</a></td></tr>
  </table>
  <h3>Formulas and definitions</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Meaning</th></tr>
    <tr><td>Seq Scan cost</td><td>pages × seq_page_cost (1) + rows × cpu_tuple_cost (0.01) + rows × cpu_operator_cost (0.0025) per filter operator. pages = table pages, rows = table rows.</td></tr>
    <tr><td>Estimated rows</td><td>table rows × selectivity; selectivity of <code>col = v</code> = v's frequency in pg_stats (or ≈ 1 / n_distinct if v is not a common value)</td></tr>
    <tr><td>B-tree depth</td><td>≈ log<sub>fanout</sub>(rows), fanout ≈ a few hundred → 3–4 levels for millions of rows</td></tr>
    <tr><td>Page, heap, ctid</td><td>8 KB block; unordered table storage; (page, slot) address of a row version (changes on UPDATE)</td></tr>
    <tr><td>EXPLAIN / ANALYZE / BUFFERS</td><td>plan + estimates / runs it, real rows and times / pages hit (cache) and read (disk)</td></tr>
    <tr><td>Leftmost prefix</td><td>index (a, b) seeks on a, a+b, a + range of b; not b alone</td></tr>
    <tr><td>Covering, Index Only Scan</td><td>index holds all needed columns (keys + INCLUDE); heap skipped on all-visible pages (visibility map, set by VACUUM)</td></tr>
    <tr><td>Sargable</td><td>column bare on one side of an index-friendly comparison</td></tr>
    <tr><td>Write amplification</td><td>1 row write = 1 heap write + 1 per index</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>B-tree</b><p>Selective equality, ranges, ORDER BY … LIMIT, joins on foreign keys.</p><small>Not for low-selectivity columns (93% delivered)</small></div>
    <div><b>Composite + INCLUDE</b><p>One hot query with several conditions and a narrow column list.</p><small>Not one per query: each costs writes</small></div>
    <div><b>GIN (trigram)</b><p>"Contains" text search, JSONB, arrays.</p><small>Expensive to update</small></div>
    <div><b>BRIN</b><p>Huge append-only tables queried by time ranges.</p><small>Useless if the column is not in physical order</small></div>
    <div><b>Partial</b><p>Queries that always target a small subset (pending).</p><small>Query must repeat the WHERE</small></div>
    <div><b>Partitioning</b><p>Billions of rows filtered by time; retention by DROP.</p><small>Hurts queries without the key</small></div>
    <div><b>Column store</b><p>Analytics over few columns of all rows.</p><small>Not for the app's single-row reads and writes</small></div>
    <div><b>Keyset</b><p>Infinite scroll, deep pages.</p><small>No random "jump to page N"</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>No index on foreign keys; functions/casts/arithmetic on indexed columns; leading <code>%</code>; wrong composite column order; stale statistics after bulk loads; expecting an index to win on 93% of rows; <code>SELECT *</code> defeating covering indexes and column stores; EXPLAIN ANALYZE executing writes; too many indexes on write-heavy tables; OFFSET deep pages; N+1 loops.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>A table has 500 pages and 40,000 rows. Seq Scan cost with one filter?</td><td>500 + 400 + 100 = 1,000</td></tr>
    <tr><td>Index on (customer_id, ordered_at). Can it seek for <code>ordered_at &gt; '2026-01-01'</code> alone?</td><td>No: second column without the first</td></tr>
    <tr><td>Index Only Scan shows Heap Fetches: 24. Why, and the fix?</td><td>Pages not marked all-visible (recent updates); VACUUM</td></tr>
    <tr><td>Estimate rows=10, actual rows=300,007 at the bottom of a plan. First action?</td><td>ANALYZE the table, re-check the plan</td></tr>
    <tr><td>Rewrite <code>WHERE ordered_at::date = '2026-02-14'</code> sargably.</td><td><code>ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15'</code></td></tr>
  </table>

  <h2 id="so-qa"><span class="num">17</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain, out loud and without notes, why a query is slow and which lever fixes it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In two lines: what is an index, and what does it cost?</summary><div class="qa-body">A separate sorted copy of one or more columns, each value pointing to its row (ctid), so the database can jump to matching rows instead of reading every page. It costs disk and cache space and slows every INSERT and every UPDATE of an indexed column, because the index must be maintained too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Asha's query used a Seq Scan on the 10-order Biteful table. Is that a problem?</summary><div class="qa-body">No. The whole table is one page (8,192 bytes). Reading one page is the cheapest possible plan (cost 1.125); an index would add pages. Indexes matter when tables have thousands of pages.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the Seq Scan cost of <code>WHERE customer_id = 1</code> on the 1M-row orders table by hand.</summary><div class="qa-body">pages × 1 + rows × 0.01 + rows × 0.0025 = 9,345 + 10,000 + 2,500 = 21,845, exactly EXPLAIN's <code>cost=0.00..21845.00</code>. It does not depend on how many rows match.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through a B-tree lookup for customer_id = 1 on the 1M-row table.</summary><div class="qa-body">Root page 290: key 1 is below 25,091 → child page 3. Internal page 3: key 1 is below 90 → leaf page 1. Leaf page 1: key 1 with 12 ctids (11,48) … (9277,43). Then read those 12 heap pages. 3 index pages + 12 heap pages = 15 instead of 9,345.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A query filtering on an indexed column does a Seq Scan. How do you diagnose it?</summary><div class="qa-body">Run EXPLAIN ANALYZE. (1) Is the predicate sargable? Look for functions, casts, arithmetic or a leading %. (2) Compare estimated vs actual rows; if far off, ANALYZE. (3) Is the filter unselective (status = 'delivered', 93%)? Then the Seq Scan is right. (4) Is the table tiny?</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the index for <code>SELECT order_id, amount FROM orders WHERE customer_id = ? AND status = 'delivered' ORDER BY ordered_at DESC LIMIT 10</code>.</summary><div class="qa-body"><code>CREATE INDEX ON orders (customer_id, status, ordered_at DESC) INCLUDE (order_id, amount);</code> Equality columns first, then the sort column, so rows come out already ordered and the scan stops after 10; INCLUDE makes it index-only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Index on <code>(last_name, first_name)</code>. Which can seek: (a) last_name = 'Rao' (b) first_name = 'Asha' (c) both (d) last_name LIKE 'R%'?</summary><div class="qa-body">(a), (c), (d) (leftmost prefix; (d) is a range on the first column, given the C collation or text_pattern_ops). (b) cannot: first names are sorted only within each last name.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Rewrite to be sargable: <code>WHERE EXTRACT(YEAR FROM ordered_at) = 2025 AND EXTRACT(MONTH FROM ordered_at) = 6</code>.</summary><div class="qa-body"><code>WHERE ordered_at &gt;= '2025-06-01' AND ordered_at &lt; '2025-07-01'</code>. The half-open range keeps the column bare so the B-tree on ordered_at can seek; the ::date version read every page, the range a few dozen.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EXPLAIN ANALYZE shows a Nested Loop with estimated rows=10 and actual rows=300,007. What happened?</summary><div class="qa-body">The planner chose a plan for 10 rows (one index lookup per row) and got 300,007: our ₹199 promotion inserted rows after the last ANALYZE. Run ANALYZE; the same query became a Hash Join with an in-memory aggregate and ran much faster. If it persists: skew (raise the statistics target), correlated columns (CREATE STATISTICS), non-sargable expressions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Should you put a B-tree index on a boolean <code>is_deleted</code> column?</summary><div class="qa-body">Usually not: each value matches a large share of rows, so the planner will Seq Scan anyway (like status = 'delivered'). If queries target the rare value, use a partial index, e.g. <code>CREATE INDEX ON orders (ordered_at) WHERE is_deleted</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you paginate a 50M-row feed sorted by time?</summary><div class="qa-body">Keyset pagination with a tie-breaker and a matching index on (created_at, id): <code>WHERE (created_at, id) &lt; (:last_ts, :last_id) ORDER BY created_at DESC, id DESC LIMIT 20</code>. Each page costs the same; OFFSET 900,000 read 900,020 rows in our test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your script loops over 10,000 user IDs and runs a query for each. What's wrong?</summary><div class="qa-body">N+1: 10,001 round trips, each paying parse, plan and network overhead. Replace with one set-based query (JOIN / GROUP BY, or <code>= ANY(:ids)</code>): 2,000 looped queries vs 1 query in our measurement, same counts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does partitioning help, and when does it hurt?</summary><div class="qa-body">Helps when queries filter on the partition key (only orders_2026_02 was scanned for 14 Feb) and for retention (DROP a partition instead of a huge DELETE). Hurts when queries don't filter on the key (Asha's query hit all 12) or with too many small partitions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>SELECT status, sum(amount) FROM orders GROUP BY status</code> faster in DuckDB or BigQuery than in PostgreSQL?</summary><div class="qa-body">They are column stores: they read only the status and amount columns, compressed (about 0.1 MB + 5 MB in our Parquet file), processing values in batches. PostgreSQL reads all 73 MB of row pages. PostgreSQL wins for fetching or updating single rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a covering index need VACUUM to work?</summary><div class="qa-body">An index entry doesn't know if its row version is visible to your transaction (UPDATEs leave old versions, section 02). The Index Only Scan may skip the heap only on pages the visibility map marks "all visible", and VACUUM sets those bits. After our no-op UPDATE, Heap Fetches went from 0 to 24; after VACUUM, back to 0. This is the MVCC design from <a class="xref" data-note="sql_transactions">Transactions</a> showing up as a performance cost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: sargability and the leftmost-prefix rule are "the same rule". Explain.</summary><div class="qa-body">Both say: the index can only seek along the order it is sorted in. (customer_id, ordered_at) is sorted by customer first, so <code>ordered_at</code> alone has no contiguous slice; an index on ordered_at is sorted by raw timestamps, so <code>ordered_at::date</code> has no contiguous slice either. If the question's answer isn't a contiguous range of the sorted list, the B-tree can't jump.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip statistics, i.e. why can't the planner just always use the index?</summary><div class="qa-body">Whether an index is cheaper depends on how many rows match: 12 rows → index (15 pages); 930,000 rows → Seq Scan (the index would touch every page plus itself). The planner only knows "how many" from statistics. Without fresh stats it can't choose, and wrong stats give confidently wrong plans (Nested Loop for 300,007 rows).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the Seq Scan cost formula explain both why indexes help and why partitions and column stores help?</summary><div class="qa-body">Its biggest term is pages. An index reduces pages by skipping rows; a partition reduces pages by skipping whole months; a column store reduces bytes by skipping columns. Three different directions (rows, ranges, columns) of the same idea: touch less.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sql_transactions">Transactions &amp; Concurrency</a>.</b> Everything here assumed one query at a time. Biteful has thousands of customers ordering at once, sometimes the very last samosa. What stops two writers from corrupting each other, and what are those row versions that VACUUM keeps cleaning up?</div>
</main>`
});
