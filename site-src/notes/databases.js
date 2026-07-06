// notes/databases.js — TOPIC_CONTENT entries for the Databases phase
Object.assign(TOPIC_CONTENT, {
  "sql": `<main>
  <h1>SQL — Basics to Advanced</h1>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ddl"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Creating &amp; Modifying Data</span><span class="rm-sub">DDL/DML, types, constraints, INSERT/UPDATE/DELETE</span></div></div>
      <div class="rm-item rm-done" data-target="foundations"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Query Foundations</span><span class="rm-sub">SELECT, WHERE, DISTINCT, ORDER BY, LIMIT</span></div></div>
      <div class="rm-item rm-done" data-target="aggregation"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Aggregation &amp; GROUP BY</span><span class="rm-sub">The pipeline — and HAVING vs WHERE</span></div></div>
      <div class="rm-item rm-done" data-target="joins"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">JOINs</span><span class="rm-sub">INNER, LEFT, anti-join, self-join</span></div></div>
      <div class="rm-item rm-done" data-target="setops"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Set Operations</span><span class="rm-sub">UNION, UNION ALL, INTERSECT, EXCEPT</span></div></div>
      <div class="rm-item rm-done" data-target="subqueries"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Subqueries &amp; CTEs</span><span class="rm-sub">Correlated cost, EXISTS vs IN, recursion</span></div></div>
      <div class="rm-item rm-done" data-target="windows"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Window Functions</span><span class="rm-sub">Why rows don't collapse — frames, ranking</span></div></div>
      <div class="rm-item rm-done" data-target="indexes"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Indexes &amp; Optimization</span><span class="rm-sub">B-tree, the sargability trap, EXPLAIN</span></div></div>
      <div class="rm-item rm-done" data-target="acid"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Transactions &amp; ACID</span><span class="rm-sub">Isolation levels — what each prevents</span></div></div>
      <div class="rm-item rm-done" data-target="modeling"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Data Modeling</span><span class="rm-sub">Normalization as dependency logic</span></div></div>
    </div>
  </div>

  <div class="panel">
  <h2>Revision</h2>
  <ol>
    <li><strong>SQL has four sub-languages:</strong> <strong>DDL</strong> defines structure (CREATE, ALTER, DROP), <strong>DML</strong> changes data (INSERT, UPDATE, DELETE), <strong>DQL</strong> reads it (SELECT), and <strong>TCL</strong> controls transactions (COMMIT, ROLLBACK). Constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK, DEFAULT) are rules the database enforces for you — they are the cheapest, most reliable data-quality tool you have, because a violated constraint rejects the write instead of silently storing bad data.</li>
    <li><strong>The logical execution order is not the written order:</strong> SQL is written SELECT&#8594;FROM&#8594;WHERE&#8594;GROUP BY&#8594;HAVING&#8594;ORDER BY, but it executes FROM&#8594;WHERE&#8594;GROUP BY&#8594;HAVING&#8594;SELECT&#8594;ORDER BY&#8594;LIMIT. This single fact explains why you can't reference a SELECT alias in WHERE (WHERE runs before SELECT computes it), why WHERE can't filter on an aggregate (aggregates don't exist until GROUP BY runs), and why HAVING can. Memorise this order; half of all SQL confusion dissolves once you internalise it.</li>
    <li><strong>WHERE filters rows, HAVING filters groups:</strong> WHERE runs before aggregation on individual rows — it cannot see SUM/COUNT/AVG because those don't exist yet. HAVING runs after GROUP BY on the aggregated result — it exists specifically to filter on aggregates. <code>WHERE amount &gt; 100</code> keeps individual sales over 100 then sums them; <code>HAVING SUM(amount) &gt; 100</code> sums every group then keeps groups whose total exceeds 100. Different pipeline stages, different results.</li>
    <li><strong>INNER keeps matches, LEFT keeps all left rows:</strong> INNER JOIN returns only rows with a match on both sides. LEFT JOIN returns every left row, filling NULLs where the right has no match. The anti-join pattern — <code>LEFT JOIN ... WHERE right.id IS NULL</code> — finds left rows with no right match (customers who never ordered, users who churned). This is the single most useful non-obvious JOIN pattern in analytics.</li>
    <li><strong>UNION stacks rows vertically; JOIN glues columns horizontally:</strong> a JOIN combines columns from two tables side by side on a key; a UNION appends the rows of one result below another (same column count and compatible types required). <code>UNION</code> removes duplicates (an expensive sort); <code>UNION ALL</code> keeps every row and is much faster — default to UNION ALL unless you actually need dedup.</li>
    <li><strong>Correlated subqueries are O(n&#178;):</strong> a correlated subquery references the outer query and re-executes once per outer row. On a 1M-row table that's 1M subquery executions. EXISTS short-circuits (stops at first match) so it's cheaper than IN when the subquery is large; IN materialises the entire subquery result set first. The general fix for a slow correlated subquery is to rewrite it as a JOIN or a window function — both let the engine process the set once.</li>
    <li><strong>Window functions compute across rows without collapsing them:</strong> GROUP BY collapses N rows into one per group. A window function (<code>OVER (PARTITION BY ...)</code>) computes the same aggregate but attaches it to every original row — you keep all N rows AND get the group-level value on each. This is why "show each sale alongside its region's total" needs a window, not GROUP BY. ROW_NUMBER/RANK/LAG/LEAD plus running totals via <code>SUM() OVER (ORDER BY ...)</code> cover ~90% of real window use.</li>
    <li><strong>An index is a sorted B-tree; a function on the column destroys it:</strong> a B-tree index stores column values sorted, giving O(log n) lookup instead of O(n) scan. But <code>WHERE YEAR(date) = 2024</code> applies a function to every stored value, so the sorted order is useless and the engine falls back to a full scan. Rewrite as <code>WHERE date &gt;= '2024-01-01' AND date &lt; '2025-01-01'</code> — now the range maps directly onto the sorted index. This property is called sargability, and it's the most common real-world query-performance bug.</li>
    <li><strong>ACID isolation levels trade correctness for concurrency:</strong> READ UNCOMMITTED allows dirty reads (seeing another transaction's uncommitted data). READ COMMITTED prevents dirty reads but allows non-repeatable reads (same query, different result within one transaction). REPEATABLE READ prevents that but allows phantoms (new rows appearing). SERIALIZABLE prevents all three but serialises conflicting transactions, killing throughput. Each level up costs concurrency. Know which anomaly each level permits — it's a guaranteed senior-interview question.</li>
    <li><strong>Normalization is about functional dependencies, not memorised rules:</strong> 1NF = atomic values (no lists in a cell). 2NF = no partial dependency (in a composite key, no non-key column depends on only part of the key). 3NF = no transitive dependency (no non-key column depends on another non-key column). The point is eliminating update anomalies: if a fact lives in two places, the two copies can disagree. Star schemas in warehouses deliberately denormalise for read speed — know both directions and when each applies.</li>
  </ol>
  </div>

  <!-- ═══════════════════════════════ 01. DDL & DML ═══════════════════════════════ -->
  <h2 id="ddl">01 &#183; Creating &amp; Modifying Data (DDL &amp; DML)</h2>

  <div class="callout def">
    <span class="label">SQL is four languages wearing one coat</span>
    <p>Every SQL statement belongs to one of four families, and knowing which family a keyword is in tells you what it does and whether it can be rolled back:</p>
    <p><strong>DDL — Data Definition Language</strong> (<code>CREATE</code>, <code>ALTER</code>, <code>DROP</code>, <code>TRUNCATE</code>): defines and changes the <em>structure</em> — tables, columns, indexes, constraints. In most engines DDL auto-commits and cannot be rolled back.<br>
    <strong>DML — Data Manipulation Language</strong> (<code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>): changes the <em>rows</em>. Runs inside a transaction, so it can be rolled back.<br>
    <strong>DQL — Data Query Language</strong> (<code>SELECT</code>): reads data. The rest of this note is mostly DQL.<br>
    <strong>TCL — Transaction Control</strong> (<code>COMMIT</code>, <code>ROLLBACK</code>, <code>SAVEPOINT</code>): makes DML changes permanent or undoes them. (<strong>DCL</strong> — <code>GRANT</code>/<code>REVOKE</code> — controls permissions.)</p>
  </div>

  <p>You create a table by naming its columns, giving each a <strong>type</strong>, and attaching <strong>constraints</strong> — rules the database enforces on every write:</p>

  <div class="fx"><span class="k">CREATE</span> <span class="k">TABLE</span> customers (
    customer_id  <span class="k">INT</span>          <span class="k">PRIMARY KEY</span>,          <span class="c">-- unique + not null, identifies the row</span>
    email        <span class="k">VARCHAR</span>(<span class="y">255</span>) <span class="k">UNIQUE</span> <span class="k">NOT NULL</span>,     <span class="c">-- no duplicates, must be present</span>
    name         <span class="k">VARCHAR</span>(<span class="y">100</span>) <span class="k">NOT NULL</span>,
    country      <span class="k">CHAR</span>(<span class="y">2</span>)      <span class="k">DEFAULT</span> <span class="g">'US'</span>,        <span class="c">-- value used when none supplied</span>
    credit       <span class="k">DECIMAL</span>(<span class="y">10</span>,<span class="y">2</span>) <span class="k">CHECK</span> (credit &gt;= <span class="y">0</span>),   <span class="c">-- rejects negatives</span>
    created_at   <span class="k">TIMESTAMP</span>    <span class="k">DEFAULT</span> <span class="k">CURRENT_TIMESTAMP</span>
);

<span class="k">CREATE</span> <span class="k">TABLE</span> orders (
    order_id     <span class="k">INT</span>       <span class="k">PRIMARY KEY</span>,
    customer_id  <span class="k">INT</span>       <span class="k">NOT NULL</span>,
    amount       <span class="k">DECIMAL</span>(<span class="y">10</span>,<span class="y">2</span>),
    <span class="k">FOREIGN KEY</span> (customer_id) <span class="k">REFERENCES</span> customers(customer_id)  <span class="c">-- referential integrity</span>
);</div>

  <div class="callout intu">
    <span class="label">The constraints, and what each actually guarantees</span>
    <p><strong>PRIMARY KEY</strong> — one per table; unique + NOT NULL; the row's identity. Automatically indexed.<br>
    <strong>FOREIGN KEY</strong> — a column that must match a primary key in another table. It's what makes <code>orders.customer_id</code> point to a real customer; the DB rejects an order for a customer that doesn't exist, and can <code>ON DELETE CASCADE</code> to clean up children.<br>
    <strong>NOT NULL</strong> — the value must be present.<br>
    <strong>UNIQUE</strong> — no two rows share this value (but NULLs are allowed and don't clash).<br>
    <strong>CHECK</strong> — an arbitrary boolean the row must satisfy (<code>age &gt;= 18</code>).<br>
    <strong>DEFAULT</strong> — the value inserted when you omit the column.<br>
    A constraint is a promise the database keeps for you: bad data is rejected at write time instead of discovered later in a broken report.</p>
  </div>

  <div class="callout intu">
    <span class="label">Data types you actually reach for</span>
    <p><strong>Integers</strong>: <code>INT</code>, <code>BIGINT</code> (large IDs), <code>SMALLINT</code>. <strong>Exact decimals</strong>: <code>DECIMAL(p,s)</code>/<code>NUMERIC</code> — use this for money, never <code>FLOAT</code> (binary floats can't represent 0.10 exactly and quietly drift). <strong>Approximate</strong>: <code>FLOAT</code>/<code>REAL</code> for scientific values. <strong>Text</strong>: <code>VARCHAR(n)</code> (variable, capped), <code>CHAR(n)</code> (fixed, padded), <code>TEXT</code> (unbounded). <strong>Time</strong>: <code>DATE</code>, <code>TIME</code>, <code>TIMESTAMP</code> (store UTC), <code>INTERVAL</code>. <strong>Other</strong>: <code>BOOLEAN</code>, <code>UUID</code>, <code>JSON</code>/<code>JSONB</code> (Postgres — semi-structured). Picking the narrowest correct type saves storage and lets more of the index fit in memory.</p>
  </div>

  <p>DML changes the rows. Three verbs cover it:</p>

  <div class="fx"><span class="c">-- INSERT: add rows (one, many, or the result of a query)</span>
<span class="k">INSERT INTO</span> customers (customer_id, email, name)
<span class="k">VALUES</span> (<span class="y">1</span>, <span class="g">'a@x.com'</span>, <span class="g">'Ada'</span>),
       (<span class="y">2</span>, <span class="g">'b@x.com'</span>, <span class="g">'Ben'</span>);        <span class="c">-- multi-row insert in one statement</span>

<span class="k">INSERT INTO</span> vip_customers <span class="k">SELECT</span> * <span class="k">FROM</span> customers <span class="k">WHERE</span> credit &gt; <span class="y">10000</span>;  <span class="c">-- insert-select</span>

<span class="c">-- UPDATE: change existing rows — the WHERE decides which</span>
<span class="k">UPDATE</span> customers <span class="k">SET</span> credit = credit + <span class="y">50</span> <span class="k">WHERE</span> country = <span class="g">'US'</span>;

<span class="c">-- DELETE: remove rows the WHERE selects</span>
<span class="k">DELETE FROM</span> orders <span class="k">WHERE</span> amount <span class="k">IS</span> <span class="k">NULL</span>;</div>

  <div class="callout trap">
    <span class="label">UPDATE/DELETE without a WHERE rewrites or empties the whole table</span>
    <p><code>DELETE FROM orders;</code> deletes <em>every</em> row. <code>UPDATE accounts SET balance = 0;</code> zeroes <em>every</em> account. The WHERE clause is the only thing scoping the change — forget it and you've hit the entire table. Habits that save you: run the <code>WHERE</code> as a <code>SELECT</code> first to see exactly which rows you'll touch, and wrap risky changes in a transaction (<code>BEGIN; ... ;</code> then verify, then <code>COMMIT</code> or <code>ROLLBACK</code>).</p>
  </div>

  <div class="callout intu">
    <span class="label">DELETE vs TRUNCATE vs DROP — three different scopes</span>
    <p><strong>DELETE</strong> (DML) removes rows one at a time, honours the WHERE, fires triggers, and is transactional/rollback-able — but slow for wiping a huge table. <strong>TRUNCATE</strong> (DDL) instantly empties the whole table by deallocating its pages, resets identity counters, but takes no WHERE and usually can't be rolled back. <strong>DROP</strong> (DDL) deletes the table <em>and its structure</em> — the table no longer exists. Rule of thumb: DELETE for "remove some rows," TRUNCATE for "empty this table fast," DROP for "get rid of this table entirely." <code>ALTER TABLE</code> is how you change structure after creation: <code>ALTER TABLE customers ADD COLUMN phone VARCHAR(20);</code></p>
  </div>

  <!-- ═══════════════════════════════ 02. FOUNDATIONS ═══════════════════════════════ -->
  <h2 id="foundations">02 &#183; Query Foundations</h2>

  <div class="callout def">
    <span class="label">The one mental model that fixes everything: logical execution order</span>
    <p>You <strong>write</strong> SQL in this order:<br>
    <strong>SELECT &#8594; FROM &#8594; WHERE &#8594; GROUP BY &#8594; HAVING &#8594; ORDER BY &#8594; LIMIT</strong><br><br>
    The database <strong>executes</strong> it in a completely different order:<br>
    <strong>FROM &#8594; WHERE &#8594; GROUP BY &#8594; HAVING &#8594; SELECT &#8594; ORDER BY &#8594; LIMIT</strong><br><br>
    Almost every "why doesn't this work" in SQL traces back to this mismatch. The engine builds a working set of rows (FROM), filters them (WHERE), groups them (GROUP BY), filters groups (HAVING), <em>then</em> computes your output columns (SELECT), sorts (ORDER BY), and truncates (LIMIT).</p>
  </div>

  <div class="callout intu">
    <span class="label">Why this immediately explains three "gotchas"</span>
    <p><strong>1. You can't use a SELECT alias in WHERE.</strong> <code>SELECT price*qty AS total FROM t WHERE total &gt; 100</code> fails — WHERE runs before SELECT computes <code>total</code>. It doesn't exist yet.<br><br>
    <strong>2. You can't filter an aggregate in WHERE.</strong> <code>WHERE SUM(x) &gt; 100</code> fails — SUM doesn't exist until GROUP BY runs, which is after WHERE.<br><br>
    <strong>3. You CAN use a SELECT alias in ORDER BY.</strong> <code>ORDER BY total</code> works — ORDER BY runs after SELECT, so the alias exists by then.</p>
  </div>

  <p>The core clauses, as fast reference:</p>

  <div class="fx"><span class="k">SELECT</span> <span class="k">DISTINCT</span> region, product        <span class="c">-- DISTINCT dedupes the final rows</span>
<span class="k">FROM</span> sales
<span class="k">WHERE</span> amount &gt; <span class="y">100</span>                    <span class="c">-- row filter, runs early</span>
  <span class="k">AND</span> region <span class="k">IN</span> (<span class="g">'North'</span>, <span class="g">'South'</span>)   <span class="c">-- IN = shorthand for OR chain</span>
  <span class="k">AND</span> product <span class="k">LIKE</span> <span class="g">'A%'</span>            <span class="c">-- % = any chars, _ = one char</span>
  <span class="k">AND</span> ship_date <span class="k">IS</span> <span class="k">NOT</span> <span class="k">NULL</span>       <span class="c">-- never use = NULL, always IS NULL</span>
<span class="k">ORDER BY</span> amount <span class="k">DESC</span>
<span class="k">LIMIT</span> <span class="y">10</span> <span class="k">OFFSET</span> <span class="y">20</span>;             <span class="c">-- skip 20, take next 10 (pagination)</span></div>

  <div class="callout trap">
    <span class="label">The NULL trap that catches everyone</span>
    <p><code>NULL</code> is not a value — it's "unknown." Any comparison with NULL returns NULL (not TRUE, not FALSE). So <code>WHERE x = NULL</code> matches nothing, ever. You must use <code>IS NULL</code> / <code>IS NOT NULL</code>. Worse: <code>WHERE x != 5</code> silently <em>excludes</em> rows where x is NULL, because <code>NULL != 5</code> is NULL, not TRUE. If you want those rows, you need <code>WHERE x != 5 OR x IS NULL</code>. This is the single most common source of silently-wrong query results.</p>
  </div>

  <div class="callout intu">
    <span class="label">COUNT(*) vs COUNT(col) — a real distinction</span>
    <p><code>COUNT(*)</code> counts rows, including rows that are all NULL. <code>COUNT(col)</code> counts non-NULL values in that column — NULLs are skipped. So <code>COUNT(*) - COUNT(email)</code> tells you how many rows have a missing email. <code>COUNT(DISTINCT col)</code> counts unique non-NULL values. Interviewers ask this to check whether you actually understand NULL semantics.</p>
  </div>

  <div class="callout intu">
    <span class="label">CASE, COALESCE and the handy NULL helpers</span>
    <p><code>CASE WHEN score &gt;= 90 THEN 'A' WHEN score &gt;= 80 THEN 'B' ELSE 'C' END</code> is SQL's if/else — usable in SELECT, WHERE, ORDER BY, and inside aggregates. <code>COALESCE(a, b, c)</code> returns the first non-NULL argument (great for defaults: <code>COALESCE(nickname, name, 'Anon')</code>). <code>NULLIF(a, b)</code> returns NULL when a = b (classic guard against divide-by-zero: <code>x / NULLIF(y, 0)</code>). These three turn messy real-world data into clean output in a single pass.</p>
  </div>

  <!-- ═══════════════════════════════ 03. AGGREGATION ═══════════════════════════════ -->
  <h2 id="aggregation">03 &#183; Aggregation, GROUP BY &amp; the HAVING/WHERE distinction</h2>

  <div class="callout def">
    <span class="label">What GROUP BY actually does</span>
    <p>GROUP BY collapses rows that share a value into a single output row, and every column in SELECT must then be either (a) a column you grouped by, or (b) wrapped in an aggregate function. This rule follows directly from the collapse: if you group 10 sales rows into one "North" row, and you ask for <code>amount</code>, the engine has 10 different amounts and no way to pick one — so it forces you to aggregate (SUM, AVG, MAX) or group by it.</p>
  </div>

  <p>Here is the distinction that gets asked in nearly every SQL screen. These two queries both "filter on 100" and return <strong>completely different results</strong>:</p>

  <div class="fx"><span class="c">-- Query A: filter rows FIRST, then aggregate what survives</span>
<span class="k">SELECT</span> region, <span class="k">SUM</span>(amount) <span class="k">AS</span> total
<span class="k">FROM</span> sales
<span class="k">WHERE</span> amount &gt; <span class="y">100</span>          <span class="c">-- keeps individual sales over 100</span>
<span class="k">GROUP BY</span> region;

<span class="c">-- Query B: aggregate ALL rows, then filter the groups</span>
<span class="k">SELECT</span> region, <span class="k">SUM</span>(amount) <span class="k">AS</span> total
<span class="k">FROM</span> sales
<span class="k">GROUP BY</span> region
<span class="k">HAVING</span> <span class="k">SUM</span>(amount) &gt; <span class="y">100</span>;   <span class="c">-- keeps regions whose TOTAL exceeds 100</span></div>

  <div class="callout intu">
    <span class="label">Trace the pipeline and the difference is obvious</span>
    <p>Say the North region has three sales: 60, 60, 60.<br><br>
    <strong>Query A</strong>: WHERE runs first and throws out all three (none exceeds 100). North contributes nothing. Total for North: it doesn't even appear.<br><br>
    <strong>Query B</strong>: no row filter. All three sum to 180. HAVING checks 180 &gt; 100 &#8594; true. North appears with total 180.<br><br>
    Same "100," opposite outcomes — because WHERE filters the <em>inputs</em> to the sum and HAVING filters the <em>output</em> of the sum. This is the whole point of having two filter clauses.</p>
  </div>

  <div class="callout trap">
    <span class="label">Use both together — and know why the order is efficient</span>
    <p>Real queries often use both: <code>WHERE</code> to cut rows before the expensive grouping, then <code>HAVING</code> to filter the result. <code>WHERE region != 'Test' ... GROUP BY region HAVING SUM(amount) &gt; 1000</code>. Putting the cheap row-filter in WHERE first means the engine groups fewer rows — filtering early is almost always faster than filtering late. Putting a non-aggregate condition in HAVING when it could go in WHERE is a performance mistake, even though it returns the same answer.</p>
  </div>

  <div class="fx"><span class="c"># Conditional aggregation — count/sum with a condition inside the aggregate</span>
<span class="k">SELECT</span> region,
       <span class="k">COUNT</span>(*) <span class="k">AS</span> total_orders,
       <span class="k">SUM</span>(<span class="k">CASE</span> <span class="k">WHEN</span> status = <span class="g">'returned'</span> <span class="k">THEN</span> <span class="y">1</span> <span class="k">ELSE</span> <span class="y">0</span> <span class="k">END</span>) <span class="k">AS</span> returns,
       <span class="k">AVG</span>(<span class="k">CASE</span> <span class="k">WHEN</span> status = <span class="g">'completed'</span> <span class="k">THEN</span> amount <span class="k">END</span>) <span class="k">AS</span> avg_completed
<span class="k">FROM</span> orders
<span class="k">GROUP BY</span> region;</div>
  <p>Conditional aggregation (<code>SUM(CASE WHEN ...)</code>) is how you pivot and compute segmented metrics in one pass — a heavily-used real-world pattern.</p>

  <!-- ═══════════════════════════════ 04. JOINS ═══════════════════════════════ -->
  <h2 id="joins">04 &#183; JOINs</h2>

  <div class="callout def">
    <span class="label">The four joins, precisely</span>
    <p><strong>INNER JOIN</strong>: rows that match on both sides. No match = row disappears.<br>
    <strong>LEFT JOIN</strong>: all rows from the left table; right-side columns are NULL where there's no match.<br>
    <strong>RIGHT JOIN</strong>: mirror of LEFT (rarely used — people flip the table order and use LEFT).<br>
    <strong>FULL OUTER JOIN</strong>: all rows from both sides, NULLs filled where either side is missing.</p>
  </div>

  <div class="callout intu">
    <span class="label">Analogy: two guest lists</span>
    <p>You have a list of invited guests (left) and a list of people who showed up (right). <strong>INNER</strong> = people both invited and present. <strong>LEFT</strong> = everyone invited, marked present or absent. <strong>Anti-join</strong> (LEFT + <code>WHERE present.name IS NULL</code>) = invited but didn't show. That last one — finding what's missing — is the pattern you'll reach for constantly and it's not obvious to beginners.</p>
  </div>

  <div class="fx"><span class="c">-- Anti-join: customers who have never placed an order</span>
<span class="k">SELECT</span> c.customer_id, c.name
<span class="k">FROM</span> customers c
<span class="k">LEFT JOIN</span> orders o <span class="k">ON</span> c.customer_id = o.customer_id
<span class="k">WHERE</span> o.customer_id <span class="k">IS</span> <span class="k">NULL</span>;      <span class="c">-- no matching order = churned/never-active</span>

<span class="c">-- Self-join: find employees who earn more than their manager</span>
<span class="k">SELECT</span> e.name <span class="k">AS</span> employee, m.name <span class="k">AS</span> manager
<span class="k">FROM</span> employees e
<span class="k">JOIN</span> employees m <span class="k">ON</span> e.manager_id = m.employee_id
<span class="k">WHERE</span> e.salary &gt; m.salary;         <span class="c">-- same table aliased twice</span></div>

  <div class="callout trap">
    <span class="label">The JOIN that silently multiplies your rows</span>
    <p>If the join key is not unique on the right side, each left row matches multiple right rows and your result set <em>multiplies</em>. Join <code>orders</code> to <code>order_items</code> (one order, many items) and then <code>SUM(orders.total)</code> — you've now counted each order's total once per item, inflating the sum. This "fan-out" is the most common cause of wrong aggregate numbers after a join. Fix: aggregate to the right grain first (in a CTE), then join. Always know the cardinality of your join keys before you trust a post-join SUM.</p>
  </div>

  <!-- ═══════════════════════════════ 05. SET OPERATIONS ═══════════════════════════════ -->
  <h2 id="setops">05 &#183; Set Operations</h2>

  <div class="callout def">
    <span class="label">Stacking result sets vertically</span>
    <p>A JOIN glues tables together <em>horizontally</em> (adds columns). A set operation stacks two result sets <em>vertically</em> (adds rows). Both sides must have the <strong>same number of columns</strong> with <strong>compatible types</strong>, matched by position, not name.<br><br>
    <strong>UNION</strong> — all rows from both, duplicates removed.<br>
    <strong>UNION ALL</strong> — all rows from both, duplicates kept.<br>
    <strong>INTERSECT</strong> — only rows present in <em>both</em> result sets.<br>
    <strong>EXCEPT</strong> (a.k.a. <code>MINUS</code> in Oracle) — rows in the first set that are <em>not</em> in the second.</p>
  </div>

  <div class="fx"><span class="c">-- All contact emails from two sources, duplicates removed once</span>
<span class="k">SELECT</span> email <span class="k">FROM</span> customers
<span class="k">UNION</span>
<span class="k">SELECT</span> email <span class="k">FROM</span> newsletter_signups;

<span class="c">-- Customers who appear in BOTH the trial and the paid list</span>
<span class="k">SELECT</span> user_id <span class="k">FROM</span> trial_users
<span class="k">INTERSECT</span>
<span class="k">SELECT</span> user_id <span class="k">FROM</span> paid_users;

<span class="c">-- Trial users who never converted (in trial, not in paid)</span>
<span class="k">SELECT</span> user_id <span class="k">FROM</span> trial_users
<span class="k">EXCEPT</span>
<span class="k">SELECT</span> user_id <span class="k">FROM</span> paid_users;</div>

  <div class="callout trap">
    <span class="label">UNION dedupes — and that dedup is not free</span>
    <p><code>UNION</code> must sort or hash the combined result to remove duplicates, which is expensive on large sets. If you know the two sides can't overlap — or you don't care about duplicates — use <code>UNION ALL</code>, which just concatenates and is dramatically faster. A very common performance bug is reaching for plain <code>UNION</code> out of habit when <code>UNION ALL</code> would do. Also: <code>ORDER BY</code> applies to the <em>whole</em> combined result and goes only at the very end, after the last SELECT.</p>
  </div>

  <div class="callout intu">
    <span class="label">INTERSECT / EXCEPT vs the JOIN equivalents</span>
    <p><code>INTERSECT</code> is a readable stand-in for an inner join used purely to test membership, and <code>EXCEPT</code> for the anti-join (<code>LEFT JOIN ... WHERE right IS NULL</code>). Set operators are cleaner when you're comparing whole rows across identically-shaped queries; joins win when you also need columns from both sides. One catch: set operators treat two NULLs as equal (they match), whereas <code>=</code> in a join never matches NULL to NULL — a subtle difference when your keys can be NULL.</p>
  </div>

  <!-- ═══════════════════════════════ 06. SUBQUERIES & CTEs ═══════════════════════════════ -->
  <h2 id="subqueries">06 &#183; Subqueries, CTEs &amp; the correlated-subquery cost</h2>

  <div class="callout def">
    <span class="label">CTE vs subquery</span>
    <p>A <strong>CTE</strong> (Common Table Expression, the <code>WITH</code> clause) is a named temporary result you define once and reference by name — readable, and chainable (each CTE can reference the previous). A <strong>subquery</strong> is an inline query nested inside another. Functionally similar; CTEs win on readability and on avoiding repetition when you need the same intermediate result twice.</p>
  </div>

  <div class="fx"><span class="k">WITH</span> regional_totals <span class="k">AS</span> (
    <span class="k">SELECT</span> region, <span class="k">SUM</span>(amount) <span class="k">AS</span> total
    <span class="k">FROM</span> sales
    <span class="k">GROUP BY</span> region
),
ranked <span class="k">AS</span> (
    <span class="k">SELECT</span> region, total,
           <span class="k">RANK</span>() <span class="k">OVER</span> (<span class="k">ORDER BY</span> total <span class="k">DESC</span>) <span class="k">AS</span> rk
    <span class="k">FROM</span> regional_totals            <span class="c">-- second CTE references the first</span>
)
<span class="k">SELECT</span> * <span class="k">FROM</span> ranked <span class="k">WHERE</span> rk &lt;= <span class="y">3</span>;   <span class="c">-- top 3 regions by revenue</span></div>

  <div class="callout intu">
    <span class="label">Why a correlated subquery can be O(n&#178;) — and EXISTS vs IN</span>
    <p>A <strong>correlated</strong> subquery references a column from the outer query, so it must re-run <em>once for every outer row</em>. Outer table has 1M rows &#8594; the subquery executes 1M times. That's the O(n&#178;) blow-up.<br><br>
    <strong>EXISTS</strong> stops at the first matching row (short-circuit) — it only needs to know if <em>any</em> match exists, so it's cheap even on a large subquery.<br><br>
    <strong>IN</strong> materialises the <em>entire</em> subquery result into a set, then checks membership. On a large subquery that set can be huge.<br><br>
    Rule of thumb: <code>EXISTS</code> when the subquery is big and you only need existence; <code>IN</code> when the subquery returns a small, fixed list. And a NULL inside an <code>IN</code> list breaks <code>NOT IN</code> entirely (it returns no rows) — another reason to prefer <code>NOT EXISTS</code>.</p>
  </div>

  <div class="fx"><span class="c">-- Correlated (slow on big tables): re-runs per outer row</span>
<span class="k">SELECT</span> name <span class="k">FROM</span> employees e
<span class="k">WHERE</span> salary &gt; (<span class="k">SELECT</span> <span class="k">AVG</span>(salary) <span class="k">FROM</span> employees <span class="k">WHERE</span> dept = e.dept);

<span class="c">-- Same result via window function: engine scans the set ONCE</span>
<span class="k">SELECT</span> name <span class="k">FROM</span> (
    <span class="k">SELECT</span> name, salary,
           <span class="k">AVG</span>(salary) <span class="k">OVER</span> (<span class="k">PARTITION BY</span> dept) <span class="k">AS</span> dept_avg
    <span class="k">FROM</span> employees
) t
<span class="k">WHERE</span> salary &gt; dept_avg;</div>

  <div class="callout trap">
    <span class="label">Recursive CTEs exist — know they're the tool for hierarchies</span>
    <p>When you need to walk a tree (org chart, category hierarchy, bill-of-materials), a <code>WITH RECURSIVE</code> CTE is the tool: an anchor query (the starting rows) UNION ALL a recursive query that references the CTE itself. You don't need to memorise the syntax cold, but you must recognise that "traverse arbitrary-depth hierarchy in SQL" &#8594; recursive CTE, because interviewers ask how you'd handle it.</p>
  </div>

  <!-- ═══════════════════════════════ 07. WINDOW FUNCTIONS ═══════════════════════════════ -->
  <h2 id="windows">07 &#183; Window Functions</h2>

  <div class="callout def">
    <span class="label">The defining property: aggregate without collapsing</span>
    <p>GROUP BY takes N rows and returns one row per group — you lose the individual rows. A <strong>window function</strong> computes a value <em>across a set of rows</em> (the "window") but returns it <em>alongside every original row</em>. You keep all N rows AND get the group-level computation on each one. That's the entire reason window functions exist, and it's what GROUP BY fundamentally cannot do.</p>
  </div>

  <div class="callout intu">
    <span class="label">The question that forces a window function</span>
    <p>"Show each sale, and next to it, that region's total sales." With GROUP BY you'd get one row per region — the individual sales are gone. With a window: <code>SUM(amount) OVER (PARTITION BY region)</code> puts the region total on every sale row, no collapse. The moment a question says "each row, alongside a group-level number," you need a window, not GROUP BY.</p>
  </div>

  <div class="fx"><span class="c">-- PARTITION BY = the grouping; ORDER BY inside OVER = ordering within each partition</span>
<span class="k">SELECT</span> region, sale_date, amount,
       <span class="k">ROW_NUMBER</span>() <span class="k">OVER</span> (<span class="k">PARTITION BY</span> region <span class="k">ORDER BY</span> amount <span class="k">DESC</span>) <span class="k">AS</span> rn,
       <span class="k">SUM</span>(amount)  <span class="k">OVER</span> (<span class="k">PARTITION BY</span> region)                       <span class="k">AS</span> region_total,
       <span class="k">SUM</span>(amount)  <span class="k">OVER</span> (<span class="k">PARTITION BY</span> region <span class="k">ORDER BY</span> sale_date)      <span class="k">AS</span> running_total,
       <span class="k">LAG</span>(amount)  <span class="k">OVER</span> (<span class="k">PARTITION BY</span> region <span class="k">ORDER BY</span> sale_date)      <span class="k">AS</span> prev_sale
<span class="k">FROM</span> sales;</div>

  <div class="callout intu">
    <span class="label">ROW_NUMBER vs RANK vs DENSE_RANK — the tie behaviour</span>
    <p>On values 100, 90, 90, 80:<br>
    <strong>ROW_NUMBER</strong> &#8594; 1, 2, 3, 4 (arbitrary tiebreak, always unique).<br>
    <strong>RANK</strong> &#8594; 1, 2, 2, 4 (ties share, then a gap).<br>
    <strong>DENSE_RANK</strong> &#8594; 1, 2, 2, 3 (ties share, no gap).<br><br>
    "Latest row per user" &#8594; <code>ROW_NUMBER() OVER (PARTITION BY user ORDER BY ts DESC) = 1</code>. This dedup-keep-latest pattern is the #1 real-world window use.</p>
  </div>

  <div class="callout trap">
    <span class="label">The frame clause changes the answer silently</span>
    <p>Adding <code>ORDER BY</code> inside <code>OVER()</code> changes the default frame from "whole partition" to "start of partition through current row" — which is how you get a running total instead of a grand total. To make a proper N-row moving average you specify the frame explicitly: <code>AVG(x) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)</code> for a 7-day window. And <code>ROWS</code> (physical rows) vs <code>RANGE</code> (value range, ties grouped) give different results when the ORDER BY column has duplicates. Getting the frame wrong is a subtle, common bug — the query runs fine and returns the wrong number.</p>
  </div>

  <div class="fx"><span class="c">-- The six classic patterns interviewers expect you to write from memory</span>
<span class="c">-- 1. Nth highest</span>       <span class="k">SELECT</span> <span class="k">DISTINCT</span> salary <span class="k">ORDER BY</span> salary <span class="k">DESC</span> <span class="k">LIMIT</span> <span class="y">1</span> <span class="k">OFFSET</span> N-<span class="y">1</span>;
<span class="c">-- 2. Dedup keep latest</span>  <span class="k">ROW_NUMBER</span>() <span class="k">OVER</span> (<span class="k">PARTITION BY</span> id <span class="k">ORDER BY</span> ts <span class="k">DESC</span>) = <span class="y">1</span>
<span class="c">-- 3. MoM growth</span>         (rev - <span class="k">LAG</span>(rev) <span class="k">OVER</span> (<span class="k">ORDER BY</span> month)) / <span class="k">LAG</span>(rev) <span class="k">OVER</span> (...) * <span class="y">100</span>
<span class="c">-- 4. 7-day rolling avg</span>  <span class="k">AVG</span>(x) <span class="k">OVER</span> (<span class="k">ORDER BY</span> d <span class="k">ROWS BETWEEN</span> <span class="y">6</span> <span class="k">PRECEDING</span> <span class="k">AND</span> <span class="k">CURRENT ROW</span>)
<span class="c">-- 5. Running total</span>      <span class="k">SUM</span>(x) <span class="k">OVER</span> (<span class="k">ORDER BY</span> d)
<span class="c">-- 6. Churn (anti-join)</span>  <span class="k">LEFT JOIN</span> next_month ... <span class="k">WHERE</span> next.id <span class="k">IS</span> <span class="k">NULL</span></div>

  <!-- ═══════════════════════════════ 08. INDEXES ═══════════════════════════════ -->
  <h2 id="indexes">08 &#183; Indexes &amp; Query Optimization</h2>

  <div class="callout def">
    <span class="label">What an index is, mechanically</span>
    <p>An index is a separate sorted data structure (almost always a <strong>B-tree</strong>) that stores the indexed column's values in order, each pointing back to its table row. Because it's sorted, the engine finds a value in O(log n) steps instead of scanning all n rows. The cost: every INSERT/UPDATE/DELETE must also update the index, so indexes speed reads and slow writes. You index the columns you filter and join on, not every column.</p>
  </div>

  <div class="callout intu">
    <span class="label">Analogy: the index at the back of a textbook</span>
    <p>To find every mention of "gradient descent" you don't read all 800 pages (full table scan) — you flip to the alphabetical index and jump straight to the page numbers (index lookup). But if you ask "every term that <em>contains</em> the letters 'grad'," the alphabetical index is useless — it's sorted by whole word, not by substring. That's exactly why a leading-wildcard <code>LIKE '%grad%'</code> can't use an index, while <code>LIKE 'grad%'</code> can.</p>
  </div>

  <div class="callout trap">
    <span class="label">Sargability: the #1 real-world performance bug</span>
    <p>Wrapping an indexed column in a function or expression destroys the index, because the stored sorted values no longer match what you're comparing. Every one of these forces a full scan:</p>
    <div class="fx"><span class="c">-- BAD: function on the column → index unusable → full scan</span>
<span class="k">WHERE</span> <span class="k">YEAR</span>(order_date) = <span class="y">2024</span>
<span class="k">WHERE</span> <span class="k">UPPER</span>(email) = <span class="g">'A@B.COM'</span>
<span class="k">WHERE</span> amount * <span class="y">1.1</span> &gt; <span class="y">100</span>

<span class="c">-- GOOD: rewrite so the bare column meets a constant → index used</span>
<span class="k">WHERE</span> order_date &gt;= <span class="g">'2024-01-01'</span> <span class="k">AND</span> order_date &lt; <span class="g">'2025-01-01'</span>
<span class="k">WHERE</span> email = <span class="g">'a@b.com'</span>          <span class="c">-- store normalised, or use a functional index</span>
<span class="k">WHERE</span> amount &gt; <span class="y">100</span> / <span class="y">1.1</span></div>
    <p>A query that is "sargable" (Search-ARGument-able) keeps the indexed column bare on one side of the comparison. This one idea fixes more slow queries in practice than any other.</p>
  </div>

  <div class="callout intu">
    <span class="label">Composite index column order matters</span>
    <p>An index on <code>(region, date)</code> is sorted by region first, then date within region. It can serve <code>WHERE region = 'North'</code> and <code>WHERE region = 'North' AND date &gt; '...'</code> — but it <em>cannot</em> efficiently serve <code>WHERE date &gt; '...'</code> alone, because the dates aren't globally sorted, only within each region. Rule: put the column you filter on <em>equality</em> first, the <em>range</em> column second. This is the "leftmost prefix" rule and it's a frequent interview probe.</p>
  </div>

  <div class="fx"><span class="c">-- EXPLAIN shows the plan. What you're looking for:</span>
<span class="k">EXPLAIN</span> <span class="k">ANALYZE</span> <span class="k">SELECT</span> * <span class="k">FROM</span> orders <span class="k">WHERE</span> customer_id = <span class="y">42</span>;

<span class="c">-- Seq Scan     → reading every row. Bad on large tables. Missing/unused index.</span>
<span class="c">-- Index Scan   → using the index. Good.</span>
<span class="c">-- Index Only Scan → answered entirely from the index, never touched the table. Best.</span>
<span class="c">-- Nested Loop vs Hash Join → how tables are joined; Hash usually better for big joins.</span></div>

  <!-- ═══════════════════════════════ 09. TRANSACTIONS & ACID ═══════════════════════════════ -->
  <h2 id="acid">09 &#183; Transactions &amp; ACID</h2>

  <div class="callout def">
    <span class="label">ACID, one real example per letter</span>
    <p><strong>Atomicity</strong> — all statements in a transaction succeed or all roll back. Transfer $100: debit A <em>and</em> credit B both happen, or neither does. No state where money left A but never reached B.<br>
    <strong>Consistency</strong> — the transaction moves the DB from one valid state to another, respecting all constraints (foreign keys, checks). A transaction that would orphan a row is rejected.<br>
    <strong>Isolation</strong> — concurrent transactions don't see each other's half-finished work (degree controlled by isolation level, below).<br>
    <strong>Durability</strong> — once committed, the data survives a crash/power loss (written to disk, not just memory).</p>
  </div>

  <div class="callout intu">
    <span class="label">Isolation levels: what each one actually prevents</span>
    <p>Higher isolation = more correctness, less concurrency. Each level permits a specific anomaly:</p>
    <table class="tbl">
      <tr><th>Level</th><th>Dirty read</th><th>Non-repeatable read</th><th>Phantom</th></tr>
      <tr><td>READ UNCOMMITTED</td><td>possible</td><td>possible</td><td>possible</td></tr>
      <tr><td>READ COMMITTED</td><td>prevented</td><td>possible</td><td>possible</td></tr>
      <tr><td>REPEATABLE READ</td><td>prevented</td><td>prevented</td><td>possible</td></tr>
      <tr><td>SERIALIZABLE</td><td>prevented</td><td>prevented</td><td>prevented</td></tr>
    </table>
    <p style="margin-top:.6rem"><strong>Dirty read</strong>: you read another transaction's uncommitted change that later rolls back — you acted on data that never really existed. <strong>Non-repeatable read</strong>: you read a row twice in one transaction and get different values because someone committed an UPDATE in between. <strong>Phantom</strong>: you run the same <code>WHERE</code> twice and new rows appear because someone committed an INSERT that matches your filter.</p>
  </div>

  <div class="callout trap">
    <span class="label">The tradeoff is throughput, and it's the interview point</span>
    <p>SERIALIZABLE is the safest and the slowest — it effectively serialises conflicting transactions, so under high concurrency you get lock contention and reduced throughput. Most production systems run at <strong>READ COMMITTED</strong> (the default in Postgres and Oracle) as the pragmatic balance. The senior-level answer is never "always use the strongest level" — it's "match the level to the anomaly the workload actually cares about, because each step up costs concurrency."</p>
  </div>

  <div class="fx"><span class="k">BEGIN</span>;
  <span class="k">UPDATE</span> accounts <span class="k">SET</span> balance = balance - <span class="y">100</span> <span class="k">WHERE</span> id = <span class="y">1</span>;
  <span class="k">UPDATE</span> accounts <span class="k">SET</span> balance = balance + <span class="y">100</span> <span class="k">WHERE</span> id = <span class="y">2</span>;
<span class="k">COMMIT</span>;   <span class="c">-- both updates durable together; ROLLBACK undoes both if anything failed</span></div>

  <!-- ═══════════════════════════════ 10. DATA MODELING ═══════════════════════════════ -->
  <h2 id="modeling">10 &#183; Data Modeling &amp; Normalization</h2>

  <div class="callout def">
    <span class="label">Normalization is functional-dependency management, not memorised rules</span>
    <p>The three normal forms each remove a class of redundancy, and the real goal underneath all of them is eliminating <strong>update anomalies</strong> — situations where one fact is stored in multiple places and the copies can drift out of sync.<br><br>
    <strong>1NF</strong>: every cell holds a single atomic value (no comma-separated lists, no repeating groups).<br>
    <strong>2NF</strong>: 1NF, plus no non-key column depends on only <em>part</em> of a composite key. (Only relevant when the primary key is multiple columns.)<br>
    <strong>3NF</strong>: 2NF, plus no non-key column depends on <em>another non-key</em> column (no transitive dependency).</p>
  </div>

  <div class="callout intu">
    <span class="label">Why the abstract rules matter: a concrete anomaly</span>
    <p>Store <code>(order_id, product_id, product_name, product_category)</code> with the order. <code>product_name</code> depends on <code>product_id</code>, not on the order — a transitive dependency (violates 3NF). Now the product's name lives in every order row that contains it. Rename the product and you must update thousands of order rows; miss one and your data contradicts itself. Normalising — moving product attributes to a <code>products</code> table keyed by <code>product_id</code> — means the name lives in exactly one place. That's the point: one fact, one location.</p>
  </div>

  <div class="callout trap">
    <span class="label">Warehouses deliberately denormalise — know both directions</span>
    <p>Everything above optimises for <em>write</em> integrity. Analytical warehouses do the opposite: <strong>star schemas</strong> denormalise into a central fact table plus wide dimension tables, accepting redundancy to avoid expensive joins on huge read-heavy queries. OLTP (transactional apps) &#8594; normalise for write consistency. OLAP (analytics) &#8594; denormalise for read speed. The senior answer knows normalization is a spectrum you choose along based on read/write profile, not a law you always maximise. Also know SCD Type 2 (add a new row with validity dates) as the standard way warehouses preserve history instead of overwriting.</p>
  </div>

  <!-- ═══════════════════════════════ Q&A ═══════════════════════════════ -->
  <h2 id="qa">Interview Q&amp;A</h2>
  <div class="qa-head"><button class="reveal-all" id="revealAll">Reveal all</button></div>

  <details class="qa"><summary class="qmark">What's the difference between DELETE, TRUNCATE and DROP?</summary>
  <div class="qa-body"><p><code>DELETE</code> is DML: it removes rows one at a time, respects a <code>WHERE</code> clause, fires triggers, and can be rolled back inside a transaction — but it's slow for emptying a large table. <code>TRUNCATE</code> is DDL: it empties the entire table almost instantly by deallocating data pages, resets auto-increment counters, takes no WHERE, and typically can't be rolled back. <code>DROP</code> is DDL that removes the table's data <em>and</em> its definition — the table ceases to exist. Mnemonic: DELETE some rows, TRUNCATE all rows, DROP the whole table.</p></div></details>

  <details class="qa"><summary class="qmark">Why store money as DECIMAL instead of FLOAT?</summary>
  <div class="qa-body"><p><code>FLOAT</code>/<code>REAL</code> are binary floating-point types and cannot represent most decimal fractions exactly — 0.10 + 0.20 doesn't equal 0.30, and errors accumulate across sums. <code>DECIMAL(p,s)</code>/<code>NUMERIC</code> stores the value in base-10 with a fixed number of digits after the point, so it's exact. For anything where cents must add up — currency, invoices, ledgers — use DECIMAL. FLOAT is for scientific/approximate values where a tiny relative error is acceptable.</p></div></details>

  <details class="qa"><summary class="qmark">UNION vs UNION ALL — what's the difference and which should you default to?</summary>
  <div class="qa-body"><p><code>UNION</code> combines two result sets and removes duplicate rows, which requires an expensive sort or hash of the whole result. <code>UNION ALL</code> simply concatenates both sets, keeping duplicates, and is much faster because it does no dedup work. Default to <code>UNION ALL</code> and only use plain <code>UNION</code> when you genuinely need duplicates removed. Both require the two SELECTs to have the same number of columns with compatible types, matched by position.</p></div></details>

  <details class="qa"><summary class="qmark">What does a FOREIGN KEY give you, and what happens on delete?</summary>
  <div class="qa-body"><p>A foreign key enforces referential integrity: a child column (e.g. <code>orders.customer_id</code>) must match an existing primary key in the parent table, so you can't insert an order for a customer that doesn't exist. On deleting a parent row you choose the behaviour: <code>ON DELETE RESTRICT</code> (default — blocks the delete while children exist), <code>ON DELETE CASCADE</code> (delete the children too), or <code>ON DELETE SET NULL</code> (orphan them by nulling the reference). It's the database guaranteeing your relationships stay valid instead of trusting application code to never make a mistake.</p></div></details>

  <details class="qa"><summary class="qmark">Why can't you use a column alias defined in SELECT inside your WHERE clause?</summary>
  <div class="qa-body"><p>Because of logical execution order: WHERE runs before SELECT. The engine filters rows (WHERE) before it computes the output columns (SELECT), so the alias literally doesn't exist yet when WHERE runs. ORDER BY, which runs after SELECT, <em>can</em> use the alias. The fix is to repeat the expression in WHERE, or wrap the query in a subquery/CTE and filter on the alias in the outer query.</p></div></details>

  <details class="qa"><summary class="qmark">HAVING vs WHERE — explain with an example where they give different answers.</summary>
  <div class="qa-body"><p>WHERE filters individual rows before aggregation; HAVING filters groups after aggregation. Take a region with sales 60, 60, 60. <code>WHERE amount &gt; 100</code> removes all three rows before summing, so the region contributes nothing. <code>HAVING SUM(amount) &gt; 100</code> sums to 180 first, then keeps the region because 180 &gt; 100. Same threshold, opposite results, because one filters the sum's inputs and the other filters its output. Use WHERE for cheap row cuts before grouping (faster), HAVING only for conditions on aggregates.</p></div></details>

  <details class="qa"><summary class="qmark">Why is a correlated subquery slow, and how do you fix it?</summary>
  <div class="qa-body"><p>A correlated subquery references the outer query, so it re-executes once per outer row — O(n&#178;) on an n-row table. The fix is almost always to rewrite it as a JOIN or a window function, both of which let the engine process the data set in a single pass. Example: "employees earning above their department average" as a correlated subquery re-runs the AVG per employee; rewritten with <code>AVG(salary) OVER (PARTITION BY dept)</code> it computes once. For existence checks specifically, <code>EXISTS</code> short-circuits at the first match and beats a correlated <code>IN</code>.</p></div></details>

  <details class="qa"><summary class="qmark">EXISTS vs IN — when do you pick each?</summary>
  <div class="qa-body"><p><code>EXISTS</code> stops at the first matching row, so it's efficient when the subquery is large and you only need to know whether any match exists. <code>IN</code> materialises the entire subquery result into a set before checking membership, which is fine for a small fixed list but expensive for a large subquery. Critically, <code>NOT IN</code> breaks if the subquery can return NULL (it yields no rows at all), so prefer <code>NOT EXISTS</code> for negation. Default: EXISTS for large correlated checks, IN for small static lists.</p></div></details>

  <details class="qa"><summary class="qmark">A window function and GROUP BY can both compute a group average. When must you use the window?</summary>
  <div class="qa-body"><p>When you need to keep the individual rows. GROUP BY collapses each group into one row, discarding the detail. A window function computes the group value and attaches it to every original row without collapsing. So "show each transaction next to its account's average transaction" requires <code>AVG(amt) OVER (PARTITION BY account)</code> — GROUP BY would leave you with one row per account and no individual transactions. Any "each row alongside a group-level metric" requirement forces a window.</p></div></details>

  <details class="qa"><summary class="qmark">You have <code>WHERE YEAR(order_date) = 2024</code> and the query is slow despite an index on order_date. Why?</summary>
  <div class="qa-body"><p>Wrapping the indexed column in <code>YEAR()</code> makes the predicate non-sargable: the index stores raw <code>order_date</code> values in sorted order, but the engine now has to compute <code>YEAR()</code> on every row to test the condition, so it can't use the sorted structure and falls back to a full scan. Rewrite as a range on the bare column: <code>WHERE order_date &gt;= '2024-01-01' AND order_date &lt; '2025-01-01'</code>. Now the comparison maps directly onto the sorted index and becomes an index range scan. Any function or arithmetic on an indexed column kills the index.</p></div></details>

  <details class="qa"><summary class="qmark">Walk through the isolation levels and the anomaly each one permits.</summary>
  <div class="qa-body"><p>READ UNCOMMITTED allows dirty reads (reading uncommitted data that may roll back). READ COMMITTED prevents dirty reads but allows non-repeatable reads (a row's value changes between two reads in the same transaction because someone committed an UPDATE). REPEATABLE READ prevents non-repeatable reads but allows phantoms (new rows matching your WHERE appear because someone committed an INSERT). SERIALIZABLE prevents all three by effectively serialising conflicting transactions, at the cost of concurrency/throughput. Most systems default to READ COMMITTED as the practical balance; you raise the level only for the specific anomaly the workload can't tolerate.</p></div></details>

  <details class="qa"><summary class="qmark">Explain 3NF through the anomaly it prevents, not the definition.</summary>
  <div class="qa-body"><p>3NF removes transitive dependencies — a non-key column depending on another non-key column. Concretely: storing <code>product_name</code> in an orders table, where name depends on <code>product_id</code> (itself a non-key attribute of the order). The consequence is redundancy: the product name is duplicated across every order line for that product. Renaming the product now requires updating many rows, and any missed row makes the data self-contradictory — an update anomaly. Moving product attributes into a <code>products</code> table keyed by product_id stores each fact once. Warehouses knowingly violate this (star schemas) to trade write-integrity for read speed.</p></div></details>

  <details class="qa"><summary class="qmark">You join orders to order_items and your SUM(order_total) is inflated. What happened?</summary>
  <div class="qa-body"><p>Join fan-out. <code>order_items</code> has multiple rows per order, so the LEFT/INNER join multiplies each order row once per item. Summing <code>order_total</code> now counts each order's total once per line item, inflating the result by the number of items. The fix is to aggregate to the correct grain before joining: compute item-level aggregates in a CTE keyed by order_id, then join one row per order. The general principle: always know the cardinality of your join keys, because a one-to-many join silently duplicates the "one" side's columns.</p></div></details>

</main>`,
});
