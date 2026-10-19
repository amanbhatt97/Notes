// notes/databases/sql_interview.js — Practice Q&A
Object.assign(TOPIC_CONTENT, {
  "sql_interview": `<main>
  <h1>Practice Q&amp;A</h1>
  <p class="lead">Interview-style SQL problems on the small <code>shop</code> database. For every problem you first see how to think about it, then the query is built one step at a time with the real table each step produces, and only then the final query. Every query here was run on PostgreSQL 16 and the tables are its real output. Try each problem yourself before opening it. Builds on <a class="xref" data-note="sql_joins">Joins</a>, <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a> and <a class="xref" data-note="sql_windows">Window Functions</a>.</p>

  <h2 id="si-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">SQL interview patterns</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Approach (every question)</div>
      <ul>
        <li><b>Grain</b> — what is one output row? include zero rows? cancelled orders?</li>
        <li><b>Tables + keys</b> — order-level × item-level join multiplies rows</li>
        <li><b>Build in steps</b> — run each CTE alone, look at its table, then add the next</li>
        <li><b>CTEs</b> — one idea each: filter → aggregate → rank → pick</li>
        <li><b>Edge cases</b> — ties, NULLs, duplicates, empty groups, ÷0, date boundaries</li>
        <li><b>Say assumptions out loud</b> — revenue = qty × unit_price, excl. cancelled</li>
        <li>💡 CTE = a kitchen prep bowl: chop, label the bowl, use it in the next step</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Group &amp; filter</div>
      <ul>
        <li><b>"per X"</b> → <code>GROUP BY x</code>; group by the id, not only the name</li>
        <li><b>WHERE</b> filters rows before grouping; <b>HAVING</b> filters groups after</li>
        <li><b>Share of total</b> — <code>100.0 * sum(x) / sum(sum(x)) OVER ()</code></li>
        <li><b>Pivot</b> — <code>sum(CASE WHEN cat = 'X' THEN v ELSE 0 END)</code> per column; PG <code>FILTER (WHERE …)</code></li>
        <li><b>Median</b> — <code>percentile_cont(0.5) WITHIN GROUP (ORDER BY t)</code>; aggregate to grain first</li>
        <li>💡 GROUP BY = sorting bills into one tray per customer</li>
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
        <li><b>Ties?</b> ROW_NUMBER exactly N · RANK 1,2,2,4 · DENSE_RANK 1,2,2,3</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Joins: existence, zeros, pairs</div>
      <ul>
        <li><b>"Never did X"</b> — <code>WHERE NOT EXISTS (SELECT 1 … = c.id)</code> or LEFT JOIN … <code>IS NULL</code></li>
        <li>⚠ <b>NOT IN (subquery)</b> — one NULL → zero rows</li>
        <li><b>Keep zeros</b> — LEFT JOIN from the "all" table + <code>coalesce(sum(x), 0)</code></li>
        <li>⚠ <b>Right-table filter in WHERE</b> → becomes inner join; put it in <code>ON</code></li>
        <li><b>"Bought both X and Y"</b> — <code>WHERE cat IN (X, Y) … HAVING count(DISTINCT cat) = 2</code></li>
        <li><b>Self-join</b> — employee vs manager: <code>JOIN employees m ON m.emp_id = e.manager_id</code></li>
        <li><b>Unique pairs</b> — <code>a.id &lt; b.id</code> (not <code>&lt;&gt;</code>)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Fan-out &amp; duplicates</div>
      <ul>
        <li><b>Fan-out</b> — joining 1-per-order to 1-per-item repeats orders</li>
        <li><b>Fix</b> — <code>count(DISTINCT o.order_id)</code> or aggregate in a CTE first</li>
        <li><b>Find dups</b> — <code>GROUP BY key HAVING count(*) &gt; 1</code></li>
        <li><b>Delete dups</b> — <code>row_number() OVER (PARTITION BY key ORDER BY id)</code>, delete <code>rn &gt; 1</code>; then add UNIQUE</li>
        <li><b>Recursive CTE</b> — anchor <code>UNION ALL</code> step joining back (org chart)</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Time series</div>
      <ul>
        <li><b>Previous row</b> — <code>lag(x) OVER (PARTITION BY u ORDER BY d)</code>; <code>lead</code> = next</li>
        <li><b>Growth %</b> — <code>(x - lag) / nullif(lag, 0)</code>; fill gaps first</li>
        <li><b>Missing months</b> — <code>generate_series</code> calendar LEFT JOIN data, <code>count(o.id)</code></li>
        <li><b>Running total</b> — <code>sum(x) OVER (ORDER BY d)</code>; ROWS frame for strict rows</li>
        <li><b>Streaks</b> — <code>d - row_number()</code> constant per run; DISTINCT first</li>
        <li><b>Retention</b> — first day per user → EXISTS activity in days 1–7 → group by cohort week</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">NULL &amp; boundary traps</div>
      <ul>
        <li><b><code>NULL &lt;&gt; 'x'</code></b> is NULL → row dropped; use <code>IS DISTINCT FROM</code></li>
        <li><b><code>count(col)</code></b> skips NULLs; <code>count(*)</code> doesn't</li>
        <li><b>Empty input</b> — COUNT → 0, SUM/AVG/MAX → NULL</li>
        <li><b>Integer ÷</b> — 1/5 = 0; cast or use <code>100.0</code></li>
        <li><b>BETWEEN on timestamps</b> — end date = midnight; use <code>&gt;= start AND &lt; end + 1 day</code></li>
        <li>💡 NULL = a blank box on a form: "not filled in", not zero</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Rapid-fire facts</div>
      <ul>
        <li><b>Logical order</b> — FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</li>
        <li><b>UNION</b> dedups (slower); <b>UNION ALL</b> keeps all</li>
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
      <div class="rm-item rm-done" data-target="si-how"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How to Approach a Question</span><span class="rm-sub">The shop data, grain, building in steps</span></div></div>
      <div class="rm-item rm-done" data-target="si-agg"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Basics &amp; Aggregation</span><span class="rm-sub">HAVING, Nth salary, share, pivot, median</span></div></div>
      <div class="rm-item rm-done" data-target="si-join"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Joins</span><span class="rm-sub">Self, anti, outer, fan-out, pairs</span></div></div>
      <div class="rm-item rm-done" data-target="si-cte"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Subqueries &amp; CTEs</span><span class="rm-sub">Top-N, duplicates, recursion</span></div></div>
      <div class="rm-item rm-done" data-target="si-win"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Window Functions</span><span class="rm-sub">Latest, running, ranked, previous</span></div></div>
      <div class="rm-item rm-done" data-target="si-date"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Dates &amp; Time</span><span class="rm-sub">Growth, gaps, streaks, retention</span></div></div>
      <div class="rm-item rm-done" data-target="si-null"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Tricky NULL &amp; Edge Cases</span><span class="rm-sub">Where correct-looking SQL lies</span></div></div>
      <div class="rm-item rm-done" data-target="si-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ten bugs interviewers look for</span></div></div>
      <div class="rm-item rm-done" data-target="si-rapid"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Conceptual Rapid-Fire</span><span class="rm-sub">Ten classic one-liners</span></div></div>
    </div>
  </div>

  <h2 id="si-how"><span class="num">01</span>How to Approach a Question</h2>
  <p>An interviewer shares a screen with a few tables and says "find the customers who ordered more than once". You have ten minutes and a blank editor. Most people panic and try to write the whole query in one go. Then a join doubles some rows, a filter drops a customer, and they cannot see why, because they never looked at the rows in between.</p>
  <p>The fix is simple: never write the full query first. Turn the English sentence into small steps. Run step 1 alone and look at the table it gives. Only when that table is right, add step 2 on top of it. Each answer on this page is built exactly this way, with the real table after every step, so you can check your own thinking against it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Making biryani. You don't throw raw rice, raw chicken and spices into one pot. You marinate the chicken in one bowl, half-boil the rice in another, fry the onions in a third, then layer them. If the dish tastes wrong, you can taste each bowl and find the problem. A <strong>CTE</strong> (Common Table Expression, written <code>WITH name AS (…)</code>) is one of those labelled bowls: a small named result you build once and use in the next step.</p>
  </div>
  <div class="flow"><span>1 · Clarify the grain</span><span>2 · Find the tables</span><span>3 · Build step by step (CTEs)</span><span>4 · Check edge cases</span></div>
  <div class="cards">
    <div><b>1 · Grain</b><p><strong>Grain</strong> = what one output row stands for: one customer? one month? Should customers with zero orders appear? Do cancelled orders count? Ask before writing.</p></div>
    <div><b>2 · Tables</b><p>Which tables hold the facts, and what is each one's key (the column that makes a row unique)? Joining a one-row-per-order table to a one-row-per-item table multiplies rows.</p></div>
    <div><b>3 · Steps</b><p>One idea per CTE: filter → aggregate → rank → pick. Say each step out loud while typing. Run it, look at the rows.</p></div>
    <div><b>4 · Edges</b><p>Ties, NULLs (blank values), duplicates, empty groups, divide by zero, date boundaries. Test the query in your head on each.</p></div>
  </div>
  <h3>The shop database</h3>
  <p>Every problem uses these five tiny tables. They are small on purpose: you can check every answer by hand. Read them once now; you will come back to them often.</p>
  <table class="tbl out"><caption>customers: one row per customer (Dia&#x27;s city is unknown)</caption><tr><th>customer_id</th><th>name</th><th>city</th><th>signup_date</th></tr><tr><td>1</td><td>Asha</td><td>Mumbai</td><td>2024-01-05</td></tr><tr><td>2</td><td>Ben</td><td>Delhi</td><td>2024-02-10</td></tr><tr><td>3</td><td>Chen</td><td>Mumbai</td><td>2024-03-15</td></tr><tr><td>4</td><td>Dia</td><td>NULL</td><td>2024-04-20</td></tr></table>
  <table class="tbl out"><caption>products</caption><tr><th>product_id</th><th>name</th><th>category</th><th>price</th></tr><tr><td>10</td><td>Laptop</td><td>Electronics</td><td>800.00</td></tr><tr><td>11</td><td>Phone</td><td>Electronics</td><td>500.00</td></tr><tr><td>12</td><td>Desk</td><td>Furniture</td><td>150.00</td></tr><tr><td>13</td><td>Lamp</td><td>Furniture</td><td>40.00</td></tr></table>
  <table class="tbl out"><caption>orders: one row per order (102 is cancelled)</caption><tr><th>order_id</th><th>customer_id</th><th>order_date</th><th>status</th></tr><tr><td>100</td><td>1</td><td>2024-05-01</td><td>delivered</td></tr><tr><td>101</td><td>1</td><td>2024-05-20</td><td>delivered</td></tr><tr><td>102</td><td>2</td><td>2024-06-02</td><td>cancelled</td></tr><tr><td>103</td><td>3</td><td>2024-06-15</td><td>delivered</td></tr><tr><td>104</td><td>3</td><td>2024-07-01</td><td>pending</td></tr></table>
  <table class="tbl out"><caption>order_items: one row per product line inside an order</caption><tr><th>order_id</th><th>product_id</th><th>qty</th><th>unit_price</th></tr><tr><td>100</td><td>10</td><td>1</td><td>800.00</td></tr><tr><td>100</td><td>13</td><td>2</td><td>40.00</td></tr><tr><td>101</td><td>11</td><td>1</td><td>500.00</td></tr><tr><td>102</td><td>12</td><td>1</td><td>150.00</td></tr><tr><td>103</td><td>11</td><td>2</td><td>500.00</td></tr><tr><td>103</td><td>12</td><td>1</td><td>150.00</td></tr><tr><td>104</td><td>13</td><td>3</td><td>40.00</td></tr></table>
  <table class="tbl out"><caption>employees: manager_id points to another employee&#x27;s emp_id</caption><tr><th>emp_id</th><th>name</th><th>dept</th><th>salary</th><th>manager_id</th></tr><tr><td>1</td><td>Ravi</td><td>Eng</td><td>120000</td><td>NULL</td></tr><tr><td>2</td><td>Sara</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>3</td><td>Tom</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>4</td><td>Uma</td><td>Sales</td><td>70000</td><td>1</td></tr><tr><td>5</td><td>Vik</td><td>Sales</td><td>65000</td><td>4</td></tr></table>
  <p>Notice the shape. <code>orders</code> has one row per order, but <code>order_items</code> has one row per line, so order 100 (a Laptop and two Lamps) has two lines. Dia has no orders. Ravi has no manager (NULL). Each of these details is the trap in at least one question below.</p>
  <h3>A CTE in one minute</h3>
  <p>Before the problems, here is the CTE syntax on a tiny example, so it is not new later. We want products that cost more than 100, and from those, only the names.</p>
  <div class="fx" data-lang="sql">WITH pricey AS (                       -- step 1: a named bowl of rows
  SELECT * FROM products WHERE price &gt; 100)
SELECT name FROM pricey ORDER BY name; -- step 2: use the bowl like a table</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Desk</td></tr><tr><td>Laptop</td></tr><tr><td>Phone</td></tr></table>
  <p><code>WITH pricey AS (…)</code> runs the inner query and names its result <code>pricey</code>. The final <code>SELECT</code> reads <code>pricey</code> exactly like a real table. You can chain several: <code>WITH a AS (…), b AS (SELECT … FROM a) SELECT … FROM b</code>. While building, run each bowl alone (just its inner SELECT) to see its rows.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>CTE</strong>: a temporary named result defined with <code>WITH</code>, visible only inside that one statement. <strong>Grain</strong>: what one row of a table or result represents. <strong>Revenue</strong> on this page = <code>qty * unit_price</code> from <code>order_items</code>, excluding cancelled orders, unless the question says otherwise. Stating this out loud in an interview is itself a point scored.</p>
  </div>
  <p>Why it matters: SQL rounds appear in almost every data analyst, data scientist and backend interview, usually as 3–5 problems in 45 minutes. The same patterns (top-N per group, anti-join, running total, retention) are what you will write every week at work on real tables with millions of rows, where a silent row-doubling bug becomes a wrong number in a board report.</p>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>

  <h2 id="si-agg"><span class="num">02</span>Basics &amp; Aggregation</h2>
  <p>Most questions start with "per something": per customer, per category, per month. That phrase means <code>GROUP BY</code>. Grouping collapses many rows into one row per group, and an <strong>aggregate</strong> function (<code>count</code>, <code>sum</code>, <code>avg</code>, <code>max</code>) squashes each group's values into one number.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kirana shop owner has a pile of bills at night. She sorts them into one tray per customer (GROUP BY customer), then counts the bills in each tray (count). <code>WHERE</code> is throwing away torn bills <em>before</em> sorting. <code>HAVING</code> is throwing away whole trays <em>after</em> counting, for example "trays with only one bill".</p>
  </div>

  <details class="qa"><summary><span class="qmark">Q</span>Which customers placed more than one order?</summary><div class="qa-body">
  <p><strong>How to think:</strong> the grain is "one row per customer". We need each customer's name (in <code>customers</code>) and their orders (in <code>orders</code>), so first join the two. Then count per customer. "More than one" is a test on the count, and a count only exists after grouping, so that test must go in <code>HAVING</code>.</p>
  <p><strong>Step 1, join:</strong> put the customer's name on each order row and look at it.</p>
  <div class="fx" data-lang="sql">SELECT c.customer_id, c.name, o.order_id
FROM customers c JOIN orders o USING (customer_id)
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>After the join: one row per order</caption><tr><th>customer_id</th><th>name</th><th>order_id</th></tr><tr><td>1</td><td>Asha</td><td>100</td></tr><tr><td>1</td><td>Asha</td><td>101</td></tr><tr><td>2</td><td>Ben</td><td>102</td></tr><tr><td>3</td><td>Chen</td><td>103</td></tr><tr><td>3</td><td>Chen</td><td>104</td></tr></table>
  <p><code>USING (customer_id)</code> means "join where the two tables' <code>customer_id</code> columns are equal". Dia has no orders, so the (inner) join drops her. Asha and Chen appear twice.</p>
  <p><strong>Step 2, group and count:</strong> add <code>GROUP BY c.customer_id, c.name</code> and select <code>count(*)</code> (the final query below, without its <code>HAVING</code> line).</p>
  <table class="tbl out"><caption>One row per customer</caption><tr><th>name</th><th>orders</th></tr><tr><td>Asha</td><td>2</td></tr><tr><td>Ben</td><td>1</td></tr><tr><td>Chen</td><td>2</td></tr></table>
  <p><strong>Step 3, keep groups with count &gt; 1.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT c.name, count(*) AS orders
FROM customers c JOIN orders o USING (customer_id)
GROUP BY c.customer_id, c.name
HAVING count(*) &gt; 1
ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>orders</th></tr><tr><td>Asha</td><td>2</td></tr><tr><td>Chen</td><td>2</td></tr></table>
  <p>Ben's group had count 1, so <code>HAVING</code> removed it. We group by <code>customer_id</code> as well as <code>name</code> so that two different customers who share a name are not merged into one.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>WHERE count(*) &gt; 1</code> is an error: <code>WHERE</code> runs before grouping, when no count exists yet.</p></div></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find the second-highest salary.</summary><div class="qa-body">
  <p><strong>How to think:</strong> "second highest" = "the highest among the salaries that are below the top one". So find the top first, then look below it. This wording also handles ties: if two people share the top salary, "below the top" still skips both.</p>
  <p><strong>Step 1, the top salary:</strong></p>
  <div class="fx" data-lang="sql">SELECT max(salary) AS top FROM employees;</div>
  <table class="tbl out"><caption>Step 1</caption><tr><th>top</th></tr><tr><td>120000</td></tr></table>
  <p><strong>Step 2, every salary below it:</strong></p>
  <div class="fx" data-lang="sql">SELECT name, salary FROM employees
WHERE salary &lt; (SELECT max(salary) FROM employees)
ORDER BY salary DESC;</div>
  <table class="tbl out"><caption>Step 2: salaries under 120000</caption><tr><th>name</th><th>salary</th></tr><tr><td>Sara</td><td>95000</td></tr><tr><td>Tom</td><td>95000</td></tr><tr><td>Uma</td><td>70000</td></tr><tr><td>Vik</td><td>65000</td></tr></table>
  <p>The part in brackets is a <strong>subquery</strong>: a query inside a query. It returns one number (120000), so it can sit where a number is expected.</p>
  <p><strong>Step 3, the max of what is left.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT max(salary) AS second_highest
FROM employees
WHERE salary &lt; (SELECT max(salary) FROM employees);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>second_highest</th></tr><tr><td>95000</td></tr></table>
  <p>If every employee had the same salary, step 2 would find no rows and <code>max</code> of nothing is NULL. So the query returns one row with NULL, which is exactly what LeetCode's "Second Highest Salary" expects.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find who earns the 3rd-highest salary, handling ties.</summary><div class="qa-body">
  <p><strong>How to think:</strong> nesting <code>max(… &lt; max(…))</code> three deep gets ugly. Better: give every employee a rank by salary, where equal salaries share a rank, then pick rank 3. A rank is a <strong>window function</strong>: it adds a column to every row without collapsing rows (section 05 explains more).</p>
  <p><strong>Step 1, rank everyone:</strong> we compute all three ranking functions side by side so you can see how they differ on the Sara–Tom tie.</p>
  <div class="fx" data-lang="sql">SELECT name, salary,
       row_number() OVER (ORDER BY salary DESC) AS rn,
       rank()       OVER (ORDER BY salary DESC) AS rnk,
       dense_rank() OVER (ORDER BY salary DESC) AS drk
FROM employees ORDER BY salary DESC, name;</div>
  <table class="tbl out"><caption>Step 1: three ways to number rows</caption><tr><th>name</th><th>salary</th><th>rn</th><th>rnk</th><th>drk</th></tr><tr><td>Ravi</td><td>120000</td><td>1</td><td>1</td><td>1</td></tr><tr><td>Sara</td><td>95000</td><td>2</td><td>2</td><td>2</td></tr><tr><td>Tom</td><td>95000</td><td>3</td><td>2</td><td>2</td></tr><tr><td>Uma</td><td>70000</td><td>4</td><td>4</td><td>3</td></tr><tr><td>Vik</td><td>65000</td><td>5</td><td>5</td><td>4</td></tr></table>
  <p><code>dense_rank</code> gives ties the same number and leaves no gap, so Uma is 3: she has the third different salary. <code>rank</code> would call her 4 (it skips 3 after the tie), and <code>row_number</code> would put Tom at 3.</p>
  <p><strong>Step 2, keep rank 3.</strong> A window result cannot be used in <code>WHERE</code> of the same query (it is computed after <code>WHERE</code>), so wrap step 1 in a CTE:</p>
  <div class="fx" data-lang="sql">WITH r AS (
  SELECT name, salary, dense_rank() OVER (ORDER BY salary DESC) AS rk
  FROM employees)
SELECT name, salary FROM r WHERE rk = 3;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th></tr><tr><td>Uma</td><td>70000</td></tr></table>
  <p>The common wrong answer sorts and skips two rows:</p>
  <div class="fx" data-lang="sql">SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2;</div>
  <table class="tbl out"><caption>Wrong: OFFSET counts Sara and Tom separately</caption><tr><th>name</th><th>salary</th></tr><tr><td>Tom</td><td>95000</td></tr></table>
  <p><code>OFFSET 2</code> skips two <em>rows</em> (Ravi, Sara) and lands on Tom, who has the second-highest salary, not the third. Always ask "should ties count once?" before choosing.</p>
  </div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Each category's share of total revenue, in %.</summary><div class="qa-body">
  <p><strong>How to think:</strong> share = (category revenue ÷ revenue of everything) × 100. We need two levels: one total per category, and one grand total. Revenue lives in <code>order_items</code>, the category in <code>products</code>, and the cancelled flag in <code>orders</code>, so three tables are joined.</p>
  <p><strong>Step 1, one row per sold line, with its category and amount:</strong></p>
  <div class="fx" data-lang="sql">SELECT o.order_id, p.name, p.category, oi.qty * oi.unit_price AS amount
FROM order_items oi
JOIN orders o   USING (order_id)
JOIN products p USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
ORDER BY p.category, o.order_id;</div>
  <table class="tbl out"><caption>Step 1: non-cancelled lines</caption><tr><th>order_id</th><th>name</th><th>category</th><th>amount</th></tr><tr><td>100</td><td>Laptop</td><td>Electronics</td><td>800.00</td></tr><tr><td>101</td><td>Phone</td><td>Electronics</td><td>500.00</td></tr><tr><td>103</td><td>Phone</td><td>Electronics</td><td>1000.00</td></tr><tr><td>100</td><td>Lamp</td><td>Furniture</td><td>80.00</td></tr><tr><td>103</td><td>Desk</td><td>Furniture</td><td>150.00</td></tr><tr><td>104</td><td>Lamp</td><td>Furniture</td><td>120.00</td></tr></table>
  <p>Ben's Desk (order 102) is gone because it was cancelled. Six lines remain.</p>
  <p><strong>Step 2, total per category:</strong> same joins and filter, <code>GROUP BY p.category</code>, <code>sum(oi.qty * oi.unit_price)</code>. Electronics 800 + 500 + 1000 = 2300, Furniture 80 + 150 + 120 = 350.</p>
  <table class="tbl out"><caption>Step 2</caption><tr><th>category</th><th>revenue</th></tr><tr><td>Electronics</td><td>2300.00</td></tr><tr><td>Furniture</td><td>350.00</td></tr></table>
  <p><strong>Step 3, put the grand total next to each group and divide.</strong> <code>sum(…) OVER ()</code> is a window over all result rows: empty brackets mean "one window containing every row". Wrapped around the group sum, it adds up both groups (2650) and repeats that on each row.</p>
  <div class="fx" data-lang="sql">SELECT p.category,
       sum(oi.qty * oi.unit_price) AS revenue,
       sum(sum(oi.qty * oi.unit_price)) OVER () AS total,
       round(100.0 * sum(oi.qty * oi.unit_price)
             / sum(sum(oi.qty * oi.unit_price)) OVER (), 2) AS pct
FROM order_items oi
JOIN orders o   USING (order_id)
JOIN products p USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY p.category ORDER BY p.category;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>category</th><th>revenue</th><th>total</th><th>pct</th></tr><tr><td>Electronics</td><td>2300.00</td><td>2650.00</td><td>86.79</td></tr><tr><td>Furniture</td><td>350.00</td><td>2650.00</td><td>13.21</td></tr></table>
  <p>Furniture: 350 ÷ 2650 × 100 = 13.21%. The inner <code>sum</code> works per group (GROUP BY runs first); the outer <code>sum … OVER ()</code> then runs over the grouped rows. <code>100.0</code> (not <code>100</code>) forces decimal division; section 07 shows what integer division does.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Pivot: one row per month, one revenue column per category.</summary><div class="qa-body">
  <p><strong>How to think:</strong> the manager wants an Excel-style report: months down the side, categories across the top. Turning a column's <em>values</em> (Electronics, Furniture) into column <em>headings</em> is called a <strong>pivot</strong>. SQL has no "make columns from values" button, so you write one output column per category by hand. The trick is a <code>CASE</code> that keeps the amount only when the row belongs to that column's category.</p>
  <p><strong>Step 1, label each line with its month, and split its amount into two columns:</strong></p>
  <div class="fx" data-lang="sql">SELECT to_char(o.order_date, 'YYYY-MM') AS month, p.category,
       CASE WHEN p.category = 'Electronics' THEN oi.qty * oi.unit_price ELSE 0 END AS electronics,
       CASE WHEN p.category = 'Furniture'   THEN oi.qty * oi.unit_price ELSE 0 END AS furniture
FROM orders o
JOIN order_items oi USING (order_id)
JOIN products p     USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
ORDER BY month, p.category;</div>
  <table class="tbl out"><caption>Step 1: one row per line, amount placed in its category&#x27;s column</caption><tr><th>month</th><th>category</th><th>electronics</th><th>furniture</th></tr><tr><td>2024-05</td><td>Electronics</td><td>800.00</td><td>0</td></tr><tr><td>2024-05</td><td>Electronics</td><td>500.00</td><td>0</td></tr><tr><td>2024-05</td><td>Furniture</td><td>0</td><td>80.00</td></tr><tr><td>2024-06</td><td>Electronics</td><td>1000.00</td><td>0</td></tr><tr><td>2024-06</td><td>Furniture</td><td>0</td><td>150.00</td></tr><tr><td>2024-07</td><td>Furniture</td><td>0</td><td>120.00</td></tr></table>
  <p><code>to_char(date, 'YYYY-MM')</code> turns 2024-05-20 into the text <code>2024-05</code>. Each row now has its amount in exactly one of the two columns and 0 in the other.</p>
  <p><strong>Step 2, add up each column per month.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT to_char(o.order_date, 'YYYY-MM') AS month,
       sum(CASE WHEN p.category = 'Electronics' THEN oi.qty * oi.unit_price ELSE 0 END) AS electronics,
       sum(CASE WHEN p.category = 'Furniture'   THEN oi.qty * oi.unit_price ELSE 0 END) AS furniture
FROM orders o
JOIN order_items oi USING (order_id)
JOIN products p     USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>electronics</th><th>furniture</th></tr><tr><td>2024-05</td><td>1300.00</td><td>80.00</td></tr><tr><td>2024-06</td><td>1000.00</td><td>150.00</td></tr><tr><td>2024-07</td><td>0</td><td>120.00</td></tr></table>
  <p>May: electronics 800 + 500 = 1300, furniture 80. <code>GROUP BY 1</code> means "group by the first SELECT column". This pattern is called <strong>conditional aggregation</strong>. PostgreSQL shorthand: <code>sum(x) FILTER (WHERE category = 'Furniture')</code>, which gives NULL instead of 0 for an empty cell. In pandas the same report is <code>pivot_table</code>.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>What is the median order value?</summary><div class="qa-body">
  <p><strong>How to think:</strong> the <strong>median</strong> is the middle value after sorting. Unlike the average, one huge order cannot pull it up, which is why analysts prefer it for money. The question is about <em>orders</em>, but the amounts are stored per <em>line</em>, so first build one total per order. Skipping that step gives the median line, a different number.</p>
  <p><strong>Step 1, one total per non-cancelled order:</strong></p>
  <div class="fx" data-lang="sql">SELECT o.order_id, sum(oi.qty * oi.unit_price) AS total
FROM orders o JOIN order_items oi USING (order_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY o.order_id ORDER BY total;</div>
  <table class="tbl out"><caption>Step 1: order totals, sorted</caption><tr><th>order_id</th><th>total</th></tr><tr><td>104</td><td>120.00</td></tr><tr><td>101</td><td>500.00</td></tr><tr><td>100</td><td>880.00</td></tr><tr><td>103</td><td>1150.00</td></tr></table>
  <p>Four totals: 120, 500, 880, 1150. With an even count there is no single middle; the two middle values are 500 and 880.</p>
  <p><strong>Step 2, ask for the 50% point.</strong> Final query:</p>
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
  <p><code>percentile_cont</code> ("continuous") takes the midpoint of the two middle values: (500 + 880) ÷ 2 = 690. <code>percentile_disc</code> ("discrete") returns an actual value from the list, the lower middle one, 500. <code>WITHIN GROUP (ORDER BY total)</code> tells it which column to sort. MySQL and SQLite lack these functions; there you number the sorted rows with <code>row_number()</code> and average the middle one or two.</p></div></details>

  <h2 id="si-join"><span class="num">03</span>Joins</h2>
  <p>A <strong>join</strong> places rows from two tables side by side when a condition matches, usually "this id equals that id". An <strong>inner join</strong> (plain <code>JOIN</code>) keeps only rows that found a partner. A <strong>left join</strong> keeps every row of the left table and fills the right side with NULL when no partner exists. Most join questions are really asking "which rows have a partner, which don't, and how many partners?".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school roll call. The teacher reads every name on the register (the left table) and ticks those who answer from the hall (the right table). An inner join lists only students who answered. A left join lists every name, with a blank next to the absent ones. "Who was absent?" is a left join where the tick is blank: that is an <strong>anti-join</strong>.</p>
  </div>

  <details class="qa"><summary><span class="qmark">Q</span>Find employees who earn more than their manager.</summary><div class="qa-body">
  <p><strong>How to think:</strong> we need two salaries on the same row: the employee's and the manager's. But the manager is also a row in <code>employees</code>. So use the table twice under two nicknames: <code>e</code> plays "employee", <code>m</code> plays "manager", linked by <code>e.manager_id = m.emp_id</code>. Joining a table to itself is a <strong>self-join</strong>. It is like photocopying the staff register: one copy for the staff, one copy to look up each boss.</p>
  <p><strong>Step 1, put each employee next to their manager (no filter yet):</strong></p>
  <div class="fx" data-lang="sql">SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary
FROM employees e
JOIN employees m ON m.emp_id = e.manager_id
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Step 1: employee and manager side by side</caption><tr><th>name</th><th>salary</th><th>manager</th><th>manager_salary</th></tr><tr><td>Sara</td><td>95000</td><td>Ravi</td><td>120000</td></tr><tr><td>Tom</td><td>95000</td><td>Ravi</td><td>120000</td></tr><tr><td>Uma</td><td>70000</td><td>Ravi</td><td>120000</td></tr><tr><td>Vik</td><td>65000</td><td>Uma</td><td>70000</td></tr></table>
  <p>Ravi has no manager (NULL), so the inner join drops him, which is right: he cannot out-earn a boss he does not have.</p>
  <p><strong>Step 2, compare.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary
FROM employees e
JOIN employees m ON m.emp_id = e.manager_id
WHERE e.salary &gt; m.salary;</div>
  <table class="tbl out"><caption>Result (0 rows)</caption><tr><th>name</th><th>salary</th><th>manager</th><th>manager_salary</th></tr></table>
  <p>Zero rows is a correct answer: in step 1 every employee earns less than the manager beside them. When a final query returns nothing, always remove the <code>WHERE</code> and check that the join itself works, as we did in step 1. Interviewers like it when you say this out loud.</p>
  </div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find customers who never placed an order.</summary><div class="qa-body">
  <p><strong>How to think:</strong> this is the "absent students" question. Keep every customer, try to attach their orders, and keep the customers where nothing attached.</p>
  <p><strong>Step 1, LEFT JOIN and look at the blanks:</strong></p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id
FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Step 1: every customer, with orders if any</caption><tr><th>name</th><th>order_id</th></tr><tr><td>Asha</td><td>100</td></tr><tr><td>Asha</td><td>101</td></tr><tr><td>Ben</td><td>102</td></tr><tr><td>Chen</td><td>103</td></tr><tr><td>Chen</td><td>104</td></tr><tr><td>Dia</td><td>NULL</td></tr></table>
  <p>Dia's <code>order_id</code> is NULL: the left join kept her and filled the right side with blanks.</p>
  <p><strong>Step 2, keep rows where the right side is blank:</strong></p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;</div>
  <table class="tbl out"><caption>Version A: LEFT JOIN … IS NULL</caption><tr><th>name</th></tr><tr><td>Dia</td></tr></table>
  <p>The version most interviewers prefer reads like the English sentence. <code>NOT EXISTS (…)</code> is true when the inner query finds zero rows; the inner query uses the outer row's <code>c.customer_id</code>, so it is checked once per customer:</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);</div>
  <table class="tbl out"><caption>Version B: NOT EXISTS (final)</caption><tr><th>name</th></tr><tr><td>Dia</td></tr></table>
  <p>Asha, Ben and Chen each have at least one order, so EXISTS is true and NOT EXISTS drops them. <code>SELECT 1</code> is a convention: EXISTS only cares whether a row exists, not what is in it. This pattern is an <strong>anti-join</strong>. Avoid <code>NOT IN (subquery)</code> for it: one NULL in the list makes it return nothing (section 07 shows why).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Revenue per customer, including customers with zero.</summary><div class="qa-body">
  <p><strong>How to think:</strong> "including zero" means every customer must appear, so start from <code>customers</code> and LEFT JOIN orders and items. A customer with no qualifying orders gets NULLs; <code>coalesce(x, 0)</code> ("first non-NULL of these") turns the NULL total into 0. The tricky part is where to put "not cancelled".</p>
  <p><strong>Step 1, the joined rows:</strong> run the final query's <code>FROM … LEFT JOIN …</code> part with <code>SELECT c.name, o.order_id, o.status, oi.qty * oi.unit_price AS amount</code> and no grouping. The status filter sits inside the first <code>ON</code>.</p>
  <table class="tbl out"><caption>Step 1: cancelled order rejected in ON, Ben kept with blanks</caption><tr><th>name</th><th>order_id</th><th>status</th><th>amount</th></tr><tr><td>Asha</td><td>100</td><td>delivered</td><td>800.00</td></tr><tr><td>Asha</td><td>100</td><td>delivered</td><td>80.00</td></tr><tr><td>Asha</td><td>101</td><td>delivered</td><td>500.00</td></tr><tr><td>Ben</td><td>NULL</td><td>NULL</td><td>NULL</td></tr><tr><td>Chen</td><td>103</td><td>delivered</td><td>150.00</td></tr><tr><td>Chen</td><td>103</td><td>delivered</td><td>1000.00</td></tr><tr><td>Chen</td><td>104</td><td>pending</td><td>120.00</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td><td>NULL</td></tr></table>
  <p>Ben's only order is cancelled, so the <code>ON</code> condition finds no partner for him; like Dia, he stays with blanks.</p>
  <p><strong>Step 2, total per customer, NULL → 0.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT c.name, coalesce(sum(oi.qty * oi.unit_price), 0) AS revenue
FROM customers c
LEFT JOIN orders o       ON o.customer_id = c.customer_id AND o.status &lt;&gt; 'cancelled'
LEFT JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY c.customer_id, c.name
ORDER BY revenue DESC, c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>revenue</th></tr><tr><td>Asha</td><td>1380.00</td></tr><tr><td>Chen</td><td>1270.00</td></tr><tr><td>Ben</td><td>0</td></tr><tr><td>Dia</td><td>0</td></tr></table>
  <p>Now the common mistake: the same filter moved into <code>WHERE</code>.</p>
  <div class="fx" data-lang="sql">SELECT c.name, coalesce(sum(oi.qty * oi.unit_price), 0) AS revenue
FROM customers c
LEFT JOIN orders o       ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY c.customer_id, c.name
ORDER BY revenue DESC, c.name;</div>
  <table class="tbl out"><caption>Wrong: filter in WHERE turns the LEFT JOIN into an inner join</caption><tr><th>name</th><th>revenue</th></tr><tr><td>Asha</td><td>1380.00</td></tr><tr><td>Chen</td><td>1270.00</td></tr></table>
  <p>Ben's row has status 'cancelled' and Dia's has NULL. <code>WHERE</code> runs after the join and keeps only rows where the test is true; <code>NULL &lt;&gt; 'cancelled'</code> is unknown, not true. Both disappear. Rule: a filter on the right-hand table of a LEFT JOIN goes in <code>ON</code>.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Per customer: number of orders and total items. Why does the obvious query overcount?</summary><div class="qa-body">
  <p><strong>How to think:</strong> orders are counted per order, items per line. The moment you join <code>order_items</code>, each order is repeated once per line. Anything you count "per order" after that join is inflated. This row multiplication is called <strong>fan-out</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A wedding caterer counts invitations. If you count plates instead, a family of four looks like four invitations. Joining items is switching from "invitations" to "plates".</p></div>
  <p><strong>Step 1, look at the joined rows:</strong></p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, p.name AS product, oi.qty
FROM customers c
JOIN orders o       USING (customer_id)
JOIN order_items oi USING (order_id)
JOIN products p     USING (product_id)
ORDER BY c.name, o.order_id, p.name;</div>
  <table class="tbl out"><caption>Step 1: one row per order line</caption><tr><th>name</th><th>order_id</th><th>product</th><th>qty</th></tr><tr><td>Asha</td><td>100</td><td>Lamp</td><td>2</td></tr><tr><td>Asha</td><td>100</td><td>Laptop</td><td>1</td></tr><tr><td>Asha</td><td>101</td><td>Phone</td><td>1</td></tr><tr><td>Ben</td><td>102</td><td>Desk</td><td>1</td></tr><tr><td>Chen</td><td>103</td><td>Desk</td><td>1</td></tr><tr><td>Chen</td><td>103</td><td>Phone</td><td>2</td></tr><tr><td>Chen</td><td>104</td><td>Lamp</td><td>3</td></tr></table>
  <p>Asha has two orders but three rows: order 100 appears twice. Chen too.</p>
  <p><strong>Step 2, count both ways.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       count(*)                   AS wrong_orders,
       count(DISTINCT o.order_id) AS orders,
       sum(oi.qty)                AS items
FROM customers c
JOIN orders o       USING (customer_id)
JOIN order_items oi USING (order_id)
GROUP BY c.customer_id, c.name ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>wrong_orders</th><th>orders</th><th>items</th></tr><tr><td>Asha</td><td>3</td><td>2</td><td>4</td></tr><tr><td>Ben</td><td>1</td><td>1</td><td>1</td></tr><tr><td>Chen</td><td>3</td><td>2</td><td>6</td></tr></table>
  <p><code>count(*)</code> counts rows (lines), so Asha shows 3. <code>count(DISTINCT o.order_id)</code> counts each order id once: 2. <code>sum(oi.qty)</code> is right as it is, because each line should be counted once: 1 + 2 + 1 = 4 items. The other fix is to aggregate items per order in a CTE first, then join that one-row-per-order result.</p>
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
  <p><strong>How to think:</strong> a pair is two customer rows side by side, so self-join <code>customers</code> on city. Then remove two kinds of junk: a customer paired with themselves, and the mirror copy (Asha–Chen and Chen–Asha).</p>
  <p><strong>Step 1, join on city only:</strong></p>
  <div class="fx" data-lang="sql">SELECT a.name AS customer_1, b.name AS customer_2, a.city
FROM customers a JOIN customers b ON a.city = b.city
ORDER BY a.customer_id, b.customer_id;</div>
  <table class="tbl out"><caption>Step 1: every same-city combination</caption><tr><th>customer_1</th><th>customer_2</th><th>city</th></tr><tr><td>Asha</td><td>Asha</td><td>Mumbai</td></tr><tr><td>Asha</td><td>Chen</td><td>Mumbai</td></tr><tr><td>Ben</td><td>Ben</td><td>Delhi</td></tr><tr><td>Chen</td><td>Asha</td><td>Mumbai</td></tr><tr><td>Chen</td><td>Chen</td><td>Mumbai</td></tr></table>
  <p>Five rows: three self-pairs (Asha–Asha, Ben–Ben, Chen–Chen) and Asha–Chen twice in both orders. Dia is missing entirely, because her city is NULL and <code>NULL = NULL</code> is not true.</p>
  <p><strong>Step 2, keep only the copy where the first id is smaller.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT a.name AS customer_1, b.name AS customer_2, a.city
FROM customers a
JOIN customers b ON a.city = b.city AND a.customer_id &lt; b.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_1</th><th>customer_2</th><th>city</th></tr><tr><td>Asha</td><td>Chen</td><td>Mumbai</td></tr></table>
  <p><code>a.customer_id &lt; b.customer_id</code> does two jobs at once: 1 &lt; 1 is false, so self-pairs go; of (1, 3) and (3, 1) only (1, 3) passes, so mirrors go. Using <code>&lt;&gt;</code> instead would remove self-pairs but keep both mirrors.</p></div></details>

  <h2 id="si-cte"><span class="num">04</span>Subqueries &amp; CTEs</h2>
  <p>Some questions need an answer that depends on another answer: "above <em>its category's</em> average", "the <em>top</em> product <em>in each</em> category", "the <em>copies</em> of each email". You compute the inner answer first (a subquery or a CTE), then use it. A <strong>subquery</strong> is a query in brackets inside another query. A <strong>correlated</strong> subquery uses a column of the outer row, so it gives a different answer for each outer row.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class teacher asks "who scored above their own section's average?". She first works out each section's average on a sheet of paper (the inner query), then checks every student against the number for their section (the outer query). The sheet of paper is the CTE.</p>
  </div>

  <details class="qa"><summary><span class="qmark">Q</span>Products priced above their category's average.</summary><div class="qa-body">
  <p><strong>How to think:</strong> two numbers per product: its own price and its category's average price. Then compare. The overall average would be wrong: a Desk at 150 is cheap compared with electronics but expensive for furniture.</p>
  <p><strong>Step 1, the average per category:</strong></p>
  <div class="fx" data-lang="sql">SELECT category, round(avg(price), 2) AS avg_price
FROM products GROUP BY category ORDER BY category;</div>
  <table class="tbl out"><caption>Step 1</caption><tr><th>category</th><th>avg_price</th></tr><tr><td>Electronics</td><td>650.00</td></tr><tr><td>Furniture</td><td>95.00</td></tr></table>
  <p><strong>Step 2, put that average beside every product.</strong> A window <code>avg(price) OVER (PARTITION BY category)</code> computes the average inside each category and writes it on every row, without collapsing rows:</p>
  <div class="fx" data-lang="sql">SELECT name, category, price,
       round(avg(price) OVER (PARTITION BY category), 2) AS cat_avg
FROM products ORDER BY category, price DESC;</div>
  <table class="tbl out"><caption>Step 2: each product with its own category&#x27;s average</caption><tr><th>name</th><th>category</th><th>price</th><th>cat_avg</th></tr><tr><td>Laptop</td><td>Electronics</td><td>800.00</td><td>650.00</td></tr><tr><td>Phone</td><td>Electronics</td><td>500.00</td><td>650.00</td></tr><tr><td>Desk</td><td>Furniture</td><td>150.00</td><td>95.00</td></tr><tr><td>Lamp</td><td>Furniture</td><td>40.00</td><td>95.00</td></tr></table>
  <p><strong>Step 3, compare.</strong> The classic interview answer uses a correlated subquery, which reads "price greater than the average of products in <em>my</em> category":</p>
  <div class="fx" data-lang="sql">SELECT name, category, price
FROM products p
WHERE price &gt; (SELECT avg(price) FROM products WHERE category = p.category);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>category</th><th>price</th></tr><tr><td>Laptop</td><td>Electronics</td><td>800.00</td></tr><tr><td>Desk</td><td>Furniture</td><td>150.00</td></tr></table>
  <p>Laptop 800 &gt; 650 and Desk 150 &gt; 95 pass. The inner query refers to <code>p.category</code> from the outer row, so it is re-evaluated per product. Both versions are fine; the window version (filter step 2's result in an outer query) scans the table once, which matters on big tables.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Customers who bought from both Electronics and Furniture.</summary><div class="qa-body">
  <p><strong>How to think:</strong> the tempting <code>WHERE category = 'Electronics' AND category = 'Furniture'</code> is always empty: a single row has one category. "Both" is a property of a <em>group</em> of rows (a customer's purchases), so group per customer and count how many different categories the group contains.</p>
  <p><strong>Step 1, each customer's purchased categories:</strong> the final query's joins and <code>WHERE</code>, selecting just <code>c.name, p.category</code>, no grouping.</p>
  <table class="tbl out"><caption>Step 1</caption><tr><th>name</th><th>category</th></tr><tr><td>Asha</td><td>Electronics</td></tr><tr><td>Asha</td><td>Electronics</td></tr><tr><td>Asha</td><td>Furniture</td></tr><tr><td>Chen</td><td>Electronics</td></tr><tr><td>Chen</td><td>Furniture</td></tr><tr><td>Chen</td><td>Furniture</td></tr></table>
  <p><strong>Step 2, count distinct categories per customer and keep those with 2.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT c.name, count(DISTINCT p.category) AS categories
FROM customers c
JOIN orders o       USING (customer_id)
JOIN order_items oi USING (order_id)
JOIN products p     USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
  AND p.category IN ('Electronics', 'Furniture')
GROUP BY c.customer_id, c.name
HAVING count(DISTINCT p.category) = 2;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>categories</th></tr><tr><td>Asha</td><td>2</td></tr><tr><td>Chen</td><td>2</td></tr></table>
  <p>Chen has three rows (Phone, Desk, Lamp) but only two distinct categories. <code>DISTINCT</code> matters: plain <code>count(*) = 2</code> would wrongly reject Chen and could accept someone who bought two Lamps. Ben's only order is cancelled, so <code>WHERE</code> removed him before grouping.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Top-selling product (by revenue) in each category.</summary><div class="qa-body">
  <p><strong>How to think:</strong> this is the most asked SQL pattern, "top N per group". Three bowls: (1) revenue per product, (2) a rank inside each category, (3) keep rank 1. <code>PARTITION BY category</code> means "restart the ranking for every category", like ranking students separately in each section.</p>
  <p><strong>Step 1, revenue per product:</strong></p>
  <div class="fx" data-lang="sql">SELECT p.category, p.name, sum(oi.qty * oi.unit_price) AS revenue
FROM order_items oi
JOIN orders o   USING (order_id)
JOIN products p USING (product_id)
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY p.category, p.name ORDER BY p.category, revenue DESC;</div>
  <table class="tbl out"><caption>Step 1 (CTE rev)</caption><tr><th>category</th><th>name</th><th>revenue</th></tr><tr><td>Electronics</td><td>Phone</td><td>1500.00</td></tr><tr><td>Electronics</td><td>Laptop</td><td>800.00</td></tr><tr><td>Furniture</td><td>Lamp</td><td>200.00</td></tr><tr><td>Furniture</td><td>Desk</td><td>150.00</td></tr></table>
  <p><strong>Step 2, rank within each category:</strong> select <code>*, rank() OVER (PARTITION BY category ORDER BY revenue DESC) AS rk</code> from step 1 (this is the CTE <code>ranked</code> in the final query).</p>
  <table class="tbl out"><caption>Step 2 (CTE ranked)</caption><tr><th>category</th><th>name</th><th>revenue</th><th>rk</th></tr><tr><td>Electronics</td><td>Phone</td><td>1500.00</td><td>1</td></tr><tr><td>Electronics</td><td>Laptop</td><td>800.00</td><td>2</td></tr><tr><td>Furniture</td><td>Lamp</td><td>200.00</td><td>1</td></tr><tr><td>Furniture</td><td>Desk</td><td>150.00</td><td>2</td></tr></table>
  <p><strong>Step 3, keep rank 1.</strong> Final query:</p>
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
  <p>Phone 500 + 1000 = 1500 beats Laptop 800; Lamp 80 + 120 = 200 beats Desk 150. <code>rank</code> keeps both products if they tie; <code>row_number</code> would pick one arbitrarily. Note how the definition of revenue changes the answer: including cancelled orders gives Desk 300 and flips Furniture's winner. That is why you state the definition first.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>A <code>signups</code> table has duplicate emails. Find them.</summary><div class="qa-body">
  <p><strong>How to think:</strong> "duplicate" means "same value in the columns that should be unique", here the email. Group by email; any group with more than one row is a duplicate. We also want to see which row ids are the copies. This table is created in a scratch copy of the database:</p>
  <div class="fx" data-lang="sql">CREATE TABLE signups (id int PRIMARY KEY, email text, signed_up date);
INSERT INTO signups VALUES
 (1, 'asha@x.com', '2024-01-05'), (2, 'ben@x.com', '2024-02-10'), (3, 'asha@x.com', '2024-01-06'),
 (4, 'chen@x.com', '2024-03-15'), (5, 'ben@x.com', '2024-02-10'), (6, 'asha@x.com', '2024-01-09');</div>
  <p><strong>Step 1, count rows per email:</strong></p>
  <div class="fx" data-lang="sql">SELECT email, count(*) AS copies
FROM signups GROUP BY email ORDER BY email;</div>
  <table class="tbl out"><caption>Step 1</caption><tr><th>email</th><th>copies</th></tr><tr><td>asha@x.com</td><td>3</td></tr><tr><td>ben@x.com</td><td>2</td></tr><tr><td>chen@x.com</td><td>1</td></tr></table>
  <p><strong>Step 2, keep groups above 1 and list their ids.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT email, count(*) AS copies, array_agg(id ORDER BY id) AS ids
FROM signups GROUP BY email HAVING count(*) &gt; 1 ORDER BY email;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>email</th><th>copies</th><th>ids</th></tr><tr><td>asha@x.com</td><td>3</td><td>{1,3,6}</td></tr><tr><td>ben@x.com</td><td>2</td><td>{2,5}</td></tr></table>
  <p><code>array_agg(id ORDER BY id)</code> collects a group's ids into one list (PostgreSQL; MySQL has <code>group_concat</code>, SQL Server <code>string_agg</code>). On real data, normalise first with <code>lower(trim(email))</code>, so "Asha@X.com " counts as the same address.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Delete the duplicates, keeping the earliest row per email.</summary><div class="qa-body">
  <p><strong>How to think:</strong> inside each email group, number the rows 1, 2, 3 by id. Row 1 is the keeper; every row numbered 2 or more is a copy. First <em>look</em> at the rows you are about to delete (a DELETE cannot be undone outside a transaction), then delete them.</p>
  <p><strong>Step 1, number rows inside each email:</strong></p>
  <div class="fx" data-lang="sql">SELECT id, email, row_number() OVER (PARTITION BY email ORDER BY id) AS rn
FROM signups ORDER BY email, id;</div>
  <table class="tbl out"><caption>Step 1</caption><tr><th>id</th><th>email</th><th>rn</th></tr><tr><td>1</td><td>asha@x.com</td><td>1</td></tr><tr><td>3</td><td>asha@x.com</td><td>2</td></tr><tr><td>6</td><td>asha@x.com</td><td>3</td></tr><tr><td>2</td><td>ben@x.com</td><td>1</td></tr><tr><td>5</td><td>ben@x.com</td><td>2</td></tr><tr><td>4</td><td>chen@x.com</td><td>1</td></tr></table>
  <p><strong>Step 2, the ids to delete (rn &gt; 1):</strong></p>
  <div class="fx" data-lang="sql">SELECT id FROM (
  SELECT id, row_number() OVER (PARTITION BY email ORDER BY id) AS rn
  FROM signups) t
WHERE rn &gt; 1 ORDER BY id;</div>
  <table class="tbl out"><caption>Step 2: check before deleting</caption><tr><th>id</th></tr><tr><td>3</td></tr><tr><td>5</td></tr><tr><td>6</td></tr></table>
  <p><strong>Step 3, delete exactly those ids:</strong></p>
  <div class="fx" data-lang="sql">DELETE FROM signups
WHERE id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (PARTITION BY email ORDER BY id) AS rn
    FROM signups) t
  WHERE rn &gt; 1);</div>
  <div class="fx" data-lang="sql">SELECT * FROM signups ORDER BY id;</div>
  <table class="tbl out"><caption>After the delete</caption><tr><th>id</th><th>email</th><th>signed_up</th></tr><tr><td>1</td><td>asha@x.com</td><td>2024-01-05</td></tr><tr><td>2</td><td>ben@x.com</td><td>2024-02-10</td></tr><tr><td>4</td><td>chen@x.com</td><td>2024-03-15</td></tr></table>
  <p>Ids 3, 5 and 6 are gone; one row per email remains. The same step-2 query became the body of the DELETE, which is the safe habit. PostgreSQL shortcut: <code>DELETE FROM signups a USING signups b WHERE a.email = b.email AND a.id &gt; b.id</code>. Finish with <code>ALTER TABLE signups ADD UNIQUE (email)</code> so duplicates cannot come back.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Show the reporting chain for every employee, starting from the CEO.</summary><div class="qa-body">
  <p><strong>How to think:</strong> for each person, the path of bosses from the top down, like "Ravi &gt; Uma &gt; Vik". You don't know how deep the tree is, so a fixed number of self-joins won't do. You need a query that repeats until it finds nobody new: a <strong>recursive CTE</strong>. It has an <em>anchor</em> (the starting rows) and a <em>step</em> (find the direct reports of the rows found so far), glued with <code>UNION ALL</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Drawing a family tree at a wedding. Start with the grandfather (anchor). Ask "who are his children?" (step). Then ask the same about each child, generation by generation, until someone has no children.</p></div>
  <p><strong>Round by round, by hand:</strong> round 1 is the anchor, the person with no manager.</p>
  <div class="fx" data-lang="sql">SELECT emp_id, name FROM employees WHERE manager_id IS NULL;</div>
  <table class="tbl out"><caption>Round 1 (anchor)</caption><tr><th>emp_id</th><th>name</th></tr><tr><td>1</td><td>Ravi</td></tr></table>
  <div class="fx" data-lang="sql">SELECT emp_id, name FROM employees WHERE manager_id IN (1) ORDER BY emp_id;</div>
  <table class="tbl out"><caption>Round 2: direct reports of round 1 (Ravi = 1)</caption><tr><th>emp_id</th><th>name</th></tr><tr><td>2</td><td>Sara</td></tr><tr><td>3</td><td>Tom</td></tr><tr><td>4</td><td>Uma</td></tr></table>
  <div class="fx" data-lang="sql">SELECT emp_id, name FROM employees WHERE manager_id IN (2, 3, 4);</div>
  <table class="tbl out"><caption>Round 3: direct reports of round 2 (ids 2, 3, 4)</caption><tr><th>emp_id</th><th>name</th></tr><tr><td>5</td><td>Vik</td></tr></table>
  <p>Round 4 would ask for reports of Vik (id 5) and find none, so it stops. The recursive CTE does exactly these rounds, carrying a level and a path along:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE chain AS (
  SELECT emp_id, name, 1 AS level, name AS path
  FROM employees WHERE manager_id IS NULL                       -- anchor: the top
  UNION ALL
  SELECT e.emp_id, e.name, c.level + 1, c.path || ' &gt; ' || e.name
  FROM employees e JOIN chain c ON e.manager_id = c.emp_id)     -- step: direct reports
SELECT name, level, path FROM chain ORDER BY path;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>level</th><th>path</th></tr><tr><td>Ravi</td><td>1</td><td>Ravi</td></tr><tr><td>Sara</td><td>2</td><td>Ravi &gt; Sara</td></tr><tr><td>Tom</td><td>2</td><td>Ravi &gt; Tom</td></tr><tr><td>Uma</td><td>2</td><td>Ravi &gt; Uma</td></tr><tr><td>Vik</td><td>3</td><td>Ravi &gt; Uma &gt; Vik</td></tr></table>
  <p><code>||</code> joins text. In the step, <code>chain</code> means "the rows found in the previous round", so each new row's path is its boss's path plus its own name. Real uses: org charts, category trees, bill of materials, friend-of-friend graphs.</p>
  <div class="callout trap"><span class="label">Trap</span><p>If the data has a cycle (A manages B, B manages A), the recursion never ends. Add a guard such as <code>WHERE c.level &lt; 20</code> in the step.</p></div></div></details>

  <h2 id="si-win"><span class="num">05</span>Window Functions</h2>
  <p><code>GROUP BY</code> collapses rows: ten orders become one row per customer. Often you need the opposite: keep every row, but add a number computed from its neighbours (its rank, the running total so far, the previous order's date). A <strong>window function</strong> does that. <code>OVER (PARTITION BY x ORDER BY y)</code> says: split the rows into groups by x (without merging them), sort each group by y, and compute the value for each row inside its group.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>After an exam, the teacher writes each student's rank in the section on their own answer sheet. The sheets are not stapled into one; each keeps its own marks plus a new "rank" line. GROUP BY would be the teacher writing one summary line per section and throwing the sheets away.</p>
  </div>

  <details class="qa"><summary><span class="qmark">Q</span>Each customer's latest order.</summary><div class="qa-body">
  <p><strong>How to think:</strong> one row per customer, but the row must be a whole order (id and date), not just <code>max(order_date)</code>. Number each customer's orders newest-first; the latest is always number 1.</p>
  <p><strong>Step 1, number orders within each customer:</strong> run the CTE <code>r</code> from the final query on its own.</p>
  <table class="tbl out"><caption>Step 1</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th><th>rn</th></tr><tr><td>1</td><td>101</td><td>2024-05-20</td><td>1</td></tr><tr><td>1</td><td>100</td><td>2024-05-01</td><td>2</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td><td>1</td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td><td>1</td></tr><tr><td>3</td><td>103</td><td>2024-06-15</td><td>2</td></tr></table>
  <p>The numbering restarts at 1 for every customer, because of <code>PARTITION BY customer_id</code>. <code>order_id DESC</code> is a tie-breaker: if two orders share a date, the result is still the same every run.</p>
  <p><strong>Step 2, keep rn = 1 and add names.</strong> Final query:</p>
  <div class="fx" data-lang="sql">WITH r AS (
  SELECT customer_id, order_id, order_date,
         row_number() OVER (PARTITION BY customer_id
                            ORDER BY order_date DESC, order_id DESC) AS rn
  FROM orders)
SELECT c.name, r.order_id, r.order_date
FROM r JOIN customers c USING (customer_id)
WHERE rn = 1 ORDER BY c.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>order_date</th></tr><tr><td>Asha</td><td>101</td><td>2024-05-20</td></tr><tr><td>Ben</td><td>102</td><td>2024-06-02</td></tr><tr><td>Chen</td><td>104</td><td>2024-07-01</td></tr></table>
  <p>PostgreSQL shortcut: <code>SELECT DISTINCT ON (customer_id) … ORDER BY customer_id, order_date DESC</code>. The usual alternative, joining back on <code>max(order_date)</code>, returns two rows when a customer has two orders on the same day.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Running total of revenue by date.</summary><div class="qa-body">
  <p><strong>How to think:</strong> like the balance column in a bank passbook: each line shows everything so far. First make one row per day, then add a cumulative sum.</p>
  <p><strong>Step 1, revenue per day:</strong> the CTE <code>daily</code> from the final query, run alone.</p>
  <table class="tbl out"><caption>Step 1 (CTE daily)</caption><tr><th>order_date</th><th>revenue</th></tr><tr><td>2024-05-01</td><td>880.00</td></tr><tr><td>2024-05-20</td><td>500.00</td></tr><tr><td>2024-06-15</td><td>1150.00</td></tr><tr><td>2024-07-01</td><td>120.00</td></tr></table>
  <p><strong>Step 2, running sum.</strong> Final query:</p>
  <div class="fx" data-lang="sql">WITH daily AS (
  SELECT o.order_date, sum(oi.qty * oi.unit_price) AS revenue
  FROM orders o JOIN order_items oi USING (order_id)
  WHERE o.status &lt;&gt; 'cancelled'
  GROUP BY o.order_date)
SELECT order_date, revenue,
       sum(revenue) OVER (ORDER BY order_date) AS running_total
FROM daily ORDER BY order_date;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_date</th><th>revenue</th><th>running_total</th></tr><tr><td>2024-05-01</td><td>880.00</td><td>880.00</td></tr><tr><td>2024-05-20</td><td>500.00</td><td>1380.00</td></tr><tr><td>2024-06-15</td><td>1150.00</td><td>2530.00</td></tr><tr><td>2024-07-01</td><td>120.00</td><td>2650.00</td></tr></table>
  <p>880, then 880 + 500 = 1380, then + 1150 = 2530, then + 120 = 2650. Putting <code>ORDER BY</code> inside <code>OVER</code> is what makes the sum cumulative: for each row it adds the rows from the start up to this one. The default frame is <code>RANGE</code>, which treats rows with equal dates as one step; write <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> for strict row-by-row.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Top 2 earners in each department, keeping ties.</summary><div class="qa-body">
  <p><strong>How to think:</strong> top-N per group again. "Keeping ties" decides the function: <code>dense_rank</code> lets Sara and Tom share rank 2.</p>
  <p><strong>Step 1, rank within each department:</strong> the inner query of the final answer, run alone.</p>
  <table class="tbl out"><caption>Step 1</caption><tr><th>dept</th><th>name</th><th>salary</th><th>rk</th></tr><tr><td>Eng</td><td>Ravi</td><td>120000</td><td>1</td></tr><tr><td>Eng</td><td>Sara</td><td>95000</td><td>2</td></tr><tr><td>Eng</td><td>Tom</td><td>95000</td><td>2</td></tr><tr><td>Sales</td><td>Uma</td><td>70000</td><td>1</td></tr><tr><td>Sales</td><td>Vik</td><td>65000</td><td>2</td></tr></table>
  <p><strong>Step 2, keep rk ≤ 2.</strong> A window result can't go straight into <code>WHERE</code>, so wrap it (here as a subquery in <code>FROM</code>, which works like a CTE):</p>
  <div class="fx" data-lang="sql">SELECT dept, name, salary, rk
FROM (SELECT dept, name, salary,
             dense_rank() OVER (PARTITION BY dept ORDER BY salary DESC) AS rk
      FROM employees) t
WHERE rk &lt;= 2 ORDER BY dept, rk, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dept</th><th>name</th><th>salary</th><th>rk</th></tr><tr><td>Eng</td><td>Ravi</td><td>120000</td><td>1</td></tr><tr><td>Eng</td><td>Sara</td><td>95000</td><td>2</td></tr><tr><td>Eng</td><td>Tom</td><td>95000</td><td>2</td></tr><tr><td>Sales</td><td>Uma</td><td>70000</td><td>1</td></tr><tr><td>Sales</td><td>Vik</td><td>65000</td><td>2</td></tr></table>
  <p>Eng returns three people because of the tie. Say which you want: <code>row_number</code> = exactly 2 rows per department; <code>rank</code>/<code>dense_rank</code> = keep ties (they differ only in what comes after a tie).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Days between each order and the same customer's previous order.</summary><div class="qa-body">
  <p><strong>How to think:</strong> on each order row we need the previous order's date of the same customer. <code>lag(col)</code> reads <code>col</code> from the previous row in the window; <code>lead(col)</code> reads the next one.</p>
  <p><strong>Step 1, bring the previous date onto each row:</strong></p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date,
       lag(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date
FROM orders ORDER BY customer_id, order_date;</div>
  <table class="tbl out"><caption>Step 1</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th><th>prev_date</th></tr><tr><td>1</td><td>100</td><td>2024-05-01</td><td>NULL</td></tr><tr><td>1</td><td>101</td><td>2024-05-20</td><td>2024-05-01</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td><td>NULL</td></tr><tr><td>3</td><td>103</td><td>2024-06-15</td><td>NULL</td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td><td>2024-06-15</td></tr></table>
  <p><strong>Step 2, subtract.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, order_id, order_date,
       order_date - lag(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS days_since_prev
FROM orders ORDER BY customer_id, order_date;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>order_id</th><th>order_date</th><th>days_since_prev</th></tr><tr><td>1</td><td>100</td><td>2024-05-01</td><td>NULL</td></tr><tr><td>1</td><td>101</td><td>2024-05-20</td><td>19</td></tr><tr><td>2</td><td>102</td><td>2024-06-02</td><td>NULL</td></tr><tr><td>3</td><td>103</td><td>2024-06-15</td><td>NULL</td></tr><tr><td>3</td><td>104</td><td>2024-07-01</td><td>16</td></tr></table>
  <p>Asha: 20 May − 1 May = 19 days. A customer's first order has no previous row, so <code>lag</code> gives NULL and the difference is NULL. In PostgreSQL, <code>date − date</code> is a whole number of days. This "gap between events" column is a standard churn feature in ML models.</p></div></details>

  <h2 id="si-date"><span class="num">06</span>Dates &amp; Time</h2>
  <p>Product and growth teams ask time questions all day: is revenue growing month on month, which months had no sales, how long until a new user buys, who has a login streak, how many users come back. These questions combine three tools: truncating dates to a period, window functions over time, and generating calendars for missing periods. Streak and retention need daily activity, so this section adds a <code>logins</code> table to the scratch copy:</p>
  <div class="fx" data-lang="sql">CREATE TABLE logins (user_id int, login_date date);
INSERT INTO logins VALUES
 (1,'2024-07-01'),(1,'2024-07-02'),(1,'2024-07-02'),(1,'2024-07-03'),(1,'2024-07-05'),(1,'2024-07-06'),
 (2,'2024-07-01'),(2,'2024-07-08'),(2,'2024-07-09'),(2,'2024-07-10'),(2,'2024-07-11'),
 (3,'2024-07-02'),
 (4,'2024-07-03'),(4,'2024-07-04'),(4,'2024-07-12'),
 (5,'2024-07-08'),(5,'2024-07-20'),
 (6,'2024-07-09'),(6,'2024-07-10');</div>
  <p>User 1 logged in twice on 2 July on purpose: real event tables have duplicates.</p>

  <details class="qa"><summary><span class="qmark">Q</span>Monthly revenue and month-over-month growth %.</summary><div class="qa-body">
  <p><strong>How to think:</strong> one row per month, then compare each month with the one before. <code>date_trunc('month', d)</code> turns any date into the first day of its month (2024-05-20 → 2024-05-01), so grouping by it gives one row per month. <code>lag</code> brings last month's number onto this month's row. Growth = (this − previous) ÷ previous × 100.</p>
  <p><strong>Step 1, revenue per month:</strong> the CTE <code>m</code> from the final query, run alone.</p>
  <table class="tbl out"><caption>Step 1 (CTE m)</caption><tr><th>month</th><th>revenue</th></tr><tr><td>2024-05-01</td><td>1380.00</td></tr><tr><td>2024-06-01</td><td>1150.00</td></tr><tr><td>2024-07-01</td><td>120.00</td></tr></table>
  <p><code>::date</code> converts the timestamp that <code>date_trunc</code> returns back into a plain date, for cleaner output.</p>
  <p><strong>Step 2, previous month alongside, then growth.</strong> Final query:</p>
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
  <p>June: (1150 − 1380) ÷ 1380 = −16.7%. <code>nullif(prev, 0)</code> returns NULL when prev is 0, so a divide-by-zero becomes NULL instead of an error. One more trap: if a month had no sales at all, it has no row, and <code>lag</code> would silently compare with two months ago. The next question fixes that.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Orders per month for Jan–Jul 2024, showing months with zero.</summary><div class="qa-body">
  <p><strong>How to think:</strong> <code>GROUP BY</code> can only show months that exist in the data, and January to April have no orders. So build the full list of months yourself and LEFT JOIN the orders onto it, like printing a blank calendar first and then writing orders into the boxes.</p>
  <p><strong>Step 1, the calendar:</strong> <code>generate_series(start, stop, step)</code> produces a sequence of values.</p>
  <div class="fx" data-lang="sql">SELECT m::date AS month
FROM generate_series('2024-01-01'::date, '2024-07-01', '1 month') m;</div>
  <table class="tbl out"><caption>Step 1</caption><tr><th>month</th></tr><tr><td>2024-01-01</td></tr><tr><td>2024-02-01</td></tr><tr><td>2024-03-01</td></tr><tr><td>2024-04-01</td></tr><tr><td>2024-05-01</td></tr><tr><td>2024-06-01</td></tr><tr><td>2024-07-01</td></tr></table>
  <p><strong>Step 2, LEFT JOIN orders and count.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT m::date AS month, count(o.order_id) AS orders
FROM generate_series('2024-01-01'::date, '2024-07-01', '1 month') m
LEFT JOIN orders o ON date_trunc('month', o.order_date) = m
GROUP BY m ORDER BY m;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>orders</th></tr><tr><td>2024-01-01</td><td>0</td></tr><tr><td>2024-02-01</td><td>0</td></tr><tr><td>2024-03-01</td><td>0</td></tr><tr><td>2024-04-01</td><td>0</td></tr><tr><td>2024-05-01</td><td>2</td></tr><tr><td>2024-06-01</td><td>2</td></tr><tr><td>2024-07-01</td><td>1</td></tr></table>
  <p>January's row has no matching order, so its <code>o.order_id</code> is NULL and <code>count(o.order_id)</code> skips it: 0. With <code>count(*)</code> every empty month would show 1, because the calendar row itself is counted. MySQL and SQLite have no <code>generate_series</code> for dates; use a recursive CTE or a calendar table.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Days from signup to first order, per customer.</summary><div class="qa-body">
  <p><strong>How to think:</strong> the first order is the earliest order date per customer, <code>min(order_date)</code>. Subtract the signup date. Dia must still appear (she never ordered), so LEFT JOIN.</p>
  <p><strong>Step 1, first order per customer:</strong> the final query without its last column.</p>
  <table class="tbl out"><caption>Step 1</caption><tr><th>name</th><th>signup_date</th><th>first_order</th></tr><tr><td>Asha</td><td>2024-01-05</td><td>2024-05-01</td></tr><tr><td>Ben</td><td>2024-02-10</td><td>2024-06-02</td></tr><tr><td>Chen</td><td>2024-03-15</td><td>2024-06-15</td></tr><tr><td>Dia</td><td>2024-04-20</td><td>NULL</td></tr></table>
  <p><strong>Step 2, subtract.</strong> Final query:</p>
  <div class="fx" data-lang="sql">SELECT c.name, c.signup_date, min(o.order_date) AS first_order,
       min(o.order_date) - c.signup_date AS days_to_first
FROM customers c LEFT JOIN orders o USING (customer_id)
GROUP BY c.customer_id, c.name, c.signup_date ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>signup_date</th><th>first_order</th><th>days_to_first</th></tr><tr><td>Asha</td><td>2024-01-05</td><td>2024-05-01</td><td>117</td></tr><tr><td>Ben</td><td>2024-02-10</td><td>2024-06-02</td><td>113</td></tr><tr><td>Chen</td><td>2024-03-15</td><td>2024-06-15</td><td>92</td></tr><tr><td>Dia</td><td>2024-04-20</td><td>NULL</td><td>NULL</td></tr></table>
  <p>Asha signed up 5 Jan and first ordered 1 May: 117 days. Dia's <code>min</code> is NULL and NULL − date is NULL. That is correct: "never ordered" is not "0 days". If the business wants an average, say whether non-buyers are excluded.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Find users with a login streak of 3 or more consecutive days.</summary><div class="qa-body">
  <p><strong>How to think:</strong> a trick worth memorising. Number each user's distinct login days 1, 2, 3, … in date order. Inside a run of consecutive days, the date and the number both go up by 1 each step, so <code>date − number</code> stays the same. When a day is skipped, the date jumps by 2 but the number by 1, so the difference changes. That difference is a label for each run. This problem family is called <strong>gaps and islands</strong> (an island is a run, a gap is a break).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Train coaches numbered S1, S2, S3 sit at platform markers 11, 12, 13. Marker − coach number = 10 for all three: same train. If the next coach S4 is at marker 15, 15 − 4 = 11: a gap, a different train.</p></div>
  <p><strong>Step 1, remove duplicate days, number them, compute the label</strong> (users 1 and 2 shown):</p>
  <div class="fx" data-lang="sql">WITH d AS (SELECT DISTINCT user_id, login_date FROM logins)
SELECT user_id, login_date,
       row_number() OVER (PARTITION BY user_id ORDER BY login_date) AS rn,
       login_date - row_number() OVER (PARTITION BY user_id ORDER BY login_date)::int AS grp
FROM d WHERE user_id IN (1, 2) ORDER BY user_id, login_date;</div>
  <table class="tbl out"><caption>Step 1: date − row_number labels each run</caption><tr><th>user_id</th><th>login_date</th><th>rn</th><th>grp</th></tr><tr><td>1</td><td>2024-07-01</td><td>1</td><td>2024-06-30</td></tr><tr><td>1</td><td>2024-07-02</td><td>2</td><td>2024-06-30</td></tr><tr><td>1</td><td>2024-07-03</td><td>3</td><td>2024-06-30</td></tr><tr><td>1</td><td>2024-07-05</td><td>4</td><td>2024-07-01</td></tr><tr><td>1</td><td>2024-07-06</td><td>5</td><td>2024-07-01</td></tr><tr><td>2</td><td>2024-07-01</td><td>1</td><td>2024-06-30</td></tr><tr><td>2</td><td>2024-07-08</td><td>2</td><td>2024-07-06</td></tr><tr><td>2</td><td>2024-07-09</td><td>3</td><td>2024-07-06</td></tr><tr><td>2</td><td>2024-07-10</td><td>4</td><td>2024-07-06</td></tr><tr><td>2</td><td>2024-07-11</td><td>5</td><td>2024-07-06</td></tr></table>
  <p>User 1's first three days share label 2024-06-30; after the gap on 4 July the label becomes 2024-07-01. <code>::int</code> converts the row number (a bigint) so it can be subtracted from a date.</p>
  <p><strong>Step 2, one row per island with its length</strong> (all users): group step 1's rows by <code>user_id, grp</code> and take <code>min</code>, <code>max</code> and <code>count(*)</code> of the dates (the final query without <code>HAVING</code>).</p>
  <table class="tbl out"><caption>Step 2: every island</caption><tr><th>user_id</th><th>streak_start</th><th>streak_end</th><th>days</th></tr><tr><td>1</td><td>2024-07-01</td><td>2024-07-03</td><td>3</td></tr><tr><td>1</td><td>2024-07-05</td><td>2024-07-06</td><td>2</td></tr><tr><td>2</td><td>2024-07-01</td><td>2024-07-01</td><td>1</td></tr><tr><td>2</td><td>2024-07-08</td><td>2024-07-11</td><td>4</td></tr><tr><td>3</td><td>2024-07-02</td><td>2024-07-02</td><td>1</td></tr><tr><td>4</td><td>2024-07-03</td><td>2024-07-04</td><td>2</td></tr><tr><td>4</td><td>2024-07-12</td><td>2024-07-12</td><td>1</td></tr><tr><td>5</td><td>2024-07-08</td><td>2024-07-08</td><td>1</td></tr><tr><td>5</td><td>2024-07-20</td><td>2024-07-20</td><td>1</td></tr><tr><td>6</td><td>2024-07-09</td><td>2024-07-10</td><td>2</td></tr></table>
  <p><strong>Step 3, keep islands of 3+ days.</strong> Final query:</p>
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
  </svg><figcaption>User 1: both rows rise by 1 inside a run, so their difference is a constant label. The gap (07-04) bumps the label.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap</span><p>Skip <code>DISTINCT</code> and user 1's double login on 2 July gets two row numbers, shifting the label mid-run and splitting a 3-day streak into pieces.</p></div></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>7-day retention by weekly cohort: what % of users came back within 7 days of their first login?</summary><div class="qa-body">
  <p><strong>How to think:</strong> a <strong>cohort</strong> is a group of users who started in the same period, here the same week. <strong>Retention</strong> is the share of a cohort that came back. Three bowls: (1) each user's first login day; (2) a true/false flag: any login in days 1 to 7 after it? (3) group by the week of the first day, count users and flagged users.</p>
  <p><strong>Step 1, first day per user:</strong></p>
  <div class="fx" data-lang="sql">SELECT user_id, min(login_date) AS first_day FROM logins GROUP BY user_id ORDER BY user_id;</div>
  <table class="tbl out"><caption>Step 1 (CTE firsts)</caption><tr><th>user_id</th><th>first_day</th></tr><tr><td>1</td><td>2024-07-01</td></tr><tr><td>2</td><td>2024-07-01</td></tr><tr><td>3</td><td>2024-07-02</td></tr><tr><td>4</td><td>2024-07-03</td></tr><tr><td>5</td><td>2024-07-08</td></tr><tr><td>6</td><td>2024-07-09</td></tr></table>
  <p><strong>Step 2, the flag:</strong> the CTE <code>flagged</code> from the final query, run alone (with the cohort week added so you can see it). <code>EXISTS (…)</code> returns true if the inner query finds any row: a login of the same user between day+1 and day+7.</p>
  <table class="tbl out"><caption>Step 2 (CTE flagged)</caption><tr><th>user_id</th><th>first_day</th><th>cohort_week</th><th>retained</th></tr><tr><td>1</td><td>2024-07-01</td><td>2024-07-01</td><td>t</td></tr><tr><td>2</td><td>2024-07-01</td><td>2024-07-01</td><td>t</td></tr><tr><td>3</td><td>2024-07-02</td><td>2024-07-01</td><td>f</td></tr><tr><td>4</td><td>2024-07-03</td><td>2024-07-01</td><td>t</td></tr><tr><td>5</td><td>2024-07-08</td><td>2024-07-08</td><td>f</td></tr><tr><td>6</td><td>2024-07-09</td><td>2024-07-08</td><td>t</td></tr></table>
  <p>User 2 returned on 8 July, exactly day 7: counted. User 5's next login is 12 days later: not counted. <code>date_trunc('week', …)</code> gives the Monday of that week.</p>
  <p><strong>Step 3, per cohort.</strong> Final query:</p>
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
  <p><code>count(*) FILTER (WHERE retained)</code> counts only flagged rows. Week of 1 July: 3 of 4 = 75%. Clarify the definition first: "active on day 7" and "active at least once within 7 days" are different metrics that product teams both call D7 retention.</p></div></details>

  <h2 id="si-null"><span class="num">07</span>Tricky NULL &amp; Edge Cases</h2>
  <p><strong>NULL</strong> means "unknown", not zero and not empty text. Any comparison with NULL (<code>= NULL</code>, <code>&lt;&gt; NULL</code>, <code>&gt; NULL</code>) gives neither true nor false but a third answer, <strong>unknown</strong>. <code>WHERE</code> keeps only rows whose test is true, so an unknown row is quietly dropped. No error, no warning: just a smaller answer. Most "the query looks right but the number is wrong" bugs in real reports come from this, which is why interviewers love it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A blank box on an exam form for "age". Is the student older than 18? You can't say yes, you can't say no: you don't know. SQL refuses to guess, so the row fails every test except <code>IS NULL</code>.</p>
  </div>
  <details class="qa"><summary><span class="qmark">Q</span>Find employees who are not anyone's manager. Why does this return nothing?</summary><div class="qa-body">
  <p><strong>How to think:</strong> the people whose id appears in nobody's <code>manager_id</code>. The natural query looks right, yet returns zero rows:</p>
  <div class="fx" data-lang="sql">SELECT name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees);</div>
  <table class="tbl out"><caption>Looks right, returns nothing (0 rows)</caption><tr><th>name</th></tr></table>
  <p><strong>Step 1, look at the list NOT IN compares against:</strong></p>
  <div class="fx" data-lang="sql">SELECT manager_id FROM employees ORDER BY emp_id;</div>
  <table class="tbl out"><caption>The subquery&#x27;s list</caption><tr><th>manager_id</th></tr><tr><td>NULL</td></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>4</td></tr></table>
  <p>It contains a NULL (Ravi's). <code>x NOT IN (list)</code> means "x is different from every item". Follow Sara (id 2):</p>
  <div class="flow"><span>2 NOT IN (1, 4, NULL)</span><span>2 &lt;&gt; 1 AND 2 &lt;&gt; 4 AND 2 &lt;&gt; NULL</span><span>TRUE AND TRUE AND UNKNOWN</span><span>UNKNOWN → row dropped</span></div>
  <p>The same happens for everyone, so nothing survives. <strong>Step 2, the fix:</strong> <code>NOT EXISTS</code> asks "is there any row whose manager_id equals my id?". A NULL manager_id simply never equals anything, so it is ignored instead of poisoning the whole test.</p>
  <div class="fx" data-lang="sql">SELECT name FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.emp_id)
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Fixed</caption><tr><th>name</th></tr><tr><td>Sara</td></tr><tr><td>Tom</td></tr><tr><td>Vik</td></tr></table>
  <p>Another fix is <code>NOT IN (SELECT manager_id FROM employees WHERE manager_id IS NOT NULL)</code>, but you must remember it every time. Default to <code>NOT EXISTS</code>.</p>
  </div></details>

  <details class="qa"><summary><span class="qmark">Q</span>"Customers not in Mumbai": why is Dia missing?</summary><div class="qa-body">
  <p><strong>How to think:</strong> <code>WHERE city &lt;&gt; 'Mumbai'</code> returns only Ben. To see why, print the test itself as a column instead of filtering on it:</p>
  <div class="fx" data-lang="sql">SELECT name, city,
       city &lt;&gt; 'Mumbai'                AS ne,
       city IS DISTINCT FROM 'Mumbai' AS distinct_from
FROM customers ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Both tests side by side</caption><tr><th>name</th><th>city</th><th>ne</th><th>distinct_from</th></tr><tr><td>Asha</td><td>Mumbai</td><td>f</td><td>f</td></tr><tr><td>Ben</td><td>Delhi</td><td>t</td><td>t</td></tr><tr><td>Chen</td><td>Mumbai</td><td>f</td><td>f</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td><td>t</td></tr></table>
  <p>For Dia the <code>ne</code> column is NULL (unknown), and <code>WHERE</code> keeps only TRUE, so she is dropped. <code>IS DISTINCT FROM</code> treats NULL as an ordinary value that is simply different from 'Mumbai', so it says true (<code>t</code>). Use it, or write <code>city &lt;&gt; 'Mumbai' OR city IS NULL</code>, when unknown cities should count as "not Mumbai". Printing the condition as a column is the general debugging trick for any filter that drops rows you expected.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>What fraction of orders were cancelled? Why does the first attempt say 0?</summary><div class="qa-body">
  <p><strong>How to think:</strong> 1 cancelled out of 5 orders should be 0.20. But both counts are whole numbers (integers), and integer division throws away the remainder, like sharing 1 samosa among 5 friends in whole samosas: each gets 0.</p>
  <div class="fx" data-lang="sql">SELECT count(*) FILTER (WHERE status = 'cancelled') / count(*)                  AS wrong,
       round(count(*) FILTER (WHERE status = 'cancelled')::numeric / count(*), 2) AS rate,
       round(avg((status = 'cancelled')::int), 2)                                AS rate_avg
FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>wrong</th><th>rate</th><th>rate_avg</th></tr><tr><td>0</td><td>0.20</td><td>0.20</td></tr></table>
  <p><code>wrong</code> is 1 / 5 = 0. Casting one side to <code>numeric</code> (a decimal type) gives 0.20. The third column is a handy trick: <code>status = 'cancelled'</code> is true or false, <code>::int</code> turns it into 1 or 0, and the average of (0, 0, 1, 0, 0) is 0.20. It computes any rate in one step. Watch out: in MySQL <code>/</code> always returns a decimal, so this bug appears in PostgreSQL, SQL Server and SQLite but not MySQL.</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Total qty for an order that doesn't exist: 0 or NULL?</summary><div class="qa-body">
  <p><strong>How to think:</strong> sum the quantities of order 999, which has no rows. Common sense says 0. SQL says: there were no values to add, so the sum is unknown.</p>
  <div class="fx" data-lang="sql">SELECT sum(qty) AS s, count(*) AS c, coalesce(sum(qty), 0) AS s_fixed
FROM order_items WHERE order_id = 999;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>s</th><th>c</th><th>s_fixed</th></tr><tr><td>NULL</td><td>0</td><td>0</td></tr></table>
  <p>Over zero rows, <code>count</code> gives 0 but <code>sum</code>, <code>avg</code>, <code>max</code> and <code>min</code> give NULL. Wrap in <code>coalesce(…, 0)</code> when the report needs a number. With <code>GROUP BY</code>, empty groups don't appear at all (that is the missing-months problem from section 06).</p></div></details>

  <details class="qa"><summary><span class="qmark">Q</span>Is an event at 2024-05-20 10:30 "between 1 May and 20 May"?</summary><div class="qa-body">
  <p><strong>How to think:</strong> a human says yes, it happened on 20 May. But <code>'2024-05-20'</code> compared with a timestamp means 20 May at 00:00, and 10:30 is after that.</p>
  <div class="fx" data-lang="sql">SELECT TIMESTAMP '2024-05-20 10:30' BETWEEN '2024-05-01' AND '2024-05-20' AS with_between,
       TIMESTAMP '2024-05-20 10:30' &gt;= '2024-05-01'
   AND TIMESTAMP '2024-05-20 10:30' &lt;  '2024-05-21'                         AS half_open;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>with_between</th><th>half_open</th></tr><tr><td>f</td><td>t</td></tr></table>
  <p><code>BETWEEN a AND b</code> includes both ends, and the end is midnight, so the whole of 20 May except 00:00 is lost. For timestamps use a <strong>half-open range</strong>: start included, end excluded, end = the day after. Then 20 May 23:59 is in and 21 May 00:00 is out, with no gap and no overlap between consecutive months. Like a shop board "open 9 to 9": at exactly 9 pm you are out.</p></div></details>

  <h2 id="si-traps"><span class="num">08</span>Common Mistakes</h2>
  <p>The same ten bugs cause most wrong answers, in interviews and in production dashboards. Each one was shown with a real result above; here they are in one place for revision.</p>
  <div class="callout trap"><span class="label">Trap: aggregate in WHERE</span><p><code>WHERE count(*) &gt; 1</code> is an error. Filters on aggregates go in <code>HAVING</code>; filters on plain columns go in <code>WHERE</code> (fewer rows reach the grouping, so it is also faster).</p></div>
  <div class="callout trap"><span class="label">Trap: window function in WHERE</span><p><code>WHERE rank() OVER (…) = 1</code> is an error: windows are computed at the SELECT stage, after WHERE. Rank in a CTE or subquery, filter outside.</p></div>
  <div class="callout trap"><span class="label">Trap: LIMIT/OFFSET for "Nth highest"</span><p>Counts tied rows separately (Tom came out "3rd"). Use <code>dense_rank</code> when ties should count once.</p></div>
  <div class="callout trap"><span class="label">Trap: fan-out</span><p>Joining a one-per-order table to a one-per-item table repeats orders. <code>count(*)</code> and <code>sum(order_total)</code> are inflated. Use <code>count(DISTINCT)</code> or aggregate before joining.</p></div>
  <div class="callout trap"><span class="label">Trap: right-table filter in WHERE after a LEFT JOIN</span><p>Silently drops the unmatched rows (Ben and Dia vanished). Put it in <code>ON</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: NOT IN with a NULL</span><p>One NULL in the subquery's list makes <code>NOT IN</code> return zero rows. Use <code>NOT EXISTS</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>&lt;&gt;</code> and NULL</span><p><code>city &lt;&gt; 'Mumbai'</code> drops unknown cities. Use <code>IS DISTINCT FROM</code> or add <code>OR city IS NULL</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: integer division</span><p><code>1 / 5 = 0</code>. Multiply by <code>100.0</code> or cast to numeric before dividing.</p></div>
  <div class="callout trap"><span class="label">Trap: count(*) after a LEFT JOIN</span><p>Counts the unmatched row too, so empty months show 1. Count a right-side column: <code>count(o.order_id)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: BETWEEN on timestamps</span><p>The end date means midnight; the last day is lost. Use <code>&gt;= start AND &lt; end + 1 day</code>.</p></div>

  <h2 id="si-rapid"><span class="num">09</span>Conceptual Rapid-Fire</h2>
  <p>Short "explain the difference" questions. Interviewers use them as warm-ups or between coding problems. Answer in two or three sentences with one example from the data.</p>
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
  Cities are Mumbai, Delhi, Mumbai, NULL plus an extra 'Delhi'. <code>UNION</code> removes duplicates (Mumbai, Delhi, NULL = 3 rows; it needs a sort or hash, so it is slower; NULLs count as equal here). <code>UNION ALL</code> keeps every row (5). Default to <code>UNION ALL</code> unless you need de-duplication.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RANK vs DENSE_RANK vs ROW_NUMBER?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT name, salary,
       row_number() OVER w AS row_number, rank() OVER w AS rank, dense_rank() OVER w AS dense_rank
FROM employees WINDOW w AS (ORDER BY salary DESC) ORDER BY salary DESC, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>row_number</th><th>rank</th><th>dense_rank</th></tr><tr><td>Ravi</td><td>120000</td><td>1</td><td>1</td><td>1</td></tr><tr><td>Sara</td><td>95000</td><td>2</td><td>2</td><td>2</td></tr><tr><td>Tom</td><td>95000</td><td>3</td><td>2</td><td>2</td></tr><tr><td>Uma</td><td>70000</td><td>4</td><td>4</td><td>3</td></tr><tr><td>Vik</td><td>65000</td><td>5</td><td>5</td><td>4</td></tr></table>
  On ties: <code>ROW_NUMBER</code> breaks them arbitrarily (1,2,3,4,5), <code>RANK</code> shares and leaves a gap (1,2,2,4), <code>DENSE_RANK</code> shares with no gap (1,2,2,3). <code>WINDOW w AS (…)</code> names a window once so several functions can reuse it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)?</summary><div class="qa-body">
  <div class="fx" data-lang="sql">SELECT count(*) AS all_rows, count(city) AS non_null, count(DISTINCT city) AS distinct_cities
FROM customers;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>all_rows</th><th>non_null</th><th>distinct_cities</th></tr><tr><td>4</td><td>3</td><td>2</td></tr></table>
  <code>COUNT(*)</code> counts rows; <code>COUNT(col)</code> skips NULLs (Dia); <code>COUNT(DISTINCT col)</code> also merges repeats (Mumbai twice).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CHAR vs VARCHAR?</summary><div class="qa-body"><code>CHAR(n)</code> is fixed length, padded with spaces; <code>VARCHAR(n)</code> stores only what you give, up to n. Use CHAR only for truly fixed codes (country 'IN'). In PostgreSQL, <code>text</code> and <code>varchar</code> perform the same; CHAR is never faster.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Clustered vs non-clustered index?</summary><div class="qa-body">An index is a sorted lookup structure that lets the database find rows without reading the whole table, like the index at the back of a textbook. A <strong>clustered</strong> index <em>is</em> the table: rows are stored in key order, so only one per table (SQL Server, MySQL InnoDB's primary key). A <strong>non-clustered</strong> index is a separate structure pointing to the rows; you can have many. PostgreSQL tables are heaps, so every index is non-clustered (<code>CLUSTER</code> reorders once, not maintained).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Primary key vs unique key?</summary><div class="qa-body">Both enforce uniqueness with an index. A primary key is one per table, implies NOT NULL, and is the row's identity that foreign keys point to. A table can have many unique keys, and they allow NULLs (in PostgreSQL, multiple NULLs, since NULL ≠ NULL).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order does SQL evaluate a query? Can you use a SELECT alias in WHERE?</summary><div class="qa-body"><div class="flow"><span>FROM / JOIN</span><span>WHERE</span><span>GROUP BY</span><span>HAVING</span><span>SELECT</span><span>DISTINCT</span><span>ORDER BY</span><span>LIMIT</span></div>The database first picks the tables, then filters rows, then groups, then filters groups, and only then computes the SELECT list. So a SELECT alias doesn't exist yet in <code>WHERE</code> (error), but works in <code>ORDER BY</code>, which runs after SELECT. Window functions run at the SELECT stage, which is why you filter them in an outer query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>IN vs EXISTS vs JOIN for "customers who ordered"?</summary><div class="qa-body">All give Asha, Ben, Chen, and modern planners often produce the same plan. <code>EXISTS</code> stops at the first match and is NULL-safe in the negated form. A plain <code>JOIN</code> returns a customer once <em>per order</em> (Asha twice), so it needs <code>DISTINCT</code>: a classic duplicate bug.</div></details>
</main>
`
});
