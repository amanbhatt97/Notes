// notes/databases/db_intro.js — What is a Database
Object.assign(TOPIC_CONTENT, {
  "db_intro": `<main>
  <h1>What is a Database</h1>
  <p class="lead">Every app you use (UPI, Swiggy, IRCTC, Instagram) keeps its information in a database. This page explains what a database is, why a plain Excel file is not enough, and what happens inside when you ask it a question. As a data scientist you will pull almost all your training data out of databases, and interviews often start here.</p>

  <h2 id="di-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">What is a Database</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Three words</div>
        <ul>
          <li><b>Data</b> — raw facts ("Asha bought a Laptop for 800")</li>
          <li><b>Database</b> — organised collection of data, quick to find and change</li>
          <li><b>DBMS</b> — software that stores, protects, serves it (PostgreSQL, MySQL, MongoDB)</li>
          <li><b>Table</b> — rows (one per thing) × columns (one per property)</li>
          <li>💡 <b>Library</b> — books = data, shelves = database, librarian = DBMS</li>
          <li><b>Path</b> — app → SQL query → DBMS → files; you never touch files</li>
          <li>⚠ <b>Trap</b> — "PostgreSQL is a database": precisely, a DBMS managing many databases</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why not Excel / CSV</div>
        <ul>
          <li><b>Concurrency</b> — many users at once; transactions + locks stop overwrites</li>
          <li><b>Integrity</b> — types and constraints reject "abc" or -5 in price</li>
          <li><b>Crash safety</b> — WAL restores a consistent state</li>
          <li><b>Scale</b> — billions of rows, reads only needed pages</li>
          <li><b>Querying</b> — one declarative query vs manual VLOOKUPs</li>
          <li><b>Security</b> — per-user, per-table permissions</li>
          <li><b>Last concert seat</b> — two buyers, one transaction wins, other fails cleanly</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inside: query path</div>
        <ul>
          <li><b>Parser</b> — grammar + do table/columns exist?</li>
          <li><b>Optimizer</b> — picks cheapest plan: scan vs index, join order</li>
          <li><b>Executor</b> — runs the plan</li>
          <li><b>EXPLAIN</b> — shows the plan the optimizer chose ("Seq Scan" = read every row)</li>
          <li><b>Buffer cache</b> — hot pages in RAM (~1000× faster than disk)</li>
          <li><b>Pages</b> — fixed 8 KB blocks; DBMS reads pages, never single rows</li>
          <li><b>Declarative</b> — you say <em>what</em>, optimizer decides <em>how</em></li>
          <li>💡 <b>Restaurant</b> — you order, chef picks method; counter = cache, store room = disk</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Index &amp; WAL</div>
        <ul>
          <li><b>Index</b> — sorted lookup (B-tree), like a book's index; avoids full scans</li>
          <li><b>WAL</b> — write-ahead log: append change to log, flush, then apply to table</li>
          <li><b>Recovery</b> — replay committed log entries, discard uncommitted</li>
          <li>💡 <b>Receipt book</b> — write the sale before moving stock</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Schema &amp; data shapes</div>
        <ul>
          <li><b>Schema</b> — blueprint: tables, columns, types, rules</li>
          <li><b>Structured</b> — fixed columns → SQL tables (orders, payments)</li>
          <li><b>Semi-structured</b> — varying, nested fields → JSON, MongoDB, JSONB</li>
          <li><b>Unstructured</b> — blobs → S3; embeddings → vector DB</li>
          <li><b>Schema-on-write</b> — checked at insert; clean data, migrations to change</li>
          <li><b>Schema-on-read</b> — checked by reader; flexible, every reader handles mess</li>
          <li>⚠ <b>"Schemaless"</b> — schema just moved into application code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SQL vs NoSQL</div>
        <ul>
          <li><b>SQL</b> — tables + keys + JOINs, fixed schema, strong ACID, scales up + replicas</li>
          <li><b>NoSQL</b> — documents, key-value, graph, wide-column; flexible; scales out</li>
          <li><b>Scale up</b> = bigger machine; <b>scale out</b> = more machines</li>
          <li><b>Relationships</b> — SQL joins at query time; NoSQL embeds/duplicates</li>
          <li><b>Rule</b> — default PostgreSQL; NoSQL only for a named reason (write volume, varied shape, cache, graph)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data stack</div>
        <ul>
          <li><b>Flow</b> — App DB → ETL/CDC → warehouse → dashboards &amp; ML</li>
          <li><b>OLTP</b> — many tiny reads/writes ("place order"), row store</li>
          <li><b>OLAP</b> — few huge scans ("revenue by month, 3 yrs"), column store</li>
          <li><b>Supporting</b> — Redis cache, Elasticsearch text, vector DB (RAG), feature store</li>
          <li>⚠ <b>Trap</b> — heavy analytics on production OLTP slows the live app</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="di-core"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Data, Database, DBMS</span><span class="rm-sub">Three words people mix up</span></div></div>
      <div class="rm-item rm-done" data-target="di-files"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Why Not Excel or Files?</span><span class="rm-sub">Six problems a database solves</span></div></div>
      <div class="rm-item rm-done" data-target="di-inside"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Inside a Database</span><span class="rm-sub">Query → plan → pages on disk</span></div></div>
      <div class="rm-item rm-done" data-target="di-schema"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Schema &amp; Data Shapes</span><span class="rm-sub">Structured, semi-, unstructured</span></div></div>
      <div class="rm-item rm-done" data-target="di-sqlnosql"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">SQL vs NoSQL</span><span class="rm-sub">The two big families</span></div></div>
      <div class="rm-item rm-done" data-target="di-stack"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Databases in a Data Stack</span><span class="rm-sub">Where each one sits</span></div></div>
      <div class="rm-item rm-done" data-target="di-qa"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="di-core"><span class="num">01</span>Data, Database, DBMS</h2>
  <p>Picture a kirana shop. The owner writes every sale in a notebook: who bought, what, for how much. That notebook works for 20 sales a day.</p>
  <p>Now picture Flipkart: lakhs of sales a minute, thousands of staff and programs reading the same records. A notebook can't do that. You need a system that stores the records neatly, finds any one in a blink, and never mixes them up. That system is a database.</p>
  <p>Three words come up again and again. They sound alike, so learn them as a set:</p>
  <div class="cards">
    <div><b>Data</b><p>Raw facts.</p><small>"Asha ordered a Laptop on 1 May for ₹800."</small></div>
    <div><b>Database</b><p>An organised collection of data, quick to find and change.</p><small>Your <code>shop</code> tables</small></div>
    <div><b>DBMS</b><p>Database Management System: the software that stores, protects and serves it.</p><small>PostgreSQL, MySQL, MongoDB</small></div>
  </div>
  <p>Most databases keep data in <strong>tables</strong>. A table looks like a sheet in Excel. Each <strong>row</strong> is one thing (one customer). Each <strong>column</strong> is one property of that thing (name, city).</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="di-ar0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="110" y="20" text-anchor="middle" font-weight="bold">Shop notebook</text>
    <rect x="15" y="30" width="190" height="110" rx="6" class="fs"/>
    <text x="27" y="55" font-size="12">Asha, Mumbai, joined 5 Jan</text>
    <text x="27" y="80" font-size="12">Ben, Delhi, joined 10 Feb</text>
    <text x="27" y="105" font-size="12">Chen, Mumbai, 15 Mar</text>
    <text x="27" y="130" font-size="12" class="tm">Dia, city ?, 20 Apr</text>
    <line x1="215" y1="85" x2="265" y2="85" stroke="currentColor" marker-end="url(#di-ar0)"/>
    <text x="440" y="20" text-anchor="middle" font-weight="bold">Table: customers</text>
    <rect x="275" y="30" width="310" height="22" class="fb sb"/>
    <text x="285" y="46" font-weight="bold" font-size="12">customer_id</text><text x="380" y="46" font-weight="bold" font-size="12">name</text><text x="440" y="46" font-weight="bold" font-size="12">city</text><text x="505" y="46" font-weight="bold" font-size="12">signup</text>
    <g font-size="12">
    <text x="285" y="70">1</text><text x="380" y="70">Asha</text><text x="440" y="70">Mumbai</text><text x="505" y="70">2024-01-05</text>
    <text x="285" y="92">2</text><text x="380" y="92">Ben</text><text x="440" y="92">Delhi</text><text x="505" y="92">2024-02-10</text>
    <text x="285" y="114">3</text><text x="380" y="114">Chen</text><text x="440" y="114">Mumbai</text><text x="505" y="114">2024-03-15</text>
    <text x="285" y="136">4</text><text x="380" y="136">Dia</text><text x="440" y="136" class="tm">NULL</text><text x="505" y="136">2024-04-20</text>
    </g>
    <rect x="275" y="58" width="310" height="18" fill="none" class="sg" stroke-width="2"/>
    <text x="430" y="160" text-anchor="middle" font-size="11" class="tg">one row = one customer · one column = one property</text>
  </svg><figcaption>Same facts, two forms. The table gives every customer the same columns and a unique number, so a computer can search it. NULL means "value unknown".</figcaption></figure>
  <p>You talk to the DBMS in a language called <strong>SQL</strong> (Structured Query Language). Here is a real question to the <code>shop</code> database used on every page of this section: "which customers live in Mumbai?"</p>
  <div class="fx" data-lang="sql">SELECT name, city FROM customers WHERE city = 'Mumbai';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>city</th></tr><tr><td>Asha</td><td>Mumbai</td></tr><tr><td>Chen</td><td>Mumbai</td></tr></table>
  <p>Read it like English: <em>select</em> these columns, <em>from</em> this table, <em>where</em> this is true. You never said how to search. The DBMS worked that out.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library. <strong>Books</strong> = data, <strong>shelves + catalogue</strong> = database, <strong>librarian</strong> = DBMS: finds things, stops two people taking the last copy, keeps records if the lights go out.</p>
  </div>
  <div class="flow"><span>Your app / notebook</span><span>Query (SQL)</span><span>DBMS</span><span>Files on disk</span></div>
  <p>You never touch the files. You <em>ask</em>; the DBMS decides how.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>People say "database" for all three. In an interview, "PostgreSQL is a database" is fine casually, but precisely it's a <strong>DBMS</strong> that manages many databases.</p>
  </div>

  <h2 id="di-files"><span class="num">02</span>Why Not Excel or Files?</h2>
  <p>A fair question: Excel also has rows and columns. Why learn anything new?</p>
  <p>A spreadsheet works for one person and a few thousand rows. It breaks once many people or programs share the data at the same time. Think of a class WhatsApp group where 40 students edit one shared Excel of marks. Someone's edit always gets lost.</p>
  <table class="tbl">
    <tr><th>Problem</th><th>With a spreadsheet / CSV</th><th>What a DBMS does</th></tr>
    <tr><td><strong>Concurrency</strong> (many users at the same moment)</td><td>Two people edit at once, so one overwrites the other</td><td>Locks and transactions let thousands write safely</td></tr>
    <tr><td><strong>Integrity</strong> (data stays correct)</td><td>Anyone can type "abc" in a price column</td><td>Types and constraints reject bad data</td></tr>
    <tr><td><strong>Crashes</strong></td><td>Power cut mid-save leaves a corrupt file</td><td>A write-ahead log restores a consistent state</td></tr>
    <tr><td><strong>Scale</strong></td><td>Slows down at ~1M rows and must fit in memory</td><td>Billions of rows; reads only the pages it needs</td></tr>
    <tr><td><strong>Querying</strong></td><td>Manual filters and VLOOKUPs</td><td>One declarative query, optimised for you</td></tr>
    <tr><td><strong>Security</strong></td><td>Whoever has the file sees everything</td><td>Per-user, per-table permissions</td></tr>
  </table>
  <h3>Integrity in action</h3>
  <p>The <code>products</code> table was created with rules: price must be a number, and price must be above 0. These rules are called <strong>constraints</strong> (rules the database checks on every insert). Watch the database refuse bad rows (run on a copy of <code>shop</code>):</p>
  <div class="fx" data-lang="sql">INSERT INTO products VALUES (14, 'Pen', 'Stationery', 'abc');</div>
  <div class="fx" data-lang="text">ERROR:  invalid input syntax for type numeric: "abc"</div>
  <div class="fx" data-lang="sql">INSERT INTO products VALUES (14, 'Pen', 'Stationery', -5);</div>
  <div class="fx" data-lang="text">ERROR:  new row for relation "products" violates check constraint "products_price_check"
DETAIL:  Failing row contains (14, Pen, Stationery, -5.00).</div>
  <div class="fx" data-lang="sql">INSERT INTO products VALUES (10, 'Pen', 'Stationery', 5);</div>
  <div class="fx" data-lang="text">ERROR:  duplicate key value violates unique constraint "products_pkey"
DETAIL:  Key (product_id)=(10) already exists.</div>
  <p>Excel would have accepted all three. The database caught a wrong type, a negative price and a repeated id.</p>
  <h3>Concurrency in action: the last concert seat</h3>
  <p>Fans A and B click "Buy" in the same millisecond. Only one seat is left. A <strong>transaction</strong> is a group of steps the database treats as one unit: either all of it happens or none of it.</p>
  <figure class="viz"><svg viewBox="0 0 600 180" width="600">
    <text x="145" y="20" text-anchor="middle" font-weight="bold" class="tr">CSV file</text>
    <rect x="15" y="34" width="260" height="20" rx="4" class="fb"/><text x="25" y="48">A: read seats = 1</text>
    <rect x="15" y="60" width="260" height="20" rx="4" class="fv"/><text x="25" y="74">B: read seats = 1</text>
    <rect x="15" y="86" width="260" height="20" rx="4" class="fb"/><text x="25" y="100">A: buy, write seats = 0</text>
    <rect x="15" y="112" width="260" height="20" rx="4" class="fv"/><text x="25" y="126">B: buy, write seats = 0</text>
    <text x="145" y="160" text-anchor="middle" font-weight="bold" class="tr">2 tickets sold, 1 seat ✗</text>
    <line x1="300" y1="10" x2="300" y2="170" stroke="currentColor" stroke-dasharray="4 4" opacity="0.4"/>
    <text x="455" y="20" text-anchor="middle" font-weight="bold" class="tg">Database transactions</text>
    <rect x="325" y="34" width="260" height="20" rx="4" class="fb"/><text x="335" y="48">A: BEGIN, lock the row</text>
    <rect x="325" y="60" width="260" height="20" rx="4" class="fv"/><text x="335" y="74">B: waits for the lock…</text>
    <rect x="325" y="86" width="260" height="20" rx="4" class="fb"/><text x="335" y="100">A: seats = 0, COMMIT</text>
    <rect x="325" y="112" width="260" height="20" rx="4" class="fv"/><text x="335" y="126">B: reads 0, fails cleanly</text>
    <text x="455" y="160" text-anchor="middle" font-weight="bold" class="tg">1 ticket sold, 1 seat ✓</text>
  </svg><figcaption>Time runs downward. A file lets both reads see "1 seat"; a transaction makes B wait, then see the truth.</figcaption></figure>
  <p>The same thing happens in IRCTC Tatkal booking at 10 AM: thousands of people, a few seats, and nobody may get the same berth.</p>

  <h2 id="di-inside"><span class="num">03</span>Inside a Database</h2>
  <p>You typed one line of SQL. Something had to read it, decide how to search, and fetch the rows. That work happens in three steps, in order:</p>
  <ul>
    <li><strong>Parser</strong> — checks the grammar and that the table and columns exist.</li>
    <li><strong>Optimizer</strong> — thinks of a few ways to get the answer and picks the cheapest one.</li>
    <li><strong>Executor</strong> — actually follows that plan and reads the data.</li>
  </ul>
  <p>What happens when you run <code>SELECT name FROM customers WHERE city = 'Mumbai'</code>:</p>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600">
    <defs><marker id="di-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="115" height="52" rx="8" class="fs"/>
    <text x="67" y="52" text-anchor="middle" font-weight="bold">Query</text><text x="67" y="70" text-anchor="middle" font-size="10" class="tm">SELECT … WHERE</text>
    <rect x="160" y="30" width="115" height="52" rx="8" class="fb sb"/>
    <text x="217" y="52" text-anchor="middle" font-weight="bold">Parser</text><text x="217" y="70" text-anchor="middle" font-size="10" class="tm">grammar + names</text>
    <rect x="310" y="30" width="115" height="52" rx="8" class="fv"/>
    <text x="367" y="52" text-anchor="middle" font-weight="bold">Optimizer</text><text x="367" y="70" text-anchor="middle" font-size="10" class="tm">scan or index?</text>
    <rect x="460" y="30" width="125" height="52" rx="8" class="ft st"/>
    <text x="522" y="52" text-anchor="middle" font-weight="bold">Executor</text><text x="522" y="70" text-anchor="middle" font-size="10" class="tm">runs the plan</text>
    <g stroke="currentColor" marker-end="url(#di-ar1)">
      <line x1="125" y1="56" x2="158" y2="56"/><line x1="275" y1="56" x2="308" y2="56"/><line x1="425" y1="56" x2="458" y2="56"/>
      <line x1="522" y1="82" x2="522" y2="138"/><line x1="290" y1="168" x2="418" y2="168"/>
    </g>
    <rect x="420" y="140" width="165" height="56" rx="8" class="fg sg"/>
    <text x="502" y="163" text-anchor="middle" font-weight="bold">Buffer cache</text><text x="502" y="182" text-anchor="middle" font-size="10" class="tm">hot pages in RAM</text>
    <rect x="40" y="140" width="250" height="56" rx="8" class="fs"/>
    <text x="165" y="160" text-anchor="middle" font-weight="bold">Disk</text>
    <g class="fb"><rect x="70" y="170" width="30" height="16" rx="2"/><rect x="106" y="170" width="30" height="16" rx="2"/><rect x="142" y="170" width="30" height="16" rx="2"/><rect x="178" y="170" width="30" height="16" rx="2"/><rect x="214" y="170" width="30" height="16" rx="2"/></g>
    <text x="354" y="160" text-anchor="middle" font-size="10" class="tm">cache miss</text>
    <text x="165" y="218" text-anchor="middle" font-size="10" class="tm">8 KB pages: read whole, never one row</text>
    <text x="502" y="218" text-anchor="middle" font-size="10" class="tm">~1000× faster than disk</text>
  </svg><figcaption>The optimizer picks the plan; the executor reads pages from RAM if cached, otherwise fetches 8 KB pages from disk.</figcaption></figure>
  <p>Follow the arrows left to right, then down. Two words in the picture need a plain meaning:</p>
  <ul>
    <li><strong>Page</strong> — a fixed 8 KB block of the table on disk. The database always reads a whole page, even if you need one row from it.</li>
    <li><strong>Buffer cache</strong> — pages kept in RAM after they were read once. RAM is about 1000 times faster than disk, so a second read of the same page is almost free.</li>
  </ul>
  <p>You can ask the database to show the plan it picked. Put <code>EXPLAIN</code> in front of the query:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT name FROM customers WHERE city = 'Mumbai';</div>
  <div class="fx" data-lang="text">                        QUERY PLAN
-----------------------------------------------------------
 Seq Scan on customers  (cost=0.00..20.12 rows=4 width=32)
   Filter: (city = 'Mumbai'::text)</div>
  <p><strong>Seq Scan</strong> means "read every row, one after another, and keep those that pass the filter". With 4 rows that is the cheapest way. With 40 crore rows the optimizer would look for an index instead.</p>
  <p>This is what <strong>declarative</strong> means: you say <em>what</em>, the optimizer decides <em>how</em> (scan or index, join order).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant. You order (query); the chef (optimizer) picks pan and order. Ingredients on the counter (cache) are fast; the store room (disk) is slow.</p>
  </div>
  <h3>Two structures worth knowing now</h3>
  <p><strong>Index</strong>: a sorted lookup (usually a B-tree, a tree-shaped sorted list), like the index at the back of a textbook. Instead of reading all 500 pages to find "photosynthesis", you look it up and jump to page 212. It finds rows without a full scan. See <em>Indexes &amp; Performance</em>.</p>
  <p><strong>Write-Ahead Log (WAL)</strong>: log first, table later. The problem it solves: the power goes off halfway through saving a change. Without a log, the table could be left half-changed.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="di-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="25" width="120" height="50" rx="8" class="fs"/>
    <text x="70" y="46" text-anchor="middle" font-weight="bold">1. UPDATE</text><text x="70" y="63" text-anchor="middle" font-size="10" class="tm">change arrives</text>
    <rect x="170" y="25" width="150" height="50" rx="8" class="fv"/>
    <text x="245" y="46" text-anchor="middle" font-weight="bold">2. WAL</text><text x="245" y="63" text-anchor="middle" font-size="10" class="tm">append + flush</text>
    <rect x="360" y="25" width="110" height="50" rx="8" class="fg sg"/>
    <text x="415" y="46" text-anchor="middle" font-weight="bold">3. COMMIT</text><text x="415" y="63" text-anchor="middle" font-size="10" class="tm">"saved" to you</text>
    <rect x="360" y="105" width="225" height="44" rx="8" class="ft"/>
    <text x="472" y="124" text-anchor="middle" font-weight="bold">4. Table pages</text><text x="472" y="140" text-anchor="middle" font-size="10" class="tm">updated later, in batches</text>
    <g stroke="currentColor" marker-end="url(#di-ar2)">
      <line x1="130" y1="50" x2="168" y2="50"/><line x1="320" y1="50" x2="358" y2="50"/>
      <path d="M245,75 L245,127 L358,127" fill="none" stroke-dasharray="4 3"/>
    </g>
    <text x="20" y="115" font-size="11" class="tr">⚡ crash?</text>
    <text x="20" y="133" font-size="10" class="tm">replay WAL: redo committed,</text>
    <text x="20" y="148" font-size="10" class="tm">drop uncommitted</text>
  </svg><figcaption>The commit is confirmed once the log is on disk, so a crash can never lose committed data.</figcaption></figure>
  <p>Read the numbers 1 to 4. The key point: you are told "saved" at step 3, before the table itself is touched. If the server dies after step 3, the log still has the change, and it is redone on restart.</p>
  <div class="callout anlg"><span class="label">Analogy: WAL</span>
    <p>A shopkeeper writes each sale in a receipt book <em>before</em> moving stock. If the shelves fall, the book says what they should hold.</p>
  </div>

  <h2 id="di-schema"><span class="num">04</span>Schema &amp; Data Shapes</h2>
  <p>Think of an exam answer sheet with printed boxes: Roll No, Name, Subject Code. Every student fills the same boxes. Checking 1,000 sheets is easy because the shape is fixed.</p>
  <p>A <strong>schema</strong> is that printed sheet for a database: which tables exist, their columns, types and rules. The data must fit the blueprint. You already saw the <code>products</code> schema reject "abc" and -5.</p>
  <p>Not all data fits neat boxes. Data comes in three shapes:</p>
  <div class="cards">
    <div><b>Structured</b><p>Fixed columns and types. Every row has the same shape.</p><small>Orders, payments, users → SQL tables</small></div>
    <div><b>Semi-structured</b><p>Has fields, but they can vary per record and nest.</p><small>JSON events, product catalogs → MongoDB, JSONB</small></div>
    <div><b>Unstructured</b><p>No fields at all: blobs of content.</p><small>Images, PDFs, audio → object storage (S3); embeddings → vector DB</small></div>
  </div>
  <p>Example of semi-structured: a phone has "RAM" and "battery"; a shirt has "size" and "fabric". Both are products, but their fields differ. Forcing both into one fixed table means many empty columns.</p>
  <p>There are two moments when the shape can be checked: when data goes <em>in</em>, or when someone reads it <em>out</em>.</p>
  <table class="tbl">
    <tr><th></th><th>Schema-on-write (SQL)</th><th>Schema-on-read (NoSQL, data lakes)</th></tr>
    <tr><td>When is shape checked?</td><td>On insert: bad rows are rejected</td><td>When you read and interpret it</td></tr>
    <tr><td>Strength</td><td>Clean, trustworthy data</td><td>Flexible, fast to start</td></tr>
    <tr><td>Cost</td><td>Changing structure needs a migration (a script that changes the tables)</td><td>Every reader must handle messy or missing fields</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Schema-on-write is the exam hall invigilator who rejects a sheet with no roll number at the door. Schema-on-read is collecting every sheet as-is and letting the teacher deal with missing roll numbers later.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"NoSQL is schemaless" is misleading. The schema still exists. It has just moved from the database into your application code.</p>
  </div>

  <h2 id="di-sqlnosql"><span class="num">05</span>SQL vs NoSQL</h2>
  <p>Databases fall into two big families. <strong>SQL</strong> (or relational) databases store tables and link them by ids. <strong>NoSQL</strong> means "not only SQL": everything else, built for shapes or sizes that tables handle badly.</p>
  <p>Two terms first. <strong>Scaling vertically</strong> (scale up) = buy one bigger machine. <strong>Scaling horizontally</strong> (scale out) = add more machines and split the data. <strong>ACID</strong> is a set of safety promises around transactions; the next page explains each letter.</p>
  <table class="tbl">
    <tr><th></th><th>SQL / Relational</th><th>NoSQL</th></tr>
    <tr><td>Data model</td><td>Tables of rows, linked by keys</td><td>Documents, key-value, graphs, wide columns</td></tr>
    <tr><td>Schema</td><td>Fixed, enforced</td><td>Flexible</td></tr>
    <tr><td>Relationships</td><td>JOINs at query time</td><td>Usually embedded / duplicated</td></tr>
    <tr><td>Guarantees</td><td>Strong ACID transactions</td><td>Varies; often tuned for availability and speed</td></tr>
    <tr><td>Scaling</td><td>Mostly vertical (bigger machine) + read replicas</td><td>Built to scale horizontally (more machines)</td></tr>
    <tr><td>Examples</td><td>PostgreSQL, MySQL, SQLite, SQL Server</td><td>MongoDB, Redis, Cassandra, Neo4j</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A SQL database is a school office with fixed registers that cross-reference each other by roll number. A NoSQL document store is a file per student with everything stuffed inside: quick to grab one student, harder to answer "how many students in all classes took Hindi?"</p>
  </div>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Start with PostgreSQL. Move a specific workload to NoSQL only when you can name the reason: huge write volume, a truly flexible shape, sub-millisecond caching, or graph traversal. The next page, <em>Types of Databases</em>, covers each family.</p>
  </div>

  <h2 id="di-stack"><span class="num">06</span>Databases in a Data Stack</h2>
  <p>A real company rarely has just one database. The app needs fast, correct writes. Analysts need to scan years of history. One system can't be best at both, so each job gets its own store.</p>
  <figure class="viz"><svg viewBox="0 0 600 200" width="600">
    <defs><marker id="di-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="130" height="54" rx="8" class="fb sb"/>
    <text x="75" y="42" text-anchor="middle" font-weight="bold">App DB</text><text x="75" y="60" text-anchor="middle" font-size="10" class="tm">OLTP · PostgreSQL</text>
    <rect x="175" y="20" width="105" height="54" rx="8" class="fs"/>
    <text x="227" y="42" text-anchor="middle" font-weight="bold">CDC / ETL</text><text x="227" y="60" text-anchor="middle" font-size="10" class="tm">copy changes</text>
    <rect x="315" y="20" width="140" height="54" rx="8" class="fv"/>
    <text x="385" y="42" text-anchor="middle" font-weight="bold">Warehouse</text><text x="385" y="60" text-anchor="middle" font-size="10" class="tm">OLAP · BigQuery</text>
    <rect x="490" y="20" width="100" height="54" rx="8" class="fg sg"/>
    <text x="540" y="42" text-anchor="middle" font-weight="bold">BI + ML</text><text x="540" y="60" text-anchor="middle" font-size="10" class="tm">you query here</text>
    <g stroke="currentColor" marker-end="url(#di-ar3)">
      <line x1="140" y1="47" x2="173" y2="47"/><line x1="280" y1="47" x2="313" y2="47"/><line x1="455" y1="47" x2="488" y2="47"/>
      <line x1="70" y1="125" x2="70" y2="143"/><line x1="215" y1="125" x2="215" y2="143"/><line x1="360" y1="125" x2="360" y2="143"/><line x1="510" y1="125" x2="510" y2="143"/>
    </g>
    <path d="M227,74 L227,125 M70,125 L510,125" stroke="currentColor" fill="none"/>
    <rect x="10" y="145" width="120" height="40" rx="8" class="ft"/><text x="70" y="170" text-anchor="middle">Redis cache</text>
    <rect x="150" y="145" width="130" height="40" rx="8" class="ft"/><text x="215" y="170" text-anchor="middle">Search (ES)</text>
    <rect x="300" y="145" width="120" height="40" rx="8" class="ft"/><text x="360" y="170" text-anchor="middle">Vector DB</text>
    <rect x="440" y="145" width="145" height="40" rx="8" class="ft"/><text x="512" y="170" text-anchor="middle">Feature store</text>
  </svg><figcaption>The app DB is the source of truth; everything else is a copy shaped for one job.</figcaption></figure>
  <p>Read the top row left to right: orders are written to the App DB, a copy job (<strong>ETL</strong> = extract, transform, load; <strong>CDC</strong> = change data capture, streaming each change) moves them to a warehouse, and dashboards and ML read from there. The bottom row shows helper stores fed from the same copies.</p>
  <p>The two kinds of work have names:</p>
  <table class="tbl">
    <tr><th></th><th>OLTP (online transaction processing)</th><th>OLAP (online analytical processing)</th></tr>
    <tr><td>Typical query</td><td>"Place this order": tiny, thousands per second</td><td>"Revenue by month for 3 years": huge, few</td></tr>
    <tr><td>Needs</td><td>Fast and correct per row</td><td>Fast scans over history</td></tr>
    <tr><td>Storage</td><td>Row store</td><td>Column store</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>OLTP is the billing counter at a supermarket: many small, quick bills. OLAP is the head office adding up every bill of the year. If head office did that at the billing counter, the queue would stop.</p>
  </div>
  <div class="callout trap"><span class="label">Why a data scientist cares</span>
    <p>You mostly query the warehouse. Heavy analytics on the production OLTP database slows the live app.</p>
  </div>
  <h2 id="di-qa"><span class="num">07</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In the <code>customers</code> table, what is one row and what is one column?</summary><div class="qa-body">One row is one customer (for example 1, Asha, Mumbai, 2024-01-05). One column is one property shared by all customers (for example <code>city</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between a database and a DBMS?</summary><div class="qa-body">The database is the organised data. The DBMS is the software that stores it, runs queries, enforces rules, handles concurrent users and recovers from crashes. PostgreSQL is a DBMS; your <code>shop</code> data is a database inside it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team keeps sales data in a shared Excel file. Give three concrete reasons to move it to a database.</summary><div class="qa-body">(1) Simultaneous edits overwrite each other; transactions fix that. (2) Nothing stops a typo like "12O" in a price column; types and constraints do. (3) It won't scale past ~1M rows, while a DBMS handles billions and reads only what it needs. Also: crash recovery and per-user permissions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "SQL is declarative" mean, and why is it useful?</summary><div class="qa-body">You describe the result you want, not the steps. The optimizer picks the steps: scan or index, join order, algorithm. The same query keeps working, and often gets faster, as data grows or indexes are added, without you rewriting it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>EXPLAIN</code> shows "Seq Scan on customers". What does that mean, and when is it fine?</summary><div class="qa-body">The database reads every row of the table and keeps the ones that match the filter. It is fine for small tables (like our 4 customers) or when most rows match anyway. On a huge table where you want a few rows, it usually means a missing index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a database avoid losing data if the server crashes mid-write?</summary><div class="qa-body">Write-ahead logging. Each change is appended to the WAL and flushed to disk before the commit is confirmed. On restart, the DBMS replays committed changes from the log and discards uncommitted ones, so the data is consistent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a database read data in pages rather than rows?</summary><div class="qa-body">Disk and OS I/O work in blocks; fetching one row costs about the same as fetching the 8 KB page around it. Storing related rows together and caching whole pages in RAM minimises slow disk trips. That's also why indexes and table layout affect speed so much.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>OLTP vs OLAP: which is "place an order" and which is "revenue per month for 3 years"? Why keep them separate?</summary><div class="qa-body">Placing an order is OLTP (small, frequent, must be correct now). Monthly revenue is OLAP (one huge scan). They're separated so heavy analysis doesn't slow the live app, and because each uses a storage layout tuned for its job: row stores for OLTP, column stores for OLAP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is MongoDB "schemaless"?</summary><div class="qa-body">Not really. MongoDB doesn't enforce a schema by default, but your application still assumes fields exist with certain types. The schema moved from the database into the code. You can also add JSON Schema validation in MongoDB to enforce it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the databases you'd expect in a typical ML product and what each does.</summary><div class="qa-body">PostgreSQL/MySQL for the app (OLTP); a warehouse like BigQuery or Snowflake for analytics and training data; Redis for caching and sessions; a vector DB (or pgvector) for embedding search in RAG; sometimes Elasticsearch for text search and a feature store for model features.</div></details>
</main>`
});
