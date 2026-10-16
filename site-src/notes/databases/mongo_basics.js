// notes/databases/mongo_basics.js — Documents & CRUD
Object.assign(TOPIC_CONTENT, {
  "mongo_basics": `<main>
  <h1>Documents &amp; CRUD</h1>
  <p class="lead">MongoDB stores data as nested JSON-like documents instead of rows. This page models the same shop as documents and shows how to insert, query, update and delete them, with every result shown.</p>

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
      <div class="rm-item rm-done" data-target="mb-rev"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="mb-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mb-why"><span class="num">01</span>What MongoDB Is</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>MongoDB is a <strong>document database</strong>: each record is a JSON-like object that can hold nested objects and arrays. No fixed columns, no JOINs needed for data that belongs together.</p>
  </div>
  <p>Why it exists:</p>
  <ul>
    <li><strong>Nested data fits naturally.</strong> An order with its line items is one object, not rows spread across two tables.</li>
    <li><strong>Developer speed.</strong> Documents map 1:1 to objects in code (a Python dict). Adding a field needs no migration.</li>
    <li><strong>Horizontal scale.</strong> Self-contained documents can be split across many machines (sharding) without cross-machine joins.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>SQL is a set of <strong>linked spreadsheets</strong>: customers in one, orders in another, items in a third, tied by ID columns. MongoDB is a <strong>folder of self-contained forms</strong>: each order form lists its items right on it. Reading one form is easy; answering "total Lamps sold across all forms" means flipping through every form.</p>
  </div>

  <h2 id="mb-doc"><span class="num">02</span>Documents &amp; Collections</h2>
  <ul>
    <li><strong>Document</strong>: one record, a set of field–value pairs. Values can be objects or arrays.</li>
    <li><strong>Collection</strong>: a group of documents, like a table. Documents in it <em>may</em> have different shapes.</li>
    <li><strong>BSON</strong> (Binary JSON): the on-disk format. Adds types JSON lacks: dates, 64-bit ints, Decimal128, ObjectId, binary.</li>
    <li><strong>_id</strong>: the required primary key of every document. Unique within the collection and always indexed. If you don't supply it, the driver generates an ObjectId.</li>
    <li><strong>ObjectId</strong>: a 12-byte value: 4-byte timestamp + 5 random bytes + 3-byte counter. Roughly sortable by creation time, and you can read the time back with <code>getTimestamp()</code>.</li>
  </ul>
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
  <div class="callout trap"><span class="label">Trap</span>
    <p>Without <code>$elemMatch</code>, each condition may be satisfied by a <strong>different</strong> element. Order 100 matched because the Lamp has qty 2 and the Laptop has price 800. <code>$elemMatch</code> forces both conditions onto the same element.</p>
  </div>
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

  <h2 id="mb-rev"><span class="num">09</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Document</strong> = nested JSON-like record (BSON on disk, 16 MB max); <strong>collection</strong> = group of documents.</li>
    <li>Every document has a unique, indexed <strong>_id</strong>; default is a 12-byte <strong>ObjectId</strong> starting with a timestamp.</li>
    <li>Pick MongoDB for data read as one unit, varying shapes and scale-out; avoid it for multi-entity transactions and ad-hoc joins.</li>
    <li><code>find(filter, projection)</code>; operators <code>$gt $in $or $exists $regex</code>; <code>_id</code> shows unless <code>_id: 0</code>.</li>
    <li><code>{ field: null }</code> matches null <strong>and</strong> missing.</li>
    <li>Dot notation matches <em>any</em> array element; use <strong>$elemMatch</strong> when several conditions must hit the same element.</li>
    <li><code>$set $inc $push $addToSet $pull</code>; <code>updateMany</code> for all matches; <code>upsert: true</code> inserts if nothing matches.</li>
    <li>An update without <code>$</code> operators is a <strong>replacement</strong>: other fields vanish.</li>
    <li>Single-document writes are atomic; no foreign keys, so deletes don't cascade.</li>
    <li>pymongo + <code>pd.json_normalize(record_path=...)</code> flattens nested arrays.</li>
  </ol></div>

  <h2 id="mb-qa"><span class="num">10</span>Questions &amp; Answers</h2>
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
