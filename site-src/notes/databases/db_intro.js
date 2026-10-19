// notes/databases/db_intro.js — What is a Database
Object.assign(TOPIC_CONTENT, {
  "db_intro": `<main>
  <h1>What is a Database</h1>
  <div class="where"><span>Databases</span><span>Foundations</span><span>What is a Database</span></div>
  <p class="lead">Every app you use (UPI, Swiggy, IRCTC, Instagram) keeps its information in a database. This page builds the idea from one small story: <strong>Biteful</strong>, a food-delivery start-up in Pune and Mumbai that begins with one shared spreadsheet of orders. Each time the spreadsheet breaks, a piece of a database appears to fix it: the DBMS, types and constraints, transactions, the parser and planner, pages and indexes, the write-ahead log, the schema, and finally the split between the app's database and the analysts' warehouse. As a data scientist you will pull almost all your training data out of databases, and interviews often start here. Every query on this page was run on PostgreSQL 16 against the Biteful database, and the output shown is the real output.</p>

  <h2 id="di-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="di-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="118" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="69" y="41" text-anchor="middle" font-size="12" font-weight="700">What is a DB</text><text x="69" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="128" y1="45" x2="146" y2="45" stroke="currentColor" marker-end="url(#di-a0)"/>
<rect x="148" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="207" y="41" text-anchor="middle" font-size="12">Types of DBs</text><text x="207" y="58" text-anchor="middle" class="tm" font-size="10">which shape, which job?</text>
<line x1="266" y1="45" x2="284" y2="45" stroke="currentColor" marker-end="url(#di-a0)"/>
<rect x="286" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="345" y="41" text-anchor="middle" font-size="12">Relational model</text><text x="345" y="58" text-anchor="middle" class="tm" font-size="10">tables, keys, types</text>
<line x1="404" y1="45" x2="422" y2="45" stroke="currentColor" marker-end="url(#di-a0)"/>
<rect x="424" y="20" width="118" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="483" y="41" text-anchor="middle" font-size="12">Querying basics</text><text x="483" y="58" text-anchor="middle" class="tm" font-size="10">SELECT … GROUP BY</text>
<line x1="542" y1="45" x2="560" y2="45" stroke="currentColor" marker-end="url(#di-a0)"/>
<rect x="562" y="20" width="90" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="607" y="41" text-anchor="middle" font-size="12">JOINs …</text><text x="607" y="58" text-anchor="middle" class="tm" font-size="10">combine tables</text>
<text x="330" y="105" text-anchor="middle" class="tm" font-size="10.5">One running example for all four foundation pages: the Biteful database</text>
<text x="330" y="122" text-anchor="middle" class="tm" font-size="10.5">customers · restaurants · orders · order_items (7, 5, 10 and 15 rows)</text>
<text x="330" y="150" text-anchor="middle" class="tm" font-size="10.5">later: subqueries, window functions, indexes, transactions, modeling, MongoDB</text>
</svg><figcaption>The foundation of the Databases track. This page says what a database is and why it exists; the next three say which kinds exist, how relational tables are designed, and how to ask them questions.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: files and DataFrames</b><span>In <a class="xref" data-note="da_pd_basics">Pandas</a> you loaded Biteful's orders from a CSV file into memory and analysed them alone. That works for one person and one file.</span></li>
    <li><b>This note adds: a shared, safe, fast home for data</b><span>What happens when many people and programs read and write the same data at the same time, the data grows past memory, the power fails, and everyone wants to ask questions. Each problem brings one part of a database.</span></li>
    <li><b>Leads to: <a class="xref" data-note="db_types">Types of Databases</a></b><span>Different data shapes (menus, carts, rider GPS pings, search, embeddings) get different database families. Then <a class="xref" data-note="sql_relational">Relational Model</a> designs Biteful's tables properly and <a class="xref" data-note="sql_fundamentals">Querying Basics</a> teaches you to ask them questions.</span></li>
  </ol>

  <h2 id="di-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Every step happens to the same company, Biteful.</p>
  <ol class="story">
    <li><b>A shared spreadsheet</b><span>Q: where does Biteful keep its orders? → One sheet, one row per order, shared by everyone. But two people saving at once lose an edit (Dia's cancellation vanished in our test), it slows down as it grows, and every question is a manual filter…</span></li>
    <li><b>Database &amp; DBMS</b><span>Q: who looks after the data for everyone? → A database (organised tables) managed by a DBMS (software such as PostgreSQL) that you ask in SQL: "Pune customers?" → Asha, Chen, Gita. But the DBMS must also stop rubbish getting in…</span></li>
    <li><b>Types &amp; constraints</b><span>Q: how do we stop "abc" or −5 as an amount, a duplicate order id, an order for customer 99? → Rules stored with the table and checked on every write; all four bad inserts were refused. But rules on one row can't stop two people racing for the same thing…</span></li>
    <li><b>Transactions &amp; locks</b><span>Q: two customers grab the last free-dessert coupon in the same instant? → A transaction locks the row; A gets it, B waits until A commits and then sees 0 left. But how does the DBMS even understand the text we send it?</span></li>
    <li><b>Parser, planner, executor</b><span>Q: how does a line of SQL become rows? → The parser checks grammar and names ("SELEC" and "nam" rejected), the planner picks the cheapest way (EXPLAIN shows "Seq Scan"), the executor runs it. But every plan ends with reading data from disk, which is slow…</span></li>
    <li><b>Pages, buffer cache, index</b><span>Q: how do we read as little as possible? → Data lives in 8 KB pages (all 10 orders fit in 1 page), hot pages stay in RAM, and an index finds 1 row out of 200,000 by touching 4 pages instead of 1,088. But what if the power fails halfway through writing a page?</span></li>
    <li><b>Write-ahead log (WAL)</b><span>Q: how is a confirmed order never lost? → Write the change to an append-only log and flush it before saying "saved" (one insert = 312 bytes of log). But all of this assumed we knew the table's shape in advance…</span></li>
    <li><b>Schema &amp; data shapes</b><span>Q: who decides the shape, and what about data that doesn't fit a table? → The schema (the blueprint, stored in the database itself) checked on write; menus and photos are semi-structured and unstructured. Do different shapes need different databases?</span></li>
    <li><b>SQL vs NoSQL</b><span>Q: which family? → Relational for linked, rule-heavy data like orders; NoSQL families for flexible shapes, huge write volumes, caches, graphs. But even inside one family, the app and the analysts want opposite things…</span></li>
    <li><b>OLTP vs OLAP</b><span>Q: one database for "place this order" and "revenue per restaurant per day"? → No: the app database handles many tiny writes (OLTP); a copy in a warehouse handles big scans (OLAP). Which families and products fill each box is the next note.</span></li>
  </ol>

  <h2 id="di-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">What is a Database</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The spreadsheet breaks</div>
        <ul>
          <li><b>Two editors</b> — both read, both save: the last save wins, an edit is lost</li>
          <li><b>Growth</b> — slows at ~1M rows, must fit in memory</li>
          <li><b>Questions</b> — every question is a manual filter or a loop</li>
          <li><b>Also</b> — no type checks, no crash safety, no permissions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Three words</div>
        <ul>
          <li><b>Data</b> — raw facts ("Asha ordered 2 Masala Dosas for ₹240")</li>
          <li><b>Database</b> — organised collection of data, quick to find and change</li>
          <li><b>DBMS</b> — software that stores, protects, serves it (PostgreSQL, MySQL, MongoDB)</li>
          <li><b>Table</b> — rows (one per thing) × columns (one per property)</li>
          <li>💡 <b>Library</b> — books = data, shelves = database, librarian = DBMS</li>
          <li>⚠ <b>Trap</b> — "PostgreSQL is a database": precisely, a DBMS managing many databases</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Keeping data right</div>
        <ul>
          <li><b>Types</b> — "abc" in a NUMERIC column is refused</li>
          <li><b>Constraints</b> — CHECK (amount &gt; 0), PRIMARY KEY, FOREIGN KEY</li>
          <li><b>Transaction</b> — group of steps, all or nothing</li>
          <li><b>Lock</b> — second writer waits; last coupon sold once</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inside: query path</div>
        <ul>
          <li><b>Parser</b> — grammar + do the table/columns exist?</li>
          <li><b>Planner (optimizer)</b> — cheapest plan: scan vs index, join order</li>
          <li><b>Executor</b> — runs the plan</li>
          <li><b>EXPLAIN</b> — shows the plan ("Seq Scan" = read every row)</li>
          <li><b>Declarative</b> — you say <em>what</em>, the planner decides <em>how</em></li>
          <li>💡 <b>Restaurant</b> — you order, chef picks method; counter = cache, store room = disk</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inside: storage</div>
        <ul>
          <li><b>Pages</b> — fixed 8 KB blocks; Biteful's 10 orders = 1 page</li>
          <li><b>Buffer cache</b> — hot pages in RAM ("shared hit")</li>
          <li><b>Index</b> — sorted lookup (B-tree): 4 pages instead of 1,088</li>
          <li><b>WAL</b> — append change to log, flush, then say "saved"; tables updated later</li>
          <li><b>Recovery</b> — replay committed log entries, discard uncommitted</li>
          <li>💡 <b>Receipt book</b> — write the sale before moving stock</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Schema &amp; data shapes</div>
        <ul>
          <li><b>Schema</b> — blueprint: tables, columns, types, rules</li>
          <li><b>Structured</b> — fixed columns → SQL tables (orders, payments)</li>
          <li><b>Semi-structured</b> — varying, nested fields → JSON, MongoDB, JSONB (menus)</li>
          <li><b>Unstructured</b> — blobs → S3 (dish photos); embeddings → vector DB</li>
          <li><b>Schema-on-write</b> vs <b>schema-on-read</b></li>
          <li>⚠ <b>"Schemaless"</b> — schema just moved into application code</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">SQL vs NoSQL, OLTP vs OLAP</div>
        <ul>
          <li><b>SQL</b> — tables + keys + JOINs, fixed schema, strong ACID</li>
          <li><b>NoSQL</b> — documents, key-value, graph, wide-column; scales out</li>
          <li><b>Rule</b> — default PostgreSQL; NoSQL only for a named reason</li>
          <li><b>OLTP</b> — many tiny reads/writes ("place order"), row store</li>
          <li><b>OLAP</b> — few huge scans ("revenue by day"), column store</li>
          <li><b>Flow</b> — App DB → ETL/CDC → warehouse → dashboards &amp; ML</li>
          <li>⚠ <b>Trap</b> — heavy analytics on production OLTP slows the live app</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="di-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="di-sheet"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When a Spreadsheet Breaks</span><span class="rm-sub">Biteful's shared order sheet</span></div></div>
      <div class="rm-item rm-done" data-target="di-core"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Data, Database, DBMS</span><span class="rm-sub">Three words people mix up</span></div></div>
      <div class="rm-item rm-done" data-target="di-integrity"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Keeping Bad Data Out</span><span class="rm-sub">Types and constraints</span></div></div>
      <div class="rm-item rm-done" data-target="di-concurrency"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Many Users at Once</span><span class="rm-sub">Transactions and locks</span></div></div>
      <div class="rm-item rm-done" data-target="di-inside"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">From SQL Text to a Plan</span><span class="rm-sub">Parser, planner, executor</span></div></div>
      <div class="rm-item rm-done" data-target="di-storage"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Pages, Cache &amp; Indexes</span><span class="rm-sub">Reading as little as possible</span></div></div>
      <div class="rm-item rm-done" data-target="di-wal"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Surviving a Crash: the WAL</span><span class="rm-sub">Log first, table later</span></div></div>
      <div class="rm-item rm-done" data-target="di-schema"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Schema &amp; Data Shapes</span><span class="rm-sub">Structured, semi-, unstructured</span></div></div>
      <div class="rm-item rm-done" data-target="di-sqlnosql"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">SQL vs NoSQL</span><span class="rm-sub">The two big families</span></div></div>
      <div class="rm-item rm-done" data-target="di-stack"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">OLTP vs OLAP</span><span class="rm-sub">The app DB and the warehouse</span></div></div>
      <div class="rm-item rm-done" data-target="di-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Each part fixes one failure</span></div></div>
      <div class="rm-item rm-done" data-target="di-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="di-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="di-sheet"><span class="num">01</span>When a Spreadsheet Breaks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A new company has to keep its records somewhere. The obvious place is a spreadsheet: rows and columns, everyone knows how to use it. Where exactly does that stop being good enough, and why?</p>
  </div>
  <h3>The running example: Biteful</h3>
  <p>Biteful delivers food in Pune and Mumbai. In its first month the whole company is one shared sheet with a row per order. Here are the first rows (the full data appears in section 02):</p>
  <table class="tbl"><caption>Biteful's shared order sheet (first 5 of 10 rows)</caption>
    <tr><th>order_id</th><th>customer</th><th>city</th><th>restaurant</th><th>ordered_at</th><th>status</th><th>amount</th></tr>
    <tr><td>101</td><td>Asha</td><td>Pune</td><td>Dosa Hut</td><td>2026-03-02 12:10</td><td>delivered</td><td>240</td></tr>
    <tr><td>102</td><td>Ben</td><td>Mumbai</td><td>Biryani Bros</td><td>2026-03-02 13:05</td><td>delivered</td><td>450</td></tr>
    <tr><td>103</td><td>Chen</td><td>Pune</td><td>Pizza Point</td><td>2026-03-02 20:30</td><td>delivered</td><td>520</td></tr>
    <tr><td>104</td><td>Asha</td><td>Pune</td><td>Pizza Point</td><td>2026-03-03 13:15</td><td>delivered</td><td>380</td></tr>
    <tr><td>105</td><td>Dia</td><td>Mumbai</td><td>Green Bowl</td><td>2026-03-03 19:45</td><td>pending</td><td>310</td></tr>
  </table>
  <p>For one person entering twenty orders a day, this is perfect. Biteful grows, and three things go wrong in this order.</p>
  <h3>Break 1: two people edit at the same time</h3>
  <p>Support agent Ravi opens the sheet to mark Dia's order 105 as cancelled. One second later accountant Meera opens the same file to fix Asha's amount on order 101. Each now has a private copy in memory. Ravi saves; then Meera saves her copy, which still says "pending" for 105. Here is that exact sequence, run with a real CSV file:</p>
  <div class="fx" data-lang="py">import csv

def read():
    with open("orders.csv") as f:
        return list(csv.DictReader(f))

def write(rows):
    with open("orders.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)

with open("orders.csv", "w") as f:                  # the shared sheet, 2 rows shown
    f.write("order_id,customer,restaurant,status,amount\\n"
            "101,Asha,Dosa Hut,delivered,240\\n"
            "105,Dia,Green Bowl,pending,310\\n")

ravi = read()                      # 10:00:00 Ravi opens the file
meera = read()                     # 10:00:01 Meera opens the same file
ravi[1]["status"] = "cancelled"    # Ravi: Dia cancelled order 105
write(ravi)                        # Ravi saves
meera[0]["amount"] = "250"         # Meera: fix Asha's amount
write(meera)                       # Meera saves HER copy, made before Ravi's save
for row in read():
    print(row)</div>
  <div class="fx" data-lang="text">{'order_id': '101', 'customer': 'Asha', 'restaurant': 'Dosa Hut', 'status': 'delivered', 'amount': '250'}
{'order_id': '105', 'customer': 'Dia', 'restaurant': 'Green Bowl', 'status': 'pending', 'amount': '310'}</div>
  <p>What the code does: <code>read()</code> loads the whole file into a Python list (that is what "opening" a sheet does), <code>write()</code> replaces the whole file. Both people read the same starting version, so Meera's save silently overwrote Ravi's. Order 105 says "pending" again, and a rider may now be sent to Dia. Nobody got an error. This is called a <strong>lost update</strong>.</p>
  <h3>Break 2: it grows</h3>
  <p>Biteful reaches a lakh orders a day. A spreadsheet must load the whole file into memory to show any of it; Excel stops at 1,048,576 rows. Finding one order means scanning the file from the top.</p>
  <h3>Break 3: everyone needs to ask questions</h3>
  <p>"Revenue per restaurant from delivered orders", "which customers ordered twice", "average delivery time in Mumbai". In a sheet each is a manual filter, a pivot or a VLOOKUP, redone by hand every day, or a Python loop over every row.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class WhatsApp group where 40 students edit one shared Excel of marks. Someone's edit always gets lost, the file gets slower every term, and every question to the teacher means scrolling.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>lost update</strong> happens when two people read the same version of some data, both change it, and the second save overwrites the first without either noticing. Any "read the whole thing, edit, save the whole thing" system (a file, a shared sheet) has this problem.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"It works on my laptop" is not evidence. The lost update needs two writers within the same few seconds, which almost never happens with one user and happens every minute with fifty.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: data, database, DBMS.</b> We know what breaks. We need one program that holds the data for everyone, hands out only the rows each person asks for, and answers questions on request.</div>

  <h2 id="di-core"><span class="num">02</span>Data, Database, DBMS</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If people should not each hold a private copy of the sheet, who holds the data, and how do people get at it?</p>
  </div>
  <p>Picture a kirana shop. The owner writes every sale in a notebook: who bought, what, for how much. That notebook works for 20 sales a day. Now picture Swiggy: lakhs of orders a minute, thousands of staff and programs reading the same records. You need a system that stores the records neatly, finds any one in a blink, and never mixes them up. That system is a database. Three words come up again and again. They sound alike, so learn them as a set:</p>
  <div class="cards">
    <div><b>Data</b><p>Raw facts.</p><small>"Asha ordered 2 Masala Dosas from Dosa Hut for ₹240."</small></div>
    <div><b>Database</b><p>An organised collection of data, quick to find and change.</p><small>The <code>biteful</code> tables</small></div>
    <div><b>DBMS</b><p>Database Management System: the software that stores, protects and serves it.</p><small>PostgreSQL, MySQL, MongoDB</small></div>
  </div>
  <p>Most databases keep data in <strong>tables</strong>. A table looks like a sheet. Each <strong>row</strong> is one thing (one customer). Each <strong>column</strong> is one property of that thing (name, city). Biteful's single sheet becomes four tables: <code>customers</code>, <code>restaurants</code>, <code>orders</code> and <code>order_items</code> (the dishes in each order). Why four instead of one is the whole story of <a class="xref" data-note="sql_relational">Relational Model</a>; for now, here are two of them, exactly as the database returns them:</p>
  <div class="fx" data-lang="sql">SELECT * FROM customers;</div>
  <table class="tbl out"><caption>customers</caption><tr><th>customer_id</th><th>name</th><th>city</th><th>signup_date</th><th>referred_by</th></tr><tr><td>1</td><td>Asha</td><td>Pune</td><td>2026-01-05</td><td>NULL</td></tr><tr><td>2</td><td>Ben</td><td>Mumbai</td><td>2026-01-12</td><td>1</td></tr><tr><td>3</td><td>Chen</td><td>Pune</td><td>2026-02-03</td><td>1</td></tr><tr><td>4</td><td>Dia</td><td>Mumbai</td><td>2026-02-20</td><td>NULL</td></tr><tr><td>5</td><td>Esha</td><td>NULL</td><td>2026-03-01</td><td>NULL</td></tr><tr><td>6</td><td>Farah</td><td>Mumbai</td><td>2026-03-02</td><td>2</td></tr><tr><td>7</td><td>Gita</td><td>Pune</td><td>2026-03-04</td><td>NULL</td></tr></table>
  <div class="fx" data-lang="sql">SELECT order_id, customer_id, restaurant_id, ordered_at, status, amount, delivery_minutes FROM orders;</div>
  <table class="tbl out"><caption>orders</caption><tr><th>order_id</th><th>customer_id</th><th>restaurant_id</th><th>ordered_at</th><th>status</th><th>amount</th><th>delivery_minutes</th></tr><tr><td>101</td><td>1</td><td>10</td><td>2026-03-02 12:10:00+05:30</td><td>delivered</td><td>240.00</td><td>32</td></tr><tr><td>102</td><td>2</td><td>11</td><td>2026-03-02 13:05:00+05:30</td><td>delivered</td><td>450.00</td><td>41</td></tr><tr><td>103</td><td>3</td><td>12</td><td>2026-03-02 20:30:00+05:30</td><td>delivered</td><td>520.00</td><td>38</td></tr><tr><td>104</td><td>1</td><td>12</td><td>2026-03-03 13:15:00+05:30</td><td>delivered</td><td>380.00</td><td>NULL</td></tr><tr><td>105</td><td>4</td><td>13</td><td>2026-03-03 19:45:00+05:30</td><td>cancelled</td><td>310.00</td><td>NULL</td></tr><tr><td>106</td><td>2</td><td>11</td><td>2026-03-04 12:40:00+05:30</td><td>delivered</td><td>180.00</td><td>25</td></tr><tr><td>107</td><td>5</td><td>12</td><td>2026-03-04 21:10:00+05:30</td><td>cancelled</td><td>260.00</td><td>NULL</td></tr><tr><td>108</td><td>3</td><td>10</td><td>2026-03-05 18:20:00+05:30</td><td>delivered</td><td>260.00</td><td>29</td></tr><tr><td>109</td><td>6</td><td>11</td><td>2026-03-05 20:05:00+05:30</td><td>delivered</td><td>600.00</td><td>52</td></tr><tr><td>110</td><td>1</td><td>10</td><td>2026-03-08 20:50:00+05:30</td><td>pending</td><td>310.00</td><td>NULL</td></tr></table>
  <p>Notice what changed from the sheet. The order row stores <code>customer_id = 1</code>, not "Asha, Pune": the name and city live once, in <code>customers</code>. Esha's city is <code>NULL</code>, the database's word for "value unknown". Gita (7) has no orders yet but still exists. <code>ordered_at</code> carries its time zone (+05:30 is India). <code>referred_by</code> says which customer invited this one (Ben was referred by Asha); it points back into the same table, which <a class="xref" data-note="sql_relational">Relational Model</a> explains.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="di-ar0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="110" y="20" text-anchor="middle" font-weight="bold">Shop notebook</text>
    <rect x="15" y="30" width="190" height="110" rx="6" class="fs"/>
    <text x="27" y="55" font-size="12">Asha, Pune, joined 5 Jan</text>
    <text x="27" y="80" font-size="12">Ben, Mumbai, joined 12 Jan</text>
    <text x="27" y="105" font-size="12">Chen, Pune, 3 Feb</text>
    <text x="27" y="130" font-size="12" class="tm">Esha, city ?, 1 Mar</text>
    <line x1="215" y1="85" x2="265" y2="85" stroke="currentColor" marker-end="url(#di-ar0)"/>
    <text x="440" y="20" text-anchor="middle" font-weight="bold">Table: customers</text>
    <rect x="275" y="30" width="310" height="22" class="fb sb"/>
    <text x="285" y="46" font-weight="bold" font-size="12">customer_id</text><text x="380" y="46" font-weight="bold" font-size="12">name</text><text x="440" y="46" font-weight="bold" font-size="12">city</text><text x="505" y="46" font-weight="bold" font-size="12">signup</text>
    <g font-size="12">
    <text x="285" y="70">1</text><text x="380" y="70">Asha</text><text x="440" y="70">Pune</text><text x="505" y="70">2026-01-05</text>
    <text x="285" y="92">2</text><text x="380" y="92">Ben</text><text x="440" y="92">Mumbai</text><text x="505" y="92">2026-01-12</text>
    <text x="285" y="114">3</text><text x="380" y="114">Chen</text><text x="440" y="114">Pune</text><text x="505" y="114">2026-02-03</text>
    <text x="285" y="136">5</text><text x="380" y="136">Esha</text><text x="440" y="136" class="tm">NULL</text><text x="505" y="136">2026-03-01</text>
    </g>
    <rect x="275" y="58" width="310" height="18" fill="none" class="sg" stroke-width="2"/>
    <text x="430" y="160" text-anchor="middle" font-size="11" class="tg">one row = one customer · one column = one property</text>
  </svg><figcaption>Same facts, two forms. The table gives every customer the same columns and a unique number, so a computer can search it. NULL means "value unknown".</figcaption></figure>
  <p>You talk to the DBMS in a language called <strong>SQL</strong> (Structured Query Language). A first question: "which customers live in Pune?"</p>
  <div class="fx" data-lang="sql">SELECT name, city FROM customers WHERE city = 'Pune';</div>
  <table class="tbl out"><caption>Result</caption><tr><th>name</th><th>city</th></tr><tr><td>Asha</td><td>Pune</td></tr><tr><td>Chen</td><td>Pune</td></tr><tr><td>Gita</td><td>Pune</td></tr></table>
  <p>Read it like English: <em>select</em> these columns, <em>from</em> this table, <em>where</em> this is true. You never said how to search. And Break 3 from section 01, "revenue per restaurant from delivered orders", is one statement instead of a pivot (the pieces are explained in <a class="xref" data-note="sql_fundamentals">Querying Basics</a>):</p>
  <div class="fx" data-lang="sql">SELECT restaurant_id, SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY restaurant_id
ORDER BY restaurant_id;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>restaurant_id</th><th>revenue</th></tr><tr><td>10</td><td>500.00</td></tr><tr><td>11</td><td>1230.00</td></tr><tr><td>12</td><td>900.00</td></tr></table>
  <p>Check by hand against the orders table: Dosa Hut (10) delivered 101 (240) and 108 (260) = 500; Biryani Bros (11) delivered 102, 106, 109 = 450 + 180 + 600 = 1230; Pizza Point (12) delivered 103 and 104 = 900. Green Bowl's only order was cancelled, so it does not appear.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library. <strong>Books</strong> = data, <strong>shelves + catalogue</strong> = database, <strong>librarian</strong> = DBMS: finds things, stops two people taking the last copy, keeps records if the lights go out. You never walk into the stacks; you ask the librarian.</p>
  </div>
  <div class="flow"><span>Your app / notebook</span><span>Query (SQL)</span><span>DBMS</span><span>Files on disk</span></div>
  <p>You never touch the files. You <em>ask</em>; the DBMS decides how, and it hands each person only the rows they asked for, so there are no private copies to overwrite.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>database</strong> is an organised collection of related data. A <strong>DBMS</strong> is the software that stores it on disk and lets many users and programs read and change it safely through a query language. A <strong>table</strong> (relation) holds rows of the same shape; a <strong>query</strong> is a request written in SQL.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>People say "database" for all three. In an interview, "PostgreSQL is a database" is fine casually, but precisely it's a <strong>DBMS</strong> that manages many databases (our <code>biteful</code> is one of them).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: keeping bad data out.</b> A central home is not enough if anyone can type "abc" into the amount column or an order for a customer who doesn't exist. How does the DBMS refuse rubbish?</div>

  <h2 id="di-integrity"><span class="num">03</span>Keeping Bad Data Out</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A spreadsheet cell accepts anything. If the data now lives in one place that everyone trusts, what stops a typo or a buggy script from poisoning it for everyone?</p>
  </div>
  <p>When Biteful's <code>orders</code> table was created, each column was given a <strong>type</strong> (amount is a decimal number) and some <strong>constraints</strong>: rules the database checks on every insert and update. The amount must be above 0, the status must be one of three words, the order id must be unique, and the customer must exist. Watch the database refuse four bad rows:</p>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES (111, 1, 10, now(), 'delivered', 'abc', 30);</div>
  <div class="fx" data-lang="text">ERROR:  invalid input syntax for type numeric: "abc"</div>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES (111, 1, 10, now(), 'delivered', -5, 30);</div>
  <div class="fx" data-lang="text">ERROR:  new row for relation "orders" violates check constraint "orders_amount_check"
DETAIL:  Failing row contains (111, 1, 10, 2026-10-20 05:25:24.221757+05:30, delivered, -5.00, 30).</div>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES (101, 1, 10, now(), 'delivered', 240, 30);</div>
  <div class="fx" data-lang="text">ERROR:  duplicate key value violates unique constraint "orders_pkey"
DETAIL:  Key (order_id)=(101) already exists.</div>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES (111, 99, 10, now(), 'delivered', 240, 30);</div>
  <div class="fx" data-lang="text">ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
DETAIL:  Key (customer_id)=(99) is not present in table "customers".</div>
  <p>Read each error. The first is a <strong>type</strong> error: "abc" is not a number. The second breaks a <strong>CHECK</strong> constraint (amount &gt; 0). The third repeats the <strong>primary key</strong> 101. The fourth points at customer 99, who does not exist: a <strong>foreign key</strong> violation. A spreadsheet would have accepted all four.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An exam hall invigilator at the door who refuses an answer sheet with no roll number, instead of letting the teacher discover it after the results are out.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Integrity</strong> means the data obeys its rules. A <strong>data type</strong> limits what a column can hold; a <strong>constraint</strong> (NOT NULL, UNIQUE, CHECK, PRIMARY KEY, FOREIGN KEY) is a rule stored with the table and enforced by the DBMS on every write, whichever app or script sends it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Checking input only in the app is not enough. A one-off Python script, a manual fix or a second service skips the app's checks; only rules inside the database guard every door. The full list of constraints is in <a class="xref" data-note="sql_relational">Relational Model</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: many users at once.</b> Each bad row is now refused on its own. But section 01's lost update involved two <em>good</em> edits colliding. Rules about one row cannot stop two people racing for the same thing.</div>

  <h2 id="di-concurrency"><span class="num">04</span>Many Users at Once: Transactions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful runs a promotion: one "free dessert" coupon left. Fans A and B tap "Apply" within the same fraction of a second. Each check sees "1 left". How does the database make sure only one of them gets it?</p>
  </div>
  <p>A <strong>transaction</strong> is a group of steps the database treats as one unit: either all of it happens or none of it. While a transaction changes a row, it holds a <strong>lock</strong> on that row, and any other transaction that wants to change the same row must wait until the first one finishes (commits or rolls back). Here are two real database connections racing for the coupon (B starts 0.2 s after A; A deliberately holds its transaction open for 1 second):</p>
  <div class="fx" data-lang="py">import threading, time
import psycopg

setup = psycopg.connect("dbname=biteful", autocommit=True)
setup.execute("DROP TABLE IF EXISTS coupons")
setup.execute("CREATE TABLE coupons (code TEXT PRIMARY KEY, left_count INT CHECK (left_count &gt;= 0))")
setup.execute("INSERT INTO coupons VALUES ('FREEDESSERT', 1)")

log = []
def say(who, msg):
    log.append(f"t={time.monotonic() - t0:.1f}s  {who}: {msg}")

def fan(who, start_after, hold_for):
    time.sleep(start_after)
    with psycopg.connect("dbname=biteful") as conn:      # a transaction starts automatically
        say(who, "BEGIN, try to take the coupon")
        cur = conn.execute("UPDATE coupons SET left_count = left_count - 1 "
                           "WHERE code = 'FREEDESSERT' AND left_count &gt; 0")
        say(who, f"rows updated = {cur.rowcount}")
        time.sleep(hold_for)                             # still inside the transaction
        conn.commit()
        say(who, "COMMIT")

t0 = time.monotonic()
a = threading.Thread(target=fan, args=("A", 0.0, 1.0))
b = threading.Thread(target=fan, args=("B", 0.2, 0.0))
a.start(); b.start(); a.join(); b.join()
print("\\n".join(log))
print("coupons left:", setup.execute("SELECT left_count FROM coupons").fetchone()[0])</div>
  <div class="fx" data-lang="text">t=0.0s  A: BEGIN, try to take the coupon
t=0.0s  A: rows updated = 1
t=0.2s  B: BEGIN, try to take the coupon
t=1.0s  A: COMMIT
t=1.0s  B: rows updated = 0
t=1.0s  B: COMMIT
coupons left: 0</div>
  <p>Trace the timeline. At 0.0 s A's UPDATE finds 1 coupon, takes it (1 row updated) and now holds the lock. At 0.2 s B sends the same UPDATE, but B's line "rows updated" does not appear until the same instant as A's COMMIT, about a second later: B spent that time <em>waiting</em> for A's lock. (Exact timings vary by a fraction of a second between runs; the order of events never does.) When A commits, B re-checks the row, sees <code>left_count = 0</code>, the condition <code>left_count &gt; 0</code> is false, and B updates 0 rows. One coupon, one winner, and B gets a clean "sorry" instead of a double-spend.</p>
  <figure class="viz"><svg viewBox="0 0 600 180" width="600">
    <text x="145" y="20" text-anchor="middle" font-weight="bold" class="tr">CSV file</text>
    <rect x="15" y="34" width="260" height="20" rx="4" class="fb"/><text x="25" y="48">A: read coupons left = 1</text>
    <rect x="15" y="60" width="260" height="20" rx="4" class="fv"/><text x="25" y="74">B: read coupons left = 1</text>
    <rect x="15" y="86" width="260" height="20" rx="4" class="fb"/><text x="25" y="100">A: apply, write left = 0</text>
    <rect x="15" y="112" width="260" height="20" rx="4" class="fv"/><text x="25" y="126">B: apply, write left = 0</text>
    <text x="145" y="160" text-anchor="middle" font-weight="bold" class="tr">2 desserts given, 1 coupon ✗</text>
    <line x1="300" y1="10" x2="300" y2="170" stroke="currentColor" stroke-dasharray="4 4" opacity="0.4"/>
    <text x="455" y="20" text-anchor="middle" font-weight="bold" class="tg">Database transactions</text>
    <rect x="325" y="34" width="260" height="20" rx="4" class="fb"/><text x="335" y="48">A: BEGIN, UPDATE, lock the row</text>
    <rect x="325" y="60" width="260" height="20" rx="4" class="fv"/><text x="335" y="74">B: UPDATE waits for the lock…</text>
    <rect x="325" y="86" width="260" height="20" rx="4" class="fb"/><text x="335" y="100">A: left = 0, COMMIT</text>
    <rect x="325" y="112" width="260" height="20" rx="4" class="fv"/><text x="335" y="126">B: re-checks, 0 rows, fails cleanly</text>
    <text x="455" y="160" text-anchor="middle" font-weight="bold" class="tg">1 dessert given, 1 coupon ✓</text>
  </svg><figcaption>Time runs downward. A file lets both reads see "1 left"; a transaction makes B wait, then see the truth.</figcaption></figure>
  <p>The same thing happens in IRCTC Tatkal booking at 10 AM: thousands of people, a few seats, and nobody may get the same berth.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A single bathroom key at a petrol pump. Whoever holds the key goes in; the next person waits at the door. Nobody walks in on anybody, and the queue is fair.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>transaction</strong> is a sequence of operations that succeeds or fails as one unit (<code>BEGIN</code> … <code>COMMIT</code>, or <code>ROLLBACK</code> to undo). A <strong>lock</strong> stops a second transaction from changing a row until the first finishes. The four promises a DBMS makes about transactions are called <strong>ACID</strong> (Atomicity, Consistency, Isolation, Durability), covered in <a class="xref" data-note="db_types">Types of Databases</a> and <a class="xref" data-note="sql_transactions">Transactions</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Read, then decide in Python, then write" re-creates the race even inside a database: both programs can read 1 before either writes. Put the condition in the same statement (<code>WHERE left_count &gt; 0</code>) or lock the row when you read it (<code>SELECT … FOR UPDATE</code>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: from SQL text to a plan.</b> We keep sending the DBMS lines of text and getting correct rows back. What actually happens between the text going in and the rows coming out?</div>

  <h2 id="di-inside"><span class="num">05</span>From SQL Text to a Plan</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>SQL only says <em>what</em> we want ("Pune customers"). Someone must check that the request makes sense and then decide <em>how</em> to fetch the rows. Who does that, and can we see their decision?</p>
  </div>
  <p>Three parts of the DBMS handle every query, in this order. Each exists because of one problem.</p>
  <h3>Problem 1: the request might be nonsense → the parser</h3>
  <p>The text could be misspelled or name a column that doesn't exist. The <strong>parser</strong> checks the grammar first, then checks every table and column name against the database's own catalogue:</p>
  <div class="fx" data-lang="sql">SELEC name FROM customers;
SELECT nam FROM customers;</div>
  <div class="fx" data-lang="text">ERROR:  syntax error at or near "SELEC"
LINE 1: SELEC name FROM customers;
        ^
ERROR:  column "nam" does not exist
LINE 1: SELECT nam FROM customers;
               ^
HINT:  Perhaps you meant to reference the column "customers.name".</div>
  <p>The first line fails the grammar check (there is no word SELEC). The second is grammatical, but <code>nam</code> is not a column of <code>customers</code>; PostgreSQL even suggests the right one. Nothing has been read from the table yet: errors like these are caught before any work is done.</p>
  <h3>Problem 2: there are many ways to fetch the rows → the planner</h3>
  <p>"Pune customers" could be answered by reading every row and keeping the Pune ones, or by using an index if one exists, and with several tables there are many join orders. The <strong>planner</strong> (also called the optimizer) estimates the cost of each way and picks the cheapest. Put <code>EXPLAIN</code> in front of a query to see the plan it chose:</p>
  <div class="fx" data-lang="sql">EXPLAIN SELECT name FROM customers WHERE city = 'Pune';</div>
  <div class="fx" data-lang="text">Seq Scan on customers  (cost=0.00..19.75 rows=4 width=32)
  Filter: (city = 'Pune'::text)</div>
  <p><strong>Seq Scan</strong> means "read every row, one after another, and keep those that pass the filter". With 7 customers that is the cheapest way. The numbers are the planner's estimates: <code>cost</code> is in made-up units (start-up..total), <code>rows=4</code> is its guess at how many rows match (the true answer is 3; for a tiny, never-analysed table it guesses), <code>width</code> is bytes per row.</p>
  <h3>Problem 3: someone must do the work → the executor</h3>
  <p>The <strong>executor</strong> follows the chosen plan step by step, reading data and passing rows up to you.</p>
  <figure class="viz"><svg viewBox="0 0 600 240" width="600">
    <defs><marker id="di-ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="115" height="52" rx="8" class="fs"/>
    <text x="67" y="52" text-anchor="middle" font-weight="bold">Query</text><text x="67" y="70" text-anchor="middle" font-size="10" class="tm">SELECT … WHERE</text>
    <rect x="160" y="30" width="115" height="52" rx="8" class="fb sb"/>
    <text x="217" y="52" text-anchor="middle" font-weight="bold">Parser</text><text x="217" y="70" text-anchor="middle" font-size="10" class="tm">grammar + names</text>
    <rect x="310" y="30" width="115" height="52" rx="8" class="fv"/>
    <text x="367" y="52" text-anchor="middle" font-weight="bold">Planner</text><text x="367" y="70" text-anchor="middle" font-size="10" class="tm">scan or index?</text>
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
  </svg><figcaption>The parser checks, the planner picks the plan, the executor reads pages from RAM if cached, otherwise fetches 8 KB pages from disk. The bottom half is the next section.</figcaption></figure>
  <p>This split is what <strong>declarative</strong> means: you say <em>what</em>, the planner decides <em>how</em>. The same query keeps working, and often gets faster, when the data grows or an index is added, without you rewriting it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A restaurant. You order (query). The waiter checks the dish is on the menu (parser). The chef decides which pan and in what order to cook (planner). The kitchen staff cook it (executor). Ingredients on the counter (cache) are fast; the store room (disk) is slow.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>parser</strong> turns SQL text into a checked query tree; the <strong>planner/optimizer</strong> chooses an execution plan by estimated cost; the <strong>executor</strong> runs it. <code>EXPLAIN</code> shows the plan; <code>EXPLAIN ANALYZE</code> also runs it and shows what really happened.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The order you write SQL clauses in is not the order the database does the work, and the plan can change when data grows. Never assume "it read the rows in the order I expect": ask for an order with <code>ORDER BY</code>, and read plans with <code>EXPLAIN</code> (see <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: pages, cache and indexes.</b> Every plan ends with "read data from disk". Disk is the slowest part of the computer. How is data laid out so the executor reads as little as possible?</div>

  <h2 id="di-storage"><span class="num">06</span>Pages, Cache &amp; Indexes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The executor needs rows that live on disk. Fetching from disk is roughly a thousand times slower than from memory. How does a database avoid reading more than it must, especially when the table is huge?</p>
  </div>
  <h3>Problem: disks hand out blocks, not rows → pages</h3>
  <p>Disks and operating systems read in fixed blocks, so PostgreSQL stores every table as a sequence of <strong>pages</strong> of 8 KB (8,192 bytes) each. Fetching one row costs about the same as fetching the whole page around it. How big is Biteful's <code>orders</code> table?</p>
  <div class="fx" data-lang="sql">SELECT pg_relation_size('orders') AS bytes,
       pg_relation_size('orders') / 8192 AS pages,
       current_setting('block_size') AS page_size;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>bytes</th><th>pages</th><th>page_size</th></tr><tr><td>8192</td><td>1</td><td>8192</td></tr></table>
  <p>All ten orders fit in one page. Every row also has a hidden address, <code>ctid</code> = (page number, slot in the page):</p>
  <div class="fx" data-lang="sql">SELECT ctid, order_id, amount FROM orders WHERE order_id IN (101, 102, 110);</div>
  <table class="tbl out"><caption>Result</caption><tr><th>ctid</th><th>order_id</th><th>amount</th></tr><tr><td>(0,1)</td><td>101</td><td>240.00</td></tr><tr><td>(0,2)</td><td>102</td><td>450.00</td></tr><tr><td>(0,10)</td><td>110</td><td>310.00</td></tr></table>
  <p>Page 0, slots 1, 2 and 10: the whole table is page 0.</p>
  <h3>Problem: the same pages are read again and again → buffer cache</h3>
  <p>Popular pages (today's orders) are read thousands of times a minute. The DBMS keeps recently used pages in RAM, in the <strong>buffer cache</strong>. <code>EXPLAIN (ANALYZE, BUFFERS)</code> runs the query and counts pages: <code>shared hit</code> = found in the cache, <code>read</code> = fetched from disk.</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM orders WHERE status = 'pending';</div>
  <div class="fx" data-lang="text">Seq Scan on orders (actual rows=1 loops=1)
  Filter: (status = 'pending'::text)
  Rows Removed by Filter: 9
  Buffers: shared hit=1
Planning:
  Buffers: shared hit=48</div>
  <p>One page, already in RAM: the whole query touched 1 page of table data.</p>
  <h3>Problem: a huge table means reading every page → index</h3>
  <p>Biteful will not stay at 10 orders. Here is the same idea at scale: a copy with 200,000 orders. Find one order by id, first without and then with an index:</p>
  <div class="fx" data-lang="sql">EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM big_orders WHERE order_id = 177777;
CREATE INDEX big_orders_id_idx ON big_orders (order_id);
EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM big_orders WHERE order_id = 177777;</div>
  <div class="fx" data-lang="text">Seq Scan on big_orders (actual rows=1 loops=1)
  Filter: (order_id = 177777)
  Rows Removed by Filter: 199999
  Buffers: shared hit=1088
Planning:
  Buffers: shared hit=16</div>
  <div class="fx" data-lang="text">Index Scan using big_orders_id_idx on big_orders (actual rows=1 loops=1)
  Index Cond: (order_id = 177777)
  Buffers: shared hit=1 read=3
Planning:
  Buffers: shared hit=15 read=1</div>
  <p>(The table was built with <code>generate_series</code>, 200,000 synthetic rows; that setup is not shown.) Without an index the Seq Scan touched every one of the table's pages and threw away 199,999 rows to find one. With an index it touched 4 pages. An <strong>index</strong> is a separate sorted structure (a B-tree: a shallow tree of sorted pages) that maps each <code>order_id</code> to its row's address. Like the index at the back of a textbook: instead of reading all 500 pages to find "photosynthesis", you look it up and jump to page 212. Biteful's <code>orders</code> already has one, created automatically for the primary key <code>order_id</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A warehouse. Goods are stored in fixed-size crates (pages); you always carry a whole crate. The crates you need every hour sit near the door (buffer cache). A catalogue at the entrance says which crate holds item 177777 (index), so you don't open all 1,088 crates.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>page</strong> (block) is the fixed-size unit of storage and I/O (8 KB in PostgreSQL). The <strong>buffer cache</strong> keeps recently used pages in memory. An <strong>index</strong> is an extra data structure, usually a B-tree, that finds rows by a column's value without scanning the table; it costs disk space and slows writes a little, because every insert must also update the index.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Seq Scan" is not automatically bad. On Biteful's 1-page table, reading that page is the fastest possible plan, and for a query that returns most rows a scan beats an index. It is bad on a big table when you want a few rows. Details in <a class="xref" data-note="sql_optimization">Indexes &amp; Performance</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: surviving a crash.</b> Pages are changed in memory and written back to disk later. If the power fails between "the customer was told the order is placed" and "the page reached disk", is the order lost?</div>

  <h2 id="di-wal"><span class="num">07</span>Surviving a Crash: the WAL</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Writing a changed 8 KB page to its place on disk is slow and can be cut off halfway by a power failure, leaving a half-written page. Yet the app must say "order placed" quickly and never lose it. How can both be true?</p>
  </div>
  <p>The answer is <strong>log first, table later</strong>. Every change is first appended as a small record to the end of a <strong>write-ahead log</strong> (WAL) file, and that file is flushed to disk. Appending a few hundred bytes to the end of one file is fast. Only after the flush does the DBMS say "committed". The table's pages are written back later, in batches. Measure how much log one new Biteful order produces:</p>
  <div class="fx" data-lang="py">import psycopg

with psycopg.connect("dbname=biteful", autocommit=True) as conn:
    before = conn.execute("SELECT pg_current_wal_lsn()").fetchone()[0]
    conn.execute("INSERT INTO orders VALUES (111, 7, 14, now(), 'pending', 200, NULL)")
    after = conn.execute("SELECT pg_current_wal_lsn()").fetchone()[0]
    size = conn.execute("SELECT pg_wal_lsn_diff(%s, %s)", (after, before)).fetchone()[0]
    print("WAL position before:", before)
    print("WAL position after :", after)
    print("log bytes for one INSERT:", size)
    print("synchronous_commit =", conn.execute("SHOW synchronous_commit").fetchone()[0])</div>
  <div class="fx" data-lang="text">WAL position before: 0/48232458
WAL position after : 0/48232590
log bytes for one INSERT: 312
synchronous_commit = on</div>
  <p>What the code does: <code>pg_current_wal_lsn()</code> returns the current end of the log (an LSN, "log sequence number", is a byte position written in hex). The difference after one INSERT (Gita's first order, from Momo Magic) is the size of the log record(s) for the new row plus its index entry and the commit. <code>synchronous_commit = on</code> means the commit waits for that log to reach disk.</p>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="di-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="25" width="120" height="50" rx="8" class="fs"/>
    <text x="70" y="46" text-anchor="middle" font-weight="bold">1. INSERT</text><text x="70" y="63" text-anchor="middle" font-size="10" class="tm">order 111 arrives</text>
    <rect x="170" y="25" width="150" height="50" rx="8" class="fv"/>
    <text x="245" y="46" text-anchor="middle" font-weight="bold">2. WAL</text><text x="245" y="63" text-anchor="middle" font-size="10" class="tm">append + flush</text>
    <rect x="360" y="25" width="110" height="50" rx="8" class="fg sg"/>
    <text x="415" y="46" text-anchor="middle" font-weight="bold">3. COMMIT</text><text x="415" y="63" text-anchor="middle" font-size="10" class="tm">"order placed"</text>
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
  <p>Read the numbers 1 to 4. You are told "saved" at step 3, before the table page itself is touched on disk. If the server dies after step 3, the log still has the change, and on restart the DBMS replays it (<strong>recovery</strong>). A transaction that never reached its commit record is simply not replayed, so half-done work disappears.</p>
  <div class="callout anlg"><span class="label">Analogy: WAL</span>
    <p>A shopkeeper writes each sale in a receipt book <em>before</em> moving stock. If the shelves fall, the book says what they should hold.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>write-ahead log</strong> is an append-only file of change records. Rule: a change's log record must be on disk before the changed page is, and before the commit is acknowledged. This gives <strong>durability</strong> (the D in ACID) and crash recovery. The same log is also what replicas and CDC tools read to copy changes elsewhere (section 10).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Turning off log flushing for speed (<code>fsync = off</code>, or <code>synchronous_commit = off</code>) trades safety for speed: with <code>synchronous_commit = off</code> a crash can lose the last fraction of a second of "committed" orders, and with <code>fsync = off</code> it can corrupt the database. Know which one you changed.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: schema and data shapes.</b> Every safeguard so far assumed the database knows each table's exact columns and types in advance. Who writes that blueprint, and what about Biteful data that doesn't fit neat columns, like menus and dish photos?</div>

  <h2 id="di-schema"><span class="num">08</span>Schema &amp; Data Shapes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Types, constraints and indexes all hang off a fixed description of each table. Where does that description live, and what happens to data whose shape varies from record to record?</p>
  </div>
  <p>Think of an exam answer sheet with printed boxes: Roll No, Name, Subject Code. Every student fills the same boxes; checking 1,000 sheets is easy because the shape is fixed. A <strong>schema</strong> is that printed sheet for a database: which tables exist, their columns, types and rules. The database stores its own schema, and you can query it like any table:</p>
  <div class="fx" data-lang="sql">SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>column_name</th><th>data_type</th><th>is_nullable</th></tr><tr><td>order_id</td><td>integer</td><td>NO</td></tr><tr><td>customer_id</td><td>integer</td><td>NO</td></tr><tr><td>restaurant_id</td><td>integer</td><td>NO</td></tr><tr><td>ordered_at</td><td>timestamp with time zone</td><td>NO</td></tr><tr><td>status</td><td>text</td><td>NO</td></tr><tr><td>amount</td><td>numeric</td><td>NO</td></tr><tr><td>delivery_minutes</td><td>integer</td><td>YES</td></tr></table>
  <p>This is the blueprint the parser checked names against (section 05) and the integrity checks used (section 03): <code>amount</code> is numeric and NOT NULL, <code>delivery_minutes</code> may be NULL (not delivered yet, or not recorded). Not all data fits neat boxes, though. Data comes in three shapes:</p>
  <div class="cards">
    <div><b>Structured</b><p>Fixed columns and types. Every row has the same shape.</p><small>Biteful's orders, payments, customers → SQL tables</small></div>
    <div><b>Semi-structured</b><p>Has fields, but they vary per record and can nest.</p><small>Menus, app click events (JSON) → MongoDB, JSONB</small></div>
    <div><b>Unstructured</b><p>No fields at all: blobs of content.</p><small>Dish photos, support-call audio → object storage (S3); embeddings → vector DB</small></div>
  </div>
  <p>Example of semi-structured: a Dosa Hut menu item has "spice level" and "chutneys"; a Pizza Point item has "size" and "crust". Both are menu items, but their fields differ. Forcing both into one fixed table means many empty columns. There are two moments when the shape can be checked: when data goes <em>in</em>, or when someone reads it <em>out</em>.</p>
  <table class="tbl">
    <tr><th></th><th>Schema-on-write (SQL)</th><th>Schema-on-read (NoSQL, data lakes)</th></tr>
    <tr><td>When is shape checked?</td><td>On insert: bad rows are rejected (section 03)</td><td>When you read and interpret it</td></tr>
    <tr><td>Strength</td><td>Clean, trustworthy data</td><td>Flexible, fast to start</td></tr>
    <tr><td>Cost</td><td>Changing structure needs a migration (a script that changes the tables)</td><td>Every reader must handle messy or missing fields</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Schema-on-write is the exam hall invigilator who rejects a sheet with no roll number at the door. Schema-on-read is collecting every sheet as-is and letting the teacher deal with missing roll numbers later.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>schema</strong> is the formal description of the data: tables, columns, types, keys and constraints. <strong>Schema-on-write</strong> enforces it when data is stored; <strong>schema-on-read</strong> stores raw data and applies a structure when it is read.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"NoSQL is schemaless" is misleading. The schema still exists: the app still expects a menu item to have a name and a price. It has just moved from the database into your application code, where nobody enforces it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SQL vs NoSQL.</b> Different data shapes pull towards different kinds of database. What are the two big families, and how do you choose?</div>

  <h2 id="di-sqlnosql"><span class="num">09</span>SQL vs NoSQL</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Fixed tables suit Biteful's orders; menus and click events vary. Is there one kind of database for everything, or families built for different shapes and sizes?</p>
  </div>
  <p>Databases fall into two big families. <strong>SQL</strong> (or relational) databases store tables and link them by ids. <strong>NoSQL</strong> means "not only SQL": everything else, built for shapes or sizes that tables handle badly. Two terms first. <strong>Scaling vertically</strong> (scale up) = buy one bigger machine. <strong>Scaling horizontally</strong> (scale out) = add more machines and split the data.</p>
  <table class="tbl">
    <tr><th></th><th>SQL / Relational</th><th>NoSQL</th></tr>
    <tr><td>Data model</td><td>Tables of rows, linked by keys</td><td>Documents, key-value, graphs, wide columns</td></tr>
    <tr><td>Schema</td><td>Fixed, enforced on write</td><td>Flexible, usually checked on read</td></tr>
    <tr><td>Relationships</td><td>JOINs at query time</td><td>Usually embedded / duplicated</td></tr>
    <tr><td>Guarantees</td><td>Strong ACID transactions</td><td>Varies; often tuned for availability and speed</td></tr>
    <tr><td>Scaling</td><td>Mostly vertical (bigger machine) + read replicas</td><td>Built to scale horizontally (more machines)</td></tr>
    <tr><td>Biteful example</td><td>Orders, customers, restaurants, payments</td><td>Menus (document), carts (key-value), rider GPS pings (wide-column)</td></tr>
    <tr><td>Products</td><td>PostgreSQL, MySQL, SQLite, SQL Server</td><td>MongoDB, Redis, Cassandra, Neo4j</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A SQL database is a school office with fixed registers that cross-reference each other by roll number. A NoSQL document store is a file per student with everything stuffed inside: quick to grab one student, harder to answer "how many students in all classes took Hindi?"</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>relational (SQL) database</strong> stores data as tables with a fixed schema, related through keys and queried with SQL. <strong>NoSQL</strong> is an umbrella for non-tabular models (document, key-value, wide-column, graph) that trade some of SQL's structure or guarantees for flexibility or horizontal scale.</p>
  </div>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>Start with PostgreSQL. Move a specific workload to NoSQL only when you can name the reason: huge write volume, a truly flexible shape, sub-millisecond caching, or graph traversal. <a class="xref" data-note="db_types">Types of Databases</a> covers each family on Biteful's data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"NoSQL is faster" has no meaning without "faster at what". A key-value store is faster at fetching one cart by key and far slower at "revenue per restaurant", which it cannot even express.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: OLTP vs OLAP.</b> Even if everything stays relational, Biteful's app and Biteful's analysts use the data in opposite ways. Can one database serve both?</div>

  <h2 id="di-stack"><span class="num">10</span>OLTP vs OLAP: the App DB and the Warehouse</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The app places one order at a time, thousands of times a minute, and must never be slow. The analyst wants "revenue per restaurant per day for two years", which reads everything. What happens if both hit the same database?</p>
  </div>
  <p>The two kinds of work have names. The app's work is <strong>OLTP</strong> (online transaction processing): many tiny reads and writes, each touching a few rows. Placing an order:</p>
  <div class="fx" data-lang="sql">INSERT INTO orders VALUES (111, 7, 14, now(), 'pending', 200, NULL)
RETURNING order_id, customer_id, status, amount;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>order_id</th><th>customer_id</th><th>status</th><th>amount</th></tr><tr><td>111</td><td>7</td><td>pending</td><td>200.00</td></tr></table>
  <p>One row, one page, a few milliseconds. The analyst's work is <strong>OLAP</strong> (online analytical processing): few, huge queries that scan and aggregate history:</p>
  <div class="fx" data-lang="sql">SELECT ordered_at::date AS day, restaurant_id, COUNT(*) AS orders, SUM(amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY 1, 2
ORDER BY 1, 2;</div>
  <table class="tbl out"><caption>Result</caption><tr><th>day</th><th>restaurant_id</th><th>orders</th><th>revenue</th></tr><tr><td>2026-03-02</td><td>10</td><td>1</td><td>240.00</td></tr><tr><td>2026-03-02</td><td>11</td><td>1</td><td>450.00</td></tr><tr><td>2026-03-02</td><td>12</td><td>1</td><td>520.00</td></tr><tr><td>2026-03-03</td><td>12</td><td>1</td><td>380.00</td></tr><tr><td>2026-03-04</td><td>11</td><td>1</td><td>180.00</td></tr><tr><td>2026-03-05</td><td>10</td><td>1</td><td>260.00</td></tr><tr><td>2026-03-05</td><td>11</td><td>1</td><td>600.00</td></tr></table>
  <p>On 10 orders it is instant. On two years of a real company it reads hundreds of millions of rows, competing with the app for CPU, memory and disk. So a real company copies the app's data into a separate store built for scans:</p>
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
  <p>Read the top row left to right: orders are written to the App DB, a copy job (<strong>ETL</strong> = extract, transform, load, usually nightly; <strong>CDC</strong> = change data capture, which streams each change by reading the WAL from section 07) moves them to a warehouse, and dashboards and ML read from there. The bottom row shows helper stores fed from the same copies.</p>
  <table class="tbl">
    <tr><th></th><th>OLTP (online transaction processing)</th><th>OLAP (online analytical processing)</th></tr>
    <tr><td>Biteful query</td><td>"Place order 111": tiny, thousands per second</td><td>"Revenue per restaurant per day": huge, few</td></tr>
    <tr><td>Needs</td><td>Fast and correct per row; transactions</td><td>Fast scans over history</td></tr>
    <tr><td>Storage</td><td>Row store (a row's values together)</td><td>Column store (a column's values together)</td></tr>
    <tr><td>Products</td><td>PostgreSQL, MySQL</td><td>BigQuery, Snowflake, Redshift, ClickHouse, DuckDB</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>OLTP is the billing counter at a supermarket: many small, quick bills. OLAP is the head office adding up every bill of the year. If head office did that at the billing counter, the queue would stop.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>OLTP</strong> systems serve an application's short transactions on current data; <strong>OLAP</strong> systems serve analytical queries that aggregate large amounts of historical data. A <strong>data warehouse</strong> is an OLAP database fed from the OLTP systems by ETL or CDC.</p>
  </div>
  <div class="callout trap"><span class="label">Why a data scientist cares</span>
    <p>You mostly query the warehouse. Heavy analytics on the production OLTP database slows the live app; the warehouse may lag the app by minutes or a day, so check how fresh it is.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have met ten ideas, each fixing one failure. Before moving on to the families of databases, let's see them as one system.</div>

  <h2 id="di-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>DBMS, constraints, transactions, parser, planner, pages, cache, index, WAL, schema, OLTP/OLAP: a list of unrelated words, or one design where each part exists because of another?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 300" width="700">
<defs><marker id="di-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="130" height="44" rx="7" class="fr sr"/><text x="75" y="39" text-anchor="middle" font-size="11.5" font-weight="700">Spreadsheet</text><text x="75" y="55" text-anchor="middle" class="tm" font-size="10">lost update, slow, manual</text>
<line x1="140" y1="42" x2="168" y2="42" stroke="currentColor" marker-end="url(#di-a9)"/>
<rect x="170" y="20" width="130" height="44" rx="7" class="fb sb"/><text x="235" y="39" text-anchor="middle" font-size="11.5" font-weight="700">DBMS + SQL</text><text x="235" y="55" text-anchor="middle" class="tm" font-size="10">one home, ask in SQL</text>
<line x1="300" y1="42" x2="328" y2="42" stroke="currentColor" marker-end="url(#di-a9)"/>
<rect x="330" y="20" width="160" height="44" rx="7" class="fb sb"/><text x="410" y="39" text-anchor="middle" font-size="11.5" font-weight="700">Schema</text><text x="410" y="55" text-anchor="middle" class="tm" font-size="10">tables, types, rules</text>
<line x1="410" y1="64" x2="300" y2="98" stroke="currentColor" marker-end="url(#di-a9)"/><line x1="410" y1="64" x2="470" y2="98" stroke="currentColor" marker-end="url(#di-a9)"/>
<rect x="200" y="100" width="160" height="44" rx="7" class="fg sg"/><text x="280" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Constraints</text><text x="280" y="135" text-anchor="middle" class="tm" font-size="10">4 bad rows refused</text>
<rect x="400" y="100" width="150" height="44" rx="7" class="fg sg"/><text x="475" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Parser</text><text x="475" y="135" text-anchor="middle" class="tm" font-size="10">checks names in schema</text>
<line x1="235" y1="64" x2="110" y2="98" stroke="currentColor" marker-end="url(#di-a9)"/>
<rect x="20" y="100" width="160" height="44" rx="7" class="fg sg"/><text x="100" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Transactions + locks</text><text x="100" y="135" text-anchor="middle" class="tm" font-size="10">1 coupon, 1 winner</text>
<line x1="550" y1="122" x2="578" y2="122" stroke="currentColor" marker-end="url(#di-a9)"/>
<rect x="580" y="100" width="110" height="44" rx="7" class="fg sg"/><text x="635" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Planner</text><text x="635" y="135" text-anchor="middle" class="tm" font-size="10">Seq Scan / Index</text>
<line x1="635" y1="144" x2="635" y2="178" stroke="currentColor" marker-end="url(#di-a9)"/>
<rect x="560" y="180" width="130" height="44" rx="7" class="fv"/><text x="625" y="199" text-anchor="middle" font-size="11.5" font-weight="700">Executor</text><text x="625" y="215" text-anchor="middle" class="tm" font-size="10">reads pages</text>
<line x1="560" y1="202" x2="478" y2="202" stroke="currentColor" marker-end="url(#di-a9)"/>
<rect x="300" y="180" width="176" height="44" rx="7" class="fv"/><text x="388" y="199" text-anchor="middle" font-size="11.5" font-weight="700">Pages + cache + index</text><text x="388" y="215" text-anchor="middle" class="tm" font-size="10">1 page; 4 vs 1,088</text>
<line x1="100" y1="144" x2="100" y2="178" stroke="currentColor" marker-end="url(#di-a9)"/>
<rect x="20" y="180" width="160" height="44" rx="7" class="fv"/><text x="100" y="199" text-anchor="middle" font-size="11.5" font-weight="700">WAL</text><text x="100" y="215" text-anchor="middle" class="tm" font-size="10">log first: 312 bytes</text>
<line x1="300" y1="202" x2="182" y2="202" stroke="currentColor" marker-end="url(#di-a9)"/>
<line x1="100" y1="224" x2="100" y2="250" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#di-a9)"/>
<rect x="20" y="252" width="300" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="170" y="276" text-anchor="middle" font-size="11">CDC reads the WAL → warehouse (OLAP)</text>
<text x="350" y="276" font-size="10.5" class="tm">OLTP app DB = everything above</text>
</svg><figcaption>Read from the top-left. The spreadsheet's failures create the DBMS. The schema feeds both the constraints (what may be stored) and the parser (what may be asked). Transactions need the WAL to be durable. The planner chooses how the executor reads pages, and the WAL is also the feed that copies data to the warehouse.</figcaption></figure>
  <table class="tbl"><caption>Every idea on Biteful's data</caption>
    <tr><th>Concept</th><th>Built from / needs</th><th>Answers which question</th><th>On Biteful</th><th>Use / watch when</th></tr>
    <tr><td>Spreadsheet</td><td>a file, private copies</td><td>where do records live?</td><td>Dia's cancellation lost</td><td>one person, small data</td></tr>
    <tr><td>Database + DBMS</td><td>tables + a server you query</td><td>who holds the data for everyone?</td><td>Pune customers: Asha, Chen, Gita</td><td>any shared data</td></tr>
    <tr><td>Types &amp; constraints</td><td>the schema</td><td>how is rubbish kept out?</td><td>'abc', −5, dup 101, customer 99 refused</td><td>always; rules belong in the DB</td></tr>
    <tr><td>Transaction + lock</td><td>WAL (for durability), row locks</td><td>two users want the same thing?</td><td>coupon: A wins, B waits for A's commit, gets 0</td><td>any read-then-write</td></tr>
    <tr><td>Parser</td><td>schema catalogue</td><td>does the request make sense?</td><td>SELEC, nam rejected</td><td>every query</td></tr>
    <tr><td>Planner + EXPLAIN</td><td>statistics, indexes</td><td>which way is cheapest?</td><td>Seq Scan on customers</td><td>slow queries</td></tr>
    <tr><td>Pages + buffer cache</td><td>disk blocks, RAM</td><td>how to read as little as possible?</td><td>orders = 1 page (8,192 bytes)</td><td>sizing, performance</td></tr>
    <tr><td>Index</td><td>pages + sorting (B-tree)</td><td>find a few rows in a big table?</td><td>4 pages instead of 1,088</td><td>selective lookups; costs writes</td></tr>
    <tr><td>WAL</td><td>append-only log, flush</td><td>never lose a confirmed write?</td><td>one insert = 312 bytes of log</td><td>always on; also feeds replicas/CDC</td></tr>
    <tr><td>Schema &amp; shapes</td><td>information_schema</td><td>who defines the shape?</td><td>orders: 7 typed columns</td><td>structured vs JSON vs blobs</td></tr>
    <tr><td>SQL vs NoSQL</td><td>data shape + scale</td><td>which family?</td><td>orders SQL; menus document</td><td>default SQL; NoSQL for a named reason</td></tr>
    <tr><td>OLTP vs OLAP</td><td>row vs column storage, ETL/CDC</td><td>app and analytics on one DB?</td><td>insert 111 vs revenue per day</td><td>analysts use the warehouse</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a database is a spreadsheet that has been forced, failure by failure, to share safely, keep its rules, find things fast and survive crashes.</strong> Sharing gave the DBMS and transactions; rules gave the schema and constraints; speed gave the planner, pages and indexes; crashes gave the WAL; and the clash between the app and the analysts gave the OLTP/OLAP split. When you meet a new database product, ask how it solves each of these five, and what it gave up.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="di-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: <strong>Biteful</strong>, a food-delivery company in Pune and Mumbai, with tables <code>customers</code> (7 rows: Asha … Gita; Esha's city is NULL, Gita has no orders), <code>restaurants</code> (5), <code>orders</code> (10: ids 101–110, 2–8 March 2026; 7 delivered, 2 cancelled, 1 pending) and <code>order_items</code> (15). All queries ran on PostgreSQL 16.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Spreadsheet</td><td>where do records live?</td><td>shared CSV of orders</td><td>lost update, slow, manual → DBMS</td></tr>
    <tr><td>Database + DBMS</td><td>who holds data for everyone?</td><td><code>WHERE city = 'Pune'</code> → Asha, Chen, Gita</td><td>rubbish can get in → constraints</td></tr>
    <tr><td>Types &amp; constraints</td><td>how to refuse bad rows?</td><td>'abc', −5, duplicate 101, customer 99 all refused</td><td>can't stop races → transactions</td></tr>
    <tr><td>Transactions &amp; locks</td><td>two users, one thing?</td><td>last coupon: A gets it, B waits, B updates 0 rows</td><td>how is SQL understood? → parser/planner</td></tr>
    <tr><td>Parser, planner, executor</td><td>from text to rows?</td><td>SELEC / nam rejected; EXPLAIN → Seq Scan</td><td>disk is slow → pages, index</td></tr>
    <tr><td>Pages, cache, index</td><td>read as little as possible?</td><td>orders = 1 page; index 4 pages vs 1,088</td><td>crash mid-write → WAL</td></tr>
    <tr><td>WAL</td><td>never lose a commit?</td><td>1 insert = 312 bytes of log, flushed before "saved"</td><td>assumes a fixed shape → schema</td></tr>
    <tr><td>Schema &amp; shapes</td><td>who defines the shape?</td><td>information_schema lists orders' 7 columns; menus vary</td><td>different shapes → families</td></tr>
    <tr><td>SQL vs NoSQL</td><td>which family?</td><td>orders relational; menus/carts NoSQL candidates</td><td>app vs analysts clash → OLTP/OLAP</td></tr>
    <tr><td>OLTP vs OLAP</td><td>one DB for app and analysis?</td><td>insert 111 vs revenue per day</td><td>→ <a class="xref" data-note="db_types">Types of Databases</a></td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning in one sentence</th></tr>
    <tr><td>Database / DBMS</td><td>The organised data / the software (PostgreSQL) that stores, protects and serves it.</td></tr>
    <tr><td>Table, row, column</td><td>A set of same-shaped rows; one row per thing; one column per property.</td></tr>
    <tr><td>NULL</td><td>"Value unknown or missing" (Esha's city), not zero or empty text.</td></tr>
    <tr><td>Constraint</td><td>A rule stored with the table and checked on every write: NOT NULL, UNIQUE, CHECK, PRIMARY KEY, FOREIGN KEY.</td></tr>
    <tr><td>Transaction</td><td>Steps that succeed or fail together (BEGIN … COMMIT / ROLLBACK).</td></tr>
    <tr><td>Lock</td><td>Makes a second writer of the same row wait until the first finishes.</td></tr>
    <tr><td>Parser / planner / executor</td><td>Checks the SQL / picks the cheapest plan / runs it.</td></tr>
    <tr><td>Page, buffer cache</td><td>8 KB unit of storage / recently used pages kept in RAM.</td></tr>
    <tr><td>Index</td><td>Sorted side structure (B-tree) that finds rows without scanning; slows writes slightly.</td></tr>
    <tr><td>WAL</td><td>Append-only change log flushed before commit; replayed after a crash; read by replicas and CDC.</td></tr>
    <tr><td>Schema-on-write / on-read</td><td>Shape checked when data is stored / when it is read.</td></tr>
    <tr><td>OLTP / OLAP</td><td>Many tiny transactions (row store) / few big scans over history (column store, warehouse).</td></tr>
  </table>
  <h3>Commands worth remembering</h3>
  <table class="tbl">
    <tr><th>Command</th><th>What it shows</th></tr>
    <tr><td><code>EXPLAIN query</code></td><td>The plan the planner chose (Seq Scan, Index Scan) with estimated cost and rows</td></tr>
    <tr><td><code>EXPLAIN (ANALYZE, BUFFERS) query</code></td><td>Runs it; real row counts and pages touched (shared hit = from RAM, read = from disk)</td></tr>
    <tr><td><code>pg_relation_size('orders')</code></td><td>Table size in bytes (8192 = 1 page)</td></tr>
    <tr><td><code>pg_current_wal_lsn()</code></td><td>Current end of the write-ahead log</td></tr>
    <tr><td><code>information_schema.columns</code></td><td>The schema: every column, type and nullability</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Spreadsheet / CSV</b><p>One person, small data, a one-off analysis or an export.</p><small>Avoid for shared, growing, business-critical data</small></div>
    <div><b>Relational DB (PostgreSQL)</b><p>Default for app data: linked entities, rules, transactions, ad-hoc questions.</p><small>Strain: massive write volume, wildly varying shapes</small></div>
    <div><b>NoSQL family</b><p>A named need: flexible documents, sub-ms key lookups, huge write streams, graph hops.</p><small>Avoid "because it's faster" without saying at what</small></div>
    <div><b>Warehouse (OLAP)</b><p>Dashboards, long-history analysis, ML training sets.</p><small>Not an app backend: slow single-row writes, lag</small></div>
    <div><b>Index</b><p>Columns you filter or join on in big tables, when few rows match.</p><small>Each index slows every insert/update a little</small></div>
    <div><b>EXPLAIN</b><p>Every time a query is slow, before guessing.</p><small>Estimates can be wrong; use ANALYZE to see reality</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>"It works with one user" (races need two); validation only in the app (scripts bypass it); "PostgreSQL is a database" (it's a DBMS); "Seq Scan is always bad" (not on small tables or when most rows match); read-then-write in Python (race; put the condition in the UPDATE); turning off WAL flushing for speed; "NoSQL is schemaless" (the schema moved into code); running heavy analytics on the production OLTP database.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Two people open a CSV, both edit, both save. What happens?</td><td>The second save overwrites the first: a lost update, with no error.</td></tr>
    <tr><td>Which part of the DBMS rejects <code>SELECT nam FROM customers</code>?</td><td>The parser (name check against the schema), before any data is read.</td></tr>
    <tr><td>A table has 1,088 pages; an index lookup touches 4. What does a Seq Scan for one id touch?</td><td>All 1,088 pages.</td></tr>
    <tr><td>When is a commit acknowledged in PostgreSQL (default settings)?</td><td>After its WAL records are flushed to disk, before the table pages are written.</td></tr>
    <tr><td>"Place an order" vs "revenue per restaurant per day": which is OLTP?</td><td>Placing the order. The revenue report is OLAP and belongs in the warehouse.</td></tr>
  </table>

  <h2 id="di-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain each part of a database, and the failure it exists to prevent, out loud without notes?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In Biteful's <code>customers</code> table, what is one row and what is one column?</summary><div class="qa-body">One row is one customer (for example 1, Asha, Pune, 2026-01-05). One column is one property shared by all customers (for example <code>city</code>, which is NULL for Esha).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the difference between a database and a DBMS?</summary><div class="qa-body">The database is the organised data. The DBMS is the software that stores it, runs queries, enforces rules, handles concurrent users and recovers from crashes. PostgreSQL is a DBMS; <code>biteful</code> is a database inside it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your team keeps sales data in a shared Excel file. Give three concrete reasons to move it to a database.</summary><div class="qa-body">(1) Simultaneous edits overwrite each other (our CSV test lost Dia's cancellation); transactions and locks fix that. (2) Nothing stops a typo like "12O" in an amount column; types and constraints do. (3) It won't scale past ~1M rows, while a DBMS handles billions and, with indexes, reads only the pages it needs. Also: crash recovery via the WAL and per-user permissions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "SQL is declarative" mean, and why is it useful?</summary><div class="qa-body">You describe the result you want, not the steps. The planner picks the steps: scan or index, join order, algorithm. The same query keeps working, and often gets faster, as data grows or indexes are added, without you rewriting it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>EXPLAIN</code> shows "Seq Scan on customers". What does that mean, and when is it fine?</summary><div class="qa-body">The database reads every row of the table and keeps the ones that match the filter. It is fine for small tables (Biteful's customers fit in one page) or when most rows match anyway. On a huge table where you want a few rows, it usually means a missing index: our 200,000-row copy needed 1,088 pages without an index and 4 with one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does a database avoid losing data if the server crashes mid-write?</summary><div class="qa-body">Write-ahead logging. Each change is appended to the WAL and flushed to disk before the commit is confirmed. On restart, the DBMS replays committed changes from the log and discards uncommitted ones, so the data is consistent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a database read data in pages rather than rows?</summary><div class="qa-body">Disk and OS I/O work in blocks; fetching one row costs about the same as fetching the 8 KB page around it. Storing related rows together and caching whole pages in RAM minimises slow disk trips. That's also why indexes and table layout affect speed so much.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>OLTP vs OLAP: which is "place an order" and which is "revenue per month for 3 years"? Why keep them separate?</summary><div class="qa-body">Placing an order is OLTP (small, frequent, must be correct now). Monthly revenue is OLAP (one huge scan). They're separated so heavy analysis doesn't slow the live app, and because each uses a storage layout tuned for its job: row stores for OLTP, column stores for OLAP.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is MongoDB "schemaless"?</summary><div class="qa-body">Not really. MongoDB doesn't enforce a schema by default, but your application still assumes fields exist with certain types. The schema moved from the database into the code. You can also add JSON Schema validation in MongoDB to enforce it (see <a class="xref" data-note="mongo_basics">MongoDB basics</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name the databases you'd expect in a typical ML product and what each does.</summary><div class="qa-body">PostgreSQL/MySQL for the app (OLTP); a warehouse like BigQuery or Snowflake for analytics and training data; Redis for caching and sessions; a vector DB (or pgvector) for embedding search in RAG; sometimes Elasticsearch for text search and a feature store for model features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do constraints need the schema, and the parser need it too?</summary><div class="qa-body">Both are checks against the same blueprint. A constraint like <code>CHECK (amount &gt; 0)</code> is part of the schema of <code>orders</code>, so the DBMS can test every incoming row against it. The parser checks that every table and column named in a query exists, which it can only do by looking them up in the schema catalogue. No schema, no checks on either side: that is exactly the cost of "schemaless".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: transactions promise "once committed, never lost". Which other part makes that promise possible?</summary><div class="qa-body">The WAL. A transaction's commit is only acknowledged after its log records are flushed to disk; if the server crashes before the table pages are written, recovery replays the log. Without the WAL, "committed" would mean "probably written, unless the power failed in the next few seconds".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the planner and always scan every page?</summary><div class="qa-body">Correctness is fine, speed is not. Every lookup by id on a 200,000-row table would touch all 1,088 pages instead of 4, and it gets linearly worse as the table grows. Indexes would be useless, because something has to decide to use them; that something is the planner.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the WAL show up again when we talk about warehouses?</summary><div class="qa-body">Because it is the complete, ordered list of every change. Change data capture (CDC) tools read the WAL and stream each insert, update and delete to the warehouse, search index or cache, so those copies stay in sync without the app writing to each one. The same log that gives durability also gives replication.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="db_types">Types of Databases</a>.</b> We know why a database exists and what is inside one. But Biteful's menus, carts, rider GPS pings, search box and "dishes like this" each have a different shape. Which family of database fits each, and what does each give up?</div>
</main>`
});
