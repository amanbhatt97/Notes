// notes/databases/mongo_aggregation.js — Aggregation Pipeline
Object.assign(TOPIC_CONTENT, {
  "mongo_aggregation": `<main>
  <h1>Aggregation Pipeline</h1>
  <div class="where"><span>Databases</span><span>MongoDB</span><span>Aggregation Pipeline</span></div>
  <p class="lead"><a class="xref" data-note="mongo_basics">Documents &amp; CRUD</a> stored Biteful's orders as documents and taught <code>find</code>. But <code>find</code> only <em>returns</em> documents: it cannot add amounts per restaurant, count lines per item, or bring a customer's name in from another collection. The <strong>aggregation pipeline</strong> does that work inside the database, as a chain of small stages. This note builds the pipeline one stage at a time, each one forced by a question the previous stage cannot answer, on the same Biteful documents (7 customers, 5 restaurants, 10 orders with 15 embedded lines). Every pipeline ran on a real <strong>MongoDB 8.0.23</strong> server, every SQL comparison on <strong>PostgreSQL 17</strong> with the SQL notes' tables, and every output is real.</p>

  <h2 id="ma-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 160" width="660">
<defs><marker id="ma-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="140" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="80" y="41" text-anchor="middle" font-size="12">SQL notes</text><text x="80" y="58" text-anchor="middle" class="tm" font-size="10">GROUP BY, JOIN</text>
<line x1="150" y1="45" x2="178" y2="45" stroke="currentColor" marker-end="url(#ma-a0)"/>
<rect x="180" y="20" width="140" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="250" y="41" text-anchor="middle" font-size="12">Documents &amp; CRUD</text><text x="250" y="58" text-anchor="middle" class="tm" font-size="10">store, find, update</text>
<line x1="320" y1="45" x2="348" y2="45" stroke="currentColor" marker-end="url(#ma-a0)"/>
<rect x="350" y="20" width="140" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="420" y="41" text-anchor="middle" font-size="12" font-weight="700">Aggregation</text><text x="420" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="490" y1="45" x2="518" y2="45" stroke="currentColor" marker-end="url(#ma-a0)"/>
<rect x="520" y="20" width="130" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="585" y="41" text-anchor="middle" font-size="12">Schema Design</text><text x="585" y="58" text-anchor="middle" class="tm" font-size="10">embed, index, scale</text>
<text x="20" y="108" class="tm" font-size="10.5">find answers "which documents?". The pipeline answers "what do they add up to, per group, joined with what?"</text>
<text x="20" y="126" class="tm" font-size="10.5">Every SQL idea you know (WHERE, GROUP BY, HAVING, JOIN, ORDER BY) reappears as a stage, in the order you write it.</text>
</svg><figcaption>The MongoDB group of the Databases track. The pipeline is MongoDB's answer to SQL's SELECT … GROUP BY … JOIN.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: documents and find</b><span><a class="xref" data-note="mongo_basics">Documents &amp; CRUD</a> loaded Biteful as documents (each order embeds its <code>items</code>) and taught filters, projections, sort and limit. From the SQL side you already know <code>GROUP BY</code> and aggregates (<a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a>) and joins with their fan-out trap (<a class="xref" data-note="sql_joins">JOINs</a>).</span></li>
    <li><b>This note adds: computing across documents</b><span>The pipeline as an assembly line; <code>$match</code>, <code>$group</code> (traced by hand), <code>$project</code>/<code>$addFields</code>, <code>$sort</code>/<code>$limit</code>, <code>$unwind</code> (one order becomes n lines), <code>$lookup</code> (the join), a brief look at <code>$facet</code>, <code>$bucket</code> and window functions, a full SQL → pipeline mapping, and the performance rules measured on 200,000 orders.</span></li>
    <li><b>Leads to: <a class="xref" data-note="mongo_design">Schema Design</a></b><span>Many pipelines here exist only because of how the documents are shaped: <code>$unwind</code> because lines are embedded, <code>$lookup</code> because customers are referenced. Schema design decides that shape on purpose, and adds the indexes that make <code>$match</code> fast (the same B-tree ideas as <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>).</span></li>
  </ol>

  <h2 id="ma-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each stage answers the question above it, and its limit raises the next question. All numbers come from Biteful's 10 orders.</p>
  <ol class="story">
    <li><b>The pipeline</b><span>Q: "revenue per restaurant" — <code>find</code> returns 7 delivered orders but cannot add them per restaurant or join names → a list of stages, each feeding the next, run inside the database. Which stage goes first?</span></li>
    <li><b>$match</b><span>Q: how do we keep only the documents that matter? → the same filter as <code>find</code>, as a stage: 10 orders → 7 delivered. Now we have the right documents but still one per order…</span></li>
    <li><b>$group</b><span>Q: one answer <em>per restaurant</em> → bins by a key, folded with accumulators: Biryani Bros 3 orders / ₹1,230, Pizza Point 2 / ₹900, Dosa Hut 2 / ₹500, traced by hand. But some numbers we need are not stored in any field…</span></li>
    <li><b>$project / $addFields</b><span>Q: compute new fields (line totals, IST hour, "lunch or dinner") → expressions: <code>$map</code> rebuilds every order's bill, and all 10 match <code>amount</code>. Results now come out in arbitrary order…</span></li>
    <li><b>$sort / $limit</b><span>Q: "top 2 restaurants", "each customer's latest order" → sort, cut, and <code>$first</code> after a sort. All of this works per order. But the items are <em>inside</em> an array…</span></li>
    <li><b>$unwind</b><span>Q: "revenue per item" → split each order into one document per line: order 102 → 2 documents, 10 orders → 15 lines (exactly SQL's <code>order_items</code>). Chicken Biryani leads with ₹700. Names, though, live in other collections…</span></li>
    <li><b>$lookup</b><span>Q: customer and restaurant names → a left outer join that attaches matches as an array: Gita gets <code>[]</code> and 0 orders, exactly like SQL's LEFT JOIN. Some questions want several summaries or bands at once…</span></li>
    <li><b>$facet / $bucket / windows</b><span>Q: several summaries in one pass, histograms, running totals → <code>$facet</code> (3 answers, 1 document), <code>$bucket</code> (2 / 5 / 3 orders by amount band), <code>$setWindowFields</code> (Chen 520 → 780). Now every SQL clause has a stage…</span></li>
    <li><b>SQL → pipeline mapping</b><span>Q: how do I translate a SQL query I already know? → WHERE→$match, JOIN→$lookup+$unwind, GROUP BY→$group, HAVING→$match after, ORDER BY→$sort; revenue per cuisine matches Postgres exactly. On 10 orders all of this is instant; on 200,000…</span></li>
    <li><b>Performance</b><span>Q: why is the same pipeline fast or slow? → only the first stages can use an index (200,000 → 20,000 documents read), the optimizer moves some <code>$match</code>es but not on computed fields, blocking stages have a memory limit and spill to disk (<code>allowDiskUse</code>). Then: shape the data so pipelines stay short → <a class="xref" data-note="mongo_design">Schema Design</a>.</span></li>
  </ol>

  <h2 id="ma-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Aggregation Pipeline</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li><b>Need</b> — find can't group or join</li>
          <li><b>Pipeline</b> — array of stages; output of one feeds the next</li>
          <li><b>"$field"</b> = value · <b>"$$var"</b> = variable · "text" = text</li>
          <li>💡 a packing line: each station sees only what it is handed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Filter &amp; group</div>
        <ul>
          <li><b>$match</b> — find's filter as a stage; put it first</li>
          <li><b>$group</b> — <code>_id</code> = key; accumulators <code>$sum $avg $min $max $push $addToSet $first</code></li>
          <li><b>HAVING</b> = <code>$match</code> after <code>$group</code></li>
          <li>⚠ after $group only <code>_id</code> + accumulators exist</li>
          <li>⚠ <code>$sum</code> skips "450" (text) silently</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Reshape &amp; order</div>
        <ul>
          <li><b>$project</b> keeps only listed fields; <b>$addFields</b> adds</li>
          <li><code>$map $filter $cond $ifNull $size $hour</code> (with timezone)</li>
          <li><b>$sort $limit $skip $count</b>; <code>$first</code> needs a sort</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Arrays &amp; joins</div>
        <ul>
          <li><b>$unwind</b> — 1 order → n lines (10 → 15)</li>
          <li>⚠ count after unwind counts lines (Asha 5, not 3)</li>
          <li>⚠ empty arrays vanish unless <code>preserveNullAndEmptyArrays</code></li>
          <li><b>$lookup</b> — left join into an array; Gita → <code>[]</code></li>
          <li><b>$lookup + $unwind</b> = inner join (11 → 10)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Extras</div>
        <ul>
          <li><b>$facet</b> — several sub-pipelines, one output document</li>
          <li><b>$bucket</b> — bands, lower bound included</li>
          <li><b>$setWindowFields</b> — running totals, ranks (SQL OVER)</li>
          <li><b>$out / $merge</b> — write results to a collection</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Performance</div>
        <ul>
          <li><b>Index</b> helps only the first stages: 200,000 → 20,000 docs</li>
          <li>Optimizer moves <code>$match</code> before <code>$unwind</code>, not on computed fields</li>
          <li><b>$sort + $limit</b> → top-k sort</li>
          <li><b>100 MB</b> per blocking stage → <code>allowDiskUse</code> spills</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ma-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ma-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Pipeline Idea</span><span class="rm-sub">find can't group or join</span></div></div>
      <div class="rm-item rm-done" data-target="ma-match"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">$match</span><span class="rm-sub">Filter first</span></div></div>
      <div class="rm-item rm-done" data-target="ma-group"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">$group</span><span class="rm-sub">Traced by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ma-shape"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">$project &amp; $addFields</span><span class="rm-sub">Compute new fields</span></div></div>
      <div class="rm-item rm-done" data-target="ma-sort"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">$sort &amp; $limit</span><span class="rm-sub">Top-N, latest per customer</span></div></div>
      <div class="rm-item rm-done" data-target="ma-unwind"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">$unwind</span><span class="rm-sub">1 order → n lines</span></div></div>
      <div class="rm-item rm-done" data-target="ma-lookup"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">$lookup</span><span class="rm-sub">The join, traced</span></div></div>
      <div class="rm-item rm-done" data-target="ma-facet"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">$facet, $bucket, Windows</span><span class="rm-sub">Briefly</span></div></div>
      <div class="rm-item rm-done" data-target="ma-sql"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">SQL → Pipeline</span><span class="rm-sub">Clause-by-clause mapping</span></div></div>
      <div class="rm-item rm-done" data-target="ma-perf"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Performance</span><span class="rm-sub">$match early, indexes, allowDiskUse</span></div></div>
      <div class="rm-item rm-done" data-target="ma-py"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">From Python</span><span class="rm-sub">Pipeline to pandas</span></div></div>
      <div class="rm-item rm-done" data-target="ma-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One stream, many stations</span></div></div>
      <div class="rm-item rm-done" data-target="ma-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Wrong numbers, no errors</span></div></div>
      <div class="rm-item rm-done" data-target="ma-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ma-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Write-the-pipeline drills</span></div></div>
    </div>
  </div>

  <h2 id="ma-idea"><span class="num">01</span>find Can't Group or Join: The Pipeline Idea</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's owner asks: "How much revenue did each restaurant make from delivered orders?" With <a class="xref" data-note="mongo_basics">find</a> we can fetch the delivered orders. Then what?</p>
  </div>
  <div class="fx" data-lang="js">db.orders.find({ status: "delivered" }, { restaurant_id: 1, amount: 1 })</div>
  <div class="fx" data-lang="text">[
  { _id: 101, restaurant_id: 10, amount: 240 },
  { _id: 102, restaurant_id: 11, amount: 450 },
  { _id: 103, restaurant_id: 12, amount: 520 },
  { _id: 104, restaurant_id: 12, amount: 380 },
  { _id: 106, restaurant_id: 11, amount: 180 },
  { _id: 108, restaurant_id: 10, amount: 260 },
  { _id: 109, restaurant_id: 11, amount: 600 }
]</div>
  <p>Seven documents, one per order. The answer is still three steps away: put orders 101 and 108 together (restaurant 10), add 240 + 260; do the same for 11 and 12; then look up the restaurant names in another collection. <code>find</code> can do none of that. Pulling all orders into Python works for 10 orders; for 10 million it ships gigabytes over the network to compute three numbers the database could have computed in place.</p>
  <p>The <strong>aggregation pipeline</strong> lets the database do the work. You write a list of <strong>stages</strong>. Each stage does one small job (filter, group, reshape, sort, join). Documents enter the first stage; its output is the input of the second; what leaves the last stage is the answer. Here is the smallest useful one: delivered orders per customer.</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$customer_id", orders: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 1, orders: 2 },
  { _id: 2, orders: 2 },
  { _id: 3, orders: 2 },
  { _id: 6, orders: 1 }
]</div>
  <p>Trace it. <code>$match</code> keeps the 7 delivered orders. <code>$group</code> puts them in bins by <code>customer_id</code>: bin 1 gets 101 and 104, bin 2 gets 102 and 106, bin 3 gets 103 and 108, bin 6 gets 109. <code>$sum: 1</code> adds 1 per document in a bin, which is a count. <code>$sort</code> fixes the output order. Dia, Esha and Gita have no delivered orders, so they have no bin at all.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A mango-packing line. Station 1 throws out bruised mangoes (<code>$match</code>). Station 2 cuts crates open into single mangoes (<code>$unwind</code>). Station 3 sorts them into bins by variety and counts each bin (<code>$group</code>). Station 4 lines up the bins, biggest first (<code>$sort</code>). Each worker sees only what the previous worker handed over, never the original truck.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <defs><marker id="ma-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g text-anchor="middle">
      <rect x="0" y="20" width="100" height="56" rx="6" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="50" y="44" font-weight="bold">orders</text><text x="50" y="62" font-size="11" class="tm">collection</text>
      <rect x="130" y="20" width="100" height="56" rx="6" class="fb sb"/><text x="180" y="44">$match</text><text x="180" y="62" font-size="10" class="tm">delivered</text>
      <rect x="260" y="20" width="100" height="56" rx="6" class="ft st"/><text x="310" y="44">$unwind</text><text x="310" y="62" font-size="10" class="tm">$items</text>
      <rect x="390" y="20" width="100" height="56" rx="6" class="fv sb"/><text x="440" y="44">$group</text><text x="440" y="62" font-size="10" class="tm">by item</text>
      <rect x="520" y="20" width="110" height="56" rx="6" class="fg sg"/><text x="575" y="44">$sort+$limit</text><text x="575" y="62" font-size="10" class="tm">revenue, 4</text>
    </g>
    <g stroke="currentColor"><line x1="100" y1="48" x2="128" y2="48" marker-end="url(#ma-ar)"/><line x1="230" y1="48" x2="258" y2="48" marker-end="url(#ma-ar)"/><line x1="360" y1="48" x2="388" y2="48" marker-end="url(#ma-ar)"/><line x1="490" y1="48" x2="518" y2="48" marker-end="url(#ma-ar)"/></g>
    <g text-anchor="middle" font-size="11"><text x="50" y="100">10 orders</text><text x="180" y="100">7 orders</text><text x="310" y="100" class="tr">11 lines</text><text x="440" y="100">9 items</text><text x="575" y="100">top 4</text></g>
    <text x="0" y="132" font-size="10" class="tm">Revenue per item (section 06): the stream shrinks, grows at $unwind, shrinks again at $group. Indexes help only where the line reads the collection.</text>
  </svg><figcaption>A pipeline is a stream of documents through stations. The counts are the real ones for "revenue per item" on Biteful.</figcaption></figure>
  <p>One symbol matters everywhere. Inside a stage, <code>"$status"</code> means "the value of the <code>status</code> field of the current document", while <code>"status"</code> is just the word. On an array, <code>"$items.item"</code> gives the list of all item names:</p>
  <div class="fx" data-lang="js">db.orders.aggregate([ { $match: { _id: 101 } }, { $project: { a: "status", b: "$status", c: "$items.item" } } ])</div>
  <div class="fx" data-lang="text">[ { _id: 101, a: 'status', b: 'delivered', c: [ 'Masala Dosa' ] } ]</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Aggregation pipeline</strong>: <code>db.collection.aggregate([stage, stage, …])</code>, an array of stages run in order. <strong>Stage</strong>: <code>{ $stageName: { … } }</code>, takes a stream of documents and emits a new stream. <strong>Field path</strong>: <code>"$field"</code> or <code>"$a.b"</code>, a value from the current document.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: output order</span>
    <p>Without a <code>$sort</code>, the order of a pipeline's output is not guaranteed. A report that "always came out in order" in testing can come out shuffled in production. Every result in this note is sorted on purpose.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: $match.</b> We have the shape of a pipeline. The first station decides which documents enter the line at all, and getting it right (and first) matters both for correct numbers and for speed.</div>

  <h2 id="ma-match"><span class="num">02</span>$match: Filter First</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Revenue must count delivered orders only; cancelled 105 and 107 and pending 110 would inflate it. How do we keep only the right documents before anything else happens?</p>
  </div>
  <p><code>$match</code> takes exactly the filter document you used with <code>find</code>: equality, <code>$in</code>, <code>$ne</code>, dot notation into arrays, <code>$elemMatch</code>, all of it. Documents that pass go to the next stage; the rest are dropped. A tiny helper stage, <code>$count: "name"</code>, replaces the stream with one document holding the count, handy for checking each step.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The gatekeeper at a wedding hall checking invitations. Whoever gets past him is fed; whoever doesn't never reaches the kitchen. Putting him at the gate (first) is cheaper than checking guests after dinner.</p>
  </div>
  <div class="fx" data-lang="js">db.orders.aggregate([ { $match: { status: "delivered" } }, { $count: "delivered" } ])
db.orders.aggregate([ { $match: { "items.item": "Masala Dosa", status: { $ne: "cancelled" } } }, { $count: "n" } ])
db.orders.aggregate([ { $match: { $expr: { $gt: ["$amount", 400] } } }, { $count: "over_400" } ])</div>
  <div class="fx" data-lang="text">[ { delivered: 7 } ]
[ { n: 3 } ]
[ { over_400: 3 } ]</div>
  <p>7 delivered orders. 3 non-cancelled orders contain a Masala Dosa (101, 108, 110). The third shows <code>$expr</code>, which lets a <code>$match</code> use aggregation expressions (here <code>amount &gt; 400</code>, written as an expression: 102, 103, 109). <code>$expr</code> is needed when you compare two fields of the same document, e.g. <code>{ $expr: { $ne: ["$amount", "$lines_total"] } }</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$match</strong>: keep documents that satisfy a query filter (same language as <code>find</code>). <strong>$count</strong>: output one document <code>{ name: n }</code>. <strong>$expr</strong>: use expressions (field-to-field comparisons, arithmetic) inside a match.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the filter changes the business answer</span>
    <p>Without <code>$match</code>, "revenue" silently includes cancelled and pending orders: ₹3,510 instead of ₹2,630 on Biteful. The pipeline runs fine either way; decide which orders count before you write the first stage.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: $group.</b> We have the 7 right documents, but still one per order. The owner wants one line <em>per restaurant</em>: orders, revenue, average delivery time. That needs putting documents into bins and folding each bin into numbers.</div>

  <h2 id="ma-group"><span class="num">03</span>$group, Traced by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Revenue per restaurant" is a <em>per-something</em> question. In SQL it is <code>GROUP BY restaurant_id</code> with <code>SUM(amount)</code>. Which stage turns 7 order documents into 3 restaurant summaries?</p>
  </div>
  <p><code>$group</code> needs an <code>_id</code>: the value to group by. Documents with the same <code>_id</code> value land in the same bin. Every other field you write must be an <strong>accumulator</strong>, a rule for folding the values in one bin into one value.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher sorting answer sheets into piles by section (A, B, C): that is the <code>_id</code>. For each pile she writes on a sticky note: number of sheets (<code>$sum: 1</code>), total marks (<code>$sum</code>), highest (<code>$max</code>), list of roll numbers (<code>$push</code>). Only the sticky notes go forward; the sheets don't.</p>
  </div>
  <p>By hand first, on the 7 delivered orders, grouped by <code>restaurant_id</code>:</p>
  <table class="tbl">
    <tr><th>bin (_id)</th><th>orders in it</th><th>$sum: 1</th><th>$sum: "$amount"</th><th>$avg: "$delivery_minutes"</th><th>$max: "$amount"</th></tr>
    <tr><td>10 Dosa Hut</td><td>101 (240, 32 min), 108 (260, 29)</td><td>2</td><td>240 + 260 = 500</td><td>(32 + 29) / 2 = 30.5</td><td>260</td></tr>
    <tr><td>11 Biryani Bros</td><td>102 (450, 41), 106 (180, 25), 109 (600, 52)</td><td>3</td><td>450 + 180 + 600 = 1230</td><td>(41 + 25 + 52) / 3 = 39.33…</td><td>600</td></tr>
    <tr><td>12 Pizza Point</td><td>103 (520, 38), 104 (380, <strong>null</strong>)</td><td>2</td><td>520 + 380 = 900</td><td>38 / 1 = 38 (null skipped)</td><td>520</td></tr>
  </table>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$restaurant_id",
              orders:      { $sum: 1 },
              revenue:     { $sum: "$amount" },
              avg_minutes: { $avg: "$delivery_minutes" },
              biggest:     { $max: "$amount" },
              order_ids:   { $push: "$_id" } } },
  { $sort: { _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  {
    _id: 10,
    orders: 2,
    revenue: 500,
    avg_minutes: 30.5,
    biggest: 260,
    order_ids: [ 101, 108 ]
  },
  {
    _id: 11,
    orders: 3,
    revenue: 1230,
    avg_minutes: 39.333333333333336,
    biggest: 600,
    order_ids: [ 102, 106, 109 ]
  },
  {
    _id: 12,
    orders: 2,
    revenue: 900,
    avg_minutes: 38,
    biggest: 520,
    order_ids: [ 103, 104 ]
  }
]</div>
  <p>Every number matches the hand trace. Note Pizza Point's <code>avg_minutes: 38</code>: order 104's <code>delivery_minutes</code> is null, and <code>$avg</code> ignores null and missing values, exactly as SQL's <code>AVG</code> ignores NULL. The same question in PostgreSQL on the SQL tables:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, COUNT(*) AS orders, SUM(amount) AS revenue,
       ROUND(AVG(delivery_minutes), 2) AS avg_minutes, MAX(amount) AS biggest
FROM orders WHERE status = 'delivered'
GROUP BY restaurant_id ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>PostgreSQL 17: identical counts, sums, averages and maxima</caption><tr><th>restaurant_id</th><th>orders</th><th>revenue</th><th>avg_minutes</th><th>biggest</th></tr><tr><td>10</td><td>2</td><td>500.00</td><td>30.50</td><td>260.00</td></tr><tr><td>11</td><td>3</td><td>1230.00</td><td>39.33</td><td>600.00</td></tr><tr><td>12</td><td>2</td><td>900.00</td><td>38.00</td><td>520.00</td></tr></table>
  <table class="tbl">
    <tr><th>Accumulator</th><th>SQL cousin</th><th>Note</th></tr>
    <tr><td><code>$sum: 1</code></td><td><code>COUNT(*)</code></td><td>adds 1 per document</td></tr>
    <tr><td><code>$sum: "$x"</code></td><td><code>SUM(x)</code></td><td>non-numbers are skipped</td></tr>
    <tr><td><code>$avg $min $max</code></td><td><code>AVG MIN MAX</code></td><td>ignore null and missing</td></tr>
    <tr><td><code>$push</code></td><td><code>ARRAY_AGG(x)</code></td><td>all values, duplicates kept</td></tr>
    <tr><td><code>$addToSet</code></td><td><code>ARRAY_AGG(DISTINCT x)</code></td><td>unique values, order not guaranteed</td></tr>
    <tr><td><code>$first $last</code></td><td>—</td><td>meaningful only after a <code>$sort</code> (section 05)</td></tr>
  </table>
  <p>Three variations: one bin for everything (<code>_id: null</code>), HAVING (a <code>$match</code> <em>after</em> the group), and a two-field key (an object as <code>_id</code>):</p>
  <div class="fx" data-lang="js">db.orders.aggregate([ { $match: { status: "delivered" } },
  { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: "$amount" } } } ])
db.orders.aggregate([ { $match: { status: "delivered" } },
  { $group: { _id: "$restaurant_id", revenue: { $sum: "$amount" } } },
  { $match: { revenue: { $gte: 900 } } },
  { $sort: { _id: 1 } } ])
db.orders.aggregate([
  { $group: { _id: { restaurant: "$restaurant_id", status: "$status" }, n: { $sum: 1 } } },
  { $sort: { "_id.restaurant": 1, "_id.status": 1 } } ])</div>
  <div class="fx" data-lang="text">[ { _id: null, orders: 7, revenue: 2630 } ]
[ { _id: 11, revenue: 1230 }, { _id: 12, revenue: 900 } ]
[
  { _id: { restaurant: 10, status: 'delivered' }, n: 2 },
  { _id: { restaurant: 10, status: 'pending' }, n: 1 },
  { _id: { restaurant: 11, status: 'delivered' }, n: 3 },
  { _id: { restaurant: 12, status: 'cancelled' }, n: 1 },
  { _id: { restaurant: 12, status: 'delivered' }, n: 2 },
  { _id: { restaurant: 13, status: 'cancelled' }, n: 1 }
]</div>
  <p><code>_id: null</code> gave the grand total: 7 delivered orders, ₹2,630. The second <code>$match</code> ran on the <em>group results</em>, so it filtered on the computed <code>revenue</code>: only Biryani Bros (1230) and Pizza Point (900) reach ₹900. The compound key made one bin per (restaurant, status) pair that exists: 6 bins. Momo Magic (14) has no orders, so it has no bin.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$group</strong>: <code>{ $group: { _id: &lt;key expression&gt;, field: { &lt;accumulator&gt;: &lt;expression&gt; }, … } }</code>. <strong>Group key</strong>: the <code>_id</code>; <code>null</code> means one group. <strong>Accumulator</strong>: folds many values into one per group.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: text that looks like a number, and vanished fields</span>
    <p>On four scratch documents with amounts <code>240</code>, <code>"450"</code> (text), <code>520</code> and none:</p>
    <div class="fx" data-lang="js">db.scratch.insertMany([ { _id: 1, amount: 240 }, { _id: 2, amount: "450" }, { _id: 3, amount: 520 }, { _id: 4, note: "no amount" } ])
db.scratch.aggregate([ { $group: { _id: null, n: { $sum: 1 }, total: { $sum: "$amount" }, avg: { $avg: "$amount" } } } ])
db.scratch.drop()</div>
    <div class="fx" data-lang="text">{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('6ad6b27670372c73082b06dc'),
    '1': ObjectId('6ad6b27670372c73082b06dd'),
    '2': ObjectId('6ad6b27670372c73082b06de'),
    '3': ObjectId('6ad6b27670372c73082b06df')
  }
}
[ { _id: null, n: 4, total: 760, avg: 380 } ]
true</div>
    <p>4 documents counted, but the total is 760, not 1,210: <code>$sum</code> skipped the string without a word, and <code>$avg</code> averaged only the two real numbers. Data loaded from CSV often stores numbers as text; convert with <code>$toDouble</code> or fix it on load. Second trap: after <code>$group</code> only <code>_id</code> and the accumulators exist. <code>status</code>, <code>items</code>, everything else is gone, and the grouping field is now called <code>_id</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: $project and $addFields.</b> <code>$group</code> can only fold fields that already exist. Questions like "does each stored bill equal the sum of its lines?", "lunch or dinner (in IST)?", or "how many lines per order?" need values computed from fields <em>before</em> grouping.</div>

  <h2 id="ma-shape"><span class="num">04</span>$project &amp; $addFields: Compute New Fields</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each order stores <code>amount</code>, and each line stores <code>qty</code> and <code>unit_price</code>. Is every stored bill really the sum of its lines? No field holds "sum of qty × unit_price"; it has to be calculated for every order. Which stage computes new values?</p>
  </div>
  <div class="cards">
    <div><b>$addFields</b><p>Alias <code>$set</code>. Adds or overwrites fields and keeps all the rest.</p></div>
    <div><b>$project</b><p>Chooses the output fields: keep, drop, rename, compute. Unlisted fields are dropped (except <code>_id</code>).</p></div>
    <div><b>Expressions</b><p><code>$multiply $sum $map $filter $size $cond $ifNull $hour $dateToString</code> …</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Filling in the "Total" box at the bottom of each bill: go down the lines, multiply quantity by rate for each, add them up. <code>$map</code> is "do this for every line"; <code>$sum</code> is "add them up".</p>
  </div>
  <p>By hand for order 102 first:</p>
  <table class="tbl">
    <tr><th>Step</th><th>Value</th></tr>
    <tr><td><code>$items</code></td><td>[ {Chicken Biryani, qty 1, 350}, {Raita, qty 2, 50} ]</td></tr>
    <tr><td><code>$map</code>: qty × unit_price per line <code>l</code></td><td>[ 350, 100 ]</td></tr>
    <tr><td><code>$sum</code> of that array</td><td>450 = the stored <code>amount</code> ✓</td></tr>
  </table>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $addFields: {
      lines_total: { $sum: { $map: { input: "$items", as: "l",
                                     in: { $multiply: ["$$l.qty", "$$l.unit_price"] } } } } } },
  { $project: { amount: 1, lines_total: 1,
                n_lines: { $size: "$items" },
                ok: { $eq: ["$amount", "$lines_total"] } } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 101, amount: 240, lines_total: 240, n_lines: 1, ok: true },
  { _id: 102, amount: 450, lines_total: 450, n_lines: 2, ok: true },
  { _id: 103, amount: 520, lines_total: 520, n_lines: 1, ok: true },
  { _id: 104, amount: 380, lines_total: 380, n_lines: 2, ok: true },
  { _id: 105, amount: 310, lines_total: 310, n_lines: 1, ok: true },
  { _id: 106, amount: 180, lines_total: 180, n_lines: 1, ok: true },
  { _id: 107, amount: 260, lines_total: 260, n_lines: 1, ok: true },
  { _id: 108, amount: 260, lines_total: 260, n_lines: 2, ok: true },
  { _id: 109, amount: 600, lines_total: 600, n_lines: 2, ok: true },
  { _id: 110, amount: 310, lines_total: 310, n_lines: 2, ok: true }
]</div>
  <p>All 10 stored bills equal the sum of their lines (<code>ok: true</code>), the same invariant the SQL schema notes (<code>orders.amount = SUM(qty × unit_price)</code>). Inside <code>$map</code>, <code>input</code> is the array, <code>as: "l"</code> names the loop variable, and <code>in</code> is what to compute per element. The variable is read with a <strong>double</strong> dollar, <code>"$$l.qty"</code>; a single <code>$</code> would look for a field called <code>l</code> on the order. <code>$project</code> then listed what to show, with two more computed fields.</p>
  <p>More expressions, on three orders: a default for missing values, the hour in IST vs UTC, and an if-then-else:</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { _id: { $in: [101, 104, 105] } } },
  { $project: { _id: 1,
      minutes:  { $ifNull: ["$delivery_minutes", "not recorded"] },
      ist_hour: { $hour: { date: "$ordered_at", timezone: "Asia/Kolkata" } },
      utc_hour: { $hour: "$ordered_at" },
      meal:     { $cond: [ { $lt: [ { $hour: { date: "$ordered_at", timezone: "Asia/Kolkata" } }, 16 ] }, "lunch", "dinner" ] } } }
])
db.orders.aggregate([ { $match: { _id: 102 } }, { $project: { n_lines: { $size: "$items" } } } ])
db.orders.aggregate([ { $match: { _id: 102 } }, { $addFields: { n_lines: { $size: "$items" } } }, { $project: { items: 0 } } ])</div>
  <div class="fx" data-lang="text">[
  { _id: 101, minutes: 32, ist_hour: 12, utc_hour: 6, meal: 'lunch' },
  {
    _id: 104,
    minutes: 'not recorded',
    ist_hour: 13,
    utc_hour: 7,
    meal: 'lunch'
  },
  {
    _id: 105,
    minutes: 'not recorded',
    ist_hour: 19,
    utc_hour: 14,
    meal: 'dinner'
  }
]
[ { _id: 102, n_lines: 2 } ]
[
  {
    _id: 102,
    customer_id: 2,
    restaurant_id: 11,
    ordered_at: ISODate('2026-03-02T07:35:00.000Z'),
    status: 'delivered',
    amount: 450,
    delivery_minutes: 41,
    n_lines: 2
  }
]</div>
  <p>(1) <code>$ifNull</code> replaced 104's null and 105's missing time with a label. (2) Order 101 was placed at 12:10 IST, which is 06:40 UTC: <code>$hour</code> without a timezone says 6. Any "orders by hour" or "orders per day" report must pass <code>timezone: "Asia/Kolkata"</code>. (3) <code>$cond</code> labels lunch or dinner. Then the trap pair: <code>$project</code> with one computed field returned <em>only</em> <code>_id</code> and <code>n_lines</code>; <code>$addFields</code> kept everything and added <code>n_lines</code> (we hid <code>items</code> just to keep the print short).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Expression</strong>: a computed value inside a stage, e.g. <code>{ $multiply: [a, b] }</code>. <strong>"$$var"</strong>: a variable from <code>$map</code>, <code>$filter</code> or <code>$lookup</code>'s <code>let</code>. <strong>$project</strong> shapes the output; <strong>$addFields</strong>/<strong>$set</strong> adds to it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: $project drops, and single vs double dollar</span>
    <p>Listing one computed field in <code>$project</code> drops every other field (order 102 kept only <code>n_lines</code>). Inside <code>$map</code>, <code>"$l.qty"</code> (one dollar) silently reads a non-existent field and the total becomes 0; write <code>"$$l.qty"</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: $sort and $limit.</b> We can filter, group and compute. But the outputs come out in arbitrary order, and the questions are often "the top 2 restaurants" or "each customer's latest order", which need ordering and cutting <em>inside</em> the pipeline.</div>

  <h2 id="ma-sort"><span class="num">05</span>$sort &amp; $limit: Top-N and "Latest per Customer"</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Which 2 restaurants earned the most?" needs the group results ordered by revenue and cut to 2. "What is each customer's latest order?" needs ordering <em>before</em> grouping. Where do sorting and cutting go in a pipeline?</p>
  </div>
  <p><code>$sort</code>, <code>$limit</code> and <code>$skip</code> work like their <code>find</code> cousins, but they are stages, so they can sit anywhere: after a group (to rank groups) or before one (so that <code>$first</code> and <code>$last</code> pick a meaningful document).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Arranging the teacher's sticky notes by total marks and keeping the top two. Or, before making piles, stacking each student's sheets newest first, so the first sheet in each pile is the latest one.</p>
  </div>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$restaurant_id", revenue: { $sum: "$amount" } } },
  { $sort: { revenue: -1 } },
  { $limit: 2 }
])
db.orders.aggregate([
  { $sort: { ordered_at: -1 } },
  { $group: { _id: "$customer_id", latest_order: { $first: "$_id" }, latest_status: { $first: "$status" } } },
  { $sort: { _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[ { _id: 11, revenue: 1230 }, { _id: 12, revenue: 900 } ]
[
  { _id: 1, latest_order: 110, latest_status: 'pending' },
  { _id: 2, latest_order: 106, latest_status: 'delivered' },
  { _id: 3, latest_order: 108, latest_status: 'delivered' },
  { _id: 4, latest_order: 105, latest_status: 'cancelled' },
  { _id: 5, latest_order: 107, latest_status: 'cancelled' },
  { _id: 6, latest_order: 109, latest_status: 'delivered' }
]</div>
  <p>Traced. The first pipeline grouped (500, 1230, 900), sorted by revenue descending, kept 2: Biryani Bros, Pizza Point. The second sorted <em>all</em> orders newest first, then grouped by customer; <code>$first</code> took the first document that entered each bin, which after the sort is the latest: Asha's latest is pending order 110, Dia's is cancelled 105. Without the <code>$sort</code>, <code>$first</code> returns whichever order the server happened to read first.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$sort</strong>: order the stream (<code>1</code>/<code>-1</code>, several keys left to right). <strong>$limit / $skip</strong>: keep the first n / drop the first n. <strong>$first / $last</strong>: in <code>$group</code>, the value from the first / last document of each bin in stream order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ties and position</span>
    <p>As in <a class="xref" data-note="mongo_basics">find</a>, ties (orders 107 and 108 at ₹260) need a tie-breaker such as <code>_id</code>. And position matters: <code>$limit</code> before <code>$group</code> groups only the first n documents, a different question from "top n groups".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: $unwind.</b> Every stage so far worked on whole orders. "Revenue per <em>item</em>" asks about lines, which live inside each order's <code>items</code> array; one order can contain a dosa and a coffee. <code>$group</code> needs one key per document, and an order has several items.</div>

  <h2 id="ma-unwind"><span class="num">06</span>$unwind: One Order Becomes n Lines</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which items earn the most? Item names are inside the <code>items</code> array, and order 108 holds two (a dosa and a coffee). A document can only go into one <code>$group</code> bin. How does order 108 contribute to two different item bins?</p>
  </div>
  <p><code>$unwind</code> splits a document by an array field: one output document per element, with that field replaced by the single element and every other field (order <code>_id</code>, customer, status) copied onto each. After it, each document holds exactly one line, and grouping by item works.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Photocopying a bill once per line and cutting each copy so it shows only one line. Each slip still carries the bill number and customer, so you can sort slips into item trays.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 620 130" width="620">
    <defs><marker id="ma-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="0" y="20" width="240" height="90" rx="6" class="fb sb"/>
    <text x="10" y="40" font-size="11">_id 102 · customer 2 · delivered</text><text x="10" y="58" font-size="11">items: [</text>
    <rect x="20" y="64" width="110" height="24" rx="4" class="ft st"/><text x="75" y="80" text-anchor="middle" font-size="11">Chicken Biryani</text>
    <rect x="138" y="64" width="90" height="24" rx="4" class="fv sb"/><text x="183" y="80" text-anchor="middle" font-size="11">Raita</text>
    <text x="10" y="104" font-size="11">]</text>
    <line x1="242" y1="65" x2="300" y2="65" stroke="currentColor" marker-end="url(#ma-ar2)"/><text x="271" y="58" text-anchor="middle" font-size="10" class="tm">$unwind</text>
    <rect x="310" y="8" width="300" height="50" rx="6" class="fb sb"/><text x="320" y="28" font-size="11">_id 102 · customer 2 · delivered</text>
    <rect x="320" y="34" width="210" height="20" rx="4" class="ft st"/><text x="328" y="48" font-size="11">items: Chicken Biryani (object)</text>
    <rect x="310" y="70" width="300" height="50" rx="6" class="fb sb"/><text x="320" y="90" font-size="11">_id 102 · customer 2 · delivered</text>
    <rect x="320" y="96" width="210" height="20" rx="4" class="fv sb"/><text x="328" y="110" font-size="11">items: Raita (object)</text>
  </svg><figcaption>One document per array element; parent fields are copied onto each. The same _id appears twice.</figcaption></figure>
  <div class="fx" data-lang="js">db.orders.aggregate([ { $match: { _id: 102 } }, { $unwind: "$items" }, { $project: { customer_id: 1, status: 1, items: 1 } } ])
db.orders.aggregate([ { $unwind: "$items" }, { $count: "lines" } ])</div>
  <div class="fx" data-lang="text">[
  {
    _id: 102,
    customer_id: 2,
    status: 'delivered',
    items: { item: 'Chicken Biryani', qty: 1, unit_price: 350 }
  },
  {
    _id: 102,
    customer_id: 2,
    status: 'delivered',
    items: { item: 'Raita', qty: 2, unit_price: 50 }
  }
]
[ { lines: 15 } ]</div>
  <p>Order 102 became 2 documents, both with <code>_id: 102</code>, and <code>items</code> is now one object, so <code>"$items.item"</code> is one plain value. Over all 10 orders: 1+2+1+2+1+1+1+2+2+2 = <strong>15</strong> documents, exactly the 15 rows of SQL's <code>order_items</code> table. <code>$unwind</code> is the document world's way back to the line grain. Now revenue per item for delivered orders:</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $unwind: "$items" },
  { $group: { _id: "$items.item",
              qty:     { $sum: "$items.qty" },
              revenue: { $sum: { $multiply: ["$items.qty", "$items.unit_price"] } } } },
  { $sort: { revenue: -1, _id: 1 } },
  { $limit: 4 }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 'Chicken Biryani', qty: 2, revenue: 700 },
  { _id: 'Farmhouse Pizza', qty: 2, revenue: 520 },
  { _id: 'Masala Dosa', qty: 3, revenue: 360 },
  { _id: 'Margherita', qty: 1, revenue: 280 }
]</div>
  <div class="fx" data-lang="sql">SELECT i.item, SUM(i.qty) AS qty, SUM(i.qty * i.unit_price) AS revenue
FROM orders o JOIN order_items i ON i.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY i.item ORDER BY revenue DESC, i.item LIMIT 4;</div>
  <table class="tbl out"><caption>PostgreSQL 17: SQL joins order_items where MongoDB unwinds items: same 4 rows</caption><tr><th>item</th><th>qty</th><th>revenue</th></tr><tr><td>Chicken Biryani</td><td>2</td><td>700.00</td></tr><tr><td>Farmhouse Pizza</td><td>2</td><td>520.00</td></tr><tr><td>Masala Dosa</td><td>3</td><td>360.00</td></tr><tr><td>Margherita</td><td>1</td><td>280.00</td></tr></table>
  <p>Chicken Biryani: 1 × 350 (order 102) + 1 × 350 (order 109) = 700. Masala Dosa: 2 × 120 (101) + 1 × 120 (108) = 360; order 110's two dosas don't count because 110 is pending. The SQL version needs a join to <code>order_items</code>; the pipeline needs an <code>$unwind</code> of the embedded array. Same answer.</p>
  <h3>Counting after $unwind, and forgetting it</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { customer_id: 1 } },
  { $unwind: "$items" },
  { $group: { _id: "$customer_id", docs_after_unwind: { $sum: 1 }, orders: { $addToSet: "$_id" } } },
  { $project: { docs_after_unwind: 1, n_orders: { $size: "$orders" } } }
])
db.orders.aggregate([ { $group: { _id: "$items.item", n: { $sum: 1 } } }, { $sort: { n: -1, _id: 1 } }, { $limit: 3 } ])</div>
  <div class="fx" data-lang="text">[ { _id: 1, docs_after_unwind: 5, n_orders: 3 } ]
[
  { _id: [ 'Farmhouse Pizza' ], n: 2 },
  { _id: [ 'Masala Dosa', 'Filter Coffee' ], n: 2 },
  { _id: [ 'Buddha Bowl' ], n: 1 }
]</div>
  <p>Asha has 3 orders (101, 104, 110) but 5 lines, so <code>$sum: 1</code> after unwinding counts 5. This is the document version of <a class="xref" data-note="sql_joins">join fan-out</a>: every line carries a copy of its order. Count distinct orders with <code>$addToSet: "$_id"</code> + <code>$size</code> (3), or count before unwinding. The second pipeline forgot <code>$unwind</code>: <code>"$items.item"</code> is an <em>array</em> per order, so it grouped by whole arrays like <code>['Masala Dosa', 'Filter Coffee']</code>. Wrong answer, no error.</p>
  <h3>Empty arrays disappear</h3>
  <p>A temporary order 111 with <code>items: []</code> (added and removed for this test):</p>
  <div class="fx" data-lang="js">db.orders.insertOne({ _id: 111, customer_id: 4, restaurant_id: 13, status: "pending", amount: 0, items: [] })
db.orders.aggregate([ { $unwind: "$items" }, { $count: "n" } ])
db.orders.aggregate([ { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } }, { $count: "n" } ])
db.orders.deleteOne({ _id: 111 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: 111 }
[ { n: 15 } ]
[ { n: 16 } ]
{ acknowledged: true, deletedCount: 1 }</div>
  <p>Plain <code>$unwind</code> produced 15 documents: order 111 vanished, like an inner join. With <code>preserveNullAndEmptyArrays: true</code> it stayed (16), with no <code>items</code> field.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$unwind</strong>: <code>{ $unwind: "$arrayField" }</code> or <code>{ $unwind: { path, preserveNullAndEmptyArrays, includeArrayIndex } }</code>; outputs one document per element. <strong>Grain</strong>: what one document means (an order before, a line after).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the grain changed</span>
    <p>After <code>$unwind</code>, one document is a line, not an order. Summing <code>"$amount"</code> after unwinding adds each order's bill once per line (Asha: 240 + 380 + 380 + 310 + 310 = 1,620 instead of 930), the exact fan-out bug of the SQL notes. Sum line values (<code>qty × unit_price</code>) after unwinding, order values before.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: $lookup.</b> We can reach inside arrays. But the reports still print <code>customer_id: 3</code> and <code>restaurant_id: 11</code>; the names live in other collections. And "every customer with their order count" must include Gita, who has no orders at all.</div>

  <h2 id="ma-lookup"><span class="num">07</span>$lookup: The Join, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Orders store only <code>customer_id</code>. A report needs the customer's <em>name</em> beside their spend, and a list of every customer with their number of orders, Gita included. In SQL that is a JOIN (a LEFT JOIN, for Gita). Which stage reaches into another collection?</p>
  </div>
  <p><code>$lookup</code> takes each incoming document, finds the matching documents in another collection, and attaches them as an <strong>array field</strong>. You give four things: <code>from</code> (the other collection), <code>localField</code> (field here), <code>foreignField</code> (field there) and <code>as</code> (name of the new array).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A clerk going through the customer register. For each customer she walks to the order cabinet, pulls every order slip with that customer number, and staples them to the customer's page. A customer with no slips keeps the page, with nothing stapled.</p>
  </div>
  <p>Traced for three customers before running it:</p>
  <table class="tbl">
    <tr><th>customer (_id)</th><th>search orders where customer_id =</th><th>found</th><th>attached <code>orders</code> array</th></tr>
    <tr><td>Asha (1)</td><td>1</td><td>101, 104, 110</td><td>3 order documents</td></tr>
    <tr><td>Ben (2)</td><td>2</td><td>102, 106</td><td>2 order documents</td></tr>
    <tr><td>Gita (7)</td><td>7</td><td>none</td><td><code>[]</code>, Gita is kept</td></tr>
  </table>
  <div class="fx" data-lang="js">db.customers.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "customer_id", as: "orders" } },
  { $project: { _id: 0, name: 1, order_ids: "$orders._id", n_orders: { $size: "$orders" } } }
])</div>
  <div class="fx" data-lang="text">[
  { name: 'Asha', order_ids: [ 101, 104, 110 ], n_orders: 3 },
  { name: 'Ben', order_ids: [ 102, 106 ], n_orders: 2 },
  { name: 'Chen', order_ids: [ 103, 108 ], n_orders: 2 },
  { name: 'Dia', order_ids: [ 105 ], n_orders: 1 },
  { name: 'Esha', order_ids: [ 107 ], n_orders: 1 },
  { name: 'Farah', order_ids: [ 109 ], n_orders: 1 },
  { name: 'Gita', order_ids: [], n_orders: 0 }
]</div>
  <div class="fx" data-lang="sql">SELECT c.name, COUNT(o.order_id) AS n_orders
FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name ORDER BY c.customer_id;</div>
  <table class="tbl out"><caption>PostgreSQL 17: the LEFT JOIN from the JOINs note gives the same 7 counts</caption><tr><th>name</th><th>n_orders</th></tr><tr><td>Asha</td><td>3</td></tr><tr><td>Ben</td><td>2</td></tr><tr><td>Chen</td><td>2</td></tr><tr><td>Dia</td><td>1</td></tr><tr><td>Esha</td><td>1</td></tr><tr><td>Farah</td><td>1</td></tr><tr><td>Gita</td><td>0</td></tr></table>
  <p><code>"$orders._id"</code> pulled just the ids out of the attached array. Gita got <code>[]</code> and 0, so <code>$lookup</code> behaves as a <strong>left outer join</strong>, like SQL's LEFT JOIN with <code>COUNT(o.order_id)</code>.</p>
  <figure class="viz"><svg viewBox="0 0 620 150" width="620">
    <text x="0" y="14" font-size="11" class="tm">customers</text><text x="200" y="14" font-size="11" class="tm">+ as: "orders" (array from orders)</text>
    <g font-size="11">
      <rect x="0" y="22" width="120" height="26" rx="4" class="fb sb"/><text x="10" y="40">1 Asha</text>
      <rect x="0" y="54" width="120" height="26" rx="4" class="fb sb"/><text x="10" y="72">2 Ben</text>
      <rect x="0" y="86" width="120" height="26" rx="4" class="fb sb"/><text x="10" y="104">6 Farah</text>
      <rect x="0" y="118" width="120" height="26" rx="4" class="fb sb"/><text x="10" y="136">7 Gita</text>
      <rect x="200" y="22" width="60" height="26" rx="4" class="ft st"/><text x="230" y="40" text-anchor="middle">101</text><rect x="266" y="22" width="60" height="26" rx="4" class="ft st"/><text x="296" y="40" text-anchor="middle">104</text><rect x="332" y="22" width="60" height="26" rx="4" class="ft st"/><text x="362" y="40" text-anchor="middle">110</text>
      <rect x="200" y="54" width="60" height="26" rx="4" class="ft st"/><text x="230" y="72" text-anchor="middle">102</text><rect x="266" y="54" width="60" height="26" rx="4" class="ft st"/><text x="296" y="72" text-anchor="middle">106</text>
      <rect x="200" y="86" width="60" height="26" rx="4" class="ft st"/><text x="230" y="104" text-anchor="middle">109</text>
      <rect x="200" y="118" width="60" height="26" rx="4" fill="none" stroke="currentColor" stroke-dasharray="4 3" opacity=".6"/><text x="230" y="136" text-anchor="middle">[ ]</text>
      <text x="430" y="40" class="tm">$size → 3</text><text x="430" y="72" class="tm">$size → 2</text><text x="430" y="104" class="tm">$size → 1</text><text x="430" y="136" class="tr">$size → 0 (kept)</text>
    </g>
    <g stroke="currentColor" opacity=".5"><line x1="120" y1="35" x2="198" y2="35"/><line x1="120" y1="67" x2="198" y2="67"/><line x1="120" y1="99" x2="198" y2="99"/><line x1="120" y1="131" x2="198" y2="131"/></g>
  </svg><figcaption>$lookup keeps every input document and attaches its matches as an array; no match gives an empty array.</figcaption></figure>
  <h3>Group first, then look up names</h3>
  <p>Delivered spend per customer, with names. Group first (4 groups), then look up (4 lookups), rather than looking up for every one of the 7 orders:</p>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$customer_id", spent: { $sum: "$amount" } } },
  { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } },
  { $unwind: "$c" },
  { $project: { _id: 0, name: "$c.name", spent: 1 } },
  { $sort: { spent: -1 } }
])</div>
  <div class="fx" data-lang="text">[
  { spent: 780, name: 'Chen' },
  { spent: 630, name: 'Ben' },
  { spent: 620, name: 'Asha' },
  { spent: 600, name: 'Farah' }
]</div>
  <p>Chen: 520 + 260 = 780; Ben: 450 + 180 = 630; Asha: 240 + 380 = 620 (110 is pending); Farah: 600. <code>$lookup</code> returned an array <code>c</code> holding one customer; <code>$unwind: "$c"</code> turned it into a plain object so <code>"$c.name"</code> works.</p>
  <h3>Inner joins, and conditions on the joined side</h3>
  <div class="fx" data-lang="js">db.customers.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "customer_id", as: "o" } },
  { $unwind: "$o" }, { $count: "rows" } ])
db.customers.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "customer_id", as: "o" } },
  { $unwind: { path: "$o", preserveNullAndEmptyArrays: true } }, { $count: "rows" } ])
db.restaurants.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "restaurant_id",
               pipeline: [ { $match: { status: "delivered" } }, { $project: { _id: 1 } } ],
               as: "delivered" } },
  { $project: { _id: 0, name: 1, delivered: "$delivered._id" } }
])</div>
  <div class="fx" data-lang="text">[ { rows: 10 } ]
[ { rows: 11 } ]
[
  { name: 'Dosa Hut', delivered: [ 101, 108 ] },
  { name: 'Biryani Bros', delivered: [ 102, 106, 109 ] },
  { name: 'Pizza Point', delivered: [ 103, 104 ] },
  { name: 'Green Bowl', delivered: [] },
  { name: 'Momo Magic', delivered: [] }
]</div>
  <p><code>$lookup</code> + <code>$unwind</code> gave 10 rows (one per customer–order pair): Gita vanished, an <strong>inner join</strong>. With <code>preserveNullAndEmptyArrays</code> she came back: 11 rows, the LEFT JOIN count from <a class="xref" data-note="sql_joins">JOINs</a>. The last pipeline gives <code>$lookup</code> its own small <code>pipeline</code> to filter the joined side (delivered only): Green Bowl's only order was cancelled and Momo Magic has none, so both get <code>[]</code>. Filtering inside the lookup keeps them, the same idea as putting the condition in <code>ON</code> rather than <code>WHERE</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$lookup</strong>: a left outer join that stores matches in an array. Forms: <code>{ from, localField, foreignField, as }</code>; add <code>pipeline: [...]</code> to filter or reshape matches (5.0+), or use <code>let</code> + <code>$expr</code> for arbitrary conditions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: a $lookup on every page view is a schema smell</span>
    <p><code>$lookup</code> runs a search per input document; without an index on <code>foreignField</code> each search scans the whole other collection. If the order page always shows the customer's name, copying the name into the order (the <em>extended reference</em> pattern in <a class="xref" data-note="mongo_design">Schema Design</a>) removes the join entirely.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: $facet, $bucket and windows.</b> We can filter, group, compute, unwind and join. A dashboard still wants several summaries at once (counts by status <em>and</em> the biggest order), amount bands, and running totals that keep every order row. Running three pipelines, or collapsing rows with <code>$group</code>, is not what it needs.</div>

  <h2 id="ma-facet"><span class="num">08</span>$facet, $bucket &amp; Windows (Briefly)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Three dashboard tiles: orders by status, the single biggest order, and the total, from one query. A histogram of order amounts. A "spend so far" column next to each delivered order. Each is awkward with the stages we have.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p><code>$facet</code> is one exam paper photocopied for three examiners, each marking a different section at the same time. <code>$bucket</code> is sorting parcels into weight bands. A window function is the running balance column in a bank passbook: every row stays, and each row also shows the total so far.</p>
  </div>
  <h3>$facet: several answers in one pass</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $facet: {
      by_status: [ { $group: { _id: "$status", n: { $sum: 1 } } }, { $sort: { _id: 1 } } ],
      top_order: [ { $sort: { amount: -1 } }, { $limit: 1 }, { $project: { amount: 1 } } ],
      total:     [ { $count: "orders" } ]
  } }
])</div>
  <div class="fx" data-lang="text">[
  {
    by_status: [
      { _id: 'cancelled', n: 2 },
      { _id: 'delivered', n: 7 },
      { _id: 'pending', n: 1 }
    ],
    top_order: [ { _id: 109, amount: 600 } ],
    total: [ { orders: 10 } ]
  }
]</div>
  <p>Each key in <code>$facet</code> is a mini pipeline fed the same 10 orders. The output is <strong>one</strong> document holding every sub-result as an array.</p>
  <h3>$bucket: a histogram</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $bucket: { groupBy: "$amount", boundaries: [0, 250, 400, 1000], default: "other",
               output: { n: { $sum: 1 }, ids: { $push: "$_id" } } } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 0, n: 2, ids: [ 101, 106 ] },
  { _id: 250, n: 5, ids: [ 104, 105, 107, 108, 110 ] },
  { _id: 400, n: 3, ids: [ 102, 103, 109 ] }
]</div>
  <p>Amounts 240 and 180 fall in [0, 250); 380, 310, 260, 260, 310 in [250, 400); 450, 520, 600 in [400, 1000). Each bucket's <code>_id</code> is its lower bound, which is included; the upper bound is excluded. Values outside all boundaries go to <code>default</code>.</p>
  <h3>$setWindowFields: running spend per customer</h3>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $setWindowFields: {
      partitionBy: "$customer_id",
      sortBy: { ordered_at: 1 },
      output: { running_spend: { $sum: "$amount",
                                 window: { documents: ["unbounded", "current"] } } } } },
  { $project: { customer_id: 1, amount: 1, running_spend: 1 } },
  { $sort: { customer_id: 1, _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 101, customer_id: 1, amount: 240, running_spend: 240 },
  { _id: 104, customer_id: 1, amount: 380, running_spend: 620 },
  { _id: 102, customer_id: 2, amount: 450, running_spend: 450 },
  { _id: 106, customer_id: 2, amount: 180, running_spend: 630 },
  { _id: 103, customer_id: 3, amount: 520, running_spend: 520 },
  { _id: 108, customer_id: 3, amount: 260, running_spend: 780 },
  { _id: 109, customer_id: 6, amount: 600, running_spend: 600 }
]</div>
  <p>Read it like SQL's <code>SUM(amount) OVER (PARTITION BY customer_id ORDER BY ordered_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)</code> from <a class="xref" data-note="sql_windows">Window Functions</a>. Each customer is a partition; within it, rows sorted by time are summed from the first to the current: Chen 520 → 780. All 7 rows survive, unlike <code>$group</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$facet</strong>: run several sub-pipelines on the same input, output one document. <strong>$bucket</strong>: group by ranges given as boundaries (<code>$bucketAuto</code> picks them). <strong>$setWindowFields</strong>: add a value computed over a window of related documents without collapsing them (5.0+).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: $facet's single document</span>
    <p><code>$facet</code> returns one document, so all its sub-results together must fit in 16 MB: never put an unlimited result list in a facet without <code>$limit</code>. Its sub-pipelines also cannot use indexes; put the shared <code>$match</code> before the <code>$facet</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SQL → pipeline mapping.</b> Every SQL clause from the SQL notes now has a stage. When you face a SQL query (or think in SQL), how do you translate it systematically, and in what order do the stages go?</div>

  <h2 id="ma-sql"><span class="num">09</span>SQL → Pipeline Mapping</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You can write "revenue per cuisine, delivered only, cuisines with at least ₹500, biggest first" in SQL without thinking. SQL is written <code>SELECT … FROM … WHERE … GROUP BY</code> but executed in a different order. How does it become stages, and in which order?</p>
  </div>
  <p>A pipeline runs exactly in the order written. So translate SQL in its <em>logical execution</em> order (from <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a>): FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>SQL is ordering at a restaurant: you say what you want and the kitchen decides the steps. A pipeline is cooking from a recipe card yourself: step 1, step 2, step 3, in that order. More control, and more ways to put a step in the wrong place.</p>
  </div>
  <table class="tbl">
    <tr><th>SQL</th><th>Pipeline stage</th><th>Where it goes</th></tr>
    <tr><td><code>WHERE</code></td><td><code>$match</code></td><td>first (before <code>$group</code>)</td></tr>
    <tr><td><code>JOIN</code> (to a parent)</td><td><code>$lookup</code> + <code>$unwind</code></td><td>after the first <code>$match</code>, or after <code>$group</code> when only names are needed</td></tr>
    <tr><td><code>JOIN</code> to a child table that is embedded</td><td><code>$unwind</code> of the array</td><td>after <code>$match</code></td></tr>
    <tr><td><code>LEFT JOIN</code></td><td><code>$lookup</code> (or <code>$unwind</code> with <code>preserveNullAndEmptyArrays</code>)</td><td>—</td></tr>
    <tr><td><code>GROUP BY</code> + aggregates</td><td><code>$group</code> with accumulators</td><td>after filters and unwinds</td></tr>
    <tr><td><code>HAVING</code></td><td><code>$match</code> after <code>$group</code></td><td>right after the group</td></tr>
    <tr><td><code>SELECT col, expr AS x</code></td><td><code>$project</code> / <code>$addFields</code></td><td>where the value is needed (often last)</td></tr>
    <tr><td><code>ORDER BY</code> / <code>LIMIT</code> / <code>OFFSET</code></td><td><code>$sort</code> / <code>$limit</code> / <code>$skip</code></td><td>end</td></tr>
    <tr><td><code>COUNT(*)</code> of a result</td><td><code>$count</code></td><td>end</td></tr>
    <tr><td><code>OVER (…)</code></td><td><code>$setWindowFields</code></td><td>—</td></tr>
    <tr><td><code>UNION ALL</code></td><td><code>$unionWith</code></td><td>—</td></tr>
    <tr><td><code>CREATE TABLE AS</code> / <code>INSERT … SELECT</code></td><td><code>$out</code> / <code>$merge</code></td><td>last stage</td></tr>
  </table>
  <p>The worked translation, SQL first (on the SQL tables), then the pipeline (on the documents), with each stage commented by the clause it replaces:</p>
  <div class="fx" data-lang="sql">SELECT r.cuisine, COUNT(*) AS orders, SUM(o.amount) AS revenue
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
WHERE o.status = 'delivered'
GROUP BY r.cuisine
HAVING SUM(o.amount) &gt;= 500
ORDER BY revenue DESC;</div>
  <table class="tbl out"><caption>PostgreSQL 17</caption><tr><th>cuisine</th><th>orders</th><th>revenue</th></tr><tr><td>Biryani</td><td>3</td><td>1230.00</td></tr><tr><td>Pizza</td><td>2</td><td>900.00</td></tr><tr><td>South Indian</td><td>2</td><td>500.00</td></tr></table>
  <div class="fx" data-lang="js">db.orders.aggregate([
  { $match: { status: "delivered" } },                                   // WHERE
  { $lookup: { from: "restaurants", localField: "restaurant_id",
               foreignField: "_id", as: "r" } },                         // JOIN
  { $unwind: "$r" },                                                     //   (one restaurant per order)
  { $group: { _id: "$r.cuisine", orders: { $sum: 1 },
              revenue: { $sum: "$amount" } } },                          // GROUP BY + aggregates
  { $match: { revenue: { $gte: 500 } } },                                // HAVING
  { $sort: { revenue: -1 } }                                             // ORDER BY
])</div>
  <div class="fx" data-lang="text">[
  { _id: 'Biryani', orders: 3, revenue: 1230 },
  { _id: 'Pizza', orders: 2, revenue: 900 },
  { _id: 'South Indian', orders: 2, revenue: 500 }
]</div>
  <p>Identical rows. Notice the order: <code>$match</code> (WHERE) before <code>$lookup</code>, so only 7 orders are joined instead of 10; the HAVING <code>$match</code> sees group results; <code>$sort</code> last. Healthy (Green Bowl) never appears: its only order was cancelled, so it has no delivered revenue.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>$out</strong>: write the pipeline result into a collection, replacing it. <strong>$merge</strong>: insert or update the result into a collection, keeping other documents (incremental summary tables). Both must be the last stage. <strong>$unionWith</strong>: append another collection's documents to the stream.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: writing the stages in SQL's written order</span>
    <p>SQL users write the <code>$project</code> (their SELECT) first. A pipeline that projects first and then groups works only on the projected fields; one that groups and then matches on a raw field (<code>status</code>) finds nothing, because that field no longer exists. Write stages in the order the data should be processed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: performance.</b> On 10 orders every pipeline returns instantly, whatever its order. On Biteful at real size the same pipeline can read every document or a tenth of them. What decides, and what happens when a stage runs out of memory?</div>

  <h2 id="ma-perf"><span class="num">10</span>Performance: $match Early, Indexes, allowDiskUse</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Revenue lost to cancellations per restaurant" is instant on 10 orders. On 200,000, does the pipeline read all of them to find the 20,000 cancelled ones? Does stage order matter? What if a sort needs more memory than the server allows?</p>
  </div>
  <p>An <strong>index</strong> is a sorted list of one field's values with pointers to the documents (a B-tree, the same structure as in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>), so the server can jump to <code>status = "cancelled"</code> instead of reading everything. The same idea at scale: a separate database <code>biteful_big</code> with 200,000 orders of Biteful's shape (two lines each, 10% cancelled, 5 restaurants, 5,000 customers).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding every "cancelled" slip in a warehouse. Without an index you walk every aisle (a collection scan). With an index you open the register at "cancelled" and go straight to those shelves. The register helps only at the door: once slips are on your trolley (inside the pipeline), the register is no use for re-sorting them.</p>
  </div>
  <div class="fx" data-lang="js">use biteful_big
db.dropDatabase()
const statuses = ["delivered", "delivered", "delivered", "delivered", "delivered",
                  "delivered", "delivered", "delivered", "pending", "cancelled"]
const menu = [["Masala Dosa", 120], ["Chicken Biryani", 350], ["Farmhouse Pizza", 260],
              ["Buddha Bowl", 310], ["Momos", 150], ["Filter Coffee", 70]]
let docs = []
for (let i = 0; i &lt; 200000; i++) {
  const a = menu[i % 6], b = menu[(i * 7) % 6]
  docs.push({ _id: i, customer_id: i % 5000, restaurant_id: 10 + (Math.floor(i / 10) % 5),
              ordered_at: new Date(Date.UTC(2026, 0, 1) + (i % 90) * 86400000 + (i % 1440) * 60000),
              status: statuses[i % 10], amount: a[1] * (1 + i % 2) + b[1],
              items: [ { item: a[0], qty: 1 + i % 2, unit_price: a[1] }, { item: b[0], qty: 1, unit_price: b[1] } ] })
  if (docs.length === 20000) { db.orders.insertMany(docs); docs = [] }
}
db.orders.countDocuments()
db.orders.countDocuments({ status: "cancelled" })</div>
  <div class="fx" data-lang="text">200000
20000</div>
  <p>A small helper reads <code>explain("executionStats")</code> and reports the plan of the first stage (the part that reads the collection) and how many index keys and documents it examined:</p>
  <div class="fx" data-lang="js">use biteful_big
function summary(e) {                 // stages, keys and documents read by the first stage
  const c = e.stages ? e.stages[0].$cursor : e
  let p = c.queryPlanner.winningPlan, names = []
  for (p = p.queryPlan || p; p; p = p.inputStage) names.push(p.stage)
  const s = c.executionStats
  return { plan: names.join(" &lt;- "), keys: s.totalKeysExamined, docs: s.totalDocsExamined }
}
const p = [ { $match: { status: "cancelled" } },
            { $group: { _id: "$restaurant_id", lost: { $sum: "$amount" } } },
            { $sort: { _id: 1 } } ]
db.orders.aggregate(p)
summary(db.orders.explain("executionStats").aggregate(p))
db.orders.createIndex({ status: 1 })
summary(db.orders.explain("executionStats").aggregate(p))</div>
  <div class="fx" data-lang="text">switched to db biteful_big
[Function: summary]
[
  { _id: 10, lost: 2920200 },
  { _id: 11, lost: 2920320 },
  { _id: 12, lost: 2919480 },
  { _id: 13, lost: 2920200 },
  { _id: 14, lost: 2920320 }
]
{ plan: 'GROUP &lt;- COLLSCAN', keys: 0, docs: 200000 }
status_1
{ plan: 'GROUP &lt;- FETCH &lt;- IXSCAN', keys: 20000, docs: 20000 }</div>
  <p>Before the index: <code>COLLSCAN</code>, all 200,000 documents read to find 20,000. After <code>createIndex({ status: 1 })</code>: <code>IXSCAN</code> (walk the index), 20,000 keys, 20,000 documents. Same answer, 10× less reading. The <code>$group</code> appears inside the plan because MongoDB 8 runs simple <code>$match</code> + <code>$group</code> prefixes in its faster query engine.</p>
  <h3>What the optimizer moves, and what it can't</h3>
  <div class="fx" data-lang="js">const late = [ { $unwind: "$items" }, { $match: { status: "cancelled" } }, { $count: "lines" } ]
db.orders.aggregate(late)
summary(db.orders.explain("executionStats").aggregate(late))
const computed = [ { $addFields: { big: { $gt: ["$amount", 600] } } }, { $match: { big: true } }, { $count: "n" } ]
db.orders.aggregate(computed)
summary(db.orders.explain("executionStats").aggregate(computed))
const topk = [ { $sort: { amount: -1, _id: 1 } }, { $limit: 3 }, { $project: { amount: 1 } } ]
db.orders.aggregate(topk)
const t = db.orders.explain("executionStats").aggregate(topk)
summary(t)
const w = t.queryPlanner.winningPlan
(w.queryPlan || w).inputStage.limitAmount</div>
  <div class="fx" data-lang="text">[ { lines: 40000 } ]
{ plan: 'PROJECTION_SIMPLE &lt;- FETCH &lt;- IXSCAN', keys: 20000, docs: 20000 }
[ { n: 66667 } ]
{ plan: 'PROJECTION_SIMPLE &lt;- COLLSCAN', keys: 0, docs: 200000 }
[
  { _id: 1, amount: 1050 },
  { _id: 7, amount: 1050 },
  { _id: 13, amount: 1050 }
]
{ plan: 'PROJECTION_SIMPLE &lt;- SORT &lt;- COLLSCAN', keys: 0, docs: 200000 }
3</div>
  <table class="tbl out"><caption>Reading the three runs (real explain output on 200,000 orders)</caption>
    <tr><th>Pipeline</th><th>What the server did</th><th>Docs read</th></tr>
    <tr><td><code>$unwind</code> then <code>$match: { status }</code></td><td>moved the <code>$match</code> in front of the <code>$unwind</code>; used the index</td><td>20,000</td></tr>
    <tr><td><code>$addFields: { big }</code> then <code>$match: { big }</code></td><td>cannot move: <code>big</code> does not exist until computed; full scan</td><td>200,000</td></tr>
    <tr><td><code>$sort</code> + <code>$limit: 3</code></td><td>merged into one top-k <code>SORT</code> that keeps only 3 in memory (<code>limitAmount: 3</code>)</td><td>200,000 (no index on amount)</td></tr>
  </table>
  <h3>Memory limits and allowDiskUse</h3>
  <p><code>$sort</code> and <code>$group</code> are <strong>blocking</strong> stages: they must see all their input before emitting anything, so they hold it in memory. The default limit is 100 MB per stage. To show what happens past it without generating gigabytes, we <strong>lowered the sort limit to 10 MB on our private test server</strong> (and set it back to 100 MB afterwards):</p>
  <div class="fx" data-lang="js">db.adminCommand({ setParameter: 1, internalQueryMaxBlockingSortMemoryUsageBytes: 10 * 1024 * 1024 }).ok
const big = [ { $sort: { ordered_at: -1, _id: 1 } }, { $skip: 199990 }, { $count: "n" } ]
try { db.orders.aggregate(big, { allowDiskUse: false }).toArray() } catch (e) { print(e.codeName) }
db.orders.aggregate(big, { allowDiskUse: true })
function findSort(o) {                // walk the explain tree to the sort stage
  if (o &amp;&amp; typeof o === "object") {
    if (/^sort$/i.test(o.stage) &amp;&amp; "usedDisk" in o) return { memLimit: o.memLimit, usedDisk: o.usedDisk, spills: o.spills }
    for (const k in o) { const r = findSort(o[k]); if (r) return r }
  }
}
findSort(db.orders.explain("executionStats").aggregate(big, { allowDiskUse: true }))
db.adminCommand({ setParameter: 1, internalQueryMaxBlockingSortMemoryUsageBytes: 100 * 1024 * 1024 }).ok</div>
  <div class="fx" data-lang="text">1
QueryExceededMemoryLimitNoDiskUseAllowed
[ { n: 10 } ]
[Function: findSort]
{ memLimit: 10485760, usedDisk: true, spills: 2 }
1</div>
  <p>With <code>allowDiskUse: false</code> the sort of all 200,000 orders failed with <code>QueryExceededMemoryLimitNoDiskUseAllowed</code>. With <code>allowDiskUse: true</code> it succeeded, and explain shows the sort stage <code>usedDisk: true</code> with 2 spills: it wrote sorted runs to temporary files and merged them, which is correct but slower. Since MongoDB 6.0, <code>allowDiskUse</code> is on by default (server parameter <code>allowDiskUseByDefault</code>).</p>
  <ul>
    <li><strong>$match (and $sort) first.</strong> Only the stages that read the collection can use an index.</li>
    <li><strong>Project away what you don't need early</strong>, so blocking stages hold less.</li>
    <li><strong>$unwind multiplies.</strong> 1M orders × 5 lines = 5M documents in the next stage.</li>
    <li><strong>$lookup is a search per document.</strong> Index the <code>foreignField</code>; group before looking up.</li>
    <li><strong>Pre-aggregate</strong> reused results with <code>$merge</code> into a summary collection.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>explain("executionStats")</strong>: run and report the plan and work done. <strong>COLLSCAN</strong>: read every document. <strong>IXSCAN</strong>: walk an index. <strong>Blocking stage</strong>: one that must consume all input first (<code>$sort</code>, <code>$group</code>). <strong>allowDiskUse</strong>: let blocking stages spill to temporary files past the memory limit.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting the optimizer, testing on tiny data</span>
    <p>The optimizer rescued the badly ordered <code>$unwind</code> → <code>$match</code>, but not the match on a computed field, and it never creates an index for you. Write <code>$match</code> first anyway, and run <code>explain</code> on realistic data: on Biteful's 10 orders every plan "looks fast".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Python.</b> Pipelines usually run from a script or notebook, and the result goes into pandas for a chart. How does a pipeline look in pymongo, and how do we get a clean DataFrame from compound group keys?</div>

  <h2 id="ma-py"><span class="num">11</span>From Python: Pipeline to pandas</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An analyst wants a day × restaurant table of delivered revenue for a chart. You could pull every order into pandas and group there, but for big collections that moves far more data than needed. What is the right split between MongoDB and pandas?</p>
  </div>
  <p>Let MongoDB reduce many documents to a small summary (push-down), then let pandas reshape and plot it. In pymongo a pipeline is a Python list of dicts; every operator is a quoted string.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking the warehouse to send a one-page stock summary instead of shipping the whole warehouse to your office so you can count it yourself.</p>
  </div>
  <div class="fx" data-lang="py">from pymongo import MongoClient
import pandas as pd

db = MongoClient("mongodb://127.0.0.1:27347/?directConnection=true")["biteful"]
pipeline = [
    {"$match": {"status": "delivered"}},
    {"$lookup": {"from": "restaurants", "localField": "restaurant_id",
                 "foreignField": "_id", "as": "r"}},
    {"$unwind": "$r"},
    {"$group": {"_id": {"day": {"$dateToString": {"format": "%m-%d", "date": "$ordered_at",
                                                  "timezone": "Asia/Kolkata"}},
                        "restaurant": "$r.name"},
                "revenue": {"$sum": "$amount"}}},
    {"$project": {"_id": 0, "day": "$_id.day", "restaurant": "$_id.restaurant", "revenue": 1}},
    {"$sort": {"day": 1, "restaurant": 1}},
]
rows = list(db.orders.aggregate(pipeline))
print(len(rows), rows[0])
df = pd.DataFrame(rows)
print(df.pivot_table(index="day", columns="restaurant", values="revenue",
                     aggfunc="sum", fill_value=0))</div>
  <div class="fx" data-lang="text">7 {'revenue': 450, 'day': '03-02', 'restaurant': 'Biryani Bros'}
restaurant  Biryani Bros  Dosa Hut  Pizza Point
day                                            
03-02                450       240          520
03-03                  0         0          380
03-04                180         0            0
03-05                600       260            0</div>
  <p>The pipeline returned 7 small rows (one per day and restaurant with delivered revenue). The <code>$project</code> stage is the important line for pandas: it flattens the compound <code>_id</code> into plain <code>day</code> and <code>restaurant</code> columns; without it every row would carry a nested dict. Days are computed in IST (<code>timezone</code>), so each order lands on its local date. The pivot fills missing combinations with 0: Dosa Hut sold nothing on 03-03 and 03-04.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Push-down</strong>: doing filtering and aggregation in the database so only the small result crosses the network. <code>collection.aggregate(pipeline)</code> returns a cursor; <code>list()</code> materialises it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: Python spelling</span>
    <p>Write <code>None</code> where mongosh writes <code>null</code> (<code>{"_id": None}</code>) and quote every <code>$</code> key. An unquoted <code>$match</code> is a Python syntax error; a misspelled stage (<code>"$mach"</code>) is a server error "Unrecognized pipeline stage name".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> Before the traps and the revision sheet, one picture of how the stages relate to each other and to SQL.</div>

  <h2 id="ma-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>$match, $group, $project, $sort, $unwind, $lookup, $facet, $bucket, windows, explain: a bag of operators, or one model?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 290" width="720">
<defs><marker id="ma-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<g font-size="10.5">
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="40" text-anchor="middle" font-weight="700">collection</text><text x="70" y="57" text-anchor="middle" class="tm">10 orders</text>
<line x1="130" y1="45" x2="148" y2="45" stroke="currentColor" marker-end="url(#ma-a9)"/>
<rect x="150" y="20" width="110" height="50" rx="8" class="fb sb"/><text x="205" y="40" text-anchor="middle" font-weight="700">$match</text><text x="205" y="57" text-anchor="middle" class="tm">7 · index here</text>
<line x1="260" y1="45" x2="278" y2="45" stroke="currentColor" marker-end="url(#ma-a9)"/>
<rect x="280" y="20" width="120" height="50" rx="8" class="ft st"/><text x="340" y="40" text-anchor="middle" font-weight="700">$unwind</text><text x="340" y="57" text-anchor="middle" class="tm">grain: order → line</text>
<line x1="400" y1="45" x2="418" y2="45" stroke="currentColor" marker-end="url(#ma-a9)"/>
<rect x="420" y="20" width="130" height="50" rx="8" class="fv sb"/><text x="485" y="40" text-anchor="middle" font-weight="700">$group</text><text x="485" y="57" text-anchor="middle" class="tm">grain: line → item</text>
<line x1="550" y1="45" x2="568" y2="45" stroke="currentColor" marker-end="url(#ma-a9)"/>
<rect x="570" y="20" width="140" height="50" rx="8" class="fg sg"/><text x="640" y="40" text-anchor="middle" font-weight="700">$sort / $limit</text><text x="640" y="57" text-anchor="middle" class="tm">present</text>
<rect x="150" y="105" width="250" height="46" rx="8" class="fb sb"/><text x="275" y="124" text-anchor="middle">$project / $addFields (anywhere)</text><text x="275" y="141" text-anchor="middle" class="tm">compute per document: $map, $cond, $hour</text>
<rect x="420" y="105" width="290" height="46" rx="8" class="fr sr"/><text x="565" y="124" text-anchor="middle">$lookup (+ $unwind)</text><text x="565" y="141" text-anchor="middle" class="tm">attach another collection: left join → inner join</text>
<line x1="485" y1="70" x2="485" y2="103" stroke="currentColor" stroke-dasharray="4 3"/>
<line x1="275" y1="70" x2="275" y2="103" stroke="currentColor" stroke-dasharray="4 3"/>
<rect x="150" y="175" width="250" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="275" y="194" text-anchor="middle">$facet · $bucket · $setWindowFields</text><text x="275" y="211" text-anchor="middle" class="tm">many groupings · ranges · keep rows</text>
<rect x="420" y="175" width="290" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="565" y="194" text-anchor="middle">SQL: WHERE · JOIN · GROUP BY · HAVING · ORDER BY</text><text x="565" y="211" text-anchor="middle" class="tm">same clauses, in execution order</text>
<text x="10" y="250" class="tm">One stream of documents. Every stage either filters it, changes its grain ($unwind up, $group down), computes fields, attaches data, or orders it.</text>
<text x="10" y="268" class="tm">Only the front of the line touches the collection, so only the front can use indexes. Every count bug is a grain mistake.</text>
</g>
</svg><figcaption>The pipeline is one stream; stages differ only in what they do to it. Grain (what one document means) is the thread that ties $unwind, $group and the counting traps together.</figcaption></figure>
  <table class="tbl"><caption>Every stage on the same Biteful orders</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>Use when</th></tr>
    <tr><td>Pipeline</td><td>array of stages</td><td>compute across documents in the database</td><td>delivered per customer: 2, 2, 2, 1</td><td>anything find can't do</td></tr>
    <tr><td>$match</td><td>find's filter</td><td>which documents enter?</td><td>10 → 7 delivered</td><td>first, to use indexes</td></tr>
    <tr><td>$group</td><td>key + accumulators</td><td>one answer per group</td><td>₹500 / ₹1,230 / ₹900; avg 38 skips null</td><td>per-X questions</td></tr>
    <tr><td>HAVING</td><td>$match after $group</td><td>filter on a computed total</td><td>revenue ≥ 900 → 11, 12</td><td>thresholds on groups</td></tr>
    <tr><td>$project / $addFields</td><td>expressions</td><td>values no field stores</td><td>10/10 bills = sum of lines; 12:10 IST = hour 6 UTC</td><td>computed fields, cleanup</td></tr>
    <tr><td>$sort / $limit / $first</td><td>ordering the stream</td><td>top-N, latest per group</td><td>top 2: Biryani Bros, Pizza Point; Asha's latest 110</td><td>rankings, "latest"</td></tr>
    <tr><td>$unwind</td><td>array → documents</td><td>work at the line grain</td><td>10 orders → 15 lines; Chicken Biryani ₹700</td><td>per-item questions</td></tr>
    <tr><td>$lookup</td><td>per-document search</td><td>bring in another collection</td><td>Gita: <code>[]</code>, 0 orders; inner = 10 rows, left = 11</td><td>names, reference data</td></tr>
    <tr><td>$facet / $bucket / windows</td><td>sub-pipelines, ranges, partitions</td><td>many views, bands, running totals</td><td>2 / 5 / 3 by band; Chen 520 → 780</td><td>dashboards, histograms</td></tr>
    <tr><td>SQL mapping</td><td>logical execution order</td><td>translate a SQL query</td><td>Biryani 1230, Pizza 900, South Indian 500</td><td>every translation</td></tr>
    <tr><td>Indexes / explain</td><td>B-tree on the first stage</td><td>why fast or slow?</td><td>200,000 → 20,000 docs read</td><td>every production pipeline</td></tr>
    <tr><td>allowDiskUse</td><td>memory limit per blocking stage</td><td>what if a sort/group is too big?</td><td>10 MB limit: error vs <code>usedDisk: true</code></td><td>big sorts and groups</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a pipeline is one stream of documents, and every stage either filters it, changes its grain, computes on it, attaches to it, or orders it.</strong> <code>$unwind</code> makes the grain finer (order → line), <code>$group</code> makes it coarser (line → item). Every wrong count in this note (Asha's 5 "orders", 1,620 instead of 930, grouping by arrays) is a grain mistake, the same one the SQL notes called fan-out.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Which slips produce numbers that look fine?</div>

  <h2 id="ma-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Aggregation mistakes rarely crash. They produce a number that looks fine. Which ones should you check whenever a result surprises you?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no $match, or $match in the wrong place</span>
    <p>Forgetting <code>{ status: "delivered" }</code> turns ₹2,630 into ₹3,510. A <code>$match</code> on a raw field after <code>$group</code> matches nothing, because the field is gone.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: grouping by an array field</span>
    <p>Without <code>$unwind</code>, <code>_id: "$items.item"</code> grouped by whole arrays such as <code>['Masala Dosa', 'Filter Coffee']</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: counting or summing at the wrong grain after $unwind</span>
    <p><code>$sum: 1</code> counted Asha's 5 lines, not 3 orders; summing <code>amount</code> after unwinding repeats each bill per line.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: losing documents in $unwind or $lookup + $unwind</span>
    <p>Empty arrays vanish (order 111: 16 → 15); Gita vanished after <code>$lookup</code> + <code>$unwind</code>. Use <code>preserveNullAndEmptyArrays: true</code> when they must stay.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: $project when you meant $addFields</span>
    <p>One computed field in <code>$project</code> dropped every other field of order 102.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: $ vs $$, and text numbers</span>
    <p><code>"status"</code> is text, <code>"$status"</code> a field, <code>"$$l"</code> a variable. <code>$sum</code> silently skipped <code>"450"</code>: 760 instead of 1,210.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: UTC hours and days</span>
    <p>12:10 IST is hour 6 in UTC. Pass <code>timezone: "Asia/Kolkata"</code> to <code>$hour</code>, <code>$dateToString</code>, <code>$dateTrunc</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: $first/$last without $sort, and no final $sort</span>
    <p>Both give arbitrary results. Sort first, and sort the output.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="ma-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Biteful documents. <code>orders</code> (10): 101–110, amounts 240, 450, 520, 380, 310, 180, 260, 260, 600, 310; restaurants 10 (101, 108, 110), 11 (102, 106, 109), 12 (103, 104, 107), 13 (105); 105 and 107 cancelled, 110 pending; 15 embedded lines; 104's delivery time null. <code>customers</code> (7, Gita has no orders), <code>restaurants</code> (5, Momo Magic has no orders).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Pipeline</td><td>compute across documents</td><td>delivered per customer 2/2/2/1</td><td>which docs? → $match</td></tr>
    <tr><td>$match</td><td>keep the right documents</td><td>10 → 7</td><td>still one per order → $group</td></tr>
    <tr><td>$group</td><td>one answer per group</td><td>500 / 1230 / 900; avg 38</td><td>values not stored → $project</td></tr>
    <tr><td>$project / $addFields</td><td>compute new fields</td><td>bills = sum of lines (10/10)</td><td>unordered → $sort</td></tr>
    <tr><td>$sort / $limit</td><td>top-N, latest per group</td><td>Biryani Bros, Pizza Point</td><td>items in arrays → $unwind</td></tr>
    <tr><td>$unwind</td><td>work per array element</td><td>10 → 15 lines; Biryani ₹700</td><td>names elsewhere → $lookup</td></tr>
    <tr><td>$lookup</td><td>join another collection</td><td>Gita [] / 0; 11 vs 10 rows</td><td>many views → $facet etc.</td></tr>
    <tr><td>$facet / $bucket / windows</td><td>several summaries, bands, running totals</td><td>2/5/3; Chen 520 → 780</td><td>translate SQL → mapping</td></tr>
    <tr><td>SQL mapping</td><td>SQL clause → stage</td><td>per cuisine = Postgres</td><td>slow at scale? → performance</td></tr>
    <tr><td>Performance</td><td>fast vs slow</td><td>200,000 → 20,000 read; spill</td><td>→ <a class="xref" data-note="mongo_design">Schema Design</a></td></tr>
  </table>
  <h3>Definitions and syntax</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Syntax / meaning</th></tr>
    <tr><td>Pipeline</td><td><code>db.c.aggregate([ {stage}, {stage}, … ], { allowDiskUse })</code></td></tr>
    <tr><td>References</td><td><code>"$field"</code> value · <code>"$a.b"</code> nested / array of values · <code>"$$var"</code> variable · <code>"text"</code> literal</td></tr>
    <tr><td>$match</td><td>find filter; <code>$expr</code> for expressions</td></tr>
    <tr><td>$group</td><td><code>{ _id: key, f: { $sum | $avg | $min | $max | $push | $addToSet | $first | $last: expr } }</code>; <code>_id: null</code> = all; <code>$sum: 1</code> = count</td></tr>
    <tr><td>$project / $addFields</td><td>keep/compute only listed fields / add fields; <code>$map: { input, as, in }</code>, <code>$cond: [if, then, else]</code>, <code>$ifNull: [x, default]</code></td></tr>
    <tr><td>$sort / $limit / $skip / $count</td><td>order / cut / drop / count the stream</td></tr>
    <tr><td>$unwind</td><td><code>"$arr"</code> or <code>{ path, preserveNullAndEmptyArrays: true }</code></td></tr>
    <tr><td>$lookup</td><td><code>{ from, localField, foreignField, as }</code> (+ <code>pipeline</code>): left join into an array</td></tr>
    <tr><td>$facet / $bucket / $setWindowFields</td><td>sub-pipelines → 1 doc / ranges <code>[lo, hi)</code> / <code>{ partitionBy, sortBy, output: { f: { $sum, window } } }</code></td></tr>
    <tr><td>$out / $merge</td><td>write results (replace / upsert), last stage</td></tr>
    <tr><td>explain</td><td><code>db.c.explain("executionStats").aggregate(p)</code>: COLLSCAN vs IXSCAN, keys and docs examined</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>$match first</b><p>Always; it is the only place an index helps.</p><small>A $match on a computed field can't use one</small></div>
    <div><b>$unwind</b><p>Use for per-element questions (per item).</p><small>Count orders before it, or with $addToSet</small></div>
    <div><b>$lookup</b><p>Use for occasional joins and reports; group first.</p><small>Every page view? Embed or copy instead</small></div>
    <div><b>$group vs windows</b><p>$group collapses to one row per group.</p><small>$setWindowFields keeps every row</small></div>
    <div><b>$facet</b><p>Use for dashboard tiles from one input.</p><small>Output must fit 16 MB; no indexes inside</small></div>
    <div><b>Push-down</b><p>Aggregate in MongoDB, reshape in pandas.</p><small>Don't pull millions of docs into Python</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>No <code>$match</code> (₹3,510 vs ₹2,630); grouping by an array without <code>$unwind</code>; counting lines as orders (5 vs 3); summing an order field after <code>$unwind</code>; empty arrays and unmatched lookups vanish after <code>$unwind</code>; <code>$project</code> drops fields; fields gone after <code>$group</code>; <code>$</code> vs <code>$$</code>; <code>$sum</code> skips text; UTC hours; <code>$first</code> without <code>$sort</code>; testing performance on 10 documents.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td><code>[ { $unwind: "$items" }, { $count: "n" } ]</code> on Biteful?</td><td>15: lines, not orders</td></tr>
    <tr><td>Pizza Point's <code>$avg</code> of delivery_minutes, with 38 and null?</td><td>38: null is ignored</td></tr>
    <tr><td>How do you write HAVING?</td><td>A <code>$match</code> after <code>$group</code></td></tr>
    <tr><td>customers <code>$lookup</code> orders: is Gita in the output?</td><td>Yes, with <code>[]</code>; she disappears only after <code>$unwind</code></td></tr>
    <tr><td>Which stages can use an index?</td><td>Only the first ones that read the collection (<code>$match</code>, <code>$sort</code>)</td></tr>
  </table>

  <h2 id="ma-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you write each pipeline before revealing it, and say what the numbers are on Biteful? The last questions connect the stages to each other.</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When do you need <code>aggregate()</code> instead of <code>find()</code>?</summary><div class="qa-body">Whenever you compute across documents (counts or sums per group), compute fields beyond simple projection, flatten arrays, join collections, or use window functions. <code>find()</code> only filters, projects, sorts and pages.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>"status"</code>, <code>"$status"</code> and <code>"$$l"</code>?</summary><div class="qa-body"><code>"status"</code> is the literal text. <code>"$status"</code> is the value of the field in the current document. <code>"$$l"</code> is a variable, e.g. the loop variable named by <code>as: "l"</code> in <code>$map</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: number of orders per status, most common first.</summary><div class="qa-body"><code>[ { $group: { _id: "$status", n: { $sum: 1 } } }, { $sort: { n: -1, _id: 1 } } ]</code> → delivered 7, cancelled 2, pending 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: revenue per restaurant from delivered orders, only restaurants with at least ₹900.</summary><div class="qa-body"><code>[ { $match: { status: "delivered" } }, { $group: { _id: "$restaurant_id", revenue: { $sum: "$amount" } } }, { $match: { revenue: { $gte: 900 } } } ]</code> → 11 (1230) and 12 (900). The second <code>$match</code> is HAVING.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Pizza Point has delivered orders with 38 minutes and an unrecorded time. What does <code>$avg: "$delivery_minutes"</code> give, and what would SQL give?</summary><div class="qa-body">38 in both: <code>$avg</code> ignores null and missing values like SQL's <code>AVG</code> ignores NULL. If you wanted unrecorded times to count as 0 you would need <code>$ifNull</code> first (giving 19), which is usually wrong.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: quantity sold per item over delivered orders.</summary><div class="qa-body"><code>[ { $match: { status: "delivered" } }, { $unwind: "$items" }, { $group: { _id: "$items.item", qty: { $sum: "$items.qty" } } }, { $sort: { qty: -1, _id: 1 } } ]</code>. Masala Dosa 3, Chicken Biryani 2, Farmhouse Pizza 2, Filter Coffee 2, Raita 2, then the 1s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output of <code>[ { $match: { customer_id: 1 } }, { $unwind: "$items" }, { $group: { _id: "$customer_id", n: { $sum: 1 } } } ]</code>?</summary><div class="qa-body"><code>{ _id: 1, n: 5 }</code>: Asha's 5 lines, not her 3 orders. Count orders with <code>$addToSet: "$_id"</code> and <code>$size</code>, or before unwinding.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A pipeline groups by <code>"$items.item"</code> without <code>$unwind</code>. What goes wrong?</summary><div class="qa-body"><code>"$items.item"</code> is an array per order, e.g. <code>['Masala Dosa', 'Filter Coffee']</code> for 108 and 110, so groups form per distinct array. No error, wrong numbers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the pipeline: each customer's name and number of orders, including customers with none.</summary><div class="qa-body">On <code>customers</code>: <code>[ { $lookup: { from: "orders", localField: "_id", foreignField: "customer_id", as: "o" } }, { $project: { name: 1, n: { $size: "$o" } } } ]</code>. Gita appears with 0. Don't <code>$unwind</code> the array, or Gita disappears (10 rows instead of 11).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Translate: <code>SELECT r.cuisine, SUM(o.amount) FROM orders o JOIN restaurants r … WHERE o.status = 'delivered' GROUP BY r.cuisine HAVING SUM(o.amount) &gt;= 500 ORDER BY 2 DESC</code>.</summary><div class="qa-body"><code>$match</code> (status) → <code>$lookup</code> restaurants as <code>r</code> → <code>$unwind: "$r"</code> → <code>$group: { _id: "$r.cuisine", revenue: { $sum: "$amount" } }</code> → <code>$match: { revenue: { $gte: 500 } }</code> → <code>$sort: { revenue: -1 }</code>. Biryani 1230, Pizza 900, South Indian 500, identical to PostgreSQL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should <code>$match</code> come first?</summary><div class="qa-body">(1) Only the stage reading the collection can use an index: 20,000 documents read instead of 200,000 on <code>biteful_big</code>. (2) It shrinks the stream, so later stages (and their memory limits) handle less. The optimizer moves some late <code>$match</code>es forward but not ones on computed fields.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A <code>$sort</code> fails with "exceeded memory limit". Options?</summary><div class="qa-body">Allow spilling (<code>allowDiskUse: true</code>, default since 6.0; slower), filter and project earlier, use an index whose order matches the sort so no in-memory sort is needed, add <code>$limit</code> right after <code>$sort</code> (top-k keeps only k), or pre-aggregate into a summary collection with <code>$merge</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>$group</code> vs <code>$setWindowFields</code>?</summary><div class="qa-body"><code>$group</code> collapses each group to one document (spend per customer: Chen 780). <code>$setWindowFields</code> keeps every document and adds a value over its partition (Chen's orders show 520, then 780). Same difference as SQL GROUP BY vs OVER().</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does <code>$unwind</code> reproduce SQL's fan-out bug?</summary><div class="qa-body">Both change the grain from order to line by repeating the order's fields on every line: SQL by joining <code>order_items</code>, MongoDB by unwinding <code>items</code>. Any order-level value (count of orders, <code>amount</code>) is then repeated per line, so Asha's orders count as 5 and her spend as 1,620. Fix in both worlds: aggregate order values before changing the grain, line values after.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the order of <code>$match</code> and <code>$group</code> decide whether a filter is WHERE or HAVING?</summary><div class="qa-body">Before <code>$group</code>, documents are orders, so <code>$match</code> filters orders (WHERE). After <code>$group</code>, documents are group results with only <code>_id</code> and accumulators, so <code>$match</code> can only filter on those (HAVING). A pipeline has no separate keywords; position is meaning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does schema design have to do with how long a pipeline is?</summary><div class="qa-body">Lines are embedded, so per-order questions need no join and per-item questions need one <code>$unwind</code>. Customers are referenced, so every name needs a <code>$lookup</code>. Copy the customer name into each order and that <code>$lookup</code> disappears; keep a running daily total and the whole pipeline becomes one read. Deciding those trade-offs is <a class="xref" data-note="mongo_design">Schema Design</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip <code>$sort</code> before <code>$group</code> with <code>$first</code>?</summary><div class="qa-body"><code>$first</code> takes the first document that entered each bin, in stream order. Without a sort that order is whatever the server read first, so "Asha's latest order" could come out as 101 instead of 110, and change between runs.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="mongo_design">Schema Design &amp; Scaling</a>.</b> Every pipeline here ran on a shape we were given: lines embedded, customers referenced. Was that the right shape? When should data be embedded, when referenced, which patterns remove <code>$lookup</code>s, which indexes make <code>$match</code> fast, and how does it all scale past one server?</div>
</main>
`
});
