// notes/databases/sql_fundamentals.js — Querying Basics
Object.assign(TOPIC_CONTENT, {
  "sql_fundamentals": `<main>
  <h1>Querying Basics</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Querying Basics</span></div>
  <p class="lead">This is where you start writing SQL: asking one table for some columns, keeping only the rows you want, summarising many rows into one number, summarising per group, handling missing values, labelling rows with CASE, sorting, and finally changing data. Every real query, however long, is built from these pieces, and most interview SQL is these pieces combined with the NULL and ordering rules that trip people up. Every query runs on the <strong>Biteful</strong> food-delivery database designed in <a class="xref" data-note="sql_relational">Relational Model</a> (7 customers, 5 restaurants, 10 orders, 15 order lines), small enough that every result can be checked by hand. All output is real output from PostgreSQL 16; where SQLite behaves differently it was run in SQLite too and is shown.</p>

  <h2 id="sf-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="sf-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="69" y="41" text-anchor="middle" font-size="12">What is a DB</text><text x="69" y="58" text-anchor="middle" class="tm" font-size="10">why a DBMS exists</text>
<line x1="128" y1="45" x2="146" y2="45" stroke="currentColor" marker-end="url(#sf-a0)"/>
<rect x="148" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="207" y="41" text-anchor="middle" font-size="12">Relational model</text><text x="207" y="58" text-anchor="middle" class="tm" font-size="10">Biteful's 4 tables</text>
<line x1="266" y1="45" x2="284" y2="45" stroke="currentColor" marker-end="url(#sf-a0)"/>
<rect x="286" y="20" width="118" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="345" y="41" text-anchor="middle" font-size="12" font-weight="700">Querying basics</text><text x="345" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="404" y1="45" x2="422" y2="45" stroke="currentColor" marker-end="url(#sf-a0)"/>
<rect x="424" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="479" y="41" text-anchor="middle" font-size="12">JOINs</text><text x="479" y="58" text-anchor="middle" class="tm" font-size="10">several tables</text>
<line x1="534" y1="45" x2="552" y2="45" stroke="currentColor" marker-end="url(#sf-a0)"/>
<rect x="554" y="20" width="98" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="603" y="41" text-anchor="middle" font-size="12">Subqueries,</text><text x="603" y="58" text-anchor="middle" class="tm" font-size="10">windows …</text>
<text x="330" y="110" text-anchor="middle" class="tm" font-size="10.5">Everything here works on ONE table at a time. JOINs combine tables; subqueries nest queries;</text>
<text x="330" y="127" text-anchor="middle" class="tm" font-size="10.5">window functions summarise without collapsing rows. All of them reuse this page's clauses and NULL rules.</text>
</svg><figcaption>Querying Basics is the first page where you write questions in SQL. Every later SQL page assumes its execution order and its NULL logic.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="sql_relational">Relational Model &amp; PostgreSQL</a></b><span>Biteful is designed: customers, restaurants, orders (the M:N bridge) and order_items, with keys, types and constraints. It has deliberate quirks: Esha's NULL city, Gita and Momo Magic with no orders, NULL delivery minutes, ties.</span></li>
    <li><b>This note adds: asking and changing one table</b><span>SELECT and expressions, WHERE, the order in which a query is really evaluated, aggregates, GROUP BY, HAVING, NULL and three-valued logic, CASE, sorting and paging, INSERT/UPDATE/DELETE and UPSERT.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sql_joins">JOINs</a></b><span>Questions that need two tables ("revenue per restaurant <em>name</em>", "customers who never ordered"). Then <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a> (including the full NOT IN trap previewed here), <a class="xref" data-note="sql_windows">Window Functions</a> (ties, running totals) and <a class="xref" data-note="sql_interview">SQL Practice</a>.</span></li>
  </ol>

  <h2 id="sf-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each clause answers the question above it, and its limit raises the next question. All numbers are from Biteful's ten orders.</p>
  <ol class="story">
    <li><b>SELECT &amp; FROM</b><span>Q: how do I ask a table anything? → Name the table (FROM) and the columns or expressions you want (SELECT): amount × 1.05 for GST. But it returns every row, and I only want some…</span></li>
    <li><b>WHERE</b><span>Q: only the rows I care about? → A condition per row; only TRUE rows survive: 7 delivered orders. But writing WHERE before SELECT's alias fails, and nobody said why…</span></li>
    <li><b>Logical execution order</b><span>Q: in what order does the database really read my clauses? → FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT; so a SELECT alias doesn't exist yet in WHERE. Now we can ask bigger questions: totals?</span></li>
    <li><b>Aggregates</b><span>Q: one number for many rows? → COUNT, SUM, AVG, MIN, MAX: 10 orders, ₹3,510 in total, ₹2,630 delivered. But that is one number for the whole table, and the business wants it per restaurant…</span></li>
    <li><b>GROUP BY</b><span>Q: one summary per group? → Sort rows into piles by a key, one output row per pile: delivered revenue Dosa Hut 500, Biryani Bros 1,230, Pizza Point 900. But how do I keep only some piles?</span></li>
    <li><b>HAVING vs WHERE</b><span>Q: filter groups, not rows? → WHERE drops rows before piling, HAVING drops piles after counting: customers with ≥ 2 live orders = Asha 3, Ben 2, Chen 2. But some values were missing all along: Esha's city, four delivery times…</span></li>
    <li><b>NULL &amp; three-valued logic</b><span>Q: what happens with unknown values? → Comparisons give UNKNOWN, WHERE drops it (city &lt;&gt; 'Pune' loses Esha); COUNT(*) 10 vs COUNT(minutes) 6; NOT IN with a NULL returns nothing. Now: how do I label rows and count conditions side by side?</span></li>
    <li><b>CASE &amp; conditional aggregation</b><span>Q: if/else inside a query, and several counts in one pass? → CASE bands; SUM(CASE …), FILTER: Pizza Point cancel rate 0.33. But the output order is still random…</span></li>
    <li><b>ORDER BY, DISTINCT, LIMIT</b><span>Q: sorted, de-duplicated, top N? → ORDER BY (NULLs first in DESC!), DISTINCT, LIMIT/OFFSET; ties at 4.2 make "top 1" arbitrary. Reading is done; how do I change data?</span></li>
    <li><b>INSERT, UPDATE, DELETE</b><span>Q: add, change, remove rows? → The same WHERE picks rows to change; RETURNING shows them; forgetting WHERE changes all 10. But "insert, or update if it already exists" races…</span></li>
    <li><b>Constraints &amp; UPSERT</b><span>Q: insert-or-update in one safe step? → INSERT … ON CONFLICT (key) DO UPDATE, which needs a UNIQUE key and still obeys every CHECK. Next: questions across tables need JOINs.</span></li>
  </ol>

  <h2 id="sf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Querying Basics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">SELECT &amp; WHERE</div>
        <ul>
          <li><b>FROM</b> names the table; <b>SELECT</b> picks/computes columns</li>
          <li><b>Alias</b> — <code>amount * 1.05 AS with_gst</code>; table alias <code>FROM orders o</code></li>
          <li>⚠ <b>Integer division</b> — 32 / 60 = 0; use <code>60.0</code> or <code>::numeric</code></li>
          <li><b>WHERE</b> keeps only TRUE rows; AND binds tighter than OR → brackets</li>
          <li><b>IN</b>, <b>BETWEEN</b> (inclusive), <b>LIKE</b> <code>%</code> <code>_</code>, <b>ILIKE</b> (PG)</li>
          <li>⚠ <b>Timestamp BETWEEN</b> drops the last day → half-open <code>&gt;= start AND &lt; next</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logical order</div>
        <ul>
          <li><b>FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</b></li>
          <li>⚠ alias in WHERE fails (SELECT not run yet); fine in ORDER BY</li>
          <li>⚠ aggregates in WHERE fail → HAVING</li>
          <li><b>LIMIT last</b> — after sorting, so "top N" is defined</li>
          <li>💡 cook: fetch, discard, bowl, drop small bowls, plate + name, arrange, serve</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Aggregates &amp; groups</div>
        <ul>
          <li><b>COUNT, SUM, AVG, MIN, MAX</b> — many rows → one value</li>
          <li><b>GROUP BY</b> — one output row per key; every SELECT column = key or aggregate</li>
          <li><b>WHERE</b> rows before grouping · <b>HAVING</b> groups after</li>
          <li><b>Dates</b> — <code>DATE_TRUNC</code>, <code>::date</code>, <code>EXTRACT</code>, <code>+ INTERVAL</code></li>
          <li>💡 receipts into piles, one summary line per pile</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">NULL &amp; 3-valued logic</div>
        <ul>
          <li><b>NULL</b> = unknown; comparisons → UNKNOWN; WHERE drops it</li>
          <li>⚠ <code>city = NULL</code> → 0 rows; <code>city &lt;&gt; 'Pune'</code> drops Esha</li>
          <li><b>IS NULL</b>, <b>COALESCE</b>, <b>NULLIF</b>, <b>IS DISTINCT FROM</b></li>
          <li><b>Truth</b> — FALSE AND U = F; TRUE OR U = T; else UNKNOWN</li>
          <li><b>COUNT(*)</b> rows · <b>COUNT(col)</b> non-NULL · <b>COUNT(DISTINCT)</b>: 7 / 6 / 2</li>
          <li>⚠ zero rows: COUNT = 0, SUM/AVG = NULL; ⚠ NOT IN + NULL = nothing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">CASE &amp; pivots</div>
        <ul>
          <li><b>CASE WHEN … THEN … ELSE … END</b> — first match wins; no ELSE → NULL</li>
          <li>⚠ NULL falls through to ELSE: test <code>IS NULL</code> first</li>
          <li><b>Conditional aggregation</b> — <code>SUM(CASE WHEN … THEN 1 ELSE 0 END)</code></li>
          <li><b>FILTER</b> — <code>COUNT(*) FILTER (WHERE status = 'cancelled')</code></li>
          <li><b>Rate</b> — <code>AVG(CASE WHEN cond THEN 1.0 ELSE 0 END)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sort, page, DISTINCT</div>
        <ul>
          <li><b>No ORDER BY = no guaranteed order</b></li>
          <li><b>NULLs</b> — last in ASC, first in DESC (PG); SQLite opposite; <code>NULLS LAST</code></li>
          <li>⚠ ties (4.2 = 4.2) → add a tiebreaker or use RANK</li>
          <li><b>LIMIT n OFFSET k</b>; ⚠ large OFFSET still reads skipped rows</li>
          <li><b>DISTINCT</b> — whole row; NULLs count as one</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Writing data</div>
        <ul>
          <li><b>INSERT / UPDATE / DELETE … RETURNING</b></li>
          <li>⚠ UPDATE without WHERE hits every row → SELECT first, BEGIN … ROLLBACK</li>
          <li><b>FK</b> blocks deleting a parent with children</li>
          <li><b>UPSERT</b> — <code>ON CONFLICT (key) DO UPDATE SET c = EXCLUDED.c</code> / DO NOTHING</li>
          <li>⚠ needs a UNIQUE/PK on the conflict columns; CHECKs still apply</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sf-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sf-select"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">SELECT &amp; Expressions</span><span class="rm-sub">Asking a table a question</span></div></div>
      <div class="rm-item rm-done" data-target="sf-where"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Filtering with WHERE</span><span class="rm-sub">AND/OR, IN, BETWEEN, LIKE</span></div></div>
      <div class="rm-item rm-done" data-target="sf-exec"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Logical Execution Order</span><span class="rm-sub">Traced step by step</span></div></div>
      <div class="rm-item rm-done" data-target="sf-agg"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Aggregates</span><span class="rm-sub">Many rows, one number</span></div></div>
      <div class="rm-item rm-done" data-target="sf-group"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">GROUP BY</span><span class="rm-sub">One row per pile, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="sf-having"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">HAVING vs WHERE</span><span class="rm-sub">Filtering groups</span></div></div>
      <div class="rm-item rm-done" data-target="sf-null"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">NULL &amp; Three-Valued Logic</span><span class="rm-sub">TRUE, FALSE, UNKNOWN</span></div></div>
      <div class="rm-item rm-done" data-target="sf-case"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">CASE &amp; Conditional Aggregation</span><span class="rm-sub">Pivot counts in one pass</span></div></div>
      <div class="rm-item rm-done" data-target="sf-sort"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">ORDER BY, DISTINCT, LIMIT</span><span class="rm-sub">Sorting, ties, paging</span></div></div>
      <div class="rm-item rm-done" data-target="sf-write"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">INSERT, UPDATE, DELETE</span><span class="rm-sub">Changing data safely</span></div></div>
      <div class="rm-item rm-done" data-target="sf-upsert"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Constraints &amp; UPSERT</span><span class="rm-sub">Insert or update in one step</span></div></div>
      <div class="rm-item rm-done" data-target="sf-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One pipeline of clauses</span></div></div>
      <div class="rm-item rm-done" data-target="sf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sf-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Predict the output</span></div></div>
    </div>
  </div>

  <h2 id="sf-select"><span class="num">01</span>SELECT &amp; Expressions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's data sits in tables. The simplest possible question, "show me the restaurants and their ratings", still needs a way to say <em>which table</em> and <em>which columns</em>. How do you ask?</p>
  </div>
  <h3>The running example</h3>
  <p>All of this page runs on Biteful's <code>orders</code> table (and sometimes <code>customers</code> and <code>restaurants</code>). Keep it in view; every result below can be checked against it:</p>
  <div class="fx" data-lang="sql">SELECT * FROM orders;</div>
  <table class="tbl out"><caption>orders: the running example</caption><tr><th>order_id</th><th>customer_id</th><th>restaurant_id</th><th>ordered_at</th><th>status</th><th>amount</th><th>delivery_minutes</th></tr><tr><td>101</td><td>1</td><td>10</td><td>2026-03-02 12:10:00+05:30</td><td>delivered</td><td>240.00</td><td>32</td></tr><tr><td>102</td><td>2</td><td>11</td><td>2026-03-02 13:05:00+05:30</td><td>delivered</td><td>450.00</td><td>41</td></tr><tr><td>103</td><td>3</td><td>12</td><td>2026-03-02 20:30:00+05:30</td><td>delivered</td><td>520.00</td><td>38</td></tr><tr><td>104</td><td>1</td><td>12</td><td>2026-03-03 13:15:00+05:30</td><td>delivered</td><td>380.00</td><td>NULL</td></tr><tr><td>105</td><td>4</td><td>13</td><td>2026-03-03 19:45:00+05:30</td><td>cancelled</td><td>310.00</td><td>NULL</td></tr><tr><td>106</td><td>2</td><td>11</td><td>2026-03-04 12:40:00+05:30</td><td>delivered</td><td>180.00</td><td>25</td></tr><tr><td>107</td><td>5</td><td>12</td><td>2026-03-04 21:10:00+05:30</td><td>cancelled</td><td>260.00</td><td>NULL</td></tr><tr><td>108</td><td>3</td><td>10</td><td>2026-03-05 18:20:00+05:30</td><td>delivered</td><td>260.00</td><td>29</td></tr><tr><td>109</td><td>6</td><td>11</td><td>2026-03-05 20:05:00+05:30</td><td>delivered</td><td>600.00</td><td>52</td></tr><tr><td>110</td><td>1</td><td>10</td><td>2026-03-08 20:50:00+05:30</td><td>pending</td><td>310.00</td><td>NULL</td></tr></table>
  <p>Restaurant ids: 10 Dosa Hut, 11 Biryani Bros, 12 Pizza Point, 13 Green Bowl, 14 Momo Magic (no orders). Customer ids: 1 Asha, 2 Ben, 3 Chen, 4 Dia, 5 Esha (city NULL), 6 Farah, 7 Gita (no orders). <code>SELECT *</code> means "all columns".</p>
  <h3>Picking and computing columns</h3>
  <p><code>FROM</code> names the table; <code>SELECT</code> picks or computes the columns you want back. Each output column can be any expression, renamed with <code>AS</code> (an <strong>alias</strong>). Food delivery in India carries 5% GST, so:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount, amount * 0.05 AS gst, amount * 1.05 AS with_gst
FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th><th>gst</th><th>with_gst</th></tr><tr><td>101</td><td>240.00</td><td>12.0000</td><td>252.0000</td></tr><tr><td>102</td><td>450.00</td><td>22.5000</td><td>472.5000</td></tr><tr><td>103</td><td>520.00</td><td>26.0000</td><td>546.0000</td></tr><tr><td>104</td><td>380.00</td><td>19.0000</td><td>399.0000</td></tr><tr><td>105</td><td>310.00</td><td>15.5000</td><td>325.5000</td></tr><tr><td>106</td><td>180.00</td><td>9.0000</td><td>189.0000</td></tr><tr><td>107</td><td>260.00</td><td>13.0000</td><td>273.0000</td></tr><tr><td>108</td><td>260.00</td><td>13.0000</td><td>273.0000</td></tr><tr><td>109</td><td>600.00</td><td>30.0000</td><td>630.0000</td></tr><tr><td>110</td><td>310.00</td><td>15.5000</td><td>325.5000</td></tr></table>
  <p>Check one row by hand: order 101, ₹240 × 0.05 = 12, 240 × 1.05 = 252. Every row is computed independently; the table itself is unchanged. Text has expressions too: <code>||</code> joins strings and <code>UPPER</code> capitalises:</p>
  <div class="fx" data-lang="sql">SELECT name || ' (' || city || ')' AS label, UPPER(cuisine) AS cuisine
FROM restaurants;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>label</th><th>cuisine</th></tr><tr><td>Dosa Hut (Pune)</td><td>SOUTH INDIAN</td></tr><tr><td>Biryani Bros (Mumbai)</td><td>BIRYANI</td></tr><tr><td>Pizza Point (Pune)</td><td>PIZZA</td></tr><tr><td>Green Bowl (Mumbai)</td><td>HEALTHY</td></tr><tr><td>Momo Magic (Pune)</td><td>TIBETAN</td></tr></table>
  <table class="tbl">
    <tr><td><strong>Table alias</strong></td><td><code>FROM orders AS o</code> → <code>o.amount</code>; essential once several tables appear (JOINs)</td></tr>
    <tr><td><strong>Cast</strong></td><td><code>'42'::int</code> (Postgres) or <code>CAST(amount AS int)</code> (standard)</td></tr>
    <tr><td><strong>Avoid <code>SELECT *</code></strong></td><td>In real code it breaks when columns change and reads more than needed</td></tr>
  </table>
  <h3>The integer division trap</h3>
  <p>Ask a calculator for 7 ÷ 2 and you get 3.5. Ask PostgreSQL and you get 3: when both numbers are whole numbers (integers), the answer is a whole number and the fraction is thrown away. It bites in ordinary conversions. <code>delivery_minutes</code> is an integer; turn it into hours:</p>
  <div class="fx" data-lang="sql">SELECT order_id, delivery_minutes,
       delivery_minutes / 60   AS hours_wrong,
       delivery_minutes / 60.0 AS hours_right
FROM orders
WHERE order_id IN (101, 109);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>delivery_minutes</th><th>hours_wrong</th><th>hours_right</th></tr><tr><td>101</td><td>32</td><td>0</td><td>0.53333333333333333333</td></tr><tr><td>109</td><td>52</td><td>0</td><td>0.86666666666666666667</td></tr></table>
  <p>32 / 60 is 0 and 52 / 60 is 0 in integer arithmetic. Make either side a decimal (<code>60.0</code>, or <code>::numeric</code>) and the fraction comes back: 0.533… and 0.866… hours.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A form you hand to a clerk: "from the orders register (FROM), copy these columns, and for each row also work out the total with GST (SELECT)". The clerk writes a new sheet; the register itself is untouched.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>SELECT expr [AS alias], … FROM table</code> returns one output row per input row, with one column per expression. An <strong>expression</strong> combines columns, constants, operators and functions. An <strong>alias</strong> names an output column (or a table).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Integer ÷ integer truncates in PostgreSQL and SQLite: 32 / 60 = 0, and every "rate" built from two counts (7 delivered / 10 orders = 0) is wrong. Cast one side (<code>::numeric</code>) or multiply by <code>1.0</code> first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: WHERE.</b> Every query so far returns all ten orders. "Delivered orders only", "orders above ₹300", "orders on 5 March" need a way to keep only some rows.</div>

  <h2 id="sf-where"><span class="num">02</span>Filtering with WHERE</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>SELECT decides the columns but not the rows. How do we say "only the delivered orders", or "only orders between ₹260 and ₹380"?</p>
  </div>
  <p><code>WHERE</code> adds a condition: the database checks it for each row and keeps only rows where it is <strong>TRUE</strong>.</p>
  <div class="fx" data-lang="sql">SELECT order_id, status, amount FROM orders WHERE status = 'delivered';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>status</th><th>amount</th></tr><tr><td>101</td><td>delivered</td><td>240.00</td></tr><tr><td>102</td><td>delivered</td><td>450.00</td></tr><tr><td>103</td><td>delivered</td><td>520.00</td></tr><tr><td>104</td><td>delivered</td><td>380.00</td></tr><tr><td>106</td><td>delivered</td><td>180.00</td></tr><tr><td>108</td><td>delivered</td><td>260.00</td></tr><tr><td>109</td><td>delivered</td><td>600.00</td></tr></table>
  <p>Seven of the ten orders survive; 105 and 107 (cancelled) and 110 (pending) are dropped. Combine conditions with <code>AND</code>, <code>OR</code>, <code>NOT</code>, and use brackets when mixing them, because <code>AND</code> binds tighter than <code>OR</code>. The question "delivered or pending orders above ₹300", written without brackets:</p>
  <div class="fx" data-lang="sql">SELECT order_id, status, amount FROM orders
WHERE status = 'delivered' OR status = 'pending' AND amount &gt; 300;
SELECT order_id, status, amount FROM orders
WHERE (status = 'delivered' OR status = 'pending') AND amount &gt; 300;</div>
  <table class="tbl out"><caption>Without brackets</caption><tr><th>order_id</th><th>status</th><th>amount</th></tr><tr><td>101</td><td>delivered</td><td>240.00</td></tr><tr><td>102</td><td>delivered</td><td>450.00</td></tr><tr><td>103</td><td>delivered</td><td>520.00</td></tr><tr><td>104</td><td>delivered</td><td>380.00</td></tr><tr><td>106</td><td>delivered</td><td>180.00</td></tr><tr><td>108</td><td>delivered</td><td>260.00</td></tr><tr><td>109</td><td>delivered</td><td>600.00</td></tr><tr><td>110</td><td>pending</td><td>310.00</td></tr></table>
  <table class="tbl out"><caption>With brackets</caption><tr><th>order_id</th><th>status</th><th>amount</th></tr><tr><td>102</td><td>delivered</td><td>450.00</td></tr><tr><td>103</td><td>delivered</td><td>520.00</td></tr><tr><td>104</td><td>delivered</td><td>380.00</td></tr><tr><td>109</td><td>delivered</td><td>600.00</td></tr><tr><td>110</td><td>pending</td><td>310.00</td></tr></table>
  <p>Without brackets SQL read it as <code>delivered OR (pending AND amount &gt; 300)</code>: all seven delivered orders, including 101 (₹240), 106 (₹180) and 108 (₹260), plus 110. With brackets, only the five orders above ₹300. No error, just a wrong answer.</p>
  <table class="tbl">
    <tr><th>Operator</th><th>Example</th><th>Meaning</th></tr>
    <tr><td><code>=</code>, <code>&lt;&gt;</code>, <code>&lt;</code>, <code>&gt;=</code></td><td><code>amount &lt;&gt; 310</code></td><td>Compare (<code>!=</code> also works)</td></tr>
    <tr><td><code>IN</code></td><td><code>status IN ('pending','cancelled')</code></td><td>Shorthand for several <code>OR</code>s</td></tr>
    <tr><td><code>BETWEEN</code></td><td><code>amount BETWEEN 260 AND 380</code></td><td>Inclusive at <em>both</em> ends</td></tr>
    <tr><td><code>LIKE</code></td><td><code>item LIKE '%Biryani'</code></td><td>Pattern: <code>%</code> = any run of characters, <code>_</code> = exactly one</td></tr>
    <tr><td><code>ILIKE</code></td><td><code>item ILIKE '%biryani%'</code></td><td>Case-insensitive LIKE (PostgreSQL only)</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT order_id, amount FROM orders WHERE amount BETWEEN 260 AND 380;
SELECT order_id, item FROM order_items WHERE item LIKE '%Biryani';</div>
  <table class="tbl out"><caption>BETWEEN 260 AND 380</caption><tr><th>order_id</th><th>amount</th></tr><tr><td>104</td><td>380.00</td></tr><tr><td>105</td><td>310.00</td></tr><tr><td>107</td><td>260.00</td></tr><tr><td>108</td><td>260.00</td></tr><tr><td>110</td><td>310.00</td></tr></table>
  <table class="tbl out"><caption>LIKE '%Biryani'</caption><tr><th>order_id</th><th>item</th></tr><tr><td>102</td><td>Chicken Biryani</td></tr><tr><td>106</td><td>Veg Biryani</td></tr><tr><td>109</td><td>Chicken Biryani</td></tr></table>
  <p>BETWEEN kept both edges: 380 (order 104) and both 260s (107, 108). LIKE matched the two biryanis in three order lines.</p>
  <h3>The timestamp BETWEEN trap</h3>
  <p><code>ordered_at</code> is a timestamp (date plus time). "Orders from 5 to 8 March":</p>
  <div class="fx" data-lang="sql">SELECT order_id, ordered_at FROM orders
WHERE ordered_at BETWEEN '2026-03-05' AND '2026-03-08';
SELECT order_id, ordered_at FROM orders
WHERE ordered_at &gt;= '2026-03-05' AND ordered_at &lt; '2026-03-09';</div>
  <table class="tbl out"><caption>BETWEEN '2026-03-05' AND '2026-03-08'</caption><tr><th>order_id</th><th>ordered_at</th></tr><tr><td>108</td><td>2026-03-05 18:20:00+05:30</td></tr><tr><td>109</td><td>2026-03-05 20:05:00+05:30</td></tr></table>
  <table class="tbl out"><caption>Half-open: &gt;= '2026-03-05' AND &lt; '2026-03-09'</caption><tr><th>order_id</th><th>ordered_at</th></tr><tr><td>108</td><td>2026-03-05 18:20:00+05:30</td></tr><tr><td>109</td><td>2026-03-05 20:05:00+05:30</td></tr><tr><td>110</td><td>2026-03-08 20:50:00+05:30</td></tr></table>
  <p>Order 110 (8 March, 20:50) is missing from the first result: <code>'2026-03-08'</code> means midnight at the <em>start</em> of the 8th, so BETWEEN stops there. The half-open range includes the start and stops <em>before</em> the next day, so the whole of 8 March is in.</p>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <line x1="40" y1="50" x2="570" y2="50" stroke="currentColor"/>
    <g stroke="currentColor"><line x1="60" y1="44" x2="60" y2="56"/><line x1="440" y1="44" x2="440" y2="56"/><line x1="520" y1="44" x2="520" y2="56"/></g>
    <g font-size="10" text-anchor="middle" class="tm"><text x="60" y="38">Mar 5 00:00</text><text x="425" y="38">Mar 8 00:00</text><text x="530" y="38">Mar 9 00:00</text></g>
    <circle cx="495" cy="50" r="6" class="fr sr"/><text x="475" y="16" text-anchor="middle" font-size="10" class="tr">order 110 at Mar 8 20:50</text>
    <rect x="60" y="66" width="380" height="24" rx="4" class="fr sr"/><text x="70" y="82" font-size="10">BETWEEN '2026-03-05' AND '2026-03-08'</text>
    <text x="450" y="82" font-size="10" class="tr">✗ misses it</text>
    <rect x="60" y="100" width="460" height="24" rx="4" class="fg sg"/><text x="70" y="116" font-size="10">ts &gt;= '2026-03-05' AND ts &lt; '2026-03-09'</text>
    <text x="528" y="116" font-size="10" class="tg">✓</text>
  </svg><figcaption>On timestamps, '2026-03-08' means midnight at the start of the 8th, so BETWEEN loses almost the whole last day.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bouncer with a guest list. Each person (row) is checked against the rule; only a clear "yes" gets in. "Maybe" (which you'll meet in section 07) does not get in either.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>WHERE condition</code> keeps the rows for which the condition evaluates to TRUE. Precedence: <code>NOT</code> binds tightest, then <code>AND</code>, then <code>OR</code>. <code>x BETWEEN a AND b</code> means <code>x &gt;= a AND x &lt;= b</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Two silent traps in one section: mixing AND and OR without brackets (8 rows instead of 5), and BETWEEN on timestamps (order 110 lost). Both return plausible-looking results with no error. Bracket every mix, and use half-open ranges for time.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the logical execution order.</b> Try to filter on the alias you just made, <code>WHERE with_gst &gt; 500</code>, and PostgreSQL says the column does not exist, even though it's right there in SELECT. To understand why, we need the order in which a query is really evaluated.</div>

  <h2 id="sf-exec"><span class="num">03</span>Logical Execution Order</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You write <code>SELECT</code> first, but is it done first? If WHERE can't see a SELECT alias while ORDER BY can, the database must be evaluating the clauses in some other order. Which?</p>
  </div>
  <p>The database <em>evaluates</em> the clauses in this order, whatever order you write them in. GROUP BY and HAVING are the next sections; for now they are empty slots:</p>
  <figure class="viz"><svg viewBox="0 0 600 205" width="600">
    <text x="38" y="20" text-anchor="middle" font-size="10" class="tm">1</text><rect x="5" y="26" width="66" height="34" rx="6" class="fb"/><text x="38" y="47" text-anchor="middle" font-size="10" font-weight="bold">FROM</text><line x1="71" y1="43" x2="79" y2="43" stroke="currentColor"/><text x="112" y="20" text-anchor="middle" font-size="10" class="tm">2</text><rect x="79" y="26" width="66" height="34" rx="6" class="fb"/><text x="112" y="47" text-anchor="middle" font-size="10" font-weight="bold">WHERE</text><line x1="145" y1="43" x2="153" y2="43" stroke="currentColor"/><text x="186" y="20" text-anchor="middle" font-size="10" class="tm">3</text><rect x="153" y="26" width="66" height="34" rx="6" class="ft"/><text x="186" y="47" text-anchor="middle" font-size="10" font-weight="bold">GROUP BY</text><line x1="219" y1="43" x2="227" y2="43" stroke="currentColor"/><text x="260" y="20" text-anchor="middle" font-size="10" class="tm">4</text><rect x="227" y="26" width="66" height="34" rx="6" class="ft"/><text x="260" y="47" text-anchor="middle" font-size="10" font-weight="bold">HAVING</text><line x1="293" y1="43" x2="301" y2="43" stroke="currentColor"/><text x="334" y="20" text-anchor="middle" font-size="10" class="tm">5</text><rect x="301" y="26" width="66" height="34" rx="6" class="fg"/><text x="334" y="47" text-anchor="middle" font-size="10" font-weight="bold">SELECT</text><line x1="367" y1="43" x2="375" y2="43" stroke="currentColor"/><text x="408" y="20" text-anchor="middle" font-size="10" class="tm">6</text><rect x="375" y="26" width="66" height="34" rx="6" class="fs"/><text x="408" y="47" text-anchor="middle" font-size="10" font-weight="bold">DISTINCT</text><line x1="441" y1="43" x2="449" y2="43" stroke="currentColor"/><text x="482" y="20" text-anchor="middle" font-size="10" class="tm">7</text><rect x="449" y="26" width="66" height="34" rx="6" class="fs"/><text x="482" y="47" text-anchor="middle" font-size="10" font-weight="bold">ORDER BY</text><line x1="515" y1="43" x2="523" y2="43" stroke="currentColor"/><text x="556" y="20" text-anchor="middle" font-size="10" class="tm">8</text><rect x="523" y="26" width="66" height="34" rx="6" class="fs"/><text x="556" y="47" text-anchor="middle" font-size="10" font-weight="bold">LIMIT</text>
    <rect x="5" y="80" width="140" height="24" rx="5" class="fb sb"/><text x="13" y="96" font-size="10">raw rows only</text>
    <rect x="153" y="112" width="436" height="24" rx="5" class="ft st"/><text x="161" y="128" font-size="10">groups + aggregates exist: HAVING, SELECT, ORDER BY can use them</text>
    <rect x="301" y="144" width="288" height="24" rx="5" class="fg sg"/><text x="309" y="160" font-size="10">SELECT aliases exist: ORDER BY can use</text>
    <text x="5" y="192" font-size="11" class="tr">✗ WHERE with_gst &gt; 500 · ✗ WHERE COUNT(*) &gt; 1</text>
    <text x="589" y="192" font-size="11" text-anchor="end" class="tg">✓ ORDER BY with_gst</text>
  </svg><figcaption>Each bar shows what exists from that step onward. WHERE runs at step 2, before groups or aliases are born.</figcaption></figure>
  <h3>Tracing one query step by step</h3>
  <p>Question: "the two biggest delivered orders, with GST". The query, and then what exists after each step:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount, amount * 1.05 AS with_gst
FROM orders
WHERE status = 'delivered'
ORDER BY with_gst DESC
LIMIT 2;</div>
  <table class="tbl out"><caption>Final result</caption><tr><th>order_id</th><th>amount</th><th>with_gst</th></tr><tr><td>109</td><td>600.00</td><td>630.0000</td></tr><tr><td>103</td><td>520.00</td><td>546.0000</td></tr></table>
  <p>To see the intermediate tables, run each prefix of the pipeline on its own:</p>
  <div class="fx" data-lang="sql">SELECT order_id, status, amount FROM orders WHERE status = 'delivered';
SELECT order_id, amount, amount * 1.05 AS with_gst FROM orders WHERE status = 'delivered';
SELECT order_id, amount, amount * 1.05 AS with_gst FROM orders WHERE status = 'delivered' ORDER BY with_gst DESC;</div>
  <table class="tbl out"><caption>Steps 1–2: FROM orders, WHERE status = 'delivered' (7 of 10 rows)</caption><tr><th>order_id</th><th>status</th><th>amount</th></tr><tr><td>101</td><td>delivered</td><td>240.00</td></tr><tr><td>102</td><td>delivered</td><td>450.00</td></tr><tr><td>103</td><td>delivered</td><td>520.00</td></tr><tr><td>104</td><td>delivered</td><td>380.00</td></tr><tr><td>106</td><td>delivered</td><td>180.00</td></tr><tr><td>108</td><td>delivered</td><td>260.00</td></tr><tr><td>109</td><td>delivered</td><td>600.00</td></tr></table>
  <table class="tbl out"><caption>Step 5: SELECT computes with_gst for each surviving row</caption><tr><th>order_id</th><th>amount</th><th>with_gst</th></tr><tr><td>101</td><td>240.00</td><td>252.0000</td></tr><tr><td>102</td><td>450.00</td><td>472.5000</td></tr><tr><td>103</td><td>520.00</td><td>546.0000</td></tr><tr><td>104</td><td>380.00</td><td>399.0000</td></tr><tr><td>106</td><td>180.00</td><td>189.0000</td></tr><tr><td>108</td><td>260.00</td><td>273.0000</td></tr><tr><td>109</td><td>600.00</td><td>630.0000</td></tr></table>
  <table class="tbl out"><caption>Step 7: ORDER BY with_gst DESC</caption><tr><th>order_id</th><th>amount</th><th>with_gst</th></tr><tr><td>109</td><td>600.00</td><td>630.0000</td></tr><tr><td>103</td><td>520.00</td><td>546.0000</td></tr><tr><td>102</td><td>450.00</td><td>472.5000</td></tr><tr><td>104</td><td>380.00</td><td>399.0000</td></tr><tr><td>108</td><td>260.00</td><td>273.0000</td></tr><tr><td>101</td><td>240.00</td><td>252.0000</td></tr><tr><td>106</td><td>180.00</td><td>189.0000</td></tr></table>
  <p>Step 8, <code>LIMIT 2</code>, keeps the first two rows of the sorted table: 109 and 103, the final result above. LIMIT comes last, after sorting, which is exactly why "top N" is well defined. Now the two classic errors make sense. The alias <code>with_gst</code> is born at step 5; WHERE runs at step 2:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount * 1.05 AS with_gst FROM orders WHERE with_gst &gt; 500;
SELECT order_id, amount * 1.05 AS with_gst FROM orders ORDER BY with_gst DESC LIMIT 1;</div>
  <div class="fx" data-lang="text">ERROR:  column "with_gst" does not exist</div>
  <table class="tbl out"><caption>ORDER BY can use the alias</caption><tr><th>order_id</th><th>with_gst</th></tr><tr><td>109</td><td>630.0000</td></tr></table>
  <p>The fix for the first: repeat the expression (<code>WHERE amount * 1.05 &gt; 500</code>) or wrap the query in a subquery or CTE so the alias exists before the outer WHERE runs.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cooking: fetch (FROM), discard bad (WHERE), sort into bowls (GROUP BY), drop small bowls (HAVING), plate and name the dish (SELECT), remove duplicate plates (DISTINCT), arrange (ORDER BY), serve a few (LIMIT). You can't refer to a dish by its name before it's plated.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>logical query processing order</strong> is FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET. Each step receives the table produced by the previous one. A name defined at one step is visible only to later steps.</p>
  </div>
  <div class="callout intu"><span class="label">Logical, not physical</span>
    <p>This is the order of <em>meaning</em>. The planner may physically push filters earlier or use an index (see <a class="xref" data-note="db_intro">What is a Database</a>), but the result must match this order. PostgreSQL also allows an output alias in GROUP BY as a convenience; WHERE and HAVING still reject it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"SELECT is written first, so it runs first." It runs fifth. Whenever a name "does not exist", ask: at which step was it created, and at which step am I using it?</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: aggregates.</b> Every query so far returns rows. The questions the business actually asks ("how many orders?", "total revenue?") want a single number from many rows.</div>

  <h2 id="sf-agg"><span class="num">04</span>Aggregates</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"How many orders did Biteful take, and how much money?" The answer is not a row of the table; it is one number computed from all the rows. How does SQL squash many rows into one?</p>
  </div>
  <p>An <strong>aggregate</strong> function takes a whole column of values and returns one value: <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>.</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS orders, SUM(amount) AS total, AVG(amount) AS average,
       MIN(amount) AS smallest, MAX(amount) AS largest
FROM orders;
SELECT COUNT(*) AS orders, SUM(amount) AS total, ROUND(AVG(amount), 2) AS average,
       MIN(amount) AS smallest, MAX(amount) AS largest
FROM orders
WHERE status = 'delivered';</div>
  <table class="tbl out"><caption>All orders</caption><tr><th>orders</th><th>total</th><th>average</th><th>smallest</th><th>largest</th></tr><tr><td>10</td><td>3510.00</td><td>351.0000000000000000</td><td>180.00</td><td>600.00</td></tr></table>
  <table class="tbl out"><caption>Delivered orders only</caption><tr><th>orders</th><th>total</th><th>average</th><th>smallest</th><th>largest</th></tr><tr><td>7</td><td>2630.00</td><td>375.71</td><td>180.00</td><td>600.00</td></tr></table>
  <p>By hand: 240 + 450 + 520 + 380 + 310 + 180 + 260 + 260 + 600 + 310 = 3,510 over 10 orders, average 351. With the WHERE, the three non-delivered orders (310, 260, 310 = 880) are removed first: 3,510 − 880 = 2,630 over 7, average 375.71. Notice the order from section 03: WHERE (step 2) filters rows <em>before</em> the aggregate (computed with the groups at step 3) ever sees them. <code>ROUND(x, 2)</code> keeps two decimals.</p>
  <p>What if you also want to see which restaurant each total belongs to?</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, SUM(amount) FROM orders;</div>
  <div class="fx" data-lang="text">ERROR:  column "orders.restaurant_id" must appear in the GROUP BY clause or be used in an aggregate function</div>
  <p>Ten rows went in and one number came out; there is no single <code>restaurant_id</code> to show next to it. SQL refuses rather than guess.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper at closing time adds up every bill in the drawer: number of bills, total cash, smallest and biggest bill. The answer is about the whole drawer, so "which customer?" makes no sense next to it.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>aggregate function</strong> maps a set of rows to one value. <code>COUNT(*)</code> counts rows; <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code> work on a column's values. Without GROUP BY, the whole (filtered) table is one group and the result is one row.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing a plain column with an aggregate without GROUP BY is an error in PostgreSQL. (MySQL's old loose mode returned an arbitrary value instead, silently.) Either aggregate everything or group by the plain column, which is the next section.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: GROUP BY.</b> One number for the whole table is rarely the question. The business wants revenue <em>per restaurant</em>, orders <em>per day</em>: one summary line per group.</div>

  <h2 id="sf-group"><span class="num">05</span>GROUP BY</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Delivered revenue per restaurant." The aggregate must be computed separately for each restaurant and labelled with the restaurant. How do we tell SQL to split the rows first?</p>
  </div>
  <p><code>GROUP BY</code> sorts the rows into piles, one pile per distinct value of the key, and then every aggregate is computed once per pile. First look at the rows that will be piled, sorted by the key so you can see the piles:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, order_id, amount FROM orders
WHERE status = 'delivered'
ORDER BY restaurant_id, order_id;</div>
  <table class="tbl out"><caption>Input after WHERE, sorted by restaurant_id to show the piles</caption><tr><th>restaurant_id</th><th>order_id</th><th>amount</th></tr><tr><td>10</td><td>101</td><td>240.00</td></tr><tr><td>10</td><td>108</td><td>260.00</td></tr><tr><td>11</td><td>102</td><td>450.00</td></tr><tr><td>11</td><td>106</td><td>180.00</td></tr><tr><td>11</td><td>109</td><td>600.00</td></tr><tr><td>12</td><td>103</td><td>520.00</td></tr><tr><td>12</td><td>104</td><td>380.00</td></tr></table>
  <p>By hand: pile 10 = 240 + 260 = 500 (2 orders); pile 11 = 450 + 180 + 600 = 1,230 (3 orders); pile 12 = 520 + 380 = 900 (2 orders). Now let SQL do it:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, COUNT(*) AS orders, SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant_id</th><th>orders</th><th>revenue</th></tr><tr><td>10</td><td>2</td><td>500.00</td></tr><tr><td>11</td><td>3</td><td>1230.00</td></tr><tr><td>12</td><td>2</td><td>900.00</td></tr></table>
  <p>Seven rows in, three rows out, matching the hand calculation. Green Bowl (13) has no row: its only order was cancelled and removed by WHERE before piling, so its pile never existed. Momo Magic (14) has no orders at all. (Showing restaurants with zero needs a JOIN: <a class="xref" data-note="sql_joins">JOINs</a>.)</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="sf-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="70" y="14" text-anchor="middle" font-weight="bold">delivered rows</text>
    <rect x="15" y="22" width="110" height="18" rx="3" class="fb"/><text x="22" y="35">101 · r10 · 240</text>
    <rect x="15" y="42" width="110" height="18" rx="3" class="fb"/><text x="22" y="55">108 · r10 · 260</text>
    <rect x="15" y="62" width="110" height="18" rx="3" class="fv"/><text x="22" y="75">102 · r11 · 450</text>
    <rect x="15" y="82" width="110" height="18" rx="3" class="fv"/><text x="22" y="95">106 · r11 · 180</text>
    <rect x="15" y="102" width="110" height="18" rx="3" class="fv"/><text x="22" y="115">109 · r11 · 600</text>
    <rect x="15" y="122" width="110" height="18" rx="3" class="ft"/><text x="22" y="135">103 · r12 · 520</text>
    <rect x="15" y="142" width="110" height="18" rx="3" class="ft"/><text x="22" y="155">104 · r12 · 380</text>
    <g stroke="currentColor" marker-end="url(#sf-ar2)"><line x1="130" y1="41" x2="228" y2="41"/><line x1="130" y1="91" x2="228" y2="91"/><line x1="130" y1="141" x2="228" y2="141"/><line x1="370" y1="41" x2="428" y2="41"/><line x1="370" y1="91" x2="428" y2="91"/><line x1="370" y1="141" x2="428" y2="141"/></g>
    <text x="300" y="14" text-anchor="middle" font-weight="bold">GROUP BY restaurant_id</text>
    <rect x="230" y="26" width="140" height="30" rx="6" class="fb sb"/><text x="300" y="45" text-anchor="middle">pile 10: 240, 260</text>
    <rect x="230" y="76" width="140" height="30" rx="6" class="fv"/><text x="300" y="95" text-anchor="middle">pile 11: 450, 180, 600</text>
    <rect x="230" y="126" width="140" height="30" rx="6" class="ft"/><text x="300" y="145" text-anchor="middle">pile 12: 520, 380</text>
    <text x="510" y="14" text-anchor="middle" font-weight="bold">one row per pile</text>
    <rect x="430" y="28" width="160" height="26" rx="4" class="fg sg"/><text x="510" y="45" text-anchor="middle">10 → 2 orders, 500</text>
    <rect x="430" y="78" width="160" height="26" rx="4" class="fg sg"/><text x="510" y="95" text-anchor="middle">11 → 3 orders, 1230</text>
    <rect x="430" y="128" width="160" height="26" rx="4" class="fg sg"/><text x="510" y="145" text-anchor="middle">12 → 2 orders, 900</text>
    </g>
  </svg><figcaption>GROUP BY makes one pile per key; each aggregate runs once per pile; each pile becomes one output row.</figcaption></figure>
  <h3>Grouping by a computed key: per day</h3>
  <p>"Orders per day" groups by the date part of <code>ordered_at</code>. <code>ordered_at::date</code> (or <code>DATE_TRUNC('day', ordered_at)</code>) turns 2026-03-02 12:10 and 2026-03-02 20:30 into the same key, 2026-03-02:</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, COUNT(*) AS orders, SUM(amount) AS amount
FROM orders
GROUP BY ordered_at::date
ORDER BY day;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>orders</th><th>amount</th></tr><tr><td>2026-03-02</td><td>3</td><td>1210.00</td></tr><tr><td>2026-03-03</td><td>2</td><td>690.00</td></tr><tr><td>2026-03-04</td><td>2</td><td>440.00</td></tr><tr><td>2026-03-05</td><td>2</td><td>860.00</td></tr><tr><td>2026-03-08</td><td>1</td><td>310.00</td></tr></table>
  <p>No orders on 6 and 7 March, so no rows for them: GROUP BY only makes piles for keys that exist. A few more date and text tools that help build keys:</p>
  <table class="tbl">
    <tr><th>Function</th><th>Does</th><th>Example → result</th></tr>
    <tr><td><code>DATE_TRUNC('month', ts)</code></td><td>Round down to period start</td><td>2026-03-05 18:20 → 2026-03-01 00:00</td></tr>
    <tr><td><code>EXTRACT(DOW FROM ts)</code></td><td>Pull out one part (0 = Sunday)</td><td>2026-03-08 → 0 (a Sunday)</td></tr>
    <tr><td><code>ts + INTERVAL '30 minutes'</code></td><td>Date/time arithmetic</td><td>12:10 → 12:40</td></tr>
    <tr><td><code>d2 - d1</code> (dates)</td><td>Days between, as an integer</td><td><code>DATE '2026-03-08' - DATE '2026-03-02'</code> → 6</td></tr>
    <tr><td><code>LOWER</code>, <code>UPPER</code>, <code>TRIM</code>, <code>LENGTH</code></td><td>Clean and measure text</td><td><code>LOWER(TRIM('  PUNE '))</code> → pune</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT EXTRACT(DOW FROM ordered_at) AS dow, TO_CHAR(ordered_at, 'Dy') AS day_name, COUNT(*) AS orders
FROM orders
GROUP BY 1, 2
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>dow</th><th>day_name</th><th>orders</th></tr><tr><td>0</td><td>Sun</td><td>1</td></tr><tr><td>1</td><td>Mon</td><td>3</td></tr><tr><td>2</td><td>Tue</td><td>2</td></tr><tr><td>3</td><td>Wed</td><td>2</td></tr><tr><td>4</td><td>Thu</td><td>2</td></tr></table>
  <p><code>GROUP BY 1, 2</code> means "the first and second SELECT columns". Handy, but fragile if columns are reordered. Monday (1) is the busiest day in this tiny sample.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sorting receipts into one pile per restaurant, then writing one summary line per pile. Anything on that line must be either the pile label (the GROUP BY key) or a summary of the pile (an aggregate).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>GROUP BY k1, k2, …</code> partitions the rows (after WHERE) into groups with equal key values; aggregates are evaluated once per group; the result has one row per group. Every SELECT column must be a grouping key, an aggregate, or a function of those.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>SELECT restaurant_id, order_id, SUM(amount) FROM orders GROUP BY restaurant_id</code> fails: "column orders.order_id must appear in the GROUP BY clause or be used in an aggregate function". Pile 11 has three order ids; SQL won't pick one for you.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: HAVING.</b> We can summarise every pile. But "only restaurants with at least 3 deliveries" or "customers with 2 or more orders" is a condition on a pile's <em>count</em>, which doesn't exist yet when WHERE runs.</div>

  <h2 id="sf-having"><span class="num">06</span>HAVING vs WHERE</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Customers with 2 or more orders that weren't cancelled." Part of that is about single rows (not cancelled) and part about whole piles (2 or more). WHERE can't count, because it runs before the piles exist. Where does a condition on a group go?</p>
  </div>
  <p>Two filters hide in that sentence. "Not cancelled" is about individual rows: throw out 105 and 107 before making piles. "2 or more" is about a whole pile: you can only check it after counting. SQL gives each its own clause. <code>WHERE</code> filters <strong>rows</strong> before grouping. <code>HAVING</code> filters <strong>groups</strong> after aggregation.</p>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600">
    <defs><marker id="sf-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="70" y="14" text-anchor="middle" font-weight="bold">orders</text>
    <rect x="15" y="20" width="110" height="17" rx="3" class="fb"/><text x="22" y="32">101 · c1 · deliv</text>
    <rect x="15" y="39" width="110" height="17" rx="3" class="fb"/><text x="22" y="51">104 · c1 · deliv</text>
    <rect x="15" y="58" width="110" height="17" rx="3" class="fb"/><text x="22" y="70">110 · c1 · pend</text>
    <rect x="15" y="77" width="110" height="17" rx="3" class="fv"/><text x="22" y="89">102 · c2 · deliv</text>
    <rect x="15" y="96" width="110" height="17" rx="3" class="fv"/><text x="22" y="108">106 · c2 · deliv</text>
    <rect x="15" y="115" width="110" height="17" rx="3" class="ft"/><text x="22" y="127">103 · c3 · deliv</text>
    <rect x="15" y="134" width="110" height="17" rx="3" class="ft"/><text x="22" y="146">108 · c3 · deliv</text>
    <rect x="15" y="153" width="110" height="17" rx="3" class="fr sr" stroke-dasharray="3 3"/><text x="22" y="165" class="tm">105 · c4 · cancel</text>
    <rect x="15" y="172" width="110" height="17" rx="3" class="fr sr" stroke-dasharray="3 3"/><text x="22" y="184" class="tm">107 · c5 · cancel</text>
    <rect x="15" y="191" width="110" height="17" rx="3" class="fs"/><text x="22" y="203">109 · c6 · deliv</text>
    <text x="70" y="224" text-anchor="middle" class="tr">WHERE drops 105, 107</text>
    <g stroke="currentColor" marker-end="url(#sf-ar1)"><line x1="130" y1="48" x2="208" y2="45"/><line x1="130" y1="98" x2="208" y2="95"/><line x1="130" y1="136" x2="208" y2="145"/><line x1="130" y1="199" x2="208" y2="195"/><line x1="340" y1="45" x2="418" y2="45"/><line x1="340" y1="95" x2="418" y2="95"/><line x1="340" y1="145" x2="418" y2="145"/></g>
    <text x="275" y="14" text-anchor="middle" font-weight="bold">GROUP BY customer_id</text>
    <rect x="210" y="28" width="130" height="34" rx="6" class="fb sb"/><text x="275" y="49" text-anchor="middle">pile c1: 3 rows</text>
    <rect x="210" y="78" width="130" height="34" rx="6" class="fv"/><text x="275" y="99" text-anchor="middle">pile c2: 2 rows</text>
    <rect x="210" y="128" width="130" height="34" rx="6" class="ft"/><text x="275" y="149" text-anchor="middle">pile c3: 2 rows</text>
    <rect x="210" y="178" width="130" height="34" rx="6" class="fs"/><text x="275" y="199" text-anchor="middle">pile c6: 1 row</text>
    <text x="500" y="14" text-anchor="middle" font-weight="bold">HAVING COUNT(*) &gt;= 2</text>
    <rect x="420" y="32" width="160" height="26" rx="4" class="fg sg"/><text x="500" y="49" text-anchor="middle">c1 → 3</text>
    <rect x="420" y="82" width="160" height="26" rx="4" class="fg sg"/><text x="500" y="99" text-anchor="middle">c2 → 2</text>
    <rect x="420" y="132" width="160" height="26" rx="4" class="fg sg"/><text x="500" y="149" text-anchor="middle">c3 → 2</text>
    <text x="500" y="199" text-anchor="middle" class="tr">c6 (1) dropped by HAVING</text>
    </g>
  </svg><figcaption>WHERE removes rows, GROUP BY makes piles, HAVING keeps or drops whole piles. Dia (c4) and Esha (c5) had only cancelled orders, so they never got a pile.</figcaption></figure>
  <div class="fx" data-lang="sql">SELECT customer_id, COUNT(*) AS live_orders, SUM(amount) AS spent
FROM orders
WHERE status &lt;&gt; 'cancelled'      -- row filter, step 2
GROUP BY customer_id             -- piles, step 3
HAVING COUNT(*) &gt;= 2             -- pile filter, step 4
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>live_orders</th><th>spent</th></tr><tr><td>1</td><td>3</td><td>930.00</td></tr><tr><td>2</td><td>2</td><td>630.00</td></tr><tr><td>3</td><td>2</td><td>780.00</td></tr></table>
  <p>Trace it with the full execution order. FROM: 10 orders. WHERE: drops 105 (Dia) and 107 (Esha), 8 rows left. GROUP BY: piles c1 (101, 104, 110), c2 (102, 106), c3 (103, 108), c6 (109). HAVING: keeps piles with at least 2 rows, so c6 goes. SELECT: computes the count and the sum per pile (Asha 240 + 380 + 310 = 930; Ben 450 + 180 = 630; Chen 520 + 260 = 780). ORDER BY sorts. Try to do the pile filter in WHERE instead:</p>
  <div class="fx" data-lang="sql">SELECT customer_id, COUNT(*) FROM orders WHERE COUNT(*) &gt;= 2 GROUP BY customer_id;</div>
  <div class="fx" data-lang="text">ERROR:  aggregate functions are not allowed in WHERE</div>
  <p>At step 2 there are no piles, so there is nothing to count.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Exam results. WHERE is "ignore absent students' blank sheets" (per sheet, before anything is added up). HAVING is "list only the classes whose average is above 60" (per class, after the averages exist).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>HAVING condition</code> is evaluated after GROUP BY and keeps the groups for which it is TRUE; it may use aggregates. <code>WHERE</code> is evaluated before grouping, on individual rows, and may not use aggregates.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Putting a row condition in HAVING (<code>HAVING status &lt;&gt; 'cancelled'</code>) doesn't even work here, because status isn't a grouping key; when it does work (a condition on a key), it groups rows you will throw away. Row conditions go in WHERE; only conditions on aggregates go in HAVING.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: NULL.</b> Every condition so far was clearly true or false. But Esha's city is missing and four orders have no delivery time. What is <code>NULL &lt;&gt; 'Pune'</code>? What does AVG do with a missing value? The answers surprise everyone once.</div>

  <h2 id="sf-null"><span class="num">07</span>NULL &amp; Three-Valued Logic</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Esha never told us her city; orders 104, 105, 107 and 110 have no delivery time. A comparison with a missing value can't honestly be TRUE or FALSE. What does SQL do, and how does that change WHERE, COUNT and AVG?</p>
  </div>
  <p>What should Esha's <code>city</code> cell hold? Not "Pune", not an empty string (that would mean "her city is called nothing"), not 0. It holds <strong>NULL</strong>, which means "unknown / missing". NULL is not a value; it is the absence of one. "Is Esha's city Pune?" You don't know, so the answer is neither true nor false. SQL calls this third answer <strong>UNKNOWN</strong>. Any comparison with NULL gives UNKNOWN, and WHERE keeps only rows where the condition is TRUE, so UNKNOWN rows are dropped:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE city = NULL;
SELECT name, city FROM customers WHERE city &lt;&gt; 'Pune';
SELECT name FROM customers WHERE city IS NULL;</div>
  <table class="tbl out"><caption>WHERE city = NULL (always 0 rows)</caption><tr><th>name</th></tr></table>
  <table class="tbl out"><caption>WHERE city &lt;&gt; 'Pune' (Esha missing!)</caption><tr><th>name</th><th>city</th></tr><tr><td>Ben</td><td>Mumbai</td></tr><tr><td>Dia</td><td>Mumbai</td></tr><tr><td>Farah</td><td>Mumbai</td></tr></table>
  <table class="tbl out"><caption>WHERE city IS NULL</caption><tr><th>name</th></tr><tr><td>Esha</td></tr></table>
  <p><code>= NULL</code> asks "is it equal to unknown?", which is always UNKNOWN, so it matches nothing, not even Esha. "Not Pune" quietly loses Esha, because <code>NULL &lt;&gt; 'Pune'</code> is UNKNOWN. The only question you can ask of a NULL is "is it missing?" (<code>IS NULL</code>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A sealed envelope. Is Esha's city "Pune"? You can't say yes or no. Is it equal to another sealed envelope? Also unknown. You can only ask "is the envelope sealed?" (<code>IS NULL</code>).</p>
  </div>
  <h3>The tools</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>What it does</th><th>Example</th></tr>
    <tr><td><code>IS NULL</code> / <code>IS NOT NULL</code></td><td>The only correct NULL test</td><td><code>WHERE city IS NULL</code> → Esha</td></tr>
    <tr><td><code>COALESCE(a, b, …)</code></td><td>First non-NULL argument</td><td><code>COALESCE(city, 'unknown')</code></td></tr>
    <tr><td><code>NULLIF(a, b)</code></td><td>NULL if a = b, else a</td><td><code>x / NULLIF(y, 0)</code> avoids divide-by-zero</td></tr>
    <tr><td><code>IS DISTINCT FROM</code></td><td>NULL-safe <code>&lt;&gt;</code>: treats NULL as a value</td><td><code>city IS DISTINCT FROM 'Pune'</code> → includes Esha</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT name, city,
       COALESCE(city, 'unknown')               AS city_or_default,
       city IS DISTINCT FROM 'Pune'            AS not_pune_safe,
       name || ' (' || city || ')'             AS label_pipes,
       CONCAT(name, ' (', city, ')')           AS label_concat
FROM customers
WHERE customer_id IN (4, 5);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>city</th><th>city_or_default</th><th>not_pune_safe</th><th>label_pipes</th><th>label_concat</th></tr><tr><td>Dia</td><td>Mumbai</td><td>Mumbai</td><td>t</td><td>Dia (Mumbai)</td><td>Dia (Mumbai)</td></tr><tr><td>Esha</td><td>NULL</td><td>unknown</td><td>t</td><td>NULL</td><td>Esha ()</td></tr></table>
  <p>For Dia everything is ordinary. For Esha: COALESCE substitutes "unknown", <code>IS DISTINCT FROM</code> gives a definite <code>t</code> (true) instead of UNKNOWN, <code>||</code> with a NULL makes the whole label NULL (NULL spreads through expressions), and <code>CONCAT</code> treats NULL as empty text.</p>
  <h3>The truth table</h3>
  <p>What happens when UNKNOWN meets AND / OR? Think of the sealed envelope. "TRUE AND envelope": the answer depends on the envelope, so UNKNOWN. "FALSE AND envelope": already false whatever is inside, so FALSE. "TRUE OR envelope": already true, so TRUE. The query confirms it (PostgreSQL shows UNKNOWN as NULL):</p>
  <div class="fx" data-lang="sql">SELECT TRUE AND NULL AS t_and_u, FALSE AND NULL AS f_and_u,
       TRUE OR NULL AS t_or_u, FALSE OR NULL AS f_or_u, NOT NULL::boolean AS not_u;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>t_and_u</th><th>f_and_u</th><th>t_or_u</th><th>f_or_u</th><th>not_u</th></tr><tr><td>NULL</td><td>f</td><td>t</td><td>NULL</td><td>NULL</td></tr></table>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <text x="300" y="16" text-anchor="middle" font-size="11" class="tm">T = TRUE, F = FALSE, U = UNKNOWN (NULL)</text>
    <text x="37.0" y="51.0" text-anchor="middle" font-weight="bold">AND</text><text x="71.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">T</text><text x="37.0" y="85.0" text-anchor="middle" font-weight="bold" class="tm">T</text><text x="105.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">F</text><text x="37.0" y="119.0" text-anchor="middle" font-weight="bold" class="tm">F</text><text x="139.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">U</text><text x="37.0" y="153.0" text-anchor="middle" font-weight="bold" class="tm">U</text><rect x="55" y="65" width="32" height="32" rx="4" class="fg"/><text x="71.0" y="85.0" text-anchor="middle">T</text><rect x="89" y="65" width="32" height="32" rx="4" class="fr"/><text x="105.0" y="85.0" text-anchor="middle">F</text><rect x="123" y="65" width="32" height="32" rx="4" class="fs"/><text x="139.0" y="85.0" text-anchor="middle">U</text><rect x="55" y="99" width="32" height="32" rx="4" class="fr"/><text x="71.0" y="119.0" text-anchor="middle">F</text><rect x="89" y="99" width="32" height="32" rx="4" class="fr"/><text x="105.0" y="119.0" text-anchor="middle">F</text><rect x="123" y="99" width="32" height="32" rx="4" class="fr"/><text x="139.0" y="119.0" text-anchor="middle">F</text><rect x="55" y="133" width="32" height="32" rx="4" class="fs"/><text x="71.0" y="153.0" text-anchor="middle">U</text><rect x="89" y="133" width="32" height="32" rx="4" class="fr"/><text x="105.0" y="153.0" text-anchor="middle">F</text><rect x="123" y="133" width="32" height="32" rx="4" class="fs"/><text x="139.0" y="153.0" text-anchor="middle">U</text><text x="237.0" y="51.0" text-anchor="middle" font-weight="bold">OR</text><text x="271.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">T</text><text x="237.0" y="85.0" text-anchor="middle" font-weight="bold" class="tm">T</text><text x="305.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">F</text><text x="237.0" y="119.0" text-anchor="middle" font-weight="bold" class="tm">F</text><text x="339.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">U</text><text x="237.0" y="153.0" text-anchor="middle" font-weight="bold" class="tm">U</text><rect x="255" y="65" width="32" height="32" rx="4" class="fg"/><text x="271.0" y="85.0" text-anchor="middle">T</text><rect x="289" y="65" width="32" height="32" rx="4" class="fg"/><text x="305.0" y="85.0" text-anchor="middle">T</text><rect x="323" y="65" width="32" height="32" rx="4" class="fg"/><text x="339.0" y="85.0" text-anchor="middle">T</text><rect x="255" y="99" width="32" height="32" rx="4" class="fg"/><text x="271.0" y="119.0" text-anchor="middle">T</text><rect x="289" y="99" width="32" height="32" rx="4" class="fr"/><text x="305.0" y="119.0" text-anchor="middle">F</text><rect x="323" y="99" width="32" height="32" rx="4" class="fs"/><text x="339.0" y="119.0" text-anchor="middle">U</text><rect x="255" y="133" width="32" height="32" rx="4" class="fg"/><text x="271.0" y="153.0" text-anchor="middle">T</text><rect x="289" y="133" width="32" height="32" rx="4" class="fs"/><text x="305.0" y="153.0" text-anchor="middle">U</text><rect x="323" y="133" width="32" height="32" rx="4" class="fs"/><text x="339.0" y="153.0" text-anchor="middle">U</text><text x="457.0" y="51.0" text-anchor="middle" font-weight="bold" class="tm">x</text><text x="491.0" y="51.0" text-anchor="middle" font-weight="bold">NOT</text><text x="457.0" y="85.0" text-anchor="middle" font-weight="bold" class="tm">T</text><rect x="475" y="65" width="32" height="32" rx="4" class="fr"/><text x="491.0" y="85.0" text-anchor="middle">F</text><text x="457.0" y="119.0" text-anchor="middle" font-weight="bold" class="tm">F</text><rect x="475" y="99" width="32" height="32" rx="4" class="fg"/><text x="491.0" y="119.0" text-anchor="middle">T</text><text x="457.0" y="153.0" text-anchor="middle" font-weight="bold" class="tm">U</text><rect x="475" y="133" width="32" height="32" rx="4" class="fs"/><text x="491.0" y="153.0" text-anchor="middle">U</text>
  </svg><figcaption>Green = TRUE, red = FALSE, grey = UNKNOWN. Only a known side that already decides the answer escapes UNKNOWN.</figcaption></figure>
  <p>Rule: FALSE AND anything = FALSE; TRUE OR anything = TRUE; otherwise UNKNOWN. So <code>city = 'Pune' OR city &lt;&gt; 'Pune'</code>, which sounds like "everyone", is UNKNOWN OR UNKNOWN = UNKNOWN for Esha.</p>
  <h3>NULL inside aggregates: COUNT(*) vs COUNT(col)</h3>
  <p>COUNT looks like one function but answers three different questions depending on what is in the brackets, and every aggregate except <code>COUNT(*)</code> skips NULLs:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS all_rows, COUNT(city) AS with_city, COUNT(DISTINCT city) AS cities
FROM customers;
SELECT COUNT(*) AS orders, COUNT(delivery_minutes) AS timed, SUM(delivery_minutes) AS total_min,
       ROUND(AVG(delivery_minutes), 2) AS avg_min,
       ROUND(SUM(delivery_minutes)::numeric / COUNT(*), 2) AS sum_over_all_rows,
       ROUND(AVG(COALESCE(delivery_minutes, 0)), 2) AS avg_null_as_zero
FROM orders;</div>
  <table class="tbl out"><caption>customers: rows, known cities, distinct cities</caption><tr><th>all_rows</th><th>with_city</th><th>cities</th></tr><tr><td>7</td><td>6</td><td>2</td></tr></table>
  <table class="tbl out"><caption>orders: the four missing delivery times</caption><tr><th>orders</th><th>timed</th><th>total_min</th><th>avg_min</th><th>sum_over_all_rows</th><th>avg_null_as_zero</th></tr><tr><td>10</td><td>6</td><td>217</td><td>36.17</td><td>21.70</td><td>21.70</td></tr></table>
  <p>Customers: 7 rows, 6 known cities (Esha skipped), 2 distinct values (Mumbai, Pune). Orders: 10 rows but only 6 delivery times: 32 + 41 + 38 + 25 + 29 + 52 = 217. <code>AVG</code> divides by the 6 known values: 217 / 6 = 36.17 minutes. Dividing by all 10 rows, or turning NULL into 0, gives 21.70, which pretends four orders were delivered instantly. Which is right is a business question, but you must choose on purpose.</p>
  <h3>Aggregates over zero rows</h3>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS orders, SUM(amount) AS revenue, AVG(amount) AS avg_amount,
       COALESCE(SUM(amount), 0) AS revenue_or_zero
FROM orders
WHERE restaurant_id = 14;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>orders</th><th>revenue</th><th>avg_amount</th><th>revenue_or_zero</th></tr><tr><td>0</td><td>NULL</td><td>NULL</td><td>0</td></tr></table>
  <p>Momo Magic has no orders. COUNT of nothing is 0, but SUM and AVG of nothing are NULL ("no data"), not 0. Wrap in <code>COALESCE</code> when a report needs 0.</p>
  <h3>Preview: the NOT IN trap</h3>
  <p>"Customers who never referred anyone": take every customer whose id is not in the list of <code>referred_by</code> values. That list contains 1, 1, 2 and four NULLs:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);
SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers WHERE referred_by IS NOT NULL);</div>
  <table class="tbl out"><caption>NOT IN with NULLs in the list</caption><tr><th>name</th></tr></table>
  <table class="tbl out"><caption>NULLs removed from the list</caption><tr><th>name</th></tr><tr><td>Chen</td></tr><tr><td>Dia</td></tr><tr><td>Esha</td></tr><tr><td>Farah</td></tr><tr><td>Gita</td></tr></table>
  <p>Zero rows! For Chen, <code>3 NOT IN (1, 1, 2, NULL, …)</code> means <code>3 &lt;&gt; 1 AND 3 &lt;&gt; 2 AND 3 &lt;&gt; NULL …</code> = TRUE AND TRUE AND UNKNOWN = UNKNOWN, so nobody is ever TRUE. Remove the NULLs and the five expected customers appear. The safe pattern, <code>NOT EXISTS</code>, is in <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>NULL</strong> marks a missing or unknown value. SQL uses <strong>three-valued logic</strong>: TRUE, FALSE, UNKNOWN; any ordinary comparison with NULL is UNKNOWN; WHERE, HAVING and JOIN ON keep only TRUE. Aggregates ignore NULL inputs (except <code>COUNT(*)</code>), and SUM/AVG/MIN/MAX of no values is NULL.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Three silent ones: <code>&lt;&gt;</code> drops NULL rows (Esha), <code>NOT IN</code> over a list containing NULL returns nothing, and <code>AVG</code> silently uses a smaller denominator (6 not 10). None raises an error.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: CASE.</b> We can filter and count, but we can't yet <em>label</em> rows ("top / good / new restaurant") or count several conditions side by side ("delivered, cancelled and pending per restaurant") in one query.</div>

  <h2 id="sf-case"><span class="num">08</span>CASE &amp; Conditional Aggregation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The ops team wants a cancellation rate per restaurant. That needs "count the cancelled ones" and "count all of them" in the same row, per restaurant. WHERE can only keep one kind of row at a time. How do we count conditions side by side?</p>
  </div>
  <p>A marksheet shows marks, but the report says "Grade A / B / C". Someone had to apply a rule. <code>CASE</code> is that rule in SQL, its if/else. It checks the <code>WHEN</code> conditions top to bottom and returns the first one that matches; no match and no <code>ELSE</code> gives NULL. Restaurant bands:</p>
  <div class="fx" data-lang="sql">SELECT name, rating,
  CASE WHEN rating &gt;= 4.4 THEN 'top'
       WHEN rating &gt;= 4.0 THEN 'good'
       ELSE 'needs work' END AS band
FROM restaurants;
SELECT name, rating,
  CASE WHEN rating IS NULL THEN 'new'
       WHEN rating &gt;= 4.4 THEN 'top'
       WHEN rating &gt;= 4.0 THEN 'good'
       ELSE 'needs work' END AS band
FROM restaurants;</div>
  <table class="tbl out"><caption>Naive CASE</caption><tr><th>name</th><th>rating</th><th>band</th></tr><tr><td>Dosa Hut</td><td>4.5</td><td>top</td></tr><tr><td>Biryani Bros</td><td>4.2</td><td>good</td></tr><tr><td>Pizza Point</td><td>3.9</td><td>needs work</td></tr><tr><td>Green Bowl</td><td>4.2</td><td>good</td></tr><tr><td>Momo Magic</td><td>NULL</td><td>needs work</td></tr></table>
  <table class="tbl out"><caption>NULL handled first</caption><tr><th>name</th><th>rating</th><th>band</th></tr><tr><td>Dosa Hut</td><td>4.5</td><td>top</td></tr><tr><td>Biryani Bros</td><td>4.2</td><td>good</td></tr><tr><td>Pizza Point</td><td>3.9</td><td>needs work</td></tr><tr><td>Green Bowl</td><td>4.2</td><td>good</td></tr><tr><td>Momo Magic</td><td>NULL</td><td>new</td></tr></table>
  <p>In the naive version Momo Magic, which simply has no rating yet, is branded "needs work": both comparisons were UNKNOWN (not TRUE), so it fell through to ELSE. Testing <code>IS NULL</code> first fixes it. Order matters too: 4.5 matches the first true branch, "top", and stops.</p>
  <h3>Conditional aggregation</h3>
  <p>Now the trick interviewers love. Put a CASE <em>inside</em> an aggregate: <code>CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END</code> turns each row into a 1 or a 0; <code>SUM</code> of those is the cancelled count; <code>AVG</code> of those 1s and 0s is the fraction cancelled. PostgreSQL's <code>FILTER (WHERE …)</code> is a cleaner way to write the same count. Add GROUP BY and you get one row per restaurant:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id,
       COUNT(*) AS orders,
       COUNT(*) FILTER (WHERE status = 'delivered')         AS delivered,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       ROUND(AVG(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0 END), 2) AS cancel_rate
FROM orders
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant_id</th><th>orders</th><th>delivered</th><th>cancelled</th><th>cancel_rate</th></tr><tr><td>10</td><td>3</td><td>2</td><td>0</td><td>0.00</td></tr><tr><td>11</td><td>3</td><td>3</td><td>0</td><td>0.00</td></tr><tr><td>12</td><td>3</td><td>2</td><td>1</td><td>0.33</td></tr><tr><td>13</td><td>1</td><td>0</td><td>1</td><td>1.00</td></tr></table>
  <p>By hand for Pizza Point (12): orders 103 (delivered), 104 (delivered), 107 (cancelled) → 3 orders, 2 delivered, 1 cancelled; the CASE gives 0, 0, 1, average 1/3 = 0.33. Green Bowl (13): one order, cancelled, rate 1.00. One scan of the table produced all four numbers for every restaurant: this is the "pivot" pattern.</p>
  <p>And here is where the integer-division trap from section 01 returns. Overall delivery rate:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*)          AS wrong,
       COUNT(*) FILTER (WHERE status = 'delivered')::numeric / COUNT(*) AS right_rate,
       ROUND(AVG(CASE WHEN status = 'delivered' THEN 1.0 ELSE 0 END), 2) AS via_avg
FROM orders;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>wrong</th><th>right_rate</th><th>via_avg</th></tr><tr><td>0</td><td>0.70000000000000000000</td><td>0.70</td></tr></table>
  <p>7 / 10 with two integers is 0. Cast one side, or use the AVG-of-CASE pattern with <code>1.0</code>, and you get 0.70.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tally marks on a sheet with several columns. You go through the receipts once, and for each one put a mark in "delivered", "cancelled" or "pending". At the end each column's total is a conditional count, all from one pass.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>CASE WHEN c1 THEN r1 [WHEN c2 THEN r2 …] [ELSE r] END</code> returns the result of the first condition that is TRUE, else the ELSE value, else NULL. <strong>Conditional aggregation</strong> is an aggregate over a CASE expression (or with <code>FILTER (WHERE …)</code>), computing several conditional summaries in one pass.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>CASE conditions are ordinary conditions: a NULL makes them UNKNOWN and the row falls to ELSE (Momo Magic became "needs work"). Handle NULL in its own first branch, and write <code>THEN 1.0</code> (not <code>1</code>) inside AVG for rates.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ORDER BY, DISTINCT, LIMIT.</b> Our results come back in whatever order the database produced them. "Best-rated first", "top 3", "page 2", "which cities appear at all" need sorting, de-duplication and cutting.</div>

  <h2 id="sf-sort"><span class="num">09</span>ORDER BY, DISTINCT, LIMIT</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A table is a bag of rows with no built-in order. "Best-rated restaurant", "the 3 biggest orders", "which cities do customers live in" all depend on order or uniqueness. How do we ask for them, and where do NULLs and ties go?</p>
  </div>
  <p><code>ORDER BY</code> sorts the final rows; <code>ASC</code> (ascending, small to big) is the default, <code>DESC</code> flips it. Without ORDER BY, row order is <strong>not guaranteed</strong>, even if it looks stable today. Restaurants, best first:</p>
  <div class="fx" data-lang="sql">SELECT name, rating FROM restaurants ORDER BY rating DESC;
SELECT name, rating FROM restaurants ORDER BY rating DESC NULLS LAST, name;</div>
  <table class="tbl out"><caption>ORDER BY rating DESC</caption><tr><th>name</th><th>rating</th></tr><tr><td>Momo Magic</td><td>NULL</td></tr><tr><td>Dosa Hut</td><td>4.5</td></tr><tr><td>Biryani Bros</td><td>4.2</td></tr><tr><td>Green Bowl</td><td>4.2</td></tr><tr><td>Pizza Point</td><td>3.9</td></tr></table>
  <table class="tbl out"><caption>ORDER BY rating DESC NULLS LAST, name</caption><tr><th>name</th><th>rating</th></tr><tr><td>Dosa Hut</td><td>4.5</td></tr><tr><td>Biryani Bros</td><td>4.2</td></tr><tr><td>Green Bowl</td><td>4.2</td></tr><tr><td>Pizza Point</td><td>3.9</td></tr><tr><td>Momo Magic</td><td>NULL</td></tr></table>
  <p>In PostgreSQL NULLs sort as if larger than every value: <strong>last in ASC, first in DESC</strong>. So unrated Momo Magic tops the "best-rated" list. <code>NULLS LAST</code> fixes it, and the second key <code>name</code> breaks the 4.2 tie alphabetically (Biryani Bros before Green Bowl).</p>
  <h3>Ties and LIMIT</h3>
  <p><code>LIMIT n</code> keeps the first n rows <em>after</em> sorting, which is how every "top N" question is answered. "The best-rated Mumbai restaurant":</p>
  <div class="fx" data-lang="sql">SELECT name, rating FROM restaurants WHERE city = 'Mumbai' ORDER BY rating DESC LIMIT 1;
SELECT name, rating FROM restaurants WHERE city = 'Mumbai' ORDER BY rating DESC, name LIMIT 1;</div>
  <table class="tbl out"><caption>Ambiguous: LIMIT 1 on a tie</caption><tr><th>name</th><th>rating</th></tr><tr><td>Biryani Bros</td><td>4.2</td></tr></table>
  <table class="tbl out"><caption>Deterministic: tiebreaker added</caption><tr><th>name</th><th>rating</th></tr><tr><td>Biryani Bros</td><td>4.2</td></tr></table>
  <p>Biryani Bros and Green Bowl tie at 4.2, so the first query's answer is whichever row the plan happened to produce first; it may differ on another day or another server. Add a tiebreaker, or, if ties must all be kept, use <code>RANK()</code> (see <a class="xref" data-note="sql_windows">Window Functions</a>).</p>
  <h3>Paging with OFFSET</h3>
  <p><code>OFFSET k</code> skips the first k rows before LIMIT counts. Page 1 of "orders by amount, 3 per page" is <code>LIMIT 3</code>, page 2 is <code>LIMIT 3 OFFSET 3</code>:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount FROM orders ORDER BY amount DESC, order_id LIMIT 3 OFFSET 3;</div>
  <table class="tbl out"><caption>Page 2: rows 4 to 6</caption><tr><th>order_id</th><th>amount</th></tr><tr><td>104</td><td>380.00</td></tr><tr><td>105</td><td>310.00</td></tr><tr><td>110</td><td>310.00</td></tr></table>
  <p>Sorted amounts: 600, 520, 450 | 380, 310, 310 | 260, 260, 240 | 180. Page 2 is 104 (380), then 105 and 110 (both 310, ordered by the tiebreaker <code>order_id</code>). Without the tiebreaker, the two 310s (or the two 260s on page 3) could swap between page loads, and a row could appear on two pages or none.</p>
  <h3>DISTINCT</h3>
  <p>"Which cities do our customers live in?" A plain <code>SELECT city</code> lists Pune three times. <code>DISTINCT</code> removes duplicate rows from the result. It applies to the <em>whole row</em>, not one column, and all NULLs count as one value here:</p>
  <div class="fx" data-lang="sql">SELECT DISTINCT city FROM customers ORDER BY city;
SELECT DISTINCT customer_id, restaurant_id FROM orders ORDER BY 1, 2;</div>
  <table class="tbl out"><caption>DISTINCT city</caption><tr><th>city</th></tr><tr><td>Mumbai</td></tr><tr><td>Pune</td></tr><tr><td>NULL</td></tr></table>
  <table class="tbl out"><caption>DISTINCT on two columns: customer–restaurant pairs</caption><tr><th>customer_id</th><th>restaurant_id</th></tr><tr><td>1</td><td>10</td></tr><tr><td>1</td><td>12</td></tr><tr><td>2</td><td>11</td></tr><tr><td>3</td><td>10</td></tr><tr><td>3</td><td>12</td></tr><tr><td>4</td><td>13</td></tr><tr><td>5</td><td>12</td></tr><tr><td>6</td><td>11</td></tr></table>
  <p>Three values, NULL (Esha) counted once. The second query keeps 8 distinct pairs out of 10 orders: Asha–Dosa Hut (101, 110) and Ben–Biryani Bros (102, 106) each appeared twice.</p>
  <h3>Dialect check: SQLite sorts NULLs the other way</h3>
  <p>Not every engine agrees on NULL order. The same rating sort, run in SQLite (Python's built-in <code>sqlite3</code>):</p>
  <div class="fx" data-lang="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE restaurants (name TEXT, rating REAL)")
con.executemany("INSERT INTO restaurants VALUES (?, ?)",
                [("Dosa Hut", 4.5), ("Biryani Bros", 4.2), ("Pizza Point", 3.9),
                 ("Green Bowl", 4.2), ("Momo Magic", None)])
print("SQLite", sqlite3.sqlite_version)
print("DESC:", con.execute("SELECT name, rating FROM restaurants ORDER BY rating DESC, name").fetchall())
print("DESC NULLS FIRST:", con.execute(
    "SELECT name FROM restaurants ORDER BY rating DESC NULLS FIRST, name").fetchall())
print("7 / 2 =", con.execute("SELECT 7 / 2").fetchone()[0], "  7 / 2.0 =", con.execute("SELECT 7 / 2.0").fetchone()[0])</div>
  <div class="fx" data-lang="text">SQLite 3.45.1
DESC: [('Dosa Hut', 4.5), ('Biryani Bros', 4.2), ('Green Bowl', 4.2), ('Pizza Point', 3.9), ('Momo Magic', None)]
DESC NULLS FIRST: [('Momo Magic',), ('Dosa Hut',), ('Biryani Bros',), ('Green Bowl',), ('Pizza Point',)]
7 / 2 = 3   7 / 2.0 = 3.5</div>
  <p>SQLite treats NULL as <em>smaller</em> than every value, so in DESC it comes last, the opposite of PostgreSQL. Both understand <code>NULLS FIRST / NULLS LAST</code> (SQLite since 3.30), so write it explicitly when NULL position matters. Integer division truncates in both.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A results noticeboard. ORDER BY ranks the students, LIMIT pins up the top three, OFFSET shows the next page, DISTINCT lists each school once. If two students tie, the board must say how ties are broken, or two teachers will pin up different lists.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>ORDER BY e1 [ASC|DESC] [NULLS FIRST|LAST], …</code> sorts the result; <code>DISTINCT</code> removes duplicate result rows (NULLs equal for this purpose); <code>LIMIT n OFFSET k</code> skips k rows and returns at most n. Only ORDER BY gives a guaranteed order, and only a total order (with a unique tiebreaker) gives a deterministic LIMIT.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reaching for DISTINCT to "fix" duplicate rows usually hides a bad join (fan-out: Masala Dosa is in three orders). Find why rows multiplied instead, see <a class="xref" data-note="sql_joins">JOINs</a>. And large OFFSETs are slow: the database still reads and discards all the skipped rows.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: INSERT, UPDATE, DELETE.</b> Everything so far only <em>read</em> data. Biteful also needs to place new orders, mark order 110 delivered and remove bad rows, and the same WHERE that filters a SELECT will decide which rows get changed.</div>

  <h2 id="sf-write"><span class="num">10</span>INSERT, UPDATE, DELETE</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gita places her first order; order 110 is delivered; a test order must be removed. How do we change data, see exactly what changed, and avoid changing the wrong rows?</p>
  </div>
  <p>Three statements change data: <code>INSERT</code> adds rows, <code>UPDATE</code> changes values in existing rows, <code>DELETE</code> removes rows. UPDATE and DELETE take a WHERE just like SELECT, and that WHERE decides which rows are touched. PostgreSQL's <code>RETURNING</code> sends back the affected rows, so you see the change without a second query. (Each example ran on a fresh copy of Biteful.)</p>
  <div class="fx" data-lang="sql">INSERT INTO orders (order_id, customer_id, restaurant_id, ordered_at, status, amount)
VALUES (111, 7, 14, '2026-03-08 21:05+05:30', 'pending', 200)
RETURNING order_id, customer_id, restaurant_id, status, amount, delivery_minutes;
UPDATE orders SET status = 'delivered', delivery_minutes = 35
WHERE order_id = 110
RETURNING order_id, status, delivery_minutes;</div>
  <table class="tbl out"><caption>INSERT … RETURNING</caption><tr><th>order_id</th><th>customer_id</th><th>restaurant_id</th><th>status</th><th>amount</th><th>delivery_minutes</th></tr><tr><td>111</td><td>7</td><td>14</td><td>pending</td><td>200.00</td><td>NULL</td></tr></table>
  <table class="tbl out"><caption>UPDATE … RETURNING</caption><tr><th>order_id</th><th>status</th><th>delivery_minutes</th></tr><tr><td>110</td><td>delivered</td><td>35</td></tr></table>
  <p>The INSERT names its columns explicitly and leaves out <code>delivery_minutes</code>, which therefore becomes NULL. The UPDATE's WHERE matched exactly one row. Now delete Dia's cancelled order 105:</p>
  <div class="fx" data-lang="sql">DELETE FROM orders WHERE order_id = 105;
BEGIN;
DELETE FROM order_items WHERE order_id = 105;
DELETE FROM orders WHERE order_id = 105;
COMMIT;</div>
  <div class="fx" data-lang="text">ERROR:  update or delete on table "orders" violates foreign key constraint "order_items_order_id_fkey" on table "order_items"
DETAIL:  Key (order_id)=(105) is still referenced from table "order_items".
BEGIN
DELETE 1
DELETE 1
COMMIT</div>
  <p>The first DELETE fails: the order's line (Buddha Bowl) in <code>order_items</code> still points at it, and the foreign key has no CASCADE. Deleting the child row first and then the order, inside one transaction, works: both or neither.</p>
  <h3>UPDATE without WHERE</h3>
  <p>The most expensive typo in SQL. Someone means to cancel order 110 and forgets the WHERE. Run inside a transaction, so it can be undone:</p>
  <div class="fx" data-lang="sql">BEGIN;
UPDATE orders SET status = 'cancelled';
SELECT status, COUNT(*) FROM orders GROUP BY status;
ROLLBACK;
SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY status;</div>
  <div class="fx" data-lang="text">BEGIN
UPDATE 10
  status   | count 
-----------+-------
 cancelled |    10
(1 row)

ROLLBACK
  status   | count 
-----------+-------
 cancelled |     2
 delivered |     7
 pending   |     1
(3 rows)</div>
  <p><code>UPDATE 10</code>: every order was cancelled. Because it was inside <code>BEGIN</code>, <code>ROLLBACK</code> restored the 7 / 2 / 1 split. With autocommit (the default in psql and most tools) it would have been permanent.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Editing a register with a pen. INSERT writes a new line, UPDATE crosses out and rewrites, DELETE strikes a line. The WHERE is your finger on the page: without it, the pen goes over every line. A transaction is writing in pencil until you're sure.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>INSERT INTO t (cols) VALUES (…), (…)</code> adds rows; <code>UPDATE t SET col = expr [WHERE …]</code> changes matching rows; <code>DELETE FROM t [WHERE …]</code> removes matching rows; without WHERE they affect every row. <code>RETURNING cols</code> (PostgreSQL, also SQLite 3.35+) returns the affected rows. The command tag (<code>UPDATE 10</code>) reports how many rows were affected.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: UPDATE without WHERE</span>
    <p>Write the WHERE first and test it as a SELECT; run risky writes inside <code>BEGIN; … ROLLBACK;</code> until the row count looks right; then repeat with COMMIT.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: constraints and UPSERT.</b> A nightly feed sends restaurant ratings: some restaurants already exist (update them), some are new (insert them). "Check first, then insert or update" takes two statements and can race with another writer. Is there one safe statement?</div>

  <h2 id="sf-upsert"><span class="num">11</span>Constraints &amp; UPSERT</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A plain INSERT of an existing restaurant id fails with "duplicate key". Checking with a SELECT first, then choosing INSERT or UPDATE, can race: two jobs both see "not there" and both insert. How do we insert-or-update in one atomic step?</p>
  </div>
  <p><strong>Upsert</strong> = "update or insert" in one statement. It leans on a constraint: the database detects the duplicate through the primary key or a UNIQUE constraint, and <code>ON CONFLICT</code> says what to do instead of failing. <code>EXCLUDED</code> is the row you tried to insert. Tonight's feed: Pizza Point (12) is now 4.0, and a new restaurant, Paratha Point (15), opens at 4.1:</p>
  <div class="fx" data-lang="sql">INSERT INTO restaurants VALUES (12, 'Pizza Point', 'Pune', 'Pizza', 4.0);
INSERT INTO restaurants VALUES
  (12, 'Pizza Point',   'Pune', 'Pizza',        4.0),
  (15, 'Paratha Point', 'Pune', 'North Indian', 4.1)
ON CONFLICT (restaurant_id) DO UPDATE SET rating = EXCLUDED.rating
RETURNING *;</div>
  <div class="fx" data-lang="text">ERROR:  duplicate key value violates unique constraint "restaurants_pkey"
DETAIL:  Key (restaurant_id)=(12) already exists.
 restaurant_id |     name      | city |   cuisine    | rating 
---------------+---------------+------+--------------+--------
            12 | Pizza Point   | Pune | Pizza        |    4.0
            15 | Paratha Point | Pune | North Indian |    4.1
(2 rows)

INSERT 0 2</div>
  <p>The plain INSERT failed on the primary key. The upsert updated Pizza Point's rating (3.9 → 4.0) and inserted Paratha Point, in one statement, with the command tag <code>INSERT 0 2</code> counting both rows. Three more behaviours worth seeing:</p>
  <div class="fx" data-lang="sql">INSERT INTO restaurants VALUES (11, 'Biryani Bros', 'Mumbai', 'Biryani', 4.8)
ON CONFLICT DO NOTHING;
INSERT INTO restaurants VALUES (16, 'Chaat Corner', 'Mumbai', 'Street Food', 4.0)
ON CONFLICT (city) DO NOTHING;
INSERT INTO restaurants VALUES (12, 'Pizza Point', 'Pune', 'Pizza', 6.0)
ON CONFLICT (restaurant_id) DO UPDATE SET rating = EXCLUDED.rating;</div>
  <div class="fx" data-lang="text">INSERT 0 0
ERROR:  there is no unique or exclusion constraint matching the ON CONFLICT specification
ERROR:  new row for relation "restaurants" violates check constraint "restaurants_rating_check"
DETAIL:  Failing row contains (12, Pizza Point, Pune, Pizza, 6.0).</div>
  <p>Read them in order. <code>DO NOTHING</code> skipped the existing Biryani Bros silently (<code>INSERT 0 0</code>). <code>ON CONFLICT (city)</code> is refused because <code>city</code> has no UNIQUE constraint: upsert needs one to detect a "conflict". And a rating of 6.0 is still rejected by the CHECK: the update path obeys every constraint, like any UPDATE.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school register with roll numbers. A new admission form arrives: if the roll number is already taken, update that student's details; if not, add a line. The roll number (a unique key) is what tells the clerk "this is the same student".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>INSERT … ON CONFLICT (conflict_target) DO UPDATE SET … | DO NOTHING</code> inserts each row, and if it would violate the unique index named by the target, updates the existing row instead (or skips it). It is atomic per row, so concurrent upserts don't race. Other databases spell it differently (<code>MERGE</code>, MySQL's <code>ON DUPLICATE KEY UPDATE</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"SELECT, then INSERT or UPDATE" races under concurrency; and an upsert's conflict target must match a real UNIQUE or PRIMARY KEY constraint. If you want to upsert by name, <code>restaurants.name</code> must be UNIQUE (in Biteful it is).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have every clause for one table. Before moving to several tables, let's see the clauses as one pipeline and check every number on Biteful in one place.</div>

  <h2 id="sf-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>SELECT, WHERE, aggregates, GROUP BY, HAVING, NULL rules, CASE, ORDER BY, LIMIT, INSERT, UPDATE, DELETE, UPSERT: eleven separate tools, or one machine?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 300" width="700">
<defs><marker id="sf-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="10" y="16" font-size="11" font-weight="700" class="tb">READING: one pipeline, each step feeds the next (orders → result)</text>
<rect x="10" y="28" width="78" height="44" rx="7" class="fb sb"/><text x="49" y="47" text-anchor="middle" font-size="11" font-weight="700">FROM</text><text x="49" y="63" text-anchor="middle" class="tm" font-size="9.5">10 rows</text>
<line x1="88" y1="50" x2="98" y2="50" stroke="currentColor" marker-end="url(#sf-a9)"/>
<rect x="100" y="28" width="78" height="44" rx="7" class="fb sb"/><text x="139" y="47" text-anchor="middle" font-size="11" font-weight="700">WHERE</text><text x="139" y="63" text-anchor="middle" class="tm" font-size="9.5">TRUE only</text>
<line x1="178" y1="50" x2="188" y2="50" stroke="currentColor" marker-end="url(#sf-a9)"/>
<rect x="190" y="28" width="84" height="44" rx="7" class="ft st"/><text x="232" y="47" text-anchor="middle" font-size="11" font-weight="700">GROUP BY</text><text x="232" y="63" text-anchor="middle" class="tm" font-size="9.5">piles</text>
<line x1="274" y1="50" x2="284" y2="50" stroke="currentColor" marker-end="url(#sf-a9)"/>
<rect x="286" y="28" width="78" height="44" rx="7" class="ft st"/><text x="325" y="47" text-anchor="middle" font-size="11" font-weight="700">HAVING</text><text x="325" y="63" text-anchor="middle" class="tm" font-size="9.5">keep piles</text>
<line x1="364" y1="50" x2="374" y2="50" stroke="currentColor" marker-end="url(#sf-a9)"/>
<rect x="376" y="28" width="84" height="44" rx="7" class="fg sg"/><text x="418" y="47" text-anchor="middle" font-size="11" font-weight="700">SELECT</text><text x="418" y="63" text-anchor="middle" class="tm" font-size="9.5">exprs, CASE</text>
<line x1="460" y1="50" x2="470" y2="50" stroke="currentColor" marker-end="url(#sf-a9)"/>
<rect x="472" y="28" width="78" height="44" rx="7" class="fs"/><text x="511" y="47" text-anchor="middle" font-size="11" font-weight="700">DISTINCT</text><text x="511" y="63" text-anchor="middle" class="tm" font-size="9.5">dedupe</text>
<line x1="550" y1="50" x2="560" y2="50" stroke="currentColor" marker-end="url(#sf-a9)"/>
<rect x="562" y="28" width="62" height="44" rx="7" class="fs"/><text x="593" y="47" text-anchor="middle" font-size="10.5" font-weight="700">ORDER</text><text x="593" y="63" text-anchor="middle" class="tm" font-size="9.5">sort</text>
<line x1="624" y1="50" x2="634" y2="50" stroke="currentColor" marker-end="url(#sf-a9)"/>
<rect x="636" y="28" width="56" height="44" rx="7" class="fs"/><text x="664" y="47" text-anchor="middle" font-size="10.5" font-weight="700">LIMIT</text><text x="664" y="63" text-anchor="middle" class="tm" font-size="9.5">cut</text>
<rect x="100" y="96" width="174" height="40" rx="7" class="fv"/><text x="187" y="113" text-anchor="middle" font-size="10.5" font-weight="700">NULL → UNKNOWN</text><text x="187" y="128" text-anchor="middle" class="tm" font-size="9.5">drops rows in WHERE / HAVING / CASE</text>
<line x1="139" y1="96" x2="139" y2="74" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sf-a9)"/><line x1="325" y1="96" x2="325" y2="74" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sf-a9)"/><line x1="274" y1="116" x2="325" y2="98" stroke="currentColor" stroke-dasharray="3 3"/>
<rect x="286" y="146" width="174" height="40" rx="7" class="fv"/><text x="373" y="163" text-anchor="middle" font-size="10.5" font-weight="700">aggregates skip NULL</text><text x="373" y="178" text-anchor="middle" class="tm" font-size="9.5">COUNT(*) 10 vs COUNT(col) 6</text>
<line x1="300" y1="146" x2="245" y2="74" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sf-a9)"/>
<rect x="476" y="96" width="216" height="40" rx="7" class="fv"/><text x="584" y="113" text-anchor="middle" font-size="10.5" font-weight="700">CASE inside aggregate</text><text x="584" y="128" text-anchor="middle" class="tm" font-size="9.5">= conditional counts, rates</text>
<line x1="476" y1="110" x2="440" y2="74" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sf-a9)"/>
<text x="10" y="216" font-size="11" font-weight="700" class="tr">WRITING: the same WHERE chooses the rows; constraints guard the result</text>
<rect x="10" y="228" width="150" height="44" rx="7" class="fr sr"/><text x="85" y="247" text-anchor="middle" font-size="11" font-weight="700">INSERT</text><text x="85" y="263" text-anchor="middle" class="tm" font-size="9.5">new row 111</text>
<rect x="175" y="228" width="170" height="44" rx="7" class="fr sr"/><text x="260" y="247" text-anchor="middle" font-size="11" font-weight="700">UPDATE / DELETE + WHERE</text><text x="260" y="263" text-anchor="middle" class="tm" font-size="9.5">no WHERE → UPDATE 10</text>
<rect x="360" y="228" width="150" height="44" rx="7" class="fr sr"/><text x="435" y="247" text-anchor="middle" font-size="11" font-weight="700">Constraints</text><text x="435" y="263" text-anchor="middle" class="tm" font-size="9.5">PK, FK, CHECK refuse</text>
<line x1="510" y1="250" x2="526" y2="250" stroke="currentColor" marker-end="url(#sf-a9)"/>
<rect x="528" y="228" width="164" height="44" rx="7" class="fr sr"/><text x="610" y="247" text-anchor="middle" font-size="11" font-weight="700">UPSERT</text><text x="610" y="263" text-anchor="middle" class="tm" font-size="9.5">ON CONFLICT (unique key)</text>
<line x1="139" y1="74" x2="230" y2="226" stroke="currentColor" stroke-dasharray="2 4"/>
</svg><figcaption>Top: every SELECT is the same pipeline; each clause can only use what earlier steps produced, and NULL's UNKNOWN leaks into every filter and aggregate. Bottom: writes reuse WHERE to pick rows, and the constraints from the previous page decide what is allowed, which is also what makes UPSERT possible.</figcaption></figure>
  <table class="tbl"><caption>Every idea on Biteful's ten orders</caption>
    <tr><th>Concept</th><th>Built from / step</th><th>Answers which question</th><th>On Biteful</th><th>Use when / watch</th></tr>
    <tr><td>SELECT, expressions</td><td>step 5, per row</td><td>which columns, computed how?</td><td>101: 240 → with GST 252</td><td>integer ÷ integer truncates (32/60 = 0)</td></tr>
    <tr><td>WHERE</td><td>step 2, per row</td><td>which rows?</td><td>7 delivered; brackets: 5 vs 8 rows</td><td>bracket AND/OR; half-open time ranges</td></tr>
    <tr><td>Execution order</td><td>FROM→WHERE→GROUP→HAVING→SELECT→ORDER→LIMIT</td><td>why does an alias "not exist"?</td><td>WHERE with_gst fails; ORDER BY with_gst works</td><td>every error about names</td></tr>
    <tr><td>Aggregates</td><td>step 3, whole table as one group</td><td>one number from many rows?</td><td>10 orders, 3,510; delivered 2,630</td><td>no plain columns beside them</td></tr>
    <tr><td>GROUP BY</td><td>step 3, piles by key</td><td>one summary per group?</td><td>500 / 1,230 / 900</td><td>SELECT only keys + aggregates</td></tr>
    <tr><td>HAVING</td><td>step 4, per pile</td><td>which groups?</td><td>Asha 3, Ben 2, Chen 2 (Farah dropped)</td><td>aggregate conditions only</td></tr>
    <tr><td>NULL, 3VL</td><td>UNKNOWN in every comparison</td><td>what about missing values?</td><td>&lt;&gt; 'Pune' loses Esha; AVG 36.17 not 21.70</td><td>IS NULL, COALESCE, NOT IN trap</td></tr>
    <tr><td>CASE, conditional agg.</td><td>expression inside SELECT / aggregate</td><td>labels; several counts at once?</td><td>Pizza Point cancel rate 0.33</td><td>NULL falls to ELSE; use 1.0</td></tr>
    <tr><td>ORDER BY, LIMIT</td><td>steps 7–8</td><td>sorted, top N, pages?</td><td>NULL first in DESC; 4.2 tie</td><td>NULLS LAST; tiebreaker</td></tr>
    <tr><td>DISTINCT</td><td>step 6</td><td>unique rows?</td><td>3 cities; 8 customer–restaurant pairs</td><td>don't hide join fan-out</td></tr>
    <tr><td>INSERT / UPDATE / DELETE</td><td>WHERE + RETURNING</td><td>how to change data?</td><td>111 added; 110 delivered; no WHERE → UPDATE 10</td><td>BEGIN … ROLLBACK first</td></tr>
    <tr><td>UPSERT</td><td>INSERT + UNIQUE/PK + ON CONFLICT</td><td>insert or update atomically?</td><td>Pizza Point 4.0, Paratha Point added</td><td>needs a unique target; CHECK still applies</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a query is a pipeline that turns a table into a smaller table, one clause at a time, and NULL makes every condition three-valued.</strong> The pipeline order explains which names and aggregates each clause may use; three-valued logic explains why rows silently vanish from WHERE, HAVING, CASE and NOT IN, and why COUNT and AVG disagree. Writes reuse the same WHERE to choose rows, and the constraints from the schema decide what the result may look like. Every later page (JOINs, subqueries, windows) adds steps to this same pipeline.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="sf-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful's <code>orders</code> (101–110; amounts 240, 450, 520, 380, 310, 180, 260, 260, 600, 310; 7 delivered, 105 and 107 cancelled, 110 pending; delivery minutes 32, 41, 38, NULL, NULL, 25, NULL, 29, 52, NULL), <code>customers</code> (7; Esha's city NULL; referred_by 1, 1, 2 and four NULLs) and <code>restaurants</code> (5; ratings 4.5, 4.2, 3.9, 4.2, NULL). Engine: PostgreSQL 16.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Clause / idea</th><th>Question it answers</th><th>On Biteful</th><th>Limit → next</th></tr>
    <tr><td>SELECT … FROM</td><td>ask a table anything</td><td>amount × 1.05; 32/60 = 0</td><td>all rows → WHERE</td></tr>
    <tr><td>WHERE</td><td>only some rows</td><td>7 delivered; 5 vs 8 with/without brackets</td><td>alias fails → order</td></tr>
    <tr><td>Execution order</td><td>which clause sees what</td><td>FROM→WHERE→GROUP BY→HAVING→SELECT→DISTINCT→ORDER BY→LIMIT</td><td>totals → aggregates</td></tr>
    <tr><td>Aggregates</td><td>one number from many rows</td><td>COUNT 10, SUM 3,510, AVG 351</td><td>per group → GROUP BY</td></tr>
    <tr><td>GROUP BY</td><td>one row per group</td><td>delivered: 10 → 500, 11 → 1,230, 12 → 900</td><td>filter groups → HAVING</td></tr>
    <tr><td>HAVING</td><td>keep some groups</td><td>≥ 2 live orders: Asha 3, Ben 2, Chen 2</td><td>missing values → NULL</td></tr>
    <tr><td>NULL &amp; 3VL</td><td>unknown values</td><td>&lt;&gt; 'Pune' drops Esha; COUNT 10 vs 6; AVG 36.17; NOT IN → 0 rows</td><td>labels, side-by-side counts → CASE</td></tr>
    <tr><td>CASE</td><td>if/else and conditional counts</td><td>cancel rate: Pizza Point 0.33, Green Bowl 1.00</td><td>order, top N → ORDER BY</td></tr>
    <tr><td>ORDER BY, DISTINCT, LIMIT</td><td>sorted, unique, cut</td><td>Momo Magic first in DESC; 4.2 tie; 8 pairs</td><td>change data → DML</td></tr>
    <tr><td>INSERT / UPDATE / DELETE</td><td>add, change, remove</td><td>order 111; 110 delivered; FK blocks 105</td><td>insert-or-update → UPSERT</td></tr>
    <tr><td>UPSERT</td><td>atomic insert-or-update</td><td>Pizza Point 4.0; Paratha Point added</td><td>several tables → <a class="xref" data-note="sql_joins">JOINs</a></td></tr>
  </table>
  <h3>Syntax and rules</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Form</th><th>What each part means</th></tr>
    <tr><td>Full SELECT</td><td><code>SELECT [DISTINCT] e AS a FROM t WHERE c GROUP BY k HAVING h ORDER BY o LIMIT n OFFSET k</code></td><td>written order; evaluated FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT</td></tr>
    <tr><td>Truth rules</td><td>FALSE AND U = FALSE; TRUE OR U = TRUE; else U; NOT U = U</td><td>U = UNKNOWN (NULL); WHERE/HAVING keep only TRUE</td></tr>
    <tr><td>COUNT family</td><td><code>COUNT(*)</code> / <code>COUNT(col)</code> / <code>COUNT(DISTINCT col)</code></td><td>rows / non-NULL values / distinct non-NULL values (customers: 7 / 6 / 2)</td></tr>
    <tr><td>AVG with NULLs</td><td>AVG(x) = SUM(x) / COUNT(x)</td><td>denominator counts only non-NULL x: 217 / 6 = 36.17</td></tr>
    <tr><td>Rate</td><td><code>AVG(CASE WHEN cond THEN 1.0 ELSE 0 END)</code></td><td>fraction of rows where cond is TRUE; 1.0 avoids integer maths</td></tr>
    <tr><td>Half-open range</td><td><code>ts &gt;= start AND ts &lt; next_start</code></td><td>includes the whole last day/month</td></tr>
    <tr><td>NULL tools</td><td><code>IS [NOT] NULL</code>, <code>COALESCE</code>, <code>NULLIF</code>, <code>IS DISTINCT FROM</code></td><td>test, default, avoid ÷0, NULL-safe ≠</td></tr>
    <tr><td>UPSERT</td><td><code>INSERT … ON CONFLICT (key) DO UPDATE SET c = EXCLUDED.c</code></td><td>key must be PK/UNIQUE; EXCLUDED = the proposed row</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>WHERE</b><p>Any condition on single rows, before grouping.</p><small>Not for aggregates; not for SELECT aliases</small></div>
    <div><b>HAVING</b><p>Conditions on aggregates (COUNT, SUM) after GROUP BY.</p><small>Not for plain row conditions</small></div>
    <div><b>COUNT(col) / AVG</b><p>When NULL means "unknown, leave it out".</p><small>COUNT(*) when you mean rows</small></div>
    <div><b>COALESCE</b><p>Display defaults; zero for empty SUMs.</p><small>Don't turn unknown into 0 inside AVG unless that is the business rule</small></div>
    <div><b>CASE / FILTER</b><p>Labels, pivots, several counts and rates in one pass.</p><small>Handle NULL in its own branch first</small></div>
    <div><b>LIMIT</b><p>Top N, paging, always with ORDER BY and a unique tiebreaker.</p><small>Avoid big OFFSETs; keep ties with RANK</small></div>
    <div><b>RETURNING + BEGIN</b><p>Every UPDATE/DELETE you are not sure about.</p><small>Never run a WHERE-less UPDATE by accident</small></div>
    <div><b>UPSERT</b><p>Feeds and syncs: insert new, update existing, atomically.</p><small>Needs a UNIQUE/PK conflict target</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Integer division (32/60 = 0, 7/10 = 0); AND before OR without brackets; BETWEEN on timestamps; SELECT alias in WHERE; aggregate in WHERE; plain column beside an aggregate without GROUP BY; <code>= NULL</code>; <code>&lt;&gt;</code> dropping NULL rows; NOT IN with a NULL in the list; AVG's smaller denominator; SUM of no rows = NULL; CASE sending NULL to ELSE; NULLs first in DESC (PostgreSQL); LIMIT on ties; DISTINCT hiding a fan-out; UPDATE without WHERE; upsert on a non-unique column.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>SELECT 7 / 2, 7 / 2.0, NULL = NULL, 10 / NULLIF(0, 0);</code></td><td>3, 3.5, NULL, NULL.</td></tr>
    <tr><td>Customers 7 rows, one NULL city, cities Mumbai/Pune: COUNT(*), COUNT(city), COUNT(DISTINCT city)?</td><td>7, 6, 2.</td></tr>
    <tr><td>Values 30, NULL, 60: AVG?</td><td>45 (90 / 2); with COALESCE(x, 0) it would be 30.</td></tr>
    <tr><td>Which clause filters "restaurants with more than 2 delivered orders"?</td><td>WHERE status = 'delivered' for rows, then HAVING COUNT(*) &gt; 2 for groups.</td></tr>
    <tr><td><code>WHERE id NOT IN (1, 2, NULL)</code> returns how many rows?</td><td>None: every comparison ends UNKNOWN.</td></tr>
  </table>

  <h2 id="sf-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you predict each query's output by hand before running it, and explain which step of the pipeline produced it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Write a query: order ids and amounts of delivered orders under ₹300, cheapest first.</summary><div class="qa-body"><code>SELECT order_id, amount FROM orders WHERE status = 'delivered' AND amount &lt; 300 ORDER BY amount;</code> gives 106 (180), 101 (240), 108 (260). FROM picks the table, WHERE keeps rows where both conditions are TRUE, ORDER BY sorts ascending (the default).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>SELECT name FROM customers WHERE city = 'Pune' OR city &lt;&gt; 'Pune'</code> return?</summary><div class="qa-body">Asha, Ben, Chen, Dia, Farah, Gita. Not Esha: her city is NULL, so both sides are UNKNOWN and <code>UNKNOWN OR UNKNOWN</code> is UNKNOWN. "Everything" in SQL never includes NULLs unless you add <code>OR city IS NULL</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>SELECT COUNT(*), COUNT(delivery_minutes), AVG(delivery_minutes) FROM orders;</code></summary><div class="qa-body">10, 6, 36.17 (217 / 6). Four orders have no delivery time; COUNT(col) and AVG skip them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>WHERE with_gst &gt; 500</code> fail when <code>with_gst</code> is a SELECT alias, but <code>ORDER BY with_gst</code> works?</summary><div class="qa-body">WHERE is evaluated at step 2, SELECT at step 5, ORDER BY at step 7. The alias doesn't exist yet when WHERE runs. Fix: repeat the expression (<code>WHERE amount * 1.05 &gt; 500</code>) or wrap the query in a subquery/CTE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between WHERE and HAVING? Can HAVING replace WHERE?</summary><div class="qa-body">WHERE filters rows before grouping and can't use aggregates. HAVING filters groups after aggregation. HAVING on a grouping-key condition works, but it groups rows you'll throw away, so it's slower and less clear; on a non-key column it fails. Use WHERE for row conditions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>SELECT 7 / 2, 7 / 2.0, NULL = NULL, 10 / NULLIF(0, 0);</code></summary><div class="qa-body"><code>3</code>, <code>3.5</code>, <code>NULL</code>, <code>NULL</code>. Integer division truncates; NULL = NULL is UNKNOWN; NULLIF turns 0 into NULL, and anything ÷ NULL is NULL instead of an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a query: cancellation rate (as a decimal) per day.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT ordered_at::date AS day,
       ROUND(AVG(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0 END), 2) AS cancel_rate
FROM orders
GROUP BY 1
ORDER BY 1;</div>2 March 0.00, 3 March 0.50 (104 delivered, 105 cancelled), 4 March 0.50 (106, 107), 5 March 0.00, 8 March 0.00. The <code>1.0</code> avoids integer maths.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A colleague writes <code>WHERE city != 'Mumbai'</code> to get "customers not in Mumbai". What's missing and how do you fix it?</summary><div class="qa-body">Esha (NULL city) is dropped. Use <code>WHERE city IS DISTINCT FROM 'Mumbai'</code> or <code>WHERE city &lt;&gt; 'Mumbai' OR city IS NULL</code>. Whether unknown-city customers belong in the answer is a business question; ask it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>SELECT name FROM restaurants WHERE city = 'Mumbai' ORDER BY rating DESC LIMIT 1</code>: is the answer deterministic?</summary><div class="qa-body">No. Biryani Bros and Green Bowl tie at 4.2, so either may come first. Add a tiebreaker (<code>ORDER BY rating DESC, name</code>) or use <code>RANK() … = 1</code> to return both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>SELECT COUNT(*), SUM(amount) FROM orders WHERE restaurant_id = 14;</code></summary><div class="qa-body"><code>0</code> and <code>NULL</code>. Momo Magic has no orders. COUNT of nothing is 0, but SUM/AVG/MAX of nothing is NULL. Use <code>COALESCE(SUM(amount), 0)</code> if a report needs 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Count delivered, cancelled and pending orders as three columns in one row.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
       COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
       COUNT(*) FILTER (WHERE status = 'pending')   AS pending
FROM orders;</div>7, 2, 1. Portable version: <code>SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>SELECT name || ' - ' || city FROM customers</code> show for Esha?</summary><div class="qa-body">NULL. Concatenating with NULL gives NULL. Use <code>COALESCE(city, 'unknown')</code> or <code>CONCAT(name, ' - ', city)</code>, which treats NULL as empty.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you insert a restaurant, or update its rating if the id already exists, in one statement?</summary><div class="qa-body"><code>INSERT … ON CONFLICT (restaurant_id) DO UPDATE SET rating = EXCLUDED.rating</code>. It needs a unique constraint or primary key on the conflict column. It's atomic, unlike "SELECT then INSERT or UPDATE", which races under concurrency.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You ran <code>UPDATE orders SET status = 'cancelled'</code> and forgot WHERE. What happened and how do you protect yourself next time?</summary><div class="qa-body">Every row was updated (<code>UPDATE 10</code>). If autocommit was on, only a backup or point-in-time restore helps. Protect yourself: run the WHERE as a SELECT first, wrap writes in <code>BEGIN … ROLLBACK/COMMIT</code>, check the row count, and use RETURNING to see what changed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does HAVING need GROUP BY to have run first, and what breaks if you put the condition in WHERE?</summary><div class="qa-body">HAVING's condition is about a pile (COUNT(*) of a customer's orders), and piles only exist after GROUP BY at step 3. WHERE runs at step 2, on single rows, where COUNT(*) has nothing to count, so PostgreSQL raises "aggregate functions are not allowed in WHERE".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does three-valued logic explain both the <code>&lt;&gt;</code> trap and the NOT IN trap?</summary><div class="qa-body">Both are WHERE keeping only TRUE. <code>NULL &lt;&gt; 'Pune'</code> is UNKNOWN, so Esha is dropped. <code>x NOT IN (a, b, NULL)</code> expands to <code>x &lt;&gt; a AND x &lt;&gt; b AND x &lt;&gt; NULL</code>; the last part is UNKNOWN, and TRUE AND UNKNOWN is UNKNOWN, so every row is dropped. Same rule, one row vs all rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is conditional aggregation built from CASE and an aggregate, and what breaks if you use WHERE instead?</summary><div class="qa-body">WHERE removes rows before aggregation, so one query can only count one condition: <code>WHERE status = 'cancelled'</code> gives the cancelled count but loses the total you need for the rate. CASE keeps every row and turns the condition into a 1 or 0, so SUM and AVG over the same rows give the count, the total and the rate side by side.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does UPSERT need from the previous page (constraints), and why?</summary><div class="qa-body">A conflict is "this row would violate a unique index". Without a PRIMARY KEY or UNIQUE constraint on the target columns, PostgreSQL has no way to detect "the same row already exists", so <code>ON CONFLICT (city)</code> is refused. And because the update path is an ordinary UPDATE, CHECK constraints (rating 1 to 5) still apply.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sql_joins">JOINs</a>.</b> Every query here touched one table, so results showed <code>restaurant_id</code> 11 instead of "Biryani Bros", and "restaurants with zero orders" or "customers who never ordered" were out of reach. Combining tables is the next step.</div>
</main>`
});
