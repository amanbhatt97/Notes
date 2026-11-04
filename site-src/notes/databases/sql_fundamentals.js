// notes/databases/sql_fundamentals.js — Querying Basics
Object.assign(TOPIC_CONTENT, {
  "sql_fundamentals": `<main>
  <h1>Querying Basics</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Querying Basics</span></div>
  <p class="lead">This is the page where you start asking a database questions in SQL. Every query you will ever write, however long, is built from a small set of pieces: choosing columns, keeping only some rows, summarising many rows into one number, summarising per group, handling missing values, labelling rows with conditions, sorting, and changing data. Most SQL interview questions are these same pieces combined with the rules about NULL and ordering that catch people out, so we go slowly and check every result by hand. All queries run on the <strong>Biteful</strong> food-delivery database designed in <a class="xref" data-note="sql_relational">Relational Model &amp; PostgreSQL</a>: 7 customers, 5 restaurants, 10 orders and 15 order lines, small enough to verify every number. Every output shown is the real output from PostgreSQL 16 (and, in one place, from SQLite, to show where engines differ).</p>

  <h2 id="sf-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Querying Basics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Reading rows</div>
        <ul>
          <li><b>SELECT</b> picks or computes columns; <b>FROM</b> names the table</li>
          <li><b>WHERE</b> keeps rows where the condition is TRUE</li>
          <li>AND binds tighter than OR; BETWEEN is inclusive</li>
          <li>Integer ÷ integer truncates: 32 / 60 = 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Execution order</div>
        <ul>
          <li>FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</li>
          <li>SELECT aliases are not visible in WHERE</li>
          <li>Aggregates are not allowed in WHERE: use HAVING</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Summaries</div>
        <ul>
          <li><b>COUNT, SUM, AVG, MIN, MAX</b>: many rows → one value</li>
          <li><b>GROUP BY</b>: one output row per group</li>
          <li><b>HAVING</b> filters groups; WHERE filters rows</li>
          <li><b>CASE</b> inside an aggregate: several counts in one pass</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">NULL</div>
        <ul>
          <li>Comparisons with NULL give UNKNOWN; WHERE drops it</li>
          <li>Test with <code>IS NULL</code>; default with <code>COALESCE</code></li>
          <li>COUNT(*) counts rows; COUNT(col) skips NULLs</li>
          <li>NOT IN with a NULL in the list returns nothing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Order and changes</div>
        <ul>
          <li>No ORDER BY = no guaranteed order; NULLs first in DESC (Postgres)</li>
          <li>LIMIT on ties needs a tiebreaker</li>
          <li>UPDATE/DELETE without WHERE hit every row</li>
          <li>UPSERT: <code>ON CONFLICT … DO UPDATE</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sf-select"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">SELECT and Expressions</span><span class="rm-sub">asking a table for columns</span></div></div>
      <div class="rm-item rm-done" data-target="sf-where"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Filtering with WHERE</span><span class="rm-sub">keeping only the rows you want</span></div></div>
      <div class="rm-item rm-done" data-target="sf-exec"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Logical Execution Order</span><span class="rm-sub">the order the database really reads clauses</span></div></div>
      <div class="rm-item rm-done" data-target="sf-agg"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Aggregate Functions</span><span class="rm-sub">many rows into one number</span></div></div>
      <div class="rm-item rm-done" data-target="sf-group"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">GROUP BY</span><span class="rm-sub">one summary per group</span></div></div>
      <div class="rm-item rm-done" data-target="sf-having"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">HAVING vs WHERE</span><span class="rm-sub">filtering groups instead of rows</span></div></div>
      <div class="rm-item rm-done" data-target="sf-null"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">NULL and Three-Valued Logic</span><span class="rm-sub">what happens with missing values</span></div></div>
      <div class="rm-item rm-done" data-target="sf-case"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">CASE and Conditional Aggregation</span><span class="rm-sub">if/else and side-by-side counts</span></div></div>
      <div class="rm-item rm-done" data-target="sf-sort"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">ORDER BY, DISTINCT and LIMIT</span><span class="rm-sub">sorting, ties, paging, de-duplicating</span></div></div>
      <div class="rm-item rm-done" data-target="sf-write"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">INSERT, UPDATE and DELETE</span><span class="rm-sub">changing data safely</span></div></div>
      <div class="rm-item rm-done" data-target="sf-upsert"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">UPSERT</span><span class="rm-sub">insert or update in one step</span></div></div>
      <div class="rm-item rm-done" data-target="sf-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">quotes, case, misplaced conditions</span></div></div>
      <div class="rm-item rm-done" data-target="sf-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">syntax, rules and gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="sf-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">predict the output, explain the rule</span></div></div>
    </div>
  </div>

  <h2 id="sf-select"><span class="num">01</span>SELECT and Expressions</h2>
  <p>Data in a relational database sits in tables, and even the simplest question, "show me the orders", needs a way to say which table you mean and which columns you want back. SQL's answer is the <strong>SELECT statement</strong>: <code>FROM</code> names the table to read, and <code>SELECT</code> lists the columns (or calculations) to return, one output row for each row of the table. <code>SELECT *</code> means "every column". Here is Biteful's <code>orders</code> table, which most of this page uses; keep it in view, because every result below can be checked against it:</p>
  <div class="fx" data-lang="sql">SELECT * FROM orders;</div>
  <div class="fx" data-lang="text"> order_id | customer_id | restaurant_id |        ordered_at         |  status   | amount | delivery_minutes 
----------+-------------+---------------+---------------------------+-----------+--------+------------------
      101 |           1 |            10 | 2026-03-02 12:10:00+05:30 | delivered | 240.00 |               32
      102 |           2 |            11 | 2026-03-02 13:05:00+05:30 | delivered | 450.00 |               41
      103 |           3 |            12 | 2026-03-02 20:30:00+05:30 | delivered | 520.00 |               38
      104 |           1 |            12 | 2026-03-03 13:15:00+05:30 | delivered | 380.00 |             NULL
      105 |           4 |            13 | 2026-03-03 19:45:00+05:30 | cancelled | 310.00 |             NULL
      106 |           2 |            11 | 2026-03-04 12:40:00+05:30 | delivered | 180.00 |               25
      107 |           5 |            12 | 2026-03-04 21:10:00+05:30 | cancelled | 260.00 |             NULL
      108 |           3 |            10 | 2026-03-05 18:20:00+05:30 | delivered | 260.00 |               29
      109 |           6 |            11 | 2026-03-05 20:05:00+05:30 | delivered | 600.00 |               52
      110 |           1 |            10 | 2026-03-08 20:50:00+05:30 | pending   | 310.00 |             NULL
(10 rows)</div>
  <p>The restaurant ids stand for 10 Dosa Hut, 11 Biryani Bros, 12 Pizza Point, 13 Green Bowl and 14 Momo Magic (which has no orders). The customer ids stand for 1 Asha, 2 Ben, 3 Chen, 4 Dia, 5 Esha (whose city is unknown), 6 Farah and 7 Gita (who has never ordered).</p>
  <p>A column in the SELECT list does not have to be a stored column. It can be any <strong>expression</strong>: a combination of columns, fixed values, arithmetic and functions, worked out separately for every row. You can give each output column a name with <code>AS</code>; that name is called an <strong>alias</strong>. Food delivery in India carries 5% GST, so the tax and the total including tax are:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount, amount * 0.05 AS gst, amount * 1.05 AS with_gst
FROM orders;</div>
  <div class="fx" data-lang="text"> order_id | amount |   gst   | with_gst 
----------+--------+---------+----------
      101 | 240.00 | 12.0000 | 252.0000
      102 | 450.00 | 22.5000 | 472.5000
      103 | 520.00 | 26.0000 | 546.0000
      104 | 380.00 | 19.0000 | 399.0000
      105 | 310.00 | 15.5000 | 325.5000
      106 | 180.00 |  9.0000 | 189.0000
      107 | 260.00 | 13.0000 | 273.0000
      108 | 260.00 | 13.0000 | 273.0000
      109 | 600.00 | 30.0000 | 630.0000
      110 | 310.00 | 15.5000 | 325.5000
(10 rows)</div>
  <p>Check one row by hand: order 101 is ₹240, and 240 × 0.05 = 12 and 240 × 1.05 = 252. Each row is calculated independently, and the table itself is not changed at all; SELECT only produces a new result. It is like asking a clerk to copy some columns from a register onto a fresh sheet and add a calculated column; the register stays as it was. Text has expressions too: <code>||</code> joins two strings, and functions like <code>UPPER</code> transform them:</p>
  <div class="fx" data-lang="sql">SELECT name || ' (' || city || ')' AS label, UPPER(cuisine) AS cuisine
FROM restaurants;</div>
  <div class="fx" data-lang="text">         label         |   cuisine    
-----------------------+--------------
 Dosa Hut (Pune)       | SOUTH INDIAN
 Biryani Bros (Mumbai) | BIRYANI
 Pizza Point (Pune)    | PIZZA
 Green Bowl (Mumbai)   | HEALTHY
 Momo Magic (Pune)     | TIBETAN
(5 rows)</div>
  <p>A table can also get an alias, written after its name (<code>FROM orders o</code> or <code>FROM orders AS o</code>), so that columns can be written as <code>o.amount</code>. That becomes essential once a query reads several tables. And although <code>SELECT *</code> is handy for exploring, real code should list its columns: it reads only what it needs and does not break when someone adds a column.</p>
  <p>Arithmetic hides one trap that catches almost everyone. A calculator says 7 ÷ 2 is 3.5. PostgreSQL says it is 3, because when both numbers are integers (whole numbers), the result is an integer and the fraction is simply thrown away. This is called <strong>integer division</strong>. <code>delivery_minutes</code> is an integer column, so converting it to hours goes wrong:</p>
  <div class="fx" data-lang="sql">SELECT order_id, delivery_minutes,
       delivery_minutes / 60   AS hours_wrong,
       delivery_minutes / 60.0 AS hours_right
FROM orders
WHERE order_id IN (101, 109);</div>
  <div class="fx" data-lang="text"> order_id | delivery_minutes | hours_wrong |      hours_right       
----------+------------------+-------------+------------------------
      101 |               32 |           0 | 0.53333333333333333333
      109 |               52 |           0 | 0.86666666666666666667
(2 rows)</div>
  <p>32 / 60 and 52 / 60 both come out as 0. Make either side a decimal, by writing <code>60.0</code> or by casting with <code>::numeric</code>, and the fraction comes back: 0.53 and 0.87 hours. The same trap ruins rates built from two counts (7 delivered out of 10 is 0, not 0.7), which we will meet again in section 08. So far every query returns all ten orders. Most questions are about some of them.</p>

  <h2 id="sf-where"><span class="num">02</span>Filtering with WHERE</h2>
  <p>"Delivered orders only", "orders above ₹300", "orders placed on 5 March": each needs a way to keep some rows and drop the rest. The <strong>WHERE clause</strong> does this. It holds a condition, the database tests it against each row, and only rows for which the condition is TRUE make it into the result. Think of a bouncer checking each guest against a rule: only a clear "yes" gets in.</p>
  <div class="fx" data-lang="sql">SELECT order_id, status, amount FROM orders WHERE status = 'delivered';</div>
  <div class="fx" data-lang="text"> order_id |  status   | amount 
----------+-----------+--------
      101 | delivered | 240.00
      102 | delivered | 450.00
      103 | delivered | 520.00
      104 | delivered | 380.00
      106 | delivered | 180.00
      108 | delivered | 260.00
      109 | delivered | 600.00
(7 rows)</div>
  <p>Seven of the ten orders pass; 105 and 107 (cancelled) and 110 (pending) are dropped. Conditions can be combined with <code>AND</code> (both must be true), <code>OR</code> (at least one must be true) and <code>NOT</code>. When you mix AND and OR you must use brackets, because SQL, like arithmetic, has an order of precedence: <code>NOT</code> is applied first, then <code>AND</code>, then <code>OR</code>, just as multiplication happens before addition. Here is the question "delivered or pending orders above ₹300", first without brackets and then with them:</p>
  <div class="fx" data-lang="sql">SELECT order_id, status, amount FROM orders
WHERE status = 'delivered' OR status = 'pending' AND amount &gt; 300;
SELECT order_id, status, amount FROM orders
WHERE (status = 'delivered' OR status = 'pending') AND amount &gt; 300;</div>
  <div class="fx" data-lang="text"> order_id |  status   | amount 
----------+-----------+--------
      101 | delivered | 240.00
      102 | delivered | 450.00
      103 | delivered | 520.00
      104 | delivered | 380.00
      106 | delivered | 180.00
      108 | delivered | 260.00
      109 | delivered | 600.00
      110 | pending   | 310.00
(8 rows)

 order_id |  status   | amount 
----------+-----------+--------
      102 | delivered | 450.00
      103 | delivered | 520.00
      104 | delivered | 380.00
      109 | delivered | 600.00
      110 | pending   | 310.00
(5 rows)</div>
  <p>The first query returned 8 rows, including 101 (₹240), 106 (₹180) and 108 (₹260), which are not above ₹300. Because AND binds tighter, SQL read it as <code>delivered OR (pending AND amount &gt; 300)</code>: every delivered order, plus pending ones over 300. The bracketed version gives the five rows we meant. There was no error, just a wrong answer that looks plausible, which is the most dangerous kind.</p>
  <p>A few operators make common conditions shorter. <code>IN (…)</code> is shorthand for several ORs on one column. <code>BETWEEN a AND b</code> means "at least a and at most b", inclusive at both ends. <code>LIKE</code> matches text against a pattern in which <code>%</code> stands for any run of characters (including none) and <code>_</code> for exactly one character; PostgreSQL also has <code>ILIKE</code>, which ignores upper and lower case. Comparisons use <code>=</code>, <code>&lt;&gt;</code> (not equal; <code>!=</code> also works), <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code> and <code>&gt;=</code>.</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount FROM orders WHERE amount BETWEEN 260 AND 380;
SELECT order_id, status FROM orders WHERE status IN ('pending', 'cancelled');
SELECT order_id, item FROM order_items WHERE item LIKE '%Biryani';</div>
  <div class="fx" data-lang="text"> order_id | amount 
----------+--------
      104 | 380.00
      105 | 310.00
      107 | 260.00
      108 | 260.00
      110 | 310.00
(5 rows)

 order_id |  status   
----------+-----------
      105 | cancelled
      107 | cancelled
      110 | pending
(3 rows)

 order_id |      item       
----------+-----------------
      102 | Chicken Biryani
      106 | Veg Biryani
      109 | Chicken Biryani
(3 rows)</div>
  <p>BETWEEN kept both edges: 380 (order 104) and both 260s (107 and 108). IN found the two cancelled orders and the pending one. LIKE '%Biryani' matched any item ending in "Biryani", which gives three order lines.</p>
  <p>BETWEEN has a nasty trap with timestamps (values with both a date and a time). Suppose you want the orders from 5 March to 8 March:</p>
  <div class="fx" data-lang="sql">SELECT order_id, ordered_at FROM orders
WHERE ordered_at BETWEEN '2026-03-05' AND '2026-03-08';
SELECT order_id, ordered_at FROM orders
WHERE ordered_at &gt;= '2026-03-05' AND ordered_at &lt; '2026-03-09';</div>
  <div class="fx" data-lang="text"> order_id |        ordered_at         
----------+---------------------------
      108 | 2026-03-05 18:20:00+05:30
      109 | 2026-03-05 20:05:00+05:30
(2 rows)

 order_id |        ordered_at         
----------+---------------------------
      108 | 2026-03-05 18:20:00+05:30
      109 | 2026-03-05 20:05:00+05:30
      110 | 2026-03-08 20:50:00+05:30
(3 rows)</div>
  <p>The BETWEEN version lost order 110, placed on 8 March at 20:50. The reason is that a date written alone, <code>'2026-03-08'</code>, means midnight at the <em>start</em> of 8 March when compared with a timestamp, so BETWEEN stops at 00:00 and misses almost the whole last day. The second query uses a <strong>half-open range</strong>: greater than or equal to the start, and strictly less than the start of the next day. It includes every moment of 8 March, whatever the time.</p>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <line x1="40" y1="50" x2="570" y2="50" stroke="currentColor"/>
    <g stroke="currentColor"><line x1="60" y1="44" x2="60" y2="56"/><line x1="440" y1="44" x2="440" y2="56"/><line x1="520" y1="44" x2="520" y2="56"/></g>
    <g font-size="10" text-anchor="middle" class="tm"><text x="60" y="38">Mar 5 00:00</text><text x="425" y="38">Mar 8 00:00</text><text x="530" y="38">Mar 9 00:00</text></g>
    <circle cx="495" cy="50" r="6" class="fr sr"/><text x="475" y="16" text-anchor="middle" font-size="10" class="tr">order 110 at Mar 8 20:50</text>
    <rect x="60" y="66" width="380" height="24" rx="4" class="fr sr"/><text x="70" y="82" font-size="10">BETWEEN '2026-03-05' AND '2026-03-08'</text>
    <text x="450" y="82" font-size="10" class="tr">✗ misses it</text>
    <rect x="60" y="100" width="460" height="24" rx="4" class="fg sg"/><text x="70" y="116" font-size="10">ts &gt;= '2026-03-05' AND ts &lt; '2026-03-09'</text>
    <text x="528" y="116" font-size="10" class="tg">✓</text>
  </svg><figcaption>The BETWEEN range (red) ends at midnight at the start of 8 March; the half-open range (green) runs up to, but not including, midnight at the start of 9 March.</figcaption></figure>
  <p>The figure shows the two ranges on a timeline. Order 110 sits late on 8 March: outside the red bar, inside the green one. Use half-open ranges for every time period (days, months, years); they also join up without overlaps, because each period ends exactly where the next begins. Now a puzzle that leads to the next section: if you try <code>WHERE with_gst &gt; 500</code> using the alias from section 01, PostgreSQL says the column does not exist, even though it is right there in the SELECT.</p>

  <h2 id="sf-exec"><span class="num">03</span>Logical Execution Order</h2>
  <p>We write a query starting with SELECT, so it is natural to assume SELECT happens first. It does not. The database evaluates the clauses in a fixed <strong>logical order</strong> that has nothing to do with the order you type them, and each step works on the table produced by the step before. A name or a value created at one step can only be used by later steps. That single rule explains a whole family of confusing errors.</p>
  <figure class="viz"><svg viewBox="0 0 600 205" width="600">
    <text x="38" y="20" text-anchor="middle" font-size="10" class="tm">1</text><rect x="5" y="26" width="66" height="34" rx="6" class="fb"/><text x="38" y="47" text-anchor="middle" font-size="10" font-weight="bold">FROM</text><line x1="71" y1="43" x2="79" y2="43" stroke="currentColor"/><text x="112" y="20" text-anchor="middle" font-size="10" class="tm">2</text><rect x="79" y="26" width="66" height="34" rx="6" class="fb"/><text x="112" y="47" text-anchor="middle" font-size="10" font-weight="bold">WHERE</text><line x1="145" y1="43" x2="153" y2="43" stroke="currentColor"/><text x="186" y="20" text-anchor="middle" font-size="10" class="tm">3</text><rect x="153" y="26" width="66" height="34" rx="6" class="ft"/><text x="186" y="47" text-anchor="middle" font-size="10" font-weight="bold">GROUP BY</text><line x1="219" y1="43" x2="227" y2="43" stroke="currentColor"/><text x="260" y="20" text-anchor="middle" font-size="10" class="tm">4</text><rect x="227" y="26" width="66" height="34" rx="6" class="ft"/><text x="260" y="47" text-anchor="middle" font-size="10" font-weight="bold">HAVING</text><line x1="293" y1="43" x2="301" y2="43" stroke="currentColor"/><text x="334" y="20" text-anchor="middle" font-size="10" class="tm">5</text><rect x="301" y="26" width="66" height="34" rx="6" class="fg"/><text x="334" y="47" text-anchor="middle" font-size="10" font-weight="bold">SELECT</text><line x1="367" y1="43" x2="375" y2="43" stroke="currentColor"/><text x="408" y="20" text-anchor="middle" font-size="10" class="tm">6</text><rect x="375" y="26" width="66" height="34" rx="6" class="fs"/><text x="408" y="47" text-anchor="middle" font-size="10" font-weight="bold">DISTINCT</text><line x1="441" y1="43" x2="449" y2="43" stroke="currentColor"/><text x="482" y="20" text-anchor="middle" font-size="10" class="tm">7</text><rect x="449" y="26" width="66" height="34" rx="6" class="fs"/><text x="482" y="47" text-anchor="middle" font-size="10" font-weight="bold">ORDER BY</text><line x1="515" y1="43" x2="523" y2="43" stroke="currentColor"/><text x="556" y="20" text-anchor="middle" font-size="10" class="tm">8</text><rect x="523" y="26" width="66" height="34" rx="6" class="fs"/><text x="556" y="47" text-anchor="middle" font-size="10" font-weight="bold">LIMIT</text>
    <rect x="5" y="80" width="140" height="24" rx="5" class="fb sb"/><text x="13" y="96" font-size="10">raw rows only</text>
    <rect x="153" y="112" width="436" height="24" rx="5" class="ft st"/><text x="161" y="128" font-size="10">groups + aggregates exist: HAVING, SELECT, ORDER BY can use them</text>
    <rect x="301" y="144" width="288" height="24" rx="5" class="fg sg"/><text x="309" y="160" font-size="10">SELECT aliases exist: ORDER BY can use</text>
    <text x="5" y="192" font-size="11" class="tr">✗ WHERE with_gst &gt; 500 · ✗ WHERE COUNT(*) &gt; 1</text>
    <text x="589" y="192" font-size="11" text-anchor="end" class="tg">✓ ORDER BY with_gst</text>
  </svg><figcaption>Each bar shows what exists from that step onward. WHERE runs at step 2, before groups or aliases exist.</figcaption></figure>
  <p>Read the figure left to right. Step 1, FROM, fetches the table's rows. Step 2, WHERE, throws away rows that fail the condition. Steps 3 and 4, GROUP BY and HAVING, form groups and filter them (sections 05 and 06). Step 5, SELECT, finally computes the output columns and gives them their aliases. Step 6 removes duplicate rows if DISTINCT was asked for, step 7 sorts, and step 8 keeps only the first few rows. The bars underneath show what exists from each step onward: at WHERE there are only raw rows, so neither aliases nor group totals can be mentioned there. A kitchen works the same way: you fetch the ingredients, discard the bad ones, sort them into bowls, drop the bowls that are too small, cook and name the dish, remove duplicate plates, arrange them, and serve a few. You cannot refer to a dish by its name before it has been cooked.</p>
  <p>Let us trace one query through the pipeline. The question is "the two biggest delivered orders, with GST":</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount, amount * 1.05 AS with_gst
FROM orders
WHERE status = 'delivered'
ORDER BY with_gst DESC
LIMIT 2;</div>
  <div class="fx" data-lang="text"> order_id | amount | with_gst 
----------+--------+----------
      109 | 600.00 | 630.0000
      103 | 520.00 | 546.0000
(2 rows)</div>
  <table class="tbl">
    <tr><th>Step</th><th>What happens</th><th>Rows afterwards</th></tr>
    <tr><td>1 FROM orders</td><td>all orders fetched</td><td>101 to 110 (10 rows)</td></tr>
    <tr><td>2 WHERE status = 'delivered'</td><td>105, 107, 110 dropped</td><td>101, 102, 103, 104, 106, 108, 109 (7 rows)</td></tr>
    <tr><td>5 SELECT … AS with_gst</td><td>with_gst computed per row</td><td>same 7 rows, now with 252, 472.5, 546, 399, 189, 273, 630</td></tr>
    <tr><td>7 ORDER BY with_gst DESC</td><td>sorted, biggest first</td><td>109, 103, 102, 104, 108, 101, 106</td></tr>
    <tr><td>8 LIMIT 2</td><td>first two kept</td><td>109 (630), 103 (546)</td></tr>
  </table>
  <p>Steps 3, 4 and 6 do nothing here because the query has no GROUP BY, HAVING or DISTINCT. Notice that LIMIT comes last, after sorting; that is precisely why "top N" questions work. Now the alias puzzle from the end of section 02 makes sense:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount * 1.05 AS with_gst FROM orders WHERE with_gst &gt; 500;
SELECT order_id, amount * 1.05 AS with_gst FROM orders WHERE amount * 1.05 &gt; 500 ORDER BY with_gst DESC;</div>
  <div class="fx" data-lang="text">ERROR:  column "with_gst" does not exist
LINE 1: ...r_id, amount * 1.05 AS with_gst FROM orders WHERE with_gst &gt;...
                                                             ^
 order_id | with_gst 
----------+----------
      109 | 630.0000
      103 | 546.0000
(2 rows)</div>
  <p>The first query fails because <code>with_gst</code> is created at step 5 and WHERE runs at step 2, when that name does not yet exist. The second query repeats the expression in WHERE instead, and uses the alias in ORDER BY, which runs at step 7 and can see it. (Wrapping the query in a subquery or CTE also works, because the alias then exists before the outer WHERE runs; see <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>.)</p>
  <p>One clarification: this is the order of <em>meaning</em>, not necessarily the order of physical work. The planner may use an index or push a filter earlier to save time, but it guarantees the same result as this logical order. Whenever PostgreSQL says a name "does not exist" or an aggregate "is not allowed", ask two questions: at which step was this created, and at which step am I using it?</p>

  <h2 id="sf-agg"><span class="num">04</span>Aggregate Functions</h2>
  <p>The questions a business asks most often are not about individual rows at all: "How many orders did we take?", "How much money came in?", "What was the biggest order?" The answer to each is a single number calculated from many rows. A shopkeeper does this at closing time: count the bills in the drawer, add up the cash, note the smallest and largest bill. SQL does it with <strong>aggregate functions</strong>, which take the values of a column across many rows and return one value: <code>COUNT</code> (how many), <code>SUM</code> (total), <code>AVG</code> (average), <code>MIN</code> and <code>MAX</code> (smallest and largest). <code>COUNT(*)</code> counts rows. Without any grouping, the whole table (after WHERE) is treated as one group and the result is one row:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS orders, SUM(amount) AS total, AVG(amount) AS average,
       MIN(amount) AS smallest, MAX(amount) AS largest
FROM orders;
SELECT COUNT(*) AS orders, SUM(amount) AS total, ROUND(AVG(amount), 2) AS average
FROM orders
WHERE status = 'delivered';
SELECT restaurant_id, SUM(amount) FROM orders;</div>
  <div class="fx" data-lang="text"> orders |  total  |       average        | smallest | largest 
--------+---------+----------------------+----------+---------
     10 | 3510.00 | 351.0000000000000000 |   180.00 |  600.00
(1 row)

 orders |  total  | average 
--------+---------+---------
      7 | 2630.00 |  375.71
(1 row)

ERROR:  column "orders.restaurant_id" must appear in the GROUP BY clause or be used in an aggregate function
LINE 1: SELECT restaurant_id, SUM(amount) FROM orders;
               ^</div>
  <p>Check by hand: 240 + 450 + 520 + 380 + 310 + 180 + 260 + 260 + 600 + 310 = 3,510 over 10 orders, an average of 351 (PostgreSQL prints many decimal places; <code>ROUND(x, 2)</code> keeps two). In the second query WHERE removed the three non-delivered orders (310 + 260 + 310 = 880) <em>before</em> the aggregates ran, leaving 2,630 over 7 orders, an average of 375.71. That is the execution order at work: WHERE at step 2, aggregates with the grouping at step 3.</p>
  <p>The third query asks for each restaurant's id next to the total, and PostgreSQL refuses. Ten rows went into SUM and one number came out, so there is no single <code>restaurant_id</code> that could sit next to it; asking "which customer?" about the total cash in the drawer makes no sense. PostgreSQL raises an error rather than guess. (Older MySQL versions quietly picked an arbitrary value instead, which produced wrong reports without anyone noticing.) The error message itself points to the solution: if you want a total per restaurant, you must group by restaurant.</p>

  <h2 id="sf-group"><span class="num">05</span>GROUP BY</h2>
  <p>"Delivered revenue per restaurant" needs the aggregate to be computed separately for each restaurant and labelled with the restaurant. The <strong>GROUP BY clause</strong> does this: it sorts the rows (after WHERE) into piles, one pile for each distinct value of the grouping column, called the <strong>key</strong>, and then every aggregate is computed once per pile. Each pile becomes exactly one output row. Picture sorting a stack of receipts into one pile per restaurant and writing one summary line for each pile. To see the piles before SQL collapses them, here are the delivered orders sorted by restaurant:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, order_id, amount FROM orders
WHERE status = 'delivered'
ORDER BY restaurant_id, order_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | order_id | amount 
---------------+----------+--------
            10 |      101 | 240.00
            10 |      108 | 260.00
            11 |      102 | 450.00
            11 |      106 | 180.00
            11 |      109 | 600.00
            12 |      103 | 520.00
            12 |      104 | 380.00
(7 rows)</div>
  <p>By hand: pile 10 holds 240 and 260, total 500 from 2 orders; pile 11 holds 450, 180 and 600, total 1,230 from 3 orders; pile 12 holds 520 and 380, total 900 from 2 orders. Now let GROUP BY do it:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, COUNT(*) AS orders, SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | orders | revenue 
---------------+--------+---------
            10 |      2 |  500.00
            11 |      3 | 1230.00
            12 |      2 |  900.00
(3 rows)</div>
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
  </svg><figcaption>Seven delivered rows (left) are sorted into three piles by restaurant (middle); each pile becomes one output row (right).</figcaption></figure>
  <p>Seven rows went in and three came out, matching the hand calculation and the figure. Green Bowl (13) has no row: its only order was cancelled and removed by WHERE before the piles were made, so its pile never existed. Momo Magic (14) has no orders at all. GROUP BY only creates piles for keys that are present in the rows; showing restaurants with zero needs a join, covered in <a class="xref" data-note="sql_joins">JOINs</a>.</p>
  <p>Because each pile becomes one row, there is a strict rule about the SELECT list: every column in it must be either a grouping key or an aggregate. Anything else has several values per pile and SQL will not pick one for you:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, order_id, SUM(amount) FROM orders GROUP BY restaurant_id;</div>
  <div class="fx" data-lang="text">ERROR:  column "orders.order_id" must appear in the GROUP BY clause or be used in an aggregate function
LINE 1: SELECT restaurant_id, order_id, SUM(amount) FROM orders GROU...
                              ^</div>
  <p>Pile 11 contains three order ids (102, 106, 109), so "the" <code>order_id</code> of that pile does not exist. The key can also be computed. To count orders per day, group by the date part of <code>ordered_at</code>: <code>ordered_at::date</code> turns 2026-03-02 12:10 and 2026-03-02 20:30 into the same key, 2026-03-02. <code>EXTRACT(DOW FROM ts)</code> pulls out the day of the week (0 is Sunday) and <code>TO_CHAR</code> formats it as text:</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, COUNT(*) AS orders, SUM(amount) AS amount
FROM orders
GROUP BY ordered_at::date
ORDER BY day;
SELECT EXTRACT(DOW FROM ordered_at) AS dow, TO_CHAR(ordered_at, 'Dy') AS day_name, COUNT(*) AS orders
FROM orders
GROUP BY 1, 2
ORDER BY 1;</div>
  <div class="fx" data-lang="text">    day     | orders | amount  
------------+--------+---------
 2026-03-02 |      3 | 1210.00
 2026-03-03 |      2 |  690.00
 2026-03-04 |      2 |  440.00
 2026-03-05 |      2 |  860.00
 2026-03-08 |      1 |  310.00
(5 rows)

 dow | day_name | orders 
-----+----------+--------
   0 | Sun      |      1
   1 | Mon      |      3
   2 | Tue      |      2
   3 | Wed      |      2
   4 | Thu      |      2
(5 rows)</div>
  <p>The first result has no rows for 6 and 7 March because nobody ordered on those days, and again GROUP BY only makes piles for keys that exist. In the second, <code>GROUP BY 1, 2</code> means "group by the first and second SELECT columns"; it is a handy shortcut but fragile if someone reorders the columns. Monday is the busiest day in this tiny sample. Other useful functions for building keys are <code>DATE_TRUNC('month', ts)</code> (round down to the start of the month), date arithmetic like <code>ts + INTERVAL '30 minutes'</code>, and text cleaners such as <code>LOWER</code> and <code>TRIM</code>, which stop "Pune" and "pune " from becoming two different piles.</p>

  <h2 id="sf-having"><span class="num">06</span>HAVING vs WHERE</h2>
  <p>Marketing wants "customers with two or more orders that were not cancelled". Two different filters hide in that sentence. "Not cancelled" is about individual rows: orders 105 and 107 should be thrown out before anything is counted. "Two or more" is about a whole pile: you can only check it after the pile's orders have been counted. WHERE cannot do the second job, because it runs at step 2, before piles exist. So SQL provides a second filter, the <strong>HAVING clause</strong>, which runs at step 4, after GROUP BY, and keeps or discards whole groups. HAVING may use aggregates; WHERE may not.</p>
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
WHERE status &lt;&gt; 'cancelled'      -- row filter, before grouping
GROUP BY customer_id
HAVING COUNT(*) &gt;= 2             -- group filter, after grouping
ORDER BY customer_id;
SELECT customer_id, COUNT(*) FROM orders WHERE COUNT(*) &gt;= 2 GROUP BY customer_id;</div>
  <div class="fx" data-lang="text"> customer_id | live_orders | spent  
-------------+-------------+--------
           1 |           3 | 930.00
           2 |           2 | 630.00
           3 |           2 | 780.00
(3 rows)

ERROR:  aggregate functions are not allowed in WHERE
LINE 1: SELECT customer_id, COUNT(*) FROM orders WHERE COUNT(*) &gt;= 2...
                                                       ^</div>
  <p>Trace the first query through the figure. FROM reads 10 orders. WHERE drops the two cancelled ones (shown dashed), leaving 8. GROUP BY makes four piles: customer 1 (101, 104, 110), customer 2 (102, 106), customer 3 (103, 108) and customer 6 (109). HAVING keeps piles with at least two rows, so Farah's single-order pile is dropped. SELECT then computes each surviving pile's count and sum: Asha 240 + 380 + 310 = 930, Ben 450 + 180 = 630, Chen 520 + 260 = 780. The second query tries to put the pile condition in WHERE, and PostgreSQL rejects it: at step 2 there are no piles, so there is nothing to count.</p>
  <p>Think of exam results. "Ignore the blank answer sheets of absent students" is a WHERE: it is decided sheet by sheet, before any totals exist. "List only the classes whose average is above 60" is a HAVING: it can only be decided once each class's average has been worked out. The rule of thumb is simple: conditions about single rows go in WHERE, conditions about aggregates go in HAVING. Putting a row condition in HAVING either fails (if the column is not a grouping key) or wastes work by grouping rows you are about to throw away.</p>

  <h2 id="sf-null"><span class="num">07</span>NULL and Three-Valued Logic</h2>
  <p>Esha never told Biteful her city, and four orders have no recorded delivery time. What should those cells contain? Not "Pune", not an empty string (that would mean her city is called nothing), and not 0 (that would claim an instant delivery). They contain <strong>NULL</strong>, SQL's marker for "unknown" or "missing". NULL is not a value at all; it is the absence of one, and that has consequences. Ask "is Esha's city Pune?" and the honest answer is neither yes nor no: we do not know. So SQL has a third truth value besides TRUE and FALSE, called <strong>UNKNOWN</strong>, and any ordinary comparison involving NULL produces it. Because WHERE keeps only rows where the condition is TRUE, rows whose condition is UNKNOWN are silently dropped. This system is called <strong>three-valued logic</strong>.</p>
  <p>Think of NULL as a sealed envelope. Is the city in Esha's envelope "Pune"? You cannot say. Is it equal to the city in another sealed envelope? You cannot say that either. The only question you can answer is "is the envelope sealed?", which in SQL is <code>IS NULL</code>.</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE city = NULL;
SELECT name, city FROM customers WHERE city &lt;&gt; 'Pune';
SELECT name FROM customers WHERE city IS NULL;</div>
  <div class="fx" data-lang="text"> name 
------
(0 rows)

 name  |  city  
-------+--------
 Ben   | Mumbai
 Dia   | Mumbai
 Farah | Mumbai
(3 rows)

 name 
------
 Esha
(1 row)</div>
  <p>The first query returns nothing, not even Esha: <code>city = NULL</code> asks "is the city equal to unknown?", which is UNKNOWN for every row. The second asks for customers not in Pune and quietly leaves Esha out, because <code>NULL &lt;&gt; 'Pune'</code> is UNKNOWN too. Only <code>IS NULL</code> finds her. That second query is the dangerous one: it looks correct, and in a report of "customers outside Pune" one customer has simply vanished.</p>
  <p>SQL provides a few tools for working with NULL. <code>COALESCE(a, b, …)</code> returns its first argument that is not NULL, so it supplies a default. <code>NULLIF(a, b)</code> does the reverse, returning NULL when a equals b; <code>x / NULLIF(y, 0)</code> avoids a division-by-zero error. <code>IS DISTINCT FROM</code> is a NULL-safe "not equal" that treats NULL as an ordinary value. Here they are on Dia and Esha:</p>
  <div class="fx" data-lang="sql">SELECT name, city,
       COALESCE(city, 'unknown')               AS city_or_default,
       city IS DISTINCT FROM 'Pune'            AS not_pune_safe,
       name || ' (' || city || ')'             AS label_pipes,
       CONCAT(name, ' (', city, ')')           AS label_concat
FROM customers
WHERE customer_id IN (4, 5);</div>
  <div class="fx" data-lang="text"> name |  city  | city_or_default | not_pune_safe | label_pipes  | label_concat 
------+--------+-----------------+---------------+--------------+--------------
 Dia  | Mumbai | Mumbai          | t             | Dia (Mumbai) | Dia (Mumbai)
 Esha | NULL   | unknown         | t             | NULL         | Esha ()
(2 rows)</div>
  <p>Dia's row is ordinary. For Esha, COALESCE substitutes "unknown"; <code>IS DISTINCT FROM 'Pune'</code> gives a definite <code>t</code> (true) instead of UNKNOWN, so it would include her in "not Pune"; joining strings with <code>||</code> produced NULL for the whole label, because NULL spreads through almost any expression it touches; and <code>CONCAT</code> treats NULL as empty text instead.</p>
  <p>What happens when UNKNOWN meets AND, OR and NOT? Go back to the envelope. "TRUE AND envelope" depends on what is inside, so it is UNKNOWN. "FALSE AND envelope" is false whatever is inside, so it is FALSE. "TRUE OR envelope" is true whatever is inside, so it is TRUE. PostgreSQL displays UNKNOWN as NULL:</p>
  <div class="fx" data-lang="sql">SELECT TRUE AND NULL AS t_and_u, FALSE AND NULL AS f_and_u,
       TRUE OR NULL AS t_or_u, FALSE OR NULL AS f_or_u, NOT NULL::boolean AS not_u;</div>
  <div class="fx" data-lang="text"> t_and_u | f_and_u | t_or_u | f_or_u | not_u 
---------+---------+--------+--------+-------
 NULL    | f       | t      | NULL   | NULL
(1 row)</div>
  <table class="tbl">
    <tr><th>A</th><th>B</th><th>A AND B</th><th>A OR B</th></tr>
    <tr><td>TRUE</td><td>UNKNOWN</td><td>UNKNOWN</td><td>TRUE</td></tr>
    <tr><td>FALSE</td><td>UNKNOWN</td><td>FALSE</td><td>UNKNOWN</td></tr>
    <tr><td>UNKNOWN</td><td>UNKNOWN</td><td>UNKNOWN</td><td>UNKNOWN</td></tr>
  </table>
  <p>The rule to remember is short: FALSE AND anything is FALSE, TRUE OR anything is TRUE, and every other combination with UNKNOWN stays UNKNOWN; NOT UNKNOWN is also UNKNOWN. So <code>city = 'Pune' OR city &lt;&gt; 'Pune'</code>, which sounds like "everyone", is UNKNOWN OR UNKNOWN for Esha, and she is dropped.</p>
  <p>NULL also changes how aggregates count. <code>COUNT</code> answers three different questions depending on what is in its brackets: <code>COUNT(*)</code> counts rows, <code>COUNT(column)</code> counts the non-NULL values in that column, and <code>COUNT(DISTINCT column)</code> counts the different non-NULL values. Every aggregate other than <code>COUNT(*)</code> skips NULLs:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS all_rows, COUNT(city) AS with_city, COUNT(DISTINCT city) AS cities
FROM customers;
SELECT COUNT(*) AS orders, COUNT(delivery_minutes) AS timed, SUM(delivery_minutes) AS total_min,
       ROUND(AVG(delivery_minutes), 2) AS avg_min,
       ROUND(AVG(COALESCE(delivery_minutes, 0)), 2) AS avg_null_as_zero
FROM orders;</div>
  <div class="fx" data-lang="text"> all_rows | with_city | cities 
----------+-----------+--------
        7 |         6 |      2
(1 row)

 orders | timed | total_min | avg_min | avg_null_as_zero 
--------+-------+-----------+---------+------------------
     10 |     6 |       217 |   36.17 |            21.70
(1 row)</div>
  <p>Customers: 7 rows, 6 known cities (Esha skipped) and 2 distinct cities (Mumbai and Pune). Orders: 10 rows but only 6 delivery times, which sum to 32 + 41 + 38 + 25 + 29 + 52 = 217 minutes. <code>AVG</code> divides by the 6 known values, giving 36.17 minutes. Turning NULL into 0 first gives 21.70, which pretends four orders were delivered instantly. Which number is right is a business question, but it must be chosen on purpose, not by accident.</p>
  <p>A related surprise appears when an aggregate has no rows at all. Momo Magic has no orders:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) AS orders, SUM(amount) AS revenue, AVG(amount) AS avg_amount,
       COALESCE(SUM(amount), 0) AS revenue_or_zero
FROM orders
WHERE restaurant_id = 14;</div>
  <div class="fx" data-lang="text"> orders | revenue | avg_amount | revenue_or_zero 
--------+---------+------------+-----------------
      0 |    NULL |       NULL |               0
(1 row)</div>
  <p>COUNT of nothing is 0, but SUM and AVG of nothing are NULL, meaning "no data", not zero. Wrap the result in <code>COALESCE(…, 0)</code> when a report needs a number.</p>
  <p>The most famous NULL trap is <code>NOT IN</code>. Suppose we want the customers who have never referred anyone, and write "customer_id is not in the list of referred_by values". That list contains 1, 1, 2 and four NULLs:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers);
SELECT name FROM customers
WHERE customer_id NOT IN (SELECT referred_by FROM customers WHERE referred_by IS NOT NULL);</div>
  <div class="fx" data-lang="text"> name 
------
(0 rows)

 name  
-------
 Chen
 Dia
 Esha
 Farah
 Gita
(5 rows)</div>
  <p>The first query returns zero rows. For Chen, <code>3 NOT IN (1, 1, 2, NULL, …)</code> expands to <code>3 &lt;&gt; 1 AND 3 &lt;&gt; 2 AND 3 &lt;&gt; NULL …</code>, which is TRUE AND TRUE AND UNKNOWN, which is UNKNOWN; the same happens for every customer, so nobody is ever TRUE. Removing the NULLs from the list gives the five customers we expected. The safer pattern, <code>NOT EXISTS</code>, is covered in <a class="xref" data-note="sql_joins">JOINs</a> and <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>. None of these NULL traps raises an error, which is exactly why interviewers love them.</p>

  <h2 id="sf-case"><span class="num">08</span>CASE and Conditional Aggregation</h2>
  <p>A marksheet stores marks, but the report card shows grades: someone applied a rule such as "90 and above is A". The <strong>CASE expression</strong> is SQL's way of applying such rules; it is SQL's if/else. It checks its <code>WHEN</code> conditions from top to bottom and returns the <code>THEN</code> value of the first one that is TRUE; if none is TRUE it returns the <code>ELSE</code> value, and if there is no ELSE it returns NULL. Here restaurants are put into rating bands, first naively and then correctly:</p>
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
  <div class="fx" data-lang="text">     name     | rating |    band    
--------------+--------+------------
 Dosa Hut     |    4.5 | top
 Biryani Bros |    4.2 | good
 Pizza Point  |    3.9 | needs work
 Green Bowl   |    4.2 | good
 Momo Magic   |   NULL | needs work
(5 rows)

     name     | rating |    band    
--------------+--------+------------
 Dosa Hut     |    4.5 | top
 Biryani Bros |    4.2 | good
 Pizza Point  |    3.9 | needs work
 Green Bowl   |    4.2 | good
 Momo Magic   |   NULL | new
(5 rows)</div>
  <p>In the naive version Momo Magic, which simply has no rating yet, is labelled "needs work". Both of its comparisons were UNKNOWN (not TRUE), so it fell through to ELSE: three-valued logic again. Testing <code>IS NULL</code> in the first branch fixes it. Order matters as well: Dosa Hut's 4.5 satisfies both <code>&gt;= 4.4</code> and <code>&gt;= 4.0</code>, and gets "top" because the first true branch wins and checking stops.</p>
  <p>CASE becomes really powerful inside an aggregate, a technique called <strong>conditional aggregation</strong>. The ops team wants a cancellation rate per restaurant, which means "how many were cancelled" and "how many in total" side by side in the same row. WHERE cannot help, because it can only keep one kind of row at a time. The trick is to turn each row into a 1 or a 0 with <code>CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END</code>. The <code>SUM</code> of those 1s and 0s is the number cancelled, and their <code>AVG</code> is the fraction cancelled. PostgreSQL also offers <code>FILTER (WHERE …)</code> after an aggregate, a cleaner way to write the same conditional count. Think of a tally sheet with several columns: you go through the receipts once and put a mark in "delivered", "cancelled" or "pending" for each, and at the end every column has its own total.</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id,
       COUNT(*) AS orders,
       COUNT(*) FILTER (WHERE status = 'delivered')         AS delivered,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       ROUND(AVG(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0 END), 2) AS cancel_rate
FROM orders
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | orders | delivered | cancelled | cancel_rate 
---------------+--------+-----------+-----------+-------------
            10 |      3 |         2 |         0 |        0.00
            11 |      3 |         3 |         0 |        0.00
            12 |      3 |         2 |         1 |        0.33
            13 |      1 |         0 |         1 |        1.00
(4 rows)</div>
  <p>Check Pizza Point (12) by hand: its orders are 103 (delivered), 104 (delivered) and 107 (cancelled), so 3 orders, 2 delivered, 1 cancelled; the CASE turns them into 0, 0, 1, whose average is 1/3 = 0.33. Green Bowl (13) has one order, cancelled, so its rate is 1.00. One pass over the table produced all four numbers for every restaurant. This is also how you <strong>pivot</strong> data, turning values of a column (the statuses) into separate output columns.</p>
  <p>Here the integer-division trap from section 01 returns. The overall delivery rate:</p>
  <div class="fx" data-lang="sql">SELECT COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*)          AS wrong,
       COUNT(*) FILTER (WHERE status = 'delivered')::numeric / COUNT(*) AS right_rate,
       ROUND(AVG(CASE WHEN status = 'delivered' THEN 1.0 ELSE 0 END), 2) AS via_avg
FROM orders;</div>
  <div class="fx" data-lang="text"> wrong |       right_rate       | via_avg 
-------+------------------------+---------
     0 | 0.70000000000000000000 |    0.70
(1 row)</div>
  <p>Dividing two integer counts gives 7 / 10 = 0. Casting one side to <code>numeric</code>, or averaging a CASE that returns <code>1.0</code> rather than <code>1</code>, gives the correct 0.70. When you build a rate, always make sure at least one side is a decimal.</p>

  <h2 id="sf-sort"><span class="num">09</span>ORDER BY, DISTINCT and LIMIT</h2>
  <p>A table has no built-in order, so a result without sorting comes back in whatever order the database found convenient, and that order can change from one run to the next. "Best-rated first", "the three biggest orders" and "page two of the list" all depend on order, and "which cities do our customers live in?" depends on removing repeats. Three clauses handle this. <code>ORDER BY</code> sorts the final rows, ascending (<code>ASC</code>, small to large) by default or descending with <code>DESC</code>. <code>LIMIT n</code> keeps only the first n rows after sorting, and <code>OFFSET k</code> skips k rows first. <code>DISTINCT</code> removes duplicate rows. A noticeboard of exam results is a good picture: ORDER BY ranks the students, LIMIT pins up the top three, OFFSET shows the next page, and DISTINCT lists each school only once.</p>
  <p>The first question is where NULLs go when you sort. In PostgreSQL, NULL sorts as if it were larger than every value, so it comes <strong>last in ascending order and first in descending order</strong>:</p>
  <div class="fx" data-lang="sql">SELECT name, rating FROM restaurants ORDER BY rating DESC;
SELECT name, rating FROM restaurants ORDER BY rating DESC NULLS LAST, name;</div>
  <div class="fx" data-lang="text">     name     | rating 
--------------+--------
 Momo Magic   |   NULL
 Dosa Hut     |    4.5
 Biryani Bros |    4.2
 Green Bowl   |    4.2
 Pizza Point  |    3.9
(5 rows)

     name     | rating 
--------------+--------
 Dosa Hut     |    4.5
 Biryani Bros |    4.2
 Green Bowl   |    4.2
 Pizza Point  |    3.9
 Momo Magic   |   NULL
(5 rows)</div>
  <p>In the first result the unrated Momo Magic tops the "best-rated" list, which is clearly not what anyone meant. Adding <code>NULLS LAST</code> moves it to the bottom. The second sort key, <code>name</code>, breaks the tie between Biryani Bros and Green Bowl (both 4.2) alphabetically.</p>
  <p>Ties matter even more with LIMIT. "The best-rated Mumbai restaurant":</p>
  <div class="fx" data-lang="sql">SELECT name, rating FROM restaurants WHERE city = 'Mumbai' ORDER BY rating DESC LIMIT 1;
SELECT name, rating FROM restaurants WHERE city = 'Mumbai' ORDER BY rating DESC, name LIMIT 1;</div>
  <div class="fx" data-lang="text">     name     | rating 
--------------+--------
 Biryani Bros |    4.2
(1 row)

     name     | rating 
--------------+--------
 Biryani Bros |    4.2
(1 row)</div>
  <p>Both queries happened to return Biryani Bros, but only the second is guaranteed to. Biryani Bros and Green Bowl tie at 4.2, so in the first query the database may return either one; the choice depends on how the rows happened to be stored and can change after an update or on another server. Adding a <strong>tiebreaker</strong> (a further sort column that makes the order unique) makes the answer deterministic. If ties should all be kept, the right tool is <code>RANK()</code>, covered in <a class="xref" data-note="sql_windows">Window Functions</a>.</p>
  <p>Paging uses OFFSET. With three orders per page, page 1 is <code>LIMIT 3</code> and page 2 is <code>LIMIT 3 OFFSET 3</code>:</p>
  <div class="fx" data-lang="sql">SELECT order_id, amount FROM orders ORDER BY amount DESC, order_id LIMIT 3 OFFSET 3;</div>
  <div class="fx" data-lang="text"> order_id | amount 
----------+--------
      104 | 380.00
      105 | 310.00
      110 | 310.00
(3 rows)</div>
  <p>Sorted by amount the orders are 600, 520, 450 | 380, 310, 310 | 260, 260, 240 | 180, so page 2 is 104 (380), then 105 and 110, both 310, kept in a fixed order by the tiebreaker <code>order_id</code>. Without it, the two 310s (or the two 260s on page 3) could swap places between page loads, and a row could appear on two pages or on none. Large OFFSETs are also slow, because the database still has to produce and throw away every skipped row.</p>
  <p>DISTINCT removes duplicate rows from the result. It applies to the <em>whole row</em>, not to one column, and for this purpose all NULLs count as the same value:</p>
  <div class="fx" data-lang="sql">SELECT DISTINCT city FROM customers ORDER BY city;
SELECT DISTINCT customer_id, restaurant_id FROM orders ORDER BY 1, 2;</div>
  <div class="fx" data-lang="text">  city  
--------
 Mumbai
 Pune
 NULL
(3 rows)

 customer_id | restaurant_id 
-------------+---------------
           1 |            10
           1 |            12
           2 |            11
           3 |            10
           3 |            12
           4 |            13
           5 |            12
           6 |            11
(8 rows)</div>
  <p>The first query lists three cities, with Esha's NULL counted once (and sorted last, as ascending order puts NULLs last). The second keeps 8 distinct customer–restaurant pairs out of 10 orders, because Asha ordered from Dosa Hut twice (101, 110) and Ben from Biryani Bros twice (102, 106). Be suspicious when you find yourself adding DISTINCT to "fix" duplicate rows after a join; it usually hides a join that multiplies rows, a problem explained in <a class="xref" data-note="sql_joins">JOINs</a>.</p>
  <p>Not every database sorts NULLs the same way. Here is the rating sort in SQLite, run from Python's built-in <code>sqlite3</code> module:</p>
  <div class="fx" data-lang="py">import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE restaurants (name TEXT, rating REAL)")
con.executemany("INSERT INTO restaurants VALUES (?, ?)",
                [("Dosa Hut", 4.5), ("Biryani Bros", 4.2), ("Pizza Point", 3.9),
                 ("Green Bowl", 4.2), ("Momo Magic", None)])
print("SQLite", sqlite3.sqlite_version)
print("DESC:", con.execute("SELECT name FROM restaurants ORDER BY rating DESC, name").fetchall())
print("DESC NULLS FIRST:", con.execute(
    "SELECT name FROM restaurants ORDER BY rating DESC NULLS FIRST, name").fetchall())
print("7 / 2 =", con.execute("SELECT 7 / 2").fetchone()[0], "  7 / 2.0 =", con.execute("SELECT 7 / 2.0").fetchone()[0])</div>
  <div class="fx" data-lang="text">SQLite 3.53.1
DESC: [('Dosa Hut',), ('Biryani Bros',), ('Green Bowl',), ('Pizza Point',), ('Momo Magic',)]
DESC NULLS FIRST: [('Momo Magic',), ('Dosa Hut',), ('Biryani Bros',), ('Green Bowl',), ('Pizza Point',)]
7 / 2 = 3   7 / 2.0 = 3.5</div>
  <p>SQLite treats NULL as <em>smaller</em> than every value, so in a descending sort Momo Magic comes last, the opposite of PostgreSQL. Both accept <code>NULLS FIRST</code> and <code>NULLS LAST</code>, so write them explicitly whenever the position of NULLs matters. Integer division truncates in SQLite too.</p>

  <h2 id="sf-write"><span class="num">10</span>INSERT, UPDATE and DELETE</h2>
  <p>So far we have only read data. Biteful also needs to record Gita's first order, mark order 110 as delivered and remove bad rows. Three statements change data: <code>INSERT</code> adds new rows, <code>UPDATE</code> changes values in existing rows, and <code>DELETE</code> removes rows. UPDATE and DELETE take a WHERE clause exactly like SELECT, and that WHERE decides which rows are touched. PostgreSQL also supports <code>RETURNING</code>, which sends back the rows that were changed, so you can see the effect without running a second query. (Each example on this page starts from a fresh copy of Biteful.)</p>
  <div class="fx" data-lang="sql">INSERT INTO orders (order_id, customer_id, restaurant_id, ordered_at, status, amount)
VALUES (111, 7, 14, '2026-03-08 21:05+05:30', 'pending', 200)
RETURNING order_id, customer_id, restaurant_id, status, amount, delivery_minutes;
UPDATE orders SET status = 'delivered', delivery_minutes = 35
WHERE order_id = 110
RETURNING order_id, status, delivery_minutes;</div>
  <div class="fx" data-lang="text"> order_id | customer_id | restaurant_id | status  | amount | delivery_minutes 
----------+-------------+---------------+---------+--------+------------------
      111 |           7 |            14 | pending | 200.00 |             NULL
(1 row)

INSERT 0 1
 order_id |  status   | delivery_minutes 
----------+-----------+------------------
      110 | delivered |               35
(1 row)

UPDATE 1</div>
  <p>The INSERT names its columns explicitly, which is good practice because it keeps working if the table gains columns later. It leaves out <code>delivery_minutes</code>, which therefore becomes NULL, as the RETURNING output shows. The UPDATE's WHERE matched exactly one row; after each statement psql prints a command tag (<code>INSERT 0 1</code>, <code>UPDATE 1</code>) reporting how many rows were affected. Deleting is where constraints from the previous page come back. Let us delete Dia's cancelled order 105:</p>
  <div class="fx" data-lang="sql">DELETE FROM orders WHERE order_id = 105;
BEGIN;
DELETE FROM order_items WHERE order_id = 105;
DELETE FROM orders WHERE order_id = 105 RETURNING order_id, customer_id, status;
COMMIT;</div>
  <div class="fx" data-lang="text">ERROR:  update or delete on table "orders" violates foreign key constraint "order_items_order_id_fkey" on table "order_items"
DETAIL:  Key (order_id)=(105) is still referenced from table "order_items".
BEGIN
DELETE 1
 order_id | customer_id |  status   
----------+-------------+-----------
      105 |           4 | cancelled
(1 row)

DELETE 1
COMMIT</div>
  <p>The first DELETE fails because a line in <code>order_items</code> (the Buddha Bowl) still points at order 105, and that foreign key was not declared with CASCADE. The fix is to delete the child row first and then the order. Doing both inside <code>BEGIN … COMMIT</code> makes them one transaction, so either both deletions happen or neither does; the database is never left with an order line pointing at nothing.</p>
  <p>The most expensive typo in SQL is an UPDATE or DELETE without a WHERE. Someone means to cancel order 110 and forgets the condition. Here it runs inside a transaction so that it can be undone:</p>
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
  <p><code>UPDATE 10</code> says it all: every order is now cancelled. Because the statement ran after <code>BEGIN</code>, <code>ROLLBACK</code> restored the original split of 7 delivered, 2 cancelled and 1 pending. In psql and most tools, each statement commits immediately unless you start a transaction (this is called autocommit), so outside a transaction the damage would have been permanent and only a backup could undo it. A safe habit: write the WHERE first and run it as a SELECT to see which rows it matches; run risky changes inside <code>BEGIN</code>; check the row count; then <code>COMMIT</code> or <code>ROLLBACK</code>. Editing data is like writing in a register with a pen, where the WHERE is your finger on the line; a transaction lets you write in pencil until you are sure.</p>

  <h2 id="sf-upsert"><span class="num">11</span>UPSERT</h2>
  <p>Every night a feed sends Biteful the latest restaurant ratings. Some restaurants in the feed already exist and need their rating updated; some are new and need to be inserted. A plain INSERT fails on the existing ones with a duplicate-key error. The obvious workaround, "SELECT to check whether it exists, then INSERT or UPDATE", takes two statements and has a race: two jobs running at the same moment can both see "not there" and both insert. What we want is one statement that does "insert, or update if it already exists" atomically. That is called an <strong>upsert</strong> (update + insert).</p>
  <p>Upsert relies on a constraint. The database can only recognise "this row already exists" through a primary key or UNIQUE constraint, the same way a school clerk recognises a returning student by roll number rather than by name. PostgreSQL's syntax is <code>INSERT … ON CONFLICT (key columns) DO UPDATE SET …</code>, and inside the update the special name <code>EXCLUDED</code> refers to the row you tried to insert. Tonight's feed says Pizza Point (12) is now rated 4.0, and a new restaurant, Paratha Point (15), opens at 4.1:</p>
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
  <p>The plain INSERT failed on the primary key, as expected. The upsert then updated Pizza Point's rating from 3.9 to 4.0 and inserted Paratha Point, in a single statement; the command tag <code>INSERT 0 2</code> counts both rows. Three more behaviours are worth seeing:</p>
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
  <p>Read them in order. <code>ON CONFLICT DO NOTHING</code> skipped the existing Biryani Bros silently, so zero rows were inserted (<code>INSERT 0 0</code>); this is useful for "insert if new, otherwise ignore". <code>ON CONFLICT (city)</code> is refused because <code>city</code> has no UNIQUE constraint, so PostgreSQL has no way to decide what counts as a conflict. And a rating of 6.0 is still rejected by the CHECK constraint: the update path of an upsert is an ordinary UPDATE and obeys every rule. Other databases spell upsert differently (MySQL uses <code>ON DUPLICATE KEY UPDATE</code>, and the SQL standard has <code>MERGE</code>, which PostgreSQL also supports), but the idea is the same.</p>

  <h2 id="sf-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>A beginner's very first SQL error is often about quotes. In SQL, single quotes mark a text value and double quotes mark an identifier, such as a column or table name. Use double quotes around a value and PostgreSQL goes looking for a column with that name:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE name = "Asha";
SELECT name FROM customers WHERE name = 'Asha';</div>
  <div class="fx" data-lang="text">ERROR:  column "Asha" does not exist
LINE 1: SELECT name FROM customers WHERE name = "Asha";
                                                ^
 name 
------
 Asha
(1 row)</div>
  <p>"Column Asha does not exist" sounds bizarre until you know the rule. With single quotes, the query finds Asha.</p>
  <p>A second surprise is that text comparison is case-sensitive in PostgreSQL. 'asha' and 'Asha' are different strings:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE name = 'asha';
SELECT name FROM customers WHERE name ILIKE 'asha';</div>
  <div class="fx" data-lang="text"> name 
------
(0 rows)

 name 
------
 Asha
(1 row)</div>
  <p>The equality test finds nobody; <code>ILIKE</code> (or comparing <code>LOWER(name) = 'asha'</code>) ignores case and finds her. MySQL, by contrast, usually ignores case by default, which is one more reason not to assume a query behaves the same on every engine.</p>
  <p>A third mistake is putting a row condition in HAVING because "it is a filter too":</p>
  <div class="fx" data-lang="sql">SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING status &lt;&gt; 'cancelled';</div>
  <div class="fx" data-lang="text">ERROR:  column "orders.status" must appear in the GROUP BY clause or be used in an aggregate function
LINE 1: ... COUNT(*) FROM orders GROUP BY customer_id HAVING status &lt;&gt; ...
                                                             ^</div>
  <p>HAVING runs after grouping, when individual rows are gone, so it can only see grouping keys and aggregates; <code>status</code> is neither. Row conditions belong in WHERE.</p>
  <p>The other classic mistakes were demonstrated in their own sections, and together they form a checklist worth running over any query before trusting it: integer division (32 / 60 = 0, 7 / 10 = 0); mixing AND and OR without brackets (8 rows instead of 5); BETWEEN on timestamps (order 110 lost); using a SELECT alias or an aggregate in WHERE; a plain column next to an aggregate without GROUP BY; <code>= NULL</code> instead of <code>IS NULL</code>; <code>&lt;&gt;</code> silently dropping NULL rows (Esha); NOT IN with a NULL in the list (zero rows); AVG's smaller denominator; SUM of no rows being NULL; CASE sending NULL to ELSE; NULLs sorting first in a PostgreSQL DESC sort; LIMIT on ties without a tiebreaker; and UPDATE or DELETE without WHERE. Almost none of these raises an error; they return believable wrong answers.</p>

  <h2 id="sf-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Expression</b>: a calculation in SELECT, worked out per row; <b>alias</b>: a name given with AS.</li>
    <li><b>WHERE</b>: keeps rows whose condition is TRUE (not FALSE, not UNKNOWN).</li>
    <li><b>Aggregate</b>: COUNT, SUM, AVG, MIN, MAX turn many rows into one value.</li>
    <li><b>GROUP BY</b>: one output row per distinct key; SELECT may contain only keys and aggregates.</li>
    <li><b>HAVING</b>: filters groups after aggregation.</li>
    <li><b>NULL</b>: unknown/missing; comparisons give <b>UNKNOWN</b> (three-valued logic).</li>
    <li><b>CASE</b>: first true WHEN wins; no match and no ELSE gives NULL.</li>
    <li><b>Conditional aggregation</b>: an aggregate over a CASE (or with FILTER) for several counts in one pass.</li>
    <li><b>Upsert</b>: <code>INSERT … ON CONFLICT</code>; needs a PK/UNIQUE conflict target.</li>
  </ul>
  <h3>Execution order</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Clause</th><th>Can use</th></tr>
    <tr><td>1</td><td>FROM</td><td>tables</td></tr>
    <tr><td>2</td><td>WHERE</td><td>raw columns only (no aliases, no aggregates)</td></tr>
    <tr><td>3</td><td>GROUP BY</td><td>columns, expressions</td></tr>
    <tr><td>4</td><td>HAVING</td><td>keys and aggregates</td></tr>
    <tr><td>5</td><td>SELECT</td><td>keys, aggregates, expressions; creates aliases</td></tr>
    <tr><td>6–8</td><td>DISTINCT, ORDER BY, LIMIT/OFFSET</td><td>ORDER BY can use aliases</td></tr>
  </table>
  <h3>NULL rules</h3>
  <table class="tbl">
    <tr><th>Expression</th><th>Result</th></tr>
    <tr><td><code>NULL = NULL</code>, <code>NULL &lt;&gt; 'Pune'</code></td><td>UNKNOWN</td></tr>
    <tr><td>FALSE AND UNKNOWN / TRUE OR UNKNOWN</td><td>FALSE / TRUE (everything else with UNKNOWN stays UNKNOWN)</td></tr>
    <tr><td>COUNT(*) / COUNT(city) / COUNT(DISTINCT city)</td><td>7 / 6 / 2 (customers)</td></tr>
    <tr><td>AVG(delivery_minutes)</td><td>217 / 6 = 36.17 (NULLs skipped)</td></tr>
    <tr><td>SUM over zero rows</td><td>NULL (COUNT gives 0)</td></tr>
    <tr><td><code>x NOT IN (1, NULL)</code></td><td>never TRUE</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="sql">SELECT restaurant_id,
       COUNT(*) AS orders,
       COUNT(*) FILTER (WHERE status = 'cancelled')            AS cancelled,
       ROUND(AVG(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0 END), 2) AS cancel_rate
FROM orders
WHERE ordered_at &gt;= '2026-03-01' AND ordered_at &lt; '2026-04-01'   -- half-open range
GROUP BY restaurant_id
HAVING COUNT(*) &gt;= 2
ORDER BY cancel_rate DESC NULLS LAST, restaurant_id                 -- tiebreaker
LIMIT 3;

INSERT INTO restaurants VALUES (15, 'Paratha Point', 'Pune', 'North Indian', 4.1)
ON CONFLICT (restaurant_id) DO UPDATE SET rating = EXCLUDED.rating;</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Integer ÷ integer truncates: use 60.0 or <code>::numeric</code>.</li>
    <li>Bracket every mix of AND and OR.</li>
    <li>Timestamps: <code>&gt;= start AND &lt; next_start</code>, never BETWEEN.</li>
    <li><code>IS NULL</code>, never <code>= NULL</code>; <code>&lt;&gt;</code> drops NULL rows.</li>
    <li>PostgreSQL sorts NULLs first in DESC; SQLite the opposite.</li>
    <li>Single quotes for text, double quotes for names; text comparison is case-sensitive.</li>
    <li>Test UPDATE/DELETE's WHERE as a SELECT first; use BEGIN … ROLLBACK.</li>
  </ul>

  <h2 id="sf-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the logical order in which SQL clauses are evaluated?</summary><div class="qa-body">FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT/OFFSET. Each step works on the output of the previous one, so a name created at a step is visible only later: SELECT aliases can be used in ORDER BY but not in WHERE, and aggregates can be used in HAVING but not in WHERE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between WHERE and HAVING?</summary><div class="qa-body">WHERE filters individual rows before grouping and cannot use aggregates. HAVING filters groups after GROUP BY and can use aggregates. "Customers with at least two non-cancelled orders" uses WHERE for "non-cancelled" and HAVING for "at least two".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>WHERE with_gst &gt; 500</code> fail when <code>with_gst</code> is defined in the SELECT list?</summary><div class="qa-body">WHERE is evaluated at step 2 and SELECT at step 5, so the alias does not exist yet when WHERE runs. Repeat the expression in WHERE, or wrap the query in a subquery or CTE so the alias exists before the outer WHERE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between COUNT(*), COUNT(column) and COUNT(DISTINCT column)?</summary><div class="qa-body">COUNT(*) counts rows; COUNT(column) counts non-NULL values in that column; COUNT(DISTINCT column) counts different non-NULL values. On Biteful's customers they give 7, 6 and 2, because Esha's city is NULL and the known cities are Mumbai and Pune.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is NULL, and why does <code>WHERE city = NULL</code> return nothing?</summary><div class="qa-body">NULL marks a missing or unknown value. Any ordinary comparison with NULL gives UNKNOWN, and WHERE keeps only TRUE rows, so <code>= NULL</code> matches nothing, not even the NULL rows. Use <code>IS NULL</code> or <code>IS NOT NULL</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain three-valued logic. What are TRUE AND NULL, FALSE AND NULL and TRUE OR NULL?</summary><div class="qa-body">SQL conditions can be TRUE, FALSE or UNKNOWN. TRUE AND NULL is UNKNOWN, because the result depends on the unknown side; FALSE AND NULL is FALSE and TRUE OR NULL is TRUE, because the known side already decides the answer. WHERE, HAVING and JOIN ON keep only TRUE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can <code>NOT IN (subquery)</code> return no rows at all?</summary><div class="qa-body">If the subquery returns even one NULL, <code>x NOT IN (…)</code> expands to a chain of ANDs that includes <code>x &lt;&gt; NULL</code>, which is UNKNOWN, so the whole condition is never TRUE. Use NOT EXISTS, or filter NULLs out of the subquery.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does AVG treat NULLs, and how can that mislead?</summary><div class="qa-body">AVG ignores NULLs, dividing by the number of non-NULL values. With delivery times 32, 41, 38, 25, 29, 52 and four NULLs, AVG is 217 / 6 = 36.17, while treating NULL as 0 gives 21.70. Decide deliberately whether missing means "leave out" or "zero".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do COUNT and SUM return when no rows match?</summary><div class="qa-body">COUNT returns 0, but SUM, AVG, MIN and MAX return NULL, meaning there was no data. Use <code>COALESCE(SUM(x), 0)</code> when a report needs a number.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>SELECT 7 / 2, 7 / 2.0, 10 / NULLIF(0, 0)</code> return in PostgreSQL?</summary><div class="qa-body">3, 3.5 and NULL. Integer division truncates; making one side a decimal keeps the fraction; NULLIF turns 0 into NULL, and dividing by NULL gives NULL instead of a division-by-zero error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does every non-aggregated column in SELECT have to appear in GROUP BY?</summary><div class="qa-body">GROUP BY produces one row per group, and a column that is neither a key nor an aggregate can have several different values within a group (pile 11 holds three order ids), so there is no single value to show. PostgreSQL raises an error rather than pick one arbitrarily.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you count several conditions in one query, for example delivered, cancelled and pending orders per restaurant?</summary><div class="qa-body">Conditional aggregation: <code>SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)</code> or, in PostgreSQL, <code>COUNT(*) FILTER (WHERE status = 'cancelled')</code>, one per status, with GROUP BY restaurant_id. A rate is <code>AVG(CASE WHEN … THEN 1.0 ELSE 0 END)</code>; using 1.0 avoids integer division.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to NULL in a CASE expression?</summary><div class="qa-body">A WHEN condition involving NULL evaluates to UNKNOWN, which is not TRUE, so the row falls through to the next branch and often to ELSE (Momo Magic became "needs work"). Handle NULL explicitly with a first branch <code>WHEN col IS NULL THEN …</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>ORDER BY rating DESC LIMIT 1</code> deterministic?</summary><div class="qa-body">Not if there are ties: Biryani Bros and Green Bowl both have 4.2, so either may be returned. Add a unique tiebreaker such as <code>ORDER BY rating DESC, name</code>, or use RANK() if all tied rows should be returned. Also remember PostgreSQL puts NULLs first in DESC unless you say NULLS LAST.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is BETWEEN risky with timestamps, and what should you use instead?</summary><div class="qa-body">A bare date like '2026-03-08' means midnight at the start of that day, so <code>BETWEEN '2026-03-05' AND '2026-03-08'</code> misses everything later on 8 March (order 110). Use a half-open range: <code>ts &gt;= '2026-03-05' AND ts &lt; '2026-03-09'</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the problem with large OFFSET values for pagination?</summary><div class="qa-body">The database must still produce and discard all the skipped rows, so page 10,000 is slow; and without a unique tiebreaker in ORDER BY rows can appear on two pages or none. Keyset pagination, <code>WHERE (amount, order_id) &lt; (last_amount, last_id) ORDER BY amount DESC, order_id DESC LIMIT n</code>, avoids both problems.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You ran an UPDATE and forgot the WHERE. What happened, and how do you prevent it?</summary><div class="qa-body">Every row was updated (<code>UPDATE 10</code>). With autocommit on, only a backup or point-in-time restore can undo it. Prevent it by testing the WHERE as a SELECT first, running risky changes inside BEGIN and checking the row count before COMMIT, and using RETURNING to see what changed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an upsert, and why is it better than "SELECT, then INSERT or UPDATE"?</summary><div class="qa-body">An upsert inserts a row or, if it would violate a unique key, updates the existing row instead: <code>INSERT … ON CONFLICT (key) DO UPDATE SET col = EXCLUDED.col</code>. It is a single atomic statement, while check-then-write can race when two sessions run at once. It requires a PRIMARY KEY or UNIQUE constraint on the conflict columns, and CHECK constraints still apply.</div></details>
</main>
`
});
