// notes/databases/sql_relational.js — Relational Model & PostgreSQL
Object.assign(TOPIC_CONTENT, {
  "sql_relational": `<main>
  <h1>Relational Model &amp; PostgreSQL</h1>
  <p class="lead">Before writing queries you need to know how data is arranged inside a relational database: why it is split into several tables, how the tables point at each other, and what rules keep the data clean. This page builds that picture with the shared <code>shop</code> dataset, then covers the PostgreSQL types, constraints and tools you'll use daily. Every later SQL page assumes this one.</p>

  <h2 id="sr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Relational Model &amp; PostgreSQL</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Relational model</div>
        <ul>
          <li><b>Relation</b> — a table: set of rows with the same columns</li>
          <li><b>Row / tuple</b> — one fact; <b>column / attribute</b> — typed property (domain)</li>
          <li>⚠ <b>Rows are unordered</b> — no <code>ORDER BY</code> = no guaranteed order</li>
          <li><b>One big sheet</b> → 3 anomalies
            <ul><li>update: Asha moves, edit 3 rows</li><li>insert: Dia (no orders) can't exist</li><li>delete: drop order 102, Ben vanishes</li></ul></li>
          <li><b>Fix</b> — each fact once, linked by keys; JOIN rebuilds the wide view (normalization)</li>
          <li>💡 <b>Phone contacts</b> — number stored once, chats refer to it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keys</div>
        <ul>
          <li><b>PK</b> — unique + NOT NULL, one per table</li>
          <li><b>Candidate</b> — any minimal unique set; non-chosen ones get UNIQUE</li>
          <li><b>Composite</b> — 2+ columns: <code>order_items(order_id, product_id)</code></li>
          <li><b>FK</b> — must match a parent PK/UNIQUE value</li>
          <li><b>Natural vs surrogate</b> — email vs generated id</li>
          <li>⚠ natural keys change → surrogate PK + UNIQUE on natural key</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Relationships</div>
        <ul>
          <li><b>1:N</b> — FK on the many side (<code>orders.customer_id</code>)</li>
          <li><b>1:1</b> — FK + UNIQUE (or shared PK)</li>
          <li><b>M:N</b> — junction table with two FKs (<code>order_items</code>)</li>
          <li><b>Pair facts</b> live in the junction: qty, <code>unit_price</code> (price paid at sale)</li>
          <li><b>Self-reference</b> — <code>employees.manager_id → emp_id</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shop dataset quirks</div>
        <ul>
          <li><b>Chain</b> — customers → orders → order_items ← products; employees self-FK</li>
          <li><b>Dia</b> — no orders + NULL city → LEFT JOIN, NULL tests</li>
          <li><b>Sara = Tom</b> salary tie → RANK vs ROW_NUMBER</li>
          <li><b>Order 102</b> cancelled → filtering</li>
          <li><b>Lamp</b> in two orders → join fan-out</li>
          <li><b>Ravi</b> no manager → hierarchy root</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SQL sub-languages</div>
        <ul>
          <li><b>DDL</b> — CREATE, ALTER, DROP, TRUNCATE (schema)</li>
          <li><b>DML</b> — INSERT, UPDATE, DELETE, MERGE (rows)</li>
          <li><b>DQL</b> — SELECT · <b>DCL</b> — GRANT, REVOKE</li>
          <li><b>TCL</b> — BEGIN, COMMIT, ROLLBACK, SAVEPOINT</li>
          <li>⚠ Postgres DDL is transactional (rollback-able); MySQL/Oracle auto-commit DDL</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">PostgreSQL &amp; types</div>
        <ul>
          <li><b>Why</b> — open source, standard SQL, extensions (PostGIS, pgvector, TimescaleDB), JSONB</li>
          <li><b>Others</b> — MySQL (web), SQLite (a file), SQL Server (T-SQL), Oracle, BigQuery/Snowflake (analytics)</li>
          <li><b>Ids</b> — <code>BIGINT GENERATED ALWAYS AS IDENTITY</code></li>
          <li>⚠ <b>Money</b> → <code>NUMERIC</code>; float: 0.1 + 0.2 = 0.30000000000000004</li>
          <li>⚠ <b>Events</b> → <code>TIMESTAMPTZ</code> (absolute instant, stored UTC); TIMESTAMP = zone-less wall clock</li>
          <li><b>Strings</b> → <code>TEXT</code>; <code>VARCHAR(n)</code> only for a real limit; avoid CHAR(n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Constraints</div>
        <ul>
          <li><b>NOT NULL, UNIQUE, CHECK, PK, FK, DEFAULT</b> — enforced on every write</li>
          <li>💡 app validation = sign; constraint = bouncer at every door</li>
          <li><b>ON DELETE</b> — NO ACTION/RESTRICT refuse · CASCADE deletes children · SET NULL unlinks</li>
          <li>⚠ UNIQUE allows many NULLs (PG15+: <code>NULLS NOT DISTINCT</code>)</li>
          <li>⚠ identity ids have gaps (failed inserts burn values)</li>
          <li>⚠ FK columns aren't auto-indexed — add indexes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">psql &amp; Python</div>
        <ul>
          <li><b>psql</b> — <code>&#92;dt</code> tables, <code>&#92;d t</code> describe, <code>&#92;x</code> expanded</li>
          <li><b>psycopg 3</b> — <code>conn.execute(sql, (val,))</code> with <code>%s</code> placeholders</li>
          <li><b>pandas</b> — <code>pd.read_sql(text(...), engine, params=...)</code>; NUMERIC → float64</li>
          <li>⚠ <b>SQL injection</b> — <code>x' OR '1'='1</code> leaks all rows; f-strings unsafe too</li>
          <li><b>Fix</b> — bound parameters for values; allow-list / <code>sql.Identifier</code> for names</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sr-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Relational Model</span><span class="rm-sub">Why tables beat one big sheet</span></div></div>
      <div class="rm-item rm-done" data-target="sr-keys"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Keys &amp; Relationships</span><span class="rm-sub">PK, FK, 1:1, 1:N, M:N</span></div></div>
      <div class="rm-item rm-done" data-target="sr-shop"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Shop Dataset</span><span class="rm-sub">Used on every SQL page</span></div></div>
      <div class="rm-item rm-done" data-target="sr-lang"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">SQL Sub-languages</span><span class="rm-sub">DDL, DML, DQL, DCL, TCL</span></div></div>
      <div class="rm-item rm-done" data-target="sr-pg"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Why PostgreSQL</span><span class="rm-sub">And how other dialects differ</span></div></div>
      <div class="rm-item rm-done" data-target="sr-types"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Data Types &amp; Traps</span><span class="rm-sub">Money, time zones, strings</span></div></div>
      <div class="rm-item rm-done" data-target="sr-cons"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Constraints</span><span class="rm-sub">Rules the DB enforces</span></div></div>
      <div class="rm-item rm-done" data-target="sr-tools"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">psql &amp; Python</span><span class="rm-sub">Querying safely from code</span></div></div>
      <div class="rm-item rm-done" data-target="sr-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sr-model"><span class="num">01</span>The Relational Model</h2>
  <p>Imagine running a small online shop with one Excel sheet. Every row is one item sold: order number, customer name, city, product, quantity, price. It works for a week. Then Asha moves from Mumbai to Pune and you have to find and fix her city on every row she ever ordered. Miss one, and your sheet now says she lives in two cities.</p>
  <p>The relational model is the fix for this. "Relational" comes from <em>relation</em>, the maths word for a table. The vocabulary, with plain meanings:</p>
  <ul>
    <li><strong>Relation</strong> = a table: a set of rows that all have the same columns.</li>
    <li><strong>Row</strong> (tuple): one fact, e.g. one order.</li>
    <li><strong>Column</strong> (attribute): one property with a <strong>type / domain</strong> (allowed values, e.g. <code>DATE</code>).</li>
    <li>Rows have <strong>no order</strong>: a table is a bag of facts, not a list. Without <code>ORDER BY</code>, output order isn't guaranteed.</li>
  </ul>
  <p>Why split data into tables? Here is the "one giant sheet" version of Asha's orders, rebuilt from the shop tables (the <code>JOIN … USING</code> lines stitch the tables; the <em>JOINs</em> page explains them):</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, c.city, p.name AS product, oi.qty, oi.unit_price
FROM orders o
JOIN customers c   USING (customer_id)
JOIN order_items oi USING (order_id)
JOIN products p    USING (product_id)
WHERE c.customer_id = 1
ORDER BY o.order_id, p.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer</th><th>city</th><th>product</th><th>qty</th><th>unit_price</th></tr><tr><td>100</td><td>Asha</td><td>Mumbai</td><td>Lamp</td><td>2</td><td>40.00</td></tr><tr><td>100</td><td>Asha</td><td>Mumbai</td><td>Laptop</td><td>1</td><td>800.00</td></tr><tr><td>101</td><td>Asha</td><td>Mumbai</td><td>Phone</td><td>1</td><td>500.00</td></tr></table>
  <p>Look at the result: "Asha" and "Mumbai" are written on all three rows. If this were the <em>stored</em> form, it would suffer three <strong>anomalies</strong> (ways the data can go wrong):</p>
  <div class="cards">
    <div><b>Update</b><p>Asha moves city: edit 3 rows. Miss one and the data contradicts itself.</p></div>
    <div><b>Insert</b><p>Dia has no orders, so she can't exist in an order sheet.</p></div>
    <div><b>Delete</b><p>Delete Ben's only order (102) and Ben disappears.</p></div>
  </div>
  <p>Fix: store each fact <strong>once</strong>. Asha's city lives in one row of <code>customers</code>. Each order carries only her number, 1. When you need the wide view, a JOIN rebuilds it on the fly, as the query above did. Splitting data this way is called <em>normalization</em> (see Data Modeling).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your phone's contacts. A number is stored once; chats refer to the contact. Change it once and every chat updates.</p>
  </div>

  <h2 id="sr-keys"><span class="num">02</span>Keys &amp; Relationships</h2>
  <p>If orders only store the number 1, two things must be true: every customer needs a number nobody else has, and an order must never point at a number that doesn't exist. Keys are the columns that make both true.</p>
  <p>A <strong>primary key</strong> is the column that identifies a row, like a roll number in a class. Two students can share a name, never a roll number. A <strong>foreign key</strong> is a column in one table that holds another table's primary key value: <code>orders.customer_id</code> holds a <code>customers.customer_id</code>. "Foreign" just means "belongs to another table".</p>
  <table class="tbl">
    <tr><th>Key</th><th>Meaning</th><th>Shop example</th></tr>
    <tr><td><strong>Primary key (PK)</strong></td><td>The column(s) that uniquely identify a row. Unique and NOT NULL. One per table.</td><td><code>customers.customer_id</code></td></tr>
    <tr><td><strong>Candidate key</strong></td><td>Any minimal column set that could be the PK. You pick one; the rest get UNIQUE.</td><td>An <code>email</code> column, if added</td></tr>
    <tr><td><strong>Composite key</strong></td><td>A key made of 2+ columns together</td><td><code>order_items (order_id, product_id)</code></td></tr>
    <tr><td><strong>Foreign key (FK)</strong></td><td>A column that must match a PK (or UNIQUE) value in another table</td><td><code>orders.customer_id → customers</code></td></tr>
    <tr><td><strong>Natural</strong> vs <strong>surrogate</strong></td><td>Real-world id vs meaningless generated id</td><td>email vs <code>customer_id</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: natural keys change</span>
    <p>Emails change; real-world codes get reused or mistyped. Use a surrogate PK plus UNIQUE on the natural key: stable joins <em>and</em> no duplicates.</p>
  </div>
  <h3>The three relationship shapes</h3>
  <p>Ask of any two tables: how many of B can one A have, and how many of A can one B have?</p>
  <ul>
    <li>One customer places many orders; one order belongs to one customer. <strong>One-to-many (1:N)</strong>.</li>
    <li>One customer has one profile; one profile belongs to one customer. <strong>One-to-one (1:1)</strong>.</li>
    <li>One order contains many products; one product appears in many orders. <strong>Many-to-many (M:N)</strong>.</li>
  </ul>
  <p>The first two need one foreign key column. The third can't be done with one column: where would you put it? An order can't hold a list of products in one cell, and a product can't hold a list of orders. So you create a third table that holds one row per pair.</p>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <g font-size="10">
    <text x="95" y="14" text-anchor="middle" font-weight="bold" font-size="12" class="tb">1 : N</text>
    <rect x="10" y="62" width="60" height="28" rx="4" class="fb sb"/><text x="40" y="80" text-anchor="middle">Asha</text>
    <rect x="120" y="32" width="60" height="26" rx="4" class="ft"/><text x="150" y="49" text-anchor="middle">ord 100</text>
    <rect x="120" y="94" width="60" height="26" rx="4" class="ft"/><text x="150" y="111" text-anchor="middle">ord 101</text>
    <g stroke="currentColor"><line x1="70" y1="76" x2="120" y2="45"/><line x1="70" y1="76" x2="120" y2="107"/></g>
    <text x="300" y="14" text-anchor="middle" font-weight="bold" font-size="12" class="tb">1 : 1</text>
    <rect x="215" y="62" width="60" height="28" rx="4" class="fb sb"/><text x="245" y="80" text-anchor="middle">Asha</text>
    <rect x="325" y="62" width="60" height="28" rx="4" class="ft"/><text x="355" y="80" text-anchor="middle">profile</text>
    <line x1="275" y1="76" x2="325" y2="76" stroke="currentColor"/>
    <text x="505" y="14" text-anchor="middle" font-weight="bold" font-size="12" class="tb">M : N</text>
    <rect x="410" y="38" width="40" height="24" rx="4" class="fb sb"/><text x="430" y="54" text-anchor="middle">100</text>
    <rect x="410" y="98" width="40" height="24" rx="4" class="fb sb"/><text x="430" y="114" text-anchor="middle">103</text>
    <rect x="470" y="26" width="64" height="20" rx="3" class="fv"/><text x="502" y="40" text-anchor="middle">100│10</text>
    <rect x="470" y="54" width="64" height="20" rx="3" class="fv"/><text x="502" y="68" text-anchor="middle">100│13</text>
    <rect x="470" y="86" width="64" height="20" rx="3" class="fv"/><text x="502" y="100" text-anchor="middle">103│11</text>
    <rect x="470" y="114" width="64" height="20" rx="3" class="fv"/><text x="502" y="128" text-anchor="middle">103│12</text>
    <rect x="550" y="26" width="46" height="20" rx="3" class="fg"/><text x="573" y="40" text-anchor="middle">Laptop</text>
    <rect x="550" y="54" width="46" height="20" rx="3" class="fg"/><text x="573" y="68" text-anchor="middle">Lamp</text>
    <rect x="550" y="86" width="46" height="20" rx="3" class="fg"/><text x="573" y="100" text-anchor="middle">Phone</text>
    <rect x="550" y="114" width="46" height="20" rx="3" class="fg"/><text x="573" y="128" text-anchor="middle">Desk</text>
    <g stroke="currentColor"><line x1="450" y1="50" x2="470" y2="36"/><line x1="450" y1="50" x2="470" y2="64"/><line x1="450" y1="110" x2="470" y2="96"/><line x1="450" y1="110" x2="470" y2="124"/>
    <line x1="534" y1="36" x2="550" y2="36"/><line x1="534" y1="64" x2="550" y2="64"/><line x1="534" y1="96" x2="550" y2="96"/><line x1="534" y1="124" x2="550" y2="124"/></g>
    <text x="95" y="160" text-anchor="middle" class="tm">FK on the "many" side</text>
    <text x="300" y="160" text-anchor="middle" class="tm">FK + UNIQUE</text>
    <text x="505" y="160" text-anchor="middle" class="tm">junction: order_items</text>
    </g>
  </svg><figcaption>M:N can't be one FK; the junction table holds one row per (order, product) pair.</figcaption></figure>
  <table class="tbl">
    <tr><th>Shape</th><th>How it's built</th><th>Example</th></tr>
    <tr><td><strong>1:N</strong></td><td>FK on the "many" side</td><td>One customer → many orders (<code>orders.customer_id</code>)</td></tr>
    <tr><td><strong>1:1</strong></td><td>FK that is also UNIQUE (or shares the PK)</td><td><code>customer_profiles.customer_id</code> UNIQUE</td></tr>
    <tr><td><strong>M:N</strong></td><td>A <strong>junction table</strong> with two FKs</td><td>Orders ↔ products via <code>order_items</code></td></tr>
  </table>
  <p>In the right-hand picture, the purple boxes are that third table, <code>order_items</code>: one row per (order, product) pair, plus facts about the pair such as quantity. To answer "which orders contain the Lamp?" you start from those pairs and follow the ids outwards:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name
FROM order_items oi
JOIN orders o    USING (order_id)
JOIN customers c USING (customer_id)
WHERE oi.product_id = 13
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>name</th></tr><tr><td>100</td><td>Asha</td></tr><tr><td>104</td><td>Chen</td></tr></table>
  <p><code>unit_price</code> is copied into the line item on purpose: prices change, and the price paid is a fact about <em>that sale</em>. If the Lamp becomes ₹50 next month, Asha's old bill must still say ₹40.</p>

  <h2 id="sr-shop"><span class="num">03</span>The Shop Dataset</h2>
  <p>This is <strong>the dataset every SQL page uses</strong>: a tiny online shop with four customers, four products, five orders and five employees. It is small enough to check every answer by hand, and it has a few deliberate oddities (listed at the end) that make interview traps visible. Learn its quirks once.</p>
  <p>The diagram below is an <strong>entity-relationship diagram</strong>: one box per table, PK = primary key, FK = foreign key, and a line for each foreign key link.</p>
  <figure class="viz"><svg viewBox="0 0 600 245" width="600">
    <defs><marker id="sr-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
      <rect x="5" y="20" width="115" height="92" rx="6" class="fs"/><rect x="5" y="20" width="115" height="20" rx="6" class="fb"/>
      <text x="62" y="34" text-anchor="middle" font-weight="bold" font-size="11">customers</text>
      <text x="12" y="56" class="tb">PK customer_id</text><text x="12" y="72">name</text><text x="12" y="88">city</text><text x="12" y="104">signup_date</text>
      <rect x="160" y="20" width="120" height="92" rx="6" class="fs"/><rect x="160" y="20" width="120" height="20" rx="6" class="fb"/>
      <text x="220" y="34" text-anchor="middle" font-weight="bold" font-size="11">orders</text>
      <text x="167" y="56" class="tb">PK order_id</text><text x="167" y="72" class="tg">FK customer_id</text><text x="167" y="88">order_date</text><text x="167" y="104">status</text>
      <rect x="320" y="20" width="135" height="92" rx="6" class="fs"/><rect x="320" y="20" width="135" height="20" rx="6" class="fv"/>
      <text x="387" y="34" text-anchor="middle" font-weight="bold" font-size="11">order_items</text>
      <text x="327" y="56" class="tg">PK,FK order_id</text><text x="327" y="72" class="tg">PK,FK product_id</text><text x="327" y="88">qty</text><text x="327" y="104">unit_price</text>
      <rect x="495" y="20" width="100" height="92" rx="6" class="fs"/><rect x="495" y="20" width="100" height="20" rx="6" class="fb"/>
      <text x="545" y="34" text-anchor="middle" font-weight="bold" font-size="11">products</text>
      <text x="501" y="56" class="tb">PK product_id</text><text x="501" y="72">name</text><text x="501" y="88">category</text><text x="501" y="104">price</text>
      <g stroke="currentColor" fill="none"><path d="M160,68 L140,68 L140,52 L120,52"/><line x1="320" y1="52" x2="280" y2="52"/><path d="M455,68 L475,68 L475,52 L495,52"/></g>
      <g font-size="11" font-weight="bold" class="tr"><text x="124" y="48">1</text><text x="150" y="64">N</text><text x="284" y="48">1</text><text x="310" y="48">N</text><text x="461" y="64">N</text><text x="485" y="48">1</text></g>
      <rect x="200" y="140" width="150" height="92" rx="6" class="fs"/><rect x="200" y="140" width="150" height="20" rx="6" class="ft"/>
      <text x="275" y="154" text-anchor="middle" font-weight="bold" font-size="11">employees</text>
      <text x="207" y="176" class="tb">PK emp_id</text><text x="207" y="192">name, dept</text><text x="207" y="208">salary</text><text x="207" y="224" class="tg">FK manager_id</text>
      <path d="M350,220 C405,220 405,172 352,172" fill="none" stroke="currentColor" marker-end="url(#sr-ar1)"/>
      <text x="410" y="200" class="tm">self-referencing FK</text>
    </g>
  </svg><figcaption>Read "1 … N" as "one customer has many orders". order_items is the M:N bridge; employees points at itself.</figcaption></figure>
  <table class="tbl"><caption>customers</caption><tr><th>customer_id</th><th>name</th><th>city</th><th>signup_date</th></tr><tr><td>1</td><td>Asha</td><td>Mumbai</td><td>2024-01-05</td></tr><tr><td>2</td><td>Ben</td><td>Delhi</td><td>2024-02-10</td></tr><tr><td>3</td><td>Chen</td><td>Mumbai</td><td>2024-03-15</td></tr><tr><td>4</td><td>Dia</td><td>NULL</td><td>2024-04-20</td></tr></table>
  <table class="tbl"><caption>products</caption><tr><th>product_id</th><th>name</th><th>category</th><th>price</th></tr><tr><td>10</td><td>Laptop</td><td>Electronics</td><td>800.00</td></tr><tr><td>11</td><td>Phone</td><td>Electronics</td><td>500.00</td></tr><tr><td>12</td><td>Desk</td><td>Furniture</td><td>150.00</td></tr><tr><td>13</td><td>Lamp</td><td>Furniture</td><td>40.00</td></tr></table>
  <table class="tbl"><caption>orders</caption><tr><th>order_id</th><th>customer_id</th><th>order_date</th><th>status</th></tr><tr><td>100</td><td>1</td><td>2024-05-01</td><td>delivered</td></tr><tr><td>101</td><td>1</td><td>2024-05-20</td><td>delivered</td></tr><tr><td>102</td><td>2</td><td>2024-06-02</td><td>cancelled</td></tr><tr><td>103</td><td>3</td><td>2024-06-15</td><td>delivered</td></tr><tr><td>104</td><td>3</td><td>2024-07-01</td><td>pending</td></tr></table>
  <table class="tbl"><caption>order_items  (PK: order_id, product_id)</caption><tr><th>order_id</th><th>product_id</th><th>qty</th><th>unit_price</th></tr><tr><td>100</td><td>10</td><td>1</td><td>800.00</td></tr><tr><td>100</td><td>13</td><td>2</td><td>40.00</td></tr><tr><td>101</td><td>11</td><td>1</td><td>500.00</td></tr><tr><td>102</td><td>12</td><td>1</td><td>150.00</td></tr><tr><td>103</td><td>11</td><td>2</td><td>500.00</td></tr><tr><td>103</td><td>12</td><td>1</td><td>150.00</td></tr><tr><td>104</td><td>13</td><td>3</td><td>40.00</td></tr></table>
  <table class="tbl"><caption>employees</caption><tr><th>emp_id</th><th>name</th><th>dept</th><th>salary</th><th>manager_id</th></tr><tr><td>1</td><td>Ravi</td><td>Eng</td><td>120000</td><td>NULL</td></tr><tr><td>2</td><td>Sara</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>3</td><td>Tom</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>4</td><td>Uma</td><td>Sales</td><td>70000</td><td>1</td></tr><tr><td>5</td><td>Vik</td><td>Sales</td><td>65000</td><td>4</td></tr></table>
  <div class="callout pred"><span class="label">Quirks to remember</span>
    <p>Dia has <strong>no orders</strong> and a <strong>NULL city</strong> (LEFT JOIN and NULL tests). Sara and Tom <strong>tie</strong> on salary (RANK vs ROW_NUMBER). Order 102 is <strong>cancelled</strong> (filtering). The Lamp is in <strong>two orders</strong> (fan-out in joins). Ravi has no manager (root of the hierarchy).</p>
  </div>

  <h2 id="sr-lang"><span class="num">04</span>SQL Sub-languages</h2>
  <p>SQL (Structured Query Language) is one language, but its commands do five different kinds of job: build the shelves, put things on them, read them, decide who may enter, and bundle changes safely. Interviewers like asking which group a command belongs to, so learn the five names.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library. DDL builds and labels the shelves. DML puts books in, moves them, removes them. DQL is reading. DCL is the membership desk deciding who may borrow. TCL is "either all these books are issued to you, or none".</p>
  </div>
  <table class="tbl">
    <tr><th>Group</th><th>Does</th><th>Commands</th></tr>
    <tr><td><strong>DDL</strong> Data Definition</td><td>Shapes the schema</td><td>CREATE, ALTER, DROP, TRUNCATE</td></tr>
    <tr><td><strong>DML</strong> Data Manipulation</td><td>Changes rows</td><td>INSERT, UPDATE, DELETE, MERGE</td></tr>
    <tr><td><strong>DQL</strong> Data Query</td><td>Reads rows</td><td>SELECT</td></tr>
    <tr><td><strong>DCL</strong> Data Control</td><td>Permissions</td><td>GRANT, REVOKE</td></tr>
    <tr><td><strong>TCL</strong> Transaction Control</td><td>Groups changes into all-or-nothing units</td><td>BEGIN, COMMIT, ROLLBACK, SAVEPOINT</td></tr>
  </table>
  <div class="fx" data-lang="sql">-- DDL
ALTER TABLE customers ADD COLUMN email TEXT UNIQUE;
-- DML
UPDATE products SET price = 45 WHERE product_id = 13;
-- DQL
SELECT name, price FROM products WHERE category = 'Electronics' ORDER BY price DESC;</div>
  <table class="tbl out"><caption>Result (DQL)</caption><tr><th>name</th><th>price</th></tr><tr><td>Laptop</td><td>800.00</td></tr><tr><td>Phone</td><td>500.00</td></tr></table>
  <p>The TCL example is worth reading slowly. <code>BEGIN</code> opens a transaction. Inside it, every price is doubled and the Laptop reads 1600. <code>ROLLBACK</code> throws the whole transaction away, so the Laptop is back at 800. (<code>COMMIT</code> would have kept it.) The example runs on a copy of <code>shop</code>.</p>
  <div class="fx" data-lang="sql">-- TCL: try a change, then undo it
BEGIN;
UPDATE products SET price = price * 2;                 -- UPDATE 4
SELECT name, price FROM products WHERE product_id = 10; -- Laptop 1600.00
ROLLBACK;
SELECT name, price FROM products WHERE product_id = 10;</div>
  <table class="tbl out"><caption>Result (after ROLLBACK)</caption><tr><th>name</th><th>price</th></tr><tr><td>Laptop</td><td>800.00</td></tr></table>
  <div class="fx" data-lang="sql">-- DCL: a read-only analyst role
CREATE ROLE analyst LOGIN;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst;
SET ROLE analyst;
DELETE FROM orders WHERE order_id = 104;
-- ERROR:  permission denied for table orders</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In PostgreSQL, DDL is transactional: <code>CREATE</code>/<code>ALTER</code>/<code>DROP</code> inside <code>BEGIN</code> can be rolled back. In MySQL and Oracle, DDL auto-commits, so it can't.</p>
  </div>

  <h2 id="sr-pg"><span class="num">05</span>Why PostgreSQL</h2>
  <p>Many companies sell or give away a relational DBMS. They all speak SQL, but each has its own <strong>dialect</strong>: small differences in functions and syntax, like Hindi spoken in Delhi versus Lucknow. These notes use PostgreSQL ("Postgres"): open-source (free, code public), and the sensible default for a new project.</p>
  <div class="flow"><span>Open source, managed on every cloud</span><span>Standard SQL + ACID + transactional DDL</span><span>Extensions: PostGIS, pgvector, TimescaleDB</span><span>JSONB: tables + documents</span></div>
  <div class="cards">
    <div><b>PostgreSQL</b><p>Feature-rich, strict, extensible. The default choice.</p><small>Instagram, Reddit, most startups</small></div>
    <div><b>MySQL</b><p>Simple, fast reads, huge web ecosystem. Historically looser with types.</p><small>WordPress, early Facebook, Shopify</small></div>
    <div><b>SQLite</b><p>A file, not a server. Zero setup, one writer at a time.</p><small>Phones, browsers, tests, local tools</small></div>
    <div><b>SQL Server</b><p>Microsoft's DBMS; T-SQL dialect (<code>TOP</code>, <code>GETDATE()</code>).</p><small>Enterprises on the Microsoft stack</small></div>
    <div><b>Oracle</b><p>Mature, very capable, expensive licences; PL/SQL.</p><small>Banks, telecoms, ERP</small></div>
    <div><b>BigQuery / Snowflake</b><p>Columnar warehouse dialects for analytics, not apps. <code>QUALIFY</code>, nested types.</p><small>Analytics and ML teams</small></div>
  </div>

  <h2 id="sr-types"><span class="num">06</span>Data Types &amp; Traps</h2>
  <p>Every column has a <strong>type</strong>: the kind of value it may hold. A type does two jobs. It rejects nonsense ("abc" in a price column), and it tells the database how to store and compare the value (dates sort as dates, not as text). Choosing the wrong type is a quiet bug: the data goes in fine and the answers come out slightly wrong.</p>
  <table class="tbl">
    <tr><th>Need</th><th>Use</th><th>Note</th></tr>
    <tr><td>Whole numbers / ids</td><td><code>INTEGER</code>, <code>BIGINT</code></td><td>Ids: <code>GENERATED ALWAYS AS IDENTITY</code> (modern <code>SERIAL</code>)</td></tr>
    <tr><td>Money, exact decimals</td><td><code>NUMERIC(10,2)</code></td><td>Exact, slower</td></tr>
    <tr><td>Measurements, ML scores</td><td><code>REAL</code>, <code>DOUBLE PRECISION</code></td><td>Fast, approximate</td></tr>
    <tr><td>Text</td><td><code>TEXT</code></td><td><code>VARCHAR(n)</code> only to enforce a real limit</td></tr>
    <tr><td>Dates and times</td><td><code>DATE</code>, <code>TIMESTAMPTZ</code>, <code>INTERVAL</code></td><td>Prefer TIMESTAMPTZ for events</td></tr>
    <tr><td>Flags, ids, documents</td><td><code>BOOLEAN</code>, <code>UUID</code>, <code>JSONB</code>, arrays</td><td>JSONB over JSON (indexable)</td></tr>
  </table>
  <h3>Trap 1: FLOAT for money</h3>
  <p>A computer stores a <strong>float</strong> in binary (base 2). Just as 1/3 can't be written exactly in decimal (0.3333…), 0.1 can't be written exactly in binary. The stored value is a hair off, and the error shows up when you add. <code>NUMERIC</code> stores the decimal digits as you typed them, so it is exact. (<code>::float8</code> and <code>::numeric</code> below force a value to that type.)</p>
  <div class="fx" data-lang="sql">SELECT 0.1::float8 + 0.2::float8 = 0.3 AS float_ok,
       0.1::numeric + 0.2::numeric = 0.3 AS numeric_ok,
       0.1::float8 + 0.2::float8         AS float_sum;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>float_ok</th><th>numeric_ok</th><th>float_sum</th></tr><tr><td>f</td><td>t</td><td>0.30000000000000004</td></tr></table>
  <p>Add ten ₹0.10 coins and the gap is visible:</p>
  <div class="fx" data-lang="sql">SELECT SUM(0.1::float8) AS float_sum, SUM(0.1::numeric) AS numeric_sum FROM generate_series(1, 10);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>float_sum</th><th>numeric_sum</th></tr><tr><td>0.9999999999999999</td><td>1.0</td></tr></table>
  <p>Floats are binary approximations; errors pile up in sums. Money → <code>NUMERIC</code> (or whole numbers of paise); measurements and ML scores → float, where speed matters and the last digit doesn't.</p>
  <h3>Trap 2: TIMESTAMP vs TIMESTAMPTZ</h3>
  <p>A friend in New York texts "call me at 10:00". 10:00 where? Without the time zone the message is ambiguous. Databases have the same problem.</p>
  <p><code>TIMESTAMP</code> is a wall-clock reading with no zone: just "10:00". <code>TIMESTAMPTZ</code> (timestamp with time zone) stores an absolute instant: it converts your input to UTC (the world reference time) on the way in, and converts back to whatever zone the viewer's session uses on the way out. In the demo, the same value is inserted in a Kolkata session and read in a New York session:</p>
  <div class="fx" data-lang="sql">CREATE TABLE t (ts TIMESTAMP, tstz TIMESTAMPTZ);
SET timezone = 'Asia/Kolkata';
INSERT INTO t VALUES ('2024-05-01 10:00', '2024-05-01 10:00');
SET timezone = 'America/New_York';
SELECT * FROM t;</div>
  <table class="tbl out"><caption>Result (New York session)</caption><tr><th>ts</th><th>tstz</th></tr><tr><td>2024-05-01 10:00:00</td><td>2024-05-01 00:30:00-04</td></tr></table>
  <p>In the Kolkata session, <code>tstz</code> showed <code>10:00:00+05:30</code>. Now: the same instant in New York time. <code>ts</code> is just "10:00": nobody knows which.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>TIMESTAMPTZ</code> doesn't store the zone; it converts to UTC on input. Use plain <code>TIMESTAMP</code> only for zone-less facts like "opens at 09:00".</p>
  </div>
  <h3>Trap 3: TEXT vs VARCHAR(n)</h3>
  <p>In PostgreSQL they perform the same. <code>VARCHAR(n)</code> only adds a length check:</p>
  <div class="fx" data-lang="sql">CREATE TABLE v (code VARCHAR(3));
INSERT INTO v VALUES ('ABCD');
-- ERROR:  value too long for type character varying(3)</div>
  <p>Default to <code>TEXT</code>; add a limit only for a real rule (3-letter currency codes). Avoid <code>CHAR(n)</code>: it pads with spaces.</p>

  <h2 id="sr-cons"><span class="num">07</span>Constraints</h2>
  <p>Your app checks that a rating is between 1 and 5 before saving it. Then a colleague writes a quick Python script that inserts ratings directly, and a 7 slips in. The app's check never ran, because the script didn't go through the app.</p>
  <p>A <strong>constraint</strong> is a rule stored <em>in the table itself</em>, so the database enforces it on every write, whichever app or script sends it. The six kinds: <code>NOT NULL</code> (value required), <code>UNIQUE</code> (no repeats), <code>CHECK</code> (any condition), <code>PRIMARY KEY</code>, <code>FOREIGN KEY</code> (<code>REFERENCES</code>), and <code>DEFAULT</code> (value to use when none is given).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>App validation is a "no trainers" sign; a constraint is the bouncer, who also guards the side entrance (scripts, manual fixes, other services).</p>
  </div>
  <div class="fx" data-lang="sql">CREATE TABLE reviews (
  review_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(product_id)   ON DELETE RESTRICT,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, product_id)          -- one review per customer per product
);
INSERT INTO reviews (customer_id, product_id, rating) VALUES (1, 10, 5);  -- INSERT 0 1</div>
  <p>Read the table definition line by line: <code>review_id</code> is generated automatically (an <strong>identity</strong> column, 1, 2, 3…); <code>customer_id</code> must exist in <code>customers</code> and, if that customer is deleted, the review goes too (<code>CASCADE</code>); <code>product_id</code> must exist in <code>products</code> and blocks deleting the product (<code>RESTRICT</code>); rating must be 1 to 5; <code>created_at</code> fills itself with the current time; and one customer may review one product only once. Now break each rule. These are the real PostgreSQL errors:</p>
  <table class="tbl">
    <tr><th>Statement</th><th>Error</th></tr>
    <tr><td><code>VALUES (1, 10, 4)</code> again</td><td>duplicate key value violates unique constraint "reviews_customer_id_product_id_key"</td></tr>
    <tr><td><code>VALUES (2, 11, 6)</code></td><td>new row for relation "reviews" violates check constraint "reviews_rating_check"</td></tr>
    <tr><td><code>VALUES (99, 11, 3)</code></td><td>insert or update on table "reviews" violates foreign key constraint "reviews_customer_id_fkey"<br>DETAIL: Key (customer_id)=(99) is not present in table "customers".</td></tr>
    <tr><td>rating omitted</td><td>null value in column "rating" of relation "reviews" violates not-null constraint</td></tr>
    <tr><td><code>DELETE FROM customers WHERE customer_id = 1</code></td><td>update or delete on table "customers" violates foreign key constraint "orders_customer_id_fkey" on table "orders"</td></tr>
  </table>
  <h3>ON DELETE behaviour</h3>
  <p>The last error above raises a question. Asha has orders. If you delete Asha, what happens to orders that point at customer 1? They would point at nothing. The foreign key must say what to do, and there are three answers:</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <g font-size="10">
    <text x="100" y="16" text-anchor="middle" font-weight="bold" font-size="12">RESTRICT / NO ACTION</text>
    <rect x="55" y="30" width="90" height="28" rx="4" class="fb sb"/><text x="100" y="48" text-anchor="middle">customer 1</text>
    <rect x="15" y="90" width="80" height="26" rx="4" class="ft"/><text x="55" y="107" text-anchor="middle">order 100</text>
    <rect x="105" y="90" width="80" height="26" rx="4" class="ft"/><text x="145" y="107" text-anchor="middle">order 101</text>
    <g stroke="currentColor"><line x1="100" y1="58" x2="55" y2="90"/><line x1="100" y1="58" x2="145" y2="90"/></g>
    <text x="100" y="145" text-anchor="middle" class="tr">✗ DELETE refused</text>
    <text x="300" y="16" text-anchor="middle" font-weight="bold" font-size="12">CASCADE</text>
    <rect x="255" y="30" width="90" height="28" rx="4" class="fr sr" stroke-dasharray="4 3"/><text x="300" y="48" text-anchor="middle" class="tm">deleted</text>
    <rect x="215" y="90" width="80" height="26" rx="4" class="fr sr" stroke-dasharray="4 3"/><text x="255" y="107" text-anchor="middle" class="tm">deleted</text>
    <rect x="305" y="90" width="80" height="26" rx="4" class="fr sr" stroke-dasharray="4 3"/><text x="345" y="107" text-anchor="middle" class="tm">deleted</text>
    <g stroke="currentColor" stroke-dasharray="3 3" opacity="0.5"><line x1="300" y1="58" x2="255" y2="90"/><line x1="300" y1="58" x2="345" y2="90"/></g>
    <text x="300" y="145" text-anchor="middle" class="tm">children deleted too</text>
    <text x="500" y="16" text-anchor="middle" font-weight="bold" font-size="12">SET NULL</text>
    <rect x="455" y="30" width="90" height="28" rx="4" class="fr sr" stroke-dasharray="4 3"/><text x="500" y="48" text-anchor="middle" class="tm">deleted</text>
    <rect x="415" y="90" width="80" height="26" rx="4" class="ft"/><text x="455" y="107" text-anchor="middle">fk = NULL</text>
    <rect x="505" y="90" width="80" height="26" rx="4" class="ft"/><text x="545" y="107" text-anchor="middle">fk = NULL</text>
    <text x="500" y="145" text-anchor="middle" class="tm">children kept, unlinked</text>
    </g>
  </svg><figcaption>What happens to child rows when you <code>DELETE</code> the parent row they point at.</figcaption></figure>
  <table class="tbl">
    <tr><th>Option</th><th>When the parent row is deleted</th><th>Use for</th></tr>
    <tr><td><code>NO ACTION</code> (default) / <code>RESTRICT</code></td><td>Delete is refused while children exist</td><td>Orders, payments: history must survive</td></tr>
    <tr><td><code>CASCADE</code></td><td>Children are deleted too</td><td>Data owned by the parent (reviews, line items)</td></tr>
    <tr><td><code>SET NULL</code> / <code>SET DEFAULT</code></td><td>Child FK is set to NULL / default</td><td>Optional links (an employee's manager leaves)</td></tr>
  </table>
  <p>Dia (customer 4) has no orders, so her delete is allowed, and <code>CASCADE</code> removes her review:</p>
  <div class="fx" data-lang="sql">INSERT INTO reviews (customer_id, product_id, rating) VALUES (4, 13, 4);
DELETE FROM customers WHERE customer_id = 4;   -- DELETE 1
SELECT review_id, customer_id, product_id, rating FROM reviews ORDER BY review_id;</div>
  <table class="tbl out"><caption>Result (Dia's review 6 is gone)</caption><tr><th>review_id</th><th>customer_id</th><th>product_id</th><th>rating</th></tr><tr><td>1</td><td>1</td><td>10</td><td>5</td></tr></table>
  <div class="callout trap"><span class="label">Trap: gaps in ids</span>
    <p>Dia's review got id 6, not 2: each failed insert above used up an identity value, and sequences never roll back. Ids are unique, not gap-free.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: FKs aren't indexed</span>
    <p>Postgres indexes PK and UNIQUE columns automatically, but not FK columns. Index them yourself for fast joins and parent deletes.</p>
  </div>

  <h2 id="sr-tools"><span class="num">08</span>psql &amp; Python</h2>
  <p>Two ways to talk to the database. <code>psql</code> is PostgreSQL's command-line tool: you type SQL, it prints the result, good for exploring. From Python you send the same SQL through a library and get rows back as Python objects, good for notebooks and pipelines.</p>
  <h3>psql essentials</h3>
  <p>Commands starting with a backslash are psql's own shortcuts, not SQL. The most useful one is <code>&#92;d</code>, which describes a table: its columns, types, and constraints, so you never have to guess a column name.</p>
  <table class="tbl">
    <tr><th>Command</th><th>Does</th></tr>
    <tr><td><code>psql -d shop</code></td><td>Connect to the <code>shop</code> database</td></tr>
    <tr><td><code>&#92;dt</code></td><td>List tables</td></tr>
    <tr><td><code>&#92;d customers</code></td><td>Columns, types, indexes, constraints of a table</td></tr>
    <tr><td><code>&#92;x</code></td><td>Toggle expanded display (one field per line)</td></tr>
  </table>
  <div class="fx" data-lang="text">shop=# &#92;d customers
                Table "public.customers"
   Column    |  Type   | Collation | Nullable | Default
-------------+---------+-----------+----------+---------
 customer_id | integer |           | not null |
 name        | text    |           | not null |
 city        | text    |           |          |
 signup_date | date    |           | not null |
Indexes:
    "customers_pkey" PRIMARY KEY, btree (customer_id)
Referenced by:
    TABLE "orders" CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(customer_id)

shop=# &#92;x
shop=# SELECT * FROM orders WHERE order_id = 102;
-[ RECORD 1 ]-----------
order_id    | 102
customer_id | 2
order_date  | 2024-06-02
status      | cancelled</div>
  <h3>Querying from Python</h3>
  <p>Two libraries appear below. <code>psycopg</code> is the low-level driver: it opens a connection and runs SQL, returning plain tuples. <code>pandas.read_sql</code> runs a query and hands you a DataFrame, which is what you want for analysis. In both, the value you want to filter on (3, or 100) is <em>not</em> pasted into the SQL text. It is passed separately, as a <strong>parameter</strong>, and the placeholder (<code>%s</code> or <code>:min</code>) marks where it goes. The next heading explains why that matters.</p>
  <div class="fx" data-lang="py">import psycopg                       # psycopg 3 (psycopg2 = older)
import pandas as pd
from sqlalchemy import create_engine, text

with psycopg.connect("dbname=shop") as conn:
    rows = conn.execute(
        "SELECT order_id, status FROM orders WHERE customer_id = %s ORDER BY order_id",
        (3,),                        # values sent separately
    ).fetchall()
print(rows)    # [(103, 'delivered'), (104, 'pending')]

engine = create_engine("postgresql+psycopg:///shop")
df = pd.read_sql(
    text("SELECT category, SUM(price) AS total FROM products "
         "WHERE price &gt; :min GROUP BY category ORDER BY category"),
    engine, params={"min": 100},
)
print(df)
#       category   total
# 0  Electronics  1300.0
# 1    Furniture   150.0</div>
  <p><code>total</code> came back as float64: pandas converts NUMERIC to float by default.</p>
  <h3>SQL injection</h3>
  <p>Your website has a search box: "find customer by name". The code builds the SQL by gluing the typed name into the string. A normal user types <code>Asha</code> and the query becomes <code>WHERE name = 'Asha'</code>. Fine. Now an attacker types something that <em>contains a quote mark and SQL</em>, so the glued string is no longer one value but new SQL that the database obediently runs. This is <strong>SQL injection</strong>, still one of the most common real-world attacks. A user types <code>x' OR '1'='1</code> as a name:</p>
  <div class="fx" data-lang="py">sql = "SELECT customer_id, name FROM customers WHERE name = '" + name + "'"   # NEVER
# becomes: ... WHERE name = 'x' OR '1'='1'</div>
  <table class="tbl out"><caption>Result of the injected query: every customer leaks</caption><tr><th>customer_id</th><th>name</th></tr><tr><td>1</td><td>Asha</td></tr><tr><td>2</td><td>Ben</td></tr><tr><td>3</td><td>Chen</td></tr><tr><td>4</td><td>Dia</td></tr></table>
  <p><code>'1'='1'</code> is always true, so the WHERE matches every row. With a parameter (<code>WHERE name = %s</code>, <code>(name,)</code>) the driver sends the typed text as a value, quotes and all. The database looks for a customer literally named <code>x' OR '1'='1</code>, finds none, and the query returns <code>[]</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>f-strings and <code>%</code> formatting are as unsafe as <code>+</code>. Parameters replace only <em>values</em>; user-chosen column names need an allow-list or <code>psycopg.sql.Identifier</code>.</p>
  </div>
  <h2 id="sr-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>orders</code> store <code>customer_id = 1</code> instead of the name "Asha"?</summary><div class="qa-body">So Asha's details live in exactly one place. If her city changes, one row in <code>customers</code> is updated and every order sees it. Storing the name would copy it into every order, and the copies could drift apart (the update anomaly).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Primary key vs UNIQUE constraint?</summary><div class="qa-body">Both block duplicates and create an index. One PK per table, always NOT NULL, the usual FK target. Many UNIQUE constraints allowed, and they accept NULLs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you model students and courses, where each student takes many courses?</summary><div class="qa-body">M:N, so a junction table: <code>enrollments(student_id FK, course_id FK, grade, PRIMARY KEY (student_id, course_id))</code>. Facts about the pair (grade, enrol date) live in the junction table. In shop, <code>order_items</code> is exactly this for orders ↔ products.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Natural or surrogate key for a users table?</summary><div class="qa-body">Surrogate (<code>BIGINT IDENTITY</code> or UUID) as the PK, with <code>UNIQUE NOT NULL</code> on email. Emails change; changing a PK means updating every FK that points to it. The UNIQUE still blocks duplicate accounts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens: <code>DELETE FROM customers WHERE customer_id = 1;</code> on the shop DB?</summary><div class="qa-body">It fails: <em>update or delete on table "customers" violates foreign key constraint "orders_customer_id_fkey"</em>. Asha has orders 100 and 101, and the FK has the default <code>NO ACTION</code>. Deleting Dia (no orders) would succeed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CASCADE vs RESTRICT vs SET NULL: when would you use each?</summary><div class="qa-body">CASCADE for child data meaningless without the parent (a user's saved settings). RESTRICT/NO ACTION when history must be kept (orders, payments). SET NULL for optional links (<code>manager_id</code> when the manager leaves).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not store prices as FLOAT?</summary><div class="qa-body">Floats are binary approximations: <code>0.1 + 0.2</code> gives <code>0.30000000000000004</code>, and summing <code>0.1</code> ten times gives <code>0.9999999999999999</code> in Postgres. Use <code>NUMERIC(p,s)</code> or store integer cents/paise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Classify each: TRUNCATE, GRANT, MERGE, SAVEPOINT, SELECT.</summary><div class="qa-body">TRUNCATE: DDL (removes all rows by resetting storage, not row by row). GRANT: DCL. MERGE: DML. SAVEPOINT: TCL. SELECT: DQL (some texts lump it into DML).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write Python to load all orders for a customer id typed by a user into a DataFrame, safely.</summary><div class="qa-body"><code>df = pd.read_sql(text("SELECT * FROM orders WHERE customer_id = :cid"), engine, params={"cid": int(user_input)})</code>. The value is sent as a bound parameter, so input like <code>1 OR 1=1</code> can't change the query (and <code>int()</code> rejects it outright).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A UNIQUE column on <code>email</code> already has a NULL. Can you insert another row with NULL email?</summary><div class="qa-body">Yes. NULL is "unknown", and two unknowns are not considered equal, so UNIQUE allows many NULLs. To prevent it, add <code>NOT NULL</code>, or use <code>UNIQUE NULLS NOT DISTINCT</code> in PostgreSQL 15+.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Into an empty table with an IDENTITY id, you insert three rows; the third fails a CHECK. The next successful insert gets id 4, not 3. Bug?</summary><div class="qa-body">No. Sequence values are handed out before validation and never returned, even on error or rollback (so concurrent inserts never wait). Ids are unique, not gap-free; don't count rows with <code>MAX(id)</code>.</div></details>
</main>`
});
