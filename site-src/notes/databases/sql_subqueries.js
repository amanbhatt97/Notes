// notes/databases/sql_subqueries.js — Subqueries, CTEs & Views
Object.assign(TOPIC_CONTENT, {
  "sql_subqueries": `<main>
  <h1>Subqueries, CTEs &amp; Views</h1>
  <p class="lead">How to build a query out of smaller queries: nest them (subqueries), name them (CTEs), loop them (recursive CTEs) or save them (views). This is how real analytical SQL is written, and interviewers test the edge cases.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sq-where"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Subqueries by Position</span><span class="rm-sub">SELECT, WHERE, FROM</span></div></div>
      <div class="rm-item rm-done" data-target="sq-corr"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Correlated Subqueries</span><span class="rm-sub">Re-run per outer row</span></div></div>
      <div class="rm-item rm-done" data-target="sq-exists"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">EXISTS vs IN vs JOIN</span><span class="rm-sub">Duplicates, NULLs, speed</span></div></div>
      <div class="rm-item rm-done" data-target="sq-cte"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">CTEs (WITH)</span><span class="rm-sub">Name each step</span></div></div>
      <div class="rm-item rm-done" data-target="sq-rec"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Recursive CTEs</span><span class="rm-sub">Hierarchies and series</span></div></div>
      <div class="rm-item rm-done" data-target="sq-lat"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">LATERAL</span><span class="rm-sub">Top-N per group</span></div></div>
      <div class="rm-item rm-done" data-target="sq-set"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Set Operations</span><span class="rm-sub">UNION, INTERSECT, EXCEPT</span></div></div>
      <div class="rm-item rm-done" data-target="sq-view"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Views &amp; Materialized Views</span><span class="rm-sub">Saved queries vs saved results</span></div></div>
      <div class="rm-item rm-done" data-target="sq-func"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Functions &amp; Procedures</span><span class="rm-sub">Logic inside the DB</span></div></div>
      <div class="rm-item rm-done" data-target="sq-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="sq-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sq-where"><span class="num">01</span>Subqueries by Position</h2>
  <p>A <strong>subquery</strong> is a <code>SELECT</code> inside another statement, in brackets. Where it sits decides the shape it must return: one value in <code>SELECT</code>, a list in <code>WHERE … IN</code>, a whole table (with an alias) in <code>FROM</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking a colleague mid-task: "What's the average price?" (scalar). "Which customers had deliveries?" (a list). "Give me a summary sheet" (a derived table).</p>
  </div>
  <h3>Scalar subquery in SELECT</h3>
  <div class="fx" data-lang="sql">SELECT name, price,
       ROUND((SELECT AVG(price) FROM products), 2) AS avg_price
FROM products;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>price</th><th>avg_price</th></tr><tr><td>Laptop</td><td>800.00</td><td>372.50</td></tr><tr><td>Phone</td><td>500.00</td><td>372.50</td></tr><tr><td>Desk</td><td>150.00</td><td>372.50</td></tr><tr><td>Lamp</td><td>40.00</td><td>372.50</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A scalar subquery that returns two rows is a runtime error: <code>ERROR: more than one row returned by a subquery used as an expression</code>. Zero rows gives <code>NULL</code>, silently.</p>
  </div>
  <h3>IN in WHERE</h3>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'delivered');</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr></table>
  <h3>Derived table in FROM</h3>
  <p>Average order value needs two levels: sum per order, then average those sums. One <code>GROUP BY</code> can't do both.</p>
  <div class="fx" data-lang="sql">SELECT ROUND(AVG(order_total), 2) AS avg_order_value
FROM (SELECT order_id, SUM(qty * unit_price) AS order_total
      FROM order_items GROUP BY order_id) AS t;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>avg_order_value</th></tr><tr><td>560.00</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>AVG(qty * unit_price)</code> on <code>order_items</code> averages <em>line items</em>, not orders. "Average X per Y" almost always means aggregate to Y first.</p>
  </div>

  <h2 id="sq-corr"><span class="num">02</span>Correlated Subqueries</h2>
  <p>A <strong>correlated subquery</strong> references a column from the outer query, so it is logically re-run for every outer row.</p>
  <p>Use it when each row needs its <em>own</em> comparison: "earns more than <em>their</em> department's average".</p>
  <div class="fx" data-lang="sql">SELECT e.name, e.dept, e.salary
FROM employees e
WHERE e.salary &gt; (SELECT AVG(salary) FROM employees x
                  WHERE x.dept = e.dept);   -- e.dept comes from outside</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>dept</th><th>salary</th></tr><tr><td>Ravi</td><td>Eng</td><td>120000</td></tr><tr><td>Uma</td><td>Sales</td><td>70000</td></tr></table>
  <p>Eng's average is 103,333, so Sara and Tom (95,000) drop out. Sales' is 67,500.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher marking each student against <em>that student's</em> class average: one lookup per student. A non-correlated subquery is one school-wide average, computed once.</p>
  </div>
  <div class="callout intu"><span class="label">Cost</span>
    <p>Naively O(outer rows × inner work). Postgres rewrites <code>EXISTS</code>/<code>IN</code> forms into joins, but a correlated <em>scalar</em> subquery usually runs per row. On big tables, join to a pre-aggregated CTE or use <code>AVG(salary) OVER (PARTITION BY dept)</code>.</p>
  </div>

  <h2 id="sq-exists"><span class="num">03</span>EXISTS vs IN vs JOIN</h2>
  <p>All three answer "which customers have a delivered order?" They differ on duplicates and NULLs.</p>
  <div class="fx" data-lang="sql">SELECT c.name FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'delivered';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr></table>
  <p>Asha appears twice: the JOIN returns one row per <em>matching order</em>. <code>EXISTS</code> just checks "is there at least one?"</p>
  <div class="fx" data-lang="sql">SELECT c.name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o
              WHERE o.customer_id = c.customer_id AND o.status = 'delivered');</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr></table>
  <table class="tbl">
    <tr><th></th><th>JOIN</th><th>IN (subquery)</th><th>EXISTS</th></tr>
    <tr><td>Duplicates</td><td>Yes, one per match (fan-out)</td><td>No</td><td>No</td></tr>
    <tr><td>Can return inner columns</td><td>Yes</td><td>No</td><td>No</td></tr>
    <tr><td>Negated with NULLs in inner</td><td>Use LEFT JOIN … IS NULL: safe</td><td><code>NOT IN</code>: <strong>broken</strong></td><td><code>NOT EXISTS</code>: safe</td></tr>
    <tr><td>Performance (Postgres)</td><td colspan="3">Usually the same plan: IN/EXISTS become a <em>semi-join</em> (stop at first match). Pick for correctness, not speed.</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: NOT IN with a NULL</span>
    <p>Covered in <em>JOINs</em>. One NULL in the list makes <code>x NOT IN (…)</code> UNKNOWN for every row. "Employees who manage nobody" (Ravi's <code>manager_id</code> is NULL):</p>
  </div>
  <div class="fx" data-lang="sql">SELECT name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees);    -- 0 rows!

SELECT e.name FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.emp_id)
ORDER BY e.emp_id;                                         -- correct</div>
  <table class="tbl out"><caption>Result (NOT EXISTS)</caption><tr><th>name</th></tr><tr><td>Sara</td></tr><tr><td>Tom</td></tr><tr><td>Vik</td></tr></table>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Need columns from the other table: <strong>JOIN</strong>. Just filtering: <strong>EXISTS</strong> / <strong>IN</strong>. Anti-filter: always <strong>NOT EXISTS</strong>.</p>
  </div>

  <h2 id="sq-cte"><span class="num">04</span>CTEs (WITH)</h2>
  <p>A <strong>CTE</strong> (Common Table Expression) is a named, temporary result defined with <code>WITH</code> and used by the query that follows.</p>
  <p>Nested subqueries read inside-out and can't be reused. CTEs read top-down, one step per name, and each later step can use earlier ones.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe. "Make the dough. Make the sauce. Combine." Nested subqueries are the same recipe written as one sentence with brackets.</p>
  </div>
  <p>Customers who spend more than the average spender (cancelled orders excluded):</p>
  <div class="fx" data-lang="sql">WITH order_totals AS (
  SELECT o.order_id, o.customer_id, SUM(oi.qty * oi.unit_price) AS total
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY o.order_id, o.customer_id
),
customer_spend AS (                       -- uses the CTE above
  SELECT customer_id, SUM(total) AS spend
  FROM order_totals GROUP BY customer_id
)
SELECT c.name, cs.spend
FROM customer_spend cs JOIN customers c USING (customer_id)
WHERE cs.spend &gt; (SELECT AVG(spend) FROM customer_spend);  -- reused</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th></tr><tr><td>Asha</td><td>1380.00</td></tr></table>
  <p>Only Asha (1380) and Chen (1270) have spend (Ben's only order was cancelled); average 1325.</p>
  <h3>Are CTEs materialised?</h3>
  <ul>
    <li><strong>Postgres ≤ 11</strong>: always materialised (computed once, stored). An "optimisation fence": filters outside couldn't push in.</li>
    <li><strong>Postgres 12+</strong>: a CTE used <strong>once</strong>, with no side effects, is inlined like a subquery. Used <strong>twice or more</strong>, it is materialised.</li>
    <li>Override with <code>AS MATERIALIZED</code> or <code>AS NOT MATERIALIZED</code>.</li>
  </ul>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
WITH t AS (SELECT * FROM orders) SELECT * FROM t WHERE order_id = 100;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>QUERY PLAN</th></tr><tr><td>Index Scan using orders_pkey on orders</td></tr><tr><td>&nbsp;&nbsp;Index Cond: (order_id = 100)</td></tr></table>
  <p>Inlined: the filter reached the index. With <code>AS MATERIALIZED</code> the same query becomes <code>CTE Scan on t</code> over a <code>Seq Scan on orders</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"CTEs are slower than subqueries" was true before Postgres 12. In some other engines a CTE referenced twice is <em>computed</em> twice. Check the plan.</p>
  </div>

  <h2 id="sq-rec"><span class="num">05</span>Recursive CTEs</h2>
  <p>A <strong>recursive CTE</strong> refers to itself, so it can walk a hierarchy or generate rows until a condition stops it.</p>
  <div class="flow"><span>Anchor: starting rows</span><span>Recursive step: join to previous rows</span><span>Repeat until no new rows</span><span>UNION ALL of everything</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Climbing a ladder of "who's your boss?" Ask Vik, get Uma. Ask Uma, get Ravi. Ask Ravi, nobody: stop.</p>
  </div>
  <div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT emp_id, name, manager_id, 1 AS level      -- anchor
  FROM employees WHERE emp_id = 5
  UNION ALL
  SELECT e.emp_id, e.name, e.manager_id, c.level + 1   -- step
  FROM employees e JOIN chain c ON e.emp_id = c.manager_id
)
SELECT name, level FROM chain;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>level</th></tr><tr><td>Vik</td><td>1</td></tr><tr><td>Uma</td><td>2</td></tr><tr><td>Ravi</td><td>3</td></tr></table>
  <h3>Generating a date series</h3>
  <p>Reports need a row for every month, even months with zero orders. Generate the calendar, then <code>LEFT JOIN</code> the data.</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE months AS (
  SELECT DATE '2024-04-01' AS m
  UNION ALL
  SELECT (m + INTERVAL '1 month')::date FROM months WHERE m &lt; DATE '2024-08-01'
)
SELECT m.m AS month, COUNT(o.order_id) AS orders
FROM months m LEFT JOIN orders o ON date_trunc('month', o.order_date) = m.m
GROUP BY m.m ORDER BY m.m;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>orders</th></tr><tr><td>2024-04-01</td><td>0</td></tr><tr><td>2024-05-01</td><td>2</td></tr><tr><td>2024-06-01</td><td>2</td></tr><tr><td>2024-07-01</td><td>1</td></tr><tr><td>2024-08-01</td><td>0</td></tr></table>
  <p>In Postgres, <code>generate_series(DATE '2024-04-01', DATE '2024-08-01', INTERVAL '1 month')</code> does the same in one line. The recursive form works everywhere.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>No stop condition, or a cycle in the data (A manages B manages A), means infinite recursion. Always have a <code>WHERE</code> that ends it; for graphs, track visited ids in an array or use Postgres's <code>CYCLE</code> clause.</p>
  </div>

  <h2 id="sq-lat"><span class="num">06</span>LATERAL</h2>
  <p><strong>LATERAL</strong> lets a subquery in <code>FROM</code> reference columns of tables listed before it. It acts like a <code>for</code>-each loop: run this subquery once per outer row.</p>
  <p>Its main use is <strong>top-N per group</strong> with <code>ORDER BY … LIMIT N</code>, which a plain derived table can't do per row.</p>
  <div class="fx" data-lang="sql">-- Each customer's 2 most recent orders
SELECT c.name, t.order_id, t.order_date
FROM customers c
CROSS JOIN LATERAL (
  SELECT o.order_id, o.order_date FROM orders o
  WHERE o.customer_id = c.customer_id
  ORDER BY o.order_date DESC LIMIT 2
) t
ORDER BY c.name, t.order_date DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>order_date</th></tr><tr><td>Asha</td><td>101</td><td>2024-05-20</td></tr><tr><td>Asha</td><td>100</td><td>2024-05-01</td></tr><tr><td>Ben</td><td>102</td><td>2024-06-02</td></tr><tr><td>Chen</td><td>104</td><td>2024-07-01</td></tr><tr><td>Chen</td><td>103</td><td>2024-06-15</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>CROSS JOIN LATERAL</code> drops customers with no rows (Dia). Use <code>LEFT JOIN LATERAL (…) t ON true</code> to keep them with NULLs.</p>
  </div>
  <div class="callout intu"><span class="label">LATERAL vs ROW_NUMBER()</span>
    <p>With an index on <code>(customer_id, order_date)</code>, LATERAL does one tiny lookup per group. <code>ROW_NUMBER()</code> (see <em>Window Functions</em>) scans everything once. SQL Server calls it <code>CROSS APPLY</code>.</p>
  </div>

  <h2 id="sq-set"><span class="num">07</span>Set Operations</h2>
  <p>Set operations stack the results of two queries <em>vertically</em>. Joins combine tables <em>horizontally</em>.</p>
  <table class="tbl">
    <tr><th>Operator</th><th>Returns</th><th>Duplicates</th></tr>
    <tr><td><code>UNION</code></td><td>Rows in either</td><td>Removed (costs a sort/hash)</td></tr>
    <tr><td><code>UNION ALL</code></td><td>Rows in either</td><td>Kept; fastest</td></tr>
    <tr><td><code>INTERSECT</code></td><td>Rows in both</td><td>Removed (<code>ALL</code> variant exists)</td></tr>
    <tr><td><code>EXCEPT</code></td><td>Rows in first, not in second</td><td>Removed (Oracle calls it <code>MINUS</code>)</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
UNION ALL
SELECT customer_id FROM orders WHERE status = 'pending'
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result (UNION ALL; plain UNION gives just 1, 3)</caption><tr><th>customer_id</th></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>3</td></tr><tr><td>3</td></tr></table>
  <div class="fx" data-lang="sql">SELECT customer_id FROM orders WHERE status = 'delivered'
INTERSECT
SELECT customer_id FROM orders WHERE status = 'pending';   -- 3 (Chen)

SELECT customer_id FROM customers
EXCEPT
SELECT customer_id FROM orders;                            -- 4 (Dia)</div>
  <p><strong>Rules:</strong> same number of columns, compatible types, matched by <em>position</em> (not name). Column names come from the first query. One <code>ORDER BY</code> at the very end.</p>
  <p>Breaking them gives <code>ERROR: each UNION query must have the same number of columns</code> or <code>ERROR: UNION types text and numeric cannot be matched</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Default to <code>UNION ALL</code>. Plain <code>UNION</code> silently removes legitimate duplicates (two equal sales become one) and adds a sort. Note set operations treat NULLs as equal, unlike <code>=</code>.</p>
  </div>

  <h2 id="sq-view"><span class="num">08</span>Views &amp; Materialized Views</h2>
  <ul>
    <li><strong>View</strong>: a saved <em>query</em> with a name. No data stored; it re-runs every time, so it's always fresh.</li>
    <li><strong>Materialized view</strong>: a saved <em>result</em>. Fast to read, but stale until you refresh it.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A view is a bookmarked search: click it and the search runs again. A materialized view is a printed report: instant to read, but it shows yesterday's numbers until you reprint.</p>
  </div>
  <div class="fx" data-lang="sql">CREATE VIEW order_totals AS
SELECT o.order_id, o.customer_id, o.status, SUM(oi.qty * oi.unit_price) AS total
FROM orders o JOIN order_items oi USING (order_id)
GROUP BY o.order_id, o.customer_id, o.status;

SELECT * FROM order_totals WHERE status = 'delivered';  -- 100: 880, 101: 500, 103: 1150</div>
  <p>Staleness, shown in a copy of the DB: build a materialized view of daily revenue, then add a ₹800 order on 2024-07-01.</p>
  <div class="fx" data-lang="sql">CREATE MATERIALIZED VIEW daily_revenue AS
SELECT o.order_date, SUM(oi.qty * oi.unit_price) AS revenue
FROM orders o JOIN order_items oi USING (order_id)
WHERE o.status &lt;&gt; 'cancelled' GROUP BY o.order_date;

INSERT INTO orders VALUES (105, 2, '2024-07-01', 'delivered');
INSERT INTO order_items VALUES (105, 10, 1, 800);

SELECT * FROM daily_revenue WHERE order_date = '2024-07-01';  -- 120.00 (stale)
REFRESH MATERIALIZED VIEW daily_revenue;
SELECT * FROM daily_revenue WHERE order_date = '2024-07-01';  -- 920.00</div>
  <table class="tbl">
    <tr><th></th><th>View</th><th>Materialized view</th></tr>
    <tr><td>Stores data</td><td>No</td><td>Yes, can be indexed</td></tr>
    <tr><td>Freshness</td><td>Always current</td><td>As of last <code>REFRESH</code></td></tr>
    <tr><td>Read speed</td><td>Same as the underlying query</td><td>Fast: just reads a table</td></tr>
    <tr><td>Use for</td><td>Hiding complexity, security (expose some columns)</td><td>Expensive dashboard aggregates that can be minutes/hours old</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Plain <code>REFRESH</code> blocks reads while it rebuilds. <code>REFRESH … CONCURRENTLY</code> doesn't, but needs a unique index on the view. Postgres never refreshes automatically; schedule it (cron, Airflow).</p>
  </div>

  <h2 id="sq-func"><span class="num">09</span>Functions &amp; Stored Procedures</h2>
  <p>Named, reusable logic stored <em>in</em> the database.</p>
  <ul>
    <li><strong>Function</strong>: returns a value or table; callable inside a query. Can't commit transactions.</li>
    <li><strong>Procedure</strong> (<code>CALL proc()</code>, Postgres 11+): no return value needed; can <code>COMMIT</code> mid-way. Used for batch jobs and ETL steps.</li>
  </ul>
  <div class="fx" data-lang="sql">CREATE FUNCTION customer_spend(cid int) RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(oi.qty * oi.unit_price), 0)
  FROM orders o JOIN order_items oi USING (order_id)
  WHERE o.customer_id = cid AND o.status &lt;&gt; 'cancelled'
$$;

SELECT name, customer_spend(customer_id) AS spend FROM customers;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th></tr><tr><td>Asha</td><td>1380.00</td></tr><tr><td>Ben</td><td>0</td></tr><tr><td>Chen</td><td>1270.00</td></tr><tr><td>Dia</td><td>0</td></tr></table>
  <div class="callout intu"><span class="label">Trade-off</span>
    <p>Pros: logic next to the data, one round trip. Cons: harder to version and test, ties you to one DBMS. A function called per row is a hidden correlated subquery.</p>
  </div>

  <h2 id="sq-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Scalar subquery</strong>: one value; more than one row is an error, zero rows is NULL.</li>
    <li><strong>Derived table</strong> (subquery in FROM): needs an alias; use it to aggregate twice.</li>
    <li><strong>Correlated</strong> subquery references the outer row: logically runs per row; rewrite with a join or window when slow.</li>
    <li><strong>JOIN</strong> fans out duplicates; <strong>IN/EXISTS</strong> don't. Postgres plans IN/EXISTS as a semi-join.</li>
    <li><strong>NOT IN</strong> + one NULL = zero rows. Use <strong>NOT EXISTS</strong>.</li>
    <li><strong>CTEs</strong> name steps top-down; Postgres 12+ inlines single-use CTEs, materialises multi-use ones.</li>
    <li><strong>Recursive CTE</strong> = anchor UNION ALL step; for hierarchies and calendars; always ensure it terminates.</li>
    <li><strong>LATERAL</strong> = per-row subquery; the go-to for top-N per group with LIMIT. LEFT JOIN LATERAL … ON true keeps empties.</li>
    <li><strong>UNION</strong> dedupes (slower), <strong>UNION ALL</strong> keeps all; same column count, compatible types, by position.</li>
    <li><strong>View</strong> = saved query (fresh); <strong>materialized view</strong> = saved result (fast, stale until REFRESH).</li>
  </ol></div>

  <h2 id="sq-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between a correlated and a non-correlated subquery?</summary><div class="qa-body">Non-correlated runs once, independently (<code>SELECT AVG(price) FROM products</code>). Correlated references an outer column (<code>WHERE x.dept = e.dept</code>), so it's logically evaluated per outer row. Correlated can be slow on large tables unless the optimizer turns it into a join.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: employees who earn more than their department's average.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT name, dept, salary FROM employees e
WHERE salary &gt; (SELECT AVG(salary) FROM employees x WHERE x.dept = e.dept);</div>Returns Ravi and Uma. Alternative: compute <code>AVG(salary) OVER (PARTITION BY dept)</code> in a CTE and filter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>SELECT name FROM employees WHERE emp_id NOT IN (SELECT manager_id FROM employees)</code> return, and why?</summary><div class="qa-body">Zero rows. Ravi's <code>manager_id</code> is NULL, so for every employee <code>emp_id &lt;&gt; NULL</code> is UNKNOWN, and WHERE drops UNKNOWN. Fix with <code>NOT EXISTS</code> or add <code>WHERE manager_id IS NOT NULL</code> inside. Correct answer: Sara, Tom, Vik.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>EXISTS, IN or JOIN: which is fastest?</summary><div class="qa-body">In modern Postgres, IN and EXISTS usually produce the same semi-join plan, and a JOIN plus DISTINCT is similar. Choose on semantics: JOIN when you need the other table's columns (beware fan-out), EXISTS/IN to filter, NOT EXISTS for anti-joins. Old advice that "EXISTS is always faster" comes from older optimizers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use a CTE instead of a nested subquery? Is it slower?</summary><div class="qa-body">Readability (top-down named steps), reuse (reference a step twice), and recursion. Since Postgres 12, a single-use CTE is inlined, so performance is the same; a multi-use CTE is computed once and reused. Before 12 every CTE was an optimisation fence. Force either way with <code>MATERIALIZED</code> / <code>NOT MATERIALIZED</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: Vik's full management chain up to the CEO.</summary><div class="qa-body"><div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT emp_id, name, manager_id, 1 AS level FROM employees WHERE emp_id = 5
  UNION ALL
  SELECT e.emp_id, e.name, e.manager_id, c.level + 1
  FROM employees e JOIN chain c ON e.emp_id = c.manager_id
)
SELECT name, level FROM chain;   -- Vik 1, Uma 2, Ravi 3</div>It stops when Ravi's NULL manager joins to nothing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A monthly report skips months with no orders. How do you fix it?</summary><div class="qa-body">Generate the full calendar (recursive CTE or <code>generate_series</code>) and <code>LEFT JOIN</code> orders to it, using <code>COUNT(o.order_id)</code> (not <code>COUNT(*)</code>) so empty months show 0. Real output above: April and August show 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: each customer's most recent order, keeping customers with none.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT c.name, t.order_id, t.order_date
FROM customers c
LEFT JOIN LATERAL (
  SELECT order_id, order_date FROM orders o
  WHERE o.customer_id = c.customer_id
  ORDER BY order_date DESC LIMIT 1
) t ON true;</div>Asha 101, Ben 102, Chen 104, Dia NULL. A <code>ROW_NUMBER()</code> CTE with <code>rn = 1</code> also works (but drops Dia unless left-joined).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: customers who have never ordered, using a set operation.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT customer_id FROM customers
EXCEPT
SELECT customer_id FROM orders;   -- 4 (Dia)</div>EXCEPT is NULL-safe (NULLs compare equal), unlike NOT IN. To get names, wrap it or use NOT EXISTS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>View vs materialized view: when would you use each?</summary><div class="qa-body">View: to simplify a complex join or restrict columns for security; always fresh, no speed gain. Materialized view: an expensive aggregate read often where some staleness is acceptable (dashboard KPIs); refresh on a schedule, add a unique index to refresh <code>CONCURRENTLY</code> without blocking readers.</div></details>

</main>`
});
