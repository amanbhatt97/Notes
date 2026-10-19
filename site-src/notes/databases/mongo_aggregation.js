// notes/databases/mongo_aggregation.js — Aggregation Pipeline
Object.assign(TOPIC_CONTENT, {
  "mongo_aggregation": `<main>
  <h1>Aggregation Pipeline</h1>
  <p class="lead">The aggregation pipeline is how MongoDB answers questions that need more than "find these documents": totals, group-bys, joins, running sums. You build it as a list of small steps, and documents flow through them in order. Every pipeline on this page was run on a real MongoDB 8 server on the shop data from <a class="xref" data-note="mongo_basics">Documents &amp; CRUD</a>, and every result shown is real. Builds on find/filter and SQL GROUP BY.</p>

  <h2 id="ma-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Aggregation Pipeline</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li><b>Pipeline</b> — array of stages; docs flow through in written order</li>
          <li><b>Why</b> — find() only filters/projects; totals, groups, joins need a pipeline</li>
          <li><b><code>"$field"</code></b> = that field's value; <code>"field"</code> = plain text; <b><code>"$$var"</code></b> = a variable</li>
          <li><b>Stages</b> can repeat, any order; order changes meaning and speed</li>
          <li>⚠ <b>No $sort</b> → output order not guaranteed</li>
          <li>💡 assembly line: each station sees only what the last one handed over</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Filter &amp; reshape</div>
        <ul>
          <li><b>$match</b> — find() filter syntax; put it first</li>
          <li><b>$project</b> — keep/drop/rename/compute; unlisted fields dropped</li>
          <li><b>$addFields</b> (= <code>$set</code>) — add fields, keep the rest</li>
          <li><b>Array math</b> — <code>$sum: { $map: { input: "$items", as: "i", in: … } }</code></li>
          <li><b>Expressions</b> — <code>$filter $cond $size $multiply $dateToString</code></li>
          <li>⚠ <b>$project { total: … }</b> drops every other field</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">$group</div>
        <ul>
          <li><b>_id</b> = group key; <code>_id: null</code> = one group; compound <code>{ a: "$a", b: "$b" }</code></li>
          <li><b>Accumulators</b> — <code>$sum: 1</code> (COUNT), <code>$sum $avg $min $max</code></li>
          <li><b>$push</b> = list with dups; <b>$addToSet</b> = distinct, unordered</li>
          <li><b>$first / $last</b> — only meaningful after <code>$sort</code></li>
          <li><b>HAVING</b> = <code>$match</code> after <code>$group</code></li>
          <li>⚠ After group only <code>_id</code> + accumulators exist</li>
          <li>⚠ <code>$sum</code> skips strings and missing values silently</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">$unwind</div>
        <ul>
          <li><b>What</b> — one doc with an n-element array → n docs, one element each</li>
          <li><b>Why</b> — group by something inside an array (category)</li>
          <li>⚠ <b>Empty/missing arrays dropped</b> — <code>preserveNullAndEmptyArrays: true</code></li>
          <li>⚠ <b>Fan-out</b> — <code>$sum: 1</code> now counts items, not orders</li>
          <li>⚠ <b>Group by array field without unwind</b> → key is the whole array, no error</li>
          <li>💡 photocopy the bill once per line item</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">$lookup (join)</div>
        <ul>
          <li><b>Left outer join</b> into an array: <code>{ from, localField, foreignField, as }</code></li>
          <li><b>No match</b> → <code>[]</code> (Dia: 0 orders)</li>
          <li><b>+ $unwind</b> → one row per pair, drops unmatched (inner join)</li>
          <li><b>Sub-pipeline</b> — add <code>pipeline: [...]</code> (or <code>let</code> + <code>$expr</code>) for extra conditions</li>
          <li><b>Cost</b> — a lookup per input doc; index <code>foreignField</code>; group first</li>
          <li><b>Hot path?</b> schema smell → extended reference (copy the name)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SQL → stage</div>
        <ul>
          <li><b>WHERE</b> → $match · <b>SELECT</b> → $project / $addFields</li>
          <li><b>GROUP BY</b> → $group · <b>HAVING</b> → $match after</li>
          <li><b>JOIN</b> → $lookup (+ $unwind) · <b>UNION ALL</b> → $unionWith</li>
          <li><b>ORDER/LIMIT/OFFSET</b> → $sort / $limit / $skip · <b>COUNT</b> → $count</li>
          <li><b>OVER()</b> → $setWindowFields · <b>CREATE TABLE AS</b> → $out / $merge</li>
          <li><b>Key difference</b> — runs in written order</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Advanced stages</div>
        <ul>
          <li><b>$facet</b> — several sub-pipelines, one pass (results + filter counts)</li>
          <li><b>$bucket</b> — histogram; <code>_id</code> = lower bound, upper exclusive, <code>default</code></li>
          <li><b>$setWindowFields</b> (5.0+) — <code>partitionBy</code>, <code>sortBy</code>, <code>window</code>; rows not collapsed</li>
          <li><b>Window ops</b> — running <code>$sum</code>, <code>$rank</code>, <code>$shift</code> (LAG)</li>
          <li><b>Dates</b> — <code>$dateToString "%Y-%m"</code>, <code>$dateTrunc</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Performance</div>
        <ul>
          <li><b>$match + $sort first</b> — only the start can use indexes</li>
          <li><b>Measured</b> — 200k docs: COLLSCAN 200,000 examined → IXSCAN 4,000</li>
          <li><b>Optimizer</b> moves simple $match earlier; not one on a computed field</li>
          <li><b>$sort + $limit</b> → top-k, keeps k docs</li>
          <li><b>100 MB per blocking stage</b>; spills to disk (allowDiskUse, default 6.0+)</li>
          <li><b>16 MB</b> per output doc ($facet, big $push)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">From Python</div>
        <ul>
          <li><b>pymongo</b> — <code>db.orders.aggregate(pipeline)</code>, pipeline = list of dicts</li>
          <li><b>Flat output</b> — <code>$project</code> keys out of <code>_id</code> → <code>pd.DataFrame(rows)</code></li>
          <li><b>Big data</b> — aggregate in Mongo, pull the small result; <code>$merge</code> to a summary collection</li>
        </ul>
      </div>
    </div>
  </div>

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
      <div class="rm-item rm-done" data-target="ma-perf"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Performance Rules</span><span class="rm-sub">explain() on 200k documents</span></div></div>
      <div class="rm-item rm-done" data-target="ma-py"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">From Python</span><span class="rm-sub">Pipeline to pandas</span></div></div>
      <div class="rm-item rm-done" data-target="ma-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Wrong numbers, no errors</span></div></div>
      <div class="rm-item rm-done" data-target="ma-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Write-the-pipeline drills</span></div></div>
    </div>
  </div>

  <h2 id="ma-idea"><span class="num">01</span>The Pipeline Idea</h2>
  <p>The shop owner asks: "How many delivered orders has each customer placed?" <code>find()</code> can return the delivered orders, but it cannot count them per customer. Pulling every order into Python and counting there works for 5 orders. For 50 million it means shipping gigabytes over the network to do a sum the database could have done in place.</p>
  <p>The <strong>aggregation pipeline</strong> lets the database do that work. You write a list of <strong>stages</strong>. Each stage does one small job: filter, reshape, group, sort. Documents enter the first stage, its output feeds the second, and so on. What comes out of the last stage is the answer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A mango-packing line. Station 1 throws out bruised mangoes (<code>$match</code>). Station 2 cuts crates open into single mangoes (<code>$unwind</code>). Station 3 sorts them into bins by variety and counts each bin (<code>$group</code>). Station 4 lines up the bins, biggest first (<code>$sort</code>). Each worker sees only what the previous worker handed over, never the original truck.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="ma-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g text-anchor="middle">
      <rect x="0" y="20" width="96" height="56" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="48" y="44" font-weight="bold">orders</text><text x="48" y="62" font-size="11" class="tm">collection</text>
      <rect x="124" y="20" width="96" height="56" rx="6" class="fb sb"/><text x="172" y="44">$match</text><text x="172" y="62" font-size="10" class="tm">≠ cancelled</text>
      <rect x="248" y="20" width="96" height="56" rx="6" class="ft st"/><text x="296" y="44">$unwind</text><text x="296" y="62" font-size="10" class="tm">$items</text>
      <rect x="372" y="20" width="96" height="56" rx="6" class="fv sb"/><text x="420" y="44">$group</text><text x="420" y="62" font-size="10" class="tm">by category</text>
      <rect x="496" y="20" width="96" height="56" rx="6" class="fg sg"/><text x="544" y="44">$sort</text><text x="544" y="62" font-size="10" class="tm">revenue -1</text>
    </g>
    <g stroke="currentColor"><line x1="96" y1="48" x2="122" y2="48" marker-end="url(#ma-ar)"/><line x1="220" y1="48" x2="246" y2="48" marker-end="url(#ma-ar)"/><line x1="344" y1="48" x2="370" y2="48" marker-end="url(#ma-ar)"/><line x1="468" y1="48" x2="494" y2="48" marker-end="url(#ma-ar)"/></g>
    <g text-anchor="middle" font-size="11"><text x="48" y="100">5 docs</text><text x="172" y="100">4 orders</text><text x="296" y="100" class="tr">6 items</text><text x="420" y="100">2 groups</text><text x="544" y="100">2 sorted</text></g>
    <g class="tb">
      <rect x="28" y="110" width="8" height="10"/><rect x="38" y="110" width="8" height="10"/><rect x="48" y="110" width="8" height="10"/><rect x="58" y="110" width="8" height="10"/><rect x="68" y="110" width="8" height="10"/>
      <rect x="156" y="110" width="8" height="10"/><rect x="166" y="110" width="8" height="10"/><rect x="176" y="110" width="8" height="10"/><rect x="186" y="110" width="8" height="10"/>
      <rect x="270" y="110" width="8" height="10"/><rect x="280" y="110" width="8" height="10"/><rect x="290" y="110" width="8" height="10"/><rect x="300" y="110" width="8" height="10"/><rect x="310" y="110" width="8" height="10"/><rect x="320" y="110" width="8" height="10"/>
      <rect x="410" y="110" width="8" height="10"/><rect x="420" y="110" width="8" height="10"/>
      <rect x="534" y="110" width="8" height="10"/><rect x="544" y="110" width="8" height="10"/>
    </g>
    <text x="0" y="144" font-size="10" class="tm">indexes help only at the start (reading the collection); later stages work on in-memory docs</text>
  </svg><figcaption>Revenue per category: document count at each station. $unwind grows the stream; $group shrinks it.</figcaption></figure>
  <p>The shop data: 5 orders (100–104), each with an <code>items</code> array of <code>{ product, category, qty, price }</code>; 4 customers (Asha, Ben, Chen, Dia). This first pipeline answers the owner's question in two stages, plus a sort so the output order is fixed.</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$customer_id", orders: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[ { _id: 1, orders: 2 }, { _id: 3, orders: 1 } ]</div>
  <p>Trace it. <code>$match</code> keeps orders 100, 101, 103 (the delivered ones). <code>$group</code> puts them in bins by <code>customer_id</code>: bin 1 gets 100 and 101, bin 3 gets 103. <code>$sum: 1</code> adds 1 per document in the bin, which is a count. <code>$sort</code> orders the bins by id.</p>
  <p>The <code>$</code> sign matters. Inside a stage, <code>"$status"</code> means "the value of the status field", while <code>"status"</code> is just the word "status". Run on order 100, <code>{ a: "status", b: "$status" }</code> gives <code>{ a: 'status', b: 'delivered' }</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pipeline</strong>: an array of stages run in order. <strong>Stage</strong>: one step, written <code>{ $stageName: { ... } }</code>, that takes a stream of documents and outputs a new stream. <strong>Field path</strong>: <code>"$field"</code>, the value of a field in the current document.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Without a <code>$sort</code>, output order is not guaranteed. A report that "always came out in order" in testing can come out shuffled in production. All results on this page are sorted on purpose.</p>
  </div>
  <p>Where it matters: dashboards and reports built directly on MongoDB, pre-computing features for ML from event logs, and backend endpoints like "my spending this month". Interviews give a SQL query and ask you to write the pipeline.</p>

  <h2 id="ma-basic"><span class="num">02</span>Filter &amp; Reshape</h2>
  <p>Our orders do not store a total. The total is hidden inside the items array: qty × price for each item, added up. Before we can group or sort by total, we must compute it for every order. That is a <em>reshape</em> step, and it usually comes right after a <em>filter</em> step.</p>
  <div class="cards">
    <div><b>$match</b><p>Same filter syntax as find(). Keeps matching documents. Put it first.</p></div>
    <div><b>$project</b><p>Choose the output fields: keep, drop, rename, compute. Unlisted fields are dropped (except <code>_id</code>).</p></div>
    <div><b>$addFields</b><p>Alias <code>$set</code>. Adds or overwrites fields and keeps all the rest.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Filling in the "Total" box at the bottom of each bill. You go down the item lines, multiply quantity by rate for each line, and add the results. <code>$map</code> is "do this for every line"; <code>$sum</code> is "add them up".</p>
  </div>
  <p>Worked by hand for order 100 first:</p>
  <table class="tbl">
    <tr><th>Step</th><th>Value</th></tr>
    <tr><td><code>$items</code></td><td>[ {Laptop, qty 1, price 800}, {Lamp, qty 2, price 40} ]</td></tr>
    <tr><td><code>$map</code>: qty × price for each element <code>i</code></td><td>[ 800, 80 ]</td></tr>
    <tr><td><code>$sum</code> of that array</td><td>880</td></tr>
  </table>
  <p>The pipeline below adds a <code>total</code> field to every order with exactly those steps, then keeps only a few fields to print.</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $addFields: {
      total: { $sum: { $map: { input: "$items", as: "i",
                               in: { $multiply: ["$$i.qty", "$$i.price"] } } } } } },
  { $project: { customer_id: 1, status: 1, total: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 100, customer_id: 1, status: 'delivered', total: 880 },
  { _id: 101, customer_id: 1, status: 'delivered', total: 500 },
  { _id: 102, customer_id: 2, status: 'cancelled', total: 150 },
  { _id: 103, customer_id: 3, status: 'delivered', total: 1150 },
  { _id: 104, customer_id: 3, status: 'pending', total: 120 }
]</div>
  <p>In <code>$map</code>, <code>input</code> is the array, <code>as: "i"</code> names the loop variable, and <code>in</code> is what to compute per element. Inside, the variable is read with a <strong>double</strong> dollar, <code>"$$i.qty"</code>, because a single <code>$</code> would look for a field called <code>i</code> on the order. <code>$project</code> then listed three fields, so only those plus <code>_id</code> came out.</p>
  <p>Other expressions you will use often: <code>$filter</code> (keep some array elements), <code>$cond</code> (if-then-else), <code>$size</code> (array length), <code>$ifNull</code> (default for missing). For example, <code>{ $filter: { input: "$items", as: "i", cond: { $gte: ["$$i.price", 500] } } }</code> keeps only items priced 500 or more: order 100 keeps the Laptop, order 102 gets <code>[]</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Expression</strong>: a computed value inside a stage, such as <code>{ $multiply: [a, b] }</code>. <strong>"$$var"</strong>: a variable (from <code>$map</code>, <code>$filter</code>, <code>$lookup let</code>). <strong>$project</strong> shapes the output; <strong>$addFields</strong> adds to it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>$project</code> keeps only what you list. On order 100, <code>{ $project: { total: { $size: "$items" } } }</code> returns just <code>{ _id: 100, total: 2 }</code>; customer, date and items are gone. If you only want to <em>add</em> a field, use <code>$addFields</code>, which returned the full order plus <code>n_items: 2</code>.</p>
  </div>

  <h2 id="ma-group"><span class="num">03</span>$group &amp; Accumulators</h2>
  <p>Most business questions are "per something": orders per customer, revenue per city, average rating per product. In SQL that is <code>GROUP BY</code>. In a pipeline it is the <code>$group</code> stage.</p>
  <p><code>$group</code> needs an <code>_id</code>: the value to group by. Documents with the same <code>_id</code> value land in the same bin. Every other field you write must be an <strong>accumulator</strong>: a rule for combining the values in one bin, such as sum, average or max.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher collecting answer sheets into piles by section: A, B, C. That is the <code>_id</code>. Then for each pile she writes on a sticky note: number of sheets (<code>$sum: 1</code>), highest mark (<code>$max</code>), list of roll numbers (<code>$push</code>). Only the piles and their sticky notes go forward; the sheets themselves do not.</p>
  </div>
  <table class="tbl">
    <tr><th>Accumulator</th><th>SQL cousin</th><th>Note</th></tr>
    <tr><td><code>$sum: 1</code></td><td><code>COUNT(*)</code></td><td>Adds 1 per document</td></tr>
    <tr><td><code>$sum: "$x"</code></td><td><code>SUM(x)</code></td><td>Non-numbers are skipped</td></tr>
    <tr><td><code>$avg $min $max</code></td><td><code>AVG MIN MAX</code></td><td>Ignore missing values</td></tr>
    <tr><td><code>$push</code></td><td><code>ARRAY_AGG(x)</code></td><td>Collects all values, with duplicates</td></tr>
    <tr><td><code>$addToSet</code></td><td><code>ARRAY_AGG(DISTINCT x)</code></td><td>Unique values, order not guaranteed</td></tr>
    <tr><td><code>$first $last</code></td><td>—</td><td>Meaningful only after a <code>$sort</code></td></tr>
  </table>
  <p>This pipeline groups all orders by customer and computes three things per bin.</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $group: { _id: "$customer_id",
              n: { $sum: 1 },
              last_order: { $max: "$order_date" },
              statuses: { $push: "$status" } } },
  { $sort: { _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  {
    _id: 1,
    n: 2,
    last_order: ISODate('2024-05-20T00:00:00.000Z'),
    statuses: [ 'delivered', 'delivered' ]
  },
  {
    _id: 2,
    n: 1,
    last_order: ISODate('2024-06-02T00:00:00.000Z'),
    statuses: [ 'cancelled' ]
  },
  {
    _id: 3,
    n: 2,
    last_order: ISODate('2024-07-01T00:00:00.000Z'),
    statuses: [ 'delivered', 'pending' ]
  }
]</div>
  <p>Customer 1's bin held orders 100 and 101, so <code>n</code> is 2, the later date wins <code>$max</code>, and <code>$push</code> listed both statuses, duplicate included. With <code>$addToSet</code> instead, customer 1 gets <code>[ 'delivered' ]</code>. Dia (customer 4) has no orders, so no bin. <code>_id: null</code> puts every document into one bin: <code>{ _id: null, orders: 5, ... }</code>.</p>
  <p><strong>HAVING</strong> (filter on a computed group value) is simply a second <code>$match</code> after the group:</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $group: { _id: "$customer_id", n: { $sum: 1 } } },
  { $match: { n: { $gte: 2 } } },
  { $sort: { _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[ { _id: 1, n: 2 }, { _id: 3, n: 2 } ]</div>
  <p>To group by two fields, make <code>_id</code> an object: <code>_id: { cust: "$customer_id", status: "$status" }</code> gives bins like <code>{ cust: 3, status: 'pending' }</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Group key</strong>: the <code>_id</code> of <code>$group</code>. <strong>Accumulator</strong>: an operator that folds many values into one per group (<code>$sum</code>, <code>$avg</code>, <code>$max</code>, <code>$push</code>, ...).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>After <code>$group</code>, only <code>_id</code> and the accumulators exist. A later <code>$project: { n: 1, status: 1, customer_id: 1 }</code> returns just <code>{ _id: 1, n: 2 }</code>: <code>status</code> is gone and <code>customer_id</code> is now called <code>_id</code>. Second trap: <code>$sum</code> silently skips text. On values <code>10, "20", 5</code> and one missing, the real result was <code>total: 15, avg: 7.5</code>, not 35. Data loaded from CSV often has numbers stored as strings.</p>
  </div>

  <h2 id="ma-unwind"><span class="num">04</span>$unwind</h2>
  <p>Now the owner asks for "revenue per category". Category is not a field of the order; it lives inside each item of the <code>items</code> array, and one order can contain both Electronics and Furniture. <code>$group</code> needs one value per document to put it in a bin. An order with two categories cannot go in two bins at once.</p>
  <p><code>$unwind</code> solves it by splitting. One order with a 2-item array becomes 2 documents, each holding one item. Every other field (the order <code>_id</code>, customer, status) is copied onto both. After that, each document has exactly one category, and grouping works.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Photocopying a bill once per line item and cutting each copy so it shows only one line. Each slip still carries the bill number and the customer's name. Now you can sort slips into category trays.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="ma-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="20" width="220" height="90" rx="6" class="fb sb"/>
    <text x="10" y="40" font-size="11">_id 100 · customer 1</text><text x="10" y="58" font-size="11">items: [</text>
    <rect x="20" y="64" width="90" height="24" rx="4" class="ft st"/><text x="65" y="80" text-anchor="middle" font-size="11">Laptop</text>
    <rect x="118" y="64" width="90" height="24" rx="4" class="fv sb"/><text x="163" y="80" text-anchor="middle" font-size="11">Lamp</text>
    <text x="10" y="104" font-size="11">]</text>
    <line x1="222" y1="65" x2="290" y2="65" stroke="currentColor" marker-end="url(#ma-ar2)"/><text x="256" y="58" text-anchor="middle" font-size="10" class="tm">$unwind</text>
    <rect x="300" y="8" width="290" height="50" rx="6" class="fb sb"/><text x="310" y="28" font-size="11">_id 100 · customer 1</text>
    <rect x="310" y="34" width="190" height="20" rx="4" class="ft st"/><text x="318" y="48" font-size="11">items: Laptop (object)</text>
    <rect x="300" y="70" width="290" height="50" rx="6" class="fb sb"/><text x="310" y="90" font-size="11">_id 100 · customer 1</text>
    <rect x="310" y="96" width="190" height="20" rx="4" class="fv sb"/><text x="318" y="110" font-size="11">items: Lamp (object)</text>
  </svg><figcaption>One document per array element; parent fields are copied onto each. Same _id twice.</figcaption></figure>
  <p>Run it on order 100 alone to see the split:</p>
  <div class="fx" data-lang="js">db.orders.aggregate([ { $match: { _id: 100 } }, { $unwind: "$items" } ])</div>
  <div class="fx" data-lang="text">[
  {
    _id: 100,
    customer_id: 1,
    order_date: ISODate('2024-05-01T00:00:00.000Z'),
    status: 'delivered',
    items: { product: 'Laptop', category: 'Electronics', qty: 1, price: 800 }
  },
  {
    _id: 100,
    customer_id: 1,
    order_date: ISODate('2024-05-01T00:00:00.000Z'),
    status: 'delivered',
    items: { product: 'Lamp', category: 'Furniture', qty: 2, price: 40 }
  }
]</div>
  <p>Two documents, both with <code>_id: 100</code>. <code>items</code> is now a single object, not an array, so <code>"$items.category"</code> is one plain value. Over the whole collection, the 5 orders hold 2+1+1+2+1 = 7 items, and <code>[ { $unwind: "$items" }, { $count: "n" } ]</code> returns <code>[ { n: 7 } ]</code>.</p>
  <p>To test the edge case, we inserted a temporary order 105 with <code>items: []</code>, then removed it:</p>
  <table class="tbl out"><caption>Real counts with order 105 (empty items) added</caption>
    <tr><th>Pipeline</th><th>Result</th><th>Why</th></tr>
    <tr><td><code>{ $unwind: "$items" }</code>, <code>$count</code></td><td>7</td><td>Order 105 vanished</td></tr>
    <tr><td><code>{ $unwind: { path: "$items", preserveNullAndEmptyArrays: true } }</code>, <code>$count</code></td><td>8</td><td>105 kept, with no <code>items</code> field</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$unwind</strong>: output one copy of the document per element of an array field, with that field replaced by the single element. <strong>Fan-out</strong>: one input row becoming many output rows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Empty or missing arrays are <strong>dropped</strong> by default, like an inner join. And after unwinding, <code>$sum: 1</code> counts items, not orders: for customer 1 it gave 3, while the real order count is 2. Count distinct orders with <code>$addToSet: "$_id"</code> and <code>$size</code>, or count before unwinding.</p>
  </div>

  <h2 id="ma-lookup"><span class="num">05</span>$lookup</h2>
  <p>Orders store only <code>customer_id</code>. A report that needs the customer's <em>name</em> next to their revenue must fetch it from the <code>customers</code> collection. In SQL that is a JOIN. In a pipeline it is <code>$lookup</code>.</p>
  <p><code>$lookup</code> takes each incoming document, finds the matching documents in another collection, and attaches them as an <strong>array field</strong>. You give four things: <code>from</code> (the other collection), <code>localField</code> (field here), <code>foreignField</code> (field there), and <code>as</code> (name of the new array).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school clerk going through the student register. For each student, she walks to the fee cabinet, pulls every receipt with that roll number, and staples them to the student's page. A student with no receipts still keeps the page, with nothing stapled.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <text x="0" y="14" font-size="11" class="tm">customers</text><text x="200" y="14" font-size="11" class="tm">+ as: "orders" (array from orders)</text>
    <g font-size="11">
      <rect x="0" y="22" width="120" height="26" rx="4" class="fb sb"/><text x="10" y="40">1 Asha</text>
      <rect x="0" y="54" width="120" height="26" rx="4" class="fb sb"/><text x="10" y="72">2 Ben</text>
      <rect x="0" y="86" width="120" height="26" rx="4" class="fb sb"/><text x="10" y="104">3 Chen</text>
      <rect x="0" y="118" width="120" height="26" rx="4" class="fb sb"/><text x="10" y="136">4 Dia</text>
      <rect x="200" y="22" width="70" height="26" rx="4" class="ft st"/><text x="235" y="40" text-anchor="middle">100</text><rect x="276" y="22" width="70" height="26" rx="4" class="ft st"/><text x="311" y="40" text-anchor="middle">101</text>
      <rect x="200" y="54" width="70" height="26" rx="4" class="ft st"/><text x="235" y="72" text-anchor="middle">102</text>
      <rect x="200" y="86" width="70" height="26" rx="4" class="ft st"/><text x="235" y="104" text-anchor="middle">103</text><rect x="276" y="86" width="70" height="26" rx="4" class="ft st"/><text x="311" y="104" text-anchor="middle">104</text>
      <rect x="200" y="118" width="70" height="26" rx="4" fill="none" stroke="currentColor" stroke-dasharray="4 3" opacity=".6"/><text x="235" y="136" text-anchor="middle">[ ]</text>
      <text x="420" y="40" class="tm">$size → 2</text><text x="420" y="72" class="tm">$size → 1</text><text x="420" y="104" class="tm">$size → 2</text><text x="420" y="136" class="tr">$size → 0 (kept)</text>
    </g>
    <g stroke="currentColor" opacity=".5"><line x1="120" y1="35" x2="198" y2="35"/><line x1="120" y1="67" x2="198" y2="67"/><line x1="120" y1="99" x2="198" y2="99"/><line x1="120" y1="131" x2="198" y2="131"/></g>
  </svg><figcaption>$lookup keeps every left document and attaches matches as an array. Dia gets an empty one: a left outer join.</figcaption></figure>
  <p>This pipeline attaches each customer's orders and then counts them with <code>$size</code>.</p>
  <div class="fx" data-lang="js">db.customers.aggregate([
  { $lookup: { from: "orders", localField: "_id",
               foreignField: "customer_id", as: "orders" } },
  { $project: { _id: 0, name: 1, n_orders: { $size: "$orders" } } }
])</div>
  <div class="fx" data-lang="text">[
  { name: 'Asha', n_orders: 2 },
  { name: 'Ben', n_orders: 1 },
  { name: 'Chen', n_orders: 2 },
  { name: 'Dia', n_orders: 0 }
]</div>
  <p>For Ben, <code>$lookup</code> searched <code>orders</code> for <code>customer_id = 2</code>, found order 102, and set <code>orders: [ {order 102 ...} ]</code> on his document. Dia matched nothing and got <code>orders: []</code>, so she is still in the output with 0. That is exactly SQL's LEFT JOIN, checked in SQLite on the same data:</p>
  <div class="fx" data-lang="sql">SELECT c.name, COUNT(o.order_id) AS n_orders
FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name;
-- [('Asha', 2), ('Ben', 1), ('Chen', 2), ('Dia', 0)]</div>
  <p>Adding <code>{ $unwind: "$o" }</code> after the lookup gives one row per customer–order pair (5 rows) and drops Dia, like an inner join. To add conditions on the joined side, give <code>$lookup</code> its own small <code>pipeline</code>:</p>
  <div class="fx" data-lang="js">db.customers.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "customer_id",
               pipeline: [ { $match: { status: "delivered" } }, { $project: { _id: 1 } } ],
               as: "delivered" } },
  { $project: { _id: 0, name: 1, delivered: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  { name: 'Asha', delivered: [ { _id: 100 }, { _id: 101 } ] },
  { name: 'Ben', delivered: [] },
  { name: 'Chen', delivered: [ { _id: 103 } ] },
  { name: 'Dia', delivered: [] }
]</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$lookup</strong>: a left outer join that stores matches in an array. The form with <code>localField</code> + <code>pipeline</code> needs MongoDB 5.0+; older servers use <code>let: { cid: "$_id" }</code> and <code>$expr: { $eq: ["$customer_id", "$$cid"] }</code> inside the pipeline (same result).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Needing <code>$lookup</code> on every page view is a schema smell. It runs a lookup per input document. If the order page always shows the customer name, store a copy of it in the order (the <em>extended reference</em> pattern in <a class="xref" data-note="mongo_design">Schema Design</a>).</p>
  </div>

  <h2 id="ma-sql"><span class="num">06</span>SQL → Pipeline</h2>
  <p>Most people meet aggregation after years of SQL, and the fastest way in is a translation table. The ideas are the same; only the order and spelling differ. The biggest difference is order: SQL is written <code>SELECT ... FROM ... WHERE ... GROUP BY</code> but executed in a different order. A pipeline runs exactly in the order you write it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>SQL is ordering at a restaurant: you say what you want and the kitchen decides the steps. A pipeline is cooking from a recipe card yourself: step 1, step 2, step 3, in that order. More control, and more ways to put a step in the wrong place.</p>
  </div>
  <table class="tbl">
    <tr><th>SQL</th><th>Pipeline stage</th></tr>
    <tr><td><code>WHERE</code></td><td><code>$match</code> (before <code>$group</code>)</td></tr>
    <tr><td><code>SELECT col, expr AS x</code></td><td><code>$project</code> / <code>$addFields</code></td></tr>
    <tr><td><code>GROUP BY</code> + aggregates</td><td><code>$group</code> with accumulators</td></tr>
    <tr><td><code>HAVING</code></td><td><code>$match</code> after <code>$group</code></td></tr>
    <tr><td><code>JOIN</code></td><td><code>$lookup</code> (+ <code>$unwind</code>)</td></tr>
    <tr><td><code>ORDER BY</code> / <code>LIMIT</code> / <code>OFFSET</code></td><td><code>$sort</code> / <code>$limit</code> / <code>$skip</code></td></tr>
    <tr><td><code>COUNT(*)</code> of result</td><td><code>$count: "n"</code></td></tr>
    <tr><td>Window functions <code>OVER (...)</code></td><td><code>$setWindowFields</code></td></tr>
    <tr><td><code>UNION ALL</code></td><td><code>$unionWith</code></td></tr>
    <tr><td><code>CREATE TABLE AS</code> / <code>INSERT ... SELECT</code></td><td><code>$out</code> / <code>$merge</code> (last stage)</td></tr>
  </table>
  <p>Worked translation. In SQL the items live in their own table; in MongoDB they live inside orders, so the JOIN becomes an <code>$unwind</code>:</p>
  <div class="fx" data-lang="sql">SELECT i.category, SUM(i.qty * i.price) AS revenue, SUM(i.qty) AS units
FROM orders o JOIN order_items i ON i.order_id = o.order_id
WHERE o.status &lt;&gt; 'cancelled'
GROUP BY i.category
ORDER BY revenue DESC;
-- [('Electronics', 2300, 4), ('Furniture', 350, 6)]</div>
  <table class="tbl">
    <tr><th>SQL clause</th><th>Stage, in pipeline order</th></tr>
    <tr><td><code>WHERE o.status &lt;&gt; 'cancelled'</code></td><td>1. <code>{ $match: { status: { $ne: "cancelled" } } }</code></td></tr>
    <tr><td><code>JOIN order_items</code></td><td>2. <code>{ $unwind: "$items" }</code></td></tr>
    <tr><td><code>GROUP BY</code> + <code>SUM</code>s</td><td>3. <code>{ $group: { _id: "$items.category", revenue: ..., units: ... } }</code></td></tr>
    <tr><td><code>ORDER BY revenue DESC</code></td><td>4. <code>{ $sort: { revenue: -1 } }</code></td></tr>
  </table>
  <p>The full pipeline and its output are in the next section; the numbers match SQLite exactly.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$out</strong>: write the pipeline result into a collection, replacing it. <strong>$merge</strong>: upsert the result into a collection, keeping other documents. Both must be the last stage. <strong>$unionWith</strong>: append another collection's documents to the stream.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>SQL users write the <code>$project</code> (their SELECT) first. A pipeline that projects first and then groups works on the projected fields only. Write stages in the order the data should be processed: filter, unwind, group, then shape the output.</p>
  </div>

  <h2 id="ma-work"><span class="num">07</span>Worked Examples</h2>
  <p>Four questions an analyst gets on day one, each solved with the stages above. Read the question, try to write the stages yourself, then compare.</p>
  <h3>1. Revenue per customer (delivered only), with names</h3>
  <p>Plan: keep delivered orders, split items, sum qty × price per customer, then fetch the name. Do the lookup <em>after</em> grouping: 2 lookups (one per customer) instead of 5 (one per item).</p>
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
  <div class="fx" data-lang="text">[ { revenue: 1380, name: 'Asha' }, { revenue: 1150, name: 'Chen' } ]</div>
  <p>Asha: 800 + 80 (order 100) + 500 (order 101) = 1380. Chen: 1000 + 150 (order 103) = 1150. The <code>$lookup</code> returns an array <code>c</code> of one customer; <code>$unwind: "$c"</code> turns it into a plain object so <code>"$c.name"</code> works.</p>
  <h3>2. Revenue and units per category</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: { $ne: "cancelled" } } },
  { $unwind: "$items" },
  { $group: { _id: "$items.category",
              revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
              units:   { $sum: "$items.qty" } } },
  { $sort: { revenue: -1 } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 'Electronics', revenue: 2300, units: 4 },
  { _id: 'Furniture', revenue: 350, units: 6 }
]</div>
  <div class="callout pred"><span class="label">Think first</span>
    <p>What if you forget <code>$unwind</code>? Then <code>"$items.category"</code> is an <em>array</em> per order. The real output groups by whole arrays: <code>{ _id: [ 'Electronics', 'Furniture' ], n: 2 }</code>, <code>{ _id: [ 'Electronics' ], n: 1 }</code>, <code>{ _id: [ 'Furniture' ], n: 1 }</code>. Wrong answer, no error.</p>
  </div>
  <h3>3. Best product by revenue</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: { $ne: "cancelled" } } },
  { $unwind: "$items" },
  { $group: { _id: "$items.product",
              units: { $sum: "$items.qty" },
              revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } } } },
  { $sort: { revenue: -1, _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 'Phone', units: 3, revenue: 1500 },
  { _id: 'Laptop', units: 1, revenue: 800 },
  { _id: 'Lamp', units: 5, revenue: 200 },
  { _id: 'Desk', units: 1, revenue: 150 }
]</div>
  <p>Add <code>{ $limit: 1 }</code> for just the winner, Phone. By units, Lamp would win (5 units but only 200 revenue): always ask which "best" is meant. The <code>_id: 1</code> in <code>$sort</code> is a tie-breaker so equal revenues come out in a fixed order.</p>
  <h3>4. Orders per month</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$order_date" } },
              orders: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: '2024-05', orders: 2 },
  { _id: '2024-06', orders: 2 },
  { _id: '2024-07', orders: 1 }
]</div>
  <p><code>$dateToString</code> turns each date into text like "2024-05", and grouping on that text buckets by month. <code>{ $dateTrunc: { date: "$order_date", unit: "month" } }</code> does the same but keeps a real date (<code>ISODate('2024-05-01T00:00:00.000Z')</code>), which is better for charts and for further date maths.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Dates are stored in UTC. An order at 1 a.m. IST on 1 June is still 31 May in UTC and lands in May's bucket. Pass <code>timezone: "Asia/Kolkata"</code> to <code>$dateToString</code> or <code>$dateTrunc</code> for local-time reports.</p>
  </div>

  <h2 id="ma-adv"><span class="num">08</span>$facet, $bucket, Windows</h2>
  <p>Three needs that plain grouping handles badly. A search page wants results <em>and</em> counts per filter, without running the query three times. A pricing team wants a histogram of order sizes. A finance report wants a running total per customer while keeping every order row. Each has a dedicated stage.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p><code>$facet</code> is one exam paper photocopied for three examiners, each marking a different section at the same time. <code>$bucket</code> is sorting parcels into weight bands (0–500 g, 500 g–1 kg, ...). A window function is the running balance column in a bank passbook: every row stays, and each row also shows the total so far.</p>
  </div>
  <h3>$facet: several answers in one pass</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $facet: {
      byStatus: [ { $group: { _id: "$status", n: { $sum: 1 } } }, { $sort: { _id: 1 } } ],
      total:    [ { $count: "orders" } ]
  } }
])</div>
  <div class="fx" data-lang="text">[
  {
    byStatus: [
      { _id: 'cancelled', n: 1 },
      { _id: 'delivered', n: 3 },
      { _id: 'pending', n: 1 }
    ],
    total: [ { orders: 5 } ]
  }
]</div>
  <p>Each key in <code>$facet</code> is a mini pipeline fed the same input. The output is a <strong>single</strong> document holding every sub-result as an array.</p>
  <h3>$bucket: a histogram</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $addFields: { total: { $sum: { $map: { input: "$items", as: "i",
                    in: { $multiply: ["$$i.qty", "$$i.price"] } } } } } },
  { $bucket: { groupBy: "$total", boundaries: [0, 500, 1000, 2000], default: "other",
               output: { n: { $sum: 1 }, ids: { $push: "$_id" } } } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 0, n: 2, ids: [ 102, 104 ] },
  { _id: 500, n: 2, ids: [ 100, 101 ] },
  { _id: 1000, n: 1, ids: [ 103 ] }
]</div>
  <p>Totals were 880, 500, 150, 1150, 120. Each bucket's <code>_id</code> is its lower bound and the upper bound is excluded, so 500 falls in [500, 1000), not [0, 500). Values outside all boundaries go to <code>default</code>.</p>
  <h3>$setWindowFields: running total per customer</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $addFields: { total: { $sum: { $map: { input: "$items", as: "i",
                    in: { $multiply: ["$$i.qty", "$$i.price"] } } } } } },
  { $setWindowFields: {
      partitionBy: "$customer_id",
      sortBy: { order_date: 1 },
      output: { running: { $sum: "$total",
                           window: { documents: ["unbounded", "current"] } } } } },
  { $project: { customer_id: 1, total: 1, running: 1 } },
  { $sort: { _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 100, customer_id: 1, total: 880, running: 880 },
  { _id: 101, customer_id: 1, total: 500, running: 1380 },
  { _id: 102, customer_id: 2, total: 150, running: 150 },
  { _id: 103, customer_id: 3, total: 1150, running: 1150 },
  { _id: 104, customer_id: 3, total: 120, running: 1270 }
]</div>
  <p>Read it like SQL's <code>SUM(total) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)</code>. Each customer is its own partition; within it, rows are sorted by date and summed from the first row to the current one. All 5 rows survive, unlike <code>$group</code>. Swap the output for <code>{ r: { $rank: {} } }</code> with <code>sortBy: { total: -1 }</code> to rank orders (103 gets 1), or <code>$shift</code> with <code>by: -1</code> for the previous order's date (SQL's LAG).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Window function</strong>: a value computed over a set of related rows (the window) and attached to each row without collapsing them. <strong>Partition</strong>: the group of rows a window works within.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>$facet</code> returns one document, so its total output must fit in 16 MB: never put an unlimited result list inside a facet without <code>$limit</code>. <code>$setWindowFields</code> needs MongoDB 5.0+.</p>
  </div>

  <h2 id="ma-perf"><span class="num">09</span>Performance Rules</h2>
  <p>On 5 orders everything is instant. On 200,000 orders, the same pipeline can read every document or only 2% of them, depending on one thing: whether its first stage can use an index. An <strong>index</strong> is a sorted list of one field's values with pointers to the documents, so the database can jump to "status = returned" instead of reading everything.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding every "returned" parcel in a warehouse. Without an index you walk every aisle and check every label (a collection scan). With an index you open the register at page "returned" and go straight to those shelves. The register only helps at the door, though: once parcels are on your trolley, the register is no use for re-sorting them.</p>
  </div>
  <p>The experiment: 200,000 orders, 4,000 of them "returned". Run the same pipeline before and after adding an index on <code>status</code>, and ask <code>explain("executionStats")</code> what the first stage did.</p>
  <div class="fx" data-lang="js">let docs = []
for (let i = 0; i &lt; 200000; i++) { docs.push({ _id: i, customer_id: i % 5000, status: (i % 50 == 0 ? "returned" : ["delivered","delivered","delivered","pending","cancelled"][i % 5]), items: [ { qty: 1 + i % 3, price: 100 + i % 7 }, { qty: 1, price: 40 } ] }) }
db.big.insertMany(docs).insertedIds.length
const p = [ { $match: { status: "returned" } }, { $unwind: "$items" }, { $group: { _id: null, revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } } } } ]
db.big.aggregate(p)
const before = db.big.explain("executionStats").aggregate(p).stages[0].$cursor
before.queryPlanner.winningPlan.inputStage.stage
before.executionStats.totalDocsExamined
db.big.createIndex({ status: 1 })
const after = db.big.explain("executionStats").aggregate(p).stages[0].$cursor
after.queryPlanner.winningPlan.inputStage.inputStage.stage
after.executionStats.totalDocsExamined</div>
  <div class="fx" data-lang="text">200000
[ { _id: null, revenue: 983882 } ]
COLLSCAN
200000
status_1
IXSCAN
4000</div>
  <p>Before the index, the first stage was a <code>COLLSCAN</code> (collection scan) and examined all 200,000 documents to find 4,000. After, it was an <code>IXSCAN</code> (index scan) and examined exactly 4,000. Same answer, 50× less reading.</p>
  <table class="tbl out"><caption>What the optimizer did with other stage orders (real explain output, same data)</caption>
    <tr><th>Pipeline</th><th>What happened</th></tr>
    <tr><td><code>$unwind</code> then <code>$match: { status }</code></td><td>Optimizer moved the <code>$match</code> first: still 4,000 examined</td></tr>
    <tr><td><code>$sort: { customer_id: 1 }</code> + <code>$limit: 3</code></td><td>Merged into one top-k <code>SORT</code> with <code>limitAmount: 3</code></td></tr>
    <tr><td><code>$addFields: { total }</code> then <code>$match: { total }</code></td><td>Cannot move: <code>total</code> does not exist until computed</td></tr>
  </table>
  <ul>
    <li><strong>$match and $sort first.</strong> Only the start of the pipeline, reading the collection, can use an index. After <code>$group</code> or <code>$unwind</code>, documents are new in-memory objects.</li>
    <li><strong>100 MB per blocking stage.</strong> <code>$group</code> and <code>$sort</code> must see all input before output. Over 100 MB of RAM they spill to disk (<code>allowDiskUse</code>, on by default since 6.0), which is slow.</li>
    <li><strong>$unwind multiplies.</strong> 1M orders × 5 items = 5M documents in the next stage.</li>
    <li><strong>$lookup is a lookup per document.</strong> Index the <code>foreignField</code>; group before looking up.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>explain("executionStats")</strong>: run the query and report the plan and the work done. <strong>COLLSCAN</strong>: read every document. <strong>IXSCAN</strong>: walk an index. <strong>Blocking stage</strong>: one that must consume all its input before emitting anything.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The optimizer rescued the badly ordered <code>$unwind</code> → <code>$match</code> here, but it cannot rescue a filter on a computed field, and it never adds an index for you. Write <code>$match</code> first anyway, and check <code>explain</code> on real-sized data, not on 5 test documents.</p>
  </div>

  <h2 id="ma-py"><span class="num">10</span>From Python</h2>
  <p>In data work the pipeline usually runs from a Python script or notebook, and the result goes into pandas for a chart or a model. You could pull raw documents and group in pandas, but for big collections that moves far more data than needed. The better split: let MongoDB reduce millions of documents to a small summary, then let pandas reshape and plot it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking the warehouse to send you a one-page stock summary instead of shipping the whole warehouse to your office so you can count it yourself.</p>
  </div>
  <p>In pymongo a pipeline is a Python list of dicts; every operator name is a quoted string. This script computes revenue per month and category on the shop data, flattens the compound <code>_id</code> into normal columns, and pivots it in pandas.</p>
  <div class="fx" data-lang="py">from pymongo import MongoClient
import pandas as pd

db = MongoClient()["shop"]
pipeline = [
    {"$match": {"status": {"$ne": "cancelled"}}},
    {"$unwind": "$items"},
    {"$group": {"_id": {"month": {"$dateToString": {"format": "%Y-%m", "date": "$order_date"}},
                        "category": "$items.category"},
                "revenue": {"$sum": {"$multiply": ["$items.qty", "$items.price"]}}}},
    {"$project": {"_id": 0, "month": "$_id.month", "category": "$_id.category", "revenue": 1}},
    {"$sort": {"month": 1, "category": 1}},
]
rows = list(db.orders.aggregate(pipeline))
print(rows[0])
df = pd.DataFrame(rows)
print(df)
print(df.pivot_table(index="month", columns="category", values="revenue", fill_value=0))</div>
  <div class="fx" data-lang="text">{'revenue': 1300, 'month': '2024-05', 'category': 'Electronics'}
   revenue    month     category
0     1300  2024-05  Electronics
1       80  2024-05    Furniture
2     1000  2024-06  Electronics
3      150  2024-06    Furniture
4      120  2024-07    Furniture
category  Electronics  Furniture
month
2024-05        1300.0       80.0
2024-06        1000.0      150.0
2024-07           0.0      120.0</div>
  <p><code>aggregate</code> returns a cursor; <code>list()</code> pulls the 5 summary rows. The <code>$project</code> stage is the important line for pandas: without it every row would have a nested <code>_id</code> dict, and the DataFrame would get one awkward <code>_id</code> column. The pivot shows July Electronics as 0.0 because there was none (pandas turned the column to float while filling the gap). We also computed the same table with <code>json_normalize</code> + <code>groupby</code> in pandas, and <code>equals()</code> returned <code>True</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Push-down</strong>: doing filtering and aggregation inside the database so only the small result crosses the network. For results reused daily, end the pipeline with <code>$merge</code> into a summary collection and read that instead.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In Python, write <code>None</code> where mongosh writes <code>null</code> (<code>{"_id": None}</code>), and quote every <code>$</code> key. An unquoted <code>$match</code> is a Python syntax error; a misspelled one (<code>"$mach"</code>) is a server error "Unrecognized pipeline stage name".</p>
  </div>

  <h2 id="ma-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>Aggregation mistakes rarely crash. They produce a number that looks fine. Check these whenever a result surprises you.</p>
  <div class="callout trap"><span class="label">Trap: grouping by an array field</span>
    <p>Without <code>$unwind</code>, <code>_id: "$items.category"</code> groups by whole arrays such as <code>[ 'Electronics', 'Furniture' ]</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: counting after $unwind</span>
    <p><code>$sum: 1</code> after <code>$unwind</code> counts items, not orders (customer 1: 3 instead of 2).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: losing documents in $unwind</span>
    <p>Empty or missing arrays disappear; use <code>preserveNullAndEmptyArrays: true</code> when they must stay. The same happens with <code>$lookup</code> + <code>$unwind</code>: customers with no orders vanish.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: $project when you meant $addFields</span>
    <p>Listing one computed field in <code>$project</code> drops every other field.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fields gone after $group</span>
    <p>Only <code>_id</code> and accumulators survive. Reference the key as <code>"$_id"</code> afterwards, not by its old name.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting $ or $$</span>
    <p><code>"status"</code> is text, <code>"$status"</code> is the field, <code>"$$i"</code> is a variable. <code>{ $sum: "qty" }</code> sums a string: result 0.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: strings that look like numbers</span>
    <p><code>$sum</code> and <code>$avg</code> skip <code>"20"</code> silently. Convert with <code>$toDouble</code> or fix the data on load.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: $first/$last without $sort, and no final $sort</span>
    <p>Both give arbitrary results. Sort first.</p>
  </div>

  <h2 id="ma-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need <code>aggregate()</code> instead of <code>find()</code>?</summary><div class="qa-body">Whenever you compute across documents (counts, sums per group), compute new fields beyond simple projection, join collections, flatten arrays, or use window functions. <code>find()</code> only filters, projects, sorts and pages.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>"status"</code>, <code>"$status"</code> and <code>"$$i"</code> in a pipeline?</summary><div class="qa-body"><code>"status"</code> is a literal string. <code>"$status"</code> is the value of the field <code>status</code> in the current document. <code>"$$i"</code> is a variable, e.g. the loop variable named by <code>as: "i"</code> in <code>$map</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: number of orders per status, most common first.</summary><div class="qa-body"><code>[ { $group: { _id: "$status", n: { $sum: 1 } } }, { $sort: { n: -1, _id: 1 } } ]</code> → delivered 3, cancelled 1, pending 1. The <code>_id: 1</code> breaks the tie between the two 1s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: total units sold per product, excluding cancelled orders.</summary><div class="qa-body"><code>[ { $match: { status: { $ne: "cancelled" } } }, { $unwind: "$items" }, { $group: { _id: "$items.product", units: { $sum: "$items.qty" } } }, { $sort: { units: -1, _id: 1 } } ]</code> → Lamp 5, Phone 3, Desk 1, Laptop 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you express HAVING? Write: customers with 2 or more orders.</summary><div class="qa-body">A <code>$match</code> after <code>$group</code>: <code>[ { $group: { _id: "$customer_id", n: { $sum: 1 } } }, { $match: { n: { $gte: 2 } } } ]</code> → customers 1 and 3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>[ { $unwind: "$items" }, { $count: "n" } ]</code> on the shop orders.</summary><div class="qa-body"><code>[ { n: 7 } ]</code>: the number of line items (2+1+1+2+1), not the 5 orders. <code>$unwind</code> creates one document per array element.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A pipeline groups by <code>"$items.category"</code> without <code>$unwind</code>. What goes wrong?</summary><div class="qa-body"><code>"$items.category"</code> evaluates to an array per order, e.g. <code>["Electronics","Furniture"]</code> for order 100. Groups are formed per distinct array, not per category. No error, just wrong numbers. Unwind first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: each customer's name and number of orders, including customers with none.</summary><div class="qa-body">On <code>customers</code>: <code>[ { $lookup: { from: "orders", localField: "_id", foreignField: "customer_id", as: "o" } }, { $project: { name: 1, n: { $size: "$o" } } } ]</code>. <code>$lookup</code> is a left join, so Dia appears with 0. Don't <code>$unwind</code> the array, or Dia disappears.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should <code>$match</code> come first in a pipeline?</summary><div class="qa-body">(1) It can use an index only when it reads the collection directly: on 200k docs, 4,000 examined with an index vs 200,000 without. (2) It shrinks the stream, so later stages process fewer documents and stay under the 100 MB per-stage memory limit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your <code>$group</code> fails with "exceeded memory limit". Options?</summary><div class="qa-body">Filter earlier and project away large fields; make sure <code>allowDiskUse: true</code> is set (lets it spill to disk, slower); pre-aggregate into a summary collection with <code>$merge</code> on a schedule; or move heavy analytics to a warehouse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>$push</code> vs <code>$addToSet</code> in <code>$group</code>?</summary><div class="qa-body"><code>$push</code> collects every value, duplicates included (customer 1's statuses: [delivered, delivered]). <code>$addToSet</code> keeps unique values only ([delivered]) and does not guarantee order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: running total of spend per customer over time.</summary><div class="qa-body"><code>$addFields</code> an order total (sum of qty × price via <code>$map</code>), then <code>$setWindowFields: { partitionBy: "$customer_id", sortBy: { order_date: 1 }, output: { running: { $sum: "$total", window: { documents: ["unbounded", "current"] } } } }</code>. Customer 3 → 1150, then 1270.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>$group vs $setWindowFields: when do you use which?</summary><div class="qa-body"><code>$group</code> collapses each group to one output document (total per customer). <code>$setWindowFields</code> keeps every document and adds a value computed over its partition (running total, rank, previous value). Same difference as SQL GROUP BY vs OVER().</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>$out vs $merge?</summary><div class="qa-body">Both write the result to a collection and must be the last stage. <code>$out</code> replaces the whole target collection. <code>$merge</code> inserts or updates matching documents and leaves the rest, so it suits incremental summary tables.</div></details>
</main>
`
});
