// notes/databases/mongo_design.js — Schema Design, Indexes & Scaling
Object.assign(TOPIC_CONTENT, {
  "mongo_design": `<main>
  <h1>Schema Design, Indexes &amp; Scaling</h1>
  <p class="lead">In MongoDB, the shape of your documents decides your performance. This page covers how to model data, which indexes to build, and how replica sets and sharding keep it available and scalable.</p>

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
      <div class="rm-item rm-done" data-target="md-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 10 lines</span></div></div>
      <div class="rm-item rm-done" data-target="md-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
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
    <p>A recipe card lists its ingredients right on the card (embed). It doesn't copy the whole supermarket's price list; it just says "see aisle 4" (reference).</p>
  </div>
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
  <p>A <strong>replica set</strong> is a group of servers holding the same data: one <strong>primary</strong> takes all writes; <strong>secondaries</strong> copy its operation log (oplog) and can serve reads.</p>
  <div class="flow"><span>App writes</span><span>Primary</span><span>Oplog</span><span>Secondary 1, 2</span></div>
  <ul>
    <li><strong>Automatic failover</strong>: if the primary is unreachable for ~10 s, secondaries hold an election and one becomes primary. Drivers retry and reconnect.</li>
    <li>Use an <strong>odd number</strong> of voters (usually 3) so a majority can always be formed.</li>
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
  <div class="flow"><span>App</span><span>mongos router</span><span>config servers (key ranges)</span><span>Shard A / B / C</span></div>
  <ul>
    <li>Data is split into <strong>chunks</strong> (key ranges); a balancer moves chunks to even out shards.</li>
    <li>A query that includes the shard key is <strong>targeted</strong> to one shard. Without it, it's <strong>scatter-gather</strong>: sent to every shard.</li>
  </ul>
  <table class="tbl">
    <tr><th></th><th>Ranged key</th><th>Hashed key</th></tr>
    <tr><td>Placement</td><td>Nearby values on the same shard</td><td>Hash of the value spreads docs randomly</td></tr>
    <tr><td>Range queries</td><td>Efficient (one or few shards)</td><td>Scatter-gather</td></tr>
    <tr><td>Monotonic values</td><td>Hot shard</td><td>Evenly spread</td></tr>
  </table>
  <p>A good shard key has <strong>high cardinality</strong> (many distinct values), <strong>even frequency</strong> (no single value dominates), is <strong>not monotonic</strong>, and appears in most queries.</p>
  <div class="callout trap"><span class="label">Trap: monotonically increasing keys</span>
    <p>Sharding on <code>order_date</code> or an ObjectId: every new insert has the largest value, so all writes go to the one shard owning the top range. That shard is <strong>hot</strong>; the rest sit idle. Use a hashed key or a compound key like <code>{ customer_id: 1, order_date: 1 }</code>.</p>
  </div>
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

  <h2 id="md-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Accessed together → stored together.</strong> Model around queries.</li>
    <li>Embed 1:few and snapshots; reference 1:many read separately and 1:squillions. Never unbounded arrays (16 MB cap).</li>
    <li>Patterns: extended reference, subset, computed, bucket, outlier.</li>
    <li><code>$jsonSchema</code> validator enforces required fields, types and enums on write.</li>
    <li>Compound index field order: <strong>Equality, Sort, Range</strong>; queries use a prefix.</li>
    <li>Multikey = index on array; TTL auto-expires; unique enforces no duplicates.</li>
    <li><code>explain("executionStats")</code>: want IXSCAN, docs examined ≈ returned, no in-memory SORT.</li>
    <li>Replica set = primary + secondaries, auto failover; <code>w: "majority"</code> survives it; secondary reads can be stale.</li>
    <li>Shard key: high cardinality, even, non-monotonic, in queries; hashed for even writes, ranged for range queries.</li>
    <li>Multi-doc transactions work but cost; prefer single-document atomicity.</li>
  </ol></div>

  <h2 id="md-qa"><span class="num">11</span>Questions &amp; Answers</h2>
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
