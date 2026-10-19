// notes/databases/sql_joins.js — JOINs
Object.assign(TOPIC_CONTENT, {
  "sql_joins": `<main>
  <h1>JOINs</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>JOINs</span></div>
  <p class="lead">A join puts related tables back together for one query: each order next to the customer who placed it, each customer next to the friend who referred them. Getting <em>some</em> rows back is easy. Getting the <em>right number</em> of rows (no lost customers, no doubled revenue) is the real skill, and it is what interviews test. This note builds every join type as the answer to a question the previous one could not answer, all on ONE running example: <strong>Biteful</strong>, the small food-delivery company from <a class="xref" data-note="sql_relational">Relational Model</a> and <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a>, with 7 customers, 5 restaurants, 10 orders and 15 order lines. Every result on this page was produced by running the query in <strong>PostgreSQL 16</strong> on exactly those rows; where another engine behaves differently, it is said and was checked.</p>

  <h2 id="sj-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="sj-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="65" y="41" text-anchor="middle" font-size="12">Relational</text><text x="65" y="58" text-anchor="middle" class="tm" font-size="10">keys split facts</text>
<line x1="120" y1="45" x2="138" y2="45" stroke="currentColor" marker-end="url(#sj-a0)"/>
<rect x="140" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="195" y="41" text-anchor="middle" font-size="12">Fundamentals</text><text x="195" y="58" text-anchor="middle" class="tm" font-size="10">one table</text>
<line x1="250" y1="45" x2="268" y2="45" stroke="currentColor" marker-end="url(#sj-a0)"/>
<rect x="270" y="20" width="110" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="325" y="41" text-anchor="middle" font-size="12" font-weight="700">JOINs</text><text x="325" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="380" y1="45" x2="398" y2="45" stroke="currentColor" marker-end="url(#sj-a0)"/>
<rect x="400" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="455" y="41" text-anchor="middle" font-size="12">Subqueries</text><text x="455" y="58" text-anchor="middle" class="tm" font-size="10">query in a query</text>
<line x1="510" y1="45" x2="528" y2="45" stroke="currentColor" marker-end="url(#sj-a0)"/>
<rect x="530" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="590" y="41" text-anchor="middle" font-size="12">Windows</text><text x="590" y="58" text-anchor="middle" class="tm" font-size="10">detail + aggregate</text>
<line x1="325" y1="70" x2="325" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sj-a0)"/>
<rect x="245" y="110" width="160" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="325" y="130" text-anchor="middle" font-size="12">Optimization</text><text x="325" y="147" text-anchor="middle" class="tm" font-size="10">indexes make joins fast</text>
<text x="40" y="130" class="tm" font-size="10.5">normalisation splits one fact per table;</text><text x="40" y="146" class="tm" font-size="10.5">joins are how you put them back together</text>
</svg><figcaption>The SQL group of the Databases track. Fundamentals taught one table at a time; from here on almost every real query reads two or more tables.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: one table at a time</b><span><a class="xref" data-note="sql_relational">Relational Model</a> split Biteful's data so each fact lives in one place (a customer's city in <code>customers</code>, a bill in <code>orders</code>), connected by keys. <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a> taught SELECT, WHERE, GROUP BY and NULL logic on a single table. But "which customer placed order 103?" has its answer split across two tables.</span></li>
    <li><b>This note adds: putting tables back together, with the right row count</b><span>INNER, LEFT, RIGHT, FULL, CROSS and self joins; "has any / has none" (semi and anti joins); where a filter goes in an outer join; the fan-out that doubles revenue; and how the engine actually finds matching rows.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a></b><span>Joins combine tables that exist. Next we combine a table with the <em>result of another query</em> (an average, a per-customer total), which is also the clean fix for fan-out. Then <a class="xref" data-note="sql_windows">Window Functions</a> put a group's total next to each detail row without any join at all, and <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> makes the join algorithms of section 10 fast.</span></li>
  </ol>

  <h2 id="sj-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each join answers the question above it, and its weakness raises the next question. All numbers are from Biteful's 7 customers, 5 restaurants and 10 orders.</p>
  <ol class="story">
    <li><b>INNER JOIN</b><span>Q: the answer needs two tables ("who placed each order?") → pair every order with the customer whose id matches: 10 orders → 10 rows, traced pair by pair. But Gita, who never ordered, is not in the result at all…</span></li>
    <li><b>LEFT JOIN</b><span>Q: "all customers with their orders" must still list Gita → keep every left row, fill the missing side with NULL: 11 rows (Gita + NULL). But this keeps only the <em>left</em> side's lonely rows. What if the lonely rows are on the right, or on both sides?</span></li>
    <li><b>RIGHT &amp; FULL JOIN</b><span>Q: keep unmatched rows from the other side, or from both? → RIGHT keeps Momo Magic (a restaurant with no orders); FULL lines up March orders-per-day with signups-per-day: 6 days, padded on whichever side is empty. But every join so far needs a matching key. What if we want every combination, matched or not?</span></li>
    <li><b>CROSS JOIN</b><span>Q: a status board must show "Momo Magic, delivered, 0" even though no such row exists → pair everything with everything: 5 restaurants × 3 statuses = 15 cells, then LEFT JOIN the real counts. But all joins so far pair two <em>different</em> tables. Biteful's referral column points into the same table…</span></li>
    <li><b>SELF JOIN</b><span>Q: "who referred Farah?" → join customers to itself under two aliases: Farah → Ben. Now we can pair any rows. But "which customers have ordered?" via JOIN prints Asha three times…</span></li>
    <li><b>Semi &amp; anti joins (EXISTS / NOT EXISTS)</b><span>Q: a yes/no filter, "has any" or "has none", one row per customer → EXISTS gives 6 customers once each; NOT EXISTS gives Gita. NOT IN looks the same but returns 0 rows when the list holds a NULL. Back to outer joins: where do extra conditions go?</span></li>
    <li><b>ON vs WHERE in outer joins</b><span>Q: "every customer with their <em>delivered</em> orders" → put the status test in WHERE and Dia, Esha and Gita vanish (the LEFT JOIN silently became INNER); in ON they stay with NULLs. Now the rows are right. Are the sums?</span></li>
    <li><b>Fan-out &amp; double counting</b><span>Q: why does Asha's spend show 1620 when she spent 930? → joining order lines repeats each order's amount once per line; traced row by row. Fix: aggregate each table at its own grain first. Real queries chain four tables; what else can ON do?</span></li>
    <li><b>Chains, USING, NATURAL &amp; non-equi joins</b><span>Q: customer → order → restaurant → lines in one query, and matches that are ranges, not equal keys → chain joins (and keep a LEFT branch LEFT), name keys with USING, never NATURAL (it matched customer names to restaurant names: 0 rows), and band orders by amount with BETWEEN. All logical. Physically, how does the engine find 10 matches without trying 70 pairs?</span></li>
    <li><b>Join algorithms</b><span>Q: how is a join executed, and when is it slow? → nested loop (small outer + index), hash join (equality, big unsorted inputs), merge join (sorted inputs); PostgreSQL's real plans for our query. Then one puzzle tests the whole model: duplicates multiply, NULL keys never match.</span></li>
  </ol>

  <h2 id="sj-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">JOINs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Mental model</div>
        <ul>
          <li><b>Why</b> — each fact is stored once in its own table; a join re-attaches them by key</li>
          <li><b>Step 1</b> — imagine every pair (7 customers × 10 orders = 70)</li>
          <li><b>Step 2</b> — keep pairs where <code>ON</code> is TRUE (10)</li>
          <li><b>Step 3</b> — outer joins add back unmatched rows, padded with NULL (Gita → 11)</li>
          <li>💡 fee receipts matched to the class register by roll number</li>
          <li>⚠ Venn diagrams mislead: joins return pairs, counts can grow</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Join types</div>
        <ul>
          <li><b>INNER</b> — matched pairs only (10 rows, Gita gone)</li>
          <li><b>LEFT</b> — all left rows; NULLs where no match (11)</li>
          <li><b>RIGHT</b> — LEFT with tables swapped (Momo Magic kept)</li>
          <li><b>FULL</b> — both sides; reconcile two lists with <code>COALESCE(a.k, b.k)</code></li>
          <li><b>CROSS</b> — m × n, no ON; 5 × 3 grid, then LEFT JOIN facts for zeros</li>
          <li>⚠ missing ON / <code>FROM a, b</code> → accidental cross join</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SELF join</div>
        <ul>
          <li><b>Same table, two aliases</b> — <code>customers c LEFT JOIN customers r ON r.customer_id = c.referred_by</code></li>
          <li><b>LEFT</b> keeps people nobody referred</li>
          <li><b>Unique pairs</b> — <code>a.customer_id &lt; b.customer_id</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Semi &amp; anti joins</div>
        <ul>
          <li><b>Semi</b> — "has any": <code>EXISTS</code>, each left row once</li>
          <li><b>Anti</b> — "has none": <code>NOT EXISTS</code> or <code>LEFT JOIN … WHERE r.key IS NULL</code></li>
          <li>⚠ <b>NOT IN + one NULL</b> → 0 rows (x &lt;&gt; NULL is UNKNOWN)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ON vs WHERE</div>
        <ul>
          <li><b>ON</b> — decides which right rows match; every left row is kept anyway</li>
          <li><b>WHERE</b> — runs after the join, on padded rows too</li>
          <li>⚠ <code>WHERE o.status = 'delivered'</code> turns LEFT into INNER</li>
          <li>⚠ <code>COUNT(*)</code> gives Gita 1 → use <code>COUNT(o.order_id)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fan-out</div>
        <ul>
          <li><b>Cause</b> — summing a parent's column after joining its many children</li>
          <li><b>Effect</b> — Asha 930 → 1620 (2-line orders counted twice)</li>
          <li><b>Fix</b> — aggregate each table at its own grain, then join</li>
          <li><b>Check</b> — COUNT(*) after each join</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Chains &amp; syntax</div>
        <ul>
          <li>⚠ <b>LEFT then INNER</b> drops Gita → keep the branch LEFT</li>
          <li><b>USING (k)</b> — same-named key, printed once</li>
          <li>⚠ <b>NATURAL JOIN</b> matched <code>name</code> and <code>city</code> too → 0 rows</li>
          <li><b>Non-equi</b> — <code>ON amount BETWEEN lo AND hi</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Algorithms &amp; counts</div>
        <ul>
          <li><b>Nested loop</b> — small outer + index on inner; any condition</li>
          <li><b>Hash</b> — build on the small side, probe with the big; equality only</li>
          <li><b>Merge</b> — both sorted, zipper walk</li>
          <li><b>Bounds</b> — INNER ≤ m×n; LEFT ≥ m; FULL ≥ max(m, n); NULL never matches NULL</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sj-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sj-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Two Tables: INNER JOIN</span><span class="rm-sub">Every pair, keep matches</span></div></div>
      <div class="rm-item rm-done" data-target="sj-left"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">LEFT JOIN</span><span class="rm-sub">Gita comes back with NULLs</span></div></div>
      <div class="rm-item rm-done" data-target="sj-types"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">RIGHT &amp; FULL JOIN</span><span class="rm-sub">Lonely rows on either side</span></div></div>
      <div class="rm-item rm-done" data-target="sj-cross"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">CROSS JOIN</span><span class="rm-sub">Grids with zeros</span></div></div>
      <div class="rm-item rm-done" data-target="sj-self"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">SELF JOIN</span><span class="rm-sub">Referrals and pairs</span></div></div>
      <div class="rm-item rm-done" data-target="sj-semi"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Semi &amp; Anti Joins</span><span class="rm-sub">EXISTS and the NOT IN trap</span></div></div>
      <div class="rm-item rm-done" data-target="sj-onwhere"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">ON vs WHERE</span><span class="rm-sub">The silent INNER JOIN</span></div></div>
      <div class="rm-item rm-done" data-target="sj-fan"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Fan-out</span><span class="rm-sub">SUM after a join, traced</span></div></div>
      <div class="rm-item rm-done" data-target="sj-multi"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Chains, USING &amp; Non-equi</span><span class="rm-sub">Four tables, ranges</span></div></div>
      <div class="rm-item rm-done" data-target="sj-algo"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How the Engine Joins</span><span class="rm-sub">Nested loop, hash, merge</span></div></div>
      <div class="rm-item rm-done" data-target="sj-puzzle"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Row-Count Puzzle</span><span class="rm-sub">Duplicates and NULL keys</span></div></div>
      <div class="rm-item rm-done" data-target="sj-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One model, many joins</span></div></div>
      <div class="rm-item rm-done" data-target="sj-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Bugs that pass silently</span></div></div>
      <div class="rm-item rm-done" data-target="sj-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sj-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sj-model"><span class="num">01</span>The Answer Needs Two Tables: INNER JOIN</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Everything in <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a> read one table. But Biteful stores a customer's name once, in <code>customers</code>; an order stores only a number, <code>customer_id</code>, that points at it. "Who placed order 103?" cannot be answered from <code>orders</code> alone. The answer lives in another table.</p>
  </div>
  <h3>The running example: Biteful</h3>
  <p>Biteful is a small food-delivery company in Pune and Mumbai. Here are the four tables used in every section of this note. Look for the quirks, because each one powers a lesson later: Gita (7) has never ordered, Momo Magic (14) has never been ordered from, Esha's city is NULL, several <code>referred_by</code> values are NULL, and some orders have two lines.</p>
  <div class="fx" data-lang="sql">SELECT * FROM customers ORDER BY customer_id;</div>
  <table class="tbl out"><caption>customers (7 rows)</caption><tr><th>customer_id</th><th>name</th><th>city</th><th>signup_date</th><th>referred_by</th></tr><tr><td>1</td><td>Asha</td><td>Pune</td><td>2026-01-05</td><td>NULL</td></tr><tr><td>2</td><td>Ben</td><td>Mumbai</td><td>2026-01-12</td><td>1</td></tr><tr><td>3</td><td>Chen</td><td>Pune</td><td>2026-02-03</td><td>1</td></tr><tr><td>4</td><td>Dia</td><td>Mumbai</td><td>2026-02-20</td><td>NULL</td></tr><tr><td>5</td><td>Esha</td><td>NULL</td><td>2026-03-01</td><td>NULL</td></tr><tr><td>6</td><td>Farah</td><td>Mumbai</td><td>2026-03-02</td><td>2</td></tr><tr><td>7</td><td>Gita</td><td>Pune</td><td>2026-03-04</td><td>NULL</td></tr></table>
  <div class="fx" data-lang="sql">SELECT * FROM restaurants ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>restaurants (5 rows)</caption><tr><th>restaurant_id</th><th>name</th><th>city</th><th>cuisine</th><th>rating</th></tr><tr><td>10</td><td>Dosa Hut</td><td>Pune</td><td>South Indian</td><td>4.5</td></tr><tr><td>11</td><td>Biryani Bros</td><td>Mumbai</td><td>Biryani</td><td>4.2</td></tr><tr><td>12</td><td>Pizza Point</td><td>Pune</td><td>Pizza</td><td>3.9</td></tr><tr><td>13</td><td>Green Bowl</td><td>Mumbai</td><td>Healthy</td><td>4.2</td></tr><tr><td>14</td><td>Momo Magic</td><td>Pune</td><td>Tibetan</td><td>NULL</td></tr></table>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, restaurant_id,
       to_char(ordered_at, 'Mon DD HH24:MI') AS ordered_at,
       status, amount, delivery_minutes
FROM orders ORDER BY order_id;</div>
  <table class="tbl out"><caption>orders (10 rows; times in Asia/Kolkata)</caption><tr><th>order_id</th><th>customer_id</th><th>restaurant_id</th><th>ordered_at</th><th>status</th><th>amount</th><th>delivery_minutes</th></tr><tr><td>101</td><td>1</td><td>10</td><td>Mar 02 12:10</td><td>delivered</td><td>240.00</td><td>32</td></tr><tr><td>102</td><td>2</td><td>11</td><td>Mar 02 13:05</td><td>delivered</td><td>450.00</td><td>41</td></tr><tr><td>103</td><td>3</td><td>12</td><td>Mar 02 20:30</td><td>delivered</td><td>520.00</td><td>38</td></tr><tr><td>104</td><td>1</td><td>12</td><td>Mar 03 13:15</td><td>delivered</td><td>380.00</td><td>NULL</td></tr><tr><td>105</td><td>4</td><td>13</td><td>Mar 03 19:45</td><td>cancelled</td><td>310.00</td><td>NULL</td></tr><tr><td>106</td><td>2</td><td>11</td><td>Mar 04 12:40</td><td>delivered</td><td>180.00</td><td>25</td></tr><tr><td>107</td><td>5</td><td>12</td><td>Mar 04 21:10</td><td>cancelled</td><td>260.00</td><td>NULL</td></tr><tr><td>108</td><td>3</td><td>10</td><td>Mar 05 18:20</td><td>delivered</td><td>260.00</td><td>29</td></tr><tr><td>109</td><td>6</td><td>11</td><td>Mar 05 20:05</td><td>delivered</td><td>600.00</td><td>52</td></tr><tr><td>110</td><td>1</td><td>10</td><td>Mar 08 20:50</td><td>pending</td><td>310.00</td><td>NULL</td></tr></table>
  <div class="fx" data-lang="sql">SELECT * FROM order_items ORDER BY order_id, item;</div>
  <table class="tbl out"><caption>order_items (15 rows; orders.amount = SUM(qty × unit_price) of its lines)</caption><tr><th>order_id</th><th>item</th><th>qty</th><th>unit_price</th></tr><tr><td>101</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr><tr><td>102</td><td>Chicken Biryani</td><td>1</td><td>350.00</td></tr><tr><td>102</td><td>Raita</td><td>2</td><td>50.00</td></tr><tr><td>103</td><td>Farmhouse Pizza</td><td>2</td><td>260.00</td></tr><tr><td>104</td><td>Garlic Bread</td><td>1</td><td>100.00</td></tr><tr><td>104</td><td>Margherita</td><td>1</td><td>280.00</td></tr><tr><td>105</td><td>Buddha Bowl</td><td>1</td><td>310.00</td></tr><tr><td>106</td><td>Veg Biryani</td><td>1</td><td>180.00</td></tr><tr><td>107</td><td>Farmhouse Pizza</td><td>1</td><td>260.00</td></tr><tr><td>108</td><td>Filter Coffee</td><td>2</td><td>70.00</td></tr><tr><td>108</td><td>Masala Dosa</td><td>1</td><td>120.00</td></tr><tr><td>109</td><td>Chicken Biryani</td><td>1</td><td>350.00</td></tr><tr><td>109</td><td>Mutton Kebab</td><td>1</td><td>250.00</td></tr><tr><td>110</td><td>Filter Coffee</td><td>1</td><td>70.00</td></tr><tr><td>110</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr></table>
  <p>A <strong>join</strong> builds one wider result from two tables. For each order, it finds the customer row with the same <code>customer_id</code> and glues the two rows side by side. The rule that says which rows belong together is written after the word <code>ON</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school office has two books. The <em>class register</em> lists roll number and student name. The <em>fee receipt book</em> lists receipt number, roll number and amount. To print "who paid what", the clerk takes each receipt, reads its roll number, and finds that roll number in the register. That lookup, done for every receipt, is a join. A student with no receipt simply never gets matched.</p>
  </div>
  <h3>The three-step mental model, traced</h3>
  <p>Think of every join as three steps. <strong>1.</strong> Pair every left row with every right row (7 customers × 10 orders = 70 pairs). <strong>2.</strong> Keep only the pairs where the ON condition is TRUE. <strong>3.</strong> For outer joins only (next section), add back the rows that found no partner, with NULL in the missing columns. Here are steps 1 and 2 for two customers, with the condition <code>o.customer_id = c.customer_id</code>:</p>
  <table class="tbl"><caption>Trace: Asha (id 1) and Gita (id 7) against every order</caption>
    <tr><th>pair</th><th>c.customer_id</th><th>o.order_id</th><th>o.customer_id</th><th>ON true?</th></tr>
    <tr><td>Asha × 101</td><td>1</td><td>101</td><td>1</td><td><strong>yes → keep</strong></td></tr>
    <tr><td>Asha × 102, 103</td><td>1</td><td>102, 103</td><td>2, 3</td><td>no</td></tr>
    <tr><td>Asha × 104</td><td>1</td><td>104</td><td>1</td><td><strong>yes → keep</strong></td></tr>
    <tr><td>Asha × 105 … 109</td><td>1</td><td>105 … 109</td><td>4, 2, 5, 3, 6</td><td>no</td></tr>
    <tr><td>Asha × 110</td><td>1</td><td>110</td><td>1</td><td><strong>yes → keep</strong></td></tr>
    <tr><td>Gita × 101 … 110</td><td>7</td><td>any</td><td>never 7</td><td>no, ten times</td></tr>
  </table>
  <p>Asha survives three times (three orders), Gita never. Doing the same for everyone keeps exactly 10 of the 70 pairs, one per order, because each order points at exactly one customer. Now the real query:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name, o.status, o.amount
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>name</th><th>status</th><th>amount</th></tr><tr><td>101</td><td>Asha</td><td>delivered</td><td>240.00</td></tr><tr><td>102</td><td>Ben</td><td>delivered</td><td>450.00</td></tr><tr><td>103</td><td>Chen</td><td>delivered</td><td>520.00</td></tr><tr><td>104</td><td>Asha</td><td>delivered</td><td>380.00</td></tr><tr><td>105</td><td>Dia</td><td>cancelled</td><td>310.00</td></tr><tr><td>106</td><td>Ben</td><td>delivered</td><td>180.00</td></tr><tr><td>107</td><td>Esha</td><td>cancelled</td><td>260.00</td></tr><tr><td>108</td><td>Chen</td><td>delivered</td><td>260.00</td></tr><tr><td>109</td><td>Farah</td><td>delivered</td><td>600.00</td></tr><tr><td>110</td><td>Asha</td><td>pending</td><td>310.00</td></tr></table>
  <p>Read the query from <code>FROM</code>. <code>orders o</code> gives the table a short alias, <code>o</code>. <code>JOIN customers c</code> brings in the second table with alias <code>c</code>. <code>ON c.customer_id = o.customer_id</code> is the matching rule. In the SELECT list, <code>o.order_id</code> and <code>c.name</code> say which table each column comes from (both tables have columns you could confuse, and <code>restaurants</code> even has its own <code>name</code>). The result has exactly the 10 kept pairs. Asha appears three times because she has three orders: a join returns one row per <em>matching pair</em>, not one per customer.</p>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600">
    <text x="100" y="16" text-anchor="middle" font-weight="bold">customers</text>
    <text x="480" y="16" text-anchor="middle" font-weight="bold">orders</text>
    <g font-size="11">
    <rect x="40" y="24" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="41" text-anchor="middle">1 Asha</text>
    <rect x="40" y="54" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="71" text-anchor="middle">2 Ben</text>
    <rect x="40" y="84" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="101" text-anchor="middle">3 Chen</text>
    <rect x="40" y="114" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="131" text-anchor="middle">4 Dia</text>
    <rect x="40" y="144" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="161" text-anchor="middle">5 Esha</text>
    <rect x="40" y="174" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="191" text-anchor="middle">6 Farah</text>
    <rect x="40" y="204" width="120" height="24" rx="5" class="fb sb"/><text x="100" y="221" text-anchor="middle">7 Gita</text>
    <rect x="420" y="24" width="120" height="19" rx="4" class="ft"/><text x="480" y="38" text-anchor="middle">101 · c1</text>
    <rect x="420" y="46" width="120" height="19" rx="4" class="ft"/><text x="480" y="60" text-anchor="middle">102 · c2</text>
    <rect x="420" y="68" width="120" height="19" rx="4" class="ft"/><text x="480" y="82" text-anchor="middle">103 · c3</text>
    <rect x="420" y="90" width="120" height="19" rx="4" class="ft"/><text x="480" y="104" text-anchor="middle">104 · c1</text>
    <rect x="420" y="112" width="120" height="19" rx="4" class="ft"/><text x="480" y="126" text-anchor="middle">105 · c4</text>
    <rect x="420" y="134" width="120" height="19" rx="4" class="ft"/><text x="480" y="148" text-anchor="middle">106 · c2</text>
    <rect x="420" y="156" width="120" height="19" rx="4" class="ft"/><text x="480" y="170" text-anchor="middle">107 · c5</text>
    <rect x="420" y="178" width="120" height="19" rx="4" class="ft"/><text x="480" y="192" text-anchor="middle">108 · c3</text>
    <rect x="420" y="200" width="120" height="19" rx="4" class="ft"/><text x="480" y="214" text-anchor="middle">109 · c6</text>
    <rect x="420" y="222" width="120" height="19" rx="4" class="ft"/><text x="480" y="236" text-anchor="middle">110 · c1</text>
    </g>
    <g stroke="currentColor" stroke-opacity="0.7"><line x1="160" y1="36" x2="420" y2="33"/><line x1="160" y1="36" x2="420" y2="99"/><line x1="160" y1="36" x2="420" y2="231"/><line x1="160" y1="66" x2="420" y2="55"/><line x1="160" y1="66" x2="420" y2="143"/><line x1="160" y1="96" x2="420" y2="77"/><line x1="160" y1="96" x2="420" y2="187"/><line x1="160" y1="126" x2="420" y2="121"/><line x1="160" y1="156" x2="420" y2="165"/><line x1="160" y1="186" x2="420" y2="209"/></g>
    <line x1="160" y1="216" x2="250" y2="216" stroke="currentColor" stroke-dasharray="4 3"/>
    <rect x="250" y="205" width="64" height="22" rx="5" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="282" y="220" text-anchor="middle" class="tm" font-size="11">NULL</text>
    <text x="320" y="220" font-size="10" class="tm">LEFT only</text>
  </svg><figcaption>Each line is one output row: 10 matched pairs (INNER). Gita has no line, so INNER drops her; a LEFT JOIN keeps her with a NULL partner (11 rows).</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>join</strong> combines rows of two tables into wider rows, using a condition in <code>ON</code>. <strong>INNER JOIN</strong> (plain <code>JOIN</code> means the same) returns only the pairs where ON is TRUE. Logically it is "all pairs, filtered by ON". The engine never really builds all pairs (section 10 shows what it does instead); the model is for predicting the <em>result</em>, especially the row count.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Venn diagrams</span>
    <p>The popular two-circle pictures suggest a join returns "a subset of rows". It returns <em>pairs</em>. One customer with three orders gives three rows, so the count can grow. Venns also cannot show CROSS joins, duplicate keys or NULL padding. Think "pairs + padding".</p>
  </div>
  <p>Why it matters: almost every report, dashboard and ML feature table is built from joins. A churn model needs customer columns next to order counts; a revenue chart needs order lines next to restaurant cuisines. Interviews ask a join in nearly every SQL round, usually with a twist on row counts or NULLs.</p>
  <div class="bridge"><b>What this still can't tell us → next: LEFT JOIN.</b> The INNER JOIN silently dropped Gita, because no order points at her. For "orders with their customer" that is right. For "every customer and how much they spent", where Gita must show 0, it is a bug. We need a join that keeps rows with no partner.</div>

  <h2 id="sj-left"><span class="num">02</span>Customers Vanished: LEFT JOIN</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Marketing wants "every customer with their orders, including people who never ordered" so they can send Gita a first-order coupon. An INNER JOIN can only return matched pairs, and Gita has none. How do we keep a row that found no partner?</p>
  </div>
  <p>A <strong>LEFT JOIN</strong> runs step 3 of the mental model: after keeping the matched pairs, it adds back every row of the <strong>left</strong> table (the one written before the word JOIN) that matched nothing, and fills the right table's columns with <strong>NULL</strong> (SQL's "no value").</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class teacher prints the report-card list from the register, not from the exam sheets. Every student gets a line. A student who missed the exam still gets a line, with the marks column left blank. The register is the left table; the blank is NULL.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT c.customer_id, c.name, o.order_id, o.amount
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>name</th><th>order_id</th><th>amount</th></tr><tr><td>1</td><td>Asha</td><td>101</td><td>240.00</td></tr><tr><td>1</td><td>Asha</td><td>104</td><td>380.00</td></tr><tr><td>1</td><td>Asha</td><td>110</td><td>310.00</td></tr><tr><td>2</td><td>Ben</td><td>102</td><td>450.00</td></tr><tr><td>2</td><td>Ben</td><td>106</td><td>180.00</td></tr><tr><td>3</td><td>Chen</td><td>103</td><td>520.00</td></tr><tr><td>3</td><td>Chen</td><td>108</td><td>260.00</td></tr><tr><td>4</td><td>Dia</td><td>105</td><td>310.00</td></tr><tr><td>5</td><td>Esha</td><td>107</td><td>260.00</td></tr><tr><td>6</td><td>Farah</td><td>109</td><td>600.00</td></tr><tr><td>7</td><td>Gita</td><td>NULL</td><td>NULL</td></tr></table>
  <p>11 rows = the 10 matched pairs + 1 padded row. Trace Gita: step 2 found no order with <code>customer_id = 7</code>; step 3 adds her row once, with <code>order_id</code> and <code>amount</code> set to NULL. Everyone else appears once per order, exactly as in the INNER JOIN.</p>
  <h3>Counting after a LEFT JOIN</h3>
  <p>The coupon list needs "orders per customer". Watch the two ways to count:</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       COUNT(*)          AS count_star,
       COUNT(o.order_id) AS count_orders,
       SUM(o.amount)     AS spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>count_star</th><th>count_orders</th><th>spend</th></tr><tr><td>Asha</td><td>3</td><td>3</td><td>930.00</td></tr><tr><td>Ben</td><td>2</td><td>2</td><td>630.00</td></tr><tr><td>Chen</td><td>2</td><td>2</td><td>780.00</td></tr><tr><td>Dia</td><td>1</td><td>1</td><td>310.00</td></tr><tr><td>Esha</td><td>1</td><td>1</td><td>260.00</td></tr><tr><td>Farah</td><td>1</td><td>1</td><td>600.00</td></tr><tr><td>Gita</td><td>1</td><td>0</td><td>NULL</td></tr></table>
  <p><code>COUNT(*)</code> counts rows, and Gita's padded row is a row, so she gets 1. <code>COUNT(o.order_id)</code> counts non-NULL values, so she gets the true 0. <code>SUM</code> of no values is NULL, not 0; wrap it as <code>COALESCE(SUM(o.amount), 0)</code> if the report needs a number. (These are the NULL rules from <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a>, now meeting padded rows.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>LEFT (OUTER) JOIN</strong>: all matched pairs, plus every left row with no match, its right-side columns set to NULL. The left table is the <strong>preserved</strong> side; the right table is the <strong>NULL-supplying</strong> side.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A LEFT JOIN does not give "one row per left row". It gives <em>at least</em> one. Asha still has three rows. If you need exactly one per customer, aggregate the right side first or use EXISTS (section 06).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: RIGHT and FULL JOIN.</b> LEFT keeps the lonely rows of the left table only. Momo Magic is a restaurant with no orders: lonely on the other side. And sometimes both lists have lonely rows, like days with orders but no signups and days with signups but no orders.</div>

  <h2 id="sj-types"><span class="num">03</span>RIGHT &amp; FULL JOIN</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>LEFT JOIN preserves one side. What if the side we must keep is written second, or if <em>both</em> sides have rows that must not be lost?</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper compares his sales diary with the target sheet from head office. INNER: only days on both pages. LEFT: every day in his diary. RIGHT: every day on the target sheet. FULL: every day on either page, with "nothing written" where one page was silent.</p>
  </div>
  <h3>RIGHT JOIN: every right row</h3>
  <p>"Every restaurant with its orders":</p>
  <div class="fx" data-lang="sql">SELECT r.name AS restaurant, o.order_id, o.amount
FROM orders o
RIGHT JOIN restaurants r ON r.restaurant_id = o.restaurant_id
ORDER BY r.restaurant_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant</th><th>order_id</th><th>amount</th></tr><tr><td>Dosa Hut</td><td>101</td><td>240.00</td></tr><tr><td>Dosa Hut</td><td>108</td><td>260.00</td></tr><tr><td>Dosa Hut</td><td>110</td><td>310.00</td></tr><tr><td>Biryani Bros</td><td>102</td><td>450.00</td></tr><tr><td>Biryani Bros</td><td>106</td><td>180.00</td></tr><tr><td>Biryani Bros</td><td>109</td><td>600.00</td></tr><tr><td>Pizza Point</td><td>103</td><td>520.00</td></tr><tr><td>Pizza Point</td><td>104</td><td>380.00</td></tr><tr><td>Pizza Point</td><td>107</td><td>260.00</td></tr><tr><td>Green Bowl</td><td>105</td><td>310.00</td></tr><tr><td>Momo Magic</td><td>NULL</td><td>NULL</td></tr></table>
  <p>11 rows: the 10 orders, each with its restaurant, plus Momo Magic padded with NULLs. The SELECT shows <code>r.name</code>, because the preserved side here is <code>restaurants</code>. Any RIGHT JOIN can be rewritten as a LEFT JOIN by swapping the table order (<code>FROM restaurants r LEFT JOIN orders o …</code> gives the same rows), so most teams never write RIGHT.</p>
  <h3>FULL JOIN: both sides</h3>
  <p>The growth team's daily March dashboard shows two metrics side by side: orders placed per day, and new signups per day. Each comes from a different table. Some days have orders and no signups, some have signups and no orders. First the two inputs:</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, COUNT(*) AS orders
FROM orders GROUP BY 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>Input A: orders per day</caption><tr><th>day</th><th>orders</th></tr><tr><td>2026-03-02</td><td>3</td></tr><tr><td>2026-03-03</td><td>2</td></tr><tr><td>2026-03-04</td><td>2</td></tr><tr><td>2026-03-05</td><td>2</td></tr><tr><td>2026-03-08</td><td>1</td></tr></table>
  <div class="fx" data-lang="sql">SELECT signup_date AS day, COUNT(*) AS signups
FROM customers WHERE signup_date &gt;= DATE '2026-03-01'
GROUP BY 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>Input B: March signups per day</caption><tr><th>day</th><th>signups</th></tr><tr><td>2026-03-01</td><td>1</td></tr><tr><td>2026-03-02</td><td>1</td></tr><tr><td>2026-03-04</td><td>1</td></tr></table>
  <p>Matching on <code>day</code>: Mar 2 and Mar 4 appear in both; Mar 3, 5 and 8 only in A; Mar 1 only in B. So INNER should give 2 rows, LEFT (A first) 5, RIGHT 3, FULL 6. Here is FULL, with the inputs written as CTEs (named sub-results, <code>WITH name AS (…)</code>, explained in <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>):</p>
  <div class="fx" data-lang="sql">WITH a AS (SELECT ordered_at::date AS day, COUNT(*) AS orders
           FROM orders GROUP BY 1),
     b AS (SELECT signup_date AS day, COUNT(*) AS signups
           FROM customers WHERE signup_date &gt;= DATE '2026-03-01' GROUP BY 1)
SELECT COALESCE(a.day, b.day) AS day, a.orders, b.signups
FROM a
FULL JOIN b ON b.day = a.day
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>orders</th><th>signups</th></tr><tr><td>2026-03-01</td><td>NULL</td><td>1</td></tr><tr><td>2026-03-02</td><td>3</td><td>1</td></tr><tr><td>2026-03-03</td><td>2</td><td>NULL</td></tr><tr><td>2026-03-04</td><td>2</td><td>1</td></tr><tr><td>2026-03-05</td><td>2</td><td>NULL</td></tr><tr><td>2026-03-08</td><td>1</td><td>NULL</td></tr></table>
  <p>Six rows: two matched days, Mar 1 padded on the left (no orders), Mar 3, 5 and 8 padded on the right (no signups). The key needs <code>COALESCE(a.day, b.day)</code>: <strong>COALESCE</strong> returns its first non-NULL argument, so each row shows whichever side has the day. A LEFT JOIN from either side would lose one kind of day. FULL plus COALESCE on the key is the standard reconciliation pattern (ledger vs bank statement, source vs warehouse row counts).</p>
  <p>All four counts at once, to check the prediction:</p>
  <div class="fx" data-lang="sql">WITH a AS (SELECT ordered_at::date AS day FROM orders GROUP BY 1),
     b AS (SELECT signup_date AS day FROM customers
           WHERE signup_date &gt;= DATE '2026-03-01' GROUP BY 1)
SELECT (SELECT COUNT(*) FROM a JOIN b USING (day))       AS inner_j,
       (SELECT COUNT(*) FROM a LEFT JOIN b USING (day))  AS left_j,
       (SELECT COUNT(*) FROM a RIGHT JOIN b USING (day)) AS right_j,
       (SELECT COUNT(*) FROM a FULL JOIN b USING (day))  AS full_j;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>inner_j</th><th>left_j</th><th>right_j</th><th>full_j</th></tr><tr><td>2</td><td>5</td><td>3</td><td>6</td></tr></table>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
    <g font-size="10">
    <text x="300" y="14" text-anchor="middle" class="tm">left = days with orders (2, 3, 4, 5, 8) · right = March signup days (1, 2, 4)</text>
    <text x="72" y="36" text-anchor="middle" font-weight="bold" class="tb">INNER · 2</text>
    <rect x="10" y="46" width="58" height="20" rx="3" class="fb"/><text x="39" y="60" text-anchor="middle">Mar 2</text><rect x="74" y="46" width="58" height="20" rx="3" class="fg"/><text x="103" y="60" text-anchor="middle">Mar 2</text>
    <rect x="10" y="70" width="58" height="20" rx="3" class="fb"/><text x="39" y="84" text-anchor="middle">Mar 4</text><rect x="74" y="70" width="58" height="20" rx="3" class="fg"/><text x="103" y="84" text-anchor="middle">Mar 4</text>
    <text x="222" y="36" text-anchor="middle" font-weight="bold" class="tb">LEFT · 5</text>
    <rect x="160" y="46" width="58" height="20" rx="3" class="fb"/><text x="189" y="60" text-anchor="middle">Mar 2</text><rect x="224" y="46" width="58" height="20" rx="3" class="fg"/><text x="253" y="60" text-anchor="middle">Mar 2</text>
    <rect x="160" y="70" width="58" height="20" rx="3" class="fb"/><text x="189" y="84" text-anchor="middle">Mar 3</text><rect x="224" y="70" width="58" height="20" rx="3" class="fs"/><text x="253" y="84" text-anchor="middle" class="tm">NULL</text>
    <rect x="160" y="94" width="58" height="20" rx="3" class="fb"/><text x="189" y="108" text-anchor="middle">Mar 4</text><rect x="224" y="94" width="58" height="20" rx="3" class="fg"/><text x="253" y="108" text-anchor="middle">Mar 4</text>
    <rect x="160" y="118" width="58" height="20" rx="3" class="fb"/><text x="189" y="132" text-anchor="middle">Mar 5</text><rect x="224" y="118" width="58" height="20" rx="3" class="fs"/><text x="253" y="132" text-anchor="middle" class="tm">NULL</text>
    <rect x="160" y="142" width="58" height="20" rx="3" class="fb"/><text x="189" y="156" text-anchor="middle">Mar 8</text><rect x="224" y="142" width="58" height="20" rx="3" class="fs"/><text x="253" y="156" text-anchor="middle" class="tm">NULL</text>
    <text x="372" y="36" text-anchor="middle" font-weight="bold" class="tb">RIGHT · 3</text>
    <rect x="310" y="46" width="58" height="20" rx="3" class="fs"/><text x="339" y="60" text-anchor="middle" class="tm">NULL</text><rect x="374" y="46" width="58" height="20" rx="3" class="fg"/><text x="403" y="60" text-anchor="middle">Mar 1</text>
    <rect x="310" y="70" width="58" height="20" rx="3" class="fb"/><text x="339" y="84" text-anchor="middle">Mar 2</text><rect x="374" y="70" width="58" height="20" rx="3" class="fg"/><text x="403" y="84" text-anchor="middle">Mar 2</text>
    <rect x="310" y="94" width="58" height="20" rx="3" class="fb"/><text x="339" y="108" text-anchor="middle">Mar 4</text><rect x="374" y="94" width="58" height="20" rx="3" class="fg"/><text x="403" y="108" text-anchor="middle">Mar 4</text>
    <text x="522" y="36" text-anchor="middle" font-weight="bold" class="tb">FULL · 6</text>
    <rect x="460" y="46" width="58" height="20" rx="3" class="fs"/><text x="489" y="60" text-anchor="middle" class="tm">NULL</text><rect x="524" y="46" width="58" height="20" rx="3" class="fg"/><text x="553" y="60" text-anchor="middle">Mar 1</text>
    <rect x="460" y="70" width="58" height="20" rx="3" class="fb"/><text x="489" y="84" text-anchor="middle">Mar 2</text><rect x="524" y="70" width="58" height="20" rx="3" class="fg"/><text x="553" y="84" text-anchor="middle">Mar 2</text>
    <rect x="460" y="94" width="58" height="20" rx="3" class="fb"/><text x="489" y="108" text-anchor="middle">Mar 3</text><rect x="524" y="94" width="58" height="20" rx="3" class="fs"/><text x="553" y="108" text-anchor="middle" class="tm">NULL</text>
    <rect x="460" y="118" width="58" height="20" rx="3" class="fb"/><text x="489" y="132" text-anchor="middle">Mar 4</text><rect x="524" y="118" width="58" height="20" rx="3" class="fg"/><text x="553" y="132" text-anchor="middle">Mar 4</text>
    <rect x="460" y="142" width="58" height="20" rx="3" class="fb"/><text x="489" y="156" text-anchor="middle">Mar 5</text><rect x="524" y="142" width="58" height="20" rx="3" class="fs"/><text x="553" y="156" text-anchor="middle" class="tm">NULL</text>
    <rect x="460" y="166" width="58" height="20" rx="3" class="fb"/><text x="489" y="180" text-anchor="middle">Mar 8</text><rect x="524" y="166" width="58" height="20" rx="3" class="fs"/><text x="553" y="180" text-anchor="middle" class="tm">NULL</text>
    <text x="300" y="210" text-anchor="middle" class="tm">matched pairs always survive; outer joins add the unmatched side and fill the other with NULL</text>
    </g>
  </svg><figcaption>The four outer/inner variants on the same two lists of days. Only the set of lonely rows that is added back changes.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Outer join</strong> = LEFT, RIGHT or FULL: a join that keeps unmatched rows from one or both sides. <strong>RIGHT JOIN</strong> preserves the second table; <strong>FULL JOIN</strong> preserves both. Rows count: INNER ≤ LEFT, RIGHT ≤ FULL.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: engines differ</span>
    <p>PostgreSQL and DuckDB support RIGHT and FULL. SQLite only added them in version 3.39 (2022); the FULL JOIN above runs unchanged in SQLite 3.45 here. MySQL still has no FULL JOIN (not tested here); the usual workaround is a LEFT JOIN UNION a RIGHT JOIN. Always <code>COALESCE</code> the key after FULL, or half the rows show a NULL key.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT COALESCE(a.day, b.day) AS day, a.orders, b.signups
FROM (SELECT date(ordered_at) AS day, COUNT(*) AS orders FROM orders GROUP BY 1) a
FULL JOIN (SELECT signup_date AS day, COUNT(*) AS signups FROM customers
           WHERE signup_date &gt;= '2026-03-01' GROUP BY 1) b ON b.day = a.day
ORDER BY 1;</div>
  <table class="tbl out"><caption>Same FULL JOIN, run in SQLite 3.45 (dates stored as text there)</caption><tr><th>day</th><th>orders</th><th>signups</th></tr><tr><td>2026-03-01</td><td>NULL</td><td>1</td></tr><tr><td>2026-03-02</td><td>3</td><td>1</td></tr><tr><td>2026-03-03</td><td>2</td><td>NULL</td></tr><tr><td>2026-03-04</td><td>2</td><td>1</td></tr><tr><td>2026-03-05</td><td>2</td><td>NULL</td></tr><tr><td>2026-03-08</td><td>1</td><td>NULL</td></tr></table>
  <div class="bridge"><b>What this still can't tell us → next: CROSS JOIN.</b> Every join so far needs a matching key, and outer joins only rescue rows that <em>exist</em> on some side. A status board needs "Momo Magic, delivered: 0", a combination that exists in no table at all.</div>

  <h2 id="sj-cross"><span class="num">04</span>CROSS JOIN: Every Combination</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Operations wants a board with one cell per restaurant per status (delivered, cancelled, pending), showing 0 where nothing happened. GROUP BY on orders only produces combinations that occurred: 6 of the 15. The empty cells are not rows anywhere, so no outer join can rescue them.</p>
  </div>
  <p>A <strong>CROSS JOIN</strong> has no ON. It pairs every left row with every right row: step 1 of the mental model with nothing filtered. 5 restaurants × 3 statuses = 15 rows, whether or not any order exists.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant menu card that lists every size for every dosa: plain, masala, rava × small, large. Six lines, whether or not anyone ordered a small rava today. That full list is a cross join.</p>
  </div>
  <p>First, what GROUP BY alone gives:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, status, COUNT(*) AS n
FROM orders GROUP BY 1, 2 ORDER BY 1, 2;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant_id</th><th>status</th><th>n</th></tr><tr><td>10</td><td>delivered</td><td>2</td></tr><tr><td>10</td><td>pending</td><td>1</td></tr><tr><td>11</td><td>delivered</td><td>3</td></tr><tr><td>12</td><td>cancelled</td><td>1</td></tr><tr><td>12</td><td>delivered</td><td>2</td></tr><tr><td>13</td><td>cancelled</td><td>1</td></tr></table>
  <p>Six cells. Now build the full grid and LEFT JOIN those counts onto it. <code>(VALUES ('delivered'), ('cancelled'), ('pending')) AS s(status)</code> is a tiny inline table with 3 rows and one column named <code>status</code>.</p>
  <div class="fx" data-lang="sql">WITH grid AS (
  SELECT r.restaurant_id, r.name, s.status
  FROM restaurants r
  CROSS JOIN (VALUES ('delivered'), ('cancelled'), ('pending')) AS s(status)
),
counts AS (
  SELECT restaurant_id, status, COUNT(*) AS n
  FROM orders GROUP BY restaurant_id, status
)
SELECT g.name, g.status, COALESCE(c.n, 0) AS orders
FROM grid g
LEFT JOIN counts c ON c.restaurant_id = g.restaurant_id AND c.status = g.status
ORDER BY g.restaurant_id, g.status;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>status</th><th>orders</th></tr><tr><td>Dosa Hut</td><td>cancelled</td><td>0</td></tr><tr><td>Dosa Hut</td><td>delivered</td><td>2</td></tr><tr><td>Dosa Hut</td><td>pending</td><td>1</td></tr><tr><td>Biryani Bros</td><td>cancelled</td><td>0</td></tr><tr><td>Biryani Bros</td><td>delivered</td><td>3</td></tr><tr><td>Biryani Bros</td><td>pending</td><td>0</td></tr><tr><td>Pizza Point</td><td>cancelled</td><td>1</td></tr><tr><td>Pizza Point</td><td>delivered</td><td>2</td></tr><tr><td>Pizza Point</td><td>pending</td><td>0</td></tr><tr><td>Green Bowl</td><td>cancelled</td><td>1</td></tr><tr><td>Green Bowl</td><td>delivered</td><td>0</td></tr><tr><td>Green Bowl</td><td>pending</td><td>0</td></tr><tr><td>Momo Magic</td><td>cancelled</td><td>0</td></tr><tr><td>Momo Magic</td><td>delivered</td><td>0</td></tr><tr><td>Momo Magic</td><td>pending</td><td>0</td></tr></table>
  <p>Step by step: <code>grid</code> holds all 15 combinations. <code>counts</code> holds the 6 that happened. The LEFT JOIN keeps all 15 grid rows, matching on <em>both</em> restaurant and status, and <code>COALESCE(c.n, 0)</code> turns the 9 NULLs into 0. Momo Magic shows three zeros. This "grid, then LEFT JOIN the facts" shape is used for heatmaps, cohort tables and any time series that must show empty days.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>CROSS JOIN</strong>: the Cartesian product, m × n rows, no condition. <code>FROM a CROSS JOIN b</code> is the same as <code>FROM a, b</code> with no WHERE linking them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the ON condition (or writing <code>FROM a, b</code> with no WHERE) is an accidental cross join. 1 million × 1 million rows = 10<sup>12</sup> rows and a dead query. If a result is suddenly huge, look for a missing join condition first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SELF JOIN.</b> Every join so far paired two <em>different</em> tables. But <code>customers.referred_by</code> points at another row of <code>customers</code>. "Who referred Farah?" needs a table to meet itself.</div>

  <h2 id="sj-self"><span class="num">05</span>SELF JOIN: A Table Meets Itself</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Farah's row says <code>referred_by = 2</code>. To print "Farah was referred by Ben", we must look up row 2 in the very table we are already reading. A join so far always brought in a second table.</p>
  </div>
  <p>The trick: use the table twice, with two different aliases, and treat them as two separate tables. <code>c</code> is "the customer", <code>r</code> is "the referrer". Trace Farah: her <code>referred_by</code> is 2, the row in <code>r</code> with <code>customer_id</code> 2 is Ben, so the pair is (Farah, Ben).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hostel register lists each student and the roll number of their "local guardian" senior, who is also in the same register. To print guardian names, the warden opens the register twice: one finger on the student, one finger flipping to the senior's page.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT c.name AS customer, r.name AS referred_by
FROM customers c
LEFT JOIN customers r ON r.customer_id = c.referred_by
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer</th><th>referred_by</th></tr><tr><td>Asha</td><td>NULL</td></tr><tr><td>Ben</td><td>Asha</td></tr><tr><td>Chen</td><td>Asha</td></tr><tr><td>Dia</td><td>NULL</td></tr><tr><td>Esha</td><td>NULL</td></tr><tr><td>Farah</td><td>Ben</td></tr><tr><td>Gita</td><td>NULL</td></tr></table>
  <p>LEFT keeps the four customers nobody referred (their <code>referred_by</code> is NULL, and NULL matches nothing). With INNER only Ben, Chen and Farah would remain.</p>
  <h3>Pairs of rows: "customers in the same city"</h3>
  <p>A self join also finds pairs. For Mumbai customers (Ben, Dia, Farah), a first attempt joins on city only:</p>
  <div class="fx" data-lang="sql">SELECT a.name AS c1, b.name AS c2
FROM customers a
JOIN customers b ON b.city = a.city
WHERE a.city = 'Mumbai'
ORDER BY a.customer_id, b.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>c1</th><th>c2</th></tr><tr><td>Ben</td><td>Ben</td></tr><tr><td>Ben</td><td>Dia</td></tr><tr><td>Ben</td><td>Farah</td></tr><tr><td>Dia</td><td>Ben</td></tr><tr><td>Dia</td><td>Dia</td></tr><tr><td>Dia</td><td>Farah</td></tr><tr><td>Farah</td><td>Ben</td></tr><tr><td>Farah</td><td>Dia</td></tr><tr><td>Farah</td><td>Farah</td></tr></table>
  <p>Nine rows of noise: everyone pairs with themselves (Ben–Ben) and each real pair appears twice in mirror order (Ben–Dia, Dia–Ben). 3 × 3 = 9. Adding <code>a.customer_id &lt; b.customer_id</code> keeps each unordered pair once: it removes self pairs (2 &lt; 2 is false) and mirrors (4 &lt; 2 is false).</p>
  <div class="fx" data-lang="sql">SELECT a.city, a.name AS c1, b.name AS c2
FROM customers a
JOIN customers b ON b.city = a.city AND a.customer_id &lt; b.customer_id
ORDER BY a.city, a.customer_id, b.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>city</th><th>c1</th><th>c2</th></tr><tr><td>Mumbai</td><td>Ben</td><td>Dia</td></tr><tr><td>Mumbai</td><td>Ben</td><td>Farah</td></tr><tr><td>Mumbai</td><td>Dia</td><td>Farah</td></tr><tr><td>Pune</td><td>Asha</td><td>Chen</td></tr><tr><td>Pune</td><td>Asha</td><td>Gita</td></tr><tr><td>Pune</td><td>Chen</td><td>Gita</td></tr></table>
  <p>Three pairs per city, 3 choose 2 = 3. Esha (city NULL) pairs with nobody, not even herself, because <code>NULL = NULL</code> is UNKNOWN.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SELF JOIN</strong>: not a separate keyword, just any join where both sides are the same table under different aliases. Used for hierarchies (referrer, manager), comparisons between rows (pairs, "earns more than their manager") and sequences.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A self join follows <em>one</em> level of the referral chain. Farah → Ben is one join; Farah → Ben → Asha needs a second join, and an unknown depth needs a recursive CTE (<a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: semi and anti joins.</b> We can pair any rows now. But for a yes/no question, "which customers have ordered?", a join repeats Asha once per order, and "which have <em>never</em> ordered?" is not a pairing question at all.</div>

  <h2 id="sj-semi"><span class="num">06</span>Semi &amp; Anti Joins: EXISTS / NOT EXISTS</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want customers <em>who have</em> orders (one row each), and customers <em>with no</em> orders. We need no columns from <code>orders</code>, only a yes or no. The joins so far return pairs.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result: 10 rows, customers repeated</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Asha</td></tr><tr><td>Asha</td></tr><tr><td>Ben</td></tr><tr><td>Ben</td></tr><tr><td>Chen</td></tr><tr><td>Chen</td></tr><tr><td>Dia</td></tr><tr><td>Esha</td></tr><tr><td>Farah</td></tr></table>
  <p>The JOIN repeats each customer once per order: Asha three times. A <code>COUNT(*)</code> on this says 10 "customers who ordered". DISTINCT hides the symptom but costs a sort. The precise tool is <code>EXISTS</code>, a <strong>semi-join</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A society watchman asks "does flat 302 have any parcel today?" He needs a yes or no, so he stops looking at the first parcel. He does not bring you one copy of the flat number per parcel. EXISTS is the watchman.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Ben</td></tr><tr><td>Chen</td></tr><tr><td>Dia</td></tr><tr><td>Esha</td></tr><tr><td>Farah</td></tr></table>
  <p>For each customer row, the inner query <code>SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id</code> is checked. <code>SELECT 1</code> is a convention: EXISTS only cares whether at least one row comes back. Asha has three orders, but EXISTS stops at the first and returns TRUE once. Gita has none, so EXISTS is FALSE and she is filtered out.</p>
  <h3>Anti-join: who has none?</h3>
  <p>Two correct forms. Both return Gita.</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Gita</td></tr></table>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th></tr><tr><td>Gita</td><td>NULL</td></tr></table>
  <p>The second form works because of padding: Gita is the only customer whose LEFT JOIN row has <code>o.order_id</code> = NULL. Test a column that can never be NULL in a real match (a primary key like <code>order_id</code>), otherwise a real row with a NULL value would be mistaken for "no match". (Testing <code>o.delivery_minutes IS NULL</code> would wrongly add Asha, Dia and Esha.)</p>
  <h3>The NOT IN + NULL trap</h3>
  <p>Task: customers who have referred nobody. The natural English is "customer_id not in the list of referred_by values". Here is that list:</p>
  <div class="fx" data-lang="sql">SELECT referred_by FROM customers ORDER BY customer_id;</div>
  <table class="tbl out"><caption>the list (one value per customer)</caption><tr><th>referred_by</th></tr><tr><td>NULL</td></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>NULL</td></tr><tr><td>NULL</td></tr><tr><td>2</td></tr><tr><td>NULL</td></tr></table>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);</div>
  <table class="tbl out"><caption>Result: 0 rows</caption><tr><th>name</th></tr></table>
  <p>Zero rows, no error. Trace Chen (customer_id 3): <code>3 NOT IN (NULL, 1, 1, NULL, NULL, 2, NULL)</code> means <code>3 &lt;&gt; NULL AND 3 &lt;&gt; 1 AND 3 &lt;&gt; 1 AND … AND 3 &lt;&gt; 2 AND …</code>. Every comparison with NULL is UNKNOWN (SQL's third truth value: "can't tell"). TRUE AND UNKNOWN is UNKNOWN, and WHERE keeps only TRUE. So every customer is dropped. NOT EXISTS has no such problem, because it only asks whether a matching row exists:</p>
  <div class="fx" data-lang="sql">SELECT c.name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM customers x WHERE x.referred_by = c.customer_id)
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Chen</td></tr><tr><td>Dia</td></tr><tr><td>Esha</td></tr><tr><td>Farah</td></tr><tr><td>Gita</td></tr></table>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers WHERE referred_by IS NOT NULL)
ORDER BY customer_id;</div>
  <table class="tbl out"><caption>Also correct: remove NULLs inside</caption><tr><th>name</th></tr><tr><td>Chen</td></tr><tr><td>Dia</td></tr><tr><td>Esha</td></tr><tr><td>Farah</td></tr><tr><td>Gita</td></tr></table>
  <p>Five customers: Asha (referred Ben and Chen) and Ben (referred Farah) are the only referrers. The same NULL logic is identical in every SQL engine; this query returns 0 rows in DuckDB too:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);</div>
  <table class="tbl out"><caption>Result in DuckDB: 0 rows</caption><tr><th>name</th></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Semi-join</strong>: return each left row at most once if <em>any</em> right row matches (EXISTS, IN). <strong>Anti-join</strong>: return each left row only if <em>no</em> right row matches (NOT EXISTS, LEFT JOIN … IS NULL). The optimizer runs both as special joins that stop at the first match.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One NULL in a <code>NOT IN</code> list empties the result. Default to <code>NOT EXISTS</code>. <code>IN</code> is safe; only the negated form breaks. "Customers who never ordered" with NOT IN happens to work today only because <code>orders.customer_id</code> is declared NOT NULL.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ON vs WHERE.</b> We now have every join shape. Back to outer joins with one more condition: "every customer with their <em>delivered</em> orders". Where does <code>status = 'delivered'</code> go? It matters more than it looks.</div>

  <h2 id="sj-onwhere"><span class="num">07</span>ON vs WHERE in Outer Joins</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A LEFT JOIN promises to keep every customer. But a report usually adds a filter. For an INNER JOIN it does not matter whether a condition sits in ON or in WHERE. For a LEFT JOIN, does it?</p>
  </div>
  <p>Goal: "every customer, with their delivered orders (if any)". The first try puts the status filter in WHERE:</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'delivered'
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>status</th></tr><tr><td>Asha</td><td>101</td><td>delivered</td></tr><tr><td>Asha</td><td>104</td><td>delivered</td></tr><tr><td>Ben</td><td>102</td><td>delivered</td></tr><tr><td>Ben</td><td>106</td><td>delivered</td></tr><tr><td>Chen</td><td>103</td><td>delivered</td></tr><tr><td>Chen</td><td>108</td><td>delivered</td></tr><tr><td>Farah</td><td>109</td><td>delivered</td></tr></table>
  <p>Dia, Esha and Gita vanished. Trace it in the order the database works: the LEFT JOIN first builds the 11 rows of section 02, then WHERE tests each one.</p>
  <table class="tbl"><caption>Trace: LEFT JOIN first, then WHERE</caption>
    <tr><th>after LEFT JOIN</th><th>status</th><th>WHERE status = 'delivered'</th></tr>
    <tr><td>Asha · 101, 104</td><td>delivered</td><td>TRUE → keep</td></tr>
    <tr><td>Asha · 110</td><td>pending</td><td>FALSE → drop</td></tr>
    <tr><td>Ben · 102, 106</td><td>delivered</td><td>TRUE → keep</td></tr>
    <tr><td>Chen · 103, 108</td><td>delivered</td><td>TRUE → keep</td></tr>
    <tr><td>Dia · 105</td><td>cancelled</td><td>FALSE → drop (Dia gone)</td></tr>
    <tr><td>Esha · 107</td><td>cancelled</td><td>FALSE → drop (Esha gone)</td></tr>
    <tr><td>Farah · 109</td><td>delivered</td><td>TRUE → keep</td></tr>
    <tr><td>Gita · NULL</td><td>NULL</td><td>UNKNOWN → drop (Gita gone)</td></tr>
  </table>
  <p>WHERE runs <em>after</em> the join, on every row including Gita's padded one. <code>NULL = 'delivered'</code> is UNKNOWN, so she goes. The LEFT JOIN has silently become an INNER JOIN: same 7 rows as <code>JOIN … WHERE</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding caterer must seat every guest (LEFT). ON is the rule for which plates go to which guest: "only veg plates for this table". If no veg plate fits, the guest still sits with an empty plate. WHERE is a bouncer at the door after seating: "throw out anyone without a veg plate". Same rule, very different hall.</p>
  </div>
  <p>Move the filter into ON. Now it only decides which orders <em>count as a match</em>; every customer is still kept.</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND o.status = 'delivered'
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>status</th></tr><tr><td>Asha</td><td>101</td><td>delivered</td></tr><tr><td>Asha</td><td>104</td><td>delivered</td></tr><tr><td>Ben</td><td>102</td><td>delivered</td></tr><tr><td>Ben</td><td>106</td><td>delivered</td></tr><tr><td>Chen</td><td>103</td><td>delivered</td></tr><tr><td>Chen</td><td>108</td><td>delivered</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td></tr><tr><td>Esha</td><td>NULL</td><td>NULL</td></tr><tr><td>Farah</td><td>109</td><td>delivered</td></tr><tr><td>Gita</td><td>NULL</td><td>NULL</td></tr></table>
  <p>Ten rows. Dia's and Esha's only orders are cancelled, so under the new ON rule they have no match and get padded rows, like Gita. Asha's pending order 110 simply stops matching. The report the business wanted:</p>
  <div class="fx" data-lang="sql">SELECT c.name, COUNT(o.order_id) AS delivered_orders,
       COALESCE(SUM(o.amount), 0) AS delivered_spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND o.status = 'delivered'
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>delivered_orders</th><th>delivered_spend</th></tr><tr><td>Asha</td><td>2</td><td>620.00</td></tr><tr><td>Ben</td><td>2</td><td>630.00</td></tr><tr><td>Chen</td><td>2</td><td>780.00</td></tr><tr><td>Dia</td><td>0</td><td>0</td></tr><tr><td>Esha</td><td>0</td><td>0</td></tr><tr><td>Farah</td><td>1</td><td>600.00</td></tr><tr><td>Gita</td><td>0</td><td>0</td></tr></table>
  <h3>The opposite mistake: a left-table filter in ON</h3>
  <p>Conditions on the <em>left</em> table do not filter in ON. They only stop matches:</p>
  <div class="fx" data-lang="sql">SELECT c.name, c.city, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND c.city = 'Pune'
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>city</th><th>order_id</th></tr><tr><td>Asha</td><td>Pune</td><td>101</td></tr><tr><td>Asha</td><td>Pune</td><td>104</td></tr><tr><td>Asha</td><td>Pune</td><td>110</td></tr><tr><td>Ben</td><td>Mumbai</td><td>NULL</td></tr><tr><td>Chen</td><td>Pune</td><td>103</td></tr><tr><td>Chen</td><td>Pune</td><td>108</td></tr><tr><td>Dia</td><td>Mumbai</td><td>NULL</td></tr><tr><td>Esha</td><td>NULL</td><td>NULL</td></tr><tr><td>Farah</td><td>Mumbai</td><td>NULL</td></tr><tr><td>Gita</td><td>Pune</td><td>NULL</td></tr></table>
  <p>We wanted Pune customers only, but Ben, Dia, Esha and Farah are still there, with no orders attached. A LEFT JOIN never removes a left row; only WHERE can. So <code>c.city = 'Pune'</code> belongs in WHERE.</p>
  <div class="callout intu"><span class="label">Rule</span>
    <p>Conditions on the <strong>right</strong> (optional) table go in <strong>ON</strong>. Conditions on the <strong>left</strong> (preserved) table go in <strong>WHERE</strong>. The one deliberate exception is <code>WHERE right.key IS NULL</code>, the anti-join from section 06.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>In an outer join, <strong>ON</strong> decides which pairs match <em>before</em> padding; <strong>WHERE</strong> filters the finished rows <em>after</em> padding. For INNER JOIN the two are equivalent.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Any WHERE test on a right-table column that NULL fails (<code>=</code>, <code>&gt;</code>, <code>LIKE</code>, <code>IN</code>) cancels the LEFT JOIN. Code reviewers look for exactly this pattern.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: fan-out.</b> The rows are now right: every customer, the right orders. But joins also change how many times a <em>value</em> appears. Sum an order's amount after joining its lines and the totals are wrong.</div>

  <h2 id="sj-fan"><span class="num">08</span>Fan-out: SUM After a Join</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Finance wants spend per customer <em>and</em> number of items bought, so they join customers → orders → order_items and sum. Nothing errors. Are the numbers right?</p>
  </div>
  <div class="fx" data-lang="sql">SELECT c.name,
       SUM(o.amount)   AS spend_wrong,
       COUNT(*)        AS rows_after_join,
       SUM(oi.qty)     AS items
FROM customers c
JOIN orders o       ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend_wrong</th><th>rows_after_join</th><th>items</th></tr><tr><td>Asha</td><td>1620.00</td><td>5</td><td>7</td></tr><tr><td>Ben</td><td>1080.00</td><td>3</td><td>4</td></tr><tr><td>Chen</td><td>1040.00</td><td>3</td><td>5</td></tr><tr><td>Dia</td><td>310.00</td><td>1</td><td>1</td></tr><tr><td>Esha</td><td>260.00</td><td>1</td><td>1</td></tr><tr><td>Farah</td><td>1200.00</td><td>2</td><td>2</td></tr></table>
  <p>Asha really spent 240 + 380 + 310 = 930 (section 02). The query says 1620. To see why, look at her rows <em>before</em> GROUP BY:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.amount, oi.item, oi.qty, oi.unit_price
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.customer_id = 1
ORDER BY o.order_id, oi.item;</div>
  <table class="tbl out"><caption>Asha's rows after the join: 3 orders became 5 rows</caption><tr><th>order_id</th><th>amount</th><th>item</th><th>qty</th><th>unit_price</th></tr><tr><td>101</td><td>240.00</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr><tr><td>104</td><td>380.00</td><td>Garlic Bread</td><td>1</td><td>100.00</td></tr><tr><td>104</td><td>380.00</td><td>Margherita</td><td>1</td><td>280.00</td></tr><tr><td>110</td><td>310.00</td><td>Filter Coffee</td><td>1</td><td>70.00</td></tr><tr><td>110</td><td>310.00</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr></table>
  <table class="tbl"><caption>Trace: SUM(o.amount) over those 5 rows</caption>
    <tr><th>order</th><th>lines</th><th>amount repeated</th><th>contributes</th></tr>
    <tr><td>101</td><td>1</td><td>240 × 1</td><td>240</td></tr>
    <tr><td>104</td><td>2 (Garlic Bread, Margherita)</td><td>380 × 2</td><td>760</td></tr>
    <tr><td>110</td><td>2 (Filter Coffee, Masala Dosa)</td><td>310 × 2</td><td>620</td></tr>
    <tr><td colspan="3"><strong>total</strong></td><td><strong>1620</strong> (true: 930)</td></tr>
  </table>
  <p><code>amount</code> is a fact about an <em>order</em>. After joining lines, each row is an <em>order line</em>, so an order's amount is copied onto each of its lines and summed once per copy. Every 2-line order is double counted. Ben (102 has 2 lines) shows 1080 instead of 630; Chen (108) 1040 instead of 780; Farah 1200 instead of 600; Dia and Esha are right by luck (one line each). <code>SUM(oi.qty)</code> is correct, because qty <em>is</em> a line-level fact.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A canteen bill for ₹380 has two items. If the accountant writes the bill total next to each item and then adds the column, he books ₹760. The total belongs to the bill, not to the items.</p>
  </div>
  <p>The <strong>grain</strong> of a table is "what one row means". <code>orders</code> has grain "one order"; orders-joined-to-items has grain "one order line". The rule: <strong>sum a measure only at its own grain</strong>. Three correct versions:</p>
  <div class="fx" data-lang="sql">WITH items AS (                       -- 1. aggregate lines to one row per order
  SELECT order_id, SUM(qty) AS items
  FROM order_items GROUP BY order_id
)
SELECT c.name,
       SUM(o.amount) AS spend,                 -- now each order appears once
       SUM(i.items)  AS items,
       (SELECT SUM(oi.qty * oi.unit_price)     -- 2. or sum at line grain
          FROM orders o2 JOIN order_items oi USING (order_id)
         WHERE o2.customer_id = c.customer_id) AS spend_from_lines
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
JOIN items i  ON i.order_id = o.order_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th><th>items</th><th>spend_from_lines</th></tr><tr><td>Asha</td><td>930.00</td><td>7</td><td>930.00</td></tr><tr><td>Ben</td><td>630.00</td><td>4</td><td>630.00</td></tr><tr><td>Chen</td><td>780.00</td><td>5</td><td>780.00</td></tr><tr><td>Dia</td><td>310.00</td><td>1</td><td>310.00</td></tr><tr><td>Esha</td><td>260.00</td><td>1</td><td>260.00</td></tr><tr><td>Farah</td><td>600.00</td><td>2</td><td>600.00</td></tr></table>
  <p><code>items</code> has exactly one row per order, so joining it to <code>orders</code> cannot multiply anything: Asha's spend is 930 again, with her 7 items. The scalar subquery shows the second fix, summing <code>qty × unit_price</code>, a line-level measure, at line grain: also 930 (Biteful stores <code>amount</code> as exactly that sum). A third fix is simply not to join lines when you only need <code>amount</code>.</p>
  <h3>Two children of one parent</h3>
  <p>The worst fan-out joins one parent to <em>two independent</em> one-to-many children. Growth wants each customer's spend and how many people they referred:</p>
  <div class="fx" data-lang="sql">SELECT c.name,
       SUM(o.amount)        AS spend,
       COUNT(x.customer_id) AS referrals
FROM customers c
LEFT JOIN orders o    ON o.customer_id = c.customer_id
LEFT JOIN customers x ON x.referred_by = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th><th>referrals</th></tr><tr><td>Asha</td><td>1860.00</td><td>6</td></tr><tr><td>Ben</td><td>630.00</td><td>2</td></tr><tr><td>Chen</td><td>780.00</td><td>0</td></tr><tr><td>Dia</td><td>310.00</td><td>0</td></tr><tr><td>Esha</td><td>260.00</td><td>0</td></tr><tr><td>Farah</td><td>600.00</td><td>0</td></tr><tr><td>Gita</td><td>NULL</td><td>0</td></tr></table>
  <p>Asha: 3 orders × 2 referrals (Ben, Chen) = 6 rows, so spend doubles to 1860 and referrals triples to 6. There is no rule linking an order to a referral, so every order pairs with every referral: a per-customer cross join. Ben: 2 orders × 1 referral, so his spend survives but his referral count doubles to 2. The fix is the same principle: bring each child to one row per customer, then join.</p>
  <div class="fx" data-lang="sql">WITH spend AS (SELECT customer_id, SUM(amount) AS spend
               FROM orders GROUP BY customer_id),
     refs  AS (SELECT referred_by AS customer_id, COUNT(*) AS referrals
               FROM customers WHERE referred_by IS NOT NULL GROUP BY referred_by)
SELECT c.name, COALESCE(s.spend, 0) AS spend, COALESCE(r.referrals, 0) AS referrals
FROM customers c
LEFT JOIN spend s ON s.customer_id = c.customer_id
LEFT JOIN refs  r ON r.customer_id = c.customer_id
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>spend</th><th>referrals</th></tr><tr><td>Asha</td><td>930.00</td><td>2</td></tr><tr><td>Ben</td><td>630.00</td><td>1</td></tr><tr><td>Chen</td><td>780.00</td><td>0</td></tr><tr><td>Dia</td><td>310.00</td><td>0</td></tr><tr><td>Esha</td><td>260.00</td><td>0</td></tr><tr><td>Farah</td><td>600.00</td><td>0</td></tr><tr><td>Gita</td><td>0</td><td>0</td></tr></table>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <g font-size="10">
    <text x="165" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tr">Join both children directly</text>
    <rect x="15" y="36" width="105" height="26" rx="4" class="fb"/><text x="67" y="53" text-anchor="middle">101 · 240</text><rect x="15" y="80" width="105" height="26" rx="4" class="fb"/><text x="67" y="97" text-anchor="middle">104 · 380</text><rect x="15" y="124" width="105" height="26" rx="4" class="fb"/><text x="67" y="141" text-anchor="middle">110 · 310</text><rect x="225" y="58" width="90" height="26" rx="4" class="fv"/><text x="270" y="75" text-anchor="middle">referred Ben</text><rect x="225" y="102" width="90" height="26" rx="4" class="fv"/><text x="270" y="119" text-anchor="middle">referred Chen</text><g class="sr" stroke-opacity="0.8"><line x1="120" y1="49" x2="225" y2="71"/><line x1="120" y1="49" x2="225" y2="115"/><line x1="120" y1="93" x2="225" y2="71"/><line x1="120" y1="93" x2="225" y2="115"/><line x1="120" y1="137" x2="225" y2="71"/><line x1="120" y1="137" x2="225" y2="115"/></g>
    <text x="165" y="176" text-anchor="middle" font-size="11" class="tr">3 × 2 = 6 rows → spend 1860 ✗</text>
    <line x1="340" y1="10" x2="340" y2="180" stroke="currentColor" stroke-dasharray="4 4" opacity="0.4"/>
    <text x="470" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tg">Aggregate first</text>
    <rect x="360" y="76" width="100" height="34" rx="6" class="fb sb"/><text x="410" y="97" text-anchor="middle">spend 930</text>
    <rect x="490" y="76" width="100" height="34" rx="6" class="fv"/><text x="540" y="97" text-anchor="middle">referrals 2</text>
    <line x1="460" y1="93" x2="490" y2="93" class="sg" stroke-width="2"/>
    <text x="470" y="176" text-anchor="middle" font-size="11" class="tg">1 × 1 = 1 row ✓</text>
    </g>
  </svg><figcaption>Asha's 3 orders each pair with both referrals. Pre-aggregating each child to one row per customer removes the multiplication.</figcaption></figure>
  <p>A cheap habit that catches fan-out: count rows after each join. If the count grows when you did not expect it to, stop.</p>
  <div class="fx" data-lang="sql">SELECT
  (SELECT COUNT(*) FROM customers)                               AS step0_customers,
  (SELECT COUNT(*) FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.customer_id)        AS step1_orders,
  (SELECT COUNT(*) FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.customer_id
     LEFT JOIN customers x ON x.referred_by = c.customer_id)     AS step2_referrals;</div>
  <table class="tbl out"><caption>Row counts after each join step</caption><tr><th>step0_customers</th><th>step1_orders</th><th>step2_referrals</th></tr><tr><td>7</td><td>11</td><td>14</td></tr></table>
  <p>7 customers → 11 (orders: expected, one row per order plus Gita) → 14 (referrals: a jump with no business meaning; Asha's 3 order rows became 6). That last jump is the bug.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Fan-out</strong>: rows multiply because a join key is not unique on the side you assumed it was, so a value from the "one" side is repeated and then summed or counted several times. Joining two independent one-to-many relations on the same parent creates a per-parent cross product.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>COUNT(DISTINCT o.order_id)</code> can patch an inflated <em>count</em>, but <code>SUM(DISTINCT o.amount)</code> is wrong whenever two real orders have the same value: Dia's 105 and Asha's 110 are both 310, and 107 and 108 are both 260. Fix the grain, do not paper over it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: chains, USING and non-equi joins.</b> We can now trust row counts and sums. Real questions chain three or four tables ("spend per cuisine per customer"), sometimes match on ranges instead of equal keys, and come with tempting shortcuts like NATURAL JOIN.</div>

  <h2 id="sj-multi"><span class="num">09</span>Chains, USING &amp; Non-equi Joins</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"How much did each customer spend per cuisine?" The customer is in <code>customers</code>, the link and the bill in <code>orders</code>, the cuisine in <code>restaurants</code>. And "which price band is each order in?" has no shared key at all.</p>
  </div>
  <p>You chain joins along the keys. Each JOIN adds one table to the result built so far.</p>
  <div class="flow"><span>customers</span><span>orders (customer_id)</span><span>restaurants (restaurant_id)</span><span>order_items (order_id)</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tracking a courier parcel: your phone number gives the booking, the booking gives the consignment, the consignment gives the hub. Each step uses the key you got from the previous step.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT c.name, r.cuisine, SUM(o.amount) AS spent
FROM customers c
JOIN orders o      ON o.customer_id   = c.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
WHERE o.status = 'delivered'
GROUP BY c.name, r.cuisine
ORDER BY c.name, r.cuisine;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>cuisine</th><th>spent</th></tr><tr><td>Asha</td><td>Pizza</td><td>380.00</td></tr><tr><td>Asha</td><td>South Indian</td><td>240.00</td></tr><tr><td>Ben</td><td>Biryani</td><td>630.00</td></tr><tr><td>Chen</td><td>Pizza</td><td>520.00</td></tr><tr><td>Chen</td><td>South Indian</td><td>260.00</td></tr><tr><td>Farah</td><td>Biryani</td><td>600.00</td></tr></table>
  <p>Each <code>ON</code> uses a key from a table already in the chain. <code>restaurants</code> is the "one" side of orders, so this chain cannot fan out. Asha: Dosa Hut 240 (South Indian) + Pizza Point 380 (Pizza); her pending 110 is excluded by WHERE. Dia, Esha and Gita have no delivered orders and disappear (INNER joins).</p>
  <h3>Trap: LEFT then INNER</h3>
  <p>Suppose you want every customer, so you make the first join LEFT, but leave the next one INNER. Look at Dia and Gita only:</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, oi.item
FROM customers c
LEFT JOIN orders o  ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
WHERE c.customer_id IN (4, 7)
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>item</th></tr><tr><td>Dia</td><td>105</td><td>Buddha Bowl</td></tr></table>
  <p>Gita is gone. Trace: the LEFT JOIN gives Gita a row with <code>o.order_id</code> = NULL. The next INNER JOIN looks for items where <code>oi.order_id = NULL</code>, finds none, and drops her. Once a branch is LEFT joined, every later join that hangs off it must also be LEFT:</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, oi.item
FROM customers c
LEFT JOIN orders o       ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON oi.order_id   = o.order_id
WHERE c.customer_id IN (4, 7)
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>item</th></tr><tr><td>Dia</td><td>105</td><td>Buddha Bowl</td></tr><tr><td>Gita</td><td>NULL</td><td>NULL</td></tr></table>
  <h3>USING and NATURAL JOIN</h3>
  <p>When the key column has the same name in both tables, <code>USING (customer_id)</code> is a shorter way to write <code>ON c.customer_id = o.customer_id</code>. The key appears once in the output, so you write <code>customer_id</code> without an alias.</p>
  <div class="fx" data-lang="sql">SELECT customer_id, c.name, o.order_id
FROM customers c
JOIN orders o USING (customer_id)
WHERE customer_id IN (1, 2)
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>name</th><th>order_id</th></tr><tr><td>1</td><td>Asha</td><td>101</td></tr><tr><td>2</td><td>Ben</td><td>102</td></tr><tr><td>1</td><td>Asha</td><td>104</td></tr><tr><td>2</td><td>Ben</td><td>106</td></tr><tr><td>1</td><td>Asha</td><td>110</td></tr></table>
  <p><code>NATURAL JOIN</code> goes one step further: it joins on <em>every</em> column whose name appears in both tables, without listing them. <code>orders</code> and <code>customers</code> share only <code>customer_id</code>, so this works:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS rows FROM orders NATURAL JOIN customers;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>rows</th></tr><tr><td>10</td></tr></table>
  <p>Now add restaurants, which shares <code>restaurant_id</code> with orders. It looks harmless:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS rows
FROM orders NATURAL JOIN customers NATURAL JOIN restaurants;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>rows</th></tr><tr><td>0</td></tr></table>
  <p>Zero rows, no error. <code>customers</code> and <code>restaurants</code> both have columns called <code>name</code> and <code>city</code>, so the second NATURAL JOIN silently required "customer's name = restaurant's name AND customer's city = restaurant's city" as well as the restaurant id. No customer is called "Dosa Hut". Always name the key with <code>ON</code> or <code>USING</code>.</p>
  <h3>Non-equi joins</h3>
  <p>ON can hold any condition, not just <code>=</code>. Finance bands orders as small (under 250), medium (250 to 449.99) and large (450 and up). There is no shared key; the match is "amount falls inside the range".</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.amount, b.band
FROM orders o
JOIN (VALUES ('small',    0,    249.99),
             ('medium', 250,    449.99),
             ('large',  450, 999999.99)) AS b(band, lo, hi)
  ON o.amount BETWEEN b.lo AND b.hi
ORDER BY o.amount DESC, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>amount</th><th>band</th></tr><tr><td>109</td><td>600.00</td><td>large</td></tr><tr><td>103</td><td>520.00</td><td>large</td></tr><tr><td>102</td><td>450.00</td><td>large</td></tr><tr><td>104</td><td>380.00</td><td>medium</td></tr><tr><td>105</td><td>310.00</td><td>medium</td></tr><tr><td>110</td><td>310.00</td><td>medium</td></tr><tr><td>107</td><td>260.00</td><td>medium</td></tr><tr><td>108</td><td>260.00</td><td>medium</td></tr><tr><td>101</td><td>240.00</td><td>small</td></tr><tr><td>106</td><td>180.00</td><td>small</td></tr></table>
  <p><code>(VALUES …) AS b(band, lo, hi)</code> builds a 3-row table inline, with column names. Each order is compared with all 3 bands and kept where <code>BETWEEN</code> is TRUE. Trace order 104 (380): not in 0–249.99, in 250–449.99 (medium), not in 450+. Exactly one band, so one row; 10 orders in, 10 rows out.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Equi-join</strong>: the ON condition is equality of keys. <strong>Non-equi join</strong>: any other condition (<code>BETWEEN</code>, <code>&lt;</code>, <code>&gt;=</code>). Used for price bands, tax slabs, "the exchange rate valid on that date", and event windows. <strong>USING (k)</strong>: equality on same-named columns, output once. <strong>NATURAL JOIN</strong>: USING on every same-named column.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Bands must not overlap, or a row matches twice (fan-out again); gaps between bands silently drop rows (an amount of 249.995 would match nothing). Non-equi joins cannot use a hash join, so on big tables they are slower.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how the engine joins.</b> Everything so far describes <em>which</em> rows come out. With 7 × 10 rows nobody cares how; with 10 million orders the "all pairs" model would never finish. What does the database actually do?</div>

  <h2 id="sj-algo"><span class="num">10</span>How the Engine Joins</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The mental model "build all pairs, keep matches" tried 70 pairs to find 10. For two tables of 1 million rows it would be 10<sup>12</sup> comparisons. Why are real joins fast, and when are they slow?</p>
  </div>
  <p>The <strong>optimizer</strong> (the part of the database that plans a query) picks one of three physical algorithms. You see its choice with <code>EXPLAIN</code>, which prints the plan without running the query.</p>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
SELECT c.name, o.order_id
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id;</div>
  <div class="fx" data-lang="text">Hash Join
  Hash Cond: (o.customer_id = c.customer_id)
  -&gt;  Seq Scan on orders o
  -&gt;  Hash
        -&gt;  Seq Scan on customers c</div>
  <p>Read a plan from the most indented line up. Both tables are read with a <code>Seq Scan</code> (every row). <code>Hash</code> builds an in-memory hash table from one input, keyed on <code>customer_id</code>; the other input is streamed through, and for each row the <code>Hash Join</code> looks up its key. That is a <strong>hash join</strong>: build on one side, probe with the other.</p>
  <table class="tbl"><caption>Trace: hash join, customers (build) and orders (probe)</caption>
    <tr><th>step</th><th>action</th><th>state</th></tr>
    <tr><td>build</td><td>put each customer in a bucket by id</td><td>{1: Asha, 2: Ben, 3: Chen, 4: Dia, 5: Esha, 6: Farah, 7: Gita}</td></tr>
    <tr><td>probe 101</td><td>look up key 1</td><td>found Asha → output (Asha, 101)</td></tr>
    <tr><td>probe 102</td><td>look up key 2</td><td>found Ben → output</td></tr>
    <tr><td>probe 103 … 110</td><td>look up keys 3, 1, 4, 2, 5, 3, 6, 1</td><td>one lookup each → 8 more rows</td></tr>
  </table>
  <p>Each order costs one lookup, so the total work is about m + n (7 + 10), not m × n (70). The optimizer can be told to avoid an algorithm, which lets us see the other two on the same query. (These <code>SET</code> switches are for learning only.)</p>
  <div class="fx" data-lang="sql">SET enable_hashjoin = off;
EXPLAIN (COSTS OFF)
SELECT c.name, o.order_id
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id;</div>
  <div class="fx" data-lang="text">Merge Join
  Merge Cond: (c.customer_id = o.customer_id)
  -&gt;  Sort
        Sort Key: c.customer_id
        -&gt;  Seq Scan on customers c
  -&gt;  Sort
        Sort Key: o.customer_id
        -&gt;  Seq Scan on orders o</div>
  <p>A <strong>merge join</strong>: both inputs are sorted by <code>customer_id</code> (the two <code>Sort</code> nodes; on big tables an index can supply the order for free), then walked together like a zipper: 1 meets orders 101, 104, 110; 2 meets 102, 106; … 7 meets nothing.</p>
  <div class="fx" data-lang="sql">SET enable_hashjoin = off;
SET enable_mergejoin = off;
EXPLAIN (COSTS OFF)
SELECT c.name, o.order_id
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id;</div>
  <div class="fx" data-lang="text">Nested Loop
  -&gt;  Seq Scan on orders o
  -&gt;  Index Scan using customers_pkey on customers c
        Index Cond: (customer_id = o.customer_id)</div>
  <p>A <strong>nested loop</strong>: for each row of the outer input, look up matches in the inner one. With the primary-key index on <code>customers</code>, each order finds its customer in one index probe. Without an index, it would rescan the inner table for every outer row: the m × n case.</p>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <defs><marker id="sj-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="100" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Nested loop</text>
    <rect x="15" y="40" width="50" height="24" rx="3" class="fb"/><rect x="15" y="74" width="50" height="24" rx="3" class="fb"/><rect x="15" y="108" width="50" height="24" rx="3" class="fb"/>
    <text x="40" y="146" text-anchor="middle" class="tm">outer</text>
    <circle cx="150" cy="55" r="12" class="fg sg"/><circle cx="125" cy="100" r="10" class="fg"/><circle cx="175" cy="100" r="10" class="fg"/>
    <g stroke="currentColor"><line x1="143" y1="65" x2="129" y2="91"/><line x1="157" y1="65" x2="171" y2="91"/></g>
    <g stroke="currentColor" marker-end="url(#sj-ar1)" opacity="0.7"><line x1="65" y1="52" x2="136" y2="55"/><line x1="65" y1="86" x2="137" y2="60"/><line x1="65" y1="120" x2="139" y2="63"/></g>
    <text x="150" y="146" text-anchor="middle" class="tm">index</text>
    <text x="100" y="166" text-anchor="middle">each outer row: 1 lookup</text>
    <text x="300" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Hash join</text>
    <rect x="215" y="50" width="40" height="22" rx="3" class="fb"/><rect x="215" y="82" width="40" height="22" rx="3" class="fb"/>
    <text x="235" y="122" text-anchor="middle" class="tm">build</text>
    <rect x="280" y="40" width="40" height="22" rx="3" class="fg sg"/><text x="300" y="55" text-anchor="middle">#0</text>
    <rect x="280" y="68" width="40" height="22" rx="3" class="fg sg"/><text x="300" y="83" text-anchor="middle">#1</text>
    <rect x="280" y="96" width="40" height="22" rx="3" class="fg sg"/><text x="300" y="111" text-anchor="middle">#2</text>
    <rect x="345" y="36" width="40" height="18" rx="3" class="fv"/><rect x="345" y="60" width="40" height="18" rx="3" class="fv"/><rect x="345" y="84" width="40" height="18" rx="3" class="fv"/><rect x="345" y="108" width="40" height="18" rx="3" class="fv"/>
    <text x="365" y="140" text-anchor="middle" class="tm">probe</text>
    <g stroke="currentColor" marker-end="url(#sj-ar1)"><line x1="255" y1="61" x2="278" y2="55"/><line x1="255" y1="93" x2="278" y2="105"/><line x1="345" y1="69" x2="322" y2="79"/></g>
    <text x="300" y="166" text-anchor="middle">build one side, probe with the other</text>
    <text x="500" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Merge join</text>
    <rect x="425" y="40" width="40" height="22" rx="3" class="fb"/><text x="445" y="55" text-anchor="middle">1</text>
    <rect x="425" y="70" width="40" height="22" rx="3" class="fb"/><text x="445" y="85" text-anchor="middle">2</text>
    <rect x="425" y="100" width="40" height="22" rx="3" class="fb"/><text x="445" y="115" text-anchor="middle">7</text>
    <rect x="535" y="40" width="40" height="22" rx="3" class="fv"/><text x="555" y="55" text-anchor="middle">1</text>
    <rect x="535" y="70" width="40" height="22" rx="3" class="fv"/><text x="555" y="85" text-anchor="middle">2</text>
    <rect x="535" y="100" width="40" height="22" rx="3" class="fv"/><text x="555" y="115" text-anchor="middle">6</text>
    <g class="sg" stroke-width="2"><line x1="465" y1="51" x2="535" y2="51"/><line x1="465" y1="81" x2="535" y2="81"/></g>
    <g stroke="currentColor" marker-end="url(#sj-ar1)"><line x1="415" y1="40" x2="415" y2="125"/><line x1="585" y1="40" x2="585" y2="125"/></g>
    <text x="500" y="166" text-anchor="middle">walk two sorted lists</text>
    </g>
  </svg><figcaption>Nested loop: small outer side plus an index. Hash: equality on big unsorted inputs. Merge: inputs already sorted by the key.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Matching wedding guests to tables. <strong>Nested loop</strong>: for each guest, look up their name in the seating index. <strong>Hash</strong>: sort place cards into pigeonholes by first letter, then each guest checks one hole. <strong>Merge</strong>: both lists are already alphabetical, so read them side by side once.</p>
  </div>
  <table class="tbl">
    <tr><th>Algorithm</th><th>How it works</th><th>Best when</th><th>Cost</th></tr>
    <tr><td><strong>Nested loop</strong></td><td>For each outer row, look up matches in the inner side (ideally with an index)</td><td>Outer side is small (one customer's orders); inner has an index; any condition, including non-equi</td><td>outer rows × one lookup</td></tr>
    <tr><td><strong>Hash join</strong></td><td>Build a hash table on the smaller side, stream the larger side through it</td><td>Large unsorted inputs; equality only</td><td>about m + n; needs memory, may spill to disk</td></tr>
    <tr><td><strong>Merge join</strong></td><td>Both sides sorted by the key, walked together like a zipper</td><td>Inputs already sorted (by an index) or very large; equality or range-compatible keys</td><td>about m + n after sorting</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>logical</strong> join (INNER, LEFT…) says <em>what</em> rows come out. The <strong>physical</strong> join algorithm (nested loop, hash, merge) says <em>how</em> they are found. Any logical join can run with several physical algorithms; the result is identical, as the three plans above show for one query.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A slow join on a foreign key with no index often shows a nested loop scanning the whole inner table per outer row. Index the foreign key column (<code>orders.customer_id</code>); PostgreSQL creates indexes for primary keys but <em>not</em> for foreign keys. More in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the row-count puzzle.</b> We have the full model (pairs, padding, filters, grain) and the physical side. One small puzzle checks all of it at once, including the two cases Biteful's clean keys never showed: duplicate keys on both sides and NULL keys.</div>

  <h2 id="sj-puzzle"><span class="num">11</span>Row-Count Puzzle</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's keys are unique on the "one" side. What happens to row counts when <em>both</em> sides repeat a key, or a key is NULL? Interviewers love this warm-up because it can be worked out by hand in two minutes, if the mental model is solid.</p>
  </div>

  <table class="tbl"><caption>a</caption><tr><th>k</th></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>2</td></tr><tr><td>NULL</td></tr></table>
  <table class="tbl"><caption>b</caption><tr><th>k</th></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>3</td></tr><tr><td>NULL</td></tr></table>
  <div class="callout pred"><span class="label">Predict the output</span>
    <p>How many rows for INNER, LEFT, RIGHT, FULL and CROSS joins on <code>a.k = b.k</code>? Write your five numbers before reading on.</p>
  </div>
  <p>Work it like the trace in section 01. Which pairs make ON TRUE?</p>
  <table class="tbl"><caption>Trace: matches per value of a.k</caption>
    <tr><th>a.k</th><th>equal b.k rows</th><th>pairs</th></tr>
    <tr><td>1 (first)</td><td>1, 1</td><td>2</td></tr>
    <tr><td>1 (second)</td><td>1, 1</td><td>2</td></tr>
    <tr><td>2</td><td>none</td><td>0 → unmatched in a</td></tr>
    <tr><td>NULL</td><td>none (NULL = NULL is UNKNOWN)</td><td>0 → unmatched in a</td></tr>
  </table>
  <p>On the b side, 3 and NULL are unmatched. So: 4 matched pairs, 2 unmatched a rows, 2 unmatched b rows.</p>
  <div class="fx" data-lang="sql">SELECT
  (SELECT COUNT(*) FROM a JOIN b ON a.k = b.k)       AS inner_j,
  (SELECT COUNT(*) FROM a LEFT JOIN b ON a.k = b.k)  AS left_j,
  (SELECT COUNT(*) FROM a RIGHT JOIN b ON a.k = b.k) AS right_j,
  (SELECT COUNT(*) FROM a FULL JOIN b ON a.k = b.k)  AS full_j,
  (SELECT COUNT(*) FROM a CROSS JOIN b)              AS cross_j;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>inner_j</th><th>left_j</th><th>right_j</th><th>full_j</th><th>cross_j</th></tr><tr><td>4</td><td>6</td><td>6</td><td>8</td><td>16</td></tr></table>
  <ul>
    <li><strong>INNER 4</strong>: the two 1s pair 2 × 2. The NULLs never match.</li>
    <li><strong>LEFT 6</strong>: 4 pairs + unmatched 2 and NULL from <code>a</code>.</li>
    <li><strong>RIGHT 6</strong>: 4 pairs + unmatched 3 and NULL from <code>b</code>.</li>
    <li><strong>FULL 8</strong>: 4 + 2 + 2. <strong>CROSS 16</strong>: 4 × 4, no condition.</li>
  </ul>
  <div class="callout intu"><span class="label">Bounds to remember</span>
    <p>INNER ≤ m × n. LEFT ≥ m (rows of the left table). FULL ≥ max(m, n). CROSS = m × n exactly. If a join returns more rows than its "one" side, a key is not as unique as you thought (that is fan-out, section 08).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"LEFT JOIN returns as many rows as the left table" is false whenever the right key repeats. Here it returns 6, not 4; on Biteful, customers LEFT JOIN orders returns 11, not 7. If NULL should match NULL, write <code>a.k IS NOT DISTINCT FROM b.k</code> (slower: no hash join).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have built every join type, each to fix the weakness of the one before. Are they ten separate tools, or one idea seen from different sides?</div>

  <h2 id="sj-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>INNER, LEFT, RIGHT, FULL, CROSS, self, semi, anti, ON vs WHERE, fan-out, three algorithms: a list of separate rules, or one model with a few switches?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="sj-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="130" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="75" y="40" text-anchor="middle" font-weight="700">1. all pairs</text><text x="75" y="57" text-anchor="middle" class="tm">CROSS: 7 × 10 = 70</text>
<line x1="140" y1="45" x2="173" y2="45" stroke="currentColor" marker-end="url(#sj-a9)"/>
<rect x="175" y="20" width="140" height="50" rx="8" class="fb sb"/><text x="245" y="40" text-anchor="middle" font-weight="700">2. keep ON = TRUE</text><text x="245" y="57" text-anchor="middle" class="tm">INNER: 10</text>
<line x1="315" y1="45" x2="348" y2="45" stroke="currentColor" marker-end="url(#sj-a9)"/>
<rect x="350" y="20" width="150" height="50" rx="8" class="fg sg"/><text x="425" y="40" text-anchor="middle" font-weight="700">3. pad lonely rows</text><text x="425" y="57" text-anchor="middle" class="tm">LEFT 11 · RIGHT · FULL</text>
<line x1="500" y1="45" x2="533" y2="45" stroke="currentColor" marker-end="url(#sj-a9)"/>
<rect x="535" y="20" width="175" height="50" rx="8" class="fr sr"/><text x="622" y="40" text-anchor="middle" font-weight="700">4. WHERE, GROUP BY</text><text x="622" y="57" text-anchor="middle" class="tm">after padding</text>
<line x1="245" y1="70" x2="245" y2="103" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sj-a9)"/>
<rect x="160" y="105" width="170" height="44" rx="8" class="fb sb"/><text x="245" y="123" text-anchor="middle">same table both sides</text><text x="245" y="139" text-anchor="middle" class="tm">SELF: Farah → Ben</text>
<line x1="330" y1="127" x2="363" y2="127" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sj-a9)"/>
<rect x="365" y="105" width="170" height="44" rx="8" class="fb sb"/><text x="450" y="123" text-anchor="middle">only "any match?"</text><text x="450" y="139" text-anchor="middle" class="tm">semi 6 · anti: Gita</text>
<line x1="622" y1="70" x2="622" y2="103" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sj-a9)"/>
<rect x="555" y="105" width="160" height="44" rx="8" class="fr sr"/><text x="635" y="123" text-anchor="middle">right-table test here</text><text x="635" y="139" text-anchor="middle" class="tm">LEFT → INNER (7 rows)</text>
<line x1="245" y1="149" x2="245" y2="183" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sj-a9)"/>
<rect x="130" y="185" width="230" height="44" rx="8" class="fr sr"/><text x="245" y="203" text-anchor="middle">a key repeats → values repeat</text><text x="245" y="219" text-anchor="middle" class="tm">fan-out: 930 → 1620</text>
<rect x="400" y="185" width="310" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="555" y="203" text-anchor="middle">HOW step 2 runs (same result)</text><text x="555" y="219" text-anchor="middle" class="tm">nested loop · hash · merge</text>
<text x="10" y="262" class="tm">Logical model (top row) decides WHAT comes out; the physical algorithm (bottom right) decides HOW FAST.</text>
<text x="10" y="280" class="tm">Every bug in this note is a mismatch between the step you think a condition runs in and the step it really runs in.</text>
</g>
</svg><figcaption>Every join is the same four-step pipeline: pairs → ON filter → padding → WHERE/GROUP BY. The join types are switches on steps 1 and 3; semi/anti joins stop at "any match"; ON vs WHERE is which step a filter lives in; fan-out is what step 2 does to values when keys repeat.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same Biteful tables</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>CROSS JOIN</td><td>step 1 only</td><td>every combination?</td><td>5 restaurants × 3 statuses = 15</td><td>grids, calendars, then LEFT JOIN facts</td></tr>
    <tr><td>INNER JOIN</td><td>steps 1 + 2</td><td>the answer needs two tables</td><td>orders × customers → 10</td><td>matched facts only</td></tr>
    <tr><td>LEFT JOIN</td><td>INNER + pad left</td><td>keep rows with no partner?</td><td>11 (Gita + NULL)</td><td>"all X, with Y if any"</td></tr>
    <tr><td>RIGHT JOIN</td><td>INNER + pad right</td><td>keep the second table's lonely rows?</td><td>11 (Momo Magic + NULL)</td><td>rarely; rewrite as LEFT</td></tr>
    <tr><td>FULL JOIN</td><td>INNER + pad both</td><td>keep lonely rows on both sides?</td><td>6 March days</td><td>reconciling two lists; COALESCE the key</td></tr>
    <tr><td>SELF JOIN</td><td>any join, same table twice</td><td>rows pointing at rows of the same table?</td><td>Farah → Ben; 6 same-city pairs</td><td>hierarchies, pairs, comparisons</td></tr>
    <tr><td>Semi join (EXISTS)</td><td>step 2, stop at first match</td><td>has any?</td><td>6 customers, once each</td><td>yes/no filters</td></tr>
    <tr><td>Anti join (NOT EXISTS)</td><td>step 2, keep if no match</td><td>has none?</td><td>Gita; 5 non-referrers</td><td>"never ordered"; never NOT IN on nullable</td></tr>
    <tr><td>ON vs WHERE</td><td>step 2 vs step 4</td><td>where does a filter belong?</td><td>WHERE: 7 rows; ON: 10 rows</td><td>right-table tests in ON</td></tr>
    <tr><td>Fan-out / grain</td><td>step 2 with repeating keys</td><td>are my sums right?</td><td>Asha 930 vs 1620 / 1860</td><td>aggregate each table at its grain first</td></tr>
    <tr><td>Non-equi join</td><td>step 2 with any condition</td><td>match on ranges?</td><td>10 orders into 3 bands</td><td>bands, validity periods</td></tr>
    <tr><td>Join algorithms</td><td>physical step 2</td><td>how is it executed?</td><td>hash / merge / nested loop plans</td><td>reading EXPLAIN, choosing indexes</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a join produces pairs, filters them with ON, pads the lonely rows, and only then lets WHERE and GROUP BY see the result.</strong> Every join type is a choice of which lonely rows to pad; every classic bug is a condition or a sum placed in the wrong step (a right-table filter in WHERE runs after padding; a parent's amount summed after pairing with its children). When a number looks wrong, ask: "what does one row mean right now, and which step am I in?"</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Knowing the system, which slips do people still make in reports and code reviews?</div>

  <h2 id="sj-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Join bugs almost never raise an error. The query runs, the dashboard fills, and the number is wrong. Which ones should you check for before trusting a result?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: filtering the right table in WHERE after a LEFT JOIN</span>
    <p><code>LEFT JOIN orders o … WHERE o.status = 'delivered'</code> dropped Dia, Esha and Gita. Move the condition into ON (section 07).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: COUNT(*) after a LEFT JOIN</span>
    <p>Padded rows count as 1 (Gita: 1). Count a right-table column that is never NULL in a real match: <code>COUNT(o.order_id)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: NOT IN with a nullable subquery</span>
    <p>One NULL makes every <code>NOT IN</code> test UNKNOWN → 0 rows ("who referred nobody"). Use <code>NOT EXISTS</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: summing a parent's column after joining children</span>
    <p>Asha 930 became 1620 (lines) and 1860 (referrals). Aggregate each table at its own grain first. Check <code>COUNT(*)</code> after every join.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: LEFT JOIN followed by INNER JOIN on the same branch</span>
    <p>The INNER JOIN removes the padded rows the LEFT JOIN kept (Gita). Keep the whole branch LEFT.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: missing or wrong ON</span>
    <p>A missing condition is a cross join; joining on the wrong column (<code>o.order_id = c.customer_id</code>) gives plausible-looking garbage. Read every ON aloud: "order's customer equals customer's id".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: INNER JOIN to answer "who has any"</span>
    <p>It repeats the left row per match (Asha × 3). Use EXISTS for a yes/no filter.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: NATURAL JOIN</span>
    <p>It joins on every same-named column, today and after any future schema change: customers and restaurants share <code>name</code> and <code>city</code> → 0 rows. Name the key with ON or USING.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting NULL keys to match</span>
    <p><code>NULL = NULL</code> is UNKNOWN: Esha pairs with no one on city, not even herself. Use <code>IS NOT DISTINCT FROM</code> if NULL should mean "same", or clean the data first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="sj-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <strong>Biteful</strong>. customers (7): Asha, Chen, Gita (Pune), Ben, Dia, Farah (Mumbai), Esha (city NULL); Gita has no orders; <code>referred_by</code>: Ben and Chen ← Asha, Farah ← Ben. restaurants (5), Momo Magic (14) has no orders. orders (10): 101–110, amounts 240, 450, 520, 380, 310, 180, 260, 260, 600, 310; 105 and 107 cancelled, 110 pending. order_items (15 lines); orders 102, 104, 108, 109, 110 have 2 lines.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>INNER JOIN</td><td>the answer needs two tables</td><td>10 pairs of 70</td><td>drops Gita → LEFT</td></tr>
    <tr><td>LEFT JOIN</td><td>keep rows with no partner</td><td>11 rows; COUNT(o.order_id) Gita 0</td><td>only left side kept → RIGHT/FULL</td></tr>
    <tr><td>RIGHT / FULL</td><td>lonely rows on the other / both sides</td><td>Momo Magic; 6 March days</td><td>needs a key → CROSS</td></tr>
    <tr><td>CROSS</td><td>every combination</td><td>5 × 3 = 15 grid, 9 zeros</td><td>two different tables → SELF</td></tr>
    <tr><td>SELF</td><td>a row points at the same table</td><td>Farah → Ben; 3 pairs per city</td><td>JOIN repeats rows for yes/no → semi/anti</td></tr>
    <tr><td>Semi / anti</td><td>has any / has none</td><td>EXISTS 6; NOT EXISTS Gita; NOT IN 0 rows</td><td>extra filters in outer joins → ON vs WHERE</td></tr>
    <tr><td>ON vs WHERE</td><td>where does a filter go?</td><td>WHERE: 7 rows, ON: 10</td><td>rows right, sums? → fan-out</td></tr>
    <tr><td>Fan-out</td><td>why are sums too big?</td><td>Asha 930 → 1620 → 1860</td><td>longer chains, ranges → chains/non-equi</td></tr>
    <tr><td>Chains, USING, non-equi</td><td>4 tables, range matches</td><td>NATURAL → 0 rows; 3 bands</td><td>how is it executed? → algorithms</td></tr>
    <tr><td>Algorithms</td><td>how fast, when slow?</td><td>hash, merge, nested loop plans</td><td>→ <a class="xref" data-note="sql_subqueries">Subqueries</a>, <a class="xref" data-note="sql_optimization">Indexes</a></td></tr>
  </table>
  <h3>Definitions and rules</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th><th>Row count</th></tr>
    <tr><td>CROSS JOIN</td><td>every pair, no ON</td><td>m × n</td></tr>
    <tr><td>INNER JOIN</td><td>pairs where ON is TRUE</td><td>0 … m × n</td></tr>
    <tr><td>LEFT JOIN</td><td>INNER + unmatched left rows, right columns NULL</td><td>≥ m</td></tr>
    <tr><td>RIGHT JOIN</td><td>INNER + unmatched right rows</td><td>≥ n</td></tr>
    <tr><td>FULL JOIN</td><td>INNER + unmatched rows of both</td><td>≥ max(m, n)</td></tr>
    <tr><td>Semi join</td><td>left row once if any match (EXISTS, IN)</td><td>≤ m</td></tr>
    <tr><td>Anti join</td><td>left row if no match (NOT EXISTS, LEFT … IS NULL)</td><td>≤ m</td></tr>
    <tr><td>Grain</td><td>what one row means; sum a measure only at its grain</td><td>—</td></tr>
    <tr><td>Fan-out</td><td>a non-unique key repeats values; sums and counts inflate</td><td>—</td></tr>
    <tr><td>ON vs WHERE</td><td>ON: before padding (match rule); WHERE: after padding (filter)</td><td>—</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>INNER</b><p>Use when only matched facts matter: orders with their customer and restaurant.</p><small>Avoid for "all customers": it drops the ones with no match</small></div>
    <div><b>LEFT</b><p>Use for "all X, with Y if any"; count with COUNT(right.pk); COALESCE sums.</p><small>Avoid right-table tests in WHERE</small></div>
    <div><b>FULL</b><p>Use to reconcile two lists (metrics per day, ledger vs bank); COALESCE the key.</p><small>Not in MySQL; SQLite only from 3.39</small></div>
    <div><b>CROSS</b><p>Use to build a complete grid or calendar, then LEFT JOIN the facts.</p><small>Never by accident: check every ON</small></div>
    <div><b>EXISTS / NOT EXISTS</b><p>Use for yes/no filters; each left row at most once; NULL-safe.</p><small>Avoid NOT IN on a nullable column</small></div>
    <div><b>Pre-aggregate in CTEs</b><p>Use whenever two children of one parent, or a parent measure plus child rows, meet in one query.</p><small>SUM(DISTINCT) is not a fix</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>WHERE on a right-table column after LEFT JOIN (Dia, Esha, Gita vanish); COUNT(*) counts padded rows; NOT IN with a NULL → 0 rows; summing <code>orders.amount</code> after joining lines (930 → 1620); LEFT then INNER on the same branch; NATURAL JOIN on <code>name</code>/<code>city</code>; overlapping bands; NULL keys never match; no index on the foreign key → slow nested loop.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>customers LEFT JOIN orders on Biteful: how many rows?</td><td>11: 10 orders + Gita padded</td></tr>
    <tr><td>Left table 4 rows, right key repeats; can LEFT JOIN return 6?</td><td>Yes; LEFT returns at least m rows, not exactly m</td></tr>
    <tr><td>Why does <code>x NOT IN (1, NULL)</code> never return TRUE?</td><td>x &lt;&gt; NULL is UNKNOWN, so the AND chain is at best UNKNOWN</td></tr>
    <tr><td>Order total ₹380 with 2 lines; SUM(amount) after joining lines?</td><td>760: the amount repeats once per line</td></tr>
    <tr><td>Which join algorithm needs equality and builds an in-memory table?</td><td>Hash join</td></tr>
  </table>

  <h2 id="sj-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you predict a join's rows, and explain why each join type exists, out loud without notes?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How many rows does <code>customers LEFT JOIN orders</code> return on Biteful, and why not 7?</summary><div class="qa-body">11. Asha has 3 orders, Ben and Chen 2 each, Dia, Esha and Farah 1 each (10 pairs), and Gita gets one NULL-padded row. A LEFT JOIN guarantees <em>at least</em> one row per left row, not exactly one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find customers who have never ordered. Give two correct ways and one risky way.</summary><div class="qa-body">Correct: <code>WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)</code>, or <code>LEFT JOIN orders o … WHERE o.order_id IS NULL</code>. Both return Gita. Risky: <code>WHERE customer_id NOT IN (SELECT customer_id FROM orders)</code>. It works here only because <code>orders.customer_id</code> is NOT NULL; one NULL would empty the result.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>SELECT name FROM customers WHERE customer_id NOT IN (SELECT referred_by FROM customers);</code></summary><div class="qa-body">Zero rows. Four customers have <code>referred_by</code> NULL, so for everyone <code>customer_id &lt;&gt; NULL</code> is UNKNOWN, and WHERE keeps only TRUE. The intended answer (Chen, Dia, Esha, Farah, Gita) needs NOT EXISTS or <code>WHERE referred_by IS NOT NULL</code> inside the subquery.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A report should list all customers with their count of delivered orders, but Dia, Esha and Gita are missing. The query has <code>LEFT JOIN orders … WHERE o.status = 'delivered'</code>. Fix it.</summary><div class="qa-body">The WHERE drops the NULL-padded rows and the rows of customers whose orders are all cancelled, turning the LEFT JOIN into an INNER JOIN. Move the condition into ON and count a right-side column: <code>LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'</code> with <code>COUNT(o.order_id)</code>. Result: Asha 2, Ben 2, Chen 2, Dia 0, Esha 0, Farah 1, Gita 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A dashboard joins orders to order_items and Asha's spend comes out 1620 instead of 930. What is happening?</summary><div class="qa-body">Fan-out. <code>amount</code> is an order-level fact; after joining lines, orders 104 and 110 (two lines each) appear twice, so 240 + 2×380 + 2×310 = 1620. Fix: sum <code>amount</code> without joining lines, aggregate lines per order in a CTE first, or sum the line-level measure <code>qty * unit_price</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a query for each customer and the name of the person who referred them, keeping customers with no referrer.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT c.name AS customer, r.name AS referred_by
FROM customers c
LEFT JOIN customers r ON r.customer_id = c.referred_by
ORDER BY c.customer_id;</div>A self join with two aliases. LEFT keeps Asha, Dia, Esha and Gita with NULL; Ben → Asha, Chen → Asha, Farah → Ben.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List all unique pairs of customers in the same city, with no self-pairs or mirrored duplicates. How many, and why is Esha absent?</summary><div class="qa-body"><code>JOIN customers b ON b.city = a.city AND a.customer_id &lt; b.customer_id</code>: 6 pairs (3 in Pune, 3 in Mumbai). Using <code>&lt;&gt;</code> instead of <code>&lt;</code> would return each pair twice. Esha's city is NULL, and NULL = anything is UNKNOWN, so she pairs with nobody.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the three join algorithms. Which fits (a) one customer's orders, (b) two 500M-row tables on user_id, (c) inputs already sorted by key?</summary><div class="qa-body">(a) Nested loop with an index lookup: tiny outer side. (b) Hash join: big unsorted inputs, equality key; may spill to disk if memory is short. (c) Merge join: no sort needed, just walk both in order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>NATURAL JOIN</code> considered dangerous, and how does <code>USING</code> differ from <code>ON</code>?</summary><div class="qa-body">NATURAL JOIN joins on <em>every</em> same-named column. <code>orders NATURAL JOIN customers NATURAL JOIN restaurants</code> returned 0 rows because customers and restaurants both have <code>name</code> and <code>city</code>. <code>USING (customer_id)</code> names the key explicitly and outputs it once; <code>ON</code> allows any condition and keeps both columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does LEFT JOIN need NULL at all? What would break without it?</summary><div class="qa-body">A padded row must have <em>some</em> value in the right table's columns, and there is no real one. NULL means "no value", so aggregates skip it (COUNT(o.order_id) = 0 for Gita) and the anti-join test <code>o.order_id IS NULL</code> can find padded rows. The same NULL is also why WHERE on a right column silently drops padded rows: the cost of the padding.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the CROSS JOIN grid need a LEFT JOIN afterwards, not an INNER JOIN?</summary><div class="qa-body">The grid exists to show combinations with no facts (Momo Magic, 0). INNER would keep only the 6 combinations that have counts, exactly the result we had before building the grid. LEFT keeps all 15 cells and COALESCE turns the 9 missing counts into 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what do fan-out and the row-count puzzle have in common?</summary><div class="qa-body">Both come from step 2 when a key is not unique: each match is a separate pair. In the puzzle, two 1s on each side make 2 × 2 = 4 rows. In Biteful, an order with 2 lines makes 2 rows carrying the same amount. The count growth is correct join behaviour; the bug is summing a value at the wrong grain.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip semi joins and use INNER JOIN + DISTINCT for "customers who ordered"?</summary><div class="qa-body">The answer is right but the work is wrong: the join first builds 10 rows (one per order), then DISTINCT sorts or hashes them back to 6. It also breaks as soon as you SELECT any order column (rows are no longer duplicates) or COUNT without DISTINCT (10 "customers"). EXISTS states the real question and stops at the first match.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: logical vs physical join. If the optimizer switches from a hash join to a nested loop, can the result change?</summary><div class="qa-body">No. INNER/LEFT/FULL fix <em>which</em> rows come out; nested loop, hash and merge are only ways to find the matching pairs. The three EXPLAIN plans in section 10 are for the same query and return the same 10 rows. Only speed and memory use change (and row <em>order</em>, if you forgot ORDER BY).</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sql_subqueries">Subqueries, CTEs &amp; Views</a>.</b> Every join here combined tables that already exist. "Orders above the average order", "each restaurant's own average", "customers whose referral chain reaches Asha" all need to combine a table with the <em>result of another query</em>, which is also how we wrote the fan-out fix.</div>
</main>
`
});
