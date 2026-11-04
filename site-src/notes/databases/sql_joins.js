// notes/databases/sql_joins.js — JOINs
Object.assign(TOPIC_CONTENT, {
  "sql_joins": `<main>
  <h1>JOINs</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>JOINs</span></div>
  <p class="lead">A relational database stores each fact once, in its own table: a customer's name in <code>customers</code>, a bill in <code>orders</code>. A <strong>join</strong> is how a query puts related tables back together, so that each order appears next to the customer who placed it. Joins are in almost every real query, report and machine-learning feature table, and in nearly every SQL interview. Getting <em>some</em> rows back is easy; getting the <em>right number</em> of rows, with no customers silently lost and no revenue silently doubled, is the real skill, and it is what this page teaches. We use one running example throughout, <strong>Biteful</strong>, the food-delivery database from <a class="xref" data-note="sql_relational">Relational Model &amp; PostgreSQL</a> and <a class="xref" data-note="sql_fundamentals">Querying Basics</a> (7 customers, 5 restaurants, 10 orders, 15 order lines), and every output shown is the real result of running the query on PostgreSQL 16.</p>

  <h2 id="sj-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">JOINs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Mental model</div>
        <ul>
          <li>1. Pair every left row with every right row</li>
          <li>2. Keep pairs where <code>ON</code> is TRUE (INNER)</li>
          <li>3. Outer joins add back unmatched rows, padded with NULL</li>
          <li>4. Only then WHERE and GROUP BY run</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Join types</div>
        <ul>
          <li><b>INNER</b>: matches only; <b>LEFT</b>: all left rows</li>
          <li><b>RIGHT</b>: all right rows; <b>FULL</b>: all rows of both</li>
          <li><b>CROSS</b>: every combination, m × n</li>
          <li><b>SELF</b>: a table joined to itself under two aliases</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Yes/no questions</div>
        <ul>
          <li><b>Semi join</b>: <code>EXISTS</code>, each left row once</li>
          <li><b>Anti join</b>: <code>NOT EXISTS</code> or <code>LEFT JOIN … IS NULL</code></li>
          <li>NOT IN with a NULL in the list → 0 rows</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>Right-table test in WHERE turns LEFT into INNER</li>
          <li>Fan-out: summing a parent value after joining children</li>
          <li>LEFT then INNER on the same branch drops padded rows</li>
          <li>NATURAL JOIN matches every same-named column</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Execution</div>
        <ul>
          <li><b>Nested loop</b>: small outer + index on inner</li>
          <li><b>Hash join</b>: build on one side, probe with the other</li>
          <li><b>Merge join</b>: walk two sorted inputs</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sj-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">INNER JOIN</span><span class="rm-sub">when the answer needs two tables</span></div></div>
      <div class="rm-item rm-done" data-target="sj-left"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">LEFT JOIN</span><span class="rm-sub">keeping rows that have no partner</span></div></div>
      <div class="rm-item rm-done" data-target="sj-types"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">RIGHT and FULL JOIN</span><span class="rm-sub">unmatched rows on the other side, or both</span></div></div>
      <div class="rm-item rm-done" data-target="sj-cross"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">CROSS JOIN</span><span class="rm-sub">every combination, for grids with zeros</span></div></div>
      <div class="rm-item rm-done" data-target="sj-self"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">SELF JOIN</span><span class="rm-sub">a table meets itself</span></div></div>
      <div class="rm-item rm-done" data-target="sj-semi"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Semi and Anti Joins</span><span class="rm-sub">EXISTS, NOT EXISTS and the NOT IN trap</span></div></div>
      <div class="rm-item rm-done" data-target="sj-onwhere"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">ON vs WHERE in Outer Joins</span><span class="rm-sub">the LEFT JOIN that silently became INNER</span></div></div>
      <div class="rm-item rm-done" data-target="sj-fan"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Fan-out and Double Counting</span><span class="rm-sub">why sums come out too big</span></div></div>
      <div class="rm-item rm-done" data-target="sj-multi"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Chains, USING and Non-equi Joins</span><span class="rm-sub">several tables, shortcuts, range matches</span></div></div>
      <div class="rm-item rm-done" data-target="sj-puzzle"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Predicting Row Counts</span><span class="rm-sub">duplicate keys and NULL keys</span></div></div>
      <div class="rm-item rm-done" data-target="sj-algo"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How the Engine Joins</span><span class="rm-sub">nested loop, hash and merge joins</span></div></div>
      <div class="rm-item rm-done" data-target="sj-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">bugs that run without errors</span></div></div>
      <div class="rm-item rm-done" data-target="sj-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">join types, row counts, rules</span></div></div>
      <div class="rm-item rm-done" data-target="sj-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">predict the rows, explain the join</span></div></div>
    </div>
  </div>

  <h2 id="sj-model"><span class="num">01</span>INNER JOIN</h2>
  <p>Everything in <a class="xref" data-note="sql_fundamentals">Querying Basics</a> read a single table. But Biteful stores each customer's name once, in <code>customers</code>, and an order stores only a number, <code>customer_id</code>, that points at the customer. So a question as simple as "who placed order 103?" cannot be answered from <code>orders</code> alone: half the answer lives in another table. Here are the two tables involved. Look out for the quirks, because each one powers a lesson later: Gita (7) has never ordered, Esha's city is NULL, and most customers have no referrer.</p>
  <div class="fx" data-lang="sql">SELECT * FROM customers ORDER BY customer_id;
SELECT order_id, customer_id, restaurant_id,
       to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at, status, amount
FROM orders ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> customer_id | name  |  city  | signup_date | referred_by 
-------------+-------+--------+-------------+-------------
           1 | Asha  | Pune   | 2026-01-05  |        NULL
           2 | Ben   | Mumbai | 2026-01-12  |           1
           3 | Chen  | Pune   | 2026-02-03  |           1
           4 | Dia   | Mumbai | 2026-02-20  |        NULL
           5 | Esha  | NULL   | 2026-03-01  |        NULL
           6 | Farah | Mumbai | 2026-03-02  |           2
           7 | Gita  | Pune   | 2026-03-04  |        NULL
(7 rows)

 order_id | customer_id | restaurant_id |  ordered_at  |  status   | amount 
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
  <p>A <strong>join</strong> builds one wider result from two tables. For each order, it finds the customer row with the same <code>customer_id</code> and glues the two rows side by side. The rule that says which rows belong together is written after the keyword <code>ON</code>. A school office does exactly this with two books: a class register (roll number and name) and a fee-receipt book (receipt number, roll number, amount). To print "who paid what", the clerk takes each receipt, reads its roll number and finds that roll number in the register. A student with no receipt is simply never matched.</p>
  <p>The most reliable way to predict what a join returns is a three-step mental model. <strong>Step 1</strong>: imagine every left row paired with every right row; 7 customers × 10 orders is 70 pairs. <strong>Step 2</strong>: keep only the pairs for which the ON condition is TRUE. <strong>Step 3</strong>, for outer joins only (next section): add back the rows that found no partner. Here are steps 1 and 2 for two customers, with the condition <code>o.customer_id = c.customer_id</code>:</p>
  <table class="tbl">
    <tr><th>Pairs</th><th>c.customer_id</th><th>o.customer_id of those orders</th><th>ON true?</th></tr>
    <tr><td>Asha × 101, 104, 110</td><td>1</td><td>1, 1, 1</td><td>yes: 3 pairs kept</td></tr>
    <tr><td>Asha × the other 7 orders</td><td>1</td><td>2, 3, 4, 2, 5, 3, 6</td><td>no</td></tr>
    <tr><td>Gita × all 10 orders</td><td>7</td><td>never 7</td><td>no: 0 pairs kept</td></tr>
  </table>
  <p>Asha survives three times, once per order, and Gita never. Doing the same for every customer keeps exactly 10 of the 70 pairs, one per order, because each order points at exactly one customer. The join that keeps only matching pairs is called an <strong>INNER JOIN</strong>; a plain <code>JOIN</code> means the same thing:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name, o.status, o.amount
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
ORDER BY o.order_id;</div>
  <div class="fx" data-lang="text"> order_id | name  |  status   | amount 
----------+-------+-----------+--------
      101 | Asha  | delivered | 240.00
      102 | Ben   | delivered | 450.00
      103 | Chen  | delivered | 520.00
      104 | Asha  | delivered | 380.00
      105 | Dia   | cancelled | 310.00
      106 | Ben   | delivered | 180.00
      107 | Esha  | cancelled | 260.00
      108 | Chen  | delivered | 260.00
      109 | Farah | delivered | 600.00
      110 | Asha  | pending   | 310.00
(10 rows)</div>
  <p>Read the query from FROM. <code>orders o</code> gives the table a short alias, <code>o</code>; <code>JOIN customers c</code> brings in the second table with alias <code>c</code>; <code>ON c.customer_id = o.customer_id</code> is the matching rule. In the SELECT list, <code>o.order_id</code> and <code>c.name</code> say which table each column comes from, which matters because several tables have columns with the same name (<code>restaurants</code> also has a <code>name</code>). The result is exactly the 10 kept pairs. Asha appears three times because she has three orders: <strong>a join returns one row per matching pair, not one row per customer</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
    <text x="100" y="16" text-anchor="middle" font-weight="bold">customers</text>
    <text x="480" y="16" text-anchor="middle" font-weight="bold">orders</text>
    <g font-size="11">
    <rect x="40" y="24" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="41" text-anchor="middle">1 Asha</text>
    <rect x="40" y="54" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="71" text-anchor="middle">2 Ben</text>
    <rect x="40" y="84" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="101" text-anchor="middle">3 Chen</text>
    <rect x="40" y="114" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="131" text-anchor="middle">4 Dia</text>
    <rect x="40" y="144" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="161" text-anchor="middle">5 Esha</text>
    <rect x="40" y="174" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="191" text-anchor="middle">6 Farah</text>
    <rect x="40" y="204" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="221" text-anchor="middle">7 Gita</text>
    <rect x="420" y="24" width="120" height="19" rx="4" class="ft"/><text x="480" y="38" text-anchor="middle">101 · c1</text>
    <rect x="420" y="46" width="120" height="19" rx="4" class="ft"/><text x="480" y="60" text-anchor="middle">102 · c2</text>
    <rect x="420" y="68" width="120" height="19" rx="4" class="ft"/><text x="480" y="82" text-anchor="middle">103 · c3</text>
    <rect x="420" y="90" width="120" height="19" rx="4" class="ft"/><text x="480" y="104" text-anchor="middle">104 · c1</text>
    <rect x="420" y="112" width="120" height="19" rx="4" class="ft"/><text x="480" y="126" text-anchor="middle">105 · c4</text>
    <rect x="420" y="134" width="120" height="19" rx="4" class="ft"/><text x="480" y="148" text-anchor="middle">106 · c2</text>
    <rect x="420" y="156" width="120" height="19" rx="4" class="ft"/><text x="480" y="170" text-anchor="middle">107 · c5</text>
    <rect x="420" y="178" width="120" height="19" rx="4" class="ft"/><text x="480" y="192" text-anchor="middle">108 · c3</text>
    <rect x="420" y="200" width="120" height="19" rx="4" class="ft"/><text x="480" y="214" text-anchor="middle">109 · c6</text>
    <rect x="420" y="222" width="120" height="19" rx="4" class="ft"/><text x="480" y="236" text-anchor="middle">110 · c1</text>
    </g>
    <g stroke="currentColor" stroke-opacity="0.7"><line x1="160" y1="36" x2="420" y2="33"/><line x1="160" y1="36" x2="420" y2="99"/><line x1="160" y1="36" x2="420" y2="231"/><line x1="160" y1="66" x2="420" y2="55"/><line x1="160" y1="66" x2="420" y2="143"/><line x1="160" y1="96" x2="420" y2="77"/><line x1="160" y1="96" x2="420" y2="187"/><line x1="160" y1="126" x2="420" y2="121"/><line x1="160" y1="156" x2="420" y2="165"/><line x1="160" y1="186" x2="420" y2="209"/></g>
    <line x1="160" y1="216" x2="250" y2="216" stroke="currentColor" stroke-dasharray="4 3"/>
    <rect x="250" y="205" width="64" height="22" rx="5" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="282" y="220" text-anchor="middle" class="tm" font-size="11">NULL</text>
    <text x="320" y="220" font-size="10" class="tm">LEFT only</text>
  </svg><figcaption>Each solid line is one output row of the INNER JOIN: 10 matched pairs. Gita has no line; a LEFT JOIN (dashed) would keep her with a NULL partner.</figcaption></figure>
  <p>In the figure, three lines leave Asha and one or two leave every other customer, but none leaves Gita, so the INNER JOIN drops her. This is why the popular two-circle Venn diagrams of joins mislead: they suggest a join returns "a subset of rows", when in fact it returns <em>pairs</em>, and one customer with three orders produces three rows. The row count can grow. Remember too that the engine never really builds all 70 pairs (section 11 shows what it does instead); the model is for predicting the <em>result</em>. For "orders with their customer", dropping Gita is correct. For "every customer and how much they spent", where Gita must show zero, it is a bug.</p>

  <h2 id="sj-left"><span class="num">02</span>LEFT JOIN</h2>
  <p>Marketing wants every customer with their orders, including people who have never ordered, so they can send Gita a first-order coupon. An INNER JOIN can only return matched pairs, and Gita has none. A <strong>LEFT JOIN</strong> (also written LEFT OUTER JOIN) performs step 3 of the mental model: after keeping the matched pairs, it adds back every row of the <strong>left</strong> table (the one written before the word JOIN) that matched nothing, and fills that row's right-hand columns with NULL. The left table is called the <strong>preserved</strong> side, because every one of its rows survives. A class teacher printing report cards works from the register, not from the exam sheets: every student gets a line, and a student who missed the exam still gets one, with the marks column blank.</p>
  <div class="fx" data-lang="sql">SELECT c.customer_id, c.name, o.order_id, o.amount
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_id, o.order_id;</div>
  <div class="fx" data-lang="text"> customer_id | name  | order_id | amount 
-------------+-------+----------+--------
           1 | Asha  |      101 | 240.00
           1 | Asha  |      104 | 380.00
           1 | Asha  |      110 | 310.00
           2 | Ben   |      102 | 450.00
           2 | Ben   |      106 | 180.00
           3 | Chen  |      103 | 520.00
           3 | Chen  |      108 | 260.00
           4 | Dia   |      105 | 310.00
           5 | Esha  |      107 | 260.00
           6 | Farah |      109 | 600.00
           7 | Gita  |     NULL |   NULL
(11 rows)</div>
  <p>11 rows: the 10 matched pairs plus one padded row. Trace Gita: step 2 found no order with <code>customer_id = 7</code>, so step 3 adds her row once, with <code>order_id</code> and <code>amount</code> set to NULL. Everyone else appears once per order, exactly as in the INNER JOIN. Notice that a LEFT JOIN does not give "one row per left row"; it gives <em>at least</em> one, and Asha still has three.</p>
  <p>Padded rows change how counting works. The coupon list needs the number of orders per customer, and there are two tempting ways to count:</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       COUNT(*)          AS count_star,
       COUNT(o.order_id) AS count_orders,
       SUM(o.amount)     AS spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  | count_star | count_orders | spend  
-------+------------+--------------+--------
 Asha  |          3 |            3 | 930.00
 Ben   |          2 |            2 | 630.00
 Chen  |          2 |            2 | 780.00
 Dia   |          1 |            1 | 310.00
 Esha  |          1 |            1 | 260.00
 Farah |          1 |            1 | 600.00
 Gita  |          1 |            0 |   NULL
(7 rows)</div>
  <p><code>COUNT(*)</code> counts rows, and Gita's padded row is a row, so it claims she has 1 order. <code>COUNT(o.order_id)</code> counts non-NULL values in a column of the right table, so it gives the true 0. Always count a right-table column that can never be NULL in a real match, such as its primary key. And <code>SUM</code> over no values is NULL, not 0; wrap it as <code>COALESCE(SUM(o.amount), 0)</code> if the report needs a number. These are the NULL rules from Querying Basics, now meeting padded rows. LEFT JOIN rescues lonely rows on the left only. Momo Magic, a restaurant with no orders, is lonely on the other side.</p>

  <h2 id="sj-types"><span class="num">03</span>RIGHT and FULL JOIN</h2>
  <p>A <strong>RIGHT JOIN</strong> is the mirror image of a LEFT JOIN: it keeps every row of the <em>right</em> table (written after JOIN), padding the left side with NULL where there is no match. "Every restaurant with its orders":</p>
  <div class="fx" data-lang="sql">SELECT r.name AS restaurant, o.order_id, o.amount
FROM orders o
RIGHT JOIN restaurants r ON r.restaurant_id = o.restaurant_id
ORDER BY r.restaurant_id, o.order_id;</div>
  <div class="fx" data-lang="text">  restaurant  | order_id | amount 
--------------+----------+--------
 Dosa Hut     |      101 | 240.00
 Dosa Hut     |      108 | 260.00
 Dosa Hut     |      110 | 310.00
 Biryani Bros |      102 | 450.00
 Biryani Bros |      106 | 180.00
 Biryani Bros |      109 | 600.00
 Pizza Point  |      103 | 520.00
 Pizza Point  |      104 | 380.00
 Pizza Point  |      107 | 260.00
 Green Bowl   |      105 | 310.00
 Momo Magic   |     NULL |   NULL
(11 rows)</div>
  <p>11 rows again: the 10 orders, each with its restaurant, plus Momo Magic padded with NULLs. Any RIGHT JOIN can be rewritten as a LEFT JOIN by swapping the order of the tables (<code>FROM restaurants r LEFT JOIN orders o …</code> returns the same rows), and because left-to-right is easier to read, most teams never write RIGHT at all.</p>
  <p>Sometimes both sides have lonely rows. The growth team's March dashboard shows two numbers side by side for each day: orders placed and new customer signups. They come from different tables, and some days have orders but no signups while others have signups but no orders. A <strong>FULL JOIN</strong> (FULL OUTER JOIN) keeps the matched pairs plus the unmatched rows of <em>both</em> sides. Think of a shopkeeper comparing his sales diary with the target sheet from head office: INNER lists only days that appear on both pages, LEFT every day in his diary, RIGHT every day on the target sheet, and FULL every day on either page, with a blank wherever one page was silent. First the two inputs:</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, COUNT(*) AS orders
FROM orders GROUP BY 1 ORDER BY 1;
SELECT signup_date AS day, COUNT(*) AS signups
FROM customers WHERE signup_date &gt;= DATE '2026-03-01'
GROUP BY 1 ORDER BY 1;</div>
  <div class="fx" data-lang="text">    day     | orders 
------------+--------
 2026-03-02 |      3
 2026-03-03 |      2
 2026-03-04 |      2
 2026-03-05 |      2
 2026-03-08 |      1
(5 rows)

    day     | signups 
------------+---------
 2026-03-01 |       1
 2026-03-02 |       1
 2026-03-04 |       1
(3 rows)</div>
  <p>Matching on <code>day</code>: 2 and 4 March appear in both lists; 3, 5 and 8 March only in the orders list; 1 March only in the signups list. So we can predict that INNER gives 2 rows, LEFT (orders first) 5, RIGHT 3, and FULL 6. Here is the FULL JOIN, with the two inputs written as named sub-results using <code>WITH name AS (…)</code>, called CTEs (explained in <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>):</p>
  <div class="fx" data-lang="sql">WITH a AS (SELECT ordered_at::date AS day, COUNT(*) AS orders
           FROM orders GROUP BY 1),
     b AS (SELECT signup_date AS day, COUNT(*) AS signups
           FROM customers WHERE signup_date &gt;= DATE '2026-03-01' GROUP BY 1)
SELECT COALESCE(a.day, b.day) AS day, a.orders, b.signups
FROM a
FULL JOIN b ON b.day = a.day
ORDER BY 1;</div>
  <div class="fx" data-lang="text">    day     | orders | signups 
------------+--------+---------
 2026-03-01 |   NULL |       1
 2026-03-02 |      3 |       1
 2026-03-03 |      2 |    NULL
 2026-03-04 |      2 |       1
 2026-03-05 |      2 |    NULL
 2026-03-08 |      1 |    NULL
(6 rows)</div>
  <p>Six rows, as predicted: two matched days, 1 March padded on the orders side, and 3, 5 and 8 March padded on the signups side. Notice <code>COALESCE(a.day, b.day)</code>. In a padded row, the day column of the missing side is NULL, so selecting just <code>a.day</code> would show NULL for 1 March. <code>COALESCE</code> returns its first non-NULL argument, so each row shows whichever side has the day. FULL JOIN plus COALESCE on the key is the standard pattern for reconciling two lists, such as a ledger against a bank statement or row counts in a source system against a warehouse.</p>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
    <g font-size="10">
    <text x="300" y="14" text-anchor="middle" class="tm">left = days with orders (2, 3, 4, 5, 8) · right = March signup days (1, 2, 4)</text>
    <text x="72" y="36" text-anchor="middle" font-weight="bold" class="tb">INNER · 2</text>
    <rect x="10" y="46" width="58" height="20" rx="3" class="fb"/><text x="39" y="60" text-anchor="middle">Mar 2</text><rect x="74" y="46" width="58" height="20" rx="3" class="fg"/><text x="103" y="60" text-anchor="middle">Mar 2</text>
    <rect x="10" y="70" width="58" height="20" rx="3" class="fb"/><text x="39" y="84" text-anchor="middle">Mar 4</text><rect x="74" y="70" width="58" height="20" rx="3" class="fg"/><text x="103" y="84" text-anchor="middle">Mar 4</text>
    <text x="222" y="36" text-anchor="middle" font-weight="bold" class="tb">LEFT · 5</text>
    <rect x="160" y="46" width="58" height="20" rx="3" class="fb"/><text x="189" y="60" text-anchor="middle">Mar 2</text><rect x="224" y="46" width="58" height="20" rx="3" class="fg"/><text x="253" y="60" text-anchor="middle">Mar 2</text>
    <rect x="160" y="70" width="58" height="20" rx="3" class="fb"/><text x="189" y="84" text-anchor="middle">Mar 3</text><rect x="224" y="70" width="58" height="20" rx="3" class="fs"/><text x="253" y="84" text-anchor="middle" class="tm">NULL</text>
    <rect x="160" y="94" width="58" height="20" rx="3" class="fb"/><text x="189" y="108" text-anchor="middle">Mar 4</text><rect x="224" y="94" width="58" height="20" rx="3" class="fg"/><text x="253" y="108" text-anchor="middle">Mar 4</text>
    <rect x="160" y="118" width="58" height="20" rx="3" class="fb"/><text x="189" y="132" text-anchor="middle">Mar 5</text><rect x="224" y="118" width="58" height="20" rx="3" class="fs"/><text x="253" y="132" text-anchor="middle" class="tm">NULL</text>
    <rect x="160" y="142" width="58" height="20" rx="3" class="fb"/><text x="189" y="156" text-anchor="middle">Mar 8</text><rect x="224" y="142" width="58" height="20" rx="3" class="fs"/><text x="253" y="156" text-anchor="middle" class="tm">NULL</text>
    <text x="372" y="36" text-anchor="middle" font-weight="bold" class="tb">RIGHT · 3</text>
    <rect x="310" y="46" width="58" height="20" rx="3" class="fs"/><text x="339" y="60" text-anchor="middle" class="tm">NULL</text><rect x="374" y="46" width="58" height="20" rx="3" class="fg"/><text x="403" y="60" text-anchor="middle">Mar 1</text>
    <rect x="310" y="70" width="58" height="20" rx="3" class="fb"/><text x="339" y="84" text-anchor="middle">Mar 2</text><rect x="374" y="70" width="58" height="20" rx="3" class="fg"/><text x="403" y="84" text-anchor="middle">Mar 2</text>
    <rect x="310" y="94" width="58" height="20" rx="3" class="fb"/><text x="339" y="108" text-anchor="middle">Mar 4</text><rect x="374" y="94" width="58" height="20" rx="3" class="fg"/><text x="403" y="108" text-anchor="middle">Mar 4</text>
    <text x="522" y="36" text-anchor="middle" font-weight="bold" class="tb">FULL · 6</text>
    <rect x="460" y="46" width="58" height="20" rx="3" class="fs"/><text x="489" y="60" text-anchor="middle" class="tm">NULL</text><rect x="524" y="46" width="58" height="20" rx="3" class="fg"/><text x="553" y="60" text-anchor="middle">Mar 1</text>
    <rect x="460" y="70" width="58" height="20" rx="3" class="fb"/><text x="489" y="84" text-anchor="middle">Mar 2</text><rect x="524" y="70" width="58" height="20" rx="3" class="fg"/><text x="553" y="84" text-anchor="middle">Mar 2</text>
    <rect x="460" y="94" width="58" height="20" rx="3" class="fb"/><text x="489" y="108" text-anchor="middle">Mar 3</text><rect x="524" y="94" width="58" height="20" rx="3" class="fs"/><text x="553" y="108" text-anchor="middle" class="tm">NULL</text>
    <rect x="460" y="118" width="58" height="20" rx="3" class="fb"/><text x="489" y="132" text-anchor="middle">Mar 4</text><rect x="524" y="118" width="58" height="20" rx="3" class="fg"/><text x="553" y="132" text-anchor="middle">Mar 4</text>
    <rect x="460" y="142" width="58" height="20" rx="3" class="fb"/><text x="489" y="156" text-anchor="middle">Mar 5</text><rect x="524" y="142" width="58" height="20" rx="3" class="fs"/><text x="553" y="156" text-anchor="middle" class="tm">NULL</text>
    <rect x="460" y="166" width="58" height="20" rx="3" class="fb"/><text x="489" y="180" text-anchor="middle">Mar 8</text><rect x="524" y="166" width="58" height="20" rx="3" class="fs"/><text x="553" y="180" text-anchor="middle" class="tm">NULL</text>
    <text x="300" y="210" text-anchor="middle" class="tm">matched pairs always survive; outer joins add the unmatched side and fill the other with NULL</text>
    </g>
  </svg><figcaption>The four join types on the same two lists of days. Only the set of unmatched rows that is added back changes.</figcaption></figure>
  <p>The figure lines up all four variants. The two matched days (2 and 4 March) are in every result; LEFT adds the three order-only days, RIGHT adds the signup-only day, and FULL adds both. LEFT, RIGHT and FULL together are called <strong>outer joins</strong>, because they keep rows from outside the matched set. Support varies between engines: PostgreSQL supports all of them, SQLite added RIGHT and FULL only in version 3.39 (2022), and MySQL still has no FULL JOIN, so there it is emulated with a LEFT JOIN combined with a RIGHT JOIN using UNION. Outer joins can only rescue rows that exist in some table, though. A status board that must show "Momo Magic, delivered: 0" needs a combination that exists nowhere.</p>

  <h2 id="sj-cross"><span class="num">04</span>CROSS JOIN</h2>
  <p>Operations wants a board with one cell for each restaurant and each status (delivered, cancelled, pending), showing 0 where nothing happened. GROUP BY on orders can only produce combinations that actually occurred:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, status, COUNT(*) AS n
FROM orders GROUP BY 1, 2 ORDER BY 1, 2;</div>
  <div class="fx" data-lang="text"> restaurant_id |  status   | n 
---------------+-----------+---
            10 | delivered | 2
            10 | pending   | 1
            11 | delivered | 3
            12 | cancelled | 1
            12 | delivered | 2
            13 | cancelled | 1
(6 rows)</div>
  <p>Six cells, out of the 5 × 3 = 15 the board needs. The other nine are not rows in any table, so no outer join can bring them back. A <strong>CROSS JOIN</strong> solves this: it has no ON condition and pairs every left row with every right row, which is step 1 of the mental model with nothing filtered out. The result, called the <strong>Cartesian product</strong>, has m × n rows. A menu card that lists every size for every dosa (plain, masala and rava, each small or large: six lines) is a cross join, whether or not anyone has ordered a small rava today.</p>
  <p>The pattern is: build the complete grid with a CROSS JOIN, then LEFT JOIN the real counts onto it. Below, <code>(VALUES ('delivered'), ('cancelled'), ('pending')) AS s(status)</code> is a tiny inline table of three rows with one column called <code>status</code>:</p>
  <div class="fx" data-lang="sql">WITH grid AS (
  SELECT r.restaurant_id, r.name, s.status
  FROM restaurants r
  CROSS JOIN (VALUES ('delivered'), ('cancelled'), ('pending')) AS s(status)
),
counts AS (
  SELECT restaurant_id, status, COUNT(*) AS n
  FROM orders GROUP BY restaurant_id, status
)
SELECT g.name, g.status, COALESCE(c.n, 0) AS orders
FROM grid g
LEFT JOIN counts c ON c.restaurant_id = g.restaurant_id AND c.status = g.status
ORDER BY g.restaurant_id, g.status;</div>
  <div class="fx" data-lang="text">     name     |  status   | orders 
--------------+-----------+--------
 Dosa Hut     | cancelled |      0
 Dosa Hut     | delivered |      2
 Dosa Hut     | pending   |      1
 Biryani Bros | cancelled |      0
 Biryani Bros | delivered |      3
 Biryani Bros | pending   |      0
 Pizza Point  | cancelled |      1
 Pizza Point  | delivered |      2
 Pizza Point  | pending   |      0
 Green Bowl   | cancelled |      1
 Green Bowl   | delivered |      0
 Green Bowl   | pending   |      0
 Momo Magic   | cancelled |      0
 Momo Magic   | delivered |      0
 Momo Magic   | pending   |      0
(15 rows)</div>
  <p>Step by step: <code>grid</code> holds all 15 combinations; <code>counts</code> holds the 6 that happened; the LEFT JOIN keeps all 15 grid rows, matching on <em>both</em> restaurant and status, and <code>COALESCE(c.n, 0)</code> turns the 9 missing counts into 0. Momo Magic shows three zeros. The join afterwards must be LEFT: an INNER JOIN would keep only the 6 cells that have counts, which is exactly what we had before building the grid. This "grid, then LEFT JOIN the facts" shape is used for heatmaps, cohort tables and any daily chart that must show days with no activity. Its danger is the accidental cross join: forget the join condition and two tables of a million rows each produce 10<sup>12</sup> rows (section 12 shows how easily it happens).</p>

  <h2 id="sj-self"><span class="num">05</span>SELF JOIN</h2>
  <p>Farah's row says <code>referred_by = 2</code>. To print "Farah was referred by Ben" we have to look up row 2 in the very table we are already reading. Every join so far brought in a different table. A <strong>self join</strong> is not a new keyword, just a join in which both sides are the same table, used under two different aliases so that SQL can treat them as two separate tables. Here <code>c</code> plays "the customer" and <code>r</code> plays "the referrer". A hostel warden does the same with a register that lists each student and the roll number of their senior mentor, who is in the same register: one finger stays on the student's line while another flips to the mentor's line.</p>
  <div class="fx" data-lang="sql">SELECT c.name AS customer, r.name AS referred_by
FROM customers c
LEFT JOIN customers r ON r.customer_id = c.referred_by
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> customer | referred_by 
----------+-------------
 Asha     | NULL
 Ben      | Asha
 Chen     | Asha
 Dia      | NULL
 Esha     | NULL
 Farah    | Ben
 Gita     | NULL
(7 rows)</div>
  <p>Trace Farah: her <code>referred_by</code> is 2; the row of <code>r</code> with <code>customer_id = 2</code> is Ben, so the pair is (Farah, Ben). LEFT keeps the four customers nobody referred, whose <code>referred_by</code> is NULL; NULL matches nothing, so an INNER self join would return only Ben, Chen and Farah. One join follows one level of the chain: Farah → Ben is one join, Farah → Ben → Asha needs a second, and a chain of unknown length needs a recursive CTE (<a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>).</p>
  <p>Self joins also find pairs of rows, for example customers who live in the same city. A first attempt joins on city alone, shown here for Mumbai:</p>
  <div class="fx" data-lang="sql">SELECT a.name AS c1, b.name AS c2
FROM customers a
JOIN customers b ON b.city = a.city
WHERE a.city = 'Mumbai'
ORDER BY a.customer_id, b.customer_id;</div>
  <div class="fx" data-lang="text">  c1   |  c2   
-------+-------
 Ben   | Ben
 Ben   | Dia
 Ben   | Farah
 Dia   | Ben
 Dia   | Dia
 Dia   | Farah
 Farah | Ben
 Farah | Dia
 Farah | Farah
(9 rows)</div>
  <p>Nine rows of noise: 3 Mumbai customers × 3 = 9 pairs, in which everyone pairs with themselves (Ben–Ben) and every real pair appears twice in mirror order (Ben–Dia and Dia–Ben). Adding <code>a.customer_id &lt; b.customer_id</code> keeps each unordered pair exactly once, because it is false for a self pair (2 &lt; 2) and false for one of each mirrored pair (4 &lt; 2):</p>
  <div class="fx" data-lang="sql">SELECT a.city, a.name AS c1, b.name AS c2
FROM customers a
JOIN customers b ON b.city = a.city AND a.customer_id &lt; b.customer_id
ORDER BY a.city, a.customer_id, b.customer_id;</div>
  <div class="fx" data-lang="text">  city  |  c1  |  c2   
--------+------+-------
 Mumbai | Ben  | Dia
 Mumbai | Ben  | Farah
 Mumbai | Dia  | Farah
 Pune   | Asha | Chen
 Pune   | Asha | Gita
 Pune   | Chen | Gita
(6 rows)</div>
  <p>Three pairs per city, as expected for three people. Esha (city NULL) pairs with nobody, not even herself, because <code>NULL = NULL</code> is UNKNOWN. Using <code>&lt;&gt;</code> instead of <code>&lt;</code> would remove the self pairs but keep both mirrors.</p>

  <h2 id="sj-semi"><span class="num">06</span>Semi and Anti Joins</h2>
  <p>Some questions are yes/no questions about another table: "which customers have ordered?" and "which customers have never ordered?" We need no columns from <code>orders</code> at all, only whether a matching row exists. A join answers a different question, as this shows:</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  
-------
 Asha
 Asha
 Asha
 Ben
 Ben
 Chen
 Chen
 Dia
 Esha
 Farah
(10 rows)</div>
  <p>The join repeats each customer once per order: Asha three times, Ben and Chen twice. A <code>COUNT(*)</code> on this would claim 10 "customers who ordered". Adding DISTINCT hides the symptom but makes the database build all 10 rows and then remove duplicates. The precise tool is a <strong>semi join</strong>: return each left row at most once if <em>any</em> matching right row exists. SQL writes it with <code>EXISTS</code>. A building's watchman asked "does flat 302 have any parcel today?" stops looking at the first parcel he finds and says yes; he does not hand you one copy of the flat number per parcel.</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  
-------
 Asha
 Ben
 Chen
 Dia
 Esha
 Farah
(6 rows)</div>
  <p>For each customer, the inner query <code>SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id</code> is checked. The <code>SELECT 1</code> is a convention: EXISTS only cares whether at least one row comes back, not what is in it. Asha has three orders, but EXISTS can stop at the first and returns TRUE once. Gita has none, so EXISTS is FALSE and she is left out. Six customers, each once.</p>
  <p>The opposite question, "who has <em>no</em> orders?", is an <strong>anti join</strong>: keep a left row only if no right row matches. There are two correct ways to write it:</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);
SELECT c.name, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;</div>
  <div class="fx" data-lang="text"> name 
------
 Gita
(1 row)

 name | order_id 
------+----------
 Gita |     NULL
(1 row)</div>
  <p>Both return Gita. The first is direct. The second relies on padding: after a LEFT JOIN, Gita is the only customer whose row has <code>o.order_id</code> NULL, so <code>WHERE o.order_id IS NULL</code> keeps exactly the unmatched customers. For this test, always use a right-table column that can never be NULL in a real match, such as its primary key; testing <code>o.delivery_minutes IS NULL</code> instead would wrongly add Asha, Dia and Esha, whose real orders have no delivery time.</p>
  <p>A third way looks natural but hides a trap. Take the question "which customers have referred nobody?", written as "customer_id is not in the list of referred_by values". That list contains 1, 1, 2 and four NULLs:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);
SELECT c.name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM customers x WHERE x.referred_by = c.customer_id)
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name 
------
(0 rows)

 name  
-------
 Chen
 Dia
 Esha
 Farah
 Gita
(5 rows)</div>
  <p>The <code>NOT IN</code> version returns zero rows, with no error. Trace Chen (id 3): <code>3 NOT IN (NULL, 1, 1, NULL, NULL, 2, NULL)</code> means <code>3 &lt;&gt; NULL AND 3 &lt;&gt; 1 AND … AND 3 &lt;&gt; 2 AND …</code>. Every comparison with NULL is UNKNOWN, TRUE AND UNKNOWN is UNKNOWN, and WHERE keeps only TRUE, so every customer is dropped. <code>NOT EXISTS</code> has no such problem, because it only asks whether a matching row exists, and NULLs never match anything. It correctly returns the five customers who referred nobody; Asha (who referred Ben and Chen) and Ben (who referred Farah) are the only referrers. Make NOT EXISTS your default for anti joins. Plain <code>IN</code> is safe; only the negated form breaks. And "customers who never ordered" written with NOT IN happens to work on Biteful only because <code>orders.customer_id</code> is declared NOT NULL.</p>

  <h2 id="sj-onwhere"><span class="num">07</span>ON vs WHERE in Outer Joins</h2>
  <p>For an INNER JOIN it makes no difference whether an extra condition goes in ON or in WHERE. For an outer join it makes all the difference, and getting it wrong is one of the most common bugs in real reports. The goal: "every customer, with their delivered orders, if any". The first attempt puts the status test in WHERE:</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'delivered'
ORDER BY c.customer_id, o.order_id;</div>
  <div class="fx" data-lang="text"> name  | order_id |  status   
-------+----------+-----------
 Asha  |      101 | delivered
 Asha  |      104 | delivered
 Ben   |      102 | delivered
 Ben   |      106 | delivered
 Chen  |      103 | delivered
 Chen  |      108 | delivered
 Farah |      109 | delivered
(7 rows)</div>
  <p>Dia, Esha and Gita have vanished, although a LEFT JOIN promised to keep every customer. Trace it in the order the database works: the LEFT JOIN first builds the same 11 rows as in section 02, and only then does WHERE test each one.</p>
  <table class="tbl">
    <tr><th>Row after the LEFT JOIN</th><th>status</th><th>WHERE status = 'delivered'</th></tr>
    <tr><td>Asha · 101, 104</td><td>delivered</td><td>TRUE: kept</td></tr>
    <tr><td>Asha · 110</td><td>pending</td><td>FALSE: dropped</td></tr>
    <tr><td>Ben · 102, 106; Chen · 103, 108; Farah · 109</td><td>delivered</td><td>TRUE: kept</td></tr>
    <tr><td>Dia · 105; Esha · 107</td><td>cancelled</td><td>FALSE: dropped (Dia, Esha gone)</td></tr>
    <tr><td>Gita · NULL</td><td>NULL</td><td>UNKNOWN: dropped (Gita gone)</td></tr>
  </table>
  <p>WHERE runs <em>after</em> the padding, on every row including Gita's padded one, and <code>NULL = 'delivered'</code> is UNKNOWN. The LEFT JOIN has silently become an INNER JOIN. Now move the condition into ON, where it only decides which orders <em>count as a match</em>; every customer is still preserved:</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND o.status = 'delivered'
ORDER BY c.customer_id, o.order_id;</div>
  <div class="fx" data-lang="text"> name  | order_id |  status   
-------+----------+-----------
 Asha  |      101 | delivered
 Asha  |      104 | delivered
 Ben   |      102 | delivered
 Ben   |      106 | delivered
 Chen  |      103 | delivered
 Chen  |      108 | delivered
 Dia   |     NULL | NULL
 Esha  |     NULL | NULL
 Farah |      109 | delivered
 Gita  |     NULL | NULL
(10 rows)</div>
  <p>Ten rows. Dia's and Esha's only orders are cancelled, so under the new matching rule they have no match and get padded rows, just like Gita. Asha's pending order 110 simply stops matching. A wedding caterer who must seat every guest is a good picture: ON is the rule for which plates go to which guest ("only veg plates at this table"), and a guest with no suitable plate still sits down with an empty one; WHERE is a bouncer who, after seating, throws out everyone without a veg plate. With the condition in ON, the report the business wanted is straightforward:</p>
  <div class="fx" data-lang="sql">SELECT c.name, COUNT(o.order_id) AS delivered_orders,
       COALESCE(SUM(o.amount), 0) AS delivered_spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND o.status = 'delivered'
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  | delivered_orders | delivered_spend 
-------+------------------+-----------------
 Asha  |                2 |          620.00
 Ben   |                2 |          630.00
 Chen  |                2 |          780.00
 Dia   |                0 |               0
 Esha  |                0 |               0
 Farah |                1 |          600.00
 Gita  |                0 |               0
(7 rows)</div>
  <p>The opposite mistake is putting a condition on the <em>left</em> table into ON, hoping it will filter. It does not:</p>
  <div class="fx" data-lang="sql">SELECT c.name, c.city, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND c.city = 'Pune'
ORDER BY c.customer_id, o.order_id;</div>
  <div class="fx" data-lang="text"> name  |  city  | order_id 
-------+--------+----------
 Asha  | Pune   |      101
 Asha  | Pune   |      104
 Asha  | Pune   |      110
 Ben   | Mumbai |     NULL
 Chen  | Pune   |      103
 Chen  | Pune   |      108
 Dia   | Mumbai |     NULL
 Esha  | NULL   |     NULL
 Farah | Mumbai |     NULL
 Gita  | Pune   |     NULL
(10 rows)</div>
  <p>We wanted Pune customers only, but Ben, Dia, Esha and Farah are still there, simply with no orders attached. A LEFT JOIN never removes a left row; the ON condition can only stop matches. So the rule is: conditions on the <strong>right</strong> (optional) table go in <strong>ON</strong>; conditions on the <strong>left</strong> (preserved) table go in <strong>WHERE</strong>. The one deliberate exception is <code>WHERE right_table.key IS NULL</code>, the anti join from section 06, which exists precisely to keep only padded rows. Any other WHERE test on a right-table column that NULL fails (<code>=</code>, <code>&gt;</code>, <code>LIKE</code>, <code>IN</code>) cancels the LEFT JOIN, and code reviewers look for exactly this pattern.</p>

  <h2 id="sj-fan"><span class="num">08</span>Fan-out and Double Counting</h2>
  <p>The rows are now right. But joins also change how many times each <em>value</em> appears, and that can make sums wrong without any error. Finance wants each customer's total spend and the number of items they bought, so someone joins customers to orders to order lines and adds things up:</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       SUM(o.amount)   AS spend_wrong,
       COUNT(*)        AS rows_after_join,
       SUM(oi.qty)     AS items
FROM customers c
JOIN orders o       ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  | spend_wrong | rows_after_join | items 
-------+-------------+-----------------+-------
 Asha  |     1620.00 |               5 |     7
 Ben   |     1080.00 |               3 |     4
 Chen  |     1040.00 |               3 |     5
 Dia   |      310.00 |               1 |     1
 Esha  |      260.00 |               1 |     1
 Farah |     1200.00 |               2 |     2
(6 rows)</div>
  <p>Asha really spent 240 + 380 + 310 = 930, as we saw in section 02, but the query says 1,620. To see why, look at her rows before GROUP BY squashes them:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.amount, oi.item, oi.qty, oi.unit_price
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.customer_id = 1
ORDER BY o.order_id, oi.item;</div>
  <div class="fx" data-lang="text"> order_id | amount |     item      | qty | unit_price 
----------+--------+---------------+-----+------------
      101 | 240.00 | Masala Dosa   |   2 |     120.00
      104 | 380.00 | Garlic Bread  |   1 |     100.00
      104 | 380.00 | Margherita    |   1 |     280.00
      110 | 310.00 | Filter Coffee |   1 |      70.00
      110 | 310.00 | Masala Dosa   |   2 |     120.00
(5 rows)</div>
  <p>Her three orders became five rows, because orders 104 and 110 each have two lines. The order-level column <code>amount</code> is copied onto every line of its order, so when SUM adds the column, order 101 contributes 240 once, order 104 contributes 380 twice (760) and order 110 contributes 310 twice (620): 240 + 760 + 620 = 1,620. Every two-line order is double counted. Ben shows 1,080 instead of 630 and Farah 1,200 instead of 600; Dia and Esha are right only by luck, because their orders have one line each. <code>SUM(oi.qty)</code>, on the other hand, is correct, because quantity is a fact about a line. This multiplication of rows, and therefore of values, is called <strong>fan-out</strong>. Picture a canteen bill of ₹380 with two items: if the accountant writes the bill total next to each item and then adds up that column, he books ₹760.</p>
  <p>The way to think about it is <strong>grain</strong>: what one row of a table means. <code>orders</code> has the grain "one order"; orders joined to items has the grain "one order line". The rule is to <strong>sum a measure only at its own grain</strong>. The fix is to aggregate the lines to one row per order first, and only then join, so that nothing can be repeated:</p>
  <div class="fx" data-lang="sql">WITH items AS (                       -- one row per order
  SELECT order_id, SUM(qty) AS items, SUM(qty * unit_price) AS line_total
  FROM order_items GROUP BY order_id
)
SELECT c.name,
       SUM(o.amount)     AS spend,
       SUM(i.items)      AS items,
       SUM(i.line_total) AS spend_from_lines
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN items i  ON i.order_id = o.order_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  | spend  | items | spend_from_lines 
-------+--------+-------+------------------
 Asha  | 930.00 |     7 |           930.00
 Ben   | 630.00 |     4 |           630.00
 Chen  | 780.00 |     5 |           780.00
 Dia   | 310.00 |     1 |           310.00
 Esha  | 260.00 |     1 |           260.00
 Farah | 600.00 |     2 |           600.00
(6 rows)</div>
  <p>The CTE <code>items</code> has exactly one row per order, so joining it to <code>orders</code> cannot multiply anything: Asha's spend is 930 again, alongside her 7 items. The last column shows a second correct approach, summing the line-level measure <code>qty × unit_price</code> at line grain, which gives the same 930 (Biteful stores <code>amount</code> as exactly that sum). The simplest fix of all is not to join the lines when you only need <code>amount</code>.</p>
  <p>The worst fan-out happens when one parent is joined to <em>two independent</em> one-to-many children. Growth wants each customer's spend and the number of people they referred:</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       SUM(o.amount)        AS spend,
       COUNT(x.customer_id) AS referrals
FROM customers c
LEFT JOIN orders o    ON o.customer_id = c.customer_id
LEFT JOIN customers x ON x.referred_by = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  |  spend  | referrals 
-------+---------+-----------
 Asha  | 1860.00 |         6
 Ben   |  630.00 |         2
 Chen  |  780.00 |         0
 Dia   |  310.00 |         0
 Esha  |  260.00 |         0
 Farah |  600.00 |         0
 Gita  |    NULL |         0
(7 rows)</div>
  <p>Asha has 3 orders and 2 referrals (Ben and Chen). Nothing links a particular order to a particular referral, so each of her orders pairs with each referral: 3 × 2 = 6 rows. Her spend doubles to 1,860 and her referral count triples to 6. Ben (2 orders, 1 referral) keeps the right spend but his referral count doubles to 2. It is a small cross join inside every customer.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <g font-size="10">
    <text x="165" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tr">Join both children directly</text>
    <rect x="15" y="36" width="105" height="26" rx="4" class="fb"/><text x="67" y="53" text-anchor="middle">101 · 240</text><rect x="15" y="80" width="105" height="26" rx="4" class="fb"/><text x="67" y="97" text-anchor="middle">104 · 380</text><rect x="15" y="124" width="105" height="26" rx="4" class="fb"/><text x="67" y="141" text-anchor="middle">110 · 310</text><rect x="225" y="58" width="90" height="26" rx="4" class="fv"/><text x="270" y="75" text-anchor="middle">referred Ben</text><rect x="225" y="102" width="90" height="26" rx="4" class="fv"/><text x="270" y="119" text-anchor="middle">referred Chen</text><g class="sr" stroke-opacity="0.8"><line x1="120" y1="49" x2="225" y2="71"/><line x1="120" y1="49" x2="225" y2="115"/><line x1="120" y1="93" x2="225" y2="71"/><line x1="120" y1="93" x2="225" y2="115"/><line x1="120" y1="137" x2="225" y2="71"/><line x1="120" y1="137" x2="225" y2="115"/></g>
    <text x="165" y="176" text-anchor="middle" font-size="11" class="tr">3 × 2 = 6 rows → spend 1860 ✗</text>
    <line x1="340" y1="10" x2="340" y2="180" stroke="currentColor" stroke-dasharray="4 4" opacity="0.4"/>
    <text x="470" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tg">Aggregate first</text>
    <rect x="360" y="76" width="100" height="34" rx="6" class="fb sb"/><text x="410" y="97" text-anchor="middle">spend 930</text>
    <rect x="490" y="76" width="100" height="34" rx="6" class="fv"/><text x="540" y="97" text-anchor="middle">referrals 2</text>
    <line x1="460" y1="93" x2="490" y2="93" class="sg" stroke-width="2"/>
    <text x="470" y="176" text-anchor="middle" font-size="11" class="tg">1 × 1 = 1 row ✓</text>
    </g>
  </svg><figcaption>Left: each of Asha's 3 orders pairs with both referrals, giving 6 rows. Right: each child reduced to one row per customer first, giving 1 row.</figcaption></figure>
  <p>On the left of the figure, six lines connect three orders to two referrals; each line is a row, and each order's amount is counted twice. On the right, each child has first been reduced to one row per customer, so only one row remains. In SQL:</p>
  <div class="fx" data-lang="sql">WITH spend AS (SELECT customer_id, SUM(amount) AS spend
               FROM orders GROUP BY customer_id),
     refs  AS (SELECT referred_by AS customer_id, COUNT(*) AS referrals
               FROM customers WHERE referred_by IS NOT NULL GROUP BY referred_by)
SELECT c.name, COALESCE(s.spend, 0) AS spend, COALESCE(r.referrals, 0) AS referrals
FROM customers c
LEFT JOIN spend s ON s.customer_id = c.customer_id
LEFT JOIN refs  r ON r.customer_id = c.customer_id
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  | spend  | referrals 
-------+--------+-----------
 Asha  | 930.00 |         2
 Ben   | 630.00 |         1
 Chen  | 780.00 |         0
 Dia   | 310.00 |         0
 Esha  | 260.00 |         0
 Farah | 600.00 |         0
 Gita  |      0 |         0
(7 rows)</div>
  <p>Every number is now correct: Asha 930 and 2 referrals, Ben 630 and 1, Gita 0 and 0. A cheap habit that catches fan-out before it reaches a dashboard is to count the rows after each join step and ask whether each increase makes business sense:</p>
  <div class="fx" data-lang="sql">SELECT
  (SELECT COUNT(*) FROM customers)                               AS step0_customers,
  (SELECT COUNT(*) FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.customer_id)        AS step1_orders,
  (SELECT COUNT(*) FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.customer_id
     LEFT JOIN customers x ON x.referred_by = c.customer_id)     AS step2_referrals;</div>
  <div class="fx" data-lang="text"> step0_customers | step1_orders | step2_referrals 
-----------------+--------------+-----------------
               7 |           11 |              14
(1 row)</div>
  <p>7 customers become 11 rows after joining orders, which is expected (one row per order, plus Gita). They become 14 after joining referrals, a jump with no business meaning: Asha's three order rows became six. That jump is the bug.</p>

  <h2 id="sj-multi"><span class="num">09</span>Chains, USING and Non-equi Joins</h2>
  <p>Real questions often need three or four tables. "How much did each customer spend per cuisine?" needs the customer from <code>customers</code>, the link and the amount from <code>orders</code>, and the cuisine from <code>restaurants</code>. You chain joins along the keys, and each JOIN adds one more table to the result built so far, the way tracking a parcel goes from your phone number to the booking, from the booking to the consignment, and from the consignment to the hub.</p>
  <div class="fx" data-lang="sql">SELECT c.name, r.cuisine, SUM(o.amount) AS spent
FROM customers c
JOIN orders o      ON o.customer_id   = c.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
WHERE o.status = 'delivered'
GROUP BY c.name, r.cuisine
ORDER BY c.name, r.cuisine;</div>
  <div class="fx" data-lang="text"> name  |   cuisine    | spent  
-------+--------------+--------
 Asha  | Pizza        | 380.00
 Asha  | South Indian | 240.00
 Ben   | Biryani      | 630.00
 Chen  | Pizza        | 520.00
 Chen  | South Indian | 260.00
 Farah | Biryani      | 600.00
(6 rows)</div>
  <p>Each ON uses a key from a table already in the chain. <code>restaurants</code> is the "one" side of its link with orders, so adding it cannot fan out. Asha spent 240 on South Indian (Dosa Hut) and 380 on Pizza; her pending order 110 is excluded by WHERE. Dia, Esha and Gita have no delivered orders and disappear, because these are INNER joins.</p>
  <p>Chains have a trap of their own when outer and inner joins are mixed. Suppose you want every customer, so you make the first join LEFT but leave the next one INNER. Here are Dia and Gita, first with LEFT then INNER, then with LEFT all the way:</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, oi.item
FROM customers c
LEFT JOIN orders o  ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
WHERE c.customer_id IN (4, 7);
SELECT c.name, o.order_id, oi.item
FROM customers c
LEFT JOIN orders o       ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON oi.order_id   = o.order_id
WHERE c.customer_id IN (4, 7)
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name | order_id |    item     
------+----------+-------------
 Dia  |      105 | Buddha Bowl
(1 row)

 name | order_id |    item     
------+----------+-------------
 Dia  |      105 | Buddha Bowl
 Gita |     NULL | NULL
(2 rows)</div>
  <p>In the first query Gita is gone. The LEFT JOIN gave her a padded row with <code>o.order_id</code> NULL; the following INNER JOIN then looked for items with <code>oi.order_id = NULL</code>, found none, and dropped her. Once a branch of the chain is LEFT joined, every later join that hangs off it must also be LEFT, as in the second query.</p>
  <p>When the key column has the same name in both tables, <code>USING (customer_id)</code> is a shorter way to write <code>ON c.customer_id = o.customer_id</code>. The key appears only once in the output, so you can write <code>customer_id</code> without an alias:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, c.name, o.order_id
FROM customers c
JOIN orders o USING (customer_id)
WHERE customer_id IN (1, 2)
ORDER BY o.order_id;</div>
  <div class="fx" data-lang="text"> customer_id | name | order_id 
-------------+------+----------
           1 | Asha |      101
           2 | Ben  |      102
           1 | Asha |      104
           2 | Ben  |      106
           1 | Asha |      110
(5 rows)</div>
  <p><code>NATURAL JOIN</code> goes one step further and joins on <em>every</em> column name the two tables share, without listing any. That sounds convenient and is a trap:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS rows FROM orders NATURAL JOIN customers;
SELECT COUNT(*) AS rows FROM orders NATURAL JOIN customers NATURAL JOIN restaurants;</div>
  <div class="fx" data-lang="text"> rows 
------
   10
(1 row)

 rows 
------
    0
(1 row)</div>
  <p><code>orders</code> and <code>customers</code> share only <code>customer_id</code>, so the first NATURAL JOIN gives the expected 10 rows. Adding <code>restaurants</code> gives zero rows, with no error. <code>customers</code> and <code>restaurants</code> both have columns called <code>name</code> and <code>city</code>, so the second NATURAL JOIN silently required the customer's name to equal the restaurant's name and the customer's city to equal the restaurant's city, as well as matching restaurant ids. No customer is called "Dosa Hut". NATURAL JOIN also changes meaning whenever someone adds a column, so always name the key with ON or USING.</p>
  <p>Finally, the ON condition does not have to be an equality. Finance groups orders into price bands: small (under ₹250), medium (₹250 to ₹449.99) and large (₹450 and above). There is no shared key; the match is "the amount falls inside the band's range". A join on any condition other than equality is called a <strong>non-equi join</strong> (an equality join is an <strong>equi-join</strong>):</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.amount, b.band
FROM orders o
JOIN (VALUES ('small',    0,    249.99),
             ('medium', 250,    449.99),
             ('large',  450, 999999.99)) AS b(band, lo, hi)
  ON o.amount BETWEEN b.lo AND b.hi
ORDER BY o.amount DESC, o.order_id;</div>
  <div class="fx" data-lang="text"> order_id | amount |  band  
----------+--------+--------
      109 | 600.00 | large
      103 | 520.00 | large
      102 | 450.00 | large
      104 | 380.00 | medium
      105 | 310.00 | medium
      110 | 310.00 | medium
      107 | 260.00 | medium
      108 | 260.00 | medium
      101 | 240.00 | small
      106 | 180.00 | small
(10 rows)</div>
  <p><code>(VALUES …) AS b(band, lo, hi)</code> builds a three-row table inline with named columns. Each order is compared with all three bands and kept where <code>BETWEEN</code> is TRUE. Order 104 (380) is not in 0–249.99, is in 250–449.99, and is not in 450 and above, so it gets exactly one row, "medium"; 10 orders in, 10 rows out. Non-equi joins are used for tax slabs, price bands and "the exchange rate valid on that date". The bands must not overlap, or a row matches twice (fan-out again), and must not leave gaps, or rows silently disappear; an amount of 249.995 would match nothing here.</p>

  <h2 id="sj-puzzle"><span class="num">10</span>Predicting Row Counts</h2>
  <p>Biteful's keys are clean: every join key is unique on the "one" side and never NULL. Interviewers like a warm-up that removes both comforts, because it can be solved by hand in two minutes if the mental model is solid. Two one-column tables, <code>a</code> with keys 1, 1, 2, NULL and <code>b</code> with keys 1, 1, 3, NULL: how many rows do INNER, LEFT, RIGHT, FULL and CROSS joins on <code>a.k = b.k</code> return? Try it before reading on.</p>
  <p>Work it like the trace in section 01, asking which pairs make ON TRUE. Each of the two 1s in <code>a</code> matches both 1s in <code>b</code>, giving 2 × 2 = 4 pairs. The 2 in <code>a</code> matches nothing. The NULL in <code>a</code> matches nothing either, not even the NULL in <code>b</code>, because <code>NULL = NULL</code> is UNKNOWN. On the <code>b</code> side, 3 and NULL are unmatched. So there are 4 matched pairs, 2 unmatched rows in <code>a</code> and 2 unmatched rows in <code>b</code>:</p>
  <div class="fx" data-lang="sql">SELECT
  (SELECT COUNT(*) FROM a JOIN b ON a.k = b.k)       AS inner_j,
  (SELECT COUNT(*) FROM a LEFT JOIN b ON a.k = b.k)  AS left_j,
  (SELECT COUNT(*) FROM a RIGHT JOIN b ON a.k = b.k) AS right_j,
  (SELECT COUNT(*) FROM a FULL JOIN b ON a.k = b.k)  AS full_j,
  (SELECT COUNT(*) FROM a CROSS JOIN b)              AS cross_j;</div>
  <div class="fx" data-lang="text"> inner_j | left_j | right_j | full_j | cross_j 
---------+--------+---------+--------+---------
       4 |      6 |       6 |      8 |      16
(1 row)</div>
  <p>INNER returns just the 4 pairs. LEFT returns the 4 pairs plus the 2 unmatched rows of <code>a</code>, 6 in all; RIGHT returns the 4 pairs plus the 2 unmatched rows of <code>b</code>, also 6. FULL returns 4 + 2 + 2 = 8. CROSS ignores the condition and returns 4 × 4 = 16. A few bounds follow from the model and are worth memorising: for tables of m and n rows, INNER returns between 0 and m × n rows; LEFT returns at least m; FULL returns at least the larger of m and n; and CROSS returns exactly m × n. "A LEFT JOIN returns as many rows as the left table" is false whenever the right key repeats: here it returns 6, not 4, and on Biteful customers LEFT JOIN orders returns 11, not 7. If you really want NULL keys to match each other, write <code>a.k IS NOT DISTINCT FROM b.k</code>, but expect it to be slower.</p>

  <h2 id="sj-algo"><span class="num">11</span>How the Engine Joins</h2>
  <p>The mental model "pair everything, keep the matches" tried 70 pairs to find 10. For two tables of a million rows each, it would mean 10<sup>12</sup> comparisons and a query that never finishes. Real databases are fast because the <strong>optimizer</strong> (the part of the database that plans how to run a query) chooses one of three physical algorithms. The <strong>logical</strong> join type (INNER, LEFT and so on) decides <em>which</em> rows come out; the <strong>physical</strong> algorithm decides <em>how</em> they are found, and any algorithm gives the same result. You can see the optimizer's choice with <code>EXPLAIN</code>, which prints the plan without running the query (<code>COSTS OFF</code> hides the cost estimates to keep it short):</p>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
SELECT c.name, o.order_id
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id;</div>
  <div class="fx" data-lang="text">                  QUERY PLAN                  
----------------------------------------------
 Hash Join
   Hash Cond: (o.customer_id = c.customer_id)
   -&gt;  Seq Scan on orders o
   -&gt;  Hash
         -&gt;  Seq Scan on customers c
(5 rows)</div>
  <p>A plan is read from the most indented lines outward. Both tables are read in full with a <code>Seq Scan</code> (sequential scan, every row). The <code>Hash</code> node builds an in-memory hash table from customers, a structure that finds an entry by its key in one step. Then each order streams past, and the <code>Hash Join</code> looks up its <code>customer_id</code> in that table. This is a <strong>hash join</strong>: build on one side, probe with the other. The build puts the seven customers into buckets by id; then order 101 looks up key 1 and finds Asha, order 102 looks up key 2 and finds Ben, and so on, one lookup per order. The total work is roughly m + n (7 + 10) rather than m × n (70). Hash joins need an equality condition and enough memory for the hash table (they spill to disk if it does not fit), and they are the usual choice for large, unsorted inputs.</p>
  <p>The optimizer can be told not to use an algorithm, which lets us see the other two on the same query. These settings are for learning only; you would not use them in production.</p>
  <div class="fx" data-lang="sql">SET enable_hashjoin = off;
EXPLAIN (COSTS OFF)
SELECT c.name, o.order_id
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id;</div>
  <div class="fx" data-lang="text">SET
                  QUERY PLAN                   
-----------------------------------------------
 Merge Join
   Merge Cond: (c.customer_id = o.customer_id)
   -&gt;  Sort
         Sort Key: c.customer_id
         -&gt;  Seq Scan on customers c
   -&gt;  Sort
         Sort Key: o.customer_id
         -&gt;  Seq Scan on orders o
(8 rows)</div>
  <p>This is a <strong>merge join</strong>. Both inputs are sorted by <code>customer_id</code> (the two <code>Sort</code> nodes) and then walked together like the two sides of a zipper: customer 1 meets orders 101, 104 and 110; customer 2 meets 102 and 106; and customer 7 meets nothing. Each list is read once. It is attractive when the inputs are already sorted, for example by an index, because then the sorts are free.</p>
  <div class="fx" data-lang="sql">SET enable_hashjoin = off;
SET enable_mergejoin = off;
EXPLAIN (COSTS OFF)
SELECT c.name, o.order_id
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id;</div>
  <div class="fx" data-lang="text">SET
SET
                   QUERY PLAN                   
------------------------------------------------
 Nested Loop
   Join Filter: (c.customer_id = o.customer_id)
   -&gt;  Seq Scan on orders o
   -&gt;  Materialize
         -&gt;  Seq Scan on customers c
(5 rows)</div>
  <p>This is a <strong>nested loop</strong>: for each row of the outer input (orders), look for matches in the inner input (customers). Here the inner side is a <code>Materialize</code> node, an in-memory copy of customers that is rescanned for every order, with the <code>Join Filter</code> tested on each pair, so this plan really does make all 70 comparisons. On these tiny tables that is cheap. On real tables, a nested loop is fast only when the outer side is small and the inner side can be searched through an index, so each outer row costs one index lookup instead of a full scan; PostgreSQL then shows an <code>Index Scan</code> on the inner side. Nested loops are also the only algorithm that works for any condition, including non-equi joins.</p>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <defs><marker id="sj-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="100" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Nested loop</text>
    <rect x="15" y="40" width="50" height="24" rx="3" class="fb"/><rect x="15" y="74" width="50" height="24" rx="3" class="fb"/><rect x="15" y="108" width="50" height="24" rx="3" class="fb"/>
    <text x="40" y="146" text-anchor="middle" class="tm">outer</text>
    <circle cx="150" cy="55" r="12" class="fg sg"/><circle cx="125" cy="100" r="10" class="fg"/><circle cx="175" cy="100" r="10" class="fg"/>
    <g stroke="currentColor"><line x1="143" y1="65" x2="129" y2="91"/><line x1="157" y1="65" x2="171" y2="91"/></g>
    <g stroke="currentColor" marker-end="url(#sj-ar1)" opacity="0.7"><line x1="65" y1="52" x2="136" y2="55"/><line x1="65" y1="86" x2="137" y2="60"/><line x1="65" y1="120" x2="139" y2="63"/></g>
    <text x="150" y="146" text-anchor="middle" class="tm">index</text>
    <text x="100" y="166" text-anchor="middle">each outer row: 1 lookup</text>
    <text x="300" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Hash join</text>
    <rect x="215" y="50" width="40" height="22" rx="3" class="fb"/><rect x="215" y="82" width="40" height="22" rx="3" class="fb"/>
    <text x="235" y="122" text-anchor="middle" class="tm">build</text>
    <rect x="280" y="40" width="40" height="22" rx="3" class="fg sg"/><text x="300" y="55" text-anchor="middle">#0</text>
    <rect x="280" y="68" width="40" height="22" rx="3" class="fg sg"/><text x="300" y="83" text-anchor="middle">#1</text>
    <rect x="280" y="96" width="40" height="22" rx="3" class="fg sg"/><text x="300" y="111" text-anchor="middle">#2</text>
    <rect x="345" y="36" width="40" height="18" rx="3" class="fv"/><rect x="345" y="60" width="40" height="18" rx="3" class="fv"/><rect x="345" y="84" width="40" height="18" rx="3" class="fv"/><rect x="345" y="108" width="40" height="18" rx="3" class="fv"/>
    <text x="365" y="140" text-anchor="middle" class="tm">probe</text>
    <g stroke="currentColor" marker-end="url(#sj-ar1)"><line x1="255" y1="61" x2="278" y2="55"/><line x1="255" y1="93" x2="278" y2="105"/><line x1="345" y1="69" x2="322" y2="79"/></g>
    <text x="300" y="166" text-anchor="middle">build one side, probe with the other</text>
    <text x="500" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Merge join</text>
    <rect x="425" y="40" width="40" height="22" rx="3" class="fb"/><text x="445" y="55" text-anchor="middle">1</text>
    <rect x="425" y="70" width="40" height="22" rx="3" class="fb"/><text x="445" y="85" text-anchor="middle">2</text>
    <rect x="425" y="100" width="40" height="22" rx="3" class="fb"/><text x="445" y="115" text-anchor="middle">7</text>
    <rect x="535" y="40" width="40" height="22" rx="3" class="fv"/><text x="555" y="55" text-anchor="middle">1</text>
    <rect x="535" y="70" width="40" height="22" rx="3" class="fv"/><text x="555" y="85" text-anchor="middle">2</text>
    <rect x="535" y="100" width="40" height="22" rx="3" class="fv"/><text x="555" y="115" text-anchor="middle">6</text>
    <g class="sg" stroke-width="2"><line x1="465" y1="51" x2="535" y2="51"/><line x1="465" y1="81" x2="535" y2="81"/></g>
    <g stroke="currentColor" marker-end="url(#sj-ar1)"><line x1="415" y1="40" x2="415" y2="125"/><line x1="585" y1="40" x2="585" y2="125"/></g>
    <text x="500" y="166" text-anchor="middle">walk two sorted lists</text>
    </g>
  </svg><figcaption>Nested loop: each outer row does one index lookup. Hash join: one side goes into buckets, the other probes them. Merge join: two sorted lists read side by side once.</figcaption></figure>
  <p>The figure summarises the three. A wedding is a handy comparison: matching guests to tables by looking each name up in a seating index is a nested loop; sorting place cards into pigeonholes by first letter and letting each guest check one hole is a hash join; and walking down two lists that are both already alphabetical is a merge join.</p>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Best when</th><th>Cost</th><th>Condition</th></tr>
    <tr><td>Nested loop</td><td>small outer side, index on the inner side</td><td>outer rows × one lookup (× full scan without an index)</td><td>any, including non-equi</td></tr>
    <tr><td>Hash join</td><td>large, unsorted inputs</td><td>about m + n; needs memory</td><td>equality only</td></tr>
    <tr><td>Merge join</td><td>inputs already sorted (e.g. by an index)</td><td>about m + n after sorting</td><td>equality (sortable keys)</td></tr>
  </table>
  <p>The practical lesson: a slow join on a foreign key often turns out to be a nested loop scanning the whole inner table for every outer row, because the foreign key column has no index. PostgreSQL indexes primary keys automatically but not foreign keys, so index columns like <code>orders.customer_id</code> yourself (see <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>).</p>

  <h2 id="sj-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Join bugs almost never raise an error; the query runs, the dashboard fills, and the number is wrong. The most basic one is the accidental cross join, which happens most easily with the old comma syntax, where tables are listed in FROM and the join condition lives in WHERE:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS rows FROM customers c, orders o;
SELECT COUNT(*) AS rows FROM customers c, orders o WHERE o.customer_id = c.customer_id;</div>
  <div class="fx" data-lang="text"> rows 
------
   70
(1 row)

 rows 
------
   10
(1 row)</div>
  <p>Without the condition, 7 customers and 10 orders give 70 rows; with it, the expected 10. Forget one condition in a five-table query on real data and the result explodes. Writing joins with explicit <code>JOIN … ON</code> keeps each condition next to its table and makes a missing one obvious. Reading every ON aloud ("the order's customer equals the customer's id") also catches the related bug of joining on the wrong column.</p>
  <p>A second mistake is "fixing" fan-out with DISTINCT inside the aggregate:</p>
  <div class="fx" data-lang="sql">SELECT SUM(o.amount)          AS fanned_out,
       SUM(DISTINCT o.amount) AS sum_distinct,
       (SELECT SUM(amount) FROM orders) AS true_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id;</div>
  <div class="fx" data-lang="text"> fanned_out | sum_distinct | true_total 
------------+--------------+------------
    5510.00 |      2940.00 |    3510.00
(1 row)</div>
  <p>Joining orders to their lines inflates total revenue from 3,510 to 5,510. <code>SUM(DISTINCT o.amount)</code> looks like a cure but gives 2,940, which is also wrong: it adds each distinct <em>amount</em> once, and different real orders happen to share amounts (105 and 110 are both 310; 107 and 108 are both 260), so genuine orders are discarded. <code>COUNT(DISTINCT o.order_id)</code> can repair an inflated count, because order ids are unique, but sums must be fixed at the grain, as in section 08.</p>
  <p>The other classic mistakes were each demonstrated in their own section, and together they make a checklist for reviewing any join: a WHERE test on a right-table column after a LEFT JOIN (Dia, Esha and Gita vanished); <code>COUNT(*)</code> after a LEFT JOIN, which counts padded rows (Gita got 1); NOT IN against a column that can contain NULL (zero rows); summing a parent's value after joining its children (930 became 1,620 and 1,860); a LEFT JOIN followed by an INNER JOIN on the same branch (Gita dropped); an INNER JOIN used for a yes/no question, which repeats rows (Asha three times); NATURAL JOIN matching unintended columns (zero rows); and expecting NULL keys to match each other (Esha paired with nobody).</p>

  <h2 id="sj-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Mental model</h3>
  <ul>
    <li>1. Pair every left row with every right row. 2. Keep pairs where ON is TRUE. 3. Outer joins add unmatched rows padded with NULL. 4. Then WHERE, GROUP BY, SELECT.</li>
    <li>A join returns one row per matching <b>pair</b>; counts can grow.</li>
    <li><b>Grain</b>: what one row means. Sum a measure only at its own grain.</li>
  </ul>
  <h3>Join types</h3>
  <table class="tbl">
    <tr><th>Join</th><th>Returns</th><th>Rows (m left, n right)</th><th>Biteful</th></tr>
    <tr><td>CROSS</td><td>every pair, no ON</td><td>m × n</td><td>5 restaurants × 3 statuses = 15</td></tr>
    <tr><td>INNER</td><td>pairs where ON is TRUE</td><td>0 to m × n</td><td>orders–customers: 10</td></tr>
    <tr><td>LEFT</td><td>INNER + unmatched left rows</td><td>≥ m</td><td>customers–orders: 11 (Gita padded)</td></tr>
    <tr><td>RIGHT</td><td>INNER + unmatched right rows</td><td>≥ n</td><td>orders–restaurants: 11 (Momo Magic)</td></tr>
    <tr><td>FULL</td><td>INNER + unmatched rows of both</td><td>≥ max(m, n)</td><td>March days: 6</td></tr>
    <tr><td>Semi (EXISTS)</td><td>left row once if any match</td><td>≤ m</td><td>6 customers</td></tr>
    <tr><td>Anti (NOT EXISTS)</td><td>left row if no match</td><td>≤ m</td><td>Gita</td></tr>
  </table>
  <h3>Rules</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Do</th></tr>
    <tr><td>Filter on the right table of a LEFT JOIN</td><td>put it in ON</td></tr>
    <tr><td>Filter on the left table</td><td>put it in WHERE</td></tr>
    <tr><td>Count after a LEFT JOIN</td><td><code>COUNT(right.pk)</code>, not COUNT(*); COALESCE sums</td></tr>
    <tr><td>"Has none"</td><td>NOT EXISTS (never NOT IN on a nullable column)</td></tr>
    <tr><td>Parent value + child rows, or two children</td><td>aggregate each to one row per parent, then join</td></tr>
    <tr><td>LEFT JOIN branch continues</td><td>keep every later join on it LEFT</td></tr>
    <tr><td>Key names</td><td>ON or USING; never NATURAL</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="sql">SELECT c.name, COUNT(o.order_id) AS delivered_orders,
       COALESCE(SUM(o.amount), 0) AS delivered_spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND o.status = 'delivered'          -- right-table filter in ON
WHERE c.city = 'Pune'                                 -- left-table filter in WHERE
GROUP BY c.customer_id, c.name;

SELECT c.name FROM customers c                         -- anti join
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);</div>
  <h3>Gotchas</h3>
  <ul>
    <li>INNER drops rows without a partner (Gita); LEFT keeps them with NULLs.</li>
    <li>NULL keys never match, not even NULL = NULL.</li>
    <li>Fan-out: Asha 930 → 1,620 (lines) → 1,860 (orders × referrals). SUM(DISTINCT) is not a fix.</li>
    <li>MySQL has no FULL JOIN; SQLite has it only from 3.39.</li>
    <li>Hash join needs equality; nested loop works for any condition; index foreign keys.</li>
  </ul>

  <h2 id="sj-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a join, and why do relational databases need them?</summary><div class="qa-body">A join combines rows from two tables into wider rows according to a condition, usually matching a foreign key to a primary key. Relational databases store each fact once in its own table to avoid duplication and anomalies, so answering most questions (an order with its customer's name) requires putting those tables back together at query time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between INNER JOIN and LEFT JOIN?</summary><div class="qa-body">INNER JOIN returns only pairs of rows that satisfy the ON condition, so rows without a partner disappear. LEFT JOIN returns all of those pairs plus every left-table row that had no match, with the right table's columns set to NULL. On Biteful, orders INNER JOIN customers gives 10 rows, and customers LEFT JOIN orders gives 11 because Gita is kept.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many rows does customers LEFT JOIN orders return on Biteful, and why not 7?</summary><div class="qa-body">11. Asha has 3 orders, Ben and Chen 2 each, and Dia, Esha and Farah 1 each, which is 10 matched pairs, and Gita adds one padded row. A LEFT JOIN guarantees at least one row per left row, not exactly one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are RIGHT JOIN and FULL OUTER JOIN used for?</summary><div class="qa-body">RIGHT JOIN keeps every row of the second table, and can always be rewritten as a LEFT JOIN by swapping the tables. FULL JOIN keeps unmatched rows from both sides; it is used to reconcile two lists, such as orders per day against signups per day, with <code>COALESCE(a.key, b.key)</code> to show the key from whichever side has it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a CROSS JOIN, and when is it useful?</summary><div class="qa-body">A CROSS JOIN pairs every row of one table with every row of the other, producing m × n rows with no condition. It is useful for building a complete grid, such as every restaurant × every status or every day × every product, which is then LEFT JOINed to real data so that missing combinations show as zero. Accidental cross joins come from missing join conditions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a self join? Give an example.</summary><div class="qa-body">A join of a table with itself under two aliases. Examples: each customer with the customer who referred them (<code>customers c LEFT JOIN customers r ON r.customer_id = c.referred_by</code>), each employee with their manager, or pairs of customers in the same city using <code>a.id &lt; b.id</code> to avoid self pairs and mirrored duplicates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find customers who have never placed an order. Give two correct ways and one risky way.</summary><div class="qa-body">Correct: <code>WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)</code>, or <code>LEFT JOIN orders o … WHERE o.order_id IS NULL</code>. Both return Gita. Risky: <code>WHERE customer_id NOT IN (SELECT customer_id FROM orders)</code>, which returns nothing at all if the subquery ever produces a NULL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>NOT IN</code> return no rows when the subquery contains a NULL?</summary><div class="qa-body"><code>x NOT IN (a, b, NULL)</code> means <code>x &lt;&gt; a AND x &lt;&gt; b AND x &lt;&gt; NULL</code>. The last comparison is UNKNOWN, so the whole AND chain is at best UNKNOWN, and WHERE keeps only TRUE. NOT EXISTS is not affected because it only checks whether a matching row exists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between EXISTS and a JOIN for "customers who have ordered"?</summary><div class="qa-body">A JOIN returns one row per matching pair, so Asha appears three times and counts are inflated unless you add DISTINCT. EXISTS is a semi join: it returns each customer once and can stop at the first matching order. It states the real yes/no question and stays correct if you later add columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a LEFT JOIN, what is the difference between putting a condition in ON and in WHERE?</summary><div class="qa-body">ON decides which right rows count as a match before unmatched left rows are padded; WHERE filters the finished rows afterwards, including padded ones. A right-table condition in WHERE (<code>o.status = 'delivered'</code>) removes padded rows because NULL fails the test, turning the LEFT JOIN into an INNER JOIN. Put right-table conditions in ON and left-table conditions in WHERE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A dashboard joins orders to order_items and a customer's spend comes out too high. What is happening and how do you fix it?</summary><div class="qa-body">Fan-out: amount is an order-level fact, and after joining lines each order appears once per line, so its amount is summed several times (Asha 930 became 1,620). Fix it by aggregating lines to one row per order before joining, by summing a line-level measure such as <code>qty * unit_price</code>, or by not joining lines when they are not needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Table a has keys 1, 1, 2, NULL and table b has 1, 1, 3, NULL. How many rows for INNER, LEFT, RIGHT, FULL and CROSS joins on a.k = b.k?</summary><div class="qa-body">4, 6, 6, 8 and 16. The two 1s match each other 2 × 2 = 4 times; NULL never matches NULL. LEFT adds a's unmatched 2 and NULL, RIGHT adds b's unmatched 3 and NULL, FULL adds both, and CROSS is 4 × 4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is NATURAL JOIN considered dangerous, and how does USING differ from ON?</summary><div class="qa-body">NATURAL JOIN joins on every column name the tables share, so unrelated columns like <code>name</code> and <code>city</code> become join conditions (Biteful's three-table NATURAL JOIN returned 0 rows), and its meaning changes when columns are added. USING (col) names the shared key explicitly and outputs it once; ON allows any condition and keeps both columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a non-equi join? Give a use case.</summary><div class="qa-body">A join whose condition is not an equality, such as <code>ON o.amount BETWEEN b.lo AND b.hi</code>. It is used for price bands, tax slabs, and finding the exchange rate or price that was valid on a given date. Ranges must not overlap or leave gaps, and such joins cannot use a hash join.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the three join algorithms and when each is best.</summary><div class="qa-body">Nested loop: for each outer row, look up matches in the inner input; best when the outer side is small and the inner side has an index, and it works for any condition. Hash join: build a hash table on one input and probe it with the other; best for large unsorted inputs with an equality condition. Merge join: walk two inputs sorted on the key; best when the inputs are already sorted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If the optimizer switches from a hash join to a nested loop, can the result change?</summary><div class="qa-body">No. The logical join type decides which rows are returned; the physical algorithm only decides how matching pairs are found. Speed, memory use and the order of rows (if there is no ORDER BY) can change, but the set of rows cannot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A join on a foreign key is slow on a large table. What do you check first?</summary><div class="qa-body">Run EXPLAIN (or EXPLAIN ANALYZE) and look for a nested loop that scans the whole inner table for each outer row, or a sequential scan where an index lookup was expected. PostgreSQL does not index foreign key columns automatically, so adding an index on the foreign key (such as <code>orders.customer_id</code>) is often the fix; also check for fan-out producing far more rows than expected.</div></details>
</main>
`
});
