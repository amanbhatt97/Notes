// notes/databases/sql_optimization.js — Indexes & Performance
Object.assign(TOPIC_CONTENT, {
  "sql_optimization": `<main>
  <h1>Indexes &amp; Performance</h1>
  <p class="lead">Why a query is slow, how an index makes it fast, and how to read the plan that proves it. Every plan below is real PostgreSQL 16 output on a 2-million-row table.</p>

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
      <div class="rm-item rm-done" data-target="so-rev"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="so-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="so-slow"><span class="num">01</span>Why Queries Are Slow</h2>
  <p>The <code>shop</code> tables are too small to be slow, so this page uses a copy with 2M orders and 100k customers:</p>
  <div class="fx" data-lang="sql">CREATE TABLE big_orders AS
SELECT g AS order_id,
       (random()*99999)::int + 1                      AS customer_id,
       timestamp '2023-01-01' + g * interval '47 seconds' AS created_at,  -- time-ordered
       CASE WHEN random() &lt; 0.90 THEN 'delivered'
            WHEN random() &lt; 0.7  THEN 'pending' ELSE 'cancelled' END AS status,
       round((random()*1000)::numeric, 2)             AS amount
FROM generate_series(1, 2000000) g;               -- 130 MB, 16,576 pages</div>
  <p>Without an index, "find customer 4242's orders" is a <strong>full table scan</strong> (Seq Scan): read every 8 KB page, test every row, keep 22 of 2,000,000. Cost is mostly <strong>pages read</strong>, not rows returned.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding "photosynthesis" in a textbook with no index: you read all 600 pages. The index at the back says "p. 212", and you read one page. A database index is exactly that: a sorted list of values with pointers to where the rows live.</p>
  </div>

  <h2 id="so-btree"><span class="num">02</span>How a B-tree Index Works</h2>
  <p>A <strong>B-tree</strong>, the default index, keeps column values <strong>sorted</strong> in a short, wide, <strong>balanced</strong> tree of pages. Leaves point to row locations.</p>
  <div class="fx" data-lang="text">                  [ 30000 | 60000 ]                   root: 1 page
           /              |               &#92;
   [10k|20k]         [40k|50k]          [70k|85k]      internal pages
      ...           /    |    &#92;            ...
            [4200..4250] ⇄ [4251..4300] ⇄ ...          leaves, linked in order
             4242 → (page 812, row 5)                  pointer into the table</div>
  <ul>
    <li><strong>Lookup</strong>: go root → leaf, one page per level. Each page holds hundreds of keys, so 2M rows need only 3–4 levels: <strong>O(log n)</strong>.</li>
    <li><strong>Balanced</strong>: every leaf is the same depth, so every lookup costs the same.</li>
    <li><strong>Sorted + linked leaves</strong>: ranges (<code>BETWEEN</code>, <code>&gt;</code>), <code>ORDER BY</code> and prefix <code>LIKE 'abc%'</code> just walk along the leaves.</li>
  </ul>

  <h2 id="so-before"><span class="num">03</span>Before / After: EXPLAIN ANALYZE</h2>
  <p><code>EXPLAIN</code> shows the plan the optimizer chose. <code>EXPLAIN ANALYZE</code> also <em>runs</em> it and adds real times and row counts. <code>BUFFERS</code> adds pages touched.</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM big_orders WHERE customer_id = 4242;</div>
  <div class="fx" data-lang="text">Seq Scan on big_orders  (cost=0.00..41576.00 rows=21 width=31) (actual time=0.079..116.108 rows=22 loops=1)
  Filter: (customer_id = 4242)
  Rows Removed by Filter: 1999978
  Buffers: shared hit=2464 read=14112          -- all 16,576 pages
Execution Time: 116.132 ms</div>
  <div class="fx" data-lang="sql">CREATE INDEX idx_orders_customer ON big_orders (customer_id);   -- 15 MB</div>
  <div class="fx" data-lang="text">Bitmap Heap Scan on big_orders  (cost=4.59..86.61 rows=21 width=31) (actual time=0.070..0.219 rows=22 loops=1)
  Recheck Cond: (customer_id = 4242)
  Buffers: shared hit=1 read=24                -- 25 pages
  -&gt;  Bitmap Index Scan on idx_orders_customer  (actual time=0.055..0.055 rows=22 loops=1)
        Index Cond: (customer_id = 4242)
Execution Time: 0.243 ms</div>
  <table class="tbl">
    <tr><th></th><th>No index</th><th>With index</th></tr>
    <tr><td>Pages read</td><td>16,576</td><td>25</td></tr>
    <tr><td>Time</td><td>116 ms</td><td>0.24 ms (~480× faster)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>EXPLAIN ANALYZE</code> really <em>executes</em> the query. Wrap an <code>UPDATE</code>/<code>DELETE</code> in <code>BEGIN … ROLLBACK</code>.</p>
  </div>

  <h2 id="so-design"><span class="num">04</span>Designing the Right Index</h2>
  <h3>Composite indexes and the leftmost-prefix rule</h3>
  <p>A <strong>composite index</strong> sorts by several columns: first by column 1, then by column 2 within ties.</p>
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
  <p>Normally the index finds row locations, then the database visits the table ("heap") for other columns. A <strong>covering index</strong> stores every column the query needs, so the table visit is skipped: an <strong>Index Only Scan</strong>.</p>
  <div class="fx" data-lang="sql">CREATE INDEX idx_orders_cust_cov ON big_orders (customer_id) INCLUDE (created_at, amount);
EXPLAIN (ANALYZE, BUFFERS) SELECT created_at, amount FROM big_orders WHERE customer_id = 4242;</div>
  <div class="fx" data-lang="text">Index Only Scan using idx_orders_cust_cov on big_orders  (actual time=0.097..0.112 rows=22 loops=1)
  Index Cond: (customer_id = 4242)
  Heap Fetches: 0                              -- never touched the table
  Buffers: shared hit=1 read=4                 -- 5 pages vs 25 before</div>
  <p><code>INCLUDE</code> columns ride along in the leaves, unsorted, so they're cheaper than extra key columns.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Index Only" still checks visibility. On a table not recently vacuumed, you'll see <code>Heap Fetches: 300000</code> and lose the benefit. <code>VACUUM</code> updates the visibility map that makes heap skips possible.</p>
  </div>

  <h3>Partial and expression indexes</h3>
  <ul>
    <li><strong>Partial index</strong>: index only rows matching a <code>WHERE</code>. Small and fast when queries always target a slice.</li>
    <li><strong>Expression index</strong>: index a computed value, e.g. <code>lower(email)</code>. The query must use the <em>same</em> expression.</li>
  </ul>
  <div class="fx" data-lang="sql">-- Ops dashboard only ever looks at pending orders (7% of rows)
CREATE INDEX idx_orders_pending ON big_orders (created_at) WHERE status = 'pending';
-- 3 MB, vs 43 MB for a full index on created_at
SELECT * FROM big_orders WHERE status = 'pending' AND created_at &gt;= '2025-12-01';
-- Index Scan using idx_orders_pending ... rows=2930, Execution Time: 1.199 ms

CREATE INDEX idx_cust_lower_email ON big_customers (lower(email));
SELECT * FROM big_customers WHERE lower(email) = 'user4242@mail.com';
-- Seq Scan 27.7 ms (even with a plain index on email) → Index Scan 0.039 ms</div>

  <h2 id="so-types"><span class="num">05</span>Other Index Types</h2>
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
  <p>Every index is a second copy of some data that must be kept in sync on every write.</p>
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
  <p>A predicate is <strong>sargable</strong> (Search-ARGument-able) if the index can be used for it. The rule: <strong>leave the indexed column bare</strong>; do the work on the constant side.</p>
  <table class="tbl">
    <tr><th>Problem</th><th>Non-sargable</th><th>Rewrite</th><th>Real result</th></tr>
    <tr><td>Function on column</td><td><code>date(created_at) = '2025-06-01'</code></td><td><code>created_at &gt;= '2025-06-01' AND created_at &lt; '2025-06-02'</code></td><td>172 ms → 0.40 ms</td></tr>
    <tr><td>Leading wildcard</td><td><code>email LIKE '%4242@Mail.com'</code></td><td>Anchor the start: <code>LIKE 'User4242@%'</code>, or a trigram GIN index</td><td>8.5 ms → 0.06 ms</td></tr>
    <tr><td>Implicit cast</td><td><code>customer_id = 4242.0</code> (int vs numeric)</td><td><code>customer_id = 4242</code> (match the type)</td><td>207 ms → 0.24 ms</td></tr>
    <tr><td>OR across columns</td><td><code>customer_id = 4242 OR amount &gt; 999.9</code></td><td>Index both (BitmapOr) or split into <code>UNION</code></td><td>205 ms → 0.65 ms</td></tr>
  </table>
  <ul>
    <li><strong>Implicit cast</strong>: the plan showed <code>Filter: ((customer_id)::numeric = 4242.0)</code>. The <em>column</em> was cast, row by row.</li>
    <li><strong>OR</strong>: one unindexed branch forces a Seq Scan. With both indexed, Postgres merges them (<code>BitmapOr</code>); other engines may need a <code>UNION</code>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Prefix <code>LIKE 'abc%'</code> uses a plain B-tree only under the "C" collation. Our DB uses <code>C.UTF-8</code>, and it did a Seq Scan until we created <code>(email text_pattern_ops)</code>.</p>
  </div>

  <h2 id="so-plan"><span class="num">08</span>Reading a Plan</h2>
  <p>Read a plan tree <strong>inside-out</strong> (most indented runs first). Each node: <code>(cost=… rows=estimate)</code> then <code>(actual time=first..last ms rows=actual loops=n)</code>.</p>
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
  <p>Estimate 43,786 vs actual 42,213: close, so the plan can be trusted.</p>

  <h3>Why the planner ignores your index</h3>
  <ul>
    <li><strong>Low selectivity</strong> (the filter keeps a big share of rows). <code>status = 'delivered'</code> matches 90% of rows, so the planner chose a Seq Scan despite an index. Even 3% (<code>cancelled</code>) touched 16,180 of 16,576 pages, because matches are spread everywhere.</li>
    <li><strong>Stale statistics</strong>: the planner estimates rows from stats sampled by <code>ANALYZE</code>. If data changed since, estimates are wrong.</li>
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
  <h3>OFFSET vs keyset pagination</h3>
  <p><code>OFFSET n</code> still reads and throws away n rows, so deep pages get slower and slower. <strong>Keyset</strong> (seek) pagination remembers the last key seen and jumps straight to it via the index.</p>
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
  <p>One query fetches N parents, then a loop runs <strong>one more query per parent</strong>. Each query is fast; N network round trips are not.</p>
  <div class="fx" data-lang="python"># N+1: 1 query + 100,000 more, one per customer
for cid in pd.read_sql("SELECT customer_id FROM big_customers", conn).customer_id:
    orders = pd.read_sql(f"SELECT * FROM big_orders WHERE customer_id = {cid}", conn)

# Fix: one set-based query
df = pd.read_sql("SELECT customer_id, count(*) AS n FROM big_orders GROUP BY customer_id", conn)</div>
  <p>ORMs (Django, SQLAlchemy) cause it silently through lazy loading: <code>for c in customers: c.orders</code>. Fix with eager loading (<code>select_related</code>, <code>prefetch_related</code>, <code>joinedload</code>) or an <code>IN (…)</code> batch.</p>

  <h2 id="so-scale"><span class="num">10</span>Partitioning &amp; Column Stores</h2>
  <h3>Partitioning</h3>
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

  <h2 id="so-rev"><span class="num">11</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Cost = pages read.</strong> Seq Scan reads all; an index reads a few.</li>
    <li><strong>B-tree</strong>: sorted, balanced, 3–4 levels for millions of rows; serves =, ranges, ORDER BY, prefix LIKE.</li>
    <li><strong>Composite</strong>: leftmost-prefix rule; equality columns first, range last.</li>
    <li><strong>Covering</strong> (<code>INCLUDE</code>) → Index Only Scan; needs a vacuumed table.</li>
    <li><strong>Partial</strong> for hot slices; <strong>expression</strong> index must match the query's expression.</li>
    <li><strong>GIN</strong> for JSONB/arrays/text, <strong>GiST</strong> for geo/ranges, <strong>BRIN</strong> for huge time-ordered tables.</li>
    <li>Indexes cost <strong>write speed and space</strong>; drop unused ones.</li>
    <li><strong>Sargable</strong>: keep the column bare: no functions, leading %, type mismatches; handle OR.</li>
    <li>Read plans inside-out; <strong>estimate vs actual</strong> gap → <code>ANALYZE</code>. Low selectivity → Seq Scan is correct.</li>
    <li><strong>Keyset</strong> beats OFFSET; batch instead of <strong>N+1</strong>; partition by date; column stores for analytics.</li>
  </ol></div>

  <h2 id="so-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
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
