// notes/databases/sql_modeling.js — Data Modeling
Object.assign(TOPIC_CONTENT, {
  "sql_modeling": `<main>
  <h1>Data Modeling</h1>
  <p class="lead">How to decide which tables exist and what goes in each. A good model makes wrong data hard to store and common questions easy to ask; a bad one quietly corrupts both.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sm-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Modeling Matters</span><span class="rm-sub">One wide table, three anomalies</span></div></div>
      <div class="rm-item rm-done" data-target="sm-er"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Entities &amp; Relationships</span><span class="rm-sub">Nouns, links, cardinality</span></div></div>
      <div class="rm-item rm-done" data-target="sm-norm"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Normalization</span><span class="rm-sub">1NF → 2NF → 3NF → BCNF</span></div></div>
      <div class="rm-item rm-done" data-target="sm-denorm"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Denormalization</span><span class="rm-sub">Breaking the rules on purpose</span></div></div>
      <div class="rm-item rm-done" data-target="sm-olap"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Star &amp; Snowflake Schemas</span><span class="rm-sub">Modeling for analytics</span></div></div>
      <div class="rm-item rm-done" data-target="sm-scd"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Slowly Changing Dimensions</span><span class="rm-sub">When Asha moves city</span></div></div>
      <div class="rm-item rm-done" data-target="sm-json"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">JSONB vs Columns</span><span class="rm-sub">Flexible, but at a price</span></div></div>
      <div class="rm-item rm-done" data-target="sm-conv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Practical Conventions</span><span class="rm-sub">Names, ids, timestamps, soft delete</span></div></div>
      <div class="rm-item rm-done" data-target="sm-rev"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="sm-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including "design a schema for X"</span></div></div>
    </div>
  </div>

  <h2 id="sm-why"><span class="num">01</span>Why Modeling Matters</h2>
  <p><strong>Data modeling</strong> = deciding the tables, their columns, keys and links, so every fact is stored <em>once</em> in the right place.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A kitchen. Spices on one shelf, plates in one cupboard. If you keep a jar of salt next to every dish instead, refilling "the salt" means hunting down every jar, and you will miss one.</p>
  </div>
  <p>Here is what happens when someone keeps the whole shop in one wide sheet (rebuilt from <code>shop</code> into my own copy):</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_flat AS
SELECT o.order_id, o.order_date, c.name AS cust_name, c.city AS cust_city,
       p.name AS product, p.category, oi.qty, oi.unit_price
FROM orders o
JOIN customers c   USING (customer_id)
JOIN order_items oi USING (order_id)
JOIN products p    USING (product_id);
SELECT * FROM orders_flat ORDER BY order_id, product;</div>
  <table class="tbl out"><caption>orders_flat</caption><tr><th>order_id</th><th>order_date</th><th>cust_name</th><th>cust_city</th><th>product</th><th>category</th><th>qty</th><th>unit_price</th></tr><tr><td>100</td><td>2024-05-01</td><td>Asha</td><td>Mumbai</td><td>Lamp</td><td>Furniture</td><td>2</td><td>40.00</td></tr><tr><td>100</td><td>2024-05-01</td><td>Asha</td><td>Mumbai</td><td>Laptop</td><td>Electronics</td><td>1</td><td>800.00</td></tr><tr><td>101</td><td>2024-05-20</td><td>Asha</td><td>Mumbai</td><td>Phone</td><td>Electronics</td><td>1</td><td>500.00</td></tr><tr><td>102</td><td>2024-06-02</td><td>Ben</td><td>Delhi</td><td>Desk</td><td>Furniture</td><td>1</td><td>150.00</td></tr><tr><td>103</td><td>2024-06-15</td><td>Chen</td><td>Mumbai</td><td>Desk</td><td>Furniture</td><td>1</td><td>150.00</td></tr><tr><td>103</td><td>2024-06-15</td><td>Chen</td><td>Mumbai</td><td>Phone</td><td>Electronics</td><td>2</td><td>500.00</td></tr><tr><td>104</td><td>2024-07-01</td><td>Chen</td><td>Mumbai</td><td>Lamp</td><td>Furniture</td><td>3</td><td>40.00</td></tr></table>
  <p>Asha's city is stored 3 times, "Electronics" 3 times. That repetition causes three <strong>anomalies</strong> (ways data goes wrong on change):</p>
  <ul>
    <li><strong>Update anomaly</strong>: Asha moves to Pune. Update one row, forget the others, and she now lives in two cities.</li>
  </ul>
  <div class="fx" data-lang="sql">UPDATE orders_flat SET cust_city = 'Pune' WHERE order_id = 100;
SELECT DISTINCT cust_name, cust_city FROM orders_flat WHERE cust_name = 'Asha';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>cust_name</th><th>cust_city</th></tr><tr><td>Asha</td><td>Mumbai</td></tr><tr><td>Asha</td><td>Pune</td></tr></table>
  <ul>
    <li><strong>Insert anomaly</strong>: a new product "Chair" or a new customer like Dia can't be recorded until someone orders, because every row needs an order. Dia is already missing above.</li>
    <li><strong>Delete anomaly</strong>: delete Ben's cancelled order 102 and Ben himself (and that he lives in Delhi) vanishes.</li>
  </ul>
  <div class="fx" data-lang="sql">DELETE FROM orders_flat WHERE order_id = 102;
SELECT count(*) AS ben_rows FROM orders_flat WHERE cust_name = 'Ben';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>ben_rows</th></tr><tr><td>0</td></tr></table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One cause: <strong>one table describing several things</strong>. Fix: one table per thing.</p>
  </div>

  <h2 id="sm-er"><span class="num">02</span>Entities &amp; Relationships</h2>
  <p>ER (entity-relationship) thinking: <strong>nouns</strong> become tables (entities), their facts become columns (attributes), <strong>verbs</strong> become links (a customer <em>places</em> orders) built with foreign keys. <strong>Cardinality</strong> = how many on each side: 1:1, 1:N or M:N.</p>
  <div class="flow"><span>customers</span><span>orders</span><span>order_items</span><span>products</span></div>
  <table class="tbl">
    <tr><th>Relationship (shop)</th><th>Cardinality</th><th>How it's built</th></tr>
    <tr><td>customer places orders</td><td>1 : N (0..N: Dia has none)</td><td>FK <code>orders.customer_id</code></td></tr>
    <tr><td>order contains products</td><td>M : N</td><td><strong>Junction table</strong> <code>order_items</code>, PK (order_id, product_id)</td></tr>
    <tr><td>employee reports to manager</td><td>1 : N, same table</td><td>Self-FK <code>employees.manager_id</code></td></tr>
  </table>
  <ul>
    <li><strong>Rule</strong>: the FK always sits on the "many" side. M:N always needs a third table.</li>
    <li>The junction table often grows its own attributes: <code>qty</code> and <code>unit_price</code> belong to "this product in this order", not to either side.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Storing M:N as a list column (<code>orders.product_ids = '10,13'</code>) makes "who bought Lamp?" a string search, with no FK checks. Use a junction table.</p>
  </div>

  <h2 id="sm-norm"><span class="num">03</span>Normalization</h2>
  <p><strong>Normalization</strong> = splitting tables step by step until each fact lives in one place. Each "normal form" (NF) removes one kind of redundancy.</p>
  <p>It rests on <strong>functional dependency</strong> (A → B: knowing A fixes B). <code>product → category</code>: a product always has the same category.</p>
  <p>Running example: the shop as someone first typed it, one row per order with a list of items.</p>
  
  <div class="fx" data-lang="sql">SELECT order_id, cust_name, cust_city,
       string_agg(product || ' x' || qty, ', ' ORDER BY product) AS items
FROM orders_flat GROUP BY 1, 2, 3 ORDER BY 1;</div>
  <table class="tbl out"><caption>Unnormalized (built from an untouched orders_flat)</caption><tr><th>order_id</th><th>cust_name</th><th>cust_city</th><th>items</th></tr><tr><td>100</td><td>Asha</td><td>Mumbai</td><td>Lamp x2, Laptop x1</td></tr><tr><td>101</td><td>Asha</td><td>Mumbai</td><td>Phone x1</td></tr><tr><td>102</td><td>Ben</td><td>Delhi</td><td>Desk x1</td></tr><tr><td>103</td><td>Chen</td><td>Mumbai</td><td>Desk x1, Phone x2</td></tr><tr><td>104</td><td>Chen</td><td>Mumbai</td><td>Lamp x3</td></tr></table>

  <h3>1NF: atomic values</h3>
  <ul>
    <li><strong>Rule</strong>: every cell holds one value; no lists, no repeating groups (<code>item1, item2, …</code>); rows have a key.</li>
    <li><strong>Violation</strong>: <code>items</code> holds a list. "How many Lamps sold?" needs string parsing.</li>
    <li><strong>Fix</strong>: one row per item. That is exactly <code>orders_flat</code> from section 01, key = (order_id, product).</li>
  </ul>

  <h3>2NF: no partial dependency</h3>
  <ul>
    <li><strong>Rule</strong>: every non-key column depends on the <em>whole</em> key, not part of it. (Only matters for composite keys.)</li>
    <li><strong>Violation</strong>: in <code>orders_flat</code>, <code>order_date, cust_name, cust_city</code> depend on <code>order_id</code> alone; <code>category</code> depends on <code>product</code> alone.</li>
    <li><strong>Fix</strong>: split by what each column depends on.</li>
  </ul>
  <div class="fx" data-lang="sql">CREATE TABLE orders_2nf   AS SELECT DISTINCT order_id, order_date, cust_name, cust_city FROM orders_flat;
CREATE TABLE products_2nf AS SELECT DISTINCT product, category FROM orders_flat;
CREATE TABLE items_2nf    AS SELECT order_id, product, qty, unit_price FROM orders_flat;
SELECT * FROM orders_2nf ORDER BY order_id;</div>
  <table class="tbl out"><caption>orders_2nf (products_2nf: 4 rows, items_2nf: 7 rows)</caption><tr><th>order_id</th><th>order_date</th><th>cust_name</th><th>cust_city</th></tr><tr><td>100</td><td>2024-05-01</td><td>Asha</td><td>Mumbai</td></tr><tr><td>101</td><td>2024-05-20</td><td>Asha</td><td>Mumbai</td></tr><tr><td>102</td><td>2024-06-02</td><td>Ben</td><td>Delhi</td></tr><tr><td>103</td><td>2024-06-15</td><td>Chen</td><td>Mumbai</td></tr><tr><td>104</td><td>2024-07-01</td><td>Chen</td><td>Mumbai</td></tr></table>
  <div class="callout intu"><span class="label">Why unit_price stays in items</span>
    <p>It's the price <em>at the time of sale</em>, so it depends on (order, product) together. Today's list price belongs in products. Two different facts, two places.</p>
  </div>

  <h3>3NF: no transitive dependency</h3>
  <ul>
    <li><strong>Rule</strong>: non-key columns depend on the key <em>directly</em>, not through another non-key column. ("The key, the whole key, and nothing but the key.")</li>
    <li><strong>Violation</strong>: <code>order_id → cust_name → cust_city</code>. City is a fact about the customer, so Asha's city still repeats per order.</li>
    <li><strong>Fix</strong>: move customer facts out; orders keep only a reference.</li>
  </ul>
  <div class="fx" data-lang="sql">CREATE TABLE customers_3nf AS SELECT DISTINCT cust_name, cust_city FROM orders_2nf;
CREATE TABLE orders_3nf    AS SELECT order_id, order_date, cust_name FROM orders_2nf;
SELECT * FROM customers_3nf ORDER BY cust_name;</div>
  <table class="tbl out"><caption>customers_3nf</caption><tr><th>cust_name</th><th>cust_city</th></tr><tr><td>Asha</td><td>Mumbai</td></tr><tr><td>Ben</td><td>Delhi</td></tr><tr><td>Chen</td><td>Mumbai</td></tr></table>
  <p>Add surrogate ids instead of names and you have the real <code>shop</code> schema. Dia is still missing: she can only exist because <code>customers</code> is its own table in <code>shop</code>.</p>

  <h3>BCNF: every determinant is a key</h3>
  <ul>
    <li><strong>Rule</strong>: if A → B, then A must be a candidate key. A stricter 3NF for tables with overlapping candidate keys.</li>
    <li><strong>Violation</strong>: <code>account_reps(customer, category, rep)</code>. Each customer has one rep per category, and each rep covers one category. Key = (customer, category), but <code>rep → category</code> and rep is not a key.</li>
  </ul>
  <table class="tbl">
    <tr><th>customer</th><th>category</th><th>rep</th></tr>
    <tr><td>Asha</td><td>Electronics</td><td>Kiran</td></tr>
    <tr><td>Chen</td><td>Electronics</td><td>Kiran</td></tr>
    <tr><td>Chen</td><td>Furniture</td><td>Meera</td></tr>
  </table>
  <ul>
    <li><strong>Problem</strong>: "Kiran covers Electronics" is stored twice; a typo could give Kiran two categories.</li>
    <li><strong>Fix</strong>: <code>reps(rep PK, category)</code> + <code>customer_reps(customer, rep)</code>.</li>
  </ul>

  <p><strong>4NF</strong>: don't store two independent lists in one table (every phone × every address). <strong>5NF</strong>: no table that splits into 3+ pieces and rejoins losslessly. Both are rare in practice.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A correct split is <strong>lossless</strong>: joining the pieces gives back exactly the original rows. If not, you split on the wrong column.</p>
  </div>

  <h2 id="sm-denorm"><span class="num">04</span>Denormalization</h2>
  <p><strong>Denormalization</strong> = deliberately storing a fact twice (or precomputed) to make reads faster or simpler.</p>
  <ul>
    <li><strong>When</strong>: read-heavy screens (an order list showing totals), dashboards, analytics warehouses, or when joins cost more than storage.</li>
    <li><strong>Common forms</strong>: a copied column (<code>orders.customer_city</code>), a stored total (<code>orders.total_amount</code>), a summary table or materialized view, a wide "one big table" for BI.</li>
    <li><strong>Cost</strong>: the anomalies come back. Every write must update every copy (triggers, jobs), or the copies drift and become stale.</li>
  </ul>
  <div class="fx" data-lang="sql">CREATE MATERIALIZED VIEW customer_revenue AS
SELECT c.name, sum(oi.qty * oi.unit_price) AS revenue
FROM customers c
JOIN orders o       ON o.customer_id = c.customer_id AND o.status &lt;&gt; 'cancelled'
JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY c.name;
SELECT * FROM customer_revenue ORDER BY revenue DESC;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>revenue</th></tr><tr><td>Asha</td><td>1380.00</td></tr><tr><td>Chen</td><td>1270.00</td></tr></table>
  <p>Reads are one table scan, but it's stale until <code>REFRESH MATERIALIZED VIEW customer_revenue;</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop's "today's total" on a whiteboard. Fast to read, but someone must update it after every sale, or it lies.</p>
  </div>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Normalize the source of truth (OLTP). Denormalize copies built from it (caches, views, warehouse).</p>
  </div>

  <h2 id="sm-olap"><span class="num">05</span>Star &amp; Snowflake Schemas</h2>
  <p><strong>OLTP</strong> models (the app) are 3NF and hold current state, tuned for safe small writes. <strong>OLAP</strong> models (the warehouse) are star-shaped and keep history, tuned for big simple reads.</p>
  <ul>
    <li><strong>Fact table</strong>: one row per measurable event, with numbers you add up (<code>qty</code>, <code>revenue</code>) and FKs to dimensions. Tall and narrow.</li>
    <li><strong>Dimension table</strong>: the who/what/when context you filter and group by (customer, product, date). Short and wide.</li>
    <li><strong>Grain</strong>: what exactly one fact row means. Decide it first. Here: <em>one row per order line</em>.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A till receipt roll is the fact table: one line per item sold. The product catalogue, customer list and calendar are dimensions you look things up in.</p>
  </div>
  <div class="fx" data-lang="sql">CREATE TABLE dim_customer AS SELECT customer_id AS customer_key, name, coalesce(city, 'Unknown') AS city FROM customers;
CREATE TABLE dim_product  AS SELECT product_id AS product_key, name, category FROM products;
CREATE TABLE dim_date AS
SELECT to_char(d, 'YYYYMMDD')::int AS date_key, d::date AS full_date,
       extract(year FROM d)::int AS year, to_char(d, 'YYYY-MM') AS month, to_char(d, 'Dy') AS weekday
FROM generate_series('2024-05-01'::date, '2024-07-31', '1 day') d;
CREATE TABLE fact_sales AS
SELECT to_char(o.order_date, 'YYYYMMDD')::int AS date_key, o.customer_id AS customer_key,
       oi.product_id AS product_key, o.order_id, o.status,
       oi.qty, oi.qty * oi.unit_price AS revenue
FROM orders o JOIN order_items oi USING (order_id);

SELECT d.month, p.category, sum(f.revenue) AS revenue
FROM fact_sales f
JOIN dim_date d    USING (date_key)
JOIN dim_product p USING (product_key)
WHERE f.status &lt;&gt; 'cancelled'
GROUP BY 1, 2 ORDER BY 1, 2;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>month</th><th>category</th><th>revenue</th></tr><tr><td>2024-05</td><td>Electronics</td><td>1300.00</td></tr><tr><td>2024-05</td><td>Furniture</td><td>80.00</td></tr><tr><td>2024-06</td><td>Electronics</td><td>1000.00</td></tr><tr><td>2024-06</td><td>Furniture</td><td>150.00</td></tr><tr><td>2024-07</td><td>Furniture</td><td>120.00</td></tr></table>
  <ul>
    <li>Every query has one shape: fact → join dims → filter → group.</li>
    <li><code>order_id</code> and <code>status</code> live in the fact with no dimension table: a <strong>degenerate dimension</strong>.</li>
    <li><strong>Additive</strong> measures (revenue, qty) sum across any dimension; balances are <strong>semi-additive</strong> (not over time); ratios are <strong>non-additive</strong> (recompute from parts).</li>
  </ul>
  <h3>Snowflake schema</h3>
  <p>A star whose dimensions are normalized further (<code>dim_product → dim_category</code>). Less repetition, more joins. Warehouses usually prefer the star: columnar compression makes the repetition cheap.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing grains. Putting an order-level <code>shipping_fee</code> on every order-line row makes <code>SUM(shipping_fee)</code> double-count. Different grain → different fact table.</p>
  </div>

  <h2 id="sm-scd"><span class="num">06</span>Slowly Changing Dimensions</h2>
  <p>An <strong>SCD</strong> is a dimension whose attributes change occasionally (a customer's city). The question: should old facts see the old value or the new one?</p>
  <table class="tbl">
    <tr><th>Type</th><th>What you do</th><th>History?</th><th>Use when</th></tr>
    <tr><td><strong>1</strong></td><td>Overwrite the value</td><td>None</td><td>Fixing typos; history doesn't matter</td></tr>
    <tr><td><strong>2</strong></td><td>Close the old row, insert a new row with validity dates</td><td>Full</td><td>Reports must reflect the value at that time</td></tr>
    <tr><td><strong>3</strong></td><td>Add a <code>previous_city</code> column</td><td>One step back</td><td>Only "before vs after" comparisons</td></tr>
  </table>
  <p>Type 2 example: Asha moves from Mumbai to Pune on 2024-05-10.</p>
  <div class="fx" data-lang="sql">CREATE TABLE dim_customer_scd (
  customer_key serial PRIMARY KEY,       -- surrogate: one per version
  customer_id int, name text, city text,
  valid_from date, valid_to date, is_current boolean);
INSERT INTO dim_customer_scd (customer_id, name, city, valid_from, valid_to, is_current)
SELECT customer_id, name, city, signup_date, '9999-12-31', true FROM customers;

UPDATE dim_customer_scd SET valid_to = '2024-05-09', is_current = false
WHERE customer_id = 1 AND is_current;
INSERT INTO dim_customer_scd (customer_id, name, city, valid_from, valid_to, is_current)
VALUES (1, 'Asha', 'Pune', '2024-05-10', '9999-12-31', true);

SELECT * FROM dim_customer_scd WHERE customer_id = 1 ORDER BY customer_key;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>customer_key</th><th>customer_id</th><th>name</th><th>city</th><th>valid_from</th><th>valid_to</th><th>is_current</th></tr><tr><td>1</td><td>1</td><td>Asha</td><td>Mumbai</td><td>2024-01-05</td><td>2024-05-09</td><td>f</td></tr><tr><td>5</td><td>1</td><td>Asha</td><td>Pune</td><td>2024-05-10</td><td>9999-12-31</td><td>t</td></tr></table>
  <p>Each order joins to the version that was valid on its date:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.order_date, d.city
FROM orders o
JOIN dim_customer_scd d
  ON d.customer_id = o.customer_id
 AND o.order_date BETWEEN d.valid_from AND d.valid_to
WHERE o.customer_id = 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>order_date</th><th>city</th></tr><tr><td>100</td><td>2024-05-01</td><td>Mumbai</td></tr><tr><td>101</td><td>2024-05-20</td><td>Pune</td></tr></table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With Type 2, joining on <code>customer_id</code> alone matches every version and duplicates facts. Join on the date range, or on <code>is_current</code> for "as of now".</p>
  </div>

  <h2 id="sm-json"><span class="num">07</span>JSONB vs Columns</h2>
  <p><strong>JSONB</strong> = a PostgreSQL column type holding binary JSON. Fields can vary per row.</p>
  <div class="fx" data-lang="sql">ALTER TABLE products ADD COLUMN attrs jsonb;
UPDATE products SET attrs = '{"ram_gb": 16, "screen": 14}' WHERE product_id = 10;
UPDATE products SET attrs = '{"color": "black"}'           WHERE product_id = 13;
SELECT name, attrs -&gt;&gt; 'ram_gb' AS ram_gb, attrs -&gt;&gt; 'color' AS color
FROM products WHERE attrs IS NOT NULL;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>ram_gb</th><th>color</th></tr><tr><td>Laptop</td><td>16</td><td>NULL</td></tr><tr><td>Lamp</td><td>NULL</td><td>black</td></tr></table>
  <table class="tbl">
    <tr><th>Use a JSONB column for</th><th>Use proper columns for</th></tr>
    <tr><td>Sparse, varying attributes (laptop specs vs lamp colour)</td><td>Anything you filter, join or group on often</td></tr>
    <tr><td>Raw event or API payloads you store as-is</td><td>Fields that need types, NOT NULL, FK, CHECK</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>JSONB as an escape from design. The schema still exists, now hidden in app code, with no type checks: <code>"16"</code> vs <code>16</code> vs <code>"16GB"</code>. Promote a field to a column once you query it regularly. A GIN index helps <code>@&gt;</code> containment searches.</p>
  </div>

  <h2 id="sm-conv"><span class="num">08</span>Practical Conventions</h2>
  <ul>
    <li><strong>Naming</strong>: <code>snake_case</code>, one style for table names (plural <code>orders</code> or singular), FK named after its target (<code>customer_id</code>), booleans as <code>is_</code>/<code>has_</code>, no reserved words (<code>user</code>, <code>order</code>).</li>
    <li><strong>Surrogate keys</strong>: an <code>id</code> with no business meaning (<code>bigint GENERATED ALWAYS AS IDENTITY</code>, or UUID for distributed systems). Keep the natural key (email, SKU) as UNIQUE.</li>
    <li><strong>Audit timestamps</strong>: <code>created_at</code> and <code>updated_at</code> as <code>timestamptz</code> (stored in UTC) with defaults.</li>
    <li><strong>Soft delete</strong>: <code>deleted_at timestamptz</code> instead of <code>DELETE</code>, so you keep history and can undo.</li>
  </ul>
  <div class="fx" data-lang="sql">CREATE TABLE reviews (
  review_id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers,
  product_id  int NOT NULL REFERENCES products,
  rating      smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz                       -- NULL = live
);
-- one live review per customer per product; deleted ones don't block a new one
CREATE UNIQUE INDEX reviews_one_live ON reviews (customer_id, product_id) WHERE deleted_at IS NULL;</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Soft deletes leak. Every query must add <code>WHERE deleted_at IS NULL</code>; forget once and deleted rows reappear in reports. A view <code>live_reviews</code> helps. Also, <code>updated_at</code> doesn't update itself: set it in a trigger or in the app.</p>
  </div>

  <h2 id="sm-rev"><span class="num">09</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Wide table</strong> → update, insert and delete anomalies; cause: one table, many things.</li>
    <li><strong>Entities</strong> → tables; <strong>relationships</strong> → FKs on the many side; <strong>M:N</strong> → junction table.</li>
    <li><strong>1NF</strong>: atomic cells, no lists or repeating groups.</li>
    <li><strong>2NF</strong>: no column depends on part of a composite key.</li>
    <li><strong>3NF</strong>: no non-key → non-key dependency. <strong>BCNF</strong>: every determinant is a key.</li>
    <li><strong>Denormalize</strong> copies for read speed; pay with sync work and staleness.</li>
    <li><strong>Star</strong>: fact (events, measures) + dimensions (context). <strong>Declare the grain first.</strong></li>
    <li><strong>Snowflake</strong> = star with normalized dimensions: less repetition, more joins.</li>
    <li><strong>SCD</strong>: Type 1 overwrite, Type 2 new row with valid_from/valid_to, Type 3 previous-value column.</li>
    <li><strong>JSONB</strong> for sparse or raw data; columns for anything filtered, joined or constrained.</li>
  </ol></div>

  <h2 id="sm-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Name the three anomalies of an unnormalized table, with a shop example of each.</summary><div class="qa-body">Update: Asha's city stored on every order row; changing one row leaves her in two cities. Insert: a customer like Dia can't be stored until she orders. Delete: deleting Ben's only order deletes the only record of Ben.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A table <code>enrolments(student_id, course_id, student_name, course_title, grade)</code> with key (student_id, course_id). Which NF does it break and how do you fix it?</summary><div class="qa-body">2NF: <code>student_name</code> depends only on student_id and <code>course_title</code> only on course_id (partial dependencies). Split into <code>students(student_id, name)</code>, <code>courses(course_id, title)</code>, <code>enrolments(student_id, course_id, grade)</code>. Grade depends on both, so it stays.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between 3NF and BCNF?</summary><div class="qa-body">3NF allows A → B where B is part of a candidate key. BCNF doesn't: every determinant must be a candidate key. They differ only with overlapping composite candidate keys, e.g. (customer, category, rep) where rep → category.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If normalization is good, why do warehouses denormalize?</summary><div class="qa-body">Warehouses are read-mostly and loaded in batches, so update anomalies barely matter: the pipeline rewrites the copy. Meanwhile fewer joins make big scans faster and queries simpler for analysts. The OLTP source stays normalized as the truth.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the "grain" of a fact table, and what goes wrong if you don't fix it?</summary><div class="qa-body">The exact meaning of one row, e.g. "one product line on one order". Without it, measures at different levels get mixed (order-level shipping on line-level rows), and sums double-count. Decide grain before choosing dimensions or measures.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A customer changes city. Revenue-by-city reports must show sales where they lived at the time. Which SCD type, and how do you join?</summary><div class="qa-body">Type 2. Keep one row per version with a surrogate <code>customer_key</code>, <code>valid_from</code>, <code>valid_to</code>, <code>is_current</code>. Either store the version's key in the fact at load time, or join on <code>customer_id</code> plus <code>order_date BETWEEN valid_from AND valid_to</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you put data in a JSONB column instead of columns?</summary><div class="qa-body">Sparse or varying attributes (product specs per category), raw event/API payloads, or fields you don't control yet. Use real columns for anything you filter, join, aggregate or constrain often, since JSONB gives no type checks or FKs and needs casts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design a schema for a library: books, copies, members, loans.</summary><div class="qa-body"><code>books(book_id, isbn UNIQUE, title)</code>, <code>authors(author_id, name)</code>, <code>book_authors(book_id, author_id)</code> for M:N, <code>copies(copy_id, book_id FK, shelf)</code>, <code>members(member_id, email UNIQUE, joined_at)</code>, <code>loans(loan_id, copy_id FK, member_id FK, borrowed_at, due_at, returned_at NULL)</code>. "Currently out" = <code>returned_at IS NULL</code>; a partial unique index on <code>copy_id WHERE returned_at IS NULL</code> stops double loans.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design a schema for Instagram-style follows and likes.</summary><div class="qa-body"><code>users(user_id, username UNIQUE)</code>, <code>posts(post_id, user_id FK, created_at)</code>, <code>follows(follower_id FK, followee_id FK, created_at, PK(follower_id, followee_id), CHECK(follower_id &lt;&gt; followee_id))</code>, <code>likes(user_id, post_id, created_at, PK(user_id, post_id))</code>. Both are M:N junction tables; the composite PK prevents double likes. Add a denormalized <code>posts.like_count</code> only if reading counts is the bottleneck.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the analytics model for a ride-hailing app. What's the fact table and its grain?</summary><div class="qa-body"><code>fact_trips</code>, grain = one completed or cancelled trip. Measures: fare, distance_km, duration_min, tip. Dimensions: <code>dim_rider</code>, <code>dim_driver</code> (SCD2 for city/vehicle), <code>dim_date</code>, <code>dim_time</code>, <code>dim_location</code> (pickup and drop-off, used twice as role-playing dimensions). Status is a degenerate dimension.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Soft delete vs hard delete: trade-offs?</summary><div class="qa-body">Soft (<code>deleted_at</code>): keeps history, enables undo and audits, but every query must filter it, unique constraints need partial indexes, and the table keeps growing. Hard: simple and required for "right to be forgotten" (GDPR), but history is gone unless archived elsewhere.</div></details>
</main>`
});
