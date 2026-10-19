// notes/databases/db_types.js — Types of Databases
Object.assign(TOPIC_CONTENT, {
  "db_types": `<main>
  <h1>Types of Databases</h1>
  <div class="where"><span>Databases</span><span>Foundations</span><span>Types of Databases</span></div>
  <p class="lead">There is no single "best" database. Each family stores data in a different shape, and the shape decides which questions are fast and which are painful. This page follows <strong>Biteful</strong>, the food-delivery company from <a class="xref" data-note="db_intro">What is a Database</a>, as it grows: every new kind of data (menus, carts, rider GPS pings, referrals, delivery metrics, a search box, "dishes like this", company-wide analytics) pushes it to a new family. Then come the trade-offs (row vs column storage, ACID, BASE and CAP) and how to choose and combine them. In a job you will meet five or six of these in one company; in interviews "which database would you use and why" is a standard question. PostgreSQL 16, Redis 7 and DuckDB were run for real for every block marked with output; Cassandra, Neo4j and InfluxDB are not installed here, so their statements are clearly labelled as syntax sketches.</p>

  <h2 id="dt-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="dt-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="69" y="41" text-anchor="middle" font-size="12">What is a DB</text><text x="69" y="58" text-anchor="middle" class="tm" font-size="10">why a DBMS exists</text>
<line x1="128" y1="45" x2="146" y2="45" stroke="currentColor" marker-end="url(#dt-a0)"/>
<rect x="148" y="20" width="118" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="207" y="41" text-anchor="middle" font-size="12" font-weight="700">Types of DBs</text><text x="207" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="266" y1="45" x2="284" y2="45" stroke="currentColor" marker-end="url(#dt-a0)"/>
<rect x="286" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="345" y="41" text-anchor="middle" font-size="12">Relational model</text><text x="345" y="58" text-anchor="middle" class="tm" font-size="10">tables, keys, types</text>
<line x1="404" y1="45" x2="422" y2="45" stroke="currentColor" marker-end="url(#dt-a0)"/>
<rect x="424" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="483" y="41" text-anchor="middle" font-size="12">Querying basics</text><text x="483" y="58" text-anchor="middle" class="tm" font-size="10">SELECT … GROUP BY</text>
<line x1="542" y1="45" x2="560" y2="45" stroke="currentColor" marker-end="url(#dt-a0)"/>
<rect x="562" y="20" width="90" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="607" y="41" text-anchor="middle" font-size="12">MongoDB …</text><text x="607" y="58" text-anchor="middle" class="tm" font-size="10">documents deep</text>
<text x="330" y="110" text-anchor="middle" class="tm" font-size="10.5">Relational is studied in depth next (SQL pages); the document family in the MongoDB pages;</text>
<text x="330" y="127" text-anchor="middle" class="tm" font-size="10.5">vector databases in GenAI; warehouses in Data Engineering.</text>
</svg><figcaption>This page is the map of all database families. The next pages zoom into the relational family, which you will use most.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="db_intro">What is a Database</a></b><span>A DBMS gives Biteful one safe home for its orders: constraints, transactions, an index, a WAL, and a split between the app database (OLTP) and the warehouse (OLAP).</span></li>
    <li><b>This note adds: one family per shape of data</b><span>Relational, document, key-value, wide-column, graph, time-series, search and vector databases, each shown on a real Biteful need; then row vs column storage, ACID / BASE / CAP, and how to choose and combine them.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sql_relational">Relational Model &amp; PostgreSQL</a></b><span>The relational family is the default, so the next pages design Biteful's tables properly and query them. The document family returns in <a class="xref" data-note="mongo_basics">MongoDB</a>, vectors in <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>.</span></li>
  </ol>

  <h2 id="dt-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Biteful keeps growing; each new need is a question the current databases answer badly, and the next family answers it.</p>
  <ol class="story">
    <li><b>Relational</b><span>Q: orders, customers and restaurants that point at each other? → Tables linked by keys, combined with JOIN: order 109 = Farah + Biryani Bros + ₹600. But every restaurant's menu has different fields…</span></li>
    <li><b>Document</b><span>Q: records whose shape varies? → One JSON document per menu, nested fields allowed (PostgreSQL JSONB found Dosa Hut's spicy items). But the app reads the cart on every tap, crores of times a day, and needs it in under a millisecond…</span></li>
    <li><b>Key-value</b><span>Q: fetch one thing by its key, instantly? → A giant dictionary in RAM (Redis GET cart:asha). But it can only find by key, and 10,000 riders sending GPS every few seconds is more writes than one machine can take…</span></li>
    <li><b>Wide-column</b><span>Q: a firehose of writes spread over many machines? → A partition key decides the machine, a clustering key sorts within it. But there are no joins, and "who did Asha's referrals refer?" is a chain of hops…</span></li>
    <li><b>Graph</b><span>Q: follow relationships many hops deep? → Nodes and edges; each hop is a pointer (SQL needs a recursive query: Asha → Ben, Chen → Farah). But delivery metrics arrive every second and are only ever appended and averaged per time bucket…</span></li>
    <li><b>Time-series</b><span>Q: time-stamped measurements, bucketed and expired? → Append-only storage with time buckets and retention (average delivery minutes per day). But customers type "biryani" into a search box…</span></li>
    <li><b>Search</b><span>Q: which dishes contain these words, best first? → An inverted index, word → dishes ("biryani" → Chicken Biryani, Veg Biryani). But "something like biryani" should also find pulao, which shares no word…</span></li>
    <li><b>Vector</b><span>Q: what is similar in meaning? → Embeddings (lists of numbers) and nearest-neighbour search. Now the analysts want all of this summarised over two years: why are warehouses so much faster at that?</span></li>
    <li><b>Row vs column stores</b><span>Q: how is a table laid out on disk? → Rows together (fast to fetch one order) or columns together (fast to sum one column: 10 values read instead of 70). But copying data to many machines raises the question of what stays guaranteed…</span></li>
    <li><b>ACID, BASE &amp; CAP</b><span>Q: what promises does each database make? → ACID (all-or-nothing refund), BASE (eventually consistent counters), and CAP (during a network split, refuse or risk stale). So, for a given workload, which family?</span></li>
    <li><b>How to choose</b><span>Q: workload → database? → Ask about transactions, query pattern, volume, shape and team; default to PostgreSQL. But a real product needs several of these at once…</span></li>
    <li><b>Polyglot &amp; managed cloud</b><span>Q: how do many databases stay in sync, and who runs them? → One source of truth, specialists fed by CDC from its WAL; cloud providers run them for you. Next: design the source of truth properly.</span></li>
  </ol>

  <h2 id="dt-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Types of Databases</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Relational (the default)</div>
        <ul>
          <li><b>Model</b> — tables, fixed columns, linked by keys, JOIN at query time</li>
          <li><b>Each fact once</b> — order stores <code>customer_id</code>, name lives in <code>customers</code></li>
          <li><b>Great</b> — ad-hoc queries, JOINs, ACID, constraints</li>
          <li><b>Weak</b> — scaling writes across machines; shape that changes weekly</li>
          <li><b>Products</b> — PostgreSQL, MySQL, SQLite; NewSQL: CockroachDB, Spanner</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Document &amp; Key-value</div>
        <ul>
          <li><b>Document</b> — one nested JSON per record; whole object in one read (MongoDB, JSONB)</li>
          <li>⚠ weak at many-to-many + cross-document analytics; duplicated data goes stale</li>
          <li>💡 <b>Filing cabinet</b> — one folder per menu</li>
          <li><b>Key-value</b> — giant dictionary, value is opaque (Redis, DynamoDB)</li>
          <li><b>Uses</b> — cache, sessions, carts, rate limits, counters, online features</li>
          <li>💡 <b>Coat check</b> — ticket → coat instantly; "red coats?" = check every hook</li>
          <li>⚠ <b>In-memory</b> is a property: Redis can lose last writes → cache, not truth</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Wide-column &amp; Graph</div>
        <ul>
          <li><b>Wide-column</b> — partition key groups rows, clustering key sorts them (Cassandra)</li>
          <li><b>Design</b> — one table per query; millions of writes/s; no JOINs</li>
          <li>⚠ <b>Wide-column ≠ columnar</b> — rows by key (writes) vs columns apart (scans)</li>
          <li><b>Graph</b> — nodes + edges with properties; hop = pointer, not JOIN (Neo4j)</li>
          <li><b>Graph uses</b> — referral/fraud rings, friends-of-friends, recommendations</li>
          <li>💡 <b>Detective corkboard</b> — follow the string</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Specialists</div>
        <ul>
          <li><b>Time-series</b> — (time, tags, values), append-only, buckets, retention (TimescaleDB, InfluxDB)</li>
          <li><b>Search</b> — inverted index word → docs, BM25 ranking (Elasticsearch)</li>
          <li>⚠ search engine is fed from main DB; not the source of truth</li>
          <li><b>Vector</b> — embeddings + ANN index (HNSW): trade a little recall for speed</li>
          <li><b>Default</b> — pgvector under a few million vectors; Pinecone/Qdrant at scale</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Row vs Column store</div>
        <ul>
          <li><b>Row store</b> — whole rows together; fetch/update one row cheaply (OLTP)</li>
          <li><b>Column store</b> — each column together; <code>SUM(amount)</code> reads one column (OLAP)</li>
          <li><b>Biteful</b> — count by status: 70 values touched vs 10</li>
          <li><b>Compression</b> — high in columns (run-length, dictionary)</li>
          <li><b>Warehouses</b> — BigQuery, Snowflake, Redshift, ClickHouse, DuckDB</li>
          <li>⚠ <code>SELECT *</code> on BigQuery reads every column, billed per byte</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ACID, BASE, CAP</div>
        <ul>
          <li><b>ACID</b> — Atomic (all or none), Consistent (rules hold), Isolated, Durable</li>
          <li><b>BASE</b> — Basically Available, Soft state, Eventually consistent</li>
          <li>💡 refund (ACID) vs like counter (BASE)</li>
          <li><b>CAP</b> — during a network partition choose Consistency (refuse) or Availability (maybe stale)</li>
          <li>⚠ not "pick 2 of 3": healthy network → both; daily trade = latency vs consistency (PACELC)</li>
          <li><b>CP</b> — HBase, etcd, Spanner · <b>AP</b> — Cassandra, DynamoDB · single node: CAP n/a</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing + polyglot</div>
        <ul>
          <li><b>Ask</b> — transactions? query pattern? volume? shape fixed? team knows X?</li>
          <li><b>Biteful map</b> — orders → Postgres, cart → Redis, GPS → Cassandra, referrals → Neo4j, search → ES, "similar dishes" → vector, BI → warehouse</li>
          <li><b>Polyglot</b> — one source of truth, specialists fed via CDC</li>
          <li>⚠ <b>Dual writes</b> drift when one fails → write once, propagate via CDC</li>
          <li><b>Cloud</b> — RDS/Aurora, DynamoDB, ElastiCache, Redshift · Cloud SQL, Spanner, BigQuery · Snowflake</li>
          <li><b>Interview line</b> — "Default to Postgres; add a specialist for a named workload."</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dt-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="dt-rel"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Relational</span><span class="rm-sub">Tables, keys, JOINs</span></div></div>
      <div class="rm-item rm-done" data-target="dt-doc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Document</span><span class="rm-sub">Menus that don't fit columns</span></div></div>
      <div class="rm-item rm-done" data-target="dt-kv"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Key-Value</span><span class="rm-sub">The cart in under a millisecond</span></div></div>
      <div class="rm-item rm-done" data-target="dt-wide"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Wide-Column</span><span class="rm-sub">Rider GPS firehose</span></div></div>
      <div class="rm-item rm-done" data-target="dt-graph"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Graph</span><span class="rm-sub">Referral chains</span></div></div>
      <div class="rm-item rm-done" data-target="dt-ts"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Time-Series</span><span class="rm-sub">Metrics per time bucket</span></div></div>
      <div class="rm-item rm-done" data-target="dt-search"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Search</span><span class="rm-sub">Inverted index</span></div></div>
      <div class="rm-item rm-done" data-target="dt-vector"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Vector</span><span class="rm-sub">Similar in meaning</span></div></div>
      <div class="rm-item rm-done" data-target="dt-col"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Row vs Column Stores</span><span class="rm-sub">Why warehouses scan fast</span></div></div>
      <div class="rm-item rm-done" data-target="dt-acid"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">ACID, BASE &amp; CAP</span><span class="rm-sub">The guarantees you trade</span></div></div>
      <div class="rm-item rm-done" data-target="dt-choose"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How to Choose</span><span class="rm-sub">Workload → database</span></div></div>
      <div class="rm-item rm-done" data-target="dt-poly"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Polyglot &amp; Managed Cloud</span><span class="rm-sub">Many DBs, one product</span></div></div>
      <div class="rm-item rm-done" data-target="dt-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Shape decides the cheap question</span></div></div>
      <div class="rm-item rm-done" data-target="dt-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="dt-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dt-rel"><span class="num">01</span>Relational</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful's core data is customers, restaurants and orders, and every order points at one customer and one restaurant. How do we store things that refer to each other without copying names into every order?</p>
  </div>
  <p>Think of how a school office keeps records. One register lists students (roll number, name, class). Another lists fee payments (roll number, date, amount). The payment register never repeats a student's name; it just writes the roll number. To see "who paid on 5 June?" the clerk looks up the roll number in the student register.</p>
  <p>That is the relational model. Data sits in <strong>tables</strong> with fixed columns. Tables point to each other with ids (called <strong>keys</strong>). A <strong>JOIN</strong> is the lookup that combines them when you ask a question. Biteful's order 109 stores only <code>customer_id = 6</code> and <code>restaurant_id = 11</code>; to show it with names, join the three tables:</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, c.name AS customer, r.name AS restaurant, o.status, o.amount
FROM orders o
JOIN customers c   ON c.customer_id = o.customer_id
JOIN restaurants r ON r.restaurant_id = o.restaurant_id
WHERE o.order_id = 109;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer</th><th>restaurant</th><th>status</th><th>amount</th></tr><tr><td>109</td><td>Farah</td><td>Biryani Bros</td><td>delivered</td><td>600.00</td></tr></table>
  <p>Read the query like this: take <code>orders</code> (short name <code>o</code>), attach the matching row of <code>customers</code> (<code>c</code>) and of <code>restaurants</code> (<code>r</code>) where the ids are equal, keep only order 109. If Farah moves to Pune, you change one row in <code>customers</code> and every order shows the new city. The same order looks very different in the four main families:</p>
  <figure class="viz"><svg viewBox="0 0 600 215" width="600">
    <defs><marker id="dt-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="75" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Relational</text>
    <text x="15" y="42" class="tm">orders</text><text x="88" y="42" class="tm">customers</text>
    <rect x="15" y="50" width="56" height="20" rx="3" class="fb"/><text x="22" y="64">109 │ 6</text>
    <rect x="15" y="74" width="56" height="20" rx="3" class="fb"/><text x="22" y="88">102 │ 2</text>
    <rect x="88" y="50" width="56" height="20" rx="3" class="ft"/><text x="94" y="64">6 Farah</text>
    <rect x="88" y="74" width="56" height="20" rx="3" class="ft"/><text x="94" y="88">2 Ben</text>
    <g stroke="currentColor" marker-end="url(#dt-ar1)"><line x1="71" y1="60" x2="86" y2="60"/><line x1="71" y1="84" x2="86" y2="84"/></g>
    <text x="232" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Document</text>
    <rect x="165" y="35" width="135" height="100" rx="6" class="fs"/>
    <text x="173" y="54">{ _id: 109,</text><text x="173" y="70">  cust: {name:</text><text x="173" y="86">    "Farah"},</text><text x="173" y="102">  items: [Biryani,</text><text x="173" y="118">    Kebab] }</text>
    <text x="380" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Key-value</text>
    <rect x="315" y="40" width="58" height="22" rx="3" class="fv"/><text x="319" y="55">cart:6</text><rect x="390" y="40" width="55" height="22" rx="3" class="fs"/><text x="396" y="55">{items}</text>
    <rect x="315" y="72" width="58" height="22" rx="3" class="fv"/><text x="319" y="87">views:11</text><rect x="390" y="72" width="55" height="22" rx="3" class="fs"/><text x="396" y="87">42</text>
    <rect x="315" y="104" width="58" height="22" rx="3" class="fv"/><text x="319" y="119">eta:109</text><rect x="390" y="104" width="55" height="22" rx="3" class="fs"/><text x="396" y="119">12 min</text>
    <g stroke="currentColor" marker-end="url(#dt-ar1)"><line x1="373" y1="51" x2="388" y2="51"/><line x1="373" y1="83" x2="388" y2="83"/><line x1="373" y1="115" x2="388" y2="115"/></g>
    <text x="527" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Graph</text>
    <g stroke="currentColor" marker-end="url(#dt-ar1)"><line x1="502" y1="60" x2="545" y2="88"/><line x1="502" y1="138" x2="545" y2="112"/></g>
    <circle cx="485" cy="52" r="20" class="fb"/><text x="485" y="56" text-anchor="middle">Farah</text>
    <circle cx="485" cy="145" r="20" class="fb"/><text x="485" y="149" text-anchor="middle">Ben</text>
    <circle cx="565" cy="100" r="24" class="fg"/><text x="565" y="104" text-anchor="middle" font-size="9">Biryani Bros</text>
    <text x="522" y="66" class="tm" font-size="9">ORDERED</text>
    <text x="75" y="190" text-anchor="middle" class="tm">JOIN on keys</text>
    <text x="232" y="190" text-anchor="middle" class="tm">whole object, 1 read</text>
    <text x="380" y="190" text-anchor="middle" class="tm">get by key only</text>
    <text x="527" y="190" text-anchor="middle" class="tm">follow edges</text>
    </g>
  </svg><figcaption>The same Biteful data in four shapes. The shape decides which questions are cheap.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A set of linked spreadsheets with strict rules. Each fact is written once; other sheets refer to it by id instead of copying it.</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> ad-hoc queries, JOINs, strong transactions, data integrity (constraints).</li>
    <li><strong>Bad at:</strong> scaling writes across many machines; data whose shape changes every week.</li>
    <li><strong>Products:</strong> PostgreSQL, MySQL, SQLite, SQL Server, Oracle. Distributed SQL ("NewSQL"): CockroachDB, Google Spanner.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>relational database</strong> stores data as tables (relations) with a fixed schema; rows are linked through <strong>keys</strong> and combined at query time with <strong>JOIN</strong>. Each fact is stored once. The model is built step by step in <a class="xref" data-note="sql_relational">Relational Model</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Relational" does not mean "has relationships"; every database has those. It comes from <em>relation</em>, the maths word for a table. The point is that relationships are expressed by matching key values, not by pointers or nesting.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: document databases.</b> Fixed columns suit orders. Restaurants' menus do not: a dosa has a spice level and chutneys, a pizza has a size and a crust. How do we store records whose fields differ?</div>

  <h2 id="dt-doc"><span class="num">02</span>Document</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A table needs every row to have the same columns. Biteful's menus don't: each restaurant's dishes have their own options. Do we invent 50 mostly empty columns, or is there a shape that lets each record carry its own fields?</p>
  </div>
  <p>A document database stores each record as a self-contained <strong>JSON-like document</strong> (JSON = text with named fields in curly braces, the format web apps already speak). Fields can differ between documents and can nest: a field can hold a list or another set of fields. Here are two Biteful menus as documents. Notice the dosa has <code>spice</code> and <code>chutneys</code>; the pizza has <code>sizes</code>; neither has the other's fields:</p>
  <div class="fx" data-lang="js">// two menu documents: same idea, different fields
{ "restaurant": "Dosa Hut",
  "items": [ { "name": "Masala Dosa", "price": 120, "spice": "medium",
               "chutneys": ["coconut", "tomato"] },
             { "name": "Filter Coffee", "price": 70 } ] }
{ "restaurant": "Pizza Point",
  "items": [ { "name": "Margherita", "sizes": { "regular": 280, "large": 420 } } ] }</div>
  <p>PostgreSQL can store documents too, in a column of type <code>JSONB</code> (binary JSON). Here the two documents above are stored and queried: <code>-&gt;</code> steps into a field, <code>-&gt;&gt;</code> pulls a value out as text, and <code>jsonb_array_elements</code> turns the <code>items</code> list into one row per item:</p>
  <div class="fx" data-lang="sql">SELECT m.doc -&gt;&gt; 'restaurant' AS restaurant,
       item -&gt;&gt; 'name'         AS dish,
       item -&gt;&gt; 'spice'        AS spice,
       item -&gt; 'sizes' -&gt;&gt; 'large' AS large_price
FROM menus m, jsonb_array_elements(m.doc -&gt; 'items') AS item;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant</th><th>dish</th><th>spice</th><th>large_price</th></tr><tr><td>Dosa Hut</td><td>Masala Dosa</td><td>medium</td><td>NULL</td></tr><tr><td>Dosa Hut</td><td>Filter Coffee</td><td>NULL</td><td>NULL</td></tr><tr><td>Pizza Point</td><td>Margherita</td><td>NULL</td><td>420</td></tr></table>
  <p>(The <code>menus</code> table was created with a <code>JSONB</code> column and the two documents inserted; that setup is hidden.) Each dish became a row. A field a document doesn't have comes back as NULL: Filter Coffee has no spice, the dosas have no sizes. So "we need flexible fields" alone is not a reason to leave PostgreSQL.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A filing cabinet of folders. Everything about one menu is in one folder. Fast to grab one folder; slow to ask "average price of every dish across all folders".</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> reading/writing a whole object in one go; evolving or varied schemas (menus, product catalogues, user profiles, CMS).</li>
    <li><strong>Bad at:</strong> many-to-many relationships and cross-document analytics. Duplicated data (a customer's name copied into every order document) goes stale.</li>
    <li><strong>Products:</strong> MongoDB, Couchbase, Firestore, Amazon DocumentDB. PostgreSQL <code>JSONB</code> covers many of the same cases.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>document database</strong> stores self-describing, possibly nested records (JSON/BSON documents), usually grouped in <em>collections</em>, and reads or writes a whole document by its id in one operation. Studied in depth in <a class="xref" data-note="mongo_basics">MongoDB: Documents &amp; CRUD</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Schemaless" means the database does not check the shape, not that there is no shape. If one menu says <code>"price"</code> and another <code>"Price"</code>, every reader must cope. The schema has moved into the application code.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: key-value stores.</b> Documents fetch one whole object quickly. But every tap in the app asks "what is in this user's cart, is this user logged in?" crores of times a day, and even a fast database query over the network is too slow and too expensive for that.</div>

  <h2 id="dt-kv"><span class="num">03</span>Key-Value</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Some data is only ever fetched by one exact id: Asha's cart, Ben's login session, today's view count of Biryani Bros. We don't need queries, joins or rules for it, only raw speed. What is the simplest, fastest store for "give me the value for this key"?</p>
  </div>
  <p>A cloakroom at a wedding hall: you hand in your bag, you get token 42. Later you show token 42 and get your bag back in a second. The attendant never looks inside the bag. A key-value store works the same way. It is a giant <strong>dictionary</strong>: you give a key (the token), you get a value (the bag). The database doesn't look inside the value, so it can be anything: a number, a JSON blob, a list. Here are real Redis commands against a Redis 7 server: <code>SET</code> stores a value under a key, <code>EX 1800</code> makes it expire after 1800 seconds (30 minutes), <code>GET</code> reads it, <code>TTL</code> shows the seconds left, <code>INCR</code> adds 1 to a counter.</p>
  <div class="fx" data-lang="text">&gt; FLUSHALL
OK
&gt; SET cart:asha '{"restaurant": 10, "items": [["Masala Dosa", 2]]}' EX 1800
OK
&gt; GET cart:asha
{"restaurant": 10, "items": [["Masala Dosa", 2]]}
&gt; TTL cart:asha
1800
&gt; INCR views:restaurant:11
1
&gt; INCR views:restaurant:11
2
&gt; SET cart:ben '{"restaurant": 11, "items": [["Chicken Biryani", 1]]}' EX 1800
OK
&gt; KEYS cart:*
cart:ben
cart:asha</div>
  <p>Every answer came back by key. Now ask a question that is not "by key": "which carts contain Masala Dosa?" Redis has no WHERE. The only way is to list every cart key and GET each value, then search inside the text yourself. (<code>KEYS</code> lists keys matching a pattern; it scans the whole keyspace and is banned on busy production servers.) That is the price of the speed.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A coat check. Hand over ticket 42, get coat 42 back instantly. Ask "which coats are red?" and the attendant has to check every hook.</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> sub-millisecond lookups by key: caches, sessions, carts, rate limiters, counters, leaderboards, online feature serving.</li>
    <li><strong>Bad at:</strong> any query not by key (filter, range, JOIN, aggregate).</li>
    <li><strong>Products:</strong> Redis, Memcached, Amazon DynamoDB, etcd.</li>
  </ul>
  <div class="callout intu"><span class="label">In-memory is a property, not a family</span>
    <p><strong>In-memory</strong> = data kept in RAM (the computer's fast, temporary memory) instead of disk, so reads take microseconds. Redis can persist (save snapshots to disk, or append every write to a log), but a crash can still lose the last writes: use it as a <strong>cache</strong> (a fast copy of data that lives properly elsewhere) or for data you can afford to lose (a cart), not as the source of truth for orders.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>key-value store</strong> maps unique keys to opaque values and supports essentially three operations: put, get and delete by key (plus small extras like expiry and atomic counters). It is the database version of a Python <code>dict</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Treating a cache as truth. If the cart lives only in Redis and Redis restarts without persistence, carts vanish. Fine for carts, unacceptable for paid orders: those go to PostgreSQL first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: wide-column stores.</b> Key-value is fast but still one machine's worth of writes. Biteful's 10,000 riders each send a GPS point every few seconds, forever. No single server keeps up. How do we spread a write firehose across many machines and still read one rider's trail in order?</div>

  <h2 id="dt-wide"><span class="num">04</span>Wide-Column</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Thousands of writes per second, forever, more than one machine can absorb. The data must be split across many machines, and each GPS point must land on the right one without a lookup. How does the database know where each row goes, and how do we read one rider's day quickly?</p>
  </div>
  <p>A wide-column store solves this with two keys. The <strong>partition key</strong> decides which machine (and which bucket on it) a row goes to; all rows with the same partition key sit together. The <strong>clustering key</strong> sorts rows inside that bucket. For rider pings: one bucket per rider per day, rows sorted by time. "Give me rider R7's trail for 2 March" is then one bucket read, already in order.</p>
  <div class="fx" data-lang="sql">-- Syntax sketch in Cassandra CQL (not executed here: no Cassandra server in this environment)
CREATE TABLE rider_pings (
  rider_id text, day date, ts timestamp, lat double, lon double,
  PRIMARY KEY ((rider_id, day), ts)      -- (partition key), clustering key
) WITH CLUSTERING ORDER BY (ts DESC);
-- partition ('R7', 2026-03-02): ts=20:41:05 (18.52, 73.85) | ts=20:41:00 (18.52, 73.84) | ...
SELECT ts, lat, lon FROM rider_pings WHERE rider_id = 'R7' AND day = '2026-03-02' LIMIT 20;</div>
  <p>Read the key: the double brackets <code>((rider_id, day), ts)</code> say "partition by rider and day, then sort by time". The SELECT names the whole partition key, so it reads exactly one bucket. A query like "all pings near Pune station" names no partition key, so it would have to visit every machine; Cassandra refuses it unless you explicitly allow a full scan.</p>
  <ul>
    <li><strong>Great at:</strong> millions of writes per second, linear scaling by adding nodes, "latest N events for key X".</li>
    <li><strong>Bad at:</strong> queries not on the partition key, JOINs, ad-hoc analytics. You design one table <em>per query</em>.</li>
    <li><strong>Products:</strong> Apache Cassandra, ScyllaDB, HBase, Google Bigtable.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A post office sorting room. The pin code (partition key) decides which bag a letter goes into; inside each bag, letters are stacked by date (clustering key). Adding more sorters just means more bags.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>wide-column store</strong> is a distributed, partitioned row store: rows are grouped by a <strong>partition key</strong> that is hashed to pick a node, and sorted within the partition by a <strong>clustering key</strong>. Different rows may have different sets of columns ("wide" rows).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Wide-column" is <em>not</em> "columnar". Cassandra stores rows grouped by key (good for writes). Columnar warehouses store each column separately (good for scans, section 09). Interviewers love this mix-up.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: graph databases.</b> Partitioned tables have no joins at all. Biteful's fraud team asks "who did the people Asha referred go on to refer?", a chain of hops of unknown length. Neither key lookups nor single joins answer that well.</div>

  <h2 id="dt-graph"><span class="num">05</span>Graph</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Referral bonuses attract fraud: one person creates fake accounts that refer each other. To spot a ring you must follow "referred" links hop after hop, without knowing how many hops there are. How expensive is that, and is there a shape built for it?</p>
  </div>
  <p>In Biteful's relational data the links already exist: <code>customers.referred_by</code> points at the referrer. Each hop is one more self-join; for an unknown number of hops SQL needs a <strong>recursive</strong> query (a query that repeats until no new rows appear; explained in <a class="xref" data-note="sql_subqueries">Subqueries &amp; CTEs</a>). Here is Asha's referral tree:</p>
  <div class="fx" data-lang="sql">WITH RECURSIVE tree AS (
  SELECT customer_id, name, 0 AS hops FROM customers WHERE name = 'Asha'
  UNION ALL
  SELECT c.customer_id, c.name, t.hops + 1
  FROM customers c JOIN tree t ON c.referred_by = t.customer_id
)
SELECT name, hops FROM tree ORDER BY hops, name;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>hops</th></tr><tr><td>Asha</td><td>0</td></tr><tr><td>Ben</td><td>1</td></tr><tr><td>Chen</td><td>1</td></tr><tr><td>Farah</td><td>2</td></tr></table>
  <p>Trace it: start with Asha (0 hops). Round 1 finds everyone whose <code>referred_by</code> is Asha's id 1: Ben and Chen. Round 2 finds everyone referred by Ben (2) or Chen (3): Farah. Round 3 finds nobody, so it stops. Each round is a join over the whole customers table; with crores of customers and 5 hops that gets slow.</p>
  <p>A graph database stores the question's shape directly. Data is <strong>nodes</strong> (things: Asha, Biryani Bros) and <strong>edges</strong> (relationships: REFERRED, ORDERED_FROM), and both can carry properties. Following an edge is a pointer hop, not a JOIN: from Asha's node the database already holds the addresses of everyone she referred. The query language Cypher draws the pattern with arrows:</p>
  <div class="fx" data-lang="text">// Syntax sketch in Cypher (not executed here: no Neo4j server in this environment)
(:Customer {name:'Asha'})-[:REFERRED]-&gt;(:Customer {name:'Ben'})

// everyone within 1 to 5 referral hops of Asha
MATCH (a:Customer {name:'Asha'})-[:REFERRED*1..5]-&gt;(x)
RETURN x.name</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A detective's corkboard with photos and string. "Friends of friends of the suspect" means following string, not cross-referencing lists.</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> multi-hop questions: fraud and referral rings, recommendations ("people who ordered from here also ordered from…"), social networks, knowledge graphs.</li>
    <li><strong>Bad at:</strong> bulk aggregation ("revenue per month"), very high write throughput.</li>
    <li><strong>Products:</strong> Neo4j, Amazon Neptune, TigerGraph, ArangoDB.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>graph database</strong> stores nodes and edges as first-class objects, with each node holding direct references to its neighbours ("index-free adjacency"), so a traversal costs per hop rather than per table size.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A graph you can answer with one or two joins does not need a graph database; PostgreSQL's recursive query handled Asha's tree fine. Reach for a graph DB when hops are deep, variable and frequent.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: time-series databases.</b> Meanwhile operations wants live dashboards: average delivery minutes per hour, per city, for the last 30 days, with old raw data deleted automatically. That data is only ever appended and summarised by time.</div>

  <h2 id="dt-ts"><span class="num">06</span>Time-Series</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Metrics such as delivery minutes, rider counts or server CPU arrive with a timestamp, are never edited, and are almost always asked for as "average per time bucket". Storing years of raw per-second points is wasteful. What kind of database is built around time?</p>
  </div>
  <p>A fitness band records your heart rate every second. You never go back and edit yesterday's 10:03:17 reading; you only add new ones and ask "average per minute over the last hour". Records are <strong>(timestamp, tags, values)</strong>, appended in time order. The core query is a time bucket; here is the idea on Biteful's delivered orders, one bucket per day:</p>
  <div class="fx" data-lang="sql">SELECT date_trunc('day', ordered_at)::date AS day,
       COUNT(delivery_minutes)            AS measured,
       ROUND(AVG(delivery_minutes), 1)    AS avg_minutes
FROM orders
WHERE status = 'delivered'
GROUP BY 1
ORDER BY 1;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>measured</th><th>avg_minutes</th></tr><tr><td>2026-03-02</td><td>3</td><td>37.0</td></tr><tr><td>2026-03-03</td><td>0</td><td>NULL</td></tr><tr><td>2026-03-04</td><td>1</td><td>25.0</td></tr><tr><td>2026-03-05</td><td>2</td><td>40.5</td></tr></table>
  <p>On 3 March the only delivered order (104) has no recorded minutes, so <code>COUNT</code> is 0 and the average is NULL. A time-series database makes this bucketing native and fast, compresses the data by time, and can automatically delete or downsample old points (keep per-minute averages, drop the raw seconds after 30 days). One reading in InfluxDB's text format looks like this (measurement, tags, field, timestamp in nanoseconds):</p>
  <div class="fx" data-lang="text"># Syntax sketch, InfluxDB line protocol (not executed here: no InfluxDB in this environment)
delivery,city=Pune,restaurant=DosaHut minutes=32 1772433600000000000</div>
  <ul>
    <li><strong>Great at:</strong> high-rate appends, time-bucket aggregates (avg per minute), downsampling and retention ("drop raw data after 30 days").</li>
    <li><strong>Bad at:</strong> updates, relational queries across entities.</li>
    <li><strong>Products:</strong> TimescaleDB (a PostgreSQL extension), InfluxDB, Prometheus, QuestDB.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A train's logbook: every station and minute written in order, never corrected, and at the end of the month summarised as "average delay per day" before the daily pages are archived.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>time-series database</strong> is optimised for append-only, timestamped measurements: storage partitioned by time, compression of similar consecutive values, time-bucket aggregation, and retention policies.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Averages of averages. A per-day average built from per-hour averages is wrong when hours have different counts. Store counts and sums per bucket (as <code>measured</code> above) so you can roll them up correctly.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: search engines.</b> Customers now type into a search box: "biryani", "paneer roll", "chiken biryani" with a typo. They want matching dishes, best match first, in milliseconds. <code>LIKE '%biryani%'</code> reads every row and cannot rank.</div>

  <h2 id="dt-search"><span class="num">07</span>Search</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A normal index sorts whole values, so it can find "Chicken Biryani" exactly but not "any dish containing the word biryani". How do we find every document containing some words, fast, and rank the best ones first?</p>
  </div>
  <p>A search engine prepares for this in advance. It stores the documents plus an <strong>inverted index</strong>: a map from each word to the documents that contain it. "Inverted" because a document normally lists its words, and this lists, for each word, its documents. Build one by hand from the dishes Biteful has sold:</p>
  <div class="fx" data-lang="py">from collections import defaultdict
import psycopg

with psycopg.connect("dbname=biteful") as conn:
    dishes = [r[0] for r in conn.execute("SELECT DISTINCT item FROM order_items ORDER BY item")]

index = defaultdict(set)                 # word -&gt; set of dishes containing it
for dish in dishes:
    for word in dish.lower().split():
        index[word].add(dish)

print(len(dishes), "dishes,", len(index), "distinct words")
for word in ["biryani", "pizza", "dosa", "chicken"]:
    print(f"{word!r:10} -&gt; {sorted(index[word])}")

query = "chicken biryani"
hits = defaultdict(int)                   # score = how many query words a dish matches
for word in query.split():
    for dish in index[word]:
        hits[dish] += 1
print(query, "-&gt;", sorted(hits.items(), key=lambda kv: (-kv[1], kv[0])))</div>
  <div class="fx" data-lang="text">10 dishes, 17 distinct words
'biryani'  -&gt; ['Chicken Biryani', 'Veg Biryani']
'pizza'    -&gt; ['Farmhouse Pizza']
'dosa'     -&gt; ['Masala Dosa']
'chicken'  -&gt; ['Chicken Biryani']
chicken biryani -&gt; [('Chicken Biryani', 2), ('Veg Biryani', 1)]</div>
  <p>What the code does: it reads the 10 distinct dish names, splits each into words and records, for every word, the set of dishes containing it. Answering "biryani" is then one dictionary lookup, not a scan. For "chicken biryani", Chicken Biryani matches both words (score 2) and ranks above Veg Biryani (score 1). Real engines score with <strong>BM25</strong> (rarer words count more; short documents full of matches score higher) and add stemming, typo tolerance and facets.</p>
  <p>PostgreSQL has a built-in version of the same idea, full-text search: <code>to_tsvector</code> turns text into normalised words, <code>to_tsquery</code> into a query, <code>@@</code> tests a match and <code>ts_rank</code> scores it:</p>
  <div class="fx" data-lang="sql">SELECT DISTINCT item,
       ts_rank(to_tsvector('english', item), to_tsquery('english', 'chicken | biryani')) AS rank
FROM order_items
WHERE to_tsvector('english', item) @@ to_tsquery('english', 'chicken | biryani')
ORDER BY rank DESC, item;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>item</th><th>rank</th></tr><tr><td>Chicken Biryani</td><td>0.06079271</td></tr><tr><td>Veg Biryani</td><td>0.030396355</td></tr></table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The index at the back of a textbook: look up a word, get every page it appears on.</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> full-text search, typo tolerance, facets ("Cuisine: Biryani 3, Pizza 2"), log search.</li>
    <li><strong>Bad at:</strong> being the source of truth. It's usually fed from the main DB and can lag or lose writes.</li>
    <li><strong>Products:</strong> Elasticsearch, OpenSearch, Solr; Algolia, Typesense for app search. PostgreSQL full-text search (with a GIN index) is enough for many small apps.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>search engine</strong> stores documents plus an <strong>inverted index</strong> (term → list of documents and positions) and ranks matches with a relevance function such as BM25.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Words are not meaning. The inverted index for "biryani" will never return "Hyderabadi pulao", although a hungry customer would happily accept it. Matching meaning needs the next family.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: vector databases.</b> Customers who like Chicken Biryani might like Veg Biryani, but also pulao or a kebab, which share no words with it. How can a database compare <em>meaning</em>?</div>

  <h2 id="dt-vector"><span class="num">08</span>Vector</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Search matches words. "Show me dishes like this one" needs a notion of closeness in meaning. How do you turn meaning into something a database can measure and index?</p>
  </div>
  <p>An <strong>embedding</strong> is a list of numbers (often 768 or 1536 of them) produced by an ML model, arranged so that items with similar meaning get lists that are close together. A vector database stores these lists and, given a query's list, finds the nearest ones. To see the idea by hand, give each dish just three made-up numbers (how spicy, how rice-based, how cheesy, each 0 to 1) and measure closeness with <strong>cosine similarity</strong> (1 = pointing the same way, 0 = unrelated):</p>
  <div class="fx" data-lang="py">import math

# toy 3-number "embeddings": (spicy, rice-based, cheesy). Real ones have hundreds of numbers from a model.
dishes = {
    "Chicken Biryani": (0.8, 0.9, 0.0),
    "Veg Biryani":     (0.6, 0.9, 0.0),
    "Mutton Kebab":    (0.9, 0.1, 0.0),
    "Masala Dosa":     (0.5, 0.2, 0.1),
    "Margherita":      (0.1, 0.0, 0.9),
    "Farmhouse Pizza": (0.3, 0.0, 0.8),
}

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))

q = dishes["Chicken Biryani"]
ranked = sorted(((cosine(q, v), name) for name, v in dishes.items() if name != "Chicken Biryani"), reverse=True)
for score, name in ranked:
    print(f"{name:16} {score:.3f}")</div>
  <div class="fx" data-lang="text">Veg Biryani      0.990
Masala Dosa      0.879
Mutton Kebab     0.743
Farmhouse Pizza  0.233
Margherita       0.073</div>
  <p>Check the top one by hand: Chicken Biryani (0.8, 0.9, 0) and Veg Biryani (0.6, 0.9, 0). Dot product = 0.48 + 0.81 + 0 = 1.29. Lengths = √(0.64 + 0.81) = 1.204 and √(0.36 + 0.81) = 1.082. Cosine = 1.29 / (1.204 × 1.082) = 0.990. The pizzas, with no rice and lots of cheese, score lowest. With a real model the numbers are learned from text or images, and "pulao" would land near "biryani" without sharing a word.</p>
  <p>Comparing a query with every stored vector is too slow for millions of items, so vector databases use <strong>ANN</strong> (approximate nearest neighbour) indexes such as HNSW: they find <em>almost</em> the closest matches, trading a little recall (a few true neighbours missed) for a huge speed-up.</p>
  <ul>
    <li><strong>Great at:</strong> semantic search (search by meaning), RAG retrieval for LLMs (fetching the right passages to show a chatbot), "similar items", de-duplication.</li>
    <li><strong>Bad at:</strong> exact filters and transactions (most add metadata filtering, with varying quality).</li>
    <li><strong>Products:</strong> Pinecone, Weaviate, Milvus, Qdrant, Chroma; <code>pgvector</code> in PostgreSQL.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A map of a city where similar shops are placed near each other. "Something like this biryani place" means "what is closest on the map", even if the shop names share no letters.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>vector database</strong> stores embedding vectors (plus metadata) and answers k-nearest-neighbour queries under a distance such as cosine or Euclidean, usually through an approximate index (HNSW, IVF). Covered in <a class="xref" data-note="vectordb">Embeddings &amp; Vector DBs</a>.</p>
  </div>
  <div class="callout intu"><span class="label">Practical default</span>
    <p>Under a few million vectors, <code>pgvector</code> inside your existing PostgreSQL is usually enough. A dedicated vector DB pays off at large scale or very high query rates.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: row vs column stores.</b> Every family so far serves the app. The analysts want "revenue per restaurant per month for two years" across billions of rows. Why does a warehouse answer that in seconds while PostgreSQL takes minutes, if both speak SQL?</div>

  <h2 id="dt-col"><span class="num">09</span>Row vs Column Stores</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A table is two-dimensional, but a disk is one long line of bytes. The database must choose: write the table row after row, or column after column? Does that choice matter for speed?</p>
  </div>
  <p>Tiny worked example. Biteful's <code>orders</code> table has 10 rows and 7 columns, so 70 values. Query: <em>count orders by status</em>. It needs only the <code>status</code> column, 10 values. Lay the same table out both ways and count what a scan must touch:</p>
  <div class="fx" data-lang="py">import psycopg

with psycopg.connect("dbname=biteful") as conn:
    cur = conn.execute("SELECT * FROM orders ORDER BY order_id")
    cols = [d.name for d in cur.description]
    rows = [tuple(str(v) for v in r) for r in cur.fetchall()]   # values as text

row_store = [v for r in rows for v in r]              # row after row
column_store = {c: [r[i] for r in rows] for i, c in enumerate(cols)}   # column after column

print("row store, first 9 values on disk :", row_store[:9])
print("column store, 'status' block      :", column_store["status"])
print("values a row-store scan touches   :", len(row_store))
print("values a column-store scan touches:", len(column_store["status"]))</div>
  <div class="fx" data-lang="text">row store, first 9 values on disk : ['101', '1', '10', '2026-03-02 12:10:00+05:30', 'delivered', '240.00', '32', '102', '2']
column store, 'status' block      : ['delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'delivered', 'cancelled', 'delivered', 'delivered', 'pending']
values a row-store scan touches   : 70
values a column-store scan touches: 10</div>
  <p>In the row store the 10 status values are spread out, one inside each row, so reaching them means reading all 70 values. In the column store they sit together and the scan reads exactly 10. On 10 rows nobody notices. On 2 billion rows with 40 columns, the row store reads 40 times more data than needed. DuckDB, a column store you can run in Python, shows it in its plan: the scan reads only the <code>status</code> column.</p>
  <div class="fx" data-lang="py">import duckdb

con = duckdb.connect()                          # an in-memory column-store database
con.execute("""CREATE TABLE orders AS SELECT * FROM (VALUES
  (101,'delivered',240), (102,'delivered',450), (103,'delivered',520), (104,'delivered',380),
  (105,'cancelled',310), (106,'delivered',180), (107,'cancelled',260), (108,'delivered',260),
  (109,'delivered',600), (110,'pending',310)) AS t(order_id, status, amount)""")
print(con.execute("SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status").fetchall())
plan = con.execute("EXPLAIN SELECT status, COUNT(*) FROM orders GROUP BY status").fetchall()[0][1]
print([line.strip("│ ").strip() for line in plan.splitlines() if "SEQ_SCAN" in line or "Projections" in line])</div>
  <div class="fx" data-lang="text">[('cancelled', 2), ('delivered', 7), ('pending', 1)]
['SEQ_SCAN', 'Projections: status']</div>
  <p>Same answer as PostgreSQL would give (7 delivered, 2 cancelled, 1 pending); the plan's scan step lists <code>Projections: status</code>, meaning only that column is read.</p>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
    <g font-size="10">
      <rect x="40" y="6" width="12" height="12" class="fb"/><text x="57" y="16">order_id</text>
      <rect x="150" y="6" width="12" height="12" class="ft"/><text x="167" y="16">customer_id</text>
      <rect x="280" y="6" width="12" height="12" class="fv"/><text x="297" y="16">ordered_at</text>
      <rect x="400" y="6" width="12" height="12" class="fg"/><text x="417" y="16">status</text>
    </g>
    <text x="40" y="44" font-weight="bold">Row store <tspan class="tm" font-weight="normal">(PostgreSQL): row after row</tspan></text>
    <g stroke="currentColor" stroke-opacity="0.35">
      <rect x="40" y="52" width="25" height="28" class="fb"/><rect x="65" y="52" width="25" height="28" class="ft"/><rect x="90" y="52" width="25" height="28" class="fv"/><rect x="115" y="52" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/>
      <rect x="145" y="52" width="25" height="28" class="fb"/><rect x="170" y="52" width="25" height="28" class="ft"/><rect x="195" y="52" width="25" height="28" class="fv"/><rect x="220" y="52" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/>
      <rect x="250" y="52" width="25" height="28" class="fb"/><rect x="275" y="52" width="25" height="28" class="ft"/><rect x="300" y="52" width="25" height="28" class="fv"/><rect x="325" y="52" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/>
      <rect x="355" y="52" width="25" height="28" class="fb"/><rect x="380" y="52" width="25" height="28" class="ft"/><rect x="405" y="52" width="25" height="28" class="fv"/><rect x="430" y="52" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/>
      <rect x="460" y="52" width="25" height="28" class="fb"/><rect x="485" y="52" width="25" height="28" class="ft"/><rect x="510" y="52" width="25" height="28" class="fv"/><rect x="535" y="52" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/>
    </g>
    <path d="M40,88 L40,94 L560,94 L560,88" fill="none" class="sr" stroke-width="2"/>
    <text x="300" y="110" text-anchor="middle" class="tr">reads every value to get the statuses</text>
    <text x="40" y="142" font-weight="bold">Column store <tspan class="tm" font-weight="normal">(BigQuery, DuckDB): column after column</tspan></text>
    <g stroke="currentColor" stroke-opacity="0.35">
      <rect x="40" y="150" width="25" height="28" class="fb"/><rect x="65" y="150" width="25" height="28" class="fb"/><rect x="90" y="150" width="25" height="28" class="fb"/><rect x="115" y="150" width="25" height="28" class="fb"/><rect x="140" y="150" width="25" height="28" class="fb"/>
      <rect x="170" y="150" width="25" height="28" class="ft"/><rect x="195" y="150" width="25" height="28" class="ft"/><rect x="220" y="150" width="25" height="28" class="ft"/><rect x="245" y="150" width="25" height="28" class="ft"/><rect x="270" y="150" width="25" height="28" class="ft"/>
      <rect x="300" y="150" width="25" height="28" class="fv"/><rect x="325" y="150" width="25" height="28" class="fv"/><rect x="350" y="150" width="25" height="28" class="fv"/><rect x="375" y="150" width="25" height="28" class="fv"/><rect x="400" y="150" width="25" height="28" class="fv"/>
      <rect x="430" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/><rect x="455" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/><rect x="480" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/><rect x="505" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/><rect x="530" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/>
    </g>
    <path d="M430,186 L430,192 L555,192 L555,186" fill="none" class="sg" stroke-width="2"/>
    <text x="492" y="206" text-anchor="middle" class="tg">reads only status</text>
  </svg><figcaption>Five rows and four columns drawn. Row store keeps a row's values together (cheap to fetch one order); column store keeps a column together (cheap to scan one field).</figcaption></figure>
  <p>In the picture, each small box is one value and the green boxes are <code>status</code>. Count how many boxes the red bracket covers versus the green one. The second win of column stores is <strong>compression</strong>: a status column is mostly "delivered, delivered, delivered…", which can be stored as "delivered × 4" instead of four copies.</p>
  <table class="tbl">
    <tr><th></th><th>Row store</th><th>Column store</th></tr>
    <tr><td>Fast for</td><td>Fetch or update one whole row (OLTP)</td><td>Aggregate a few columns over billions of rows (OLAP)</td></tr>
    <tr><td><code>SUM(amount)</code> over 1B rows</td><td>Reads every column of every row</td><td>Reads only <code>amount</code></td></tr>
    <tr><td>Compression</td><td>Modest</td><td>High: similar values sit together (run-length, dictionary)</td></tr>
    <tr><td>Single-row insert/update</td><td>Cheap</td><td>Expensive; load in batches</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A row store is a stack of filled-in forms: great for pulling one person's form. A column store is one list per question: great for "average age", useless for "show me Asha's whole form" quickly.</p>
  </div>
  <p><strong>Analytical warehouses</strong> (BigQuery, Snowflake, Redshift, ClickHouse, DuckDB locally) = column store + massively parallel execution (hundreds of machines each scanning a slice). As a data scientist this is your main workplace. It is a bad app backend: slow single-row writes, seconds of latency per query, and a cost per query.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>row store</strong> writes all columns of a row next to each other on disk; a <strong>column store</strong> writes all values of a column next to each other. This is the physical reason behind the OLTP/OLAP split in <a class="xref" data-note="db_intro">What is a Database</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>SELECT *</code> on a column store reads every column and, on BigQuery, you pay per byte scanned. Select only the columns you need.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: ACID, BASE and CAP.</b> Warehouses, wide-column stores and caches all spread data over many machines and keep copies. When copies exist, what exactly is guaranteed about them, and what do we give up?</div>

  <h2 id="dt-acid"><span class="num">10</span>ACID, BASE &amp; CAP</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful refunds Dia's cancelled order: ₹310 must leave Biteful's account and reach Dia's wallet. If the server crashes between the two steps, money vanishes. And once data has copies on several machines, can two copies disagree? What promises does a database make?</p>
  </div>
  <h3>ACID: the promises of a transaction</h3>
  <p>A <strong>transaction</strong> groups both refund steps into one unit. ACID is the list of promises a database makes about it, one per letter. Watch atomicity happen: the second step breaks a rule (a balance may not go negative), so the whole transaction is rolled back and the first step is undone too.</p>
  <div class="fx" data-lang="sql">CREATE TABLE wallets (owner TEXT PRIMARY KEY, balance NUMERIC(8,2) CHECK (balance &gt;= 0));
INSERT INTO wallets VALUES ('biteful', 200), ('Dia', 0);
BEGIN;
UPDATE wallets SET balance = balance + 310 WHERE owner = 'Dia';
UPDATE wallets SET balance = balance - 310 WHERE owner = 'biteful';
ROLLBACK;
SELECT * FROM wallets ORDER BY owner;</div>
  <div class="fx" data-lang="text">CREATE TABLE
INSERT 0 2
BEGIN
UPDATE 1
ERROR:  new row for relation "wallets" violates check constraint "wallets_balance_check"
DETAIL:  Failing row contains (biteful, -110.00).
ROLLBACK
  owner  | balance 
---------+---------
 Dia     |    0.00
 biteful |  200.00
(2 rows)</div>
  <p>Read the output top to bottom. Dia's wallet was credited (UPDATE 1), then debiting ₹310 from Biteful's refund wallet, which holds only ₹200, would leave −110 and violated the CHECK, the transaction became aborted, and after ROLLBACK both wallets are exactly as before: Dia did not keep ₹310 that nobody paid.</p>
  <table class="tbl">
    <tr><th>ACID</th><th>Meaning</th><th>In the refund</th></tr>
    <tr><td><strong>Atomicity</strong></td><td>All steps of a transaction happen, or none do</td><td>credit and debit together, or neither</td></tr>
    <tr><td><strong>Consistency</strong></td><td>Every commit leaves the data valid (constraints hold)</td><td>no balance below zero</td></tr>
    <tr><td><strong>Isolation</strong></td><td>Concurrent transactions don't see each other's half-done work</td><td>a report never sees Dia credited but Biteful not yet debited</td></tr>
    <tr><td><strong>Durability</strong></td><td>Once committed, it survives a crash (the WAL)</td><td>"refund done" can't be undone by a power cut</td></tr>
  </table>
  <p>Many big NoSQL systems keep several copies of the data on different machines (<strong>replicas</strong>) and relax these promises for speed. That style is called <strong>BASE</strong>: <strong>B</strong>asically <strong>A</strong>vailable (it always answers), <strong>S</strong>oft state (a value may be mid-update), <strong>E</strong>ventually consistent (replicas may briefly disagree but converge if writes stop).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>ACID is a refund or bank transfer: money never vanishes mid-way. BASE is a "people ordered this today" counter: if you see 99 and your friend sees 100 for a second, nobody is harmed.</p>
  </div>
  <h3>CAP theorem in plain terms</h3>
  <p>Green Bowl's stock is kept on two replicas, A and B, that sync over the network. One Buddha Bowl is left. The network link breaks. A customer's request reaches replica A: "is a Buddha Bowl available?" Replica A has two choices: say "I can't confirm right now, please wait" (correct but unhelpful), or say "yes" from its last known count (helpful but maybe wrong, because B may have just sold it).</p>
  <p>That is the whole CAP theorem. When the network between replicas breaks (a <strong>partition</strong>, P), each must choose between <strong>C</strong>onsistency (every answer is correct) and <strong>A</strong>vailability (every request gets an answer):</p>
  <figure class="viz"><svg viewBox="0 0 600 215" width="600">
    <defs><marker id="dt-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="300" y="16" text-anchor="middle" font-size="11" class="tm">A client asks Replica A: "is a Buddha Bowl available?"</text>
    <rect x="60" y="30" width="170" height="54" rx="8" class="fb sb"/>
    <text x="145" y="52" text-anchor="middle" font-weight="bold">Replica A</text><text x="145" y="70" text-anchor="middle" font-size="10" class="tm">thinks stock = 1</text>
    <rect x="370" y="30" width="170" height="54" rx="8" class="fb sb"/>
    <text x="455" y="52" text-anchor="middle" font-weight="bold">Replica B</text><text x="455" y="70" text-anchor="middle" font-size="10" class="tm">just sold it: stock = 0</text>
    <line x1="230" y1="57" x2="370" y2="57" stroke="currentColor" stroke-dasharray="5 4"/>
    <circle cx="300" cy="57" r="13" class="fr sr"/><text x="300" y="62" text-anchor="middle" font-weight="bold" class="tr">✗</text>
    <text x="300" y="98" text-anchor="middle" font-size="10" class="tr">network partition</text>
    <g stroke="currentColor" marker-end="url(#dt-ar2)"><line x1="120" y1="84" x2="120" y2="128"/><line x1="170" y1="84" x2="380" y2="128"/></g>
    <rect x="20" y="130" width="260" height="60" rx="8" class="fg sg"/>
    <text x="150" y="152" text-anchor="middle" font-weight="bold">Choose C: refuse</text>
    <text x="150" y="172" text-anchor="middle" font-size="10" class="tm">"try later": correct, unavailable</text>
    <rect x="320" y="130" width="260" height="60" rx="8" class="fv"/>
    <text x="450" y="152" text-anchor="middle" font-weight="bold">Choose A: answer "yes"</text>
    <text x="450" y="172" text-anchor="middle" font-size="10" class="tm">available, but stale (wrong)</text>
  </svg><figcaption>While partitioned you cannot be both correct and always answering. Payments choose C; carts and feeds usually choose A.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ACID</strong>: atomicity, consistency, isolation, durability of transactions. <strong>BASE</strong>: basically available, soft state, eventual consistency. <strong>CAP</strong>: in a distributed system that may suffer network partitions, a request during a partition cannot be guaranteed both a consistent (latest) answer and an answer at all.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "pick 2 of 3"</span>
    <p>CAP only bites <em>during a partition</em>. When the network is healthy you get C and A. The everyday trade-off is latency vs consistency (the <strong>PACELC</strong> extension: "if Partition, A or C; Else, Latency or Consistency"). Many systems are tunable per query: Cassandra and DynamoDB let you choose consistency levels.</p>
  </div>
  <div class="cards">
    <div><b>CP leaning</b><p>Stay correct, may reject requests during a split.</p><small>HBase, ZooKeeper/etcd, Spanner, MongoDB (majority writes)</small></div>
    <div><b>AP leaning</b><p>Always answer, reconcile later.</p><small>Cassandra, DynamoDB (default reads), CouchDB</small></div>
    <div><b>Single node</b><p>No partition between replicas, so CAP doesn't apply.</p><small>One PostgreSQL / MySQL server</small></div>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how to choose.</b> We now know every family and what each promises. Faced with a new Biteful feature, how do we pick?</div>

  <h2 id="dt-choose"><span class="num">11</span>How to Choose</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Eight families, two storage layouts, two styles of guarantee. Given one workload, which questions do we ask, in which order, to land on the right database?</p>
  </div>
  <p>Match the workload (what the data looks like and how it is asked for) to the family whose shape makes that cheap. The table collects everything above into one lookup, with Biteful's own example for each row:</p>
  <table class="tbl">
    <tr><th>Workload</th><th>Biteful example</th><th>Pick</th><th>Why</th></tr>
    <tr><td>Orders, payments, users, inventory</td><td>orders, customers, restaurants</td><td>Relational (PostgreSQL)</td><td>Transactions, constraints, JOINs</td></tr>
    <tr><td>Records with varied attributes</td><td>menus</td><td>Document (MongoDB) or Postgres JSONB</td><td>Flexible shape, read whole object</td></tr>
    <tr><td>Cache, sessions, rate limits, online features</td><td>cart, login session</td><td>Key-value in-memory (Redis)</td><td>Sub-ms lookups by key</td></tr>
    <tr><td>Massive event/IoT write streams, lookup by key</td><td>rider GPS pings</td><td>Wide-column (Cassandra)</td><td>Linear write scaling</td></tr>
    <tr><td>Fraud rings, "friends of friends", recommendations</td><td>referral chains</td><td>Graph (Neo4j)</td><td>Cheap multi-hop traversal</td></tr>
    <tr><td>Metrics, monitoring, sensor data</td><td>delivery minutes per hour</td><td>Time-series (TimescaleDB, InfluxDB)</td><td>Time buckets, retention</td></tr>
    <tr><td>Search box, log search</td><td>"biryani" search</td><td>Search engine (Elasticsearch)</td><td>Inverted index, relevance ranking</td></tr>
    <tr><td>Semantic search, RAG, similar items</td><td>"dishes like this"</td><td>Vector DB or pgvector</td><td>Nearest-neighbour on embeddings</td></tr>
    <tr><td>Dashboards, ad-hoc analytics, training data</td><td>revenue per restaurant per month</td><td>Warehouse (BigQuery, Snowflake)</td><td>Columnar scans over history</td></tr>
  </table>
  <p>Questions to ask, in order:</p>
  <div class="flow"><span>Need multi-row transactions?</span><span>How will you query it (by key? ad hoc?)</span><span>Read/write volume</span><span>Shape fixed or varied?</span><span>Team already runs X?</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Choosing vehicles for a delivery company: scooters for single orders (key-value), vans for bulk restaurant supplies (warehouse), a bus for staff (relational, general-purpose). Nobody uses one vehicle for everything, and nobody buys a truck to carry one dosa.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>workload</strong> is the mix of reads and writes a system must serve: their shape (by key, range, ad hoc, aggregate), rate, size and correctness needs. Database choice is matching workload to data model and guarantees.</p>
  </div>
  <div class="callout intu"><span class="label">Interview answer pattern</span>
    <p>"Default to PostgreSQL. Add a specialist only for a named workload it can't handle well, and accept the cost: another system to run, sync and secure."</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing by popularity or by one benchmark. A database that wins "inserts per second" may be useless for the joins your reports need. Start from the queries you must answer, not from the product.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: polyglot persistence.</b> Biteful's table above already names six different databases. If an order lives in PostgreSQL and its copies in Redis, Elasticsearch and the warehouse, how do all of them stay in sync, and who runs all these servers?</div>

  <h2 id="dt-poly"><span class="num">12</span>Polyglot &amp; Managed Cloud</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Several databases hold copies of the same orders. If the app writes to each one separately and one write fails, the copies disagree. How should the data flow, and does every company have to operate all these systems itself?</p>
  </div>
  <p>"Polyglot" means "speaking many languages". <strong>Polyglot persistence</strong>: one product uses several databases, each for the job it does best. One system (usually the relational DB) stays the <strong>source of truth</strong>, the one copy that is always right; the rest are fed from it. <strong>CDC</strong> (change data capture) is the feed: it reads every change from the main database's write-ahead log and streams it to the others.</p>
  <div class="flow"><span>PostgreSQL (orders = truth)</span><span>CDC stream (Debezium/Kafka)</span><span>Elasticsearch · Redis · Warehouse · Vector DB</span></div>
  <table class="tbl">
    <tr><th>Biteful feature</th><th>Database</th></tr>
    <tr><td>Checkout, orders, payments, refunds</td><td>PostgreSQL (ACID)</td></tr>
    <tr><td>Cart, login sessions, "recently viewed"</td><td>Redis</td></tr>
    <tr><td>Dish search box with typo tolerance and filters</td><td>Elasticsearch / OpenSearch</td></tr>
    <tr><td>"Dishes like this" from text/image embeddings</td><td>pgvector or Pinecone</td></tr>
    <tr><td>Referral fraud ring detection</td><td>Neo4j</td></tr>
    <tr><td>Rider GPS trail</td><td>Cassandra (or a time-series DB)</td></tr>
    <tr><td>Revenue dashboards, model training sets</td><td>Snowflake / BigQuery</td></tr>
    <tr><td>Real-time features for the recommender at inference</td><td>Redis or DynamoDB (online feature store)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing to two databases separately from the app ("dual writes") lets them drift when one write fails. Write once to the source of truth and propagate via CDC.</p>
  </div>
  <h3>Managed cloud equivalents</h3>
  <p>"Managed" means the cloud company installs, backs up, patches and scales the database for you; you just connect to it. Job descriptions name these products, so map each one back to its family:</p>
  <table class="tbl">
    <tr><th>Type</th><th>AWS</th><th>GCP</th><th>Azure / other</th></tr>
    <tr><td>Relational</td><td>RDS (Postgres/MySQL), Aurora</td><td>Cloud SQL, AlloyDB, Spanner</td><td>Azure SQL, Azure Database for PostgreSQL</td></tr>
    <tr><td>Key-value / document</td><td>DynamoDB, DocumentDB</td><td>Firestore, Bigtable (wide-column)</td><td>Cosmos DB, MongoDB Atlas</td></tr>
    <tr><td>Cache</td><td>ElastiCache (Redis)</td><td>Memorystore</td><td>Azure Cache for Redis</td></tr>
    <tr><td>Warehouse</td><td>Redshift</td><td>BigQuery</td><td>Snowflake, Databricks SQL, Synapse</td></tr>
    <tr><td>Search</td><td>OpenSearch Service</td><td>Vertex AI Search</td><td>Elastic Cloud</td></tr>
  </table>
  <ul>
    <li><strong>RDS</strong>: AWS runs standard Postgres/MySQL for you (backups, patches, replicas). <strong>Aurora</strong>: AWS's re-engineered, Postgres/MySQL-compatible engine with shared distributed storage and faster failover.</li>
    <li><strong>DynamoDB</strong>: serverless key-value/document store; single-digit-ms at any scale, but you must design around access patterns (partition + sort key).</li>
    <li><strong>Redshift</strong>: columnar warehouse on clusters (now also serverless). <strong>BigQuery</strong>: serverless; pay per bytes scanned or reserved slots. <strong>Snowflake</strong>: runs on any cloud; storage and compute ("warehouses") scale and bill separately.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A newspaper: one newsroom (source of truth) writes each story once; printing presses, the website, the app and the archive all receive copies from it. Reporters never type the same story into five systems.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Polyglot persistence</strong> uses several specialised data stores in one system, with a single <strong>source of truth</strong> and derived copies kept in sync, typically by <strong>CDC</strong> reading the source's change log. A <strong>managed</strong> database is operated by a cloud provider.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> Let's see every family as one picture: what each is built from, which Biteful question it answers, and when to reach for it.</div>

  <h2 id="dt-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Eight families plus warehouses, ACID and CAP: are these unrelated products, or one idea applied in different directions?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 300" width="700">
<defs><marker id="dt-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="260" y="10" width="180" height="44" rx="8" class="fb sb"/><text x="350" y="29" text-anchor="middle" font-size="12" font-weight="700">Relational (truth)</text><text x="350" y="45" text-anchor="middle" class="tm" font-size="10">orders, JOINs, ACID</text>
<g stroke="currentColor" marker-end="url(#dt-a9)">
<line x1="280" y1="54" x2="80" y2="98"/><line x1="310" y1="54" x2="215" y2="98"/><line x1="350" y1="54" x2="350" y2="98"/><line x1="390" y1="54" x2="485" y2="98"/><line x1="420" y1="54" x2="620" y2="98"/>
</g>
<text x="350" y="76" text-anchor="middle" class="tm" font-size="9.5">relax one thing to gain another</text>
<rect x="10" y="100" width="140" height="50" rx="7" class="fv"/><text x="80" y="119" text-anchor="middle" font-size="11" font-weight="700">Document</text><text x="80" y="135" text-anchor="middle" class="tm" font-size="9.5">drop fixed columns</text>
<rect x="160" y="100" width="110" height="50" rx="7" class="fv"/><text x="215" y="119" text-anchor="middle" font-size="11" font-weight="700">Key-value</text><text x="215" y="135" text-anchor="middle" class="tm" font-size="9.5">drop queries</text>
<rect x="280" y="100" width="140" height="50" rx="7" class="fv"/><text x="350" y="119" text-anchor="middle" font-size="11" font-weight="700">Wide-column</text><text x="350" y="135" text-anchor="middle" class="tm" font-size="9.5">drop joins, add machines</text>
<rect x="430" y="100" width="110" height="50" rx="7" class="fv"/><text x="485" y="119" text-anchor="middle" font-size="11" font-weight="700">Graph</text><text x="485" y="135" text-anchor="middle" class="tm" font-size="9.5">edges as pointers</text>
<rect x="550" y="100" width="140" height="50" rx="7" class="fv"/><text x="620" y="119" text-anchor="middle" font-size="11" font-weight="700">Time-series</text><text x="620" y="135" text-anchor="middle" class="tm" font-size="9.5">drop updates, add buckets</text>
<line x1="350" y1="150" x2="350" y2="186" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#dt-a9)"/><text x="358" y="172" class="tm" font-size="9.5">CDC copies from the WAL</text>
<rect x="60" y="188" width="170" height="50" rx="7" class="fg sg"/><text x="145" y="207" text-anchor="middle" font-size="11" font-weight="700">Search</text><text x="145" y="223" text-anchor="middle" class="tm" font-size="9.5">inverted index: words</text>
<rect x="265" y="188" width="170" height="50" rx="7" class="fg sg"/><text x="350" y="207" text-anchor="middle" font-size="11" font-weight="700">Vector</text><text x="350" y="223" text-anchor="middle" class="tm" font-size="9.5">ANN index: meaning</text>
<rect x="470" y="188" width="170" height="50" rx="7" class="fg sg"/><text x="555" y="207" text-anchor="middle" font-size="11" font-weight="700">Warehouse</text><text x="555" y="223" text-anchor="middle" class="tm" font-size="9.5">column store: scans</text>
<text x="350" y="265" text-anchor="middle" class="tm" font-size="10.5">Across all of them: ACID (one node, strict) ↔ BASE (many replicas, eventual); CAP decides behaviour during a network split</text>
<text x="350" y="285" text-anchor="middle" class="tm" font-size="10.5">Top row: different ways to STORE the truth's data. Bottom row: derived COPIES, each indexed for one kind of question.</text>
</svg><figcaption>Every family starts from the relational baseline and gives something up (fixed columns, queries, joins, updates) to gain something (flexibility, speed, write scale, cheap hops, time buckets). Search, vector and warehouse are usually copies of the truth, re-indexed for one question.</figcaption></figure>
  <table class="tbl"><caption>Every family on Biteful's data</caption>
    <tr><th>Family</th><th>Built from</th><th>Answers which question</th><th>On Biteful (this page)</th><th>Use when / avoid when</th></tr>
    <tr><td>Relational</td><td>tables + keys + JOIN + ACID</td><td>linked facts, ad-hoc questions</td><td>order 109 = Farah, Biryani Bros, ₹600</td><td>default / write scale-out, wild shapes</td></tr>
    <tr><td>Document</td><td>JSON per record, nested</td><td>varied shapes, whole object reads</td><td>Filter Coffee has no spice → NULL</td><td>menus, profiles / many-to-many analytics</td></tr>
    <tr><td>Key-value</td><td>hash map, often in RAM</td><td>get by exact key, instantly</td><td>GET cart:asha; INCR views → 2</td><td>cache, sessions / any filter or aggregate</td></tr>
    <tr><td>Wide-column</td><td>partition key + clustering key</td><td>write firehose, read one partition</td><td>pings per (rider, day), sorted by ts</td><td>GPS, events / ad-hoc queries, joins</td></tr>
    <tr><td>Graph</td><td>nodes + edges as pointers</td><td>multi-hop paths</td><td>Asha → Ben, Chen → Farah (3 rounds)</td><td>fraud, recs / bulk aggregates</td></tr>
    <tr><td>Time-series</td><td>time-partitioned appends</td><td>per-bucket metrics, retention</td><td>avg minutes 3 Mar = NULL (none measured)</td><td>metrics / updates, entity joins</td></tr>
    <tr><td>Search</td><td>inverted index + BM25</td><td>which docs contain these words?</td><td>"chicken biryani": 2 vs 1 match</td><td>search box, logs / source of truth</td></tr>
    <tr><td>Vector</td><td>embeddings + ANN index</td><td>what is similar in meaning?</td><td>Veg Biryani 0.990 to Chicken Biryani</td><td>RAG, similar items / exact filters</td></tr>
    <tr><td>Column store</td><td>columns stored apart, compressed</td><td>aggregate few columns over many rows</td><td>status scan: 10 values vs 70</td><td>analytics / single-row writes</td></tr>
    <tr><td>ACID vs BASE</td><td>transactions vs replicas</td><td>what is guaranteed?</td><td>refund rolled back as one unit</td><td>money ACID; counters BASE</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>the way data is laid out decides which question is cheap.</strong> Tables make joins cheap, documents make whole-object reads cheap, hash maps make key lookups cheap, partitions make writes cheap, pointers make hops cheap, inverted indexes make word lookups cheap, vectors make "similar" cheap, and columns make scans cheap. Every gain is paid for with a question that becomes expensive. So start from the questions, keep one source of truth, and copy data into other shapes only for named questions.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="dt-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <strong>Biteful</strong>, a food-delivery company (tables customers, restaurants, orders, order_items in PostgreSQL), growing new needs: menus, carts, rider GPS, referrals, delivery metrics, search, "dishes like this", analytics.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Family / idea</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Relational</td><td>linked facts?</td><td>JOIN order 109 → Farah, Biryani Bros</td><td>menus vary → document</td></tr>
    <tr><td>Document</td><td>varying shapes?</td><td>JSONB menu, missing field → NULL</td><td>too slow per tap → key-value</td></tr>
    <tr><td>Key-value</td><td>get by key instantly?</td><td>Redis GET cart:asha, INCR views</td><td>one machine's writes → wide-column</td></tr>
    <tr><td>Wide-column</td><td>write firehose over many machines?</td><td>rider pings partitioned by (rider, day)</td><td>no joins/hops → graph</td></tr>
    <tr><td>Graph</td><td>multi-hop paths?</td><td>referral tree in 3 rounds</td><td>metrics by time → time-series</td></tr>
    <tr><td>Time-series</td><td>per-bucket metrics?</td><td>avg delivery minutes per day</td><td>word search → search</td></tr>
    <tr><td>Search</td><td>which dishes contain these words?</td><td>inverted index, 2 vs 1 match</td><td>meaning, not words → vector</td></tr>
    <tr><td>Vector</td><td>similar in meaning?</td><td>cosine 0.990 Veg vs Chicken Biryani</td><td>analytics speed → columns</td></tr>
    <tr><td>Row vs column</td><td>why are warehouses fast?</td><td>10 values vs 70</td><td>copies → guarantees</td></tr>
    <tr><td>ACID / BASE / CAP</td><td>what is promised?</td><td>refund rolled back; Buddha Bowl replicas</td><td>→ choose</td></tr>
    <tr><td>Choosing</td><td>workload → family?</td><td>9-row lookup table</td><td>several at once → polyglot</td></tr>
    <tr><td>Polyglot + CDC</td><td>keep copies in sync?</td><td>Postgres → CDC → Redis, ES, warehouse</td><td>→ <a class="xref" data-note="sql_relational">Relational Model</a></td></tr>
  </table>
  <h3>Key formulas and rules</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / meaning</th></tr>
    <tr><td>Cosine similarity</td><td>cos(a, b) = (a · b) / (|a| |b|)</td><td>a · b = Σ aᵢbᵢ (dot product); |a| = √(Σ aᵢ²) (length); 1 = same direction, 0 = unrelated</td></tr>
    <tr><td>Column-store saving</td><td>values read ≈ rows × (columns needed) instead of rows × (all columns)</td><td>Biteful: 10 × 1 = 10 vs 10 × 7 = 70</td></tr>
    <tr><td>Wide-column key</td><td>PRIMARY KEY ((partition cols), clustering cols)</td><td>partition picks the machine; clustering sorts inside it</td></tr>
    <tr><td>CAP</td><td>during a partition: Consistency or Availability</td><td>healthy network: both; trade latency vs consistency (PACELC)</td></tr>
    <tr><td>ACID</td><td>Atomic, Consistent, Isolated, Durable</td><td>all-or-nothing; rules hold; no half-done reads; survives crash</td></tr>
    <tr><td>BASE</td><td>Basically Available, Soft state, Eventually consistent</td><td>replicas may disagree briefly, then converge</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Relational</b><p>Orders, payments, anything with rules, links and ad-hoc questions.</p><small>Avoid: extreme write scale-out, wildly varying shapes</small></div>
    <div><b>Document</b><p>Menus, catalogues, profiles read as a whole.</p><small>Avoid: many-to-many, cross-document reports</small></div>
    <div><b>Key-value</b><p>Carts, sessions, caches, counters, online features.</p><small>Avoid: anything not by key; source of truth</small></div>
    <div><b>Wide-column</b><p>Huge append streams read by key and time.</p><small>Avoid: ad-hoc queries and joins</small></div>
    <div><b>Graph</b><p>Deep, variable hops: fraud rings, recommendations.</p><small>Avoid: bulk aggregation</small></div>
    <div><b>Time-series</b><p>Metrics, monitoring, sensors with retention.</p><small>Avoid: updates, entity relationships</small></div>
    <div><b>Search / vector</b><p>Words (search box) / meaning (RAG, similar items).</p><small>Avoid: as source of truth; exact transactional filters</small></div>
    <div><b>Warehouse</b><p>Dashboards, history, training sets.</p><small>Avoid: as an app backend</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>"Wide-column" ≠ "columnar"; "schemaless" means the schema moved into code; Redis as source of truth; KEYS on a busy server; CAP as "pick 2 of 3"; dual writes instead of CDC; <code>SELECT *</code> on a pay-per-byte warehouse; a graph DB for a one-hop question; averages of averages in time buckets; choosing by popularity instead of by the queries you must answer.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Shopping cart, dish search box, monthly revenue report: one family each?</td><td>Key-value (Redis); search engine (Elasticsearch); columnar warehouse.</td></tr>
    <tr><td>Cassandra vs BigQuery: which is "wide-column" and which is "columnar"?</td><td>Cassandra is wide-column (rows grouped by partition key, write-optimised); BigQuery is columnar (columns stored apart, scan-optimised).</td></tr>
    <tr><td>Cosine of (1, 0) and (0, 1)?</td><td>0: dot product 0, unrelated directions.</td></tr>
    <tr><td>During a network partition, a payments service should prefer C or A?</td><td>C: refuse rather than risk a wrong balance.</td></tr>
    <tr><td>A table has 40 columns; a query needs 2. Roughly how much less does a column store read?</td><td>About 20 times less (2 of 40 columns), before compression.</td></tr>
  </table>

  <h2 id="dt-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you justify a database choice out loud, naming the question it makes cheap and the one it makes expensive?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line each: which family would you use for a shopping cart, a dish search box, and monthly revenue reports?</summary><div class="qa-body">Cart: key-value (Redis), lookups by user key, sub-millisecond. Search box: search engine (Elasticsearch), inverted index with ranking. Monthly reports: columnar warehouse (BigQuery/Snowflake), scans a few columns over all history.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the CAP theorem. Does it mean every database picks two of three?</summary><div class="qa-body">When a network partition splits replicas, each side must either reject requests (consistency) or answer with possibly stale data (availability). Partitions can't be ruled out, so the real choice is C or A <em>during a partition</em>. When the network is healthy, a system can be both; the day-to-day trade-off is latency vs consistency (PACELC).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between a wide-column store and a columnar warehouse?</summary><div class="qa-body">Wide-column (Cassandra, Bigtable) groups rows by partition key; it's built for fast writes and key lookups. Columnar (BigQuery, Redshift) stores each column contiguously; it's built for scanning and aggregating a few columns over billions of rows. Similar names, opposite workloads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>SELECT SUM(amount) FROM orders</code> much faster in Snowflake than in PostgreSQL on 2 billion rows?</summary><div class="qa-body">Snowflake is a column store: it reads only the compressed <code>amount</code> column, skips blocks using min/max metadata, and runs in parallel across many nodes. PostgreSQL is a row store: it reads every full row from disk to get one field, on one machine (with limited parallel workers). Our toy version: 10 values vs 70.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ACID vs BASE: give one workload for each.</summary><div class="qa-body">ACID: refunds, payments, decrementing stock at checkout; a partial or conflicting result is unacceptable (our refund rolled back as one unit). BASE: like counts, view counts, a social feed; brief disagreement between replicas is fine and staying available matters more.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team wants to use MongoDB "because it's schemaless and faster". What do you ask?</summary><div class="qa-body">How will the data be queried? If it's relational (orders ↔ customers ↔ restaurants) and needs ad-hoc reporting, Postgres fits better. Is the shape truly variable? Postgres JSONB handles that too (we queried a menu document). Do we need multi-document transactions? Faster for what: single-object reads by id, or analytics? The schema still exists, just in application code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use a graph database over SQL?</summary><div class="qa-body">When questions are about paths of unknown or deep length: "accounts within 3 hops sharing a device with a known fraudster", "friends of friends". In SQL each hop is another self-join or a round of a recursive CTE (Asha's referral tree took 3 rounds over the whole table), which gets slow and awkward at depth. A graph DB follows edges directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Redis a database or a cache? Can it lose data?</summary><div class="qa-body">It's an in-memory key-value database, most often used as a cache. It can persist with RDB snapshots or an append-only file, but with default settings a crash can lose recent writes (up to the last snapshot, or about a second with AOF everysec). Keep the source of truth elsewhere.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You're building RAG over 200k internal documents and already run PostgreSQL. Which vector store?</summary><div class="qa-body">Start with <code>pgvector</code> plus an HNSW index. 200k vectors is small, and you keep one system, SQL filters, JOINs to metadata and transactions. Move to a dedicated vector DB (Pinecone, Qdrant, Milvus) if you hit hundreds of millions of vectors or very high query rates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RDS vs Aurora vs DynamoDB: one line each.</summary><div class="qa-body">RDS: managed standard Postgres/MySQL. Aurora: AWS's Postgres/MySQL-compatible engine with distributed storage, faster replicas and failover. DynamoDB: serverless key-value/document store with predictable millisecond latency, but queries must follow designed key access patterns; no JOINs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't you point your dashboards at the production PostgreSQL?</summary><div class="qa-body">Big analytical scans compete with live transactions for CPU, memory and I/O, slowing the app. Row storage is also inefficient for wide aggregates. Replicate to a read replica (short term) or a columnar warehouse (proper fix).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a search engine need the relational database at all?</summary><div class="qa-body">Because it is a copy, built for one question (which documents contain these words). It can lag, lose writes on a crash and has no transactions or constraints. The truth (which dishes exist, at what price) lives in PostgreSQL, and CDC streams every change into the search index. If they disagree, the database wins and the index is rebuilt.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the partition key when designing a Cassandra table?</summary><div class="qa-body">The partition key is how Cassandra knows which machine holds a row. A query that doesn't name it can't be sent to one node, so it must visit every node (a full scan), which Cassandra refuses by default. That's why you design one table per query: the query's filter decides the partition key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do the WAL from the previous page and CDC on this page relate?</summary><div class="qa-body">The WAL is PostgreSQL's ordered log of every change, written for crash safety. CDC tools (Debezium) read that same log and publish each change as an event, which keeps Redis, Elasticsearch and the warehouse in sync. One mechanism gives durability and replication.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do column stores and OLAP go together, and row stores and OLTP?</summary><div class="qa-body">OLTP touches whole rows (insert order 111, fetch order 109): a row store has all of a row's values in one place, so one page read does it. OLAP touches a few columns of many rows (sum of amount): a column store reads only those columns, compressed. Each layout makes its workload's common access cheap and the other's expensive.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="sql_relational">Relational Model &amp; PostgreSQL</a>.</b> The relational database is the source of truth everything else is copied from. But why exactly is Biteful split into four tables instead of one sheet, how do keys tie them together, and which types and rules should each column have?</div>
</main>`
});
