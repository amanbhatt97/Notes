// notes/databases/sql_relational.js — Relational Model & PostgreSQL
Object.assign(TOPIC_CONTENT, {
  "sql_relational": `<main>
  <h1>Relational Model &amp; PostgreSQL</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Relational Model &amp; PostgreSQL</span></div>
  <p class="lead">Before writing queries you need to know how data is arranged inside a relational database: why Biteful's one big sheet of orders is split into four tables, how the tables point at each other, which type each column gets, and which rules keep the data clean. This page builds that design step by step on the Biteful food-delivery database (customers, restaurants, orders, order_items), then covers the SQL command groups, why PostgreSQL, and how to query it from psql and Python without opening a security hole. Every query was run on PostgreSQL 16 against the Biteful database, and the output shown is the real output. <a class="xref" data-note="sql_fundamentals">Querying Basics</a> uses this exact database next.</p>

  <h2 id="sr-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="sr-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="69" y="41" text-anchor="middle" font-size="12">What is a DB</text><text x="69" y="58" text-anchor="middle" class="tm" font-size="10">why a DBMS exists</text>
<line x1="128" y1="45" x2="146" y2="45" stroke="currentColor" marker-end="url(#sr-a0)"/>
<rect x="148" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="207" y="41" text-anchor="middle" font-size="12">Types of DBs</text><text x="207" y="58" text-anchor="middle" class="tm" font-size="10">relational = default</text>
<line x1="266" y1="45" x2="284" y2="45" stroke="currentColor" marker-end="url(#sr-a0)"/>
<rect x="286" y="20" width="118" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="345" y="41" text-anchor="middle" font-size="12" font-weight="700">Relational model</text><text x="345" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="404" y1="45" x2="422" y2="45" stroke="currentColor" marker-end="url(#sr-a0)"/>
<rect x="424" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="483" y="41" text-anchor="middle" font-size="12">Querying basics</text><text x="483" y="58" text-anchor="middle" class="tm" font-size="10">SELECT … GROUP BY</text>
<line x1="542" y1="45" x2="560" y2="45" stroke="currentColor" marker-end="url(#sr-a0)"/>
<rect x="562" y="20" width="90" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="607" y="41" text-anchor="middle" font-size="12">JOINs …</text><text x="607" y="58" text-anchor="middle" class="tm" font-size="10">rebuild the sheet</text>
<text x="330" y="110" text-anchor="middle" class="tm" font-size="10.5">The four Biteful tables designed here are the ones every query on the next page runs on.</text>
<text x="330" y="127" text-anchor="middle" class="tm" font-size="10.5">Normalisation in depth: Data Modeling. Transactions in depth: Transactions &amp; Concurrency.</text>
</svg><figcaption>The SQL part of the track starts here: first the design of the tables, then the questions you ask them.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="db_types">Types of Databases</a></b><span>The relational database is Biteful's source of truth; every other store is a copy. <a class="xref" data-note="db_intro">What is a Database</a> showed it refusing bad rows and surviving crashes.</span></li>
    <li><b>This note adds: how to design the source of truth</b><span>Why one sheet becomes four tables, primary and foreign keys, the three relationship shapes, column types, constraints and what happens on delete, the SQL command groups, PostgreSQL, and safe access from psql and Python.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sql_fundamentals">Querying Basics</a></b><span>With the tables in place, you learn to ask them questions: SELECT, WHERE, GROUP BY, NULL logic, CASE, and writing data. Then <a class="xref" data-note="sql_joins">JOINs</a> stitch the tables back together and <a class="xref" data-note="sql_modeling">Data Modeling</a> formalises the design rules.</span></li>
  </ol>

  <h2 id="sr-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next question. Everything happens to Biteful's data.</p>
  <ol class="story">
    <li><b>The relational model</b><span>Q: why not keep Biteful in one big sheet? → Because facts repeat: "Asha, Pune" sits on 5 rows, so a move means 5 edits (update anomaly), Gita without orders can't exist (insert anomaly), and deleting order 105 deletes Dia (delete anomaly). Store each fact once, in its own table. But then how do the tables point at each other?</span></li>
    <li><b>Keys</b><span>Q: how does an order refer to "Asha" without copying her? → A primary key (customer_id 1, unique, never NULL) and a foreign key in orders that must match it. But how many orders per customer, how many restaurants per customer, and where does each key go?</span></li>
    <li><b>Relationships</b><span>Q: what shapes can links take? → 1:N (FK on the many side), 1:1 (FK + UNIQUE), M:N (a junction table: orders links customers and restaurants), and self-reference (referred_by). Now the full design can be drawn…</span></li>
    <li><b>The Biteful dataset</b><span>Q: what does the finished design look like? → 4 tables (7, 5, 10, 15 rows), an ER diagram, and deliberate quirks (Esha's NULL city, Gita with no orders, ties, a pending order). But each column must also say what it may hold…</span></li>
    <li><b>Data types</b><span>Q: what may a column hold, and does the choice matter? → NUMERIC for money (float gives 0.30000000000000004), TIMESTAMPTZ for events (the same instant read in New York), TEXT for strings. But a type can't say "rating 1 to 5" or "one review per restaurant"…</span></li>
    <li><b>Constraints</b><span>Q: which rules beyond type, and what happens to children when a parent is deleted? → NOT NULL, UNIQUE, CHECK, PK, FK, DEFAULT; ON DELETE RESTRICT / CASCADE / SET NULL. We have now used CREATE, INSERT, DELETE, BEGIN… what are these command families called?</span></li>
    <li><b>SQL sub-languages</b><span>Q: how are SQL commands grouped? → DDL shapes tables, DML changes rows, DQL reads, DCL grants, TCL bundles changes (a doubled price rolled back). But which DBMS runs this SQL, and do others speak it the same way?</span></li>
    <li><b>PostgreSQL &amp; dialects</b><span>Q: why PostgreSQL? → Open source, strict, extensible, standard SQL; others differ in dialect. Finally: how do we reach it from a terminal and from Python, safely?</span></li>
    <li><b>psql &amp; Python</b><span>Q: how do tools talk to the database? → psql's \\d describes a table; psycopg and pandas run queries with parameters, because gluing user text into SQL leaks every customer (SQL injection). Next: learn the queries themselves.</span></li>
  </ol>

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
            <ul><li>update: Asha moves, edit 5 rows</li><li>insert: Gita (no orders) can't exist</li><li>delete: drop order 105, Dia vanishes</li></ul></li>
          <li><b>Fix</b> — each fact once, linked by keys; JOIN rebuilds the wide view (normalization)</li>
          <li>💡 <b>Phone contacts</b> — number stored once, chats refer to it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keys</div>
        <ul>
          <li><b>PK</b> — unique + NOT NULL, one per table</li>
          <li><b>Candidate</b> — any minimal unique set; non-chosen ones get UNIQUE (restaurants.name)</li>
          <li><b>Composite</b> — 2+ columns: <code>order_items(order_id, item)</code></li>
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
          <li><b>M:N</b> — junction table with two FKs: <code>orders</code> links customers ↔ restaurants</li>
          <li><b>Pair facts</b> live in the junction: time, amount; <code>unit_price</code> = price paid at sale</li>
          <li><b>Self-reference</b> — <code>customers.referred_by → customer_id</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Biteful dataset quirks</div>
        <ul>
          <li><b>Chain</b> — customers → orders ← restaurants; orders → order_items; referred_by self-FK</li>
          <li><b>Esha</b> — NULL city → NULL tests</li>
          <li><b>Gita, Momo Magic</b> — no orders → LEFT JOIN, NOT EXISTS</li>
          <li><b>Ties</b> — ratings 4.2 = 4.2; amounts 260 = 260 → RANK vs ROW_NUMBER</li>
          <li><b>Status</b> — 7 delivered, 2 cancelled, 1 pending; minutes NULL for 4</li>
          <li><b>Masala Dosa</b> in 3 orders → join fan-out</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Types &amp; constraints</div>
        <ul>
          <li>⚠ <b>Money</b> → <code>NUMERIC</code>; float: 0.1 + 0.2 = 0.30000000000000004</li>
          <li>⚠ <b>Events</b> → <code>TIMESTAMPTZ</code> (absolute instant, stored UTC)</li>
          <li><b>Strings</b> → <code>TEXT</code>; <code>VARCHAR(n)</code> only for a real limit</li>
          <li><b>NOT NULL, UNIQUE, CHECK, PK, FK, DEFAULT</b> — enforced on every write</li>
          <li><b>ON DELETE</b> — NO ACTION/RESTRICT refuse · CASCADE deletes children · SET NULL unlinks</li>
          <li>⚠ UNIQUE allows many NULLs; identity ids have gaps; FK columns aren't auto-indexed</li>
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
        <div class="mm-title">PostgreSQL, psql &amp; Python</div>
        <ul>
          <li><b>Why</b> — open source, standard SQL, extensions (PostGIS, pgvector, TimescaleDB), JSONB</li>
          <li><b>psql</b> — <code>&#92;dt</code> tables, <code>&#92;d t</code> describe, <code>&#92;x</code> expanded</li>
          <li><b>psycopg 3</b> — <code>conn.execute(sql, (val,))</code> with <code>%s</code> placeholders</li>
          <li><b>pandas</b> — <code>pd.read_sql(text(...), engine, params=...)</code>; NUMERIC → float64</li>
          <li>⚠ <b>SQL injection</b> — <code>x' OR '1'='1</code> leaks all rows → bound parameters</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sr-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sr-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Relational Model</span><span class="rm-sub">Why tables beat one big sheet</span></div></div>
      <div class="rm-item rm-done" data-target="sr-keys"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Keys</span><span class="rm-sub">PK, FK, candidate, composite</span></div></div>
      <div class="rm-item rm-done" data-target="sr-rel"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Relationships</span><span class="rm-sub">1:N, 1:1, M:N, self</span></div></div>
      <div class="rm-item rm-done" data-target="sr-biteful"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Biteful Dataset</span><span class="rm-sub">Used on every foundation page</span></div></div>
      <div class="rm-item rm-done" data-target="sr-types"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Data Types &amp; Traps</span><span class="rm-sub">Money, time zones, strings</span></div></div>
      <div class="rm-item rm-done" data-target="sr-cons"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Constraints</span><span class="rm-sub">Rules the DB enforces</span></div></div>
      <div class="rm-item rm-done" data-target="sr-lang"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SQL Sub-languages</span><span class="rm-sub">DDL, DML, DQL, DCL, TCL</span></div></div>
      <div class="rm-item rm-done" data-target="sr-pg"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Why PostgreSQL</span><span class="rm-sub">And how other dialects differ</span></div></div>
      <div class="rm-item rm-done" data-target="sr-tools"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">psql &amp; Python</span><span class="rm-sub">Querying safely from code</span></div></div>
      <div class="rm-item rm-done" data-target="sr-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">From one sheet to a safe schema</span></div></div>
      <div class="rm-item rm-done" data-target="sr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sr-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sr-model"><span class="num">01</span>The Relational Model</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful began as one sheet with a row per dish ordered: order, customer, city, restaurant, dish, quantity, price. A database could store exactly that sheet as one table. Why doesn't it?</p>
  </div>
  <p>Here is the "one giant sheet" version of Asha's orders, rebuilt from Biteful's four tables (the <code>JOIN … USING</code> lines stitch the tables together; <a class="xref" data-note="sql_joins">JOINs</a> explains them):</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, c.city, r.name AS restaurant, oi.item, oi.qty, oi.unit_price
FROM orders o
JOIN customers c    USING (customer_id)
JOIN restaurants r  USING (restaurant_id)
JOIN order_items oi USING (order_id)
WHERE c.name = 'Asha'
ORDER BY o.order_id, oi.item;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer</th><th>city</th><th>restaurant</th><th>item</th><th>qty</th><th>unit_price</th></tr><tr><td>101</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr><tr><td>104</td><td>Asha</td><td>Pune</td><td>Pizza Point</td><td>Garlic Bread</td><td>1</td><td>100.00</td></tr><tr><td>104</td><td>Asha</td><td>Pune</td><td>Pizza Point</td><td>Margherita</td><td>1</td><td>280.00</td></tr><tr><td>110</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td><td>Filter Coffee</td><td>1</td><td>70.00</td></tr><tr><td>110</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr></table>
  <p>"Asha" and "Pune" are written on all five rows; "Dosa Hut" on three. If this were the <em>stored</em> form, it would suffer three <strong>anomalies</strong> (ways the data can go wrong):</p>
  <div class="cards">
    <div><b>Update</b><p>Asha moves to Mumbai: edit 5 rows. Miss one and the data says she lives in two cities.</p></div>
    <div><b>Insert</b><p>Gita signed up but hasn't ordered, so there is no row to put her on. She can't exist.</p></div>
    <div><b>Delete</b><p>Dia's only order (105) was cancelled; delete it and Dia disappears from the company.</p></div>
  </div>
  <p>Fix: store each fact <strong>once</strong>. Asha's city lives in one row of <code>customers</code>. Each order carries only her number, 1. When you need the wide view, a JOIN rebuilds it on the fly, as the query above did. Splitting data this way is called <strong>normalization</strong> (see <a class="xref" data-note="sql_modeling">Data Modeling</a>). The vocabulary, with plain meanings:</p>
  <ul>
    <li><strong>Relation</strong> = a table: a set of rows that all have the same columns. "Relational" comes from this maths word, not from "relationships".</li>
    <li><strong>Row</strong> (tuple): one fact, e.g. one order.</li>
    <li><strong>Column</strong> (attribute): one property with a <strong>type / domain</strong> (allowed values, e.g. <code>DATE</code>).</li>
    <li>Rows have <strong>no order</strong>: a table is a bag of facts, not a list. Without <code>ORDER BY</code>, output order isn't guaranteed.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your phone's contacts. A number is stored once; chats refer to the contact. Change it once and every chat updates.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>relational model</strong> stores data as relations (tables) of tuples (rows) over typed attributes (columns), each fact stored once, with relationships expressed by matching key values. An <strong>anomaly</strong> is an inconsistency caused by storing the same fact in several places (update), or by being unable to store one fact without another (insert, delete).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"The rows came back in id order, so tables are ordered." They came back in whatever order the plan produced; after updates, deletes or a parallel plan the order changes. If order matters, say <code>ORDER BY</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: keys.</b> Splitting the sheet means an order now stores "customer 1" instead of "Asha". That only works if every customer has a number nobody else has, and an order can never point at a number that doesn't exist.</div>

  <h2 id="sr-keys"><span class="num">02</span>Keys</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two customers could both be called "Asha". If an order stores a reference instead of a name, what makes that reference unique, and what stops it pointing at nobody?</p>
  </div>
  <p>A <strong>primary key</strong> is the column that identifies a row, like a roll number in a class. Two students can share a name, never a roll number. A <strong>foreign key</strong> is a column in one table that holds another table's primary key value: <code>orders.customer_id</code> holds a <code>customers.customer_id</code>. "Foreign" just means "belongs to another table". The database stores these keys as constraints; you can list them for Biteful's tables:</p>
  <div class="fx" data-lang="sql">SELECT conrelid::regclass AS table_name, conname AS constraint_name,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype IN ('p', 'f', 'u') AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, contype DESC, conname;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>table_name</th><th>constraint_name</th><th>definition</th></tr><tr><td>customers</td><td>customers_pkey</td><td>PRIMARY KEY (customer_id)</td></tr><tr><td>customers</td><td>customers_referred_by_fkey</td><td>FOREIGN KEY (referred_by) REFERENCES customers(customer_id)</td></tr><tr><td>order_items</td><td>order_items_pkey</td><td>PRIMARY KEY (order_id, item)</td></tr><tr><td>order_items</td><td>order_items_order_id_fkey</td><td>FOREIGN KEY (order_id) REFERENCES orders(order_id)</td></tr><tr><td>orders</td><td>orders_pkey</td><td>PRIMARY KEY (order_id)</td></tr><tr><td>orders</td><td>orders_customer_id_fkey</td><td>FOREIGN KEY (customer_id) REFERENCES customers(customer_id)</td></tr><tr><td>orders</td><td>orders_restaurant_id_fkey</td><td>FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)</td></tr><tr><td>restaurants</td><td>restaurants_name_key</td><td>UNIQUE (name)</td></tr><tr><td>restaurants</td><td>restaurants_pkey</td><td>PRIMARY KEY (restaurant_id)</td></tr></table>
  <p>Read it table by table. <code>customers</code> has a primary key and a foreign key into <em>itself</em> (<code>referred_by</code>, section 03). <code>restaurants</code> has a primary key and a UNIQUE name (a second candidate key). <code>orders</code> has its primary key plus two foreign keys. <code>order_items</code> has a two-column (composite) primary key and a foreign key to <code>orders</code>.</p>
  <table class="tbl">
    <tr><th>Key</th><th>Meaning</th><th>Biteful example</th></tr>
    <tr><td><strong>Primary key (PK)</strong></td><td>The column(s) that uniquely identify a row. Unique and NOT NULL. One per table.</td><td><code>customers.customer_id</code></td></tr>
    <tr><td><strong>Candidate key</strong></td><td>Any minimal column set that could be the PK. You pick one; the rest get UNIQUE.</td><td><code>restaurants.name</code> (UNIQUE)</td></tr>
    <tr><td><strong>Composite key</strong></td><td>A key made of 2+ columns together</td><td><code>order_items (order_id, item)</code>: Masala Dosa may appear in many orders, but once per order</td></tr>
    <tr><td><strong>Foreign key (FK)</strong></td><td>A column that must match a PK (or UNIQUE) value in another table</td><td><code>orders.customer_id → customers</code></td></tr>
    <tr><td><strong>Natural</strong> vs <strong>surrogate</strong></td><td>Real-world id vs meaningless generated id</td><td>a phone number vs <code>customer_id</code></td></tr>
  </table>
  <p>The FK is checked on every write: <a class="xref" data-note="db_intro">What is a Database</a> showed an order for customer 99 being refused with "Key (customer_id)=(99) is not present in table customers".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Roll numbers and the attendance register. Every student has one roll number (PK); the register writes roll numbers, never names (FK), and the class teacher refuses to mark roll number 99 present if there is no such student.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>primary key</strong> is a minimal set of columns whose values are unique and non-NULL for every row. A <strong>foreign key</strong> is a set of columns whose values must equal the key of some row in the referenced table (or be NULL). Together they give <strong>referential integrity</strong>: no reference points at nothing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: natural keys change</span>
    <p>Phone numbers and emails change; real-world codes get reused or mistyped. Use a surrogate PK plus UNIQUE on the natural key: stable joins <em>and</em> no duplicates.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: relationships.</b> Keys say how one row points at another. But where should the foreign key go? Does the customer hold a list of orders, or does each order hold its customer? And what about customers and restaurants, where each side has many of the other?</div>

  <h2 id="sr-rel"><span class="num">03</span>Relationships</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>One cell holds one value. A customer has many orders, a restaurant has many customers, and a customer has many restaurants. Where do the keys go so that no cell ever needs a list?</p>
  </div>
  <p>Ask of any two tables: how many of B can one A have, and how many of A can one B have?</p>
  <ul>
    <li>One customer places many orders; one order belongs to one customer. <strong>One-to-many (1:N)</strong>. Same for restaurant → orders and order → order_items.</li>
    <li>One customer has one loyalty profile; one profile belongs to one customer. <strong>One-to-one (1:1)</strong> (not in Biteful's four tables, but common).</li>
    <li>One customer orders from many restaurants; one restaurant serves many customers. <strong>Many-to-many (M:N)</strong>.</li>
  </ul>
  <p>1:N and 1:1 need one foreign key column on the "many" (or dependent) side. M:N can't be done with one column: a customer can't hold a list of restaurants in one cell, and a restaurant can't hold a list of customers. So a third table holds one row per pair. In Biteful that table already exists: <strong><code>orders</code> is the junction between customers and restaurants</strong>, and it carries facts about each pair (when, status, amount).</p>
  <figure class="viz"><svg viewBox="0 0 600 175" width="600">
    <g font-size="10">
    <text x="95" y="14" text-anchor="middle" font-weight="bold" font-size="12" class="tb">1 : N</text>
    <rect x="10" y="62" width="60" height="28" rx="4" class="fb sb"/><text x="40" y="80" text-anchor="middle">Asha</text>
    <rect x="120" y="22" width="60" height="24" rx="4" class="ft"/><text x="150" y="38" text-anchor="middle">ord 101</text>
    <rect x="120" y="64" width="60" height="24" rx="4" class="ft"/><text x="150" y="80" text-anchor="middle">ord 104</text>
    <rect x="120" y="106" width="60" height="24" rx="4" class="ft"/><text x="150" y="122" text-anchor="middle">ord 110</text>
    <g stroke="currentColor"><line x1="70" y1="76" x2="120" y2="34"/><line x1="70" y1="76" x2="120" y2="76"/><line x1="70" y1="76" x2="120" y2="118"/></g>
    <text x="300" y="14" text-anchor="middle" font-weight="bold" font-size="12" class="tb">1 : 1</text>
    <rect x="215" y="62" width="60" height="28" rx="4" class="fb sb"/><text x="245" y="80" text-anchor="middle">Asha</text>
    <rect x="325" y="62" width="60" height="28" rx="4" class="ft"/><text x="355" y="80" text-anchor="middle">profile</text>
    <line x1="275" y1="76" x2="325" y2="76" stroke="currentColor"/>
    <text x="505" y="14" text-anchor="middle" font-weight="bold" font-size="12" class="tb">M : N</text>
    <rect x="405" y="38" width="44" height="24" rx="4" class="fb sb"/><text x="427" y="54" text-anchor="middle">Asha</text>
    <rect x="405" y="98" width="44" height="24" rx="4" class="fb sb"/><text x="427" y="114" text-anchor="middle">Chen</text>
    <rect x="466" y="26" width="64" height="20" rx="3" class="fv"/><text x="498" y="40" text-anchor="middle">101│10</text>
    <rect x="466" y="54" width="64" height="20" rx="3" class="fv"/><text x="498" y="68" text-anchor="middle">104│12</text>
    <rect x="466" y="86" width="64" height="20" rx="3" class="fv"/><text x="498" y="100" text-anchor="middle">103│12</text>
    <rect x="466" y="114" width="64" height="20" rx="3" class="fv"/><text x="498" y="128" text-anchor="middle">108│10</text>
    <rect x="545" y="40" width="52" height="20" rx="3" class="fg"/><text x="571" y="54" text-anchor="middle" font-size="9">Dosa Hut</text>
    <rect x="545" y="100" width="52" height="20" rx="3" class="fg"/><text x="571" y="114" text-anchor="middle" font-size="9">Pizza Pt</text>
    <g stroke="currentColor"><line x1="449" y1="50" x2="466" y2="36"/><line x1="449" y1="50" x2="466" y2="64"/><line x1="449" y1="110" x2="466" y2="96"/><line x1="449" y1="110" x2="466" y2="124"/>
    <line x1="530" y1="36" x2="545" y2="50"/><line x1="530" y1="64" x2="545" y2="110"/><line x1="530" y1="96" x2="545" y2="110"/><line x1="530" y1="124" x2="545" y2="50"/></g>
    <text x="95" y="160" text-anchor="middle" class="tm">FK on the "many" side</text>
    <text x="300" y="160" text-anchor="middle" class="tm">FK + UNIQUE</text>
    <text x="505" y="160" text-anchor="middle" class="tm">junction: orders (order│restaurant)</text>
    </g>
  </svg><figcaption>M:N can't be one FK; the junction table (here, orders) holds one row per (customer, restaurant) visit. Asha and Chen have both ordered from Dosa Hut and Pizza Point.</figcaption></figure>
  <table class="tbl">
    <tr><th>Shape</th><th>How it's built</th><th>Biteful example</th></tr>
    <tr><td><strong>1:N</strong></td><td>FK on the "many" side</td><td>customer → orders (<code>orders.customer_id</code>); order → items (<code>order_items.order_id</code>)</td></tr>
    <tr><td><strong>1:1</strong></td><td>FK that is also UNIQUE (or shares the PK)</td><td>a <code>loyalty_profiles.customer_id</code> UNIQUE (hypothetical)</td></tr>
    <tr><td><strong>M:N</strong></td><td>A <strong>junction table</strong> with two FKs</td><td>customers ↔ restaurants via <code>orders</code></td></tr>
    <tr><td><strong>Self-reference</strong></td><td>FK pointing at the same table's PK</td><td><code>customers.referred_by → customers.customer_id</code></td></tr>
  </table>
  <p>To answer "which customers have ordered from Pizza Point?" start from the restaurant, go through the junction, and out to the customers:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, o.status
FROM restaurants r
JOIN orders o    ON o.restaurant_id = r.restaurant_id
JOIN customers c ON c.customer_id = o.customer_id
WHERE r.name = 'Pizza Point'
ORDER BY o.order_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer</th><th>status</th></tr><tr><td>103</td><td>Chen</td><td>delivered</td></tr><tr><td>104</td><td>Asha</td><td>delivered</td></tr><tr><td>107</td><td>Esha</td><td>cancelled</td></tr></table>
  <p>Trace it in the orders table: restaurant 12 appears on orders 103 (customer 3, Chen), 104 (customer 1, Asha) and 107 (customer 5, Esha). The self-reference works the same way, except both sides are <code>customers</code>; give the table two short names so you can tell the two roles apart:</p>
  <div class="fx" data-lang="sql">SELECT c.name AS customer, ref.name AS referred_by
FROM customers c
JOIN customers ref ON ref.customer_id = c.referred_by
ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer</th><th>referred_by</th></tr><tr><td>Ben</td><td>Asha</td></tr><tr><td>Chen</td><td>Asha</td></tr><tr><td>Farah</td><td>Ben</td></tr></table>
  <p>Only three customers came through a referral; the other four have <code>referred_by</code> NULL and drop out of this join. <code>unit_price</code> in <code>order_items</code> is copied on purpose: prices change, and the price paid is a fact about <em>that sale</em>. If Masala Dosa becomes ₹130 next month, Asha's old bill must still say ₹120.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school: one class teacher has many students (1:N, the student's form names the teacher); each student has one ID card (1:1); students and clubs are M:N, so the school keeps a separate membership register with one line per (student, club), plus facts like the joining date.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cardinality</strong> is how many rows of one table can relate to one row of another: 1:1, 1:N or M:N. A <strong>junction</strong> (bridge, associative) table resolves an M:N relationship into two 1:N relationships and holds attributes of the pair.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Storing a list in a cell (<code>restaurants_ordered = '10,12'</code>) to avoid a junction table. You can't index it, join on it, or enforce that 12 exists. Every M:N becomes a junction table.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Biteful dataset.</b> We have all the pieces (tables, keys, shapes). Let's see the complete design and every row, so every later query can be checked by hand.</div>

  <h2 id="sr-biteful"><span class="num">04</span>The Biteful Dataset</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have seen pieces of Biteful's tables. What is the complete design, and which rows are in it, so that every answer on the next pages can be checked by hand?</p>
  </div>
  <p>This is <strong>the dataset of the four foundation pages</strong> (What is a Database, Types of Databases, this page, Querying Basics): a tiny food-delivery company with seven customers, five restaurants, ten orders and fifteen order lines. It is small enough to check every answer by hand, and it has a few deliberate oddities (listed at the end) that make interview traps visible. The diagram below is an <strong>entity-relationship diagram</strong> (ERD): one box per table, PK = primary key, FK = foreign key, and a line for each foreign-key link.</p>
  <figure class="viz"><svg viewBox="0 0 600 260" width="600">
    <defs><marker id="sr-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
      <rect x="5" y="20" width="125" height="108" rx="6" class="fs"/><rect x="5" y="20" width="125" height="20" rx="6" class="fb"/>
      <text x="67" y="34" text-anchor="middle" font-weight="bold" font-size="11">customers</text>
      <text x="12" y="56" class="tb">PK customer_id</text><text x="12" y="72">name</text><text x="12" y="88">city</text><text x="12" y="104">signup_date</text><text x="12" y="120" class="tg">FK referred_by</text>
      <rect x="175" y="20" width="135" height="140" rx="6" class="fs"/><rect x="175" y="20" width="135" height="20" rx="6" class="fv"/>
      <text x="242" y="34" text-anchor="middle" font-weight="bold" font-size="11">orders</text>
      <text x="182" y="56" class="tb">PK order_id</text><text x="182" y="72" class="tg">FK customer_id</text><text x="182" y="88" class="tg">FK restaurant_id</text><text x="182" y="104">ordered_at</text><text x="182" y="120">status</text><text x="182" y="136">amount</text><text x="182" y="152">delivery_minutes</text>
      <rect x="355" y="20" width="115" height="108" rx="6" class="fs"/><rect x="355" y="20" width="115" height="20" rx="6" class="fb"/>
      <text x="412" y="34" text-anchor="middle" font-weight="bold" font-size="11">restaurants</text>
      <text x="361" y="56" class="tb">PK restaurant_id</text><text x="361" y="72">name (UNIQUE)</text><text x="361" y="88">city</text><text x="361" y="104">cuisine</text><text x="361" y="120">rating</text>
      <rect x="175" y="190" width="135" height="66" rx="6" class="fs"/><rect x="175" y="190" width="135" height="20" rx="6" class="ft"/>
      <text x="242" y="204" text-anchor="middle" font-weight="bold" font-size="11">order_items</text>
      <text x="182" y="224" class="tg">PK,FK order_id</text><text x="182" y="238" class="tb">PK item</text><text x="182" y="252">qty, unit_price</text>
      <g stroke="currentColor" fill="none"><line x1="130" y1="68" x2="175" y2="68"/><line x1="310" y1="84" x2="355" y2="84"/><line x1="242" y1="160" x2="242" y2="190"/></g>
      <g font-size="11" font-weight="bold" class="tr"><text x="134" y="63">1</text><text x="164" y="63">N</text><text x="317" y="79">N</text><text x="345" y="79">1</text><text x="248" y="172">1</text><text x="248" y="188">N</text></g>
      <path d="M5,116 C-20,116 -20,52 3,52" fill="none" stroke="currentColor" marker-end="url(#sr-ar1)"/>
      <text x="400" y="170" class="tm">orders = M:N bridge customers ↔ restaurants</text>
      <text x="400" y="186" class="tm">order_items = 1:N child of orders</text>
      <text x="400" y="202" class="tm">referred_by = self-referencing FK</text>
    </g>
  </svg><figcaption>Read "1 … N" as "one customer has many orders". orders bridges customers and restaurants; order_items hangs off orders; customers points at itself.</figcaption></figure>
  <div class="fx" data-lang="sql">SELECT * FROM customers;</div>
  <table class="tbl out"><caption>customers</caption><tr><th>customer_id</th><th>name</th><th>city</th><th>signup_date</th><th>referred_by</th></tr><tr><td>1</td><td>Asha</td><td>Pune</td><td>2026-01-05</td><td>NULL</td></tr><tr><td>2</td><td>Ben</td><td>Mumbai</td><td>2026-01-12</td><td>1</td></tr><tr><td>3</td><td>Chen</td><td>Pune</td><td>2026-02-03</td><td>1</td></tr><tr><td>4</td><td>Dia</td><td>Mumbai</td><td>2026-02-20</td><td>NULL</td></tr><tr><td>5</td><td>Esha</td><td>NULL</td><td>2026-03-01</td><td>NULL</td></tr><tr><td>6</td><td>Farah</td><td>Mumbai</td><td>2026-03-02</td><td>2</td></tr><tr><td>7</td><td>Gita</td><td>Pune</td><td>2026-03-04</td><td>NULL</td></tr></table>
  <div class="fx" data-lang="sql">SELECT * FROM restaurants;</div>
  <table class="tbl out"><caption>restaurants</caption><tr><th>restaurant_id</th><th>name</th><th>city</th><th>cuisine</th><th>rating</th></tr><tr><td>10</td><td>Dosa Hut</td><td>Pune</td><td>South Indian</td><td>4.5</td></tr><tr><td>11</td><td>Biryani Bros</td><td>Mumbai</td><td>Biryani</td><td>4.2</td></tr><tr><td>12</td><td>Pizza Point</td><td>Pune</td><td>Pizza</td><td>3.9</td></tr><tr><td>13</td><td>Green Bowl</td><td>Mumbai</td><td>Healthy</td><td>4.2</td></tr><tr><td>14</td><td>Momo Magic</td><td>Pune</td><td>Tibetan</td><td>NULL</td></tr></table>
  <div class="fx" data-lang="sql">SELECT * FROM orders;</div>
  <table class="tbl out"><caption>orders</caption><tr><th>order_id</th><th>customer_id</th><th>restaurant_id</th><th>ordered_at</th><th>status</th><th>amount</th><th>delivery_minutes</th></tr><tr><td>101</td><td>1</td><td>10</td><td>2026-03-02 12:10:00+05:30</td><td>delivered</td><td>240.00</td><td>32</td></tr><tr><td>102</td><td>2</td><td>11</td><td>2026-03-02 13:05:00+05:30</td><td>delivered</td><td>450.00</td><td>41</td></tr><tr><td>103</td><td>3</td><td>12</td><td>2026-03-02 20:30:00+05:30</td><td>delivered</td><td>520.00</td><td>38</td></tr><tr><td>104</td><td>1</td><td>12</td><td>2026-03-03 13:15:00+05:30</td><td>delivered</td><td>380.00</td><td>NULL</td></tr><tr><td>105</td><td>4</td><td>13</td><td>2026-03-03 19:45:00+05:30</td><td>cancelled</td><td>310.00</td><td>NULL</td></tr><tr><td>106</td><td>2</td><td>11</td><td>2026-03-04 12:40:00+05:30</td><td>delivered</td><td>180.00</td><td>25</td></tr><tr><td>107</td><td>5</td><td>12</td><td>2026-03-04 21:10:00+05:30</td><td>cancelled</td><td>260.00</td><td>NULL</td></tr><tr><td>108</td><td>3</td><td>10</td><td>2026-03-05 18:20:00+05:30</td><td>delivered</td><td>260.00</td><td>29</td></tr><tr><td>109</td><td>6</td><td>11</td><td>2026-03-05 20:05:00+05:30</td><td>delivered</td><td>600.00</td><td>52</td></tr><tr><td>110</td><td>1</td><td>10</td><td>2026-03-08 20:50:00+05:30</td><td>pending</td><td>310.00</td><td>NULL</td></tr></table>
  <div class="fx" data-lang="sql">SELECT * FROM order_items;</div>
  <table class="tbl out"><caption>order_items (PK: order_id, item)</caption><tr><th>order_id</th><th>item</th><th>qty</th><th>unit_price</th></tr><tr><td>101</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr><tr><td>102</td><td>Chicken Biryani</td><td>1</td><td>350.00</td></tr><tr><td>102</td><td>Raita</td><td>2</td><td>50.00</td></tr><tr><td>103</td><td>Farmhouse Pizza</td><td>2</td><td>260.00</td></tr><tr><td>104</td><td>Margherita</td><td>1</td><td>280.00</td></tr><tr><td>104</td><td>Garlic Bread</td><td>1</td><td>100.00</td></tr><tr><td>105</td><td>Buddha Bowl</td><td>1</td><td>310.00</td></tr><tr><td>106</td><td>Veg Biryani</td><td>1</td><td>180.00</td></tr><tr><td>107</td><td>Farmhouse Pizza</td><td>1</td><td>260.00</td></tr><tr><td>108</td><td>Masala Dosa</td><td>1</td><td>120.00</td></tr><tr><td>108</td><td>Filter Coffee</td><td>2</td><td>70.00</td></tr><tr><td>109</td><td>Chicken Biryani</td><td>1</td><td>350.00</td></tr><tr><td>109</td><td>Mutton Kebab</td><td>1</td><td>250.00</td></tr><tr><td>110</td><td>Masala Dosa</td><td>2</td><td>120.00</td></tr><tr><td>110</td><td>Filter Coffee</td><td>1</td><td>70.00</td></tr></table>
  <p>One more design choice to notice: <code>orders.amount</code> is the bill total and always equals the sum of <code>qty × unit_price</code> of its lines (order 102: 1 × 350 + 2 × 50 = 450). Storing it is a deliberate snapshot, like <code>unit_price</code>; the next pages use it so that single-table questions are possible before joins.</p>
  <div class="callout pred"><span class="label">Quirks to remember</span>
    <p>Esha has a <strong>NULL city</strong> (NULL tests). Gita and Momo Magic have <strong>no orders</strong> (LEFT JOIN, NOT EXISTS). Momo Magic has a <strong>NULL rating</strong>. Biryani Bros and Green Bowl <strong>tie</strong> at 4.2, orders 107 and 108 tie at ₹260 (RANK vs ROW_NUMBER). Orders 105 and 107 are <strong>cancelled</strong>, 110 is <strong>pending</strong> (filtering). <code>delivery_minutes</code> is NULL for 104 (delivered but not recorded), 105, 107 and 110 (AVG ignores NULLs). Order 110 is late on <strong>8 March</strong> (the timestamp BETWEEN trap). Masala Dosa is in <strong>three orders</strong> (fan-out in joins). Asha referred Ben and Chen; Ben referred Farah (self-reference).</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A practice cricket pitch with a few marked danger spots. Small enough to walk in a minute, with exactly the bumps you need to learn every kind of delivery.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>entity-relationship diagram</strong> shows entities (tables) with their attributes and keys, and the relationships between them with their cardinality. A <strong>schema</strong> is the set of table definitions (columns, types, keys, constraints) behind it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Learning SQL on a dataset with no NULLs, no ties and no empty groups. Real data always has them, and every classic interview trap (NOT IN with NULL, COUNT(*) vs COUNT(col), LIMIT with ties) is invisible without them. That is why Biteful has them on purpose.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: data types.</b> The design says which columns exist. It doesn't yet justify why <code>amount</code> is NUMERIC and not a float, or why <code>ordered_at</code> carries "+05:30". Does the type of a column really matter?</div>

  <h2 id="sr-types"><span class="num">05</span>Data Types &amp; Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every column needs a type. Many types look interchangeable (FLOAT vs NUMERIC, TIMESTAMP vs TIMESTAMPTZ, TEXT vs VARCHAR). Do the differences ever change an answer?</p>
  </div>
  <p>A <strong>type</strong> does two jobs. It rejects nonsense ("abc" in an amount column), and it tells the database how to store and compare the value (dates sort as dates, not as text). Choosing the wrong type is a quiet bug: the data goes in fine and the answers come out slightly wrong.</p>
  <table class="tbl">
    <tr><th>Need</th><th>Use</th><th>Biteful column</th><th>Note</th></tr>
    <tr><td>Whole numbers / ids</td><td><code>INTEGER</code>, <code>BIGINT</code></td><td><code>order_id</code>, <code>qty</code></td><td>Generated ids: <code>GENERATED ALWAYS AS IDENTITY</code> (modern <code>SERIAL</code>)</td></tr>
    <tr><td>Money, exact decimals</td><td><code>NUMERIC(p,s)</code></td><td><code>amount NUMERIC(8,2)</code></td><td>Exact, slower; (8,2) = up to 8 digits, 2 after the point</td></tr>
    <tr><td>Measurements, ML scores</td><td><code>REAL</code>, <code>DOUBLE PRECISION</code></td><td>(model scores)</td><td>Fast, approximate</td></tr>
    <tr><td>Text</td><td><code>TEXT</code></td><td><code>name</code>, <code>status</code></td><td><code>VARCHAR(n)</code> only to enforce a real limit</td></tr>
    <tr><td>Dates and times</td><td><code>DATE</code>, <code>TIMESTAMPTZ</code>, <code>INTERVAL</code></td><td><code>signup_date</code>, <code>ordered_at</code></td><td>Prefer TIMESTAMPTZ for events</td></tr>
    <tr><td>Flags, ids, documents</td><td><code>BOOLEAN</code>, <code>UUID</code>, <code>JSONB</code>, arrays</td><td>(menus as JSONB)</td><td>JSONB over JSON (indexable)</td></tr>
  </table>
  <h3>Trap 1: FLOAT for money</h3>
  <p>A computer stores a <strong>float</strong> in binary (base 2). Just as 1/3 can't be written exactly in decimal (0.3333…), 0.1 can't be written exactly in binary. The stored value is a hair off, and the error shows up when you add. <code>NUMERIC</code> stores the decimal digits as you typed them, so it is exact. (<code>::float8</code> and <code>::numeric</code> force a value to that type.)</p>
  <div class="fx" data-lang="sql">SELECT 0.1::float8 + 0.2::float8 = 0.3 AS float_ok,
       0.1::numeric + 0.2::numeric = 0.3 AS numeric_ok,
       0.1::float8 + 0.2::float8         AS float_sum;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>float_ok</th><th>numeric_ok</th><th>float_sum</th></tr><tr><td>f</td><td>t</td><td>0.30000000000000004</td></tr></table>
  <p>Add ten ₹0.10 tips and the gap is visible:</p>
  <div class="fx" data-lang="sql">SELECT SUM(0.1::float8) AS float_sum, SUM(0.1::numeric) AS numeric_sum FROM generate_series(1, 10);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>float_sum</th><th>numeric_sum</th></tr><tr><td>0.9999999999999999</td><td>1.0</td></tr></table>
  <p>Floats are binary approximations; errors pile up in sums. Money → <code>NUMERIC</code> (or whole numbers of paise); measurements and ML scores → float, where speed matters and the last digit doesn't. That is why Biteful's <code>amount</code> and <code>unit_price</code> are <code>NUMERIC(8,2)</code>.</p>
  <h3>Trap 2: TIMESTAMP vs TIMESTAMPTZ</h3>
  <p>A friend in New York texts "call me at 10:00". 10:00 where? Without the time zone the message is ambiguous. Databases have the same problem. <code>TIMESTAMP</code> is a wall-clock reading with no zone: just "10:00". <code>TIMESTAMPTZ</code> (timestamp with time zone) stores an absolute instant: it converts your input to UTC (the world reference time) on the way in, and converts back to whatever zone the viewer's session uses on the way out. Biteful's order 101 was placed at 12:10 in Pune. Read the same row in a Kolkata session and a New York session:</p>
  <div class="fx" data-lang="sql">SET timezone = 'Asia/Kolkata';
SELECT order_id, ordered_at, ordered_at::timestamp AS wall_clock FROM orders WHERE order_id = 101;
SET timezone = 'America/New_York';
SELECT order_id, ordered_at, ordered_at::timestamp AS wall_clock FROM orders WHERE order_id = 101;</div>
  <table class="tbl out"><caption>Kolkata session</caption><tr><th>order_id</th><th>ordered_at</th><th>wall_clock</th></tr><tr><td>101</td><td>2026-03-02 12:10:00+05:30</td><td>2026-03-02 12:10:00</td></tr></table>
  <table class="tbl out"><caption>New York session</caption><tr><th>order_id</th><th>ordered_at</th><th>wall_clock</th></tr><tr><td>101</td><td>2026-03-02 01:40:00-05</td><td>2026-03-02 01:40:00</td></tr></table>
  <p>Both rows are the same instant: 12:10 in Kolkata (+05:30) is 01:40 in New York (−05:00, early March is before US daylight saving). The <code>wall_clock</code> column, cast to plain <code>TIMESTAMP</code>, has lost the zone: it shows whatever the session's clock said, and nothing in it tells you which city that was.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>TIMESTAMPTZ</code> doesn't store the zone; it converts to UTC on input and to the session zone on output. Use plain <code>TIMESTAMP</code> only for zone-less facts like "restaurant opens at 09:00".</p>
  </div>
  <h3>Trap 3: TEXT vs VARCHAR(n)</h3>
  <p>In PostgreSQL they perform the same. <code>VARCHAR(n)</code> only adds a length check:</p>
  <div class="fx" data-lang="sql">INSERT INTO v VALUES ('ABCD');</div>
  <div class="fx" data-lang="text">ERROR:  value too long for type character varying(3)</div>
  <p>(Table <code>v</code> has one column <code>code VARCHAR(3)</code>.) Default to <code>TEXT</code>; add a limit only for a real rule (3-letter currency codes). Avoid <code>CHAR(n)</code>: it pads with spaces.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A type is the shape of a slot in a coin sorter: the ₹5 slot rejects buttons, and coins come out already sorted by value. Pick the wrong slot size and coins jam silently.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A column's <strong>data type</strong> (domain) fixes the set of allowed values and their storage, comparison and arithmetic. <code>NUMERIC(p,s)</code> is exact decimal with p total digits and s after the point; <code>DOUBLE PRECISION</code> is a 64-bit binary float; <code>TIMESTAMPTZ</code> is an absolute instant.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: constraints.</b> A type can say "a small integer", but not "a rating from 1 to 5", "one review per customer per restaurant", or "this customer must exist". And what should happen to Asha's orders if someone deletes Asha?</div>

  <h2 id="sr-cons"><span class="num">06</span>Constraints</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful adds restaurant reviews. The app checks that a rating is between 1 and 5 before saving it. Then a colleague writes a quick Python script that inserts ratings directly, and a 7 slips in: the app's check never ran. Where should such rules live?</p>
  </div>
  <p>A <strong>constraint</strong> is a rule stored <em>in the table itself</em>, so the database enforces it on every write, whichever app or script sends it. The six kinds: <code>NOT NULL</code> (value required), <code>UNIQUE</code> (no repeats), <code>CHECK</code> (any condition), <code>PRIMARY KEY</code>, <code>FOREIGN KEY</code> (<code>REFERENCES</code>), and <code>DEFAULT</code> (value to use when none is given). Here is Biteful's new <code>reviews</code> table, then one attempt to break each rule:</p>
  <div class="fx" data-lang="sql">CREATE TABLE reviews (
  review_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id   INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  restaurant_id INT NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE RESTRICT,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, restaurant_id)          -- one review per customer per restaurant
);
INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (1, 10, 5);
INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (1, 10, 4);
INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (2, 11, 7);
INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (99, 11, 3);
INSERT INTO reviews (customer_id, restaurant_id) VALUES (2, 11);
DELETE FROM customers WHERE customer_id = 1;
DELETE FROM customers WHERE customer_id = 4;</div>
  <div class="fx" data-lang="text">CREATE TABLE
INSERT 0 1
ERROR:  duplicate key value violates unique constraint "reviews_customer_id_restaurant_id_key"
DETAIL:  Key (customer_id, restaurant_id)=(1, 10) already exists.
ERROR:  new row for relation "reviews" violates check constraint "reviews_rating_check"
DETAIL:  Failing row contains (3, 2, 11, 7, null, 2026-10-20 05:24:39.008409+05:30).
ERROR:  insert or update on table "reviews" violates foreign key constraint "reviews_customer_id_fkey"
DETAIL:  Key (customer_id)=(99) is not present in table "customers".
ERROR:  null value in column "rating" of relation "reviews" violates not-null constraint
DETAIL:  Failing row contains (5, 2, 11, null, null, 2026-10-20 05:24:39.008779+05:30).
ERROR:  update or delete on table "customers" violates foreign key constraint "customers_referred_by_fkey" on table "customers"
DETAIL:  Key (customer_id)=(1) is still referenced from table "customers".
ERROR:  update or delete on table "customers" violates foreign key constraint "orders_customer_id_fkey" on table "orders"
DETAIL:  Key (customer_id)=(4) is still referenced from table "orders".</div>
  <p>Read the table definition line by line: <code>review_id</code> is generated automatically (an <strong>identity</strong> column, 1, 2, 3…); <code>customer_id</code> must exist in <code>customers</code> and, if that customer is deleted, the review goes too (<code>CASCADE</code>); <code>restaurant_id</code> must exist and blocks deleting the restaurant (<code>RESTRICT</code>); rating must be 1 to 5; <code>created_at</code> fills itself with the current time; and one customer may review one restaurant only once. Then the output, line by line: the first review is accepted (<code>INSERT 0 1</code>); a second review of Dosa Hut by Asha breaks UNIQUE; a 7 breaks the CHECK; customer 99 breaks the FOREIGN KEY; a missing rating breaks NOT NULL. The two DELETEs are refused by foreign keys pointing <em>into</em> customers: Asha is still referenced by Ben's and Chen's <code>referred_by</code> (her orders 101, 104, 110 would block it too), and Dia by her order 105.</p>
  <h3>ON DELETE behaviour</h3>
  <p>That last error raises a question. If you delete a customer, what happens to rows that point at them? They would point at nothing. The foreign key must say what to do, and there are three answers:</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <g font-size="10">
    <text x="100" y="16" text-anchor="middle" font-weight="bold" font-size="12">RESTRICT / NO ACTION</text>
    <rect x="55" y="30" width="90" height="28" rx="4" class="fb sb"/><text x="100" y="48" text-anchor="middle">customer 1</text>
    <rect x="15" y="90" width="80" height="26" rx="4" class="ft"/><text x="55" y="107" text-anchor="middle">order 101</text>
    <rect x="105" y="90" width="80" height="26" rx="4" class="ft"/><text x="145" y="107" text-anchor="middle">order 104</text>
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
    <tr><td><code>CASCADE</code></td><td>Children are deleted too</td><td>Data owned by the parent (reviews, order lines)</td></tr>
    <tr><td><code>SET NULL</code> / <code>SET DEFAULT</code></td><td>Child FK is set to NULL / default</td><td>Optional links (<code>referred_by</code> when the referrer leaves)</td></tr>
  </table>
  <p>Gita (customer 7) has no orders and referred nobody, so deleting her is allowed, and <code>CASCADE</code> removes her review:</p>
  <div class="fx" data-lang="sql">INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (7, 14, 4);
SELECT review_id, customer_id, restaurant_id, rating FROM reviews ORDER BY review_id;
DELETE FROM customers WHERE customer_id = 7;
SELECT review_id, customer_id, restaurant_id, rating FROM reviews ORDER BY review_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>review_id</th><th>customer_id</th><th>restaurant_id</th><th>rating</th></tr><tr><td>1</td><td>1</td><td>10</td><td>5</td></tr><tr><td>6</td><td>7</td><td>14</td><td>4</td></tr></table>
  <div class="fx" data-lang="text">DELETE 1</div>
  <table class="tbl out"><caption>Result</caption><tr><th>review_id</th><th>customer_id</th><th>restaurant_id</th><th>rating</th></tr><tr><td>1</td><td>1</td><td>10</td><td>5</td></tr></table>
  <div class="callout trap"><span class="label">Trap: gaps in ids</span>
    <p>Gita's review got id 6, not 2: each of the four failed inserts above (UNIQUE, CHECK, FK and NOT NULL) used up an identity value (the failing rows even show ids 3 and 5), and sequences never roll back. Ids are unique, not gap-free; never count rows with <code>MAX(id)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: FKs aren't indexed</span>
    <p>Postgres indexes PK and UNIQUE columns automatically, but not FK columns. <code>orders.customer_id</code> has no index of its own; on a big table, add one for fast joins and parent deletes.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>App validation is a "no outside food" sign; a constraint is the guard, who also watches the side entrance (scripts, manual fixes, other services).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>constraint</strong> is a declarative rule on a table that every INSERT, UPDATE and DELETE must satisfy, or the statement fails. <strong>Referential actions</strong> (ON DELETE / ON UPDATE: NO ACTION, RESTRICT, CASCADE, SET NULL, SET DEFAULT) define what a foreign key does when its parent changes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SQL sub-languages.</b> We have now used CREATE TABLE, INSERT, DELETE, SELECT and BEGIN. They all look like "SQL", but they do very different jobs. How are SQL commands grouped, and why does the grouping matter?</div>

  <h2 id="sr-lang"><span class="num">07</span>SQL Sub-languages</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Some commands change the shape of tables, some change rows, some only read, some decide who may do what, and some bundle changes together. Which is which, and does the database treat them differently?</p>
  </div>
  <p>SQL (Structured Query Language) is one language, but its commands do five different kinds of job: build the shelves, put things on them, read them, decide who may enter, and bundle changes safely. Interviewers like asking which group a command belongs to, so learn the five names.</p>
  <table class="tbl">
    <tr><th>Group</th><th>Does</th><th>Commands</th></tr>
    <tr><td><strong>DDL</strong> Data Definition</td><td>Shapes the schema</td><td>CREATE, ALTER, DROP, TRUNCATE</td></tr>
    <tr><td><strong>DML</strong> Data Manipulation</td><td>Changes rows</td><td>INSERT, UPDATE, DELETE, MERGE</td></tr>
    <tr><td><strong>DQL</strong> Data Query</td><td>Reads rows</td><td>SELECT</td></tr>
    <tr><td><strong>DCL</strong> Data Control</td><td>Permissions</td><td>GRANT, REVOKE</td></tr>
    <tr><td><strong>TCL</strong> Transaction Control</td><td>Groups changes into all-or-nothing units</td><td>BEGIN, COMMIT, ROLLBACK, SAVEPOINT</td></tr>
  </table>
  <div class="fx" data-lang="sql">-- DDL: add a column
ALTER TABLE customers ADD COLUMN email TEXT UNIQUE;
-- DML: change rows
UPDATE restaurants SET rating = 4.0 WHERE name = 'Momo Magic';
-- DQL: read rows
SELECT name, rating FROM restaurants WHERE city = 'Pune' ORDER BY rating DESC;</div>
  <div class="fx" data-lang="text">ALTER TABLE
UPDATE 1
    name     | rating 
-------------+--------
 Dosa Hut    |    4.5
 Momo Magic  |    4.0
 Pizza Point |    3.9
(3 rows)</div>
  <p>The TCL example is worth reading slowly. <code>BEGIN</code> opens a transaction. Inside it, every unit price is doubled and the Chicken Biryani on order 102 reads 700. <code>ROLLBACK</code> throws the whole transaction away, so it is back at 350. (<code>COMMIT</code> would have kept it.)</p>
  <div class="fx" data-lang="sql">BEGIN;
UPDATE order_items SET unit_price = unit_price * 2;
SELECT order_id, item, unit_price FROM order_items WHERE order_id = 102 AND item = 'Chicken Biryani';
ROLLBACK;
SELECT order_id, item, unit_price FROM order_items WHERE order_id = 102 AND item = 'Chicken Biryani';</div>
  <div class="fx" data-lang="text">BEGIN
UPDATE 15
 order_id |      item       | unit_price 
----------+-----------------+------------
      102 | Chicken Biryani |     700.00
(1 row)

ROLLBACK
 order_id |      item       | unit_price 
----------+-----------------+------------
      102 | Chicken Biryani |     350.00
(1 row)</div>
  <p>DCL in action: a read-only role for an analyst. It may SELECT, but a DELETE is refused.</p>
  <div class="fx" data-lang="sql">CREATE ROLE analyst LOGIN;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst;
SET ROLE analyst;
SELECT COUNT(*) AS orders_visible FROM orders;
DELETE FROM orders WHERE order_id = 110;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>orders_visible</th></tr><tr><td>10</td></tr></table>
  <div class="fx" data-lang="text">ERROR:  permission denied for table orders</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library. DDL builds and labels the shelves. DML puts books in, moves them, removes them. DQL is reading. DCL is the membership desk deciding who may borrow. TCL is "either all these books are issued to you, or none".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>DDL</strong> defines schema objects; <strong>DML</strong> inserts, updates and deletes rows; <strong>DQL</strong> (SELECT) reads; <strong>DCL</strong> grants and revokes privileges; <strong>TCL</strong> starts, commits, rolls back and checkpoints transactions. Some books fold DQL into DML.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In PostgreSQL, DDL is transactional: <code>CREATE</code>/<code>ALTER</code>/<code>DROP</code> inside <code>BEGIN</code> can be rolled back. In MySQL and Oracle, DDL auto-commits (it silently ends the open transaction), so it can't.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: why PostgreSQL.</b> All of this ran on PostgreSQL. Other databases speak SQL too. Why these notes use PostgreSQL, and what changes when you meet MySQL, SQL Server or BigQuery at work?</div>

  <h2 id="sr-pg"><span class="num">08</span>Why PostgreSQL</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>SQL is a standard, but every product adds its own functions and quirks. Which one should you learn on, and what transfers to the others?</p>
  </div>
  <p>Many companies sell or give away a relational DBMS. They all speak SQL, but each has its own <strong>dialect</strong>: small differences in functions and syntax, like Hindi spoken in Delhi versus Lucknow. These notes use PostgreSQL ("Postgres"): open-source (free, code public), and the sensible default for a new project. Ask the server who it is:</p>
  <div class="fx" data-lang="sql">SELECT version();</div>
  <table class="tbl out"><caption>Result</caption><tr><th>version</th></tr><tr><td>PostgreSQL 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, 64-bit</td></tr></table>
  <div class="flow"><span>Open source, managed on every cloud</span><span>Standard SQL + ACID + transactional DDL</span><span>Extensions: PostGIS, pgvector, TimescaleDB</span><span>JSONB: tables + documents</span></div>
  <div class="cards">
    <div><b>PostgreSQL</b><p>Feature-rich, strict, extensible. The default choice.</p><small>Instagram, Reddit, most startups</small></div>
    <div><b>MySQL</b><p>Simple, fast reads, huge web ecosystem. Historically looser with types.</p><small>WordPress, early Facebook, Shopify</small></div>
    <div><b>SQLite</b><p>A file, not a server. Zero setup, one writer at a time.</p><small>Phones, browsers, tests, local tools</small></div>
    <div><b>SQL Server</b><p>Microsoft's DBMS; T-SQL dialect (<code>TOP</code>, <code>GETDATE()</code>).</p><small>Enterprises on the Microsoft stack</small></div>
    <div><b>Oracle</b><p>Mature, very capable, expensive licences; PL/SQL.</p><small>Banks, telecoms, ERP</small></div>
    <div><b>BigQuery / Snowflake</b><p>Columnar warehouse dialects for analytics, not apps. <code>QUALIFY</code>, nested types.</p><small>Analytics and ML teams</small></div>
  </div>
  <table class="tbl">
    <tr><th>Same idea</th><th>PostgreSQL</th><th>MySQL</th><th>SQL Server</th></tr>
    <tr><td>First n rows</td><td><code>LIMIT n</code></td><td><code>LIMIT n</code></td><td><code>TOP n</code> / <code>OFFSET … FETCH</code></td></tr>
    <tr><td>Current time</td><td><code>now()</code></td><td><code>NOW()</code></td><td><code>GETDATE()</code></td></tr>
    <tr><td>Auto id</td><td><code>GENERATED … AS IDENTITY</code></td><td><code>AUTO_INCREMENT</code></td><td><code>IDENTITY(1,1)</code></td></tr>
    <tr><td>Case-insensitive LIKE</td><td><code>ILIKE</code></td><td>LIKE (default collation is case-insensitive)</td><td>LIKE (collation-dependent)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Learning to drive in a well-built manual car: everything is explicit, so automatics and other brands are easy afterwards. Learning on a lenient system teaches habits that break elsewhere.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A SQL <strong>dialect</strong> is one product's version of SQL: the ISO standard core plus its own functions, types and syntax. <strong>PostgreSQL</strong> is an open-source object-relational DBMS known for standards compliance, extensibility and transactional DDL.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Assuming a query that runs on one database means the same on another. MySQL's old loose GROUP BY mode returned an arbitrary value where PostgreSQL raises an error; string comparison may or may not be case-sensitive. Test on the engine you'll run.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: psql and Python.</b> We know the server. How do we actually talk to it every day, from a terminal and from a notebook, without opening a security hole?</div>

  <h2 id="sr-tools"><span class="num">09</span>psql &amp; Python</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>So far we've typed SQL and seen results. In real work you explore tables in a terminal and pull data into Python for analysis. What do those tools look like, and what goes wrong when user input reaches a query?</p>
  </div>
  <p>Two ways to talk to the database. <code>psql</code> is PostgreSQL's command-line tool: you type SQL, it prints the result, good for exploring. From Python you send the same SQL through a library and get rows back as Python objects, good for notebooks and pipelines.</p>
  <h3>psql essentials</h3>
  <p>Commands starting with a backslash are psql's own shortcuts, not SQL. The most useful one is <code>&#92;d</code>, which describes a table: its columns, types, and constraints, so you never have to guess a column name.</p>
  <table class="tbl">
    <tr><th>Command</th><th>Does</th></tr>
    <tr><td><code>psql -d biteful</code></td><td>Connect to the <code>biteful</code> database</td></tr>
    <tr><td><code>&#92;dt</code></td><td>List tables</td></tr>
    <tr><td><code>&#92;d orders</code></td><td>Columns, types, indexes, constraints of a table</td></tr>
    <tr><td><code>&#92;x</code></td><td>Toggle expanded display (one field per line)</td></tr>
  </table>
  <div class="fx" data-lang="sql">\\d orders
\\x
SELECT * FROM orders WHERE order_id = 105;</div>
  <div class="fx" data-lang="text">                            Table "public.orders"
      Column      |           Type           | Collation | Nullable | Default 
------------------+--------------------------+-----------+----------+---------
 order_id         | integer                  |           | not null | 
 customer_id      | integer                  |           | not null | 
 restaurant_id    | integer                  |           | not null | 
 ordered_at       | timestamp with time zone |           | not null | 
 status           | text                     |           | not null | 
 amount           | numeric(8,2)             |           | not null | 
 delivery_minutes | integer                  |           |          | 
Indexes:
    "orders_pkey" PRIMARY KEY, btree (order_id)
Check constraints:
    "orders_amount_check" CHECK (amount &gt; 0::numeric)
    "orders_delivery_minutes_check" CHECK (delivery_minutes &gt; 0)
    "orders_status_check" CHECK (status = ANY (ARRAY['delivered'::text, 'cancelled'::text, 'pending'::text]))
Foreign-key constraints:
    "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    "orders_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
Referenced by:
    TABLE "order_items" CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(order_id)

Expanded display is on.
-[ RECORD 1 ]----+--------------------------
order_id         | 105
customer_id      | 4
restaurant_id    | 13
ordered_at       | 2026-03-03 19:45:00+05:30
status           | cancelled
amount           | 310.00
delivery_minutes | </div>
  <p>Everything from sections 02 to 06 is visible in one screen: the types, which columns are nullable, the primary-key index, the CHECK constraints, the two foreign keys going out and the one coming in from <code>order_items</code>. <code>&#92;x</code> then shows order 105 one field per line, handy for wide rows.</p>
  <h3>Querying from Python</h3>
  <p>Two libraries appear below. <code>psycopg</code> (version 3) is the low-level driver: it opens a connection and runs SQL, returning plain tuples. <code>pandas.read_sql</code> runs a query and hands you a DataFrame, which is what you want for analysis. In both, the value you filter on (customer 1, or ₹300) is <em>not</em> pasted into the SQL text. It is passed separately, as a <strong>parameter</strong>, and the placeholder (<code>%s</code> or <code>:min_amount</code>) marks where it goes. The next heading explains why that matters.</p>
  <div class="fx" data-lang="py">import psycopg                       # psycopg 3 (psycopg2 = older)
import pandas as pd
from sqlalchemy import create_engine, text

with psycopg.connect("dbname=biteful") as conn:
    rows = conn.execute(
        "SELECT order_id, status, amount FROM orders WHERE customer_id = %s ORDER BY order_id",
        (1,),                        # values sent separately
    ).fetchall()
print(rows)

engine = create_engine("postgresql+psycopg:///biteful")
df = pd.read_sql(
    text("SELECT status, COUNT(*) AS n, SUM(amount) AS total FROM orders "
         "WHERE amount &gt; :min_amount GROUP BY status ORDER BY status"),
    engine, params={"min_amount": 300},
)
print(df)
print(df.dtypes)</div>
  <div class="fx" data-lang="text">[(101, 'delivered', Decimal('240.00')), (104, 'delivered', Decimal('380.00')), (110, 'pending', Decimal('310.00'))]
      status  n   total
0  cancelled  1   310.0
1  delivered  4  1950.0
2    pending  1   310.0
status        str
n           int64
total     float64
dtype: object</div>
  <p>psycopg returned NUMERIC as Python <code>Decimal</code> (exact). pandas turned the same NUMERIC <code>total</code> into <code>float64</code> by default, so exactness is gone once data reaches a DataFrame; round money before display. Check the numbers: orders above ₹300 are 102 (450), 103 (520), 104 (380), 105 (310), 109 (600) and 110 (310); delivered total 450 + 520 + 380 + 600 = 1950.</p>
  <h3>SQL injection</h3>
  <p>Biteful's support tool has a search box: "find customer by name". The code builds the SQL by gluing the typed name into the string. A normal user types <code>Asha</code> and the query becomes <code>WHERE name = 'Asha'</code>. Now an attacker types something that <em>contains a quote mark and SQL</em>, so the glued string is no longer one value but new SQL that the database obediently runs. This is <strong>SQL injection</strong>, still one of the most common real-world attacks:</p>
  <div class="fx" data-lang="py">import psycopg

name = "x' OR '1'='1"                       # what the attacker typed
with psycopg.connect("dbname=biteful") as conn:
    sql = "SELECT customer_id, name FROM customers WHERE name = '" + name + "'"   # NEVER do this
    print(sql)
    print("glued     :", conn.execute(sql).fetchall())
    safe = conn.execute("SELECT customer_id, name FROM customers WHERE name = %s", (name,))
    print("parameter :", safe.fetchall())</div>
  <div class="fx" data-lang="text">SELECT customer_id, name FROM customers WHERE name = 'x' OR '1'='1'
glued     : [(1, 'Asha'), (2, 'Ben'), (3, 'Chen'), (4, 'Dia'), (5, 'Esha'), (6, 'Farah'), (7, 'Gita')]
parameter : []</div>
  <p><code>'1'='1'</code> is always true, so the glued WHERE matched every row and all seven customers leaked. With a parameter, the driver sends the typed text as a value, quotes and all. The database looks for a customer literally named <code>x' OR '1'='1</code>, finds none, and returns <code>[]</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A form with a box for "name". Gluing is like letting the visitor write anywhere on the form, including "and also approve my loan". A parameter is a box with walls: whatever is written inside stays a name.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>parameterised query</strong> sends SQL text with placeholders and the values separately, so values can never be parsed as SQL. <strong>SQL injection</strong> is an attack that changes a query's meaning by inserting SQL syntax into a value that is concatenated into the query text.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>f-strings and <code>%</code> formatting are as unsafe as <code>+</code>. Parameters replace only <em>values</em>; user-chosen column or table names need an allow-list or <code>psycopg.sql.Identifier</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have a design, types, rules, command groups, a server and safe access. Let's see how each piece depends on the others before we start asking real questions in SQL.</div>

  <h2 id="sr-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Relations, anomalies, keys, cardinality, ERD, types, constraints, ON DELETE, DDL/DML/DCL/TCL, dialects, parameters: separate facts to memorise, or one design story?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 290" width="700">
<defs><marker id="sr-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="140" height="44" rx="7" class="fr sr"/><text x="80" y="39" text-anchor="middle" font-size="11.5" font-weight="700">One big sheet</text><text x="80" y="55" text-anchor="middle" class="tm" font-size="10">"Asha, Pune" × 5</text>
<line x1="150" y1="42" x2="178" y2="42" stroke="currentColor" marker-end="url(#sr-a9)"/>
<rect x="180" y="20" width="140" height="44" rx="7" class="fb sb"/><text x="250" y="39" text-anchor="middle" font-size="11.5" font-weight="700">Split: each fact once</text><text x="250" y="55" text-anchor="middle" class="tm" font-size="10">4 tables</text>
<line x1="320" y1="42" x2="348" y2="42" stroke="currentColor" marker-end="url(#sr-a9)"/>
<rect x="350" y="20" width="140" height="44" rx="7" class="fb sb"/><text x="420" y="39" text-anchor="middle" font-size="11.5" font-weight="700">Keys (PK, FK)</text><text x="420" y="55" text-anchor="middle" class="tm" font-size="10">orders.customer_id → 1</text>
<line x1="490" y1="42" x2="518" y2="42" stroke="currentColor" marker-end="url(#sr-a9)"/>
<rect x="520" y="20" width="170" height="44" rx="7" class="fb sb"/><text x="605" y="39" text-anchor="middle" font-size="11.5" font-weight="700">Relationships</text><text x="605" y="55" text-anchor="middle" class="tm" font-size="10">1:N, M:N via orders, self</text>
<line x1="605" y1="64" x2="605" y2="98" stroke="currentColor" marker-end="url(#sr-a9)"/>
<rect x="520" y="100" width="170" height="44" rx="7" class="fg sg"/><text x="605" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Schema (ERD)</text><text x="605" y="135" text-anchor="middle" class="tm" font-size="10">7 · 5 · 10 · 15 rows</text>
<line x1="520" y1="122" x2="492" y2="122" stroke="currentColor" marker-end="url(#sr-a9)"/>
<rect x="350" y="100" width="140" height="44" rx="7" class="fg sg"/><text x="420" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Types</text><text x="420" y="135" text-anchor="middle" class="tm" font-size="10">NUMERIC, TIMESTAMPTZ</text>
<line x1="350" y1="122" x2="322" y2="122" stroke="currentColor" marker-end="url(#sr-a9)"/>
<rect x="160" y="100" width="160" height="44" rx="7" class="fg sg"/><text x="240" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Constraints</text><text x="240" y="135" text-anchor="middle" class="tm" font-size="10">CHECK, UNIQUE, ON DELETE</text>
<line x1="240" y1="144" x2="240" y2="178" stroke="currentColor" marker-end="url(#sr-a9)"/>
<rect x="140" y="180" width="200" height="44" rx="7" class="fv"/><text x="240" y="199" text-anchor="middle" font-size="11.5" font-weight="700">SQL groups</text><text x="240" y="215" text-anchor="middle" class="tm" font-size="10">DDL builds all of the above</text>
<line x1="340" y1="202" x2="378" y2="202" stroke="currentColor" marker-end="url(#sr-a9)"/>
<rect x="380" y="180" width="140" height="44" rx="7" class="fv"/><text x="450" y="199" text-anchor="middle" font-size="11.5" font-weight="700">PostgreSQL</text><text x="450" y="215" text-anchor="middle" class="tm" font-size="10">runs it, strictly</text>
<line x1="520" y1="202" x2="548" y2="202" stroke="currentColor" marker-end="url(#sr-a9)"/>
<rect x="550" y="180" width="140" height="44" rx="7" class="fv"/><text x="620" y="199" text-anchor="middle" font-size="11.5" font-weight="700">psql / Python</text><text x="620" y="215" text-anchor="middle" class="tm" font-size="10">parameters, not glue</text>
<line x1="80" y1="64" x2="80" y2="240" stroke="currentColor" stroke-dasharray="4 3"/><line x1="80" y1="240" x2="240" y2="240" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sr-a9)"/>
<text x="250" y="258" font-size="10.5" class="tm">JOIN (next pages) rebuilds the sheet on demand, without storing the repeats</text>
</svg><figcaption>Read clockwise from the top-left. The anomalies of one big sheet force the split; the split needs keys; keys come in relationship shapes; together they are the schema; each column then gets a type and the table gets rules; DDL builds it, PostgreSQL enforces it, and tools reach it through parameters. A JOIN gives the sheet back whenever you want it.</figcaption></figure>
  <table class="tbl"><caption>Every idea on Biteful's data</caption>
    <tr><th>Concept</th><th>Built from / needs</th><th>Answers which question</th><th>On Biteful</th><th>Use / watch when</th></tr>
    <tr><td>Relation, normalization</td><td>anomalies of one sheet</td><td>why several tables?</td><td>"Asha, Pune" on 5 rows → 1 row</td><td>any repeated fact</td></tr>
    <tr><td>Primary key</td><td>a unique, non-NULL column</td><td>which row is it?</td><td>customer_id 1 = Asha</td><td>every table; surrogate + UNIQUE natural</td></tr>
    <tr><td>Foreign key</td><td>a PK in another table</td><td>where does this row point?</td><td>orders.customer_id, customer 99 refused</td><td>every link; index it yourself</td></tr>
    <tr><td>1:N / 1:1</td><td>FK (+ UNIQUE for 1:1)</td><td>how many per parent?</td><td>Asha → 101, 104, 110</td><td>FK on the many side</td></tr>
    <tr><td>M:N junction</td><td>two FKs + pair facts</td><td>many on both sides?</td><td>Pizza Point ← Chen, Asha, Esha</td><td>never a list in a cell</td></tr>
    <tr><td>Self-reference</td><td>FK to own PK</td><td>hierarchy, referrals?</td><td>Ben, Chen ← Asha; Farah ← Ben</td><td>trees; recursive queries</td></tr>
    <tr><td>Types</td><td>the column's domain</td><td>what may it hold?</td><td>float sum 0.9999999999999999 vs numeric 1.0</td><td>NUMERIC money, TIMESTAMPTZ events</td></tr>
    <tr><td>Constraints</td><td>schema rules</td><td>which rows are allowed?</td><td>rating 7, dup review, customer 99 refused</td><td>always; the DB is the last guard</td></tr>
    <tr><td>ON DELETE</td><td>FK + policy</td><td>what happens to children?</td><td>Asha refused; Gita's review cascaded</td><td>RESTRICT history, CASCADE owned data</td></tr>
    <tr><td>DDL/DML/DQL/DCL/TCL</td><td>the command set</td><td>which kind of command?</td><td>doubled prices rolled back; analyst DELETE denied</td><td>DDL rollback is Postgres-only</td></tr>
    <tr><td>Parameters</td><td>driver placeholders</td><td>how to pass user input?</td><td>glued: 7 customers leak; parameter: []</td><td>every value from outside</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>store every fact once, give it an address, and let the database guard the rules.</strong> "Once" gives the tables (normalization); "an address" gives primary and foreign keys and the relationship shapes; "guard the rules" gives types, constraints and ON DELETE policies, enforced by PostgreSQL for every client, and reached only through parameters so no client can rewrite the query. Everything you will write on the next pages (SELECT, GROUP BY, JOIN) is a way of reading this design back.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="sr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful. <code>customers</code> (7: Asha 1 … Gita 7; Esha's city NULL; Gita no orders; referred_by: Ben, Chen ← Asha, Farah ← Ben), <code>restaurants</code> (5: Dosa Hut 10 … Momo Magic 14, no orders, NULL rating), <code>orders</code> (10: 101–110; 7 delivered, 105 and 107 cancelled, 110 pending), <code>order_items</code> (15 lines, PK (order_id, item)).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Relational model</td><td>why not one sheet?</td><td>Asha on 5 rows; Gita can't exist; deleting 105 deletes Dia</td><td>tables must point at each other → keys</td></tr>
    <tr><td>Keys</td><td>how does a row point at another?</td><td>PK customer_id; FK orders.customer_id</td><td>where does each FK go? → relationships</td></tr>
    <tr><td>Relationships</td><td>1:N, 1:1, M:N, self?</td><td>orders = junction; referred_by self-FK</td><td>see the whole design → dataset</td></tr>
    <tr><td>Biteful dataset</td><td>what is the full design?</td><td>ERD, 7/5/10/15 rows, quirks</td><td>what may columns hold? → types</td></tr>
    <tr><td>Types</td><td>does the type matter?</td><td>float 0.30000000000000004; same instant in NY</td><td>rules beyond type → constraints</td></tr>
    <tr><td>Constraints</td><td>which rows are allowed?</td><td>4 bad reviews refused; Asha and Dia deletes refused</td><td>name the command groups → sub-languages</td></tr>
    <tr><td>Sub-languages</td><td>DDL, DML, DQL, DCL, TCL?</td><td>ROLLBACK undid doubled prices</td><td>which server? → PostgreSQL</td></tr>
    <tr><td>PostgreSQL</td><td>why this DBMS?</td><td>version 16; dialect table</td><td>reach it safely → psql &amp; Python</td></tr>
    <tr><td>psql &amp; Python</td><td>how do tools connect?</td><td>&#92;d orders; injection leaks 7 rows</td><td>→ <a class="xref" data-note="sql_fundamentals">Querying Basics</a></td></tr>
  </table>
  <h3>Definitions and rules</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Relation / row / column</td><td>Table / one fact / one typed property; rows are unordered.</td></tr>
    <tr><td>Anomalies</td><td>Update (same fact in many rows), insert (can't store A without B), delete (removing B removes A).</td></tr>
    <tr><td>Primary key</td><td>Unique + NOT NULL; one per table; may be composite.</td></tr>
    <tr><td>Candidate / natural / surrogate key</td><td>Could-be-PK (gets UNIQUE) / real-world id / generated id (preferred PK).</td></tr>
    <tr><td>Foreign key</td><td>Values must exist in the referenced key (or be NULL); not auto-indexed in Postgres.</td></tr>
    <tr><td>1:N, 1:1, M:N</td><td>FK on many side; FK + UNIQUE; junction table with two FKs (+ pair facts).</td></tr>
    <tr><td>NUMERIC(p,s)</td><td>Exact decimal, p digits total, s after the point; use for money.</td></tr>
    <tr><td>TIMESTAMPTZ</td><td>Absolute instant, stored as UTC, shown in the session zone.</td></tr>
    <tr><td>Constraints</td><td>NOT NULL, UNIQUE (many NULLs allowed), CHECK, PRIMARY KEY, FOREIGN KEY, DEFAULT.</td></tr>
    <tr><td>ON DELETE</td><td>NO ACTION/RESTRICT refuse; CASCADE deletes children; SET NULL unlinks.</td></tr>
    <tr><td>DDL / DML / DQL / DCL / TCL</td><td>CREATE ALTER DROP TRUNCATE / INSERT UPDATE DELETE MERGE / SELECT / GRANT REVOKE / BEGIN COMMIT ROLLBACK SAVEPOINT.</td></tr>
    <tr><td>Parameterised query</td><td>SQL with placeholders (<code>%s</code>, <code>:name</code>) and values sent separately; stops injection.</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Surrogate PK</b><p>Every table: <code>BIGINT GENERATED ALWAYS AS IDENTITY</code> or UUID, plus UNIQUE on natural keys.</p><small>Avoid natural keys (email, phone) as PK</small></div>
    <div><b>Junction table</b><p>Every M:N; put facts about the pair in it.</p><small>Avoid comma-separated lists in a cell</small></div>
    <div><b>NUMERIC</b><p>Money and anything that must add up exactly.</p><small>Avoid FLOAT for money</small></div>
    <div><b>TIMESTAMPTZ</b><p>Events: orders, logins, payments.</p><small>Plain TIMESTAMP only for zone-less times</small></div>
    <div><b>CASCADE</b><p>Children owned by the parent (reviews, order lines).</p><small>Avoid for history (orders, payments): use RESTRICT</small></div>
    <div><b>Parameters</b><p>Every value that comes from a user or a file.</p><small>Never f-strings or + for SQL values</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Assuming row order without ORDER BY; natural keys as PK; lists in a cell instead of a junction; FLOAT for money; TIMESTAMP for events; validation only in the app; forgetting that UNIQUE allows many NULLs; expecting gap-free identity ids; un-indexed FK columns; expecting DDL rollback on MySQL/Oracle; NUMERIC turning into float64 in pandas; gluing user input into SQL.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Students take many courses, courses have many students. How many tables?</td><td>Three: students, courses, and a junction enrollments(student_id, course_id, …).</td></tr>
    <tr><td><code>DELETE FROM customers WHERE customer_id = 1</code> on Biteful?</td><td>Refused by a foreign key: Ben and Chen's referred_by (and her orders 101, 104, 110) still point at her.</td></tr>
    <tr><td>SUM of 0.1 ten times as float8?</td><td>0.9999999999999999 (NUMERIC gives 1.0).</td></tr>
    <tr><td>Classify TRUNCATE, GRANT, MERGE, SAVEPOINT, SELECT.</td><td>DDL, DCL, DML, TCL, DQL.</td></tr>
    <tr><td>User types <code>x' OR '1'='1</code>; glued vs parameter?</td><td>Glued returns every customer; parameter returns [].</td></tr>
  </table>

  <h2 id="sr-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you justify every part of Biteful's design out loud: why each table, key, type and rule exists?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>orders</code> store <code>customer_id = 1</code> instead of the name "Asha"?</summary><div class="qa-body">So Asha's details live in exactly one place. If her city changes, one row in <code>customers</code> is updated and every order sees it. Storing the name would copy it into every order, and the copies could drift apart (the update anomaly).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Primary key vs UNIQUE constraint?</summary><div class="qa-body">Both block duplicates and create an index. One PK per table, always NOT NULL, the usual FK target. Many UNIQUE constraints allowed (restaurants.name), and they accept NULLs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you model students and courses, where each student takes many courses?</summary><div class="qa-body">M:N, so a junction table: <code>enrollments(student_id FK, course_id FK, grade, PRIMARY KEY (student_id, course_id))</code>. Facts about the pair (grade, enrol date) live in the junction table. In Biteful, <code>orders</code> plays this role for customers ↔ restaurants.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Natural or surrogate key for a users table?</summary><div class="qa-body">Surrogate (<code>BIGINT IDENTITY</code> or UUID) as the PK, with <code>UNIQUE NOT NULL</code> on email. Emails change; changing a PK means updating every FK that points to it. The UNIQUE still blocks duplicate accounts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens: <code>DELETE FROM customers WHERE customer_id = 1;</code> on the Biteful DB?</summary><div class="qa-body">It fails. PostgreSQL reported <em>violates foreign key constraint "customers_referred_by_fkey" on table "customers"</em>: Ben and Chen were referred by Asha. Her orders 101, 104 and 110 also reference her (Dia's delete failed on <code>orders_customer_id_fkey</code>). Both FKs have the default <code>NO ACTION</code>. Deleting Gita (no orders, no referrals) succeeds.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CASCADE vs RESTRICT vs SET NULL: when would you use each?</summary><div class="qa-body">CASCADE for child data meaningless without the parent (a customer's reviews, an order's lines). RESTRICT/NO ACTION when history must be kept (orders, payments). SET NULL for optional links (<code>referred_by</code> when the referrer deletes their account).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not store prices as FLOAT?</summary><div class="qa-body">Floats are binary approximations: <code>0.1 + 0.2</code> gives <code>0.30000000000000004</code>, and summing <code>0.1</code> ten times gives <code>0.9999999999999999</code> in Postgres. Use <code>NUMERIC(p,s)</code> or store integer paise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Classify each: TRUNCATE, GRANT, MERGE, SAVEPOINT, SELECT.</summary><div class="qa-body">TRUNCATE: DDL (removes all rows by resetting storage, not row by row). GRANT: DCL. MERGE: DML. SAVEPOINT: TCL. SELECT: DQL (some texts lump it into DML).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write Python to load all orders for a customer id typed by a user into a DataFrame, safely.</summary><div class="qa-body"><code>df = pd.read_sql(text("SELECT * FROM orders WHERE customer_id = :cid"), engine, params={"cid": int(user_input)})</code>. The value is sent as a bound parameter, so input like <code>1 OR 1=1</code> can't change the query (and <code>int()</code> rejects it outright).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A UNIQUE column on <code>email</code> already has a NULL. Can you insert another row with NULL email?</summary><div class="qa-body">Yes. NULL is "unknown", and two unknowns are not considered equal, so UNIQUE allows many NULLs. To prevent it, add <code>NOT NULL</code>, or use <code>UNIQUE NULLS NOT DISTINCT</code> in PostgreSQL 15+.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Into an empty table with an IDENTITY id, you insert three rows; the third fails a CHECK. The next successful insert gets id 4, not 3. Bug?</summary><div class="qa-body">No. Sequence values are handed out before the row is checked and never returned, even on error or rollback (so concurrent inserts never wait). Ids are unique, not gap-free; don't count rows with <code>MAX(id)</code>. Gita's review got id 5 for the same reason.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does splitting the sheet into tables force you to have foreign keys?</summary><div class="qa-body">Once Asha's details live only in <code>customers</code>, an order can only refer to her by a value (customer_id 1). Without a foreign key nothing stops that value being 99, or Asha being deleted while orders still say 1: the split would trade update anomalies for dangling references. The FK is the price of storing each fact once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the junction table and store "restaurant_ids" as text in customers?</summary><div class="qa-body">You can't index or join on the list, you can't put a foreign key on "10,12" so a deleted restaurant leaves junk behind, and you have nowhere to store facts about each visit (when, how much). It also brings back the update anomaly. The junction table (orders) solves all four.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do constraints and transactions belong together?</summary><div class="qa-body">A transaction is all-or-nothing, and a constraint violation is one way it fails. In the refund and in the doubled-prices demo, one failing step made the whole unit roll back, so the rules hold after every commit: that is the C in ACID. Constraints say what "valid" means; transactions make sure you only ever see valid states.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do the design choices here show up as traps on the next page?</summary><div class="qa-body">Esha's nullable city makes <code>city &lt;&gt; 'Pune'</code> skip her (three-valued logic); nullable <code>delivery_minutes</code> makes <code>COUNT(*)</code> differ from <code>COUNT(delivery_minutes)</code>; the nullable self-FK <code>referred_by</code> breaks <code>NOT IN</code>; the tie in ratings makes <code>LIMIT</code> arbitrary. Every NULL you allow in the design is a decision the queries must handle.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sql_fundamentals">Querying Basics</a>.</b> The tables are designed and filled. Now we need to ask them questions: which orders were delivered, how much each restaurant earned, which customers have no city, and how to change data safely.</div>
</main>`
});
