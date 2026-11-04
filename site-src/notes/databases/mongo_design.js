// notes/databases/mongo_design.js — Schema Design & Scaling
Object.assign(TOPIC_CONTENT, {
  "mongo_design": `<main>
  <h1>Schema Design &amp; Scaling</h1>
  <div class="where"><span>Databases</span><span>MongoDB</span><span>Schema Design &amp; Scaling</span></div>
  <p class="lead">Schema design in MongoDB means deciding what goes inside each document and what lives in a separate collection, and then making that shape fast, safe and able to grow. It matters more than in SQL, because in SQL normalisation gives one standard answer for every relationship, while in MongoDB the shape of the documents decides which queries are a single read, which writes are automatically atomic, and which ones need joins or transactions. The previous two notes worked with a shape we were simply handed: each Biteful order <em>embeds</em> its lines and <em>references</em> its customer and restaurant by id. This note asks whether that was right, and follows the question all the way out: the 16 MB document limit, rules of thumb by cardinality, five design patterns, indexes and the ESR rule, schema validation, transactions, replica sets, sharding, and when PostgreSQL's JSONB would do the job instead. Commands are in mongosh syntax; where they have output, it comes from running the equivalent pymongo code against <strong>mongomock</strong>, an in-memory stand-in for a MongoDB server. Features mongomock cannot imitate (explain plans, validation, transactions, replication, sharding, TTL) are shown as commands with the result explained in words; the JSONB comparison ran on a real PostgreSQL 16 database.</p>

  <h2 id="md-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Schema Design &amp; Scaling</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Shape</div>
        <ul>
          <li>Data read together is stored together, if small and bounded</li>
          <li>Embed: owned, few, read with the parent (lines, addresses)</li>
          <li>Reference: shared, unbounded, independent (customers, orders)</li>
          <li>16 MB per document: never embed ever-growing lists</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li>Extended reference: copy stable fields (names)</li>
          <li>Computed: store totals, update on write</li>
          <li>Subset / outlier: embed the hot part, overflow the rest</li>
          <li>Bucket: one document per entity per time window</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Speed and safety</div>
        <ul>
          <li>ESR: Equality, Sort, Range in a compound index</li>
          <li>Prefix rule, covered queries, partial and TTL indexes</li>
          <li><code>$jsonSchema</code> validator rejects bad writes</li>
          <li>Transactions for changes that span documents</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scale</div>
        <ul>
          <li>Replica set: 3 copies, automatic failover (~10 s)</li>
          <li>Majority needed to elect and to confirm writes</li>
          <li>Sharding: split by a shard key across machines</li>
          <li>Bad keys: monotonic, low cardinality, unused by queries</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="md-question"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Embed or Reference?</span><span class="rm-sub">the first design question</span></div></div>
      <div class="rm-item rm-done" data-target="md-embed"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">When to Embed</span><span class="rm-sub">and the 16 MB limit</span></div></div>
      <div class="rm-item rm-done" data-target="md-ref"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">When to Reference</span><span class="rm-sub">shared, unbounded, many-to-many</span></div></div>
      <div class="rm-item rm-done" data-target="md-card"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Rules of Thumb by Cardinality</span><span class="rm-sub">one-to-few, many, squillions</span></div></div>
      <div class="rm-item rm-done" data-target="md-pat"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Design Patterns</span><span class="rm-sub">five standard fixes on Biteful</span></div></div>
      <div class="rm-item rm-done" data-target="md-idx"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Indexes and the ESR Rule</span><span class="rm-sub">field order in compound indexes</span></div></div>
      <div class="rm-item rm-done" data-target="md-valid"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Schema Validation</span><span class="rm-sub">rejecting bad documents at the door</span></div></div>
      <div class="rm-item rm-done" data-target="md-txn"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Multi-Document Transactions</span><span class="rm-sub">order + wallet, all or nothing</span></div></div>
      <div class="rm-item rm-done" data-target="md-repl"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Replica Sets</span><span class="rm-sub">surviving a server crash</span></div></div>
      <div class="rm-item rm-done" data-target="md-shard"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Sharding and the Shard Key</span><span class="rm-sub">splitting data and writes across machines</span></div></div>
      <div class="rm-item rm-done" data-target="md-pg"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">MongoDB or PostgreSQL JSONB?</span><span class="rm-sub">do you need a second database?</span></div></div>
      <div class="rm-item rm-done" data-target="md-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">errors that show up later</span></div></div>
      <div class="rm-item rm-done" data-target="md-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">rules, patterns, indexes, scaling</span></div></div>
      <div class="rm-item rm-done" data-target="md-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">design questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="md-question"><span class="num">01</span>Embed or Reference?</h2>
  <p>In SQL, <a class="xref" data-note="sql_modeling">normalisation</a> gives the same answer for every relationship: put the related data in its own table and connect it with a foreign key. Documents allow two answers, and Biteful's orders already use both. To <strong>embed</strong> is to put the related data inside the parent document, as the order lines sit inside each order. To <strong>reference</strong> is to keep the related data in its own collection and store only its <code>_id</code>, as each order stores <code>customer_id: 3</code>. The difference shows up the moment the app displays order 108 with the customer's and restaurant's names:</p>
  <div class="fx" data-lang="mongo">db.orders.findOne({ _id: 108 }, { customer_id: 1, restaurant_id: 1, items: 1 })
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
  <p>The lines, including the coffee's "less sugar" option, arrived with the order in the very first read. The two names needed two more round trips to the server, because Chen and Dosa Hut are referenced rather than embedded. (A <a class="xref" data-note="mongo_aggregation">$lookup</a> could fetch them in one call, but the server still does those two extra lookups.)</p>
  <p>Think of a tiffin box. It packs today's meal inside it, roti, sabzi and dal, so you open one box and eat: that is embedding. But the box does not contain the kitchen, or every meal you have ever eaten; it carries a label saying which kitchen it came from: that is referencing. The rule of thumb is the same for documents: pack what you consume together, and point to what is big, shared, or keeps growing.</p>
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
  </svg><figcaption>Biteful's current shape: lines embedded in the order; customer and restaurant referenced by id.</figcaption></figure>
  <p>The figure shows why Biteful's shape looks the way it does. The lines are owned by the order, there are only a few of them, and they are always shown with it, so they are embedded. The customer and the restaurant are shared by many orders, change on their own (a new address, a new rating) and have their own pages, so they are referenced. Each choice has costs, summarised here:</p>
  <table class="tbl">
    <tr><th></th><th>Embed</th><th>Reference</th></tr>
    <tr><td>Read the whole thing</td><td>1 read</td><td>1 read + 1 per referenced document (or a <code>$lookup</code>)</td></tr>
    <tr><td>Write parent and child together</td><td>atomic (one document)</td><td>two documents: a transaction if they must agree</td></tr>
    <tr><td>Child shared by many parents</td><td>copied into each (duplication)</td><td>stored once</td></tr>
    <tr><td>Child list grows without limit</td><td>the document grows toward 16 MB</td><td>no problem</td></tr>
    <tr><td>Query the children on their own</td><td>needs <code>$unwind</code></td><td>direct</td></tr>
  </table>
  <p>The guiding principle that falls out of this table is often stated as <strong>data that is accessed together should be stored together</strong>, with the condition that it stays small and bounded. There are two opposite ways to get it wrong. "Documents can nest, so nest everything" (all of a customer's orders inside the customer) breaks as the data grows. "Design it like SQL" (one collection per table, <code>$lookup</code> on every request) brings back joins that MongoDB is not built around. The right approach is to decide each relationship separately, starting from the queries the application runs most often. The next three sections turn that into concrete rules.</p>

  <h2 id="md-embed"><span class="num">02</span>When to Embed</h2>
  <p>Embedding lines in orders made the order page a single read and made "add a vada and raise the total" one atomic write. So why not go one step further and embed each customer's orders inside the customer document, making "Asha's order history" a single read too? To answer, it helps to state precisely when embedding is right. Embed a child when it is <strong>owned</strong> by the parent (a line has no life outside its order), <strong>read together</strong> with the parent, and <strong>few and bounded</strong> in number (an order has a handful of lines). A customer's saved addresses meet all three conditions:</p>
  <div class="fx" data-lang="mongo">db.customers.updateOne({ _id: 1 }, { $set: { addresses: [
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
  <p>Two addresses, read every time Asha checks out, belonging to nobody else: a perfect fit. Orders inside the customer fail the third condition, and the reason is size. A document can hold at most 16 MB of BSON. The <code>bsonsize</code> function reports how many bytes a document takes, so we can work out how many orders would fit:</p>
  <div class="fx" data-lang="mongo">bsonsize(db.orders.findOne({ _id: 102 }))
const docs = db.orders.find().toArray()
const avg = docs.reduce((sum, d) =&gt; sum + bsonsize(d), 0) / docs.length
avg
Math.floor(16 * 1024 * 1024 / avg)</div>
  <div class="fx" data-lang="text">246
226.5
74071</div>
  <p>Order 102 takes 246 bytes, and Biteful's orders average 226.5 bytes. Dividing the 16 MB limit (16,777,216 bytes) by that average gives about <strong>74,071 orders</strong>. That sounds like a lot, but a busy corporate account could reach it, and the hard limit is not even the first problem. Long before it, every new order makes the server rewrite an ever larger document, and every "show my profile" page drags the whole history across the network. At the limit itself, the server refuses the write. The loop below grows one document by 1 MB per push, each 1 MB string standing in for about 4,600 orders (mongomock does not enforce the size limit, so no output is shown):</p>
  <div class="fx" data-lang="mongo">db.scratch.insertOne({ _id: "asha_all_orders", orders: [] })
const oneMB = "x".repeat(1024 * 1024)          // stands in for ~4,600 orders
for (let i = 1; i &lt;= 20; i++) {
  db.scratch.updateOne({ _id: "asha_all_orders" }, { $push: { orders: oneMB } })
}</div>
  <p>On a real server, pushes 1 to 15 succeed and the document reaches 15 MB; push 16 is refused with an error saying the resulting document would be larger than 16,777,216 bytes. For an application, that means a production outage for that one customer: no new order can ever be added to the document. Think of a wallet: it holds today's cash and a couple of cards, but if you kept every receipt you were ever given in it, it would first become slow to search and finally stop closing.</p>
  <p>So the full rule for embedding has four parts: the child is owned by the parent, read together with it, bounded in number, and, if it is a copy of data from elsewhere, meant as a snapshot (like the <code>unit_price</code> on each order line, which records the price paid that day). Never embed an array that grows without limit, such as all of a customer's orders, all of a rider's GPS pings or all the comments on a post. "Would you embed a user's posts inside the user document?" is a classic interview question, and the answer is no, for exactly this reason.</p>

  <h2 id="md-ref"><span class="num">03</span>When to Reference</h2>
  <p>A restaurant has thousands of orders; a customer's history grows without end; "Chen's favourite restaurants" links many customers to many restaurants. Embedding fails for all three, so they need references. Reference related data when it is <strong>shared</strong> (Dosa Hut appears in many orders), <strong>unbounded</strong> (orders per customer), <strong>changes independently</strong> (a restaurant's rating), or is <strong>queried on its own</strong> (the restaurant's page). The reference usually sits on the "many" side: each order holds <code>customer_id</code>, rather than the customer holding a list of order ids. A many-to-many relationship can use an array of ids on one side, as long as that array stays small, and a document can even refer to another document in the same collection, as <code>referred_by</code> does:</p>
  <div class="fx" data-lang="mongo">db.customers.updateOne({ _id: 3 }, { $set: { favourite_restaurants: [10, 12] } })
const chen = db.customers.findOne({ _id: 3 })
db.restaurants.find({ _id: { $in: chen.favourite_restaurants } }, { name: 1 })
db.customers.find({ referred_by: 1 }, { name: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
[ { _id: 10, name: 'Dosa Hut' }, { _id: 12, name: 'Pizza Point' } ]
[ { _id: 2, name: 'Ben' }, { _id: 3, name: 'Chen' } ]</div>
  <p>Chen's favourites are stored as two ids, and turning them into names took a second query with <code>$in</code>. Asha's referrals were found by querying the self-reference <code>referred_by: 1</code>. These are sometimes called <strong>application-level joins</strong>: your code does the work a SQL join would do. Think of a library card catalogue, where each card says "see shelf 10" instead of containing the book; many cards can point at the same shelf. But nothing stops a card from pointing at a shelf that was removed, and MongoDB is the same:</p>
  <div class="fx" data-lang="mongo">db.orders.insertOne({ _id: 112, customer_id: 99, restaurant_id: 10, status: "pending", amount: 120,
                      items: [ { item: "Masala Dosa", qty: 1, unit_price: 120 } ] })
db.orders.aggregate([                                   // the orphan finder
  { $lookup: { from: "customers", localField: "customer_id", foreignField: "_id", as: "c" } },
  { $match: { c: { $size: 0 } } },
  { $project: { customer_id: 1 } }
])
db.orders.deleteOne({ _id: 112 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: 112 }
[ { _id: 112, customer_id: 99 } ]
{ acknowledged: true, deletedCount: 1 }</div>
  <p>An order for customer 99, who does not exist, was accepted without complaint. MongoDB has no foreign keys, so <strong>referential integrity</strong> (the guarantee that every reference points at something real) is the application's responsibility. The pipeline in the middle is the standard orphan finder: look up each order's customer and keep the orders whose lookup came back empty. It found order 112. PostgreSQL's foreign key would have refused the insert, as it refused deleting Asha in <a class="xref" data-note="mongo_basics">Documents &amp; CRUD</a>.</p>
  <p>Two warnings come with references. Every reference is a lookup, so the field you look up by must be indexed (for example <code>orders.customer_id</code>), or each lookup scans a whole collection. And an array of ids on the "one" side grows like any other array: a <code>customer.order_ids</code> list has the same 16 MB problem as embedded orders, only slower to arrive.</p>

  <h2 id="md-card"><span class="num">04</span>Rules of Thumb by Cardinality</h2>
  <p>Addresses per customer (two), orders per customer (hundreds over the years), GPS pings per delivery rider (one every few seconds, forever): in SQL these are all simply "one-to-many", and all get the same design. In MongoDB they should not. The single most useful input to a document design is the <strong>cardinality</strong> of each relationship: how many children one parent can have, and whether that number has a limit. The usual rules are:</p>
  <table class="tbl">
    <tr><th>Cardinality</th><th>Biteful example</th><th>Design</th><th>Why</th></tr>
    <tr><td><strong>One-to-few</strong> (small, bounded)</td><td>customer → addresses; order → lines</td><td>embed an array of sub-documents</td><td>one read, atomic, tiny</td></tr>
    <tr><td><strong>One-to-many</strong> (hundreds to thousands)</td><td>customer → orders; restaurant → menu items</td><td>child holds the parent's id (or the parent holds a bounded array of ids)</td><td>children are read on their own and keep growing</td></tr>
    <tr><td><strong>One-to-squillions</strong> (unbounded)</td><td>rider → GPS pings; order → tracking events</td><td>child holds the parent's id; <strong>never</strong> an array in the parent</td><td>even an array of ids would hit 16 MB</td></tr>
    <tr><td><strong>Many-to-many</strong></td><td>customers ↔ favourite restaurants</td><td>array of ids on the side you query from</td><td>bounded per customer</td></tr>
  </table>
  <p>"Squillions" is an informal word for an unbounded, ever-growing number of children. The claim that even an array of ids would overflow is easy to check by measuring an array of 100,000 ObjectIds:</p>
  <div class="fx" data-lang="mongo">const s = bsonsize({ order_ids: Array.from({ length: 100000 }, () =&gt; new ObjectId()) })
s
Math.floor(16 * 1024 * 1024 / (s / 100000))</div>
  <div class="fx" data-lang="text">1888911
888195</div>
  <p>100,000 ids take 1,888,911 bytes, about 18.9 bytes each: 12 bytes for the id itself, plus a type byte and the element's position, which BSON stores as a text key ("0", "1", "2", …) for every array element. So an array of ids in the parent tops out at roughly <strong>888,000</strong> children, and a rider sending a ping every 5 seconds produces that many in about seven weeks.</p>
  <p>A family photo album keeps the few wedding photos inside it (one-to-few). A school keeps one register per class, and each student's record names the class (one-to-many). A CCTV system never stores its frames inside the camera's record; each frame is stamped with the camera's number (one-to-squillions). For each relationship, ask two questions: how many children, at most, over the data's whole lifetime? And are the children read together with the parent, or on their own? Estimate growth honestly: Biteful's first restaurant had 20 reviews, but a viral one can have thousands, which is exactly the situation the outlier pattern in the next section handles.</p>

  <h2 id="md-pat"><span class="num">05</span>Design Patterns</h2>
  <p>The embed/reference rules give a sound first shape. Then real usage starts to complain. The order page does two extra reads for names. The owner's dashboard re-adds every order on every refresh. Dosa Hut's page shows its newest reviews, but there are hundreds. One restaurant goes viral. Rider pings become 100,000 tiny documents. Each of these complaints is common enough to have a well-known fix, called a <strong>design pattern</strong>. Most of them are forms of <strong>denormalisation</strong>: deliberately storing data in more than one place, or storing pre-computed results, to make reads cheaper at the cost of extra work on writes.</p>
  <table class="tbl">
    <tr><th>Pattern</th><th>Problem it fixes</th><th>Idea</th><th>Biteful example</th></tr>
    <tr><td><strong>Extended reference</strong></td><td>a lookup on every read</td><td>copy the few fields you always show from the referenced document</td><td>customer and restaurant names inside each order</td></tr>
    <tr><td><strong>Computed</strong></td><td>recomputing the same totals on every read</td><td>store the result and update it on each write</td><td><code>amount</code>; restaurant <code>stats</code></td></tr>
    <tr><td><strong>Subset</strong></td><td>a big related list of which only a little is shown</td><td>embed only the most-used part; keep the rest in its own collection</td><td>newest 3 reviews inside the restaurant</td></tr>
    <tr><td><strong>Outlier</strong></td><td>a few parents are far bigger than the rest</td><td>design for the typical case; flag and overflow the rare giant</td><td>review cap plus <code>has_overflow</code></td></tr>
    <tr><td><strong>Bucket</strong></td><td>millions of tiny time-stamped records</td><td>group them into one document per entity per time window</td><td>GPS pings per rider per hour</td></tr>
  </table>
  <p>A delivery slip copies the customer's name and phone number so the rider never has to look them up (extended reference). A bill has its total written at the bottom (computed). A restaurant's front window shows its three latest reviews, not all of them (subset). And a milkman keeps one page per house per month with thirty ticks on it, not one page per bottle (bucket). Here is each pattern on Biteful.</p>
  <p>The <strong>extended reference</strong> keeps the reference but copies the fields that are always displayed. The pipeline below joins each order to its customer and restaurant and writes the names back into the orders; <code>$out</code> rewrites the collection with the pipeline's result and prints nothing. (On a real server, <code>$merge</code> with <code>whenMatched: "merge"</code> would add the fields in place.)</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $lookup: { from: "customers",   localField: "customer_id",   foreignField: "_id", as: "c" } },
  { $lookup: { from: "restaurants", localField: "restaurant_id", foreignField: "_id", as: "r" } },
  { $addFields: { customer:   { _id: "$customer_id",   name: { $first: "$c.name" } },
                  restaurant: { _id: "$restaurant_id", name: { $first: "$r.name" } } } },
  { $project: { c: 0, r: 0 } },
  { $out: "orders" }                       // rewrite the collection with the new fields
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
  <p>Order 102 now carries <code>Ben</code> and <code>Biryani Bros</code> inside it, so the order page is a single read with no lookup. The last two lines show the price: when Asha changes her name, both her customer document <em>and</em> every order holding the copy must be updated, three orders here and possibly thousands in production. That is acceptable for a field that rarely changes, and for orders it is arguably correct anyway, since the name at the time of ordering is a snapshot. Copying a value that changes often, such as a restaurant's rating or a stock level, would be a mistake: every change would need a huge update, and any missed copy would silently disagree with the original.</p>
  <p>The <strong>computed</strong> pattern stores a result instead of recomputing it. Biteful's <code>amount</code> already is one: the bill total is stored, so nobody re-adds the lines. The owner's dashboard can use the same idea, storing each restaurant's delivered orders and revenue, built once from the orders and then kept up to date as orders are delivered:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$restaurant_id", orders: { $sum: 1 }, revenue: { $sum: "$amount" } } }
]).forEach(s =&gt; db.restaurants.updateOne({ _id: s._id },
                                         { $set: { stats: { orders: s.orders, revenue: s.revenue } } }))
// later: order 110 is delivered, so its restaurant's stats are bumped
db.orders.updateOne({ _id: 110, status: "pending" }, { $set: { status: "delivered", delivery_minutes: 35 } })
db.restaurants.updateOne({ _id: 10 }, { $inc: { "stats.orders": 1, "stats.revenue": 310 } })
db.restaurants.find({}, { name: 1, stats: 1 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
[
  { _id: 10, name: 'Dosa Hut', stats: { orders: 3, revenue: 810 } },
  { _id: 11, name: 'Biryani Bros', stats: { orders: 3, revenue: 1230 } },
  { _id: 12, name: 'Pizza Point', stats: { orders: 2, revenue: 900 } },
  { _id: 13, name: 'Green Bowl' },
  { _id: 14, name: 'Momo Magic' }
]</div>
  <p>The dashboard now reads five small documents instead of aggregating every order. When order 110 was delivered, Dosa Hut's stats went from 2 orders and ₹500 to 3 orders and ₹810. Green Bowl and Momo Magic have no delivered orders, so they have no stats. Notice that the delivery touched <em>two</em> documents, the order and the restaurant. If the server crashed between those two writes, the stats would drift away from the truth; section 08 shows how a transaction prevents that.</p>
  <p>The <strong>subset</strong> pattern embeds only the part of a large list that is used most. All reviews go into a <code>reviews</code> collection, while the restaurant document keeps just the newest three, maintained by a single <code>$push</code> with three modifiers:</p>
  <div class="fx" data-lang="mongo">const newReviews = [
  { restaurant_id: 10, by: "Asha",  stars: 5, at: ISODate("2026-03-02"), text: "Crisp dosa" },
  { restaurant_id: 10, by: "Chen",  stars: 4, at: ISODate("2026-03-05"), text: "Coffee too sweet" },
  { restaurant_id: 10, by: "Ben",   stars: 5, at: ISODate("2026-03-06"), text: "Fast delivery" },
  { restaurant_id: 10, by: "Farah", stars: 3, at: ISODate("2026-03-07"), text: "Chutney missing" },
  { restaurant_id: 10, by: "Asha",  stars: 5, at: ISODate("2026-03-09"), text: "Best in Pune" } ]
for (const r of newReviews) {
  db.reviews.insertOne(r)                                            // full history
  db.restaurants.updateOne({ _id: 10 }, { $push: { recent_reviews: {  // newest 3 only
      $each: [ { by: r.by, stars: r.stars, at: r.at } ], $sort: { at: -1 }, $slice: 3 } } })
}
db.reviews.countDocuments({ restaurant_id: 10 })
db.restaurants.findOne({ _id: 10 }, { name: 1, recent_reviews: 1 })</div>
  <div class="fx" data-lang="text">5
{
  _id: 10,
  name: 'Dosa Hut',
  recent_reviews: [
    { by: 'Asha', stars: 5, at: ISODate('2026-03-09T00:00:00.000Z') },
    { by: 'Farah', stars: 3, at: ISODate('2026-03-07T00:00:00.000Z') },
    { by: 'Ben', stars: 5, at: ISODate('2026-03-06T00:00:00.000Z') }
  ]
}</div>
  <p>All five reviews are in the <code>reviews</code> collection, the full history. The restaurant document holds only the newest three: Asha's (9 March), Farah's (7 March) and Ben's (6 March). The modifiers did the work: <code>$each</code> added the review, <code>$sort: { at: -1 }</code> ordered the array newest first, and <code>$slice: 3</code> cut it back to three elements, all in one atomic update. The restaurant page shows its latest reviews in one read, and only "see all reviews" queries the separate collection.</p>
  <p>The <strong>outlier</strong> pattern handles the situation where most parents are small and a rare few are huge. Most restaurants get few reviews, so embedding them all is fine, except for the occasional viral one. The trick is the filter <code>"reviews.2": { $exists: false }</code>, which matches only while the array has fewer than three elements (position 2 is the third element). When it stops matching, the review goes to an overflow collection and the restaurant is flagged:</p>
  <div class="fx" data-lang="mongo">const CAP = 3                                    // tiny cap for the demo; think 200 in real life
function addReview(rid, review) {
  const res = db.restaurants.updateOne(
    { _id: rid, ["reviews." + (CAP - 1)]: { $exists: false } },   // fewer than CAP embedded?
    { $push: { reviews: review } })
  if (res.matchedCount === 0) {                  // full: send it to the overflow collection
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
  <div class="fx" data-lang="text">[ 'embedded', 'embedded', 'embedded', 'overflow', 'overflow' ]
embedded
[
  {
    _id: 13,
    name: 'Green Bowl',
    reviews: [ { by: 'A', stars: 4 }, { by: 'B', stars: 4 }, { by: 'C', stars: 4 } ],
    has_overflow: true
  },
  { _id: 14, name: 'Momo Magic', reviews: [ { by: 'Gita', stars: 5 } ] }
]
2</div>
  <p>Green Bowl took three embedded reviews; reviews D and E went to <code>review_overflow</code>, and <code>has_overflow: true</code> was set. Momo Magic's single review stayed embedded. Code that reads reviews checks the flag and fetches the overflow only for the rare outlier, so the common case stays a single read. (The cap of three is tiny for the demo; in real life it might be 200.)</p>
  <p>The <strong>bucket</strong> pattern groups many tiny time-stamped records into fewer, larger documents. Here are 100,000 GPS pings (10 riders, one ping per minute each), first stored one document per ping and then bucketed into one document per rider per hour:</p>
  <div class="fx" data-lang="mongo">const t0 = Date.UTC(2026, 2, 2, 6, 0), rows = []
for (let m = 0; m &lt; 100000; m++)                   // 10 riders, one GPS ping per minute each
  rows.push({ rider: m % 10, ts: new Date(t0 + Math.floor(m / 10) * 60000),
              lat: 18.52 + (m % 97) / 10000, lng: 73.85 + (m % 89) / 10000 })
db.pings.insertMany(rows)
db.pings.aggregate([
  { $group: { _id: { rider: "$rider",
                     hour: { $dateToString: { format: "%Y-%m-%dT%H:00", date: "$ts" } } },
              n: { $sum: 1 }, points: { $push: { ts: "$ts", lat: "$lat", lng: "$lng" } } } },
  { $project: { _id: 0, rider: "$_id.rider", hour: "$_id.hour", n: 1, points: 1 } },
  { $out: "pings_hourly" } ])
function kb(c) { return Math.round(c.find().toArray().reduce((s, d) =&gt; s + bsonsize(d), 0) / 1024) }
db.pings.countDocuments()
kb(db.pings)
db.pings_hourly.countDocuments()
kb(db.pings_hourly)
const b = db.pings_hourly.find({ rider: 3 }).sort({ hour: 1 }).next()
({ rider: b.rider, hour: b.hour, n: b.n, first_point: b.points[0] })</div>
  <div class="fx" data-lang="text">100000
6934
1670
4704
{
  rider: 3,
  hour: '2026-03-02T06:00',
  n: 60,
  first_point: {
    ts: ISODate('2026-03-02T06:00:00.000Z'),
    lat: 18.5203,
    lng: 73.85029999999999
  }
}</div>
  <p>The same information now takes <strong>60 times fewer documents</strong> (100,000 → 1,670) and about a third less data (6,934 KB → 4,704 KB), mainly because the field names <code>rider</code>, <code>ts</code>, <code>lat</code> and <code>lng</code> are no longer repeated in every ping. Each bucket holds up to 60 points, as rider 3's first hour shows. The bigger win is in indexes: an index holds one entry per document, so an index on <code>{ rider, hour }</code> over the buckets has 1,670 entries instead of 100,000. Indexes must fit in memory to be fast, so cutting the number of documents is often what keeps a time-series workload fast. MongoDB's <strong>time-series collections</strong> (version 5.0 and later) apply this bucketing automatically.</p>

  <h2 id="md-idx"><span class="num">06</span>Indexes and the ESR Rule</h2>
  <p>Good document shapes still need fast lookups. Biteful's restaurant app shows "your orders since 3 March, biggest first, top 2". Without an index, the server must read every order, keep the matching ones and sort them. An <strong>index</strong> is a sorted structure (a B-tree, as in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>) holding the values of one or more fields, each entry pointing at its document, so the server can jump to the values it needs instead of reading everything. A <strong>compound index</strong> covers several fields: it is sorted by the first field, then by the second within equal values of the first, and so on, like a phone directory sorted by city, then surname, then first name. The question is which <em>order</em> to put the fields in.</p>
  <p>The directory picture explains the most important rule first. "Pune, Kulkarni, in first-name order" is a quick flip: open at Pune, then at Kulkarni, and read down. But "everyone named Asha, in any city" cannot use the directory at all, because first names are only sorted <em>within</em> each city and surname. This is the <strong>prefix rule</strong>: a compound index can serve queries on its leading fields (city; city and surname; all three), but not on a later field alone.</p>
  <p>Our query has three kinds of condition: an <strong>E</strong>quality (<code>restaurant_id: 11</code>), a <strong>S</strong>ort (<code>amount</code>, descending) and a <strong>R</strong>ange (<code>ordered_at</code> from 3 March). First, the answer itself:</p>
  <div class="fx" data-lang="mongo">db.orders.find({ restaurant_id: 11, ordered_at: { $gte: ISODate("2026-03-03T00:00:00+05:30") } },
               { amount: 1, ordered_at: 1 }).sort({ amount: -1 }).limit(2)</div>
  <div class="fx" data-lang="text">[
  { _id: 109, ordered_at: ISODate('2026-03-05T14:35:00.000Z'), amount: 600 },
  { _id: 106, ordered_at: ISODate('2026-03-04T07:10:00.000Z'), amount: 180 }
]</div>
  <p>Biryani Bros (11) has three orders: 102 (₹450, 2 March), 106 (₹180, 4 March) and 109 (₹600, 5 March). Since 3 March, biggest first, the top two are 109 and 106. Now walk the two candidate index orders by hand, as the server would:</p>
  <table class="tbl">
    <tr><th>Index order</th><th>Restaurant 11's entries, in index order</th><th>What the server does</th><th>Entries read</th><th>Extra sort?</th></tr>
    <tr><td>E, R, S: <code>{ restaurant_id, ordered_at, amount }</code></td><td>(11, 2 Mar, 450), (11, 4 Mar, 180), (11, 5 Mar, 600)</td><td>jump to (11, 3 Mar), read 106 and 109; they come out in date order, so sort them by amount in memory</td><td>2</td><td><strong>yes</strong></td></tr>
    <tr><td>E, S, R: <code>{ restaurant_id, amount: -1, ordered_at }</code></td><td>(11, 600, 5 Mar), (11, 450, 2 Mar), (11, 180, 4 Mar)</td><td>walk in amount order: 600 ✓, 450 ✗ (before 3 March, skip), 180 ✓; two found, stop</td><td>3</td><td><strong>no</strong></td></tr>
  </table>
  <p>On three entries, E-R-S even looks cheaper. Now imagine Biryani Bros with 15,000 orders since March and the app asking for the top 10. With E-R-S, the server must read <em>all</em> 15,000 matching entries (the range gives them in date order, not amount order) and sort them in memory just to keep 10. With E-S-R, the entries for restaurant 11 are already in amount order, so the server walks from the biggest amount down, checks each entry's date as it goes, and stops as soon as it has 10, reading only a little more than 10 entries. That is the <strong>ESR rule</strong>: in a compound index, put <strong>E</strong>quality fields first (they narrow the index to one slice), then the <strong>S</strong>ort field (inside that slice the order is already right, so no sort is needed and a limit can stop early), then <strong>R</strong>ange fields (checked while walking). You confirm it with <code>explain</code>, which mongomock cannot run, so the commands are shown without output:</p>
  <div class="fx" data-lang="mongo">const q = { restaurant_id: 11, ordered_at: { $gte: ISODate("2026-03-03T00:00:00+05:30") } }
db.orders.find(q, { amount: 1 }).sort({ amount: -1 }).limit(2)
db.orders.createIndex({ restaurant_id: 1, ordered_at: 1, amount: -1 })     // E, R, S
db.orders.find(q).sort({ amount: -1 }).limit(2).explain("executionStats")
db.orders.dropIndex("restaurant_id_1_ordered_at_1_amount_-1")
db.orders.createIndex({ restaurant_id: 1, amount: -1, ordered_at: 1 })     // E, S, R
db.orders.find(q).sort({ amount: -1 }).limit(2).explain("executionStats")</div>
  <p>On a real server the first plan shows the stages <code>FETCH ← SORT ← IXSCAN</code>, an index scan followed by an in-memory <code>SORT</code> stage; the second shows <code>LIMIT ← FETCH ← IXSCAN</code>, with no sort at all. In any explain output, the numbers worth comparing are <code>totalKeysExamined</code> and <code>totalDocsExamined</code> against <code>nReturned</code>; when they are much larger than the number of results, the index is doing work that gets thrown away.</p>
  <p>Several other index ideas follow from the same picture. A <strong>covered query</strong> is one whose filter and returned fields are all in the index (with <code>_id</code> excluded), so the server answers from the index alone and examines zero documents. A <strong>multikey index</strong> is an index on an array field, such as <code>items.item</code>, with one entry per array element, which is what makes "orders containing a Masala Dosa" fast. Some conditions use an index but still read far more than they return: a regular expression anchored at the start (<code>/^Mas/</code>) reads a tight range of the sorted values, but an unanchored or case-insensitive one (<code>/dosa/i</code>) must examine every key; and <code>$ne</code> or <code>$nin</code> match most of the collection, so they read most of the index. Finally, every index has a cost: it slows down every insert and update that touches its fields and takes memory, so drop indexes nobody uses (the <code>$indexStats</code> stage shows usage).</p>
  <p>Two special kinds of index solve common problems. Suppose Biteful wants phone numbers to be unique. A plain unique index treats a missing field as <code>null</code>, so several customers without a phone count as duplicates of each other. A <strong>partial index</strong> indexes only the documents that match a filter:</p>
  <div class="fx" data-lang="mongo">db.customers.createIndex({ phone: 1 }, { unique: true })        // several customers have no phone
db.customers_v2.createIndex({ phone: 1 }, { unique: true,
                                            partialFilterExpression: { phone: { $exists: true } } })
db.customers_v2.insertMany(db.customers.find().toArray())      // copy the 7 customers
db.customers_v2.updateOne({ _id: 1 }, { $set: { phone: "+91 98220 00001" } })
db.customers_v2.insertOne({ _id: 8, name: "Hari" })                              // no phone
db.customers_v2.insertOne({ _id: 9, name: "Isha", phone: "+91 98220 00001" })    // Asha's number</div>
  <div class="fx" data-lang="text">DuplicateKeyError: E11000 Duplicate Key Error
'phone_1'
{
  acknowledged: true,
  insertedIds: { '0': 1, '1': 2, '2': 3, '3': 4, '4': 5, '5': 6, '6': 7 }
}
{ acknowledged: true, insertedId: null, matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
{ acknowledged: true, insertedId: 8 }
DuplicateKeyError: E11000 Duplicate Key Error</div>
  <p>The plain unique index could not be built on <code>customers</code>, because seven customers have no phone and they all count as <code>phone: null</code> (a real server's message names the duplicate key, <code>{ phone: null }</code>). The partial index, restricted to documents where <code>phone</code> exists, has no such problem: the copied customers, none with a phone, went in; Asha got a number; Hari, without a phone, was accepted; and Isha, with Asha's number, was rejected as a duplicate.</p>
  <p>A <strong>TTL index</strong> ("time to live") deletes documents automatically a set number of seconds after the time stored in a date field, which is ideal for one-time passwords, sessions and temporary carts (mongomock has no TTL monitor, so no output):</p>
  <div class="fx" data-lang="mongo">db.otp_codes.createIndex({ created_at: 1 }, { expireAfterSeconds: 60 })
db.otp_codes.insertMany([
  { _id: "old",  code: "4821", created_at: new Date(Date.now() - 5 * 60 * 1000) },
  { _id: "new",  code: "7730", created_at: new Date() },
  { _id: "text", code: "1111", created_at: "2026-03-02 12:10" } ])</div>
  <p>A background task on the server runs about once a minute and deletes documents whose <code>created_at</code> is older than 60 seconds, so the five-minute-old code disappears within a minute or so, and the fresh one a minute later. The third document never expires, because its <code>created_at</code> is a string: TTL indexes only understand real dates. This is one more reason to store dates as dates.</p>

  <h2 id="md-valid"><span class="num">07</span>Schema Validation</h2>
  <p>Indexes make correct queries fast; they do nothing about wrong data. A bug writes <code>status: "shipped"</code>, an order arrives with no lines, a CSV import stores dates as text. MongoDB's flexible schema accepts all of it, and the reports quietly drift. PostgreSQL rejected bad Biteful rows with types, <code>NOT NULL</code> and <code>CHECK</code> constraints; MongoDB's equivalent is a <strong>validator</strong> attached to a collection and written in <strong>JSON Schema</strong>, a standard way to describe what a JSON document must look like, extended with BSON types. Every insert and update is checked against it. Think of a railway reservation form: the clerk refuses it if the age box is empty or the date says "next Tuesday", so bad forms never enter the system, but forms filed last year are not re-checked.</p>
  <p>The command below attaches a validator to the existing <code>orders</code> collection with <code>collMod</code> (mongomock does not implement validation, so the commands in this section have no output):</p>
  <div class="fx" data-lang="mongo">db.runCommand({ collMod: "orders", validationAction: "error", validator: { $jsonSchema: {
  bsonType: "object",
  required: ["customer_id", "restaurant_id", "ordered_at", "status", "amount", "items"],
  properties: {
    status:           { enum: ["pending", "delivered", "cancelled"] },
    ordered_at:       { bsonType: "date" },
    amount:           { bsonType: "number", minimum: 1 },
    delivery_minutes: { bsonType: ["int", "null"], minimum: 1 },
    items: { bsonType: "array", minItems: 1,
             items: { bsonType: "object", required: ["item", "qty", "unit_price"],
                      properties: { qty: { bsonType: "int", minimum: 1 } } } } } } } })</div>
  <p>Read the schema as a list of rules. The order must have the six listed fields. <code>status</code> must be one of three values (<code>enum</code>), <code>ordered_at</code> must be a real date, <code>amount</code> any number of at least 1, and <code>delivery_minutes</code>, if present, an integer or null. <code>items</code> must be an array with at least one element, and each element an object with <code>item</code>, <code>qty</code> and <code>unit_price</code>, where <code>qty</code> is an integer of at least 1. <code>validationAction: "error"</code> means rule-breaking writes are rejected (<code>"warn"</code> would only log them). Now six writes against it:</p>
  <div class="fx" data-lang="mongo">const good = { customer_id: 7, restaurant_id: 14, ordered_at: ISODate("2026-03-09T13:00:00+05:30"),
               status: "pending", amount: 300, items: [ { item: "Veg Momos", qty: 2, unit_price: 150 } ] }
db.orders.insertOne({ ...good, _id: 111, status: "shipped", items: [] })                    // (a)
db.orders.insertOne({ ...good, _id: 112 })                                                   // (b)
db.orders.insertOne({ ...good, _id: 113, items: [ { item: "Veg Momos", qty: 1.5, unit_price: 150 } ] }) // (c)
db.orders.insertOne({ ...good, _id: 114, ordered_at: "2026-03-09 13:00" })                  // (d)
db.orders.updateOne({ _id: 112 }, { $set: { stauts: "delivered" } })                         // (e)
db.orders.updateOne({ _id: 112 }, { $set: { status: "deliverd" } })                          // (f)</div>
  <p>The server's verdicts, write by write:</p>
  <table class="tbl">
    <tr><th>Write</th><th>Result</th><th>Why</th></tr>
    <tr><td>(a) status "shipped", empty items</td><td>rejected</td><td>"shipped" is not in the enum, and items has fewer than 1 element; the error lists both</td></tr>
    <tr><td>(b) the good order</td><td>accepted</td><td>every rule holds</td></tr>
    <tr><td>(c) qty 1.5</td><td>rejected</td><td>1.5 is a double, and qty must be an int</td></tr>
    <tr><td>(d) date as text</td><td>rejected</td><td><code>ordered_at</code> is a string, not a date</td></tr>
    <tr><td>(e) <code>$set: { stauts: … }</code></td><td><strong>accepted</strong></td><td>the schema only checks the fields it lists; an unknown field passes</td></tr>
    <tr><td>(f) status "deliverd"</td><td>rejected</td><td>the misspelled value is not in the enum</td></tr>
  </table>
  <p>Two of these deserve a second look. Write (e) shows that a validator does not, by default, catch misspelled field <em>names</em>: <code>stauts</code> is simply a new field the schema says nothing about. Adding <code>additionalProperties: false</code> rejects unlisted fields, but then every allowed field, including <code>_id</code>, must be listed. Write (c) shows that number types depend on who writes: mongosh stores <code>2</code> as an int but <code>1.5</code> as a double, and Python sends <code>2.0</code> as a double; pymongo cannot even encode NumPy's <code>int64</code> without converting it with <code>int()</code>. Unless you truly need one exact numeric type, <code>bsonType: "number"</code> (any numeric type) is the safer choice.</p>
  <p>Finally, adding a validator does not touch documents already in the collection. Old invalid documents stay as they are, and you can list them with <code>db.orders.find({ $nor: [ { $jsonSchema: schema } ] })</code>, which returns every document that does <em>not</em> satisfy the schema. The option <code>validationLevel: "moderate"</code> tells the server not to check updates to documents that were already invalid, so a validator can be introduced gradually.</p>

  <h2 id="md-txn"><span class="num">08</span>Multi-Document Transactions</h2>
  <p>Single-document writes are atomic, which is exactly why order lines live inside orders. But some changes cannot fit in one document. Paying for an order from Biteful's wallet must insert the order <em>and</em> debit the customer's wallet: two documents in two collections. The computed stats in section 05 were two writes as well. If the server fails between the two writes, money and orders disagree. A <strong>multi-document transaction</strong> groups writes across documents and collections into one all-or-nothing unit, with the same ACID guarantees described in <a class="xref" data-note="sql_transactions">Transactions</a>: all the writes become visible together at commit, or none of them happens. Think of a UPI payment: the money leaves your account and arrives in the shop's as a single event, and if the second half fails, the first is reversed, so nobody ever sees the money in neither account.</p>
  <p>Transactions need a <strong>replica set</strong> (section 09; even a single-member replica set will do) and a <strong>session</strong>, the client-side handle that the transaction belongs to. mongomock does not support sessions, so the commands are shown without output:</p>
  <div class="fx" data-lang="mongo">db.customers.updateOne({ _id: 1 }, { $set: { wallet: 500 } })
const s = db.getMongo().startSession()
const sdb = s.getDatabase("biteful")
s.startTransaction({ writeConcern: { w: "majority" } })
sdb.orders.insertOne({ _id: 111, customer_id: 1, restaurant_id: 10, status: "pending", amount: 310,
                       ordered_at: new Date(), items: [ { item: "Masala Dosa", qty: 2, unit_price: 120 },
                                                        { item: "Filter Coffee", qty: 1, unit_price: 70 } ] })
sdb.customers.updateOne({ _id: 1, wallet: { $gte: 310 } }, { $inc: { wallet: -310 } })
db.orders.findOne({ _id: 111 })             // another client, outside the transaction
s.commitTransaction()</div>
  <p>Step by step, a real server behaves like this:</p>
  <table class="tbl">
    <tr><th>Step</th><th>What happens</th><th>What other clients see</th></tr>
    <tr><td>Set wallet to 500, start the transaction</td><td>a snapshot of the data is fixed for the session</td><td>wallet 500</td></tr>
    <tr><td>Insert order 111 inside the transaction</td><td>written, but only inside the transaction</td><td><code>findOne({ _id: 111 })</code> returns <code>null</code></td></tr>
    <tr><td>Debit 310 if wallet ≥ 310</td><td>the filter guards against overdraft; 1 document modified</td><td>still wallet 500</td></tr>
    <tr><td><code>commitTransaction()</code></td><td>both writes become durable and visible together</td><td>order 111 exists; wallet 190</td></tr>
    <tr><td>(alternative) <code>abortTransaction()</code></td><td>both writes are discarded</td><td>no order 111; wallet 500</td></tr>
  </table>
  <p>Concurrency adds one more case. If two transactions try to change the same document, say two simultaneous wallet debits for Asha, the second one fails immediately with a <code>WriteConflict</code> error carrying the label <code>TransientTransactionError</code>. That label means "nothing was committed; it is safe to retry the whole transaction". In application code you rarely handle this by hand: pymongo's <code>with_transaction</code> runs your function inside a transaction, commits it, retries automatically on transient errors, and aborts if your function raises an exception:</p>
  <div class="fx" data-lang="py">from pymongo import MongoClient
from pymongo.write_concern import WriteConcern

client = MongoClient("mongodb://host1,host2,host3/?replicaSet=rs0")   # needs a replica set
db = client["biteful"]

def pay_with_wallet(order):
    def txn(session):
        db.orders.insert_one(order, session=session)
        res = db.customers.update_one(
            {"_id": order["customer_id"], "wallet": {"$gte": order["amount"]}},
            {"$inc": {"wallet": -order["amount"]}}, session=session)
        if res.modified_count == 0:
            raise ValueError("insufficient wallet balance")   # any exception aborts
    with client.start_session() as s:
        s.with_transaction(txn, write_concern=WriteConcern("majority"))</div>
  <p>If the wallet holds too little, the update modifies nothing, the function raises, and the transaction aborts, which also undoes the order insert that had already happened inside it. Either both writes happen or neither does.</p>
  <p>Transactions have real costs. They add latency and hold resources, abort after 60 seconds by default, should touch well under about 1,000 documents, and need retry logic; on a sharded cluster they also need a two-phase commit across shards. So treat them as a tool for genuine cross-document rules (order plus wallet), not a habit. If most of your writes seem to need a transaction, first ask whether embedding could make them a single document, as it did for lines and totals, or whether the workload is really relational and belongs in SQL.</p>

  <h2 id="md-repl"><span class="num">09</span>Replica Sets</h2>
  <p>Everything so far ran on one server: one disk, one power supply, one machine that can crash during a deploy. If it dies at 8 p.m. on a Friday, every Biteful order fails until someone restarts it, and writes since the last backup may be lost. Production MongoDB therefore runs as a <strong>replica set</strong>: a group of servers holding copies of the same data. One member is the <strong>primary</strong>, which takes all writes and records every change in its <strong>oplog</strong> (operation log). The other members are <strong>secondaries</strong>, which continuously copy the oplog and replay it, so they hold nearly up-to-date copies. If the primary disappears, the remaining members hold an <strong>election</strong> and promote one of the secondaries to primary. This is the replication idea from <a class="xref" data-note="sql_transactions">Transactions</a>, with automatic failover built in.</p>
  <p>Think of a wedding kitchen with one head cook and two assistants. Only the head cook decides each dish and writes it in the order book; the assistants copy the book line by line. If the head cook collapses, the assistants agree on who takes over, and that agreement needs two votes out of three.</p>
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
  </svg><figcaption>Three voting members: one primary takes the writes; two secondaries replay its oplog and can take over.</figcaption></figure>
  <p>The figure shows the normal flow: the application writes to the primary, and the secondaries copy its oplog. Replication cannot be run in mongomock, so the commands in this section are shown without output. The first lists each member's role; the second makes a write that waits for a majority of members:</p>
  <div class="fx" data-lang="mongo">rs.status().members.map(m =&gt; ({ host: m.name, state: m.stateStr }))
db.pings.insertOne({ rider: 3, seq: 41 }, { writeConcern: { w: "majority", wtimeout: 5000 } })</div>
  <p>On a healthy three-member set the first command lists one <code>PRIMARY</code> and two <code>SECONDARY</code> members. What happens when the primary crashes is best followed as a timeline:</p>
  <table class="tbl">
    <tr><th>Time</th><th>Event</th><th>Effect on the app</th></tr>
    <tr><td>0 s</td><td>the primary's process is killed</td><td>writes start failing or waiting</td></tr>
    <tr><td>0–10 s</td><td>members send heartbeats every 2 s; the secondaries stop hearing from the primary</td><td>no primary: no writes accepted</td></tr>
    <tr><td>about 10 s</td><td><code>electionTimeoutMillis</code> (10,000 ms by default) passes; a secondary calls an election and wins 2 of 3 votes</td><td>a new primary exists</td></tr>
    <tr><td>after that</td><td>drivers discover the new primary; retryable writes are re-sent</td><td>writes resume with no human involved</td></tr>
    <tr><td>later</td><td>the old primary is restarted</td><td>it rejoins as a secondary and catches up from the oplog</td></tr>
  </table>
  <p>Application drivers usually wait for a primary for up to 30 seconds by default, so a user sees a pause of about ten seconds rather than errors. Why three members rather than two? An election needs a <strong>majority</strong> of the voting members. With three, losing one leaves two of three, a majority, so a new primary can be elected. With two, losing one leaves one of two, which is not a majority, so no primary can exist. In the same way, if two of three members are down, the survivor steps down to secondary and refuses writes with a <code>NotWritablePrimary</code> error. This rule protects against <strong>split brain</strong>, the disaster in which two servers both believe they are primary and accept conflicting writes.</p>
  <p>Two settings control the trade-off between speed and safety:</p>
  <table class="tbl">
    <tr><th>Setting</th><th>Meaning</th><th>Trade-off</th></tr>
    <tr><td>write concern <code>w: 1</code></td><td>acknowledge once the primary has the write</td><td>fast, but the write can be rolled back if the primary dies before replicating it</td></tr>
    <tr><td>write concern <code>w: "majority"</code> (default since 5.0)</td><td>acknowledge once most members have it</td><td>survives failover; a little slower</td></tr>
    <tr><td>read preference <code>"primary"</code> (default)</td><td>all reads from the primary</td><td>always current</td></tr>
    <tr><td>read preference <code>"secondary"</code> / <code>"nearest"</code></td><td>reads may go to secondaries</td><td>spreads load, but data may be <strong>stale</strong> by the replication lag</td></tr>
  </table>
  <p>Stale reads cause a classic bug: a customer places an order (written to the primary), and the "My orders" page reads from a secondary that has not caught up, so the new order is missing. Read from the primary after writes, or use a causally consistent session with majority read and write concerns. And remember what replication does <em>not</em> do: it adds availability and read capacity, but every write still goes to one primary, so it does not add write capacity.</p>

  <h2 id="md-shard"><span class="num">10</span>Sharding and the Shard Key</h2>
  <p>A replica set copies <em>all</em> the data to every member, so it can never hold more than one machine's disk, and every write lands on a single primary. When Biteful expands to fifty cities and orders arrive faster than one primary can write them, the data itself must be split across machines. <strong>Sharding</strong> splits a collection across several replica sets, each called a <strong>shard</strong>. A field (or fields) called the <strong>shard key</strong> decides which shard each document lives on. Documents are grouped into <strong>chunks</strong>, which are ranges of shard-key values; a router process called <strong>mongos</strong> sends each query to the shard or shards owning the relevant chunks; <strong>config servers</strong> store the map of which chunk lives where; and a background <strong>balancer</strong> moves chunks between shards to keep them even.</p>
  <p>Think of a post office with several sorting counters. Split the letters by PIN code and every counter gets a fair share, and a question about PIN 411001 goes to just one counter. Split them by "date received" and every new letter goes to the last counter, so one clerk does all the work while the others sit idle. Split them by "Pune or Mumbai" and a third counter can never receive anything.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="md-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="16" width="80" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="40" y="39" text-anchor="middle">App</text>
    <line x1="80" y1="34" x2="198" y2="34" stroke="currentColor" marker-end="url(#md-ar3)"/>
    <rect x="200" y="12" width="140" height="44" rx="8" class="fb sb"/><text x="270" y="38" text-anchor="middle" font-weight="bold">mongos</text>
    <rect x="400" y="12" width="190" height="44" rx="8" class="fv sb"/><text x="495" y="31" text-anchor="middle">config servers</text><text x="495" y="47" text-anchor="middle" font-size="10" class="tm">which chunk lives where</text>
    <line x1="340" y1="34" x2="398" y2="34" stroke="currentColor" stroke-dasharray="3 3"/>
    <rect x="10" y="120" width="170" height="54" rx="8" class="ft st"/><text x="95" y="142" text-anchor="middle">Shard A</text><text x="95" y="162" text-anchor="middle" font-size="10" class="tm">customers 0–2499</text>
    <rect x="215" y="120" width="170" height="54" rx="8" class="ft st"/><text x="300" y="142" text-anchor="middle">Shard B</text><text x="300" y="162" text-anchor="middle" font-size="10" class="tm">customers 2500–4999</text>
    <rect x="420" y="120" width="170" height="54" rx="8" class="ft st"/><text x="505" y="142" text-anchor="middle">Shard … (later)</text><text x="505" y="162" text-anchor="middle" font-size="10" class="tm">added as data grows</text>
    <line x1="250" y1="56" x2="110" y2="118" class="sg" stroke-width="2" marker-end="url(#md-ar3)"/>
    <text x="170" y="76" text-anchor="end" font-size="10" class="tg">customer_id: 42 → one shard</text>
    <g class="sr" stroke-dasharray="4 3"><line x1="300" y1="56" x2="300" y2="118" marker-end="url(#md-ar3)"/><line x1="310" y1="56" x2="490" y2="118" marker-end="url(#md-ar3)"/></g>
    <text x="410" y="84" font-size="10" class="tr">no shard key → ask every shard</text>
  </svg><figcaption>Each shard is itself a replica set. A query that carries the shard key goes to one shard; any other query goes to all of them.</figcaption></figure>
  <p>As the figure shows, every query goes through mongos. If the query includes the shard key, mongos can send it to the one shard that owns that value, a <strong>targeted query</strong>. If it does not, mongos must ask every shard and merge the answers, a <strong>scatter-gather</strong> query: fine with two shards, but fifty queries per request with fifty. Choosing the shard key is therefore the most important sharding decision. To compare candidates, imagine four copies of Biteful's orders collection, each sharded on a different key (sharding cannot be run in mongomock, so these commands have no output):</p>
  <div class="fx" data-lang="mongo">sh.shardCollection("biteful.orders_by_time", { ordered_at: 1 })                    // ranged, always increasing
sh.shardCollection("biteful.orders_hashed",  { _id: "hashed" })                    // hashed
sh.shardCollection("biteful.orders_by_cust", { customer_id: 1, ordered_at: 1 })    // compound, spread-out first field
sh.shardCollection("biteful.orders_by_city", { city: 1 })                          // only 2 distinct values</div>
  <p>Suppose each collection starts with two chunks split at a sensible point, one chunk on shard A and one on shard B: the time-keyed one split at 1 March (older orders on A), the customer-keyed one at customer 2,500, and the city-keyed one at "Pune" (so "Mumbai" sorts into A's chunk). Now 10,000 new orders arrive, one per minute from 10 March. Counting which chunk range each order falls into shows where each key would send them:</p>
  <div class="fx" data-lang="mongo">// 10,000 new orders, arriving one per minute from 10 March
const out = []
for (let i = 0; i &lt; 10000; i++)
  out.push({ customer_id: (i * 7919) % 5000, city: i % 5 &lt; 3 ? "Pune" : "Mumbai",
             status: ["delivered", "pending"][i % 2], amount: 100 + (i % 9) * 50,
             ordered_at: new Date(Date.UTC(2026, 2, 10) + i * 60000) })
db.new_orders.insertMany(out)
// which chunk would each order fall into?
db.new_orders.countDocuments({ ordered_at: { $lt: ISODate("2026-03-01") } })    // time key, shard A
db.new_orders.countDocuments({ ordered_at: { $gte: ISODate("2026-03-01") } })   // time key, shard B
db.new_orders.countDocuments({ customer_id: { $lt: 2500 } })                    // customer key, shard A
db.new_orders.countDocuments({ customer_id: { $gte: 2500 } })                   // customer key, shard B
db.new_orders.countDocuments({ city: { $lt: "Pune" } })                         // city key, shard A
db.new_orders.countDocuments({ city: { $gte: "Pune" } })                        // city key, shard B</div>
  <div class="fx" data-lang="text">0
10000
5000
5000
4000
6000</div>
  <table class="tbl">
    <tr><th>Shard key</th><th>Shard A</th><th>Shard B</th><th>Why</th></tr>
    <tr><td><code>{ ordered_at: 1 }</code></td><td>0</td><td><strong>10,000</strong></td><td>every new order is newer than all others, so it always lands in the top chunk: a <strong>hot shard</strong></td></tr>
    <tr><td><code>{ customer_id: 1, ordered_at: 1 }</code></td><td>5,000</td><td>5,000</td><td>customers are spread out, so their orders are too</td></tr>
    <tr><td><code>{ city: 1 }</code></td><td>4,000 (Mumbai)</td><td>6,000 (Pune)</td><td>only two values: lopsided, and it can never use more than two chunks</td></tr>
    <tr><td><code>{ _id: "hashed" }</code></td><td colspan="2">roughly half each</td><td>the hash scatters even consecutive values randomly</td></tr>
  </table>
  <p>The time key shows the <strong>monotonic</strong> key problem: values that only ever increase, such as dates, ObjectIds and counters, send every insert to the same shard, so adding shards adds no write capacity. The city key shows the <strong>low-cardinality</strong> problem: with only two distinct values there can be at most two chunks, because a chunk in which every document has the same key value cannot be split; such an ever-growing, unsplittable chunk is called a <strong>jumbo chunk</strong>, and a third, fourth or tenth shard could never take any Pune orders. A <strong>hashed</strong> shard key spreads writes evenly even for monotonic values, but it destroys locality: a range query on the key ("orders from last week") becomes scatter-gather. Which queries are targeted can be checked with <code>explain</code>:</p>
  <div class="fx" data-lang="mongo">db.orders_by_cust.find({ customer_id: 42 }).explain()        // carries the shard key
db.orders_by_cust.find({ status: "pending" }).explain()      // does not</div>
  <p>On a real cluster, the plan for the first query shows <code>SINGLE_SHARD</code>, because <code>customer_id</code> is the leading field of the shard key, while the second shows <code>SHARD_MERGE</code>: the query was sent to every shard and the results merged. So a good shard key has <strong>high cardinality</strong> (many distinct values), <strong>even frequency</strong> (no value dominates), is <strong>not monotonic</strong>, and appears in most queries. For Biteful's orders, <code>{ customer_id: 1, ordered_at: 1 }</code> fits well: it spreads writes, and "my orders" goes to a single shard. Choose carefully, because changing a shard key later (resharding, available from 5.0) copies the whole collection, and do not shard at all until one well-indexed replica set truly cannot cope.</p>

  <h2 id="md-pg"><span class="num">11</span>MongoDB or PostgreSQL JSONB?</h2>
  <p>Biteful already runs PostgreSQL for the SQL notes. The new requirement, orders with varying lines and options, pushed us towards documents. A team in this position should ask the honest question: could a JSON column in the existing database have done the job, with one database to run, back up and secure? <strong>JSONB</strong> is PostgreSQL's binary JSON column type: a whole document stored in one column of an ordinary table, queryable with JSON operators and indexable with a <strong>GIN</strong> index (Generalized Inverted Index, which maps each key and value inside the JSON to the rows that contain it). Your house already has a cupboard with labelled shelves; for a few odd-shaped things you can add a flexible drawer to the same cupboard instead of buying a second cupboard and carrying two sets of keys. Here is one JSONB document per order, built straight from the SQL tables, indexed, and asked the same question as MongoDB's <code>"items.item"</code> filter:</p>
  <div class="fx" data-lang="sql">CREATE TABLE orders_doc (order_id INT PRIMARY KEY, doc JSONB NOT NULL);
INSERT INTO orders_doc
SELECT o.order_id,
       jsonb_build_object('customer_id', o.customer_id, 'status', o.status, 'amount', o.amount,
         'items', (SELECT jsonb_agg(jsonb_build_object('item', i.item, 'qty', i.qty,
                                                       'unit_price', i.unit_price) ORDER BY i.item)
                   FROM order_items i WHERE i.order_id = o.order_id))
FROM orders o;
CREATE INDEX orders_doc_gin ON orders_doc USING gin (doc jsonb_path_ops);
SELECT doc FROM orders_doc WHERE order_id = 102;
SELECT order_id FROM orders_doc
WHERE doc @&gt; '{"items": [{"item": "Masala Dosa"}]}' ORDER BY order_id;</div>
  <div class="fx" data-lang="text">CREATE TABLE
INSERT 0 10
CREATE INDEX
                                                                                          doc                                                                                          
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 {"items": [{"qty": 1, "item": "Chicken Biryani", "unit_price": 350.00}, {"qty": 2, "item": "Raita", "unit_price": 50.00}], "amount": 450.00, "status": "delivered", "customer_id": 2}
(1 row)

 order_id 
----------
      101
      108
      110
(3 rows)</div>
  <p>Order 102 came out as one JSON document (JSONB stores keys in its own order). The <code>@&gt;</code> operator means "contains": the document must contain an <code>items</code> array with an element whose <code>item</code> is "Masala Dosa". It found orders 101, 108 and 110, the same three as MongoDB. Aggregating inside the JSON works too:</p>
  <div class="fx" data-lang="sql">SELECT i -&gt;&gt; 'item' AS item,
       SUM((i -&gt;&gt; 'qty')::int * (i -&gt;&gt; 'unit_price')::numeric) AS revenue
FROM orders_doc, jsonb_array_elements(doc -&gt; 'items') AS i
WHERE doc -&gt;&gt; 'status' = 'delivered'
GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 3;
SET enable_seqscan = off;
EXPLAIN (COSTS OFF)
SELECT order_id FROM orders_doc WHERE doc @&gt; '{"items": [{"item": "Masala Dosa"}]}';</div>
  <div class="fx" data-lang="text">      item       | revenue 
-----------------+---------
 Chicken Biryani |  700.00
 Farmhouse Pizza |  520.00
 Masala Dosa     |  360.00
(3 rows)

SET
                                 QUERY PLAN                                 
----------------------------------------------------------------------------
 Bitmap Heap Scan on orders_doc
   Recheck Cond: (doc @&gt; '{"items": [{"item": "Masala Dosa"}]}'::jsonb)
   -&gt;  Bitmap Index Scan on orders_doc_gin
         Index Cond: (doc @&gt; '{"items": [{"item": "Masala Dosa"}]}'::jsonb)
(4 rows)</div>
  <p><code>jsonb_array_elements</code> turns each order's items array into rows, playing the role of <code>$unwind</code>, and the revenue per item matches the aggregation pipeline exactly: Chicken Biryani ₹700. The plan shows that the containment query can use the GIN index (<code>Bitmap Index Scan on orders_doc_gin</code>); sequential scans were switched off only to force the planner's hand on a ten-row table, where a scan would otherwise be cheaper. The <code>-&gt;</code> operator returns a JSON field as JSON and <code>-&gt;&gt;</code> returns it as text.</p>
  <table class="tbl">
    <tr><th>Need</th><th>Lean towards</th></tr>
    <tr><td>Mostly relational data, with a few flexible attributes</td><td>PostgreSQL + JSONB</td></tr>
    <tr><td>Joins, ad-hoc analytics, strict constraints, multi-table transactions</td><td>PostgreSQL</td></tr>
    <tr><td>Documents are the main model; nested data read and written as a unit</td><td>MongoDB</td></tr>
    <tr><td>Built-in horizontal scaling of writes across many machines</td><td>MongoDB (PostgreSQL needs an extension such as Citus)</td></tr>
    <tr><td>Frequent small updates inside large nested documents</td><td>MongoDB (a JSONB update writes a new version of the whole value)</td></tr>
    <tr><td>One database for the team to run, already on PostgreSQL</td><td>PostgreSQL + JSONB</td></tr>
  </table>
  <p>"The data has flexible fields, so use MongoDB" skips the cheaper option. In a system-design interview, give the reason instead: JSONB when the core of the data is relational and a few attributes vary; MongoDB when documents are the core model, nested data is read and written as a unit, or you need built-in write scale-out.</p>

  <h2 id="md-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Design mistakes rarely fail on the first day; they show up when data grows, a server dies, or traffic shifts. The first family are shape mistakes. Embedding an unbounded list (all of a customer's orders, all of a rider's pings) works until the document approaches 16 MB, at about 74,000 orders of Biteful's size, and is slow long before. The opposite mistake, designing like SQL with one collection per table and a <code>$lookup</code> on every request, rebuilds joins that MongoDB is not built around. Assuming references are checked is a third: the order for customer 99 was accepted, so keep references valid in code and run orphan checks. And copying fast-changing data with the extended-reference pattern creates huge updates and copies that drift.</p>
  <div class="fx" data-lang="mongo">// wrong: an ever-growing array inside the customer
db.customers.updateOne({ _id: 1 }, { $push: { orders: newOrder } })
// right: orders in their own collection, pointing at the customer
db.orders.insertOne({ ...newOrder, customer_id: 1 })</div>
  <p>The second family are index mistakes. A compound index in the wrong order (range before sort) makes the server read every matching entry and sort in memory instead of stopping after a handful. A unique index on an optional field fails because missing values count as duplicate nulls; use a partial index. A TTL index on a field holding text dates never deletes anything.</p>
  <div class="fx" data-lang="mongo">// wrong: Equality, Range, Sort → reads every match, then sorts
db.orders.createIndex({ restaurant_id: 1, ordered_at: 1, amount: -1 })
// right: Equality, Sort, Range → walks in order, stops at the limit
db.orders.createIndex({ restaurant_id: 1, amount: -1, ordered_at: 1 })</div>
  <p>The third family are safety mistakes. Trusting a validator to catch misspelled field names fails silently (<code>stauts</code> passed); add <code>additionalProperties: false</code>, and check old documents with <code>$nor</code> and <code>$jsonSchema</code>. Running transactions without retry logic fails under load, where <code>WriteConflict</code> errors are normal; use <code>with_transaction</code>. Using transactions everywhere is a sign the shape is wrong.</p>
  <p>The last family are scaling mistakes. <code>w: 1</code> writes can be rolled back after a failover; a two-member replica set cannot elect a new primary after losing one member; reading from secondaries right after writing can miss the write. And a monotonic shard key (a date, an ObjectId) sends every insert to one shard, while a low-cardinality key (city, status) caps the number of chunks forever; lead the shard key with a well-spread field that most queries use, or hash it.</p>

  <h2 id="md-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Biteful documents: 7 customers, 5 restaurants, 10 orders embedding 15 lines; orders reference customer and restaurant by id. Order 102 = 246 bytes; average order 226.5 bytes; 16 MB ≈ 74,071 orders. 100,000 ObjectIds = 1.9 MB. 100,000 pings → 1,670 hourly buckets.</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Embed</b>: related data stored inside the parent. <b>Reference</b>: the related document's <code>_id</code> stored instead, not enforced.</li>
    <li><b>Cardinality</b>: how many children one parent can have, and whether it is bounded.</li>
    <li><b>Denormalisation</b>: storing data in more than one place, or pre-computed, to make reads cheaper.</li>
    <li><b>ESR rule</b>: compound index field order = Equality, Sort, Range. <b>Prefix rule</b>: an index serves queries on its leading fields.</li>
    <li><b>Covered query</b>: answered from the index alone (0 documents examined). <b>Multikey index</b>: one entry per array element.</li>
    <li><b>Partial index</b>: indexes only documents matching a filter. <b>TTL index</b>: deletes documents N seconds after a date field.</li>
    <li><b>Validator</b>: a <code>$jsonSchema</code> checked on every insert and update; existing documents are not re-checked.</li>
    <li><b>Transaction</b>: all-or-nothing writes across documents, in a session, on a replica set.</li>
    <li><b>Replica set</b>: primary + secondaries copying its oplog; elections need a majority.</li>
    <li><b>Shard key</b>: field(s) deciding a document's shard; <b>chunk</b>: a key range on one shard; <b>mongos</b>: the router.</li>
  </ul>
  <h3>Embed or reference</h3>
  <table class="tbl">
    <tr><th>Relationship</th><th>Design</th></tr>
    <tr><td>one-to-few (addresses, order lines)</td><td>embed</td></tr>
    <tr><td>one-to-many (customer → orders)</td><td>child holds parent id</td></tr>
    <tr><td>one-to-squillions (rider → pings)</td><td>child holds parent id, never an array; consider buckets</td></tr>
    <tr><td>many-to-many (favourites)</td><td>array of ids on the queried side</td></tr>
  </table>
  <h3>Patterns</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Use when</th><th>Cost</th></tr>
    <tr><td>Extended reference</td><td>stable fields shown on every read</td><td>update copies when the source changes</td></tr>
    <tr><td>Computed</td><td>read-heavy totals</td><td>extra write per change; needs atomicity</td></tr>
    <tr><td>Subset</td><td>big list, small part shown</td><td>two places to write</td></tr>
    <tr><td>Outlier</td><td>rare giant parents</td><td>code must check the overflow flag</td></tr>
    <tr><td>Bucket</td><td>many tiny time-stamped records</td><td>queries work on buckets, not single records</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="mongo">bsonsize(doc)                                                  // bytes
db.c.createIndex({ restaurant_id: 1, amount: -1, ordered_at: 1 })   // ESR
db.c.createIndex({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true } } })
db.c.createIndex({ created_at: 1 }, { expireAfterSeconds: 60 })     // TTL
db.c.find(q).sort(s).limit(n).explain("executionStats")
db.runCommand({ collMod: "c", validator: { $jsonSchema: {...} }, validationAction: "error" })
{ $push: { recent: { $each: [r], $sort: { at: -1 }, $slice: 3 } } }  // subset
const s = db.getMongo().startSession(); s.startTransaction(); ... s.commitTransaction()
sh.shardCollection("db.c", { customer_id: 1, ordered_at: 1 })</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Unbounded arrays hit 16 MB; "nest everything" and "design like SQL" are both wrong.</li>
    <li>References are not enforced; index the referencing field.</li>
    <li>Copy only stable fields; two-write patterns can drift without a transaction.</li>
    <li>Range before sort in an index → in-memory sort; <code>/dosa/i</code> and <code>$ne</code> read most of the index.</li>
    <li>Unique on an optional field fails on nulls; TTL ignores text dates.</li>
    <li>Validators ignore unlisted fields and old documents.</li>
    <li>Transactions need retries and a replica set; do not use them as a habit.</li>
    <li>Two-member replica sets cannot fail over; secondaries can be stale; replicas do not scale writes.</li>
    <li>Monotonic or low-cardinality shard keys create hot shards and jumbo chunks.</li>
  </ul>

  <h2 id="md-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you decide whether to embed or reference related data?</summary><div class="qa-body">Embed when the child is owned by the parent, read together with it, and bounded in number, such as order lines or saved addresses; you get single-read pages and atomic writes. Reference when the related data is shared, unbounded, changes independently or is queried on its own, such as customers, restaurants and a customer's orders. The guiding principle is that data accessed together should be stored together, as long as it stays small and bounded.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Would you embed a user's posts (or a customer's orders) inside the user document?</summary><div class="qa-body">No. The list grows without limit, so the document would eventually hit the 16 MB limit (about 74,000 Biteful orders), and long before that every new item rewrites an ever larger document and every profile read drags the whole history along. The posts or orders go in their own collection, each holding the user's id, with an index on that field.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the maximum document size, and how do you design around it?</summary><div class="qa-body">16 MB of BSON. Design so that no document grows without bound: keep unbounded children in their own collection, cap embedded lists with the subset or outlier pattern, and bucket time-series data. Large files belong in GridFS or object storage, with only a reference in the document.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain one-to-few, one-to-many and one-to-squillions.</summary><div class="qa-body">One-to-few is a small, bounded set of children, which you embed. One-to-many is hundreds or thousands of children, usually stored in their own collection with the parent's id (or a bounded array of ids in the parent). One-to-squillions is an unbounded stream such as GPS pings or log events: the child must hold the parent's id, never an array in the parent, because even an array of ids would hit 16 MB, and bucketing is often worthwhile.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>MongoDB has no foreign keys. How do you keep references valid?</summary><div class="qa-body">In application code: validate the referenced document exists before writing, delete or reassign dependants together (in a transaction when they must agree), or soft-delete instead of deleting. Run periodic orphan checks, for example a <code>$lookup</code> followed by a match on an empty array. Embedding data that truly belongs to its parent also removes the problem for that data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the extended reference pattern, and when should you avoid it?</summary><div class="qa-body">It keeps a reference but also copies the few fields that are always displayed, such as the customer's name inside each order, so the common page needs no lookup. The cost is updating every copy when the source changes. Use it for stable fields or for values that should be snapshots; avoid it for fast-changing values like ratings or stock levels, which would need constant mass updates and drift out of sync.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the subset, computed and bucket patterns?</summary><div class="qa-body">Subset embeds only the most-used part of a large related list (the newest reviews) and keeps the full list in its own collection. Computed stores a result such as a total or a count and updates it on each write, so reads do not recompute it. Bucket groups many small time-stamped records into one document per entity per time window, cutting the number of documents and index entries dramatically.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the ESR rule for compound indexes?</summary><div class="qa-body">Put Equality fields first, then the field you Sort on, then Range fields. Equality narrows the index to one slice; within that slice the entries are already in sort order, so no in-memory sort is needed and a limit can stop early; the range is checked while walking. Putting the range before the sort forces the server to read every matching entry and sort them in memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the prefix rule, and what is a covered query?</summary><div class="qa-body">A compound index can be used by queries on its leading fields: <code>{ a, b, c }</code> serves queries on <code>a</code>, on <code>a</code> and <code>b</code>, or on all three, but not on <code>b</code> alone. A covered query is one whose filter and returned fields are all in the index, with <code>_id</code> excluded unless indexed, so the server answers from the index without reading any document.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can a unique index fail to build on an optional field, and what is the fix?</summary><div class="qa-body">A unique index treats a missing field as <code>null</code>, so all documents without the field are duplicates of each other. Use a partial index with <code>partialFilterExpression: { field: { $exists: true } }</code> so only documents that have the field are indexed and checked for uniqueness.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does schema validation work in MongoDB, and what are its limits?</summary><div class="qa-body">You attach a <code>$jsonSchema</code> validator to a collection with types, required fields, enums, ranges and nested rules, and every insert and update is checked; <code>validationAction</code> chooses between rejecting and warning. By default unlisted fields are allowed, so a misspelled field name passes unless you set <code>additionalProperties: false</code>. Existing documents are not re-checked when the validator is added; find them with <code>$nor</code> and <code>$jsonSchema</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need a multi-document transaction in MongoDB?</summary><div class="qa-body">When one logical change must update several documents that have to agree, such as inserting an order and debiting a wallet, or updating an order and its restaurant's stored totals. Writes inside the transaction are invisible to others until commit and discarded on abort. They need a replica set, add latency, time out after 60 seconds by default, and need retries on <code>TransientTransactionError</code>, so first ask whether embedding can make the change a single-document write.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when the primary of a replica set fails?</summary><div class="qa-body">The secondaries stop receiving heartbeats, wait for the election timeout (10 seconds by default), and hold an election; a caught-up secondary that wins a majority of votes becomes the new primary, and drivers redirect writes to it. Applications typically see a pause of around ten seconds. Writes acknowledged with <code>w: "majority"</code> survive; writes acknowledged with <code>w: 1</code> that had not replicated can be rolled back.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a replica set usually have three members rather than two?</summary><div class="qa-body">Electing a primary requires a majority of voting members. With three, losing one leaves two of three, so a new primary can be elected. With two, losing one leaves one of two, which is not a majority, so no primary exists and writes stop. The majority rule prevents split brain, where two primaries accept conflicting writes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Replication vs sharding: what does each solve?</summary><div class="qa-body">Replication keeps copies of the same data on several servers, which gives high availability, automatic failover and extra read capacity, but all writes still go to one primary and all data must fit on one machine. Sharding splits the data across several replica sets by a shard key, which scales storage and write throughput horizontally. Production clusters use both: each shard is a replica set.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a good shard key?</summary><div class="qa-body">High cardinality, so the data can be split into many chunks; even frequency, so no single value dominates; non-monotonic values, so inserts spread across shards instead of all hitting the newest chunk; and presence in most queries, so they can be targeted at one shard instead of scatter-gather. For orders, <code>{ customer_id, ordered_at }</code> is a good choice; <code>ordered_at</code> alone, <code>status</code> or <code>city</code> are poor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hashed vs ranged shard keys?</summary><div class="qa-body">A ranged key keeps nearby values together, so range queries on the key hit one or a few shards, but monotonic values create a hot shard. A hashed key spreads documents randomly by the hash of the value, so even increasing values distribute evenly, but any range query on the key must ask every shard. Choose hashed for write-heavy keys that are only queried by exact value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team runs PostgreSQL and needs flexible, nested order data. MongoDB or JSONB?</summary><div class="qa-body">Probably JSONB: store the nested part in a <code>jsonb</code> column with a GIN index, query it with operators like <code>@&gt;</code>, unnest arrays with <code>jsonb_array_elements</code>, and keep customers, payments and joins relational in one database. MongoDB is worth adding when documents are the main data model, nested data is frequently updated in place, or you need built-in horizontal write scaling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does embedding reduce the need for transactions?</summary><div class="qa-body">Every write to a single document is atomic. When data that must change together lives in one document, such as order lines and the order total, a single update keeps it consistent without a transaction. Transactions are only needed for rules that span documents the design could not merge, such as an order and a wallet.</div></details>
</main>
`
});
