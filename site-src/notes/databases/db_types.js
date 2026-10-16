// notes/databases/db_types.js — Types of Databases
Object.assign(TOPIC_CONTENT, {
  "db_types": `<main>
  <h1>Types of Databases</h1>
  <p class="lead">Each database family stores data in a different shape, and the shape decides what is fast and what is painful. Know the shapes, the trade-offs (ACID, CAP, row vs column) and how to pick one for a workload.</p>

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
          <li>💡 <b>Filing cabinet</b> — one folder per order</li>
          <li><b>Key-value</b> — giant dictionary, value is opaque (Redis, DynamoDB)</li>
          <li><b>Uses</b> — cache, sessions, rate limits, counters, online features</li>
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
          <li><b>Graph uses</b> — fraud rings, friends-of-friends, recommendations</li>
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
          <li><b>Compression</b> — high in columns (run-length, dictionary)</li>
          <li><b>Warehouses</b> — BigQuery, Snowflake, Redshift, ClickHouse, DuckDB</li>
          <li>💡 forms stack vs one list per question</li>
          <li>⚠ <code>SELECT *</code> on BigQuery reads every column, billed per byte</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ACID, BASE, CAP</div>
        <ul>
          <li><b>ACID</b> — Atomic (all or none), Consistent (rules hold), Isolated, Durable</li>
          <li><b>BASE</b> — Basically Available, Soft state, Eventually consistent</li>
          <li>💡 bank transfer (ACID) vs like counter (BASE)</li>
          <li><b>CAP</b> — during a network partition choose Consistency (refuse) or Availability (maybe stale)</li>
          <li>⚠ not "pick 2 of 3": healthy network → both; daily trade = latency vs consistency (PACELC)</li>
          <li><b>CP</b> — HBase, etcd, Spanner · <b>AP</b> — Cassandra, DynamoDB · single node: CAP n/a</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing + polyglot</div>
        <ul>
          <li><b>Ask</b> — transactions? query pattern? volume? shape fixed? team knows X?</li>
          <li><b>Map</b> — orders → Postgres, cache → Redis, events → Cassandra, fraud → Neo4j, search → ES, RAG → vector, BI → warehouse</li>
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
      <div class="rm-item rm-done" data-target="dt-rel"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Relational</span><span class="rm-sub">Tables, keys, JOINs</span></div></div>
      <div class="rm-item rm-done" data-target="dt-doc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Document &amp; Key-Value</span><span class="rm-sub">JSON blobs and giant dictionaries</span></div></div>
      <div class="rm-item rm-done" data-target="dt-wide"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Wide-Column &amp; Graph</span><span class="rm-sub">Write firehoses and relationships</span></div></div>
      <div class="rm-item rm-done" data-target="dt-special"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Time-Series, Search, Vector</span><span class="rm-sub">Specialists for one job</span></div></div>
      <div class="rm-item rm-done" data-target="dt-col"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Row vs Column Stores</span><span class="rm-sub">Why warehouses scan fast</span></div></div>
      <div class="rm-item rm-done" data-target="dt-acid"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">ACID, BASE &amp; CAP</span><span class="rm-sub">The guarantees you trade</span></div></div>
      <div class="rm-item rm-done" data-target="dt-choose"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">How to Choose</span><span class="rm-sub">Workload → database</span></div></div>
      <div class="rm-item rm-done" data-target="dt-poly"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Polyglot &amp; Managed Cloud</span><span class="rm-sub">Many DBs, one product</span></div></div>
      <div class="rm-item rm-done" data-target="dt-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dt-rel"><span class="num">01</span>Relational</h2>
  <figure class="viz"><svg viewBox="0 0 600 215" width="600">
    <defs><marker id="dt-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g font-size="10">
    <text x="75" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Relational</text>
    <text x="15" y="42" class="tm">orders</text><text x="88" y="42" class="tm">customers</text>
    <rect x="15" y="50" width="56" height="20" rx="3" class="fb"/><text x="22" y="64">100 │ 1</text>
    <rect x="15" y="74" width="56" height="20" rx="3" class="fb"/><text x="22" y="88">102 │ 2</text>
    <rect x="88" y="50" width="56" height="20" rx="3" class="ft"/><text x="94" y="64">1 Asha</text>
    <rect x="88" y="74" width="56" height="20" rx="3" class="ft"/><text x="94" y="88">2 Ben</text>
    <g stroke="currentColor" marker-end="url(#dt-ar1)"><line x1="71" y1="60" x2="86" y2="60"/><line x1="71" y1="84" x2="86" y2="84"/></g>
    <text x="232" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Document</text>
    <rect x="165" y="35" width="135" height="100" rx="6" class="fs"/>
    <text x="173" y="54">{ _id: 100,</text><text x="173" y="70">  cust: {name:</text><text x="173" y="86">    "Asha"},</text><text x="173" y="102">  items: [Laptop,</text><text x="173" y="118">    Lamp] }</text>
    <text x="380" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Key-value</text>
    <rect x="315" y="40" width="58" height="22" rx="3" class="fv"/><text x="321" y="55">s:8f3a</text><rect x="390" y="40" width="55" height="22" rx="3" class="fs"/><text x="396" y="55">{cart}</text>
    <rect x="315" y="72" width="58" height="22" rx="3" class="fv"/><text x="321" y="87">views</text><rect x="390" y="72" width="55" height="22" rx="3" class="fs"/><text x="396" y="87">42</text>
    <rect x="315" y="104" width="58" height="22" rx="3" class="fv"/><text x="321" y="119">rate:1</text><rect x="390" y="104" width="55" height="22" rx="3" class="fs"/><text x="396" y="119">7</text>
    <g stroke="currentColor" marker-end="url(#dt-ar1)"><line x1="373" y1="51" x2="388" y2="51"/><line x1="373" y1="83" x2="388" y2="83"/><line x1="373" y1="115" x2="388" y2="115"/></g>
    <text x="527" y="18" text-anchor="middle" font-weight="bold" font-size="12" class="tb">Graph</text>
    <g stroke="currentColor" marker-end="url(#dt-ar1)"><line x1="502" y1="60" x2="545" y2="88"/><line x1="502" y1="138" x2="545" y2="112"/></g>
    <circle cx="485" cy="52" r="20" class="fb"/><text x="485" y="56" text-anchor="middle">Asha</text>
    <circle cx="485" cy="145" r="20" class="fb"/><text x="485" y="149" text-anchor="middle">Chen</text>
    <circle cx="565" cy="100" r="22" class="fg"/><text x="565" y="104" text-anchor="middle">Lamp</text>
    <text x="530" y="66" class="tm" font-size="9">BOUGHT</text>
    <text x="75" y="190" text-anchor="middle" class="tm">JOIN on keys</text>
    <text x="232" y="190" text-anchor="middle" class="tm">whole object, 1 read</text>
    <text x="380" y="190" text-anchor="middle" class="tm">get by key only</text>
    <text x="527" y="190" text-anchor="middle" class="tm">follow edges</text>
    </g>
  </svg><figcaption>The same shop data in four shapes. The shape decides which questions are cheap.</figcaption></figure>
  <p><strong>Tables</strong> with fixed columns, linked by <strong>keys</strong>, combined with JOINs at query time. Each fact lives once: order 100 stores only <code>customer_id = 1</code>.</p>
  <div class="fx" data-lang="sql">SELECT o.order_id, o.customer_id, c.name, c.city, o.status
FROM orders o JOIN customers c ON c.customer_id = o.customer_id
WHERE o.order_id = 100;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer_id</th><th>name</th><th>city</th><th>status</th></tr><tr><td>100</td><td>1</td><td>Asha</td><td>Mumbai</td><td>delivered</td></tr></table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A set of linked spreadsheets with strict rules. Each fact is written once; other sheets refer to it by id instead of copying it.</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> ad-hoc queries, JOINs, strong transactions, data integrity (constraints).</li>
    <li><strong>Bad at:</strong> scaling writes across many machines; data whose shape changes every week.</li>
    <li><strong>Products:</strong> PostgreSQL, MySQL, SQLite, SQL Server, Oracle. Distributed SQL ("NewSQL"): CockroachDB, Google Spanner.</li>
  </ul>

  <h2 id="dt-doc"><span class="num">02</span>Document &amp; Key-Value</h2>
  <h3>Document</h3>
  <p>Each record is a self-contained <strong>JSON-like document</strong>. Fields can differ between documents and can nest.</p>
  <div class="fx" data-lang="js">// one order, with its items embedded (no JOIN needed to read it)
{ "_id": 100, "customer": { "id": 1, "name": "Asha" },
  "status": "delivered",
  "items": [ { "product": "Laptop", "qty": 1, "price": 800 },
             { "product": "Lamp",   "qty": 2, "price": 40 } ] }</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A filing cabinet of folders. Everything about one order is in one folder. Fast to grab one folder; slow to ask "total Lamp sales across all folders".</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> reading/writing a whole object in one go; evolving or varied schemas (product catalogs, user profiles, CMS).</li>
    <li><strong>Bad at:</strong> many-to-many relationships and cross-document analytics. Duplicated data (Asha's name in every order) goes stale.</li>
    <li><strong>Products:</strong> MongoDB, Couchbase, Firestore, Amazon DocumentDB. PostgreSQL <code>JSONB</code> covers many of the same cases.</li>
  </ul>
  <h3>Key-value (and in-memory)</h3>
  <p>A giant <strong>dictionary</strong>: you give a key, you get a value. The database doesn't look inside the value.</p>
  <div class="fx" data-lang="text">SET session:8f3a  "{user_id: 1, cart: [10, 13]}"   EX 1800
GET session:8f3a
INCR page_views:product:10</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A coat check. Hand over ticket 42, get coat 42 back instantly. Ask "which coats are red?" and the attendant has to check every hook.</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> sub-millisecond lookups by key: caches, sessions, rate limiters, counters, leaderboards, online feature serving.</li>
    <li><strong>Bad at:</strong> any query not by key (filter, range, JOIN, aggregate).</li>
    <li><strong>Products:</strong> Redis, Memcached, Amazon DynamoDB, etcd.</li>
  </ul>
  <div class="callout intu"><span class="label">In-memory is a property, not a family</span>
    <p><strong>In-memory</strong> = data in RAM, microsecond reads. Redis can persist (snapshots, append-only log), but a crash can lose the last writes: use it as a cache, not the source of truth.</p>
  </div>

  <h2 id="dt-wide"><span class="num">03</span>Wide-Column &amp; Graph</h2>
  <h3>Wide-column</h3>
  <p>Rows are grouped by a <strong>partition key</strong> and sorted by a <strong>clustering key</strong> inside each partition. Built for huge, constant write volume across many machines.</p>
  <div class="fx" data-lang="sql">-- Cassandra CQL: one partition per sensor per day, rows sorted by time
CREATE TABLE readings (
  sensor_id text, day date, ts timestamp, temp float,
  PRIMARY KEY ((sensor_id, day), ts)
);
-- partition ('s-7', 2024-05-01): ts=10:00 temp=21.4 | ts=10:01 temp=21.6 | ...</div>
  <ul>
    <li><strong>Great at:</strong> millions of writes per second, linear scaling by adding nodes, "latest N events for key X".</li>
    <li><strong>Bad at:</strong> queries not on the partition key, JOINs, ad-hoc analytics. You design one table <em>per query</em>.</li>
    <li><strong>Products:</strong> Apache Cassandra, ScyllaDB, HBase, Google Bigtable.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Wide-column" is <em>not</em> "columnar". Cassandra stores rows grouped by key (good for writes). Columnar warehouses store each column separately (good for scans). Interviewers love this mix-up.</p>
  </div>
  <h3>Graph</h3>
  <p>Data is <strong>nodes</strong> (things) and <strong>edges</strong> (relationships), and both can have properties. Following an edge is a pointer hop, not a JOIN.</p>
  <div class="fx" data-lang="text">(:Customer {name:'Asha'})-[:BOUGHT {qty:2}]-&gt;(:Product {name:'Lamp'})

// Cypher: people who bought what Asha bought (2 hops)
MATCH (a:Customer {name:'Asha'})-[:BOUGHT]-&gt;(p)&lt;-[:BOUGHT]-(other)
RETURN DISTINCT other.name</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A detective's corkboard with photos and string. "Friends of friends of the suspect" means following string, not cross-referencing lists.</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> multi-hop questions: fraud rings, recommendations, social networks, knowledge graphs.</li>
    <li><strong>Bad at:</strong> bulk aggregation ("revenue per month"), very high write throughput.</li>
    <li><strong>Products:</strong> Neo4j, Amazon Neptune, TigerGraph, ArangoDB.</li>
  </ul>

  <h2 id="dt-special"><span class="num">04</span>Time-Series, Search, Vector</h2>
  <h3>Time-series</h3>
  <p>Records are <strong>(timestamp, tags, values)</strong>, appended in time order and almost never updated.</p>
  <div class="fx" data-lang="text">cpu,host=web-1,region=ap-south usage=63.2 1714557600000000000</div>
  <ul>
    <li><strong>Great at:</strong> high-rate appends, time-bucket aggregates (avg per minute), automatic downsampling and retention ("drop raw data after 30 days").</li>
    <li><strong>Bad at:</strong> updates, relational queries across entities.</li>
    <li><strong>Products:</strong> TimescaleDB (a PostgreSQL extension), InfluxDB, Prometheus, QuestDB.</li>
  </ul>
  <h3>Search engine</h3>
  <p>Stores documents plus an <strong>inverted index</strong>: a map from each word to the documents containing it. Results are ranked by relevance (BM25).</p>
  <div class="fx" data-lang="text">"lamp"  -&gt; [doc 13, doc 57, doc 902]
"desk"  -&gt; [doc 12, doc 57]
query "desk lamp" -&gt; doc 57 ranks first (matches both)</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The index at the back of a textbook: look up a word, get every page it appears on.</p>
  </div>
  <ul>
    <li><strong>Great at:</strong> full-text search, typo tolerance, facets ("Brand: 3, Price: 4"), log search.</li>
    <li><strong>Bad at:</strong> being the source of truth. It's usually fed from the main DB and can lag or lose writes.</li>
    <li><strong>Products:</strong> Elasticsearch, OpenSearch, Solr; Algolia, Typesense for app search.</li>
  </ul>
  <h3>Vector</h3>
  <p>Stores <strong>embeddings</strong> (lists of numbers that capture meaning) and finds the nearest ones to a query vector.</p>
  <div class="fx" data-lang="js">{ "id": "prod-13", "embedding": [0.12, -0.53, 0.88, ...],   // e.g. 768 numbers
  "metadata": { "name": "Lamp", "category": "Furniture" } }</div>
  <ul>
    <li><strong>Great at:</strong> semantic search, RAG retrieval for LLMs, "similar items", de-duplication. Uses <strong>ANN</strong> (approximate nearest neighbour) indexes like HNSW, trading a little recall for huge speed.</li>
    <li><strong>Bad at:</strong> exact filters and transactions (most add metadata filtering, with varying quality).</li>
    <li><strong>Products:</strong> Pinecone, Weaviate, Milvus, Qdrant, Chroma; <code>pgvector</code> in PostgreSQL.</li>
  </ul>
  <div class="callout intu"><span class="label">Practical default</span>
    <p>Under a few million vectors, <code>pgvector</code> inside your existing PostgreSQL is usually enough. A dedicated vector DB pays off at large scale or very high query rates.</p>
  </div>

  <h2 id="dt-col"><span class="num">05</span>Row vs Column Stores</h2>
  <p>Same <code>orders</code> table, two disk layouts. Query: <em>count orders by status</em>.</p>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600">
    <g font-size="10">
      <rect x="40" y="6" width="12" height="12" class="fb"/><text x="57" y="16">order_id</text>
      <rect x="150" y="6" width="12" height="12" class="ft"/><text x="167" y="16">customer_id</text>
      <rect x="280" y="6" width="12" height="12" class="fv"/><text x="297" y="16">order_date</text>
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
    <text x="300" y="110" text-anchor="middle" class="tr">reads all 20 values to get 5 statuses</text>
    <text x="40" y="142" font-weight="bold">Column store <tspan class="tm" font-weight="normal">(BigQuery): column after column</tspan></text>
    <g stroke="currentColor" stroke-opacity="0.35">
      <rect x="40" y="150" width="25" height="28" class="fb"/><rect x="65" y="150" width="25" height="28" class="fb"/><rect x="90" y="150" width="25" height="28" class="fb"/><rect x="115" y="150" width="25" height="28" class="fb"/><rect x="140" y="150" width="25" height="28" class="fb"/>
      <rect x="170" y="150" width="25" height="28" class="ft"/><rect x="195" y="150" width="25" height="28" class="ft"/><rect x="220" y="150" width="25" height="28" class="ft"/><rect x="245" y="150" width="25" height="28" class="ft"/><rect x="270" y="150" width="25" height="28" class="ft"/>
      <rect x="300" y="150" width="25" height="28" class="fv"/><rect x="325" y="150" width="25" height="28" class="fv"/><rect x="350" y="150" width="25" height="28" class="fv"/><rect x="375" y="150" width="25" height="28" class="fv"/><rect x="400" y="150" width="25" height="28" class="fv"/>
      <rect x="430" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/><rect x="455" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/><rect x="480" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/><rect x="505" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/><rect x="530" y="150" width="25" height="28" class="fg sg" stroke-opacity="1" stroke-width="2"/>
    </g>
    <path d="M430,186 L430,192 L555,192 L555,186" fill="none" class="sg" stroke-width="2"/>
    <text x="492" y="206" text-anchor="middle" class="tg">reads only 5</text>
  </svg><figcaption>Row store keeps a row's values together (cheap to fetch one order); column store keeps a column together (cheap to scan one field).</figcaption></figure>
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
  <p><strong>Analytical warehouses</strong> (BigQuery, Snowflake, Redshift, ClickHouse, DuckDB locally) = column store + massively parallel execution. Your main workplace; a bad app backend (slow single-row writes, seconds of latency, cost per query).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>SELECT *</code> on a column store reads every column and, on BigQuery, you pay per byte scanned. Select only the columns you need.</p>
  </div>

  <h2 id="dt-acid"><span class="num">06</span>ACID, BASE &amp; CAP</h2>
  <h3>ACID vs BASE</h3>
  <table class="tbl">
    <tr><th>ACID (relational default)</th><th>Meaning</th></tr>
    <tr><td><strong>Atomicity</strong></td><td>All steps of a transaction happen, or none do</td></tr>
    <tr><td><strong>Consistency</strong></td><td>Every commit leaves the data valid (constraints hold)</td></tr>
    <tr><td><strong>Isolation</strong></td><td>Concurrent transactions don't see each other's half-done work</td></tr>
    <tr><td><strong>Durability</strong></td><td>Once committed, it survives a crash</td></tr>
  </table>
  <p><strong>BASE</strong> (many distributed NoSQL systems): <strong>B</strong>asically <strong>A</strong>vailable, <strong>S</strong>oft state, <strong>E</strong>ventually consistent. Replicas may briefly disagree but converge if writes stop.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>ACID is a bank transfer: money never vanishes mid-way. BASE is a social "like" counter: if your friend sees 99 likes and you see 100 for a second, nobody is harmed.</p>
  </div>
  <h3>CAP theorem in plain terms</h3>
  <p>Replicas copy data across machines. When the network between them breaks (a <strong>partition</strong>, P), each must choose:</p>
  <figure class="viz"><svg viewBox="0 0 600 215" width="600">
    <defs><marker id="dt-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="300" y="16" text-anchor="middle" font-size="11" class="tm">A client asks Replica A: "is the Lamp in stock?"</text>
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
  </svg><figcaption>While partitioned you cannot be both correct and always answering. Banks choose C; carts and feeds usually choose A.</figcaption></figure>
  <div class="callout trap"><span class="label">Trap: "pick 2 of 3"</span>
    <p>CAP only bites <em>during a partition</em>. When the network is healthy you get C and A. The everyday trade-off is latency vs consistency (the <strong>PACELC</strong> extension: "Else, Latency or Consistency"). Many systems are tunable per query: Cassandra and DynamoDB let you choose consistency levels.</p>
  </div>
  <div class="cards">
    <div><b>CP leaning</b><p>Stay correct, may reject requests during a split.</p><small>HBase, ZooKeeper/etcd, Spanner, MongoDB (majority writes)</small></div>
    <div><b>AP leaning</b><p>Always answer, reconcile later.</p><small>Cassandra, DynamoDB (default reads), CouchDB</small></div>
    <div><b>Single node</b><p>No partition between replicas, so CAP doesn't apply.</p><small>One PostgreSQL / MySQL server</small></div>
  </div>

  <h2 id="dt-choose"><span class="num">07</span>How to Choose</h2>
  <table class="tbl">
    <tr><th>Workload</th><th>Pick</th><th>Why</th></tr>
    <tr><td>Orders, payments, users, inventory</td><td>Relational (PostgreSQL)</td><td>Transactions, constraints, JOINs</td></tr>
    <tr><td>Product catalog with varied attributes</td><td>Document (MongoDB) or Postgres JSONB</td><td>Flexible shape, read whole object</td></tr>
    <tr><td>Cache, sessions, rate limits, online features</td><td>Key-value in-memory (Redis)</td><td>Sub-ms lookups by key</td></tr>
    <tr><td>Massive event/IoT write streams, lookup by key</td><td>Wide-column (Cassandra)</td><td>Linear write scaling</td></tr>
    <tr><td>Fraud rings, "friends of friends", recommendations</td><td>Graph (Neo4j)</td><td>Cheap multi-hop traversal</td></tr>
    <tr><td>Metrics, monitoring, sensor data</td><td>Time-series (TimescaleDB, InfluxDB)</td><td>Time buckets, retention</td></tr>
    <tr><td>Search box, log search</td><td>Search engine (Elasticsearch)</td><td>Inverted index, relevance ranking</td></tr>
    <tr><td>Semantic search, RAG, similar items</td><td>Vector DB or pgvector</td><td>Nearest-neighbour on embeddings</td></tr>
    <tr><td>Dashboards, ad-hoc analytics, training data</td><td>Warehouse (BigQuery, Snowflake)</td><td>Columnar scans over history</td></tr>
  </table>
  <p>Questions to ask, in order:</p>
  <div class="flow"><span>Need multi-row transactions?</span><span>How will you query it (by key? ad hoc?)</span><span>Read/write volume</span><span>Shape fixed or varied?</span><span>Team already runs X?</span></div>
  <div class="callout intu"><span class="label">Interview answer pattern</span>
    <p>"Default to PostgreSQL. Add a specialist only for a named workload it can't handle well, and accept the cost: another system to run, sync and secure."</p>
  </div>

  <h2 id="dt-poly"><span class="num">08</span>Polyglot &amp; Managed Cloud</h2>
  <p><strong>Polyglot persistence</strong>: one product uses several databases, each for the job it does best. One system (usually the relational DB) stays the <strong>source of truth</strong>; the rest are fed from it.</p>
  <div class="flow"><span>PostgreSQL (orders = truth)</span><span>CDC stream (Debezium/Kafka)</span><span>Elasticsearch · Redis · Warehouse · Vector DB</span></div>
  <table class="tbl">
    <tr><th>E-commerce + ML feature</th><th>Database</th></tr>
    <tr><td>Checkout, orders, stock</td><td>PostgreSQL (ACID)</td></tr>
    <tr><td>Cart, login sessions, "recently viewed"</td><td>Redis</td></tr>
    <tr><td>Search box with typo tolerance and filters</td><td>Elasticsearch / OpenSearch</td></tr>
    <tr><td>"Similar products" from image/text embeddings</td><td>pgvector or Pinecone</td></tr>
    <tr><td>Fraud ring detection (shared cards, addresses)</td><td>Neo4j</td></tr>
    <tr><td>Revenue dashboards, model training sets</td><td>Snowflake / BigQuery</td></tr>
    <tr><td>Real-time features for the recommender at inference</td><td>Redis or DynamoDB (online feature store)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing to two databases separately from the app ("dual writes") lets them drift when one write fails. Write once to the source of truth and propagate via CDC (change data capture: streaming the DB's change log).</p>
  </div>
  <h3>Managed cloud equivalents</h3>
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
  <h2 id="dt-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the CAP theorem. Does it mean every database picks two of three?</summary><div class="qa-body">When a network partition splits replicas, each side must either reject requests (consistency) or answer with possibly stale data (availability). Partitions can't be ruled out, so the real choice is C or A <em>during a partition</em>. When the network is healthy, a system can be both; the day-to-day trade-off is latency vs consistency (PACELC).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between a wide-column store and a columnar warehouse?</summary><div class="qa-body">Wide-column (Cassandra, Bigtable) groups rows by partition key; it's built for fast writes and key lookups. Columnar (BigQuery, Redshift) stores each column contiguously; it's built for scanning and aggregating a few columns over billions of rows. Similar names, opposite workloads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is <code>SELECT SUM(amount) FROM sales</code> much faster in Snowflake than in PostgreSQL on 2 billion rows?</summary><div class="qa-body">Snowflake is a column store: it reads only the compressed <code>amount</code> column, skips blocks using min/max metadata, and runs in parallel across many nodes. PostgreSQL is a row store: it reads every full row from disk to get one field, on one machine (with limited parallel workers).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ACID vs BASE: give one workload for each.</summary><div class="qa-body">ACID: transferring money or decrementing stock at checkout; a partial or conflicting result is unacceptable. BASE: like counts, view counts, a social feed; brief disagreement between replicas is fine and staying available matters more.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team wants to use MongoDB "because it's schemaless and faster". What do you ask?</summary><div class="qa-body">How will the data be queried? If it's relational (orders ↔ customers ↔ products) and needs ad-hoc reporting, Postgres fits better. Is the shape truly variable? Postgres JSONB handles that too. Do we need multi-document transactions? Faster for what: single-object reads by id, or analytics? The schema still exists, just in application code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use a graph database over SQL?</summary><div class="qa-body">When questions are about paths of unknown or deep length: "accounts within 3 hops sharing a device with a known fraudster", "friends of friends". In SQL each hop is another self-join or a recursive CTE, which gets slow and awkward. A graph DB follows edges directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is Redis a database or a cache? Can it lose data?</summary><div class="qa-body">It's an in-memory key-value database, most often used as a cache. It can persist with RDB snapshots or an append-only file, but with default settings a crash can lose recent writes (up to the last snapshot, or about a second with AOF everysec). Keep the source of truth elsewhere.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You're building RAG over 200k internal documents and already run PostgreSQL. Which vector store?</summary><div class="qa-body">Start with <code>pgvector</code> plus an HNSW index. 200k vectors is small, and you keep one system, SQL filters, JOINs to metadata and transactions. Move to a dedicated vector DB (Pinecone, Qdrant, Milvus) if you hit hundreds of millions of vectors or very high query rates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the data stores for an e-commerce site with search and a recommender.</summary><div class="qa-body">PostgreSQL for orders/users/stock (source of truth). Redis for sessions, carts and online features. Elasticsearch for the search box. A vector index for "similar items". A warehouse (BigQuery/Snowflake) for analytics and training data. Feed everything from Postgres via CDC, not dual writes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>RDS vs Aurora vs DynamoDB: one line each.</summary><div class="qa-body">RDS: managed standard Postgres/MySQL. Aurora: AWS's Postgres/MySQL-compatible engine with distributed storage, faster replicas and failover. DynamoDB: serverless key-value/document store with predictable millisecond latency, but queries must follow designed key access patterns; no JOINs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why shouldn't you point your dashboards at the production PostgreSQL?</summary><div class="qa-body">Big analytical scans compete with live transactions for CPU, memory and I/O, slowing the app. Row storage is also inefficient for wide aggregates. Replicate to a read replica (short term) or a columnar warehouse (proper fix).</div></details>
</main>`
});
