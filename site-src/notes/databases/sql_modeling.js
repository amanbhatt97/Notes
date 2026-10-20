// notes/databases/sql_modeling.js — Data Modeling
Object.assign(TOPIC_CONTENT, {
  "sql_modeling": `<main>
  <h1>Data Modeling</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Data Modeling</span></div>
  <p class="lead">How to decide which tables exist, which columns go where, and why: so every fact is stored once (for the app) or deliberately copied (for analytics). The whole note follows ONE running example: <strong>Biteful</strong>, first as a beginner would keep it, <strong>one giant spreadsheet</strong> called <code>biteful_sheet</code> with one row per order line and every customer and restaurant detail copied in (15 rows), and then step by step into the normalised four-table schema used in every other note of this track, and finally into a star schema for analysts. Every query and result below was run on PostgreSQL 16.</p>

  <h2 id="sm-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660">
<defs><marker id="sm-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="41" text-anchor="middle" font-size="12">Relational Model</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">tables, keys</text>
<line x1="130" y1="45" x2="148" y2="45" stroke="currentColor" marker-end="url(#sm-a0)"/>
<rect x="150" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="210" y="41" text-anchor="middle" font-size="12">Queries · Indexes</text><text x="210" y="58" text-anchor="middle" class="tm" font-size="10">read the tables</text>
<line x1="270" y1="45" x2="288" y2="45" stroke="currentColor" marker-end="url(#sm-a0)"/>
<rect x="290" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="350" y="41" text-anchor="middle" font-size="12">Transactions</text><text x="350" y="58" text-anchor="middle" class="tm" font-size="10">change them safely</text>
<line x1="410" y1="45" x2="428" y2="45" stroke="currentColor" marker-end="url(#sm-a0)"/>
<rect x="430" y="20" width="110" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="485" y="41" text-anchor="middle" font-size="12" font-weight="700">Modeling</text><text x="485" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="540" y1="45" x2="558" y2="45" stroke="currentColor" marker-end="url(#sm-a0)"/>
<rect x="560" y="20" width="90" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="605" y="41" text-anchor="middle" font-size="12">Interview</text><text x="605" y="58" text-anchor="middle" class="tm" font-size="10">practice</text>
<text x="10" y="105" class="tm" font-size="10.5">Every earlier note used Biteful's four tables as given. This note explains why there are exactly those four,</text>
<text x="10" y="123" class="tm" font-size="10.5">and why an analytics warehouse reshapes the same data into facts and dimensions.</text>
</svg><figcaption>The SQL group of the Databases track. Modeling is the design decision underneath everything else.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: using a schema</b><span><a class="xref" data-note="sql_relational">Relational Model</a> introduced tables, primary and foreign keys on Biteful; <a class="xref" data-note="sql_joins">JOINs</a> put the tables back together (and warned about fan-out when grains mix); <a class="xref" data-note="sql_transactions">Transactions</a> showed that each fact you store must be kept correct under concurrent writes.</span></li>
    <li><b>This note adds: designing a schema</b><span>Why a single wide table breaks (update, insert, delete anomalies), how functional dependencies and keys drive the split (1NF → 2NF → 3NF → BCNF), when to copy data back on purpose (denormalisation), and how analytics models differ (OLTP vs OLAP, star and snowflake schemas, facts, dimensions, slowly changing dimensions).</span></li>
    <li><b>Leads to: <a class="xref" data-note="sql_interview">SQL Interview Practice</a></b><span>Interview problems assume you can read a schema and know each table's grain. Document databases make different choices: <a class="xref" data-note="mongo_design">MongoDB Schema Design</a>.</span></li>
  </ol>

  <h2 id="sm-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All on <code>biteful_sheet</code> and what we build from it.</p>
  <ol class="story">
    <li><b>The giant spreadsheet</b><span>Q: why not keep everything in one table? → Ben moves city and is now in two cities (update anomaly); Gita and Momo Magic can't be stored (insert anomaly); deleting order 105 erases Dia and Green Bowl (delete anomaly). What is repeated, and why?</span></li>
    <li><b>Keys and relationships</b><span>Q: which columns decide which? → functional dependencies checked by query: order_id → customer, customer → city, (order_id, item) → qty; the key is (order_id, item); entities and 1:N / M:N links. So how do we split, step by step?</span></li>
    <li><b>1NF</b><span>Q: one row per order with items in a list? → "how many Masala Dosas sold?" needs text parsing (count of orders 3 vs real 5). One value per cell. But order facts still repeat on every line…</span></li>
    <li><b>2NF</b><span>Q: why does order 102's status appear twice and disagree after one edit? → status depends on only part of the key; move order facts to an orders table. But Ben's city still repeats on each of his orders…</span></li>
    <li><b>3NF</b><span>Q: why is Ben's city stored per order? → order → customer → city is a chain; customers and restaurants get their own tables; Gita and Momo Magic can exist. Is "every column depends on the key" always enough?</span></li>
    <li><b>BCNF</b><span>Q: what if a non-key column decides part of the key? → rider shifts: rider → slot breaks it; split. Now every fact is stored once, but every screen needs joins…</span></li>
    <li><b>Denormalisation</b><span>Q: may we copy data back for speed? → yes, on purpose: orders.amount, a materialised view; the cost is drift (shown: stale view, amount ≠ lines). Copies are fine for read-mostly analytics, which is a different workload…</span></li>
    <li><b>OLTP vs OLAP</b><span>Q: why do the app and the analyst want different shapes? → small safe writes of current state vs huge reads over history. What shape suits the analyst?</span></li>
    <li><b>Star vs snowflake</b><span>Q: how do we lay tables out for analysis? → one fact table surrounded by dimensions (star); dimensions normalised further (snowflake) cost one more join. What exactly goes in a fact row?</span></li>
    <li><b>Facts and dimensions</b><span>Q: what does one fact row mean and which numbers can be added? → grain = one order line; additive, semi-additive, non-additive measures; mixing grains double-counts (₹3,510 becomes ₹5,510, shown). But dimensions change over time…</span></li>
    <li><b>Slowly changing dimensions</b><span>Q: Ben moves from Mumbai to Pune; which city gets his old orders? → Type 1 overwrites history; Type 2 keeps versions with validity dates (traced). What about attributes that differ per row?</span></li>
    <li><b>JSONB vs columns, conventions</b><span>Q: varying attributes, keys, timestamps, soft deletes? → when a JSONB column is fine, and the habits real schemas follow.</span></li>
  </ol>

  <h2 id="sm-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">Data Modeling</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Why model</div>
      <ul>
        <li><b>One wide table</b> → repeated facts</li>
        <li><b>Update / insert / delete anomalies</b></li>
        <li>💡 salt jar next to every dish</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Keys &amp; dependencies</div>
      <ul>
        <li><b>A → B</b>: know A, know B</li>
        <li><b>Candidate key</b> decides the whole row</li>
        <li><b>1:N</b> → FK on the many side; <b>M:N</b> → junction table</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Normal forms</div>
      <ul>
        <li><b>1NF</b> one value per cell</li>
        <li><b>2NF</b> no partial dependency</li>
        <li><b>3NF</b> no transitive dependency</li>
        <li><b>BCNF</b> every determinant is a key</li>
        <li>"the key, the whole key, nothing but the key"</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Denormalisation</div>
      <ul>
        <li>Copy on purpose for reads: stored totals, materialised views</li>
        <li>⚠ copies drift; refresh or keep in sync</li>
        <li>Normalise the source of truth; denormalise copies</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Analytics models</div>
      <ul>
        <li><b>OLTP</b> 3NF, current state · <b>OLAP</b> history, big reads</li>
        <li><b>Star</b>: fact + dimensions · <b>snowflake</b>: normalised dims</li>
        <li><b>Grain</b> first; additive / semi / non-additive</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Change over time</div>
      <ul>
        <li><b>SCD 1</b> overwrite · <b>SCD 2</b> new row + valid_from/to · <b>SCD 3</b> previous column</li>
        <li>⚠ join SCD2 on the date range</li>
        <li>JSONB for sparse attributes; surrogate keys; audit columns</li>
      </ul>
    </div>
  </div>
</div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sm-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sm-sheet"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Giant Spreadsheet</span><span class="rm-sub">Three anomalies, shown</span></div></div>
      <div class="rm-item rm-done" data-target="sm-keys"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Keys &amp; Relationships</span><span class="rm-sub">Dependencies checked by query</span></div></div>
      <div class="rm-item rm-done" data-target="sm-1nf"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">1NF</span><span class="rm-sub">One value per cell</span></div></div>
      <div class="rm-item rm-done" data-target="sm-2nf"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">2NF</span><span class="rm-sub">Whole key</span></div></div>
      <div class="rm-item rm-done" data-target="sm-3nf"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">3NF</span><span class="rm-sub">Nothing but the key</span></div></div>
      <div class="rm-item rm-done" data-target="sm-bcnf"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">BCNF</span><span class="rm-sub">Every determinant a key</span></div></div>
      <div class="rm-item rm-done" data-target="sm-denorm"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Denormalisation</span><span class="rm-sub">When, and its cost</span></div></div>
      <div class="rm-item rm-done" data-target="sm-olap"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">OLTP vs OLAP</span><span class="rm-sub">Two workloads</span></div></div>
      <div class="rm-item rm-done" data-target="sm-star"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Star vs Snowflake</span><span class="rm-sub">Biteful's warehouse</span></div></div>
      <div class="rm-item rm-done" data-target="sm-facts"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Facts &amp; Dimensions</span><span class="rm-sub">Grain and measures</span></div></div>
      <div class="rm-item rm-done" data-target="sm-scd"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Slowly Changing Dimensions</span><span class="rm-sub">Type 1 vs Type 2, traced</span></div></div>
      <div class="rm-item rm-done" data-target="sm-json"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">JSONB vs Columns</span><span class="rm-sub">Sparse attributes</span></div></div>
      <div class="rm-item rm-done" data-target="sm-conv"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Practical Conventions</span><span class="rm-sub">Keys, timestamps, soft delete</span></div></div>
      <div class="rm-item rm-done" data-target="sm-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One design story</span></div></div>
      <div class="rm-item rm-done" data-target="sm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sm-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sm-sheet"><span class="num">01</span>One Giant Spreadsheet</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every earlier note used Biteful's four tables (customers, restaurants, orders, order_items) as if they were obvious. A beginner would more likely keep one sheet with everything on each row: it's what a spreadsheet invites. What is actually wrong with that?</p>
  </div>
  <p>Here is Biteful kept the spreadsheet way: one row per order line, with the order's time, status and bill, the customer's name and city, and the restaurant's name, city and cuisine copied onto every line.</p>
  <div class="fx" data-lang="sql">SELECT * FROM biteful_sheet ORDER BY order_id, item;</div>
  <table class="tbl out"><caption>biteful_sheet (15 rows)</caption><tr><th>order_id</th><th>ordered_at</th><th>status</th><th>amount</th><th>customer</th><th>customer_city</th><th>restaurant</th><th>restaurant_city</th><th>cuisine</th><th>item</th><th>qty</th><th>unit_price</th></tr><tr><td>101</td><td>2026-03-02 12:10</td><td>delivered</td><td>240.00</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td><td>Pune</td><td>South Indian</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr><tr><td>102</td><td>2026-03-02 13:05</td><td>delivered</td><td>450.00</td><td>Ben</td><td>Mumbai</td><td>Biryani Bros</td><td>Mumbai</td><td>Biryani</td><td>Chicken Biryani</td><td>1</td><td>350.00</td></tr><tr><td>102</td><td>2026-03-02 13:05</td><td>delivered</td><td>450.00</td><td>Ben</td><td>Mumbai</td><td>Biryani Bros</td><td>Mumbai</td><td>Biryani</td><td>Raita</td><td>2</td><td>50.00</td></tr><tr><td>103</td><td>2026-03-02 20:30</td><td>delivered</td><td>520.00</td><td>Chen</td><td>Pune</td><td>Pizza Point</td><td>Pune</td><td>Pizza</td><td>Farmhouse Pizza</td><td>2</td><td>260.00</td></tr><tr><td>104</td><td>2026-03-03 13:15</td><td>delivered</td><td>380.00</td><td>Asha</td><td>Pune</td><td>Pizza Point</td><td>Pune</td><td>Pizza</td><td>Garlic Bread</td><td>1</td><td>100.00</td></tr><tr><td>104</td><td>2026-03-03 13:15</td><td>delivered</td><td>380.00</td><td>Asha</td><td>Pune</td><td>Pizza Point</td><td>Pune</td><td>Pizza</td><td>Margherita</td><td>1</td><td>280.00</td></tr><tr><td>105</td><td>2026-03-03 19:45</td><td>cancelled</td><td>310.00</td><td>Dia</td><td>Mumbai</td><td>Green Bowl</td><td>Mumbai</td><td>Healthy</td><td>Buddha Bowl</td><td>1</td><td>310.00</td></tr><tr><td>106</td><td>2026-03-04 12:40</td><td>delivered</td><td>180.00</td><td>Ben</td><td>Mumbai</td><td>Biryani Bros</td><td>Mumbai</td><td>Biryani</td><td>Veg Biryani</td><td>1</td><td>180.00</td></tr><tr><td>107</td><td>2026-03-04 21:10</td><td>cancelled</td><td>260.00</td><td>Esha</td><td>NULL</td><td>Pizza Point</td><td>Pune</td><td>Pizza</td><td>Farmhouse Pizza</td><td>1</td><td>260.00</td></tr><tr><td>108</td><td>2026-03-05 18:20</td><td>delivered</td><td>260.00</td><td>Chen</td><td>Pune</td><td>Dosa Hut</td><td>Pune</td><td>South Indian</td><td>Filter Coffee</td><td>2</td><td>70.00</td></tr><tr><td>108</td><td>2026-03-05 18:20</td><td>delivered</td><td>260.00</td><td>Chen</td><td>Pune</td><td>Dosa Hut</td><td>Pune</td><td>South Indian</td><td>Masala Dosa</td><td>1</td><td>120.00</td></tr><tr><td>109</td><td>2026-03-05 20:05</td><td>delivered</td><td>600.00</td><td>Farah</td><td>Mumbai</td><td>Biryani Bros</td><td>Mumbai</td><td>Biryani</td><td>Chicken Biryani</td><td>1</td><td>350.00</td></tr><tr><td>109</td><td>2026-03-05 20:05</td><td>delivered</td><td>600.00</td><td>Farah</td><td>Mumbai</td><td>Biryani Bros</td><td>Mumbai</td><td>Biryani</td><td>Mutton Kebab</td><td>1</td><td>250.00</td></tr><tr><td>110</td><td>2026-03-08 20:50</td><td>pending</td><td>310.00</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td><td>Pune</td><td>South Indian</td><td>Filter Coffee</td><td>1</td><td>70.00</td></tr><tr><td>110</td><td>2026-03-08 20:50</td><td>pending</td><td>310.00</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td><td>Pune</td><td>South Indian</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr></table>
  <p>Look down the columns. "Ben, Mumbai" is written 3 times (two lines of order 102, one of 106). "Biryani Bros, Mumbai, Biryani" 5 times. Order 102's time, status and ₹450 bill twice. Each is <em>one fact</em> stored several times. Repetition is not just wasted space: it lets the copies disagree. Three things go wrong, each run for real below.</p>
  <h3>Update anomaly</h3>
  <p>Ben moves to Pune. The app updates the row it is looking at, order 106:</p>
  <div class="fx" data-lang="sql">UPDATE biteful_sheet SET customer_city = 'Pune' WHERE order_id = 106;
SELECT DISTINCT customer, customer_city FROM biteful_sheet WHERE customer = 'Ben';</div>
  <div class="fx" data-lang="text">UPDATE 1</div>
  <table class="tbl out"><caption>Where does Ben live?</caption><tr><th>customer</th><th>customer_city</th></tr><tr><td>Ben</td><td>Mumbai</td></tr><tr><td>Ben</td><td>Pune</td></tr></table>
  <p>Ben now lives in two cities. Every copy must be found and changed together, and nothing in the table makes sure that happens.</p>
  <h3>Insert anomaly</h3>
  <div class="fx" data-lang="sql">SELECT count(DISTINCT customer) AS customers, count(DISTINCT restaurant) AS restaurants FROM biteful_sheet;</div>
  <table class="tbl out"><caption>Who is in the sheet?</caption><tr><th>customers</th><th>restaurants</th></tr><tr><td>6</td><td>4</td></tr></table>
  <p>Biteful has 7 customers and 5 restaurants, but the sheet knows only 6 and 4. Gita signed up but never ordered; Momo Magic joined but was never ordered from. A row needs an order line, so they <em>cannot be stored at all</em> until someone orders.</p>
  <h3>Delete anomaly</h3>
  <p>Dia's only order, 105, was cancelled. Clean it out:</p>
  <div class="fx" data-lang="sql">DELETE FROM biteful_sheet WHERE order_id = 105;
SELECT count(*) FILTER (WHERE customer = 'Dia') AS dia_rows,
       count(*) FILTER (WHERE restaurant = 'Green Bowl') AS green_bowl_rows
FROM biteful_sheet;</div>
  <div class="fx" data-lang="text">DELETE 1</div>
  <table class="tbl out"><caption>What else disappeared?</caption><tr><th>dia_rows</th><th>green_bowl_rows</th></tr><tr><td>0</td><td>0</td></tr></table>
  <p>Deleting one order erased the only record that Dia exists and lives in Mumbai, and that Green Bowl exists and serves healthy food. Facts about a customer and a restaurant were lost by deleting a fact about an order.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kitchen where a jar of salt sits next to every dish instead of one jar on the spice shelf. Refilling "the salt" means hunting down every jar, and you will miss one. And throwing away a dish throws away its salt.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>anomaly</strong> is a way data goes wrong when it changes. <strong>Update anomaly</strong>: one fact stored in many rows, changed in only some. <strong>Insert anomaly</strong>: a fact can't be stored without an unrelated fact. <strong>Delete anomaly</strong>: removing one fact removes another. <strong>Data modeling</strong> is choosing tables, columns, keys and links so these can't happen (for the app's source of truth).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"We'll just be careful in the app." Every new feature, script and analyst query is another chance to update one copy and not the others. Make the bad state impossible in the design instead.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: keys and relationships.</b> All three anomalies come from one table describing several different things. To split it correctly we need to know, precisely, which column decides which.</div>

  <h2 id="sm-keys"><span class="num">02</span>Keys, Dependencies and Relationships</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"One table per thing" is the cure, but which things, and which columns belong to each? We need a test that tells us, for every column of <code>biteful_sheet</code>, what it really describes.</p>
  </div>
  <p>The test is the <strong>functional dependency</strong>, written <code>A → B</code>: "if you know A, you know B". Know the order id and you know its status; know the customer and you know their city. We can check a dependency against the data with a query: group by A, and see whether any group has more than one B.</p>
  <div class="fx" data-lang="sql">SELECT 'order_id → status, amount, customer' AS dependency,
       count(*) FILTER (WHERE n &gt; 1) AS violating_groups
FROM (SELECT order_id, count(DISTINCT (status, amount, customer)) AS n FROM biteful_sheet GROUP BY order_id) g
UNION ALL
SELECT 'customer → customer_city',
       count(*) FILTER (WHERE n &gt; 1)
FROM (SELECT customer, count(DISTINCT coalesce(customer_city, '?')) AS n FROM biteful_sheet GROUP BY customer) g
UNION ALL
SELECT 'restaurant → restaurant_city, cuisine',
       count(*) FILTER (WHERE n &gt; 1)
FROM (SELECT restaurant, count(DISTINCT (restaurant_city, cuisine)) AS n FROM biteful_sheet GROUP BY restaurant) g
UNION ALL
SELECT '(order_id, item) → qty, unit_price',
       count(*) FILTER (WHERE n &gt; 1)
FROM (SELECT order_id, item, count(DISTINCT (qty, unit_price)) AS n FROM biteful_sheet GROUP BY order_id, item) g
UNION ALL
SELECT 'order_id → item   (should FAIL)',
       count(*) FILTER (WHERE n &gt; 1)
FROM (SELECT order_id, count(DISTINCT item) AS n FROM biteful_sheet GROUP BY order_id) g;</div>
  <table class="tbl out"><caption>Does A → B hold in biteful_sheet? (0 violating groups = yes)</caption><tr><th>dependency</th><th>violating_groups</th></tr><tr><td>order_id → status, amount, customer</td><td>0</td></tr><tr><td>customer → customer_city</td><td>0</td></tr><tr><td>restaurant → restaurant_city, cuisine</td><td>0</td></tr><tr><td>(order_id, item) → qty, unit_price</td><td>0</td></tr><tr><td>order_id → item   (should FAIL)</td><td>5</td></tr></table>
  <p>Read the result: an order decides its status, bill and customer; a customer decides their city; a restaurant decides its city and cuisine; an (order, item) pair decides quantity and price. An order does <em>not</em> decide the item (5 orders have two lines). (Data can only <em>disprove</em> a dependency; whether it must always hold is a business rule: "a customer has one current city" is a rule, the query just confirms today's data obeys it.)</p>
  <p>A <strong>key</strong> is a set of columns that decides <em>every</em> other column, so no two rows can share it. For the sheet, that is (order_id, item):</p>
  <div class="fx" data-lang="sql">SELECT count(*) AS rows, count(DISTINCT (order_id, item)) AS distinct_order_item,
       count(DISTINCT order_id) AS distinct_orders
FROM biteful_sheet;</div>
  <table class="tbl out"><caption>Is (order_id, item) unique?</caption><tr><th>rows</th><th>distinct_order_item</th><th>distinct_orders</th></tr><tr><td>15</td><td>15</td><td>10</td></tr></table>
  <p>15 rows, 15 distinct (order_id, item) pairs: a key. order_id alone (10 values) is not. Now the dependencies tell us the <strong>entities</strong> (things we store facts about): orders, customers, restaurants, and order lines. The links between them are <strong>relationships</strong>, and each has a <strong>cardinality</strong>:</p>
  <figure class="viz"><svg viewBox="0 0 640 130" width="640">
    <g text-anchor="middle">
      <rect x="0" y="40" width="120" height="40" rx="6" class="fb sb"/><text x="60" y="65" font-weight="bold">customers</text>
      <rect x="170" y="40" width="120" height="40" rx="6" class="fb sb"/><text x="230" y="65" font-weight="bold">orders</text>
      <rect x="340" y="40" width="130" height="40" rx="6" class="fv"/><text x="405" y="58" font-weight="bold">order_items</text><text x="405" y="73" font-size="10" class="tm">qty, unit_price</text>
      <rect x="170" y="0" width="120" height="30" rx="6" class="fb sb"/><text x="230" y="20" font-weight="bold">restaurants</text>
    </g>
    <g stroke="currentColor"><line x1="120" y1="60" x2="170" y2="60"/><line x1="290" y1="60" x2="340" y2="60"/><line x1="230" y1="30" x2="230" y2="40"/></g>
    <g font-size="11" class="tb"><text x="124" y="54">1</text><text x="158" y="54">N</text><text x="294" y="54">1</text><text x="328" y="54">N</text><text x="236" y="38">1:N</text></g>
    <text x="145" y="98" text-anchor="middle" font-size="10" class="tm">FK orders.customer_id</text>
    <text x="405" y="98" text-anchor="middle" font-size="10" class="tm">PK (order_id, item)</text>
    <text x="10" y="122" font-size="10" class="tm">customers ↔ restaurants is M:N ("who ordered from where"): orders is the junction table between them</text>
  </svg><figcaption>Biteful as entities and relationships. The foreign key always sits on the "many" side.</figcaption></figure>
  <table class="tbl">
    <tr><th>Relationship</th><th>Cardinality</th><th>How it is built</th></tr>
    <tr><td>customer places orders</td><td>1 : N (0..N: Gita has none)</td><td>FK <code>orders.customer_id</code></td></tr>
    <tr><td>restaurant receives orders</td><td>1 : N (Momo Magic: 0)</td><td>FK <code>orders.restaurant_id</code></td></tr>
    <tr><td>order has lines</td><td>1 : N</td><td>FK <code>order_items.order_id</code>, PK (order_id, item)</td></tr>
    <tr><td>customers ↔ restaurants</td><td>M : N</td><td><code>orders</code> is the junction table</td></tr>
    <tr><td>customer referred by customer</td><td>1 : N, same table</td><td>self-FK <code>customers.referred_by</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A PNR number decides the passenger, train and seat: it is the key. The train number decides the route but not the passenger. Modeling asks, for every column, "which thing really decides you?" and moves the column to that thing's table.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Functional dependency</strong> A → B: rows that agree on A agree on B. A <strong>candidate key</strong> is a minimal set of columns that determines all others (a table may have several; one is chosen as the <strong>primary key</strong>). A <strong>foreign key</strong> stores another table's key. <strong>Cardinality</strong>: 1:1, 1:N (FK on the many side), M:N (a junction table).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Storing an M:N link as a list in one column (<code>restaurants.customer_ids = '1,3'</code>). "Who ordered from Dosa Hut?" becomes a string search with no FK checks. That is exactly the 1NF problem of the next section.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: 1NF.</b> We know which columns depend on what. Normalisation turns that into a recipe of steps, each removing one kind of repetition. The first step is about what a single cell may hold.</div>

  <h2 id="sm-1nf"><span class="num">03</span>1NF: One Value per Cell</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A beginner's first draft is often even flatter than our sheet: one row per order, with all the items typed into one cell. It looks tidy. What can't we ask it?</p>
  </div>
  <div class="fx" data-lang="sql">CREATE TABLE orders_draft AS
SELECT order_id, customer, restaurant,
       string_agg(item || ' x' || qty, ', ' ORDER BY item) AS items
FROM biteful_sheet GROUP BY order_id, customer, restaurant;
SELECT * FROM orders_draft ORDER BY order_id;</div>
  <table class="tbl out"><caption>Unnormalised draft: one row per order, items in one cell</caption><tr><th>order_id</th><th>customer</th><th>restaurant</th><th>items</th></tr><tr><td>101</td><td>Asha</td><td>Dosa Hut</td><td>Masala Dosa x2</td></tr><tr><td>102</td><td>Ben</td><td>Biryani Bros</td><td>Chicken Biryani x1, Raita x2</td></tr><tr><td>103</td><td>Chen</td><td>Pizza Point</td><td>Farmhouse Pizza x2</td></tr><tr><td>104</td><td>Asha</td><td>Pizza Point</td><td>Garlic Bread x1, Margherita x1</td></tr><tr><td>105</td><td>Dia</td><td>Green Bowl</td><td>Buddha Bowl x1</td></tr><tr><td>106</td><td>Ben</td><td>Biryani Bros</td><td>Veg Biryani x1</td></tr><tr><td>107</td><td>Esha</td><td>Pizza Point</td><td>Farmhouse Pizza x1</td></tr><tr><td>108</td><td>Chen</td><td>Dosa Hut</td><td>Filter Coffee x2, Masala Dosa x1</td></tr><tr><td>109</td><td>Farah</td><td>Biryani Bros</td><td>Chicken Biryani x1, Mutton Kebab x1</td></tr><tr><td>110</td><td>Asha</td><td>Dosa Hut</td><td>Filter Coffee x1, Masala Dosa x2</td></tr></table>
  <p>Now ask "how many Masala Dosas were sold?". The draft can only search text:</p>
  <div class="fx" data-lang="sql">SELECT count(*) AS orders_mentioning_dosa FROM orders_draft WHERE items LIKE '%Masala Dosa%';
SELECT sum(qty) AS masala_dosas_sold FROM biteful_sheet WHERE item = 'Masala Dosa';</div>
  <table class="tbl out"><caption>Searching the text</caption><tr><th>orders_mentioning_dosa</th></tr><tr><td>3</td></tr></table>
  <table class="tbl out"><caption>The 1NF table (one row per line) answers it directly</caption><tr><th>masala_dosas_sold</th></tr><tr><td>5</td></tr></table>
  <p>The text search finds 3 <em>orders</em>; the real answer is 5 <em>dosas</em> (2 + 1 + 2). Getting 5 from the draft means cutting strings at commas and at " x", which breaks the day someone types "Masala Dosa ×2" or a dish name contains a comma. In <code>biteful_sheet</code> each cell holds one value, so <code>SUM(qty)</code> just works: the sheet is already in <strong>first normal form</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopping list written as one long sentence vs one item per line. You can't tick off, count or sort items inside a sentence.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>1NF</strong>: every cell holds a single (atomic) value; no lists and no repeating column groups (<code>item1, item2, item3</code>); every row is identifiable by a key. Fix: one row per repeated element (here, per order line), key (order_id, item).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Repeating columns are a list in disguise: <code>item1, qty1, item2, qty2</code> needs a schema change for a third item and an OR across columns for every search. Also not 1NF.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: 2NF.</b> 1NF fixed counting, but <code>biteful_sheet</code> still repeats each order's time, status and bill on every one of its lines. Change one line's status and the order disagrees with itself.</div>

  <h2 id="sm-2nf"><span class="num">04</span>2NF: Depend on the Whole Key</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The sheet's key is (order_id, item). Yet <code>status</code> has nothing to do with the item. Why does that cause trouble, and where should <code>status</code> live?</p>
  </div>
  <p>Ask every non-key column: "do you need <em>both</em> parts of the key, or just one?" <code>qty</code> needs both (how many of <em>this item</em> in <em>this order</em>). But <code>ordered_at</code>, <code>status</code>, <code>amount</code>, <code>customer</code>, <code>restaurant</code> and everything about them need only <code>order_id</code>. Depending on just part of the key is a <strong>partial dependency</strong>, and it is why order 102's status is stored twice. The anomaly it causes:</p>
  <div class="fx" data-lang="sql">UPDATE biteful_sheet SET status = 'cancelled' WHERE order_id = 102 AND item = 'Raita';
SELECT order_id, item, status FROM biteful_sheet WHERE order_id = 102;</div>
  <div class="fx" data-lang="text">UPDATE 1</div>
  <table class="tbl out"><caption>What is order 102's status?</caption><tr><th>order_id</th><th>item</th><th>status</th></tr><tr><td>102</td><td>Chicken Biryani</td><td>delivered</td></tr><tr><td>102</td><td>Raita</td><td>cancelled</td></tr></table>
  <p>Order 102 is now both delivered and cancelled. The fix is to split by what each column depends on: order-level columns go to a table keyed by order_id alone; only the line-level columns stay with (order_id, item).</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_2nf AS
SELECT DISTINCT order_id, ordered_at, status, amount, customer, customer_city,
                restaurant, restaurant_city, cuisine
FROM biteful_sheet;
CREATE TABLE lines_2nf AS SELECT order_id, item, qty, unit_price FROM biteful_sheet;
SELECT order_id, status, amount, customer, customer_city, restaurant FROM orders_2nf ORDER BY order_id;
SELECT count(*) AS rows FROM lines_2nf;</div>
  <table class="tbl out"><caption>orders_2nf (10 rows)</caption><tr><th>order_id</th><th>status</th><th>amount</th><th>customer</th><th>customer_city</th><th>restaurant</th></tr><tr><td>101</td><td>delivered</td><td>240.00</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td></tr><tr><td>102</td><td>delivered</td><td>450.00</td><td>Ben</td><td>Mumbai</td><td>Biryani Bros</td></tr><tr><td>103</td><td>delivered</td><td>520.00</td><td>Chen</td><td>Pune</td><td>Pizza Point</td></tr><tr><td>104</td><td>delivered</td><td>380.00</td><td>Asha</td><td>Pune</td><td>Pizza Point</td></tr><tr><td>105</td><td>cancelled</td><td>310.00</td><td>Dia</td><td>Mumbai</td><td>Green Bowl</td></tr><tr><td>106</td><td>delivered</td><td>180.00</td><td>Ben</td><td>Mumbai</td><td>Biryani Bros</td></tr><tr><td>107</td><td>cancelled</td><td>260.00</td><td>Esha</td><td>NULL</td><td>Pizza Point</td></tr><tr><td>108</td><td>delivered</td><td>260.00</td><td>Chen</td><td>Pune</td><td>Dosa Hut</td></tr><tr><td>109</td><td>delivered</td><td>600.00</td><td>Farah</td><td>Mumbai</td><td>Biryani Bros</td></tr><tr><td>110</td><td>pending</td><td>310.00</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td></tr></table>
  <table class="tbl out"><caption>lines_2nf</caption><tr><th>rows</th></tr><tr><td>15</td></tr></table>
  <p>Order 102's status is now one cell: there is nothing left to disagree with. And the split is <strong>lossless</strong>: joining the two tables on order_id gives back exactly the original 15 rows.</p>
  <div class="fx" data-lang="sql">SELECT (SELECT count(*) FROM (SELECT * FROM biteful_sheet EXCEPT
          SELECT o.order_id, o.ordered_at, o.status, o.amount, o.customer, o.customer_city,
                 o.restaurant, o.restaurant_city, o.cuisine, l.item, l.qty, l.unit_price
          FROM orders_2nf o JOIN lines_2nf l USING (order_id)) x) AS missing,
       (SELECT count(*) FROM orders_2nf o JOIN lines_2nf l USING (order_id)) AS joined_rows;</div>
  <table class="tbl out"><caption>Lossless check</caption><tr><th>missing</th><th>joined_rows</th></tr><tr><td>0</td><td>15</td></tr></table>
  <div class="callout intu"><span class="label">Why unit_price stays with the line</span>
    <p>It is the price <em>paid in this order</em> (the shared schema says so), so it depends on (order, item) together. Today's menu price would be a fact about the item alone and belong in a menu table. Two different facts, two places.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>2NF</strong>: 1NF, and every non-key column depends on the <em>whole</em> of every candidate key, not on part of it. It only matters when a key has more than one column. Fix: move partially dependent columns to a table keyed by that part.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A split that is not lossless: joining the pieces produces extra (spurious) rows or misses some. It means the tables were split on a column that does not determine the moved columns. Always check with EXCEPT both ways or row counts, as above.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: 3NF.</b> orders_2nf still stores "Ben, Mumbai" on both of Ben's orders and "Biryani Bros, Mumbai, Biryani" on all three of its orders. The update anomaly from section 01 is still possible, and Gita still can't be stored.</div>

  <h2 id="sm-3nf"><span class="num">05</span>3NF: Nothing but the Key</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In orders_2nf every column depends on order_id, the whole key. So why does Ben's city still repeat, and why can't Gita exist?</p>
  </div>
  <p>Because <code>customer_city</code> depends on order_id only <em>through</em> the customer: <code>order_id → customer → customer_city</code>. The city is a fact about Ben, not about order 102; it is attached to the order by a chain. A dependency that passes through another non-key column is <strong>transitive</strong>. Same for <code>restaurant → restaurant_city, cuisine</code>. In the data:</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_2nf AS SELECT DISTINCT order_id, ordered_at, status, amount, customer, customer_city, restaurant, restaurant_city, cuisine FROM biteful_sheet;
SELECT customer, customer_city, count(*) AS copies FROM orders_2nf GROUP BY 1, 2 HAVING count(*) &gt; 1 ORDER BY 1;</div>
  <table class="tbl out"><caption>How often each customer's city is stored in orders_2nf</caption><tr><th>customer</th><th>customer_city</th><th>copies</th></tr><tr><td>Asha</td><td>Pune</td><td>3</td></tr><tr><td>Ben</td><td>Mumbai</td><td>2</td></tr><tr><td>Chen</td><td>Pune</td><td>2</td></tr></table>
  <p>Fix: move each thing's facts to its own table, and keep only a reference in orders. With made-up numeric ids (<strong>surrogate keys</strong>, because names can repeat or change) this is exactly Biteful's real schema:</p>
  <div class="fx" data-lang="sql">SELECT 'customers' AS table_name, count(*) AS rows, 'customer_id → name, city, signup_date, referred_by' AS each_row_states FROM customers
UNION ALL SELECT 'restaurants', count(*), 'restaurant_id → name, city, cuisine, rating' FROM restaurants
UNION ALL SELECT 'orders', count(*), 'order_id → customer_id, restaurant_id, ordered_at, status, amount, …' FROM orders
UNION ALL SELECT 'order_items', count(*), '(order_id, item) → qty, unit_price' FROM order_items;</div>
  <table class="tbl out"><caption>The 3NF schema: one table per thing</caption><tr><th>table_name</th><th>rows</th><th>each_row_states</th></tr><tr><td>customers</td><td>7</td><td>customer_id → name, city, signup_date, referred_by</td></tr><tr><td>restaurants</td><td>5</td><td>restaurant_id → name, city, cuisine, rating</td></tr><tr><td>orders</td><td>10</td><td>order_id → customer_id, restaurant_id, ordered_at, status, amount, …</td></tr><tr><td>order_items</td><td>15</td><td>(order_id, item) → qty, unit_price</td></tr></table>
  <p>Now replay the three anomalies on the real schema:</p>
  <div class="fx" data-lang="sql">UPDATE customers SET city = 'Pune' WHERE name = 'Ben';
SELECT name, city FROM customers WHERE name = 'Ben';
SELECT (SELECT count(*) FROM customers) AS customers, (SELECT count(*) FROM restaurants) AS restaurants;
DELETE FROM order_items WHERE order_id = 105;
DELETE FROM orders WHERE order_id = 105;
SELECT (SELECT city FROM customers WHERE name = 'Dia') AS dia_city,
       (SELECT cuisine FROM restaurants WHERE name = 'Green Bowl') AS green_bowl_cuisine;</div>
  <table class="tbl out"><caption>Ben moves: one row</caption><tr><th>name</th><th>city</th></tr><tr><td>Ben</td><td>Pune</td></tr></table>
  <table class="tbl out"><caption>Gita and Momo Magic exist with no orders</caption><tr><th>customers</th><th>restaurants</th></tr><tr><td>7</td><td>5</td></tr></table>
  <table class="tbl out"><caption>Deleting order 105 keeps Dia and Green Bowl</caption><tr><th>dia_city</th><th>green_bowl_cuisine</th></tr><tr><td>Mumbai</td><td>Healthy</td></tr></table>
  <p>All three anomalies are gone. Ben's city is one cell; Gita (7) and Momo Magic (14) are rows in their own tables; deleting an order deletes only the order.</p>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
    <defs><marker id="sm-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="10" width="200" height="200" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/>
    <text x="100" y="30" text-anchor="middle" font-weight="bold">biteful_sheet (1NF)</text>
    <g font-size="11"><text x="14" y="54" class="tb">ordered_at, status, amount</text><text x="14" y="74" class="tr">customer, customer_city</text><text x="14" y="94" class="tg">restaurant, r_city, cuisine</text><text x="14" y="114">item, qty, unit_price</text></g>
    <text x="14" y="146" font-size="10" class="tm">key = (order_id, item)</text>
    <text x="14" y="164" font-size="10" class="tm">15 rows; Ben's city ×3,</text><text x="14" y="178" font-size="10" class="tm">Biryani Bros ×5</text>
    <g stroke="currentColor"><line x1="200" y1="50" x2="268" y2="30" marker-end="url(#sm-ar)"/><line x1="200" y1="70" x2="268" y2="80" marker-end="url(#sm-ar)"/><line x1="200" y1="90" x2="268" y2="130" marker-end="url(#sm-ar)"/><line x1="200" y1="110" x2="268" y2="180" marker-end="url(#sm-ar)"/></g>
    <g font-size="11">
      <rect x="270" y="12" width="320" height="36" rx="6" class="fb sb"/><text x="280" y="34">orders (order_id PK, …, customer_id, restaurant_id) ← 2NF</text>
      <rect x="270" y="62" width="320" height="36" rx="6" class="fr sr"/><text x="280" y="84">customers (customer_id PK, name, city) ← 3NF</text>
      <rect x="270" y="112" width="320" height="36" rx="6" class="fg sg"/><text x="280" y="134">restaurants (restaurant_id PK, …, cuisine) ← 3NF</text>
      <rect x="270" y="162" width="320" height="36" rx="6" class="fv"/><text x="280" y="184">order_items (order_id, item, qty, unit_price)</text>
    </g>
  </svg><figcaption>Each colour is one dependency in the sheet; each becomes one table. This is how Biteful's four tables came to be.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school register should not write each student's home address next to every exam mark. The address is a fact about the student; the mark is a fact about (student, exam). The address goes on the student's card, once.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>3NF</strong>: 2NF, and no non-key column depends on the key through another non-key column (no transitive dependency). Memory aid: every non-key column depends on "the key (1NF), the whole key (2NF), and nothing but the key (3NF)". Most production OLTP schemas aim for 3NF.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Natural keys that change. Keying customers by <code>name</code> breaks when two customers share a name or one changes theirs: every foreign key pointing at it must change too. Use a surrogate id as the primary key and keep natural identifiers (email, phone) as UNIQUE columns.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: BCNF.</b> 3NF only speaks about <em>non-key</em> columns. A table can be in 3NF and still repeat a fact if some column decides part of a key. It is rare, but it is the next rung and a favourite interview question.</div>

  <h2 id="sm-bcnf"><span class="num">06</span>BCNF: Every Determinant Is a Key</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>All our dependencies so far pointed from a key to non-key columns. What if a non-key column determines part of the key itself? 3NF allows that. Does it cause anomalies?</p>
  </div>
  <p>Biteful assigns riders to restaurants by meal slot. Rules: each restaurant has exactly one rider per slot (lunch, dinner); each rider works only one slot. So the key is (restaurant, slot), but also <code>rider → slot</code>, and rider is not a key:</p>
  <div class="fx" data-lang="sql">CREATE TABLE rider_shifts (restaurant TEXT, slot TEXT, rider TEXT, PRIMARY KEY (restaurant, slot));
INSERT INTO rider_shifts VALUES ('Biryani Bros', 'lunch', 'Ravi'), ('Green Bowl', 'lunch', 'Ravi'),
                                ('Biryani Bros', 'dinner', 'Sara'), ('Dosa Hut', 'lunch', 'Imran');
SELECT * FROM rider_shifts ORDER BY rider, restaurant;</div>
  <table class="tbl out"><caption>rider_shifts: key (restaurant, slot)</caption><tr><th>restaurant</th><th>slot</th><th>rider</th></tr><tr><td>Dosa Hut</td><td>lunch</td><td>Imran</td></tr><tr><td>Biryani Bros</td><td>lunch</td><td>Ravi</td></tr><tr><td>Green Bowl</td><td>lunch</td><td>Ravi</td></tr><tr><td>Biryani Bros</td><td>dinner</td><td>Sara</td></tr></table>
  <p>"Ravi works lunch" is stored twice. The same update anomaly as before:</p>
  <div class="fx" data-lang="sql">UPDATE rider_shifts SET slot = 'dinner' WHERE rider = 'Ravi' AND restaurant = 'Green Bowl';
SELECT DISTINCT rider, slot FROM rider_shifts WHERE rider = 'Ravi';</div>
  <div class="fx" data-lang="text">UPDATE 1</div>
  <table class="tbl out"><caption>Which slot does Ravi work?</caption><tr><th>rider</th><th>slot</th></tr><tr><td>Ravi</td><td>dinner</td></tr><tr><td>Ravi</td><td>lunch</td></tr></table>
  <p>Ravi now works two slots, breaking the rule. The table is in 3NF (slot is part of the key, so 3NF doesn't complain), but not in BCNF. Fix: give the determinant <code>rider</code> its own table:</p>
  <div class="fx" data-lang="sql">CREATE TABLE riders_slot (rider TEXT PRIMARY KEY, slot TEXT NOT NULL);
CREATE TABLE restaurant_riders (restaurant TEXT, rider TEXT REFERENCES riders_slot, PRIMARY KEY (restaurant, rider));
INSERT INTO riders_slot VALUES ('Ravi', 'lunch'), ('Sara', 'dinner'), ('Imran', 'lunch');
INSERT INTO restaurant_riders VALUES ('Biryani Bros', 'Ravi'), ('Green Bowl', 'Ravi'), ('Biryani Bros', 'Sara'), ('Dosa Hut', 'Imran');
SELECT * FROM riders_slot ORDER BY rider;
SELECT * FROM restaurant_riders ORDER BY restaurant, rider;</div>
  <table class="tbl out"><caption>riders_slot</caption><tr><th>rider</th><th>slot</th></tr><tr><td>Imran</td><td>lunch</td></tr><tr><td>Ravi</td><td>lunch</td></tr><tr><td>Sara</td><td>dinner</td></tr></table>
  <table class="tbl out"><caption>restaurant_riders</caption><tr><th>restaurant</th><th>rider</th></tr><tr><td>Biryani Bros</td><td>Ravi</td></tr><tr><td>Biryani Bros</td><td>Sara</td></tr><tr><td>Dosa Hut</td><td>Imran</td></tr><tr><td>Green Bowl</td><td>Ravi</td></tr></table>
  <p>"Ravi works lunch" is now one row. The price: the old rule "one rider per restaurant per slot" was the old primary key and can no longer be a simple constraint, because restaurant and slot now live in different tables (it needs a trigger or a check in the app). That trade-off is why many designers stop at 3NF when BCNF would lose a constraint.</p>
  <p>Beyond BCNF: <strong>4NF</strong> forbids storing two independent lists in one table (a restaurant's 2 cuisines and 3 delivery zones in one table need 2 × 3 = 6 rows). <strong>5NF</strong> deals with tables that only split losslessly into three or more pieces. Both are rare in practice.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>determinant</strong> is the left side of a dependency (A in A → B). <strong>BCNF</strong> (Boyce–Codd normal form): for every non-trivial dependency A → B, A is a candidate key. 3NF and BCNF differ only when candidate keys overlap or a non-key column determines part of a key.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Normalising past the point of usefulness. Each split adds a join to every read and can move a rule out of the reach of constraints. Aim for 3NF/BCNF in the source of truth; go further only when a real anomaly appears.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: denormalisation.</b> Every fact is now stored once. But Biteful's busiest screen, "restaurant revenue today", joins orders, order_items and restaurants on every page load. Is it ever right to copy data back on purpose?</div>

  <h2 id="sm-denorm"><span class="num">07</span>Denormalisation: When, and Its Cost</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The normalised schema stores each fact once, so every screen that shows facts together needs joins and sums, on every page load, for every user. When reads vastly outnumber writes, is it ever right to store something twice?</p>
  </div>
  <p>Yes, on purpose and with open eyes. <strong>Denormalisation</strong> is deliberately storing a fact twice, or storing a precomputed result, to make reads faster or simpler. Biteful already does it: <code>orders.amount</code> is the bill total, which could always be computed from the order's lines. The shared schema keeps it because "show my orders with totals" is the most common read. Is it still correct?</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.amount, sum(oi.qty * oi.unit_price) AS from_lines
FROM orders o JOIN order_items oi USING (order_id)
GROUP BY o.order_id, o.amount
HAVING o.amount &lt;&gt; sum(oi.qty * oi.unit_price);</div>
  <table class="tbl out"><caption>Orders whose stored amount differs from their lines</caption><tr><th>order_id</th><th>amount</th><th>from_lines</th></tr></table>
  <p>No rows: all 10 totals agree today. Now the cost. Asha phones support to change order 110's Filter Coffee from 1 cup to 3. The agent updates the line, but nobody updates the total:</p>
  <div class="fx" data-lang="sql">UPDATE order_items SET qty = 3 WHERE order_id = 110 AND item = 'Filter Coffee';
SELECT o.order_id, o.amount, sum(oi.qty * oi.unit_price) AS from_lines
FROM orders o JOIN order_items oi USING (order_id)
GROUP BY o.order_id, o.amount
HAVING o.amount &lt;&gt; sum(oi.qty * oi.unit_price);</div>
  <div class="fx" data-lang="text">UPDATE 1</div>
  <table class="tbl out"><caption>The copy has drifted</caption><tr><th>order_id</th><th>amount</th><th>from_lines</th></tr><tr><td>110</td><td>310.00</td><td>450.00</td></tr></table>
  <p>The update anomaly is back, by design: the stored ₹310 says one thing, the lines (₹450) another. Every write path must now keep both in step (a trigger, the same transaction, or a nightly check).</p>
  <h3>A materialised view: a whole query result, stored</h3>
  <p>The owners' dashboard shows revenue per restaurant from delivered orders. A <strong>materialised view</strong> stores the answer as a real table, so the dashboard reads 3 rows instead of joining and summing:</p>
  <div class="fx" data-lang="sql">CREATE MATERIALIZED VIEW restaurant_revenue AS
SELECT r.name, sum(o.amount) AS revenue, count(*) AS orders
FROM restaurants r JOIN orders o ON o.restaurant_id = r.restaurant_id
WHERE o.status = 'delivered'
GROUP BY r.name;
SELECT * FROM restaurant_revenue ORDER BY revenue DESC;</div>
  <table class="tbl out"><caption>restaurant_revenue</caption><tr><th>name</th><th>revenue</th><th>orders</th></tr><tr><td>Biryani Bros</td><td>1230.00</td><td>3</td></tr><tr><td>Pizza Point</td><td>900.00</td><td>2</td></tr><tr><td>Dosa Hut</td><td>500.00</td><td>2</td></tr></table>
  <p>Trace one row by hand: Biryani Bros has delivered orders 102 (450), 106 (180) and 109 (600) = 1,230 over 3 orders. Now a new delivered order arrives:</p>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES (111, 7, 11, '2026-03-09 13:00+05:30', 'delivered', 350, 30);
SELECT * FROM restaurant_revenue WHERE name = 'Biryani Bros';
REFRESH MATERIALIZED VIEW restaurant_revenue;
SELECT * FROM restaurant_revenue WHERE name = 'Biryani Bros';</div>
  <table class="tbl out"><caption>After a new ₹350 order (stale)</caption><tr><th>name</th><th>revenue</th><th>orders</th></tr><tr><td>Biryani Bros</td><td>1230.00</td><td>3</td></tr></table>
  <table class="tbl out"><caption>After REFRESH</caption><tr><th>name</th><th>revenue</th><th>orders</th></tr><tr><td>Biryani Bros</td><td>1580.00</td><td>4</td></tr></table>
  <p>Until someone runs REFRESH, the dashboard is stale (1,230 / 3 instead of 1,580 / 4). That is the trade: fast reads for possibly old answers. (A plain <code>VIEW</code> stores only the query and re-runs it each time: never stale, never faster.)</p>
  <ul>
    <li><strong>When</strong>: read-heavy screens and dashboards, expensive aggregates, warehouses, caches.</li>
    <li><strong>Common forms</strong>: a stored total (<code>orders.amount</code>), a copied column (<code>orders.customer_city</code>), a materialised view or summary table, a wide "one big table" for BI tools.</li>
    <li><strong>Cost</strong>: every copy must be kept in sync, or it drifts (shown twice above).</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>"Today's sales" written on a whiteboard. Instant to read, but someone must update it after every sale, or it lies.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Denormalisation</strong>: intentionally introducing redundancy (copied columns, stored aggregates, materialised views) to speed up reads, accepting the cost of keeping copies consistent. Rule of thumb: <strong>normalise the source of truth; denormalise the copies built from it.</strong></p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Denormalising first and "fixing it later". Start normalised, measure (EXPLAIN ANALYZE, <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>), and copy only where a real read is too slow, with a clear owner for keeping the copy correct.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: OLTP vs OLAP.</b> Copies are risky in the app, where data changes every second. But analysts read years of history that almost never changes. Their workload is so different that it gets its own database and its own table shapes.</div>

  <h2 id="sm-olap"><span class="num">08</span>OLTP vs OLAP</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The app asks "Asha's orders" and "take one samosa", thousands of times a second. An analyst asks "revenue by cuisine by month for three years". Should both questions hit the same tables, in the same shape?</p>
  </div>
  <p>Compare the two kinds of query on the same 3NF Biteful tables:</p>
  <div class="fx" data-lang="sql">SELECT order_id, status, amount FROM orders WHERE customer_id = 1 ORDER BY ordered_at DESC;
SELECT r.cuisine, o.ordered_at::date AS day, sum(oi.qty * oi.unit_price) AS revenue
FROM orders o JOIN restaurants r USING (restaurant_id) JOIN order_items oi USING (order_id)
WHERE o.status = 'delivered'
GROUP BY 1, 2 ORDER BY 2, 1;</div>
  <table class="tbl out"><caption>OLTP: one customer's recent orders (touches a few rows)</caption><tr><th>order_id</th><th>status</th><th>amount</th></tr><tr><td>110</td><td>pending</td><td>310.00</td></tr><tr><td>104</td><td>delivered</td><td>380.00</td></tr><tr><td>101</td><td>delivered</td><td>240.00</td></tr></table>
  <table class="tbl out"><caption>OLAP: revenue by cuisine and day (touches everything, 3 tables)</caption><tr><th>cuisine</th><th>day</th><th>revenue</th></tr><tr><td>Biryani</td><td>2026-03-02</td><td>450.00</td></tr><tr><td>Pizza</td><td>2026-03-02</td><td>520.00</td></tr><tr><td>South Indian</td><td>2026-03-02</td><td>240.00</td></tr><tr><td>Pizza</td><td>2026-03-03</td><td>380.00</td></tr><tr><td>Biryani</td><td>2026-03-04</td><td>180.00</td></tr><tr><td>Biryani</td><td>2026-03-05</td><td>600.00</td></tr><tr><td>South Indian</td><td>2026-03-05</td><td>260.00</td></tr></table>
  <table class="tbl">
    <tr><th></th><th>OLTP (online transaction processing)</th><th>OLAP (online analytical processing)</th></tr>
    <tr><td>Who</td><td>The app, many users</td><td>Analysts, dashboards, ML pipelines</td></tr>
    <tr><td>Typical query</td><td>Read or write a few rows by key</td><td>Scan and aggregate millions of rows</td></tr>
    <tr><td>Data</td><td>Current state; constant small writes</td><td>History; loaded in batches</td></tr>
    <tr><td>Shape</td><td>Normalised (3NF): safe writes</td><td>Denormalised star schema: simple, fast reads</td></tr>
    <tr><td>Storage</td><td>Row store (PostgreSQL, MySQL)</td><td>Column store (BigQuery, Snowflake, Redshift, DuckDB)</td></tr>
  </table>
  <p>So companies keep the app database (OLTP) as the source of truth and copy its data, usually nightly or continuously, into a <strong>data warehouse</strong> (OLAP), reshaped for analysis. The column store reason is shown in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> section 12; the overview is in <a class="xref" data-note="db_intro">What Is a Database</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop's till (OLTP) records each sale instantly and must never double-charge. The accountant's ledger (OLAP) is copied from the till receipts at night and is organised for questions like "which month was best?".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>OLTP</strong>: many small, concurrent reads and writes of current data; normalised; correctness first. <strong>OLAP</strong>: few large read queries over historical data; denormalised; scan speed and simplicity first. The process that copies and reshapes data from one to the other is called <strong>ETL/ELT</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running heavy analytics on the production OLTP database. A three-year scan competes with checkout for the same disks, cache and locks. Use a replica or a warehouse.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: star vs snowflake.</b> "Reshaped for analysis" into what, exactly? The analyst's query above already needed three tables and knowledge of which joins fan out. The warehouse needs a standard shape every analyst can learn once.</div>

  <h2 id="sm-star"><span class="num">09</span>Star vs Snowflake Schema</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What table layout makes "revenue by any attribute, over any period" a simple, predictable query?</p>
  </div>
  <p>A <strong>star schema</strong> has one tall table of events in the middle (the <strong>fact table</strong>: numbers to add up plus keys) and small, wide lookup tables around it (the <strong>dimensions</strong>: who, what, where, when to filter and group by). Biteful's warehouse:</p>
  <figure class="viz"><svg viewBox="0 0 600 230" width="600">
    <g stroke="currentColor" opacity=".6"><line x1="95" y1="64" x2="170" y2="96"/><line x1="505" y1="64" x2="430" y2="96"/><line x1="300" y1="156" x2="300" y2="166"/></g>
    <rect x="170" y="70" width="260" height="86" rx="8" class="fb sb"/>
    <text x="300" y="90" text-anchor="middle" font-weight="bold">fact_order_lines</text>
    <g font-size="10" text-anchor="middle"><text x="300" y="106" class="tm">date_key, customer_key, restaurant_key</text><text x="300" y="122">qty · line_revenue  (measures)</text><text x="300" y="138" class="tm">order_id · item · status (degenerate)</text></g>
    <text x="300" y="150" text-anchor="middle" font-size="9" class="tm">grain: one order line (15 rows)</text>
    <rect x="10" y="12" width="170" height="52" rx="8" class="ft st"/><text x="95" y="32" text-anchor="middle" font-weight="bold">dim_date</text><text x="95" y="50" text-anchor="middle" font-size="10" class="tm">date, weekday, is_weekend</text>
    <rect x="420" y="12" width="170" height="52" rx="8" class="ft st"/><text x="505" y="32" text-anchor="middle" font-weight="bold">dim_customer</text><text x="505" y="50" text-anchor="middle" font-size="10" class="tm">name, city</text>
    <rect x="215" y="166" width="170" height="48" rx="8" class="ft st"/><text x="300" y="186" text-anchor="middle" font-weight="bold">dim_restaurant</text><text x="300" y="203" text-anchor="middle" font-size="10" class="tm">name, city, cuisine</text>
    <rect x="430" y="166" width="160" height="48" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 3" opacity=".6"/><text x="510" y="186" text-anchor="middle" font-size="11">dim_cuisine</text><text x="510" y="203" text-anchor="middle" font-size="10" class="tm">snowflake only</text>
    <line x1="385" y1="190" x2="428" y2="190" stroke="currentColor" stroke-dasharray="4 3" opacity=".6"/>
  </svg><figcaption>Tall fact in the middle, short wide dimensions around it. Every query: fact → join dimensions → filter → group.</figcaption></figure>
  <div class="fx" data-lang="sql">CREATE TABLE dim_date AS
SELECT to_char(d, 'YYYYMMDD')::int AS date_key, d::date AS full_date,
       to_char(d, 'Dy') AS weekday, extract(isodow FROM d) IN (6, 7) AS is_weekend
FROM generate_series(date '2026-03-01', date '2026-03-31', interval '1 day') d;
CREATE TABLE dim_customer AS
SELECT customer_id AS customer_key, name, coalesce(city, 'Unknown') AS city FROM customers;
CREATE TABLE dim_restaurant AS
SELECT restaurant_id AS restaurant_key, name, city, cuisine FROM restaurants;
CREATE TABLE fact_order_lines AS
SELECT to_char(o.ordered_at, 'YYYYMMDD')::int AS date_key, o.customer_id AS customer_key,
       o.restaurant_id AS restaurant_key, o.order_id, oi.item, o.status,
       oi.qty, oi.qty * oi.unit_price AS line_revenue
FROM orders o JOIN order_items oi USING (order_id);
SELECT * FROM fact_order_lines ORDER BY order_id, item LIMIT 5;</div>
  <table class="tbl out"><caption>fact_order_lines (first 5 of 15 rows)</caption><tr><th>date_key</th><th>customer_key</th><th>restaurant_key</th><th>order_id</th><th>item</th><th>status</th><th>qty</th><th>line_revenue</th></tr><tr><td>20260302</td><td>1</td><td>10</td><td>101</td><td>Masala Dosa</td><td>delivered</td><td>2</td><td>240.00</td></tr><tr><td>20260302</td><td>2</td><td>11</td><td>102</td><td>Chicken Biryani</td><td>delivered</td><td>1</td><td>350.00</td></tr><tr><td>20260302</td><td>2</td><td>11</td><td>102</td><td>Raita</td><td>delivered</td><td>2</td><td>100.00</td></tr><tr><td>20260302</td><td>3</td><td>12</td><td>103</td><td>Farmhouse Pizza</td><td>delivered</td><td>2</td><td>520.00</td></tr><tr><td>20260303</td><td>1</td><td>12</td><td>104</td><td>Garlic Bread</td><td>delivered</td><td>1</td><td>100.00</td></tr></table>
  <p>A typical warehouse question, "delivered revenue by cuisine, weekday vs weekend":</p>
  <div class="fx" data-lang="sql">SELECT r.cuisine, d.is_weekend, sum(f.line_revenue) AS revenue
FROM fact_order_lines f
JOIN dim_restaurant r USING (restaurant_key)
JOIN dim_date d       USING (date_key)
WHERE f.status = 'delivered'
GROUP BY 1, 2 ORDER BY 1, 2;</div>
  <table class="tbl out"><caption>Star: fact + 2 dimensions</caption><tr><th>cuisine</th><th>is_weekend</th><th>revenue</th></tr><tr><td>Biryani</td><td>f</td><td>1230.00</td></tr><tr><td>Pizza</td><td>f</td><td>900.00</td></tr><tr><td>South Indian</td><td>f</td><td>500.00</td></tr></table>
  <p>Trace the Biryani row: delivered Biryani lines are 102 (350 + 100), 106 (180) and 109 (350 + 250) = 1,230, all on weekdays (2, 4, 5 March 2026 are Monday, Wednesday, Thursday). No delivered order fell on a weekend (order 110 on Sunday 8 March is still pending), so every <code>is_weekend</code> is false. Every warehouse query has this one shape, so analysts learn it once.</p>
  <h3>Snowflake: normalise the dimensions</h3>
  <p>A <strong>snowflake schema</strong> normalises dimensions further: cuisine moves out of dim_restaurant into its own table. Same question, one more join, same answer:</p>
  <div class="fx" data-lang="sql">CREATE TABLE dim_cuisine AS SELECT row_number() OVER (ORDER BY cuisine) AS cuisine_key, cuisine FROM (SELECT DISTINCT cuisine FROM restaurants) c;
CREATE TABLE dim_restaurant_sf AS SELECT r.restaurant_id AS restaurant_key, r.name, r.city, c.cuisine_key FROM restaurants r JOIN dim_cuisine c USING (cuisine);
SELECT c.cuisine, d.is_weekend, sum(f.line_revenue) AS revenue
FROM fact_order_lines f
JOIN dim_restaurant_sf r USING (restaurant_key)
JOIN dim_cuisine c       USING (cuisine_key)
JOIN dim_date d          USING (date_key)
WHERE f.status = 'delivered'
GROUP BY 1, 2 ORDER BY 1, 2;</div>
  <table class="tbl out"><caption>Snowflake: fact → restaurant → cuisine</caption><tr><th>cuisine</th><th>is_weekend</th><th>revenue</th></tr><tr><td>Biryani</td><td>f</td><td>1230.00</td></tr><tr><td>Pizza</td><td>f</td><td>900.00</td></tr><tr><td>South Indian</td><td>f</td><td>500.00</td></tr></table>
  <table class="tbl">
    <tr><th></th><th>Star</th><th>Snowflake</th></tr>
    <tr><td>Dimensions</td><td>Denormalised (cuisine repeated per restaurant)</td><td>Normalised (cuisine in its own table)</td></tr>
    <tr><td>Joins per query</td><td>Fewer</td><td>More</td></tr>
    <tr><td>Storage</td><td>A little more</td><td>A little less</td></tr>
    <tr><td>Usual choice</td><td>Yes: column stores compress repeated values, so repetition is nearly free</td><td>When a dimension is huge or shared</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A till roll (fact table: one line per item sold) and the lookup books next to it: the product catalogue, the customer list, the calendar (dimensions).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Star schema</strong>: one fact table with foreign keys to denormalised dimension tables. <strong>Snowflake schema</strong>: the same, with dimensions normalised into sub-dimensions. Dimensions usually use <strong>surrogate keys</strong> (<code>customer_key</code>) owned by the warehouse.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating the warehouse star like an OLTP schema and normalising everything "properly". That brings back the joins the warehouse exists to avoid. The source of truth is already normalised upstream.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: facts and dimensions.</b> We built a fact table "at the line level", without asking what that commits us to. Which numbers may go in it, and what happens if a number from a different level sneaks in?</div>

  <h2 id="sm-facts"><span class="num">10</span>Facts, Dimensions and Grain</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The fact table has one row per order line. The bill <code>amount</code> is per order. If an analyst adds amount to the line-level fact "for convenience", what does <code>SUM(amount)</code> return?</p>
  </div>
  <p>The <strong>grain</strong> is the exact meaning of one fact row. Ours: "one item line in one order". Every measure in the table must be true at that grain. Watch what an order-level number does on line-level rows (the same fan-out as <a class="xref" data-note="sql_joins">JOINs</a> section 08):</p>
  <div class="fx" data-lang="sql">SELECT (SELECT sum(amount) FROM orders) AS sum_at_order_grain,
       (SELECT sum(o.amount) FROM orders o JOIN order_items oi USING (order_id)) AS amount_summed_per_line,
       (SELECT sum(qty * unit_price) FROM order_items) AS line_revenue_at_line_grain;</div>
  <table class="tbl out"><caption>Total billed: right grain vs wrong grain</caption><tr><th>sum_at_order_grain</th><th>amount_summed_per_line</th><th>line_revenue_at_line_grain</th></tr><tr><td>3510.00</td><td>5510.00</td><td>3510.00</td></tr></table>
  <p>Trace it: the five two-line orders (102, 104, 108, 109, 110) have their amounts counted twice: 3,510 + 450 + 380 + 260 + 600 + 310 = 5,510. The line-level measure <code>qty × unit_price</code> sums correctly to 3,510 because it <em>is</em> at the line grain. Different grain → a different fact table (e.g. <code>fact_orders</code>, one row per order, for delivery fees and bills).</p>
  <h3>Which measures can be added up?</h3>
  <ul>
    <li><strong>Additive</strong>: can be summed across every dimension. <code>qty</code>, <code>line_revenue</code>.</li>
    <li><strong>Semi-additive</strong>: can be summed across some dimensions but not time. A wallet balance snapshot: summing Ben's and Farah's balances on one day is meaningful; summing Ben's balance across days is not.</li>
    <li><strong>Non-additive</strong>: ratios and averages. Average order value must be recomputed from additive parts (sum ÷ count), never averaged again.</li>
  </ul>
  <div class="fx" data-lang="sql">CREATE TABLE fact_wallet_daily (day date, customer TEXT, balance NUMERIC);
INSERT INTO fact_wallet_daily VALUES ('2026-03-01', 'Ben', 500), ('2026-03-01', 'Farah', 300),
                                     ('2026-03-02', 'Ben', 500), ('2026-03-02', 'Farah', 300);
SELECT * FROM fact_wallet_daily ORDER BY day, customer;
SELECT day, sum(balance) AS money_held FROM fact_wallet_daily GROUP BY day ORDER BY day;
SELECT customer, sum(balance) AS nonsense, avg(balance) AS avg_daily_balance FROM fact_wallet_daily GROUP BY customer ORDER BY customer;</div>
  <table class="tbl out"><caption>A daily wallet snapshot fact (semi-additive)</caption><tr><th>day</th><th>customer</th><th>balance</th></tr><tr><td>2026-03-01</td><td>Ben</td><td>500</td></tr><tr><td>2026-03-01</td><td>Farah</td><td>300</td></tr><tr><td>2026-03-02</td><td>Ben</td><td>500</td></tr><tr><td>2026-03-02</td><td>Farah</td><td>300</td></tr></table>
  <table class="tbl out"><caption>Sum across customers per day: OK</caption><tr><th>day</th><th>money_held</th></tr><tr><td>2026-03-01</td><td>800</td></tr><tr><td>2026-03-02</td><td>800</td></tr></table>
  <table class="tbl out"><caption>Sum across days: meaningless</caption><tr><th>customer</th><th>nonsense</th><th>avg_daily_balance</th></tr><tr><td>Ben</td><td>1000</td><td>500.0000000000000000</td></tr><tr><td>Farah</td><td>600</td><td>300.0000000000000000</td></tr></table>
  <p>Ben never had ₹1,000; he had ₹500 on each of two days. Across time, use the average or the last value.</p>
  <ul>
    <li><code>order_id</code>, <code>item</code> and <code>status</code> sit in the fact with no dimension table of their own: <strong>degenerate dimensions</strong>.</li>
    <li>A dimension used twice in different roles (pickup and drop-off location; order date and delivery date) is a <strong>role-playing dimension</strong>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A receipt has a line per item and one total at the bottom. Copying the total onto every line and then adding up the lines charges the customer several times.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Fact</strong>: a measurable event at a declared <strong>grain</strong>, holding measures and dimension keys. <strong>Dimension</strong>: descriptive context (who, what, where, when). Design order: choose the business process → declare the grain → choose dimensions → choose measures that are true at that grain.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing grains in one fact table (order-level amount or delivery fee on line rows) silently inflates every sum: 5,510 instead of 3,510.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: slowly changing dimensions.</b> Dimensions describe the world, and the world changes: Ben moves from Mumbai to Pune. His old orders were placed from Mumbai. If dim_customer just changes his city, which city do last week's orders count under?</div>

  <h2 id="sm-scd"><span class="num">11</span>Slowly Changing Dimensions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ben lived in Mumbai when he ordered on 2 March (order 102, ₹450) and moved to Pune on 3 March before ordering again on 4 March (order 106, ₹180). "Revenue by customer city" must say where each sale happened. How should dim_customer change?</p>
  </div>
  <p>A dimension whose attributes change now and then is a <strong>slowly changing dimension</strong> (SCD). The standard answers are numbered types.</p>
  <h3>Type 1: overwrite</h3>
  <div class="fx" data-lang="sql">CREATE TABLE dim_customer AS SELECT customer_id AS customer_key, name, coalesce(city, 'Unknown') AS city FROM customers;
UPDATE dim_customer SET city = 'Pune' WHERE name = 'Ben';
SELECT d.city, sum(o.amount) AS revenue, string_agg(o.order_id::text, ', ' ORDER BY o.order_id) AS orders
FROM orders o JOIN dim_customer d ON d.customer_key = o.customer_id
WHERE o.status = 'delivered' GROUP BY d.city ORDER BY d.city;</div>
  <table class="tbl out"><caption>Revenue by customer city after a Type 1 overwrite</caption><tr><th>city</th><th>revenue</th><th>orders</th></tr><tr><td>Mumbai</td><td>600.00</td><td>109</td></tr><tr><td>Pune</td><td>2030.00</td><td>101, 102, 103, 104, 106, 108</td></tr></table>
  <p>Orders 102 and 106 both count for Pune. Last week's Mumbai report has silently changed: ₹450 moved to a city Ben didn't live in yet. Type 1 is right for <em>corrections</em> (a typo in a name), wrong when history matters.</p>
  <h3>Type 2: add a new version row</h3>
  <p>Never overwrite. Close the current row with an end date and insert a new row for the new value; each version gets its own surrogate key and validity dates.</p>
  <div class="fx" data-lang="sql">CREATE TABLE dim_customer_scd (
  customer_key SERIAL PRIMARY KEY,         -- one per version
  customer_id INT, name TEXT, city TEXT,
  valid_from DATE, valid_to DATE, is_current BOOLEAN);
INSERT INTO dim_customer_scd (customer_id, name, city, valid_from, valid_to, is_current)
SELECT customer_id, name, coalesce(city, 'Unknown'), signup_date, '9999-12-31', true FROM customers ORDER BY customer_id;
UPDATE dim_customer_scd SET valid_to = '2026-03-02', is_current = false WHERE customer_id = 2 AND is_current;
INSERT INTO dim_customer_scd (customer_id, name, city, valid_from, valid_to, is_current)
VALUES (2, 'Ben', 'Pune', '2026-03-03', '9999-12-31', true);
SELECT * FROM dim_customer_scd WHERE customer_id = 2 ORDER BY customer_key;</div>
  <table class="tbl out"><caption>Ben's versions</caption><tr><th>customer_key</th><th>customer_id</th><th>name</th><th>city</th><th>valid_from</th><th>valid_to</th><th>is_current</th></tr><tr><td>2</td><td>2</td><td>Ben</td><td>Mumbai</td><td>2026-01-12</td><td>2026-03-02</td><td>f</td></tr><tr><td>8</td><td>2</td><td>Ben</td><td>Pune</td><td>2026-03-03</td><td>9999-12-31</td><td>t</td></tr></table>
  <p>Key 2 is Ben-in-Mumbai, valid from signup to 2 March; key 8 is Ben-in-Pune from 3 March "forever" (9999-12-31 is the usual "no end yet"). Each order joins to the version valid on its date:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.ordered_at::date AS day, d.customer_key, d.city
FROM orders o JOIN dim_customer_scd d
  ON d.customer_id = o.customer_id AND o.ordered_at::date BETWEEN d.valid_from AND d.valid_to
WHERE o.customer_id = 2 ORDER BY o.order_id;
SELECT d.city, sum(o.amount) AS revenue, string_agg(o.order_id::text, ', ' ORDER BY o.order_id) AS orders
FROM orders o JOIN dim_customer_scd d
  ON d.customer_id = o.customer_id AND o.ordered_at::date BETWEEN d.valid_from AND d.valid_to
WHERE o.status = 'delivered' GROUP BY d.city ORDER BY d.city;</div>
  <table class="tbl out"><caption>Each of Ben's orders meets the right version</caption><tr><th>order_id</th><th>day</th><th>customer_key</th><th>city</th></tr><tr><td>102</td><td>2026-03-02</td><td>2</td><td>Mumbai</td></tr><tr><td>106</td><td>2026-03-04</td><td>8</td><td>Pune</td></tr></table>
  <table class="tbl out"><caption>Revenue by customer city with Type 2</caption><tr><th>city</th><th>revenue</th><th>orders</th></tr><tr><td>Mumbai</td><td>1050.00</td><td>102, 109</td></tr><tr><td>Pune</td><td>1580.00</td><td>101, 103, 104, 106, 108</td></tr></table>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <rect x="20" y="44" width="300" height="32" class="fb sb"/><text x="170" y="65" text-anchor="middle">key 2 · Ben · Mumbai · is_current f</text>
    <rect x="322" y="44" width="268" height="32" class="fg sg"/><text x="456" y="65" text-anchor="middle">key 8 · Ben · Pune · is_current t</text>
    <g font-size="10" class="tm"><text x="20" y="96">2026-01-12</text><text x="320" y="96" text-anchor="end">03-02</text><text x="324" y="96">03-03</text><text x="590" y="96" text-anchor="end">9999-12-31</text></g>
    <circle cx="300" cy="28" r="5" class="tb"/><text x="292" y="18" text-anchor="end" font-size="11">order 102 (03-02) → Mumbai</text>
    <circle cx="350" cy="28" r="5" class="tg"/><text x="358" y="18" font-size="11">order 106 (03-04) → Pune</text>
    <line x1="300" y1="33" x2="300" y2="44" stroke="currentColor"/><line x1="350" y1="33" x2="350" y2="44" stroke="currentColor"/>
  </svg><figcaption>SCD Type 2: Ben's two versions tile the timeline; each order lands in the version valid on its date.</figcaption></figure>
  <p>Now 102 (₹450) stays in Mumbai and 106 (₹180) counts for Pune. Usually the load job stores the right <code>customer_key</code> in the fact row at load time, so reports join on the key alone.</p>
  <table class="tbl">
    <tr><th>Type</th><th>What you do</th><th>History kept</th><th>Use when</th></tr>
    <tr><td><strong>1</strong></td><td>Overwrite</td><td>None</td><td>Corrections; history irrelevant</td></tr>
    <tr><td><strong>2</strong></td><td>Close old row, insert new version with valid_from / valid_to / is_current</td><td>Full</td><td>Reports must reflect the value at the time</td></tr>
    <tr><td><strong>3</strong></td><td>Add a <code>previous_city</code> column</td><td>One step back</td><td>Only "before vs after" comparisons</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Type 1 is correcting a passport with white-out. Type 2 is issuing a new passport and keeping the old one, stamped "valid until".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Slowly changing dimension</strong>: a dimension whose attributes change occasionally. <strong>Type 2</strong> keeps one row per version with a surrogate key and a validity interval; facts reference the version current at the event time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Joining a Type 2 dimension on the natural id alone matches <em>every</em> version and duplicates facts:</p>
  </div>
  <div class="fx" data-lang="sql">SELECT count(*) AS joined_rows FROM orders o JOIN dim_customer_scd d ON d.customer_id = o.customer_id WHERE o.customer_id = 2;</div>
  <table class="tbl out"><caption>Ben's 2 orders × 2 versions</caption><tr><th>joined_rows</th></tr><tr><td>4</td></tr></table>
  <p>Join on the date range (as above), on the stored version key, or on <code>is_current</code> for "as of now".</p>
  <div class="bridge"><b>What this still can't tell us → next: JSONB vs columns.</b> Normal forms and stars assume every row has the same columns. Restaurants don't: Dosa Hut is veg-only with 20 seats, Biryani Bros is halal with no seating. Does every such attribute need a column?</div>

  <h2 id="sm-json"><span class="num">12</span>JSONB vs Columns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Restaurant attributes vary by type: seats, veg-only, halal, rooftop, live music. Fifty mostly-empty columns? A separate attributes table and a join on every menu page? Is there a middle path?</p>
  </div>
  <p>PostgreSQL's <strong>JSONB</strong> column type stores a JSON document (<code>{"key": value}</code>) in a binary form. Each row can hold different keys; <code>-&gt;&gt;</code> extracts a key as text and <code>@&gt;</code> tests "contains":</p>
  <div class="fx" data-lang="sql">ALTER TABLE restaurants ADD COLUMN attrs JSONB;
UPDATE restaurants SET attrs = '{"veg_only": true, "seats": 20}' WHERE name = 'Dosa Hut';
UPDATE restaurants SET attrs = '{"halal": true}' WHERE name = 'Biryani Bros';
UPDATE restaurants SET attrs = '{"vegan_options": true, "seats": 8}' WHERE name = 'Green Bowl';
SELECT name, attrs -&gt;&gt; 'seats' AS seats, attrs -&gt;&gt; 'halal' AS halal FROM restaurants WHERE attrs IS NOT NULL ORDER BY name;
SELECT name FROM restaurants WHERE attrs @&gt; '{"veg_only": true}';</div>
  <table class="tbl out"><caption>Different keys per row</caption><tr><th>name</th><th>seats</th><th>halal</th></tr><tr><td>Biryani Bros</td><td>NULL</td><td>true</td></tr><tr><td>Dosa Hut</td><td>20</td><td>NULL</td></tr><tr><td>Green Bowl</td><td>8</td><td>NULL</td></tr></table>
  <table class="tbl out"><caption>Who is veg-only?</caption><tr><th>name</th></tr><tr><td>Dosa Hut</td></tr></table>
  <table class="tbl">
    <tr><th>Use a JSONB column for</th><th>Use proper columns for</th></tr>
    <tr><td>Sparse, varying attributes (seats, halal, rooftop)</td><td>Anything you filter, join or group on often (city, cuisine)</td></tr>
    <tr><td>Raw event or API payloads stored as received</td><td>Fields that need types, NOT NULL, FK, CHECK (rating BETWEEN 1 AND 5)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A form with fixed boxes for name and city, plus a "notes" box for anything else. Fine for extras; terrible if the important fields end up in the notes.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>JSONB</strong>: a semi-structured column type; flexible per row, indexable with GIN for <code>@&gt;</code> containment. It trades the schema's guarantees (types, constraints, FKs) for flexibility.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>JSONB as an escape from design. The schema still exists, hidden in app code and unchecked: <code>"20"</code> vs <code>20</code> vs <code>"20 seats"</code>. Promote a key to a real column once you query it regularly. (Document databases make this their default; see <a class="xref" data-note="mongo_design">MongoDB Schema Design</a>.)</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: practical conventions.</b> The theory decides <em>which</em> tables exist. Real teams also agree on how keys, names, timestamps and deletions look, because each habit prevents a bug someone already had.</div>

  <h2 id="sm-conv"><span class="num">13</span>Practical Conventions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two correct 3NF designs can still differ in a hundred small choices. Which conventions do reviewers expect, and why?</p>
  </div>
  <ul>
    <li><strong>Naming</strong>: <code>snake_case</code>; one style for table names; FK named after its target (<code>customer_id</code>); booleans as <code>is_</code>/<code>has_</code>; avoid reserved words (<code>user</code>, <code>order</code>).</li>
    <li><strong>Surrogate keys</strong>: an id with no business meaning (<code>bigint GENERATED ALWAYS AS IDENTITY</code>, or UUID for distributed systems). Keep natural keys (email, phone) as UNIQUE.</li>
    <li><strong>Audit timestamps</strong>: <code>created_at</code>, <code>updated_at</code> as <code>timestamptz</code> with defaults.</li>
    <li><strong>Soft delete</strong>: <code>deleted_at timestamptz</code> instead of DELETE, so history stays and undo is possible.</li>
  </ul>
  <p>All four in one table, Biteful restaurant reviews, with a partial unique index so each customer has at most one <em>live</em> review per restaurant:</p>
  <div class="fx" data-lang="sql">CREATE TABLE reviews (
  review_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id   INT NOT NULL REFERENCES customers,
  restaurant_id INT NOT NULL REFERENCES restaurants,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ                          -- NULL = live
);
CREATE UNIQUE INDEX reviews_one_live ON reviews (customer_id, restaurant_id) WHERE deleted_at IS NULL;
INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (1, 10, 5);
INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (1, 10, 4);
UPDATE reviews SET deleted_at = now() WHERE customer_id = 1 AND restaurant_id = 10;
INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (1, 10, 4);
SELECT review_id, rating, deleted_at IS NULL AS live FROM reviews ORDER BY review_id;</div>
  <div class="fx" data-lang="text">INSERT 0 1</div>
  <div class="fx" data-lang="text">ERROR:  duplicate key value violates unique constraint "reviews_one_live"
DETAIL:  Key (customer_id, restaurant_id)=(1, 10) already exists.</div>
  <div class="fx" data-lang="text">UPDATE 1</div>
  <div class="fx" data-lang="text">INSERT 0 1</div>
  <table class="tbl out"><caption>Live reviews</caption><tr><th>review_id</th><th>rating</th><th>live</th></tr><tr><td>1</td><td>5</td><td>f</td></tr><tr><td>3</td><td>4</td><td>t</td></tr></table>
  <p>Asha's second live review was refused (unique index); after soft-deleting the first, a new one was allowed, and the old one is still there for history. (Review id 2 was used up by the refused insert: identity values are never reused, so gaps in ids are normal.)</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Soft delete is the Recycle Bin: the file looks gone but can be restored, until someone empties the bin.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Surrogate key</strong>: a meaningless generated identifier used as the primary key. <strong>Natural key</strong>: an identifier from the real world (email). <strong>Soft delete</strong>: marking rows deleted instead of removing them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Soft deletes leak: every query must add <code>WHERE deleted_at IS NULL</code>; forget once and deleted reviews reappear in averages. Use a view (<code>live_reviews</code>). And <code>updated_at</code> does not update itself: set it in a trigger or the app.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> Anomalies, dependencies, normal forms, denormalisation, stars, grains, SCDs: one story or many?</div>

  <h2 id="sm-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How does each design idea follow from the one before, and when do you use which?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 280" width="720">
<defs><marker id="sm-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="150" height="50" rx="8" class="fr sr"/><text x="85" y="40" text-anchor="middle" font-weight="700">biteful_sheet</text><text x="85" y="57" text-anchor="middle" class="tm">3 anomalies</text>
<line x1="160" y1="45" x2="193" y2="45" stroke="currentColor" marker-end="url(#sm-a9)"/>
<rect x="195" y="20" width="150" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="270" y="40" text-anchor="middle" font-weight="700">dependencies + key</text><text x="270" y="57" text-anchor="middle" class="tm">(order_id, item)</text>
<line x1="345" y1="45" x2="378" y2="45" stroke="currentColor" marker-end="url(#sm-a9)"/>
<rect x="380" y="20" width="160" height="50" rx="8" class="fb sb"/><text x="460" y="40" text-anchor="middle" font-weight="700">1NF → 2NF → 3NF → BCNF</text><text x="460" y="57" text-anchor="middle" class="tm">one fact, one place</text>
<line x1="540" y1="45" x2="573" y2="45" stroke="currentColor" marker-end="url(#sm-a9)"/>
<rect x="575" y="20" width="135" height="50" rx="8" class="fg sg"/><text x="642" y="40" text-anchor="middle" font-weight="700">OLTP schema</text><text x="642" y="57" text-anchor="middle" class="tm">4 tables, truth</text>
<line x1="642" y1="70" x2="642" y2="103" stroke="currentColor" marker-end="url(#sm-a9)"/>
<rect x="560" y="105" width="150" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="635" y="125" text-anchor="middle" font-weight="700">denormalised copies</text><text x="635" y="142" text-anchor="middle" class="tm">amount, mat. view</text>
<line x1="560" y1="130" x2="527" y2="130" stroke="currentColor" marker-end="url(#sm-a9)"/>
<rect x="345" y="105" width="180" height="50" rx="8" class="fb sb"/><text x="435" y="125" text-anchor="middle" font-weight="700">OLAP: star / snowflake</text><text x="435" y="142" text-anchor="middle" class="tm">fact + dimensions</text>
<line x1="345" y1="130" x2="312" y2="130" stroke="currentColor" marker-end="url(#sm-a9)"/>
<rect x="150" y="105" width="160" height="50" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="230" y="125" text-anchor="middle" font-weight="700">grain + measures</text><text x="230" y="142" text-anchor="middle" class="tm">3,510 not 5,510</text>
<line x1="150" y1="130" x2="117" y2="130" stroke="currentColor" marker-end="url(#sm-a9)"/>
<rect x="10" y="105" width="105" height="50" rx="8" class="fg sg"/><text x="62" y="125" text-anchor="middle" font-weight="700">SCD 1/2/3</text><text x="62" y="142" text-anchor="middle" class="tm">Ben: Mumbai→Pune</text>
<text x="10" y="200" class="tm">Top row: remove repetition so the app's data can't contradict itself (normalise the source of truth).</text>
<text x="10" y="218" class="tm">Bottom row: add repetition back, deliberately and in copies, so analysis is fast and simple (denormalise the copies).</text>
<text x="10" y="236" class="tm">Both directions use the same tool: knowing which column depends on which (the grain of each table).</text>
</g>
</svg><figcaption>One story in two directions: normalise for writes, denormalise copies for reads, and in both cases know each table's grain.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same running example</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>Anomalies</td><td>repeated facts</td><td>what's wrong with one table?</td><td>Ben in 2 cities; 6 of 7 customers; Dia erased</td><td>diagnosing a design</td></tr>
    <tr><td>Functional dependency, key</td><td>A → B checked by GROUP BY</td><td>what decides what?</td><td>key (order_id, item): 15 distinct of 15</td><td>every design decision</td></tr>
    <tr><td>1NF</td><td>atomic cells</td><td>can I count items?</td><td>text search 3 orders vs SUM 5 dosas</td><td>always</td></tr>
    <tr><td>2NF</td><td>whole-key dependency</td><td>why does order status repeat?</td><td>order 102 delivered + cancelled → orders table</td><td>composite keys</td></tr>
    <tr><td>3NF</td><td>no transitive dependency</td><td>why does Ben's city repeat?</td><td>customers / restaurants tables; Gita exists</td><td>OLTP default</td></tr>
    <tr><td>BCNF</td><td>every determinant a key</td><td>non-key decides part of key?</td><td>rider → slot split</td><td>overlapping keys</td></tr>
    <tr><td>Denormalisation</td><td>deliberate copies</td><td>faster reads?</td><td>amount drifted 310 vs 450; view stale 1,230 vs 1,580</td><td>measured hot reads</td></tr>
    <tr><td>OLTP vs OLAP</td><td>workload</td><td>which shape for whom?</td><td>Asha's orders vs revenue by cuisine/day</td><td>separate app DB and warehouse</td></tr>
    <tr><td>Star / snowflake</td><td>fact + dimensions</td><td>simple analytic queries?</td><td>Biryani weekday 1,230 both ways</td><td>warehouses (star by default)</td></tr>
    <tr><td>Grain, measures</td><td>what one fact row means</td><td>can I sum this?</td><td>3,510 vs 5,510; wallet ₹1,000 nonsense</td><td>every fact table</td></tr>
    <tr><td>SCD Type 1 / 2</td><td>versioned dimension rows</td><td>history when attributes change?</td><td>102 → Mumbai, 106 → Pune with Type 2</td><td>Type 2 when history matters</td></tr>
    <tr><td>JSONB</td><td>semi-structured column</td><td>varying attributes?</td><td>Dosa Hut veg_only, 20 seats</td><td>sparse extras, raw payloads</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence: <strong>every column belongs with the thing that decides it; storing it anywhere else creates copies that can disagree, which you accept only in read-mostly copies whose grain you have declared.</strong> Whenever a design or a number looks wrong, ask: "what does one row of this table mean, and does this column depend on exactly that?"</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above on one page.</div>

  <h2 id="sm-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <code>biteful_sheet</code>, Biteful's 15 order lines with order, customer and restaurant details copied onto each row; normalised into customers (7), restaurants (5), orders (10), order_items (15); reshaped into fact_order_lines + dim_date, dim_customer, dim_restaurant. Delivered orders total ₹2,630; all orders ₹3,510.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Spreadsheet</td><td>why not one table?</td><td>update, insert, delete anomalies</td><td>what repeats? → dependencies</td></tr>
    <tr><td>Keys, FDs</td><td>what decides what?</td><td>order_id → customer → city; key (order_id, item)</td><td>how to split? → 1NF</td></tr>
    <tr><td>1NF</td><td>one value per cell</td><td>3 orders vs 5 dosas</td><td>order facts repeat → 2NF</td></tr>
    <tr><td>2NF</td><td>whole key</td><td>102 status split → orders table</td><td>city repeats → 3NF</td></tr>
    <tr><td>3NF</td><td>nothing but the key</td><td>customers, restaurants; Gita stored</td><td>non-key decides key → BCNF</td></tr>
    <tr><td>BCNF</td><td>determinants are keys</td><td>rider → slot</td><td>many joins → denormalise</td></tr>
    <tr><td>Denormalisation</td><td>copies for reads</td><td>amount drift; stale view</td><td>analytics differ → OLTP/OLAP</td></tr>
    <tr><td>OLTP vs OLAP</td><td>two workloads</td><td>few rows vs all rows</td><td>which shape? → star</td></tr>
    <tr><td>Star/snowflake</td><td>analytic layout</td><td>fact_order_lines + dims</td><td>what's a row? → grain</td></tr>
    <tr><td>Facts, grain</td><td>what can be summed</td><td>3,510 vs 5,510</td><td>dims change → SCD</td></tr>
    <tr><td>SCD</td><td>history of attributes</td><td>Ben's two versions</td><td>varying attributes → JSONB, conventions</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Functional dependency A → B</td><td>rows equal on A are equal on B; A is the determinant</td></tr>
    <tr><td>Candidate / primary / foreign key</td><td>minimal set deciding all columns / the chosen one / a column holding another table's key</td></tr>
    <tr><td>1NF / 2NF / 3NF / BCNF</td><td>atomic cells / no partial dependency on a composite key / no transitive dependency / every determinant is a candidate key</td></tr>
    <tr><td>Lossless split</td><td>joining the pieces returns exactly the original rows</td></tr>
    <tr><td>Denormalisation</td><td>deliberate redundancy for reads; must be kept in sync</td></tr>
    <tr><td>Fact / dimension / grain</td><td>measurable event with measures / descriptive context / meaning of one fact row</td></tr>
    <tr><td>Additive / semi / non-additive</td><td>sum anywhere / not across time / recompute from parts</td></tr>
    <tr><td>SCD Type 1 / 2 / 3</td><td>overwrite / new version row with validity dates / previous-value column</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>3NF</b><p>The app's source of truth: orders, wallets, menus.</p><small>Not for a warehouse's analyst-facing tables</small></div>
    <div><b>Denormalised copy</b><p>A measured hot read (bill total, dashboard).</p><small>Only with an owner who keeps it in sync</small></div>
    <div><b>Star schema</b><p>Warehouses and BI: one fact, many dimensions.</p><small>Never mix grains in one fact</small></div>
    <div><b>SCD Type 2</b><p>When reports must reflect attributes as they were.</p><small>Join on date range or version key</small></div>
    <div><b>JSONB</b><p>Sparse attributes, raw payloads.</p><small>Not for columns you filter or constrain</small></div>
    <div><b>Soft delete</b><p>History and undo.</p><small>Every query must filter it</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Updating one copy of a repeated fact; lists in a cell; splits that are not lossless; changing natural keys; denormalising before measuring; analytics on the OLTP database; mixing grains (5,510); summing semi-additive measures across time; joining SCD2 on the id alone (4 rows for 2 orders); JSONB as an escape from design; forgetting <code>deleted_at IS NULL</code>.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>enrolments(student_id, course_id, student_name, grade)</code>, key (student_id, course_id): which NF breaks?</td><td>2NF: student_name depends on part of the key</td></tr>
    <tr><td><code>orders(order_id, customer_id, customer_city)</code>: which NF breaks?</td><td>3NF: order_id → customer_id → customer_city</td></tr>
    <tr><td>Grain of fact_order_lines?</td><td>One item line of one order</td></tr>
    <tr><td>Summing daily balances across days: OK?</td><td>No: balance is semi-additive</td></tr>
    <tr><td>Which SCD type rewrites history?</td><td>Type 1</td></tr>
  </table>

  <h2 id="sm-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain, out loud and without notes, why each design rule exists and what breaks without it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In plain words: what does "A → B" mean? Give a Biteful example.</summary><div class="qa-body">"If you know A, you know B." <code>restaurant → cuisine</code>: knowing it's Dosa Hut tells you South Indian. Normalisation moves each column into the table of whatever decides it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the three anomalies of a single wide table, with a Biteful example of each.</summary><div class="qa-body">Update: Ben's city stored on 3 rows; changing one left him in Mumbai and Pune. Insert: Gita and Momo Magic can't be stored without an order. Delete: deleting order 105 erased Dia and Green Bowl.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>enrolments(student_id, course_id, student_name, course_title, grade)</code>, key (student_id, course_id). Which NF does it break, and the fix?</summary><div class="qa-body">2NF: student_name depends only on student_id and course_title only on course_id. Split into students, courses and enrolments(student_id, course_id, grade).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between 3NF and BCNF?</summary><div class="qa-body">3NF allows A → B when B is part of a candidate key; BCNF requires every determinant to be a candidate key. They differ only with overlapping candidate keys, e.g. rider_shifts(restaurant, slot, rider) with rider → slot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you check a split is lossless?</summary><div class="qa-body">Join the pieces back on the shared key and compare with the original both ways (EXCEPT in each direction, or row counts plus EXCEPT). orders_2nf ⋈ lines_2nf gave 15 rows and 0 missing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If normalisation is good, why do warehouses denormalise?</summary><div class="qa-body">Warehouses are read-mostly and loaded in batches, so update anomalies barely matter (the pipeline rewrites the copy), while fewer joins make huge scans faster and queries simpler. The OLTP source stays normalised as the truth.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the grain of a fact table, and what goes wrong if you ignore it?</summary><div class="qa-body">The exact meaning of one row (one order line). Ignoring it mixes levels: order amounts on line rows summed to 5,510 instead of 3,510. Declare the grain before choosing measures.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A customer changes city and revenue-by-city must show sales where they lived at the time. Which SCD type and how do you join?</summary><div class="qa-body">Type 2: one row per version with surrogate key, valid_from, valid_to, is_current. Store the version key in the fact at load time, or join on id plus <code>event_date BETWEEN valid_from AND valid_to</code>. Ben's 102 stays in Mumbai, 106 goes to Pune.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design a schema for a library: books, copies, members, loans.</summary><div class="qa-body"><code>books(book_id, isbn UNIQUE, title)</code>, <code>authors</code>, <code>book_authors(book_id, author_id)</code> (M:N), <code>copies(copy_id, book_id FK)</code>, <code>members(member_id, email UNIQUE)</code>, <code>loans(loan_id, copy_id FK, member_id FK, borrowed_at, due_at, returned_at NULL)</code>; a partial unique index on <code>copy_id WHERE returned_at IS NULL</code> stops double loans.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design follows and likes for an Instagram-like app.</summary><div class="qa-body"><code>users</code>, <code>posts(post_id, user_id FK)</code>, <code>follows(follower_id, followee_id, PK both, CHECK follower_id &lt;&gt; followee_id)</code>, <code>likes(user_id, post_id, PK both)</code>. Junction tables with composite PKs prevent duplicates; a denormalised <code>posts.like_count</code> only if reading counts is the bottleneck.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the analytics model for a ride-hailing app.</summary><div class="qa-body"><code>fact_trips</code>, grain one trip; measures fare, distance, duration, tip; dimensions rider, driver (SCD2 for city/vehicle), date, time, location (pickup and drop-off as role-playing dimensions); status as a degenerate dimension.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Soft delete vs hard delete?</summary><div class="qa-body">Soft keeps history and undo but every query must filter it and uniqueness needs partial indexes. Hard is simple and needed for "right to be forgotten", but history is gone unless archived.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does normalisation need functional dependencies, not just "split big tables"?</summary><div class="qa-body">The split must follow what decides what, or it is not lossless and doesn't remove the repetition. orders_2nf is keyed by order_id because order_id → status, amount, customer; customers are split out because customer → city. Without the dependencies you can't tell which columns belong together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: fan-out in JOINs and mixed grain in a fact table are the same bug. Explain.</summary><div class="qa-body">Both repeat a parent-level value once per child row and then sum it: order amounts per line (5,510). Normalisation prevents it in storage by keeping each fact at its own grain; star schemas prevent it by declaring one grain per fact table; queries prevent it by aggregating each table at its grain before joining.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if a warehouse skips SCD Type 2?</summary><div class="qa-body">History rewrites itself: with an overwrite (Type 1), Ben's 2 March order moved from Mumbai to Pune, so a report run last week and today disagree about the same past. Any trend by an attribute that changes (city, plan, segment) becomes unreliable.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sql_interview">SQL Interview Practice</a>.</b> We can now design and read schemas. The last note of the group uses everything (joins, subqueries, windows, grain, dates) on classic interview problems, all on Biteful.</div>
</main>`
});
