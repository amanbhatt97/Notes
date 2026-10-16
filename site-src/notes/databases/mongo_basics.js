// notes/databases/mongo_basics.js — Documents & CRUD
Object.assign(TOPIC_CONTENT, {
  "mongo_basics": `<main>
  <h1>Documents &amp; CRUD</h1>
  <p class="lead">MongoDB stores data as nested JSON-like documents instead of rows. This page models the same shop as documents and shows how to insert, query, update and delete them, with every result shown.</p>

  <h2 id="mb-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">MongoDB: Documents &amp; CRUD</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">What &amp; why</div>
      <ul>
        <li><b>Document database</b> — records are nested JSON-like objects, no fixed columns</li>
        <li><b>Why</b> — nested data in one object; maps 1:1 to code dicts; no migrations</li>
        <li><b>Scale-out</b> — self-contained docs shard across machines</li>
        <li>💡 SQL = linked spreadsheets; Mongo = folder of self-contained forms</li>
        <li><b>Design rule</b> — model around the queries you'll run; unplanned queries hurt</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Documents &amp; collections</div>
      <ul>
        <li><b>Collection</b> ≈ table; docs may differ in shape</li>
        <li><b>BSON</b> — binary JSON + dates, int64, Decimal128, ObjectId; fast to skip fields</li>
        <li><b>_id</b> — required, unique, always indexed</li>
        <li><b>ObjectId</b> — 12 bytes: 4 timestamp + 5 random + 3 counter; ~time-sortable, <code>getTimestamp()</code></li>
        <li>⚠ <b>16 MB</b> doc cap — no ever-growing arrays</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">SQL ↔ Mongo</div>
      <ul>
        <li><b>table / row / column</b> → collection / document / field</li>
        <li><b>JOIN</b> → embedding or <code>$lookup</code></li>
        <li><b>GROUP BY</b> → <code>$group</code> in a pipeline</li>
        <li><b>Schema</b> → optional <code>$jsonSchema</code> validation</li>
        <li><b>Good fit</b> — catalogs, profiles, content, events, IoT</li>
        <li><b>Poor fit</b> — multi-entity transactions (ledgers), ad-hoc joins/analytics</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Insert</div>
      <ul>
        <li><b>insertOne / insertMany</b> — batch = one round trip; collection auto-created</li>
        <li><b>Duplicate _id</b> → <code>E11000 duplicate key error</code></li>
        <li><b>Ordered</b> by default: stops at first error; <code>{ ordered: false }</code> continues</li>
        <li><b>Missing field</b> = document version of NULL (Dia has no city)</li>
        <li><b>Copy into order</b> — product name/price snapshot at purchase time</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Find &amp; filter</div>
      <ul>
        <li><b>find(filter, projection)</b> — <code>{}</code> = all; <code>{ name: 1, _id: 0 }</code></li>
        <li><b>Operators</b> — <code>$eq $ne $gt $gte $lt $lte $in $nin $or $and $not $exists $regex</code></li>
        <li><b>Fields listed together</b> = implicit AND</li>
        <li>⚠ <b><code>{ city: null }</code></b> matches null <em>and</em> missing; <code>$exists: false</code> = missing only</li>
        <li><b>sort → skip → limit</b> applied in that order regardless of chaining</li>
        <li><b>Cursor</b> — lazy, fetched in batches</li>
        <li>⚠ <b>Deep skip</b> walks docs; use <code>{ _id: { $gt: last } }</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Nested &amp; arrays</div>
      <ul>
        <li><b>Dot notation</b> — <code>"items.product"</code>; on arrays matches <em>any</em> element</li>
        <li><b>Position</b> — <code>"items.0.product"</code></li>
        <li>⚠ <b>Multiple conditions</b> may hit different elements → use <code>$elemMatch</code></li>
        <li><b>$size</b> — exact length only; <b>$all</b> — contains all values</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Update &amp; delete</div>
      <ul>
        <li><b>updateOne / updateMany</b> + operators: <code>$set $unset $inc $push $addToSet $pull</code></li>
        <li><b>$push</b> allows dups; <b>$addToSet</b> only if absent</li>
        <li><b>Upsert</b> — <code>{ upsert: true }</code>: update or insert; <code>$setOnInsert</code> for insert-only fields</li>
        <li>⚠ <b>Replacement</b> — doc without <code>$</code> ops wipes other fields (<code>replaceOne</code>)</li>
        <li><b>Atomic</b> — any single-document write, incl. nested arrays</li>
        <li><b>deleteMany({})</b> keeps indexes; <b>drop()</b> removes them</li>
        <li>⚠ <b>No FKs</b> — deletes don't cascade; clean references yourself</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">From Python</div>
      <ul>
        <li><b>pymongo</b> — dicts, snake_case: <code>count_documents</code>, <code>update_one</code></li>
        <li><b>Flat → DataFrame</b> — <code>pd.DataFrame(list(cursor))</code></li>
        <li><b>Nested → rows</b> — <code>pd.json_normalize(docs, record_path="items", meta=[…])</code></li>
        <li><b>Filter/project server-side</b>; aggregate in Mongo for big jobs; <code>mongomock</code> for tests</li>
        <li>⚠ <b>ObjectId</b> — string won't match; use <code>ObjectId("…")</code></li>
      </ul>
    </div>
  </div>
</div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What MongoDB Is</span><span class="rm-sub">Self-contained forms, not linked sheets</span></div></div>
      <div class="rm-item rm-done" data-target="mb-doc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Documents &amp; Collections</span><span class="rm-sub">BSON, _id, ObjectId</span></div></div>
      <div class="rm-item rm-done" data-target="mb-when"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">When (Not) to Use It</span><span class="rm-sub">Terminology map and fit</span></div></div>
      <div class="rm-item rm-done" data-target="mb-create"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Insert</span><span class="rm-sub">The shop as documents</span></div></div>
      <div class="rm-item rm-done" data-target="mb-read"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Find &amp; Filter</span><span class="rm-sub">Operators, projection, sort</span></div></div>
      <div class="rm-item rm-done" data-target="mb-nested"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Nested Fields &amp; Arrays</span><span class="rm-sub">Dot notation, $elemMatch</span></div></div>
      <div class="rm-item rm-done" data-target="mb-update"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Update &amp; Delete</span><span class="rm-sub">$set, $push, upsert, the trap</span></div></div>
      <div class="rm-item rm-done" data-target="mb-py"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">From Python</span><span class="rm-sub">pymongo to pandas</span></div></div>
      <div class="rm-item rm-done" data-target="mb-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mb-why"><span class="num">01</span>What MongoDB Is</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>MongoDB is a <strong>document database</strong>: each record is a JSON-like object that can hold nested objects and arrays. No fixed columns, no JOINs needed for data that belongs together.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <text x="0" y="14" font-weight="bold">SQL: linked sheets</text>
    <g font-size="11">
      <rect x="0" y="26" width="120" height="44" rx="5" class="fb sb"/><text x="60" y="44" text-anchor="middle">orders</text><text x="60" y="60" text-anchor="middle" class="tm">100, cust 1</text>
      <rect x="0" y="86" width="120" height="58" rx="5" class="ft st"/><text x="60" y="102" text-anchor="middle">order_items</text><text x="60" y="118" text-anchor="middle" class="tm">100, prod 10</text><text x="60" y="134" text-anchor="middle" class="tm">100, prod 13</text>
      <rect x="150" y="86" width="110" height="58" rx="5" class="fg sg"/><text x="205" y="102" text-anchor="middle">products</text><text x="205" y="118" text-anchor="middle" class="tm">10 Laptop</text><text x="205" y="134" text-anchor="middle" class="tm">13 Lamp</text>
    </g>
    <g stroke="currentColor" opacity=".6"><line x1="60" y1="70" x2="60" y2="86"/><line x1="120" y1="115" x2="150" y2="115"/></g>
    <text x="0" y="168" font-size="11" class="tm">3 tables, 2 joins to rebuild one order</text>
    <line x1="290" y1="10" x2="290" y2="190" stroke="currentColor" opacity=".2"/>
    <text x="320" y="14" font-weight="bold">MongoDB: one document</text>
    <rect x="320" y="26" width="270" height="146" rx="6" class="fb sb"/>
    <g font-size="11"><text x="332" y="46">_id: 100, customer_id: 1</text><text x="332" y="64">status: "delivered"</text><text x="332" y="82">items: [</text></g>
    <rect x="344" y="90" width="234" height="30" rx="4" class="ft st"/><text x="352" y="109" font-size="11">Laptop · Electronics · 1 · 800</text>
    <rect x="344" y="126" width="234" height="30" rx="4" class="ft st"/><text x="352" y="145" font-size="11">Lamp · Furniture · 2 · 40</text>
    <text x="332" y="168" font-size="11">]</text>
    <text x="320" y="190" font-size="11" class="tm">one read, one atomic write</text>
  </svg><figcaption>The same order. Items (and product details) live inside the order document instead of in joined tables.</figcaption></figure>
  <div class="cards">
    <div><b>Nested fits</b><p>An order and its items are one object.</p></div>
    <div><b>Dev speed</b><p>Doc = Python dict. New field, no migration.</p></div>
    <div><b>Scale-out</b><p>Self-contained docs shard without cross-machine joins.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>SQL = <strong>linked spreadsheets</strong> tied by ID columns. MongoDB = a <strong>folder of self-contained forms</strong>. Reading one form is easy; "total Lamps sold" means flipping through every form.</p>
  </div>

  <h2 id="mb-doc"><span class="num">02</span>Documents &amp; Collections</h2>
  <ul>
    <li><strong>Document</strong>: one record, a set of field–value pairs. Values can be objects or arrays.</li>
    <li><strong>Collection</strong>: a group of documents, like a table. Documents in it <em>may</em> have different shapes.</li>
    <li><strong>BSON</strong> (Binary JSON): the on-disk format. Adds types JSON lacks: dates, 64-bit ints, Decimal128, ObjectId, binary.</li>
    <li><strong>_id</strong>: the required primary key of every document. Unique within the collection and always indexed. If you don't supply it, the driver generates an ObjectId.</li>
    <li><strong>ObjectId</strong>: the default <code>_id</code>; read its time back with <code>getTimestamp()</code>.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 600 80" width="600">
    <rect x="0" y="10" width="192" height="34" class="fb sb"/><text x="96" y="32" text-anchor="middle">4 B · timestamp (s)</text>
    <rect x="192" y="10" width="240" height="34" class="fv"/><text x="312" y="32" text-anchor="middle">5 B · random</text>
    <rect x="432" y="10" width="144" height="34" class="ft st"/><text x="504" y="32" text-anchor="middle">3 B · counter</text>
    <text x="0" y="66" font-size="11" class="tm">time comes first → sort by _id ≈ sort by creation; made client-side, no central counter</text>
  </svg><figcaption>ObjectId: 12 bytes, generated by the driver.</figcaption></figure>
  <div class="fx" data-lang="js">// one order document: the items live inside it
{
  _id: 100,
  customer_id: 1,
  order_date: ISODate("2024-05-01"),
  status: "delivered",
  items: [
    { product: "Laptop", category: "Electronics", qty: 1, price: 800 },
    { product: "Lamp",   category: "Furniture",   qty: 2, price: 40 }
  ]
}</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A document is capped at <strong>16 MB</strong>. "Embed everything" fails when an array grows forever (e.g. every click a user ever made). See <em>Schema Design</em>.</p>
  </div>

  <h2 id="mb-when"><span class="num">03</span>When (Not) to Use It</h2>
  <table class="tbl">
    <tr><th>SQL</th><th>MongoDB</th></tr>
    <tr><td>Database</td><td>Database</td></tr>
    <tr><td>Table</td><td>Collection</td></tr>
    <tr><td>Row</td><td>Document</td></tr>
    <tr><td>Column</td><td>Field</td></tr>
    <tr><td>Primary key</td><td><code>_id</code></td></tr>
    <tr><td>JOIN</td><td>Embedding, or <code>$lookup</code> in a pipeline</td></tr>
    <tr><td><code>GROUP BY</code></td><td><code>$group</code> in an aggregation pipeline</td></tr>
    <tr><td>Index</td><td>Index (B-tree, same idea)</td></tr>
    <tr><td>Schema (enforced)</td><td>Optional <code>$jsonSchema</code> validation</td></tr>
  </table>
  <div class="cards">
    <div><b>Good fit</b><p>Data read as a whole unit: product catalogs with varying attributes, user profiles, content, event logs, IoT readings.</p><small>Shape changes often; scale-out needed</small></div>
    <div><b>Poor fit</b><p>Many entities updated together in one transaction: banking ledgers, inventory + orders + payments.</p><small>Relational integrity matters more</small></div>
    <div><b>Poor fit</b><p>Ad-hoc analytics joining many entities in unplanned ways.</p><small>Use SQL or a warehouse</small></div>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>In SQL you design tables around the <em>data</em>, then write any query. In MongoDB you design documents around the <em>queries you know you'll run</em>. Unplanned queries are where it hurts.</p>
  </div>

  <h2 id="mb-create"><span class="num">04</span>Insert</h2>
  <p>The shop as two collections. Collections are created on first insert. Dia has no <code>city</code> field at all (the document version of NULL).</p>
  <div class="fx" data-lang="js">use shop
db.customers.insertMany([
  { _id: 1, name: "Asha", city: "Mumbai", signup_date: ISODate("2024-01-05") },
  { _id: 2, name: "Ben",  city: "Delhi",  signup_date: ISODate("2024-02-10") },
  { _id: 3, name: "Chen", city: "Mumbai", signup_date: ISODate("2024-03-15") },
  { _id: 4, name: "Dia",                  signup_date: ISODate("2024-04-20") }
])
db.orders.insertMany([
  { _id: 100, customer_id: 1, order_date: ISODate("2024-05-01"), status: "delivered",
    items: [ { product: "Laptop", category: "Electronics", qty: 1, price: 800 },
             { product: "Lamp",   category: "Furniture",   qty: 2, price: 40 } ] },
  { _id: 101, customer_id: 1, order_date: ISODate("2024-05-20"), status: "delivered",
    items: [ { product: "Phone",  category: "Electronics", qty: 1, price: 500 } ] },
  { _id: 102, customer_id: 2, order_date: ISODate("2024-06-02"), status: "cancelled",
    items: [ { product: "Desk",   category: "Furniture",   qty: 1, price: 150 } ] },
  { _id: 103, customer_id: 3, order_date: ISODate("2024-06-15"), status: "delivered",
    items: [ { product: "Phone",  category: "Electronics", qty: 2, price: 500 },
             { product: "Desk",   category: "Furniture",   qty: 1, price: 150 } ] },
  { _id: 104, customer_id: 3, order_date: ISODate("2024-07-01"), status: "pending",
    items: [ { product: "Lamp",   category: "Furniture",   qty: 3, price: 40 } ] }
])</div>
  <div class="fx" data-lang="js">{ acknowledged: true, insertedIds: { '0': 100, '1': 101, '2': 102, '3': 103, '4': 104 } }</div>
  <ul>
    <li><code>insertOne(doc)</code> for one document; <code>insertMany([...])</code> for a batch (one round trip).</li>
    <li>Inserting a duplicate <code>_id</code> raises <code>E11000 duplicate key error</code>.</li>
    <li><code>insertMany</code> is <em>ordered</em> by default: it stops at the first error. <code>{ ordered: false }</code> skips bad docs and continues.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The SQL schema had a separate <code>order_items</code> table and a <code>products</code> table. Here the product name, category and price are <strong>copied</strong> into each order. That's deliberate: the price at purchase time should not change if the catalog price changes later.</p>
  </div>

  <h2 id="mb-read"><span class="num">05</span>Find &amp; Filter</h2>
  <p><code>find(filter, projection)</code>. The filter is a document describing what to match; <code>{}</code> matches all.</p>
  <div class="fx" data-lang="js">db.customers.find({ city: "Mumbai" }, { name: 1, _id: 0 })</div>
  <div class="fx" data-lang="js">{ name: 'Asha' }
{ name: 'Chen' }</div>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE city = 'Mumbai';</div>
  <table class="tbl">
    <tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
    <tr><td><code>$eq $ne</code></td><td>= and ≠ (<code>{a: 5}</code> is shorthand for <code>$eq</code>)</td><td><code>{ status: { $ne: "cancelled" } }</code></td></tr>
    <tr><td><code>$gt $gte $lt $lte</code></td><td>Comparisons</td><td><code>{ "items.price": { $gte: 500 } }</code></td></tr>
    <tr><td><code>$in $nin</code></td><td>In / not in a list</td><td><code>{ status: { $in: ["pending", "cancelled"] } }</code></td></tr>
    <tr><td><code>$and $or $not</code></td><td>Logic (fields listed together are already AND)</td><td><code>{ $or: [ {a: 1}, {b: 2} ] }</code></td></tr>
    <tr><td><code>$exists</code></td><td>Field present or not</td><td><code>{ city: { $exists: false } }</code></td></tr>
    <tr><td><code>$regex</code></td><td>Pattern match</td><td><code>{ name: { $regex: /^[AB]/ } }</code></td></tr>
  </table>
  <div class="fx" data-lang="js">db.orders.find(
  { $or: [ { customer_id: 2 }, { status: "pending" } ] },
  { customer_id: 1, status: 1 }
)</div>
  <div class="fx" data-lang="js">{ _id: 102, customer_id: 2, status: 'cancelled' }
{ _id: 104, customer_id: 3, status: 'pending' }</div>
  <p><code>_id</code> is returned unless you exclude it with <code>_id: 0</code>. You can't mix include (1) and exclude (0) for other fields.</p>
  <div class="fx" data-lang="js">db.customers.find({ city: { $exists: false } }, { name: 1 })   // { _id: 4, name: 'Dia' }
db.customers.find({ city: null }, { name: 1 })                 // { _id: 4, name: 'Dia' }
db.customers.find({ name: { $regex: /^[AB]/ } }, { name: 1, _id: 0 })   // Asha, Ben</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>{ city: null }</code> matches documents where city is null <strong>or missing</strong>. To find only missing fields use <code>$exists: false</code>; only explicit nulls, <code>{ city: { $type: "null" } }</code>.</p>
  </div>
  <h3>Sort, limit, skip, count</h3>
  <div class="fx" data-lang="js">db.orders.find({ order_date: { $gte: ISODate("2024-06-01") } }, { order_date: 1 })
  .sort({ order_date: -1 })
  .limit(2)</div>
  <div class="fx" data-lang="js">{ _id: 104, order_date: ISODate('2024-07-01T00:00:00.000Z') }
{ _id: 103, order_date: ISODate('2024-06-15T00:00:00.000Z') }</div>
  <div class="fx" data-lang="js">db.orders.countDocuments({ status: "delivered" })   // 3</div>
  <ul>
    <li><code>1</code> = ascending, <code>-1</code> = descending. The server applies sort → skip → limit, regardless of the order you chain them.</li>
    <li><code>find()</code> returns a <strong>cursor</strong> (a lazy iterator), fetched in batches, not all at once.</li>
    <li><code>countDocuments</code> is exact; <code>estimatedDocumentCount()</code> is fast metadata for the whole collection.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Paginating with <code>skip(10000).limit(20)</code> still walks 10,000 documents. For deep pages use a range on an indexed field: <code>find({ _id: { $gt: lastSeenId } }).limit(20)</code>.</p>
  </div>

  <h2 id="mb-nested"><span class="num">06</span>Nested Fields &amp; Arrays</h2>
  <p><strong>Dot notation</strong> reaches inside objects and arrays. Quote it: <code>"items.product"</code>. On an array, it matches if <em>any</em> element matches.</p>
  <div class="fx" data-lang="js">db.orders.find({ "items.product": "Lamp" }, { _id: 1 })   // 100, 104
db.orders.find({ "items.0.product": "Laptop" }, { _id: 1 })   // 100  (index 0 = first item)</div>
  <div class="callout pred"><span class="label">Predict the output</span>
    <p>Which orders contain an item with qty ≥ 2 <em>and</em> price ≥ 500?</p>
  </div>
  <div class="fx" data-lang="js">db.orders.find({ "items.qty": { $gte: 2 }, "items.price": { $gte: 500 } }, { _id: 1 })
// 100, 103   ← 100 is wrong!

db.orders.find({ items: { $elemMatch: { qty: { $gte: 2 }, price: { $gte: 500 } } } }, { _id: 1 })
// 103</div>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <text x="0" y="14" font-size="11" class="tm">order 100 items</text>
    <rect x="0" y="22" width="170" height="30" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="10" y="42" font-size="11">Laptop  qty 1  <tspan class="tg">price 800</tspan></text>
    <rect x="0" y="58" width="170" height="30" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="10" y="78" font-size="11">Lamp  <tspan class="tg">qty 2</tspan>  price 40</text>
    <text x="200" y="42" font-size="11">without $elemMatch:</text><text x="200" y="58" font-size="11" class="tm">qty ≥ 2 → Lamp ✓, price ≥ 500 → Laptop ✓</text><text x="200" y="76" font-size="11" class="tr">→ order 100 matches (wrong)</text>
    <text x="0" y="114" font-size="11" class="tm">order 103 items</text>
    <rect x="0" y="122" width="170" height="30" rx="5" class="fg sg"/><text x="10" y="142" font-size="11">Phone <tspan class="tg">qty 2  price 500</tspan></text>
    <text x="200" y="124" font-size="11">with $elemMatch: both on the <tspan class="tb">same</tspan> element</text><text x="200" y="142" font-size="11" class="tg">→ only order 103 matches</text>
  </svg><figcaption>Dot-notation conditions are checked against the array separately; $elemMatch ties them to one element.</figcaption></figure>
  <table class="tbl">
    <tr><th>Operator</th><th>Meaning</th><th>Result on shop</th></tr>
    <tr><td><code>{ items: { $size: 2 } }</code></td><td>Array has exactly 2 elements (no ranges)</td><td>100, 103</td></tr>
    <tr><td><code>{ "items.category": { $all: ["Electronics", "Furniture"] } }</code></td><td>Array contains all listed values, any order</td><td>100, 103</td></tr>
    <tr><td><code>{ tags: "vip" }</code></td><td>Array of scalars contains "vip"</td><td>—</td></tr>
  </table>
  <p>Projection works on nested fields too:</p>
  <div class="fx" data-lang="js">db.orders.find({}, { "items.product": 1 }).sort({ _id: 1 }).skip(1).limit(2)</div>
  <div class="fx" data-lang="js">{ _id: 101, items: [ { product: 'Phone' } ] }
{ _id: 102, items: [ { product: 'Desk' } ] }</div>

  <h2 id="mb-update"><span class="num">07</span>Update &amp; Delete</h2>
  <p><code>updateOne(filter, update, options)</code> changes the first match; <code>updateMany</code> changes all matches. The update uses <strong>operators</strong>. The examples run in sequence.</p>
  <div class="fx" data-lang="js">db.orders.updateOne({ _id: 104 }, { $set: { status: "delivered" } })</div>
  <div class="fx" data-lang="js">{ acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }</div>
  <table class="tbl">
    <tr><th>Operator</th><th>Does</th><th>Example</th></tr>
    <tr><td><code>$set</code> / <code>$unset</code></td><td>Set / remove a field</td><td><code>{ $set: { "address.pin": "400001" } }</code></td></tr>
    <tr><td><code>$inc</code></td><td>Add to a number (creates it at 0 if missing)</td><td><code>{ $inc: { loyalty_points: 50 } }</code></td></tr>
    <tr><td><code>$push</code></td><td>Append to array (duplicates allowed)</td><td><code>{ $push: { tags: "vip" } }</code></td></tr>
    <tr><td><code>$addToSet</code></td><td>Append only if not already present</td><td><code>{ $addToSet: { tags: "vip" } }</code></td></tr>
    <tr><td><code>$pull</code></td><td>Remove array elements matching a condition</td><td><code>{ $pull: { items: { product: "Desk" } } }</code></td></tr>
  </table>
  <div class="fx" data-lang="js">db.customers.updateOne({ _id: 1 }, { $inc: { loyalty_points: 50 } })
db.customers.updateOne({ _id: 1 }, { $push: { tags: "vip" } })
db.customers.updateOne({ _id: 1 }, { $addToSet: { tags: "vip" } })   // no change: already there
db.customers.findOne({ _id: 1 })</div>
  <div class="fx" data-lang="js">{ _id: 1, name: 'Asha', city: 'Mumbai', signup_date: ISODate('2024-01-05T00:00:00.000Z'),
  loyalty_points: 50, tags: [ 'vip' ] }</div>
  <div class="fx" data-lang="js">db.orders.updateOne({ _id: 103 }, { $pull: { items: { product: "Desk" } } })
// order 103 items → [ { product: 'Phone', category: 'Electronics', qty: 2, price: 500 } ]

db.orders.updateMany({ status: "delivered" }, { $set: { reviewed: false } })
// matchedCount: 4, modifiedCount: 4   (100, 101, 103, and 104 which we just delivered)</div>
  <h3>Upsert</h3>
  <p><strong>Upsert</strong> = update if found, insert if not. One atomic call instead of "find, then decide".</p>
  <div class="fx" data-lang="js">db.customers.updateOne({ _id: 5 }, { $set: { name: "Esha", city: "Pune" } }, { upsert: true })
// upsertedId: 5 → new doc { _id: 5, name: 'Esha', city: 'Pune' }</div>
  <p>The new document combines the filter's equality fields (<code>_id: 5</code>) with the update. Use <code>$setOnInsert</code> for fields that should be written only on insert (e.g. <code>created_at</code>).</p>
  <h3>The replacement trap</h3>
  <figure class="viz"><svg viewBox="0 0 600 128" width="600">
    <defs><marker id="mb-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="34" width="170" height="54" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/>
    <g font-size="11"><text x="10" y="52">_id: 2, name: "Ben"</text><text x="10" y="68">city: "Delhi"</text><text x="10" y="82">signup_date: …</text></g>
    <line x1="170" y1="52" x2="248" y2="28" stroke="currentColor" marker-end="url(#mb-ar)"/><line x1="170" y1="72" x2="248" y2="96" stroke="currentColor" marker-end="url(#mb-ar)"/>
    <text x="176" y="26" font-size="10" class="tg">$set city</text><text x="172" y="120" font-size="10" class="tr">replaceOne</text>
    <rect x="250" y="0" width="200" height="58" rx="6" class="fg sg"/><g font-size="11"><text x="260" y="17">_id: 2, name: "Ben"</text><text x="260" y="33">city: "Pune"</text><text x="260" y="49" class="tm">signup_date: … kept</text></g>
    <rect x="250" y="70" width="200" height="40" rx="6" class="fr sr"/><g font-size="11"><text x="260" y="88">_id: 2, city: "Pune"</text><text x="260" y="103" class="tr">name, signup_date gone</text></g>
    <text x="465" y="34" font-size="11" class="tg">partial change ✓</text><text x="465" y="94" font-size="11" class="tr">whole doc swapped ✗</text>
  </svg><figcaption>No $ operator = replacement. Everything except _id is overwritten.</figcaption></figure>
  <div class="fx" data-lang="js">db.customers.replaceOne({ _id: 2 }, { city: "Pune" })
db.customers.findOne({ _id: 2 })   // { _id: 2, city: 'Pune' }   ← name and signup_date gone</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A document with no <code>$</code> operators is a <strong>replacement</strong>: everything except <code>_id</code> is overwritten. Modern <code>updateOne</code> rejects this ("Update document requires atomic operators"), but <code>replaceOne</code>, legacy <code>update()</code> and pymongo's <code>replace_one</code> do it silently. Always write <code>{ $set: {...} }</code> for partial changes.</p>
  </div>
  <div class="callout intu"><span class="label">Atomicity</span>
    <p>A write to a <strong>single document</strong> is always atomic, including all its nested arrays. That's why embedding items inside the order means "add item + update total" needs no transaction.</p>
  </div>
  <h3>Delete</h3>
  <div class="fx" data-lang="js">db.orders.deleteMany({ status: "cancelled" })   // { acknowledged: true, deletedCount: 1 }
db.orders.deleteOne({ _id: 999 })                // deletedCount: 0, no error
db.orders.deleteMany({})                         // empties the collection, keeps indexes
db.orders.drop()                                 // removes collection and its indexes</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>There's no foreign key. Deleting customer 1 leaves orders 100 and 101 pointing at a customer that no longer exists. Your code must clean up references.</p>
  </div>

  <h2 id="mb-py"><span class="num">08</span>From Python</h2>
  <p><strong>pymongo</strong> is the official driver. Documents are dicts; methods use snake_case.</p>
  <div class="fx" data-lang="python">from pymongo import MongoClient
import pandas as pd

client = MongoClient("mongodb://localhost:27017")
db = client["shop"]

db.orders.count_documents({"status": "delivered"})          # 3
for o in db.orders.find({"items.product": "Lamp"}, {"_id": 1}):
    print(o)                                                # {'_id': 100}  {'_id': 104}

res = db.customers.update_one({"_id": 4}, {"$set": {"city": "Pune"}})
res.modified_count                                          # 1

# flat fields straight into a DataFrame
df = pd.DataFrame(list(db.orders.find({}, {"items": 0})))</div>
  <table class="tbl out"><caption>df</caption>
    <tr><th>_id</th><th>customer_id</th><th>order_date</th><th>status</th></tr>
    <tr><td>100</td><td>1</td><td>2024-05-01</td><td>delivered</td></tr>
    <tr><td>101</td><td>1</td><td>2024-05-20</td><td>delivered</td></tr>
    <tr><td>102</td><td>2</td><td>2024-06-02</td><td>cancelled</td></tr>
    <tr><td>103</td><td>3</td><td>2024-06-15</td><td>delivered</td></tr>
    <tr><td>104</td><td>3</td><td>2024-07-01</td><td>pending</td></tr>
  </table>
  <p>For nested arrays, <code>json_normalize</code> explodes one row per item and copies parent fields:</p>
  <div class="fx" data-lang="python">docs = list(db.orders.find({"status": "delivered"}))
items = pd.json_normalize(docs, record_path="items", meta=["_id", "customer_id"])</div>
  <table class="tbl out"><caption>items</caption>
    <tr><th>product</th><th>category</th><th>qty</th><th>price</th><th>_id</th><th>customer_id</th></tr>
    <tr><td>Laptop</td><td>Electronics</td><td>1</td><td>800</td><td>100</td><td>1</td></tr>
    <tr><td>Lamp</td><td>Furniture</td><td>2</td><td>40</td><td>100</td><td>1</td></tr>
    <tr><td>Phone</td><td>Electronics</td><td>1</td><td>500</td><td>101</td><td>1</td></tr>
    <tr><td>Phone</td><td>Electronics</td><td>2</td><td>500</td><td>103</td><td>3</td></tr>
    <tr><td>Desk</td><td>Furniture</td><td>1</td><td>150</td><td>103</td><td>3</td></tr>
  </table>
  <div class="callout intu"><span class="label">Practical tips</span>
    <p>Filter and project on the server, not in pandas: pulling a million full documents is slow. For big jobs, aggregate in MongoDB first. For unit tests, <code>mongomock</code> fakes a server in memory.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>ObjectIds come back as <code>bson.ObjectId</code>, not strings. Look up with <code>{"_id": ObjectId("...")}</code>; a plain string matches nothing.</p>
  </div>

  <h2 id="mb-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is BSON and why doesn't MongoDB just store JSON?</summary><div class="qa-body">BSON is binary-encoded JSON. It adds types JSON lacks (dates, int32/int64, Decimal128, ObjectId, binary) and stores lengths, so the server can skip over fields quickly without parsing text.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is inside an ObjectId, and what is one useful consequence?</summary><div class="qa-body">4-byte timestamp (seconds), 5 random bytes, 3-byte counter. Because it starts with time, sorting by <code>_id</code> roughly sorts by insertion time, and you can get the creation time without a separate field. It's generated client-side, so no central counter is needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: names of customers in Mumbai or Delhi, sorted by name, without _id.</summary><div class="qa-body"><code>db.customers.find({ city: { $in: ["Mumbai", "Delhi"] } }, { name: 1, _id: 0 }).sort({ name: 1 })</code> → Asha, Ben, Chen.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>db.customers.find({ city: null })</code></summary><div class="qa-body">Dia. She has no <code>city</code> field, and <code>null</code> matches both missing and explicit null. Use <code>{ city: { $exists: false } }</code> to target only missing fields.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>find({"items.qty": {$gte: 2}, "items.price": {$gte: 500}})</code> returns orders 100 and 103. Why 100, and how do you fix it?</summary><div class="qa-body">Each condition is checked against the array independently: Lamp (qty 2) satisfies one, Laptop (price 800) the other. Fix: <code>{ items: { $elemMatch: { qty: { $gte: 2 }, price: { $gte: 500 } } } }</code> → only 103.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between <code>$push</code> and <code>$addToSet</code>?</summary><div class="qa-body"><code>$push</code> always appends, so duplicates can occur. <code>$addToSet</code> appends only if the exact value isn't already present, so the array behaves like a set. For objects, "exact" means the same fields in the same order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A teammate runs <code>replaceOne({_id: 2}, {city: "Pune"})</code> to move Ben to Pune. What happens?</summary><div class="qa-body">The whole document is replaced: Ben's <code>name</code> and <code>signup_date</code> are gone, leaving <code>{ _id: 2, city: "Pune" }</code>. Correct: <code>updateOne({ _id: 2 }, { $set: { city: "Pune" } })</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does upsert do, and when is it useful?</summary><div class="qa-body">If the filter matches, it updates; if not, it inserts a new document built from the filter's equality fields plus the update. Useful for idempotent loads ("sync this record") and counters (<code>$inc</code> with upsert creates the counter on first hit), avoiding a race between "check" and "insert".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is updating one order and its embedded items atomic? Is updating an order and a customer atomic?</summary><div class="qa-body">The first, yes: any write to a single document is atomic. The second spans two documents, so it is not atomic unless you wrap it in a multi-document transaction (which costs more).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>skip(100000).limit(20)</code> slow, and what's the alternative?</summary><div class="qa-body">The server still walks and discards 100,000 documents. Use keyset pagination: remember the last <code>_id</code> (or sort key) of the page and query <code>{ _id: { $gt: last } }</code> with <code>limit(20)</code>, which uses the index directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need order items in a pandas DataFrame, one row per item. How?</summary><div class="qa-body">Fetch with a filter and projection, then <code>pd.json_normalize(docs, record_path="items", meta=["_id", "customer_id"])</code>. Or do it server-side with an aggregation <code>$unwind</code> and load the flat result.</div></details>
</main>`
});
