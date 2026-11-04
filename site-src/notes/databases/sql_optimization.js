// notes/databases/sql_optimization.js — Indexes & Performance
Object.assign(TOPIC_CONTENT, {
  "sql_optimization": `<main>
  <h1>Indexes &amp; Performance</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Indexes &amp; Performance</span></div>
  <p class="lead">A query that is correct is not automatically fast. On a table of ten rows every query looks instant, but the same query on a million rows can take long enough to slow down a whole application, and in real work "this query is slow, fix it" is one of the most common jobs you will get. This page explains where the time goes, how an <strong>index</strong> removes most of that work, how to read the plan the database prints to prove what it did, and when an index does not help or even hurts. The running example is Asha's "My orders" screen on <strong>Biteful</strong>, the food-delivery company from <a class="xref" data-note="sql_relational">Relational Model</a> and <a class="xref" data-note="sql_joins">JOINs</a>: the same four tables, but grown to 100,000 customers and 1,000,000 orders, with customer 1 still being Asha. Every plan, size and timing below is real PostgreSQL 16 output from that database (parallel query is switched off so plans are easier to read); timings are approximate and will differ on your machine, but page counts and row counts will not.</p>

  <h2 id="so-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Indexes &amp; Performance</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Where time goes</div>
        <ul>
          <li>Tables live in 8 KB <b>pages</b>; cost ≈ pages touched</li>
          <li>The <b>heap</b> keeps rows in arrival order, not by any column</li>
          <li><b>Seq Scan</b> reads every page: cost grows with the table</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Indexes</div>
        <ul>
          <li><b>B-tree</b>: sorted keys + row addresses, 3–4 levels deep</li>
          <li><b>Composite (a, b)</b>: equality columns first, range last</li>
          <li><b>Covering / INCLUDE</b>: Index Only Scan, no heap visit</li>
          <li>GIN (contains), BRIN (huge ordered), partial, hash</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading plans</div>
        <ul>
          <li><b>EXPLAIN</b> = plan + estimates; <b>ANALYZE</b> runs it</li>
          <li><b>BUFFERS</b> = pages touched</li>
          <li>Read inside-out; compare estimated vs actual rows</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why an index is ignored</div>
        <ul>
          <li>Function or cast on the column (not <b>sargable</b>)</li>
          <li>Too many rows match: Seq Scan really is cheaper</li>
          <li>Stale <b>statistics</b> → wrong estimate → <code>ANALYZE</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Costs and app patterns</div>
        <ul>
          <li>Every index slows every write and uses space</li>
          <li><b>Partitioning</b> skips whole months; DROP beats DELETE</li>
          <li><b>Keyset</b> pagination beats OFFSET; avoid <b>N+1</b> loops</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="so-slow"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Queries Get Slow</span><span class="rm-sub">the same query on 10 rows and on a million</span></div></div>
      <div class="rm-item rm-done" data-target="so-scan"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pages, the Heap and the Full Scan</span><span class="rm-sub">what the database physically reads</span></div></div>
      <div class="rm-item rm-done" data-target="so-btree"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">B-tree Indexes</span><span class="rm-sub">a sorted copy you can search quickly</span></div></div>
      <div class="rm-item rm-done" data-target="so-explain"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Reading EXPLAIN</span><span class="rm-sub">seeing what the database actually did</span></div></div>
      <div class="rm-item rm-done" data-target="so-composite"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Composite Indexes</span><span class="rm-sub">two columns, and why their order matters</span></div></div>
      <div class="rm-item rm-done" data-target="so-cover"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Covering Indexes</span><span class="rm-sub">answering from the index alone</span></div></div>
      <div class="rm-item rm-done" data-target="so-sarg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sargability</span><span class="rm-sub">why a function on a column switches the index off</span></div></div>
      <div class="rm-item rm-done" data-target="so-stats"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Planner Statistics</span><span class="rm-sub">how the planner guesses, and what bad guesses cost</span></div></div>
      <div class="rm-item rm-done" data-target="so-types"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Other Index Types</span><span class="rm-sub">GIN, BRIN, partial and hash</span></div></div>
      <div class="rm-item rm-done" data-target="so-part"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Partitioning and Column Stores</span><span class="rm-sub">skipping whole months or whole columns</span></div></div>
      <div class="rm-item rm-done" data-target="so-cost"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">The Cost of Indexes</span><span class="rm-sub">what every extra index charges each write</span></div></div>
      <div class="rm-item rm-done" data-target="so-app"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Pagination and N+1</span><span class="rm-sub">slowness that no index can fix</span></div></div>
      <div class="rm-item rm-done" data-target="so-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the slips that show up in code review</span></div></div>
      <div class="rm-item rm-done" data-target="so-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, plan nodes, index types, rules</span></div></div>
      <div class="rm-item rm-done" data-target="so-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on indexing</span></div></div>
    </div>
  </div>

  <h2 id="so-slow"><span class="num">01</span>Why Queries Get Slow</h2>
  <p>When Asha opens the Biteful app and taps "My orders", the app sends one query: her orders, newest first. In the earlier notes Biteful had only 10 orders, and we only ever asked whether a query's answer was right. To see how long it takes, we put <code>EXPLAIN ANALYZE</code> in front of it. That asks PostgreSQL to run the query and report what it did and how long each step took; section 04 reads such reports line by line, so for now only look at the last line, <code>Execution Time</code>.</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Sort  (cost=1.15..1.16 rows=3 width=17) (actual time=0.058..0.059 rows=3 loops=1)
  Sort Key: ordered_at DESC
  Sort Method: quicksort  Memory: 25kB
  -&gt;  Seq Scan on orders  (cost=0.00..1.12 rows=3 width=17) (actual time=0.014..0.018 rows=3 loops=1)
        Filter: (customer_id = 1)
        Rows Removed by Filter: 7
Planning Time: 0.392 ms
Execution Time: 0.106 ms</div>
  <p>The whole query took well under a tenth of a millisecond. Now the same query, word for word, on Biteful after it has grown: 100,000 customers and 1,000,000 orders, one order every 30 seconds from March 2025 to February 2026. Asha is still customer 1, and at this size she has 12 orders.</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Sort  (cost=21845.19..21845.22 rows=11 width=18) (actual time=58.597..58.600 rows=12 loops=1)
  Sort Key: ordered_at DESC
  Sort Method: quicksort  Memory: 25kB
  -&gt;  Seq Scan on orders  (cost=0.00..21845.00 rows=11 width=18) (actual time=0.127..58.558 rows=12 loops=1)
        Filter: (customer_id = 1)
        Rows Removed by Filter: 999988
Planning Time: 0.343 ms
Execution Time: 58.645 ms</div>
  <p>Two lines tell the story. <code>Rows Removed by Filter: 999988</code> says the database looked at a million rows in order to keep 12. And <code>Execution Time</code> went from a few hundredths of a millisecond to tens of milliseconds, roughly in proportion to the size of the table. Asha's 12 rows did not become harder to return. The work grew with the <em>table</em>, not with the <em>answer</em>.</p>
  <p>Think of a shop that keeps every bill ever written in one big box, in the order the bills were written. With 10 bills, finding Asha's takes a glance. With a million bills, the clerk must pick up every single one, because nothing in the box tells him where Asha's are. He is not slow at reading bills; there are simply too many to read. A database without the right index is in exactly that position.</p>
  <p>Sixty milliseconds may not sound like much, but it is sixty milliseconds of a server's full attention. If a thousand people open "My orders" in the same second, that is a full minute of database work arriving every second, and the server falls behind. So <strong>query performance</strong>, which simply means how much work the database does to produce a result, matters as soon as a table grows. The important idea is that the SQL fixes the <em>answer</em>, but not the <em>work</em>: the same query can read almost nothing or the whole table, depending on how the data is stored and which indexes exist. This is also why a query that is fast on a developer's small test table can be painfully slow in production. The rest of the page is about controlling that work.</p>

  <h2 id="so-scan"><span class="num">02</span>Pages, the Heap and the Full Scan</h2>
  <p>"Looked at a million rows" is still vague. To reduce the work we need to know what the database physically reads. PostgreSQL stores each table as a file divided into fixed-size blocks of 8 KB called <strong>pages</strong>. A page is the smallest unit the database reads from disk or memory: to look at one row, it must fetch the whole page that holds it, just as you have to open a whole page of a register to read one line on it. New rows are simply placed wherever there is room, which in practice means in the order they arrive. This unordered collection of pages is called the <strong>heap</strong>. Every row has a physical address inside the heap, called its <strong>ctid</strong>, written as <code>(page number, slot on that page)</code>. Let us measure the orders table:</p>
  <div class="fx" data-lang="sql">SELECT relpages AS pages, reltuples::bigint AS rows,
       round(reltuples / relpages) AS rows_per_page,
       pg_size_pretty(pg_relation_size('orders')) AS size
FROM pg_class WHERE relname = 'orders' AND relnamespace = 'public'::regnamespace;</div>
  <div class="fx" data-lang="text"> pages |  rows   | rows_per_page | size
-------+---------+---------------+-------
  9345 | 1000000 |           107 | 73 MB
(1 row)</div>
  <p>About 107 orders fit on one page, so a million orders fill 9,345 pages, 73 MB in total. Now where are Asha's 12 orders? The hidden <code>ctid</code> column shows each row's address:</p>
  <div class="fx" data-lang="sql">SELECT ctid, order_id, ordered_at::date AS day FROM orders
WHERE customer_id = 1 ORDER BY ctid;</div>
  <div class="fx" data-lang="text">    ctid    | order_id |    day
------------+----------+------------
 (11,48)    |     1226 | 2025-03-10
 (742,77)   |    79479 | 2025-04-06
 (1122,42)  |   120112 | 2025-04-20
 (1214,2)   |   129916 | 2025-04-24
 (1466,32)  |   156911 | 2025-05-03
 (4124,20)  |   441353 | 2025-08-10
 (5315,19)  |   568802 | 2025-09-23
 (6113,18)  |   654206 | 2025-10-23
 (7286,21)  |   779734 | 2025-12-05
 (8370,104) |   895821 | 2026-01-15
 (8894,41)  |   951835 | 2026-02-03
 (9277,43)  |   992824 | 2026-02-17
(12 rows)</div>
  <p>Her 12 orders sit on 12 different pages, scattered from page 11 to page 9,277. The reason is that she ordered on 12 different days, and the heap stores rows in arrival order, so each of her orders landed among the thousands of orders placed that day by other people. Nothing in the heap groups rows by customer. The figure draws her pages to scale along the whole table.</p>
  <figure class="viz"><svg viewBox="0 0 640 120" width="640">
    <text x="0" y="14" font-size="11" class="tm">heap of orders: 9,345 pages in arrival (time) order; blue = a page holding one of Asha's orders</text>
    <rect x="0" y="24" width="640" height="34" class="fs" stroke="currentColor" stroke-opacity="0.3"/>
    <g class="fb sb"><rect x="1" y="24" width="4" height="34"/><rect x="51" y="24" width="4" height="34"/><rect x="77" y="24" width="4" height="34"/><rect x="83" y="24" width="4" height="34"/><rect x="100" y="24" width="4" height="34"/><rect x="282" y="24" width="4" height="34"/><rect x="364" y="24" width="4" height="34"/><rect x="418" y="24" width="4" height="34"/><rect x="499" y="24" width="4" height="34"/><rect x="573" y="24" width="4" height="34"/><rect x="609" y="24" width="4" height="34"/><rect x="635" y="24" width="4" height="34"/></g>
    <text x="0" y="76" font-size="10" class="tm">page 0 (Mar 2025)</text><text x="640" y="76" font-size="10" class="tm" text-anchor="end">page 9,344 (Feb 2026)</text>
    <text x="0" y="100" font-size="11">Without an index the only way to find the 12 blue pages is to open all 9,345.</text>
  </svg><figcaption>Asha's rows on pages 11, 742, 1122, 1214, 1466, 4124, 5315, 6113, 7286, 8370, 8894 and 9277. The heap has no order by customer.</figcaption></figure>
  <p>One more property of the heap will matter later. An UPDATE in PostgreSQL does not overwrite a row where it stands; it writes a new version of the row and marks the old version as dead. Here is order 110 on the original 10-order table before and after its amount changes:</p>
  <div class="fx" data-lang="sql">SELECT ctid, order_id, amount FROM orders WHERE order_id = 110;
UPDATE orders SET amount = 320 WHERE order_id = 110;
SELECT ctid, order_id, amount FROM orders WHERE order_id = 110;</div>
  <div class="fx" data-lang="text">  ctid  | order_id | amount
--------+----------+--------
 (0,10) |      110 | 310.00
(1 row)

  ctid  | order_id | amount
--------+----------+--------
 (0,11) |      110 | 320.00
(1 row)</div>
  <p>The row moved from slot (0,10) to slot (0,11). The old version stays in the page until <strong>VACUUM</strong>, PostgreSQL's background clean-up process, reclaims the space. Keeping old versions is how PostgreSQL lets one transaction keep reading the old value while another writes a new one (the <a class="xref" data-note="sql_transactions">Transactions</a> note explains this as MVCC). For performance it means two things: dead versions take space until VACUUM runs, and a ctid is not a stable identifier, so never use it as an id in an application.</p>
  <p>With only the heap, the database has exactly one way to answer <code>WHERE customer_id = 1</code>: open every page from the first to the last and test every row. This plan is called a <strong>sequential scan</strong>, shown as <code>Seq Scan</code>. Before running any query, a part of PostgreSQL called the <strong>planner</strong> (or optimizer) works out the possible ways to run it, estimates the cost of each, and picks the cheapest. Costs are measured in made-up units in which reading one page in order costs 1. The price list is visible as settings:</p>
  <div class="fx" data-lang="sql">SELECT current_setting('seq_page_cost') AS seq_page_cost,
       current_setting('random_page_cost') AS random_page_cost,
       current_setting('cpu_tuple_cost') AS cpu_tuple_cost,
       current_setting('cpu_operator_cost') AS cpu_operator_cost;</div>
  <div class="fx" data-lang="text"> seq_page_cost | random_page_cost | cpu_tuple_cost | cpu_operator_cost
---------------+------------------+----------------+-------------------
 1             | 4                | 0.01           | 0.0025
(1 row)</div>
  <p>A Seq Scan with one filter therefore costs <em>pages × 1</em> for reading the pages, plus <em>rows × 0.01</em> for handling each row, plus <em>rows × 0.0025</em> for evaluating the <code>=</code> on each row. For our table that is 9,345 + 10,000 + 2,500 = 21,845. Plain <code>EXPLAIN</code>, without ANALYZE, shows the planner's choice and its estimate without running the query:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT * FROM orders WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Seq Scan on orders  (cost=0.00..21845.00 rows=11 width=39)
  Filter: (customer_id = 1)</div>
  <p>The planner's figure, <code>cost=0.00..21845.00</code>, is exactly our hand calculation. The first number is the cost before the first row can come out (a scan can produce rows immediately, so 0); the second is the cost to finish. Notice that nothing in the formula depends on how many rows <em>match</em>. Asking for Asha's 12 orders costs the same as asking for everyone's. Adding <code>BUFFERS</code> to EXPLAIN ANALYZE counts the pages that were actually touched:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS) SELECT count(*) FROM orders WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Aggregate  (cost=21845.03..21845.04 rows=1 width=8) (actual time=57.823..57.824 rows=1 loops=1)
  Buffers: shared hit=2112 read=7233
  -&gt;  Seq Scan on orders  (cost=0.00..21845.00 rows=11 width=0) (actual time=0.126..57.805 rows=12 loops=1)
        Filter: (customer_id = 1)
        Rows Removed by Filter: 999988
        Buffers: shared hit=2112 read=7233
Planning:
  Buffers: shared hit=60
Planning Time: 0.258 ms
Execution Time: 57.892 ms</div>
  <p><code>Buffers: shared hit=… read=…</code> counts pages: <em>hit</em> means the page was already in PostgreSQL's memory cache, <em>read</em> means it had to be fetched from the operating system or the disk. Add the two and you get 9,345, every page of the table, in order to count 12 rows. If the table doubles, the cost and the time double too. That straight-line growth is the problem the rest of this page solves.</p>
  <p>Two words from this section are used constantly in performance work. <strong>Selectivity</strong> is the fraction of rows a condition keeps: Asha's 12 out of 1,000,000 is a selectivity of 0.0012%, which is very selective. A Seq Scan wastes almost all of its effort when a condition is this selective, and an index will help enormously. When a condition keeps most of the table, the Seq Scan is the right plan anyway. Also note that cost units are not milliseconds: compare the costs of different plans for the same query, never a cost with a time.</p>

  <h2 id="so-btree"><span class="num">03</span>B-tree Indexes</h2>
  <p>The heap is in arrival order, so the database cannot know where customer 1's rows are. Now imagine we kept, separately from the table, a copy of just the <code>customer_id</code> column, <em>sorted</em>, with each value carrying the ctid of its row. To find customer 1 we would no longer read the table at all; we would search the sorted list and get back exactly the 12 addresses we need. That separate sorted structure is an <strong>index</strong>.</p>
  <p>Why does sorting help so much? Think of the number-guessing game: a friend picks a number between 1 and 1,000, and you may only ask "is it bigger than X?". If you always ask about the middle of what is left, you need about 10 questions, not 1,000, because each answer throws away half of the possibilities. That halving only works because the numbers are in order. Searching a sorted index works the same way. Think also of the index at the back of a textbook: the words are listed alphabetically, each with the page numbers where it appears, so you find a word quickly and then turn straight to its pages instead of reading the whole book.</p>
  <p>A million sorted entries do not fit on one 8 KB page; they need over a thousand pages. So the index adds a few levels of "signpost" pages on top, each entry saying "keys from this value onwards are in that page below". This shape is called a <strong>B-tree</strong> (balanced tree), and it is the default index in PostgreSQL and almost every other relational database. The bottom level, the <strong>leaf pages</strong>, holds every key in sorted order with its ctids, and each leaf is linked to the next one. Above them are <strong>internal pages</strong> of signposts, and at the very top is a single <strong>root page</strong>, where every search starts. Let us create the index and look inside it with <code>pageinspect</code>, an extension that shows raw index pages (the small helper <code>k()</code> turns the raw bytes of an entry back into an integer):</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_customer_idx ON orders (customer_id);
SELECT pg_size_pretty(pg_relation_size('orders_customer_idx')) AS size,
       pg_relation_size('orders_customer_idx') / 8192 AS pages,
       root AS root_page, level AS root_level
FROM bt_metap('orders_customer_idx');</div>
  <div class="fx" data-lang="text">CREATE INDEX
  size   | pages | root_page | root_level
---------+-------+-----------+------------
 9088 kB |  1136 |       290 |          2
(1 row)</div>
  <p>The index is about 9 MB in 1,136 pages, and its root is page 290 at level 2. Levels count up from the leaves at 0, so this tree has three levels: root, internal, leaf. Now follow a search for Asha, key 1, exactly as the database does it. Start at the root:</p>
  <div class="fx" data-lang="sql">SELECT itemoffset AS entry, ctid AS child, k(data) AS keys_from
FROM bt_page_items('orders_customer_idx', 290);</div>
  <div class="fx" data-lang="text"> entry |  child  | keys_from
-------+---------+-----------
     1 | (3,0)   |
     2 | (289,1) |     25091
     3 | (575,1) |     50284
     4 | (860,1) |     75467
(4 rows)</div>
  <p>Read the root like a signboard. Entry 1 has no key, which means "from minus infinity", and it covers all keys below 25,091, which live under child page 3. Entry 2 covers 25,091 up to 50,283 under page 289, and so on. Key 1 is below 25,091, so the search goes to page 3:</p>
  <div class="fx" data-lang="sql">SELECT itemoffset AS entry, ctid AS child, k(data) AS keys_from
FROM bt_page_items('orders_customer_idx', 3) LIMIT 4;</div>
  <div class="fx" data-lang="text"> entry |  child  | keys_from
-------+---------+-----------
     1 | (286,1) |     25091
     2 | (1,0)   |
     3 | (2,1)   |        90
     4 | (4,1)   |       174
(4 rows)</div>
  <p>On an internal page that is not the rightmost one, entry 1 is a "high key", a note saying every key on this page is below 25,091; it is not followed. Entry 2 again starts at minus infinity and covers keys below 90, under leaf page 1. Key 1 is below 90, so the search goes to leaf page 1:</p>
  <div class="fx" data-lang="sql">SELECT itemoffset AS entry, k(data) AS key, tids AS row_addresses
FROM bt_page_items('orders_customer_idx', 1) LIMIT 3;</div>
  <div class="fx" data-lang="text"> entry | key |                                                                 row_addresses
-------+-----+------------------------------------------------------------------------------------------------------------------------------------------------
     1 |  90 |
     2 |   1 | {"(11,48)","(742,77)","(1122,42)","(1214,2)","(1466,32)","(4124,20)","(5315,19)","(6113,18)","(7286,21)","(8370,104)","(8894,41)","(9277,43)"}
     3 |   2 | {"(2322,98)","(2479,65)","(3110,92)","(3970,65)","(5489,42)","(6304,49)","(6676,12)","(6835,54)","(7091,47)","(7471,1)","(8753,46)"}
(3 rows)</div>
  <p>Entry 2 on the leaf is key 1 with a list of 12 row addresses, and they are exactly the 12 ctids we saw in the heap in section 02, from (11,48) to (9277,43). (PostgreSQL stores a repeated key once with a list of addresses, which is why the index is only 9 MB.) The whole search read 3 index pages, one per level, and fetching the rows will read 12 heap pages. That is 15 pages instead of 9,345.</p>
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
  </svg><figcaption>The real search for customer_id = 1: one page per level along the thick path, then one heap page per matching row.</figcaption></figure>
  <p>Why only three levels for a million rows? Each internal page holds a few hundred signposts, and each leaf holds dozens to hundreds of keys, so every extra level multiplies the reach by a few hundred. Three levels reach about a hundred thousand distinct keys here; four or five levels are enough for billions of rows. This slow growth is written <strong>O(log n)</strong>: when the table grows a thousand times, the search only gets one or two pages longer. The tree is called balanced because every leaf is at the same depth, so no search is unluckily long. And because the leaves are sorted and linked, the same index also answers range conditions (<code>BETWEEN</code>, <code>&lt;</code>, <code>&gt;</code>), <code>ORDER BY</code> on the indexed column, and prefix searches like <code>LIKE 'Ash%'</code>: the database finds the starting point once and then walks right along the leaves.</p>
  <p>A few facts about where indexes come from are worth knowing. Every PRIMARY KEY and UNIQUE constraint creates a B-tree index automatically, because the database needs it to check for duplicates quickly. A FOREIGN KEY does <em>not</em> create one, which is why <code>orders.customer_id</code> had no index until we made it, and why "add an index on the foreign key" is a very common fix.</p>
  <p>You will also hear the terms <strong>clustered</strong> and <strong>non-clustered</strong> index, especially for SQL Server and MySQL. In those systems (MySQL's InnoDB engine in particular), the table itself is stored as a B-tree sorted by the primary key: that is a clustered index, and a table can have only one, because rows can only be physically sorted one way. Other indexes are non-clustered: their leaves hold the primary key, so a lookup goes through the secondary index and then through the clustered one. PostgreSQL works differently: the table is always an unordered heap, and every index, including the primary key's, is a separate structure pointing at heap addresses, so in that vocabulary every PostgreSQL index is non-clustered. (PostgreSQL's <code>CLUSTER</code> command reorders a table once by an index, but the order is not maintained as new rows arrive.)</p>
  <p>An index only pays off when it lets the database skip most pages. If the matching rows are spread over nearly every page anyway, for example the 93% of orders whose status is "delivered", then walking the index and jumping to almost every heap page costs more than one smooth Seq Scan, and the planner correctly ignores the index. Section 08 shows this happening.</p>

  <h2 id="so-explain"><span class="num">04</span>Reading EXPLAIN and EXPLAIN ANALYZE</h2>
  <p>We built the index and traced the search by hand, but an index is useless if the planner does not choose it. The only way to know what the database really did is to read its plan. <code>EXPLAIN</code> prints the plan the planner chose, with its estimates, without running the query. <code>EXPLAIN ANALYZE</code> runs the query as well and adds real timings and row counts, and <code>BUFFERS</code> adds the pages touched. Think of a maps app: EXPLAIN is the route it suggests before you leave, based on its traffic estimates; EXPLAIN ANALYZE is driving that route with a stopwatch and a counter at every junction, so you can compare expected traffic with actual traffic. Here is Asha's screen now that the index exists:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Sort  (cost=47.71..47.73 rows=11 width=18) (actual time=0.229..0.231 rows=12 loops=1)
  Sort Key: ordered_at DESC
  Sort Method: quicksort  Memory: 25kB
  Buffers: shared hit=10 read=8
  -&gt;  Bitmap Heap Scan on orders  (cost=4.51..47.52 rows=11 width=18) (actual time=0.069..0.178 rows=12 loops=1)
        Recheck Cond: (customer_id = 1)
        Heap Blocks: exact=12
        Buffers: shared hit=7 read=8
        -&gt;  Bitmap Index Scan on orders_customer_idx  (cost=0.00..4.51 rows=11 width=0) (actual time=0.042..0.042 rows=12 loops=1)
              Index Cond: (customer_id = 1)
              Buffers: shared hit=3
Planning:
  Buffers: shared hit=95
Planning Time: 0.568 ms
Execution Time: 0.337 ms</div>
  <p>A plan is a tree of steps called <strong>nodes</strong>. Each node receives rows from the nodes indented beneath it (marked with <code>-&gt;</code>), does its job, and passes rows up to its parent. So a plan is read <strong>inside-out</strong>: the most deeply indented node runs first. Read this one from the bottom up. The <code>Bitmap Index Scan on orders_customer_idx</code> walks the B-tree for <code>customer_id = 1</code>, our three-page search (<code>Buffers: shared hit=3</code>), and collects the 12 row addresses into a bitmap, which is a checklist of heap pages to visit. Its bracket <code>(cost=0.00..4.51 rows=11 ...)</code> is the planner's guess before running: a tiny cost and about 11 rows. The second bracket <code>(actual time=… rows=12 loops=1)</code> is what really happened: the time to the first and last row in milliseconds, the real number of rows (12, so the guess of 11 was close), and how many times the node ran.</p>
  <p>Above it, the <code>Bitmap Heap Scan on orders</code> visits the pages on the checklist in physical order, each once (<code>Heap Blocks: exact=12</code>), and fetches the rows. <code>Recheck Cond</code> means it re-tests the condition on each fetched row; that is only needed when memory is short and the bitmap has to remember whole pages instead of exact rows, but the line is always printed. Finally <code>Sort</code> puts the 12 rows newest first, in memory. The total is about 15 to 20 pages instead of 9,345, and the execution time drops from tens of milliseconds to a fraction of a millisecond.</p>
  <p>Why a "bitmap" scan and not a plain index scan? A plain <strong>Index Scan</strong> walks the index and fetches each row from the heap immediately, in index order. That is ideal for very few rows, or when the index order itself is useful (for ORDER BY, as section 05 shows). For a moderate number of rows on scattered pages, PostgreSQL often prefers to collect all the addresses first, sort them by page and read each page once, which is the bitmap approach; it can also combine two indexes this way (BitmapAnd, BitmapOr). The scan nodes you will meet most often are these:</p>
  <table class="tbl">
    <tr><th>Node</th><th>What it does</th><th>When the planner chooses it</th></tr>
    <tr><td>Seq Scan</td><td>Reads every page of the table</td><td>No usable index, tiny table, or most rows are needed</td></tr>
    <tr><td>Index Scan</td><td>Walks the index, fetches each row from the heap</td><td>Few rows, or rows wanted in index order</td></tr>
    <tr><td>Bitmap Index Scan + Bitmap Heap Scan</td><td>Collects addresses, then reads pages in physical order</td><td>A moderate number of rows; combining indexes</td></tr>
    <tr><td>Index Only Scan</td><td>Answers from the index without visiting the table</td><td>The index holds every column the query needs (section 06)</td></tr>
  </table>
  <p>Bigger plans are read the same way. This report counts orders per city on Valentine's Day, joining orders to customers (the join algorithms were introduced in <a class="xref" data-note="sql_joins">JOINs</a>):</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE
SELECT c.city, count(*) FROM orders o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.ordered_at &gt;= '2026-02-14' AND o.ordered_at &lt; '2026-02-15'
GROUP BY c.city;</div>
  <div class="fx" data-lang="text">GroupAggregate  (cost=27490.42..27512.55 rows=4 width=15) (actual time=113.619..113.891 rows=4 loops=1)
  Group Key: c.city
  -&gt;  Sort  (cost=27490.42..27497.78 rows=2945 width=7) (actual time=113.506..113.654 rows=2880 loops=1)
        Sort Key: c.city
        Sort Method: quicksort  Memory: 147kB
        -&gt;  Hash Join  (cost=2968.00..27320.73 rows=2945 width=7) (actual time=110.369..113.027 rows=2880 loops=1)
              Hash Cond: (o.customer_id = c.customer_id)
              -&gt;  Seq Scan on orders o  (cost=0.00..24345.00 rows=2945 width=4) (actual time=76.898..78.415 rows=2880 loops=1)
                    Filter: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
                    Rows Removed by Filter: 997120
              -&gt;  Hash  (cost=1718.00..1718.00 rows=100000 width=11) (actual time=32.704..32.705 rows=100000 loops=1)
                    Buckets: 131072  Batches: 1  Memory Usage: 5420kB
                    -&gt;  Seq Scan on customers c  (cost=0.00..1718.00 rows=100000 width=11) (actual time=0.038..12.642 rows=100000 loops=1)
Planning Time: 0.807 ms
Execution Time: 115.222 ms</div>
  <p>Inside-out: the Seq Scan on orders reads every page and keeps one day's 2,880 orders (there is no index on <code>ordered_at</code> yet). Next to it, the Seq Scan on customers feeds a <strong>Hash</strong> node, which builds an in-memory lookup table of all 100,000 customers (about 5 MB). The <strong>Hash Join</strong> then looks up each of the 2,880 orders in that table. <strong>Sort</strong> orders the joined rows by city, and <strong>GroupAggregate</strong> counts each run of equal cities. To find the expensive step, look at the <code>actual time</code> of each node: almost all of the time is spent in the Seq Scan on orders, so an index on <code>ordered_at</code> is the fix (section 07 adds one).</p>
  <p>The most useful habit when reading any plan is to compare, for each node, the <strong>estimated rows</strong> (<code>rows=</code> in the first bracket) with the <strong>actual rows</strong> (<code>rows=</code> in the second). When they are close, the planner understood the data and its choices are probably sensible. When they differ by ten times or more, the plan was chosen for data that does not exist, and that node is where to start investigating (section 08).</p>
  <p>One warning: EXPLAIN ANALYZE really executes the statement. On an UPDATE or DELETE it changes data, so wrap it in a transaction and roll it back:</p>
  <div class="fx" data-lang="sql">BEGIN;
EXPLAIN ANALYZE DELETE FROM order_items WHERE order_id = 101;
ROLLBACK;</div>
  <div class="fx" data-lang="text">Delete on order_items  (cost=0.42..8.44 rows=0 width=0) (actual time=0.080..0.080 rows=0 loops=1)
  -&gt;  Index Scan using order_items_pkey on order_items  (cost=0.42..8.44 rows=1 width=6) (actual time=0.047..0.048 rows=1 loops=1)
        Index Cond: (order_id = 101)
Planning Time: 0.389 ms
Execution Time: 0.148 ms</div>
  <p>The plan shows the delete happening (it found the row through the primary key index of <code>order_items</code>), but because of the ROLLBACK the row is still there afterwards:</p>
  <div class="fx" data-lang="sql">SELECT count(*) FROM order_items WHERE order_id = 101;</div>
  <div class="fx" data-lang="text"> count
-------
     1
(1 row)</div>

  <h2 id="so-composite"><span class="num">05</span>Composite Indexes and Column Order</h2>
  <p>The index on <code>customer_id</code> finds Asha's 12 rows quickly, but the plan still needed a Sort node to put them newest first. And suppose the screen also has a filter "orders since 1 January": with an index on customer_id alone, the database must fetch all of Asha's rows and then test each date one by one. The screen is really asking two things at once, <em>this customer</em> and <em>by date</em>. One index can answer both.</p>
  <p>A <strong>composite index</strong> (or multi-column index) is an index on two or more columns. Its entries are sorted by the first column, and only among entries with the same first value are they sorted by the second. Think of a phone book sorted by surname and then by first name. Finding "Sharma, Asha" is instant. Finding all the Sharmas is instant, because they are together. But finding everyone whose first name is Asha means reading the whole book, because first names are only in order <em>within</em> each surname. An index on <code>(customer_id, ordered_at)</code> works exactly like that phone book, as the figure shows for the first few customers.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="0" y="14" font-size="11" class="tm">index (customer_id, ordered_at), entries in sorted order:</text>
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
    <text x="230" y="74" text-anchor="middle" font-size="11" class="tb">customer 1 since 2026-01-01 → one contiguous slice, already in date order</text>
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
    <text x="300" y="140" text-anchor="middle" font-size="11" class="tr">"January 2026" for everyone → matches scattered across every customer → no place to jump to</text>
  </svg><figcaption>The second column is sorted only within each value of the first. That is the leftmost-prefix rule.</figcaption></figure>
  <p>Customer 1's entries since 1 January form one unbroken slice that is already in date order, so the database can jump to the end of that slice and read backwards to get newest-first with no sorting at all. But "all orders in January 2026, for everyone" is scattered across every customer's slice, so the index offers no single place to start. This gives the <strong>leftmost-prefix rule</strong>: an index on <code>(a, b)</code> can be searched by <code>a</code> alone, by <code>a</code> and <code>b</code> together, or by <code>a</code> plus a range on <code>b</code>, but not by <code>b</code> alone. Let us create the composite index and drop the single-column one, which becomes redundant because customer_id is the leftmost column of the new index:</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_cust_time_idx ON orders (customer_id, ordered_at);
DROP INDEX orders_customer_idx;
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 AND ordered_at &gt;= '2026-01-01'
ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Index Scan Backward using orders_cust_time_idx on orders  (cost=0.42..12.46 rows=2 width=18) (actual time=0.018..0.024 rows=3 loops=1)
  Index Cond: ((customer_id = 1) AND (ordered_at &gt;= '2026-01-01 00:00:00+05:30'::timestamp with time zone))
  Buffers: shared hit=4 read=3
Planning:
  Buffers: shared hit=78 read=1 dirtied=1
Planning Time: 0.337 ms
Execution Time: 0.060 ms</div>
  <p><code>Index Scan Backward</code> means the database jumped to the end of Asha's 2026 slice and walked the leaves backwards, so rows came out newest first and there is <strong>no Sort node</strong>. Both conditions appear in <code>Index Cond</code>, which means both narrowed the search inside the index itself; only seven pages were touched. The leading column alone still uses the index:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Bitmap Heap Scan on orders  (cost=4.51..47.52 rows=11 width=18) (actual time=0.032..0.079 rows=12 loops=1)
  Recheck Cond: (customer_id = 1)
  Heap Blocks: exact=12
  Buffers: shared hit=15
  -&gt;  Bitmap Index Scan on orders_cust_time_idx  (cost=0.00..4.51 rows=11 width=0) (actual time=0.024..0.024 rows=12 loops=1)
        Index Cond: (customer_id = 1)
        Buffers: shared hit=3
Planning:
  Buffers: shared hit=90
Planning Time: 0.432 ms
Execution Time: 0.169 ms</div>
  <p>But the second column alone cannot, exactly as the phone book predicted:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, customer_id FROM orders
WHERE ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15';</div>
  <div class="fx" data-lang="text">Seq Scan on orders  (cost=0.00..24345.00 rows=2945 width=8) (actual time=72.337..74.086 rows=2880 loops=1)
  Filter: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
  Rows Removed by Filter: 997120
  Buffers: shared hit=2312 read=7033
Planning:
  Buffers: shared hit=90
Planning Time: 1.061 ms
Execution Time: 74.307 ms</div>
  <p>Asking for one day's orders without a customer falls back to a Seq Scan over every page, because one day's orders are spread across all 100,000 customer slices of the index.</p>
  <p>Does the order of the columns really matter, if the index contains the same two columns either way? We can measure it. An index on <code>(ordered_at, customer_id)</code> is sorted by time first, so "since 1 January" picks one large slice containing every customer's orders since then, and customer 1's rows are sprinkled through it. To force the planner to use the reversed index, we hide the good index inside a transaction (index changes in PostgreSQL are transactional, so ROLLBACK brings it back):</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_time_cust_idx ON orders (ordered_at, customer_id);
BEGIN;
DROP INDEX orders_cust_time_idx;           -- hide the good index, inside a transaction
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 AND ordered_at &gt;= '2026-01-01'
ORDER BY ordered_at DESC;
ROLLBACK;                                  -- the good index comes back
DROP INDEX orders_time_cust_idx;</div>
  <div class="fx" data-lang="text">Index Scan Backward using orders_time_cust_idx on orders  (cost=0.42..3608.89 rows=2 width=18) (actual time=0.435..6.764 rows=3 loops=1)
  Index Cond: ((ordered_at &gt;= '2026-01-01 00:00:00+05:30'::timestamp with time zone) AND (customer_id = 1))
  Buffers: shared hit=6 read=557
Planning:
  Buffers: shared hit=74 read=1
Planning Time: 0.317 ms
Execution Time: 6.802 ms</div>
  <p>The answer is the same three rows, but the reversed index can only <em>seek</em> on <code>ordered_at</code>; the condition <code>customer_id = 1</code> has to be checked on every index entry since 1 January, which is roughly 140,000 entries. Buffers jump from 7 to over 500 and the time grows many times. The rule that follows is short: <strong>put columns tested with equality first, and the range or sort column last</strong>. With <code>(customer_id, ordered_at)</code> the equality picks one customer's small slice and the range trims it; reversed, the range picks a huge slice and the equality filters inside it.</p>
  <p>A common alternative is to create one single-column index per column and hope the database combines them. PostgreSQL can combine two indexes with a BitmapAnd, but that is slower than one composite index shaped for the query, and it can never deliver rows already sorted for <code>ORDER BY … LIMIT</code>. Also remember that an index on <code>(a, b)</code> makes a separate index on <code>(a)</code> unnecessary, but it does not replace an index on <code>(b)</code>.</p>

  <h2 id="so-cover"><span class="num">06</span>Covering Indexes and Index-Only Scans</h2>
  <p>Every index lookup we have seen is two trips: first the index gives a row address, then the heap page gives the other columns. Asha's screen shows <code>order_id</code> and <code>amount</code>, which are not in the index, so each of her 12 orders still costs a visit to a different heap page, and that second trip is most of the remaining work. If every column the query needs were already inside the index, the heap could be skipped completely.</p>
  <p>An index that contains every column a query reads is called a <strong>covering index</strong> for that query. Columns that are only <em>returned</em>, not searched or sorted on, can be added with <code>INCLUDE</code>: they are stored in the leaf entries but are not part of the sort order, which keeps the upper levels of the tree small. Think of a library catalogue card that also prints each book's price and year: if price and year are all you wanted, you never walk to the shelf.</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_cust_time_cov ON orders (customer_id, ordered_at) INCLUDE (order_id, amount);
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Index Only Scan Backward using orders_cust_time_cov on orders  (cost=0.42..4.62 rows=11 width=18) (actual time=0.029..0.031 rows=12 loops=1)
  Index Cond: (customer_id = 1)
  Heap Fetches: 0
  Buffers: shared hit=1 read=3
Planning:
  Buffers: shared hit=91 read=1 dirtied=5
Planning Time: 0.369 ms
Execution Time: 0.062 ms</div>
  <p><code>Index Only Scan</code> with <code>Heap Fetches: 0</code> means the table was never read: the whole answer came from about four index pages. There is a catch, though, and it comes from the row versions of section 02. An index entry does not know whether the row version it points to is visible to the current transaction; only the heap knows that. So PostgreSQL keeps a small <strong>visibility map</strong>, one bit per heap page, meaning "every row on this page is visible to everyone". When the bit is set, an index-only scan may trust the index; when it is not set, the scan must visit the heap page to check. VACUUM is what sets these bits. Watch what happens after touching Asha's 12 rows with an UPDATE that changes nothing:</p>
  <div class="fx" data-lang="sql">UPDATE orders SET amount = amount WHERE customer_id = 1;
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Index Only Scan Backward using orders_cust_time_cov on orders  (cost=0.42..4.62 rows=11 width=18) (actual time=0.013..0.069 rows=12 loops=1)
  Index Cond: (customer_id = 1)
  Heap Fetches: 24
  Buffers: shared hit=28
Planning:
  Buffers: shared hit=20
Planning Time: 0.084 ms
Execution Time: 0.083 ms</div>
  <p>Heap Fetches jumped from 0 to 24. The 12 updated heap pages lost their "all visible" bit, and because <code>amount</code> is stored in the index, each UPDATE also added a new index entry, so the index now holds 24 entries for Asha (12 for the dead old versions and 12 for the new ones), and every one has to be checked against its heap page. Running VACUUM removes the dead versions and sets the bits again:</p>
  <div class="fx" data-lang="sql">VACUUM orders;
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at, amount FROM orders
WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Index Only Scan Backward using orders_cust_time_cov on orders  (cost=0.42..8.62 rows=11 width=18) (actual time=0.026..0.028 rows=12 loops=1)
  Index Cond: (customer_id = 1)
  Heap Fetches: 0
  Buffers: shared hit=4
Planning:
  Buffers: shared hit=57
Planning Time: 0.293 ms
Execution Time: 0.072 ms</div>
  <p>Back to <code>Heap Fetches: 0</code>. Autovacuum normally keeps the visibility map up to date in the background, but on a table with heavy updates where autovacuum falls behind, you will see high Heap Fetches and the covering index quietly stops saving work. The other way to lose the benefit is to ask for columns the index does not have. <code>SELECT *</code> needs every column, so it can never be covered:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT * FROM orders WHERE customer_id = 1 ORDER BY ordered_at DESC;</div>
  <div class="fx" data-lang="text">Sort  (cost=47.71..47.73 rows=11 width=39)
  Sort Key: ordered_at DESC
  -&gt;  Bitmap Heap Scan on orders  (cost=4.51..47.52 rows=11 width=39)
        Recheck Cond: (customer_id = 1)
        -&gt;  Bitmap Index Scan on orders_cust_time_cov  (cost=0.00..4.51 rows=11 width=0)
              Index Cond: (customer_id = 1)</div>
  <p>The same index is used, but only to find the rows; the plan goes back to a Bitmap Heap Scan that reads the heap. Naming exactly the columns a screen needs is the difference between "index only" and "index plus heap".</p>

  <h2 id="so-sarg"><span class="num">07</span>Sargability</h2>
  <p>A report needs all orders placed on 14 February 2026. We add a B-tree index on <code>ordered_at</code>, and the natural way to write the condition is "the date part of ordered_at equals 14 February":</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_time_idx ON orders (ordered_at);
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM orders WHERE ordered_at::date = '2026-02-14';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=24357.50..24357.51 rows=1 width=8) (actual time=105.889..105.891 rows=1 loops=1)
  Buffers: shared hit=2547 read=6798
  -&gt;  Seq Scan on orders  (cost=0.00..24345.00 rows=5000 width=0) (actual time=103.655..105.714 rows=2880 loops=1)
        Filter: ((ordered_at)::date = '2026-02-14'::date)
        Rows Removed by Filter: 997120
        Buffers: shared hit=2547 read=6798
Planning:
  Buffers: shared hit=90 read=1 dirtied=2
Planning Time: 0.394 ms
Execution Time: 105.942 ms</div>
  <p>A Seq Scan over every page, even though a perfect index exists. The reason lies in what the index is sorted by: the raw timestamps, such as 2026-02-13 23:59:30, 2026-02-14 00:00:00, 2026-02-14 00:00:30 and so on. The condition asks about <code>ordered_at::date</code>, a value computed from each row, and the index has no list of computed dates. To answer, the database must compute the date of every row and compare it, which means reading every row. Now ask the same question as a range of raw timestamps:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM orders
WHERE ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=106.69..106.70 rows=1 width=8) (actual time=0.470..0.471 rows=1 loops=1)
  Buffers: shared hit=3 read=9
  -&gt;  Index Only Scan using orders_time_idx on orders  (cost=0.42..99.33 rows=2945 width=0) (actual time=0.026..0.320 rows=2880 loops=1)
        Index Cond: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
        Heap Fetches: 0
        Buffers: shared hit=3 read=9
Planning:
  Buffers: shared hit=131 read=3
Planning Time: 0.507 ms
Execution Time: 0.523 ms</div>
  <p>The same 2,880 orders, now found with an index range read of about a dozen pages in under a millisecond. The two conditions mean exactly the same thing to a human; the difference is only in their <em>shape</em>. A condition is called <strong>sargable</strong> (from "Search ARGument ABLE") when an index can be used to find the matching rows, which in practice means the indexed column appears <em>bare</em> on one side of a comparison the index understands (<code>=</code>, <code>&lt;</code>, <code>&gt;</code>, BETWEEN, a prefix LIKE). Think of a dictionary, which is sorted by the word. "Words starting with <em>ma</em>" is quick to find. "Words whose last letter is <em>a</em>" means reading the whole dictionary, even though it is the same book. Wrapping a column in a function turns the first kind of question into the second. The rule is: leave the column alone and do the work on the constant side. (The half-open range <code>&gt;= day AND &lt; next day</code> is also safer than BETWEEN, which would include midnight of the next day, as <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a> showed.)</p>
  <p>Text has the same problem. Users type "asha", "Asha" or "ASHA", so a login query lowercases the column before comparing, and an ordinary index on <code>name</code> cannot help, because it stores "Asha", not "asha":</p>
  <div class="fx" data-lang="sql">CREATE INDEX customers_name_idx ON customers (name);
EXPLAIN ANALYZE SELECT customer_id FROM customers WHERE lower(name) = 'asha';</div>
  <div class="fx" data-lang="text">Seq Scan on customers  (cost=0.00..2218.00 rows=500 width=4) (actual time=0.032..42.360 rows=1 loops=1)
  Filter: (lower(name) = 'asha'::text)
  Rows Removed by Filter: 99999
Planning Time: 0.267 ms
Execution Time: 42.390 ms</div>
  <p>Here we cannot move the function to the other side, because the stored names have mixed case. The solution is an <strong>expression index</strong>, which indexes the result of the expression itself. The query must then use exactly the same expression:</p>
  <div class="fx" data-lang="sql">CREATE INDEX customers_lower_name_idx ON customers (lower(name));
EXPLAIN ANALYZE SELECT customer_id FROM customers WHERE lower(name) = 'asha';</div>
  <div class="fx" data-lang="text">Bitmap Heap Scan on customers  (cost=8.17..699.61 rows=500 width=4) (actual time=0.020..0.021 rows=1 loops=1)
  Recheck Cond: (lower(name) = 'asha'::text)
  Heap Blocks: exact=1
  -&gt;  Bitmap Index Scan on customers_lower_name_idx  (cost=0.00..8.04 rows=500 width=0) (actual time=0.015..0.015 rows=1 loops=1)
        Index Cond: (lower(name) = 'asha'::text)
Planning Time: 0.270 ms
Execution Time: 0.045 ms</div>
  <p>From a Seq Scan of 100,000 names to an index lookup of one row. Two more ways of hiding a column are common in real code:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT order_id FROM orders WHERE customer_id + 0 = 1;
EXPLAIN SELECT customer_id FROM customers WHERE name LIKE '%Kapoor';</div>
  <div class="fx" data-lang="text">Seq Scan on orders  (cost=0.00..24345.00 rows=5000 width=4)
  Filter: ((customer_id + 0) = 1)
Seq Scan on customers  (cost=0.00..1968.00 rows=6396 width=4)
  Filter: (name ~~ '%Kapoor'::text)</div>
  <p>Arithmetic on the column (<code>customer_id + 0</code>) is a function too, so the index is ignored; move the arithmetic to the constant. And a LIKE pattern that <em>starts</em> with <code>%</code> has no fixed beginning to jump to, just like the "last letter" dictionary question, so a B-tree cannot help; section 09 shows a different kind of index that can. The same trap appears with type conversions: if the column has to be converted to compare it with a value of another type, the conversion is a function on the column, and the plan will show it inside a <code>Filter</code>. Whenever an index is ignored, look at the condition in the plan and check whether the column is still bare.</p>
  <table class="tbl">
    <tr><th>Not sargable</th><th>Sargable rewrite</th></tr>
    <tr><td><code>ordered_at::date = '2026-02-14'</code></td><td><code>ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15'</code></td></tr>
    <tr><td><code>lower(name) = 'asha'</code> with an index on name</td><td>an expression index <code>ON (lower(name))</code></td></tr>
    <tr><td><code>customer_id + 0 = 1</code></td><td><code>customer_id = 1</code></td></tr>
    <tr><td><code>name LIKE '%Kapoor'</code></td><td>anchor the start if possible, otherwise a trigram GIN index</td></tr>
  </table>

  <h2 id="so-stats"><span class="num">08</span>Planner Statistics</h2>
  <p>Sargable conditions make an index <em>usable</em>. Whether the planner actually <em>uses</em> it depends on how many rows it expects the condition to return, and every plan so far started with such a guess (<code>rows=11</code>, <code>rows=2945</code>) before a single row had been read. Those guesses come from <strong>planner statistics</strong>: small summaries of each column that the <code>ANALYZE</code> command collects by reading a random sample of the table (autovacuum runs it in the background, and you can run it by hand). For each column it stores the fraction of NULLs, the number of distinct values, the most common values with their frequencies, and a histogram describing the rest. They are visible in <code>pg_stats</code>:</p>
  <div class="fx" data-lang="sql">SELECT attname, n_distinct, most_common_vals, most_common_freqs
FROM pg_stats WHERE schemaname = 'public' AND tablename = 'orders' AND attname = 'status';</div>
  <div class="fx" data-lang="text"> attname | n_distinct |       most_common_vals        |          most_common_freqs
---------+------------+-------------------------------+--------------------------------------
 status  |          3 | {delivered,cancelled,pending} | {0.9328667,0.058066666,0.0090666665}
(1 row)</div>
  <p>The planner believes about 0.9% of orders are pending. With a million rows, it therefore expects about 0.0090666 × 1,000,000 ≈ 9,067 pending orders. Let us add an index on status and see how that estimate drives the choice of plan:</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_status_idx ON orders (status);
EXPLAIN SELECT order_id FROM orders WHERE status = 'pending';
EXPLAIN SELECT order_id FROM orders WHERE status = 'delivered';</div>
  <div class="fx" data-lang="text">Index Scan using orders_status_idx on orders  (cost=0.42..6092.07 rows=9067 width=4)
  Index Cond: (status = 'pending'::text)
Seq Scan on orders  (cost=0.00..21845.00 rows=932867 width=4)
  Filter: (status = 'delivered'::text)</div>
  <p>The estimate <code>rows=9067</code> is our hand calculation. For the rare value "pending" the planner uses the index. For "delivered", which matches 93% of the table, it chooses a Seq Scan <strong>even though the index exists</strong>. That is the planner being right: almost every page contains at least one delivered order, so going through the index would still visit every heap page, and in random order, plus the index pages on top. This is the low-selectivity case from section 03, and it is why "the index exists but is not used" is not always a bug.</p>
  <p>The dangerous case is when the statistics are out of date. Suppose Biteful runs a ₹199 combo promotion and 300,000 orders of exactly ₹199.00 arrive before the statistics are refreshed. We reproduce it on a copy of the orders table with automatic analyzing switched off, so its statistics still describe the table before the promotion:</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_promo AS SELECT * FROM orders;
ALTER TABLE orders_promo SET (autovacuum_enabled = false);
ANALYZE orders_promo;
-- the promotion: 300,000 orders of exactly 199.00 arrive after the last ANALYZE
INSERT INTO orders_promo
SELECT 1000000 + g, 1 + (g % 100000), 10 + (g % 2000),
       timestamptz '2026-02-21' + g * interval '1 second', 'delivered', 199, 30
FROM generate_series(1, 300000) g;
EXPLAIN ANALYZE
SELECT c.city, count(*) FROM orders_promo o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.amount = 199 GROUP BY c.city;</div>
  <div class="fx" data-lang="text">GroupAggregate  (cost=28518.49..28518.61 rows=4 width=15) (actual time=594.431..631.116 rows=5 loops=1)
  Group Key: c.city
  -&gt;  Sort  (cost=28518.49..28518.52 rows=10 width=7) (actual time=580.901..608.999 rows=300007 loops=1)
        Sort Key: c.city
        Sort Method: external merge  Disk: 3256kB
        -&gt;  Nested Loop  (cost=0.29..28518.33 rows=10 width=7) (actual time=53.825..527.344 rows=300007 loops=1)
              -&gt;  Seq Scan on orders_promo o  (cost=0.00..28435.22 rows=10 width=4) (actual time=53.778..170.606 rows=300007 loops=1)
                    Filter: (amount = '199'::numeric)
                    Rows Removed by Filter: 999993
              -&gt;  Index Scan using customers_pkey on customers c  (cost=0.29..8.31 rows=1 width=11) (actual time=0.001..0.001 rows=1 loops=300007)
                    Index Cond: (customer_id = o.customer_id)
Planning Time: 0.445 ms
Execution Time: 631.485 ms</div>
  <p>Find the node where estimate and reality disagree. The Seq Scan on orders_promo expected <code>rows=10</code>, because according to the old statistics ₹199.00 is one rare amount among a hundred thousand different ones, but it produced 300,007 rows. Every decision above that node was made for 10 rows. A <strong>Nested Loop</strong> join, which looks up each order's customer one at a time through the customers primary key, is a fine plan for 10 rows, but here it ran 300,007 lookups (<code>loops=300007</code>), and the sort, sized for 10 rows, spilled to disk. Now refresh the statistics and run the identical query:</p>
  <div class="fx" data-lang="sql">ANALYZE orders_promo;
EXPLAIN ANALYZE
SELECT c.city, count(*) FROM orders_promo o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.amount = 199 GROUP BY c.city;</div>
  <div class="fx" data-lang="text">HashAggregate  (cost=33716.84..33716.88 rows=4 width=15) (actual time=346.079..346.084 rows=5 loops=1)
  Group Key: c.city
  Batches: 1  Memory Usage: 24kB
  -&gt;  Hash Join  (cost=2968.00..32216.64 rows=300040 width=7) (actual time=108.307..296.476 rows=300007 loops=1)
        Hash Cond: (o.customer_id = c.customer_id)
        -&gt;  Seq Scan on orders_promo o  (cost=0.00..28461.00 rows=300040 width=4) (actual time=72.986..182.298 rows=300007 loops=1)
              Filter: (amount = '199'::numeric)
              Rows Removed by Filter: 999993
        -&gt;  Hash  (cost=1718.00..1718.00 rows=100000 width=11) (actual time=34.740..34.741 rows=100000 loops=1)
              Buckets: 131072  Batches: 1  Memory Usage: 5420kB
              -&gt;  Seq Scan on customers c  (cost=0.00..1718.00 rows=100000 width=11) (actual time=0.015..13.173 rows=100000 loops=1)
Planning Time: 0.544 ms
Execution Time: 346.162 ms</div>
  <p>The estimate is now close to 300,000, so the planner builds one hash table of customers and streams all the orders through it: a Hash Join and an in-memory HashAggregate, and the query runs about twice as fast. Nothing changed except the statistics. Think of a cab app that believes a road is empty because its traffic data is from last night: its route is perfect for the data it has and terrible for the jam you are actually in. ANALYZE refreshes the traffic data.</p>
  <p>This gives a practical debugging recipe. Run EXPLAIN ANALYZE, and find the lowest node where estimated and actual rows differ by ten times or more: that is where the plan went wrong. The first fix is to run <code>ANALYZE</code> on the table, and after any bulk load or large batch update you should run it yourself rather than wait for autovacuum. If the estimate is still wrong, the usual causes are a very skewed column (raise its statistics target so ANALYZE stores more detail), two columns whose values are related, like city and postcode (<code>CREATE STATISTICS</code> lets the planner learn the relationship), or a non-sargable condition that the planner cannot estimate.</p>

  <h2 id="so-types"><span class="num">09</span>Other Index Types</h2>
  <p>A B-tree answers questions of the form "where in this sorted line does my value, or my range, begin?". Some questions do not have that shape, such as "which names contain kapoor?", and some tables are so large, or queried in such a narrow way, that a full B-tree is wasteful. PostgreSQL offers other kinds of index, called <strong>access methods</strong>, for these cases.</p>
  <p>A <strong>GIN</strong> index (Generalized INverted index) stores, for each small piece of a value, the list of rows containing that piece. It is literally the index at the back of a textbook, which maps each word to every page it appears on. For text search with the <code>pg_trgm</code> extension, the pieces are <strong>trigrams</strong>, every three-letter chunk of the text:</p>
  <div class="fx" data-lang="sql">SELECT show_trgm('Kapoor') AS trigrams;</div>
  <div class="fx" data-lang="text">              trigrams
-------------------------------------
 {"  k"," ka",apo,kap,oor,"or ",poo}
(1 row)</div>
  <p>A search for names containing "kapoor" becomes "rows that contain all of kap, apo, poo and oor", which the GIN index answers by intersecting its lists. Without it, the search is a Seq Scan of every customer:</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE SELECT count(*) FROM customers WHERE name ILIKE '%kapoor%';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=1983.99..1984.00 rows=1 width=8) (actual time=40.542..40.543 rows=1 loops=1)
  -&gt;  Seq Scan on customers  (cost=0.00..1968.00 rows=6396 width=0) (actual time=0.023..40.180 rows=6602 loops=1)
        Filter: (name ~~* '%kapoor%'::text)
        Rows Removed by Filter: 93398
Planning Time: 0.486 ms
Execution Time: 40.608 ms</div>
  <div class="fx" data-lang="sql">CREATE INDEX customers_name_trgm ON customers USING gin (name gin_trgm_ops);
EXPLAIN ANALYZE SELECT count(*) FROM customers WHERE name ILIKE '%kapoor%';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=885.82..885.83 rows=1 width=8) (actual time=6.229..6.230 rows=1 loops=1)
  -&gt;  Bitmap Heap Scan on customers  (cost=71.88..869.83 rows=6396 width=0) (actual time=1.313..5.885 rows=6602 loops=1)
        Recheck Cond: (name ~~* '%kapoor%'::text)
        Heap Blocks: exact=718
        -&gt;  Bitmap Index Scan on customers_name_trgm  (cost=0.00..70.28 rows=6396 width=0) (actual time=1.191..1.191 rows=6602 loops=1)
              Index Cond: (name ~~* '%kapoor%'::text)
Planning Time: 0.511 ms
Execution Time: 6.282 ms</div>
  <p>The GIN index turns the scan of 100,000 names into a Bitmap Index Scan. The gain here is moderate, because about one customer in fifteen really is a Kapoor and the database still has to visit many heap pages to fetch them; for a rarer search term the difference is far larger. GIN indexes are also how PostgreSQL indexes JSONB documents, arrays and full-text search. Their weakness is that they are expensive to update, so they suit columns that are read far more than written.</p>
  <p>A <strong>BRIN</strong> index (Block Range INdex) takes the opposite approach: instead of listing every row, it stores only the smallest and largest value for each range of 128 pages. Our orders arrive in time order, so page 0 holds March 2025 and the last page holds February 2026, and each block range covers a narrow window of time. To find 14 February, BRIN skips every block range whose minimum and maximum do not include that day and reads the rest, rechecking each row. Think of archive boxes labelled "1–4 Feb", "4–8 Feb": to find 14 February you open only the boxes whose labels cover it.</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_time_brin ON orders USING brin (ordered_at);
BEGIN;
DROP INDEX orders_time_idx;                -- hide the B-tree so the BRIN is used
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) FROM orders WHERE ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15';
ROLLBACK;</div>
  <div class="fx" data-lang="text">Aggregate  (cost=10039.38..10039.39 rows=1 width=8) (actual time=1.389..1.389 rows=1 loops=1)
  Buffers: shared hit=134
  -&gt;  Bitmap Heap Scan on orders  (cost=12.77..10032.01 rows=2945 width=0) (actual time=0.795..1.234 rows=2880 loops=1)
        Recheck Cond: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
        Rows Removed by Index Recheck: 10878
        Heap Blocks: lossy=129
        Buffers: shared hit=134
        -&gt;  Bitmap Index Scan on orders_time_brin  (cost=0.00..12.03 rows=13514 width=0) (actual time=0.029..0.029 rows=1290 loops=1)
              Index Cond: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
              Buffers: shared hit=5
Planning:
  Buffers: shared hit=115
Planning Time: 0.337 ms
Execution Time: 1.459 ms</div>
  <p><code>Heap Blocks: lossy</code> means BRIN can only say "somewhere in these pages", so the database reads the whole block range and throws away the rows that do not match (<code>Rows Removed by Index Recheck</code>). That is more work than the B-tree did, but it still read only about 130 pages out of 9,345, and the index itself is tiny, as the size table below shows. BRIN only works when the column follows the physical order of the table; on a shuffled column every block range would span all dates and nothing could be skipped.</p>
  <p>A <strong>partial index</strong> contains only the rows that match a WHERE clause. Biteful's kitchen dashboard only ever shows pending orders, about 1% of the table, so there is no point indexing the other 99%:</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_pending_idx ON orders (ordered_at) WHERE status = 'pending';
EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, ordered_at FROM orders
WHERE status = 'pending' AND ordered_at &gt;= '2026-02-14';</div>
  <div class="fx" data-lang="text">Index Scan using orders_pending_idx on orders  (cost=0.29..12.15 rows=163 width=12) (actual time=0.016..0.150 rows=194 loops=1)
  Index Cond: (ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone)
  Buffers: shared hit=109 read=3
Planning:
  Buffers: shared hit=161 read=1 dirtied=3
Planning Time: 0.390 ms
Execution Time: 0.178 ms</div>
  <p>The planner can use a partial index only when the query's WHERE clause implies the index's WHERE clause; here both say <code>status = 'pending'</code>. Any index type can be made partial, and partial indexes are the right answer for questions like "index the rare value of a boolean column".</p>
  <p>Finally, a <strong>hash index</strong> stores a hash code of each value and answers only <code>=</code>: no ranges and no sorting.</p>
  <div class="fx" data-lang="sql">CREATE INDEX orders_cust_hash ON orders USING hash (customer_id);
EXPLAIN SELECT order_id FROM orders WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">Index Only Scan using orders_cust_time_cov on orders  (cost=0.42..8.62 rows=11 width=4)
  Index Cond: (customer_id = 1)</div>
  <p>Even with a hash index on customer_id available, the planner prefers the covering B-tree for Asha, because it can answer without the heap. The sizes of all the indexes built so far explain the rest:</p>
  <div class="fx" data-lang="sql">SELECT c.relname AS index, am.amname AS type, pg_size_pretty(pg_relation_size(c.oid)) AS size
FROM pg_class c JOIN pg_am am ON am.oid = c.relam
WHERE c.relname IN ('orders_cust_time_idx', 'orders_cust_time_cov', 'orders_time_idx', 'orders_time_brin',
                    'orders_pending_idx', 'orders_cust_hash', 'customers_name_trgm')
ORDER BY pg_relation_size(c.oid) DESC;</div>
  <div class="fx" data-lang="text">        index         | type  |  size
----------------------+-------+---------
 orders_cust_time_cov | btree | 47 MB
 orders_cust_hash     | hash  | 32 MB
 orders_cust_time_idx | btree | 30 MB
 orders_time_idx      | btree | 21 MB
 customers_name_trgm  | gin   | 1752 kB
 orders_pending_idx   | btree | 240 kB
 orders_time_brin     | brin  | 24 kB
(7 rows)</div>
  <p>The BRIN index is 24 kB against 21 MB for the B-tree on the same column, and the partial index is 240 kB because it holds only pending orders. The hash index is 32 MB, more than three times the 9 MB B-tree on customer_id from section 03, while doing less, which is why hash indexes are rarely worth creating in PostgreSQL. (Notice also the covering index at 47 MB: INCLUDE columns make an index bigger.) PostgreSQL also has <strong>GiST</strong> indexes for overlap and nearest-neighbour questions, such as "restaurants within 5 km", used with geometric data and ranges.</p>
  <table class="tbl">
    <tr><th>Type</th><th>Answers</th><th>Biteful example</th><th>Avoid when</th></tr>
    <tr><td>B-tree (default)</td><td>=, &lt;, &gt;, BETWEEN, ORDER BY, prefix LIKE</td><td>Asha's orders by time</td><td>"contains" searches</td></tr>
    <tr><td>GIN</td><td>contains: trigrams, JSONB, arrays, full text</td><td>name ILIKE '%kapoor%'</td><td>columns that are updated constantly</td></tr>
    <tr><td>BRIN</td><td>ranges on a column that follows physical order</td><td>ordered_at on an append-only table</td><td>shuffled columns, single-row lookups</td></tr>
    <tr><td>Partial</td><td>queries that always target the same small subset</td><td>pending orders</td><td>queries that don't repeat the WHERE</td></tr>
    <tr><td>Hash</td><td>= only</td><td>customer_id = 1</td><td>almost always: a B-tree does = and more</td></tr>
    <tr><td>GiST</td><td>overlap, distance, nearest neighbour</td><td>restaurants near a location</td><td>plain equality and ranges</td></tr>
  </table>

  <h2 id="so-part"><span class="num">10</span>Partitioning and Column Stores</h2>
  <p>Indexes are good at finding a few rows. Some work, though, touches whole slices of a table: "February's revenue" reads a whole month, and a data-retention rule such as "delete orders older than a year" removes millions of rows at once. On one huge table, that DELETE has to visit every old row, mark each one dead, and leave the space for VACUUM. Both problems become easy if the table itself is split by time.</p>
  <p><strong>Partitioning</strong> stores one logical table as several child tables, called <strong>partitions</strong>, each holding the rows for one range of a key, usually a time period. You still query the parent table by its name; PostgreSQL sends each inserted row to the right partition, and when a query filters on the key it skips the partitions that cannot contain matching rows. That skipping is called <strong>partition pruning</strong>. Think of a school that keeps one attendance register per month instead of one giant register: to check June you open only June's register, and to discard last year's records you throw away twelve registers instead of erasing line by line. Here is a copy of orders partitioned by month:</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_part (LIKE orders) PARTITION BY RANGE (ordered_at);
-- one child table per month, March 2025 to February 2026
DO $$ DECLARE m date; BEGIN
  FOR m IN SELECT generate_series(date '2025-03-01', date '2026-02-01', interval '1 month')::date LOOP
    EXECUTE format('CREATE TABLE %I PARTITION OF orders_part FOR VALUES FROM (%L) TO (%L)',
                   'orders_' || to_char(m, 'YYYY_MM'), m, (m + interval '1 month')::date);
  END LOOP; END $$;
INSERT INTO orders_part SELECT * FROM orders;
ANALYZE orders_part;
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*), sum(amount) FROM orders_part
WHERE ordered_at &gt;= '2026-02-14' AND ordered_at &lt; '2026-02-15';</div>
  <div class="fx" data-lang="text">Aggregate  (cost=1363.04..1363.05 rows=1 width=40) (actual time=5.311..5.312 rows=1 loops=1)
  Buffers: shared hit=518
  -&gt;  Seq Scan on orders_2026_02 orders_part  (cost=0.00..1348.41 rows=2924 width=6) (actual time=3.025..4.942 rows=2880 loops=1)
        Filter: ((ordered_at &gt;= '2026-02-14 00:00:00+05:30'::timestamp with time zone) AND (ordered_at &lt; '2026-02-15 00:00:00+05:30'::timestamp with time zone))
        Rows Removed by Filter: 52481
        Buffers: shared hit=518
Planning:
  Buffers: shared hit=89 read=3
Planning Time: 0.361 ms
Execution Time: 5.341 ms</div>
  <p>Only <code>orders_2026_02</code> appears in the plan; the other eleven months were pruned while planning, without reading a single page of them. Inside February the database still did a Seq Scan, since we created no index on the partitions, but of about 500 pages instead of 9,345. Partitioning only helps queries that filter on the partition key, though. Asha's query filters on customer, not on time:</p>
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
  <p>An <code>Append</code> over all twelve partitions: her orders could be in any month, so every partition is scanned. This is why the partition key must be the column that almost every important query filters on. Retention is where partitioning shines most. Compare deleting March 2025 from an ordinary indexed copy of the table with dropping its partition:</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_flat AS SELECT * FROM orders;
CREATE INDEX ON orders_flat (ordered_at);
\\timing on
DELETE FROM orders_flat WHERE ordered_at &lt; '2025-04-01';
DROP TABLE orders_2025_03;</div>
  <div class="fx" data-lang="text">SELECT 1000000
CREATE INDEX
Timing is on.
DELETE 63359
Time: 27.247 ms
DROP TABLE
Time: 3.870 ms</div>
  <p>The DELETE removed about 64,000 rows in hundreds of milliseconds and left 64,000 dead row versions for VACUUM to clean up; dropping the partition removed the same month in a few milliseconds by deleting a file. Partitioning is a tool for very large tables, hundreds of millions of rows with time-based queries or retention, not a substitute for indexes; each partition still needs its own indexes for queries inside it, and thousands of tiny partitions slow down planning.</p>
  <p>Pruning skips whole months, but inside a month PostgreSQL still reads entire rows, every column of every row, even for <code>sum(amount)</code>, which needs one column out of seven. That is a consequence of being a <strong>row store</strong>: each page holds complete rows, which is perfect for the app's typical work of fetching or updating one order. Analytical databases such as BigQuery, Snowflake, Redshift, ClickHouse and DuckDB are <strong>column stores</strong>: they store each column separately and compressed, so a report summing <code>amount</code> over every order reads only the amount column, a small fraction of the bytes. The price is that fetching or updating one whole row means touching every column's storage. This is the basis of the split between <strong>OLTP</strong> (online transaction processing: many small reads and writes of whole rows, the app's own database) and <strong>OLAP</strong> (online analytical processing: big scans over a few columns, the reporting warehouse). <a class="xref" data-note="db_types">Types of Databases</a> runs the same query in a real column store and shows the difference; for this page, remember that partitions skip <em>rows</em> by range and column stores skip <em>columns</em>, two more ways of touching fewer pages.</p>

  <h2 id="so-cost"><span class="num">11</span>The Cost of Indexes</h2>
  <p>If indexes make reads so much faster, why not index every column? Because every index is a second, sorted copy of some columns, and every copy has to be kept up to date. When a new order is inserted, the database writes the row into the heap, and then, for <em>every</em> index on the table, it searches the B-tree for the right position and inserts an entry there, sometimes splitting a full page in two. An UPDATE that changes an indexed column does the same. With five indexes, one logical write becomes six physical writes. Think of a shopkeeper who writes each sale in his main register and, to answer questions faster, also keeps a notebook per customer and one per product: lookups become quick, but every sale is now written in three books, and the books fill the shelf.</p>
  <p>We can measure it by inserting the same 200,000 orders into an empty table with no indexes and into one with a primary key plus the four kinds of secondary index this page created:</p>
  <div class="fx" data-lang="py">import time, psycopg2

pg = psycopg2.connect(dbname="notes_b4")
pg.autocommit = True
cur = pg.cursor()
cur.execute("DROP TABLE IF EXISTS w0, w5")
cur.execute("CREATE TABLE w0 (LIKE orders)")                     # no indexes at all
cur.execute("CREATE TABLE w5 (LIKE orders)")                     # primary key + 4 indexes
cur.execute("ALTER TABLE w5 ADD PRIMARY KEY (order_id)")
cur.execute("CREATE INDEX ON w5 (customer_id, ordered_at)")
cur.execute("CREATE INDEX ON w5 (customer_id, ordered_at) INCLUDE (order_id, amount)")
cur.execute("CREATE INDEX ON w5 (ordered_at)")
cur.execute("CREATE INDEX ON w5 (status)")

for t in ("w0", "w5"):
    start = time.perf_counter()
    cur.execute(f"INSERT INTO {t} SELECT * FROM orders WHERE order_id &lt;= 200000")
    ms = (time.perf_counter() - start) * 1000
    cur.execute(f"""SELECT count(i.indexrelid),
                           pg_size_pretty(coalesce(sum(pg_relation_size(i.indexrelid)), 0)),
                           pg_size_pretty(pg_relation_size('{t}'))
                    FROM pg_class c LEFT JOIN pg_index i ON i.indrelid = c.oid
                    WHERE c.relname = '{t}'""")
    n_idx, idx_size, heap = cur.fetchone()
    print(f"{t}: {n_idx} indexes, insert 200,000 rows: {ms:6.0f} ms   table {heap}, indexes {idx_size}")</div>
  <div class="fx" data-lang="text">w0: 0 indexes, insert 200,000 rows:    272 ms   table 15 MB, indexes 0 bytes
w5: 5 indexes, insert 200,000 rows:   1646 ms   table 15 MB, indexes 30 MB</div>
  <p>The same rows took several times longer to insert with five indexes, and the indexes take twice as much space as the table itself. Reads got faster, every write got slower, and memory now has to cache index pages as well as table pages. That is the trade-off behind every indexing decision.</p>
  <p>In practice this leads to a few habits. Index what the important queries filter, join and sort on, confirmed with EXPLAIN rather than guessed. Remove indexes that are never used: PostgreSQL counts index scans in <code>pg_stat_user_indexes</code>, and an index whose <code>idx_scan</code> stays at 0 costs writes and gives nothing. Remove redundant ones, such as an index on <code>(customer_id)</code> next to one on <code>(customer_id, ordered_at)</code>. For a large bulk load, it is often faster to drop secondary indexes, load the data, and rebuild them once. And on write-heavy tables, such as an event log or a table of order-status changes, be especially careful: there, too many indexes can make inserts the bottleneck. (One detail: an UPDATE that changes no indexed column can often skip index maintenance entirely, a PostgreSQL optimisation called a HOT update, which is one more reason not to index or INCLUDE columns that change often.)</p>

  <h2 id="so-app"><span class="num">12</span>Pagination and the N+1 Problem</h2>
  <p>With the right indexes and fresh statistics each query is cheap, yet applications can still be slow because of the <em>shape</em> of the queries they send. Two patterns cause most of this, and no index can fix either.</p>
  <p>The first is <strong>OFFSET pagination</strong>. Biteful's admin panel lists all orders, 20 per page, with <code>LIMIT 20 OFFSET n</code>. <code>OFFSET 900000</code> means "produce the first 900,020 rows in order and throw away the first 900,000", and even using the primary key index the database has to step over every one of the skipped rows:</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE SELECT * FROM orders ORDER BY order_id LIMIT 20 OFFSET 900000;</div>
  <div class="fx" data-lang="text">Limit  (cost=31796.01..31796.71 rows=20 width=39) (actual time=169.509..169.516 rows=20 loops=1)
  -&gt;  Index Scan using orders_pkey on orders  (cost=0.42..35328.85 rows=1000000 width=39) (actual time=0.019..137.320 rows=900020 loops=1)
Planning Time: 0.512 ms
Execution Time: 169.546 ms</div>
  <p>The index scan produced <code>rows=900020</code> in order to return 20. Page 1 is instant and page 45,000 is slow, and every page gets slower the deeper you go. <strong>Keyset pagination</strong> (also called seek pagination) fixes this by remembering the last key shown and asking for the next 20 after it:</p>
  <div class="fx" data-lang="sql">EXPLAIN ANALYZE SELECT * FROM orders WHERE order_id &gt; 900000 ORDER BY order_id LIMIT 20;</div>
  <div class="fx" data-lang="text">Limit  (cost=0.42..1.18 rows=20 width=39) (actual time=0.040..0.046 rows=20 loops=1)
  -&gt;  Index Scan using orders_pkey on orders  (cost=0.42..3679.86 rows=97136 width=39) (actual time=0.039..0.042 rows=20 loops=1)
        Index Cond: (order_id &gt; 900000)
Planning Time: 0.808 ms
Execution Time: 0.090 ms</div>
  <p>The B-tree jumps straight to <code>order_id &gt; 900000</code> and reads exactly 20 rows, and every page costs the same however deep it is. Think of OFFSET as counting 900,000 lines from the start of a book every time you want to turn a page, and keyset as using a bookmark. Keyset pagination needs a unique sort order: if you sort by <code>ordered_at</code>, add the id as a tie-breaker, as in <code>WHERE (ordered_at, order_id) &lt; (:last_time, :last_id) ORDER BY ordered_at DESC, order_id DESC</code>, with an index on those two columns. Its limitation is that it gives "next" and "previous" pages but no "jump to page 500", which is why infinite-scroll feeds use it.</p>
  <p>The second pattern is the <strong>N+1 query problem</strong>. Code fetches a list of customers with one query, then loops over them and runs one more query per customer to get their orders: N+1 queries in total. Each query is a round trip from the application to the database and back, with sending, parsing, planning and returning, and when each answer is tiny that fixed cost per trip dominates. Here it is measured on 2,000 customers over a local connection (over a real network each trip costs more):</p>
  <div class="fx" data-lang="py">import time, psycopg2

pg = psycopg2.connect(dbname="notes_b4")
cur = pg.cursor()
cur.execute("SELECT customer_id FROM customers ORDER BY customer_id LIMIT 2000")
ids = [r[0] for r in cur.fetchall()]

t = time.perf_counter()
counts = {}
for cid in ids:                                       # N+1: one query per customer
    cur.execute("SELECT count(*) FROM orders WHERE customer_id = %s", (cid,))
    counts[cid] = cur.fetchone()[0]
loop_ms = (time.perf_counter() - t) * 1000

t = time.perf_counter()
cur.execute("""SELECT customer_id, count(*) FROM orders
               WHERE customer_id = ANY(%s) GROUP BY customer_id""", (ids,))
rows = dict(cur.fetchall())
one_ms = (time.perf_counter() - t) * 1000

print(f"N+1 loop : {len(ids)} queries, {loop_ms:5.0f} ms, Asha has {counts[1]} orders")
print(f"one query:    1 query,   {one_ms:5.0f} ms, Asha has {rows[1]} orders")</div>
  <div class="fx" data-lang="text">N+1 loop : 2000 queries,   167 ms, Asha has 12 orders
one query:    1 query,       8 ms, Asha has 12 orders</div>
  <p>The same numbers either way, but one query with <code>= ANY(%s)</code> and GROUP BY replaced 2,000 round trips and was many times faster. Think of needing ten items from a shop and walking there ten times, one item per trip. ORMs, the libraries that map database rows to objects (Django, SQLAlchemy and others), cause N+1 silently through <em>lazy loading</em>, where touching <code>customer.orders</code> inside a loop sends a query each time. The fixes are eager loading (<code>select_related</code>/<code>prefetch_related</code> in Django, <code>joinedload</code>/<code>selectinload</code> in SQLAlchemy), a JOIN, or a single query over the whole list of ids.</p>

  <h2 id="so-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>Performance mistakes never raise errors: the query returns the right answer and is simply slow, often only once the table is large. The most frequent one is forgetting to index a foreign key. PostgreSQL indexes primary keys automatically but not foreign keys, so <code>orders.customer_id</code> started with no index, and every "orders of this customer" query and every join from customers to orders read the whole table (section 01). The fix is <code>CREATE INDEX ON orders (customer_id)</code>, or better, a composite index shaped for the real query.</p>
  <p>The second is putting a function, cast or arithmetic on an indexed column, such as <code>ordered_at::date = …</code>, <code>lower(name) = …</code> or <code>customer_id + 0 = 1</code>, all of which produced Seq Scans in section 07. Keep the column bare and move the work to the constant, or create an expression index that matches the expression exactly. Closely related is a leading wildcard, <code>LIKE '%Kapoor'</code>, which a B-tree can never serve; anchor the pattern at the start or use a trigram GIN index.</p>
  <p>The third is the wrong column order in a composite index. <code>(ordered_at, customer_id)</code> for "customer 1 since January" read over 500 pages where <code>(customer_id, ordered_at)</code> read 7. Equality columns go first, range or sort columns last. Similarly, <code>SELECT *</code> silently turns an index-only scan back into index-plus-heap (section 06); name the columns you need.</p>
  <p>The fourth is trusting the planner's estimates after a bulk change. The ₹199 promotion produced an estimate of 10 rows against 300,007 actual and a Nested Loop that ran 300,007 times; one <code>ANALYZE</code> fixed it. The opposite mistake is believing an unused index is broken: for <code>status = 'delivered'</code>, which matches 93% of rows, a Seq Scan is genuinely the best plan.</p>
  <p>Finally, three operational slips. Running EXPLAIN ANALYZE on an UPDATE or DELETE in production really changes data unless it is wrapped in <code>BEGIN … ROLLBACK</code>. Indexing everything makes every write slower and every backup bigger; five indexes made inserts several times slower in section 11. And OFFSET pagination for deep pages and N+1 loops in application code waste work that no index can remove; use keyset pagination and one set-based query instead.</p>

  <h2 id="so-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core ideas</h3>
  <ul>
    <li><b>Query cost</b> is roughly the number of <b>pages</b> (8 KB blocks) touched; the SQL fixes the answer, not the work.</li>
    <li><b>Heap</b>: the table's storage, rows in arrival order. <b>ctid</b> = (page, slot), changes on every UPDATE.</li>
    <li><b>Seq Scan cost</b> = pages × 1 + rows × 0.01 + rows × 0.0025 per operator (orders: 9,345 + 10,000 + 2,500 = 21,845). Independent of how many rows match.</li>
    <li><b>Selectivity</b> = matching rows / all rows. Indexes win when it is small.</li>
    <li><b>B-tree</b>: sorted keys with ctids; root → internal → leaf; 3–4 levels for millions of rows (O(log n)); linked leaves serve ranges, ORDER BY and prefix LIKE.</li>
    <li>PRIMARY KEY and UNIQUE create indexes automatically; FOREIGN KEY does not.</li>
    <li><b>Clustered index</b> (SQL Server, InnoDB): the table itself is the B-tree in primary-key order, one per table. PostgreSQL tables are heaps; every index is separate (non-clustered).</li>
  </ul>
  <h3>Reading plans</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Meaning</th></tr>
    <tr><td><code>EXPLAIN</code></td><td>chosen plan with estimates; does not run the query</td></tr>
    <tr><td><code>EXPLAIN ANALYZE</code></td><td>runs it; adds actual time, rows, loops (wrap writes in BEGIN … ROLLBACK)</td></tr>
    <tr><td><code>BUFFERS</code></td><td>pages touched: hit = in cache, read = from disk/OS</td></tr>
    <tr><td><code>cost=a..b rows=n</code></td><td>startup cost..total cost, estimated rows</td></tr>
    <tr><td><code>Rows Removed by Filter</code></td><td>rows read and thrown away: a sign of a missing or unusable index</td></tr>
    <tr><td>Seq Scan / Index Scan / Bitmap / Index Only</td><td>all pages / index then heap row by row / addresses collected then pages in order / index alone</td></tr>
    <tr><td>Nested Loop / Hash Join</td><td>one lookup per outer row / build hash table, probe it</td></tr>
  </table>
  <p>Read inside-out. Find the node where estimated and actual rows differ by 10× or more; that is where the plan went wrong.</p>
  <h3>Shaping indexes</h3>
  <ul>
    <li><b>Composite (a, b)</b>: sorted by a, then b. Serves a, a + b, a + range of b; not b alone (leftmost prefix).</li>
    <li><b>Column order</b>: equality columns first, range/sort column last.</li>
    <li><b>Covering</b>: <code>INCLUDE (cols)</code> → Index Only Scan; Heap Fetches stay 0 only if VACUUM keeps the visibility map current.</li>
    <li><b>Sargable</b>: column bare on one side of =, &lt;, &gt;, BETWEEN, prefix LIKE. Otherwise rewrite, or use an expression index.</li>
    <li><b>Statistics</b>: ANALYZE samples each column (null fraction, n_distinct, common values, histogram). Estimated rows = table rows × selectivity. Run ANALYZE after bulk changes.</li>
  </ul>
  <h3>Index types and other structures</h3>
  <table class="tbl">
    <tr><th>Structure</th><th>Use for</th><th>Not for</th></tr>
    <tr><td>B-tree</td><td>=, ranges, sorting, prefix LIKE</td><td>"contains"</td></tr>
    <tr><td>GIN (pg_trgm, JSONB, arrays, full text)</td><td>contains</td><td>write-heavy columns</td></tr>
    <tr><td>BRIN</td><td>huge append-only tables queried by time range</td><td>columns not in physical order</td></tr>
    <tr><td>Partial (<code>WHERE …</code>)</td><td>queries on a small fixed subset</td><td>queries without that WHERE</td></tr>
    <tr><td>Hash</td><td>= only</td><td>almost everything: use a B-tree</td></tr>
    <tr><td>Partitioning</td><td>pruning by key, DROP instead of DELETE</td><td>queries that don't filter on the key</td></tr>
    <tr><td>Column store (OLAP)</td><td>aggregates over few columns of all rows</td><td>single-row reads/writes</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="sql">CREATE INDEX orders_customer_idx ON orders (customer_id);                     -- B-tree
CREATE INDEX ON orders (customer_id, ordered_at) INCLUDE (order_id, amount);     -- composite + covering
CREATE INDEX ON customers (lower(name));                                         -- expression
CREATE INDEX ON orders (ordered_at) WHERE status = 'pending';                    -- partial
CREATE INDEX ON customers USING gin (name gin_trgm_ops);                         -- trigram GIN
CREATE INDEX ON orders USING brin (ordered_at);                                  -- BRIN
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;                                           -- real plan
ANALYZE orders;                                                                  -- refresh statistics
SELECT indexrelname, idx_scan FROM pg_stat_user_indexes WHERE idx_scan = 0;      -- unused indexes
SELECT * FROM orders WHERE order_id &gt; :last_id ORDER BY order_id LIMIT 20;       -- keyset page</div>
  <h3>Gotchas</h3>
  <ul>
    <li>No index on foreign keys by default.</li>
    <li>Functions, casts, arithmetic or a leading % on the column → Seq Scan.</li>
    <li>An index on a column matching most rows is (correctly) ignored.</li>
    <li>Stale statistics → wrong estimates → wrong join and scan choices.</li>
    <li><code>SELECT *</code> defeats covering indexes.</li>
    <li>Every index slows every INSERT and every UPDATE of its columns.</li>
    <li>OFFSET reads and discards; N+1 pays one round trip per row.</li>
  </ul>

  <h2 id="so-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an index, and what does it cost?</summary><div class="qa-body">An index is a separate structure holding a sorted copy of one or more columns, each value pointing to the row it came from, so the database can jump to matching rows instead of reading every page. It costs disk space and cache memory, and it slows every INSERT, DELETE and every UPDATE of an indexed column, because the index has to be updated too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a B-tree index find a row?</summary><div class="qa-body">It starts at the root page, whose entries say which child page covers which range of keys, and follows one child per level down to a leaf page. The leaf holds the key with the addresses of its rows, and the database then fetches those rows from the table. Because each page holds hundreds of entries, even millions of rows need only three or four levels, so a lookup reads a handful of pages.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a clustered and a non-clustered index?</summary><div class="qa-body">In a clustered index the table rows themselves are stored in the index's order (SQL Server, or InnoDB's primary key), so there can be only one per table and range scans on that key read neighbouring rows. A non-clustered index is a separate structure whose entries point to the rows (or, in InnoDB, to the primary key). PostgreSQL stores tables as unordered heaps, so all its indexes are non-clustered; <code>CLUSTER</code> reorders a table once but does not keep it ordered.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between EXPLAIN and EXPLAIN ANALYZE?</summary><div class="qa-body">EXPLAIN shows the plan the planner chose and its estimated costs and row counts, without running the query. EXPLAIN ANALYZE actually runs the query and adds real times, real row counts and loop counts for each node, so you can compare estimates with reality. Because it runs the statement, an EXPLAIN ANALYZE of an UPDATE or DELETE should be wrapped in BEGIN … ROLLBACK.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A query filters on an indexed column but the plan shows a Seq Scan. What could be the reasons?</summary><div class="qa-body">The condition may not be sargable (a function, cast, arithmetic or leading wildcard on the column). The condition may match a large fraction of the table, in which case the Seq Scan really is cheaper. The statistics may be stale, so the planner misjudges the row count; run ANALYZE. Or the table is so small that reading it whole is cheapest. EXPLAIN ANALYZE tells you which.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a composite index, and why does column order matter?</summary><div class="qa-body">A composite index covers several columns and is sorted by the first, then by the second within equal first values. It can therefore be searched by its leading column or leading columns, but not by a later column alone (the leftmost-prefix rule). Put equality columns first and range or sort columns last: on Biteful, (customer_id, ordered_at) read 7 pages for "customer 1 since January", while (ordered_at, customer_id) read over 500.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a covering index, and what is an Index Only Scan?</summary><div class="qa-body">A covering index contains every column a query needs, often by adding returned columns with INCLUDE. The database can then answer from the index alone, an Index Only Scan, without visiting the table. In PostgreSQL this only skips the table for pages marked all-visible in the visibility map, which VACUUM maintains; recently updated pages still need a heap check (Heap Fetches).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "sargable" mean? Rewrite <code>WHERE YEAR(created_at) = 2025</code>.</summary><div class="qa-body">A sargable condition is one an index can be used to answer: the indexed column appears bare on one side of a comparison. Wrapping the column in a function forces the database to compute it for every row. Rewrite as <code>WHERE created_at &gt;= '2025-01-01' AND created_at &lt; '2026-01-01'</code>, which an index on created_at can serve as a range.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Should you index a column with only a few distinct values, such as a boolean or a status?</summary><div class="qa-body">Usually not as a plain index, because each value matches a large share of rows and the planner will choose a Seq Scan anyway (as it did for status = 'delivered', 93% of rows). If queries target a rare value, a partial index such as <code>CREATE INDEX ON orders (ordered_at) WHERE status = 'pending'</code> is small and effective. Low cardinality can still be useful as a later column of a composite index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does the planner decide between an index and a full scan?</summary><div class="qa-body">It estimates how many rows each condition will return using statistics collected by ANALYZE (common values and frequencies, distinct counts, histograms), then estimates the cost of each possible plan from the pages and rows it would touch, and picks the cheapest. Few matching rows favour an index; many favour a Seq Scan. Wrong statistics produce confidently wrong plans.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A plan shows estimated rows=10 but actual rows=300,007. What happened, and what do you do?</summary><div class="qa-body">The planner's statistics are out of date or misleading, so it chose a plan for 10 rows, such as a Nested Loop doing one lookup per row, that is terrible for 300,000. First run ANALYZE on the table and re-check the plan. If the estimate stays wrong, look for skewed data (raise the statistics target), correlated columns (CREATE STATISTICS) or non-sargable expressions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not create an index on every column?</summary><div class="qa-body">Every index must be maintained on every insert and on every update of its columns, so writes get slower; in our test five indexes made inserting 200,000 rows several times slower. Indexes also take space (here more than the table itself) and compete for cache memory. Index what the important queries need, and drop unused or redundant indexes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use a GIN, BRIN, partial or hash index instead of a B-tree?</summary><div class="qa-body">GIN for "contains" questions: text search with trigrams or full-text, JSONB and arrays. BRIN for huge append-only tables whose column follows the physical order, like timestamps in a log; it is tiny but coarse. Partial when queries always target a small subset of rows. Hash only for equality, and in PostgreSQL a B-tree is usually better even then.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is table partitioning, and when does it help or hurt?</summary><div class="qa-body">Partitioning splits one logical table into child tables by a key such as month. Queries filtering on that key skip irrelevant partitions (pruning), and old data can be removed by dropping a partition instead of a huge DELETE. It hurts queries that do not filter on the key, which must scan every partition, and very many small partitions slow down planning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is OFFSET pagination slow for deep pages, and what is the alternative?</summary><div class="qa-body">OFFSET n makes the database produce and discard n rows before returning the page, so page 45,000 reads hundreds of thousands of rows. Keyset (seek) pagination remembers the last key shown and asks <code>WHERE key &gt; :last ORDER BY key LIMIT 20</code>, which an index answers with one descent, so every page costs the same. Its limitation is that you cannot jump to an arbitrary page number.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the N+1 query problem?</summary><div class="qa-body">It is when code runs one query to fetch a list and then one more query for each item in the list, so N items cost N+1 round trips, and the fixed cost of each trip dominates. It often comes from lazy loading in ORMs. Fix it with a JOIN, a single query over all the ids (<code>WHERE id = ANY(...)</code>), or the ORM's eager-loading options.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Row store or column store: which for what?</summary><div class="qa-body">A row store keeps each row's columns together, which is ideal for an application's many small reads and writes of whole rows (OLTP: PostgreSQL, MySQL). A column store keeps each column separately and compressed, so analytical queries that scan a few columns of millions of rows read far fewer bytes (OLAP: BigQuery, Snowflake, ClickHouse, DuckDB). Typically the app runs on a row store and data is copied to a column-store warehouse for reporting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A query is slow in production. Walk through how you would fix it.</summary><div class="qa-body">Get the real plan with EXPLAIN (ANALYZE, BUFFERS) on production-sized data. Find where the time and the buffers go, and where estimated and actual rows diverge. Then check, in order: is a needed index missing (often a foreign key); is the condition sargable; are the statistics fresh; would a composite or covering index shaped for this query remove a sort or heap visits; and is the query shape itself the problem (SELECT *, OFFSET, N+1). Re-measure after each change.</div></details>
</main>
`
});
