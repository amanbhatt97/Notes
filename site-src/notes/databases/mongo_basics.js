// notes/databases/mongo_basics.js — Documents & CRUD
Object.assign(TOPIC_CONTENT, {
  "mongo_basics": `<main>
  <h1>Documents &amp; CRUD</h1>
  <p class="lead">MongoDB stores each record as one nested, JSON-like document instead of rows spread over several tables. This page builds a small shop as documents and walks through Create, Read, Update and Delete (CRUD) one idea at a time. Every command was run on a real MongoDB 8 server and every result shown is the real output. Builds on basic SQL and Python dicts.</p>

  <h2 id="mb-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">MongoDB: Documents &amp; CRUD</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What &amp; why</div>
        <ul>
          <li><b>Document database</b> — one record = one nested JSON-like object; no fixed columns</li>
          <li><b>Why</b> — an order and its items are one object; one read, one atomic write, no JOIN</li>
          <li><b>Maps to code</b> — document = Python dict; new field needs no migration</li>
          <li><b>Scale-out</b> — self-contained docs split across machines easily</li>
          <li>💡 SQL = linked registers; Mongo = file of self-contained forms</li>
          <li><b>Design rule</b> — shape documents around the queries you will run</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Documents &amp; collections</div>
        <ul>
          <li><b>Collection</b> ≈ table; docs in it may differ in shape</li>
          <li><b>BSON</b> — binary JSON + dates, int64, Decimal128, ObjectId; lengths stored so fields can be skipped</li>
          <li><b>_id</b> — required, unique, always indexed; driver adds an ObjectId if you don't</li>
          <li><b>ObjectId</b> — 12 bytes: 4 time + 5 random + 3 counter; <code>getTimestamp()</code></li>
          <li>⚠ <b>16 MB</b> doc cap — never embed an array that grows forever</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SQL ↔ Mongo &amp; fit</div>
        <ul>
          <li><b>table / row / column</b> → collection / document / field</li>
          <li><b>JOIN</b> → embed, or <code>$lookup</code>; <b>GROUP BY</b> → <code>$group</code></li>
          <li><b>Schema</b> → optional <code>$jsonSchema</code> validator</li>
          <li><b>Good fit</b> — catalogs, profiles, content, events, IoT, app back-ends</li>
          <li><b>Poor fit</b> — ledgers (many-entity transactions), ad-hoc join analytics</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Insert</div>
        <ul>
          <li><b>insertOne / insertMany</b> — batch = one round trip; collection auto-created</li>
          <li><b>Duplicate _id</b> → <code>E11000 duplicate key error</code></li>
          <li><b>Ordered</b> (default) stops at first error; <code>{ ordered: false }</code> continues</li>
          <li><b>Missing field</b> = the document version of NULL</li>
          <li><b>Snapshot</b> — copy product name/price into the order at purchase time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Find &amp; filter</div>
        <ul>
          <li><b>find(filter, projection)</b> — <code>{}</code> = all; <code>{ name: 1, _id: 0 }</code></li>
          <li><b>Operators</b> — <code>$eq $ne $gt $gte $lt $lte $in $nin $or $and $not $exists $regex</code></li>
          <li><b>Fields side by side</b> = AND</li>
          <li><b>findOne</b> — one doc or <code>null</code></li>
          <li>⚠ Can't mix 1 and 0 in projection (except <code>_id: 0</code>)</li>
          <li>⚠ <code>{ city: null }</code> matches null <em>and</em> missing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sort, limit, pages</div>
        <ul>
          <li><b>sort({ f: 1 / -1 })</b> · <b>limit(n)</b> · <b>skip(n)</b></li>
          <li>Server always does sort → skip → limit, whatever the chain order</li>
          <li><b>Cursor</b> — lazy, fetched in batches; <code>next()</code>, <code>toArray()</code></li>
          <li><b>countDocuments</b> exact · <b>estimatedDocumentCount</b> fast metadata</li>
          <li>⚠ <b>Deep skip</b> walks every skipped doc → keyset: <code>{ _id: { $gt: last } }</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Nested &amp; arrays</div>
        <ul>
          <li><b>Dot notation</b> — <code>"items.product"</code>; on an array = <em>any</em> element</li>
          <li><b>Position</b> — <code>"items.0.product"</code></li>
          <li>⚠ Two conditions can hit two different elements → <code>$elemMatch</code></li>
          <li><b>$size</b> exact length · <b>$all</b> contains all values</li>
          <li>⚠ <code>{ items: { product: "Lamp" } }</code> = whole-object exact match</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Update</div>
        <ul>
          <li><b>updateOne / updateMany</b> + <code>$set $unset $inc $push $addToSet $pull</code></li>
          <li><b>matchedCount vs modifiedCount</b> — found vs actually changed</li>
          <li><b>"items.$"</b> — the element the filter matched</li>
          <li><b>Upsert</b> — update or insert; <code>$setOnInsert</code> for insert-only fields</li>
          <li>⚠ <b>replaceOne</b> — swaps whole doc; other fields vanish</li>
          <li><b>Atomic</b> — any single-document write, nested arrays included</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Delete</div>
        <ul>
          <li><b>deleteOne / deleteMany</b> — no match = deletedCount 0, no error</li>
          <li><b>deleteMany({})</b> keeps indexes · <b>drop()</b> removes collection + indexes</li>
          <li>⚠ <b>No foreign keys</b> — nothing cascades; orphans stay</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">From Python</div>
        <ul>
          <li><b>pymongo</b> — dicts in/out, snake_case: <code>count_documents</code>, <code>update_one</code></li>
          <li><b>Flat → DataFrame</b> — <code>pd.DataFrame(list(cursor))</code></li>
          <li><b>Nested → rows</b> — <code>pd.json_normalize(docs, record_path="items", meta=[…])</code></li>
          <li><b>Filter/project on server</b>; <code>mongomock</code> for unit tests</li>
          <li>⚠ <b>ObjectId</b> — a string never matches; wrap in <code>ObjectId("…")</code></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mb-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What MongoDB Is</span><span class="rm-sub">Self-contained forms, not linked registers</span></div></div>
      <div class="rm-item rm-done" data-target="mb-doc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Documents &amp; Collections</span><span class="rm-sub">BSON, _id, ObjectId</span></div></div>
      <div class="rm-item rm-done" data-target="mb-when"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">When (Not) to Use It</span><span class="rm-sub">Terminology map and fit</span></div></div>
      <div class="rm-item rm-done" data-target="mb-create"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Insert</span><span class="rm-sub">The shop as documents</span></div></div>
      <div class="rm-item rm-done" data-target="mb-read"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Find &amp; Filter</span><span class="rm-sub">Operators and projection</span></div></div>
      <div class="rm-item rm-done" data-target="mb-sort"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Sort, Limit &amp; Pages</span><span class="rm-sub">Cursors, counts, keyset paging</span></div></div>
      <div class="rm-item rm-done" data-target="mb-nested"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Nested Fields &amp; Arrays</span><span class="rm-sub">Dot notation, $elemMatch</span></div></div>
      <div class="rm-item rm-done" data-target="mb-update"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Update</span><span class="rm-sub">$set, $push, upsert, the replace trap</span></div></div>
      <div class="rm-item rm-done" data-target="mb-delete"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Delete</span><span class="rm-sub">deleteMany vs drop, no cascade</span></div></div>
      <div class="rm-item rm-done" data-target="mb-py"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">From Python</span><span class="rm-sub">pymongo to pandas, mongomock</span></div></div>
      <div class="rm-item rm-done" data-target="mb-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ones that fail silently</span></div></div>
      <div class="rm-item rm-done" data-target="mb-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mb-why"><span class="num">01</span>What MongoDB Is</h2>
  <p>Think of one online order: Asha buys a laptop and two lamps. In a SQL database that single order is split across three tables. The <code>orders</code> table has one row (order 100, customer 1). The <code>order_items</code> table has two rows (order 100 + product 10, order 100 + product 13). The <code>products</code> table holds the names and prices. To show the order page you must JOIN all three back together. Every read pays for that re-assembly, and every write must touch several tables.</p>
  <p>MongoDB takes a different view. If the order and its items are always read together, store them together, as <strong>one object</strong>. That object is called a <strong>document</strong>. It looks like a JSON object or a Python dict: fields with values, and a value may itself be a list or another object.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <text x="0" y="14" font-weight="bold">SQL: linked tables</text>
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
  </svg><figcaption>The same order. In SQL it is re-built by joins; in MongoDB the items live inside the order document.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A SQL database is like a kirana shop's set of <strong>linked registers</strong>: a customer register, a bill register, an item register, all tied by numbers. To see one bill you flip between three books. MongoDB is like a <strong>file of self-contained bill copies</strong>: each carbon copy has the customer, every line item and the price written on it. Reading one bill is instant. But "how many lamps did we sell this year?" means flipping through every copy.</p>
  </div>
  <p>Step by step, what it costs to show order 100:</p>
  <table class="tbl">
    <tr><th>Step</th><th>SQL</th><th>MongoDB</th></tr>
    <tr><td>1</td><td>Find row 100 in <code>orders</code></td><td>Find document 100 in <code>orders</code></td></tr>
    <tr><td>2</td><td>Find its 2 rows in <code>order_items</code></td><td>Done: items are inside it</td></tr>
    <tr><td>3</td><td>Look up 2 products in <code>products</code></td><td>Done: name and price were copied in</td></tr>
    <tr><td>Change "add a lamp"</td><td>Insert item row, update total: 2 tables, needs a transaction</td><td>One update to one document, always atomic</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MongoDB</strong> is a <strong>document database</strong> (a kind of NoSQL database). Each record is a document: a set of field–value pairs that may hold nested objects and arrays. Documents live in <strong>collections</strong>. There are no fixed columns and no JOINs for data that is stored together.</p>
  </div>
  <div class="cards">
    <div><b>Nested data fits</b><p>An order and its items are one object, read and written as a unit.</p></div>
    <div><b>Developer speed</b><p>A document is a Python dict. Adding a field needs no <code>ALTER TABLE</code>.</p></div>
    <div><b>Scale-out</b><p>Self-contained documents can be spread across many machines without cross-machine joins.</p></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Schemaless" does not mean "no design". In SQL you design tables around the <em>data</em> and can write almost any query later. In MongoDB you design documents around the <em>queries you know you will run</em>. A query you did not plan for (like "lamps sold per month") can be slow or awkward.</p>
  </div>
  <p>Where you meet it: app back-ends (user profiles, carts, product catalogs), event and log storage, content systems, and as a source you pull data from in data-science work. Interviews ask "SQL vs NoSQL, when would you choose which?" and "embed or reference?".</p>

  <h2 id="mb-doc"><span class="num">02</span>Documents &amp; Collections</h2>
  <p>Before writing any query you need four words: document, collection, BSON and <code>_id</code>. Without them, error messages and outputs will look like noise.</p>
  <p>A <strong>document</strong> is one record. A <strong>collection</strong> is a group of documents, like a table. Unlike a table, documents in one collection do not have to share the same fields: one customer may have a <code>city</code>, another may not. A <strong>database</strong> holds collections, as in SQL.</p>
  <p>Every document must have a field called <code>_id</code>. It is the primary key: unique inside the collection and automatically indexed (an <strong>index</strong> is a sorted lookup structure that makes finding by that field fast). If you insert without one, the driver (the client library) creates one for you, of type <strong>ObjectId</strong>.</p>
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
  <p>Read it top to bottom: a number <code>_id</code>, a reference to the customer, a real date (not a string), a status, and an array of two item objects. Field names do not need quotes in the shell (<code>mongosh</code>, MongoDB's JavaScript command line).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An ObjectId is like a railway PNR number that the booking counter prints itself, without phoning a head office. Part of it is the time of booking, part is the counter's own random code, part is a running count. Two counters never clash, and you can read roughly when it was booked.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 80" width="600">
    <rect x="0" y="10" width="192" height="34" class="fb sb"/><text x="96" y="32" text-anchor="middle">4 B · timestamp (s)</text>
    <rect x="192" y="10" width="240" height="34" class="fv sb"/><text x="312" y="32" text-anchor="middle">5 B · random</text>
    <rect x="432" y="10" width="144" height="34" class="ft st"/><text x="504" y="32" text-anchor="middle">3 B · counter</text>
    <text x="0" y="66" font-size="11" class="tm">time comes first → sort by _id ≈ sort by creation; made client-side, no central counter</text>
  </svg><figcaption>ObjectId: 12 bytes, shown as 24 hex characters, generated by the driver.</figcaption></figure>
  <p>This code reads the time out of a known ObjectId, then inserts a document without an <code>_id</code> to see what the server stores.</p>
  <div class="fx" data-lang="js">const oid = ObjectId("66320a8f1c9d440000a1b2c3")
oid.getTimestamp()
db.scratch.insertOne({ name: "no id given" })
db.scratch.findOne()
db.scratch.drop()</div>
  <div class="fx" data-lang="text">ISODate('2024-05-01T09:25:35.000Z')
{
  acknowledged: true,
  insertedId: ObjectId('6ad599e0fda6727991540fe6')
}
{ _id: ObjectId('6ad599e0fda6727991540fe6'), name: 'no id given' }
true</div>
  <p><code>getTimestamp()</code> decoded the first 4 bytes (<code>66320a8f</code>) into a date. The <code>insertOne</code> result shows the <code>insertedId</code> the driver generated, and <code>findOne</code> shows it saved in the document. <code>drop()</code> deletes the scratch collection again (<code>true</code>). Your ObjectId will differ: it depends on the current time.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>BSON</strong> (Binary JSON) is how MongoDB stores documents on disk and sends them over the network. It adds types JSON lacks: real dates, 32/64-bit integers, <code>Decimal128</code> (exact money), <code>ObjectId</code> and binary. It also stores each field's length, so the server can skip fields without reading every character.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A document is capped at <strong>16 MB</strong>. "Embed everything" fails when an array grows forever, such as every click a user ever made. See <a class="xref" data-note="mongo_design">Schema Design</a> for the fix.</p>
  </div>
  <p>Interviews like "what is inside an ObjectId?" and "why BSON and not JSON?". The timestamp prefix is the useful part: sorting by <code>_id</code> roughly sorts by creation time.</p>

  <h2 id="mb-when"><span class="num">03</span>When (Not) to Use It</h2>
  <p>A team that picks MongoDB for a banking ledger, or Postgres for a product catalog where every product has different attributes, will fight its database every day. The choice should follow the shape of the data and the queries.</p>
  <p>First, translate the vocabulary. Most ideas carry over; only the names change.</p>
  <table class="tbl">
    <tr><th>SQL</th><th>MongoDB</th></tr>
    <tr><td>Database</td><td>Database</td></tr>
    <tr><td>Table</td><td>Collection</td></tr>
    <tr><td>Row</td><td>Document</td></tr>
    <tr><td>Column</td><td>Field</td></tr>
    <tr><td>Primary key</td><td><code>_id</code></td></tr>
    <tr><td>JOIN</td><td>Embedding, or <code>$lookup</code> in a pipeline</td></tr>
    <tr><td><code>GROUP BY</code></td><td><code>$group</code> in an <a class="xref" data-note="mongo_aggregation">aggregation pipeline</a></td></tr>
    <tr><td>Index</td><td>Index (B-tree, same idea)</td></tr>
    <tr><td>Enforced schema</td><td>Optional <code>$jsonSchema</code> validation</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tailor's shop keeps each customer's measurements on one card: chest, sleeve, and whatever odd extra a customer needs ("left shoulder lower"). Cards differ, and that is fine; each is read whole. A bank branch cannot work like that: a transfer must change two accounts and the day's ledger together, or not at all. The tailor wants documents; the bank wants relational tables.</p>
  </div>
  <p>A quick test, applied to two examples:</p>
  <table class="tbl">
    <tr><th>Question</th><th>Product catalog</th><th>Money transfer</th></tr>
    <tr><td>Is one record read as a whole unit?</td><td>Yes: product page</td><td>No: two accounts + ledger</td></tr>
    <tr><td>Do records have different shapes?</td><td>Yes: phones have RAM, sofas have fabric</td><td>No: same columns</td></tr>
    <tr><td>Must many records change together?</td><td>Rarely</td><td>Always</td></tr>
    <tr><td>Verdict</td><td><strong>Documents fit</strong></td><td><strong>Relational fits</strong></td></tr>
  </table>
  <div class="cards">
    <div><b>Good fit</b><p>Data read as a whole unit: product catalogs with varying attributes, user profiles, content, event logs, IoT readings.</p><small>Shape changes often; scale-out needed</small></div>
    <div><b>Poor fit</b><p>Many entities updated together in one transaction: banking ledgers, inventory + orders + payments.</p><small>Relational integrity matters more</small></div>
    <div><b>Poor fit</b><p>Ad-hoc analytics joining many entities in unplanned ways.</p><small>Use SQL or a data warehouse</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Query-driven design</strong>: in MongoDB you list the questions the application asks most often and shape the documents so each question is answered by reading one document or one simple range. SQL instead uses <strong>normalization</strong>: each fact stored once, joined when needed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"MongoDB has no transactions" is outdated. It has multi-document transactions since version 4.0. They work, but cost more than in a relational database. If most of your writes need them, the data is probably relational.</p>
  </div>
  <p>In interviews, give a reason, not a slogan: "documents when data is read as a unit and the shape varies; relational when many entities change together or queries are unplanned." Many teams also use PostgreSQL with a JSONB column instead; that comparison is in <a class="xref" data-note="mongo_design">Schema Design</a>.</p>

  <h2 id="mb-create"><span class="num">04</span>Insert</h2>
  <p>You cannot query anything until data is in. In SQL you first run <code>CREATE TABLE</code> with every column. In MongoDB there is no such step: the first insert into a collection creates it.</p>
  <p>Two commands do the work. <code>insertOne(doc)</code> adds one document. <code>insertMany([doc, doc, ...])</code> adds a batch in one network round trip, which is much faster than many single inserts.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Dropping forms into a new box file. The box is created the moment the first form goes in. Each form needs a unique token number (<code>_id</code>); a second form with the same token is rejected at the counter.</p>
  </div>
  <p>This code switches to a database called <code>shop</code> and inserts four customers and five orders. These documents are used for the rest of this page and in <a class="xref" data-note="mongo_aggregation">Aggregation</a>. Notice that Dia has no <code>city</code> field at all.</p>
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
  <div class="fx" data-lang="text">{ acknowledged: true, insertedIds: { '0': 1, '1': 2, '2': 3, '3': 4 } }
{
  acknowledged: true,
  insertedIds: { '0': 100, '1': 101, '2': 102, '3': 103, '4': 104 }
}</div>
  <p><code>acknowledged: true</code> means the server confirmed the write. <code>insertedIds</code> maps each position in your array (<code>'0'</code>, <code>'1'</code>, ...) to the <code>_id</code> stored. Because we gave our own <code>_id</code>s, they are 1–4 and 100–104.</p>
  <p>Now the failure cases. First a duplicate <code>_id</code>, then a batch with a duplicate in the middle, run once ordered (default) and once with <code>ordered: false</code>.</p>
  <div class="fx" data-lang="js">db.customers.insertOne({ _id: 1, name: "Asha again" })

db.t.insertMany([{ _id: 1 }, { _id: 1 }, { _id: 2 }])
db.t.countDocuments()
db.t.drop()
db.t.insertMany([{ _id: 1 }, { _id: 1 }, { _id: 2 }], { ordered: false })
db.t.countDocuments()
db.t.drop()</div>
  <div class="fx" data-lang="text">Uncaught MongoServerError: E11000 duplicate key error collection: shop.customers index: _id_ dup key: { _id: 1 }
MongoBulkWriteError: E11000 duplicate key error ...   insertedIds: { '0': 1 }
1
true
MongoBulkWriteError: E11000 duplicate key error ...   insertedIds: { '0': 1, '2': 2 }
2
true</div>
  <p>The bulk errors are shortened here; the real ones also list each failed write. The key line is <code>insertedIds</code>. Ordered: document 0 went in, document 1 failed, and the server <strong>stopped</strong>, so <code>{ _id: 2 }</code> was never tried (count 1). Unordered: it skipped the bad one and continued (count 2).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>E11000</strong> is the duplicate-key error code: an insert or update would put a second copy of a value into a unique index. <strong>Ordered insert</strong>: stop at the first error. <strong>Unordered</strong>: try every document, report all errors at the end.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Neither mode rolls back. Documents inserted before the error stay. And notice the product name and price are <strong>copied</strong> into each order. That is on purpose: the price paid must not change when the catalog price changes next month.</p>
  </div>
  <p>Real use: bulk loading data from a CSV or an API. Use <code>insertMany</code> with <code>ordered: false</code> when a few bad rows should not stop the whole load.</p>

  <h2 id="mb-read"><span class="num">05</span>Find &amp; Filter</h2>
  <p>With data in, you need to ask questions: "customers in Mumbai", "orders not cancelled". In SQL you write a <code>WHERE</code> clause as text. In MongoDB you describe the match as a document, called the <strong>filter</strong>.</p>
  <p>The command is <code>find(filter, projection)</code>. The filter says <em>which</em> documents. The optional <strong>projection</strong> says <em>which fields</em> to return: <code>1</code> means include, <code>0</code> means exclude. An empty filter <code>{}</code> matches everything.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A filter is like filling a "search form" at a library counter: you write "City: Mumbai" in the box and leave other boxes blank. The projection is telling the clerk "only photocopy the Name line, not the whole card".</p>
  </div>
  <div class="fx" data-lang="js">db.customers.find({ city: "Mumbai" }, { name: 1, _id: 0 })</div>
  <div class="fx" data-lang="text">[ { name: 'Asha' }, { name: 'Chen' } ]</div>
  <p>The filter <code>{ city: "Mumbai" }</code> means "city equals Mumbai". The projection keeps <code>name</code> and drops <code>_id</code>, which is returned by default. The same in SQL:</p>
  <div class="fx" data-lang="sql">SELECT name FROM customers WHERE city = 'Mumbai';</div>
  <p>For anything other than "equals", put an <strong>operator</strong> (a keyword starting with <code>$</code>) inside the field's value:</p>
  <table class="tbl">
    <tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
    <tr><td><code>$eq $ne</code></td><td>= and ≠ (<code>{a: 5}</code> is short for <code>$eq</code>)</td><td><code>{ status: { $ne: "cancelled" } }</code></td></tr>
    <tr><td><code>$gt $gte $lt $lte</code></td><td>&gt; ≥ &lt; ≤</td><td><code>{ order_date: { $gte: ISODate("2024-06-01") } }</code></td></tr>
    <tr><td><code>$in $nin</code></td><td>In / not in a list</td><td><code>{ status: { $in: ["pending", "cancelled"] } }</code></td></tr>
    <tr><td><code>$and $or $not</code></td><td>Logic (fields side by side are already AND)</td><td><code>{ $or: [ {a: 1}, {b: 2} ] }</code></td></tr>
    <tr><td><code>$exists</code></td><td>Field present or not</td><td><code>{ city: { $exists: false } }</code></td></tr>
    <tr><td><code>$regex</code></td><td>Pattern match on text</td><td><code>{ name: { $regex: /^[AB]/ } }</code></td></tr>
  </table>
  <p>This code runs four filters: an AND of two fields, an OR, an <code>$in</code>, and two ways to look for a missing city.</p>
  <div class="fx" data-lang="js">db.orders.find({ customer_id: 3, status: "delivered" }, { _id: 1 })
db.orders.find({ $or: [ { customer_id: 2 }, { status: "pending" } ] }, { customer_id: 1, status: 1 })
db.orders.find({ status: { $in: ["pending", "cancelled"] } }, { status: 1 })
db.customers.find({ city: { $exists: false } }, { name: 1 })
db.customers.find({ city: null }, { name: 1 })</div>
  <div class="fx" data-lang="text">[ { _id: 103 } ]
[
  { _id: 102, customer_id: 2, status: 'cancelled' },
  { _id: 104, customer_id: 3, status: 'pending' }
]
[ { _id: 102, status: 'cancelled' }, { _id: 104, status: 'pending' } ]
[ { _id: 4, name: 'Dia' } ]
[ { _id: 4, name: 'Dia' } ]</div>
  <p>Line 1: two fields in one filter must both match, so only order 103 (customer 3 <em>and</em> delivered). Line 2: <code>$or</code> takes a list of filters; 102 matches the first, 104 the second. Lines 4 and 5 both find Dia, but for different reasons, which the trap below explains. <code>findOne(filter)</code> returns the first match as a single document, or <code>null</code> if none match.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Filter</strong>: a document of conditions; all top-level conditions must hold (implicit AND). <strong>Projection</strong>: which fields to return. You cannot mix include (1) and exclude (0) except for <code>_id: 0</code>: <code>{ name: 1, city: 0 }</code> fails with <code>Cannot do exclusion on field city in inclusion projection</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>{ city: null }</code> matches documents where city is null <strong>or missing</strong>. To find only missing fields use <code>{ city: { $exists: false } }</code>; only explicit nulls, <code>{ city: { $type: "null" } }</code>. Data-cleaning scripts that count "nulls" get this wrong all the time.</p>
  </div>

  <h2 id="mb-sort"><span class="num">06</span>Sort, Limit &amp; Pages</h2>
  <p>A shop app needs "latest 2 orders", "page 3 of results" and "how many delivered?". Returning everything and slicing it in Python wastes network and memory. MongoDB does it on the server with three methods chained after <code>find</code>: <code>sort</code>, <code>skip</code> and <code>limit</code>.</p>
  <p><code>sort({ field: 1 })</code> is ascending, <code>-1</code> descending. <code>limit(n)</code> keeps the first n. <code>skip(n)</code> throws away the first n. Several sort keys are applied left to right, like SQL's <code>ORDER BY a, b DESC</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A stack of exam answer sheets. Sort = arrange them by roll number. Skip 20 = set the first 20 aside. Limit 10 = pick up the next 10. A teacher always sorts first, whatever order you shouted the instructions in. MongoDB does the same.</p>
  </div>
  <p>This code gets the 2 newest orders since June, shows that chain order does not matter, and fetches page 2 (2 per page) in two ways.</p>
  <div class="fx" data-lang="js">db.orders.find({ order_date: { $gte: ISODate("2024-06-01") } }, { order_date: 1 }).sort({ order_date: -1 }).limit(2)
db.orders.find({}, { _id: 1 }).limit(2).sort({ _id: -1 })     // limit written first
db.orders.find({}, { _id: 1 }).sort({ _id: 1 }).skip(2).limit(2)
db.orders.find({ _id: { $gt: 101 } }, { _id: 1 }).sort({ _id: 1 }).limit(2)
db.orders.countDocuments({ status: "delivered" })
db.orders.estimatedDocumentCount()</div>
  <div class="fx" data-lang="text">[
  { _id: 104, order_date: ISODate('2024-07-01T00:00:00.000Z') },
  { _id: 103, order_date: ISODate('2024-06-15T00:00:00.000Z') }
]
[ { _id: 104 }, { _id: 103 } ]
[ { _id: 102 }, { _id: 103 } ]
[ { _id: 102 }, { _id: 103 } ]
3
5</div>
  <p>The second query wrote <code>limit</code> before <code>sort</code> and still got the two highest ids: the server always applies sort → skip → limit. The third and fourth return the same page. The third skips 2 documents; the fourth (<strong>keyset pagination</strong>) starts after the last <code>_id</code> seen on page 1, which was 101.</p>
  <table class="tbl out"><caption>Why keyset wins on deep pages (20 per page)</caption>
    <tr><th>Page</th><th>skip/limit reads</th><th>keyset reads</th></tr>
    <tr><td>1</td><td>20</td><td>20</td></tr>
    <tr><td>50</td><td>1,000 (980 thrown away)</td><td>20</td></tr>
    <tr><td>5,000</td><td>100,000</td><td>20</td></tr>
  </table>
  <p><code>find()</code> does not return a list. It returns a <strong>cursor</strong>: a lazy pointer that fetches results in batches as you read them. In the shell, <code>cur.next()</code> gives one document and <code>cur.toArray()</code> pulls all of them.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>countDocuments(filter)</strong>: exact count, runs the query. <strong>estimatedDocumentCount()</strong>: whole-collection count from metadata, instant, no filter. <strong>Keyset pagination</strong>: page by a range on an indexed sort key instead of <code>skip</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>skip(100000).limit(20)</code> still walks 100,000 documents and throws them away. Also, without <code>sort</code>, MongoDB does not promise any order; the "natural" order you see can change after updates.</p>
  </div>
  <p>Backend interviews ask exactly this: "how would you paginate an infinite feed?" Answer: keyset on <code>(created_at, _id)</code> with an index.</p>

  <h2 id="mb-nested"><span class="num">07</span>Nested Fields &amp; Arrays</h2>
  <p>Our orders keep products inside an <code>items</code> array. "Which orders contain a Lamp?" cannot be written as <code>{ product: "Lamp" }</code>, because there is no top-level <code>product</code> field. You need a way to reach inside.</p>
  <p><strong>Dot notation</strong> does that: <code>"items.product"</code> means "the product field inside items". The quotes are required because of the dot. When the path goes through an array, the condition is true if <strong>any</strong> element matches. A number in the path picks a position: <code>"items.0.product"</code> is the first item's product.</p>
  <div class="fx" data-lang="js">db.orders.find({ "items.product": "Lamp" }, { _id: 1 })
db.orders.find({ "items.0.product": "Laptop" }, { _id: 1 })</div>
  <div class="fx" data-lang="text">[ { _id: 100 }, { _id: 104 } ]
[ { _id: 100 } ]</div>
  <p>Orders 100 and 104 have a Lamp somewhere in their items. Only order 100 has a Laptop as its first item.</p>
  <div class="callout pred"><span class="label">Predict the output</span>
    <p>Which orders contain an item with qty ≥ 2 <em>and</em> price ≥ 500? Look at the data first: only order 103 has such an item (2 Phones at 500).</p>
  </div>
  <div class="fx" data-lang="js">db.orders.find({ "items.qty": { $gte: 2 }, "items.price": { $gte: 500 } }, { _id: 1 })
db.orders.find({ items: { $elemMatch: { qty: { $gte: 2 }, price: { $gte: 500 } } } }, { _id: 1 })</div>
  <div class="fx" data-lang="text">[ { _id: 100 }, { _id: 103 } ]
[ { _id: 103 } ]</div>
  <p>The first query wrongly includes order 100. Trace it: the condition <code>"items.qty" ≥ 2</code> asks "does <em>any</em> item have qty ≥ 2?" Yes, the Lamp. Then <code>"items.price" ≥ 500</code> asks the same question again, separately: yes, the Laptop. Both are true, so 100 matches, even though no single item meets both. <code>$elemMatch</code> forces both conditions onto the <em>same</em> element.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600">
    <text x="0" y="14" font-size="11" class="tm">order 100 items</text>
    <rect x="0" y="22" width="170" height="30" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="10" y="42" font-size="11">Laptop  qty 1  <tspan class="tg">price 800</tspan></text>
    <rect x="0" y="58" width="170" height="30" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="10" y="78" font-size="11">Lamp  <tspan class="tg">qty 2</tspan>  price 40</text>
    <text x="200" y="42" font-size="11">without $elemMatch:</text><text x="200" y="58" font-size="11" class="tm">qty ≥ 2 → Lamp ✓, price ≥ 500 → Laptop ✓</text><text x="200" y="76" font-size="11" class="tr">→ order 100 matches (wrong)</text>
    <text x="0" y="114" font-size="11" class="tm">order 103 items</text>
    <rect x="0" y="122" width="170" height="30" rx="5" class="fg sg"/><text x="10" y="142" font-size="11">Phone <tspan class="tg">qty 2  price 500</tspan></text>
    <text x="200" y="124" font-size="11">with $elemMatch: both on the <tspan class="tb">same</tspan> element</text><text x="200" y="142" font-size="11" class="tg">→ only order 103 matches</text>
  </svg><figcaption>Dot-notation conditions are checked against the array separately; $elemMatch ties them to one element.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>"Is there a student in the class who is from Pune and scored above 90?" If you ask "anyone from Pune?" and then "anyone above 90?" separately, you may get yes and yes from two different students. <code>$elemMatch</code> asks both questions of each student in turn.</p>
  </div>
  <table class="tbl">
    <tr><th>Query</th><th>Meaning</th><th>Result on shop</th></tr>
    <tr><td><code>{ items: { $size: 2 } }</code></td><td>Array has exactly 2 elements (no ranges)</td><td>100, 103</td></tr>
    <tr><td><code>{ "items.category": { $all: ["Electronics", "Furniture"] } }</code></td><td>Contains all listed values, any order</td><td>100, 103</td></tr>
    <tr><td><code>{ tags: "vip" }</code></td><td>Array of plain values contains "vip"</td><td>—</td></tr>
  </table>
  <p>Projection also reaches inside. <code>{ "items.product": 1 }</code> returns only product names; <code>{ "items.$": 1 }</code> returns only the element the filter matched:</p>
  <div class="fx" data-lang="js">db.orders.find({}, { "items.product": 1 }).sort({ _id: 1 }).skip(1).limit(2)
db.orders.find({ "items.product": "Lamp" }, { "items.$": 1 })</div>
  <div class="fx" data-lang="text">[
  { _id: 101, items: [ { product: 'Phone' } ] },
  { _id: 102, items: [ { product: 'Desk' } ] }
]
[
  {
    _id: 100,
    items: [ { product: 'Lamp', category: 'Furniture', qty: 2, price: 40 } ]
  },
  {
    _id: 104,
    items: [ { product: 'Lamp', category: 'Furniture', qty: 3, price: 40 } ]
  }
]</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Dot notation</strong>: a path into nested fields, <code>"a.b.c"</code>. <strong>$elemMatch</strong>: "at least one array element satisfies all of these conditions together".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>{ items: { product: "Lamp" } }</code> (no dot) is an <em>exact whole-object</em> match: an element must be exactly <code>{ product: "Lamp" }</code> with no other fields, in that order. It returns nothing here. Use <code>"items.product"</code> or <code>$elemMatch</code>.</p>
  </div>

  <h2 id="mb-update"><span class="num">08</span>Update</h2>
  <p>Order 104 gets delivered. Asha earns 50 loyalty points. In SQL you write <code>UPDATE ... SET</code>. In MongoDB you use <code>updateOne(filter, update)</code> (first match) or <code>updateMany(filter, update)</code> (all matches). The update is a document of <strong>update operators</strong> that say <em>how</em> to change the fields.</p>
  <table class="tbl">
    <tr><th>Operator</th><th>Does</th><th>Example</th></tr>
    <tr><td><code>$set</code> / <code>$unset</code></td><td>Set / remove a field (dots allowed)</td><td><code>{ $set: { "address.pin": "400001" } }</code></td></tr>
    <tr><td><code>$inc</code></td><td>Add to a number (starts at 0 if missing)</td><td><code>{ $inc: { loyalty_points: 50 } }</code></td></tr>
    <tr><td><code>$push</code></td><td>Append to an array (duplicates allowed)</td><td><code>{ $push: { tags: "vip" } }</code></td></tr>
    <tr><td><code>$addToSet</code></td><td>Append only if not already there</td><td><code>{ $addToSet: { tags: "vip" } }</code></td></tr>
    <tr><td><code>$pull</code></td><td>Remove matching array elements</td><td><code>{ $pull: { items: { product: "Desk" } } }</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Correcting a form with a pen versus tearing it up and writing a new one. <code>$set</code> is the pen: change one box, keep everything else. Sending a whole new form (a replacement) throws away every box you did not fill in again.</p>
  </div>
  <p>This code updates one order twice, then edits Asha step by step. The statements run in order.</p>
  <div class="fx" data-lang="js">db.orders.updateOne({ _id: 104 }, { $set: { status: "delivered" } })
db.orders.updateOne({ _id: 104 }, { $set: { status: "delivered" } })   // again
db.customers.updateOne({ _id: 1 }, { $inc: { loyalty_points: 50 } })
db.customers.updateOne({ _id: 1 }, { $push: { tags: "vip" } })
db.customers.updateOne({ _id: 1 }, { $addToSet: { tags: "vip" } })
db.customers.findOne({ _id: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 0, upsertedCount: 0 }
(3 more results: modifiedCount 1, 1, 0)
{
  _id: 1,
  name: 'Asha',
  city: 'Mumbai',
  signup_date: ISODate('2024-01-05T00:00:00.000Z'),
  loyalty_points: 50,
  tags: [ 'vip' ]
}</div>
  <p>(mongosh prints each result over several lines; on this page they are joined onto one line.) The second identical <code>$set</code> found the order (<code>matchedCount: 1</code>) but changed nothing (<code>modifiedCount: 0</code>). <code>$inc</code> created <code>loyalty_points</code> starting from 0. <code>$addToSet</code> saw "vip" already present and did nothing; a second <code>$push</code> would have given <code>[ 'vip', 'vip' ]</code>.</p>
  <h3>Changing one element inside an array</h3>
  <p>To add one more lamp to order 100, match the element in the filter and use <code>$</code> in the update path. <code>$</code> means "the element the filter matched".</p>
  <div class="fx" data-lang="js">db.orders.updateOne({ _id: 100, "items.product": "Lamp" }, { $inc: { "items.$.qty": 1 } })
db.orders.findOne({ _id: 100 }, { items: 1 })</div>
  <div class="fx" data-lang="text">{
  _id: 100,
  items: [
    { product: 'Laptop', category: 'Electronics', qty: 1, price: 800 },
    { product: 'Lamp', category: 'Furniture', qty: 3, price: 40 }
  ]
}</div>
  <h3>Upsert: update, or insert if missing</h3>
  <p>Syncing data from another system, you often do not know if a record exists yet. "Find, then insert or update" is two calls with a race between them. <strong>Upsert</strong> does it in one.</p>
  <div class="fx" data-lang="js">db.customers.updateOne(
  { _id: 5 },
  { $set: { name: "Esha", city: "Pune" }, $setOnInsert: { signup_date: ISODate("2024-08-01") } },
  { upsert: true })
db.customers.findOne({ _id: 5 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: 5, matchedCount: 0, modifiedCount: 0, upsertedCount: 1 }
{
  _id: 5,
  city: 'Pune',
  name: 'Esha',
  signup_date: ISODate('2024-08-01T00:00:00.000Z')
}</div>
  <p>No document had <code>_id: 5</code>, so one was created from the filter's equality field plus the update. <code>$setOnInsert</code> fields are written only on that insert; running it again with a new date keeps the old <code>signup_date</code>.</p>
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
  <div class="fx" data-lang="js">db.customers.updateOne({ _id: 2 }, { city: "Pune" })
db.customers.replaceOne({ _id: 2 }, { city: "Pune" })
db.customers.findOne({ _id: 2 })</div>
  <div class="fx" data-lang="text">Uncaught MongoInvalidArgumentError: Update document requires atomic operators
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ _id: 2, city: 'Pune' }</div>
  <p>Modern <code>updateOne</code> refuses a plain document. <code>replaceOne</code> accepts it and silently drops Ben's name and signup date.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Update operators</strong> (<code>$set</code>, <code>$inc</code>, ...) change named fields only. <strong>Replacement</strong> swaps the whole document except <code>_id</code>. <strong>Upsert</strong>: update if a match exists, otherwise insert. <strong>Atomic</strong>: a write to one document is all-or-nothing, including every nested array in it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Always use <code>$set</code> for partial changes. <code>replaceOne</code>, the old <code>update()</code> and pymongo's <code>replace_one</code> replace silently. Because single-document writes are atomic, "add an item and update the total" inside one order needs no transaction, which is a big reason to embed.</p>
  </div>

  <h2 id="mb-delete"><span class="num">09</span>Delete</h2>
  <p>Cancelled orders must go, test data must be wiped, and a whole collection may need to be rebuilt. Deleting is the simplest CRUD step, but it has one sharp edge that SQL users do not expect.</p>
  <p><code>deleteOne(filter)</code> removes the first match. <code>deleteMany(filter)</code> removes all matches. <code>deleteMany({})</code> empties the collection but keeps it and its indexes. <code>drop()</code> removes the collection itself, with its indexes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p><code>deleteMany({})</code> is emptying a cupboard: the shelves and labels (indexes) stay. <code>drop()</code> is carrying the cupboard out of the room.</p>
  </div>
  <p>This code deletes the cancelled order, tries to delete an order that does not exist, adds an index, empties the collection, and then drops it.</p>
  <div class="fx" data-lang="js">db.orders.deleteMany({ status: "cancelled" })
db.orders.deleteOne({ _id: 999 })
db.orders.createIndex({ customer_id: 1 })
db.orders.deleteMany({})
db.orders.getIndexes()
db.orders.drop()
show collections</div>
  <div class="fx" data-lang="text">{ acknowledged: true, deletedCount: 1 }
{ acknowledged: true, deletedCount: 0 }
customer_id_1
{ acknowledged: true, deletedCount: 4 }
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, key: { customer_id: 1 }, name: 'customer_id_1' }
]
true
customers</div>
  <p>Step by step: 1 cancelled order removed. Deleting id 999 is not an error; it just reports <code>deletedCount: 0</code>. After <code>deleteMany({})</code> the remaining 4 orders are gone but <code>getIndexes()</code> still lists both indexes. After <code>drop()</code> only <code>customers</code> is left.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>deletedCount</strong>: how many documents were removed. <strong>drop()</strong>: delete the collection, its documents and its indexes. A <strong>foreign key</strong> in SQL is a rule that a value must exist in another table; MongoDB has no such rule.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>No foreign keys means <strong>no cascade</strong>. Delete customer 1 and orders 100 and 101 still point at a customer that no longer exists (orphans). Your code must clean up references, or you soft-delete with a flag such as <code>{ $set: { deleted: true } }</code>.</p>
  </div>
  <p>A safety habit used in real teams: run the same filter with <code>countDocuments</code> first, check the number, then run <code>deleteMany</code>. An empty filter <code>{}</code> passed by mistake deletes everything, with no confirmation.</p>

  <h2 id="mb-py"><span class="num">10</span>From Python</h2>
  <p>In data-science and backend work you rarely type into mongosh. You query from Python and often hand the result to pandas. <strong>pymongo</strong> is the official Python driver. Filters and documents are plain Python dicts; method names use snake_case (<code>count_documents</code>, <code>update_one</code>) instead of camelCase.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>mongosh is talking to the shopkeeper face to face. pymongo is phoning in the same order: same words, a slightly different accent (<code>update_one</code> instead of <code>updateOne</code>, <code>"$set"</code> in quotes because Python dict keys are strings).</p>
  </div>
  <p>This script runs against the freshly loaded shop from section 04 (before the updates and deletes above). It connects, counts, loops over a cursor, updates Dia, then loads orders into pandas two ways: flat fields directly, and nested items with <code>json_normalize</code>.</p>
  <div class="fx" data-lang="py">from pymongo import MongoClient
import pandas as pd

client = MongoClient("mongodb://localhost:27017")
db = client["shop"]                     # same as: use shop

print(db.orders.count_documents({"status": "delivered"}))
for o in db.orders.find({"items.product": "Lamp"}, {"_id": 1}):
    print(o)

res = db.customers.update_one({"_id": 4}, {"$set": {"city": "Pune"}})
print(res.matched_count, res.modified_count)
print(db.customers.find_one({"_id": 1}))

df = pd.DataFrame(list(db.orders.find({}, {"items": 0})))
print(df)

docs = list(db.orders.find({"status": "delivered"}))
items = pd.json_normalize(docs, record_path="items", meta=["_id", "customer_id"])
items["amount"] = items["qty"] * items["price"]
print(items)
print(items.groupby("category")["amount"].sum())</div>
  <div class="fx" data-lang="text">3
{'_id': 100}
{'_id': 104}
1 1
{'_id': 1, 'name': 'Asha', 'city': 'Mumbai', 'signup_date': datetime.datetime(2024, 1, 5, 0, 0)}
   _id  customer_id order_date     status
0  100            1 2024-05-01  delivered
1  101            1 2024-05-20  delivered
2  102            2 2024-06-02  cancelled
3  103            3 2024-06-15  delivered
4  104            3 2024-07-01    pending
  product     category  qty  price  _id customer_id  amount
0  Laptop  Electronics    1    800  100           1     800
1    Lamp    Furniture    2     40  100           1      80
2   Phone  Electronics    1    500  101           1     500
3   Phone  Electronics    2    500  103           3    1000
4    Desk    Furniture    1    150  103           3     150
category
Electronics    2300
Furniture       230
Name: amount, dtype: int64</div>
  <p>Points to notice. <code>find</code> returns a cursor, so the <code>for</code> loop pulls documents lazily. BSON dates arrive as Python <code>datetime</code> objects, so pandas gets a real date column. <code>{"items": 0}</code> left out the nested array so the DataFrame stays flat. <code>json_normalize</code> with <code>record_path="items"</code> made one row per item and copied the parent's <code>_id</code> and <code>customer_id</code> onto each row (the <code>meta</code> list). From there it is ordinary pandas.</p>
  <p>Two more things every project hits: ObjectId lookups and testing without a server.</p>
  <div class="fx" data-lang="py">from bson import ObjectId
oid = db.reviews.insert_one({"product": "Lamp", "stars": 4}).inserted_id
as_text = str(oid)                                       # e.g. came from a URL
print(db.reviews.find_one({"_id": as_text}))             # plain string
print(db.reviews.find_one({"_id": ObjectId(as_text)}))   # real ObjectId

import mongomock                                         # pip install mongomock
fake = mongomock.MongoClient()["shop"]                   # in-memory, no server
fake.orders.insert_many([{"_id": 1, "status": "delivered"}, {"_id": 2, "status": "pending"}])
assert fake.orders.count_documents({"status": "delivered"}) == 1
print("test passed")</div>
  <div class="fx" data-lang="text">None
{'_id': ObjectId('…'), 'product': 'Lamp', 'stars': 4}
test passed</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>pymongo</strong>: the official MongoDB driver for Python. <strong>pd.json_normalize</strong>: flattens nested dicts/lists into a table. <strong>mongomock</strong>: a fake in-memory MongoDB for unit tests (it covers common features, not all).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>An ObjectId and its 24-character string are different values: the string lookup returned <code>None</code>. Convert with <code>ObjectId("...")</code>. Also, filter and project on the server: <code>pd.DataFrame(list(db.orders.find()))</code> on a million documents pulls every field over the network. For totals, aggregate in MongoDB first.</p>
  </div>

  <h2 id="mb-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Most MongoDB mistakes do not raise errors. The query runs and returns something plausible but wrong. These are the ones to check first when a number looks off.</p>
  <div class="callout trap"><span class="label">Trap: replacement instead of $set</span>
    <p><code>replaceOne({ _id: 2 }, { city: "Pune" })</code> wipes every other field. Write <code>updateOne({ _id: 2 }, { $set: { city: "Pune" } })</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: null matches missing</span>
    <p><code>{ city: null }</code> returns documents with no <code>city</code> too. Use <code>$exists</code> or <code>$type: "null"</code> when the difference matters.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: array conditions without $elemMatch</span>
    <p>Two dot-notation conditions on the same array can be satisfied by two different elements. Order 100 matched "qty ≥ 2 and price ≥ 500" with no such item.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: typos create new fields</span>
    <p><code>{ $set: { stauts: "delivered" } }</code> succeeds and adds a new field; <code>status</code> is unchanged. A filter on a misspelled field just matches nothing. Add a schema validator (see <a class="xref" data-note="mongo_design">Schema Design</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deep skip</span>
    <p><code>skip(n)</code> reads and discards n documents. Use keyset pagination on an indexed field.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: string vs ObjectId, and number types</span>
    <p><code>"6632..."</code> never equals <code>ObjectId("6632...")</code>. Likewise <code>"5"</code> (string) never equals <code>5</code> (number): data loaded from CSV often stores numbers as strings, and range queries then silently miss.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting there is no cascade</span>
    <p>Deleting a parent leaves orphan children. Clean them up in the same code path, or soft-delete.</p>
  </div>

  <h2 id="mb-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a document database, and how is it different from a relational one?</summary><div class="qa-body">It stores each record as a self-contained nested document (fields, sub-objects, arrays) in a collection, with no fixed columns. A relational database splits data into tables joined by keys. Documents make "read the whole thing" fast and atomic; relational makes unplanned joins and multi-entity consistency easy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is BSON and why doesn't MongoDB just store JSON?</summary><div class="qa-body">BSON is binary-encoded JSON. It adds types JSON lacks (dates, int32/int64, Decimal128, ObjectId, binary) and stores lengths, so the server can skip over fields quickly without parsing text.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is inside an ObjectId, and what is one useful consequence?</summary><div class="qa-body">4-byte timestamp (seconds), 5 random bytes, 3-byte counter. Because it starts with time, sorting by <code>_id</code> roughly sorts by insertion time, and <code>getTimestamp()</code> gives the creation time without a separate field. It is generated client-side, so no central counter is needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the query: names of customers in Mumbai or Delhi, sorted by name, without _id.</summary><div class="qa-body"><code>db.customers.find({ city: { $in: ["Mumbai", "Delhi"] } }, { name: 1, _id: 0 }).sort({ name: 1 })</code> → Asha, Ben, Chen.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>db.customers.find({ city: null })</code></summary><div class="qa-body">Dia. She has no <code>city</code> field, and <code>null</code> matches both missing and explicit null. Use <code>{ city: { $exists: false } }</code> to target only missing fields.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>insertMany</code> of 3 docs where the 2nd has a duplicate _id. How many are inserted, ordered vs unordered?</summary><div class="qa-body">Ordered (default): 1 — it stops at the error. Unordered (<code>{ ordered: false }</code>): 2 — it skips the bad one and continues. Neither rolls back the documents already inserted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>find({"items.qty": {$gte: 2}, "items.price": {$gte: 500}})</code> returns orders 100 and 103. Why 100, and how do you fix it?</summary><div class="qa-body">Each condition is checked against the array independently: Lamp (qty 2) satisfies one, Laptop (price 800) the other. Fix: <code>{ items: { $elemMatch: { qty: { $gte: 2 }, price: { $gte: 500 } } } }</code> → only 103.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between <code>$push</code> and <code>$addToSet</code>?</summary><div class="qa-body"><code>$push</code> always appends, so duplicates can occur. <code>$addToSet</code> appends only if the exact value isn't already present, so the array behaves like a set. For objects, "exact" means the same fields in the same order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An update returns matchedCount 1, modifiedCount 0. What happened?</summary><div class="qa-body">The filter found the document, but the update did not change anything, e.g. <code>$set</code> to the value it already had, or <code>$addToSet</code> of an existing element. It is not an error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A teammate runs <code>replaceOne({_id: 2}, {city: "Pune"})</code> to move Ben to Pune. What happens?</summary><div class="qa-body">The whole document is replaced: Ben's <code>name</code> and <code>signup_date</code> are gone, leaving <code>{ _id: 2, city: "Pune" }</code>. Correct: <code>updateOne({ _id: 2 }, { $set: { city: "Pune" } })</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does upsert do, and when is it useful?</summary><div class="qa-body">If the filter matches, it updates; if not, it inserts a new document built from the filter's equality fields plus the update. Useful for idempotent loads ("sync this record") and counters (<code>$inc</code> with upsert creates the counter on first hit), avoiding a race between "check" and "insert". <code>$setOnInsert</code> sets fields only when inserting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is updating one order and its embedded items atomic? Is updating an order and a customer atomic?</summary><div class="qa-body">The first, yes: any write to a single document is atomic. The second spans two documents, so it is not atomic unless you wrap it in a multi-document transaction (which costs more).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>skip(100000).limit(20)</code> slow, and what's the alternative?</summary><div class="qa-body">The server still walks and discards 100,000 documents. Use keyset pagination: remember the last <code>_id</code> (or sort key) of the page and query <code>{ _id: { $gt: last } }</code> with <code>limit(20)</code>, which uses the index directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>deleteMany({})</code> vs <code>drop()</code>?</summary><div class="qa-body"><code>deleteMany({})</code> removes every document one by one but keeps the collection, its indexes and validator. <code>drop()</code> removes the collection, documents and indexes in one fast step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You need order items in a pandas DataFrame, one row per item. How?</summary><div class="qa-body">Fetch with a filter and projection, then <code>pd.json_normalize(docs, record_path="items", meta=["_id", "customer_id"])</code>. Or do it server-side with an aggregation <code>$unwind</code> and load the flat result.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A lookup by id from a URL returns nothing in Python, but the document exists. Most likely cause?</summary><div class="qa-body">The id is a string while <code>_id</code> is stored as an ObjectId. Query with <code>{"_id": ObjectId(id_str)}</code>.</div></details>
</main>
`
});
