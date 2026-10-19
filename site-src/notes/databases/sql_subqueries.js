// notes/databases/sql_subqueries.js — Subqueries, CTEs & Views
Object.assign(TOPIC_CONTENT, {
  "sql_subqueries": `<main>
  <h1>Subqueries, CTEs &amp; Views</h1>
  <p class="lead">Real questions rarely fit in one SELECT. "Products above the average price" needs the average first. "Customers who spend more than the typical customer" needs three steps. This page shows how to build a query out of smaller queries: nest them (subqueries), name them (CTEs), repeat them (recursive CTEs), run them per row (LATERAL), stack them (UNION) or save them (views). Builds on <a class="xref" data-note="sql_joins">JOINs</a>.</p>

  <h2 id="sq-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Subqueries, CTEs &amp; Views</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Subqueries by position</div>
        <ul>
          <li><b>Subquery</b> — a SELECT inside another statement, in brackets; inner runs first</li>
          <li><b>Scalar</b> (1 row × 1 col) — in WHERE or SELECT: <code>price &gt; (SELECT AVG(price) …)</code></li>
          <li>⚠ aggregate directly in WHERE is an error; 2 rows from a scalar = error; 0 rows = NULL</li>
          <li><b>IN (list)</b> — 1 column, many rows</li>
          <li><b>FROM</b> → derived table; aggregate twice (avg order value 560, not 400)</li>
          <li>⚠ "average X per Y" → aggregate to Y first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Correlated subqueries</div>
        <ul>
          <li><b>Correlated</b> — uses an outer column; logically re-run per outer row</li>
          <li><b>Use</b> — each row vs its own group: salary &gt; own dept avg (Ravi, Uma)</li>
          <li><b>Cost</b> — outer rows × inner work</li>
          <li><b>Faster</b> — join a pre-aggregated CTE, or <code>AVG() OVER (PARTITION BY dept)</code></li>
          <li>💡 teacher compares each student with that student's class average</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">EXISTS vs IN vs JOIN</div>
        <ul>
          <li><b>JOIN</b> — gives other table's columns; one row per match (Asha ×2)</li>
          <li><b>IN / EXISTS</b> — filter only, no duplicates; planned as a <b>semi join</b></li>
          <li>⚠ <b>NOT IN + one NULL</b> → 0 rows; use <b>NOT EXISTS</b></li>
          <li><b>Rule</b> — need columns: JOIN · filter: EXISTS/IN · anti: NOT EXISTS</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CTEs (WITH)</div>
        <ul>
          <li><b>CTE</b> — named temporary result: <code>WITH t AS (…) SELECT … FROM t</code></li>
          <li><b>Why</b> — read top-down, later steps reuse earlier ones, recursion</li>
          <li><b>PG 12+</b> — used once → inlined; used 2+ times → materialised</li>
          <li><b>Override</b> — <code>AS MATERIALIZED</code> / <code>AS NOT MATERIALIZED</code></li>
          <li>💡 a recipe: dough, sauce, combine</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursive CTEs</div>
        <ul>
          <li><b>Shape</b> — anchor <code>UNION ALL</code> step that joins to the previous round</li>
          <li><b>Stops</b> when a round returns no new rows</li>
          <li><b>Up</b> — Vik → Uma → Ravi · <b>Down</b> — tree with path "Ravi &gt; Uma &gt; Vik"</li>
          <li><b>Calendar</b> — generate months, LEFT JOIN data, <code>COUNT(o.order_id)</code> → zeros show</li>
          <li><b>PG shortcut</b> — <code>generate_series(start, end, '1 month')</code></li>
          <li>⚠ no stop / cycles → infinite; WHERE limit, visited path or <code>CYCLE</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LATERAL</div>
        <ul>
          <li><b>LATERAL</b> — FROM-subquery that may use earlier tables; a for-each loop</li>
          <li><b>Top-N per group</b> — <code>ORDER BY … LIMIT N</code> inside</li>
          <li>⚠ CROSS JOIN LATERAL drops Dia → <code>LEFT JOIN LATERAL (…) ON true</code></li>
          <li>⚠ without LATERAL: "invalid reference to FROM-clause entry"</li>
          <li>SQL Server name: <code>CROSS APPLY</code> / <code>OUTER APPLY</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Set operations</div>
        <ul>
          <li><b>Stack vertically</b> (joins combine horizontally)</li>
          <li><b>UNION</b> dedupes · <b>UNION ALL</b> keeps all, fastest</li>
          <li><b>INTERSECT</b> in both · <b>EXCEPT</b> first minus second (Oracle: MINUS)</li>
          <li><b>Rules</b> — same column count, compatible types, by position; names from first; one ORDER BY at end</li>
          <li>⚠ default to UNION ALL; UNION merges real duplicates</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Views, MVs, functions</div>
        <ul>
          <li><b>View</b> — saved query, always fresh, no speed gain</li>
          <li><b>Materialized view</b> — saved result, fast, stale until <code>REFRESH</code> (120 → 920)</li>
          <li>⚠ <code>REFRESH … CONCURRENTLY</code> needs a unique index; no auto refresh</li>
          <li>💡 saved search vs printed report</li>
          <li><b>Function</b> — returns a value, usable inside SELECT</li>
          <li><b>Procedure</b> — <code>CALL</code>, does work, may COMMIT mid-way</li>
          <li>⚠ function per row = hidden correlated subquery</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sq-where"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Subqueries by Position</span><span class="rm-sub">WHERE, SELECT, FROM</span></div></div>
      <div class="rm-item rm-done" data-target="sq-corr"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Correlated Subqueries</span><span class="rm-sub">Re-run per outer row</span></div></div>
      <div class="rm-item rm-done" data-target="sq-exists"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">EXISTS vs IN vs JOIN</span><span class="rm-sub">Duplicates, NULLs, speed</span></div></div>
      <div class="rm-item rm-done" data-target="sq-cte"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">CTEs (WITH)</span><span class="rm-sub">Name each step</span></div></div>
      <div class="rm-item rm-done" data-target="sq-rec"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Recursive CTEs</span><span class="rm-sub">Hierarchies and series</span></div></div>
      <div class="rm-item rm-done" data-target="sq-lat"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">LATERAL</span><span class="rm-sub">Top-N per group</span></div></div>
      <div class="rm-item rm-done" data-target="sq-set"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Set Operations</span><span class="rm-sub">UNION, INTERSECT, EXCEPT</span></div></div>
      <div class="rm-item rm-done" data-target="sq-view"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Views &amp; Materialized Views</span><span class="rm-sub">Saved queries vs saved results</span></div></div>
      <div class="rm-item rm-done" data-target="sq-func"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Functions &amp; Procedures</span><span class="rm-sub">Logic inside the DB</span></div></div>
      <div class="rm-item rm-done" data-target="sq-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Silent wrong answers</span></div></div>
      <div class="rm-item rm-done" data-target="sq-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sq-where"><span class="num">01</span>Subqueries by Position</h2>
  <p>Question: "which products cost more than the average product?" You know how to get the average, and you know how to filter. The problem is doing both in one statement. The obvious attempt fails, because WHERE looks at one row at a time and an average needs all rows:</p>
  <div class="fx" data-lang="sql">SELECT name, price
FROM products
WHERE price &gt; AVG(price);</div>
  <div class="fx" data-lang="text">ERROR:  aggregate functions are not allowed in WHERE</div>
  <p>The fix is to ask a smaller question first and use its answer. A <strong>subquery</strong> is a complete SELECT written inside brackets inside another statement. The database runs the inner one, then uses its result in the outer one. All results on this page come from PostgreSQL on the <code>shop</code> data.</p>
  <table class="tbl"><caption>products</caption><tr><th>product_id</th><th>name</th><th>category</th><th>price</th></tr><tr><td>10</td><td>Laptop</td><td>Electronics</td><td>800.00</td></tr><tr><td>11</td><td>Phone</td><td>Electronics</td><td>500.00</td></tr><tr><td>12</td><td>Desk</td><td>Furniture</td><td>150.00</td></tr><tr><td>13</td><td>Lamp</td><td>Furniture</td><td>40.00</td></tr></table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop manager asks an assistant mid-task. "What's our average price?" gets back one number. "Which customers got deliveries?" gets back a list of ids. "Make me a summary sheet of order totals" gets back a whole small table. Where the manager plugs the answer in decides which kind of answer is allowed.</p>
  </div>
  <h3>A single value in WHERE</h3>
  <p>Step 1, the inner query alone: <code>SELECT ROUND(AVG(price), 2)</code> gives (800 + 500 + 150 + 40) / 4 =</p>
  <table class="tbl out"><caption>Result</caption><tr><th>avg_price</th></tr><tr><td>372.50</td></tr></table>
  <p>Step 2, the outer query uses that number as if you had typed 372.50:</p>
  <div class="fx" data-lang="sql">SELECT name, price
FROM products
WHERE price &gt; (SELECT AVG(price) FROM products)
ORDER BY price DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>price</th></tr><tr><td>Laptop</td><td>800.00</td></tr><tr><td>Phone</td><td>500.00</td></tr></table>
  <p>Laptop 800 &gt; 372.5 and Phone 500 &gt; 372.5 pass; Desk and Lamp fail. Because the inner query returns exactly one row and one column, it is called a <strong>scalar subquery</strong>: it can go anywhere a single value can go.</p>
  <h3>A single value in SELECT</h3>
  <p>The same scalar can sit in the SELECT list, to show every row next to the average and its distance from it.</p>
  <div class="fx" data-lang="sql">SELECT name, price,
       ROUND((SELECT AVG(price) FROM products), 2) AS avg_price,
       ROUND(price - (SELECT AVG(price) FROM products), 2) AS diff
FROM products
ORDER BY product_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>price</th><th>avg_price</th><th>diff</th></tr><tr><td>Laptop</td><td>800.00</td><td>372.50</td><td>427.50</td></tr><tr><td>Phone</td><td>500.00</td><td>372.50</td><td>127.50</td></tr><tr><td>Desk</td><td>150.00</td><td>372.50</td><td>-222.50</td></tr><tr><td>Lamp</td><td>40.00</td><td>372.50</td><td>-332.50</td></tr></table>
  <p>The inner query has nothing to do with the current row, so its answer, 372.50, is the same on every line. The <code>diff</code> column subtracts it per row.</p>
  <p>A scalar subquery must return at most one row. If it returns two, the query stops with an error. If it returns zero, you get NULL, with no warning. Here the inner query looks up "the" order of each customer:</p>
  <div class="fx" data-lang="sql">SELECT name,
       (SELECT order_id FROM orders o WHERE o.customer_id = c.customer_id) AS order_id
FROM customers c;</div>
  <div class="fx" data-lang="text">ERROR:  more than one row returned by a subquery used as an expression</div>
  <p>Asha has two orders, so "the" order is ambiguous. For Ben (one order) and Dia (none) alone it runs, and Dia quietly gets NULL:</p>
  <div class="fx" data-lang="sql">SELECT name,
       (SELECT order_id FROM orders o WHERE o.customer_id = c.customer_id) AS order_id
FROM customers c
WHERE name IN ('Ben', 'Dia')
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th></tr><tr><td>Ben</td><td>102</td></tr><tr><td>Dia</td><td>NULL</td></tr></table>
  <h3>A list in WHERE … IN</h3>
  <p>"Customers who have a delivered order." The inner query returns one column with many rows, a list of ids:</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered';</div>
  <table class="tbl out"><caption>Inner query result</caption><tr><th>customer_id</th></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>3</td></tr></table>
  <div class="fx" data-lang="sql">SELECT name
FROM customers
WHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'delivered')
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr></table>
  <p><code>IN</code> checks "is this customer_id anywhere in the list (1, 1, 3)?" Duplicates in the list do not matter, so Asha is listed once.</p>
  <h3>A whole table in FROM</h3>
  <p>"Average order value" needs two levels of aggregation: first total each order, then average the totals. One GROUP BY cannot do both. So the first level goes in a subquery in FROM, called a <strong>derived table</strong>.</p>
  <div class="fx" data-lang="sql">SELECT order_id, SUM(qty * unit_price) AS order_total
FROM order_items
GROUP BY order_id
ORDER BY order_id;</div>
  <table class="tbl out"><caption>Inner query: one row per order</caption><tr><th>order_id</th><th>order_total</th></tr><tr><td>100</td><td>880.00</td></tr><tr><td>101</td><td>500.00</td></tr><tr><td>102</td><td>150.00</td></tr><tr><td>103</td><td>1150.00</td></tr><tr><td>104</td><td>120.00</td></tr></table>
  <div class="fx" data-lang="sql">SELECT ROUND(AVG(order_total), 2) AS avg_order_value
FROM (SELECT order_id, SUM(qty * unit_price) AS order_total
      FROM order_items
      GROUP BY order_id) AS t;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>avg_order_value</th></tr><tr><td>560.00</td></tr></table>
  <p>The outer query sees the inner result as a table named <code>t</code> with 5 rows, and averages <code>order_total</code>: (880 + 500 + 150 + 1150 + 120) / 5 = 560. Compare the wrong one-level version:</p>
  <div class="fx" data-lang="sql">SELECT ROUND(AVG(qty * unit_price), 2) AS avg_line_value
FROM order_items;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>avg_line_value</th></tr><tr><td>400.00</td></tr></table>
  <p>400 is the average <em>order line</em> (7 lines), not the average order. Order 100 has two lines, so it was counted twice with smaller pieces.</p>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <g font-size="11">
    <rect x="10" y="10" width="580" height="34" rx="6" class="fs"/>
    <text x="22" y="32">SELECT name, <tspan class="tb">(scalar)</tspan>  FROM <tspan class="tg">(derived table) t</tspan>  WHERE id IN <tspan class="tr">(list)</tspan></text>
    <text x="100" y="72" text-anchor="middle" font-weight="bold" class="tb">in SELECT / WHERE</text>
    <rect x="87" y="84" width="24" height="16" rx="2" class="fb sb"/>
    <text x="100" y="150" text-anchor="middle" font-size="10" class="tm">1 row × 1 col</text>
    <text x="300" y="72" text-anchor="middle" font-weight="bold" class="tg">in FROM</text>
    <rect x="248" y="84" width="24" height="16" rx="2" class="fg"/><rect x="274" y="84" width="24" height="16" rx="2" class="fg"/><rect x="300" y="84" width="24" height="16" rx="2" class="fg"/><rect x="326" y="84" width="24" height="16" rx="2" class="fg"/><rect x="248" y="102" width="24" height="16" rx="2" class="fg"/><rect x="274" y="102" width="24" height="16" rx="2" class="fg"/><rect x="300" y="102" width="24" height="16" rx="2" class="fg"/><rect x="326" y="102" width="24" height="16" rx="2" class="fg"/><rect x="248" y="120" width="24" height="16" rx="2" class="fg"/><rect x="274" y="120" width="24" height="16" rx="2" class="fg"/><rect x="300" y="120" width="24" height="16" rx="2" class="fg"/><rect x="326" y="120" width="24" height="16" rx="2" class="fg"/>
    <text x="300" y="150" text-anchor="middle" font-size="10" class="tm">any table, give it an alias</text>
    <text x="500" y="72" text-anchor="middle" font-weight="bold" class="tr">in WHERE … IN</text>
    <rect x="487" y="84" width="24" height="16" rx="2" class="fr"/><rect x="487" y="102" width="24" height="16" rx="2" class="fr"/><rect x="487" y="120" width="24" height="16" rx="2" class="fr"/>
    <text x="500" y="150" text-anchor="middle" font-size="10" class="tm">1 column, many rows</text>
    </g>
  </svg><figcaption>The slot decides the shape a subquery must return.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Subquery</strong> (inner query, nested query): a SELECT inside another statement. <strong>Scalar subquery</strong>: returns one value. <strong>Derived table</strong>: a subquery in FROM, used like a table; give it an alias (<code>AS t</code>). PostgreSQL 16 accepts a missing alias, but older versions and MySQL reject it, so always write one.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Average X per Y" almost always means aggregate to Y first, then average. Interviewers ask "average order value" exactly to see whether you average lines (400) or orders (560).</p>
  </div>

  <h2 id="sq-corr"><span class="num">02</span>Correlated Subqueries</h2>
  <p>New question: "which employees earn more than <em>their own</em> department's average?" A single company-wide average is not enough. Eng engineers should be compared with the Eng average, Sales people with the Sales average. Each row needs a different comparison number.</p>
  <table class="tbl"><caption>employees</caption><tr><th>emp_id</th><th>name</th><th>dept</th><th>salary</th><th>manager_id</th></tr><tr><td>1</td><td>Ravi</td><td>Eng</td><td>120000</td><td>NULL</td></tr><tr><td>2</td><td>Sara</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>3</td><td>Tom</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>4</td><td>Uma</td><td>Sales</td><td>70000</td><td>1</td></tr><tr><td>5</td><td>Vik</td><td>Sales</td><td>65000</td><td>4</td></tr></table>
  <div class="fx" data-lang="sql">SELECT dept, ROUND(AVG(salary)) AS avg_salary
FROM employees
GROUP BY dept
ORDER BY dept;</div>
  <table class="tbl out"><caption>The two averages we need</caption><tr><th>dept</th><th>avg_salary</th></tr><tr><td>Eng</td><td>103333</td></tr><tr><td>Sales</td><td>67500</td></tr></table>
  <p>A <strong>correlated subquery</strong> is a subquery that uses a column from the outer query. Because that column changes from row to row, the inner query (logically) runs again for every outer row, with that row's value plugged in.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher marks each student against <em>that student's</em> class average: for Priya in 9A she looks up the 9A average, for Rahul in 9B the 9B average. One lookup per student. A non-correlated subquery is one school-wide average, worked out once.</p>
  </div>
  <table class="tbl"><caption>Trace: the inner query, once per employee</caption>
    <tr><th>outer row e</th><th>e.dept plugged in</th><th>inner AVG</th><th>e.salary &gt; AVG?</th></tr>
    <tr><td>Ravi 120000</td><td>Eng</td><td>103333</td><td>yes → keep</td></tr>
    <tr><td>Sara 95000</td><td>Eng</td><td>103333</td><td>no</td></tr>
    <tr><td>Tom 95000</td><td>Eng</td><td>103333</td><td>no</td></tr>
    <tr><td>Uma 70000</td><td>Sales</td><td>67500</td><td>yes → keep</td></tr>
    <tr><td>Vik 65000</td><td>Sales</td><td>67500</td><td>no</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT e.name, e.dept, e.salary
FROM employees e
WHERE e.salary &gt; (SELECT AVG(x.salary)
                  FROM employees x
                  WHERE x.dept = e.dept)
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td></tr></table>
  <p>Two aliases make it work. <code>e</code> is the outer copy of employees, <code>x</code> the inner copy. The line <code>WHERE x.dept = e.dept</code> is the <em>correlation</em>: inside the brackets it reaches out and reads <code>e.dept</code> from the current outer row. Without different aliases, <code>dept = dept</code> would compare the inner row with itself and always be true.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <g font-size="10">
    <text x="85" y="14" text-anchor="middle" font-weight="bold">outer row e</text>
    <text x="395" y="14" text-anchor="middle" font-weight="bold">inner query, per row</text>
    <rect x="10" y="22" width="150" height="24" rx="4" class="fb"/><text x="18" y="38">Ravi · 120,000</text><line x1="160" y1="34" x2="318" y2="50" stroke="currentColor" opacity="0.6"/><text x="530" y="38" class="tg">✓ kept</text><rect x="10" y="54" width="150" height="24" rx="4" class="fb"/><text x="18" y="70">Sara · 95,000</text><line x1="160" y1="66" x2="318" y2="50" stroke="currentColor" opacity="0.6"/><text x="530" y="70" class="tr">✗ dropped</text><rect x="10" y="86" width="150" height="24" rx="4" class="fb"/><text x="18" y="102">Tom · 95,000</text><line x1="160" y1="98" x2="318" y2="50" stroke="currentColor" opacity="0.6"/><text x="530" y="102" class="tr">✗ dropped</text><rect x="10" y="118" width="150" height="24" rx="4" class="fv"/><text x="18" y="134">Uma · 70,000</text><line x1="160" y1="130" x2="318" y2="140" stroke="currentColor" opacity="0.6"/><text x="530" y="134" class="tg">✓ kept</text><rect x="10" y="150" width="150" height="24" rx="4" class="fv"/><text x="18" y="166">Vik · 65,000</text><line x1="160" y1="162" x2="318" y2="140" stroke="currentColor" opacity="0.6"/><text x="530" y="166" class="tr">✗ dropped</text>
    <rect x="320" y="30" width="190" height="40" rx="6" class="fb sb"/><text x="415" y="47" text-anchor="middle">AVG where dept = 'Eng'</text><text x="415" y="62" text-anchor="middle" font-weight="bold">103,333</text>
    <rect x="320" y="120" width="190" height="40" rx="6" class="fv"/><text x="415" y="137" text-anchor="middle">AVG where dept = 'Sales'</text><text x="415" y="152" text-anchor="middle" font-weight="bold">67,500</text>
    </g>
  </svg><figcaption>Each outer row plugs its own <code>e.dept</code> into the inner query and is compared with that result.</figcaption></figure>
  <p>Correlated subqueries also work in SELECT, to attach a per-row number such as each customer's order count:</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id) AS n_orders
FROM customers c
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>n_orders</th></tr><tr><td>Asha</td><td>2</td></tr><tr><td>Ben</td><td>1</td></tr><tr><td>Chen</td><td>2</td></tr><tr><td>Dia</td><td>0</td></tr></table>
  <p>Dia gets 0, not NULL, because COUNT of no rows is 0. Note how different that is from the scalar lookup in section 01, which returned NULL for her.</p>
  <h3>The faster rewrite</h3>
  <p>"Re-run per row" is fine for 5 employees and slow for 5 million. The same answer comes from computing each department's average once, then joining:</p>
  <div class="fx" data-lang="sql">WITH dept_avg AS (
  SELECT dept, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY dept
)
SELECT e.name, e.dept, e.salary
FROM employees e
JOIN dept_avg d ON d.dept = e.dept
WHERE e.salary &gt; d.avg_salary
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td></tr></table>
  <p><code>dept_avg</code> has 2 rows. Each employee joins to exactly one of them, and the WHERE compares. Same result, but the averages are computed once. A window function (<code>AVG(salary) OVER (PARTITION BY dept)</code>, see <a class="xref" data-note="sql_windows">Window Functions</a>) is a third way.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Correlated subquery</strong>: an inner query that references a column of the outer query, so its result depends on the current outer row. <strong>Non-correlated</strong>: self-contained, can run once on its own.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>PostgreSQL rewrites correlated <code>EXISTS</code> / <code>IN</code> into joins automatically, but a correlated <em>scalar</em> subquery in SELECT or WHERE usually does run once per outer row. On large tables, check <code>EXPLAIN</code> and rewrite as a join to an aggregate.</p>
  </div>

  <h2 id="sq-exists"><span class="num">03</span>EXISTS vs IN vs JOIN</h2>
  <p>"Which customers have a delivered order?" can be written three ways. They look interchangeable, and they are not: they differ on duplicates and on NULLs. Interviewers ask exactly this comparison.</p>
  <table class="tbl"><caption>orders</caption><tr><th>order_id</th><th>customer_id</th><th>order_date</th><th>status</th></tr><tr><td>100</td><td>1</td><td>2024-05-01</td><td>delivered</td></tr><tr><td>101</td><td>1</td><td>2024-05-20</td><td>delivered</td></tr><tr><td>102</td><td>2</td><td>2024-06-02</td><td>cancelled</td></tr><tr><td>103</td><td>3</td><td>2024-06-15</td><td>delivered</td></tr><tr><td>104</td><td>3</td><td>2024-07-01</td><td>pending</td></tr></table>
  <p>Way 1, a JOIN:</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'delivered'
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr></table>
  <p>Asha appears twice. A JOIN returns one row per <em>matching pair</em> (Asha × order 100, Asha × order 101). If the next step counts customers, it says 3 instead of 2.</p>
  <p>Way 2, EXISTS. For each customer, the inner query asks "is there at least one delivered order for this customer?" It only answers yes or no.</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.customer_id
                AND o.status = 'delivered')
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr></table>
  <p>Way 3, IN, which checks membership in a list of ids:</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE c.customer_id IN (SELECT o.customer_id FROM orders o
                        WHERE o.status = 'delivered')
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr></table>
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
  <table class="tbl out"><caption>Plan for the EXISTS query</caption><tr><th>QUERY PLAN</th></tr><tr><td>Hash Semi Join</td></tr><tr><td>  Hash Cond: (c.customer_id = o.customer_id)</td></tr><tr><td>  -&gt;  Seq Scan on customers c</td></tr><tr><td>  -&gt;  Hash</td></tr><tr><td>        -&gt;  Seq Scan on orders o</td></tr><tr><td>              Filter: (status = 'delivered'::text)</td></tr></table>
  <p><code>Hash Semi Join</code>: the optimizer turned the correlated EXISTS into a join that stops at the first match per customer. The IN version produces the same plan. So choose by meaning, not by folklore about speed.</p>
  <table class="tbl">
    <tr><th></th><th>JOIN</th><th>IN (subquery)</th><th>EXISTS</th></tr>
    <tr><td>Duplicates</td><td>Yes, one per match</td><td>No</td><td>No</td></tr>
    <tr><td>Can return inner columns</td><td>Yes</td><td>No</td><td>No</td></tr>
    <tr><td>Negated, with NULLs in inner</td><td>LEFT JOIN … IS NULL: safe</td><td><code>NOT IN</code>: <strong>broken</strong></td><td><code>NOT EXISTS</code>: safe</td></tr>
  </table>
  <h3>The NOT IN trap</h3>
  <p>"Employees who manage nobody": emp_id not in the list of manager_ids. That list contains Ravi's NULL.</p>
  <div class="fx" data-lang="sql">SELECT name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees);</div>
  <table class="tbl out"><caption>Result: 0 rows</caption><tr><th>name</th></tr></table>
  <p>For Sara: <code>2 NOT IN (NULL, 1, 1, 1, 4)</code> expands to <code>2 &lt;&gt; NULL AND 2 &lt;&gt; 1 AND …</code>. Any comparison with NULL is UNKNOWN, so the whole AND is UNKNOWN, and WHERE drops it. Every employee is dropped. NOT EXISTS has no such problem, because it only asks whether a matching row exists:</p>
  <div class="fx" data-lang="sql">SELECT e.name FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.emp_id)
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Sara</td></tr><tr><td>Tom</td></tr><tr><td>Vik</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Semi join</strong>: keep a left row once if any right row matches (IN, EXISTS). <strong>Anti join</strong>: keep a left row only if no right row matches (NOT EXISTS). Both stop scanning at the first match.</p>
  </div>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Need columns from the other table: <strong>JOIN</strong>. Just filtering: <strong>EXISTS</strong> or <strong>IN</strong>. Anti-filter: always <strong>NOT EXISTS</strong>.</p>
  </div>

  <h2 id="sq-cte"><span class="num">04</span>CTEs (WITH)</h2>
  <p>Question: "which customers spend more than the average customer?" (ignoring cancelled orders). It needs three steps: total each order, total each customer, compare with the average customer. Written with nested subqueries it becomes this, and it works:</p>
  <div class="fx" data-lang="sql">SELECT c.name, cs.spend
FROM (SELECT customer_id, SUM(total) AS spend
      FROM (SELECT o.order_id, o.customer_id, SUM(oi.qty * oi.unit_price) AS total
            FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
            WHERE o.status &lt;&gt; 'cancelled'
            GROUP BY o.order_id, o.customer_id) ot
      GROUP BY customer_id) cs
JOIN customers c USING (customer_id)
WHERE cs.spend &gt; (SELECT AVG(spend)
                  FROM (SELECT customer_id, SUM(total) AS spend
                        FROM (SELECT o.order_id, o.customer_id, SUM(oi.qty * oi.unit_price) AS total
                              FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
                              WHERE o.status &lt;&gt; 'cancelled'
                              GROUP BY o.order_id, o.customer_id) ot
                        GROUP BY customer_id) cs2);</div>
  <p>But it reads inside-out, and the customer-spend step is written twice, once for the list and once for the average. Any change must be made in two places.</p>
  <p>A <strong>CTE</strong> (Common Table Expression) gives each step a name, at the top, with <code>WITH name AS (…)</code>. Later steps and the final SELECT can use the names like tables. The query then reads top-down like a recipe.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe card for pav bhaji. "1. Boil the vegetables. 2. Make the masala. 3. Mash step 1 into step 2." Each step has a name and is used later. Nested subqueries are the same recipe written as one sentence full of brackets.</p>
  </div>
  <p>Step 1, <code>order_totals</code>, one row per non-cancelled order:</p>
  <table class="tbl out"><caption>order_totals</caption><tr><th>order_id</th><th>customer_id</th><th>total</th></tr><tr><td>100</td><td>1</td><td>880.00</td></tr><tr><td>101</td><td>1</td><td>500.00</td></tr><tr><td>103</td><td>3</td><td>1150.00</td></tr><tr><td>104</td><td>3</td><td>120.00</td></tr></table>
  <p>Step 2, <code>customer_spend</code>, adds those up per customer: Asha 880 + 500, Chen 1150 + 120. Ben's only order was cancelled, so he has no row.</p>
  <table class="tbl out"><caption>customer_spend</caption><tr><th>customer_id</th><th>spend</th></tr><tr><td>1</td><td>1380.00</td></tr><tr><td>3</td><td>1270.00</td></tr></table>
  <p>Step 3 compares each spend with the average spend, (1380 + 1270) / 2 = 1325. The full query:</p>
  <div class="fx" data-lang="sql">WITH order_totals AS (
  SELECT o.order_id, o.customer_id, SUM(oi.qty * oi.unit_price) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY o.order_id, o.customer_id
),
customer_spend AS (                       -- step 2 reads step 1
  SELECT customer_id, SUM(total) AS spend
  FROM order_totals
  GROUP BY customer_id
)
SELECT c.name, cs.spend
FROM customer_spend cs
JOIN customers c USING (customer_id)
WHERE cs.spend &gt; (SELECT AVG(spend) FROM customer_spend);   -- step 2 reused</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th></tr><tr><td>Asha</td><td>1380.00</td></tr></table>
  <p>Read it top-down. <code>WITH order_totals AS (…)</code> defines step 1. The comma starts the next CTE, <code>customer_spend</code>, which reads <code>FROM order_totals</code>. The final SELECT uses <code>customer_spend</code> twice: once to list customers, once inside <code>(SELECT AVG(spend) FROM customer_spend)</code>. Only Asha (1380 &gt; 1325) passes. Same answer as the nested version, half the reading effort.</p>
  <h3>Is a CTE computed once, or pasted in?</h3>
  <p>In PostgreSQL 12 and later, a CTE used <strong>once</strong> is inlined: the planner pastes it into the main query and optimises everything together. A CTE used <strong>twice or more</strong> is <strong>materialised</strong>: computed once and stored for reuse. You can force either with <code>AS MATERIALIZED</code> / <code>AS NOT MATERIALIZED</code>. Watch the plan change:</p>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
WITH t AS (SELECT * FROM orders)
SELECT * FROM t WHERE order_id = 100;</div>
  <table class="tbl out"><caption>Default: inlined, the filter reaches the index</caption><tr><th>QUERY PLAN</th></tr><tr><td>Index Scan using orders_pkey on orders</td></tr><tr><td>  Index Cond: (order_id = 100)</td></tr></table>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
WITH t AS MATERIALIZED (SELECT * FROM orders)
SELECT * FROM t WHERE order_id = 100;</div>
  <table class="tbl out"><caption>AS MATERIALIZED: whole table read first, filtered after</caption><tr><th>QUERY PLAN</th></tr><tr><td>CTE Scan on t</td></tr><tr><td>  Filter: (order_id = 100)</td></tr><tr><td>  CTE t</td></tr><tr><td>    -&gt;  Seq Scan on orders</td></tr></table>
  <p>In the first plan the <code>order_id = 100</code> filter was pushed into the CTE and used the primary-key index. In the second, the CTE is a fence: all of <code>orders</code> is scanned into a temporary result, and only then filtered.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>CTE</strong>: a named, temporary result defined with <code>WITH</code> that exists only for one statement. <strong>Materialised</strong>: computed once and stored. <strong>Inlined</strong>: merged into the outer query as if written in place.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"CTEs are slow" was true in PostgreSQL 11 and earlier, where every CTE was materialised. Some other engines re-compute a CTE each time it is referenced. Do not guess; read the plan.</p>
  </div>

  <h2 id="sq-rec"><span class="num">05</span>Recursive CTEs</h2>
  <p>"Show Vik's full chain of managers up to the CEO." One self-join gives his manager (Uma). Two self-joins give Uma's manager (Ravi). But a real company has unknown depth: you cannot write the right number of joins in advance. You need a query that keeps going until there is nothing left.</p>
  <p>A <strong>recursive CTE</strong> refers to itself. It has two parts joined by <code>UNION ALL</code>: an <strong>anchor</strong> (the starting rows) and a <strong>recursive step</strong> (a query that reads the rows found in the previous round and finds the next ones). It repeats the step until a round returns no rows.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking up the ladder in a government office. Ask Vik "who is your boss?": Uma. Ask Uma: Ravi. Ask Ravi: nobody. Stop. Each question uses the answer to the previous one.</p>
  </div>
  <p>Start with the simplest one, counting to 5, to see the mechanics:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE n AS (
  SELECT 1 AS i
  UNION ALL
  SELECT i + 1 FROM n WHERE i &lt; 5
)
SELECT i FROM n;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>i</th></tr><tr><td>1</td></tr><tr><td>2</td></tr><tr><td>3</td></tr><tr><td>4</td></tr><tr><td>5</td></tr></table>
  <p>Round 0, the anchor, gives 1. Each round feeds the previous round's row into the step: 1 → 2 → … → 5. When i = 5, <code>WHERE i &lt; 5</code> is false, the step returns nothing, and recursion stops. All rounds are stacked into the result.</p>
  <h3>Walking up a hierarchy</h3>
  <table class="tbl"><caption>Trace: rounds of the chain CTE</caption>
    <tr><th>round</th><th>input (previous round)</th><th>step finds e.emp_id = c.manager_id</th><th>new row</th></tr>
    <tr><td>anchor</td><td>—</td><td>emp_id = 5</td><td>Vik, manager 4, level 1</td></tr>
    <tr><td>1</td><td>Vik (manager 4)</td><td>emp_id 4</td><td>Uma, manager 1, level 2</td></tr>
    <tr><td>2</td><td>Uma (manager 1)</td><td>emp_id 1</td><td>Ravi, manager NULL, level 3</td></tr>
    <tr><td>3</td><td>Ravi (manager NULL)</td><td>emp_id = NULL matches nothing</td><td>none → stop</td></tr>
  </table>
  <div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT emp_id, name, manager_id, 1 AS level          -- anchor
  FROM employees
  WHERE emp_id = 5
  UNION ALL
  SELECT e.emp_id, e.name, e.manager_id, c.level + 1   -- step
  FROM employees e
  JOIN chain c ON e.emp_id = c.manager_id
)
SELECT name, manager_id, level FROM chain;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>manager_id</th><th>level</th></tr><tr><td>Vik</td><td>4</td><td>1</td></tr><tr><td>Uma</td><td>1</td><td>2</td></tr><tr><td>Ravi</td><td>NULL</td><td>3</td></tr></table>
  <p>In the step, <code>chain c</code> means "the rows produced in the previous round", not the whole result so far. <code>c.level + 1</code> counts the depth.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="sq-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="65" y="16" text-anchor="middle" class="tm">anchor</text>
    <rect x="15" y="26" width="100" height="44" rx="6" class="fb sb"/><text x="65" y="44" text-anchor="middle" font-weight="bold">Vik</text><text x="65" y="60" text-anchor="middle" class="tm">level 1, mgr 4</text>
    <text x="205" y="16" text-anchor="middle" class="tm">step 1</text>
    <rect x="155" y="26" width="100" height="44" rx="6" class="fv"/><text x="205" y="44" text-anchor="middle" font-weight="bold">Uma</text><text x="205" y="60" text-anchor="middle" class="tm">level 2, mgr 1</text>
    <text x="345" y="16" text-anchor="middle" class="tm">step 2</text>
    <rect x="295" y="26" width="100" height="44" rx="6" class="fv"/><text x="345" y="44" text-anchor="middle" font-weight="bold">Ravi</text><text x="345" y="60" text-anchor="middle" class="tm">level 3, no mgr</text>
    <text x="485" y="16" text-anchor="middle" class="tm">step 3</text>
    <rect x="435" y="26" width="100" height="44" rx="6" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="485" y="44" text-anchor="middle" class="tr">0 rows</text><text x="485" y="60" text-anchor="middle" class="tm">→ stop</text>
    <g stroke="currentColor" marker-end="url(#sq-ar1)"><line x1="115" y1="48" x2="153" y2="48"/><line x1="255" y1="48" x2="293" y2="48"/><line x1="395" y1="48" x2="433" y2="48"/></g>
    <text x="300" y="94" text-anchor="middle" class="tm">each step joins employees to the rows found by the previous step: e.emp_id = c.manager_id</text>
    <text x="65" y="122" text-anchor="middle" font-weight="bold">UNION ALL</text>
    <rect x="130" y="108" width="130" height="22" rx="3" class="fb"/><text x="140" y="123">Vik · 1</text>
    <rect x="130" y="132" width="130" height="22" rx="3" class="fv"/><text x="140" y="147">Uma · 2</text>
    <rect x="130" y="156" width="130" height="22" rx="3" class="fv"/><text x="140" y="171">Ravi · 3</text>
    <text x="280" y="147" class="tm">= final result</text>
    </g>
  </svg><figcaption>Anchor gives the first rows; the step repeats on the newest rows until it finds none; all rounds are stacked.</figcaption></figure>
  <h3>Walking down: the whole org chart</h3>
  <p>Flip the join to go downwards: start at the person with no manager and repeatedly find employees whose <code>manager_id</code> is someone already found. A text <code>path</code> column records the route.</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE tree AS (
  SELECT emp_id, name, 1 AS depth, name::text AS path
  FROM employees
  WHERE manager_id IS NULL                              -- start at the top
  UNION ALL
  SELECT e.emp_id, e.name, t.depth + 1, t.path || ' &gt; ' || e.name
  FROM employees e
  JOIN tree t ON e.manager_id = t.emp_id                -- go one level down
)
SELECT name, depth, path FROM tree ORDER BY path;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>depth</th><th>path</th></tr><tr><td>Ravi</td><td>1</td><td>Ravi</td></tr><tr><td>Sara</td><td>2</td><td>Ravi &gt; Sara</td></tr><tr><td>Tom</td><td>2</td><td>Ravi &gt; Tom</td></tr><tr><td>Uma</td><td>2</td><td>Ravi &gt; Uma</td></tr><tr><td>Vik</td><td>3</td><td>Ravi &gt; Uma &gt; Vik</td></tr></table>
  <p>Round 1 finds Ravi's three reports, round 2 finds Uma's report Vik, round 3 finds nobody. Sorting by <code>path</code> prints the tree in reading order. This is how category trees, folder structures and referral chains are queried.</p>
  <h3>Generating a calendar</h3>
  <p>A monthly report must show months with zero orders too, but GROUP BY only produces months that have rows. Generate the months, then LEFT JOIN the data:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE months AS (
  SELECT DATE '2024-04-01' AS m
  UNION ALL
  SELECT (m + INTERVAL '1 month')::date
  FROM months
  WHERE m &lt; DATE '2024-08-01'
)
SELECT m.m AS month, COUNT(o.order_id) AS orders
FROM months m
LEFT JOIN orders o ON DATE_TRUNC('month', o.order_date) = m.m
GROUP BY m.m
ORDER BY m.m;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>orders</th></tr><tr><td>2024-04-01</td><td>0</td></tr><tr><td>2024-05-01</td><td>2</td></tr><tr><td>2024-06-01</td><td>2</td></tr><tr><td>2024-07-01</td><td>1</td></tr><tr><td>2024-08-01</td><td>0</td></tr></table>
  <p>The anchor gives April; each round adds one month while <code>m &lt; '2024-08-01'</code>. <code>COUNT(o.order_id)</code> counts only real matches, so April and August show 0. In PostgreSQL the calendar part is one function call:</p>
  <div class="fx" data-lang="sql">SELECT m::date AS month
FROM generate_series(DATE '2024-04-01', DATE '2024-08-01', INTERVAL '1 month') AS m;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th></tr><tr><td>2024-04-01</td></tr><tr><td>2024-05-01</td></tr><tr><td>2024-06-01</td></tr><tr><td>2024-07-01</td></tr><tr><td>2024-08-01</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Recursive CTE</strong>: <code>WITH RECURSIVE name AS (anchor UNION ALL step)</code>, where the step references <code>name</code>. Evaluation repeats the step on the previous round's rows until a round is empty.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>No stop condition, or a cycle in the data (A manages B, B manages A), means infinite recursion. Always have a WHERE that ends it (a depth limit is a cheap guard). For graphs, carry the visited ids in an array and skip repeats, or use PostgreSQL 14's <code>CYCLE</code> clause.</p>
  </div>

  <h2 id="sq-lat"><span class="num">06</span>LATERAL</h2>
  <p>"Each customer's 2 most recent orders." The natural idea is a derived table that sorts a customer's orders and takes 2. But a normal subquery in FROM cannot see the other tables in the same FROM, so it cannot know "this customer":</p>
  <div class="fx" data-lang="sql">SELECT c.name, t.order_id
FROM customers c
JOIN (SELECT o.order_id FROM orders o
      WHERE o.customer_id = c.customer_id
      ORDER BY o.order_date DESC LIMIT 2) AS t ON true;</div>
  <div class="fx" data-lang="text">ERROR:  invalid reference to FROM-clause entry for table "c"
HINT:  To reference that table, you must mark this subquery with LATERAL.</div>
  <p>The error message names the fix. <strong>LATERAL</strong> before a FROM-subquery allows it to use columns of tables listed earlier. It then runs once per row of those tables, like a for-each loop.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank clerk goes down the list of account holders and, for each one, pulls out that person's last two passbook entries. The "pull out" step depends on whose turn it is. That per-person step is LATERAL.</p>
  </div>
  <table class="tbl"><caption>Trace: the LATERAL subquery, once per customer</caption>
    <tr><th>customer c</th><th>orders sorted by date DESC</th><th>LIMIT 2 keeps</th></tr>
    <tr><td>Asha (1)</td><td>101 (05-20), 100 (05-01)</td><td>101, 100</td></tr>
    <tr><td>Ben (2)</td><td>102</td><td>102</td></tr>
    <tr><td>Chen (3)</td><td>104 (07-01), 103 (06-15)</td><td>104, 103</td></tr>
    <tr><td>Dia (4)</td><td>none</td><td>nothing</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT c.name, t.order_id, t.order_date
FROM customers c
CROSS JOIN LATERAL (
  SELECT o.order_id, o.order_date
  FROM orders o
  WHERE o.customer_id = c.customer_id      -- uses c from outside
  ORDER BY o.order_date DESC
  LIMIT 2
) AS t
ORDER BY c.name, t.order_date DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>order_date</th></tr><tr><td>Asha</td><td>101</td><td>2024-05-20</td></tr><tr><td>Asha</td><td>100</td><td>2024-05-01</td></tr><tr><td>Ben</td><td>102</td><td>2024-06-02</td></tr><tr><td>Chen</td><td>104</td><td>2024-07-01</td></tr><tr><td>Chen</td><td>103</td><td>2024-06-15</td></tr></table>
  <p><code>WHERE o.customer_id = c.customer_id</code> reaches out to the current customer. <code>ORDER BY … DESC LIMIT 2</code> picks the newest two for that customer only. <code>CROSS JOIN LATERAL</code> pairs each customer with whatever the subquery returned, so Dia, who got nothing, disappears.</p>
  <p>To keep customers with no orders, use <code>LEFT JOIN LATERAL … ON true</code>. <code>ON true</code> means "no extra condition": every row the subquery returned is a match, and an empty result gives a NULL-padded row.</p>
  <div class="fx" data-lang="sql">SELECT c.name, t.order_id, t.order_date
FROM customers c
LEFT JOIN LATERAL (
  SELECT o.order_id, o.order_date
  FROM orders o
  WHERE o.customer_id = c.customer_id
  ORDER BY o.order_date DESC
  LIMIT 1
) AS t ON true
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Latest order per customer, Dia kept</caption><tr><th>name</th><th>order_id</th><th>order_date</th></tr><tr><td>Asha</td><td>101</td><td>2024-05-20</td></tr><tr><td>Ben</td><td>102</td><td>2024-06-02</td></tr><tr><td>Chen</td><td>104</td><td>2024-07-01</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LATERAL</strong>: a keyword that lets a FROM-subquery (or function call) reference earlier FROM items, so it is evaluated per row. SQL Server spells it <code>CROSS APPLY</code> / <code>OUTER APPLY</code>.</p>
  </div>
  <div class="callout intu"><span class="label">LATERAL vs ROW_NUMBER()</span>
    <p>The other standard answer to top-N per group is <code>ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC)</code> and filter <code>rn &lt;= 2</code> (see <a class="xref" data-note="sql_windows">Window Functions</a>). With an index on <code>(customer_id, order_date)</code>, LATERAL does one tiny index lookup per customer, which wins when there are few customers and many orders. ROW_NUMBER reads everything once, which wins when you need most rows anyway.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>CROSS JOIN LATERAL</code> silently drops outer rows whose subquery is empty. If "every customer" is the requirement, it must be <code>LEFT JOIN LATERAL … ON true</code>.</p>
  </div>

  <h2 id="sq-set"><span class="num">07</span>Set Operations</h2>
  <p>A join puts tables side by side (more columns). Sometimes you need the opposite: put two results one under the other (more rows). "A mailing list of all customers and employees." "Customer ids that are in both the delivered list and the pending list." These are <strong>set operations</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two class attendance sheets. Staple one under the other: UNION ALL. Staple and strike out names written twice: UNION. Names on both sheets: INTERSECT. Names on sheet A but not on B: EXCEPT.</p>
  </div>
  <p>Our two inputs are customer ids from delivered orders (A) and from pending orders (B):</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered' ORDER BY 1;</div>
  <table class="tbl out"><caption>A: delivered</caption><tr><th>customer_id</th></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>3</td></tr></table>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'pending' ORDER BY 1;</div>
  <table class="tbl out"><caption>B: pending</caption><tr><th>customer_id</th></tr><tr><td>3</td></tr></table>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
UNION ALL
SELECT customer_id FROM orders WHERE status = 'pending'
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>3</td></tr><tr><td>3</td></tr></table>
  <p>UNION ALL just stacks: 3 rows + 1 row = 4 rows, duplicates kept. The single <code>ORDER BY 1</code> at the end sorts the combined result by column 1.</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
UNION
SELECT customer_id FROM orders WHERE status = 'pending'
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th></tr><tr><td>1</td></tr><tr><td>3</td></tr></table>
  <p>UNION stacks and then removes duplicate rows, leaving 1 and 3. Removing duplicates needs a sort or hash of the whole result, so UNION is slower.</p>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
INTERSECT
SELECT customer_id FROM orders WHERE status = 'pending';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th></tr><tr><td>3</td></tr></table>
  <div class="fx" data-lang="sql">SELECT customer_id FROM customers
EXCEPT
SELECT customer_id FROM orders;</div>
  <table class="tbl out"><caption>Customers with no orders</caption><tr><th>customer_id</th></tr><tr><td>4</td></tr></table>
  <p>INTERSECT keeps 3 (in both). EXCEPT keeps ids in the first result that are missing from the second: Dia (4). EXCEPT is another correct anti-join, and unlike NOT IN it treats NULLs as equal, so it is NULL-safe.</p>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <g font-size="11">
    <text x="15" y="24">A (delivered)</text><rect x="140" y="8" width="26" height="24" rx="4" class="fb sb"/><text x="153" y="24" text-anchor="middle">1</text><rect x="170" y="8" width="26" height="24" rx="4" class="fb sb"/><text x="183" y="24" text-anchor="middle">1</text><rect x="200" y="8" width="26" height="24" rx="4" class="fb sb"/><text x="213" y="24" text-anchor="middle">3</text>
    <text x="320" y="24">B (pending)</text><rect x="430" y="8" width="26" height="24" rx="4" class="fv"/><text x="443" y="24" text-anchor="middle">3</text>
    <line x1="10" y1="44" x2="590" y2="44" stroke="currentColor" opacity="0.3"/>
    <text x="15" y="76" font-weight="bold">A UNION ALL B</text><rect x="160" y="60" width="26" height="24" rx="4" class="fg"/><text x="173" y="76" text-anchor="middle">1</text><rect x="190" y="60" width="26" height="24" rx="4" class="fg"/><text x="203" y="76" text-anchor="middle">1</text><rect x="220" y="60" width="26" height="24" rx="4" class="fg"/><text x="233" y="76" text-anchor="middle">3</text><rect x="250" y="60" width="26" height="24" rx="4" class="fg"/><text x="263" y="76" text-anchor="middle">3</text><text x="300" y="76" class="tm">stack, keep all</text>
    <text x="15" y="106" font-weight="bold">A UNION B</text><rect x="160" y="90" width="26" height="24" rx="4" class="fg"/><text x="173" y="106" text-anchor="middle">1</text><rect x="190" y="90" width="26" height="24" rx="4" class="fg"/><text x="203" y="106" text-anchor="middle">3</text><text x="300" y="106" class="tm">stack, then dedupe</text>
    <text x="15" y="136" font-weight="bold">A INTERSECT B</text><rect x="160" y="120" width="26" height="24" rx="4" class="fg"/><text x="173" y="136" text-anchor="middle">3</text><text x="300" y="136" class="tm">in both</text>
    <text x="15" y="166" font-weight="bold">A EXCEPT B</text><rect x="160" y="150" width="26" height="24" rx="4" class="fg"/><text x="173" y="166" text-anchor="middle">1</text><text x="300" y="166" class="tm">in A, not in B</text>
    </g>
  </svg><figcaption>customer_ids from delivered (A) and pending (B) orders. Only UNION ALL keeps duplicates.</figcaption></figure>
  <p>The two queries must line up: same number of columns, compatible types, matched by <em>position</em>, not by name. Break the rules and you get:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, name FROM customers
UNION
SELECT customer_id FROM orders;</div>
  <div class="fx" data-lang="text">ERROR:  each UNION query must have the same number of columns</div>
  <div class="fx" data-lang="sql">SELECT name FROM customers
UNION
SELECT price FROM products;</div>
  <div class="fx" data-lang="text">ERROR:  UNION types text and numeric cannot be matched</div>
  <p>A common real use is combining similar rows from different tables with a label column saying where each came from. Column names come from the first query, so only the first needs <code>AS kind</code>:</p>
  <div class="fx" data-lang="sql">SELECT name, 'customer' AS kind FROM customers
UNION ALL
SELECT name, 'employee' FROM employees
ORDER BY kind, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>kind</th></tr><tr><td>Asha</td><td>customer</td></tr><tr><td>Ben</td><td>customer</td></tr><tr><td>Chen</td><td>customer</td></tr><tr><td>Dia</td><td>customer</td></tr><tr><td>Ravi</td><td>employee</td></tr><tr><td>Sara</td><td>employee</td></tr><tr><td>Tom</td><td>employee</td></tr><tr><td>Uma</td><td>employee</td></tr><tr><td>Vik</td><td>employee</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>UNION</strong>: rows in either result, duplicates removed. <strong>UNION ALL</strong>: rows in either, all kept. <strong>INTERSECT</strong>: rows in both. <strong>EXCEPT</strong> (Oracle: <code>MINUS</code>): rows in the first but not the second. INTERSECT and EXCEPT also have <code>ALL</code> forms that keep duplicates.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Default to <code>UNION ALL</code>. Plain <code>UNION</code> silently merges legitimate duplicates (two equal ₹40 sales become one) and adds a sort. Use UNION only when you really want distinct rows.</p>
  </div>

  <h2 id="sq-view"><span class="num">08</span>Views &amp; Materialized Views</h2>
  <p>The "order totals" query (join orders to items, group, sum) appears in many reports. Copy-pasting it means every copy must be fixed when the logic changes, and analysts keep getting the join slightly wrong. You want to write it once and let everyone use it like a table.</p>
  <p>A <strong>view</strong> is a saved query with a name. It stores no data. Each time you select from it, the database runs the saved query on the current tables. A <strong>materialized view</strong> stores the result of the query as real rows, which makes reading fast, but the rows do not change until you refresh them.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A view is a saved search on a shopping app: tap it and the search runs again, showing today's stock. A materialized view is a printed price list: instant to read, but it shows yesterday's prices until you print a new one.</p>
  </div>
  <div class="fx" data-lang="sql">CREATE VIEW order_totals AS
SELECT o.order_id, o.customer_id, o.status,
       SUM(oi.qty * oi.unit_price) AS total
FROM orders o
JOIN order_items oi USING (order_id)
GROUP BY o.order_id, o.customer_id, o.status;</div>
  <div class="fx" data-lang="sql">SELECT * FROM order_totals WHERE status = 'delivered' ORDER BY order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer_id</th><th>status</th><th>total</th></tr><tr><td>100</td><td>1</td><td>delivered</td><td>880.00</td></tr><tr><td>101</td><td>1</td><td>delivered</td><td>500.00</td></tr><tr><td>103</td><td>3</td><td>delivered</td><td>1150.00</td></tr></table>
  <p>After <code>CREATE VIEW</code>, <code>order_totals</code> can be used in FROM like any table, with WHERE, joins and all. Behind the scenes PostgreSQL pastes the view's query in, so a view is never faster than the query itself. Its value is reuse, simpler queries for analysts, and security: you can grant access to a view that hides sensitive columns.</p>
  <h3>Materialized view: fast but stale</h3>
  <p>Steps traced in a copy of the database: build a materialized view of daily revenue, add a new ₹800 order on 2024-07-01, read the view, refresh it, read again.</p>
  <div class="fx" data-lang="sql">CREATE MATERIALIZED VIEW daily_revenue AS
SELECT o.order_date, SUM(oi.qty * oi.unit_price) AS revenue
FROM orders o
JOIN order_items oi USING (order_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY o.order_date;</div>
  <table class="tbl out"><caption>daily_revenue right after creation</caption><tr><th>order_date</th><th>revenue</th></tr><tr><td>2024-05-01</td><td>880.00</td></tr><tr><td>2024-05-20</td><td>500.00</td></tr><tr><td>2024-06-15</td><td>1150.00</td></tr><tr><td>2024-07-01</td><td>120.00</td></tr></table>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES (105, 2, '2024-07-01', 'delivered');
INSERT INTO order_items VALUES (105, 10, 1, 800);</div>
  <div class="fx" data-lang="sql">SELECT * FROM daily_revenue WHERE order_date = '2024-07-01';</div>
  <table class="tbl out"><caption>Read again: still the old number</caption><tr><th>order_date</th><th>revenue</th></tr><tr><td>2024-07-01</td><td>120.00</td></tr></table>
  <p>The base tables now say 2024-07-01 earned 120 + 800 = 920, but the view still shows the stored 120. Nothing is wrong; it was never told to update.</p>
  <div class="fx" data-lang="sql">REFRESH MATERIALIZED VIEW daily_revenue;</div>
  <div class="fx" data-lang="sql">SELECT * FROM daily_revenue WHERE order_date = '2024-07-01';</div>
  <table class="tbl out"><caption>After REFRESH</caption><tr><th>order_date</th><th>revenue</th></tr><tr><td>2024-07-01</td><td>920.00</td></tr></table>
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
    <p>Plain <code>REFRESH</code> locks out readers while it rebuilds. <code>REFRESH MATERIALIZED VIEW CONCURRENTLY</code> does not, but needs a unique index on the view. PostgreSQL never refreshes on its own; schedule it (cron, Airflow).</p>
  </div>

  <h2 id="sq-func"><span class="num">09</span>Functions &amp; Stored Procedures</h2>
  <p>Sometimes the same calculation, like "how much has this customer spent, excluding cancelled orders", is needed in many queries and by several apps. Writing the logic once <em>inside the database</em> means every caller gets the same rule.</p>
  <p>A <strong>function</strong> takes inputs and returns a value (or a table), and can be called inside a SELECT like <code>ROUND()</code> or <code>UPPER()</code>. A <strong>stored procedure</strong> is called on its own with <code>CALL</code>; it performs work (updates, batch steps) rather than returning a value for a query.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A function is a calculator on the counter: anyone can punch in a customer id and read off a number, in the middle of their own work. A procedure is the closing-time routine the shop manager runs: count cash, mark old pending orders, lock the shutter.</p>
  </div>
  <div class="fx" data-lang="sql">CREATE FUNCTION customer_spend(cid int) RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(oi.qty * oi.unit_price), 0)
  FROM orders o
  JOIN order_items oi USING (order_id)
  WHERE o.customer_id = cid
    AND o.status &lt;&gt; 'cancelled'
$$;</div>
  <p>Line by line: <code>customer_spend(cid int)</code> takes one input. <code>RETURNS numeric</code> declares the output type. <code>LANGUAGE sql</code> means the body is plain SQL. <code>STABLE</code> promises it only reads data, so the planner can optimise calls. The body between <code>$$ … $$</code> uses <code>cid</code> where a value is needed. Now call it per customer:</p>
  <div class="fx" data-lang="sql">SELECT name, customer_spend(customer_id) AS spend
FROM customers
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th></tr><tr><td>Asha</td><td>1380.00</td></tr><tr><td>Ben</td><td>0</td></tr><tr><td>Chen</td><td>1270.00</td></tr><tr><td>Dia</td><td>0</td></tr></table>
  <p>Ben's only order is cancelled and Dia has none, so <code>COALESCE(SUM(…), 0)</code> turns their NULL into 0. Notice the function runs once per customer row: it is really a correlated subquery in disguise.</p>
  <h3>A procedure</h3>
  <p>A small nightly job: mark pending orders older than a cutoff date as expired.</p>
  <div class="fx" data-lang="sql">CREATE PROCEDURE expire_pending(cutoff date)
LANGUAGE sql AS $$
  UPDATE orders
  SET status = 'expired'
  WHERE status = 'pending' AND order_date &lt; cutoff;
$$;</div>
  <div class="fx" data-lang="sql">CALL expire_pending(DATE '2024-07-15');</div>
  <table class="tbl out"><caption>orders after the CALL</caption><tr><th>order_id</th><th>order_date</th><th>status</th></tr><tr><td>100</td><td>2024-05-01</td><td>delivered</td></tr><tr><td>101</td><td>2024-05-20</td><td>delivered</td></tr><tr><td>102</td><td>2024-06-02</td><td>cancelled</td></tr><tr><td>103</td><td>2024-06-15</td><td>delivered</td></tr><tr><td>104</td><td>2024-07-01</td><td>expired</td></tr></table>
  <p>Order 104 (pending, 2024-07-01) is older than 2024-07-15, so it became expired. Procedures (PostgreSQL 11+) may also run <code>COMMIT</code> between steps, so a long ETL job can save progress in chunks. Functions cannot commit.</p>
  <div class="cards">
    <div><b>Function</b><p>Returns a value or table; usable inside SELECT, WHERE, JOIN. No COMMIT inside.</p></div>
    <div><b>Procedure</b><p><code>CALL proc()</code>; does work; may <code>COMMIT</code> mid-way.</p><small>Batch jobs, ETL steps, maintenance</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>User-defined function (UDF)</strong>: named logic stored in the database that returns a result and can appear in expressions. <strong>Stored procedure</strong>: named logic invoked with CALL that may control transactions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Logic in the database is fast (no round trips) but harder to version, test and review than application code, and it ties you to one DBMS. A function called in SELECT over a million rows runs a million times; check the plan.</p>
  </div>

  <h2 id="sq-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>Most subquery bugs do not crash. They return a clean-looking wrong answer. These are the ones to check for before you trust a result.</p>
  <div class="callout trap"><span class="label">Trap: NOT IN with a nullable list</span>
    <p>One NULL in the subquery makes every NOT IN test UNKNOWN → 0 rows. Use NOT EXISTS, or filter <code>IS NOT NULL</code> inside.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scalar subquery returning many rows (or none)</span>
    <p>Two rows is a runtime error that may only appear once data grows. Zero rows silently becomes NULL. Make the inner query provably single-row (aggregate, primary-key filter, or <code>LIMIT 1</code> with an ORDER BY).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: averaging at the wrong level</span>
    <p><code>AVG(qty * unit_price)</code> over lines gave 400; the average order is 560. Aggregate to the level you mean first, in a derived table or CTE.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: correlated subquery without distinct aliases</span>
    <p><code>WHERE dept = dept</code> inside the subquery compares the inner row with itself. Alias both copies and write <code>x.dept = e.dept</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: JOIN when you meant EXISTS</span>
    <p>A join repeats the outer row for each match and inflates counts. For "has any", use EXISTS or IN.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: CROSS JOIN LATERAL for "every customer"</span>
    <p>Rows with an empty subquery vanish. Use LEFT JOIN LATERAL … ON true.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: UNION when you meant UNION ALL</span>
    <p>Real duplicate rows are merged and totals shrink. UNION ALL unless you want distinct rows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: recursive CTE without a guaranteed stop</span>
    <p>A cycle in the data loops forever. Add a depth limit or track visited ids.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading a materialized view as live data</span>
    <p>It shows the last refresh. Show "as of" time on dashboards and schedule refreshes.</p>
  </div>

  <h2 id="sq-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a correlated and a non-correlated subquery?</summary><div class="qa-body">Non-correlated runs once, independently (<code>SELECT AVG(price) FROM products</code>). Correlated references an outer column (<code>WHERE x.dept = e.dept</code>), so it is logically evaluated per outer row. Correlated can be slow on large tables unless the optimizer turns it into a join.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>WHERE price &gt; AVG(price)</code> fail, and what are two fixes?</summary><div class="qa-body">WHERE filters one row at a time, before any grouping, so aggregates are not allowed there ("aggregate functions are not allowed in WHERE"). Fix 1: scalar subquery <code>WHERE price &gt; (SELECT AVG(price) FROM products)</code>. Fix 2: compute <code>AVG(price) OVER ()</code> in a CTE and filter outside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: employees who earn more than their department's average.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT e.name, e.dept, e.salary
FROM employees e
WHERE e.salary &gt; (SELECT AVG(x.salary)
                  FROM employees x
                  WHERE x.dept = e.dept)
ORDER BY e.emp_id;</div>Returns Ravi and Uma. Alternatives: join to a <code>GROUP BY dept</code> CTE, or <code>AVG(salary) OVER (PARTITION BY dept)</code> in a CTE and filter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>SELECT name FROM employees WHERE emp_id NOT IN (SELECT manager_id FROM employees)</code> return, and why?</summary><div class="qa-body">Zero rows. Ravi's <code>manager_id</code> is NULL, so for every employee <code>emp_id &lt;&gt; NULL</code> is UNKNOWN, and WHERE drops UNKNOWN. Fix with <code>NOT EXISTS</code> or add <code>WHERE manager_id IS NOT NULL</code> inside. Correct answer: Sara, Tom, Vik.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EXISTS, IN or JOIN: which is fastest?</summary><div class="qa-body">In modern PostgreSQL, IN and EXISTS usually produce the same semi-join plan (the EXPLAIN above shows <code>Hash Semi Join</code>). Choose on meaning: JOIN when you need the other table's columns (beware duplicates), EXISTS/IN to filter, NOT EXISTS for anti-joins.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a CTE instead of a nested subquery? Is it slower?</summary><div class="qa-body">Readability (top-down named steps), reuse (reference a step twice without repeating it), and recursion. Since PostgreSQL 12, a single-use CTE is inlined, so performance is the same; a multi-use CTE is computed once. Before 12 every CTE was an optimisation fence. Force either way with <code>MATERIALIZED</code> / <code>NOT MATERIALIZED</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: Vik's full management chain up to the CEO. Why does it stop?</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT emp_id, name, manager_id, 1 AS level          -- anchor
  FROM employees
  WHERE emp_id = 5
  UNION ALL
  SELECT e.emp_id, e.name, e.manager_id, c.level + 1   -- step
  FROM employees e
  JOIN chain c ON e.emp_id = c.manager_id
)
SELECT name, manager_id, level FROM chain;</div>Vik 1, Uma 2, Ravi 3. In the fourth round Ravi's manager_id is NULL, <code>e.emp_id = NULL</code> matches no row, the round is empty, and recursion ends.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A monthly report skips months with no orders. How do you fix it?</summary><div class="qa-body">Generate the full calendar (recursive CTE or <code>generate_series</code>) and LEFT JOIN orders to it, using <code>COUNT(o.order_id)</code>, not <code>COUNT(*)</code>, so empty months show 0. In shop, April and August show 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: each customer's most recent order, keeping customers with none. Give two ways.</summary><div class="qa-body">LATERAL:<div class="fx" data-lang="sql">SELECT c.name, t.order_id, t.order_date
FROM customers c
LEFT JOIN LATERAL (
  SELECT o.order_id, o.order_date
  FROM orders o
  WHERE o.customer_id = c.customer_id
  ORDER BY o.order_date DESC
  LIMIT 1
) AS t ON true
ORDER BY c.customer_id;</div>Window function:<div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date
FROM (SELECT o.*,
             ROW_NUMBER() OVER (PARTITION BY customer_id
                                ORDER BY order_date DESC) AS rn
      FROM orders o) t
WHERE rn = 1
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th></tr><tr><td>1</td><td>101</td><td>2024-05-20</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td></tr></table>The ROW_NUMBER version drops Dia unless you LEFT JOIN its result back to customers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: customers who have never ordered, using a set operation.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT customer_id FROM customers
EXCEPT
SELECT customer_id FROM orders;</div>Returns 4 (Dia). EXCEPT treats NULLs as equal, so it is safe where NOT IN is not. To get names, use NOT EXISTS or join the result back to customers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>UNION vs UNION ALL: which is faster and when must you use each?</summary><div class="qa-body">UNION ALL is faster: it just appends. UNION must sort or hash everything to remove duplicates. Use UNION ALL by default (and always when duplicates are real data, like two equal sales); use UNION only when you need distinct rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>View vs materialized view: when would you use each?</summary><div class="qa-body">View: to simplify a complex join or restrict columns; always fresh, no speed gain. Materialized view: an expensive aggregate read often where some staleness is fine (dashboard KPIs); refresh on a schedule, and add a unique index to refresh <code>CONCURRENTLY</code> without blocking readers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Function vs stored procedure in PostgreSQL?</summary><div class="qa-body">A function returns a value or table and is used inside queries (<code>SELECT customer_spend(id)</code>); it cannot COMMIT. A procedure is invoked with <code>CALL</code>, returns nothing to a query, and can COMMIT or ROLLBACK between steps, which suits batch and ETL jobs.</div></details>
</main>
`
});
