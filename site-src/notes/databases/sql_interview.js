// notes/databases/sql_interview.js — Practice Q&A
Object.assign(TOPIC_CONTENT, {
  "sql_interview": `<main>
  <h1>Practice Q&amp;A</h1>
  <p class="lead">Interview-style SQL problems on the <code>shop</code> database, each with a working query, its real output and the idea behind it. Try each one before opening it.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="si-how"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How to Approach a Question</span><span class="rm-sub">Grain, tables, CTEs, edge cases</span></div></div>
      <div class="rm-item rm-done" data-target="si-agg"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Basics &amp; Aggregation</span><span class="rm-sub">Nth salary, pivot, median</span></div></div>
      <div class="rm-item rm-done" data-target="si-join"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Joins</span><span class="rm-sub">Self, anti, outer, fan-out</span></div></div>
      <div class="rm-item rm-done" data-target="si-cte"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Subqueries &amp; CTEs</span><span class="rm-sub">Top-N, duplicates, recursion</span></div></div>
      <div class="rm-item rm-done" data-target="si-win"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Window Functions</span><span class="rm-sub">Latest, running, ranked</span></div></div>
      <div class="rm-item rm-done" data-target="si-date"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Dates &amp; Time</span><span class="rm-sub">Growth, streaks, retention</span></div></div>
      <div class="rm-item rm-done" data-target="si-null"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Tricky NULL &amp; Edge Cases</span><span class="rm-sub">Where correct-looking SQL lies</span></div></div>
      <div class="rm-item rm-done" data-target="si-rapid"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Conceptual Rapid-Fire</span><span class="rm-sub">Ten classic one-liners</span></div></div>
      <div class="rm-item rm-done" data-target="si-rev"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">8 reusable patterns</span></div></div>
    </div>
  </div>

  <h2 id="si-how"><span class="num">01</span>How to Approach a Question</h2>
  <div class="flow"><span>Clarify the grain</span><span>Find the tables</span><span>Build step by step (CTEs)</span><span>Check edge cases</span></div>
  <ol>
    <li><strong>Clarify the grain</strong>: what is one output row? "Revenue per customer" = one row per customer, <em>including</em> those with zero? Ask. Also define terms: does revenue include cancelled orders?</li>
    <li><strong>Find the tables</strong>: which tables hold the facts, and what is each table's key? Joining a 1-row-per-order table to a 1-row-per-item table multiplies rows.</li>
    <li><strong>Build step by step</strong>: one CTE per idea (filter → aggregate → rank → pick). Run each piece; say it out loud.</li>
    <li><strong>Check edge cases</strong>: ties, NULLs, duplicates, empty groups, division by zero, date boundaries.</li>
  </ol>
  <div class="callout intu"><span class="label">Convention on this page</span>
    <p>Revenue = <code>qty * unit_price</code> from <code>order_items</code>, excluding cancelled orders, unless the question says otherwise. Stating this out loud is itself a point scored.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>

  <h2 id="si-agg"><span class="num">02</span>Basics &amp; Aggregation</h2>
  <details class="qa"><summary><span class="qmark">Q</span>Which customers placed more than one order?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name, count(*) AS orders
FROM customers c JOIN orders o USING (customer_id)
GROUP BY c.customer_id, c.name
HAVING count(*) &gt; 1
ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>orders</th></tr><tr><td>Asha</td><td>2</td></tr><tr><td>Chen</td><td>2</td></tr></table>
  <p>Filter on an aggregate → <code>HAVING</code>, not <code>WHERE</code>. Group by the id too, so two customers with the same name don't merge.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find the second-highest salary.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT max(salary) AS second_highest
FROM employees
WHERE salary &lt; (SELECT max(salary) FROM employees);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>second_highest</th></tr><tr><td>95000</td></tr></table>
  <p>"Highest salary below the top" handles ties at the top and returns NULL (not zero rows) if there is no second value.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find who earns the 3rd-highest salary, handling ties.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH r AS (
  SELECT name, salary, dense_rank() OVER (ORDER BY salary DESC) AS rk
  FROM employees)
SELECT name, salary FROM r WHERE rk = 3;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th></tr><tr><td>Uma</td><td>70000</td></tr></table>
  <p>Distinct salaries: 120000, 95000, 70000. <code>DENSE_RANK</code> gives ties the same rank with no gaps, so rank 3 = third distinct value.</p>
  <div class="fx" data-lang="sql">-- common wrong answer
SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2;</div>
  <table class="tbl out"><caption>Wrong: counts Sara and Tom separately</caption><tr><th>name</th><th>salary</th></tr><tr><td>Tom</td><td>95000</td></tr></table>
  </div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Each category's share of total revenue, in %.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT p.category,
       sum(oi.qty * oi.unit_price) AS revenue,
       round(100.0 * sum(oi.qty * oi.unit_price) / sum(sum(oi.qty * oi.unit_price)) OVER (), 2) AS pct
FROM order_items oi
JOIN orders o   USING (order_id)
JOIN products p USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY p.category;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>category</th><th>revenue</th><th>pct</th></tr><tr><td>Furniture</td><td>350.00</td><td>13.21</td></tr><tr><td>Electronics</td><td>2300.00</td><td>86.79</td></tr></table>
  <p><code>sum(sum(...)) OVER ()</code>: the inner sum is per group, the window sums those over all groups. Use <code>100.0</code> to avoid integer division.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Pivot: one row per month, one revenue column per category.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT to_char(o.order_date, 'YYYY-MM') AS month,
       sum(CASE WHEN p.category = 'Electronics' THEN oi.qty * oi.unit_price ELSE 0 END) AS electronics,
       sum(CASE WHEN p.category = 'Furniture'   THEN oi.qty * oi.unit_price ELSE 0 END) AS furniture
FROM orders o
JOIN order_items oi USING (order_id)
JOIN products p     USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>electronics</th><th>furniture</th></tr><tr><td>2024-05</td><td>1300.00</td><td>80.00</td></tr><tr><td>2024-06</td><td>1000.00</td><td>150.00</td></tr><tr><td>2024-07</td><td>0</td><td>120.00</td></tr></table>
  <p>Conditional aggregation: one <code>SUM(CASE …)</code> per output column. PostgreSQL shorthand: <code>sum(x) FILTER (WHERE category = 'Furniture')</code>, which gives NULL instead of 0 for empty cells.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>What is the median order value?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH t AS (
  SELECT o.order_id, sum(oi.qty * oi.unit_price) AS total
  FROM orders o JOIN order_items oi USING (order_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY o.order_id)
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY total) AS median_cont,
       percentile_disc(0.5) WITHIN GROUP (ORDER BY total) AS median_disc,
       round(avg(total), 2) AS mean
FROM t;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>median_cont</th><th>median_disc</th><th>mean</th></tr><tr><td>690</td><td>500.00</td><td>662.50</td></tr></table>
  <p>Totals are 120, 500, 880, 1150. <code>percentile_cont</code> interpolates (500+880)/2; <code>percentile_disc</code> returns a real value. Aggregate to order level <em>first</em>, or you get the median line item.</p></div></details>

  <h2 id="si-join"><span class="num">03</span>Joins</h2>
  <details class="qa"><summary><span class="qmark">Q</span>Find employees who earn more than their manager.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary
FROM employees e
JOIN employees m ON m.emp_id = e.manager_id
WHERE e.salary &gt; m.salary;</div>
  <table class="tbl out"><caption>Result (0 rows)</caption><tr><th>name</th><th>salary</th><th>manager</th><th>manager_salary</th></tr></table>
  <p>Self-join: the same table twice, once as "employee", once as "manager". Nobody qualifies in <code>shop</code>; drop the <code>WHERE</code> to sanity-check. Ravi (no manager) disappears in the inner join, which is right here.</p>
  <div class="fx" data-lang="sql">SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary
FROM employees e JOIN employees m ON m.emp_id = e.manager_id;</div>
  <table class="tbl out"><caption>Sanity check</caption><tr><th>name</th><th>salary</th><th>manager</th><th>manager_salary</th></tr><tr><td>Sara</td><td>95000</td><td>Ravi</td><td>120000</td></tr><tr><td>Tom</td><td>95000</td><td>Ravi</td><td>120000</td></tr><tr><td>Uma</td><td>70000</td><td>Ravi</td><td>120000</td></tr><tr><td>Vik</td><td>65000</td><td>Uma</td><td>70000</td></tr></table>
  </div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find customers who never placed an order.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Dia</td></tr></table>
  <p>An <strong>anti-join</strong>. Equivalent: <code>LEFT JOIN orders o … WHERE o.order_id IS NULL</code>. Avoid <code>NOT IN (subquery)</code>: one NULL in the list returns nothing (see section 07).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Revenue per customer, including customers with zero.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name, coalesce(sum(oi.qty * oi.unit_price), 0) AS revenue
FROM customers c
LEFT JOIN orders o       ON o.customer_id = c.customer_id AND o.status &lt;&gt; 'cancelled'
LEFT JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY c.customer_id, c.name
ORDER BY revenue DESC, c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>revenue</th></tr><tr><td>Asha</td><td>1380.00</td></tr><tr><td>Chen</td><td>1270.00</td></tr><tr><td>Ben</td><td>0</td></tr><tr><td>Dia</td><td>0</td></tr></table>
  <p>The status filter goes in the <code>ON</code> clause. Put it in <code>WHERE</code> and Ben's and Dia's NULL rows fail the test, silently turning the LEFT JOIN into an inner join (only Asha and Chen remain).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Per customer: number of orders and total items. Why does the obvious query overcount?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name,
       count(*)                   AS wrong_orders,
       count(DISTINCT o.order_id) AS orders,
       sum(oi.qty)                AS items
FROM customers c
JOIN orders o       USING (customer_id)
JOIN order_items oi USING (order_id)
GROUP BY c.customer_id, c.name ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>wrong_orders</th><th>orders</th><th>items</th></tr><tr><td>Asha</td><td>3</td><td>2</td><td>4</td></tr><tr><td>Ben</td><td>1</td><td>1</td><td>1</td></tr><tr><td>Chen</td><td>3</td><td>2</td><td>6</td></tr></table>
  <p><strong>Fan-out</strong>: after joining items, each order appears once per line, so <code>count(*)</code> counts lines. Use <code>COUNT(DISTINCT)</code>, or aggregate items per order in a CTE before joining.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>List pairs of customers who live in the same city, each pair once.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT a.name AS customer_1, b.name AS customer_2, a.city
FROM customers a
JOIN customers b ON a.city = b.city AND a.customer_id &lt; b.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_1</th><th>customer_2</th><th>city</th></tr><tr><td>Asha</td><td>Chen</td><td>Mumbai</td></tr></table>
  <p><code>&lt;</code> (not <code>&lt;&gt;</code>) removes both self-pairs and mirror duplicates (Chen–Asha). Dia's NULL city never equals anything, so she never pairs.</p></div></details>

  <h2 id="si-cte"><span class="num">04</span>Subqueries &amp; CTEs</h2>
  <details class="qa"><summary><span class="qmark">Q</span>Products priced above their category's average.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT name, category, price
FROM products p
WHERE price &gt; (SELECT avg(price) FROM products WHERE category = p.category);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>category</th><th>price</th></tr><tr><td>Laptop</td><td>Electronics</td><td>800.00</td></tr><tr><td>Desk</td><td>Furniture</td><td>150.00</td></tr></table>
  <p>A <strong>correlated subquery</strong>: it re-runs per outer row using <code>p.category</code>. Window version: <code>avg(price) OVER (PARTITION BY category)</code> in a CTE, then filter.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Customers who bought from both Electronics and Furniture.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
JOIN orders o       USING (customer_id)
JOIN order_items oi USING (order_id)
JOIN products p     USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
  AND p.category IN ('Electronics', 'Furniture')
GROUP BY c.customer_id, c.name
HAVING count(DISTINCT p.category) = 2;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr></table>
  <p>"Bought both X and Y" = filter to X or Y, then require 2 distinct values per group. <code>WHERE category = 'X' AND category = 'Y'</code> is always empty: one row has one category.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Top-selling product (by revenue) in each category.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH rev AS (
  SELECT p.category, p.name, sum(oi.qty * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN orders o   USING (order_id)
  JOIN products p USING (product_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY p.category, p.name),
ranked AS (
  SELECT *, rank() OVER (PARTITION BY category ORDER BY revenue DESC) AS rk
  FROM rev)
SELECT category, name, revenue FROM ranked WHERE rk = 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>category</th><th>name</th><th>revenue</th></tr><tr><td>Electronics</td><td>Phone</td><td>1500.00</td></tr><tr><td>Furniture</td><td>Lamp</td><td>200.00</td></tr></table>
  <p>Aggregate → rank within partition → keep rank 1. <code>RANK</code> keeps ties; <code>ROW_NUMBER</code> picks one arbitrarily. Including cancelled orders flips Furniture to Desk (300 vs 200): define revenue first.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>A <code>signups</code> table has duplicate emails. Find them.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">CREATE TABLE signups (id int PRIMARY KEY, email text, signed_up date);
INSERT INTO signups VALUES
 (1, 'asha@x.com', '2024-01-05'), (2, 'ben@x.com', '2024-02-10'), (3, 'asha@x.com', '2024-01-06'),
 (4, 'chen@x.com', '2024-03-15'), (5, 'ben@x.com', '2024-02-10'), (6, 'asha@x.com', '2024-01-09');

SELECT email, count(*) AS copies, array_agg(id ORDER BY id) AS ids
FROM signups GROUP BY email HAVING count(*) &gt; 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>email</th><th>copies</th><th>ids</th></tr><tr><td>asha@x.com</td><td>3</td><td>{1,3,6}</td></tr><tr><td>ben@x.com</td><td>2</td><td>{2,5}</td></tr></table>
  <p>Group by the columns that define "duplicate", keep groups with count &gt; 1. Real data also needs <code>lower(trim(email))</code>.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Delete the duplicates, keeping the earliest row per email.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">DELETE FROM signups
WHERE id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (PARTITION BY email ORDER BY id) AS rn
    FROM signups) t
  WHERE rn &gt; 1);
SELECT * FROM signups ORDER BY id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>id</th><th>email</th><th>signed_up</th></tr><tr><td>1</td><td>asha@x.com</td><td>2024-01-05</td></tr><tr><td>2</td><td>ben@x.com</td><td>2024-02-10</td></tr><tr><td>4</td><td>chen@x.com</td><td>2024-03-15</td></tr></table>
  <p>Number rows within each duplicate group; delete everything except <code>rn = 1</code>. PostgreSQL alternative: <code>DELETE FROM signups a USING signups b WHERE a.email = b.email AND a.id &gt; b.id</code>. Then add a UNIQUE constraint so it can't recur.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Show the reporting chain for every employee, starting from the CEO.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT emp_id, name, 1 AS level, name AS path
  FROM employees WHERE manager_id IS NULL          -- anchor: the top
  UNION ALL
  SELECT e.emp_id, e.name, c.level + 1, c.path || ' &gt; ' || e.name
  FROM employees e JOIN chain c ON e.manager_id = c.emp_id)  -- step: direct reports
SELECT name, level, path FROM chain ORDER BY path;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>level</th><th>path</th></tr><tr><td>Ravi</td><td>1</td><td>Ravi</td></tr><tr><td>Sara</td><td>2</td><td>Ravi &gt; Sara</td></tr><tr><td>Tom</td><td>2</td><td>Ravi &gt; Tom</td></tr><tr><td>Uma</td><td>2</td><td>Ravi &gt; Uma</td></tr><tr><td>Vik</td><td>3</td><td>Ravi &gt; Uma &gt; Vik</td></tr></table>
  <p>Recursive CTE = anchor rows + a step that joins back to the rows found so far, repeated until no new rows appear.</p></div></details>

  <h2 id="si-win"><span class="num">05</span>Window Functions</h2>
  <details class="qa"><summary><span class="qmark">Q</span>Each customer's latest order.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH r AS (
  SELECT customer_id, order_id, order_date,
         row_number() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) AS rn
  FROM orders)
SELECT c.name, r.order_id, r.order_date
FROM r JOIN customers c USING (customer_id)
WHERE rn = 1 ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>order_date</th></tr><tr><td>Asha</td><td>101</td><td>2024-05-20</td></tr><tr><td>Ben</td><td>102</td><td>2024-06-02</td></tr><tr><td>Chen</td><td>104</td><td>2024-07-01</td></tr></table>
  <p>"Latest / first per group" = <code>ROW_NUMBER</code> + <code>rn = 1</code>. Add a tie-breaker (<code>order_id</code>) so the result is deterministic. PostgreSQL shortcut: <code>DISTINCT ON (customer_id) … ORDER BY customer_id, order_date DESC</code>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Joining back on <code>max(order_date)</code> returns two rows if a customer has two orders on the same day.</p></div></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Running total of revenue by date.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH daily AS (
  SELECT o.order_date, sum(oi.qty * oi.unit_price) AS revenue
  FROM orders o JOIN order_items oi USING (order_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY o.order_date)
SELECT order_date, revenue,
       sum(revenue) OVER (ORDER BY order_date) AS running_total
FROM daily ORDER BY order_date;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_date</th><th>revenue</th><th>running_total</th></tr><tr><td>2024-05-01</td><td>880.00</td><td>880.00</td></tr><tr><td>2024-05-20</td><td>500.00</td><td>1380.00</td></tr><tr><td>2024-06-15</td><td>1150.00</td><td>2530.00</td></tr><tr><td>2024-07-01</td><td>120.00</td><td>2650.00</td></tr></table>
  <p>Aggregate to one row per day first. <code>ORDER BY</code> inside <code>OVER</code> makes the sum cumulative. Default frame is <code>RANGE</code>, which lumps equal dates together; use <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> for strict row-by-row.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Top 2 earners in each department, keeping ties.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT dept, name, salary, rk
FROM (SELECT dept, name, salary,
             dense_rank() OVER (PARTITION BY dept ORDER BY salary DESC) AS rk
      FROM employees) t
WHERE rk &lt;= 2 ORDER BY dept, rk, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dept</th><th>name</th><th>salary</th><th>rk</th></tr><tr><td>Eng</td><td>Ravi</td><td>120000</td><td>1</td></tr><tr><td>Eng</td><td>Sara</td><td>95000</td><td>2</td></tr><tr><td>Eng</td><td>Tom</td><td>95000</td><td>2</td></tr><tr><td>Sales</td><td>Uma</td><td>70000</td><td>1</td></tr><tr><td>Sales</td><td>Vik</td><td>65000</td><td>2</td></tr></table>
  <p>Eng returns 3 people because Sara and Tom tie. Say which you want: <code>ROW_NUMBER</code> = exactly 2 rows; <code>RANK</code>/<code>DENSE_RANK</code> = keep ties. Window results can't go in <code>WHERE</code> directly, hence the subquery.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Days between each order and the same customer's previous order.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date,
       order_date - lag(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS days_since_prev
FROM orders ORDER BY customer_id, order_date;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th><th>days_since_prev</th></tr><tr><td>1</td><td>100</td><td>2024-05-01</td><td>NULL</td></tr><tr><td>1</td><td>101</td><td>2024-05-20</td><td>19</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td><td>NULL</td></tr><tr><td>3</td><td>103</td><td>2024-06-15</td><td>NULL</td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td><td>16</td></tr></table>
  <p><code>LAG</code> reads the previous row in the partition; the first order has none, so NULL. <code>LEAD</code> reads the next one.</p></div></details>

  <h2 id="si-date"><span class="num">06</span>Dates &amp; Time</h2>
  <p>Streak and retention questions need daily activity, so this section adds a <code>logins</code> table to my copy (<code>createdb -T shop shop_si</code>):</p>
  <div class="fx" data-lang="sql">CREATE TABLE logins (user_id int, login_date date);
INSERT INTO logins VALUES
 (1,'2024-07-01'),(1,'2024-07-02'),(1,'2024-07-02'),(1,'2024-07-03'),(1,'2024-07-05'),(1,'2024-07-06'),
 (2,'2024-07-01'),(2,'2024-07-08'),(2,'2024-07-09'),(2,'2024-07-10'),(2,'2024-07-11'),
 (3,'2024-07-02'),
 (4,'2024-07-03'),(4,'2024-07-04'),(4,'2024-07-12'),
 (5,'2024-07-08'),(5,'2024-07-20'),
 (6,'2024-07-09'),(6,'2024-07-10');</div>

  <details class="qa"><summary><span class="qmark">Q</span>Monthly revenue and month-over-month growth %.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH m AS (
  SELECT date_trunc('month', o.order_date)::date AS month, sum(oi.qty * oi.unit_price) AS revenue
  FROM orders o JOIN order_items oi USING (order_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY 1)
SELECT month, revenue,
       lag(revenue) OVER (ORDER BY month) AS prev,
       round(100.0 * (revenue - lag(revenue) OVER (ORDER BY month))
             / nullif(lag(revenue) OVER (ORDER BY month), 0), 1) AS growth_pct
FROM m ORDER BY month;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>revenue</th><th>prev</th><th>growth_pct</th></tr><tr><td>2024-05-01</td><td>1380.00</td><td>NULL</td><td>NULL</td></tr><tr><td>2024-06-01</td><td>1150.00</td><td>1380.00</td><td>-16.7</td></tr><tr><td>2024-07-01</td><td>120.00</td><td>1150.00</td><td>-89.6</td></tr></table>
  <p>Growth = (this − previous) / previous. <code>NULLIF(prev, 0)</code> turns divide-by-zero into NULL. If a month has no sales, <code>LAG</code> skips it silently: fill gaps first (next question).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Orders per month for Jan–Jul 2024, showing months with zero.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT m::date AS month, count(o.order_id) AS orders
FROM generate_series('2024-01-01'::date, '2024-07-01', '1 month') m
LEFT JOIN orders o ON date_trunc('month', o.order_date) = m
GROUP BY m ORDER BY m;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>orders</th></tr><tr><td>2024-01-01</td><td>0</td></tr><tr><td>2024-02-01</td><td>0</td></tr><tr><td>2024-03-01</td><td>0</td></tr><tr><td>2024-04-01</td><td>0</td></tr><tr><td>2024-05-01</td><td>2</td></tr><tr><td>2024-06-01</td><td>2</td></tr><tr><td>2024-07-01</td><td>1</td></tr></table>
  <p>Missing periods don't exist in the data, so generate a calendar and LEFT JOIN to it. Count a column from the right side (<code>count(o.order_id)</code>), not <code>count(*)</code>, or empty months show 1.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Days from signup to first order, per customer.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT c.name, c.signup_date, min(o.order_date) AS first_order,
       min(o.order_date) - c.signup_date AS days_to_first
FROM customers c LEFT JOIN orders o USING (customer_id)
GROUP BY c.customer_id, c.name, c.signup_date ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>signup_date</th><th>first_order</th><th>days_to_first</th></tr><tr><td>Asha</td><td>2024-01-05</td><td>2024-05-01</td><td>117</td></tr><tr><td>Ben</td><td>2024-02-10</td><td>2024-06-02</td><td>113</td></tr><tr><td>Chen</td><td>2024-03-15</td><td>2024-06-15</td><td>92</td></tr><tr><td>Dia</td><td>2024-04-20</td><td>NULL</td><td>NULL</td></tr></table>
  <p>In PostgreSQL, <code>date − date</code> = integer days. Dia stays with NULL thanks to the LEFT JOIN; "never ordered" is not "0 days".</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find users with a login streak of 3 or more consecutive days.</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH d AS (SELECT DISTINCT user_id, login_date FROM logins),
g AS (
  SELECT user_id, login_date,
         login_date - row_number() OVER (PARTITION BY user_id ORDER BY login_date)::int AS grp
  FROM d)
SELECT user_id, min(login_date) AS streak_start, max(login_date) AS streak_end, count(*) AS days
FROM g GROUP BY user_id, grp
HAVING count(*) &gt;= 3 ORDER BY user_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>user_id</th><th>streak_start</th><th>streak_end</th><th>days</th></tr><tr><td>1</td><td>2024-07-01</td><td>2024-07-03</td><td>3</td></tr><tr><td>2</td><td>2024-07-08</td><td>2024-07-11</td><td>4</td></tr></table>
  <p><strong>Gaps and islands</strong>: within a consecutive run, date and row number both rise by 1, so <code>date − row_number</code> is constant and labels the run. <code>DISTINCT</code> first: user 1's double login on 07-02 would break the trick.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>7-day retention by weekly cohort: what % of users came back within 7 days of their first login?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">WITH firsts AS (
  SELECT user_id, min(login_date) AS first_day FROM logins GROUP BY user_id),
flagged AS (
  SELECT f.*, EXISTS (SELECT 1 FROM logins l
                      WHERE l.user_id = f.user_id
                        AND l.login_date BETWEEN f.first_day + 1 AND f.first_day + 7) AS retained
  FROM firsts f)
SELECT date_trunc('week', first_day)::date AS cohort_week,
       count(*) AS users,
       count(*) FILTER (WHERE retained) AS retained_d7,
       round(100.0 * count(*) FILTER (WHERE retained) / count(*), 1) AS pct
FROM flagged GROUP BY 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>cohort_week</th><th>users</th><th>retained_d7</th><th>pct</th></tr><tr><td>2024-07-01</td><td>4</td><td>3</td><td>75.0</td></tr><tr><td>2024-07-08</td><td>2</td><td>1</td><td>50.0</td></tr></table>
  <p>Cohort = when a user started; retained = any activity in days 1–7 after that. Users 1, 2, 4 return in week 1 (user 2 exactly on day 7); user 3 never does. Clarify the window: "on day 7" and "within 7 days" are different metrics.</p></div></details>

  <h2 id="si-null"><span class="num">07</span>Tricky NULL &amp; Edge Cases</h2>
  <details class="qa"><summary><span class="qmark">Q</span>Find employees who are not anyone's manager. Why does this return nothing?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees);</div>
  <table class="tbl out"><caption>Result (0 rows)</caption><tr><th>name</th></tr></table>
  <p>Ravi's <code>manager_id</code> is NULL. <code>x NOT IN (1, 4, NULL)</code> means <code>x &lt;&gt; 1 AND x &lt;&gt; 4 AND x &lt;&gt; NULL</code>; the last part is UNKNOWN, so no row passes.</p>
  <div class="fx" data-lang="sql">SELECT name FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.emp_id)
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Fixed</caption><tr><th>name</th></tr><tr><td>Sara</td></tr><tr><td>Tom</td></tr><tr><td>Vik</td></tr></table>
  </div></details>

  <details class="qa"><summary><span class="qmark">Q</span>"Customers not in Mumbai": why is Dia missing?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT name, city,
       city &lt;&gt; 'Mumbai'                AS ne,
       city IS DISTINCT FROM 'Mumbai' AS distinct_from
FROM customers ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>city</th><th>ne</th><th>distinct_from</th></tr><tr><td>Asha</td><td>Mumbai</td><td>f</td><td>f</td></tr><tr><td>Ben</td><td>Delhi</td><td>t</td><td>t</td></tr><tr><td>Chen</td><td>Mumbai</td><td>f</td><td>f</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td><td>t</td></tr></table>
  <p><code>NULL &lt;&gt; 'Mumbai'</code> is NULL, and <code>WHERE</code> keeps only TRUE. Use <code>IS DISTINCT FROM</code> or add <code>OR city IS NULL</code> if unknown cities should count.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>What fraction of orders were cancelled? Why does the first attempt say 0?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT count(*) FILTER (WHERE status = 'cancelled') / count(*)                  AS wrong,
       round(count(*) FILTER (WHERE status = 'cancelled')::numeric / count(*), 2) AS rate,
       round(avg((status = 'cancelled')::int), 2)                                AS rate_avg
FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>wrong</th><th>rate</th><th>rate_avg</th></tr><tr><td>0</td><td>0.20</td><td>0.20</td></tr></table>
  <p>Integer ÷ integer truncates: 1/5 = 0. Cast one side. The <code>avg(boolean::int)</code> trick gives any rate in one step.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Total qty for an order that doesn't exist: 0 or NULL?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT sum(qty) AS s, count(*) AS c, coalesce(sum(qty), 0) AS s_fixed
FROM order_items WHERE order_id = 999;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>s</th><th>c</th><th>s_fixed</th></tr><tr><td>NULL</td><td>0</td><td>0</td></tr></table>
  <p>Aggregates over zero rows: <code>COUNT</code> gives 0, but <code>SUM</code>, <code>AVG</code>, <code>MAX</code> give NULL. Wrap in <code>COALESCE</code> when a number is expected. (With <code>GROUP BY</code>, empty groups don't appear at all.)</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Is an event at 2024-05-20 10:30 "between 1 May and 20 May"?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT TIMESTAMP '2024-05-20 10:30' BETWEEN '2024-05-01' AND '2024-05-20' AS with_between,
       TIMESTAMP '2024-05-20 10:30' &gt;= '2024-05-01'
   AND TIMESTAMP '2024-05-20 10:30' &lt;  '2024-05-21'                         AS half_open;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>with_between</th><th>half_open</th></tr><tr><td>f</td><td>t</td></tr></table>
  <p><code>'2024-05-20'</code> as a timestamp means midnight, so anything later that day is excluded. For timestamps always use half-open ranges: <code>&gt;= start AND &lt; day after end</code>.</p></div></details>

  <h2 id="si-rapid"><span class="num">08</span>Conceptual Rapid-Fire</h2>
  <details class="qa"><summary><span class="qmark">Q</span>WHERE vs HAVING?</summary><div class="qa-body"><code>WHERE</code> filters rows before grouping and can't use aggregates. <code>HAVING</code> filters groups after aggregation. Put non-aggregate filters in <code>WHERE</code>: fewer rows reach the grouping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>DELETE vs TRUNCATE vs DROP?</summary><div class="qa-body">
  <table class="tbl"><tr><th></th><th>Removes</th><th>WHERE?</th><th>Speed</th><th>Triggers</th></tr>
  <tr><td><code>DELETE</code></td><td>Chosen rows</td><td>Yes</td><td>Slow (row by row, logged)</td><td>Fire</td></tr>
  <tr><td><code>TRUNCATE</code></td><td>All rows, keeps table</td><td>No</td><td>Fast (drops data files)</td><td>Row triggers don't fire</td></tr>
  <tr><td><code>DROP</code></td><td>Table + structure</td><td>No</td><td>Fast</td><td>n/a</td></tr></table>
  In PostgreSQL all three can be rolled back inside a transaction; in MySQL, TRUNCATE and DROP auto-commit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>UNION vs UNION ALL?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT (SELECT count(*) FROM (SELECT city FROM customers UNION     SELECT 'Delhi') t) AS union_rows,
       (SELECT count(*) FROM (SELECT city FROM customers UNION ALL SELECT 'Delhi') t) AS union_all_rows;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>union_rows</th><th>union_all_rows</th></tr><tr><td>3</td><td>5</td></tr></table>
  <code>UNION</code> removes duplicates (a sort or hash, so slower; NULLs count as equal here). <code>UNION ALL</code> keeps every row. Default to <code>UNION ALL</code> unless you need de-duplication.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RANK vs DENSE_RANK vs ROW_NUMBER?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT name, salary,
       row_number() OVER w AS row_number, rank() OVER w AS rank, dense_rank() OVER w AS dense_rank
FROM employees WINDOW w AS (ORDER BY salary DESC) ORDER BY salary DESC, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>row_number</th><th>rank</th><th>dense_rank</th></tr><tr><td>Ravi</td><td>120000</td><td>1</td><td>1</td><td>1</td></tr><tr><td>Sara</td><td>95000</td><td>2</td><td>2</td><td>2</td></tr><tr><td>Tom</td><td>95000</td><td>3</td><td>2</td><td>2</td></tr><tr><td>Uma</td><td>70000</td><td>4</td><td>4</td><td>3</td></tr><tr><td>Vik</td><td>65000</td><td>5</td><td>5</td><td>4</td></tr></table>
  Ties: <code>ROW_NUMBER</code> breaks them arbitrarily, <code>RANK</code> shares and leaves a gap (1,2,2,4), <code>DENSE_RANK</code> shares with no gap (1,2,2,3).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT count(*) AS all_rows, count(city) AS non_null, count(DISTINCT city) AS distinct_cities
FROM customers;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>all_rows</th><th>non_null</th><th>distinct_cities</th></tr><tr><td>4</td><td>3</td><td>2</td></tr></table>
  <code>COUNT(*)</code> counts rows; <code>COUNT(col)</code> skips NULLs (Dia); <code>COUNT(DISTINCT col)</code> also merges repeats.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CHAR vs VARCHAR?</summary><div class="qa-body"><code>CHAR(n)</code> is fixed length, padded with spaces; <code>VARCHAR(n)</code> stores only what you give, up to n. Use CHAR only for truly fixed codes (country 'IN'). In PostgreSQL, <code>text</code> and <code>varchar</code> perform the same; CHAR is never faster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Clustered vs non-clustered index?</summary><div class="qa-body">A <strong>clustered</strong> index <em>is</em> the table: rows are stored in key order, so only one per table (SQL Server, MySQL InnoDB's primary key). A <strong>non-clustered</strong> index is a separate structure pointing to the rows; you can have many. PostgreSQL tables are heaps, so every index is non-clustered (<code>CLUSTER</code> reorders once, not maintained).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Primary key vs unique key?</summary><div class="qa-body">Both enforce uniqueness with an index. A primary key is one per table, implies NOT NULL, and is the row's identity that foreign keys point to. A table can have many unique keys, and they allow NULLs (in PostgreSQL, multiple NULLs, since NULL ≠ NULL).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order does SQL evaluate a query? Can you use a SELECT alias in WHERE?</summary><div class="qa-body">Logically: <code>FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</code>. So a SELECT alias doesn't exist yet in <code>WHERE</code> (error), but works in <code>ORDER BY</code>. Window functions run at the SELECT stage, which is why you filter them in an outer query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>IN vs EXISTS vs JOIN for "customers who ordered"?</summary><div class="qa-body">All give Asha, Ben, Chen, and modern planners often produce the same plan. <code>EXISTS</code> stops at the first match and is NULL-safe in the negated form. A plain <code>JOIN</code> returns a customer once <em>per order</em>, so it needs <code>DISTINCT</code>: a classic duplicate bug.</div></details>

  <h2 id="si-rev"><span class="num">09</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Top-N per group</strong>: rank in a CTE (<code>ROW_NUMBER</code> / <code>DENSE_RANK</code> <code>PARTITION BY</code>), filter outside.</li>
    <li><strong>Anti-join</strong> ("never did X"): <code>NOT EXISTS</code> or <code>LEFT JOIN … IS NULL</code>, never <code>NOT IN</code> on a nullable column.</li>
    <li><strong>Keep zero rows</strong>: LEFT JOIN, filters on the right table in <code>ON</code>, <code>COALESCE(SUM, 0)</code>.</li>
    <li><strong>Avoid fan-out</strong>: aggregate each table to the target grain before joining, or <code>COUNT(DISTINCT)</code>.</li>
    <li><strong>Share of total</strong>: <code>x / SUM(x) OVER ()</code>, times <code>100.0</code>.</li>
    <li><strong>Change over time</strong>: <code>LAG</code> for previous period, <code>SUM() OVER (ORDER BY)</code> for running totals; fill gaps with <code>generate_series</code>.</li>
    <li><strong>Pivot</strong>: <code>SUM(CASE WHEN … THEN x ELSE 0 END)</code> per column.</li>
    <li><strong>Streaks</strong>: <code>date − ROW_NUMBER()</code> labels each consecutive run (gaps and islands).</li>
  </ol></div>
</main>`
});
