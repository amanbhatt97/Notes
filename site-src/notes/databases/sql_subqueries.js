// notes/databases/sql_subqueries.js — Subqueries, CTEs & Views
Object.assign(TOPIC_CONTENT, {
  "sql_subqueries": `<main>
  <h1>Subqueries, CTEs &amp; Views</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Subqueries, CTEs &amp; Views</span></div>
  <p class="lead">Many real questions cannot be answered in one step, because they need the answer to a smaller question first. "Which orders are bigger than our average order?" needs the average before it can compare anything, and "who are our best customers?" needs each customer's total before it can rank them. A <strong>subquery</strong> is a query written inside another query so that the database can answer the small question and use its result straight away; CTEs give those inner steps names, and views and functions save them inside the database for everyone to reuse. This is everyday work for analysts and backend developers, and interviewers use these tools to check whether you can break a problem into steps and avoid the silent traps (a NULL inside NOT IN, a "single value" that is really three rows). The whole page uses one running example, <strong>Biteful</strong>, the food-delivery company from <a class="xref" data-note="sql_joins">JOINs</a>, with 7 customers, 5 restaurants, 10 orders and 15 order lines. Every result shown was produced by running the query in PostgreSQL 16 on those rows.</p>

  <h2 id="sq-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Subqueries, CTEs &amp; Views</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Subqueries by shape</div>
        <ul>
          <li><b>Scalar</b>: one value, usable anywhere a value goes</li>
          <li><b>List</b>: one column, used after <code>IN</code></li>
          <li><b>Derived table</b>: a whole table in FROM</li>
          <li><b>Correlated</b>: reads the outer row, runs per row</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Yes/no tests</div>
        <ul>
          <li>JOIN repeats rows; EXISTS and IN return each row once</li>
          <li>EXISTS and IN get the same semi-join plan</li>
          <li>NOT IN + one NULL = zero rows; use NOT EXISTS</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Named steps</div>
        <ul>
          <li><b>CTE</b>: <code>WITH step AS (…)</code>, read top-down</li>
          <li><b>Recursive CTE</b>: anchor + step until a round is empty</li>
          <li><b>LATERAL</b>: a FROM-subquery that runs once per row</li>
          <li><b>Set operations</b>: stack results (UNION ALL, EXCEPT…)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Saved in the database</div>
        <ul>
          <li><b>View</b>: saved query, always fresh, not faster</li>
          <li><b>Materialized view</b>: saved result, fast, stale until REFRESH</li>
          <li><b>Function</b>: returns a value; <b>procedure</b>: CALLed to do work</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sq-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Subqueries Exist</span><span class="rm-sub">a question that needs another question's answer</span></div></div>
      <div class="rm-item rm-done" data-target="sq-scalar"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Scalar Subqueries</span><span class="rm-sub">one value, used anywhere a value fits</span></div></div>
      <div class="rm-item rm-done" data-target="sq-derived"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Lists and Derived Tables</span><span class="rm-sub">IN lists, and whole tables in FROM</span></div></div>
      <div class="rm-item rm-done" data-target="sq-corr"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Correlated Subqueries</span><span class="rm-sub">an inner query that changes with each row</span></div></div>
      <div class="rm-item rm-done" data-target="sq-exists"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">EXISTS vs IN vs JOIN</span><span class="rm-sub">"has any?" written three ways</span></div></div>
      <div class="rm-item rm-done" data-target="sq-notin"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">NOT EXISTS and the NOT IN Trap</span><span class="rm-sub">how one NULL empties a result</span></div></div>
      <div class="rm-item rm-done" data-target="sq-cte"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">CTEs (WITH)</span><span class="rm-sub">naming each step of a long query</span></div></div>
      <div class="rm-item rm-done" data-target="sq-rec"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Recursive CTEs</span><span class="rm-sub">referral chains, trees and calendars</span></div></div>
      <div class="rm-item rm-done" data-target="sq-lat"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">LATERAL</span><span class="rm-sub">a subquery that runs once per row</span></div></div>
      <div class="rm-item rm-done" data-target="sq-set"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Set Operations</span><span class="rm-sub">UNION, INTERSECT, EXCEPT</span></div></div>
      <div class="rm-item rm-done" data-target="sq-view"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Views and Materialized Views</span><span class="rm-sub">saving a query, or saving its result</span></div></div>
      <div class="rm-item rm-done" data-target="sq-func"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Functions and Stored Procedures</span><span class="rm-sub">putting logic inside the database</span></div></div>
      <div class="rm-item rm-done" data-target="sq-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">queries that run and are still wrong</span></div></div>
      <div class="rm-item rm-done" data-target="sq-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, syntax, comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="sq-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on this topic</span></div></div>
    </div>
  </div>

  <h2 id="sq-why"><span class="num">01</span>Why Subqueries Exist</h2>
  <p>Biteful keeps its data in the same tables you met in <a class="xref" data-note="sql_joins">JOINs</a>. Most of this page uses <code>orders</code>, joined to <code>customers</code> and <code>restaurants</code> when we want names instead of ids. Here are the ten orders, which you will see again and again:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, r.name AS restaurant,
       to_char(o.ordered_at, 'Mon DD HH24:MI') AS ordered_at, o.status, o.amount
FROM orders o
JOIN customers c   ON c.customer_id = o.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
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
  <p>A few details will matter later. Asha has three orders, Ben and Chen two each. Orders 105 and 107 were cancelled and 110 is still pending; the other seven were delivered. The <code>customers</code> table also has a column called <code>referred_by</code>, which stores the id of the customer who invited this one, so it points back into the same table:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, name, city, referred_by FROM customers ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> customer_id | name  |  city  | referred_by 
-------------+-------+--------+-------------
           1 | Asha  | Pune   |        NULL
           2 | Ben   | Mumbai |           1
           3 | Chen  | Pune   |           1
           4 | Dia   | Mumbai |        NULL
           5 | Esha  | NULL   |        NULL
           6 | Farah | Mumbai |           2
           7 | Gita  | Pune   |        NULL
(7 rows)</div>
  <p>Ben and Chen were referred by Asha (1), Farah by Ben (2), and the other four joined on their own, so their <code>referred_by</code> is NULL (SQL's marker for "no value"). Gita has never placed an order. Esha has no city.</p>
  <p>Now the finance team asks a simple-sounding question: "which orders are bigger than our average order?" You already know how to compute an average with <code>AVG()</code> and how to filter with WHERE, so the natural first attempt puts them together:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount
FROM orders
WHERE amount &gt; AVG(amount);</div>
  <div class="fx" data-lang="text">ERROR:  aggregate functions are not allowed in WHERE
LINE 3: WHERE amount &gt; AVG(amount);
                       ^</div>
  <p>PostgreSQL refuses, and the reason is worth understanding. WHERE is checked one row at a time: the database picks up order 101, decides whether to keep it, then picks up order 102, and so on. An average, on the other hand, needs <em>all</em> the rows before it can be computed. At the moment WHERE is looking at order 101, the average simply does not exist yet, so SQL does not allow aggregate functions in WHERE at all (this order of work is covered in <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a>).</p>
  <p>The workaround a beginner reaches for is to run two queries by hand: first ask for the average, read the number off the screen, and then type that number into a second query.</p>
  <div class="fx" data-lang="sql">SELECT ROUND(AVG(amount), 2) AS avg_amount FROM orders;</div>
  <div class="fx" data-lang="text"> avg_amount 
------------
     351.00
(1 row)</div>
  <p>The average is 351, so the second query would be <code>WHERE amount &gt; 351</code>. That gives the right answer today, but the number 351 is now frozen inside the query. Tomorrow, when new orders arrive and the real average moves, the report silently keeps comparing with yesterday's 351. A person has to remember to re-run the first query and edit the second one every time.</p>
  <p>Think of a manager who is in the middle of writing an instruction and needs one fact. She does not stop, walk to the accounts office, write the number on a sticky note and come back. She simply writes the instruction so that it contains the question: "show me every order above <em>whatever our average order is right now</em>". Whoever carries out the instruction looks up the average at that moment and uses it. That is exactly what a <strong>subquery</strong> is: a complete SELECT statement written in brackets inside another statement, so that the database runs the inner question first and uses its answer in the outer one. The outer statement is often called the <strong>outer query</strong> and the bracketed one the <strong>inner query</strong>. Because the inner query runs every time the outer one runs, the answer can never go stale.</p>
  <p>The rest of this page grows this one idea. A subquery can return a single value, a list, or a whole table; it can depend on the row the outer query is looking at; it can be given a name (a CTE) or even repeat itself (a recursive CTE); and it can be saved inside the database as a view or function so that nobody has to rewrite it.</p>

  <h2 id="sq-scalar"><span class="num">02</span>Scalar Subqueries</h2>
  <p>The simplest kind of subquery returns exactly one row with exactly one column, in other words a single value. It is called a <strong>scalar subquery</strong> ("scalar" is the mathematical word for a single number, as opposed to a list or table). Because it produces one value, you can put it anywhere SQL expects one value: after a comparison in WHERE, inside a calculation, or as a column in the SELECT list. Here is the finance question, written properly:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount
FROM orders
WHERE amount &gt; (SELECT AVG(amount) FROM orders)
ORDER BY amount DESC;</div>
  <div class="fx" data-lang="text"> order_id | amount 
----------+--------
      109 | 600.00
      103 | 520.00
      102 | 450.00
      104 | 380.00
(4 rows)</div>
  <p>Read it from the inside out. PostgreSQL first runs <code>(SELECT AVG(amount) FROM orders)</code>, which gives 351 (3510 in total divided by 10 orders). It then runs the outer query as if you had typed <code>WHERE amount &gt; 351</code>: orders 109, 103, 102 and 104 (600, 520, 450 and 380) pass, and the six orders at 310 or below do not. If a ₹2,000 order arrives tomorrow, the average changes and the same query adapts with no editing.</p>
  <p>A scalar subquery can also appear in the SELECT list, which is handy for showing each row next to a single overall figure:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
       (SELECT ROUND(AVG(amount), 2) FROM orders)          AS avg_amount,
       amount - (SELECT ROUND(AVG(amount), 2) FROM orders) AS diff
FROM orders
ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id | amount | avg_amount |  diff   
----------+--------+------------+---------
      101 | 240.00 |     351.00 | -111.00
      102 | 450.00 |     351.00 |   99.00
      103 | 520.00 |     351.00 |  169.00
      104 | 380.00 |     351.00 |   29.00
      105 | 310.00 |     351.00 |  -41.00
      106 | 180.00 |     351.00 | -171.00
      107 | 260.00 |     351.00 |  -91.00
      108 | 260.00 |     351.00 |  -91.00
      109 | 600.00 |     351.00 |  249.00
      110 | 310.00 |     351.00 |  -41.00
(10 rows)</div>
  <p>The inner query has nothing to do with the row being displayed, so its answer, 351.00, is the same on every line, and <code>diff</code> is just each amount minus that number. Order 109 is 249 above average and order 106 is 171 below. (PostgreSQL is smart enough to run a subquery like this once, not ten times, because it does not depend on the current row.)</p>
  <p>The word "scalar" is a promise, and the database holds you to it. If the inner query returns more than one row, the whole statement fails. The next query tries to show "the" order of each customer. Do not worry about how the inner query reads <code>c.customer_id</code> yet; that is the subject of section 04. Just watch what happens when a customer has several orders:</p>
  <div class="fx" data-lang="sql">SELECT name,
       (SELECT order_id FROM orders o WHERE o.customer_id = c.customer_id) AS order_id
FROM customers c;</div>
  <div class="fx" data-lang="text">ERROR:  more than one row returned by a subquery used as an expression</div>
  <p>Asha has three orders, so for her row the inner query returns three order ids, and a single cell cannot hold three values. The opposite case is quieter and more dangerous. When the inner query returns <em>no</em> rows, PostgreSQL does not complain; it simply uses NULL:</p>
  <div class="fx" data-lang="sql">SELECT name,
       (SELECT order_id FROM orders o WHERE o.customer_id = c.customer_id) AS order_id
FROM customers c
WHERE name IN ('Farah', 'Gita');</div>
  <div class="fx" data-lang="text"> name  | order_id 
-------+----------
 Farah |      109
 Gita  |     NULL
(2 rows)</div>
  <p>Farah has exactly one order, so she gets 109. Gita has none, so she gets NULL with no warning at all. The lesson is that a scalar subquery must be <em>provably</em> single-row, not just single-row on today's data. A query that works because every customer currently happens to have one order will crash in production the day someone orders twice. You make it safe by using an aggregate (<code>MAX(order_id)</code> always returns one row), by filtering on a primary key, or by adding <code>ORDER BY … LIMIT 1</code>; and you decide deliberately what a NULL should mean when there is no match.</p>

  <h2 id="sq-derived"><span class="num">03</span>Lists and Derived Tables</h2>
  <p>A single value is not always enough. The growth team asks "which customers have at least one delivered order?", and the inner question here, "who has a delivered order?", naturally produces many customer ids, not one. Let us run the inner question on its own first:</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered' ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> customer_id 
-------------
           1
           1
           2
           2
           3
           3
           6
(7 rows)</div>
  <p>This is a <strong>list subquery</strong>: one column, any number of rows. A list cannot go where a single value is expected, but it fits perfectly after <code>IN</code>, which asks "is this value anywhere in the list?":</p>
  <div class="fx" data-lang="sql">SELECT name
FROM customers
WHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'delivered')
ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> name  
-------
 Asha
 Ben
 Chen
 Farah
(4 rows)</div>
  <p>For each customer, PostgreSQL checks whether their id appears in the list 1, 1, 2, 2, 3, 3, 6. Asha's id appears twice, but IN only cares whether it appears at all, so she is listed once. Dia and Esha (cancelled orders only) and Gita (no orders) are not in the list and are left out. Think of a guard at a door with a guest list: he checks whether your name is on it, and it does not matter if someone wrote it twice.</p>
  <p>The second shape is a whole table. Suppose finance asks for the average order value, but wants it calculated from the order lines in <code>order_items</code> (each line has a quantity and a unit price). The obvious query averages the lines directly:</p>
  <div class="fx" data-lang="sql">SELECT ROUND(AVG(qty * unit_price), 2) AS avg_line_value, COUNT(*) AS lines
FROM order_items;</div>
  <div class="fx" data-lang="text"> avg_line_value | lines 
----------------+-------
         234.00 |    15
(1 row)</div>
  <p>This says 234, and it is wrong for the question asked. There are 15 lines, not 10 orders, so 3510 was divided by 15. Orders with two lines were counted twice, each time with a smaller piece of the bill. What we actually need is two steps: first add up the lines of each order to get one total per order, and then average those ten totals. One GROUP BY cannot do both, because after grouping by order there is nothing left to group again.</p>
  <p>A subquery placed in the FROM clause solves this. Its result is treated exactly like a table that the outer query reads from, and it is called a <strong>derived table</strong> because the table is derived from a query rather than stored on disk:</p>
  <div class="fx" data-lang="sql">SELECT ROUND(AVG(order_total), 2) AS avg_order_value, COUNT(*) AS orders
FROM (SELECT order_id, SUM(qty * unit_price) AS order_total
      FROM order_items
      GROUP BY order_id) AS t;</div>
  <div class="fx" data-lang="text"> avg_order_value | orders 
-----------------+--------
          351.00 |     10
(1 row)</div>
  <p>The inner query produces a temporary table, named <code>t</code> by the <code>AS t</code>, with one row per order and a column <code>order_total</code>. The outer query sees ten rows and averages them: 3510 / 10 = 351, which matches <code>AVG(orders.amount)</code> because each order's amount is the sum of its lines. Always give a derived table an alias; PostgreSQL 16 tolerates leaving it out, but older versions and MySQL reject the query.</p>
  <p>This "aggregate, then aggregate again" pattern is one of the most important in SQL. Whenever a question says "average X per Y", first reduce the data to one row per Y, then average. Interviewers ask for "average order value" precisely to see whether you average lines (234) or orders (351). The table below sums up how the place where a subquery sits decides what shape it must return:</p>
  <table class="tbl">
    <tr><th>Where the subquery sits</th><th>Shape it must return</th><th>Name</th><th>Biteful example</th></tr>
    <tr><td>after <code>=</code>, <code>&gt;</code>, in SELECT</td><td>1 row, 1 column</td><td>scalar subquery</td><td>average 351</td></tr>
    <tr><td>after <code>IN</code></td><td>1 column, any rows</td><td>list subquery</td><td>ids of customers with a delivered order</td></tr>
    <tr><td>in FROM</td><td>any table (needs an alias)</td><td>derived table</td><td>one total per order</td></tr>
  </table>

  <h2 id="sq-corr"><span class="num">04</span>Correlated Subqueries</h2>
  <p>Every inner query so far has been self-contained: it runs once and gives the same answer whichever outer row we are looking at. Now the operations team asks a sharper question: "which orders were above <em>their own restaurant's</em> average?" A ₹310 order is large for Dosa Hut, whose orders are small, but small for Biryani Bros. The company-wide 351 is the wrong yardstick; each order needs to be compared with a different number. Here are the four numbers we need:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, COUNT(*) AS orders, ROUND(AVG(amount), 2) AS avg_amount
FROM orders
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | orders | avg_amount 
---------------+--------+------------
            10 |      3 |     270.00
            11 |      3 |     410.00
            12 |      3 |     386.67
            13 |      1 |     310.00
(4 rows)</div>
  <p>(Momo Magic, restaurant 14, has no orders, so it does not appear.) We want order 101 compared with 270, order 102 with 410, order 103 with 386.67, and so on. A subquery that runs once cannot do that. We need an inner query that knows which restaurant the current outer row belongs to.</p>
  <p>That is a <strong>correlated subquery</strong>: a subquery that uses a column from the outer query, so that its result depends on the outer row currently being examined. "Correlated" just means "connected": the inner query is connected to the outer one. Think of a teacher marking report cards who wants to note whether each student scored above <em>their own class's</em> average. For Priya in 9A she looks up the 9A average; for Rahul in 9B she looks up the 9B average. The lookup is repeated for each student, with that student's class plugged in. A plain (non-correlated) subquery would be a single school-wide average worked out once.</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.restaurant_id, o.amount
FROM orders o
WHERE o.amount &gt; (SELECT AVG(x.amount)
                  FROM orders x
                  WHERE x.restaurant_id = o.restaurant_id)
ORDER BY o.order_id;</div>
  <div class="fx" data-lang="text"> order_id | restaurant_id | amount 
----------+---------------+--------
      102 |            11 | 450.00
      103 |            12 | 520.00
      109 |            11 | 600.00
      110 |            10 | 310.00
(4 rows)</div>
  <p>Two aliases make this work. The outer copy of the table is called <code>o</code> and the inner copy <code>x</code>, so that the line <code>WHERE x.restaurant_id = o.restaurant_id</code> can say precisely "inner rows whose restaurant equals the current outer row's restaurant". That line is the <em>correlation</em>: from inside the brackets it reaches out and reads <code>o.restaurant_id</code>. Logically, PostgreSQL runs the inner query once for every outer row, each time with a different restaurant plugged in. The trace below shows all ten runs:</p>
  <table class="tbl"><caption>The inner query, once per outer order</caption>
    <tr><th>outer row o</th><th>o.restaurant_id plugged in</th><th>inner AVG</th><th>amount &gt; AVG?</th></tr>
    <tr><td>101 · 240</td><td>10</td><td>270</td><td>no</td></tr>
    <tr><td>102 · 450</td><td>11</td><td>410</td><td><strong>yes</strong></td></tr>
    <tr><td>103 · 520</td><td>12</td><td>386.67</td><td><strong>yes</strong></td></tr>
    <tr><td>104 · 380</td><td>12</td><td>386.67</td><td>no (just below)</td></tr>
    <tr><td>105 · 310</td><td>13</td><td>310</td><td>no (equal is not greater)</td></tr>
    <tr><td>106 · 180</td><td>11</td><td>410</td><td>no</td></tr>
    <tr><td>107 · 260</td><td>12</td><td>386.67</td><td>no</td></tr>
    <tr><td>108 · 260</td><td>10</td><td>270</td><td>no</td></tr>
    <tr><td>109 · 600</td><td>11</td><td>410</td><td><strong>yes</strong></td></tr>
    <tr><td>110 · 310</td><td>10</td><td>270</td><td><strong>yes</strong></td></tr>
  </table>
  <p>Compare the result with section 02. Order 110 (310) was below the company average but is above Dosa Hut's 270, so it now passes. Order 104 (380) was above the company average but is just below Pizza Point's 386.67, so it now fails. The figure shows the mechanism for two of the restaurants: each outer row sends its own restaurant id into the inner query and is compared with whatever comes back.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <g font-size="10">
    <text x="85" y="14" text-anchor="middle" font-weight="bold">outer row o</text>
    <text x="415" y="14" text-anchor="middle" font-weight="bold">inner query, run for that row</text>
    <rect x="10" y="22" width="150" height="22" rx="4" class="fb"/><text x="18" y="37">101 · Dosa Hut · 240</text><line x1="160" y1="33" x2="318" y2="45" stroke="currentColor" opacity="0.6"/><text x="530" y="37" class="tr">✗</text>
    <rect x="10" y="48" width="150" height="22" rx="4" class="fb"/><text x="18" y="63">108 · Dosa Hut · 260</text><line x1="160" y1="59" x2="318" y2="45" stroke="currentColor" opacity="0.6"/><text x="530" y="63" class="tr">✗</text>
    <rect x="10" y="74" width="150" height="22" rx="4" class="fb"/><text x="18" y="89">110 · Dosa Hut · 310</text><line x1="160" y1="85" x2="318" y2="45" stroke="currentColor" opacity="0.6"/><text x="530" y="89" class="tg">✓ kept</text>
    <rect x="10" y="110" width="150" height="22" rx="4" class="fv"/><text x="18" y="125">102 · Biryani · 450</text><line x1="160" y1="121" x2="318" y2="150" stroke="currentColor" opacity="0.6"/><text x="530" y="125" class="tg">✓ kept</text>
    <rect x="10" y="136" width="150" height="22" rx="4" class="fv"/><text x="18" y="151">106 · Biryani · 180</text><line x1="160" y1="147" x2="318" y2="150" stroke="currentColor" opacity="0.6"/><text x="530" y="151" class="tr">✗</text>
    <rect x="10" y="162" width="150" height="22" rx="4" class="fv"/><text x="18" y="177">109 · Biryani · 600</text><line x1="160" y1="173" x2="318" y2="150" stroke="currentColor" opacity="0.6"/><text x="530" y="177" class="tg">✓ kept</text>
    <rect x="320" y="25" width="190" height="40" rx="6" class="fb sb"/><text x="415" y="42" text-anchor="middle">AVG where restaurant = 10</text><text x="415" y="57" text-anchor="middle" font-weight="bold">270</text>
    <rect x="320" y="130" width="190" height="40" rx="6" class="fv"/><text x="415" y="147" text-anchor="middle">AVG where restaurant = 11</text><text x="415" y="162" text-anchor="middle" font-weight="bold">410</text>
    </g>
  </svg><figcaption>Each outer row plugs its own restaurant id into the inner query and is compared with the result. The three Dosa Hut orders all get 270; the three Biryani Bros orders all get 410.</figcaption></figure>
  <p>Correlated subqueries work in the SELECT list too, where they attach a per-row number such as each customer's order count:</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id) AS n_orders
FROM customers c
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  | n_orders 
-------+----------
 Asha  |        3
 Ben   |        2
 Chen  |        2
 Dia   |        1
 Esha  |        1
 Farah |        1
 Gita  |        0
(7 rows)</div>
  <p>Gita gets 0 here, not NULL, because <code>COUNT(*)</code> of no rows is 0. Compare that with the lookup in section 02, which gave her NULL: the aggregate is what makes the difference.</p>
  <p>The weakness of a correlated subquery is cost. "Run the inner query once per outer row" is nothing for 10 orders and a real problem for 10 million. PostgreSQL can rewrite some correlated subqueries into joins (it does this for EXISTS and IN, as the next section shows), but a correlated <em>scalar</em> subquery like the average above usually does run once per row. The fix is to compute all the per-restaurant averages once, in a derived table, and join each order to its restaurant's row:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.restaurant_id, o.amount, ROUND(r.avg_amount, 2) AS rest_avg
FROM orders o
JOIN (SELECT restaurant_id, AVG(amount) AS avg_amount
      FROM orders GROUP BY restaurant_id) AS r
  ON r.restaurant_id = o.restaurant_id
WHERE o.amount &gt; r.avg_amount
ORDER BY o.order_id;</div>
  <div class="fx" data-lang="text"> order_id | restaurant_id | amount | rest_avg 
----------+---------------+--------+----------
      102 |            11 | 450.00 |   410.00
      103 |            12 | 520.00 |   386.67
      109 |            11 | 600.00 |   410.00
      110 |            10 | 310.00 |   270.00
(4 rows)</div>
  <p>The derived table <code>r</code> has just four rows, one per restaurant, computed in a single pass over <code>orders</code>. Each order joins to exactly one of them, and the WHERE compares. The four orders are the same as before (and <code>rest_avg</code> now shows the yardstick next to each one), but no inner query is repeated. A third way, usually the neatest, is a window function, <code>AVG(amount) OVER (PARTITION BY restaurant_id)</code>, covered in <a class="xref" data-note="sql_windows">Window Functions</a>. Use the correlated form when it reads most clearly and the data is small, and switch to the join or window form when the outer table is large.</p>

  <h2 id="sq-exists"><span class="num">05</span>EXISTS vs IN vs JOIN</h2>
  <p>The most common correlated subquery does not compute a number at all. It asks a yes/no question about each row: "does this customer have <em>any</em> delivered order?" There are three ways to write that, and they look interchangeable. The first is a join:</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'delivered'
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  
-------
 Asha
 Asha
 Ben
 Ben
 Chen
 Chen
 Farah
(7 rows)</div>
  <p>Asha, Ben and Chen appear twice each. That is not a bug in the join; it is what a join means. A join produces one output row for every <em>matching pair</em> of rows, and Asha matches two delivered orders, so she appears twice. If the next step of a report counts these rows to get "number of customers with a delivered order", it will say 7 instead of 4.</p>
  <p>The second way uses <strong>EXISTS</strong>, which takes a subquery and returns true if that subquery produces at least one row, and false if it produces none. It does not care what the rows contain, which is why people write <code>SELECT 1</code> inside it:</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.customer_id
                AND o.status = 'delivered')
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  
-------
 Asha
 Ben
 Chen
 Farah
(4 rows)</div>
  <p>For each customer, the correlated inner query looks for a delivered order belonging to that customer. As soon as it finds one, the answer is yes and the customer is kept, once. Think of asking a building's watchman "did flat 302 get a parcel today?" He checks the log and says "yes" at the first parcel he finds; he does not hand you a separate note for every parcel. EXISTS and IN behave like the watchman; a join hands you one note per parcel. The third way, <code>WHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'delivered')</code>, is the list query from section 03, and it returned the same four names.</p>
  <p>A common belief is that EXISTS must be slow because it "runs once per customer". We can check what PostgreSQL actually does by putting <code>EXPLAIN</code> in front of a query; it prints the <strong>execution plan</strong>, the step-by-step strategy the database chose, without running the query (plans are covered in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>). Here are the plans for the EXISTS version and the IN version:</p>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.customer_id
                AND o.status = 'delivered');</div>
  <div class="fx" data-lang="text">                     QUERY PLAN                     
----------------------------------------------------
 Hash Semi Join
   Hash Cond: (c.customer_id = o.customer_id)
   -&gt;  Seq Scan on customers c
   -&gt;  Hash
         -&gt;  Seq Scan on orders o
               Filter: (status = 'delivered'::text)
(6 rows)</div>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
SELECT c.name
FROM customers c
WHERE c.customer_id IN (SELECT o.customer_id FROM orders o
                        WHERE o.status = 'delivered');</div>
  <div class="fx" data-lang="text">                     QUERY PLAN                     
----------------------------------------------------
 Hash Semi Join
   Hash Cond: (c.customer_id = o.customer_id)
   -&gt;  Seq Scan on customers c
   -&gt;  Hash
         -&gt;  Seq Scan on orders o
               Filter: (status = 'delivered'::text)
(6 rows)</div>
  <p>The two plans are identical. In both, the top step is a <code>Hash Semi Join</code>. A <strong>semi join</strong> is a join that keeps each row from the left side at most once, as soon as one match is found on the right, and never adds columns from the right side. To do it, PostgreSQL reads the delivered orders once, builds a hash table of their customer ids (the <code>Hash</code> step), and then checks each customer against it. The "run once per customer" description is only the logical meaning; the optimizer turned both queries into the same efficient join. So choose between EXISTS and IN by what reads best, not by speed folklore. Its mirror image, keeping a row only when <em>no</em> match exists, is called an <strong>anti join</strong>, and it is where the three approaches finally stop being equivalent, as the next section shows.</p>
  <table class="tbl">
    <tr><th></th><th>JOIN</th><th>IN (subquery)</th><th>EXISTS</th></tr>
    <tr><td>Rows per customer</td><td>one per match (7 rows)</td><td>once (4)</td><td>once (4)</td></tr>
    <tr><td>Can show the other table's columns</td><td>yes</td><td>no</td><td>no</td></tr>
    <tr><td>Negated form with NULLs present</td><td>LEFT JOIN … IS NULL: safe</td><td>NOT IN: <strong>broken</strong></td><td>NOT EXISTS: safe</td></tr>
  </table>
  <p>The rule of thumb follows from the table. If you need columns from the other table (the order amount, the restaurant name), you need a JOIN. If you only want to filter one table by whether related rows exist, use EXISTS or IN. People sometimes "fix" the join's duplicates by adding DISTINCT, which works for a plain list of names but breaks as soon as you add an order column or a COUNT; EXISTS states the real question directly.</p>

  <h2 id="sq-notin"><span class="num">06</span>NOT EXISTS and the NOT IN Trap</h2>
  <p>The growth team's next question is the negative one: "which customers have not referred anyone?" In English it translates word for word into "customer_id is not in the list of referrers", and the list of referrers is just the <code>referred_by</code> column:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, name, referred_by FROM customers ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> customer_id | name  | referred_by 
-------------+-------+-------------
           1 | Asha  |        NULL
           2 | Ben   |           1
           3 | Chen  |           1
           4 | Dia   |        NULL
           5 | Esha  |        NULL
           6 | Farah |           2
           7 | Gita  |        NULL
(7 rows)</div>
  <p>The non-NULL values are 1, 1 and 2 (Asha referred two people, Ben one), so the answer should be everyone except Asha and Ben: five customers. Here is the literal translation:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);</div>
  <div class="fx" data-lang="text"> name 
------
(0 rows)</div>
  <p>Zero rows, and no error. This is the most famous trap in SQL, and the cause is the four NULLs in the list. To see why, remember what <code>NOT IN</code> means. <code>3 NOT IN (1, 2, NULL)</code> is shorthand for "3 is different from 1 AND 3 is different from 2 AND 3 is different from NULL". The first two parts are clearly true. But NULL means "unknown", so "is 3 different from an unknown value?" can only be answered with "I can't tell". SQL represents "I can't tell" with a third truth value, <strong>UNKNOWN</strong>, alongside TRUE and FALSE (this is called <strong>three-valued logic</strong>). TRUE AND TRUE AND UNKNOWN is UNKNOWN, and WHERE keeps a row only when the condition is TRUE. You can watch this happen directly:</p>
  <div class="fx" data-lang="sql">SELECT 3 NOT IN (1, 2)       AS chen_no_null,
       3 NOT IN (1, 2, NULL) AS chen_with_null,
       1 NOT IN (1, 2, NULL) AS asha_with_null;</div>
  <div class="fx" data-lang="text"> chen_no_null | chen_with_null | asha_with_null 
--------------+----------------+----------------
 t            | NULL           | f
(1 row)</div>
  <p>Without a NULL in the list, <code>3 NOT IN (1, 2)</code> is true (<code>t</code>). Add a NULL and the same test becomes UNKNOWN, shown as NULL. For Asha, <code>1 NOT IN (1, 2, NULL)</code> is false, because she definitely is in the list, and that part is correct. The problem is that <em>nobody</em> can ever get TRUE once a NULL is in the list, so every customer is dropped. Imagine a guard told "let in anyone who is not on this list", where one line of the list is smudged and unreadable. An honest guard has to say to every visitor "you might be the smudged name, I can't be sure", and so he lets nobody in.</p>
  <p><strong>NOT EXISTS</strong> does not have this problem, because it never compares the customer with a list of values. It asks a different question: "is there any customer row whose <code>referred_by</code> equals my id?" A NULL <code>referred_by</code> simply never equals anything, so it never counts as a match, and it cannot poison the answer:</p>
  <div class="fx" data-lang="sql">SELECT c.name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM customers x WHERE x.referred_by = c.customer_id)
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  
-------
 Chen
 Dia
 Esha
 Farah
 Gita
(5 rows)</div>
  <p>These are the five correct customers. If you prefer to keep NOT IN, you must remove the NULLs inside the subquery yourself, which gives the same five names:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers
                          WHERE referred_by IS NOT NULL)
ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> name  
-------
 Chen
 Dia
 Esha
 Farah
 Gita
(5 rows)</div>
  <p>The third anti-join tool, a LEFT JOIN followed by a test for the missing side, is also NULL-safe. Here it answers "customers with no orders at all": the LEFT JOIN keeps every customer, fills the order columns with NULL when there is no matching order, and the WHERE keeps only those padded rows. Test a column that can never be NULL in a real match, such as the primary key <code>order_id</code>:</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;</div>
  <div class="fx" data-lang="text"> name 
------
 Gita
(1 row)</div>
  <p>This behaviour is standard SQL, not a PostgreSQL quirk; MySQL, SQL Server and SQLite all return zero rows for the broken NOT IN. What makes it dangerous is that the query runs fine and returns a believable empty result, and it may have worked for months until the first NULL arrived in the column. The safe habit is simple: use <code>IN</code> freely for positive tests, and use <code>NOT EXISTS</code> for every negative one.</p>

  <h2 id="sq-cte"><span class="num">07</span>CTEs (WITH)</h2>
  <p>Real questions often need three or four steps. "Which customers spend more than the average customer?", counting delivered orders only, needs: keep the delivered orders; add them up per customer; work out the average of those per-customer totals; keep the customers above it. The per-customer step is needed twice, once for the list and once for the average. With nothing but nested subqueries, it looks like this:</p>
  <div class="fx" data-lang="sql">SELECT c.name, cs.spend
FROM (SELECT customer_id, SUM(amount) AS spend
      FROM (SELECT * FROM orders WHERE status = 'delivered') d
      GROUP BY customer_id) cs
JOIN customers c USING (customer_id)
WHERE cs.spend &gt; (SELECT AVG(spend)
                  FROM (SELECT customer_id, SUM(amount) AS spend
                        FROM (SELECT * FROM orders WHERE status = 'delivered') d2
                        GROUP BY customer_id) cs2);</div>
  <div class="fx" data-lang="text"> name | spend  
------+--------
 Chen | 780.00
(1 row)</div>
  <p>The answer (Chen, 780) is right, but the query is hard to read and harder to change. You have to read it from the innermost brackets outwards, and the whole "spend per customer" block is written twice. If the definition of spend changes, say to include pending orders, both copies must be edited identically, and sooner or later someone will edit only one.</p>
  <p>A <strong>CTE</strong>, short for <strong>Common Table Expression</strong>, solves both problems. It lets you give each step a name at the top of the query with <code>WITH name AS (…)</code>, and then use that name like a table in later steps and in the final SELECT. Think of a recipe card: "1. Boil the vegetables. 2. Make the masala. 3. Mash step 1 into step 2." Each step has a name and is referred to later; nobody writes the recipe as one sentence full of nested brackets. Let us build the query one step at a time. Step 1, <code>delivered</code>, keeps 7 of the 10 orders; step 2 adds them up per customer:</p>
  <div class="fx" data-lang="sql">WITH delivered AS (SELECT * FROM orders WHERE status = 'delivered')
SELECT customer_id, SUM(amount) AS spend
FROM delivered
GROUP BY customer_id
ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> customer_id | spend  
-------------+--------
           1 | 620.00
           2 | 630.00
           3 | 780.00
           6 | 600.00
(4 rows)</div>
  <p>Asha's 620 is 240 + 380 (her pending 310 is excluded), Ben's 630 is 450 + 180, Chen's 780 is 520 + 260, and Farah's 600 is a single order. Their average is (620 + 630 + 780 + 600) / 4 = 657.5. Now the full query, with step 2 given its own name and reused:</p>
  <div class="fx" data-lang="sql">WITH delivered AS (                         -- step 1
  SELECT * FROM orders WHERE status = 'delivered'
),
customer_spend AS (                         -- step 2 reads step 1
  SELECT customer_id, SUM(amount) AS spend
  FROM delivered
  GROUP BY customer_id
)
SELECT c.name, cs.spend,
       (SELECT ROUND(AVG(spend), 2) FROM customer_spend) AS avg_spend
FROM customer_spend cs
JOIN customers c USING (customer_id)
WHERE cs.spend &gt; (SELECT AVG(spend) FROM customer_spend);</div>
  <div class="fx" data-lang="text"> name | spend  | avg_spend 
------+--------+-----------
 Chen | 780.00 |    657.50
(1 row)</div>
  <p>Read it from the top. <code>WITH delivered AS (…)</code> defines step 1. The comma starts the next CTE, <code>customer_spend</code>, which reads <code>FROM delivered</code> just as if <code>delivered</code> were a real table. The final SELECT then uses <code>customer_spend</code> three times: as the main table, inside the column that shows the average (657.50), and inside the WHERE. Only Chen's 780 is above 657.5. It is the same answer as the nested version, but each step is written once, has a meaningful name, and can be read in the order it happens. A CTE exists only for the single statement it belongs to; it is not saved anywhere.</p>
  <p>A natural question is whether a CTE is computed once and stored, or simply pasted into the main query. In PostgreSQL 12 and later the answer depends on how often it is used. A CTE referenced once is <strong>inlined</strong>: the planner merges it into the main query and optimises everything together, exactly as if you had written a subquery. A CTE referenced two or more times is <strong>materialized</strong>: computed once, kept in memory, and read from there each time. You can override the choice with <code>AS MATERIALIZED</code> or <code>AS NOT MATERIALIZED</code>. The two plans below show the difference on a tiny example:</p>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
WITH t AS (SELECT * FROM orders)
SELECT * FROM t WHERE order_id = 105;</div>
  <div class="fx" data-lang="text">         QUERY PLAN         
----------------------------
 Seq Scan on orders
   Filter: (order_id = 105)
(2 rows)</div>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
WITH t AS MATERIALIZED (SELECT * FROM orders)
SELECT * FROM t WHERE order_id = 105;</div>
  <div class="fx" data-lang="text">         QUERY PLAN         
----------------------------
 CTE Scan on t
   Filter: (order_id = 105)
   CTE t
     -&gt;  Seq Scan on orders
(4 rows)</div>
  <p>In the first plan the CTE has vanished: the filter <code>order_id = 105</code> is applied directly while scanning <code>orders</code>. On a large table that same freedom lets PostgreSQL use the primary-key index and jump straight to one row (on our 10-row table it decides a plain scan is cheaper). In the second plan the CTE acts as a fence: the whole of <code>orders</code> is first copied into a temporary result called <code>CTE t</code>, and only afterwards does <code>CTE Scan on t</code> filter it, so no index on <code>orders</code> can help. Before PostgreSQL 12, every CTE behaved like the second plan, which is where the folklore "CTEs are slow" comes from. Today, write CTEs for clarity and check the plan only if a heavily reused CTE seems slow.</p>

  <h2 id="sq-rec"><span class="num">08</span>Recursive CTEs</h2>
  <p>Every query so far has had a fixed number of steps. Some questions have an unknown number. "Show Farah's full referral chain, all the way up to the customer who started it": one self-join finds Farah's referrer (Ben), a second finds Ben's referrer (Asha), but a chain could be two links long or twenty, and we cannot write the right number of joins in advance. We need a query that keeps going until there is nothing left to find.</p>
  <p>A <strong>recursive CTE</strong> is a CTE that refers to itself. It is written <code>WITH RECURSIVE name AS (anchor UNION ALL step)</code> and has two parts. The <strong>anchor</strong> is an ordinary query that produces the starting rows. The <strong>recursive step</strong> is a query that reads the rows produced in the <em>previous round</em> and uses them to find the next rows. PostgreSQL runs the anchor once, then runs the step again and again, each time feeding it only the newest rows (called the <strong>working table</strong>), and stops when a round produces no rows. The final result is all the rounds stacked together. Think of asking your way up a chain in an office: you ask Farah "who sent you here?" and she says Ben; you ask Ben and he says Asha; you ask Asha and she says nobody, so you stop. Each question uses the previous answer. The simplest example just counts to five:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE n AS (
  SELECT 1 AS i                     -- anchor: round 0
  UNION ALL
  SELECT i + 1 FROM n WHERE i &lt; 5   -- step: reads the previous round
)
SELECT i FROM n;</div>
  <div class="fx" data-lang="text"> i 
---
 1
 2
 3
 4
 5
(5 rows)</div>
  <p>Round 0, the anchor, produces 1. Round 1 feeds that row into the step, which produces 2. Round 2 produces 3, and so on. When the working table holds 5, the condition <code>i &lt; 5</code> is false, the step produces nothing, and recursion stops. The output is all five rounds together. Now the referral chain, which uses exactly the same shape:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT customer_id, name, referred_by, 1 AS depth        -- anchor
  FROM customers
  WHERE customer_id = 6
  UNION ALL
  SELECT c.customer_id, c.name, c.referred_by, w.depth + 1 -- step
  FROM customers c
  JOIN chain w ON c.customer_id = w.referred_by
)
SELECT name, referred_by, depth FROM chain;</div>
  <div class="fx" data-lang="text"> name  | referred_by | depth 
-------+-------------+-------
 Farah |           2 |     1
 Ben   |           1 |     2
 Asha  |        NULL |     3
(3 rows)</div>
  <p>The anchor finds Farah (customer 6). The step joins <code>customers</code> to <code>chain w</code>, where <code>w</code> means "the rows found in the previous round", matching each customer whose id equals the previous person's <code>referred_by</code>. <code>w.depth + 1</code> counts the levels. The trace shows each round:</p>
  <table class="tbl"><caption>Rounds of the chain query</caption>
    <tr><th>round</th><th>working table (input)</th><th>step finds customer_id = referred_by</th><th>new row</th></tr>
    <tr><td>anchor</td><td>none</td><td>customer_id = 6</td><td>Farah, referred_by 2, depth 1</td></tr>
    <tr><td>1</td><td>Farah</td><td>customer 2</td><td>Ben, referred_by 1, depth 2</td></tr>
    <tr><td>2</td><td>Ben</td><td>customer 1</td><td>Asha, referred_by NULL, depth 3</td></tr>
    <tr><td>3</td><td>Asha</td><td><code>customer_id = NULL</code> matches nothing</td><td>none, so stop</td></tr>
  </table>
  <p>Flipping the join walks <em>down</em> the tree instead of up. Start from every customer nobody referred (the roots of the tree), and in each round find the customers whose <code>referred_by</code> is someone found in the previous round. A text column <code>path</code> records the route:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE tree AS (
  SELECT customer_id, name, 1 AS depth, name::text AS path
  FROM customers
  WHERE referred_by IS NULL                               -- roots
  UNION ALL
  SELECT c.customer_id, c.name, t.depth + 1, t.path || ' &gt; ' || c.name
  FROM customers c
  JOIN tree t ON c.referred_by = t.customer_id            -- one level down
)
SELECT name, depth, path FROM tree ORDER BY path;</div>
  <div class="fx" data-lang="text"> name  | depth |        path        
-------+-------+--------------------
 Asha  |     1 | Asha
 Ben   |     2 | Asha &gt; Ben
 Farah |     3 | Asha &gt; Ben &gt; Farah
 Chen  |     2 | Asha &gt; Chen
 Dia   |     1 | Dia
 Esha  |     1 | Esha
 Gita  |     1 | Gita
(7 rows)</div>
  <p>The anchor finds the four roots (Asha, Dia, Esha, Gita). Round 1 finds Ben and Chen, referred by Asha. Round 2 finds Farah, referred by Ben. Round 3 finds nobody, so recursion stops with 7 rows. Sorting by <code>path</code> prints the tree in reading order. This is how category trees, folder structures, organisation charts and bill-of-materials lists are queried in SQL.</p>
  <p>Recursion is also used to generate rows that do not exist in any table. A daily report must show every day, including days with no orders, but GROUP BY can only produce groups for dates that appear in the data. The fix is to generate the full list of dates, often called a <strong>date spine</strong>, and LEFT JOIN the orders onto it:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE days AS (
  SELECT DATE '2026-03-01' AS d
  UNION ALL
  SELECT d + 1 FROM days WHERE d &lt; DATE '2026-03-08'
)
SELECT d AS day, COUNT(o.order_id) AS orders
FROM days
LEFT JOIN orders o ON o.ordered_at::date = d
GROUP BY d
ORDER BY d;</div>
  <div class="fx" data-lang="text">    day     | orders 
------------+--------
 2026-03-01 |      0
 2026-03-02 |      3
 2026-03-03 |      2
 2026-03-04 |      2
 2026-03-05 |      2
 2026-03-06 |      0
 2026-03-07 |      0
 2026-03-08 |      1
(8 rows)</div>
  <p>The anchor gives March 1, and each round adds one day while the date is before March 8. The LEFT JOIN keeps every generated day even when no order matches, and <code>COUNT(o.order_id)</code> counts only real matches (it ignores the NULLs from padding), so March 1, 6 and 7 correctly show 0. In PostgreSQL the date list can also be produced by the built-in function <code>generate_series(DATE '2026-03-01', DATE '2026-03-08', INTERVAL '1 day')</code>; the recursive version works in nearly every database.</p>
  <p>Recursion has one real danger: it stops only when a round finds nothing, so bad data containing a loop makes it run forever. Suppose someone mistakenly sets Asha's <code>referred_by</code> to Farah. Now Farah → Ben → Asha → Farah → … never ends. PostgreSQL 14 added a <code>CYCLE</code> clause that remembers which keys have already been visited on each path and marks a row as a cycle instead of expanding it again (the update below runs inside a transaction that is rolled back, so the data is not really changed):</p>
  <div class="fx" data-lang="sql">UPDATE customers SET referred_by = 6 WHERE customer_id = 1;  -- bad data: a loop

WITH RECURSIVE chain AS (
  SELECT customer_id, name, referred_by FROM customers WHERE customer_id = 6
  UNION ALL
  SELECT c.customer_id, c.name, c.referred_by
  FROM customers c JOIN chain w ON c.customer_id = w.referred_by
) CYCLE customer_id SET is_cycle USING path
SELECT name, is_cycle FROM chain;</div>
  <div class="fx" data-lang="text"> name  | is_cycle 
-------+----------
 Farah | f
 Ben   | f
 Asha  | f
 Farah | t
(4 rows)</div>
  <p>The fourth row, Farah again, is flagged <code>is_cycle = t</code> and not followed any further, so the query ends. In databases without <code>CYCLE</code>, the usual guard is to carry a depth column and add <code>WHERE depth &lt; 100</code> to the step. Writing <code>UNION</code> instead of <code>UNION ALL</code> also stops exact repeats, but only when whole rows repeat; a growing depth column makes every row different and defeats it.</p>

  <h2 id="sq-lat"><span class="num">09</span>LATERAL</h2>
  <p>The support team wants each customer's two most recent orders. It feels like a derived table should do it: for a customer, sort their orders newest first and keep two. The difficulty is the words "for a customer". A normal subquery in FROM is computed on its own, before it is joined to anything, so it has no idea which customer it is working for:</p>
  <div class="fx" data-lang="sql">SELECT c.name, t.order_id
FROM customers c
JOIN (SELECT o.order_id FROM orders o
      WHERE o.customer_id = c.customer_id
      ORDER BY o.ordered_at DESC LIMIT 2) AS t ON true;</div>
  <div class="fx" data-lang="text">ERROR:  invalid reference to FROM-clause entry for table "c"
LINE 4:       WHERE o.customer_id = c.customer_id
                                    ^
DETAIL:  There is an entry for table "c", but it cannot be referenced from this part of the query.
HINT:  To reference that table, you must mark this subquery with LATERAL.</div>
  <p>The error message already names the fix. Writing <strong>LATERAL</strong> before a subquery in FROM allows it to refer to tables listed earlier in the same FROM clause. The subquery is then evaluated once for each row of those earlier tables, like a for-each loop: "for each customer c, run this subquery with c's values". You can think of it as a correlated subquery that has moved into FROM, which means it is allowed to return many rows and many columns instead of a single value. Picture a bank clerk going down the list of account holders and, for each one, pulling out that person's last two passbook entries; the "pull out" step depends on whose turn it is.</p>
  <div class="fx" data-lang="sql">SELECT c.name, t.order_id, to_char(t.ordered_at, 'Mon DD') AS day
FROM customers c
CROSS JOIN LATERAL (
  SELECT o.order_id, o.ordered_at
  FROM orders o
  WHERE o.customer_id = c.customer_id      -- uses c from outside
  ORDER BY o.ordered_at DESC
  LIMIT 2
) AS t
ORDER BY c.customer_id, t.ordered_at DESC;</div>
  <div class="fx" data-lang="text"> name  | order_id |  day   
-------+----------+--------
 Asha  |      110 | Mar 08
 Asha  |      104 | Mar 03
 Ben   |      106 | Mar 04
 Ben   |      102 | Mar 02
 Chen  |      108 | Mar 05
 Chen  |      103 | Mar 02
 Dia   |      105 | Mar 03
 Esha  |      107 | Mar 04
 Farah |      109 | Mar 05
(9 rows)</div>
  <p>For Asha, the subquery sorts her orders newest first (110 on Mar 8, 104 on Mar 3, 101 on Mar 2) and <code>LIMIT 2</code> keeps 110 and 104. Ben and Chen also get two each; Dia, Esha and Farah have only one order, so they get one row. <code>CROSS JOIN LATERAL</code> pairs each customer with whatever rows their subquery returned, and that is why Gita is missing: her subquery returned nothing, and a cross join with nothing produces nothing.</p>
  <p>When every customer must appear, use <code>LEFT JOIN LATERAL … ON true</code>. A LEFT JOIN keeps outer rows that have no match and fills the missing columns with NULL. The <code>ON true</code> is needed because LEFT JOIN syntax requires an ON clause, and here there is no extra condition: every row the subquery returned is a match. This version keeps just the latest order per customer:</p>
  <div class="fx" data-lang="sql">SELECT c.name, t.order_id, t.amount
FROM customers c
LEFT JOIN LATERAL (
  SELECT o.order_id, o.amount
  FROM orders o
  WHERE o.customer_id = c.customer_id
  ORDER BY o.ordered_at DESC
  LIMIT 1
) AS t ON true
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  | order_id | amount 
-------+----------+--------
 Asha  |      110 | 310.00
 Ben   |      106 | 180.00
 Chen  |      108 | 260.00
 Dia   |      105 | 310.00
 Esha  |      107 | 260.00
 Farah |      109 | 600.00
 Gita  |     NULL |   NULL
(7 rows)</div>
  <p>Now Gita appears with NULLs. "Top N per group" is a classic interview question, and LATERAL is one of its two standard answers. The other is <code>ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ordered_at DESC)</code> followed by a filter on the row number, from <a class="xref" data-note="sql_windows">Window Functions</a>. They differ in how they read the data. With an index on <code>(customer_id, ordered_at)</code>, LATERAL performs one tiny index lookup per customer, which wins when there are relatively few customers and many orders each. ROW_NUMBER reads and numbers every order in one pass, which wins when you need most of the rows anyway. SQL Server spells LATERAL as <code>CROSS APPLY</code> and <code>OUTER APPLY</code>.</p>

  <h2 id="sq-set"><span class="num">10</span>Set Operations</h2>
  <p>Every tool so far combines results side by side (a join adds columns) or filters rows. Sometimes two results need to go one <em>under</em> the other instead. Support has two lists of customer ids: A, the customers on delivered orders (one id per order: 1, 2, 3, 1, 2, 3, 6), and B, the customers on cancelled or pending orders (4, 5, 1). They want to know who appears in either list, who appears in both, and who appears only in B. These are <strong>set operations</strong>: they take two queries that return the same columns and combine their rows. Think of two class attendance sheets. Stapling one under the other is <code>UNION ALL</code>; stapling them and crossing out repeated names is <code>UNION</code>; listing names on both sheets is <code>INTERSECT</code>; listing names on the first sheet but not the second is <code>EXCEPT</code>.</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
UNION ALL
SELECT customer_id FROM orders WHERE status &lt;&gt; 'delivered'
ORDER BY 1;</div>
  <div class="fx" data-lang="text"> customer_id 
-------------
           1
           1
           1
           2
           2
           3
           3
           4
           5
           6
(10 rows)</div>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
UNION
SELECT customer_id FROM orders WHERE status &lt;&gt; 'delivered'
ORDER BY 1;</div>
  <div class="fx" data-lang="text"> customer_id 
-------------
           1
           2
           3
           4
           5
           6
(6 rows)</div>
  <p><code>UNION ALL</code> simply stacks the 7 rows of A and the 3 rows of B, so Asha (1) appears three times. <code>UNION</code> stacks and then removes duplicate rows, leaving six distinct ids. Removing duplicates means sorting or hashing the whole combined result, so UNION does extra work. A single <code>ORDER BY</code> at the very end sorts the combined result; <code>ORDER BY 1</code> means "by the first column".</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
INTERSECT
SELECT customer_id FROM orders WHERE status &lt;&gt; 'delivered';</div>
  <div class="fx" data-lang="text"> customer_id 
-------------
           1
(1 row)</div>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status &lt;&gt; 'delivered'
EXCEPT
SELECT customer_id FROM orders WHERE status = 'delivered'
ORDER BY 1;</div>
  <div class="fx" data-lang="text"> customer_id 
-------------
           4
           5
(2 rows)</div>
  <p>INTERSECT returns only Asha (1), the one customer who has both a delivered order and a non-delivered one (her pending 110). <code>B EXCEPT A</code> returns Dia (4) and Esha (5), who have only problem orders, which makes them good candidates for an apology coupon. Like UNION, INTERSECT and EXCEPT remove duplicates unless you write <code>INTERSECT ALL</code> or <code>EXCEPT ALL</code>. EXCEPT is also a NULL-safe way to write an anti join: <code>SELECT customer_id FROM customers EXCEPT SELECT customer_id FROM orders</code> returns 7 (Gita), and unlike NOT IN, set operations treat two NULLs as equal. (Oracle calls EXCEPT <code>MINUS</code>.)</p>
  <p>The two queries must line up: the same number of columns, with compatible types, matched by <em>position</em> rather than by name. When they don't, PostgreSQL stops with a clear error:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, name FROM customers
UNION
SELECT customer_id FROM orders;</div>
  <div class="fx" data-lang="text">ERROR:  each UNION query must have the same number of columns
LINE 3: SELECT customer_id FROM orders;
               ^</div>
  <div class="fx" data-lang="sql">SELECT name FROM customers
UNION
SELECT amount FROM orders;</div>
  <div class="fx" data-lang="text">ERROR:  UNION types text and numeric cannot be matched
LINE 3: SELECT amount FROM orders;
               ^</div>
  <p>The default should almost always be UNION ALL, and not only for speed. Plain UNION removes rows that are identical across <em>all</em> columns, even when they are genuinely different facts. Orders 107 and 108 are two different orders that both cost 260; stack their amounts with UNION and one of them disappears:</p>
  <div class="fx" data-lang="sql">SELECT amount FROM orders WHERE order_id = 107   -- 260
UNION
SELECT amount FROM orders WHERE order_id = 108;  -- also 260</div>
  <div class="fx" data-lang="text"> amount 
--------
 260.00
(1 row)</div>
  <p>A revenue total built on that would be 260 instead of 520. Use UNION only when you really want distinct rows, and UNION ALL whenever duplicates are real data.</p>

  <h2 id="sq-view"><span class="num">11</span>Views and Materialized Views</h2>
  <p>Over time, the same query block gets copied into many places. Biteful's "delivered orders with customer and restaurant names" join appears in the finance report, the operations dashboard and three analysts' notebooks. Each copy drifts slightly: one forgets the status filter, another joins on the wrong column. Separately, a heavy dashboard query re-runs from scratch every time someone opens the page. Both problems are solved by saving queries inside the database itself.</p>
  <p>A <strong>view</strong> is a saved query with a name. It stores no data. When you select from a view, PostgreSQL takes the saved query, pastes it into your query, and runs the combination on the current tables. Think of a saved search in a shopping app: tapping it runs the search again and shows today's stock.</p>
  <div class="fx" data-lang="sql">CREATE VIEW delivered_orders AS
SELECT o.order_id, c.name AS customer, r.name AS restaurant,
       o.ordered_at::date AS day, o.amount
FROM orders o
JOIN customers c   ON c.customer_id   = o.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
WHERE o.status = 'delivered';

SELECT restaurant, COUNT(*) AS orders, SUM(amount) AS revenue
FROM delivered_orders
GROUP BY restaurant
ORDER BY revenue DESC;</div>
  <div class="fx" data-lang="text">  restaurant  | orders | revenue 
--------------+--------+---------
 Biryani Bros |      3 | 1230.00
 Pizza Point  |      2 |  900.00
 Dosa Hut     |      2 |  500.00
(3 rows)</div>
  <p>After <code>CREATE VIEW</code>, <code>delivered_orders</code> can be used in FROM exactly like a table, with its own WHERE, GROUP BY and joins. The analyst's query is now three short lines, and the join logic lives in one place: fix it in the view and every report that uses the view is fixed. Views are also a security tool, because you can let a user read a view that leaves out sensitive columns without giving them the underlying table. What a view does <em>not</em> do is make anything faster. Since its query is pasted in and re-run each time, reading a view costs the same as running its query.</p>
  <p>When speed is the goal, you want a <strong>materialized view</strong>: a saved query <em>together with its stored result</em>. PostgreSQL runs the query once, writes the result rows to disk like a real table, and from then on reading it is just reading those stored rows, which you can even index. The price is freshness. The stored rows do not change when the underlying tables change; they are updated only when you run <code>REFRESH MATERIALIZED VIEW</code>. Think of a printed price list: instant to read, but it shows yesterday's prices until someone prints a new one.</p>
  <div class="fx" data-lang="sql">CREATE MATERIALIZED VIEW daily_revenue AS
SELECT ordered_at::date AS day, SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY 1;

SELECT * FROM daily_revenue ORDER BY day;</div>
  <div class="fx" data-lang="text">    day     | revenue 
------------+---------
 2026-03-02 | 1210.00
 2026-03-03 |  380.00
 2026-03-04 |  180.00
 2026-03-05 |  860.00
(4 rows)</div>
  <p>This materialized view holds daily delivered revenue; Mar 5's 860 is orders 108 (260) and 109 (600). Now watch it go stale. Gita places her first order, ₹350 from Momo Magic, delivered on Mar 5, and we compare the live table with the materialized view, then refresh:</p>
  <div class="fx" data-lang="sql">-- Gita's first order: 350 from Momo Magic, delivered on Mar 5
INSERT INTO orders VALUES
  (111, 7, 14, '2026-03-05 21:00+05:30', 'delivered', 350, 30);

SELECT 'live orders table' AS source, SUM(amount) AS mar5_revenue
FROM orders WHERE status = 'delivered' AND ordered_at::date = '2026-03-05'
UNION ALL
SELECT 'materialized view', revenue
FROM daily_revenue WHERE day = '2026-03-05';

REFRESH MATERIALIZED VIEW daily_revenue;

SELECT 'after REFRESH' AS source, revenue AS mar5_revenue
FROM daily_revenue WHERE day = '2026-03-05';</div>
  <div class="fx" data-lang="text">      source       | mar5_revenue 
-------------------+--------------
 live orders table |      1210.00
 materialized view |       860.00
(2 rows)

    source     | mar5_revenue 
---------------+--------------
 after REFRESH |      1210.00
(1 row)</div>
  <p>The live <code>orders</code> table already says Mar 5 earned 860 + 350 = 1210, but the materialized view still shows the stored 860. Nothing is broken; it was simply never told to update. After <code>REFRESH</code>, PostgreSQL re-runs the saved query and replaces the stored rows, and the view shows 1210. (This demo ran inside a transaction that was rolled back, so order 111 does not exist anywhere else on this page.)</p>
  <table class="tbl">
    <tr><th></th><th>View</th><th>Materialized view</th></tr>
    <tr><td>Stores data</td><td>No, only the query</td><td>Yes, the result rows (can be indexed)</td></tr>
    <tr><td>Freshness</td><td>Always current</td><td>As of the last REFRESH</td></tr>
    <tr><td>Read speed</td><td>Same as running the query</td><td>Fast: reads stored rows</td></tr>
    <tr><td>Good for</td><td>Sharing logic, hiding columns</td><td>Expensive dashboard numbers that may be minutes or hours old</td></tr>
  </table>
  <p>Two practical points come up in interviews. A plain REFRESH locks the materialized view so that readers wait while it rebuilds; <code>REFRESH MATERIALIZED VIEW CONCURRENTLY</code> lets reads continue, but it requires a unique index on the view. And PostgreSQL never refreshes a materialized view by itself, so a scheduler (cron, Airflow) must do it, and dashboards should show an "as of" time so nobody mistakes stored numbers for live ones.</p>

  <h2 id="sq-func"><span class="num">12</span>Functions and Stored Procedures</h2>
  <p>A view saves a set of rows. Two other needs are left. First, a rule such as "a customer's spend is the sum of their delivered orders" is wanted in many queries and by several applications, and it should be computed the same way everywhere, given a customer id. Second, a nightly job must change data, for example cancelling pending orders that are too old. Neither is a set of rows, so neither is a view. Databases let you store this kind of logic too.</p>
  <p>A <strong>function</strong> (often called a <strong>user-defined function</strong> or UDF) takes inputs and returns a value or a table, and can be used inside any query, just like the built-in <code>ROUND()</code> or <code>UPPER()</code>. A <strong>stored procedure</strong> is called on its own with <code>CALL</code> and is meant to do work, such as updating rows, rather than to produce a value for a query. Think of a calculator on a shop counter that anyone can use in the middle of their own task (a function), compared with the closing-time routine the manager runs at the end of the day (a procedure).</p>
  <div class="fx" data-lang="sql">CREATE FUNCTION customer_spend(cid int) RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM orders
  WHERE customer_id = cid
    AND status = 'delivered'
$$;

SELECT name, customer_spend(customer_id) AS spend
FROM customers
ORDER BY customer_id;</div>
  <div class="fx" data-lang="text"> name  | spend  
-------+--------
 Asha  | 620.00
 Ben   | 630.00
 Chen  | 780.00
 Dia   |      0
 Esha  |      0
 Farah | 600.00
 Gita  |      0
(7 rows)</div>
  <p>Line by line: <code>customer_spend(cid int)</code> takes one integer input; <code>RETURNS numeric</code> declares the output type; <code>LANGUAGE sql</code> means the body is plain SQL; <code>STABLE</code> promises the function only reads data and gives the same answer within one query, which lets the planner optimise calls. The body sits between the <code>$$</code> markers and uses <code>cid</code> wherever the input is needed. The SELECT then calls it once per customer. The numbers match the CTE in section 07 (620, 630, 780, 600), and Dia, Esha and Gita get 0 because <code>COALESCE</code> replaces the NULL that SUM returns when there are no rows. Notice that a function called in the SELECT list runs once per row, so it is really a correlated subquery in disguise, with the same cost on large tables; functions buy consistency, not speed.</p>
  <p>Now a procedure for the nightly clean-up, which cancels pending orders placed before a cutoff time (again run inside a rolled-back transaction, so order 110 stays pending for the rest of the page):</p>
  <div class="fx" data-lang="sql">CREATE PROCEDURE cancel_stale_pending(cutoff timestamptz)
LANGUAGE sql AS $$
  UPDATE orders
  SET status = 'cancelled'
  WHERE status = 'pending' AND ordered_at &lt; cutoff;
$$;

CALL cancel_stale_pending('2026-03-10 00:00+05:30');

SELECT order_id, to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at, status
FROM orders WHERE customer_id = 1 ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id |  ordered_at  |  status   
----------+--------------+-----------
      101 | Mar 02 12:10 | delivered
      104 | Mar 03 13:15 | delivered
      110 | Mar 08 20:50 | cancelled
(3 rows)</div>
  <p>Asha's order 110 was pending and placed on Mar 8 at 20:50, before the cutoff of Mar 10, so the procedure changed it to cancelled. The key difference from a function is transaction control: since PostgreSQL 11, a procedure may run <code>COMMIT</code> in the middle of its work, so a long batch job can save progress in chunks, while a function always runs inside the caller's transaction and cannot commit.</p>
  <p>Logic stored in the database has real advantages: it runs next to the data with no network round trips, and every application gets exactly the same rule. It also has costs. It is harder to version, test and review than application code, it is tied to one database product's dialect, and it is easy to forget it exists when debugging. Most teams keep business logic in application code and use database functions for small, stable rules and procedures for maintenance jobs.</p>

  <h2 id="sq-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>Most subquery mistakes do not produce errors; they produce believable wrong answers. The most damaging is NOT IN against a column that can contain NULL. One NULL in the subquery makes every comparison UNKNOWN, and the result is empty:</p>
  <div class="fx" data-lang="sql">-- wrong: referred_by contains NULLs, so this returns nothing
SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);

-- right: NOT EXISTS is NULL-safe
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
  <p>The first query returns nothing; the second returns the five correct customers. Make NOT EXISTS your default for every "has none" question.</p>
  <p>The second mistake is a correlated subquery without separate aliases. If the inner and outer tables are both just <code>orders</code>, an unqualified column name inside the brackets refers to the <em>inner</em> table, so the correlation silently compares the inner row with itself:</p>
  <div class="fx" data-lang="sql">SELECT order_id, restaurant_id, amount
FROM orders
WHERE amount &gt; (SELECT AVG(amount)
                FROM orders
                WHERE restaurant_id = restaurant_id)
ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id | restaurant_id | amount 
----------+---------------+--------
      102 |            11 | 450.00
      103 |            12 | 520.00
      104 |            12 | 380.00
      109 |            11 | 600.00
(4 rows)</div>
  <p>Inside the brackets, <code>restaurant_id = restaurant_id</code> is always true, so every order was compared with the company average of 351, not its restaurant's. The result includes order 104 and leaves out order 110, the opposite of the correct answer in section 04, and nothing warns you. Always alias both copies and qualify the columns: <code>x.restaurant_id = o.restaurant_id</code>.</p>
  <p>Several other mistakes have already appeared on this page. A scalar subquery that can return two rows crashes once the data grows (Asha's three orders), and one that returns no rows silently gives NULL (Gita); make it provably single-row with an aggregate or <code>LIMIT 1</code>. Averaging at the wrong level, such as <code>AVG(qty * unit_price)</code> over lines (234) when the question was about orders (351), is fixed by aggregating to the level you mean in a derived table or CTE first. Using a JOIN for a "has any" question repeats each row once per match (7 rows for 4 customers); use EXISTS or IN. <code>CROSS JOIN LATERAL</code> drops rows whose subquery returns nothing (Gita); use <code>LEFT JOIN LATERAL … ON true</code> when every row must appear. <code>UNION</code> quietly merges genuinely different rows that happen to look the same (two ₹260 orders became one); default to <code>UNION ALL</code>. A recursive CTE over data that contains a loop never stops; guard it with a depth limit or <code>CYCLE</code>. And a materialized view read as if it were live shows old numbers (860 instead of 1210); schedule refreshes and display the refresh time.</p>

  <h2 id="sq-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Biteful orders 101–110: amounts 240, 450, 520, 380, 310, 180, 260, 260, 600, 310 (total 3510, average 351). 105 and 107 cancelled, 110 pending. Restaurant averages: Dosa Hut 270, Biryani Bros 410, Pizza Point 386.67, Green Bowl 310; Momo Magic has no orders. Customers 1–7; Gita has no orders; Ben and Chen were referred by Asha, Farah by Ben; four <code>referred_by</code> values are NULL.</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Subquery</b>: a SELECT in brackets inside another statement; the inner query runs and its result is used by the outer query.</li>
    <li><b>Scalar subquery</b>: returns one row and one column; usable anywhere a value goes. Zero rows gives NULL; two or more rows is an error.</li>
    <li><b>List subquery</b>: one column, many rows; used with <code>IN</code>, <code>ANY</code>, <code>ALL</code>.</li>
    <li><b>Derived table</b>: a subquery in FROM, treated as a table; always give it an alias.</li>
    <li><b>Correlated subquery</b>: references a column of the outer query, so it is logically evaluated once per outer row.</li>
    <li><b>Semi join / anti join</b>: keep a row once if any match exists (EXISTS, IN) / only if no match exists (NOT EXISTS).</li>
    <li><b>CTE</b>: a named temporary result defined with <code>WITH</code>, lasting one statement. Inlined if used once (PG 12+), materialized if used more.</li>
    <li><b>Recursive CTE</b>: anchor UNION ALL step; the step reads the previous round's rows; stops when a round is empty.</li>
    <li><b>LATERAL</b>: lets a FROM-subquery reference earlier FROM items, so it runs once per row.</li>
    <li><b>View</b>: saved query, no data, always fresh. <b>Materialized view</b>: saved query plus stored result, fresh only after REFRESH.</li>
    <li><b>Function</b>: returns a value or table, usable in queries. <b>Procedure</b>: run with CALL, does work, may COMMIT.</li>
  </ul>
  <h3>Which tool for which question</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Tool</th><th>On Biteful</th></tr>
    <tr><td>Compare with one computed value</td><td>scalar subquery</td><td>above 351: 102, 103, 104, 109</td></tr>
    <tr><td>Is the value in that set?</td><td>IN (list)</td><td>4 customers with a delivered order</td></tr>
    <tr><td>Aggregate an aggregate</td><td>derived table / CTE</td><td>average order 351, not line 234</td></tr>
    <tr><td>A different comparison per row</td><td>correlated subquery, or join to a GROUP BY</td><td>above own restaurant: 102, 103, 109, 110</td></tr>
    <tr><td>Has any / has none?</td><td>EXISTS / NOT EXISTS</td><td>4 customers; 5 non-referrers (NOT IN gave 0)</td></tr>
    <tr><td>Several readable steps</td><td>CTE</td><td>average spend 657.5, only Chen above</td></tr>
    <tr><td>Unknown depth, or generated rows</td><td>recursive CTE</td><td>Farah → Ben → Asha; Mar 1–8 calendar</td></tr>
    <tr><td>Top N rows per group</td><td>LATERAL (or ROW_NUMBER)</td><td>latest 2 orders per customer</td></tr>
    <tr><td>Stack or compare two results</td><td>UNION ALL / UNION / INTERSECT / EXCEPT</td><td>10 / 6 / Asha / Dia, Esha</td></tr>
    <tr><td>Reuse a query; fast dashboard</td><td>view; materialized view</td><td>860 until REFRESH, then 1210</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="sql">-- scalar, list, derived table
WHERE amount &gt; (SELECT AVG(amount) FROM orders)
WHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'delivered')
FROM (SELECT order_id, SUM(qty * unit_price) AS total FROM order_items GROUP BY order_id) AS t

-- correlated, EXISTS, NOT EXISTS
WHERE o.amount &gt; (SELECT AVG(x.amount) FROM orders x WHERE x.restaurant_id = o.restaurant_id)
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)

-- CTE and recursive CTE
WITH a AS (...), b AS (SELECT ... FROM a) SELECT ... FROM b;
WITH RECURSIVE r AS (anchor UNION ALL SELECT ... FROM t JOIN r ON ...) SELECT * FROM r;

-- LATERAL, keeping rows with no match
FROM customers c LEFT JOIN LATERAL (SELECT ... WHERE o.customer_id = c.customer_id
                                    ORDER BY ordered_at DESC LIMIT 2) t ON true

-- saved objects
CREATE VIEW v AS SELECT ...;
CREATE MATERIALIZED VIEW mv AS SELECT ...;  REFRESH MATERIALIZED VIEW [CONCURRENTLY] mv;
CREATE FUNCTION f(x int) RETURNS numeric LANGUAGE sql STABLE AS $$ SELECT ... $$;
CREATE PROCEDURE p(t timestamptz) LANGUAGE sql AS $$ UPDATE ... $$;  CALL p(...);</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>WHERE amount &gt; AVG(amount)</code> is an error: WHERE works row by row, before aggregates exist.</li>
    <li>NOT IN with a NULL in the list returns zero rows; use NOT EXISTS.</li>
    <li>Scalar subquery: 2+ rows is an error, 0 rows is a silent NULL.</li>
    <li>Correlated subquery: alias both copies, or the correlation compares a row with itself.</li>
    <li>JOIN repeats rows per match; EXISTS/IN return each row once and share one plan.</li>
    <li>CROSS JOIN LATERAL drops rows with an empty subquery; use LEFT JOIN LATERAL … ON true.</li>
    <li>UNION removes real duplicates; default to UNION ALL. Columns match by position.</li>
    <li>Recursive CTEs need a guaranteed stop (depth limit or CYCLE).</li>
    <li>Views are not faster; materialized views are not live.</li>
  </ul>

  <h2 id="sq-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a subquery, and where can you use one?</summary><div class="qa-body">A subquery is a complete SELECT written in brackets inside another statement; the database evaluates it and uses its result in the outer query. A scalar subquery (one value) can go anywhere a value can, including WHERE and the SELECT list; a list subquery goes after IN, ANY or ALL; a table-shaped subquery goes in FROM as a derived table. Subqueries also appear inside INSERT, UPDATE and DELETE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>WHERE amount &gt; AVG(amount)</code> fail, and how do you fix it?</summary><div class="qa-body">WHERE is evaluated one row at a time, before any grouping, so an aggregate over all rows does not exist yet at that point, and SQL forbids aggregates in WHERE. Fix it with a scalar subquery, <code>WHERE amount &gt; (SELECT AVG(amount) FROM orders)</code>, or compute <code>AVG(amount) OVER ()</code> in a CTE and filter in the outer query. HAVING is not the fix here, because HAVING filters groups, not individual rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a correlated and a non-correlated subquery?</summary><div class="qa-body">A non-correlated subquery is self-contained: it can be run on its own and gives one answer for the whole outer query (the overall average, 351). A correlated subquery references a column of the outer query, such as <code>x.restaurant_id = o.restaurant_id</code>, so its answer depends on the current outer row and it is logically evaluated once per row. Correlated subqueries can be slow on large tables unless the optimizer rewrites them, so they are often replaced by a join to an aggregated derived table or by a window function.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if a scalar subquery returns no rows, or more than one?</summary><div class="qa-body">No rows: the subquery's value is NULL, silently. More than one row: the statement fails at runtime with "more than one row returned by a subquery used as an expression". Because data changes, a scalar subquery should be provably single-row, using an aggregate, a primary-key filter or <code>LIMIT 1</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EXISTS vs IN vs JOIN: what is the difference, and which is fastest?</summary><div class="qa-body">A JOIN returns one row per matching pair, so it can duplicate the outer rows, but it lets you select columns from both tables. EXISTS and IN only filter: each outer row is kept once if any match exists. In modern PostgreSQL, EXISTS and IN typically compile to the same semi-join plan, so performance is the same; choose by meaning. Use a JOIN when you need the other table's columns, EXISTS or IN to filter, and NOT EXISTS for negative filters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can NOT IN return zero rows? How do you avoid it?</summary><div class="qa-body"><code>x NOT IN (a, b, NULL)</code> means <code>x &lt;&gt; a AND x &lt;&gt; b AND x &lt;&gt; NULL</code>. A comparison with NULL is UNKNOWN, so the whole condition can never be TRUE, and WHERE keeps only TRUE rows. One NULL in the subquery therefore empties the result. Use NOT EXISTS, which tests whether a matching row exists and ignores NULLs, or filter <code>WHERE col IS NOT NULL</code> inside the subquery.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a semi join and an anti join?</summary><div class="qa-body">A semi join keeps each row of the left table at most once if at least one matching row exists on the right, without adding the right table's columns; EXISTS and IN produce it. An anti join keeps a left row only if no matching row exists; NOT EXISTS, LEFT JOIN … WHERE right.key IS NULL, and EXCEPT produce it. Both can stop searching at the first match, which makes them efficient.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a derived table, and why would you need one?</summary><div class="qa-body">A derived table is a subquery in the FROM clause whose result is used like a table; it needs an alias. Its main use is two-level aggregation, such as averaging per-order totals: first group order lines by order, then average the totals. Averaging the lines directly answers a different question (average line, 234, instead of average order, 351).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a CTE, and why use one instead of nested subqueries?</summary><div class="qa-body">A Common Table Expression is a named temporary result defined with <code>WITH name AS (…)</code> at the start of a statement and usable like a table for the rest of that statement. CTEs make multi-step queries readable from top to bottom, let you reference the same step several times without repeating it, and enable recursion. They are not stored anywhere after the statement ends.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are CTEs slower than subqueries?</summary><div class="qa-body">In PostgreSQL 12 and later, a CTE referenced once is inlined into the main query, so it performs the same as the equivalent subquery; a CTE referenced several times is materialized (computed once and reused). Before version 12, every CTE was materialized and acted as an optimization fence, which blocked index use from outer filters, hence the old advice. You can force either behaviour with <code>AS MATERIALIZED</code> or <code>AS NOT MATERIALIZED</code>, and other databases differ, so check the plan.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a recursive CTE work, and when does it stop?</summary><div class="qa-body">It has an anchor query that produces the starting rows and a recursive step, joined by UNION ALL, that references the CTE itself. The database runs the anchor, then repeatedly runs the step using only the rows produced in the previous round, and stops when a round produces no rows; the result is all rounds stacked. Typical uses are hierarchies (referral chains, org charts, category trees) and generating series such as calendars. Cycles in the data cause infinite recursion unless you add a depth limit or PostgreSQL's CYCLE clause.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A daily report skips days with no orders. How do you fix it?</summary><div class="qa-body">Generate a complete list of dates (a date spine) with a recursive CTE or <code>generate_series</code>, then LEFT JOIN the orders onto it and count with <code>COUNT(o.order_id)</code> rather than <code>COUNT(*)</code>, so days with no matching order show 0 instead of 1. On Biteful, March 1, 6 and 7 then appear with 0 orders.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is LATERAL, and when would you use it?</summary><div class="qa-body">LATERAL lets a subquery in FROM refer to columns of tables listed before it, so it is evaluated once per row of those tables, like a correlated subquery that can return many rows and columns. The classic use is top-N per group, such as each customer's latest two orders with <code>ORDER BY … LIMIT 2</code> inside. Use <code>LEFT JOIN LATERAL … ON true</code> to keep rows whose subquery returns nothing; SQL Server's equivalent is CROSS APPLY / OUTER APPLY.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>UNION vs UNION ALL: what is the difference, and which should you default to?</summary><div class="qa-body">UNION ALL appends the rows of the second query to the first and keeps everything. UNION also removes duplicate rows, which requires sorting or hashing the whole result, so it is slower, and it can silently drop genuinely different rows that happen to have identical values (two orders of 260). Default to UNION ALL and use UNION only when you specifically want distinct rows. Both require the same number of columns with compatible types, matched by position.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do INTERSECT and EXCEPT do?</summary><div class="qa-body">INTERSECT returns rows present in both query results; EXCEPT returns rows in the first result that are not in the second (Oracle calls it MINUS). Both remove duplicates unless written with ALL. EXCEPT is a convenient NULL-safe anti join, because set operations treat NULLs as equal to each other.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a view, and what is it good for? Does it improve performance?</summary><div class="qa-body">A view is a named, stored SELECT that stores no data; querying it runs the saved query on the current tables. It is good for reusing complex joins in one place, giving analysts a simpler interface, and security, since you can grant access to a view that hides sensitive columns. It does not improve performance, because the view's query is expanded into your query and executed each time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>View vs materialized view: when would you use each?</summary><div class="qa-body">A view is always current but costs as much as its query each time; use it to share logic. A materialized view stores the query's result, so reads are fast and it can be indexed, but it is stale until <code>REFRESH MATERIALIZED VIEW</code> runs; use it for expensive aggregates where some delay is acceptable, such as dashboard KPIs. Refresh it on a schedule, and use <code>REFRESH … CONCURRENTLY</code> (which needs a unique index) to avoid blocking readers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a function and a stored procedure?</summary><div class="qa-body">A function returns a value or a table and can be used inside a query, in SELECT, WHERE or FROM; it runs within the caller's transaction and cannot commit. A stored procedure is invoked with CALL, does not return a value for use in a query, and (in PostgreSQL 11+) can control transactions with COMMIT and ROLLBACK, which suits batch jobs and maintenance tasks. Both keep logic next to the data, at the cost of being harder to version and test than application code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you find each customer's most recent order, including customers with no orders?</summary><div class="qa-body">One way is <code>FROM customers c LEFT JOIN LATERAL (SELECT … FROM orders o WHERE o.customer_id = c.customer_id ORDER BY o.ordered_at DESC LIMIT 1) t ON true</code>. Another is to number each customer's orders with <code>ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ordered_at DESC)</code> in a CTE, keep row number 1, and LEFT JOIN that to customers so customers without orders still appear. LATERAL tends to win with an index and few customers; ROW_NUMBER when most rows are read anyway.</div></details>
</main>
`
});
