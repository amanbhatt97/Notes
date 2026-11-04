// notes/databases/sql_windows.js — Window Functions
Object.assign(TOPIC_CONTENT, {
  "sql_windows": `<main>
  <h1>Window Functions</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Window Functions</span></div>
  <p class="lead">A window function looks at a group of rows related to the current row and writes its answer onto that row, without merging the rows together the way GROUP BY does. That one ability lets you put each order next to its customer's total, rank orders, measure the time since a customer's previous order, keep a running total by day, find streaks and split app activity into sessions. Window functions are the most heavily tested SQL topic in data and analytics interviews, and most "hard" SQL questions turn out to be one window function inside a CTE. The whole page uses one running example: <strong>Biteful</strong>, the food-delivery company from <a class="xref" data-note="sql_joins">JOINs</a> and <a class="xref" data-note="sql_subqueries">Subqueries</a>, with its 10 orders, plus a small app event log for the final section. Every result shown was produced by running the query in PostgreSQL 16.</p>

  <h2 id="sw-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Window Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>GROUP BY collapses rows; a window keeps every row</li>
          <li><code>f(x) OVER (PARTITION BY … ORDER BY … frame)</code></li>
          <li>Computed after WHERE / GROUP BY, before the final ORDER BY</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Function families</div>
        <ul>
          <li><b>Ranking</b>: ROW_NUMBER, RANK, DENSE_RANK, NTILE</li>
          <li><b>Neighbours</b>: LAG, LEAD, FIRST_VALUE, LAST_VALUE</li>
          <li><b>Aggregates</b>: SUM, AVG, COUNT over a window</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Frames</div>
        <ul>
          <li>Default with ORDER BY: start of partition up to current row <em>and its peers</em></li>
          <li><b>ROWS</b> counts rows; <b>RANGE</b> uses values</li>
          <li>LAST_VALUE needs a frame to UNBOUNDED FOLLOWING</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li>Top-N per group: rank in a CTE, filter outside</li>
          <li>Gaps &amp; islands: date − ROW_NUMBER = streak label</li>
          <li>Sessions: LAG gap → 0/1 flag → running SUM</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sw-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Window Functions Exist</span><span class="rm-sub">GROUP BY loses the detail rows</span></div></div>
      <div class="rm-item rm-done" data-target="sw-over"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">OVER and PARTITION BY</span><span class="rm-sub">a total, or a group total, on every row</span></div></div>
      <div class="rm-item rm-done" data-target="sw-order"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">ORDER BY Inside the Window</span><span class="rm-sub">running values, and when windows run</span></div></div>
      <div class="rm-item rm-done" data-target="sw-rank"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">ROW_NUMBER, RANK and DENSE_RANK</span><span class="rm-sub">positions, and how ties count</span></div></div>
      <div class="rm-item rm-done" data-target="sw-dist"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">NTILE and Percentiles</span><span class="rm-sub">buckets and where a row sits in the spread</span></div></div>
      <div class="rm-item rm-done" data-target="sw-lag"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">LAG and LEAD</span><span class="rm-sub">comparing a row with its neighbours</span></div></div>
      <div class="rm-item rm-done" data-target="sw-run"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Running Totals, Moving Averages and Shares</span><span class="rm-sub">the daily dashboard</span></div></div>
      <div class="rm-item rm-done" data-target="sw-frame"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Window Frames: ROWS vs RANGE</span><span class="rm-sub">exactly which rows a window sees</span></div></div>
      <div class="rm-item rm-done" data-target="sw-topn"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Top-N per Group</span><span class="rm-sub">filtering on a window value</span></div></div>
      <div class="rm-item rm-done" data-target="sw-gaps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Gaps and Islands</span><span class="rm-sub">finding streaks of consecutive days</span></div></div>
      <div class="rm-item rm-done" data-target="sw-sess"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Sessionization</span><span class="rm-sub">grouping events by inactivity</span></div></div>
      <div class="rm-item rm-done" data-target="sw-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">ties, frames and missing partitions</span></div></div>
      <div class="rm-item rm-done" data-target="sw-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, syntax, comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="sw-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on windows</span></div></div>
    </div>
  </div>

  <h2 id="sw-why"><span class="num">01</span>Why Window Functions Exist</h2>
  <p>Here are Biteful's ten orders in time order. Customers 1 to 6 are Asha, Ben, Chen, Dia, Esha and Farah; restaurants 10 to 13 are Dosa Hut, Biryani Bros, Pizza Point and Green Bowl.</p>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, restaurant_id,
       to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at, status, amount
FROM orders
ORDER BY ordered_at;</div>
  <div class="fx" data-lang="text"> order_id | customer_id | restaurant_id |  ordered_at  |  status   | amount 
----------+-------------+---------------+--------------+-----------+--------
      101 |           1 |            10 | Mar 02 12:10 | delivered | 240.00
      102 |           2 |            11 | Mar 02 13:05 | delivered | 450.00
      103 |           3 |            12 | Mar 02 20:30 | delivered | 520.00
      104 |           1 |            12 | Mar 03 13:15 | delivered | 380.00
      105 |           4 |            13 | Mar 03 19:45 | cancelled | 310.00
      106 |           2 |            11 | Mar 04 12:40 | delivered | 180.00
      107 |           5 |            12 | Mar 04 21:10 | cancelled | 260.00
      108 |           3 |            10 | Mar 05 18:20 | delivered | 260.00
      109 |           6 |            11 | Mar 05 20:05 | delivered | 600.00
      110 |           1 |            10 | Mar 08 20:50 | pending   | 310.00
(10 rows)</div>
  <p>Several details will come back later. Asha (customer 1) has three orders, and Ben and Chen two each. Two amounts appear twice, 310 (orders 105 and 110) and 260 (107 and 108), which will matter when we rank. Three orders fall on Mar 2, so they share a date. And nothing at all happened on Mar 6 and 7, a gap in the calendar.</p>
  <p>The customer team asks for every order, with that customer's total spend printed next to it, so they can see which single order made up most of a customer's spending. You know how to get totals: GROUP BY.</p>
  <div class="fx" data-lang="sql">SELECT customer_id, SUM(amount) AS customer_total
FROM orders
GROUP BY customer_id
ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> customer_id | customer_total 
-------------+----------------
           1 |         930.00
           2 |         630.00
           3 |         780.00
           4 |         310.00
           5 |         260.00
           6 |         600.00
(6 rows)</div>
  <p>The totals are right (Asha 930), but the orders have disappeared. GROUP BY <em>collapses</em> each group into one output row, so ten orders became six customer rows. Asking for the order id as well does not help:</p>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, amount, SUM(amount)
FROM orders
GROUP BY customer_id;</div>
  <div class="fx" data-lang="text">ERROR:  column "orders.order_id" must appear in the GROUP BY clause or be used in an aggregate function
LINE 1: SELECT order_id, customer_id, amount, SUM(amount)
               ^</div>
  <p>After grouping, Asha's group contains three different order ids, and a single output row cannot show three of them, so PostgreSQL refuses. The workaround from <a class="xref" data-note="sql_subqueries">Subqueries</a> is to compute the totals in a derived table and join them back onto every order:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.customer_id, o.amount, t.customer_total
FROM orders o
JOIN (SELECT customer_id, SUM(amount) AS customer_total
      FROM orders GROUP BY customer_id) t ON t.customer_id = o.customer_id
ORDER BY o.customer_id, o.order_id;</div>
  <div class="fx" data-lang="text"> order_id | customer_id | amount | customer_total 
----------+-------------+--------+----------------
      101 |           1 | 240.00 |         930.00
      104 |           1 | 380.00 |         930.00
      110 |           1 | 310.00 |         930.00
      102 |           2 | 450.00 |         630.00
      106 |           2 | 180.00 |         630.00
      103 |           3 | 520.00 |         780.00
      108 |           3 | 260.00 |         780.00
      105 |           4 | 310.00 |         310.00
      107 |           5 | 260.00 |         260.00
      109 |           6 | 600.00 |         600.00
(10 rows)</div>
  <p>This is exactly the result we want: all ten orders, each carrying its customer's total. But it took two passes over the table and a join just to put one number on each row, and the two halves can drift apart (if someone adds a filter to the outer query and forgets the inner one, the totals no longer match the rows shown).</p>
  <p>A <strong>window function</strong> produces that result directly. It is a function followed by the keyword <code>OVER (…)</code>; for each row, it computes a value over a set of related rows, called the row's <strong>window</strong>, and returns that value on the row itself. Unlike GROUP BY, the number of rows does not change. Think of board exam results. The school notice board shows one line per class, "10-A average: 72", which is GROUP BY. Each student's own marksheet shows their marks <em>and</em> "class average: 72" printed in the corner, which is a window function: every student keeps their own sheet, and the group figure is added to it. The figure below shows the same two customers handled both ways.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="sw-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="145" y="16" text-anchor="middle" font-weight="bold" font-size="12">GROUP BY customer_id</text>
    <rect x="10" y="30" width="130" height="22" rx="3" class="fb"/><text x="17" y="45">101 · Asha · 240</text><rect x="10" y="56" width="130" height="22" rx="3" class="fb"/><text x="17" y="71">104 · Asha · 380</text><rect x="10" y="82" width="130" height="22" rx="3" class="fb"/><text x="17" y="97">110 · Asha · 310</text><rect x="10" y="114" width="130" height="22" rx="3" class="fv"/><text x="17" y="129">102 · Ben · 450</text><rect x="10" y="140" width="130" height="22" rx="3" class="fv"/><text x="17" y="155">106 · Ben · 180</text>
    <g stroke="currentColor" marker-end="url(#sw-ar1)" opacity="0.7"><line x1="140" y1="41" x2="183" y2="64"/><line x1="140" y1="67" x2="183" y2="67"/><line x1="140" y1="93" x2="183" y2="70"/><line x1="140" y1="125" x2="183" y2="138"/><line x1="140" y1="151" x2="183" y2="142"/></g>
    <rect x="185" y="54" width="110" height="26" rx="4" class="fb sb"/><text x="240" y="71" text-anchor="middle">Asha 930</text>
    <rect x="185" y="127" width="110" height="26" rx="4" class="fv"/><text x="240" y="144" text-anchor="middle">Ben 630</text>
    <text x="145" y="186" text-anchor="middle" class="tm">5 rows → 2 rows: orders lost</text>
    <line x1="305" y1="10" x2="305" y2="190" stroke="currentColor" stroke-dasharray="4 4" opacity="0.4"/>
    <text x="450" y="16" text-anchor="middle" font-weight="bold" font-size="12">SUM() OVER (PARTITION BY customer_id)</text>
    <rect x="320" y="30" width="130" height="22" rx="3" class="fb"/><text x="327" y="45">101 · Asha · 240</text><rect x="458" y="30" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="45" text-anchor="middle">total 930</text><rect x="320" y="56" width="130" height="22" rx="3" class="fb"/><text x="327" y="71">104 · Asha · 380</text><rect x="458" y="56" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="71" text-anchor="middle">total 930</text><rect x="320" y="82" width="130" height="22" rx="3" class="fb"/><text x="327" y="97">110 · Asha · 310</text><rect x="458" y="82" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="97" text-anchor="middle">total 930</text><rect x="320" y="114" width="130" height="22" rx="3" class="fv"/><text x="327" y="129">102 · Ben · 450</text><rect x="458" y="114" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="129" text-anchor="middle">total 630</text><rect x="320" y="140" width="130" height="22" rx="3" class="fv"/><text x="327" y="155">106 · Ben · 180</text><rect x="458" y="140" width="110" height="22" rx="3" class="fg sg"/><text x="513" y="155" text-anchor="middle">total 630</text>
    <text x="450" y="186" text-anchor="middle" class="tm">5 rows → 5 rows + group value</text>
    </g>
  </svg><figcaption>Same groups, same totals. On the left, GROUP BY merges Asha's three orders into one row and Ben's two into another. On the right, a window function leaves all five orders in place and writes each customer's total next to them.</figcaption></figure>
  <p>The next two sections build the syntax piece by piece: first an empty window, then a window per group, then a window with an order.</p>

  <h2 id="sw-over"><span class="num">02</span>OVER and PARTITION BY</h2>
  <p>Start with the simplest case: each order next to the <em>company</em> total, so we can show what share of all business it represents. Putting <code>OVER ()</code> after an aggregate turns it into a window function. The empty brackets mean "every row's window is the whole result", so the aggregate is computed over all rows and the answer is written onto each one:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
       SUM(amount) OVER () AS total,
       COUNT(*)    OVER () AS n,
       ROUND(100.0 * amount / SUM(amount) OVER (), 1) AS pct_of_total
FROM orders
ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id | amount |  total  | n  | pct_of_total 
----------+--------+---------+----+--------------
      101 | 240.00 | 3510.00 | 10 |          6.8
      102 | 450.00 | 3510.00 | 10 |         12.8
      103 | 520.00 | 3510.00 | 10 |         14.8
      104 | 380.00 | 3510.00 | 10 |         10.8
      105 | 310.00 | 3510.00 | 10 |          8.8
      106 | 180.00 | 3510.00 | 10 |          5.1
      107 | 260.00 | 3510.00 | 10 |          7.4
      108 | 260.00 | 3510.00 | 10 |          7.4
      109 | 600.00 | 3510.00 | 10 |         17.1
      110 | 310.00 | 3510.00 | 10 |          8.8
(10 rows)</div>
  <p>Every row sees the same window, so <code>total</code> is 3510 and <code>n</code> is 10 on all ten rows. Once the total sits on each row, a share is ordinary arithmetic: order 109 is 100 × 600 / 3510 = 17.1% of all order value. Without OVER, writing <code>SUM(amount)</code> next to <code>order_id</code> would trigger the GROUP BY error from section 01. Notice the <code>100.0</code> in the percentage. When both sides of a division are integers, SQL performs integer division and throws away the fraction:</p>
  <div class="fx" data-lang="sql">SELECT 600 / 3510 AS integer_division, ROUND(100.0 * 600 / 3510, 1) AS pct;</div>
  <div class="fx" data-lang="text"> integer_division | pct  
------------------+------
                0 | 17.1
(1 row)</div>
  <p>600 / 3510 as integers is 0, so a percentage written that way would be 0 for every order. Multiplying by <code>100.0</code> first makes the calculation decimal.</p>
  <p>The customer team, though, wanted each order next to <em>its customer's</em> total, not the company's. That needs GROUP BY's idea of groups without its collapse. Writing <code>PARTITION BY customer_id</code> inside the brackets splits the rows into groups called <strong>partitions</strong>, one per customer, and each row's window becomes just its own partition. A window never looks across a partition boundary.</p>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, amount,
       SUM(amount) OVER (PARTITION BY customer_id)           AS customer_total,
       COUNT(*)    OVER (PARTITION BY customer_id)           AS customer_orders,
       ROUND(100.0 * amount / SUM(amount) OVER (PARTITION BY customer_id), 1) AS pct_of_customer
FROM orders
ORDER BY customer_id, order_id;</div>
  <div class="fx" data-lang="text"> order_id | customer_id | amount | customer_total | customer_orders | pct_of_customer 
----------+-------------+--------+----------------+-----------------+-----------------
      101 |           1 | 240.00 |         930.00 |               3 |            25.8
      104 |           1 | 380.00 |         930.00 |               3 |            40.9
      110 |           1 | 310.00 |         930.00 |               3 |            33.3
      102 |           2 | 450.00 |         630.00 |               2 |            71.4
      106 |           2 | 180.00 |         630.00 |               2 |            28.6
      103 |           3 | 520.00 |         780.00 |               2 |            66.7
      108 |           3 | 260.00 |         780.00 |               2 |            33.3
      105 |           4 | 310.00 |         310.00 |               1 |           100.0
      107 |           5 | 260.00 |         260.00 |               1 |           100.0
      109 |           6 | 600.00 |         600.00 |               1 |           100.0
(10 rows)</div>
  <p>Asha's three orders (101, 104, 110) form one partition, so each of them sees 240 + 380 + 310 = 930 and a count of 3. Ben's partition holds 450 and 180, so both his rows show 630. Dia, Esha and Farah each have a partition of one row, so their total is their own amount and their share is 100%. These are the same numbers the join-back produced in section 01, but in a single pass with no join. The new column already tells a story: Ben's 450 is 71.4% of everything he has spent, one big order, while Asha's spending is spread evenly.</p>
  <p>Think of a crowded local train. <code>OVER ()</code> is an announcement to the whole train: every passenger hears the same number, "1,800 people on board". <code>PARTITION BY coach</code> is a separate announcement in each coach: each passenger hears the head count of their own coach only. You can partition by several columns or expressions, for example <code>PARTITION BY restaurant_id, ordered_at::date</code> for "per restaurant per day". The same idea also gives a one-line answer to "orders above their own restaurant's average" from <a class="xref" data-note="sql_subqueries">Subqueries</a>: <code>AVG(amount) OVER (PARTITION BY restaurant_id)</code>.</p>
  <p>Two cautions. Forgetting PARTITION BY gives a perfectly valid query with company-wide numbers (3510 instead of 930), so for every window ask yourself "per what?". And a window sees only the rows left <em>after</em> WHERE: add <code>WHERE status = 'delivered'</code> and <code>SUM(amount) OVER ()</code> becomes the delivered total, 2630, not 3510. That is often what you want, but name the column so readers know.</p>

  <h2 id="sw-order"><span class="num">03</span>ORDER BY Inside the Window</h2>
  <p>So far every row in a partition sees the whole partition, so Asha's first order already "knows" about her third. The customer team's next question breaks that: "how much had Asha spent <em>by the time</em> of each order?" At order 104 the answer should be 240 + 380 = 620, not 930. The window needs to respect time.</p>
  <p>Adding <code>ORDER BY</code> inside the brackets does two things. It puts the rows of each partition in a sequence, and it changes what an aggregate sees: instead of the whole partition, each row now sees the rows from the start of its partition up to itself. The query below puts all three versions side by side for Asha and Ben, so you can compare them on the same rows:</p>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, amount,
  SUM(amount) OVER ()                                              AS all_rows,
  SUM(amount) OVER (PARTITION BY customer_id)                      AS per_customer,
  SUM(amount) OVER (PARTITION BY customer_id ORDER BY ordered_at)  AS running
FROM orders
WHERE customer_id IN (1, 2)
ORDER BY customer_id, ordered_at;</div>
  <div class="fx" data-lang="text"> order_id | customer_id | amount | all_rows | per_customer | running 
----------+-------------+--------+----------+--------------+---------
      101 |           1 | 240.00 |  1560.00 |       930.00 |  240.00
      104 |           1 | 380.00 |  1560.00 |       930.00 |  620.00
      110 |           1 | 310.00 |  1560.00 |       930.00 |  930.00
      102 |           2 | 450.00 |  1560.00 |       630.00 |  450.00
      106 |           2 | 180.00 |  1560.00 |       630.00 |  630.00
(5 rows)</div>
  <p>Read the three right-hand columns from left to right. <code>all_rows</code> uses an empty window and shows 1560, not 3510, because the WHERE kept only Asha's and Ben's five orders, and windows see what WHERE leaves. <code>per_customer</code> adds a partition, so Asha's rows show 930 and Ben's 630. <code>running</code> adds an order, so each row sees its partition only up to itself: Asha goes 240, then 240 + 380 = 620, then 930; Ben's partition starts afresh at 450 and then 630. This is a <strong>running total</strong> (also called a cumulative sum), and the last row of each partition always equals the partition total. The table spells out what each row's window contains:</p>
  <table class="tbl"><caption>What each row's window contains</caption>
    <tr><th>row</th><th>OVER ()</th><th>PARTITION BY customer</th><th>… ORDER BY ordered_at</th></tr>
    <tr><td>101 Asha</td><td>all 5 → 1560</td><td>101, 104, 110 → 930</td><td>101 → 240</td></tr>
    <tr><td>104 Asha</td><td>all 5 → 1560</td><td>101, 104, 110 → 930</td><td>101, 104 → 620</td></tr>
    <tr><td>110 Asha</td><td>all 5 → 1560</td><td>101, 104, 110 → 930</td><td>101, 104, 110 → 930</td></tr>
    <tr><td>102 Ben</td><td>all 5 → 1560</td><td>102, 106 → 630</td><td>102 → 450</td></tr>
    <tr><td>106 Ben</td><td>all 5 → 1560</td><td>102, 106 → 630</td><td>102, 106 → 630</td></tr>
  </table>
  <p>On the train, ORDER BY is like lining up each coach's passengers by seat number: once there is a line, "the person before me" and "everyone up to me" start to mean something. That is why ORDER BY is also what makes the positional functions of the next sections (ROW_NUMBER, LAG) possible. One point confuses many people: the ORDER BY inside OVER only defines the sequence <em>for the window</em>. It does not sort the query's output. If you want the rows displayed in a particular order, the query still needs its own ORDER BY at the end.</p>
  <p>It helps to know exactly when windows are computed. SQL works through a query in a fixed logical order: FROM and JOIN, then WHERE, then GROUP BY and HAVING, then <strong>window functions</strong>, then the SELECT list, and finally ORDER BY and LIMIT. Two consequences follow. First, WHERE runs before windows exist, so you cannot filter on a window in WHERE (section 09 deals with this). Second, windows run after GROUP BY, so a window can work on grouped results, and an aggregate can sit inside a window function:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id,
       SUM(amount)                                              AS restaurant_total,
       SUM(SUM(amount)) OVER ()                                 AS company_total,
       ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 1) AS pct
FROM orders
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | restaurant_total | company_total | pct  
---------------+------------------+---------------+------
            10 |           810.00 |       3510.00 | 23.1
            11 |          1230.00 |       3510.00 | 35.0
            12 |          1160.00 |       3510.00 | 33.0
            13 |           310.00 |       3510.00 |  8.8
(4 rows)</div>
  <p>GROUP BY first reduces the orders to four restaurant rows: Dosa Hut 810, Biryani Bros 1230, Pizza Point 1160 and Green Bowl 310. Then <code>SUM(SUM(amount)) OVER ()</code> adds up those four group totals across all rows, giving 3510. The inner SUM belongs to GROUP BY; the outer SUM with OVER is the window, running over the already-grouped rows. Biryani Bros brings in 35% of order value.</p>

  <h2 id="sw-rank"><span class="num">04</span>ROW_NUMBER, RANK and DENSE_RANK</h2>
  <p>Once rows are in order, positions mean something: first, second, tenth. "Rank the orders by amount" sounds simple until two orders have the same amount. Orders 105 and 110 are both 310; 107 and 108 are both 260. Should tied orders share a place? And should the order after a tie be 7th or 6th? SQL offers three ranking functions, and they differ <em>only</em> in how they answer these questions.</p>
  <p>Think of a school sports day where two runners tie for fifth place. <strong>ROW_NUMBER</strong> gives every row a different number, 1, 2, 3 and so on, as if the teacher tossed a coin to separate the tied runners. <strong>RANK</strong> gives tied rows the same number and then skips: both runners are 5th, and the next runner is 7th, because six people finished ahead of them. <strong>DENSE_RANK</strong> gives tied rows the same number with no skip: both are 5th and the next is 6th. Here are all three on Biteful's orders, largest first:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
  ROW_NUMBER() OVER (ORDER BY amount DESC, order_id) AS row_num,
  RANK()       OVER (ORDER BY amount DESC)           AS rnk,
  DENSE_RANK() OVER (ORDER BY amount DESC)           AS dense
FROM orders
ORDER BY amount DESC, order_id;</div>
  <div class="fx" data-lang="text"> order_id | amount | row_num | rnk | dense 
----------+--------+---------+-----+-------
      109 | 600.00 |       1 |   1 |     1
      103 | 520.00 |       2 |   2 |     2
      102 | 450.00 |       3 |   3 |     3
      104 | 380.00 |       4 |   4 |     4
      105 | 310.00 |       5 |   5 |     5
      110 | 310.00 |       6 |   5 |     5
      107 | 260.00 |       7 |   7 |     6
      108 | 260.00 |       8 |   7 |     6
      101 | 240.00 |       9 |   9 |     7
      106 | 180.00 |      10 |  10 |     8
(10 rows)</div>
  <p>The first four orders have different amounts, so all three functions agree on 1 to 4. At the 310 tie they split. ROW_NUMBER gives 105 and 110 the numbers 5 and 6. RANK and DENSE_RANK both give them 5. At the next amount, 260, RANK jumps to 7, because six rows are strictly ahead, while DENSE_RANK moves to 6, because only five distinct amounts are ahead (600, 520, 450, 380, 310). By the end, RANK reaches 10 and DENSE_RANK only 8. A compact way to remember it: RANK is 1 + the number of rows strictly ahead of me; DENSE_RANK is 1 + the number of distinct values ahead of me; ROW_NUMBER is simply my position in the list.</p>
  <p>Notice the <code>, order_id</code> in ROW_NUMBER's ORDER BY. It is a <strong>tie-breaker</strong>: a second sort key used only when the first one ties. Without it, the database is free to number 105 and 110 in either order, and the choice can change between runs, which makes reports quietly unstable. Whenever you use ROW_NUMBER, make the ORDER BY unique.</p>
  <p>Ranking works inside partitions too. Here each customer's orders are numbered from largest to smallest:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, amount,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC, order_id) AS rn
FROM orders
WHERE customer_id IN (1, 2, 3)
ORDER BY customer_id, rn;</div>
  <div class="fx" data-lang="text"> customer_id | order_id | amount | rn 
-------------+----------+--------+----
           1 |      104 | 380.00 |  1
           1 |      110 | 310.00 |  2
           1 |      101 | 240.00 |  3
           2 |      102 | 450.00 |  1
           2 |      106 | 180.00 |  2
           3 |      103 | 520.00 |  1
           3 |      108 | 260.00 |  2
(7 rows)</div>
  <p>The numbering restarts for every customer: Asha's largest order, 104, is her number 1, and Ben's largest, 102, is his. This "number within each group" is the foundation of the top-N pattern in section 09. Which function to choose depends on the question. ROW_NUMBER is right when you want exactly N rows per group, or one row per key when removing duplicates. DENSE_RANK is right for "the Nth highest <em>value</em>", because it never skips numbers. RANK is right for competition-style places, where a tie for first really does mean nobody came second.</p>

  <h2 id="sw-dist"><span class="num">05</span>NTILE and Percentiles</h2>
  <p>A rank says "order 105 is 5th of 10". Marketing asks a different kind of question: is it in the top quarter of orders? What percentile is it? These questions are about where a row sits in the whole spread, and three window functions answer them. <strong>NTILE(n)</strong> splits the ordered rows into n buckets of as equal size as possible and returns the bucket number; NTILE(4) gives quartiles. <strong>PERCENT_RANK()</strong> is (rank − 1) / (number of rows − 1), a relative rank that is 0 for the lowest row and 1 for the highest. <strong>CUME_DIST()</strong>, short for cumulative distribution, is the fraction of rows whose value is less than or equal to the current row's. Think of a teacher seating 40 students in four rows by marks, top 10 in the front row: that is NTILE(4). "You scored as well as or better than 60% of the class" is CUME_DIST.</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
  NTILE(4)       OVER (ORDER BY amount DESC, order_id)              AS quartile,
  ROUND(PERCENT_RANK() OVER (ORDER BY amount)::numeric, 2)          AS pct_rank,
  ROUND(CUME_DIST()    OVER (ORDER BY amount)::numeric, 2)          AS cume_dist
FROM orders
ORDER BY amount DESC, order_id;</div>
  <div class="fx" data-lang="text"> order_id | amount | quartile | pct_rank | cume_dist 
----------+--------+----------+----------+-----------
      109 | 600.00 |        1 |     1.00 |      1.00
      103 | 520.00 |        1 |     0.89 |      0.90
      102 | 450.00 |        1 |     0.78 |      0.80
      104 | 380.00 |        2 |     0.67 |      0.70
      105 | 310.00 |        2 |     0.44 |      0.60
      110 | 310.00 |        2 |     0.44 |      0.60
      107 | 260.00 |        3 |     0.22 |      0.40
      108 | 260.00 |        3 |     0.22 |      0.40
      101 | 240.00 |        4 |     0.11 |      0.20
      106 | 180.00 |        4 |     0.00 |      0.10
(10 rows)</div>
  <p>Follow order 105 (310) through each column. Ranked from smallest, 180, 240, 260 and 260 come before it, so its ascending rank is 5 and its PERCENT_RANK is (5 − 1) / (10 − 1) = 0.44. Six rows have an amount of 310 or less (180, 240, 260, 260, 310, 310), so its CUME_DIST is 6 / 10 = 0.60. For NTILE(4), ten rows cannot be split into four equal buckets, so the earlier buckets get the extra rows: sizes 3, 3, 2, 2. Order 105 is the fifth row from the top, which falls in bucket 2.</p>
  <p>NTILE fills buckets purely by <em>count</em>, so where ties land depends on where the bucket edges happen to fall. With four buckets both tied pairs stayed together. With three buckets (sizes 4, 3, 3) the 260 pair is split:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount, NTILE(3) OVER (ORDER BY amount DESC, order_id) AS bucket
FROM orders
ORDER BY amount DESC, order_id;</div>
  <div class="fx" data-lang="text"> order_id | amount | bucket 
----------+--------+--------
      109 | 600.00 |      1
      103 | 520.00 |      1
      102 | 450.00 |      1
      104 | 380.00 |      1
      105 | 310.00 |      2
      110 | 310.00 |      2
      107 | 260.00 |      2
      108 | 260.00 |      3
      101 | 240.00 |      3
      106 | 180.00 |      3
(10 rows)</div>
  <p>Orders 107 and 108 have the same amount, yet 107 is in bucket 2 and 108 in bucket 3, only because the edge between buckets fell between them. If equal values must always land in the same group, bucket on PERCENT_RANK or CUME_DIST thresholds instead (for example "CUME_DIST &gt; 0.75 is the top quartile").</p>
  <p>For the median and other exact percentiles, PostgreSQL provides <code>PERCENTILE_CONT</code>. It is an ordered-set aggregate, meaning it collapses each group to one row like any aggregate; it is not a window function in PostgreSQL:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median_amount,
  ROUND(AVG(amount), 2)                               AS avg_amount
FROM orders
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | median_amount | avg_amount 
---------------+---------------+------------
            10 |           260 |     270.00
            11 |           450 |     410.00
            12 |           380 |     386.67
            13 |           310 |     310.00
(4 rows)</div>
  <p>Biryani Bros' orders are 180, 450 and 600, so the median (the middle value) is 450, while the mean is 410, pulled down by the small 180 order. The median is often the better "typical order" figure because one unusual order cannot drag it far. If you need the group's median next to every row, compute it per group in a CTE and join it back.</p>

  <h2 id="sw-lag"><span class="num">06</span>LAG and LEAD</h2>
  <p>Ranks and percentiles compare a row with all the others. Many questions only need the row next door. "How long does a customer wait between orders?" needs each order to see that customer's <em>previous</em> order. Plain SQL works row by row and cannot look sideways; the old workaround was a self-join on "the latest earlier order by the same customer", which is slow and fiddly to write correctly.</p>
  <p><strong>LAG(col)</strong> returns the value of <code>col</code> from the previous row in the window, and <strong>LEAD(col)</strong> returns it from the next row. The window's ORDER BY defines what "previous" and "next" mean, and PARTITION BY keeps the lookup inside one customer. Think of an electricity bill that prints last month's meter reading on the same line as this month's, so you can subtract them: LAG is that "last month" figure, and LEAD would be next month's.</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id,
  to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at,
  LAG(order_id)  OVER (PARTITION BY customer_id ORDER BY ordered_at) AS prev_order,
  LEAD(order_id) OVER (PARTITION BY customer_id ORDER BY ordered_at) AS next_order,
  ordered_at - LAG(ordered_at) OVER (PARTITION BY customer_id ORDER BY ordered_at) AS since_prev
FROM orders
WHERE customer_id IN (1, 2, 3)
ORDER BY customer_id, ordered_at;</div>
  <div class="fx" data-lang="text"> customer_id | order_id |  ordered_at  | prev_order | next_order |   since_prev    
-------------+----------+--------------+------------+------------+-----------------
           1 |      101 | Mar 02 12:10 |       NULL |        104 | NULL
           1 |      104 | Mar 03 13:15 |        101 |        110 | 1 day 01:05:00
           1 |      110 | Mar 08 20:50 |        104 |       NULL | 5 days 07:35:00
           2 |      102 | Mar 02 13:05 |       NULL |        106 | NULL
           2 |      106 | Mar 04 12:40 |        102 |       NULL | 1 day 23:35:00
           3 |      103 | Mar 02 20:30 |       NULL |        108 | NULL
           3 |      108 | Mar 05 18:20 |        103 |       NULL | 2 days 21:50:00
(7 rows)</div>
  <p>Within Asha's partition, ordered by time, order 104's previous order is 101 and its next is 110. Subtracting two timestamps in PostgreSQL gives an <code>interval</code>, so <code>since_prev</code> shows that Asha waited 1 day 1 hour 5 minutes before her second order and 5 days 7 hours 35 minutes before her third. The first row of each partition has no previous row, so LAG returns NULL, and anything minus NULL is NULL. LEAD mirrors this at the other end: the last order of each customer has no next order. "Days since the previous order" is a classic feature in churn models, and this single expression computes it for every order.</p>
  <p>The partition is essential. Here is LAG without it:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id,
  to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at,
  LAG(order_id) OVER (ORDER BY ordered_at) AS prev_order
FROM orders
ORDER BY ordered_at
LIMIT 5;</div>
  <div class="fx" data-lang="text"> customer_id | order_id |  ordered_at  | prev_order 
-------------+----------+--------------+------------
           1 |      101 | Mar 02 12:10 |       NULL
           2 |      102 | Mar 02 13:05 |        101
           3 |      103 | Mar 02 20:30 |        102
           1 |      104 | Mar 03 13:15 |        103
           4 |      105 | Mar 03 19:45 |        104
(5 rows)</div>
  <p>Now the window is all orders in time order, so Ben's order 102 is "after" Asha's 101, and Chen's 103 after Ben's 102. Those comparisons are meaningless, since they belong to different customers, yet the query runs without any error. Whenever you use LAG or LEAD to compare an entity with its own history, partition by that entity.</p>
  <p>LAG and LEAD accept two optional arguments: how many rows back (or forward) to look, and a default value to use when no such row exists:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
  LAG(amount, 1, 0) OVER (ORDER BY ordered_at) AS prev_amount,
  LAG(amount, 2)    OVER (ORDER BY ordered_at) AS two_back
FROM orders
ORDER BY ordered_at
LIMIT 4;</div>
  <div class="fx" data-lang="text"> order_id | amount | prev_amount | two_back 
----------+--------+-------------+----------
      101 | 240.00 |           0 |     NULL
      102 | 450.00 |      240.00 |     NULL
      103 | 520.00 |      450.00 |   240.00
      104 | 380.00 |      520.00 |   450.00
(4 rows)</div>
  <p><code>LAG(amount, 1, 0)</code> returns 0 instead of NULL on the first row. <code>LAG(amount, 2)</code> looks two rows back, so it only gets a value from the third row onwards (order 103 sees 101's 240). Choose the default carefully, and think about what the first row's NULL means for later calculations: an AVG of the gaps simply ignores NULLs, which is usually right, while replacing them with 0 would wrongly pull the average down.</p>

  <h2 id="sw-run"><span class="num">07</span>Running Totals, Moving Averages and Shares</h2>
  <p>LAG compares a row with one neighbour. The finance dashboard needs calculations over many rows at once. For each day it wants the value of orders placed that day (called <strong>GMV</strong>, gross merchandise value), the cumulative value so far, the change from the previous day, and a smoothed figure that is less jumpy than the raw daily number. First, the daily totals:</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, SUM(amount) AS gmv
FROM orders
GROUP BY 1
ORDER BY 1;</div>
  <div class="fx" data-lang="text">    day     |   gmv   
------------+---------
 2026-03-02 | 1210.00
 2026-03-03 |  690.00
 2026-03-04 |  440.00
 2026-03-05 |  860.00
 2026-03-08 |  310.00
(5 rows)</div>
  <p>There are five days with orders; Mar 6 and 7 have no rows at all. Now all the dashboard columns at once, each a different window over this daily table:</p>
  <div class="fx" data-lang="sql">WITH daily AS (
  SELECT ordered_at::date AS day, SUM(amount) AS gmv
  FROM orders GROUP BY 1
)
SELECT day, gmv,
  SUM(gmv) OVER (ORDER BY day)                                      AS running_total,
  gmv - LAG(gmv) OVER (ORDER BY day)                                AS change,
  ROUND(AVG(gmv) OVER (ORDER BY day
        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 2)               AS moving_avg_2,
  ROUND(100.0 * SUM(gmv) OVER (ORDER BY day) / SUM(gmv) OVER (), 1) AS cum_pct
FROM daily
ORDER BY day;</div>
  <div class="fx" data-lang="text">    day     |   gmv   | running_total | change  | moving_avg_2 | cum_pct 
------------+---------+---------------+---------+--------------+---------
 2026-03-02 | 1210.00 |       1210.00 |    NULL |      1210.00 |    34.5
 2026-03-03 |  690.00 |       1900.00 | -520.00 |       950.00 |    54.1
 2026-03-04 |  440.00 |       2340.00 | -250.00 |       565.00 |    66.7
 2026-03-05 |  860.00 |       3200.00 |  420.00 |       650.00 |    91.2
 2026-03-08 |  310.00 |       3510.00 | -550.00 |       585.00 |   100.0
(5 rows)</div>
  <p>Take the columns one at a time. <code>running_total</code> is <code>SUM(gmv) OVER (ORDER BY day)</code>, the running total from section 03, now over days: 1210, then 1210 + 690 = 1900, and so on up to 3510. <code>change</code> subtracts the previous day's value using LAG: Mar 3 was 520 lower than Mar 2. <code>moving_avg_2</code> is a <strong>moving average</strong>: the average over a fixed-size group of rows that slides along with the current row. Here the size is set by <code>ROWS BETWEEN 1 PRECEDING AND CURRENT ROW</code>, meaning "the previous row and this row", so Mar 3's value is (1210 + 690) / 2 = 950, and Mar 4's is (690 + 440) / 2 = 565. Finally, <code>cum_pct</code> divides the running total by the grand total (<code>SUM(gmv) OVER ()</code>): by the end of Mar 4, 66.7% of the week's order value had already been placed. The trace shows how the two windows move:</p>
  <table class="tbl"><caption>How the running and moving windows move down the rows</caption>
    <tr><th>current row</th><th>running window</th><th>sum</th><th>moving window (1 preceding)</th><th>avg</th></tr>
    <tr><td>Mar 2</td><td>1210</td><td>1210</td><td>1210</td><td>1210</td></tr>
    <tr><td>Mar 3</td><td>1210, 690</td><td>1900</td><td>1210, 690</td><td>950</td></tr>
    <tr><td>Mar 4</td><td>1210, 690, 440</td><td>2340</td><td>690, 440</td><td>565</td></tr>
    <tr><td>Mar 5</td><td>… + 860</td><td>3200</td><td>440, 860</td><td>650</td></tr>
    <tr><td>Mar 8</td><td>… + 310</td><td>3510</td><td>860, 310</td><td>585</td></tr>
  </table>
  <p>The running window grows by one row at each step, while the moving window slides, always holding two rows (except on the first day, where nothing precedes it). Think of a cricket scoreboard: the total after each over is a running total, and "run rate over the last two overs" is a moving average that slides forward one over at a time.</p>
  <p>Look again at the last row. Mar 8's moving average mixes Mar 5 and Mar 8, which are three days apart, because "1 preceding" counts <em>rows</em>, and the missing days have no rows. Also, these windows ran on a daily table with exactly one row per day. On the raw orders table, several orders share a date, and the running total behaves differently. Both effects come from the same thing, the window's <em>frame</em>, which is the subject of the next section.</p>

  <h2 id="sw-frame"><span class="num">08</span>Window Frames: ROWS vs RANGE</h2>
  <p>A <strong>frame</strong> is the exact set of rows, within the partition, that an aggregate sees for the current row. You write it after the ORDER BY as <code>ROWS BETWEEN start AND end</code> or <code>RANGE BETWEEN start AND end</code>, where start and end are chosen from <code>UNBOUNDED PRECEDING</code> (the first row of the partition), <code>n PRECEDING</code>, <code>CURRENT ROW</code>, <code>n FOLLOWING</code> and <code>UNBOUNDED FOLLOWING</code> (the last row). The difference between the two words is how distance is measured. <strong>ROWS</strong> counts physical rows: "2 preceding" means the two rows just above me. <strong>RANGE</strong> measures by the ORDER BY <em>value</em>: "2 days preceding" means every row whose date is within two days of mine, however many rows that is. Think of a bank queue: ROWS is "you and the two people physically ahead of you"; RANGE is "everyone who arrived within two minutes of you", so everyone who arrived in the same minute as you comes along as a group.</p>
  <p>The part that surprises people is the default. If a window has no ORDER BY, the frame is the whole partition. If it has an ORDER BY but you write no frame, the frame is <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>: from the start of the partition up to the current row <em>and all its peers</em>. <strong>Peers</strong> are rows with the same ORDER BY value. To see this, order the ten orders by date only, so that same-day orders become peers, and compare the default with an explicit ROWS frame:</p>
  <div class="fx" data-lang="sql">SELECT order_id, ordered_at::date AS day, amount,
  SUM(amount) OVER (ORDER BY ordered_at::date)             AS range_default,
  SUM(amount) OVER (ORDER BY ordered_at::date, order_id
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)   AS rows_running
FROM orders
ORDER BY day, order_id;</div>
  <div class="fx" data-lang="text"> order_id |    day     | amount | range_default | rows_running 
----------+------------+--------+---------------+--------------
      101 | 2026-03-02 | 240.00 |       1210.00 |       240.00
      102 | 2026-03-02 | 450.00 |       1210.00 |       690.00
      103 | 2026-03-02 | 520.00 |       1210.00 |      1210.00
      104 | 2026-03-03 | 380.00 |       1900.00 |      1590.00
      105 | 2026-03-03 | 310.00 |       1900.00 |      1900.00
      106 | 2026-03-04 | 180.00 |       2340.00 |      2080.00
      107 | 2026-03-04 | 260.00 |       2340.00 |      2340.00
      108 | 2026-03-05 | 260.00 |       3200.00 |      2600.00
      109 | 2026-03-05 | 600.00 |       3200.00 |      3200.00
      110 | 2026-03-08 | 310.00 |       3510.00 |      3510.00
(10 rows)</div>
  <p>Look at the three Mar 2 orders. In <code>range_default</code>, all three show 1210, the whole day's total, because they share the same date and RANGE treats peers as a single step: for order 101, "up to the current row" already includes its peers 102 and 103. In <code>rows_running</code>, ROWS goes row by row, giving 240, then 240 + 450 = 690, then 1210. The figure shows the frame for order 102:</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <g font-size="10">
    <text x="235" y="18" text-anchor="middle" class="tg">current row</text><text x="327" y="18" text-anchor="middle" class="tm">peer (same day)</text>
    <text x="10" y="52" class="tm">ORDER BY day</text>
    <rect x="100" y="28" width="86" height="40" rx="5" class="fv"/><text x="143" y="44" text-anchor="middle">101 Mar 2</text><text x="143" y="60" text-anchor="middle" font-weight="bold">240</text>
    <rect x="192" y="28" width="86" height="40" rx="5" class="fg sg"/><text x="235" y="44" text-anchor="middle">102 Mar 2</text><text x="235" y="60" text-anchor="middle" font-weight="bold">450</text>
    <rect x="284" y="28" width="86" height="40" rx="5" class="fv"/><text x="327" y="44" text-anchor="middle">103 Mar 2</text><text x="327" y="60" text-anchor="middle" font-weight="bold">520</text>
    <rect x="376" y="28" width="86" height="40" rx="5" class="fs"/><text x="419" y="44" text-anchor="middle">104 Mar 3</text><text x="419" y="60" text-anchor="middle" font-weight="bold">380</text>
    <rect x="468" y="28" width="86" height="40" rx="5" class="fs"/><text x="511" y="44" text-anchor="middle">…</text><text x="511" y="60" text-anchor="middle" font-weight="bold">…</text>
    <text x="10" y="99">ROWS</text>
    <rect x="100" y="86" width="178" height="20" rx="4" class="ft st"/><text x="189" y="100" text-anchor="middle">up to this row → 690</text>
    <text x="10" y="129">RANGE (default)</text>
    <rect x="100" y="116" width="270" height="20" rx="4" class="fr sr"/><text x="235" y="130" text-anchor="middle">up to this value, incl. 103 → 1210</text>
    </g>
  </svg><figcaption>For order 102, the ROWS frame stops at 102 itself (240 + 450 = 690). The default RANGE frame stops at the last row with the same date, so it also takes in 103 (1210).</figcaption></figure>
  <p>Neither is wrong: RANGE answers "total as of the end of this day", ROWS answers "running balance after each order". But if you wanted the second and relied on the default, you got the first. A row-by-row frame is also only repeatable when the ORDER BY is unique, which is why <code>, order_id</code> is added as a tie-breaker in the ROWS version; without it, the three Mar 2 orders could be processed in any order.</p>
  <p>RANGE becomes genuinely useful with an interval, because it lets you say "the last 3 days" instead of "the last 3 rows". On the daily table, which has no rows for Mar 6 and 7, compare the two:</p>
  <div class="fx" data-lang="sql">WITH daily AS (
  SELECT ordered_at::date AS day, SUM(amount) AS gmv FROM orders GROUP BY 1
)
SELECT day, gmv,
  SUM(gmv) OVER (ORDER BY day
       ROWS  BETWEEN 2 PRECEDING AND CURRENT ROW)                 AS last_3_rows,
  SUM(gmv) OVER (ORDER BY day
       RANGE BETWEEN INTERVAL '2 days' PRECEDING AND CURRENT ROW) AS last_3_days
FROM daily
ORDER BY day;</div>
  <div class="fx" data-lang="text">    day     |   gmv   | last_3_rows | last_3_days 
------------+---------+-------------+-------------
 2026-03-02 | 1210.00 |     1210.00 |     1210.00
 2026-03-03 |  690.00 |     1900.00 |     1900.00
 2026-03-04 |  440.00 |     2340.00 |     2340.00
 2026-03-05 |  860.00 |     1990.00 |     1990.00
 2026-03-08 |  310.00 |     1610.00 |      310.00
(5 rows)</div>
  <p>Until Mar 5 the columns agree, because Mar 3, 4 and 5 are consecutive both as rows and as dates. On Mar 8 they part company. <code>ROWS BETWEEN 2 PRECEDING</code> takes the two previous <em>rows</em>, Mar 4 and Mar 5, and reports 1610 for a "3-day" window that really spans five days. <code>RANGE BETWEEN INTERVAL '2 days' PRECEDING</code> takes the rows whose <em>date</em> falls between Mar 6 and Mar 8, which is only Mar 8 itself, giving 310. If a dashboard says "last 7 days", ROWS on data with missing days silently reaches further back than 7 days. Either fill the missing days with zero rows first (a date spine, from <a class="xref" data-note="sql_subqueries">Subqueries</a>) or use a RANGE interval. PostgreSQL also supports a third frame type, <strong>GROUPS</strong>, which counts groups of peers instead of rows.</p>
  <p>The default frame causes one more classic surprise. <code>FIRST_VALUE(x)</code> returns x from the first row of the frame and <code>LAST_VALUE(x)</code> from the last row. Suppose we want each order shown with the customer's biggest and smallest order:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, amount,
  FIRST_VALUE(order_id) OVER w AS biggest,
  LAST_VALUE(order_id)  OVER w AS smallest_wrong,
  LAST_VALUE(order_id)  OVER (w ROWS BETWEEN UNBOUNDED PRECEDING
                                 AND UNBOUNDED FOLLOWING) AS smallest
FROM orders
WHERE customer_id IN (1, 2)
WINDOW w AS (PARTITION BY customer_id ORDER BY amount DESC, order_id)
ORDER BY customer_id, amount DESC;</div>
  <div class="fx" data-lang="text"> customer_id | order_id | amount | biggest | smallest_wrong | smallest 
-------------+----------+--------+---------+----------------+----------
           1 |      104 | 380.00 |     104 |            104 |      101
           1 |      110 | 310.00 |     104 |            110 |      101
           1 |      101 | 240.00 |     104 |            101 |      101
           2 |      102 | 450.00 |     102 |            102 |      106
           2 |      106 | 180.00 |     102 |            106 |      106
(5 rows)</div>
  <p>FIRST_VALUE works: every Asha row shows 104, her biggest order. But <code>smallest_wrong</code> just repeats each row's own order id. With the default frame, the frame ends at the current row, so the "last row of the frame" is the current row itself: LAST_VALUE means "last so far". Extending the frame to <code>UNBOUNDED FOLLOWING</code> lets it see the whole partition, and 101 (Asha's smallest, 240) appears on every Asha row. The <code>WINDOW w AS (…)</code> clause at the bottom names a window definition once so several functions can share it, and <code>OVER (w ROWS …)</code> reuses it and adds a frame. The general rule: whenever you use SUM, AVG or LAST_VALUE with an ORDER BY, decide on the frame and write it out, rather than inheriting the default. (Ranking functions and LAG/LEAD ignore frames entirely.)</p>

  <h2 id="sw-topn"><span class="num">09</span>Top-N per Group</h2>
  <p>"Each restaurant's biggest order" and "the second-highest order value per restaurant" are among the most common SQL interview questions. We already know how to number orders within each restaurant. The obvious next step is to keep only number 1:</p>
  <div class="fx" data-lang="sql">SELECT order_id, restaurant_id, amount
FROM orders
WHERE ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY amount DESC) = 1;</div>
  <div class="fx" data-lang="text">ERROR:  window functions are not allowed in WHERE
LINE 3: WHERE ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY...
              ^</div>
  <p>Using a column alias does not help either:</p>
  <div class="fx" data-lang="sql">SELECT order_id, restaurant_id, amount,
       ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY amount DESC) AS rn
FROM orders
WHERE rn = 1;</div>
  <div class="fx" data-lang="text">ERROR:  column "rn" does not exist
LINE 4: WHERE rn = 1;
              ^</div>
  <p>Both errors come from the logical order in section 03. WHERE runs before window functions are computed, so at the moment WHERE is checking each row, there is no row number yet; and SELECT aliases such as <code>rn</code> are created even later. Think of college admissions: you cannot shortlist "the top rank holder" at the application stage, because ranks are only published after the exam. First publish the ranks, then shortlist.</p>
  <p>In SQL, "first publish the ranks" means computing the window in a CTE or subquery. In the outer query the row number is just an ordinary column, and WHERE can filter on it:</p>
  <div class="fx" data-lang="sql">WITH ranked AS (
  SELECT order_id, restaurant_id, amount,
         ROW_NUMBER() OVER (PARTITION BY restaurant_id
                            ORDER BY amount DESC, order_id) AS rn
  FROM orders
)
SELECT restaurant_id, order_id, amount
FROM ranked
WHERE rn = 1
ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | order_id | amount 
---------------+----------+--------
            10 |      110 | 310.00
            11 |      109 | 600.00
            12 |      103 | 520.00
            13 |      105 | 310.00
(4 rows)</div>
  <p>Inside the CTE, each restaurant's orders are numbered from the largest down, with <code>order_id</code> as a tie-breaker. The outer query keeps <code>rn = 1</code>: Dosa Hut's biggest order is 110 (310), Biryani Bros' is 109 (600), Pizza Point's 103 (520) and Green Bowl's 105 (310). For "second-highest <em>value</em>", use DENSE_RANK, so that a tie at the top cannot hide the second value:</p>
  <div class="fx" data-lang="sql">WITH ranked AS (
  SELECT order_id, restaurant_id, amount,
         DENSE_RANK() OVER (PARTITION BY restaurant_id ORDER BY amount DESC) AS rnk
  FROM orders
)
SELECT restaurant_id, order_id, amount
FROM ranked
WHERE rnk = 2
ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | order_id | amount 
---------------+----------+--------
            10 |      108 | 260.00
            11 |      102 | 450.00
            12 |      104 | 380.00
(3 rows)</div>
  <p>Green Bowl has only one order, so it has no second value and no row. Momo Magic never appears in either result, because it has no orders to rank; if every restaurant must be listed, LEFT JOIN this result to the <code>restaurants</code> table. The choice of function is what interviewers are really grading: "the top 2 orders" means exactly two rows per group (ROW_NUMBER); "orders with the top 2 amounts" may return more rows when there are ties (DENSE_RANK); "orders that finished in the top 2 places" follows competition rules (RANK). Say which you chose and why.</p>
  <p>The same ROW_NUMBER-equals-1 pattern is the standard way to remove duplicates or to keep the latest version of each record, which comes up constantly when a table receives repeated updates for the same key:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, to_char(ordered_at, 'Mon DD HH24:MI') AS latest
FROM (SELECT o.*,
             ROW_NUMBER() OVER (PARTITION BY customer_id
                                ORDER BY ordered_at DESC, order_id DESC) AS rn
      FROM orders o) t
WHERE rn = 1
ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> customer_id | order_id |    latest    
-------------+----------+--------------
           1 |      110 | Mar 08 20:50
           2 |      106 | Mar 04 12:40
           3 |      108 | Mar 05 18:20
           4 |      105 | Mar 03 19:45
           5 |      107 | Mar 04 21:10
           6 |      109 | Mar 05 20:05
(6 rows)</div>
  <p>Numbering each customer's orders from newest to oldest and keeping number 1 gives one row per customer: their latest order. Asha's is 110 on Mar 8. Several warehouses (Snowflake, BigQuery, Databricks, DuckDB) add a <strong>QUALIFY</strong> clause, which is a WHERE that runs after window functions, so the CTE is not needed there. PostgreSQL 16 does not have it:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, order_id, amount
FROM orders
QUALIFY ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY amount DESC, order_id) = 1;</div>
  <div class="fx" data-lang="text">ERROR:  syntax error at or near "ROW_NUMBER"
LINE 3: QUALIFY ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER ...
                ^</div>
  <p>In those engines the query above would return the same four rows as the CTE version; in PostgreSQL, the CTE is the way.</p>
  <p>Because WHERE runs first, it also changes what a window sees, and this is easy to overlook. Suppose we want each delivered order shown with the order placed just before it. Filtering in the same query removes the cancelled orders <em>before</em> LAG looks:</p>
  <div class="fx" data-lang="sql">SELECT order_id, status,
  LAG(order_id) OVER (ORDER BY ordered_at) AS prev_delivered
FROM orders
WHERE status = 'delivered'
ORDER BY ordered_at;</div>
  <div class="fx" data-lang="text"> order_id |  status   | prev_delivered 
----------+-----------+----------------
      101 | delivered |           NULL
      102 | delivered |            101
      103 | delivered |            102
      104 | delivered |            103
      106 | delivered |            104
      108 | delivered |            106
      109 | delivered |            108
(7 rows)</div>
  <p>Order 106's previous order is reported as 104, because order 105 (cancelled) was removed before LAG ran. That answers "previous <em>delivered</em> order". If the question was "previous order of any kind", compute LAG in a CTE over all rows, and filter afterwards:</p>
  <div class="fx" data-lang="sql">WITH all_orders AS (
  SELECT order_id, status, ordered_at,
         LAG(order_id) OVER (ORDER BY ordered_at) AS prev_any
  FROM orders
)
SELECT order_id, status, prev_any
FROM all_orders
WHERE status = 'delivered'
ORDER BY ordered_at;</div>
  <div class="fx" data-lang="text"> order_id |  status   | prev_any 
----------+-----------+----------
      101 | delivered |     NULL
      102 | delivered |      101
      103 | delivered |      102
      104 | delivered |      103
      106 | delivered |      105
      108 | delivered |      107
      109 | delivered |      108
(7 rows)</div>
  <p>Now 106 shows 105 and 108 shows 107, the cancelled orders that really came just before them, while only delivered rows are displayed. Neither version is wrong; they answer different questions, and the position of the filter is how you choose between them.</p>

  <h2 id="sw-gaps"><span class="num">10</span>Gaps and Islands</h2>
  <p>Operations wants each restaurant's streaks: runs of consecutive days on which it received at least one order. This family of problems is called <strong>gaps and islands</strong>: an <strong>island</strong> is a run of consecutive values, and a <strong>gap</strong> is the missing stretch between two islands. It is hard because no single row knows it belongs to a streak. LAG can tell a row whether yesterday also had an order, but we need to group entire runs together and measure them.</p>
  <p>The classic trick is to subtract a row number from the date. Number each restaurant's days in order with ROW_NUMBER. Inside a streak, the date goes up by one day and the row number goes up by one, so <em>date − row number</em> stays the same. When a day is missing, the date jumps by two while the row number still goes up by one, so the difference changes. That difference is therefore a label shared by all days of one streak and different for the next streak. Think of two friends climbing stairs side by side, one step per day: as long as neither skips a day, the distance between them stays fixed; the day one of them skips, the distance changes.</p>
  <div class="fx" data-lang="sql">WITH days AS (
  SELECT DISTINCT restaurant_id, ordered_at::date AS day FROM orders
)
SELECT restaurant_id, day,
  ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY day)            AS rn,
  day - ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY day)::int AS grp
FROM days
ORDER BY restaurant_id, day;</div>
  <div class="fx" data-lang="text"> restaurant_id |    day     | rn |    grp     
---------------+------------+----+------------
            10 | 2026-03-02 |  1 | 2026-03-01
            10 | 2026-03-05 |  2 | 2026-03-03
            10 | 2026-03-08 |  3 | 2026-03-05
            11 | 2026-03-02 |  1 | 2026-03-01
            11 | 2026-03-04 |  2 | 2026-03-02
            11 | 2026-03-05 |  3 | 2026-03-02
            12 | 2026-03-02 |  1 | 2026-03-01
            12 | 2026-03-03 |  2 | 2026-03-01
            12 | 2026-03-04 |  3 | 2026-03-01
            13 | 2026-03-03 |  1 | 2026-03-02
(10 rows)</div>
  <p>The <code>DISTINCT</code> in the CTE first reduces the data to one row per restaurant per day, which matters, as we will see. Look at Biryani Bros (11). Mar 2 is row 1, so its label is Mar 2 − 1 = Mar 1. Mar 3 is missing, so Mar 4 is row 2 and its label is Mar 2. Mar 5 is row 3, label Mar 5 − 3 = Mar 2 again. The label changed at the gap and stayed constant across the consecutive Mar 4 and Mar 5, exactly as intended. Pizza Point (12) has Mar 2, 3 and 4 all labelled Mar 1: one three-day island. The label <code>grp</code> is not a meaningful date; it is just a value that is equal within a streak. The second step groups by it:</p>
  <div class="fx" data-lang="sql">WITH days AS (
  SELECT DISTINCT restaurant_id, ordered_at::date AS day FROM orders
),
g AS (
  SELECT restaurant_id, day,
         day - ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY day)::int AS grp
  FROM days
)
SELECT restaurant_id, MIN(day) AS streak_start, MAX(day) AS streak_end, COUNT(*) AS days
FROM g
GROUP BY restaurant_id, grp
ORDER BY restaurant_id, streak_start;</div>
  <div class="fx" data-lang="text"> restaurant_id | streak_start | streak_end | days 
---------------+--------------+------------+------
            10 | 2026-03-02   | 2026-03-02 |    1
            10 | 2026-03-05   | 2026-03-05 |    1
            10 | 2026-03-08   | 2026-03-08 |    1
            11 | 2026-03-02   | 2026-03-02 |    1
            11 | 2026-03-04   | 2026-03-05 |    2
            12 | 2026-03-02   | 2026-03-04 |    3
            13 | 2026-03-03   | 2026-03-03 |    1
(7 rows)</div>
  <p>Pizza Point's Mar 2 to Mar 4 is the longest streak, three days. Biryani Bros has a two-day streak on Mar 4 and 5. Dosa Hut, with orders on Mar 2, 5 and 8, never has two days in a row. The partition by restaurant matters: without it, one restaurant's days would continue another's streak.</p>
  <p>Now the reason for the DISTINCT. Company-wide, several orders share a day (three on Mar 2). If we number the raw orders instead of distinct days, the row number rises with every order while the date stays the same, so the label shifts <em>within</em> a single day:</p>
  <div class="fx" data-lang="sql">WITH g AS (
  SELECT ordered_at::date AS day,
         ordered_at::date - ROW_NUMBER() OVER (ORDER BY ordered_at)::int AS grp
  FROM orders
)
SELECT MIN(day) AS streak_start, MAX(day) AS streak_end, COUNT(*) AS rows
FROM g GROUP BY grp ORDER BY streak_start;</div>
  <div class="fx" data-lang="text"> streak_start | streak_end | rows 
--------------+------------+------
 2026-03-02   | 2026-03-02 |    1
 2026-03-02   | 2026-03-03 |    2
 2026-03-02   | 2026-03-02 |    1
 2026-03-03   | 2026-03-08 |    3
 2026-03-04   | 2026-03-05 |    2
 2026-03-05   | 2026-03-05 |    1
(6 rows)</div>
  <p>These "streaks" are nonsense: Mar 2 appears in three different islands. The fix is either to deduplicate the dates first, as in the restaurant query, or to use <code>DENSE_RANK()</code> instead of ROW_NUMBER, because DENSE_RANK gives all orders on the same date the same number:</p>
  <div class="fx" data-lang="sql">WITH g AS (
  SELECT ordered_at::date AS day,
         ordered_at::date - DENSE_RANK() OVER (ORDER BY ordered_at::date)::int AS grp
  FROM orders
)
SELECT MIN(day) AS streak_start, MAX(day) AS streak_end,
       COUNT(DISTINCT day) AS days, COUNT(*) AS orders
FROM g GROUP BY grp ORDER BY streak_start;</div>
  <div class="fx" data-lang="text"> streak_start | streak_end | days | orders 
--------------+------------+------+--------
 2026-03-02   | 2026-03-05 |    4 |      9
 2026-03-08   | 2026-03-08 |    1 |      1
(2 rows)</div>
  <p>Now the answer is correct: Biteful received orders every day from Mar 2 to Mar 5 (4 days, 9 orders), then had a two-day gap, then one day, Mar 8. The same recipe finds login streaks, consecutive months of purchases, and periods when a server was down.</p>

  <h2 id="sw-sess"><span class="num">11</span>Sessionization</h2>
  <p>Gaps and islands works when "consecutive" has a fixed step, such as one day. App activity does not. The product team wants to group each customer's app events into <strong>sessions</strong>, where a session is a burst of activity and 30 minutes of silence starts a new one. The data has no session id and no natural step; there are only timestamps. Here is a small slice of Biteful's app event log for Asha and Ben around their first orders (the checkouts at 12:09 and 13:04 became orders 101 and 102):</p>
  <div class="fx" data-lang="sql">SELECT customer_id, to_char(event_at, 'Mon DD HH24:MI') AS event_at, event
FROM app_events
ORDER BY customer_id, event_at;</div>
  <div class="fx" data-lang="text"> customer_id |   event_at   |  event   
-------------+--------------+----------
           1 | Mar 02 11:52 | open
           1 | Mar 02 11:58 | menu
           1 | Mar 02 12:09 | checkout
           1 | Mar 02 19:40 | open
           1 | Mar 02 19:47 | menu
           1 | Mar 03 13:02 | open
           1 | Mar 03 13:14 | checkout
           2 | Mar 02 12:48 | open
           2 | Mar 02 13:04 | checkout
           2 | Mar 02 13:50 | open
(10 rows)</div>
  <p>The solution has two steps, and both are windows you already know. Step 1 uses LAG to find the gap since the customer's previous event, and turns it into a flag: 1 if this event starts a new session (it is the customer's first event, or the gap is over 30 minutes), otherwise 0. Step 2 takes a running SUM of the flags. Because the sum goes up by exactly 1 at each session start and stays flat in between, the running sum <em>is</em> the session number. Think of a librarian counting visits from a door log: each time a person comes in after more than half an hour away, she adds a tick next to their name, and the number of ticks so far is that person's visit number.</p>
  <div class="fx" data-lang="sql">WITH flagged AS (
  SELECT customer_id, event_at, event,
    event_at - LAG(event_at) OVER (PARTITION BY customer_id ORDER BY event_at) AS gap,
    CASE WHEN event_at - LAG(event_at) OVER (PARTITION BY customer_id ORDER BY event_at)
              &lt;= INTERVAL '30 minutes' THEN 0 ELSE 1 END AS new_session
  FROM app_events
)
SELECT customer_id, to_char(event_at, 'Mon DD HH24:MI') AS event_at, event, gap, new_session,
  SUM(new_session) OVER (PARTITION BY customer_id ORDER BY event_at) AS session_id
FROM flagged
ORDER BY customer_id, event_at;</div>
  <div class="fx" data-lang="text"> customer_id |   event_at   |  event   |   gap    | new_session | session_id 
-------------+--------------+----------+----------+-------------+------------
           1 | Mar 02 11:52 | open     | NULL     |           1 |          1
           1 | Mar 02 11:58 | menu     | 00:06:00 |           0 |          1
           1 | Mar 02 12:09 | checkout | 00:11:00 |           0 |          1
           1 | Mar 02 19:40 | open     | 07:31:00 |           1 |          2
           1 | Mar 02 19:47 | menu     | 00:07:00 |           0 |          2
           1 | Mar 03 13:02 | open     | 17:15:00 |           1 |          3
           1 | Mar 03 13:14 | checkout | 00:12:00 |           0 |          3
           2 | Mar 02 12:48 | open     | NULL     |           1 |          1
           2 | Mar 02 13:04 | checkout | 00:16:00 |           0 |          1
           2 | Mar 02 13:50 | open     | 00:46:00 |           1 |          2
(10 rows)</div>
  <p>Follow Asha's rows. Her first event has no previous event, so the gap is NULL. The CASE was written so that this falls through to ELSE: <code>NULL &lt;= 30 minutes</code> is UNKNOWN, not TRUE, so the flag is 1 and session 1 begins. The next two events are 6 and 11 minutes apart, flag 0, so the running sum stays at 1. At 19:40 the gap is 7 hours 31 minutes, so the flag is 1 and the sum becomes 2. The Mar 3 event comes 17 hours 15 minutes later and starts session 3. Ben's 13:50 open comes 46 minutes after his checkout, so it starts his session 2. Once every event has a session id, ordinary GROUP BY can describe the sessions:</p>
  <div class="fx" data-lang="sql">WITH flagged AS (
  SELECT customer_id, event_at, event,
    CASE WHEN event_at - LAG(event_at) OVER (PARTITION BY customer_id ORDER BY event_at)
              &lt;= INTERVAL '30 minutes' THEN 0 ELSE 1 END AS new_session
  FROM app_events
), numbered AS (
  SELECT customer_id, event_at, event,
         SUM(new_session) OVER (PARTITION BY customer_id ORDER BY event_at) AS session_id
  FROM flagged
)
SELECT customer_id, session_id,
       to_char(MIN(event_at), 'Mon DD HH24:MI') AS started,
       MAX(event_at) - MIN(event_at)            AS duration,
       COUNT(*)                                 AS events,
       BOOL_OR(event = 'checkout')              AS converted
FROM numbered
GROUP BY customer_id, session_id
ORDER BY customer_id, session_id;</div>
  <div class="fx" data-lang="text"> customer_id | session_id |   started    | duration | events | converted 
-------------+------------+--------------+----------+--------+-----------
           1 |          1 | Mar 02 11:52 | 00:17:00 |      3 | t
           1 |          2 | Mar 02 19:40 | 00:07:00 |      2 | f
           1 |          3 | Mar 03 13:02 | 00:12:00 |      2 | t
           2 |          1 | Mar 02 12:48 | 00:16:00 |      2 | t
           2 |          2 | Mar 02 13:50 | 00:00:00 |      1 | f
(5 rows)</div>
  <p>There are five sessions. <code>BOOL_OR(event = 'checkout')</code> is true if any event in the session was a checkout, and three of the five sessions ended in one, a session-level conversion rate of 3 / 5 = 60%. Asha's evening session (19:40, menu browsing, no checkout) is the kind a product team would study.</p>
  <p>This "flag where a new group starts, then running-SUM the flags" recipe is worth remembering on its own, because it solves far more than sessions: streaks that tolerate a one-day gap, periods where a status stays the same, and most problems phrased as "consecutive". It has the same two requirements as everything else on this page: PARTITION BY the entity (otherwise one customer's last event is compared with the next customer's first), and an ORDER BY that is unique, adding a tie-breaker column if two events can share a timestamp (otherwise the default RANGE frame of the running SUM treats them as one step). The same building blocks reappear as <code>groupby().transform</code>, <code>shift</code> and <code>rolling</code> in <a class="xref" data-note="da_pandas">Pandas</a>, and almost every question in <a class="xref" data-note="sql_interview">SQL Practice Q&amp;A</a> (retention, streaks, funnels, year-over-year growth) is one of these windows inside a CTE. On large tables, the sort each window needs is often the most expensive step of the query, which <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> explains.</p>

  <h2 id="sw-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Window queries rarely fail with an error; their mistakes produce numbers that look reasonable. The most common is a missing PARTITION BY, which silently compares or totals across different entities. Section 06 showed LAG comparing Ben's order with Asha's, and section 02 showed a total of 3510 where 930 was meant. Ask "per what?" for every window you write.</p>
  <p>The second is using RANK when the question asks for the Nth highest <em>value</em>. Because RANK skips numbers after a tie, the rank you are looking for may not exist at all:</p>
  <div class="fx" data-lang="sql">WITH r AS (
  SELECT order_id, amount,
         RANK()       OVER (ORDER BY amount DESC) AS rnk,
         DENSE_RANK() OVER (ORDER BY amount DESC) AS dense
  FROM orders
)
SELECT 'RANK = 6' AS test, COUNT(*) AS rows_found FROM r WHERE rnk = 6
UNION ALL
SELECT 'DENSE_RANK = 6', COUNT(*) FROM r WHERE dense = 6;</div>
  <div class="fx" data-lang="text">      test      | rows_found 
----------------+------------
 RANK = 6       |          0
 DENSE_RANK = 6 |          2
(2 rows)</div>
  <p>After the 310 tie, RANK jumps from 5 to 7, so "rank = 6" finds nothing, while DENSE_RANK finds the two orders with the sixth-highest amount (260). Use DENSE_RANK for "Nth highest value".</p>
  <p>The rest have all appeared on this page. ROW_NUMBER and ROWS frames over tied ORDER BY values give results that can change from run to run (105 and 110 at 310); add a unique tie-breaker such as <code>, order_id</code>. The default frame with an ORDER BY is RANGE, which lumps peers together (all three Mar 2 orders showed 1210); write <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> for a row-by-row running total. LAST_VALUE with the default frame returns the current row; extend the frame to <code>UNBOUNDED FOLLOWING</code> or use FIRST_VALUE with the order reversed. <code>ROWS n PRECEDING</code> on data with missing days counts rows, not days (Mar 8's "last 3 days" reached back to Mar 4); fill the calendar first or use a RANGE interval. A window cannot be used in WHERE; compute it in a CTE and filter outside. A filter in the same query as a window changes what the window sees (106's previous order became 104 instead of 105). Duplicate dates break the date − ROW_NUMBER trick; deduplicate first or use DENSE_RANK. And integer division turns percentages into zeros (600 / 3510 = 0); multiply by <code>100.0</code>.</p>

  <h2 id="sw-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Biteful's 10 orders in time order: 101 Asha 240, 102 Ben 450, 103 Chen 520 (Mar 2); 104 Asha 380, 105 Dia 310 (Mar 3); 106 Ben 180, 107 Esha 260 (Mar 4); 108 Chen 260, 109 Farah 600 (Mar 5); 110 Asha 310 (Mar 8). Total 3510; Asha 930. Ties: 310 (105, 110) and 260 (107, 108). Daily GMV 1210, 690, 440, 860, 310, with no rows on Mar 6–7.</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Window function</b>: <code>f(…) OVER (…)</code>; computes over a set of related rows and returns a value on every row; the row count does not change.</li>
    <li><b>Partition</b>: the rows sharing the PARTITION BY values; a window never crosses one.</li>
    <li><b>Window ORDER BY</b>: the sequence inside each partition; makes aggregates cumulative and enables ranking and LAG/LEAD. Does not sort the output.</li>
    <li><b>Frame</b>: the rows an aggregate sees for the current row. ROWS counts rows; RANGE uses ORDER BY values; GROUPS counts peer groups.</li>
    <li><b>Peers</b>: rows with equal ORDER BY values; RANGE frames include them together.</li>
    <li><b>Running total</b>: SUM from the partition start to the current row. <b>Moving average</b>: AVG over a fixed frame that slides.</li>
    <li><b>Gaps and islands</b>: finding runs of consecutive values. <b>Sessionization</b>: grouping events split by an inactivity threshold.</li>
  </ul>
  <h3>Ranking functions on the 310 / 260 ties</h3>
  <table class="tbl">
    <tr><th>Function</th><th>Rule</th><th>600, 520, 450, 380, 310, 310, 260, 260</th><th>Use for</th></tr>
    <tr><td>ROW_NUMBER</td><td>position, always +1</td><td>1, 2, 3, 4, 5, 6, 7, 8</td><td>exactly N rows, dedupe, latest record</td></tr>
    <tr><td>RANK</td><td>1 + rows strictly ahead</td><td>1, 2, 3, 4, 5, 5, 7, 7</td><td>competition places</td></tr>
    <tr><td>DENSE_RANK</td><td>1 + distinct values ahead</td><td>1, 2, 3, 4, 5, 5, 6, 6</td><td>Nth highest value</td></tr>
    <tr><td>NTILE(n)</td><td>n equal-count buckets, bigger first</td><td>10 rows into 4: sizes 3, 3, 2, 2</td><td>quartiles, deciles</td></tr>
    <tr><td>PERCENT_RANK</td><td>(rank − 1) / (n − 1)</td><td>order 105: 0.44</td><td>relative position 0…1</td></tr>
    <tr><td>CUME_DIST</td><td>rows ≤ me / n</td><td>order 105: 0.60</td><td>percentile</td></tr>
  </table>
  <h3>ROWS vs RANGE</h3>
  <table class="tbl">
    <tr><th>Frame</th><th>Measures</th><th>Biteful example</th></tr>
    <tr><td>Default with ORDER BY</td><td>RANGE UNBOUNDED PRECEDING to CURRENT ROW (with peers)</td><td>all three Mar 2 orders show 1210</td></tr>
    <tr><td>ROWS UNBOUNDED PRECEDING to CURRENT ROW</td><td>physical rows</td><td>Mar 2 orders show 240, 690, 1210</td></tr>
    <tr><td>ROWS 2 PRECEDING</td><td>last 3 rows</td><td>Mar 8: 1610 (Mar 4, 5, 8)</td></tr>
    <tr><td>RANGE INTERVAL '2 days' PRECEDING</td><td>last 3 calendar days</td><td>Mar 8: 310</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="sql">-- anatomy
f(x) OVER (PARTITION BY p ORDER BY o ROWS BETWEEN start AND end)

SUM(amount) OVER ()                                        -- grand total on every row
SUM(amount) OVER (PARTITION BY customer_id)                -- group total on every row
SUM(amount) OVER (PARTITION BY customer_id ORDER BY ordered_at
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)   -- running total
AVG(gmv)    OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)  -- moving average
ROUND(100.0 * amount / SUM(amount) OVER (), 1)             -- share of total
ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY amount DESC, order_id)
LAG(ordered_at) OVER (PARTITION BY customer_id ORDER BY ordered_at)
LAST_VALUE(x) OVER (... ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)

-- top-N per group
WITH r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY g ORDER BY v DESC, id) AS rn FROM t)
SELECT * FROM r WHERE rn &lt;= 2;

-- islands: day - ROW_NUMBER() is constant inside a streak
day - ROW_NUMBER() OVER (PARTITION BY e ORDER BY day)::int AS grp

-- sessions: flag new sessions, then running-sum the flags
flag = CASE WHEN ts - LAG(ts) OVER (PARTITION BY u ORDER BY ts)
                 &lt;= INTERVAL '30 minutes' THEN 0 ELSE 1 END     -- in a CTE
SUM(flag) OVER (PARTITION BY u ORDER BY ts) AS session_id           -- outside</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Windows run after WHERE and GROUP BY: they cannot be used in WHERE, and WHERE changes what they see.</li>
    <li>Missing PARTITION BY gives company-wide numbers without any error.</li>
    <li>ROW_NUMBER and ROWS frames need a unique tie-breaker to be repeatable.</li>
    <li>The default frame with ORDER BY is RANGE: peers are included together.</li>
    <li>LAST_VALUE needs a frame to UNBOUNDED FOLLOWING.</li>
    <li>ROWS n PRECEDING counts rows, not days, when days are missing.</li>
    <li>DENSE_RANK, not RANK, for the Nth highest value.</li>
    <li>Gaps and islands: deduplicate dates or use DENSE_RANK.</li>
    <li>Integer division: write <code>100.0 *</code>.</li>
  </ul>

  <h2 id="sw-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a window function, and how is it different from GROUP BY?</summary><div class="qa-body">A window function computes a value over a set of rows related to the current row and returns it on every row, so the number of rows is unchanged. GROUP BY collapses each group into a single row and loses the detail. <code>SUM(amount) OVER (PARTITION BY customer_id)</code> returns all 10 orders with their customer's total; <code>GROUP BY customer_id</code> returns 6 rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do PARTITION BY and ORDER BY do inside OVER?</summary><div class="qa-body">PARTITION BY splits the rows into independent groups, and each row's window is limited to its own group. ORDER BY puts the rows of each partition in sequence; it makes aggregates cumulative (a running total instead of the group total) and gives meaning to positional functions such as ROW_NUMBER and LAG. Neither one changes the number of rows or the order of the final output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between ROW_NUMBER, RANK and DENSE_RANK?</summary><div class="qa-body">They differ only on ties. ROW_NUMBER always gives a unique number (1, 2, 3, 4), breaking ties arbitrarily unless you add a tie-breaker. RANK gives tied rows the same number and then skips (1, 2, 2, 4). DENSE_RANK gives tied rows the same number with no gap (1, 2, 2, 3).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Values 90, 80, 80, 70 sorted descending: what are ROW_NUMBER, RANK and DENSE_RANK of 70?</summary><div class="qa-body">ROW_NUMBER 4, because it is the fourth row. RANK 4, because three rows are strictly ahead of it. DENSE_RANK 3, because only two distinct values (90 and 80) are ahead of it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the second-highest salary (or order value) per department?</summary><div class="qa-body">Compute <code>DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC)</code> in a CTE, then select the rows where the rank equals 2. DENSE_RANK is used so that a tie for the highest value does not make the second value disappear, as it would with RANK. Groups with only one distinct value return nothing, which should be stated or handled with a LEFT JOIN.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you use a window function in WHERE? How do you filter on one?</summary><div class="qa-body">SQL's logical order is FROM, WHERE, GROUP BY, HAVING, window functions, SELECT, ORDER BY. When WHERE runs, window values have not been computed yet, and SELECT aliases do not exist either. Compute the window in a CTE or subquery and filter in the outer query; Snowflake, BigQuery, Databricks and DuckDB also offer QUALIFY, but PostgreSQL does not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do LAG and LEAD do? Give a use case.</summary><div class="qa-body">LAG returns a value from a previous row in the window order and LEAD from a following row; both take an optional offset and a default for when no such row exists. A typical use is the time since each customer's previous order: <code>ordered_at - LAG(ordered_at) OVER (PARTITION BY customer_id ORDER BY ordered_at)</code>. Others include day-over-day change, detecting status changes, and building churn features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you calculate a running total and a 7-day moving average?</summary><div class="qa-body">A running total is <code>SUM(x) OVER (ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)</code>, partitioned if needed. A 7-day moving average over one row per day is <code>AVG(x) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)</code>. If some days have no rows, either fill the calendar first or use <code>RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW</code>, otherwise "6 rows back" can reach further than 6 days.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a window frame, and what is the default?</summary><div class="qa-body">The frame is the subset of the partition an aggregate actually uses for the current row, written as ROWS, RANGE or GROUPS BETWEEN a start and an end. Without ORDER BY, the frame is the whole partition. With ORDER BY and no explicit frame, it is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which includes all peers of the current row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between ROWS and RANGE?</summary><div class="qa-body">ROWS measures the frame in physical rows: "2 preceding" is the two rows just before. RANGE measures by the ORDER BY value: rows with equal values (peers) are always included together, and offsets like <code>INTERVAL '2 days' PRECEDING</code> select rows by value distance. On Biteful, a default running total by day shows 1210 on all three Mar 2 orders (RANGE), while ROWS shows 240, 690, 1210.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does LAST_VALUE often return the current row's value?</summary><div class="qa-body">With an ORDER BY and the default frame, the frame ends at the current row (and its peers), so the last row of the frame is usually the current row itself. Fix it by writing <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>, or by using FIRST_VALUE with the sort order reversed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is ROW_NUMBER sometimes non-deterministic, and how do you fix it?</summary><div class="qa-body">When two rows tie on the ORDER BY columns, the database may number them in either order, and the choice can change between runs or after a plan change. That makes top-N and deduplication results unstable. Add a unique column, such as the primary key, as the last ORDER BY key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you remove duplicate rows, keeping the latest version of each record?</summary><div class="qa-body">Number the rows within each key from newest to oldest, <code>ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC, id DESC)</code>, in a CTE, and keep the rows where the number is 1. For a permanent clean-up, delete the rows whose number is greater than 1. PostgreSQL's <code>DISTINCT ON (key) … ORDER BY key, updated_at DESC</code> is a shorter alternative.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you calculate each row's percentage of the total, and of its group's total?</summary><div class="qa-body">Of the grand total: <code>100.0 * amount / SUM(amount) OVER ()</code>. Of the group total: <code>100.0 * amount / SUM(amount) OVER (PARTITION BY group_col)</code>. Use <code>100.0</code> rather than 100 to avoid integer division, and remember that the totals only include rows that survived WHERE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find streaks of consecutive days (gaps and islands)?</summary><div class="qa-body">Reduce the data to one row per entity per day, then compute <code>day - ROW_NUMBER() OVER (PARTITION BY entity ORDER BY day)</code>. Within a run of consecutive days this value stays constant, and it changes after every gap, so GROUP BY entity and that value, taking MIN(day), MAX(day) and COUNT(*) for each streak. If dates repeat, use DENSE_RANK instead of ROW_NUMBER.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you split user events into sessions with a 30-minute timeout?</summary><div class="qa-body">Use LAG partitioned by user and ordered by time to get the gap since the previous event, and turn it into a flag: 1 when the gap is over 30 minutes or there is no previous event, otherwise 0. Then a running <code>SUM(flag) OVER (PARTITION BY user ORDER BY ts)</code> gives a session number that increases by one at each new session. GROUP BY user and session number to get session start, duration and event counts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Top-N per group: ROW_NUMBER or LATERAL? What are the trade-offs?</summary><div class="qa-body">ROW_NUMBER in a CTE reads and numbers every row in one pass, which is efficient when you need a large share of the rows or there are many groups. <code>LATERAL (… ORDER BY … LIMIT N)</code> runs a small query per group, which is very fast with an index on (group, sort column) when there are relatively few groups and many rows each. Both give the same answer when the ordering is deterministic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you use an aggregate inside a window function? When would you?</summary><div class="qa-body">Yes, because windows are computed after GROUP BY. <code>SUM(SUM(amount)) OVER ()</code> in a grouped query adds up the group totals, which lets you show each group's share of the overall total in a single query: on Biteful, each restaurant's revenue as a percentage of 3510. The inner SUM is the GROUP BY aggregate and the outer one is the window.</div></details>
</main>
`
});
