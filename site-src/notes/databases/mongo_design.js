// notes/databases/mongo_design.js — Schema Design & Scaling
Object.assign(TOPIC_CONTENT, {
  "mongo_design": `<main>
  <h1>Schema Design &amp; Scaling</h1>
  <div class="where"><span>Databases</span><span>MongoDB</span><span>Schema Design &amp; Scaling</span></div>
  <p class="lead">The two previous notes used a shape we were handed: each Biteful order <em>embeds</em> its lines, and <em>references</em> its customer and restaurant by id. Was that right? This note answers the question every MongoDB design starts with, "embed or reference?", and follows it all the way out: the 16 MB limit, the rules of thumb, five design patterns, indexes and the ESR rule, schema validation, transactions, replica sets and sharding. Every concept is built on the same Biteful data (and a larger copy of the same shape when size matters). Everything ran for real: a private <strong>MongoDB 8.0.23</strong> server, a real 3-member replica set whose primary we killed, a real 2-shard cluster, and <strong>PostgreSQL 17</strong> for the JSONB comparison. All outputs are real.</p>

  <h2 id="md-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 160" width="660">
<defs><marker id="md-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="140" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="80" y="41" text-anchor="middle" font-size="12">Documents &amp; CRUD</text><text x="80" y="58" text-anchor="middle" class="tm" font-size="10">store, find, update</text>
<line x1="150" y1="45" x2="178" y2="45" stroke="currentColor" marker-end="url(#md-a0)"/>
<rect x="180" y="20" width="140" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="250" y="41" text-anchor="middle" font-size="12">Aggregation</text><text x="250" y="58" text-anchor="middle" class="tm" font-size="10">group, unwind, lookup</text>
<line x1="320" y1="45" x2="348" y2="45" stroke="currentColor" marker-end="url(#md-a0)"/>
<rect x="350" y="20" width="160" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="430" y="41" text-anchor="middle" font-size="12" font-weight="700">Schema Design</text><text x="430" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="510" y1="45" x2="538" y2="45" stroke="currentColor" marker-end="url(#md-a0)"/>
<rect x="540" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="595" y="41" text-anchor="middle" font-size="12">Production</text><text x="595" y="58" text-anchor="middle" class="tm" font-size="10">your own app</text>
<text x="20" y="106" class="tm" font-size="10.5">SQL side: Data Modeling (normalise), Indexes (B-trees, EXPLAIN), Transactions (ACID, replication, sharding).</text>
<text x="20" y="124" class="tm" font-size="10.5">This note: the same questions answered for documents, where the shape is chosen for the queries.</text>
</svg><figcaption>The last note of the MongoDB group. It closes the loop opened in Documents &amp; CRUD: "what should go inside a document?"</figcaption></figure>
  <ol class="story">
    <li><b>Came from: CRUD and pipelines on a given shape</b><span><a class="xref" data-note="mongo_basics">Documents &amp; CRUD</a> embedded order lines (one atomic write per order) but left orphans when a customer was deleted. <a class="xref" data-note="mongo_aggregation">Aggregation</a> needed <code>$unwind</code> for embedded lines and <code>$lookup</code> for referenced names, and showed that only an indexed first stage is fast. On the SQL side, <a class="xref" data-note="sql_modeling">Data Modeling</a> normalised Biteful, <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> built B-tree indexes, and <a class="xref" data-note="sql_transactions">Transactions</a> introduced ACID, replication and sharding.</span></li>
    <li><b>This note adds: choosing the shape, and keeping it fast and safe</b><span>Embed vs reference, the 16 MB limit, cardinality rules, five patterns (subset, extended reference, bucket, computed, outlier), indexes and the ESR rule traced with <code>explain()</code>, <code>$jsonSchema</code> validation, multi-document transactions, replica sets (failover measured) and sharding (shard-key traps measured), and when PostgreSQL's JSONB is enough.</span></li>
    <li><b>Leads to: real systems</b><span>With these tools you can design a document model from a list of queries, defend it in a system-design interview, and compare it honestly with the relational design from <a class="xref" data-note="db_types">Types of Databases</a>.</span></li>
  </ol>

  <h2 id="md-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it, and its limit raises the next question. All examples use Biteful.</p>
  <ol class="story">
    <li><b>Embed or reference?</b><span>Q: for each relationship (order → lines, order → customer), store the related data inside, or point at it by id? → embedded data comes in one read; referenced data needs a second query or a <code>$lookup</code>. When is each right?</span></li>
    <li><b>Embed (and the 16 MB limit)</b><span>Q: when should data live inside its parent? → when it is owned, read together, few and bounded (lines, addresses); single-document writes are atomic. But a document is capped at 16 MB: a customer holding every order would hit it at about 74,000 orders, and growing an array past 16 MB fails. So what goes outside?</span></li>
    <li><b>Reference</b><span>Q: when should data live in its own collection? → when it is shared (a restaurant has many orders), unbounded, or used on its own; many-to-many as arrays of ids. Nothing enforces a reference (an order for customer 99 was accepted). How do we decide quickly?</span></li>
    <li><b>Rules of thumb: 1-few, 1-many, 1-squillions</b><span>Q: is there a simple rule by cardinality? → few: embed; many: reference from the child or embed ids; squillions (GPS pings): the child points at the parent, never an array in the parent (100,000 ids already take 1.9 MB). Real apps then hit recurring problems…</span></li>
    <li><b>Design patterns</b><span>Q: "every order page does a <code>$lookup</code>", "the dashboard re-sums all orders", "the viral restaurant has thousands of reviews", "100,000 tiny pings" → extended reference, computed, subset, outlier, bucket (100,000 → 1,670 documents). Good shapes still need fast lookups…</span></li>
    <li><b>Indexes &amp; the ESR rule</b><span>Q: which index makes "restaurant 11's orders since March, biggest first" fast? → Equality, Sort, Range: traced by hand and with <code>explain()</code>: 11 keys instead of 13,784 + an in-memory sort. Fast is not correct; flexible schemas accept bad data…</span></li>
    <li><b>Schema validation</b><span>Q: how do we stop <code>status: "shipped"</code>, empty item lists and text dates? → a <code>$jsonSchema</code> validator rejects them; unknown fields still pass. Some changes span two documents (order + wallet)…</span></li>
    <li><b>Transactions</b><span>Q: how do we insert an order <em>and</em> debit a wallet all-or-nothing? → multi-document transactions; invisible until commit, aborted on error, write conflicts are retried. All of this runs on one server. What if it dies?</span></li>
    <li><b>Replica sets</b><span>Q: how do we survive a crash? → 3 copies, one primary; we killed the primary and writes resumed on a new one after ~10 s. But every write still goes to one machine…</span></li>
    <li><b>Sharding &amp; shard-key traps</b><span>Q: how do we split data and writes across machines? → shard by a key: a time key sent all 10,000 new orders to one shard, hashed and <code>customer_id</code> keys spread them 50/50, a 2-value city key can never use more than 2 shards. Finally: do you need MongoDB at all, or would Postgres JSONB do?</span></li>
  </ol>

  <h2 id="md-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Schema Design &amp; Scaling</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Embed vs reference</div>
        <ul>
          <li><b>Rule</b> — data read together is stored together, if small and bounded</li>
          <li><b>Embed</b> — lines in orders, addresses in customers; atomic</li>
          <li><b>Reference</b> — customer, restaurant: shared, independent</li>
          <li>⚠ <b>16 MB</b> — push #16 of 1 MB failed</li>
          <li>💡 tiffin box packs today's meal, labels the kitchen</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cardinality</div>
        <ul>
          <li><b>1 : few</b> → embed (addresses)</li>
          <li><b>1 : many</b> → child holds parent id (orders.customer_id)</li>
          <li><b>1 : squillions</b> → child holds parent id; never an array</li>
          <li><b>M : N</b> → array of ids (favourite restaurants)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Extended ref</b> — copy customer/restaurant name into orders</li>
          <li><b>Computed</b> — stored totals (amount, restaurant stats)</li>
          <li><b>Subset</b> — newest 3 reviews inside the restaurant</li>
          <li><b>Outlier</b> — cap + overflow flag for the viral one</li>
          <li><b>Bucket</b> — pings per rider per hour: 100,000 → 1,670 docs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Indexes</div>
        <ul>
          <li><b>ESR</b> — Equality, Sort, Range: 11 keys vs 13,784 + SORT</li>
          <li><b>Prefix rule</b> — leading fields only</li>
          <li><b>Covered</b> — docs examined 0</li>
          <li>⚠ <code>/dosa/i</code>, <code>$ne</code> read far more than they return</li>
          <li><b>Unique + partial</b>, <b>TTL</b> (real dates only)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Safety</div>
        <ul>
          <li><b>$jsonSchema</b> — enum, types, minItems; old docs not checked</li>
          <li>⚠ unknown fields pass (<code>stauts</code>)</li>
          <li><b>Transactions</b> — order + wallet; invisible until commit</li>
          <li><b>WriteConflict</b> = TransientTransactionError → retry</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scaling</div>
        <ul>
          <li><b>Replica set</b> — kill -9 primary → ~10 s → new primary</li>
          <li><b>3 members</b> — 1 of 3 left = no primary</li>
          <li><b>Sharding</b> — mongos routes by shard key</li>
          <li>⚠ time key → 0 / 10,000; city → max 2 chunks</li>
          <li><b>Good keys</b> — hashed _id, {customer_id, ordered_at}</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="md-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="md-question"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Embed or Reference?</span><span class="rm-sub">The first design question</span></div></div>
      <div class="rm-item rm-done" data-target="md-embed"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Embed</span><span class="rm-sub">When, and the 16 MB limit</span></div></div>
      <div class="rm-item rm-done" data-target="md-ref"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Reference</span><span class="rm-sub">Shared, unbounded, M:N</span></div></div>
      <div class="rm-item rm-done" data-target="md-card"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Rules of Thumb</span><span class="rm-sub">1-few, 1-many, 1-squillions</span></div></div>
      <div class="rm-item rm-done" data-target="md-pat"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Design Patterns</span><span class="rm-sub">Five shapes on Biteful</span></div></div>
      <div class="rm-item rm-done" data-target="md-idx"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Indexes &amp; ESR</span><span class="rm-sub">Traced with explain()</span></div></div>
      <div class="rm-item rm-done" data-target="md-valid"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Schema Validation</span><span class="rm-sub">$jsonSchema at the door</span></div></div>
      <div class="rm-item rm-done" data-target="md-txn"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Transactions</span><span class="rm-sub">Order + wallet, all or nothing</span></div></div>
      <div class="rm-item rm-done" data-target="md-repl"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Replica Sets</span><span class="rm-sub">We killed the primary</span></div></div>
      <div class="rm-item rm-done" data-target="md-shard"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Sharding</span><span class="rm-sub">Shard-key traps, measured</span></div></div>
      <div class="rm-item rm-done" data-target="md-pg"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">MongoDB vs JSONB</span><span class="rm-sub">Do you need Mongo at all?</span></div></div>
      <div class="rm-item rm-done" data-target="md-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">From one order to a cluster</span></div></div>
      <div class="rm-item rm-done" data-target="md-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Errors that show up later</span></div></div>
      <div class="rm-item rm-done" data-target="md-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="md-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="md-question"><span class="num">01</span>Embed or Reference?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In SQL, <a class="xref" data-note="sql_modeling">normalisation</a> gives one answer for every relationship: a separate table and a foreign key. Documents allow two answers, and Biteful's orders already use both: lines are <em>inside</em> the order, the customer is <em>pointed at</em>. Which relationships should be which, and why?</p>
  </div>
  <p>There are two ways to connect related data. <strong>Embed</strong>: put the related data inside the parent document (lines inside the order). <strong>Reference</strong>: keep it in its own collection and store its <code>_id</code> (the order stores <code>customer_id: 3</code>). Here is what each costs when the app shows order 108 with the customer's and restaurant's names:</p>
  <div class="fx" data-lang="js">db.orders.findOne({ _id: 108 }, { customer_id: 1, restaurant_id: 1, items: 1 })
db.customers.findOne({ _id: 3 }, { name: 1 })
db.restaurants.findOne({ _id: 10 }, { name: 1 })</div>
  <div class="fx" data-lang="text">{
  _id: 108,
  customer_id: 3,
  restaurant_id: 10,
  items: [
    { item: 'Masala Dosa', qty: 1, unit_price: 120 },
    {
      item: 'Filter Coffee',
      qty: 2,
      unit_price: 70,
      options: [ 'less sugar' ]
    }
  ]
}
{ _id: 3, name: 'Chen' }
{ _id: 10, name: 'Dosa Hut' }</div>
  <p>The lines (and the coffee's "less sugar" option) arrived with the order, in the first read. The names needed two more round trips, because Chen and Dosa Hut are referenced. (Or one <a class="xref" data-note="mongo_aggregation">$lookup</a>, which is the same lookups done by the server.)</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tiffin box packs today's meal inside it: roti, sabzi, dal. You open one box and eat (embed). But the box does not contain the restaurant's kitchen or every meal you ever ate; it has a label saying which kitchen it came from (reference). Pack what you eat together; point to what is big, shared, or keeps growing.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 620 170" width="620">
    <defs><marker id="md-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="20" width="210" height="130" rx="6" class="fb sb"/>
    <text x="10" y="40" font-weight="bold">order 108</text><text x="10" y="58" font-size="11">customer_id: 3, restaurant_id: 10</text>
    <rect x="10" y="70" width="190" height="70" rx="4" class="ft st"/>
    <text x="20" y="88" font-size="11">items (embedded)</text><text x="20" y="106" font-size="11" class="tm">Masala Dosa · 1 · 120</text><text x="20" y="124" font-size="11" class="tm">Filter Coffee · 2 · 70 · less sugar</text>
    <text x="105" y="166" text-anchor="middle" font-size="10" class="tg">owned, few, read together</text>
    <rect x="280" y="10" width="140" height="44" rx="6" class="fv sb"/><text x="350" y="30" text-anchor="middle" font-weight="bold">customer 3</text><text x="350" y="46" text-anchor="middle" font-size="11" class="tm">Chen, Pune</text>
    <rect x="280" y="96" width="140" height="44" rx="6" class="fv sb"/><text x="350" y="116" text-anchor="middle" font-weight="bold">restaurant 10</text><text x="350" y="132" text-anchor="middle" font-size="11" class="tm">Dosa Hut</text>
    <path d="M150,55 C200,55 230,32 278,32" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#md-ar)"/>
    <path d="M190,55 C230,70 240,118 278,118" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#md-ar)"/>
    <text x="455" y="30" font-size="10" class="tm">shared by many orders,</text><text x="455" y="44" font-size="10" class="tm">changes on its own,</text><text x="455" y="58" font-size="10" class="tm">read on its own pages</text>
    <text x="455" y="110" font-size="10" class="tm">→ reference by _id</text>
  </svg><figcaption>Biteful's current shape: lines embedded, customer and restaurant referenced.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Embed</th><th>Reference</th></tr>
    <tr><td>Read the whole thing</td><td>1 read</td><td>1 read + 1 per referenced document (or <code>$lookup</code>)</td></tr>
    <tr><td>Write parent + child together</td><td>atomic (one document)</td><td>two documents: transaction if they must agree</td></tr>
    <tr><td>Child shared by many parents</td><td>copied into each (duplicates)</td><td>stored once</td></tr>
    <tr><td>Child grows without limit</td><td>document grows toward 16 MB</td><td>no problem</td></tr>
    <tr><td>Query children on their own</td><td><code>$unwind</code> needed</td><td>direct</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Embedding</strong>: storing related data inside the parent document. <strong>Referencing</strong>: storing the related document's <code>_id</code>, like a foreign key that nothing enforces. The guiding rule: <strong>data that is accessed together should be stored together</strong>, as long as it stays small and bounded.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the two opposite mistakes</span>
    <p>"Documents can nest, so nest everything" (all orders inside the customer) breaks as data grows. "Design it like SQL" (one collection per table, <code>$lookup</code> everywhere) brings back joins that MongoDB is not built around. Decide per relationship, from the queries.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: embed.</b> We know the two options and their costs. When exactly is embedding the right call, and how big can an embedded list get before the document itself becomes the problem?</div>

  <h2 id="md-embed"><span class="num">02</span>Embed: When, and the 16 MB Limit</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Embedding lines in orders made the order page one read and the "add a vada" update atomic. Why not go one step further and embed each customer's orders inside the customer document, so "Asha's order history" is one read too?</p>
  </div>
  <p>Embed when the child is <strong>owned</strong> by the parent (a line has no life outside its order), <strong>read together</strong> with it, and <strong>few and bounded</strong> (an order has a handful of lines). A customer's two addresses fit perfectly:</p>
  <div class="fx" data-lang="js">db.customers.updateOne({ _id: 1 }, { $set: { addresses: [
  { label: "home",   line: "12 FC Road",       city: "Pune" },
  { label: "office", line: "4th floor, Baner", city: "Pune" } ] } })
db.customers.findOne({ _id: 1 }, { name: 1, addresses: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{
  _id: 1,
  name: 'Asha',
  addresses: [
    { label: 'home', line: '12 FC Road', city: 'Pune' },
    { label: 'office', line: '4th floor, Baner', city: 'Pune' }
  ]
}</div>
  <p>Now the size question. <code>bsonsize</code> gives a document's stored size, and <code>$bsonSize</code> does the same inside a pipeline:</p>
  <div class="fx" data-lang="js">const o = db.orders.findOne({ _id: 102 })
bsonsize(o)
const avg = db.orders.aggregate([ { $group: { _id: null, avg: { $avg: { $bsonSize: "$$ROOT" } } } } ]).toArray()[0].avg
avg
Math.floor(16 * 1024 * 1024 / avg)</div>
  <div class="fx" data-lang="text">246
226.5
74071</div>
  <p>Order 102 takes 246 bytes; Biteful's orders average 226.5 bytes. A document is capped at 16 MB (16,777,216 bytes), so a customer document holding every order could reach about <strong>74,071 orders</strong> before writes fail. Long before that, every new order rewrites an ever larger document and every "show my profile" drags the whole history along. What happens at the wall itself? This grows one document by 1 MB at a time (each 1 MB string stands in for about 4,600 orders):</p>
  <div class="fx" data-lang="js">db.scratch.insertOne({ _id: "asha_all_orders", orders: [] })
const oneMB = "x".repeat(1024 * 1024)               // stand-in for ~4,600 orders of 226 bytes
for (let i = 1; i &lt;= 20; i++) {
  try { db.scratch.updateOne({ _id: "asha_all_orders" }, { $push: { orders: oneMB } }) }
  catch (e) { print("push", i, "failed:", e.name, e.code, e.message.slice(0, 60)); break }
}
(bsonsize(db.scratch.findOne()) / (1024 * 1024)).toFixed(2)
db.scratch.drop()</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: 'asha_all_orders' }
push 16 failed: MongoServerError 10334 Resulting document after update is larger than 16777216
15.00
true</div>
  <p>15 pushes succeeded (15.00 MB); push 16 was refused by the server with error 10334 because the result would exceed 16,777,216 bytes. In an app this is a production outage for that one customer, with no way to add another order to the document.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wallet holds today's cash and a couple of cards (embed). It does not hold every receipt you were ever given: it would stop closing, and finding today's bus pass would mean emptying it each time.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Embed when</strong>: owned by the parent, read together, bounded in number, and (if copied from elsewhere) meant as a snapshot. <strong>Document size limit</strong>: 16 MB of BSON. <strong>bsonsize(doc)</strong> / <strong>$bsonSize</strong>: the stored size in bytes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unbounded arrays</span>
    <p>Never embed an array that grows without limit (all orders of a customer, all pings of a rider, all comments of a post). The 16 MB cap is the hard failure; the soft failures come first: slower writes as the document grows, and large multikey index entries. Interviews ask "would you embed a user's posts in the user?": no, for exactly this reason.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: reference.</b> Orders cannot live inside customers. They need their own collection and a pointer. When is a reference the right call, which side holds it, and what does MongoDB (not) do to keep references valid?</div>

  <h2 id="md-ref"><span class="num">03</span>Reference: When</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A restaurant has thousands of orders; a customer has an unbounded history; "Chen's favourite restaurants" links many customers to many restaurants. Embedding fails for all three. How do references model them, and what guards them?</p>
  </div>
  <p>Reference when the related data is <strong>shared</strong> (Dosa Hut appears in many orders), <strong>unbounded</strong> (orders per customer), <strong>changes on its own</strong> (a restaurant's rating), or is <strong>queried on its own</strong> (the restaurant page). The reference usually sits on the "many" side: each order holds <code>customer_id</code>, rather than the customer holding a list of order ids. Many-to-many relationships use an array of ids on one side, and self-references work too (<code>referred_by</code>):</p>
  <div class="fx" data-lang="js">db.customers.updateOne({ _id: 3 }, { $set: { favourite_restaurants: [10, 12] } })
const chen = db.customers.findOne({ _id: 3 })
db.restaurants.find({ _id: { $in: chen.favourite_restaurants } }, { name: 1 })
db.customers.find({ referred_by: 1 }, { name: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
[ { _id: 10, name: 'Dosa Hut' }, { _id: 12, name: 'Pizza Point' } ]
[ { _id: 2, name: 'Ben' }, { _id: 3, name: 'Chen' } ]</div>
  <p>Chen's favourites are two ids; resolving them took a second query with <code>$in</code>. Asha's referrals are found by querying the self-reference. These are "application-level joins": your code does what a SQL join would.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library card catalogue: each card says "see shelf 10" instead of containing the book. Many cards can point at the same shelf. But nothing stops a card from pointing at a shelf that was removed.</p>
  </div>
  <p>That last point, tested: an order for customer 99, who does not exist.</p>
  <div class="fx" data-lang="js">db.orders.insertOne({ _id: 112, customer_id: 99, restaurant_id: 10, status: "pending", amount: 120,
                      items: [ { item: "Masala Dosa", qty: 1, unit_price: 120 } ] })
db.orders.aggregate([
  { $lookup: { from: "customers", localField: "customer_id", foreignField: "_id", as: "c" } },
  { $match: { c: { $size: 0 } } },
  { $project: { customer_id: 1 } }
])
db.orders.deleteOne({ _id: 112 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: 112 }
[ { _id: 112, customer_id: 99 } ]
{ acknowledged: true, deletedCount: 1 }</div>
  <p>The insert was accepted. The <code>$lookup</code> + <code>$size: 0</code> pipeline is the standard orphan finder: it found order 112. PostgreSQL's foreign key would have refused the insert (as it refused deleting Asha in <a class="xref" data-note="mongo_basics">Documents &amp; CRUD</a>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reference when</strong>: shared, unbounded, independently updated, or independently queried. <strong>Child-side reference</strong>: the child stores the parent's id (orders.customer_id). <strong>Many-to-many</strong>: an array of ids on one or both sides. <strong>Referential integrity</strong>: not enforced by MongoDB; your code (or a periodic orphan check) must keep references valid.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: references without indexes, and growing id arrays</span>
    <p>Every reference is a lookup; index the field you look up by (<code>orders.customer_id</code>), or each <code>$lookup</code> scans a collection. And an array of ids on the "one" side grows like any other array: "customer.order_ids" has the same 16 MB problem as embedded orders, only slower to arrive.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: rules of thumb.</b> We now have reasons for both choices. A designer facing ten relationships needs a faster rule: does the answer simply depend on how many children one parent can have?</div>

  <h2 id="md-card"><span class="num">04</span>Rules of Thumb: 1-Few, 1-Many, 1-Squillions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Addresses per customer (2), orders per customer (hundreds over years), GPS pings per delivery rider (one per few seconds, forever). Same "one-to-many" in SQL, but surely not the same document design?</p>
  </div>
  <p>The single most useful input is <strong>cardinality</strong>: how many children one parent can have, and whether that number is bounded.</p>
  <table class="tbl">
    <tr><th>Cardinality</th><th>Biteful example</th><th>Design</th><th>Why</th></tr>
    <tr><td><strong>1 : few</strong> (bounded, small)</td><td>customer → addresses; order → lines</td><td>embed an array of sub-documents</td><td>one read, atomic, tiny</td></tr>
    <tr><td><strong>1 : many</strong> (hundreds to thousands)</td><td>customer → orders; restaurant → menu items</td><td>child holds the parent's id (or parent holds an array of child ids, if bounded)</td><td>children are read alone and grow</td></tr>
    <tr><td><strong>1 : squillions</strong> (unbounded)</td><td>rider → GPS pings; order → tracking events</td><td>child holds the parent's id; <strong>never</strong> an array in the parent</td><td>even ids alone would hit 16 MB</td></tr>
    <tr><td><strong>M : N</strong></td><td>customers ↔ favourite restaurants</td><td>array of ids on the side you query from</td><td>bounded per customer</td></tr>
  </table>
  <p>"Even the ids would hit 16 MB" is easy to check: how big is an array of 100,000 ObjectIds?</p>
  <div class="fx" data-lang="js">bsonsize({ order_ids: Array.from({ length: 100000 }, () =&gt; new ObjectId()) })
Math.floor(16 * 1024 * 1024 / (bsonsize({ order_ids: Array.from({ length: 100000 }, () =&gt; new ObjectId()) }) / 100000))</div>
  <div class="fx" data-lang="text">1888911
888195</div>
  <p>100,000 ids take 1,888,911 bytes, about 18.9 bytes each (12 bytes of id plus the array index stored as a key and a type byte). So an array of ids in the parent tops out near <strong>888,000</strong> children. A busy rider sending a ping every 5 seconds makes that many in about 7 weeks.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A family photo album keeps the few wedding photos inside (1-few). A school keeps one register per class and each student's card names the class (1-many). A CCTV camera never keeps its frames inside the camera's record; each frame is stamped with the camera's number (1-squillions).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cardinality</strong>: how many children one parent can have. <strong>"Squillions"</strong>: an informal word for unbounded, ever-growing children. Ask two questions per relationship: how many, at most? and do I read the children with the parent, or on their own?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "many" today, "squillions" next year</span>
    <p>Estimate growth over the data's lifetime, not today's numbers. Biteful's first restaurant had 20 reviews; the viral one has thousands. When most parents are small and a few are huge, the outlier pattern (next section) handles both.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: design patterns.</b> The rules give a sound first shape. Then real usage complains: "every order page needs the customer's name", "the dashboard re-sums all orders on every refresh", "one restaurant has 50,000 reviews", "100,000 tiny ping documents make the index bigger than RAM". Each complaint has a well-known fix.</div>

  <h2 id="md-pat"><span class="num">05</span>Design Patterns on Biteful</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The order page does two extra reads for names; the owner's dashboard re-runs a pipeline over every order on every refresh; Dosa Hut's page shows the newest reviews but there are hundreds; one restaurant went viral; rider pings are 100,000 tiny documents. Embed/reference alone answers none of these well.</p>
  </div>
  <table class="tbl">
    <tr><th>Pattern</th><th>Problem it fixes</th><th>Idea</th><th>Biteful example</th></tr>
    <tr><td><strong>Extended reference</strong></td><td><code>$lookup</code> on every read</td><td>copy the few fields you always show from the referenced document</td><td><code>customer: { _id: 2, name: "Ben" }</code> in each order</td></tr>
    <tr><td><strong>Computed</strong></td><td>recomputing the same totals on every read</td><td>store the result, update it on write</td><td><code>amount</code>; <code>restaurants.stats</code></td></tr>
    <tr><td><strong>Subset</strong></td><td>a big related list, of which a small part is shown</td><td>embed only the most-used part; all in its own collection</td><td>newest 3 reviews inside the restaurant</td></tr>
    <tr><td><strong>Outlier</strong></td><td>a few parents are far bigger than the rest</td><td>design for the typical case; flag and overflow the rare huge one</td><td>review cap + <code>has_overflow</code></td></tr>
    <tr><td><strong>Bucket</strong></td><td>millions of tiny time-stamped records</td><td>group them into one document per entity per time window</td><td>pings per rider per hour</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A delivery slip copies the customer's name and phone so the rider never looks them up (extended reference). The bill has its total pre-written (computed). The restaurant's front window shows its three latest reviews, not all of them (subset). The milkman keeps one page per house per month with 30 ticks, not one page per bottle (bucket).</p>
  </div>
  <h3>Extended reference: names inside the order</h3>
  <p>A pipeline ending in <code>$merge</code> writes its results back into a collection. Here it copies each order's customer name and restaurant name into the order (<code>whenMatched: "merge"</code> adds the fields, <code>"discard"</code> creates nothing new). The <code>$merge</code> itself prints nothing.</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $lookup: { from: "customers",   localField: "customer_id",   foreignField: "_id", as: "c" } },
  { $lookup: { from: "restaurants", localField: "restaurant_id", foreignField: "_id", as: "r" } },
  { $project: { customer:   { _id: "$customer_id",   name: { $first: "$c.name" } },
                restaurant: { _id: "$restaurant_id", name: { $first: "$r.name" } } } },
  { $merge: { into: "orders", on: "_id", whenMatched: "merge", whenNotMatched: "discard" } }
])
db.orders.findOne({ _id: 102 }, { customer: 1, restaurant: 1, amount: 1 })
db.customers.updateOne({ _id: 1 }, { $set: { name: "Asha K" } })
db.orders.updateMany({ "customer._id": 1 }, { $set: { "customer.name": "Asha K" } })</div>
  <div class="fx" data-lang="text">{
  _id: 102,
  amount: 450,
  customer: { _id: 2, name: 'Ben' },
  restaurant: { _id: 11, name: 'Biryani Bros' }
}
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 3, modifiedCount: 3, upsertedCount: 0 }</div>
  <p>Order 102 now carries <code>Ben</code> and <code>Biryani Bros</code>: the order page is one read, no <code>$lookup</code>. The last two lines are the price: when Asha changes her name, her customer document <em>and</em> every order holding the copy must be updated (3 here, thousands in production). That is fine for a name that rarely changes, and arguably correct for orders (the name at the time of the order is a snapshot).</p>
  <h3>Computed: stored totals</h3>
  <p><code>amount</code> is already the computed pattern: the bill total is stored, so nobody re-sums lines. The same idea for the owner's dashboard: store each restaurant's delivered orders and revenue, built once with <code>$merge</code>, then maintained with <code>$inc</code> as orders are delivered.</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$restaurant_id", orders: { $sum: 1 }, revenue: { $sum: "$amount" } } },
  { $project: { stats: { orders: "$orders", revenue: "$revenue" } } },
  { $merge: { into: "restaurants", on: "_id", whenMatched: "merge", whenNotMatched: "discard" } }
])
db.orders.updateOne({ _id: 110, status: "pending" }, { $set: { status: "delivered", delivery_minutes: 35 } })
db.restaurants.updateOne({ _id: 10 }, { $inc: { "stats.orders": 1, "stats.revenue": 310 } })
db.restaurants.find({}, { name: 1, stats: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
[
  { _id: 10, name: 'Dosa Hut', stats: { orders: 3, revenue: 810 } },
  {
    _id: 11,
    name: 'Biryani Bros',
    stats: { orders: 3, revenue: 1230 }
  },
  { _id: 12, name: 'Pizza Point', stats: { orders: 2, revenue: 900 } },
  { _id: 13, name: 'Green Bowl' },
  { _id: 14, name: 'Momo Magic' }
]</div>
  <p>The dashboard now reads 5 small documents. When order 110 was delivered, Dosa Hut's stats went from 2 orders / ₹500 to 3 / ₹810. Green Bowl and Momo Magic have no delivered orders, so they got no stats. Notice the update touched <em>two</em> documents (the order and the restaurant): if the server crashed between them, the stats would drift. Section 08 fixes that with a transaction.</p>
  <h3>Subset: the newest 3 reviews inside the restaurant</h3>
  <div class="fx" data-lang="js">const newReviews = [
  { restaurant_id: 10, by: "Asha",  stars: 5, at: ISODate("2026-03-02"), text: "Crisp dosa" },
  { restaurant_id: 10, by: "Chen",  stars: 4, at: ISODate("2026-03-05"), text: "Coffee too sweet" },
  { restaurant_id: 10, by: "Ben",   stars: 5, at: ISODate("2026-03-06"), text: "Fast delivery" },
  { restaurant_id: 10, by: "Farah", stars: 3, at: ISODate("2026-03-07"), text: "Chutney missing" },
  { restaurant_id: 10, by: "Asha",  stars: 5, at: ISODate("2026-03-09"), text: "Best in Pune" } ]
for (const r of newReviews) {
  db.reviews.insertOne(r)                                          // full history
  db.restaurants.updateOne({ _id: 10 }, { $push: { recent_reviews: {  // newest 3 only
      $each: [ { by: r.by, stars: r.stars, at: r.at } ], $sort: { at: -1 }, $slice: 3 } } })
}
db.reviews.countDocuments({ restaurant_id: 10 })
db.restaurants.findOne({ _id: 10 }, { name: 1, recent_reviews: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
5
{
  _id: 10,
  name: 'Dosa Hut',
  recent_reviews: [
    { by: 'Asha', stars: 5, at: ISODate('2026-03-09T00:00:00.000Z') },
    { by: 'Farah', stars: 3, at: ISODate('2026-03-07T00:00:00.000Z') },
    { by: 'Ben', stars: 5, at: ISODate('2026-03-06T00:00:00.000Z') }
  ]
}</div>
  <p>(The loop prints the result of its last update.) All 5 reviews are in <code>reviews</code> (the full history). The restaurant document keeps only the newest 3, maintained by one <code>$push</code> with three modifiers: <code>$each</code> adds the review, <code>$sort: { at: -1 }</code> orders newest first, <code>$slice: 3</code> trims the array. The restaurant page shows its latest reviews from one read; "see all reviews" queries the <code>reviews</code> collection.</p>
  <h3>Outlier: cap, then overflow</h3>
  <p>Most restaurants get few reviews, so embedding them all is fine, except for the rare viral one. The trick: the filter <code>"reviews.2": { $exists: false }</code> matches only while the array has fewer than 3 elements (index 2 is the third). When it no longer matches, the review goes to an overflow collection and the restaurant is flagged.</p>
  <div class="fx" data-lang="js">const CAP = 3                                    // tiny cap for the demo; think 200 in real life
function addReview(rid, review) {
  const res = db.restaurants.updateOne(
    { _id: rid, ["reviews." + (CAP - 1)]: { $exists: false } },   // fewer than CAP embedded?
    { $push: { reviews: review } })
  if (res.matchedCount === 0) {                  // full: overflow
    db.review_overflow.insertOne({ restaurant_id: rid, ...review })
    db.restaurants.updateOne({ _id: rid }, { $set: { has_overflow: true } })
    return "overflow"
  }
  return "embedded"
}
["A", "B", "C", "D", "E"].map(who =&gt; addReview(13, { by: who, stars: 4 }))
addReview(14, { by: "Gita", stars: 5 })
db.restaurants.find({ _id: { $in: [13, 14] } }, { name: 1, reviews: 1, has_overflow: 1 })
db.review_overflow.countDocuments({ restaurant_id: 13 })</div>
  <div class="fx" data-lang="text">[Function: addReview]
[ 'embedded', 'embedded', 'embedded', 'overflow', 'overflow' ]
embedded
[
  {
    _id: 13,
    name: 'Green Bowl',
    reviews: [
      { by: 'A', stars: 4 },
      { by: 'B', stars: 4 },
      { by: 'C', stars: 4 }
    ],
    has_overflow: true
  },
  {
    _id: 14,
    name: 'Momo Magic',
    reviews: [ { by: 'Gita', stars: 5 } ]
  }
]
2</div>
  <p>Green Bowl took 3 embedded reviews, then reviews D and E went to <code>review_overflow</code> and <code>has_overflow: true</code> was set. Momo Magic's single review stayed embedded. Code that reads reviews checks the flag and fetches the overflow only for the rare outlier.</p>
  <h3>Bucket: rider pings, measured</h3>
  <p>The same idea at scale: 100,000 GPS pings (10 riders, one per minute) stored as one document per ping, and bucketed into one document per rider per hour with an aggregation ending in <code>$out</code>.</p>
  <div class="fx" data-lang="js">function makePings() {                       // 10 riders, one GPS ping per minute each
  const t0 = Date.UTC(2026, 2, 2, 6, 0), rows = []
  for (let m = 0; m &lt; 100000; m++)
    rows.push({ rider: m % 10, ts: new Date(t0 + Math.floor(m / 10) * 60000),
                lat: 18.52 + (m % 97) / 10000, lng: 73.85 + (m % 89) / 10000 })
  return rows
}
db.pings.insertMany(makePings()).acknowledged
db.pings.createIndex({ rider: 1, ts: 1 })
db.pings.aggregate([
  { $group: { _id: { rider: "$rider", hour: { $dateTrunc: { date: "$ts", unit: "hour" } } },
              n: { $sum: 1 }, points: { $push: { ts: "$ts", lat: "$lat", lng: "$lng" } } } },
  { $project: { _id: 0, rider: "$_id.rider", hour: "$_id.hour", n: 1, points: 1 } },
  { $out: "pings_hourly" } ])
db.pings_hourly.createIndex({ rider: 1, hour: 1 })
function sizes(c) { const s = c.stats(); return { docs: s.count, dataKB: Math.round(s.size / 1024), indexKB: Math.round(s.totalIndexSize / 1024) } }
sizes(db.pings)
sizes(db.pings_hourly)
db.pings_hourly.findOne({ rider: 3 }, { _id: 0, rider: 1, hour: 1, n: 1, first_point: { $first: "$points" } })</div>
  <div class="fx" data-lang="text">[Function: makePings]
true
rider_1_ts_1
rider_1_hour_1
[Function: sizes]
{ docs: 100000, dataKB: 6934, indexKB: 3776 }
{ docs: 1670, dataKB: 4683, indexKB: 84 }
{
  n: 60,
  rider: 3,
  hour: ISODate('2026-03-02T06:00:00.000Z'),
  first_point: {
    ts: ISODate('2026-03-02T06:00:00.000Z'),
    lat: 18.5203,
    lng: 73.85029999999999
  }
}</div>
  <p>Same information, <strong>60× fewer documents</strong> (100,000 → 1,670), 32% less data (field names are stored once per bucket instead of once per ping), and the indexes shrank from 3,776 KB to 84 KB. Indexes must fit in RAM to be fast, so this is often the difference between a fast and a slow system. MongoDB's <strong>time-series collections</strong> (5.0+) do this bucketing automatically.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Denormalisation</strong>: deliberately storing data in more than one place (or pre-computed) to make reads cheaper. Extended reference and computed trade write work and possible staleness for read speed; subset and outlier keep documents small; bucket reduces document and index count.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: copying data that changes often</span>
    <p>Copy only stable fields (names, prices at purchase). Copying fast-changing data (stock levels, ratings, follower counts) means huge <code>updateMany</code> calls on every change and copies that drift out of sync. And every computed value maintained by two separate writes can drift unless the writes are atomic.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: indexes and the ESR rule.</b> The documents now have good shapes. But "restaurant 11's orders since March, biggest first" still reads every order unless an index exists, and a compound index in the wrong field order can read thousands of entries for 10 results.</div>

  <h2 id="md-idx"><span class="num">06</span>Indexes &amp; the ESR Rule, Traced with explain()</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The restaurant app shows "your orders since 3 March, biggest first, top 2". Without an index the server reads every order and sorts them. We know from <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> that a composite index helps, but in which <em>order</em> should its three fields go?</p>
  </div>
  <p>An <strong>index</strong> is a sorted structure (a B-tree) of one or more fields' values, each entry pointing at its document. A <strong>compound index</strong> sorts by its first field, then by the second within equal firsts, and so on, like a phone directory sorted by (city, surname, first name). The query has three kinds of condition: <strong>E</strong>quality (<code>restaurant_id: 11</code>), <strong>S</strong>ort (<code>amount</code> descending) and <strong>R</strong>ange (<code>ordered_at ≥ 3 March</code>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A directory sorted by (city, surname, first name). "Pune, Kulkarni, in first-name order" is a quick flip: open at Pune, then Kulkarni, read down. "Everyone named Asha in any city" cannot use the book: first names are only sorted <em>within</em> each city and surname. That is the <strong>prefix rule</strong>.</p>
  </div>
  <h3>ESR by hand, on Biteful's 10 orders</h3>
  <p>Biryani Bros (11) has three orders: 102 (₹450, 2 March), 106 (₹180, 4 March), 109 (₹600, 5 March). The query wants those since 3 March, biggest first, top 2: answer 109, then 106. Walk the two candidate indexes:</p>
  <table class="tbl">
    <tr><th>Index order</th><th>Entries for restaurant 11, in index order</th><th>What the server does</th><th>Keys read</th><th>In-memory sort?</th></tr>
    <tr><td>E, R, S: <code>{ restaurant_id, ordered_at, amount }</code></td><td>(11, Mar 2, 450), (11, Mar 4, 180), (11, Mar 5, 600)</td><td>jump to (11, Mar 3), read 106 and 109; they come out in date order, so sort them by amount</td><td>2</td><td><strong>yes</strong></td></tr>
    <tr><td>E, S, R: <code>{ restaurant_id, amount: -1, ordered_at }</code></td><td>(11, 600, Mar 5), (11, 450, Mar 2), (11, 180, Mar 4)</td><td>walk in amount order: 600 ✓, 450 ✗ (Mar 2, skip), 180 ✓; 2 found, stop</td><td>3</td><td><strong>no</strong></td></tr>
  </table>
  <p>The real <code>explain("executionStats")</code> on the same 10 orders, using a small helper that prints the plan's stages and counts:</p>
  <div class="fx" data-lang="js">function summary(e) {                 // stages of the winning plan + work done
  const s = e.executionStats, stages = []
  let p = e.queryPlanner.winningPlan
  for (p = p.queryPlan || p; p; p = p.inputStage) stages.push(p.stage)
  return { stages: stages.join(" &lt;- "), keys: s.totalKeysExamined, docs: s.totalDocsExamined, returned: s.nReturned }
}
const q = { restaurant_id: 11, ordered_at: { $gte: ISODate("2026-03-03T00:00:00+05:30") } }
db.orders.find(q, { amount: 1 }).sort({ amount: -1 }).limit(2)
db.orders.createIndex({ restaurant_id: 1, ordered_at: 1, amount: -1 })     // E, R, S
summary(db.orders.find(q).sort({ amount: -1 }).limit(2).explain("executionStats"))
db.orders.dropIndex("restaurant_id_1_ordered_at_1_amount_-1").ok
db.orders.createIndex({ restaurant_id: 1, amount: -1, ordered_at: 1 })     // E, S, R
summary(db.orders.find(q).sort({ amount: -1 }).limit(2).explain("executionStats"))</div>
  <div class="fx" data-lang="text">[Function: summary]
[ { _id: 109, amount: 600 }, { _id: 106, amount: 180 } ]
restaurant_id_1_ordered_at_1_amount_-1
{ stages: 'FETCH &lt;- SORT &lt;- IXSCAN', keys: 2, docs: 2, returned: 2 }
1
restaurant_id_1_amount_-1_ordered_at_1
{ stages: 'LIMIT &lt;- FETCH &lt;- IXSCAN', keys: 3, docs: 2, returned: 2 }</div>
  <p>Exactly the hand trace: E-R-S read 2 keys but needed a <code>SORT</code> stage; E-S-R read 3 keys and no sort (<code>LIMIT &lt;- FETCH &lt;- IXSCAN</code>). On 10 orders E-R-S even looks cheaper. Now the same query on the 200,000-order copy (<code>biteful_big</code> from <a class="xref" data-note="mongo_aggregation">Aggregation</a>), top 10:</p>
  <p>(The <code>summary</code> helper from above is loaded first; its echo line is omitted.)</p>
  <div class="fx" data-lang="js">use biteful_big
db.orders.dropIndexes().ok
const q = { restaurant_id: 11, ordered_at: { $gte: ISODate("2026-03-01") } }
db.orders.countDocuments(q)
summary(db.orders.find(q).sort({ amount: -1 }).limit(10).explain("executionStats"))
db.orders.createIndex({ restaurant_id: 1, ordered_at: 1, amount: -1 })     // E, R, S
summary(db.orders.find(q).sort({ amount: -1 }).limit(10).explain("executionStats"))
db.orders.dropIndexes().ok
db.orders.createIndex({ restaurant_id: 1, amount: -1, ordered_at: 1 })     // E, S, R
summary(db.orders.find(q).sort({ amount: -1 }).limit(10).explain("executionStats"))</div>
  <div class="fx" data-lang="text">switched to db biteful_big
1
13784
{ stages: 'SORT &lt;- COLLSCAN', keys: 0, docs: 200000, returned: 10 }
restaurant_id_1_ordered_at_1_amount_-1
{ stages: 'FETCH &lt;- SORT &lt;- IXSCAN', keys: 13784, docs: 10, returned: 10 }
1
restaurant_id_1_amount_-1_ordered_at_1
{ stages: 'LIMIT &lt;- FETCH &lt;- IXSCAN', keys: 11, docs: 10, returned: 10 }</div>
  <table class="tbl out"><caption>Reading the three runs (13,784 orders match; we want 10)</caption>
    <tr><th>Index</th><th>What the server did</th><th>Keys read</th><th>Docs read</th></tr>
    <tr><td>none</td><td>read all 200,000 orders, sorted in memory</td><td>0</td><td>200,000</td></tr>
    <tr><td>E, R, S</td><td>found all 13,784 matching entries, sorted them in memory to pick 10</td><td>13,784</td><td>10</td></tr>
    <tr><td><strong>E, S, R</strong></td><td>walked restaurant 11's entries already in amount order, skipped dates before March, stopped after 10</td><td><strong>11</strong></td><td>10</td></tr>
  </table>
  <h3>Prefix, covered, regex, $ne</h3>
  <p>Same 200,000 orders, with the E-S-R index <code>{ restaurant_id, amount, ordered_at }</code> in place:</p>
  <div class="fx" data-lang="js">use biteful_big
summary(db.orders.find({ amount: 520 }).explain("executionStats"))
summary(db.orders.find({ restaurant_id: 11, amount: 520 }).explain("executionStats"))
summary(db.orders.find({ restaurant_id: 11, amount: { $gte: 1000 } },
                       { _id: 0, restaurant_id: 1, amount: 1 }).explain("executionStats"))
db.orders.createIndex({ "items.item": 1 })
summary(db.orders.find({ "items.item": /^Mas/ }).explain("executionStats"))
summary(db.orders.find({ "items.item": /dosa/i }).explain("executionStats"))
db.orders.createIndex({ status: 1 })
summary(db.orders.find({ status: { $ne: "delivered" } }).explain("executionStats"))</div>
  <div class="fx" data-lang="text">switched to db biteful_big
{ stages: 'COLLSCAN', keys: 0, docs: 200000, returned: 33333 }
{ stages: 'FETCH &lt;- IXSCAN', keys: 6666, docs: 6666, returned: 6666 }
{ stages: 'PROJECTION_COVERED &lt;- IXSCAN', keys: 6667, docs: 0, returned: 6667 }
items.item_1
{ stages: 'FETCH &lt;- IXSCAN', keys: 33335, docs: 33334, returned: 33334 }
{ stages: 'FETCH &lt;- IXSCAN', keys: 200000, docs: 200000, returned: 33334 }
status_1
{ stages: 'FETCH &lt;- IXSCAN', keys: 40001, docs: 40000, returned: 40000 }</div>
  <p>(1) <code>amount</code> alone is not a prefix of the index: <code>COLLSCAN</code> of 200,000. (2) Adding the leading <code>restaurant_id</code> makes it a prefix: 6,666 keys for 6,666 results. (3) Filter and projection use only indexed fields (and <code>_id: 0</code>): <code>PROJECTION_COVERED</code>, <strong>0 documents read</strong>, answered from the index alone. (4) A multikey index on <code>items.item</code> with an anchored regex <code>/^Mas/</code> reads a tight range. (5) An unanchored, case-insensitive <code>/dosa/i</code> walked 200,000 keys to return 33,334. (6) <code>$ne: "delivered"</code> used the index but read 40,000 entries, 20% of the collection.</p>
  <h3>Unique + partial, and TTL</h3>
  <p>A unique index on <code>phone</code> treats a missing phone as <code>null</code>, so it cannot even be built while several customers have no phone. A <strong>partial index</strong> indexes only documents that match a filter:</p>
  <div class="fx" data-lang="js">db.customers.createIndex({ phone: 1 }, { unique: true })
db.customers.createIndex({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true } } })
db.customers.updateOne({ _id: 1 }, { $set: { phone: "+91 98220 00001" } }).modifiedCount
db.customers.insertOne({ _id: 8, name: "Hari" })
db.customers.insertOne({ _id: 9, name: "Isha", phone: "+91 98220 00001" })
db.customers.deleteOne({ _id: 8 })</div>
  <div class="fx" data-lang="text">Uncaught 
MongoServerError[DuplicateKey]: Index build failed: 4b5ff37b-0461-4fa8-9931-ad8b17547247: Collection biteful.customers ( 03167b8c-03d9-4b3a-8b82-d0ee15967367 ) :: caused by :: E11000 duplicate key error collection: biteful.customers index: phone_1 dup key: { phone: null }
phone_1
1
{ acknowledged: true, insertedId: 8 }
Uncaught 
MongoServerError: E11000 duplicate key error collection: biteful.customers index: phone_1 dup key: { phone: "+91 98220 00001" }
{ acknowledged: true, deletedCount: 1 }</div>
  <p>The plain unique index failed on the 7 phone-less customers (<code>dup key: { phone: null }</code>). The partial one was built; Hari (no phone) was accepted; Isha with Asha's number was rejected. A <strong>TTL index</strong> deletes documents some seconds after a date field, ideal for one-time passwords:</p>
  <div class="fx" data-lang="js">db.otp_codes.createIndex({ created_at: 1 }, { expireAfterSeconds: 60 })
db.otp_codes.insertMany([
  { _id: "old",  code: "4821", created_at: new Date(Date.now() - 5 * 60 * 1000) },
  { _id: "new",  code: "7730", created_at: new Date() },
  { _id: "text", code: "1111", created_at: "2026-03-02 12:10" } ])
db.otp_codes.find({}, { _id: 1 })
sleep(70000)
db.otp_codes.find({}, { _id: 1 })</div>
  <div class="fx" data-lang="text">created_at_1
{
  acknowledged: true,
  insertedIds: { '0': 'old', '1': 'new', '2': 'text' }
}
[ { _id: 'old' }, { _id: 'new' }, { _id: 'text' } ]
[ { _id: 'new' }, { _id: 'text' } ]</div>
  <p>Within 70 seconds the 5-minute-old code was gone (the TTL monitor runs about once a minute). The one with a <em>text</em> date will never expire: TTL only understands real dates.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ESR rule</strong>: in a compound index put <strong>E</strong>quality fields first, then the <strong>S</strong>ort field(s), then <strong>R</strong>ange fields. Equality narrows to one slice; inside it the sort order is already right; the range is checked while walking, and a limit can stop early. <strong>Prefix rule</strong>: a compound index serves queries on its leading fields. <strong>Covered query</strong>: filter and returned fields all in the index (docs examined 0). <strong>Multikey index</strong>: an index on an array field, one entry per element. <strong>Partial index</strong>: indexes only documents matching a filter. <strong>TTL index</strong>: deletes documents after <code>expireAfterSeconds</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "it uses an index" is not "it is fast"</span>
    <p>Compare keys examined with documents returned: 13,784 vs 10 (wrong field order), 200,000 vs 33,334 (<code>/dosa/i</code>), 40,000 for <code>$ne</code>. And every index slows every write and takes RAM; drop indexes nobody uses (<code>$indexStats</code> shows usage) and avoid indexing a low-selectivity field on its own.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: schema validation.</b> Indexes make correct queries fast. They do nothing about wrong data: a bug writing <code>status: "shipped"</code>, an order with no lines, a CSV import storing dates as text. The flexible schema accepts all of it, and the reports silently drift.</div>

  <h2 id="md-valid"><span class="num">07</span>Schema Validation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>PostgreSQL rejected bad Biteful rows with <code>CHECK</code>, <code>NOT NULL</code> and types. In MongoDB, so far, any document goes in. How do we get the database to reject a bad order at the door, without giving up the flexibility we wanted?</p>
  </div>
  <p>Attach a <strong>validator</strong> to a collection, written in <strong>JSON Schema</strong> (a standard way to describe what a JSON document must look like) with BSON types. Every insert and update is checked. We add one to the existing <code>orders</code> with <code>collMod</code>, after slipping in one legacy bad order (99) first:</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A railway reservation form: the clerk refuses it if the age box is empty or the date says "next Tuesday". The form's rules are checked before anything enters the system. But forms filed last year are not re-checked.</p>
  </div>
  <div class="fx" data-lang="js">db.orders.insertOne({ _id: 99, customer_id: 4, restaurant_id: 13, status: "shipped", amount: 310,
                      ordered_at: ISODate("2026-02-28T19:00:00+05:30"), items: [] })    // legacy junk
const orderSchema = {
  bsonType: "object",
  required: ["customer_id", "restaurant_id", "ordered_at", "status", "amount", "items"],
  properties: {
    status:           { enum: ["pending", "delivered", "cancelled"] },
    ordered_at:       { bsonType: "date" },
    amount:           { bsonType: "number", minimum: 1 },
    delivery_minutes: { bsonType: ["int", "null"], minimum: 1 },
    items: { bsonType: "array", minItems: 1,
             items: { bsonType: "object", required: ["item", "qty", "unit_price"],
                      properties: { qty: { bsonType: "int", minimum: 1 } } } } } }
db.runCommand({ collMod: "orders", validator: { $jsonSchema: orderSchema }, validationAction: "error" }).ok
function why(e) {                    // pull "field: reason" pairs out of the long error
  const out = []
  JSON.stringify(e.errInfo, (k, v) =&gt; { if (v &amp;&amp; v.propertyName &amp;&amp; v.details) v.details.forEach(d =&gt; out.push(v.propertyName + ": " + d.reason)); return v })
  return out
}</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: 99 }
1
[Function: why]</div>
  <p><code>collMod</code> returned 1 (ok). The small <code>why</code> helper pulls "field: reason" pairs out of MongoDB's long, nested validation errors. Now five writes against the rule:</p>
  <div class="fx" data-lang="js">const good = { customer_id: 7, restaurant_id: 14, ordered_at: ISODate("2026-03-09T13:00:00+05:30"),
               status: "pending", amount: 300, items: [ { item: "Veg Momos", qty: 2, unit_price: 150 } ] }
try { db.orders.insertOne({ ...good, _id: 111, status: "shipped", items: [] }) } catch (e) { print(e.message, why(e)) }
db.orders.insertOne({ ...good, _id: 112 })
try { db.orders.insertOne({ ...good, _id: 113, items: [ { item: "Veg Momos", qty: 1.5, unit_price: 150 } ] }) } catch (e) { print(why(e)) }
try { db.orders.insertOne({ ...good, _id: 114, ordered_at: "2026-03-09 13:00" }) } catch (e) { print(why(e)) }
db.orders.updateOne({ _id: 112 }, { $set: { stauts: "delivered" } }).modifiedCount
try { db.orders.updateOne({ _id: 112 }, { $set: { status: "deliverd" } }) } catch (e) { print(why(e)) }
db.orders.countDocuments()
db.orders.find({ $nor: [ { $jsonSchema: orderSchema } ] }, { status: 1, items: 1 })</div>
  <div class="fx" data-lang="text">Document failed validation [
  'status: value was not found in enum',
  'items: array did not match specified length'
]
{ acknowledged: true, insertedId: 112 }
[
  'items: At least one item did not match the sub-schema',
  'qty: type did not match'
]
[ 'ordered_at: type did not match' ]
1
[ 'status: value was not found in enum' ]
12
[ { _id: 99, status: 'shipped', items: [] } ]</div>
  <p>Traced. Order 111 broke two rules and the error names both (status not in the enum, empty items). 112 passed. 113 failed only because <code>qty: 1.5</code> is a double, not an int. 114 failed because its date was text. Then the surprise: <code>$set: { stauts: "delivered" }</code> was <strong>accepted</strong> (modifiedCount 1), because the schema only checks the fields it lists; the misspelled <em>value</em> "deliverd" was rejected. Finally, adding the validator did not touch old data: legacy order 99 is still there (12 orders in total), and <code>$nor: [ { $jsonSchema: … } ]</code> lists the rule-breakers.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$jsonSchema</strong>: a validator in JSON Schema with <code>bsonType</code>, <code>required</code>, <code>enum</code>, <code>minimum</code>, <code>minItems</code>, nested <code>items</code>/<code>properties</code>. <strong>bsonType "number"</strong>: any numeric type. <strong>additionalProperties: false</strong>: reject unlisted fields (then list <code>_id</code> too). <strong>validationAction</strong>: <code>"error"</code> rejects, <code>"warn"</code> logs. <strong>validationLevel "moderate"</strong>: don't check updates to documents that were already invalid.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: number types depend on the writer</span>
    <p>mongosh stores <code>2</code> as an int but <code>1.5</code> as a double; Python sends <code>2.0</code> as a double and very large ints as long, and pymongo cannot encode NumPy's <code>np.int64</code> at all (convert with <code>int()</code> before inserting a DataFrame). Use <code>bsonType: "number"</code> unless you truly need one exact type, and add <code>additionalProperties: false</code> if typo fields must be rejected.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: transactions.</b> The validator guards one document at a time. Paying with Biteful's wallet must insert an order <em>and</em> debit the customer's wallet, two documents in two collections. If the server dies between the two writes, money and orders disagree.</div>

  <h2 id="md-txn"><span class="num">08</span>Transactions in MongoDB</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Single-document writes are atomic, which is why lines live inside orders. But "pay ₹310 from Asha's wallet for order 111" changes an order document and a customer document. And the computed restaurant stats in section 05 were two writes as well. How do we make several documents change together or not at all?</p>
  </div>
  <p>A <strong>multi-document transaction</strong> groups writes across documents and collections into one all-or-nothing unit, with the same ACID meaning as in <a class="xref" data-note="sql_transactions">Transactions</a>. It needs a replica set (our test server is a one-member replica set) and a <strong>session</strong>, the client-side handle the transaction belongs to. The validator from section 07 is still on, so every order below is valid.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A UPI payment: money leaves your account and arrives in the shop's as one event. If the second half fails, the first is reversed. Nobody ever sees the money in neither account.</p>
  </div>
  <div class="fx" data-lang="js">db.customers.updateOne({ _id: 1 }, { $set: { wallet: 500 } }).modifiedCount
const s = db.getMongo().startSession()
const sdb = s.getDatabase("biteful")
s.startTransaction({ writeConcern: { w: "majority" } })
sdb.orders.insertOne({ _id: 111, customer_id: 1, restaurant_id: 10, status: "pending", amount: 310,
  ordered_at: ISODate("2026-03-09T12:30:00+05:30"), items: [ { item: "Masala Dosa", qty: 2, unit_price: 120 },
                                                            { item: "Filter Coffee", qty: 1, unit_price: 70 } ] })
sdb.customers.updateOne({ _id: 1, wallet: { $gte: 310 } }, { $inc: { wallet: -310 } }).modifiedCount
db.orders.findOne({ _id: 111 })                 // another client, outside the transaction
s.commitTransaction()
db.orders.countDocuments({ _id: 111 })
db.customers.findOne({ _id: 1 }, { wallet: 1 })</div>
  <div class="fx" data-lang="text">1
{ acknowledged: true, insertedId: 111 }
1
null
1
{ _id: 1, wallet: 190 }</div>
  <p>Traced. Asha's wallet was set to ₹500. Inside the transaction, order 111 was inserted and the wallet debited (the filter <code>wallet: { $gte: 310 }</code> guards against overdraft). A read from <em>outside</em> the transaction returned <code>null</code>: nobody else sees the order until commit. After <code>commitTransaction()</code>, the order exists and the wallet is ₹190. Now an abort, and a conflict:</p>
  <div class="fx" data-lang="js">const s = db.getMongo().startSession(), sdb = s.getDatabase("biteful")
s.startTransaction()
sdb.orders.insertOne({ _id: 113, customer_id: 1, restaurant_id: 11, status: "pending", amount: 180,
  ordered_at: ISODate("2026-03-09T13:00:00+05:30"), items: [ { item: "Veg Biryani", qty: 1, unit_price: 180 } ] })
sdb.customers.updateOne({ _id: 1, wallet: { $gte: 180 } }, { $inc: { wallet: -180 } }).modifiedCount
s.abortTransaction()
db.orders.findOne({ _id: 113 })
db.customers.findOne({ _id: 1 }, { wallet: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: 113 }
1
null
{ _id: 1, wallet: 190 }</div>
  <div class="fx" data-lang="js">const s1 = db.getMongo().startSession(), s2 = db.getMongo().startSession()
s1.startTransaction(); s2.startTransaction()
s1.getDatabase("biteful").customers.updateOne({ _id: 1 }, { $inc: { wallet: -50 } }).modifiedCount
try { s2.getDatabase("biteful").customers.updateOne({ _id: 1 }, { $inc: { wallet: -50 } }) }
catch (e) { print(e.codeName, JSON.stringify(e.errorLabels)) }
s1.commitTransaction(); s2.abortTransaction()
db.customers.findOne({ _id: 1 }, { wallet: 1 })</div>
  <div class="fx" data-lang="text">1
WriteConflict ["TransientTransactionError"]
{ _id: 1, wallet: 140 }</div>
  <p>The aborted transaction left no order 113 and the wallet at ₹190. In the conflict, two transactions touched Asha's document: the second failed immediately with <code>WriteConflict</code>, labelled <code>TransientTransactionError</code>, meaning "safe to retry the whole transaction". Only one ₹50 debit happened (₹140). In application code, let the driver retry: pymongo's <code>with_transaction</code> runs your function, commits, retries on transient errors, and aborts if your function raises.</p>
  <div class="fx" data-lang="py">from pymongo import MongoClient
from pymongo.write_concern import WriteConcern

client = MongoClient("mongodb://127.0.0.1:27347/?replicaSet=rs0")   # transactions need a replica set
db = client["biteful"]

def pay_with_wallet(order):
    def txn(session):
        db.orders.insert_one(order, session=session)
        res = db.customers.update_one({"_id": order["customer_id"], "wallet": {"$gte": order["amount"]}},
                                      {"$inc": {"wallet": -order["amount"]}}, session=session)
        if res.modified_count == 0:
            raise ValueError("insufficient wallet balance")   # any exception -&gt; abort
    with client.start_session() as s:
        s.with_transaction(txn, write_concern=WriteConcern("majority"))

base = {"customer_id": 1, "restaurant_id": 12, "status": "pending",
        "ordered_at": __import__("datetime").datetime(2026, 3, 9, 8, 0)}
pay_with_wallet({**base, "_id": 114, "amount": 100,
                 "items": [{"item": "Garlic Bread", "qty": 1, "unit_price": 100}]})
try:
    pay_with_wallet({**base, "_id": 115, "amount": 560,
                     "items": [{"item": "Farmhouse Pizza", "qty": 2, "unit_price": 280}]})
except ValueError as e:
    print("aborted:", e)
print(db.orders.count_documents({"_id": {"$in": [114, 115]}}))
print(db.customers.find_one({"_id": 1}, {"wallet": 1}))</div>
  <div class="fx" data-lang="text">aborted: insufficient wallet balance
1
{'_id': 1, 'wallet': 40}</div>
  <p>Order 114 (₹100) went through: wallet ₹140 → ₹40. Order 115 (₹560) found too little in the wallet, the function raised, the transaction aborted, and the order insert that had already happened inside it was rolled back: only 1 of the 2 orders exists.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Multi-document transaction</strong>: ACID writes across documents and collections (replica sets since 4.0, sharded clusters since 4.2, using two-phase commit across shards). <strong>Session</strong>: the handle a transaction runs in. <strong>TransientTransactionError</strong>: a label meaning the whole transaction may be retried.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: transactions as a habit</span>
    <p>They cost latency and cache, abort after 60 seconds by default, should touch well under about 1,000 documents, and need retry logic. If most of your writes need them, first ask whether embedding can make it one document (lines + total did), or whether the workload is really relational.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: replica sets.</b> Everything so far ran on one server. One disk, one power supply, one machine that can crash during a deploy. If it dies, Biteful is down and recent writes may be gone.</div>

  <h2 id="md-repl"><span class="num">09</span>Replica Sets: Surviving a Crash</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>At 8 p.m. on a Friday, Biteful's only database server crashes. Every order fails until someone restarts it, and orders written since the last backup may be lost. How do we keep running when a machine dies?</p>
  </div>
  <p>Production MongoDB runs as a <strong>replica set</strong>: several servers holding the same data. One member is the <strong>primary</strong>: it takes all writes and records each change in its <strong>oplog</strong> (operation log). The others are <strong>secondaries</strong>: they copy the oplog and replay it. If the primary disappears, the remaining members hold an <strong>election</strong> and promote a secondary. This is the same idea as replication in <a class="xref" data-note="sql_transactions">Transactions</a>, with automatic failover built in.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding kitchen with one head cook and two assistants. Only the head cook decides each dish and writes it in the order book; the assistants copy the book line by line. If the head cook collapses, the assistants agree on who takes over, which needs 2 of 3 votes.</p>
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
    <text x="100" y="150" font-size="10" class="tm">w: 1 = ack after the primary only</text>
  </svg><figcaption>Three voting members: one primary takes writes, two secondaries replay its oplog and can take over.</figcaption></figure>
  <p>We started three <code>mongod</code> servers (ports 27351–27353) with <code>--replSet rsB</code> and joined them with <code>rs.initiate</code>. Their roles right after starting:</p>
  <div class="fx" data-lang="js">rs.status().members.map(m =&gt; ({ host: m.name, state: m.stateStr }))</div>
  <div class="fx" data-lang="text">[
  { host: '127.0.0.1:27351', state: 'PRIMARY' },
  { host: '127.0.0.1:27352', state: 'SECONDARY' },
  { host: '127.0.0.1:27353', state: 'SECONDARY' }
]</div>
  <p>Then the failover test. This loop, connected to the whole set (<code>mongodb://…27351,…27352,…27353/biteful?replicaSet=rsB</code>), inserts a rider ping every half second and prints when a write fails or the first write after a failure succeeds. About 3 seconds in, we killed the primary's process with <code>kill -9</code> (a crash, not a clean shutdown). By the time of this run an earlier test had already moved the primary to 27352, so 27352 is the one killed.</p>
  <div class="fx" data-lang="js">const t0 = Date.now()
let lastFailed = false, ok = 0
for (let i = 1; i &lt;= 40; i++) {
  const secs = ((Date.now() - t0) / 1000).toFixed(1) + "s"
  try {
    db.pings.insertOne({ rider: 3, seq: i, ts: new Date() })
    ok++
    if (i == 1 || lastFailed) print(secs, "write", i, "ok, primary =", db.hello().primary)
    lastFailed = false
  } catch (e) {
    print(secs, "write", i, "FAILED:", e.name)
    lastFailed = true
  }
  sleep(500)
}
print("successful writes:", ok, " documents stored:", db.pings.countDocuments())</div>
  <div class="fx" data-lang="text">0.2s write 1 ok, primary = 127.0.0.1:27352
2.7s write 6 FAILED: MongoServerSelectionError
5.2s write 7 FAILED: MongoServerSelectionError
7.7s write 8 FAILED: MongoServerSelectionError
10.2s write 9 FAILED: MongoServerSelectionError
12.7s write 10 ok, primary = 127.0.0.1:27353
successful writes: 36  documents stored: 36</div>
  <p>Writes 1–5 went to 27352. After the kill, writes failed for about 10 seconds: that is the default <code>electionTimeoutMillis</code> (10,000 ms), how long secondaries wait without a heartbeat before calling an election. Then 27353 won and writes resumed with no human involved. Every one of the 36 acknowledged writes was stored. (Each failed attempt took 2.5 seconds because the shell gives up quickly; application drivers wait up to 30 seconds by default, so an app usually sees a pause rather than errors.) We restarted the killed node; it rejoined as a secondary and caught up:</p>
  <div class="fx" data-lang="text">[
  { host: '127.0.0.1:27351', state: 'SECONDARY' },
  { host: '127.0.0.1:27352', state: 'SECONDARY' },
  { host: '127.0.0.1:27353', state: 'PRIMARY' }
]</div>
  <p>A write that waits for a majority of members, then the "why 3, not 2" test: we shut down two members and asked the survivor to accept a write.</p>
  <div class="fx" data-lang="js">db.pings.insertOne({ rider: 3, seq: 41 }, { writeConcern: { w: "majority", wtimeout: 5000 } })
db.pings.countDocuments()</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: ObjectId('6ad6b6987151cfeebb5687df') }
37</div>
  <div class="fx" data-lang="text">[
  { host: '127.0.0.1:27351', state: 'SECONDARY' },
  { host: '127.0.0.1:27352', state: '(not reachable/healthy)' },
  { host: '127.0.0.1:27353', state: '(not reachable/healthy)' }
]</div>
  <div class="fx" data-lang="js">db.hello().isWritablePrimary
try { db.pings.insertOne({ rider: 3, seq: 99 }) } catch (e) { print(e.codeName) }</div>
  <div class="fx" data-lang="text">false
NotWritablePrimary</div>
  <p>With 2 of 3 members down, 27351 stepped down to SECONDARY and refused the write (<code>NotWritablePrimary</code>): 1 of 3 votes is not a majority, so no primary can exist. This protects against "split brain" (two primaries accepting different writes). The same rule is why 2 members are not enough: losing 1 leaves 1 of 2, not a majority.</p>
  <table class="tbl">
    <tr><th>Setting</th><th>Meaning</th><th>Trade-off</th></tr>
    <tr><td><code>w: 1</code></td><td>ack when the primary has it</td><td>fast; lost (rolled back) if the primary dies before replicating</td></tr>
    <tr><td><code>w: "majority"</code> (default since 5.0)</td><td>ack when most members have it</td><td>survives failover; slower</td></tr>
    <tr><td><code>readPreference: "primary"</code></td><td>all reads from the primary (default)</td><td>always current</td></tr>
    <tr><td><code>"secondary"</code> / <code>"nearest"</code></td><td>reads from replicas</td><td>spreads load, but data may be <strong>stale</strong></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Replica set</strong>: mongod servers holding the same data, one primary and the rest secondaries. <strong>Oplog</strong>: the primary's log of changes that secondaries replay. <strong>Election</strong>: choosing a new primary; needs a majority of voting members. <strong>Write concern</strong>: how many members must confirm a write. <strong>Read preference</strong>: which members may serve reads. <strong>Replication lag</strong>: how far behind a secondary is.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: read-your-writes, and "replicas scale writes"</span>
    <p>A customer places an order (written to the primary) and the "My orders" page reads from a lagging secondary: the order is missing. Read from the primary after writes, or use a causally consistent session with majority read and write concern. And replication adds availability and read capacity, not write capacity: every write still goes to one primary.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sharding.</b> A replica set copies <em>all</em> the data to every member, so it can never hold more than one machine's disk, and every write lands on one primary. When Biteful expands to 50 cities, how do we split the data and the writes across machines, and what decides where each order goes?</div>

  <h2 id="md-shard"><span class="num">10</span>Sharding &amp; Shard-Key Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Orders now arrive faster than one primary can write them, and the collection is bigger than one disk. Splitting the collection across several replica sets sounds simple, but every order must go to exactly one of them, and every query must know where to look. What decides that, and how can the choice go wrong?</p>
  </div>
  <p><strong>Sharding</strong> splits a collection across several replica sets, each called a <strong>shard</strong>. The <strong>shard key</strong> (one or more fields) decides which shard a document lives on: documents are grouped into <strong>chunks</strong> (ranges of the key), a router process, <strong>mongos</strong>, sends each query to the shard(s) owning the relevant chunks, and <strong>config servers</strong> store the map of which chunk lives where.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A post office with several sorting counters. Split letters by PIN code and every counter gets a fair share, and "PIN 411001" goes to one counter. Split them by "date received" and every new letter goes to the last counter: one clerk does all the work while the others sit idle. Split them by "city: Pune or Mumbai" and a third counter can never get anything.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="md-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="16" width="80" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="40" y="39" text-anchor="middle">App</text>
    <line x1="80" y1="34" x2="198" y2="34" stroke="currentColor" marker-end="url(#md-ar3)"/>
    <rect x="200" y="12" width="140" height="44" rx="8" class="fb sb"/><text x="270" y="38" text-anchor="middle" font-weight="bold">mongos</text>
    <rect x="400" y="12" width="190" height="44" rx="8" class="fv sb"/><text x="495" y="31" text-anchor="middle">config servers</text><text x="495" y="47" text-anchor="middle" font-size="10" class="tm">which chunk lives where</text>
    <line x1="340" y1="34" x2="398" y2="34" stroke="currentColor" stroke-dasharray="3 3"/>
    <rect x="10" y="120" width="170" height="54" rx="8" class="ft st"/><text x="95" y="142" text-anchor="middle">Shard shA</text><text x="95" y="162" text-anchor="middle" font-size="10" class="tm">customers 0–2499</text>
    <rect x="215" y="120" width="170" height="54" rx="8" class="ft st"/><text x="300" y="142" text-anchor="middle">Shard shB</text><text x="300" y="162" text-anchor="middle" font-size="10" class="tm">customers 2500–4999</text>
    <rect x="420" y="120" width="170" height="54" rx="8" class="ft st"/><text x="505" y="142" text-anchor="middle">Shard … (later)</text><text x="505" y="162" text-anchor="middle" font-size="10" class="tm">add as data grows</text>
    <line x1="250" y1="56" x2="110" y2="118" class="sg" stroke-width="2" marker-end="url(#md-ar3)"/>
    <text x="170" y="76" text-anchor="end" font-size="10" class="tg">customer_id: 42 → one shard</text>
    <g class="sr" stroke-dasharray="4 3"><line x1="300" y1="56" x2="300" y2="118" marker-end="url(#md-ar3)"/><line x1="310" y1="56" x2="490" y2="118" marker-end="url(#md-ar3)"/></g>
    <text x="410" y="84" font-size="10" class="tr">no shard key → ask every shard</text>
  </svg><figcaption>Each shard is itself a replica set. Queries that carry the shard key go to one shard; the rest go to all.</figcaption></figure>
  <p>We built a real cluster: one config server, two shards (<code>shA</code>, <code>shB</code>) and one <code>mongos</code>. Then four copies of Biteful's orders collection, sharded four ways. Each was pre-split into two chunks and one chunk placed on each shard: the time-keyed one at 1 March (older on shA, newer on shB), the customer-keyed one at customer 2,500, the city-keyed one at "Pune".</p>
  <div class="fx" data-lang="js">sh.shardCollection("biteful.orders_by_time", { ordered_at: 1 }).ok                   // ranged, always increasing
sh.shardCollection("biteful.orders_hashed",  { _id: "hashed" }).ok                   // hashed
sh.shardCollection("biteful.orders_by_cust", { customer_id: 1, ordered_at: 1 }).ok   // compound, spread-out first field
sh.shardCollection("biteful.orders_by_city", { city: 1 }).ok                          // only 2 distinct values
sh.splitAt("biteful.orders_by_time", { ordered_at: ISODate("2026-03-01") }).ok
sh.splitAt("biteful.orders_by_cust", { customer_id: 2500, ordered_at: MinKey() }).ok
sh.splitAt("biteful.orders_by_city", { city: "Pune" }).ok
db.adminCommand({ moveChunk: "biteful.orders_by_time", find: { ordered_at: ISODate("2026-01-01") }, to: "shA" }).ok
db.adminCommand({ moveChunk: "biteful.orders_by_time", find: { ordered_at: ISODate("2026-06-01") }, to: "shB" }).ok
db.adminCommand({ moveChunk: "biteful.orders_by_cust", find: { customer_id: 1, ordered_at: ISODate("2026-01-01") }, to: "shA" }).ok
db.adminCommand({ moveChunk: "biteful.orders_by_cust", find: { customer_id: 4000, ordered_at: ISODate("2026-01-01") }, to: "shB" }).ok
db.adminCommand({ moveChunk: "biteful.orders_by_city", find: { city: "Mumbai" }, to: "shA" }).ok
db.adminCommand({ moveChunk: "biteful.orders_by_city", find: { city: "Pune" }, to: "shB" }).ok</div>
  <div class="fx" data-lang="text">1
1
1
1
1
1
1
1
1
1
1
1
1</div>
  <p>All 13 commands returned ok. Now 10,000 new orders, arriving from 10 March one per minute, are inserted into each collection, and <code>$shardedDataDistribution</code> reports how many documents each shard owns:</p>
  <div class="fx" data-lang="js">function newOrders() {               // 10,000 orders arriving from 10 March, one per minute
  const out = []
  for (let i = 0; i &lt; 10000; i++)
    out.push({ customer_id: (i * 7919) % 5000, city: i % 5 &lt; 3 ? "Pune" : "Mumbai",
               status: ["delivered", "pending"][i % 2], amount: 100 + (i % 9) * 50,
               ordered_at: new Date(Date.UTC(2026, 2, 10) + i * 60000) })
  return out
}
db.orders_by_time.insertMany(newOrders()).acknowledged
db.orders_hashed.insertMany(newOrders()).acknowledged
db.orders_by_cust.insertMany(newOrders()).acknowledged
db.orders_by_city.insertMany(newOrders()).acknowledged
db.getSiblingDB("admin").aggregate([ { $shardedDataDistribution: {} }, { $match: { ns: /^biteful\\./ } },
  { $unwind: "$shards" },
  { $project: { _id: 0, ns: 1, shard: "$shards.shardName", docs: "$shards.numOwnedDocuments" } },
  { $sort: { ns: 1, shard: 1 } } ])</div>
  <div class="fx" data-lang="text">[Function: newOrders]
true
true
true
true
[
  { ns: 'biteful.orders_by_city', shard: 'shA', docs: 4000 },
  { ns: 'biteful.orders_by_city', shard: 'shB', docs: 6000 },
  { ns: 'biteful.orders_by_cust', shard: 'shA', docs: 5000 },
  { ns: 'biteful.orders_by_cust', shard: 'shB', docs: 5000 },
  { ns: 'biteful.orders_by_time', shard: 'shA', docs: 0 },
  { ns: 'biteful.orders_by_time', shard: 'shB', docs: 10000 },
  { ns: 'biteful.orders_hashed', shard: 'shA', docs: 4985 },
  { ns: 'biteful.orders_hashed', shard: 'shB', docs: 5015 }
]</div>
  <table class="tbl out"><caption>Reading the distribution (10,000 new orders, 2 shards)</caption>
    <tr><th>Shard key</th><th>shA</th><th>shB</th><th>Why</th></tr>
    <tr><td><code>{ ordered_at: 1 }</code></td><td>0</td><td><strong>10,000</strong></td><td>every new order is newer than all others → always the top chunk: a <strong>hot shard</strong></td></tr>
    <tr><td><code>{ _id: "hashed" }</code></td><td>4,985</td><td>5,015</td><td>the hash scatters ids evenly</td></tr>
    <tr><td><code>{ customer_id: 1, ordered_at: 1 }</code></td><td>5,000</td><td>5,000</td><td>customers are spread out, so their orders are too</td></tr>
    <tr><td><code>{ city: 1 }</code></td><td>4,000 (Mumbai)</td><td>6,000 (Pune)</td><td>only 2 values: lopsided, and capped at 2 chunks</td></tr>
  </table>
  <p>Which shards does a query touch, and can the city chunks ever be split further?</p>
  <div class="fx" data-lang="js">db.orders_by_cust.find({ customer_id: 42 }).explain().queryPlanner.winningPlan.stage
db.orders_by_cust.find({ status: "pending" }).explain().queryPlanner.winningPlan.stage</div>
  <div class="fx" data-lang="text">SINGLE_SHARD
SHARD_MERGE</div>
  <div class="fx" data-lang="js">db.getSiblingDB("config").chunks.countDocuments({ uuid: db.getSiblingDB("config").collections.findOne({ _id: "biteful.orders_by_city" }).uuid })
try { sh.splitFind("biteful.orders_by_city", { city: "Pune" }) } catch (e) { print(e.codeName + ": " + e.message.slice(0, 90)) }</div>
  <div class="fx" data-lang="text">2
CannotSplit: Unable to find median in chunk because chunk is indivisible.</div>
  <p>A query on the shard key's prefix (<code>customer_id: 42</code>) went to one shard (<code>SINGLE_SHARD</code>). A query without it was sent to every shard and the results merged (<code>SHARD_MERGE</code>, <strong>scatter-gather</strong>): fine with 2 shards, 50 queries per request with 50. The city collection has 2 chunks, and splitting the all-Pune chunk failed with <code>CannotSplit … chunk is indivisible</code>: every document in it has the same key value. A third, fourth or tenth shard could never take any Pune orders; such an unsplittable, ever-growing chunk is called a <strong>jumbo chunk</strong>.</p>
  <table class="tbl">
    <tr><th></th><th>Ranged key</th><th>Hashed key</th></tr>
    <tr><td>Placement</td><td>nearby values on the same shard</td><td>hash of the value spreads documents randomly</td></tr>
    <tr><td>Range queries on the key</td><td>efficient (one or few shards)</td><td>scatter-gather</td></tr>
    <tr><td>Monotonic values (dates, ObjectIds)</td><td>hot shard (measured 0 / 10,000)</td><td>even (measured 4,985 / 5,015)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shard key</strong>: the field(s) that decide a document's shard. A good key has <strong>high cardinality</strong> (many distinct values), <strong>even frequency</strong> (no value dominates), is <strong>not monotonic</strong>, and appears in most queries. <strong>Chunk</strong>: a key range stored on one shard. <strong>Balancer</strong>: background process that moves chunks to even out shards. <strong>Targeted query</strong> vs <strong>scatter-gather</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the three bad keys</span>
    <p>(1) <strong>Monotonic</strong> (dates, ObjectIds, counters): all inserts hit one shard. (2) <strong>Low cardinality</strong> (city, status): at most as many chunks as values, jumbo chunks. (3) <strong>Not in your queries</strong>: every read is scatter-gather. For Biteful's orders, <code>{ customer_id, ordered_at }</code> spreads writes and keeps "my orders" on one shard; a hashed <code>_id</code> spreads writes but scatters every range query. Changing a key later (resharding, 5.0+) copies the whole collection, and you should not shard until one replica set truly cannot cope.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: MongoDB vs JSONB.</b> We have the full MongoDB toolkit, from one document to a cluster. A team already running PostgreSQL will ask the honest question: Postgres can store JSON too, so do we need a second database at all?</div>

  <h2 id="md-pg"><span class="num">11</span>Do You Need MongoDB? PostgreSQL JSONB</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful already runs PostgreSQL for the SQL notes. The new requirement (orders with varying lines and options) pushed us to documents. Could a <strong>JSONB</strong> column in the existing database have done the job, with one database to run, back up and secure?</p>
  </div>
  <p><strong>JSONB</strong> is PostgreSQL's binary JSON column type: a whole document stored in one column of a normal table, queryable with operators and indexable with a <strong>GIN</strong> index (an inverted index that maps each key/value inside the JSON to the rows containing it). Tested on PostgreSQL 17: build one JSONB document per order straight from the SQL tables, index it, and ask the same questions as the MongoDB notes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your house already has a cupboard with labelled shelves (Postgres). For a few odd-shaped things you can add a flexible drawer to the same cupboard (JSONB) instead of buying a second cupboard and carrying two sets of keys.</p>
  </div>
  <div class="fx" data-lang="sql">CREATE TABLE orders_doc (order_id INT PRIMARY KEY, doc JSONB NOT NULL);
INSERT INTO orders_doc
SELECT o.order_id,
       jsonb_build_object('customer_id', o.customer_id, 'status', o.status, 'amount', o.amount,
         'items', (SELECT jsonb_agg(jsonb_build_object('item', i.item, 'qty', i.qty,
                                                       'unit_price', i.unit_price) ORDER BY i.item)
                   FROM order_items i WHERE i.order_id = o.order_id))
FROM orders o;
CREATE INDEX orders_doc_gin ON orders_doc USING gin (doc jsonb_path_ops);
SELECT doc::text AS doc FROM orders_doc WHERE order_id = 102;
SELECT order_id FROM orders_doc
WHERE doc @&gt; '{"items": [{"item": "Masala Dosa"}]}' ORDER BY order_id;
SELECT i -&gt;&gt; 'item' AS item,
       SUM((i -&gt;&gt; 'qty')::int * (i -&gt;&gt; 'unit_price')::numeric) AS revenue
FROM orders_doc, jsonb_array_elements(doc -&gt; 'items') AS i
WHERE doc -&gt;&gt; 'status' = 'delivered'
GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 3;
SET enable_seqscan = off;
EXPLAIN (COSTS OFF) SELECT order_id FROM orders_doc WHERE doc @&gt; '{"items": [{"item": "Masala Dosa"}]}';</div>
  <div class="fx" data-lang="text">doc
{"items": [{"qty": 1, "item": "Chicken Biryani", "unit_price": 350.00}, {"qty": 2, "item": "Raita", "unit_price": 50.00}], "amount": 450.00, "status": "delivered", "customer_id": 2}
(1 rows)</div>
  <table class="tbl out"><caption>PostgreSQL 17: @&gt; (contains) finds the same 3 orders as MongoDB's "items.item" filter</caption><tr><th>order_id</th></tr><tr><td>101</td></tr><tr><td>108</td></tr><tr><td>110</td></tr></table>
  <table class="tbl out"><caption>PostgreSQL 17: jsonb_array_elements plays the role of $unwind; same top 3 as the aggregation note</caption><tr><th>item</th><th>revenue</th></tr><tr><td>Chicken Biryani</td><td>700.00</td></tr><tr><td>Farmhouse Pizza</td><td>520.00</td></tr><tr><td>Masala Dosa</td><td>360.00</td></tr></table>
  <div class="fx" data-lang="text">QUERY PLAN
Bitmap Heap Scan on orders_doc
  Recheck Cond: (doc @&gt; '{"items": [{"item": "Masala Dosa"}]}'::jsonb)
  -&gt;  Bitmap Index Scan on orders_doc_gin
        Index Cond: (doc @&gt; '{"items": [{"item": "Masala Dosa"}]}'::jsonb)
(4 rows)</div>
  <p>Order 102 came out as one JSON document (JSONB stores keys in its own order). <code>@&gt;</code> ("contains") found orders 101, 108, 110, and the GIN index can answer it: with sequential scans disabled to force the planner's hand on 10 rows, the plan shows a <code>Bitmap Index Scan on orders_doc_gin</code>. <code>jsonb_array_elements</code> unnests the items like <code>$unwind</code>, and the revenue per item matches the pipeline exactly (Chicken Biryani 700).</p>
  <table class="tbl">
    <tr><th>Need</th><th>Lean towards</th></tr>
    <tr><td>Mostly relational data, a few flexible attributes</td><td>PostgreSQL + JSONB</td></tr>
    <tr><td>Joins, ad-hoc analytics, strict constraints, multi-table transactions</td><td>PostgreSQL</td></tr>
    <tr><td>Documents are the main model; nested reads and writes as one unit</td><td>MongoDB</td></tr>
    <tr><td>Built-in horizontal scaling of writes across many machines</td><td>MongoDB (Postgres needs an extension such as Citus)</td></tr>
    <tr><td>Frequent partial updates inside big nested documents</td><td>MongoDB (a JSONB update writes a new version of the whole value)</td></tr>
    <tr><td>One database for the team to run, already on Postgres</td><td>PostgreSQL + JSONB</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>JSONB</strong>: PostgreSQL's binary JSON type. <strong>GIN index</strong>: Generalized Inverted Index; <code>jsonb_path_ops</code> is a smaller variant supporting <code>@&gt;</code>. <strong>-&gt;</strong> / <strong>-&gt;&gt;</strong>: get a JSON field as JSON / as text.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "flexible fields, so MongoDB"</span>
    <p>That skips the cheaper option. In system-design interviews, give the reason: JSONB when the core is relational and a few attributes vary; MongoDB when documents are the core model, nested data is read and written as a unit, or you need built-in write scale-out.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> From "embed or reference?" to a sharded cluster: one picture of how each decision feeds the next.</div>

  <h2 id="md-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Embedding, references, cardinality, five patterns, ESR, validation, transactions, replica sets, sharding: separate topics, or one chain of decisions?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="md-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="160" height="50" rx="8" class="fr sr"/><text x="90" y="40" text-anchor="middle" font-weight="700">the queries</text><text x="90" y="57" text-anchor="middle" class="tm">order page, dashboard…</text>
<line x1="170" y1="45" x2="198" y2="45" stroke="currentColor" marker-end="url(#md-a9)"/>
<rect x="200" y="20" width="160" height="50" rx="8" class="fb sb"/><text x="280" y="40" text-anchor="middle" font-weight="700">embed / reference</text><text x="280" y="57" text-anchor="middle" class="tm">by cardinality, 16 MB</text>
<line x1="360" y1="45" x2="388" y2="45" stroke="currentColor" marker-end="url(#md-a9)"/>
<rect x="390" y="20" width="150" height="50" rx="8" class="fb sb"/><text x="465" y="40" text-anchor="middle" font-weight="700">patterns</text><text x="465" y="57" text-anchor="middle" class="tm">copy, precompute, cap</text>
<line x1="540" y1="45" x2="568" y2="45" stroke="currentColor" marker-end="url(#md-a9)"/>
<rect x="570" y="20" width="140" height="50" rx="8" class="ft st"/><text x="640" y="40" text-anchor="middle" font-weight="700">indexes (ESR)</text><text x="640" y="57" text-anchor="middle" class="tm">11 keys, not 13,784</text>
<line x1="640" y1="70" x2="640" y2="103" stroke="currentColor" marker-end="url(#md-a9)"/>
<rect x="570" y="105" width="140" height="50" rx="8" class="fv sb"/><text x="640" y="125" text-anchor="middle" font-weight="700">validation</text><text x="640" y="142" text-anchor="middle" class="tm">bad data rejected</text>
<line x1="570" y1="130" x2="542" y2="130" stroke="currentColor" marker-end="url(#md-a9)"/>
<rect x="390" y="105" width="150" height="50" rx="8" class="fv sb"/><text x="465" y="125" text-anchor="middle" font-weight="700">transactions</text><text x="465" y="142" text-anchor="middle" class="tm">when 2+ docs must agree</text>
<line x1="390" y1="130" x2="362" y2="130" stroke="currentColor" marker-end="url(#md-a9)"/>
<rect x="200" y="105" width="160" height="50" rx="8" class="fg sg"/><text x="280" y="125" text-anchor="middle" font-weight="700">replica set</text><text x="280" y="142" text-anchor="middle" class="tm">survive a crash (~10 s)</text>
<line x1="200" y1="130" x2="172" y2="130" stroke="currentColor" marker-end="url(#md-a9)"/>
<rect x="10" y="105" width="160" height="50" rx="8" class="fg sg"/><text x="90" y="125" text-anchor="middle" font-weight="700">sharding</text><text x="90" y="142" text-anchor="middle" class="tm">key from the queries</text>
<path d="M90 105 C 90 85, 90 80, 90 72" stroke="currentColor" stroke-dasharray="4 3" fill="none" marker-end="url(#md-a9)"/>
<text x="100" y="92" class="tm">shard key = a query field</text>
<rect x="10" y="185" width="700" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="360" y="204" text-anchor="middle">embedding decides what is atomic for free → transactions only for what embedding couldn't cover</text><text x="360" y="221" text-anchor="middle" class="tm">the same queries choose the indexes and the shard key; validation and replicas keep the chosen shape correct and alive</text>
<text x="10" y="262" class="tm">Everything starts and ends with the queries: they choose the shape, the shape chooses what needs indexes, transactions and which key to shard on.</text>
</g>
</svg><figcaption>Schema design is one loop: queries → shape → patterns → indexes → guards → scale, and the shard key comes back to the queries.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>Embed</td><td>sub-documents, arrays</td><td>store owned data with its parent</td><td>lines in orders; 2 addresses in Asha</td><td>1-few, read together</td></tr>
    <tr><td>16 MB limit</td><td>BSON size</td><td>how big can a document get?</td><td>~74,071 orders; push 16 of 1 MB failed</td><td>always check growth</td></tr>
    <tr><td>Reference</td><td>stored _id</td><td>link shared / unbounded data</td><td>orders → customer, restaurant; order for customer 99 accepted</td><td>1-many, M:N, independent data</td></tr>
    <tr><td>Cardinality rules</td><td>embed + reference</td><td>quick decision by "how many"</td><td>100,000 ids = 1.9 MB</td><td>every relationship</td></tr>
    <tr><td>Extended reference</td><td>reference + copied fields</td><td>avoid $lookup on reads</td><td>102 carries Ben, Biryani Bros; rename → 3 orders</td><td>stable fields shown often</td></tr>
    <tr><td>Computed</td><td>stored aggregate</td><td>avoid recomputing totals</td><td>Dosa Hut 2 / ₹500 → 3 / ₹810</td><td>read-heavy totals</td></tr>
    <tr><td>Subset / outlier</td><td>embed part, overflow rest</td><td>big related lists</td><td>newest 3 reviews; Green Bowl 3 + 2 overflow</td><td>lists shown partially, rare giants</td></tr>
    <tr><td>Bucket</td><td>group by entity + time</td><td>millions of tiny records</td><td>100,000 → 1,670 docs; index 3,776 → 84 KB</td><td>time series, IoT, events</td></tr>
    <tr><td>ESR index</td><td>compound B-tree</td><td>fast filter + sort + range</td><td>11 keys vs 13,784 + SORT</td><td>every hot query</td></tr>
    <tr><td>Validation</td><td>$jsonSchema</td><td>reject bad documents</td><td>"shipped", [], 1.5, text date rejected; <code>stauts</code> passed</td><td>every collection with a contract</td></tr>
    <tr><td>Transactions</td><td>sessions</td><td>several documents, all or nothing</td><td>wallet 500 → 190; conflict → retry</td><td>cross-document invariants</td></tr>
    <tr><td>Replica set</td><td>oplog + elections</td><td>survive a crash</td><td>~10 s outage, 36/36 writes kept</td><td>every production deployment</td></tr>
    <tr><td>Sharding</td><td>shard key + chunks</td><td>scale data and writes out</td><td>time key 0 / 10,000; customer key 5,000 / 5,000</td><td>beyond one replica set</td></tr>
    <tr><td>JSONB</td><td>Postgres column + GIN</td><td>documents without a second DB</td><td>@&gt; finds 101, 108, 110</td><td>relational core, flexible parts</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>shape the documents around the queries, so that what changes together lives in one document, and use indexes, transactions, replicas and shard keys for what the shape alone cannot do.</strong> Embedding buys atomicity and one-read pages but is bounded by 16 MB; references are unbounded but cost lookups and integrity; patterns fine-tune that trade-off; and the same queries pick the index order and the shard key.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Design mistakes don't fail on day one. Which ones show up later, when data grows, a server dies, or traffic shifts?</div>

  <h2 id="md-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which design errors do interviewers and production incidents both point to?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: embedding unbounded arrays</span>
    <p>All orders inside the customer, all pings inside the rider: about 74,000 orders of 226 bytes before the hard 16 MB failure, slow long before.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: designing like SQL</span>
    <p>One collection per table and <code>$lookup</code> on every request. Shape documents around the main queries instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: assuming references are checked</span>
    <p>The order for customer 99 was accepted. Keep references valid in code and run orphan checks.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: copying data that changes often</span>
    <p>Extended references are for stable fields. Copying stock levels creates drift and giant <code>updateMany</code> calls.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: compound index in the wrong order</span>
    <p>Equality, Sort, Range. Range before sort: 13,784 keys and an in-memory sort instead of 11 keys.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unique index on an optional field</span>
    <p>It fails with <code>dup key: { phone: null }</code>. Use a partial index.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: TTL on a string date</span>
    <p>It never expires. Store real dates.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting a validator to catch typos</span>
    <p><code>stauts</code> passed. Add <code>additionalProperties: false</code>, and check old documents with <code>$nor: [ { $jsonSchema } ]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: transactions without retry, or everywhere</span>
    <p><code>WriteConflict</code> with <code>TransientTransactionError</code> is normal under load: use <code>with_transaction</code>. If most writes need a transaction, rethink the shape.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: w: 1, two-member replica sets, reading from secondaries after writing</span>
    <p>Acknowledged writes can be rolled back after failover; 2 members cannot elect after losing one; secondaries can show stale data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a monotonic or low-cardinality shard key</span>
    <p>Time key: 0 / 10,000. City key: 2 chunks forever (<code>CannotSplit</code>). Lead with a well-spread field or hash.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="md-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful documents (7 customers, 5 restaurants, 10 orders embedding 15 lines; orders reference customer and restaurant by id), plus <code>biteful_big</code> (200,000 orders of the same shape), 100,000 rider pings, a 3-member replica set and a 2-shard cluster.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Embed or reference</td><td>inside, or pointed at?</td><td>lines inside; names need 2 more reads</td><td>when is each right? → embed</td></tr>
    <tr><td>Embed</td><td>owned, read together, bounded</td><td>addresses; ~74,071 orders max; push 16 failed</td><td>what goes outside? → reference</td></tr>
    <tr><td>Reference</td><td>shared, unbounded, independent</td><td>favourites [10, 12]; orphan order 112</td><td>quick rule? → cardinality</td></tr>
    <tr><td>1-few / many / squillions</td><td>decide by "how many"</td><td>100,000 ids = 1.9 MB</td><td>recurring pains → patterns</td></tr>
    <tr><td>Patterns</td><td>lookups, totals, big lists, tiny records</td><td>ext. ref, stats 810, newest 3, overflow 2, 1,670 buckets</td><td>still slow lookups → indexes</td></tr>
    <tr><td>ESR indexes</td><td>fast filter + sort + range</td><td>11 keys vs 13,784 + SORT</td><td>bad data → validation</td></tr>
    <tr><td>Validation</td><td>reject bad documents</td><td>4 rejected, <code>stauts</code> passed</td><td>2-document changes → transactions</td></tr>
    <tr><td>Transactions</td><td>all or nothing across documents</td><td>wallet 500 → 190 → 140 → 40</td><td>one server → replica set</td></tr>
    <tr><td>Replica sets</td><td>survive a crash</td><td>~10 s, 36/36 kept; 1 of 3 = no primary</td><td>one primary for writes → sharding</td></tr>
    <tr><td>Sharding</td><td>scale out data and writes</td><td>time 0/10,000; customer 5,000/5,000; city 2 chunks</td><td>need Mongo at all? → JSONB</td></tr>
  </table>
  <h3>Definitions and rules</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Embed / reference</td><td>child inside parent / child's _id stored; "accessed together, stored together" if bounded</td></tr>
    <tr><td>16 MB</td><td>max BSON document size; <code>bsonsize(doc)</code>, <code>$bsonSize</code></td></tr>
    <tr><td>Cardinality</td><td>1-few: embed · 1-many: child holds parent id · 1-squillions: child holds parent id, never an array · M:N: array of ids</td></tr>
    <tr><td>Extended reference / computed / subset / outlier / bucket</td><td>copy stable fields / store totals / embed the hot part / cap + overflow flag / group per entity per time window</td></tr>
    <tr><td>ESR</td><td>compound index order: Equality, Sort, Range; prefix rule; covered query = 0 docs examined</td></tr>
    <tr><td>Partial / unique / TTL index</td><td>index a subset / no duplicates (missing = null) / delete after N seconds (real dates only)</td></tr>
    <tr><td>$jsonSchema</td><td><code>bsonType</code>, <code>required</code>, <code>enum</code>, <code>minimum</code>, <code>minItems</code>; unlisted fields pass unless <code>additionalProperties: false</code>; existing docs not checked</td></tr>
    <tr><td>Transaction</td><td>session + start/commit/abort; invisible until commit; WriteConflict → TransientTransactionError → retry</td></tr>
    <tr><td>Replica set</td><td>primary + secondaries, oplog, election after ~10 s; majority needed; <code>w: "majority"</code></td></tr>
    <tr><td>Sharding</td><td>shards + mongos + config servers; chunks of the shard key; targeted vs scatter-gather</td></tr>
    <tr><td>Good shard key</td><td>high cardinality, even frequency, not monotonic, in most queries</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Embed</b><p>Owned, read together, bounded: lines, addresses.</p><small>Never for ever-growing lists</small></div>
    <div><b>Reference</b><p>Shared, unbounded, independent: customers, restaurants, orders per customer.</p><small>Index the referencing field</small></div>
    <div><b>Extended reference</b><p>Stable fields shown on every read (names).</p><small>Not for fast-changing values (stock)</small></div>
    <div><b>Bucket</b><p>Millions of small time-stamped records.</p><small>Or a time-series collection</small></div>
    <div><b>Transactions</b><p>Cross-document invariants (order + wallet).</p><small>Not as a habit; embed first</small></div>
    <div><b>JSONB instead</b><p>Relational core with a few flexible attributes.</p><small>MongoDB when documents are the core or you need write scale-out</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Unbounded arrays (16 MB); SQL-style design with <code>$lookup</code> everywhere; references not enforced (order for customer 99); copying fast-changing data; wrong compound order (13,784 vs 11 keys); unique on optional field (<code>null</code> duplicates); TTL on text dates; validator lets <code>stauts</code> through and ignores old docs; no transaction retry; <code>w: 1</code>; 2-member replica sets; stale secondary reads; monotonic or low-cardinality shard keys.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Would you embed a customer's orders in the customer?</td><td>No: unbounded, ~74,000 orders hits 16 MB, and orders are read alone</td></tr>
    <tr><td>Index for <code>{ restaurant_id: 11, ordered_at ≥ X }</code> sorted by amount?</td><td><code>{ restaurant_id: 1, amount: -1, ordered_at: 1 }</code> (ESR)</td></tr>
    <tr><td>Why did <code>stauts</code> pass the validator?</td><td>JSON Schema checks only listed fields; add <code>additionalProperties: false</code></td></tr>
    <tr><td>Why 3 replica-set members, not 2?</td><td>Elections need a majority; 1 of 2 is not one</td></tr>
    <tr><td>Why is <code>ordered_at</code> a bad shard key?</td><td>Monotonic: every new order goes to the top chunk (0 / 10,000)</td></tr>
  </table>

  <h2 id="md-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you defend each design choice with a Biteful number before revealing the answer? The last questions connect the concepts.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Should a customer's orders be embedded in the customer document?</summary><div class="qa-body">No. Orders grow without bound: at ~226 bytes each a customer document would hit 16 MB at about 74,000 orders (growing a document past 16 MB failed with error 10334), every new order rewrites a growing document, and orders are queried on their own. Store orders separately with <code>customer_id</code>; embed each order's lines instead (few, owned, read together).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The order page always shows customer and restaurant names. How do you avoid two extra reads or a <code>$lookup</code>?</summary><div class="qa-body">Extended reference: store <code>customer: { _id: 2, name: "Ben" }</code> and <code>restaurant: { _id: 11, name: "Biryani Bros" }</code> in the order (we back-filled them with a <code>$merge</code> pipeline). When a name changes, <code>updateMany({ "customer._id": 1 }, …)</code> updates the copies (3 orders for Asha); acceptable because names rarely change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you model rider GPS pings, and why not an array in the rider or order?</summary><div class="qa-body">Unbounded (1-squillions): each ping (or bucket) holds the rider/order id. Even an array of ids is too big: 100,000 ObjectIds took 1.9 MB, so ~888,000 is the ceiling. Bucket them per rider per hour: 100,000 pings became 1,670 documents and the indexes shrank from 3,776 KB to 84 KB. Or use a time-series collection.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Dosa Hut's page shows its newest reviews, but it has hundreds. Which pattern, and how do you keep it current?</summary><div class="qa-body">Subset: all reviews in a <code>reviews</code> collection, the newest 3 embedded in the restaurant. On each new review: insert it, and <code>$push: { recent_reviews: { $each: [r], $sort: { at: -1 }, $slice: 3 } }</code>. After 5 reviews the restaurant held Asha (Mar 9), Farah (Mar 7), Ben (Mar 6).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the index for: restaurant 11's orders since 1 March, biggest amount first, top 10.</summary><div class="qa-body">ESR: <code>{ restaurant_id: 1, amount: -1, ordered_at: 1 }</code>. Measured on 200,000 orders: 11 keys and no in-memory sort, versus 13,784 keys plus a SORT with <code>{ restaurant_id, ordered_at, amount }</code>, versus a 200,000-document COLLSCAN with no index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Index <code>{ restaurant_id: 1, amount: -1, ordered_at: 1 }</code>. Which can use it: <code>amount: 520</code>; <code>restaurant_id: 11, amount: 520</code>; a projection of only restaurant_id and amount?</summary><div class="qa-body"><code>amount</code> alone is not a prefix: COLLSCAN of 200,000. With the leading <code>restaurant_id</code>: 6,666 keys for 6,666 results. Filter and projection only on indexed fields (and <code>_id: 0</code>): PROJECTION_COVERED with 0 documents examined.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A unique index on <code>phone</code> fails to build. Why, and what's the fix?</summary><div class="qa-body">Customers without a phone count as <code>phone: null</code>, and several nulls are duplicates. Use a partial unique index: <code>{ unique: true, partialFilterExpression: { phone: { $exists: true } } }</code>; Hari without a phone was accepted, a second "+91 98220 00001" was rejected.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your validator lists <code>status</code> with an enum, yet an order gained a field <code>stauts</code>. Why?</summary><div class="qa-body">JSON Schema checks only properties it lists; unknown fields are allowed by default. Add <code>additionalProperties: false</code> (listing every allowed field including <code>_id</code>). Also remember the validator does not re-check existing documents (legacy order 99 stayed); find them with <code>$nor: [ { $jsonSchema: schema } ]</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need a multi-document transaction in MongoDB, and what does it cost?</summary><div class="qa-body">When one logical change touches several documents that must agree: insert an order and debit the wallet. Inside it, the order was invisible to others until commit (<code>null</code>), an abort left nothing behind, and a concurrent update got <code>WriteConflict</code> (TransientTransactionError → retry). Costs: latency, cache pressure, 60-second default limit, retries, two-phase commit across shards. First ask whether embedding makes it one document.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when a replica set's primary dies? What did we measure?</summary><div class="qa-body">Secondaries miss heartbeats for <code>electionTimeoutMillis</code> (10 s), hold an election, and a caught-up member becomes primary. After <code>kill -9</code> on 27352, writes failed for about 10 seconds, then 27353 became primary; all 36 acknowledged writes were stored, and the restarted node rejoined as a secondary. Writes acknowledged only with <code>w: 1</code> that hadn't replicated could be rolled back; <code>w: "majority"</code> writes survive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a replica set usually have 3 members and not 2?</summary><div class="qa-body">An election needs a majority of voters. With 2 of 3 members shut down, the survivor stepped down to SECONDARY and refused writes (<code>NotWritablePrimary</code>). With 2 members, losing one leaves 1 of 2, not a majority, so a 2-member set cannot survive any failure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pick a shard key for Biteful's orders and justify it with the measurements.</summary><div class="qa-body"><code>{ customer_id: 1, ordered_at: 1 }</code>: writes spread 5,000 / 5,000, and "a customer's orders" goes to one shard (SINGLE_SHARD). <code>ordered_at</code> alone sent all 10,000 new orders to one shard; <code>city</code> has 2 values, so at most 2 chunks (<code>CannotSplit</code>); hashed <code>_id</code> spreads writes (4,985 / 5,015) but every range query is scatter-gather.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team is on PostgreSQL and needs orders with varying lines and options. MongoDB or JSONB?</summary><div class="qa-body">Probably JSONB: the lines go in a <code>jsonb</code> column with a GIN index (<code>@&gt;</code> found the 3 Masala Dosa orders through <code>orders_doc_gin</code>), <code>jsonb_array_elements</code> gives the same per-item revenue as <code>$unwind</code>, and customers, payments and joins stay relational in one database. MongoDB pays off when documents are the main model, nested data is updated in place a lot, or you need built-in write scale-out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does embedding reduce the need for transactions?</summary><div class="qa-body">A write to one document is atomic. Because lines and <code>amount</code> live in one order document, "add a line and raise the total" needs no transaction. Transactions are only needed for invariants that span documents the shape couldn't merge: order + wallet, or order + restaurant stats (the computed pattern's two writes).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do the queries decide both the index and the shard key?</summary><div class="qa-body">The hot query "restaurant's orders since a date, by amount" fixes the ESR index field order. The hot query "my orders" (by customer) makes <code>customer_id</code> the leading shard-key field, so it is targeted to one shard. A shard key that queries never use turns every read into scatter-gather, just as an index that queries never use only slows writes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you apply the extended-reference pattern to a restaurant's rating?</summary><div class="qa-body">Ratings change often, so every change needs an <code>updateMany</code> over all of that restaurant's orders, and any missed update leaves copies that disagree. Extended references are for stable fields (names, price at purchase). For a value that changes often, keep the reference and read it (or <code>$lookup</code>) when needed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is the bucket pattern also an indexing decision?</summary><div class="qa-body">Index size grows with the number of documents. 100,000 one-ping documents needed 3,776 KB of indexes; 1,670 hourly buckets needed 84 KB. Indexes must fit in RAM to stay fast, so reducing document count (bucketing) is often what keeps the indexes, and therefore the queries, fast.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: back to the full track.</b> This closes the MongoDB group. Compare each decision with its relational counterpart: <a class="xref" data-note="sql_modeling">Data Modeling</a> (normalise vs shape for queries), <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a> (the same B-trees and plans), and <a class="xref" data-note="sql_transactions">Transactions, Concurrency &amp; Scaling</a> (ACID, replication and sharding from the SQL side), and use <a class="xref" data-note="db_types">Types of Databases</a> to choose between them for a new system.</div>
</main>
`
});
