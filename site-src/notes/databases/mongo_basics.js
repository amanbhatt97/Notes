// notes/databases/mongo_basics.js — Documents & CRUD
Object.assign(TOPIC_CONTENT, {
  "mongo_basics": `<main>
  <h1>Documents &amp; CRUD</h1>
  <div class="where"><span>Databases</span><span>MongoDB</span><span>Documents &amp; CRUD</span></div>
  <p class="lead">The SQL notes stored Biteful, our small food-delivery company, in four linked tables. One order (with its items, and soon their options) was spread over all of them and glued back with joins on every read. MongoDB stores that order as <strong>one nested document</strong> instead. This note rebuilds the <em>same</em> Biteful data as documents and teaches Create, Read, Update and Delete (CRUD) one need at a time: why a document, what BSON and <code>_id</code> are, where documents live, how SQL words translate, then insert, find, sort, update, upsert, delete and Python. Every command ran on a real <strong>MongoDB 8.0.23</strong> server (a private test instance), every SQL comparison ran on <strong>PostgreSQL 17</strong>, and every output shown is the real output.</p>

  <h2 id="mb-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="mb-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="140" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="80" y="41" text-anchor="middle" font-size="12">SQL notes</text><text x="80" y="58" text-anchor="middle" class="tm" font-size="10">Biteful in 4 tables</text>
<line x1="150" y1="45" x2="178" y2="45" stroke="currentColor" marker-end="url(#mb-a0)"/>
<rect x="180" y="20" width="140" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="250" y="41" text-anchor="middle" font-size="12" font-weight="700">Documents &amp; CRUD</text><text x="250" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="320" y1="45" x2="348" y2="45" stroke="currentColor" marker-end="url(#mb-a0)"/>
<rect x="350" y="20" width="140" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="420" y="41" text-anchor="middle" font-size="12">Aggregation</text><text x="420" y="58" text-anchor="middle" class="tm" font-size="10">group, join, reshape</text>
<line x1="490" y1="45" x2="518" y2="45" stroke="currentColor" marker-end="url(#mb-a0)"/>
<rect x="520" y="20" width="130" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="585" y="41" text-anchor="middle" font-size="12">Schema Design</text><text x="585" y="58" text-anchor="middle" class="tm" font-size="10">embed, index, scale</text>
<text x="20" y="110" class="tm" font-size="10.5">Same Biteful data in both worlds: 7 customers, 5 restaurants, 10 orders, 15 order lines.</text>
<text x="20" y="128" class="tm" font-size="10.5">SQL: order_items is its own table. MongoDB: the 15 lines live inside the 10 order documents.</text>
<text x="20" y="146" class="tm" font-size="10.5">This note: store and change documents. Next: compute across them. Then: decide their shape.</text>
</svg><figcaption>The MongoDB group of the Databases track. It comes after the SQL notes and reuses their running example.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: Biteful in tables</b><span><a class="xref" data-note="sql_relational">Relational Model</a> split Biteful into <code>customers</code>, <code>restaurants</code>, <code>orders</code> and <code>order_items</code>, linked by keys. <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a> queried them, <a class="xref" data-note="sql_joins">JOINs</a> glued them back, <a class="xref" data-note="sql_modeling">Data Modeling</a> explained why facts are split, and <a class="xref" data-note="sql_transactions">Transactions</a> kept multi-table writes safe. <a class="xref" data-note="db_types">Types of Databases</a> named the document store as one alternative.</span></li>
    <li><b>This note adds: the document model and CRUD</b><span>An order becomes one JSON-like document with its items inside. You learn what that document is made of (BSON, <code>_id</code>), where it lives (collections, databases), how SQL words map, and every basic operation: insert, find with filters and projections, sort and paging, update operators, upserts, delete, and the same from Python.</span></li>
    <li><b>Leads to: <a class="xref" data-note="mongo_aggregation">Aggregation Pipeline</a></b><span><code>find</code> can return orders but cannot add them up per restaurant or fetch a customer's name from another collection. The pipeline does both. Then <a class="xref" data-note="mongo_design">Schema Design</a> answers the question this note keeps postponing: what should go inside a document, and what should not?</span></li>
  </ol>

  <h2 id="mb-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it, and its limit raises the next question. All examples use Biteful.</p>
  <ol class="story">
    <li><b>Document</b><span>Q: one order with a varying list of items (and options on some items) is spread over 4 SQL tables and needs a 4-table join to show one page; options would need a 5th table. Can we store the order as one thing? → Yes: one JSON-like document with an <code>items</code> array inside. But JSON has no dates, no integer vs decimal, and nothing that names the document…</span></li>
    <li><b>BSON &amp; _id</b><span>Q: how is a document stored, typed and identified? → BSON adds real dates, int/long/double/Decimal128 and ObjectId; every document has a unique <code>_id</code> (an ObjectId if you don't give one). One document exists now. Where do we keep thousands of them?</span></li>
    <li><b>Collections &amp; databases</b><span>Q: where do documents live? → a collection groups documents (like a table, but shapes may differ), a database groups collections; both appear on first write. Biteful's 4 tables become 3 collections. We know the parts; how do the SQL words we already know translate?</span></li>
    <li><b>SQL ↔ Mongo terms</b><span>Q: which SQL idea maps to what? → table→collection, row→document, column→field, JOIN→embedding or <code>$lookup</code>, and when documents fit worse than tables. Words are not data. How do we put Biteful in?</span></li>
    <li><b>Insert</b><span>Q: how do documents get in? → <code>insertOne</code>/<code>insertMany</code>; duplicate <code>_id</code> fails with E11000; ordered batches stop at the first error. 22 documents are in. How do we ask questions of them?</span></li>
    <li><b>Find, filters &amp; projections</b><span>Q: "delivered orders of ₹300 or more", "orders containing Masala Dosa" → a filter document with operators (<code>$gte</code>, <code>$in</code>, <code>$or</code>, <code>$exists</code>, <code>$elemMatch</code>), traced order by order; a projection picks fields. The matches come back in no promised order, all at once…</span></li>
    <li><b>Sort, limit &amp; pages</b><span>Q: "the 3 biggest orders", "page 2" → <code>sort</code>, <code>limit</code>, <code>skip</code>, keyset paging, counts, cursors. We can read anything. But orders change: a delivery time arrives, a customer adds a vada…</span></li>
    <li><b>Update operators</b><span>Q: how do we change part of a document without rewriting it? → <code>$set</code>, <code>$inc</code>, <code>$push</code>, <code>$pull</code>, <code>$addToSet</code>, positional <code>$</code> and <code>arrayFilters</code>, all atomic inside one document. But what if the document might not exist yet?</span></li>
    <li><b>Upserts</b><span>Q: "update it, or create it if missing" in one safe step → <code>upsert: true</code> with <code>$setOnInsert</code>; daily counters. Data also has to go…</span></li>
    <li><b>Delete</b><span>Q: how do we remove documents, and what happens to things that point at them? → <code>deleteOne</code>/<code>deleteMany</code>/<code>drop</code>; no foreign keys, so nothing cascades and orphans stay. Real apps do all this from code…</span></li>
    <li><b>pymongo</b><span>Q: how does Python (and pandas) talk to MongoDB? → the same filters as dicts, snake_case methods, <code>json_normalize</code> turns the 10 orders back into the 15-row order_items table. What it still cannot do: group, sum per restaurant, join names → <a class="xref" data-note="mongo_aggregation">Aggregation</a>.</span></li>
  </ol>

  <h2 id="mb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">MongoDB: Documents &amp; CRUD</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why documents</div>
        <ul>
          <li><b>Need</b> — one Biteful order = 4 tables + joins; options = a 5th table</li>
          <li><b>Document</b> — the whole order as one nested JSON-like object</li>
          <li><b>Win</b> — one read, one atomic write, no join for data stored together</li>
          <li>💡 SQL = linked registers; Mongo = file of self-contained bill copies</li>
          <li><b>Design rule</b> — shape documents around the queries you will run</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">BSON &amp; _id</div>
        <ul>
          <li><b>BSON</b> — binary JSON + date, int, long, double, Decimal128, ObjectId</li>
          <li><b>Dates</b> — stored in UTC: 12:10 IST → 06:40Z</li>
          <li><b>_id</b> — required, unique, always indexed; ObjectId if omitted</li>
          <li><b>ObjectId</b> — 4 B time + 5 B random + 3 B counter</li>
          <li>⚠ <b>16 MB</b> per document</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Collections &amp; terms</div>
        <ul>
          <li><b>Collection</b> ≈ table; shapes may differ (Esha has no city)</li>
          <li><b>Created on first write</b>; a typo makes a new empty one</li>
          <li><b>table / row / column</b> → collection / document / field</li>
          <li><b>JOIN</b> → embed or <code>$lookup</code>; <b>GROUP BY</b> → <code>$group</code></li>
          <li>Biteful: 4 tables → 3 collections (items embedded)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Insert</div>
        <ul>
          <li><b>insertOne / insertMany</b> — batch = one round trip</li>
          <li><b>Duplicate _id</b> → <code>E11000 duplicate key error</code></li>
          <li><b>Ordered</b> stops at first error; <code>ordered: false</code> continues</li>
          <li><b>Snapshot</b> — unit_price copied into each line</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Find</div>
        <ul>
          <li><b>find(filter, projection)</b>; fields side by side = AND</li>
          <li><code>$gt $gte $lt $lte $ne $in $nin $or $exists $type</code></li>
          <li>⚠ <code>{ f: null }</code> = null <em>or missing</em> (4 orders vs 1)</li>
          <li><b>Arrays</b> — <code>"items.item"</code> = any element</li>
          <li>⚠ two array conditions → <code>$elemMatch</code> (5 vs 3 orders)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sort &amp; pages</div>
        <ul>
          <li><b>sort → skip → limit</b>, whatever order you chain them</li>
          <li><b>Tie-breaker</b> — 107 and 108 both ₹260: add <code>_id</code></li>
          <li><b>Keyset</b> — <code>{ _id: { $gt: last } }</code> beats deep <code>skip</code></li>
          <li><b>countDocuments</b> exact · <b>estimatedDocumentCount</b> metadata</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Update &amp; upsert</div>
        <ul>
          <li><code>$set $unset $inc $push $pull $addToSet</code></li>
          <li><b>$</b> — first matched element; <b>$[x] + arrayFilters</b> — all that match</li>
          <li><b>matched vs modified</b> — found vs actually changed</li>
          <li><b>Upsert</b> — update or insert; <code>$setOnInsert</code></li>
          <li>⚠ <b>replaceOne</b> wipes unlisted fields</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Delete &amp; Python</div>
        <ul>
          <li><b>deleteOne / deleteMany</b>; <b>drop()</b> also removes indexes</li>
          <li>⚠ <b>No foreign keys</b> — deleting Asha leaves 3 orphan orders</li>
          <li><b>pymongo</b> — dicts in/out; <code>update_one</code>, <code>count_documents</code></li>
          <li><b>json_normalize</b> — 10 orders → 15 item rows</li>
          <li>⚠ ObjectId vs its string never match</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mb-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="mb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Order, Four Tables</span><span class="rm-sub">Why a document</span></div></div>
      <div class="rm-item rm-done" data-target="mb-doc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">BSON &amp; _id</span><span class="rm-sub">Types and identity</span></div></div>
      <div class="rm-item rm-done" data-target="mb-coll"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Collections &amp; Databases</span><span class="rm-sub">Where documents live</span></div></div>
      <div class="rm-item rm-done" data-target="mb-terms"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">SQL ↔ MongoDB Terms</span><span class="rm-sub">And when documents fit</span></div></div>
      <div class="rm-item rm-done" data-target="mb-insert"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Insert</span><span class="rm-sub">Biteful as 22 documents</span></div></div>
      <div class="rm-item rm-done" data-target="mb-find"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Find, Filters &amp; Projections</span><span class="rm-sub">Operators traced, arrays</span></div></div>
      <div class="rm-item rm-done" data-target="mb-sort"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sort, Limit &amp; Pages</span><span class="rm-sub">Ties, keyset, cursors</span></div></div>
      <div class="rm-item rm-done" data-target="mb-update"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Update Operators</span><span class="rm-sub">$set, $inc, $push, arrayFilters</span></div></div>
      <div class="rm-item rm-done" data-target="mb-upsert"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Upserts</span><span class="rm-sub">Update or create, counters</span></div></div>
      <div class="rm-item rm-done" data-target="mb-delete"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Delete</span><span class="rm-sub">No cascade, orphans</span></div></div>
      <div class="rm-item rm-done" data-target="mb-py"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">From Python</span><span class="rm-sub">pymongo, pandas, mongomock</span></div></div>
      <div class="rm-item rm-done" data-target="mb-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One order, every operation</span></div></div>
      <div class="rm-item rm-done" data-target="mb-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ones that fail silently</span></div></div>
      <div class="rm-item rm-done" data-target="mb-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="mb-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="mb-why"><span class="num">01</span>One Order, Four Tables: Why a Document</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the SQL notes, the app's "order details" page for order 102 (Ben's biryani) needs four tables: the order row, Ben's name from <code>customers</code>, "Biryani Bros" from <code>restaurants</code>, and two lines from <code>order_items</code>. Now Biteful wants item <em>options</em> ("extra cheese", "less sugar"), and only some items have them. Every change makes one order more spread out. Can we store an order as the one thing it is?</p>
  </div>
  <h3>The running example: Biteful, as you know it</h3>
  <p>Biteful is the food-delivery company from the SQL notes: 7 customers (Asha, Ben, Chen, Dia, Esha, Farah, Gita), 5 restaurants (Dosa Hut, Biryani Bros, Pizza Point, Green Bowl, Momo Magic), 10 orders (101–110) and 15 order lines. The quirks carry over: Esha has no city, Gita has never ordered, Momo Magic has no rating, orders 105 and 107 are cancelled and 110 is pending, order 104 was delivered but its delivery time was never recorded, and orders 107 and 108 both cost ₹260. Here is order 102's page, built the SQL way:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, r.name AS restaurant,
       o.status, o.amount, i.item, i.qty, i.unit_price
FROM orders o
JOIN customers   c ON c.customer_id   = o.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
JOIN order_items i ON i.order_id      = o.order_id
WHERE o.order_id = 102;</div>
  <table class="tbl out"><caption>PostgreSQL 17: order 102 needs 4 tables and 3 joins</caption><tr><th>order_id</th><th>customer</th><th>restaurant</th><th>status</th><th>amount</th><th>item</th><th>qty</th><th>unit_price</th></tr><tr><td>102</td><td>Ben</td><td>Biryani Bros</td><td>delivered</td><td>450.00</td><td>Chicken Biryani</td><td>1</td><td>350.00</td></tr><tr><td>102</td><td>Ben</td><td>Biryani Bros</td><td>delivered</td><td>450.00</td><td>Raita</td><td>2</td><td>50.00</td></tr></table>
  <p>Three joins to rebuild one order, and the result has the order's facts (Ben, Biryani Bros, delivered, 450) <em>repeated on every line</em>. Now add options. Options belong to an order line, an order line can have zero or many, so normal-form SQL needs a fifth table:</p>
  <div class="fx" data-lang="sql">CREATE TABLE order_item_options (
  order_id INT, item TEXT, option TEXT,
  PRIMARY KEY (order_id, item, option),
  FOREIGN KEY (order_id, item) REFERENCES order_items (order_id, item)
);
INSERT INTO order_item_options VALUES
  (103, 'Farmhouse Pizza', 'extra cheese'), (103, 'Farmhouse Pizza', 'thin crust'),
  (108, 'Filter Coffee',   'less sugar'),   (109, 'Chicken Biryani', 'extra spicy');
SELECT i.order_id, i.item, i.qty, x.option
FROM order_items i
LEFT JOIN order_item_options x ON x.order_id = i.order_id AND x.item = i.item
WHERE i.order_id IN (103, 108)
ORDER BY i.order_id, i.item, x.option;</div>
  <table class="tbl out"><caption>PostgreSQL 17: options need a 5th table, and the page now repeats lines</caption><tr><th>order_id</th><th>item</th><th>qty</th><th>option</th></tr><tr><td>103</td><td>Farmhouse Pizza</td><td>2</td><td>extra cheese</td></tr><tr><td>103</td><td>Farmhouse Pizza</td><td>2</td><td>thin crust</td></tr><tr><td>108</td><td>Filter Coffee</td><td>2</td><td>less sugar</td></tr><tr><td>108</td><td>Masala Dosa</td><td>1</td><td>NULL</td></tr></table>
  <p>The pizza line appears twice (one row per option) and the Masala Dosa line gets a NULL because it has no options. The data is correct, but one order is now spread over five tables, and the app must stitch rows back into a nested shape (order → lines → options) every time it shows a page.</p>
  <h3>The same order as one document</h3>
  <p>MongoDB's answer: if the order, its lines and their options are always read together, <strong>store them together</strong>, as one nested object called a <strong>document</strong>. It looks exactly like a JSON object or a Python dict. A value can itself be a list (an <strong>array</strong>) or another object, so the lines sit inside the order and the options sit inside their line:</p>
  <div class="fx" data-lang="js">// order 103 as ONE document: lines inside the order, options inside their line
{
  _id: 103,
  customer_id: 3,                 // Chen
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
  <p>Read it top to bottom: a number <code>_id</code> (the order id), two numbers that point at a customer and a restaurant (we keep those as references for now), a real date, a status, the stored bill total, the delivery time, and an array with one line, which has its own array of two options. A line without options simply has no <code>options</code> field. No fifth table, no NULL padding, no repeated rows.</p>
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
  </svg><figcaption>Order 103. SQL rebuilds it with joins across five tables; MongoDB keeps the lines and options inside the order. Customer and restaurant stay as references (ids) for now.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A SQL database is like a kirana shop's set of <strong>linked registers</strong>: a customer register, a bill register, an item register, an options register, all tied by numbers. To see one bill you flip between four books. MongoDB is like a <strong>file of self-contained carbon copies</strong>: each bill copy has every line, quantity, price and "less sugar" note written on it. Reading one bill is instant. But "how many Masala Dosas did we sell this month?" means flipping through every copy, which is the job of the next note.</p>
  </div>
  <p>Step by step, what it costs to show order 103:</p>
  <table class="tbl">
    <tr><th>Step</th><th>SQL (5 tables)</th><th>MongoDB (1 document)</th></tr>
    <tr><td>1</td><td>Find row 103 in <code>orders</code></td><td>Find document 103 in <code>orders</code></td></tr>
    <tr><td>2</td><td>Find its line in <code>order_items</code></td><td>Done: lines are inside it</td></tr>
    <tr><td>3</td><td>Find 2 rows in <code>order_item_options</code></td><td>Done: options are inside the line</td></tr>
    <tr><td>4</td><td>Rebuild the nesting in app code</td><td>Done: it is already nested</td></tr>
    <tr><td>Change "add a line and raise the total"</td><td>INSERT + UPDATE in two tables, inside a <a class="xref" data-note="sql_transactions">transaction</a></td><td>One update to one document, always atomic (section 08)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MongoDB</strong> is a <strong>document database</strong> (one kind of NoSQL database, see <a class="xref" data-note="db_types">Types of Databases</a>). Each record is a <strong>document</strong>: a set of field–value pairs whose values may be nested objects and arrays. There are no fixed columns, and data stored inside one document needs no join.</p>
  </div>
  <div class="cards">
    <div><b>Nested data fits</b><p>An order, its lines and their options are one object, read and written as a unit.</p></div>
    <div><b>Shapes may vary</b><p>Only some lines have options; only some customers have a referrer. No NULL columns needed.</p></div>
    <div><b>Maps to code</b><p>A document is a Python dict or a JS object. Adding a field needs no <code>ALTER TABLE</code>.</p></div>
  </div>
  <div class="callout trap"><span class="label">Trap: "schemaless" is not "no design"</span>
    <p>In SQL you design tables around the <em>data</em> (normalise, see <a class="xref" data-note="sql_modeling">Data Modeling</a>) and can write almost any query later. In MongoDB you design documents around the <em>queries you will run</em>. Embedding lines in orders makes "show order 103" one read, but makes "Masala Dosas sold per day" harder. That trade-off is the whole of <a class="xref" data-note="mongo_design">Schema Design</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: BSON and _id.</b> The document above is written like JSON, but JSON has no date type (only strings), does not know 2 from 2.0 or exact money, and nothing in it says which document is which once there are millions. How is a document really stored and identified?</div>

  <h2 id="mb-doc"><span class="num">02</span>The Document Up Close: BSON &amp; _id</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Order 101 was placed at 12:10 IST. In plain JSON that is a string like <code>"2026-03-02 12:10"</code>, and you cannot ask "orders after noon" of a string without parsing it. Prices need exact decimals, counts need integers. And when two documents look alike, what makes each one <em>that</em> document?</p>
  </div>
  <p>MongoDB does not store JSON text. It stores <strong>BSON</strong> (Binary JSON): the same structure, but every value carries a type tag, and the format adds the types JSON lacks. Here is one scratch document with a real date, a text date, two kinds of number, a 64-bit integer and an exact decimal. The insert omits <code>_id</code> on purpose.</p>
  <div class="fx" data-lang="js">db.scratch.insertOne({
  ordered_at: ISODate("2026-03-02T12:10:00+05:30"),   // a real date, written in IST
  as_text:    "2026-03-02 12:10",                       // just a string
  qty: 2,  price: 120.5,
  big:   NumberLong("9000000000"),
  money: NumberDecimal("120.50")
})
db.scratch.findOne()</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: ObjectId('6ad6b97195bb71a7f482fd52') }
{
  _id: ObjectId('6ad6b97195bb71a7f482fd52'),
  ordered_at: ISODate('2026-03-02T06:40:00.000Z'),
  as_text: '2026-03-02 12:10',
  qty: 2,
  price: 120.5,
  big: Long('9000000000'),
  money: Decimal128('120.50')
}</div>
  <p>Three things to read off the real output. (1) The server added an <code>_id</code> we never wrote, of type <strong>ObjectId</strong>. (2) We wrote 12:10 at +05:30 and it came back as <code>06:40:00.000Z</code>: BSON dates are stored in <strong>UTC</strong> (the <code>Z</code>), the same instant shown in another clock. <code>as_text</code> stayed a plain string, useless for date maths. (3) <code>Long(...)</code> and <code>Decimal128(...)</code> show that the type travelled with the value; <code>2</code> and <code>120.5</code> are an int and a double.</p>
  <table class="tbl">
    <tr><th>BSON type</th><th>Example in Biteful</th><th>Why JSON is not enough</th></tr>
    <tr><td>date</td><td><code>ordered_at</code></td><td>JSON has only strings; range queries and date grouping need a real date</td></tr>
    <tr><td>int / long / double</td><td><code>qty: 2</code>, <code>rating: 4.5</code></td><td>JSON has one "number"; databases care about exact width</td></tr>
    <tr><td>Decimal128</td><td>money, if you need paise to be exact</td><td>doubles round: 0.1 + 0.2 ≠ 0.3</td></tr>
    <tr><td>ObjectId</td><td>auto <code>_id</code> of a review</td><td>a compact, unique, time-ordered id</td></tr>
    <tr><td>array / object</td><td><code>items</code>, <code>options</code></td><td>same as JSON, plus stored lengths so the server can skip fields fast</td></tr>
  </table>
  <h3>_id and ObjectId</h3>
  <p>Every document must have a field called <code>_id</code>. It is the <strong>primary key</strong>: unique within its collection and automatically indexed (an <strong>index</strong> is a sorted lookup structure that finds a value without reading every document). For Biteful we reuse the SQL ids (customers 1–7, restaurants 10–14, orders 101–110), so <code>_id: 103</code> <em>is</em> order 103. When you don't supply one, the driver (the client library) makes an ObjectId.</p>
  <figure class="viz"><svg viewBox="0 0 600 80" width="600">
    <rect x="0" y="10" width="192" height="34" class="fb sb"/><text x="96" y="32" text-anchor="middle">4 B · timestamp (s)</text>
    <rect x="192" y="10" width="240" height="34" class="fv sb"/><text x="312" y="32" text-anchor="middle">5 B · random</text>
    <rect x="432" y="10" width="144" height="34" class="ft st"/><text x="504" y="32" text-anchor="middle">3 B · counter</text>
    <text x="0" y="66" font-size="11" class="tm">time comes first → sorting by _id ≈ sorting by creation time; made client-side, no central counter</text>
  </svg><figcaption>ObjectId: 12 bytes, shown as 24 hex characters.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An ObjectId is like a railway PNR that each booking counter prints itself, without phoning head office: part of it is the booking time, part is the counter's own random code, part is a running count. Two counters never clash, and you can read roughly when a ticket was booked.</p>
  </div>
  <p>Traced: the first 8 hex digits are the seconds since 1970. This code reads the time out of the ObjectId the server just generated, then builds one whose first 8 digits are <code>69a530c0</code> (hex for 1,772,433,600 seconds, which is order 101's moment), and finally drops the scratch collection:</p>
  <div class="fx" data-lang="js">const doc = db.scratch.findOne()
doc._id.getTimestamp()
ObjectId("69a530c0a1b2c3d4e5f60718").getTimestamp()
db.scratch.drop()</div>
  <div class="fx" data-lang="text">ISODate('2026-10-20T00:44:33.000Z')
ISODate('2026-03-02T06:40:00.000Z')
true</div>
  <p>The first date is when this page's commands were run (your value will differ). The second is exactly 2026-03-02 06:40 UTC = 12:10 IST, order 101's time, decoded from the id alone. <code>drop()</code> printed <code>true</code>: the scratch collection is gone.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>BSON</strong>: the binary, typed encoding MongoDB uses on disk and on the network. <strong>_id</strong>: the mandatory, unique, indexed primary key of a document; any type except an array. <strong>ObjectId</strong>: a 12-byte id = 4-byte timestamp + 5 random bytes + 3-byte counter.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the 16 MB limit and UTC dates</span>
    <p>A single document is capped at <strong>16 MB</strong>. Embedding a handful of lines in an order is tiny; embedding every order a customer will ever place in the customer document is a list that grows forever and eventually hits the cap (measured in <a class="xref" data-note="mongo_design">Schema Design</a>). Second trap: dates come back in UTC. A report that prints <code>06:40</code> for a lunch order is not wrong data, it is the wrong clock; convert to <code>Asia/Kolkata</code> when displaying or grouping by day.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: collections and databases.</b> We can build and identify one document. Biteful has 22 of them (7 customers, 5 restaurants, 10 orders), and a customer is not an order. Where do documents live, and how are different kinds kept apart?</div>

  <h2 id="mb-coll"><span class="num">03</span>Collections &amp; Databases: Where Documents Live</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In SQL, a row lives in a table that you created first with <code>CREATE TABLE</code>, and the table lives in a database. A customer document and an order document should not sit in one pile. What plays the role of a table, and where is the <code>CREATE</code> step?</p>
  </div>
  <p>A <strong>collection</strong> is a named group of documents, the MongoDB version of a table. A <strong>database</strong> is a named group of collections, as in SQL. Two differences matter from day one. First, documents in one collection do not have to share fields: Esha's customer document simply has no <code>city</code>, Ben's has a <code>referred_by</code> and Asha's does not. Second, there is no create step: <code>use biteful</code> only selects a name, and the database and collection come into existence on the <strong>first write</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cupboard (database) with labelled box files (collections). A box file appears the moment you drop the first form into a new label, and the forms inside can be different versions of the form: some have an extra "referred by" box filled, some leave "city" blank.</p>
  </div>
  <p>Watched step by step on the real server: list databases, write one document, list again, then make a one-letter typo in the collection name.</p>
  <div class="fx" data-lang="js">use biteful
show dbs
db.orders.insertOne({ _id: 1, note: "the first write creates the database and the collection" })
show dbs
show collections
db.order.find()
db.order.countDocuments()
db.dropDatabase()</div>
  <div class="fx" data-lang="text">switched to db biteful
admin   112.00 KiB
config  312.00 KiB
local    26.36 MiB
{ acknowledged: true, insertedId: 1 }
admin    112.00 KiB
biteful    8.00 KiB
config   312.00 KiB
local     26.36 MiB
orders
0
{ ok: 1, dropped: 'biteful' }</div>
  <p>Traced. The first <code>show dbs</code> has no <code>biteful</code>: <code>use biteful</code> created nothing. After one <code>insertOne</code>, <code>biteful</code> exists and <code>show collections</code> lists <code>orders</code>. Then the typo: <code>db.order.find()</code> (no <em>s</em>) printed <strong>nothing at all</strong> and <code>countDocuments()</code> said 0. No error: MongoDB treats <code>order</code> as a different, empty collection. The last line drops the database so the real load in section 05 starts clean. The <code>admin</code>, <code>config</code> and <code>local</code> databases are MongoDB's own bookkeeping.</p>
  <p>For Biteful the four SQL tables become <strong>three</strong> collections, because order lines move inside orders:</p>
  <table class="tbl">
    <tr><th>SQL table (rows)</th><th>MongoDB collection (documents)</th><th>What changed</th></tr>
    <tr><td><code>customers</code> (7)</td><td><code>customers</code> (7)</td><td>NULL city → field absent (Esha); NULL <code>referred_by</code> → field absent</td></tr>
    <tr><td><code>restaurants</code> (5)</td><td><code>restaurants</code> (5)</td><td>Momo Magic's NULL rating → field absent</td></tr>
    <tr><td><code>orders</code> (10)</td><td><code>orders</code> (10)</td><td>gains an <code>items</code> array</td></tr>
    <tr><td><code>order_items</code> (15)</td><td>—</td><td>the 15 lines live inside the 10 orders</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Collection</strong>: a group of documents inside a database, created implicitly on first insert (or explicitly with <code>db.createCollection</code>, needed for options such as validation). <strong>Database</strong>: a group of collections. <strong>Namespace</strong>: <code>database.collection</code>, e.g. <code>biteful.orders</code>, the name you see in error messages.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: typos create, they don't fail</span>
    <p><code>db.order</code>, <code>db.Orders</code> and <code>db.orders</code> are three different collections. A read from the wrong one returns nothing; a write to it silently creates it. The same goes for field names (section 13). When a query "returns nothing", check <code>show collections</code> first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SQL ↔ MongoDB terms.</b> We now have the pieces: document, field, _id, collection, database. You already know their SQL cousins. A translation table, plus the honest answer to "when should Biteful <em>not</em> use documents?", saves a lot of confusion before we load data.</div>

  <h2 id="mb-terms"><span class="num">04</span>SQL ↔ MongoDB Terms</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You can read <code>SELECT name FROM customers WHERE city = 'Pune'</code> without thinking. Which MongoDB word replaces each part, which SQL ideas have no direct twin, and is MongoDB simply "better SQL"?</p>
  </div>
  <p>Most ideas carry over; only the names change. The ones that do <em>not</em> carry over (JOIN, foreign keys, enforced schema) are exactly where the design work moves.</p>
  <table class="tbl">
    <tr><th>SQL</th><th>MongoDB</th><th>On Biteful</th></tr>
    <tr><td>Database</td><td>Database</td><td><code>biteful</code></td></tr>
    <tr><td>Table</td><td>Collection</td><td><code>orders</code></td></tr>
    <tr><td>Row</td><td>Document</td><td>order 103</td></tr>
    <tr><td>Column</td><td>Field (may be missing, may be nested)</td><td><code>status</code>, <code>items.qty</code></td></tr>
    <tr><td>Primary key</td><td><code>_id</code></td><td><code>_id: 103</code></td></tr>
    <tr><td>Child table + JOIN</td><td>Embedded array (no join), or <code>$lookup</code></td><td>lines in <code>items</code>; customer name via <a class="xref" data-note="mongo_aggregation">$lookup</a></td></tr>
    <tr><td>Foreign key</td><td>A stored id that nothing enforces</td><td><code>customer_id: 3</code> (section 10)</td></tr>
    <tr><td><code>NULL</code></td><td><code>null</code> <em>or</em> the field is absent</td><td>104's <code>delivery_minutes: null</code> vs 105's missing field</td></tr>
    <tr><td><code>SELECT … WHERE</code></td><td><code>find(filter, projection)</code></td><td>section 06</td></tr>
    <tr><td><code>ORDER BY / LIMIT / OFFSET</code></td><td><code>sort / limit / skip</code></td><td>section 07</td></tr>
    <tr><td><code>INSERT / UPDATE / DELETE</code></td><td><code>insertOne / updateOne / deleteOne</code> (+ <code>Many</code>)</td><td>sections 05, 08, 10</td></tr>
    <tr><td><code>INSERT … ON CONFLICT DO UPDATE</code></td><td><code>updateOne(…, { upsert: true })</code></td><td>section 09</td></tr>
    <tr><td><code>GROUP BY</code></td><td><code>$group</code> stage</td><td><a class="xref" data-note="mongo_aggregation">Aggregation</a></td></tr>
    <tr><td>Index</td><td>Index (B-tree, same idea)</td><td><a class="xref" data-note="mongo_design">Schema Design</a></td></tr>
    <tr><td><code>CHECK</code>, <code>NOT NULL</code>, types</td><td>Optional <code>$jsonSchema</code> validator</td><td><a class="xref" data-note="mongo_design">Schema Design</a></td></tr>
    <tr><td>Transaction</td><td>Single-document writes always atomic; multi-document transactions on replica sets</td><td>section 08; <a class="xref" data-note="mongo_design">Schema Design</a></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tailor keeps each customer's measurements on one card: chest, sleeve, and whatever odd extra a customer needs ("left shoulder lower"). Cards differ, and each is read whole: documents. A bank branch cannot work like that: a transfer must change two accounts and the day's ledger together, or not at all, and auditors ask questions nobody planned: tables.</p>
  </div>
  <h3>When documents fit, and when they don't</h3>
  <p>A quick test, applied to two Biteful features:</p>
  <table class="tbl">
    <tr><th>Question</th><th>Order with lines and options</th><th>Wallet top-up + payment ledger</th></tr>
    <tr><td>Is one record read as a whole unit?</td><td>Yes: the order page</td><td>No: wallet, ledger, order</td></tr>
    <tr><td>Do records have different shapes?</td><td>Yes: some lines have options</td><td>No: same columns every time</td></tr>
    <tr><td>Must several records change together?</td><td>Rarely (all inside one order)</td><td>Always (debit and credit)</td></tr>
    <tr><td>Are the queries known in advance?</td><td>Mostly: show, list, update</td><td>No: finance asks new questions monthly</td></tr>
    <tr><td>Verdict</td><td><strong>Documents fit</strong></td><td><strong>Relational fits</strong></td></tr>
  </table>
  <div class="cards">
    <div><b>Good fit</b><p>Data read as a unit with varying shape: orders with lines, menus, product catalogs, user profiles, content, event logs.</p><small>Shape changes often; scale-out needed</small></div>
    <div><b>Poor fit</b><p>Many entities updated together in one transaction: ledgers, inventory + payments.</p><small>Relational integrity matters more</small></div>
    <div><b>Poor fit</b><p>Ad-hoc analytics joining many entities in unplanned ways.</p><small>SQL or a data warehouse</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Query-driven design</strong>: list the questions the app asks most often and shape documents so each is answered by reading one document or one simple range. <strong>Normalisation</strong> (SQL) instead stores each fact once and joins when needed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: outdated slogans</span>
    <p>"MongoDB has no transactions" is outdated: multi-document transactions exist since 4.0. "Postgres can't store JSON" is wrong too: JSONB does (compared in <a class="xref" data-note="mongo_design">Schema Design</a>). In interviews, give a reason, not a slogan: documents when data is read as a unit and the shape varies; relational when many entities change together or the queries are unplanned.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: insert.</b> We have the vocabulary and the verdict for orders. The <code>biteful</code> database is still empty. How do the 22 documents get in, and what happens when one of them clashes?</div>

  <h2 id="mb-insert"><span class="num">05</span>Insert: Biteful as Documents</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Nothing can be queried until it is stored. SQL needed <code>CREATE TABLE</code> then <code>INSERT</code>. MongoDB has no create step, so what does an insert look like, how do we load many documents at once, and what stops two documents claiming the same <code>_id</code>?</p>
  </div>
  <p>Two commands do the work. <code>insertOne(doc)</code> adds one document. <code>insertMany([doc, doc, …])</code> adds a batch in one network round trip, much faster than many single inserts. This is the complete Biteful load used for the rest of this note (and reused by the next two). Compare each document with the SQL rows: same values, but Esha has no <code>city</code>, Momo Magic no <code>rating</code>, only Ben, Chen and Farah have <code>referred_by</code>, order 104 has <code>delivery_minutes: null</code> (delivered, time not recorded), and orders 105, 107 and 110 have no <code>delivery_minutes</code> at all (never delivered).</p>
  <div class="fx" data-lang="js">use biteful
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
  <div class="fx" data-lang="text">switched to db biteful
{
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
  <p><code>acknowledged: true</code> means the server confirmed each write. <code>insertedIds</code> maps each position in your array (<code>'0'</code>, <code>'1'</code>, …) to the <code>_id</code> stored; since we supplied ids, they are 1–7, 10–14 and 101–110. Three collections now exist. Notice that each line copies its <code>unit_price</code>: the price paid on that day, a <strong>snapshot</strong> that must not change when the menu price changes next month.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Dropping forms into box files. Each form needs a unique token number (<code>_id</code>); a second form with a token already in the box is rejected at the counter.</p>
  </div>
  <p>Now the failure cases. First a second customer with <code>_id: 1</code>; then a batch with a duplicate in the middle, once in the default <em>ordered</em> mode and once with <code>ordered: false</code>. The <code>try … catch</code> just prints the error's name and how many documents got in.</p>
  <div class="fx" data-lang="js">db.customers.insertOne({ _id: 1, name: "Asha again" })</div>
  <div class="fx" data-lang="text">Uncaught 
MongoServerError: E11000 duplicate key error collection: biteful.customers index: _id_ dup key: { _id: 1 }</div>
  <div class="fx" data-lang="js">try { db.t.insertMany([{ _id: 1 }, { _id: 1 }, { _id: 2 }]) } catch (e) { print(e.name, "inserted:", e.insertedCount) }
db.t.countDocuments()
db.t.drop()
try { db.t.insertMany([{ _id: 1 }, { _id: 1 }, { _id: 2 }], { ordered: false }) } catch (e) { print(e.name, "inserted:", e.insertedCount) }
db.t.countDocuments()
db.t.drop()</div>
  <div class="fx" data-lang="text">MongoBulkWriteError inserted: 1
1
true
MongoBulkWriteError inserted: 2
2
true</div>
  <p>The single insert failed with <strong>E11000</strong>, the duplicate-key error, naming the collection (<code>biteful.customers</code>), the index (<code>_id_</code>) and the clashing value. Traced for the batch <code>[{_id: 1}, {_id: 1}, {_id: 2}]</code>:</p>
  <table class="tbl">
    <tr><th>Document</th><th>Ordered (default)</th><th>Unordered</th></tr>
    <tr><td>{ _id: 1 }</td><td>inserted</td><td>inserted</td></tr>
    <tr><td>{ _id: 1 }</td><td>E11000 → <strong>stop</strong></td><td>E11000 → skip, carry on</td></tr>
    <tr><td>{ _id: 2 }</td><td>never tried</td><td>inserted</td></tr>
    <tr><td>Count afterwards</td><td><strong>1</strong></td><td><strong>2</strong></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>insertOne / insertMany</strong>: add documents; the collection is created if missing. <strong>E11000</strong>: duplicate-key error from any unique index (the <code>_id</code> index is always unique). <strong>Ordered insert</strong>: stop at the first error. <strong>Unordered</strong>: attempt every document, report all errors at the end.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no rollback</span>
    <p>Neither mode undoes the documents inserted before the error: the batch is not a transaction. If a load must be all-or-nothing, wrap it in a transaction or load into a fresh collection and swap. For bulk loads where a few bad rows should not stop the rest (CSV imports, API syncs), use <code>ordered: false</code> and log the errors.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: find.</b> All of Biteful is stored. The ops team asks: "which delivered orders were ₹300 or more?", "which orders never got a delivery time?", "which orders contain a Masala Dosa?". How do we ask a collection a question?</div>

  <h2 id="mb-find"><span class="num">06</span>Find: Filters &amp; Projections</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In SQL you write the condition as text after <code>WHERE</code> and list columns after <code>SELECT</code>. MongoDB has no SQL text. How do we say "city is Pune", "amount at least 300", "contains a Masala Dosa", and "only give me the name"?</p>
  </div>
  <p>The command is <code>find(filter, projection)</code>. The <strong>filter</strong> is itself a document that describes the documents you want: <code>{ city: "Pune" }</code> means "city equals Pune". The optional <strong>projection</strong> lists fields to return: <code>1</code> includes, <code>0</code> excludes. An empty filter <code>{}</code> matches everything. <code>_id</code> comes back unless you exclude it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A filter is a search form at a library counter: you write "City: Pune" in one box and leave the others blank. The projection is telling the clerk "photocopy only the Name line, not the whole card".</p>
  </div>
  <div class="fx" data-lang="js">db.customers.find({ city: "Pune" }, { name: 1, _id: 0 })</div>
  <div class="fx" data-lang="text">[ { name: 'Asha' }, { name: 'Chen' }, { name: 'Gita' } ]</div>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE city = 'Pune' ORDER BY customer_id;</div>
  <table class="tbl out"><caption>PostgreSQL 17: the same question, the same 3 names</caption><tr><th>name</th></tr><tr><td>Asha</td></tr><tr><td>Chen</td></tr><tr><td>Gita</td></tr></table>
  <h3>Operators, traced order by order</h3>
  <p>For anything other than "equals", put an <strong>operator</strong> (a keyword starting with <code>$</code>) inside the field's value. Several fields side by side in one filter must <em>all</em> hold (an implicit AND).</p>
  <table class="tbl">
    <tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
    <tr><td><code>$eq $ne</code></td><td>= and ≠ (<code>{ a: 5 }</code> is short for <code>$eq</code>)</td><td><code>{ status: { $ne: "cancelled" } }</code></td></tr>
    <tr><td><code>$gt $gte $lt $lte</code></td><td>&gt; ≥ &lt; ≤</td><td><code>{ amount: { $gte: 300 } }</code></td></tr>
    <tr><td><code>$in $nin</code></td><td>in / not in a list</td><td><code>{ status: { $in: ["cancelled", "pending"] } }</code></td></tr>
    <tr><td><code>$or $and $nor $not</code></td><td>logic across conditions</td><td><code>{ $or: [ {…}, {…} ] }</code></td></tr>
    <tr><td><code>$exists $type</code></td><td>field present? of which BSON type?</td><td><code>{ city: { $exists: false } }</code></td></tr>
    <tr><td><code>$regex</code></td><td>text pattern</td><td><code>{ name: { $regex: /^G/ } }</code></td></tr>
  </table>
  <p>First, the filter <code>{ status: "delivered", amount: { $gte: 300 } }</code> by hand on all 10 orders. Both tests must be true:</p>
  <table class="tbl">
    <tr><th>order</th><th>status</th><th>status = delivered?</th><th>amount</th><th>amount ≥ 300?</th><th>kept</th></tr>
    <tr><td>101</td><td>delivered</td><td>yes</td><td>240</td><td>no</td><td>—</td></tr>
    <tr><td>102</td><td>delivered</td><td>yes</td><td>450</td><td>yes</td><td><strong>✓</strong></td></tr>
    <tr><td>103</td><td>delivered</td><td>yes</td><td>520</td><td>yes</td><td><strong>✓</strong></td></tr>
    <tr><td>104</td><td>delivered</td><td>yes</td><td>380</td><td>yes</td><td><strong>✓</strong></td></tr>
    <tr><td>105</td><td>cancelled</td><td>no</td><td>310</td><td>yes</td><td>—</td></tr>
    <tr><td>106</td><td>delivered</td><td>yes</td><td>180</td><td>no</td><td>—</td></tr>
    <tr><td>107</td><td>cancelled</td><td>no</td><td>260</td><td>no</td><td>—</td></tr>
    <tr><td>108</td><td>delivered</td><td>yes</td><td>260</td><td>no</td><td>—</td></tr>
    <tr><td>109</td><td>delivered</td><td>yes</td><td>600</td><td>yes</td><td><strong>✓</strong></td></tr>
    <tr><td>110</td><td>pending</td><td>no</td><td>310</td><td>yes</td><td>—</td></tr>
  </table>
  <p>Prediction: 102, 103, 104, 109. The real run, followed by an <code>$in</code>, an <code>$or</code>, and <code>findOne</code> (first match as a single document, or <code>null</code>):</p>
  <div class="fx" data-lang="js">db.orders.find({ status: "delivered", amount: { $gte: 300 } }, { status: 1, amount: 1 })
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
  <p>The first result matches the hand trace. <code>$in</code> found the three non-delivered orders. <code>$or</code> takes a <em>list</em> of filters and keeps a document if any one holds: 101, 108, 110 are Dosa Hut (restaurant 10), 103 and 109 cost more than ₹500. <code>findOne</code> returned order 106 as one document (no array brackets), and <code>null</code> when nothing costs under ₹100.</p>
  <h3>NULL in documents: null or missing?</h3>
  <p>SQL has one NULL. Documents have two ways to "have no value": the field is there with <code>null</code> (order 104: delivered, time not recorded), or the field is absent (105, 107, 110: never delivered). Which ones does each filter find?</p>
  <div class="fx" data-lang="js">db.orders.find({ delivery_minutes: null }, { status: 1, delivery_minutes: 1 })
db.orders.find({ delivery_minutes: { $exists: false } }, { _id: 1 })
db.orders.find({ delivery_minutes: { $type: "null" } }, { _id: 1 })
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
  <div class="fx" data-lang="sql">SELECT order_id, status, delivery_minutes FROM orders WHERE delivery_minutes IS NULL ORDER BY order_id;</div>
  <table class="tbl out"><caption>PostgreSQL 17: SQL has one NULL, so the same 4 orders</caption><tr><th>order_id</th><th>status</th><th>delivery_minutes</th></tr><tr><td>104</td><td>delivered</td><td>NULL</td></tr><tr><td>105</td><td>cancelled</td><td>NULL</td></tr><tr><td>107</td><td>cancelled</td><td>NULL</td></tr><tr><td>110</td><td>pending</td><td>NULL</td></tr></table>
  <table class="tbl">
    <tr><th>Filter</th><th>Meaning</th><th>Biteful orders</th></tr>
    <tr><td><code>{ delivery_minutes: null }</code></td><td>null <strong>or</strong> missing</td><td>104, 105, 107, 110 (same as SQL <code>IS NULL</code>)</td></tr>
    <tr><td><code>{ delivery_minutes: { $exists: false } }</code></td><td>field missing only</td><td>105, 107, 110</td></tr>
    <tr><td><code>{ delivery_minutes: { $type: "null" } }</code></td><td>explicit null only</td><td>104</td></tr>
  </table>
  <p>The same rule found Esha, whose customer document has no <code>city</code> at all.</p>
  <h3>Projections</h3>
  <div class="fx" data-lang="js">db.restaurants.find({ city: "Mumbai" }, { name: 1, rating: 1, _id: 0 })
db.restaurants.find({ _id: 14 }, { cuisine: 0, city: 0 })
db.restaurants.find({}, { name: 1, city: 0 })</div>
  <div class="fx" data-lang="text">[
  { name: 'Biryani Bros', rating: 4.2 },
  { name: 'Green Bowl', rating: 4.2 }
]
[ { _id: 14, name: 'Momo Magic' } ]
Uncaught 
MongoServerError[Location31254]: Cannot do exclusion on field city in inclusion projection</div>
  <p>An inclusion projection returns only the listed fields (plus <code>_id</code> unless excluded). An exclusion projection returns everything else: Momo Magic without <code>cuisine</code> and <code>city</code>, and with no <code>rating</code> because it never had one. Mixing 1 and 0 (other than <code>_id: 0</code>) is an error.</p>
  <h3>Reaching inside arrays</h3>
  <p>"Which orders contain a Masala Dosa?" There is no top-level <code>item</code> field; it is inside <code>items</code>. <strong>Dot notation</strong> reaches in: <code>"items.item"</code> means "the item field of the items" (the quotes are needed because of the dot). Through an array, the condition is true if <strong>any</strong> element matches. A number picks a position: <code>"items.0.item"</code> is the first line.</p>
  <div class="fx" data-lang="js">db.orders.find({ "items.item": "Masala Dosa" }, { _id: 1 })
db.orders.find({ "items.options": "less sugar" }, { _id: 1 })
db.orders.find({ "items.0.item": "Masala Dosa" }, { _id: 1 })
db.orders.find({ items: { $size: 2 } }, { _id: 1 })</div>
  <div class="fx" data-lang="text">[ { _id: 101 }, { _id: 108 }, { _id: 110 } ]
[ { _id: 108 } ]
[ { _id: 101 }, { _id: 108 }, { _id: 110 } ]
[
  { _id: 102 },
  { _id: 104 },
  { _id: 108 },
  { _id: 109 },
  { _id: 110 }
]</div>
  <p>Masala Dosa is in orders 101, 108 and 110, the same three orders whose SQL join caused "fan-out" in <a class="xref" data-note="sql_joins">JOINs</a>; here it is one plain filter. Only order 108 has a "less sugar" option, and the query did not care that most lines have no <code>options</code> field. In all three orders the dosa happens to be the first line. Five orders have exactly two lines (<code>$size</code> takes an exact number, not a range).</p>
  <div class="callout pred"><span class="label">Predict the output</span>
    <p>Which orders have a line with qty ≥ 2 <em>and</em> unit_price ≥ 100 <em>on that same line</em>? Check the data: 101 (2 dosas at 120), 103 (2 pizzas at 260), 110 (2 dosas at 120). Now predict what the first query below returns.</p>
  </div>
  <div class="fx" data-lang="js">db.orders.find({ "items.qty": { $gte: 2 }, "items.unit_price": { $gte: 100 } }, { _id: 1 })
db.orders.find({ items: { $elemMatch: { qty: { $gte: 2 }, unit_price: { $gte: 100 } } } }, { _id: 1 })</div>
  <div class="fx" data-lang="text">[
  { _id: 101 },
  { _id: 102 },
  { _id: 103 },
  { _id: 108 },
  { _id: 110 }
]
[ { _id: 101 }, { _id: 103 }, { _id: 110 } ]</div>
  <p>The first query wrongly adds 102 and 108. Trace order 102, lines <code>[Chicken Biryani qty 1 × 350, Raita qty 2 × 50]</code>: "does <em>any</em> line have qty ≥ 2?" yes, the Raita; "does <em>any</em> line have unit_price ≥ 100?" yes, the Biryani. Each condition was satisfied by a <em>different</em> line. Order 108 fails the same way (2 coffees at 70, 1 dosa at 120). <code>$elemMatch</code> forces all conditions onto one element, giving exactly 101, 103, 110.</p>
  <figure class="viz"><svg viewBox="0 0 620 160" width="620">
    <text x="0" y="14" font-size="11" class="tm">order 102 items</text>
    <rect x="0" y="22" width="200" height="30" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="10" y="42" font-size="11">Chicken Biryani  qty 1  <tspan class="tg">₹350</tspan></text>
    <rect x="0" y="58" width="200" height="30" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="10" y="78" font-size="11">Raita  <tspan class="tg">qty 2</tspan>  ₹50</text>
    <text x="220" y="42" font-size="11">without $elemMatch:</text><text x="220" y="58" font-size="11" class="tm">qty ≥ 2 → Raita ✓, price ≥ 100 → Biryani ✓</text><text x="220" y="76" font-size="11" class="tr">→ order 102 matches (wrong)</text>
    <text x="0" y="114" font-size="11" class="tm">order 103 items</text>
    <rect x="0" y="122" width="200" height="30" rx="5" class="fg sg"/><text x="10" y="142" font-size="11">Farmhouse Pizza <tspan class="tg">qty 2 · ₹260</tspan></text>
    <text x="220" y="124" font-size="11">with $elemMatch: both tests on the <tspan class="tb">same</tspan> line</text><text x="220" y="142" font-size="11" class="tg">→ 101, 103, 110 only</text>
  </svg><figcaption>Dot-notation conditions are checked against the array separately; $elemMatch ties them to one element.</figcaption></figure>
  <p>Projection can also reach in. <code>{ "items.$": 1 }</code> returns only the first line that the filter matched:</p>
  <div class="fx" data-lang="js">db.orders.find({ "items.item": "Filter Coffee" }, { "items.$": 1 })
db.orders.find({ items: { item: "Raita" } }, { _id: 1 })</div>
  <div class="fx" data-lang="text">[
  {
    _id: 108,
    items: [
      {
        item: 'Filter Coffee',
        qty: 2,
        unit_price: 70,
        options: [ 'less sugar' ]
      }
    ]
  },
  {
    _id: 110,
    items: [ { item: 'Filter Coffee', qty: 1, unit_price: 70 } ]
  }
]</div>
  <p>Orders 108 and 110 came back with just their coffee line. The second query printed <strong>nothing</strong>: <code>{ items: { item: "Raita" } }</code> without a dot asks for a line that is <em>exactly</em> the object <code>{ item: "Raita" }</code>, with no other fields. Order 102's Raita line also has <code>qty</code> and <code>unit_price</code>, so it is not an exact match.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Filter</strong>: a document of conditions; top-level conditions are ANDed. <strong>Projection</strong>: which fields to return; include (1) or exclude (0), not both except <code>_id: 0</code>. <strong>Dot notation</strong>: a path into nested fields, <code>"items.qty"</code>; through an array it means "any element". <strong>$elemMatch</strong>: at least one array element satisfies all the given conditions together.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: three silent mismatches</span>
    <p>(1) <code>{ f: null }</code> also matches missing fields: 4 orders, not 1. (2) Two dot conditions on one array can be satisfied by two different elements: 5 orders instead of 3. (3) <code>{ items: { … } }</code> without a dot is a whole-object exact match: 0 orders. None of them raises an error.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sort, limit and pages.</b> We can pick any documents and any fields, but the results came back in whatever order the server read them, and all at once. The app needs "the 3 biggest orders", "newest first" and "page 2 of 4 per page", without shipping every order to Python to sort it there.</div>

  <h2 id="mb-sort"><span class="num">07</span>Sort, Limit &amp; Pages</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><code>find</code> promises no order. "Top 3 orders by amount" needs sorting; "show 4 per page" needs cutting; "how many delivered?" needs a count, not a list. Doing this in Python means pulling every document over the network first. Can the server do it?</p>
  </div>
  <p>Three methods chain after <code>find</code>: <code>sort({ field: 1 })</code> ascending or <code>-1</code> descending (several keys apply left to right, like <code>ORDER BY a, b DESC</code>), <code>limit(n)</code> keeps the first n, <code>skip(n)</code> throws away the first n.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A stack of exam sheets. Sort = arrange by marks. Skip 4 = set the first 4 aside. Limit 4 = pick up the next 4. A teacher always sorts first, whatever order you shouted the instructions in, and MongoDB does the same.</p>
  </div>
  <div class="fx" data-lang="js">db.orders.find({}, { amount: 1 }).sort({ amount: -1 }).limit(3)
db.orders.find({}, { amount: 1 }).limit(3).sort({ amount: -1 })     // limit written first
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
  <p>Traced. (1) Sorted by amount descending: 600, 520, 450, then cut to 3. (2) <code>limit</code> written <em>before</em> <code>sort</code> gives the same answer: the server always applies sort → skip → limit. (3) Ascending with a tie-breaker: 180, 240, then orders 107 and 108 <strong>tie at ₹260</strong>; <code>_id: 1</code> as a second key fixes their order (107 first). Without it, the server may return them either way, and a page boundary between them can show one order twice or never. (4) Newest first by <code>ordered_at</code>: 110 (Mar 8) then 109.</p>
  <h3>Pages, counts and cursors</h3>
  <div class="fx" data-lang="js">db.orders.find({}, { _id: 1 }).sort({ _id: 1 }).skip(4).limit(4)
db.orders.find({ _id: { $gt: 104 } }, { _id: 1 }).sort({ _id: 1 }).limit(4)
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
  <p>Page 2 at 4 per page, two ways. <code>skip(4).limit(4)</code> reads 101–104, throws them away, returns 105–108. <strong>Keyset pagination</strong> remembers the last id of page 1 (104) and asks for <code>_id &gt; 104</code>: the index jumps straight there. <code>countDocuments</code> counted the 7 delivered orders by running the filter; <code>estimatedDocumentCount</code> read the collection's metadata (10) without looking at documents. Finally, <code>find</code> returns a <strong>cursor</strong>, a lazy pointer: each <code>next()</code> pulled one more document.</p>
  <table class="tbl out"><caption>Why keyset wins on deep pages (20 per page)</caption>
    <tr><th>Page</th><th>skip/limit reads</th><th>keyset reads</th></tr>
    <tr><td>1</td><td>20</td><td>20</td></tr>
    <tr><td>50</td><td>1,000 (980 thrown away)</td><td>20</td></tr>
    <tr><td>5,000</td><td>100,000</td><td>20</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>sort / skip / limit</strong>: server-side ordering and cutting, always applied in that order. <strong>Cursor</strong>: a lazy result handle that fetches documents in batches. <strong>countDocuments(filter)</strong>: exact count. <strong>estimatedDocumentCount()</strong>: whole-collection count from metadata. <strong>Keyset pagination</strong>: page by a range on an indexed sort key instead of <code>skip</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ties and deep skips</span>
    <p>Sort on a non-unique field (amount, date) without a unique tie-breaker and paging can repeat or lose documents (107 and 108). <code>skip(100000)</code> still walks 100,000 documents. And without <code>sort</code>, no order is promised at all: the "natural" order you see can change after updates.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: update operators.</b> We can read anything, in any order. But Biteful's data changes all day: order 106's delivery time is corrected, Asha earns loyalty points, she adds a Medu Vada to pending order 110. How do we change part of a document without rewriting all of it?</div>

  <h2 id="mb-update"><span class="num">08</span>Update Operators</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In SQL, adding an item to order 110 is an <code>INSERT</code> into <code>order_items</code> plus an <code>UPDATE</code> of <code>orders.amount</code>, two statements that need a <a class="xref" data-note="sql_transactions">transaction</a> to stay consistent. In MongoDB the line and the total are in the same document. How do we change one field, add to an array, or edit one line inside it, safely?</p>
  </div>
  <p><code>updateOne(filter, update)</code> changes the first match, <code>updateMany(filter, update)</code> every match. The <code>update</code> is a document of <strong>update operators</strong> saying <em>how</em> to change named fields; every field you do not mention is left alone.</p>
  <table class="tbl">
    <tr><th>Operator</th><th>Does</th><th>Biteful example</th></tr>
    <tr><td><code>$set</code> / <code>$unset</code></td><td>set / remove a field (dots allowed)</td><td><code>{ $set: { delivery_minutes: 26 } }</code></td></tr>
    <tr><td><code>$inc</code></td><td>add to a number (starts at 0 if missing)</td><td><code>{ $inc: { loyalty_points: 50 } }</code></td></tr>
    <tr><td><code>$push</code></td><td>append to an array</td><td><code>{ $push: { items: { … } } }</code></td></tr>
    <tr><td><code>$addToSet</code></td><td>append only if not already present</td><td><code>{ $addToSet: { "items.$.options": "less sugar" } }</code></td></tr>
    <tr><td><code>$pull</code></td><td>remove matching array elements</td><td><code>{ $pull: { items: { item: "Medu Vada" } } }</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Correcting a form with a pen versus tearing it up and writing a new one. Operators are the pen: change one box, keep the rest. A replacement (end of this section) is the new form: every box you did not write again is blank.</p>
  </div>
  <h3>$set and $inc</h3>
  <p>Mongosh prints each write result over several lines; on this page short results are joined onto one line.</p>
  <div class="fx" data-lang="js">db.orders.updateOne({ _id: 106 }, { $set: { delivery_minutes: 26 } })
db.orders.updateOne({ _id: 106 }, { $set: { delivery_minutes: 26 } })   // again
db.customers.updateOne({ _id: 1 }, { $inc: { loyalty_points: 50 } })
db.customers.updateOne({ _id: 1 }, { $inc: { loyalty_points: 30 } })
db.customers.findOne({ _id: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 0, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ _id: 1, name: 'Asha', city: 'Pune', signup_date: ISODate('2026-01-05T00:00:00.000Z'), loyalty_points: 80 }</div>
  <p>The first <code>$set</code> found 106 (<code>matchedCount: 1</code>) and changed 25 → 26 (<code>modifiedCount: 1</code>). The identical second one found it but changed nothing (<code>modifiedCount: 0</code>), which is not an error. <code>$inc</code> created <code>loyalty_points</code> from 0 (+50), then added 30: Asha has 80. Only Asha's document gained the field; the other six customers still don't have it.</p>
  <h3>$push and $inc in one atomic write</h3>
  <p>Asha adds a Medu Vada (₹60) to her pending order 110. The filter includes <code>status: "pending"</code> as a guard, so a delivered order can never be edited by this call.</p>
  <div class="fx" data-lang="js">db.orders.updateOne(
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
  <p>One call appended the line <em>and</em> raised the total from 310 to 370. Because both changes are in one document, the write is <strong>atomic</strong>: no reader can ever see the new line with the old total. In SQL this was two statements in a transaction.</p>
  <h3>One line inside the array: $, $addToSet, $pull</h3>
  <p>To change a field <em>inside</em> a particular line, match the line in the filter and write <code>$</code> in the update path. <code>$</code> means "the first element the filter matched".</p>
  <div class="fx" data-lang="js">db.orders.updateOne(
  { _id: 110, "items.item": "Masala Dosa" },
  { $inc: { "items.$.qty": 1, amount: 120 } })
db.orders.updateOne({ _id: 110, "items.item": "Filter Coffee" }, { $addToSet: { "items.$.options": "less sugar" } })
db.orders.updateOne({ _id: 110, "items.item": "Filter Coffee" }, { $addToSet: { "items.$.options": "less sugar" } })
db.orders.updateOne({ _id: 110 }, { $pull: { items: { item: "Medu Vada" } }, $inc: { amount: -60 } })
db.orders.findOne({ _id: 110 }, { amount: 1, items: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 0, upsertedCount: 0 }
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
  <p>Traced on order 110. (1) <code>"items.item": "Masala Dosa"</code> matched line 0, so <code>"items.$.qty"</code> became 2 → 3 and the total 370 + 120 = 490 in the same write. (2) <code>$addToSet</code> created the coffee line's <code>options</code> array with "less sugar". (3) The same call again: <code>modifiedCount: 0</code>, because the value was already there (a second <code>$push</code> would have added a duplicate). (4) <code>$pull</code> removed the Medu Vada line by matching its fields, and <code>$inc: -60</code> took the total to 430.</p>
  <h3>Every matching line: $[identifier] with arrayFilters</h3>
  <p>Dosa Hut is fully vegetarian and wants a <code>veg: true</code> flag on every Masala Dosa and Filter Coffee line in its orders. <code>$</code> is not enough, because it updates only the <em>first</em> matching line per document:</p>
  <div class="fx" data-lang="js">db.orders.updateOne(
  { _id: 108, "items.item": { $in: ["Masala Dosa", "Filter Coffee"] } },
  { $set: { "items.$.veg": true } })
db.orders.findOne({ _id: 108 }, { items: 1 })
db.orders.updateMany(
  { restaurant_id: 10 },
  { $set: { "items.$[line].veg": true } },
  { arrayFilters: [ { "line.item": { $in: ["Masala Dosa", "Filter Coffee"] } } ] })
db.orders.find({ restaurant_id: 10 }, { "items.item": 1, "items.veg": 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{
  _id: 108,
  items: [
    { item: 'Masala Dosa', qty: 1, unit_price: 120, veg: true },
    {
      item: 'Filter Coffee',
      qty: 2,
      unit_price: 70,
      options: [ 'less sugar' ]
    }
  ]
}
{ acknowledged: true, insertedId: null, matchedCount: 3, modifiedCount: 3, upsertedCount: 0 }
[
  { _id: 101, items: [ { item: 'Masala Dosa', veg: true } ] },
  {
    _id: 108,
    items: [
      { item: 'Masala Dosa', veg: true },
      { item: 'Filter Coffee', veg: true }
    ]
  },
  {
    _id: 110,
    items: [
      { item: 'Masala Dosa', veg: true },
      { item: 'Filter Coffee', veg: true }
    ]
  }
]</div>
  <p>The positional <code>$</code> on order 108 flagged only the dosa (line 0), although the coffee also matched. <code>$[line]</code> names a placeholder, and <code>arrayFilters</code> says which elements it stands for: here "lines whose item is a dosa or a coffee". <code>updateMany</code> over Dosa Hut's three orders (101, 108, 110) then flagged every such line, two in 108 and two in 110. arrayFilters can also use conditions unrelated to the main filter, such as <code>{ "line.qty": { $gte: 2 } }</code>.</p>
  <h3>The replacement trap</h3>
  <figure class="viz"><svg viewBox="0 0 600 128" width="600">
    <defs><marker id="mb-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="34" width="170" height="54" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/>
    <g font-size="11"><text x="10" y="52">_id: 7, name: "Gita"</text><text x="10" y="68">city: "Pune"</text><text x="10" y="82">signup_date: …</text></g>
    <line x1="170" y1="52" x2="248" y2="28" stroke="currentColor" marker-end="url(#mb-ar)"/><line x1="170" y1="72" x2="248" y2="96" stroke="currentColor" marker-end="url(#mb-ar)"/>
    <text x="176" y="26" font-size="10" class="tg">$set city</text><text x="172" y="120" font-size="10" class="tr">replaceOne</text>
    <rect x="250" y="0" width="200" height="58" rx="6" class="fg sg"/><g font-size="11"><text x="260" y="17">_id: 7, name: "Gita"</text><text x="260" y="33">city: "Mumbai"</text><text x="260" y="49" class="tm">signup_date: … kept</text></g>
    <rect x="250" y="70" width="200" height="40" rx="6" class="fr sr"/><g font-size="11"><text x="260" y="88">_id: 7, city: "Mumbai"</text><text x="260" y="103" class="tr">name, signup_date gone</text></g>
    <text x="465" y="34" font-size="11" class="tg">partial change ✓</text><text x="465" y="94" font-size="11" class="tr">whole doc swapped ✗</text>
  </svg><figcaption>No $ operator means replacement: everything except _id is overwritten.</figcaption></figure>
  <div class="fx" data-lang="js">db.customers.updateOne({ _id: 7 }, { city: "Mumbai" })
db.customers.replaceOne({ _id: 7 }, { city: "Mumbai" })
db.customers.findOne({ _id: 7 })</div>
  <div class="fx" data-lang="text">Uncaught 
MongoInvalidArgumentError: Update document requires atomic operators
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ _id: 7, city: 'Mumbai' }</div>
  <p>Gita moves to Mumbai. Modern <code>updateOne</code> refuses a plain document ("requires atomic operators"). <code>replaceOne</code> accepts it and silently drops her name and signup date.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Update operators</strong> (<code>$set</code>, <code>$inc</code>, …) change only the named fields. <strong>Positional <code>$</code></strong>: the first array element matched by the filter. <strong><code>$[x]</code> + arrayFilters</strong>: every element matching the filter named <code>x</code>. <strong>matchedCount / modifiedCount</strong>: documents found / actually changed. <strong>Atomic</strong>: a write to one document is all-or-nothing, including every array inside it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: replace, and positional surprises</span>
    <p>Always use <code>$set</code> for partial changes; <code>replaceOne</code> (and pymongo's <code>replace_one</code>) replace silently. <code>$</code> touches only the first matching element; use <code>$[x]</code> with arrayFilters when several can match. Single-document atomicity is the reason to keep data that changes together (lines and total) in one document.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: upserts.</b> Every update so far assumed the document exists. A partner feed sends restaurant data: some restaurants are new, some already exist. A dashboard keeps a per-day counter that does not exist until the day's first order. "Find, then insert or update" is two calls with a race between them.</div>

  <h2 id="mb-upsert"><span class="num">09</span>Upserts: Update, or Create if Missing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two app servers both check "does today's stats document exist?", both see no, and both insert: now there are two. Or both see yes and both update a stale copy. How do we say "update it, or create it if it isn't there" in one step the server performs atomically?</p>
  </div>
  <p>Pass <code>{ upsert: true }</code> to <code>updateOne</code>/<code>updateMany</code>. If the filter matches, it is a normal update. If not, the server <strong>inserts</strong> a new document built from the filter's equality fields plus the update. <code>$setOnInsert</code> fields are written only in that insert case. This is MongoDB's version of SQL's <code>INSERT … ON CONFLICT DO UPDATE</code> from <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hotel reception: "If this guest has a card, update the room number; if not, open a new card with this name and today's check-in date." The check-in date is written only when the card is first opened.</p>
  </div>
  <div class="fx" data-lang="js">db.restaurants.updateOne({ _id: 14 }, { $set: { rating: 4.0 } }, { upsert: true })
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
    added_on: ISODate('2026-03-10T00:00:00.000Z'),
    city: 'Mumbai',
    cuisine: 'Street Food',
    name: 'Chaat Corner'
  }
]</div>
  <p>Momo Magic (14) existed, so the first call was a plain update: <code>matchedCount: 1</code>, rating added (mongosh shows <code>4.0</code> as <code>4</code>; it is still a number). Chaat Corner (15) did not, so the second call inserted it: <code>insertedId: 15</code>, <code>upsertedCount: 1</code>, with <code>_id</code> taken from the filter, the <code>$set</code> fields, and <code>added_on</code> from <code>$setOnInsert</code>. Run it again later and <code>added_on</code> stays as it was.</p>
  <h3>Counters: $inc with upsert</h3>
  <p>A dashboard keeps one document per day. The app sends the same call for every new order; the first call of the day creates the document. Here are March 2's three orders (101 ₹240, 102 ₹450, 103 ₹520):</p>
  <div class="fx" data-lang="js">db.daily_stats.updateOne({ _id: "2026-03-02" }, { $inc: { orders: 1, revenue: 240 } }, { upsert: true })
db.daily_stats.updateOne({ _id: "2026-03-02" }, { $inc: { orders: 1, revenue: 450 } }, { upsert: true })
db.daily_stats.updateOne({ _id: "2026-03-02" }, { $inc: { orders: 1, revenue: 520 } }, { upsert: true })
db.daily_stats.find()</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: '2026-03-02', matchedCount: 0, modifiedCount: 0, upsertedCount: 1 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
[ { _id: '2026-03-02', orders: 3, revenue: 1210 } ]</div>
  <p>Call 1 inserted <code>{ _id: "2026-03-02", orders: 1, revenue: 240 }</code> (<code>$inc</code> starts from 0); calls 2 and 3 matched and added. Result: 3 orders, ₹1,210, the same numbers a <code>GROUP BY</code> on that day gives. This stored-summary idea returns as the <em>computed pattern</em> in <a class="xref" data-note="mongo_design">Schema Design</a>.</p>
  <h3>Upsert trap: a filter that never matches</h3>
  <div class="fx" data-lang="js">db.restaurants.updateOne(
  { name: "Chaat Corner", rating: { $gte: 4 } },
  { $set: { city: "Mumbai" } },
  { upsert: true })
db.restaurants.find({ name: "Chaat Corner" }, { name: 1, city: 1, rating: 1 })
db.restaurants.deleteOne({ name: "Chaat Corner", _id: { $type: "objectId" } })</div>
  <div class="fx" data-lang="text">{
  acknowledged: true,
  insertedId: ObjectId('6ad6b98d9d97f5746e7a6e8f'),
  matchedCount: 0,
  modifiedCount: 0,
  upsertedCount: 1
}
[
  { _id: 15, city: 'Mumbai', name: 'Chaat Corner' },
  {
    _id: ObjectId('6ad6b98d9d97f5746e7a6e8f'),
    name: 'Chaat Corner',
    city: 'Mumbai'
  }
]
{ acknowledged: true, deletedCount: 1 }</div>
  <p>Chaat Corner has no <code>rating</code>, so the filter <code>{ name: "Chaat Corner", rating: { $gte: 4 } }</code> matched nothing and the upsert <strong>inserted a second Chaat Corner</strong> with an ObjectId. Only equality fields (<code>name</code>) were copied into it; <code>rating: { $gte: 4 }</code> is a condition, not a value. The last line cleaned up the duplicate.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Upsert</strong>: update if a match exists, otherwise insert a document made of the filter's equality fields plus the update. <strong>$setOnInsert</strong>: fields set only when the upsert inserts. <strong>upsertedCount / insertedId</strong>: tell you which case happened.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: upsert keys must be unique</span>
    <p>Upsert on a field that is not unique (a name, or a filter with ranges) can create duplicates, as above, and under concurrency two upserts with the same filter can both insert. Upsert on <code>_id</code> or on a field with a unique index, so the second insert fails with E11000 and the driver can retry it as an update.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: delete.</b> We can create and change anything. Cancelled orders get purged, test data gets wiped, a customer asks to be removed. What happens to the orders that still point at a deleted customer?</div>

  <h2 id="mb-delete"><span class="num">10</span>Delete</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In PostgreSQL, Biteful's foreign keys refuse to delete a customer that other rows point at. MongoDB stores <code>customer_id: 1</code> in orders as a plain number. If we delete Asha, who stops us, and what happens to her three orders?</p>
  </div>
  <p><code>deleteOne(filter)</code> removes the first match, <code>deleteMany(filter)</code> all matches. <code>deleteMany({})</code> empties a collection but keeps it and its indexes; <code>drop()</code> removes the collection itself, indexes included.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p><code>deleteMany({})</code> is emptying a cupboard: the shelves and labels (indexes) stay. <code>drop()</code> is carrying the cupboard out of the room.</p>
  </div>
  <div class="fx" data-lang="js">db.customers.deleteOne({ _id: 1 })
db.orders.countDocuments({ customer_id: 1 })
db.orders.deleteMany({ status: "cancelled" })
db.orders.deleteOne({ _id: 999 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, deletedCount: 1 }
3
{ acknowledged: true, deletedCount: 2 }
{ acknowledged: true, deletedCount: 0 }</div>
  <p>Asha's document was deleted without complaint, yet 3 orders still carry <code>customer_id: 1</code>: <strong>orphans</strong> pointing at nobody. The same delete in PostgreSQL:</p>
  <div class="fx" data-lang="sql">DELETE FROM customers WHERE customer_id = 1;</div>
  <div class="fx" data-lang="text">ERROR:  update or delete on table "customers" violates foreign key constraint "customers_referred_by_fkey" on table "customers"
DETAIL:  Key (customer_id)=(1) is still referenced from table "customers".</div>
  <p>Postgres refused, because Ben and Chen's <code>referred_by</code> point at Asha (and her orders would too). Back in MongoDB, <code>deleteMany</code> removed the 2 cancelled orders, and deleting a missing id is not an error: <code>deletedCount: 0</code>. Now the difference between emptying and dropping:</p>
  <div class="fx" data-lang="js">db.orders.createIndex({ customer_id: 1 })
db.orders.countDocuments({})
db.orders.deleteMany({})
db.orders.getIndexes()
db.orders.drop()
show collections</div>
  <div class="fx" data-lang="text">customer_id_1
8
{ acknowledged: true, deletedCount: 8 }
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, key: { customer_id: 1 }, name: 'customer_id_1' }
]
true
customers
daily_stats
restaurants</div>
  <p>After <code>deleteMany({})</code> removed the remaining 8 orders, <code>getIndexes()</code> still listed both indexes. After <code>drop()</code>, <code>orders</code> no longer appears in <code>show collections</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>deleteOne / deleteMany</strong>: remove matching documents; <strong>deletedCount</strong> says how many. <strong>drop()</strong>: delete the collection with its documents and indexes. <strong>Orphan</strong>: a document whose reference points at a document that no longer exists. <strong>Soft delete</strong>: mark instead of remove, e.g. <code>{ $set: { deleted: true } }</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no foreign keys, no cascade, no confirmation</span>
    <p>Nothing stops a delete that leaves orphans: your code must clean up references (in a transaction if needed) or soft-delete. And <code>deleteMany({})</code> with an empty filter, passed by mistake from code, deletes everything with no prompt. Habit: run <code>countDocuments(filter)</code> with the same filter first and check the number.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Python.</b> We have used the shell for every CRUD operation. In real projects, the app, the ETL job and the notebook talk to MongoDB from code, and analysts want a pandas DataFrame, not shell output. How does the same work look in Python?</div>

  <h2 id="mb-py"><span class="num">11</span>From Python: pymongo</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A data scientist wants Biteful's order lines as a table for pandas. The documents are nested (lines inside orders). How do we query from Python, and how do we get from nested documents back to flat rows?</p>
  </div>
  <p><strong>pymongo</strong> is the official Python driver. Filters, projections and documents are plain Python dicts; method names use snake_case (<code>count_documents</code>, <code>update_one</code>). Operator keys must be quoted strings (<code>"$set"</code>), and <code>None</code> replaces <code>null</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>mongosh is talking to the shopkeeper face to face; pymongo is phoning in the same order. Same words, slightly different accent: <code>update_one</code> instead of <code>updateOne</code>.</p>
  </div>
  <p>This script runs against a <strong>freshly reloaded</strong> Biteful (the same load as section 05, before the updates and deletes above), on the real server.</p>
  <div class="fx" data-lang="py">from pymongo import MongoClient
import pandas as pd

client = MongoClient("mongodb://127.0.0.1:27347/?directConnection=true")  # our test server
db = client["biteful"]                                   # same as: use biteful

print(db.orders.count_documents({"status": "delivered"}))
for o in db.orders.find({"items.item": "Masala Dosa"}, {"amount": 1}):
    print(o)

res = db.customers.update_one({"_id": 5}, {"$set": {"city": "Pune"}})
print(res.matched_count, res.modified_count)
print(db.customers.find_one({"_id": 5}))

orders = pd.DataFrame(list(db.orders.find({}, {"items": 0})))
print(orders[["_id", "status", "amount", "delivery_minutes"]].head(5))

lines = pd.json_normalize(list(db.orders.find()), record_path="items",
                          meta=["_id", "status"])
print(len(lines))
print(lines[["_id", "item", "qty", "unit_price", "status"]].head(4))
lines["line_total"] = lines["qty"] * lines["unit_price"]
delivered = lines[lines["status"] == "delivered"]
print(delivered.groupby("item")["line_total"].sum().sort_values(ascending=False).head(3))</div>
  <div class="fx" data-lang="text">7
{'_id': 101, 'amount': 240}
{'_id': 108, 'amount': 260}
{'_id': 110, 'amount': 310}
1 1
{'_id': 5, 'name': 'Esha', 'signup_date': datetime.datetime(2026, 3, 1, 0, 0), 'city': 'Pune'}
   _id     status  amount  delivery_minutes
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
3  103  Farmhouse Pizza    2         260  delivered
item
Chicken Biryani    700
Farmhouse Pizza    520
Masala Dosa        360
Name: line_total, dtype: int64</div>
  <p>Line by line. 7 delivered orders. The <code>for</code> loop pulls the three Masala Dosa orders lazily from the cursor. Esha's city update matched and modified 1, and BSON dates arrived as Python <code>datetime</code>s. With <code>{"items": 0}</code> the DataFrame stays flat; both 104's <code>null</code> and 105's missing field became <code>NaN</code> in pandas (the null/missing difference is lost here). <code>json_normalize</code> with <code>record_path="items"</code> produced one row per line, <strong>15 rows</strong>, and copied the parent's <code>_id</code> and <code>status</code> onto each (the <code>meta</code> list): that is exactly the SQL <code>order_items</code> table, rebuilt from the documents. Delivered revenue per item puts Chicken Biryani first (350 + 350 = 700).</p>
  <p>Two things every project hits: ids that arrive as strings, and tests without a server.</p>
  <div class="fx" data-lang="py">from pymongo import MongoClient
from bson import ObjectId
db = MongoClient("mongodb://127.0.0.1:27347/?directConnection=true")["biteful"]

oid = db.reviews.insert_one({"restaurant_id": 10, "stars": 5}).inserted_id
as_text = str(oid)                     # e.g. it arrived in a URL: /reviews/&lt;id&gt;
print(type(oid).__name__, len(as_text))
print(db.reviews.find_one({"_id": as_text}))                       # plain string
print(db.reviews.find_one({"_id": ObjectId(as_text)}, {"_id": 0}))  # real ObjectId</div>
  <div class="fx" data-lang="text">ObjectId 24
None
{'restaurant_id': 10, 'stars': 5}</div>
  <p>The review got an ObjectId (24 hex characters as text). Looking it up with the <em>string</em> returned <code>None</code>; wrapping it in <code>ObjectId(...)</code> found it. For unit tests, <strong>mongomock</strong> is an in-memory fake of pymongo. The block below ran on <strong>mongomock 4.3.0, not on a MongoDB server</strong>:</p>
  <div class="fx" data-lang="py">import mongomock                                   # pip install mongomock

fake = mongomock.MongoClient()["biteful"]           # in-memory, no server at all
fake.orders.insert_many([
    {"_id": 101, "status": "delivered", "amount": 240},
    {"_id": 105, "status": "cancelled", "amount": 310},
])

def delivered_revenue(db):                         # the function under test
    return sum(o["amount"] for o in db.orders.find({"status": "delivered"}))

assert delivered_revenue(fake) == 240
print("test passed")</div>
  <div class="fx" data-lang="text">test passed</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>pymongo</strong>: the official MongoDB driver for Python. <strong>pd.json_normalize(docs, record_path, meta)</strong>: flattens one nested list into rows, copying parent fields. <strong>mongomock</strong>: an in-memory imitation of pymongo for tests; it covers common operations but not every server feature, so integration tests still need a real server.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: strings vs ObjectIds, and pulling everything</span>
    <p>An ObjectId never equals its 24-character string. And filter and project on the server: <code>pd.DataFrame(list(db.orders.find()))</code> on a million orders ships every field over the network just to sum one column. Totals belong in an aggregation pipeline, which is the next note.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have used every CRUD operation on the same 22 documents. Before the mistakes and the revision sheet, one picture of how the pieces depend on each other.</div>

  <h2 id="mb-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Document, BSON, _id, collection, insert, filter, projection, sort, operators, upsert, delete, pymongo: eleven separate tools, or one idea with a few verbs?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="mb-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="150" height="50" rx="8" class="fr sr"/><text x="85" y="40" text-anchor="middle" font-weight="700">need</text><text x="85" y="57" text-anchor="middle" class="tm">order in 4-5 tables</text>
<line x1="160" y1="45" x2="188" y2="45" stroke="currentColor" marker-end="url(#mb-a9)"/>
<rect x="190" y="20" width="150" height="50" rx="8" class="fb sb"/><text x="265" y="40" text-anchor="middle" font-weight="700">document</text><text x="265" y="57" text-anchor="middle" class="tm">order 103 + items</text>
<line x1="340" y1="45" x2="368" y2="45" stroke="currentColor" marker-end="url(#mb-a9)"/>
<rect x="370" y="20" width="150" height="50" rx="8" class="fb sb"/><text x="445" y="40" text-anchor="middle" font-weight="700">BSON + _id</text><text x="445" y="57" text-anchor="middle" class="tm">typed, identified</text>
<line x1="520" y1="45" x2="548" y2="45" stroke="currentColor" marker-end="url(#mb-a9)"/>
<rect x="550" y="20" width="160" height="50" rx="8" class="fb sb"/><text x="630" y="40" text-anchor="middle" font-weight="700">collection / db</text><text x="630" y="57" text-anchor="middle" class="tm">biteful.orders (10)</text>
<line x1="630" y1="70" x2="630" y2="103" stroke="currentColor" marker-end="url(#mb-a9)"/>
<rect x="470" y="105" width="240" height="48" rx="8" class="fg sg"/><text x="590" y="125" text-anchor="middle" font-weight="700">the filter document</text><text x="590" y="142" text-anchor="middle" class="tm">{ status: "delivered", amount: { $gte: 300 } }</text>
<line x1="470" y1="129" x2="438" y2="129" stroke="currentColor" marker-end="url(#mb-a9)"/>
<rect x="250" y="105" width="186" height="48" rx="8" class="ft st"/><text x="343" y="125" text-anchor="middle">find + projection</text><text x="343" y="142" text-anchor="middle" class="tm">→ sort / skip / limit</text>
<line x1="590" y1="153" x2="590" y2="183" stroke="currentColor" marker-end="url(#mb-a9)"/>
<rect x="470" y="185" width="240" height="48" rx="8" class="ft st"/><text x="590" y="205" text-anchor="middle">update / upsert / delete</text><text x="590" y="222" text-anchor="middle" class="tm">same filter + $ operators</text>
<rect x="250" y="185" width="186" height="48" rx="8" class="fv sb"/><text x="343" y="205" text-anchor="middle">insert</text><text x="343" y="222" text-anchor="middle" class="tm">_id must be unique</text>
<rect x="10" y="105" width="210" height="128" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="115" y="127" text-anchor="middle" font-weight="700">pymongo</text><text x="115" y="146" text-anchor="middle" class="tm">same documents as dicts,</text><text x="115" y="162" text-anchor="middle" class="tm">same filters, snake_case;</text><text x="115" y="178" text-anchor="middle" class="tm">json_normalize →</text><text x="115" y="194" text-anchor="middle" class="tm">15 line rows again</text>
<line x1="250" y1="160" x2="222" y2="160" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#mb-a9)"/>
<text x="10" y="262" class="tm">One shape (the document) and one language (the filter document) drive every verb: find, update, upsert and delete all start by matching.</text>
<text x="10" y="280" class="tm">What is missing on the right: computing across documents (sum per restaurant) and joining collections → the aggregation pipeline.</text>
</g>
</svg><figcaption>Everything in this note is "a document, located by a filter document". Writes reuse the read language; Python reuses both.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same Biteful documents</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>Document</td><td>fields, arrays, sub-objects</td><td>store one order as one thing</td><td>order 103 with 1 line and 2 options</td><td>data read and written as a unit</td></tr>
    <tr><td>BSON</td><td>typed binary encoding</td><td>dates, int vs double, exact money</td><td>12:10 IST stored as 06:40Z</td><td>always (store real dates)</td></tr>
    <tr><td>_id / ObjectId</td><td>unique indexed field</td><td>which document is this?</td><td>_id 101–110; ObjectId for reviews</td><td>reuse natural ids, else ObjectId</td></tr>
    <tr><td>Collection / database</td><td>groups of documents</td><td>where do they live?</td><td>4 tables → 3 collections</td><td>one collection per kind of thing</td></tr>
    <tr><td>insertMany</td><td>documents + _id uniqueness</td><td>how does data get in?</td><td>22 documents; dup → E11000</td><td>bulk loads (<code>ordered: false</code>)</td></tr>
    <tr><td>Filter + operators</td><td>a document of conditions</td><td>which documents?</td><td>delivered ≥ ₹300 → 102, 103, 104, 109</td><td>every read and write</td></tr>
    <tr><td>null vs missing</td><td><code>null</code>, <code>$exists</code>, <code>$type</code></td><td>"no value", which kind?</td><td>4 / 3 / 1 orders</td><td>data cleaning, reports</td></tr>
    <tr><td>$elemMatch</td><td>filter on one array element</td><td>two conditions, same line?</td><td>3 orders, not 5</td><td>any multi-condition array query</td></tr>
    <tr><td>Projection</td><td>include/exclude list</td><td>which fields?</td><td>names of Pune customers</td><td>always: don't ship unused fields</td></tr>
    <tr><td>sort / limit / skip</td><td>cursor methods</td><td>which order, how many?</td><td>top 3: 109, 103, 102; tie 107/108</td><td>lists, pages; keyset for deep pages</td></tr>
    <tr><td>Update operators</td><td>filter + $set/$inc/$push…</td><td>change part of a document</td><td>110: +Medu Vada, 310 → 370 atomically</td><td>every partial change</td></tr>
    <tr><td>arrayFilters</td><td>$[x] + conditions</td><td>change every matching line</td><td>veg flag on 5 Dosa Hut lines</td><td>bulk edits inside arrays</td></tr>
    <tr><td>Upsert</td><td>update + insert fallback</td><td>update or create in one step</td><td>Chaat Corner; 2026-03-02: 3 orders, ₹1,210</td><td>syncs, counters (on unique keys)</td></tr>
    <tr><td>Delete</td><td>filter + remove</td><td>how does data go?</td><td>Asha gone, 3 orphan orders</td><td>with a count check first</td></tr>
    <tr><td>pymongo</td><td>all of the above as dicts</td><td>how does code use it?</td><td>15 line rows via json_normalize</td><td>apps, ETL, notebooks</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a document stores what is read together, and a filter document locates documents for every verb.</strong> Insert puts documents in; find, update, upsert and delete all begin by matching with the same filter language, then read, change, create or remove. The subtle bugs all live in matching (null vs missing, any-element arrays, exact sub-documents) or in writes that replace instead of change.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Knowing the system, which slips still pass silently in real code?</div>

  <h2 id="mb-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Most MongoDB mistakes do not raise errors: the query runs and returns something plausible but wrong. Which ones should you check first when a number looks off?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: replacement instead of $set</span>
    <p><code>replaceOne({ _id: 7 }, { city: "Mumbai" })</code> wiped Gita's name and signup date. Write <code>updateOne({ _id: 7 }, { $set: { city: "Mumbai" } })</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: null matches missing</span>
    <p><code>{ delivery_minutes: null }</code> returned 4 orders, including three that were never delivered. Use <code>$exists</code> or <code>$type: "null"</code> when the difference matters.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: array conditions without $elemMatch</span>
    <p>"qty ≥ 2 and price ≥ 100" matched orders 102 and 108 through two different lines. Use <code>$elemMatch</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: typos create new collections and fields</span>
    <p><code>db.order.find()</code> printed nothing; <code>{ $set: { stauts: "delivered" } }</code> succeeds and adds a new field while <code>status</code> stays unchanged. A validator catches the second (<a class="xref" data-note="mongo_design">Schema Design</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sorting on a non-unique field</span>
    <p>107 and 108 tie at ₹260; without <code>_id</code> as a tie-breaker, pages can repeat or skip an order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deep skip</span>
    <p><code>skip(n)</code> reads and discards n documents. Use keyset pagination on an indexed key.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: upsert on a non-unique filter</span>
    <p>A filter that cannot match (a range, a missing field) inserts a duplicate every time: the second Chaat Corner.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dates as strings, numbers as strings, ids as strings</span>
    <p><code>"2026-03-02 12:10"</code> is not a date, <code>"5"</code> never equals <code>5</code>, and <code>"6ad6…"</code> never equals <code>ObjectId("6ad6…")</code>. Data loaded from CSV or URLs is the usual cause; convert on load.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting there is no cascade</span>
    <p>Deleting Asha left 3 orphan orders. Clean up references in the same code path, or soft-delete.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="mb-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <strong>Biteful as documents</strong>, database <code>biteful</code>. <code>customers</code> (7): Asha, Chen, Gita (Pune), Ben, Dia, Farah (Mumbai), Esha (no <code>city</code> field); <code>referred_by</code> only on Ben (1), Chen (1), Farah (2). <code>restaurants</code> (5): 10 Dosa Hut, 11 Biryani Bros, 12 Pizza Point, 13 Green Bowl, 14 Momo Magic (no <code>rating</code>). <code>orders</code> (10): 101–110 with amounts 240, 450, 520, 380, 310, 180, 260, 260, 600, 310; 105 and 107 cancelled, 110 pending; each order embeds its <code>items</code> (15 lines in total), some lines have <code>options</code>; 104 has <code>delivery_minutes: null</code>, 105/107/110 have no such field.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Document</td><td>store one order as one thing</td><td>order 103 = order + line + 2 options</td><td>JSON lacks types and identity → BSON</td></tr>
    <tr><td>BSON &amp; _id</td><td>how is it typed and identified?</td><td>12:10 IST → 06:40Z; _id 103</td><td>where do many live? → collections</td></tr>
    <tr><td>Collections &amp; databases</td><td>where do documents live?</td><td>3 collections; typo <code>db.order</code> → empty</td><td>how do SQL words map? → terms</td></tr>
    <tr><td>SQL ↔ Mongo terms</td><td>translate what I know</td><td>order_items → <code>orders.items</code></td><td>still empty → insert</td></tr>
    <tr><td>Insert</td><td>put data in</td><td>22 docs; dup _id → E11000; ordered 1 vs unordered 2</td><td>ask questions → find</td></tr>
    <tr><td>Find, filters, projections</td><td>which documents, which fields?</td><td>delivered ≥ 300 → 4; Masala Dosa → 101, 108, 110</td><td>no order, all at once → sort/limit</td></tr>
    <tr><td>Sort, limit, pages</td><td>which order, how many?</td><td>top 3 = 109, 103, 102; page 2 = 105–108</td><td>data changes → update</td></tr>
    <tr><td>Update operators</td><td>change part of a document</td><td>110: 310 → 370 → 490 → 430</td><td>doc may not exist → upsert</td></tr>
    <tr><td>Upserts</td><td>update or create</td><td>Chaat Corner inserted; Mar 2 counter 3 / ₹1,210</td><td>removing data → delete</td></tr>
    <tr><td>Delete</td><td>remove documents</td><td>Asha deleted, 3 orphan orders; Postgres refused</td><td>from code → pymongo</td></tr>
    <tr><td>pymongo</td><td>use it from Python</td><td>15 line rows; Chicken Biryani ₹700</td><td>group/join → <a class="xref" data-note="mongo_aggregation">Aggregation</a></td></tr>
  </table>
  <h3>Definitions and syntax</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning / syntax</th></tr>
    <tr><td>Document</td><td>field–value pairs; values may be arrays or sub-documents; max 16 MB</td></tr>
    <tr><td>BSON</td><td>typed binary JSON: date (UTC), int, long, double, Decimal128, ObjectId, array, object</td></tr>
    <tr><td>_id</td><td>mandatory unique indexed primary key; ObjectId = 4 B seconds + 5 B random + 3 B counter</td></tr>
    <tr><td>Collection / database</td><td>group of documents / of collections; created on first write</td></tr>
    <tr><td><code>find(filter, projection)</code></td><td>filter = conditions (ANDed); projection = <code>{ f: 1 }</code> or <code>{ f: 0 }</code>, not mixed (except <code>_id: 0</code>)</td></tr>
    <tr><td>Comparison / logic</td><td><code>$eq $ne $gt $gte $lt $lte $in $nin</code> · <code>$or $and $nor $not</code> · <code>$exists $type $regex</code></td></tr>
    <tr><td>Arrays</td><td><code>"items.item"</code> = any element; <code>"items.0.item"</code> = position; <code>$size: n</code>; <code>$elemMatch: {…}</code> = same element</td></tr>
    <tr><td>Cursor methods</td><td><code>sort({ f: 1 | -1 })</code>, <code>skip(n)</code>, <code>limit(n)</code>; executed sort → skip → limit</td></tr>
    <tr><td>Update operators</td><td><code>$set $unset $inc $push $addToSet $pull</code>; <code>"items.$.f"</code> first match; <code>"items.$[x].f"</code> + <code>arrayFilters: [{ "x.f": … }]</code></td></tr>
    <tr><td>Write results</td><td><code>matchedCount</code> found · <code>modifiedCount</code> changed · <code>upsertedCount</code>/<code>insertedId</code> inserted · <code>deletedCount</code></td></tr>
    <tr><td>Upsert</td><td><code>updateOne(filter, update, { upsert: true })</code>; insert = filter equalities + update; <code>$setOnInsert</code></td></tr>
    <tr><td>pymongo</td><td><code>MongoClient(uri)["biteful"].orders.find({...})</code>; <code>insert_one</code>, <code>update_one</code>, <code>count_documents</code>; <code>pd.json_normalize(docs, record_path="items", meta=[...])</code></td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Embed in one document</b><p>Use for data read and changed together (order + lines + options).</p><small>Avoid for lists that grow forever (16 MB)</small></div>
    <div><b>$elemMatch</b><p>Use whenever two or more conditions must hold on the same array element.</p><small>One condition: plain dot notation is fine</small></div>
    <div><b>Keyset paging</b><p>Use for feeds and deep pages: <code>{ _id: { $gt: last } }</code> + limit.</p><small>skip/limit only for shallow pages</small></div>
    <div><b>$set / $inc</b><p>Use for every partial change; single-document writes are atomic.</p><small>Never replaceOne for a partial change</small></div>
    <div><b>Upsert</b><p>Use for syncs and counters keyed on _id or a unique field.</p><small>Avoid ranges or non-unique fields in the filter</small></div>
    <div><b>Documents vs tables</b><p>Documents: read as a unit, varying shape, known queries.</p><small>Tables: many entities change together, unplanned queries</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p><code>{ f: null }</code> also matches missing (4 vs 1); two dot conditions on an array can hit two elements (5 vs 3 orders); <code>{ items: { item: "Raita" } }</code> is an exact whole-object match (0); typos create collections and fields silently; ties without a tie-breaker (107/108); deep <code>skip</code>; <code>replaceOne</code> wipes fields; <code>$</code> updates only the first match; upsert with a non-matching filter duplicates; no cascade on delete (3 orphans); ObjectId ≠ its string; dates are UTC; ordered inserts stop at the first error and nothing rolls back.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>How many Biteful orders does <code>{ delivery_minutes: null }</code> match, and why not 1?</td><td>4: 104 (explicit null) plus 105, 107, 110 (field missing)</td></tr>
    <tr><td><code>insertMany([{_id:1},{_id:1},{_id:2}])</code>, default mode: how many inserted?</td><td>1; ordered mode stops at the first error</td></tr>
    <tr><td>An update reports matchedCount 1, modifiedCount 0. Error?</td><td>No: found, but the new value equalled the old one</td></tr>
    <tr><td>Which updates every matching array element: <code>$</code> or <code>$[x]</code>?</td><td><code>$[x]</code> with arrayFilters; <code>$</code> only the first</td></tr>
    <tr><td>You delete customer 1. What happens to her orders?</td><td>Nothing: 3 orphan orders keep <code>customer_id: 1</code></td></tr>
  </table>

  <h2 id="mb-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you answer these out loud, with Biteful numbers, before revealing? The last few are connection questions: they test how the concepts depend on each other.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a document database, and how is it different from a relational one?</summary><div class="qa-body">It stores each record as a self-contained nested document (fields, sub-objects, arrays) in a collection, with no fixed columns. A relational database splits data into tables joined by keys. Documents make "read the whole order" one read and one atomic write; relational makes unplanned joins and multi-entity consistency easy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is BSON and why doesn't MongoDB just store JSON?</summary><div class="qa-body">BSON is binary-encoded, typed JSON. It adds types JSON lacks (dates, int32/int64, double, Decimal128, ObjectId, binary) and stores lengths so the server can skip fields without parsing text. Order 101's time is a real date (stored as 06:40Z), so range queries and date grouping work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is inside an ObjectId, and what is one useful consequence?</summary><div class="qa-body">4-byte timestamp (seconds), 5 random bytes, 3-byte counter. Because it starts with time, sorting by <code>_id</code> roughly sorts by insertion time and <code>getTimestamp()</code> gives the creation time: <code>69a530c0…</code> decoded to 2026-03-02 06:40 UTC. It is generated client-side, so no central counter is needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: names of customers in Pune or Mumbai, sorted by name, without _id.</summary><div class="qa-body"><code>db.customers.find({ city: { $in: ["Pune", "Mumbai"] } }, { name: 1, _id: 0 }).sort({ name: 1 })</code> → Asha, Ben, Chen, Dia, Farah, Gita. Esha is absent: she has no city.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>db.orders.find({ "items.qty": { $gte: 2 }, "items.unit_price": { $gte: 100 } })</code>. Then fix it.</summary><div class="qa-body">101, 102, 103, 108, 110. Orders 102 and 108 match through two different lines (Raita qty 2 + Biryani ₹350; coffees qty 2 + dosa ₹120). Fix: <code>{ items: { $elemMatch: { qty: { $gte: 2 }, unit_price: { $gte: 100 } } } }</code> → 101, 103, 110.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find orders whose delivery time is explicitly null but not those where it is missing?</summary><div class="qa-body"><code>{ delivery_minutes: { $type: "null" } }</code> → 104 only. <code>{ delivery_minutes: null }</code> gives 4 (null or missing) and <code>{ $exists: false }</code> gives 105, 107, 110.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>insertMany</code> of 3 documents where the 2nd has a duplicate _id: how many are inserted, ordered vs unordered? Is anything rolled back?</summary><div class="qa-body">Ordered (default): 1, it stops at the error. Unordered (<code>{ ordered: false }</code>): 2, it skips the bad one. Nothing is rolled back in either mode.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two orders tie at ₹260. Why does that matter for <code>sort({ amount: 1 }).skip(2).limit(1)</code>?</summary><div class="qa-body">Without a tie-breaker the server may return 107 or 108 at position 3, and a different one on the next page, so a page can repeat or skip an order. Sort by <code>{ amount: 1, _id: 1 }</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>skip(100000).limit(20)</code> slow, and what's the alternative?</summary><div class="qa-body">The server still walks and discards 100,000 documents. Keyset pagination remembers the last sort key of the page (e.g. <code>_id</code> 104) and asks <code>{ _id: { $gt: 104 } }</code> with <code>limit</code>, which jumps there through the index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An update returns matchedCount 1, modifiedCount 0. What happened?</summary><div class="qa-body">The filter found the document but nothing changed: a <code>$set</code> to the current value (106's delivery time set to 26 twice) or an <code>$addToSet</code> of an existing element ("less sugar" again). Not an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>$</code> vs <code>$[x]</code> with arrayFilters: what is the difference?</summary><div class="qa-body"><code>$</code> updates the first array element the query matched (order 108: only the dosa got <code>veg: true</code>). <code>$[x]</code> updates every element matching the arrayFilters condition (both the dosa and the coffee in 108 and 110), and the condition can differ from the query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A teammate runs <code>replaceOne({ _id: 7 }, { city: "Mumbai" })</code>. What happens?</summary><div class="qa-body">Gita's whole document is replaced: name and signup date are gone, leaving <code>{ _id: 7, city: 'Mumbai' }</code>. Correct: <code>updateOne({ _id: 7 }, { $set: { city: "Mumbai" } })</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does upsert do, and when can it create duplicates?</summary><div class="qa-body">It updates if the filter matches, otherwise inserts the filter's equality fields plus the update (and <code>$setOnInsert</code>). It duplicates when the filter cannot match an existing document, e.g. <code>{ name: "Chaat Corner", rating: { $gte: 4 } }</code> inserted a second Chaat Corner, or when concurrent upserts race on a non-unique field. Upsert on <code>_id</code> or a unique index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>deleteMany({})</code> vs <code>drop()</code>?</summary><div class="qa-body"><code>deleteMany({})</code> removes every document but keeps the collection, its indexes and validator (<code>getIndexes()</code> still listed <code>customer_id_1</code>). <code>drop()</code> removes the collection with its indexes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need Biteful's order lines as a pandas DataFrame, one row per line. How?</summary><div class="qa-body"><code>pd.json_normalize(list(db.orders.find()), record_path="items", meta=["_id", "status"])</code> → 15 rows, the SQL <code>order_items</code> table rebuilt. Or <code>$unwind</code> in an aggregation and load the flat result.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does embedding the lines inside the order make the "add Medu Vada" update safe without a transaction?</summary><div class="qa-body">A write to one document is atomic, and the line and the total (<code>amount</code>) are in the same document, so <code>$push</code> + <code>$inc</code> in one <code>updateOne</code> changed 310 → 370 all-or-nothing. In SQL the line is a row in another table, so INSERT + UPDATE needed a transaction. The embedding decision (section 01) is what buys the atomicity (section 08).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip <code>_id</code> uniqueness?</summary><div class="qa-body">Everything that "finds one document": <code>updateOne({ _id: 110 })</code> could change either copy, upserts on <code>_id</code> would no longer be safe, and keyset paging on <code>_id</code> could skip or repeat. That is why <code>_id</code> always has a unique index and a duplicate insert fails with E11000.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do filters connect find, update, upsert and delete?</summary><div class="qa-body">All four take the same filter document first. Find returns the matches; update changes them; upsert changes them or inserts if there are none; delete removes them. So every filter trap (null vs missing, any-element arrays) is also an update and delete trap: <code>deleteMany({ delivery_minutes: null })</code> would remove 4 orders, not 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a document database need a different answer to "what about foreign keys?"</summary><div class="qa-body">References like <code>customer_id: 1</code> are plain values; there is no FK constraint, so deleting Asha succeeded and left 3 orphans, while Postgres refused. The answer is design: embed what belongs to the parent (lines), keep references for independent things (customers), and clean up references in code or soft-delete. That design question is <a class="xref" data-note="mongo_design">Schema Design</a>.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="mongo_aggregation">Aggregation Pipeline</a>.</b> <code>find</code> returns documents, but it cannot compute across them: "revenue per restaurant", "average delivery time per city", "each order with its customer's name" all need grouping or joining. pymongo + pandas can do it by shipping every document to Python; the aggregation pipeline does it inside the database.</div>
</main>
`
});
