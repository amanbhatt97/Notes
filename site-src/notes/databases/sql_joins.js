// notes/databases/sql_joins.js — JOINs
Object.assign(TOPIC_CONTENT, {
  "sql_joins": `<main>
  <h1>JOINs</h1>
  <p class="lead">Joins stitch related tables back together. Getting the right <em>rows</em> is easy; getting the right <em>row count</em> (no lost customers, no doubled revenue) is what interviews actually test.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sj-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Joins &amp; the Mental Model</span><span class="rm-sub">Every pair, keep matches</span></div></div>
      <div class="rm-item rm-done" data-target="sj-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">INNER, LEFT, RIGHT, FULL</span><span class="rm-sub">Who gets kept</span></div></div>
      <div class="rm-item rm-done" data-target="sj-cross"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">CROSS &amp; SELF Joins</span><span class="rm-sub">Grids and hierarchies</span></div></div>
      <div class="rm-item rm-done" data-target="sj-semi"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Semi &amp; Anti Joins</span><span class="rm-sub">EXISTS and the NOT IN trap</span></div></div>
      <div class="rm-item rm-done" data-target="sj-onwhere"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">ON vs WHERE</span><span class="rm-sub">The silent INNER JOIN</span></div></div>
      <div class="rm-item rm-done" data-target="sj-fan"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Fan-out</span><span class="rm-sub">Double counting, and the fix</span></div></div>
      <div class="rm-item rm-done" data-target="sj-multi"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Multi-table &amp; Non-equi</span><span class="rm-sub">Chains and range joins</span></div></div>
      <div class="rm-item rm-done" data-target="sj-algo"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How the Engine Joins</span><span class="rm-sub">Nested loop, hash, merge</span></div></div>
      <div class="rm-item rm-done" data-target="sj-puzzle"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Row-Count Puzzle</span><span class="rm-sub">Duplicates and NULL keys</span></div></div>
      <div class="rm-item rm-done" data-target="sj-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 9 lines</span></div></div>
      <div class="rm-item rm-done" data-target="sj-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sj-model"><span class="num">01</span>Why Joins &amp; the Mental Model</h2>
  <p>Good schemas store each fact once: customer details in <code>customers</code>, orders in <code>orders</code>, linked by <code>customer_id</code>. A <strong>join</strong> combines rows from two tables at query time, so you can ask "which customer placed order 103?".</p>
  <div class="callout def"><span class="label">Mental model</span>
    <p><strong>1.</strong> Take every pair of rows (left × right). <strong>2.</strong> Keep the pairs where the <code>ON</code> condition is TRUE. <strong>3.</strong> Outer joins then add back unmatched rows, padded with NULLs.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A dance hall. Every customer meets every order (the pairs). Only pairs where the customer ID on the ticket matches get to dance (ON). A LEFT JOIN also lets customers with no partner stay on the floor, dancing with an empty chair (NULL).</p>
  </div>
  <p>Real engines never build all pairs; that's just the meaning. The model instantly answers row-count questions: a key that matches 2 rows on one side and 3 on the other gives 6 rows.</p>

  <h2 id="sj-types"><span class="num">02</span>INNER, LEFT, RIGHT, FULL</h2>
  <table class="tbl">
    <tr><th>Join</th><th>Keeps</th><th>Typical use</th></tr>
    <tr><td><code>INNER JOIN</code> (or just <code>JOIN</code>)</td><td>Only matching pairs</td><td>Orders with their customer</td></tr>
    <tr><td><code>LEFT JOIN</code></td><td>All left rows; NULLs where no match</td><td>All customers, with orders if any</td></tr>
    <tr><td><code>RIGHT JOIN</code></td><td>All right rows</td><td>Same as LEFT with tables swapped; rarely written</td></tr>
    <tr><td><code>FULL JOIN</code></td><td>All rows from both sides</td><td>Reconciling two sources</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th></tr><tr><td>Asha</td><td>100</td></tr><tr><td>Asha</td><td>101</td></tr><tr><td>Ben</td><td>102</td></tr><tr><td>Chen</td><td>103</td></tr><tr><td>Chen</td><td>104</td></tr><tr><td>Dia</td><td>NULL</td></tr></table>
  <p>An INNER JOIN gives the same rows minus Dia (5 rows). Dia has no orders, so only LEFT keeps her.</p>
  <h3>FULL JOIN: reconcile actuals vs targets</h3>
  <p>Targets live in a small table created in a copy of shop: <code>targets(month, target)</code> with June 1500, July 500, August 800.</p>
  <div class="fx" data-lang="sql">WITH actual AS (
  SELECT DATE_TRUNC('month', o.order_date)::date AS month,
         SUM(oi.qty * oi.unit_price) AS revenue
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  GROUP BY 1
)
SELECT COALESCE(a.month, t.month) AS month, a.revenue, t.target
FROM actual a
FULL JOIN targets t ON t.month = a.month
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>revenue</th><th>target</th></tr><tr><td>2024-05-01</td><td>1380.00</td><td>NULL</td></tr><tr><td>2024-06-01</td><td>1300.00</td><td>1500</td></tr><tr><td>2024-07-01</td><td>120.00</td><td>500</td></tr><tr><td>2024-08-01</td><td>NULL</td><td>800</td></tr></table>
  <p>May had sales but no target; August has a target but no sales. <code>COALESCE</code> merges the key, which is NULL on whichever side is missing.</p>
  <div class="callout trap"><span class="label">Why Venn diagrams mislead</span>
    <p>Venn circles suggest a join returns "a subset of rows". It doesn't: it returns <em>pairs</em>, and row counts can grow (one customer × two orders = two rows). Venns also can't show CROSS joins, duplicates or NULL padding. Think "pairs + padding", not "overlapping circles".</p>
  </div>

  <h2 id="sj-cross"><span class="num">03</span>CROSS &amp; SELF Joins</h2>
  <h3>CROSS JOIN: every combination</h3>
  <p>No ON clause: every left row pairs with every right row (a <strong>Cartesian product</strong>, m × n rows). Use it to build a complete grid, then LEFT JOIN facts onto it so zero cells still appear.</p>
  <div class="fx" data-lang="sql">SELECT c.name, cat.category
FROM customers c
CROSS JOIN (SELECT DISTINCT category FROM products) cat
ORDER BY c.customer_id, cat.category;</div>
  <p>Result: 4 customers × 2 categories = 8 rows (Asha–Electronics, Asha–Furniture, Ben–Electronics, … Dia–Furniture). A plain GROUP BY on sales would only show combinations that happened; the grid shows Dia × Electronics = 0 too.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the ON condition (or writing <code>FROM a, b</code> with no WHERE) gives an accidental cross join. 1M × 1M rows = 10<sup>12</sup> rows and a dead query.</p>
  </div>
  <h3>SELF JOIN: a table joined to itself</h3>
  <p>Needed when rows point at other rows in the same table, like <code>employees.manager_id</code>. Give the table two aliases and treat them as two tables.</p>
  <div class="fx" data-lang="sql">SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.emp_id = e.manager_id
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>employee</th><th>manager</th></tr><tr><td>Ravi</td><td>NULL</td></tr><tr><td>Sara</td><td>Ravi</td></tr><tr><td>Tom</td><td>Ravi</td></tr><tr><td>Uma</td><td>Ravi</td></tr><tr><td>Vik</td><td>Uma</td></tr></table>
  <p>LEFT keeps Ravi, who has no manager. With INNER he'd vanish. Self joins also find pairs: <code>ON a.salary = b.salary AND a.emp_id &lt; b.emp_id</code> returns Sara–Tom once, with no self-pairs or mirrored duplicates.</p>

  <h2 id="sj-semi"><span class="num">04</span>Semi &amp; Anti Joins</h2>
  <p>Often you don't want the other table's columns, only a yes/no: "customers <em>who have</em> orders" (<strong>semi-join</strong>) or "customers <em>with no</em> orders" (<strong>anti-join</strong>).</p>
  <div class="fx" data-lang="sql">SELECT c.name FROM customers c
JOIN orders o ON o.customer_id = c.customer_id;   -- wrong tool</div>
  <p>This returns 5 rows: Asha, Asha, Ben, Chen, Chen. The JOIN repeats a customer once per order. <code>EXISTS</code> returns each customer once and stops at the first match:</p>
  <div class="fx" data-lang="sql">SELECT c.name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Ben</td></tr><tr><td>Chen</td></tr></table>
  <p>Anti-join, two correct forms. Both return Dia:</p>
  <div class="fx" data-lang="sql">SELECT c.name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);

SELECT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;</div>
  <table class="tbl out"><caption>Result (both)</caption><tr><th>name</th></tr><tr><td>Dia</td></tr></table>
  <h3>The NOT IN + NULL trap</h3>
  <p>Find employees who manage nobody. Ravi's <code>manager_id</code> is NULL, so the subquery contains a NULL:</p>
  <div class="fx" data-lang="sql">SELECT name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr></table>
  <p>Zero rows. <code>2 NOT IN (1, 1, 1, 4, NULL)</code> means <code>2&lt;&gt;1 AND … AND 2&lt;&gt;NULL</code>. The last part is UNKNOWN, so the whole thing is never TRUE.</p>
  <div class="fx" data-lang="sql">SELECT e.name FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.emp_id);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Sara</td></tr><tr><td>Vik</td></tr><tr><td>Tom</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One NULL in a <code>NOT IN</code> list empties the result. Default to <code>NOT EXISTS</code>. If you must use NOT IN, add <code>WHERE col IS NOT NULL</code> inside the subquery. (<code>IN</code> is safe; only <code>NOT IN</code> breaks.)</p>
  </div>

  <h2 id="sj-onwhere"><span class="num">05</span>ON vs WHERE in a LEFT JOIN</h2>
  <p>For INNER joins, a condition in ON or WHERE gives the same result. For LEFT joins it doesn't:</p>
  <ul>
    <li><strong>ON</strong> decides which right rows <em>match</em>. Unmatched left rows are still kept.</li>
    <li><strong>WHERE</strong> runs <em>after</em> the join and filters the final rows, including the NULL-padded ones.</li>
  </ul>
  <div class="fx" data-lang="sql">-- Goal: every customer with their delivered orders
SELECT c.name, o.order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'delivered';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>status</th></tr><tr><td>Asha</td><td>100</td><td>delivered</td></tr><tr><td>Asha</td><td>101</td><td>delivered</td></tr><tr><td>Chen</td><td>103</td><td>delivered</td></tr></table>
  <p>Ben and Dia vanished. Dia's padded row has <code>status = NULL</code>, and <code>NULL = 'delivered'</code> is UNKNOWN, so WHERE drops it. The LEFT JOIN silently became an INNER JOIN.</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND o.status = 'delivered'
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>status</th></tr><tr><td>Asha</td><td>100</td><td>delivered</td></tr><tr><td>Asha</td><td>101</td><td>delivered</td></tr><tr><td>Ben</td><td>NULL</td><td>NULL</td></tr><tr><td>Chen</td><td>103</td><td>delivered</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td></tr></table>
  <div class="callout intu"><span class="label">Rule</span>
    <p>Conditions on the <strong>right</strong> (optional) table go in <strong>ON</strong>. Conditions on the <strong>left</strong> (preserved) table go in <strong>WHERE</strong>. The one exception is the deliberate <code>WHERE right.key IS NULL</code> anti-join.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: COUNT(*) after LEFT JOIN</span>
    <p>Counting orders per customer with <code>COUNT(*)</code> gives Dia 1, because her NULL-padded row is still a row. Use <code>COUNT(o.order_id)</code>, which skips NULLs and gives 0.</p>
  </div>

  <h2 id="sj-fan"><span class="num">06</span>Fan-out: Double Counting</h2>
  <p><strong>Fan-out</strong> happens when you join a parent to two independent one-to-many children. Each child row pairs with every row of the other child, so totals multiply.</p>
  <p>Example: a <code>visits(customer_id, visit_date)</code> table added to a copy of shop. Asha has 3 visits; Chen has 1.</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       SUM(oi.qty * oi.unit_price) AS revenue,
       COUNT(v.visit_date)         AS visits
FROM customers c
LEFT JOIN orders o       ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON oi.order_id   = o.order_id
LEFT JOIN visits v       ON v.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>revenue</th><th>visits</th></tr><tr><td>Asha</td><td>4140.00</td><td>9</td></tr><tr><td>Ben</td><td>150.00</td><td>0</td></tr><tr><td>Chen</td><td>1270.00</td><td>3</td></tr><tr><td>Dia</td><td>NULL</td><td>0</td></tr></table>
  <p>Asha's real revenue is 1380 with 3 visits. Her 3 item rows × 3 visits = 9 rows, so revenue is tripled and visits counted 9 times. No error, just wrong numbers.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two guest lists stapled together: every name on list A gets written next to every name on list B. Count either list afterwards and you've counted it many times over.</p>
  </div>
  <p><strong>Fix: aggregate each child to one row per key first, then join.</strong></p>
  <div class="fx" data-lang="sql">WITH rev AS (
  SELECT o.customer_id, SUM(oi.qty * oi.unit_price) AS revenue
  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
  GROUP BY o.customer_id
), vis AS (
  SELECT customer_id, COUNT(*) AS visits
  FROM visits GROUP BY customer_id
)
SELECT c.name, rev.revenue, COALESCE(vis.visits, 0) AS visits
FROM customers c
LEFT JOIN rev ON rev.customer_id = c.customer_id
LEFT JOIN vis ON vis.customer_id = c.customer_id
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>revenue</th><th>visits</th></tr><tr><td>Asha</td><td>1380.00</td><td>3</td></tr><tr><td>Ben</td><td>150.00</td><td>0</td></tr><tr><td>Chen</td><td>1270.00</td><td>1</td></tr><tr><td>Dia</td><td>NULL</td><td>0</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>COUNT(DISTINCT …)</code> can patch inflated <em>counts</em>, but <code>SUM(DISTINCT revenue)</code> is wrong whenever two real values happen to be equal. Fix the grain, don't paper over it. Sanity check: compare <code>COUNT(*)</code> before and after each join.</p>
  </div>

  <h2 id="sj-multi"><span class="num">07</span>Multi-table &amp; Non-equi Joins</h2>
  <p>Chain joins along the keys. Each step joins the next table to what you have so far.</p>
  <div class="flow"><span>customers</span><span>orders</span><span>order_items</span><span>products</span></div>
  <div class="fx" data-lang="sql">SELECT c.name, p.category, SUM(oi.qty * oi.unit_price) AS spent
FROM customers c
JOIN orders o       ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
JOIN products p     ON p.product_id  = oi.product_id
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY c.name, p.category
ORDER BY c.name, p.category;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>category</th><th>spent</th></tr><tr><td>Asha</td><td>Electronics</td><td>1300.00</td></tr><tr><td>Asha</td><td>Furniture</td><td>80.00</td></tr><tr><td>Chen</td><td>Electronics</td><td>1000.00</td></tr><tr><td>Chen</td><td>Furniture</td><td>270.00</td></tr></table>
  <div class="callout trap"><span class="label">Trap: LEFT then INNER</span>
    <p><code>customers LEFT JOIN orders … JOIN order_items</code> loses Dia. The LEFT JOIN pads her with a NULL order_id, then the INNER JOIN finds no item for NULL and drops the row. Once you LEFT JOIN, every later join on that branch must be LEFT too.</p>
  </div>
  <h3>Non-equi joins</h3>
  <p>ON can be any condition, not just <code>=</code>. Common uses: ranges, bands, "events before this date".</p>
  <div class="fx" data-lang="sql">SELECT e.name, e.salary, b.band
FROM employees e
JOIN (VALUES ('junior', 0, 79999), ('mid', 80000, 99999), ('senior', 100000, 999999))
     AS b(band, lo, hi)
  ON e.salary BETWEEN b.lo AND b.hi
ORDER BY e.salary DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>band</th></tr><tr><td>Ravi</td><td>120000</td><td>senior</td></tr><tr><td>Sara</td><td>95000</td><td>mid</td></tr><tr><td>Tom</td><td>95000</td><td>mid</td></tr><tr><td>Uma</td><td>70000</td><td>junior</td></tr><tr><td>Vik</td><td>65000</td><td>junior</td></tr></table>
  <p>Bands must not overlap, or a row matches twice. Non-equi joins can't use a hash join, so on big tables they're slow.</p>

  <h2 id="sj-algo"><span class="num">08</span>How the Engine Joins</h2>
  <p>The optimizer picks one of three physical algorithms. You see the choice in <code>EXPLAIN</code>.</p>
  <table class="tbl">
    <tr><th>Algorithm</th><th>How it works</th><th>Best when</th><th>Cost</th></tr>
    <tr><td><strong>Nested loop</strong></td><td>For each outer row, look up matches in the inner side (ideally via an index)</td><td>Outer side is small; inner has an index; any condition (incl. non-equi)</td><td>outer × lookup</td></tr>
    <tr><td><strong>Hash join</strong></td><td>Build a hash table on the smaller side, stream the larger side through it</td><td>Large, unsorted inputs; equality only</td><td>~ m + n, needs memory</td></tr>
    <tr><td><strong>Merge join</strong></td><td>Sort both sides by key, walk them together like a zipper</td><td>Inputs already sorted (index) or huge; equality / range</td><td>~ m + n after sorting</td></tr>
  </table>
  <p>On shop, <code>EXPLAIN</code> of customers JOIN orders shows a <strong>Hash Join</strong>: hash the 4 customers, then stream the 5 orders through it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Matching guests to tables at a wedding. <strong>Nested loop</strong>: for each guest, look up their name in the seating index. <strong>Hash</strong>: sort place cards into pigeonholes by surname letter, then each guest checks one hole. <strong>Merge</strong>: both lists alphabetised, read them side by side.</p>
  </div>

  <h2 id="sj-puzzle"><span class="num">09</span>Row-Count Puzzle</h2>
  <div class="callout pred"><span class="label">Predict the output</span>
    <p>Table <code>a(k)</code> = 1, 1, 2, NULL. Table <code>b(k)</code> = 1, 1, 3, NULL. How many rows for INNER, LEFT, RIGHT, FULL and CROSS joins on <code>a.k = b.k</code>?</p>
  </div>
  <div class="fx" data-lang="sql">SELECT
  (SELECT COUNT(*) FROM a JOIN b ON a.k = b.k)       AS inner_j,
  (SELECT COUNT(*) FROM a LEFT JOIN b ON a.k = b.k)  AS left_j,
  (SELECT COUNT(*) FROM a RIGHT JOIN b ON a.k = b.k) AS right_j,
  (SELECT COUNT(*) FROM a FULL JOIN b ON a.k = b.k)  AS full_j,
  (SELECT COUNT(*) FROM a CROSS JOIN b)              AS cross_j;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>inner_j</th><th>left_j</th><th>right_j</th><th>full_j</th><th>cross_j</th></tr><tr><td>4</td><td>6</td><td>6</td><td>8</td><td>16</td></tr></table>
  <ul>
    <li><strong>INNER 4</strong>: the two 1s pair 2 × 2. NULL never equals NULL, so the NULLs don't match.</li>
    <li><strong>LEFT 6</strong>: 4 matches + unmatched 2 and NULL from <code>a</code>.</li>
    <li><strong>RIGHT 6</strong>: 4 + unmatched 3 and NULL from <code>b</code>.</li>
    <li><strong>FULL 8</strong>: 4 + 2 + 2. <strong>CROSS 16</strong>: 4 × 4.</li>
  </ul>
  <div class="callout intu"><span class="label">Bounds to remember</span>
    <p>INNER ≤ m × n. LEFT ≥ m (rows of the left table). FULL ≥ max(m, n). If a join returns more rows than its "one" side, a key isn't as unique as you thought.</p>
  </div>

  <h2 id="sj-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Model:</strong> all pairs → keep where ON is TRUE → outer joins add unmatched rows with NULLs.</li>
    <li><strong>INNER</strong> = matches only; <strong>LEFT</strong> keeps all left; <strong>FULL</strong> keeps both; <strong>CROSS</strong> = m × n.</li>
    <li><strong>SELF join</strong>: same table, two aliases. Use <code>a.id &lt; b.id</code> for unique pairs.</li>
    <li><strong>Semi/anti</strong>: EXISTS / NOT EXISTS. They never duplicate rows.</li>
    <li><strong>NOT IN</strong> with a NULL in the list returns nothing. Prefer NOT EXISTS.</li>
    <li><strong>LEFT JOIN filters</strong> on the right table go in ON; in WHERE they make it INNER.</li>
    <li><strong>COUNT(right.col)</strong>, not COUNT(*), after a LEFT JOIN.</li>
    <li><strong>Fan-out:</strong> two one-to-many joins multiply. Aggregate each child first, then join.</li>
    <li><strong>Algorithms:</strong> nested loop (small + index), hash (big, equality), merge (sorted).</li>
  </ol></div>

  <h2 id="sj-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How many rows does <code>customers LEFT JOIN orders</code> return in shop, and why not 4?</summary><div class="qa-body">6. Asha and Chen have 2 orders each, Ben 1, and Dia gets one NULL-padded row: 2 + 1 + 2 + 1. A LEFT JOIN guarantees <em>at least</em> one row per left row, not exactly one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find customers who have never ordered. Give two correct ways and one wrong way.</summary><div class="qa-body">Correct: <code>WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)</code>, or <code>LEFT JOIN orders o … WHERE o.order_id IS NULL</code>. Both return Dia. Risky: <code>WHERE customer_id NOT IN (SELECT customer_id FROM orders)</code>. It works here only because orders.customer_id is NOT NULL; one NULL would empty the result.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>SELECT name FROM employees WHERE emp_id NOT IN (SELECT manager_id FROM employees);</code></summary><div class="qa-body">Zero rows. Ravi's manager_id is NULL, so every <code>emp_id &lt;&gt; NULL</code> check is UNKNOWN. The intended answer (Sara, Tom, Vik) needs NOT EXISTS or <code>WHERE manager_id IS NOT NULL</code> in the subquery.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A report should list all customers with their count of delivered orders, but Ben and Dia are missing. The query has <code>LEFT JOIN orders … WHERE o.status = 'delivered'</code>. Fix it.</summary><div class="qa-body">The WHERE drops the NULL-padded rows, turning the LEFT JOIN into an INNER JOIN. Move the condition into ON and count a right-side column:<div class="fx" data-lang="sql">SELECT c.name, COUNT(o.order_id) AS delivered_orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'
GROUP BY c.customer_id, c.name;</div>Gives Asha 2, Ben 0, Chen 1, Dia 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A dashboard joins customers to orders and to website visits, and revenue comes out 3× too high for some customers. What's happening?</summary><div class="qa-body">Fan-out. Orders and visits are both one-to-many from customers, so each order row is repeated once per visit. Fix: aggregate orders per customer and visits per customer in separate CTEs, then join those one-row-per-customer results.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a query listing every employee with their manager's name, including the CEO.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.emp_id = e.manager_id;</div>LEFT, not INNER, so Ravi (manager_id NULL) appears with a NULL manager.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a query for employees who earn more than their manager. What does shop return?</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT e.name, e.salary, m.name AS manager, m.salary AS mgr_salary
FROM employees e
JOIN employees m ON m.emp_id = e.manager_id
WHERE e.salary &gt; m.salary;</div>Empty. Every employee earns less than their manager (e.g. Vik 65000 &lt; Uma 70000). An empty result is a valid answer; say so.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List all unique pairs of employees in the same department, with no self-pairs or mirrored duplicates.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT a.name AS emp1, b.name AS emp2
FROM employees a
JOIN employees b ON a.dept = b.dept AND a.emp_id &lt; b.emp_id;</div>Ravi–Sara, Ravi–Tom, Sara–Tom, Uma–Vik. Using <code>&lt;&gt;</code> instead of <code>&lt;</code> would return each pair twice.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need units bought per customer per category, including zeros (Dia × Electronics = 0). How?</summary><div class="qa-body">CROSS JOIN customers with the distinct categories to build the full grid (8 rows), then LEFT JOIN the sales onto it and use <code>COALESCE(SUM(qty), 0)</code>. A plain GROUP BY over sales only shows combinations that actually occurred.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Semi-join vs inner join: what's the difference, and when does INNER give a wrong answer?</summary><div class="qa-body">An inner join returns one row per matching <em>pair</em>; a semi-join (EXISTS) returns each left row once if any match exists. "Customers who ordered" via INNER JOIN lists Asha and Chen twice, which breaks counts. Adding DISTINCT hides it but costs a sort; EXISTS is the precise tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the three join algorithms. Which fits (a) one customer's orders, (b) two 500M-row tables on user_id, (c) inputs already sorted by key?</summary><div class="qa-body">(a) Nested loop with an index lookup: tiny outer side. (b) Hash join: big unsorted inputs, equality key; may spill to disk if memory is short. (c) Merge join: no sort needed, just walk both in order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>NATURAL JOIN</code> considered dangerous, and how does <code>USING</code> differ from <code>ON</code>?</summary><div class="qa-body">NATURAL JOIN joins on <em>every</em> same-named column. If someone later adds <code>created_at</code> to both customers and orders, the join silently starts matching on it too and rows vanish. <code>USING (customer_id)</code> names the key explicitly and outputs it once; <code>ON</code> allows any condition and keeps both columns.</div></details>
</main>`
});
