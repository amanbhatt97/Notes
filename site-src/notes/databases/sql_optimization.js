// notes/databases/sql_optimization.js — Indexes & Performance
Object.assign(TOPIC_CONTENT, {
  "sql_optimization": `<main>
  <h1>Indexes &amp; Performance</h1>
  <p class="lead">Why a query is slow, how an index makes it fast, and how to read the plan that proves it. Every plan below is real PostgreSQL 16 output on a 2-million-row table.</p>

  <h2 id="so-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">Indexes &amp; Performance</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Why queries are slow</div>
      <ul>
        <li><b>Cost = pages read</b> (8 KB each), not rows returned</li>
        <li><b>Seq Scan</b> — read every page, test every row; 2M rows = 16,576 pages, 116 ms</li>
        <li><b>Index</b> — sorted values + pointers to rows; 💡 the index at the back of a textbook</li>
        <li><b>With index</b> — 25 pages, 0.24 ms (~480× faster)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">B-tree (default index)</div>
      <ul>
        <li><b>Sorted + balanced</b> — every leaf same depth, every lookup same cost</li>
        <li><b>O(log n)</b> — hundreds of keys/page → 3–4 levels for millions of rows</li>
        <li><b>Linked leaves</b> — ranges, <code>ORDER BY</code>, prefix <code>LIKE 'abc%'</code> walk along</li>
        <li><b>Serves</b> — <code>= &lt; &gt; BETWEEN</code>, sort, min/max</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">EXPLAIN</div>
      <ul>
        <li><b>EXPLAIN</b> — the chosen plan + estimates only</li>
        <li><b>EXPLAIN ANALYZE</b> — actually runs it: real time, rows, loops</li>
        <li><b>BUFFERS</b> — pages touched (hit = cache, read = disk)</li>
        <li>⚠ <b>Runs writes</b> — wrap UPDATE/DELETE in <code>BEGIN … ROLLBACK</code></li>
        <li><b>Read inside-out</b> — most-indented node runs first</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Designing the index</div>
      <ul>
        <li><b>Composite (a, b)</b> — sorted by a, then b within ties; 💡 phone book (last, first)</li>
        <li><b>Leftmost prefix</b> — serves a, a+b; not b alone
          <ul><li>(a, b) makes (a) redundant; (b) is not</li></ul></li>
        <li><b>Column order</b> — equality columns first, range column last</li>
        <li><b>Covering</b> — <code>INCLUDE (cols)</code> → Index Only Scan, no heap visit
          <ul><li>⚠ needs a vacuumed table, else Heap Fetches stay high</li></ul></li>
        <li><b>Partial</b> — <code>... WHERE status = 'pending'</code>: 3 MB vs 43 MB</li>
        <li><b>Expression</b> — <code>ON (lower(email))</code>; query must use the same expression</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Other index types</div>
      <ul>
        <li><b>Hash</b> — only <code>=</code>; rarely beats B-tree</li>
        <li><b>GIN</b> — inverted: JSONB, arrays, full-text, trigrams (<code>@&gt;</code>, <code>@@</code>)</li>
        <li><b>GiST</b> — overlap / nearest: geo, ranges, bookings</li>
        <li><b>BRIN</b> — min/max per block range; 24 kB vs 43 MB on time-ordered data
          <ul><li>💡 date labels on archive boxes; useless if rows are shuffled</li></ul></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Cost of indexes</div>
      <ul>
        <li><b>Slower writes</b> — 500k inserts: 0.49 s (0 idx) → 9.45 s (6 idx)</li>
        <li><b>Space</b> — 6 indexes ≈ 210 MB on a 130 MB table</li>
        <li><b>Unused</b> — <code>pg_stat_user_indexes</code> where <code>idx_scan = 0</code> → drop</li>
        <li><b>Rule</b> — index hot filters/joins/sorts; bulk load → drop, load, rebuild</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Sargability</div>
      <ul>
        <li><b>Sargable</b> — index usable; keep the column <em>bare</em>, work on the constant</li>
        <li>⚠ <b>Function</b> — <code>date(ts) = d</code> → <code>ts &gt;= d AND ts &lt; d+1</code> (172 → 0.4 ms)</li>
        <li>⚠ <b>Leading %</b> — <code>LIKE '%x'</code> → anchor start or trigram GIN</li>
        <li>⚠ <b>Implicit cast</b> — <code>int_col = 4242.0</code> casts every row</li>
        <li>⚠ <b>OR</b> — one unindexed branch → Seq Scan; index both (BitmapOr) or UNION</li>
        <li>⚠ <b>Collation</b> — prefix LIKE needs "C" or <code>text_pattern_ops</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Reading a plan</div>
      <ul>
        <li><b>Scans</b> — Seq, Index, Index Only, Bitmap Heap (medium counts, AND/OR of indexes)</li>
        <li><b>Joins</b> — Nested Loop (small outer + indexed inner), Hash (big equality), Merge (both sorted)</li>
        <li><b>Debug</b> — find node where estimate vs actual differ ≥ 10× → <code>ANALYZE</code></li>
        <li><b>Index ignored</b> — low selectivity (90% rows), stale stats, non-sargable, tiny table</li>
        <li><b>Correlated cols</b> — <code>CREATE STATISTICS</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">App patterns &amp; scale</div>
      <ul>
        <li><b>OFFSET</b> — reads + discards n rows (266 ms deep)</li>
        <li><b>Keyset</b> — <code>WHERE id &gt; :last ORDER BY id LIMIT 20</code> (0.03 ms); 💡 bookmark
          <ul><li>tie-breaker: <code>(ts, id) &gt; (:ts, :id)</code>; no "jump to page 500"</li></ul></li>
        <li><b>N+1</b> — 1 query + 1 per parent; fix: JOIN / <code>ANY(:ids)</code> / eager loading</li>
        <li><b>Partitioning</b> — split by date; pruning + cheap <code>DROP</code> retention; hurts without key</li>
        <li><b>Column store</b> — reads only needed columns (OLAP); ⚠ <code>SELECT *</code> costs bytes</li>
      </ul>
    </div>
  </div>
</div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="so-slow"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Queries Are Slow</span><span class="rm-sub">Pages read is the real cost</span></div></div>
      <div class="rm-item rm-done" data-target="so-btree"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">How a B-tree Works</span><span class="rm-sub">Sorted, balanced, O(log n)</span></div></div>
      <div class="rm-item rm-done" data-target="so-before"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Before / After an Index</span><span class="rm-sub">116 ms → 0.24 ms</span></div></div>
      <div class="rm-item rm-done" data-target="so-design"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Designing the Right Index</span><span class="rm-sub">Composite, covering, partial, expression</span></div></div>
      <div class="rm-item rm-done" data-target="so-types"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Other Index Types</span><span class="rm-sub">Hash, GIN, GiST, BRIN</span></div></div>
      <div class="rm-item rm-done" data-target="so-cost"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Cost of Indexes</span><span class="rm-sub">Writes, space, too many</span></div></div>
      <div class="rm-item rm-done" data-target="so-sarg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sargability</span><span class="rm-sub">Queries that blind the index</span></div></div>
      <div class="rm-item rm-done" data-target="so-plan"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Reading a Plan</span><span class="rm-sub">Nodes, estimates, ignored indexes</span></div></div>
      <div class="rm-item rm-done" data-target="so-patterns"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Pagination &amp; N+1</span><span class="rm-sub">Two app-side performance killers</span></div></div>
      <div class="rm-item rm-done" data-target="so-scale"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Partitioning &amp; Column Stores</span><span class="rm-sub">When the table gets huge</span></div></div>
      <div class="rm-item rm-done" data-target="so-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="so-slow"><span class="num">01</span>Why Queries Are Slow</h2>
  <p>You open Swiggy and tap "My orders". The app asks its database: "give me every order of customer 4242". The company has 2 million orders. How does the database find your 22 orders in a blink? This page answers that question.</p>
  <p>The topic is called <strong>query performance</strong> (making queries fast), and the main tool is the <strong>index</strong>. You will meet it in real jobs (a dashboard that takes a minute to load, an API that times out) and in almost every SQL interview ("why is this query slow?").</p>

  <h3>How a table sits on disk</h3>
  <p>The database does not keep rows loose. It packs them into fixed blocks called <strong>pages</strong>. Each page is 8 KB, like one page of a shop register. To look at even one row, the database must read the whole page that holds it.</p>
  <p>So the real cost of a query is <strong>how many pages it reads</strong>. Not how many rows it gives back.</p>
  <p>Tiny example on our <code>shop</code> database. The <code>orders</code> table has 5 rows, so all of them fit on one page. Find customer 3's orders:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE customer_id = 3;</div>
  <div class="fx" data-lang="text">Seq Scan on orders  (cost=0.00..24.12 rows=6 width=44) (actual time=0.004..0.005 rows=2 loops=1)
   Filter: (customer_id = 3)
   Rows Removed by Filter: 3
   Buffers: shared hit=1
 Planning Time: 0.028 ms
 Execution Time: 0.013 ms</div>
  <ul>
    <li><strong>Seq Scan</strong> (sequential scan) — read every row from first to last, and test each one.</li>
    <li><strong>Rows Removed by Filter: 3</strong> — it checked all 5 rows, threw away 3, kept 2 (orders 103 and 104).</li>
    <li><strong>Buffers: shared hit=1</strong> — it read 1 page. For 5 rows, reading everything is perfectly fine.</li>
  </ul>
  <p>Now make the table big. The <code>shop</code> tables are too small to be slow, so the rest of this page uses a copy with 2M orders and 100k customers:</p>
  <div class="fx" data-lang="sql">CREATE TABLE big_orders AS
SELECT g AS order_id,
       (random()*99999)::int + 1                      AS customer_id,
       timestamp '2023-01-01' + g * interval '47 seconds' AS created_at,  -- time-ordered
       CASE WHEN random() &lt; 0.90 THEN 'delivered'
            WHEN random() &lt; 0.7  THEN 'pending' ELSE 'cancelled' END AS status,
       round((random()*1000)::numeric, 2)             AS amount
FROM generate_series(1, 2000000) g;               -- 130 MB, 16,576 pages</div>
  <div class="flow"><span>No index</span><span>Seq Scan: read all 16,576 pages</span><span>test 2M rows</span><span>keep 22</span></div>
  <p>The same Seq Scan now reads all 16,576 pages and tests 2 million rows to keep 22. It takes about 116 ms. That sounds small, but 1,000 users tapping "My orders" every second would need 116 seconds of work per second. The server falls over.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A textbook with no index: to find "photosynthesis" you read all 600 pages. The index at the back says "p. 212": you read one. A database index is that sorted list of values with pointers to rows.</p>
  </div>
  <p>So an <strong>index</strong> is a separate, sorted list of one column's values, where each value carries the address of its row. The database searches the small sorted list instead of the whole table.</p>

  <h2 id="so-btree"><span class="num">02</span>How a B-tree Index Works</h2>
  <p>Play a game. A friend thinks of a number from 1 to 1,000. You may only ask "is it bigger than X?". If you always ask about the middle, you need about 10 questions, not 1,000. Halving works only because the numbers are <em>in order</em>.</p>
  <p>An index uses the same trick. It keeps values sorted, so the database can jump instead of reading everything. The most common kind is the <strong>B-tree</strong> ("balanced tree"). It is built from pages, stacked like this:</p>
  <ul>
    <li><strong>Root</strong> — one page at the top. It works like a signboard: "below 30k go left, 30k–60k go middle, above 60k go right".</li>
    <li><strong>Internal pages</strong> — more signboards, each narrowing the range.</li>
    <li><strong>Leaves</strong> — the bottom pages. They hold every value in sorted order. Each value carries a <strong>pointer</strong>: the row's address in the table (Postgres calls it <code>ctid</code>, meaning page number + slot).</li>
  </ul>
  <p>Walk through <code>customer_id = 4242</code>. The root says 4242 is below 30k: go left. The next page says it is below 10k: go left. The leaf "4200‥4250" holds 4242, with the pointer "table page 812, row 5". Three page reads, then one jump into the table.</p>
  <figure class="viz"><svg viewBox="0 0 600 236" width="600">
    <defs><marker id="so-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g stroke="currentColor" fill="none" opacity=".45">
      <line x1="300" y1="38" x2="360" y2="70"/><line x1="300" y1="38" x2="525" y2="70"/>
      <line x1="135" y1="98" x2="290" y2="130"/><line x1="135" y1="98" x2="405" y2="130"/>
      <line x1="360" y1="98" x2="520" y2="130"/>
    </g>
    <g stroke-width="2" class="sb" fill="none"><line x1="300" y1="38" x2="135" y2="70"/><line x1="135" y1="98" x2="60" y2="130"/><line x1="135" y1="98" x2="175" y2="130"/></g>
    <rect x="240" y="10" width="120" height="28" rx="5" class="fb sb"/><text x="300" y="29" text-anchor="middle">30k | 60k</text>
    <rect x="80" y="70" width="110" height="28" rx="5" class="fb sb"/><text x="135" y="89" text-anchor="middle">10k | 20k</text>
    <rect x="305" y="70" width="110" height="28" rx="5" class="fs"/><text x="360" y="89" text-anchor="middle">40k | 50k</text>
    <rect x="470" y="70" width="110" height="28" rx="5" class="fs"/><text x="525" y="89" text-anchor="middle">70k | 85k</text>
    <rect x="10" y="130" width="100" height="28" rx="5" class="fs"/><text x="60" y="149" text-anchor="middle">1‥4199</text>
    <rect x="125" y="130" width="100" height="28" rx="5" class="ft st"/><text x="175" y="149" text-anchor="middle" font-weight="bold">4200‥4250</text>
    <rect x="240" y="130" width="100" height="28" rx="5" class="fs"/><text x="290" y="149" text-anchor="middle">4251‥4300</text>
    <rect x="355" y="130" width="100" height="28" rx="5" class="fs"/><text x="405" y="149" text-anchor="middle">…</text>
    <rect x="470" y="130" width="100" height="28" rx="5" class="fs"/><text x="520" y="149" text-anchor="middle">85k‥2M</text>
    <g stroke="currentColor" opacity=".6"><line x1="110" y1="144" x2="125" y2="144"/><line x1="225" y1="144" x2="240" y2="144"/><line x1="340" y1="144" x2="355" y2="144"/><line x1="455" y1="144" x2="470" y2="144"/></g>
    <line x1="175" y1="158" x2="175" y2="190" stroke="currentColor" marker-end="url(#so-ar)"/>
    <text x="183" y="179" font-size="11" class="tb">4242 → ctid</text>
    <rect x="95" y="192" width="200" height="30" rx="5" class="fg sg"/><text x="195" y="212" text-anchor="middle">table page 812, row 5</text>
    <text x="372" y="29" font-size="11" class="tm">root: 1 page</text>
    <text x="196" y="89" font-size="11" class="tm">internal</text>
    <text x="330" y="182" font-size="11" class="tm">leaves: sorted, linked ⇄</text>
    <text x="330" y="198" font-size="11" class="tm">→ ranges &amp; ORDER BY walk along</text>
  </svg><figcaption>Looking up 4242: one page per level (blue path), then one jump into the table. 2M rows = 3–4 levels.</figcaption></figure>
  <p>Follow the thick blue path from the top box down to the green box. That is the whole search.</p>
  <p><strong>Why only 3–4 levels for millions of rows?</strong> One page holds a few hundred keys. Say 300. One level can point to 300 values. Two levels: 300 × 300 = 90,000. Three levels: 27 million. Each new level multiplies the reach by 300. Programmers write this slow growth as <strong>O(log n)</strong>: "the steps grow very slowly as rows grow".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A dictionary. The guide words at the top of each page ("mango – market") let you skip whole pages. You never read word by word. The B-tree has guide pages above guide pages.</p>
  </div>
  <p>Three properties make it the default index:</p>
  <div class="cards">
    <div><b>O(log n) lookup</b><p>Hundreds of keys per page → 3–4 levels.</p></div>
    <div><b>Balanced</b><p>Every leaf same depth → same cost.</p></div>
    <div><b>Linked leaves</b><p><code>BETWEEN</code>, <code>ORDER BY</code>, <code>LIKE 'abc%'</code> walk along.</p></div>
  </div>
  <p><strong>Balanced</strong> means every leaf is at the same depth, so no lookup is unlucky. <strong>Linked leaves</strong> means each leaf points to the next one. For "customers 4200 to 4300", the database finds 4200 once, then simply walks right until it passes 4300.</p>

  <h2 id="so-before"><span class="num">03</span>Before / After: EXPLAIN ANALYZE</h2>
  <p>Before a query runs, a part of the database called the <strong>planner</strong> (or optimizer) decides <em>how</em> to run it. Read the whole table? Use an index? Which table first? It is like Google Maps choosing a route before you start driving. The chosen route is the <strong>query plan</strong>.</p>
  <p>You need to see the plan, because an index you created is useless if the planner doesn't use it. <code>EXPLAIN</code> shows the plan the planner chose. <code>EXPLAIN ANALYZE</code> also <em>runs</em> it and adds real times and row counts. <code>BUFFERS</code> adds pages touched.</p>
  <p>Tiny example on <code>shop</code>. Every <code>PRIMARY KEY</code> gets a B-tree index automatically, so a lookup by <code>customer_id</code> can use one:</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE SELECT * FROM customers WHERE customer_id = 2;</div>
  <div class="fx" data-lang="text">Index Scan using customers_pkey on customers  (cost=0.15..8.17 rows=1 width=72) (actual time=0.011..0.011 rows=1 loops=1)
   Index Cond: (customer_id = 2)
 Planning Time: 0.090 ms
 Execution Time: 0.024 ms</div>
  <table class="tbl">
    <tr><th>Part</th><th>Meaning in plain words</th></tr>
    <tr><td><code>Index Scan using customers_pkey</code></td><td>Walk the primary-key index, then fetch the row from the table</td></tr>
    <tr><td><code>cost=0.15..8.17</code></td><td>Planner's guess of effort, in its own units: before the first row .. for all rows</td></tr>
    <tr><td><code>rows=1</code> (first bracket)</td><td>Planner's <em>guess</em> of how many rows come out</td></tr>
    <tr><td><code>actual time=0.011..0.011 rows=1</code></td><td>What really happened: milliseconds to first row .. last row, and real row count</td></tr>
    <tr><td><code>loops=1</code></td><td>How many times this step ran</td></tr>
    <tr><td><code>Index Cond</code></td><td>The condition the index answered</td></tr>
  </table>
  <p>Now the big table, first without an index on <code>customer_id</code>:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM big_orders WHERE customer_id = 4242;</div>
  <div class="fx" data-lang="text">Seq Scan on big_orders  (cost=0.00..41576.00 rows=21 width=31) (actual time=0.079..116.108 rows=22 loops=1)
  Filter: (customer_id = 4242)
  Rows Removed by Filter: 1999978
  Buffers: shared hit=2464 read=14112          -- all 16,576 pages
Execution Time: 116.132 ms</div>
  <p>Read it: <code>Rows Removed by Filter: 1999978</code> means it tested 2 million rows to keep 22. <code>read=14112</code> means 14,112 pages came from disk. Now add the index and run the same query again:</p>
  <div class="fx" data-lang="sql">CREATE INDEX idx_orders_customer ON big_orders (customer_id);   -- 15 MB</div>
  <div class="fx" data-lang="text">Bitmap Heap Scan on big_orders  (cost=4.59..86.61 rows=21 width=31) (actual time=0.070..0.219 rows=22 loops=1)
  Recheck Cond: (customer_id = 4242)
  Buffers: shared hit=1 read=24                -- 25 pages
  -&gt;  Bitmap Index Scan on idx_orders_customer  (actual time=0.055..0.055 rows=22 loops=1)
        Index Cond: (customer_id = 4242)
Execution Time: 0.243 ms</div>
  <p>Read it from the most indented line upward. <strong>Bitmap Index Scan</strong> searches the index and collects the 22 row addresses. <strong>Bitmap Heap Scan</strong> then reads only the table pages that hold them. ("Bitmap" here is a checklist of which table pages to visit, so each page is read once. "Heap" is the main table storage.)</p>
  <table class="tbl">
    <tr><th></th><th>No index</th><th>With index</th></tr>
    <tr><td>Pages read</td><td>16,576</td><td>25</td></tr>
    <tr><td>Time</td><td>116 ms</td><td>0.24 ms (~480× faster)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>EXPLAIN ANALYZE</code> really <em>executes</em> the query. Wrap an <code>UPDATE</code>/<code>DELETE</code> in <code>BEGIN … ROLLBACK</code>.</p>
  </div>

  <h2 id="so-design"><span class="num">04</span>Designing the Right Index</h2>
  <p>One plain index on one column is a start. Real queries ask more: two filters, a sort, only a slice of rows, or a changed value like <code>lower(email)</code>. This section shows how to shape the index to fit the query.</p>
  <h3>Composite indexes and the leftmost-prefix rule</h3>
  <p>The app screen says: "customer 4242's orders since January, newest first". That filters on two columns. One index can hold both.</p>
  <p>A <strong>composite index</strong> (an index on two or more columns) sorts by column 1, then by column 2 within ties. Look at the picture: all 4242 rows sit together, and inside that group the dates are in order.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="0" y="14" font-size="11" class="tm">index (customer_id, created_at), in its sorted order:</text>
    <g font-size="11" text-anchor="middle">
      <rect x="0" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="32" y="36">4241</text><text x="32" y="50" class="tm">Jan</text>
      <rect x="66" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="98" y="36">4241</text><text x="98" y="50" class="tm">Aug</text>
      <rect x="132" y="22" width="64" height="34" class="fb sb"/><text x="164" y="36">4242</text><text x="164" y="50" class="tm">Feb</text>
      <rect x="198" y="22" width="64" height="34" class="fb sb"/><text x="230" y="36">4242</text><text x="230" y="50" class="tm">May</text>
      <rect x="264" y="22" width="64" height="34" class="fb sb"/><text x="296" y="36">4242</text><text x="296" y="50" class="tm">Dec</text>
      <rect x="330" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="362" y="36">4243</text><text x="362" y="50" class="tm">Jan</text>
      <rect x="396" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="428" y="36">4243</text><text x="428" y="50" class="tm">Jun</text>
      <rect x="462" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="494" y="36">4244</text><text x="494" y="50" class="tm">Mar</text>
      <rect x="528" y="22" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="560" y="36">4244</text><text x="560" y="50" class="tm">Dec</text>
    </g>
    <text x="230" y="74" text-anchor="middle" font-size="11" class="tb">customer_id = 4242 → one contiguous slice, already in date order ✓</text>
    <g font-size="11" text-anchor="middle">
      <rect x="0" y="86" width="64" height="34" class="fr sr"/><text x="32" y="100">4241</text><text x="32" y="114">Jan</text>
      <rect x="66" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="98" y="100">4241</text><text x="98" y="114" class="tm">Aug</text>
      <rect x="132" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="164" y="100">4242</text><text x="164" y="114" class="tm">Feb</text>
      <rect x="198" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="230" y="100">4242</text><text x="230" y="114" class="tm">May</text>
      <rect x="264" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="296" y="100">4242</text><text x="296" y="114" class="tm">Dec</text>
      <rect x="330" y="86" width="64" height="34" class="fr sr"/><text x="362" y="100">4243</text><text x="362" y="114">Jan</text>
      <rect x="396" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="428" y="100">4243</text><text x="428" y="114" class="tm">Jun</text>
      <rect x="462" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="494" y="100">4244</text><text x="494" y="114" class="tm">Mar</text>
      <rect x="528" y="86" width="64" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="560" y="100">4244</text><text x="560" y="114" class="tm">Dec</text>
    </g>
    <text x="300" y="140" text-anchor="middle" font-size="11" class="tr">created_at in Jan alone → matches scattered everywhere → can't seek ✗</text>
  </svg><figcaption>The second column is only sorted <em>within</em> each value of the first. That is the leftmost-prefix rule.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A phone book sorted by (last name, first name). "Sharma, Asha" is instant. "All Sharmas" is instant. "Everyone named Asha" means reading the whole book: first name is only sorted <em>within</em> each last name.</p>
  </div>
  <div class="fx" data-lang="sql">CREATE INDEX idx_orders_cust_date ON big_orders (customer_id, created_at);</div>
  <table class="tbl">
    <tr><th>WHERE clause</th><th>Plan (real)</th><th>Time</th></tr>
    <tr><td><code>customer_id = 4242 AND created_at &gt;= '2025-01-01'</code></td><td>Index on both columns</td><td>0.10 ms</td></tr>
    <tr><td><code>customer_id = 4242</code></td><td>Uses the same index (leftmost prefix)</td><td>0.06 ms</td></tr>
    <tr><td><code>created_at &gt;= '2025-12-23'</code></td><td>Seq Scan: 2nd column alone can't use it</td><td>107 ms</td></tr>
  </table>
  <div class="callout intu"><span class="label">Column order rule</span>
    <p><strong>Equality columns first, range column last.</strong> In <code>(customer_id, created_at)</code>, one customer's orders sit together, already in date order. Reversed, that customer's rows are scattered across the whole date range.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>An index on <code>(a, b)</code> makes a separate index on <code>(a)</code> redundant. An index on <code>(b)</code> is not.</p>
  </div>

  <h3>Covering indexes and index-only scans</h3>
  <p>A normal index lookup is two trips. Trip 1: the index gives the row's address. Trip 2: go to the table (the "heap") and fetch the other columns. With 22 rows spread over 22 pages, trip 2 is most of the work.</p>
  <p>If the index already holds every column the query asks for, trip 2 is skipped. That is a <strong>covering index</strong>, and the plan step is called an <strong>Index Only Scan</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library catalogue card that also prints the book's price and year. If that is all you wanted, you never walk to the shelf.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="so-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="0" y="16" font-weight="bold">Index Scan</text>
    <rect x="110" y="2" width="130" height="40" rx="6" class="fb sb"/><text x="175" y="20" text-anchor="middle">index leaf</text><text x="175" y="35" text-anchor="middle" font-size="10" class="tm">customer_id → ctid</text>
    <line x1="240" y1="22" x2="318" y2="22" stroke="currentColor" marker-end="url(#so-ar2)"/><text x="279" y="16" text-anchor="middle" font-size="10" class="tm">heap fetch</text>
    <rect x="320" y="2" width="130" height="40" rx="6" class="fg sg"/><text x="385" y="20" text-anchor="middle">table (heap)</text><text x="385" y="35" text-anchor="middle" font-size="10" class="tm">created_at, amount</text>
    <line x1="450" y1="22" x2="488" y2="22" stroke="currentColor" marker-end="url(#so-ar2)"/><text x="494" y="26">25 pages</text>
    <text x="0" y="96" font-weight="bold">Index Only</text>
    <rect x="110" y="72" width="210" height="40" rx="6" class="fb sb"/><text x="215" y="90" text-anchor="middle">index leaf + INCLUDE</text><text x="215" y="105" text-anchor="middle" font-size="10" class="tm">customer_id | created_at, amount</text>
    <line x1="320" y1="92" x2="488" y2="92" stroke="currentColor" marker-end="url(#so-ar2)"/><text x="494" y="96" class="tg">5 pages</text>
    <rect x="350" y="118" width="110" height="26" rx="6" fill="none" stroke="currentColor" stroke-dasharray="4 3" opacity=".5"/><text x="405" y="135" text-anchor="middle" font-size="10" class="tm">heap skipped</text>
    <text x="110" y="135" font-size="10" class="tm">visibility map says "all visible"</text>
  </svg><figcaption>Covering index: every needed column is in the leaf, so the table is never read (Heap Fetches: 0).</figcaption></figure>
  <div class="fx" data-lang="sql">CREATE INDEX idx_orders_cust_cov ON big_orders (customer_id) INCLUDE (created_at, amount);
EXPLAIN (ANALYZE, BUFFERS) SELECT created_at, amount FROM big_orders WHERE customer_id = 4242;</div>
  <div class="fx" data-lang="text">Index Only Scan using idx_orders_cust_cov on big_orders  (actual time=0.097..0.112 rows=22 loops=1)
  Index Cond: (customer_id = 4242)
  Heap Fetches: 0                              -- never touched the table
  Buffers: shared hit=1 read=4                 -- 5 pages vs 25 before</div>
  <p><code>INCLUDE</code> columns ride along in the leaves, unsorted, so they're cheaper than extra key columns.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Index Only" still checks visibility: is this row version visible to my transaction? The <strong>visibility map</strong> is a tiny note per page saying "every row here is visible to everyone". On a table not recently vacuumed, you'll see <code>Heap Fetches: 300000</code> and lose the benefit. <code>VACUUM</code> (Postgres's clean-up job) updates the visibility map that makes heap skips possible.</p>
  </div>

  <h3>Partial and expression indexes</h3>
  <p><strong>Partial index</strong>. The delivery team's screen only ever shows <em>pending</em> orders, which are 7% of rows. Why index the other 93%? A partial index keeps only rows matching a <code>WHERE</code>. It is smaller, so it is faster and cheaper.</p>
  <p><strong>Expression index</strong>. Users type emails in any case: "Asha@Mail.com" or "asha@mail.com". So the query says <code>WHERE lower(email) = …</code>. A plain index on <code>email</code> stores the original text, so it can't answer a question about <code>lower(email)</code>. An expression index stores the computed value itself. The query must use the <em>same</em> expression.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Partial index: a teacher's separate list of only the students with pending fees, instead of searching the full class register. Expression index: a phone contacts list sorted by nickname, not by the full official name.</p>
  </div>
  <div class="fx" data-lang="sql">-- Ops dashboard only ever looks at pending orders (7% of rows)
CREATE INDEX idx_orders_pending ON big_orders (created_at) WHERE status = 'pending';
-- 3 MB, vs 43 MB for a full index on created_at
SELECT * FROM big_orders WHERE status = 'pending' AND created_at &gt;= '2025-12-01';
-- Index Scan using idx_orders_pending ... rows=2930, Execution Time: 1.199 ms

CREATE INDEX idx_cust_lower_email ON big_customers (lower(email));
SELECT * FROM big_customers WHERE lower(email) = 'user4242@mail.com';
-- Seq Scan 27.7 ms (even with a plain index on email) → Index Scan 0.039 ms</div>

  <h2 id="so-types"><span class="num">05</span>Other Index Types</h2>
  <p>A B-tree needs values that can be put in one line, smallest to biggest. Some data does not fit a line: a list of tags on a product, a JSON document, a shop's location on a map, a long article. Questions on such data sound different: "which products have the tag <em>sale</em>?", "which shops are within 5 km?". Other index types answer those.</p>
  <div class="callout anlg"><span class="label">Analogy: GIN</span>
    <p>The index at the back of a textbook: each <em>word</em> points to every page where it appears. GIN ("generalized inverted index") does that for each tag, JSON key or word, so "which rows contain X?" is fast.</p>
  </div>
  <table class="tbl">
    <tr><th>Type</th><th>Good for</th><th>Example</th></tr>
    <tr><td><strong>B-tree</strong> (default)</td><td>=, &lt;, &gt;, BETWEEN, ORDER BY, prefix LIKE</td><td>Almost everything</td></tr>
    <tr><td><strong>Hash</strong></td><td>Only <code>=</code>; rarely beats B-tree</td><td>Long keys looked up by equality</td></tr>
    <tr><td><strong>GIN</strong> (inverted index)</td><td>"Contains" on multi-valued data: JSONB, arrays, full-text, trigrams</td><td><code>tags @&gt; '{sale}'</code>, <code>doc @@ to_tsquery('laptop')</code></td></tr>
    <tr><td><strong>GiST</strong></td><td>Overlap / nearest: geometry, ranges, GPS</td><td>Shops within 5 km; overlapping bookings</td></tr>
    <tr><td><strong>BRIN</strong> (block range)</td><td>Huge tables whose order matches the column (append-only time data)</td><td>Logs, events, IoT readings by time</td></tr>
  </table>
  <p><strong>BRIN</strong> stores only min/max per block range, so it's tiny. On our time-ordered <code>created_at</code>:</p>
  <table class="tbl out"><caption>Result (one-day range query)</caption>
    <tr><th>index</th><th>size</th><th>query time</th></tr>
    <tr><td>B-tree</td><td>43 MB</td><td>0.40 ms</td></tr>
    <tr><td>BRIN</td><td>24 kB</td><td>1.45 ms</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy: BRIN</span>
    <p>Date labels on archive boxes: open only matching boxes. Useless if papers were shuffled between boxes (column not in physical order).</p>
  </div>

  <h2 id="so-cost"><span class="num">06</span>The Cost of Indexes</h2>
  <p>If indexes make reads fast, why not index every column? Because nothing is free.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana shopkeeper writes each sale in his main register. To answer questions faster, he also keeps a notebook per customer and a notebook per product. Lookups become quick, but every sale now means writing in three books. And the books take shelf space.</p>
  </div>
  <p>Every index is a second copy of data, updated on every write. Real numbers:</p>
  <table class="tbl out"><caption>Result: inserting 500k rows</caption>
    <tr><th>table</th><th>indexes</th><th>time</th></tr>
    <tr><td>ins_noidx</td><td>0</td><td>0.49 s</td></tr>
    <tr><td>ins_idx</td><td>PK + 5 secondary</td><td>9.45 s</td></tr>
  </table>
  <ul>
    <li><strong>Slower writes</strong>: each INSERT updates every index; UPDATEs of indexed columns too.</li>
    <li><strong>Space</strong>: our six indexes on <code>big_orders</code> totalled ~210 MB, more than the 130 MB table.</li>
    <li><strong>Too many indexes</strong>: overlapping ones waste RAM and confuse the planner. Find unused ones with <code>pg_stat_user_indexes</code> where <code>idx_scan = 0</code>.</li>
  </ul>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Index what hot queries filter, join and sort on, not on a hunch. For bulk loads, drop indexes and rebuild after.</p>
  </div>

  <h2 id="so-sarg"><span class="num">07</span>Sargability</h2>
  <p>You created the index. The query still does a Seq Scan. The most common reason: the <code>WHERE</code> clause changes the column before comparing it.</p>
  <p>The index is sorted by the <em>stored</em> value of <code>created_at</code>, like 2025-06-01 14:32. Ask <code>date(created_at) = '2025-06-01'</code> and the database must first compute <code>date()</code> for every row, then compare. The sorted order of the stored values doesn't help with that, so it reads all rows.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A dictionary is sorted by the word. "Find words starting with <em>ma</em>" is quick. "Find words whose <em>last</em> letter is <em>a</em>" means reading the whole book, even though it's the same dictionary.</p>
  </div>
  <p>The fix is to ask the same question in a different shape. Instead of "is the date part equal to 1 June?", ask "is the timestamp from 1 June 00:00 up to (not including) 2 June 00:00?". Same rows. But now the bare column is compared with two fixed values, so the B-tree can jump straight there. On our data: 172 ms → 0.40 ms.</p>
  <p>A condition the index can be used for is called <strong>sargable</strong> (Search-ARGument-able). The rule: <strong>leave the indexed column bare</strong>; do the work on the constant side.</p>
  <table class="tbl">
    <tr><th>Problem</th><th>Non-sargable</th><th>Rewrite</th><th>Real result</th></tr>
    <tr><td>Function on column</td><td><code>date(created_at) = '2025-06-01'</code></td><td><code>created_at &gt;= '2025-06-01' AND created_at &lt; '2025-06-02'</code></td><td>172 ms → 0.40 ms</td></tr>
    <tr><td>Leading wildcard</td><td><code>email LIKE '%4242@Mail.com'</code></td><td>Anchor the start: <code>LIKE 'User4242@%'</code>, or a trigram GIN index</td><td>8.5 ms → 0.06 ms</td></tr>
    <tr><td>Implicit cast</td><td><code>customer_id = 4242.0</code> (int vs numeric)</td><td><code>customer_id = 4242</code> (match the type)</td><td>207 ms → 0.24 ms</td></tr>
    <tr><td>OR across columns</td><td><code>customer_id = 4242 OR amount &gt; 999.9</code></td><td>Index both (BitmapOr) or split into <code>UNION</code></td><td>205 ms → 0.65 ms</td></tr>
  </table>
  <ul>
    <li><strong>Leading wildcard</strong>: <code>%</code> means "anything". A pattern that <em>starts</em> with <code>%</code> has no fixed start to jump to, like the "last letter" dictionary question.</li>
    <li><strong>Implicit cast</strong> (the database quietly converting one type to another): the plan showed <code>Filter: ((customer_id)::numeric = 4242.0)</code>. The <em>column</em> was cast, row by row.</li>
    <li><strong>OR</strong>: one unindexed branch forces a Seq Scan. With both indexed, Postgres merges them (<code>BitmapOr</code>); other engines may need a <code>UNION</code>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Prefix <code>LIKE 'abc%'</code> uses a plain B-tree only under the "C" collation. Our DB uses <code>C.UTF-8</code>, and it did a Seq Scan until we created <code>(email text_pattern_ops)</code>.</p>
  </div>

  <h2 id="so-plan"><span class="num">08</span>Reading a Plan</h2>
  <p>Big queries have plans with many steps. Each step is called a <strong>node</strong>. Nodes form a tree: a node takes rows from the nodes indented below it, does its work, and passes rows up. So read a plan tree <strong>inside-out</strong> (most indented runs first).</p>
  <figure class="viz"><svg viewBox="0 0 600 214" width="600">
    <defs><marker id="so-ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g stroke="currentColor" fill="none" marker-end="url(#so-ar4)">
      <line x1="300" y1="64" x2="300" y2="40"/><line x1="150" y1="120" x2="262" y2="96"/>
      <line x1="430" y1="120" x2="338" y2="96"/><line x1="430" y1="176" x2="430" y2="152"/>
    </g>
    <rect x="200" y="8" width="200" height="30" rx="5" class="fv"/><text x="300" y="28" text-anchor="middle">⑤ HashAggregate</text>
    <rect x="200" y="64" width="200" height="30" rx="5" class="fb sb"/><text x="300" y="84" text-anchor="middle">④ Hash Join</text>
    <rect x="30" y="120" width="240" height="30" rx="5" class="ft st"/><text x="150" y="140" text-anchor="middle">③ Bitmap Heap Scan (orders)</text>
    <rect x="330" y="120" width="200" height="30" rx="5" class="fg sg"/><text x="430" y="140" text-anchor="middle">② Hash (build lookup)</text>
    <rect x="330" y="176" width="200" height="30" rx="5" class="fs"/><text x="430" y="196" text-anchor="middle">① Seq Scan (customers)</text>
    <text x="420" y="28" font-size="11" class="tm">group by city, count</text>
    <text x="420" y="84" font-size="11" class="tm">match orders to customers</text>
    <text x="30" y="172" font-size="11" class="tm">orders since 1 Dec</text>
    <text x="30" y="200" font-size="11" class="tm">rows flow upward ↑</text>
  </svg><figcaption>The plan below as a tree. Numbers show the order of work: bottom first, top last.</figcaption></figure>
  <p>Follow the circled numbers. Customers are read and loaded into a lookup table (①②), orders since December stream in (③), each is matched to its customer (④), then rows are grouped by city (⑤).</p>
  <p>Each node shows <code>(cost=… rows=estimate)</code> then <code>(actual time=first..last ms rows=actual loops=n)</code>. The common node types:</p>
  <table class="tbl">
    <tr><th>Node</th><th>What it does</th><th>When chosen</th></tr>
    <tr><td><strong>Seq Scan</strong></td><td>Reads every page</td><td>No usable index, or most rows needed</td></tr>
    <tr><td><strong>Index Scan</strong></td><td>Walks the index, fetches each row</td><td>Few rows (PK lookup: 0.12 ms)</td></tr>
    <tr><td><strong>Index Only Scan</strong></td><td>Answers from the index alone</td><td>Covering index, vacuumed table</td></tr>
    <tr><td><strong>Bitmap Heap Scan</strong></td><td>Collects matches from index(es), then reads pages in physical order</td><td>Medium row counts; combining indexes (BitmapAnd/Or)</td></tr>
    <tr><td><strong>Nested Loop</strong></td><td>For each outer row, look up inner rows</td><td>Small outer side + indexed inner</td></tr>
    <tr><td><strong>Hash Join</strong></td><td>Build a hash table of the smaller side, probe with the other</td><td>Large unsorted equality joins</td></tr>
    <tr><td><strong>Merge Join</strong></td><td>Walk two sorted inputs together</td><td>Both sides already sorted</td></tr>
  </table>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE
SELECT c.city, count(*) FROM big_orders o JOIN big_customers c ON c.customer_id = o.customer_id
WHERE o.created_at &gt;= '2025-12-01' GROUP BY c.city;</div>
  <div class="fx" data-lang="text">HashAggregate  (actual time=57.598..57.603 rows=4 loops=1)
  -&gt;  Hash Join  (cost=3041.04..20308.91 rows=43786 width=6) (actual time=31.621..51.486 rows=42213 loops=1)
        Hash Cond: (o.customer_id = c.customer_id)
        -&gt;  Bitmap Heap Scan on big_orders o  (actual ... rows=42213)
        -&gt;  Hash  (actual ... rows=100000)  Memory Usage: 5321kB
              -&gt;  Seq Scan on big_customers c  (actual ... rows=100000)
Execution Time: 57.920 ms</div>
  <p>Estimate 43,786 vs actual 42,213: close, so the plan can be trusted. The planner picks a route based on its row guesses. A good guess gives a good route. A wildly wrong guess (like a cab app thinking a road is empty when it is jammed) gives a bad route.</p>

  <h3>Why the planner ignores your index</h3>
  <ul>
    <li><strong>Tiny table</strong>: one page is cheaper to read whole than index + table. The 5-row <code>shop.orders</code> is like this.</li>
    <li><strong>Low selectivity</strong> (the filter keeps a big share of rows). If you need 90% of a book, read it cover to cover; don't flip to the index for every line. <code>status = 'delivered'</code> matches 90% of rows, so the planner chose a Seq Scan despite an index. Even 3% (<code>cancelled</code>) touched 16,180 of 16,576 pages, because matches are spread everywhere.</li>
    <li><strong>Stale statistics</strong>: <strong>statistics</strong> are a small summary the database keeps per column (common values, number of distinct values). The planner estimates rows from stats sampled by <code>ANALYZE</code>. If data changed since, estimates are wrong.</li>
    <li><strong>Non-sargable predicate</strong> or type mismatch (section 07).</li>
  </ul>
  <div class="fx" data-lang="sql">-- events: 1M 'view' rows, ANALYZE, then 300k 'purchase' rows added (autovacuum off)
EXPLAIN ANALYZE SELECT count(*) FROM events WHERE kind = 'purchase';
--   Index Only Scan ... (cost=0.43..4.45 rows=1) (actual ... rows=300000)   79 ms
ANALYZE events;
--   Bitmap Heap Scan ... (rows=306237) (actual ... rows=300000)              48 ms</div>
  <div class="callout intu"><span class="label">Debugging recipe</span>
    <p>Find the node where <strong>estimated rows and actual rows differ by 10× or more</strong>. That's where the plan went wrong. First fix: <code>ANALYZE table</code>. Then check sargability and column types.</p>
  </div>

  <h2 id="so-patterns"><span class="num">09</span>Pagination &amp; N+1</h2>
  <p>Two slow patterns come from the app code, not from the index. Both are common in interviews.</p>
  <h3>OFFSET vs keyset pagination</h3>
  <p>Flipkart shows search results 20 at a time. That is <strong>pagination</strong> (showing results page by page). The usual SQL is <code>LIMIT 20 OFFSET 40</code>: skip 40 rows, show the next 20. That is page 3.</p>
  <p>The catch: to skip 40 rows, the database still has to <em>produce</em> those 40 rows and throw them away. On page 75,001 it produces 1.5 million rows to throw away. Deep pages get slower and slower.</p>
  <p><strong>Keyset</strong> (seek) pagination remembers the last key shown and seeks to it via the index. "Last order shown was 1,500,000; give me the next 20 after it." The B-tree jumps to 1,500,000 in 3–4 page reads.</p>
  <figure class="viz"><svg viewBox="0 0 600 136" width="600">
    <defs><marker id="so-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="0" y="16" font-weight="bold">OFFSET</text>
    <rect x="80" y="4" width="340" height="18" class="fr sr"/><text x="250" y="17" text-anchor="middle" font-size="11">read 1,500,000 rows, throw away</text>
    <rect x="420" y="4" width="12" height="18" class="fb sb"/><text x="442" y="17" font-size="11">20 kept · 266 ms</text>
    <text x="250" y="52" text-anchor="middle" font-size="10" class="tm">index seek: order_id &gt; 1500000</text>
    <path d="M86,80 C190,56 320,56 416,80" fill="none" stroke="currentColor" marker-end="url(#so-ar3)"/>
    <text x="0" y="96" font-weight="bold">Keyset</text>
    <rect x="80" y="84" width="340" height="18" fill="none" stroke="currentColor" stroke-opacity=".3"/>
    <rect x="420" y="84" width="12" height="18" class="fb sb"/><text x="442" y="97" font-size="11" class="tg">20 read · 0.03 ms</text>
    <line x1="80" y1="116" x2="432" y2="116" stroke="currentColor" opacity=".4"/>
    <text x="80" y="131" font-size="10" class="tm">order_id 1</text><text x="432" y="131" font-size="10" class="tm" text-anchor="end">1,500,020</text>
  </svg><figcaption>OFFSET pays for every skipped row; keyset jumps straight to the bookmark.</figcaption></figure>
  <div class="fx" data-lang="sql">-- Page 75,001: OFFSET
SELECT * FROM big_orders ORDER BY order_id LIMIT 20 OFFSET 1500000;
-- Index Scan ... (actual rows=1500020)   Execution Time: 265.637 ms

-- Same page: keyset ("give me 20 after the last id I showed")
SELECT * FROM big_orders WHERE order_id &gt; 1500000 ORDER BY order_id LIMIT 20;
-- Index Scan ... Index Cond: (order_id &gt; 1500000) (actual rows=20)   Execution Time: 0.034 ms</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>OFFSET is counting 1.5 million pages from the start of a book every time. Keyset is a bookmark.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Keyset needs a unique, ordered key. Sorting by <code>created_at</code>? Use a tie-breaker: <code>WHERE (created_at, order_id) &gt; (:last_ts, :last_id) ORDER BY created_at, order_id</code>. Cost: no "jump to page 500".</p>
  </div>

  <h3>The N+1 query problem</h3>
  <p>Your Python code first asks for the list of customers (1 query). Then, inside a loop, it asks for each customer's orders, one query per customer (N queries). Total: N+1 queries. Each query is a round trip over the network, and each trip has a fixed cost even if the answer is tiny.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You need 10 items from the kirana shop. N+1 is walking to the shop 10 times, one item per trip. The fix is one trip with the full list.</p>
  </div>
  <div class="flow"><span>1 query: N parents</span><span>loop: +1 query each</span><span>N round trips</span></div>
  <div class="fx" data-lang="python"># N+1: 1 query + 100,000 more, one per customer
for cid in pd.read_sql("SELECT customer_id FROM big_customers", conn).customer_id:
    orders = pd.read_sql(f"SELECT * FROM big_orders WHERE customer_id = {cid}", conn)

# Fix: one set-based query
df = pd.read_sql("SELECT customer_id, count(*) AS n FROM big_orders GROUP BY customer_id", conn)</div>
  <p>ORMs (Django, SQLAlchemy) cause it silently through lazy loading: <code>for c in customers: c.orders</code>. Fix with eager loading (<code>select_related</code>, <code>prefetch_related</code>, <code>joinedload</code>) or an <code>IN (…)</code> batch.</p>

  <h2 id="so-scale"><span class="num">10</span>Partitioning &amp; Column Stores</h2>
  <p>Indexes help find a few rows. When a table grows to billions of rows (app events, payment logs), two more ideas help: cut the table into parts, or store it by column.</p>
  <h3>Partitioning</h3>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school keeps one attendance register per month, not one giant register. To check June, open only the June register. To throw away 2023 records, remove the old registers; no need to erase line by line.</p>
  </div>
  <p><strong>Partitioning</strong> splits one logical table into child tables by a key, usually date. Queries filtering on that key skip the other partitions (<strong>partition pruning</strong>).</p>
  <div class="fx" data-lang="sql">CREATE TABLE events (event_id bigint, created_at timestamp, payload jsonb)
  PARTITION BY RANGE (created_at);
CREATE TABLE events_2025_06 PARTITION OF events
  FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
-- WHERE created_at &gt;= '2025-06-10' reads only events_2025_06</div>
  <ul>
    <li><strong>Helps</strong>: huge time-series tables filtered on the key; retention is <code>DROP TABLE events_2023_01</code> instead of a huge DELETE.</li>
    <li><strong>Hurts</strong>: queries without the key scan every partition; thousands of tiny partitions slow planning.</li>
  </ul>

  <h3>Row store vs column store</h3>
  <p>Two kinds of work hit databases. <strong>OLTP</strong> (online transaction processing): an app doing many tiny reads and writes, like "place this order". <strong>OLAP</strong> (online analytical processing): reports over millions of rows, like "total sales per month". They want data laid out differently.</p>
  <div class="cards">
    <div><b>Row store</b><p>Each row's columns stored together on a page. Fetching one whole order is one page.</p><small>OLTP: PostgreSQL, MySQL</small></div>
    <div><b>Column store</b><p>Each column stored separately and compressed. <code>SUM(amount)</code> reads only the amount column.</p><small>OLAP: BigQuery, Snowflake, Redshift, ClickHouse, Parquet files</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A row store is a stack of filled-in forms: great for "show me form #4242". A column store is one ledger per field: great for "total of all amounts", useless for reassembling one form quickly.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In a column store, <code>SELECT *</code> is the expensive habit. BigQuery bills by bytes scanned, so name only the columns you need and filter on the partition column.</p>
  </div>

  <h2 id="so-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In two lines: what is an index, and what does it cost?</summary><div class="qa-body">A separate sorted copy of one or more columns, each value pointing to its row, so the database can jump instead of reading every page. It costs disk space and slows every INSERT/UPDATE/DELETE, because the index must be updated too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The 5-row <code>shop.orders</code> query used a Seq Scan. Is that a problem?</summary><div class="qa-body">No. The whole table is one page (<code>Buffers: shared hit=1</code>). Reading one page is the cheapest possible plan; an index would add work. Indexes matter when tables have thousands of pages.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A query filtering on an indexed column does a Seq Scan. How do you diagnose it?</summary><div class="qa-body">Run <code>EXPLAIN ANALYZE</code>. (1) Is the predicate sargable? Look for functions, casts like <code>(col)::numeric</code>, leading <code>%</code>. (2) Compare estimated vs actual rows; if far off, run <code>ANALYZE</code>. (3) Is the filter unselective (e.g. 90% of rows)? Then the Seq Scan is the right choice. (4) Is the table tiny?</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the index for: <code>SELECT order_id, amount FROM orders WHERE customer_id = ? AND status = 'delivered' ORDER BY created_at DESC LIMIT 10</code>.</summary><div class="qa-body"><code>CREATE INDEX ON orders (customer_id, status, created_at DESC) INCLUDE (amount);</code> Equality columns first, then the sort column, so the index returns rows already ordered and stops after 10. <code>INCLUDE amount</code> (order_id too, if not the key) allows an Index Only Scan.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Index on <code>(last_name, first_name)</code>. Which use it: (a) last_name = 'Rao' (b) first_name = 'Asha' (c) both (d) last_name LIKE 'R%'?</summary><div class="qa-body">(a), (c) and (d) can use it (leftmost prefix; (d) is a range on the first column, given a suitable collation or <code>text_pattern_ops</code>). (b) can't seek, because first names are only sorted within each last name.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Rewrite to be sargable: <code>WHERE EXTRACT(YEAR FROM order_date) = 2024 AND EXTRACT(MONTH FROM order_date) = 6</code>.</summary><div class="qa-body"><div class="fx" data-lang="sql">WHERE order_date &gt;= '2024-06-01' AND order_date &lt; '2024-07-01'</div>A half-open range keeps the column bare so a B-tree on <code>order_date</code> can be used. On our data, the function version took 172 ms (Seq Scan) and the range 0.40 ms.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might adding an index make the system slower?</summary><div class="qa-body">Every INSERT, and every UPDATE of an indexed column, must also update the index. 500k inserts went from 0.49 s to 9.45 s with 6 indexes. Indexes also use disk and RAM (cache space), and redundant ones can mislead the planner.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EXPLAIN ANALYZE shows a Nested Loop with estimated rows=12, actual rows=480,000. What's happening?</summary><div class="qa-body">The planner badly underestimated the outer side, so it picked a plan meant for 12 rows: 480k index lookups instead of one Hash Join. Usual cause: stale statistics. Run <code>ANALYZE</code>. If it persists: correlated columns (use <code>CREATE STATISTICS</code>), skewed data (raise the statistics target), or a non-sargable expression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Should you put a B-tree index on a boolean <code>is_deleted</code> column?</summary><div class="qa-body">Usually not: with ~2 values, each matches a large share of rows and the planner will Seq Scan anyway. If queries target the rare value, use a partial index instead, e.g. <code>CREATE INDEX ON orders (created_at) WHERE NOT is_deleted</code>, or index the rare side.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you paginate a 50M-row feed sorted by time?</summary><div class="qa-body">Keyset pagination with a tie-breaker and a matching index on <code>(created_at, id)</code>:<div class="fx" data-lang="sql">SELECT * FROM posts
WHERE (created_at, id) &lt; (:last_ts, :last_id)
ORDER BY created_at DESC, id DESC LIMIT 20;</div>Each page costs the same. OFFSET 1.5M took 266 ms vs 0.03 ms for keyset in our test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your pandas script loops over 10,000 user IDs and runs a query for each. What's wrong and how do you fix it?</summary><div class="qa-body">The N+1 problem: 10,001 round trips, each paying network and parse overhead. Replace it with one set-based query: a <code>JOIN</code>/<code>GROUP BY</code>, or <code>WHERE user_id = ANY(:ids)</code>, then process the single DataFrame.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does partitioning help, and when does it hurt?</summary><div class="qa-body">Helps when queries filter on the partition key (pruning skips most data) and for retention (drop a partition instead of a giant DELETE). Hurts when queries don't filter on the key (every partition is scanned) or with too many small partitions (planning overhead). It's not a substitute for indexes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>SELECT SUM(amount) FROM orders</code> over 1B rows faster in BigQuery than in Postgres?</summary><div class="qa-body">BigQuery is a column store: it reads only the compressed <code>amount</code> column, in parallel across many machines. Postgres is a row store: it reads every full row's pages to extract one column. Postgres wins for fetching or updating individual rows.</div></details>
</main>`
});
