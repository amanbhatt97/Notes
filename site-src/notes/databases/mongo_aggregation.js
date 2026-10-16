// notes/databases/mongo_aggregation.js — Aggregation Pipeline
Object.assign(TOPIC_CONTENT, {
  "mongo_aggregation": `<main>
  <h1>Aggregation Pipeline</h1>
  <p class="lead">The aggregation pipeline is MongoDB's GROUP BY, JOIN and window functions in one tool. Learn the stages, map them to SQL, and write the classic analytics queries on the shop orders.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ma-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Pipeline Idea</span><span class="rm-sub">An assembly line for documents</span></div></div>
      <div class="rm-item rm-done" data-target="ma-basic"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Filter &amp; Reshape</span><span class="rm-sub">$match, $project, $addFields</span></div></div>
      <div class="rm-item rm-done" data-target="ma-group"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">$group &amp; Accumulators</span><span class="rm-sub">$sum, $avg, $push, HAVING</span></div></div>
      <div class="rm-item rm-done" data-target="ma-unwind"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">$unwind</span><span class="rm-sub">One document per array item</span></div></div>
      <div class="rm-item rm-done" data-target="ma-lookup"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">$lookup</span><span class="rm-sub">The join</span></div></div>
      <div class="rm-item rm-done" data-target="ma-sql"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">SQL → Pipeline</span><span class="rm-sub">Clause-by-clause mapping</span></div></div>
      <div class="rm-item rm-done" data-target="ma-work"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Worked Examples</span><span class="rm-sub">Revenue, top product, months</span></div></div>
      <div class="rm-item rm-done" data-target="ma-adv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">$facet, $bucket, Windows</span><span class="rm-sub">Multi-view and running totals</span></div></div>
      <div class="rm-item rm-done" data-target="ma-perf"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Performance Rules</span><span class="rm-sub">Indexes, 100 MB, $lookup cost</span></div></div>
      <div class="rm-item rm-done" data-target="ma-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 9 lines</span></div></div>
      <div class="rm-item rm-done" data-target="ma-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Write-the-pipeline drills</span></div></div>
    </div>
  </div>

  <h2 id="ma-idea"><span class="num">01</span>The Pipeline Idea</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>A pipeline is an <strong>array of stages</strong>. Documents flow through them in order; each stage takes a stream of documents and outputs a new stream.</p>
  </div>
  <p><code>find()</code> can only filter and project. Totals, groupings, joins and reshaping need a pipeline.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An <strong>assembly line</strong>. Station 1 throws out rejects ($match), station 2 cuts parts apart ($unwind), station 3 sorts them into bins and counts ($group), station 4 lines up the bins ($sort). Each station only sees what the previous one handed over.</p>
  </div>
  <div class="flow"><span>orders</span><span>$match</span><span>$unwind</span><span>$group</span><span>$sort</span><span>result</span></div>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$customer_id", orders: { $sum: 1 } } }
])</div>
  <div class="fx" data-lang="js">{ _id: 1, orders: 2 }
{ _id: 3, orders: 1 }</div>
  <ul>
    <li><code>"$field"</code> (with <code>$</code>, in quotes) means "the value of this field". <code>"field"</code> without <code>$</code> is just a string.</li>
    <li>Stages may repeat and appear in any order. Order matters for both meaning and speed.</li>
    <li>Output order is not guaranteed without <code>$sort</code>. Results on this page are shown sorted for reading.</li>
  </ul>
  <p>The data (same as <em>Documents &amp; CRUD</em>): orders 100–104, each with an embedded <code>items</code> array of <code>{product, category, qty, price}</code>.</p>

  <h2 id="ma-basic"><span class="num">02</span>Filter &amp; Reshape</h2>
  <ul>
    <li><strong>$match</strong>: same filter syntax as <code>find()</code>. Put it first.</li>
    <li><strong>$project</strong>: keep, drop, rename or compute fields. Unlisted fields are dropped (except <code>_id</code>).</li>
    <li><strong>$addFields</strong> (alias <code>$set</code>): add computed fields, keep everything else.</li>
  </ul>
  <p>Order total = sum of qty × price over the items array, without unwinding:</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $addFields: {
      total: { $sum: { $map: { input: "$items", as: "i",
                               in: { $multiply: ["$$i.qty", "$$i.price"] } } } } } },
  { $project: { customer_id: 1, status: 1, total: 1 } }
])</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>_id</th><th>customer_id</th><th>status</th><th>total</th></tr>
    <tr><td>100</td><td>1</td><td>delivered</td><td>880</td></tr>
    <tr><td>101</td><td>1</td><td>delivered</td><td>500</td></tr>
    <tr><td>102</td><td>2</td><td>cancelled</td><td>150</td></tr>
    <tr><td>103</td><td>3</td><td>delivered</td><td>1150</td></tr>
    <tr><td>104</td><td>3</td><td>pending</td><td>120</td></tr>
  </table>
  <p><code>$map</code> transforms each array element; <code>$$i</code> (double <code>$</code>) refers to the loop variable. Other handy expressions: <code>$filter</code>, <code>$cond</code>, <code>$ifNull</code>, <code>$dateToString</code>, <code>$size</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fields in <code>$project</code> are all-or-nothing like in <code>find</code>: listing <code>{ total: 1 }</code> drops every other field. If you only want to <em>add</em> a field, use <code>$addFields</code>.</p>
  </div>

  <h2 id="ma-group"><span class="num">03</span>$group &amp; Accumulators</h2>
  <p><code>$group</code> needs an <code>_id</code>: the grouping key. Every other field must be an <strong>accumulator</strong>. <code>_id: null</code> puts all documents in one group.</p>
  <table class="tbl">
    <tr><th>Accumulator</th><th>SQL cousin</th><th>Note</th></tr>
    <tr><td><code>$sum: 1</code></td><td><code>COUNT(*)</code></td><td>Adds 1 per document</td></tr>
    <tr><td><code>$sum: "$x"</code></td><td><code>SUM(x)</code></td><td>Non-numbers are ignored</td></tr>
    <tr><td><code>$avg $min $max</code></td><td><code>AVG MIN MAX</code></td><td>Ignore missing values</td></tr>
    <tr><td><code>$push</code></td><td><code>ARRAY_AGG(x)</code></td><td>Collects all values, with duplicates</td></tr>
    <tr><td><code>$addToSet</code></td><td><code>ARRAY_AGG(DISTINCT x)</code></td><td>Unique values, order not guaranteed</td></tr>
    <tr><td><code>$first $last</code></td><td>—</td><td>Meaningful only after a <code>$sort</code></td></tr>
  </table>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $group: { _id: "$customer_id",
              n: { $sum: 1 },
              last_order: { $max: "$order_date" },
              statuses: { $push: "$status" } } },
  { $sort: { _id: 1 } }
])</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>_id</th><th>n</th><th>last_order</th><th>statuses</th></tr>
    <tr><td>1</td><td>2</td><td>2024-05-20</td><td>[delivered, delivered]</td></tr>
    <tr><td>2</td><td>1</td><td>2024-06-02</td><td>[cancelled]</td></tr>
    <tr><td>3</td><td>2</td><td>2024-07-01</td><td>[delivered, pending]</td></tr>
  </table>
  <p><strong>HAVING</strong> is just a second <code>$match</code> after the group, filtering on the computed field:</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $group: { _id: "$customer_id", n: { $sum: 1 } } },
  { $match: { n: { $gte: 2 } } }
])
// { _id: 1, n: 2 }  { _id: 3, n: 2 }</div>
  <p>Group by several fields with a compound key: <code>_id: { cust: "$customer_id", status: "$status" }</code>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>After <code>$group</code>, only <code>_id</code> and the accumulators exist. <code>customer_id</code> is now <code>_id</code>, and fields like <code>order_date</code> are gone unless you accumulated them.</p>
  </div>

  <h2 id="ma-unwind"><span class="num">04</span>$unwind</h2>
  <p><code>$unwind</code> turns one document with an n-element array into n documents, each holding one element. It's how you group <em>by something inside an array</em>, such as category.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Photocopying an order form once per line item, then cutting each copy so it shows only one item. Each slip still carries the order number and customer.</p>
  </div>
  <div class="fx" data-lang="js">// before: 1 document
{ _id: 100, customer_id: 1, status: "delivered",
  items: [ { product: "Laptop", category: "Electronics", qty: 1, price: 800 },
           { product: "Lamp",   category: "Furniture",   qty: 2, price: 40 } ] }

db.orders.aggregate([ { $match: { _id: 100 } }, { $unwind: "$items" } ])

// after: 2 documents, items is now an object, not an array
{ _id: 100, customer_id: 1, status: "delivered",
  items: { product: "Laptop", category: "Electronics", qty: 1, price: 800 } }
{ _id: 100, customer_id: 1, status: "delivered",
  items: { product: "Lamp",   category: "Furniture",   qty: 2, price: 40 } }</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Documents whose array is <strong>empty or missing are dropped</strong>, like an inner join. Keep them with <code>{ $unwind: { path: "$items", preserveNullAndEmptyArrays: true } }</code>. Also, after unwinding, <code>$sum: 1</code> counts items, not orders. That's the document version of SQL join fan-out.</p>
  </div>

  <h2 id="ma-lookup"><span class="num">05</span>$lookup</h2>
  <p><code>$lookup</code> pulls matching documents from another collection into an <strong>array field</strong>. It's a left outer join: no match gives an empty array.</p>
  <div class="fx" data-lang="js">db.customers.aggregate([
  { $lookup: { from: "orders", localField: "_id",
               foreignField: "customer_id", as: "orders" } },
  { $project: { _id: 0, name: 1, n_orders: { $size: "$orders" } } }
])</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>name</th><th>n_orders</th></tr>
    <tr><td>Asha</td><td>2</td></tr><tr><td>Ben</td><td>1</td></tr><tr><td>Chen</td><td>2</td></tr><tr><td>Dia</td><td>0</td></tr>
  </table>
  <div class="fx" data-lang="sql">SELECT c.name, COUNT(o.order_id) AS n_orders
FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name;</div>
  <ul>
    <li>Follow with <code>{ $unwind: "$orders" }</code> to get one row per pair (and drop Dia, like an inner join).</li>
    <li>The pipeline form <code>{ from, let, pipeline: [...], as }</code> allows extra conditions and filtering inside the joined collection.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Needing <code>$lookup</code> in a hot path is a schema smell. If you always show the customer name with an order, store a copy of it in the order (the <em>extended reference</em> pattern).</p>
  </div>

  <h2 id="ma-sql"><span class="num">06</span>SQL → Pipeline</h2>
  <table class="tbl">
    <tr><th>SQL</th><th>Pipeline stage</th></tr>
    <tr><td><code>WHERE</code></td><td><code>$match</code> (before <code>$group</code>)</td></tr>
    <tr><td><code>SELECT col, expr AS x</code></td><td><code>$project</code> / <code>$addFields</code></td></tr>
    <tr><td><code>GROUP BY</code> + aggregates</td><td><code>$group</code> with accumulators</td></tr>
    <tr><td><code>HAVING</code></td><td><code>$match</code> after <code>$group</code></td></tr>
    <tr><td><code>JOIN</code></td><td><code>$lookup</code> (+ <code>$unwind</code>)</td></tr>
    <tr><td><code>ORDER BY</code> / <code>LIMIT</code> / <code>OFFSET</code></td><td><code>$sort</code> / <code>$limit</code> / <code>$skip</code></td></tr>
    <tr><td><code>COUNT(*)</code> of result</td><td><code>$count: "n"</code></td></tr>
    <tr><td>Window functions</td><td><code>$setWindowFields</code></td></tr>
    <tr><td><code>UNION ALL</code></td><td><code>$unionWith</code></td></tr>
    <tr><td><code>CREATE TABLE AS</code></td><td><code>$out</code> / <code>$merge</code> (last stage)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key difference</span>
    <p>SQL's written order (SELECT first) differs from its execution order. A pipeline runs exactly in the order you write it, so you control the plan more directly.</p>
  </div>

  <h2 id="ma-work"><span class="num">07</span>Worked Examples</h2>
  <h3>Revenue per customer (delivered only), with names</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $unwind: "$items" },
  { $group: { _id: "$customer_id",
              revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } } } },
  { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } },
  { $unwind: "$c" },
  { $project: { _id: 0, name: "$c.name", revenue: 1 } },
  { $sort: { revenue: -1 } }
])</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>name</th><th>revenue</th></tr><tr><td>Asha</td><td>1380</td></tr><tr><td>Chen</td><td>1150</td></tr>
  </table>
  <p>Group first, then <code>$lookup</code>: 2 lookups instead of one per item.</p>
  <h3>Revenue per category (needs $unwind)</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: { $ne: "cancelled" } } },
  { $unwind: "$items" },
  { $group: { _id: "$items.category",
              revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
              units:   { $sum: "$items.qty" } } },
  { $sort: { revenue: -1 } }
])</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>_id</th><th>revenue</th><th>units</th></tr>
    <tr><td>Electronics</td><td>2300</td><td>4</td></tr><tr><td>Furniture</td><td>350</td><td>6</td></tr>
  </table>
  <div class="callout pred"><span class="label">Think first</span>
    <p>Without <code>$unwind</code>, <code>_id: "$items.category"</code> would group by the whole <em>array</em> of categories, e.g. <code>["Electronics", "Furniture"]</code> as one key. Wrong answer, no error.</p>
  </div>
  <h3>Top product by revenue</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: { $ne: "cancelled" } } },
  { $unwind: "$items" },
  { $group: { _id: "$items.product",
              units: { $sum: "$items.qty" },
              revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } } } },
  { $sort: { revenue: -1 } },
  { $limit: 1 }
])
// { _id: 'Phone', units: 3, revenue: 1500 }</div>
  <p>By units instead, Lamp wins (5 units, but only 200 revenue). Ties need a tie-breaker in <code>$sort</code>, e.g. <code>{ units: -1, _id: 1 }</code>.</p>
  <h3>Orders per month</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$order_date" } },
              orders: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>_id</th><th>orders</th></tr>
    <tr><td>2024-05</td><td>2</td></tr><tr><td>2024-06</td><td>2</td></tr><tr><td>2024-07</td><td>1</td></tr>
  </table>
  <p>Alternatives: <code>{ y: { $year: "$order_date" }, m: { $month: "$order_date" } }</code>, or <code>$dateTrunc</code> (5.0+) to keep a real date.</p>

  <h2 id="ma-adv"><span class="num">08</span>$facet, $bucket, Windows</h2>
  <p><strong>$facet</strong> runs several sub-pipelines on the same input in one pass. Typical use: a search page with results plus counts per filter.</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $facet: {
      byStatus: [ { $group: { _id: "$status", n: { $sum: 1 } } }, { $sort: { _id: 1 } } ],
      total:    [ { $count: "orders" } ]
  } }
])
// { byStatus: [ { _id: 'cancelled', n: 1 }, { _id: 'delivered', n: 3 }, { _id: 'pending', n: 1 } ],
//   total: [ { orders: 5 } ] }</div>
  <p><strong>$bucket</strong> groups numbers into ranges (a histogram). Each bucket's <code>_id</code> is its lower bound; the upper bound is exclusive.</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $addFields: { total: { $sum: { $map: { input: "$items", as: "i",
                    in: { $multiply: ["$$i.qty", "$$i.price"] } } } } } },
  { $bucket: { groupBy: "$total", boundaries: [0, 500, 1000, 2000], default: "other",
               output: { n: { $sum: 1 }, ids: { $push: "$_id" } } } }
])
// { _id: 0,    n: 2, ids: [102, 104] }
// { _id: 500,  n: 2, ids: [100, 101] }
// { _id: 1000, n: 1, ids: [103] }</div>
  <p><strong>$setWindowFields</strong> (5.0+) is SQL's <code>OVER (PARTITION BY ... ORDER BY ...)</code>: it adds a value to each document without collapsing rows. Running spend per customer:</p>
  <div class="fx" data-lang="js">// after the $addFields total stage above
{ $setWindowFields: {
    partitionBy: "$customer_id",
    sortBy: { order_date: 1 },
    output: { running: { $sum: "$total",
                         window: { documents: ["unbounded", "current"] } } } } }</div>
  <table class="tbl out"><caption>Result</caption>
    <tr><th>_id</th><th>customer_id</th><th>total</th><th>running</th></tr>
    <tr><td>100</td><td>1</td><td>880</td><td>880</td></tr>
    <tr><td>101</td><td>1</td><td>500</td><td>1380</td></tr>
    <tr><td>102</td><td>2</td><td>150</td><td>150</td></tr>
    <tr><td>103</td><td>3</td><td>1150</td><td>1150</td></tr>
    <tr><td>104</td><td>3</td><td>120</td><td>1270</td></tr>
  </table>
  <p>Ranking works too: <code>output: { r: { $rank: {} } }</code> with <code>sortBy</code>.</p>

  <h2 id="ma-perf"><span class="num">09</span>Performance Rules</h2>
  <ul>
    <li><strong>$match and $sort first.</strong> Only stages at the start of the pipeline, reading the collection directly, can use an index. After <code>$group</code> or <code>$unwind</code>, documents are new in-memory objects with no index.</li>
    <li><strong>Project early</strong> only when it removes big fields; the optimizer already tracks which fields are needed.</li>
    <li><strong>$sort + $limit</strong> next to each other become a top-k sort that keeps only k documents in memory.</li>
    <li><strong>100 MB per stage.</strong> Blocking stages (<code>$group</code>, <code>$sort</code>, <code>$bucket</code>) may use 100 MB of RAM each. Beyond that they spill to disk if <code>allowDiskUse: true</code> (default since 6.0), otherwise the query errors. Spilling is slow.</li>
    <li><strong>$lookup is a query per input document.</strong> Index the <code>foreignField</code>, filter and group before the lookup, and avoid it in hot paths. It cannot target a sharded collection in older versions (before 5.1).</li>
    <li><strong>$unwind multiplies documents.</strong> 1M orders × 5 items = 5M documents in the next stage.</li>
    <li><strong>16 MB result docs.</strong> Each output document (e.g. a <code>$facet</code> result or a big <code>$push</code> array) must fit in 16 MB.</li>
  </ul>
  <div class="fx" data-lang="js">db.orders.explain("executionStats").aggregate([ { $match: { status: "delivered" } }, ... ])
// look for IXSCAN (index used) vs COLLSCAN (full scan) in the first stage</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Putting <code>$match: { status: "delivered" }</code> <em>after</em> <code>$unwind</code> gives the same answer but filters 5× more documents and loses the index. The optimizer can move some matches earlier, but don't rely on it.</p>
  </div>

  <h2 id="ma-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li>Pipeline = array of stages; documents flow through in written order.</li>
    <li><code>"$field"</code> reads a field; <code>"$$var"</code> reads a variable (e.g. inside <code>$map</code>).</li>
    <li><strong>$group</strong>: <code>_id</code> is the key; other fields must be accumulators (<code>$sum $avg $max $push $addToSet</code>).</li>
    <li>WHERE → <code>$match</code> before group; HAVING → <code>$match</code> after group.</li>
    <li><strong>$unwind</strong> = one doc per array element; drops empty/missing arrays unless <code>preserveNullAndEmptyArrays</code>.</li>
    <li>Grouping by an array field without <code>$unwind</code> groups by the whole array.</li>
    <li><strong>$lookup</strong> = left join into an array; costly, index <code>foreignField</code>, group before joining.</li>
    <li><code>$facet</code> = many views in one pass; <code>$bucket</code> = histogram; <code>$setWindowFields</code> = window functions.</li>
    <li>Index use only at the start; 100 MB per blocking stage, <code>allowDiskUse</code> to spill.</li>
  </ol></div>

  <h2 id="ma-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need <code>aggregate()</code> instead of <code>find()</code>?</summary><div class="qa-body">Whenever you compute across documents (counts, sums per group), reshape or compute new fields beyond simple projection, join collections, flatten arrays, or use window functions. <code>find()</code> only filters, projects, sorts and pages.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: number of orders per status, most common first.</summary><div class="qa-body"><code>[ { $group: { _id: "$status", n: { $sum: 1 } } }, { $sort: { n: -1 } } ]</code> → delivered 3, then cancelled 1 and pending 1 (tie order not guaranteed; add <code>_id: 1</code> to the sort).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: total units sold per product, excluding cancelled orders.</summary><div class="qa-body"><code>[ { $match: { status: { $ne: "cancelled" } } }, { $unwind: "$items" }, { $group: { _id: "$items.product", units: { $sum: "$items.qty" } } }, { $sort: { units: -1 } } ]</code> → Lamp 5, Phone 3, Desk 1, Laptop 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you express HAVING? Write: customers with 2 or more orders.</summary><div class="qa-body">A <code>$match</code> after <code>$group</code>: <code>[ { $group: { _id: "$customer_id", n: { $sum: 1 } } }, { $match: { n: { $gte: 2 } } } ]</code> → customers 1 and 3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>[ { $unwind: "$items" }, { $count: "n" } ]</code> on the shop orders.</summary><div class="qa-body">7: the number of line items (2+1+1+2+1), not the 5 orders. <code>$unwind</code> creates one document per array element.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A pipeline groups by <code>"$items.category"</code> without <code>$unwind</code>. What goes wrong?</summary><div class="qa-body"><code>"$items.category"</code> evaluates to an array per order, e.g. <code>["Electronics","Furniture"]</code> for order 100. Groups are formed per distinct array, not per category. No error, just wrong numbers. Unwind first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: each customer's name and number of orders, including customers with none.</summary><div class="qa-body">On <code>customers</code>: <code>[ { $lookup: { from: "orders", localField: "_id", foreignField: "customer_id", as: "o" } }, { $project: { name: 1, n: { $size: "$o" } } } ]</code>. <code>$lookup</code> is a left join, so Dia appears with 0. Don't <code>$unwind</code> the array, or Dia disappears.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should <code>$match</code> come first in a pipeline?</summary><div class="qa-body">(1) It can use an index only when it reads the collection directly. (2) It shrinks the stream, so later stages ($unwind, $group, $lookup) process fewer documents and stay under the 100 MB memory limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your <code>$group</code> fails with "exceeded memory limit". Options?</summary><div class="qa-body">Filter earlier and project away large fields; check that <code>allowDiskUse: true</code> is set (lets it spill to disk, slower); pre-aggregate into a summary collection with <code>$merge</code> on a schedule; or move heavy analytics to a warehouse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>$push</code> vs <code>$addToSet</code> in <code>$group</code>?</summary><div class="qa-body"><code>$push</code> collects every value, duplicates included (customer 1's statuses: [delivered, delivered]). <code>$addToSet</code> keeps unique values only ([delivered]) and does not guarantee order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: running total of spend per customer over time.</summary><div class="qa-body"><code>$addFields</code> an order total (sum of qty × price via <code>$map</code>), then <code>$setWindowFields: { partitionBy: "$customer_id", sortBy: { order_date: 1 }, output: { running: { $sum: "$total", window: { documents: ["unbounded", "current"] } } } }</code>. Customer 3 → 1150, then 1270.</div></details>
</main>`
});
