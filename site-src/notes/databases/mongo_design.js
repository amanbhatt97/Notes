// notes/databases/mongo_design.js — Schema Design, Indexes & Scaling
Object.assign(TOPIC_CONTENT, {
  "mongo_design": `<main>
  <h1>Schema Design, Indexes &amp; Scaling</h1>
  <p class="lead">In MongoDB the shape of your documents decides your speed. This page covers how to shape documents (embed or reference), how to guard them (validation), how to find them fast (indexes and explain), and how a deployment survives crashes and grows past one machine (replica sets, sharding, transactions). Every experiment here was run on real MongoDB 8 servers, including a 3-node replica set where we killed the primary and a 2-shard cluster; the outputs are real. Long shell results are sometimes joined onto one line or shortened with "…"; nothing else is changed. Builds on <a class="xref" data-note="mongo_basics">Documents &amp; CRUD</a> and <a class="xref" data-note="mongo_aggregation">Aggregation</a>.</p>

  <h2 id="md-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Mongo Schema, Indexes &amp; Scaling</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Embed vs reference</div>
        <ul>
          <li><b>Core rule</b> — accessed together → stored together; design around queries</li>
          <li><b>Embed</b> — 1:few, read with parent, snapshot (items, price paid)</li>
          <li><b>Reference</b> — store the other <code>_id</code>; nothing enforces it</li>
          <li><b>1:many</b> → reference or embed a subset; <b>1:squillions</b> → child holds parent id</li>
          <li>⚠ <b>Unbounded arrays</b> — 16 MB ≈ 79,000 orders of 212 bytes; then writes fail</li>
          <li>💡 tiffin box packs the meal; the menu card just says "see kitchen"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Design patterns</div>
        <ul>
          <li><b>Extended reference</b> — copy the few fields you always show → no $lookup</li>
          <li><b>Subset</b> — embed 10 newest reviews; rest in own collection</li>
          <li><b>Computed</b> — store <code>total</code>; <code>$push</code> + <code>$inc</code> in one atomic update</li>
          <li><b>Bucket</b> — 1 doc per sensor-hour: 100,000 docs → 1,670; index 1,096 KB → 40 KB</li>
          <li><b>Outlier</b> — design for typical; flag <code>has_overflow</code> for the huge one</li>
          <li><b>Cost</b> — copies must be updated (<code>updateMany</code>); copy rarely-changing data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Schema validation</div>
        <ul>
          <li><b>Why</b> — <code>"deliverd"</code> or a string date slips in silently</li>
          <li><b>$jsonSchema</b> — <code>required</code>, <code>bsonType</code>, <code>enum</code>, <code>minimum</code>, <code>minItems</code></li>
          <li><b>validationAction</b> — <code>"error"</code> rejects, <code>"warn"</code> logs</li>
          <li>⚠ Unknown fields (<code>stauts</code>) allowed unless <code>additionalProperties: false</code></li>
          <li>⚠ <code>"int"</code> rejects doubles (Python <code>1.0</code>) and longs → use <code>"number"</code></li>
          <li>⚠ Existing docs not re-checked; find them with <code>$nor: [rule]</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Indexes</div>
        <ul>
          <li><b>Single / compound</b> — compound usable only by a <em>prefix</em> of its fields</li>
          <li><b>ESR</b> — Equality, Sort, Range: 24 keys, no sort vs 35,053 keys + SORT</li>
          <li><b>Multikey</b> — array field, one entry per element</li>
          <li><b>TTL</b> — <code>expireAfterSeconds</code>; deleter runs ~every 60 s; date fields only</li>
          <li><b>Unique</b> — missing = null, so only one doc may lack it → partial index</li>
          <li><b>Text</b> — one per collection; stems "lamps" → lamp</li>
          <li>⚠ <b>Cost</b> — slower writes, RAM; drop unused (<code>$indexStats</code>)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">explain()</div>
        <ul>
          <li><b>explain("executionStats")</b> — plan + work done</li>
          <li><b>IXSCAN</b> (+FETCH) good · <b>COLLSCAN</b> = every doc</li>
          <li><b>keys / docs examined ≈ returned</b> — selective</li>
          <li><b>SORT stage</b> = in-memory sort → fix index order (ESR)</li>
          <li><b>PROJECTION_COVERED</b>, docs examined 0 = covered query</li>
          <li>⚠ <code>/lamp/i</code> walks every key; <code>$ne</code> scans most of the index</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Replica sets</div>
        <ul>
          <li><b>Primary</b> takes writes; <b>secondaries</b> replay its oplog</li>
          <li><b>Failover</b> — measured: primary killed, new primary in ~10 s</li>
          <li><b>Odd voters</b> (3) so a majority (2) can form</li>
          <li><b>w: "majority"</b> (default 5.0+) survives failover · <b>w: 1</b> may roll back</li>
          <li><b>readPreference</b> — primary (default) vs secondary/nearest (may be stale)</li>
          <li><b>Gives</b> availability + read scale, not write scale</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sharding</div>
        <ul>
          <li><b>What</b> — split a collection across replica sets by a shard key</li>
          <li><b>Parts</b> — mongos router, config servers, shards; chunks moved by balancer</li>
          <li><b>Targeted</b> SINGLE_SHARD (key in query) vs <b>scatter</b> SHARD_MERGE</li>
          <li>⚠ <b>Monotonic key</b> (date/ObjectId): measured 0 / 10,000 split → hot shard</li>
          <li><b>Hashed</b> — 5,041 / 4,959 even; ranges scatter</li>
          <li><b>Good key</b> — high cardinality, even frequency, not monotonic, in most queries</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Transactions &amp; JSONB</div>
        <ul>
          <li><b>Single doc</b> — always atomic, no transaction needed</li>
          <li><b>Multi-doc</b> — replica set/sharded; <code>startTransaction / commitTransaction</code></li>
          <li><b>WriteConflict</b> → label <code>TransientTransactionError</code> → retry (<code>with_transaction</code>)</li>
          <li><b>Cost</b> — latency, 60 s limit, aim &lt; 1,000 docs, 2PC across shards</li>
          <li><b>PG + JSONB</b> — mostly relational + flexible attributes; <code>@&gt;</code> + GIN</li>
          <li><b>MongoDB</b> — documents are the model; built-in write scale-out</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="md-embed"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Embed vs Reference</span><span class="rm-sub">Accessed together, stored together</span></div></div>
      <div class="rm-item rm-done" data-target="md-pat"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Design Patterns</span><span class="rm-sub">Five shapes worth knowing</span></div></div>
      <div class="rm-item rm-done" data-target="md-valid"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Schema Validation</span><span class="rm-sub">$jsonSchema guards the door</span></div></div>
      <div class="rm-item rm-done" data-target="md-idx"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Indexes</span><span class="rm-sub">ESR rule, multikey, TTL, unique</span></div></div>
      <div class="rm-item rm-done" data-target="md-explain"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">explain()</span><span class="rm-sub">IXSCAN vs COLLSCAN, covered queries</span></div></div>
      <div class="rm-item rm-done" data-target="md-repl"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Replica Sets</span><span class="rm-sub">We killed the primary</span></div></div>
      <div class="rm-item rm-done" data-target="md-shard"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sharding</span><span class="rm-sub">Choosing the shard key</span></div></div>
      <div class="rm-item rm-done" data-target="md-txn"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Transactions</span><span class="rm-sub">Possible, but not free</span></div></div>
      <div class="rm-item rm-done" data-target="md-pg"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">MongoDB vs JSONB</span><span class="rm-sub">Do you need Mongo at all?</span></div></div>
      <div class="rm-item rm-done" data-target="md-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Design errors that show up later</span></div></div>
      <div class="rm-item rm-done" data-target="md-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="md-embed"><span class="num">01</span>Embed vs Reference</h2>
  <p>A new MongoDB user often reasons: "documents can nest, so let me put each customer's orders inside the customer." It works for the first week. A year later Asha has thousands of orders, every order update rewrites a huge document, and "show me this one order" loads all of them. The opposite mistake, splitting everything into tables like SQL, brings back joins that MongoDB is bad at. You need a rule for each relationship.</p>
  <p>There are two choices. <strong>Embed</strong>: put the related data inside the parent document (items inside the order). <strong>Reference</strong>: keep it in its own collection and store its <code>_id</code> (the order stores <code>customer_id</code>). The rule of thumb: <strong>data that is read together is stored together</strong>, as long as it stays small and bounded.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tiffin box packs today's meal inside it: roti, sabzi, dal. You open one box and eat (embed). But the box does not hold the restaurant's full menu or every meal you ever ate; it just has a label saying which kitchen it came from (reference). Pack what you eat together; point to what is big, shared or ever-growing.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="md-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="20" width="200" height="130" rx="6" class="fb sb"/>
    <text x="10" y="40" font-weight="bold">order 100</text><text x="10" y="58" font-size="11">customer_id: 1</text>
    <rect x="10" y="70" width="180" height="70" rx="4" class="ft st"/>
    <text x="20" y="88" font-size="11">items (embedded)</text><text x="20" y="106" font-size="11" class="tm">Laptop · 1 · 800</text><text x="20" y="124" font-size="11" class="tm">Lamp · 2 · 40</text>
    <text x="100" y="166" text-anchor="middle" font-size="10" class="tg">1:few, read together, snapshot</text>
    <rect x="260" y="20" width="140" height="56" rx="6" class="fv sb"/><text x="330" y="44" text-anchor="middle" font-weight="bold">customer 1</text><text x="330" y="62" text-anchor="middle" font-size="11" class="tm">Asha, Mumbai</text>
    <path d="M110,58 C160,58 200,48 258,48" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#md-ar)"/>
    <text x="214" y="38" text-anchor="middle" font-size="10" class="tm">reference</text>
    <g font-size="11">
      <rect x="440" y="10" width="150" height="24" rx="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="450" y="26">click · cust 1</text>
      <rect x="440" y="40" width="150" height="24" rx="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="450" y="56">click · cust 1</text>
      <rect x="440" y="70" width="150" height="24" rx="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="450" y="86">click · cust 1</text>
      <text x="515" y="112" text-anchor="middle" class="tm">… millions</text>
    </g>
    <g stroke="currentColor" stroke-dasharray="4 3"><line x1="440" y1="22" x2="402" y2="40" marker-end="url(#md-ar)"/><line x1="440" y1="82" x2="402" y2="62" marker-end="url(#md-ar)"/></g>
    <text x="330" y="132" text-anchor="middle" font-size="10" class="tm">1:squillions: the child points at</text><text x="330" y="146" text-anchor="middle" font-size="10" class="tm">the parent, never an array in it</text>
  </svg><figcaption>Embed what is small and read together; reference what is shared, big, or unbounded.</figcaption></figure>
  <p>How fast does "orders inside the customer" hit the wall? This code measures one order in BSON bytes and divides the 16 MB document limit by it.</p>
  <div class="fx" data-lang="js">const order = { _id: 100, order_date: ISODate("2024-05-01"), status: "delivered",
  items: [ { product: "Laptop", category: "Electronics", qty: 1, price: 800 },
           { product: "Lamp",   category: "Furniture",   qty: 2, price: 40 } ] }
bsonsize(order)
Math.floor(16 * 1024 * 1024 / bsonsize(order))</div>
  <div class="fx" data-lang="text">212
79137</div>
  <p><code>bsonsize</code> gives the stored size: 212 bytes. So a customer document could hold about 79,000 such orders before every write to it fails. Long before that, each new order rewrites an ever-larger document and every read drags all of them along. Orders are unbounded, so they get their own collection with <code>customer_id</code>. Items inside one order are few and bounded, so they stay embedded.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Choose</th><th>Shop example</th></tr>
    <tr><td><strong>1 : few</strong>, always read with the parent</td><td>Embed</td><td>Items in an order; addresses in a customer</td></tr>
    <tr><td><strong>1 : many</strong> (hundreds–thousands), often read alone</td><td>Reference, or embed a subset</td><td>Reviews of a product</td></tr>
    <tr><td><strong>1 : squillions</strong> (unbounded)</td><td>Reference from the child side</td><td>Click events: each event stores <code>customer_id</code></td></tr>
    <tr><td>Many : many</td><td>Array of ids on one or both sides</td><td>Products ↔ tags</td></tr>
    <tr><td>Child updated often and independently</td><td>Reference</td><td>Product stock level</td></tr>
    <tr><td>Child must be a snapshot in time</td><td>Embed a copy</td><td>Price at purchase time</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Embedding</strong>: storing related data inside the parent document. <strong>Referencing</strong>: storing the related document's <code>_id</code>, like a foreign key that nothing enforces. <strong>Cardinality</strong>: how many children one parent can have (few, many, unbounded).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unbounded arrays</span>
    <p>Never embed an array that grows without limit. Documents hit the <strong>16 MB</strong> cap, every update rewrites a growing document, and a multikey index on the array balloons. Interviews ask "would you embed a user's posts in the user?" The answer is no, for exactly this reason.</p>
  </div>

  <h2 id="md-pat"><span class="num">02</span>Design Patterns</h2>
  <p>Embed-or-reference is the first decision. Real systems then hit repeated problems: "every order page needs the customer name, and <code>$lookup</code> is slow", "summing items on every read is wasteful", "one row per sensor reading makes the index bigger than RAM". Each has a well-known document shape, called a <strong>pattern</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A courier's delivery slip copies the customer's name and phone from the customer file, so the delivery boy never has to look them up (extended reference). The slip also has the total pre-written at the bottom (computed). And a milkman does not keep one notebook page per bottle; he keeps one page per house per month with 30 ticks on it (bucket).</p>
  </div>
  <table class="tbl">
    <tr><th>Pattern</th><th>Idea</th><th>Tiny example</th></tr>
    <tr><td><strong>Extended reference</strong></td><td>Copy the few fields you always need from the referenced doc</td><td><code>{ customer: { _id: 1, name: "Asha" } }</code> in each order, so no <code>$lookup</code></td></tr>
    <tr><td><strong>Subset</strong></td><td>Embed only the most-used part; keep the rest elsewhere</td><td>Product holds its 10 newest reviews; all reviews in <code>reviews</code></td></tr>
    <tr><td><strong>Computed</strong></td><td>Store a pre-calculated value, update it on write</td><td><code>{ _id: 100, total: 880 }</code> instead of summing items each read</td></tr>
    <tr><td><strong>Bucket</strong></td><td>Group many small records into one doc per time window</td><td><code>{ sensor: 3, hour: ..., n: 60, readings: [ ... ] }</code></td></tr>
    <tr><td><strong>Outlier</strong></td><td>Design for the typical case; flag and overflow the rare huge one</td><td>Product with 50k reviews: <code>has_overflow: true</code> + extra docs</td></tr>
  </table>
  <p>Extended reference plus computed, on order 100. One update adds an item <em>and</em> raises the stored total; because it touches one document it is atomic.</p>
  <div class="fx" data-lang="js">db.orders.updateOne({ _id: 100 }, { $set: { total: 880, customer: { _id: 1, name: "Asha" } } })
db.orders.updateOne({ _id: 100 },
  { $push: { items: { product: "Fan", category: "Electronics", qty: 1, price: 60 } },
    $inc: { total: 60 } })
db.orders.findOne({ _id: 100 }, { total: 1, customer: 1, "items.product": 1 })
db.orders.updateMany({ "customer._id": 1 }, { $set: { "customer.name": "Asha Kulkarni" } })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{
  _id: 100,
  items: [ { product: 'Laptop' }, { product: 'Lamp' }, { product: 'Fan' } ],
  customer: { _id: 1, name: 'Asha' },
  total: 940
}
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }</div>
  <p>The order now carries the customer's name and a running <code>total</code> (880 + 60 = 940). The last line is the price of copying: when Asha changes her name, every order holding the copy must be updated. Here only order 100 had it; in production it may be thousands, which is fine for a name that rarely changes and terrible for a stock count that changes every minute.</p>
  <h3>Bucket pattern, measured</h3>
  <p>100,000 temperature readings (10 sensors, one per minute) stored two ways: one document per reading, and one document per sensor per hour, built with an aggregation ending in <code>$out</code>.</p>
  <div class="fx" data-lang="js">function makeReadings() {
  const t0 = Date.UTC(2024, 4, 1), rows = []
  for (let m = 0; m &lt; 100000; m++)            // 10 sensors, one reading per minute each
    rows.push({ sensor: m % 10, ts: new Date(t0 + Math.floor(m / 10) * 60000), temp: 20 + (m % 7) })
  return rows
}
db.readings.insertMany(makeReadings()).acknowledged
db.readings.createIndex({ sensor: 1, ts: 1 })
db.readings.aggregate([
  { $group: { _id: { sensor: "$sensor", hour: { $dateTrunc: { date: "$ts", unit: "hour" } } },
              n: { $sum: 1 }, readings: { $push: { ts: "$ts", temp: "$temp" } } } },
  { $project: { _id: 0, sensor: "$_id.sensor", hour: "$_id.hour", n: 1, readings: 1 } },
  { $out: "readings_hourly" } ])
db.readings_hourly.createIndex({ sensor: 1, hour: 1 })
function sizes(c) { const s = c.stats(); return { docs: s.count, dataKB: Math.round(s.size / 1024), indexKB: Math.round(s.totalIndexSize / 1024) } }
sizes(db.readings)
sizes(db.readings_hourly)</div>
  <div class="fx" data-lang="text">[Function: makeReadings]
true
sensor_1_ts_1
sensor_1_hour_1
[Function: sizes]
{ docs: 100000, dataKB: 5469, indexKB: 1096 }
{ docs: 1670, dataKB: 3125, indexKB: 40 }</div>
  <p>Same information, 60× fewer documents, data 43% smaller (field names are stored once per bucket, not once per reading), and the index shrank from 1,096 KB to 40 KB. Indexes must fit in RAM, so this is often the difference between fast and slow. MongoDB 5.0+ <strong>time-series collections</strong> do this bucketing for you automatically.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Denormalization</strong>: deliberately storing a copy of data in more than one place to make reads faster. Every pattern above except subset/outlier trades write work for read speed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Copy only data that changes rarely (names, prices at purchase). Copying fast-changing data (stock, follower counts) means huge <code>updateMany</code> calls and copies that drift out of sync.</p>
  </div>

  <h2 id="md-valid"><span class="num">03</span>Schema Validation</h2>
  <p>"Flexible schema" cuts both ways. A bug that writes <code>status: "deliverd"</code>, or a CSV import that stores dates as strings, is accepted without a word. Weeks later a report shows fewer delivered orders and nobody knows why. A <strong>validator</strong> lets the database reject such writes at the door.</p>
  <p>You attach a rule to a collection, written in <strong>JSON Schema</strong> (a standard way to describe what a JSON document must look like). Every insert and update is checked against it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The railway reservation form: the clerk will not accept it if the age box is empty or the date is written as "next Tuesday". The form itself has rules; the clerk checks them before anything enters the system.</p>
  </div>
  <p>This creates an <code>orders_v</code> collection with a validator, then tries five writes: bad status and empty items, a good order, a double where an int is required, a date given as text, and two status edits.</p>
  <div class="fx" data-lang="js">db.createCollection("orders_v", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["customer_id", "order_date", "status", "items"],
    properties: {
      status: { enum: ["pending", "delivered", "cancelled"] },
      order_date: { bsonType: "date" },
      items: { bsonType: "array", minItems: 1,
               items: { bsonType: "object", required: ["product", "qty", "price"],
                        properties: { qty: { bsonType: "int", minimum: 1 } } } }
    } } },
  validationAction: "error"     // "warn" = log only
})
db.orders_v.insertOne({ _id: 105, customer_id: 4, order_date: new Date(), status: "shipped", items: [] })
db.orders_v.insertOne({ _id: 106, customer_id: 4, order_date: ISODate("2024-07-05"), status: "pending", items: [ { product: "Lamp", qty: 1, price: 40 } ] })
db.orders_v.insertOne({ _id: 107, customer_id: 4, order_date: ISODate("2024-07-05"), status: "pending", items: [ { product: "Lamp", qty: Double(1), price: 40 } ] })
db.orders_v.insertOne({ _id: 108, customer_id: 4, order_date: "2024-07-05", status: "pending", items: [ { product: "Lamp", qty: 1, price: 40 } ] })
db.orders_v.updateOne({ _id: 106 }, { $set: { stauts: "delivered" } })
db.orders_v.updateOne({ _id: 106 }, { $set: { status: "deliverd" } })</div>
  <div class="fx" data-lang="text">{ ok: 1 }
MongoServerError: Document failed validation
  failingDocumentId: 105 ... propertyName: 'status' ... reason: 'value was not found in enum', consideredValue: 'shipped'
                         ... propertyName: 'items' ... reason: 'array did not match specified length', numberOfItems: 0
{ acknowledged: true, insertedId: 106 }
MongoServerError: Document failed validation
  failingDocumentId: 107 ... propertyName: 'qty' ... reason: 'type did not match', consideredValue: 1, consideredType: 'double'
MongoServerError: Document failed validation
  failingDocumentId: 108 ... propertyName: 'order_date' ... reason: 'type did not match', consideredValue: '2024-07-05', consideredType: 'string'
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
MongoServerError: Plan executor error during update :: caused by :: Document failed validation
  failingDocumentId: 106 ... reason: 'value was not found in enum', consideredValue: 'deliverd'</div>
  <p>(The real errors are long nested objects; the key lines are kept.) Order 105 broke two rules and the error names both. 106 passed. 107 failed only because its qty was a <em>double</em>. 108 failed because the date was text. Then the surprise: the typo field <code>stauts</code> was <strong>accepted</strong>, because the schema only checks fields it lists. The misspelled <em>value</em> "deliverd" was rejected.</p>
  <p>Adding a validator later does not touch old documents. On a <code>legacy</code> collection holding <code>{ _id: 2, status: "shipped" }</code>, <code>collMod</code> added the rule with <code>{ ok: 1 }</code>, the count stayed 2, and <code>db.legacy.find({ $nor: [ rule ] })</code> listed the rule-breaker: <code>[ { _id: 2, status: 'shipped' } ]</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$jsonSchema</strong>: a validator written in JSON Schema with BSON types. <strong>bsonType "number"</strong>: any numeric type (int, long, double, decimal). <strong>additionalProperties: false</strong>: reject fields not listed (you must then list <code>_id</code> too). <strong>validationAction</strong>: <code>"error"</code> rejects, <code>"warn"</code> only logs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Number types depend on who writes. mongosh stores <code>1</code> as int but Python's <code>1.0</code> as double and <code>2**40</code> as long (we checked: <code>'int'</code>, <code>'double'</code>, <code>'long'</code>), and pymongo cannot encode NumPy's <code>np.int64</code> at all (<code>InvalidDocument</code>; convert with <code>int()</code> or <code>.tolist()</code> before inserting a DataFrame). Use <code>bsonType: "number"</code> unless you truly need one exact type.</p>
  </div>

  <h2 id="md-idx"><span class="num">04</span>Indexes</h2>
  <p>Without an index, every query reads every document in the collection, like reading a whole dictionary to find one word. On 5 documents nobody notices. On 100 million, a page that took 5 ms in testing takes 30 seconds. An <strong>index</strong> is a separate sorted structure (a B-tree) of one or more fields' values, each pointing to its document, so the database can jump straight to the right place.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A phone directory sorted by (city, surname, first name). "Mumbai, Kulkarni, sorted by first name" is a quick flip. "Everyone named Asha, any city" cannot use the book: first names are only sorted <em>within</em> each city and surname. That is the <strong>prefix rule</strong>: a compound index helps only queries that use its leading fields.</p>
  </div>
  <div class="fx" data-lang="js">db.orders.createIndex({ customer_id: 1 })                           // single field
db.orders.createIndex({ status: 1, customer_id: 1, order_date: -1 })   // compound
db.orders.createIndex({ "items.product": 1 })                        // multikey (array)
db.customers.createIndex({ email: 1 }, { unique: true })             // unique
db.sessions.createIndex({ created_at: 1 }, { expireAfterSeconds: 3600 })  // TTL
db.products.createIndex({ description: "text" })                     // text search</div>
  <div class="fx" data-lang="text">customer_id_1
status_1_customer_id_1_order_date_-1
items.product_1
Uncaught MongoServerError[DuplicateKey]: Index build failed: … E11000 duplicate key error collection: shop.customers index: email_1 dup key: { email: null }
created_at_1
description_text</div>
  <p>Each successful call prints the new index's name, built from fields and directions (<code>status_1_customer_id_1_order_date_-1</code>). The unique index on <code>customers</code> <strong>failed</strong>: our four customers have no <code>email</code> field, a missing field counts as <code>null</code>, and four nulls are duplicates. The fix (a partial index) is shown below.</p>
  <table class="tbl">
    <tr><th>Type</th><th>Use</th><th>Gotcha</th></tr>
    <tr><td><strong>Single</strong></td><td>Filter/sort on one field</td><td>Direction (1/-1) doesn't matter for one field</td></tr>
    <tr><td><strong>Compound</strong></td><td>Multi-field filters + sort</td><td>Usable only by a <em>prefix</em> of its fields</td></tr>
    <tr><td><strong>Multikey</strong></td><td>Any index on an array field; one entry per element</td><td>At most one array field per compound index</td></tr>
    <tr><td><strong>Text</strong></td><td>Word search with <code>$text</code>; "lamps" finds "lamp"</td><td>One per collection (a second fails with <code>IndexOptionsConflict</code>)</td></tr>
    <tr><td><strong>TTL</strong></td><td>Auto-delete docs N seconds after a date field</td><td>Background job runs ~every 60 s; non-date values never expire</td></tr>
    <tr><td><strong>Unique</strong></td><td>Enforce no duplicates</td><td>Missing field counts as null: only one doc may lack it</td></tr>
  </table>
  <h3>The ESR rule, measured</h3>
  <p>Query: delivered orders since June, sorted by customer, first page of 20. We generated 100,000 orders in <code>db.ord</code> (60% delivered, 10,000 customers, dates spread over 2024) and tried no index, an index in the "natural" order (status, order_date, customer_id), and one in <strong>ESR</strong> order. <code>summary</code> is a small helper that walks the winning plan and prints its stages and counts.</p>
  <div class="fx" data-lang="js">const prods = ["Laptop", "Lamp", "Phone", "Desk", "Chair", "Fan"]
function makeOrders() {
  const docs = []
  for (let i = 0; i &lt; 100000; i++)
    docs.push({ _id: i, customer_id: (i * 7919) % 10000,
                status: ["delivered", "delivered", "delivered", "pending", "cancelled"][i % 5],
                order_date: new Date(Date.UTC(2024, 0, 1) + (i % 366) * 86400000),
                items: [ { product: prods[i % 6], qty: 1 + i % 3 }, { product: prods[(i + 2) % 6], qty: 1 } ] })
  return docs
}
db.ord.insertMany(makeOrders()).acknowledged
function summary(e) {
  const s = e.executionStats, stages = []
  for (let p = e.queryPlanner.winningPlan; p; p = p.inputStage) stages.push(p.stage)
  return { stages: stages.join(" &lt;- "), keys: s.totalKeysExamined, docs: s.totalDocsExamined, returned: s.nReturned }
}
const q = { status: "delivered", order_date: { $gte: ISODate("2024-06-01") } }
summary(db.ord.find(q).sort({ customer_id: 1 }).limit(20).explain("executionStats"))
db.ord.createIndex({ status: 1, order_date: 1, customer_id: 1 })      // E, R, S
summary(db.ord.find(q).sort({ customer_id: 1 }).limit(20).explain("executionStats"))
db.ord.dropIndexes()
db.ord.createIndex({ status: 1, customer_id: 1, order_date: 1 })      // E, S, R
summary(db.ord.find(q).sort({ customer_id: 1 }).limit(20).explain("executionStats"))</div>
  <div class="fx" data-lang="text">[Function: makeOrders]
true
[Function: summary]
{ stages: 'SORT &lt;- COLLSCAN', keys: 0, docs: 100000, returned: 20 }
status_1_order_date_1_customer_id_1
{ stages: 'FETCH &lt;- SORT &lt;- IXSCAN', keys: 35053, docs: 20, returned: 20 }
{ nIndexesWas: 2, msg: 'non-_id indexes dropped for collection', ok: 1 }
status_1_customer_id_1_order_date_1
{ stages: 'LIMIT &lt;- FETCH &lt;- IXSCAN', keys: 24, docs: 20, returned: 20 }</div>
  <table class="tbl out"><caption>Reading the three runs</caption>
    <tr><th>Index</th><th>What the server did</th><th>Keys read</th></tr>
    <tr><td>none</td><td>Read all 100,000 docs, sorted in memory</td><td>0 (docs: 100,000)</td></tr>
    <tr><td>E, R, S</td><td>Found all 35,053 matching entries, then sorted them in memory to pick 20</td><td>35,053</td></tr>
    <tr><td><strong>E, S, R</strong></td><td>Walked entries already in customer order, skipped dates before June, stopped after 20</td><td><strong>24</strong></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ESR rule</strong>: in a compound index put <strong>E</strong>quality fields first, then the <strong>S</strong>ort field, then <strong>R</strong>ange fields. Equality narrows to one slice of the index; inside that slice the sort order is already right; the range is checked as you walk.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every index slows every insert and update and uses RAM; working-set indexes should fit in memory. Check use with <code>$indexStats</code>: after two queries on <code>customer_id</code> it showed <code>ops: Long('2')</code> for <code>customer_id_1</code> and 0 for the others. Drop indexes nobody uses, and don't index a low-selectivity field (like a boolean) on its own.</p>
  </div>
  <h3>Unique, partial and TTL indexes</h3>
  <p>A unique index on <code>email</code> treats a missing email as <code>null</code>. The second user without an email breaks it. A <strong>partial index</strong> indexes only documents that match a filter, which fixes this:</p>
  <div class="fx" data-lang="js">db.users.createIndex({ email: 1 }, { unique: true })
db.users.insertOne({ _id: 1, name: "Asha", email: "asha@shop.in" })
db.users.insertOne({ _id: 2, name: "Ben" })
db.users.insertOne({ _id: 3, name: "Dia" })
db.users.dropIndexes()
db.users.createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true } } })
db.users.insertOne({ _id: 3, name: "Dia" })
db.users.insertOne({ _id: 4, name: "Asha2", email: "asha@shop.in" })</div>
  <div class="fx" data-lang="text">email_1
{ acknowledged: true, insertedId: 1 }
{ acknowledged: true, insertedId: 2 }
Uncaught MongoServerError: E11000 duplicate key error collection: shop.users index: email_1 dup key: { email: null }
{ nIndexesWas: 2, msg: 'non-_id indexes dropped for collection', ok: 1 }
email_1
{ acknowledged: true, insertedId: 3 }
Uncaught MongoServerError: E11000 duplicate key error collection: shop.users index: email_1 dup key: { email: "asha@shop.in" }</div>
  <p>With the partial index Dia goes in, and real duplicates are still blocked. A <strong>TTL index</strong> deletes documents once their date is older than <code>expireAfterSeconds</code>. We inserted sessions created 2 hours ago, now, and one with a <em>text</em> date, then waited 65 seconds:</p>
  <div class="fx" data-lang="js">db.sessions.createIndex({ created_at: 1 }, { expireAfterSeconds: 3600 })
db.sessions.insertMany([
  { _id: "old", created_at: new Date(Date.now() - 2 * 3600 * 1000) },
  { _id: "new", created_at: new Date() },
  { _id: "text", created_at: "2020-01-01" }
])
db.sessions.find({}, { _id: 1 })
sleep(65000)
db.sessions.find({}, { _id: 1 })</div>
  <div class="fx" data-lang="text">created_at_1
{
  acknowledged: true,
  insertedIds: { '0': 'old', '1': 'new', '2': 'text' }
}
[ { _id: 'old' }, { _id: 'new' }, { _id: 'text' } ]
[ { _id: 'new' }, { _id: 'text' } ]</div>
  <p>The old session vanished within the minute. The one with a string date will never expire: TTL only understands real dates.</p>

  <h2 id="md-explain"><span class="num">05</span>explain()</h2>
  <p>You added an index. Is the query actually using it? Guessing from speed on a laptop is unreliable. <code>explain()</code> asks the database to show its <strong>query plan</strong>: which index it chose, which steps it ran, and how many index keys and documents it had to read to produce the result.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking a delivery boy not just "did you deliver?" but "which route did you take, and how many doors did you knock on?" If he knocked on 100,000 doors to deliver 10 parcels, something is wrong with the route, even if the parcels arrived.</p>
  </div>
  <table class="tbl">
    <tr><th>Look at</th><th>Good</th><th>Bad</th></tr>
    <tr><td>Stages</td><td><code>IXSCAN</code> (+ <code>FETCH</code>)</td><td><code>COLLSCAN</code>: read every document</td></tr>
    <tr><td><code>totalKeysExamined</code> / <code>totalDocsExamined</code> vs <code>nReturned</code></td><td>Close to equal</td><td>Examined ≫ returned</td></tr>
    <tr><td>Sort</td><td>No <code>SORT</code> stage (index order used)</td><td><code>SORT</code> in memory</td></tr>
    <tr><td><code>totalDocsExamined: 0</code></td><td>Covered query: answered from the index alone</td><td>—</td></tr>
  </table>
  <p>Same 100,000 orders (<code>db.ord</code>), with the ESR index <code>{ status, customer_id, order_date }</code> from above. These runs check the prefix rule, a covered query, and two filters that use an index badly.</p>
  <div class="fx" data-lang="js">summary(db.ord.find({ customer_id: 42 }).explain("executionStats"))
summary(db.ord.find({ status: "pending", customer_id: 42 }).explain("executionStats"))
db.ord.createIndex({ customer_id: 1 })
summary(db.ord.find({ customer_id: 42 }, { _id: 0, customer_id: 1 }).explain("executionStats"))
db.ord.createIndex({ "items.product": 1 })
summary(db.ord.find({ "items.product": /^La/ }).explain("executionStats"))
summary(db.ord.find({ "items.product": /lamp/i }).explain("executionStats"))
summary(db.ord.find({ status: { $ne: "delivered" } }).explain("executionStats"))</div>
  <div class="fx" data-lang="text">{ stages: 'COLLSCAN', keys: 0, docs: 100000, returned: 10 }
{ stages: 'FETCH &lt;- IXSCAN', keys: 10, docs: 10, returned: 10 }
customer_id_1
{ stages: 'PROJECTION_COVERED &lt;- IXSCAN', keys: 10, docs: 0, returned: 10 }
items.product_1
{ stages: 'FETCH &lt;- IXSCAN', keys: 66667, docs: 66666, returned: 66666 }
{ stages: 'FETCH &lt;- IXSCAN', keys: 200000, docs: 100000, returned: 33333 }
{ stages: 'FETCH &lt;- IXSCAN', keys: 40001, docs: 40000, returned: 40000 }</div>
  <p>Line by line. (1) <code>customer_id</code> alone is not a prefix of the ESR index: <code>COLLSCAN</code>, 100,000 docs for 10 results. (2) Adding the leading <code>status</code> makes it a prefix: 10 keys, 10 docs. (3) With a <code>customer_id</code> index and a projection of only that field, the answer comes from the index: <code>docs: 0</code>, a <strong>covered query</strong>. (4) A regex anchored with <code>^</code> uses a tight index range. (5) A case-insensitive, unanchored regex walked all 200,000 keys (2 items per order, a multikey index) to return 33,333. (6) <code>$ne</code> used the index but had to read 40% of it, because "not delivered" matches 40% of orders.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Query plan</strong>: the steps the server chose. <strong>COLLSCAN</strong>: full collection scan. <strong>IXSCAN</strong>: index scan. <strong>FETCH</strong>: load the documents the index pointed at. <strong>Covered query</strong>: every filtered and returned field is in the index, so no document is read. <strong>Selectivity</strong>: how small a fraction of documents a filter matches.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"It uses an index" is not the same as "it is fast". Compare keys examined with documents returned. Unanchored or case-insensitive regex, <code>$ne</code>/<code>$nin</code>, and filters on computed values all read far more than they return; the same is true of non-sargable predicates in SQL.</p>
  </div>

  <h2 id="md-repl"><span class="num">06</span>Replica Sets</h2>
  <p>One database server is one disk, one power supply, one machine that can crash during a deploy. If it dies, the app is down, and writes since the last backup may be gone. Production MongoDB therefore runs as a <strong>replica set</strong>: several servers holding the same data.</p>
  <p>One member is the <strong>primary</strong>: it takes all writes and records each change in its <strong>oplog</strong> (operation log). The others are <strong>secondaries</strong>: they copy the oplog and replay it, so they hold the same data a moment later. If the primary disappears, the remaining members hold an <strong>election</strong> and promote one secondary to primary.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding kitchen with one head cook and two assistants. Only the head cook decides each dish and writes it in the order book; the assistants copy the book line by line. If the head cook collapses, the assistants agree on who takes over (they need 2 of 3 votes). A dish written but not yet copied by anyone may be lost.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="md-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="60" width="90" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="45" y="85" text-anchor="middle">App</text>
    <line x1="90" y1="80" x2="168" y2="80" stroke="currentColor" marker-end="url(#md-ar2)"/><text x="129" y="72" text-anchor="middle" font-size="10" class="tm">writes</text>
    <rect x="170" y="54" width="130" height="52" rx="8" class="fb sb"/><text x="235" y="76" text-anchor="middle" font-weight="bold">Primary</text><text x="235" y="94" text-anchor="middle" font-size="10" class="tm">oplog</text>
    <rect x="370" y="8" width="130" height="44" rx="8" class="ft st"/><text x="435" y="35" text-anchor="middle">Secondary 1</text>
    <rect x="370" y="108" width="130" height="44" rx="8" class="ft st"/><text x="435" y="135" text-anchor="middle">Secondary 2</text>
    <line x1="300" y1="68" x2="368" y2="34" stroke="currentColor" marker-end="url(#md-ar2)"/><line x1="300" y1="92" x2="368" y2="126" stroke="currentColor" marker-end="url(#md-ar2)"/>
    <text x="228" y="42" font-size="10" class="tm">copy oplog</text>
    <line x1="435" y1="52" x2="435" y2="106" class="sr" stroke-dasharray="3 3"/><text x="443" y="76" font-size="10" class="tr">primary lost</text><text x="443" y="90" font-size="10" class="tr">~10 s → elect</text>
    <text x="100" y="134" font-size="10" class="tg">w: "majority" = ack after 2 of 3</text>
    <text x="100" y="150" font-size="10" class="tm">w: 1 = ack after primary only</text>
  </svg><figcaption>3 voters: one primary takes writes, two secondaries replay its oplog and can take over.</figcaption></figure>
  <p>We started three <code>mongod</code> servers on one machine (ports 27101–27103) with <code>--replSet rs0</code>, joined them with <code>rs.initiate</code>, and checked their roles:</p>
  <div class="fx" data-lang="js">rs.status().members.map(m =&gt; ({ host: m.name, state: m.stateStr }))</div>
  <div class="fx" data-lang="text">[
  { host: '127.0.0.1:27101', state: 'PRIMARY' },
  { host: '127.0.0.1:27102', state: 'SECONDARY' },
  { host: '127.0.0.1:27103', state: 'SECONDARY' }
]</div>
  <p>Then the failover test. This loop, connected to the whole set, writes every half second and prints when a write fails or the first write after a failure succeeds. Three seconds in, we killed the primary's process with <code>kill -9</code> (a crash, not a clean shutdown).</p>
  <div class="fx" data-lang="js">const t0 = Date.now()
let lastFailed = false
for (let i = 1; i &lt;= 30; i++) {
  const secs = ((Date.now() - t0) / 1000).toFixed(1) + "s"
  try {
    db.orders.insertOne({ note: "write " + i })
    if (i == 1 || lastFailed) print(secs, "write", i, "ok, primary =", db.hello().primary)
    lastFailed = false
  } catch (e) {
    print(secs, "write", i, "FAILED:", e.name)
    lastFailed = true
  }
  sleep(500)
}</div>
  <div class="fx" data-lang="text">0.1s write 1 ok, primary = 127.0.0.1:27101
3.2s write 7 FAILED: MongoServerSelectionError
5.7s write 8 FAILED: MongoServerSelectionError
8.2s write 9 FAILED: MongoServerSelectionError
10.7s write 10 FAILED: MongoServerSelectionError
13.2s write 11 ok, primary = 127.0.0.1:27103</div>
  <p>Writes 1–6 went to 27101. After the kill, writes failed for about 10 seconds: that is the default <code>electionTimeoutMillis</code> (10,000), the time the secondaries wait without a heartbeat before calling an election. Then 27103 won and writes resumed with no human involved. When we restarted 27101 it rejoined as a <code>SECONDARY</code> and caught up. (Each failure here took 2.5 s because the shell gives up quickly; application drivers wait up to 30 s by default, so an app usually sees a ~10 s pause rather than errors.)</p>
  <table class="tbl">
    <tr><th>Setting</th><th>Meaning</th><th>Trade-off</th></tr>
    <tr><td><code>w: 1</code></td><td>Ack when the primary has it</td><td>Fast; lost (rolled back) if primary dies before replicating</td></tr>
    <tr><td><code>w: "majority"</code> (default 5.0+)</td><td>Ack when most members have it</td><td>Survives failover; slower</td></tr>
    <tr><td><code>j: true</code></td><td>Ack after writing to the on-disk journal</td><td>Survives a crash of that node</td></tr>
    <tr><td><code>readPreference: primary</code></td><td>All reads from primary (default)</td><td>Always current</td></tr>
    <tr><td><code>secondary</code> / <code>nearest</code></td><td>Read from replicas</td><td>Spreads load, but data may be <strong>stale</strong></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Replica set</strong>: a group of mongod servers with the same data, one primary and the rest secondaries. <strong>Write concern</strong>: how many members must confirm a write before the client hears "ok". <strong>Read preference</strong>: which members reads may go to. <strong>Replication lag</strong>: how far behind the primary a secondary is.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: read-your-writes</span>
    <p>A user places an order (written to the primary), then the "My orders" page reads from a lagging secondary and the order is missing. Fix: read from the primary after writes, or use a <strong>causally consistent session</strong> with majority read/write concern. Also remember: replication gives availability and read capacity, not write capacity. Every write still goes to one primary.</p>
  </div>

  <h2 id="md-shard"><span class="num">07</span>Sharding</h2>
  <p>A replica set copies all data to every member, so it cannot hold more than one machine's disk, and every write still lands on one primary. When the data reaches tens of terabytes or writes outgrow one server, you split the collection across several replica sets. That is <strong>sharding</strong>; each piece is a <strong>shard</strong>.</p>
  <p>The <strong>shard key</strong> is the field (or fields) that decides which shard a document lives on. Documents are grouped into <strong>chunks</strong> (ranges of the key), and a router process, <strong>mongos</strong>, sends each query to the shard(s) that own the relevant chunks. <strong>Config servers</strong> store the map of which chunk lives where.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A post office with several sorting counters. If letters are split by PIN code, every counter gets a fair share and a query for "PIN 411001" goes to one counter. If they were split by "date received", every new letter goes to the last counter and one clerk does all the work while the others sit idle.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="md-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="16" width="80" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="40" y="39" text-anchor="middle">App</text>
    <line x1="80" y1="34" x2="198" y2="34" stroke="currentColor" marker-end="url(#md-ar3)"/>
    <rect x="200" y="12" width="140" height="44" rx="8" class="fb sb"/><text x="270" y="38" text-anchor="middle" font-weight="bold">mongos</text>
    <rect x="400" y="12" width="190" height="44" rx="8" class="fv sb"/><text x="495" y="31" text-anchor="middle">config servers</text><text x="495" y="47" text-anchor="middle" font-size="10" class="tm">which chunk lives where</text>
    <line x1="340" y1="34" x2="398" y2="34" stroke="currentColor" stroke-dasharray="3 3"/>
    <rect x="10" y="120" width="170" height="54" rx="8" class="ft st"/><text x="95" y="142" text-anchor="middle">Shard A</text><text x="95" y="162" text-anchor="middle" font-size="10" class="tm">cust 0–4999</text>
    <rect x="215" y="120" width="170" height="54" rx="8" class="ft st"/><text x="300" y="142" text-anchor="middle">Shard B</text><text x="300" y="162" text-anchor="middle" font-size="10" class="tm">cust 5000–9999</text>
    <rect x="420" y="120" width="170" height="54" rx="8" class="ft st"/><text x="505" y="142" text-anchor="middle">Shard C …</text><text x="505" y="162" text-anchor="middle" font-size="10" class="tm">add more as data grows</text>
    <line x1="250" y1="56" x2="110" y2="118" class="sg" stroke-width="2" marker-end="url(#md-ar3)"/>
    <text x="170" y="76" text-anchor="end" font-size="10" class="tg">customer_id: 42 → targeted</text>
    <g class="sr" stroke-dasharray="4 3"><line x1="300" y1="56" x2="300" y2="118" marker-end="url(#md-ar3)"/><line x1="310" y1="56" x2="490" y2="118" marker-end="url(#md-ar3)"/></g>
    <text x="410" y="84" font-size="10" class="tr">no key → scatter-gather</text>
  </svg><figcaption>Each shard is itself a replica set. Queries carrying the shard key go to one shard; others go to all.</figcaption></figure>
  <p>We built a real 2-shard cluster (shards <code>shA</code> and <code>shB</code>, one config server, one mongos) and inserted the same 10,000 new orders, dated from November onwards, into three collections sharded three ways. The date-keyed one was pre-split at 1 July (older dates on shA, newer on shB); the customer-keyed one at customer 5000.</p>
  <div class="fx" data-lang="js">sh.shardCollection("shop.orders_by_date", { order_date: 1 })                  // ranged, monotonic
sh.shardCollection("shop.orders_hashed",  { _id: "hashed" })                  // hashed
sh.shardCollection("shop.orders_by_cust", { customer_id: 1, order_date: 1 })  // compound
sh.splitAt("shop.orders_by_date", { order_date: ISODate("2024-07-01") })
sh.splitAt("shop.orders_by_cust", { customer_id: 5000, order_date: MinKey() })
db.adminCommand({ moveChunk: "shop.orders_by_date", find: { order_date: ISODate("2024-01-01") }, to: "shA" }).ok
db.adminCommand({ moveChunk: "shop.orders_by_date", find: { order_date: ISODate("2024-12-01") }, to: "shB" }).ok
db.adminCommand({ moveChunk: "shop.orders_by_cust", find: { customer_id: 1, order_date: ISODate("2024-01-01") }, to: "shA" }).ok
db.adminCommand({ moveChunk: "shop.orders_by_cust", find: { customer_id: 9000, order_date: ISODate("2024-01-01") }, to: "shB" }).ok
function newOrders() {                 // 10,000 orders arriving from 1 Nov, one per minute
  const out = []
  for (let i = 0; i &lt; 10000; i++)
    out.push({ customer_id: (i * 7919) % 10000, status: ["delivered", "pending"][i % 2],
               order_date: new Date(Date.UTC(2024, 10, 1) + i * 60000) })
  return out
}
db.orders_by_date.insertMany(newOrders()).acknowledged
db.orders_hashed.insertMany(newOrders()).acknowledged
db.orders_by_cust.insertMany(newOrders()).acknowledged</div>
  <p>The <code>shardCollection</code> and <code>splitAt</code> calls each return a status object with <code>ok: 1</code>, each <code>moveChunk</code> prints <code>1</code>, and each insert prints <code>true</code>. <code>$shardedDataDistribution</code> then reports how many documents each shard owns:</p>
  <div class="fx" data-lang="js">db.getSiblingDB("admin").aggregate([ { $shardedDataDistribution: {} }, { $match: { ns: /^shop\\./ } }, { $unwind: "$shards" },
  { $project: { _id: 0, ns: 1, shard: "$shards.shardName", docs: "$shards.numOwnedDocuments" } },
  { $sort: { ns: 1, shard: 1 } } ])</div>
  <div class="fx" data-lang="text">[
  { ns: 'shop.orders_by_cust', shard: 'shA', docs: 5000 },
  { ns: 'shop.orders_by_cust', shard: 'shB', docs: 5000 },
  { ns: 'shop.orders_by_date', shard: 'shA', docs: 0 },
  { ns: 'shop.orders_by_date', shard: 'shB', docs: 10000 },
  { ns: 'shop.orders_hashed', shard: 'shA', docs: 5041 },
  { ns: 'shop.orders_hashed', shard: 'shB', docs: 4959 }
]</div>
  <p>Keyed on <code>order_date</code>, every new order belonged to the newest range, so <strong>all 10,000 inserts hit shB</strong>: one hot shard, the other idle. Hashed <code>_id</code> spread them almost evenly. The compound <code>{ customer_id, order_date }</code> also spread evenly, because customers are spread out. Now, which shards does a query touch?</p>
  <div class="fx" data-lang="js">db.orders_by_cust.find({ customer_id: 42 }).explain().queryPlanner.winningPlan.stage
db.orders_by_cust.find({ status: "pending" }).explain().queryPlanner.winningPlan.stage</div>
  <div class="fx" data-lang="text">SINGLE_SHARD
SHARD_MERGE</div>
  <p>A query on the shard key's prefix went to one shard (shA). A query without it was sent to every shard and the results merged (<strong>scatter-gather</strong>). With 2 shards that is fine; with 50 it means 50 queries per request.</p>
  <table class="tbl">
    <tr><th></th><th>Ranged key</th><th>Hashed key</th></tr>
    <tr><td>Placement</td><td>Nearby values on the same shard</td><td>Hash of the value spreads docs randomly</td></tr>
    <tr><td>Range queries</td><td>Efficient (one or few shards)</td><td>Scatter-gather</td></tr>
    <tr><td>Monotonic values</td><td>Hot shard (measured: 0 / 10,000)</td><td>Even (5,041 / 4,959)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shard key</strong>: the field(s) that decide a document's shard. A good key has <strong>high cardinality</strong> (many distinct values), <strong>even frequency</strong> (no value dominates), is <strong>not monotonic</strong> (does not always increase), and appears in most queries. <strong>Balancer</strong>: background process that moves chunks to even out shards.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: monotonically increasing keys</span>
    <p>Dates, ObjectIds and auto-increment numbers always land in the top chunk. Use a hashed key, or a compound key that starts with a well-spread field like <code>customer_id</code>. Changing a bad key later (resharding, 5.0+) copies the whole collection, so choose carefully, and don't shard until one replica set truly can't cope.</p>
  </div>

  <h2 id="md-txn"><span class="num">08</span>Transactions</h2>
  <p>Placing an order must do two things: insert the order and reduce the lamp's stock. If the server crashes between them, you either sold a lamp you did not count, or reduced stock for an order that does not exist. When the two pieces are in <em>one</em> document, MongoDB's single-document atomicity already protects you. When they are in two collections, you need a <strong>transaction</strong>: a group of writes that all happen, or none do.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A UPI payment: money leaves your account and arrives in the shop's account as one event. If the second half fails, the first half is reversed. You never see a state where the money is in neither account.</p>
  </div>
  <p>Run against the replica set (transactions need a replica set or sharded cluster). Stock starts at 5. The first transaction commits; the second is aborted; then two transactions fight over the same document.</p>
  <div class="fx" data-lang="js">db.inventory.insertOne({ product: "Lamp", stock: 5 })
const s = db.getMongo().startSession()
const sdb = s.getDatabase("shop")
s.startTransaction({ writeConcern: { w: "majority" } })
sdb.orders.insertOne({ _id: 105, customer_id: 4, status: "pending", items: [ { product: "Lamp", qty: 1, price: 40 } ] })
sdb.inventory.updateOne({ product: "Lamp" }, { $inc: { stock: -1 } })
db.orders.findOne({ _id: 105 })            // outside the transaction: not visible yet
s.commitTransaction()
db.inventory.findOne({}, { _id: 0 })

s.startTransaction()
sdb.orders.insertOne({ _id: 106, customer_id: 4, status: "pending", items: [] })
sdb.inventory.updateOne({ product: "Lamp" }, { $inc: { stock: -1 } })
s.abortTransaction()
db.orders.findOne({ _id: 106 })
db.inventory.findOne({}, { _id: 0 })

const s2 = db.getMongo().startSession()
s.startTransaction(); s2.startTransaction()
s.getDatabase("shop").inventory.updateOne({ product: "Lamp" }, { $inc: { stock: -1 } })
try { s2.getDatabase("shop").inventory.updateOne({ product: "Lamp" }, { $inc: { stock: -1 } }) }
catch (e) { print(e.codeName, JSON.stringify(e.errorLabels)) }
s.commitTransaction(); s2.abortTransaction()
db.inventory.findOne({}, { _id: 0 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: ObjectId('…') }
{ acknowledged: true, insertedId: 105 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
null
{ product: 'Lamp', stock: 4 }
{ acknowledged: true, insertedId: 106 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
null
{ product: 'Lamp', stock: 4 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
WriteConflict ["TransientTransactionError"]
{ product: 'Lamp', stock: 3 }</div>
  <p>Trace it. Inside the first transaction order 105 was written, yet a read <em>outside</em> it returned <code>null</code>: other clients see nothing until commit. After commit, stock is 4. The aborted transaction left no order 106 and stock still 4. In the conflict, the second session's write failed at once with <code>WriteConflict</code>, labelled <code>TransientTransactionError</code>, meaning "safe to retry the whole transaction". Only one decrement happened (stock 3).</p>
  <p>In application code, let the driver do the retrying. pymongo's <code>with_transaction</code> runs your function, commits, and retries on transient errors:</p>
  <div class="fx" data-lang="py">from pymongo import MongoClient
from pymongo.write_concern import WriteConcern

client = MongoClient("mongodb://127.0.0.1:27101,127.0.0.1:27102,127.0.0.1:27103/?replicaSet=rs0")
db = client["shop"]

def place_order(session):
    db.orders.insert_one({"_id": 107, "customer_id": 4, "status": "pending",
                          "items": [{"product": "Lamp", "qty": 1, "price": 40}]}, session=session)
    res = db.inventory.update_one({"product": "Lamp", "stock": {"$gte": 1}},
                                  {"$inc": {"stock": -1}}, session=session)
    if res.modified_count == 0:
        raise ValueError("out of stock")      # any exception -&gt; abort

with client.start_session() as s:
    s.with_transaction(place_order, write_concern=WriteConcern("majority"))

print(db.orders.find_one({"_id": 107}, {"status": 1}))
print(db.inventory.find_one({}, {"_id": 0}))</div>
  <div class="fx" data-lang="text">{'_id': 107, 'status': 'pending'}
{'product': 'Lamp', 'stock': 2}</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Multi-document transaction</strong>: ACID writes across documents and collections (replica sets since 4.0, sharded clusters since 4.2). <strong>Session</strong>: the client-side handle the transaction belongs to. <strong>Two-phase commit (2PC)</strong>: the protocol used when a transaction spans shards.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Transactions cost latency and cache, time out after 60 s by default, should touch fewer than about 1,000 documents, and need retry logic. If most of your writes need them, first ask whether embedding can make it one document, or whether the workload is really relational.</p>
  </div>

  <h2 id="md-pg"><span class="num">09</span>MongoDB vs JSONB</h2>
  <p>Many teams already run PostgreSQL. When product attributes start varying (phones have RAM, sofas have fabric), the question is whether to add MongoDB or use Postgres's <strong>JSONB</strong> column: binary JSON stored inside a normal table, queryable with operators and indexable with a <strong>GIN</strong> index (an index type for "contains" queries on composite values).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your house already has a cupboard with labelled shelves (Postgres). For a few odd-shaped items, you can add a flexible drawer to the same cupboard (JSONB) instead of buying a second cupboard and keeping two keys (a second database to run, back up and secure).</p>
  </div>
  <p>Tested on PostgreSQL 16: orders as JSONB, a GIN index, a "contains a Lamp" query, and an order total computed from the JSON items.</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_doc (order_id int PRIMARY KEY, customer_id int, doc jsonb);
INSERT INTO orders_doc VALUES
 (100, 1, '{"status": "delivered", "items": [{"product": "Laptop", "qty": 1, "price": 800}, {"product": "Lamp", "qty": 2, "price": 40}]}'),
 (101, 1, '{"status": "delivered", "items": [{"product": "Phone", "qty": 1, "price": 500}]}'),
 (104, 3, '{"status": "pending",   "items": [{"product": "Lamp", "qty": 3, "price": 40}]}');
CREATE INDEX orders_doc_gin ON orders_doc USING gin (doc jsonb_path_ops);

SELECT order_id FROM orders_doc
WHERE doc @&gt; '{"items": [{"product": "Lamp"}]}';

SELECT order_id, doc -&gt;&gt; 'status' AS status,
       (SELECT sum((i -&gt;&gt; 'qty')::int * (i -&gt;&gt; 'price')::int)
        FROM jsonb_array_elements(doc -&gt; 'items') AS i) AS total
FROM orders_doc ORDER BY order_id;</div>
  <div class="fx" data-lang="text"> order_id
----------
      100
      104
(2 rows)

 order_id |  status   | total
----------+-----------+-------
      100 | delivered |   880
      101 | delivered |   500
      104 | pending   |   120
(3 rows)</div>
  <p><code>@&gt;</code> means "contains": the document contains an items array with an element having product Lamp, the same question as Mongo's <code>{ "items.product": "Lamp" }</code>, and the GIN index can answer it. <code>-&gt;&gt;</code> extracts a field as text and <code>jsonb_array_elements</code> unnests the array, the SQL cousin of <code>$unwind</code>. Same totals as the aggregation page.</p>
  <table class="tbl">
    <tr><th>Need</th><th>Lean towards</th></tr>
    <tr><td>Mostly relational data, a few flexible attributes</td><td>PostgreSQL + JSONB</td></tr>
    <tr><td>Joins, ad-hoc analytics, strict constraints, multi-table transactions</td><td>PostgreSQL</td></tr>
    <tr><td>Documents are the main model; nested reads/writes as one unit</td><td>MongoDB</td></tr>
    <tr><td>Built-in horizontal scaling of writes across many machines</td><td>MongoDB (Postgres needs Citus or similar)</td></tr>
    <tr><td>Partial in-place updates of big nested docs</td><td>MongoDB (a JSONB update writes a new version of the whole value)</td></tr>
    <tr><td>One database for the team to run, already on Postgres</td><td>PostgreSQL + JSONB</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>JSONB</strong>: PostgreSQL's binary JSON column type. <strong>GIN index</strong>: Generalized Inverted Index, maps each key/value inside the JSON to the rows containing it. <strong>jsonb_path_ops</strong>: a smaller GIN variant that supports <code>@&gt;</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"We need flexible fields, so we need MongoDB" skips the cheaper option. In system-design interviews, say why: JSONB if the core is relational, MongoDB if documents are the core model or you need built-in write scale-out.</p>
  </div>

  <h2 id="md-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>Design mistakes do not fail on day one. They show up when data grows, when a server dies, or when traffic shifts. These are the ones interviewers and production incidents both point to.</p>
  <div class="callout trap"><span class="label">Trap: embedding unbounded arrays</span>
    <p>All orders inside the customer; all comments inside the post. Cap: about 79,000 orders of 212 bytes, but it is slow long before that.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: designing like SQL</span>
    <p>One collection per entity and <code>$lookup</code> on every request. Shape documents around the main queries instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: copying data that changes often</span>
    <p>Extended references are for stable fields. Copying stock levels creates drift and giant <code>updateMany</code> calls.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: compound index in the wrong order</span>
    <p>Equality, Sort, Range. Range before sort gave 35,053 keys and an in-memory sort instead of 24 keys.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unique index on an optional field</span>
    <p>The second document missing the field fails with <code>dup key: { email: null }</code>. Use a partial index.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: TTL on a string date</span>
    <p>It never expires. Store real dates.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: w: 1 for important writes, or reading from secondaries right after writing</span>
    <p>The first can lose acknowledged writes in a failover; the second shows users stale data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a monotonic shard key</span>
    <p>All new writes on one shard (0 / 10,000 in our test). Hash it or lead with a well-spread field.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: transactions without retry</span>
    <p><code>WriteConflict</code> with <code>TransientTransactionError</code> is normal under load. Use <code>with_transaction</code> or retry yourself.</p>
  </div>

  <h2 id="md-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Should a customer's orders be embedded in the customer document?</summary><div class="qa-body">No. Orders grow without bound (16 MB limit, ever-larger rewrites) and are often queried on their own. Store orders separately with <code>customer_id</code>. Embed the order's items in the order instead: few, always read together, a snapshot in time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An order page always shows the customer's name. How do you avoid a <code>$lookup</code> on every view?</summary><div class="qa-body">Extended reference: store <code>customer: { _id: 1, name: "Asha" }</code> in the order. If the name changes, update the copies with <code>updateMany({ "customer._id": 1 }, { $set: { "customer.name": ... } })</code>; acceptable because names rarely change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You store one document per IoT reading and the index no longer fits in RAM. What pattern helps?</summary><div class="qa-body">The bucket pattern: one document per sensor per hour with an array of readings. In our test 100,000 docs became 1,670 and the index went from 1,096 KB to 40 KB. Or use a time-series collection, which buckets automatically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your validator lists <code>status</code> with an enum, yet a document gained a field <code>stauts</code>. Why?</summary><div class="qa-body">JSON Schema only checks properties it lists; unknown fields are allowed by default. Add <code>additionalProperties: false</code> (and list every allowed field, including <code>_id</code>) to reject them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Query: <code>find({status: "delivered", order_date: {$gte: X}}).sort({customer_id: 1}).limit(20)</code>. Design the index.</summary><div class="qa-body">ESR: <code>{ status: 1, customer_id: 1, order_date: 1 }</code>. Equality on status, then the sort field so results come out in order and the scan can stop after 20, then the range. Measured: 24 keys examined vs 35,053 plus an in-memory SORT with <code>{ status, order_date, customer_id }</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Index <code>{a: 1, b: 1, c: 1}</code>. Which can use it: filter on <code>a</code>; <code>a, b</code>; <code>b, c</code>; <code>a, c</code>?</summary><div class="qa-body"><code>a</code> and <code>a, b</code> fully (prefixes). <code>a, c</code> uses the index for <code>a</code> only, checking <code>c</code> on the scanned entries. <code>b, c</code> can't use it efficiently (no leading <code>a</code>): in our test, a filter on the second field alone was a COLLSCAN of 100,000 docs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>explain() shows COLLSCAN, totalDocsExamined 2,000,000, nReturned 40. What do you do?</summary><div class="qa-body">The filter has no supporting index. Add one on the filtered fields (ESR order if there's a sort), confirm IXSCAN and examined ≈ returned. If the filter is an unanchored regex or <code>$ne</code>, rethink the query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a covered query and how do you spot one?</summary><div class="qa-body">A query whose filter and returned fields are all in one index, so no document is read. In explain: a <code>PROJECTION_COVERED</code> stage and <code>totalDocsExamined: 0</code>. Remember to exclude <code>_id</code> unless it is in the index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you auto-delete user sessions 1 hour after creation?</summary><div class="qa-body">TTL index: <code>createIndex({ created_at: 1 }, { expireAfterSeconds: 3600 })</code>. A background task removes expired docs about every 60 s, so deletion isn't instant. The field must hold a real date; strings never expire.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when the primary of a replica set dies?</summary><div class="qa-body">Secondaries miss heartbeats for <code>electionTimeoutMillis</code> (10 s default), hold an election, and an up-to-date member becomes primary; we measured about 10 s from <code>kill -9</code> to the next successful write. Drivers retry writes. Writes acknowledged only with <code>w: 1</code> that hadn't replicated may be rolled back; <code>w: "majority"</code> writes survive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a replica set usually have 3 members and not 2?</summary><div class="qa-body">An election needs a majority of voters. With 2, losing one leaves 1 of 2, not a majority, so no primary can be elected. With 3, losing one leaves 2 of 3, which is a majority.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A user updates their profile and immediately sees the old version. Why?</summary><div class="qa-body">The read went to a secondary that hadn't replicated the write yet (replication lag). Fix: read from the primary for that flow, or use a causally consistent session with majority read and write concern.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>order_date</code> or an ObjectId a bad ranged shard key? What would you pick for orders?</summary><div class="qa-body">They only increase, so every insert lands on the shard holding the highest range: in our test 10,000 of 10,000 new orders went to one shard. For orders, <code>{ customer_id: 1, order_date: 1 }</code> spreads writes (5,000 / 5,000) and keeps "orders of customer X" on one shard (SINGLE_SHARD in explain); or a hashed <code>_id</code> if you only need even writes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need a multi-document transaction in MongoDB, and what does it cost?</summary><div class="qa-body">When one logical change touches several documents that must stay consistent, e.g. create an order and decrement stock. Cost: higher latency, cache pressure, 60 s default limit, write conflicts needing retries (<code>TransientTransactionError</code>), and two-phase commit across shards. First ask whether embedding makes it one document.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team is on PostgreSQL and needs flexible product attributes. MongoDB or JSONB?</summary><div class="qa-body">JSONB. Attributes go in a <code>jsonb</code> column with a GIN index (<code>@&gt;</code> queries), while orders, joins, constraints and transactions stay relational, and you run one database. MongoDB pays off when documents are the main model or you need built-in write scale-out.</div></details>
</main>
`
});
