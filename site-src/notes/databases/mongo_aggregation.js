// notes/databases/mongo_aggregation.js — Aggregation Pipeline
Object.assign(TOPIC_CONTENT, {
  "mongo_aggregation": `<main>
  <h1>Aggregation Pipeline</h1>
  <p class="lead">The aggregation pipeline is MongoDB's GROUP BY, JOIN and window functions in one tool. Learn the stages, map them to SQL, and write the classic analytics queries on the shop orders.</p>

  <h2 id="ma-map" class="open"><span class="num">★</span>Mind Map</h2>
<div class="mindmap">
  <div class="mm-center">Aggregation Pipeline</div>
  <div class="mm-branches">
    <div class="mm-branch">
      <div class="mm-title">The idea</div>
      <ul>
        <li><b>Pipeline</b> — array of stages; docs flow through in written order</li>
        <li><b>Why</b> — find() only filters/projects; totals, groups, joins need a pipeline</li>
        <li><b><code>"$field"</code></b> = field value; <b><code>"$$var"</code></b> = variable (inside <code>$map</code>)</li>
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
        <li><b>Expressions</b> — <code>$filter $cond $ifNull $dateToString $size</code></li>
        <li>⚠ <b>$project { total: 1 }</b> drops every other field</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">$group</div>
      <ul>
        <li><b>_id</b> = group key; <code>_id: null</code> = one group; compound <code>{ a: "$a", b: "$b" }</code></li>
        <li><b>Accumulators</b> — <code>$sum: 1</code> (COUNT), <code>$sum $avg $min $max</code></li>
        <li><b>$push</b> = ARRAY_AGG; <b>$addToSet</b> = distinct, unordered</li>
        <li><b>$first / $last</b> — only meaningful after <code>$sort</code></li>
        <li><b>HAVING</b> = <code>$match</code> after <code>$group</code></li>
        <li>⚠ After group only <code>_id</code> + accumulators exist</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">$unwind</div>
      <ul>
        <li><b>What</b> — one doc with n-element array → n docs, one element each</li>
        <li><b>Why</b> — group by something inside an array (category)</li>
        <li>⚠ <b>Empty/missing arrays dropped</b> — <code>preserveNullAndEmptyArrays: true</code></li>
        <li>⚠ <b>Fan-out</b> — <code>$sum: 1</code> now counts items, not orders</li>
        <li>⚠ <b>Group by array field without unwind</b> → key is the whole array, no error</li>
        <li>💡 photocopy the form once per line item</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">$lookup (join)</div>
      <ul>
        <li><b>Left outer join</b> into an array: <code>{ from, localField, foreignField, as }</code></li>
        <li><b>No match</b> → <code>[]</code> (Dia: 0 orders)</li>
        <li><b>+ $unwind</b> → one row per pair, drops unmatched (inner join)</li>
        <li><b>Pipeline form</b> — <code>{ from, let, pipeline: [...], as }</code> for extra conditions</li>
        <li><b>Cost</b> — a query per input doc; index <code>foreignField</code>; group first</li>
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
        <li><b>Key difference</b> — runs exactly in written order</li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Advanced stages</div>
      <ul>
        <li><b>$facet</b> — several sub-pipelines, one pass (results + filter counts)</li>
        <li><b>$bucket</b> — histogram; <code>_id</code> = lower bound, upper exclusive, <code>default</code></li>
        <li><b>$setWindowFields</b> (5.0+) — <code>partitionBy</code>, <code>sortBy</code>, <code>window: { documents: ["unbounded","current"] }</code></li>
        <li><b>Ranking</b> — <code>$rank: {}</code></li>
        <li><b>Dates</b> — <code>$dateToString "%Y-%m"</code>, <code>$year/$month</code>, <code>$dateTrunc</code></li>
      </ul>
    </div>
    <div class="mm-branch">
      <div class="mm-title">Performance</div>
      <ul>
        <li><b>$match + $sort first</b> — only leading stages use indexes</li>
        <li><b>$sort + $limit</b> adjacent → top-k, keeps k docs</li>
        <li><b>100 MB per blocking stage</b> ($group, $sort); <code>allowDiskUse</code> spills (default 6.0+)</li>
        <li><b>$unwind multiplies</b> — 1M orders × 5 items = 5M docs</li>
        <li><b>16 MB</b> per output doc ($facet, big $push)</li>
        <li><b>explain("executionStats")</b> — IXSCAN good, COLLSCAN bad</li>
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
      <div class="rm-item rm-done" data-target="ma-perf"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Performance Rules</span><span class="rm-sub">Indexes, 100 MB, $lookup cost</span></div></div>
      <div class="rm-item rm-done" data-target="ma-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Write-the-pipeline drills</span></div></div>
    </div>
  </div>

  <h2 id="ma-idea"><span class="num">01</span>The Pipeline Idea</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p>A pipeline is an <strong>array of stages</strong>. Documents flow through them in order; each stage takes a stream of documents and outputs a new stream.</p>
  </div>
  <p><code>find()</code> can only filter and project. Totals, groupings, joins and reshaping need a pipeline.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An <strong>assembly line</strong>: throw out rejects ($match), cut parts apart ($unwind), bin and count ($group), line up the bins ($sort). Each station sees only what the last one handed over.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="ma-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g text-anchor="middle">
      <rect x="0" y="20" width="96" height="56" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="48" y="44" font-weight="bold">orders</text><text x="48" y="62" font-size="11" class="tm">collection</text>
      <rect x="124" y="20" width="96" height="56" rx="6" class="fb sb"/><text x="172" y="44">$match</text><text x="172" y="62" font-size="10" class="tm">≠ cancelled</text>
      <rect x="248" y="20" width="96" height="56" rx="6" class="ft st"/><text x="296" y="44">$unwind</text><text x="296" y="62" font-size="10" class="tm">$items</text>
      <rect x="372" y="20" width="96" height="56" rx="6" class="fv"/><text x="420" y="44">$group</text><text x="420" y="62" font-size="10" class="tm">by category</text>
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
  <div class="cards">
    <div><b>$match</b><p>find() filter syntax. Put it first.</p></div>
    <div><b>$project</b><p>Keep, drop, rename, compute. Unlisted fields dropped (not <code>_id</code>).</p></div>
    <div><b>$addFields</b><p>Alias <code>$set</code>. Add fields, keep the rest.</p></div>
  </div>
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
  <p><code>$unwind</code> turns one document with an n-element array into n documents. It's how you group <em>by something inside an array</em>, such as category.</p>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="ma-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="20" width="220" height="90" rx="6" class="fb sb"/>
    <text x="10" y="40" font-size="11">_id 100 · customer 1</text><text x="10" y="58" font-size="11">items: [</text>
    <rect x="20" y="64" width="90" height="24" rx="4" class="ft st"/><text x="65" y="80" text-anchor="middle" font-size="11">Laptop</text>
    <rect x="118" y="64" width="90" height="24" rx="4" class="fv"/><text x="163" y="80" text-anchor="middle" font-size="11">Lamp</text>
    <text x="10" y="104" font-size="11">]</text>
    <line x1="222" y1="65" x2="290" y2="65" stroke="currentColor" marker-end="url(#ma-ar2)"/><text x="256" y="58" text-anchor="middle" font-size="10" class="tm">$unwind</text>
    <rect x="300" y="8" width="290" height="50" rx="6" class="fb sb"/><text x="310" y="28" font-size="11">_id 100 · customer 1</text>
    <rect x="310" y="34" width="190" height="20" rx="4" class="ft st"/><text x="318" y="48" font-size="11">items: Laptop (object)</text>
    <rect x="300" y="70" width="290" height="50" rx="6" class="fb sb"/><text x="310" y="90" font-size="11">_id 100 · customer 1</text>
    <rect x="310" y="96" width="190" height="20" rx="4" class="fv"/><text x="318" y="110" font-size="11">items: Lamp (object)</text>
  </svg><figcaption>One document per array element; parent fields are copied onto each. Same _id twice.</figcaption></figure>
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
  <p><code>$lookup</code> pulls matching documents from another collection into an <strong>array field</strong>.</p>
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

  <h2 id="ma-qa"><span class="num">10</span>Questions &amp; Answers</h2>
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
