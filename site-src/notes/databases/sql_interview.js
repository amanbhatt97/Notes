// notes/databases/sql_interview.js — SQL Interview Practice
Object.assign(TOPIC_CONTENT, {
  "sql_interview": `<main>
  <h1>SQL Interview Practice</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Interview Practice</span></div>
  <p class="lead">SQL interviews, and most real analytics work, keep returning to the same dozen problems: the second-highest value, the top item in each group, duplicates, missing days, running totals, year-over-year growth, streaks of consecutive days, funnels and retention. None of them needs new syntax; each is a short combination of tools from the earlier notes (GROUP BY, joins, CTEs and window functions). What the interviewer is really testing is whether you recognise which pattern a question is, build it in small checkable steps, and know the trap each pattern hides. This page works through those problems in teaching order, each one as the problem, how to think about it, the query, the real PostgreSQL 16 output, and the wrong answers people actually give (also run, so you can see them fail). Everything uses Biteful, the food-delivery database from the earlier notes, plus three small extra tables introduced as they are needed: an app <code>events</code> log, a <code>payments</code> log and the finance team's <code>monthly_revenue</code>.</p>

  <h2 id="si-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">SQL Interview Patterns</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Method</div>
        <ul>
          <li>Agree the grain: what is one output row?</li>
          <li>Build in CTE steps: filter → aggregate → rank → pick</li>
          <li>Check edges: ties, NULLs, empty groups, dates</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ranking and groups</div>
        <ul>
          <li>Nth highest: <code>DENSE_RANK</code>, never OFFSET</li>
          <li>Top-N per group: <code>RANK() OVER (PARTITION BY …)</code></li>
          <li>Duplicates: <code>HAVING count(*) &gt; 1</code>, delete with <code>ROW_NUMBER</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shaping</div>
        <ul>
          <li>Missing rows: NOT EXISTS; date spine + LEFT JOIN</li>
          <li>Pivot: <code>count(*) FILTER (WHERE …)</code> per column</li>
          <li>Running totals: window SUM with a ROWS frame</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Over time</div>
        <ul>
          <li>YoY: self-join on month − 1 year, not LAG(12)</li>
          <li>Streaks: day − row_number = island</li>
          <li>Funnel per session; retention per cohort, complete windows only</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="si-how"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How to Approach a Question</span><span class="rm-sub">grain, steps, edge cases, and the data</span></div></div>
      <div class="rm-item rm-done" data-target="si-nth"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Second and Nth Highest</span><span class="rm-sub">ranking a whole table, and ties</span></div></div>
      <div class="rm-item rm-done" data-target="si-topn"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Top-N per Group</span><span class="rm-sub">ranking inside each group</span></div></div>
      <div class="rm-item rm-done" data-target="si-dup"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Duplicates and Group Conditions</span><span class="rm-sub">find and delete duplicates; "bought both"</span></div></div>
      <div class="rm-item rm-done" data-target="si-missing"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Finding What Is Missing</span><span class="rm-sub">anti-joins and date spines</span></div></div>
      <div class="rm-item rm-done" data-target="si-pivot"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Pivoting Rows into Columns</span><span class="rm-sub">conditional aggregation</span></div></div>
      <div class="rm-item rm-done" data-target="si-run"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Running Totals and Moving Averages</span><span class="rm-sub">window frames, ROWS vs RANGE</span></div></div>
      <div class="rm-item rm-done" data-target="si-yoy"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Comparing Periods</span><span class="rm-sub">LAG and year-over-year growth</span></div></div>
      <div class="rm-item rm-done" data-target="si-streak"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Gaps and Islands</span><span class="rm-sub">streaks of consecutive days</span></div></div>
      <div class="rm-item rm-done" data-target="si-funnel"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Funnels</span><span class="rm-sub">how far each session gets, in order</span></div></div>
      <div class="rm-item rm-done" data-target="si-ret"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Retention and Cohorts</span><span class="rm-sub">did users come back?</span></div></div>
      <div class="rm-item rm-done" data-target="si-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">fan-out, NULLs, integer division, dates</span></div></div>
      <div class="rm-item rm-done" data-target="si-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">every pattern in one line</span></div></div>
      <div class="rm-item rm-done" data-target="si-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the conceptual questions asked between problems</span></div></div>
    </div>
  </div>

  <h2 id="si-how"><span class="num">01</span>How to Approach a Question</h2>
  <p>An interview question arrives as an English sentence and an empty editor. The natural instinct is to write the whole query in one go. Then a join quietly doubles some rows, or a filter drops a customer, and because you never looked at the rows in between, you cannot see where it went wrong. The method that avoids this has four steps, and it is worth saying them out loud in an interview, because the interviewer is grading your thinking as much as your SQL.</p>
  <p>First, agree the <strong>grain</strong> of the answer, meaning what one output row stands for: a customer, a day, a session, a restaurant? Should customers with zero orders appear? Do cancelled orders count? "Orders per day" could mean placed or delivered orders, by order time or delivery time, in which time zone. Two minutes of questions save ten minutes of rewriting. Second, find the tables and the grain of each one, because joining a table with one row per order to a table with one row per order line repeats every order (the fan-out problem from <a class="xref" data-note="sql_joins">JOINs</a>). Third, build the answer in small steps, one idea per step, using <strong>CTEs</strong> (<code>WITH name AS (…)</code>, from <a class="xref" data-note="sql_subqueries">Subqueries, CTEs &amp; Views</a>), and run each step on its own to look at its rows. Fourth, check the edges: ties, NULLs, duplicates, empty groups, division by zero, date boundaries and incomplete periods.</p>
  <p>Cooking biryani is a good picture of step three. You marinate the chicken in one bowl, half-boil the rice in another and fry the onions in a third, then layer them. If the dish tastes wrong, you taste each bowl to find out which one. A CTE is one labelled bowl: a named intermediate result you can inspect on its own before the next step uses it.</p>
  <p>The running example is Biteful's four tables: customers, restaurants, orders and order_items (one row per dish in an order). A few deliberate oddities make traps visible: Gita has never ordered and Momo Magic has never been ordered from, Esha's city is NULL, orders 105 and 107 are cancelled and 110 is still pending. Most problems start from the orders:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, r.name AS restaurant,
       to_char(o.ordered_at, 'Mon DD HH24:MI') AS ordered_at, o.status, o.amount
FROM orders o
JOIN customers c   USING (customer_id)
JOIN restaurants r USING (restaurant_id)
ORDER BY o.order_id;</div>
  <div class="fx" data-lang="text"> order_id | customer |  restaurant  |  ordered_at  |  status   | amount 
----------+----------+--------------+--------------+-----------+--------
      101 | Asha     | Dosa Hut     | Mar 02 12:10 | delivered | 240.00
      102 | Ben      | Biryani Bros | Mar 02 13:05 | delivered | 450.00
      103 | Chen     | Pizza Point  | Mar 02 20:30 | delivered | 520.00
      104 | Asha     | Pizza Point  | Mar 03 13:15 | delivered | 380.00
      105 | Dia      | Green Bowl   | Mar 03 19:45 | cancelled | 310.00
      106 | Ben      | Biryani Bros | Mar 04 12:40 | delivered | 180.00
      107 | Esha     | Pizza Point  | Mar 04 21:10 | cancelled | 260.00
      108 | Chen     | Dosa Hut     | Mar 05 18:20 | delivered | 260.00
      109 | Farah    | Biryani Bros | Mar 05 20:05 | delivered | 600.00
      110 | Asha     | Dosa Hut     | Mar 08 20:50 | pending   | 310.00
(10 rows)</div>
  <p>Unless a question says otherwise, "revenue" on this page means <code>orders.amount</code> of orders that were not cancelled; stating assumptions like that is part of a good answer. The time-based problems later use an <code>events</code> table that logs what customers did in the app between 1 and 8 March 2026: one <code>app_open</code> for each day they opened the app, then <code>view_menu</code>, one <code>add_to_cart</code> per dish, and <code>checkout</code> when they ordered (the ten checkouts are exactly the ten orders above):</p>
  <div class="fx" data-lang="sql">SELECT event, count(*) AS events, count(DISTINCT customer_id) AS customers
FROM events GROUP BY event ORDER BY events DESC;

SELECT c.name, string_agg(extract(day FROM e.event_at)::text, ', ' ORDER BY e.event_at) AS march_days_opened
FROM events e JOIN customers c USING (customer_id)
WHERE e.event = 'app_open'
GROUP BY c.customer_id, c.name ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text">    event    | events | customers 
-------------+--------+-----------
 app_open    |     26 |         7
 add_to_cart |     17 |         7
 view_menu   |     16 |         7
 checkout    |     10 |         6
(4 rows)

 name  |  march_days_opened  
-------+---------------------
 Asha  | 1, 2, 3, 4, 6, 7, 8
 Ben   | 2, 3, 4, 6, 7
 Chen  | 2, 5
 Dia   | 3, 5
 Esha  | 4
 Farah | 2, 3, 4, 5, 6, 7, 8
 Gita  | 4, 5
(7 rows)</div>
  <p>The second result is the one to keep in mind for streaks and retention: Asha opened the app every day except 5 March, Farah every day from the 2nd, and Esha only once.</p>

  <h2 id="si-nth"><span class="num">02</span>Second and Nth Highest</h2>
  <p>The most famous SQL interview question is "find the second-highest salary". On Biteful the same question is: what is the second-highest order amount? <code>MAX</code> gives the highest, and there is a classic trick for the second: take the largest amount that is smaller than the largest.</p>
  <div class="fx" data-lang="sql">-- "Second highest": the largest amount that is smaller than the largest
SELECT max(amount) AS second_highest
FROM orders
WHERE amount &lt; (SELECT max(amount) FROM orders);</div>
  <div class="fx" data-lang="text"> second_highest 
----------------
         520.00
(1 row)</div>
  <p>The inner query finds the maximum (600), and the outer query finds the maximum of everything below it: 520. This is a fine answer for "second", and it handles ties correctly (if two orders had 600, the second highest would still be the next distinct value). But it does not generalise: "the sixth highest" would need five nested subqueries. The interviewer's follow-up is always "now make it the Nth".</p>
  <p>For that we need a way to number the amounts from highest to lowest, which is exactly what window ranking functions do (<a class="xref" data-note="sql_windows">Window Functions</a>). The key decision is what happens when two orders have the same amount. Here are the three ranking functions side by side on the same data:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
       row_number() OVER w AS row_number,
       rank()       OVER w AS rank,
       dense_rank() OVER w AS dense_rank
FROM orders
WINDOW w AS (ORDER BY amount DESC)
ORDER BY amount DESC, order_id;</div>
  <div class="fx" data-lang="text"> order_id | amount | row_number | rank | dense_rank 
----------+--------+------------+------+------------
      109 | 600.00 |          1 |    1 |          1
      103 | 520.00 |          2 |    2 |          2
      102 | 450.00 |          3 |    3 |          3
      104 | 380.00 |          4 |    4 |          4
      105 | 310.00 |          5 |    5 |          5
      110 | 310.00 |          6 |    5 |          5
      107 | 260.00 |          7 |    7 |          6
      108 | 260.00 |          8 |    7 |          6
      101 | 240.00 |          9 |    9 |          7
      106 | 180.00 |         10 |   10 |          8
(10 rows)</div>
  <p>Look at the two ₹310 orders, 105 and 110. <code>ROW_NUMBER</code> gives every row a different number, so they get 5 and 6, and which one gets 5 is arbitrary. <code>RANK</code> gives tied rows the same number and then skips ahead, so both get 5 and the next amount gets 7, like a race where two runners share fifth place and nobody is sixth. <code>DENSE_RANK</code> gives tied rows the same number and continues without a gap, so both get 5 and the next amount gets 6. Only DENSE_RANK numbers the <em>distinct amounts</em>, which is what "the Nth highest amount" means. So the general answer is: rank with DENSE_RANK in a CTE, then keep the rows with the wanted rank. We need the CTE because a window function cannot be used in <code>WHERE</code> (windows are computed after WHERE has already run).</p>
  <div class="fx" data-lang="sql">WITH ranked AS (
  SELECT order_id, amount,
         dense_rank() OVER (ORDER BY amount DESC) AS rnk
  FROM orders)
SELECT order_id, amount FROM ranked WHERE rnk = 6 ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id | amount 
----------+--------
      107 | 260.00
      108 | 260.00
(2 rows)</div>
  <p>The sixth distinct amount is 260, and two orders have it. Now the two wrong answers interviewers see most often, both run on the same data:</p>
  <div class="fx" data-lang="sql">-- Wrong 1: the 6th ROW, not the 6th distinct amount
SELECT amount FROM orders ORDER BY amount DESC LIMIT 1 OFFSET 5;

-- Wrong 2: RANK leaves a gap after the tie, so nothing has rank 6
SELECT order_id, amount
FROM (SELECT order_id, amount, rank() OVER (ORDER BY amount DESC) AS rnk FROM orders) r
WHERE rnk = 6;</div>
  <div class="fx" data-lang="text"> amount 
--------
 310.00
(1 row)

 order_id | amount 
----------+--------
(0 rows)</div>
  <p><code>LIMIT 1 OFFSET 5</code> skips five <em>rows</em> and returns the sixth row, which is the second ₹310 order, so it answers 310. It counts the tie twice. Using <code>RANK</code> with <code>rnk = 6</code> returns nothing at all, because RANK jumped from 5 straight to 7. Two more edges are worth mentioning out loud: if N is larger than the number of distinct amounts, the query returns no rows (ask whether NULL is wanted instead, which you can get by wrapping it in a scalar subquery), and in PostgreSQL NULLs sort <em>first</em> in descending order unless you write <code>NULLS LAST</code>. Use RANK when ties should use up positions, as in a competition, and ROW_NUMBER only when exactly one row is wanted and ties may be broken arbitrarily.</p>

  <h2 id="si-topn"><span class="num">03</span>Top-N per Group</h2>
  <p>Ranking the whole table answers "the best overall". Most real questions rank <em>within</em> each group: the best-selling dish at each restaurant, the latest order of each customer, the top three products per category. The question here is: for each restaurant, which dish sold the most units (ignoring cancelled orders), keeping ties?</p>
  <p>Think of it as three steps. Step one, add up the quantity per (restaurant, dish). Step two, rank the dishes inside each restaurant, restarting the numbering for every restaurant. Step three, keep rank 1. Step one on its own is a join and a GROUP BY:</p>
  <div class="fx" data-lang="sql">SELECT r.name AS restaurant, oi.item, sum(oi.qty) AS qty
FROM orders o
JOIN order_items oi USING (order_id)
JOIN restaurants r  USING (restaurant_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY r.name, oi.item
ORDER BY r.name, qty DESC, oi.item;</div>
  <div class="fx" data-lang="text">  restaurant  |      item       | qty 
--------------+-----------------+-----
 Biryani Bros | Chicken Biryani |   2
 Biryani Bros | Raita           |   2
 Biryani Bros | Mutton Kebab    |   1
 Biryani Bros | Veg Biryani     |   1
 Dosa Hut     | Masala Dosa     |   5
 Dosa Hut     | Filter Coffee   |   3
 Pizza Point  | Farmhouse Pizza |   2
 Pizza Point  | Garlic Bread    |   1
 Pizza Point  | Margherita      |   1
(9 rows)</div>
  <p>Reading it by hand already gives the answer: Masala Dosa at Dosa Hut, Farmhouse Pizza at Pizza Point, and a tie at Biryani Bros between Chicken Biryani and Raita, both on 2. Green Bowl is absent because its only order was cancelled. Steps two and three add a window function with <code>PARTITION BY</code>, which splits the rows into groups and runs the ranking separately inside each group, so every restaurant starts again at 1:</p>
  <div class="fx" data-lang="sql">WITH dish_qty AS (                                   -- step 1: one row per (restaurant, dish)
  SELECT r.name AS restaurant, oi.item, sum(oi.qty) AS qty
  FROM orders o
  JOIN order_items oi USING (order_id)
  JOIN restaurants r  USING (restaurant_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY r.name, oi.item),
ranked AS (                                          -- step 2: rank inside each restaurant
  SELECT *, rank() OVER (PARTITION BY restaurant ORDER BY qty DESC) AS rnk
  FROM dish_qty)
SELECT restaurant, item, qty                         -- step 3: keep the top
FROM ranked WHERE rnk = 1
ORDER BY restaurant, item;</div>
  <div class="fx" data-lang="text">  restaurant  |      item       | qty 
--------------+-----------------+-----
 Biryani Bros | Chicken Biryani |   2
 Biryani Bros | Raita           |   2
 Dosa Hut     | Masala Dosa     |   5
 Pizza Point  | Farmhouse Pizza |   2
(4 rows)</div>
  <p>Because we used <code>RANK</code>, both tied Biryani Bros dishes have rank 1 and both are kept. Swap in <code>ROW_NUMBER</code>, the most common mistake on this problem, and one of them silently vanishes:</p>
  <div class="fx" data-lang="sql">WITH dish_qty AS (
  SELECT r.name AS restaurant, oi.item, sum(oi.qty) AS qty
  FROM orders o JOIN order_items oi USING (order_id) JOIN restaurants r USING (restaurant_id)
  WHERE o.status &lt;&gt; 'cancelled' GROUP BY r.name, oi.item)
SELECT restaurant, item, qty
FROM (SELECT *, row_number() OVER (PARTITION BY restaurant ORDER BY qty DESC) AS rn FROM dish_qty) x
WHERE rn = 1 ORDER BY restaurant;</div>
  <div class="fx" data-lang="text">  restaurant  |      item       | qty 
--------------+-----------------+-----
 Biryani Bros | Raita           |   2
 Dosa Hut     | Masala Dosa     |   5
 Pizza Point  | Farmhouse Pizza |   2
(3 rows)</div>
  <p>ROW_NUMBER had to give the two tied dishes different numbers, so one of them got 2 and was filtered out. Which one survives is up to the query plan, so the answer can change from run to run. The other common wrong answers are <code>SELECT restaurant, max(qty) … GROUP BY restaurant</code>, which returns the top quantity but not the dish (and adding the dish to the SELECT is an error), and putting <code>rank() OVER (…) = 1</code> in WHERE, which is an error for the same reason as before. If the question says "each restaurant", ask whether Green Bowl and Momo Magic should appear with no dish; that needs a LEFT JOIN from restaurants, the idea of section 05.</p>
  <p>For the special case of exactly one row per group with ties broken by a known order, PostgreSQL has a shortcut: <code>DISTINCT ON (group)</code> keeps the first row of each group according to <code>ORDER BY</code>. "Each customer's latest order" is the classic use:</p>
  <div class="fx" data-lang="sql">SELECT DISTINCT ON (customer_id)
       customer_id, order_id, to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at, amount
FROM orders
ORDER BY customer_id, ordered_at DESC;</div>
  <div class="fx" data-lang="text"> customer_id | order_id |  ordered_at  | amount 
-------------+----------+--------------+--------
           1 |      110 | Mar 08 20:50 | 310.00
           2 |      106 | Mar 04 12:40 | 180.00
           3 |      108 | Mar 05 18:20 | 260.00
           4 |      105 | Mar 03 19:45 | 310.00
           5 |      107 | Mar 04 21:10 | 260.00
           6 |      109 | Mar 05 20:05 | 600.00
(6 rows)</div>
  <p>The <code>ORDER BY customer_id, ordered_at DESC</code> puts each customer's newest order first, and <code>DISTINCT ON (customer_id)</code> keeps that first row: Asha's latest is 110 on 8 March. Gita does not appear because she has no orders. DISTINCT ON is PostgreSQL-only; the portable version is <code>row_number() OVER (PARTITION BY customer_id ORDER BY ordered_at DESC) = 1</code> in an outer query.</p>

  <h2 id="si-dup"><span class="num">04</span>Duplicates and Group Conditions</h2>
  <p>"Find the duplicate rows" and "delete the duplicates but keep one copy" are asked in almost every SQL round, because every real system collects duplicates: a form submitted twice, an import run twice, a retry after a timeout. Biteful's payment gateway has exactly this problem. When the gateway did not answer quickly, the app retried, and some payments were recorded more than once:</p>
  <div class="fx" data-lang="sql">SELECT * FROM payments ORDER BY payment_id;</div>
  <div class="fx" data-lang="text"> payment_id | order_id | amount |          paid_at          
------------+----------+--------+---------------------------
          1 |      101 | 240.00 | 2026-03-02 12:10:05+05:30
          2 |      102 | 450.00 | 2026-03-02 13:05:04+05:30
          3 |      102 | 450.00 | 2026-03-02 13:05:09+05:30
          4 |      103 | 520.00 | 2026-03-02 20:30:06+05:30
          5 |      104 | 380.00 | 2026-03-03 13:15:03+05:30
          6 |      106 | 180.00 | 2026-03-04 12:40:02+05:30
          7 |      108 | 260.00 | 2026-03-05 18:20:05+05:30
          8 |      109 | 600.00 | 2026-03-05 20:05:03+05:30
          9 |      109 | 600.00 | 2026-03-05 20:05:07+05:30
         10 |      109 | 600.00 | 2026-03-05 20:05:12+05:30
         11 |      110 | 310.00 | 2026-03-08 20:50:04+05:30
(11 rows)</div>
  <p>The rows are not identical (each has its own <code>payment_id</code> and a slightly different time), so "duplicate" has to be defined: here, two payments for the same order and the same amount. That definition is the grain question again. Once it is agreed, finding the duplicates is a GROUP BY on those columns with a condition on the group size. A condition on an aggregate like <code>count(*)</code> must go in <code>HAVING</code>, which filters groups after they are formed, not in <code>WHERE</code>, which filters rows before grouping:</p>
  <div class="fx" data-lang="sql">-- Which (order, amount) pairs were charged more than once?
SELECT order_id, amount, count(*) AS times_charged
FROM payments
GROUP BY order_id, amount
HAVING count(*) &gt; 1
ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id | amount | times_charged 
----------+--------+---------------
      102 | 450.00 |             2
      109 | 600.00 |             3
(2 rows)</div>
  <p>Order 102 was charged twice and order 109 three times. Deleting the extra copies needs a way to say which copy to keep. <code>ROW_NUMBER</code> is perfect for this: partition by the columns that define a duplicate and number the copies inside each group, so copy 1 is the keeper and everything numbered 2 or more is an extra:</p>
  <div class="fx" data-lang="sql">-- Number the copies inside each duplicate group; copy 1 is the one to keep
SELECT payment_id, order_id, amount,
       row_number() OVER (PARTITION BY order_id, amount ORDER BY payment_id) AS copy_no
FROM payments
WHERE order_id IN (102, 109)
ORDER BY payment_id;</div>
  <div class="fx" data-lang="text"> payment_id | order_id | amount | copy_no 
------------+----------+--------+---------
          2 |      102 | 450.00 |       1
          3 |      102 | 450.00 |       2
          8 |      109 | 600.00 |       1
          9 |      109 | 600.00 |       2
         10 |      109 | 600.00 |       3
(5 rows)</div>
  <p>Payments 2 and 8 are the originals (lowest id in their group); 3, 9 and 10 are the extras. The delete then removes every payment whose copy number is greater than 1:</p>
  <div class="fx" data-lang="sql">DELETE FROM payments
WHERE payment_id IN (
  SELECT payment_id
  FROM (SELECT payment_id,
               row_number() OVER (PARTITION BY order_id, amount ORDER BY payment_id) AS copy_no
        FROM payments) x
  WHERE copy_no &gt; 1);

SELECT count(*) AS payments, count(DISTINCT order_id) AS orders_paid FROM payments;</div>
  <div class="fx" data-lang="text">DELETE 3
 payments | orders_paid 
----------+-------------
        8 |           8
(1 row)</div>
  <p>Three rows were deleted, and now eight payments cover eight orders, one each. In an interview, add two remarks: run the SELECT version first and check the rows before running a DELETE, and once the data is clean, add a <code>UNIQUE (order_id)</code> constraint (or an idempotency key from the gateway) so the database refuses duplicates in future instead of you cleaning them up again. When rows are fully identical with no id at all, PostgreSQL's hidden row address <code>ctid</code> can stand in for the id, or you can copy <code>SELECT DISTINCT *</code> into a new table.</p>
  <p>HAVING also solves a different classic: "which customers ordered from <em>both</em> a South Indian and a Pizza restaurant?" The tempting answer filters with <code>AND</code>, and fails:</p>
  <div class="fx" data-lang="sql">-- Customers who ordered from BOTH South Indian and Pizza restaurants
SELECT c.name
FROM orders o
JOIN customers c   USING (customer_id)
JOIN restaurants r USING (restaurant_id)
WHERE r.cuisine IN ('South Indian', 'Pizza')
GROUP BY c.customer_id, c.name
HAVING count(DISTINCT r.cuisine) = 2
ORDER BY c.name;

-- The tempting version: one row cannot have two cuisines
SELECT c.name
FROM orders o JOIN customers c USING (customer_id) JOIN restaurants r USING (restaurant_id)
WHERE r.cuisine = 'South Indian' AND r.cuisine = 'Pizza';</div>
  <div class="fx" data-lang="text"> name 
------
 Asha
 Chen
(2 rows)

 name 
------
(0 rows)</div>
  <p>The second query returns nothing because a single row cannot have two cuisines at once; WHERE looks at one row at a time. The working query keeps rows with either cuisine, groups them per customer, and keeps customers whose group contains two distinct cuisines. Asha (Dosa Hut and Pizza Point) and Chen qualify. This pattern, "entities related to <em>all</em> of a set of things", is called <strong>relational division</strong>, and <code>HAVING count(DISTINCT …) = number of things</code> is the standard way to write it.</p>

  <h2 id="si-missing"><span class="num">05</span>Finding What Is Missing</h2>
  <p>GROUP BY and joins only see rows that exist. A surprising number of questions are about rows that <em>do not</em> exist: customers who never ordered, days with no sales, products never viewed. There are two tools for this, depending on whether the missing thing has a table of its own.</p>
  <p>When it does, as with "customers who never ordered", the tool is an <strong>anti-join</strong>: keep rows from one table that have no match in another. The safe way to write it is <code>NOT EXISTS</code>. The tempting alternative, <code>NOT IN (subquery)</code>, has a famous trap when the subquery can return NULL. The third query below asks the same "who referred nobody?" question as the second, but with NOT EXISTS:</p>
  <div class="fx" data-lang="sql">-- Customers who never ordered
SELECT name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);

-- Customers who never referred anyone: NOT IN against a column that contains NULLs
SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);

-- Same question with NOT EXISTS
SELECT name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM customers x WHERE x.referred_by = c.customer_id)
ORDER BY name;</div>
  <div class="fx" data-lang="text"> name 
------
 Gita
(1 row)

 name 
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
  <p>The first query correctly finds Gita. The second asks "which customers never referred anyone?" with NOT IN against <code>referred_by</code>, and returns nobody, which is clearly wrong. The reason is NULL logic (<a class="xref" data-note="sql_fundamentals">Querying Basics</a>): <code>referred_by</code> is NULL for most customers, and <code>x NOT IN (1, 2, NULL)</code> means <code>x &lt;&gt; 1 AND x &lt;&gt; 2 AND x &lt;&gt; NULL</code>. The last comparison is UNKNOWN for every x, so the whole condition is never TRUE and WHERE keeps nothing. NOT EXISTS only asks whether a matching row exists, so NULLs cannot poison it, and it finds the five customers who referred nobody. Default to NOT EXISTS for anti-joins; a <code>LEFT JOIN … WHERE right.id IS NULL</code> also works.</p>
  <p>When the missing thing has no table, as with days on which nothing happened, we have to create the rows ourselves. The question: number of orders and revenue (not cancelled) for every day from 2 to 8 March, showing 0 on days without orders. The obvious GROUP BY simply skips the empty days:</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, count(*) AS orders
FROM orders
WHERE status &lt;&gt; 'cancelled'
GROUP BY 1 ORDER BY 1;</div>
  <div class="fx" data-lang="text">    day     | orders 
------------+--------
 2026-03-02 |      3
 2026-03-03 |      1
 2026-03-04 |      1
 2026-03-05 |      2
 2026-03-08 |      1
(5 rows)</div>
  <p>Five rows for a seven-day week: 6 and 7 March are missing, and a chart drawn from this would silently join Thursday to Sunday. The fix is a <strong>date spine</strong>: a list of every calendar day, generated with <code>generate_series</code>, which we then LEFT JOIN the orders onto. Think of a register with every school day printed down the side before anyone writes in it: a day with no entries still has its line. The LEFT JOIN keeps every spine day even when no order matches, filling the order columns with NULL; counting a column from the orders table (NULL is not counted) gives 0, and <code>coalesce</code> turns a NULL sum into 0:</p>
  <div class="fx" data-lang="sql">WITH spine AS (
  SELECT d::date AS day
  FROM generate_series(date '2026-03-02', date '2026-03-08', interval '1 day') d)
SELECT s.day, to_char(s.day, 'Dy') AS weekday,
       count(o.order_id)          AS orders,
       coalesce(sum(o.amount), 0) AS revenue
FROM spine s
LEFT JOIN orders o
       ON o.ordered_at &gt;= s.day AND o.ordered_at &lt; s.day + 1
      AND o.status &lt;&gt; 'cancelled'
GROUP BY s.day ORDER BY s.day;</div>
  <div class="fx" data-lang="text">    day     | weekday | orders | revenue 
------------+---------+--------+---------
 2026-03-02 | Mon     |      3 | 1210.00
 2026-03-03 | Tue     |      1 |  380.00
 2026-03-04 | Wed     |      1 |  180.00
 2026-03-05 | Thu     |      2 |  860.00
 2026-03-06 | Fri     |      0 |       0
 2026-03-07 | Sat     |      0 |       0
 2026-03-08 | Sun     |      1 |  310.00
(7 rows)</div>
  <p>Seven rows, with Friday and Saturday showing 0. Two details carry the whole pattern. The status filter sits in the <code>ON</code> clause, not in WHERE, and we count <code>o.order_id</code>, not <code>*</code>. Here is what happens when both are done the other way:</p>
  <div class="fx" data-lang="sql">WITH spine AS (
  SELECT d::date AS day FROM generate_series(date '2026-03-02', date '2026-03-08', interval '1 day') d)
SELECT s.day, count(*) AS orders
FROM spine s
LEFT JOIN orders o ON o.ordered_at &gt;= s.day AND o.ordered_at &lt; s.day + 1
WHERE o.status &lt;&gt; 'cancelled'                      -- filter on the right table, in WHERE
GROUP BY s.day ORDER BY s.day;</div>
  <div class="fx" data-lang="text">    day     | orders 
------------+--------
 2026-03-02 |      3
 2026-03-03 |      1
 2026-03-04 |      1
 2026-03-05 |      2
 2026-03-08 |      1
(5 rows)</div>
  <p>The empty days vanished again. The LEFT JOIN did produce a row for 6 March with every order column NULL, but then <code>WHERE o.status &lt;&gt; 'cancelled'</code> evaluated to UNKNOWN on that NULL status and threw the row away, turning the LEFT JOIN back into an inner join. Even with the filter fixed, <code>count(*)</code> would count that NULL-padded row and report 1 instead of 0. So the rule for spines is: filters on the right-hand table go in ON, and you count a right-hand column. The join condition also uses a half-open range (<code>&gt;= day AND &lt; day + 1</code>) instead of casting the timestamp to a date, so an index on <code>ordered_at</code> stays usable (<a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>). In a data warehouse, a permanent calendar table (<code>dim_date</code> in <a class="xref" data-note="sql_modeling">Data Modeling</a>) plays the spine's role.</p>

  <h2 id="si-pivot"><span class="num">06</span>Pivoting Rows into Columns</h2>
  <p>Grouping by restaurant and status gives one row per combination, which is long and hard to read. Reports usually want a <strong>pivot</strong>: one row per restaurant and one <em>column</em> per status, with 0 where a restaurant had none. The question: for all five restaurants, the number of delivered, pending and cancelled orders, plus delivered revenue.</p>
  <p>The idea is <strong>conditional aggregation</strong>: group once per restaurant, and for each output column, aggregate only the rows that match that column's condition. PostgreSQL writes this with <code>FILTER (WHERE …)</code> after the aggregate. A LEFT JOIN from restaurants keeps Momo Magic, whose counts then come out as 0:</p>
  <div class="fx" data-lang="sql">SELECT r.name AS restaurant,
       count(*) FILTER (WHERE o.status = 'delivered') AS delivered,
       count(*) FILTER (WHERE o.status = 'pending')   AS pending,
       count(*) FILTER (WHERE o.status = 'cancelled') AS cancelled,
       coalesce(sum(o.amount) FILTER (WHERE o.status = 'delivered'), 0) AS delivered_revenue
FROM restaurants r
LEFT JOIN orders o USING (restaurant_id)
GROUP BY r.restaurant_id, r.name
ORDER BY r.restaurant_id;</div>
  <div class="fx" data-lang="text">  restaurant  | delivered | pending | cancelled | delivered_revenue 
--------------+-----------+---------+-----------+-------------------
 Dosa Hut     |         2 |       1 |         0 |            500.00
 Biryani Bros |         3 |       0 |         0 |           1230.00
 Pizza Point  |         2 |       0 |         1 |            900.00
 Green Bowl   |         0 |       0 |         1 |                 0
 Momo Magic   |         0 |       0 |         0 |                 0
(5 rows)</div>
  <p>Check Pizza Point by hand: orders 103 and 104 delivered (₹520 + ₹380 = ₹900) and 107 cancelled, so 2, 0, 1 and 900. For Momo Magic the LEFT JOIN produced one padded row whose status is NULL; every FILTER condition is UNKNOWN on it, so every count is 0. In databases without FILTER (MySQL, SQL Server), the same thing is written <code>sum(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END)</code>, and that portable spelling leads to the classic mistake of using COUNT instead of SUM:</p>
  <div class="fx" data-lang="sql">SELECT r.name AS restaurant,
       count(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       count(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM restaurants r
LEFT JOIN orders o USING (restaurant_id)
GROUP BY r.restaurant_id, r.name
ORDER BY r.restaurant_id;</div>
  <div class="fx" data-lang="text">  restaurant  | delivered | cancelled 
--------------+-----------+-----------
 Dosa Hut     |         3 |         3
 Biryani Bros |         3 |         3
 Pizza Point  |         3 |         3
 Green Bowl   |         1 |         1
 Momo Magic   |         1 |         1
(5 rows)</div>
  <p>Every column now shows the total number of orders, and even Momo Magic shows 1. <code>COUNT</code> counts every non-NULL value, and 0 is not NULL, so <code>ELSE 0</code> makes every row count. Use SUM with <code>ELSE 0</code>, or COUNT with no ELSE (so non-matching rows produce NULL), or FILTER. One limitation to mention: the list of columns must be known when writing the query. If new statuses appear, you need generated SQL or a reporting tool; PostgreSQL's <code>crosstab()</code> function from the tablefunc extension is another option.</p>

  <h2 id="si-run"><span class="num">07</span>Running Totals and Moving Averages</h2>
  <p>"Show the cumulative revenue by day" is a <strong>running total</strong>: each row shows its own value plus everything before it. A window function does this by summing over a <strong>frame</strong>, the set of rows the function looks at for each output row, which here is "from the first row up to the current one" (<a class="xref" data-note="sql_windows">Window Functions</a>). Think of a cricket scoreboard that shows the runs from the latest over and, next to it, the team total so far. On daily delivered revenue:</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day,
       sum(amount) AS revenue,
       sum(sum(amount)) OVER (ORDER BY ordered_at::date) AS running_total
FROM orders
WHERE status = 'delivered'
GROUP BY ordered_at::date
ORDER BY day;</div>
  <div class="fx" data-lang="text">    day     | revenue | running_total 
------------+---------+---------------
 2026-03-02 | 1210.00 |       1210.00
 2026-03-03 |  380.00 |       1590.00
 2026-03-04 |  180.00 |       1770.00
 2026-03-05 |  860.00 |       2630.00
(4 rows)</div>
  <p>The expression <code>sum(sum(amount)) OVER (…)</code> looks odd but reads in two layers. The inner <code>sum(amount)</code> is the ordinary GROUP BY aggregate, giving one revenue figure per day. The outer <code>sum(…) OVER (ORDER BY day)</code> is a window over those daily rows, adding each day to the ones before: 1,210, then 1,210 + 380 = 1,590, and so on up to 2,630.</p>
  <p>The trap in running totals is the default frame. When a window has an ORDER BY but no frame clause, PostgreSQL uses <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>, and RANGE treats all rows with the <em>same ORDER BY value</em> (called peers) as one block. Watch what that does to a per-order running total ordered by day:</p>
  <div class="fx" data-lang="sql">SELECT order_id, ordered_at::date AS day, amount,
       sum(amount) OVER (ORDER BY ordered_at::date) AS default_frame,
       sum(amount) OVER (ORDER BY ordered_at::date, order_id
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS rows_frame
FROM orders
WHERE status = 'delivered'
ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id |    day     | amount | default_frame | rows_frame 
----------+------------+--------+---------------+------------
      101 | 2026-03-02 | 240.00 |       1210.00 |     240.00
      102 | 2026-03-02 | 450.00 |       1210.00 |     690.00
      103 | 2026-03-02 | 520.00 |       1210.00 |    1210.00
      104 | 2026-03-03 | 380.00 |       1590.00 |    1590.00
      106 | 2026-03-04 | 180.00 |       1770.00 |    1770.00
      108 | 2026-03-05 | 260.00 |       2630.00 |    2030.00
      109 | 2026-03-05 | 600.00 |       2630.00 |    2630.00
(7 rows)</div>
  <p>In the <code>default_frame</code> column, the three orders on 2 March all show 1,210, the total for the whole day, instead of growing 240, 690, 1,210. Because they share the same day, RANGE includes all three peers in each of their frames. The <code>rows_frame</code> column asks for <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>, which counts physical rows one by one, and adds <code>order_id</code> to the ORDER BY as a tie-breaker so the order is fully determined; it grows row by row as expected. The rule: for running totals, write the ROWS frame explicitly, and make the ORDER BY unique.</p>
  <p>A <strong>moving average</strong> uses a sliding frame instead of a growing one, such as "this day and the two before it". Combined with a date spine, so that empty days count as zeros rather than being skipped, and with a share-of-total column, it looks like this:</p>
  <div class="fx" data-lang="sql">WITH daily AS (                    -- date spine of delivered revenue, zeros included
  SELECT s.day::date AS day, coalesce(sum(o.amount), 0) AS revenue
  FROM generate_series(date '2026-03-02', date '2026-03-08', interval '1 day') AS s(day)
  LEFT JOIN orders o ON o.ordered_at &gt;= s.day AND o.ordered_at &lt; s.day + interval '1 day'
                    AND o.status = 'delivered'
  GROUP BY s.day)
SELECT day, revenue,
       round(avg(revenue) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS avg_3day,
       round(100.0 * revenue / sum(revenue) OVER (), 1) AS pct_of_total
FROM daily ORDER BY day;</div>
  <div class="fx" data-lang="text">    day     | revenue | avg_3day | pct_of_total 
------------+---------+----------+--------------
 2026-03-02 | 1210.00 |  1210.00 |         46.0
 2026-03-03 |  380.00 |   795.00 |         14.4
 2026-03-04 |  180.00 |   590.00 |          6.8
 2026-03-05 |  860.00 |   473.33 |         32.7
 2026-03-06 |       0 |   346.67 |          0.0
 2026-03-07 |       0 |   286.67 |          0.0
 2026-03-08 |       0 |     0.00 |          0.0
(7 rows)</div>
  <p>The <code>avg_3day</code> for 4 March is (1,210 + 380 + 180) ÷ 3 = 590. The first two days average over fewer than three rows because there is nothing before them; say so, or show NULL until the window is full. The spine matters here: without it, 6 and 7 March would be missing and the "three-day" average on 8 March would actually span four days. The last column uses an empty window, <code>sum(revenue) OVER ()</code>, which is the grand total over all rows, so each day's share can be computed without a separate query: 2 March brought in 46.0% of the week.</p>

  <h2 id="si-yoy"><span class="num">08</span>Comparing Periods</h2>
  <p>Many questions compare a row with an earlier row: the time since a customer's previous order, today versus yesterday, this month versus the same month last year. <code>LAG(column)</code> returns the value from the previous row in the window's order, and <code>LEAD</code> the next one. "Hours between each order and the same customer's previous order" is a direct use:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at,
       round(extract(epoch FROM ordered_at - lag(ordered_at) OVER w) / 3600, 1) AS hours_since_prev
FROM orders
WHERE customer_id IN (1, 2, 3)
WINDOW w AS (PARTITION BY customer_id ORDER BY ordered_at)
ORDER BY customer_id, ordered_at;</div>
  <div class="fx" data-lang="text"> customer_id | order_id |  ordered_at  | hours_since_prev 
-------------+----------+--------------+------------------
           1 |      101 | Mar 02 12:10 |             NULL
           1 |      104 | Mar 03 13:15 |             25.1
           1 |      110 | Mar 08 20:50 |            127.6
           2 |      102 | Mar 02 13:05 |             NULL
           2 |      106 | Mar 04 12:40 |             47.6
           3 |      103 | Mar 02 20:30 |             NULL
           3 |      108 | Mar 05 18:20 |             69.8
(7 rows)</div>
  <p>Asha's second order came 25.1 hours after her first, her third 127.6 hours after that. Each customer's first order has no previous row, so LAG returns NULL, which is the honest answer (not 0). <code>PARTITION BY customer_id</code> makes LAG look only within the same customer.</p>
  <p>The most-asked business comparison is <strong>year-over-year</strong> (YoY) growth: each month against the same month a year earlier. It uses the finance team's monthly totals. Look carefully at the data before writing anything: June 2025 is missing (deliveries were paused), and March 2026 is month-to-date, covering only 1 to 8 March:</p>
  <div class="fx" data-lang="sql">SELECT to_char(month, 'YYYY-MM') AS month, revenue FROM monthly_revenue ORDER BY month;</div>
  <div class="fx" data-lang="text">  month  | revenue  
---------+----------
 2025-01 | 31000.00
 2025-02 | 29500.00
 2025-03 | 34000.00
 2025-04 | 36500.00
 2025-05 | 38000.00
 2025-07 | 41000.00
 2025-08 | 43500.00
 2025-09 | 42000.00
 2025-10 | 47000.00
 2025-11 | 49500.00
 2025-12 | 52000.00
 2026-01 | 40300.00
 2026-02 | 41300.00
 2026-03 |  2630.00
(14 rows)</div>
  <p>The reliable approach is a <strong>self-join</strong>: join the table to itself, matching each month with the row whose month is exactly one year earlier, then growth = (this − last) ÷ last × 100. The LEFT JOIN keeps months with no previous-year row:</p>
  <div class="fx" data-lang="sql">SELECT to_char(cur.month, 'YYYY-MM') AS month,
       cur.revenue,
       prev.revenue AS revenue_last_year,
       round(100.0 * (cur.revenue - prev.revenue) / prev.revenue, 1) AS yoy_pct
FROM monthly_revenue cur
LEFT JOIN monthly_revenue prev ON prev.month = cur.month - interval '1 year'
WHERE cur.month &gt;= '2026-01-01'
ORDER BY cur.month;</div>
  <div class="fx" data-lang="text">  month  | revenue  | revenue_last_year | yoy_pct 
---------+----------+-------------------+---------
 2026-01 | 40300.00 |          31000.00 |    30.0
 2026-02 | 41300.00 |          29500.00 |    40.0
 2026-03 |  2630.00 |          34000.00 |   -92.3
(3 rows)</div>
  <p>January 2026 is (40,300 − 31,000) ÷ 31,000 = +30.0%, February +40.0%. Multiplying by <code>100.0</code> rather than <code>100</code> matters if revenue were an integer column, because integer division would turn every growth figure into 0. Now the two classic wrong answers. The first uses <code>LAG(revenue, 12)</code>, "the value twelve rows back":</p>
  <div class="fx" data-lang="sql">SELECT to_char(month, 'YYYY-MM') AS month, revenue,
       to_char(lag(month, 12) OVER (ORDER BY month), 'YYYY-MM') AS compared_with,
       lag(revenue, 12) OVER (ORDER BY month) AS lag12_revenue
FROM monthly_revenue
ORDER BY month DESC LIMIT 3;</div>
  <div class="fx" data-lang="text">  month  | revenue  | compared_with | lag12_revenue 
---------+----------+---------------+---------------
 2026-03 |  2630.00 | 2025-02       |      29500.00
 2026-02 | 41300.00 | 2025-01       |      31000.00
 2026-01 | 40300.00 | NULL          |          NULL
(3 rows)</div>
  <p>LAG counts <em>rows</em>, not months. Because June 2025 is missing, twelve rows back from February 2026 is January 2025, so February is compared with the wrong month, and January 2026 gets no comparison at all. LAG is only safe after you have guaranteed one row per period, for example by building a month spine first. The second wrong answer is in the correct result itself: March's −92.3% is not a collapse, it is eight days of 2026 compared with thirty-one days of 2025. Comparing a partial period with a full one is a mistake interviewers love to plant. Compare like with like: wait for the month to end, or compare month-to-date with the same days last year (which needs daily data), and say so in your answer.</p>

  <h2 id="si-streak"><span class="num">09</span>Gaps and Islands</h2>
  <p>"Find each customer's longest streak of consecutive days using the app" belongs to a family called <strong>gaps and islands</strong>: given a sorted list of values, find the unbroken runs (the islands) and the breaks between them (the gaps). SQL has no "consecutive" keyword, so the challenge is to give every day in the same run the same label, after which an ordinary GROUP BY can measure each run.</p>
  <p>The trick is neat once you see it. Number each customer's days 1, 2, 3, … in date order with ROW_NUMBER. Inside a run of consecutive days, the date goes up by one exactly when the number goes up by one, so <em>date minus number</em> stays the same. When there is a gap, the date jumps by more than the number, so date minus number jumps to a new value. That constant value is the island's label. Think of seats in a cinema row: if friends sit in seats 4, 5, 6 and their arrival order is 1, 2, 3, then seat minus arrival is 3 for all of them; someone sitting apart gets a different difference. Here it is on Asha's days:</p>
  <div class="fx" data-lang="sql">WITH days AS (
  SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open')
SELECT day,
       row_number() OVER (ORDER BY day) AS n,
       day - (row_number() OVER (ORDER BY day))::int AS island
FROM days
WHERE customer_id = 1
ORDER BY day;</div>
  <div class="fx" data-lang="text">    day     | n |   island   
------------+---+------------
 2026-03-01 | 1 | 2026-02-28
 2026-03-02 | 2 | 2026-02-28
 2026-03-03 | 3 | 2026-02-28
 2026-03-04 | 4 | 2026-02-28
 2026-03-06 | 5 | 2026-03-01
 2026-03-07 | 6 | 2026-03-01
 2026-03-08 | 7 | 2026-03-01
(7 rows)</div>
  <p>Asha's days 1 to 4 March get numbers 1 to 4, and every date minus its number lands on 28 February. After the gap on 5 March, 6 March gets number 5, and 6 − 5 lands on 1 March, as do 7 − 6 and 8 − 7. The label itself is a meaningless date; all that matters is that it is shared within a run and different between runs. So Asha has two islands: 1–4 March (four days) and 6–8 March (three days). The full query groups by customer and label to measure each run, then keeps each customer's longest with the DISTINCT ON shortcut from section 03:</p>
  <div class="fx" data-lang="sql">WITH days AS (                     -- one row per (customer, day)
  SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open'),
islands AS (                       -- same label for every day in one unbroken run
  SELECT customer_id, day,
         day - (row_number() OVER (PARTITION BY customer_id ORDER BY day))::int AS island
  FROM days),
runs AS (                          -- one row per run
  SELECT customer_id, island, count(*) AS days, min(day) AS start_day, max(day) AS end_day
  FROM islands GROUP BY customer_id, island)
SELECT DISTINCT ON (r.customer_id)  -- each customer's longest run
       c.name, r.days AS longest_streak, r.start_day, r.end_day
FROM runs r JOIN customers c USING (customer_id)
ORDER BY r.customer_id, r.days DESC, r.start_day;</div>
  <div class="fx" data-lang="text"> name  | longest_streak | start_day  |  end_day   
-------+----------------+------------+------------
 Asha  |              4 | 2026-03-01 | 2026-03-04
 Ben   |              3 | 2026-03-02 | 2026-03-04
 Chen  |              1 | 2026-03-02 | 2026-03-02
 Dia   |              1 | 2026-03-03 | 2026-03-03
 Esha  |              1 | 2026-03-04 | 2026-03-04
 Farah |              7 | 2026-03-02 | 2026-03-08
 Gita  |              2 | 2026-03-04 | 2026-03-05
(7 rows)</div>
  <p>Farah opened the app every day from 2 to 8 March, a streak of 7; Asha's best is the four days at the start of the month. The first CTE matters: it reduces the data to one row per (customer, day). If a customer opened the app twice on one day, ROW_NUMBER would advance twice while the date did not, breaking the "both go up by one" rule and splitting a real streak in two. The most common wrong answer counts consecutive pairs with LAG:</p>
  <div class="fx" data-lang="sql">WITH days AS (SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open')
SELECT customer_id, count(*) FILTER (WHERE day - prev = 1) AS consecutive_pairs
FROM (SELECT customer_id, day, lag(day) OVER (PARTITION BY customer_id ORDER BY day) AS prev
      FROM days) x
WHERE customer_id = 1
GROUP BY customer_id;</div>
  <div class="fx" data-lang="text"> customer_id | consecutive_pairs 
-------------+-------------------
           1 |                 5
(1 row)</div>
  <p>Counting days where "day minus previous day = 1" gives Asha 5, because it adds up the links in <em>all</em> her runs (3 links in the first run, 2 in the second) instead of measuring one run. The same island trick solves many other questions: finding missing ranges in a sequence of ids, merging overlapping date ranges, and splitting activity into sessions wherever there is a long enough gap (LAG to detect a gap, then a running SUM of the gap flags as the session label).</p>

  <h2 id="si-funnel"><span class="num">10</span>Funnels</h2>
  <p>A <strong>funnel</strong> measures how many users or sessions get through a sequence of steps, and where they drop off. Biteful's app funnel is: open the app → view a menu → add to cart → check out. The question: treating one customer on one day as a session, how many sessions reached each step, and what is the conversion from each step to the next? The first instinct is to count events by type:</p>
  <div class="fx" data-lang="sql">SELECT event, count(*) AS events FROM events GROUP BY event ORDER BY count(*) DESC;</div>
  <div class="fx" data-lang="text">    event    | events 
-------------+--------
 app_open    |     26
 add_to_cart |     17
 view_menu   |     16
 checkout    |     10
(4 rows)</div>
  <p>That gives 17 add-to-cart events but only 16 menu views, which is impossible for a funnel: you cannot add to a cart more often than you reach a menu. The reason is the grain. One add_to_cart event is logged per dish, so a two-dish order produces two events. A funnel is about sessions, not events, so the first step is to collapse the events to <strong>one row per session</strong>, keeping the <em>earliest</em> time of each step. Here are the sessions of 4 March:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, event_at::date AS day,
       to_char(min(event_at) FILTER (WHERE event = 'app_open'),    'HH24:MI') AS t_open,
       to_char(min(event_at) FILTER (WHERE event = 'view_menu'),   'HH24:MI') AS t_menu,
       to_char(min(event_at) FILTER (WHERE event = 'add_to_cart'), 'HH24:MI') AS t_cart,
       to_char(min(event_at) FILTER (WHERE event = 'checkout'),    'HH24:MI') AS t_checkout
FROM events
WHERE event_at::date = '2026-03-04'
GROUP BY customer_id, event_at::date
ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> customer_id |    day     | t_open | t_menu | t_cart | t_checkout 
-------------+------------+--------+--------+--------+------------
           1 | 2026-03-04 | 09:15  | NULL   | NULL   | NULL
           2 | 2026-03-04 | 12:30  | 12:32  | 12:34  | 12:40
           5 | 2026-03-04 | 21:00  | 21:02  | 21:04  | 21:10
           6 | 2026-03-04 | 20:10  | 20:12  | 20:15  | NULL
           7 | 2026-03-04 | 19:30  | 19:33  | 19:36  | NULL
(5 rows)</div>
  <p>Each row is now one session. Ben (customer 2) and Esha (5) went all the way through. Farah (6) and Gita (7) added to their carts and left without checking out. Asha (1) opened the app and did nothing else, so her later steps are NULL. With one row per session, a session reaches a step if it has that step and every earlier step, each happening no earlier than the one before. Requiring the order matters: a session that checked out and only afterwards looked at a menu did not flow through the funnel.</p>
  <div class="fx" data-lang="sql">WITH s AS (                        -- one row per session (customer, day)
  SELECT customer_id, event_at::date AS day,
         min(event_at) FILTER (WHERE event = 'app_open')    AS t_open,
         min(event_at) FILTER (WHERE event = 'view_menu')   AS t_menu,
         min(event_at) FILTER (WHERE event = 'add_to_cart') AS t_cart,
         min(event_at) FILTER (WHERE event = 'checkout')    AS t_checkout
  FROM events GROUP BY customer_id, event_at::date),
steps AS (                         -- a step counts only if every earlier step came first
  SELECT count(*) FILTER (WHERE t_open IS NOT NULL)                                       AS s1_open,
         count(*) FILTER (WHERE t_menu &gt;= t_open)                                         AS s2_menu,
         count(*) FILTER (WHERE t_cart &gt;= t_menu AND t_menu &gt;= t_open)                    AS s3_cart,
         count(*) FILTER (WHERE t_checkout &gt;= t_cart AND t_cart &gt;= t_menu AND t_menu &gt;= t_open) AS s4_checkout
  FROM s)
SELECT *,
       round(100.0 * s2_menu / s1_open, 1)     AS open_to_menu_pct,
       round(100.0 * s3_cart / s2_menu, 1)     AS menu_to_cart_pct,
       round(100.0 * s4_checkout / s3_cart, 1) AS cart_to_checkout_pct
FROM steps;</div>
  <div class="fx" data-lang="text"> s1_open | s2_menu | s3_cart | s4_checkout | open_to_menu_pct | menu_to_cart_pct | cart_to_checkout_pct 
---------+---------+---------+-------------+------------------+------------------+----------------------
      26 |      16 |      12 |          10 |             61.5 |             75.0 |                 83.3
(1 row)</div>
  <p>26 sessions opened the app, 16 viewed a menu, 12 added to a cart and 10 checked out: 61.5% of opens reach a menu, 75.0% of menu views reach a cart, and 83.3% of carts are checked out. Notice how NULL logic does useful work here: a comparison with a NULL time is UNKNOWN, and <code>FILTER</code> counts only TRUE, so a session missing a step can never pass a later step's condition. The other common mistake is counting <code>DISTINCT customer_id</code> per event type instead, which answers a different question (did each customer <em>ever</em> do the step, on any day, in any order) and would count Gita's 4 March cart and a checkout on another day as a conversion. Agree the unit (session or user) and the time window before writing anything.</p>

  <h2 id="si-ret"><span class="num">11</span>Retention and Cohorts</h2>
  <p>A funnel follows users within one session. <strong>Retention</strong> asks whether they come <em>back</em> on later days, which is the single most important health metric of most apps. The catch is that "how many users came back?" depends on when each user started: someone who arrived yesterday has had no chance to return yet. The fix is to line users up by their own start date. A <strong>cohort</strong> is a group of users who started in the same period; here, customers grouped by the first day they opened the app. Think of school classes grouped by the year they joined: you compare the class of 2024 in its second year with the class of 2025 in its second year, not with each other on the same calendar day.</p>
  <p>The question: for each first-visit day, how many customers opened the app again within the next three days (day 1 to day 3 after the first visit), and what percentage is that? The steps are: reduce events to distinct (customer, day) opens; take each customer's first day as their cohort; check whether there is any open on cohort + 1 to cohort + 3; count per cohort. "Is there any?" is a yes-or-no question per customer, which is exactly what <code>EXISTS</code> answers (a join to the later visits would return one row per visit and overcount):</p>
  <div class="fx" data-lang="sql">WITH opens AS (                    -- one row per (customer, day) with an app open
  SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open'),
cohorts AS (                       -- each customer's first day = their cohort
  SELECT customer_id, min(day) AS cohort_day FROM opens GROUP BY customer_id),
flags AS (                         -- did they open again on day 1, 2 or 3 after that?
  SELECT c.customer_id, c.cohort_day,
         EXISTS (SELECT 1 FROM opens o
                 WHERE o.customer_id = c.customer_id
                   AND o.day BETWEEN c.cohort_day + 1 AND c.cohort_day + 3) AS returned
  FROM cohorts c
  WHERE c.cohort_day + 3 &lt;= date '2026-03-08')     -- only cohorts whose window has ended
SELECT cohort_day, count(*) AS users,
       count(*) FILTER (WHERE returned) AS returned,
       round(100.0 * count(*) FILTER (WHERE returned) / count(*), 1) AS retention_pct
FROM flags
GROUP BY cohort_day ORDER BY cohort_day;</div>
  <div class="fx" data-lang="text"> cohort_day | users | returned | retention_pct 
------------+-------+----------+---------------
 2026-03-01 |     1 |        1 |         100.0
 2026-03-02 |     3 |        3 |         100.0
 2026-03-03 |     1 |        1 |         100.0
 2026-03-04 |     2 |        1 |          50.0
(4 rows)</div>
  <p>Check it against the open-days list from section 01. Asha started on 1 March and came back on the 2nd. Ben, Chen and Farah started on 2 March and all came back within three days (Chen only on the 5th, which is day 3). Dia started on the 3rd and returned on the 5th. Esha and Gita started on the 4th; Gita returned on the 5th but Esha never came back, so that cohort is 1 of 2, 50%. The <code>WHERE c.cohort_day + 3 &lt;= date '2026-03-08'</code> line keeps only cohorts whose three-day window has fully passed. Our data ends on 8 March, so a customer who first appeared on 7 March would have had only one day to return, and including them would drag retention down for a reason that has to do with the calendar, not with the users. (<code>BETWEEN</code> is safe here because <code>day</code> is a date; on a timestamp it is a trap, shown in section 12.)</p>
  <p>The most common wrong answer lets the first visit count as a return, by writing <code>&gt;=</code> the cohort day instead of starting at day 1:</p>
  <div class="fx" data-lang="sql">WITH opens AS (SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open'),
cohorts AS (SELECT customer_id, min(day) AS cohort_day FROM opens GROUP BY customer_id)
SELECT c.cohort_day, count(*) AS users,
       count(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM opens o WHERE o.customer_id = c.customer_id
           AND o.day &gt;= c.cohort_day AND o.day &lt;= c.cohort_day + 3)) AS returned   -- includes day 0
FROM cohorts c
GROUP BY c.cohort_day ORDER BY c.cohort_day;</div>
  <div class="fx" data-lang="text"> cohort_day | users | returned 
------------+-------+----------
 2026-03-01 |     1 |        1
 2026-03-02 |     3 |        3
 2026-03-03 |     1 |        1
 2026-03-04 |     2 |        2
(4 rows)</div>
  <p>Now every cohort shows everyone returning, including Esha, who never came back: her first visit itself satisfied the condition. Retention numbers that look perfect usually mean day 0 slipped in. A full <strong>cohort table</strong>, the grid analysts show in dashboards, is this pattern combined with a pivot from section 06: one row per cohort and one column per day since the first visit:</p>
  <div class="fx" data-lang="sql">-- Cohort table: one column per day since the first visit
WITH opens AS (SELECT DISTINCT customer_id, event_at::date AS day FROM events WHERE event = 'app_open'),
cohorts AS (SELECT customer_id, min(day) AS cohort_day FROM opens GROUP BY customer_id)
SELECT c.cohort_day, count(DISTINCT c.customer_id) AS users,
       count(DISTINCT o.customer_id) FILTER (WHERE o.day - c.cohort_day = 1) AS day1,
       count(DISTINCT o.customer_id) FILTER (WHERE o.day - c.cohort_day = 2) AS day2,
       count(DISTINCT o.customer_id) FILTER (WHERE o.day - c.cohort_day = 3) AS day3
FROM cohorts c JOIN opens o USING (customer_id)
GROUP BY c.cohort_day ORDER BY c.cohort_day;</div>
  <div class="fx" data-lang="text"> cohort_day | users | day1 | day2 | day3 
------------+-------+------+------+------
 2026-03-01 |     1 |    1 |    1 |    1
 2026-03-02 |     3 |    2 |    2 |    2
 2026-03-03 |     1 |    0 |    1 |    0
 2026-03-04 |     2 |    1 |    0 |    0
(4 rows)</div>
  <p>Read across a row: of the three customers who started on 2 March, two were active on each of days 1, 2 and 3 (not always the same two). Cohorts near the end of the data have fewer days observed, so their later columns should be shown as "not yet known" rather than as zeros in a real report.</p>

  <h2 id="si-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Most wrong answers in SQL rounds come from the same handful of bugs, and several have already appeared above. The quickest to spot are the evaluation-order errors: putting an aggregate or a window function in WHERE. SQL logically runs FROM, then WHERE, then GROUP BY, then HAVING, then SELECT (where window functions are computed), then ORDER BY, so WHERE runs before any aggregate or window exists:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, count(*) FROM orders WHERE count(*) &gt; 1 GROUP BY customer_id;

SELECT order_id, amount FROM orders WHERE rank() OVER (ORDER BY amount DESC) = 1;</div>
  <div class="fx" data-lang="text">ERROR:  aggregate functions are not allowed in WHERE
LINE 1: SELECT customer_id, count(*) FROM orders WHERE count(*) &gt; 1 ...
                                                       ^
ERROR:  window functions are not allowed in WHERE
LINE 1: SELECT order_id, amount FROM orders WHERE rank() OVER (ORDER...
                                                  ^</div>
  <p>Both are errors, and the messages say exactly why. Aggregate conditions go in HAVING; window results are computed in a CTE and filtered in an outer query.</p>
  <p>The most damaging mistake, because it gives a plausible wrong number instead of an error, is fan-out: joining a table to a finer-grained table and then summing a coarser-grained column.</p>
  <div class="fx" data-lang="sql">-- Asha's orders and spend, after joining to order lines
SELECT c.name, count(*) AS orders, sum(o.amount) AS spend
FROM customers c JOIN orders o USING (customer_id) JOIN order_items oi USING (order_id)
WHERE c.name = 'Asha' GROUP BY c.name;

-- Fixed: count distinct orders; take spend from the order-level table only
SELECT c.name, count(DISTINCT o.order_id) AS orders, sum(oi.qty) AS items,
       (SELECT sum(amount) FROM orders WHERE customer_id = c.customer_id) AS spend
FROM customers c JOIN orders o USING (customer_id) JOIN order_items oi USING (order_id)
WHERE c.name = 'Asha' GROUP BY c.customer_id, c.name;</div>
  <div class="fx" data-lang="text"> name | orders |  spend  
------+--------+---------
 Asha |      5 | 1620.00
(1 row)

 name | orders | items | spend  
------+--------+-------+--------
 Asha |      3 |     7 | 930.00
(1 row)</div>
  <p>Joining Asha's orders to their lines repeats orders 104 and 110 (two lines each), so the first query reports 5 orders and ₹1,620 of spend; the truth is 3 orders and ₹930. The fix is to count distinct orders and take order-level numbers from the order-level table, or more generally to aggregate each table at its own grain before joining.</p>
  <p>Integer division silently truncates. "What fraction of orders were cancelled?" divides one integer count by another:</p>
  <div class="fx" data-lang="sql">SELECT count(*) FILTER (WHERE status = 'cancelled') / count(*) AS fraction FROM orders;

SELECT round(100.0 * count(*) FILTER (WHERE status = 'cancelled') / count(*), 1) AS cancelled_pct FROM orders;</div>
  <div class="fx" data-lang="text"> fraction 
----------
        0
(1 row)

 cancelled_pct 
---------------
          20.0
(1 row)</div>
  <p>Two cancelled out of ten is 0 in integer arithmetic. Multiply by <code>100.0</code> (or cast to numeric) before dividing, and the answer becomes 20.0%.</p>
  <p><code>BETWEEN</code> on a timestamp loses the last day. "Orders between 2 and 8 March":</p>
  <div class="fx" data-lang="sql">SELECT count(*) AS with_between FROM orders
WHERE ordered_at BETWEEN '2026-03-02' AND '2026-03-08';

SELECT count(*) AS half_open FROM orders
WHERE ordered_at &gt;= '2026-03-02' AND ordered_at &lt; '2026-03-09';</div>
  <div class="fx" data-lang="text"> with_between 
--------------
            9
(1 row)

 half_open 
-----------
        10
(1 row)</div>
  <p>The literal <code>'2026-03-08'</code> means midnight at the <em>start</em> of 8 March, so order 110 at 20:50 that evening is outside the range. Always use a half-open range on timestamps: <code>&gt;= start AND &lt; the day after the end</code>.</p>
  <p>Finally, <code>&lt;&gt;</code> silently drops NULLs. "Customers not in Pune":</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE city &lt;&gt; 'Pune' ORDER BY name;

SELECT name FROM customers WHERE city IS DISTINCT FROM 'Pune' ORDER BY name;</div>
  <div class="fx" data-lang="text"> name  
-------
 Ben
 Dia
 Farah
(3 rows)

 name  
-------
 Ben
 Dia
 Esha
 Farah
(4 rows)</div>
  <p>Esha's city is NULL, and <code>NULL &lt;&gt; 'Pune'</code> is UNKNOWN, which WHERE treats as false, so she disappears from the first result. <code>IS DISTINCT FROM</code> treats NULL as an ordinary value and keeps her. Whether an unknown city counts as "not Pune" is a question to ask the interviewer, but you should know which query gives which answer. The same NULL logic is behind the NOT IN trap in section 05.</p>

  <h2 id="si-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The method</h3>
  <ul>
    <li><b>Grain</b>: what is one output row? Zero rows included? Cancelled counted? Which time zone?</li>
    <li><b>Tables</b>: know each table's grain; a join to a finer table repeats rows (fan-out).</li>
    <li><b>Steps</b>: one idea per CTE (filter → aggregate → rank → pick); run each one.</li>
    <li><b>Edges</b>: ties, NULLs, duplicates, empty groups, division by zero, date boundaries, partial periods.</li>
  </ul>
  <h3>Patterns</h3>
  <table class="tbl">
    <tr><th>Problem</th><th>Pattern</th><th>Signature trap</th></tr>
    <tr><td>Second highest</td><td><code>max(x) WHERE x &lt; (SELECT max(x) …)</code></td><td>doesn't generalise to N</td></tr>
    <tr><td>Nth highest</td><td><code>dense_rank() OVER (ORDER BY x DESC) = N</code> in a CTE</td><td>OFFSET counts ties twice; RANK skips N</td></tr>
    <tr><td>Top-N per group</td><td>aggregate → <code>rank() OVER (PARTITION BY g ORDER BY m DESC)</code> → <code>&lt;= N</code></td><td>ROW_NUMBER drops ties</td></tr>
    <tr><td>Latest per group</td><td><code>DISTINCT ON (g) … ORDER BY g, t DESC</code></td><td>PostgreSQL only</td></tr>
    <tr><td>Find duplicates</td><td><code>GROUP BY key HAVING count(*) &gt; 1</code></td><td>agree what "duplicate" means</td></tr>
    <tr><td>Delete duplicates</td><td><code>row_number() OVER (PARTITION BY key ORDER BY id) &gt; 1</code></td><td>no UNIQUE constraint afterwards</td></tr>
    <tr><td>Has both X and Y</td><td><code>WHERE x IN (…) GROUP BY … HAVING count(DISTINCT x) = 2</code></td><td><code>WHERE x = 'A' AND x = 'B'</code></td></tr>
    <tr><td>Never did X</td><td><code>NOT EXISTS</code></td><td>NOT IN with a NULL returns nothing</td></tr>
    <tr><td>Every day, zeros included</td><td><code>generate_series</code> LEFT JOIN facts (filters in ON), <code>count(fact.id)</code></td><td>WHERE after LEFT JOIN; count(*)</td></tr>
    <tr><td>Pivot</td><td><code>count(*) FILTER (WHERE …)</code> per column</td><td><code>COUNT(CASE … ELSE 0 END)</code></td></tr>
    <tr><td>Running total</td><td><code>sum(x) OVER (ORDER BY t ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)</code></td><td>default RANGE frame lumps ties</td></tr>
    <tr><td>Moving average</td><td><code>avg(x) OVER (ORDER BY t ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)</code> on a spine</td><td>missing days stretch the window</td></tr>
    <tr><td>Previous row</td><td><code>lag(x) OVER (PARTITION BY g ORDER BY t)</code></td><td>first row is NULL, not 0</td></tr>
    <tr><td>Year-over-year</td><td>self-join <code>prev.month = cur.month - interval '1 year'</code></td><td>LAG(12) with a missing month; partial periods</td></tr>
    <tr><td>Streaks</td><td>distinct days → <code>day - row_number()</code> = island → group</td><td>counting pairs; no DISTINCT</td></tr>
    <tr><td>Funnel</td><td>one row per session, <code>min(t) FILTER</code> per step, steps in time order</td><td>counting events</td></tr>
    <tr><td>Retention</td><td>cohort = first day; EXISTS activity in [c+1, c+N]; complete windows only</td><td>day 0 counted; open windows</td></tr>
  </table>
  <h3>Formulas</h3>
  <ul>
    <li>Growth % = (current − previous) ÷ previous × 100.0</li>
    <li>Step conversion = sessions reaching step k+1 ÷ sessions reaching step k</li>
    <li>Retention % = users in cohort active in the window ÷ users in cohort</li>
    <li>Island id = date − row_number() within the entity, ordered by date</li>
    <li>Median = <code>percentile_cont(0.5) WITHIN GROUP (ORDER BY x)</code></li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Aggregates and window functions are not allowed in WHERE.</li>
    <li>Fan-out: aggregate each table at its grain before joining.</li>
    <li>Integer division: <code>2 / 10 = 0</code>; use <code>100.0 *</code>.</li>
    <li><code>BETWEEN</code> on timestamps loses the last day; use <code>&gt;= start AND &lt; end + 1 day</code>.</li>
    <li><code>&lt;&gt;</code> and NOT IN drop or break on NULL; use IS DISTINCT FROM and NOT EXISTS.</li>
  </ul>

  <h2 id="si-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between WHERE and HAVING?</summary><div class="qa-body">WHERE filters individual rows before grouping and cannot use aggregates. HAVING filters whole groups after aggregation, so it can use <code>count(*)</code> or <code>sum(…)</code>. <code>WHERE status &lt;&gt; 'cancelled'</code> removes rows first; <code>HAVING count(*) &gt; 1</code> removes customers after counting. Put non-aggregate conditions in WHERE so fewer rows reach the grouping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order does SQL evaluate a query? Can you use a SELECT alias in WHERE?</summary><div class="qa-body">Logically: FROM and JOIN, WHERE, GROUP BY, HAVING, SELECT (window functions are computed here), DISTINCT, ORDER BY, LIMIT. A SELECT alias does not exist yet when WHERE runs, so using it there is an error, but it works in ORDER BY. The same order explains why window results must be filtered in an outer query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ROW_NUMBER vs RANK vs DENSE_RANK?</summary><div class="qa-body">They differ only on ties. ROW_NUMBER gives every row a different number, breaking ties arbitrarily. RANK gives tied rows the same number and leaves a gap afterwards (1, 2, 2, 4). DENSE_RANK gives tied rows the same number with no gap (1, 2, 2, 3). Use DENSE_RANK for "Nth highest value", RANK for competition-style ranking, ROW_NUMBER for exactly one row per group or for de-duplication.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you find the Nth highest salary, and what is wrong with LIMIT/OFFSET?</summary><div class="qa-body">Compute <code>dense_rank() OVER (ORDER BY salary DESC)</code> in a CTE and keep the rows where the rank equals N. LIMIT 1 OFFSET N−1 returns the Nth <em>row</em>, so tied salaries are counted more than once and the answer is wrong whenever there are ties above position N. Also decide whether to return NULL or no rows when there are fewer than N distinct salaries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>COUNT(*) vs COUNT(column) vs COUNT(DISTINCT column)?</summary><div class="qa-body">COUNT(*) counts rows. COUNT(column) counts rows where that column is not NULL. COUNT(DISTINCT column) counts different non-NULL values. On Biteful's customers they give 7, 6 (Esha's city is NULL) and 2 (Pune and Mumbai). After a LEFT JOIN, count a right-hand column, not *, to get 0 for unmatched rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>UNION vs UNION ALL?</summary><div class="qa-body">UNION ALL appends the results as they are. UNION also removes duplicate rows, which requires a sort or hash and is slower. Customer cities plus restaurant cities give 12 rows with UNION ALL but 3 with UNION (Pune, Mumbai and NULL, since UNION treats NULLs as equal). Default to UNION ALL unless you actually need de-duplication.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>IN vs EXISTS vs JOIN for "customers who ordered"? And why is NOT IN dangerous?</summary><div class="qa-body">All three can find customers with orders, and modern planners often produce the same semi-join plan for IN and EXISTS. A plain JOIN returns a customer once per order, so it needs DISTINCT. For the negative version, NOT IN returns no rows at all if the subquery contains a single NULL, because <code>x &lt;&gt; NULL</code> is UNKNOWN; NOT EXISTS does not have this problem and is the safe default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>DELETE vs TRUNCATE vs DROP?</summary><div class="qa-body">DELETE removes chosen rows (it accepts WHERE), row by row, firing row triggers. TRUNCATE removes all rows at once by discarding the table's data files, which is much faster, but takes no WHERE and does not fire row triggers. DROP removes the table itself, structure included. In PostgreSQL all three are transactional and can be rolled back; in MySQL, TRUNCATE and DROP commit implicitly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a correlated subquery and a window function for "orders above their restaurant's average"?</summary><div class="qa-body">A correlated subquery, <code>WHERE amount &gt; (SELECT avg(amount) FROM orders o2 WHERE o2.restaurant_id = o.restaurant_id)</code>, is logically re-evaluated for each outer row. A window version computes <code>avg(amount) OVER (PARTITION BY restaurant_id)</code> once per row in a CTE and filters outside, which usually reads the table once. Both give the same answer; the window version tends to scale better and lets you show the average alongside each row.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ROWS vs RANGE in a window frame?</summary><div class="qa-body">ROWS counts physical rows: "the current row and the two before it". RANGE works on values: all rows whose ORDER BY value falls in the range, so rows tied on the ORDER BY value (peers) are always included together. The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING to CURRENT ROW, which makes a running total jump by a whole day's worth when several rows share a date. Write ROWS explicitly for running totals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CTE vs subquery vs temporary table?</summary><div class="qa-body">A CTE is a named subquery visible only inside one statement; it makes multi-step queries readable, and since PostgreSQL 12 the planner can inline it like a subquery unless you write <code>MATERIALIZED</code>. A subquery is the same idea written inline. A temporary table is physically stored for the session, can be indexed and reused across several statements, at the cost of writing it out. Recursive problems (hierarchies, referral chains) need <code>WITH RECURSIVE</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through how you would answer "top 3 restaurants by delivered revenue in each city".</summary><div class="qa-body">Grain: one row per (city, restaurant), at most three per city. Step 1: sum delivered amount per restaurant (LEFT JOIN from restaurants if zero-revenue ones should compete). Step 2: <code>rank() OVER (PARTITION BY city ORDER BY revenue DESC)</code>. Step 3: keep rank ≤ 3. Edges: ties can return more than three (say whether that is wanted, or use ROW_NUMBER), NULL cities, and cancelled orders excluded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you remove duplicate rows but keep one copy?</summary><div class="qa-body">Define what makes two rows duplicates (the key columns), then number the copies with <code>row_number() OVER (PARTITION BY key columns ORDER BY id)</code> and delete rows numbered above 1. Run it as a SELECT first to check. Afterwards add a UNIQUE constraint so duplicates cannot come back. With no id column, PostgreSQL's <code>ctid</code> can identify physical rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is LAG(revenue, 12) not a safe way to compute year-over-year growth?</summary><div class="qa-body">LAG moves by rows, not by time. If any month is missing, twelve rows back is no longer the same month last year, so months get compared with the wrong month. A self-join on <code>month - interval '1 year'</code> matches by date, or you can build a complete month spine first and then use LAG. Also flag partial periods like month-to-date.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the gaps-and-islands technique.</summary><div class="qa-body">Reduce the data to one row per entity per day, number the rows with ROW_NUMBER in date order, and compute date minus row number. Within a run of consecutive days both increase by one together, so the difference is constant; a gap changes it. Group by entity and that difference to get each run's length, start and end. It also finds missing id ranges and merges overlapping periods.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An interviewer asks for 7-day retention, but your data ends 3 days after the latest signups. What do you say?</summary><div class="qa-body">Those cohorts have not had seven days to return, so their retention is not known yet, and including them would understate it. Report only cohorts whose window has closed, or show the recent ones separately as incomplete. Also confirm that the first visit (day 0) does not count as a return.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Clustered vs non-clustered index?</summary><div class="qa-body">A clustered index stores the table's rows themselves in key order, so there can be only one; SQL Server and MySQL InnoDB (by primary key) work this way. A non-clustered index is a separate sorted structure pointing to the rows, and a table can have many. PostgreSQL tables are unordered heaps, so all its indexes are non-clustered; the <code>CLUSTER</code> command reorders the table once but the order is not maintained (<a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Primary key vs unique constraint?</summary><div class="qa-body">Both enforce uniqueness with an index. A table has one primary key, its columns are NOT NULL, and it is what foreign keys normally reference. A table can have several unique constraints, and they allow NULLs (in PostgreSQL, several NULLs by default, since NULL is not equal to NULL).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the transaction isolation levels and the anomalies they prevent?</summary><div class="qa-body">Read Uncommitted allows dirty reads (seeing uncommitted changes); Read Committed prevents those but allows non-repeatable reads (a row changes between two reads in one transaction); Repeatable Read prevents those but, in the SQL standard, allows phantoms (new rows appear in a repeated range query); Serializable prevents all of them, making transactions behave as if run one at a time. PostgreSQL defaults to Read Committed and its Repeatable Read also prevents phantoms (<a class="xref" data-note="sql_transactions">Transactions &amp; Concurrency</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is normalisation, and when would you denormalise?</summary><div class="qa-body">Normalisation splits tables so each fact is stored once (1NF atomic values, 2NF no partial dependencies, 3NF no transitive dependencies), preventing update, insert and delete anomalies. You denormalise, by storing totals, copying columns or building materialised views and star schemas, when measured reads are too slow and someone owns keeping the copies in sync (<a class="xref" data-note="sql_modeling">Data Modeling</a>).</div></details>
</main>
`
});
