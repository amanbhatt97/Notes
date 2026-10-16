// notes/databases/sql_interview.js — Practice Q&A
Object.assign(TOPIC_CONTENT, {
  "sql_interview": `<main>
  <h1>Practice Q&amp;A</h1>
  <p class="lead">Interview-style SQL problems on the <code>shop</code> database, each with a working query, its real output and the idea behind it. Try each one before opening it.</p>

  <h2 id="si-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">SQL interview patterns</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Approach (every question)</div>
      <ul>
        <li><b>Grain</b> — what is one output row? include zero rows? cancelled orders?</li>
        <li><b>Tables + keys</b> — order-level × item-level join multiplies rows</li>
        <li><b>CTEs</b> — one idea each: filter → aggregate → rank → pick</li>
        <li><b>Edge cases</b> — ties, NULLs, duplicates, empty groups, ÷0, date boundaries</li>
        <li><b>Say assumptions out loud</b> — revenue = qty × unit_price, excl. cancelled</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Top-N / Nth per group</div>
      <ul>
        <li><b>Rank in CTE, filter outside</b> — window results can't go in WHERE
          <ul><li><code>rank() OVER (PARTITION BY g ORDER BY x DESC) AS rk</code> … <code>WHERE rk = 1</code></li></ul></li>
        <li><b>Nth distinct value</b> — <code>dense_rank() … WHERE rk = N</code></li>
        <li><b>2nd highest</b> — <code>max(s) WHERE s &lt; (SELECT max(s) …)</code></li>
        <li><b>Latest per group</b> — <code>row_number() … rn = 1</code> + tie-breaker; or <code>DISTINCT ON</code></li>
        <li>⚠ <b>LIMIT 1 OFFSET N-1</b> — counts tied rows separately</li>
        <li><b>Ties?</b> ROW_NUMBER exactly N · RANK/DENSE_RANK keep ties</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Existence &amp; anti-join</div>
      <ul>
        <li><b>"Never did X"</b> — <code>WHERE NOT EXISTS (SELECT 1 … = c.id)</code></li>
        <li><b>Or</b> — <code>LEFT JOIN o … WHERE o.id IS NULL</code></li>
        <li>⚠ <b>NOT IN (subquery)</b> — one NULL → zero rows</li>
        <li><b>"Bought both X and Y"</b> — <code>WHERE cat IN (X, Y) … HAVING count(DISTINCT cat) = 2</code></li>
        <li><b>Self-join</b> — employee vs manager: <code>JOIN employees m ON m.emp_id = e.manager_id</code></li>
        <li><b>Unique pairs</b> — <code>a.id &lt; b.id</code> (not <code>&lt;&gt;</code>)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Keep zeros &amp; gaps</div>
      <ul>
        <li><b>LEFT JOIN from the "all" table</b> + <code>coalesce(sum(x), 0)</code></li>
        <li>⚠ <b>Right-table filter in WHERE</b> → becomes inner join; put it in <code>ON</code></li>
        <li><b>Missing periods</b> — <code>generate_series(start, end, '1 month')</code> LEFT JOIN data</li>
        <li><b>Count right side</b> — <code>count(o.order_id)</code>, not <code>count(*)</code></li>
        <li><b>Empty input</b> — COUNT → 0, SUM/AVG/MAX → NULL</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Fan-out &amp; duplicates</div>
      <ul>
        <li><b>Fan-out</b> — joining 1-per-order to 1-per-item repeats orders</li>
        <li><b>Fix</b> — <code>count(DISTINCT o.order_id)</code> or aggregate in a CTE first</li>
        <li><b>Find dups</b> — <code>GROUP BY key HAVING count(*) &gt; 1</code></li>
        <li><b>Delete dups</b> — <code>row_number() OVER (PARTITION BY key ORDER BY id)</code>, delete <code>rn &gt; 1</code>
          <ul><li>then add UNIQUE so it can't recur</li></ul></li>
        <li>⚠ <b>JOIN for "who ordered"</b> → one row per order; use EXISTS</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Ratios, pivots, stats</div>
      <ul>
        <li><b>Share of total</b> — <code>100.0 * sum(x) / sum(sum(x)) OVER ()</code></li>
        <li><b>Rate</b> — <code>avg((status = 'cancelled')::int)</code></li>
        <li>⚠ <b>Integer ÷</b> — 1/5 = 0; cast or use <code>100.0</code></li>
        <li><b>Pivot</b> — <code>sum(CASE WHEN cat = 'X' THEN v ELSE 0 END)</code> per column; PG <code>FILTER (WHERE …)</code></li>
        <li><b>Median</b> — <code>percentile_cont(0.5) WITHIN GROUP (ORDER BY t)</code>; aggregate to grain first</li>
        <li><b>Correlated subquery</b> — above own-category average</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Time series</div>
      <ul>
        <li><b>Previous row</b> — <code>lag(x) OVER (PARTITION BY u ORDER BY d)</code>; <code>lead</code> = next</li>
        <li><b>Growth %</b> — <code>(x - lag) / nullif(lag, 0)</code>; fill gaps first</li>
        <li><b>Running total</b> — <code>sum(x) OVER (ORDER BY d)</code>; ROWS frame for strict rows</li>
        <li><b>Streaks</b> — <code>d - row_number() OVER (…)</code> constant per run; DISTINCT first</li>
        <li><b>Retention</b> — first day per user → EXISTS activity in days 1–7 → group by cohort week</li>
        <li><b>Recursive</b> — anchor <code>UNION ALL</code> step joining back (org chart)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">NULL &amp; boundary traps</div>
      <ul>
        <li><b><code>NULL &lt;&gt; 'x'</code></b> is NULL → row dropped; use <code>IS DISTINCT FROM</code></li>
        <li><b><code>count(col)</code></b> skips NULLs; <code>count(*)</code> doesn't</li>
        <li><b>BETWEEN on timestamps</b> — end date = midnight; use <code>&gt;= start AND &lt; end + 1 day</code></li>
        <li><b>UNION</b> dedups (slower); <b>UNION ALL</b> keeps all</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Rapid-fire facts</div>
      <ul>
        <li><b>Logical order</b> — FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</li>
        <li><b>WHERE vs HAVING</b> — rows before grouping vs groups after</li>
        <li><b>DELETE / TRUNCATE / DROP</b> — rows (logged) / all rows fast / table</li>
        <li><b>PK vs UNIQUE</b> — one, NOT NULL, identity vs many, NULLs allowed</li>
        <li><b>Clustered index</b> — table stored in key order; PG heaps: all non-clustered</li>
        <li><b>CHAR vs VARCHAR</b> — padded fixed vs variable; PG text = varchar</li>
      </ul>
    </div>
  </div>
</div>


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
    </div>
  </div>

  <h2 id="si-how"><span class="num">01</span>How to Approach a Question</h2>
  <p>An interviewer shares a screen with a few tables and says "find the customers who ordered more than once". You have ten minutes and a blank editor. The hardest part is not SQL; it is turning an English sentence into steps. Every problem on this page follows the same four moves, and each answer below shows them: first the question in plain words, then the idea, then the query, then a walk through the real result.</p>
  <div class="flow"><span>Clarify the grain</span><span>Find the tables</span><span>Build step by step (CTEs)</span><span>Check edge cases</span></div>
  <div class="cards">
    <div><b>1 · Grain</b><p>Grain = what one output row stands for (one customer? one month?). Include zero rows? Does revenue count cancelled orders? Ask.</p></div>
    <div><b>2 · Tables</b><p>Which hold the facts, and each one's key? Order × item joins multiply rows.</p></div>
    <div><b>3 · CTEs</b><p>A CTE (<code>WITH name AS (…)</code>) is a named step. One idea each: filter → aggregate → rank → pick. Say each out loud.</p></div>
    <div><b>4 · Edges</b><p>Ties, NULLs, duplicates, empty groups, ÷0, date boundaries.</p></div>
  </div>
  <div class="callout intu"><span class="label">Convention on this page</span>
    <p>Revenue = <code>qty * unit_price</code> from <code>order_items</code>, excluding cancelled orders, unless the question says otherwise. Stating this out loud is itself a point scored.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>

  <h2 id="si-agg"><span class="num">02</span>Basics &amp; Aggregation</h2>
  <p>The data, for reference: Asha has orders 100 and 101, Ben has 102 (cancelled), Chen has 103 and 104, Dia has none. Employees: Ravi 120000, Sara and Tom 95000 each, Uma 70000, Vik 65000.</p>
  <details class="qa"><summary><span class="qmark">Q</span>Which customers placed more than one order?</summary><div class="qa-body">
  <p><strong>In plain words:</strong> count each customer's orders, then keep only the customers whose count is above 1.</p>
  <p><strong>Idea:</strong> "per customer" means <code>GROUP BY</code> customer. "More than one" is a test on the <em>count</em>, and a count exists only after grouping, so the test goes in <code>HAVING</code>.</p>
  <div class="fx" data-lang="sql">SELECT c.name, count(*) AS orders
FROM customers c JOIN orders o USING (customer_id)
GROUP BY c.customer_id, c.name
HAVING count(*) &gt; 1
ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>orders</th></tr><tr><td>Asha</td><td>2</td></tr><tr><td>Chen</td><td>2</td></tr></table>
  <p><strong>Walk through:</strong> the join makes one row per order with the customer's name on it. Grouping gives Asha 2, Ben 1, Chen 2 (Dia has no orders, so no rows). <code>HAVING count(*) &gt; 1</code> keeps Asha and Chen.</p>
  <p>Filter on an aggregate → <code>HAVING</code>, not <code>WHERE</code>. Group by the id too, so two customers with the same name don't merge.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find the second-highest salary.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> ignore the top salary, then take the highest of what is left.</p>
  <p><strong>Idea:</strong> the inner query finds the top (120000). The outer query looks only at salaries below that and takes their maximum.</p>
  <div class="fx" data-lang="sql">SELECT max(salary) AS second_highest
FROM employees
WHERE salary &lt; (SELECT max(salary) FROM employees);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>second_highest</th></tr><tr><td>95000</td></tr></table>
  <p><strong>Walk through:</strong> salaries below 120000 are 95000, 95000, 70000, 65000. Their max is 95000. "Highest salary below the top" handles ties at the top and returns NULL (not zero rows) if there is no second value.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find who earns the 3rd-highest salary, handling ties.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> give every employee a rank by salary, where people with the same salary share a rank, then show the person at rank 3.</p>
  <p><strong>Idea:</strong> <code>DENSE_RANK</code> is a window function: it adds a rank column without collapsing rows. Sara and Tom both get rank 2, and the next rank is 3 (no gap). A window result can't be filtered in the same query, so rank in a CTE first.</p>
  <div class="fx" data-lang="sql">WITH r AS (
  SELECT name, salary, dense_rank() OVER (ORDER BY salary DESC) AS rk
  FROM employees)
SELECT name, salary FROM r WHERE rk = 3;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th></tr><tr><td>Uma</td><td>70000</td></tr></table>
  <p><strong>Walk through:</strong> ranks are Ravi 1, Sara 2, Tom 2, Uma 3, Vik 4. Distinct salaries: 120000, 95000, 70000. <code>DENSE_RANK</code> gives ties the same rank with no gaps, so rank 3 = third distinct value = Uma.</p>
  <div class="fx" data-lang="sql">-- common wrong answer
SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2;</div>
  <table class="tbl out"><caption>Wrong: counts Sara and Tom separately</caption><tr><th>name</th><th>salary</th></tr><tr><td>Tom</td><td>95000</td></tr></table>
  <p><code>OFFSET 2</code> skips two <em>rows</em> (Ravi, Sara) and lands on Tom, who has the second-highest salary, not the third.</p>
  </div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Each category's share of total revenue, in %.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> revenue per category, divided by revenue of everything, times 100.</p>
  <p><strong>Idea:</strong> one <code>GROUP BY</code> gives the per-category totals. The grand total is the sum of those totals. <code>OVER ()</code> with nothing inside means "a window over all result rows", so <code>sum(...) OVER ()</code> adds up every group's total and repeats it on each row.</p>
  <div class="fx" data-lang="sql">SELECT p.category,
       sum(oi.qty * oi.unit_price) AS revenue,
       round(100.0 * sum(oi.qty * oi.unit_price) / sum(sum(oi.qty * oi.unit_price)) OVER (), 2) AS pct
FROM order_items oi
JOIN orders o   USING (order_id)
JOIN products p USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY p.category;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>category</th><th>revenue</th><th>pct</th></tr><tr><td>Furniture</td><td>350.00</td><td>13.21</td></tr><tr><td>Electronics</td><td>2300.00</td><td>86.79</td></tr></table>
  <p><strong>Walk through:</strong> non-cancelled revenue is Furniture 350 (Lamp 80 + Desk 150 + Lamp 120) and Electronics 2300 (Laptop 800 + Phone 500 + Phone 1000). Total 2650. Furniture: 350 / 2650 = 13.21%.</p>
  <p><code>sum(sum(...)) OVER ()</code>: the inner sum is per group, the window sums those over all groups. Use <code>100.0</code> to avoid integer division (section 07).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Pivot: one row per month, one revenue column per category.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> a small report table: months down the side, categories across the top, revenue in each cell. Turning a column's values into column headings is called a <strong>pivot</strong>.</p>
  <p><strong>Idea:</strong> SQL has no "make columns from values" button, so write one column per category by hand. <code>CASE WHEN category = 'Electronics' THEN revenue ELSE 0 END</code> keeps the amount for Electronics rows and 0 for others; summing that per month gives the Electronics cell.</p>
  <div class="fx" data-lang="sql">SELECT to_char(o.order_date, 'YYYY-MM') AS month,
       sum(CASE WHEN p.category = 'Electronics' THEN oi.qty * oi.unit_price ELSE 0 END) AS electronics,
       sum(CASE WHEN p.category = 'Furniture'   THEN oi.qty * oi.unit_price ELSE 0 END) AS furniture
FROM orders o
JOIN order_items oi USING (order_id)
JOIN products p     USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>electronics</th><th>furniture</th></tr><tr><td>2024-05</td><td>1300.00</td><td>80.00</td></tr><tr><td>2024-06</td><td>1000.00</td><td>150.00</td></tr><tr><td>2024-07</td><td>0</td><td>120.00</td></tr></table>
  <p><strong>Walk through:</strong> May has Laptop 800 + Phone 500 (electronics 1300) and Lamp 80 (furniture). July has only Lamp 120, so electronics is 0.</p>
  <p>Conditional aggregation: one <code>SUM(CASE …)</code> per output column. PostgreSQL shorthand: <code>sum(x) FILTER (WHERE category = 'Furniture')</code>, which gives NULL instead of 0 for empty cells.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>What is the median order value?</summary><div class="qa-body">
  <p><strong>In plain words:</strong> work out each order's total, sort the totals, pick the middle one. (The <strong>median</strong> is the middle value; unlike the average it ignores one huge order.)</p>
  <p><strong>Idea:</strong> first a CTE that gives one total per order. Then <code>percentile_cont(0.5)</code>, which means "the value at the 50% mark of the sorted list".</p>
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
  <p><strong>Walk through:</strong> totals are 120, 500, 880, 1150 (order 102 is cancelled). Four values have no single middle. <code>percentile_cont</code> takes the midpoint of the two middle ones, (500+880)/2 = 690; <code>percentile_disc</code> returns a real value from the list (500). Aggregate to order level <em>first</em>, or you get the median line item.</p></div></details>

  <h2 id="si-join"><span class="num">03</span>Joins</h2>
  <details class="qa"><summary><span class="qmark">Q</span>Find employees who earn more than their manager.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> put each employee next to their manager's row, then compare the two salaries.</p>
  <p><strong>Idea:</strong> the manager is also a row in <code>employees</code>. So join the table to itself: the copy named <code>e</code> plays "employee", the copy named <code>m</code> plays "manager", linked by <code>e.manager_id = m.emp_id</code>. This is a <strong>self-join</strong>.</p>
  <div class="fx" data-lang="sql">SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary
FROM employees e
JOIN employees m ON m.emp_id = e.manager_id
WHERE e.salary &gt; m.salary;</div>
  <table class="tbl out"><caption>Result (0 rows)</caption><tr><th>name</th><th>salary</th><th>manager</th><th>manager_salary</th></tr></table>
  <p><strong>Walk through:</strong> zero rows is a correct answer here. Nobody out-earns their manager in <code>shop</code>. When a query returns nothing, drop the <code>WHERE</code> to check the join itself works. Ravi (no manager) disappears in the inner join, which is right here.</p>
  <div class="fx" data-lang="sql">SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary
FROM employees e JOIN employees m ON m.emp_id = e.manager_id;</div>
  <table class="tbl out"><caption>Sanity check</caption><tr><th>name</th><th>salary</th><th>manager</th><th>manager_salary</th></tr><tr><td>Sara</td><td>95000</td><td>Ravi</td><td>120000</td></tr><tr><td>Tom</td><td>95000</td><td>Ravi</td><td>120000</td></tr><tr><td>Uma</td><td>70000</td><td>Ravi</td><td>120000</td></tr><tr><td>Vik</td><td>65000</td><td>Uma</td><td>70000</td></tr></table>
  </div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find customers who never placed an order.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> for each customer, look in <code>orders</code>; if nothing is there, keep the customer.</p>
  <p><strong>Idea:</strong> <code>NOT EXISTS (…)</code> is true when the inner query finds zero rows. The inner query uses the outer row's <code>c.customer_id</code>, so it is run once per customer.</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Dia</td></tr></table>
  <p><strong>Walk through:</strong> Asha, Ben and Chen each have at least one order row, so EXISTS is true and NOT EXISTS drops them. Dia has none: kept.</p>
  <p>This pattern ("rows with no match on the other side") is an <strong>anti-join</strong>. Equivalent: <code>LEFT JOIN orders o … WHERE o.order_id IS NULL</code>. Avoid <code>NOT IN (subquery)</code>: one NULL in the list returns nothing (see section 07).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Revenue per customer, including customers with zero.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> every customer appears, even those who bought nothing; their revenue shows as 0.</p>
  <p><strong>Idea:</strong> "every customer, even with no match" means start from <code>customers</code> and <code>LEFT JOIN</code> the rest: a left join keeps all left rows and fills the right side with NULLs when there is no match. <code>coalesce(x, 0)</code> turns that NULL sum into 0.</p>
  <div class="fx" data-lang="sql">SELECT c.name, coalesce(sum(oi.qty * oi.unit_price), 0) AS revenue
FROM customers c
LEFT JOIN orders o       ON o.customer_id = c.customer_id AND o.status &lt;&gt; 'cancelled'
LEFT JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY c.customer_id, c.name
ORDER BY revenue DESC, c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>revenue</th></tr><tr><td>Asha</td><td>1380.00</td></tr><tr><td>Chen</td><td>1270.00</td></tr><tr><td>Ben</td><td>0</td></tr><tr><td>Dia</td><td>0</td></tr></table>
  <p><strong>Walk through:</strong> Ben's only order is cancelled, so the <code>ON</code> condition rejects it and Ben keeps a NULL right side, which becomes 0. Dia never matched anything: also 0.</p>
  <p>The status filter goes in the <code>ON</code> clause. Put it in <code>WHERE</code> and Ben's and Dia's NULL rows fail the test (NULL is never "not cancelled"), silently turning the LEFT JOIN into an inner join (only Asha and Chen remain).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Per customer: number of orders and total items. Why does the obvious query overcount?</summary><div class="qa-body">
  <p><strong>In plain words:</strong> for each customer, how many orders and how many items in total. The trap: once you join the items table, one order becomes several rows (one per item line), so counting rows counts lines, not orders.</p>
  <p><strong>Idea:</strong> <code>count(DISTINCT o.order_id)</code> counts each order id once however many times it appears. <code>sum(oi.qty)</code> is fine, because each item line should be counted once.</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       count(*)                   AS wrong_orders,
       count(DISTINCT o.order_id) AS orders,
       sum(oi.qty)                AS items
FROM customers c
JOIN orders o       USING (customer_id)
JOIN order_items oi USING (order_id)
GROUP BY c.customer_id, c.name ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>wrong_orders</th><th>orders</th><th>items</th></tr><tr><td>Asha</td><td>3</td><td>2</td><td>4</td></tr><tr><td>Ben</td><td>1</td><td>1</td><td>1</td></tr><tr><td>Chen</td><td>3</td><td>2</td><td>6</td></tr></table>
  <p><strong>Walk through:</strong> Asha's order 100 has two lines (Laptop, Lamp) and order 101 has one, so after the join she has 3 rows. <code>count(*)</code> says 3 orders (wrong), <code>count(DISTINCT order_id)</code> says 2 (right), and qty 1 + 2 + 1 = 4 items.</p>
  <p>This row multiplication is called <strong>fan-out</strong>: after joining items, each order appears once per line, so <code>count(*)</code> counts lines. Use <code>COUNT(DISTINCT)</code>, or aggregate items per order in a CTE before joining. The picture shows Asha's rows before and after the join:</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="si-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="0" y="14" font-size="11" class="tm">Asha's orders (2 rows)</text>
    <rect x="0" y="24" width="120" height="30" rx="5" class="fb sb"/><text x="60" y="44" text-anchor="middle">order 100</text>
    <rect x="0" y="84" width="120" height="30" rx="5" class="ft st"/><text x="60" y="104" text-anchor="middle">order 101</text>
    <text x="200" y="14" font-size="11" class="tm">after JOIN order_items (3 rows)</text>
    <rect x="200" y="24" width="190" height="26" rx="5" class="fb sb"/><text x="295" y="42" text-anchor="middle">100 · Laptop ×1</text>
    <rect x="200" y="56" width="190" height="26" rx="5" class="fb sb"/><text x="295" y="74" text-anchor="middle">100 · Lamp ×2</text>
    <rect x="200" y="88" width="190" height="26" rx="5" class="ft st"/><text x="295" y="106" text-anchor="middle">101 · Phone ×1</text>
    <g stroke="currentColor"><line x1="120" y1="39" x2="198" y2="37" marker-end="url(#si-ar)"/><line x1="120" y1="39" x2="198" y2="69" marker-end="url(#si-ar)"/><line x1="120" y1="99" x2="198" y2="101" marker-end="url(#si-ar)"/></g>
    <text x="410" y="42" class="tr">count(*) = 3 ✗</text>
    <text x="410" y="74" class="tg">count(DISTINCT) = 2</text>
    <text x="410" y="106">sum(qty) = 4 ✓</text>
    <text x="0" y="140" font-size="11" class="tm">order 100 now appears twice: anything counted per order is inflated</text>
  </svg><figcaption>Fan-out: a 1-row-per-order table joined to a 1-row-per-item table repeats each order once per line.</figcaption></figure></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>List pairs of customers who live in the same city, each pair once.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> match every customer with every other customer in the same city, but don't pair someone with themselves, and don't list both "Asha–Chen" and "Chen–Asha".</p>
  <p><strong>Idea:</strong> self-join on city. The condition <code>a.customer_id &lt; b.customer_id</code> does two jobs: a row can't pair with itself (1 &lt; 1 is false), and of the two orderings only the one with the smaller id first survives.</p>
  <div class="fx" data-lang="sql">SELECT a.name AS customer_1, b.name AS customer_2, a.city
FROM customers a
JOIN customers b ON a.city = b.city AND a.customer_id &lt; b.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_1</th><th>customer_2</th><th>city</th></tr><tr><td>Asha</td><td>Chen</td><td>Mumbai</td></tr></table>
  <p><strong>Walk through:</strong> Mumbai has Asha (1) and Chen (3): the pair (1, 3) passes, (3, 1) fails. Delhi has only Ben. Dia's city is NULL, and <code>NULL = NULL</code> is not true, so she never pairs with anyone, not even herself. <code>&lt;</code> (not <code>&lt;&gt;</code>) removes both self-pairs and mirror duplicates.</p></div></details>

  <h2 id="si-cte"><span class="num">04</span>Subqueries &amp; CTEs</h2>
  <details class="qa"><summary><span class="qmark">Q</span>Products priced above their category's average.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> compare each product's price with the average of <em>its own</em> category, not the overall average.</p>
  <p><strong>Idea:</strong> the inner query computes an average, but it uses <code>p.category</code> from the outer row, so it gives a different average for each product's category. A subquery that refers to the outer row is called <strong>correlated</strong>.</p>
  <div class="fx" data-lang="sql">SELECT name, category, price
FROM products p
WHERE price &gt; (SELECT avg(price) FROM products WHERE category = p.category);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>category</th><th>price</th></tr><tr><td>Laptop</td><td>Electronics</td><td>800.00</td></tr><tr><td>Desk</td><td>Furniture</td><td>150.00</td></tr></table>
  <p><strong>Walk through:</strong> Electronics average = (800 + 500) / 2 = 650, so Laptop (800) passes and Phone doesn't. Furniture average = (150 + 40) / 2 = 95, so Desk passes.</p>
  <p>The subquery re-runs per outer row using <code>p.category</code>. Window version: <code>avg(price) OVER (PARTITION BY category)</code> in a CTE, then filter.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Customers who bought from both Electronics and Furniture.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> a customer counts only if their purchases include at least one Electronics item <em>and</em> at least one Furniture item.</p>
  <p><strong>Idea:</strong> keep only rows in those two categories, group per customer, and ask how many <em>different</em> categories the group contains. Two means both.</p>
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
  <p><strong>Walk through:</strong> Asha bought Laptop + Lamp (both categories). Chen bought Phone + Desk + Lamp (both). Ben's only order is cancelled, so it is filtered out before grouping.</p>
  <p>"Bought both X and Y" = filter to X or Y, then require 2 distinct values per group. <code>WHERE category = 'X' AND category = 'Y'</code> is always empty: one row has one category.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Top-selling product (by revenue) in each category.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> one winner per category: the product that earned the most money there.</p>
  <p><strong>Idea:</strong> three steps, one CTE each. (1) Revenue per product. (2) Rank products inside each category: <code>PARTITION BY category</code> means "restart the ranking for every category". (3) Keep rank 1.</p>
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
  <p><strong>Walk through:</strong> Electronics: Phone 500 + 1000 = 1500 beats Laptop 800. Furniture: Lamp 80 + 120 = 200 beats Desk 150 (Ben's cancelled Desk doesn't count).</p>
  <p>Aggregate → rank within partition → keep rank 1. <code>RANK</code> keeps ties; <code>ROW_NUMBER</code> picks one arbitrarily. Including cancelled orders flips Furniture to Desk (300 vs 200): define revenue first.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>A <code>signups</code> table has duplicate emails. Find them.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> which emails appear more than once, and in which rows?</p>
  <p><strong>Idea:</strong> group by email and count. <code>array_agg(id)</code> collects the ids of each group into a list so you can see which rows are the copies. (This table is created in my own copy of the database, not in <code>shop</code>.)</p>
  <div class="fx" data-lang="sql">CREATE TABLE signups (id int PRIMARY KEY, email text, signed_up date);
INSERT INTO signups VALUES
 (1, 'asha@x.com', '2024-01-05'), (2, 'ben@x.com', '2024-02-10'), (3, 'asha@x.com', '2024-01-06'),
 (4, 'chen@x.com', '2024-03-15'), (5, 'ben@x.com', '2024-02-10'), (6, 'asha@x.com', '2024-01-09');

SELECT email, count(*) AS copies, array_agg(id ORDER BY id) AS ids
FROM signups GROUP BY email HAVING count(*) &gt; 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>email</th><th>copies</th><th>ids</th></tr><tr><td>asha@x.com</td><td>3</td><td>{1,3,6}</td></tr><tr><td>ben@x.com</td><td>2</td><td>{2,5}</td></tr></table>
  <p><strong>Walk through:</strong> asha@x.com is in rows 1, 3 and 6; ben@x.com in 2 and 5; chen@x.com only once, so it is dropped by <code>HAVING</code>.</p>
  <p>Group by the columns that define "duplicate", keep groups with count &gt; 1. Real data also needs <code>lower(trim(email))</code> so "Asha@X.com " counts as the same address.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Delete the duplicates, keeping the earliest row per email.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> for each email, keep the row with the smallest id and delete the rest.</p>
  <p><strong>Idea:</strong> number the rows inside each email group, 1 for the smallest id. Anything numbered 2 or more is a copy. Collect those ids, then delete them.</p>
  <div class="fx" data-lang="sql">DELETE FROM signups
WHERE id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (PARTITION BY email ORDER BY id) AS rn
    FROM signups) t
  WHERE rn &gt; 1);
SELECT * FROM signups ORDER BY id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>id</th><th>email</th><th>signed_up</th></tr><tr><td>1</td><td>asha@x.com</td><td>2024-01-05</td></tr><tr><td>2</td><td>ben@x.com</td><td>2024-02-10</td></tr><tr><td>4</td><td>chen@x.com</td><td>2024-03-15</td></tr></table>
  <p><strong>Walk through:</strong> asha's rows get rn 1 (id 1), 2 (id 3), 3 (id 6); ben's get 1 (id 2), 2 (id 5). Ids 3, 6 and 5 are deleted. Three rows remain.</p>
  <p>Number rows within each duplicate group; delete everything except <code>rn = 1</code>. PostgreSQL alternative: <code>DELETE FROM signups a USING signups b WHERE a.email = b.email AND a.id &gt; b.id</code>. Then add a UNIQUE constraint so it can't recur.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Show the reporting chain for every employee, starting from the CEO.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> for each person, the path of bosses from the top down to them, like "Ravi &gt; Uma &gt; Vik".</p>
  <p><strong>Idea:</strong> you don't know how deep the tree goes, so you need a query that repeats itself. A <strong>recursive CTE</strong> has two parts joined by <code>UNION ALL</code>: the <em>anchor</em> (the starting rows: the person with no manager) and the <em>step</em> (find everyone whose manager is in the rows found so far). The step runs again and again until it finds nobody new.</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT emp_id, name, 1 AS level, name AS path
  FROM employees WHERE manager_id IS NULL          -- anchor: the top
  UNION ALL
  SELECT e.emp_id, e.name, c.level + 1, c.path || ' &gt; ' || e.name
  FROM employees e JOIN chain c ON e.manager_id = c.emp_id)  -- step: direct reports
SELECT name, level, path FROM chain ORDER BY path;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>level</th><th>path</th></tr><tr><td>Ravi</td><td>1</td><td>Ravi</td></tr><tr><td>Sara</td><td>2</td><td>Ravi &gt; Sara</td></tr><tr><td>Tom</td><td>2</td><td>Ravi &gt; Tom</td></tr><tr><td>Uma</td><td>2</td><td>Ravi &gt; Uma</td></tr><tr><td>Vik</td><td>3</td><td>Ravi &gt; Uma &gt; Vik</td></tr></table>
  <p><strong>Walk through:</strong> round 1 (anchor): Ravi, level 1. Round 2: everyone whose manager is Ravi: Sara, Tom, Uma, level 2. Round 3: whose manager is Sara, Tom or Uma: Vik, level 3. Round 4 finds nobody, so it stops. Each row's <code>path</code> is its parent's path plus its own name.</p></div></details>

  <h2 id="si-win"><span class="num">05</span>Window Functions</h2>
  <p>A <strong>window function</strong> adds a calculated column to each row (a rank, a running total, the previous row's value) without collapsing the rows the way <code>GROUP BY</code> does. <code>OVER (PARTITION BY x ORDER BY y)</code> says: do the calculation separately within each group x, in the order y.</p>
  <details class="qa"><summary><span class="qmark">Q</span>Each customer's latest order.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> one row per customer, showing their most recent order.</p>
  <p><strong>Idea:</strong> within each customer, sort orders newest first and number them 1, 2, 3 (<code>ROW_NUMBER</code>). The latest order is always number 1. Then keep <code>rn = 1</code>.</p>
  <div class="fx" data-lang="sql">WITH r AS (
  SELECT customer_id, order_id, order_date,
         row_number() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) AS rn
  FROM orders)
SELECT c.name, r.order_id, r.order_date
FROM r JOIN customers c USING (customer_id)
WHERE rn = 1 ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>order_date</th></tr><tr><td>Asha</td><td>101</td><td>2024-05-20</td></tr><tr><td>Ben</td><td>102</td><td>2024-06-02</td></tr><tr><td>Chen</td><td>104</td><td>2024-07-01</td></tr></table>
  <p><strong>Walk through:</strong> Asha's orders sorted newest first: 101 (20 May) gets rn 1, 100 gets rn 2. Chen: 104 then 103. Ben has only 102. Dia has no orders, so she has no row.</p>
  <p>"Latest / first per group" = <code>ROW_NUMBER</code> + <code>rn = 1</code>. Add a tie-breaker (<code>order_id</code>) so the result is deterministic. PostgreSQL shortcut: <code>DISTINCT ON (customer_id) … ORDER BY customer_id, order_date DESC</code>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Joining back on <code>max(order_date)</code> returns two rows if a customer has two orders on the same day.</p></div></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Running total of revenue by date.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> for each day, the revenue of that day plus all days before it, like a bank passbook's balance column.</p>
  <p><strong>Idea:</strong> first one row per day. Then <code>sum(revenue) OVER (ORDER BY order_date)</code>: a sum that, for each row, includes only rows up to and including that date.</p>
  <div class="fx" data-lang="sql">WITH daily AS (
  SELECT o.order_date, sum(oi.qty * oi.unit_price) AS revenue
  FROM orders o JOIN order_items oi USING (order_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY o.order_date)
SELECT order_date, revenue,
       sum(revenue) OVER (ORDER BY order_date) AS running_total
FROM daily ORDER BY order_date;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_date</th><th>revenue</th><th>running_total</th></tr><tr><td>2024-05-01</td><td>880.00</td><td>880.00</td></tr><tr><td>2024-05-20</td><td>500.00</td><td>1380.00</td></tr><tr><td>2024-06-15</td><td>1150.00</td><td>2530.00</td></tr><tr><td>2024-07-01</td><td>120.00</td><td>2650.00</td></tr></table>
  <p><strong>Walk through:</strong> 880, then 880 + 500 = 1380, then + 1150 = 2530, then + 120 = 2650.</p>
  <p>Aggregate to one row per day first. <code>ORDER BY</code> inside <code>OVER</code> makes the sum cumulative. Default frame is <code>RANGE</code>, which lumps equal dates together; use <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> for strict row-by-row.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Top 2 earners in each department, keeping ties.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> in each department, the people with the two highest salaries; if two people share a salary, show both.</p>
  <p><strong>Idea:</strong> rank within each department (<code>PARTITION BY dept</code>) using <code>DENSE_RANK</code> so ties share a rank, then keep ranks 1 and 2.</p>
  <div class="fx" data-lang="sql">SELECT dept, name, salary, rk
FROM (SELECT dept, name, salary,
             dense_rank() OVER (PARTITION BY dept ORDER BY salary DESC) AS rk
      FROM employees) t
WHERE rk &lt;= 2 ORDER BY dept, rk, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dept</th><th>name</th><th>salary</th><th>rk</th></tr><tr><td>Eng</td><td>Ravi</td><td>120000</td><td>1</td></tr><tr><td>Eng</td><td>Sara</td><td>95000</td><td>2</td></tr><tr><td>Eng</td><td>Tom</td><td>95000</td><td>2</td></tr><tr><td>Sales</td><td>Uma</td><td>70000</td><td>1</td></tr><tr><td>Sales</td><td>Vik</td><td>65000</td><td>2</td></tr></table>
  <p><strong>Walk through:</strong> Eng: Ravi rank 1, Sara and Tom both rank 2, so three rows. Sales: Uma 1, Vik 2.</p>
  <p>Eng returns 3 people because Sara and Tom tie. Say which you want: <code>ROW_NUMBER</code> = exactly 2 rows; <code>RANK</code>/<code>DENSE_RANK</code> = keep ties. Window results can't go in <code>WHERE</code> directly, hence the subquery.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Days between each order and the same customer's previous order.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> next to each order, how many days since that customer's last order.</p>
  <p><strong>Idea:</strong> <code>LAG(order_date)</code> fetches the previous row's date within the same customer, sorted by date. Subtract it from the current date.</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date,
       order_date - lag(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS days_since_prev
FROM orders ORDER BY customer_id, order_date;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th><th>days_since_prev</th></tr><tr><td>1</td><td>100</td><td>2024-05-01</td><td>NULL</td></tr><tr><td>1</td><td>101</td><td>2024-05-20</td><td>19</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td><td>NULL</td></tr><tr><td>3</td><td>103</td><td>2024-06-15</td><td>NULL</td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td><td>16</td></tr></table>
  <p><strong>Walk through:</strong> Asha: 20 May − 1 May = 19 days. Chen: 1 July − 15 June = 16. <code>LAG</code> reads the previous row in the partition; the first order has none, so NULL. <code>LEAD</code> reads the next one.</p></div></details>

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
  <p><strong>In plain words:</strong> revenue per month, and how much it rose or fell compared with the month before, in percent.</p>
  <p><strong>Idea:</strong> <code>date_trunc('month', d)</code> turns any date into the first of its month, so grouping by it gives one row per month. <code>LAG</code> brings the previous month's revenue onto the current row. Growth = (this − previous) / previous × 100.</p>
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
  <p><strong>Walk through:</strong> June: (1150 − 1380) / 1380 = −16.7%. July: (120 − 1150) / 1150 = −89.6%. May has no previous month, so NULL.</p>
  <p><code>NULLIF(prev, 0)</code> returns NULL when prev is 0, so a divide-by-zero becomes NULL instead of an error. If a month has no sales, <code>LAG</code> skips it silently: fill gaps first (next question).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Orders per month for Jan–Jul 2024, showing months with zero.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> a row for every month, even months with no orders.</p>
  <p><strong>Idea:</strong> a <code>GROUP BY</code> can only show months that exist in the data. So build a list of all months with <code>generate_series</code> (a function that produces a sequence: 1 Jan, 1 Feb, …) and LEFT JOIN the orders onto it.</p>
  <div class="fx" data-lang="sql">SELECT m::date AS month, count(o.order_id) AS orders
FROM generate_series('2024-01-01'::date, '2024-07-01', '1 month') m
LEFT JOIN orders o ON date_trunc('month', o.order_date) = m
GROUP BY m ORDER BY m;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>orders</th></tr><tr><td>2024-01-01</td><td>0</td></tr><tr><td>2024-02-01</td><td>0</td></tr><tr><td>2024-03-01</td><td>0</td></tr><tr><td>2024-04-01</td><td>0</td></tr><tr><td>2024-05-01</td><td>2</td></tr><tr><td>2024-06-01</td><td>2</td></tr><tr><td>2024-07-01</td><td>1</td></tr></table>
  <p><strong>Walk through:</strong> January to April match no orders, so their right side is NULL and <code>count(o.order_id)</code> is 0. May has 2 (100, 101), June 2 (102, 103), July 1 (104).</p>
  <p>Missing periods don't exist in the data, so generate a calendar and LEFT JOIN to it. Count a column from the right side (<code>count(o.order_id)</code>), not <code>count(*)</code>, or empty months show 1.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Days from signup to first order, per customer.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> how long each customer waited between joining and buying for the first time.</p>
  <p><strong>Idea:</strong> the first order is the <code>min(order_date)</code> per customer. Subtracting two dates gives a number of days. LEFT JOIN keeps Dia.</p>
  <div class="fx" data-lang="sql">SELECT c.name, c.signup_date, min(o.order_date) AS first_order,
       min(o.order_date) - c.signup_date AS days_to_first
FROM customers c LEFT JOIN orders o USING (customer_id)
GROUP BY c.customer_id, c.name, c.signup_date ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>signup_date</th><th>first_order</th><th>days_to_first</th></tr><tr><td>Asha</td><td>2024-01-05</td><td>2024-05-01</td><td>117</td></tr><tr><td>Ben</td><td>2024-02-10</td><td>2024-06-02</td><td>113</td></tr><tr><td>Chen</td><td>2024-03-15</td><td>2024-06-15</td><td>92</td></tr><tr><td>Dia</td><td>2024-04-20</td><td>NULL</td><td>NULL</td></tr></table>
  <p><strong>Walk through:</strong> Asha signed up 5 Jan and first ordered 1 May: 117 days. Dia has no order, so <code>min</code> is NULL and NULL − date is NULL.</p>
  <p>In PostgreSQL, <code>date − date</code> = integer days. Dia stays with NULL thanks to the LEFT JOIN; "never ordered" is not "0 days".</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find users with a login streak of 3 or more consecutive days.</summary><div class="qa-body">
  <p><strong>In plain words:</strong> which users logged in on three or more days in a row, and when did each run start and end?</p>
  <p><strong>Idea:</strong> a trick worth memorising. Number each user's login days 1, 2, 3, … in date order. Inside a run of consecutive days, the date and the row number both go up by one each step, so <code>date − row_number</code> stays the same. When a day is skipped, the date jumps but the number doesn't, so the difference changes. That difference is a label for each run. Group by the label and count.</p>
  <div class="fx" data-lang="sql">WITH d AS (SELECT DISTINCT user_id, login_date FROM logins),
g AS (
  SELECT user_id, login_date,
         login_date - row_number() OVER (PARTITION BY user_id ORDER BY login_date)::int AS grp
  FROM d)
SELECT user_id, min(login_date) AS streak_start, max(login_date) AS streak_end, count(*) AS days
FROM g GROUP BY user_id, grp
HAVING count(*) &gt;= 3 ORDER BY user_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>user_id</th><th>streak_start</th><th>streak_end</th><th>days</th></tr><tr><td>1</td><td>2024-07-01</td><td>2024-07-03</td><td>3</td></tr><tr><td>2</td><td>2024-07-08</td><td>2024-07-11</td><td>4</td></tr></table>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <g font-size="11" class="tm"><text x="0" y="24">login_date</text><text x="0" y="56">row_number</text><text x="0" y="88">date − rn</text></g>
    <g text-anchor="middle">
      <rect x="100" y="8" width="84" height="88" rx="5" class="fb sb"/><rect x="190" y="8" width="84" height="88" rx="5" class="fb sb"/><rect x="280" y="8" width="84" height="88" rx="5" class="fb sb"/>
      <rect x="410" y="8" width="84" height="88" rx="5" class="ft st"/><rect x="500" y="8" width="84" height="88" rx="5" class="ft st"/>
      <text x="142" y="24">07-01</text><text x="232" y="24">07-02</text><text x="322" y="24">07-03</text><text x="452" y="24">07-05</text><text x="542" y="24">07-06</text>
      <text x="142" y="56">1</text><text x="232" y="56">2</text><text x="322" y="56">3</text><text x="452" y="56">4</text><text x="542" y="56">5</text>
      <text x="142" y="88" class="tb">06-30</text><text x="232" y="88" class="tb">06-30</text><text x="322" y="88" class="tb">06-30</text><text x="452" y="88" class="tg">07-01</text><text x="542" y="88" class="tg">07-01</text>
      <text x="232" y="118" class="tb">island 1: 3 days ✓</text><text x="497" y="118" class="tg">island 2: 2 days</text>
      <text x="387" y="56" class="tr">gap</text>
    </g>
  </svg><figcaption>User 1: both columns rise by 1 inside a run, so their difference is a constant label. The gap (07-04) bumps the label.</figcaption></figure>
  <p><strong>Walk through:</strong> in the picture, user 1's first three logins all get label 06-30 (an "island" of 3 days); after the gap on 07-04, the label becomes 07-01 for a 2-day island. Only islands with 3+ days are kept: user 1 (1–3 July) and user 2 (8–11 July).</p>
  <p>This family of problems is called <strong>gaps and islands</strong>: <code>date − row_number</code> labels each run. <code>DISTINCT</code> first: user 1's double login on 07-02 would break the trick.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>7-day retention by weekly cohort: what % of users came back within 7 days of their first login?</summary><div class="qa-body">
  <p><strong>In plain words:</strong> group users by the week they first showed up (a <strong>cohort</strong> is a group that started together). For each group, what share came back at least once in the next 7 days? Product teams call this <strong>retention</strong>.</p>
  <p><strong>Idea:</strong> three steps. (1) Each user's first login day. (2) A true/false flag: is there any login in days 1 to 7 after it? (3) Group by the week of the first day; count users and count flagged users.</p>
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
  <p><strong>Walk through:</strong> week of 1 July: users 1, 2, 3, 4 started. Users 1, 2, 4 came back within 7 days (user 2 on 8 July, exactly day 7); user 3 never did. 3 of 4 = 75%. Week of 8 July: users 5 and 6; only user 6 returned (user 5 came back after 12 days). 1 of 2 = 50%.</p>
  <p><code>count(*) FILTER (WHERE retained)</code> counts only rows where the flag is true. Clarify the window: "on day 7" and "within 7 days" are different metrics.</p></div></details>

  <h2 id="si-null"><span class="num">07</span>Tricky NULL &amp; Edge Cases</h2>
  <p><strong>NULL</strong> means "unknown", not zero and not empty. Any comparison with NULL (<code>= NULL</code>, <code>&lt;&gt; NULL</code>) gives neither true nor false but a third answer, <strong>unknown</strong>. <code>WHERE</code> keeps only rows whose test is true, so an unknown row is quietly dropped. Most "the query looks right but the answer is wrong" bugs come from this.</p>
  <details class="qa"><summary><span class="qmark">Q</span>Find employees who are not anyone's manager. Why does this return nothing?</summary><div class="qa-body">
  <p><strong>In plain words:</strong> the people who appear in nobody's <code>manager_id</code> column. The query looks right, yet returns zero rows.</p>
  <div class="fx" data-lang="sql">SELECT name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees);</div>
  <table class="tbl out"><caption>Result (0 rows)</caption><tr><th>name</th></tr></table>
  <p><strong>Why:</strong> Ravi's <code>manager_id</code> is NULL, so the list is (1, 1, 1, 4, NULL). <code>x NOT IN (list)</code> means "x is different from every item". Follow Sara (id 2):</p>
  <div class="flow"><span>2 NOT IN (1, 4, NULL)</span><span>2 &lt;&gt; 1 AND 2 &lt;&gt; 4 AND 2 &lt;&gt; NULL</span><span>TRUE AND TRUE AND UNKNOWN</span><span>UNKNOWN → row dropped</span></div>
  <div class="fx" data-lang="sql">SELECT name FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.emp_id)
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Fixed</caption><tr><th>name</th></tr><tr><td>Sara</td></tr><tr><td>Tom</td></tr><tr><td>Vik</td></tr></table>
  <p><strong>Walk through:</strong> <code>NOT EXISTS</code> asks "is there any row whose manager_id equals this person's id?" A NULL manager_id simply never equals anything, so it is ignored instead of poisoning the whole test. Ravi and Uma are managers; Sara, Tom and Vik are not.</p>
  </div></details>

  <details class="qa"><summary><span class="qmark">Q</span>"Customers not in Mumbai": why is Dia missing?</summary><div class="qa-body">
  <p><strong>In plain words:</strong> <code>WHERE city &lt;&gt; 'Mumbai'</code> returns only Ben. Dia's city is unknown, and "unknown is not Mumbai" is itself unknown, so she is dropped. The query below shows both tests side by side:</p>
  <div class="fx" data-lang="sql">SELECT name, city,
       city &lt;&gt; 'Mumbai'                AS ne,
       city IS DISTINCT FROM 'Mumbai' AS distinct_from
FROM customers ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>city</th><th>ne</th><th>distinct_from</th></tr><tr><td>Asha</td><td>Mumbai</td><td>f</td><td>f</td></tr><tr><td>Ben</td><td>Delhi</td><td>t</td><td>t</td></tr><tr><td>Chen</td><td>Mumbai</td><td>f</td><td>f</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td><td>t</td></tr></table>
  <p><strong>Walk through:</strong> the <code>ne</code> column is NULL for Dia; the <code>distinct_from</code> column is true, because <code>IS DISTINCT FROM</code> treats NULL as just another value that is different from 'Mumbai'. <code>NULL &lt;&gt; 'Mumbai'</code> is NULL, and <code>WHERE</code> keeps only TRUE. Use <code>IS DISTINCT FROM</code> or add <code>OR city IS NULL</code> if unknown cities should count.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>What fraction of orders were cancelled? Why does the first attempt say 0?</summary><div class="qa-body">
  <p><strong>In plain words:</strong> 1 cancelled out of 5 orders should give 0.20. The first column gives 0.</p>
  <p><strong>Idea:</strong> both counts are whole numbers (integers), and SQL divides integers the way primary school long division does, throwing away the remainder: 1 ÷ 5 = 0. Make one side a decimal (<code>::numeric</code>) and the answer becomes 0.20.</p>
  <div class="fx" data-lang="sql">SELECT count(*) FILTER (WHERE status = 'cancelled') / count(*)                  AS wrong,
       round(count(*) FILTER (WHERE status = 'cancelled')::numeric / count(*), 2) AS rate,
       round(avg((status = 'cancelled')::int), 2)                                AS rate_avg
FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>wrong</th><th>rate</th><th>rate_avg</th></tr><tr><td>0</td><td>0.20</td><td>0.20</td></tr></table>
  <p>Integer ÷ integer truncates: 1/5 = 0. Cast one side. The <code>avg(boolean::int)</code> trick: <code>status = 'cancelled'</code> is true or false, <code>::int</code> makes it 1 or 0, and the average of (0, 0, 1, 0, 0) is 0.20. It gives any rate in one step.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Total qty for an order that doesn't exist: 0 or NULL?</summary><div class="qa-body">
  <p><strong>In plain words:</strong> sum the quantities of order 999, which has no rows. Common sense says 0; SQL says NULL for SUM.</p>
  <div class="fx" data-lang="sql">SELECT sum(qty) AS s, count(*) AS c, coalesce(sum(qty), 0) AS s_fixed
FROM order_items WHERE order_id = 999;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>s</th><th>c</th><th>s_fixed</th></tr><tr><td>NULL</td><td>0</td><td>0</td></tr></table>
  <p>Aggregates over zero rows: <code>COUNT</code> gives 0, but <code>SUM</code>, <code>AVG</code>, <code>MAX</code> give NULL. Wrap in <code>COALESCE</code> when a number is expected. (With <code>GROUP BY</code>, empty groups don't appear at all.)</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Is an event at 2024-05-20 10:30 "between 1 May and 20 May"?</summary><div class="qa-body">
  <p><strong>In plain words:</strong> a human says yes, it happened on 20 May. <code>BETWEEN</code> says no, because the date <code>'2024-05-20'</code> with no time means 20 May at 00:00, and 10:30 is after that.</p>
  <div class="fx" data-lang="sql">SELECT TIMESTAMP '2024-05-20 10:30' BETWEEN '2024-05-01' AND '2024-05-20' AS with_between,
       TIMESTAMP '2024-05-20 10:30' &gt;= '2024-05-01'
   AND TIMESTAMP '2024-05-20 10:30' &lt;  '2024-05-21'                         AS half_open;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>with_between</th><th>half_open</th></tr><tr><td>f</td><td>t</td></tr></table>
  <p><code>'2024-05-20'</code> as a timestamp means midnight, so anything later that day is excluded. For timestamps always use <strong>half-open ranges</strong> (start included, end excluded): <code>&gt;= start AND &lt; day after end</code>. Then 20 May 23:59 is in and 21 May 00:00 is out, with no gap and no overlap.</p></div></details>

  <h2 id="si-rapid"><span class="num">08</span>Conceptual Rapid-Fire</h2>
  <p>Short "explain the difference" questions. Interviewers use them as warm-ups; answer in two or three sentences with one example.</p>
  <details class="qa"><summary><span class="qmark">Q</span>WHERE vs HAVING?</summary><div class="qa-body"><code>WHERE</code> filters rows before grouping and can't use aggregates. <code>HAVING</code> filters groups after aggregation. Example: <code>WHERE status &lt;&gt; 'cancelled'</code> drops rows first; <code>HAVING count(*) &gt; 1</code> drops whole customers after counting. Put non-aggregate filters in <code>WHERE</code>: fewer rows reach the grouping.</div></details>
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
  Cities are Mumbai, Delhi, Mumbai, NULL plus an extra 'Delhi'. <code>UNION</code> removes duplicates (Mumbai, Delhi, NULL = 3 rows; a sort or hash, so slower; NULLs count as equal here). <code>UNION ALL</code> keeps every row (5). Default to <code>UNION ALL</code> unless you need de-duplication.</div></details>
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
  <details class="qa"><summary><span class="qmark">Q</span>Clustered vs non-clustered index?</summary><div class="qa-body">An index is a sorted lookup structure that lets the database find rows without reading the whole table. A <strong>clustered</strong> index <em>is</em> the table: rows are stored in key order, so only one per table (SQL Server, MySQL InnoDB's primary key). A <strong>non-clustered</strong> index is a separate structure pointing to the rows; you can have many. PostgreSQL tables are heaps, so every index is non-clustered (<code>CLUSTER</code> reorders once, not maintained).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Primary key vs unique key?</summary><div class="qa-body">Both enforce uniqueness with an index. A primary key is one per table, implies NOT NULL, and is the row's identity that foreign keys point to. A table can have many unique keys, and they allow NULLs (in PostgreSQL, multiple NULLs, since NULL ≠ NULL).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order does SQL evaluate a query? Can you use a SELECT alias in WHERE?</summary><div class="qa-body"><div class="flow"><span>FROM / JOIN</span><span>WHERE</span><span>GROUP BY</span><span>HAVING</span><span>SELECT</span><span>DISTINCT</span><span>ORDER BY</span><span>LIMIT</span></div>The database first picks the tables, then filters rows, then groups, then filters groups, and only then computes the SELECT list. So a SELECT alias doesn't exist yet in <code>WHERE</code> (error), but works in <code>ORDER BY</code>, which runs after SELECT. Window functions run at the SELECT stage, which is why you filter them in an outer query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>IN vs EXISTS vs JOIN for "customers who ordered"?</summary><div class="qa-body">All give Asha, Ben, Chen, and modern planners often produce the same plan. <code>EXISTS</code> stops at the first match and is NULL-safe in the negated form. A plain <code>JOIN</code> returns a customer once <em>per order</em>, so it needs <code>DISTINCT</code>: a classic duplicate bug.</div></details>

</main>`
});
