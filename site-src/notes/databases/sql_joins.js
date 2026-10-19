// notes/databases/sql_joins.js — JOINs
Object.assign(TOPIC_CONTENT, {
  "sql_joins": `<main>
  <h1>JOINs</h1>
  <p class="lead">A join puts related tables back together for one query: each order next to its customer, each employee next to their manager. Getting <em>some</em> rows back is easy. Getting the <em>right number</em> of rows (no lost customers, no doubled revenue) is the real skill, and it is what interviews test. Builds on <a class="xref" data-note="sql_relational">Relational Model</a> and <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a>.</p>

  <h2 id="sj-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">JOINs</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Mental model</div>
        <ul>
          <li><b>Why</b> — each fact is stored once in its own table; a join re-attaches them by key</li>
          <li><b>Step 1</b> — imagine every pair (left row × right row)</li>
          <li><b>Step 2</b> — keep pairs where <code>ON</code> is TRUE</li>
          <li><b>Step 3</b> — outer joins add back unmatched rows, padded with NULL</li>
          <li><b>Row count</b> — a key with 2 left × 3 right matches → 6 rows</li>
          <li>💡 fee receipts matched to the class register by roll number</li>
          <li>⚠ Venn diagrams mislead: joins return pairs, counts can grow</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Join types</div>
        <ul>
          <li><b>INNER</b> — matched pairs only (Dia gone, 5 rows)</li>
          <li><b>LEFT</b> — all left rows; NULLs where no match (Dia kept, 6 rows)</li>
          <li><b>RIGHT</b> — LEFT with the tables swapped; rarely written</li>
          <li><b>FULL</b> — both sides; reconcile actuals vs targets with <code>COALESCE(a.k, t.k)</code></li>
          <li><b>CROSS</b> — m × n, no ON; build a full grid, then LEFT JOIN facts for zeros</li>
          <li>⚠ missing ON / <code>FROM a, b</code> → accidental cross join</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SELF join</div>
        <ul>
          <li><b>Same table, two aliases</b> — <code>employees e JOIN employees m ON m.emp_id = e.manager_id</code></li>
          <li><b>LEFT</b> keeps the root (Ravi, manager NULL)</li>
          <li><b>Unique pairs</b> — <code>a.emp_id &lt; b.emp_id</code> (no self or mirror pairs)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Semi &amp; anti joins</div>
        <ul>
          <li><b>Semi</b> — "has any": <code>EXISTS</code>, each left row once</li>
          <li><b>Anti</b> — "has none": <code>NOT EXISTS</code> or <code>LEFT JOIN … WHERE r.key IS NULL</code></li>
          <li>⚠ INNER JOIN for "who ordered" repeats Asha and Chen</li>
          <li>⚠ <b>NOT IN + one NULL</b> → 0 rows (x &lt;&gt; NULL is UNKNOWN)</li>
          <li><b>Fix</b> — NOT EXISTS, or <code>IS NOT NULL</code> inside the subquery; IN is safe</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ON vs WHERE (LEFT JOIN)</div>
        <ul>
          <li><b>ON</b> — decides which right rows match; every left row is kept anyway</li>
          <li><b>WHERE</b> — runs after the join, on padded rows too</li>
          <li>⚠ <code>WHERE o.status = 'delivered'</code> silently turns LEFT into INNER</li>
          <li><b>Rule</b> — right-table filters in ON, left-table filters in WHERE</li>
          <li>⚠ <code>COUNT(*)</code> gives Dia 1 → use <code>COUNT(o.order_id)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fan-out</div>
        <ul>
          <li><b>Cause</b> — one parent joined to two independent 1:N children</li>
          <li><b>Effect</b> — Asha 3 items × 3 visits = 9 rows → revenue 4140, not 1380</li>
          <li><b>Fix</b> — aggregate each child per key in a CTE, then join</li>
          <li>⚠ <code>SUM(DISTINCT)</code> is wrong when real values repeat</li>
          <li><b>Check</b> — COUNT(*) after each join: 4 → 6 → 8 → 14</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multi-table &amp; syntax</div>
        <ul>
          <li><b>Chain</b> — customers → orders → order_items → products</li>
          <li>⚠ <b>LEFT then INNER</b> drops Dia → keep later joins LEFT</li>
          <li><b>USING (k)</b> — same-named key, printed once</li>
          <li>⚠ <b>NATURAL JOIN</b> matches every same-named column; one new column → 0 rows</li>
          <li><b>Non-equi</b> — <code>ON salary BETWEEN lo AND hi</code> (bands, ranges)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Algorithms &amp; counts</div>
        <ul>
          <li><b>Nested loop</b> — small outer + index on inner; any condition</li>
          <li><b>Hash</b> — build on the small side, probe with the big; equality only</li>
          <li><b>Merge</b> — both sorted, zipper walk</li>
          <li><b>Puzzle</b> a = 1,1,2,NULL · b = 1,1,3,NULL → INNER 4, LEFT 6, RIGHT 6, FULL 8, CROSS 16</li>
          <li><b>Bounds</b> — INNER ≤ m×n; LEFT ≥ m; FULL ≥ max(m, n); NULL never matches NULL</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sj-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Joins &amp; the Mental Model</span><span class="rm-sub">Every pair, keep matches</span></div></div>
      <div class="rm-item rm-done" data-target="sj-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">INNER, LEFT, RIGHT, FULL</span><span class="rm-sub">Who gets kept</span></div></div>
      <div class="rm-item rm-done" data-target="sj-cross"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">CROSS &amp; SELF Joins</span><span class="rm-sub">Grids and hierarchies</span></div></div>
      <div class="rm-item rm-done" data-target="sj-semi"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Semi &amp; Anti Joins</span><span class="rm-sub">EXISTS and the NOT IN trap</span></div></div>
      <div class="rm-item rm-done" data-target="sj-onwhere"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">ON vs WHERE</span><span class="rm-sub">The silent INNER JOIN</span></div></div>
      <div class="rm-item rm-done" data-target="sj-fan"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Fan-out</span><span class="rm-sub">Double counting, and the fix</span></div></div>
      <div class="rm-item rm-done" data-target="sj-multi"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Multi-table, USING &amp; Non-equi</span><span class="rm-sub">Chains, shortcuts, range joins</span></div></div>
      <div class="rm-item rm-done" data-target="sj-algo"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How the Engine Joins</span><span class="rm-sub">Nested loop, hash, merge</span></div></div>
      <div class="rm-item rm-done" data-target="sj-puzzle"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Row-Count Puzzle</span><span class="rm-sub">Duplicates and NULL keys</span></div></div>
      <div class="rm-item rm-done" data-target="sj-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The bugs that pass silently</span></div></div>
      <div class="rm-item rm-done" data-target="sj-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sj-model"><span class="num">01</span>Why Joins &amp; the Mental Model</h2>
  <p>All results on this page come from running each query in PostgreSQL on the <code>shop</code> data shown. In <code>shop</code> a customer's name is stored once, in <code>customers</code>. An order does not repeat the name. It only stores a number, <code>customer_id</code>, that points at the customer row. The orders table alone cannot answer "who placed order 103?". The answer lives in another table.</p>
  <table class="tbl"><caption>customers</caption><tr><th>customer_id</th><th>name</th><th>city</th><th>signup_date</th></tr><tr><td>1</td><td>Asha</td><td>Mumbai</td><td>2024-01-05</td></tr><tr><td>2</td><td>Ben</td><td>Delhi</td><td>2024-02-10</td></tr><tr><td>3</td><td>Chen</td><td>Mumbai</td><td>2024-03-15</td></tr><tr><td>4</td><td>Dia</td><td>NULL</td><td>2024-04-20</td></tr></table>
  <table class="tbl"><caption>orders</caption><tr><th>order_id</th><th>customer_id</th><th>order_date</th><th>status</th></tr><tr><td>100</td><td>1</td><td>2024-05-01</td><td>delivered</td></tr><tr><td>101</td><td>1</td><td>2024-05-20</td><td>delivered</td></tr><tr><td>102</td><td>2</td><td>2024-06-02</td><td>cancelled</td></tr><tr><td>103</td><td>3</td><td>2024-06-15</td><td>delivered</td></tr><tr><td>104</td><td>3</td><td>2024-07-01</td><td>pending</td></tr></table>
  <p>A <strong>join</strong> builds one wider result from two tables. For each order, it finds the customer row with the same <code>customer_id</code> and glues the two rows side by side. The rule that says which rows belong together is written after the word <code>ON</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school office has two books. The <em>class register</em> lists roll number and student name. The <em>fee receipt book</em> lists receipt number, roll number and amount. To print "who paid what", the clerk takes each receipt, reads its roll number, and finds that roll number in the register. That lookup, done for every receipt, is a join. A student with no receipt simply never gets matched.</p>
  </div>
  <h3>The three-step mental model</h3>
  <p>Think of every join as three steps. <strong>1.</strong> Pair every left row with every right row. <strong>2.</strong> Keep only the pairs where the ON condition is TRUE. <strong>3.</strong> For outer joins only, add back the rows that found no partner, with NULL in the missing columns. Here is step 1 and 2 traced for two customers against all five orders, with the condition <code>o.customer_id = c.customer_id</code>:</p>
  <table class="tbl"><caption>Trace: Asha (id 1) and Dia (id 4) against every order</caption>
    <tr><th>pair</th><th>c.customer_id</th><th>o.order_id</th><th>o.customer_id</th><th>ON true?</th></tr>
    <tr><td>Asha × 100</td><td>1</td><td>100</td><td>1</td><td><strong>yes → keep</strong></td></tr>
    <tr><td>Asha × 101</td><td>1</td><td>101</td><td>1</td><td><strong>yes → keep</strong></td></tr>
    <tr><td>Asha × 102</td><td>1</td><td>102</td><td>2</td><td>no</td></tr>
    <tr><td>Asha × 103</td><td>1</td><td>103</td><td>3</td><td>no</td></tr>
    <tr><td>Asha × 104</td><td>1</td><td>104</td><td>3</td><td>no</td></tr>
    <tr><td>Dia × 100…104</td><td>4</td><td>any</td><td>1, 1, 2, 3, 3</td><td>no, five times</td></tr>
  </table>
  <p>Asha survives twice (two orders), Dia never. Doing the same for Ben and Chen gives 5 kept pairs out of 4 × 5 = 20. Now the real query. It lists every order with the name of the customer who placed it.</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name, o.status
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>name</th><th>status</th></tr><tr><td>100</td><td>Asha</td><td>delivered</td></tr><tr><td>101</td><td>Asha</td><td>delivered</td></tr><tr><td>102</td><td>Ben</td><td>cancelled</td></tr><tr><td>103</td><td>Chen</td><td>delivered</td></tr><tr><td>104</td><td>Chen</td><td>pending</td></tr></table>
  <p>Read the query from <code>FROM</code>. <code>orders o</code> gives the table a short alias, <code>o</code>. <code>JOIN customers c</code> brings in the second table with alias <code>c</code>. <code>ON c.customer_id = o.customer_id</code> is the matching rule. In the SELECT list, <code>o.order_id</code> and <code>c.name</code> say which table each column comes from. The result has exactly the 5 kept pairs from the trace. Asha appears twice because she has two orders: a join returns one row per <em>matching pair</em>, not one per customer.</p>
  <figure class="viz"><svg viewBox="0 0 600 205" width="600">
    <text x="100" y="18" text-anchor="middle" font-weight="bold">customers</text>
    <text x="475" y="12" text-anchor="middle" font-weight="bold">orders</text>
    <text x="280" y="12" text-anchor="middle" font-size="10" class="tm">ON o.customer_id = c.customer_id</text>
    <rect x="40" y="30" width="120" height="30" rx="5" class="fb sb"/><text x="100" y="50" text-anchor="middle">Asha</text><rect x="40" y="75" width="120" height="30" rx="5" class="fb sb"/><text x="100" y="95" text-anchor="middle">Ben</text><rect x="40" y="120" width="120" height="30" rx="5" class="fb sb"/><text x="100" y="140" text-anchor="middle">Chen</text><rect x="40" y="165" width="120" height="30" rx="5" class="fb sb"/><text x="100" y="185" text-anchor="middle">Dia</text><rect x="400" y="20" width="150" height="28" rx="5" class="ft"/><text x="475" y="39" text-anchor="middle">100 · c1</text><rect x="400" y="55" width="150" height="28" rx="5" class="ft"/><text x="475" y="74" text-anchor="middle">101 · c1</text><rect x="400" y="90" width="150" height="28" rx="5" class="ft"/><text x="475" y="109" text-anchor="middle">102 · c2</text><rect x="400" y="125" width="150" height="28" rx="5" class="ft"/><text x="475" y="144" text-anchor="middle">103 · c3</text><rect x="400" y="160" width="150" height="28" rx="5" class="ft"/><text x="475" y="179" text-anchor="middle">104 · c3</text><g stroke="currentColor"><line x1="160" y1="45" x2="400" y2="34"/><line x1="160" y1="45" x2="400" y2="69"/><line x1="160" y1="90" x2="400" y2="104"/><line x1="160" y1="135" x2="400" y2="139"/><line x1="160" y1="135" x2="400" y2="174"/></g>
    <line x1="160" y1="180" x2="230" y2="184" stroke="currentColor" stroke-dasharray="4 3"/>
    <rect x="230" y="172" width="70" height="24" rx="5" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="265" y="189" text-anchor="middle" class="tm">NULL</text>
    <text x="308" y="189" font-size="10" class="tm">LEFT only</text>
  </svg><figcaption>Each line is one output row: 5 matched pairs (INNER). A LEFT JOIN also keeps Dia with a NULL partner: 6 rows.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>join</strong> combines rows of two tables into wider rows, using a condition in <code>ON</code>. Logically it is "all pairs, filtered by ON, plus padding for outer joins". The engine never really builds all pairs (that would be slow); section 08 shows what it does instead. The model is for predicting the <em>result</em>, especially the row count.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Venn diagrams</span>
    <p>The popular two-circle pictures suggest a join returns "a subset of rows". It returns <em>pairs</em>. One customer with two orders gives two rows, so the count can grow. Venns also cannot show CROSS joins, duplicate keys or NULL padding. Think "pairs + padding".</p>
  </div>
  <p>Why it matters: almost every report, dashboard and ML feature table is built from joins. A churn model needs customer columns next to order counts; a revenue chart needs order lines next to product categories. Interviews ask a join in nearly every SQL round, usually with a twist on row counts or NULLs.</p>

  <h2 id="sj-types"><span class="num">02</span>INNER, LEFT, RIGHT, FULL</h2>
  <p>The plain join above silently dropped Dia, because she has no orders. Sometimes that is right ("orders with their customer"). Sometimes it is a bug ("all customers and how much they bought", where Dia must show 0). The join <em>type</em> decides what happens to rows that find no partner.</p>
  <p>To see all four types clearly, take two tiny tables: monthly sales, and monthly targets set by the manager. May has sales but no target. August has a target but no sales yet. So matching gives 2 pairs (June, July), 1 sales row with no partner (May) and 1 target row with no partner (August). Each join type keeps a different mix of those.</p>
  <table class="tbl"><caption>sales</caption><tr><th>month</th><th>revenue</th></tr><tr><td>2024-05</td><td>1380</td></tr><tr><td>2024-06</td><td>1300</td></tr><tr><td>2024-07</td><td>120</td></tr></table>
  <table class="tbl"><caption>targets</caption><tr><th>month</th><th>target</th></tr><tr><td>2024-06</td><td>1500</td></tr><tr><td>2024-07</td><td>500</td></tr><tr><td>2024-08</td><td>800</td></tr></table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper compares his sales diary with the target sheet from head office. INNER: only months on both pages. LEFT: every month in his diary, with "no target" written where head office was silent. RIGHT: every month on the target sheet. FULL: every month on either page.</p>
  </div>
  <h3>INNER JOIN: matched pairs only</h3>
  <div class="fx" data-lang="sql">SELECT s.month, s.revenue, t.target
FROM sales s
INNER JOIN targets t ON t.month = s.month
ORDER BY s.month;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>revenue</th><th>target</th></tr><tr><td>2024-06</td><td>1300</td><td>1500</td></tr><tr><td>2024-07</td><td>120</td><td>500</td></tr></table>
  <p>Only the two matched months. May and August are gone because they had no partner. <code>INNER JOIN</code> and plain <code>JOIN</code> mean the same thing.</p>
  <h3>LEFT JOIN: every left row, NULL where no match</h3>
  <div class="fx" data-lang="sql">SELECT s.month, s.revenue, t.target
FROM sales s
LEFT JOIN targets t ON t.month = s.month
ORDER BY s.month;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>revenue</th><th>target</th></tr><tr><td>2024-05</td><td>1380</td><td>NULL</td></tr><tr><td>2024-06</td><td>1300</td><td>1500</td></tr><tr><td>2024-07</td><td>120</td><td>500</td></tr></table>
  <p>The <strong>left</strong> table is the one written before the word JOIN (<code>sales</code>). All three sales rows are kept. May found no target, so its <code>target</code> column is filled with <strong>NULL</strong> (SQL's "no value"). This is the join you will write most in analytics: "all X, with Y if any".</p>
  <h3>RIGHT JOIN: every right row</h3>
  <div class="fx" data-lang="sql">SELECT t.month, s.revenue, t.target
FROM sales s
RIGHT JOIN targets t ON t.month = s.month
ORDER BY t.month;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>revenue</th><th>target</th></tr><tr><td>2024-06</td><td>1300</td><td>1500</td></tr><tr><td>2024-07</td><td>120</td><td>500</td></tr><tr><td>2024-08</td><td>NULL</td><td>800</td></tr></table>
  <p>Mirror image: all targets kept, August gets a NULL revenue. Notice the SELECT uses <code>t.month</code>, because <code>s.month</code> would be NULL for August. Any RIGHT JOIN can be written as a LEFT JOIN by swapping the table order, so most teams never write RIGHT.</p>
  <h3>FULL JOIN: everything from both sides</h3>
  <div class="fx" data-lang="sql">SELECT COALESCE(s.month, t.month) AS month, s.revenue, t.target
FROM sales s
FULL JOIN targets t ON t.month = s.month
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>revenue</th><th>target</th></tr><tr><td>2024-05</td><td>1380</td><td>NULL</td></tr><tr><td>2024-06</td><td>1300</td><td>1500</td></tr><tr><td>2024-07</td><td>120</td><td>500</td></tr><tr><td>2024-08</td><td>NULL</td><td>800</td></tr></table>
  <p>Four rows: two matched, May padded on the right, August padded on the left. The key needs <code>COALESCE(s.month, t.month)</code>: <strong>COALESCE</strong> returns its first non-NULL argument, so each row shows whichever side has the month.</p>
  <figure class="viz"><svg viewBox="0 0 600 182" width="600">
    <g font-size="10">
    <text x="300" y="14" text-anchor="middle" class="tm">left = months with sales (May, Jun, Jul) · right = months with targets (Jun, Jul, Aug)</text>
    <text x="72" y="36" text-anchor="middle" font-weight="bold" class="tb">INNER</text><rect x="10" y="46" width="60" height="22" rx="3" class="fb"/><text x="40" y="61" text-anchor="middle">Jun</text><rect x="74" y="46" width="60" height="22" rx="3" class="fg"/><text x="104" y="61" text-anchor="middle">Jun</text><rect x="10" y="72" width="60" height="22" rx="3" class="fb"/><text x="40" y="87" text-anchor="middle">Jul</text><rect x="74" y="72" width="60" height="22" rx="3" class="fg"/><text x="104" y="87" text-anchor="middle">Jul</text><text x="72" y="172" text-anchor="middle" class="tm">2 rows</text><text x="222" y="36" text-anchor="middle" font-weight="bold" class="tb">LEFT</text><rect x="160" y="46" width="60" height="22" rx="3" class="fb"/><text x="190" y="61" text-anchor="middle">May</text><rect x="224" y="46" width="60" height="22" rx="3" class="fs"/><text x="254" y="61" text-anchor="middle" class="tm">NULL</text><rect x="160" y="72" width="60" height="22" rx="3" class="fb"/><text x="190" y="87" text-anchor="middle">Jun</text><rect x="224" y="72" width="60" height="22" rx="3" class="fg"/><text x="254" y="87" text-anchor="middle">Jun</text><rect x="160" y="98" width="60" height="22" rx="3" class="fb"/><text x="190" y="113" text-anchor="middle">Jul</text><rect x="224" y="98" width="60" height="22" rx="3" class="fg"/><text x="254" y="113" text-anchor="middle">Jul</text><text x="222" y="172" text-anchor="middle" class="tm">3 rows</text><text x="372" y="36" text-anchor="middle" font-weight="bold" class="tb">RIGHT</text><rect x="310" y="46" width="60" height="22" rx="3" class="fb"/><text x="340" y="61" text-anchor="middle">Jun</text><rect x="374" y="46" width="60" height="22" rx="3" class="fg"/><text x="404" y="61" text-anchor="middle">Jun</text><rect x="310" y="72" width="60" height="22" rx="3" class="fb"/><text x="340" y="87" text-anchor="middle">Jul</text><rect x="374" y="72" width="60" height="22" rx="3" class="fg"/><text x="404" y="87" text-anchor="middle">Jul</text><rect x="310" y="98" width="60" height="22" rx="3" class="fs"/><text x="340" y="113" text-anchor="middle" class="tm">NULL</text><rect x="374" y="98" width="60" height="22" rx="3" class="fg"/><text x="404" y="113" text-anchor="middle">Aug</text><text x="372" y="172" text-anchor="middle" class="tm">3 rows</text><text x="522" y="36" text-anchor="middle" font-weight="bold" class="tb">FULL</text><rect x="460" y="46" width="60" height="22" rx="3" class="fb"/><text x="490" y="61" text-anchor="middle">May</text><rect x="524" y="46" width="60" height="22" rx="3" class="fs"/><text x="554" y="61" text-anchor="middle" class="tm">NULL</text><rect x="460" y="72" width="60" height="22" rx="3" class="fb"/><text x="490" y="87" text-anchor="middle">Jun</text><rect x="524" y="72" width="60" height="22" rx="3" class="fg"/><text x="554" y="87" text-anchor="middle">Jun</text><rect x="460" y="98" width="60" height="22" rx="3" class="fb"/><text x="490" y="113" text-anchor="middle">Jul</text><rect x="524" y="98" width="60" height="22" rx="3" class="fg"/><text x="554" y="113" text-anchor="middle">Jul</text><rect x="460" y="124" width="60" height="22" rx="3" class="fs"/><text x="490" y="139" text-anchor="middle" class="tm">NULL</text><rect x="524" y="124" width="60" height="22" rx="3" class="fg"/><text x="554" y="139" text-anchor="middle">Aug</text><text x="522" y="172" text-anchor="middle" class="tm">4 rows</text>
    </g>
  </svg><figcaption>Matched pairs always survive. Outer joins add the unmatched side and fill the other side with NULL.</figcaption></figure>
  <h3>Back to shop: all customers with their orders</h3>
  <p>Now the same idea on the real tables. We want every customer, including Dia who never ordered.</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th></tr><tr><td>Asha</td><td>100</td></tr><tr><td>Asha</td><td>101</td></tr><tr><td>Ben</td><td>102</td></tr><tr><td>Chen</td><td>103</td></tr><tr><td>Chen</td><td>104</td></tr><tr><td>Dia</td><td>NULL</td></tr></table>
  <p>Six rows: Asha 2 + Ben 1 + Chen 2 + Dia 1 padded row. An INNER JOIN gives the same rows minus Dia (5).</p>
  <h3>FULL JOIN in real work: actuals vs targets</h3>
  <p>A finance team stores targets in a table <code>month_targets(month, target)</code> (created in a copy of shop: June 1500, July 500, August 800). Actual revenue is computed from orders. The query first builds monthly revenue in a <strong>CTE</strong> (a named sub-result written with <code>WITH</code>, see <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>), then FULL JOINs it to the targets.</p>
  <div class="fx" data-lang="sql">WITH actual AS (
  SELECT DATE_TRUNC('month', o.order_date)::date AS month,
         SUM(oi.qty * oi.unit_price) AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  GROUP BY 1
)
SELECT COALESCE(a.month, t.month) AS month, a.revenue, t.target
FROM actual a
FULL JOIN month_targets t ON t.month = a.month
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>revenue</th><th>target</th></tr><tr><td>2024-05-01</td><td>1380.00</td><td>NULL</td></tr><tr><td>2024-06-01</td><td>1300.00</td><td>1500</td></tr><tr><td>2024-07-01</td><td>120.00</td><td>500</td></tr><tr><td>2024-08-01</td><td>NULL</td><td>800</td></tr></table>
  <p><code>DATE_TRUNC('month', o.order_date)</code> turns 2024-05-20 into 2024-05-01, so all May orders share one key. May had sales but no target; August has a target but no sales. A LEFT JOIN from either side would lose one of them. FULL plus COALESCE on the key is the standard reconciliation pattern in data engineering (ledger vs bank statement, source vs warehouse row counts).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Outer join</strong> = LEFT, RIGHT or FULL: a join that keeps unmatched rows from one or both sides. The side whose rows are always kept is the <strong>preserved</strong> side. The other side is <strong>NULL-supplying</strong>: its columns become NULL when there is no match.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A LEFT JOIN does not give "one row per left row". It gives <em>at least</em> one. Asha still has two rows. If you need exactly one per customer, aggregate the right side first or use EXISTS (section 04).</p>
  </div>

  <h2 id="sj-cross"><span class="num">03</span>CROSS &amp; SELF Joins</h2>
  <h3>CROSS JOIN: every combination</h3>
  <p>The manager wants a table of units bought per customer per category. A normal GROUP BY over sales only shows combinations that happened. Ben bought no electronics, so the row "Ben, Electronics, 0" never appears, and the chart has a hole. You first need the <em>full grid</em> of customers × categories, and only then the numbers.</p>
  <p>A <strong>CROSS JOIN</strong> has no ON. It pairs every left row with every right row: 4 customers × 2 categories = 8 rows. This is step 1 of the mental model, with nothing filtered.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant menu card that lists every size for every dosa: plain, masala, rava × small, large. Six lines, whether or not anyone ordered a small rava today. That full list is a cross join.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT c.name, cat.category
FROM customers c
CROSS JOIN (SELECT DISTINCT category FROM products) AS cat
ORDER BY c.customer_id, cat.category;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>category</th></tr><tr><td>Asha</td><td>Electronics</td></tr><tr><td>Asha</td><td>Furniture</td></tr><tr><td>Ben</td><td>Electronics</td></tr><tr><td>Ben</td><td>Furniture</td></tr><tr><td>Chen</td><td>Electronics</td></tr><tr><td>Chen</td><td>Furniture</td></tr><tr><td>Dia</td><td>Electronics</td></tr><tr><td>Dia</td><td>Furniture</td></tr></table>
  <p><code>(SELECT DISTINCT category FROM products) AS cat</code> is a tiny inline table with two rows, Electronics and Furniture. The cross join attaches both to every customer. Now LEFT JOIN the real sales onto the grid, so every cell exists and missing ones get 0.</p>
  <div class="fx" data-lang="sql">WITH grid AS (
  SELECT c.customer_id, c.name, cat.category
  FROM customers c
  CROSS JOIN (SELECT DISTINCT category FROM products) AS cat
),
sales AS (
  SELECT o.customer_id, p.category, SUM(oi.qty) AS units
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  JOIN products p     ON p.product_id = oi.product_id
  GROUP BY o.customer_id, p.category
)
SELECT g.name, g.category, COALESCE(s.units, 0) AS units
FROM grid g
LEFT JOIN sales s ON s.customer_id = g.customer_id AND s.category = g.category
ORDER BY g.customer_id, g.category;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>category</th><th>units</th></tr><tr><td>Asha</td><td>Electronics</td><td>2</td></tr><tr><td>Asha</td><td>Furniture</td><td>2</td></tr><tr><td>Ben</td><td>Electronics</td><td>0</td></tr><tr><td>Ben</td><td>Furniture</td><td>1</td></tr><tr><td>Chen</td><td>Electronics</td><td>2</td></tr><tr><td>Chen</td><td>Furniture</td><td>4</td></tr><tr><td>Dia</td><td>Electronics</td><td>0</td></tr><tr><td>Dia</td><td>Furniture</td><td>0</td></tr></table>
  <p>Step by step: <code>grid</code> holds the 8 combinations. <code>sales</code> holds only the 4 that really happened (Asha 2 + 2, Ben 1 furniture, Chen 2 + 4). The LEFT JOIN keeps all 8 grid rows, matching on <em>both</em> customer and category. <code>COALESCE(s.units, 0)</code> turns the NULLs of Ben–Electronics and both Dia rows into 0. This "grid then LEFT JOIN" shape is used for heatmaps, cohort tables and any time-series that must show empty days.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Forgetting the ON condition (or writing <code>FROM a, b</code> with no WHERE) is an accidental cross join. 1 million × 1 million rows = 10<sup>12</sup> rows and a dead query. If a result is suddenly huge, look for a missing join condition first.</p>
  </div>
  <h3>SELF JOIN: a table joined to itself</h3>
  <p><code>employees</code> stores each person's boss as a number, <code>manager_id</code>, pointing at another row of the <em>same</em> table. To print "Vik reports to Uma" you must look up a row in the table you are already reading.</p>
  <table class="tbl"><caption>employees</caption><tr><th>emp_id</th><th>name</th><th>dept</th><th>salary</th><th>manager_id</th></tr><tr><td>1</td><td>Ravi</td><td>Eng</td><td>120000</td><td>NULL</td></tr><tr><td>2</td><td>Sara</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>3</td><td>Tom</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>4</td><td>Uma</td><td>Sales</td><td>70000</td><td>1</td></tr><tr><td>5</td><td>Vik</td><td>Sales</td><td>65000</td><td>4</td></tr></table>
  <p>The trick: use the table twice, with two different aliases, and treat them as two separate tables. <code>e</code> is "the employee", <code>m</code> is "the manager". Trace Vik: his <code>manager_id</code> is 4, the row in <code>m</code> with <code>emp_id</code> 4 is Uma, so the pair is (Vik, Uma).</p>
  <div class="fx" data-lang="sql">SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.emp_id = e.manager_id
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>employee</th><th>manager</th></tr><tr><td>Ravi</td><td>NULL</td></tr><tr><td>Sara</td><td>Ravi</td></tr><tr><td>Tom</td><td>Ravi</td></tr><tr><td>Uma</td><td>Ravi</td></tr><tr><td>Vik</td><td>Uma</td></tr></table>
  <p>We used LEFT, so Ravi stays even though his <code>manager_id</code> is NULL (he is the boss). With INNER he would vanish, because NULL matches nothing.</p>
  <p>Self joins also find pairs of rows. "Which employees share a salary?" A first attempt joins on salary only:</p>
  <div class="fx" data-lang="sql">SELECT a.name AS emp1, b.name AS emp2, a.salary
FROM employees a
JOIN employees b ON a.salary = b.salary
ORDER BY a.emp_id, b.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>emp1</th><th>emp2</th><th>salary</th></tr><tr><td>Ravi</td><td>Ravi</td><td>120000</td></tr><tr><td>Sara</td><td>Sara</td><td>95000</td></tr><tr><td>Sara</td><td>Tom</td><td>95000</td></tr><tr><td>Tom</td><td>Sara</td><td>95000</td></tr><tr><td>Tom</td><td>Tom</td><td>95000</td></tr><tr><td>Uma</td><td>Uma</td><td>70000</td></tr><tr><td>Vik</td><td>Vik</td><td>65000</td></tr></table>
  <p>Seven rows of noise: everyone matches themselves (Ravi–Ravi) and Sara–Tom appears twice in mirror order. Adding <code>a.emp_id &lt; b.emp_id</code> keeps each unordered pair once: it removes self pairs (2 &lt; 2 is false) and the mirror (3 &lt; 2 is false).</p>
  <div class="fx" data-lang="sql">SELECT a.name AS emp1, b.name AS emp2, a.salary
FROM employees a
JOIN employees b ON a.salary = b.salary AND a.emp_id &lt; b.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>emp1</th><th>emp2</th><th>salary</th></tr><tr><td>Sara</td><td>Tom</td><td>95000</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>CROSS JOIN</strong>: the Cartesian product, m × n rows, no condition. <strong>SELF JOIN</strong>: not a separate keyword, just any join where both sides are the same table under different aliases.</p>
  </div>

  <h2 id="sj-semi"><span class="num">04</span>Semi &amp; Anti Joins</h2>
  <p>Often you do not want any columns from the other table. You only want a yes/no: "customers <em>who have</em> orders" or "customers <em>with no</em> orders". The first is called a <strong>semi-join</strong>, the second an <strong>anti-join</strong>. A plain JOIN is the wrong tool for both, and it is a very common interview mistake.</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result: 5 rows, customers repeated</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Asha</td></tr><tr><td>Ben</td></tr><tr><td>Chen</td></tr><tr><td>Chen</td></tr></table>
  <p>The JOIN repeats each customer once per order: Asha and Chen twice. A <code>COUNT(*)</code> on this would say 5 customers ordered. Adding DISTINCT hides the symptom but costs a sort. The precise tool is <code>EXISTS</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A society watchman asks "does flat 302 have any parcel today?" He needs a yes or no, so he stops looking at the first parcel. He does not bring you one copy of the flat number per parcel. EXISTS is the watchman.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Ben</td></tr><tr><td>Chen</td></tr></table>
  <p>For each customer row, the inner query <code>SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id</code> is checked. <code>SELECT 1</code> is a convention: EXISTS only cares whether at least one row comes back, not what is in it. Asha has two matching orders, but EXISTS stops at the first and returns TRUE once. Dia has none, so EXISTS is FALSE and she is filtered out.</p>
  <h3>Anti-join: who has none?</h3>
  <p>Two correct forms. Both return Dia.</p>
  <div class="fx" data-lang="sql">SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Dia</td></tr></table>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th></tr><tr><td>Dia</td><td>NULL</td></tr></table>
  <p>The second form works because of padding: Dia is the only customer whose LEFT JOIN row has <code>o.order_id</code> = NULL. Test a column that can never be NULL in a real match (a primary key like <code>order_id</code>), otherwise a real row with a NULL value would be mistaken for "no match".</p>
  <h3>The NOT IN + NULL trap</h3>
  <p>Task: employees who manage nobody. The natural English is "emp_id not in the list of manager_ids". Here is that list:</p>
  <table class="tbl"><caption>SELECT manager_id FROM employees</caption><tr><th>manager_id</th></tr><tr><td>NULL</td></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>1</td></tr><tr><td>4</td></tr></table>
  <div class="fx" data-lang="sql">SELECT name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees);</div>
  <table class="tbl out"><caption>Result: 0 rows</caption><tr><th>name</th></tr></table>
  <p>Zero rows, no error. Trace Sara (emp_id 2): <code>2 NOT IN (NULL, 1, 1, 1, 4)</code> means <code>2 &lt;&gt; NULL AND 2 &lt;&gt; 1 AND 2 &lt;&gt; 1 AND 2 &lt;&gt; 1 AND 2 &lt;&gt; 4</code>. Every comparison with NULL is UNKNOWN (SQL's third truth value: "can't tell"). TRUE AND UNKNOWN is UNKNOWN, and WHERE keeps only TRUE. So every employee is dropped.</p>
  <div class="fx" data-lang="sql">SELECT e.name FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.emp_id)
ORDER BY e.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th></tr><tr><td>Sara</td></tr><tr><td>Tom</td></tr><tr><td>Vik</td></tr></table>
  <div class="fx" data-lang="sql">SELECT name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees WHERE manager_id IS NOT NULL)
ORDER BY emp_id;</div>
  <table class="tbl out"><caption>Also correct: remove NULLs inside</caption><tr><th>name</th></tr><tr><td>Sara</td></tr><tr><td>Tom</td></tr><tr><td>Vik</td></tr></table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Semi-join</strong>: return each left row at most once if <em>any</em> right row matches (EXISTS, IN). <strong>Anti-join</strong>: return each left row only if <em>no</em> right row matches (NOT EXISTS, LEFT JOIN … IS NULL). The optimizer runs both as special joins that stop at the first match.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One NULL in a <code>NOT IN</code> list empties the result. Default to <code>NOT EXISTS</code>. <code>IN</code> is safe; only the negated form breaks. Interviewers love this one because the query looks correct and returns no error.</p>
  </div>

  <h2 id="sj-onwhere"><span class="num">05</span>ON vs WHERE in a LEFT JOIN</h2>
  <p>For an INNER JOIN it does not matter whether a condition sits in ON or in WHERE: both throw away non-matching pairs. For a LEFT JOIN it matters a lot, and getting it wrong gives a report that silently loses rows.</p>
  <p>Goal: "every customer, with their <em>delivered</em> orders (if any)". The first try puts the status filter in WHERE:</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'delivered'
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>status</th></tr><tr><td>Asha</td><td>100</td><td>delivered</td></tr><tr><td>Asha</td><td>101</td><td>delivered</td></tr><tr><td>Chen</td><td>103</td><td>delivered</td></tr></table>
  <p>Ben and Dia vanished. Trace it in the order the database works:</p>
  <table class="tbl"><caption>Trace: LEFT JOIN first, then WHERE</caption>
    <tr><th>after LEFT JOIN</th><th>status</th><th>WHERE status = 'delivered'</th></tr>
    <tr><td>Asha · 100</td><td>delivered</td><td>TRUE → keep</td></tr>
    <tr><td>Asha · 101</td><td>delivered</td><td>TRUE → keep</td></tr>
    <tr><td>Ben · 102</td><td>cancelled</td><td>FALSE → drop</td></tr>
    <tr><td>Chen · 103</td><td>delivered</td><td>TRUE → keep</td></tr>
    <tr><td>Chen · 104</td><td>pending</td><td>FALSE → drop</td></tr>
    <tr><td>Dia · NULL</td><td>NULL</td><td>UNKNOWN → drop</td></tr>
  </table>
  <p>WHERE runs <em>after</em> the join, on every row including Dia's padded one. <code>NULL = 'delivered'</code> is UNKNOWN, so she goes. The LEFT JOIN has silently become an INNER JOIN.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding caterer must seat every guest (LEFT). ON is the rule for which plates go to which guest: "only veg plates for this table". If no veg plate fits, the guest still sits with an empty plate. WHERE is a bouncer at the door after seating: "throw out anyone without a veg plate". Same rule, very different hall.</p>
  </div>
  <p>Move the filter into ON. Now it only decides which orders <em>count as a match</em>; every customer is still kept.</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND o.status = 'delivered'
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>status</th></tr><tr><td>Asha</td><td>100</td><td>delivered</td></tr><tr><td>Asha</td><td>101</td><td>delivered</td></tr><tr><td>Ben</td><td>NULL</td><td>NULL</td></tr><tr><td>Chen</td><td>103</td><td>delivered</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td></tr></table>
  <p>Ben's only order is cancelled, so under the new ON rule he has no match and gets a padded row, like Dia. Chen's pending order also stops matching, so Chen shows only order 103.</p>
  <h3>Counting after a LEFT JOIN</h3>
  <div class="fx" data-lang="sql">SELECT c.name,
       COUNT(*)          AS count_star,
       COUNT(o.order_id) AS count_orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>count_star</th><th>count_orders</th></tr><tr><td>Asha</td><td>2</td><td>2</td></tr><tr><td>Ben</td><td>1</td><td>1</td></tr><tr><td>Chen</td><td>2</td><td>2</td></tr><tr><td>Dia</td><td>1</td><td>0</td></tr></table>
  <p><code>COUNT(*)</code> counts rows, and Dia's padded row is a row, so she gets 1. <code>COUNT(o.order_id)</code> counts non-NULL values, so she gets the true 0.</p>
  <h3>The opposite mistake: a left-table filter in ON</h3>
  <p>Conditions on the <em>left</em> table do not filter in ON. They only stop matches:</p>
  <div class="fx" data-lang="sql">SELECT c.name, c.city, o.order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND c.city = 'Mumbai'
ORDER BY c.customer_id, o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>city</th><th>order_id</th></tr><tr><td>Asha</td><td>Mumbai</td><td>100</td></tr><tr><td>Asha</td><td>Mumbai</td><td>101</td></tr><tr><td>Ben</td><td>Delhi</td><td>NULL</td></tr><tr><td>Chen</td><td>Mumbai</td><td>103</td></tr><tr><td>Chen</td><td>Mumbai</td><td>104</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td></tr></table>
  <p>We wanted Mumbai customers only, but Ben (Delhi) and Dia are still there, with no orders attached. A LEFT JOIN never removes a left row; only WHERE can. So <code>c.city = 'Mumbai'</code> belongs in WHERE.</p>
  <div class="callout intu"><span class="label">Rule</span>
    <p>Conditions on the <strong>right</strong> (optional) table go in <strong>ON</strong>. Conditions on the <strong>left</strong> (preserved) table go in <strong>WHERE</strong>. The one deliberate exception is <code>WHERE right.key IS NULL</code>, the anti-join from section 04.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Any WHERE test on a right-table column that NULL fails (<code>=</code>, <code>&gt;</code>, <code>LIKE</code>, <code>IN</code>) cancels the LEFT JOIN. Code reviewers look for exactly this pattern.</p>
  </div>

  <h2 id="sj-fan"><span class="num">06</span>Fan-out: Double Counting</h2>
  <p>This is the most expensive join bug in real companies, because nothing errors. The numbers are just too big. It happens when one parent row (a customer) is joined to <em>two different</em> child tables that each have many rows per parent.</p>
  <p>Add a <code>visits</code> table (a copy of shop): Asha visited the website 3 times, Chen once.</p>
  <table class="tbl"><caption>visits</caption><tr><th>customer_id</th><th>visit_date</th></tr><tr><td>1</td><td>2024-05-01</td></tr><tr><td>1</td><td>2024-05-10</td></tr><tr><td>1</td><td>2024-06-01</td></tr><tr><td>3</td><td>2024-06-14</td></tr></table>
  <p>The analyst wants revenue and visit count per customer in one query, so they join everything:</p>
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
  <p>Asha's real revenue is 1380 (Laptop 800 + Lamps 80 + Phone 500) and she has 3 visits. The query says 4140 and 9. To see why, look at the rows <em>before</em> GROUP BY, for Asha only:</p>
  <div class="fx" data-lang="sql">SELECT c.name, p.name AS product, oi.qty * oi.unit_price AS line_total, v.visit_date
FROM customers c
JOIN orders o       ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
JOIN products p     ON p.product_id  = oi.product_id
JOIN visits v       ON v.customer_id = c.customer_id
WHERE c.name = 'Asha'
ORDER BY p.name, v.visit_date;</div>
  <table class="tbl out"><caption>Asha's rows before grouping: 3 items × 3 visits</caption><tr><th>name</th><th>product</th><th>line_total</th><th>visit_date</th></tr><tr><td>Asha</td><td>Lamp</td><td>80.00</td><td>2024-05-01</td></tr><tr><td>Asha</td><td>Lamp</td><td>80.00</td><td>2024-05-10</td></tr><tr><td>Asha</td><td>Lamp</td><td>80.00</td><td>2024-06-01</td></tr><tr><td>Asha</td><td>Laptop</td><td>800.00</td><td>2024-05-01</td></tr><tr><td>Asha</td><td>Laptop</td><td>800.00</td><td>2024-05-10</td></tr><tr><td>Asha</td><td>Laptop</td><td>800.00</td><td>2024-06-01</td></tr><tr><td>Asha</td><td>Phone</td><td>500.00</td><td>2024-05-01</td></tr><tr><td>Asha</td><td>Phone</td><td>500.00</td><td>2024-05-10</td></tr><tr><td>Asha</td><td>Phone</td><td>500.00</td><td>2024-06-01</td></tr></table>
  <p>Asha has 3 order lines and 3 visits. The join has no rule linking a line to a visit, so every line pairs with every visit: 3 × 3 = 9 rows. Each line total appears 3 times, so revenue triples (1380 × 3 = 4140). Each visit appears 3 times, so visits = 9. Chen: 3 lines × 1 visit, so his revenue is right by luck, but his visit count is 3.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <g font-size="10">
    <text x="165" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tr">Join both children directly</text>
    <rect x="15" y="36" width="105" height="26" rx="4" class="fb"/><text x="67" y="53" text-anchor="middle">Laptop 800</text><rect x="15" y="80" width="105" height="26" rx="4" class="fb"/><text x="67" y="97" text-anchor="middle">Lamp 2×40</text><rect x="15" y="124" width="105" height="26" rx="4" class="fb"/><text x="67" y="141" text-anchor="middle">Phone 500</text><rect x="225" y="36" width="90" height="26" rx="4" class="fv"/><text x="270" y="53" text-anchor="middle">visit 1</text><rect x="225" y="80" width="90" height="26" rx="4" class="fv"/><text x="270" y="97" text-anchor="middle">visit 2</text><rect x="225" y="124" width="90" height="26" rx="4" class="fv"/><text x="270" y="141" text-anchor="middle">visit 3</text><g class="sr" stroke-opacity="0.8"><line x1="120" y1="49" x2="225" y2="49"/><line x1="120" y1="49" x2="225" y2="93"/><line x1="120" y1="49" x2="225" y2="137"/><line x1="120" y1="93" x2="225" y2="49"/><line x1="120" y1="93" x2="225" y2="93"/><line x1="120" y1="93" x2="225" y2="137"/><line x1="120" y1="137" x2="225" y2="49"/><line x1="120" y1="137" x2="225" y2="93"/><line x1="120" y1="137" x2="225" y2="137"/></g>
    <text x="165" y="176" text-anchor="middle" font-size="11" class="tr">3 × 3 = 9 rows → revenue 4140 ✗</text>
    <line x1="340" y1="10" x2="340" y2="180" stroke="currentColor" stroke-dasharray="4 4" opacity="0.4"/>
    <text x="470" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tg">Aggregate first</text>
    <rect x="360" y="76" width="100" height="34" rx="6" class="fb sb"/><text x="410" y="97" text-anchor="middle">rev 1380</text>
    <rect x="490" y="76" width="100" height="34" rx="6" class="fv"/><text x="540" y="97" text-anchor="middle">visits 3</text>
    <line x1="460" y1="93" x2="490" y2="93" class="sg" stroke-width="2"/>
    <text x="470" y="176" text-anchor="middle" font-size="11" class="tg">1 × 1 = 1 row ✓</text>
    </g>
  </svg><figcaption>Asha's 3 item rows each pair with all 3 visits. Pre-aggregating each child to one row per customer removes the multiplication.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two guest lists for a wedding, one for the mehendi and one for the sangeet, stapled side by side so that every mehendi name is written next to every sangeet name. Count the mehendi guests on the stapled sheet and you count each of them once per sangeet guest.</p>
  </div>
  <p><strong>Fix: bring each child down to one row per customer first, then join.</strong> The <strong>grain</strong> of a table is "what one row means". Orders-joined-to-items has grain "one order line". We need grain "one customer" on both sides before they meet.</p>
  <div class="fx" data-lang="sql">WITH rev AS (
  SELECT o.customer_id, SUM(oi.qty * oi.unit_price) AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  GROUP BY o.customer_id
), vis AS (
  SELECT customer_id, COUNT(*) AS visits
  FROM visits
  GROUP BY customer_id
)
SELECT c.name, rev.revenue, COALESCE(vis.visits, 0) AS visits
FROM customers c
LEFT JOIN rev ON rev.customer_id = c.customer_id
LEFT JOIN vis ON vis.customer_id = c.customer_id
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>revenue</th><th>visits</th></tr><tr><td>Asha</td><td>1380.00</td><td>3</td></tr><tr><td>Ben</td><td>150.00</td><td>0</td></tr><tr><td>Chen</td><td>1270.00</td><td>1</td></tr><tr><td>Dia</td><td>NULL</td><td>0</td></tr></table>
  <p><code>rev</code> has one row per customer (3 rows). <code>vis</code> has one row per customer (2 rows). Joining one-row-per-customer pieces to customers can never multiply, so Asha shows 1380 and 3. <code>COALESCE(vis.visits, 0)</code> turns "no row in vis" into 0.</p>
  <p>A cheap habit that catches fan-out: count rows after each join. If the count grows when you did not expect it to, stop.</p>
  <div class="fx" data-lang="sql">SELECT
  (SELECT COUNT(*) FROM customers)                                   AS step0_customers,
  (SELECT COUNT(*) FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.customer_id)            AS step1_orders,
  (SELECT COUNT(*) FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.customer_id
     LEFT JOIN order_items oi ON oi.order_id = o.order_id)           AS step2_items,
  (SELECT COUNT(*) FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.customer_id
     LEFT JOIN order_items oi ON oi.order_id = o.order_id
     LEFT JOIN visits v ON v.customer_id = c.customer_id)            AS step3_visits;</div>
  <table class="tbl out"><caption>Row counts after each join step</caption><tr><th>step0_customers</th><th>step1_orders</th><th>step2_items</th><th>step3_visits</th></tr><tr><td>4</td><td>6</td><td>8</td><td>14</td></tr></table>
  <p>4 customers → 6 (orders, expected: Asha and Chen have two) → 8 (items, expected) → 14 (visits: a jump with no business meaning). That last jump is the bug.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Fan-out</strong>: rows multiply because a join key is not unique on the side you assumed it was. Joining two independent one-to-many relations on the same parent creates a per-parent cross product.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>COUNT(DISTINCT …)</code> can patch inflated <em>counts</em>, but <code>SUM(DISTINCT line_total)</code> is wrong whenever two real lines have the same value (two ₹40 lamps). Fix the grain, do not paper over it.</p>
  </div>

  <h2 id="sj-multi"><span class="num">07</span>Multi-table, USING &amp; Non-equi Joins</h2>
  <p>Real questions often need four tables. "How much did each customer spend per category?" The customer is in <code>customers</code>, the link to items is in <code>orders</code>, quantities and prices are in <code>order_items</code>, and the category is in <code>products</code>. You chain joins along the keys. Each JOIN adds one table to the result built so far.</p>
  <div class="flow"><span>customers</span><span>orders (customer_id)</span><span>order_items (order_id)</span><span>products (product_id)</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tracking a courier parcel: your phone number gives the booking, the booking gives the consignment, the consignment gives the hub. Each step uses the key you got from the previous step.</p>
  </div>
  <div class="fx" data-lang="sql">SELECT c.name, p.category, SUM(oi.qty * oi.unit_price) AS spent
FROM customers c
JOIN orders o       ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
JOIN products p     ON p.product_id  = oi.product_id
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY c.name, p.category
ORDER BY c.name, p.category;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>category</th><th>spent</th></tr><tr><td>Asha</td><td>Electronics</td><td>1300.00</td></tr><tr><td>Asha</td><td>Furniture</td><td>80.00</td></tr><tr><td>Chen</td><td>Electronics</td><td>1000.00</td></tr><tr><td>Chen</td><td>Furniture</td><td>270.00</td></tr></table>
  <p>Each <code>ON</code> uses a key from a table already in the chain. The WHERE drops Ben's cancelled order, so he disappears completely (INNER joins). Asha's Electronics 1300 = Laptop 800 + Phone 500; Chen's Furniture 270 = Desk 150 + 3 Lamps 120.</p>
  <h3>Trap: LEFT then INNER</h3>
  <p>Suppose you want every customer, so you make the first join LEFT, but leave the next one INNER. Look at Ben and Dia only:</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, oi.product_id
FROM customers c
LEFT JOIN orders o  ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id   = o.order_id
WHERE c.customer_id IN (2, 4)
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>product_id</th></tr><tr><td>Ben</td><td>102</td><td>12</td></tr></table>
  <p>Dia is gone. Trace: the LEFT JOIN gives Dia a row with <code>o.order_id</code> = NULL. The next INNER JOIN looks for items where <code>oi.order_id = NULL</code>, finds none, and drops her. Once a branch is LEFT joined, every later join that hangs off it must also be LEFT:</p>
  <div class="fx" data-lang="sql">SELECT c.name, o.order_id, oi.product_id
FROM customers c
LEFT JOIN orders o       ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON oi.order_id   = o.order_id
WHERE c.customer_id IN (2, 4)
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th><th>product_id</th></tr><tr><td>Ben</td><td>102</td><td>12</td></tr><tr><td>Dia</td><td>NULL</td><td>NULL</td></tr></table>
  <h3>USING and NATURAL JOIN</h3>
  <p>When the key column has the same name in both tables, <code>USING (customer_id)</code> is a shorter way to write <code>ON c.customer_id = o.customer_id</code>. The key appears once in the output, so you write <code>customer_id</code> without an alias.</p>
  <div class="fx" data-lang="sql">SELECT customer_id, c.name, o.order_id
FROM customers c
JOIN orders o USING (customer_id)
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_id</th><th>name</th><th>order_id</th></tr><tr><td>1</td><td>Asha</td><td>100</td></tr><tr><td>1</td><td>Asha</td><td>101</td></tr><tr><td>2</td><td>Ben</td><td>102</td></tr><tr><td>3</td><td>Chen</td><td>103</td></tr><tr><td>3</td><td>Chen</td><td>104</td></tr></table>
  <p><code>NATURAL JOIN</code> goes one step further: it joins on <em>every</em> column whose name appears in both tables, without listing them. Today customers and orders share only <code>customer_id</code>, so it works:</p>
  <div class="fx" data-lang="sql">SELECT name, order_id
FROM customers
NATURAL JOIN orders
ORDER BY order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>order_id</th></tr><tr><td>Asha</td><td>100</td></tr><tr><td>Asha</td><td>101</td></tr><tr><td>Ben</td><td>102</td></tr><tr><td>Chen</td><td>103</td></tr><tr><td>Chen</td><td>104</td></tr></table>
  <p>Now a developer adds an audit column <code>created_by</code> to both tables (customers default 'signup_form', orders default 'checkout'), and runs the same query again:</p>
  <div class="fx" data-lang="sql">SELECT name, order_id
FROM customers
NATURAL JOIN orders
ORDER BY order_id;</div>
  <table class="tbl out"><caption>Result after adding created_by to both tables: 0 rows</caption><tr><th>name</th><th>order_id</th></tr></table>
  <p>NATURAL JOIN silently started matching on <code>created_by</code> too, and 'signup_form' never equals 'checkout'. No error, empty report. Always name the key with <code>ON</code> or <code>USING</code>.</p>
  <h3>Non-equi joins</h3>
  <p>ON can hold any condition, not just <code>=</code>. HR has salary bands (junior up to 79,999, mid up to 99,999, senior above) and wants each employee's band. There is no shared key; the match is "salary falls inside the range".</p>
  <div class="fx" data-lang="sql">SELECT e.name, e.salary, b.band
FROM employees e
JOIN (VALUES ('junior', 0, 79999),
             ('mid', 80000, 99999),
             ('senior', 100000, 999999)) AS b(band, lo, hi)
  ON e.salary BETWEEN b.lo AND b.hi
ORDER BY e.salary DESC, e.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>salary</th><th>band</th></tr><tr><td>Ravi</td><td>120000</td><td>senior</td></tr><tr><td>Sara</td><td>95000</td><td>mid</td></tr><tr><td>Tom</td><td>95000</td><td>mid</td></tr><tr><td>Uma</td><td>70000</td><td>junior</td></tr><tr><td>Vik</td><td>65000</td><td>junior</td></tr></table>
  <p><code>(VALUES …) AS b(band, lo, hi)</code> builds a 3-row table inline, with column names. Each employee is compared with all 3 bands and kept where <code>BETWEEN</code> is TRUE. Trace Sara: 95,000 is not in 0–79,999, is in 80,000–99,999 (mid), is not in 100,000+. Exactly one band, so one row.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Equi-join</strong>: the ON condition is equality of keys. <strong>Non-equi join</strong>: any other condition (<code>BETWEEN</code>, <code>&lt;</code>, <code>&gt;=</code>). Used for price bands, tax slabs, "the exchange rate valid on that date", and event windows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Bands must not overlap, or a row matches twice (fan-out again). Non-equi joins cannot use a hash join, so on big tables they are slow; sort-based or index-based plans are needed.</p>
  </div>

  <h2 id="sj-algo"><span class="num">08</span>How the Engine Joins</h2>
  <p>The "all pairs" model is for thinking. If the engine really built all pairs, joining two tables of 1 million rows would mean 10<sup>12</sup> comparisons. Instead the <strong>optimizer</strong> (the part of the database that plans a query) picks one of three physical algorithms. You see its choice with <code>EXPLAIN</code>, which prints the plan without running the query.</p>
  <div class="fx" data-lang="sql">EXPLAIN (COSTS OFF)
SELECT c.name, o.order_id
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id;</div>
  <table class="tbl out"><caption>Plan (PostgreSQL 16)</caption><tr><th>QUERY PLAN</th></tr><tr><td>Hash Join</td></tr><tr><td>  Hash Cond: (o.customer_id = c.customer_id)</td></tr><tr><td>  -&gt;  Seq Scan on orders o</td></tr><tr><td>  -&gt;  Hash</td></tr><tr><td>        -&gt;  Seq Scan on customers c</td></tr></table>
  <p>Read a plan from the most indented line up. <code>Seq Scan on customers c</code> reads all customers; <code>Hash</code> builds a hash table from them in memory, keyed on <code>customer_id</code>. <code>Seq Scan on orders o</code> then streams every order, and for each one the <code>Hash Join</code> looks up its <code>customer_id</code> in that table. That is a <strong>hash join</strong>: build on the small side, probe with the big side.</p>
  <table class="tbl"><caption>Trace: hash join, customers (build) and orders (probe)</caption>
    <tr><th>step</th><th>action</th><th>state</th></tr>
    <tr><td>build</td><td>put each customer in a bucket by id</td><td>{1: Asha, 2: Ben, 3: Chen, 4: Dia}</td></tr>
    <tr><td>probe 100</td><td>look up key 1</td><td>found Asha → output (100, Asha)</td></tr>
    <tr><td>probe 101</td><td>look up key 1</td><td>found Asha → output (101, Asha)</td></tr>
    <tr><td>probe 102</td><td>look up key 2</td><td>found Ben → output</td></tr>
    <tr><td>probe 103, 104</td><td>look up key 3 twice</td><td>found Chen → 2 rows</td></tr>
  </table>
  <p>Each order costs one lookup, so the total work is about m + n, not m × n.</p>
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
    <text x="235" y="122" text-anchor="middle" class="tm">small</text>
    <rect x="280" y="40" width="40" height="22" rx="3" class="fg sg"/><text x="300" y="55" text-anchor="middle">#0</text>
    <rect x="280" y="68" width="40" height="22" rx="3" class="fg sg"/><text x="300" y="83" text-anchor="middle">#1</text>
    <rect x="280" y="96" width="40" height="22" rx="3" class="fg sg"/><text x="300" y="111" text-anchor="middle">#2</text>
    <rect x="345" y="36" width="40" height="18" rx="3" class="fv"/><rect x="345" y="60" width="40" height="18" rx="3" class="fv"/><rect x="345" y="84" width="40" height="18" rx="3" class="fv"/><rect x="345" y="108" width="40" height="18" rx="3" class="fv"/>
    <text x="365" y="140" text-anchor="middle" class="tm">big</text>
    <g stroke="currentColor" marker-end="url(#sj-ar1)"><line x1="255" y1="61" x2="278" y2="55"/><line x1="255" y1="93" x2="278" y2="105"/><line x1="345" y1="69" x2="322" y2="79"/></g>
    <text x="300" y="166" text-anchor="middle">build small, probe big</text>
    <text x="500" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Merge join</text>
    <rect x="425" y="40" width="40" height="22" rx="3" class="fb"/><text x="445" y="55" text-anchor="middle">1</text>
    <rect x="425" y="70" width="40" height="22" rx="3" class="fb"/><text x="445" y="85" text-anchor="middle">2</text>
    <rect x="425" y="100" width="40" height="22" rx="3" class="fb"/><text x="445" y="115" text-anchor="middle">4</text>
    <rect x="535" y="40" width="40" height="22" rx="3" class="fv"/><text x="555" y="55" text-anchor="middle">1</text>
    <rect x="535" y="70" width="40" height="22" rx="3" class="fv"/><text x="555" y="85" text-anchor="middle">3</text>
    <rect x="535" y="100" width="40" height="22" rx="3" class="fv"/><text x="555" y="115" text-anchor="middle">4</text>
    <g class="sg" stroke-width="2"><line x1="465" y1="51" x2="535" y2="51"/><line x1="465" y1="111" x2="535" y2="111"/></g>
    <g stroke="currentColor" marker-end="url(#sj-ar1)"><line x1="415" y1="40" x2="415" y2="125"/><line x1="585" y1="40" x2="585" y2="125"/></g>
    <text x="500" y="166" text-anchor="middle">walk two sorted lists</text>
    </g>
  </svg><figcaption>Nested loop: small outer side plus an index. Hash: equality on big unsorted inputs. Merge: inputs already sorted by the key.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Matching wedding guests to tables. <strong>Nested loop</strong>: for each guest, look up their name in the seating index. <strong>Hash</strong>: sort place cards into pigeonholes by first letter, then each guest checks one hole. <strong>Merge</strong>: both lists are already alphabetical, so read them side by side once.</p>
  </div>
  <table class="tbl">
    <tr><th>Algorithm</th><th>How it works</th><th>Best when</th><th>Cost</th></tr>
    <tr><td><strong>Nested loop</strong></td><td>For each outer row, look up matches in the inner side (ideally with an index)</td><td>Outer side is small; inner has an index; any condition, including non-equi</td><td>outer rows × one lookup</td></tr>
    <tr><td><strong>Hash join</strong></td><td>Build a hash table on the smaller side, stream the larger side through it</td><td>Large unsorted inputs; equality only</td><td>about m + n; needs memory, may spill to disk</td></tr>
    <tr><td><strong>Merge join</strong></td><td>Both sides sorted by the key, walked together like a zipper</td><td>Inputs already sorted (by an index) or very large</td><td>about m + n after sorting</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>logical</strong> join (INNER, LEFT…) says <em>what</em> rows come out. The <strong>physical</strong> join algorithm (nested loop, hash, merge) says <em>how</em> they are found. Any logical join can run with several physical algorithms; the result is identical.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A slow join on a foreign key with no index often shows a nested loop scanning the whole inner table per outer row. Index the foreign key column (<code>orders.customer_id</code>); PostgreSQL does not create it automatically. More in <a class="xref" data-note="sql_optimization">Query Optimization</a>.</p>
  </div>

  <h2 id="sj-puzzle"><span class="num">09</span>Row-Count Puzzle</h2>
  <p>This puzzle checks everything on the page at once: duplicate keys multiply, NULL keys never match, and each outer join adds back a different set. It is a favourite interview warm-up because the answer can be worked out by hand in two minutes, if the mental model is solid.</p>
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
  <p>On the b side, 3 and NULL are unmatched. So: 4 matched pairs, 2 unmatched a rows, 2 unmatched b rows. The matched pairs themselves:</p>
  <div class="fx" data-lang="sql">SELECT a.k AS a_k, b.k AS b_k FROM a JOIN b ON a.k = b.k;</div>
  <table class="tbl out"><caption>INNER JOIN rows</caption><tr><th>a_k</th><th>b_k</th></tr><tr><td>1</td><td>1</td></tr><tr><td>1</td><td>1</td></tr><tr><td>1</td><td>1</td></tr><tr><td>1</td><td>1</td></tr></table>
  <p>Now all five counts in one query. Each scalar subquery in the SELECT list returns one number.</p>
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
    <p>INNER ≤ m × n. LEFT ≥ m (rows of the left table). FULL ≥ max(m, n). CROSS = m × n exactly. If a join returns more rows than its "one" side, a key is not as unique as you thought.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"LEFT JOIN returns as many rows as the left table" is false whenever the right key repeats. Here it returns 6, not 4.</p>
  </div>

  <h2 id="sj-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>Join bugs are dangerous because almost none of them raise an error. The query runs, the dashboard fills, and the number is wrong. Here are the ones seen most often in code review and in interviews, with the one-line fix for each.</p>
  <div class="callout trap"><span class="label">Trap: filtering the right table in WHERE after a LEFT JOIN</span>
    <p><code>LEFT JOIN orders o … WHERE o.status = 'delivered'</code> drops every customer without a delivered order. Move the condition into ON (section 05).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: COUNT(*) after a LEFT JOIN</span>
    <p>Padded rows count as 1. Count a right-table column that is never NULL in a real match: <code>COUNT(o.order_id)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: NOT IN with a nullable subquery</span>
    <p>One NULL makes every <code>NOT IN</code> test UNKNOWN → 0 rows. Use <code>NOT EXISTS</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: joining two one-to-many children</span>
    <p>Fan-out multiplies sums and counts. Aggregate each child to one row per key first, then join. Check <code>COUNT(*)</code> after every join.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: LEFT JOIN followed by INNER JOIN on the same branch</span>
    <p>The INNER JOIN removes the padded rows the LEFT JOIN kept. Keep the whole branch LEFT.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: missing or wrong ON</span>
    <p>A missing condition is a cross join; joining on the wrong column (<code>o.order_id = c.customer_id</code>) gives plausible-looking garbage. Read every ON aloud: "order's customer equals customer's id".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: INNER JOIN to answer "who has any"</span>
    <p>It repeats the left row per match. Use EXISTS for a yes/no filter.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: NATURAL JOIN</span>
    <p>It joins on every same-named column, today and after any future schema change. Name the key with ON or USING.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting NULL keys to match</span>
    <p><code>NULL = NULL</code> is UNKNOWN, so rows with NULL keys never pair up. If NULL should mean "same", use <code>a.k IS NOT DISTINCT FROM b.k</code> (slower, no hash join) or clean the data first.</p>
  </div>

  <h2 id="sj-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How many rows does <code>customers LEFT JOIN orders</code> return in shop, and why not 4?</summary><div class="qa-body">6. Asha and Chen have 2 orders each, Ben 1, and Dia gets one NULL-padded row: 2 + 1 + 2 + 1. A LEFT JOIN guarantees <em>at least</em> one row per left row, not exactly one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Find customers who have never ordered. Give two correct ways and one risky way.</summary><div class="qa-body">Correct: <code>WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)</code>, or <code>LEFT JOIN orders o … WHERE o.order_id IS NULL</code>. Both return Dia. Risky: <code>WHERE customer_id NOT IN (SELECT customer_id FROM orders)</code>. It returns 4 here only because <code>orders.customer_id</code> is NOT NULL; one NULL would empty the result.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>SELECT name FROM employees WHERE emp_id NOT IN (SELECT manager_id FROM employees);</code></summary><div class="qa-body">Zero rows. Ravi's manager_id is NULL, so every <code>emp_id &lt;&gt; NULL</code> check is UNKNOWN, and WHERE keeps only TRUE. The intended answer (Sara, Tom, Vik) needs NOT EXISTS or <code>WHERE manager_id IS NOT NULL</code> inside the subquery.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A report should list all customers with their count of delivered orders, but Ben and Dia are missing. The query has <code>LEFT JOIN orders … WHERE o.status = 'delivered'</code>. Fix it.</summary><div class="qa-body">The WHERE drops the NULL-padded rows, turning the LEFT JOIN into an INNER JOIN. Move the condition into ON and count a right-side column:<div class="fx" data-lang="sql">SELECT c.name, COUNT(o.order_id) AS delivered_orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
                  AND o.status = 'delivered'
GROUP BY c.customer_id, c.name
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>delivered_orders</th></tr><tr><td>Asha</td><td>2</td></tr><tr><td>Ben</td><td>0</td></tr><tr><td>Chen</td><td>1</td></tr><tr><td>Dia</td><td>0</td></tr></table></div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A dashboard joins customers to orders and to website visits, and revenue comes out 3× too high for some customers. What is happening?</summary><div class="qa-body">Fan-out. Orders and visits are both one-to-many from customers, so each order line is repeated once per visit (Asha: 3 lines × 3 visits = 9 rows, revenue 4140 instead of 1380). Fix: aggregate orders per customer and visits per customer in separate CTEs, then join those one-row-per-customer results.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a query for employees who earn more than their manager. What does shop return?</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT e.name, e.salary, m.name AS manager, m.salary AS mgr_salary
FROM employees e
JOIN employees m ON m.emp_id = e.manager_id
WHERE e.salary &gt; m.salary;</div>Empty. Every employee earns less than their manager (for example Vik 65,000 &lt; Uma 70,000). An empty result is a valid answer; say so out loud in the interview.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List all unique pairs of employees in the same department, with no self-pairs or mirrored duplicates.</summary><div class="qa-body"><div class="fx" data-lang="sql">SELECT a.name AS emp1, b.name AS emp2
FROM employees a
JOIN employees b ON a.dept = b.dept AND a.emp_id &lt; b.emp_id
ORDER BY a.emp_id, b.emp_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>emp1</th><th>emp2</th></tr><tr><td>Ravi</td><td>Sara</td></tr><tr><td>Ravi</td><td>Tom</td></tr><tr><td>Sara</td><td>Tom</td></tr><tr><td>Uma</td><td>Vik</td></tr></table>Using <code>&lt;&gt;</code> instead of <code>&lt;</code> would return each pair twice (Ravi–Sara and Sara–Ravi).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Semi-join vs inner join: what is the difference, and when does INNER give a wrong answer?</summary><div class="qa-body">An inner join returns one row per matching <em>pair</em>; a semi-join (EXISTS) returns each left row once if any match exists. "Customers who ordered" via INNER JOIN lists Asha and Chen twice, which breaks counts. DISTINCT hides it but costs a sort; EXISTS is the precise tool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the three join algorithms. Which fits (a) one customer's orders, (b) two 500M-row tables on user_id, (c) inputs already sorted by key?</summary><div class="qa-body">(a) Nested loop with an index lookup: tiny outer side. (b) Hash join: big unsorted inputs, equality key; may spill to disk if memory is short. (c) Merge join: no sort needed, just walk both in order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>NATURAL JOIN</code> considered dangerous, and how does <code>USING</code> differ from <code>ON</code>?</summary><div class="qa-body">NATURAL JOIN joins on <em>every</em> same-named column. Adding <code>created_by</code> to both customers and orders made the shop query return 0 rows with no error. <code>USING (customer_id)</code> names the key explicitly and outputs it once; <code>ON</code> allows any condition and keeps both columns.</div></details>
</main>
`
});
