// notes/databases/mongo_aggregation.js — Aggregation Pipeline
Object.assign(TOPIC_CONTENT, {
  "mongo_aggregation": `<main>
  <h1>Aggregation Pipeline</h1>
  <div class="where"><span>Databases</span><span>MongoDB</span><span>Aggregation Pipeline</span></div>
  <p class="lead">The <strong>aggregation pipeline</strong> is MongoDB's tool for computing answers across many documents: totals per restaurant, quantities per item, averages, rankings, and joins with other collections. <code>find</code>, from <a class="xref" data-note="mongo_basics">Documents &amp; CRUD</a>, can only pick documents and fields; the pipeline transforms them, step by step, inside the database, so that only the small answer travels to your application. It is what reports, dashboards and analytics on MongoDB are built from, and it is MongoDB's counterpart to SQL's <code>GROUP BY</code> and <code>JOIN</code>. The running example is the same Biteful data as before (7 customers, 5 restaurants and 10 orders, each order embedding its lines, 15 lines in all), and the note builds the pipeline one stage at a time, each stage added because the previous ones cannot answer the next question. As in the previous note, commands are written in mongosh syntax and their outputs come from running the equivalent pymongo code against <strong>mongomock</strong>, an in-memory stand-in for a MongoDB server; SQL comparisons ran on a real PostgreSQL 16 database.</p>

  <h2 id="ma-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Aggregation Pipeline</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>An array of stages; each stage's output feeds the next</li>
          <li><code>"$field"</code> = a value, <code>"$$var"</code> = a variable</li>
          <li>No <code>$sort</code> at the end = no promised order</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Core stages</div>
        <ul>
          <li><code>$match</code> filters (put it first)</li>
          <li><code>$group</code>: <code>_id</code> = key, accumulators fold each group</li>
          <li><code>$project</code> keeps listed fields; <code>$addFields</code> adds</li>
          <li><code>$sort</code>, <code>$limit</code>; <code>$first</code> needs a sort before it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Arrays and joins</div>
        <ul>
          <li><code>$unwind</code>: one order → one document per line</li>
          <li>Count after unwinding counts lines, not orders</li>
          <li><code>$lookup</code>: left join into an array</li>
          <li><code>$lookup</code> + <code>$unwind</code> = inner join</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Beyond and performance</div>
        <ul>
          <li><code>$facet</code>, <code>$bucket</code>, <code>$setWindowFields</code></li>
          <li>Only the first stages can use an index</li>
          <li>Blocking stages (<code>$sort</code>, <code>$group</code>) have a memory limit</li>
          <li>Aggregate in MongoDB, reshape in pandas</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ma-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why find Is Not Enough</span><span class="rm-sub">the pipeline as an assembly line</span></div></div>
      <div class="rm-item rm-done" data-target="ma-match"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">$match</span><span class="rm-sub">choosing which documents enter</span></div></div>
      <div class="rm-item rm-done" data-target="ma-group"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">$group and Accumulators</span><span class="rm-sub">one answer per group, traced by hand</span></div></div>
      <div class="rm-item rm-done" data-target="ma-shape"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">$project and $addFields</span><span class="rm-sub">computing values no field stores</span></div></div>
      <div class="rm-item rm-done" data-target="ma-sort"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">$sort, $limit and $first</span><span class="rm-sub">top-N and "latest per customer"</span></div></div>
      <div class="rm-item rm-done" data-target="ma-unwind"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">$unwind</span><span class="rm-sub">one order becomes one document per line</span></div></div>
      <div class="rm-item rm-done" data-target="ma-lookup"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">$lookup</span><span class="rm-sub">joining another collection</span></div></div>
      <div class="rm-item rm-done" data-target="ma-facet"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">$facet, $bucket and Windows</span><span class="rm-sub">several summaries, bands, running totals</span></div></div>
      <div class="rm-item rm-done" data-target="ma-sql"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Translating SQL into a Pipeline</span><span class="rm-sub">clause by clause, in execution order</span></div></div>
      <div class="rm-item rm-done" data-target="ma-perf"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Pipeline Performance</span><span class="rm-sub">indexes, stage order, memory limits</span></div></div>
      <div class="rm-item rm-done" data-target="ma-py"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Pipelines from Python</span><span class="rm-sub">from pipeline to pandas</span></div></div>
      <div class="rm-item rm-done" data-target="ma-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">wrong numbers, no errors</span></div></div>
      <div class="rm-item rm-done" data-target="ma-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">stages, accumulators, SQL mapping</span></div></div>
      <div class="rm-item rm-done" data-target="ma-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about aggregation</span></div></div>
    </div>
  </div>

  <h2 id="ma-idea"><span class="num">01</span>Why find Is Not Enough</h2>
  <p>Biteful's owner asks a simple business question: how much revenue did each restaurant make from delivered orders? With <code>find</code> we can fetch the delivered orders and the two fields we care about:</p>
  <div class="fx" data-lang="mongo">db.orders.find({ status: "delivered" }, { restaurant_id: 1, amount: 1 })</div>
  <div class="fx" data-lang="text">[
  { _id: 101, restaurant_id: 10, amount: 240 },
  { _id: 102, restaurant_id: 11, amount: 450 },
  { _id: 103, restaurant_id: 12, amount: 520 },
  { _id: 104, restaurant_id: 12, amount: 380 },
  { _id: 106, restaurant_id: 11, amount: 180 },
  { _id: 108, restaurant_id: 10, amount: 260 },
  { _id: 109, restaurant_id: 11, amount: 600 }
]</div>
  <p>That gives seven documents, one per order, but the answer is still several steps away. Orders 101 and 108 belong to restaurant 10 and must be added (240 + 260); the same has to be done for restaurants 11 and 12; and the restaurant names live in a different collection. <code>find</code> can do none of that, because it can only choose documents and fields, never combine them. Pulling all the orders into Python and adding them there works for 10 orders. For 10 million it means shipping gigabytes over the network to compute three numbers that the database could have computed where the data already sits.</p>
  <p>The <strong>aggregation pipeline</strong> lets the database do that work. You write an array of <strong>stages</strong>, and each stage does one small job: filter documents, group them, reshape them, sort them, or join them with another collection. Documents flow into the first stage, its output becomes the input of the second, and whatever leaves the last stage is the answer. Here is a small but complete pipeline that counts delivered orders per customer:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
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
  <p>Follow the documents through it. <code>$match</code> keeps the 7 delivered orders. <code>$group</code> then puts them into bins by <code>customer_id</code>: bin 1 receives orders 101 and 104, bin 2 receives 102 and 106, bin 3 receives 103 and 108, and bin 6 receives 109. Inside each bin, <code>$sum: 1</code> adds 1 per document, which is simply a count. Finally <code>$sort</code> puts the bins in a fixed order. Dia, Esha and Gita have no delivered orders, so they get no bin at all; a group only exists if at least one document lands in it.</p>
  <p>A good picture is a mango-packing line. The first worker throws out bruised mangoes; the second cuts crates open into single mangoes; the third sorts them into bins by variety and counts each bin; the fourth lines the bins up, biggest first. Each worker sees only what the previous worker hands over, never the original truck, and the order of the workers matters. A pipeline works the same way, and the figure shows one with the real document counts for a question we will answer in section 06, revenue per item.</p>
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
    <text x="0" y="132" font-size="10" class="tm">The stream shrinks at $match, grows at $unwind, shrinks again at $group. Only the first stage reads the collection itself.</text>
  </svg><figcaption>A pipeline is a stream of documents through stations; the counts under each station are how many documents leave it.</figcaption></figure>
  <p>Notice how the number of documents changes as they move: 10 orders enter, 7 survive the filter, they turn into 11 line documents at <code>$unwind</code>, collapse into 9 item groups at <code>$group</code>, and the last stage keeps 4. Keeping track of "what does one document mean at this point?" is the key skill in writing pipelines, and we will come back to it.</p>
  <p>One piece of notation is used everywhere inside stages. A string that starts with a dollar sign, such as <code>"$status"</code>, is a <strong>field path</strong>: it means "the value of the <code>status</code> field in the current document". Through an array, <code>"$items.item"</code> gives the list of all item names. A plain string is just text, and if you ever need a literal string that starts with <code>$</code>, or want to make "this is text" explicit, <code>$literal</code> says so:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { _id: 108 } },
  { $project: { a: { $literal: "status" }, b: "$status", c: "$items.item" } }
])</div>
  <div class="fx" data-lang="text">[
  {
    _id: 108,
    a: 'status',
    b: 'delivered',
    c: [ 'Masala Dosa', 'Filter Coffee' ]
  }
]</div>
  <p>For order 108, <code>a</code> is the word "status", <code>b</code> is the value of the status field ("delivered"), and <code>c</code> is the array of the order's two item names. One more rule before we start: without a <code>$sort</code> stage, the order of a pipeline's output is not guaranteed. A report that "always came out in order" during testing can come out shuffled in production, which is why every pipeline in this note ends with a sort.</p>

  <h2 id="ma-match"><span class="num">02</span>$match</h2>
  <p>Revenue should count delivered orders only; including the cancelled orders 105 and 107 and the pending order 110 would inflate it. The first job of almost every pipeline is therefore to decide which documents enter at all. <strong>$match</strong> keeps the documents that satisfy a filter and drops the rest, and the filter is written in exactly the same language as <code>find</code>: equality, <code>$in</code>, <code>$ne</code>, dot notation into arrays, <code>$elemMatch</code>, all of it. Think of the gatekeeper at a wedding hall checking invitations: whoever gets past him is fed, whoever does not never reaches the kitchen, and checking at the gate is far cheaper than checking guests after dinner.</p>
  <p>A small helper stage, <code>$count: "name"</code>, replaces the whole stream with a single document holding the number of documents that reached it, which makes it handy for checking what each step lets through:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([ { $match: { status: "delivered" } }, { $count: "delivered" } ])
db.orders.aggregate([ { $match: { "items.item": "Masala Dosa", status: { $ne: "cancelled" } } }, { $count: "n" } ])
db.orders.aggregate([ { $match: { $expr: { $gt: ["$amount", 400] } } }, { $count: "over_400" } ])</div>
  <div class="fx" data-lang="text">[ { delivered: 7 } ]
[ { n: 3 } ]
[ { over_400: 3 } ]</div>
  <p>Seven orders were delivered. Three orders that were not cancelled contain a Masala Dosa (101, 108 and 110). The third pipeline shows <code>$expr</code>, which lets a <code>$match</code> use aggregation expressions instead of query operators; here it computes <code>amount &gt; 400</code>, which is true for orders 102, 103 and 109. You rarely need <code>$expr</code> for a simple comparison like this one, but it is essential when one field must be compared with another field of the same document, such as <code>{ $expr: { $gt: ["$delivery_minutes", "$promised_minutes"] } }</code>.</p>
  <p>Forgetting the <code>$match</code> does not cause an error; it silently changes the business answer:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([ { $group: { _id: null, revenue: { $sum: "$amount" } } } ])
db.orders.aggregate([ { $match: { status: "delivered" } },
                      { $group: { _id: null, revenue: { $sum: "$amount" } } } ])</div>
  <div class="fx" data-lang="text">[ { _id: null, revenue: 3510 } ]
[ { _id: null, revenue: 2630 } ]</div>
  <p>Without the filter, "revenue" is ₹3,510; with it, ₹2,630. Both pipelines run without complaint, which is exactly why the decision about which orders count has to be made consciously, before writing the first stage. (These two pipelines also show a convenient trick for <code>$group</code>, explained next: an <code>_id</code> of <code>null</code> puts every document into one single group, giving a grand total.)</p>

  <h2 id="ma-group"><span class="num">03</span>$group and Accumulators</h2>
  <p>"Revenue per restaurant" is a <em>per-something</em> question, and in SQL it would be <code>GROUP BY restaurant_id</code> with <code>SUM(amount)</code>. The stage that turns seven order documents into three restaurant summaries is <strong>$group</strong>. It needs an <code>_id</code>, which is the <strong>group key</strong>: the value to group by. All documents with the same key value land in the same bin. Every other field you write in the stage must be an <strong>accumulator</strong>, a rule for folding the many values in one bin into a single value, such as a sum, an average or a maximum.</p>
  <p>Picture a teacher sorting answer sheets into piles by section, A, B and C; the section is the key. For each pile she writes a sticky note: the number of sheets, the total marks, the highest mark, the list of roll numbers. Then only the sticky notes go forward; the sheets themselves do not. Here is that work done by hand first, on the seven delivered orders grouped by <code>restaurant_id</code>:</p>
  <table class="tbl">
    <tr><th>key (_id)</th><th>orders in the bin</th><th>$sum: 1</th><th>$sum: "$amount"</th><th>$avg: "$delivery_minutes"</th><th>$max: "$amount"</th></tr>
    <tr><td>10 Dosa Hut</td><td>101 (240, 32 min), 108 (260, 29)</td><td>2</td><td>240 + 260 = 500</td><td>(32 + 29) / 2 = 30.5</td><td>260</td></tr>
    <tr><td>11 Biryani Bros</td><td>102 (450, 41), 106 (180, 25), 109 (600, 52)</td><td>3</td><td>450 + 180 + 600 = 1230</td><td>(41 + 25 + 52) / 3 = 39.33…</td><td>600</td></tr>
    <tr><td>12 Pizza Point</td><td>103 (520, 38), 104 (380, <strong>null</strong>)</td><td>2</td><td>520 + 380 = 900</td><td>38 / 1 = 38 (null skipped)</td><td>520</td></tr>
  </table>
  <p>And the real pipeline, with one extra accumulator, <code>$push</code>, which collects every value in the bin into an array:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
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
  <p>Every number matches the hand trace. Look closely at Pizza Point's <code>avg_minutes: 38</code>. Order 104's delivery time is null, and <code>$avg</code> ignores null and missing values, so the average is taken over order 103 alone, exactly as SQL's <code>AVG</code> ignores NULL. The same question in PostgreSQL gives the same counts, sums, averages and maxima:</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, COUNT(*) AS orders, SUM(amount) AS revenue,
       ROUND(AVG(delivery_minutes), 2) AS avg_minutes, MAX(amount) AS biggest
FROM orders WHERE status = 'delivered'
GROUP BY restaurant_id ORDER BY restaurant_id;</div>
  <div class="fx" data-lang="text"> restaurant_id | orders | revenue | avg_minutes | biggest 
---------------+--------+---------+-------------+---------
            10 |      2 |  500.00 |       30.50 |  260.00
            11 |      3 | 1230.00 |       39.33 |  600.00
            12 |      2 |  900.00 |       38.00 |  520.00
(3 rows)</div>
  <p>The common accumulators map neatly onto SQL's aggregate functions:</p>
  <table class="tbl">
    <tr><th>Accumulator</th><th>SQL cousin</th><th>Note</th></tr>
    <tr><td><code>$sum: 1</code></td><td><code>COUNT(*)</code></td><td>adds 1 per document</td></tr>
    <tr><td><code>$sum: "$x"</code></td><td><code>SUM(x)</code></td><td>values that are not numbers are skipped</td></tr>
    <tr><td><code>$avg $min $max</code></td><td><code>AVG MIN MAX</code></td><td>ignore null and missing values</td></tr>
    <tr><td><code>$push</code></td><td><code>ARRAY_AGG(x)</code></td><td>every value, duplicates kept</td></tr>
    <tr><td><code>$addToSet</code></td><td><code>ARRAY_AGG(DISTINCT x)</code></td><td>unique values, in no promised order</td></tr>
    <tr><td><code>$first $last</code></td><td>—</td><td>meaningful only after a <code>$sort</code> (section 05)</td></tr>
  </table>
  <p>Two more patterns come up constantly. SQL's <code>HAVING</code>, a filter on the group results, needs no special keyword: it is simply a second <code>$match</code> placed <em>after</em> the <code>$group</code>, where the documents in the stream are now group summaries. And grouping by two fields at once uses an object as the key:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$restaurant_id", revenue: { $sum: "$amount" } } },
  { $match: { revenue: { $gte: 900 } } },                  // HAVING
  { $sort: { _id: 1 } } ])
db.orders.aggregate([
  { $group: { _id: { restaurant: "$restaurant_id", status: "$status" }, n: { $sum: 1 } } },
  { $sort: { "_id.restaurant": 1, "_id.status": 1 } } ])</div>
  <div class="fx" data-lang="text">[ { _id: 11, revenue: 1230 }, { _id: 12, revenue: 900 } ]
[
  { _id: { restaurant: 10, status: 'delivered' }, n: 2 },
  { _id: { restaurant: 10, status: 'pending' }, n: 1 },
  { _id: { restaurant: 11, status: 'delivered' }, n: 3 },
  { _id: { restaurant: 12, status: 'cancelled' }, n: 1 },
  { _id: { restaurant: 12, status: 'delivered' }, n: 2 },
  { _id: { restaurant: 13, status: 'cancelled' }, n: 1 }
]</div>
  <p>The second <code>$match</code> ran on the group summaries, so it could filter on the computed <code>revenue</code>: only Biryani Bros (1230) and Pizza Point (900) reach ₹900. The compound key in the second pipeline made one bin for every (restaurant, status) pair that actually occurs, six in all; Momo Magic (14) has no orders, so it has no bin. Note how the sort refers to the parts of the key with dot notation, <code>"_id.restaurant"</code>.</p>
  <p>Two traps belong to <code>$group</code>. The first is that after the stage, only <code>_id</code> and the accumulator fields exist. <code>status</code>, <code>items</code> and every other original field are gone, and the grouping field is now called <code>_id</code>, so a later stage that refers to <code>"$restaurant_id"</code> or filters on <code>status</code> silently finds nothing. The second is that <code>$sum</code> quietly skips values that are not numbers. On four scratch documents where one amount was stored as the text <code>"450"</code> (a common result of CSV imports) and one has no amount at all:</p>
  <div class="fx" data-lang="mongo">db.scratch.insertMany([ { _id: 1, amount: 240 }, { _id: 2, amount: "450" },
                        { _id: 3, amount: 520 }, { _id: 4, note: "no amount" } ])
db.scratch.aggregate([ { $group: { _id: null, n: { $sum: 1 },
                                   total: { $sum: "$amount" }, avg: { $avg: "$amount" } } } ])
db.scratch.drop()</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedIds: { '0': 1, '1': 2, '2': 3, '3': 4 } }
[ { _id: null, n: 4, total: 760, avg: 380 } ]
true</div>
  <p>All four documents were counted, but the total is 760, not 1,210: the text "450" was skipped without a word, and <code>$avg</code> averaged only the two real numbers. When numbers may have been stored as text, fix the data on load or convert inside the pipeline with <code>$toDouble</code> before summing.</p>

  <h2 id="ma-shape"><span class="num">04</span>$project and $addFields</h2>
  <p><code>$group</code> can only fold values that already exist in the documents. Many questions need values that no field stores: the total of each order line (quantity times unit price), the number of lines in an order, the hour of day in Indian time, or a label such as "lunch" or "dinner". Two stages compute new values. <strong>$addFields</strong> (also spelled <code>$set</code>) adds or overwrites fields and keeps everything else. <strong>$project</strong> chooses the output fields: it keeps, drops, renames or computes them, and any field you do not list is dropped (except <code>_id</code>). Inside both stages, values are computed with <strong>expressions</strong> such as <code>$multiply</code>, <code>$size</code>, <code>$cond</code> or <code>$hour</code>.</p>
  <p>The most useful expression for documents with embedded arrays is <code>$map</code>, which does something to every element of an array and returns the new array, like a <code>for</code> loop that builds a list. Think of filling in the "Total" column of a bill: go down the lines and multiply quantity by rate for each one. By hand for order 102, the lines are a biryani (1 × 350) and two raitas (2 × 50), so the line totals are [350, 100]:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { _id: { $in: [102, 108] } } },
  { $project: {
      line_totals: { $map: { input: "$items", as: "l",
                             in: { $multiply: ["$$l.qty", "$$l.unit_price"] } } },
      n_lines: { $size: "$items" },
      amount: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 102, amount: 450, line_totals: [ 350, 100 ], n_lines: 2 },
  { _id: 108, amount: 260, line_totals: [ 120, 140 ], n_lines: 2 }
]</div>
  <p>Inside <code>$map</code>, <code>input</code> is the array to walk over, <code>as: "l"</code> names the loop variable, and <code>in</code> is what to compute for each element. The loop variable is read with a <strong>double</strong> dollar, <code>"$$l.qty"</code>; a single dollar, <code>"$l.qty"</code>, would look for a field called <code>l</code> on the order itself, find nothing, and quietly produce wrong numbers. Order 102's line totals are [350, 100], order 108's are [120, 140], and <code>$size</code> counted two lines in each. (Adding the line totals up per order is easiest with <code>$unwind</code>, in section 06.)</p>
  <p>Three more expressions cover most everyday needs: a default for missing values, the hour of a date in a chosen time zone, and an if-then-else:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { _id: { $in: [101, 104, 105] } } },
  { $project: {
      minutes:  { $ifNull: ["$delivery_minutes", "not recorded"] },
      utc_hour: { $hour: "$ordered_at" },
      ist_hour: { $hour: { date: "$ordered_at", timezone: "Asia/Kolkata" } },
      meal: { $cond: [ { $lt: [ { $hour: { date: "$ordered_at", timezone: "Asia/Kolkata" } }, 16 ] },
                       "lunch", "dinner" ] } } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 101, minutes: 32, utc_hour: 6, ist_hour: 12, meal: 'lunch' },
  {
    _id: 104,
    minutes: 'not recorded',
    utc_hour: 7,
    ist_hour: 13,
    meal: 'lunch'
  },
  {
    _id: 105,
    minutes: 'not recorded',
    utc_hour: 14,
    ist_hour: 19,
    meal: 'dinner'
  }
]</div>
  <p><code>$ifNull</code> replaced order 104's null and order 105's missing delivery time with a label. The hour columns show why time zones matter in reports. Order 101 was placed at 12:10 in India, which is 06:40 UTC, and BSON stores UTC, so <code>$hour</code> without a time zone says 6; with <code>timezone: "Asia/Kolkata"</code> it says 12. Any report "by hour" or "by day" must pass the time zone, or late-evening orders will land on the wrong hour or even the wrong date. Finally, <code>$cond: [if, then, else]</code> labelled the orders as lunch or dinner using the Indian hour.</p>
  <p>The difference between the two stages is easy to forget, and forgetting it loses data:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([ { $match: { _id: 102 } }, { $project: { n_lines: { $size: "$items" } } } ])
db.orders.aggregate([ { $match: { _id: 102 } }, { $addFields: { n_lines: { $size: "$items" } } },
                      { $project: { items: 0 } } ])</div>
  <div class="fx" data-lang="text">[ { _id: 102, n_lines: 2 } ]
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
  <p><code>$project</code> with one computed field returned <em>only</em> <code>_id</code> and <code>n_lines</code>; every other field of order 102 disappeared. <code>$addFields</code> kept everything and added <code>n_lines</code> (the <code>items</code> array was hidden afterwards only to keep the print short). Use <code>$addFields</code> while building up intermediate values, and <code>$project</code> at the end to shape exactly what the application should receive.</p>

  <h2 id="ma-sort"><span class="num">05</span>$sort, $limit and $first</h2>
  <p>Many business questions are rankings. "Which two restaurants earned the most?" needs the group results ordered by revenue and cut to two. "What is each customer's latest order?" needs the orders arranged by date <em>before</em> grouping, so that the first one in each bin is the newest. <code>$sort</code>, <code>$limit</code> and <code>$skip</code> work like their <code>find</code> cousins, but as stages they can be placed anywhere in the pipeline: after a group, to rank the groups, or before one, so that <code>$first</code> and <code>$last</code> pick a meaningful document. In the teacher's terms: arrange the sticky notes by total and keep the top two; or, before making the piles, stack each student's sheets newest first, so the top sheet of each pile is the latest.</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: { _id: "$restaurant_id", revenue: { $sum: "$amount" } } },
  { $sort: { revenue: -1 } },
  { $limit: 2 }
])
db.orders.aggregate([
  { $sort: { ordered_at: -1 } },
  { $group: { _id: "$customer_id", latest_order: { $first: "$_id" },
              latest_status: { $first: "$status" } } },
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
  <p>The first pipeline grouped the delivered orders into three restaurants (500, 1230 and 900), sorted them by revenue from high to low, and kept two: Biryani Bros and Pizza Point. The second sorted <em>all</em> orders newest first and then grouped by customer. <code>$first</code> takes the value from the first document that entered each bin, which, after the sort, is the latest order: Asha's latest is the pending order 110, Dia's is the cancelled order 105. Without that <code>$sort</code>, <code>$first</code> would return whichever order the server happened to read first, and the answer could change from one run to the next.</p>
  <p>Position matters for these stages in a way that is easy to get wrong. A <code>$limit: 2</code> placed <em>before</em> the <code>$group</code> would group only the first two documents, which answers a completely different question from "the top two groups". And as with <code>find</code>, sorting on a value with ties (orders 107 and 108 both cost ₹260) needs a unique tie-breaker such as <code>_id</code> to give a stable order.</p>

  <h2 id="ma-unwind"><span class="num">06</span>$unwind</h2>
  <p>Every stage so far worked on whole orders. "Which items earn the most?" asks about order <em>lines</em>, and the lines live inside each order's <code>items</code> array; order 108 holds both a dosa and a coffee. <code>$group</code> needs one key per document, and a document can go into only one bin, so how can order 108 contribute to two different item bins? The answer is to split it first. <strong>$unwind</strong> takes an array field and outputs one document per element of the array; in each output document, the array field is replaced by that single element, and every other field (the order's <code>_id</code>, customer, status and so on) is copied unchanged. Think of photocopying a bill once per line and cutting each copy so it shows only one line; every slip still carries the bill number and the customer, so the slips can be sorted into trays by item.</p>
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
  </svg><figcaption>One output document per array element, with the parent's fields copied onto each; the same _id now appears twice.</figcaption></figure>
  <p>The figure shows order 102 being split; here is the real output, followed by a count of all the documents that <code>$unwind</code> produces from the whole collection:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([ { $match: { _id: 102 } }, { $unwind: "$items" },
                      { $project: { customer_id: 1, status: 1, items: 1 } } ])
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
  <p>Order 102 became two documents, both with <code>_id: 102</code>, and <code>items</code> is now a single object in each, so <code>"$items.item"</code> is one plain value instead of an array. Over all ten orders, the line counts are 1 + 2 + 1 + 2 + 1 + 1 + 1 + 2 + 2 + 2 = <strong>15</strong> documents, exactly the 15 rows of SQL's <code>order_items</code> table. <code>$unwind</code> is how the document world gets back to "one row per line". With it, revenue per item for delivered orders is a short pipeline:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
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
  <p>Chicken Biryani leads with 1 × 350 from order 102 plus 1 × 350 from order 109, ₹700. Masala Dosa earned 2 × 120 (order 101) + 1 × 120 (order 108) = ₹360; order 110's two dosas do not count, because 110 is still pending. In SQL the same answer needs a join from <code>orders</code> to <code>order_items</code>; in MongoDB the lines are already inside the orders and only need unwinding. The rows are identical:</p>
  <div class="fx" data-lang="sql">SELECT i.item, SUM(i.qty) AS qty, SUM(i.qty * i.unit_price) AS revenue
FROM orders o JOIN order_items i ON i.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY i.item ORDER BY revenue DESC, i.item LIMIT 4;</div>
  <div class="fx" data-lang="text">      item       | qty | revenue 
-----------------+-----+---------
 Chicken Biryani |   2 |  700.00
 Farmhouse Pizza |   2 |  520.00
 Masala Dosa     |   3 |  360.00
 Margherita      |   1 |  280.00
(4 rows)</div>
  <p>Unwinding followed by grouping on the order's own <code>_id</code> also lets us check a business rule that the SQL schema stated: every order's stored <code>amount</code> must equal the sum of its lines. After the unwind, each line document still carries its order's <code>_id</code> and <code>amount</code>, so grouping them back by <code>_id</code> rebuilds one result per order:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $unwind: "$items" },
  { $group: { _id: "$_id", amount: { $first: "$amount" },
              lines_total: { $sum: { $multiply: ["$items.qty", "$items.unit_price"] } } } },
  { $project: { amount: 1, lines_total: 1, ok: { $eq: ["$amount", "$lines_total"] } } },
  { $sort: { _id: 1 } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 101, amount: 240, lines_total: 240, ok: true },
  { _id: 102, amount: 450, lines_total: 450, ok: true },
  { _id: 103, amount: 520, lines_total: 520, ok: true },
  { _id: 104, amount: 380, lines_total: 380, ok: true },
  { _id: 105, amount: 310, lines_total: 310, ok: true },
  { _id: 106, amount: 180, lines_total: 180, ok: true },
  { _id: 107, amount: 260, lines_total: 260, ok: true },
  { _id: 108, amount: 260, lines_total: 260, ok: true },
  { _id: 109, amount: 600, lines_total: 600, ok: true },
  { _id: 110, amount: 310, lines_total: 310, ok: true }
]</div>
  <p>All ten stored bills equal the sum of their lines (<code>ok: true</code>). <code>$first: "$amount"</code> is safe here because every line document of one order carries the same amount.</p>
  <p>That last remark points to the most important idea in this note. The <strong>grain</strong> of the stream is what one document means at a given point: before <code>$unwind</code>, one document is an order; after it, one document is a line. Values that belong to the order, such as <code>amount</code>, are now repeated on every line of that order. Counting or summing them at the line grain gives wrong answers, with no error:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { customer_id: 1 } },
  { $unwind: "$items" },
  { $group: { _id: "$customer_id", docs: { $sum: 1 }, spend: { $sum: "$amount" },
              orders: { $addToSet: "$_id" } } },
  { $project: { docs: 1, spend: 1, n_orders: { $size: "$orders" } } }
])</div>
  <div class="fx" data-lang="text">[ { _id: 1, docs: 5, spend: 1620, n_orders: 3 } ]</div>
  <p>Asha has 3 orders (101, 104 and 110) but 5 lines, so <code>$sum: 1</code> after unwinding counted 5 "orders". Worse, summing <code>amount</code> added each order's bill once per line: 240 + 380 + 380 + 310 + 310 = ₹1,620, while her three orders actually total ₹930. This is the document version of the <a class="xref" data-note="sql_joins">join fan-out</a> problem from the SQL notes, where joining orders to their lines repeated each order's values on every line. The fixes are the same in both worlds: count or sum order-level values <em>before</em> changing the grain, or count distinct orders with <code>$addToSet: "$_id"</code> followed by <code>$size</code> (3, as above); and after unwinding, sum only line-level values such as quantity times unit price.</p>
  <p>Forgetting <code>$unwind</code> altogether also gives a wrong answer without an error. Without it, <code>"$items.item"</code> is an array per order, so <code>$group</code> groups by whole arrays:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([ { $group: { _id: "$items.item", n: { $sum: 1 } } },
                      { $sort: { n: -1 } }, { $limit: 3 } ])</div>
  <div class="fx" data-lang="text">[
  { _id: [ 'Farmhouse Pizza' ], n: 2 },
  { _id: [ 'Masala Dosa', 'Filter Coffee' ], n: 2 },
  { _id: [ 'Buddha Bowl' ], n: 1 }
]</div>
  <p>The keys are lists such as <code>[ 'Masala Dosa', 'Filter Coffee' ]</code> (orders 108 and 110), not item names, so the counts mean nothing useful. Finally, an edge case: an order whose <code>items</code> array is empty produces <em>no</em> documents at all from <code>$unwind</code>. A temporary order 111 with no lines shows it:</p>
  <div class="fx" data-lang="mongo">db.orders.insertOne({ _id: 111, customer_id: 4, restaurant_id: 13, status: "pending", amount: 0, items: [] })
db.orders.aggregate([ { $unwind: "$items" }, { $count: "n" } ])
db.orders.aggregate([ { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } }, { $count: "n" } ])
db.orders.deleteOne({ _id: 111 })</div>
  <div class="fx" data-lang="text">{ acknowledged: true, insertedId: 111 }
[ { n: 15 } ]
[ { n: 16 } ]
{ acknowledged: true, deletedCount: 1 }</div>
  <p>Plain <code>$unwind</code> produced 15 documents, so order 111 vanished, just as a row with no matches vanishes from an inner join. With the option <code>preserveNullAndEmptyArrays: true</code> the order is kept (16 documents), with no <code>items</code> field. Use that option whenever documents with empty or missing arrays must still appear in the result, for example "every order with its number of lines, including zero".</p>

  <h2 id="ma-lookup"><span class="num">07</span>$lookup</h2>
  <p>The reports so far print <code>customer_id: 3</code> and <code>restaurant_id: 11</code>, because orders only <em>reference</em> customers and restaurants; the names live in other collections. A report that shows each customer's name next to their number of orders needs data from two collections, and it must include Gita, who has never ordered. In SQL that is a <code>LEFT JOIN</code>. In a pipeline it is <strong>$lookup</strong>: for each incoming document, it searches another collection for matching documents and attaches them as an <strong>array field</strong>. You give it four things: <code>from</code> (the other collection), <code>localField</code> (the field in the incoming document), <code>foreignField</code> (the field in the other collection) and <code>as</code> (the name of the new array).</p>
  <p>Think of a clerk going through the customer register. For each customer she walks to the order cabinet, pulls every order slip with that customer's number, and staples them to the customer's page; a customer with no slips keeps their page, with nothing stapled to it. By hand for three customers:</p>
  <table class="tbl">
    <tr><th>customer (_id)</th><th>search orders where customer_id =</th><th>found</th><th>attached <code>orders</code> array</th></tr>
    <tr><td>Asha (1)</td><td>1</td><td>101, 104, 110</td><td>3 order documents</td></tr>
    <tr><td>Ben (2)</td><td>2</td><td>102, 106</td><td>2 order documents</td></tr>
    <tr><td>Gita (7)</td><td>7</td><td>none</td><td><code>[]</code>, and Gita is kept</td></tr>
  </table>
  <div class="fx" data-lang="mongo">db.customers.aggregate([
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
  <p><code>"$orders._id"</code> pulled just the ids out of the attached array, and <code>$size</code> counted them. Gita came through with an empty array and 0 orders, which makes <code>$lookup</code> a <strong>left outer join</strong>: every input document survives, matched or not. The SQL <code>LEFT JOIN</code> gives the same seven counts:</p>
  <div class="fx" data-lang="sql">SELECT c.name, COUNT(o.order_id) AS n_orders
FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name ORDER BY c.customer_id;</div>
  <div class="fx" data-lang="text"> name  | n_orders 
-------+----------
 Asha  |        3
 Ben   |        2
 Chen  |        2
 Dia   |        1
 Esha  |        1
 Farah |        1
 Gita  |        0
(7 rows)</div>
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
  <p>Where you place a <code>$lookup</code> matters, because it performs one search per incoming document. To show delivered spend per customer with names, it is cheaper to group first (four groups, so four lookups) than to look up a name for each of the seven orders and group afterwards:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
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
  <p>Chen spent 520 + 260 = ₹780, Ben 450 + 180 = ₹630, Asha 240 + 380 = ₹620 (order 110 is pending), and Farah ₹600. Because <code>$lookup</code> always returns an array, even when exactly one customer matches, the <code>$unwind: "$c"</code> turns that one-element array into a plain object so that <code>"$c.name"</code> reads the name directly.</p>
  <p>That <code>$unwind</code> has a side effect worth knowing: it changes the join from a left join to an inner join, because a document whose array is empty produces nothing when unwound:</p>
  <div class="fx" data-lang="mongo">db.customers.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "customer_id", as: "o" } },
  { $unwind: "$o" }, { $count: "rows" } ])
db.customers.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "customer_id", as: "o" } },
  { $unwind: { path: "$o", preserveNullAndEmptyArrays: true } }, { $count: "rows" } ])</div>
  <div class="fx" data-lang="text">[ { rows: 10 } ]
[ { rows: 11 } ]</div>
  <p>With a plain <code>$unwind</code> there are 10 rows, one per customer–order pair, and Gita has vanished; that is an <strong>inner join</strong>. With <code>preserveNullAndEmptyArrays: true</code> she comes back and there are 11 rows, the same as SQL's <code>LEFT JOIN</code> row count. Choose deliberately which one the report needs.</p>
  <p>Sometimes the joined side needs its own filter: for example, each restaurant with only its <em>delivered</em> orders. <code>$lookup</code> accepts a <code>pipeline</code> of stages to run on the matching documents (mongomock does not implement this form, so it is shown without output):</p>
  <div class="fx" data-lang="mongo">db.restaurants.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "restaurant_id",
               pipeline: [ { $match: { status: "delivered" } }, { $project: { _id: 1 } } ],
               as: "delivered" } },
  { $project: { _id: 0, name: 1, delivered: "$delivered._id" } }
])</div>
  <p>Each restaurant would receive only its delivered order ids: Dosa Hut [101, 108], Biryani Bros [102, 106, 109], Pizza Point [103, 104], while Green Bowl (whose only order was cancelled) and Momo Magic (no orders) would get empty arrays and still appear. Filtering inside the lookup keeps them, whereas a <code>$match</code> after an unwind would drop them; it is the same idea as putting a condition in SQL's <code>ON</code> clause instead of <code>WHERE</code>. One caution about <code>$lookup</code> in general: it runs a search per input document, so the <code>foreignField</code> should be indexed, and if the order page shows the customer's name on every view, copying the name into the order (the <em>extended reference</em> pattern in <a class="xref" data-note="mongo_design">Schema Design</a>) removes the join entirely.</p>

  <h2 id="ma-facet"><span class="num">08</span>$facet, $bucket and Windows</h2>
  <p>Three kinds of question are awkward with the stages so far. A dashboard wants several summaries of the same data at once: orders by status, the single biggest order and the total count. A histogram wants orders grouped into amount bands. And a "spend so far" column wants a running total next to every order, without collapsing the orders into groups. MongoDB has a stage for each.</p>
  <p><strong>$facet</strong> runs several sub-pipelines on the same input and returns one document holding all their results; think of one exam paper photocopied for three examiners who each mark a different section at the same time:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
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
  <p>Each key inside <code>$facet</code> is a small pipeline fed the same ten orders, and the output is a <strong>single</strong> document with each sub-result as an array. Because it is one document, all the results together must fit within the 16 MB document limit, so never put an unlimited list inside a facet without a <code>$limit</code>; and the sub-pipelines cannot use indexes, so any filter that applies to all of them should be a <code>$match</code> placed before the <code>$facet</code>.</p>
  <p><strong>$bucket</strong> groups documents by ranges of a value, like sorting parcels into weight bands. You give the boundaries, and each document falls into the band whose lower bound it reaches:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $bucket: { groupBy: "$amount", boundaries: [0, 250, 400, 1000], default: "other",
               output: { n: { $sum: 1 }, ids: { $push: "$_id" } } } }
])</div>
  <div class="fx" data-lang="text">[
  { _id: 0, n: 2, ids: [ 101, 106 ] },
  { _id: 250, n: 5, ids: [ 104, 105, 107, 108, 110 ] },
  { _id: 400, n: 3, ids: [ 102, 103, 109 ] }
]</div>
  <p>The amounts 240 and 180 fall in the band from 0 up to (but not including) 250; 380, 310, 260, 260 and 310 fall in [250, 400); and 450, 520 and 600 fall in [400, 1000). Each bucket's <code>_id</code> is its lower bound, which is included, while the upper bound is excluded; any value outside all the boundaries would go to the <code>default</code> bucket. (<code>$bucketAuto</code> chooses the boundaries for you, given a number of buckets.)</p>
  <p><strong>$setWindowFields</strong> is MongoDB's version of SQL's window functions (see <a class="xref" data-note="sql_windows">Window Functions</a>): it adds to every document a value computed over a "window" of related documents, without collapsing them the way <code>$group</code> does. A bank passbook's running-balance column is the picture: every row stays, and each row also shows the total so far. Here is a running spend per customer over delivered orders (mongomock does not implement this stage, so it is shown without output):</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $setWindowFields: {
      partitionBy: "$customer_id",
      sortBy: { ordered_at: 1 },
      output: { running_spend: { $sum: "$amount",
                                 window: { documents: ["unbounded", "current"] } } } } },
  { $project: { customer_id: 1, amount: 1, running_spend: 1 } }
])</div>
  <p>It reads like SQL's <code>SUM(amount) OVER (PARTITION BY customer_id ORDER BY ordered_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)</code>. <code>partitionBy</code> splits the documents into one partition per customer, <code>sortBy</code> orders each partition by time, and the window <code>["unbounded", "current"]</code> means "from the first document of the partition up to this one". Worked through by hand, all seven delivered orders survive, each with its running total:</p>
  <table class="tbl">
    <tr><th>customer</th><th>order (in time order)</th><th>amount</th><th>running_spend</th></tr>
    <tr><td>1 Asha</td><td>101, then 104</td><td>240, 380</td><td>240, 620</td></tr>
    <tr><td>2 Ben</td><td>102, then 106</td><td>450, 180</td><td>450, 630</td></tr>
    <tr><td>3 Chen</td><td>103, then 108</td><td>520, 260</td><td>520, 780</td></tr>
    <tr><td>6 Farah</td><td>109</td><td>600</td><td>600</td></tr>
  </table>
  <p>Compare this with <code>$group</code>, which would have produced four documents (Chen: 780). The window version keeps all seven orders and shows that Chen's spend went from 520 to 780. Window functions are the right tool for running totals, ranks within a group, and moving averages.</p>

  <h2 id="ma-sql"><span class="num">09</span>Translating SQL into a Pipeline</h2>
  <p>Every SQL clause from the SQL notes now has a matching stage, so a SQL query you already know can be translated mechanically. The one subtlety is order. A SQL query is <em>written</em> as <code>SELECT … FROM … WHERE … GROUP BY …</code> but <em>executed</em> in a different logical order: FROM and JOIN first, then WHERE, GROUP BY, HAVING, SELECT, ORDER BY and LIMIT (see <a class="xref" data-note="sql_fundamentals">SQL Fundamentals</a>). A pipeline has no such separation: it runs exactly in the order you write it. So translate SQL in its execution order. Ordering in a restaurant is like SQL, where you say what you want and the kitchen decides the steps; a pipeline is cooking from a recipe card yourself, step 1, step 2, step 3, which gives you more control and more ways to put a step in the wrong place.</p>
  <table class="tbl">
    <tr><th>SQL</th><th>Pipeline stage</th><th>Where it goes</th></tr>
    <tr><td><code>WHERE</code></td><td><code>$match</code></td><td>first</td></tr>
    <tr><td><code>JOIN</code> to a parent table</td><td><code>$lookup</code> + <code>$unwind</code></td><td>after the first <code>$match</code>, or after <code>$group</code> if only names are needed</td></tr>
    <tr><td><code>JOIN</code> to an embedded child</td><td><code>$unwind</code> of the array</td><td>after <code>$match</code></td></tr>
    <tr><td><code>LEFT JOIN</code></td><td><code>$lookup</code> alone, or <code>$unwind</code> with <code>preserveNullAndEmptyArrays</code></td><td>—</td></tr>
    <tr><td><code>GROUP BY</code> + aggregates</td><td><code>$group</code> with accumulators</td><td>after filters and unwinds</td></tr>
    <tr><td><code>HAVING</code></td><td><code>$match</code> after <code>$group</code></td><td>right after the group</td></tr>
    <tr><td><code>SELECT col, expr AS x</code></td><td><code>$project</code> / <code>$addFields</code></td><td>where the value is needed, often last</td></tr>
    <tr><td><code>ORDER BY</code> / <code>LIMIT</code> / <code>OFFSET</code></td><td><code>$sort</code> / <code>$limit</code> / <code>$skip</code></td><td>end</td></tr>
    <tr><td><code>OVER (…)</code> / <code>UNION ALL</code></td><td><code>$setWindowFields</code> / <code>$unionWith</code></td><td>—</td></tr>
    <tr><td><code>CREATE TABLE AS</code> / <code>INSERT … SELECT</code></td><td><code>$out</code> / <code>$merge</code></td><td>last stage</td></tr>
  </table>
  <p>Here is a full translation: revenue per cuisine from delivered orders, only cuisines with at least ₹500, biggest first. The SQL version runs on the SQL tables:</p>
  <div class="fx" data-lang="sql">SELECT r.cuisine, COUNT(*) AS orders, SUM(o.amount) AS revenue
FROM orders o
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
WHERE o.status = 'delivered'
GROUP BY r.cuisine
HAVING SUM(o.amount) &gt;= 500
ORDER BY revenue DESC;</div>
  <div class="fx" data-lang="text">   cuisine    | orders | revenue 
--------------+--------+---------
 Biryani      |      3 | 1230.00
 Pizza        |      2 |  900.00
 South Indian |      2 |  500.00
(3 rows)</div>
  <p>And the pipeline on the documents, with each stage labelled by the clause it replaces:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { status: "delivered" } },                                   // WHERE
  { $lookup: { from: "restaurants", localField: "restaurant_id",
               foreignField: "_id", as: "r" } },                         // JOIN
  { $unwind: "$r" },                                                     //   one restaurant per order
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
  <p>The rows are identical. Notice the order of the stages: the WHERE <code>$match</code> comes before the <code>$lookup</code>, so only 7 orders are joined instead of 10; the <code>$unwind</code> turns each one-restaurant array into an object; the HAVING <code>$match</code> sees group summaries; and the sort comes last. "Healthy" (Green Bowl) never appears, because its only order was cancelled. The two write stages in the table deserve a word: <code>$out</code> replaces a collection with the pipeline's result, and <code>$merge</code> inserts or updates the results into an existing collection, which is how incremental summary tables are maintained. Both must be the last stage.</p>
  <p>The classic translation mistake is writing the stages in SQL's <em>written</em> order: putting the <code>$project</code> (the SELECT) first, so later stages only see the projected fields, or putting a <code>$match</code> on a raw field such as <code>status</code> after the <code>$group</code>, where that field no longer exists and the match quietly returns nothing.</p>

  <h2 id="ma-perf"><span class="num">10</span>Pipeline Performance</h2>
  <p>On ten orders, every pipeline returns instantly whatever its shape. At real size, the same pipeline can read every document in the collection or only a tenth of them, and a sort can run out of memory. To see the effect of stage order, here is a larger copy of Biteful, <code>biteful_big</code>, with 20,000 orders of the same shape (two lines each, 10% cancelled, 5 restaurants, 5,000 customers):</p>
  <div class="fx" data-lang="mongo">use biteful_big
const statuses = ["delivered", "delivered", "delivered", "delivered", "delivered",
                  "delivered", "delivered", "delivered", "pending", "cancelled"]
const menu = [["Masala Dosa", 120], ["Chicken Biryani", 350], ["Farmhouse Pizza", 260],
              ["Buddha Bowl", 310], ["Momos", 150], ["Filter Coffee", 70]]
let docs = []
for (let i = 0; i &lt; 20000; i++) {
  const a = menu[i % 6], b = menu[(i * 7) % 6]
  docs.push({ _id: i, customer_id: i % 5000, restaurant_id: 10 + (Math.floor(i / 10) % 5),
              ordered_at: new Date(Date.UTC(2026, 0, 1) + (i % 90) * 86400000 + (i % 1440) * 60000),
              status: statuses[i % 10], amount: a[1] * (1 + i % 2) + b[1],
              items: [ { item: a[0], qty: 1 + i % 2, unit_price: a[1] },
                       { item: b[0], qty: 1, unit_price: b[1] } ] })
}
db.orders.insertMany(docs)
db.orders.countDocuments()
db.orders.countDocuments({ status: "cancelled" })</div>
  <div class="fx" data-lang="text">20000
2000</div>
  <p>Now consider "revenue lost to cancellations per restaurant". The <code>$count</code> stages below measure how many documents flow through each point of three variants:</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([ { $match: { status: "cancelled" } }, { $count: "after_match" } ])
db.orders.aggregate([ { $match: { status: "cancelled" } }, { $unwind: "$items" }, { $count: "after_unwind" } ])
db.orders.aggregate([ { $unwind: "$items" }, { $count: "unwind_first" } ])
db.orders.aggregate([ { $match: { status: "cancelled" } },
                      { $group: { _id: "$restaurant_id", lost: { $sum: "$amount" } } },
                      { $sort: { _id: 1 } } ])</div>
  <div class="fx" data-lang="text">[ { after_match: 2000 } ]
[ { after_unwind: 4000 } ]
[ { unwind_first: 40000 } ]
[
  { _id: 10, lost: 292200 },
  { _id: 11, lost: 292320 },
  { _id: 12, lost: 291480 },
  { _id: 13, lost: 292200 },
  { _id: 14, lost: 292320 }
]</div>
  <p>A <code>$match</code> placed first passes 2,000 documents to the next stage, and unwinding those produces 4,000 line documents. Placing the <code>$unwind</code> first would push all 40,000 lines through the pipeline before anything is filtered. The last pipeline gives the actual answer, the revenue lost per restaurant.</p>
  <p>Stage order matters for a deeper reason than the size of the stream: <strong>only the stages at the start of a pipeline, which read the collection itself, can use an index</strong>. An index is a sorted list of one field's values with pointers to the documents (a B-tree, the same structure as in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>), so with an index on <code>status</code>, a leading <code>$match: { status: "cancelled" }</code> can jump straight to the 2,000 cancelled orders instead of reading all 20,000. Think of finding every "cancelled" slip in a warehouse: without a register you walk every aisle (a <strong>collection scan</strong>); with one you open it at "cancelled" and go straight to those shelves. But the register helps only at the door; once slips are on your trolley, inside the pipeline, it is no use for re-sorting them. The way to check is <code>explain</code> (mongomock has no query planner, so this is shown without output):</p>
  <div class="fx" data-lang="mongo">db.orders.createIndex({ status: 1 })
db.orders.explain("executionStats").aggregate([
  { $match: { status: "cancelled" } },
  { $group: { _id: "$restaurant_id", lost: { $sum: "$amount" } } } ])</div>
  <p>On a real server, the plan for the first stage would show <code>COLLSCAN</code> (read every document, 20,000 examined) before the index exists, and <code>IXSCAN</code> (walk the index) followed by <code>FETCH</code> afterwards, with about 2,000 index keys and 2,000 documents examined. The numbers to compare in any explain output are "keys examined" and "documents examined" against "documents returned"; when they are far apart, the query is doing work it throws away.</p>
  <p>MongoDB's optimizer helps with some ordering mistakes but not all. It moves a <code>$match</code> on an original field in front of an <code>$unwind</code> or <code>$addFields</code> that does not affect that field, so a badly ordered pipeline can still use the index. It cannot move a <code>$match</code> on a <em>computed</em> field, because that field does not exist until the earlier stage has run; such a pipeline always reads every document. It also merges a <code>$sort</code> immediately followed by a <code>$limit</code> into a "top-k" sort that keeps only k documents in memory, instead of sorting everything. It never creates an index for you.</p>
  <p>The last performance limit is memory. <code>$sort</code> and <code>$group</code> are <strong>blocking stages</strong>: they must see all their input before they can emit anything, so they hold it in memory, and each such stage is limited to 100 MB by default. Past that limit, a stage either fails or, if allowed, <strong>spills</strong> to disk, writing sorted chunks to temporary files and merging them, which is correct but slower. The option is <code>allowDiskUse</code> (on by default since MongoDB 6.0); sorting all the orders by date to skip to the last few (on a collection large enough to pass the limit) is the kind of pipeline that can need it (shown without output):</p>
  <div class="fx" data-lang="mongo">db.orders.aggregate([ { $sort: { ordered_at: -1, _id: 1 } }, { $skip: 19990 } ],
                    { allowDiskUse: true })</div>
  <p>In practice the rules are short. Put <code>$match</code> (and any <code>$sort</code> that an index can serve) first. Remove fields you do not need early, so blocking stages hold less. Remember that <code>$unwind</code> multiplies documents: a million orders with five lines each become five million documents in the next stage. Treat <code>$lookup</code> as a search per document: index its <code>foreignField</code> and group before looking up when you can. And for results that are needed again and again, pre-aggregate them into a summary collection with <code>$merge</code>. Above all, run <code>explain</code> on realistic data, because on ten documents every plan looks fast.</p>

  <h2 id="ma-py"><span class="num">11</span>Pipelines from Python</h2>
  <p>Pipelines usually run from a script or a notebook, and the result often goes into pandas for a chart or a table. The right split of work is called <strong>push-down</strong>: let MongoDB reduce many documents to a small summary, then let pandas reshape and plot that summary. It is the difference between asking the warehouse for a one-page stock summary and having the whole warehouse shipped to your office so you can count it yourself. In pymongo, a pipeline is simply a Python list of dictionaries, with every operator as a quoted string. This one computes delivered revenue per day and restaurant:</p>
  <div class="fx" data-lang="py">import mongomock, pandas as pd

db = mongomock.MongoClient()["biteful"]      # real code: MongoClient(uri)["biteful"]
db.orders.insert_many(orders)                # the Biteful documents, as Python dicts
db.restaurants.insert_many(restaurants)

pipeline = [
    {"$match": {"status": "delivered"}},
    {"$lookup": {"from": "restaurants", "localField": "restaurant_id",
                 "foreignField": "_id", "as": "r"}},
    {"$unwind": "$r"},
    {"$group": {"_id": {"day": {"$dateToString": {"format": "%m-%d", "date": "$ordered_at"}},
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
  <p>The pipeline returned 7 small rows, one per day and restaurant with delivered revenue, and pandas pivoted them into a day-by-restaurant table, filling missing combinations with 0 (Dosa Hut sold nothing delivered on 3 and 4 March). The <code>$project</code> stage is the important line for pandas: it flattens the compound <code>_id</code> into plain <code>day</code> and <code>restaurant</code> columns, without which every row would carry a nested dictionary. One caution: this <code>$dateToString</code> works in UTC. For Biteful's orders, all placed between noon and 9:10 p.m. Indian time, the UTC date and the Indian date happen to be the same, but an order at 11 p.m. in India would land on the previous UTC date; on a real server you pass <code>timezone: "Asia/Kolkata"</code> to <code>$dateToString</code>, as with <code>$hour</code>. Two Python spellings also trip people up: write <code>None</code> where mongosh writes <code>null</code> (as in <code>{"_id": None}</code>), and quote every key that starts with <code>$</code>.</p>

  <h2 id="ma-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>Aggregation mistakes rarely crash; they produce a number that looks reasonable. The most common is a missing or misplaced <code>$match</code>. Leaving out the status filter turned ₹2,630 of delivered revenue into ₹3,510, and a <code>$match</code> on an original field placed after a <code>$group</code> matches nothing, because the field no longer exists:</p>
  <div class="fx" data-lang="mongo">// wrong: status no longer exists after $group → empty result
[ { $group: { _id: "$restaurant_id", revenue: { $sum: "$amount" } } },
  { $match: { status: "delivered" } } ]
// right: filter orders first, then group
[ { $match: { status: "delivered" } },
  { $group: { _id: "$restaurant_id", revenue: { $sum: "$amount" } } } ]</div>
  <p>The second family are grain mistakes around <code>$unwind</code>. Counting after unwinding counted Asha's 5 lines instead of her 3 orders, and summing <code>amount</code> after unwinding gave ₹1,620 instead of ₹930. Grouping by <code>"$items.item"</code> without unwinding grouped by whole arrays. And both a plain <code>$unwind</code> on empty arrays and <code>$lookup</code> followed by <code>$unwind</code> silently drop documents (order 111, and Gita); use <code>preserveNullAndEmptyArrays: true</code> when they must stay.</p>
  <div class="fx" data-lang="mongo">// wrong: counts lines (5) and repeats each bill per line (1,620)
[ { $match: { customer_id: 1 } }, { $unwind: "$items" },
  { $group: { _id: "$customer_id", orders: { $sum: 1 }, spend: { $sum: "$amount" } } } ]
// right: order-level values are summed before the grain changes (3 orders, 930)
[ { $match: { customer_id: 1 } },
  { $group: { _id: "$customer_id", orders: { $sum: 1 }, spend: { $sum: "$amount" } } } ]</div>
  <p>The third family are expression mistakes. <code>$project</code> with one computed field drops every other field, when <code>$addFields</code> was meant. Inside <code>$map</code>, a single dollar (<code>"$l.qty"</code>) reads a non-existent field instead of the loop variable (<code>"$$l.qty"</code>). <code>$sum</code> silently skips numbers stored as text (760 instead of 1,210). And hours and days computed without a time zone are UTC hours and days: 12:10 in India is hour 6.</p>
  <p>The last family are ordering mistakes: <code>$first</code> or <code>$last</code> without a <code>$sort</code> before the group return an arbitrary document, a pipeline without a final <code>$sort</code> has no guaranteed output order, and a <code>$limit</code> placed before a <code>$group</code> limits documents, not groups.</p>

  <h2 id="ma-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <p>Biteful <code>orders</code> (10): 101–110, amounts 240, 450, 520, 380, 310, 180, 260, 260, 600, 310; restaurant 10 has 101, 108, 110; 11 has 102, 106, 109; 12 has 103, 104, 107; 13 has 105. 105 and 107 cancelled, 110 pending, 104's delivery time null; 15 embedded lines. Delivered revenue: Dosa Hut 500, Biryani Bros 1,230, Pizza Point 900; total 2,630.</p>
  <h3>Definitions</h3>
  <ul>
    <li><b>Pipeline</b>: <code>db.c.aggregate([stage, …])</code>; each stage transforms the stream of documents from the previous one.</li>
    <li><b>Field path</b>: <code>"$field"</code> (a value), <code>"$a.b"</code> (nested, or an array of values); <b>variable</b>: <code>"$$name"</code>.</li>
    <li><b>Group key</b>: the <code>_id</code> of <code>$group</code>; <code>null</code> = one group. <b>Accumulator</b>: folds a group's values into one.</li>
    <li><b>Grain</b>: what one document means at a point in the pipeline (order before <code>$unwind</code>, line after).</li>
    <li><b>Blocking stage</b>: must consume all input before emitting (<code>$sort</code>, <code>$group</code>); 100 MB limit, <code>allowDiskUse</code> spills.</li>
    <li><b>Push-down</b>: aggregate in the database so only the small result crosses the network.</li>
  </ul>
  <h3>SQL to pipeline</h3>
  <table class="tbl">
    <tr><th>SQL</th><th>Stage</th></tr>
    <tr><td>WHERE</td><td><code>$match</code> (first)</td></tr>
    <tr><td>JOIN / LEFT JOIN</td><td><code>$lookup</code> (+ <code>$unwind</code> = inner join)</td></tr>
    <tr><td>join to an embedded child table</td><td><code>$unwind</code></td></tr>
    <tr><td>GROUP BY + COUNT/SUM/AVG/MIN/MAX</td><td><code>$group</code> with <code>$sum: 1</code>, <code>$sum</code>, <code>$avg</code>, <code>$min</code>, <code>$max</code></td></tr>
    <tr><td>HAVING</td><td><code>$match</code> after <code>$group</code></td></tr>
    <tr><td>SELECT expressions</td><td><code>$project</code> / <code>$addFields</code></td></tr>
    <tr><td>ORDER BY / LIMIT / OFFSET</td><td><code>$sort</code> / <code>$limit</code> / <code>$skip</code></td></tr>
    <tr><td>window function OVER()</td><td><code>$setWindowFields</code></td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="mongo">db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
  { $group: { _id: "$items.item", qty: { $sum: "$items.qty" },
              revenue: { $sum: { $multiply: ["$items.qty", "$items.unit_price"] } } } },
  { $match: { revenue: { $gte: 300 } } },                        // HAVING
  { $lookup: { from: "x", localField: "a", foreignField: "b", as: "joined" } },
  { $addFields: { n: { $size: "$joined" } } },
  { $project: { _id: 0, item: "$_id", revenue: 1 } },
  { $sort: { revenue: -1, item: 1 } }, { $limit: 5 }
])
// expressions: $map { input, as, in }  $cond [if, then, else]  $ifNull [x, default]
//              $hour { date, timezone }  $size  $multiply  $literal
// others: $count  $facet  $bucket  $setWindowFields  $out  $merge  $unionWith</div>
  <h3>Gotchas</h3>
  <ul>
    <li>No <code>$match</code> → wrong totals (3,510 vs 2,630); fields are gone after <code>$group</code>.</li>
    <li>After <code>$unwind</code>, count and sum at the line grain (5 lines ≠ 3 orders).</li>
    <li>Group by <code>"$items.item"</code> only after <code>$unwind</code>.</li>
    <li>Empty arrays and unmatched lookups vanish after <code>$unwind</code> unless preserved.</li>
    <li><code>$project</code> drops unlisted fields; <code>$$</code> for variables; <code>$sum</code> skips text.</li>
    <li>Pass a time zone to date expressions; sort before <code>$first</code> and at the end.</li>
    <li>Only the first stages use indexes; the optimizer cannot move a match on a computed field.</li>
  </ul>

  <h2 id="ma-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the aggregation pipeline, and when do you need it instead of <code>find</code>?</summary><div class="qa-body">It is an array of stages that MongoDB runs in order, each transforming the stream of documents from the previous stage, so that computation happens inside the database. You need it whenever you compute across documents (counts, sums or averages per group), compute new fields beyond a simple projection, flatten arrays, join collections, or use window functions. <code>find</code> can only filter, project, sort and page.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>"status"</code>, <code>"$status"</code> and <code>"$$l"</code> inside a stage?</summary><div class="qa-body"><code>"$status"</code> is a field path, the value of the <code>status</code> field in the current document. <code>"$$l"</code> is a variable, such as the loop variable named with <code>as: "l"</code> in <code>$map</code>, or a variable defined with <code>let</code>. A plain string is text; <code>$literal</code> makes text explicit, which matters when the text itself starts with a dollar sign.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you write SQL's <code>HAVING</code> in a pipeline?</summary><div class="qa-body">As a <code>$match</code> placed after the <code>$group</code>. At that point the documents in the stream are group summaries containing only <code>_id</code> and the accumulator fields, so the match filters on computed values such as <code>revenue</code>. The same <code>$match</code> placed before the group acts as <code>WHERE</code>; in a pipeline, position decides the meaning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>$group</code> output, and what happens to the other fields?</summary><div class="qa-body">One document per distinct value of the group key, containing only <code>_id</code> (the key) and the accumulator fields you defined. All other original fields are gone, and the grouped field is now called <code>_id</code>. If you need another field later, carry it through with an accumulator such as <code>$first</code>, or group by it as part of a compound key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do <code>$avg</code> and <code>$sum</code> treat null, missing and non-numeric values?</summary><div class="qa-body">Both ignore null and missing values, so an average is taken over the documents that have a number, like SQL's <code>AVG</code> ignoring NULL. <code>$sum</code> also skips values that are not numbers, including numbers stored as strings, without any error, so <code>"450"</code> silently drops out of a total. Convert types with <code>$toDouble</code> or <code>$toInt</code>, or fix the data on load.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>$project</code> and <code>$addFields</code>?</summary><div class="qa-body"><code>$addFields</code> (alias <code>$set</code>) adds or overwrites the listed fields and keeps every other field. <code>$project</code> defines the output shape: unlisted fields are dropped (except <code>_id</code>, unless excluded). A common bug is using <code>$project</code> to add one computed field and losing everything else.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>$unwind</code> do, and what is the grain problem?</summary><div class="qa-body"><code>$unwind</code> outputs one document per element of an array, copying the other fields onto each. This changes the grain from one document per order to one per line, so order-level values like <code>amount</code> are repeated per line: counting gives lines instead of orders and summing <code>amount</code> double-counts. It is the same fan-out problem as joining a parent table to a child table in SQL; aggregate order values before unwinding, and only line values after.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to documents with an empty array in <code>$unwind</code>?</summary><div class="qa-body">They produce no output documents, so they disappear from the pipeline, like unmatched rows in an inner join. The option <code>preserveNullAndEmptyArrays: true</code> keeps them (with the array field removed). The same applies to documents where the field is missing or null.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>$lookup</code> an inner join or a left join?</summary><div class="qa-body">A left outer join: every input document is kept and its matches are attached as an array, which is empty when nothing matches. Following it with <code>$unwind</code> drops the documents with empty arrays, which turns it into an inner join, unless <code>preserveNullAndEmptyArrays</code> is set. On Biteful, customers with orders unwound gives 10 rows, and preserving gives 11, including Gita.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you get each customer's latest order with a pipeline?</summary><div class="qa-body">Sort by date descending, then group by customer and take <code>$first</code> of the fields you need: <code>[{ $sort: { ordered_at: -1 } }, { $group: { _id: "$customer_id", latest: { $first: "$_id" } } }]</code>. <code>$first</code> takes the first document that entered each group in stream order, so without the sort the result is arbitrary. <code>$setWindowFields</code> with a rank, or <code>$top</code> in newer versions, are alternatives.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>$group</code> vs <code>$setWindowFields</code>?</summary><div class="qa-body"><code>$group</code> collapses each group into one document, for example total spend per customer. <code>$setWindowFields</code> keeps every document and adds a value computed over its partition, such as a running total or a rank within the customer's orders. It is the same difference as SQL's <code>GROUP BY</code> versus window functions with <code>OVER()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is <code>$facet</code> used for, and what are its limits?</summary><div class="qa-body">It runs several sub-pipelines on the same input and returns one document containing each sub-result, which suits dashboards that need counts by status, a top list and a total in a single query. Because the output is a single document, everything must fit within 16 MB, so limit large lists. Sub-pipelines cannot use indexes, so put shared filters in a <code>$match</code> before the facet.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Translate: <code>SELECT cuisine, SUM(amount) FROM orders JOIN restaurants … WHERE status = 'delivered' GROUP BY cuisine HAVING SUM(amount) &gt;= 500 ORDER BY 2 DESC</code>.</summary><div class="qa-body"><code>$match</code> on status, then <code>$lookup</code> into restaurants with <code>$unwind</code>, then <code>$group</code> by <code>"$r.cuisine"</code> with <code>$sum: "$amount"</code>, then <code>$match</code> on the revenue (HAVING), then <code>$sort</code> descending. The stages follow SQL's logical execution order, not its written order. On Biteful the result is Biryani 1,230, Pizza 900 and South Indian 500, identical to PostgreSQL.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should <code>$match</code> come first in a pipeline?</summary><div class="qa-body">Only the stages at the start, which read the collection directly, can use an index, so a leading <code>$match</code> on an indexed field reads only the matching documents instead of scanning everything. It also shrinks the stream, so later stages, especially blocking ones with memory limits, handle less data. The optimizer moves some later matches forward, but not matches on computed fields.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A <code>$sort</code> stage fails with a memory-limit error. What are your options?</summary><div class="qa-body">Allow spilling to disk with <code>allowDiskUse</code> (the default since 6.0, but slower); filter and project earlier so less data reaches the sort; create an index whose order matches the sort so the first stage reads documents already sorted; put a <code>$limit</code> right after the sort so it becomes a top-k sort; or pre-aggregate into a summary collection with <code>$merge</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>$out</code> and <code>$merge</code> do?</summary><div class="qa-body">Both write the pipeline's result to a collection and must be the last stage. <code>$out</code> replaces the target collection entirely with the result. <code>$merge</code> inserts, updates or merges the result documents into an existing collection, matching on a field such as <code>_id</code>, which makes it the tool for incrementally maintained summary tables or materialised views.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you see whether a pipeline uses an index?</summary><div class="qa-body">Run <code>db.collection.explain("executionStats").aggregate(pipeline)</code> and look at the plan of the first stage: <code>COLLSCAN</code> means every document was read, <code>IXSCAN</code> means an index was used. Compare keys examined and documents examined with documents returned; a large gap means wasted work, even when an index is used.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Should you aggregate in MongoDB or in pandas?</summary><div class="qa-body">Do the filtering, joining and grouping in MongoDB so that only a small summary crosses the network (push-down), then use pandas for reshaping, pivoting and plotting the summary. Pulling millions of raw documents into pandas to compute a handful of totals wastes network, memory and time. Flatten compound group keys with a final <code>$project</code> so the rows convert cleanly into a DataFrame.</div></details>
</main>
`
});
