// notes/databases/sql_relational.js — Relational Model & PostgreSQL
Object.assign(TOPIC_CONTENT, {
  "sql_relational": `<main>
  <h1>Relational Model &amp; PostgreSQL</h1>
  <p class="lead">The foundation for every SQL page: how tables, keys and relationships fit together, the shared <code>shop</code> dataset, and the PostgreSQL types, constraints and tools you'll use daily.</p>

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
      <div class="rm-item rm-done" data-target="sr-rev"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="sr-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sr-model"><span class="num">01</span>The Relational Model</h2>
  <ul>
    <li><strong>Relation</strong> = a table: a set of rows that all have the same columns.</li>
    <li><strong>Row</strong> (tuple): one fact, e.g. one order.</li>
    <li><strong>Column</strong> (attribute): one property with a <strong>type / domain</strong> (allowed values, e.g. <code>DATE</code>).</li>
    <li>Rows have <strong>no order</strong>: without <code>ORDER BY</code>, output order isn't guaranteed.</li>
  </ul>
  <p>Why split data into tables? Here is the "one giant sheet" version of Asha's orders:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, c.city, p.name AS product, oi.qty, oi.unit_price
FROM orders o
JOIN customers c   USING (customer_id)
JOIN order_items oi USING (order_id)
JOIN products p    USING (product_id)
WHERE c.customer_id = 1
ORDER BY o.order_id, p.name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer</th><th>city</th><th>product</th><th>qty</th><th>unit_price</th></tr><tr><td>100</td><td>Asha</td><td>Mumbai</td><td>Lamp</td><td>2</td><td>40.00</td></tr><tr><td>100</td><td>Asha</td><td>Mumbai</td><td>Laptop</td><td>1</td><td>800.00</td></tr><tr><td>101</td><td>Asha</td><td>Mumbai</td><td>Phone</td><td>1</td><td>500.00</td></tr></table>
  <p>Stored like this, it suffers three <strong>anomalies</strong>:</p>
  <ul>
    <li><strong>Update</strong>: Asha moves city, so you must edit 3 rows. Miss one and the data contradicts itself.</li>
    <li><strong>Insert</strong>: Dia has no orders, so she can't exist in an order sheet.</li>
    <li><strong>Delete</strong>: delete Ben's only order (102) and Ben disappears.</li>
  </ul>
  <p>Separate tables store each fact <strong>once</strong>, linked by keys; JOINs rebuild the wide view on demand (this is <em>normalization</em>, see Data Modeling).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your phone's contacts. A number is stored once; chats refer to the contact. Change it once and every chat updates.</p>
  </div>

  <h2 id="sr-keys"><span class="num">02</span>Keys &amp; Relationships</h2>
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
  <table class="tbl">
    <tr><th>Shape</th><th>How it's built</th><th>Example</th></tr>
    <tr><td><strong>1:N</strong></td><td>FK on the "many" side</td><td>One customer → many orders (<code>orders.customer_id</code>)</td></tr>
    <tr><td><strong>1:1</strong></td><td>FK that is also UNIQUE (or shares the PK)</td><td><code>customer_profiles.customer_id</code> UNIQUE</td></tr>
    <tr><td><strong>M:N</strong></td><td>A <strong>junction table</strong> with two FKs</td><td>Orders ↔ products via <code>order_items</code></td></tr>
  </table>
  <p>Neither orders nor products can hold one FK to the other, so <code>order_items</code> holds one row per (order, product) pair plus facts about the pair. Which orders contain the Lamp?</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name
FROM order_items oi
JOIN orders o    USING (order_id)
JOIN customers c USING (customer_id)
WHERE oi.product_id = 13
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>name</th></tr><tr><td>100</td><td>Asha</td></tr><tr><td>104</td><td>Chen</td></tr></table>
  <p><code>unit_price</code> is copied into the line item on purpose: prices change, and the price paid is a fact about <em>that sale</em>.</p>

  <h2 id="sr-shop"><span class="num">03</span>The Shop Dataset</h2>
  <p>This is <strong>the dataset every SQL page uses</strong>. Learn its quirks once.</p>
  <div class="flow"><span>customers</span><span>orders (customer_id)</span><span>order_items (order_id, product_id)</span><span>products</span></div>
  <p>Plus <code>employees</code>, whose <code>manager_id</code> points back to <code>employees.emp_id</code> (a <strong>self-referencing</strong> FK, used for self-joins and hierarchies).</p>
  <table class="tbl"><caption>customers</caption><tr><th>customer_id</th><th>name</th><th>city</th><th>signup_date</th></tr><tr><td>1</td><td>Asha</td><td>Mumbai</td><td>2024-01-05</td></tr><tr><td>2</td><td>Ben</td><td>Delhi</td><td>2024-02-10</td></tr><tr><td>3</td><td>Chen</td><td>Mumbai</td><td>2024-03-15</td></tr><tr><td>4</td><td>Dia</td><td>NULL</td><td>2024-04-20</td></tr></table>
  <table class="tbl"><caption>products</caption><tr><th>product_id</th><th>name</th><th>category</th><th>price</th></tr><tr><td>10</td><td>Laptop</td><td>Electronics</td><td>800.00</td></tr><tr><td>11</td><td>Phone</td><td>Electronics</td><td>500.00</td></tr><tr><td>12</td><td>Desk</td><td>Furniture</td><td>150.00</td></tr><tr><td>13</td><td>Lamp</td><td>Furniture</td><td>40.00</td></tr></table>
  <table class="tbl"><caption>orders</caption><tr><th>order_id</th><th>customer_id</th><th>order_date</th><th>status</th></tr><tr><td>100</td><td>1</td><td>2024-05-01</td><td>delivered</td></tr><tr><td>101</td><td>1</td><td>2024-05-20</td><td>delivered</td></tr><tr><td>102</td><td>2</td><td>2024-06-02</td><td>cancelled</td></tr><tr><td>103</td><td>3</td><td>2024-06-15</td><td>delivered</td></tr><tr><td>104</td><td>3</td><td>2024-07-01</td><td>pending</td></tr></table>
  <table class="tbl"><caption>order_items  (PK: order_id, product_id)</caption><tr><th>order_id</th><th>product_id</th><th>qty</th><th>unit_price</th></tr><tr><td>100</td><td>10</td><td>1</td><td>800.00</td></tr><tr><td>100</td><td>13</td><td>2</td><td>40.00</td></tr><tr><td>101</td><td>11</td><td>1</td><td>500.00</td></tr><tr><td>102</td><td>12</td><td>1</td><td>150.00</td></tr><tr><td>103</td><td>11</td><td>2</td><td>500.00</td></tr><tr><td>103</td><td>12</td><td>1</td><td>150.00</td></tr><tr><td>104</td><td>13</td><td>3</td><td>40.00</td></tr></table>
  <table class="tbl"><caption>employees</caption><tr><th>emp_id</th><th>name</th><th>dept</th><th>salary</th><th>manager_id</th></tr><tr><td>1</td><td>Ravi</td><td>Eng</td><td>120000</td><td>NULL</td></tr><tr><td>2</td><td>Sara</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>3</td><td>Tom</td><td>Eng</td><td>95000</td><td>1</td></tr><tr><td>4</td><td>Uma</td><td>Sales</td><td>70000</td><td>1</td></tr><tr><td>5</td><td>Vik</td><td>Sales</td><td>65000</td><td>4</td></tr></table>
  <div class="callout pred"><span class="label">Quirks to remember</span>
    <p>Dia has <strong>no orders</strong> and a <strong>NULL city</strong> (LEFT JOIN and NULL tests). Sara and Tom <strong>tie</strong> on salary (RANK vs ROW_NUMBER). Order 102 is <strong>cancelled</strong> (filtering). The Lamp is in <strong>two orders</strong> (fan-out in joins). Ravi has no manager (root of the hierarchy).</p>
  </div>

  <h2 id="sr-lang"><span class="num">04</span>SQL Sub-languages</h2>
  <p>SQL (Structured Query Language) is one language with five groups of commands.</p>
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
  <p>PostgreSQL ("Postgres") is an open-source relational DBMS and the sensible default for new projects.</p>
  <ul>
    <li><strong>Open source</strong>, no lock-in; every cloud offers it managed.</li>
    <li><strong>Standards-compliant</strong>: window functions, CTEs, <code>MERGE</code>, <code>FILTER</code>, full ACID with transactional DDL.</li>
    <li><strong>Extensions</strong>: PostGIS (maps/geo), pgvector (embeddings), TimescaleDB (time-series), pg_stat_statements (query stats).</li>
    <li><strong>JSONB</strong>: indexed binary JSON, so one DB can hold both tables and documents.</li>
  </ul>
  <div class="cards">
    <div><b>PostgreSQL</b><p>Feature-rich, strict, extensible. The default choice.</p><small>Instagram, Reddit, most startups</small></div>
    <div><b>MySQL</b><p>Simple, fast reads, huge web ecosystem. Historically looser with types.</p><small>WordPress, early Facebook, Shopify</small></div>
    <div><b>SQLite</b><p>A file, not a server. Zero setup, one writer at a time.</p><small>Phones, browsers, tests, local tools</small></div>
    <div><b>SQL Server</b><p>Microsoft's DBMS; T-SQL dialect (<code>TOP</code>, <code>GETDATE()</code>).</p><small>Enterprises on the Microsoft stack</small></div>
    <div><b>Oracle</b><p>Mature, very capable, expensive licences; PL/SQL.</p><small>Banks, telecoms, ERP</small></div>
    <div><b>BigQuery / Snowflake</b><p>Columnar warehouse dialects for analytics, not apps. <code>QUALIFY</code>, nested types.</p><small>Analytics and ML teams</small></div>
  </div>

  <h2 id="sr-types"><span class="num">06</span>Data Types &amp; Traps</h2>
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
  <div class="fx" data-lang="sql">SELECT 0.1::float8 + 0.2::float8 = 0.3 AS float_ok,
       0.1::numeric + 0.2::numeric = 0.3 AS numeric_ok,
       0.1::float8 + 0.2::float8         AS float_sum;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>float_ok</th><th>numeric_ok</th><th>float_sum</th></tr><tr><td>f</td><td>t</td><td>0.30000000000000004</td></tr></table>
  <p>Floats are binary approximations; errors pile up in sums. Money → <code>NUMERIC</code> (or integer paise); measurements → float.</p>
  <h3>Trap 2: TIMESTAMP vs TIMESTAMPTZ</h3>
  <p><code>TIMESTAMP</code> is a wall-clock reading with no zone. <code>TIMESTAMPTZ</code> stores an absolute instant (in UTC) and displays it in the session's time zone.</p>
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
  <p>Rules the database enforces on every write, whichever app or script sends it.</p>
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
  <p>Now break each rule. These are the real PostgreSQL errors:</p>
  <table class="tbl">
    <tr><th>Statement</th><th>Error</th></tr>
    <tr><td><code>VALUES (1, 10, 4)</code> again</td><td>duplicate key value violates unique constraint "reviews_customer_id_product_id_key"</td></tr>
    <tr><td><code>VALUES (2, 11, 6)</code></td><td>new row for relation "reviews" violates check constraint "reviews_rating_check"</td></tr>
    <tr><td><code>VALUES (99, 11, 3)</code></td><td>insert or update on table "reviews" violates foreign key constraint "reviews_customer_id_fkey"<br>DETAIL: Key (customer_id)=(99) is not present in table "customers".</td></tr>
    <tr><td>rating omitted</td><td>null value in column "rating" of relation "reviews" violates not-null constraint</td></tr>
    <tr><td><code>DELETE FROM customers WHERE customer_id = 1</code></td><td>update or delete on table "customers" violates foreign key constraint "orders_customer_id_fkey" on table "orders"</td></tr>
  </table>
  <h3>ON DELETE behaviour</h3>
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
  <h3>psql essentials</h3>
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
  <p>Pasting user input into the SQL string lets the input rewrite the query. A user types <code>x' OR '1'='1</code> as a name:</p>
  <div class="fx" data-lang="py">sql = "SELECT customer_id, name FROM customers WHERE name = '" + name + "'"   # NEVER
# becomes: ... WHERE name = 'x' OR '1'='1'</div>
  <table class="tbl out"><caption>Result of the injected query: every customer leaks</caption><tr><th>customer_id</th><th>name</th></tr><tr><td>1</td><td>Asha</td></tr><tr><td>2</td><td>Ben</td></tr><tr><td>3</td><td>Chen</td></tr><tr><td>4</td><td>Dia</td></tr></table>
  <p>With a parameter (<code>WHERE name = %s</code>, <code>(name,)</code>) the input is just a value, and the query returns <code>[]</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>f-strings and <code>%</code> formatting are as unsafe as <code>+</code>. Parameters replace only <em>values</em>; user-chosen column names need an allow-list or <code>psycopg.sql.Identifier</code>.</p>
  </div>

  <h2 id="sr-rev"><span class="num">09</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Relation</strong> = table; <strong>row</strong> = one fact; <strong>column</strong> has a type/domain. Rows are unordered.</li>
    <li>One big sheet causes <strong>update, insert and delete anomalies</strong>; separate tables store each fact once.</li>
    <li><strong>PK</strong> unique + not null; <strong>FK</strong> must match a parent key; <strong>composite</strong> = multi-column.</li>
    <li>Prefer a <strong>surrogate PK</strong> plus UNIQUE on the natural key.</li>
    <li><strong>1:N</strong> = FK on the many side; <strong>1:1</strong> = FK + UNIQUE; <strong>M:N</strong> = junction table (order_items).</li>
    <li><strong>DDL</strong> schema, <strong>DML</strong> rows, <strong>DQL</strong> SELECT, <strong>DCL</strong> grants, <strong>TCL</strong> transactions.</li>
    <li>Postgres: open source, standard, extensions (PostGIS, pgvector), JSONB, transactional DDL.</li>
    <li>Money → <strong>NUMERIC</strong>; events → <strong>TIMESTAMPTZ</strong>; strings → <strong>TEXT</strong>.</li>
    <li>ON DELETE: default refuses, <strong>CASCADE</strong> deletes children, <strong>SET NULL</strong> unlinks.</li>
    <li>From Python, always use <strong>parameters</strong>, never string-built SQL.</li>
  </ol></div>

  <h2 id="sr-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
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
