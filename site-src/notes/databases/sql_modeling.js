// notes/databases/sql_modeling.js — Data Modeling
Object.assign(TOPIC_CONTENT, {
  "sql_modeling": `<main>
  <h1>Data Modeling</h1>
  <div class="where"><span>Databases</span><span>SQL</span><span>Data Modeling</span></div>
  <p class="lead">Data modeling is the work of deciding which tables a database should have, which columns go in each table, and how the tables point at each other. It matters because a badly shaped database lets the same fact be stored in several places, and sooner or later those copies disagree: a customer lives in two cities, an order is both delivered and cancelled, a report counts revenue twice. Every earlier note in this track used Biteful's four tables (customers, restaurants, orders, order_items) as if they were obvious. This note explains where they come from. We start the way a beginner would, with one giant spreadsheet called <code>biteful_sheet</code> that has a row per order line and every customer and restaurant detail copied onto it, watch it break, and repair it step by step into the four-table design; then we reshape the same data a second time, on purpose, into the star schema that analysts use. Every query was run on PostgreSQL 16 and the output under each one is real.</p>

  <h2 id="sm-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Data Modeling</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why model</div>
        <ul>
          <li>One wide table stores each fact many times</li>
          <li>Copies disagree: update, insert, delete anomalies</li>
          <li>Goal: every fact stored once, in the table of the thing it describes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keys and relationships</div>
        <ul>
          <li><b>A → B</b>: knowing A tells you B</li>
          <li><b>Key</b>: columns that decide every other column</li>
          <li>1:N → foreign key on the many side; M:N → junction table</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Normal forms</div>
        <ul>
          <li><b>1NF</b> one value per cell</li>
          <li><b>2NF</b> depend on the whole key</li>
          <li><b>3NF</b> nothing but the key; <b>BCNF</b> every determinant is a key</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Copies on purpose</div>
        <ul>
          <li>Denormalise for reads: stored totals, materialised views</li>
          <li>OLAP: star schema = fact table + dimensions</li>
          <li>Declare the grain; SCD Type 2 keeps history</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sm-sheet"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Giant Spreadsheet</span><span class="rm-sub">why a single wide table goes wrong</span></div></div>
      <div class="rm-item rm-done" data-target="sm-keys"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Functional Dependencies and Keys</span><span class="rm-sub">which column decides which</span></div></div>
      <div class="rm-item rm-done" data-target="sm-er"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Entities and Relationships</span><span class="rm-sub">the ER model and cardinality</span></div></div>
      <div class="rm-item rm-done" data-target="sm-1nf"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">First Normal Form</span><span class="rm-sub">one value in every cell</span></div></div>
      <div class="rm-item rm-done" data-target="sm-2nf"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Second Normal Form</span><span class="rm-sub">depend on the whole key</span></div></div>
      <div class="rm-item rm-done" data-target="sm-3nf"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Third Normal Form</span><span class="rm-sub">nothing but the key</span></div></div>
      <div class="rm-item rm-done" data-target="sm-bcnf"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">BCNF and Beyond</span><span class="rm-sub">when a non-key column decides part of the key</span></div></div>
      <div class="rm-item rm-done" data-target="sm-denorm"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Denormalisation</span><span class="rm-sub">copying data back on purpose, and the cost</span></div></div>
      <div class="rm-item rm-done" data-target="sm-star"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">OLTP, OLAP and the Star Schema</span><span class="rm-sub">a second shape for analysts</span></div></div>
      <div class="rm-item rm-done" data-target="sm-facts"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Facts, Dimensions and Grain</span><span class="rm-sub">what one fact row means and what can be summed</span></div></div>
      <div class="rm-item rm-done" data-target="sm-scd"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Slowly Changing Dimensions</span><span class="rm-sub">keeping history when attributes change</span></div></div>
      <div class="rm-item rm-done" data-target="sm-conv"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">JSONB and Practical Conventions</span><span class="rm-sub">flexible columns, keys, timestamps, soft delete</span></div></div>
      <div class="rm-item rm-done" data-target="sm-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">lists in cells, wrong joins, leaky soft deletes</span></div></div>
      <div class="rm-item rm-done" data-target="sm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, normal forms, star schema, SCD</span></div></div>
      <div class="rm-item rm-done" data-target="sm-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on schema design</span></div></div>
    </div>
  </div>

  <h2 id="sm-sheet"><span class="num">01</span>One Giant Spreadsheet</h2>
  <p>Imagine Biteful on its first day. The founders track orders in a spreadsheet, and since a spreadsheet invites it, every row holds everything: the order's number, status and bill, the customer's name and city, the restaurant's name and cuisine, and the dish and quantity. Because one order can contain several dishes, there is one row per <em>order line</em>, and the order's details are simply repeated on each of its lines. Moved into PostgreSQL unchanged, that sheet is the table <code>biteful_sheet</code> (it also has the order time, the restaurant's city and the unit price, left out here to keep the output narrow):</p>
  <div class="fx" data-lang="sql">SELECT order_id, status, amount, customer, customer_city, restaurant, cuisine, item, qty
FROM biteful_sheet
ORDER BY order_id, item;</div>
  <div class="fx" data-lang="text"> order_id |  status   | amount | customer | customer_city |  restaurant  |   cuisine    |      item       | qty 
----------+-----------+--------+----------+---------------+--------------+--------------+-----------------+-----
      101 | delivered | 240.00 | Asha     | Pune          | Dosa Hut     | South Indian | Masala Dosa     |   2
      102 | delivered | 450.00 | Ben      | Mumbai        | Biryani Bros | Biryani      | Chicken Biryani |   1
      102 | delivered | 450.00 | Ben      | Mumbai        | Biryani Bros | Biryani      | Raita           |   2
      103 | delivered | 520.00 | Chen     | Pune          | Pizza Point  | Pizza        | Farmhouse Pizza |   2
      104 | delivered | 380.00 | Asha     | Pune          | Pizza Point  | Pizza        | Garlic Bread    |   1
      104 | delivered | 380.00 | Asha     | Pune          | Pizza Point  | Pizza        | Margherita      |   1
      105 | cancelled | 310.00 | Dia      | Mumbai        | Green Bowl   | Healthy      | Buddha Bowl     |   1
      106 | delivered | 180.00 | Ben      | Mumbai        | Biryani Bros | Biryani      | Veg Biryani     |   1
      107 | cancelled | 260.00 | Esha     | NULL          | Pizza Point  | Pizza        | Farmhouse Pizza |   1
      108 | delivered | 260.00 | Chen     | Pune          | Dosa Hut     | South Indian | Filter Coffee   |   2
      108 | delivered | 260.00 | Chen     | Pune          | Dosa Hut     | South Indian | Masala Dosa     |   1
      109 | delivered | 600.00 | Farah    | Mumbai        | Biryani Bros | Biryani      | Chicken Biryani |   1
      109 | delivered | 600.00 | Farah    | Mumbai        | Biryani Bros | Biryani      | Mutton Kebab    |   1
      110 | pending   | 310.00 | Asha     | Pune          | Dosa Hut     | South Indian | Filter Coffee   |   1
      110 | pending   | 310.00 | Asha     | Pune          | Dosa Hut     | South Indian | Masala Dosa     |   2
(15 rows)</div>
  <p>Fifteen rows, and at first glance nothing is wrong. But read down the columns. "Ben, Mumbai" is written three times (both lines of order 102 and the line of order 106). "Biryani Bros, Biryani" appears five times. Order 102's status and ₹450 bill appear twice. Each of these is <em>one fact</em> about the world stored in several rows. Repetition wastes some space, but space is cheap; the real problem is that every copy can be changed on its own, so the copies can start to disagree. There are three classic ways this goes wrong, and we can make each one happen.</p>
  <p>First, Ben moves to Pune. Whoever updates the data finds the row they happen to be looking at, order 106, and changes the city there:</p>
  <div class="fx" data-lang="sql">UPDATE biteful_sheet SET customer_city = 'Pune' WHERE order_id = 106;

SELECT DISTINCT customer, customer_city FROM biteful_sheet WHERE customer = 'Ben';</div>
  <div class="fx" data-lang="text">UPDATE 1
 customer | customer_city 
----------+---------------
 Ben      | Mumbai
 Ben      | Pune
(2 rows)</div>
  <p>The database now says Ben lives in two cities at once. To change one fact correctly you have to find and change every copy of it, and nothing in the table makes sure that happens. This is an <strong>update anomaly</strong>: a fact stored in many rows gets changed in only some of them.</p>
  <p>Second, a new customer, Gita, signs up but has not ordered yet, and a new restaurant, Momo Magic, joins but has not received an order. Where do they go?</p>
  <div class="fx" data-lang="sql">SELECT count(DISTINCT customer) AS customers, count(DISTINCT restaurant) AS restaurants
FROM biteful_sheet;</div>
  <div class="fx" data-lang="text"> customers | restaurants 
-----------+-------------
         6 |           4
(1 row)</div>
  <p>The sheet knows six customers and four restaurants, while Biteful really has seven and five. Every row is an order line, so a customer can only exist inside an order. Gita and Momo Magic <em>cannot be stored at all</em> until someone places an order. This is an <strong>insert anomaly</strong>: you cannot record one fact without also inventing an unrelated one.</p>
  <p>Third, Dia's only order, 105, was cancelled, and someone tidies the table by deleting it:</p>
  <div class="fx" data-lang="sql">DELETE FROM biteful_sheet WHERE order_id = 105;

SELECT count(*) FILTER (WHERE customer = 'Dia')          AS dia_rows,
       count(*) FILTER (WHERE restaurant = 'Green Bowl') AS green_bowl_rows
FROM biteful_sheet;</div>
  <div class="fx" data-lang="text">DELETE 1
 dia_rows | green_bowl_rows 
----------+-----------------
        0 |               0
(1 row)</div>
  <p>Deleting one order also deleted the only record that Dia exists, and the only record that Green Bowl exists and serves healthy food. This is a <strong>delete anomaly</strong>: removing one fact removes other, unrelated facts with it.</p>
  <p>Think of a kitchen where, instead of one salt jar on the spice shelf, a small jar of salt sits next to every dish. Refilling "the salt" means hunting down every jar, and you will miss one; throwing away a dish throws away its salt too. All three anomalies come from the same root cause: this one table is describing several different things at once (orders, customers, restaurants and order lines), so facts about one thing are glued to facts about another. <strong>Data modeling</strong> is the work of choosing tables, columns and keys so that each fact has exactly one home, which makes these anomalies impossible by design rather than something the application has to be careful about. "We'll just be careful in the app" never lasts: every new feature, script and analyst query is one more chance to update one copy and not the others. To split the table correctly, though, we first need a precise way to say which column belongs with which.</p>

  <h2 id="sm-keys"><span class="num">02</span>Functional Dependencies and Keys</h2>
  <p>"One table per thing" sounds like the cure, but we need a test that tells us, for each column, which thing it really describes. That test is the <strong>functional dependency</strong>, written <code>A → B</code> and read "A determines B": if two rows have the same value of A, they must have the same value of B. If you know the order id, you know its status; if you know the customer, you know their city. The column on the left, A, is called the <strong>determinant</strong>.</p>
  <p>A train ticket makes this concrete. The PNR number printed on it determines the passenger, the train and the seat: give a clerk the PNR and they can tell you all three. The train number determines the route, but not the passenger. Modeling asks every column the same question: "which thing really decides you?", and moves the column to that thing's table.</p>
  <p>We can check a dependency against the data with a query. Group the rows by A and see whether any group contains more than one different value of B. Zero such groups means the dependency holds in today's data. The query below checks five candidate dependencies at once; each <code>UNION ALL</code> block tests one of them:</p>
  <div class="fx" data-lang="sql">-- For each "A → B": how many A-groups contain more than one B? (0 = holds)
SELECT 'order_id → status, amount, customer' AS dependency, count(*) FILTER (WHERE n &gt; 1) AS violations
FROM (SELECT order_id, count(DISTINCT (status, amount, customer)) AS n FROM biteful_sheet GROUP BY order_id) g
UNION ALL
SELECT 'customer → customer_city', count(*) FILTER (WHERE n &gt; 1)
FROM (SELECT customer, count(DISTINCT coalesce(customer_city, '?')) AS n FROM biteful_sheet GROUP BY customer) g
UNION ALL
SELECT 'restaurant → restaurant_city, cuisine', count(*) FILTER (WHERE n &gt; 1)
FROM (SELECT restaurant, count(DISTINCT (restaurant_city, cuisine)) AS n FROM biteful_sheet GROUP BY restaurant) g
UNION ALL
SELECT '(order_id, item) → qty, unit_price', count(*) FILTER (WHERE n &gt; 1)
FROM (SELECT order_id, item, count(DISTINCT (qty, unit_price)) AS n FROM biteful_sheet GROUP BY order_id, item) g
UNION ALL
SELECT 'order_id → item', count(*) FILTER (WHERE n &gt; 1)
FROM (SELECT order_id, count(DISTINCT item) AS n FROM biteful_sheet GROUP BY order_id) g;</div>
  <div class="fx" data-lang="text">              dependency               | violations 
---------------------------------------+------------
 order_id → status, amount, customer   |          0
 customer → customer_city              |          0
 restaurant → restaurant_city, cuisine |          0
 (order_id, item) → qty, unit_price    |          0
 order_id → item                       |          5
(5 rows)</div>
  <p>Read the result row by row. An order id determines the order's status, bill and customer; a customer determines their city; a restaurant determines its city and cuisine; and the pair (order id, item) determines the quantity and the price paid. The last row is the useful failure: an order id does <em>not</em> determine the item, because five orders have two lines. One caution: data can only <em>disprove</em> a dependency. Whether it must always hold is a business rule ("a customer has one current city"); the query just confirms that today's data obeys it.</p>
  <p>Dependencies lead directly to keys. A <strong>key</strong> (more precisely a <strong>candidate key</strong>) is a minimal set of columns that determines every other column in the row, so no two rows can share it. If a table has several candidate keys, one is chosen as the <strong>primary key</strong>. For <code>biteful_sheet</code>, order id alone is not enough, but (order id, item) should be:</p>
  <div class="fx" data-lang="sql">SELECT count(*)                       AS rows,
       count(DISTINCT order_id)       AS distinct_order_ids,
       count(DISTINCT (order_id, item)) AS distinct_order_item_pairs
FROM biteful_sheet;</div>
  <div class="fx" data-lang="text"> rows | distinct_order_ids | distinct_order_item_pairs 
------+--------------------+---------------------------
   15 |                 10 |                        15
(1 row)</div>
  <p>Fifteen rows and fifteen distinct (order_id, item) pairs: no two rows share a pair, so it is a key. There are only ten distinct order ids, so order_id alone is not. A key made of more than one column, like this one, is called a <strong>composite key</strong>. Keys matter for everything that follows, because every normal form is defined by how the other columns depend on the key. A <strong>foreign key</strong> is simply a column that stores another table's key, such as <code>orders.customer_id</code> pointing at <code>customers.customer_id</code>; it is how tables refer to each other once we split them.</p>

  <h2 id="sm-er"><span class="num">03</span>Entities and Relationships</h2>
  <p>The dependencies we just found are really telling us which <em>things</em> Biteful stores facts about. Each group of columns that hangs off one determinant describes one thing: order id → status, bill, customer describes an order; customer → city describes a customer; restaurant → city, cuisine describes a restaurant; (order id, item) → qty, price describes one line of an order. In modeling language each such thing is an <strong>entity</strong>, its columns are its <strong>attributes</strong>, and the links between entities are <strong>relationships</strong>. Drawing them as boxes and lines gives an <strong>entity-relationship (ER) diagram</strong>, the standard first sketch of any schema. Designers often work in this direction too, starting from the business ("customers place orders at restaurants; an order has lines") and listing the nouns as entities before writing any SQL.</p>
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
  </svg><figcaption>Biteful as entities and relationships. The numbers on each line are its cardinality; the foreign key always sits on the "many" side.</figcaption></figure>
  <p>Read the diagram from left to right. One customer places many orders, but each order belongs to exactly one customer. That shape is called <strong>one-to-many</strong>, written 1:N, and the number of things on each side of a relationship is its <strong>cardinality</strong>. A one-to-many relationship is always built the same way: the foreign key goes on the "many" side, so <code>orders</code> has a <code>customer_id</code> column. It could not go the other way, because a customer row would need room for an unknown number of order ids. Restaurants to orders is also 1:N, and so is orders to order lines (each line carries its <code>order_id</code>). "Many" includes zero, which is exactly why Gita and Momo Magic can exist once customers and restaurants have their own tables.</p>
  <p>The relationship between customers and restaurants is different. Asha has ordered from two restaurants, and Pizza Point has served three customers, so it is <strong>many-to-many</strong>, written M:N. A relational table cannot hold a list in a cell, so an M:N relationship always needs a third table in the middle, called a <strong>junction table</strong> (or bridge table), with one row per pair. In Biteful the <code>orders</code> table already plays that role, and it carries its own facts (time, status, bill) as well:</p>
  <div class="fx" data-lang="sql">-- customers ↔ restaurants is many-to-many; orders is the table that links them
SELECT c.name AS customer, string_agg(DISTINCT r.name, ', ') AS ordered_from
FROM customers c
JOIN orders o      ON o.customer_id = c.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
GROUP BY c.name
ORDER BY c.name;</div>
  <div class="fx" data-lang="text"> customer |     ordered_from      
----------+-----------------------
 Asha     | Dosa Hut, Pizza Point
 Ben      | Biryani Bros
 Chen     | Dosa Hut, Pizza Point
 Dia      | Green Bowl
 Esha     | Pizza Point
 Farah    | Biryani Bros
(6 rows)</div>
  <p>Each row of the result is assembled from the junction rows: Asha's two orders at Dosa Hut and one at Pizza Point collapse to "Dosa Hut, Pizza Point". Two more shapes complete the picture. A <strong>one-to-one</strong> (1:1) relationship, such as a customer and their single loyalty card, is built as a foreign key with a UNIQUE constraint, and is usually only split into two tables when one side is optional or rarely read. A <strong>self-referencing</strong> relationship links a table to itself: <code>customers.referred_by</code> holds the id of the customer who referred them, so Asha referred Ben and Chen, and Ben referred Farah. With entities, keys and dependencies in hand, we can now turn "split the spreadsheet" into a step-by-step recipe. That recipe is <strong>normalisation</strong>, and each step is called a <strong>normal form</strong>.</p>

  <h2 id="sm-1nf"><span class="num">04</span>First Normal Form</h2>
  <p>Our sheet already has one row per order line, but a beginner's first draft is often even flatter: one row per order, with all the dishes typed into a single cell. It looks tidy, and it is easy to build from the sheet:</p>
  <div class="fx" data-lang="sql">-- A beginner's draft: one row per order, all items typed into one cell
CREATE TABLE orders_draft AS
SELECT order_id, customer, restaurant,
       string_agg(item || ' x' || qty, ', ' ORDER BY item) AS items
FROM biteful_sheet
GROUP BY order_id, customer, restaurant;

SELECT * FROM orders_draft WHERE order_id IN (101, 108, 110) ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id | customer | restaurant |              items               
----------+----------+------------+----------------------------------
      101 | Asha     | Dosa Hut   | Masala Dosa x2
      108 | Chen     | Dosa Hut   | Filter Coffee x2, Masala Dosa x1
      110 | Asha     | Dosa Hut   | Filter Coffee x1, Masala Dosa x2
(3 rows)</div>
  <p>Each order is one row, and the items column reads naturally to a human. Now ask the question every restaurant owner asks: how many Masala Dosas did we sell? The draft can only search inside text, while the line-per-row sheet can simply add up a column:</p>
  <div class="fx" data-lang="sql">-- "How many Masala Dosas were sold?"
SELECT count(*) AS orders_mentioning_dosa FROM orders_draft WHERE items LIKE '%Masala Dosa%';

SELECT sum(qty) AS masala_dosas_sold FROM biteful_sheet WHERE item = 'Masala Dosa';</div>
  <div class="fx" data-lang="text"> orders_mentioning_dosa 
------------------------
                      3
(1 row)

 masala_dosas_sold 
-------------------
                 5
(1 row)</div>
  <p>The text search finds 3 <em>orders</em> that mention Masala Dosa; the true answer is 5 <em>dosas</em> (2 in order 101, 1 in 108, 2 in 110). Getting 5 out of the draft means cutting strings at commas and at " x", which breaks the day someone types "Masala Dosa ×2" or a dish name contains a comma. The database cannot check, index or join on something buried inside a string, because to the database the whole cell is one opaque value.</p>
  <p>This is what <strong>first normal form</strong> (1NF) forbids. A table is in 1NF when every cell holds a single, indivisible value (database people say <strong>atomic</strong>), there are no repeating groups of columns, and every row can be identified by a key. Think of a shopping list written as one long sentence instead of one item per line: you cannot tick off, count or sort the items inside a sentence. Repeating columns are the same mistake in disguise: <code>item1, qty1, item2, qty2, item3, qty3</code> needs a schema change for a fourth item and an <code>OR</code> across every column for each search. The fix is always one row per repeated element, which is exactly what <code>biteful_sheet</code> does with its key (order_id, item). So the sheet is already in 1NF, and <code>SUM(qty)</code> just works. 1NF fixes counting, but the sheet still repeats every order's status on each of its lines, which is the next problem.</p>

  <h2 id="sm-2nf"><span class="num">05</span>Second Normal Form</h2>
  <p>The sheet's key is (order_id, item). Now ask each non-key column whether it needs <em>both</em> parts of that key or only one. The quantity needs both: it is how many of <em>this dish</em> were in <em>this order</em>. But the order time, status, bill, customer and restaurant, and everything about them, depend on <code>order_id</code> alone; the item has nothing to do with them. A column that depends on only part of a composite key has a <strong>partial dependency</strong>, and that is why order 102's status is stored twice. Here is the anomaly it allows:</p>
  <div class="fx" data-lang="sql">UPDATE biteful_sheet SET status = 'cancelled' WHERE order_id = 102 AND item = 'Raita';

SELECT order_id, item, status FROM biteful_sheet WHERE order_id = 102;</div>
  <div class="fx" data-lang="text">UPDATE 1
 order_id |      item       |  status   
----------+-----------------+-----------
      102 | Chicken Biryani | delivered
      102 | Raita           | cancelled
(2 rows)</div>
  <p>A support agent cancelled "order 102" by editing one of its lines, and now order 102 is both delivered and cancelled. The rule that cures this is <strong>second normal form</strong> (2NF): a table is in 2NF when it is in 1NF and every non-key column depends on the <em>whole</em> key, not just part of it. (A table whose key is a single column is automatically in 2NF, since a single column has no parts.) The fix is to split the table by what each column depends on. Columns that depend only on <code>order_id</code> move to a table keyed by order_id; only the line-level columns stay with (order_id, item):</p>
  <div class="fx" data-lang="sql">-- order-level columns: keyed by order_id alone
CREATE TABLE orders_2nf AS
SELECT DISTINCT order_id, ordered_at, status, amount, customer, customer_city,
                restaurant, restaurant_city, cuisine
FROM biteful_sheet;

-- line-level columns: keyed by (order_id, item)
CREATE TABLE lines_2nf AS
SELECT order_id, item, qty, unit_price FROM biteful_sheet;

SELECT order_id, status, amount, customer, customer_city, restaurant
FROM orders_2nf ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id |  status   | amount | customer | customer_city |  restaurant  
----------+-----------+--------+----------+---------------+--------------
      101 | delivered | 240.00 | Asha     | Pune          | Dosa Hut
      102 | delivered | 450.00 | Ben      | Mumbai        | Biryani Bros
      103 | delivered | 520.00 | Chen     | Pune          | Pizza Point
      104 | delivered | 380.00 | Asha     | Pune          | Pizza Point
      105 | cancelled | 310.00 | Dia      | Mumbai        | Green Bowl
      106 | delivered | 180.00 | Ben      | Mumbai        | Biryani Bros
      107 | cancelled | 260.00 | Esha     | NULL          | Pizza Point
      108 | delivered | 260.00 | Chen     | Pune          | Dosa Hut
      109 | delivered | 600.00 | Farah    | Mumbai        | Biryani Bros
      110 | pending   | 310.00 | Asha     | Pune          | Dosa Hut
(10 rows)</div>
  <p><code>SELECT DISTINCT</code> collapsed the fifteen lines into ten orders, so order 102's status is now a single cell with nothing left to disagree with. The other table keeps the fifteen lines with just quantity and price. Notice that <code>unit_price</code> stayed with the line. It is the price <em>paid in this order</em>, which depends on (order, item) together; today's menu price would be a different fact, about the dish alone, and would belong in a menu table.</p>
  <p>Whenever you split a table you must make sure nothing was lost or invented. A split is <strong>lossless</strong> if joining the pieces back together gives exactly the original rows. We can check that by joining and comparing in both directions with <code>EXCEPT</code>, which returns rows in the first query that are missing from the second:</p>
  <div class="fx" data-lang="sql">-- Lossless? Join the pieces back and compare with the original, both directions.
WITH rejoined AS (
  SELECT o.order_id, o.ordered_at, o.status, o.amount, o.customer, o.customer_city,
         o.restaurant, o.restaurant_city, o.cuisine, l.item, l.qty, l.unit_price
  FROM orders_2nf o JOIN lines_2nf l USING (order_id))
SELECT (SELECT count(*) FROM rejoined) AS rejoined_rows,
       (SELECT count(*) FROM (SELECT * FROM biteful_sheet EXCEPT SELECT * FROM rejoined) a) AS lost,
       (SELECT count(*) FROM (SELECT * FROM rejoined EXCEPT SELECT * FROM biteful_sheet) b) AS invented;</div>
  <div class="fx" data-lang="text"> rejoined_rows | lost | invented 
---------------+------+----------
            15 |    0 |        0
(1 row)</div>
  <p>The rejoin produces 15 rows, none of the original rows are lost, and none are invented. A split along a real dependency is always lossless. If you split on a column that does <em>not</em> determine the moved columns, the rejoin produces extra, wrong rows (often called spurious rows), and this check catches it.</p>

  <h2 id="sm-3nf"><span class="num">06</span>Third Normal Form</h2>
  <p>In <code>orders_2nf</code>, every column depends on <code>order_id</code>, which is the whole key. Yet Ben's city is still stored once per order, and Gita still has nowhere to live. Counting the copies makes it visible:</p>
  <div class="fx" data-lang="sql">SELECT customer, customer_city, count(*) AS copies
FROM orders_2nf
GROUP BY customer, customer_city
HAVING count(*) &gt; 1
ORDER BY customer;</div>
  <div class="fx" data-lang="text"> customer | customer_city | copies 
----------+---------------+--------
 Asha     | Pune          |      3
 Ben      | Mumbai        |      2
 Chen     | Pune          |      2
(3 rows)</div>
  <p>Asha's city is stored three times, Ben's and Chen's twice each. The reason is that <code>customer_city</code> depends on the order only <em>through</em> the customer: order_id → customer → customer_city. The city is a fact about Ben, not about order 102; it is attached to the order by a chain. A dependency that passes through another non-key column like this is called a <strong>transitive dependency</strong>. The restaurant's city and cuisine have the same problem (order_id → restaurant → cuisine).</p>
  <p><strong>Third normal form</strong> (3NF) forbids this: a table is in 3NF when it is in 2NF and no non-key column depends on the key through another non-key column. A school register shows why. It should not write each student's home address next to every exam mark: the address is a fact about the student, the mark is a fact about (student, exam). The address belongs on the student's card, written once. The traditional memory aid sums up all three forms: every non-key column must depend on "the key (1NF), the whole key (2NF), and nothing but the key (3NF)".</p>
  <p>The fix is to give each thing its own table and leave only a reference behind. Customers get a table keyed by a customer id, restaurants get one keyed by a restaurant id, and orders keep just <code>customer_id</code> and <code>restaurant_id</code> as foreign keys. We use made-up numeric ids rather than names because names repeat and change; an id with no business meaning, generated by the database, is called a <strong>surrogate key</strong>. The result is exactly the schema every other Biteful note uses:</p>
  <div class="fx" data-lang="sql">SELECT 'customers' AS table_name, count(*) AS rows FROM customers
UNION ALL SELECT 'restaurants', count(*) FROM restaurants
UNION ALL SELECT 'orders', count(*) FROM orders
UNION ALL SELECT 'order_items', count(*) FROM order_items;</div>
  <div class="fx" data-lang="text"> table_name  | rows 
-------------+------
 customers   |    7
 restaurants |    5
 orders      |   10
 order_items |   15
(4 rows)</div>
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
  </svg><figcaption>Each colour is one group of dependent columns in the sheet, and each becomes one table. This is how Biteful's four tables came to be.</figcaption></figure>
  <p>Follow the colours in the figure. The blue order-level columns left the sheet at the 2NF step and became <code>orders</code>. The red customer columns and the green restaurant columns left at the 3NF step and became <code>customers</code> and <code>restaurants</code>. What remains of the sheet, the black line-level columns, is <code>order_items</code>. Now let us replay all three anomalies from section 01 against this schema:</p>
  <div class="fx" data-lang="sql">-- 1. Ben moves: one row to change
UPDATE customers SET city = 'Pune' WHERE name = 'Ben';

-- 2. Customers and restaurants with no orders can exist
SELECT name FROM customers c   WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)
UNION ALL
SELECT name FROM restaurants r WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.restaurant_id = r.restaurant_id);

-- 3. Deleting an order deletes only the order
DELETE FROM order_items WHERE order_id = 105;
DELETE FROM orders      WHERE order_id = 105;
SELECT (SELECT city    FROM customers   WHERE name = 'Dia')        AS dia_city,
       (SELECT cuisine FROM restaurants WHERE name = 'Green Bowl') AS green_bowl_cuisine;</div>
  <div class="fx" data-lang="text">UPDATE 1
    name    
------------
 Gita
 Momo Magic
(2 rows)

DELETE 1
DELETE 1
 dia_city | green_bowl_cuisine 
----------+--------------------
 Mumbai   | Healthy
(1 row)</div>
  <p>Every anomaly is gone. Ben's move changed exactly one row, because his city is stored once. Gita and Momo Magic exist as ordinary rows in their own tables even though they have no orders. Deleting order 105 removed the order and its line, and Dia and Green Bowl are untouched. Most production databases for applications aim for 3NF; it is the point at which each fact has one home and the schema is still easy to work with.</p>

  <h2 id="sm-bcnf"><span class="num">07</span>BCNF and Beyond</h2>
  <p>Third normal form only talks about <em>non-key</em> columns. All our dependencies so far pointed from a key to some non-key column. But a table can also contain a dependency where a non-key column decides <em>part of the key</em>, and 3NF has nothing to say about that. It is rare, but it is the next rung of the ladder and a favourite interview question.</p>
  <p>Here is a Biteful example. Riders are assigned to restaurants by meal slot, with two rules: each restaurant has exactly one rider per slot, and each rider works only one slot (lunch or dinner). A natural table is <code>rider_shifts(restaurant, slot, rider)</code> with key (restaurant, slot). But the second rule is a dependency too, rider → slot, and rider is not a key. Ravi rides lunch for two restaurants, so "Ravi works lunch" is stored twice, and we can produce the familiar update anomaly:</p>
  <div class="fx" data-lang="sql">CREATE TABLE rider_shifts (
  restaurant TEXT, slot TEXT, rider TEXT,
  PRIMARY KEY (restaurant, slot));
INSERT INTO rider_shifts VALUES
  ('Biryani Bros', 'lunch',  'Ravi'), ('Green Bowl', 'lunch', 'Ravi'),
  ('Biryani Bros', 'dinner', 'Sara'), ('Dosa Hut',   'lunch', 'Imran');

UPDATE rider_shifts SET slot = 'dinner' WHERE rider = 'Ravi' AND restaurant = 'Green Bowl';
SELECT * FROM rider_shifts WHERE rider = 'Ravi' ORDER BY restaurant;</div>
  <div class="fx" data-lang="text">INSERT 0 4
UPDATE 1
  restaurant  |  slot  | rider 
--------------+--------+-------
 Biryani Bros | lunch  | Ravi
 Green Bowl   | dinner | Ravi
(2 rows)</div>
  <p>After one update Ravi works lunch at Biryani Bros and dinner at Green Bowl, breaking the rule that a rider has one slot. The table is in 3NF, because the column that depends on a non-key column (slot) is part of the key, which 3NF allows. <strong>Boyce–Codd normal form</strong> (BCNF) closes this gap with a stricter rule: for every dependency A → B in the table, A must be a candidate key. Here rider → slot breaks it, because rider is not a key. The fix is the usual one: give the determinant its own table.</p>
  <div class="fx" data-lang="sql">CREATE TABLE rider_slot (rider TEXT PRIMARY KEY, slot TEXT NOT NULL);
CREATE TABLE restaurant_riders (
  restaurant TEXT,
  rider TEXT REFERENCES rider_slot,
  PRIMARY KEY (restaurant, rider));
INSERT INTO rider_slot VALUES ('Ravi', 'lunch'), ('Sara', 'dinner'), ('Imran', 'lunch');
INSERT INTO restaurant_riders VALUES
  ('Biryani Bros', 'Ravi'), ('Green Bowl', 'Ravi'), ('Biryani Bros', 'Sara'), ('Dosa Hut', 'Imran');

SELECT rr.restaurant, rr.rider, rs.slot
FROM restaurant_riders rr JOIN rider_slot rs USING (rider)
ORDER BY rs.slot, rr.restaurant;</div>
  <div class="fx" data-lang="text">INSERT 0 3
INSERT 0 4
  restaurant  | rider |  slot  
--------------+-------+--------
 Biryani Bros | Sara  | dinner
 Biryani Bros | Ravi  | lunch
 Dosa Hut     | Imran | lunch
 Green Bowl   | Ravi  | lunch
(4 rows)</div>
  <p>"Ravi works lunch" is now a single row in <code>rider_slot</code>, and the join shows each restaurant's riders with their one slot. There is a price, though. The old rule "one rider per restaurant per slot" was enforced by the old primary key. Now restaurant and slot live in different tables, so no simple constraint can enforce it any more; it needs a trigger or a check in the application. This trade-off is why many designers stop at 3NF when going to BCNF would lose a constraint. 3NF and BCNF only differ in tables like this, where candidate keys overlap or a non-key column determines part of a key; for most tables, being in 3NF means being in BCNF.</p>
  <p>Two higher normal forms exist and occasionally come up in interviews. <strong>Fourth normal form</strong> (4NF) forbids storing two independent lists in one table: if a restaurant has 2 cuisines and 3 delivery zones, one table of (restaurant, cuisine, zone) needs 2 × 3 = 6 rows to say five facts, and the cure is two tables. <strong>Fifth normal form</strong> (5NF) deals with tables that can only be split losslessly into three or more pieces. Both are rare in practice. Normalising further than you need has a cost of its own: each split adds a join to every read and can move a rule out of reach of constraints, so aim for 3NF or BCNF and go further only when a real anomaly appears.</p>

  <h2 id="sm-denorm"><span class="num">08</span>Denormalisation</h2>
  <p>After normalising, every fact is stored once. The flip side is that every screen showing facts together has to join tables and add things up, on every page load, for every user. When reads vastly outnumber writes, it can be worth storing something twice on purpose. <strong>Denormalisation</strong> means deliberately adding redundancy, such as a copied column, a stored total, or a precomputed result, to make reads faster or simpler, while accepting the job of keeping the copies correct.</p>
  <p>Biteful already does this. <code>orders.amount</code> is the bill total, which could always be computed from the order's lines; it is stored because "show my orders with their totals" is the most common read in the app. Think of today's sales figure written on a whiteboard: instant to read, but someone has to update it after every sale or it lies. The query below first checks that every stored total matches its lines, then makes the classic mistake:</p>
  <div class="fx" data-lang="sql">-- orders.amount is a stored copy of "sum of this order's lines". Does it still agree?
SELECT o.order_id, o.amount, sum(oi.qty * oi.unit_price) AS from_lines
FROM orders o JOIN order_items oi USING (order_id)
GROUP BY o.order_id, o.amount
HAVING o.amount &lt;&gt; sum(oi.qty * oi.unit_price);

-- Support changes Asha's coffee from 1 cup to 3, and forgets the total
UPDATE order_items SET qty = 3 WHERE order_id = 110 AND item = 'Filter Coffee';

SELECT o.order_id, o.amount, sum(oi.qty * oi.unit_price) AS from_lines
FROM orders o JOIN order_items oi USING (order_id)
GROUP BY o.order_id, o.amount
HAVING o.amount &lt;&gt; sum(oi.qty * oi.unit_price);</div>
  <div class="fx" data-lang="text"> order_id | amount | from_lines 
----------+--------+------------
(0 rows)

UPDATE 1
 order_id | amount | from_lines 
----------+--------+------------
      110 | 310.00 |     450.00
(1 row)</div>
  <p>The first check returns no rows: all ten totals agree. Then a support agent changes Asha's coffee from 1 cup to 3 in <code>order_items</code> and nobody touches <code>orders.amount</code>. The second check finds the drift: the stored ₹310 says one thing and the lines (₹450) say another. The update anomaly from section 01 is back, this time by our own design. Every code path that writes order lines must now also update the total, either in the same transaction, in a trigger, or through a nightly check that flags differences.</p>
  <p>The larger form of the same idea is the <strong>materialised view</strong>: a query whose result PostgreSQL stores as a real table. The owners' dashboard shows revenue per restaurant from delivered orders; as a materialised view it reads three stored rows instead of joining and summing every time. The catch is that the stored result does not update itself:</p>
  <div class="fx" data-lang="sql">CREATE MATERIALIZED VIEW restaurant_revenue AS
SELECT r.name, sum(o.amount) AS revenue, count(*) AS orders
FROM restaurants r JOIN orders o ON o.restaurant_id = r.restaurant_id
WHERE o.status = 'delivered'
GROUP BY r.name;

INSERT INTO orders VALUES (111, 7, 11, '2026-03-09 13:00+05:30', 'delivered', 350, 30);
SELECT * FROM restaurant_revenue WHERE name = 'Biryani Bros';   -- stale

REFRESH MATERIALIZED VIEW restaurant_revenue;
SELECT * FROM restaurant_revenue WHERE name = 'Biryani Bros';   -- fresh</div>
  <div class="fx" data-lang="text">INSERT 0 1
     name     | revenue | orders 
--------------+---------+--------
 Biryani Bros | 1230.00 |      3
(1 row)

     name     | revenue | orders 
--------------+---------+--------
 Biryani Bros | 1580.00 |      4
(1 row)</div>
  <p>Before the new order, Biryani Bros had delivered orders 102, 106 and 109, totalling ₹1,230. After a new ₹350 order arrives, the view still says ₹1,230 from 3 orders, because it is a snapshot. Only after <code>REFRESH MATERIALIZED VIEW</code> does it show ₹1,580 from 4. That is the whole trade: fast reads in exchange for answers that may be out of date until the next refresh. A plain <code>VIEW</code> is the opposite: it stores only the query text and re-runs it each time, so it is never stale and never faster.</p>
  <p>So when should you denormalise? The honest answer is: after measuring. Start with a normalised schema, find the reads that are actually too slow (with <code>EXPLAIN ANALYZE</code> and proper indexes first, covered in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>), and copy data only where a real read needs it, with a clear owner for keeping the copy in step. Good candidates are read-heavy screens, expensive aggregates on dashboards, and analytics copies that are rebuilt in batches. The rule of thumb that ties this section together is <strong>normalise the source of truth; denormalise the copies built from it</strong>. The biggest such copy is the analytics warehouse, which has a shape of its own.</p>

  <h2 id="sm-star"><span class="num">09</span>OLTP, OLAP and the Star Schema</h2>
  <p>Two very different kinds of question hit Biteful's data. The app asks things like "show Asha's orders" or "place this order", thousands of times a second, each touching a handful of rows. An analyst asks "revenue by cuisine by day for the last three years", a few times a day, each touching every row. Here are both on the normalised tables:</p>
  <div class="fx" data-lang="sql">-- OLTP: one customer's recent orders (a few rows, found by key)
SELECT order_id, status, amount FROM orders WHERE customer_id = 1 ORDER BY ordered_at DESC;

-- OLAP: revenue by cuisine and day (every row of three tables)
SELECT r.cuisine, o.ordered_at::date AS day, sum(oi.qty * oi.unit_price) AS revenue
FROM orders o
JOIN restaurants r  USING (restaurant_id)
JOIN order_items oi USING (order_id)
WHERE o.status = 'delivered'
GROUP BY 1, 2 ORDER BY 2, 1;</div>
  <div class="fx" data-lang="text"> order_id |  status   | amount 
----------+-----------+--------
      110 | pending   | 310.00
      104 | delivered | 380.00
      101 | delivered | 240.00
(3 rows)

   cuisine    |    day     | revenue 
--------------+------------+---------
 Biryani      | 2026-03-02 |  450.00
 Pizza        | 2026-03-02 |  520.00
 South Indian | 2026-03-02 |  240.00
 Pizza        | 2026-03-03 |  380.00
 Biryani      | 2026-03-04 |  180.00
 Biryani      | 2026-03-05 |  600.00
 South Indian | 2026-03-05 |  260.00
(7 rows)</div>
  <p>The first query found three rows by customer id. The second had to read three tables and every delivered order line. The first kind of workload is called <strong>OLTP</strong> (online transaction processing): many small, concurrent reads and writes of current data, where correctness under concurrent writes matters most, so the data is normalised. The second is <strong>OLAP</strong> (online analytical processing): few, large read-only queries over history, where scan speed and simple queries matter most. A shop's till and its accountant's ledger are the everyday version: the till records each sale instantly and must never double-charge, while the ledger is copied from the till receipts at night and organised for questions like "which month was best?".</p>
  <table class="tbl">
    <tr><th></th><th>OLTP</th><th>OLAP</th></tr>
    <tr><td>Who asks</td><td>The app and its users</td><td>Analysts, dashboards, ML pipelines</td></tr>
    <tr><td>Typical query</td><td>Read or write a few rows by key</td><td>Scan and aggregate millions of rows</td></tr>
    <tr><td>Data</td><td>Current state, constant small writes</td><td>History, loaded in batches</td></tr>
    <tr><td>Shape</td><td>Normalised (3NF)</td><td>Denormalised star schema</td></tr>
    <tr><td>Typical engine</td><td>Row store: PostgreSQL, MySQL</td><td>Column store: BigQuery, Snowflake, Redshift, DuckDB</td></tr>
  </table>
  <p>Because running a three-year scan on the production database would compete with checkout for the same disks, memory and locks, companies keep the OLTP database as the source of truth and copy its data, nightly or continuously, into a separate <strong>data warehouse</strong> reshaped for analysis. The copying-and-reshaping process is called <strong>ETL</strong> (extract, transform, load), or ELT when the reshaping happens inside the warehouse.</p>
  <p>The standard warehouse shape is the <strong>star schema</strong>. In the middle sits one tall table of business events, the <strong>fact table</strong>, holding numbers to add up (called <strong>measures</strong>) and keys pointing outward. Around it sit small, wide <strong>dimension tables</strong> that describe the who, what, where and when that analysts filter and group by. Think of a till roll with one line per item sold, and next to it the lookup books: the product catalogue, the customer list, the calendar. Drawn out, the fact table is the centre of a star:</p>
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
  </svg><figcaption>Biteful's warehouse: a tall fact table in the middle, short wide dimensions around it. The dashed box is the extra table a snowflake schema would add.</figcaption></figure>
  <p>Building it from the normalised tables takes four statements. The date dimension is generated rather than copied: one row per calendar day with handy attributes like weekday, so analysts never have to compute them. The customer and restaurant dimensions are copies of the normalised tables. The fact table joins orders to their lines and keeps only keys and measures:</p>
  <div class="fx" data-lang="sql">CREATE TABLE dim_date AS
SELECT to_char(d, 'YYYYMMDD')::int AS date_key, d::date AS full_date,
       to_char(d, 'Dy') AS weekday, extract(isodow FROM d) IN (6, 7) AS is_weekend
FROM generate_series(date '2026-03-01', date '2026-03-31', interval '1 day') d;

CREATE TABLE dim_customer AS
SELECT customer_id AS customer_key, name, coalesce(city, 'Unknown') AS city FROM customers;

CREATE TABLE dim_restaurant AS
SELECT restaurant_id AS restaurant_key, name, city, cuisine FROM restaurants;

CREATE TABLE fact_order_lines AS                 -- grain: one order line
SELECT to_char(o.ordered_at, 'YYYYMMDD')::int AS date_key,
       o.customer_id AS customer_key, o.restaurant_id AS restaurant_key,
       o.order_id, oi.item, o.status,              -- labels with no dimension table
       oi.qty, oi.qty * oi.unit_price AS line_revenue   -- measures
FROM orders o JOIN order_items oi USING (order_id);

SELECT * FROM fact_order_lines ORDER BY order_id, item LIMIT 4;</div>
  <div class="fx" data-lang="text"> date_key | customer_key | restaurant_key | order_id |      item       |  status   | qty | line_revenue 
----------+--------------+----------------+----------+-----------------+-----------+-----+--------------
 20260302 |            1 |             10 |      101 | Masala Dosa     | delivered |   2 |       240.00
 20260302 |            2 |             11 |      102 | Chicken Biryani | delivered |   1 |       350.00
 20260302 |            2 |             11 |      102 | Raita           | delivered |   2 |       100.00
 20260302 |            3 |             12 |      103 | Farmhouse Pizza | delivered |   2 |       520.00
(4 rows)</div>
  <p>Each fact row is one order line: three keys pointing to dimensions, three labels (<code>order_id</code>, <code>item</code>, <code>status</code>) that need no table of their own, and two measures. Every warehouse question then has the same shape: start from the fact table, join the dimensions you need, filter, group. Here is delivered revenue by cuisine and weekday:</p>
  <div class="fx" data-lang="sql">SELECT r.cuisine, d.weekday, sum(f.line_revenue) AS revenue
FROM fact_order_lines f
JOIN dim_restaurant r USING (restaurant_key)
JOIN dim_date d       USING (date_key)
WHERE f.status = 'delivered'
GROUP BY r.cuisine, d.full_date, d.weekday
ORDER BY d.full_date, r.cuisine;</div>
  <div class="fx" data-lang="text">   cuisine    | weekday | revenue 
--------------+---------+---------
 Biryani      | Mon     |  450.00
 Pizza        | Mon     |  520.00
 South Indian | Mon     |  240.00
 Pizza        | Tue     |  380.00
 Biryani      | Wed     |  180.00
 Biryani      | Thu     |  600.00
 South Indian | Thu     |  260.00
(7 rows)</div>
  <p>Check one row by hand: on Monday 2 March, delivered Biryani lines were order 102's Chicken Biryani (350) and Raita (2 × 50), giving 450. Because every query looks like this, analysts learn the pattern once and reuse it for any question. Notice that the restaurant dimension repeats "Biryani" for every Biryani restaurant: dimensions are deliberately denormalised, because the warehouse is rebuilt by the load job rather than edited by users, so update anomalies barely matter there.</p>
  <p>A <strong>snowflake schema</strong> is the variant where dimensions are normalised further, so the star's points branch out like a snowflake. Moving cuisine into its own table, the same question needs one more join:</p>
  <div class="fx" data-lang="sql">-- Snowflake: cuisine moves out of the restaurant dimension into its own table
CREATE TABLE dim_cuisine AS
SELECT row_number() OVER (ORDER BY cuisine) AS cuisine_key, cuisine
FROM (SELECT DISTINCT cuisine FROM restaurants) c;

CREATE TABLE dim_restaurant_sf AS
SELECT r.restaurant_id AS restaurant_key, r.name, r.city, c.cuisine_key
FROM restaurants r JOIN dim_cuisine c USING (cuisine);

SELECT c.cuisine, sum(f.line_revenue) AS revenue
FROM fact_order_lines f
JOIN dim_restaurant_sf r USING (restaurant_key)   -- one extra hop:
JOIN dim_cuisine c       USING (cuisine_key)      -- fact → restaurant → cuisine
WHERE f.status = 'delivered'
GROUP BY c.cuisine ORDER BY revenue DESC;</div>
  <div class="fx" data-lang="text">   cuisine    | revenue 
--------------+---------
 Biryani      | 1230.00
 Pizza        |  900.00
 South Indian |  500.00
(3 rows)</div>
  <p>The answer is identical (Biryani 1,230 = 450 + 180 + 600 over the three days), but the query went fact → restaurant → cuisine instead of fact → restaurant. A snowflake saves a little storage and keeps shared lookup data in one place, at the cost of more joins in every query. Column-store warehouses compress repeated values very well, so the repetition in a star costs almost nothing, and the star is the usual default; a snowflake makes sense when a dimension is huge or shared by many fact tables.</p>
  <table class="tbl">
    <tr><th></th><th>Star</th><th>Snowflake</th></tr>
    <tr><td>Dimensions</td><td>Denormalised (cuisine repeated per restaurant)</td><td>Normalised (cuisine in its own table)</td></tr>
    <tr><td>Joins per query</td><td>Fewer</td><td>More</td></tr>
    <tr><td>Storage</td><td>A little more</td><td>A little less</td></tr>
    <tr><td>Usual choice</td><td>Default for warehouses and BI tools</td><td>Huge or shared dimensions</td></tr>
  </table>

  <h2 id="sm-facts"><span class="num">10</span>Facts, Dimensions and Grain</h2>
  <p>We built the fact table "at the line level" without spelling out what that commits us to. The exact meaning of one fact row is called the <strong>grain</strong>, and for <code>fact_order_lines</code> it is "one item line in one order". Every measure in a fact table must be true at that grain. To see why, suppose an analyst adds the order's bill <code>amount</code> to the line-level fact "for convenience", so it is copied onto every line of the order, and then sums it:</p>
  <div class="fx" data-lang="sql">SELECT (SELECT sum(amount) FROM orders)                                        AS bills_at_order_grain,
       (SELECT sum(o.amount) FROM orders o JOIN order_items oi USING (order_id)) AS bills_copied_onto_lines,
       (SELECT sum(qty * unit_price) FROM order_items)                         AS line_revenue_at_line_grain;</div>
  <div class="fx" data-lang="text"> bills_at_order_grain | bills_copied_onto_lines | line_revenue_at_line_grain 
----------------------+-------------------------+----------------------------
              3510.00 |                 5510.00 |                    3510.00
(1 row)</div>
  <p>The true total of all bills is ₹3,510. Copied onto lines, it becomes ₹5,510, because the five two-line orders (102, 104, 108, 109 and 110) have their bills counted twice: 3,510 + 450 + 380 + 260 + 600 + 310 = 5,510. The line-level measure <code>qty × unit_price</code> sums correctly to 3,510 because it really is a line-level number. A receipt makes this obvious: it has a line per item and one total at the bottom, and copying the total onto every line and then adding the lines would charge the customer several times. This is the same fan-out problem as in <a class="xref" data-note="sql_joins">JOINs</a>. The cure is to keep each grain in its own fact table: order-level numbers such as bills and delivery fees belong in a <code>fact_orders</code> table with one row per order.</p>
  <p>The usual design order for a fact table follows from this: choose the business process (orders), declare the grain (one order line), choose the dimensions that describe it (date, customer, restaurant), and only then choose the measures that are true at that grain. Measures themselves come in three kinds. An <strong>additive</strong> measure can be summed across every dimension, like <code>qty</code> or <code>line_revenue</code>. A <strong>semi-additive</strong> measure can be summed across some dimensions but not across time; balances and stock levels are the classic case. A <strong>non-additive</strong> measure, such as a ratio or an average, cannot be summed at all and must be recomputed from additive parts (average order value = total revenue ÷ number of orders, never an average of averages). The semi-additive case is the one people get wrong, so here it is on a daily wallet-balance fact:</p>
  <div class="fx" data-lang="sql">-- A daily snapshot: each customer's wallet balance at the end of each day
CREATE TABLE fact_wallet_daily (day date, customer text, balance numeric);
INSERT INTO fact_wallet_daily VALUES
  ('2026-03-01', 'Ben', 500), ('2026-03-01', 'Farah', 300),
  ('2026-03-02', 'Ben', 500), ('2026-03-02', 'Farah', 300);

SELECT day, sum(balance) AS money_in_wallets          -- across customers: fine
FROM fact_wallet_daily GROUP BY day ORDER BY day;

SELECT customer, sum(balance) AS meaningless_sum,      -- across days: nonsense
       round(avg(balance), 2) AS avg_daily_balance
FROM fact_wallet_daily GROUP BY customer ORDER BY customer;</div>
  <div class="fx" data-lang="text">INSERT 0 4
    day     | money_in_wallets 
------------+------------------
 2026-03-01 |              800
 2026-03-02 |              800
(2 rows)

 customer | meaningless_sum | avg_daily_balance 
----------+-----------------+-------------------
 Ben      |            1000 |            500.00
 Farah    |             600 |            300.00
(2 rows)</div>
  <p>Adding across customers on one day is meaningful: ₹800 sat in wallets on each day. Adding across days is not: Ben never had ₹1,000, he had ₹500 on each of two days. Across time, use the average, the first or the last value instead. Two more vocabulary words complete the picture. Labels like <code>order_id</code>, <code>item</code> and <code>status</code> that live in the fact table with no dimension table of their own are called <strong>degenerate dimensions</strong>. And one dimension used in two roles, such as a location table used for both pickup and drop-off, or a date table used for both order date and delivery date, is a <strong>role-playing dimension</strong>.</p>

  <h2 id="sm-scd"><span class="num">11</span>Slowly Changing Dimensions</h2>
  <p>Dimensions describe the world, and the world changes. Ben lived in Mumbai when he placed order 102 (₹450) on 2 March, moved to Pune on 3 March, and placed order 106 (₹180) on 4 March. A report of revenue by customer city should count 102 under Mumbai and 106 under Pune, because that is where each sale happened. A dimension whose attributes change now and then is called a <strong>slowly changing dimension</strong> (SCD), and there are standard, numbered ways to handle it.</p>
  <p>The simplest, <strong>Type 1</strong>, overwrites the old value:</p>
  <div class="fx" data-lang="sql">CREATE TABLE dim_customer AS
SELECT customer_id AS customer_key, name, coalesce(city, 'Unknown') AS city FROM customers;

-- Type 1: Ben moved to Pune on 3 March, so overwrite his city
UPDATE dim_customer SET city = 'Pune' WHERE name = 'Ben';

SELECT d.city, sum(o.amount) AS revenue, string_agg(o.order_id::text, ', ' ORDER BY o.order_id) AS orders
FROM orders o JOIN dim_customer d ON d.customer_key = o.customer_id
WHERE o.status = 'delivered'
GROUP BY d.city ORDER BY d.city;</div>
  <div class="fx" data-lang="text">UPDATE 1
  city  | revenue |            orders            
--------+---------+------------------------------
 Mumbai |  600.00 | 109
 Pune   | 2030.00 | 101, 102, 103, 104, 106, 108
(2 rows)</div>
  <p>Both of Ben's orders now count under Pune, so ₹450 moved to a city Ben did not live in at the time. Worse, last week's "revenue by city" report would now give a different answer for the same past dates. Type 1 is right for <em>corrections</em>, such as fixing a typo in a name, where the old value was simply wrong. It is wrong whenever history matters.</p>
  <p><strong>Type 2</strong> never overwrites. Instead it closes the current row with an end date and inserts a new row for the new value. Each version gets its own surrogate key and a validity interval. Think of a passport: Type 1 is correcting it with white-out, while Type 2 is issuing a new passport and keeping the old one stamped "valid until".</p>
  <div class="fx" data-lang="sql">CREATE TABLE dim_customer_scd (
  customer_key SERIAL PRIMARY KEY,     -- one key per VERSION of a customer
  customer_id  INT,                    -- the business id, repeats across versions
  name TEXT, city TEXT,
  valid_from DATE, valid_to DATE, is_current BOOLEAN);

INSERT INTO dim_customer_scd (customer_id, name, city, valid_from, valid_to, is_current)
SELECT customer_id, name, coalesce(city, 'Unknown'), signup_date, '9999-12-31', true
FROM customers ORDER BY customer_id;

-- Ben moves: close his current row, then add a new version
UPDATE dim_customer_scd SET valid_to = '2026-03-02', is_current = false
WHERE customer_id = 2 AND is_current;
INSERT INTO dim_customer_scd (customer_id, name, city, valid_from, valid_to, is_current)
VALUES (2, 'Ben', 'Pune', '2026-03-03', '9999-12-31', true);

SELECT * FROM dim_customer_scd WHERE customer_id = 2 ORDER BY customer_key;</div>
  <div class="fx" data-lang="text">INSERT 0 7
UPDATE 1
INSERT 0 1
 customer_key | customer_id | name |  city  | valid_from |  valid_to  | is_current 
--------------+-------------+------+--------+------------+------------+------------
            2 |           2 | Ben  | Mumbai | 2026-01-12 | 2026-03-02 | f
            8 |           2 | Ben  | Pune   | 2026-03-03 | 9999-12-31 | t
(2 rows)</div>
  <p>Key 2 is "Ben in Mumbai", valid from his signup until 2 March; key 8 is "Ben in Pune", valid from 3 March with no end yet (9999-12-31 is the usual stand-in for "still current"). The <code>is_current</code> flag makes "as of now" queries easy. To report history correctly, each order must meet the version that was valid on the order's date, so the join includes the date range:</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <rect x="20" y="44" width="300" height="32" class="fb sb"/><text x="170" y="65" text-anchor="middle">key 2 · Ben · Mumbai · is_current f</text>
    <rect x="322" y="44" width="268" height="32" class="fg sg"/><text x="456" y="65" text-anchor="middle">key 8 · Ben · Pune · is_current t</text>
    <g font-size="10" class="tm"><text x="20" y="96">2026-01-12</text><text x="320" y="96" text-anchor="end">03-02</text><text x="324" y="96">03-03</text><text x="590" y="96" text-anchor="end">9999-12-31</text></g>
    <circle cx="300" cy="28" r="5" class="tb"/><text x="292" y="18" text-anchor="end" font-size="11">order 102 (03-02) → Mumbai</text>
    <circle cx="350" cy="28" r="5" class="tg"/><text x="358" y="18" font-size="11">order 106 (03-04) → Pune</text>
    <line x1="300" y1="33" x2="300" y2="44" stroke="currentColor"/><line x1="350" y1="33" x2="350" y2="44" stroke="currentColor"/>
  </svg><figcaption>SCD Type 2: Ben's two versions tile the timeline without overlapping, and each order lands in the version valid on its date.</figcaption></figure>
  <p>In the figure, the two version rows sit end to end on the timeline. Order 102 falls inside the Mumbai interval and order 106 inside the Pune interval, so a join on "same customer and order date between valid_from and valid_to" finds exactly one version for each order:</p>
  <div class="fx" data-lang="sql">SELECT d.city, sum(o.amount) AS revenue, string_agg(o.order_id::text, ', ' ORDER BY o.order_id) AS orders
FROM orders o
JOIN dim_customer_scd d
  ON d.customer_id = o.customer_id
 AND o.ordered_at::date BETWEEN d.valid_from AND d.valid_to   -- the version valid that day
WHERE o.status = 'delivered'
GROUP BY d.city ORDER BY d.city;</div>
  <div class="fx" data-lang="text">  city  | revenue |         orders          
--------+---------+-------------------------
 Mumbai | 1050.00 | 102, 109
 Pune   | 1580.00 | 101, 103, 104, 106, 108
(2 rows)</div>
  <p>Now order 102 stays in Mumbai (₹450 + Farah's ₹600 = ₹1,050) and order 106 counts for Pune. In practice the load job usually looks up the right version once, when the fact row is loaded, and stores that version's <code>customer_key</code> in the fact table, so reports can join on the key alone. A third approach, <strong>Type 3</strong>, adds a <code>previous_city</code> column next to <code>city</code>; it keeps exactly one step of history and suits "before vs after" comparisons only.</p>
  <table class="tbl">
    <tr><th>Type</th><th>What you do</th><th>History kept</th><th>Use when</th></tr>
    <tr><td>1</td><td>Overwrite the value</td><td>None</td><td>Corrections; history irrelevant</td></tr>
    <tr><td>2</td><td>Close the old row, insert a new version with valid_from / valid_to / is_current</td><td>Full</td><td>Reports must reflect the value at the time</td></tr>
    <tr><td>3</td><td>Add a previous-value column</td><td>One step</td><td>Only "before vs after" comparisons</td></tr>
  </table>

  <h2 id="sm-conv"><span class="num">12</span>JSONB and Practical Conventions</h2>
  <p>Normal forms and star schemas both assume every row has the same columns. Real data is not always so tidy. Biteful restaurants have attributes that vary by type: Dosa Hut is veg-only with 20 seats, Biryani Bros is halal with no seating, Green Bowl has vegan options. Fifty mostly empty columns would be clumsy, and a separate attributes table means a join on every menu page. PostgreSQL offers a middle path: the <strong>JSONB</strong> column type, which stores a JSON document (<code>{"key": value}</code>) in a binary form, so each row can hold different keys. The operator <code>-&gt;&gt;</code> extracts a key as text, and <code>@&gt;</code> tests whether a document contains another:</p>
  <div class="fx" data-lang="sql">ALTER TABLE restaurants ADD COLUMN attrs JSONB;
UPDATE restaurants SET attrs = '{"veg_only": true, "seats": 20}'     WHERE name = 'Dosa Hut';
UPDATE restaurants SET attrs = '{"halal": true}'                     WHERE name = 'Biryani Bros';
UPDATE restaurants SET attrs = '{"vegan_options": true, "seats": 8}' WHERE name = 'Green Bowl';

SELECT name, attrs -&gt;&gt; 'seats' AS seats, attrs -&gt;&gt; 'halal' AS halal
FROM restaurants WHERE attrs IS NOT NULL ORDER BY name;

SELECT name FROM restaurants WHERE attrs @&gt; '{"veg_only": true}';</div>
  <div class="fx" data-lang="text">UPDATE 1
UPDATE 1
UPDATE 1
     name     | seats | halal 
--------------+-------+-------
 Biryani Bros | NULL  | true
 Dosa Hut     | 20    | NULL
 Green Bowl   | 8     | NULL
(3 rows)

   name   
----------
 Dosa Hut
(1 row)</div>
  <p>Each restaurant carries only the keys that apply to it, and missing keys simply come back as NULL. The containment test found the veg-only restaurant, and it can be made fast with a GIN index. Think of a paper form with fixed boxes for name and city plus a "notes" box for anything else: the notes box is perfect for extras, and terrible if the important fields end up in it. The same goes for JSONB. It suits sparse, varying attributes and raw event or API payloads stored as received. It does not suit anything you filter, join or group on often, or anything that needs a type, NOT NULL, a foreign key or a CHECK, because JSONB gives up all of those guarantees. The schema still exists, just hidden in application code where nobody checks it, so one row ends up with <code>"seats": "20"</code> and another with <code>"seats": 20</code>. Once you query a key regularly, promote it to a real column. (Document databases make this flexible style their default; see <a class="xref" data-note="mongo_design">MongoDB Schema Design</a>.)</p>
  <p>Beyond deciding which tables exist, teams agree on a handful of conventions, each of which prevents a bug someone has already had. Names are lower <code>snake_case</code>, foreign keys are named after their target (<code>customer_id</code>), booleans start with <code>is_</code> or <code>has_</code>, and reserved words like <code>user</code> and <code>order</code> are avoided as names. Primary keys are surrogate keys (<code>bigint GENERATED ALWAYS AS IDENTITY</code>, or a UUID when ids are created on many machines), while real-world identifiers such as email or phone, called <strong>natural keys</strong>, are kept as UNIQUE columns, because natural keys change and every foreign key pointing at them would have to change too. Every table gets <code>created_at</code> and <code>updated_at</code> timestamps. And many tables use a <strong>soft delete</strong>: instead of <code>DELETE</code>, set a <code>deleted_at</code> timestamp, so history survives and mistakes can be undone, like a recycle bin that keeps files until someone empties it. Here are all four in one table for restaurant reviews, with a partial unique index so a customer can have at most one <em>live</em> review per restaurant:</p>
  <div class="fx" data-lang="sql">CREATE TABLE reviews (
  review_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- surrogate key
  customer_id   INT NOT NULL REFERENCES customers,
  restaurant_id INT NOT NULL REFERENCES restaurants,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),                -- audit columns
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ                                        -- NULL = live (soft delete)
);
-- at most one LIVE review per customer per restaurant
CREATE UNIQUE INDEX reviews_one_live ON reviews (customer_id, restaurant_id) WHERE deleted_at IS NULL;

INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (1, 10, 5);
INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (1, 10, 4);   -- second live review
UPDATE reviews SET deleted_at = now() WHERE customer_id = 1 AND restaurant_id = 10;
INSERT INTO reviews (customer_id, restaurant_id, rating) VALUES (1, 10, 4);   -- allowed now

SELECT review_id, rating, deleted_at IS NULL AS live FROM reviews ORDER BY review_id;</div>
  <div class="fx" data-lang="text">INSERT 0 1
ERROR:  duplicate key value violates unique constraint "reviews_one_live"
DETAIL:  Key (customer_id, restaurant_id)=(1, 10) already exists.
UPDATE 1
INSERT 0 1
 review_id | rating | live 
-----------+--------+------
         1 |      5 | f
         3 |      4 | t
(2 rows)</div>
  <p>Read the output line by line. Asha's first review is accepted. Her second live review of the same restaurant is refused by the partial unique index. After her first review is soft-deleted, a new one is allowed, and the old row is still there for history (<code>live = f</code>). Review id 2 was used up by the refused insert: identity values are never reused, so gaps in ids are normal and harmless. Two cautions go with these conventions: <code>updated_at</code> does not update itself (set it in a trigger or in the application), and every query must remember to skip soft-deleted rows, which the next section shows going wrong.</p>

  <h2 id="sm-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most common modeling mistake is storing a list in one column, which breaks first normal form in a way that looks harmless. Suppose restaurants get a <code>tags</code> column holding comma-separated text, and someone looks for vegetarian places:</p>
  <div class="fx" data-lang="sql">-- Tags stored as one comma-separated string
ALTER TABLE restaurants ADD COLUMN tags TEXT;
UPDATE restaurants SET tags = 'veg'             WHERE name IN ('Dosa Hut', 'Green Bowl');
UPDATE restaurants SET tags = 'non-veg,halal'   WHERE name = 'Biryani Bros';
UPDATE restaurants SET tags = 'veg,non-veg'     WHERE name = 'Pizza Point';

SELECT name, tags FROM restaurants WHERE tags LIKE '%veg%' ORDER BY name;   -- "vegetarian places"</div>
  <div class="fx" data-lang="text">UPDATE 2
UPDATE 1
UPDATE 1
     name     |     tags      
--------------+---------------
 Biryani Bros | non-veg,halal
 Dosa Hut     | veg
 Green Bowl   | veg
 Pizza Point  | veg,non-veg
(4 rows)</div>
  <p>All four tagged restaurants match, because <code>'non-veg'</code> contains the letters "veg". The search cannot tell one tag from part of another, the database cannot check spelling, and no foreign key can point at a single tag. The fix is a <code>restaurant_tags(restaurant_id, tag)</code> table with one row per tag, after which <code>WHERE tag = 'veg'</code> is exact.</p>
  <p>A second classic mistake belongs to warehouses: joining a Type 2 dimension on the business id alone. Every version of the customer matches, so each fact row is duplicated once per version:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, d.customer_key, d.city
FROM orders o JOIN dim_customer_scd d ON d.customer_id = o.customer_id   -- id only: wrong
WHERE o.customer_id = 2 ORDER BY o.order_id, d.customer_key;</div>
  <div class="fx" data-lang="text"> order_id | customer_key |  city  
----------+--------------+--------
      102 |            2 | Mumbai
      102 |            8 | Pune
      106 |            2 | Mumbai
      106 |            8 | Pune
(4 rows)</div>
  <p>Ben has two orders and two versions, so the join returns four rows, and each order appears in both cities. Every revenue total over this join double-counts Ben. Join on the business id plus the date range (as in section 11), on the version key stored in the fact, or on <code>is_current</code> when you want "as of now".</p>
  <p>A third mistake comes with soft deletes. Every query must filter out deleted rows, and forgetting it once brings them back:</p>
  <div class="fx" data-lang="sql">-- Dosa Hut's reviews: Ben's 1-star review was soft-deleted as spam
CREATE VIEW live_reviews AS SELECT * FROM reviews WHERE deleted_at IS NULL;

SELECT round(avg(rating), 2) AS forgot_the_filter FROM reviews      WHERE restaurant_id = 10;
SELECT round(avg(rating), 2) AS via_the_view      FROM live_reviews WHERE restaurant_id = 10;</div>
  <div class="fx" data-lang="text"> forgot_the_filter 
-------------------
              3.33
(1 row)

 via_the_view 
--------------
         4.50
(1 row)</div>
  <p>Ben's 1-star review was soft-deleted as spam, but the query on the raw table still counts it and reports 3.33 instead of 4.50. The safe habit is to query through a view such as <code>live_reviews</code> that applies the filter once, and to let only maintenance code touch the base table.</p>
  <p>A few design mistakes need no code to recognise. Mixing grains in one fact table (an order-level bill on line-level rows) silently inflates every sum, as section 10 showed with ₹5,510 instead of ₹3,510. Using a natural key such as a name or email as the primary key breaks when it changes, because every foreign key pointing at it must change too. Denormalising before measuring adds copies that must be kept in sync without any proven benefit. And running heavy analytics directly on the production OLTP database slows down the app; use a read replica or a warehouse.</p>

  <h2 id="sm-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why model</h3>
  <ul>
    <li>A single wide table stores each fact many times, so copies can disagree.</li>
    <li><b>Update anomaly</b>: one fact in many rows, changed in only some (Ben in two cities).</li>
    <li><b>Insert anomaly</b>: a fact cannot be stored without an unrelated one (Gita with no orders).</li>
    <li><b>Delete anomaly</b>: deleting one fact deletes another (order 105 took Dia and Green Bowl).</li>
  </ul>
  <h3>Keys and relationships</h3>
  <ul>
    <li><b>Functional dependency A → B</b>: rows equal on A are equal on B; A is the <b>determinant</b>.</li>
    <li><b>Candidate key</b>: minimal columns deciding all others; <b>primary key</b>: the chosen one; <b>composite key</b>: more than one column.</li>
    <li><b>Foreign key</b>: a column holding another table's key.</li>
    <li><b>Surrogate key</b>: generated id with no meaning; <b>natural key</b>: real-world identifier (keep it UNIQUE).</li>
    <li>1:N → FK on the many side; M:N → junction table; 1:1 → FK + UNIQUE; self-reference → FK to the same table.</li>
  </ul>
  <h3>Normal forms</h3>
  <table class="tbl">
    <tr><th>Form</th><th>Rule</th><th>Breaks when</th><th>Biteful example</th></tr>
    <tr><td>1NF</td><td>atomic cells, no repeating groups, a key</td><td>lists in a cell, item1/item2 columns</td><td>"Masala Dosa x2, Filter Coffee x1"</td></tr>
    <tr><td>2NF</td><td>1NF + no partial dependency on a composite key</td><td>column depends on part of the key</td><td>status depends on order_id only</td></tr>
    <tr><td>3NF</td><td>2NF + no transitive dependency</td><td>non-key → non-key</td><td>order_id → customer → city</td></tr>
    <tr><td>BCNF</td><td>every determinant is a candidate key</td><td>non-key column decides part of the key</td><td>rider → slot</td></tr>
    <tr><td>4NF</td><td>no independent multi-valued facts in one table</td><td>cuisines × zones in one table</td><td>2 × 3 = 6 rows</td></tr>
  </table>
  <p>Memory aid: every non-key column depends on the key, the whole key, and nothing but the key. Check every split is <b>lossless</b> (rejoin, EXCEPT both ways).</p>
  <h3>Denormalisation and analytics</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Denormalisation</td><td>deliberate redundancy for faster reads; must be kept in sync</td></tr>
    <tr><td>Materialised view</td><td>stored query result; stale until <code>REFRESH</code></td></tr>
    <tr><td>OLTP / OLAP</td><td>many small writes of current data, normalised / big reads over history, star schema</td></tr>
    <tr><td>Star / snowflake</td><td>fact + denormalised dimensions / dimensions normalised into sub-tables</td></tr>
    <tr><td>Grain</td><td>exact meaning of one fact row; declare it first</td></tr>
    <tr><td>Additive / semi / non-additive</td><td>sum anywhere / not across time / recompute from parts</td></tr>
    <tr><td>Degenerate / role-playing dimension</td><td>label stored in the fact / one dimension used in two roles</td></tr>
    <tr><td>SCD Type 1 / 2 / 3</td><td>overwrite / new version row with valid_from, valid_to / previous-value column</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="sql">-- Check a dependency A → B (0 = holds)
SELECT count(*) FROM (SELECT a FROM t GROUP BY a HAVING count(DISTINCT b) &gt; 1) x;

-- Materialised view
CREATE MATERIALIZED VIEW mv AS SELECT ...;
REFRESH MATERIALIZED VIEW mv;

-- SCD Type 2 join
JOIN dim d ON d.business_id = f.business_id
          AND f.event_date BETWEEN d.valid_from AND d.valid_to

-- Soft delete + one live row per pair
CREATE UNIQUE INDEX one_live ON reviews (customer_id, restaurant_id) WHERE deleted_at IS NULL;

-- JSONB
SELECT attrs -&gt;&gt; 'seats' FROM restaurants WHERE attrs @&gt; '{"veg_only": true}';</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Normalise the source of truth; denormalise the copies built from it.</li>
    <li>Lists in a cell: <code>LIKE '%veg%'</code> matches "non-veg".</li>
    <li>Never mix grains in one fact table (₹5,510 instead of ₹3,510).</li>
    <li>Don't sum semi-additive measures (balances) across time.</li>
    <li>Join SCD Type 2 on the date range or version key, never the business id alone.</li>
    <li>Soft deletes need a filter in every query; use a view.</li>
    <li>BCNF can cost a constraint; 3NF is the usual target.</li>
  </ul>

  <h2 id="sm-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is normalisation, and why do we do it?</summary><div class="qa-body">Normalisation is organising tables so that each fact is stored in exactly one place, by splitting tables along their functional dependencies. We do it to prevent update, insert and delete anomalies, where copies of a fact disagree, a fact cannot be stored, or deleting one fact deletes another. It also makes constraints like foreign keys meaningful, because each thing has one row to point at.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the three anomalies of an unnormalised table, with an example of each.</summary><div class="qa-body">Update anomaly: Ben's city is stored on three rows, and changing one leaves him in two cities. Insert anomaly: a new customer with no orders cannot be stored in a table whose rows are order lines. Delete anomaly: deleting Dia's only order also deletes the only record that Dia exists.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a functional dependency?</summary><div class="qa-body">A → B means that rows with the same value of A always have the same value of B: knowing A tells you B. For example restaurant → cuisine. Dependencies decide which columns belong together, and a key is a set of columns that determines every other column.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain 1NF, 2NF and 3NF.</summary><div class="qa-body">1NF: every cell holds one atomic value, with no lists or repeating column groups. 2NF: 1NF, and every non-key column depends on the whole of a composite key, not just part of it. 3NF: 2NF, and no non-key column depends on the key through another non-key column. The short version: "the key, the whole key, and nothing but the key".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>enrolments(student_id, course_id, student_name, course_title, grade)</code> with key (student_id, course_id). Which normal form does it break, and how do you fix it?</summary><div class="qa-body">It breaks 2NF: student_name depends only on student_id and course_title only on course_id, which are parts of the key. Split it into <code>students(student_id, student_name)</code>, <code>courses(course_id, course_title)</code> and <code>enrolments(student_id, course_id, grade)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between 3NF and BCNF?</summary><div class="qa-body">3NF allows a dependency A → B when B is part of a candidate key; BCNF requires the determinant of every dependency to be a candidate key. They differ only when a non-key column determines part of a key, as in rider_shifts(restaurant, slot, rider) with rider → slot. Reaching BCNF there can lose the ability to enforce a rule with a simple constraint, which is why 3NF is often the practical target.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Primary key vs candidate key vs foreign key vs surrogate key?</summary><div class="qa-body">A candidate key is any minimal set of columns that uniquely identifies a row; a table can have several. The primary key is the candidate key chosen as the main identifier (unique, not null). A foreign key is a column that stores another table's key, enforcing that the referenced row exists. A surrogate key is a generated identifier with no business meaning, often used as the primary key because natural identifiers can change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you model a many-to-many relationship?</summary><div class="qa-body">With a junction table that holds the two foreign keys, one row per pair, usually with a composite primary key on both columns to prevent duplicates. Students and courses become <code>enrolments(student_id, course_id)</code>. The junction table can carry facts about the pair itself, like a grade, just as Biteful's orders table links customers and restaurants and carries the order's time and bill.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is denormalisation, and when is it justified?</summary><div class="qa-body">Denormalisation is deliberately storing data redundantly (a copied column, a stored total, a materialised view) to make reads faster or simpler. It is justified when a measured, frequent read is too slow even with good indexes, and someone owns keeping the copy in sync. The cost is drift: a stored order total that no longer matches its lines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>View vs materialised view?</summary><div class="qa-body">A view stores only the query text and runs it every time, so it is always current but no faster than the query. A materialised view stores the result as a table, so reads are fast, but it is stale until <code>REFRESH MATERIALIZED VIEW</code> runs. Use a materialised view for expensive aggregates where slightly old data is acceptable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>OLTP vs OLAP?</summary><div class="qa-body">OLTP serves applications: many small, concurrent reads and writes of current data, normalised for correctness, usually on a row store like PostgreSQL. OLAP serves analysis: few large read-only scans over history, denormalised into star schemas, usually on a column store like BigQuery or Snowflake. Data is copied from OLTP to OLAP by ETL/ELT pipelines.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Star schema vs snowflake schema?</summary><div class="qa-body">Both have a central fact table with foreign keys to dimensions. In a star, dimensions are denormalised (cuisine stored on each restaurant row), so queries need fewer joins. In a snowflake, dimensions are normalised into sub-tables (a separate cuisine table), saving some storage at the cost of extra joins. Star is the usual default because column stores compress repetition well.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the grain of a fact table, and what happens if you ignore it?</summary><div class="qa-body">The grain is the exact meaning of one fact row, such as "one item line of one order". Every measure must be true at that grain. Putting an order-level number on line-level rows makes sums double-count, as Biteful's bills summed to 5,510 instead of 3,510. Different grains go in different fact tables.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Additive, semi-additive and non-additive measures?</summary><div class="qa-body">Additive measures, like quantity or revenue, can be summed across every dimension. Semi-additive measures, like account balances, can be summed across customers but not across time; use an average or the last value over time. Non-additive measures, like ratios and averages, must be recomputed from additive parts rather than summed or averaged again.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a slowly changing dimension? Compare Type 1 and Type 2.</summary><div class="qa-body">A dimension whose attributes change occasionally, like a customer's city. Type 1 overwrites the value, so history is rewritten: old sales move to the new city. Type 2 closes the old row and inserts a new version with its own surrogate key and valid_from / valid_to dates, so each fact can join to the version valid at its time. Type 1 suits corrections; Type 2 suits anything reported historically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use a JSONB column instead of regular columns?</summary><div class="qa-body">For sparse attributes that vary between rows, like restaurant features, or for raw event payloads stored as received. Avoid it for fields you filter, join or group on often, or that need types, NOT NULL, foreign keys or CHECK constraints. Promote a JSON key to a real column once it is queried regularly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Soft delete vs hard delete?</summary><div class="qa-body">A soft delete sets a <code>deleted_at</code> timestamp instead of removing the row, keeping history and allowing undo; but every query must filter it out and uniqueness needs partial indexes. A hard delete is simpler and is required for legal erasure requests, but the data is gone unless archived elsewhere.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design a schema for a library: books, copies, members and loans.</summary><div class="qa-body"><code>books(book_id, isbn UNIQUE, title)</code>, <code>authors(author_id, name)</code>, <code>book_authors(book_id, author_id)</code> for the M:N, <code>copies(copy_id, book_id FK)</code>, <code>members(member_id, email UNIQUE)</code>, and <code>loans(loan_id, copy_id FK, member_id FK, borrowed_at, due_at, returned_at NULL)</code>. A partial unique index on <code>loans(copy_id) WHERE returned_at IS NULL</code> stops one copy being lent twice at once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the analytics model for a ride-hailing app.</summary><div class="qa-body">A <code>fact_trips</code> table with grain one trip, measures fare, distance, duration and tip, and keys to dimensions: rider, driver (Type 2 for city or vehicle changes), date, time of day, and location used twice as a role-playing dimension for pickup and drop-off. Trip status can be a degenerate dimension. Wallet balances, if needed, go in a separate daily snapshot fact because they are semi-additive.</div></details>
</main>
`
});
