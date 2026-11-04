// notes/databases/sql_relational.js — Relational Model & PostgreSQL
Object.assign(TOPIC_CONTENT, {
  "sql_relational": `<main>
  <h1>Relational Model &amp; PostgreSQL</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Relational Model &amp; PostgreSQL</span></div>
  <p class="lead">A relational database stores information in tables that point at each other, and almost every company's most important data (customers, orders, payments) lives in one. Before you can write good queries you need to know how such a database is designed: why one big spreadsheet is split into several tables, how a row in one table refers to a row in another, which type each column should have, and which rules the database enforces on every change. This page builds that design step by step on one running example, <strong>Biteful</strong>, a small food-delivery company with four tables: <code>customers</code>, <code>restaurants</code>, <code>orders</code> and <code>order_items</code>. It then covers the families of SQL commands, why we use PostgreSQL, and how to reach the database from the terminal and from Python without opening a security hole. Every query was run on PostgreSQL 16 against the Biteful data, and every output shown is the real output; <a class="xref" data-note="sql_fundamentals">Querying Basics</a> uses exactly the same database next.</p>

  <h2 id="sr-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Relational Model &amp; PostgreSQL</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why tables</div>
        <ul>
          <li>One big sheet repeats facts: update, insert and delete <b>anomalies</b></li>
          <li>Store each fact once; a JOIN rebuilds the wide view</li>
          <li><b>Relation</b> = table; <b>row</b> = one fact; <b>column</b> = typed property</li>
          <li>Rows have no order without <code>ORDER BY</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keys and links</div>
        <ul>
          <li><b>Primary key</b>: unique + NOT NULL; <b>foreign key</b>: must match a parent key</li>
          <li><b>1:N</b>: FK on the many side; <b>1:1</b>: FK + UNIQUE</li>
          <li><b>M:N</b>: junction table (<code>orders</code> links customers and restaurants)</li>
          <li>Surrogate PK + UNIQUE on the natural key</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Types and rules</div>
        <ul>
          <li>Money → <code>NUMERIC</code>; events → <code>TIMESTAMPTZ</code>; text → <code>TEXT</code></li>
          <li>NOT NULL, UNIQUE, CHECK, PK, FK, DEFAULT run on every write</li>
          <li>ON DELETE: RESTRICT refuses, CASCADE deletes children, SET NULL unlinks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SQL and tools</div>
        <ul>
          <li>DDL, DML, DQL, DCL, TCL; Postgres DDL can be rolled back</li>
          <li>psql: <code>&#92;d table</code> describes a table</li>
          <li>Python: always pass values as parameters (SQL injection)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sr-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Relational Model</span><span class="rm-sub">why one big sheet is split into tables</span></div></div>
      <div class="rm-item rm-done" data-target="sr-keys"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Keys</span><span class="rm-sub">how a row is identified and referred to</span></div></div>
      <div class="rm-item rm-done" data-target="sr-rel"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Relationships</span><span class="rm-sub">one-to-many, one-to-one, many-to-many, self</span></div></div>
      <div class="rm-item rm-done" data-target="sr-biteful"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Biteful Dataset</span><span class="rm-sub">the full design and every row</span></div></div>
      <div class="rm-item rm-done" data-target="sr-types"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Data Types</span><span class="rm-sub">money, time zones and text</span></div></div>
      <div class="rm-item rm-done" data-target="sr-cons"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Constraints and ON DELETE</span><span class="rm-sub">rules the database enforces itself</span></div></div>
      <div class="rm-item rm-done" data-target="sr-lang"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">SQL Sub-languages</span><span class="rm-sub">DDL, DML, DQL, DCL, TCL</span></div></div>
      <div class="rm-item rm-done" data-target="sr-pg"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">PostgreSQL and SQL Dialects</span><span class="rm-sub">why Postgres, and how others differ</span></div></div>
      <div class="rm-item rm-done" data-target="sr-tools"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">psql, Python and SQL Injection</span><span class="rm-sub">talking to the database safely</span></div></div>
      <div class="rm-item rm-done" data-target="sr-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">row order, NULLs in UNIQUE, missing FK indexes</span></div></div>
      <div class="rm-item rm-done" data-target="sr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, tables, syntax, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="sr-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the design questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="sr-model"><span class="num">01</span>The Relational Model</h2>
  <p>Biteful started the way most small businesses do: with one spreadsheet. Every time a customer ordered a dish, somebody added a row with the order number, the customer's name and city, the restaurant, the dish, the quantity and the price. It is easy to read, and for a week it works. To see what goes wrong, here is what that sheet looks like for one customer, Asha. (The query rebuilds the sheet from Biteful's real tables; the <code>JOIN</code> lines that stitch the tables together are the subject of <a class="xref" data-note="sql_joins">JOINs</a>, so for now just look at the result.)</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, c.city, r.name AS restaurant, oi.item, oi.qty, oi.unit_price
FROM orders o
JOIN customers c    USING (customer_id)
JOIN restaurants r  USING (restaurant_id)
JOIN order_items oi USING (order_id)
WHERE c.name = 'Asha'
ORDER BY o.order_id, oi.item;</div>
  <div class="fx" data-lang="text"> order_id | customer | city | restaurant  |     item      | qty | unit_price 
----------+----------+------+-------------+---------------+-----+------------
      101 | Asha     | Pune | Dosa Hut    | Masala Dosa   |   2 |     120.00
      104 | Asha     | Pune | Pizza Point | Garlic Bread  |   1 |     100.00
      104 | Asha     | Pune | Pizza Point | Margherita    |   1 |     280.00
      110 | Asha     | Pune | Dosa Hut    | Filter Coffee |   1 |      70.00
      110 | Asha     | Pune | Dosa Hut    | Masala Dosa   |   2 |     120.00
(5 rows)</div>
  <p>Look at how much is repeated. "Asha" and "Pune" are written on all five rows, and "Dosa Hut" on three. Repetition by itself only wastes space; the real damage comes when the data changes. Suppose Asha moves to Mumbai. Someone has to edit five rows, and if they miss one, the data now claims she lives in two cities at once. That is called an <strong>update anomaly</strong>: the same fact stored in several places, so the copies can disagree. Now suppose a new customer, Gita, signs up but has not ordered yet. There is no row to write her on, because every row is a dish that was ordered; she simply cannot exist in this sheet. That is an <strong>insert anomaly</strong>: you cannot record one fact without inventing another. Finally, Dia placed one order, number 105, and it was cancelled. If we delete that row, Dia disappears from the company's records entirely. That is a <strong>delete anomaly</strong>: removing one fact destroys an unrelated one. The word <strong>anomaly</strong> just means a way the data can become wrong or incomplete because of how it is stored.</p>
  <p>Think of the contacts app on your phone. Your friend's number is stored once, in their contact card. Every chat, every call log entry and every group simply refers to that contact. When they change their number you edit one card, and every chat shows the new number. Nobody would design a phone that copies the number into every message.</p>
  <p>The <strong>relational model</strong> is the same idea applied to business data: every fact is stored exactly once, in a table about that kind of thing, and other tables refer to it by a value instead of copying it. Asha's name and city live in one row of a <code>customers</code> table. Each order stores only her customer number, 1. When you want the wide spreadsheet view back, the database rebuilds it on the fly, exactly as the query above did, so you get the convenience of the sheet without storing the repeats. Splitting data into tables this way is called <strong>normalization</strong>, and its formal rules are covered in <a class="xref" data-note="sql_modeling">Data Modeling</a>.</p>
  <p>A few words come up constantly. A table is formally called a <strong>relation</strong>; the word "relational" comes from this mathematical term, not from "relationships between tables", although tables do have those too. A <strong>row</strong> (formally a <strong>tuple</strong>) is one fact, such as one order. A <strong>column</strong> (formally an <strong>attribute</strong>) is one property that every row has, and it has a <strong>type</strong>, also called its <strong>domain</strong>: the set of values it may hold, such as dates or whole numbers. One consequence of the model surprises beginners: a relation is a <em>set</em> of rows, not a list, so the rows have no built-in order. If you need them in a particular order you must ask for it with <code>ORDER BY</code>; section 10 shows the order changing under your feet when you forget.</p>
  <p>Splitting the sheet solves the anomalies, but it creates a new question. An order now says "customer 1" instead of "Asha". That only works if every customer has a number nobody else has, and if an order can never point at a number that does not exist. Those two guarantees are what keys provide.</p>

  <h2 id="sr-keys"><span class="num">02</span>Keys</h2>
  <p>Two customers can both be called Asha, so a name cannot safely identify a person. A school has the same problem with students and solves it with roll numbers: two students may share a name, but never a roll number, and the attendance register records roll numbers rather than names. Databases use exactly this arrangement, with two kinds of key.</p>
  <p>A <strong>primary key</strong> is the column (or set of columns) whose value identifies one row and no other. It must be unique, and it can never be NULL (empty), because a row without an identity could not be referred to. Each table has exactly one primary key: in Biteful, <code>customers.customer_id</code>, <code>restaurants.restaurant_id</code> and <code>orders.order_id</code>. A <strong>foreign key</strong> is a column in one table whose values must match the primary key (or another unique column) of a row in another table. <code>orders.customer_id</code> is a foreign key: every value in it must be a <code>customer_id</code> that really exists in <code>customers</code>. "Foreign" simply means "belonging to another table". Together, primary and foreign keys give <strong>referential integrity</strong>: no reference ever points at nothing.</p>
  <p>Keys are not just a design idea on paper; the database stores them as <strong>constraints</strong> (rules attached to the table) and checks them on every write. PostgreSQL keeps its constraints in a system table called <code>pg_constraint</code>, so we can list Biteful's keys directly:</p>
  <div class="fx" data-lang="sql">SELECT conrelid::regclass AS table_name, conname AS constraint_name,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype IN ('p', 'f', 'u') AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, contype DESC, conname;</div>
  <div class="fx" data-lang="text"> table_name  |      constraint_name       |                            definition                             
-------------+----------------------------+-------------------------------------------------------------------
 customers   | customers_pkey             | PRIMARY KEY (customer_id)
 customers   | customers_referred_by_fkey | FOREIGN KEY (referred_by) REFERENCES customers(customer_id)
 order_items | order_items_pkey           | PRIMARY KEY (order_id, item)
 order_items | order_items_order_id_fkey  | FOREIGN KEY (order_id) REFERENCES orders(order_id)
 orders      | orders_pkey                | PRIMARY KEY (order_id)
 orders      | orders_customer_id_fkey    | FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
 orders      | orders_restaurant_id_fkey  | FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
 restaurants | restaurants_name_key       | UNIQUE (name)
 restaurants | restaurants_pkey           | PRIMARY KEY (restaurant_id)
(9 rows)</div>
  <p>Read the result table by table. <code>customers</code> has its primary key and a foreign key that points back into <code>customers</code> itself (<code>referred_by</code>, which records who referred whom; section 03 explains this). <code>restaurants</code> has its primary key and also a <code>UNIQUE</code> constraint on <code>name</code>. <code>orders</code> has its primary key plus two foreign keys, one to customers and one to restaurants. <code>order_items</code> has a primary key made of <em>two</em> columns, <code>(order_id, item)</code>, and a foreign key to <code>orders</code>.</p>
  <p>Those last two cases introduce more vocabulary. Any column set that could serve as the primary key is a <strong>candidate key</strong>. Restaurant names are unique in Biteful, so <code>name</code> could have been the primary key; the designer picked <code>restaurant_id</code> and protected the other candidate with <code>UNIQUE</code>, so two restaurants still cannot share a name. A key made of more than one column is a <strong>composite key</strong>. In <code>order_items</code>, neither column is unique on its own: order 102 has two lines, and Masala Dosa appears in three different orders. But the pair (order, dish) is unique, because a dish appears at most once on any one order.</p>
  <p>Finally, keys can be <strong>natural</strong> or <strong>surrogate</strong>. A natural key is a real-world identifier such as a phone number, email or PAN number. A surrogate key is a meaningless number the database generates, like <code>customer_id</code>. Natural keys look attractive because they already exist, but real-world identifiers change: people change phone numbers and emails, and codes get reused or mistyped. Changing a primary key means updating every foreign key that points at it. The usual design is therefore a surrogate primary key plus a <code>UNIQUE</code> constraint on the natural key, which gives stable references <em>and</em> still blocks duplicates.</p>
  <p>Here are both kinds of key doing their job. The first statement tries to create an order for customer 99, who does not exist; the second tries to create a second customer with id 1:</p>
  <div class="fx" data-lang="sql">INSERT INTO orders (order_id, customer_id, restaurant_id, ordered_at, status, amount)
VALUES (111, 99, 10, now(), 'pending', 200);
INSERT INTO customers (customer_id, name, city, signup_date)
VALUES (1, 'Asha Rao', 'Mumbai', '2026-03-09');</div>
  <div class="fx" data-lang="text">ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
DETAIL:  Key (customer_id)=(99) is not present in table "customers".
ERROR:  duplicate key value violates unique constraint "customers_pkey"
DETAIL:  Key (customer_id)=(1) already exists.</div>
  <p>The foreign key refused the order, naming the exact rule (<code>orders_customer_id_fkey</code>) and the missing value (99). The primary key refused the duplicate id. Neither check depends on the application remembering to do it; the database does it for every program that writes to it. We now know how one row points at another. The next question is where the foreign key should go, which depends on how many rows can be on each side of the link.</p>

  <h2 id="sr-rel"><span class="num">03</span>Relationships</h2>
  <p>A single cell in a table holds a single value. That rule shapes every design decision about links between tables, because real relationships often involve many rows on one side or both. To decide where the keys go, ask two questions about any pair of tables: how many B rows can one A row have, and how many A rows can one B row have? The answer is called the relationship's <strong>cardinality</strong>, and there are three shapes.</p>
  <p>One customer places many orders, but each order belongs to exactly one customer. This is <strong>one-to-many</strong>, written 1:N. The foreign key goes on the "many" side: each order carries <code>customer_id</code>. It cannot go the other way, because a customer row would need a list of order numbers in one cell. Restaurants and orders are also 1:N, and so are orders and their lines in <code>order_items</code>. A school class works the same way: each student's form names their one class teacher, while the teacher's record does not list every student.</p>
  <p>One customer might have exactly one loyalty profile, and each profile belongs to one customer. This is <strong>one-to-one</strong>, 1:1. It is built like 1:N, with a foreign key in the dependent table, plus a <code>UNIQUE</code> constraint on that foreign key so that no customer can get a second profile. Biteful's four tables have no 1:1 relationship, but it is common for splitting rarely used or sensitive columns into their own table, like a student and their one ID card.</p>
  <p>One customer orders from many restaurants, and one restaurant serves many customers. This is <strong>many-to-many</strong>, M:N, and it cannot be built with a single foreign key at all: a customer cannot hold a list of restaurants in one cell, and a restaurant cannot hold a list of customers. The solution is a third table, called a <strong>junction table</strong> (also bridge or associative table), that holds one row per pairing, with a foreign key to each side. In Biteful that table already exists: <strong><code>orders</code> is the junction between customers and restaurants</strong>. Each order row says "this customer ordered from this restaurant", and the junction is also the natural home for facts about the pairing itself, such as when it happened, its status and its amount. A school does the same for students and clubs: a separate membership register with one line per (student, club) and the date they joined.</p>
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
  </svg><figcaption>Left: Asha's three orders each point at her. Middle: one profile per customer. Right: Asha and Chen have both ordered from Dosa Hut and Pizza Point; each order row in the middle is one pairing.</figcaption></figure>
  <p>Read the right-hand part of the figure from left to right. Asha connects to two order rows, 101 and 104; order 101 points at Dosa Hut (10) and 104 at Pizza Point (12). Chen also connects to two orders that reach the same two restaurants. No single row anywhere holds a list, yet the many-to-many relationship is fully described. To answer "which customers have ordered from Pizza Point?" a query starts at the restaurant, goes through the junction, and comes out at the customers:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, o.status
FROM restaurants r
JOIN orders o    ON o.restaurant_id = r.restaurant_id
JOIN customers c ON c.customer_id = o.customer_id
WHERE r.name = 'Pizza Point'
ORDER BY o.order_id;</div>
  <div class="fx" data-lang="text"> order_id | customer |  status   
----------+----------+-----------
      103 | Chen     | delivered
      104 | Asha     | delivered
      107 | Esha     | cancelled
(3 rows)</div>
  <p>You can check this against the orders table in the next section: restaurant 12 appears on orders 103 (customer 3, Chen), 104 (customer 1, Asha) and 107 (customer 5, Esha). Notice that a pairing can occur more than once, too: Asha has ordered from Dosa Hut twice, as two separate rows, which a list-in-a-cell design could never record properly.</p>
  <p>There is one more shape, which is really 1:N with a twist. Biteful records who referred each customer, and the referrer is also a customer. So <code>customers.referred_by</code> is a foreign key that points at <code>customers.customer_id</code>, in the same table. This is a <strong>self-referencing</strong> relationship, and it is how databases store hierarchies such as "employee reports to manager" or "category belongs to parent category". To read it, use the table twice under two short names (aliases), one for each role:</p>
  <div class="fx" data-lang="sql">SELECT c.name AS customer, ref.name AS referred_by
FROM customers c
JOIN customers ref ON ref.customer_id = c.referred_by
ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> customer | referred_by 
----------+-------------
 Ben      | Asha
 Chen     | Asha
 Farah    | Ben
(3 rows)</div>
  <p>Only Ben, Chen and Farah came through a referral; the other four customers have <code>referred_by</code> set to NULL, which matches nothing, so they drop out of this result. (Keeping them with an empty referrer needs a LEFT JOIN, covered in <a class="xref" data-note="sql_joins">JOINs</a>.)</p>
  <p>One design detail in <code>order_items</code> looks like repetition but is deliberate. Each line stores <code>unit_price</code>, even though a restaurant's menu would also know the price. Prices change, and the price paid is a fact about <em>that sale</em>, not about the dish in general. If Masala Dosa costs ₹130 next month, Asha's old bill must still say ₹120. Copying a value is wrong when it is the same fact stored twice; it is right when it is a different fact (the price on the day) that happens to start with the same number.</p>

  <h2 id="sr-biteful"><span class="num">04</span>The Biteful Dataset</h2>
  <p>We now have all the pieces: tables, keys, and the shapes of the links between them. This section shows the complete design and every row in it. Biteful is the dataset used on all the foundation pages of this track (What is a Database, Types of Databases, this page and Querying Basics, and again in JOINs), and it is deliberately tiny so that every answer on those pages can be checked by hand. It also contains a handful of deliberate oddities, listed at the end of this section, because real data always has them and most interview traps are invisible without them.</p>
  <p>The design is easiest to see as an <strong>entity-relationship diagram</strong> (ERD): one box per table listing its columns, PK marking the primary key and FK the foreign keys, and a line for each foreign-key link labelled with its cardinality. The full set of table definitions behind such a diagram (columns, types, keys and constraints) is called the <strong>schema</strong>.</p>
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
  </svg><figcaption>Read "1 … N" as "one customer has many orders". orders bridges customers and restaurants; order_items hangs off orders; customers points at itself through referred_by.</figcaption></figure>
  <p>Walk through the diagram once. A customer (left) has many orders, through <code>orders.customer_id</code>. A restaurant (right) has many orders, through <code>orders.restaurant_id</code>. Because orders points at both, it is the many-to-many bridge between them. Each order has many lines in <code>order_items</code> (bottom), whose primary key is the pair (order_id, item). And the curved arrow on the left is the self-reference from <code>referred_by</code> back to <code>customer_id</code>. Here is every row of the four tables:</p>
  <div class="fx" data-lang="sql">SELECT * FROM customers;
SELECT * FROM restaurants;
SELECT * FROM orders;
SELECT * FROM order_items;</div>
  <div class="fx" data-lang="text"> customer_id | name  |  city  | signup_date | referred_by 
-------------+-------+--------+-------------+-------------
           1 | Asha  | Pune   | 2026-01-05  |        NULL
           2 | Ben   | Mumbai | 2026-01-12  |           1
           3 | Chen  | Pune   | 2026-02-03  |           1
           4 | Dia   | Mumbai | 2026-02-20  |        NULL
           5 | Esha  | NULL   | 2026-03-01  |        NULL
           6 | Farah | Mumbai | 2026-03-02  |           2
           7 | Gita  | Pune   | 2026-03-04  |        NULL
(7 rows)

 restaurant_id |     name     |  city  |   cuisine    | rating 
---------------+--------------+--------+--------------+--------
            10 | Dosa Hut     | Pune   | South Indian |    4.5
            11 | Biryani Bros | Mumbai | Biryani      |    4.2
            12 | Pizza Point  | Pune   | Pizza        |    3.9
            13 | Green Bowl   | Mumbai | Healthy      |    4.2
            14 | Momo Magic   | Pune   | Tibetan      |   NULL
(5 rows)

 order_id | customer_id | restaurant_id |        ordered_at         |  status   | amount | delivery_minutes 
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
(10 rows)

 order_id |      item       | qty | unit_price 
----------+-----------------+-----+------------
      101 | Masala Dosa     |   2 |     120.00
      102 | Chicken Biryani |   1 |     350.00
      102 | Raita           |   2 |      50.00
      103 | Farmhouse Pizza |   2 |     260.00
      104 | Margherita      |   1 |     280.00
      104 | Garlic Bread    |   1 |     100.00
      105 | Buddha Bowl     |   1 |     310.00
      106 | Veg Biryani     |   1 |     180.00
      107 | Farmhouse Pizza |   1 |     260.00
      108 | Masala Dosa     |   1 |     120.00
      108 | Filter Coffee   |   2 |      70.00
      109 | Chicken Biryani |   1 |     350.00
      109 | Mutton Kebab    |   1 |     250.00
      110 | Masala Dosa     |   2 |     120.00
      110 | Filter Coffee   |   1 |      70.00
(15 rows)</div>
  <p>One more design choice is worth noticing: <code>orders.amount</code> is the bill total, and it always equals the sum of <code>qty × unit_price</code> over that order's lines. Order 102, for example, is 1 × 350 + 2 × 50 = 450. Storing the total is a deliberate snapshot, like <code>unit_price</code>, and it lets the next page answer money questions from a single table before joins have been introduced.</p>
  <p>Now the oddities, each of which powers a lesson later. Esha's <code>city</code> is NULL, which makes "customers not in Pune" quietly skip her. Gita has never ordered and Momo Magic has never been ordered from, so a plain join drops them and a LEFT JOIN or NOT EXISTS is needed to find them. Momo Magic also has no rating yet. Two restaurants tie at a rating of 4.2 and two orders tie at ₹260, which makes "the top one" ambiguous. Orders 105 and 107 are cancelled and 110 is pending, so "all orders" and "delivered orders" give different totals. <code>delivery_minutes</code> is NULL for four orders, so averages and counts disagree. Order 110 was placed late on 8 March, which exposes a classic date-range mistake. Masala Dosa appears in three orders, and several orders have two lines, which makes sums double when tables are joined carelessly. And the referral chain (Asha referred Ben and Chen; Ben referred Farah) gives the self-reference something to find.</p>

  <h2 id="sr-types"><span class="num">05</span>Data Types</h2>
  <p>Every column has a <strong>data type</strong>, which fixes the set of values it may hold and how those values are stored, compared and calculated with. A type does two jobs. It rejects nonsense (the text "abc" cannot go into an amount column), and it tells the database how values behave (dates sort as dates, so 9 March comes before 10 March, which would not be true if they were compared as text). Choosing the wrong type rarely causes an error. The data goes in fine and the answers come out slightly wrong, which is worse. The common choices in PostgreSQL:</p>
  <table class="tbl">
    <tr><th>Need</th><th>Type</th><th>Biteful column</th><th>Note</th></tr>
    <tr><td>Whole numbers, ids</td><td><code>INTEGER</code>, <code>BIGINT</code></td><td><code>order_id</code>, <code>qty</code></td><td>Auto-generated ids: <code>GENERATED ALWAYS AS IDENTITY</code></td></tr>
    <tr><td>Money, exact decimals</td><td><code>NUMERIC(p,s)</code></td><td><code>amount NUMERIC(8,2)</code></td><td>Exact; (8,2) = up to 8 digits, 2 after the point</td></tr>
    <tr><td>Measurements, scores</td><td><code>REAL</code>, <code>DOUBLE PRECISION</code></td><td>(none)</td><td>Fast but approximate binary floats</td></tr>
    <tr><td>Text</td><td><code>TEXT</code></td><td><code>name</code>, <code>status</code></td><td><code>VARCHAR(n)</code> only to enforce a real limit</td></tr>
    <tr><td>Dates and times</td><td><code>DATE</code>, <code>TIMESTAMPTZ</code>, <code>INTERVAL</code></td><td><code>signup_date</code>, <code>ordered_at</code></td><td>TIMESTAMPTZ for events</td></tr>
    <tr><td>Other</td><td><code>BOOLEAN</code>, <code>UUID</code>, <code>JSONB</code>, arrays</td><td>(none)</td><td>JSONB stores documents and can be indexed</td></tr>
  </table>
  <p>Three choices in that table cause most real bugs, so let us see each one fail. The first is storing money as a floating-point number. A <strong>float</strong> (<code>REAL</code> or <code>DOUBLE PRECISION</code>, also written <code>float8</code>) stores numbers in binary, base 2. Just as one third cannot be written exactly in decimal (0.3333… never ends), one tenth cannot be written exactly in binary. The stored value is a tiny bit off, and the error becomes visible when you add. <code>NUMERIC</code>, by contrast, stores the decimal digits exactly as you wrote them. (The <code>::float8</code> and <code>::numeric</code> after a value convert it to that type; this is called a <strong>cast</strong>.)</p>
  <div class="fx" data-lang="sql">SELECT 0.1::float8 + 0.2::float8 = 0.3 AS float_ok,
       0.1::numeric + 0.2::numeric = 0.3 AS numeric_ok,
       0.1::float8 + 0.2::float8         AS float_sum;
SELECT SUM(0.1::float8) AS float_sum, SUM(0.1::numeric) AS numeric_sum
FROM generate_series(1, 10);</div>
  <div class="fx" data-lang="text"> float_ok | numeric_ok |      float_sum      
----------+------------+---------------------
 f        | t          | 0.30000000000000004
(1 row)

     float_sum      | numeric_sum 
--------------------+-------------
 0.9999999999999999 |         1.0
(1 row)</div>
  <p>With floats, 0.1 + 0.2 is not equal to 0.3; it comes out as 0.30000000000000004. Adding ten tips of ₹0.10 gives 0.9999999999999999 instead of 1.0. Tiny errors like these pile up over millions of transactions, and an accounts report that is off by a paisa is a report nobody trusts. With <code>NUMERIC</code> both answers are exact. That is why Biteful's <code>amount</code> and <code>unit_price</code> are <code>NUMERIC(8,2)</code>. Floats are still the right choice for measurements, sensor readings and machine-learning scores, where speed matters and the fifteenth digit does not.</p>
  <p>The second trap is time zones. If a friend in New York texts "call me at 10:00", you have to ask: 10:00 where? Databases face the same ambiguity. <code>TIMESTAMP</code> (timestamp <em>without</em> time zone) stores a wall-clock reading such as "2026-03-02 12:10" and nothing else, so nobody can tell which city's clock it was. <code>TIMESTAMPTZ</code> (timestamp <em>with</em> time zone) stores an absolute instant: on the way in it converts your value to UTC, the world's reference time, and on the way out it converts back to whatever time zone the reading session is using. Order 101 was placed at 12:10 in Pune. Here is the same row read by a session set to Kolkata time and then by one set to New York time; the last column casts the value to a plain <code>TIMESTAMP</code> to show what is lost:</p>
  <div class="fx" data-lang="sql">SET timezone = 'Asia/Kolkata';
SELECT order_id, ordered_at, ordered_at::timestamp AS wall_clock FROM orders WHERE order_id = 101;
SET timezone = 'America/New_York';
SELECT order_id, ordered_at, ordered_at::timestamp AS wall_clock FROM orders WHERE order_id = 101;</div>
  <div class="fx" data-lang="text">SET
 order_id |        ordered_at         |     wall_clock      
----------+---------------------------+---------------------
      101 | 2026-03-02 12:10:00+05:30 | 2026-03-02 12:10:00
(1 row)

SET
 order_id |       ordered_at       |     wall_clock      
----------+------------------------+---------------------
      101 | 2026-03-02 01:40:00-05 | 2026-03-02 01:40:00
(1 row)</div>
  <p>Both <code>ordered_at</code> values are the same instant written two ways: 12:10 at UTC+05:30 is 01:40 at UTC−05:00 (early March is before US daylight saving begins). The <code>wall_clock</code> column, however, shows 12:10 in one session and 01:40 in the other with nothing to say which zone it means; if it had been stored like that, a report run from New York could not know the order was a lunch order. Use <code>TIMESTAMPTZ</code> for anything that happened at a moment (orders, logins, payments), and plain <code>TIMESTAMP</code> only for zone-less facts like "the restaurant opens at 09:00 local time". Note that despite its name, <code>TIMESTAMPTZ</code> does not store the zone itself; it stores the instant.</p>
  <p>The third choice is <code>TEXT</code> versus <code>VARCHAR(n)</code>. In many databases <code>VARCHAR</code> is faster, so people put <code>VARCHAR(255)</code> on everything out of habit. In PostgreSQL they are stored and processed identically; <code>VARCHAR(n)</code> only adds a length check. Use that check when there is a genuine rule, such as three-letter currency codes:</p>
  <div class="fx" data-lang="sql">CREATE TABLE currencies (code VARCHAR(3) PRIMARY KEY, name TEXT);
INSERT INTO currencies VALUES ('INR', 'Indian rupee');
INSERT INTO currencies VALUES ('RUPEE', 'Indian rupee');</div>
  <div class="fx" data-lang="text">CREATE TABLE
INSERT 0 1
ERROR:  value too long for type character varying(3)</div>
  <p>"INR" fits; "RUPEE" is rejected because it breaks the three-character rule. Default to <code>TEXT</code> and add a limit only when the limit means something. Avoid <code>CHAR(n)</code>, which pads short values with spaces and causes confusing comparisons. A type can say "a small whole number", but it cannot say "a rating between 1 and 5" or "one review per customer per restaurant". Rules like those need constraints.</p>

  <h2 id="sr-cons"><span class="num">06</span>Constraints and ON DELETE</h2>
  <p>Biteful wants to let customers review restaurants. The app checks that a rating is between 1 and 5 before saving it. A month later a colleague writes a quick Python script to import old reviews straight into the database, and a rating of 7 slips in, because the app's check never ran. Rules that live only in application code protect only that application. Every other path into the data (scripts, admin tools, other services, manual fixes) walks around them. Think of a "no outside food" sign at a cinema entrance versus a guard who also watches the side doors.</p>
  <p>A <strong>constraint</strong> is a rule stored in the table definition itself, which the database checks on every <code>INSERT</code>, <code>UPDATE</code> and <code>DELETE</code>, whichever program sends it. If a change would break a constraint, the whole statement fails and nothing is changed. There are six kinds: <code>NOT NULL</code> (a value is required), <code>UNIQUE</code> (no two rows may share the value), <code>CHECK</code> (any condition that must be true), <code>PRIMARY KEY</code> (unique and not null), <code>FOREIGN KEY</code> written <code>REFERENCES</code> (the value must exist in another table), and <code>DEFAULT</code> (the value used when none is given; strictly a default rather than a rule, but declared the same way). Here is Biteful's new <code>reviews</code> table using all of them, followed by one insert that obeys every rule and four that each break one:</p>
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
INSERT INTO reviews (customer_id, restaurant_id) VALUES (2, 11);</div>
  <div class="fx" data-lang="text">CREATE TABLE
INSERT 0 1
ERROR:  duplicate key value violates unique constraint "reviews_customer_id_restaurant_id_key"
DETAIL:  Key (customer_id, restaurant_id)=(1, 10) already exists.
ERROR:  new row for relation "reviews" violates check constraint "reviews_rating_check"
DETAIL:  Failing row contains (3, 2, 11, 7, null, 2026-11-04 10:37:06.734991+05:30).
ERROR:  insert or update on table "reviews" violates foreign key constraint "reviews_customer_id_fkey"
DETAIL:  Key (customer_id)=(99) is not present in table "customers".
ERROR:  null value in column "rating" of relation "reviews" violates not-null constraint
DETAIL:  Failing row contains (5, 2, 11, null, null, 2026-11-04 10:37:06.735486+05:30).</div>
  <p>First the definition, line by line. <code>review_id</code> is an <strong>identity</strong> column: the database generates 1, 2, 3 and so on by itself. <code>customer_id</code> must be a real customer, and <code>ON DELETE CASCADE</code> (explained below) says what happens to the review if that customer is deleted. <code>restaurant_id</code> must be a real restaurant, with <code>ON DELETE RESTRICT</code>. <code>rating</code> must be present and between 1 and 5. <code>created_at</code> fills itself in with the current time. The last line makes the pair (customer, restaurant) unique, so a customer can review each restaurant only once.</p>
  <p>Then the output, one line per statement. The first review is accepted (<code>INSERT 0 1</code> means one row inserted). Asha reviewing Dosa Hut a second time breaks the UNIQUE rule. A rating of 7 breaks the CHECK. Customer 99 breaks the FOREIGN KEY. Leaving out the rating breaks NOT NULL. Each error names the constraint and the offending values, which makes bad data easy to trace. Notice also the "Failing row" details: the rejected rows were given review ids 3 and 5. Keep that in mind; it matters in a moment.</p>
  <p>Foreign keys also guard the other direction. If a parent row is deleted while child rows still point at it, those children would point at nothing. So what should happen when someone deletes a customer who has orders? Let us try with Dia (who has order 105) and Asha:</p>
  <div class="fx" data-lang="sql">DELETE FROM customers WHERE customer_id = 4;
DELETE FROM customers WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">ERROR:  update or delete on table "customers" violates foreign key constraint "orders_customer_id_fkey" on table "orders"
DETAIL:  Key (customer_id)=(4) is still referenced from table "orders".
ERROR:  update or delete on table "customers" violates foreign key constraint "customers_referred_by_fkey" on table "customers"
DETAIL:  Key (customer_id)=(1) is still referenced from table "customers".</div>
  <p>Both deletes are refused. Dia is still referenced by her order. Asha is still referenced by the <code>referred_by</code> values of Ben and Chen (she also has orders 101, 104 and 110, which would block the delete just as well; PostgreSQL reports the first violation it finds). This refusal is the default behaviour, but it is only one of three choices. When you declare a foreign key you can add an <code>ON DELETE</code> action, called a <strong>referential action</strong>, that says what to do with the children:</p>
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
  </svg><figcaption>The same parent with two children under the three ON DELETE choices.</figcaption></figure>
  <p>On the left, <code>NO ACTION</code> (the default) or <code>RESTRICT</code> refuses to delete the parent while children exist; this is what just happened to Dia and Asha, and it is right for history that must survive, such as orders and payments. (The two differ only in a detail of timing inside transactions.) In the middle, <code>CASCADE</code> deletes the children along with the parent; it suits data that belongs to the parent and means nothing without it, like a customer's reviews or an order's lines. On the right, <code>SET NULL</code> keeps the children but empties their foreign key; it suits optional links, such as <code>referred_by</code> when the referrer closes their account. (<code>SET DEFAULT</code> works the same way with the column's default value.)</p>
  <p>Gita has no orders and referred nobody, so she can be deleted, and because <code>reviews.customer_id</code> was declared <code>ON DELETE CASCADE</code>, her review should vanish with her. This continues from the reviews table above, including its failed inserts:</p>
  <div class="fx" data-lang="sql">INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (7, 14, 4);
SELECT review_id, customer_id, restaurant_id, rating FROM reviews ORDER BY review_id;
DELETE FROM customers WHERE customer_id = 7;
SELECT review_id, customer_id, restaurant_id, rating FROM reviews ORDER BY review_id;</div>
  <div class="fx" data-lang="text">INSERT 0 1
 review_id | customer_id | restaurant_id | rating 
-----------+-------------+---------------+--------
         1 |           1 |            10 |      5
         6 |           7 |            14 |      4
(2 rows)

DELETE 1
 review_id | customer_id | restaurant_id | rating 
-----------+-------------+---------------+--------
         1 |           1 |            10 |      5
(1 row)</div>
  <p>Before the delete there are two reviews; afterwards Gita's is gone automatically, while Asha's is untouched. Now look at the ids: Gita's review got id 6, not 2. Each of the four failed inserts had already taken an identity value (we saw 3 and 5 in the "Failing row" messages) and those values are never handed back. Sequences, the counters behind identity columns, skip numbers on purpose, so that two sessions inserting at the same time never have to wait for each other. The lesson is that generated ids are unique, not gap-free: never use <code>MAX(id)</code> to count rows, and never promise customers consecutive invoice numbers from an identity column.</p>
  <p>Constraints are the database's last line of defence: validation in the app is still useful for friendly error messages, but the constraint is what guarantees the data is correct. We have now used <code>CREATE TABLE</code>, <code>INSERT</code>, <code>DELETE</code> and <code>SELECT</code>, which do very different kinds of work. SQL groups its commands by that kind of work.</p>

  <h2 id="sr-lang"><span class="num">07</span>SQL Sub-languages</h2>
  <p><strong>SQL</strong> (Structured Query Language) is the standard language for relational databases. It is one language, but its commands do five different jobs, and each group has a name that interviewers like to ask about. Think of a library. Someone has to build and label the shelves; someone puts books on them, moves them and removes them; readers look things up; the membership desk decides who may borrow; and an issuing rule says that either all the books you are borrowing are recorded against your card, or none are. SQL has a group for each.</p>
  <table class="tbl">
    <tr><th>Group</th><th>Job</th><th>Commands</th></tr>
    <tr><td><strong>DDL</strong>, Data Definition Language</td><td>Creates and changes the structure (the schema)</td><td>CREATE, ALTER, DROP, TRUNCATE</td></tr>
    <tr><td><strong>DML</strong>, Data Manipulation Language</td><td>Changes the rows</td><td>INSERT, UPDATE, DELETE, MERGE</td></tr>
    <tr><td><strong>DQL</strong>, Data Query Language</td><td>Reads rows</td><td>SELECT</td></tr>
    <tr><td><strong>DCL</strong>, Data Control Language</td><td>Grants and removes permissions</td><td>GRANT, REVOKE</td></tr>
    <tr><td><strong>TCL</strong>, Transaction Control Language</td><td>Groups changes into all-or-nothing units</td><td>BEGIN, COMMIT, ROLLBACK, SAVEPOINT</td></tr>
  </table>
  <p>Some textbooks fold SELECT into DML; either answer is accepted as long as you can explain it. The first three groups in action, one statement each:</p>
  <div class="fx" data-lang="sql">ALTER TABLE customers ADD COLUMN email TEXT UNIQUE;             -- DDL
UPDATE restaurants SET rating = 4.0 WHERE name = 'Momo Magic';  -- DML
SELECT name, rating FROM restaurants                            -- DQL
WHERE city = 'Pune' ORDER BY rating DESC;</div>
  <div class="fx" data-lang="text">ALTER TABLE
UPDATE 1
    name     | rating 
-------------+--------
 Dosa Hut    |    4.5
 Momo Magic  |    4.0
 Pizza Point |    3.9
(3 rows)</div>
  <p>The <code>ALTER TABLE</code> changed the shape of <code>customers</code> by adding a column (DDL). The <code>UPDATE</code> changed one row's value (DML), and psql's reply <code>UPDATE 1</code> is the count of rows affected. The <code>SELECT</code> read rows without changing anything (DQL), and Momo Magic now shows its new rating.</p>
  <p>TCL needs a closer look, because it is the safety net for everything else. A <strong>transaction</strong> is a group of statements that the database treats as one unit: either all of them take effect or none do. <code>BEGIN</code> starts one, <code>COMMIT</code> makes its changes permanent and visible to others, and <code>ROLLBACK</code> throws all of them away. Here a careless update doubles every unit price, and we look at the damage before deciding:</p>
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
  <p>Inside the transaction, <code>UPDATE 15</code> changed all fifteen lines and the Chicken Biryani on order 102 reads 700. After <code>ROLLBACK</code> it is back to 350, as if the update had never happened. Had we typed <code>COMMIT</code>, the doubled prices would have been permanent. (Transactions get their own page: <a class="xref" data-note="sql_transactions">Transactions &amp; Concurrency</a>.)</p>
  <p>PostgreSQL has a property here that many databases lack: its DDL is <em>transactional</em> too. Even dropping a whole table can be undone if it happens inside a transaction:</p>
  <div class="fx" data-lang="sql">BEGIN;
DROP TABLE order_items;
SELECT COUNT(*) FROM order_items;
ROLLBACK;
SELECT COUNT(*) FROM order_items;</div>
  <div class="fx" data-lang="text">BEGIN
DROP TABLE
ERROR:  relation "order_items" does not exist
LINE 1: SELECT COUNT(*) FROM order_items;
                             ^
ROLLBACK
 count 
-------
    15
(1 row)</div>
  <p>After <code>DROP TABLE</code> the table really is gone inside the transaction (the <code>SELECT</code> fails with "does not exist"), yet after <code>ROLLBACK</code> it is back with all fifteen rows. This makes schema changes much safer, because a migration that fails halfway can be rolled back completely. In MySQL and Oracle, a DDL statement automatically commits the open transaction, so it cannot be undone this way.</p>
  <p>Finally, DCL. A data analyst should be able to read Biteful's tables but never change them. We create a role (PostgreSQL's word for a user or group), grant it read access, and then act as that role:</p>
  <div class="fx" data-lang="sql">CREATE ROLE analyst;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst;
SET ROLE analyst;
SELECT COUNT(*) AS orders_visible FROM orders;
DELETE FROM orders WHERE order_id = 110;</div>
  <div class="fx" data-lang="text">CREATE ROLE
GRANT
SET
 orders_visible 
----------------
             10
(1 row)

ERROR:  permission denied for table orders</div>
  <p>As <code>analyst</code>, the <code>SELECT</code> works and sees all ten orders, but the <code>DELETE</code> is refused with "permission denied". Granting each person or service only the permissions it needs is called the principle of least privilege, and DCL is how it is enforced inside the database.</p>

  <h2 id="sr-pg"><span class="num">08</span>PostgreSQL and SQL Dialects</h2>
  <p>A <strong>database management system</strong> (DBMS) is the software that stores the data, runs the SQL and enforces the rules. Many relational DBMSs exist, and they all speak SQL, because SQL is an international standard. But each product also adds its own functions, types and syntax on top of the standard core. One product's version of SQL is called its <strong>dialect</strong>. The differences are like those between British and American English: you are understood everywhere, but some words and spellings change.</p>
  <p>These notes use <strong>PostgreSQL</strong> (often just "Postgres"). It is open source, so it is free and its code is public; it is offered as a managed service by every major cloud; and it follows the SQL standard closely while being strict about types and rules, so habits learned on it transfer well. It is also unusually extensible: extensions add geographic data (PostGIS), vector search for AI applications (pgvector) and time-series features (TimescaleDB), and its <code>JSONB</code> type lets one database hold both tables and JSON documents. For a new application it is the sensible default. You can always ask the server what it is:</p>
  <div class="fx" data-lang="sql">SELECT version();</div>
  <div class="fx" data-lang="text">                                                                 version                                                                  
------------------------------------------------------------------------------------------------------------------------------------------
 PostgreSQL 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, 64-bit
(1 row)</div>
  <p>The other systems you will meet each have a niche. <strong>MySQL</strong> is simple, fast for read-heavy web applications and has a huge ecosystem (WordPress, early Facebook); it was historically more lenient about bad data. <strong>SQLite</strong> is not a server at all but a library that keeps the database in one file; it powers phones, browsers and tests, and allows one writer at a time. <strong>SQL Server</strong> is Microsoft's system, with the T-SQL dialect. <strong>Oracle</strong> is mature, very capable and expensive, common in banks and large enterprises. <strong>BigQuery</strong> and <strong>Snowflake</strong> are cloud data warehouses built for analysing huge tables, not for running an app's day-to-day writes. The everyday differences between dialects look like this:</p>
  <table class="tbl">
    <tr><th>Same idea</th><th>PostgreSQL</th><th>MySQL</th><th>SQL Server</th></tr>
    <tr><td>First n rows</td><td><code>LIMIT n</code></td><td><code>LIMIT n</code></td><td><code>TOP n</code> or <code>OFFSET … FETCH</code></td></tr>
    <tr><td>Current time</td><td><code>now()</code></td><td><code>NOW()</code></td><td><code>GETDATE()</code></td></tr>
    <tr><td>Auto-generated id</td><td><code>GENERATED … AS IDENTITY</code></td><td><code>AUTO_INCREMENT</code></td><td><code>IDENTITY(1,1)</code></td></tr>
    <tr><td>Case-insensitive match</td><td><code>ILIKE</code></td><td><code>LIKE</code> (default collation ignores case)</td><td><code>LIKE</code> (depends on collation)</td></tr>
    <tr><td>DDL inside a transaction</td><td>can be rolled back</td><td>auto-commits</td><td>can be rolled back</td></tr>
  </table>
  <p>The practical rule: the core (SELECT, WHERE, JOIN, GROUP BY, keys, constraints) is the same everywhere, so learn it once; but never assume a query means exactly the same thing on another engine. Older MySQL, for example, would return an arbitrary value for a column that was neither grouped nor aggregated, where PostgreSQL raises an error. Test on the engine you will actually run.</p>

  <h2 id="sr-tools"><span class="num">09</span>psql, Python and SQL Injection</h2>
  <p>In daily work you talk to PostgreSQL in two ways: interactively from a terminal while exploring, and from code (usually Python) when the data feeds an application, a notebook or a pipeline. Both send exactly the same SQL; they differ in what they do with the results.</p>
  <p><code>psql</code> is PostgreSQL's command-line client. You connect with <code>psql -d biteful</code>, type SQL ending in a semicolon, and it prints the result as a text table. Commands that start with a backslash are psql's own shortcuts rather than SQL: <code>&#92;dt</code> lists the tables, <code>&#92;d name</code> describes one table, and <code>&#92;x</code> switches to "expanded" display, one field per line, which is handy for wide rows. <code>&#92;d</code> is the one to remember, because it answers "what columns does this table have, and what rules apply?" in one screen:</p>
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
delivery_minutes | NULL</div>
  <p>Everything from the previous sections is visible here: each column's type (note <code>numeric(8,2)</code> and <code>timestamp with time zone</code>), which columns may be NULL (only <code>delivery_minutes</code>), the primary-key index, the three CHECK constraints, the two foreign keys going out to customers and restaurants, and the one coming in from <code>order_items</code>. After <code>&#92;x</code>, order 105 prints one field per line.</p>
  <p>From Python, a <strong>driver</strong> is the library that opens a connection to the database and sends SQL over it. For PostgreSQL the standard driver is <code>psycopg</code> (version 3; the older <code>psycopg2</code> works the same way for these examples). It returns rows as Python tuples. For analysis you usually want a pandas DataFrame instead, and <code>pandas.read_sql</code> runs a query and builds one, using a SQLAlchemy "engine" (a connection factory) to reach the database. In both calls below, notice that the value we filter on (customer 1, or ₹300) is <em>not</em> written into the SQL text. The SQL contains a placeholder (<code>%s</code> for psycopg, <code>:min_amount</code> for SQLAlchemy) and the value is passed separately as a <strong>parameter</strong>. Why that matters is the point of the next example.</p>
  <div class="fx" data-lang="py">import psycopg                       # psycopg 3, the PostgreSQL driver
import pandas as pd
from sqlalchemy import create_engine, text

with psycopg.connect("dbname=biteful") as conn:
    rows = conn.execute(
        "SELECT order_id, status, amount FROM orders WHERE customer_id = %s ORDER BY order_id",
        (1,),                        # the value travels separately from the SQL
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
  <p>The first line is the psycopg result: Asha's three orders, with amounts as Python <code>Decimal</code> values, so the exactness of <code>NUMERIC</code> survives into Python. The DataFrame groups the six orders above ₹300 (102, 103, 104, 105, 109 and 110) by status; the delivered total is 450 + 520 + 380 + 600 = 1950. But look at the last lines: pandas turned the <code>NUMERIC</code> total into <code>float64</code>, an approximate binary float. That is fine for charts, but if you compute money in a DataFrame, round deliberately or convert to <code>Decimal</code>.</p>
  <p>Now the security problem that parameters solve. Biteful's support tool has a box: "find customer by name". A developer builds the query by gluing the typed text into the SQL string. A normal user types <code>Asha</code> and the query becomes <code>WHERE name = 'Asha'</code>. An attacker instead types text that <em>contains a quote mark followed by SQL</em>, so that after gluing it is no longer a name but new SQL, which the database obediently runs. This attack is called <strong>SQL injection</strong>, and it remains one of the most common ways real systems leak data:</p>
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
  <p>The printed SQL shows what happened: the attacker's quote mark closed the string early, and <code>OR '1'='1'</code> became part of the condition. Since <code>'1'='1'</code> is always true, the WHERE matched every row and all seven customers leaked. With a parameter, the driver sends the typed text purely as a value, quote marks and all. The database looks for a customer literally named <code>x' OR '1'='1</code>, finds none, and returns an empty list. It is like a paper form with a box for "name": gluing lets the visitor write anywhere on the form, including "and also approve my loan"; a parameter is a box with walls, and whatever is written inside stays a name.</p>
  <p>The rule has no exceptions: every value that comes from outside your code (a user, a file, an API) goes in as a parameter. Python f-strings and <code>%</code> formatting are exactly as unsafe as <code>+</code>. Parameters can only stand for values, not for table or column names; if a user may choose a column to sort by, check it against a fixed list of allowed names (or use <code>psycopg.sql.Identifier</code>).</p>

  <h2 id="sr-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The most widespread mistake is assuming that rows come back in a fixed order. Because a small table usually returns rows in the order they were inserted, people start relying on it. But a table is a set, and PostgreSQL returns rows in whatever order is cheapest. Updating a row is enough to move it, because PostgreSQL writes the new version of the row in a new place:</p>
  <div class="fx" data-lang="sql">SELECT order_id, status FROM orders WHERE order_id &lt;= 103;
UPDATE orders SET delivery_minutes = 33 WHERE order_id = 101;
SELECT order_id, status FROM orders WHERE order_id &lt;= 103;
SELECT order_id, status FROM orders WHERE order_id &lt;= 103 ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id |  status   
----------+-----------
      101 | delivered
      102 | delivered
      103 | delivered
(3 rows)

UPDATE 1
 order_id |  status   
----------+-----------
      102 | delivered
      103 | delivered
      101 | delivered
(3 rows)

 order_id |  status   
----------+-----------
      101 | delivered
      102 | delivered
      103 | delivered
(3 rows)</div>
  <p>Before the update, the three orders came back as 101, 102, 103. We changed one value in order 101, and the same query returned 102, 103, 101. Nothing about the query changed. Only <code>ORDER BY</code> guarantees an order, as the last query shows; any report or test that depends on order without it is a bug waiting to happen.</p>
  <p>A second surprise is that a <code>UNIQUE</code> column accepts any number of NULLs. NULL means "unknown", and two unknown values are not considered equal, so they do not count as duplicates:</p>
  <div class="fx" data-lang="sql">ALTER TABLE customers ADD COLUMN email TEXT UNIQUE;
UPDATE customers SET email = 'asha@example.com' WHERE customer_id = 1;
INSERT INTO customers (customer_id, name, signup_date, email) VALUES (8, 'Hari', '2026-03-09', NULL);
INSERT INTO customers (customer_id, name, signup_date, email) VALUES (9, 'Isha', '2026-03-09', NULL);
INSERT INTO customers (customer_id, name, signup_date, email) VALUES (10, 'Jai', '2026-03-09', 'asha@example.com');
SELECT COUNT(*) FILTER (WHERE email IS NULL) AS null_emails FROM customers;</div>
  <div class="fx" data-lang="text">ALTER TABLE
UPDATE 1
INSERT 0 1
INSERT 0 1
ERROR:  duplicate key value violates unique constraint "customers_email_key"
DETAIL:  Key (email)=(asha@example.com) already exists.
 null_emails 
-------------
           8
(1 row)</div>
  <p>Hari and Isha were both inserted with no email, and the unique constraint allowed it; only the real duplicate, a second <code>asha@example.com</code>, was refused. Eight customers now have a NULL email. If every customer must have a distinct email, add <code>NOT NULL</code> as well; if NULLs are allowed but at most one, PostgreSQL 15 and later accept <code>UNIQUE NULLS NOT DISTINCT</code>.</p>
  <p>A third mistake costs performance rather than correctness. PostgreSQL automatically creates an index (a lookup structure that finds rows by value without reading the whole table) for every primary key and UNIQUE constraint, but <em>not</em> for foreign keys:</p>
  <div class="fx" data-lang="sql">SELECT indexname FROM pg_indexes WHERE tablename = 'orders';
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
SELECT indexname FROM pg_indexes WHERE tablename = 'orders' ORDER BY indexname;</div>
  <div class="fx" data-lang="text">  indexname  
-------------
 orders_pkey
(1 row)

CREATE INDEX
       indexname        
------------------------
 orders_customer_id_idx
 orders_pkey
(2 rows)</div>
  <p><code>orders</code> starts with only <code>orders_pkey</code>. Without an index on <code>orders.customer_id</code>, "all orders for customer 1" and every attempt to delete a customer must scan the whole orders table, which is invisible on ten rows and painful on ten million. Creating the index fixes it. (Indexes are covered properly in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>.)</p>
  <p>The remaining classics were shown in their own sections and only need a reminder. Storing a list of ids in one text cell (<code>'10,12'</code>) instead of building a junction table means you cannot join on it, index it or protect it with a foreign key. Using a natural key such as an email as the primary key means every foreign key must change when the email does. Using <code>FLOAT</code> for money and <code>TIMESTAMP</code> for events silently corrupts sums and times. Relying only on application validation lets scripts bypass the rules. Expecting identity ids to be consecutive breaks as soon as an insert fails. And gluing user input into SQL invites injection.</p>

  <h2 id="sr-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why tables</h3>
  <ul>
    <li><b>Anomalies</b> of one big sheet: <b>update</b> (a fact in many rows can disagree), <b>insert</b> (cannot store Gita without an order), <b>delete</b> (deleting order 105 deletes Dia).</li>
    <li><b>Relational model</b>: each fact stored once in a table; tables refer to each other by key values; a JOIN rebuilds the wide view.</li>
    <li><b>Relation</b> = table, <b>tuple</b> = row, <b>attribute</b> = column, <b>domain</b> = a column's allowed values. Rows are unordered.</li>
  </ul>
  <h3>Keys and relationships</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th><th>Biteful</th></tr>
    <tr><td>Primary key</td><td>unique + NOT NULL, one per table</td><td><code>customers.customer_id</code></td></tr>
    <tr><td>Candidate key</td><td>any column set that could be the PK; the others get UNIQUE</td><td><code>restaurants.name</code></td></tr>
    <tr><td>Composite key</td><td>key of 2+ columns</td><td><code>order_items (order_id, item)</code></td></tr>
    <tr><td>Foreign key</td><td>must match a parent's PK/UNIQUE value (or be NULL)</td><td><code>orders.customer_id</code></td></tr>
    <tr><td>Natural / surrogate</td><td>real-world id / generated id; prefer surrogate PK + UNIQUE natural key</td><td>email / <code>customer_id</code></td></tr>
    <tr><td>1:N</td><td>FK on the many side</td><td>customer → orders</td></tr>
    <tr><td>1:1</td><td>FK + UNIQUE</td><td>customer → loyalty profile</td></tr>
    <tr><td>M:N</td><td>junction table with two FKs (+ facts about the pair)</td><td><code>orders</code>: customers ↔ restaurants</td></tr>
    <tr><td>Self-reference</td><td>FK to the same table's PK</td><td><code>referred_by</code></td></tr>
  </table>
  <h3>Types and constraints</h3>
  <table class="tbl">
    <tr><th>Use</th><th>For</th><th>Avoid</th></tr>
    <tr><td><code>NUMERIC(p,s)</code></td><td>money (exact)</td><td>FLOAT: 0.1 + 0.2 = 0.30000000000000004</td></tr>
    <tr><td><code>TIMESTAMPTZ</code></td><td>events (stored as UTC, shown in session zone)</td><td>TIMESTAMP for events</td></tr>
    <tr><td><code>TEXT</code></td><td>strings</td><td>VARCHAR(255) by habit; CHAR(n)</td></tr>
    <tr><td>ON DELETE RESTRICT / NO ACTION</td><td>history (orders, payments)</td><td>CASCADE on history</td></tr>
    <tr><td>ON DELETE CASCADE</td><td>owned children (reviews, order lines)</td><td></td></tr>
    <tr><td>ON DELETE SET NULL</td><td>optional links (referred_by)</td><td></td></tr>
  </table>
  <h3>SQL groups and syntax</h3>
  <table class="tbl">
    <tr><th>Group</th><th>Commands</th></tr>
    <tr><td>DDL</td><td>CREATE, ALTER, DROP, TRUNCATE (transactional in Postgres)</td></tr>
    <tr><td>DML</td><td>INSERT, UPDATE, DELETE, MERGE</td></tr>
    <tr><td>DQL</td><td>SELECT</td></tr>
    <tr><td>DCL</td><td>GRANT, REVOKE</td></tr>
    <tr><td>TCL</td><td>BEGIN, COMMIT, ROLLBACK, SAVEPOINT</td></tr>
  </table>
  <div class="fx" data-lang="sql">CREATE TABLE reviews (
  review_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id   INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  restaurant_id INT NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE RESTRICT,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, restaurant_id)
);
-- Python: values always as parameters
-- conn.execute("SELECT * FROM customers WHERE name = %s", (name,))</div>
  <h3>Gotchas</h3>
  <ul>
    <li>No <code>ORDER BY</code> = no guaranteed order (an UPDATE moved order 101 to the end).</li>
    <li>UNIQUE allows many NULLs; add NOT NULL or <code>NULLS NOT DISTINCT</code>.</li>
    <li>Foreign keys are not indexed automatically in PostgreSQL.</li>
    <li>Identity ids have gaps (failed inserts used 2 to 5; Gita's review got 6).</li>
    <li>pandas turns NUMERIC into float64.</li>
    <li>f-strings, <code>%</code> and <code>+</code> in SQL invite injection: <code>x' OR '1'='1</code> leaked all 7 customers.</li>
  </ul>

  <h2 id="sr-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a relational database, and why split data into several tables?</summary><div class="qa-body">A relational database stores data in tables (relations) of rows and typed columns, with tables linked by key values. Splitting data so that each fact is stored once avoids update, insert and delete anomalies: Asha's city lives in one row, so a move is one edit, a customer can exist before ordering, and deleting an order does not delete the customer. JOINs rebuild the combined view when needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the update, insert and delete anomalies?</summary><div class="qa-body">An update anomaly is when the same fact is stored in several rows and the copies can disagree after a partial edit. An insert anomaly is when you cannot store one fact without another (a customer with no order has no row to live on). A delete anomaly is when deleting one fact removes another (deleting Dia's only order deletes Dia). Normalization removes all three.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a primary key and a foreign key?</summary><div class="qa-body">A primary key uniquely identifies each row of its own table; it must be unique and NOT NULL, and there is one per table. A foreign key is a column whose values must match the primary (or unique) key of a row in another table, or be NULL. Together they guarantee referential integrity: no reference points at a row that does not exist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Primary key versus UNIQUE constraint?</summary><div class="qa-body">Both prevent duplicates and both create an index. A table has one primary key, it can never be NULL, and it is the usual target of foreign keys. A table can have many UNIQUE constraints, and a UNIQUE column accepts multiple NULLs because NULLs are not considered equal.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are candidate, composite, natural and surrogate keys?</summary><div class="qa-body">A candidate key is any minimal set of columns that could uniquely identify rows; one is chosen as the primary key. A composite key uses two or more columns together, like <code>(order_id, item)</code>. A natural key is a real-world identifier (email, phone); a surrogate key is a generated, meaningless id. The usual design is a surrogate primary key with a UNIQUE constraint on the natural key, because natural keys change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you model a many-to-many relationship, for example students and courses?</summary><div class="qa-body">With a junction table holding one row per pair: <code>enrollments(student_id REFERENCES students, course_id REFERENCES courses, grade, PRIMARY KEY (student_id, course_id))</code>. Facts about the pair, such as the grade or enrolment date, live in the junction table. In Biteful, <code>orders</code> plays this role between customers and restaurants.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where does the foreign key go in a one-to-many relationship, and how do you make a one-to-one?</summary><div class="qa-body">On the "many" side: each order stores its customer_id, because a customer cannot hold a list in one cell. A one-to-one is a foreign key with a UNIQUE constraint on it (or a child table whose primary key is also the foreign key), so each parent can have at most one child.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a self-referencing foreign key? Give a use.</summary><div class="qa-body">A foreign key that points at the primary key of the same table. It stores hierarchies and chains: an employee's manager, a category's parent, or Biteful's <code>referred_by</code>. You read it by joining the table to itself under two aliases; following an unknown number of levels needs a recursive CTE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should money not be stored as FLOAT?</summary><div class="qa-body">Floats are binary approximations, so many decimal fractions cannot be stored exactly: in PostgreSQL 0.1 + 0.2 gives 0.30000000000000004 and summing 0.1 ten times gives 0.9999999999999999. Errors accumulate in totals. Use <code>NUMERIC(p,s)</code>, or store whole paise or cents as integers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>TIMESTAMP versus TIMESTAMPTZ?</summary><div class="qa-body">TIMESTAMP stores a wall-clock date and time with no zone, so you cannot tell which city's clock it was. TIMESTAMPTZ stores an absolute instant: it converts input to UTC and displays it in the session's time zone. Use TIMESTAMPTZ for events (orders, logins); use TIMESTAMP only for zone-less times like opening hours.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What constraints can a table have, and why put rules in the database rather than the app?</summary><div class="qa-body">NOT NULL, UNIQUE, CHECK, PRIMARY KEY, FOREIGN KEY, plus DEFAULT values. The database enforces them on every write from every client, including scripts, admin tools and other services that never run the app's validation. App checks give friendly messages; constraints guarantee correctness.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>CASCADE versus RESTRICT versus SET NULL: when would you use each?</summary><div class="qa-body">RESTRICT or NO ACTION (the default) refuses to delete a parent that still has children; use it when history must be kept, like orders and payments. CASCADE deletes the children too; use it for data owned by the parent, like reviews or order lines. SET NULL keeps the children but clears the link; use it for optional references such as a referrer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An identity column jumps from 1 to 6 even though only two rows exist. Is that a bug?</summary><div class="qa-body">No. Sequence values are handed out before a row is checked and are never returned, even when the insert fails or the transaction rolls back, so concurrent inserts never wait on each other. Ids are unique, not gap-free; do not count rows with MAX(id) or rely on consecutive numbers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the SQL sub-languages and classify TRUNCATE, GRANT, MERGE, SAVEPOINT and SELECT.</summary><div class="qa-body">DDL defines structure, DML changes rows, DQL reads, DCL manages permissions, TCL controls transactions. TRUNCATE is DDL (it empties a table by resetting its storage rather than deleting row by row), GRANT is DCL, MERGE is DML, SAVEPOINT is TCL and SELECT is DQL (some texts count it as DML).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you roll back a DROP TABLE?</summary><div class="qa-body">In PostgreSQL, yes, if it ran inside a transaction: DDL is transactional, so <code>BEGIN; DROP TABLE t; ROLLBACK;</code> restores the table with its data. In MySQL and Oracle, DDL commits the open transaction automatically, so it cannot be undone that way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why choose PostgreSQL for a new project, and what is a SQL dialect?</summary><div class="qa-body">PostgreSQL is open source, standards-compliant, strict about data, transactional even for DDL, available as a managed service on every cloud, and extensible (PostGIS, pgvector, JSONB). A dialect is one product's version of SQL: the shared standard core plus its own functions and syntax, such as <code>LIMIT</code> versus <code>TOP</code> or <code>ILIKE</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is SQL injection and how do you prevent it?</summary><div class="qa-body">It is an attack where user input containing SQL syntax is concatenated into a query and changes its meaning; typing <code>x' OR '1'='1</code> into a name search returned every customer. Prevent it with parameterised queries, where the SQL has placeholders and values are sent separately, so they can never be parsed as SQL. For identifiers like column names, use an allow-list.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should foreign key columns usually be indexed?</summary><div class="qa-body">PostgreSQL indexes primary keys and UNIQUE columns automatically but not foreign keys. Joins from parent to child ("orders of customer 1") and deletes of a parent (which must check for children) then scan the whole child table. An index on the foreign key column makes both fast on large tables.</div></details>
</main>
`
});
