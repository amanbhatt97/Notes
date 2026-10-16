// notes/databases/sql_modeling.js — Data Modeling
Object.assign(TOPIC_CONTENT, {
  "sql_modeling": `<main>
  <h1>Data Modeling</h1>
  <p class="lead">How to decide which tables exist and what goes in each. A good model makes wrong data hard to store and common questions easy to ask; a bad one quietly corrupts both.</p>

  <h2 id="sm-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">Data Modeling</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Why model</div>
      <ul>
        <li><b>Goal</b> — every fact stored once, in the right table</li>
        <li><b>Update anomaly</b> — Asha's city on 3 rows; change one → two cities</li>
        <li><b>Insert anomaly</b> — can't record Dia until she orders</li>
        <li><b>Delete anomaly</b> — delete Ben's only order → Ben vanishes</li>
        <li><b>Root cause</b> — one table describing several things → one table per thing</li>
        <li>💡 one salt jar per dish: refill means hunting every jar</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Entities &amp; relationships</div>
      <ul>
        <li><b>Nouns</b> → tables; facts → columns; <b>verbs</b> → FKs</li>
        <li><b>1:N</b> — FK on the "many" side (<code>orders.customer_id</code>)</li>
        <li><b>M:N</b> — junction table <code>order_items</code>, PK (order_id, product_id)
          <ul><li>holds its own attributes: qty, unit_price</li></ul></li>
        <li><b>Self 1:N</b> — <code>employees.manager_id</code> → employees</li>
        <li>⚠ <b>List column</b> <code>'10,13'</code> — string search, no FK; use a junction table</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Normal forms</div>
      <ul>
        <li><b>Functional dependency</b> — A → B: knowing A fixes B</li>
        <li><b>1NF</b> — atomic cells, no lists / repeating groups, a key</li>
        <li><b>2NF</b> — no column depends on <em>part</em> of a composite key</li>
        <li><b>3NF</b> — no non-key → non-key (order → customer → city)
          <ul><li>"the key, the whole key, nothing but the key"</li></ul></li>
        <li><b>BCNF</b> — every determinant is a candidate key (rep → category)</li>
        <li><b>4NF / 5NF</b> — no independent multi-valued lists; rare</li>
        <li>⚠ <b>Lossless</b> — joining pieces must give back the original rows</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Denormalization</div>
      <ul>
        <li><b>What</b> — store a fact twice or precomputed for faster reads</li>
        <li><b>Forms</b> — copied column, stored total, summary table, materialized view, one big table</li>
        <li><b>Cost</b> — anomalies return; sync every copy or it drifts</li>
        <li><b>MV</b> — stale until <code>REFRESH MATERIALIZED VIEW</code></li>
        <li><b>Rule</b> — normalize the source of truth; denormalize copies</li>
        <li>💡 "today's total" on a whiteboard</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Star &amp; snowflake</div>
      <ul>
        <li><b>OLTP</b> 3NF, current state, small writes; <b>OLAP</b> star, history, big reads</li>
        <li><b>Fact</b> — one row per event; measures + FKs; tall &amp; narrow</li>
        <li><b>Dimension</b> — who/what/when context; short &amp; wide</li>
        <li><b>Grain</b> — what one fact row means; decide first</li>
        <li><b>Measures</b> — additive (revenue), semi-additive (balance), non-additive (ratio)</li>
        <li><b>Degenerate dim</b> — order_id kept in the fact, no table</li>
        <li><b>Snowflake</b> — normalized dims; fewer repeats, more joins</li>
        <li>⚠ <b>Mixed grain</b> — order-level shipping on line rows double-counts</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Slowly changing dims</div>
      <ul>
        <li><b>Type 1</b> — overwrite; no history (typo fixes)</li>
        <li><b>Type 2</b> — new row per version: surrogate key, valid_from, valid_to, is_current</li>
        <li><b>Type 3</b> — <code>previous_city</code> column; one step back</li>
        <li><b>Type 2 join</b> — <code>order_date BETWEEN valid_from AND valid_to</code></li>
        <li>⚠ <b>Join on id only</b> → every version matches → duplicated facts</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">JSONB vs columns</div>
      <ul>
        <li><b>JSONB</b> — binary JSON column; fields vary per row; <code>attrs -&gt;&gt; 'ram_gb'</code></li>
        <li><b>Use for</b> — sparse attributes, raw event/API payloads</li>
        <li><b>Columns for</b> — anything filtered, joined, grouped, constrained</li>
        <li>⚠ <b>Hidden schema</b> — "16" vs 16 vs "16GB"; promote hot fields</li>
        <li><b>GIN index</b> — speeds <code>@&gt;</code> containment</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Conventions</div>
      <ul>
        <li><b>Naming</b> — snake_case, FK named after target, <code>is_</code>/<code>has_</code>, avoid <code>user</code>/<code>order</code></li>
        <li><b>Surrogate key</b> — <code>bigint GENERATED ALWAYS AS IDENTITY</code> or UUID; natural key UNIQUE</li>
        <li><b>Audit</b> — <code>created_at</code>, <code>updated_at timestamptz</code> (trigger/app updates it)</li>
        <li><b>Soft delete</b> — <code>deleted_at</code>; partial unique index <code>WHERE deleted_at IS NULL</code></li>
        <li>⚠ <b>Leaks</b> — every query must filter deleted rows; use a view</li>
      </ul>
    </div>
  </div>
</div>


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
      <div class="rm-item rm-done" data-target="sm-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including "design a schema for X"</span></div></div>
    </div>
  </div>

  <h2 id="sm-why"><span class="num">01</span>Why Modeling Matters</h2>
  <p>A friend starts a small online shop and keeps everything in one Excel sheet: one row per item sold, with the customer's name, city, the product, its category, quantity and price. It works for a week. Then Asha moves to Pune, and her city must be corrected in 3 rows. A new customer signs up but hasn't bought anything, so there is no row to put her in. The sheet is starting to lie.</p>
  <p><strong>Data modeling</strong> is deciding the tables, their columns, keys and links, so every fact is stored <em>once</em> in the right place. You will meet it whenever you build a new feature ("where do reviews go?"), in every analytics job (warehouse design), and in interviews ("design a schema for X").</p>
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
  <p>Look at the <code>cust_city</code> column: "Mumbai" is written next to Asha 3 times. "Electronics" is written 3 times too. Each is one fact stored many times. That repetition causes three <strong>anomalies</strong> (ways data goes wrong when it changes). Each one below is run for real:</p>
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
  <p>The UPDATE touched only order 100's row, so the database now says Asha lives in Mumbai <em>and</em> Pune. The DELETE removed Ben's only order, and Ben went with it: zero rows mention him now.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One cause: <strong>one table describing several things</strong> (customers, products and orders all mixed). Fix: one table per thing. The rest of the note is about how to do that split properly, and when to undo it on purpose.</p>
  </div>

  <h2 id="sm-er"><span class="num">02</span>Entities &amp; Relationships</h2>
  <p>Describe the shop in a sentence: "A <em>customer</em> places <em>orders</em>; an <em>order</em> contains <em>products</em>." The nouns are the things: customer, order, product. Each thing becomes a table. This is called an <strong>entity</strong> (a thing we store facts about). The verbs ("places", "contains") are the links between them: <strong>relationships</strong>.</p>
  <p>A link is built with a <strong>foreign key</strong> (FK): a column that holds another table's id. <code>orders.customer_id = 1</code> says "this order belongs to customer 1". Then ask about each link: how many on each side? One customer, many orders. That count is the <strong>cardinality</strong>: 1:1, 1:N (one-to-many), or M:N (many-to-many).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school. One class has many students (1:N): each student's record carries the class name. Students and clubs are M:N: a student joins many clubs, a club has many students. You can't write all club names in one cell, so the school keeps a membership register with one line per (student, club). That register is the junction table.</p>
  </div>
  <p>In the picture, each box is a table, and the numbers on each line show the cardinality:</p>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <g text-anchor="middle">
      <rect x="0" y="40" width="120" height="40" rx="6" class="fb sb"/><text x="60" y="65" font-weight="bold">customers</text>
      <rect x="160" y="40" width="120" height="40" rx="6" class="fb sb"/><text x="220" y="65" font-weight="bold">orders</text>
      <rect x="320" y="40" width="130" height="40" rx="6" class="fv"/><text x="385" y="58" font-weight="bold">order_items</text><text x="385" y="73" font-size="10" class="tm">qty, unit_price</text>
      <rect x="490" y="40" width="110" height="40" rx="6" class="fb sb"/><text x="545" y="65" font-weight="bold">products</text>
    </g>
    <g stroke="currentColor"><line x1="120" y1="60" x2="160" y2="60"/><line x1="280" y1="60" x2="320" y2="60"/><line x1="450" y1="60" x2="490" y2="60"/></g>
    <g font-size="11" class="tb"><text x="124" y="54">1</text><text x="148" y="54">N</text><text x="284" y="54">1</text><text x="308" y="54">N</text><text x="454" y="54">N</text><text x="478" y="54">1</text></g>
    <text x="140" y="98" text-anchor="middle" font-size="10" class="tm">FK orders.customer_id</text>
    <text x="385" y="98" text-anchor="middle" font-size="10" class="tm">junction table = M:N orders ↔ products</text>
    <text x="300" y="20" text-anchor="middle" font-size="11" class="tm">FK always sits on the "many" side</text>
    <text x="140" y="116" text-anchor="middle" font-size="10" class="tm">(0..N: Dia has none)</text>
  </svg><figcaption>The shop as an ER chain. M:N never fits in two tables; it needs the middle one.</figcaption></figure>
  <table class="tbl">
    <tr><th>Relationship (shop)</th><th>Cardinality</th><th>How it's built</th></tr>
    <tr><td>customer places orders</td><td>1 : N (0..N: Dia has none)</td><td>FK <code>orders.customer_id</code></td></tr>
    <tr><td>order contains products</td><td>M : N</td><td><strong>Junction table</strong> <code>order_items</code>, PK (order_id, product_id)</td></tr>
    <tr><td>employee reports to manager</td><td>1 : N, same table</td><td>Self-FK <code>employees.manager_id</code></td></tr>
  </table>
  <ul>
    <li><strong>Rule</strong>: the FK always sits on the "many" side. (An order has one customer, so <code>customer_id</code> goes in <code>orders</code>. A customer has many orders, so you can't put one <code>order_id</code> in <code>customers</code>.) M:N always needs a third table.</li>
    <li>The junction table often grows its own attributes: <code>qty</code> and <code>unit_price</code> belong to "this product in this order", not to either side.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Storing M:N as a list column (<code>orders.product_ids = '10,13'</code>) makes "who bought Lamp?" a string search, with no FK checks. Use a junction table.</p>
  </div>

  <h2 id="sm-norm"><span class="num">03</span>Normalization</h2>
  <p>Section 01 showed the disease (repeated facts) and section 02 the medicine (one table per thing). <strong>Normalization</strong> is the step-by-step recipe for applying it: split tables until each fact lives in one place. The steps are numbered <strong>normal forms</strong> (1NF, 2NF, 3NF, …). Each step removes one kind of repetition. Interviewers ask "which normal form does this table break?", so learn the steps with the example below.</p>
  <p>One idea powers all the steps: the <strong>functional dependency</strong>. Written <code>A → B</code>, it means "if you know A, you know B". Know the product (Laptop) and you know its category (Electronics): <code>product → category</code>. Know the order id and you know its date: <code>order_id → order_date</code>. The <strong>key</strong> of a table is the column (or columns) that decides everything else in the row.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A PNR number on a train ticket decides the passenger, the train and the seat. PNR is the key. The train number alone decides the route, but not the passenger. Normalization asks, for every column: "which thing really decides this?" and moves the column to that thing's table.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
    <defs><marker id="sm-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="10" width="190" height="200" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/>
    <text x="95" y="30" text-anchor="middle" font-weight="bold">orders_flat (1NF)</text>
    <g font-size="11"><text x="14" y="54" class="tb">order_id, order_date</text><text x="14" y="74" class="tr">cust_name, cust_city</text><text x="14" y="94" class="tg">product, category</text><text x="14" y="114">qty, unit_price</text></g>
    <text x="14" y="146" font-size="10" class="tm">key = (order_id, product)</text>
    <text x="14" y="164" font-size="10" class="tm">7 rows; Asha's city ×3,</text><text x="14" y="178" font-size="10" class="tm">"Electronics" ×3</text>
    <g stroke="currentColor"><line x1="190" y1="50" x2="268" y2="30" marker-end="url(#sm-ar)"/><line x1="190" y1="70" x2="268" y2="80" marker-end="url(#sm-ar)"/><line x1="190" y1="90" x2="268" y2="130" marker-end="url(#sm-ar)"/><line x1="190" y1="110" x2="268" y2="180" marker-end="url(#sm-ar)"/></g>
    <text x="210" y="216" font-size="10" class="tm">split by what each column depends on</text>
    <g font-size="11">
      <rect x="270" y="12" width="320" height="36" rx="6" class="fb sb"/><text x="280" y="34">orders (order_id PK, order_date, cust → FK)</text>
      <rect x="270" y="62" width="320" height="36" rx="6" class="fr sr"/><text x="280" y="84">customers (name PK, city)  ← 3NF step</text>
      <rect x="270" y="112" width="320" height="36" rx="6" class="fg sg"/><text x="280" y="134">products (product PK, category)  ← 2NF</text>
      <rect x="270" y="162" width="320" height="36" rx="6" class="fv"/><text x="280" y="184">items (order_id, product, qty, unit_price)</text>
    </g>
  </svg><figcaption>Each colour is one dependency. Give each its own table and every fact is stored once.</figcaption></figure>
  <p>Follow the arrows: each coloured group of columns in the flat table depends on something different, so each gets its own table on the right.</p>
  <p>Step by step, starting from the shop as a beginner would first type it: one row per order, with all the items written in one cell.</p>
  
  <div class="fx" data-lang="sql">SELECT order_id, cust_name, cust_city,
       string_agg(product || ' x' || qty, ', ' ORDER BY product) AS items
FROM orders_flat GROUP BY 1, 2, 3 ORDER BY 1;</div>
  <table class="tbl out"><caption>Unnormalized (built from an untouched orders_flat)</caption><tr><th>order_id</th><th>cust_name</th><th>cust_city</th><th>items</th></tr><tr><td>100</td><td>Asha</td><td>Mumbai</td><td>Lamp x2, Laptop x1</td></tr><tr><td>101</td><td>Asha</td><td>Mumbai</td><td>Phone x1</td></tr><tr><td>102</td><td>Ben</td><td>Delhi</td><td>Desk x1</td></tr><tr><td>103</td><td>Chen</td><td>Mumbai</td><td>Desk x1, Phone x2</td></tr><tr><td>104</td><td>Chen</td><td>Mumbai</td><td>Lamp x3</td></tr></table>

  <h3>1NF: atomic values</h3>
  <p>The cell "Lamp x2, Laptop x1" holds two facts. To count lamps sold, a program must cut the text at commas and at "x". That breaks the moment someone types "Lamp ×2".</p>
  <ul>
    <li><strong>Rule</strong>: every cell holds one value ("atomic" = cannot be split further); no lists, no repeating groups (<code>item1, item2, …</code>); rows have a key.</li>
    <li><strong>Violation</strong>: <code>items</code> holds a list. "How many Lamps sold?" needs string parsing.</li>
    <li><strong>Fix</strong>: one row per item. That is exactly <code>orders_flat</code> from section 01, key = (order_id, product).</li>
  </ul>

  <h3>2NF: no partial dependency</h3>
  <p>The key of <code>orders_flat</code> is two columns together: (order_id, product). Now ask each other column: "do you need <em>both</em> parts of the key, or just one?" <code>qty</code> needs both (how many of <em>this product</em> in <em>this order</em>). But <code>order_date</code> needs only order_id. And <code>category</code> needs only product. A column that depends on just a part of the key is a <strong>partial dependency</strong>. It is why the date repeats for every line of order 100.</p>
  <ul>
    <li><strong>Rule</strong>: every non-key column depends on the <em>whole</em> key, not part of it. (Only matters when the key is more than one column.)</li>
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
  <p>Look at <code>orders_2nf</code>: Asha's city still appears twice (orders 100 and 101). Why? <code>cust_city</code> doesn't really depend on the order. It depends on the customer, who depends on the order. A chain: <code>order_id → cust_name → cust_city</code>. A dependency that goes through a middle column is <strong>transitive</strong> ("passed along").</p>
  <ul>
    <li><strong>Rule</strong>: non-key columns depend on the key <em>directly</em>, not through another non-key column. ("The key, the whole key, and nothing but the key.")</li>
    <li><strong>Violation</strong>: <code>order_id → cust_name → cust_city</code>. City is a fact about the customer, so Asha's city still repeats per order.</li>
    <li><strong>Fix</strong>: move customer facts out; orders keep only a reference.</li>
  </ul>
  <div class="fx" data-lang="sql">CREATE TABLE customers_3nf AS SELECT DISTINCT cust_name, cust_city FROM orders_2nf;
CREATE TABLE orders_3nf    AS SELECT order_id, order_date, cust_name FROM orders_2nf;
SELECT * FROM customers_3nf ORDER BY cust_name;</div>
  <table class="tbl out"><caption>customers_3nf</caption><tr><th>cust_name</th><th>cust_city</th></tr><tr><td>Asha</td><td>Mumbai</td></tr><tr><td>Ben</td><td>Delhi</td></tr><tr><td>Chen</td><td>Mumbai</td></tr></table>
  <p>Now Asha's city is written exactly once. Add <strong>surrogate ids</strong> (made-up numbers like <code>customer_id = 1</code> instead of names, which can repeat or change) and you have the real <code>shop</code> schema. Dia is still missing: she can only exist because <code>customers</code> is its own table in <code>shop</code>.</p>
  <p>Quick self-check. Flat sheet → (1NF) one fact per cell → (2NF) move columns that depend on only part of the key → (3NF) move columns that depend on another non-key column. Most real schemas stop here.</p>

  <h3>BCNF: every determinant is a key</h3>
  <p>A rare, stricter version of 3NF, asked in interviews. Two words first. A <strong>candidate key</strong> is any column set that could serve as the key (a table may have more than one: <code>customer_id</code> and <code>email</code> both identify a customer). A <strong>determinant</strong> is the left side of any dependency, the A in <code>A → B</code>.</p>
  <ul>
    <li><strong>Rule</strong>: if A → B, then A must be a candidate key. In words: only keys are allowed to decide other columns.</li>
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

  <p><strong>4NF</strong>: don't store two independent lists in one table. If a customer has 2 phones and 3 addresses, one table with both columns needs 2 × 3 = 6 rows, though the phones have nothing to do with the addresses. Keep two tables. <strong>5NF</strong>: no table that splits into 3+ pieces and rejoins losslessly. Both are rare in practice.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A correct split is <strong>lossless</strong>: joining the pieces gives back exactly the original rows, nothing missing and nothing extra. If not, you split on the wrong column.</p>
  </div>

  <h2 id="sm-denorm"><span class="num">04</span>Denormalization</h2>
  <p>The normalized shop is clean, but every screen now needs joins. "Show the order list with each order's total" means joining three tables and summing, on every page load, for every user. When reads are far more common than writes, it can be worth storing some facts twice on purpose.</p>
  <p><strong>Denormalization</strong> is deliberately storing a fact twice (or precomputed) to make reads faster or simpler. It is normalization's opposite, done with open eyes.</p>
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
  <p>A <strong>materialized view</strong> is a query whose answer is saved as a real table. Reads are now one small table scan, but the answer is frozen: it's stale until <code>REFRESH MATERIALIZED VIEW customer_revenue;</code>. (A plain view saves only the query and re-runs it each time.)</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop's "today's total" on a whiteboard. Fast to read, but someone must update it after every sale, or it lies.</p>
  </div>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Normalize the source of truth (OLTP). Denormalize copies built from it (caches, views, warehouse).</p>
  </div>

  <h2 id="sm-olap"><span class="num">05</span>Star &amp; Snowflake Schemas</h2>
  <p>The shop app needs 3NF: small safe writes, current state. The analyst asking "revenue per category per month for the last 3 years" needs something else: huge reads over history, with simple queries. So companies keep a second database for analysis, a <strong>data warehouse</strong>, with its own table shape.</p>
  <div class="cards">
    <div><b>OLTP (the app)</b><p>3NF, current state, safe small writes.</p></div>
    <div><b>OLAP (warehouse)</b><p>Star-shaped, keeps history, big simple reads.</p></div>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 220" width="600">
    <g stroke="currentColor" opacity=".6"><line x1="95" y1="64" x2="170" y2="96"/><line x1="505" y1="64" x2="430" y2="96"/><line x1="300" y1="156" x2="300" y2="166"/></g>
    <rect x="170" y="70" width="260" height="86" rx="8" class="fb sb"/>
    <text x="300" y="90" text-anchor="middle" font-weight="bold">fact_sales</text>
    <g font-size="10" text-anchor="middle"><text x="300" y="106" class="tm">date_key, customer_key, product_key</text><text x="300" y="122">qty · revenue  (measures)</text><text x="300" y="138" class="tm">order_id · status (degenerate)</text></g>
    <text x="300" y="150" text-anchor="middle" font-size="9" class="tm">grain: one order line</text>
    <rect x="10" y="12" width="170" height="52" rx="8" class="ft st"/><text x="95" y="32" text-anchor="middle" font-weight="bold">dim_date</text><text x="95" y="50" text-anchor="middle" font-size="10" class="tm">year, month, weekday</text>
    <rect x="420" y="12" width="170" height="52" rx="8" class="ft st"/><text x="505" y="32" text-anchor="middle" font-weight="bold">dim_customer</text><text x="505" y="50" text-anchor="middle" font-size="10" class="tm">name, city</text>
    <rect x="215" y="166" width="170" height="48" rx="8" class="ft st"/><text x="300" y="186" text-anchor="middle" font-weight="bold">dim_product</text><text x="300" y="203" text-anchor="middle" font-size="10" class="tm">name, category</text>
    <rect x="430" y="166" width="160" height="48" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 3" opacity=".6"/><text x="510" y="186" text-anchor="middle" font-size="11">dim_category</text><text x="510" y="203" text-anchor="middle" font-size="10" class="tm">snowflake only</text>
    <line x1="385" y1="190" x2="428" y2="190" stroke="currentColor" stroke-dasharray="4 3" opacity=".6"/>
  </svg><figcaption>Tall fact in the middle, short wide dimensions around it. Every query: fact → join dims → filter → group.</figcaption></figure>
  <p>That shape is a <strong>star schema</strong>: one big table of events in the middle, small lookup tables around it, like a star. Look at the picture: the middle box holds numbers, the outer boxes hold descriptions.</p>
  <ul>
    <li><strong>Fact table</strong>: one row per measurable event: numbers you add up + FKs to dimensions.</li>
    <li><strong>Dimension table</strong>: the who/what/when you filter and group by.</li>
    <li><strong>Grain</strong>: what one fact row means. Decide it first. Here: <em>one order line</em>.</li>
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
  <p>Read the query: start at the fact, join the date and product dimensions, filter, group, sum. Every warehouse query has that same shape, so analysts learn it once.</p>
  <ul>
    <li>Every query has one shape: fact → join dims → filter → group.</li>
    <li><code>order_id</code> and <code>status</code> live in the fact with no dimension table: a <strong>degenerate dimension</strong>.</li>
    <li><strong>Additive</strong> measures (revenue, qty) sum across any dimension. A bank balance is <strong>semi-additive</strong>: you can add balances across accounts, but not across days (Monday's ₹100 + Tuesday's ₹100 is not ₹200). Ratios like "average price" are <strong>non-additive</strong>: recompute from the parts.</li>
  </ul>
  <h3>Snowflake schema</h3>
  <p>A star whose dimensions are normalized further (<code>dim_product → dim_category</code>, the dashed box in the picture). Less repetition, more joins. Warehouses usually prefer the star: they store data column by column and compress repeated values, so repetition is nearly free.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing grains. Putting an order-level <code>shipping_fee</code> on every order-line row makes <code>SUM(shipping_fee)</code> double-count. Different grain → different fact table.</p>
  </div>

  <h2 id="sm-scd"><span class="num">06</span>Slowly Changing Dimensions</h2>
  <p>Asha lived in Mumbai, bought a laptop, then moved to Pune and bought a phone. The city report asks: which city gets the laptop sale? If <code>dim_customer</code> simply overwrote her city with Pune, the laptop would move to Pune too, and last year's Mumbai report would change. History would be rewritten.</p>
  <p>A dimension whose values change now and then is a <strong>slowly changing dimension</strong> (SCD). The question: should old facts see the old value or the new one? There are three standard answers, called types:</p>
  <table class="tbl">
    <tr><th>Type</th><th>What you do</th><th>History?</th><th>Use when</th></tr>
    <tr><td><strong>1</strong></td><td>Overwrite the value</td><td>None</td><td>Fixing typos; history doesn't matter</td></tr>
    <tr><td><strong>2</strong></td><td>Close the old row, insert a new row with validity dates</td><td>Full</td><td>Reports must reflect the value at that time</td></tr>
    <tr><td><strong>3</strong></td><td>Add a <code>previous_city</code> column</td><td>One step back</td><td>Only "before vs after" comparisons</td></tr>
  </table>
  <p>Type 2 is the one interviewers want. The idea: never overwrite. Close the old row by giving it an end date, and add a new row for the new value. Asha then has two rows, one per "version" of her, each with the dates it was true. Example: Asha moves from Mumbai to Pune on 2024-05-10.</p>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <rect x="20" y="44" width="300" height="32" class="fb sb"/><text x="170" y="65" text-anchor="middle">key 1 · Mumbai · is_current f</text>
    <rect x="322" y="44" width="268" height="32" class="fg sg"/><text x="456" y="65" text-anchor="middle">key 5 · Pune · is_current t</text>
    <g font-size="10" class="tm"><text x="20" y="96">2024-01-05</text><text x="320" y="96" text-anchor="end">05-09</text><text x="324" y="96">05-10</text><text x="590" y="96" text-anchor="end">9999-12-31</text></g>
    <circle cx="280" cy="28" r="5" class="tb"/><text x="272" y="18" text-anchor="end" font-size="11">order 100 (05-01) → Mumbai</text>
    <circle cx="380" cy="28" r="5" class="tg"/><text x="388" y="18" font-size="11">order 101 (05-20) → Pune</text>
    <line x1="280" y1="33" x2="280" y2="44" stroke="currentColor"/><line x1="380" y1="33" x2="380" y2="44" stroke="currentColor"/>
  </svg><figcaption>SCD Type 2: Asha's two versions tile the timeline; each order lands in the version valid on its date.</figcaption></figure>
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
  <p>Read the result: row 1 is Asha-in-Mumbai, valid from signup to 9 May, no longer current. Row 5 is Asha-in-Pune, valid from 10 May "forever" (9999-12-31 is the usual way to write "no end yet"). Each order joins to the version that was valid on its date:</p>
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
  <p>A laptop has RAM and screen size. A lamp has a colour. A desk has width and material. If every product attribute became a column, <code>products</code> would have 50 columns, mostly empty for each row. Normalizing into an attributes table works but makes every product page a join.</p>
  <p>Postgres offers a middle path. <strong>JSONB</strong> is a column type holding JSON (the <code>{"key": value}</code> format used by web APIs) in a fast binary form. Each row can hold different keys. <code>attrs -&gt;&gt; 'ram_gb'</code> pulls one key out as text:</p>
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
  <p>Habits that every team expects in a real schema. None is a theory rule; each prevents a bug someone has already had.</p>
  <ul>
    <li><strong>Naming</strong>: <code>snake_case</code>, one style for table names (plural <code>orders</code> or singular), FK named after its target (<code>customer_id</code>), booleans as <code>is_</code>/<code>has_</code>, no reserved words (<code>user</code>, <code>order</code>).</li>
    <li><strong>Surrogate keys</strong>: an <code>id</code> with no business meaning (<code>bigint GENERATED ALWAYS AS IDENTITY</code>, or UUID for distributed systems). Why not use the email as the key? Emails change, and then every FK pointing at it must change too. Keep the natural key (email, SKU) as UNIQUE instead.</li>
    <li><strong>Audit timestamps</strong>: <code>created_at</code> and <code>updated_at</code> as <code>timestamptz</code> (stored in UTC) with defaults.</li>
    <li><strong>Soft delete</strong>: <code>deleted_at timestamptz</code> instead of <code>DELETE</code>, so you keep history and can undo. Like moving a file to the Recycle Bin instead of wiping it.</li>
  </ul>
  <p>All four habits in one real table:</p>
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

  <h2 id="sm-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In plain words: what does "A → B" (functional dependency) mean? Give a shop example.</summary><div class="qa-body">"If you know A, you know B." <code>product_id → category</code>: knowing the product is Laptop tells you the category is Electronics. Normalization moves each column into the table of whatever decides it.</div></details>
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
