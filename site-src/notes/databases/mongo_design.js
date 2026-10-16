// notes/databases/mongo_design.js — Schema Design, Indexes & Scaling
Object.assign(TOPIC_CONTENT, {
  "mongo_design": `<main>
  <h1>Schema Design, Indexes &amp; Scaling</h1>
  <p class="lead">In MongoDB, the shape of your documents decides your performance. This page covers how to model data, which indexes to build, and how replica sets and sharding keep it available and scalable.</p>

  <h2 id="md-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">Mongo Schema, Indexes &amp; Scaling</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">Embed vs reference</div>
      <ul>
        <li><b>Core rule</b> — accessed together → stored together; model around queries</li>
        <li><b>Embed</b> — 1:few, always read with parent, snapshots (items, price at purchase)</li>
        <li><b>Reference</b> — store the other <code>_id</code>; nothing enforces it</li>
        <li><b>1:many</b> → reference or embed a subset; <b>1:squillions</b> → child holds parent id</li>
        <li><b>M:N</b> → array of ids on one/both sides</li>
        <li>⚠ <b>Unbounded arrays</b> — 16 MB cap, growing rewrites, huge indexes</li>
        <li>💡 recipe card lists ingredients, says "see aisle 4" for prices</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Design patterns</div>
      <ul>
        <li><b>Extended reference</b> — copy the few fields you always show (customer name) → no $lookup</li>
        <li><b>Subset</b> — embed 10 newest reviews; rest in own collection</li>
        <li><b>Computed</b> — store <code>total</code>, update on write</li>
        <li><b>Bucket</b> — one doc per sensor per hour; time-series collections do it for you</li>
        <li><b>Outlier</b> — design for typical; flag <code>has_overflow</code> for the huge one</li>
        <li><b>Trade-off</b> — duplicated fields: fast reads, many-doc updates; duplicate rarely-changing data</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Schema validation</div>
      <ul>
        <li><b>Why</b> — typo <code>stauts</code> silently creates a new field</li>
        <li><b>$jsonSchema</b> — <code>required</code>, <code>bsonType</code>, <code>enum</code>, <code>minimum</code>, <code>minItems</code></li>
        <li><b>validationAction</b> — <code>"error"</code> rejects, <code>"warn"</code> logs</li>
        <li>⚠ mongosh <code>1</code> is a double → use <code>"number"</code>, not <code>"int"</code></li>
        <li>⚠ Existing docs not re-checked</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Indexes</div>
      <ul>
        <li><b>Single / compound</b> — compound used by a <em>prefix</em> of its fields</li>
        <li><b>ESR</b> — Equality, then Sort, then Range: no in-memory sort</li>
        <li><b>Multikey</b> — on arrays, entry per element; max one array field per compound</li>
        <li><b>TTL</b> — <code>expireAfterSeconds</code>; deleter runs ~every 60 s</li>
        <li><b>Unique</b> — missing field = null; only one doc may lack it (use partial)</li>
        <li><b>Text</b> — one per collection; Atlas Search for real search</li>
        <li>⚠ <b>Cost</b> — slower writes, RAM; drop unused (<code>$indexStats</code>); no boolean-only index</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">explain()</div>
      <ul>
        <li><b>explain("executionStats")</b></li>
        <li><b>IXSCAN</b> (+FETCH) good · <b>COLLSCAN</b> = every doc</li>
        <li><b>totalDocsExamined ≈ nReturned</b> — good selectivity</li>
        <li><b>SORT stage</b> = in-memory sort → fix index order (ESR)</li>
        <li><b>Docs examined 0</b> = covered query</li>
        <li>⚠ <code>/lamp/i</code>, <code>$ne</code>, <code>$nin</code> can't use indexes well</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Replica sets</div>
      <ul>
        <li><b>Primary</b> takes writes; <b>secondaries</b> copy its oplog</li>
        <li><b>Failover</b> — ~10 s no heartbeat → election; drivers retry</li>
        <li><b>Odd voters</b> (3) so a majority exists</li>
        <li><b>w: 1</b> fast, may roll back · <b>w: "majority"</b> survives failover (default 5.0+) · <b>j: true</b> journaled</li>
        <li><b>readPreference</b> — primary (default) vs secondary/nearest (stale)</li>
        <li>⚠ <b>Read-your-writes</b> — read primary or causally consistent session</li>
        <li><b>Gives</b> availability + read scale, not write scale</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Sharding</div>
      <ul>
        <li><b>What</b> — split a collection across replica sets by a shard key; scales writes + storage</li>
        <li><b>Parts</b> — mongos router, config servers, shards; chunks moved by balancer</li>
        <li><b>Targeted</b> (key in query) vs <b>scatter-gather</b> (all shards)</li>
        <li><b>Ranged</b> — good range queries, hot shard on monotonic keys · <b>Hashed</b> — even, ranges scatter</li>
        <li><b>Good key</b> — high cardinality, even frequency, not monotonic, in most queries</li>
        <li>⚠ <b>ObjectId / date</b> ranged key → all inserts on one shard; use <code>{ customer_id, order_date }</code></li>
        <li><b>Resharding</b> (5.0+) copies everything; shard only when needed</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Transactions &amp; vs JSONB</div>
      <ul>
        <li><b>Single doc</b> — always atomic</li>
        <li><b>Multi-doc</b> — 4.0 replica sets, 4.2 sharded; <code>startTransaction / commitTransaction</code></li>
        <li><b>Cost</b> — latency, cache pressure, 60 s limit, ~1,000 docs, 2PC across shards</li>
        <li><b>TransientTransactionError</b> → retry (<code>withTransaction</code>)</li>
        <li><b>Many txns?</b> schema fights workload, or it's relational</li>
        <li><b>PG + JSONB</b> — mostly relational + flexible attrs, one DB; GIN index</li>
        <li><b>MongoDB</b> — docs are the model, built-in write scale-out, in-place partial updates</li>
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
      <div class="rm-item rm-done" data-target="md-idx"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Indexes</span><span class="rm-sub">ESR rule, multikey, TTL</span></div></div>
      <div class="rm-item rm-done" data-target="md-explain"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">explain()</span><span class="rm-sub">IXSCAN vs COLLSCAN</span></div></div>
      <div class="rm-item rm-done" data-target="md-repl"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Replica Sets</span><span class="rm-sub">Failover, write concern, reads</span></div></div>
      <div class="rm-item rm-done" data-target="md-shard"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Sharding</span><span class="rm-sub">Choosing the shard key</span></div></div>
      <div class="rm-item rm-done" data-target="md-txn"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Transactions</span><span class="rm-sub">Possible, but not free</span></div></div>
      <div class="rm-item rm-done" data-target="md-pg"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">MongoDB vs JSONB</span><span class="rm-sub">Do you need Mongo at all?</span></div></div>
      <div class="rm-item rm-done" data-target="md-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="md-embed"><span class="num">01</span>Embed vs Reference</h2>
  <div class="callout def"><span class="label">The core rule</span>
    <p><strong>Data that is accessed together is stored together.</strong> Design documents around your queries, not around entities.</p>
  </div>
  <ul>
    <li><strong>Embed</strong>: put the related data inside the parent document (items inside the order). One read, one atomic write.</li>
    <li><strong>Reference</strong>: store the other document's <code>_id</code> (order holds <code>customer_id</code>). Like a foreign key, but nothing enforces it.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A recipe card lists its ingredients right on the card (embed). For prices it just says "see aisle 4" (reference).</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="md-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="20" width="200" height="130" rx="6" class="fb sb"/>
    <text x="10" y="40" font-weight="bold">order 100</text><text x="10" y="58" font-size="11">customer_id: 1</text>
    <rect x="10" y="70" width="180" height="70" rx="4" class="ft st"/>
    <text x="20" y="88" font-size="11">items (embedded)</text><text x="20" y="106" font-size="11" class="tm">Laptop · 1 · 800</text><text x="20" y="124" font-size="11" class="tm">Lamp · 2 · 40</text>
    <text x="100" y="166" text-anchor="middle" font-size="10" class="tg">1:few, read together, snapshot</text>
    <rect x="260" y="20" width="140" height="56" rx="6" class="fv"/><text x="330" y="44" text-anchor="middle" font-weight="bold">customer 1</text><text x="330" y="62" text-anchor="middle" font-size="11" class="tm">Asha, Mumbai</text>
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
  <table class="tbl">
    <tr><th>Situation</th><th>Choose</th><th>Shop example</th></tr>
    <tr><td><strong>1 : few</strong>, always read with the parent</td><td>Embed</td><td>Items in an order; addresses in a customer</td></tr>
    <tr><td><strong>1 : many</strong> (hundreds–thousands), often read alone</td><td>Reference, or embed a subset</td><td>Reviews of a product</td></tr>
    <tr><td><strong>1 : squillions</strong> (unbounded)</td><td>Reference from the child side</td><td>Click events: each event stores <code>customer_id</code></td></tr>
    <tr><td>Many : many</td><td>Array of ids on one or both sides</td><td>Products ↔ tags</td></tr>
    <tr><td>Child updated often and independently</td><td>Reference</td><td>Product stock level</td></tr>
    <tr><td>Child must be a snapshot in time</td><td>Embed a copy</td><td>Price at purchase time</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: unbounded arrays</span>
    <p>Never embed an array that grows without limit (all orders inside the customer). Documents hit the <strong>16 MB</strong> cap, every update rewrites a growing document, and indexes on the array balloon.</p>
  </div>
  <div class="callout intu"><span class="label">Trade-off</span>
    <p>Embedding duplicates data (product name copied into every order). Reads get faster; updates to the duplicated field must touch many documents. Duplicate fields that rarely change.</p>
  </div>

  <h2 id="md-pat"><span class="num">02</span>Design Patterns</h2>
  <table class="tbl">
    <tr><th>Pattern</th><th>Idea</th><th>Tiny example</th></tr>
    <tr><td><strong>Extended reference</strong></td><td>Copy the few fields you always need from the referenced doc</td><td><code>{ customer: { _id: 1, name: "Asha" } }</code> in each order, so no <code>$lookup</code></td></tr>
    <tr><td><strong>Subset</strong></td><td>Embed only the most-used part; keep the rest elsewhere</td><td>Product holds its 10 newest reviews; all reviews in <code>reviews</code></td></tr>
    <tr><td><strong>Computed</strong></td><td>Store a pre-calculated value, update it on write</td><td><code>{ _id: 100, total: 880 }</code> instead of summing items each read</td></tr>
    <tr><td><strong>Bucket</strong></td><td>Group many small records into one doc per time window</td><td><code>{ sensor: 7, hour: ISODate("2024-05-01T10:00Z"), readings: [ ...60 values ] }</code></td></tr>
    <tr><td><strong>Outlier</strong></td><td>Design for the typical case; flag and overflow the rare huge one</td><td>Product with 50k reviews: <code>has_overflow: true</code> + extra docs</td></tr>
  </table>
  <p>MongoDB 5.0+ <strong>time-series collections</strong> apply the bucket pattern for you.</p>

  <h2 id="md-valid"><span class="num">03</span>Schema Validation</h2>
  <p>"Flexible schema" means one typo (<code>stauts</code>) silently creates a new field. A <code>$jsonSchema</code> validator rejects bad writes at the database.</p>
  <div class="fx" data-lang="js">db.createCollection("orders", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["customer_id", "order_date", "status", "items"],
    properties: {
      status: { enum: ["pending", "delivered", "cancelled"] },
      order_date: { bsonType: "date" },
      items: { bsonType: "array", minItems: 1,
               items: { bsonType: "object", required: ["product", "qty", "price"],
                        properties: { qty: { bsonType: "number", minimum: 1 } } } }
    } } },
  validationAction: "error"     // "warn" = log only
})

db.orders.insertOne({ _id: 105, customer_id: 4, order_date: new Date(), status: "shipped", items: [] })
// MongoServerError: Document failed validation</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In mongosh, <code>qty: 1</code> is a <strong>double</strong>. A rule of <code>bsonType: "int"</code> rejects it unless you write <code>NumberInt(1)</code>. Use <code>"number"</code> (any numeric type) unless you need the exact type. Also, existing documents are not re-checked when you add a validator.</p>
  </div>

  <h2 id="md-idx"><span class="num">04</span>Indexes</h2>
  <p>Same idea as SQL: a sorted B-tree of field values pointing at documents. Without one, every query scans the whole collection.</p>
  <div class="fx" data-lang="js">db.orders.createIndex({ customer_id: 1 })                         // single field
db.orders.createIndex({ status: 1, customer_id: 1, order_date: -1 }) // compound
db.orders.createIndex({ "items.product": 1 })                      // multikey (array)
db.customers.createIndex({ email: 1 }, { unique: true })           // unique
db.sessions.createIndex({ created_at: 1 }, { expireAfterSeconds: 3600 })  // TTL
db.products.createIndex({ description: "text" })                   // text search</div>
  <table class="tbl">
    <tr><th>Type</th><th>Use</th><th>Gotcha</th></tr>
    <tr><td><strong>Single</strong></td><td>Filter/sort on one field</td><td>Direction (1/-1) doesn't matter for one field</td></tr>
    <tr><td><strong>Compound</strong></td><td>Multi-field filters + sort</td><td>Usable only by a <em>prefix</em> of its fields</td></tr>
    <tr><td><strong>Multikey</strong></td><td>Any index on an array field; one entry per element</td><td>At most one array field per compound index</td></tr>
    <tr><td><strong>Text</strong></td><td>Word search with <code>$text</code></td><td>One per collection; basic. Use Atlas Search for real search</td></tr>
    <tr><td><strong>TTL</strong></td><td>Auto-delete docs N seconds after a date field</td><td>Background job runs ~every 60 s, so not exact</td></tr>
    <tr><td><strong>Unique</strong></td><td>Enforce no duplicates</td><td>Missing field counts as null: only one doc may lack it (use a partial index)</td></tr>
  </table>
  <h3>The ESR rule for compound indexes</h3>
  <p>Order the fields: <strong>E</strong>quality first, then <strong>S</strong>ort, then <strong>R</strong>ange.</p>
  <div class="fx" data-lang="js">// delivered orders since June, sorted by customer
db.orders.find({ status: "delivered", order_date: { $gte: ISODate("2024-06-01") } })
         .sort({ customer_id: 1 })

// ESR index:  E = status, S = customer_id, R = order_date
db.orders.createIndex({ status: 1, customer_id: 1, order_date: 1 })</div>
  <ul>
    <li><strong>Equality first</strong>: narrows to one contiguous slice of the index.</li>
    <li><strong>Sort next</strong>: within that slice, entries are already in <code>customer_id</code> order, so no in-memory sort.</li>
    <li><strong>Range last</strong>: if the range came before the sort field, results would span many slices and need a sort.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A phone book sorted by (city, surname, first name). "Mumbai, surnames A–C, sorted by surname" is easy. "First name Asha, any city" can't use the book at all: that's the prefix rule.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every index slows writes and uses RAM. Indexes should fit in memory. Drop unused ones (<code>$indexStats</code> shows usage), and don't index low-selectivity fields on their own (e.g. a boolean).</p>
  </div>

  <h2 id="md-explain"><span class="num">05</span>explain()</h2>
  <div class="fx" data-lang="js">db.orders.find({ customer_id: 3 }).explain("executionStats")</div>
  <table class="tbl">
    <tr><th>Look at</th><th>Good</th><th>Bad</th></tr>
    <tr><td><code>winningPlan.stage</code></td><td><code>IXSCAN</code> (+ <code>FETCH</code>)</td><td><code>COLLSCAN</code>: read every document</td></tr>
    <tr><td><code>totalDocsExamined</code> vs <code>nReturned</code></td><td>Close to equal</td><td>Examined ≫ returned</td></tr>
    <tr><td>Sort stage</td><td>None (index order used)</td><td><code>SORT</code> in memory</td></tr>
    <tr><td><code>totalDocsExamined: 0</code></td><td>Covered query: answered from the index alone</td><td>—</td></tr>
  </table>
  <p>Without an index on <code>customer_id</code>, the query above is a <code>COLLSCAN</code> examining all 5 orders to return 2. With <code>{ customer_id: 1 }</code>, it's an <code>IXSCAN</code> examining exactly 2.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Unanchored or case-insensitive regex (<code>/lamp/i</code>), <code>$ne</code>/<code>$nin</code>, and filters on computed values can't use an index efficiently. Same as SQL sargability.</p>
  </div>

  <h2 id="md-repl"><span class="num">06</span>Replica Sets</h2>
  <p>A <strong>replica set</strong>: servers holding the same data. One <strong>primary</strong> takes all writes; <strong>secondaries</strong> copy its operation log (oplog) and can serve reads.</p>
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
  <ul>
    <li><strong>Automatic failover</strong>: drivers retry and reconnect to the new primary.</li>
    <li><strong>Odd number</strong> of voters (usually 3) so a majority can always form.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>One head chef (primary) decides every dish; sous-chefs copy their notebook. If the head chef collapses, the kitchen votes a sous-chef in. A dish the head chef wrote but no one copied yet may be lost.</p>
  </div>
  <h3>Write concern and read preference</h3>
  <table class="tbl">
    <tr><th>Setting</th><th>Meaning</th><th>Trade-off</th></tr>
    <tr><td><code>w: 1</code></td><td>Ack when the primary has it</td><td>Fast; lost if primary dies before replicating (rolled back)</td></tr>
    <tr><td><code>w: "majority"</code> (default 5.0+)</td><td>Ack when most members have it</td><td>Survives failover; slower</td></tr>
    <tr><td><code>j: true</code></td><td>Ack after writing to the on-disk journal</td><td>Survives a crash of that node</td></tr>
    <tr><td><code>readPreference: primary</code></td><td>All reads from primary (default)</td><td>Always current</td></tr>
    <tr><td><code>secondary</code> / <code>secondaryPreferred</code> / <code>nearest</code></td><td>Read from replicas</td><td>Spreads load, but data may be <strong>stale</strong></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap: read-your-writes</span>
    <p>A user places order 105 (written to the primary), then the "My orders" page reads from a lagging secondary and the order is missing. Fix: read from the primary after writes, or use a <strong>causally consistent session</strong> with majority read/write concern.</p>
  </div>
  <p>Replication gives <strong>availability and read scaling</strong>, not write scaling: every write still goes to one primary.</p>

  <h2 id="md-shard"><span class="num">07</span>Sharding</h2>
  <p><strong>Sharding</strong> splits one collection across several replica sets (shards) by a <strong>shard key</strong>. It scales writes and storage beyond one machine.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="md-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="16" width="80" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="40" y="39" text-anchor="middle">App</text>
    <line x1="80" y1="34" x2="198" y2="34" stroke="currentColor" marker-end="url(#md-ar3)"/>
    <rect x="200" y="12" width="140" height="44" rx="8" class="fb sb"/><text x="270" y="38" text-anchor="middle" font-weight="bold">mongos</text>
    <rect x="400" y="12" width="190" height="44" rx="8" class="fv"/><text x="495" y="31" text-anchor="middle">config servers</text><text x="495" y="47" text-anchor="middle" font-size="10" class="tm">which chunk lives where</text>
    <line x1="340" y1="34" x2="398" y2="34" stroke="currentColor" stroke-dasharray="3 3"/>
    <rect x="10" y="120" width="170" height="54" rx="8" class="ft st"/><text x="95" y="142" text-anchor="middle">Shard A</text><text x="95" y="162" text-anchor="middle" font-size="10" class="tm">cust 1–33k</text>
    <rect x="215" y="120" width="170" height="54" rx="8" class="ft st"/><text x="300" y="142" text-anchor="middle">Shard B</text><text x="300" y="162" text-anchor="middle" font-size="10" class="tm">cust 33k–66k</text>
    <rect x="420" y="120" width="170" height="54" rx="8" class="ft st"/><text x="505" y="142" text-anchor="middle">Shard C</text><text x="505" y="162" text-anchor="middle" font-size="10" class="tm">cust 66k–100k</text>
    <line x1="250" y1="56" x2="110" y2="118" class="sg" stroke-width="2" marker-end="url(#md-ar3)"/>
    <text x="170" y="76" text-anchor="end" font-size="10" class="tg">customer_id: 42 → targeted</text>
    <g class="sr" stroke-dasharray="4 3"><line x1="300" y1="56" x2="300" y2="118" marker-end="url(#md-ar3)"/><line x1="310" y1="56" x2="490" y2="118" marker-end="url(#md-ar3)"/></g>
    <text x="410" y="84" font-size="10" class="tr">no key → scatter-gather</text>
  </svg><figcaption>Each shard is itself a replica set. Queries carrying the shard key go to one shard; others go to all.</figcaption></figure>
  <p>Data is split into <strong>chunks</strong> (key ranges); a balancer moves chunks to even out shards.</p>
  <table class="tbl">
    <tr><th></th><th>Ranged key</th><th>Hashed key</th></tr>
    <tr><td>Placement</td><td>Nearby values on the same shard</td><td>Hash of the value spreads docs randomly</td></tr>
    <tr><td>Range queries</td><td>Efficient (one or few shards)</td><td>Scatter-gather</td></tr>
    <tr><td>Monotonic values</td><td>Hot shard</td><td>Evenly spread</td></tr>
  </table>
  <p>A good shard key has <strong>high cardinality</strong> (many distinct values), <strong>even frequency</strong> (no single value dominates), is <strong>not monotonic</strong>, and appears in most queries.</p>
  <div class="callout trap"><span class="label">Trap: monotonically increasing keys</span>
    <p>Sharding on <code>order_date</code> or an ObjectId sends every insert to the shard owning the top range. Use a hashed key or a compound key like <code>{ customer_id: 1, order_date: 1 }</code>.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 120" width="600">
    <text x="0" y="14" font-size="11" font-weight="bold">ranged on order_date / ObjectId</text>
    <g><rect x="0" y="62" width="50" height="8" class="fs"/><rect x="60" y="62" width="50" height="8" class="fs"/><rect x="120" y="22" width="50" height="48" class="fr sr"/></g>
    <g font-size="10" class="tm" text-anchor="middle"><text x="25" y="86">A</text><text x="85" y="86">B</text><text x="145" y="86">C</text></g>
    <text x="0" y="106" font-size="10" class="tr">every new insert has the max key → one hot shard</text>
    <text x="330" y="14" font-size="11" font-weight="bold">hashed / { customer_id, order_date }</text>
    <g><rect x="330" y="38" width="50" height="32" class="fg sg"/><rect x="390" y="40" width="50" height="30" class="fg sg"/><rect x="450" y="36" width="50" height="34" class="fg sg"/></g>
    <g font-size="10" class="tm" text-anchor="middle"><text x="355" y="86">A</text><text x="415" y="86">B</text><text x="475" y="86">C</text></g>
    <text x="330" y="106" font-size="10" class="tg">writes spread evenly</text>
  </svg><figcaption>Insert load per shard. A monotonic key funnels all writes into the shard owning the top range.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Filing cabinets split by surname letter. Splitting by "date joined" means every new file goes in the last cabinet, and one clerk does all the work.</p>
  </div>
  <p>A bad key is costly to fix: since 5.0 you can reshard online, but it copies the whole collection. Don't shard until one replica set can't cope.</p>

  <h2 id="md-txn"><span class="num">08</span>Transactions</h2>
  <p>Single-document writes are always atomic. Multi-document ACID transactions exist (4.0 replica sets, 4.2 sharded) for the cases embedding can't cover.</p>
  <div class="fx" data-lang="js">const s = db.getMongo().startSession()
s.startTransaction({ writeConcern: { w: "majority" } })
try {
  s.getDatabase("shop").orders.insertOne({ _id: 105, customer_id: 4, order_date: new Date(), status: "pending",
    items: [ { product: "Lamp", category: "Furniture", qty: 1, price: 40 } ] })
  s.getDatabase("shop").inventory.updateOne({ product: "Lamp" }, { $inc: { stock: -1 } })
  s.commitTransaction()
} catch (e) {
  s.abortTransaction()
}</div>
  <ul>
    <li><strong>Cost</strong>: extra coordination, more cache pressure, slower than single-doc writes; across shards, a two-phase commit.</li>
    <li><strong>Limits</strong>: default 60 s lifetime; aim for under ~1,000 modified documents.</li>
    <li><strong>Write conflicts</strong>: two transactions touching the same document → one aborts with a <code>TransientTransactionError</code>; retry it (drivers' <code>withTransaction</code> does this).</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>If many operations need transactions, the schema may be fighting the workload, or the workload belongs in a relational database.</p>
  </div>

  <h2 id="md-pg"><span class="num">09</span>MongoDB vs JSONB</h2>
  <p>PostgreSQL's <strong>JSONB</strong> column stores binary JSON in a normal table, indexable with GIN. You get documents <em>and</em> SQL.</p>
  <div class="fx" data-lang="sql">SELECT order_id FROM orders_doc
WHERE doc -&gt; 'items' @&gt; '[{"product": "Lamp"}]';   -- GIN-indexable containment</div>
  <table class="tbl">
    <tr><th>Need</th><th>Lean towards</th></tr>
    <tr><td>Mostly relational data, a few flexible attributes</td><td>PostgreSQL + JSONB</td></tr>
    <tr><td>Joins, ad-hoc analytics, strict constraints, multi-table transactions</td><td>PostgreSQL</td></tr>
    <tr><td>Documents are the main model; nested reads/writes as one unit</td><td>MongoDB</td></tr>
    <tr><td>Built-in horizontal scaling of writes across many machines</td><td>MongoDB (Postgres needs Citus or similar)</td></tr>
    <tr><td>Partial in-place updates of big nested docs</td><td>MongoDB (JSONB rewrites the whole value)</td></tr>
    <tr><td>One database for the team to run, already on Postgres</td><td>PostgreSQL + JSONB</td></tr>
  </table>

  <h2 id="md-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Should a customer's orders be embedded in the customer document?</summary><div class="qa-body">No. Orders grow without bound (16 MB limit, ever-larger rewrites) and are often queried on their own. Store orders separately with <code>customer_id</code>. Embed the order's items in the order instead: few, always read together, a snapshot in time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>An order page always shows the customer's name. How do you avoid a <code>$lookup</code> on every view?</summary><div class="qa-body">Extended reference: store <code>customer: { _id: 1, name: "Asha" }</code> in the order. If the name changes, update the copies with <code>updateMany</code>; acceptable because names rarely change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Query: <code>find({status: "delivered", order_date: {$gte: X}}).sort({customer_id: 1})</code>. Design the index.</summary><div class="qa-body">ESR: <code>{ status: 1, customer_id: 1, order_date: 1 }</code>. Equality on status, then the sort field so results come out in order, then the range. Putting <code>order_date</code> second would force an in-memory sort.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Index <code>{a: 1, b: 1, c: 1}</code>. Which can use it: filter on <code>a</code>; <code>a, b</code>; <code>b, c</code>; <code>a, c</code>?</summary><div class="qa-body"><code>a</code> and <code>a, b</code> fully (prefixes). <code>a, c</code> uses the index for <code>a</code> only, checking <code>c</code> on the scanned entries. <code>b, c</code> can't use it efficiently (no leading <code>a</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>explain() shows COLLSCAN, totalDocsExamined 2,000,000, nReturned 40. What do you do?</summary><div class="qa-body">The filter has no supporting index. Add one on the filtered fields (ESR order if there's a sort), confirm IXSCAN and examined ≈ returned. If the filter is a leading-wildcard regex or <code>$ne</code>, rethink the query.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you auto-delete user sessions 1 hour after creation?</summary><div class="qa-body">TTL index: <code>createIndex({ created_at: 1 }, { expireAfterSeconds: 3600 })</code>. A background task removes expired docs about every 60 s, so deletion isn't instant. The field must be a date.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when the primary of a replica set dies?</summary><div class="qa-body">Secondaries notice missed heartbeats (~10 s), hold an election, and the most up-to-date eligible member becomes primary. Drivers retry writes. Writes acknowledged only with <code>w: 1</code> that hadn't replicated may be rolled back; <code>w: "majority"</code> writes survive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A user updates their profile and immediately sees the old version. Why?</summary><div class="qa-body">The read went to a secondary that hadn't replicated the write yet (replication lag). Fix: read from the primary for that flow, or use a causally consistent session with majority read and write concern.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>_id</code> (ObjectId) a bad ranged shard key? What would you pick for orders?</summary><div class="qa-body">ObjectIds increase over time, so every insert lands on the shard holding the highest range: a hot shard. For orders, <code>{ customer_id: 1, order_date: 1 }</code> spreads writes across customers and keeps "orders of customer X" on one shard; or a hashed <code>_id</code> if you only need even writes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need a multi-document transaction in MongoDB, and what does it cost?</summary><div class="qa-body">When one logical change touches several documents that must stay consistent, e.g. create an order and decrement stock. Cost: higher latency, cache pressure, 60 s default limit, write conflicts needing retries, and two-phase commit across shards. First ask whether embedding makes it one document.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team is on PostgreSQL and needs flexible product attributes. MongoDB or JSONB?</summary><div class="qa-body">JSONB. Attributes go in a <code>jsonb</code> column with a GIN index, while orders, joins, constraints and transactions stay relational, and you run one database. MongoDB pays off when documents are the main model or you need built-in write scale-out.</div></details>
</main>`
});
