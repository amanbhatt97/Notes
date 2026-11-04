// notes/databases/mongo_basics.js — Documents & CRUD
Object.assign(TOPIC_CONTENT, {
  "mongo_basics": `<main>
  <h1>Documents &amp; CRUD</h1>
  <div class="where"><span>Databases</span><span>MongoDB</span><span>Documents &amp; CRUD</span></div>
  <p class="lead">MongoDB is a database that stores each record as a <strong>document</strong>: a nested, JSON-like object that can hold lists and smaller objects inside it, instead of a flat row in a table. That matters in real work because a lot of application data is naturally nested (an order with its lines, a product with its variants, a user with their settings), and storing it as one document means the app can read or change it in one step, without joins. This note teaches the document model and the four basic operations on it, Create, Read, Update and Delete (<strong>CRUD</strong>), starting from zero. The running example is Biteful, the small food-delivery company from the SQL notes, with the same 7 customers, 5 restaurants and 10 orders, so you can compare every MongoDB idea with the SQL you already know. The MongoDB commands are written in <strong>mongosh</strong> (the MongoDB shell) syntax; their outputs were produced by running the equivalent Python (pymongo) code against <strong>mongomock</strong>, an in-memory stand-in for a MongoDB server, and printed in mongosh style. The SQL comparisons ran on a real PostgreSQL 16 database.</p>

  <h2 id="mb-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Documents &amp; CRUD</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The document model</div>
        <ul>
          <li>One order = one document, lines and options inside it</li>
          <li><b>BSON</b>: typed binary JSON (real dates, exact decimals)</li>
          <li><b>_id</b>: required, unique, indexed; ObjectId if you omit it</li>
          <li><b>Collection</b> ≈ table, created on first write; shapes may differ</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reading</div>
        <ul>
          <li><code>find(filter, projection)</code>; side-by-side conditions = AND</li>
          <li><code>{ f: null }</code> matches null <em>and</em> missing</li>
          <li><code>"items.item"</code> = any element; <code>$elemMatch</code> = same element</li>
          <li><code>sort → skip → limit</code>; add <code>_id</code> to break ties</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Writing</div>
        <ul>
          <li><code>insertOne/Many</code>; duplicate <code>_id</code> → E11000</li>
          <li><code>$set $inc $push $pull $addToSet</code>, positional <code>$</code></li>
          <li>One document's write is atomic; no operator = replacement</li>
          <li>Upsert = update or insert; delete never cascades</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In practice</div>
        <ul>
          <li>Shape documents around the queries you run</li>
          <li>pymongo: same filters as Python dicts</li>
          <li><code>json_normalize</code> flattens lines back into rows</li>
          <li>An ObjectId never equals its string</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Documents Exist</span><span class="rm-sub">one order spread over four tables</span></div></div>
      <div class="rm-item rm-done" data-target="mb-doc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">BSON and _id</span><span class="rm-sub">how a document is typed and identified</span></div></div>
      <div class="rm-item rm-done" data-target="mb-coll"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Collections and the SQL Vocabulary</span><span class="rm-sub">where documents live, and what maps to what</span></div></div>
      <div class="rm-item rm-done" data-target="mb-insert"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Inserting Documents</span><span class="rm-sub">loading Biteful, duplicate keys, batches</span></div></div>
      <div class="rm-item rm-done" data-target="mb-find"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Finding Documents</span><span class="rm-sub">filters, operators, null vs missing, projections</span></div></div>
      <div class="rm-item rm-done" data-target="mb-arrays"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Querying Inside Arrays</span><span class="rm-sub">dot notation and $elemMatch</span></div></div>
      <div class="rm-item rm-done" data-target="mb-sort"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sorting, Limiting and Paging</span><span class="rm-sub">top-N, ties, keyset pages, cursors</span></div></div>
      <div class="rm-item rm-done" data-target="mb-update"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Updating Documents</span><span class="rm-sub">update operators and atomic writes</span></div></div>
      <div class="rm-item rm-done" data-target="mb-upsert"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Upserts</span><span class="rm-sub">update it, or create it if missing</span></div></div>
      <div class="rm-item rm-done" data-target="mb-delete"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Deleting Documents</span><span class="rm-sub">no foreign keys, so orphans stay</span></div></div>
      <div class="rm-item rm-done" data-target="mb-py"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">MongoDB from Python</span><span class="rm-sub">pymongo, pandas and ObjectIds</span></div></div>
      <div class="rm-item rm-done" data-target="mb-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the ones that fail silently</span></div></div>
      <div class="rm-item rm-done" data-target="mb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">terms, operators, syntax, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="mb-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about documents and CRUD</span></div></div>
    </div>
  </div>

  <h2 id="mb-why"><span class="num">01</span>Why Documents Exist</h2>
  <p>In the SQL notes, Biteful's data lives in four linked tables: <code>customers</code>, <code>restaurants</code>, <code>orders</code> and <code>order_items</code>. The quirks of that data will matter all through this note, so here they are once: Esha has no city, Gita has never ordered, Momo Magic has no rating, orders 105 and 107 were cancelled and 110 is still pending, order 104 was delivered but nobody recorded how long it took, and orders 107 and 108 both cost ₹260. Splitting the data into tables keeps each fact in one place, which is excellent for correctness. The cost appears when the app needs to show one thing that is spread across tables. The "order details" page for order 102, Ben's biryani, needs all four:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, r.name AS restaurant,
       o.status, o.amount, i.item, i.qty, i.unit_price
FROM orders o
JOIN customers   c ON c.customer_id   = o.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN order_items i ON i.order_id      = o.order_id
WHERE o.order_id = 102;</div>
  <div class="fx" data-lang="text"> order_id | customer |  restaurant  |  status   | amount |      item       | qty | unit_price 
----------+----------+--------------+-----------+--------+-----------------+-----+------------
      102 | Ben      | Biryani Bros | delivered | 450.00 | Chicken Biryani |   1 |     350.00
      102 | Ben      | Biryani Bros | delivered | 450.00 | Raita           |   2 |      50.00
(2 rows)</div>
  <p>Three joins were needed to rebuild a single order, and the result repeats the order's facts (Ben, Biryani Bros, delivered, 450) on every line, because a SQL result is always a flat table. Now suppose Biteful adds item <em>options</em> such as "extra cheese" or "less sugar". An order line can have zero, one or several options, so a properly normalised SQL design needs a fifth table, with one row per option:</p>
  <div class="fx" data-lang="sql">CREATE TABLE order_item_options (
  order_id INT, item TEXT, option TEXT,
  PRIMARY KEY (order_id, item, option),
  FOREIGN KEY (order_id, item) REFERENCES order_items (order_id, item)
);
INSERT INTO order_item_options VALUES
  (103, 'Farmhouse Pizza', 'extra cheese'), (103, 'Farmhouse Pizza', 'thin crust'),
  (108, 'Filter Coffee',   'less sugar');
SELECT i.order_id, i.item, i.qty, x.option
FROM order_items i
LEFT JOIN order_item_options x ON x.order_id = i.order_id AND x.item = i.item
WHERE i.order_id IN (103, 108)
ORDER BY i.order_id, i.item, x.option;</div>
  <div class="fx" data-lang="text">CREATE TABLE
INSERT 0 3
 order_id |      item       | qty |    option    
----------+-----------------+-----+--------------
      103 | Farmhouse Pizza |   2 | extra cheese
      103 | Farmhouse Pizza |   2 | thin crust
      108 | Filter Coffee   |   2 | less sugar
      108 | Masala Dosa     |   1 | 
(4 rows)</div>
  <p>The data is correct, but look at its shape. The pizza line now appears twice (once per option), and the Masala Dosa line appears with an empty option because it has none. One order is spread over five tables, and every time the app shows an order it must run the joins and then stitch the flat rows back into the nested shape the screen actually needs: an order, containing lines, containing options.</p>
  <p>MongoDB's answer is simple: if an order, its lines and their options are always read and written together, <strong>store them together</strong>. A <strong>document</strong> is one record made of field–value pairs, where a value can be a plain value, a list (called an <strong>array</strong>), or another small object (an <strong>embedded document</strong>). It looks exactly like a JSON object or a Python dictionary. Here is order 103 as one document:</p>
  <div class="fx" data-lang="mongo">{
  _id: 103,
  customer_id: 3,                 // Chen (a reference to another document)
  restaurant_id: 12,              // Pizza Point
  ordered_at: ISODate("2026-03-02T20:30:00+05:30"),
  status: "delivered",
  amount: 520,
  delivery_minutes: 38,
  items: [
    { item: "Farmhouse Pizza", qty: 2, unit_price: 260,
      options: ["extra cheese", "thin crust"] }
  ]
}</div>
  <p>Reading it from top to bottom: <code>_id</code> is the order's identifier; <code>customer_id</code> and <code>restaurant_id</code> are numbers that point at a customer and a restaurant stored elsewhere (we keep those as pointers for now, and the <a class="xref" data-note="mongo_design">Schema Design</a> note discusses why); then a real date, the status, the bill total and the delivery time. Finally, <code>items</code> is an array holding the order's single line, and that line has its own array of two options. A line without options simply has no <code>options</code> field. There is no fifth table, no empty padding and no repeated rows: the order is stored in exactly the shape the app uses.</p>
  <figure class="viz"><svg viewBox="0 0 640 210" width="640">
    <text x="0" y="14" font-weight="bold" font-size="12">SQL: one order across 5 tables</text>
    <g font-size="11">
      <rect x="0" y="26" width="120" height="40" rx="5" class="fb sb"/><text x="60" y="43" text-anchor="middle">orders</text><text x="60" y="58" text-anchor="middle" class="tm">103 · c3 · r12</text>
      <rect x="140" y="26" width="120" height="40" rx="5" class="fv sb"/><text x="200" y="43" text-anchor="middle">customers</text><text x="200" y="58" text-anchor="middle" class="tm">3 Chen</text>
      <rect x="140" y="76" width="120" height="40" rx="5" class="fv sb"/><text x="200" y="93" text-anchor="middle">restaurants</text><text x="200" y="108" text-anchor="middle" class="tm">12 Pizza Point</text>
      <rect x="0" y="100" width="120" height="40" rx="5" class="ft st"/><text x="60" y="117" text-anchor="middle">order_items</text><text x="60" y="132" text-anchor="middle" class="tm">103 · Farmhouse ×2</text>
      <rect x="0" y="154" width="120" height="44" rx="5" class="fr sr"/><text x="60" y="170" text-anchor="middle">item_options</text><text x="60" y="186" text-anchor="middle" class="tm">2 rows (new table)</text>
    </g>
    <g stroke="currentColor" opacity=".6"><line x1="120" y1="46" x2="140" y2="46"/><line x1="110" y1="66" x2="140" y2="96"/><line x1="60" y1="66" x2="60" y2="100"/><line x1="60" y1="140" x2="60" y2="154"/></g>
    <line x1="300" y1="10" x2="300" y2="200" stroke="currentColor" opacity=".2"/>
    <text x="320" y="14" font-weight="bold" font-size="12">MongoDB: one document</text>
    <rect x="320" y="26" width="310" height="172" rx="6" class="fb sb"/>
    <g font-size="11"><text x="332" y="46">_id: 103, customer_id: 3, restaurant_id: 12</text><text x="332" y="64">status: "delivered", amount: 520</text><text x="332" y="82">items: [</text></g>
    <rect x="344" y="90" width="274" height="80" rx="4" class="ft st"/><text x="354" y="108" font-size="11">Farmhouse Pizza · qty 2 · 260</text><text x="354" y="126" font-size="11">options: [</text>
    <rect x="366" y="134" width="110" height="26" rx="4" class="fr sr"/><text x="421" y="151" text-anchor="middle" font-size="10">extra cheese</text>
    <rect x="484" y="134" width="110" height="26" rx="4" class="fr sr"/><text x="539" y="151" text-anchor="middle" font-size="10">thin crust</text>
    <text x="332" y="188" font-size="11">]   → one read, one atomic write</text>
  </svg><figcaption>Order 103. SQL rebuilds it with joins across five tables; MongoDB keeps the lines and options inside the order, and keeps only the customer and restaurant as references.</figcaption></figure>
  <p>The figure shows the difference. On the left, showing order 103 means finding the order row, then its line, then the line's two option rows, then rebuilding the nesting in application code. On the right, it means finding one document; the lines and options are already inside it. The same is true for writing: "add a line to the order and raise its total" changes two SQL tables and needs a <a class="xref" data-note="sql_transactions">transaction</a> to stay consistent, but in MongoDB both changes are in one document, and a write to one document always happens completely or not at all (section 08 shows this).</p>
  <p>Think of a kirana shop that keeps its records in several linked registers: a customer register, a bill register, an item register and an options register, all tied together by numbers. To see one bill you flip between four books. A document database is like keeping a self-contained carbon copy of each bill instead, with every line, quantity, price and "less sugar" note written on it. Reading one bill becomes instant. The trade-off is just as clear: a question that cuts across bills, such as "how many Masala Dosas did we sell this month?", now means going through every copy, which is the job of the <a class="xref" data-note="mongo_aggregation">Aggregation Pipeline</a> note.</p>
  <p>So <strong>MongoDB</strong> is a <strong>document database</strong>, one kind of NoSQL database (see <a class="xref" data-note="db_types">Types of Databases</a>), in which each record is a document whose values may be nested objects and arrays, with no fixed columns and no join needed for data stored inside one document. People sometimes call it "schemaless", but that word misleads. In SQL you design tables around the <em>data</em>, by normalising it (<a class="xref" data-note="sql_modeling">Data Modeling</a>), and can then write almost any query later. In MongoDB you design documents around the <em>queries you will run</em>: embedding lines in orders makes "show order 103" a single read but makes "dosas sold per day" harder. That trade-off is the subject of <a class="xref" data-note="mongo_design">Schema Design</a>; here we take Biteful's shape as given and learn to work with it.</p>

  <h2 id="mb-doc"><span class="num">02</span>BSON and _id</h2>
  <p>The order document above was written like JSON, but plain JSON has real gaps for a database. It has no date type, so "12:10 on 2 March" would be a string, and you cannot ask "which orders came after noon?" of a string without parsing it. It has only one kind of number, so it cannot tell the integer 2 from 2.0, or store money as an exact decimal. And nothing in it says which document is which once there are millions of them.</p>
  <p>MongoDB fixes the first two gaps by not storing JSON text at all. It stores <strong>BSON</strong> (Binary JSON): the same structure of fields, objects and arrays, but encoded in binary, with a type tag on every value and extra types that JSON lacks, such as dates, 32- and 64-bit integers, doubles, exact 128-bit decimals and ObjectIds. The binary format also stores the length of each piece, so the server can skip over fields it does not need without reading them. Here is a scratch document that uses a few of these types; note that the insert does not give an <code>_id</code>:</p>
  <div class="fx" data-lang="mongo">db.scratch.insertOne({
  ordered_at: ISODate("2026-03-02T12:10:00+05:30"),   // a real date, written in IST
  as_text:    "2026-03-02 12:10",                       // just a string
  qty: 2,  price: 120.5,
  money: NumberDecimal("120.50")                        // exact decimal
})
db.scratch.findOne()</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: ObjectId('6aeabdfde2938b600d32e0f1') }
{
  _id: ObjectId('6aeabdfde2938b600d32e0f1'),
  ordered_at: ISODate('2026-03-02T06:40:00.000Z'),
  as_text: '2026-03-02 12:10',
  qty: 2,
  price: 120.5,
  money: Decimal128('120.50')
}</div>
  <p>Three things can be read straight off the output. First, the document now has an <code>_id</code> that we never wrote, of type <strong>ObjectId</strong>: when you do not supply an id, one is generated for you. Second, we wrote the time as 12:10 in Indian time (+05:30), and it came back as <code>06:40:00.000Z</code>. BSON dates are always stored in <strong>UTC</strong> (the <code>Z</code> means UTC); 06:40 UTC is the same instant as 12:10 IST, just shown on a different clock. The <code>as_text</code> field, by contrast, stayed a plain string that no date comparison will understand. Third, <code>money</code> came back as <code>Decimal128('120.50')</code>, an exact decimal, while <code>price: 120.5</code> is an ordinary double, which can carry tiny rounding errors (0.1 + 0.2 is not exactly 0.3 in a double). For Biteful's whole-rupee amounts, plain numbers are fine; for paise-exact accounting, use Decimal128.</p>
  <p>The third gap is identity. Every document must have a field called <code>_id</code>, and it plays the role of the <strong>primary key</strong>: its value must be unique within the collection, it can be any type except an array, and MongoDB automatically builds an <strong>index</strong> on it. (An index is a sorted lookup structure, like the index at the back of a book, that lets the server find a value without reading every document.) For Biteful we reuse the ids from the SQL tables, so <code>_id: 103</code> simply <em>is</em> order 103. When there is no natural id, the client library (the <strong>driver</strong>) generates an ObjectId before sending the document.</p>
  <figure class="viz"><svg viewBox="0 0 600 80" width="600">
    <rect x="0" y="10" width="192" height="34" class="fb sb"/><text x="96" y="32" text-anchor="middle">4 B · timestamp (s)</text>
    <rect x="192" y="10" width="240" height="34" class="fv sb"/><text x="312" y="32" text-anchor="middle">5 B · random</text>
    <rect x="432" y="10" width="144" height="34" class="ft st"/><text x="504" y="32" text-anchor="middle">3 B · counter</text>
    <text x="0" y="66" font-size="11" class="tm">time comes first → sorting by _id ≈ sorting by creation time; made client-side, no central counter</text>
  </svg><figcaption>An ObjectId is 12 bytes, usually shown as 24 hexadecimal characters.</figcaption></figure>
  <p>An <strong>ObjectId</strong> is a 12-byte value built from three parts, as the figure shows: 4 bytes holding the creation time in seconds since 1970, 5 random bytes, and a 3-byte counter. Think of a railway ticket number that each booking counter prints for itself without phoning head office: part of it is the booking time, part is the counter's own random code, and part is a running count, so two counters never produce the same number and you can read off roughly when a ticket was booked. Because the time comes first, sorting by <code>_id</code> roughly sorts documents by when they were created, and the creation time can be read back out of the id. The id below starts with <code>69a530c0</code>, which is hexadecimal for 1,772,433,600 seconds since 1970:</p>
  <div class="fx" data-lang="mongo">ObjectId("69a530c0a1b2c3d4e5f60718").getTimestamp()
db.scratch.drop()</div>
  <div class="fx" data-lang="text">ISODate('2026-03-02T06:40:00.000Z')
true</div>
  <p>The timestamp decodes to 2026-03-02 06:40 UTC, which is 12:10 IST, order 101's time, read from the id alone. The <code>true</code> is <code>drop()</code> confirming that the scratch collection is gone.</p>
  <p>Two practical limits follow from all this. A single document can be at most <strong>16 MB</strong> of BSON. A handful of order lines is a few hundred bytes, so orders are nowhere near it, but a design that keeps adding to one document forever (every order a customer ever placed, inside the customer) will eventually hit the wall; <a class="xref" data-note="mongo_design">Schema Design</a> measures exactly when. And because dates come back in UTC, a report that prints <code>06:40</code> for a lunch order is not wrong data but the wrong clock: convert to <code>Asia/Kolkata</code> when displaying times or grouping by day.</p>

  <h2 id="mb-coll"><span class="num">03</span>Collections and the SQL Vocabulary</h2>
  <p>A customer document and an order document should not sit in one pile, so documents are grouped. A <strong>collection</strong> is a named group of documents, MongoDB's equivalent of a table, and a <strong>database</strong> is a named group of collections, as in SQL. Two differences from tables matter from the first day. Documents in one collection do not have to share the same fields: Esha's customer document simply has no <code>city</code>, and only Ben, Chen and Farah have a <code>referred_by</code>. And there is no <code>CREATE TABLE</code> step: a database and a collection come into existence the moment the first document is written into them.</p>
  <p>Picture a cupboard (the database) full of labelled box files (the collections). A new box file appears the moment you drop the first form into a new label, and the forms inside one box can be slightly different versions of the form, some with an extra "referred by" box filled in, some with "city" left blank. Here is that behaviour on an empty <code>biteful</code> database, including a one-letter typo:</p>
  <div class="fx" data-lang="mongo">use biteful
db.getCollectionNames()
db.orders.insertOne({ _id: 1, note: "the first write creates the collection" })
db.getCollectionNames()
db.order.countDocuments()          // typo: "order", not "orders"
db.getCollectionNames()
db.orders.drop()</div>
  <div class="fx" data-lang="text">[]
{ acknowledged: true, insertedId: 1 }
[ 'orders' ]
0
[ 'orders' ]</div>
  <p>Before the insert the database has no collections; <code>use biteful</code> only chose a name. After one <code>insertOne</code>, the <code>orders</code> collection exists. Then comes the typo: <code>db.order.countDocuments()</code>, without the "s", returned 0 and raised no error, because MongoDB simply treats <code>order</code> as another collection that happens to be empty. (Reading from it does not create it, which is why the last list still shows only <code>orders</code>; writing to it would.) So <code>db.order</code>, <code>db.Orders</code> and <code>db.orders</code> are three different collections, and when a query "returns nothing", the first thing to check is the collection name. The full name of a collection, such as <code>biteful.orders</code>, is called its <strong>namespace</strong>, and it is what appears in error messages.</p>
  <p>Most SQL ideas carry over to MongoDB with new names, and the few that do not are exactly where the design work moves. This table is worth keeping in your head:</p>
  <table class="tbl">
    <tr><th>SQL</th><th>MongoDB</th><th>On Biteful</th></tr>
    <tr><td>Database / table / row / column</td><td>Database / collection / document / field</td><td><code>biteful</code> / <code>orders</code> / order 103 / <code>status</code></td></tr>
    <tr><td>Primary key</td><td><code>_id</code></td><td><code>_id: 103</code></td></tr>
    <tr><td>Child table + JOIN</td><td>Embedded array (no join), or <code>$lookup</code></td><td>lines inside <code>items</code>; customer names via <a class="xref" data-note="mongo_aggregation">$lookup</a></td></tr>
    <tr><td>Foreign key</td><td>A stored id that nothing enforces</td><td><code>customer_id: 3</code> (section 10)</td></tr>
    <tr><td><code>NULL</code></td><td><code>null</code>, <em>or</em> the field is absent</td><td>104 has <code>delivery_minutes: null</code>; 105 has no such field</td></tr>
    <tr><td><code>SELECT … WHERE</code> / <code>ORDER BY … LIMIT</code></td><td><code>find(filter, projection)</code> / <code>sort().limit()</code></td><td>sections 05–07</td></tr>
    <tr><td><code>INSERT / UPDATE / DELETE</code></td><td><code>insertOne / updateOne / deleteOne</code> (and <code>…Many</code>)</td><td>sections 04, 08, 10</td></tr>
    <tr><td><code>INSERT … ON CONFLICT DO UPDATE</code></td><td><code>updateOne(…, { upsert: true })</code></td><td>section 09</td></tr>
    <tr><td><code>GROUP BY</code>, <code>CHECK</code>, multi-table transaction</td><td><code>$group</code>, <code>$jsonSchema</code> validator, multi-document transaction</td><td><a class="xref" data-note="mongo_aggregation">Aggregation</a>, <a class="xref" data-note="mongo_design">Schema Design</a></td></tr>
  </table>
  <p>For Biteful, the four SQL tables become <strong>three</strong> collections, <code>customers</code> (7 documents), <code>restaurants</code> (5) and <code>orders</code> (10), because the 15 order lines move inside the orders. A NULL in SQL usually becomes a field that is simply absent.</p>
  <p>This raises the honest question of when documents are the better fit at all. A tailor keeps each customer's measurements on one card, with whatever odd extra a customer needs ("left shoulder lower"); the cards differ, and each is read as a whole. That is document-shaped data. A bank cannot work that way: a transfer must change two accounts and the day's ledger together or not at all, and auditors ask questions nobody planned in advance. That is table-shaped data. For Biteful, the order with its lines and options fits documents well: it is read as a unit, lines vary in shape, and most changes stay inside one order. A wallet-and-payments ledger would fit tables better: every payment changes several records together, the shape never varies, and finance keeps asking new questions. The modern answer to "which is better?" is therefore a reason, not a slogan. ("MongoDB has no transactions" is outdated, since multi-document transactions exist from version 4.0, and "Postgres can't store JSON" is wrong too, as its JSONB type shows.)</p>

  <h2 id="mb-insert"><span class="num">04</span>Inserting Documents</h2>
  <p>Nothing can be queried until it is stored. In SQL that meant <code>CREATE TABLE</code> followed by <code>INSERT</code>; in MongoDB there is no create step, so inserting is the whole job. Two commands do it. <code>insertOne(doc)</code> adds one document, and <code>insertMany([doc, doc, …])</code> adds a whole batch in one round trip to the server, which is much faster than sending them one at a time. Here is the complete Biteful load that the rest of this note (and the next two notes) uses. As you read it, compare it with the SQL rows: the values are the same, but Esha's document has no <code>city</code>, Momo Magic's has no <code>rating</code>, order 104 has <code>delivery_minutes: null</code> (delivered, time not recorded), and orders 105, 107 and 110 have no <code>delivery_minutes</code> field at all (never delivered).</p>
  <div class="fx" data-lang="mongo">use biteful
db.customers.insertMany([
  { _id: 1, name: "Asha",  city: "Pune",   signup_date: ISODate("2026-01-05") },
  { _id: 2, name: "Ben",   city: "Mumbai", signup_date: ISODate("2026-01-12"), referred_by: 1 },
  { _id: 3, name: "Chen",  city: "Pune",   signup_date: ISODate("2026-02-03"), referred_by: 1 },
  { _id: 4, name: "Dia",   city: "Mumbai", signup_date: ISODate("2026-02-20") },
  { _id: 5, name: "Esha",                  signup_date: ISODate("2026-03-01") },
  { _id: 6, name: "Farah", city: "Mumbai", signup_date: ISODate("2026-03-02"), referred_by: 2 },
  { _id: 7, name: "Gita",  city: "Pune",   signup_date: ISODate("2026-03-04") }
])
db.restaurants.insertMany([
  { _id: 10, name: "Dosa Hut",     city: "Pune",   cuisine: "South Indian", rating: 4.5 },
  { _id: 11, name: "Biryani Bros", city: "Mumbai", cuisine: "Biryani",      rating: 4.2 },
  { _id: 12, name: "Pizza Point",  city: "Pune",   cuisine: "Pizza",        rating: 3.9 },
  { _id: 13, name: "Green Bowl",   city: "Mumbai", cuisine: "Healthy",      rating: 4.2 },
  { _id: 14, name: "Momo Magic",   city: "Pune",   cuisine: "Tibetan" }
])
db.orders.insertMany([
  { _id: 101, customer_id: 1, restaurant_id: 10, ordered_at: ISODate("2026-03-02T12:10:00+05:30"),
    status: "delivered", amount: 240, delivery_minutes: 32,
    items: [ { item: "Masala Dosa", qty: 2, unit_price: 120 } ] },
  { _id: 102, customer_id: 2, restaurant_id: 11, ordered_at: ISODate("2026-03-02T13:05:00+05:30"),
    status: "delivered", amount: 450, delivery_minutes: 41,
    items: [ { item: "Chicken Biryani", qty: 1, unit_price: 350 },
             { item: "Raita", qty: 2, unit_price: 50 } ] },
  { _id: 103, customer_id: 3, restaurant_id: 12, ordered_at: ISODate("2026-03-02T20:30:00+05:30"),
    status: "delivered", amount: 520, delivery_minutes: 38,
    items: [ { item: "Farmhouse Pizza", qty: 2, unit_price: 260, options: ["extra cheese", "thin crust"] } ] },
  { _id: 104, customer_id: 1, restaurant_id: 12, ordered_at: ISODate("2026-03-03T13:15:00+05:30"),
    status: "delivered", amount: 380, delivery_minutes: null,
    items: [ { item: "Margherita", qty: 1, unit_price: 280 },
             { item: "Garlic Bread", qty: 1, unit_price: 100 } ] },
  { _id: 105, customer_id: 4, restaurant_id: 13, ordered_at: ISODate("2026-03-03T19:45:00+05:30"),
    status: "cancelled", amount: 310,
    items: [ { item: "Buddha Bowl", qty: 1, unit_price: 310 } ] },
  { _id: 106, customer_id: 2, restaurant_id: 11, ordered_at: ISODate("2026-03-04T12:40:00+05:30"),
    status: "delivered", amount: 180, delivery_minutes: 25,
    items: [ { item: "Veg Biryani", qty: 1, unit_price: 180 } ] },
  { _id: 107, customer_id: 5, restaurant_id: 12, ordered_at: ISODate("2026-03-04T21:10:00+05:30"),
    status: "cancelled", amount: 260,
    items: [ { item: "Farmhouse Pizza", qty: 1, unit_price: 260 } ] },
  { _id: 108, customer_id: 3, restaurant_id: 10, ordered_at: ISODate("2026-03-05T18:20:00+05:30"),
    status: "delivered", amount: 260, delivery_minutes: 29,
    items: [ { item: "Masala Dosa", qty: 1, unit_price: 120 },
             { item: "Filter Coffee", qty: 2, unit_price: 70, options: ["less sugar"] } ] },
  { _id: 109, customer_id: 6, restaurant_id: 11, ordered_at: ISODate("2026-03-05T20:05:00+05:30"),
    status: "delivered", amount: 600, delivery_minutes: 52,
    items: [ { item: "Chicken Biryani", qty: 1, unit_price: 350, options: ["extra spicy"] },
             { item: "Mutton Kebab", qty: 1, unit_price: 250 } ] },
  { _id: 110, customer_id: 1, restaurant_id: 10, ordered_at: ISODate("2026-03-08T20:50:00+05:30"),
    status: "pending", amount: 310,
    items: [ { item: "Masala Dosa", qty: 2, unit_price: 120 },
             { item: "Filter Coffee", qty: 1, unit_price: 70 } ] }
])</div>
  <div class="fx" data-lang="text">{
  acknowledged: true,
  insertedIds: { '0': 1, '1': 2, '2': 3, '3': 4, '4': 5, '5': 6, '6': 7 }
}
{
  acknowledged: true,
  insertedIds: { '0': 10, '1': 11, '2': 12, '3': 13, '4': 14 }
}
{
  acknowledged: true,
  insertedIds: {
    '0': 101,
    '1': 102,
    '2': 103,
    '3': 104,
    '4': 105,
    '5': 106,
    '6': 107,
    '7': 108,
    '8': 109,
    '9': 110
  }
}</div>
  <p><code>acknowledged: true</code> means the server confirmed each write. <code>insertedIds</code> maps each position in your array (<code>'0'</code>, <code>'1'</code>, …) to the <code>_id</code> that was stored; since we supplied our own ids, they are 1–7, 10–14 and 101–110. Notice also that every order line carries its own <code>unit_price</code>. That is deliberate: it is the price paid on that day, a <strong>snapshot</strong>, and it must not change when the restaurant changes its menu price next month.</p>
  <p>Because <code>_id</code> must be unique, inserting a second customer with <code>_id: 1</code> must fail. Think of a token counter: every form dropped into a box file needs a unique token number, and a second form with a number already in the box is rejected at the counter.</p>
  <div class="fx" data-lang="mongo">db.customers.insertOne({ _id: 1, name: "Asha again" })</div>
  <div class="fx" data-lang="text">DuplicateKeyError: E11000 Duplicate Key Error</div>
  <p>The error code <strong>E11000</strong> is MongoDB's duplicate-key error, raised by any unique index, and the <code>_id</code> index is always unique. (On a real server the message is longer: it also names the collection <code>biteful.customers</code>, the index <code>_id_</code>, and the clashing value <code>{ _id: 1 }</code>.) The more interesting case is a batch with a duplicate in the middle. By default, <code>insertMany</code> is <strong>ordered</strong>: it inserts the documents one after another and stops at the first error. With <code>{ ordered: false }</code> it tries every document and reports all the errors at the end:</p>
  <div class="fx" data-lang="mongo">db.t.insertMany([{ _id: 1 }, { _id: 1 }, { _id: 2 }])                       // ordered (default)
db.t.countDocuments()
db.t.drop()
db.t.insertMany([{ _id: 1 }, { _id: 1 }, { _id: 2 }], { ordered: false })   // unordered
db.t.countDocuments()
db.t.drop()</div>
  <div class="fx" data-lang="text">BulkWriteError: batch op errors occurred
1
BulkWriteError: batch op errors occurred
2</div>
  <p>Both batches raised a bulk-write error, but they left different amounts of data behind. Traced document by document, for the batch <code>[{ _id: 1 }, { _id: 1 }, { _id: 2 }]</code>:</p>
  <table class="tbl">
    <tr><th>Document</th><th>Ordered (default)</th><th>Unordered</th></tr>
    <tr><td><code>{ _id: 1 }</code></td><td>inserted</td><td>inserted</td></tr>
    <tr><td><code>{ _id: 1 }</code></td><td>E11000 → <strong>stop</strong></td><td>E11000 → skip it, carry on</td></tr>
    <tr><td><code>{ _id: 2 }</code></td><td>never tried</td><td>inserted</td></tr>
    <tr><td>Count afterwards</td><td><strong>1</strong></td><td><strong>2</strong></td></tr>
  </table>
  <p>One thing neither mode does is undo the documents inserted before the error: a batch is not a transaction. If a load must be all-or-nothing, wrap it in a transaction or load into a fresh collection and swap it in afterwards. For bulk imports where a few bad rows should not stop the rest (a CSV file, a sync from a partner's API), <code>ordered: false</code> with the errors logged is the usual choice.</p>

  <h2 id="mb-find"><span class="num">05</span>Finding Documents</h2>
  <p>All of Biteful is stored, and the operations team starts asking questions: which delivered orders were ₹300 or more, which orders never got a delivery time, which customers live in Pune? In SQL you write the condition as text after <code>WHERE</code>. MongoDB has no query text; instead, the question is itself a document. The command is <code>find(filter, projection)</code>. The <strong>filter</strong> is a document that describes the documents you want: <code>{ city: "Pune" }</code> means "city equals Pune", and an empty filter <code>{}</code> matches everything. The optional <strong>projection</strong> lists which fields to send back: <code>1</code> means include, <code>0</code> means exclude, and <code>_id</code> is included unless you exclude it. Think of a search form at a library counter: you write "City: Pune" in one box and leave the others blank (the filter), and you tell the clerk to photocopy only the Name line rather than the whole card (the projection).</p>
  <div class="fx" data-lang="mongo">db.customers.find({ city: "Pune" }, { name: 1, _id: 0 })</div>
  <div class="fx" data-lang="text">[ { name: 'Asha' }, { name: 'Chen' }, { name: 'Gita' } ]</div>
  <p>That is <code>SELECT name FROM customers WHERE city = 'Pune'</code>: three names, and no <code>_id</code> because the projection excluded it. For anything other than "equals", you put a <strong>query operator</strong> inside the field's value; operators are keywords that start with <code>$</code>. When a filter names several fields side by side, every condition must hold, which is an implicit AND.</p>
  <table class="tbl">
    <tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
    <tr><td><code>$eq $ne</code></td><td>equal / not equal (<code>{ a: 5 }</code> is short for <code>$eq</code>)</td><td><code>{ status: { $ne: "cancelled" } }</code></td></tr>
    <tr><td><code>$gt $gte $lt $lte</code></td><td>&gt; ≥ &lt; ≤</td><td><code>{ amount: { $gte: 300 } }</code></td></tr>
    <tr><td><code>$in $nin</code></td><td>in / not in a list</td><td><code>{ status: { $in: ["cancelled", "pending"] } }</code></td></tr>
    <tr><td><code>$or $and $nor $not</code></td><td>logic across conditions</td><td><code>{ $or: [ {…}, {…} ] }</code></td></tr>
    <tr><td><code>$exists $type</code></td><td>is the field present? of which BSON type?</td><td><code>{ city: { $exists: false } }</code></td></tr>
    <tr><td><code>$regex</code></td><td>text pattern</td><td><code>{ name: { $regex: /^G/ } }</code></td></tr>
  </table>
  <p>Before running the first real question, it helps to do what the server does, by hand. The filter <code>{ status: "delivered", amount: { $gte: 300 } }</code> is checked against each of the 10 orders, and an order is kept only if both tests pass:</p>
  <table class="tbl">
    <tr><th>order</th><th>status</th><th>delivered?</th><th>amount</th><th>≥ 300?</th><th>kept</th></tr>
    <tr><td>101</td><td>delivered</td><td>yes</td><td>240</td><td>no</td><td>—</td></tr>
    <tr><td>102</td><td>delivered</td><td>yes</td><td>450</td><td>yes</td><td>✓</td></tr>
    <tr><td>103</td><td>delivered</td><td>yes</td><td>520</td><td>yes</td><td>✓</td></tr>
    <tr><td>104</td><td>delivered</td><td>yes</td><td>380</td><td>yes</td><td>✓</td></tr>
    <tr><td>105</td><td>cancelled</td><td>no</td><td>310</td><td>yes</td><td>—</td></tr>
    <tr><td>106</td><td>delivered</td><td>yes</td><td>180</td><td>no</td><td>—</td></tr>
    <tr><td>107</td><td>cancelled</td><td>no</td><td>260</td><td>no</td><td>—</td></tr>
    <tr><td>108</td><td>delivered</td><td>yes</td><td>260</td><td>no</td><td>—</td></tr>
    <tr><td>109</td><td>delivered</td><td>yes</td><td>600</td><td>yes</td><td>✓</td></tr>
    <tr><td>110</td><td>pending</td><td>no</td><td>310</td><td>yes</td><td>—</td></tr>
  </table>
  <p>The prediction is 102, 103, 104 and 109. Here is the real run, followed by an <code>$in</code>, an <code>$or</code>, and two calls to <code>findOne</code>, which returns the first match as a single document (or <code>null</code> when nothing matches) instead of a list:</p>
  <div class="fx" data-lang="mongo">db.orders.find({ status: "delivered", amount: { $gte: 300 } }, { status: 1, amount: 1 })
db.orders.find({ status: { $in: ["cancelled", "pending"] } }, { status: 1 })
db.orders.find({ $or: [ { restaurant_id: 10 }, { amount: { $gt: 500 } } ] }, { restaurant_id: 1, amount: 1 })
db.orders.findOne({ amount: { $lt: 200 } }, { amount: 1 })
db.orders.findOne({ amount: { $lt: 100 } })</div>
  <div class="fx" data-lang="text">[
  { _id: 102, status: 'delivered', amount: 450 },
  { _id: 103, status: 'delivered', amount: 520 },
  { _id: 104, status: 'delivered', amount: 380 },
  { _id: 109, status: 'delivered', amount: 600 }
]
[
  { _id: 105, status: 'cancelled' },
  { _id: 107, status: 'cancelled' },
  { _id: 110, status: 'pending' }
]
[
  { _id: 101, restaurant_id: 10, amount: 240 },
  { _id: 103, restaurant_id: 12, amount: 520 },
  { _id: 108, restaurant_id: 10, amount: 260 },
  { _id: 109, restaurant_id: 11, amount: 600 },
  { _id: 110, restaurant_id: 10, amount: 310 }
]
{ _id: 106, amount: 180 }
null</div>
  <p>The first result matches the hand trace exactly. <code>$in</code> found the three orders that were not delivered. <code>$or</code> takes a <em>list</em> of filters and keeps a document if any one of them holds: orders 101, 108 and 110 are from Dosa Hut (restaurant 10), and 103 and 109 cost more than ₹500. <code>findOne</code> returned order 106 as one document (no square brackets), and returned <code>null</code> when no order costs under ₹100.</p>
  <p>Missing values need special care, because documents have two ways of "having no value" where SQL has only NULL. A field can be present with the value <code>null</code> (order 104: delivered, time not recorded), or the field can be absent altogether (orders 105, 107 and 110: never delivered, so the field was never written). The three filters below ask three different questions:</p>
  <div class="fx" data-lang="mongo">db.orders.find({ delivery_minutes: null }, { status: 1, delivery_minutes: 1 })
db.orders.find({ delivery_minutes: { $exists: false } }, { _id: 1 })
db.orders.find({ delivery_minutes: { $exists: true, $eq: null } }, { _id: 1 })
db.customers.find({ city: null }, { name: 1 })</div>
  <div class="fx" data-lang="text">[
  { _id: 104, status: 'delivered', delivery_minutes: null },
  { _id: 105, status: 'cancelled' },
  { _id: 107, status: 'cancelled' },
  { _id: 110, status: 'pending' }
]
[ { _id: 105 }, { _id: 107 }, { _id: 110 } ]
[ { _id: 104 } ]
[ { _id: 5, name: 'Esha' } ]</div>
  <p><code>{ delivery_minutes: null }</code> matched <strong>four</strong> orders: the explicit null in 104 <em>and</em> the three where the field is missing. That is the same answer SQL gives, since SQL has only one kind of NULL:</p>
  <div class="fx" data-lang="sql">SELECT order_id, status, delivery_minutes FROM orders
WHERE delivery_minutes IS NULL ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id |  status   | delivery_minutes 
----------+-----------+------------------
      104 | delivered |                 
      105 | cancelled |                 
      107 | cancelled |                 
      110 | pending   |                 
(4 rows)</div>
  <p><code>$exists: false</code> matched only the three orders without the field, and combining <code>$exists: true</code> with <code>$eq: null</code> matched only order 104 (MongoDB also offers the shorter <code>{ $type: "null" }</code> for this). The same rule found Esha, whose document has no <code>city</code> at all. Which filter is right depends on the question: "orders with no delivery time" is the first, "orders never delivered" is closer to the second, and "delivered but not recorded" is the third.</p>
  <p>Projections come in two kinds, and you must pick one per query. An <em>inclusion</em> projection lists the fields you want and returns only those (plus <code>_id</code> unless you exclude it). An <em>exclusion</em> projection lists the fields you do not want and returns everything else:</p>
  <div class="fx" data-lang="mongo">db.restaurants.find({ city: "Mumbai" }, { name: 1, rating: 1, _id: 0 })
db.restaurants.find({ _id: 14 }, { cuisine: 0, city: 0 })</div>
  <div class="fx" data-lang="text">[
  { name: 'Biryani Bros', rating: 4.2 },
  { name: 'Green Bowl', rating: 4.2 }
]
[ { _id: 14, name: 'Momo Magic' } ]</div>
  <p>The first query returned just the name and rating of the two Mumbai restaurants. The second returned Momo Magic without its <code>cuisine</code> and <code>city</code>, and with no <code>rating</code> because it never had one. Mixing the two kinds, such as <code>{ name: 1, city: 0 }</code>, is rejected by the server as an error; the one exception is <code>_id: 0</code>, which may be added to an inclusion projection. Projecting only the fields you need is a habit worth forming early: it means less data crossing the network.</p>

  <h2 id="mb-arrays"><span class="num">06</span>Querying Inside Arrays</h2>
  <p>"Which orders contain a Masala Dosa?" is the kind of question that caused a five-table join in SQL. In the documents there is no top-level <code>item</code> field: the item names live inside each order's <code>items</code> array. To reach inside, MongoDB uses <strong>dot notation</strong>: <code>"items.item"</code> means "the <code>item</code> field of the elements of <code>items</code>" (the quotes are required because of the dot). When the path goes through an array, the condition is true if <strong>any</strong> element matches. A number in the path picks one position instead, so <code>"items.0.item"</code> means the first line's item. And <code>$size</code> tests the length of an array:</p>
  <div class="fx" data-lang="mongo">db.orders.find({ "items.item": "Masala Dosa" }, { _id: 1 })
db.orders.find({ "items.options": "less sugar" }, { _id: 1 })
db.orders.find({ "items.0.item": "Masala Dosa" }, { _id: 1 })
db.orders.find({ items: { $size: 2 } }, { _id: 1 })</div>
  <div class="fx" data-lang="text">[ { _id: 101 }, { _id: 108 }, { _id: 110 } ]
[ { _id: 108 } ]
[ { _id: 101 }, { _id: 108 }, { _id: 110 } ]
[ { _id: 102 }, { _id: 104 }, { _id: 108 }, { _id: 109 }, { _id: 110 } ]</div>
  <p>Masala Dosa appears in orders 101, 108 and 110, found with one plain filter. Only order 108 has a "less sugar" option, and the query did not mind that most lines have no <code>options</code> field at all. In all three dosa orders the dosa happens to be the first line, so <code>"items.0.item"</code> gives the same three. Five orders have exactly two lines (<code>$size</code> takes an exact number, not a range).</p>
  <p>The "any element" rule has a trap that catches almost everyone once. Suppose the kitchen asks: which orders have a line with quantity at least 2 <em>and</em> unit price at least ₹100, <em>on the same line</em>? Looking at the data, that is 101 (two dosas at 120), 103 (two pizzas at 260) and 110 (two dosas at 120). The natural-looking filter puts two dot-notation conditions side by side; <code>$elemMatch</code> is the alternative:</p>
  <div class="fx" data-lang="mongo">db.orders.find({ "items.qty": { $gte: 2 }, "items.unit_price": { $gte: 100 } }, { _id: 1 })
db.orders.find({ items: { $elemMatch: { qty: { $gte: 2 }, unit_price: { $gte: 100 } } } }, { _id: 1 })</div>
  <div class="fx" data-lang="text">[ { _id: 101 }, { _id: 102 }, { _id: 103 }, { _id: 108 }, { _id: 110 } ]
[ { _id: 101 }, { _id: 103 }, { _id: 110 } ]</div>
  <p>The first query wrongly added orders 102 and 108. Trace order 102, whose lines are a Chicken Biryani (qty 1, ₹350) and a Raita (qty 2, ₹50). The server asked two separate questions of the array: does <em>any</em> line have qty ≥ 2? Yes, the Raita. Does <em>any</em> line have unit price ≥ 100? Yes, the biryani. Each condition was satisfied, but by a different line. Order 108 fails the same way (two coffees at ₹70, one dosa at ₹120). <strong>$elemMatch</strong> means "at least one element satisfies all of these conditions together", which gives exactly 101, 103 and 110.</p>
  <figure class="viz"><svg viewBox="0 0 620 160" width="620">
    <text x="0" y="14" font-size="11" class="tm">order 102 items</text>
    <rect x="0" y="22" width="200" height="30" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="10" y="42" font-size="11">Chicken Biryani  qty 1  <tspan class="tg">₹350</tspan></text>
    <rect x="0" y="58" width="200" height="30" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="10" y="78" font-size="11">Raita  <tspan class="tg">qty 2</tspan>  ₹50</text>
    <text x="220" y="42" font-size="11">without $elemMatch:</text><text x="220" y="58" font-size="11" class="tm">qty ≥ 2 → Raita ✓, price ≥ 100 → Biryani ✓</text><text x="220" y="76" font-size="11" class="tr">→ order 102 matches (wrong)</text>
    <text x="0" y="114" font-size="11" class="tm">order 103 items</text>
    <rect x="0" y="122" width="200" height="30" rx="5" class="fg sg"/><text x="10" y="142" font-size="11">Farmhouse Pizza <tspan class="tg">qty 2 · ₹260</tspan></text>
    <text x="220" y="124" font-size="11">with $elemMatch: both tests on the <tspan class="tb">same</tspan> line</text><text x="220" y="142" font-size="11" class="tg">→ 101, 103, 110 only</text>
  </svg><figcaption>Dot-notation conditions are checked against the array one at a time; $elemMatch ties them to one element.</figcaption></figure>
  <p>The figure shows the difference on two orders. The rule to remember: one condition on an array field can use plain dot notation, but two or more conditions that must hold on the same element need <code>$elemMatch</code>.</p>
  <p>A second, quieter trap comes from leaving out the dot. Writing <code>{ items: { item: "Raita" } }</code> does not mean "a line whose item is Raita"; it means "a line that is <em>exactly</em> the object <code>{ item: "Raita" }</code>", with no other fields:</p>
  <div class="fx" data-lang="mongo">db.orders.find({ items: { item: "Raita" } }, { _id: 1 })
db.orders.find({ items: { item: "Raita", qty: 2, unit_price: 50 } }, { _id: 1 })</div>
  <div class="fx" data-lang="text">[]
[ { _id: 102 } ]</div>
  <p>The first query found nothing, because order 102's Raita line also has <code>qty</code> and <code>unit_price</code>, so it is not an exact match. Only when every field is spelled out, in the same order, does it match. In practice you almost always want dot notation or <code>$elemMatch</code>; the whole-object form is rarely what you mean.</p>

  <h2 id="mb-sort"><span class="num">07</span>Sorting, Limiting and Paging</h2>
  <p>The results so far came back in whatever order the server happened to read them, and all at once. The app, however, needs "the 3 biggest orders", "newest first" and "page 2, four orders per page", and pulling every order into Python to sort it there would ship the whole collection over the network. Three methods chained after <code>find</code> do this on the server: <code>sort({ field: 1 })</code> sorts ascending and <code>-1</code> descending (several keys apply left to right, like <code>ORDER BY a, b DESC</code>), <code>limit(n)</code> keeps the first n, and <code>skip(n)</code> throws away the first n. Picture a stack of exam sheets: sort them by marks, set the first four aside (skip 4), then pick up the next four (limit 4). A teacher always sorts first, whatever order you shout the instructions in, and so does MongoDB:</p>
  <div class="fx" data-lang="mongo">db.orders.find({}, { amount: 1 }).sort({ amount: -1 }).limit(3)
db.orders.find({}, { amount: 1 }).limit(3).sort({ amount: -1 })      // limit written first
db.orders.find({}, { amount: 1 }).sort({ amount: 1, _id: 1 }).limit(4)
db.orders.find({}, { ordered_at: 1 }).sort({ ordered_at: -1 }).limit(2)</div>
  <div class="fx" data-lang="text">[
  { _id: 109, amount: 600 },
  { _id: 103, amount: 520 },
  { _id: 102, amount: 450 }
]
[
  { _id: 109, amount: 600 },
  { _id: 103, amount: 520 },
  { _id: 102, amount: 450 }
]
[
  { _id: 106, amount: 180 },
  { _id: 101, amount: 240 },
  { _id: 107, amount: 260 },
  { _id: 108, amount: 260 }
]
[
  { _id: 110, ordered_at: ISODate('2026-03-08T15:20:00.000Z') },
  { _id: 109, ordered_at: ISODate('2026-03-05T14:35:00.000Z') }
]</div>
  <p>The first query sorted by amount from high to low (600, 520, 450) and kept three. The second wrote <code>limit</code> <em>before</em> <code>sort</code> and got the same answer, because the server always applies sort, then skip, then limit, regardless of the order you chain them. The third sorted ascending and shows a subtle problem: orders 107 and 108 <strong>tie</strong> at ₹260. Adding <code>_id: 1</code> as a second sort key gives the tie a fixed order (107 first). Without such a <strong>tie-breaker</strong>, the server may return tied documents in either order, and if a page boundary falls between them, one order can appear on two pages while another appears on none. The last query sorts by date, newest first: order 110 (8 March) and then 109.</p>
  <p>Paging can be done two ways, and the difference matters on large collections. Here is page 2 at four orders per page, done both ways, followed by two kinds of count and a look at what <code>find</code> really returns:</p>
  <div class="fx" data-lang="mongo">db.orders.find({}, { _id: 1 }).sort({ _id: 1 }).skip(4).limit(4)          // page 2, skip/limit
db.orders.find({ _id: { $gt: 104 } }, { _id: 1 }).sort({ _id: 1 }).limit(4) // page 2, keyset
db.orders.countDocuments({ status: "delivered" })
db.orders.estimatedDocumentCount()
const cur = db.orders.find({}, { _id: 1 }).sort({ _id: 1 })
cur.next()
cur.next()</div>
  <div class="fx" data-lang="text">[ { _id: 105 }, { _id: 106 }, { _id: 107 }, { _id: 108 } ]
[ { _id: 105 }, { _id: 106 }, { _id: 107 }, { _id: 108 } ]
7
10
{ _id: 101 }
{ _id: 102 }</div>
  <p><code>skip(4).limit(4)</code> reads orders 101–104, throws them away and returns 105–108. The second query returns the same page by remembering the last id on page 1 (104) and asking for <code>_id &gt; 104</code>. This is called <strong>keyset pagination</strong> (or cursor-based paging), and its advantage is that the index on <code>_id</code> lets the server jump straight to 105 instead of walking past everything before it. On page 2 nobody notices the difference; on page 5,000 with 20 per page, <code>skip</code> reads and discards 99,980 documents to return 20, while the keyset query still reads 20. Feeds and infinite-scroll lists should therefore page by a sorted, indexed key.</p>
  <p>The two counts answer different questions. <code>countDocuments(filter)</code> runs the filter and counts exactly: 7 delivered orders. <code>estimatedDocumentCount()</code> takes no filter and reads the collection's metadata instead of the documents, so it is instant even on huge collections: 10 orders. Finally, <code>find</code> does not return a list at all but a <strong>cursor</strong>, a lazy pointer into the result that fetches documents from the server in batches as you ask for them; each <code>next()</code> above pulled one more document. That is why iterating over a million-document result does not need a million documents in memory at once.</p>

  <h2 id="mb-update"><span class="num">08</span>Updating Documents</h2>
  <p>Biteful's data changes all day: a delivery time gets corrected, Asha earns loyalty points, she adds a Medu Vada to her pending order 110. In SQL, adding that item means an <code>INSERT</code> into <code>order_items</code> plus an <code>UPDATE</code> of <code>orders.amount</code>, two statements that need a transaction to stay consistent. In MongoDB the line and the total live in the same document, so the question becomes: how do we change part of a document without rewriting all of it?</p>
  <p><code>updateOne(filter, update)</code> changes the first document that matches the filter, and <code>updateMany(filter, update)</code> changes every match. The <code>update</code> argument is a document of <strong>update operators</strong> that say <em>how</em> to change the named fields; every field you do not mention is left exactly as it was. Correcting a form with a pen is the right picture: you change one box and keep the rest.</p>
  <table class="tbl">
    <tr><th>Operator</th><th>Does</th><th>Biteful example</th></tr>
    <tr><td><code>$set</code> / <code>$unset</code></td><td>set / remove a field (dots allowed)</td><td><code>{ $set: { delivery_minutes: 26 } }</code></td></tr>
    <tr><td><code>$inc</code></td><td>add to a number (starts from 0 if the field is missing)</td><td><code>{ $inc: { loyalty_points: 50 } }</code></td></tr>
    <tr><td><code>$push</code></td><td>append to an array</td><td><code>{ $push: { items: { … } } }</code></td></tr>
    <tr><td><code>$addToSet</code></td><td>append only if the value is not already there</td><td><code>{ $addToSet: { diets: "vegetarian" } }</code></td></tr>
    <tr><td><code>$pull</code></td><td>remove matching array elements</td><td><code>{ $pull: { items: { item: "Medu Vada" } } }</code></td></tr>
  </table>
  <p>Write results are printed on one line in this note. The first example corrects order 106's delivery time twice, then gives Asha points twice:</p>
  <div class="fx" data-lang="mongo">db.orders.updateOne({ _id: 106 }, { $set: { delivery_minutes: 26 } })
db.orders.updateOne({ _id: 106 }, { $set: { delivery_minutes: 26 } })     // the same again
db.customers.updateOne({ _id: 1 }, { $inc: { loyalty_points: 50 } })
db.customers.updateOne({ _id: 1 }, { $inc: { loyalty_points: 30 } })
db.customers.findOne({ _id: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 0, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{
  _id: 1,
  name: 'Asha',
  city: 'Pune',
  signup_date: ISODate('2026-01-05T00:00:00.000Z'),
  loyalty_points: 80
}</div>
  <p>The result of every update reports two numbers worth reading. <code>matchedCount</code> is how many documents the filter found, and <code>modifiedCount</code> is how many were actually changed. The first <code>$set</code> found order 106 and changed its time from 25 to 26. The identical second one found it but changed nothing (<code>modifiedCount: 0</code>), because the value was already 26; that is not an error. <code>$inc</code> created <code>loyalty_points</code> from zero and added 50, then added 30, so Asha has 80. Only Asha's document gained the new field; the other six customers still do not have it, and nothing had to be altered in advance.</p>
  <p>Now the Medu Vada. One update can use several operators at once, so the line is appended with <code>$push</code> and the total raised with <code>$inc</code> in the same call. The filter also includes <code>status: "pending"</code> as a guard, so this call can never edit an order that has already been delivered:</p>
  <div class="fx" data-lang="mongo">db.orders.updateOne(
  { _id: 110, status: "pending" },
  { $push: { items: { item: "Medu Vada", qty: 1, unit_price: 60 } },
    $inc:  { amount: 60 } })
db.orders.findOne({ _id: 110 }, { amount: 1, items: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{
  _id: 110,
  amount: 370,
  items: [
    { item: 'Masala Dosa', qty: 2, unit_price: 120 },
    { item: 'Filter Coffee', qty: 1, unit_price: 70 },
    { item: 'Medu Vada', qty: 1, unit_price: 60 }
  ]
}</div>
  <p>The line was added and the total went from 310 to 370 in a single write. Because both changes are in one document, the write is <strong>atomic</strong>: it happens completely or not at all, and no other reader can ever see the new line with the old total. This guarantee covers everything inside one document, including every array in it, and it is the single biggest reason for keeping data that changes together (lines and total) in one document.</p>
  <p>Changing a field <em>inside</em> one particular line needs a way to say "that line". The <strong>positional operator</strong> <code>$</code> does it: match the line in the filter, then write <code>$</code> in the update path, where it stands for "the first array element that the filter matched". Below, Asha adds a third dosa, asks for less sugar in her coffee, and then removes the Medu Vada again with <code>$pull</code>, which deletes every array element matching a condition:</p>
  <div class="fx" data-lang="mongo">db.orders.updateOne({ _id: 110, "items.item": "Masala Dosa" },
                    { $inc: { "items.$.qty": 1, amount: 120 } })
db.orders.updateOne({ _id: 110, "items.item": "Filter Coffee" },
                    { $set: { "items.$.options": ["less sugar"] } })
db.orders.updateOne({ _id: 110 },
                    { $pull: { items: { item: "Medu Vada" } }, $inc: { amount: -60 } })
db.orders.findOne({ _id: 110 }, { amount: 1, items: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{
  _id: 110,
  amount: 430,
  items: [
    { item: 'Masala Dosa', qty: 3, unit_price: 120 },
    {
      item: 'Filter Coffee',
      qty: 1,
      unit_price: 70,
      options: [ 'less sugar' ]
    }
  ]
}</div>
  <p>Traced on order 110: the filter <code>"items.item": "Masala Dosa"</code> matched line 0, so <code>"items.$.qty"</code> meant that line's quantity, which went from 2 to 3, and the total rose by 120 to 490 in the same write. The second update matched the coffee line and gave it an <code>options</code> array. The third removed the Medu Vada line by matching its <code>item</code>, and took the total down by 60 to 430.</p>
  <p><code>$addToSet</code> is the polite version of <code>$push</code>: it adds a value only if it is not already in the array, which makes it safe to repeat. Here Chen's dietary preferences are recorded three times:</p>
  <div class="fx" data-lang="mongo">db.customers.updateOne({ _id: 3 }, { $addToSet: { diets: "vegetarian" } })
db.customers.updateOne({ _id: 3 }, { $addToSet: { diets: "vegetarian" } })   // again
db.customers.updateOne({ _id: 3 }, { $push: { diets: "vegetarian" } })       // $push for comparison
db.customers.findOne({ _id: 3 }, { name: 1, diets: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 0, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ _id: 3, name: 'Chen', diets: [ 'vegetarian', 'vegetarian' ] }</div>
  <p>The first <code>$addToSet</code> created the array with "vegetarian"; the second found the value already present and changed nothing (<code>modifiedCount: 0</code>). <code>$push</code> does not check, so the third call added a duplicate. Use <code>$addToSet</code> for sets of tags or labels, and <code>$push</code> for lists where repeats are meaningful, such as order lines.</p>
  <p>The positional <code>$</code> has an important limit: it updates only the <em>first</em> matching element in each document. Dosa Hut, which is fully vegetarian, wants a <code>veg: true</code> flag on every Masala Dosa and Filter Coffee line. On order 108, both lines match, but:</p>
  <div class="fx" data-lang="mongo">db.orders.updateOne({ _id: 108, "items.item": { $in: ["Masala Dosa", "Filter Coffee"] } },
                    { $set: { "items.$.veg": true } })
db.orders.findOne({ _id: 108 }, { "items.item": 1, "items.veg": 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{
  _id: 108,
  items: [ { item: 'Masala Dosa', veg: true }, { item: 'Filter Coffee' } ]
}</div>
  <p>Only the dosa (line 0) was flagged; the coffee also matched but was skipped. To update <em>every</em> matching element, MongoDB has the filtered positional operator <code>$[identifier]</code> together with an <code>arrayFilters</code> option that says which elements the identifier stands for. (mongomock does not implement <code>arrayFilters</code>, so this command is shown without output.)</p>
  <div class="fx" data-lang="mongo">db.orders.updateMany(
  { restaurant_id: 10 },
  { $set: { "items.$[line].veg": true } },
  { arrayFilters: [ { "line.item": { $in: ["Masala Dosa", "Filter Coffee"] } } ] })</div>
  <p>Here <code>$[line]</code> is a placeholder, and the array filter <code>{ "line.item": { $in: [...] } }</code> says it means "every line whose item is a dosa or a coffee". Run over Dosa Hut's three orders (101, 108 and 110), it would flag one line in 101 and both lines in 108 and 110, reporting <code>matchedCount: 3</code>. The array filter can use any condition on the element, even one unrelated to the main filter, such as <code>{ "line.qty": { $gte: 2 } }</code>.</p>
  <figure class="viz"><svg viewBox="0 0 600 128" width="600">
    <defs><marker id="mb-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="34" width="170" height="54" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/>
    <g font-size="11"><text x="10" y="52">_id: 7, name: "Gita"</text><text x="10" y="68">city: "Pune"</text><text x="10" y="82">signup_date: …</text></g>
    <line x1="170" y1="52" x2="248" y2="28" stroke="currentColor" marker-end="url(#mb-ar)"/><line x1="170" y1="72" x2="248" y2="96" stroke="currentColor" marker-end="url(#mb-ar)"/>
    <text x="176" y="26" font-size="10" class="tg">$set city</text><text x="172" y="120" font-size="10" class="tr">replaceOne</text>
    <rect x="250" y="0" width="200" height="58" rx="6" class="fg sg"/><g font-size="11"><text x="260" y="17">_id: 7, name: "Gita"</text><text x="260" y="33">city: "Mumbai"</text><text x="260" y="49" class="tm">signup_date: … kept</text></g>
    <rect x="250" y="70" width="200" height="40" rx="6" class="fr sr"/><g font-size="11"><text x="260" y="88">_id: 7, city: "Mumbai"</text><text x="260" y="103" class="tr">name, signup_date gone</text></g>
    <text x="465" y="34" font-size="11" class="tg">partial change ✓</text><text x="465" y="94" font-size="11" class="tr">whole doc swapped ✗</text>
  </svg><figcaption>An update with operators changes the named fields; a replacement swaps the whole document, keeping only _id.</figcaption></figure>
  <p>Finally, the most damaging update mistake. Gita moves to Mumbai, and someone writes the new value without an operator. As the figure shows, an update document without <code>$</code> operators means "replace the whole document":</p>
  <div class="fx" data-lang="mongo">db.customers.updateOne({ _id: 7 }, { city: "Mumbai" })     // no $ operator
db.customers.replaceOne({ _id: 7 }, { city: "Mumbai" })
db.customers.findOne({ _id: 7 })</div>
  <div class="fx" data-lang="text">ValueError: update only works with $ operators
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ _id: 7, city: 'Mumbai' }</div>
  <p>The plain <code>updateOne</code> was refused before it reached the database: modern drivers insist that an update document use operators ("update only works with $ operators"). <code>replaceOne</code> exists precisely to replace a document, so it accepted the same content and silently dropped Gita's name and signup date, leaving <code>{ _id: 7, city: 'Mumbai' }</code>. The fix is always <code>updateOne({ _id: 7 }, { $set: { city: "Mumbai" } })</code>; reserve <code>replaceOne</code> for the rare case where you really mean to swap a whole document.</p>

  <h2 id="mb-upsert"><span class="num">09</span>Upserts</h2>
  <p>Every update so far assumed the document already existed. Real systems often do not know. A partner feed sends restaurant details, some for restaurants Biteful already has and some for new ones. A dashboard keeps one counter document per day, which does not exist until the day's first order arrives. The obvious code, "find it; if found, update it, otherwise insert it", is two calls with a gap between them: two app servers can both look, both see nothing, and both insert, leaving two documents for the same day.</p>
  <p>An <strong>upsert</strong> (update + insert) closes that gap by doing both in one server-side step. You pass <code>{ upsert: true }</code> to <code>updateOne</code> or <code>updateMany</code>. If the filter matches, it is a normal update. If nothing matches, the server <strong>inserts</strong> a new document built from the filter's equality conditions plus the update. A companion operator, <code>$setOnInsert</code>, sets fields only in that insert case. It is MongoDB's version of SQL's <code>INSERT … ON CONFLICT DO UPDATE</code>. Think of a hotel reception: "if this guest already has a card, update the room number; if not, open a new card with this name and today's check-in date", where the check-in date is written only when the card is first opened.</p>
  <div class="fx" data-lang="mongo">db.restaurants.updateOne({ _id: 14 }, { $set: { rating: 4.0 } }, { upsert: true })
db.restaurants.updateOne(
  { _id: 15 },
  { $set: { name: "Chaat Corner", city: "Mumbai", cuisine: "Street Food" },
    $setOnInsert: { added_on: ISODate("2026-03-10") } },
  { upsert: true })
db.restaurants.find({ _id: { $gte: 14 } })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: 15, matchedCount: 0, modifiedCount: 0, upsertedCount: 1 }
[
  {
    _id: 14,
    name: 'Momo Magic',
    city: 'Pune',
    cuisine: 'Tibetan',
    rating: 4
  },
  {
    _id: 15,
    name: 'Chaat Corner',
    city: 'Mumbai',
    cuisine: 'Street Food',
    added_on: ISODate('2026-03-10T00:00:00.000Z')
  }
]</div>
  <p>Momo Magic (14) existed, so the first call was a plain update: <code>matchedCount: 1</code>, and the rating was added (the shell shows the double <code>4.0</code> as <code>4</code>; it is still a number). Chaat Corner (15) did not exist, so the second call inserted it: <code>matchedCount: 0</code>, <code>upsertedCount: 1</code> and <code>insertedId: 15</code>. The new document took its <code>_id</code> from the filter, its name, city and cuisine from <code>$set</code>, and <code>added_on</code> from <code>$setOnInsert</code>. Run the same call again next week and <code>added_on</code> stays as it was, while the <code>$set</code> fields are refreshed.</p>
  <p>Upserts shine for counters. The dashboard sends the same call for every new order, and the day's first call creates the document. Here are 2 March's three orders (101 for ₹240, 102 for ₹450 and 103 for ₹520):</p>
  <div class="fx" data-lang="mongo">db.daily_stats.updateOne({ _id: "2026-03-02" }, { $inc: { orders: 1, revenue: 240 } }, { upsert: true })
db.daily_stats.updateOne({ _id: "2026-03-02" }, { $inc: { orders: 1, revenue: 450 } }, { upsert: true })
db.daily_stats.updateOne({ _id: "2026-03-02" }, { $inc: { orders: 1, revenue: 520 } }, { upsert: true })
db.daily_stats.find()</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: '2026-03-02', matchedCount: 0, modifiedCount: 0, upsertedCount: 1 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
[ { _id: '2026-03-02', orders: 3, revenue: 1210 } ]</div>
  <p>The first call matched nothing and inserted <code>{ _id: "2026-03-02", orders: 1, revenue: 240 }</code>, since <code>$inc</code> starts from zero; the next two matched and added to it. The result, 3 orders and ₹1,210, is the same number a <code>GROUP BY</code> over that day would compute, but here it is kept up to date on every write and read instantly. This "store the summary as you go" idea returns as the <em>computed pattern</em> in <a class="xref" data-note="mongo_design">Schema Design</a>.</p>
  <p>Upserts have one sharp edge: they are only as safe as their filter. If the filter cannot match an existing document, every call inserts a new one. Here the filter asks for Chaat Corner with a rating of at least 4, but Chaat Corner has no rating:</p>
  <div class="fx" data-lang="mongo">db.restaurants.updateOne(
  { name: "Chaat Corner", rating: { $gte: 4 } },
  { $set: { city: "Mumbai" } },
  { upsert: true })
db.restaurants.find({ name: "Chaat Corner" }, { name: 1, city: 1 })
db.restaurants.deleteOne({ name: "Chaat Corner", _id: { $type: "objectId" } })   // clean up</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: ObjectId('6aeabdfde2938b600d32e0f2'), matchedCount: 0, modifiedCount: 0, upsertedCount: 1 }
[
  { _id: 15, name: 'Chaat Corner', city: 'Mumbai' },
  {
    _id: ObjectId('6aeabdfde2938b600d32e0f2'),
    name: 'Chaat Corner',
    city: 'Mumbai'
  }
]
{ acknowledged: true, deletedCount: 1 }</div>
  <p>The filter matched nothing, so the upsert <strong>inserted a second Chaat Corner</strong> with a generated ObjectId. Only the equality condition (<code>name</code>) was copied into it; <code>rating: { $gte: 4 }</code> is a condition, not a value, so the new document has no rating either and the same call would insert yet another copy next time. The last line cleans up the duplicate. The rule: upsert on <code>_id</code> or on a field with a unique index. Then, even when two concurrent upserts race to insert, the second insert fails with E11000 and the driver can retry it as an update.</p>

  <h2 id="mb-delete"><span class="num">10</span>Deleting Documents</h2>
  <p>Data also has to go: cancelled orders get purged, test data gets wiped, a customer asks to be removed. <code>deleteOne(filter)</code> removes the first match and <code>deleteMany(filter)</code> removes all matches. The interesting question is what happens to documents that point at the deleted one. In PostgreSQL, Biteful's foreign keys refuse to delete a customer that other rows still reference. In MongoDB, <code>customer_id: 1</code> inside an order is just a number:</p>
  <div class="fx" data-lang="mongo">db.customers.deleteOne({ _id: 1 })
db.orders.countDocuments({ customer_id: 1 })
db.orders.deleteMany({ status: "cancelled" })
db.orders.deleteOne({ _id: 999 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, deletedCount: 1 }
3
{ acknowledged: true, deletedCount: 2 }
{ acknowledged: true, deletedCount: 0 }</div>
  <p>Asha's document was deleted without complaint (<code>deletedCount: 1</code>), yet three orders still carry <code>customer_id: 1</code>. They are now <strong>orphans</strong>: documents whose reference points at something that no longer exists. MongoDB has no foreign keys, so nothing checks references and nothing <strong>cascades</strong> (deletes or updates the dependent documents automatically). The same delete in PostgreSQL:</p>
  <div class="fx" data-lang="sql">DELETE FROM customers WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">ERROR:  update or delete on table "customers" violates foreign key constraint "customers_referred_by_fkey" on table "customers"
DETAIL:  Key (customer_id)=(1) is still referenced from table "customers".</div>
  <p>Postgres refused, because Ben and Chen's <code>referred_by</code> point at Asha (and her orders would have blocked it next). Back in MongoDB, <code>deleteMany</code> removed the two cancelled orders, and deleting an id that does not exist is not an error: it simply reports <code>deletedCount: 0</code>. So in MongoDB, keeping references valid is the application's job: delete or reassign the dependent documents in the same code path (in a transaction if they must agree), or use a <strong>soft delete</strong>, marking the document with something like <code>{ $set: { deleted: true } }</code> instead of removing it.</p>
  <p>There are two ways to remove everything, and they are not the same. <code>deleteMany({})</code> with an empty filter removes every document but keeps the collection, its indexes and its settings. <code>drop()</code> removes the collection itself, indexes included. Think of emptying a cupboard, where the shelves and labels stay, versus carrying the cupboard out of the room:</p>
  <div class="fx" data-lang="mongo">db.orders.createIndex({ customer_id: 1 })
db.orders.countDocuments({})
db.orders.deleteMany({})
db.orders.getIndexes()
db.orders.drop()
db.getCollectionNames()</div>
  <div class="fx" data-lang="text">'customer_id_1'
8
{ acknowledged: true, deletedCount: 8 }
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, key: { customer_id: 1 }, name: 'customer_id_1' }
]
true
[ 'customers', 'daily_stats', 'restaurants' ]</div>
  <p>After <code>deleteMany({})</code> removed the remaining 8 orders, <code>getIndexes()</code> still listed both the <code>_id</code> index and the new <code>customer_id_1</code> index. After <code>drop()</code>, <code>orders</code> no longer appears among the collections at all. A practical habit: an empty filter passed by mistake from code deletes everything with no confirmation, so before any <code>deleteMany</code>, run <code>countDocuments</code> with the same filter and check that the number is what you expect.</p>

  <h2 id="mb-py"><span class="num">11</span>MongoDB from Python</h2>
  <p>Real applications, data pipelines and notebooks talk to MongoDB from code, not from the shell. In Python the official driver is <strong>pymongo</strong>. It uses exactly the same ideas: filters, projections and documents are ordinary Python dictionaries, and method names use snake_case (<code>count_documents</code>, <code>update_one</code>, <code>find_one</code>). Operator keys must be quoted strings such as <code>"$set"</code>, and Python's <code>None</code> stands for <code>null</code>. If mongosh is talking to the shopkeeper face to face, pymongo is phoning in the same order: the same words in a slightly different accent. The code below runs on mongomock, which offers the same interface as pymongo; in real code, the only change is the first line, which would connect to a server. The data is a fresh copy of Biteful, as loaded in section 04:</p>
  <div class="fx" data-lang="py">import mongomock, pandas as pd

client = mongomock.MongoClient()      # real code: MongoClient("mongodb://localhost:27017")
db = client["biteful"]                # same as: use biteful
db.customers.insert_many(customers)   # the section 04 documents,
db.restaurants.insert_many(restaurants)  # written as lists of Python dicts
db.orders.insert_many(orders)

print(db.orders.count_documents({"status": "delivered"}))
for o in db.orders.find({"items.item": "Masala Dosa"}, {"amount": 1}):
    print(o)

res = db.customers.update_one({"_id": 5}, {"$set": {"city": "Pune"}})
print(res.matched_count, res.modified_count)
print(db.customers.find_one({"_id": 5}))</div>
  <div class="fx" data-lang="text">7
{'amount': 240, '_id': 101}
{'amount': 260, '_id': 108}
{'amount': 310, '_id': 110}
1 1
{'_id': 5, 'name': 'Esha', 'signup_date': datetime.datetime(2026, 3, 1, 0, 0), 'city': 'Pune'}</div>
  <p>The count of delivered orders is 7, as in the shell. The <code>for</code> loop iterates over the cursor that <code>find</code> returns, pulling the three Masala Dosa orders one at a time. <code>update_one</code> returns a result object whose <code>matched_count</code> and <code>modified_count</code> are the same two numbers as before, and Esha now has a city. BSON dates arrive as Python <code>datetime</code> objects.</p>
  <p>Analysts usually want a pandas DataFrame, and here the nested shape needs a decision. Orders without their lines are flat and convert directly. For the lines, <code>pd.json_normalize</code> with <code>record_path="items"</code> produces one row per line and copies the listed parent fields (<code>meta</code>) onto each row:</p>
  <div class="fx" data-lang="py">orders = pd.DataFrame(list(db.orders.find({}, {"items": 0})))
print(orders[["_id", "status", "amount", "delivery_minutes"]].head(5))

lines = pd.json_normalize(list(db.orders.find()), record_path="items", meta=["_id", "status"])
print(len(lines))
print(lines[["_id", "item", "qty", "unit_price", "status"]].head(4))</div>
  <div class="fx" data-lang="text">   _id     status  amount  delivery_minutes
0  101  delivered     240              32.0
1  102  delivered     450              41.0
2  103  delivered     520              38.0
3  104  delivered     380               NaN
4  105  cancelled     310               NaN
15
   _id             item  qty  unit_price     status
0  101      Masala Dosa    2         120  delivered
1  102  Chicken Biryani    1         350  delivered
2  102            Raita    2          50  delivered
3  103  Farmhouse Pizza    2         260  delivered</div>
  <p>The orders DataFrame is flat because the projection left out <code>items</code>. Notice that order 104's <code>null</code> and order 105's missing field both became <code>NaN</code>, so the null-versus-missing difference is lost once data reaches pandas. The second table has <strong>15 rows</strong>, one per line, each carrying its order's <code>_id</code> and <code>status</code>: that is exactly SQL's <code>order_items</code> table, rebuilt from the documents. A word of caution, though: <code>pd.DataFrame(list(db.orders.find()))</code> on a million orders ships every field of every document over the network just to compute a few numbers. Totals and groupings belong inside the database, in an aggregation pipeline, which is the next note.</p>
  <p>One mistake hits almost every project that uses generated ids. An ObjectId often travels through a web page or URL as its 24-character string, and the string is not the id:</p>
  <div class="fx" data-lang="py">from bson import ObjectId
oid = db.reviews.insert_one({"restaurant_id": 10, "stars": 5}).inserted_id
as_text = str(oid)                    # e.g. it arrived in a URL: /reviews/&lt;id&gt;
print(type(oid).__name__, len(as_text))
print(db.reviews.find_one({"_id": as_text}))                        # the string
print(db.reviews.find_one({"_id": ObjectId(as_text)}, {"_id": 0}))  # a real ObjectId</div>
  <div class="fx" data-lang="text">ObjectId 24
None
{'restaurant_id': 10, 'stars': 5}</div>
  <p>The review got an ObjectId, 24 hexadecimal characters when written as text. Looking it up with the <em>string</em> returned <code>None</code>, because a string never equals an ObjectId, even when the characters are identical. Wrapping it with <code>ObjectId(...)</code> found the document. The same applies to numbers stored as text (<code>"5"</code> never equals <code>5</code>), which is a common result of loading CSV files without converting types. mongomock itself is also worth knowing for a different reason: it is a convenient way to unit-test code that uses pymongo without running a server, although it does not cover every server feature (it has no transactions, explain plans or <code>arrayFilters</code>), so integration tests still need a real server.</p>

  <h2 id="mb-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Most MongoDB mistakes do not raise errors: the query runs and returns something plausible but wrong. The first group are matching mistakes. <code>{ delivery_minutes: null }</code> also matches documents where the field is missing, so it returned four orders where you might have expected one; use <code>$exists</code> or <code>$type: "null"</code> when the difference matters. Two dot-notation conditions on the same array can be satisfied by two different elements, which wrongly added orders 102 and 108; use <code>$elemMatch</code>. And a filter without a dot, such as <code>{ items: { item: "Raita" } }</code>, is an exact whole-object match that found nothing:</p>
  <div class="fx" data-lang="mongo">// wrong: conditions may be met by different lines → 101, 102, 103, 108, 110
db.orders.find({ "items.qty": { $gte: 2 }, "items.unit_price": { $gte: 100 } })
// right: both conditions on the same line → 101, 103, 110
db.orders.find({ items: { $elemMatch: { qty: { $gte: 2 }, unit_price: { $gte: 100 } } } })</div>
  <p>The second group are writing mistakes. Replacing instead of updating wiped Gita's name and signup date; always use <code>$set</code> for a partial change. An upsert whose filter cannot match (a range condition, a field the document does not have) inserts a duplicate on every call; upsert on <code>_id</code> or a uniquely indexed field. And deleting a referenced document leaves orphans, because nothing cascades; clean up references in the same code path or soft-delete.</p>
  <div class="fx" data-lang="mongo">// wrong: replaces the whole document, keeping only _id
db.customers.replaceOne({ _id: 7 }, { city: "Mumbai" })
// right: changes one field, keeps the rest
db.customers.updateOne({ _id: 7 }, { $set: { city: "Mumbai" } })</div>
  <p>The third group are naming and typing mistakes, all silent. A typo in a collection name (<code>db.order</code>) reads an empty collection, and a typo in a field name (<code>{ $set: { stauts: "delivered" } }</code>) succeeds and adds a new field while <code>status</code> stays unchanged; a schema validator catches the second (<a class="xref" data-note="mongo_design">Schema Design</a>). A date stored as a string, a number stored as text, or an ObjectId passed as its string never match the real thing; convert types when you load data.</p>
  <p>The last group are reading mistakes that show up at scale. Sorting on a field with ties (orders 107 and 108 at ₹260) without a unique tie-breaker makes pages repeat or skip documents; add <code>_id</code> as the last sort key. And <code>skip(n)</code> still walks past n documents; deep pages should use keyset pagination on an indexed key.</p>

  <h2 id="mb-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Database <code>biteful</code>. <code>customers</code> (7): Asha, Chen, Gita in Pune; Ben, Dia, Farah in Mumbai; Esha has no <code>city</code>. <code>restaurants</code> (5): 10 Dosa Hut, 11 Biryani Bros, 12 Pizza Point, 13 Green Bowl, 14 Momo Magic (no rating). <code>orders</code> (10): 101–110, amounts 240, 450, 520, 380, 310, 180, 260, 260, 600, 310; 105 and 107 cancelled, 110 pending; 15 lines embedded in <code>items</code>; 104 has <code>delivery_minutes: null</code>, 105/107/110 have no such field.</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Document</b>: a record of field–value pairs; values may be arrays or embedded documents; max 16 MB.</li>
    <li><b>BSON</b>: MongoDB's typed binary JSON; adds dates (stored in UTC), int/long/double, Decimal128, ObjectId.</li>
    <li><b>_id</b>: mandatory, unique, automatically indexed primary key. <b>ObjectId</b>: 12 bytes = 4-byte time + 5 random + 3-byte counter.</li>
    <li><b>Collection / database</b>: a group of documents / of collections; both created on first write.</li>
    <li><b>Filter</b>: a document of conditions (ANDed). <b>Projection</b>: fields to return, include (1) or exclude (0), not mixed except <code>_id: 0</code>.</li>
    <li><b>Cursor</b>: a lazy handle on a result that fetches documents in batches.</li>
    <li><b>Atomic</b>: a write to one document happens completely or not at all, arrays included.</li>
    <li><b>Upsert</b>: update if matched, otherwise insert the filter's equality fields plus the update.</li>
    <li><b>Orphan</b>: a document whose reference points at a deleted document. <b>Soft delete</b>: mark instead of remove.</li>
  </ul>
  <h3>SQL to MongoDB</h3>
  <table class="tbl">
    <tr><th>SQL</th><th>MongoDB</th></tr>
    <tr><td>table / row / column / primary key</td><td>collection / document / field / <code>_id</code></td></tr>
    <tr><td>child table + JOIN</td><td>embedded array, or <code>$lookup</code></td></tr>
    <tr><td>foreign key</td><td>stored id, not enforced</td></tr>
    <tr><td>NULL</td><td><code>null</code> or missing field</td></tr>
    <tr><td>WHERE / ORDER BY / LIMIT / OFFSET</td><td>filter / <code>sort</code> / <code>limit</code> / <code>skip</code></td></tr>
    <tr><td>INSERT … ON CONFLICT DO UPDATE</td><td><code>updateOne(…, { upsert: true })</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="mongo">db.c.insertOne(doc)                     db.c.insertMany([...], { ordered: false })
db.c.find({ a: 1, b: { $gte: 5 } }, { a: 1, _id: 0 }).sort({ b: -1, _id: 1 }).skip(0).limit(10)
db.c.findOne({ _id: 103 })              db.c.countDocuments({ status: "delivered" })
db.c.find({ "items.item": "Masala Dosa" })                       // any element
db.c.find({ items: { $elemMatch: { qty: { $gte: 2 }, unit_price: { $gte: 100 } } } })
db.c.find({ f: null }) / { f: { $exists: false } } / { f: { $type: "null" } }
db.c.updateOne({ _id: 110 }, { $set: {...}, $inc: {...}, $push: {...}, $pull: {...} })
db.c.updateOne({ _id: 110, "items.item": "X" }, { $inc: { "items.$.qty": 1 } })   // first match
db.c.updateMany({...}, { $set: { "items.$[l].veg": true } }, { arrayFilters: [{ "l.item": "X" }] })
db.c.updateOne({ _id: k }, { $set: {...}, $setOnInsert: {...} }, { upsert: true })
db.c.deleteOne({...})   db.c.deleteMany({...})   db.c.drop()</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>{ f: null }</code> matches null <em>and</em> missing (4 orders, not 1).</li>
    <li>Two dot conditions on one array can hit two different elements; use <code>$elemMatch</code>.</li>
    <li><code>{ items: { item: "Raita" } }</code> is an exact whole-object match.</li>
    <li>Typos in collection or field names create new ones silently.</li>
    <li>Ties need a tie-breaker; deep <code>skip</code> is slow, use keyset paging.</li>
    <li><code>replaceOne</code> wipes unlisted fields; positional <code>$</code> updates only the first match.</li>
    <li>Ordered inserts stop at the first error; nothing rolls back.</li>
    <li>Upsert on a unique key only; deletes never cascade.</li>
    <li>Dates are UTC; ObjectId ≠ its string.</li>
  </ul>

  <h2 id="mb-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a document database, and how is it different from a relational database?</summary><div class="qa-body">A document database stores each record as a self-contained document of fields, which can contain nested objects and arrays, grouped into collections with no fixed columns. A relational database splits data into tables with fixed columns and joins them by keys. Documents make reading or writing one nested thing (an order with its lines) a single atomic operation; relational tables make unplanned joins, constraints and multi-entity consistency easier.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is BSON, and why doesn't MongoDB store plain JSON?</summary><div class="qa-body">BSON is the binary, typed encoding MongoDB uses on disk and over the network. It adds types JSON lacks, such as real dates, 32- and 64-bit integers, doubles, Decimal128 and ObjectId, and stores lengths so the server can skip fields without parsing text. That is what makes date range queries, exact money values and fast field access possible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>_id</code>, and what is inside an ObjectId?</summary><div class="qa-body"><code>_id</code> is every document's mandatory primary key: unique within the collection, automatically indexed, any type except an array. If you omit it, the driver generates an ObjectId: 12 bytes made of a 4-byte timestamp in seconds, 5 random bytes and a 3-byte counter. Because time comes first, sorting by <code>_id</code> roughly sorts by creation time, and the creation time can be read back from the id.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do the SQL terms table, row, column and JOIN map to MongoDB?</summary><div class="qa-body">A table is a collection, a row is a document and a column is a field, except that fields can be missing or nested and documents in one collection can differ in shape. A JOIN is either unnecessary, because the related data is embedded in the document, or done with the <code>$lookup</code> aggregation stage. Foreign keys have no direct equivalent: references are plain stored ids that nothing enforces.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you insert a document with an <code>_id</code> that already exists? What about a batch?</summary><div class="qa-body">The insert fails with an E11000 duplicate-key error, because the <code>_id</code> index is unique. In an <code>insertMany</code>, the default ordered mode stops at the first error, so documents after it are never tried; with <code>ordered: false</code> every document is attempted and all errors are reported at the end. In neither mode are the already-inserted documents rolled back.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>{ f: null }</code>, <code>{ f: { $exists: false } }</code> and <code>{ f: { $type: "null" } }</code>?</summary><div class="qa-body"><code>{ f: null }</code> matches documents where the field is null or missing, like SQL's <code>IS NULL</code>. <code>$exists: false</code> matches only documents where the field is absent. <code>$type: "null"</code> matches only documents where the field is present with the value null. On Biteful's orders they return 4, 3 and 1 orders respectively.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might <code>find({ "items.qty": { $gte: 2 }, "items.unit_price": { $gte: 100 } })</code> return wrong results, and how do you fix it?</summary><div class="qa-body">On an array, each dot-notation condition is checked separately against all elements, so one element can satisfy the first condition and a different element the second. Order 102 matched because its Raita has qty 2 and its biryani costs ₹350. Use <code>$elemMatch</code>, which requires a single element to satisfy all the conditions together.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In what order are <code>sort</code>, <code>skip</code> and <code>limit</code> applied?</summary><div class="qa-body">Always sort first, then skip, then limit, no matter the order you chain them in code. <code>find().limit(3).sort({ amount: -1 })</code> returns the three largest orders, not three arbitrary orders sorted. If the sort key has ties, add a unique field such as <code>_id</code> as a tie-breaker so paging is stable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>skip(100000).limit(20)</code> slow, and what is the alternative?</summary><div class="qa-body">The server still has to walk past and discard the first 100,000 documents before returning 20. Keyset pagination remembers the last sort key of the previous page and asks for the next range, for example <code>{ _id: { $gt: lastId } }</code> with <code>limit(20)</code>, which the index can jump to directly, so every page costs about the same.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>countDocuments</code> vs <code>estimatedDocumentCount</code>?</summary><div class="qa-body"><code>countDocuments(filter)</code> runs the filter and returns an exact count, which can be slow on large collections. <code>estimatedDocumentCount()</code> takes no filter and reads the collection's metadata, so it is instant but can be slightly off, for example after an unclean shutdown. Use the estimate for "roughly how big is this collection" and the exact count for business numbers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does an update's <code>matchedCount: 1, modifiedCount: 0</code> mean?</summary><div class="qa-body">The filter found one document, but the update did not change it, typically because <code>$set</code> wrote the value the field already had or <code>$addToSet</code> added a value already in the array. It is not an error. If <code>matchedCount</code> is 0, the filter found nothing, which often points to a wrong id type or a typo.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>updateOne</code> with <code>$set</code> and <code>replaceOne</code>?</summary><div class="qa-body"><code>$set</code> changes only the named fields and leaves the rest of the document untouched. <code>replaceOne</code> swaps the whole document for the new one, keeping only <code>_id</code>, so any field you did not include is lost. Modern drivers refuse an <code>updateOne</code> without operators precisely to prevent accidental replacement.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the positional operator <code>$</code>, and how does <code>$[identifier]</code> differ?</summary><div class="qa-body"><code>$</code> in an update path stands for the first array element matched by the query filter, so <code>"items.$.qty"</code> changes that line's quantity. <code>$[identifier]</code> together with the <code>arrayFilters</code> option updates every element that satisfies the array filter's condition, which can be unrelated to the main filter. Use <code>$</code> when exactly one element should change and <code>$[x]</code> when several can.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are MongoDB writes atomic?</summary><div class="qa-body">Every write to a single document is atomic, including changes to several fields and arrays inside it, so adding an order line and raising the order total in one <code>updateOne</code> can never be seen half-done. Writes that touch several documents, such as an <code>updateMany</code> or two separate updates, are atomic per document only, unless you wrap them in a multi-document transaction.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an upsert, and when can it create duplicates?</summary><div class="qa-body">An upsert updates the matching document, or, if none matches, inserts a new one built from the filter's equality fields plus the update; <code>$setOnInsert</code> fields are written only on insert. It creates duplicates when the filter cannot match the existing document (for example it contains a range condition or a field the document lacks), or when concurrent upserts race on a field that is not unique. Upsert on <code>_id</code> or a uniquely indexed field.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MongoDB has no foreign keys. What happens when you delete a referenced document, and how do you handle it?</summary><div class="qa-body">The delete succeeds and the documents that referenced it become orphans, still holding the old id; nothing cascades. You handle it in application code: delete or reassign the dependent documents in the same operation (in a transaction if they must stay consistent), soft-delete instead of deleting, or run periodic orphan checks. Good schema design also embeds data that truly belongs to its parent, so it disappears with it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>deleteMany({})</code> vs <code>drop()</code>?</summary><div class="qa-body"><code>deleteMany({})</code> removes every document but keeps the collection with its indexes, validator and other settings, and it deletes documents one by one, which is slow for big collections. <code>drop()</code> removes the collection itself, including its indexes, almost instantly. Use <code>drop()</code> to start from scratch and <code>deleteMany</code> when the collection's configuration must stay.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does looking up a document by an id string from a URL return nothing?</summary><div class="qa-body">When the stored <code>_id</code> is an ObjectId, the 24-character string version of it is a different type, and values of different types never compare equal. Convert it with <code>ObjectId(text)</code> before querying. The same issue appears with numbers stored as strings, typically after a CSV import.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose a document database over a relational one?</summary><div class="qa-body">When records are read and written as a unit, their shape varies, and the main queries are known in advance: orders with lines, product catalogues, user profiles, content and event data. Choose relational when many entities must change together in transactions, when integrity constraints matter most, or when the business will ask unplanned questions that join many entities. Many teams use both, or use PostgreSQL's JSONB for the flexible parts.</div></details>
</main>
`
});
