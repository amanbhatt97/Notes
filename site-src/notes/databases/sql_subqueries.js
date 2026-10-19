// notes/databases/sql_subqueries.js — Subqueries, CTEs & Views
Object.assign(TOPIC_CONTENT, {
  "sql_subqueries": `<main>
  <h1>Subqueries, CTEs &amp; Views</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Subqueries, CTEs &amp; Views</span></div>
  <p class="lead">Many questions need the answer to a smaller question first: "orders above the average order" needs the average; "each restaurant's best order" needs a per-restaurant step. A subquery is a query used inside another query. This note grows that one idea step by step: a single value, a list, a whole table, a value that depends on the current row, yes/no tests, named steps (CTEs), steps that repeat themselves (recursion), per-row subqueries (LATERAL), stacked results, and finally queries saved inside the database (views, materialized views, functions and procedures). One running example throughout: <strong>Biteful</strong>, the food-delivery company from <a class="xref" data-note="sql_joins">JOINs</a>, with 7 customers, 5 restaurants, 10 orders and 15 order lines. Every result was produced by running the query in <strong>PostgreSQL 16</strong> on those rows.</p>

  <h2 id="sq-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="sq-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="65" y="41" text-anchor="middle" font-size="12">Fundamentals</text><text x="65" y="58" text-anchor="middle" class="tm" font-size="10">one table</text>
<line x1="120" y1="45" x2="138" y2="45" stroke="currentColor" marker-end="url(#sq-a0)"/>
<rect x="140" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="195" y="41" text-anchor="middle" font-size="12">JOINs</text><text x="195" y="58" text-anchor="middle" class="tm" font-size="10">tables side by side</text>
<line x1="250" y1="45" x2="268" y2="45" stroke="currentColor" marker-end="url(#sq-a0)"/>
<rect x="270" y="20" width="130" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="335" y="41" text-anchor="middle" font-size="12" font-weight="700">Subqueries &amp; CTEs</text><text x="335" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="400" y1="45" x2="418" y2="45" stroke="currentColor" marker-end="url(#sq-a0)"/>
<rect x="420" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="475" y="41" text-anchor="middle" font-size="12">Windows</text><text x="475" y="58" text-anchor="middle" class="tm" font-size="10">detail + aggregate</text>
<line x1="530" y1="45" x2="548" y2="45" stroke="currentColor" marker-end="url(#sq-a0)"/>
<rect x="550" y="20" width="100" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="600" y="41" text-anchor="middle" font-size="12">Optimization</text><text x="600" y="58" text-anchor="middle" class="tm" font-size="10">plans, indexes</text>
<line x1="335" y1="70" x2="335" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sq-a0)"/>
<rect x="245" y="110" width="180" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="335" y="130" text-anchor="middle" font-size="12">Practice Q&amp;A</text><text x="335" y="147" text-anchor="middle" class="tm" font-size="10">most answers = CTE + join/window</text>
</svg><figcaption>The SQL group. JOINs combined stored tables; this note combines a table with the result of another query, and saves queries inside the database.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a> and <a class="xref" data-note="sql_joins">JOINs</a></b><span>You can filter, group and join stored tables. But <code>WHERE amount &gt; AVG(amount)</code> is an error, and "each restaurant's own average" is not a stored table. Some answers need another query's answer first.</span></li>
    <li><b>This note adds: queries inside queries, named and saved</b><span>Scalar, list and table subqueries; correlated subqueries (re-run per row); EXISTS vs IN vs JOIN and the NOT IN trap; CTEs that name each step; recursive CTEs for referral chains and calendars; LATERAL for per-row top-N; set operations; views, materialized views, functions and procedures.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sql_windows">Window Functions</a></b><span>Several patterns here (each order next to its restaurant's average, latest order per customer) are clumsy as subqueries. Window functions do them in one pass, and you will wrap them in the CTEs learned here. Then <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> explains when a correlated subquery or CTE is slow.</span></li>
  </ol>

  <h2 id="sq-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each tool answers the question above it, and its weakness raises the next question. All numbers are from Biteful's 10 orders (average 351).</p>
  <ol class="story">
    <li><b>Scalar subquery</b><span>Q: a query needs the result of another query ("orders above the average") → put <code>(SELECT AVG(amount) FROM orders)</code> where a value goes: 351, four orders above it. But it must return exactly one value; "Asha's order" (three of them) is an error…</span></li>
    <li><b>Lists and derived tables</b><span>Q: what if the inner answer is many values, or a whole table? → <code>IN (list)</code> for "customers with a delivered order"; a subquery in FROM for two-level aggregates: average order 351, not average line 234. But the inner query runs once for everyone; "above <em>its own restaurant's</em> average" needs a different number per row…</span></li>
    <li><b>Correlated subquery</b><span>Q: a different inner answer for each outer row → the inner query reads the outer row's restaurant: 10 runs traced, 4 orders above their restaurant's average. Often used just to test "is there any matching row?" Three tools do that…</span></li>
    <li><b>EXISTS vs IN vs JOIN</b><span>Q: "customers with a delivered order": which tool? → JOIN repeats Asha, Ben and Chen; EXISTS and IN return each customer once and get the same semi-join plan. They differ only when negated…</span></li>
    <li><b>The NOT IN + NULL trap</b><span>Q: "customers who referred nobody" → NOT IN returns 0 rows because the list holds NULLs; NOT EXISTS returns the right 5. Now our queries nest three deep and repeat steps…</span></li>
    <li><b>CTEs (WITH)</b><span>Q: how do I write a multi-step query readably, and reuse a step? → name each step at the top: order totals → customer spend → compare with the average spend 657.5 (Chen). But a CTE can't repeat a step an unknown number of times…</span></li>
    <li><b>Recursive CTE</b><span>Q: follow the referral chain to any depth, or generate a calendar → anchor + step until a round is empty: Farah → Ben → Asha, traced iteration by iteration. But a FROM-subquery still can't see the row next to it, so "each customer's latest 2 orders" fails…</span></li>
    <li><b>LATERAL</b><span>Q: a subquery that runs once per row of the table before it → LATERAL: latest 2 orders per customer, Gita kept with LEFT JOIN LATERAL. Every combination so far adds columns. What about stacking rows?</span></li>
    <li><b>Set operations</b><span>Q: stack, merge or compare two results → UNION ALL (10), UNION (6), INTERSECT (Asha), EXCEPT (Gita). Now the same "delivered orders with totals" logic is copy-pasted in five reports…</span></li>
    <li><b>Views &amp; materialized views</b><span>Q: save a query once, for everyone → a view (always fresh, no faster) or a materialized view (fast, stale until REFRESH: 860 stays 860 until refreshed to 1210). Views return rows; what about reusable calculations and jobs?</span></li>
    <li><b>Functions &amp; stored procedures</b><span>Q: put logic itself in the database → a function <code>customer_spend(id)</code> used inside SELECT; a procedure called with CALL that does work (cancel stale pending orders).</span></li>
  </ol>

  <h2 id="sq-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Subqueries, CTEs &amp; Views</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">By shape</div>
        <ul>
          <li><b>Scalar</b> — 1 row × 1 col, anywhere a value goes (avg 351)</li>
          <li><b>List</b> — 1 col, many rows, after <code>IN</code></li>
          <li><b>Derived table</b> — any table in FROM, give it an alias</li>
          <li>⚠ scalar with 2 rows → error; with 0 rows → NULL</li>
          <li>⚠ "average order" 351 ≠ average line 234</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Correlated</div>
        <ul>
          <li><b>Reads the outer row</b> — <code>WHERE x.restaurant_id = o.restaurant_id</code></li>
          <li><b>Logically re-run per row</b> — 10 orders, 10 runs</li>
          <li><b>Rewrite</b> — join to a GROUP BY CTE, or a window</li>
          <li>💡 each student vs <em>their</em> class average</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">EXISTS / IN / JOIN</div>
        <ul>
          <li><b>JOIN</b> — one row per match (duplicates), gives columns</li>
          <li><b>EXISTS, IN</b> — semi-join, once per row, same plan</li>
          <li>⚠ <b>NOT IN + NULL</b> → 0 rows; use <b>NOT EXISTS</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CTEs</div>
        <ul>
          <li><b>WITH a AS (…), b AS (… FROM a)</b> — named steps, top-down</li>
          <li><b>Reuse</b> — reference a step twice</li>
          <li><b>PG 12+</b> — single-use CTE inlined; force with MATERIALIZED</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursive</div>
        <ul>
          <li><b>anchor UNION ALL step</b> — step reads last round only</li>
          <li><b>Stops</b> — when a round returns 0 rows</li>
          <li><b>Uses</b> — referral trees, calendars</li>
          <li>⚠ cycles → depth limit or <code>CYCLE</code> clause</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LATERAL &amp; sets</div>
        <ul>
          <li><b>LATERAL</b> — FROM-subquery per outer row (top-N per group)</li>
          <li>⚠ CROSS JOIN LATERAL drops Gita → LEFT JOIN LATERAL … ON true</li>
          <li><b>UNION ALL</b> keeps all; <b>UNION</b> dedupes; INTERSECT; EXCEPT</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Saved in the DB</div>
        <ul>
          <li><b>View</b> — saved query, always fresh, not faster</li>
          <li><b>Materialized view</b> — saved result, fast, stale until REFRESH</li>
          <li><b>Function</b> — returns a value, used in SELECT</li>
          <li><b>Procedure</b> — CALL, does work, may COMMIT</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sq-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sq-scalar"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Scalar Subqueries</span><span class="rm-sub">One value, anywhere</span></div></div>
      <div class="rm-item rm-done" data-target="sq-derived"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Lists &amp; Derived Tables</span><span class="rm-sub">IN, and tables in FROM</span></div></div>
      <div class="rm-item rm-done" data-target="sq-corr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Correlated Subqueries</span><span class="rm-sub">Re-run per outer row</span></div></div>
      <div class="rm-item rm-done" data-target="sq-exists"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">EXISTS vs IN vs JOIN</span><span class="rm-sub">Duplicates and plans</span></div></div>
      <div class="rm-item rm-done" data-target="sq-notin"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The NOT IN Trap</span><span class="rm-sub">One NULL, zero rows</span></div></div>
      <div class="rm-item rm-done" data-target="sq-cte"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">CTEs (WITH)</span><span class="rm-sub">Name each step</span></div></div>
      <div class="rm-item rm-done" data-target="sq-rec"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Recursive CTEs</span><span class="rm-sub">Referral chains, calendars</span></div></div>
      <div class="rm-item rm-done" data-target="sq-lat"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">LATERAL</span><span class="rm-sub">Top-N per customer</span></div></div>
      <div class="rm-item rm-done" data-target="sq-set"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Set Operations</span><span class="rm-sub">UNION, INTERSECT, EXCEPT</span></div></div>
      <div class="rm-item rm-done" data-target="sq-view"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Views &amp; Materialized Views</span><span class="rm-sub">Saved queries vs saved results</span></div></div>
      <div class="rm-item rm-done" data-target="sq-func"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Functions &amp; Procedures</span><span class="rm-sub">Logic inside the DB</span></div></div>
      <div class="rm-item rm-done" data-target="sq-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One idea, growing</span></div></div>
      <div class="rm-item rm-done" data-target="sq-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Silent wrong answers</span></div></div>
      <div class="rm-item rm-done" data-target="sq-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sq-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sq-scalar"><span class="num">01</span>A Query Needs Another Query's Result: Scalar Subqueries</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's finance team asks: "which orders are bigger than our average order?" You know how to get the average, and you know how to filter. Doing both in one statement fails, because WHERE looks at one row at a time and an average needs all rows.</p>
  </div>
  <h3>The running example: Biteful's orders</h3>
  <p>The same tables as in <a class="xref" data-note="sql_joins">JOINs</a>. Most of this note uses <code>orders</code>, joined to <code>customers</code> and <code>restaurants</code> where names are needed:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, r.name AS restaurant,
       to_char(o.ordered_at, 'Mon DD HH24:MI') AS ordered_at, o.status, o.amount
FROM orders o
JOIN customers c   ON c.customer_id = o.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>orders with names (10 rows; times in Asia/Kolkata)</caption><tr><th>order_id</th><th>customer</th><th>restaurant</th><th>ordered_at</th><th>status</th><th>amount</th></tr><tr><td>101</td><td>Asha</td><td>Dosa Hut</td><td>Mar 02 12:10</td><td>delivered</td><td>240.00</td></tr><tr><td>102</td><td>Ben</td><td>Biryani Bros</td><td>Mar 02 13:05</td><td>delivered</td><td>450.00</td></tr><tr><td>103</td><td>Chen</td><td>Pizza Point</td><td>Mar 02 20:30</td><td>delivered</td><td>520.00</td></tr><tr><td>104</td><td>Asha</td><td>Pizza Point</td><td>Mar 03 13:15</td><td>delivered</td><td>380.00</td></tr><tr><td>105</td><td>Dia</td><td>Green Bowl</td><td>Mar 03 19:45</td><td>cancelled</td><td>310.00</td></tr><tr><td>106</td><td>Ben</td><td>Biryani Bros</td><td>Mar 04 12:40</td><td>delivered</td><td>180.00</td></tr><tr><td>107</td><td>Esha</td><td>Pizza Point</td><td>Mar 04 21:10</td><td>cancelled</td><td>260.00</td></tr><tr><td>108</td><td>Chen</td><td>Dosa Hut</td><td>Mar 05 18:20</td><td>delivered</td><td>260.00</td></tr><tr><td>109</td><td>Farah</td><td>Biryani Bros</td><td>Mar 05 20:05</td><td>delivered</td><td>600.00</td></tr><tr><td>110</td><td>Asha</td><td>Dosa Hut</td><td>Mar 08 20:50</td><td>pending</td><td>310.00</td></tr></table>
  <div class="fx" data-lang="sql">SELECT customer_id, name, city, referred_by FROM customers ORDER BY customer_id;</div>
  <table class="tbl out"><caption>customers (7 rows): Gita has no orders; referred_by points into the same table</caption><tr><th>customer_id</th><th>name</th><th>city</th><th>referred_by</th></tr><tr><td>1</td><td>Asha</td><td>Pune</td><td>NULL</td></tr><tr><td>2</td><td>Ben</td><td>Mumbai</td><td>1</td></tr><tr><td>3</td><td>Chen</td><td>Pune</td><td>1</td></tr><tr><td>4</td><td>Dia</td><td>Mumbai</td><td>NULL</td></tr><tr><td>5</td><td>Esha</td><td>NULL</td><td>NULL</td></tr><tr><td>6</td><td>Farah</td><td>Mumbai</td><td>2</td></tr><tr><td>7</td><td>Gita</td><td>Pune</td><td>NULL</td></tr></table>
  <p>Now the obvious attempt at "orders above average":</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount
FROM orders
WHERE amount &gt; AVG(amount);</div>
  <div class="fx" data-lang="text">ERROR:  aggregate functions are not allowed in WHERE
LINE 3: WHERE amount &gt; AVG(amount);
                       ^</div>
  <p>The fix is to ask the smaller question first and use its answer. A <strong>subquery</strong> is a complete SELECT written inside brackets inside another statement. The database runs the inner one, then uses its result in the outer one.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A manager mid-task asks an assistant "what is our average order?" and gets back one number, which she writes into her own sentence: "show me orders above <em>that</em>". The assistant's answer is the subquery; her sentence is the outer query.</p>
  </div>
  <p>Step 1, the inner query alone: (240 + 450 + 520 + 380 + 310 + 180 + 260 + 260 + 600 + 310) / 10 = 3510 / 10 =</p>
  <div class="fx" data-lang="sql">SELECT ROUND(AVG(amount), 2) AS avg_amount FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>avg_amount</th></tr><tr><td>351.00</td></tr></table>
  <p>Step 2, the outer query uses that number as if you had typed 351:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount
FROM orders
WHERE amount &gt; (SELECT AVG(amount) FROM orders)
ORDER BY amount DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th></tr><tr><td>109</td><td>600.00</td></tr><tr><td>103</td><td>520.00</td></tr><tr><td>102</td><td>450.00</td></tr><tr><td>104</td><td>380.00</td></tr></table>
  <p>600, 520, 450 and 380 pass; the six orders at 310 or below fail. Because the inner query returns exactly one row and one column, it is called a <strong>scalar subquery</strong>: it can go anywhere a single value can go, including the SELECT list:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount,
       (SELECT AVG(amount) FROM orders)::numeric(6,2)          AS avg_amount,
       (amount - (SELECT AVG(amount) FROM orders))::numeric(6,2) AS diff
FROM orders
ORDER BY order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th><th>avg_amount</th><th>diff</th></tr><tr><td>101</td><td>240.00</td><td>351.00</td><td>-111.00</td></tr><tr><td>102</td><td>450.00</td><td>351.00</td><td>99.00</td></tr><tr><td>103</td><td>520.00</td><td>351.00</td><td>169.00</td></tr><tr><td>104</td><td>380.00</td><td>351.00</td><td>29.00</td></tr><tr><td>105</td><td>310.00</td><td>351.00</td><td>-41.00</td></tr><tr><td>106</td><td>180.00</td><td>351.00</td><td>-171.00</td></tr><tr><td>107</td><td>260.00</td><td>351.00</td><td>-91.00</td></tr><tr><td>108</td><td>260.00</td><td>351.00</td><td>-91.00</td></tr><tr><td>109</td><td>600.00</td><td>351.00</td><td>249.00</td></tr><tr><td>110</td><td>310.00</td><td>351.00</td><td>-41.00</td></tr></table>
  <p>The inner query has nothing to do with the current row, so its answer, 351, is the same on every line. The <code>diff</code> column subtracts it per row.</p>
  <h3>When "one value" is not one value</h3>
  <p>A scalar subquery must return at most one row. If it returns two, the query stops with an error. If it returns zero, you get NULL, with no warning. Here the inner query looks up "the" order of each customer:</p>
  <div class="fx" data-lang="sql">SELECT name,
       (SELECT order_id FROM orders o WHERE o.customer_id = c.customer_id) AS order_id
FROM customers c;</div>
  <div class="fx" data-lang="text">ERROR:  more than one row returned by a subquery used as an expression</div>
  <p>Asha has three orders, so "the" order is ambiguous. For Farah (one order) and Gita (none) alone it runs, and Gita quietly gets NULL:</p>
  <div class="fx" data-lang="sql">SELECT name,
       (SELECT order_id FROM orders o WHERE o.customer_id = c.customer_id) AS order_id
FROM customers c
WHERE name IN ('Farah', 'Gita')
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th></tr><tr><td>Farah</td><td>109</td></tr><tr><td>Gita</td><td>NULL</td></tr></table>
  <p>(That inner query mentions <code>c.customer_id</code> from the outer query, so it gives a different answer per customer. It is a <em>correlated</em> subquery, section 03. The scalar rule applies to both kinds.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Subquery</strong> (inner query, nested query): a SELECT inside another statement, in brackets. <strong>Scalar subquery</strong>: returns one row and one column; usable anywhere a single value is. Zero rows → NULL; two or more rows → runtime error.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A scalar subquery that returns one row today (every customer has one order) can return two tomorrow and break a production report. Make it provably single-row: an aggregate (<code>MAX(order_id)</code>), a primary-key filter, or <code>ORDER BY … LIMIT 1</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: lists and derived tables.</b> A scalar subquery must be exactly one value. "Customers who have a delivered order" needs a <em>list</em> of ids, and "average order value from the order lines" needs a whole intermediate <em>table</em>.</div>

  <h2 id="sq-derived"><span class="num">02</span>Lists &amp; Derived Tables</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two new questions. "Which customers have at least one delivered order?" needs the inner query to return many ids. "What is the average order value, computed from the order lines?" needs two levels of aggregation: first total each order, then average the totals. One GROUP BY cannot do both.</p>
  </div>
  <h3>A list in WHERE … IN</h3>
  <p>The inner query returns one column with many rows:</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered' ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Inner query: a list of 7 ids</caption><tr><th>customer_id</th></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>2</td></tr><tr><td>2</td></tr><tr><td>3</td></tr><tr><td>3</td></tr><tr><td>6</td></tr></table>
  <div class="fx" data-lang="sql">SELECT name
FROM customers
WHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'delivered')
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Ben</td></tr><tr><td>Chen</td></tr><tr><td>Farah</td></tr></table>
  <p><code>IN</code> checks "is this customer_id anywhere in the list (1, 1, 2, 2, 3, 3, 6)?" Duplicates in the list do not matter, so Asha is listed once. Dia and Esha (cancelled only) and Gita (no orders) are not in it.</p>
  <h3>A whole table in FROM: the derived table</h3>
  <p>Step 1: total each order from its lines (one row per order):</p>
  <div class="fx" data-lang="sql">SELECT order_id, SUM(qty * unit_price) AS order_total
FROM order_items
GROUP BY order_id
ORDER BY order_id;</div>
  <table class="tbl out"><caption>Inner query: one row per order</caption><tr><th>order_id</th><th>order_total</th></tr><tr><td>101</td><td>240.00</td></tr><tr><td>102</td><td>450.00</td></tr><tr><td>103</td><td>520.00</td></tr><tr><td>104</td><td>380.00</td></tr><tr><td>105</td><td>310.00</td></tr><tr><td>106</td><td>180.00</td></tr><tr><td>107</td><td>260.00</td></tr><tr><td>108</td><td>260.00</td></tr><tr><td>109</td><td>600.00</td></tr><tr><td>110</td><td>310.00</td></tr></table>
  <p>Step 2: put that whole query in FROM, give it a name, and average its <code>order_total</code> column:</p>
  <div class="fx" data-lang="sql">SELECT ROUND(AVG(order_total), 2) AS avg_order_value, COUNT(*) AS orders
FROM (SELECT order_id, SUM(qty * unit_price) AS order_total
      FROM order_items
      GROUP BY order_id) AS t;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>avg_order_value</th><th>orders</th></tr><tr><td>351.00</td><td>10</td></tr></table>
  <p>The outer query sees the inner result as a table named <code>t</code> with 10 rows: 3510 / 10 = 351, the same as <code>AVG(orders.amount)</code>, because each order's amount equals the sum of its lines. Compare the wrong one-level version:</p>
  <div class="fx" data-lang="sql">SELECT ROUND(AVG(qty * unit_price), 2) AS avg_line_value, COUNT(*) AS lines
FROM order_items;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>avg_line_value</th><th>lines</th></tr><tr><td>234.00</td><td>15</td></tr></table>
  <p>234 = 3510 / 15 is the average order <em>line</em>. Orders with two lines were counted twice with smaller pieces. It is the grain lesson from <a class="xref" data-note="sql_joins">JOINs</a> again: aggregate to the level you mean first.</p>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <g font-size="11">
    <rect x="10" y="10" width="580" height="34" rx="6" class="fs"/>
    <text x="22" y="32">SELECT name, <tspan class="tb">(scalar)</tspan>  FROM <tspan class="tg">(derived table) t</tspan>  WHERE id IN <tspan class="tr">(list)</tspan></text>
    <text x="100" y="72" text-anchor="middle" font-weight="bold" class="tb">in SELECT / WHERE</text>
    <rect x="87" y="84" width="24" height="16" rx="2" class="fb sb"/>
    <text x="100" y="150" text-anchor="middle" font-size="10" class="tm">1 row × 1 col: 351</text>
    <text x="300" y="72" text-anchor="middle" font-weight="bold" class="tg">in FROM</text>
    <rect x="248" y="84" width="24" height="16" rx="2" class="fg"/><rect x="274" y="84" width="24" height="16" rx="2" class="fg"/><rect x="300" y="84" width="24" height="16" rx="2" class="fg"/><rect x="326" y="84" width="24" height="16" rx="2" class="fg"/><rect x="248" y="102" width="24" height="16" rx="2" class="fg"/><rect x="274" y="102" width="24" height="16" rx="2" class="fg"/><rect x="300" y="102" width="24" height="16" rx="2" class="fg"/><rect x="326" y="102" width="24" height="16" rx="2" class="fg"/><rect x="248" y="120" width="24" height="16" rx="2" class="fg"/><rect x="274" y="120" width="24" height="16" rx="2" class="fg"/><rect x="300" y="120" width="24" height="16" rx="2" class="fg"/><rect x="326" y="120" width="24" height="16" rx="2" class="fg"/>
    <text x="300" y="150" text-anchor="middle" font-size="10" class="tm">any table, alias it: 10 order totals</text>
    <text x="500" y="72" text-anchor="middle" font-weight="bold" class="tr">in WHERE … IN</text>
    <rect x="487" y="84" width="24" height="16" rx="2" class="fr"/><rect x="487" y="102" width="24" height="16" rx="2" class="fr"/><rect x="487" y="120" width="24" height="16" rx="2" class="fr"/>
    <text x="500" y="150" text-anchor="middle" font-size="10" class="tm">1 column, many rows: ids</text>
    </g>
  </svg><figcaption>The slot decides the shape a subquery must return.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The assistant can hand back one number (scalar), a list of names on a slip (IN), or a whole summary sheet (derived table) that the manager then works from as if it were an original ledger.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>List subquery</strong>: one column, any number of rows, used with <code>IN</code>, <code>ANY</code>, <code>ALL</code>. <strong>Derived table</strong>: a subquery in FROM, used like a table; give it an alias (<code>AS t</code>). PostgreSQL 16 accepts a missing alias, but older versions and MySQL reject it, so always write one.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Average X per Y" almost always means aggregate to Y first, then average. Interviewers ask "average order value" exactly to see whether you average lines (234) or orders (351).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: correlated subqueries.</b> Every inner query so far runs once and gives the same answer for every outer row. "Orders above <em>their own restaurant's</em> average" needs a different comparison number for each row: Dosa Hut's average for Dosa Hut orders, Biryani Bros' for theirs.</div>

  <h2 id="sq-corr"><span class="num">03</span>Correlated Subqueries</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A ₹310 order is above average at Dosa Hut (whose orders are small) but below average at Biryani Bros. The company-wide 351 is the wrong yardstick. Each row needs its own restaurant's average.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT restaurant_id, COUNT(*) AS orders, ROUND(AVG(amount), 2) AS avg_amount
FROM orders
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>The four averages we need (Momo Magic, 14, has no orders)</caption><tr><th>restaurant_id</th><th>orders</th><th>avg_amount</th></tr><tr><td>10</td><td>3</td><td>270.00</td></tr><tr><td>11</td><td>3</td><td>410.00</td></tr><tr><td>12</td><td>3</td><td>386.67</td></tr><tr><td>13</td><td>1</td><td>310.00</td></tr></table>
  <p>A <strong>correlated subquery</strong> is a subquery that uses a column from the outer query. Because that column changes from row to row, the inner query (logically) runs again for every outer row, with that row's value plugged in.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher marks each student against <em>that student's</em> class average: for Priya in 9A she looks up the 9A average, for Rahul in 9B the 9B average. One lookup per student. A non-correlated subquery is one school-wide average, worked out once.</p>
  </div>
  <table class="tbl"><caption>Trace: the inner query, once per outer order</caption>
    <tr><th>outer row o</th><th>o.restaurant_id plugged in</th><th>inner AVG</th><th>o.amount &gt; AVG?</th></tr>
    <tr><td>101 · 240</td><td>10</td><td>270</td><td>no</td></tr>
    <tr><td>102 · 450</td><td>11</td><td>410</td><td><strong>yes → keep</strong></td></tr>
    <tr><td>103 · 520</td><td>12</td><td>386.67</td><td><strong>yes → keep</strong></td></tr>
    <tr><td>104 · 380</td><td>12</td><td>386.67</td><td>no (just below)</td></tr>
    <tr><td>105 · 310</td><td>13</td><td>310</td><td>no (equal is not greater)</td></tr>
    <tr><td>106 · 180</td><td>11</td><td>410</td><td>no</td></tr>
    <tr><td>107 · 260</td><td>12</td><td>386.67</td><td>no</td></tr>
    <tr><td>108 · 260</td><td>10</td><td>270</td><td>no</td></tr>
    <tr><td>109 · 600</td><td>11</td><td>410</td><td><strong>yes → keep</strong></td></tr>
    <tr><td>110 · 310</td><td>10</td><td>270</td><td><strong>yes → keep</strong></td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.restaurant_id, o.amount
FROM orders o
WHERE o.amount &gt; (SELECT AVG(x.amount)
                  FROM orders x
                  WHERE x.restaurant_id = o.restaurant_id)
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>restaurant_id</th><th>amount</th></tr><tr><td>102</td><td>11</td><td>450.00</td></tr><tr><td>103</td><td>12</td><td>520.00</td></tr><tr><td>109</td><td>11</td><td>600.00</td></tr><tr><td>110</td><td>10</td><td>310.00</td></tr></table>
  <p>Two aliases make it work. <code>o</code> is the outer copy of orders, <code>x</code> the inner copy. The line <code>WHERE x.restaurant_id = o.restaurant_id</code> is the <em>correlation</em>: inside the brackets it reaches out and reads <code>o.restaurant_id</code> from the current outer row. Order 110 (310) passes at Dosa Hut, while order 104 (380) fails at Pizza Point: the company-wide filter of section 01 said the opposite for 104.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <g font-size="10">
    <text x="85" y="14" text-anchor="middle" font-weight="bold">outer row o</text>
    <text x="395" y="14" text-anchor="middle" font-weight="bold">inner query, per row</text>
    <rect x="10" y="22" width="150" height="22" rx="4" class="fb"/><text x="18" y="37">101 · Dosa Hut · 240</text><line x1="160" y1="33" x2="318" y2="45" stroke="currentColor" opacity="0.6"/><text x="530" y="37" class="tr">✗</text>
    <rect x="10" y="48" width="150" height="22" rx="4" class="fb"/><text x="18" y="63">108 · Dosa Hut · 260</text><line x1="160" y1="59" x2="318" y2="45" stroke="currentColor" opacity="0.6"/><text x="530" y="63" class="tr">✗</text>
    <rect x="10" y="74" width="150" height="22" rx="4" class="fb"/><text x="18" y="89">110 · Dosa Hut · 310</text><line x1="160" y1="85" x2="318" y2="45" stroke="currentColor" opacity="0.6"/><text x="530" y="89" class="tg">✓ kept</text>
    <rect x="10" y="110" width="150" height="22" rx="4" class="fv"/><text x="18" y="125">102 · Biryani · 450</text><line x1="160" y1="121" x2="318" y2="150" stroke="currentColor" opacity="0.6"/><text x="530" y="125" class="tg">✓ kept</text>
    <rect x="10" y="136" width="150" height="22" rx="4" class="fv"/><text x="18" y="151">106 · Biryani · 180</text><line x1="160" y1="147" x2="318" y2="150" stroke="currentColor" opacity="0.6"/><text x="530" y="151" class="tr">✗</text>
    <rect x="10" y="162" width="150" height="22" rx="4" class="fv"/><text x="18" y="177">109 · Biryani · 600</text><line x1="160" y1="173" x2="318" y2="150" stroke="currentColor" opacity="0.6"/><text x="530" y="177" class="tg">✓ kept</text>
    <rect x="320" y="25" width="190" height="40" rx="6" class="fb sb"/><text x="415" y="42" text-anchor="middle">AVG where restaurant = 10</text><text x="415" y="57" text-anchor="middle" font-weight="bold">270</text>
    <rect x="320" y="130" width="190" height="40" rx="6" class="fv"/><text x="415" y="147" text-anchor="middle">AVG where restaurant = 11</text><text x="415" y="162" text-anchor="middle" font-weight="bold">410</text>
    </g>
  </svg><figcaption>Each outer row plugs its own <code>o.restaurant_id</code> into the inner query and is compared with that result (two of the four restaurants shown).</figcaption></figure>
  <p>Correlated subqueries also work in SELECT, to attach a per-row number such as each customer's order count:</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id) AS n_orders
FROM customers c
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>n_orders</th></tr><tr><td>Asha</td><td>3</td></tr><tr><td>Ben</td><td>2</td></tr><tr><td>Chen</td><td>2</td></tr><tr><td>Dia</td><td>1</td></tr><tr><td>Esha</td><td>1</td></tr><tr><td>Farah</td><td>1</td></tr><tr><td>Gita</td><td>0</td></tr></table>
  <p>Gita gets 0, not NULL, because COUNT of no rows is 0. Compare the scalar lookup in section 01, which returned NULL for her.</p>
  <h3>The faster rewrite</h3>
  <p>"Re-run per row" is fine for 10 orders and slow for 10 million. The same answer comes from computing each restaurant's average once, then joining:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.restaurant_id, o.amount, ROUND(r.avg_amount, 2) AS rest_avg
FROM orders o
JOIN (SELECT restaurant_id, AVG(amount) AS avg_amount
      FROM orders GROUP BY restaurant_id) AS r
  ON r.restaurant_id = o.restaurant_id
WHERE o.amount &gt; r.avg_amount
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>restaurant_id</th><th>amount</th><th>rest_avg</th></tr><tr><td>102</td><td>11</td><td>450.00</td><td>410.00</td></tr><tr><td>103</td><td>12</td><td>520.00</td><td>386.67</td></tr><tr><td>109</td><td>11</td><td>600.00</td><td>410.00</td></tr><tr><td>110</td><td>10</td><td>310.00</td><td>270.00</td></tr></table>
  <p>The derived table has 4 rows. Each order joins to exactly one of them, and the WHERE compares. Same 4 orders, but the averages are computed once. A window function (<code>AVG(amount) OVER (PARTITION BY restaurant_id)</code>, see <a class="xref" data-note="sql_windows">Window Functions</a>) is a third way.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Correlated subquery</strong>: an inner query that references a column of the outer query, so its result depends on the current outer row. <strong>Non-correlated</strong>: self-contained, can run once on its own.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Without distinct aliases, <code>WHERE restaurant_id = restaurant_id</code> inside the brackets compares the inner row with itself and is always true: every order would be compared with the company average. Also: PostgreSQL rewrites correlated <code>EXISTS</code> / <code>IN</code> into joins, but a correlated <em>scalar</em> subquery usually does run once per outer row; check <code>EXPLAIN</code> on big tables.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: EXISTS vs IN vs JOIN.</b> The most common correlated subquery is not a number at all but a yes/no test: "is there <em>any</em> delivered order for this customer?" Three tools answer it, and they are not interchangeable.</div>

  <h2 id="sq-exists"><span class="num">04</span>EXISTS vs IN vs JOIN</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Which customers have a delivered order?" can be written with a JOIN, with IN (section 02) or with EXISTS. They look interchangeable. Do they return the same rows, and is one faster?</p>
  </div>
  <p>Way 1, a JOIN:</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'delivered'
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Asha</td></tr><tr><td>Ben</td></tr><tr><td>Ben</td></tr><tr><td>Chen</td></tr><tr><td>Chen</td></tr><tr><td>Farah</td></tr></table>
  <p>Asha, Ben and Chen appear twice each. A JOIN returns one row per <em>matching pair</em>. If the next step counts customers, it says 7 instead of 4.</p>
  <p>Way 2, EXISTS. For each customer, the inner query asks "is there at least one delivered order for this customer?" It only answers yes or no.</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.customer_id
                AND o.status = 'delivered')
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Ben</td></tr><tr><td>Chen</td></tr><tr><td>Farah</td></tr></table>
  <p>Way 3, IN, gave the same four names in section 02.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A building watchman asked "did flat 302 get any parcel today?" says yes after the first parcel he finds. He does not hand you one note per parcel. EXISTS and IN are the watchman; a JOIN hands you one note per parcel.</p>
  </div>
  <p>Is EXISTS slower because it "runs per row"? Look at what PostgreSQL actually does:</p>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.customer_id
                AND o.status = 'delivered');</div>
  <div class="fx" data-lang="text">Hash Semi Join
  Hash Cond: (c.customer_id = o.customer_id)
  -&gt;  Seq Scan on customers c
  -&gt;  Hash
        -&gt;  Seq Scan on orders o
              Filter: (status = 'delivered'::text)</div>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
SELECT c.name
FROM customers c
WHERE c.customer_id IN (SELECT o.customer_id FROM orders o
                        WHERE o.status = 'delivered');</div>
  <div class="fx" data-lang="text">Hash Semi Join
  Hash Cond: (c.customer_id = o.customer_id)
  -&gt;  Seq Scan on customers c
  -&gt;  Hash
        -&gt;  Seq Scan on orders o
              Filter: (status = 'delivered'::text)</div>
  <p>Both plans contain a <code>Semi Join</code>: the optimizer turned the correlated EXISTS and the IN list into the same join that stops at the first match per customer. So choose by meaning, not by folklore about speed.</p>
  <table class="tbl">
    <tr><th></th><th>JOIN</th><th>IN (subquery)</th><th>EXISTS</th></tr>
    <tr><td>Duplicates</td><td>Yes, one per match (7 rows)</td><td>No (4)</td><td>No (4)</td></tr>
    <tr><td>Can return inner columns</td><td>Yes</td><td>No</td><td>No</td></tr>
    <tr><td>Negated, with NULLs in inner</td><td>LEFT JOIN … IS NULL: safe</td><td><code>NOT IN</code>: <strong>broken</strong></td><td><code>NOT EXISTS</code>: safe</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Semi join</strong>: keep a left row once if any right row matches (IN, EXISTS). <strong>Anti join</strong>: keep a left row only if no right row matches (NOT EXISTS). Both stop scanning at the first match.</p>
  </div>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Need columns from the other table: <strong>JOIN</strong>. Just filtering: <strong>EXISTS</strong> or <strong>IN</strong>. Anti-filter: always <strong>NOT EXISTS</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>JOIN + DISTINCT "fixes" the duplicates for a name list but breaks as soon as you SELECT an order column or COUNT without DISTINCT. EXISTS states the real question.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the NOT IN trap.</b> IN and EXISTS agree. Their negations do not: when the list contains a NULL, NOT IN silently returns nothing.</div>

  <h2 id="sq-notin"><span class="num">05</span>The NOT IN + NULL Trap</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Growth asks: "which customers have not referred anyone?" The English sentence maps straight onto <code>customer_id NOT IN (list of referrers)</code>. Is the literal translation safe?</p>
  </div>
  <div class="fx" data-lang="sql">SELECT referred_by FROM customers ORDER BY customer_id;</div>
  <table class="tbl out"><caption>The list: one value per customer, four of them NULL</caption><tr><th>referred_by</th></tr><tr><td>NULL</td></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>NULL</td></tr><tr><td>NULL</td></tr><tr><td>2</td></tr><tr><td>NULL</td></tr></table>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);</div>
  <table class="tbl out"><caption>Result: 0 rows</caption><tr><th>name</th></tr></table>
  <p>Zero rows, no error. For Chen: <code>3 NOT IN (NULL, 1, 1, NULL, NULL, 2, NULL)</code> expands to <code>3 &lt;&gt; NULL AND 3 &lt;&gt; 1 AND …</code>. Any comparison with NULL is UNKNOWN (SQL's "can't tell"), so the whole AND is at best UNKNOWN, and WHERE keeps only TRUE. Every customer is dropped.</p>
  <table class="tbl"><caption>Trace: three-valued logic for Chen (3) and Asha (1)</caption>
    <tr><th>customer</th><th>vs 1</th><th>vs 2</th><th>vs NULL</th><th>AND of all</th><th>WHERE keeps?</th></tr>
    <tr><td>Chen 3</td><td>3 &lt;&gt; 1 TRUE</td><td>TRUE</td><td>UNKNOWN</td><td>UNKNOWN</td><td>no</td></tr>
    <tr><td>Asha 1</td><td>1 &lt;&gt; 1 FALSE</td><td>TRUE</td><td>UNKNOWN</td><td>FALSE</td><td>no (correctly)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A guard is told "let in anyone who is not on this list". One line of the list is smudged and unreadable. For every visitor, the honest guard says "you might be the smudged name, I can't tell", and lets nobody in.</p>
  </div>
  <p>NOT EXISTS has no such problem, because it only asks whether a matching row exists (a NULL <code>referred_by</code> simply never matches):</p>
  <div class="fx" data-lang="sql">SELECT c.name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM customers x WHERE x.referred_by = c.customer_id)
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Chen</td></tr><tr><td>Dia</td></tr><tr><td>Esha</td></tr><tr><td>Farah</td></tr><tr><td>Gita</td></tr></table>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers
                          WHERE referred_by IS NOT NULL)
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Also correct: remove NULLs inside</caption><tr><th>name</th></tr><tr><td>Chen</td></tr><tr><td>Dia</td></tr><tr><td>Esha</td></tr><tr><td>Farah</td></tr><tr><td>Gita</td></tr></table>
  <p>This is standard SQL logic, not a PostgreSQL quirk. The same query in SQLite:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);</div>
  <table class="tbl out"><caption>Result in SQLite 3.45: 0 rows</caption><tr><th>name</th></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>x NOT IN (a, b, …)</code> means <code>x &lt;&gt; a AND x &lt;&gt; b AND …</code>. If any element is NULL, the result is never TRUE (it is FALSE if x matches, UNKNOWN otherwise). <code>NOT EXISTS</code> tests row existence and is NULL-safe.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The query runs, returns a plausible empty result, and may have worked for months until the first NULL arrived. Default to <code>NOT EXISTS</code>. <code>IN</code> (positive) is safe.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: CTEs.</b> We can now nest any kind of subquery correctly. But real questions stack three or four steps, and nested brackets read inside-out and force you to repeat a step you need twice.</div>

  <h2 id="sq-cte"><span class="num">06</span>CTEs (WITH)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Which customers spend more than the average customer?" (delivered orders only). It needs three steps: keep delivered orders, total each customer, compare with the average of those totals. The middle step is needed twice: once for the list, once for the average.</p>
  </div>
  <p>Written with nested subqueries it works, and is hard to read:</p>
  <div class="fx" data-lang="sql">SELECT c.name, cs.spend
FROM (SELECT customer_id, SUM(amount) AS spend
      FROM (SELECT * FROM orders WHERE status = 'delivered') d
      GROUP BY customer_id) cs
JOIN customers c USING (customer_id)
WHERE cs.spend &gt; (SELECT AVG(spend)
                  FROM (SELECT customer_id, SUM(amount) AS spend
                        FROM (SELECT * FROM orders WHERE status = 'delivered') d2
                        GROUP BY customer_id) cs2);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th></tr><tr><td>Chen</td><td>780.00</td></tr></table>
  <p>It reads inside-out, and the customer-spend step is written twice. Any change must be made in two places. A <strong>CTE</strong> (Common Table Expression) gives each step a name, at the top, with <code>WITH name AS (…)</code>. Later steps and the final SELECT use the names like tables.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe card for pav bhaji. "1. Boil the vegetables. 2. Make the masala. 3. Mash step 1 into step 2." Each step has a name and is used later. Nested subqueries are the same recipe written as one sentence full of brackets.</p>
  </div>
  <p>Step 1, <code>delivered</code>, keeps 7 of the 10 orders. Step 2, <code>customer_spend</code>, adds them up per customer:</p>
  <div class="fx" data-lang="sql">WITH delivered AS (SELECT * FROM orders WHERE status = 'delivered')
SELECT customer_id, SUM(amount) AS spend
FROM delivered GROUP BY customer_id ORDER BY customer_id;</div>
  <table class="tbl out"><caption>customer_spend: Asha 240 + 380, Ben 450 + 180, Chen 520 + 260, Farah 600</caption><tr><th>customer_id</th><th>spend</th></tr><tr><td>1</td><td>620.00</td></tr><tr><td>2</td><td>630.00</td></tr><tr><td>3</td><td>780.00</td></tr><tr><td>6</td><td>600.00</td></tr></table>
  <p>Step 3 compares each spend with the average spend, (620 + 630 + 780 + 600) / 4 = 2630 / 4 = 657.5. The full query:</p>
  <div class="fx" data-lang="sql">WITH delivered AS (                         -- step 1
  SELECT * FROM orders WHERE status = 'delivered'
),
customer_spend AS (                         -- step 2 reads step 1
  SELECT customer_id, SUM(amount) AS spend
  FROM delivered
  GROUP BY customer_id
)
SELECT c.name, cs.spend,
       (SELECT ROUND(AVG(spend), 2) FROM customer_spend) AS avg_spend   -- step 2 reused
FROM customer_spend cs
JOIN customers c USING (customer_id)
WHERE cs.spend &gt; (SELECT AVG(spend) FROM customer_spend);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th><th>avg_spend</th></tr><tr><td>Chen</td><td>780.00</td><td>657.50</td></tr></table>
  <p>Read it top-down. <code>WITH delivered AS (…)</code> defines step 1. The comma starts the next CTE, <code>customer_spend</code>, which reads <code>FROM delivered</code>. The final SELECT uses <code>customer_spend</code> three times: to list customers, to show the average, and inside the WHERE. Only Chen (780 &gt; 657.5) passes. Same answer as the nested version, half the reading effort.</p>
  <h3>Is a CTE computed once, or pasted in?</h3>
  <p>In PostgreSQL 12 and later, a CTE used <strong>once</strong> is inlined: the planner pastes it into the main query and optimises everything together. A CTE used <strong>twice or more</strong> is <strong>materialised</strong>: computed once and stored for reuse. You can force either with <code>AS MATERIALIZED</code> / <code>AS NOT MATERIALIZED</code>. Watch the plan change:</p>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
WITH t AS (SELECT * FROM orders)
SELECT * FROM t WHERE order_id = 105;</div>
  <div class="fx" data-lang="text">Index Scan using orders_pkey on orders
  Index Cond: (order_id = 105)</div>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
WITH t AS MATERIALIZED (SELECT * FROM orders)
SELECT * FROM t WHERE order_id = 105;</div>
  <div class="fx" data-lang="text">CTE Scan on t
  Filter: (order_id = 105)
  CTE t
    -&gt;  Seq Scan on orders</div>
  <p>In the first plan there is no CTE left: the <code>order_id = 105</code> condition was pushed straight into the scan of <code>orders</code>, which became a lookup in the primary-key index (<code>orders_pkey</code>). In the second, the CTE is a fence: all of <code>orders</code> is scanned into a temporary result (<code>CTE t</code>), and only then filtered (<code>CTE Scan on t</code>). On a big table, that is the difference between one index lookup and reading everything.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>CTE</strong>: a named, temporary result defined with <code>WITH</code> that exists only for one statement. <strong>Materialised</strong>: computed once and stored. <strong>Inlined</strong>: merged into the outer query as if written in place.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"CTEs are slow" was true in PostgreSQL 11 and earlier, where every CTE was materialised. Some other engines re-compute a CTE each time it is referenced. Do not guess; read the plan.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: recursive CTEs.</b> Each CTE step runs once, a fixed number of steps. "Farah's full referral chain up to the first customer" needs as many steps as the chain is long, which we do not know in advance.</div>

  <h2 id="sq-rec"><span class="num">07</span>Recursive CTEs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One self-join gives Farah's referrer (Ben). Two self-joins give Ben's referrer (Asha). But a referral chain can be any length: we cannot write the right number of joins in advance. We need a query that keeps going until there is nothing left.</p>
  </div>
  <p>A <strong>recursive CTE</strong> refers to itself. It has two parts joined by <code>UNION ALL</code>: an <strong>anchor</strong> (the starting rows) and a <strong>recursive step</strong> (a query that reads the rows found in the previous round and finds the next ones). It repeats the step until a round returns no rows, then stacks all rounds.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking up the ladder in a government office. Ask Farah "who sent you here?": Ben. Ask Ben: Asha. Ask Asha: nobody. Stop. Each question uses the answer to the previous one.</p>
  </div>
  <p>Start with the simplest one, counting to 5, to see the mechanics:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE n AS (
  SELECT 1 AS i                  -- anchor
  UNION ALL
  SELECT i + 1 FROM n WHERE i &lt; 5 -- step: reads the previous round
)
SELECT i FROM n;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>i</th></tr><tr><td>1</td></tr><tr><td>2</td></tr><tr><td>3</td></tr><tr><td>4</td></tr><tr><td>5</td></tr></table>
  <p>Round 0, the anchor, gives 1. Each round feeds the previous round's row into the step: 1 → 2 → … → 5. When i = 5, <code>WHERE i &lt; 5</code> is false, the step returns nothing, and recursion stops.</p>
  <h3>Walking up the referral chain</h3>
  <table class="tbl"><caption>Trace: iteration by iteration (the "working table" is the previous round's output)</caption>
    <tr><th>round</th><th>working table (input)</th><th>step finds c.customer_id = w.referred_by</th><th>new row</th></tr>
    <tr><td>anchor</td><td>—</td><td>customer_id = 6</td><td>Farah, referred_by 2, depth 1</td></tr>
    <tr><td>1</td><td>Farah (referred_by 2)</td><td>customer 2</td><td>Ben, referred_by 1, depth 2</td></tr>
    <tr><td>2</td><td>Ben (referred_by 1)</td><td>customer 1</td><td>Asha, referred_by NULL, depth 3</td></tr>
    <tr><td>3</td><td>Asha (referred_by NULL)</td><td>customer_id = NULL matches nothing</td><td>none → stop</td></tr>
  </table>
  <div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT customer_id, name, referred_by, 1 AS depth      -- anchor
  FROM customers
  WHERE customer_id = 6
  UNION ALL
  SELECT c.customer_id, c.name, c.referred_by, w.depth + 1 -- step
  FROM customers c
  JOIN chain w ON c.customer_id = w.referred_by
)
SELECT name, referred_by, depth FROM chain;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>referred_by</th><th>depth</th></tr><tr><td>Farah</td><td>2</td><td>1</td></tr><tr><td>Ben</td><td>1</td><td>2</td></tr><tr><td>Asha</td><td>NULL</td><td>3</td></tr></table>
  <p>In the step, <code>chain w</code> means "the rows produced in the previous round", not the whole result so far. <code>w.depth + 1</code> counts the levels.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="sq-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="65" y="16" text-anchor="middle" class="tm">anchor</text>
    <rect x="15" y="26" width="100" height="44" rx="6" class="fb sb"/><text x="65" y="44" text-anchor="middle" font-weight="bold">Farah</text><text x="65" y="60" text-anchor="middle" class="tm">depth 1, ref 2</text>
    <text x="205" y="16" text-anchor="middle" class="tm">round 1</text>
    <rect x="155" y="26" width="100" height="44" rx="6" class="fv"/><text x="205" y="44" text-anchor="middle" font-weight="bold">Ben</text><text x="205" y="60" text-anchor="middle" class="tm">depth 2, ref 1</text>
    <text x="345" y="16" text-anchor="middle" class="tm">round 2</text>
    <rect x="295" y="26" width="100" height="44" rx="6" class="fv"/><text x="345" y="44" text-anchor="middle" font-weight="bold">Asha</text><text x="345" y="60" text-anchor="middle" class="tm">depth 3, ref NULL</text>
    <text x="485" y="16" text-anchor="middle" class="tm">round 3</text>
    <rect x="435" y="26" width="100" height="44" rx="6" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="485" y="44" text-anchor="middle" class="tr">0 rows</text><text x="485" y="60" text-anchor="middle" class="tm">→ stop</text>
    <g stroke="currentColor" marker-end="url(#sq-ar1)"><line x1="115" y1="48" x2="153" y2="48"/><line x1="255" y1="48" x2="293" y2="48"/><line x1="395" y1="48" x2="433" y2="48"/></g>
    <text x="300" y="94" text-anchor="middle" class="tm">each round joins customers to the rows found by the previous round: c.customer_id = w.referred_by</text>
    <text x="65" y="122" text-anchor="middle" font-weight="bold">UNION ALL</text>
    <rect x="130" y="108" width="130" height="22" rx="3" class="fb"/><text x="140" y="123">Farah · 1</text>
    <rect x="130" y="132" width="130" height="22" rx="3" class="fv"/><text x="140" y="147">Ben · 2</text>
    <rect x="130" y="156" width="130" height="22" rx="3" class="fv"/><text x="140" y="171">Asha · 3</text>
    <text x="280" y="147" class="tm">= final result</text>
    </g>
  </svg><figcaption>Anchor gives the first rows; the step repeats on the newest rows until it finds none; all rounds are stacked.</figcaption></figure>
  <h3>Walking down: the whole referral tree</h3>
  <p>Flip the join to go downwards: start at everyone nobody referred, and repeatedly find customers whose <code>referred_by</code> is someone already found. A text <code>path</code> column records the route.</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE tree AS (
  SELECT customer_id, name, 1 AS depth, name::text AS path
  FROM customers
  WHERE referred_by IS NULL                              -- roots
  UNION ALL
  SELECT c.customer_id, c.name, t.depth + 1, t.path || ' &gt; ' || c.name
  FROM customers c
  JOIN tree t ON c.referred_by = t.customer_id           -- one level down
)
SELECT name, depth, path FROM tree ORDER BY path;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>depth</th><th>path</th></tr><tr><td>Asha</td><td>1</td><td>Asha</td></tr><tr><td>Ben</td><td>2</td><td>Asha &gt; Ben</td></tr><tr><td>Farah</td><td>3</td><td>Asha &gt; Ben &gt; Farah</td></tr><tr><td>Chen</td><td>2</td><td>Asha &gt; Chen</td></tr><tr><td>Dia</td><td>1</td><td>Dia</td></tr><tr><td>Esha</td><td>1</td><td>Esha</td></tr><tr><td>Gita</td><td>1</td><td>Gita</td></tr></table>
  <table class="tbl"><caption>Trace: rounds of the tree CTE</caption>
    <tr><th>round</th><th>working table</th><th>new rows</th></tr>
    <tr><td>anchor</td><td>—</td><td>Asha, Dia, Esha, Gita (referred_by NULL)</td></tr>
    <tr><td>1</td><td>those 4</td><td>Ben, Chen (referred by Asha)</td></tr>
    <tr><td>2</td><td>Ben, Chen</td><td>Farah (referred by Ben)</td></tr>
    <tr><td>3</td><td>Farah</td><td>none → stop; 7 rows total</td></tr>
  </table>
  <p>Sorting by <code>path</code> prints the tree in reading order. This is how category trees, folder structures, org charts and referral chains are queried.</p>
  <h3>Generating a calendar</h3>
  <p>A daily report must show days with zero orders too (March 1, 6 and 7), but GROUP BY only produces days that have rows. Generate the days, then LEFT JOIN the data:</p>
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
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>orders</th></tr><tr><td>2026-03-01</td><td>0</td></tr><tr><td>2026-03-02</td><td>3</td></tr><tr><td>2026-03-03</td><td>2</td></tr><tr><td>2026-03-04</td><td>2</td></tr><tr><td>2026-03-05</td><td>2</td></tr><tr><td>2026-03-06</td><td>0</td></tr><tr><td>2026-03-07</td><td>0</td></tr><tr><td>2026-03-08</td><td>1</td></tr></table>
  <p>The anchor gives March 1; each round adds one day while <code>d &lt; '2026-03-08'</code>. <code>COUNT(o.order_id)</code> counts only real matches, so empty days show 0. In PostgreSQL the calendar part is one function call, <code>generate_series(DATE '2026-03-01', DATE '2026-03-08', INTERVAL '1 day')</code>; the recursive version also works in SQLite, DuckDB and MySQL 8.</p>
  <h3>Guarding against cycles</h3>
  <p>Bad data can create a loop. Suppose someone sets Asha's <code>referred_by</code> to Farah (Asha → Farah → Ben → Asha …). Walking up from Farah would never end. PostgreSQL 14+ has a <code>CYCLE</code> clause that marks a row as a cycle when its key was already on the path, and stops there. Run inside a transaction that is rolled back, so the data is not changed:</p>
  <div class="fx" data-lang="sql">UPDATE customers SET referred_by = 6 WHERE customer_id = 1;
WITH RECURSIVE chain AS (
  SELECT customer_id, name, referred_by FROM customers WHERE customer_id = 6
  UNION ALL
  SELECT c.customer_id, c.name, c.referred_by
  FROM customers c JOIN chain w ON c.customer_id = w.referred_by
) CYCLE customer_id SET is_cycle USING path
SELECT name, is_cycle FROM chain;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>is_cycle</th></tr><tr><td>Farah</td><td>f</td></tr><tr><td>Ben</td><td>f</td></tr><tr><td>Asha</td><td>f</td></tr><tr><td>Farah</td><td>t</td></tr></table>
  <p>The fourth row (Farah again) is flagged and not expanded further. In other engines, carry a depth column and add <code>WHERE depth &lt; 100</code> to the step as a cheap guard.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Recursive CTE</strong>: <code>WITH RECURSIVE name AS (anchor UNION ALL step)</code>, where the step references <code>name</code>. Evaluation: run the anchor; then repeatedly run the step on the previous round's rows (the working table) until a round is empty; return all rounds stacked.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>No stop condition, or a cycle in the data, means infinite recursion. Always have a condition that ends it (a depth limit is a cheap guard), or use <code>CYCLE</code>. <code>UNION</code> instead of <code>UNION ALL</code> also stops repeats, but only when whole rows repeat (a growing depth column defeats it).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: LATERAL.</b> CTEs and derived tables are computed on their own. "Each customer's latest 2 orders" needs a FROM-subquery that sorts and limits <em>that customer's</em> orders, and a normal derived table cannot see the customer next to it.</div>

  <h2 id="sq-lat"><span class="num">08</span>LATERAL</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Each customer's 2 most recent orders." The natural idea is a derived table that sorts a customer's orders and takes 2. But a normal subquery in FROM cannot refer to the other tables in the same FROM, so it cannot know "this customer".</p>
  </div>
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
  <p>The error message names the fix. <strong>LATERAL</strong> before a FROM-subquery allows it to use columns of tables listed earlier. It then runs once per row of those tables, like a for-each loop: a correlated subquery that may return many rows and many columns.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank clerk goes down the list of account holders and, for each one, pulls out that person's last two passbook entries. The "pull out" step depends on whose turn it is. That per-person step is LATERAL.</p>
  </div>
  <table class="tbl"><caption>Trace: the LATERAL subquery, once per customer</caption>
    <tr><th>customer c</th><th>orders, newest first</th><th>LIMIT 2 keeps</th></tr>
    <tr><td>Asha (1)</td><td>110 (Mar 8), 104 (Mar 3), 101 (Mar 2)</td><td>110, 104</td></tr>
    <tr><td>Ben (2)</td><td>106 (Mar 4), 102 (Mar 2)</td><td>106, 102</td></tr>
    <tr><td>Chen (3)</td><td>108 (Mar 5), 103 (Mar 2)</td><td>108, 103</td></tr>
    <tr><td>Dia, Esha, Farah</td><td>one order each</td><td>105; 107; 109</td></tr>
    <tr><td>Gita (7)</td><td>none</td><td>nothing</td></tr>
  </table>
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
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>day</th></tr><tr><td>Asha</td><td>110</td><td>Mar 08</td></tr><tr><td>Asha</td><td>104</td><td>Mar 03</td></tr><tr><td>Ben</td><td>106</td><td>Mar 04</td></tr><tr><td>Ben</td><td>102</td><td>Mar 02</td></tr><tr><td>Chen</td><td>108</td><td>Mar 05</td></tr><tr><td>Chen</td><td>103</td><td>Mar 02</td></tr><tr><td>Dia</td><td>105</td><td>Mar 03</td></tr><tr><td>Esha</td><td>107</td><td>Mar 04</td></tr><tr><td>Farah</td><td>109</td><td>Mar 05</td></tr></table>
  <p><code>WHERE o.customer_id = c.customer_id</code> reaches out to the current customer. <code>ORDER BY … DESC LIMIT 2</code> picks the newest two for that customer only. <code>CROSS JOIN LATERAL</code> pairs each customer with whatever the subquery returned, so Gita, who got nothing, disappears.</p>
  <p>To keep customers with no orders, use <code>LEFT JOIN LATERAL … ON true</code>. <code>ON true</code> means "no extra condition": every row the subquery returned is a match, and an empty result gives a NULL-padded row, exactly like a LEFT JOIN.</p>
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
  <table class="tbl out"><caption>Latest order per customer, Gita kept</caption><tr><th>name</th><th>order_id</th><th>amount</th></tr><tr><td>Asha</td><td>110</td><td>310.00</td></tr><tr><td>Ben</td><td>106</td><td>180.00</td></tr><tr><td>Chen</td><td>108</td><td>260.00</td></tr><tr><td>Dia</td><td>105</td><td>310.00</td></tr><tr><td>Esha</td><td>107</td><td>260.00</td></tr><tr><td>Farah</td><td>109</td><td>600.00</td></tr><tr><td>Gita</td><td>NULL</td><td>NULL</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LATERAL</strong>: a keyword that lets a FROM-subquery (or function call) reference earlier FROM items, so it is evaluated per row. SQL Server spells it <code>CROSS APPLY</code> / <code>OUTER APPLY</code>.</p>
  </div>
  <div class="callout intu"><span class="label">LATERAL vs ROW_NUMBER()</span>
    <p>The other standard answer to top-N per group is <code>ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ordered_at DESC)</code> and filter <code>rn &lt;= 2</code> (see <a class="xref" data-note="sql_windows">Window Functions</a>). With an index on <code>(customer_id, ordered_at)</code>, LATERAL does one tiny index lookup per customer, which wins when there are few customers and many orders. ROW_NUMBER reads everything once, which wins when you need most rows anyway.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>CROSS JOIN LATERAL</code> silently drops outer rows whose subquery is empty. If "every customer" is the requirement, it must be <code>LEFT JOIN LATERAL … ON true</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: set operations.</b> Every tool so far adds columns or filters rows. Sometimes two results must go one <em>under</em> the other: "customers with a delivered order, and customers with a problem order: who is in both, who only in one?"</div>

  <h2 id="sq-set"><span class="num">09</span>Set Operations</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A join puts results side by side (more columns). Support wants the opposite: stack two lists of customer ids and compare them. Who had a delivered order and also a cancelled or pending one? Who only had problems?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two class attendance sheets. Staple one under the other: UNION ALL. Staple and strike out names written twice: UNION. Names on both sheets: INTERSECT. Names on sheet A but not on B: EXCEPT.</p>
  </div>
  <p>The two inputs, one id per order: A = delivered orders (1, 2, 3, 1, 2, 3, 6), B = cancelled or pending orders (4, 5, 1).</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
UNION ALL
SELECT customer_id FROM orders WHERE status &lt;&gt; 'delivered'
ORDER BY 1;</div>
  <table class="tbl out"><caption>A UNION ALL B: 7 + 3 = 10 rows</caption><tr><th>customer_id</th></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>2</td></tr><tr><td>2</td></tr><tr><td>3</td></tr><tr><td>3</td></tr><tr><td>4</td></tr><tr><td>5</td></tr><tr><td>6</td></tr></table>
  <p>UNION ALL just stacks: duplicates kept. The single <code>ORDER BY 1</code> at the end sorts the combined result by column 1.</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
UNION
SELECT customer_id FROM orders WHERE status &lt;&gt; 'delivered'
ORDER BY 1;</div>
  <table class="tbl out"><caption>A UNION B: distinct ids</caption><tr><th>customer_id</th></tr><tr><td>1</td></tr><tr><td>2</td></tr><tr><td>3</td></tr><tr><td>4</td></tr><tr><td>5</td></tr><tr><td>6</td></tr></table>
  <p>UNION stacks and then removes duplicate rows. Removing duplicates needs a sort or hash of the whole result, so UNION is slower.</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
INTERSECT
SELECT customer_id FROM orders WHERE status &lt;&gt; 'delivered';</div>
  <table class="tbl out"><caption>A INTERSECT B: in both</caption><tr><th>customer_id</th></tr><tr><td>1</td></tr></table>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status &lt;&gt; 'delivered'
EXCEPT
SELECT customer_id FROM orders WHERE status = 'delivered'
ORDER BY 1;</div>
  <table class="tbl out"><caption>B EXCEPT A: only problem orders</caption><tr><th>customer_id</th></tr><tr><td>4</td></tr><tr><td>5</td></tr></table>
  <p>Asha (1) is the only customer with both kinds (her pending 110). Dia (4) and Esha (5) only have problem orders: good candidates for a "sorry" coupon. EXCEPT is also a correct anti-join: <code>SELECT customer_id FROM customers EXCEPT SELECT customer_id FROM orders</code> returns 7 (Gita), and unlike NOT IN it treats NULLs as equal, so it is NULL-safe.</p>
  <figure class="viz"><svg viewBox="0 0 600 180" width="600">
    <g font-size="11">
    <text x="15" y="24">A (delivered)</text><rect x="140" y="8" width="24" height="24" rx="4" class="fb sb"/><text x="152" y="24" text-anchor="middle">1</text><rect x="166" y="8" width="24" height="24" rx="4" class="fb sb"/><text x="178" y="24" text-anchor="middle">1</text><rect x="192" y="8" width="24" height="24" rx="4" class="fb sb"/><text x="204" y="24" text-anchor="middle">2</text><rect x="218" y="8" width="24" height="24" rx="4" class="fb sb"/><text x="230" y="24" text-anchor="middle">2</text><rect x="244" y="8" width="24" height="24" rx="4" class="fb sb"/><text x="256" y="24" text-anchor="middle">3</text><rect x="270" y="8" width="24" height="24" rx="4" class="fb sb"/><text x="282" y="24" text-anchor="middle">3</text><rect x="296" y="8" width="24" height="24" rx="4" class="fb sb"/><text x="308" y="24" text-anchor="middle">6</text>
    <text x="350" y="24">B (other)</text><rect x="430" y="8" width="24" height="24" rx="4" class="fv"/><text x="442" y="24" text-anchor="middle">1</text><rect x="456" y="8" width="24" height="24" rx="4" class="fv"/><text x="468" y="24" text-anchor="middle">4</text><rect x="482" y="8" width="24" height="24" rx="4" class="fv"/><text x="494" y="24" text-anchor="middle">5</text>
    <line x1="10" y1="44" x2="590" y2="44" stroke="currentColor" opacity="0.3"/>
    <text x="15" y="76" font-weight="bold">A UNION ALL B</text><text x="160" y="76">10 rows: 1, 1, 1, 2, 2, 3, 3, 4, 5, 6</text><text x="430" y="76" class="tm">stack, keep all</text>
    <text x="15" y="106" font-weight="bold">A UNION B</text><text x="160" y="106">1, 2, 3, 4, 5, 6</text><text x="430" y="106" class="tm">stack, then dedupe</text>
    <text x="15" y="136" font-weight="bold">A INTERSECT B</text><text x="160" y="136">1</text><text x="430" y="136" class="tm">in both</text>
    <text x="15" y="166" font-weight="bold">B EXCEPT A</text><text x="160" y="166">4, 5</text><text x="430" y="166" class="tm">in B, not in A</text>
    </g>
  </svg><figcaption>customer_ids from delivered orders (A) and from cancelled or pending orders (B). Only UNION ALL keeps duplicates.</figcaption></figure>
  <p>The two queries must line up: same number of columns, compatible types, matched by <em>position</em>, not by name. Break the rules and you get:</p>
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
  <p>A common real use is one list of "places" from two tables with a label column. Column names come from the first query, so only the first needs <code>AS kind</code>:</p>
  <div class="fx" data-lang="sql">SELECT city, 'customer' AS kind FROM customers WHERE city IS NOT NULL
UNION
SELECT city, 'restaurant' FROM restaurants
ORDER BY city, kind;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>city</th><th>kind</th></tr><tr><td>Mumbai</td><td>customer</td></tr><tr><td>Mumbai</td><td>restaurant</td></tr><tr><td>Pune</td><td>customer</td></tr><tr><td>Pune</td><td>restaurant</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>UNION</strong>: rows in either result, duplicates removed. <strong>UNION ALL</strong>: rows in either, all kept. <strong>INTERSECT</strong>: rows in both. <strong>EXCEPT</strong> (Oracle: <code>MINUS</code>): rows in the first but not the second. INTERSECT and EXCEPT also have <code>ALL</code> forms that keep duplicates.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Default to <code>UNION ALL</code>. Plain <code>UNION</code> silently merges legitimate duplicates (orders 107 and 108 are both 260: stack their amounts with UNION and one disappears) and adds a sort.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: views.</b> We can now write any query. But the same "delivered orders with customer and restaurant names" block is pasted into five reports, and each copy drifts. We want to write it once and let everyone use it like a table.</div>

  <h2 id="sq-view"><span class="num">10</span>Views &amp; Materialized Views</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Copy-pasting a query means every copy must be fixed when the logic changes, and analysts keep getting the join slightly wrong. And a heavy dashboard query re-runs on every page load. Can the database store the query, or even its result?</p>
  </div>
  <p>A <strong>view</strong> is a saved query with a name. It stores no data. Each time you select from it, the database runs the saved query on the current tables. A <strong>materialized view</strong> stores the result of the query as real rows, which makes reading fast, but the rows do not change until you refresh them.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A view is a saved search on a shopping app: tap it and the search runs again, showing today's stock. A materialized view is a printed price list: instant to read, but it shows yesterday's prices until you print a new one.</p>
  </div>
  <div class="fx" data-lang="sql">CREATE VIEW delivered_orders AS
SELECT o.order_id, c.name AS customer, r.name AS restaurant,
       o.ordered_at::date AS day, o.amount
FROM orders o
JOIN customers c   ON c.customer_id   = o.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
WHERE o.status = 'delivered';</div>
  <div class="fx" data-lang="sql">SELECT restaurant, COUNT(*) AS orders, SUM(amount) AS revenue
FROM delivered_orders
GROUP BY restaurant
ORDER BY revenue DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant</th><th>orders</th><th>revenue</th></tr><tr><td>Biryani Bros</td><td>3</td><td>1230.00</td></tr><tr><td>Pizza Point</td><td>2</td><td>900.00</td></tr><tr><td>Dosa Hut</td><td>2</td><td>500.00</td></tr></table>
  <p>After <code>CREATE VIEW</code>, <code>delivered_orders</code> can be used in FROM like any table, with WHERE, GROUP BY and joins. Behind the scenes PostgreSQL pastes the view's query in, so a view is never faster than the query itself. Its value is reuse, simpler queries for analysts, and security: you can grant access to a view that hides sensitive columns.</p>
  <h3>Materialized view: fast but stale</h3>
  <p>Traced step by step: build a materialized view of daily delivered revenue, add a new order, read the view, refresh it, read again.</p>
  <div class="fx" data-lang="sql">CREATE MATERIALIZED VIEW daily_revenue AS
SELECT ordered_at::date AS day, SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY 1;</div>
  <div class="fx" data-lang="sql">SELECT * FROM daily_revenue ORDER BY day;</div>
  <table class="tbl out"><caption>daily_revenue right after creation</caption><tr><th>day</th><th>revenue</th></tr><tr><td>2026-03-02</td><td>1210.00</td></tr><tr><td>2026-03-03</td><td>380.00</td></tr><tr><td>2026-03-04</td><td>180.00</td></tr><tr><td>2026-03-05</td><td>860.00</td></tr></table>
  <p>Mar 5 = 260 (108) + 600 (109) = 860. Now Gita finally places her first order, ₹350 from Momo Magic, delivered on Mar 5:</p>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES
  (111, 7, 14, '2026-03-05 21:00+05:30', 'delivered', 350, 30);</div>
  <div class="fx" data-lang="sql">SELECT * FROM daily_revenue WHERE day = '2026-03-05';</div>
  <table class="tbl out"><caption>Read again: still the old number</caption><tr><th>day</th><th>revenue</th></tr><tr><td>2026-03-05</td><td>860.00</td></tr></table>
  <p>The base table now says Mar 5 earned 860 + 350 = 1210, but the view still shows the stored 860. Nothing is wrong; it was never told to update.</p>
  <div class="fx" data-lang="sql">REFRESH MATERIALIZED VIEW daily_revenue;
SELECT * FROM daily_revenue WHERE day = '2026-03-05';</div>
  <table class="tbl out"><caption>After REFRESH</caption><tr><th>day</th><th>revenue</th></tr><tr><td>2026-03-05</td><td>1210.00</td></tr></table>

  <p>(Order 111 was removed again after this demo, so the rest of the note uses the original 10 orders.)</p>
  <table class="tbl">
    <tr><th></th><th>View</th><th>Materialized view</th></tr>
    <tr><td>Stores data</td><td>No</td><td>Yes, and can be indexed</td></tr>
    <tr><td>Freshness</td><td>Always current</td><td>As of the last <code>REFRESH</code></td></tr>
    <tr><td>Read speed</td><td>Same as the underlying query</td><td>Fast: reads a stored table</td></tr>
    <tr><td>Use for</td><td>Hiding complexity, restricting columns</td><td>Expensive dashboard aggregates that may be minutes or hours old</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>View</strong>: a named, stored SELECT, evaluated at query time. <strong>Materialized view</strong>: a named, stored SELECT <em>and</em> its stored result, updated only by <code>REFRESH MATERIALIZED VIEW</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Plain <code>REFRESH</code> locks out readers while it rebuilds. <code>REFRESH MATERIALIZED VIEW CONCURRENTLY</code> does not, but needs a unique index on the view. PostgreSQL never refreshes on its own; schedule it (cron, Airflow) and show an "as of" time on dashboards.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: functions and procedures.</b> A view saves a <em>set of rows</em>. "How much has this customer spent?" is a calculation you want to call with an argument inside other queries, and "cancel stale pending orders every night" is a job that changes data. Neither is a view.</div>

  <h2 id="sq-func"><span class="num">11</span>Functions &amp; Stored Procedures</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The same rule, "a customer's delivered spend", is needed in many queries and by several apps. And a nightly job must change data. Can the logic itself live in the database, so every caller gets the same rule?</p>
  </div>
  <p>A <strong>function</strong> takes inputs and returns a value (or a table), and can be called inside a SELECT like <code>ROUND()</code> or <code>UPPER()</code>. A <strong>stored procedure</strong> is called on its own with <code>CALL</code>; it performs work (updates, batch steps) rather than returning a value for a query.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A function is a calculator on the counter: anyone can punch in a customer id and read off a number, in the middle of their own work. A procedure is the closing-time routine the manager runs: count cash, cancel stale orders, lock the shutter.</p>
  </div>
  <div class="fx" data-lang="sql">CREATE FUNCTION customer_spend(cid int) RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM orders
  WHERE customer_id = cid
    AND status = 'delivered'
$$;</div>
  <p>Line by line: <code>customer_spend(cid int)</code> takes one input. <code>RETURNS numeric</code> declares the output type. <code>LANGUAGE sql</code> means the body is plain SQL. <code>STABLE</code> promises it only reads data, so the planner can optimise calls. The body between <code>$$ … $$</code> uses <code>cid</code> where a value is needed. Now call it per customer:</p>
  <div class="fx" data-lang="sql">SELECT name, customer_spend(customer_id) AS spend
FROM customers
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th></tr><tr><td>Asha</td><td>620.00</td></tr><tr><td>Ben</td><td>630.00</td></tr><tr><td>Chen</td><td>780.00</td></tr><tr><td>Dia</td><td>0</td></tr><tr><td>Esha</td><td>0</td></tr><tr><td>Farah</td><td>600.00</td></tr><tr><td>Gita</td><td>0</td></tr></table>
  <p>Same numbers as the CTE in section 06 (620, 630, 780, 600), and Dia, Esha and Gita get 0 thanks to <code>COALESCE</code>. Notice the function runs once per customer row: it is a correlated subquery in disguise, with the same performance caveat.</p>
  <h3>A procedure</h3>
  <p>A nightly job: cancel pending orders placed before a cutoff time.</p>
  <div class="fx" data-lang="sql">CREATE PROCEDURE cancel_stale_pending(cutoff timestamptz)
LANGUAGE sql AS $$
  UPDATE orders
  SET status = 'cancelled'
  WHERE status = 'pending' AND ordered_at &lt; cutoff;
$$;</div>
  <p>Run it in a transaction we roll back afterwards, so Asha's order 110 stays pending for the rest of the site:</p>
  <div class="fx" data-lang="sql">CALL cancel_stale_pending('2026-03-10 00:00+05:30');
SELECT order_id, to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at, status
FROM orders WHERE customer_id = 1 ORDER BY order_id;</div>
  <table class="tbl out"><caption>Asha's orders after the CALL (inside the transaction)</caption><tr><th>order_id</th><th>ordered_at</th><th>status</th></tr><tr><td>101</td><td>Mar 02 12:10</td><td>delivered</td></tr><tr><td>104</td><td>Mar 03 13:15</td><td>delivered</td></tr><tr><td>110</td><td>Mar 08 20:50</td><td>cancelled</td></tr></table>
  <p>Order 110 (pending, Mar 8 20:50) is older than the cutoff, so it became cancelled. Procedures (PostgreSQL 11+) may also run <code>COMMIT</code> between steps, so a long ETL job can save progress in chunks. Functions cannot commit.</p>
  <div class="cards">
    <div><b>Function</b><p>Returns a value or table; usable inside SELECT, WHERE, JOIN. No COMMIT inside.</p><small>Shared business rules, computed columns</small></div>
    <div><b>Procedure</b><p><code>CALL proc()</code>; does work; may <code>COMMIT</code> mid-way.</p><small>Batch jobs, ETL steps, maintenance</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>User-defined function (UDF)</strong>: named logic stored in the database that returns a result and can appear in expressions. <strong>Stored procedure</strong>: named logic invoked with CALL that may control transactions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Logic in the database is fast (no round trips) but harder to version, test and review than application code, and it ties you to one DBMS. A function called in SELECT over a million rows runs a million times; check the plan.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have built eleven tools, each from the weakness of the one before. Seen together, they are one idea growing: "use the result of a query as if it were data".</div>

  <h2 id="sq-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Scalar, list, derived, correlated, EXISTS, CTE, recursive, LATERAL, set operations, views, functions: separate syntax to memorise, or one idea in different places?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="sq-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="270" y="10" width="180" height="40" rx="8" class="fg sg"/><text x="360" y="28" text-anchor="middle" font-weight="700">a query's result</text><text x="360" y="43" text-anchor="middle" class="tm">used as data</text>
<line x1="300" y1="50" x2="90" y2="83" stroke="currentColor" marker-end="url(#sq-a9)"/><line x1="340" y1="50" x2="270" y2="83" stroke="currentColor" marker-end="url(#sq-a9)"/><line x1="380" y1="50" x2="450" y2="83" stroke="currentColor" marker-end="url(#sq-a9)"/><line x1="420" y1="50" x2="630" y2="83" stroke="currentColor" marker-end="url(#sq-a9)"/>
<rect x="10" y="85" width="160" height="46" rx="8" class="fb sb"/><text x="90" y="104" text-anchor="middle" font-weight="700">by SHAPE</text><text x="90" y="121" text-anchor="middle" class="tm">scalar 351 · list · derived</text>
<rect x="190" y="85" width="160" height="46" rx="8" class="fb sb"/><text x="270" y="104" text-anchor="middle" font-weight="700">by DEPENDENCE</text><text x="270" y="121" text-anchor="middle" class="tm">correlated · LATERAL</text>
<rect x="370" y="85" width="160" height="46" rx="8" class="fb sb"/><text x="450" y="104" text-anchor="middle" font-weight="700">by NAME</text><text x="450" y="121" text-anchor="middle" class="tm">CTE · recursive CTE</text>
<rect x="550" y="85" width="160" height="46" rx="8" class="fb sb"/><text x="630" y="104" text-anchor="middle" font-weight="700">by LIFETIME</text><text x="630" y="121" text-anchor="middle" class="tm">view · MV · function</text>
<line x1="270" y1="131" x2="270" y2="163" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sq-a9)"/>
<rect x="160" y="165" width="220" height="46" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="270" y="184" text-anchor="middle">only "any row?" → EXISTS / IN</text><text x="270" y="201" text-anchor="middle" class="tm">negated: NOT EXISTS (NOT IN breaks)</text>
<line x1="450" y1="131" x2="450" y2="163" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sq-a9)"/>
<rect x="400" y="165" width="200" height="46" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="500" y="184" text-anchor="middle">rows stacked, not joined</text><text x="500" y="201" text-anchor="middle" class="tm">UNION ALL · INTERSECT · EXCEPT</text>
<text x="10" y="245" class="tm">Shape: one value, one column, or a table. Dependence: runs once, or once per outer row. Name: written inline, or named once and reused (even by itself).</text>
<text x="10" y="263" class="tm">Lifetime: exists for one statement (subquery, CTE) or is stored in the database for everyone (view, materialized view, function, procedure).</text>
</g>
</svg><figcaption>Every tool in this note is "a query's result used as data", varied along four axes: what shape it returns, whether it depends on the current row, whether it has a name, and how long it lives.</figcaption></figure>
  <table class="tbl"><caption>Every tool on the same Biteful data</caption>
    <tr><th>Tool</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>Scalar subquery</td><td>a query returning 1 × 1</td><td>compare with one computed value</td><td>avg 351 → 4 orders above</td><td>thresholds, ratios to a total</td></tr>
    <tr><td>List (IN)</td><td>1 column, many rows</td><td>is this value in that set?</td><td>4 customers with a delivered order</td><td>positive membership filters</td></tr>
    <tr><td>Derived table</td><td>any query in FROM</td><td>aggregate an aggregate</td><td>avg order 351 vs line 234</td><td>two-level aggregation</td></tr>
    <tr><td>Correlated subquery</td><td>subquery + outer column</td><td>a different inner answer per row</td><td>4 orders above own restaurant avg</td><td>small data; else rewrite as join/window</td></tr>
    <tr><td>EXISTS / IN</td><td>correlated yes/no</td><td>has any?</td><td>4 customers, no duplicates (JOIN: 7)</td><td>filters; same semi-join plan</td></tr>
    <tr><td>NOT EXISTS</td><td>correlated yes/no, negated</td><td>has none?</td><td>5 non-referrers (NOT IN: 0)</td><td>every anti-filter</td></tr>
    <tr><td>CTE</td><td>named derived tables</td><td>readable, reusable steps</td><td>avg spend 657.5 → Chen</td><td>any query with 2+ steps</td></tr>
    <tr><td>Recursive CTE</td><td>CTE that reads its last round</td><td>unknown depth, generated rows</td><td>Farah → Ben → Asha; 8-day calendar</td><td>hierarchies, date spines</td></tr>
    <tr><td>LATERAL</td><td>derived table + correlation</td><td>a per-row subquery returning rows</td><td>latest 2 orders per customer</td><td>top-N per group with an index</td></tr>
    <tr><td>Set operations</td><td>two queries, same columns</td><td>stack / compare results</td><td>INTERSECT 1, EXCEPT 4, 5</td><td>combining lists; anti-join via EXCEPT</td></tr>
    <tr><td>View / MV</td><td>a query stored in the DB</td><td>reuse; fast reads</td><td>MV 860 until REFRESH → 1210</td><td>shared logic; heavy dashboards</td></tr>
    <tr><td>Function / procedure</td><td>logic stored in the DB</td><td>reusable calculation / job</td><td>customer_spend: 620, 630, 780, 600</td><td>shared rules; batch jobs</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>the result of a query is itself a table, so it can be used wherever data can be used</strong>: as one value, a list, a FROM item, a named step, a step that repeats, a per-row lookup, or a saved object. The traps come from the edges of that idea: a "value" that is really several rows, a "list" that contains NULL, a per-row subquery that runs a million times, or a saved result that is no longer current.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Knowing the system, which slips still produce clean-looking wrong answers?</div>

  <h2 id="sq-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Most subquery bugs do not crash. Which ones should you check for before trusting a result?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: NOT IN with a nullable list</span>
    <p>One NULL in the subquery makes every NOT IN test UNKNOWN → 0 rows (non-referrers). Use NOT EXISTS, or filter <code>IS NOT NULL</code> inside.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scalar subquery returning many rows (or none)</span>
    <p>Two rows is a runtime error that may only appear once data grows (Asha's three orders). Zero rows silently becomes NULL (Gita). Make the inner query provably single-row.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: averaging at the wrong level</span>
    <p><code>AVG(qty * unit_price)</code> over lines gave 234; the average order is 351. Aggregate to the level you mean first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: correlated subquery without distinct aliases</span>
    <p><code>WHERE restaurant_id = restaurant_id</code> inside the subquery compares the inner row with itself. Alias both copies and write <code>x.restaurant_id = o.restaurant_id</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: JOIN when you meant EXISTS</span>
    <p>A join repeats the outer row for each match (7 rows for 4 customers). For "has any", use EXISTS or IN.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: CROSS JOIN LATERAL for "every customer"</span>
    <p>Rows with an empty subquery vanish (Gita). Use LEFT JOIN LATERAL … ON true.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: UNION when you meant UNION ALL</span>
    <p>Real duplicate rows are merged and totals shrink. UNION ALL unless you want distinct rows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: recursive CTE without a guaranteed stop</span>
    <p>A cycle in the data loops forever. Add a depth limit, or <code>CYCLE</code> in PostgreSQL 14+.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading a materialized view as live data</span>
    <p>It shows the last refresh (860, not 1210). Show "as of" time on dashboards and schedule refreshes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="sq-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <strong>Biteful</strong>. orders 101–110 with amounts 240, 450, 520, 380, 310, 180, 260, 260, 600, 310 (total 3510, average 351); 105 and 107 cancelled, 110 pending. Restaurant averages: Dosa Hut 270, Biryani Bros 410, Pizza Point 386.67, Green Bowl 310, Momo Magic no orders. customers 1–7 (Gita no orders); referrals Ben, Chen ← Asha, Farah ← Ben; four <code>referred_by</code> values are NULL.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Scalar subquery</td><td>a query needs another query's value</td><td>351 → orders 102, 103, 104, 109</td><td>one value only → list / derived table</td></tr>
    <tr><td>List / derived table</td><td>many values; a table to aggregate again</td><td>IN: 4 customers; avg order 351 vs line 234</td><td>same answer for every row → correlated</td></tr>
    <tr><td>Correlated</td><td>a different inner answer per row</td><td>102, 103, 109, 110 above own restaurant avg</td><td>yes/no tests → EXISTS vs IN vs JOIN</td></tr>
    <tr><td>EXISTS vs IN vs JOIN</td><td>has any?</td><td>EXISTS/IN 4 rows, JOIN 7</td><td>negation with NULL → NOT IN trap</td></tr>
    <tr><td>NOT IN trap</td><td>has none, safely</td><td>NOT IN 0 rows, NOT EXISTS 5</td><td>deep nesting → CTE</td></tr>
    <tr><td>CTE</td><td>readable, reusable steps</td><td>avg spend 657.5 → Chen 780</td><td>fixed number of steps → recursive</td></tr>
    <tr><td>Recursive CTE</td><td>unknown depth; generated rows</td><td>Farah → Ben → Asha; Mar 1–8 calendar</td><td>FROM-subquery can't see its row → LATERAL</td></tr>
    <tr><td>LATERAL</td><td>per-row subquery returning rows</td><td>latest 2 per customer; Gita via LEFT</td><td>stacking rows → set operations</td></tr>
    <tr><td>Set operations</td><td>stack / compare results</td><td>UNION ALL 10, UNION 6, INTERSECT 1, EXCEPT 4, 5</td><td>copy-pasted logic → views</td></tr>
    <tr><td>View / MV</td><td>save a query / its result</td><td>MV 860 → REFRESH → 1210</td><td>rows only → functions/procedures</td></tr>
    <tr><td>Function / procedure</td><td>stored logic / stored job</td><td>customer_spend; cancel_stale_pending</td><td>→ <a class="xref" data-note="sql_windows">Window Functions</a></td></tr>
  </table>
  <h3>Syntax and rules</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Shape</th><th>Rule to remember</th></tr>
    <tr><td><code>(SELECT AVG(x) FROM t)</code></td><td>1 × 1</td><td>0 rows → NULL; 2+ rows → error</td></tr>
    <tr><td><code>x IN (SELECT col …)</code></td><td>1 column</td><td>duplicates in list harmless; NOT IN breaks on NULL</td></tr>
    <tr><td><code>FROM (SELECT …) AS t</code></td><td>table</td><td>always alias it</td></tr>
    <tr><td><code>WHERE x.k = o.k</code> inside</td><td>any</td><td>correlated: logically once per outer row; distinct aliases</td></tr>
    <tr><td><code>WHERE [NOT] EXISTS (SELECT 1 …)</code></td><td>yes/no</td><td>semi/anti join; NULL-safe</td></tr>
    <tr><td><code>WITH a AS (…), b AS (… FROM a)</code></td><td>named tables</td><td>PG12+: inlined if used once; MATERIALIZED to force</td></tr>
    <tr><td><code>WITH RECURSIVE r AS (anchor UNION ALL step)</code></td><td>table</td><td>step reads last round; stops on an empty round</td></tr>
    <tr><td><code>LEFT JOIN LATERAL (…) t ON true</code></td><td>table per row</td><td>CROSS JOIN LATERAL drops empty rows</td></tr>
    <tr><td><code>UNION [ALL] / INTERSECT / EXCEPT</code></td><td>same columns by position</td><td>UNION dedupes and sorts</td></tr>
    <tr><td><code>CREATE [MATERIALIZED] VIEW</code></td><td>saved</td><td>MV stale until REFRESH</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Scalar subquery</b><p>Use for one threshold or total next to rows (above-average orders, share of total).</p><small>Avoid when it can return several rows</small></div>
    <div><b>Correlated subquery</b><p>Use for clarity on small data and for EXISTS tests.</p><small>Avoid scalar correlated subqueries on big tables: join an aggregate or use a window</small></div>
    <div><b>EXISTS / NOT EXISTS</b><p>Use for every "has any / has none" filter.</p><small>Avoid NOT IN on nullable columns; avoid JOIN + DISTINCT</small></div>
    <div><b>CTE</b><p>Use for any multi-step query; name steps after what one row means.</p><small>Check the plan if a CTE is referenced many times</small></div>
    <div><b>Recursive CTE / LATERAL</b><p>Use for trees, chains, calendars; for top-N per group with an index.</p><small>Guard against cycles; LEFT JOIN LATERAL to keep empty rows</small></div>
    <div><b>View / MV</b><p>Use views to share logic and hide columns; MVs for heavy, slightly stale dashboards.</p><small>Views are not faster; MVs are not live</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>NOT IN with NULLs → 0 rows; scalar subquery with 2 rows → error, with 0 → NULL; averaging lines (234) instead of orders (351); same alias inside and outside a correlated subquery; JOIN for "has any"; CROSS JOIN LATERAL drops Gita; UNION eats real duplicates; recursive CTE with a cycle; materialized view read as live.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why does <code>WHERE amount &gt; AVG(amount)</code> fail?</td><td>WHERE runs per row before grouping; aggregates are not allowed there. Use a scalar subquery.</td></tr>
    <tr><td>Order 310 at Dosa Hut (avg 270), order 380 at Pizza Point (avg 386.67): which is above its restaurant's average?</td><td>Only the 310 one</td></tr>
    <tr><td><code>5 NOT IN (1, 2, NULL)</code> is…?</td><td>UNKNOWN, so WHERE drops the row</td></tr>
    <tr><td>When does a recursive CTE stop?</td><td>When a round (the step on the previous round's rows) returns no rows</td></tr>
    <tr><td>View or materialized view: which is always current?</td><td>The view; the MV is current only as of the last REFRESH</td></tr>
  </table>

  <h2 id="sq-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you choose the right kind of subquery, and explain why it exists, out loud without notes?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a correlated and a non-correlated subquery?</summary><div class="qa-body">Non-correlated runs once, independently (<code>SELECT AVG(amount) FROM orders</code> = 351). Correlated references an outer column (<code>WHERE x.restaurant_id = o.restaurant_id</code>), so it is logically evaluated per outer row (10 runs for 10 orders). Correlated can be slow on large tables unless the optimizer turns it into a join.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>WHERE amount &gt; AVG(amount)</code> fail, and what are two fixes?</summary><div class="qa-body">WHERE filters one row at a time, before any grouping, so aggregates are not allowed there. Fix 1: scalar subquery <code>WHERE amount &gt; (SELECT AVG(amount) FROM orders)</code>. Fix 2: compute <code>AVG(amount) OVER ()</code> in a CTE and filter outside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: orders above their own restaurant's average. Which orders does Biteful return?</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT o.order_id, o.restaurant_id, o.amount
FROM orders o
WHERE o.amount &gt; (SELECT AVG(x.amount)
                  FROM orders x
                  WHERE x.restaurant_id = o.restaurant_id)
ORDER BY o.order_id;</div>102, 103, 109, 110. Alternatives: join to a <code>GROUP BY restaurant_id</code> derived table, or <code>AVG(amount) OVER (PARTITION BY restaurant_id)</code> in a CTE and filter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>SELECT name FROM customers WHERE customer_id NOT IN (SELECT referred_by FROM customers)</code> return, and why?</summary><div class="qa-body">Zero rows. Four <code>referred_by</code> values are NULL, so for every customer <code>customer_id &lt;&gt; NULL</code> is UNKNOWN, and WHERE drops UNKNOWN. Fix with <code>NOT EXISTS</code> or add <code>WHERE referred_by IS NOT NULL</code> inside. Correct answer: Chen, Dia, Esha, Farah, Gita.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EXISTS, IN or JOIN: which is fastest?</summary><div class="qa-body">In modern PostgreSQL, IN and EXISTS usually produce the same semi-join plan (both EXPLAINs in section 04 show a Semi Join). Choose on meaning: JOIN when you need the other table's columns (beware duplicates: 7 rows vs 4), EXISTS/IN to filter, NOT EXISTS for anti-joins.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a CTE instead of a nested subquery? Is it slower?</summary><div class="qa-body">Readability (top-down named steps), reuse (reference a step twice without repeating it), and recursion. Since PostgreSQL 12, a single-use CTE is inlined, so performance is the same; a multi-use CTE is computed once. Before 12 every CTE was an optimisation fence. Force either way with <code>MATERIALIZED</code> / <code>NOT MATERIALIZED</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: Farah's full referral chain. Why does it stop?</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT customer_id, name, referred_by, 1 AS depth
  FROM customers WHERE customer_id = 6
  UNION ALL
  SELECT c.customer_id, c.name, c.referred_by, w.depth + 1
  FROM customers c JOIN chain w ON c.customer_id = w.referred_by
)
SELECT name, referred_by, depth FROM chain;</div>Farah 1, Ben 2, Asha 3. In the next round Asha's referred_by is NULL, <code>c.customer_id = NULL</code> matches no row, the round is empty, and recursion ends.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A daily report skips days with no orders. How do you fix it?</summary><div class="qa-body">Generate the full calendar (recursive CTE or <code>generate_series</code>) and LEFT JOIN orders to it, using <code>COUNT(o.order_id)</code>, not <code>COUNT(*)</code>, so empty days show 0. On Biteful, Mar 1, 6 and 7 show 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: each customer's most recent order, keeping customers with none. Give two ways.</summary><div class="qa-body">LATERAL: <code>FROM customers c LEFT JOIN LATERAL (SELECT … FROM orders o WHERE o.customer_id = c.customer_id ORDER BY o.ordered_at DESC LIMIT 1) t ON true</code>. Window function: <code>ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY ordered_at DESC)</code> in a subquery, keep <code>rn = 1</code>, then LEFT JOIN that result to customers, because ROW_NUMBER over orders alone never sees Gita.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>UNION vs UNION ALL: which is faster and when must you use each?</summary><div class="qa-body">UNION ALL is faster: it just appends. UNION must sort or hash everything to remove duplicates. Use UNION ALL by default (and always when duplicates are real data, like two ₹260 orders); use UNION only when you need distinct rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>View vs materialized view: when would you use each?</summary><div class="qa-body">View: to simplify a complex join or restrict columns; always fresh, no speed gain. Materialized view: an expensive aggregate read often where some staleness is fine (dashboard KPIs); refresh on a schedule, and add a unique index to refresh <code>CONCURRENTLY</code> without blocking readers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a correlated subquery need two aliases for the same table, when a plain scalar subquery does not?</summary><div class="qa-body">A plain scalar subquery never refers to the outer row, so there is nothing to distinguish. A correlated one compares an inner row with the outer row of the same table (<code>x.restaurant_id = o.restaurant_id</code>). Without separate aliases, the unqualified name resolves to the inner table, the test becomes <code>restaurant_id = restaurant_id</code> (always true), and the "per row" average silently becomes the company average.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip CTEs and go straight to recursive queries?</summary><div class="qa-body">A recursive CTE <em>is</em> a CTE whose body has two parts: you need the idea of a named result that later parts can read before the idea of a step that reads its own previous round makes sense. It also only exists in WITH syntax; there is no recursive derived table.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are LATERAL and a correlated subquery related?</summary><div class="qa-body">LATERAL is a correlated subquery moved into FROM. A correlated scalar subquery may return only one value per outer row; a LATERAL subquery may return many rows and columns per outer row (Asha's latest 2 orders). Both logically run once per outer row, and both lose rows unless written to keep empties (COUNT returns 0; LEFT JOIN LATERAL keeps Gita).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: a function like customer_spend(id) is "a correlated subquery in disguise". What does that imply?</summary><div class="qa-body">Calling it in SELECT runs its query once per row, exactly like a correlated scalar subquery, with the same cost on big tables. The set-based alternative is the same as for correlated subqueries: aggregate once (a CTE grouped by customer_id) and join. Functions buy reuse and consistency, not speed.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sql_windows">Window Functions</a>.</b> Several answers here took two steps: "each order next to its restaurant's average" needed a derived table and a join; "latest order per customer" needed LATERAL or ROW_NUMBER. Window functions keep every row <em>and</em> attach a group value in one pass.</div>
</main>
`
});
