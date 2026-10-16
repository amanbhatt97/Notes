// notes/databases/db_intro.js — What is a Database
Object.assign(TOPIC_CONTENT, {
  "db_intro": `<main>
  <h1>What is a Database</h1>
  <p class="lead">Before writing SQL, you need to know what a database actually does for you: what problems it solves, and what happens between your query and the disk.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="di-core"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Data, Database, DBMS</span><span class="rm-sub">Three words people mix up</span></div></div>
      <div class="rm-item rm-done" data-target="di-files"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Why Not Excel or Files?</span><span class="rm-sub">Six problems a database solves</span></div></div>
      <div class="rm-item rm-done" data-target="di-inside"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Inside a Database</span><span class="rm-sub">Query → plan → pages on disk</span></div></div>
      <div class="rm-item rm-done" data-target="di-schema"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Schema &amp; Data Shapes</span><span class="rm-sub">Structured, semi-, unstructured</span></div></div>
      <div class="rm-item rm-done" data-target="di-sqlnosql"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">SQL vs NoSQL</span><span class="rm-sub">The two big families</span></div></div>
      <div class="rm-item rm-done" data-target="di-stack"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Databases in a Data Stack</span><span class="rm-sub">Where each one sits</span></div></div>
      <div class="rm-item rm-done" data-target="di-rev"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 8 lines</span></div></div>
      <div class="rm-item rm-done" data-target="di-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="di-core"><span class="num">01</span>Data, Database, DBMS</h2>
  <ul>
    <li><strong>Data</strong>: raw facts. <em>"Asha ordered a Laptop on 1 May for ₹800."</em></li>
    <li><strong>Database</strong>: an organised collection of that data, stored so it can be found and changed quickly.</li>
    <li><strong>DBMS</strong> (Database Management System): the software that stores, protects and serves the database. PostgreSQL, MySQL and MongoDB are DBMSs.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library. The <strong>books</strong> are data. The <strong>shelves and catalogue</strong> are the database. The <strong>librarian</strong> is the DBMS: you ask for something, and they know where it is, stop two people taking the last copy, and keep records if the lights go out.</p>
  </div>
  <div class="flow"><span>Your app / notebook</span><span>Query (SQL)</span><span>DBMS</span><span>Files on disk</span></div>
  <p>You never touch the files directly. You <em>ask</em>, and the DBMS decides how to get the answer. That separation is the whole point.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>People say "database" for all three. In an interview, "PostgreSQL is a database" is fine casually, but precisely it's a <strong>DBMS</strong> that manages many databases.</p>
  </div>

  <h2 id="di-files"><span class="num">02</span>Why Not Excel or Files?</h2>
  <p>A spreadsheet works for one person and a few thousand rows. It breaks once many people or programs share the data.</p>
  <table class="tbl">
    <tr><th>Problem</th><th>With a spreadsheet / CSV</th><th>What a DBMS does</th></tr>
    <tr><td><strong>Concurrency</strong></td><td>Two people edit at once, so one overwrites the other</td><td>Locks and transactions let thousands write safely</td></tr>
    <tr><td><strong>Integrity</strong></td><td>Anyone can type "abc" in a price column</td><td>Types and constraints reject bad data</td></tr>
    <tr><td><strong>Crashes</strong></td><td>Power cut mid-save leaves a corrupt file</td><td>A write-ahead log restores a consistent state</td></tr>
    <tr><td><strong>Scale</strong></td><td>Slows down at ~1M rows and must fit in memory</td><td>Billions of rows; reads only the pages it needs</td></tr>
    <tr><td><strong>Querying</strong></td><td>Manual filters and VLOOKUPs</td><td>One declarative query, optimised for you</td></tr>
    <tr><td><strong>Security</strong></td><td>Whoever has the file sees everything</td><td>Per-user, per-table permissions</td></tr>
  </table>
  <div class="callout intu"><span class="label">Example: the last concert seat</span>
    <p>Two fans click "Buy" on the last seat at the same millisecond. With a file, both reads say "1 seat left" and both purchases succeed. A database runs the two purchases as <strong>transactions</strong>: one wins, and the other sees 0 seats and fails cleanly.</p>
  </div>

  <h2 id="di-inside"><span class="num">03</span>Inside a Database</h2>
  <p>What happens when you run <code>SELECT name FROM customers WHERE city = 'Mumbai'</code>:</p>
  <div class="flow"><span>Parser</span><span>Planner / Optimizer</span><span>Executor</span><span>Buffer cache</span><span>Disk pages</span></div>
  <ul>
    <li><strong>Parser</strong>: checks the grammar and that the table and columns exist.</li>
    <li><strong>Optimizer</strong>: picks the cheapest way to get the answer: scan everything, or use an index? Which join order? This is why SQL is <em>declarative</em>: you say <em>what</em>, it decides <em>how</em>.</li>
    <li><strong>Executor</strong>: runs the chosen plan.</li>
    <li><strong>Buffer cache</strong>: recently used data kept in RAM, because memory is ~1000× faster than disk.</li>
    <li><strong>Pages</strong>: data lives on disk in fixed blocks (8 KB in PostgreSQL). The DBMS reads whole pages, never single rows.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ordering at a restaurant. You say <em>what</em> you want (the query). The chef (optimizer) decides <em>how</em>: which pan, what order. Ingredients already on the counter (the cache) are fast. A trip to the store room (disk) is slow.</p>
  </div>
  <h3>Two structures worth knowing now</h3>
  <ul>
    <li><strong>Index</strong>: a sorted lookup structure (usually a B-tree), like a book's index. It finds rows without reading the whole table. Covered in <em>Indexes &amp; Performance</em>.</li>
    <li><strong>Write-Ahead Log (WAL)</strong>: every change is first appended to a log, then applied to the table. After a crash, the DBMS replays the log, so committed data is never lost.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy: WAL</span>
    <p>A shopkeeper writes every sale in a receipt book <em>before</em> moving stock. If the shelves get knocked over, the receipt book tells you exactly what state they should be in.</p>
  </div>

  <h2 id="di-schema"><span class="num">04</span>Schema &amp; Data Shapes</h2>
  <p>A <strong>schema</strong> is the blueprint: which tables exist, their columns, types and rules. The data must fit the blueprint.</p>
  <div class="cards">
    <div><b>Structured</b><p>Fixed columns and types. Every row has the same shape.</p><small>Orders, payments, users → SQL tables</small></div>
    <div><b>Semi-structured</b><p>Has fields, but they can vary per record and nest.</p><small>JSON events, product catalogs → MongoDB, JSONB</small></div>
    <div><b>Unstructured</b><p>No fields at all: blobs of content.</p><small>Images, PDFs, audio → object storage (S3); embeddings → vector DB</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>Schema-on-write (SQL)</th><th>Schema-on-read (NoSQL, data lakes)</th></tr>
    <tr><td>When is shape checked?</td><td>On insert: bad rows are rejected</td><td>When you read and interpret it</td></tr>
    <tr><td>Strength</td><td>Clean, trustworthy data</td><td>Flexible, fast to start</td></tr>
    <tr><td>Cost</td><td>Changing structure needs a migration</td><td>Every reader must handle messy or missing fields</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"NoSQL is schemaless" is misleading. The schema still exists. It has just moved from the database into your application code.</p>
  </div>

  <h2 id="di-sqlnosql"><span class="num">05</span>SQL vs NoSQL</h2>
  <table class="tbl">
    <tr><th></th><th>SQL / Relational</th><th>NoSQL</th></tr>
    <tr><td>Data model</td><td>Tables of rows, linked by keys</td><td>Documents, key-value, graphs, wide columns</td></tr>
    <tr><td>Schema</td><td>Fixed, enforced</td><td>Flexible</td></tr>
    <tr><td>Relationships</td><td>JOINs at query time</td><td>Usually embedded / duplicated</td></tr>
    <tr><td>Guarantees</td><td>Strong ACID transactions</td><td>Varies; often tuned for availability and speed</td></tr>
    <tr><td>Scaling</td><td>Mostly vertical (bigger machine) + read replicas</td><td>Built to scale horizontally (more machines)</td></tr>
    <tr><td>Examples</td><td>PostgreSQL, MySQL, SQLite, SQL Server</td><td>MongoDB, Redis, Cassandra, Neo4j</td></tr>
  </table>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Start with PostgreSQL. Move a specific workload to NoSQL only when you can name the reason: huge write volume, a truly flexible shape, sub-millisecond caching, or graph traversal. The next page, <em>Types of Databases</em>, covers each family.</p>
  </div>

  <h2 id="di-stack"><span class="num">06</span>Databases in a Data Stack</h2>
  <p>Real companies run several databases, each doing one job well.</p>
  <div class="flow"><span>App DB (PostgreSQL)</span><span>ETL / CDC pipeline</span><span>Warehouse (BigQuery, Snowflake)</span><span>Dashboards &amp; ML training</span></div>
  <ul>
    <li><strong>OLTP</strong> (online transaction processing): the app's database. Many tiny reads and writes, such as "place this order". Needs to be fast and correct.</li>
    <li><strong>OLAP</strong> (online analytical processing): the warehouse. Few, huge queries, such as "revenue by month for 3 years". Needs to scan fast.</li>
    <li><strong>Supporting cast</strong>: Redis (cache), Elasticsearch (text search), a vector DB (embeddings for RAG), a feature store (ML features).</li>
  </ul>
  <div class="callout intu"><span class="label">Why a data scientist cares</span>
    <p>You will mostly <em>query</em> the warehouse. Running a heavy analytical query on the production OLTP database can slow the live app. That's why the copy to a warehouse exists.</p>
  </div>

  <h2 id="di-rev"><span class="num">07</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>DBMS</strong> = the software (PostgreSQL); <strong>database</strong> = the organised data it manages.</li>
    <li>Databases beat files on <strong>concurrency, integrity, crash safety, scale, querying, security</strong>.</li>
    <li>Query path: <strong>parse → optimize → execute → cache → disk pages</strong>.</li>
    <li>SQL is <strong>declarative</strong>: you state the result; the optimizer chooses the method.</li>
    <li><strong>WAL</strong>: log first, apply later, so a crash never loses committed data.</li>
    <li><strong>Schema</strong> = blueprint. SQL checks it on write; NoSQL checks it on read (in your code).</li>
    <li><strong>OLTP</strong> = many small transactions; <strong>OLAP</strong> = few big analytical scans.</li>
    <li>Default to PostgreSQL; pick NoSQL for a named reason.</li>
  </ol></div>

  <h2 id="di-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between a database and a DBMS?</summary><div class="qa-body">The database is the organised data. The DBMS is the software that stores it, runs queries, enforces rules, handles concurrent users and recovers from crashes. PostgreSQL is a DBMS; your <code>shop</code> data is a database inside it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team keeps sales data in a shared Excel file. Give three concrete reasons to move it to a database.</summary><div class="qa-body">(1) Simultaneous edits overwrite each other; transactions fix that. (2) Nothing stops a typo like "12O" in a price column; types and constraints do. (3) It won't scale past ~1M rows, while a DBMS handles billions and reads only what it needs. Also: crash recovery and per-user permissions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "SQL is declarative" mean, and why is it useful?</summary><div class="qa-body">You describe the result you want, not the steps. The optimizer picks the steps: scan or index, join order, algorithm. The same query keeps working, and often gets faster, as data grows or indexes are added, without you rewriting it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a database avoid losing data if the server crashes mid-write?</summary><div class="qa-body">Write-ahead logging. Each change is appended to the WAL and flushed to disk before the commit is confirmed. On restart, the DBMS replays committed changes from the log and discards uncommitted ones, so the data is consistent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a database read data in pages rather than rows?</summary><div class="qa-body">Disk and OS I/O work in blocks; fetching one row costs about the same as fetching the 8 KB page around it. Storing related rows together and caching whole pages in RAM minimises slow disk trips. That's also why indexes and table layout affect speed so much.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>OLTP vs OLAP: which is "place an order" and which is "revenue per month for 3 years"? Why keep them separate?</summary><div class="qa-body">Placing an order is OLTP (small, frequent, must be correct now). Monthly revenue is OLAP (one huge scan). They're separated so heavy analysis doesn't slow the live app, and because each uses a storage layout tuned for its job: row stores for OLTP, column stores for OLAP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is MongoDB "schemaless"?</summary><div class="qa-body">Not really. MongoDB doesn't enforce a schema by default, but your application still assumes fields exist with certain types. The schema moved from the database into the code. You can also add JSON Schema validation in MongoDB to enforce it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the databases you'd expect in a typical ML product and what each does.</summary><div class="qa-body">PostgreSQL/MySQL for the app (OLTP); a warehouse like BigQuery or Snowflake for analytics and training data; Redis for caching and sessions; a vector DB (or pgvector) for embedding search in RAG; sometimes Elasticsearch for text search and a feature store for model features.</div></details>
</main>`
});
